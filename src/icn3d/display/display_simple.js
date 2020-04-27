/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.rebuildScene = function (options) { var me = this; //"use strict";
    this.rebuildSceneBase(options);

    this.applyDisplayOptions(this.opts, this.dAtoms);
    this.applyCenterOptions();

    this.setCamera();

    //https://stackoverflow.com/questions/15726560/three-js-raycaster-intersection-empty-when-objects-not-part-of-scene
    me.scene_ghost.updateMatrixWorld(true);
};

iCn3D.prototype.draw = function () { var me = this; //"use strict";
    this.rebuildScene();

    // Impostor display using the saved arrays
    if(this.bImpo) {
        this.drawImpostorShader();
    }

    if(this.biomtMatrices !== undefined && this.biomtMatrices.length > 1) {
        if(this.bAssembly) {
            this.drawSymmetryMates();
        }
        else {
            this.centerSelection();
        }
    }

    // show the hAtoms
    if(this.cnt <= this.maxmaxatomcnt && this.hAtoms !== undefined && Object.keys(this.hAtoms).length > 0 && Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
        this.removeHlObjects();
        if(this.bShowHighlight === undefined || this.bShowHighlight) this.addHlObjects();
    }

    if(this.bRender === true) {
      if($("#" + this.pre + "wait")) $("#" + this.pre + "wait").hide();
      if($("#" + this.pre + "canvas")) $("#" + this.pre + "canvas").show();
      if($("#" + this.pre + "cmdlog")) $("#" + this.pre + "cmdlog").show();

      this.applyTransformation(this._zoomFactor, this.mouseChange, this.quaternion);
      this.render();
    }

    this.clearImpostors();
};
