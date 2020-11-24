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

iCn3DUI.prototype.retrieveScap = function (snp, bInteraction, bPdb) { var me = this, ic = me.icn3d; "use strict";
    var idArray = snp.split('_'); //stru_chain_resi_snp

    var snpStr = idArray[1] + ',' + idArray[2] + ',' + idArray[3];

    // find neighboring residues
    var resid = idArray[0] + '_' + idArray[1] + '_' + idArray[2];

    var select = '$' + idArray[0] + '.' + idArray[1] + ':' + idArray[2];
    var bGetPairs = false;
    var radius = 10; //4;
    var result = me.pickCustomSphere_base(radius, ic.hash2Atoms(ic.residues[resid]), ic.atoms, false, false, undefined, select, bGetPairs);
    var residueArray = Object.keys(result.residues);
    ic.hAtoms = {};
    for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
      var residueid = residueArray[index];
      for(var i in ic.residues[residueid]) {
        ic.hAtoms[i] = 1;
      }
    }

    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);

    // the displayed atoms are for each SNP only
    //var atomHash = ic.intHash(ic.dAtoms, ic.hAtoms);

    var pdbStr = me.getPDBHeader() + me.getAtomPDB(ic.hAtoms);

    var url = "https://www.ncbi.nlm.nih.gov/Structure/scap/scap.cgi";

    var pdbid = Object.keys(ic.structures)[0]; //Object.keys(ic.structures).toString();
    var dataObj = {'pdb': pdbStr, 'snp': snpStr, 'pdbid': pdbid};

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
              if(!ic.atoms[serial].het) {
                  ic.atoms[serial].color = ic.thr(0xA52A2A); // brown
                  ic.atomPrevColors[serial] = ic.thr(0xA52A2A); // brown
              }
          }

          if(bPdb) {
             var pdbStr = '';
             pdbStr += me.getPDBHeader();
             pdbStr += me.getAtomPDB(ic.hAtoms, undefined, true);

             var file_pref = (me.inputid) ? me.inputid : "custom";
             me.saveFile(file_pref + '_' + snpStr + '.pdb', 'text', [pdbStr]);

             ic.draw();
          }
          else {
              var select = '.' + idArray[1] + ':' + idArray[2];
              var name = 'snp_' + idArray[1] + '_' + idArray[2];
              me.selectBySpec(select, name, name);
              ic.opts['color'] = 'atom';
              ic.setColorByOptions(ic.opts, ic.hAtoms);

              me.clearInteractions();

              if(bInteraction) {
                var halfWidth = 125;
                me.setLogCmd("select " + select + " | name " + name, true);

                var type = 'linegraph';
                me.viewInteractionPairs(['selected'], ['non-selected'], false, type, true, true, true, true, true, true);
                me.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);

                var id = me.pre + 'dl_linegraph';
                var height = $("#" + me.pre + 'dl_selectannotations').dialog( "option", "height");
                $("#" + id).dialog( "option", "width", halfWidth * 2 );
                $("#" + id).dialog( "option", "height", height);
                var position = { my: "left-" + halfWidth + " top+" + me.MENU_HEIGHT, at: "right top", of: "#" + me.pre + "viewer", collision: "none" };
                $("#" + id).dialog( "option", "position", position );
              }

              ic.hAtoms = ic.dAtoms;
              me.setLogCmd("select displayed set", true);

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
