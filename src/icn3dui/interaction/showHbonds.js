/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// between the highlighted and atoms in nameArray
iCn3DUI.prototype.showHbonds = function (threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var me = this, ic = me.icn3d; "use strict";
    if(bHbondCalc) return;
    var hbonds_saltbridge, select;
    if(bSaltbridge) {
        hbonds_saltbridge = 'saltbridge';
        select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
    }
    else {
        hbonds_saltbridge = 'hbonds';
        select = 'hbonds ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
    }
    ic.opts[hbonds_saltbridge] = "yes";
    ic.opts["water"] = "dot";
    var firstSetAtoms, complement;
    firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
    complement = me.getAtomsFromNameArray(nameArray);
    var firstAtom = ic.getFirstAtomObj(firstSetAtoms);
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var selectedAtoms = ic.calculateChemicalHbonds(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge );
        var commanddesc;
        if(bSaltbridge) {
            me.resid2ResidhashSaltbridge = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have salt bridges with the selected atoms';
        }
        else {
            me.resid2ResidhashHbond = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
        }
        var residues = {}, atomArray = undefined;
        for (var i in selectedAtoms) {
            var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueid] = 1;
        }
        ic.hAtoms = {};
        for(var resid in residues) {
            for(var i in ic.residues[resid]) {
                ic.hAtoms[i] = 1;
                ic.atoms[i].style2 = 'stick';
                //ic.atoms[i].style2 = 'lines';
            }
        }
        var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        var nameArray = [commandname];
        me.saveSelectionIfSelected();
        ic.draw();
    }
};
