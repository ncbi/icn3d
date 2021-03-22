/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.removeSelection = function() { var me = this, ic = me.icn3d; "use strict";
    if(!me.bAnnotations) {
        me.removeSeqChainBkgd();
    }

    if(!ic.bCtrl && !ic.bShift) {
        me.removeSeqResidueBkgd();

        me.removeSeqChainBkgd();
    }

      me.selectedResidues = {};
      me.bSelectResidue = false;

      ic.hAtoms = {};

      ic.removeHlObjects();

      me.removeHl2D();
};
