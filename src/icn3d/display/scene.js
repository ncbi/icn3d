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

// The following four files are for VR view:
import {VRButton} from "../../thirdparty/three/vr/VRButton.js";
import {ARButton} from "../../thirdparty/three/vr/ARButton.js";
import {GLTFLoader} from "../../thirdparty/three/vr/GLTFLoader.js";
import {Constants, MotionController, fetchProfile, fetchProfilesList} from "../../thirdparty/three/vr/motion-controllers.module.js";
import {XRControllerModelFactory} from "../../thirdparty/three/vr/XRControllerModelFactory.js";
import {ControllerGestures} from "../../thirdparty/three/vr/ControllerGestures.js";

class Scene {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //This core function sets up the scene and display the structure according to the input
    //options (shown above), which is a hash containing values for different keys.
    rebuildScene(options) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        this.rebuildSceneBase(options);

        ic.fogCls.setFog();

        ic.cameraCls.setCamera();

        this.setVrAr();

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

    rebuildSceneBase(options) { let ic = this.icn3d, me = ic.icn3dui;
        $.extend(ic.opts, options);

        ic.cam_z = ic.maxD * 2;
        //ic.cam_z = -ic.maxD * 2;

        if(ic.scene !== undefined) {
            for(let i = ic.scene.children.length - 1; i >= 0; i--) {
                 let obj = ic.scene.children[i];
                 ic.scene.remove(obj);
            }
        }
        else {
            ic.scene = new THREE.Scene();
        }

        if(ic.scene_ghost !== undefined) {
            for(let i = ic.scene_ghost.children.length - 1; i >= 0; i--) {
                 let obj = ic.scene_ghost.children[i];
                 ic.scene_ghost.remove(obj);
            }
        }
        else {
            ic.scene_ghost = new THREE.Scene();
        }

        // get parameters from cookies
        if(me.htmlCls.setHtmlCls.getCookie('shininess') != '') {
            let shininess = parseFloat(me.htmlCls.setHtmlCls.getCookie('shininess'));

            if(ic.shininess != shininess) {
                me.htmlCls.clickMenuCls.setLogCmd('set shininess ' + shininess, true);
            }

            ic.shininess = shininess;
        }

        if(!me.bNode && me.htmlCls.setHtmlCls.getCookie('light1') != '') {
            let light1 = parseFloat(me.htmlCls.setHtmlCls.getCookie('light1'));
            let light2 = parseFloat(me.htmlCls.setHtmlCls.getCookie('light2'));
            let light3 = parseFloat(me.htmlCls.setHtmlCls.getCookie('light3'));

            if(ic.light1 != light1 || ic.light2 != light2 || ic.light3 != light3) {
                me.htmlCls.clickMenuCls.setLogCmd('set light | light1 ' + light1 + ' | light2 ' + light2 + ' | light3 ' + light3, true);
            }

            ic.light1 = light1;
            ic.light2 = light2;
            ic.light3 = light3;
        }

        ic.directionalLight = new THREE.DirectionalLight(0xFFFFFF, ic.light1); //1.0);
        ic.directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, ic.light2);
        ic.directionalLight3 = new THREE.DirectionalLight(0xFFFFFF, ic.light3);

        if(ic.cam_z > 0) {
          ic.directionalLight.position.set(-1, 1, 1); //(0, 1, 1);
          ic.directionalLight2.position.set(1, 1, 1); //(0, -1, 1);
          ic.directionalLight3.position.set(1, 1, -1); //(0, 1, -1);

          ic.lightPos = new THREE.Vector3(-1, 1, 1); //(0, 1, 1);
          ic.lightPos2 = new THREE.Vector3(1, 1, 1); //(0, -1, 1);
          ic.lightPos3 = new THREE.Vector3(1, 1, -1); //(0, 1, -1);
        }
        else {
          ic.directionalLight.position.set(-1, 1, -1); //(0, 1, -1);
          ic.directionalLight2.position.set(1, 1, -1); //(0, -1, -1);
          ic.directionalLight3.position.set(1, 1, 1); //(0, 1, 1);

          ic.lightPos = new THREE.Vector3(-1, 1, -1); //(0, 1, -1);
          ic.lightPos2 = new THREE.Vector3(1, 1, -1); //(0, -1, -1);
          ic.lightPos3 = new THREE.Vector3(1, 1, 1); //(0, 1, 1);
        }

        let ambientLight = new THREE.AmbientLight(0x888888); //(0x404040);

        ic.scene.add(ic.directionalLight);
        ic.scene.add(ambientLight);

        if(ic.mdl !== undefined) {
            for(let i = ic.mdl.children.length - 1; i >= 0; i--) {
                 let obj = ic.mdl.children[i];
                 if(obj.geometry) obj.geometry.dispose();
                 if(obj.material) obj.material.dispose();
                 ic.mdl.remove(obj);
            }
        }

        if(ic.mdlImpostor !== undefined) {
            for(let i = ic.mdlImpostor.children.length - 1; i >= 0; i--) {
                 let obj = ic.mdlImpostor.children[i];
                 if(obj.geometry) obj.geometry.dispose();
                 if(obj.material) obj.material.dispose();
                 ic.mdlImpostor.remove(obj);
            }

            ic.mdlImpostor.children.length = 0;
        }

        // https://discourse.threejs.org/t/correctly-remove-mesh-from-scene-and-dispose-material-and-geometry/5448/2
        // clear memory
        if(!me.bNode) ic.renderer.renderLists.dispose();

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

        let background = me.parasCls.backgroundColors[ic.opts.background.toLowerCase()];

        if(!me.bNode) {
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

    setVrAr() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // https://github.com/NikLever/Learn-WebXR/tree/master/start
        // https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_cones.html
        // https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_cubes.html

        if(ic.bVr) {
/*            
            ic.raycasterVR = new THREE.Raycaster();
            ic.workingMatrix = new THREE.Matrix4();
            ic.workingVector = new THREE.Vector3();
            ic.origin = new THREE.Vector3();

            let radius = 0.08;
            let geometry = new THREE.IcosahedronBufferGeometry( radius, 2 );
            ic.highlightVR = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } ) );
            ic.highlightVR.scale.set(1.2, 1.2, 1.2);        
*/
            // add dolly to move camera
            ic.dolly = new THREE.Object3D();
            ic.dolly.position.z = 5;
            ic.dolly.add(ic.cam);
            ic.scene.add(ic.dolly);

            ic.dummyCam = new THREE.Object3D();
            ic.cam.add(ic.dummyCam);

            ic.clock = new THREE.Clock();

            //controllers
            ic.controllers = this.getControllers();

            function onSelectStart() {
//                this.children[0].scale.z = 10;
                this.userData.selectPressed = true;
            }
    
            function onSelectEnd() {
//                this.children[0].scale.z = 0;
//                ic.highlightVR.visible = false;
                this.userData.selectPressed = false;
            }
/*
            function buildController( data ) {
                let geometry, material;
            
                switch ( data.targetRayMode ) {
                    case 'tracked-pointer':
                        geometry = new THREE.BufferGeometry();
                        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
                        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
            
                        material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
            
                        return new THREE.Line( geometry, material );
            
                    case 'gaze':
                        geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
                        material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
                        return new THREE.Mesh( geometry, material );
                }
            }
*/
            ic.controllers.forEach( (controller) => {
                controller.addEventListener( 'selectstart', onSelectStart );
                controller.addEventListener( 'selectend', onSelectEnd );
/*                
                controller.addEventListener( 'connected', function ( event ) {
                    const mesh = buildController(event.data);
                    mesh.scale.z = 0;
                    this.add( mesh );
                } );
                controller.addEventListener( 'disconnected', function () {
                    this.remove( this.children[ 0 ] );
                    ic.controllers.forEach( (controllerTmp) => {
                        controllerTmp = null;
                    });
                    //self.controllerGrip = null;
                } );
*/                
            });         
        }      
        else if(ic.bAr) {
            //Add gestures here
            ic.gestures = new ControllerGestures(ic.renderer);
            ic.scene.add(ic.gestures.controller1);
            ic.scene.add(ic.gestures.controller2);

            ic.gestures.addEventListener('tap', (ev) => {
                //if(!ic.mdl.visible) {
                //    ic.mdl.visible = true;
                //}

                const controller = ic.gestures.controller1; 
                //ic.mdl.position.set( 0, 0, - 0.3 ).applyMatrix4( controller.matrixWorld );
                ic.mdl.position.set( -0.03, 0, - 0.3 ).applyMatrix4( controller.matrixWorld );
                //ic.mdl.scale.copy(ic.mdl.scale.multiplyScalar(0.1));
                ic.mdl.scale.copy(new THREE.Vector3( 0.001, 0.001, 0.001 ));  
            });

            ic.gestures.addEventListener('doubletap', (ev) => {
                const controller = ic.gestures.controller1; 
                //ic.mdl.position.set( 0, 0, - 0.3 ).applyMatrix4( controller.matrixWorld );
                ic.mdl.position.set( -0.06, 0, - 0.6 ).applyMatrix4( controller.matrixWorld );
                //ic.mdl.scale.copy(ic.mdl.scale.multiplyScalar(10));
                ic.mdl.scale.copy(new THREE.Vector3( 0.005, 0.005, 0.005 )); 
            });
/*
            ic.gestures.addEventListener('swipe', (ev) => {
                // if(ic.mdl.visible) {
                //     ic.mdl.visible = false;
                // }
            });
  
            ic.gestures.addEventListener('pan', (ev) => {
                // if(ev.initialise !== undefined) {
                //     thisClass.startPosition = ic.mdl.position.clone();
                // }
                // else {
                //     const pos = thisClass.startPosition.clone().add(ev.delta.multiplyScalar(3));
                //     ic.mdl.position.copy(pos);
                // }
            });

            ic.gestures.addEventListener('pinch', (ev) => {
                // if(ev.initialise !== undefined) {
                //     thisClass.startScale = ic.mdl.scale.clone();                   
                // }
                // else {
                //     const scale = thisClass.startScale.clone().multiplyScalar(ev.scale);                  
                //     ic.mdl.scale.copy(scale);
                // }
            });
 
            ic.gestures.addEventListener('rotate', (ev) => {
                // if(ev.initialise !== undefined) {
                //     thisClass.startQuaternion = ic.mdl.quaternion.clone();
                // }
                // else {
                //     ic.mdl.quaternion.copy(thisClass.startQuaternion);
                //     ic.mdl.rotateY(ev.theta);
                // }
            });  
*/                            
        }

        $("#" + me.pre + "VRButton").remove();
        $("#" + me.pre + "viewer").get(0).appendChild( ic.VRButtonCls.createButton( ic.renderer ) );

        $("#" + me.pre + "ARButton").remove();
        $("#" + me.pre + "viewer").get(0).appendChild( ic.ARButtonCls.createButton( ic.renderer ) );
    }

    getControllers() { let ic = this.icn3d, me = ic.icn3dui;
        const controllerModelFactory = new XRControllerModelFactory();
/*        
        const geometry = new THREE.BufferGeometry().setFromPoints( [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,-1)
        ]);
        const line = new THREE.Line( geometry );
        line.name = 'line';
        line.scale.z = 0;
*/

        const controllers = [];
        
        for(let i=0; i<=1; i++){
            const controller = ic.renderer.xr.getController( i );
            ic.dolly.add( controller );

//            controller.add( line.clone() );
            controller.userData.selectPressed = false;
            ic.scene.add(controller);
            
            controllers.push( controller );
            
            const grip = ic.renderer.xr.getControllerGrip( i );
            grip.add( controllerModelFactory.createControllerModel( grip ));
            ic.scene.add( grip );
        }
        
        return controllers;
    }
}

export {Scene}
