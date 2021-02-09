iCn3DUI.prototype.applyCommandSymdBase = function (command) { var me = this, ic = me.icn3d; "use strict";
    me.retrieveSymd()
};

iCn3DUI.prototype.applyCommandSymd = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredSymd = $.Deferred(function() {
     me.applyCommandSymdBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSymd.promise();
};

iCn3DUI.prototype.retrieveSymd = function () { var me = this, ic = me.icn3d; "use strict";
   //var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";
   var url = "https://www.ncbi.nlm.nih.gov/Structure/symd/symd.cgi";

   var atomHash = ic.intHash(ic.dAtoms, ic.hAtoms);

   // just output C-alpha atoms
   // the number of residues matters
//   atomHash = ic.intHash(atomHash, ic.calphas);
   // just output proteins
   atomHash = ic.intHash(atomHash, ic.proteins);

   var atomCnt = Object.keys(atomHash).length;
//   var bCalphaOnly = ic.isCalphaPhosOnly(ic.hash2Atoms(atomHash));
//   if(bCalphaOnly) {
//       alert("The potential will not be shown because the side chains are missing in the structure...");
//       return;
//   }

   var residHash = {};
   for(var serial in atomHash) {
       var atom = ic.atoms[serial];
       var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
       residHash[resid] = 1;
   }

   // the cgi took too long for structures with more than 10000 atoms
   if(atomCnt > 10000) {
       alert("The maximum number of allowed atoms is 10,000. Please try it again with smaller sets...");
       return;
   }

   var pdbstr = '';
   pdbstr += me.getPDBHeader();
   pdbstr += me.getAtomPDB(atomHash);

   var dataObj = {'pdb': pdbstr, 'pdbid': Object.keys(ic.structures).toString()};

   $.ajax({
      url: url,
      type: 'POST',
      data : dataObj,
      dataType: "jsonp",
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
          var symmetryArray = data.rcsb_struct_symmetry;
          var rot, centerFrom, centerTo;

          var title = 'none';

          if(symmetryArray !== undefined) {
              if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                  rot = ic.rmsd_supr.rot;
                  centerFrom = ic.rmsd_supr.trans1;
                  centerTo = ic.rmsd_supr.trans2;
              }

              //ic.symdHash = {};
              if(ic.symdArray === undefined) ic.symdArray = [];
              var order;
              for(var i = 0, il = symmetryArray.length; i < il; ++i) {
                  if(symmetryArray[i].symbol == 'C1') continue;
                  title = symmetryArray[i].symbol + " ";
                  if(symmetryArray[i].kind == "Pseudo Symmetry") {
                      title = symmetryArray[i].symbol + ' (pseudo)';
                  }
                  else if(symmetryArray[i].kind == "Global Symmetry") {
                      title = symmetryArray[i].symbol + ' (global)';
                  }
                  else if(symmetryArray[i].kind == "Local Symmetry") {
                      title = symmetryArray[i].symbol + ' (local)';
                  }

                  var rotation_axes = symmetryArray[i].rotation_axes;
                  var axesArray = [];
                  for(var j = 0, jl = rotation_axes.length; j < jl; ++j) {
                      var tmpArray = [];
                      var start = new THREE.Vector3(rotation_axes[j].start[0], rotation_axes[j].start[1], rotation_axes[j].start[2]);
                      var end = new THREE.Vector3(rotation_axes[j].end[0], rotation_axes[j].end[1], rotation_axes[j].end[2]);

                      order = rotation_axes[j].order;

                      // apply matrix for each atom
                      //if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                      //    start = ic.transformMemPro(start, rot, centerFrom, centerTo);
                      //    end = ic.transformMemPro(end, rot, centerFrom, centerTo);
                      //}

                      tmpArray.push(start);
                      tmpArray.push(end);

                      // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                      var colorAxis = me.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                      var colorPolygon = me.getPolygonColor(symmetryArray[i].symbol);
                      tmpArray.push(colorAxis);
                      tmpArray.push(colorPolygon);

                      tmpArray.push(rotation_axes[j].order);

                      // selected chain
                      tmpArray.push('selection');

                      axesArray.push(tmpArray);
                  }
                  var symdHash = {};
                  symdHash[title] = axesArray;
                  ic.symdArray.push(symdHash);
              }

              if(ic.symdArray.length == 0) {
                  $("#" + me.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
                  me.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
              }
              else {
                  var ori_permSeq = data.seqalign.replace(/ /g, '').split(','); //oriSeq,permSeq
                  var nres = data.nres;
                  var shift = data.shift;
                  var rmsd = data.rmsd;

                  var oriResidArray = Object.keys(residHash);
                  var residArrayHash1 = {}, residArrayHash2 = {};
                  var residArray1 = [], residArray2 = [];
                  var index1 = 0, index2 = 0;
                  var chainCntHash = {};
                  for(var i = 0, il = ori_permSeq[0].length; i < il; ++i) {
                      var resn1 = ori_permSeq[0][i];
                      var resn2 = ori_permSeq[1][i];

                      if(resn1 != '-') {
                          if(resn1 == resn1.toUpperCase()) { // aligned
                             residArrayHash1[oriResidArray[index1]] = 1;

                             var idArray1 = me.getIdArray(oriResidArray[index1]);
                             residArray1.push(resn1 + ' $' + idArray1[0] + '.' + idArray1[1] + ':' + idArray1[2]);

                             var chainid = idArray1[0] + '_' + idArray1[1];
                             if(!chainCntHash.hasOwnProperty(chainid)) {
                                 chainCntHash[chainid] = [];
                             }

                             chainCntHash[chainid].push(residArray1.length - 1); // the position in the array
                          }
                          ++index1;
                      }

                      if(resn2 != '-') {
                          if(resn2 == resn2.toUpperCase()) { // aligned
                             var oriIndex = (index2 + shift + nres) % nres;
                             residArrayHash2[oriResidArray[oriIndex]] = 1;

                             var idArray2 = me.getIdArray(oriResidArray[oriIndex]);
                             residArray2.push(resn2 + ' $' + idArray2[0] + '.' + idArray2[1] + ':' + idArray2[2]);
                          }
                          ++index2;
                      }
                  }

                  var residArrayHashFinal1 = {}, residArrayHashFinal2 = {};
                  var residArrayFinal1 = [], residArrayFinal2 = [];

                  var bOnechain = false;
                  if(Object.keys(chainCntHash).length == 1) {
                      bOnechain = true;
                      var nResUnit = parseInt(residArray1.length / order + 0.5);
                      var residArrayFromHash1 = Object.keys(residArrayHash1), residArrayFromHash2 = Object.keys(residArrayHash2);
                      for(var i = 0; i < nResUnit; ++i) {
                        if(!residArrayHashFinal1.hasOwnProperty(residArrayFromHash2[i])) { // do not appear in both original and permuted
                          residArrayFinal1.push(residArray1[i]);
                          residArrayFinal2.push(residArray2[i]);
                          residArrayHashFinal1[residArrayFromHash1[i]] = 1;
                          residArrayHashFinal2[residArrayFromHash2[i]] = 1;
                        }
                      }
                  }
                  else {
                      var selChainid, selCnt = 0;
                      for(var chainid in chainCntHash) {
                          if(chainCntHash[chainid].length > selCnt) {
                              selCnt = chainCntHash[chainid].length;
                              selChainid = chainid;
                          }
                      }

                      var residArrayFromHash1 = Object.keys(residArrayHash1), residArrayFromHash2 = Object.keys(residArrayHash2);
                      for(var i = 0, il = chainCntHash[selChainid].length; i < il; ++i) {
                        var pos = chainCntHash[selChainid][i];
                        if(!residArrayHashFinal1.hasOwnProperty(residArrayFromHash2[pos])) { // do not appear in both original and permuted
                          residArrayFinal1.push(residArray1[pos]);
                          residArrayFinal2.push(residArray2[pos]);
                          residArrayHashFinal1[residArrayFromHash1[pos]] = 1;
                          residArrayHashFinal2[residArrayFromHash2[pos]] = 1;
                        }
                      }
                  }

                  var html = '<br>';
                  html += "The symmetry " + symmetryArray[0].symbol + " was calculated dynamically using the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>. The Z score " + data.zscore + " is greater than the threshold Z score 8. The RMSD is " + rmsd + " angstrom. <br><br>The following sequence alignment shows the residue mapping of the best aligned sets: \"symOri\" and \"symPerm\", which are also available in the menu \"Analysis > Defined Sets\".<br>";

                  $("#" + me.pre + "symd_info").html(html);

                  me.setSeqAlignForSymmetry(residArrayFinal1, residArrayFinal2, bOnechain);

                  var bShowHighlight = false;
                  var seqObj = me.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight, bOnechain);

                  $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                  $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

                  me.openDlg('dl_alignment', 'Select residues in aligned sequences from SymD');

                  var name = 'symOri';
                  me.selectResidueList(residArrayHashFinal1, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHashFinal1)) + ' | name ' + name, true);

                  name = 'symPerm';
                  me.selectResidueList(residArrayHashFinal2, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHashFinal2)) + ' | name ' + name, true);

                  name = 'symBoth';
                  var residArrayHashFinal1 = ic.unionHash(residArrayHashFinal1, residArrayHashFinal2);
                  me.selectResidueList(residArrayHashFinal1, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHashFinal1)) + ' | name ' + name, true);

                  //me.toggleHighlight();
              }
          }
          else {
              $("#" + me.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
              me.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
          }

           //var title = $("#" + me.pre + "selectSymd" ).val();
           ic.symdtitle = (title === 'none') ? undefined : title;
           ic.draw();

          if(me.deferredSymd !== undefined) me.deferredSymd.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        $("#" + me.pre + "dl_symd").html("<br>The web service can not determine the symmetry of the input set.");

        me.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');

        me.hideLoading();

        if(me.deferredSymd !== undefined) me.deferredSymd.resolve();
        return;
      }
   });
};

iCn3DUI.prototype.getResObj = function (resn_resid) { var me = this, ic = me.icn3d; "use strict";
    // K $1KQ2.A:2

    var resn = resn_resid.substr(0, resn_resid.indexOf(' '));
    var pos1 = resn_resid.indexOf('$');
    var pos2 = resn_resid.indexOf('.');
    var pos3 = resn_resid.indexOf(':');

    var structure = resn_resid.substr(pos1 + 1, pos2 - pos1 - 1);
    var chain = resn_resid.substr(pos2 + 1, pos3 - pos2 - 1);
    var resi = resn_resid.substr(pos3 + 1);
    var resid = structure + '_' + chain + '_' + resi;

    var resObject = {'resn': resn, 'resid': resid, 'resi': resi, 'aligned': true};

    return resObject;
}

iCn3DUI.prototype.setSeqAlignForSymmetry = function (residArray1, residArray2, bOnechain) { var me = this, ic = me.icn3d; "use strict";
      //loadSeqAlignment
      var alignedAtoms = {};
      //var structureArray = Object.keys(ic.structures);
      //var structure1 = structureArray[0];
      //var structure2 = structureArray[1];

      me.conservedName1 = 'symOri_cons'; //structure1 + '_cons';
      me.conservedName2 = 'symPerm_cons'; //structure2 + '_cons';

      me.consHash1 = {};
      me.consHash2 = {};

      ic.alnChainsAnTtl = {};
      ic.alnChainsAnno = {};

      ic.alnChainsSeq = {};
      ic.alnChains = {};

      ic.alnChainsSeq = {};

      var residuesHash = {};

      for(var i = 0, il = residArray1.length; i < il; ++i) { // K $1KQ2.A:2
          var resObject1 = me.getResObj(residArray1[i]);
          var resObject2 = me.getResObj(residArray2[i]);

          var chainid1 = resObject1.resid.substr(0, resObject1.resid.lastIndexOf('_'));
          var chainid2Ori = resObject2.resid.substr(0, resObject2.resid.lastIndexOf('_'));
          var chainid2 = chainid2Ori;
          // if one chain, separate it into two chains to show seq alignment
          if(bOnechain) {
              var stucture = chainid2Ori.substr(0, chainid2Ori.indexOf('_'));
              chainid2 = stucture + '2' + chainid2Ori.substr(chainid2Ori.indexOf('_'));
          }

          residuesHash[resObject1.resid] = 1;
          residuesHash[resObject2.resid] = 1;

          var color;
          if(resObject1.resn == resObject2.resn) {
              color = "#FF0000";
          }
          else {
              color = "#0000FF";
          }
          var color2 = '#' + me.getColorhexFromBlosum62(resObject1.resn, resObject2.resn);

          resObject1.color = color;
          resObject2.color = color;

          resObject1.color2 = color2;
          resObject2.color2 = color2;

          for(var j in ic.residues[resObject1.resid]) {
              ic.atoms[j].color = ic.thr(color);
              ic.atomPrevColors[j] = ic.thr(color);
          }
          for(var j in ic.residues[resObject2.resid]) {
              ic.atoms[j].color = ic.thr(color);
              ic.atomPrevColors[j] = ic.thr(color);
          }

          // annoation title for the master seq only
          if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];

          for(var j = 0; j < 3; ++j) {
              if(ic.alnChainsAnTtl[chainid1][j] === undefined ) ic.alnChainsAnTtl[chainid1][j] = [];
          }

          // two annotations without titles
          for(var j = 0; j < 3; ++j) {
              ic.alnChainsAnTtl[chainid1][j].push("");
          }

          if(ic.alnChainsSeq[chainid1] === undefined) ic.alnChainsSeq[chainid1] = [];
          if(ic.alnChainsSeq[chainid2] === undefined) ic.alnChainsSeq[chainid2] = [];

          ic.alnChainsSeq[chainid1].push(resObject1);
          ic.alnChainsSeq[chainid2].push(resObject2);

          if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {};
          if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {};
          $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + resObject1.resi] );
          $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resObject2.resi] );

          me.consHash1[chainid1 + '_' + resObject1.resi] = 1;
          me.consHash2[chainid2 + '_' + resObject2.resi] = 1;

          // annotation is for the master seq only
          if(ic.alnChainsAnno[chainid1] === undefined ) ic.alnChainsAnno[chainid1] = [];
          //if(ic.alnChainsAnno[chainid2] === undefined ) ic.alnChainsAnno[chainid2] = [];

          for(var j = 0; j < 3; ++j) {
              if(ic.alnChainsAnno[chainid1][j] === undefined ) ic.alnChainsAnno[chainid1][j] = [];
          }

          var symbol = '.';
          if(i % 5 === 0) symbol = '*';
          if(i % 10 === 0) symbol = '|';
          ic.alnChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

          var numberStr = '';
          if(i % 10 === 0) numberStr = i.toString();
          ic.alnChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest
      }

/*
        var commandname = 'symBoth_aligned'; //'protein_aligned';
        var commanddescr = 'symBoth aligned'; //'protein aligned';
        var select = "select " + me.residueids2spec(Object.keys(residuesHash));

        me.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
*/
};
