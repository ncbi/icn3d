/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.positionFromGeometry = function( mesh ){
    var geometry = mesh.geometry;

    var vertices = geometry.vertices;

    var meshPosition = mesh.position;
    var scale = mesh.scale;
    var matrix = mesh.matrix;

    var j, v3;
    var n = vertices.length;
    //var position = new Float32Array( n * 3 );
    var position = [];

    for( var v = 0; v < n; v++ ){

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

};


iCn3D.prototype.colorFromGeometry = function( mesh ){
    var geometry = mesh.geometry;

    var meshColor = new THREE.Color(1, 1, 1);
    if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
         if(mesh.material !== undefined) meshColor = mesh.material.color;
    }

    var faces = geometry.faces;
    var vn = geometry.vertices.length;

    var bSurfaceVertex = (geometry.type == 'Surface') ? true : false;

    var j, f, c1, c2, c3;
    var n = faces.length;
    //var color = new Float32Array( vn * 3 );
    var color = [];

    for( var v = 0; v < n; v++ ){

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

};


iCn3D.prototype.indexFromGeometry = function( mesh ){
    var geometry = mesh.geometry;

    var faces = geometry.faces;

    var j, f;
    var n = faces.length;
    //var TypedArray = n * 3 > 65535 ? Uint32Array : Uint16Array;
    //var index = new TypedArray( n * 3 );
    var index = [];

    for( var v = 0; v < n; v++ ){

        j = v * 3;
        f = faces[ v ];

        index[ j + 0 ] = f.a;
        index[ j + 1 ] = f.b;
        index[ j + 2 ] = f.c;

    }

    return index;

};


iCn3D.prototype.normalFromGeometry = function( mesh ){
    var geometry = mesh.geometry;

    var faces = geometry.faces;
    var vn = geometry.vertices.length;

    var j, f, nn, n1, n2, n3;
    var n = faces.length;
    //var normal = new Float32Array( vn * 3 );
    var normal = [];

    for( var v = 0; v < n; v++ ){

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

};

iCn3D.prototype.hashvalue2array = function(hash) {
    return $.map(hash, function(v) { return v; });
};

iCn3D.prototype.drawSymmetryMates = function() {
    //if(this.bInstanced) {
    if(this.bInstanced && Object.keys(this.atoms).length * this.biomtMatrices.length > this.maxatomcnt) {
        this.drawSymmetryMatesInstancing();
    }
    else {
        this.drawSymmetryMatesNoInstancing();
    }
}

iCn3D.prototype.drawSymmetryMatesNoInstancing = function() {
   if (this.biomtMatrices === undefined || this.biomtMatrices.length == 0) return;
   var cnt = 1; // itself
   var centerSum = this.center.clone();

   var identity = new THREE.Matrix4();
   identity.identity();

   for (var i = 0; i < this.biomtMatrices.length; i++) {  // skip itself
      var mat = this.biomtMatrices[i];
      if (mat === undefined) continue;

      // skip itself
      if(mat.equals(identity)) continue;

      var symmetryMate = this.mdl.clone();
      symmetryMate.applyMatrix(mat);

      this.mdl.add(symmetryMate);

      symmetryMate = this.mdlImpostor.clone();
      symmetryMate.applyMatrix(mat);

      //symmetryMate.onBeforeRender = this.onBeforeRender;
      for(var j = symmetryMate.children.length - 1; j >= 0; j--) {
           var mesh = symmetryMate.children[j];
           mesh.onBeforeRender = this.onBeforeRender;
      }

      this.mdlImpostor.add(symmetryMate);

      //symmetryMate = this.mdlPicking.clone();
      //symmetryMate.applyMatrix(mat);

      //this.mdlPicking.add(symmetryMate);

      symmetryMate = this.mdl_ghost.clone();
      symmetryMate.applyMatrix(mat);

      this.mdl_ghost.add(symmetryMate);

      var center = this.center.clone();
      center.applyMatrix4(mat);
      centerSum.add(center);

      ++cnt;
   }

   if(this.bSetInstancing === undefined || !this.bSetInstancing) {
       this.maxD *= Math.sqrt(cnt);

       this.center = centerSum.multiplyScalar(1.0 / cnt);

       this.maxDAssembly = this.maxD;

       this.centerAssembly = this.center.clone();

       this.setCenter(this.center);

       // reset cameara
       this.setCamera();
   }
   else {
       this.maxD = this.maxDAssembly;

       this.center = this.centerAssembly.clone();

       this.setCenter(this.center);

       // reset cameara
       this.setCamera();
   }

   this.bSetInstancing = true;
};

iCn3D.prototype.createInstancedGeometry = function(mesh) {
   var baseGeometry = mesh.geometry;

   var geometry = new THREE.InstancedBufferGeometry();

   var positionArray = [];
   var normalArray = [];
   var colorArray = [];
   var indexArray = [];

   var radiusArray = [];
   var mappingArray = [];
   var position2Array = [];
   var color2Array = [];

   if( baseGeometry.vertices && baseGeometry.faces ){
       this.instancedMaterial = this.getInstancedMaterial('Instancing');

       positionArray = positionArray.concat(this.positionFromGeometry( mesh ));
       normalArray = normalArray.concat(this.normalFromGeometry( mesh ));
       colorArray = colorArray.concat(this.colorFromGeometry( mesh ));
       indexArray = indexArray.concat(this.indexFromGeometry( mesh ));

       var bCylinderArray = [];
       var bCylinder = (baseGeometry.type == 'CylinderGeometry') ? 1.0 : 0.0;
       for(var i = 0, il = positionArray.length / 3; i < il; ++i) {
           bCylinderArray.push(bCylinder);
       }

       geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
       geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normalArray), 3) );
       geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );

       geometry.addAttribute('cylinder', new THREE.BufferAttribute(new Float32Array(bCylinderArray), 1) );
       geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));
   }
   else if(this.bImpo && baseGeometry.attributes.color2 !== undefined) { // cylinder
       this.instancedMaterial = this.getInstancedMaterial('CylinderInstancing');

       positionArray = positionArray.concat(this.hashvalue2array(baseGeometry.attributes.position1.array));
       colorArray = colorArray.concat(this.hashvalue2array(baseGeometry.attributes.color.array));

       position2Array = position2Array.concat(this.hashvalue2array(baseGeometry.attributes.position2.array));
       color2Array = color2Array.concat(this.hashvalue2array(baseGeometry.attributes.color2.array));

       indexArray = indexArray.concat(this.hashvalue2array(baseGeometry.index.array));
       radiusArray = radiusArray.concat(this.hashvalue2array(baseGeometry.attributes.radius.array));
       mappingArray = mappingArray.concat(this.hashvalue2array(baseGeometry.attributes.mapping.array));

       geometry.addAttribute('position1', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
       geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );

       geometry.addAttribute('position2', new THREE.BufferAttribute(new Float32Array(position2Array), 3));
       geometry.addAttribute('color2', new THREE.BufferAttribute(new Float32Array(color2Array), 3) );

       geometry.addAttribute('radius', new THREE.BufferAttribute(new Float32Array(radiusArray), 1) );
       geometry.addAttribute('mapping', new THREE.BufferAttribute(new Float32Array(mappingArray), 3) );
       geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));
   }
   else if(this.bImpo && baseGeometry.attributes.color !== undefined) { // sphere
       this.instancedMaterial = this.getInstancedMaterial('SphereInstancing');

       positionArray = positionArray.concat(this.hashvalue2array(baseGeometry.attributes.position.array));
       colorArray = colorArray.concat(this.hashvalue2array(baseGeometry.attributes.color.array));
       indexArray = indexArray.concat(this.hashvalue2array(baseGeometry.index.array));
       radiusArray = radiusArray.concat(this.hashvalue2array(baseGeometry.attributes.radius.array));
       mappingArray = mappingArray.concat(this.hashvalue2array(baseGeometry.attributes.mapping.array));

       geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
       geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), 3) );
       geometry.addAttribute('radius', new THREE.BufferAttribute(new Float32Array(radiusArray), 1) );
       geometry.addAttribute('mapping', new THREE.BufferAttribute(new Float32Array(mappingArray), 2) );
       geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));
   }

   positionArray = [];
   normalArray = [];
   colorArray = [];
   indexArray = [];

   radiusArray = [];
   mappingArray = [];
   position2Array = [];
   color2Array = [];

   var matricesAttribute1 = new THREE.InstancedBufferAttribute( new Float32Array( this.matricesElements1 ), 4 );
   var matricesAttribute2 = new THREE.InstancedBufferAttribute( new Float32Array( this.matricesElements2 ), 4 );
   var matricesAttribute3 = new THREE.InstancedBufferAttribute( new Float32Array( this.matricesElements3 ), 4 );
   var matricesAttribute4 = new THREE.InstancedBufferAttribute( new Float32Array( this.matricesElements4 ), 4 );

   geometry.addAttribute( 'matrix1', matricesAttribute1 );
   geometry.addAttribute( 'matrix2', matricesAttribute2 );
   geometry.addAttribute( 'matrix3', matricesAttribute3 );
   geometry.addAttribute( 'matrix4', matricesAttribute4 );

   return geometry;
};

iCn3D.prototype.getInstancedMaterial = function(name) {
   //var material = new THREE.RawShaderMaterial({
   var material = new THREE.ShaderMaterial({
      defines: this.defines,
      uniforms:  this.uniforms,
      vertexShader:   this.getShader(name + ".vert"),
      fragmentShader: this.getShader(name + ".frag"),
      depthTest: true,
      depthWrite: true,
      needsUpdate: true,
      lights: true
   });

   material.extensions.fragDepth = true;
   //https://stackoverflow.com/questions/33094496/three-js-shadermaterial-flatshading
   material.extensions.derivatives = '#extension GL_OES_standard_derivatives : enable';

   return material;
}

iCn3D.prototype.drawSymmetryMatesInstancing = function() {
   if (this.biomtMatrices === undefined || this.biomtMatrices.length == 0) return;
   var cnt = 1; // itself
   var centerSum = this.center.clone();

   this.setParametersForShader();

   if(this.bSetInstancing === undefined || !this.bSetInstancing) {
       //this.offsets = [];
       //this.orientations = [];
       this.matricesElements1 = [];
       this.matricesElements2 = [];
       this.matricesElements3 = [];
       this.matricesElements4 = [];

       var identity = new THREE.Matrix4();
       identity.identity();

       for (var i = 0; i < this.biomtMatrices.length; i++) {  // skip itself
          var mat = this.biomtMatrices[i];
          if (mat === undefined) continue;

          var matArray = mat.toArray();

          // skip itself
          if(mat.equals(identity)) continue;

          this.matricesElements1.push(matArray[0], matArray[1], matArray[2], matArray[3]);
          this.matricesElements2.push(matArray[4], matArray[5], matArray[6], matArray[7]);
          this.matricesElements3.push(matArray[8], matArray[9], matArray[10], matArray[11]);
          this.matricesElements4.push(matArray[12], matArray[13], matArray[14], matArray[15]);

          var center = this.center.clone();
          center.applyMatrix4(mat);
          centerSum.add(center);

          ++cnt;
       }
   }

   for(var i = 0, il = this.mdl.children.length; i < il; ++i) {
       var mesh = this.mdl.children[i];

       if(mesh.type === 'Sprite') continue;

       var geometry = this.createInstancedGeometry(mesh);

       var mesh2 = new THREE.Mesh(geometry, this.instancedMaterial);

       mesh2.onBeforeRender = this.onBeforeRender;

       // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
       // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
       mesh2.frustumCulled = false;

       geometry = undefined;

       this.mdl.add(mesh2);
   }

   for(var i = 0, il = this.mdlImpostor.children.length; i < il; ++i) {
       var mesh = this.mdlImpostor.children[i];

       var geometry = this.createInstancedGeometry(mesh);

/*
       var material;
       if(mesh.type == 'Sphere') {
         material = this.SphereImpostorMaterial;
       }
       else { //if(mesh.type == 'Cylinder') {
         material = this.CylinderImpostorMaterial;
       }
*/
       var mesh2 = new THREE.Mesh(geometry, this.instancedMaterial);
       //var mesh2 = new THREE.Mesh(geometry, material);

       mesh2.onBeforeRender = this.onBeforeRender;

       // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
       // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
       mesh2.frustumCulled = false;

       geometry = undefined;

       this.mdlImpostor.add(mesh2);
   }

   if(this.bSetInstancing === undefined || !this.bSetInstancing) {
       this.maxD *= Math.sqrt(cnt);

       this.center = centerSum.multiplyScalar(1.0 / cnt);

       this.maxDAssembly = this.maxD;

       this.centerAssembly = this.center.clone();

       this.setCenter(this.center);

       // reset cameara
       this.setCamera();
   }
   else {
       this.maxD = this.maxDAssembly;

       this.center = this.centerAssembly.clone();

       this.setCenter(this.center);

       // reset cameara
       this.setCamera();
   }

   this.bSetInstancing = true;
};
