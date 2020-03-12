/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showSets = function() { var me = this; //"use strict";
    me.openDialog(me.pre + 'dl_definedsets', 'Select sets');
    $("#" + me.pre + "dl_setsmenu").show();
    $("#" + me.pre + "dl_setoperations").show();

    $("#" + me.pre + "dl_command").hide();

    $("#" + me.pre + "atomsCustom").resizable();

    var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);
    var prevDAtoms = me.icn3d.cloneHash(me.icn3d.dAtoms);

    if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
       me.setPredefinedInMenu();

       me.bSetChainsAdvancedMenu = true;
    }

    me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
    me.icn3d.dAtoms = me.icn3d.cloneHash(prevDAtoms);

    me.updateHlMenus();
};

iCn3DUI.prototype.clickCustomAtoms = function() { var me = this; //"use strict";
    $("#" + me.pre + "atomsCustom").change(function(e) {
       var nameArray = $(this).val();

       if(nameArray !== null) {
         // log the selection
         //me.setLogCmd('select saved atoms ' + nameArray.toString(), true);

         var bUpdateHlMenus = false;
         me.changeCustomAtoms(nameArray, bUpdateHlMenus);
         me.setLogCmd('select saved atoms ' + nameArray.join(' ' + me.setOperation + ' '), true);

         me.bSelectResidue = false;
       }
    });

    $("#" + me.pre + "atomsCustom").focus(function(e) {
       if(me.isMobile()) $("#" + me.pre + "atomsCustom").val("");
    });
};

iCn3DUI.prototype.deleteSelectedSets = function() { var me = this; //"use strict";
   var nameArray = $("#" + me.pre + "atomsCustom").val();

   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((me.icn3d.defNames2Atoms === undefined || !me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) && (me.icn3d.defNames2Residues === undefined || !me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(me.icn3d.defNames2Atoms !== undefined && me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) {
         delete me.icn3d.defNames2Atoms[selectedSet];
     }

     if(me.icn3d.defNames2Residues !== undefined && me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) {
         delete me.icn3d.defNames2Residues[selectedSet];
     }
   } // outer for

   me.updateHlMenus();
};

iCn3DUI.prototype.changeCustomAtoms = function (nameArray, bUpdateHlMenus) { var me = this; //"use strict";
   me.icn3d.hAtoms = {};

/*
   var nameArray = [];
   $.each(inNameArray, function(i, el){
       if($.inArray(el, nameArray) === -1) nameArray.push(el);
   });
*/

   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((me.icn3d.defNames2Atoms === undefined || !me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) && (me.icn3d.defNames2Residues === undefined || !me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(me.icn3d.defNames2Atoms !== undefined && me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) {
         var atomArray = me.icn3d.defNames2Atoms[selectedSet];

         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             me.icn3d.hAtoms[atomArray[j]] = 1;
         }
     }

     if(me.icn3d.defNames2Residues !== undefined && me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) {
         var residueArrayTmp = me.icn3d.defNames2Residues[selectedSet];

         var atomHash = {};
         for(var j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
             atomHash = me.icn3d.unionHash(atomHash, me.icn3d.residues[residueArrayTmp[j]]);
         }

         me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, atomHash);
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
       var atomArray = me.icn3d.defNames2Atoms[nameArray[i]];
       var residueArray = me.icn3d.defNames2Residues[nameArray[i]];
       var atomTitle = me.icn3d.defNames2Descr[nameArray[i]];

       if(i === 0) {
         //$("#" + me.pre + "command").val(atomCommand);
         $("#" + me.pre + "command").val('saved atoms ' + nameArray[i]);
         $("#" + me.pre + "command_name").val(nameArray[i]);
       }
       else {
         var prevValue = $("#" + me.pre + "command").val();
         $("#" + me.pre + "command").val(prevValue + ' ' + me.setOperation + ' ' + nameArray[i]);

         var prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + ' ' + me.setOperation + ' ' + nameArray[i]);
       }
   } // outer for
};

iCn3DUI.prototype.setHAtomsFromSets = function (nameArray, type) { var me = this; //"use strict";
   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((me.icn3d.defNames2Atoms === undefined || !me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) && (me.icn3d.defNames2Residues === undefined || !me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     if(me.icn3d.defNames2Atoms !== undefined && me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) {
         var atomArray = me.icn3d.defNames2Atoms[selectedSet];

         if(type === 'or') {
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 me.icn3d.hAtoms[atomArray[j]] = 1;
             }
         }
         else if(type === 'and') {
             var atomHash = {};
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 atomHash[atomArray[j]] = 1;
             }

             me.icn3d.hAtoms = me.icn3d.intHash(me.icn3d.hAtoms, atomHash);
         }
         else if(type === 'not') {
             for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                 me.icn3d.hAtoms[atomArray[j]] = undefined;
             }
         }
     }

     if(me.icn3d.defNames2Residues !== undefined && me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) {
         var residueArrayTmp = me.icn3d.defNames2Residues[selectedSet];

         var atomHash = {};
         for(var j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
             atomHash = me.icn3d.unionHash(atomHash, me.icn3d.residues[residueArrayTmp[j]]);
         }

         if(type === 'or') {
             me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, atomHash);
         }
         else if(type === 'and') {
             me.icn3d.hAtoms = me.icn3d.intHash(me.icn3d.hAtoms, atomHash);
         }
         else if(type === 'not') {
             me.icn3d.hAtoms = me.icn3d.exclHash(me.icn3d.hAtoms, atomHash);
         }
     }
   } // outer for
};

iCn3DUI.prototype.updateAdvancedCommands = function (nameArray, type) { var me = this; //"use strict";
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

         var prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + separator + nameArray[i]);
       }
   } // outer for
};

iCn3DUI.prototype.combineSets = function (orArray, andArray, notArray, commandname) { var me = this; //"use strict";
   me.icn3d.hAtoms = {};
   me.setHAtomsFromSets(orArray, 'or');

   if(Object.keys(me.icn3d.hAtoms).length == 0) me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.atoms);
   me.setHAtomsFromSets(andArray, 'and');

   me.setHAtomsFromSets(notArray, 'not');

   me.updateHlAll();

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
       me.addCustomSelection(Object.keys(me.icn3d.hAtoms), commandname, commandname, select, false);
   }
};

iCn3DUI.prototype.setProtNuclLigInMenu = function () { var me = this; //"use strict";
    // Initially, add proteins, nucleotides, chemicals, ions, water into the menu "custom selections"
    if(Object.keys(me.icn3d.proteins).length > 0) {
      //me.icn3d.defNames2Atoms['proteins'] = Object.keys(me.icn3d.proteins);
      me.icn3d.defNames2Residues['proteins'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.proteins));
      me.icn3d.defNames2Descr['proteins'] = 'proteins';
      me.icn3d.defNames2Command['proteins'] = 'select :proteins';
    }

    if(Object.keys(me.icn3d.nucleotides).length > 0) {
      //me.icn3d.defNames2Atoms['nucleotides'] = Object.keys(me.icn3d.nucleotides);
      me.icn3d.defNames2Residues['nucleotides'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.nucleotides));
      me.icn3d.defNames2Descr['nucleotides'] = 'nucleotides';
      me.icn3d.defNames2Command['nucleotides'] = 'select :nucleotides';
    }

    if(Object.keys(me.icn3d.chemicals).length > 0) {
      //me.icn3d.defNames2Atoms['chemicals'] = Object.keys(me.icn3d.chemicals);
      if(me.icn3d.bOpm) {
          var chemicalResHash = {}, memResHash = {};
          for(var serial in me.icn3d.chemicals) {
              var atom = me.icn3d.atoms[serial];
              var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
              if(atom.resn === 'DUM') {
                  memResHash[residueid] = 1;
              }
              else {
                  chemicalResHash[residueid] = 1;
              }
          }

          if(Object.keys(chemicalResHash).length > 0) {
              me.icn3d.defNames2Residues['chemicals'] = Object.keys(chemicalResHash);
              me.icn3d.defNames2Descr['chemicals'] = 'chemicals';
              me.icn3d.defNames2Command['chemicals'] = 'select :chemicals';
          }

          if(Object.keys(memResHash).length > 0) {
              me.icn3d.defNames2Residues['membrane'] = Object.keys(memResHash);
              me.icn3d.defNames2Descr['membrane'] = 'membrane';
              me.icn3d.defNames2Command['membrane'] = 'select :membrane';
          }
      }
      else {
          me.icn3d.defNames2Residues['chemicals'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.chemicals));
          me.icn3d.defNames2Descr['chemicals'] = 'chemicals';
          me.icn3d.defNames2Command['chemicals'] = 'select :chemicals';
      }
    }

    if(Object.keys(me.icn3d.ions).length > 0) {
      //me.icn3d.defNames2Atoms['ions'] = Object.keys(me.icn3d.ions);
      me.icn3d.defNames2Residues['ions'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.ions));
      me.icn3d.defNames2Descr['ions'] = 'ions';
      me.icn3d.defNames2Command['ions'] = 'select :ions';
    }

    if(Object.keys(me.icn3d.water).length > 0) {
      //me.icn3d.defNames2Atoms['water'] = Object.keys(me.icn3d.water);
      me.icn3d.defNames2Residues['water'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.water));
      me.icn3d.defNames2Descr['water'] = 'water';
      me.icn3d.defNames2Command['water'] = 'select :water';
    }

    me.setTransmemInMenu(me.icn3d.halfBilayerSize, -me.icn3d.halfBilayerSize);
};

iCn3DUI.prototype.setTransmemInMenu = function (posZ, negZ, bReset) { var me = this; //"use strict";
    // set transmembrane, extracellular, intracellular
    if(me.icn3d.bOpm) {
      var transmembraneHash = {}, extracellularHash = {}, intracellularHash = {};
      for(var serial in me.icn3d.atoms) {
          var atom = me.icn3d.atoms[serial];
          var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
          if(atom.coord.z > posZ) {
              extracellularHash[residueid] = 1;
          }
          else if(atom.coord.z < negZ) {
              intracellularHash[residueid] = 1;
          }
          else if(atom.resn !== 'DUM') {
              transmembraneHash[residueid] = 1;
          }
      }

      var extraStr = (bReset !== undefined && bReset) ? '2' : '';

      if(Object.keys(transmembraneHash).length > 0) {
          me.icn3d.defNames2Residues['transmembrane' + extraStr] = Object.keys(transmembraneHash);
          me.icn3d.defNames2Descr['transmembrane' + extraStr] = 'transmembrane' + extraStr;
          me.icn3d.defNames2Command['transmembrane' + extraStr] = 'select :transmembrane' + extraStr;
      }

      if(Object.keys(extracellularHash).length > 0) {
          me.icn3d.defNames2Residues['extracellular' + extraStr] = Object.keys(extracellularHash);
          me.icn3d.defNames2Descr['extracellular' + extraStr] = 'extracellular' + extraStr;
          me.icn3d.defNames2Command['extracellular' + extraStr] = 'select :extracellular' + extraStr;
      }

      if(Object.keys(intracellularHash).length > 0) {
          me.icn3d.defNames2Residues['intracellular' + extraStr] = Object.keys(intracellularHash);
          me.icn3d.defNames2Descr['intracellular' + extraStr] = 'intracellular' + extraStr;
          me.icn3d.defNames2Command['intracellular' + extraStr] = 'select :intracellular' + extraStr;
      }
    }
};

iCn3DUI.prototype.setChainsInMenu = function () { var me = this; //"use strict";
    for(var chainid in me.icn3d.chains) {
        // skip chains with one residue/chemical
        if(me.icn3d.chainsSeq[chainid].length > 1) {
          //me.icn3d.defNames2Atoms[chainid] = Object.keys(me.icn3d.chains[chainid]);
          me.icn3d.defNames2Residues[chainid] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.chains[chainid]));
          me.icn3d.defNames2Descr[chainid] = chainid;

          var pos = chainid.indexOf('_');
          var structure = chainid.substr(0, pos);
          var chain = chainid.substr(pos + 1);

          me.icn3d.defNames2Command[chainid] = 'select $' + structure + '.' + chain;
        }
    }

    // select whole structure
    if(Object.keys(me.icn3d.structures) == 1) {
      var structure = Object.keys(me.icn3d.structures)[0];

      me.icn3d.defNames2Residues[structure] = Object.keys(me.icn3d.residues);
      me.icn3d.defNames2Descr[structure] = structure;

      me.icn3d.defNames2Command[structure] = 'select $' + structure;
    }
    else {
        var resArray = Object.keys(me.icn3d.residues);
        var structResHash = {};
        for(var i = 0, il = resArray.length; i < il; ++i) {
            var resid = resArray[i];
            var pos = resid.indexOf('_');
            var structure = resid.substr(0, pos);
            if(structResHash[structure] === undefined) {
                structResHash[structure] = [];
            }
            structResHash[structure].push(resid);
        }

        for(var structure in structResHash) {
          me.icn3d.defNames2Residues[structure] = structResHash[structure];
          me.icn3d.defNames2Descr[structure] = structure;

          me.icn3d.defNames2Command[structure] = 'select $' + structure;
        }
    }
};
