/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setPc1Axes = function() { var me = this, ic = me.icn3d; "use strict";
   var atomHash = this.intHash(this.hAtoms, this.dAtoms);

   // do PCA, get first eigen vector
   var coordArray = [];
   var prevResid = '';
   var bSmall = (Object.keys(atomHash).length < 100) ? true : false;
   for(var serial in atomHash) {
       var atom = this.atoms[serial];
       var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
       if(!bSmall && resid == prevResid) continue; // speed up
       coordArray.push(atom.coord.clone());
   }

   var eigenRet = this.getEigenForSelection(coordArray, coordArray.length);
   var vecX = new THREE.Vector3(eigenRet.h1[0], eigenRet.h1[1], eigenRet.h1[2]);

   if(eigenRet.k == 0 && this.bRender) {
       alert("Can't determine the first principal component. Please select a subset and try it again.");
       return;
   }

   var result = this.centerAtoms(atomHash);
   var maxD = result.maxD;
   var center = result.center;

/*
   var positionXTmp = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.5));
   var positionXMinusTmp = center.clone().multiplyScalar(2).sub(positionXTmp);

   var linex = new THREE.Line3( positionXMinusTmp, positionXTmp );

   var maxLenY = 0, maxLenX = 0, coordY, coordYInLine;
   prevResid = '';
   for(var serial in atomHash) {
       var atom = this.atoms[serial];
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
   this.axes.push(axisPos);

   this.draw();
*/

   var positionX = center.clone().add(vecX.normalize().multiplyScalar(maxD * 0.4));

   var vecY = new THREE.Vector3(eigenRet.h2[0], eigenRet.h2[1], eigenRet.h2[2]);
   var positionY = center.clone().add(vecY.normalize().multiplyScalar(maxD * 0.3));

   var vecZ = new THREE.Vector3(eigenRet.h3[0], eigenRet.h3[1], eigenRet.h3[2]);
   var positionZ = center.clone().add(vecZ.normalize().multiplyScalar(maxD * 0.3));

   this.buildAxes(undefined, center, positionX, positionY, positionZ, true);

   var axisPos = [center, positionX, positionY, positionZ];
   this.axes.push(axisPos);

   this.draw();
};
