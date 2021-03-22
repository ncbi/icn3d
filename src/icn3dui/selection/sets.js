/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showSets = function() { var me = this, ic = me.icn3d; "use strict";
    me.openDlg('dl_definedsets', 'Select sets');
    $("#" + me.pre + "dl_setsmenu").show();
    $("#" + me.pre + "dl_setoperations").show();

    $("#" + me.pre + "dl_command").hide();

    $("#" + me.pre + "atomsCustom").resizable();

    var prevHAtoms = ic.cloneHash(ic.hAtoms);
    var prevDAtoms = ic.cloneHash(ic.dAtoms);

    if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
       me.setPredefinedInMenu();

       me.bSetChainsAdvancedMenu = true;
    }

    ic.hAtoms = ic.cloneHash(prevHAtoms);
    ic.dAtoms = ic.cloneHash(prevDAtoms);

    me.updateHlMenus();
};

iCn3DUI.prototype.clickCustomAtoms = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "atomsCustom").change(function(e) { var ic = me.icn3d;
       var nameArray = $(this).val();

       if(nameArray !== null) {
         // log the selection
         //me.setLogCmd('select saved atoms ' + nameArray.toString(), true);

         var bUpdateHlMenus = false;
         me.changeCustomAtoms(nameArray, bUpdateHlMenus);
         //me.setLogCmd('select saved atoms ' + nameArray.join(' ' + me.setOperation + ' '), true);
         me.setLogCmd('select sets ' + nameArray.join(' ' + me.setOperation + ' '), true);

         me.bSelectResidue = false;
       }
    });

    $("#" + me.pre + "atomsCustom").focus(function(e) { var ic = me.icn3d;
       if(me.isMobile()) $("#" + me.pre + "atomsCustom").val("");
    });
};

iCn3DUI.prototype.deleteSelectedSets = function() { var me = this, ic = me.icn3d; "use strict";
   var nameArray = $("#" + me.pre + "atomsCustom").val();

   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {
         delete ic.defNames2Atoms[selectedSet];
     }

     if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
         delete ic.defNames2Residues[selectedSet];
     }
   } // outer for

   me.updateHlMenus();
};

iCn3DUI.prototype.changeCustomAtoms = function (nameArray, bUpdateHlMenus) { var me = this, ic = me.icn3d; "use strict";
   ic.hAtoms = {};

   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {
         var atomArray = ic.defNames2Atoms[selectedSet];

         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             ic.hAtoms[atomArray[j]] = 1;
         }
     }

     if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
         var residueArrayTmp = ic.defNames2Residues[selectedSet];

         var atomHash = {};
         for(var j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
             atomHash = ic.unionHash(atomHash, ic.residues[residueArrayTmp[j]]);
         }

         ic.hAtoms = ic.unionHash(ic.hAtoms, atomHash);
     }
   } // outer for

   me.updateHlAll(nameArray, bUpdateHlMenus);

   // show selected chains in annotation window
   me.showAnnoSelectedChains();

   // clear commmand
   $("#" + me.pre + "command").val("");
   $("#" + me.pre + "command_name").val("");
   //$("#" + me.pre + "command_desc").val("");

   // update the commands in the dialog
   for(var i = 0, il = nameArray.length; i < il; ++i) {
       var atomArray = ic.defNames2Atoms[nameArray[i]];
       var residueArray = ic.defNames2Residues[nameArray[i]];
       var atomTitle = ic.defNames2Descr[nameArray[i]];

       if(i === 0) {
         //$("#" + me.pre + "command").val(atomCommand);
         $("#" + me.pre + "command").val('saved atoms ' + nameArray[i]);
         $("#" + me.pre + "command_name").val(nameArray[i]);
       }
       else {
         var prevValue = $("#" + me.pre + "command").val();
         $("#" + me.pre + "command").val(prevValue + ' ' + me.setOperation + ' ' + nameArray[i]);

         prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + ' ' + me.setOperation + ' ' + nameArray[i]);
       }
   } // outer for
};

iCn3DUI.prototype.setHAtomsFromSets = function (nameArray, type) { var me = this, ic = me.icn3d; "use strict";
   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {

         var atomArray = ic.defNames2Atoms[selectedSet];

         if(type === 'or') {
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 ic.hAtoms[atomArray[j]] = 1;
             }
         }
         else if(type === 'and') {
             var atomHash = {};
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 atomHash[atomArray[j]] = 1;
             }

             ic.hAtoms = ic.intHash(ic.hAtoms, atomHash);
         }
         else if(type === 'not') {
             //for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             //    ic.hAtoms[atomArray[j]] = undefined;
             //}

             var atomHash = {};
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 atomHash[atomArray[j]] = 1;
             }

             ic.hAtoms = ic.exclHash(ic.hAtoms, atomHash);
         }
     }

     if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
         var residueArrayTmp = ic.defNames2Residues[selectedSet];

         var atomHash = {};
         for(var j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
             atomHash = ic.unionHash(atomHash, ic.residues[residueArrayTmp[j]]);
         }

         if(type === 'or') {
             ic.hAtoms = ic.unionHash(ic.hAtoms, atomHash);
         }
         else if(type === 'and') {
             ic.hAtoms = ic.intHash(ic.hAtoms, atomHash);
         }
         else if(type === 'not') {
             ic.hAtoms = ic.exclHash(ic.hAtoms, atomHash);
         }
     }
   } // outer for
};

iCn3DUI.prototype.updateAdvancedCommands = function (nameArray, type) { var me = this, ic = me.icn3d; "use strict";
   // update the commands in the dialog
   var separator = ' ' + type + ' ';
   for(var i = 0, il = nameArray.length; i < il; ++i) {
       if(i === 0 && type == 'or') {
         $("#" + me.pre + "command").val('saved atoms ' + nameArray[i]);
         $("#" + me.pre + "command_name").val(nameArray[i]);
       }
       else {
         var prevValue = $("#" + me.pre + "command").val();
         $("#" + me.pre + "command").val(prevValue + separator + nameArray[i]);

         prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + separator + nameArray[i]);
       }
   } // outer for
};

iCn3DUI.prototype.combineSets = function (orArray, andArray, notArray, commandname) { var me = this, ic = me.icn3d; "use strict";
   ic.hAtoms = {};
   me.setHAtomsFromSets(orArray, 'or');

   if(Object.keys(ic.hAtoms).length == 0) ic.hAtoms = ic.cloneHash(ic.atoms);
   me.setHAtomsFromSets(andArray, 'and');

   me.setHAtomsFromSets(notArray, 'not');

   // expensive to update, avoid it when loading script
   //me.updateHlAll();
   if(!ic.bInitial) me.updateHlAll();

   // show selected chains in annotation window
   me.showAnnoSelectedChains();

   // clear commmand
   $("#" + me.pre + "command").val("");
   $("#" + me.pre + "command_name").val("");

   me.updateAdvancedCommands(orArray, 'or');
   me.updateAdvancedCommands(andArray, 'and');
   me.updateAdvancedCommands(notArray, 'not');

   if(commandname !== undefined) {
       var select = "select " + $("#" + me.pre + "command").val();

       $("#" + me.pre + "command_name").val(commandname);
       me.addCustomSelection(Object.keys(ic.hAtoms), commandname, commandname, select, false);
   }
};
