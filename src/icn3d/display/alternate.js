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
        let hAtomsCount = Object.keys(ic.hAtoms).length;
        let allAtomsCount = Object.keys(ic.atoms).length;

        ic.dAtoms = {};

        let moleculeArray = Object.keys(ic.structures);
        for(let i = 0, il = moleculeArray.length; i < il; ++i) {
            let structure = moleculeArray[i];
            if(i > ic.ALTERNATE_STRUCTURE || (ic.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
                for(let k in ic.structures[structure]) {
                    let chain = ic.structures[structure][k];
                    ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.chains[chain]);
                }

                ic.ALTERNATE_STRUCTURE = i;

                $("#" + ic.pre + "title").html(structure);

                break;
            }
        }

        if(hAtomsCount < allAtomsCount) {
            ic.dAtoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

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
