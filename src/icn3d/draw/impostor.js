/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setParametersForShader = function () { var me = this;
    var modelViewMatrix = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function( object ){
                this.value.copy( object.modelViewMatrix );
    } );

    var modelViewMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function( object ){
                this.value.getInverse( object.modelViewMatrix );
    } );

    var modelViewMatrixInverseTranspose = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function( object ){
                this.value.getInverse( object.modelViewMatrix ).transpose();
    } );

    var modelViewProjectionMatrix = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function( object ){
                this.value.multiplyMatrices( me.cam.projectionMatrix, object.modelViewMatrix );
    } );

    var modelViewProjectionMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function( object ){
                var tmpMatrix = new THREE.Matrix4();
                tmpMatrix.multiplyMatrices(me.cam.projectionMatrix, object.modelViewMatrix);
                this.value.getInverse(tmpMatrix);
    } );

    var projectionMatrix = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function(  ){
                this.value.copy( me.cam.projectionMatrix );
    } );

    var projectionMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
            .onUpdate( function(  ){
                this.value.getInverse( me.cam.projectionMatrix );
    } );

    var background = this.backgroundColors[this.opts.background.toLowerCase()];
    var near = 2 * this.maxD;
    //var far = 2.5 * this.maxD;
    var far = 3 * this.maxD;

    this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib.common,
      {
        modelViewMatrix: modelViewMatrix,
        modelViewMatrixInverse: modelViewMatrixInverse,
        modelViewMatrixInverseTranspose: modelViewMatrixInverseTranspose,
        modelViewProjectionMatrix: modelViewProjectionMatrix,
        modelViewProjectionMatrixInverse: modelViewProjectionMatrixInverse,
        projectionMatrix: projectionMatrix,
        projectionMatrixInverse: projectionMatrixInverse,
        //ambientLightColor: { type: "v3", value: [0.25, 0.25, 0.25] },
        diffuse: { type: "v3", value: [1.0, 1.0, 1.0] },
        emissive: { type: "v3", value: [0.0,0.0,0.0] },
        roughness: { type: "f", value: 0.5 }, // 0.4
        metalness: { type: "f", value: 0.3 }, // 0.5
        opacity: { type: "f", value: 1.0 },
        nearClip: { type: "f", value: 0.1 },
        ortho: { type: "f", value: 0.0 },
        shrink: { type: "f", value: 0.13 },
        fogColor: { type: "v3", value: [background.r, background.g, background.b] },
        fogNear: { type: "f", value: near },
        fogFar: { type: "f", value: far },
        fogDensity: { type: "f", value: 2.0 },
        vViewPosition: { type: "v3", value: [this.cam.position.x, this.cam.position.y, this.cam.position.z] }
      },
        THREE.UniformsLib.ambient,
        THREE.UniformsLib.lights
    ]);

    /*
    //fog_pars_fragment
    #ifdef USE_FOG
        uniform vec3 fogColor;
        #ifdef FOG_EXP2
            uniform float fogDensity;
        #else
            uniform float fogNear;
            uniform float fogFar;
        #endif
    #endif
    */

    this.defines = {
        USE_COLOR: 1,
        //PICKING: 1,
        NEAR_CLIP: 1,
        CAP: 1
    };

    if(this.opts['fog'] === 'yes') {
        this.defines['USE_FOG'] = 1;
        if(this.opts['camera'] === 'orthographic') {
            this.defines['FOG_EXP2'] = 1;
        }
    }

    if(this.bExtFragDepth) {
        this.defines['USE_LOGDEPTHBUF_EXT'] = 1;
    }
};

iCn3D.prototype.drawImpostorShader = function () { var me = this;
    this.setParametersForShader();

    this.createImpostorShaderSphere("SphereImpostor");
    this.createImpostorShaderCylinder("CylinderImpostor");
    //this.createImpostorShaderCylinder("HyperballStickImpostor");
};

iCn3D.prototype.getShader = function (name) { var me = this;
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
};

iCn3D.prototype.createImpostorShaderBase = function (shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize) { var me = this;
  var shaderMaterial =
    new THREE.ShaderMaterial({
      defines: me.defines,
      uniforms:  me.uniforms,
      vertexShader:   me.getShader(shaderName + ".vert"),
      fragmentShader: me.getShader(shaderName + ".frag"),
      depthTest: true,
      depthWrite: true,
      needsUpdate: true,
      lights: true
  });

  shaderMaterial.extensions.fragDepth = true;

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

        geometry.addAttribute(
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

    this.mdlImpostor.add(mesh);

    //this.objects.push(mesh);
};

iCn3D.prototype.createImpostorShaderCylinder = function (shaderName) { var me = this;
    var positions = new Float32Array( me.posArray );
    var colors = new Float32Array( me.colorArray );
    var positions2 = new Float32Array( me.pos2Array );
    var colors2 = new Float32Array( me.color2Array );
    var radii = new Float32Array( me.radiusArray );

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
};

iCn3D.prototype.createImpostorShaderSphere = function (shaderName) { var me = this;
    var positions = new Float32Array( me.posArraySphere );
    var colors = new Float32Array( me.colorArraySphere );
    var radii = new Float32Array( me.radiusArraySphere );

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
};
