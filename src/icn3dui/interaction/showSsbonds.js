/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// show all disulfide bonds
iCn3DUI.prototype.showSsbonds = function () { var me = this, ic = me.icn3d; "use strict";
     ic.opts["ssbonds"] = "yes";
     var select = 'disulfide bonds';
//         me.removeHlMenus();
     var residues = {}, atomArray = undefined;
     var structureArray = Object.keys(ic.structures);
     for(var s = 0, sl = structureArray.length; s < sl; ++s) {
         var structure = structureArray[s];
         if(ic.ssbondpnts[structure] === undefined) continue;
         for (var i = 0, lim = Math.floor(ic.ssbondpnts[structure].length / 2); i < lim; i++) {
            var res1 = ic.ssbondpnts[structure][2 * i], res2 = ic.ssbondpnts[structure][2 * i + 1];
            residues[res1] = 1;
            residues[res2] = 1;
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[res1]);
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[res2]);
        }
    }
    if(Object.keys(residues).length > 0) {
        var commandname = 'ssbonds';
        var commanddesc = 'all atoms that have disulfide bonds';
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        var nameArray = [commandname];
        //me.changeCustomResidues(nameArray);
        me.saveSelectionIfSelected();
        // show side chains for the selected atoms
        //me.setStyle('sidec', 'stick');
        ic.draw();
    }
};
