/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Camera} from '../display/camera.js';
import {Fog} from '../display/fog.js';
import {ApplyClbonds} from '../display/applyClbonds.js';
import {ApplyDisplay} from '../display/applyDisplay.js';
import {ApplyOther} from '../display/applyOther.js';
import {ApplySsbonds} from '../display/applySsbonds.js';

class Scene {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //This core function sets up the scene and display the structure according to the input
    //options (shown above), which is a hash containing values for different keys.
    rebuildScene(options) { var ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        this.rebuildSceneBase(options);

        ic.fogCls.setFog();

        ic.cameraCls.setCamera();

        if(ic.bSkipChemicalbinding === undefined || !ic.bSkipChemicalbinding) {
            ic.applyOtherCls.applyChemicalbindingOptions();
        }

        ic.bSkipChemicalbinding = true;

        if (options.chemicalbinding === 'show') {
            ic.opts["hbonds"] = "yes";
        }

        // show disulfide bonds, set side chains
        ic.applySsbondsCls.applySsbondsOptions();

        // show cross-linkages, set side chains
        ic.applyClbondsCls.applyClbondsOptions();

        ic.applyDisplayCls.applyDisplayOptions(ic.opts, ic.dAtoms);

        ic.applyOtherCls.applyOtherOptions();

        //ic.setFog();

        //ic.setCamera();

        //https://stackoverflow.com/questions/15726560/three-js-raycaster-intersection-empty-when-objects-not-part-of-scene
        ic.scene_ghost.updateMatrixWorld(true);
    }

    rebuildSceneBase(options) { var ic = this.icn3d, me = ic.icn3dui;
        $.extend(ic.opts, options);

        ic.cam_z = ic.maxD * 2;
        //ic.cam_z = -ic.maxD * 2;

        if(ic.scene !== undefined) {
            for(var i = ic.scene.children.length - 1; i >= 0; i--) {
                 var obj = ic.scene.children[i];
                 ic.scene.remove(obj);
            }
        }
        else {
            ic.scene = new THREE.Scene();
        }

        if(ic.scene_ghost !== undefined) {
            for(var i = ic.scene_ghost.children.length - 1; i >= 0; i--) {
                 var obj = ic.scene_ghost.children[i];
                 ic.scene_ghost.remove(obj);
            }
        }
        else {
            ic.scene_ghost = new THREE.Scene();
        }

        ic.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.6); //1.0);
        ic.directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 0.4);
        ic.directionalLight3 = new THREE.DirectionalLight(0xFFFFFF, 0.2);

        if(ic.cam_z > 0) {
          ic.directionalLight.position.set(0, 1, 1);
          ic.directionalLight2.position.set(0, -1, 1);
          ic.directionalLight3.position.set(0, 1, -1);

          ic.lightPos = new THREE.Vector3(0, 1, 1);
          ic.lightPos2 = new THREE.Vector3(0, -1, 1);
          ic.lightPos3 = new THREE.Vector3(0, 1, -1);
        }
        else {
          ic.directionalLight.position.set(0, 1, -1);
          ic.directionalLight2.position.set(0, -1, -1);
          ic.directionalLight3.position.set(0, 1, 1);

          ic.lightPos = new THREE.Vector3(0, 1, -1);
          ic.lightPos2 = new THREE.Vector3(0, -1, -1);
          ic.lightPos3 = new THREE.Vector3(0, 1, 1);
        }

        var ambientLight = new THREE.AmbientLight(0x888888); //(0x404040);

        ic.scene.add(ic.directionalLight);
        ic.scene.add(ambientLight);

        if(ic.mdl !== undefined) {
            for(var i = ic.mdl.children.length - 1; i >= 0; i--) {
                 var obj = ic.mdl.children[i];
                 if(obj.geometry) obj.geometry.dispose();
                 if(obj.material) obj.material.dispose();
                 ic.mdl.remove(obj);
            }
        }

        if(ic.mdlImpostor !== undefined) {
            for(var i = ic.mdlImpostor.children.length - 1; i >= 0; i--) {
                 var obj = ic.mdlImpostor.children[i];
                 if(obj.geometry) obj.geometry.dispose();
                 if(obj.material) obj.material.dispose();
                 ic.mdlImpostor.remove(obj);
            }

            ic.mdlImpostor.children.length = 0;
        }

        // https://discourse.threejs.org/t/correctly-remove-mesh-from-scene-and-dispose-material-and-geometry/5448/2
        // clear memory
        if(!ic.icn3dui.bNode) ic.renderer.renderLists.dispose();

        ic.mdl = new THREE.Object3D();  // regular display
        ic.mdlImpostor = new THREE.Object3D();  // Impostor display

        ic.scene.add(ic.mdl);
        ic.scene.add(ic.mdlImpostor);

        // highlight on impostors
        ic.mdl_ghost = new THREE.Object3D();  // Impostor display
        ic.scene_ghost.add(ic.mdl_ghost);

        // related to pk
        ic.objects = []; // define objects for pk, not all elements are used for pk
        ic.objects_ghost = []; // define objects for pk, not all elements are used for pk

        ic.raycaster = new THREE.Raycaster();
        ic.projector = new THREE.Projector();
        ic.mouse = new THREE.Vector2();

        var background = me.parasCls.backgroundColors[ic.opts.background.toLowerCase()];

        if(!ic.icn3dui.bNode) {
            if(ic.opts.background.toLowerCase() === 'transparent') {
                ic.renderer.setClearColor(background, 0);
            }
            else {
                ic.renderer.setClearColor(background, 1);
            }
        }

        ic.perspectiveCamera = new THREE.PerspectiveCamera(20, ic.container.whratio, 0.1, 10000);
        ic.perspectiveCamera.position.set(0, 0, ic.cam_z);
        ic.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

        ic.orthographicCamera = new THREE.OrthographicCamera();
        ic.orthographicCamera.position.set(0, 0, ic.cam_z);
        ic.orthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));

        ic.cams = {
            perspective: ic.perspectiveCamera,
            orthographic: ic.orthographicCamera,
        };
    };
}

export {Scene}
