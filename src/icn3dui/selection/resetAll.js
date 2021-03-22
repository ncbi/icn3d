/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.resetAll = function() { var me = this, ic = me.icn3d; "use strict";
    //location.reload();
    ic.reinitAfterLoad();
    me.renderFinalStep(1);

    // need to render
    if(ic.bRender) ic.render();
};
