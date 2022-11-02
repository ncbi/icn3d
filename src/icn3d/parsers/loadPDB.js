/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

class LoadPDB {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //This PDB parser feeds the viewer with the content of a PDB file, pdbData.
    loadPDB(src, pdbid, bOpm, bVector, bMutation, bAppend, type, bLastQuery) { let  ic = this.icn3d, me = ic.icn3dui;
        let hAtoms = {};

        let bNMR = false;
        let  lines = src.split('\n');

        let  chainsTmp = {} // serial -> atom
        let  residuesTmp = {} // serial -> atom

        if(!ic.atoms) bAppend = false;

        let  serial, moleculeNum;
        if(!bMutation && !bAppend) {
            ic.init();
            moleculeNum = 1;
            serial = 0;
        }
        else {
            // remove the last structure
            // if(ic.alertAlt) {
            //     let  nStru = ic.oriNStru + 1; //Object.keys(ic.structures).length;
            //     let   chainArray = ic.structures[nStru - 1];
            //     for(let i = 0, il = (chainArray) ? chainArray.length : 0; i < il; ++i) {
            //         for(let j in ic.chains[chainArray[i]]) {
            //             delete ic.atoms[j];
            //             delete ic.hAtoms[j];
            //             delete ic.dAtoms[j];
            //         }
            //         delete ic.chains[chainArray[i]];
            //     }

            //     delete ic.structures[nStru - 1];
            // }
            // else {
                ic.oriNStru = (ic.structures) ? Object.keys(ic.structures).length : 0;
            // }

            moleculeNum = ic.oriNStru + 1; //Object.keys(ic.structures).length + 1;
            // Concatenation of two pdbs will have several atoms for the same serial
            serial = (ic.atoms) ? Object.keys(ic.atoms).length : 0;
        }

        //let helices = [], sheets = [];
        let sheetArray = [], sheetStart = [], sheetEnd = [], helixArray = [], helixStart = [], helixEnd = [];

        let  chainNum, residueNum, oriResidueNum;
        let  prevChainNum = '', prevResidueNum = '', prevOriResidueNum = '', prevResi = 0;
        let  prevRecord = '';
        let  bModifyResi = false;

        let  oriSerial2NewSerial = {}

        //let  chainMissingResidueArray = {}

        let  id = (pdbid) ? pdbid : 'stru';

        let  maxMissingResi = 0, prevMissingChain = '';
        let  CSerial, prevCSerial, OSerial, prevOSerial;

        let  structure = "stru";

        let bHeader = false;

        for (let i in lines) {
            let  line = lines[i];
            let  record = line.substr(0, 6);

            if (record === 'HEADER' && !bHeader) {              
                // if(bOpm === undefined || !bOpm) ic.bSecondaryStructure = true;

                ///id = line.substr(62, 4).trim();
                id = line.substr(62).trim();

                if(id == '') {
                    if(bAppend) {
                        id = "stru";
                    }
                    else {
                        //if(!ic.inputid) ic.inputid = 'stru';
                        id = (ic.inputid && ic.inputid.indexOf('/') == -1) ? ic.inputid.substr(0, 10) : "stru"; //ic.filename.substr(0, 4);
                    }
                }

                structure = id;

                //if(id == 'stru' || bMutation) { // bMutation: side chain prediction
                if(id == 'stru') {
                        structure = (moleculeNum === 1) ? id : id + moleculeNum.toString();
                }

                ic.molTitle = '';

                bHeader = true; // read the first header if there are multiple
            } else if (record === 'TITLE ') {
                let  name = line.substr(10).replace(/ALPHAFOLD MONOMER V2.0 PREDICTION FOR /gi, '');
                ic.molTitle += name.trim() + " ";

            } else if (record === 'HELIX ') {
                ic.bSecondaryStructure = true;

                //let  startChain = (line.substr(19, 1) == ' ') ? 'A' : line.substr(19, 1);
                let  startChain = (line.substr(18, 2).trim() == '') ? 'A' : line.substr(18, 2).trim();
                let  startResi = parseInt(line.substr(21, 4));
                let  endResi = parseInt(line.substr(33, 4));

                for(let j = startResi; j <= endResi; ++j) {
                  let resid = structure + "_" + startChain + "_" + j;
                  helixArray.push(resid);

                  if(j === startResi) helixStart.push(resid);
                  if(j === endResi) helixEnd.push(resid);
                }
/*
                helices.push({
                    structure: structure,
                    chain: startChain,
                    initialResidue: startResi,
                    initialInscode: line.substr(25, 1),
                    terminalResidue: endResi,
                    terminalInscode: line.substr(37, 1),
                });
*/                
            } else if (record === 'SHEET ') {
                //ic.bSecondaryStructure = true;
                if(bOpm === undefined || !bOpm) ic.bSecondaryStructure = true;

                //let  startChain = (line.substr(21, 1) == ' ') ? 'A' : line.substr(21, 1);
                let  startChain = (line.substr(20, 2).trim() == '') ? 'A' : line.substr(20, 2).trim();
                let  startResi = parseInt(line.substr(22, 4));
                let  endResi = parseInt(line.substr(33, 4));

                for(let j = startResi; j <= endResi; ++j) {
                  let  resid = structure + "_" + startChain + "_" + j;
                  sheetArray.push(resid);

                  if(j === startResi) sheetStart.push(resid);
                  if(j === endResi) sheetEnd.push(resid);
                }           
            } else if (record === 'HBOND ') {
                if(bOpm === undefined || !bOpm) ic.bSecondaryStructure = true;
            } else if (record === 'SSBOND') {
                ic.bSsbondProvided = true;
                //SSBOND   1 CYS E   48    CYS E   51                          2555
                let  chain1 = (line.substr(15, 1) == ' ') ? 'A' : line.substr(15, 1);
                let  resi1 = line.substr(17, 4).trim();
                let  resid1 = id + '_' + chain1 + '_' + resi1;

                let  chain2 = (line.substr(29, 1) == ' ') ? 'A' : line.substr(29, 1);
                let  resi2 = line.substr(31, 4).trim();
                let  resid2 = id + '_' + chain2 + '_' + resi2;

                if(ic.ssbondpnts[id] === undefined) ic.ssbondpnts[id] = [];

                ic.ssbondpnts[id].push(resid1);
                ic.ssbondpnts[id].push(resid2);
            } else if (record === 'REMARK') {
                 let  remarkType = parseInt(line.substr(7, 3));

                 if(line.indexOf('1/2 of bilayer thickness:') !== -1) { // OPM transmembrane protein
                    ic.halfBilayerSize = parseFloat(line.substr(line.indexOf(':') + 1).trim());
                 }
                 else if (remarkType == 210) {
                     if((line.substr(11, 32).trim() == 'EXPERIMENT TYPE') && line.substr(45).trim() == 'NMR') {
                        bNMR = true;
                     }
                 }
                 else if (remarkType == 350 && line.substr(13, 5) == 'BIOMT') {
                    let  n = parseInt(line[18]) - 1;
                    //var m = parseInt(line.substr(21, 2));
                    let  m = parseInt(line.substr(21, 2)) - 1; // start from 1
                    if (ic.biomtMatrices[m] == undefined) ic.biomtMatrices[m] = new THREE.Matrix4().identity();
                    ic.biomtMatrices[m].elements[n] = parseFloat(line.substr(24, 9));
                    ic.biomtMatrices[m].elements[n + 4] = parseFloat(line.substr(34, 9));
                    ic.biomtMatrices[m].elements[n + 8] = parseFloat(line.substr(44, 9));
                    //ic.biomtMatrices[m].elements[n + 12] = parseFloat(line.substr(54, 10));
                    ic.biomtMatrices[m].elements[n + 12] = parseFloat(line.substr(54, 14));
                 }
                 // missing residues
                 else if (remarkType == 465 && line.substr(18, 1) == ' ' && line.substr(20, 1) == ' ' && line.substr(21, 1) != 'S') {
                    let  resn = line.substr(15, 3);
                    //let  chain = line.substr(19, 1);
                    let  chain = line.substr(18, 2).trim();
                    //let  resi = parseInt(line.substr(21, 5));
                    let  resi = line.substr(21, 5);

                    //var structure = parseInt(line.substr(13, 1));
                    //if(line.substr(13, 1) == ' ') structure = 1;

                    //var chainNum = structure + '_' + chain;
                    let  chainNum = id + '_' + chain;

                    if(ic.chainMissingResidueArray[chainNum] === undefined) ic.chainMissingResidueArray[chainNum] = [];
                    let  resObject = {}
                    resObject.resi = resi;
                    resObject.name = me.utilsCls.residueName2Abbr(resn).toLowerCase();

                    if(chain != prevMissingChain) {
                        maxMissingResi = 0;
                    }

                    // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                    //if(!isNaN(resi) && (prevMissingChain == '' || (chain != prevMissingChain) || (chain == prevMissingChain && resi > maxMissingResi)) ) {
                    if(prevMissingChain == '' || (chain != prevMissingChain) || (chain == prevMissingChain) ) {
                        ic.chainMissingResidueArray[chainNum].push(resObject);
                        maxMissingResi = resi;
                        prevMissingChain = chain;
                    }

                 }
                 else if (remarkType == 900 && ic.emd === undefined && line.substr(34).trim() == 'RELATED DB: EMDB') {
                     //REMARK 900 RELATED ID: EMD-3906   RELATED DB: EMDB
                     ic.emd = line.substr(23, 11).trim();
                 }
            } else if (record === 'SOURCE' && ic.organism === undefined && line.substr(11, 15).trim() == 'ORGANISM_COMMON') {
                ic.organism = line.substr(28).toLowerCase().trim();

                ic.organism = ic.organism.substr(0, ic.organism.length - 1);
            } else if (record === 'ENDMDL') {
                ++moleculeNum;
                id = 'stru';

                structure = id;
                
                //if(id == 'stru' || bMutation) { // bMutation: side chain prediction
                if(id == 'stru') {
                        structure = (moleculeNum === 1) ? id : id + moleculeNum.toString();
                }

                //helices = [];
                //sheets = [];
                if(!bNMR) {
                    sheetArray = [];
                    sheetStart = [];
                    sheetEnd = [];
                    helixArray = [];
                    helixStart = [];
                    helixEnd = [];
                }

                bHeader = false; // reinitialize to read structure name from the header
            } else if (record === 'JRNL  ') {
                if(line.substr(12, 4) === 'PMID') {
                    ic.pmid = line.substr(19).trim();
                }
            } else if (record === 'ATOM  ' || record === 'HETATM') {
                structure = id;
                
                //if(id == 'stru' || bMutation) { // bMutation: side chain prediction
                if(id == 'stru') {
                        structure = (moleculeNum === 1) ? id : id + moleculeNum.toString();
                }

                let  alt = line.substr(16, 1);
                //if (alt !== " " && alt !== "A") continue;

                // "CA" has to appear before "O". Otherwise the cartoon of secondary structure will have breaks
                // Concatenation of two pdbs will have several atoms for the same serial
                ++serial;

                let  serial2 = parseInt(line.substr(6, 5));
                oriSerial2NewSerial[serial2] = serial;

                let  elem = line.substr(76, 2).trim();
                if (elem === '') { // for some incorrect PDB files, important to use substr(12,2), not (12,4)
                   elem = line.substr(12, 2).trim();
                }
                let  atom = line.substr(12, 4).trim();
                let  resn = line.substr(17, 3);

                //let  chain = line.substr(21, 1);
                //if(chain === ' ') chain = 'A';
                let  chain = line.substr(20, 2).trim();
                if(chain === '') chain = 'A';

                //var oriResi = line.substr(22, 4).trim();
                let  oriResi = line.substr(22, 5).trim();

                let  resi = oriResi; //parseInt(oriResi);
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

                if(bVector && resn === 'DUM') break; // just need to get the vector of the largest chain

                chainNum = structure + "_" + chain;
                oriResidueNum = chainNum + "_" + oriResi;
                if(chainNum !== prevChainNum) {
                    prevResi = 0;
                    bModifyResi = false;
                }

                residueNum = chainNum + "_" + resi;

                //let  chain_resi = chain + "_" + resi;

                let  x = parseFloat(line.substr(30, 8));
                let  y = parseFloat(line.substr(38, 8));
                let  z = parseFloat(line.substr(46, 8));
                let  coord = new THREE.Vector3(x, y, z);

                let  atomDetails = {
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
                }

                if(!atomDetails.het && atomDetails.name === 'C') {
                    CSerial = serial;
                }
                if(!atomDetails.het && atomDetails.name === 'O') {
                    OSerial = serial;
                }

                // from DSSP C++ code
                if(!atomDetails.het && atomDetails.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
                    let  dist = ic.atoms[prevCSerial].coord.distanceTo(ic.atoms[prevOSerial].coord);

                    let  x2 = atomDetails.coord.x + (ic.atoms[prevCSerial].coord.x - ic.atoms[prevOSerial].coord.x) / dist;
                    let  y2 = atomDetails.coord.y + (ic.atoms[prevCSerial].coord.y - ic.atoms[prevOSerial].coord.y) / dist;
                    let  z2 = atomDetails.coord.z + (ic.atoms[prevCSerial].coord.z - ic.atoms[prevOSerial].coord.z) / dist;

                    atomDetails.hcoord = new THREE.Vector3(x2, y2, z2);
                }

                ic.atoms[serial] = atomDetails;

                ic.dAtoms[serial] = 1;
                ic.hAtoms[serial] = 1;
                hAtoms[serial] = 1;

                // Assign secondary structures from the input
                // if a residue is assigned both sheet and helix, it is assigned as sheet
                if(this.isSecondary(residueNum, sheetArray, bNMR)) {
                  ic.atoms[serial].ss = 'sheet';
                  if(this.isSecondary(residueNum, sheetStart, bNMR)) {
                    ic.atoms[serial].ssbegin = true;
                  }

                  // do not use else if. Some residues are both start and end of secondary structure
                  if(this.isSecondary(residueNum, sheetEnd, bNMR)) {
                    ic.atoms[serial].ssend = true;
                  }
                }
                else if(this.isSecondary(residueNum, helixArray, bNMR)) {
                  ic.atoms[serial].ss = 'helix';

                  if(this.isSecondary(residueNum, helixStart, bNMR)) {
                    ic.atoms[serial].ssbegin = true;
                  }

                  // do not use else if. Some residues are both start and end of secondary structure
                  if(this.isSecondary(residueNum, helixEnd, bNMR)) {
                    ic.atoms[serial].ssend = true;
                  }
                }

                let  secondaries = '-';
                if(ic.atoms[serial].ss === 'helix') {
                    secondaries = 'H';
                }
                else if(ic.atoms[serial].ss === 'sheet') {
                    secondaries = 'E';
                }
                //else if(ic.atoms[serial].ss === 'coil') {
                //    secondaries = 'c';
                //}
                else if(!ic.atoms[serial].het && me.parasCls.residueColors.hasOwnProperty(ic.atoms[serial].resn.toUpperCase()) ) {
                    secondaries = 'c';
                }
                else {
                    secondaries = 'o';
                }

                ic.secondaries[residueNum] = secondaries;

                // different residue
                //if(residueNum !== prevResidueNum) {
                if(oriResidueNum !== prevOriResidueNum) {
                    let  residue = me.utilsCls.residueName2Abbr(resn);
                    ic.residueId2Name[residueNum] = residue;

                    if(serial !== 1 && prevResidueNum !== '') ic.residues[prevResidueNum] = residuesTmp;

                    if(residueNum !== prevResidueNum) {
                        residuesTmp = {}
                    }

                    // different chain
                    if(chainNum !== prevChainNum) {
                        prevCSerial = undefined;
                        prevOSerial = undefined;

                        // a chain could be separated in two sections
                        if(serial !== 1 && prevChainNum !== '') {
                            if(ic.chains[prevChainNum] === undefined) ic.chains[prevChainNum] = {}
                            ic.chains[prevChainNum] = me.hashUtilsCls.unionHash(ic.chains[prevChainNum], chainsTmp);
                        }

                        chainsTmp = {}

                        if(ic.structures[structure.toString()] === undefined) ic.structures[structure.toString()] = [];
                        if(!ic.structures[structure.toString()].includes(chainNum)) ic.structures[structure.toString()].push(chainNum);

                        if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

                        let  resObject = {}
                        resObject.resi = resi;
                        resObject.name = residue;

                        ic.chainsSeq[chainNum].push(resObject);
                    }
                    else {
                        prevCSerial = CSerial;
                        prevOSerial = OSerial;

                        let  resObject = {}
                        resObject.resi = resi;
                        resObject.name = residue;

                        ic.chainsSeq[chainNum].push(resObject);
                    }
                }

                chainsTmp[serial] = 1;
                residuesTmp[serial] = 1;

                prevRecord = record;

                prevChainNum = chainNum;
                prevResidueNum = residueNum;
                prevOriResidueNum = oriResidueNum;

            } else if (record === 'CONECT') {
                let  from = parseInt(line.substr(6, 5));
                for (let j = 0; j < 4; ++j) {
                    let  to = parseInt(line.substr([11, 16, 21, 26][j], 5));
                    if (isNaN(to)) continue;

                    if(ic.atoms[oriSerial2NewSerial[from]] !== undefined) ic.atoms[oriSerial2NewSerial[from]].bonds.push(oriSerial2NewSerial[to]);
                }
            } else if (record.substr(0,3) === 'TER') {
                // Concatenation of two pdbs will have several atoms for the same serial
                ++serial;
            }
        }

        // add the last residue set
        ic.residues[residueNum] = residuesTmp;
        if(ic.chains[chainNum] === undefined) ic.chains[chainNum] = {}
        ic.chains[chainNum] = me.hashUtilsCls.unionHash2Atoms(ic.chains[chainNum], chainsTmp, ic.atoms);

        if(!bMutation) this.adjustSeq(ic.chainMissingResidueArray);

    //    ic.missingResidues = [];
    //    for(let chainid in chainMissingResidueArray) {
    //        let  resArray = chainMissingResidueArray[chainid];
    //        for(let i = 0; i < resArray.length; ++i) {
    //            ic.missingResidues.push(chainid + '_' + resArray[i].resi);
    //        }
    //    }

        // copy disulfide bonds
        let  structureArray = Object.keys(ic.structures);
        for(let s = 0, sl = structureArray.length; s < sl; ++s) {
            let  structure = structureArray[s];

            if(structure == id) continue;

            if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];

            if(ic.ssbondpnts[id] !== undefined) {
                for(let j = 0, jl = ic.ssbondpnts[id].length; j < jl; ++j) {
                    let  ori_resid = ic.ssbondpnts[id][j];
                    let  pos = ori_resid.indexOf('_');
                    let  resid = structure + ori_resid.substr(pos);

                    ic.ssbondpnts[structure].push(resid);
                }
            }
        }

        // calculate disulfide bonds for PDB files
        if(!ic.bSsbondProvided) {
            this.setSsbond();
        }

        // remove the reference
        lines = null;

        let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.hAtoms);
        let  curChain = firstAtom.chain, curResi = firstAtom.resi, curInsc, curResAtoms = [];
      
        let  pmin = new THREE.Vector3( 9999, 9999, 9999);
        let  pmax = new THREE.Vector3(-9999,-9999,-9999);
        let  psum = new THREE.Vector3();
        let  cnt = 0;

        // lipids may be considered as protein if "ATOM" instead of "HETATM" was used
        let  lipidResidHash = {}

        // assign atoms
        let prevCarbonArray = [firstAtom]; // add a dummy atom
        //for (let i in ic.atoms) {
        for (let i in ic.hAtoms) {    
            let  atom = ic.atoms[i];
            let  coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(!atom.het) {
              if($.inArray(atom.resn, me.parasCls.nucleotidesArray) !== -1) {
                ic.nucleotides[atom.serial] = 1;
                //if (atom.name === 'P') {
                if (atom.name === "O3'" || atom.name === "O3*") {
                    ic.nucleotidesO3[atom.serial] = 1;

                    ic.secondaries[atom.structure + '_' + atom.chain + '_' + atom.resi] = 'o'; // nucleotide
                }

                if(me.parasCls.nuclMainArray.indexOf(atom.name) === -1) {
                    ic.ntbase[atom.serial] = 1;
                }
              }
              else {
                if (atom.elem === 'P') {
                    lipidResidHash[atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;
                }

                ic.proteins[atom.serial] = 1;
                if (atom.name === 'CA') ic.calphas[atom.serial] = 1;
                if (atom.name !== 'N' && atom.name !== 'H' && atom.name !== 'CA' && atom.name !== 'HA' && atom.name !== 'C' && atom.name !== 'O') ic.sidec[atom.serial] = 1;
              }
            }
            else if(atom.het) {
              if(atom.resn === 'HOH' || atom.resn === 'WAT' || atom.resn === 'SOL') {
                ic.water[atom.serial] = 1;
              }
              //else if(bOpm && atom.resn === 'DUM') {
              //  ic.mem[atom.serial] = 1;
              //}
              else if($.inArray(atom.resn, me.parasCls.ionsArray) !== -1 || atom.elem.trim() === atom.resn.trim()) {
                ic.ions[atom.serial] = 1;
              }
              else {
                ic.chemicals[atom.serial] = 1;
              }

              atom.color = me.parasCls.atomColors[atom.elem];
            }

            if(!(curChain === atom.chain && curResi === atom.resi)) {
                // a new residue, add the residue-residue bond besides the regular bonds               
                this.refreshBonds(curResAtoms, prevCarbonArray[0]);

                prevCarbonArray.splice(0, 1); // remove the first carbon

                curChain = atom.chain;
                curResi = atom.resi;
                //curInsc = atom.insc;
                curResAtoms.length = 0;
            }
            curResAtoms.push(atom);

            if(atom.name === 'C' || atom.name === 'O3\'') {
                prevCarbonArray.push(atom);
            }
        } // end of for

        // last residue
        //refreshBonds();
        this.refreshBonds(curResAtoms, prevCarbonArray[0]);

        // reset lipid
        for(let resid in lipidResidHash) {
            let  atomHash = ic.residues[resid];
            for(serial in atomHash) {
                let  atom = ic.atoms[serial];

                atom.het = true;
                ic.chemicals[atom.serial] = 1;
                ic.secondaries[resid] = 'o'; // nucleotide

                delete ic.proteins[atom.serial];
                if (atom.name === 'CA') delete ic.calphas[atom.serial];
                if (atom.name !== 'N' && atom.name !== 'H' && atom.name !== 'CA' && atom.name !== 'HA' && atom.name !== 'C' && atom.name !== 'O') delete ic.sidec[atom.serial];
            }
        }

        ic.pmin = pmin;
        ic.pmax = pmax;

        ic.cnt = cnt;

        //ic.maxD = ic.pmax.distanceTo(ic.pmin);
        //ic.center = psum.multiplyScalar(1.0 / ic.cnt);
        ic.center = ic.ParserUtilsCls.getGeoCenter(ic.pmin, ic.pmax);

        ic.maxD = ic.ParserUtilsCls.getStructureSize(ic.atoms, ic.pmin, ic.pmax, ic.center);

        if (ic.maxD < 5) ic.maxD = 5;

        ic.oriMaxD = ic.maxD;
        ic.oriCenter = ic.center.clone();

        if(type === 'target') {
            ic.oriMaxD = ic.maxD;
            ic.center1 = ic.center;
        }
        else if(type === 'query') {
            if(ic.oriMaxD < ic.maxD) ic.oriMaxD = ic.maxD;

            ic.center2 = ic.center;
            ic.center = new THREE.Vector3(0,0,0);
        }

        if(bVector) { // just need to get the vector of the largest chain
            return this.getChainCalpha(ic.chains, ic.atoms);
        }
        else {
            return hAtoms;
        }
    }

    // refresh for atoms in each residue
    refreshBonds(curResAtoms, prevCarbon) { let  ic = this.icn3d, me = ic.icn3dui;
        let  n = curResAtoms.length;
        for (let j = 0; j < n; ++j) {
            let  atom0 = curResAtoms[j];
            for (let k = j + 1; k < n; ++k) {
                let  atom1 = curResAtoms[k];
                if (atom0.alt === atom1.alt && me.utilsCls.hasCovalentBond(atom0, atom1)) {
                //if (me.utilsCls.hasCovalentBond(atom0, atom1)) {
                    atom0.bonds.push(atom1.serial);
                    atom1.bonds.push(atom0.serial);
                }
            }

            //f && f(atom0);
            if (prevCarbon && (prevCarbon.name === 'C' || prevCarbon.name === 'O3\'') && (atom0.name === 'N' || atom0.name === 'P') && me.utilsCls.hasCovalentBond(atom0, prevCarbon)) {
                atom0.bonds.push(prevCarbon.serial);
                prevCarbon.bonds.push(atom0.serial);
            }
        }
    }

    adjustSeq(chainMissingResidueArray) { let  ic = this.icn3d, me = ic.icn3dui;
        // adjust sequences
        for(let chainNum in ic.chainsSeq) {
            if(chainMissingResidueArray[chainNum] === undefined) continue;

            //let  A = ic.chainsSeq[chainNum];
            //let  B = chainMissingResidueArray[chainNum];

            let  A = chainMissingResidueArray[chainNum];
            let  B = ic.chainsSeq[chainNum];

            let  m = A.length;
            let  n = B.length;

            let  C = new Array(m + n);
            //var C2 = new Array(m + n);
            //var C3 = new Array(m + n);

            // http://www.algolist.net/Algorithms/Merge/Sorted_arrays
            // m - size of A
            // n - size of B
            // size of C array must be equal or greater than m + n
              let  i, j, k;
              i = 0;
              j = 0;
              k = 0;
              while (i < m && j < n) {
                    if (parseInt(A[i].resi) <= parseInt(B[j].resi)) {
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
                    for (let p = i; p < m; p++) {
                          C[k] = A[p];
                          //C2[k] = A2[p];
                          //C3[k] = A3[p];
                          k++;
                    }
              } else {
                    for (let p = j; p < n; p++) {
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

            ic.chainsSeq[chainNum] = C;
            //ic.chainsAn[chainNum][0] = C2;
            //ic.chainsAn[chainNum][1] = C3;
        }
    }

    setSsbond() { let  ic = this.icn3d, me = ic.icn3dui;
        // get all Cys residues
        let  structure2cys_resid = {};

        for(let chainid in ic.chainsSeq) {
            let  seq = ic.chainsSeq[chainid];
            let  structure = chainid.substr(0, chainid.indexOf('_'));

            for(let i = 0, il = seq.length; i < il; ++i) {
                // each seq[i] = {"resi": 1, "name":"C"}
                if(seq[i].name == 'C') {
                    if(structure2cys_resid[structure] == undefined) structure2cys_resid[structure] = [];
                    structure2cys_resid[structure].push(chainid + '_' + seq[i].resi);
                }
            }
        }

        // determine whether there are disulfide bonds
        // disulfide bond is about 2.05 angstrom
        let  distMax = 4; //3; // https://icn3d.page.link/5KRXx6XYfig1fkye7
        let  distSqrMax = distMax * distMax;
        for(let structure in structure2cys_resid) {
            let  cysArray = structure2cys_resid[structure];

            for(let i = 0, il = cysArray.length; i < il; ++i) {
                for(let j = i + 1, jl = cysArray.length; j < jl; ++j) {
                    let  resid1 = cysArray[i];
                    let  resid2 = cysArray[j];

                    let  coord1 = undefined, coord2 = undefined;
                    for(let serial in ic.residues[resid1]) {
                        if(ic.atoms[serial].elem == 'S') {
                            coord1 = ic.atoms[serial].coord;
                            break;
                        }
                    }
                    for(let serial in ic.residues[resid2]) {
                        if(ic.atoms[serial].elem == 'S') {
                            coord2 = ic.atoms[serial].coord;
                            break;
                        }
                    }

                    if(coord1 === undefined || coord2 === undefined) continue;

                    if(Math.abs(coord1.x - coord2.x) > distMax) continue;
                    if(Math.abs(coord1.y - coord2.y) > distMax) continue;
                    if(Math.abs(coord1.z - coord2.z) > distMax) continue;
                    let  distSqr = (coord1.x - coord2.x)*(coord1.x - coord2.x) + (coord1.y - coord2.y)*(coord1.y - coord2.y) + (coord1.z - coord2.z)*(coord1.z - coord2.z);

                    if(distSqr < distSqrMax) { // disulfide bond
                        if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];
                        ic.ssbondpnts[structure].push(resid1);
                        ic.ssbondpnts[structure].push(resid2);
                    }
                }
            }
        }
    }

    getChainCalpha(chains, atoms, bResi_ori, pdbid) { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainCalphaHash = {}

        for(let chainid in chains) {
            if(pdbid !== undefined) {
                let  textArray =  chainid.split('_');
                if(textArray[0] !== pdbid) continue; // skip different chain
            }

            let  serialArray = Object.keys(chains[chainid]);

            let  calphaArray = [];
            let  cnt = 0;
            let  lastResi = 0;
            let  bBaseResi = true, baseResi = 1;
            for(let i = 0, il = serialArray.length; i < il; ++i) {
                let  atom = atoms[serialArray[i]];
                if( (ic.proteins.hasOwnProperty(serialArray[i]) && atom.name == "CA")
                  || (ic.nucleotides.hasOwnProperty(serialArray[i]) && (atom.name == "O3'" || atom.name == "O3*")) ) {
                    if(atom.resi == lastResi) continue; // e.g., Alt A and B

                    let  resn = (atom.resn.trim().length > 3) ? atom.resn.trim().substr(0, 3) : atom.resn.trim();
                    if(!me.parasCls.chargeColors.hasOwnProperty(resn)) {
                        continue; // regular residues
                    }

                    let  resi = (bResi_ori) ? atom.resi_ori : atom.resi; // MMDB uses resi_ori for PDB residue number

                    if(bBaseResi) {
                        baseResi = resi;
                        bBaseResi = false;
                    }
                    //resi = resi - baseResi + 1;

                    //chainresiCalphaHash[atom.chain + '_' + resi] = atom.coord.clone();

                    calphaArray.push(atom.coord.clone());
                    ++cnt;

                    lastResi = atom.resi;
                }
            }

            if(cnt > 0) {
                //var chainid = atoms[serialArray[0]].structure + '_' + atoms[serialArray[0]].chain;
                let  chain = atoms[serialArray[0]].chain;
                chainCalphaHash[chain] = calphaArray;
            }
        }

        return {'chainresiCalphaHash': chainCalphaHash, 'center': ic.center.clone()}
    }

    isSecondary(resid, residArray, bNMR) { let  ic = this.icn3d, me = ic.icn3dui;
        if(!bNMR) {
            return $.inArray(resid, residArray) != -1;
        }
        else {
            let chain_resi = resid.substr(resid.indexOf('_') + 1);

            let bFound = false;
            for(let i = 0, il = residArray.length; i < il; ++i) {
                if(chain_resi == residArray[i].substr(residArray[i].indexOf('_') + 1)) {
                    bFound = true;
                    break;
                }
            }

            return bFound;
        }
    }
}

export {LoadPDB}
