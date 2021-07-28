/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

class Impostor {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    onBeforeRender(renderer, scene, camera, geometry, material, group) {
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

    setParametersForShader (opacity) { let ic = this.icn3d, me = ic.icn3dui;
        let background = me.parasCls.backgroundColors[ic.opts.background.toLowerCase()];

        let near = 2.5*ic.maxD;
        let far = 4*ic.maxD;

        let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;

        let nearClip;
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

        let opacityValue = (opacity !== undefined) ? opacity : 1.0;

        let shiness = ic.shininess / 100.0 * 0.5;

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
            emissive: { type: "v3", value: [0.06,0.06,0.06] }, //[0.0,0.0,0.0] },
            roughness: { type: "f", value: 0.5 },
            metalness: { type: "f", value: shiness } , //0.3 },
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

    drawImpostorShader () { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        this.setParametersForShader();

        this.createImpostorShaderSphere("SphereImpostor");
        this.createImpostorShaderCylinder("CylinderImpostor");
        //this.createImpostorShaderCylinder("HyperballStickImpostor");
    }

    getShader (name) { let ic = this.icn3d, me = ic.icn3dui;
      let shaderText = $NGL_shaderTextHash[name];
      let reInclude = /#include\s+(\S+)/gmi;

      shaderText = shaderText.replace( reInclude, function( match, p1 ){

            let chunk;
            if(THREE.ShaderChunk.hasOwnProperty(p1)) {
                chunk = THREE.ShaderChunk[ p1 ];
            }

            return chunk ? chunk : "";

      } );

      return shaderText;
    }

    createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize) { let ic = this.icn3d, me = ic.icn3dui;
      let shaderMaterial =
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
        let attributeSize = count * mappingSize;

        let n = count * mappingIndicesSize;
        let TypedArray = attributeSize > 65535 ? Uint32Array : Uint16Array;
        let index = new TypedArray( n );

            //makeIndex();
        let ix, it;

        for( let v = 0; v < count; v++ ) {
            ix = v * mappingIndicesSize;
            it = v * mappingSize;

            index.set( mappingIndices, ix );

            for( let s = 0; s < mappingIndicesSize; ++s ){
                index[ ix + s ] += it;
            }
        }


        let geometry = new THREE.BufferGeometry();

        // buffer.js
        let dynamic = true;

        if( index ){
            geometry.setIndex(
                new THREE.BufferAttribute( index, 1 )
            );
            //https://discourse.threejs.org/t/what-is-setusage-on-bufferattribute/12441
            geometry.getIndex().setUsage(THREE.DynamicDrawUsage); //.setDynamic( dynamic );
        }

        // add attributes from buffer.js
        let itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        for( let name in attributeData ){

            let buf;
            let a = attributeData[ name ];

                buf = new Float32Array(
                    attributeSize * itemSize[ a.type ]
                );

            geometry.setAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
                    .setUsage(THREE.DynamicDrawUsage) //.setDynamic( dynamic )
            );

        }

        // set attributes from mapped-buffer.js
        let attributes = geometry.attributes;

        let a, d, itemSize2, array, i, j;

        for( let name in data ){

            d = data[ name ];
            a = attributes[ name ];
            itemSize2 = a.itemSize;
            array = a.array;

            for( let k = 0; k < count; ++k ) {

                n = k * itemSize2;
                i = n * mappingSize;

                for( let l = 0; l < mappingSize; ++l ) {

                    j = i + ( itemSize2 * l );

                    for( let m = 0; m < itemSize2; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            a.needsUpdate = true;

        }

        // makemapping
        let aMapping = geometry.attributes.mapping.array;

        for( let v = 0; v < count; v++ ) {
            aMapping.set( mapping, v * mappingItemSize * mappingSize );
        }

        let mesh = new THREE.Mesh(geometry, shaderMaterial);

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

        //mesh.onBeforeRender = this.onBeforeRender(ic.renderer, ic.scene, ic.cam, geometry, shaderMaterial);
        mesh.onBeforeRender = this.onBeforeRender;

        ic.mdlImpostor.add(mesh);

        //ic.objects.push(mesh);
    }

    createImpostorShaderCylinder(shaderName) { let ic = this.icn3d, me = ic.icn3dui;
        let positions = new Float32Array( ic.posArray );
        let colors = new Float32Array( ic.colorArray );
        let positions2 = new Float32Array( ic.pos2Array );
        let colors2 = new Float32Array( ic.color2Array );
        let radii = new Float32Array( ic.radiusArray );

        // cylinder
        let mapping = new Float32Array([
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0
        ]);

        let mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 4, 2,
            2, 4, 3,
            4, 5, 3
        ]);

        let mappingIndicesSize = 12;
        let mappingType = "v3";
        let mappingSize = 6;
        let mappingItemSize = 3;


        let count = positions.length / 3;

        let data = {
            "position1": positions,
            "color": colors,
            "position2": positions2,
            "color2": colors2,
            "radius": radii
        };

        let attributeData = {
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

    createImpostorShaderSphere(shaderName) { let ic = this.icn3d, me = ic.icn3dui;
        let positions = new Float32Array( ic.posArraySphere );
        let colors = new Float32Array( ic.colorArraySphere );
        let radii = new Float32Array( ic.radiusArraySphere );

        // sphere
        let mapping = new Float32Array([
            -1.0,  1.0,
            -1.0, -1.0,
             1.0,  1.0,
             1.0, -1.0
        ]);

        let mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 3, 2
        ]);

        let mappingIndicesSize = 6;
        let mappingType = "v2";
        let mappingSize = 4;
        let mappingItemSize = 2;

        let count = positions.length / 3;

        let data = {
            "position": positions,
            "color": colors,
            "radius": radii
        };

        let attributeData = {
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

    clearImpostors() { let ic = this.icn3d, me = ic.icn3dui;
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