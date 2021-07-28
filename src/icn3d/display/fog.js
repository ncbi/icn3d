/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {ApplyCenter} from '../display/applyCenter.js';
import {Transform} from '../transform/transform.js';

class Fog {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    setFog(bZoomin) { let ic = this.icn3d, me = ic.icn3dui;
        let background = me.parasCls.backgroundColors[ic.opts.background.toLowerCase()];

        if(bZoomin) {
            let centerAtomsResults = ic.applyCenterCls.centerAtoms(ic.hAtoms);
            ic.maxD = centerAtomsResults.maxD;
            if (ic.maxD < 5) ic.maxD = 5;
        }

        let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;

        // apply fog
        if(ic.opts['fog'] === 'yes') {
            if(ic.opts['camera'] === 'perspective') {        //perspective, orthographic
                //ic.scene.fog = new THREE.Fog(background, ic.cam_z, ic.cam_z + 0.5 * ic.maxD);
                //ic.scene.fog = new THREE.Fog(background, 2 * ic.maxD, 2.5 * ic.maxD);
                //ic.scene.fog = new THREE.Fog(background, 1.5 * ic.maxD, 3 * ic.maxD);

                if(bInstance) {
                    ic.scene.fog = undefined;
                    ic.bSetFog = false;
                }
                else {
                    ic.scene.fog = new THREE.Fog(background, 2.5*ic.maxD, 4*ic.maxD);
                    ic.bSetFog = true;
                    ic.camMaxDFactorFog = 3;
                }
            }
            else if(ic.opts['camera'] === 'orthographic') {
                //ic.scene.fog = new THREE.FogExp2(background, 2);
                //ic.scene.fog.near = 1.5 * ic.maxD;
                //ic.scene.fog.far = 3 * ic.maxD;

                ic.scene.fog = undefined;
                ic.bSetFog = false;
            }
        }
        else {
            ic.scene.fog = undefined;
            ic.bSetFog = false;
        }

        if(bZoomin && !bInstance) {
            ic.transformCls.zoominSelection();
        }
    }
}

export {Fog}
