/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.saveStyle = function() { var me = this, ic = me.icn3d; "use strict";
   for(var i in ic.atoms) {
       var atom = ic.atoms[i];
       atom.styleSave = atom.style;
       if(atom.style2 !== undefined) atom.style2Save = atom.style2;
   }
};
iCn3DUI.prototype.applySavedStyle = function() { var me = this, ic = me.icn3d; "use strict";
   for(var i in ic.atoms) {
       var atom = ic.atoms[i];
       if(atom.styleSave !== undefined) {
           atom.style = atom.styleSave;
       }
       if(atom.style2Save !== undefined) {
           atom.style2 = atom.style2Save;
       }
   }
   ic.draw();
};
