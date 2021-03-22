/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setCenter = function(center) { var me = this, ic = me.icn3d; "use strict";
   //if(!this.bChainAlign) {
       this.mdl.position.set(0,0,0);
       this.mdlImpostor.position.set(0,0,0);
       this.mdl_ghost.position.set(0,0,0);

       this.mdl.position.sub(center);
       //this.mdlPicking.position.sub(center);
       this.mdlImpostor.position.sub(center);
       this.mdl_ghost.position.sub(center);
   //}
};
