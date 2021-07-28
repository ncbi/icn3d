/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Impostor} from '../geometry/impostor.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {Camera} from '../display/camera.js';

class Instancing {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    positionFromGeometry( mesh ){ let ic = this.icn3d, me = ic.icn3dui;
        let geometry = mesh.geometry;

        let vertices = geometry.vertices;

        let meshPosition = mesh.position;
        let scale = mesh.scale;
        let matrix = mesh.matrix;

        let j, v3;
        let n = vertices.length;
        //var position = new Float32Array( n * 3 );
        let position = [];

        for( let v = 0; v < n; v++ ){

            j = v * 3;

            if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry') {
                v3 = vertices[v].clone().multiply(scale).add(meshPosition);
            }
            else if(geometry.type == 'CylinderGeometry') {
                v3 = vertices[v].clone().applyMatrix4(matrix);
            }
            else {
                v3 = vertices[v];
            }

            position[ j + 0 ] = v3.x;
            position[ j + 1 ] = v3.y;
            position[ j + 2 ] = v3.z;
        }

        return position;
    }

    colorFromGeometry( mesh ){ let ic = this.icn3d, me = ic.icn3dui;
        let geometry = mesh.geometry;

        let meshColor = me.parasCls.thr(1, 1, 1);
        if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
             if(mesh.material !== undefined) meshColor = mesh.material.color;
        }

        let faces = geometry.faces;
        let vn = geometry.vertices.length;

        let bSurfaceVertex = (geometry.type == 'Surface') ? true : false;

        let j, f, c1, c2, c3;
        let n = faces.length;
        //var color = new Float32Array( vn * 3 );
        let color = [];

        for( let v = 0; v < n; v++ ){

            f = faces[ v ];

            if(geometry.type == 'Surface') {
                c1 = f.vertexColors[0];
                c2 = f.vertexColors[1];
                c3 = f.vertexColors[2];
            }
            else if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
                c1 = meshColor;
                c2 = meshColor;
                c3 = meshColor;
            }
            else {
                c1 = f.color;
                c2 = f.color;
                c3 = f.color;
            }

            j = f.a * 3;
            color[ j + 0 ] = c1.r;
            color[ j + 1 ] = c1.g;
            color[ j + 2 ] = c1.b;

            j = f.b * 3;
            color[ j + 0 ] = c2.r;
            color[ j + 1 ] = c2.g;
            color[ j + 2 ] = c2.b;

            j = f.c * 3;
            color[ j + 0 ] = c3.r;
            color[ j + 1 ] = c3.g;
            color[ j + 2 ] = c3.b;

        }

        return color;
    }

    indexFromGeometry( mesh ){  let ic = this.icn3d, me = ic.icn3dui;
        let geometry = mesh.geometry;

        let faces = geometry.faces;

        let j, f;
        let n = faces.length;
        //var TypedArray = n * 3 > 65535 ? Uint32Array : Uint16Array;
        //var index = new TypedArray( n * 3 );
        let index = [];

        for( let v = 0; v < n; v++ ){

            j = v * 3;
            f = faces[ v ];

            index[ j + 0 ] = f.a;
            index[ j + 1 ] = f.b;
            index[ j + 2 ] = f.c;

        }

        return index;
    }

    normalFromGeometry( mesh ){  let ic = this.icn3d, me = ic.icn3dui;
        let geometry = mesh.geometry;

        let faces = geometry.faces;
        let vn = geometry.vertices.length;

        let j, f, nn, n1, n2, n3;
        let n = faces.length;
        //var normal = new Float32Array( vn * 3 );
        let normal = [];

        for( let v = 0; v < n; v++ ){

            f = faces[ v ];
            nn = f.vertexNormals;
            n1 = nn[ 0 ];
            n2 = nn[ 1 ];
            n3 = nn[ 2 ];

            j = f.a * 3;
            normal[ j + 0 ] = n1.x;
            normal[ j + 1 ] = n1.y;
            normal[ j + 2 ] = n1.z;

            j = f.b * 3;
            normal[ j + 0 ] = n2.x;
            normal[ j + 1 ] = n2.y;
            normal[ j + 2 ] = n2.z;

            j = f.c * 3;
            normal[ j + 0 ] = n3.x;
            normal[ j + 1 ] = n3.y;
            normal[ j + 2 ] = n3.z;

        }

        return normal;
    }

    //Draw the biological unit assembly using the matrix.
    drawSymmetryMates() {  let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

//        if(ic.bInstanced && Object.keys(ic.atoms).length * ic.biomtMatrices.length > ic.maxatomcnt) {
        if(ic.bInstanced) {
            this.drawSymmetryMatesInstancing();
        }
        else {
            this.drawSymmetryMatesNoInstancing();
        }
    }

    applyMat(obj, mat, bVector3) {  let ic = this.icn3d, me = ic.icn3dui;
        // applyMatrix was renamed to applyMatrix4
        if(ic.rmsd_supr === undefined) {
/*
          if(bVector3 === undefined) {
              obj.applyMatrix(mat);
          }
          else if(bVector3) {
              obj.applyMatrix4(mat);
          }
*/
          obj.applyMatrix4(mat);
        }
        else {
          let rot = ic.rmsd_supr.rot;
          let centerFrom = ic.rmsd_supr.trans1;
          let centerTo = ic.rmsd_supr.trans2;

          let rotationM4 = new THREE.Matrix4();
          rotationM4.set(rot[0], rot[1], rot[2], 0, rot[3], rot[4], rot[5], 0, rot[6], rot[7], rot[8], 0, 0, 0, 0, 1);

          let rotationM4Inv = new THREE.Matrix4();
          //rotationM4Inv.getInverse(rotationM4);
          rotationM4Inv.copy( rotationM4 ).invert();

          //modifiedMat.makeTranslation(-centerTo.x, -centerTo.y, -centerTo.z).multiply(rotationM4Inv).makeTranslation(centerFrom.x, centerFrom.y, centerFrom.z).multiply(mat).makeTranslation(-centerFrom.x, -centerFrom.y, -centerFrom.z).multiply(rotationM4).makeTranslation(centerTo.x, centerTo.y, centerTo.z);

          let tmpMat = new THREE.Matrix4();

/*
          if(bVector3 === undefined) {
              tmpMat.makeTranslation(-centerTo.x, -centerTo.y, -centerTo.z);
              obj.applyMatrix(tmpMat);

              obj.applyMatrix(rotationM4Inv);

              tmpMat.makeTranslation(centerFrom.x, centerFrom.y, centerFrom.z);
              obj.applyMatrix(tmpMat);

              obj.applyMatrix(mat);

              tmpMat.makeTranslation(-centerFrom.x, -centerFrom.y, -centerFrom.z);
              obj.applyMatrix(tmpMat);

              obj.applyMatrix(rotationM4);

              tmpMat.makeTranslation(centerTo.x, centerTo.y, centerTo.z);
              obj.applyMatrix(tmpMat);
          }
          else if(bVector3) {
*/
              tmpMat.makeTranslation(-centerTo.x, -centerTo.y, -centerTo.z);
              obj.applyMatrix4(tmpMat);

              obj.applyMatrix4(rotationM4Inv);

              tmpMat.makeTranslation(centerFrom.x, centerFrom.y, centerFrom.z);
              obj.applyMatrix4(tmpMat);

              obj.applyMatrix4(mat);

              tmpMat.makeTranslation(-centerFrom.x, -centerFrom.y, -centerFrom.z);
              obj.applyMatrix4(tmpMat);

              obj.applyMatrix4(rotationM4);

              tmpMat.makeTranslation(centerTo.x, centerTo.y, centerTo.z);
              obj.applyMatrix4(tmpMat);
//          }
        }
    }

    drawSymmetryMatesNoInstancing() {  let ic = this.icn3d, me = ic.icn3dui;
       if (ic.biomtMatrices === undefined || ic.biomtMatrices.length == 0) return;
       let cnt = 1; // itself
       let centerSum = ic.center.clone();

       let identity = new THREE.Matrix4();
       identity.identity();

       let mdlTmp = new THREE.Object3D();
       let mdlImpostorTmp = new THREE.Object3D();
       let mdl_ghostTmp = new THREE.Object3D();

       for (let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
          let mat = ic.biomtMatrices[i];
          if (mat === undefined) continue;

          // skip itself
          if(mat.equals(identity)) continue;

          let symmetryMate;

          if(ic.mdl !== undefined) {
              symmetryMate = ic.mdl.clone();
              //symmetryMate.applyMatrix(mat);
              this.applyMat(symmetryMate, mat);

              mdlTmp.add(symmetryMate);
          }

          if(ic.mdlImpostor !== undefined) {
              // after three.js version 128, the cylinder impostor seemed to have a problem in cloning!!!
              symmetryMate = ic.mdlImpostor.clone();
              //symmetryMate.applyMatrix(mat);
              this.applyMat(symmetryMate, mat);

              //symmetryMate.onBeforeRender = ic.impostorCls.onBeforeRender;
              for(let j = symmetryMate.children.length - 1; j >= 0; j--) {
                   let mesh = symmetryMate.children[j];
                   mesh.onBeforeRender = ic.impostorCls.onBeforeRender;
                   //mesh.onBeforeRender = this.onBeforeRender;

                   mesh.frustumCulled = false;
              }

              mdlImpostorTmp.add(symmetryMate);
          }

          if(ic.mdl_ghost !== undefined) {
              symmetryMate = ic.mdl_ghost.clone();
              //symmetryMate.applyMatrix(mat);
              this.applyMat(symmetryMate, mat);

              mdl_ghostTmp.add(symmetryMate);
          }

          let center = ic.center.clone();
          //center.applyMatrix4(mat);
          this.applyMat(center, mat, true);

          centerSum.add(center);

          ++cnt;
       }

       ic.mdl.add(mdlTmp);
       ic.mdlImpostor.add(mdlImpostorTmp);
       ic.mdl_ghost.add(mdl_ghostTmp);

       if(ic.bSetInstancing === undefined || !ic.bSetInstancing) {
           ic.maxD *= Math.sqrt(cnt);

           ic.center = centerSum.multiplyScalar(1.0 / cnt);

           ic.maxDAssembly = ic.maxD;

           ic.centerAssembly = ic.center.clone();

           ic.applyCenterCls.setCenter(ic.center);

           // reset cameara
           ic.cameraCls.setCamera();
       }
       else {
           ic.maxD = ic.maxDAssembly;

           ic.center = ic.centerAssembly.clone();

           ic.applyCenterCls.setCenter(ic.center);

           // reset cameara
           ic.cameraCls.setCamera();
       }

       ic.bSetInstancing = true;
    }

/*
    onBeforeRender(renderer, scene, camera, geometry, material) {
      let u = material.uniforms;
      let updateList = [];

      if (u.objectId) {
        u.objectId.value = SupportsReadPixelsFloat ? this.id : this.id / 255
        updateList.push('objectId')
      }

      if (u.modelViewMatrixInverse || u.modelViewMatrixInverseTranspose ||
          u.modelViewProjectionMatrix || u.modelViewProjectionMatrixInverse
      ) {
        this.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld);
      }

      if (u.modelViewMatrixInverse) {
        //u.modelViewMatrixInverse.value.getInverse(this.modelViewMatrix);
        u.modelViewMatrixInverse.value.copy( this.modelViewMatrix ).invert();
        updateList.push('modelViewMatrixInverse');
      }

      if (u.modelViewMatrixInverseTranspose) {
        if (u.modelViewMatrixInverse) {
          u.modelViewMatrixInverseTranspose.value.copy(
            u.modelViewMatrixInverse.value
          ).transpose();
        } else {
          //u.modelViewMatrixInverseTranspose.value
          //  .getInverse(this.modelViewMatrix)
          //  .transpose();
          u.modelViewMatrixInverseTranspose.value
            .copy( this.modelViewMatrix )
            .invert()
            .transpose();
        }
        updateList.push('modelViewMatrixInverseTranspose');
      }

      if (u.modelViewProjectionMatrix) {
        camera.updateProjectionMatrix();
        u.modelViewProjectionMatrix.value.multiplyMatrices(
          camera.projectionMatrix, this.modelViewMatrix
        );
        updateList.push('modelViewProjectionMatrix');
      }

      if (u.modelViewProjectionMatrixInverse) {
        let tmpMatrix = new THREE.Matrix4();
        if (u.modelViewProjectionMatrix) {
          tmpMatrix.copy(
            u.modelViewProjectionMatrix.value
          );
          //u.modelViewProjectionMatrixInverse.value.getInverse(
          //  tmpMatrix
          //);
          u.modelViewProjectionMatrixInverse.value.copy( tmpMatrix ).invert();
        } else {
          camera.updateProjectionMatrix();
          tmpMatrix.multiplyMatrices(
            camera.projectionMatrix, this.modelViewMatrix
          );
          //u.modelViewProjectionMatrixInverse.value.getInverse(
          //  tmpMatrix
          //);
          u.modelViewProjectionMatrixInverse.value.copy( tmpMatrix ).invert();
        }
        updateList.push('modelViewProjectionMatrixInverse');
      }

      if (u.projectionMatrix) {
        camera.updateProjectionMatrix();
        u.projectionMatrix.value.copy( camera.projectionMatrix );
        updateList.push('projectionMatrix');
      }

      if (u.projectionMatrixInverse) {
        camera.updateProjectionMatrix();
        //u.projectionMatrixInverse.value.getInverse(camera.projectionMatrix);
        u.projectionMatrixInverse.value.copy( camera.projectionMatrix ).invert();
        updateList.push('projectionMatrixInverse');
      }

      if (updateList.length) {
        let materialProperties = renderer.properties.get(material);

        if (materialProperties.program) {
          let gl = renderer.getContext();
          let p = materialProperties.program;
          gl.useProgram(p.program);
          let pu = p.getUniforms();

          updateList.forEach(function (name) {
            pu.setValue(gl, name, u[ name ].value)
          });
        }
      }
    }
*/

    createInstancedGeometry(mesh) {  let ic = this.icn3d, me = ic.icn3dui;
       let baseGeometry = mesh.geometry;

       let geometry = new THREE.InstancedBufferGeometry();

       let positionArray = [];
       let normalArray = [];
       let colorArray = [];
       let indexArray = [];

       let radiusArray = [];
       let mappingArray = [];
       let position2Array = [];
       let color2Array = [];

       //else if(ic.bImpo && baseGeometry.attributes.color2 !== undefined) { // cylinder
       if(ic.bImpo && (mesh.type == 'Cylinder')) { // cylinder
           ic.instancedMaterial = this.getInstancedMaterial('CylinderInstancing');

           let positionArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.position1.array);
           let colorArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.color.array);

           let positionArray2b = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.position2.array);
           let colorArray2b = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.color2.array);

           let indexArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.index.array);
           let radiusArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.radius.array);
           let mappingArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.mapping.array);

           positionArray = positionArray.concat(positionArray2);
           colorArray = colorArray.concat(colorArray2);

           position2Array = position2Array.concat(positionArray2b);
           color2Array = color2Array.concat(colorArray2b);

           indexArray = indexArray.concat(indexArray2);
           radiusArray = radiusArray.concat(radiusArray2);
           mappingArray = mappingArray.concat(mappingArray2);

           geometry.setAttribute('position1', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
           geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );

           geometry.setAttribute('position2', new THREE.BufferAttribute(new Float32Array(position2Array), 3));
           geometry.setAttribute('color2', new THREE.BufferAttribute(new Float32Array(color2Array), 3) );

           geometry.setAttribute('radius', new THREE.BufferAttribute(new Float32Array(radiusArray), 1) );
           geometry.setAttribute('mapping', new THREE.BufferAttribute(new Float32Array(mappingArray), 3) );
           geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));

           positionArray2 = null;
           colorArray2 = null;
           positionArray2b = null;
           colorArray2b = null;
           indexArray2 = null;
           radiusArray2 = null;
           mappingArray2 = null;
       }
       //else if(ic.bImpo && baseGeometry.attributes.color !== undefined) { // sphere
       else if(ic.bImpo && (mesh.type == 'Sphere')) { // sphere
           ic.instancedMaterial = this.getInstancedMaterial('SphereInstancing');

           let positionArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.position.array);
           let colorArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.color.array);
           let indexArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.index.array);
           let radiusArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.radius.array);
           let mappingArray2 = me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.mapping.array);

           positionArray = positionArray.concat(positionArray2);
           colorArray = colorArray.concat(colorArray2);
           indexArray = indexArray.concat(indexArray2);
           radiusArray = radiusArray.concat(radiusArray2);
           mappingArray = mappingArray.concat(mappingArray2);

           geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
           geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );
           geometry.setAttribute('radius', new THREE.BufferAttribute(new Float32Array(radiusArray), 1) );
           geometry.setAttribute('mapping', new THREE.BufferAttribute(new Float32Array(mappingArray), 2) );
           geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));

           positionArray2 = null;
           colorArray2 = null;
           indexArray2 = null;
           radiusArray2 = null;
           mappingArray2 = null;
       }
       //if( baseGeometry.vertices && baseGeometry.faces ){
       else { // now BufferGeometry
           ic.instancedMaterial = this.getInstancedMaterial('Instancing');

           //var positionArray2 = this.positionFromGeometry( mesh );
           //var normalArray2 = this.normalFromGeometry( mesh );
           //var colorArray2 = this.colorFromGeometry( mesh );
           //var indexArray2 = this.indexFromGeometry( mesh );

           let positionArray2 = (baseGeometry.attributes.position) ? me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.position.array) : [];
           let normalArray2 = (baseGeometry.attributes.normal) ? me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.normal.array) : [];
           let colorArray2 = (baseGeometry.attributes.color) ? me.hashUtilsCls.hashvalue2array(baseGeometry.attributes.color.array) : [];
           let indexArray2 = (baseGeometry.index) ? me.hashUtilsCls.hashvalue2array(baseGeometry.index.array) : [];

           positionArray = positionArray.concat(positionArray2);
           normalArray = normalArray.concat(normalArray2);
           colorArray = colorArray.concat(colorArray2);
           indexArray = indexArray.concat(indexArray2);

           let bCylinderArray = [];
           let bCylinder = (baseGeometry.type == 'CylinderGeometry') ? 1.0 : 0.0;
           for(let i = 0, il = positionArray.length / 3; i < il; ++i) {
               bCylinderArray.push(bCylinder);
           }

           geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
           geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normalArray), 3) );
           geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );

           geometry.setAttribute('cylinder', new THREE.BufferAttribute(new Float32Array(bCylinderArray), 1) );
           geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));

           positionArray2 = null;
           normalArray2 = null;
           colorArray2 = null;
           indexArray2 = null;

       }

       positionArray = null;
       normalArray = null;
       colorArray = null;
       indexArray = null;

       radiusArray = null;
       mappingArray = null;
       position2Array = null;
       color2Array = null;

       let matricesAttribute1 = new THREE.InstancedBufferAttribute( new Float32Array( ic.matricesElements1 ), 4 );
       let matricesAttribute2 = new THREE.InstancedBufferAttribute( new Float32Array( ic.matricesElements2 ), 4 );
       let matricesAttribute3 = new THREE.InstancedBufferAttribute( new Float32Array( ic.matricesElements3 ), 4 );
       let matricesAttribute4 = new THREE.InstancedBufferAttribute( new Float32Array( ic.matricesElements4 ), 4 );

       geometry.setAttribute( 'matrix1', matricesAttribute1 );
       geometry.setAttribute( 'matrix2', matricesAttribute2 );
       geometry.setAttribute( 'matrix3', matricesAttribute3 );
       geometry.setAttribute( 'matrix4', matricesAttribute4 );

       return geometry;
    }

    getInstancedMaterial(name) {  let ic = this.icn3d, me = ic.icn3dui;
       //var material = new THREE.RawShaderMaterial({
       let material = new THREE.ShaderMaterial({
          defines: ic.defines,
          uniforms:  ic.uniforms,
          vertexShader:   ic.impostorCls.getShader(name + ".vert"),
          fragmentShader: ic.impostorCls.getShader(name + ".frag"),
          depthTest: true,
          depthWrite: true,
          //needsUpdate: true,
          lights: true
       });

       material.extensions.fragDepth = true;
       //https://stackoverflow.com/questions/33094496/three-js-shadermaterial-flatshading
       material.extensions.derivatives = '#extension GL_OES_standard_derivatives : enable';

       return material;
    }

    createInstancedMesh(mdl) { let ic = this.icn3d, me = ic.icn3dui;
       for(let i = 0, il = mdl.children.length; i < il; ++i) {
           let mesh = mdl.children[i];

           if(mesh.type === 'Sprite') continue;

           let geometry = this.createInstancedGeometry(mesh);

           let mesh2 = new THREE.Mesh(geometry, ic.instancedMaterial);

           mesh2.onBeforeRender = ic.impostorCls.onBeforeRender;
           //mesh2.onBeforeRender = this.onBeforeRender;

           // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
           // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
           mesh2.frustumCulled = false;

           mesh2.scale.x = mesh2.scale.y = mesh2.scale.z = 1.0;
           mesh2.type = mesh.type;

           geometry = null;

           mdl.add(mesh2);
       }
    }

    drawSymmetryMatesInstancing() { let ic = this.icn3d, me = ic.icn3dui;
       if (ic.biomtMatrices === undefined || ic.biomtMatrices.length == 0) return;
       let cnt = 1; // itself
       let centerSum = ic.center.clone();

       ic.impostorCls.setParametersForShader();

       if(ic.bSetInstancing === undefined || !ic.bSetInstancing) {
           //ic.offsets = [];
           //ic.orientations = [];
           ic.matricesElements1 = [];
           ic.matricesElements2 = [];
           ic.matricesElements3 = [];
           ic.matricesElements4 = [];

           let identity = new THREE.Matrix4();
           identity.identity();

           for (let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              let mat = ic.biomtMatrices[i];
              if (mat === undefined) continue;

              let matArray = mat.toArray();

              // skip itself
              if(mat.equals(identity)) continue;

              ic.matricesElements1.push(matArray[0], matArray[1], matArray[2], matArray[3]);
              ic.matricesElements2.push(matArray[4], matArray[5], matArray[6], matArray[7]);
              ic.matricesElements3.push(matArray[8], matArray[9], matArray[10], matArray[11]);
              ic.matricesElements4.push(matArray[12], matArray[13], matArray[14], matArray[15]);

              let center = ic.center.clone();
              center.applyMatrix4(mat);
              centerSum.add(center);

              ++cnt;
           }
       }

       this.createInstancedMesh(ic.mdl);
       this.createInstancedMesh(ic.mdlImpostor);

       if(ic.bSetInstancing === undefined || !ic.bSetInstancing) {
           ic.maxD *= Math.sqrt(cnt);

           ic.center = centerSum.multiplyScalar(1.0 / cnt);

           ic.maxDAssembly = ic.maxD;

           ic.centerAssembly = ic.center.clone();

           ic.applyCenterCls.setCenter(ic.center);

           // reset cameara
           ic.cameraCls.setCamera();
       }
       else {
           ic.maxD = ic.maxDAssembly;

           ic.center = ic.centerAssembly.clone();

           ic.applyCenterCls.setCenter(ic.center);

           // reset cameara
           ic.cameraCls.setCamera();
       }

       ic.bSetInstancing = true;
    }

}

export {Instancing}
