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
iCn3DUI.prototype.saveStlFile = function(  ){ var me = this;
    if(Object.keys(me.icn3d.dAtoms).length > 70000) {
        alert('Please select a subset of the structures to display, then save the structures for 3D printing...');
        return [''];
    }

    me.prepareFor3Dprint();

    var cntFaces = 0;
    for(var i = 0, il = me.icn3d.mdl.children.length; i < il; ++i) {
         var mesh = me.icn3d.mdl.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var faces = geometry.faces;
         for(var j = 0, jl = faces.length; j < jl; ++j) {
             ++cntFaces;
         }
    }

    for(var i = 0, il = me.icn3d.mdl_ghost.children.length; i < il; ++i) {
         var mesh = me.icn3d.mdl_ghost.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var faces = geometry.faces;
         for(var j = 0, jl = faces.length; j < jl; ++j) {
             ++cntFaces;
         }
    }

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
    stlArray = me.updateArray( stlArray, me.passInt32([cntFaces]), 80 );

    blobArray.push(new Blob([stlArray],{ type: "application/octet-stream"}));

    blobArray = me.processStlMeshGroup( me.icn3d.mdl, blobArray );

    blobArray = me.processStlMeshGroup( me.icn3d.mdl_ghost, blobArray );

    //me.resetAfter3Dprint();

    return blobArray;
};

iCn3DUI.prototype.updateArray = function( array, inArray, indexBase ){ var me = this;
    for( var i = 0, il = inArray.length; i < il; ++i ){
        array[indexBase + i] = inArray[i];
    };
    return array;
};

iCn3DUI.prototype.passFloat32 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setFloat32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt8 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 1 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt8( 1 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt16 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 2 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt16( 2 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt32 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

// ------------

iCn3DUI.prototype.getUint8View = function( typedArray ){ var me = this;
    return me.getView( Uint8Array, typedArray );
};

iCn3DUI.prototype.getDataView = function( typedArray ){ var me = this;
    return me.getView( DataView, typedArray );
};

iCn3DUI.prototype.getView = function( ctor, typedArray, elemSize ){ var me = this;
    return typedArray ? new ctor(
        typedArray.buffer,
        typedArray.byteOffset,
        typedArray.byteLength / ( elemSize || 1 )
    ) : undefined;
};

iCn3DUI.prototype.processStlMeshGroup = function( mdl, blobArray ){ var me = this;
    for(var i = 0, il = mdl.children.length; i < il; ++i) {
         var mesh = mdl.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var vertices = geometry.vertices;
         var faces = geometry.faces;

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
                 stlArray = me.updateArray( stlArray, me.passFloat32([normal.x, normal.y, normal.z]), index );
                 index += 12;
             }
             else {
                 stlArray = me.updateArray( stlArray, me.passFloat32([0.0, 0.0, 0.0]), index );
                 index += 12;
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
    }

    return blobArray;
};
