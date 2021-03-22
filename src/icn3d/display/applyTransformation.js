/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.clearImpostors = function () {
    this.posArray = [];
    this.colorArray = [];
    this.pos2Array = [];
    this.color2Array = [];
    this.radiusArray = [];

    this.posArraySphere = [];
    this.colorArraySphere = [];
    this.radiusArraySphere = [];
};

iCn3D.prototype.applyTransformation = function (_zoomFactor, mouseChange, quaternion) {
    var para = {};
    para.update = false;

    // zoom
    para._zoomFactor = _zoomFactor;

    // translate
    para.mouseChange = new THREE.Vector2();
    para.mouseChange.copy(mouseChange);

    // rotation
    para.quaternion = new THREE.Quaternion();
    para.quaternion.copy(quaternion);

    if(this.bControlGl) {
        window.controls.update(para);
    }
    else {
        this.controls.update(para);
    }
};

