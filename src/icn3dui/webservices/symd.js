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
      dataType: "json",
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

              ic.symdHash = {};
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

                      // apply matrix for each atom
                      if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                          start = ic.transformMemPro(start, rot, centerFrom, centerTo);
                          end = ic.transformMemPro(end, rot, centerFrom, centerTo);
                      }

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
                  ic.symdHash[title] = axesArray;
              }

              if(Object.keys(ic.symdHash).length == 0) {
                  $("#" + me.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
                  me.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
              }
              else {
/*
                  var html = "<option value='none'>None</option>", index = 0;
                  for(var title in ic.symdHash) {
                      var selected = (index == 0) ? 'selected' : '';
                      html += "<option value=" + "'" + title + "' " + selected + ">" + title + "</option>";
                      ++index;
                  }

                  $("#" + me.pre + "selectSymd").html(html);
*/

                  var ori_permSeq = data.seqalign.replace(/ /g, '').split(','); //oriSeq,permSeq
                  var nres = data.nres;
                  var shift = data.shift;

                  var oriResidArray = Object.keys(residHash);
                  var residArrayHash1 = {}, residArrayHash2 = {};
                  var residArray1 = [], residArray2 = [];
                  var index1 = 0, index2 = 0;
                  for(var i = 0, il = ori_permSeq[0].length; i < il; ++i) {
                      var resn1 = ori_permSeq[0][i];
                      var resn2 = ori_permSeq[1][i];

                      if(resn1 != '-') {
                          if(resn1 == resn1.toUpperCase()) { // aligned
                             residArrayHash1[oriResidArray[index1]] = 1;

                             var idArray1 = me.getIdArray(oriResidArray[index1]);
                             residArray1.push(resn1 + ' $' + idArray1[0] + '.' + idArray1[1] + ':' + idArray1[2]);
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

                  var name = 'sym1';
                  me.selectResidueList(residArrayHash1, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHash1)) + ' | name ' + name, true);

                  name = 'sym2';
                  me.selectResidueList(residArrayHash2, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHash2)) + ' | name ' + name, true);

                  name = 'symBoth';
                  var residArrayHash1 = ic.unionHash(residArrayHash1, residArrayHash2);
                  me.selectResidueList(residArrayHash1, name, name);
                  me.updateSelectionNameDesc();
                  me.setLogCmd('select ' + me.residueids2spec(Object.keys(residArrayHash1)) + ' | name ' + name, true);

                  //me.toggleHighlight();

                  var html = '<br>';
                  html += "The symmetry " + symmetryArray[0].symbol + " was calculated dynamically using the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>. The Z score " + data.zscore + " is greater than the threshold Z score 8. The following table (" + residArray1.length + " rows) shows the residue mapping of the best aligned sets.<br><br>";

                  html += '<div style="height:150px; overflow:auto;"><table border="1" cellpadding="10" cellspacing="0">\n';
                  html += '<tr><th>Original</th><th>Permuted</th><th>Highlight in 3D</th></tr>\n';

                  for(var i = 0, il = residArray1.length; i < il; ++i) {
                      var resid1 = residArray1[i];
                      var resid2 = residArray2[i];

                      html += '<tr><td>';
                      //html += '<input type="checkbox" class="' + me.pre + 'seloneres" resid="' + resid1 + '"> ';
                      html += resid1 + '</td><td>';
                      //html += '<input type="checkbox" class="' + me.pre + 'seloneres" resid="' + resid2 + '"> ';
                      html += resid2 + '</td><td>';
                      html += '<button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button>';
                      html += '</td></tr>\n';
                  }
                  html += '</table></div><br>\n';

                  $("#" + me.pre + "dl_symd").html(html);
                  me.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
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

