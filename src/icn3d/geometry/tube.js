/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class Tube {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create tubes for "atoms" with certain "atomName". "radius" is the radius of the tubes.
    //"bHighlight" is an option to draw the highlight for these atoms. The highlight could be
    //outlines with bHighlight=1 and 3D objects with bHighlight=2.
    createTube(atoms, atomName, radius, bHighlight, bCustom, bNonCoil, tubePosArray, pntsCAAllSub, colorsAllSub) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let pnts = [], colors = [], radii = [];
        let currentChain, currentResi;
        let index = 0;
        let maxDist = 6.0;
        let maxDist2 = 3.0; // avoid tube between the residues in 3 residue helix

        let pnts_colors_radii = [];
        let firstAtom, firstPos, prevAtom, prevPos;
        let half = Math.floor(ic.axisDIV / 2) - 1;

        for (let i = 0, il = atoms.length; i < il; ++i) {
            let pos = (tubePosArray) ? tubePosArray[i] : undefined;

            let atom = atoms[i];
            if ((atom.name === atomName) && !atom.het) {
                if(index == 0) {
                    firstAtom = atom;
                    firstPos = pos;
                }

                let resid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) - 1).toString();

                if (index > 0 && (currentChain !== atom.chain || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist
                  || (prevAtom.ssbegin) // e.g., https://www.ncbi.nlm.nih.gov/Structure/icn3d/?pdbid=7JO8 where a beta sheet has just two residues
                  || (ic.ParserUtilsCls.getResiNCBI(atom.structure + '_' + currentChain, currentResi) + 1 < ic.ParserUtilsCls.getResiNCBI(atom.structure + '_' + atom.chain, atom.resi) && (Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist2 || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist2 || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist2))
                  ) ) {
                    if(bHighlight !== 2) {
                        if(tubePosArray) {
                            let bMissingEnd = ic.missingResEnd[prevAtom.structure + '_' + prevAtom.chain + '_' + prevAtom.resi];
                            // remove half of the points when missign residues
                            if(bMissingEnd) {
                                pnts.splice(-half);
                                colors.splice(-half);
                                radii.splice(-half);
                            }

                            let result = this.closeSegment(firstAtom, firstPos, prevAtom, prevPos, pnts, colors, radii, pntsCAAllSub);

                            pnts_colors_radii.push(result);
                        }
                        else {
                            pnts_colors_radii.push({'pnts':pnts, 'colors':colors, 'radii':radii});
                        }
                    }
                    pnts = []; colors = []; radii = [];;
                    firstAtom = atom;
                    firstPos = pos;
                    index = 0;
                }

                if(tubePosArray) { // coil
                    let bMissingStart = ic.missingResStart[atom.structure + '_' + atom.chain + '_' + atom.resi];
                    let bMissingEnd = ic.missingResEnd[atom.structure + '_' + atom.chain + '_' + atom.resi];

                    let offsetStart = (bMissingStart) ?  half : 0;
                    let offsetEnd = (bMissingEnd) ?  half : 0;

                    let indexArray = ic.strandCls.pos2IndexArray(pos, pntsCAAllSub);
                    for(let j = offsetEnd, jl = indexArray.length - offsetStart; j < jl; ++j) {
                        pnts.push(pntsCAAllSub[indexArray[j]]);
                        colors.push(colorsAllSub[indexArray[j]]);
                        radii.push(ic.coilWidth);
                    }
                }
                else { // b factor, etc
                    pnts.push(atom.coord);

                    let radiusFinal;
                    if(bCustom) {
                        radiusFinal = this.getCustomtubesize(atom.structure + '_' + atom.chain + '_' + atom.resi);
                    }
                    else {
                        radiusFinal = this.getRadius(radius, atom);
                    }
                    
                    radii.push(radiusFinal);

                    colors.push(atom.color);
                    // the starting residue of a coil uses the color from the next residue to avoid using the color of the last helix/sheet residue
                    if(index === 1) colors[colors.length - 2] = atom.color;
                }

                currentChain = atom.chain;
                currentResi = atom.resi;

                let scale = 1.2;
                if(bHighlight === 2 && !atom.ssbegin) {
                    ic.boxCls.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                }

                ++index;

                prevAtom = atom;
                prevPos = pos;
            }
        }

        if(bHighlight !== 2) {
            if(tubePosArray) {
                if(prevAtom) {
                    let bMissingEnd = ic.missingResEnd[prevAtom.structure + '_' + prevAtom.chain + '_' + prevAtom.resi];
                    if(bMissingEnd) {
                        pnts.splice(-half);
                        colors.splice(-half);
                        radii.splice(-half);
                    }

                    let result = this.closeSegment(firstAtom, firstPos, prevAtom, prevPos, pnts, colors, radii, pntsCAAllSub);

                    pnts_colors_radii.push(result);
                }
            }
            else {
                pnts_colors_radii.push({'pnts':pnts, 'colors':colors, 'radii':radii});
            }
        }

        for(let i = 0, il = pnts_colors_radii.length; i < il; ++i) {
            let pnts = pnts_colors_radii[i].pnts;
            let colors = pnts_colors_radii[i].colors;
            let radii = pnts_colors_radii[i].radii;

            this.createTubeSub(pnts, colors, radii, bHighlight, bNonCoil);
        }

        pnts_colors_radii = [];
    }

    closeSegment(firstAtom, firstPos, prevAtom, prevPos, pnts, colors, radii, pntsCAAllSub) { let ic = this.icn3d, me = ic.icn3dui;
        if (pnts.length === 0) return {'pnts': [], 'colors': [], 'radii': []};

        let extra = 1; // extend the tube by 5 sub-points into a preceding/following helix/sheet

        // extend backward by one sub-point into a preceding helix/sheet
        if (!isNaN(firstAtom.resi)) {
            if(firstAtom.style == 'strand') extra = 0;

            let resid = firstAtom.structure + '_' + firstAtom.chain + '_' + (parseInt(firstAtom.resi) - 1);
            let before = ic.residues.hasOwnProperty(resid) ? ic.firstAtomObjCls.getAtomFromResi(resid, 'CA') : undefined;

            for(let i = 1, il = extra + 1; i < il; ++i) {
                let idx = ic.strandCls.pos2IndexArray(firstPos, pntsCAAllSub)[0] - i;
                if (before && (before.ssbegin || before.ssend) && idx >= 0) {
                    pnts.unshift(pntsCAAllSub[idx]);
                    colors.unshift(colors[0]);          // keep the coil color
                    radii.unshift(radii[0]);
                }
            }
        }

        // extend forward by one sub-point into a following helix/sheet
        if (!isNaN(prevAtom.resi)) {
            if(prevAtom.style == 'strand') extra = 0;

            let resid = prevAtom.structure + '_' + prevAtom.chain + '_' + (parseInt(prevAtom.resi) + 1);
            let after = ic.residues.hasOwnProperty(resid) ? ic.firstAtomObjCls.getAtomFromResi(resid, 'CA') : undefined;
            let arr = ic.strandCls.pos2IndexArray(prevPos, pntsCAAllSub);
            for(let i = 1, il = extra + 1; i < il; ++i) {
                let idx = arr[arr.length - 1] + i;
                if (after && (after.ssbegin || after.ssend) && idx < pntsCAAllSub.length) {
                    pnts.push(pntsCAAllSub[idx]);
                    colors.push(colors[colors.length - 1]);
                    radii.push(radii[radii.length - 1]);
                }
            }
        }

        return {'pnts': pnts, 'colors': colors, 'radii': radii};
    }

    getCustomtubesize(resid) { let ic = this.icn3d, me = ic.icn3dui;
        let pos = resid.lastIndexOf('_');
        let resi = resid.substr(pos + 1);
        let chainid = resid.substr(0, pos);

        let radiusFinal = (ic.queryresi2score[chainid] && ic.queryresi2score[chainid].hasOwnProperty(resi)) ? ic.queryresi2score[chainid][resi] * 0.01 : ic.coilWidth;

        return radiusFinal;
    };

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createTubeSub(_pnts, colors, radii, bHighlight, bNonCoil) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        if (_pnts.length < 2) return;
        
        let circleDiv = ic.tubeDIV, axisDiv = ic.axisDIV;
        let circleDivInv = 1 / circleDiv, axisDivInv = 1 / axisDiv;
        //var geo = new THREE.Geometry();
        let geo = new THREE.BufferGeometry();
        let verticeArray = [], colorArray = [],indexArray = [], color;
        let offset = 0, offset2 = 0, offset3 = 0

        let pnts;
        /*
        if(!bSubdivided) {
            let pnts_clrs = me.subdivideCls.subdivide(_pnts, colors, axisDiv);

            pnts = pnts_clrs[0];
            colors = pnts_clrs[2];
        }
        else {
            pnts = _pnts;
        }
        */
        pnts = _pnts;

        let constRadiius;
        // a threshold to stop drawing the tube if it's less than this ratio of radius
        let thresholdRatio = 1; //0.9;

        let prevAxis1 = new THREE.Vector3(), prevAxis2;
        for (let i = 0, lim = pnts.length; i < lim; ++i) {
            let r, idx = (i - 1) * axisDivInv;

            if (i === 0) {
                r = radii[0];
                if(r > 0) constRadiius = r;
            }
            else {
                if (idx % 1 === 0) {
                    r = radii[idx];
                    if(r > 0) constRadiius = r;
                }
                else {
                    let floored = Math.floor(idx);
                    let tmp = idx - floored;
                    // draw all atoms in tubes and assign zero radius when the residue is not coil
                    // r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
                    r = radii[floored] * (1 - tmp) + radii[floored + 1] * tmp;

                    // a threshold to stop drawing the tube if it's less than this ratio of radius.
                    // The extra bit of tube connects coil with strands or helices
                    if(!bNonCoil) {
                        if(r < thresholdRatio * constRadiius) {
                            r = 0;
                        }
                        // else if(r < constRadiius) {
                        //     r *= 0.5; // use small radius for the connection between coild and sheets/helices 
                        // }
                    }
                }
            }

            let delta, axis1, axis2;
            if (i < lim - 1) {
                delta = pnts[i].clone().sub(pnts[i + 1]);
                axis1 = new THREE.Vector3(0, -delta.z, delta.y).normalize().multiplyScalar(r);
                axis2 = delta.clone().cross(axis1).normalize().multiplyScalar(r);
                //      let dir = 1, offset = 0;
                if (prevAxis1.dot(axis1) < 0) {
                    axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
                }
                prevAxis1 = axis1; prevAxis2 = axis2;
            } else {
                axis1 = prevAxis1; axis2 = prevAxis2;
            }
            for (let j = 0; j < circleDiv; ++j) {
                let angle = 2 * Math.PI * circleDivInv * j; //* dir  + offset;
                let point = pnts[i].clone().add(axis1.clone().multiplyScalar(Math.cos(angle))).add(axis2.clone().multiplyScalar(Math.sin(angle)));
                verticeArray[offset++] = point.x;
                verticeArray[offset++] = point.y;
                verticeArray[offset++] = point.z;

                color = (i == colors.length - 1 && colors.length > 1) ? me.parasCls.thr(colors[colors.length - 2]) : me.parasCls.thr(colors[i]);
                colorArray[offset2++] = color.r;
                colorArray[offset2++] = color.g;
                colorArray[offset2++] = color.b;
            }
        }
        let offsetTmp = 0, nComp = 3;
        for (let i = 0, lim = pnts.length - 1; i < lim; ++i) {
            let reg = 0;
            //var r1 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv]).lengthSq();
            //var r2 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv + 1]).lengthSq();
            let pos = offsetTmp * nComp;
            let point1 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);
            pos = (offsetTmp + circleDiv) * nComp;
            let point2 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);
            pos = (offsetTmp + circleDiv + 1) * nComp;
            let point3 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);

            let r1 = point1.clone().sub(point2).lengthSq();
            let r2 = point1.clone().sub(point3).lengthSq();
            if (r1 > r2) { r1 = r2; reg = 1; };
            for (let j = 0; j < circleDiv; ++j) {
                //geo.faces.push(new THREE.Face3(offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv, undefined, c));
                //geo.faces.push(new THREE.Face3(offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv, undefined, c));
                //indexArray = indexArray.concat([offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv]);
                indexArray[offset3++] = offsetTmp + j;
                indexArray[offset3++] = offsetTmp + (j + reg) % circleDiv + circleDiv;
                indexArray[offset3++] = offsetTmp + (j + 1) % circleDiv;

                //indexArray = indexArray.concat([offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv]);
                indexArray[offset3++] = offsetTmp + (j + 1) % circleDiv;
                indexArray[offset3++] = offsetTmp + (j + reg) % circleDiv + circleDiv;
                indexArray[offset3++] = offsetTmp + (j + reg + 1) % circleDiv + circleDiv;
            }
            offsetTmp += circleDiv;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticeArray), nComp));
        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorArray), nComp));

        geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indexArray), 1));
        //geo.setIndex(indexArray);

        //geo.computeFaceNormals();
        //geo.computeVertexNormals(false);
        geo.computeVertexNormals();

        let mesh;
        if(bHighlight === 2) {
          //mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: true, side: THREE.DoubleSide }));

          if(ic.mdl) {
            ic.mdl.add(mesh);
          }
        }
        else if(bHighlight === 1) {
          mesh = new THREE.Mesh(geo, ic.matShader);
          mesh.renderOrder = ic.renderOrderPicking;
          //ic.mdlPicking.add(mesh);
          if(ic.mdl) {
            ic.mdl.add(mesh);
          }
        }
        else {
          //mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: true, side: THREE.DoubleSide }));

          if(ic.mdl) {
            ic.mdl.add(mesh);
          }
        }

        if(bHighlight === 1 || bHighlight === 2) {
            ic.prevHighlightObjects.push(mesh);
        }
        else {
            ic.objects.push(mesh);
        }
    }

    getRadius(radius, atom) { let ic = this.icn3d, me = ic.icn3dui;
        let radiusFinal = radius;
        if(radius) {
            radiusFinal = radius;
        }
        else {
            if(atom.b > 0 && atom.b <= 100) {
                radiusFinal = atom.b * 0.01;
            }
            else if(atom.b > 100) {
                radiusFinal = 100 * 0.01;
            }
            else {
                radiusFinal = ic.coilWidth;
            }
        }

        return radiusFinal;
    }
}

export {Tube}
