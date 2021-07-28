/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';
import {ConvertTypeCls} from '../../utils/convertTypeCls.js';

import {ApplyMap} from '../surface/applyMap.js';

class Export3D {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    exportStlFile(postfix) { let ic = this.icn3d, me = ic.icn3dui;
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
            // use a smaller grid to build the surface for assembly
            ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
            ic.applyMapCls.removeSurfaces();
            ic.applyMapCls.applySurfaceOptions();
            ic.applyMapCls.removeMaps();
            ic.applyMapCls.applyMapOptions();
            ic.applyMapCls.removeEmmaps();
            ic.applyMapCls.applyEmmapOptions();
       }
       let text = this.saveStlFile();
       let file_pref =(ic.inputid) ? ic.inputid : "custom";
       ic.saveFileCls.saveFile(file_pref + postfix + '.stl', 'binary', text);
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
            alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
            let identity = new THREE.Matrix4();
            identity.identity();
            let index = 1;
            for(let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              let mat = ic.biomtMatrices[i];
              if(mat === undefined) continue;
              // skip itself
              if(mat.equals(identity)) continue;
              let time =(i + 1) * 100;
              //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
              setTimeout(function(mat, index){
                  text = this.saveStlFile(mat);
                  ic.saveFileCls.saveFile(file_pref + postfix + index + '.stl', 'binary', text);
                  text = '';
              }.bind(this, mat, index), time);
              ++index;
            }
            // reset grid to build the surface for assembly
            ic.threshbox = 180;
       }
    }

    exportVrmlFile(postfix) { let ic = this.icn3d, me = ic.icn3dui;
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
            // use a smaller grid to build the surface for assembly
            ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
            ic.applyMapCls.removeSurfaces();
            ic.applyMapCls.applySurfaceOptions();
            ic.applyMapCls.removeMaps();
            ic.applyMapCls.applyMapOptions();
            ic.applyMapCls.removeEmmaps();
            ic.applyMapCls.applyEmmapOptions();
       }
       let text = this.saveVrmlFile();
       let file_pref =(ic.inputid) ? ic.inputid : "custom";
       ic.saveFileCls.saveFile(file_pref + postfix + '.wrl', 'text', text);
       //ic.saveFileCls.saveFile(file_pref + postfix + '.vrml', 'text', text);
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
            alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
            let identity = new THREE.Matrix4();
            identity.identity();
            let index = 1;
            for(let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              let mat = ic.biomtMatrices[i];
              if(mat === undefined) continue;
              // skip itself
              if(mat.equals(identity)) continue;
              let time =(i + 1) * 100;
              //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
              setTimeout(function(mat, index){
                  text = this.saveVrmlFile(mat);
                  ic.saveFileCls.saveFile(ic.inputid + postfix + index + '.wrl', 'text', text);
                  //ic.saveFileCls.saveFile(file_pref + postfix + index + '.vrml', 'text', text);
                  text = '';
              }.bind(this, mat, index), time);
              ++index;
            }
            // reset grid to build the surface for assembly
            ic.threshbox = 180;
       }
    }

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

    getFaceCnt( mdl ){ let ic = this.icn3d, me = ic.icn3dui;
        let cntFaces = 0;
        for(let i = 0, il = mdl.children.length; i < il; ++i) {
             let mesh = mdl.children[i];
             if(mesh.type === 'Sprite') continue;

             let geometry = mesh.geometry;

//             let faces = geometry.faces;
//             if(faces !== undefined) {
//                 for(let j = 0, jl = faces.length; j < jl; ++j) {
//                     ++cntFaces;
//                 }
//             }

             let indexArray = geometry.getIndex().array;
             cntFaces += indexArray.length / 3;

        }

        return cntFaces;
    }

    //Save the binary STL file for 3D monocolor printing.
    saveStlFile( mat ){ let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(ic.dAtoms).length > 70000) {
            alert('Please display a subset of the structure to export 3D files. Then merge the files for 3D printing...');
            return [''];
        }

        ic.threeDPrintCls.prepareFor3Dprint();

        let cntFaces = 0;

        cntFaces += this.getFaceCnt(ic.mdl);
        cntFaces += this.getFaceCnt(ic.mdl_ghost);

        let blobArray = []; // hold blobs

        let stlArray = new Uint8Array(84);

        // UINT8[80] – Header
        let title = 'STL file for the structure(s) ';
        let structureArray = Object.keys(ic.structures);
        for(let i = 0, il = structureArray.length; i < il; ++i) {
            title += structureArray[i];
            if(i < il - 1) title += ', ';
        }

        if(title.length > 80) title = title.substr(0, 80);

        for(let i = 0; i < 80; ++i) {
            if(i < title.length) {
                stlArray[i] = me.convertTypeCls.passInt8([title.charCodeAt(i)])[0];
            }
            else {
                stlArray[i] = me.convertTypeCls.passInt8([' '.charCodeAt(0)])[0];
            }
        }

        // UINT32 – Number of triangles
        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
          && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length <= ic.maxAtoms3DMultiFile ) {
            stlArray = this.updateArray( stlArray, me.convertTypeCls.passInt32([cntFaces * ic.biomtMatrices.length]), 80 );
        }
        else {
            stlArray = this.updateArray( stlArray, me.convertTypeCls.passInt32([cntFaces]), 80 );
        }

        blobArray.push(new Blob([stlArray],{ type: "application/octet-stream"}));

        blobArray = this.processStlMeshGroup( ic.mdl, blobArray, mat );

        blobArray = this.processStlMeshGroup( ic.mdl_ghost, blobArray, mat );

       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length <= ic.maxAtoms3DMultiFile ) {
            let identity = new THREE.Matrix4();
            identity.identity();

            for(let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              let mat1 = ic.biomtMatrices[i];
              if(mat1 === undefined) continue;

              // skip itself
              if(mat1.equals(identity)) continue;

              blobArray = this.processStlMeshGroup( ic.mdl, blobArray, mat1 );

              blobArray = this.processStlMeshGroup( ic.mdl_ghost, blobArray, mat1 );
            }
        }

        //ic.threeDPrintCls.resetAfter3Dprint();

        return blobArray;
    }

    updateArray( array, inArray, indexBase ){ let ic = this.icn3d, me = ic.icn3dui;
        for( let i = 0, il = inArray.length; i < il; ++i ){
            array[indexBase + i] = inArray[i];
        }
        return array;
    }

    processStlMeshGroup( mdl, blobArray, mat ){ let ic = this.icn3d, me = ic.icn3dui;
        for(let i = 0, il = mdl.children.length; i < il; ++i) {
             let mesh = mdl.children[i];
             if(mesh.type === 'Sprite') continue;

             let geometry = mesh.geometry;

//             let vertices = geometry.vertices;
//             let faces = geometry.faces;

//             if(faces === undefined) continue;

             let positionArray = geometry.getAttribute('position').array;
             let indexArray = geometry.getIndex().array;

             let position = mesh.position;
             let scale = mesh.scale;

             let matrix = mesh.matrix;

//             let stlArray = new Uint8Array(faces.length * 50);
             let stlArray = new Uint8Array(indexArray.length / 3 * 50);

             let index = 0;

//             for(let j = 0, jl = faces.length; j < jl; ++j) {
             for(let j = 0, jl = indexArray.length; j < jl; j += 3) {
//                 let a = faces[j].a;
//                 let b = faces[j].b;
//                 let c = faces[j].c;
//                 let normal = faces[j].normal;

                 let a = indexArray[j];
                 let b = indexArray[j+1];
                 let c = indexArray[j+2];

                 let normal;

                 let va = new THREE.Vector3(positionArray[3*a], positionArray[3*a+1], positionArray[3*a+2]);
                 let vb = new THREE.Vector3(positionArray[3*b], positionArray[3*b+1], positionArray[3*b+2]);
                 let vc = new THREE.Vector3(positionArray[3*c], positionArray[3*c+1], positionArray[3*c+2]);

                 let v1, v2, v3;

                 if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry') {
//                     v1 = vertices[a].clone().multiply(scale).add(position);
//                     v2 = vertices[b].clone().multiply(scale).add(position);
//                     v3 = vertices[c].clone().multiply(scale).add(position);
                     v1 = va.clone().multiply(scale).add(position);
                     v2 = vb.clone().multiply(scale).add(position);
                     v3 = vc.clone().multiply(scale).add(position);
                 }
                  else if(geometry.type == 'CylinderGeometry') {
//                     v1 = vertices[a].clone().applyMatrix4(matrix);
//                     v2 = vertices[b].clone().applyMatrix4(matrix);
//                     v3 = vertices[c].clone().applyMatrix4(matrix);
                     v1 = va.clone().applyMatrix4(matrix);
                     v2 = vb.clone().applyMatrix4(matrix);
                     v3 = vc.clone().applyMatrix4(matrix);
                 }
                 else {
//                     v1 = vertices[a].clone();
//                     v2 = vertices[b].clone();
//                     v3 = vertices[c].clone();
                     v1 = va.clone();
                     v2 = vb.clone();
                     v3 = vc.clone();
                 }

                 //REAL32[3] – Normal vector
                 //REAL32[3] – Vertex 1
                 //REAL32[3] – Vertex 2
                 //REAL32[3] – Vertex 3
                 //UINT16 – Attribute byte count

                 if(normal !== undefined) {
                     if(mat !== undefined) normal.applyMatrix4(mat);

                     stlArray = this.updateArray( stlArray, me.convertTypeCls.passFloat32([normal.x, normal.y, normal.z]), index );
                     index += 12;
                 }
                 else {
                     stlArray = this.updateArray( stlArray, me.convertTypeCls.passFloat32([0.0, 0.0, 0.0]), index );
                     index += 12;
                 }

                 if(mat !== undefined) {
                     v1.applyMatrix4(mat);
                     v2.applyMatrix4(mat);
                     v3.applyMatrix4(mat);
                 }

                 stlArray = this.updateArray( stlArray, me.convertTypeCls.passFloat32([v1.x, v1.y, v1.z]), index );
                 index += 12;
                 stlArray = this.updateArray( stlArray, me.convertTypeCls.passFloat32([v2.x, v2.y, v2.z]), index );
                 index += 12;
                 stlArray = this.updateArray( stlArray, me.convertTypeCls.passFloat32([v3.x, v3.y, v3.z]), index );
                 index += 12;

                 v1 = v2 = v3 = undefined;

                 stlArray = this.updateArray( stlArray, me.convertTypeCls.passInt16([0]), index );
                 index += 2;
             }

             blobArray.push(new Blob([stlArray],{ type: "application/octet-stream"}));
             stlArray = null;
        }

        return blobArray;
    }

    //http://gun.teipir.gr/VRML-amgem/spec/part1/examples.html
    //Save the VRML file for 3D color printing.
    saveVrmlFile( mat ){ let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(ic.dAtoms).length > 50000) {
            alert('Please display a subset of the structure to export 3D files. Then merge the files for 3D printing...');
            return [''];
        }

        ic.threeDPrintCls.prepareFor3Dprint();

        let vrmlStrArray = [];
        vrmlStrArray.push('#VRML V2.0 utf8\n');

        let vertexCnt = 0;
        let result = this.processVrmlMeshGroup( ic.mdl, vrmlStrArray, vertexCnt, mat );
        vrmlStrArray = result.vrmlStrArray;
        vertexCnt = result.vertexCnt;

        result = this.processVrmlMeshGroup( ic.mdl_ghost, vrmlStrArray, vertexCnt, mat );
        vrmlStrArray = result.vrmlStrArray;
        vertexCnt = result.vertexCnt;

       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length <= ic.maxAtoms3DMultiFile ) {
            let identity = new THREE.Matrix4();
            identity.identity();

            for(let i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              let mat1 = ic.biomtMatrices[i];
              if(mat1 === undefined) continue;

              // skip itself
              if(mat1.equals(identity)) continue;

                result = this.processVrmlMeshGroup( ic.mdl, vrmlStrArray, vertexCnt, mat1 );
                vrmlStrArray = result.vrmlStrArray;
                vertexCnt = result.vertexCnt;

                result = this.processVrmlMeshGroup( ic.mdl_ghost, vrmlStrArray, vertexCnt, mat1 );
                vrmlStrArray = result.vrmlStrArray;
                vertexCnt = result.vertexCnt;
            }
        }

        return vrmlStrArray;
    }

    // The file lost face color after being repaired by https://service.netfabb.com/. It only works with vertex color
    // convert face color to vertex color
    processVrmlMeshGroup( mdl, vrmlStrArray, vertexCnt, mat ){ let ic = this.icn3d, me = ic.icn3dui;
        for(let i = 0, il = mdl.children.length; i < il; ++i) {
             let mesh = mdl.children[i];
             if(mesh.type === 'Sprite') continue;

             let geometry = mesh.geometry;

             let materialType = mesh.material.type;
             let bSurfaceVertex =(geometry.type == 'Surface') ? true : false;

//             let vertices = geometry.vertices;

//             if(vertices === undefined) continue;
//             vertexCnt += vertices.length;

//             let faces = geometry.faces;

             let positionArray = geometry.getAttribute('position').array;
             let colorArray = (geometry.getAttribute('color')) ? geometry.getAttribute('color').array : [];
             let indexArray = geometry.getIndex().array;

             let position = mesh.position;
             let scale = mesh.scale;

             let matrix = mesh.matrix;

             let meshColor = me.parasCls.thr(1, 1, 1);
             if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
                 if(mesh.material !== undefined) meshColor = mesh.material.color;
             }

             vrmlStrArray.push('Shape {\n');
             vrmlStrArray.push('geometry IndexedFaceSet {\n');

             vrmlStrArray.push('coord Coordinate { point [ ');

             let vertexColorStrArray = [];
//             for(let j = 0, jl = vertices.length; j < jl; ++j) {
             for(let j = 0, jl = positionArray.length; j < jl; j += 3) {
                 let va = new THREE.Vector3(positionArray[j], positionArray[j+1], positionArray[j+2]);

                 let vertex;
                 if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry') {
//                     vertex = vertices[j].clone().multiply(scale).add(position);
                     vertex = va.clone().multiply(scale).add(position);
                 }
                  else if(geometry.type == 'CylinderGeometry') {
//                     vertex = vertices[j].clone().applyMatrix4(matrix);
                     vertex = va.clone().applyMatrix4(matrix);
                 }
                 else {
//                     vertex = vertices[j].clone()
                     vertex = va.clone()
                 }

                 if(mat !== undefined) vertex.applyMatrix4(mat);

                 vrmlStrArray.push(vertex.x.toPrecision(5) + ' ' + vertex.y.toPrecision(5) + ' ' + vertex.z.toPrecision(5));
                 vertex = undefined;

//                 if(j < jl - 1) vrmlStrArray.push(', ');
                 if(j < jl - 3) vrmlStrArray.push(', ');

                 vertexColorStrArray.push(me.parasCls.thr(1, 1, 1));
             }
             vrmlStrArray.push(' ] }\n');

             let coordIndexStr = '', colorStr = '', colorIndexStr = '';
/*
             if(bSurfaceVertex) {
                 for(let j = 0, jl = faces.length; j < jl; ++j) {
                     let a = faces[j].a;
                     let b = faces[j].b;
                     let c = faces[j].c;

                     coordIndexStr += a + ' ' + b + ' ' + c;
                     // http://www.lighthouse3d.com/vrml/tutorial/index.shtml?indfs
                     // use -1 to separate polygons
                     if(j < jl - 1) coordIndexStr += ', -1, ';

                     // update vertexColorStrArray
                     vertexColorStrArray[a] = faces[j].vertexColors[0];
                     vertexColorStrArray[b] = faces[j].vertexColors[1];
                     vertexColorStrArray[c] = faces[j].vertexColors[2];
                 }

                 for(let j = 0, jl = vertexColorStrArray.length; j < jl; ++j) {
                     let color = vertexColorStrArray[j];
                     colorStr += color.r.toPrecision(3) + ' ' + color.g.toPrecision(3) + ' ' + color.b.toPrecision(3);
                     if(j < jl - 1) colorStr += ', ';
                 }

                 vrmlStrArray.push('coordIndex [ ' + coordIndexStr + ' ]\n');
                 vrmlStrArray.push('color Color { color [ ' + colorStr + ' ] } colorPerVertex TRUE\n');
             }
             else {
*/
//                 for(let j = 0, jl = faces.length; j < jl; ++j) {
                 for(let j = 0, jl = indexArray.length; j < jl; j += 3) {
//                     let a = faces[j].a;
//                     let b = faces[j].b;
//                     let c = faces[j].c;
                     let a = indexArray[j];
                     let b = indexArray[j+1];
                     let c = indexArray[j+2];

                     let color;
                     if(geometry.type == 'SphereGeometry' || geometry.type == 'BoxGeometry' || geometry.type == 'CylinderGeometry') {
                         color = meshColor;
                     }
                     else {
//                         color = faces[j].color;
                         color = new THREE.Color(colorArray[3*a], colorArray[3*a+1], colorArray[3*a+2]);
                     }

                     coordIndexStr += a + ' ' + b + ' ' + c;
                     // http://www.lighthouse3d.com/vrml/tutorial/index.shtml?indfs
                     // use -1 to separate polygons
//                     if(j < jl - 1) coordIndexStr += ', -1, ';
                     if(j < jl - 3) coordIndexStr += ', -1, ';

                     // update vertexColorStrArray
                     vertexColorStrArray[a] = color;
                     vertexColorStrArray[b] = color;
                     vertexColorStrArray[c] = color;
                 }

                 for(let j = 0, jl = vertexColorStrArray.length; j < jl; ++j) {
                     let color = vertexColorStrArray[j];
                     colorStr += color.r.toPrecision(3) + ' ' + color.g.toPrecision(3) + ' ' + color.b.toPrecision(3);
                     if(j < jl - 1) colorStr += ', ';
                 }

                 vrmlStrArray.push('coordIndex [ ' + coordIndexStr + ' ]\n');
                 vrmlStrArray.push('color Color { color [ ' + colorStr + ' ] } colorPerVertex TRUE\n');
//             }

             vrmlStrArray.push('  }\n');
             vrmlStrArray.push('}\n');
        }

        return {'vrmlStrArray': vrmlStrArray,'vertexCnt': vertexCnt}
    }
}

export {Export3D}
