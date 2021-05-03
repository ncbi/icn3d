/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {Box} from '../geometry/box.js';
import {Sphere} from '../geometry/sphere.js';
import {Cylinder} from '../geometry/cylinder.js';
import {Axes} from '../geometry/axes.js';
import {ApplyCenter} from '../display/applyCenter.js';

class Glycan {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showGlycans() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var glycan2resids = {}
        //var atomHash = me.hashUtilsCls.intHash(ic.hAtoms, ic.dAtoms);
        var atomHash = ic.dAtoms;

        for(var i in atomHash) {
            var atom = ic.atoms[i];
            if(atom.het && me.parasCls.glycanHash.hasOwnProperty(atom.resn) != -1) {
                if(glycan2resids[atom.resn] === undefined) glycan2resids[atom.resn] = {}
                if(atom.chain != 'Misc') {
                    glycan2resids[atom.resn][atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;
                }
            }
        }

        // two types of shape: cube,sphere
        // four types of color: ic.glycanColors
        var glycanNames = Object.keys(glycan2resids);
        for(var i = 0, il = glycanNames.length; i < il; ++i) {
            var glycanName = glycanNames[i];
            if(!me.parasCls.glycanHash.hasOwnProperty(glycanName)) continue;

            var shape = me.parasCls.glycanHash[glycanName].s;
            var color = new THREE.Color('#' + me.parasCls.glycanHash[glycanName].c);

            var resiArray = Object.keys(glycan2resids[glycanName]);
            for(var j = 0, jl = resiArray.length; j < jl; ++j) {
                var result = ic.applyCenterCls.centerAtoms(ic.residues[resiArray[j]]);
                var center = result.center;
                var radius = result.maxD * 0.5 * 0.6;

                if(shape == 'cube') {
                    ic.boxCls.createBox_base(center, radius, color, false, false, true);
                }
                else if(shape == 'sphere') {
                    ic.sphereCls.createSphereBase(center, color, radius, 1, false, true);
                }
                else if(shape == 'cone') {
                    var dirZ = new THREE.Vector3( 0, 0, 1 );

                    var arrowZ = ic.axesCls.createArrow( dirZ, new THREE.Vector3(0, 0, -1*radius).add(center), 0, color, 2*radius, 2*radius, true);
                    ic.mdl.add( arrowZ );
                    ic.objects.push(arrowZ);
                }
                else if(shape == 'cylinder') {
                    var p0 = new THREE.Vector3(0, 0, radius).add(center);
                    var p1 = new THREE.Vector3(0, 0, -1*radius).add(center);
                    ic.cylinderCls.createCylinder(p0, p1, radius, color, false, color, false, true);
                }
            }
        }
    }

}

export {Glycan}