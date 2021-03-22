/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectComplement = function() { var me = this, ic = me.icn3d; "use strict";
       var complement = {};
       for(var i in ic.atoms) {
           if(!ic.hAtoms.hasOwnProperty(i)) {
               complement[i] = 1;
           }
       }
       ic.hAtoms = ic.cloneHash(complement);
       //me.highlightResidues(Object.keys(residueHash), Object.keys(chainHash));
       me.updateHlAll();
};
