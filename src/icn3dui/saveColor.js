/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.saveColor = function() { var me = this, ic = me.icn3d; "use strict";
   for(var i in ic.atoms) {
       var atom = ic.atoms[i];
       atom.colorSave = atom.color.clone();
   }
};
iCn3DUI.prototype.applySavedColor = function() { var me = this, ic = me.icn3d; "use strict";
   for(var i in ic.atoms) {
       var atom = ic.atoms[i];
       if(atom.colorSave !== undefined) {
           atom.color = atom.colorSave.clone();
       }
   }
   ic.draw();
   me.changeSeqColor(Object.keys(ic.residues));
};
