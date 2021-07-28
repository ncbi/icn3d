/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {ApplyDisplay} from '../display/applyDisplay.js';
import {Draw} from '../display/draw.js';

class HlObjects {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the highlight for the selected atoms: hAtoms.
    addHlObjects(color, bRender, atomsHash) { let ic = this.icn3d, me = ic.icn3dui;
       if(color === undefined) color = ic.hColor;
       if(atomsHash === undefined) atomsHash = ic.hAtoms;

       ic.applyDisplayCls.applyDisplayOptions(ic.opts, me.hashUtilsCls.intHash(atomsHash, ic.dAtoms), ic.bHighlight);

       if( (bRender) || (ic.bRender) ) ic.drawCls.render();
    };

    //Remove the highlight. The atom selection does not change.
    removeHlObjects() { let ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       for(let i in ic.prevHighlightObjects) {
           ic.mdl.remove(ic.prevHighlightObjects[i]);
       }

       ic.prevHighlightObjects = [];

       // remove prevous highlight
       for(let i in ic.prevHighlightObjects_ghost) {
           ic.mdl.remove(ic.prevHighlightObjects_ghost[i]);
       }

       ic.prevHighlightObjects_ghost = [];
    };

}

export {HlObjects}
