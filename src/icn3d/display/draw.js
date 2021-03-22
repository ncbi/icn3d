/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.draw = function () { var me = this, ic = me.icn3d; "use strict";
    this.rebuildScene();

    // Impostor display using the saved arrays
    if(this.bImpo) {
        this.drawImpostorShader(); // target
    }

    this.applyPrevColor();

    if(this.biomtMatrices !== undefined && this.biomtMatrices.length > 1) {
        if(this.bAssembly) {
            this.drawSymmetryMates();
        }
        else {
            this.centerSelection();
        }
    }

    // show the hAtoms
    var hAtomsLen = (this.hAtoms !== undefined) ? Object.keys(this.hAtoms).length : 0;

    if(hAtomsLen > 0 && hAtomsLen < Object.keys(this.dAtoms).length) {
        this.removeHlObjects();
        if(this.bShowHighlight === undefined || this.bShowHighlight) this.addHlObjects();
    }

    if(this.bRender === true) {
      if(this.bInitial || $("#" + this.pre + "wait").is(":visible")) {
          if($("#" + this.pre + "wait")) $("#" + this.pre + "wait").hide();
          if($("#" + this.pre + "canvas")) $("#" + this.pre + "canvas").show();
          if($("#" + this.pre + "cmdlog")) $("#" + this.pre + "cmdlog").show();
      }

      this.applyTransformation(this._zoomFactor, this.mouseChange, this.quaternion);
      this.render();
    }

    this.clearImpostors();
};

iCn3D.prototype.updateStabilizer = function () { var me = this, ic = me.icn3d; "use strict";
    this.stabilizerpnts = [];

    if(this.pairArray !== undefined) {
        for(var i = 0, il = this.pairArray.length; i < il; i += 2) {
            var coordI = this.getResidueRepPos(this.pairArray[i]);
            var coordJ = this.getResidueRepPos(this.pairArray[i + 1]);

            this.stabilizerpnts.push(coordI);
            this.stabilizerpnts.push(coordJ);
        }
    }
};

