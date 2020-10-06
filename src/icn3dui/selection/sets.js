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

iCn3DUI.prototype.setProtNuclLigInMenu = function () { var me = this, ic = me.icn3d; "use strict";
    // Initially, add proteins, nucleotides, chemicals, ions, water into the menu "custom selections"
    if(Object.keys(ic.proteins).length > 0) {
      //ic.defNames2Atoms['proteins'] = Object.keys(ic.proteins);
      ic.defNames2Residues['proteins'] = Object.keys(ic.getResiduesFromAtoms(ic.proteins));
      ic.defNames2Descr['proteins'] = 'proteins';
      ic.defNames2Command['proteins'] = 'select :proteins';
    }

    if(Object.keys(ic.nucleotides).length > 0) {
      //ic.defNames2Atoms['nucleotides'] = Object.keys(ic.nucleotides);
      ic.defNames2Residues['nucleotides'] = Object.keys(ic.getResiduesFromAtoms(ic.nucleotides));
      ic.defNames2Descr['nucleotides'] = 'nucleotides';
      ic.defNames2Command['nucleotides'] = 'select :nucleotides';
    }

    if(Object.keys(ic.chemicals).length > 0) {
      //ic.defNames2Atoms['chemicals'] = Object.keys(ic.chemicals);
      if(ic.bOpm) {
          var chemicalResHash = {}, memResHash = {};
          for(var serial in ic.chemicals) {
              var atom = ic.atoms[serial];
              var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
              if(atom.resn === 'DUM') {
                  memResHash[residueid] = 1;
              }
              else {
                  chemicalResHash[residueid] = 1;
              }
          }

          if(Object.keys(chemicalResHash).length > 0) {
              ic.defNames2Residues['chemicals'] = Object.keys(chemicalResHash);
              ic.defNames2Descr['chemicals'] = 'chemicals';
              ic.defNames2Command['chemicals'] = 'select :chemicals';
          }

          if(Object.keys(memResHash).length > 0) {
              ic.defNames2Residues['membrane'] = Object.keys(memResHash);
              ic.defNames2Descr['membrane'] = 'membrane';
              ic.defNames2Command['membrane'] = 'select :membrane';
          }
      }
      else {
          ic.defNames2Residues['chemicals'] = Object.keys(ic.getResiduesFromAtoms(ic.chemicals));
          ic.defNames2Descr['chemicals'] = 'chemicals';
          ic.defNames2Command['chemicals'] = 'select :chemicals';
      }
    }

    if(Object.keys(ic.ions).length > 0) {
      //ic.defNames2Atoms['ions'] = Object.keys(ic.ions);
      ic.defNames2Residues['ions'] = Object.keys(ic.getResiduesFromAtoms(ic.ions));
      ic.defNames2Descr['ions'] = 'ions';
      ic.defNames2Command['ions'] = 'select :ions';
    }

    if(Object.keys(ic.water).length > 0) {
      //ic.defNames2Atoms['water'] = Object.keys(ic.water);
      ic.defNames2Residues['water'] = Object.keys(ic.getResiduesFromAtoms(ic.water));
      ic.defNames2Descr['water'] = 'water';
      ic.defNames2Command['water'] = 'select :water';
    }

    me.setTransmemInMenu(ic.halfBilayerSize, -ic.halfBilayerSize);
};

iCn3DUI.prototype.setTransmemInMenu = function (posZ, negZ, bReset) { var me = this, ic = me.icn3d; "use strict";
    // set transmembrane, extracellular, intracellular
    if(ic.bOpm) {
      var transmembraneHash = {}, extracellularHash = {}, intracellularHash = {};
      for(var serial in ic.atoms) {
          var atom = ic.atoms[serial];
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

      var extraStr = (bReset) ? '2' : '';

      if(Object.keys(transmembraneHash).length > 0) {
          ic.defNames2Residues['transmembrane' + extraStr] = Object.keys(transmembraneHash);
          ic.defNames2Descr['transmembrane' + extraStr] = 'transmembrane' + extraStr;
          ic.defNames2Command['transmembrane' + extraStr] = 'select :transmembrane' + extraStr;
      }

      if(Object.keys(extracellularHash).length > 0) {
          ic.defNames2Residues['extracellular' + extraStr] = Object.keys(extracellularHash);
          ic.defNames2Descr['extracellular' + extraStr] = 'extracellular' + extraStr;
          ic.defNames2Command['extracellular' + extraStr] = 'select :extracellular' + extraStr;
      }

      if(Object.keys(intracellularHash).length > 0) {
          ic.defNames2Residues['intracellular' + extraStr] = Object.keys(intracellularHash);
          ic.defNames2Descr['intracellular' + extraStr] = 'intracellular' + extraStr;
          ic.defNames2Command['intracellular' + extraStr] = 'select :intracellular' + extraStr;
      }
    }
};

iCn3DUI.prototype.setChainsInMenu = function () { var me = this, ic = me.icn3d; "use strict";
    for(var chainid in ic.chains) {
        // skip chains with one residue/chemical
        if(ic.chainsSeq[chainid].length > 1) {
          //ic.defNames2Atoms[chainid] = Object.keys(ic.chains[chainid]);
          ic.defNames2Residues[chainid] = Object.keys(ic.getResiduesFromAtoms(ic.chains[chainid]));
          ic.defNames2Descr[chainid] = chainid;

          var pos = chainid.indexOf('_');
          var structure = chainid.substr(0, pos);
          var chain = chainid.substr(pos + 1);

          ic.defNames2Command[chainid] = 'select $' + structure + '.' + chain;
        }
    }

    // select whole structure
    if(Object.keys(ic.structures) == 1) {
      var structure = Object.keys(ic.structures)[0];

      ic.defNames2Residues[structure] = Object.keys(ic.residues);
      ic.defNames2Descr[structure] = structure;

      ic.defNames2Command[structure] = 'select $' + structure;
    }
    else {
        var resArray = Object.keys(ic.residues);
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
          ic.defNames2Residues[structure] = structResHash[structure];
          ic.defNames2Descr[structure] = structure;

          ic.defNames2Command[structure] = 'select $' + structure;
        }
    }
};
