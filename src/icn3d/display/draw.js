/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Scene} from '../display/scene.js';
import {Impostor} from '../geometry/impostor.js';
import {Instancing} from '../geometry/instancing.js';
import {SetColor} from '../display/setColor.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {HlObjects} from '../highlight/hlObjects.js';

class Draw {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Draw the 3D structure. It rebuilds scene, applies previous color, applies the transformation, and renders the image.
    draw() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bRender && (!ic.hAtoms || Object.keys(ic.hAtoms) == 0)) ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

        ic.sceneCls.rebuildScene();

        // Impostor display using the saved arrays
        if(ic.bImpo) {
            ic.impostorCls.drawImpostorShader(); // target
        }

        ic.setColorCls.applyPrevColor();

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
            if(ic.bAssembly) {
                ic.instancingCls.drawSymmetryMates();
            }
            else {
                ic.applyCenterCls.centerSelection();
            }
        }

        // show the hAtoms
        let hAtomsLen = (ic.hAtoms !== undefined) ? Object.keys(ic.hAtoms).length : 0;

        if(hAtomsLen > 0 && hAtomsLen < Object.keys(ic.dAtoms).length) {
            ic.hlObjectsCls.removeHlObjects();
            if(ic.bShowHighlight === undefined || ic.bShowHighlight) ic.hlObjectsCls.addHlObjects();
        }

        if(ic.bRender === true) {
          if(ic.bInitial || $("#" + ic.pre + "wait").is(":visible")) {
              if($("#" + ic.pre + "wait")) $("#" + ic.pre + "wait").hide();
              if($("#" + ic.pre + "canvas")) $("#" + ic.pre + "canvas").show();
              if($("#" + ic.pre + "cmdlog")) $("#" + ic.pre + "cmdlog").show();
          }

          this.applyTransformation(ic._zoomFactor, ic.mouseChange, ic.quaternion);
          this.render();
        }

        ic.impostorCls.clearImpostors();
    }

    //Update the rotation, translation, and zooming before rendering. Typically used before the function render().
    applyTransformation(_zoomFactor, mouseChange, quaternion) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let para = {};
        para.update = false;

        // zoom
        para._zoomFactor = _zoomFactor;

        // translate
        para.mouseChange = new THREE.Vector2();
        para.mouseChange.copy(mouseChange);

        // rotation
        para.quaternion = new THREE.Quaternion();
        para.quaternion.copy(quaternion);

        if(ic.bControlGl && !ic.icn3dui.bNode) {
            window.controls.update(para);
        }
        else {
            ic.controls.update(para);
        }
    }

    //Render the scene and objects into pixels.
    render() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let cam = (ic.bControlGl && !ic.icn3dui.bNode) ? window.cam : ic.cam;

    //    if(ic.bShade) {
        if(ic.directionalLight) {
            let quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors( new THREE.Vector3(0, 0, ic.cam_z).normalize(), cam.position.clone().normalize() );

            ic.directionalLight.position.copy(ic.lightPos.clone().applyQuaternion( quaternion ).normalize());
            ic.directionalLight2.position.copy(ic.lightPos2.clone().applyQuaternion( quaternion ).normalize());
            ic.directionalLight3.position.copy(ic.lightPos3.clone().applyQuaternion( quaternion ).normalize());
        }
    //    }
    //    else {
    //        ic.directionalLight.position.copy(cam.position);
    //    }

//        ic.renderer.gammaInput = true
//        ic.renderer.gammaOutput = true

        ic.renderer.setPixelRatio( window.devicePixelRatio ); // r71
        if(ic.scene) ic.renderer.render(ic.scene, cam);
    }

}

export {Draw}

