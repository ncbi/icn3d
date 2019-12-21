/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// generate a binary STL file for 3D printing
// https://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL
/*
UINT8[80] – Header
UINT32 – Number of triangles

foreach triangle
REAL32[3] – Normal vector
REAL32[3] – Vertex 1
REAL32[3] – Vertex 2
REAL32[3] – Vertex 3
UINT16 – Attribute byte count
end
*/

iCn3DUI.prototype.getFaceCnt = function( mdl ){ var me = this; //"use strict";
    var cntFaces = 0;
    for(var i = 0, il = mdl.children.length; i < il; ++i) {
         var mesh = mdl.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var faces = geometry.faces;
         if(faces !== undefined) {
             for(var j = 0, jl = faces.length; j < jl; ++j) {
                 ++cntFaces;
             }
         }
    }

    return cntFaces;
};

iCn3DUI.prototype.saveStlFile = function( mat ){ var me = this; //"use strict";
    if(Object.keys(me.icn3d.dAtoms).length > 70000) {
        alert('Please display a subset of the structure to export 3D files. Then merge the files for 3D printing...');
        return [''];
    }

    me.prepareFor3Dprint();

    var cntFaces = 0;

    cntFaces += me.getFaceCnt(me.icn3d.mdl);
    cntFaces += me.getFaceCnt(me.icn3d.mdl_ghost);

    var blobArray = []; // hold blobs

    var stlArray = new Uint8Array(84);

    // UINT8[80] – Header
    var title = 'STL file for the structure(s) ';
    var structureArray = Object.keys(me.icn3d.structures);
    for(var i = 0, il = structureArray.length; i < il; ++i) {
        title += structureArray[i];
        if(i < il - 1) title += ', ';
    }

    if(title.length > 80) title = title.substr(0, 80);

    for(var i = 0; i < 80; ++i) {
        if(i < title.length) {
            stlArray[i] = me.passInt8([title.charCodeAt(i)])[0];
        }
        else {
            stlArray[i] = me.passInt8([' '.charCodeAt(0)])[0];
        }
    }

    // UINT32 – Number of triangles
    if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly
      && Object.keys(me.icn3d.dAtoms).length * me.icn3d.biomtMatrices.length <= me.icn3d.maxAtoms3DMultiFile ) {
        stlArray = me.updateArray( stlArray, me.passInt32([cntFaces * me.icn3d.biomtMatrices.length]), 80 );
    }
    else {
        stlArray = me.updateArray( stlArray, me.passInt32([cntFaces]), 80 );
    }

    blobArray.push(new Blob([stlArray],{ type: "application/octet-stream"}));

    blobArray = me.processStlMeshGroup( me.icn3d.mdl, blobArray, mat );

    blobArray = me.processStlMeshGroup( me.icn3d.mdl_ghost, blobArray, mat );

   // assemblies
   if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly
     && Object.keys(me.icn3d.dAtoms).length * me.icn3d.biomtMatrices.length <= me.icn3d.maxAtoms3DMultiFile ) {
        var identity = new THREE.Matrix4();
        identity.identity();

        for (var i = 0; i < me.icn3d.biomtMatrices.length; i++) {  // skip itself
          var mat1 = me.icn3d.biomtMatrices[i];
          if (mat1 === undefined) continue;

          // skip itself
          if(mat1.equals(identity)) continue;

          blobArray = me.processStlMeshGroup( me.icn3d.mdl, blobArray, mat1 );

          blobArray = me.processStlMeshGroup( me.icn3d.mdl_ghost, blobArray, mat1 );
        }
    }

    //me.resetAfter3Dprint();

    return blobArray;
};

iCn3DUI.prototype.updateArray = function( array, inArray, indexBase ){ var me = this; //"use strict";
    for( var i = 0, il = inArray.length; i < il; ++i ){
        array[indexBase + i] = inArray[i];
    };
    return array;
};

iCn3DUI.prototype.processStlMeshGroup = function( mdl, blobArray, mat ){ var me = this; //"use strict";
    for(var i = 0, il = mdl.children.length; i < il; ++i) {
         var mesh = mdl.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var vertices = geometry.vertices;
         var faces = geometry.faces;

         if(faces === undefined) continue;

         var position = mesh.position;
         var scale = mesh.scale;

         var matrix = mesh.matrix;

         var stlArray = new Uint8Array(faces.length * 50);

         var index = 0;

         for(var j = 0, jl = faces.length; j < jl; ++j) {
             var a = faces[j].a;
             var b = faces[j].b;
             var c = faces[j].c;
             var normal = faces[j].normal;

             var v1, v2, v3;

             if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry') {
                 v1 = vertices[a].clone().multiply(scale).add(position);
                 v2 = vertices[b].clone().multiply(scale).add(position);
                 v3 = vertices[c].clone().multiply(scale).add(position);
             }
              else if(geometry.type == 'CylinderGeometry') {
                 v1 = vertices[a].clone().applyMatrix4(matrix);
                 v2 = vertices[b].clone().applyMatrix4(matrix);
                 v3 = vertices[c].clone().applyMatrix4(matrix);
             }
             else {
                 v1 = vertices[a].clone();
                 v2 = vertices[b].clone();
                 v3 = vertices[c].clone();
             }

             //REAL32[3] – Normal vector
             //REAL32[3] – Vertex 1
             //REAL32[3] – Vertex 2
             //REAL32[3] – Vertex 3
             //UINT16 – Attribute byte count

             if(normal !== undefined) {
                 if(mat !== undefined) normal.applyMatrix4(mat);

                 stlArray = me.updateArray( stlArray, me.passFloat32([normal.x, normal.y, normal.z]), index );
                 index += 12;
             }
             else {
                 stlArray = me.updateArray( stlArray, me.passFloat32([0.0, 0.0, 0.0]), index );
                 index += 12;
             }

             if(mat !== undefined) {
                 v1.applyMatrix4(mat);
                 v2.applyMatrix4(mat);
                 v3.applyMatrix4(mat);
             }

             stlArray = me.updateArray( stlArray, me.passFloat32([v1.x, v1.y, v1.z]), index );
             index += 12;
             stlArray = me.updateArray( stlArray, me.passFloat32([v2.x, v2.y, v2.z]), index );
             index += 12;
             stlArray = me.updateArray( stlArray, me.passFloat32([v3.x, v3.y, v3.z]), index );
             index += 12;

             v1 = v2 = v3 = undefined;

             stlArray = me.updateArray( stlArray, me.passInt16([0]), index );
             index += 2;
         }

         blobArray.push(new Blob([stlArray],{ type: "application/octet-stream"}));
         stlArray = null;
    }

    return blobArray;
};
