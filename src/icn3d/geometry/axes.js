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
    buildAxes(radius, center, positionX, positionY, positionZ, bSelection) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var axes = new THREE.Object3D();

        var x = 0, y = 0, z = 0;

        if(bSelection) {
            x = center.x;
            y = center.y;
            z = center.z;
        }
        else {
            x -= radius * 0.3; //0.707; // move to the left
            y -= radius * 0.3; //0.707; // move to the botom
        }
        var origin = new THREE.Vector3( x, y, z );

        var axisLen = radius / 10;
        var r = radius / 100;

        var axisVecX, axisVecY, axisVecZ;
        var axisLenX, axisLenY, axisLenZ;
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

        var meshX, meshY, meshZ;
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

        var dirX = (bSelection) ? axisVecX.normalize() : new THREE.Vector3( 1, 0, 0 );
        var colorX = 0xff0000;
        var posX = (bSelection) ? positionX : new THREE.Vector3(origin.x + axisLen, origin.y, origin.z);
        var arrowX = this.createArrow( dirX, posX, axisLenX, colorX, 4*r, 4*r);
        ic.mdl.add( arrowX );

        var dirY = (bSelection) ? axisVecY.normalize() : new THREE.Vector3( 0, 1, 0 );
        var colorY = 0x00ff00;
        var posY = (bSelection) ? positionY : new THREE.Vector3(origin.x, origin.y + axisLen, origin.z);
        var arrowY = this.createArrow( dirY, posY, axisLenY, colorY, 4*r, 4*r);
        ic.mdl.add( arrowY );

        var dirZ = (bSelection) ? axisVecZ.normalize() : new THREE.Vector3( 0, 0, 1 );
        var colorZ = 0x0000ff;
        var posZ = (bSelection) ? positionZ : new THREE.Vector3(origin.x, origin.y, origin.z + axisLen);
        var arrowZ = this.createArrow( dirZ, posZ, axisLenZ, colorZ, 4*r, 4*r);
        ic.mdl.add( arrowZ );
    }

    buildAllAxes(radius, bSelection) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if(ic.pc1) {
            for(var i = 0, il = ic.axes.length; i < il; ++i) {
               var center = ic.axes[i][0];
               var positionX = ic.axes[i][1];
               var positionY = ic.axes[i][2];
               var positionZ = ic.axes[i][3];

               this.buildAxes(radius, center, positionX, positionY, positionZ, bSelection);
            }
        }
    }

    createArrow(dir, origin, axisLen, color, headLength, headWidth, bGlycan) {  var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var coneGeometry = new THREE.CylinderBufferGeometry( 0, 0.5, 1, 32, 1 );
        //coneGeometry.translate( 0, - 0.5, 0 );
        coneGeometry.translate( 0, 0.5, 0 );
        var material;
        if(bGlycan) {
            material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: 30, emissive: 0x000000, color: color });

        }
        else {
            material = new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: 30, emissive: 0x000000, side: THREE.DoubleSide, color: color});
        }

        var cone = new THREE.Mesh( coneGeometry, material);
    //    cone.matrixAutoUpdate = false;

        var quaternion = new THREE.Quaternion();
        // dir is assumed to be normalized
        if ( dir.y > 0.99999 ) {
            quaternion.set( 0, 0, 0, 1 );
        } else if ( dir.y < - 0.99999 ) {
            quaternion.set( 1, 0, 0, 0 );
        } else {
            var axis = new THREE.Vector3();
            axis.set( dir.z, 0, - dir.x ).normalize();
            var radians = Math.acos( dir.y );
            quaternion.setFromAxisAngle( axis, radians );
        }

        cone.applyQuaternion(quaternion);
        cone.scale.set( headWidth, headLength, headWidth );
        //origin.add(new THREE.Vector3(0, axisLen, 0));
        cone.position.copy( origin );

        return cone;
    }

    setPc1Axes() { var ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       var atomHash = me.hashUtilsCls.intHash(ic.hAtoms, ic.dAtoms);

       // do PCA, get first eigen vector
       var coordArray = [];
       var prevResid = '';
       var bSmall = (Object.keys(atomHash).length < 100) ? true : false;
       for(var serial in atomHash) {
           var atom = ic.atoms[serial];
           var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           if(!bSmall && resid == prevResid) continue; // speed up
           coordArray.push(atom.coord.clone());
       }

       var eigenRet = me.rmsdSuprCls.getEigenForSelection(coordArray, coordArray.length);
       var vecX = new THREE.Vector3(eigenRet.h1[0], eigenRet.h1[1], eigenRet.h1[2]);

       if(eigenRet.k == 0 && ic.bRender) {
           alert("Can't determine the first principal component. Please select a subset and try it again.");
           return;
       }

       var result = ic.applyCenterCls.centerAtoms(atomHash);
       var maxD = result.maxD;
       var center = result.center;

    /*
       var positionXTmp = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.5));
       var positionXMinusTmp = center.clone().multiplyScalar(2).sub(positionXTmp);

       var linex = new THREE.Line3( positionXMinusTmp, positionXTmp );

       var maxLenY = 0, maxLenX = 0, coordY, coordYInLine;
       prevResid = '';
       for(var serial in atomHash) {
           var atom = ic.atoms[serial];
           var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           if(!bSmall && resid == prevResid) continue; // speed up

           var posInLine = new THREE.Vector3();
           linex.closestPointToPoint ( atom.coord, false, posInLine);

           var lenY = posInLine.distanceTo(atom.coord);
           if(lenY > maxLenY) {
               coordY = atom.coord;
               coordYInLine = posInLine;

               maxLenY = lenY;
           }

           var lenX = posInLine.distanceTo(center);
           if(lenX > maxLenX) {
               maxLenX = lenX;
           }
       }

       var positionX = center.clone().add(vecX.normalize().multiplyScalar(maxLenX));

       // translate
       centerTrans = center.clone().sub(coordYInLine);
       var positionY = coordY.clone().add(centerTrans);

       var vecZ = new THREE.Vector3();
       var vecY = positionY.clone().sub(center);
       vecZ.crossVectors( positionX.clone().sub(center), vecY ).normalize();
       vecZ.multiplyScalar(vecY.length());

       positionZ = center.clone().add(vecZ);

       this.buildAxes(undefined, center, positionX, positionY, positionZ, true);

       var axisPos = [center, positionX, positionY, positionZ];
       ic.axes.push(axisPos);

       ic.drawCls.draw();
    */

       var positionX = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.4));

       var vecY = new THREE.Vector3(eigenRet.h2[0], eigenRet.h2[1], eigenRet.h2[2]);
       var positionY = center.clone().add(vecY.normalize().multiplyScalar(maxD * 0.3));

       var vecZ = new THREE.Vector3(eigenRet.h3[0], eigenRet.h3[1], eigenRet.h3[2]);
       var positionZ = center.clone().add(vecZ.normalize().multiplyScalar(maxD * 0.3));

       this.buildAxes(undefined, center, positionX, positionY, positionZ, true);

       var axisPos = [center, positionX, positionY, positionZ];
       ic.axes.push(axisPos);

       ic.drawCls.draw();
    }
}

export {Axes}
