/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ReprSub} from '../geometry/reprSub.js';
import {Cylinder} from '../geometry/cylinder.js';
import {Sphere} from '../geometry/sphere.js';

class Stick {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create sticks for "atoms". "bondR" is the radius of the sticks. "atomR" is the radius of the spheres in the joints.
    //"scale" means scale on the radius. "bHighlight" is an option to draw the highlight for these atoms.
    //The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2.
    createStickRepresentation(atoms, atomR, bondR, scale, bHighlight, bSchematic) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let factor = (bSchematic !== undefined && bSchematic) ? atomR / ic.cylinderRadius : 1;

            ic.reprSubCls.createRepresentationSub(atoms, function (atom0) {
                    ic.sphereCls.createSphere(atom0, atomR, !scale, scale, bHighlight);
            }, function (atom0, atom1) {
                let mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
                let pair = atom0.serial + '_' + atom1.serial;

                if(ic.doublebonds.hasOwnProperty(pair)) { // show double bond
                    let a0, a1, a2;

                    let v0;
                    let random = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                    if(atom0.bonds.length == 1 && atom1.bonds.length == 1) {
                        v0 = atom1.coord.clone();
                        v0.sub(atom0.coord);

                        let v = random.clone();
                        v0.cross(v).normalize().multiplyScalar(0.2 * factor);
                    }
                    else {
                        if(atom0.bonds.length >= atom1.bonds.length && atom0.bonds.length > 1) {
                            a0 = atom0.serial;
                            a1 = atom0.bonds[0];
                            a2 = atom0.bonds[1];
                        }
                        //else {
                        else if(atom1.bonds.length >= atom0.bonds.length && atom1.bonds.length > 1) {
                            a0 = atom1.serial;
                            a1 = atom1.bonds[0];
                            a2 = atom1.bonds[1];
                        }
                        else {
                            console.log("Double bond was not drawn due to the undefined cross plane");
                            return;
                        }

                        let v1 = ic.atoms[a0].coord.clone();
                        v1.sub(ic.atoms[a1].coord);
                        let v2 = ic.atoms[a0].coord.clone();
                        v2.sub(ic.atoms[a2].coord);

                        v1.cross(v2);

                        // parallel
                        if(parseInt(v1.length() * 10000) == 0) {
                            //v1 = random.clone();
                            // use a constant so that they are fixed,e.g., in CO2
                            v1 = new THREE.Vector3(0.2, 0.3, 0.5);
                        }

                        v0 = atom1.coord.clone();
                        v0.sub(atom0.coord);

                        v0.cross(v1).normalize().multiplyScalar(0.2 * factor);
                        // parallel
                        if(parseInt(v0.length() * 10000) == 0) {
                            //v1 = random.clone();
                            // use a constant so that they are fixed,e.g., in CO2
                            v1 = new THREE.Vector3(0.5, 0.3, 0.2);
                            v0.cross(v1).normalize().multiplyScalar(0.2 * factor);
                        }
                    }

                    if (atom0.color === atom1.color) {
                        if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                            ic.cylinderCls.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            ic.cylinderCls.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                        }
                    } else {
                        if(ic.bImpo) {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight, atom1.color);
                                ic.cylinderCls.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight, atom1.color);
                            }
                        }
                        else {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord.clone().add(v0), mp.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().add(v0), mp.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom1.color, bHighlight);

                                ic.cylinderCls.createCylinder(atom0.coord.clone().sub(v0), mp.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().sub(v0), mp.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                            }
                        }
                    }
                }
                else if(ic.aromaticbonds.hasOwnProperty(pair)) { // show aromatic bond
                    let a0, a1, a2;
                    if(atom0.bonds.length > atom1.bonds.length && atom0.bonds.length > 1) {
                        a0 = atom0.serial;
                        a1 = atom0.bonds[0];
                        a2 = atom0.bonds[1];
                    }
                    else if(atom1.bonds.length > 1) {
                        a0 = atom1.serial;
                        a1 = atom1.bonds[0];
                        a2 = atom1.bonds[1];
                    }
                    else {
                        return;
                    }

                    let v1 = ic.atoms[a0].coord.clone();
                    v1.sub(ic.atoms[a1].coord);
                    let v2 = ic.atoms[a0].coord.clone();
                    v2.sub(ic.atoms[a2].coord);

                    v1.cross(v2);

                    let v0 = atom1.coord.clone();
                    v0.sub(atom0.coord);

                    v0.cross(v1).normalize().multiplyScalar(0.2 * factor);

                    // find an aromatic neighbor
                    let aromaticNeighbor = 0;
                    for(let i = 0, il = atom0.bondOrder.length; i < il; ++i) {
                        if(atom0.bondOrder[i] === '1.5' && atom0.bonds[i] !== atom1.serial) {
                            aromaticNeighbor = atom0.bonds[i];
                        }
                    }

                    let dashed = "add";
                    if(aromaticNeighbor === 0 ) { // no neighbor found, atom order does not matter
                        dashed = "add";
                    }
                    else {
                        // calculate the angle between atom1, atom0add, atomNeighbor and the angle atom1, atom0sub, atomNeighbor
                        let atom0add = atom0.coord.clone().add(v0);
                        let atom0sub = atom0.coord.clone().sub(v0);

                        let a = atom1.coord.clone().sub(atom0add).normalize();
                        let b = ic.atoms[aromaticNeighbor].coord.clone().sub(atom0add).normalize();

                        let c = atom1.coord.clone().sub(atom0sub).normalize();
                        let d = ic.atoms[aromaticNeighbor].coord.clone().sub(atom0sub).normalize();

                        let angleadd = Math.acos(a.dot(b));
                        let anglesub = Math.acos(c.dot(d));

                        if(angleadd < anglesub) {
                            dashed = 'sub';
                        }
                        else {
                            dashed = 'add';
                        }
                    }

                    if (atom0.color === atom1.color) {
                        let base, step;
                        if(dashed === 'add') {
                            ic.cylinderCls.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);

                            base = atom0.coord.clone().add(v0);
                            step = atom1.coord.clone().add(v0).sub(base).multiplyScalar(1.0/11);
                        }
                        else {
                            ic.cylinderCls.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);

                            base = atom0.coord.clone().sub(v0);
                            step = atom1.coord.clone().sub(v0).sub(base).multiplyScalar(1.0/11);
                        }

                        for(let i = 0; i <= 10; ++i) {
                            if(i % 2 == 0) {
                                let pos1 = base.clone().add(step.clone().multiplyScalar(i));
                                let pos2 = base.clone().add(step.clone().multiplyScalar(i + 1));
                                ic.cylinderCls.createCylinder(pos1, pos2, ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            }
                        }

                    } else {
                        let base, step;
                        if(dashed === 'add') {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord.clone().sub(v0), mp.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().sub(v0), mp.clone().sub(v0), ic.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                            }

                            base = atom0.coord.clone().add(v0);
                            step = atom1.coord.clone().add(v0).sub(base).multiplyScalar(1.0/11);
                        }
                        else {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord.clone().add(v0), mp.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().add(v0), mp.clone().add(v0), ic.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                            }

                            base = atom0.coord.clone().sub(v0);
                            step = atom1.coord.clone().sub(v0).sub(base).multiplyScalar(1.0/11);
                        }

                        for(let i = 0; i <= 10; ++i) {
                            if(i % 2 == 0 && ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                let pos1 = base.clone().add(step.clone().multiplyScalar(i));
                                let pos2 = base.clone().add(step.clone().multiplyScalar(i + 1));
                                if(i < 5) {
                                    ic.cylinderCls.createCylinder(pos1, pos2, ic.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                                }
                                else {
                                    ic.cylinderCls.createCylinder(pos1, pos2, ic.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                                }
                            }
                        }
                    }
                }
                else if(ic.triplebonds.hasOwnProperty(pair)) { // show triple bond
                    let random = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                    let v = atom1.coord.clone();
                    v.sub(atom0.coord);

                    let c = random.clone();
                    c.cross(v).normalize().multiplyScalar(0.3 * factor);

                    if (atom0.color === atom1.color) {
                        if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                            ic.cylinderCls.createCylinder(atom0.coord, atom1.coord, ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                            ic.cylinderCls.createCylinder(atom0.coord.clone().add(c), atom1.coord.clone().add(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                            ic.cylinderCls.createCylinder(atom0.coord.clone().sub(c), atom1.coord.clone().sub(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                        }
                    } else {
                        if(ic.bImpo) {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord, atom1.coord, ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                                ic.cylinderCls.createCylinder(atom0.coord.clone().add(c), atom1.coord.clone().add(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                                ic.cylinderCls.createCylinder(atom0.coord.clone().sub(c), atom1.coord.clone().sub(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                            }
                        }
                        else {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord, mp, ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord, mp, ic.cylinderRadius * factor * 0.2, atom1.color, bHighlight);

                                ic.cylinderCls.createCylinder(atom0.coord.clone().add(c), mp.clone().add(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().add(c), mp.clone().add(c), ic.cylinderRadius * factor * 0.2, atom1.color, bHighlight);

                                ic.cylinderCls.createCylinder(atom0.coord.clone().sub(c), mp.clone().sub(c), ic.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord.clone().sub(c), mp.clone().sub(c), ic.cylinderRadius * factor * 0.2, atom1.color, bHighlight);
                            }
                        }
                    }
                }
                else {
                    if (atom0.color === atom1.color) {
                        ic.cylinderCls.createCylinder(atom0.coord, atom1.coord, bondR, atom0.color, bHighlight);
                    } else {
                        if(ic.bImpo) {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord, atom1.coord, bondR, atom0.color, bHighlight, atom1.color);
                            }
                        }
                        else {
                            if(ic.dAtoms.hasOwnProperty(atom0.serial) && ic.dAtoms.hasOwnProperty(atom1.serial)) {
                                ic.cylinderCls.createCylinder(atom0.coord, mp, bondR, atom0.color, bHighlight);
                                ic.cylinderCls.createCylinder(atom1.coord, mp, bondR, atom1.color, bHighlight);
                            }
                        }
                    }
                }
            });
    }

}

export {Stick}
