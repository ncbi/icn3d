/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.rebuildScene = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    this.rebuildSceneBase(options);

    this.setFog();

    this.setCamera();

    if(this.bSkipChemicalbinding === undefined || !this.bSkipChemicalbinding) this.applyChemicalbindingOptions();
    this.bSkipChemicalbinding = true;

    if (options.chemicalbinding === 'show') {
        this.opts["hbonds"] = "yes";
    }

    // show disulfide bonds, set side chains
    this.applySsbondsOptions();

    // show cross-linkages, set side chains
    this.applyClbondsOptions();

    this.applyDisplayOptions(this.opts, this.dAtoms);

    this.applyOtherOptions();

    //this.setFog();

    //this.setCamera();

    //https://stackoverflow.com/questions/15726560/three-js-raycaster-intersection-empty-when-objects-not-part-of-scene
    me.scene_ghost.updateMatrixWorld(true);
};

iCn3D.prototype.rebuildSceneBase = function (options) { var me = this, ic = me.icn3d; "use strict";
    jQuery.extend(me.opts, options);

    this.cam_z = this.maxD * 2;
    //this.cam_z = -this.maxD * 2;

    if(this.scene !== undefined) {
        for(var i = this.scene.children.length - 1; i >= 0; i--) {
             var obj = this.scene.children[i];
             this.scene.remove(obj);
        }
    }
    else {
        this.scene = new THREE.Scene();
    }

    if(this.scene_ghost !== undefined) {
        for(var i = this.scene_ghost.children.length - 1; i >= 0; i--) {
             var obj = this.scene_ghost.children[i];
             this.scene_ghost.remove(obj);
        }
    }
    else {
        this.scene_ghost = new THREE.Scene();
    }

/*
    if(!this.bShade) {
        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);

        if(this.cam_z > 0) {
          this.directionalLight.position.set(0, 0, 1);
        }
        else {
          this.directionalLight.position.set(0, 0, -1);
        }
    }
    else {
*/
        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        this.directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 0.4);
        this.directionalLight3 = new THREE.DirectionalLight(0xFFFFFF, 0.2);

        if(this.cam_z > 0) {
          this.directionalLight.position.set(0, 1, 1);
          this.directionalLight2.position.set(0, -1, 1);
          this.directionalLight3.position.set(0, 1, -1);

          this.lightPos = new THREE.Vector3(0, 1, 1);
          this.lightPos2 = new THREE.Vector3(0, -1, 1);
          this.lightPos3 = new THREE.Vector3(0, 1, -1);
        }
        else {
          this.directionalLight.position.set(0, 1, -1);
          this.directionalLight2.position.set(0, -1, -1);
          this.directionalLight3.position.set(0, 1, 1);

          this.lightPos = new THREE.Vector3(0, 1, -1);
          this.lightPos2 = new THREE.Vector3(0, -1, -1);
          this.lightPos3 = new THREE.Vector3(0, 1, 1);
        }
//    }

    //var ambientLight = new THREE.AmbientLight(0x202020);
    //var ambientLight = new THREE.AmbientLight(0xdddddd, 0.2);
    var ambientLight = new THREE.AmbientLight(0x404040);

    this.scene.add(this.directionalLight);
    this.scene.add(ambientLight);

    this.mdl = new THREE.Object3D();  // regular display
    this.mdlImpostor = new THREE.Object3D();  // Impostor display

    this.scene.add(this.mdl);
    this.scene.add(this.mdlImpostor);

    // highlight on impostors
    this.mdl_ghost = new THREE.Object3D();  // Impostor display
    this.scene_ghost.add(this.mdl_ghost);

    // related to pk
    this.objects = []; // define objects for pk, not all elements are used for pk
    this.objects_ghost = []; // define objects for pk, not all elements are used for pk

    this.raycaster = new THREE.Raycaster();
    this.projector = new THREE.Projector();
    this.mouse = new THREE.Vector2();

    var background = this.backgroundColors[this.opts.background.toLowerCase()];

    if(this.opts.background.toLowerCase() === 'transparent') {
        this.renderer.setClearColor(background, 0);
    }
    else {
        this.renderer.setClearColor(background, 1);
    }

    this.perspectiveCamera = new THREE.PerspectiveCamera(20, this.container.whratio, 0.1, 10000);
    this.perspectiveCamera.position.set(0, 0, this.cam_z);
    this.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.orthographicCamera = new THREE.OrthographicCamera();
    this.orthographicCamera.position.set(0, 0, this.cam_z);
    this.orthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));

    this.cams = {
        perspective: this.perspectiveCamera,
        orthographic: this.orthographicCamera,
    };
};
