/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {RmsdSuprCls} from '../../utils/rmsdSuprCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Cylinder} from '../geometry/cylinder.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {Draw} from '../display/draw.js';

class Axes {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
    //Build the xyz-axes from the center of atoms. The maximum axes length is equal to "radius" in angstrom.
    buildAxes(radius, center, positionX, positionY, positionZ, bSelection) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let axes = new THREE.Object3D();

        let x = 0, y = 0, z = 0;

        if(bSelection) {
            x = center.x;
            y = center.y;
            z = center.z;
        }
        else {
            x -= radius * 0.3; //0.707; // move to the left
            y -= radius * 0.3; //0.707; // move to the botom
        }
        let origin = new THREE.Vector3( x, y, z );

        let axisLen = radius / 10;
        let r = radius / 100;

        let axisVecX, axisVecY, axisVecZ;
        let axisLenX, axisLenY, axisLenZ;
        axisLenX = axisLenY = axisLenZ = axisLen;
        if(bSelection) {
            axisVecX = positionX.clone().sub(center);
            axisVecY = positionY.clone().sub(center);
            axisVecZ = positionZ.clone().sub(center);

            axisLenX = axisVecX.length();
            axisLenY = axisVecY.length();
            axisLenZ = axisVecZ.length();

            r = axisLenX / 100;

            if(r < 0.4) r = 0.4;
        }

        let meshX, meshY, meshZ;
        if(bSelection) {
            meshX = ic.cylinderCls.createCylinder_base( center, positionX, r, me.parasCls.thr(0xFF0000)); // +X
            meshY = ic.cylinderCls.createCylinder_base( center, positionY, r, me.parasCls.thr(0x00FF00)); // +Y
            meshZ = ic.cylinderCls.createCylinder_base( center, positionZ, r, me.parasCls.thr(0x0000FF)); // +Z
        }
        else {
            meshX = ic.cylinderCls.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x + axisLenX, y, z ), r, me.parasCls.thr(0xFF0000)); // +X
            meshY = ic.cylinderCls.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y + axisLenY, z ), r, me.parasCls.thr(0x00FF00)); // +Y
            meshZ = ic.cylinderCls.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y, z + axisLenZ ), r, me.parasCls.thr(0x0000FF)); // +Z
        }

        ic.mdl.add( meshX );
        ic.mdl.add( meshY );
        ic.mdl.add( meshZ );

        let dirX = (bSelection) ? axisVecX.normalize() : new THREE.Vector3( 1, 0, 0 );
        let colorX = 0xff0000;
        let posX = (bSelection) ? positionX : new THREE.Vector3(origin.x + axisLen, origin.y, origin.z);
        let arrowX = this.createArrow( dirX, posX, axisLenX, colorX, 4*r, 4*r);
        ic.mdl.add( arrowX );

        let dirY = (bSelection) ? axisVecY.normalize() : new THREE.Vector3( 0, 1, 0 );
        let colorY = 0x00ff00;
        let posY = (bSelection) ? positionY : new THREE.Vector3(origin.x, origin.y + axisLen, origin.z);
        let arrowY = this.createArrow( dirY, posY, axisLenY, colorY, 4*r, 4*r);
        ic.mdl.add( arrowY );

        let dirZ = (bSelection) ? axisVecZ.normalize() : new THREE.Vector3( 0, 0, 1 );
        let colorZ = 0x0000ff;
        let posZ = (bSelection) ? positionZ : new THREE.Vector3(origin.x, origin.y, origin.z + axisLen);
        let arrowZ = this.createArrow( dirZ, posZ, axisLenZ, colorZ, 4*r, 4*r);
        ic.mdl.add( arrowZ );
    }

    buildAllAxes(radius, bSelection) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if(ic.pc1) {
            for(let i = 0, il = ic.axes.length; i < il; ++i) {
               let center = ic.axes[i][0];
               let positionX = ic.axes[i][1];
               let positionY = ic.axes[i][2];
               let positionZ = ic.axes[i][3];

               this.buildAxes(radius, center, positionX, positionY, positionZ, bSelection);
            }
        }
    }

    createArrow(dir, origin, axisLen, color, headLength, headWidth, bGlycan) {  let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let coneGeometry = new THREE.CylinderBufferGeometry( 0, 0.5, 1, 32, 1 );
        //coneGeometry.translate( 0, - 0.5, 0 );
        coneGeometry.translate( 0, 0.5, 0 );
        let material;
        if(bGlycan) {
            material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color });

        }
        else {
            material = new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, side: THREE.DoubleSide, color: color});
        }

        let cone = new THREE.Mesh( coneGeometry, material);
    //    cone.matrixAutoUpdate = false;

        let quaternion = new THREE.Quaternion();
        // dir is assumed to be normalized
        if ( dir.y > 0.99999 ) {
            quaternion.set( 0, 0, 0, 1 );
        } else if ( dir.y < - 0.99999 ) {
            quaternion.set( 1, 0, 0, 0 );
        } else {
            let axis = new THREE.Vector3();
            axis.set( dir.z, 0, - dir.x ).normalize();
            let radians = Math.acos( dir.y );
            quaternion.setFromAxisAngle( axis, radians );
        }

        cone.applyQuaternion(quaternion);
        cone.scale.set( headWidth, headLength, headWidth );
        //origin.add(new THREE.Vector3(0, axisLen, 0));
        cone.position.copy( origin );

        return cone;
    }

    setPc1Axes() { let ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       let atomHash = me.hashUtilsCls.intHash(ic.hAtoms, ic.dAtoms);

       // do PCA, get first eigen vector
       let coordArray = [];
       let prevResid = '';
       let bSmall = (Object.keys(atomHash).length < 100) ? true : false;
       for(let serial in atomHash) {
           let atom = ic.atoms[serial];
           let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           if(!bSmall && resid == prevResid) continue; // speed up
           coordArray.push(atom.coord.clone());
       }

       let eigenRet = me.rmsdSuprCls.getEigenForSelection(coordArray, coordArray.length);
       let vecX = new THREE.Vector3(eigenRet.h1[0], eigenRet.h1[1], eigenRet.h1[2]);

       if(eigenRet.k == 0 && ic.bRender) {
           alert("Can't determine the first principal component. Please select a subset and try it again.");
           return;
       }

       let result = ic.applyCenterCls.centerAtoms(atomHash);
       let maxD = result.maxD;
       let center = result.center;

    /*
       let positionXTmp = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.5));
       let positionXMinusTmp = center.clone().multiplyScalar(2).sub(positionXTmp);

       let linex = new THREE.Line3( positionXMinusTmp, positionXTmp );

       let maxLenY = 0, maxLenX = 0, coordY, coordYInLine;
       prevResid = '';
       for(let serial in atomHash) {
           let atom = ic.atoms[serial];
           let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           if(!bSmall && resid == prevResid) continue; // speed up

           let posInLine = new THREE.Vector3();
           linex.closestPointToPoint ( atom.coord, false, posInLine);

           let lenY = posInLine.distanceTo(atom.coord);
           if(lenY > maxLenY) {
               coordY = atom.coord;
               coordYInLine = posInLine;

               maxLenY = lenY;
           }

           let lenX = posInLine.distanceTo(center);
           if(lenX > maxLenX) {
               maxLenX = lenX;
           }
       }

       let positionX = center.clone().add(vecX.normalize().multiplyScalar(maxLenX));

       // translate
       centerTrans = center.clone().sub(coordYInLine);
       let positionY = coordY.clone().add(centerTrans);

       let vecZ = new THREE.Vector3();
       let vecY = positionY.clone().sub(center);
       vecZ.crossVectors( positionX.clone().sub(center), vecY ).normalize();
       vecZ.multiplyScalar(vecY.length());

       positionZ = center.clone().add(vecZ);

       this.buildAxes(undefined, center, positionX, positionY, positionZ, true);

       let axisPos = [center, positionX, positionY, positionZ];
       ic.axes.push(axisPos);

       ic.drawCls.draw();
    */

       let positionX = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.4));

       let vecY = new THREE.Vector3(eigenRet.h2[0], eigenRet.h2[1], eigenRet.h2[2]);
       let positionY = center.clone().add(vecY.normalize().multiplyScalar(maxD * 0.3));

       let vecZ = new THREE.Vector3(eigenRet.h3[0], eigenRet.h3[1], eigenRet.h3[2]);
       let positionZ = center.clone().add(vecZ.normalize().multiplyScalar(maxD * 0.3));

       this.buildAxes(undefined, center, positionX, positionY, positionZ, true);

       let axisPos = [center, positionX, positionY, positionZ];
       ic.axes.push(axisPos);

       ic.drawCls.draw();

       return axisPos;
    }
}

export {Axes}
