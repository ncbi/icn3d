/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.saveSelection = function(name, description) { var me = this, ic = me.icn3d; "use strict";
    me.selectedResidues = {};

    me.selectedResidues = ic.getResiduesFromCalphaAtoms(ic.hAtoms);

    if(Object.keys(me.selectedResidues).length > 0) {
        if(ic.pk == 1) {
            var bAtom = true;
            me.selectResidueList(ic.hAtoms, name, description,undefined, undefined, bAtom);
            //me.updateHlAll();

            me.updateSelectionNameDesc();

            me.setLogCmd('select ' + me.atoms2spec(ic.hAtoms) + ' | name ' + name, true);
        }
        else {
            me.selectResidueList(me.selectedResidues, name, description);
            //me.updateHlAll();

            me.updateSelectionNameDesc();

            me.setLogCmd('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name, true);
        }
    }
};
