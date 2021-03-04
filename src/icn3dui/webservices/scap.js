iCn3DUI.prototype.applyCommandScapBase = function (command) { var me = this, ic = me.icn3d; "use strict";
    var snp = command.substr(command.lastIndexOf(' ') + 1);

    if(command.indexOf('scap 3d') == 0) {
        me.retrieveScap(snp);
    }
    else if(command.indexOf('scap interaction') == 0) {
        me.retrieveScap(snp, true);
    }
    else if(command.indexOf('scap pdb') == 0) {
        me.retrieveScap(snp, undefined, true);
    }
};

iCn3DUI.prototype.applyCommandScap = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredScap = $.Deferred(function() {
     me.applyCommandScapBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredScap.promise();
};

iCn3DUI.prototype.adjust2DWidth = function (id) { var me = this, ic = me.icn3d; "use strict";
    var halfWidth = 125;
    var id = me.pre + id;

    var height = ($("#" + me.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? $("#" + me.pre + 'dl_selectannotations').dialog( "option", "height") : me.HEIGHT;
    var width = ($("#" + me.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? halfWidth * 2 : me.WIDTH * 0.5;

    $("#" + id).dialog( "option", "width", width );
    $("#" + id).dialog( "option", "height", height);
    var position = { my: "left-" + halfWidth + " top+" + me.MENU_HEIGHT, at: "right top", of: "#" + me.pre + "viewer", collision: "none" };

     $("#" + id).dialog( "option", "position", position );
};

iCn3DUI.prototype.retrieveScap = function (snp, bInteraction, bPdb) { var me = this, ic = me.icn3d; "use strict";
/*
    //snp: 6M0J_E_501_Y
    var idArray = snp.split('_'); //stru_chain_resi_snp

    var snpStr = idArray[1] + ',' + idArray[2] + ',' + idArray[3];

    // find neighboring residues
    var resid = idArray[0] + '_' + idArray[1] + '_' + idArray[2];

    var select = '$' + idArray[0] + '.' + idArray[1] + ':' + idArray[2];
    var bGetPairs = false;
    var radius = 10; //4;
    var result = me.pickCustomSphere_base(radius, ic.hash2Atoms(ic.residues[resid]), ic.atoms, false, false, undefined, select, bGetPairs);
*/

    //snp: 6M0J_E_484_K,6M0J_E_501_Y,6M0J_E_417_N
    var snpStr = '';
    var snpArray = snp.split(','); //stru_chain_resi_snp
    var atomHash = {}, residArray = [];
    for(var i = 0, il = snpArray.length; i < il; ++i) {
        var idArray = snpArray[i].split('_'); //stru_chain_resi_snp

        var resid = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
        atomHash = ic.unionHash(atomHash, ic.residues[resid]);
        residArray.push(resid);

        snpStr += idArray[1] + '_' + idArray[2] + '_' + idArray[3];
        if(i != il -1) snpStr += ',';
    }

    var selectSpec = me.residueids2spec(residArray);
    var select = "select " + selectSpec;

    var bGetPairs = false;
    var radius = 10; //4;
    // find neighboring residues
    var result = me.pickCustomSphere_base(radius, atomHash, ic.atoms, false, false, undefined, select, bGetPairs);


    residArray = Object.keys(result.residues);
    ic.hAtoms = {};
    for(var index = 0, indexl = residArray.length; index < indexl; ++index) {
      var residueid = residArray[index];
      for(var i in ic.residues[residueid]) {
        ic.hAtoms[i] = 1;
      }
    }

//    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);
    ic.hAtoms = ic.unionHash(ic.hAtoms, atomHash);
    ic.hAtoms = ic.exclHash(ic.hAtoms, ic.chemicals);

    // the displayed atoms are for each SNP only
    //var atomHash = ic.intHash(ic.dAtoms, ic.hAtoms);

    var pdbStr = me.getPDBHeader() + me.getAtomPDB(ic.hAtoms);

    var url = "https://www.ncbi.nlm.nih.gov/Structure/scap/scap.cgi";

    var pdbid = Object.keys(ic.structures)[0]; //Object.keys(ic.structures).toString();
    var dataObj = {'pdb': pdbStr, 'snp': snpStr, 'pdbid': pdbid, 'v': '2'};

    $.ajax({
      url: url,
      type: 'POST',
      data : dataObj,
      dataType: "text",
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      beforeSend: function() {
          me.showLoading();
      },
      complete: function() {
          //me.hideLoading();
      },
      success: function(data) {
          var pos = data.indexOf('\n');
          var energy = data.substr(0, pos);
          var pdbData = data.substr(pos + 1);
console.log("free energy: " + energy + " kcal/mol");

          var bAddition = true;
          var hAtom1 = ic.cloneHash(ic.hAtoms);

          ic.hAtoms = {};
          ic.loadPDB(pdbData, pdbid, false, false, bAddition);
          var hAtom2 = ic.cloneHash(ic.hAtoms);

          ic.hAtoms = ic.unionHash(ic.hAtoms, hAtom1);
          ic.dAtoms = ic.hAtoms;

          ic.zoominSelection();
          me.setStyle('proteins', 'stick');

          ic.opts['color'] = 'chain';
          ic.setColorByOptions(ic.opts, ic.dAtoms);

          for(var serial in hAtom2) {
              var atom = ic.atoms[serial];
              if(!atom.het) {
                  //ic.atoms[serial].color = ic.thr(0xA52A2A); // brown
                  //ic.atomPrevColors[serial] = ic.thr(0xA52A2A); // brown
                  // use the same color as the wild type
                  var resid = atom.structure.substr(0, 4) + '_' + atom.chain + '_' + atom.resi;
                  var atomWT = ic.getFirstAtomObj(ic.residues[resid]);
                  ic.atoms[serial].color = atomWT.color;
                  ic.atomPrevColors[serial] = atomWT.color;
              }
          }

          if(bPdb) {
             var pdbStr = '';
             pdbStr += me.getPDBHeader();
             //pdbStr += me.getAtomPDB(ic.hAtoms, undefined, true);
             pdbStr += me.getAtomPDB(ic.hAtoms);

             var file_pref = (me.inputid) ? me.inputid : "custom";
             me.saveFile(file_pref + '_' + snpStr + '.pdb', 'text', [pdbStr]);

             ic.draw();
          }
          else {
              //var select = '.' + idArray[1] + ':' + idArray[2];
              //var name = 'snp_' + idArray[1] + '_' + idArray[2];
              var select = selectSpec;

              var name = 'snp_' + snpStr;
              me.selectByCommand(select, name, name);
              ic.opts['color'] = 'atom';
              ic.setColorByOptions(ic.opts, ic.hAtoms);

              me.clearInteractions();

              if(bInteraction) {
                //me.setLogCmd("select " + select + " | name " + name, true);

                var type = 'linegraph';
                me.viewInteractionPairs(['selected'], ['non-selected'], false, type, true, true, true, true, true, true);
                //me.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);

                me.adjust2DWidth('dl_linegraph');
              }

              ic.hAtoms = ic.dAtoms;
              //me.setLogCmd("select displayed set", true);

              ic.draw();

              if(!ic.alertAlt) {
                ic.alertAlt = true;

                if(ic.bRender) alert('Please press the letter "a" to alternate between wild type and mutant.');
              }
          }

          if(me.deferredScap !== undefined) me.deferredScap.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
        //try again
        $.ajax(this);
        return;
        }
        alert("There are some problems in predicting the side chain of the mutant...");

        me.hideLoading();

        if(me.deferredScap !== undefined) me.deferredScap.resolve();
        return;
      }
    });
};
