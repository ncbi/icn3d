/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.loadPDB = function (src, pdbid, bOpm, bVector) { var me = this; //"use strict";
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
    var chainNum, residueNum, oriResidueNum;
    var prevChainNum = '', prevResidueNum = '', prevOriResidueNum = '', prevResi = 0;
    var prevRecord = '';
    var bModifyResi = false;

    var oriSerial2NewSerial = {};

    var chainMissingResidueArray = {};

    var id = 'stru';

    var maxMissingResi = 0, prevMissingChain = '';
    var CSerial, prevCSerial, OSerial, prevOSerial;

    for (var i in lines) {
        var line = lines[i];
        var record = line.substr(0, 6);

        if (record === 'HEADER') {
            if(bOpm === undefined || !bOpm) this.bSecondaryStructure = true;

            id = line.substr(62, 4);

            this.molTitle = '';

        } else if (record === 'TITLE ') {
            var name = line.substr(10);
            this.molTitle += name.trim() + " ";

        } else if (record === 'HELIX ') {
            this.bSecondaryStructure = true;

            var startChain = (line.substr(19, 1) == ' ') ? 'A' : line.substr(19, 1);
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

            var startChain = (line.substr(21, 1) == ' ') ? 'A' : line.substr(21, 1);
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
/*
            //HBOND A 1536   N2 A   59  ND2  -19.130  83.151  52.266 -18.079  81.613  49.427    3.40
            bCalculateHbond = false;

            var chemicalChain = line.substr(6, 1);
            var chemicalResi = line.substr(8, 4).replace(/ /g, "");
            var chemicalAtom = line.substr(14, 4).replace(/ /g, "");
            var proteinChain = line.substr(18, 1);
            var proteinResi = line.substr(20, 4).replace(/ /g, "");
            var proteinAtom = line.substr(25, 4).replace(/ /g, "");

            var chemical_x = parseFloat(line.substr(30, 8));
            var chemical_y = parseFloat(line.substr(38, 8));
            var chemical_z = parseFloat(line.substr(46, 8));
            var protein_x = parseFloat(line.substr(54, 8));
            var protein_y = parseFloat(line.substr(62, 8));
            var protein_z = parseFloat(line.substr(70, 8));

            var dist = line.substr(78, 8).replace(/ /g, "");

            this.hbondpnts.push(new THREE.Vector3(chemical_x, chemical_y, chemical_z));
            this.hbondpnts.push(new THREE.Vector3(protein_x, protein_y, protein_z));
*/
        } else if (record === 'SSBOND') {
            this.bSsbondProvided = true;
            //SSBOND   1 CYS E   48    CYS E   51                          2555
            var chain1 = (line.substr(15, 1) == ' ') ? 'A' : line.substr(15, 1);
            var resi1 = line.substr(17, 4).replace(/ /g, "");
            var resid1 = id + '_' + chain1 + '_' + resi1;

            var chain2 = (line.substr(29, 1) == ' ') ? 'A' : line.substr(29, 1);
            var resi2 = line.substr(31, 4).replace(/ /g, "");
            var resid2 = id + '_' + chain2 + '_' + resi2;

            if(this.ssbondpnts[id] === undefined) this.ssbondpnts[id] = [];

            this.ssbondpnts[id].push(resid1);
            this.ssbondpnts[id].push(resid2);
        } else if (record === 'REMARK') {
             var type = parseInt(line.substr(7, 3));

             if(line.indexOf('1/2 of bilayer thickness:') !== -1) { // OPM transmembrane protein
                this.halfBilayerSize = parseFloat(line.substr(line.indexOf(':') + 1).trim());
             }
             else if (type == 350 && line.substr(13, 5) == 'BIOMT') {
                var n = parseInt(line[18]) - 1;
                //var m = parseInt(line.substr(21, 2));
                var m = parseInt(line.substr(21, 2)) - 1; // start from 1
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

                //var structure = parseInt(line.substr(13, 1));
                //if(line.substr(13, 1) == ' ') structure = 1;

                //var chainNum = structure + '_' + chain;
                var chainNum = id + '_' + chain;

                if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                var resObject = {};
                resObject.resi = resi;
                resObject.name = this.residueName2Abbr(resn).toLowerCase();

                if(chain != prevMissingChain) {
                    maxMissingResi = 0;
                }

                // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                if(!isNaN(resi) && (prevMissingChain == '' || (chain != prevMissingChain) || (chain == prevMissingChain && resi > maxMissingResi)) ) {
                    chainMissingResidueArray[chainNum].push(resObject);

                    maxMissingResi = resi;
                    prevMissingChain = chain;
                }

             }
             else if (type == 900 && this.emd === undefined && line.substr(34).trim() == 'RELATED DB: EMDB') {
                 //REMARK 900 RELATED ID: EMD-3906   RELATED DB: EMDB
                 this.emd = line.substr(23, 11).trim();
             }
        } else if (record === 'SOURCE' && this.organism === undefined && line.substr(11, 15).trim() == 'ORGANISM_COMMON') {
            this.organism = line.substr(28).toLowerCase().trim();

            this.organism = this.organism.substr(0, this.organism.length - 1);
        } else if (record === 'ENDMDL') {
            ++moleculeNum;
        } else if (record === 'JRNL  ') {
            if(line.substr(12, 4) === 'PMID') {
                this.pmid = line.substr(19).trim();
            }
        } else if (record === 'ATOM  ' || record === 'HETATM') {
            //if(id == 'stru' && bOpm) {
            //    id = pdbid;
            //}

            var structure = (moleculeNum === 1) ? id : id + moleculeNum.toString();

            var alt = line.substr(16, 1);
            //if (alt !== " " && alt !== "A") continue;

            // "CA" has to appear before "O". Otherwise the cartoon of secondary structure will have breaks
            // Concatenation of two pdbs will have several atoms for the same serial
            ++serial;

            var serial2 = parseInt(line.substr(6, 5));
            oriSerial2NewSerial[serial2] = serial;

            var elem = line.substr(76, 2).replace(/ /g, "");
            if (elem === '') { // for some incorrect PDB files, important to use substr(12,2), not (12,4)
               elem = line.substr(12, 2).replace(/ /g,"");
            }
            var atom = line.substr(12, 4).replace(/ /g, '');
            var resn = line.substr(17, 3);

            var chain = line.substr(21, 1);
            if(chain === ' ') chain = 'A';

            //var oriResi = line.substr(22, 4).trim();
            var oriResi = line.substr(22, 5).trim();

            var resi = parseInt(oriResi);
            if(oriResi != resi || bModifyResi) { // e.g., 99A and 99
              bModifyResi = true;
              //resi = (prevResi == 0) ? resi : prevResi + 1;
            }

            if(bOpm && resn === 'DUM') {
                elem = atom;
                chain = 'MEM';
                resi = 1;
                oriResi = 1;
            }

            if(bVector !== undefined && bVector && resn === 'DUM') break; // just need to get the vector of the largest chain

            chainNum = structure + "_" + chain;
            oriResidueNum = chainNum + "_" + oriResi;
            if(chainNum !== prevChainNum) {
                prevResi = 0;
                bModifyResi = false;
            }

            residueNum = chainNum + "_" + resi;

            var chain_resi = chain + "_" + resi;

            var x = parseFloat(line.substr(30, 8));
            var y = parseFloat(line.substr(38, 8));
            var z = parseFloat(line.substr(46, 8));
            var coord = new THREE.Vector3(x, y, z);

            var atomDetails = {
                het: record[0] === 'H', // optional, used to determine chemicals, water, ions, etc
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

            if(!atomDetails.het && atomDetails.name === 'C') {
                CSerial = serial;
            }
            if(!atomDetails.het && atomDetails.name === 'O') {
                OSerial = serial;
            }

            // from DSSP C++ code
            if(!atomDetails.het && atomDetails.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
                var dist = this.atoms[prevCSerial].coord.distanceTo(this.atoms[prevOSerial].coord);

                var x2 = atomDetails.coord.x + (this.atoms[prevCSerial].coord.x - this.atoms[prevOSerial].coord.x) / dist;
                var y2 = atomDetails.coord.y + (this.atoms[prevCSerial].coord.y - this.atoms[prevOSerial].coord.y) / dist;
                var z2 = atomDetails.coord.z + (this.atoms[prevCSerial].coord.z - this.atoms[prevOSerial].coord.z) / dist;

                atomDetails.hcoord = new THREE.Vector3(x2, y2, z2);
            }

            this.atoms[serial] = atomDetails;

            this.dAtoms[serial] = 1;
            this.hAtoms[serial] = 1;

            // Assign secondary structures from the input
            // if a residue is assigned both sheet and helix, it is assigned as sheet
            if($.inArray(chain_resi, sheetArray) !== -1) {
              this.atoms[serial].ss = 'sheet';

              if($.inArray(chain_resi, sheetStart) !== -1) {
                this.atoms[serial].ssbegin = true;
              }

              // do not use else if. Some residues are both start and end of secondary structure
              if($.inArray(chain_resi, sheetEnd) !== -1) {
                this.atoms[serial].ssend = true;
              }
            }
            else if($.inArray(chain_resi, helixArray) !== -1) {
              this.atoms[serial].ss = 'helix';

              if($.inArray(chain_resi, helixStart) !== -1) {
                this.atoms[serial].ssbegin = true;
              }

              // do not use else if. Some residues are both start and end of secondary structure
              if($.inArray(chain_resi, helixEnd) !== -1) {
                this.atoms[serial].ssend = true;
              }
            }

            var secondaries = '-';
            if(this.atoms[serial].ss === 'helix') {
                secondaries = 'H';
            }
            else if(this.atoms[serial].ss === 'sheet') {
                secondaries = 'E';
            }
            //else if(this.atoms[serial].ss === 'coil') {
            //    secondaries = 'c';
            //}
            else if(!this.atoms[serial].het && this.residueColors.hasOwnProperty(this.atoms[serial].resn.toUpperCase()) ) {
                secondaries = 'c';
            }
            else {
                secondaries = 'o';
            }

            this.secondaries[residueNum] = secondaries;

            // different residue
            //if(residueNum !== prevResidueNum) {
            if(oriResidueNum !== prevOriResidueNum) {
                var residue = this.residueName2Abbr(resn);

                this.residueId2Name[residueNum] = residue;

                if(serial !== 1) this.residues[prevResidueNum] = residuesTmp;

                if(residueNum !== prevResidueNum) {
                    residuesTmp = {};
                }

                // different chain
                if(chainNum !== prevChainNum) {
                    prevCSerial = undefined;
                    prevOSerial = undefined;

                    // a chain could be separated in two sections
                    if(serial !== 1) {
                        if(this.chains[prevChainNum] === undefined) this.chains[prevChainNum] = {};
                        this.chains[prevChainNum] = this.unionHash(this.chains[prevChainNum], chainsTmp);
                    }

                    chainsTmp = {};

                    if(this.structures[structure.toString()] === undefined) this.structures[structure.toString()] = [];
                    this.structures[structure.toString()].push(chainNum);

                    if(this.chainsSeq[chainNum] === undefined) this.chainsSeq[chainNum] = [];

                    var resObject = {};
                    resObject.resi = resi;
                    resObject.name = residue;

                    this.chainsSeq[chainNum].push(resObject);
                }
                else {
                    prevCSerial = CSerial;
                    prevOSerial = OSerial;

                    var resObject = {};
                    resObject.resi = resi;
                    resObject.name = residue;

                    this.chainsSeq[chainNum].push(resObject);
                }
            }

            chainsTmp[serial] = 1;
            residuesTmp[serial] = 1;

            prevRecord = record;

            prevChainNum = chainNum;
            prevResidueNum = residueNum;
            prevOriResidueNum = oriResidueNum;

        } else if (record === 'CONECT') {
            var from = parseInt(line.substr(6, 5));
            for (var j = 0; j < 4; ++j) {
                var to = parseInt(line.substr([11, 16, 21, 26][j], 5));
                if (isNaN(to)) continue;

                if(this.atoms[oriSerial2NewSerial[from]] !== undefined) this.atoms[oriSerial2NewSerial[from]].bonds.push(oriSerial2NewSerial[to]);
            }
        } else if (record.substr(0,3) === 'TER') {
            // Concatenation of two pdbs will have several atoms for the same serial
            ++serial;
        }
    }

    // add the last residue set
    this.residues[residueNum] = residuesTmp;
    if(this.chains[chainNum] === undefined) this.chains[chainNum] = {};
    this.chains[chainNum] = this.unionHash2Atoms(this.chains[chainNum], chainsTmp);

    this.adjustSeq(chainMissingResidueArray);

//    this.missingResidues = [];
//    for(var chainid in chainMissingResidueArray) {
//        var resArray = chainMissingResidueArray[chainid];
//        for(var i = 0; i < resArray.length; ++i) {
//            this.missingResidues.push(chainid + '_' + resArray[i].resi);
//        }
//    }

    // copy disulfide bonds
    var structureArray = Object.keys(this.structures);
    for(var s = 0, sl = structureArray.length; s < sl; ++s) {
        var structure = structureArray[s];

        if(structure == id) continue;

        if(this.ssbondpnts[structure] === undefined) this.ssbondpnts[structure] = [];

        if(this.ssbondpnts[id] !== undefined) {
            for(var j = 0, jl = this.ssbondpnts[id].length; j < jl; ++j) {
                var ori_resid = this.ssbondpnts[id][j];
                var pos = ori_resid.indexOf('_');
                var resid = structure + ori_resid.substr(pos);

                this.ssbondpnts[structure].push(resid);
            }
        }
    }

    // calculate disulfide bonds for PDB files
    if(!this.bSsbondProvided) {
        // get all Cys residues
        var structure2cys_resid = {};
        for(var chainid in this.chainsSeq) {
            var seq = this.chainsSeq[chainid];
            var structure = chainid.substr(0, chainid.indexOf('_'));

            for(var i = 0, il = seq.length; i < il; ++i) {
                // each seq[i] = {"resi": 1, "name":"C"}
                if(seq[i].name == 'C') {
                    if(structure2cys_resid[structure] == undefined) structure2cys_resid[structure] = [];
                    structure2cys_resid[structure].push(chainid + '_' + seq[i].resi);
                }
            }
        }

        this.setSsbond(structure2cys_resid);
    }

    // remove the reference
    lines = null;

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

    // lipids may be considered as protein if "ATOM" instead of "HETATM" was used
    var lipidResidHash = {};

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
            //if (atom.name === 'P') {
            if (atom.name === "O3'" || atom.name === "O3*") {
                this.nucleotidesO3[atom.serial] = 1;

                this.secondaries[atom.structure + '_' + atom.chain + '_' + atom.resi] = 'o'; // nucleotide
            }
          }
          else {
            if (atom.elem === 'P') {
                lipidResidHash[atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;
            }

            this.proteins[atom.serial] = 1;
            if (atom.name === 'CA') this.calphas[atom.serial] = 1;
            if (atom.name !== 'N' && atom.name !== 'CA' && atom.name !== 'C' && atom.name !== 'O') this.sidec[atom.serial] = 1;
          }
        }
        else if(atom.het) {
          if(atom.resn === 'HOH' || atom.resn === 'WAT' || atom.resn === 'SOL') {
            this.water[atom.serial] = 1;
          }
          //else if(bOpm && atom.resn === 'DUM') {
          //  this.mem[atom.serial] = 1;
          //}
          else if($.inArray(atom.resn, this.ionsArray) !== -1 || atom.elem.trim() === atom.resn.trim()) {
            this.ions[atom.serial] = 1;
          }
          else {
            this.chemicals[atom.serial] = 1;
          }

          atom.color = this.atomColors[atom.elem];
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

    // reset lipid
    for(resid in lipidResidHash) {
        var atomHash = this.residues[resid];
        for(serial in atomHash) {
            var atom = this.atoms[serial];

            atom.het = true;
            this.chemicals[atom.serial] = 1;
            this.secondaries[resid] = 'o'; // nucleotide

            delete this.proteins[atom.serial];
            if (atom.name === 'CA') delete this.calphas[atom.serial];
            if (atom.name !== 'N' && atom.name !== 'CA' && atom.name !== 'C' && atom.name !== 'O') delete this.sidec[atom.serial];
        }
    }

    // last residue
    refreshBonds();

    this.pmin = pmin;
    this.pmax = pmax;

    this.cnt = cnt;

    this.maxD = this.pmax.distanceTo(this.pmin);
    this.center = psum.multiplyScalar(1.0 / this.cnt);

    if (this.maxD < 5) this.maxD = 5;

    this.oriMaxD = this.maxD;
    this.oriCenter = this.center.clone();

    if(bVector !== undefined && bVector) { // just need to get the vector of the largest chain
        return this.getChainCalpha(this.chains, this.atoms);
    }
};

iCn3D.prototype.adjustSeq = function (chainMissingResidueArray) { var me = this; //"use strict";
    // adjust sequences
    for(var chainNum in this.chainsSeq) {
        if(chainMissingResidueArray[chainNum] === undefined) continue;

        var A = this.chainsSeq[chainNum];
        //var A2 = this.chainsAn[chainNum][0];
        //var A3 = this.chainsAn[chainNum][1];
        var B = chainMissingResidueArray[chainNum];

        var m = A.length;
        var n = B.length;

        var C = new Array(m + n);
        //var C2 = new Array(m + n);
        //var C3 = new Array(m + n);

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
                      //C2[k] = A2[i];
                      //C3[k] = A3[i];
                      i++;
                } else {
                      C[k] = B[j];
                      //if(B[j].resi % 10 === 0) {
                      //    C2[k] = B[j].resi.toString();
                      //}
                      //else {
                      //    C2[k] = '';
                      //}
                      //C3[k] = '-';
                      j++;
                }
                k++;
          }
          if (i < m) {
                for (var p = i; p < m; p++) {
                      C[k] = A[p];
                      //C2[k] = A2[p];
                      //C3[k] = A3[p];
                      k++;
                }
          } else {
                for (var p = j; p < n; p++) {
                      C[k] = B[p];
                      //if(B[p].resi % 10 === 0) {
                      //    C2[k] = B[p].resi.toString();
                      //}
                      //else {
                      //    C2[k] = '';
                      //}
                      //C3[k] = '-';
                      k++;
                }
          }

        this.chainsSeq[chainNum] = C;
        //this.chainsAn[chainNum][0] = C2;
        //this.chainsAn[chainNum][1] = C3;
    }
};

iCn3D.prototype.setSsbond = function (structure2cys_resid) { var me = this; //"use strict";
    // determine whether there are disulfide bonds
    // disulfide bond is about 2.05 angstrom
    var distMax = 4; //3; // https://icn3d.page.link/5KRXx6XYfig1fkye7
    var distSqrMax = distMax * distMax;
    for(var structure in structure2cys_resid) {
        var cysArray = structure2cys_resid[structure];

        for(var i = 0, il = cysArray.length; i < il; ++i) {
            for(var j = i + 1, jl = cysArray.length; j < jl; ++j) {
                var resid1 = cysArray[i];
                var resid2 = cysArray[j];

                var coord1 = undefined, coord2 = undefined;
                for(var serial in me.residues[resid1]) {
                    if(me.atoms[serial].elem == 'S') {
                        coord1 = me.atoms[serial].coord;
                        break;
                    }
                }
                for(var serial in me.residues[resid2]) {
                    if(me.atoms[serial].elem == 'S') {
                        coord2 = me.atoms[serial].coord;
                        break;
                    }
                }

                if(coord1 === undefined || coord2 === undefined) continue;

                if(Math.abs(coord1.x - coord2.x) > distMax) continue;
                if(Math.abs(coord1.y - coord2.y) > distMax) continue;
                if(Math.abs(coord1.z - coord2.z) > distMax) continue;
                var distSqr = (coord1.x - coord2.x)*(coord1.x - coord2.x) + (coord1.y - coord2.y)*(coord1.y - coord2.y) + (coord1.z - coord2.z)*(coord1.z - coord2.z);

                if(distSqr < distSqrMax) { // disulfide bond
                    if(me.ssbondpnts[structure] === undefined) me.ssbondpnts[structure] = [];
                    me.ssbondpnts[structure].push(resid1);
                    me.ssbondpnts[structure].push(resid2);
                }
            }
        }
    }
};

iCn3D.prototype.getChainCalpha = function (chains, atoms, bResi_ori, pdbid) { var me = this; //"use strict";
    var chainCalphaHash = {};

    for(var chainid in chains) {
        if(pdbid !== undefined) {
            textArray =  chainid.split('_');
            if(textArray[0] !== pdbid) continue; // skip different chain
        }

        var serialArray = Object.keys(chains[chainid]);

        var calphaArray = [];
        var cnt = 0;
        var lastResi = 0;
        var bBaseResi = true, baseResi = 1;
        for(var i = 0, il = serialArray.length; i < il; ++i) {
            var atom = atoms[serialArray[i]];
            if( (this.proteins.hasOwnProperty(serialArray[i]) && atom.name == "CA")
              || (this.nucleotides.hasOwnProperty(serialArray[i]) && (atom.name == "O3'" || atom.name == "O3*")) ) {
                if(atom.resi == lastResi) continue; // e.g., Alt A and B

                var resn = (atom.resn.trim().length > 3) ? atom.resn.trim().substr(0, 3) : atom.resn.trim();
                if(!this.chargeColors.hasOwnProperty(resn)) {
                    continue; // regular residues
                }

                var resi = (bResi_ori !== undefined && bResi_ori) ? atom.resi_ori : atom.resi; // MMDB uses resi_ori for PDB residue number

                if(bBaseResi) {
                    baseResi = resi;
                    bBaseResi = false;
                }
                resi = resi - baseResi + 1;

                //chainresiCalphaHash[atom.chain + '_' + resi] = atom.coord.clone();

                calphaArray.push(atom.coord.clone());
                ++cnt;

                lastResi = atom.resi;
            }
        }

        if(cnt > 0) {
            //var chainid = atoms[serialArray[0]].structure + '_' + atoms[serialArray[0]].chain;
            var chain = atoms[serialArray[0]].chain;
            chainCalphaHash[chain] = calphaArray;
        }
    }

    return {'chainresiCalphaHash': chainCalphaHash, 'center': this.center.clone()};
};
