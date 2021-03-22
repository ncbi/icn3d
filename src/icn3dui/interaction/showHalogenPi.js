/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showHalogenPi = function (threshold, nameArray2, nameArray, bHbondCalc, type, interactionType) { var me = this, ic = me.icn3d; "use strict";
    if(bHbondCalc) return;
    var select = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
    ic.opts[interactionType] = "yes";
    var firstSetAtoms, complement;
    firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
    complement = me.getAtomsFromNameArray(nameArray);
    var firstAtom = ic.getFirstAtomObj(firstSetAtoms);
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), type, interactionType );
        var commanddesc;
        if(interactionType == 'halogen') {
            me.resid2ResidhashHalogen = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have halogen bonds with the selected atoms';
        }
        else if(interactionType == 'pi-cation') {
            me.resid2ResidhashPication = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have pi-cation interactions with the selected atoms';
        }
        else if(interactionType == 'pi-stacking') {
            me.resid2ResidhashPistacking = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have pi-stacking with the selected atoms';
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
                if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                //ic.atoms[i].style2 = 'lines';
            }
        }
        var commandname = interactionType + '_' + firstAtom.serial;
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        var nameArray = [commandname];
        me.saveSelectionIfSelected();
        ic.draw();
    }
};
