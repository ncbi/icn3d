/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showSets = function() { var me = this;
    me.openDialog(me.pre + 'dl_definedsets', 'Select Sets');
    $("#" + me.pre + "atomsCustom").resizable();

    me.updateHlMenus();
};

iCn3DUI.prototype.clickCustomAtoms = function() { var me = this;
    $("#" + me.pre + "atomsCustom").change(function(e) {
       var nameArray = $(this).val();

       if(nameArray !== null) {
         // log the selection
         //me.setLogCmd('select saved atoms ' + nameArray.toString(), true);

         var bUpdateHlMenus = false;
         me.changeCustomAtoms(nameArray, bUpdateHlMenus);
         me.setLogCmd('select saved atoms ' + nameArray.toString(), true);

         me.bSelectResidue = false;
       }
    });

    $("#" + me.pre + "atomsCustom").focus(function(e) {
       if(me.isMobile()) $("#" + me.pre + "atomsCustom").val("");
    });
};

iCn3DUI.prototype.changeCustomAtoms = function (nameArray, bUpdateHlMenus) { var me = this;
   me.icn3d.hAtoms = {};

   //var allResidues = {};
   for(var i = 0; i < nameArray.length; ++i) {
     var selectedSet = nameArray[i];

     if((me.icn3d.defNames2Atoms === undefined || !me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) && (me.icn3d.defNames2Residues === undefined || !me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

     //var residueHash = {};
     if(me.icn3d.defNames2Atoms !== undefined && me.icn3d.defNames2Atoms.hasOwnProperty(selectedSet)) {
         var atomArray = me.icn3d.defNames2Atoms[selectedSet];

         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             //var atom = me.icn3d.atoms[atomArray[j]];
             //var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
             //residueHash[residueid] = 1;
             me.icn3d.hAtoms[atomArray[j]] = 1;
         }
     }

     if(me.icn3d.defNames2Residues !== undefined && me.icn3d.defNames2Residues.hasOwnProperty(selectedSet)) {
         var residueArrayTmp = me.icn3d.defNames2Residues[selectedSet];

         for(var j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
             //residueHash[residueArrayTmp[j]] = 1;
             me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[residueArrayTmp[j]]);
         }
     }

     //var residueArray = Object.keys(residueHash);

     //if(residueArray === undefined) continue;

     //for(var j = 0, jl = residueArray.length; j < jl; ++j) {
     //  allResidues[residueArray[j]] = 1;
     //}
   } // outer for

   //me.removeSeqChainBkgd();

   //me.highlightResidues(Object.keys(allResidues));
   me.updateHlAll(nameArray, bUpdateHlMenus);

   // show selected chains in annotation window
   me.showAnnoSelectedChains();

   // clear commmand
   $("#" + me.pre + "command").val("");
   $("#" + me.pre + "command_name").val("");
   $("#" + me.pre + "command_desc").val("");

   // update the commands in the dialog
   for(var i = 0, il = nameArray.length; i < il; ++i) {
       var atomArray = me.icn3d.defNames2Atoms[nameArray[i]];
       var residueArray = me.icn3d.defNames2Residues[nameArray[i]];
       var atomTitle = me.icn3d.defNames2Descr[nameArray[i]];
       var atomCommand = me.icn3d.defNames2Command[nameArray[i]];

       if(atomCommand === undefined) continue;

       if(atomCommand.indexOf('select ') !== -1) atomCommand = atomCommand.replace(/select /g, '');

       if(i === 0) {
         $("#" + me.pre + "command").val(atomCommand);
         $("#" + me.pre + "command_name").val(nameArray[i]);
         $("#" + me.pre + "command_desc").val(atomTitle);
       }
       else {
         var prevValue = $("#" + me.pre + "command").val();
         $("#" + me.pre + "command").val(prevValue + " or " + atomCommand);

         var prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + " or " + nameArray[i]);

         var prevValue = $("#" + me.pre + "command_desc").val();
         $("#" + me.pre + "command_desc").val(prevValue + " or " + atomTitle);
       }

       if(atomArray !== undefined) {
           for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             me.icn3d.hAtoms[atomArray[j]] = 1;
           }
       }
       else if(residueArray !== undefined) {
           for(var j = 0, jl = residueArray.length; j < jl; ++j) {
             me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[residueArray[j]]);
           }
       }
   } // outer for
};


iCn3DUI.prototype.setProtNuclLigInMenu = function () { var me = this;
    for(var chain in me.icn3d.chains) {
          // Initially, add proteins, nucleotides, chemicals, ions, water into the mn "custom selections"
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
              me.icn3d.defNames2Residues['chemicals'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.chemicals));
              me.icn3d.defNames2Descr['chemicals'] = 'chemicals';
              me.icn3d.defNames2Command['chemicals'] = 'select :chemicals';
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
    }
};

iCn3DUI.prototype.setChainsInMenu = function () { var me = this;
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
};
