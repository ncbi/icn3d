/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// zoom
iCn3D.prototype.zoomIn = function (normalizedFactor) {  var me = this, ic = me.icn3d; "use strict";
  var para = {};
  para._zoomFactor = 1 - normalizedFactor;
  para.update = true;
  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }

  if(this.bRender) this.render();
};

iCn3D.prototype.zoomOut = function (normalizedFactor) {  var me = this, ic = me.icn3d; "use strict";
  var para = {};
  para._zoomFactor = 1 + normalizedFactor;
  para.update = true;

  if(this.bControlGl) {
      window.controls.update(para);
  }
  else {
      this.controls.update(para);
  }
  if(this.bRender) this.render();
};
