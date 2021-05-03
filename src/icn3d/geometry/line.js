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
    createLineRepresentation(atoms, bHighlight) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var geo = new THREE.Geometry();
        ic.reprSubCls.createRepresentationSub(atoms, undefined, function (atom0, atom1) {
            if (atom0.color === atom1.color) {
                geo.vertices.push(atom0.coord);
                geo.vertices.push(atom1.coord);
                geo.colors.push(atom0.color);
                geo.colors.push(atom1.color);
            } else {
                var mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
                geo.vertices.push(atom0.coord);
                geo.vertices.push(mp);
                geo.vertices.push(atom1.coord);
                geo.vertices.push(mp);
                geo.colors.push(atom0.color);
                geo.colors.push(atom0.color);
                geo.colors.push(atom1.color);
                geo.colors.push(atom1.color);
            }
        });

        if(bHighlight !== 2) {
            var line;
            if(bHighlight === 1) {
                // highlight didn't work for lines
                //line = new THREE.Mesh(geo, ic.matShader);
            }
            else {
                //line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: ic.linewidth, vertexColors: true }), THREE.LineSegments);
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

    createConnCalphSidechain(atoms, style) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        // find all residues with style2 as 'nothing' or undefined
        var residueHash = {};
        for(var i in atoms) {
            var atom = atoms[i];
            if(!atom.het && atom.style2 === style) {
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residueHash[resid] = 1;
            }
        }

        var coordArray = [];
        var colorArray = [];
        for(var resid in residueHash) {
            var atom = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid], 'CA');

            if(atom !== undefined) {
                for(var i = 0, il = atom.bonds.length; i < il; ++i) {
                    var bondAtom = ic.atoms[atom.bonds[i]];
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
                for(var i = 0, il = atom.bonds.length; i < il; ++i) {
                    var bondAtom = ic.atoms[atom.bonds[i]];
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

        for(var i = 0, il = coordArray.length; i < il; i += 2) {
            if(style === 'ball and stick' || style === 'stick') {
                var radius = (style === 'stick') ? ic.cylinderRadius : ic.cylinderRadius * 0.5;
                ic.cylinderCls.createCylinder(coordArray[i], coordArray[i+1], radius, colorArray[i+1]);
            }
            else if(style === 'lines') {
                var line = this.createSingleLine(coordArray[i], coordArray[i+1], colorArray[i+1], false, 0.5);
                ic.mdl.add(line);
            }
        }
    }

    createSingleLine( src, dst, colorHex, dashed, dashSize ) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var geom = new THREE.Geometry();
        var mat;

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: dashSize, gapSize: 0.5*dashSize });
        } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
        }

        geom.vertices.push( src );
        geom.vertices.push( dst );
        if(dashed) geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        //var axis = new THREE.Line( geom, mat, THREE.LineSegments );
        var axis = new THREE.LineSegments( geom, mat );

        return axis;
    }

    // show extra lines, not used for pk, so no ic.objects
    //Create lines for a list of "lines", each of which has the properties 'position1', 'position2',
    //'color', and a boolean of 'dashed'.
    createLines(lines) {  var ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       if(lines !== undefined) {
         for(var name in lines) {
             var lineArray = lines[name];

             for(var i = 0, il = lineArray.length; i < il; ++i) {
               var line = lineArray[i];

               var p1 = line.position1;
               var p2 = line.position2;

               var dashed = (line.dashed) ? line.dashed : false;
               var dashSize = 0.3;

               var radius = ic.lineRadius;

               var colorStr = '#' + line.color.replace(/\#/g, '');

               var color = me.parasCls.thr(colorStr);

               if(!dashed) {
                    if(name == 'stabilizer') {
                        ic.brickCls.createBrick(p1, p2, radius, color);
                    }
                    else {
                        ic.cylinderCls.createCylinder(p1, p2, radius, color);
                    }
               }
               else {
                 var distance = p1.distanceTo(p2);

                 var nsteps = parseInt(distance / dashSize);
                 var step = p2.clone().sub(p1).multiplyScalar(dashSize/distance);

                 var start, end;
                 for(var j = 0; j < nsteps; ++j) {
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
