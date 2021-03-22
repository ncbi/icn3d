/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// rotate
iCn3D.prototype.rotateLeft = function (degree) {  var me = this, ic = me.icn3d; "use strict";
  var axis = new THREE.Vector3(0,1,0);
  var angle = -degree / 180.0 * Math.PI;

  if(me.bControlGl) {
      axis.applyQuaternion( window.cam.quaternion ).normalize();
  }
  else {
      axis.applyQuaternion( this.cam.quaternion ).normalize();
  }

  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle( axis, -angle );

  var para = {};
  para.quaternion = quaternion;
  para.update = true;

  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }

  if(this.bRender) this.render();
};

iCn3D.prototype.rotateRight = function (degree) {  var me = this, ic = me.icn3d; "use strict";
  var axis = new THREE.Vector3(0,1,0);
  var angle = degree / 180.0 * Math.PI;

  if(me.bControlGl) {
      axis.applyQuaternion( window.cam.quaternion ).normalize();
  }
  else {
      axis.applyQuaternion( this.cam.quaternion ).normalize();
  }

  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle( axis, -angle );

  var para = {};
  para.quaternion = quaternion;
  para.update = true;

  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }

  if(this.bRender) this.render();
};

iCn3D.prototype.rotateUp = function (degree) {  var me = this, ic = me.icn3d; "use strict";
    me.rotate_base(-degree);
};

iCn3D.prototype.rotateDown = function (degree) {  var me = this, ic = me.icn3d; "use strict";
    me.rotate_base(degree);
};

iCn3D.prototype.rotate_base = function (degree) {  var me = this, ic = me.icn3d; "use strict";
  var axis = new THREE.Vector3(1,0,0);
  var angle = degree / 180.0 * Math.PI;

  if(me.bControlGl) {
      axis.applyQuaternion( window.cam.quaternion ).normalize();
  }
  else {
      axis.applyQuaternion( this.cam.quaternion ).normalize();
  }

  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle( axis, -angle );

  var para = {};
  para.quaternion = quaternion;
  para.update = true;

  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }

  if(this.bRender) this.render();
};
