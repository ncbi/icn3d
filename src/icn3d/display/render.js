/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.render = function () {
    var cam = (this.bControlGl) ? window.cam : this.cam;

//    if(this.bShade) {
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors( new THREE.Vector3(0, 0, this.cam_z).normalize(), cam.position.clone().normalize() );

        this.directionalLight.position.copy(this.lightPos.clone().applyQuaternion( quaternion ).normalize());
        this.directionalLight2.position.copy(this.lightPos2.clone().applyQuaternion( quaternion ).normalize());
        this.directionalLight3.position.copy(this.lightPos3.clone().applyQuaternion( quaternion ).normalize());
//    }
//    else {
//        this.directionalLight.position.copy(cam.position);
//    }

    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true

    this.renderer.setPixelRatio( window.devicePixelRatio ); // r71
    if(this.scene) this.renderer.render(this.scene, cam);
};

