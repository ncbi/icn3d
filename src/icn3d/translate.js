/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// translate
iCn3D.prototype.translateLeft = function (percentScreenSize) {  var me = this, ic = me.icn3d; "use strict";
    me.translate_base(-percentScreenSize, 0);
};

iCn3D.prototype.translateRight = function (percentScreenSize) {  var me = this, ic = me.icn3d; "use strict";
    me.translate_base(percentScreenSize, 0);
};

iCn3D.prototype.translateUp = function (percentScreenSize) {  var me = this, ic = me.icn3d; "use strict";
    me.translate_base(0, -percentScreenSize);
};

iCn3D.prototype.translateDown = function (percentScreenSize) {  var me = this, ic = me.icn3d; "use strict";
    me.translate_base(0, percentScreenSize);
};

iCn3D.prototype.translate_base = function (x, y) {  var me = this, ic = me.icn3d; "use strict";
  var mouseChange = new THREE.Vector2(0,0);

  mouseChange.x += x / 100.0;
  mouseChange.y += y / 100.0;

  var para = {};
  para.mouseChange = mouseChange;
  para.update = true;

  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }

  if(this.bRender) this.render();
};
