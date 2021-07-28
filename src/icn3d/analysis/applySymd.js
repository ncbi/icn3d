/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Cylinder} from '../geometry/cylinder.js';
import {Sphere} from '../geometry/sphere.js';

class ApplySymd {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applySymd() { let ic = this.icn3d, me = ic.icn3dui;
        for(let i = 0, il = ic.symdArray.length; i < il; ++i) {
            let symdHash = ic.symdArray[i];
            let title = Object.keys(symdHash)[0];
            this.applySymmetry(title, true, symdHash[title]);
        }
    }

    applySymmetry(title, bSymd, inDataArray) { let ic = this.icn3d, me = ic.icn3dui;
        //var dataArray = (bSymd) ? ic.symdHash[title] : ic.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
        let dataArray = (bSymd) ? inDataArray : ic.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
        if(!dataArray) dataArray = [];

        let symmetryType = title.substr(0, 1);
        let nSide = parseInt(title.substring(1, title.indexOf(' ')));

        //var axisRadius = 2 * ic.cylinderRadius * ic.oriMaxD / 150;
        //var polygonRadius = 1 * ic.cylinderRadius * ic.oriMaxD / 150;

        let axisRadius = 1.5 * ic.cylinderRadius;
        let polygonRadius = 1 * ic.cylinderRadius;

        if(symmetryType == 'I') {
            //axisRadius *= 2;
            //polygonRadius *= 2;
        }

        let pointArray = [];

        let index = 0;
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            let start = dataArray[i][0];
            let end = dataArray[i][1];
            let colorAxis = dataArray[i][2];
            let colorPolygon = dataArray[i][3];
            let order = dataArray[i][4];
            let chain = dataArray[i][5];

            ic.cylinderCls.createCylinder(start, end, axisRadius, colorAxis, 0);

            if(ic.bAxisOnly) continue;

            if(symmetryType == 'C' || (symmetryType == 'D' && order == nSide) ) {
                // find the center and size of the selected protein chain

                let selection = {};
                // check the number of chains
                let nChain = Object.keys(ic.chains).length;
                let bMultiChain = false;
                let chainHashTmp = {};

                if(bSymd && Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
                    for(let serial in ic.hAtoms) {
                        let atom = ic.atoms[serial];
                        let chainid = atom.structure + '_' + atom.chain;
                        chainHashTmp[chainid] = 1;
                    }

                    if(Object.keys(chainHashTmp).length > 1) {
                        bMultiChain = true;
                    }
                }

                //if(!bSymd || bMultiChain || Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
                if(!bSymd) {
                    let selectedChain = Object.keys(ic.structures)[0] + '_' + chain;

                    if(!ic.chains.hasOwnProperty(selectedChain)) {
                        selectedChain = Object.keys(ic.structures)[0] + '_' + chain.toLowerCase();
                    }

                    if(!ic.chains.hasOwnProperty(selectedChain)) {
                        selectedChain = Object.keys(ic.chains)[0];
                        for(let chainid in ic.chains) {
                            let firstSerial = Object.keys(ic.chains[chainid])[0];
                            if(ic.proteins.hasOwnProperty(firstSerial)) {
                                selectedChain = chainid;
                                break;
                            }
                        }
                    }
                    selection = ic.chains[selectedChain];
                }
                else if(bMultiChain) {
                    let selectedChain = Object.keys(chainHashTmp)[0];
                    selection = ic.chains[selectedChain];
                }
                else { // bSymd, subset, and one chain
                    if(Object.keys(ic.hAtoms).length == 0) {
                        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
                    }

                    // pick the first 1/order of selection
                    let cnt = parseInt(Object.keys(ic.hAtoms).length / order);
                    let j = 0, lastSerial;

                    for(let serial in ic.hAtoms) {
                        selection[serial] = 1;
                        lastSerial = serial;
                        ++j;
                        if(j > cnt) break;
                    }

                    // add the whole residue for the last serial
                    let resid = ic.atoms[lastSerial].structure + '_' + ic.atoms[lastSerial].chain + '_' + ic.atoms[lastSerial].resi;
                    selection = me.hashUtilsCls.unionHash(selection, ic.residues[resid]);
                }


                let middle = start.clone().add(end).multiplyScalar(0.5);

                let psum = new THREE.Vector3();
                let cnt = 0;

                // apply the transformation to make the axis in the z-axis
                let axis = end.clone().sub(start).normalize();
                let vTo = new THREE.Vector3(0, 0, 1);

                let quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors (axis, vTo)

                let distSqMax = -9999;
                for (let serial in selection) {
                    let atom = ic.atoms[serial];
                    let coord = atom.coord.clone();
                    psum.add(coord);

                    coord.sub(middle).applyQuaternion(quaternion);

                    let distSq = coord.x*coord.x + coord.y*coord.y;

                    if(distSq > distSqMax) distSqMax = distSq;

                    ++cnt;
                }

                let center = psum.multiplyScalar(1.0 / cnt);

                let line = new THREE.Line3(start, end);

                // project center on line
                let proj = new THREE.Vector3();
                line.closestPointToPoint(center, true, proj);

                let rLen = Math.sqrt(distSqMax);

                let rDir = center.clone().sub(proj).normalize().multiplyScalar(rLen);

                //var start2 = start.clone().add(rDir);
                //var end2 = end.clone().add(rDir);

                let start2 = middle.clone().add(start.clone().sub(middle).multiplyScalar(0.83)).add(rDir);
                let end2 = middle.clone().add(end.clone().sub(middle).multiplyScalar(0.83)).add(rDir);

                //var axis = end.clone().sub(start).normalize();
                let anglePerSide = 2*Math.PI / nSide;

                let startInit, endInit, startPrev, endPrev;
                for(let j = 0; j < nSide; ++j) {
                    let angle = (0.5 + j) * anglePerSide;

                    let startCurr = start2.clone().sub(start);
                    startCurr.applyAxisAngle(axis, angle).add(start);

                    let endCurr = end2.clone().sub(start);
                    endCurr.applyAxisAngle(axis, angle).add(start);

                    ic.cylinderCls.createCylinder(startCurr, endCurr, polygonRadius, colorPolygon, 0);

                    ic.sphereCls.createSphereBase(startCurr, colorPolygon, polygonRadius, 1.0, 0);
                    ic.sphereCls.createSphereBase(endCurr, colorPolygon, polygonRadius, 1.0, 0);

                    if(j == 0) {
                        startInit = startCurr;
                        endInit = endCurr;
                    }
                    else {
                        ic.cylinderCls.createCylinder(startCurr, startPrev, polygonRadius, colorPolygon, 0);
                        ic.cylinderCls.createCylinder(endCurr, endPrev, polygonRadius, colorPolygon, 0);
                    }

                    startPrev = startCurr;
                    endPrev = endCurr;
                }

                if(startInit && startPrev) ic.cylinderCls.createCylinder(startInit, startPrev, polygonRadius, colorPolygon, 0);
                if(endInit && endPrev) ic.cylinderCls.createCylinder(endInit, endPrev, polygonRadius, colorPolygon, 0);
            }
            else if( (symmetryType == 'T' && order == 3)
              || (symmetryType == 'O' && order == 4)
              || (symmetryType == 'I' && order == 5) ) {
                pointArray.push(start);
                pointArray.push(end);
            }
            else if(symmetryType == 'H') {
            }
        }

        if(symmetryType == 'T') {
            let pos1 = pointArray[0]; // pointArray: start, end, start, end, ...
            ic.sphereCls.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);

            let dist2 = pos1.distanceTo(pointArray[2]);
            let dist3 = pos1.distanceTo(pointArray[3]);

            let distSmall, posSel;
            if(dist2 < dist3) {
                distSmall = dist2;
                posSel = pointArray[3];
            }
            else {
                distSmall = dist3;
                posSel = pointArray[2];
            }

            ic.sphereCls.createSphereBase(posSel, colorPolygon, polygonRadius, 1.0, 0);
            ic.cylinderCls.createCylinder(pos1, posSel, polygonRadius, colorPolygon, 0);

            let iPrev;
            for(let i = 4, il = pointArray.length; i < il; ++i) {
                let pos2 = pointArray[i];

                let dist = pos1.distanceTo(pos2);
                if(dist > distSmall) {
                    ic.sphereCls.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
                    ic.cylinderCls.createCylinder(pos1, pos2, polygonRadius, colorPolygon, 0);

                    ic.cylinderCls.createCylinder(posSel, pos2, polygonRadius, colorPolygon, 0);
                    if(iPrev !== undefined) {
                        ic.cylinderCls.createCylinder(pointArray[iPrev], pos2, polygonRadius, colorPolygon, 0);
                    }

                    iPrev = i;
                }
            }
        }
        else if(symmetryType == 'O') {
            for(let i = 0, il = pointArray.length; i < il; i += 2) {
                let pos1 = pointArray[i];
                let pos2 = pointArray[i+1];
                ic.sphereCls.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
                ic.sphereCls.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
                for(let j = i + 2, jl = pointArray.length; j < jl; ++j) {
                    let pos3 = pointArray[j];
                    ic.sphereCls.createSphereBase(pos3, colorPolygon, polygonRadius, 1.0, 0);
                    ic.cylinderCls.createCylinder(pos1, pos3, polygonRadius, colorPolygon, 0);
                    ic.cylinderCls.createCylinder(pos2, pos3, polygonRadius, colorPolygon, 0);
                }
            }
        }
        else if(symmetryType == 'I') {
            for(let i = 0, il = pointArray.length; i < il; i += 2) {
                let pos1 = pointArray[i];
                let pos2 = pointArray[i+1];
                ic.sphereCls.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
                ic.sphereCls.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
                for(let j = i + 2, jl = pointArray.length; j < jl; j += 2) {
                    let pos3 = pointArray[j];
                    let pos4 = pointArray[j+1];

                    let dist3 = pos1.distanceTo(pos3);
                    let dist4 = pos1.distanceTo(pos4);

                    let pos1Sel, pos2Sel;
                    if(dist3 < dist4) {
                        pos1Sel = pos3;
                        pos2Sel = pos4;
                    }
                    else {
                        pos1Sel = pos4;
                        pos2Sel = pos3;
                    }

                    ic.sphereCls.createSphereBase(pos1Sel, colorPolygon, polygonRadius, 1.0, 0);
                    ic.sphereCls.createSphereBase(pos2Sel, colorPolygon, polygonRadius, 1.0, 0);
                    ic.cylinderCls.createCylinder(pos1, pos1Sel, polygonRadius, colorPolygon, 0);
                    ic.cylinderCls.createCylinder(pos2, pos2Sel, polygonRadius, colorPolygon, 0);
                }
            }
        }
    }
}

export {ApplySymd}
