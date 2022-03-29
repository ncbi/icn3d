/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {ApplyMap} from '../surface/applyMap.js';
import {Draw} from '../display/draw.js';
import {Axes} from '../geometry/axes.js';

class Alternate {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // change the display atom when alternating
    //Show structures one by one.
    alternateStructures() { let ic = this.icn3d, me = ic.icn3dui;
        if(!ic.viewSelectionAtoms) {
            ic.viewSelectionAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
        }

        let viewSelectionAtomsCount = Object.keys(ic.viewSelectionAtoms).length;
        let allAtomsCount = Object.keys(ic.atoms).length;

        ic.dAtoms = {};

        // alternate all displayed structures
        let moleculeArray = Object.keys(ic.structures);
        // only alternate selected structures
        // let structureHash = {};
        // for(let i in ic.hAtoms) {
        //     let structure = ic.atoms[i].structure;
        //     structureHash[structure] = 1;
        // }
        // let moleculeArray = Object.keys(structureHash);

        for(let i = 0, il = moleculeArray.length; i < il; ++i) {
            let structure = moleculeArray[i];
            //if(i > ic.ALTERNATE_STRUCTURE || (ic.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
            let bChoose;
            if(ic.bShift) {
                // default ic.ALTERNATE_STRUCTURE = -1
                if(ic.ALTERNATE_STRUCTURE < 0) ic.ALTERNATE_STRUCTURE = 1;

                bChoose = (i == ic.ALTERNATE_STRUCTURE % il - 1) 
                  || (ic.ALTERNATE_STRUCTURE % il === 0 && i === il - 1);
            } 
            else {
                bChoose = (i == ic.ALTERNATE_STRUCTURE % il + 1) 
                  || (ic.ALTERNATE_STRUCTURE % il === il - 1 && i === 0);
            }

            if(bChoose) {
                for(let k in ic.structures[structure]) {
                    let chain = ic.structures[structure][k];
                    ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.chains[chain]);
                }

                //ic.ALTERNATE_STRUCTURE = i;
                if(ic.bShift) {
                    --ic.ALTERNATE_STRUCTURE;
                }
                else {
                    ++ic.ALTERNATE_STRUCTURE;
                }

                if(ic.ALTERNATE_STRUCTURE < 0) ic.ALTERNATE_STRUCTURE += il;

                $("#" + ic.pre + "title").html(structure);

                break;
            }
        } 

        if(viewSelectionAtomsCount < allAtomsCount) {
            let tmpAtoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.viewSelectionAtoms);
            if(Object.keys(tmpAtoms).length > 0) {
                ic.dAtoms = me.hashUtilsCls.cloneHash(tmpAtoms);
            }

            ic.bShowHighlight = false;
            ic.opts['rotationcenter'] = 'highlight center';
        }

        // also alternating the surfaces
        ic.applyMapCls.removeSurfaces();
        ic.applyMapCls.applySurfaceOptions();

        ic.applyMapCls.removeMaps();
        ic.applyMapCls.applyMapOptions();

        ic.applyMapCls.removeEmmaps();
        ic.applyMapCls.applyEmmapOptions();

    // disallow the alternation of DelPhi map
        ic.applyMapCls.removePhimaps();
    //    ic.applyMapCls.applyPhimapOptions();
        // should recalculate the potential
        //ic.loadDelphiFileBase('delphi');

    //    ic.applyMapCls.removeSurfaces();
    //    ic.applyMapCls.applyphisurfaceOptions();
        // should recalculate the potential
        //ic.loadDelphiFileBase('delphi2');

        // alternate the PCA axes
        ic.axes = [];
        if(ic.pc1) {
           ic.axesCls.setPc1Axes();
        }

        //ic.glycanCls.showGlycans();

        ic.drawCls.draw();

        ic.bShowHighlight = true;
        ic.opts['rotationcenter'] = 'molecule center';
    }

    alternateWrapper() { let ic = this.icn3d, me = ic.icn3dui;
       ic.bAlternate = true;
       this.alternateStructures();
       ic.bAlternate = false;
    }

}

export {Alternate}
