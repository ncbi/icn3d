/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.updateHlAll = function(commandnameArray, bSetMenu, bUnion, bForceHighlight) { var me = this, ic = me.icn3d; "use strict";
       // update the previously highlisghted atoms for switching between all and selection
       ic.prevHighlightAtoms = ic.cloneHash(ic.hAtoms);

       me.updateHlObjects(bForceHighlight);

       if(commandnameArray !== undefined) {
           me.updateHlSeqInChain(commandnameArray, bUnion);
       }
       else {
           me.updateHlSeq(undefined, undefined, bUnion);
       }

       me.updateHl2D();
       if(bSetMenu === undefined || bSetMenu) me.updateHlMenus(commandnameArray);

       //me.showAnnoSelectedChains();
};
