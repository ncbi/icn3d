    // from the 2016 NCBI hackathon in Orlando: https://github.com/NCBI-Hackathons/iCN3D-MMTF
    // Contributors: Jiyao Wang, Alexander Rose, Peter Rose
    // requires the library mmtf.js
    iCn3DUI.prototype.downloadMmtf = function (mmtfid) { var me = this;
        MMTF.fetch(
            mmtfid,
            // onLoad callback
            function( mmtfData ){
console.log("mmtfData: " + JSON.stringify(mmtfData));

                me.icn3d.init();

                var pmin = new THREE.Vector3( 9999, 9999, 9999);
                var pmax = new THREE.Vector3(-9999,-9999,-9999);
                var psum = new THREE.Vector3();

                var id = mmtfData.structureId;

                me.icn3d.moleculeTitle = mmtfData.title;

                // bioAsembly
                if(mmtfData.bioAssemblyList[0].transformList.length > 1) {
                    me.icn3d.biomtMatrices = [];
                    for(var i = 0, il = mmtfData.bioAssemblyList[0].transformList.length; i < il; ++i) {
                        var biomt = new THREE.Matrix4().identity();

                        for(var j = 0, jl = mmtfData.bioAssemblyList[0].transformList[i].matrix.length; j < jl; ++j) {
                            biomt.elements[j] = mmtfData.bioAssemblyList[0].transformList[i].matrix[j];
                        }

                        me.icn3d.biomtMatrices.push(biomt);
                    }
                }

                var oriindex2serial = {};

                // save SG atoms in CYS residues
                var SGAtomSerialArray = [];

                var prevSS = 'coil';
                var prevChain = '';
                var prevResi = 0;

                var serial = 0;

                var structure, chain, resn, resi, ss, ssbegin, ssend;
                var het, bProtein, bNucleotide;
                var elem, atomName, coord, b, alt;

                var callbackDict = {
                    onModel: function( modelData ){
                        structure = (modelData.modelIndex === 0) ? id : id + (modelData.modelIndex + 1).toString();
                    },
                    onChain: function( chainData ){
                        chain = chainData.chainName; // or chainData.chainId
                        var chainid = structure + '_' + chain;

                        if(me.icn3d.structures[structure] === undefined) me.icn3d.structures[structure] = [];
                        me.icn3d.structures[structure].push(chainid);

                        if(me.icn3d.chainsAnnoTitle[chainid] === undefined ) me.icn3d.chainsAnnoTitle[chainid] = [];
                        if(me.icn3d.chainsAnnoTitle[chainid][0] === undefined ) me.icn3d.chainsAnnoTitle[chainid][0] = [];
                        if(me.icn3d.chainsAnnoTitle[chainid][1] === undefined ) me.icn3d.chainsAnnoTitle[chainid][1] = [];
                        me.icn3d.chainsAnnoTitle[chainid][0].push('');
                        me.icn3d.chainsAnnoTitle[chainid][1].push('SS');
                    },
                    onGroup: function( groupData ){
                        resn = groupData.groupName;
                        resi = groupData.groupId;
                        var resid = structure + '_' + chain + '_' + resi;

                        if(groupData.secStruct === 0 || groupData.secStruct === 2 || groupData.secStruct === 4) {
                            ss = 'helix';
                        }
                        else if(groupData.secStruct === 3) {
                            ss = 'sheet';
                        }
                        else {
                            ss = 'coil';
                        }

                        // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                        var bSetPrevSsend = false;

                        if(chain !== prevChain) {
                            // new chain
                            if(ss !== 'coil') {
                                ssbegin = true;
                                ssend = false;
                            }
                            else {
                                ssbegin = false;
                                ssend = false;
                            }

                            // set up the end of previous chain
                            if(prevSS !== 'coil') {
								var prevResid = structure + '_' + prevChain + '_' + prevResi.toString();

								for(var i in me.icn3d.residues[prevResid]) {
									me.icn3d.atoms[i].ssbegin = false;
									me.icn3d.atoms[i].ssend = true;
								}
							}
                        }
                        else if(ss !== prevSS) {
                            if(prevSS === 'coil') {
                                ssbegin = true;
                                ssend = false;
                            }
                            else if(ss === 'coil') {
                                bSetPrevSsend = true;
                                ssbegin = false;
                                ssend = false;
                            }
                            else if( (prevSS === 'sheet' && ss === 'helix') || (prevSS === 'helix' && ss === 'sheet')) {
                                bSetPrevSsend = true;
                                ssbegin = true;
                                ssend = false;
                            }
                        }
                        else {
                                ssbegin = false;
                                ssend = false;
                        }

                        if(bSetPrevSsend) {
                            var prevResid = structure + '_' + chain + '_' + (resi - 1).toString();
                            for(var i in me.icn3d.residues[prevResid]) {
                                me.icn3d.atoms[i].ssbegin = false;
                                me.icn3d.atoms[i].ssend = true;
                            }
                        }

                        prevSS = ss;
                        prevChain = chain;
                        prevResi = resi;

                        het = false;
                        bProtein = false;
                        bNucleotide = false;
                        if(groupData.chemCompType.toLowerCase() === 'non-polymer' || groupData.chemCompType.toLowerCase() === 'other' || groupData.chemCompType.toLowerCase().indexOf('saccharide') !== -1) {
                            het = true;
                        }
                        else if(groupData.chemCompType.toLowerCase().indexOf('peptide') !== -1) {
                            bProtein = true;
                        }
                        else if(groupData.chemCompType.toLowerCase().indexOf('dna') !== -1 || groupData.chemCompType.toLowerCase().indexOf('rna') !== -1) {
                            bNucleotide = true;
                        }
                        else {
                            bProtein = true;
                        }

                          // add sequence information
                          var chainid = structure + '_' + chain;

                          var resObject = {};
                          resObject.resi = resi;
                          resObject.name = me.icn3d.residueName2Abbr(resn);

                          me.icn3d.residueId2Name[resid] = resObject.name;

                          if(me.icn3d.chainsSeq[chainid] === undefined) me.icn3d.chainsSeq[chainid] = [];

                          if(me.icn3d.chainsAnno[chainid] === undefined ) me.icn3d.chainsAnno[chainid] = [];
                          if(me.icn3d.chainsAnno[chainid][0] === undefined ) me.icn3d.chainsAnno[chainid][0] = [];
                          if(me.icn3d.chainsAnno[chainid][1] === undefined ) me.icn3d.chainsAnno[chainid][1] = [];

                          var numberStr = '';
                          if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

                          var secondaries = 'c';
                          if(ss === 'helix') {
                              secondaries = 'H';
                          }
                          else if(ss === 'sheet') {
                              secondaries = 'E';
                          }

                          if(me.icn3d.chainsSeq[chainid] === undefined) me.icn3d.chainsSeq[chainid] = [];
                          me.icn3d.chainsSeq[chainid].push(resObject);


                          if(me.icn3d.chainsAnno[chainid] === undefined) me.icn3d.chainsAnno[chainid] = [];
                          if(me.icn3d.chainsAnno[chainid][0] === undefined) me.icn3d.chainsAnno[chainid][0] = [];
                          if(me.icn3d.chainsAnno[chainid][1] === undefined) me.icn3d.chainsAnno[chainid][1] = [];
                          me.icn3d.chainsAnno[chainid][0].push(numberStr);
                          me.icn3d.chainsAnno[chainid][1].push(secondaries);

                          me.icn3d.secondaries[resid] = secondaries;

                    },
                    onAtom: function( atomData ){
                        elem = atomData.element;
                        atomName = atomData.atomName;
                        coord = new THREE.Vector3(atomData.xCoord, atomData.yCoord, atomData.zCoord);
                        b = atomData.bFactor;

                        alt = atomData.altLoc;
                        if(atomData.altLoc === '\u0000') { // a temp value, should be ''
                            alt = '';
                        }

                        // skip the atoms where alt is not '' or 'A'
                        if(alt === '' || alt === 'A') {
                            ++serial;

                            if(atomName === 'SG') SGAtomSerialArray.push(serial);

                            oriindex2serial[atomData.atomIndex] = serial;

                            var atomDetails = {
                                het: het, // optional, used to determine ligands, water, ions, etc
                                serial: serial,         // required, unique atom id
                                name: atomName,             // required, atom name
                                alt: alt,               // optional, some alternative coordinates
                                resn: resn,             // optional, used to determine protein or nucleotide
                                structure: structure,   // optional, used to identify structure
                                chain: chain,           // optional, used to identify chain
                                resi: resi,             // optional, used to identify residue ID
                                //insc: line.substr(26, 1),
                                coord: coord,           // required, used to draw 3D shape
                                b: b,         // optional, used to draw B-factor tube
                                elem: elem,             // optional, used to determine hydrogen bond
                                bonds: [],              // required, used to connect atoms
                                bondOrder: [],
                                ss: ss,             // optional, used to show secondary structures
                                ssbegin: ssbegin,         // optional, used to show the beginning of secondary structures
                                ssend: ssend            // optional, used to show the end of secondary structures
                            };

                            me.icn3d.atoms[serial] = atomDetails;

                            pmin.min(coord);
                            pmax.max(coord);
                            psum.add(coord);

                            var chainid = structure + '_' + chain;
                            var resid = chainid + '_' + resi;

                            if(me.icn3d.chains[chainid] === undefined) me.icn3d.chains[chainid] = {};
                            me.icn3d.chains[chainid][serial] = 1;

                            if(me.icn3d.residues[resid] === undefined) me.icn3d.residues[resid] = {};
                            me.icn3d.residues[resid][serial] = 1;

                            if (bProtein) {
                              me.icn3d.proteins[serial] = 1;

                              if (atomName === 'CA') me.icn3d.calphas[serial] = 1;
                              if (atomName !== 'N' && atomName !== 'CA' && atomName !== 'C' && atomName !== 'O') me.icn3d.sidechains[serial] = 1;
                            }
                            else if (bNucleotide) {
                              me.icn3d.nucleotides[serial] = 1;

                              if (atomName == 'P') me.icn3d.nucleotidesP[serial] = 1;
                            }
                            else {
                              if (elem.toLowerCase() === resn.toLowerCase()) {
                                  me.icn3d.ions[serial] = 1;
                              }
                              else if(resn === 'HOH' || resn === 'WAT' || resn === 'SQL' || resn === 'H2O' || resn === 'W' || resn === 'DOD' || resn === 'D3O') {
                                  me.icn3d.water[serial] = 1;
                              }
                              else {
                                  me.icn3d.ligands[serial] = 1;
                              }
                            }

                            me.icn3d.displayAtoms[serial] = 1;
                            me.icn3d.highlightAtoms[serial] = 1;
                        }
                    },
                    onBond: function( bondData ){
                        var from = oriindex2serial[bondData.atomIndex1];
                        var to = oriindex2serial[bondData.atomIndex2];

                        if(oriindex2serial.hasOwnProperty(bondData.atomIndex1) && oriindex2serial.hasOwnProperty(bondData.atomIndex2)) { // some alt atoms were skipped
                            me.icn3d.atoms[from].bonds.push(to);
                            me.icn3d.atoms[to].bonds.push(from);

                            if(het) {
                                var order = bondData.bondOrder;

                                me.icn3d.atoms[from].bondOrder.push(order);
                                me.icn3d.atoms[to].bondOrder.push(order);

                                if(order === 2) {
                                    me.icn3d.doublebonds[from + '_' + to] = 1;
                                    me.icn3d.doublebonds[to + '_' + from] = 1;
                                }
                                else if(order === 3) {
                                    me.icn3d.triplebonds[from + '_' + to] = 1;
                                    me.icn3d.triplebonds[to + '_' + from] = 1;
                                }
                            }
                        }
                    }
                };

                // traverse
                MMTF.traverse( mmtfData, callbackDict );

                // set up disulfide bonds
                var sgLength = SGAtomSerialArray.length;
                for(var i = 0, il = sgLength; i < il; ++i) {
                    for(var j = i+1, jl = sgLength; j < il; ++j) {

                        var serial1 = SGAtomSerialArray[i];
                        var serial2 = SGAtomSerialArray[j];

                        var atom1 = me.icn3d.atoms[serial1];
                        var atom2 = me.icn3d.atoms[serial2];

                        if($.inArray(serial2, atom1.bonds) !== -1) {
                            var resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
                            var resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;

                            me.icn3d.ssbondpoints.push(resid1);
                            me.icn3d.ssbondpoints.push(resid2);
                        }
                    }
                }

                me.icn3d.cnt = serial;

                me.icn3d.pmin = pmin;
                me.icn3d.pmax = pmax;
                me.icn3d.maxD = pmax.distanceTo(pmin);
                me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

                if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;
                me.icn3d.oriMaxD = me.icn3d.maxD;
                me.icn3d.oriCenter = me.icn3d.center.clone();

                if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                    $("#" + me.pre + "alternateWrapper").hide();
                }

                me.icn3d.setAtomStyleByOptions(me.options);
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

                me.renderStructure();

                me.showTitle();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

                if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

            },
            // onError callback
            function( error ){
                console.error( error )
            }
        );
    };
