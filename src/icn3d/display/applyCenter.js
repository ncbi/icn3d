/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Camera} from '../display/camera.js';

class ApplyCenter {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyCenterOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        let center;
        switch (options.rotationcenter.toLowerCase()) {
            case 'molecule center':
                // move the molecule to the origin
                if(ic.center !== undefined) {
                    this.setRotationCenter(ic.center);
                }
                break;
            case 'pick center':
                if(ic.pAtom !== undefined) {
                  this.setRotationCenter(ic.pAtom.coord);
                }
                break;
            case 'display center':
                center = this.centerAtoms(ic.dAtoms).center;
                this.setRotationCenter(center);
                break;
            case 'highlight center':
                center = this.centerAtoms(ic.hAtoms).center;
                this.setRotationCenter(center);
                break;
        }
    }

    //Set the center at the position with coordinated "coord".
    setRotationCenter(coord) { let ic = this.icn3d, me = ic.icn3dui;
       this.setCenter(coord);
    }

    setCenter(center) { let ic = this.icn3d, me = ic.icn3dui;
       //if(!ic.bChainAlign) {
           ic.mdl.position.set(0,0,0);
           ic.mdlImpostor.position.set(0,0,0);
           ic.mdl_ghost.position.set(0,0,0);

           ic.mdl.position.sub(center);
           //ic.mdlPicking.position.sub(center);
           ic.mdlImpostor.position.sub(center);
           ic.mdl_ghost.position.sub(center);
       //}
    }

    //Center on the selected atoms.
    centerSelection(atoms) { let ic = this.icn3d, me = ic.icn3dui;
       //ic.transformCls.resetOrientation();

       ic.opts['rotationcenter'] = 'highlight center';

       if(atoms === undefined) {
           atoms = me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms);
       }

        // reset parameters
        ic._zoomFactor = 1.0;
        ic.mouseChange = new THREE.Vector2(0,0);
        ic.quaternion = new THREE.Quaternion(0,0,0,1);

       // center on the hAtoms if more than one residue is selected
       if(Object.keys(atoms).length > 1) {
               let centerAtomsResults = this.centerAtoms(atoms);

               ic.center = centerAtomsResults.center;
               this.setCenter(ic.center);

               // reset cameara
               ic.cameraCls.setCamera();
       }
    }

    //Return an object {"center": center, "maxD": maxD}, where "center" is the center of
    //a set of "atoms" with a value of THREE.Vector3(), and "maxD" is the maximum distance
    //between any two atoms in the set.
    centerAtoms(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        let pmin = new THREE.Vector3( 9999, 9999, 9999);
        let pmax = new THREE.Vector3(-9999,-9999,-9999);
        let psum = new THREE.Vector3();
        let cnt = 0;

        for (let i in atoms) {
            let atom = ic.atoms[i];
            let coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;
        }

        let maxD = pmax.distanceTo(pmin);

        return {"center": psum.multiplyScalar(1.0 / cnt), "maxD": maxD, "pmin": pmin, "pmax": pmax};
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Set the width and height of the canvas.
    setWidthHeight(width, height) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.renderer.setSize(width, height);
        if(ic.scaleFactor === undefined) ic.scaleFactor = 1.0;

        //antialiasing by render twice large:
        //https://stackoverflow.com/questions/17224795/antialiasing-not-working-in-three-js
        ic.renderer.setSize(width*ic.scaleFactor, height*ic.scaleFactor);
        ic.renderer.domElement.style.width = width*ic.scaleFactor + "px";
        ic.renderer.domElement.style.height = height*ic.scaleFactor + "px";
        ic.renderer.domElement.width = width*ic.scaleFactor;
        ic.renderer.domElement.height = height*ic.scaleFactor;

        //ic.container.widthInv  = 1 / (ic.scaleFactor*width);
        //ic.container.heightInv = 1 / (ic.scaleFactor*height);

        ic.container.whratio = width / height;
    }
}

export {ApplyCenter}
