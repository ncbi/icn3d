/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
//getAtomPDB: function (atomHash, bPqr, bPdb, bNoChem) {  var me = this, ic = me.icn3d; "use strict";
iCn3DUI.prototype.getAtomPDB = function (atomHash, bPqr, bNoChem) {  var me = this, ic = me.icn3d; "use strict";
    var pdbStr = '';

    // get all phosphate groups in lipids
    var phosPHash = {}, phosOHash = {};
    for(var i in ic.chemicals) {
        var atom = ic.atoms[i];
        if(atom.elem == 'P') {
            phosPHash[i] = 1;

            for(var j = 0, jl = atom.bonds.length; j < jl; ++j) {
                var serial = atom.bonds[j];
                if(serial && ic.atoms[serial].elem == 'O') { // could be null
                    phosOHash[serial] = 1;
                }
            }
        }
    }
/*
HELIX    1  NT MET A    3  ALA A   12  1                                  10
        var startChain = (line.substr(19, 1) == ' ') ? 'A' : line.substr(19, 1);
        var startResi = parseInt(line.substr(21, 4));
        var endResi = parseInt(line.substr(33, 4));
SHEET    1  B1 2 GLY A  35  THR A  39  0
        var startChain = (line.substr(21, 1) == ' ') ? 'A' : line.substr(21, 1);
        var startResi = parseInt(line.substr(22, 4));
        var endResi = parseInt(line.substr(33, 4));
*/

    var calphaHash = ic.intHash(atomHash, ic.calphas);
    var helixStr = 'HELIX', sheetStr = 'SHEET';
    var bHelixBegin = false, bHelixEnd = true;
    var bSheetBegin = false, bSheetEnd = true;

    for(var i in calphaHash) {
        var atom = ic.atoms[i];

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

    var connStr = '';
    var struArray = Object.keys(ic.structures);
    var bMulStruc = (struArray.length > 1) ? true : false;

    var molNum = 1, prevStru = '';
    pdbStr += '\n';
    for(var i in atomHash) {
        var atom = ic.atoms[i];

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

        var line = '';
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

        var atomName = atom.name.trim();
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
        var resn = atom.resn;
/*
        // add "D" in front of nucleotide residue names
        if(resn == 'A') resn = 'DA';
        else if(resn == 'T') resn = 'DT';
        else if(resn == 'C') resn = 'DC';
        else if(resn == 'G') resn = 'DG';
        else if(resn == 'U') resn = 'DU';
*/

        line += (resn.length <= 3) ? resn.padStart(3, ' ') : resn.substr(0, 3);
        line += ' ';
        line += (atom.chain.length <= 1) ? atom.chain.padStart(1, ' ') : atom.chain.substr(0, 1);
        var resi = atom.resi;
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
            var size = 1.5, charge = 0;

/*
            // use antechamber atom size
            if(atom.elem == 'C') size = 1.7; //1.9080;
            else if(atom.elem == 'N') size = 1.55; //1.8240;
            else if(atom.elem == 'O') size = 1.52; //1.6612;
            else if(atom.elem == 'H') size = 1.2; //1.2500;
            else if(atom.elem == 'S') size = 1.8; //2.0000;
            else if(atom.elem == 'P') size = 1.8; //2.1000;
            else if(ic.vdwRadii.hasOwnProperty(atom.elem)) {
                size = ic.vdwRadii[atom.elem];
            }
*/

            // use amber atom size
            if(atom.elem == 'C') size = 1.9080;
            else if(atom.elem == 'N') size = 1.8240;
            else if(atom.elem == 'O') size = 1.6612;
            else if(atom.elem == 'H') size = 1.2500;
            else if(atom.elem == 'S') size = 2.0000;
            else if(atom.elem == 'P') size = 2.1000;
            else if(ic.vdwRadii.hasOwnProperty(atom.elem)) {
                size = ic.vdwRadii[atom.elem];
            }

            if(me.cfg.cid !== undefined && atom.crg !== undefined) {
                charge = atom.crg;
            }
            else if(phosPHash.hasOwnProperty(i)) {
                charge = 1.3800; // P in phosphate
            }
            else if(phosOHash.hasOwnProperty(i)) {
                charge = -0.5950; // O in phosphate
            }
            else if(ic.ionCharges.hasOwnProperty(atom.elem)) {
                charge = ic.ionCharges[atom.elem];
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
            var bondHash = {};
            for(var j = 0, jl = atom.bonds.length; j < jl; ++j) {
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
};

iCn3DUI.prototype.getSelectedResiduePDB = function () {  var me = this, ic = me.icn3d; "use strict";
   var pdbStr = '';
   pdbStr += me.getPDBHeader();

   var atoms = ic.intHash(ic.dAtoms, ic.hAtoms);
   pdbStr += me.getAtomPDB(atoms);

   return pdbStr;
};
iCn3DUI.prototype.getPDBHeader = function (struNum) {  var me = this, ic = me.icn3d; "use strict";
   if(struNum === undefined) struNum = 0;

   var pdbStr = '';
   pdbStr += 'HEADER    PDB From iCn3D'.padEnd(62, ' ') + Object.keys(ic.structures)[struNum] + '\n';
   var title = (ic.molTitle.length > 50) ? ic.molTitle.substr(0,47) + '...' : ic.molTitle;
   // remove quotes
   if(title.indexOf('"') != -1) title = '';
   pdbStr += 'TITLE     ' + title + '\n';

   return pdbStr;
};
