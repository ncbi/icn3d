/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Strand} from '../geometry/strand.js';
import {Tube} from '../geometry/tube.js';
import {Box} from '../geometry/box.js';
import {Line} from '../geometry/line.js';
import {Sphere} from '../geometry/sphere.js';

class Cylinder {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createCylinder(p0, p1, radius, color, bHighlight, color2, bPicking, bGlycan) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let mesh;
        if(bHighlight === 1) {
            mesh = new THREE.Mesh(ic.cylinderGeometryOutline, ic.matShader);

            mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
            mesh.matrixAutoUpdate = false;
            mesh.lookAt(p1.clone().sub(p0));
            mesh.updateMatrix();

            mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius,
              p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

            mesh.renderOrder = ic.renderOrderPicking;
            ic.mdl.add(mesh);

            ic.prevHighlightObjects.push(mesh);
        }
        else {
            if(bHighlight === 2) {
              mesh = new THREE.Mesh(ic.cylinderGeometry, new THREE.MeshPhongMaterial(
                  { transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));

              radius *= 1.5;
            }
            else if(bGlycan) {
              mesh = new THREE.Mesh(ic.cylinderGeometry, new THREE.MeshPhongMaterial(
                  { transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
            }
            else {
              mesh = new THREE.Mesh(ic.cylinderGeometry, new THREE.MeshPhongMaterial(
                  { specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
            }

            mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
            mesh.matrixAutoUpdate = false;
            mesh.lookAt(p1.clone().sub(p0));
            mesh.updateMatrix();

            mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(
                new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

            if(ic.bImpo && !bGlycan) {
              ic.posArray.push(p0.x);
              ic.posArray.push(p0.y);
              ic.posArray.push(p0.z);

              if(!color) color = me.parasCls.thr(0xFFFFFF);
              ic.colorArray.push(color.r);
              ic.colorArray.push(color.g);
              ic.colorArray.push(color.b);

              ic.pos2Array.push(p1.x);
              ic.pos2Array.push(p1.y);
              ic.pos2Array.push(p1.z);

              if(color2 !== undefined) {
                  ic.color2Array.push(color2.r);
                  ic.color2Array.push(color2.g);
                  ic.color2Array.push(color2.b);
              }
              else {
                  ic.color2Array.push(color.r);
                  ic.color2Array.push(color.g);
                  ic.color2Array.push(color.b);
              }

              ic.radiusArray.push(radius);

              if(ic.cnt <= ic.maxatomcnt) ic.mdl_ghost.add(mesh);
            }
            else {
                ic.mdl.add(mesh);
            }

            if(bHighlight === 2) {
                if(ic.bImpo) {
                    if(ic.cnt <= ic.maxatomcnt) ic.prevHighlightObjects_ghost.push(mesh);
                }
                else {
                    ic.prevHighlightObjects.push(mesh);
                }
            }
            else {
                if(ic.bImpo) {
                    if(ic.cnt <= ic.maxatomcnt) ic.objects_ghost.push(mesh);
                }
                else {
                    if(bPicking === undefined || bPicking) ic.objects.push(mesh);
                }
            }
        }
    }

    createCylinder_base(p0, p1, radius, color, bHighlight, color2, bPicking) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let mesh = new THREE.Mesh(ic.cylinderGeometry, new THREE.MeshPhongMaterial(
            { specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));

        mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
        mesh.matrixAutoUpdate = false;
        mesh.lookAt(p1.clone().sub(p0));
        mesh.updateMatrix();

        mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(
            new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

        return mesh;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create cylinders for alpha helices and ribbons for beta strands in "atoms".
    //"radius" is radius of the cylinders. "bHighlight" is an option to draw the highlight for these atoms.
    //The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2 as mentioned above.
    createCylinderHelix(atoms, radius, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let start = null;
        let currentChain, currentResi;
        let others = {}, beta = {};
        let i;
        for (i in atoms) {
            let atom = atoms[i];
            if (atom.het) continue;
            if ((atom.ss !== 'helix' && atom.ss !== 'sheet') || atom.ssend || atom.ssbegin) others[atom.serial] = atom;
            if (atom.ss === 'sheet') beta[atom.serial] = atom;
            if (atom.name !== 'CA') continue;
            if (atom.ss === 'helix' && atom.ssend) {
                if (start !== null && currentChain === atom.chain && currentResi < atom.resi) {
                    if(bHighlight === 1 || bHighlight === 2) {
                        this.createCylinder(start.coord, atom.coord, radius, ic.hColor, bHighlight);
                    }
                    else {
                        this.createCylinder(start.coord, atom.coord, radius, atom.color);
                    }
                }

                start = null;
            }

            if (start === null && atom.ss === 'helix' && atom.ssbegin) {
                start = atom;

                currentChain = atom.chain;
                currentResi = atom.resi;
            }
        }

        if(bHighlight === 1 || bHighlight === 2) {
            if(Object.keys(others).length > 0) ic.tubeCls.createTube(others, 'CA', ic.coilWidth, bHighlight);
            if(Object.keys(beta).length > 0) ic.strandCls.createStrand(beta, undefined, undefined, true, 0,
                ic.helixSheetWidth, false, ic.ribbonthickness * 2, bHighlight);
        }
        else {
            if(Object.keys(others).length > 0) ic.tubeCls.createTube(others, 'CA', ic.coilWidth);
            if(Object.keys(beta).length > 0) ic.strandCls.createStrand(beta, undefined, undefined, true, 0,
                ic.helixSheetWidth, false, ic.ribbonthickness * 2);
        }
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create small cylinders (thick lines) for "atoms", whose atom name should be in the array atomNameArray.
    //"radius" is radius of the small cylinders. "bLine" is an option to show the cylinders as lines.
    //"bHighlight" is an option to draw the highlight for these atoms. The highlight could be outlines
    //with bHighlight=1 and 3D objects with bHighlight=2 as mentioned above.
    createCylinderCurve(atoms, atomNameArray, radius, bLines, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let start = null;
        let currentChain, currentResi;
        let i;
        let pnts = [], colors = [], radii = [];

        let atom, maxDistance = 8.0; // max residue-residue (or nucleitide-nucleitide) distance allowed

        for (i in atoms) {
            atom = atoms[i];
            if (atom.het) continue;

            //if (atom.name !== atomName) continue;
            if(atomNameArray.indexOf(atom.name) == -1) continue;

            if (start !== null && currentChain === atom.chain && currentResi != atom.resi //currentResi + 1 === atom.resi
                && Math.abs(start.coord.x - atom.coord.x) < maxDistance
                && Math.abs(start.coord.y - atom.coord.y) < maxDistance
                && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
                let middleCoord = start.coord.clone().add(atom.coord).multiplyScalar(0.5);

                if(!bHighlight) {
                    if(bLines) {
                        let line = ic.lineCls.createSingleLine( start.coord, middleCoord, start.color, false);
                        ic.mdl.add(line);
                        ic.objects.push(line);
                        line = ic.lineCls.createSingleLine( middleCoord, atom.coord, atom.color, false);
                        ic.mdl.add(line);
                        ic.objects.push(line);
                    }
                    else {
                        this.createCylinder(start.coord, middleCoord, radius, start.color);
                        this.createCylinder(middleCoord, atom.coord, radius, atom.color);
                        ic.sphereCls.createSphere(atom, radius, true, 1, bHighlight);
                    }
                }
                else if(bHighlight === 1) {
                    this.createCylinder(start.coord, middleCoord, radius, start.color, bHighlight);
                    this.createCylinder(middleCoord, atom.coord, radius, atom.color, bHighlight);
                    ic.sphereCls.createSphere(atom, radius, true, 1, bHighlight);
                }
            }

            start = atom;
            currentChain = atom.chain;
            currentResi = atom.resi;

            // create a sphere for each c-alpha
            ic.sphereCls.createSphere(atom, radius, true, 1, bHighlight);

            if(bHighlight === 2) ic.boxCls.createBox(atom, undefined, undefined, undefined, undefined, bHighlight);
        }
        if (start !== null && currentChain === atom.chain && currentResi != atom.resi //currentResi + 1 === atom.resi
            && Math.abs(start.coord.x - atom.coord.x) < maxDistance
            && Math.abs(start.coord.y - atom.coord.y) < maxDistance
            && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
            let middleCoord = start.coord.add(atom.coord).multiplyScalar(0.5);
            if(!bHighlight) {
                if(bLines) {
                    let line = ic.lineCls.createSingleLine( start.coord, middleCoord, start.color, false);
                    ic.mdl.add(line);
                    ic.objects.push(line);
                    line = ic.lineCls.createSingleLine( middleCoord, atom.coord, atom.color, false);
                    ic.mdl.add(line);
                    ic.objects.push(line);
                }
                else {
                    this.createCylinder(start.coord, middleCoord, radius, start.color);
                    this.createCylinder(middleCoord, atom.coord, radius, atom.color);
                }
            }
            else if(bHighlight === 1) {
                this.createCylinder(start.coord, middleCoord, radius, start.color, bHighlight);
                this.createCylinder(middleCoord, atom.coord, radius, atom.color, bHighlight);
                ic.sphereCls.createSphere(atom, radius, true, 1, bHighlight);
            }
        }
    }
}

export {Cylinder}
