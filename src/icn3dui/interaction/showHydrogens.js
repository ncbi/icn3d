/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showHydrogens = function() { var me = this, ic = me.icn3d; "use strict";
   // get hydrogen atoms for currently selected atoms
   for(var i in ic.hAtoms) {
       var atom = ic.atoms[i];
       if(atom.name !== 'H') {
           ic.atoms[atom.serial].bonds = ic.atoms[atom.serial].bonds2.concat();
           ic.atoms[atom.serial].bondOrder = ic.atoms[atom.serial].bondOrder2.concat();
           for(var j = 0, jl = ic.atoms[atom.serial].bonds.length; j < jl; ++j) {
               var serial = ic.atoms[atom.serial].bonds[j];
               if(ic.atoms[serial].name === 'H') {
                   ic.dAtoms[serial] = 1;
                   ic.hAtoms[serial] = 1;
               }
           }
       }
   }
};
iCn3DUI.prototype.hideHydrogens = function() { var me = this, ic = me.icn3d; "use strict";
   // remove hydrogen atoms for currently selected atoms
   for(var i in ic.hAtoms) {
       var atom = ic.atoms[i];
       if(atom.name === 'H') {
           if(ic.atoms[atom.serial].bonds.length > 0) {
               var otherSerial = ic.atoms[atom.serial].bonds[0];
               //ic.atoms[atom.serial].bonds = [];
               var pos = ic.atoms[otherSerial].bonds.indexOf(atom.serial);
               if(pos !== -1) {
                   ic.atoms[otherSerial].bonds.splice(pos, 1);
                   ic.atoms[otherSerial].bondOrder.splice(pos, 1);
               }
           }
           delete ic.dAtoms[atom.serial];
           delete ic.hAtoms[atom.serial];
       }
   }
};

iCn3DUI.prototype.hideHbondsContacts = function() { var me = this, ic = me.icn3d; "use strict";
       var select = "set hbonds off";
       me.setLogCmd(select, true);
       ic.hideHbonds();
       //ic.draw();
       select = "set salt bridge off";
       me.setLogCmd(select, true);
       ic.hideSaltbridge();
       select = "set contact off";
       me.setLogCmd(select, true);
       ic.hideContact();
       select = "set halogen pi off";
       me.setLogCmd(select, true);
       ic.hideHalogenPi();
};

