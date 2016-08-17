    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    iCn3D.prototype.loadPDB = function (src) {
        var helices = [], sheets = [];
        //this.atoms = {};
        var lines = src.split('\n');

        var chainsTmp = {}; // serial -> atom
        var residuesTmp = {}; // serial -> atom

        this.init();

        var sheetArray = [], sheetStart = [], sheetEnd = [], helixArray = [], helixStart = [], helixEnd = [];

        // Concatenation of two pdbs will have several atoms for the same serial
        var serial = 0;

        var moleculeNum = 1;
        var chainNum, residueNum;
        var prevChainNum = '', prevResidueNum = '';
        var prevRecord = '';

        var oriSerial2NewSerial = {};

        var chainMissingResidueArray = {};

        var id = 'structure';

        for (var i in lines) {
            var line = lines[i];
            var record = line.substr(0, 6);

            if (record === 'HEADER') {
                id = line.substr(62, 4);

                this.moleculeTitle = '';

            } else if (record === 'TITLE ') {
                var name = line.substr(10);
                this.moleculeTitle += name.trim() + " ";

            } else if (record === 'HELIX ') {
                this.bSecondaryStructure = true;

                var startChain = line.substr(19, 1);
                var startResi = parseInt(line.substr(21, 4));
                var endResi = parseInt(line.substr(33, 4));

                var chain_resi;
                for(var j = startResi; j <= endResi; ++j) {
                  chain_resi = startChain + "_" + j;
                  helixArray.push(chain_resi);

                  if(j === startResi) helixStart.push(chain_resi);
                  if(j === endResi) helixEnd.push(chain_resi);
                }

                helices.push({
                    chain: startChain,
                    initialResidue: startResi,
                    initialInscode: line.substr(25, 1),
                    terminalResidue: endResi,
                    terminalInscode: line.substr(37, 1),
                });
            } else if (record === 'SHEET ') {
                this.bSecondaryStructure = true;

                var startChain = line.substr(21, 1);
                var startResi = parseInt(line.substr(22, 4));
                var endResi = parseInt(line.substr(33, 4));

                for(var j = startResi; j <= endResi; ++j) {
                  var chain_resi = startChain + "_" + j;
                  sheetArray.push(chain_resi);

                  if(j === startResi) sheetStart.push(chain_resi);
                  if(j === endResi) sheetEnd.push(chain_resi);
                }

                sheets.push({
                    chain: startChain,
                    initialResidue: startResi,
                    initialInscode: line.substr(26, 1),
                    terminalResidue: endResi,
                    terminalInscode: line.substr(37, 1),
                });

            } else if (record === 'HBOND ') {
                //HBOND A 1536   N2 A   59  ND2  -19.130  83.151  52.266 -18.079  81.613  49.427    3.40
                bCalculateHbond = false;

                var ligandChain = line.substr(6, 1);
                var ligandResi = line.substr(8, 4).replace(/ /g, "");
                var ligandAtom = line.substr(14, 4).replace(/ /g, "");
                var proteinChain = line.substr(18, 1);
                var proteinResi = line.substr(20, 4).replace(/ /g, "");
                var proteinAtom = line.substr(25, 4).replace(/ /g, "");

                var ligand_x = parseFloat(line.substr(30, 8));
                var ligand_y = parseFloat(line.substr(38, 8));
                var ligand_z = parseFloat(line.substr(46, 8));
                var protein_x = parseFloat(line.substr(54, 8));
                var protein_y = parseFloat(line.substr(62, 8));
                var protein_z = parseFloat(line.substr(70, 8));

                var dist = line.substr(78, 8).replace(/ /g, "");

                this.hbondpoints.push(new THREE.Vector3(ligand_x, ligand_y, ligand_z));
                this.hbondpoints.push(new THREE.Vector3(protein_x, protein_y, protein_z));
            } else if (record === 'SSBOND') {
                //SSBOND   1 CYS E   48    CYS E   51                          2555
                var chain1 = line.substr(15, 1);
                var resi1 = line.substr(17, 4).replace(/ /g, "");
                var resid1 = id + '_' + chain1 + '_' + resi1;

                var chain2 = line.substr(29, 1);
                var resi2 = line.substr(31, 4).replace(/ /g, "");
                var resid2 = id + '_' + chain2 + '_' + resi2;

                this.ssbondpoints.push(resid1);
                this.ssbondpoints.push(resid2);
            } else if (record === 'REMARK') {
                 var type = parseInt(line.substr(7, 3));
                 // from GLMol
                 if (type == 350 && line.substr(13, 5) == 'BIOMT') {
                    var n = parseInt(line[18]) - 1;
                    var m = parseInt(line.substr(21, 2));
                    if (this.biomtMatrices[m] == undefined) this.biomtMatrices[m] = new THREE.Matrix4().identity();
                    this.biomtMatrices[m].elements[n] = parseFloat(line.substr(24, 9));
                    this.biomtMatrices[m].elements[n + 4] = parseFloat(line.substr(34, 9));
                    this.biomtMatrices[m].elements[n + 8] = parseFloat(line.substr(44, 9));
                    this.biomtMatrices[m].elements[n + 12] = parseFloat(line.substr(54, 10));
                 }
                 // missing residues
                 else if (type == 465 && line.substr(18, 1) == ' ' && line.substr(20, 1) == ' ' && line.substr(21, 1) != 'S') {
                    var resn = line.substr(15, 3);
                    var chain = line.substr(19, 1);
                    var resi = parseInt(line.substr(21, 5));

                    var structure = parseInt(line.substr(13, 1));
                    if(line.substr(13, 1) == ' ') structure = 1;

                    var chainNum = structure + '_' + chain;

                    if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                    var resObject = {};
                    resObject.resi = resi;
                    resObject.name = this.residueName2Abbr(resn).toLowerCase();

                    chainMissingResidueArray[chainNum].push(resObject);
                 }
            } else if (record === 'ENDMDL') {
                ++moleculeNum;
            } else if (record === 'JRNL  ') {
                if(line.substr(12, 4) === 'PMID') {
                    this.pmid = line.substr(19).trim();
                }
            } else if (record === 'ATOM  ' || record === 'HETATM') {
                var alt = line.substr(16, 1);
                if (alt === "B") continue;

                // "CA" has to appear before "O". Otherwise the cartoon of secondary structure will have breaks
                // Concatenation of two pdbs will have several atoms for the same serial
                ++serial;

                var serial2 = parseInt(line.substr(6, 5));
                oriSerial2NewSerial[serial2] = serial;

                var elem = line.substr(76, 2).replace(/ /g, "");
                if (elem === '') { // for some incorrect PDB files
                   elem = line.substr(12, 2).replace(/ /g,"");
                }

                var chain = line.substr(21, 1);
                if(chain === '') chain = 1;

                var resi = parseInt(line.substr(22, 4));
                var atom = line.substr(12, 4).replace(/ /g, '');
                var chain_resi = chain + "_" + resi;

                var x = parseFloat(line.substr(30, 8));
                var y = parseFloat(line.substr(38, 8));
                var z = parseFloat(line.substr(46, 8));
                var resn = line.substr(17, 3);
                var coord = new THREE.Vector3(x, y, z);

                var structure = (moleculeNum === 1) ? id : id + moleculeNum.toString();

                var atomDetails = {
                    het: record[0] === 'H', // optional, used to determine ligands, water, ions, etc
                    serial: serial,         // required, unique atom id
                    name: atom,             // required, atom name
                    alt: alt,               // optional, some alternative coordinates
                    resn: resn,             // optional, used to determine protein or nucleotide
                    structure: structure,   // optional, used to identify structure
                    chain: chain,           // optional, used to identify chain
                    resi: resi,             // optional, used to identify residue ID
                    //insc: line.substr(26, 1),
                    coord: coord,           // required, used to draw 3D shape
                    b: parseFloat(line.substr(60, 8)), // optional, used to draw B-factor tube
                    elem: elem,             // optional, used to determine hydrogen bond
                    bonds: [],              // required, used to connect atoms
                    ss: 'coil',             // optional, used to show secondary structures
                    ssbegin: false,         // optional, used to show the beginning of secondary structures
                    ssend: false            // optional, used to show the end of secondary structures
                };

                this.atoms[serial] = atomDetails;

                this.displayAtoms[serial] = 1;
                this.highlightAtoms[serial] = 1;

                // Assign secondary structures from the input
                if($.inArray(chain_resi, helixArray) !== -1) {
                  this.atoms[serial].ss = 'helix';

                  if($.inArray(chain_resi, helixStart) !== -1) {
                    this.atoms[serial].ssbegin = true;
                  }

                  // do not use else if. Some residues are both start and end of secondary structure
                  if($.inArray(chain_resi, helixEnd) !== -1) {
                    this.atoms[serial].ssend = true;
                  }
                }
                else if($.inArray(chain_resi, sheetArray) !== -1) {
                  this.atoms[serial].ss = 'sheet';

                  if($.inArray(chain_resi, sheetStart) !== -1) {
                    this.atoms[serial].ssbegin = true;
                  }

                  // do not use else if. Some residues are both start and end of secondary structure
                  if($.inArray(chain_resi, sheetEnd) !== -1) {
                    this.atoms[serial].ssend = true;
                  }
                }

                chainNum = structure + "_" + chain;
                residueNum = chainNum + "_" + resi;

                var secondaries = '-';
                if(this.atoms[serial].ss === 'helix') {
                    secondaries = 'H';
                }
                else if(this.atoms[serial].ss === 'sheet') {
                    secondaries = 'E';
                }
                else if(this.atoms[serial].ss === 'coil') {
                    secondaries = 'c';
                }
                else if(!this.atoms[serial].het && this.residueColors.hasOwnProperty(this.atoms[serial].resn.toUpperCase()) ) {
                    secondaries = 'c';
                }

                this.secondaries[residueNum] = secondaries;

                // different residue
                if(residueNum !== prevResidueNum) {
                    var residue = this.residueName2Abbr(resn);

                    this.residueId2Name[residueNum] = residue;

                    if(serial !== 1) this.residues[prevResidueNum] = residuesTmp;

                    residuesTmp = {};

                    // different chain
                    if(chainNum !== prevChainNum) {
                        // a chain could be separated in two sections
                        if(serial !== 1) this.chains[prevChainNum] = this.unionHash2Atoms(this.chains[prevChainNum], chainsTmp);

                        chainsTmp = {};

                        if(this.structures[structure.toString()] === undefined) this.structures[structure.toString()] = [];
                        this.structures[structure.toString()].push(chainNum);

                        if(this.chainsSeq[chainNum] === undefined) this.chainsSeq[chainNum] = [];
                        if(this.chainsAnno[chainNum] === undefined ) this.chainsAnno[chainNum] = [];
                        if(this.chainsAnno[chainNum][0] === undefined ) this.chainsAnno[chainNum][0] = [];
                        if(this.chainsAnno[chainNum][1] === undefined ) this.chainsAnno[chainNum][1] = [];
                        if(this.chainsAnnoTitle[chainNum] === undefined ) this.chainsAnnoTitle[chainNum] = [];
                        if(this.chainsAnnoTitle[chainNum][0] === undefined ) this.chainsAnnoTitle[chainNum][0] = [];
                        if(this.chainsAnnoTitle[chainNum][1] === undefined ) this.chainsAnnoTitle[chainNum][1] = [];

                          var resObject = {};
                          resObject.resi = resi;
                          resObject.name = residue;

                        this.chainsSeq[chainNum].push(resObject);

                          var numberStr = '';
                          if(resi % 10 === 0) numberStr = resi.toString();

                        this.chainsAnno[chainNum][0].push(numberStr);
                        this.chainsAnno[chainNum][1].push(secondaries);
                        this.chainsAnnoTitle[chainNum][0].push("");
                        this.chainsAnnoTitle[chainNum][1].push("SS");
                    }
                    else {
                          var resObject = {};
                          resObject.resi = resi;
                          resObject.name = residue;

                        this.chainsSeq[chainNum].push(resObject);

                          var numberStr = '';
                          if(resi % 10 === 0) numberStr = resi.toString();

                        this.chainsAnno[chainNum][0].push(numberStr);
                        this.chainsAnno[chainNum][1].push(secondaries);
                    }
                }

                chainsTmp[serial] = 1;
                residuesTmp[serial] = 1;

                prevRecord = record;

                prevChainNum = chainNum;
                prevResidueNum = residueNum;

            } else if (record === 'CONECT') {
                var from = parseInt(line.substr(6, 5));
                for (var j = 0; j < 4; ++j) {
                    var to = parseInt(line.substr([11, 16, 21, 26][j], 5));
                    if (isNaN(to)) continue;

                    if(this.atoms[oriSerial2NewSerial[from]] !== undefined) this.atoms[oriSerial2NewSerial[from]].bonds.push(oriSerial2NewSerial[to]);
                }
            } else if (record === 'TER   ') {
                // Concatenation of two pdbs will have several atoms for the same serial
                ++serial;
            }
        }

        // adjust sequences
        for(var chainNum in this.chainsSeq) {
            if(chainMissingResidueArray[chainNum] === undefined) continue;

            var A = this.chainsSeq[chainNum];
            var A2 = this.chainsAnno[chainNum][0];
            var A3 = this.chainsAnno[chainNum][1];
            var B = chainMissingResidueArray[chainNum];

            var m = A.length;
            var n = B.length;

            var C = new Array(m + n);
            var C2 = new Array(m + n);
            var C3 = new Array(m + n);

            // http://www.algolist.net/Algorithms/Merge/Sorted_arrays
            // m - size of A
            // n - size of B
            // size of C array must be equal or greater than m + n
              var i, j, k;
              i = 0;
              j = 0;
              k = 0;
              while (i < m && j < n) {
                    if (A[i].resi <= B[j].resi) {
                          C[k] = A[i];
                          C2[k] = A2[i];
                          C3[k] = A3[i];
                          i++;
                    } else {
                          C[k] = B[j];
                          if(B[j].resi % 10 === 0) {
                              C2[k] = B[j].resi.toString();
                          }
                          else {
                              C2[k] = '';
                          }
                          C3[k] = '-';
                          j++;
                    }
                    k++;
              }
              if (i < m) {
                    for (var p = i; p < m; p++) {
                          C[k] = A[p];
                          C2[k] = A2[p];
                          C3[k] = A3[p];
                          k++;
                    }
              } else {
                    for (var p = j; p < n; p++) {
                          C[k] = B[p];
                          if(B[p].resi % 10 === 0) {
                              C2[k] = B[p].resi.toString();
                          }
                          else {
                              C2[k] = '';
                          }
                          C3[k] = '-';
                          k++;
                    }
              }

            this.chainsSeq[chainNum] = C;
            this.chainsAnno[chainNum][0] = C2;
            this.chainsAnno[chainNum][1] = C3;
        }

        // remove the reference
        lines = null;

        // add the last residue set
        this.residues[residueNum] = residuesTmp;
        this.chains[chainNum] = this.unionHash2Atoms(this.chains[chainNum], chainsTmp);

        var curChain, curResi, curInsc, curResAtoms = [], me = this;
        // refresh for atoms in each residue
        var refreshBonds = function (f) {
            var n = curResAtoms.length;
            for (var j = 0; j < n; ++j) {
                var atom0 = curResAtoms[j];
                for (var k = j + 1; k < n; ++k) {
                    var atom1 = curResAtoms[k];
                    if (atom0.alt === atom1.alt && me.hasCovalentBond(atom0, atom1)) {
                    //if (me.hasCovalentBond(atom0, atom1)) {
                        atom0.bonds.push(atom1.serial);
                        atom1.bonds.push(atom0.serial);
                    }
                }
                f && f(atom0);
            }
        };
        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for (var i in this.atoms) {
            var atom = this.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(!atom.het) {
              if($.inArray(atom.resn, this.nucleotidesArray) !== -1) {
                this.nucleotides[atom.serial] = 1;
                if (atom.name === 'P') this.nucleotidesP[atom.serial] = 1;
              }
              else {
                this.proteins[atom.serial] = 1;
                if (atom.name === 'CA') this.calphas[atom.serial] = 1;
                if (atom.name !== 'N' && atom.name !== 'CA' && atom.name !== 'C' && atom.name !== 'O') this.sidechains[atom.serial] = 1;
              }
            }
            else if(atom.het) {
              if(atom.resn === 'HOH' || atom.resn === 'WAT') {
                this.water[atom.serial] = 1;
              }
              else if($.inArray(atom.resn, this.ionsArray) !== -1 || atom.elem.trim() === atom.resn.trim()) {
                this.ions[atom.serial] = 1;
              }
              else {
                this.ligands[atom.serial] = 1;
              }
            }

            if (!(curChain === atom.chain && curResi === atom.resi)) {
                // a new residue, add the residue-residue bond beides the regular bonds
                refreshBonds(function (atom0) {
                    if (((atom0.name === 'C' && atom.name === 'N') || (atom0.name === 'O3\'' && atom.name === 'P')) && me.hasCovalentBond(atom0, atom)) {
                        atom0.bonds.push(atom.serial);
                        atom.bonds.push(atom0.serial);
                    }
                });
                curChain = atom.chain;
                curResi = atom.resi;
                //curInsc = atom.insc;
                curResAtoms.length = 0;
            }
            curResAtoms.push(atom);
        } // end of for

        // last residue
        refreshBonds();

        this.pmin = pmin;
        this.pmax = pmax;

        this.cnt = cnt;

        this.maxD = this.pmax.distanceTo(this.pmin);
        this.center = psum.multiplyScalar(1.0 / this.cnt);

        if (this.maxD < 25) this.maxD = 25;

        this.oriMaxD = this.maxD;
        this.oriCenter = this.center.clone();
    };
