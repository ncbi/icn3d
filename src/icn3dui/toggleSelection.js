/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.toggleSelection = function () { var me = this, ic = me.icn3d; "use strict";
    if(me.bHideSelection) {
        for(var i in ic.dAtoms) {
            if(ic.hAtoms.hasOwnProperty(i)) delete ic.dAtoms[i];
        }
          me.bHideSelection = false;
    }
    else {
        ic.dAtoms = ic.unionHash(ic.dAtoms, ic.hAtoms);
          me.bHideSelection = true;
    }
    ic.draw();
};
