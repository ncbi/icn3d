/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class Transform {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Set the orientation to the original one, but leave the style, color, etc alone.
    resetOrientation() { let ic = this.icn3d, me = ic.icn3dui;
        let bSet = false;
        if(ic.commands.length > 0) {
            let commandTransformation = ic.commands[0].split('|||');

            if(commandTransformation.length == 2) {
                let transformation = JSON.parse(commandTransformation[1]);

                ic._zoomFactor = transformation.factor;

                ic.mouseChange.x = transformation.mouseChange.x;
                ic.mouseChange.y = transformation.mouseChange.y;

                ic.quaternion._x = transformation.quaternion._x;
                ic.quaternion._y = transformation.quaternion._y;
                ic.quaternion._z = transformation.quaternion._z;
                ic.quaternion._w = transformation.quaternion._w;

                bSet = true;
            }
        }

        if(!bSet) {
            ic._zoomFactor = 1.0;
            ic.mouseChange = new THREE.Vector2(0,0);
            ic.quaternion = new THREE.Quaternion(0,0,0,1);
        }

        //reset ic.maxD
        ic.maxD = ic.oriMaxD;
        ic.center = ic.oriCenter.clone();

        if(ic.ori_chemicalbinding == 'show') {
            ic.bSkipChemicalbinding = false;
        }
        else if(ic.ori_chemicalbinding == 'hide') {
            ic.bSkipChemicalbinding = true;
        }
    }

    //Rotate the structure certain degree to the left, e.g., 5 degree.
    rotateLeft (degree) { let ic = this.icn3d, me = ic.icn3dui;
      let axis = new THREE.Vector3(0,1,0);
      let angle = -degree / 180.0 * Math.PI;

      if(ic.bControlGl && !me.bNode) {
          axis.applyQuaternion( window.cam.quaternion ).normalize();
      }
      else {
          axis.applyQuaternion( ic.cam.quaternion ).normalize();
      }

      let quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      let para = {}
      para.quaternion = quaternion;
      para.update = true;

      if(ic.bControlGl && !me.bNode) {
          window.controls.update(para);
      }
      else {
          ic.controls.update(para);
      }

      if(ic.bRender) ic.drawCls.render();
    }

    //Rotate the structure certain degree to the right, e.g., 5 degree.
    rotateRight (degree) { let ic = this.icn3d, me = ic.icn3dui;
      let axis = new THREE.Vector3(0,1,0);
      let angle = degree / 180.0 * Math.PI;

      if(ic.bControlGl && !me.bNode) {
          axis.applyQuaternion( window.cam.quaternion ).normalize();
      }
      else {
          axis.applyQuaternion( ic.cam.quaternion ).normalize();
      }

      let quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      let para = {}
      para.quaternion = quaternion;
      para.update = true;

      if(ic.bControlGl && !me.bNode) {
          window.controls.update(para);
      }
      else {
          ic.controls.update(para);
      }

      if(ic.bRender) ic.drawCls.render();
    }

    rotateUp (degree) { let ic = this.icn3d, me = ic.icn3dui;
        this.rotate_base(-degree);
    }

    //Rotate the structure certain degree to the bottom, e.g., 5 degree.
    rotateDown (degree) { let ic = this.icn3d, me = ic.icn3dui;
        this.rotate_base(degree);
    }

    //Rotate the structure certain degree to the top, e.g., 5 degree.
    rotate_base (degree) { let ic = this.icn3d, me = ic.icn3dui;
      let axis = new THREE.Vector3(1,0,0);
      let angle = degree / 180.0 * Math.PI;

      if(ic.bControlGl && !me.bNode) {
          axis.applyQuaternion( window.cam.quaternion ).normalize();
      }
      else {
          axis.applyQuaternion( ic.cam.quaternion ).normalize();
      }

      let quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      let para = {}
      para.quaternion = quaternion;
      para.update = true;

      if(ic.bControlGl && !me.bNode) {
          window.controls.update(para);
      }
      else {
          ic.controls.update(para);
      }

      if(ic.bRender) ic.drawCls.render();
    }

    setRotation(axis, angle) { let ic = this.icn3d, me = ic.icn3dui;
      if(!axis) return;

      if(ic.bControlGl && !me.bNode && window.cam) {
          axis.applyQuaternion( window.cam.quaternion ).normalize();
      }
      else if(ic.cam) {
          axis.applyQuaternion( ic.cam.quaternion ).normalize();
      }

      let quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      let para = {};
      para.quaternion = quaternion;
      para.update = true;

      if(ic.bControlGl && !me.bNode && window.controls) {
        window.controls.update(para);
      }
      else if(ic.controls) {
          ic.controls.update(para);
      }

      if(ic.bRender) ic.drawCls.render();
    }

    //Translate the structure certain distance to the left, e.g., "percentScreenSize" 1 means 1% of the screen width.
    translateLeft(percentScreenSize) {  let ic = this.icn3d, me = ic.icn3dui;
        this.translate_base(-percentScreenSize, 0);
    }

    //Translate the structure certain distance to the right, e.g., "percentScreenSize" 1 means 1% of the screen width.
    translateRight(percentScreenSize) {  let ic = this.icn3d, me = ic.icn3dui;
        this.translate_base(percentScreenSize, 0);
    }

    //Translate the structure certain distance to the top, e.g., "percentScreenSize" 1 means 1% of the screen height.
    translateUp(percentScreenSize) {  let ic = this.icn3d, me = ic.icn3dui;
        this.translate_base(0, -percentScreenSize);
    }

    //Translate the structure certain distance to the bottom, e.g., "percentScreenSize" 1 means 1% of the screen height.
    translateDown(percentScreenSize) {  let ic = this.icn3d, me = ic.icn3dui;
        this.translate_base(0, percentScreenSize);
    }

    translate_base(x, y) {  let ic = this.icn3d, me = ic.icn3dui;
      let mouseChange = new THREE.Vector2(0,0);

      mouseChange.x += x / 100.0;
      mouseChange.y += y / 100.0;

      let para = {}
      para.mouseChange = mouseChange;
      para.update = true;

      if(ic.bControlGl && !me.bNode) {
          window.controls.update(para);
      }
      else {
          ic.controls.update(para);
      }

      if(ic.bRender) ic.drawCls.render();
    }

    translateCoord(atoms, dx, dy, dz) { let ic = this.icn3d, me = ic.icn3dui;
        for(let i in atoms) {
            let atom = ic.atoms[i];
            atom.coord.x += dx;
            atom.coord.y += dy;
            atom.coord.z += dz;
        }
    }

    rotateCoord(atoms, mArray) { let ic = this.icn3d, me = ic.icn3dui;
        const m = new THREE.Matrix4(); 
        m.elements = mArray;

        for(let i in atoms) {
            let atom = ic.atoms[i];
            atom.coord = atom.coord.applyMatrix4(m);
        }
    }

    //Center on the selected atoms and zoom in.
    zoominSelection(atoms) { let ic = this.icn3d, me = ic.icn3dui;
       let para = {}

       para._zoomFactor = 1.0 / ic._zoomFactor;
       para.update = true;

       if(ic.bControlGl && !me.bNode) {
          if(window.controls) window.controls.update(para);
       }
       else {
          if(ic.controls) ic.controls.update(para);
       }

       if(atoms === undefined) {
           atoms = me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms);
       }

       // center on the hAtoms if more than one residue is selected
       if(Object.keys(atoms).length > 1) {
               let centerAtomsResults = ic.applyCenterCls.centerAtoms(atoms);

               ic.maxD = centerAtomsResults.maxD;
               if (ic.maxD < 5) ic.maxD = 5;

               ic.center = centerAtomsResults.center;
               ic.applyCenterCls.setCenter(ic.center);

               // reset cameara
               ic.cameraCls.setCamera();
       }
    }

    getTransformationStr(transformation) {var ic = this.icn3d, me = ic.icn3dui;
        let transformation2 = {"factor": 1.0, "mouseChange": {"x": 0, "y": 0}, "quaternion": {"_x": 0, "_y": 0, "_z": 0, "_w": 1} }
        transformation2.factor = parseFloat(transformation.factor).toPrecision(4);
        transformation2.mouseChange.x = parseFloat(transformation.mouseChange.x).toPrecision(4);
        transformation2.mouseChange.y = parseFloat(transformation.mouseChange.y).toPrecision(4);
        transformation2.quaternion._x = parseFloat(transformation.quaternion._x).toPrecision(4);
        transformation2.quaternion._y = parseFloat(transformation.quaternion._y).toPrecision(4);
        transformation2.quaternion._z = parseFloat(transformation.quaternion._z).toPrecision(4);
        transformation2.quaternion._w = parseFloat(transformation.quaternion._w).toPrecision(4);

        if(transformation2.factor == '1.0000') transformation2.factor = 1;
        if(transformation2.mouseChange.x == '0.0000') transformation2.mouseChange.x = 0;
        if(transformation2.mouseChange.y == '0.0000') transformation2.mouseChange.y = 0;

        if(transformation2.quaternion._x == '0.0000') transformation2.quaternion._x = 0;
        if(transformation2.quaternion._y == '0.0000') transformation2.quaternion._y = 0;
        if(transformation2.quaternion._z == '0.0000') transformation2.quaternion._z = 0;
        if(transformation2.quaternion._w == '1.0000') transformation2.quaternion._w = 1;

        return JSON.stringify(transformation2);
    }
}

export {Transform}
