/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */


// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
iCn3D.prototype.buildAxes = function (radius, center, positionX, positionY, positionZ, bSelection) { var me = this, ic = me.icn3d; "use strict";
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
    var axisLenX = axisLenY = axisLenZ = axisLen;
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
        meshX = this.createCylinder_base( center, positionX, r, this.thr(0xFF0000)); // +X
        meshY = this.createCylinder_base( center, positionY, r, this.thr(0x00FF00)); // +Y
        meshZ = this.createCylinder_base( center, positionZ, r, this.thr(0x0000FF)); // +Z
    }
    else {
        meshX = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x + axisLenX, y, z ), r, this.thr(0xFF0000)); // +X
        meshY = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y + axisLenY, z ), r, this.thr(0x00FF00)); // +Y
        meshZ = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y, z + axisLenZ ), r, this.thr(0x0000FF)); // +Z
    }

    this.mdl.add( meshX );
    this.mdl.add( meshY );
    this.mdl.add( meshZ );

    var dirX = (bSelection) ? axisVecX.normalize() : new THREE.Vector3( 1, 0, 0 );
    var colorX = 0xff0000;
    var posX = (bSelection) ? positionX : new THREE.Vector3(origin.x + axisLen, origin.y, origin.z);
    var arrowX = this.createArrow( dirX, posX, axisLenX, colorX, 4*r, 4*r);
    this.mdl.add( arrowX );

    var dirY = (bSelection) ? axisVecY.normalize() : new THREE.Vector3( 0, 1, 0 );
    var colorY = 0x00ff00;
    var posY = (bSelection) ? positionY : new THREE.Vector3(origin.x, origin.y + axisLen, origin.z);
    var arrowY = this.createArrow( dirY, posY, axisLenY, colorY, 4*r, 4*r);
    this.mdl.add( arrowY );

    var dirZ = (bSelection) ? axisVecZ.normalize() : new THREE.Vector3( 0, 0, 1 );
    var colorZ = 0x0000ff;
    var posZ = (bSelection) ? positionZ : new THREE.Vector3(origin.x, origin.y, origin.z + axisLen);
    var arrowZ = this.createArrow( dirZ, posZ, axisLenZ, colorZ, 4*r, 4*r);
    this.mdl.add( arrowZ );
};

iCn3D.prototype.createArrow = function(dir, origin, axisLen, color, headLength, headWidth, bGlycan) {  var me = this, ic = me.icn3d; "use strict";
    var coneGeometry = new THREE.CylinderBufferGeometry( 0, 0.5, 1, 32, 1 );
    //coneGeometry.translate( 0, - 0.5, 0 );
    coneGeometry.translate( 0, 0.5, 0 );
    var material;
    if(bGlycan) {
        material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color });

    }
    else {
        material = new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, side: THREE.DoubleSide, color: color});
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
};

// show extra lines, not used for pk, so no this.objects
iCn3D.prototype.createLines = function(lines) {  var me = this, ic = me.icn3d; "use strict";
   if(lines !== undefined) {
     for(var name in lines) {
         var lineArray = lines[name];

         for(var i = 0, il = lineArray.length; i < il; ++i) {
           var line = lineArray[i];

           var p1 = line.position1;
           var p2 = line.position2;

           var dashed = (line.dashed) ? line.dashed : false;
           var dashSize = 0.3;

           //this.mdl.add(this.createSingleLine( p1, p2, colorHex, dashed, dashSize ));

           var radius = this.lineRadius;

           var colorStr = '#' + line.color.replace(/\#/g, '');

           var color = this.thr(colorStr);

           if(!dashed) {
                if(name == 'stabilizer') {
                    this.createBrick(p1, p2, radius, color);
                }
                else {
                    this.createCylinder(p1, p2, radius, color);
                }
           }
           else {
             var distance = p1.distanceTo(p2);

             var nsteps = parseInt(distance / dashSize);
             var step = p2.clone().sub(p1).multiplyScalar(dashSize/distance);

             var start, end;
             for(var j = 0; j < nsteps; ++j) {
                 if(j % 2 == 1) {
                      start = p1.clone().add(step.clone().multiplyScalar(j));
                      end = p1.clone().add(step.clone().multiplyScalar(j + 1));

                      if(name == 'stabilizer') {
                        this.createBrick(start, end, radius, color);
                      }
                      else {
                        this.createCylinder(start, end, radius, color);
                      }
                  }
             }
           }
         }
     }
   }

   // do not add the artificial lines to raycasting objects
};
