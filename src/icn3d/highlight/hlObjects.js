/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class HlObjects {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the highlight for the selected atoms: hAtoms.
    addHlObjects(color, bRender, atomsHash) { let ic = this.icn3d, me = ic.icn3dui;
       if(color === undefined) color = ic.hColor;
       //if(atomsHash === undefined) atomsHash = ic.hAtoms;
       let atomsHashDisplay = (atomsHash) ? me.hashUtilsCls.intHash(atomsHash, ic.dAtoms) : me.hashUtilsCls.intHash(ic.hAtoms, ic.dAtoms);

       ic.applyDisplayCls.applyDisplayOptions(ic.opts, atomsHashDisplay, ic.bHighlight);

       if( (bRender) || (ic.bRender) ) {
           ic.drawCls.render();
       }
    };

    //Remove the highlight. The atom selection does not change.
    removeHlObjects() { let ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       for(let i in ic.prevHighlightObjects) {
           if(ic.mdl) ic.mdl.remove(ic.prevHighlightObjects[i]);
       }

       ic.prevHighlightObjects = [];

       // remove prevous highlight
       for(let i in ic.prevHighlightObjects_ghost) {
        if(ic.mdl) ic.mdl.remove(ic.prevHighlightObjects_ghost[i]);
       }

       ic.prevHighlightObjects_ghost = [];
    };

}

export {HlObjects}
