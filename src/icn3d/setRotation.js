/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setRotation = function(axis, angle) { var me = this, ic = me.icn3d; "use strict";
      if(me.bControlGl) {
          axis.applyQuaternion( window.cam.quaternion ).normalize();
      }
      else {
          axis.applyQuaternion( me.cam.quaternion ).normalize();
      }

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      var para = {};
      para.quaternion = quaternion;
      para.update = true;

      if(me.bControlGl) {
          window.controls.update(para);
      }
      else {
          me.controls.update(para);
      }

      if(me.bRender) me.render();
};

