
//http://gun.teipir.gr/VRML-amgem/spec/part1/examples.html
iCn3DUI.prototype.saveVrmlFile = function(  ){ var me = this;
    if(Object.keys(me.icn3d.dAtoms).length > 50000) {
		alert('Please select a subset of the structures to display, then save the structures for 3D printing...');
		return [''];
	}

    me.prepareFor3Dprint();

    var vrmlStrArray = [];
    vrmlStrArray.push('#VRML V2.0 utf8\n');

//    vrmlStrArray += 'Transform {\n';
//    vrmlStrArray += '        translation ' + (-1 * me.icn3d.center.x.toPrecision(4)).toString() + ' ' + (-1 * me.icn3d.center.y.toPrecision(4)).toString() + ' ' + (-1 * me.icn3d.center.z.toPrecision(4)).toString() + '\n';
//    vrmlStrArray += '        children [\n';

    var vertexCnt = 0;
    var result = me.processVrmlMeshGroup( me.icn3d.mdl, vrmlStrArray, vertexCnt );
    vrmlStrArray = result.vrmlStrArray;
    vertexCnt = result.vertexCnt;

    result = me.processVrmlMeshGroup( me.icn3d.mdl_ghost, vrmlStrArray, vertexCnt );
    vrmlStrArray = result.vrmlStrArray;
    vertexCnt = result.vertexCnt;

    // remove the last ',\n';
//    var vrmlStrArray = vrmlStrArray.substr(0, vrmlStrArray.lastIndexOf(',')) + '\n';

//    vrmlStrArray += '        ]\n';
//    vrmlStrArray += '}\n';

    //me.resetAfter3Dprint();

    //return vrmlStrArray.join('');
    return vrmlStrArray;
};

// The file lost face color after being repaired by https://service.netfabb.com/. It only works with vertex color
// convert face color to vertex color
iCn3DUI.prototype.processVrmlMeshGroup = function( mdl, vrmlStrArray, vertexCnt ){ var me = this;
    for(var i = 0, il = mdl.children.length; i < il; ++i) {
         var mesh = mdl.children[i];
         if(mesh.type === 'Sprite') continue;

         var geometry = mesh.geometry;

         var materialType = mesh.material.type;
         var bSurfaceVertex = (geometry.type == 'Surface') ? true : false;

         var vertices = geometry.vertices;

         if(vertices === undefined) continue;
         vertexCnt += vertices.length;

         var faces = geometry.faces;

         var position = mesh.position;
         var scale = mesh.scale;

         var matrix = mesh.matrix;

         var meshColor = new THREE.Color(1, 1, 1);
         if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
             if(mesh.material !== undefined) meshColor = mesh.material.color;
         }

         vrmlStrArray.push('Shape {\n');
         vrmlStrArray.push('geometry IndexedFaceSet {\n');

         vrmlStrArray.push('coord Coordinate { point [ ');

         var vertexColorStrArray = [];
         for(var j = 0, jl = vertices.length; j < jl; ++j) {
             var vertex;
             if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry') {
                 vertex = vertices[j].clone().multiply(scale).add(position);
             }
              else if(geometry.type == 'CylinderGeometry') {
                 vertex = vertices[j].clone().applyMatrix4(matrix);
             }
             else {
                 vertex = vertices[j].clone()
             }

             vrmlStrArray.push(vertex.x.toPrecision(5) + ' ' + vertex.y.toPrecision(5) + ' ' + vertex.z.toPrecision(5));
             vertex = undefined;

             if(j < jl - 1) vrmlStrArray.push(', ');

             vertexColorStrArray.push(new THREE.Color(1, 1, 1));
         }
         vrmlStrArray.push(' ] }\n');

         var coordIndexStr = '', colorStr = '', colorIndexStr = '';
         if(bSurfaceVertex) {
             for(var j = 0, jl = faces.length; j < jl; ++j) {
                 var a = faces[j].a;
                 var b = faces[j].b;
                 var c = faces[j].c;

                 coordIndexStr += a + ' ' + b + ' ' + c;
                 // http://www.lighthouse3d.com/vrml/tutorial/index.shtml?indfs
                 // use -1 to separate polygons
                 if(j < jl - 1) coordIndexStr += ', -1, ';

                 // update vertexColorStrArray
                 vertexColorStrArray[a] = faces[j].vertexColors[0];
                 vertexColorStrArray[b] = faces[j].vertexColors[1];
                 vertexColorStrArray[c] = faces[j].vertexColors[2];
             }

             for(var j = 0, jl = vertexColorStrArray.length; j < jl; ++j) {
                 var color = vertexColorStrArray[j];
                 colorStr += color.r.toPrecision(3) + ' ' + color.g.toPrecision(3) + ' ' + color.b.toPrecision(3);
                 if(j < jl - 1) colorStr += ', ';
             }

             vrmlStrArray.push('coordIndex [ ' + coordIndexStr + ' ]\n');
             vrmlStrArray.push('color Color { color [ ' + colorStr + ' ] } colorPerVertex TRUE\n');
         }
         else {
             for(var j = 0, jl = faces.length; j < jl; ++j) {
                 var a = faces[j].a;
                 var b = faces[j].b;
                 var c = faces[j].c;
                 var color;
                 if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
                     color = meshColor;
                 }
                 else {
                     color = faces[j].color;
                 }

                 coordIndexStr += a + ' ' + b + ' ' + c;
                 // http://www.lighthouse3d.com/vrml/tutorial/index.shtml?indfs
                 // use -1 to separate polygons
                 if(j < jl - 1) coordIndexStr += ', -1, ';

                 // update vertexColorStrArray
                 vertexColorStrArray[a] = color;
                 vertexColorStrArray[b] = color;
                 vertexColorStrArray[c] = color;
             }

             for(var j = 0, jl = vertexColorStrArray.length; j < jl; ++j) {
                 var color = vertexColorStrArray[j];
                 colorStr += color.r.toPrecision(3) + ' ' + color.g.toPrecision(3) + ' ' + color.b.toPrecision(3);
                 if(j < jl - 1) colorStr += ', ';
             }

             vrmlStrArray.push('coordIndex [ ' + coordIndexStr + ' ]\n');
             vrmlStrArray.push('color Color { color [ ' + colorStr + ' ] } colorPerVertex TRUE\n');
         }

         vrmlStrArray.push('  }\n');
         vrmlStrArray.push('}\n');
    }

    return {'vrmlStrArray': vrmlStrArray,'vertexCnt': vertexCnt};
};
