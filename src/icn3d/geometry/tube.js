/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';
import {SubdivideCls} from '../../utils/subdivideCls.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Box} from '../geometry/box.js';

class Tube {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create tubes for "atoms" with certain "atomName". "radius" is the radius of the tubes.
    //"bHighlight" is an option to draw the highlight for these atoms. The highlight could be
    //outlines with bHighlight=1 and 3D objects with bHighlight=2.
    createTube(atoms, atomName, radius, bHighlight, bCustom, bRadiusArray) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var pnts = [], colors = [], radii = [], prevone = [], nexttwo = [];
        var currentChain, currentResi;
        var index = 0;
        var maxDist = 6.0;
        var maxDist2 = 3.0; // avoid tube between the residues in 3 residue helix

        var pnts_colors_radii_prevone_nexttwo = [];
        var firstAtom, atom, prevAtom;

        for (var i in atoms) {
            atom = atoms[i];
            if ((atom.name === atomName) && !atom.het) {
                if(index == 0) {
                    firstAtom = atom;
                }

                //if (index > 0 && (currentChain !== atom.chain || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist
                //  || (currentResi + 1 !== atom.resi && (Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist2 || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist2 || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist2) )
                if (index > 0 && (currentChain !== atom.chain || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist
                  || (parseInt(currentResi) + 1 < parseInt(atom.resi) && (Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist2 || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist2 || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist2) )
                  ) ) {
                    if(bHighlight !== 2) {
                        if(!isNaN(firstAtom.resi) && !isNaN(prevAtom.resi)) {
                            var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (parseInt(firstAtom.resi) - 1).toString();
                            var prevoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(prevoneResid, atomName);
                            prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                            var nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (parseInt(prevAtom.resi) + 1).toString();
                            var nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (parseInt(prevAtom.resi) + 2).toString();

                            if(ic.residues.hasOwnProperty(nextoneResid)) {
                                var nextAtom = ic.firstAtomObjCls.getAtomFromResi(nextoneResid, atomName);
                                if(nextAtom !== undefined && nextAtom.ssbegin) { // include the residue
                                    nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (parseInt(prevAtom.resi) + 2).toString();
                                    nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (parseInt(prevAtom.resi) + 3).toString();

                                    pnts.push(nextAtom.coord);
                                    if(bCustom) {
                                        radii.push(Tube.getCustomtubesize(nextoneResid));
                                    }
                                    else {
                                        radii.push(this.getRadius(radius, nextAtom));
                                    }
                                    colors.push(nextAtom.color);
                                }
                            }

                            var nextoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nextoneResid, atomName);
                            if(nextoneCoord !== undefined) {
                                nexttwo.push(nextoneCoord);
                            }

                            var nexttwoCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nexttwoResid, atomName);
                            if(nexttwoCoord !== undefined) {
                                nexttwo.push(nexttwoCoord);
                            }
                        }

                        pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
                    }
                    pnts = []; colors = []; radii = []; prevone = []; nexttwo = [];
                    firstAtom = atom;
                    index = 0;
                }

                if(pnts.length == 0 && !isNaN(atom.resi)) {
                    var prevoneResid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) - 1).toString();
                    if(ic.residues.hasOwnProperty(prevoneResid)) {
                        prevAtom = ic.firstAtomObjCls.getAtomFromResi(prevoneResid, atomName);
                        if(prevAtom !== undefined && prevAtom.ssend) { // include the residue
                            pnts.push(prevAtom.coord);
                            if(bCustom) {
                                radii.push(Tube.getCustomtubesize(prevoneResid));
                            }
                            else {
                                radii.push(this.getRadius(radius, prevAtom));
                            }
                            colors.push(prevAtom.color);
                        }
                    }
                }

                pnts.push(atom.coord);

                var radiusFinal;
                if(bCustom) {
                    radiusFinal = Tube.getCustomtubesize(atom.structure + '_' + atom.chain + '_' + atom.resi);
                }
                else {
                    radiusFinal = this.getRadius(radius, atom);
                }

                //radii.push(radius || (atom.b > 0 ? atom.b * 0.01 : ic.coilWidth));
                radii.push(radiusFinal);

                colors.push(atom.color);
                // the starting residue of a coil uses the color from the next residue to avoid using the color of the last helix/sheet residue
                if(index === 1) colors[colors.length - 2] = atom.color;

                currentChain = atom.chain;
                currentResi = atom.resi;

                var scale = 1.2;
                if(bHighlight === 2 && !atom.ssbegin) {
                    ic.boxCls.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                }

                ++index;

                prevAtom = atom;
            }
        }
        if(bHighlight !== 2) {
            prevone = [];
            if(firstAtom !== undefined && !isNaN(firstAtom.resi)) {
                var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (parseInt(firstAtom.resi) - 1).toString();
                var prevoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(prevoneResid, atomName);
                prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];
            }

            nexttwo = [];
            if(atom !== undefined && !isNaN(atom.resi)) {
                var nextoneResid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) + 1).toString();
                var nextoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nextoneResid, atomName);
                if(nextoneCoord !== undefined) {
                    nexttwo.push(nextoneCoord);
                }

                var nexttwoResid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) + 2).toString();
                var nexttwoCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nexttwoResid, atomName);
                if(nexttwoCoord !== undefined) {
                    nexttwo.push(nexttwoCoord);
                }
            }

            pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
        }

        for(var i = 0, il = pnts_colors_radii_prevone_nexttwo.length; i < il; ++i) {
            var pnts = pnts_colors_radii_prevone_nexttwo[i].pnts;
            var colors = pnts_colors_radii_prevone_nexttwo[i].colors;
            var radii = pnts_colors_radii_prevone_nexttwo[i].radii;
            var prevone = pnts_colors_radii_prevone_nexttwo[i].prevone;
            var nexttwo = pnts_colors_radii_prevone_nexttwo[i].nexttwo;

            this.createTubeSub(pnts, colors, radii, bHighlight, prevone, nexttwo, bRadiusArray);
        }

        pnts_colors_radii_prevone_nexttwo = [];
    }

    getCustomtubesize(resid) { var ic = this.icn3d, me = ic.icn3dui;
        var pos = resid.lastIndexOf('_');
        var resi = resid.substr(pos + 1);
        var chainid = resid.substr(0, pos);

        var radiusFinal = (ic.queryresi2score[chainid] && ic.queryresi2score[chainid].hasOwnProperty(resi)) ? ic.queryresi2score[chainid][resi] * 0.01 : ic.coilWidth;

        return radiusFinal;
    };

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createTubeSub(_pnts, colors, radii, bHighlight, prevone, nexttwo, bRadiusArray) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if (_pnts.length < 2) return;

        var segments, radiusSegments;

//        if(bRadiusArray) {
            var circleDiv = ic.tubeDIV, axisDiv = ic.axisDIV;
            var circleDivInv = 1 / circleDiv, axisDivInv = 1 / axisDiv;
            //var geo = new THREE.Geometry();
            var geo = new THREE.BufferGeometry();
            var verticeArray = [], colorArray = [],indexArray = [], color;
            var offset = 0, offset2 = 0, offset3 = 0

            var pnts_clrs = me.subdivideCls.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo);

            var pnts = pnts_clrs[0];
            colors = pnts_clrs[2];

            var prevAxis1 = new THREE.Vector3(), prevAxis2;
            for (var i = 0, lim = pnts.length; i < lim; ++i) {
                var r, idx = (i - 1) * axisDivInv;
                if (i === 0) r = radii[0];
                else {
                    if (idx % 1 === 0) r = radii[idx];
                    else {
                        var floored = Math.floor(idx);
                        var tmp = idx - floored;
                        r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
                    }
                }
                var delta, axis1, axis2;
                if (i < lim - 1) {
                    delta = pnts[i].clone().sub(pnts[i + 1]);
                    axis1 = new THREE.Vector3(0, -delta.z, delta.y).normalize().multiplyScalar(r);
                    axis2 = delta.clone().cross(axis1).normalize().multiplyScalar(r);
                    //      var dir = 1, offset = 0;
                    if (prevAxis1.dot(axis1) < 0) {
                        axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
                    }
                    prevAxis1 = axis1; prevAxis2 = axis2;
                } else {
                    axis1 = prevAxis1; axis2 = prevAxis2;
                }
                for (var j = 0; j < circleDiv; ++j) {
                    var angle = 2 * Math.PI * circleDivInv * j; //* dir  + offset;
                    var point = pnts[i].clone().add(axis1.clone().multiplyScalar(Math.cos(angle))).add(axis2.clone().multiplyScalar(Math.sin(angle)));
                    verticeArray[offset++] = point.x;
                    verticeArray[offset++] = point.y;
                    verticeArray[offset++] = point.z;

                    color = (i == colors.length - 1 && colors.length > 1) ? me.parasCls.thr(colors[colors.length - 2]) : me.parasCls.thr(colors[i]);
                    colorArray[offset2++] = color.r;
                    colorArray[offset2++] = color.g;
                    colorArray[offset2++] = color.b;
                }
            }
            var offsetTmp = 0, nComp = 3;
            for (var i = 0, lim = pnts.length - 1; i < lim; ++i) {
                var reg = 0;
                //var r1 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv]).lengthSq();
                //var r2 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv + 1]).lengthSq();
                var pos = offsetTmp * nComp;
                var point1 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);
                pos = (offsetTmp + circleDiv) * nComp;
                var point2 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);
                pos = (offsetTmp + circleDiv + 1) * nComp;
                var point3 = new THREE.Vector3(verticeArray[pos], verticeArray[pos + 1], verticeArray[pos + 2]);

                var r1 = point1.clone().sub(point2).lengthSq();
                var r2 = point1.clone().sub(point3).lengthSq();
                if (r1 > r2) { r1 = r2; reg = 1; };
                for (var j = 0; j < circleDiv; ++j) {
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
/*
        }
        else {
            var axisDiv = ic.axisDIV;

            var pnts_clrs = me.subdivideCls.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo);
            // extend one residue
            //var pnts_clrs = me.subdivideCls.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo, true);

            _pnts = pnts_clrs[0];
            colors = pnts_clrs[2];

            var radius = ic.coilWidth;
            segments = _pnts.length;
            //radiusSegments = 8;
            radiusSegments = 4; // save memory
            var closed = false;

            // when using radiusArray with modified three.js, the tube didn't work in picking
            var geo = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(_pnts), // path
                segments,
                radius, //radiusArray, //radius,
                radiusSegments,
                closed
            );

            //https://stemkoski.github.io/Three.js/Graphulus-Curve.html
            var color, face, numberOfSides, vertexIndex;
            // faces are indexed using characters
            var faceIndices = [ 'a', 'b', 'c', 'd' ];

            // first, assign colors to vertices as desired
            var prevColor,  geoColors = {};
            for ( var s = 0; s <= segments; s++ ) {
                for ( var r = 0; r < radiusSegments; r++ )
                {
                    vertexIndex = r + s * radiusSegments;
                    color = colors[s];
                    if(!color) color = prevColor;

                    geoColors[vertexIndex] = color; // use this array for convenience

                    prevColor = color;
                }
            }

            // copy the colors as necessary to the face's vertexColors array.
            // after version r125, geo.faces is undefined for TubeGeometry
            for ( var i = 0; geo.faces && i < geo.faces.length; i++ )
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
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

          ic.mdl.add(mesh);
        }
        else if(bHighlight === 1) {
          mesh = new THREE.Mesh(geo, ic.matShader);
          mesh.renderOrder = ic.renderOrderPicking;
          //ic.mdlPicking.add(mesh);
          ic.mdl.add(mesh);
        }
        else {
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
          //mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: 0xFFFFFF, side: THREE.DoubleSide }));

          ic.mdl.add(mesh);
        }

        if(bHighlight === 1 || bHighlight === 2) {
            ic.prevHighlightObjects.push(mesh);
        }
        else {
            ic.objects.push(mesh);
        }
    }

    getRadius(radius, atom) { var ic = this.icn3d, me = ic.icn3dui;
        var radiusFinal = radius;
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
