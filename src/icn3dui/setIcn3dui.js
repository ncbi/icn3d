/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.setIcn3dui = function(id) { var me = this, ic = me.icn3d; "use strict";
       var idArray = id.split('_'); // id: div0_reload_pdbfile
       me.pre = idArray[0] + "_";
       if(window.icn3duiHash !== undefined && window.icn3duiHash.hasOwnProperty(idArray[0])) { // for multiple 3D display
          me = window.icn3duiHash[idArray[0]];
       }
       return me;
};
