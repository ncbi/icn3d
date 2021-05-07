/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';
import {SubdivideCls} from '../../utils/subdivideCls.js';

class Strip {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createStrip(p0, p1, colors, div, thickness, bHighlight, bNoSmoothen, bShowArray,
      calphaIdArray, positions, prevone, nexttwo, pntsCA, prevCOArray) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if (p0.length < 2) return;
        div = div || ic.axisDIV;

        if(pntsCA && ic.bDoublecolor && !ic.bCalphaOnly) {
            var bExtendLastRes = false; //true;

            var pnts_clrs = me.subdivideCls.subdivide(pntsCA, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
            pntsCA = pnts_clrs[0];

            this.setCalphaDrawnCoord(pntsCA, div, calphaIdArray);

            for(var i = 0, il = prevCOArray.length; i < il; ++i) {
                prevCOArray[i].normalize();
            }

            var pnts_clrs2 = me.subdivideCls.subdivide(prevCOArray, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
            prevCOArray = pnts_clrs2[0];

            colors = pnts_clrs[2];
        }
        else {

            if(!bNoSmoothen) {
                //var bExtendLastRes = true;
                var bExtendLastRes = false;
                var pnts_clrs0 = me.subdivideCls.subdivide(p0, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
                var pnts_clrs1 = me.subdivideCls.subdivide(p1, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
                p0 = pnts_clrs0[0];
                p1 = pnts_clrs1[0];
                colors = pnts_clrs0[2];
            }
            if (p0.length < 2) return;

            this.setCalphaDrawnCoord(p0, div, calphaIdArray);
        }

        if(bHighlight === 1) {
            //mesh = new THREE.Mesh(geo, ic.matShader);

            var radius = ic.coilWidth / 2;
            //var radiusSegments = 8;
            var radiusSegments = 4; // save memory
            var closed = false;

            if(positions !== undefined) {
                var currPos, prevPos;
                var currP0 = [], currP1 = [];

                for(var i = 0, il = p0.length; i < il; ++i) {
                    currPos = positions[i];

                    if((currPos !== prevPos && currPos !== prevPos + 1 && prevPos !== undefined) || (i === il -1) ) {
                        // first tube
                        var geometry0 = new THREE.TubeGeometry(
                            new THREE.CatmullRomCurve3(currP0), // path
                            currP0.length, // segments
                            radius,
                            radiusSegments,
                            closed
                        );

                        mesh = new THREE.Mesh(geometry0, ic.matShader);
                        mesh.renderOrder = ic.renderOrderPicking;
                        //ic.mdlPicking.add(mesh);
                        ic.mdl.add(mesh);

                        ic.prevHighlightObjects.push(mesh);

                        geometry0 = null;

                        // second tube
                        var geometry1 = new THREE.TubeGeometry(
                            new THREE.CatmullRomCurve3(currP1), // path
                            currP1.length, // segments
                            radius,
                            radiusSegments,
                            closed
                        );

                        mesh = new THREE.Mesh(geometry1, ic.matShader);
                        mesh.renderOrder = ic.renderOrderPicking;
                        //ic.mdlPicking.add(mesh);
                        ic.mdl.add(mesh);

                        ic.prevHighlightObjects.push(mesh);

                        geometry1 = null;

                        currP0 = [];
                        currP1 = [];
                    }

                    currP0.push(p0[i]);
                    currP1.push(p1[i]);

                    prevPos = currPos;
                }

                currP0 = [];
                currP1 = [];
            }
            else {
                // first tube
                var geometry0 = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(p0), // path
                    p0.length, // segments
                    radius,
                    radiusSegments,
                    closed
                );

                mesh = new THREE.Mesh(geometry0, ic.matShader);
                mesh.renderOrder = ic.renderOrderPicking;
                //ic.mdlPicking.add(mesh);
                ic.mdl.add(mesh);

                ic.prevHighlightObjects.push(mesh);

                geometry0 = null;

                // second tube
                var geometry1 = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(p1), // path
                    p1.length, // segments
                    radius,
                    radiusSegments,
                    closed
                );

                mesh = new THREE.Mesh(geometry1, ic.matShader);
                mesh.renderOrder = ic.renderOrderPicking;
                //ic.mdlPicking.add(mesh);
                ic.mdl.add(mesh);

                ic.prevHighlightObjects.push(mesh);

                geometry1 = null;
            }
        }
        else {
//            if(!pntsCA || !ic.bDoublecolor || ic.bCalphaOnly) {
/*
                var geo = new THREE.Geometry();
                var vs = geo.vertices, fs = geo.faces;
                var axis, p0v, p1v, a0v, a1v;
                for (var i = 0, lim = p0.length; i < lim; ++i) {
                    vs.push(p0v = p0[i]); // 0
                    vs.push(p0v); // 1
                    vs.push(p1v = p1[i]); // 2
                    vs.push(p1v); // 3
                    if (i < lim - 1) {
                        axis = p1[i].clone().sub(p0[i]).cross(p0[i + 1].clone().sub(p0[i])).normalize().multiplyScalar(thickness);
                    }
                    vs.push(a0v = p0[i].clone().add(axis)); // 4
                    vs.push(a0v); // 5
                    vs.push(a1v = p1[i].clone().add(axis)); // 6
                    vs.push(a1v); // 7
                }
                var faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];

                for (var i = 1, lim = p0.length, divInv = 1 / div; i < lim; ++i) {
                    var offset = 8 * i;
                    //var color = me.parasCls.thr(colors[Math.round((i - 1) * divInv)]);
                    var color = me.parasCls.thr(colors[i - 1]);
                    for (var j = 0; j < 4; ++j) {
                        fs.push(new THREE.Face3(offset + faces[j][0], offset + faces[j][1], offset + faces[j][2], undefined, color));
                        fs.push(new THREE.Face3(offset + faces[j][3], offset + faces[j][0], offset + faces[j][2], undefined, color));
                    }
                }
                var vsize = vs.length - 8; // Cap
                for (var i = 0; i < 4; ++i) {
                    vs.push(vs[i * 2]);
                    vs.push(vs[vsize + i * 2]);
                };
                vsize += 8;
                fs.push(new THREE.Face3(vsize, vsize + 2, vsize + 6, undefined, fs[0].color));
                fs.push(new THREE.Face3(vsize + 4, vsize, vsize + 6, undefined, fs[0].color));
                fs.push(new THREE.Face3(vsize + 1, vsize + 5, vsize + 7, undefined, fs[fs.length - 3].color));
                fs.push(new THREE.Face3(vsize + 3, vsize + 1, vsize + 7, undefined, fs[fs.length - 3].color));
                geo.computeFaceNormals();
                geo.computeVertexNormals(false);
*/
                //https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html

                var geo = new THREE.BufferGeometry();
                //var vs = geo.vertices, fs = geo.faces;
                var vs = [], fs = [];
                var colorArray = [], indexArray = [];
                var axis, p0v, p1v, a0v, a1v;

                var offset = 0, offset2 = 0, offset3 = 0;
                for (var i = 0, lim = p0.length; i < lim; ++i) {
                    p0v = p0[i];
                    p1v = p1[i];

                    //vs = vs.concat((p0v).toArray()); // 0
                    //vs = vs.concat((p0v).toArray()); // 1
                    //vs = vs.concat((p1v).toArray()); // 2
                    //vs = vs.concat((p1v).toArray()); // 3

                    for(var j = 0; j < 2; ++j) {
                        vs[offset++] = p0v.x;
                        vs[offset++] = p0v.y;
                        vs[offset++] = p0v.z;
                    }
                    for(var j = 0; j < 2; ++j) {
                        vs[offset++] = p1v.x;
                        vs[offset++] = p1v.y;
                        vs[offset++] = p1v.z;
                    }

                    if (i < lim - 1) {
                        axis = p1[i].clone().sub(p0[i]).cross(p0[i + 1].clone().sub(p0[i])).normalize().multiplyScalar(thickness);
                    }
                    a0v = p0[i].clone().add(axis);
                    a1v = p1[i].clone().add(axis);

                    //vs = vs.concat((a0v).toArray()); // 4
                    //vs = vs.concat((a0v).toArray()); // 5
                    //vs = vs.concat((a1v).toArray()); // 6
                    //vs = vs.concat((a1v).toArray()); // 7

                    for(var j = 0; j < 2; ++j) {
                        vs[offset++] = a0v.x;
                        vs[offset++] = a0v.y;
                        vs[offset++] = a0v.z;
                    }
                    for(var j = 0; j < 2; ++j) {
                        vs[offset++] = a1v.x;
                        vs[offset++] = a1v.y;
                        vs[offset++] = a1v.z;
                    }

                    for(var j = 0; j < 8; ++j) {
                        //colorArray = colorArray.concat(colors[i].toArray());
                        colorArray[offset2++] = colors[i].r;
                        colorArray[offset2++] = colors[i].g;
                        colorArray[offset2++] = colors[i].b;
                   }
                }
                var faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];

                for (var i = 1, lim = p0.length, divInv = 1 / div; i < lim; ++i) {
                    var offsetTmp = 8 * i;
                    //var color = me.parasCls.thr(colors[i - 1]);
                    for (var j = 0; j < 4; ++j) {
                        //fs.push(new THREE.Face3(offset + faces[j][0], offset + faces[j][1], offset + faces[j][2], undefined, color));
                        //fs.push(new THREE.Face3(offset + faces[j][3], offset + faces[j][0], offset + faces[j][2], undefined, color));
                        //indexArray = indexArray.concat([offsetTmp + faces[j][0], offsetTmp + faces[j][1], offsetTmp + faces[j][2]]);
                        //indexArray = indexArray.concat([offsetTmp + faces[j][3], offsetTmp + faces[j][0], offsetTmp + faces[j][2]]);
                        indexArray[offset3++] = offsetTmp + faces[j][0];
                        indexArray[offset3++] = offsetTmp + faces[j][1];
                        indexArray[offset3++] = offsetTmp + faces[j][2];

                        indexArray[offset3++] = offsetTmp + faces[j][3];
                        indexArray[offset3++] = offsetTmp + faces[j][0];
                        indexArray[offset3++] = offsetTmp + faces[j][2];
                    }
                }
                var nComp = 3;
                var vsize = vs.length / nComp - 8; // Cap
                for (var i = 0; i < 4; ++i) {
                    for(var j = 0; j < nComp; ++j) {
                        //vs = vs.concat([vs[i * 2 * nComp + j]]);
                        vs[offset++] = vs[i * 2 * nComp + j];
                    }

                    for(var j = 0; j < nComp; ++j) {
                        //vs = vs.concat([vs[(vsize + i * 2) * nComp + j]]);
                        vs[offset++] = vs[(vsize + i * 2) * nComp + j];
                    }

                    //colorArray = colorArray.concat(colors[0].toArray());
                    colorArray[offset2++] = colors[0].r;
                    colorArray[offset2++] = colors[0].g;
                    colorArray[offset2++] = colors[0].b;
                    //colorArray = colorArray.concat(colors[p0.length - 1].toArray());
                    colorArray[offset2++] = colors[p0.length - 1].r;
                    colorArray[offset2++] = colors[p0.length - 1].g;
                    colorArray[offset2++] = colors[p0.length - 1].b;
                };
                vsize += 8;
                //fs.push(new THREE.Face3(vsize, vsize + 2, vsize + 6, undefined, fs[0].color));
                //fs.push(new THREE.Face3(vsize + 4, vsize, vsize + 6, undefined, fs[0].color));
                //fs.push(new THREE.Face3(vsize + 1, vsize + 5, vsize + 7, undefined, fs[fs.length - 3].color));
                //fs.push(new THREE.Face3(vsize + 3, vsize + 1, vsize + 7, undefined, fs[fs.length - 3].color));

                //indexArray = indexArray.concat([vsize, vsize + 2, vsize + 6]);
                //indexArray = indexArray.concat([vsize + 4, vsize, vsize + 6]);
                //indexArray = indexArray.concat([vsize + 1, vsize + 5, vsize + 7]);
                //indexArray = indexArray.concat([vsize + 3, vsize + 1, vsize + 7]);

                indexArray[offset3++] = vsize;
                indexArray[offset3++] = vsize + 2;
                indexArray[offset3++] = vsize + 6;
                indexArray[offset3++] = vsize + 4;
                indexArray[offset3++] = vsize;
                indexArray[offset3++] = vsize + 6;
                indexArray[offset3++] = vsize + 1;
                indexArray[offset3++] = vsize + 5;
                indexArray[offset3++] = vsize + 7;
                indexArray[offset3++] = vsize + 3;
                indexArray[offset3++] = vsize + 1;
                indexArray[offset3++] = vsize + 7;

                geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vs), nComp));
                geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), nComp));

                geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));
                //geo.setIndex(indexArray);

                //geo.computeFaceNormals();
                //geo.computeVertexNormals(false);
                geo.computeVertexNormals();
/*
            }
            else {
                var path = new THREE.CatmullRomCurve3(pntsCA);

                var normal = new THREE.Vector3();

                var tangents = [];
                var normals = [];
                var binormals = [];

                var i, u, theta;
                var segments = pntsCA.length;

                // compute the tangent vectors for each segment on the curve
                for ( i = 0; i <= segments; i ++ ) {
                    u = i / segments;

                    tangents[ i ] = path.getTangentAt( u );
                    tangents[ i ].normalize();
                }

                normals[ 0 ] = prevCOArray[0].normalize();

                binormals[ 0 ] = new THREE.Vector3();
                binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );

                var helixAxis = pntsCA[segments - 1].clone().sub(pntsCA[0]);

                var cntIn = 0
                for ( i = 1; i <= segments; i ++ ) {
                    normals[i] = prevCOArray[i-1];

                    binormals[ i ] = new THREE.Vector3();
                    binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

                    if(helixAxis.dot(binormals[i]) > 0 ) ++cntIn;
                }

                // most binormals are facing inward
                var colorOut = (cntIn > 0.5 * segments) ? true : false;

                var normalObj = {
                    tangents: tangents,
                    normals: normals,
                    binormals: binormals
                };

                var extrudeSettings = {
                  steps: segments,
                  extrudePath: path,
                  frames: normalObj
                };

                var circleRadius = ic.coilWidth;
                var width = 4.2 * circleRadius;
                var height = 1.1 * circleRadius;

                //https://stackoverflow.com/questions/42934609/extrude-3d-shape-from-three-line-object-in-three-js/42955930#42955930
                var ellipse = new THREE.EllipseCurve(
                        0,  0,            // ax, aY
                        width, height,    // xRadius, yRadius
                        0,  2 * Math.PI,  // aStartAngle, aEndAngle
                        false,            // aClockwise
                        Math.PI //0       // aRotation
                );

                var shape = new THREE.Shape();
                shape.curves.push(ellipse);
                var geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                //https://stemkoski.github.io/Three.js/Graphulus-Curve.html
                var color, face, numberOfSides, vertexIndex;
                // faces are indexed using characters
                var faceIndices = [ 'a', 'b', 'c', 'd' ];

                // first, assign colors to vertices as desired
                var numVerticesPerSeg = parseInt(geo.vertices.length / (segments + 1) );

                var prevColor, geoColors = {};
                var half = parseInt(numVerticesPerSeg/2);
                for ( var r = 0; r < numVerticesPerSeg; r++ ) {
                    for ( var s = 0; s <= segments; s++ ) {
                        vertexIndex = s + r * (segments + 1);

                        // the color of a residue spans across several residues in the back side of the helix
                        color = (s == segments) ? colors[s - 1] : colors[s];

                        if(!color) color = prevColor;

                        var bFront = (colorOut) ? (r > half) : (r < half);

                        geoColors[vertexIndex] = bFront ? color : me.parasCls.thr(0x888888); // use this array for convenience
                        prevColor = color;
                    }
                }

                // copy the colors as necessary to the face's vertexColors array.
                for ( var i = 0; i < geo.faces.length; i++ )
                {
                    face = geo.faces[ i ];

                    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
                    for( var j = 0; j < numberOfSides; j++ )
                    {
                        vertexIndex = face[ faceIndices[ j ] ];
                        face.vertexColors[ j ] = geoColors[ vertexIndex ];
                    }
                }

                geo.computeFaceNormals();
                geo.computeVertexNormals(false);
            }
*/

            var mesh;

            if(bHighlight === 2) {
              mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac,
                shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

              ic.mdl.add(mesh);
              ic.prevHighlightObjects.push(mesh);
            }
            else {
              mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac,
                shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

              ic.mdl.add(mesh);
              ic.objects.push(mesh);
            }
        }

        p0 = null;
        p1 = null;
    }

    setCalphaDrawnCoord(pnts, div, calphaIdArray) { var ic = this.icn3d, me = ic.icn3dui;
        var index = 0;

        if(calphaIdArray !== undefined) {
            for(var i = 0, il = pnts.length; i < il; i += div) { // pnts.length = (calphaIdArray.length - 1) * div + 1
                var serial = calphaIdArray[index];

                if(ic.atoms.hasOwnProperty(serial)) {
                    ic.atoms[serial].coord2 = pnts[i].clone();
                }

                ++index;
            }
        }
    }
}

export {Strip}
