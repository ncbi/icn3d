/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.showAll = function() { var me = this, ic = me.icn3d; "use strict";
       ic.dAtoms = ic.cloneHash(ic.atoms);
       ic.maxD = ic.oriMaxD;
       ic.draw();
};
