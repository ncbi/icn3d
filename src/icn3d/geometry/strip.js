/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class Strip {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createStrip(p0, p1, colors, div, thickness, bHighlight, bNoSmoothen, 
      positions, pntsCA, prevCOArray) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        if (p0.length < 2) return;
        div = div || ic.axisDIV;

        if(div != 1) { // not subdivided yet
            if(!bNoSmoothen) {
                //var bExtendLastRes = true;
                let bExtendLastRes = false;
                let pnts_clrs0 = me.subdivideCls.subdivide(p0, colors, div);
                let pnts_clrs1 = me.subdivideCls.subdivide(p1, colors, div);
                p0 = pnts_clrs0[0];
                p1 = pnts_clrs1[0];
                colors = pnts_clrs0[2];
            }
            if (p0.length < 2) return;
        }

        if(bHighlight === 1) {
            //mesh = new THREE.Mesh(geo, ic.matShader);

            let radius = ic.coilWidth / 2;
            //var radiusSegments = 8;
            let radiusSegments = 4; // save memory
            let closed = false;

            if(positions !== undefined) {
                let currPos, prevPos;
                let currP0 = [], currP1 = [];

                for(let i = 0, il = p0.length; i < il; ++i) {
                    currPos = positions[i];

                    if((currPos !== prevPos && parseInt(currPos) !== parseInt(prevPos) + 1 && prevPos !== undefined) || (i === il -1) ) {
                        // first tube
                        let geometry0 = new THREE.TubeGeometry(
                            new THREE.CatmullRomCurve3(currP0), // path
                            currP0.length, // segments
                            radius,
                            radiusSegments,
                            closed
                        );
                     
                        let mesh = new THREE.Mesh(geometry0, ic.matShader);
                        mesh.renderOrder = ic.renderOrderPicking;
                        //ic.mdlPicking.add(mesh);
                        ic.mdl.add(mesh);

                        ic.prevHighlightObjects.push(mesh);

                        geometry0 = null;

                        // second tube
                        let geometry1 = new THREE.TubeGeometry(
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
                let geometry0 = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(p0), // path
                    p0.length, // segments
                    radius,
                    radiusSegments,
                    closed
                );

                let mesh = new THREE.Mesh(geometry0, ic.matShader);
                mesh.renderOrder = ic.renderOrderPicking;
                //ic.mdlPicking.add(mesh);
                ic.mdl.add(mesh);

                ic.prevHighlightObjects.push(mesh);

                geometry0 = null;

                // second tube
                let geometry1 = new THREE.TubeGeometry(
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
            //https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html

            let geo = new THREE.BufferGeometry();
            //var vs = geo.vertices, fs = geo.faces;
            let vs = [], fs = [];
            let colorArray = [], indexArray = [];
            let axis, p0v, p1v, a0v, a1v;

            let offset = 0, offset2 = 0, offset3 = 0;
            for (let i = 0, lim = p0.length; i < lim; ++i) {
                p0v = p0[i];
                p1v = p1[i];

                if(!p0v || !p1v) continue;

                // compute the thickness direction first
                if (i < lim - 1 && p0[i + 1]) {
                    axis = p1[i].clone().sub(p0[i]).cross(p0[i + 1].clone().sub(p0[i])).normalize().multiplyScalar(thickness);
                }
                let half = axis.clone().multiplyScalar(0.5);

                // bottom face: half a thickness below the edge plane
                let b0v = p0v.clone().sub(half);
                let b1v = p1v.clone().sub(half);
                for(let j = 0; j < 2; ++j) {
                    vs[offset++] = b0v.x;
                    vs[offset++] = b0v.y;
                    vs[offset++] = b0v.z;
                }
                for(let j = 0; j < 2; ++j) {
                    vs[offset++] = b1v.x;
                    vs[offset++] = b1v.y;
                    vs[offset++] = b1v.z;
                }

                // top face: half a thickness above the edge plane
                a0v = p0v.clone().add(half);
                a1v = p1v.clone().add(half);
                for(let j = 0; j < 2; ++j) {
                    vs[offset++] = a0v.x;
                    vs[offset++] = a0v.y;
                    vs[offset++] = a0v.z;
                }
                for(let j = 0; j < 2; ++j) {
                    vs[offset++] = a1v.x;
                    vs[offset++] = a1v.y;
                    vs[offset++] = a1v.z;
                }

                for(let j = 0; j < 8; ++j) {
                    //colorArray = colorArray.concat(colors[i].toArray());
                    let color = (colors[i]) ? colors[i] : (colors[i-1] ? colors[i-1] : {r:0, g:0, b:0});
                    colorArray[offset2++] = color.r;
                    colorArray[offset2++] = color.g;
                    colorArray[offset2++] = color.b;
               }
            }
            let faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];

            for (let i = 1, lim = p0.length, divInv = 1 / div; i < lim; ++i) {
                let offsetTmp = 8 * i;
                //var color = me.parasCls.thr(colors[i - 1]);
                for (let j = 0; j < 4; ++j) {
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
            let nComp = 3;
            let vsize = vs.length / nComp - 8; // Cap
            for (let i = 0; i < 4; ++i) {
                for(let j = 0; j < nComp; ++j) {
                    //vs = vs.concat([vs[i * 2 * nComp + j]]);
                    vs[offset++] = vs[i * 2 * nComp + j];
                }

                for(let j = 0; j < nComp; ++j) {
                    //vs = vs.concat([vs[(vsize + i * 2) * nComp + j]]);
                    vs[offset++] = vs[(vsize + i * 2) * nComp + j];
                }

                //colorArray = colorArray.concat(colors[0].toArray());
                if(colors[0]) {
                    colorArray[offset2++] = colors[0].r;
                    colorArray[offset2++] = colors[0].g;
                    colorArray[offset2++] = colors[0].b;
                    //colorArray = colorArray.concat(colors[p0.length - 1].toArray());
                    let color = (colors[p0.length - 1]) ? colors[p0.length - 1] : (colors[p0.length - 2] ? colors[p0.length - 2] : {r:0, g:0, b:0});
                    colorArray[offset2++] = color.r;
                    colorArray[offset2++] = color.g;
                    colorArray[offset2++] = color.b;
                }
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

            let mesh;

            if(bHighlight === 2) {
              //mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
              mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac,
                    shininess: ic.shininess, emissive: ic.emissive, vertexColors: true, side: THREE.DoubleSide }));

              ic.mdl.add(mesh);
              ic.prevHighlightObjects.push(mesh);
            }
            else {
              //mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
              mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: true, side: THREE.DoubleSide }));

              ic.mdl.add(mesh);
              ic.objects.push(mesh);
            }
        }

        p0 = null;
        p1 = null;
    }
}

export {Strip}
