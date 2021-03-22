/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// show all cross-linkages bonds
iCn3DUI.prototype.showClbonds = function () { var me = this, ic = me.icn3d; "use strict";
     ic.opts["clbonds"] = "yes";
     var select = 'cross linkage';
     // find all bonds to chemicals
     var residues = ic.applyClbondsOptions();
     for(var resid in residues) {
         ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);
     }
     if(Object.keys(residues).length > 0) {
        var commandname = 'clbonds';
        var commanddesc = 'all atoms that have cross-linkages';
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        var nameArray = [commandname];
        //me.changeCustomResidues(nameArray);
        me.saveSelectionIfSelected();
        // show side chains for the selected atoms
        //me.setStyle('sidec', 'stick');
        ic.draw();
     }
};
