// https://www.geeksforgeeks.org/how-to-share-code-between-node-js-and-the-browser/
// https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports) {
//  'use strict';

let pickCustomSphere = require('./pickCustomSphere.js');
let utils = require('./utils.js');
let para = require('./para.js');

let getPdbStr = function (atoms_residues, pdbid, chain, resi, bAll) {
    if(bAll) return getPDBHeader(pdbid) + getAtomPDB(atoms_residues, atoms_residues.atoms);

    let atoms = atoms_residues.atoms;
    let residues = atoms_residues.residues;

    // find neighboring residues
    let resid = pdbid + '_' + chain + '_' + resi;

    let bGetPairs = false;
    let bInteraction = false;
    let radius = 10;

    let resids2inter = {}, resids2interAll = {};

    //{"residHash": residHash, "resid2Residhash": ic.resid2Residhash};
    let result = pickCustomSphere.pickCustomSphere(atoms, residues, radius, residues[resid], atoms, bInteraction, bGetPairs, undefined, resids2inter, resids2interAll);

    let residueArray = Object.keys(result.residHash);
    let hAtoms = {};
    for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
      let residTmp = residueArray[index];
      for(let i in residues[residTmp]) {
        hAtoms[i] = 1;
      }
    }

    hAtoms = utils.unionHash(hAtoms, residues[resid]);

    let pdbStr = getPDBHeader(pdbid) + getAtomPDB(atoms_residues, hAtoms);

    return pdbStr;
};

function getPDBHeader(pdbid) {
   return 'HEADER    PDB From iCn3D'.padEnd(62, ' ') + pdbid + '\n';
}

function getAtomPDB(atoms_residues, atomHash, bPqr, bNoChem) {
    let atoms = atoms_residues.atoms;
    let residues = atoms_residues.residues;
    let chemicals = atoms_residues.chemicals;
    let calphas = atoms_residues.calphas;
    let pdbid = atoms_residues.pdbid;
    let structures = atoms_residues.structures;

    let pdbStr = '';

    // get all phosphate groups in lipids
    let phosPHash = {}, phosOHash = {};
    for(let i in chemicals) {
        let atom = atoms[i];
        if(atom.elem == 'P') {
            phosPHash[i] = 1;

            for(let j = 0, jl = atom.bonds.length; j < jl; ++j) {
                let serial = atom.bonds[j];
                if(serial && atoms[serial].elem == 'O') { // could be null
                    phosOHash[serial] = 1;
                }
            }
        }
    }

    let calphaHash = utils.intHash(atomHash, calphas);
    let helixStr = 'HELIX', sheetStr = 'SHEET';
    let bHelixBegin = false, bHelixEnd = true;
    let bSheetBegin = false, bSheetEnd = true;

    for(let i in calphaHash) {
        let atom = atoms[i];

        if(atom.ssbegin) {
            if(atom.ss == 'helix') {
                bHelixBegin = true;
                if(bHelixEnd) pdbStr += helixStr.padEnd(15, ' ') + atom.resn.padStart(3, ' ') + atom.chain.padStart(2, ' ')
                    + atom.resi.toString().padStart(5, ' ');
                bHelixEnd = false;
            }
            else if(atom.ss == 'sheet') {
                bSheetBegin = true;
                if(bSheetEnd) pdbStr += sheetStr.padEnd(17, ' ') + atom.resn.padStart(3, ' ') + atom.chain.padStart(2, ' ')
                    + atom.resi.toString().padStart(4, ' ');
                bSheetEnd = false;
            }
        }

        if(atom.ssend) {
            if(atom.ss == 'helix') {
                bHelixEnd = true;
                if(bHelixBegin) pdbStr += atom.resn.padStart(5, ' ') + atom.chain.padStart(2, ' ')
                    + atom.resi.toString().padStart(5, ' ') + '\n';
                bHelixBegin = false;
            }
            else if(atom.ss == 'sheet') {
                bSheetEnd = true;
                if(bSheetBegin) pdbStr += atom.resn.padStart(5, ' ') + atom.chain.padStart(2, ' ')
                    + atom.resi.toString().padStart(4, ' ') + '\n';
                bSheetBegin = false;
            }
        }
    }

    let connStr = '';
    let struArray = Object.keys(structures);
    let bMulStruc = (struArray.length > 1) ? true : false;

    let molNum = 1, prevStru = '';
    pdbStr += '\n';
    for(let i in atomHash) {
        let atom = atoms[i];

        // remove chemicals
        if(bNoChem && atom.het) continue;

        if(bMulStruc && atom.structure != prevStru) {
            pdbStr += connStr;
            connStr = '';

            if(molNum > 1)  pdbStr += 'ENDMDL\n';
            pdbStr += 'MODEL        ' + molNum + '\n';
            prevStru = atom.structure;
            ++molNum;
        }

        let line = '';
/*
1 - 6 Record name "ATOM "
7 - 11 Integer serial Atom serial number.
13 - 16 Atom name Atom name.
17 Character altLoc Alternate location indicator.
18 - 20 Residue name resName Residue name.
22 Character chainID Chain identifier.
23 - 26 Integer resSeq Residue sequence number.
27 AChar iCode Code for insertion of residues.
31 - 38 Real(8.3) x Orthogonal coordinates for X in
Angstroms.
39 - 46 Real(8.3) y Orthogonal coordinates for Y in
Angstroms.
47 - 54 Real(8.3) z Orthogonal coordinates for Z in
Angstroms.
55 - 60 Real(6.2) occupancy Occupancy.
61 - 66 Real(6.2) tempFactor Temperature factor.
73 - 76 LString(4) segID Segment identifier, left-justified.
77 - 78 LString(2) element Element symbol, right-justified.
79 - 80 LString(2) charge Charge on the atom.
*/
        line += (atom.het) ? 'HETATM' : 'ATOM  ';
        line += i.toString().padStart(5, ' ');
        line += ' ';

        let atomName = atom.name.trim();
        if(!isNaN(atomName.substr(0, 1)) ) atomName = atomName.substr(1) + atomName.substr(0, 1);

        if(atomName.length == 4) {
            line += atomName;
        }
        else {
            line += ' ';
            atomName = atomName.replace(/\*/g, "'");
            if(atomName == 'O1P') atomName = 'OP1';
            else if(atomName == 'O2P') atomName = 'OP2';
            else if(atomName == 'C5M') atomName = 'C7 ';
            line += atomName.padEnd(3, ' ');
        }

        line += ' ';
        let resn = atom.resn;

        line += (resn.length <= 3) ? resn.padStart(3, ' ') : resn.substr(0, 3);
        line += ' ';
        line += (atom.chain.length <= 1) ? atom.chain.padStart(1, ' ') : atom.chain.substr(0, 1);
        let resi = atom.resi;
        if(atom.chain.length > 3 && !isNaN(atom.chain.substr(3)) ) { // such as: chain = NAG2, resi=1 => chain = NAG, resi=2
            resi = resi - 1 + parseInt(atom.chain.substr(3));
        }
        line += (resi.toString().length <= 4) ? resi.toString().padStart(4, ' ') : resi.toString().substr(0, 4);
        line += ' '.padStart(4, ' ');
        line += atom.coord.x.toFixed(3).toString().padStart(8, ' ');
        line += atom.coord.y.toFixed(3).toString().padStart(8, ' ');
        line += atom.coord.z.toFixed(3).toString().padStart(8, ' ');

        //if( (bPqr && atom.het) || (phosPHash.hasOwnProperty(i) && !bPdb) || (phosOHash.hasOwnProperty(i) && !bPdb) ) {
        if( (bPqr && atom.het) || (phosPHash.hasOwnProperty(i)) || (phosOHash.hasOwnProperty(i)) ) {
            let size = 1.5, charge = 0;

            // use amber atom size
            if(atom.elem == 'C') size = 1.9080;
            else if(atom.elem == 'N') size = 1.8240;
            else if(atom.elem == 'O') size = 1.6612;
            else if(atom.elem == 'H') size = 1.2500;
            else if(atom.elem == 'S') size = 2.0000;
            else if(atom.elem == 'P') size = 2.1000;
            else if(para.vdwRadii.hasOwnProperty(atom.elem)) {
                size = para.vdwRadii[atom.elem];
            }

            //if(me.cfg.cid !== undefined && atom.crg !== undefined) {
            //    charge = atom.crg;
            //}
            //else

            if(phosPHash.hasOwnProperty(i)) {
                charge = 1.3800; // P in phosphate
            }
            else if(phosOHash.hasOwnProperty(i)) {
                charge = -0.5950; // O in phosphate
            }
            else if(para.ionCharges.hasOwnProperty(atom.elem)) {
                charge = para.ionCharges[atom.elem];
            }

            line += charge.toFixed(4).toString().padStart(8, ' ');
            line += size.toFixed(4).toString().padStart(7, ' ');
        }
        else {
            line += "1.00".padStart(6, ' ');
            line += (atom.b) ? parseFloat(atom.b).toFixed(2).toString().padStart(6, ' ') : ' '.padStart(6, ' ');
            line += ' '.padStart(10, ' ');
            line += atom.elem.padStart(2, ' ');
            line += ' '.padStart(2, ' ');
        }

        // connection info
        if(atom.het && atom.bonds.length > 0) {
            connStr += 'CONECT' + i.toString().padStart(5, ' ');
            let bondHash = {};
            for(let j = 0, jl = atom.bonds.length; j < jl; ++j) {
                if(atom.bonds[j] && !bondHash.hasOwnProperty(atom.bonds[j])) { // could be null
                    connStr += atom.bonds[j].toString().padStart(5, ' ');
                    bondHash[atom.bonds[j]] = 1;
                }
            }
            connStr += '\n';
        }

        pdbStr += line + '\n';
    }

    pdbStr += connStr;

    if(bMulStruc) pdbStr += 'ENDMDL\n';

    return pdbStr;
}

exports.getPdbStr = getPdbStr;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
