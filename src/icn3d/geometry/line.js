/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Box} from '../geometry/box.js';
import {Cylinder} from '../geometry/cylinder.js';
import {ReprSub} from '../geometry/reprSub.js';
import {Brick} from '../geometry/brick.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';

class Line {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create lines for "atoms". "bHighlight" is an option to draw the highlight for these atoms.
    //The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2.
    createLineRepresentation(atoms, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        //var geo = new THREE.Geometry();
        let geo = new THREE.BufferGeometry();
        let vertices = [], colors = [], offset = 0, offset2 = 0;

        ic.reprSubCls.createRepresentationSub(atoms, undefined, function (atom0, atom1) {
            if (atom0.color === atom1.color) {
                vertices[offset++] = atom0.coord.x;
                vertices[offset++] = atom0.coord.y;
                vertices[offset++] = atom0.coord.z;
                vertices[offset++] = atom1.coord.x;
                vertices[offset++] = atom1.coord.y;
                vertices[offset++] = atom1.coord.z;

                colors[offset2++] = atom0.color.r;
                colors[offset2++] = atom0.color.g;
                colors[offset2++] = atom0.color.b;
                colors[offset2++] = atom1.color.r;
                colors[offset2++] = atom1.color.g;
                colors[offset2++] = atom1.color.b;
            } else {
                let mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
                vertices[offset++] = atom0.coord.x;
                vertices[offset++] = atom0.coord.y;
                vertices[offset++] = atom0.coord.z;
                vertices[offset++] = mp.x;
                vertices[offset++] = mp.y;
                vertices[offset++] = mp.z;
                vertices[offset++] = atom1.coord.x;
                vertices[offset++] = atom1.coord.y;
                vertices[offset++] = atom1.coord.z;
                vertices[offset++] = mp.x;
                vertices[offset++] = mp.y;
                vertices[offset++] = mp.z;

                colors[offset2++] = atom0.color.r;
                colors[offset2++] = atom0.color.g;
                colors[offset2++] = atom0.color.b;
                colors[offset2++] = atom0.color.r;
                colors[offset2++] = atom0.color.g;
                colors[offset2++] = atom0.color.b;
                colors[offset2++] = atom1.color.r;
                colors[offset2++] = atom1.color.g;
                colors[offset2++] = atom1.color.b;
                colors[offset2++] = atom1.color.r;
                colors[offset2++] = atom1.color.g;
                colors[offset2++] = atom1.color.b;
            }
        });

        let nComp = 3;
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), nComp));
        geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), nComp));

        //geo.computeVertexNormals();

        if(bHighlight !== 2) {
            let line;
            if(bHighlight === 1) {
                // highlight didn't work for lines
                //line = new THREE.Mesh(geo, ic.matShader);
            }
            else {
                line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial(
                    { linewidth: ic.linewidth, vertexColors: true }));
                ic.mdl.add(line);
            }

            if(bHighlight === 1) {
                ic.prevHighlightObjects.push(line);
            }
            else {
                ic.objects.push(line);
            }
        }
        else if(bHighlight === 2) {
            ic.boxCls.createBoxRepresentation_P_CA(atoms, 0.8, bHighlight);
        }
    }

    createConnCalphSidechain(atoms, style) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        // find all residues with style2 as 'nothing' or undefined
        let residueHash = {};
        for(let i in atoms) {
            let atom = atoms[i];
            if(!atom.het && atom.style2 === style) {
                let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residueHash[resid] = 1;
            }
        }

        let coordArray = [];
        let colorArray = [];
        for(let resid in residueHash) {
            let atom = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid], 'CA');

            if(atom !== undefined) {
                for(let i = 0, il = atom.bonds.length; i < il; ++i) {
                    let bondAtom = ic.atoms[atom.bonds[i]];
                    // hydrogen connected to Calpha: HA
                    if(bondAtom.name === 'HA' || (bondAtom.name !== 'C' && bondAtom.name !== 'N'
                      && bondAtom.elem !== 'H' && bondAtom.resi == atom.resi) ) {
                        coordArray.push(atom.coord);
                        coordArray.push(bondAtom.coord);

                        colorArray.push(atom.color);
                        colorArray.push(bondAtom.color);
                    }
                }
            }

            // hydrogen connected to N: H
            atom = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid], 'N');

            if(atom !== undefined) {
                for(let i = 0, il = atom.bonds.length; i < il; ++i) {
                    let bondAtom = ic.atoms[atom.bonds[i]];
                    // hydrogen connected to Calpha: HA
                    if(bondAtom.name === 'H') {
                        coordArray.push(atom.coord);
                        coordArray.push(bondAtom.coord);

                        colorArray.push(atom.color);
                        colorArray.push(bondAtom.color);
                    }
                }
            }
        }

        for(let i = 0, il = coordArray.length; i < il; i += 2) {
            if(style === 'ball and stick' || style === 'stick') {
                let radius = (style === 'stick') ? ic.cylinderRadius : ic.cylinderRadius * 0.5;
                ic.cylinderCls.createCylinder(coordArray[i], coordArray[i+1], radius, colorArray[i+1]);
            }
            else if(style === 'lines') {
                let line = this.createSingleLine(coordArray[i], coordArray[i+1], colorArray[i+1], false, 0.5);
                ic.mdl.add(line);
            }
        }
    }

    createSingleLine( src, dst, colorHex, dashed, dashSize ) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        //var geom = new THREE.Geometry();
        let geo = new THREE.BufferGeometry();
        let vertices = [];

        let mat;

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: dashSize, gapSize: 0.5*dashSize });
        } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
        }

        vertices[0] = src.x;
        vertices[1] = src.y;
        vertices[2] = src.z;
        vertices[3] = dst.x;
        vertices[4] = dst.y;
        vertices[5] = dst.z;

        let nComp = 3;
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), nComp));

        //geo.computeVertexNormals();

        //if(dashed) geo.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines
        let axis = new THREE.LineSegments( geo, mat );
        if(dashed) axis.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        return axis;
    }

    // show extra lines, not used for pk, so no ic.objects
    //Create lines for a list of "lines", each of which has the properties 'position1', 'position2',
    //'color', and a boolean of 'dashed'.
    createLines(lines) {  let ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       if(lines !== undefined) {
         for(let name in lines) {
             let lineArray = lines[name];

             for(let i = 0, il = lineArray.length; i < il; ++i) {
               let line = lineArray[i];

               let p1 = line.position1;
               let p2 = line.position2;

               let dashed = (line.dashed) ? line.dashed : false;
               let dashSize = 0.3;

               let radius = ic.lineRadius;

               let colorStr = '#' + line.color.replace(/\#/g, '');

               let color = me.parasCls.thr(colorStr);

               if(!dashed) {
                    if(name == 'stabilizer') {
                        ic.brickCls.createBrick(p1, p2, radius, color);
                    }
                    else {
                        ic.cylinderCls.createCylinder(p1, p2, radius, color);
                    }
               }
               else {
                 let distance = p1.distanceTo(p2);

                 let nsteps = parseInt(distance / dashSize);
                 let step = p2.clone().sub(p1).multiplyScalar(dashSize/distance);

                 let start, end;
                 for(let j = 0; j < nsteps; ++j) {
                     if(j % 2 == 1) {
                          start = p1.clone().add(step.clone().multiplyScalar(j));
                          end = p1.clone().add(step.clone().multiplyScalar(j + 1));

                          if(name == 'stabilizer') {
                            ic.brickCls.createBrick(start, end, radius, color);
                          }
                          else {
                            ic.cylinderCls.createCylinder(start, end, radius, color);
                          }
                      }
                 }
               }
             }
         }
       }

       // do not add the artificial lines to raycasting objects
    };

}

export {Line}
