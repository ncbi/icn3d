/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectAll = function() { var me = this, ic = me.icn3d; "use strict";
    me.selectAll_base();

    ic.removeHlObjects();
    me.removeHl2D();
    me.removeHlMenus();

    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;

    me.removeSeqResidueBkgd();
    me.update2DdgmContent();

    // show annotations for all protein chains
    $("#" + me.pre + "dl_annotations > .icn3d-annotation").show();

    me.setMode('all');
};

iCn3DUI.prototype.selectAll_base = function() { var me = this, ic = me.icn3d; "use strict";
    ic.hAtoms = {};
    ic.dAtoms = {};

    for(var i in ic.chains) {
       ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[i]);
       ic.dAtoms = ic.unionHash(ic.dAtoms, ic.chains[i]);
    }
};
