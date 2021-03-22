/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.exportCustomAtoms = function () { var me = this, ic = me.icn3d; "use strict";
   var html = "";
   var nameArray = (ic.defNames2Residues !== undefined) ? Object.keys(ic.defNames2Residues).sort() : [];
   for(var i = 0, il = nameArray.length; i < il; ++i) {
     var name = nameArray[i];
     var residueArray = ic.defNames2Residues[name];
     var description = ic.defNames2Descr[name];
     var command = ic.defNames2Command[name];
     command = command.replace(/,/g, ', ');
     html += name + "\tselect ";
     html += me.residueids2spec(residueArray);
     html += "\n";
   } // outer for
   nameArray = (ic.defNames2Atoms !== undefined) ? Object.keys(ic.defNames2Atoms).sort() : [];
   for(var i = 0, il = nameArray.length; i < il; ++i) {
     var name = nameArray[i];
     var atomArray = ic.defNames2Atoms[name];
     var description = ic.defNames2Descr[name];
     var command = ic.defNames2Command[name];
     command = command.replace(/,/g, ', ');
     var residueArray = me.atoms2residues(atomArray);
     if(residueArray.length > 0) {
         html += name + "\tselect ";
         html += me.residueids2spec(residueArray);
         html += "\n";
     }
   } // outer for
   return html;
};
