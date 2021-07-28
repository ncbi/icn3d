/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Cylinder} from '../geometry/cylinder.js';

class ApplyClbonds {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyClbondsOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
       if(options === undefined) options = ic.opts;

       if(!ic.bCalcCrossLink) {
         // find all bonds to chemicals
         ic.clbondpnts = {};
         ic.clbondResid2serial = {};

         // chemical to chemical first
         this.applyClbondsOptions_base('chemical');

         // chemical to protein/nucleotide
         this.applyClbondsOptions_base('all');

         ic.bCalcCrossLink = true;
       }

       if (options.clbonds.toLowerCase() === 'yes' && options.chemicals !== 'nothing') {
         let color = '#006400';
         let colorObj = me.parasCls.thr(0x006400);

         ic.lines['clbond'] = [];
         ic.residuesHashClbonds = {};

         if(ic.structures) {
             let strucArray = Object.keys(ic.structures);
             for(let i = 0, il = strucArray.length; i < il; ++i) {
                 let struc = strucArray[i];
                 if(!ic.clbondpnts[struc]) continue;

                 for(let j = 0, jl = ic.clbondpnts[struc].length; j < jl; j += 2) {
                    let resid0 = ic.clbondpnts[struc][j];
                    let resid1 = ic.clbondpnts[struc][j+1];

                    let line = {};
                    line.color = color;
                    line.dashed = false;

                    line.serial1 = ic.clbondResid2serial[resid0 + ',' + resid1];
                    line.serial2 = ic.clbondResid2serial[resid1 + ',' + resid0];

                    if(!ic.dAtoms.hasOwnProperty(line.serial1) || !ic.dAtoms.hasOwnProperty(line.serial2)) continue;

                    line.position1 = ic.atoms[line.serial1].coord;
                    line.position2 = ic.atoms[line.serial2].coord;

                    ic.lines['clbond'].push(line);
                    ic.cylinderCls.createCylinder(line.position1, line.position2, ic.cylinderRadius, colorObj);

                    // show stick for these two residues
                    let residueAtoms = {};
                    residueAtoms = me.hashUtilsCls.unionHash(residueAtoms, ic.residues[resid0]);
                    residueAtoms = me.hashUtilsCls.unionHash(residueAtoms, ic.residues[resid1]);

                    // show side chains for the selected atoms
                    let atoms = me.hashUtilsCls.intHash(residueAtoms, ic.sidec);

                    // draw sidec separatedly
                    for(let k in atoms) {
                      ic.atoms[k].style2 = 'stick';
                    }

                    // return the residues
                    ic.residuesHashClbonds[resid0] = 1;
                    ic.residuesHashClbonds[resid1] = 1;
                } // for j
            } // for i
        } // if
      } // if

      return ic.residuesHashClbonds;
    }

    applyClbondsOptions_base(type) { let ic = this.icn3d, me = ic.icn3dui;
         // chemical to chemical first
         for (let i in ic.chemicals) {
            let atom0 = ic.atoms[i];

            let chain0 = atom0.structure + '_' + atom0.chain;
            let resid0 = chain0 + '_' + atom0.resi;

            for (let j in atom0.bonds) {
                let atom1 = ic.atoms[atom0.bonds[j]];

                if (atom1 === undefined) continue;
                if (atom1.chain !== atom0.chain || atom1.resi !== atom0.resi) {
                    let chain1 = atom1.structure + '_' + atom1.chain;
                    let resid1 = chain1 + '_' + atom1.resi;

                    let bType = (type == 'chemical') ? atom1.het : true; //(ic.proteins.hasOwnProperty(atom1.serial) || ic.nucleotides.hasOwnProperty(atom1.serial));

                    if(bType ) {
                        if(type == 'chemical') continue; // just connect checmicals together

                        if(ic.clbondpnts[atom0.structure] === undefined) ic.clbondpnts[atom0.structure] = [];
                        ic.clbondpnts[atom0.structure].push(resid0);
                        ic.clbondpnts[atom1.structure].push(resid1);

                        // one residue may have different atom for different clbond
                        ic.clbondResid2serial[resid0 + ',' + resid1] = atom0.serial;
                        ic.clbondResid2serial[resid1 + ',' + resid0] = atom1.serial;
                    }
                }
            } // for j
        } // for i
    }
}

export {ApplyClbonds}
