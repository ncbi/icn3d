/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

class Impostor {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    onBeforeRender(renderer, scene, camera, geometry, material) {
      var u = material.uniforms;
      var updateList = [];

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
        var tmpMatrix = new THREE.Matrix4();
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
        var materialProperties = renderer.properties.get(material);

        if (materialProperties.program) {
          var gl = renderer.getContext();
          var p = materialProperties.program;
          gl.useProgram(p.program);
          var pu = p.getUniforms();

          updateList.forEach(function (name) {
            pu.setValue(gl, name, u[ name ].value)
          });
        }
      }
    }

    setParametersForShader (opacity) { var ic = this.icn3d, me = ic.icn3dui;
        var background = me.parasCls.backgroundColors[ic.opts.background.toLowerCase()];

        var near = 2.5*ic.maxD;
        var far = 4*ic.maxD;

        var bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;

        var nearClip;
        if(ic.opts['slab'] === 'yes') {
            if(bInstance) {
                nearClip = 0.1;
            }
            else if(ic.camMaxDFactorFog !== undefined) {
                nearClip = ic.maxD * ic.camMaxDFactorFog - 10; // keep some surrounding residues
                near = (2.5*ic.maxD - nearClip < 0) ? 0 : 2.5*ic.maxD - nearClip;
                far = 4*ic.maxD - nearClip;
            }
            else {
                nearClip = ic.maxD * ic.camMaxDFactor;
            }
        }
        else {
            nearClip = 0.1;
        }

        var opacityValue = (opacity !== undefined) ? opacity : 1.0;

        ic.uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib.common,
          {
            modelViewMatrix: { value: new THREE.Matrix4() },
            modelViewMatrixInverse: { value: new THREE.Matrix4() },
            modelViewMatrixInverseTranspose: { value: new THREE.Matrix4() },
            modelViewProjectionMatrix: { value: new THREE.Matrix4() },
            modelViewProjectionMatrixInverse: { value: new THREE.Matrix4() },
            projectionMatrix: { value: new THREE.Matrix4() },
            projectionMatrixInverse: { value: new THREE.Matrix4() },

            //ambientLightColor: { type: "v3", value: [0.25, 0.25, 0.25] },
            diffuse: { type: "v3", value: [1.0, 1.0, 1.0] },
            emissive: { type: "v3", value: [0.0,0.0,0.0] },
            roughness: { type: "f", value: 0.5 }, // 0.4
            metalness: { type: "f", value: 0.3 }, // 0.5
            opacity: { type: "f", value: opacityValue },
            nearClip: { type: "f", value: nearClip },
            ortho: { type: "f", value: 0.0 },
            shrink: { type: "f", value: 0.13 },
            fogColor: { type: "v3", value: [background.r, background.g, background.b] },
            fogNear: { type: "f", value: near },
            fogFar: { type: "f", value: far },
            fogDensity: { type: "f", value: 2.0 }
          },
            THREE.UniformsLib.ambient,
            THREE.UniformsLib.lights
        ]);

        ic.defines = {
            USE_COLOR: 1,
            //PICKING: 1,
            NEAR_CLIP: 1,
            CAP: 1
        };

        if(ic.opts['fog'] === 'yes' && !bInstance) {
            ic.defines['USE_FOG'] = 1;

            if(ic.opts['camera'] === 'orthographic') {
                ic.defines['FOG_EXP2'] = 1;
            }
        }

        if(ic.bExtFragDepth) {
            ic.defines['USE_LOGDEPTHBUF_EXT'] = 1;
        }
    }

    drawImpostorShader () { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        this.setParametersForShader();

        this.createImpostorShaderSphere("SphereImpostor");
        this.createImpostorShaderCylinder("CylinderImpostor");
        //this.createImpostorShaderCylinder("HyperballStickImpostor");
    }

    getShader (name) { var ic = this.icn3d, me = ic.icn3dui;
      var shaderText = $NGL_shaderTextHash[name];
      var reInclude = /#include\s+(\S+)/gmi;

      shaderText = shaderText.replace( reInclude, function( match, p1 ){

            var chunk;
            if(THREE.ShaderChunk.hasOwnProperty(p1)) {
                chunk = THREE.ShaderChunk[ p1 ];
            }

            return chunk ? chunk : "";

      } );

      return shaderText;
    }

    createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize) { var ic = this.icn3d, me = ic.icn3dui;
      var shaderMaterial =
        new THREE.ShaderMaterial({
          defines: ic.defines,
          uniforms:  ic.uniforms,
          vertexShader:   this.getShader(shaderName + ".vert"),
          fragmentShader: this.getShader(shaderName + ".frag"),
          depthTest: true,
          depthWrite: true,
          //needsUpdate: true,
          lights: true
      });

      shaderMaterial.extensions.fragDepth = true;

      if(shaderName == 'CylinderImpostor') {
          ic.CylinderImpostorMaterial = shaderMaterial;
      }
      else if(shaderName == 'SphereImpostor') {
          ic.SphereImpostorMaterial = shaderMaterial;
      }

        //MappedBuffer
        var attributeSize = count * mappingSize;

        var n = count * mappingIndicesSize;
        var TypedArray = attributeSize > 65535 ? Uint32Array : Uint16Array;
        var index = new TypedArray( n );

            //makeIndex();
        var ix, it;

        for( var v = 0; v < count; v++ ) {
            ix = v * mappingIndicesSize;
            it = v * mappingSize;

            index.set( mappingIndices, ix );

            for( var s = 0; s < mappingIndicesSize; ++s ){
                index[ ix + s ] += it;
            }
        }


        var geometry = new THREE.BufferGeometry();

        // buffer.js
        var dynamic = true;

        if( index ){
            geometry.setIndex(
                new THREE.BufferAttribute( index, 1 )
            );
            geometry.getIndex().setDynamic( dynamic );
        }

        // add attributes from buffer.js
        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        for( var name in attributeData ){

            var buf;
            var a = attributeData[ name ];

                buf = new Float32Array(
                    attributeSize * itemSize[ a.type ]
                );

            geometry.setAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
                    .setDynamic( dynamic )
            );

        }

        // set attributes from mapped-buffer.js
        var attributes = geometry.attributes;

        var a, d, itemSize2, array, i, j;

        for( var name in data ){

            d = data[ name ];
            a = attributes[ name ];
            itemSize2 = a.itemSize;
            array = a.array;

            for( var k = 0; k < count; ++k ) {

                n = k * itemSize2;
                i = n * mappingSize;

                for( var l = 0; l < mappingSize; ++l ) {

                    j = i + ( itemSize2 * l );

                    for( var m = 0; m < itemSize2; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            a.needsUpdate = true;

        }

        // makemapping
        var aMapping = geometry.attributes.mapping.array;

        for( var v = 0; v < count; v++ ) {
            aMapping.set( mapping, v * mappingItemSize * mappingSize );
        }

        var mesh = new THREE.Mesh(geometry, shaderMaterial);

        // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
        // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
        mesh.frustumCulled = false;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.0;

        if(shaderName == 'CylinderImpostor') {
          mesh.type = 'Cylinder';
        }
        else if(shaderName == 'SphereImpostor') {
          mesh.type = 'Sphere';
        }

        //mesh.onBeforeRender = ic.onBeforeRender(ic.renderer, ic.scene, ic.cam, geometry, shaderMaterial);
        mesh.onBeforeRender = this.onBeforeRender;

        ic.mdlImpostor.add(mesh);

        //ic.objects.push(mesh);
    }

    createImpostorShaderCylinder(shaderName) { var ic = this.icn3d, me = ic.icn3dui;
        var positions = new Float32Array( ic.posArray );
        var colors = new Float32Array( ic.colorArray );
        var positions2 = new Float32Array( ic.pos2Array );
        var colors2 = new Float32Array( ic.color2Array );
        var radii = new Float32Array( ic.radiusArray );

        // cylinder
        var mapping = new Float32Array([
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0
        ]);

        var mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 4, 2,
            2, 4, 3,
            4, 5, 3
        ]);

        var mappingIndicesSize = 12;
        var mappingType = "v3";
        var mappingSize = 6;
        var mappingItemSize = 3;


        var count = positions.length / 3;

        var data = {
            "position1": positions,
            "color": colors,
            "position2": positions2,
            "color2": colors2,
            "radius": radii
        };

        var attributeData = {
            "position1": { type: "v3", value: null },
            "color": { type: "v3", value: null },
            "position2": { type: "v3", value: null },
            "color2": { type: "v3", value: null },
            "radius": { type: "f", value: null },
            "mapping": { type: mappingType, value: null }
        };

        this.createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize);

        data = null;
        positions = null;
        colors = null;
        positions2 = null;
        colors2 = null;
        radii = null;

      ic.posArray = [];
      ic.colorArray = [];
      ic.pos2Array = [];
      ic.color2Array = [];
      ic.radiusArray = [];
    }

    createImpostorShaderSphere(shaderName) { var ic = this.icn3d, me = ic.icn3dui;
        var positions = new Float32Array( ic.posArraySphere );
        var colors = new Float32Array( ic.colorArraySphere );
        var radii = new Float32Array( ic.radiusArraySphere );

        // sphere
        var mapping = new Float32Array([
            -1.0,  1.0,
            -1.0, -1.0,
             1.0,  1.0,
             1.0, -1.0
        ]);

        var mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 3, 2
        ]);

        var mappingIndicesSize = 6;
        var mappingType = "v2";
        var mappingSize = 4;
        var mappingItemSize = 2;

        var count = positions.length / 3;

        var data = {
            "position": positions,
            "color": colors,
            "radius": radii
        };

        var attributeData = {
            "position": { type: "v3", value: null },
            "color": { type: "v3", value: null },
            "radius": { type: "f", value: null },
            "mapping": { type: mappingType, value: null }
        };

        this.createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize);

        data = null;
        positions = null;
        colors = null;
        radii = null;

      ic.posArraySphere = [];
      ic.colorArraySphere = [];
      ic.radiusArraySphere = [];
    }

    clearImpostors() { var ic = this.icn3d, me = ic.icn3dui;
        ic.posArray = [];
        ic.colorArray = [];
        ic.pos2Array = [];
        ic.color2Array = [];
        ic.radiusArray = [];

        ic.posArraySphere = [];
        ic.colorArraySphere = [];
        ic.radiusArraySphere = [];
    }

}

export {Impostor}