/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {SaveFile} from '../export/saveFile.js';
import {ParserUtils} from '../parsers/parserUtils.js';
import {Selection} from '../selection/selection.js';
import {Draw} from '../display/draw.js';

class Symd {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyCommandSymdBase(command) { var ic = this.icn3d, me = ic.icn3dui;
        this.retrieveSymd()
    }

    applyCommandSymd(command) { var ic = this.icn3d, me = ic.icn3dui;
      var thisClass = this;
      // chain functions together
      ic.deferredSymd = $.Deferred(function() {
         thisClass.applyCommandSymdBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredSymd.promise();
    }

    retrieveSymd() { var ic = this.icn3d, me = ic.icn3dui;
       var thisClass = this;

       //var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";
       var url = "https://www.ncbi.nlm.nih.gov/Structure/symd/symd.cgi";

       var atomHash = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

       // just output C-alpha atoms
       // the number of residues matters
    //   atomHash = me.hashUtilsCls.intHash(atomHash, ic.calphas);
       // just output proteins
       atomHash = me.hashUtilsCls.intHash(atomHash, ic.proteins);

       var atomCnt = Object.keys(atomHash).length;

       var residHash = {}
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
       pdbstr += ic.saveFileCls.getPDBHeader();
       pdbstr += ic.saveFileCls.getAtomPDB(atomHash);

       var dataObj = {'pdb': pdbstr, 'pdbid': Object.keys(ic.structures).toString()}

       $.ajax({
          url: url,
          type: 'POST',
          data : dataObj,
          dataType: "jsonp",
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
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

                  //ic.symdHash = {}
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
                          //    start = ic.surfaceCls.transformMemPro(start, rot, centerFrom, centerTo);
                          //    end = ic.surfaceCls.transformMemPro(end, rot, centerFrom, centerTo);
                          //}

                          tmpArray.push(start);
                          tmpArray.push(end);

                          // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                          var colorAxis = thisClass.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                          var colorPolygon = thisClass.getPolygonColor(symmetryArray[i].symbol);
                          tmpArray.push(colorAxis);
                          tmpArray.push(colorPolygon);

                          tmpArray.push(rotation_axes[j].order);

                          // selected chain
                          tmpArray.push('selection');

                          axesArray.push(tmpArray);
                      }
                      var symdHash = {}
                      symdHash[title] = axesArray;
                      ic.symdArray.push(symdHash);
                  }

                  if(ic.symdArray.length == 0) {
                      $("#" + ic.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
                      ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
                  }
                  else {
                      var ori_permSeq = data.seqalign.replace(/ /g, '').split(','); //oriSeq,permSeq
                      var nres = data.nres;
                      var shift = data.shift;
                      var rmsd = data.rmsd;

                      var oriResidArray = Object.keys(residHash);
                      var residArrayHash1 = {}, residArrayHash2 = {}
                      var residArray1 = [], residArray2 = [];
                      var index1 = 0, index2 = 0;
                      var chainCntHash = {}
                      for(var i = 0, il = ori_permSeq[0].length; i < il; ++i) {
                          var resn1 = ori_permSeq[0][i];
                          var resn2 = ori_permSeq[1][i];

                          if(resn1 != '-') {
                              if(resn1 == resn1.toUpperCase()) { // aligned
                                 residArrayHash1[oriResidArray[index1]] = 1;

                                 var idArray1 = me.utilsCls.getIdArray(oriResidArray[index1]);
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
                                 var oriIndex =(index2 + shift + nres) % nres;
                                 residArrayHash2[oriResidArray[oriIndex]] = 1;

                                 var idArray2 = me.utilsCls.getIdArray(oriResidArray[oriIndex]);
                                 residArray2.push(resn2 + ' $' + idArray2[0] + '.' + idArray2[1] + ':' + idArray2[2]);
                              }
                              ++index2;
                          }
                      }

                      var residArrayHashFinal1 = {}, residArrayHashFinal2 = {}
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

                      $("#" + ic.pre + "symd_info").html(html);

                      thisClass.setSeqAlignForSymmetry(residArrayFinal1, residArrayFinal2, bOnechain);

                      var bShowHighlight = false;
                      var seqObj = ic.icn3dui.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight, bOnechain);

                      var html = $("#" + ic.pre + "dl_sequence2").html() + seqObj.sequencesHtml;

                      $("#" + ic.pre + "dl_sequence2").html(html);
                      $("#" + ic.pre + "dl_sequence2").width(ic.icn3dui.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

                      ic.icn3dui.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences from SymD');

                      var numDef = Object.keys(ic.defNames2Residues).length + Object.keys(ic.defNames2Atoms).length;

                      var name = 'symOri' + numDef;
                      ic.selectionCls.selectResidueList(residArrayHashFinal1, name, name);
                      ic.selectionCls.updateSelectionNameDesc();
                      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residArrayHashFinal1)) + ' | name ' + name, false);

                      name = 'symPerm' + numDef;
                      ic.selectionCls.selectResidueList(residArrayHashFinal2, name, name);
                      ic.selectionCls.updateSelectionNameDesc();
                      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residArrayHashFinal2)) + ' | name ' + name, false);

                      name = 'symBoth' + numDef;
                      var residArrayHashFinal1 = me.hashUtilsCls.unionHash(residArrayHashFinal1, residArrayHashFinal2);
                      ic.selectionCls.selectResidueList(residArrayHashFinal1, name, name);
                      ic.selectionCls.updateSelectionNameDesc();
                      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residArrayHashFinal1)) + ' | name ' + name, false);

                      //ic.hlUpdateCls.toggleHighlight();
                  }
              }
              else {
                  $("#" + ic.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
                  ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
              }

               //var title = $("#" + ic.pre + "selectSymd" ).val();
               ic.symdtitle =(title === 'none') ? undefined : title;
               ic.drawCls.draw();

              if(ic.deferredSymd !== undefined) ic.deferredSymd.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            $("#" + ic.pre + "dl_symd").html("<br>The web service can not determine the symmetry of the input set.");

            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');

            ic.ParserUtilsCls.hideLoading();

            if(ic.deferredSymd !== undefined) ic.deferredSymd.resolve();
            return;
          }
       });
    }

    getResObj(resn_resid) { var ic = this.icn3d, me = ic.icn3dui;
        // K $1KQ2.A:2

        var resn = resn_resid.substr(0, resn_resid.indexOf(' '));
        var pos1 = resn_resid.indexOf('$');
        var pos2 = resn_resid.indexOf('.');
        var pos3 = resn_resid.indexOf(':');

        var structure = resn_resid.substr(pos1 + 1, pos2 - pos1 - 1);
        var chain = resn_resid.substr(pos2 + 1, pos3 - pos2 - 1);
        var resi = resn_resid.substr(pos3 + 1);
        var resid = structure + '_' + chain + '_' + resi;

        var resObject = {'resn': resn, 'resid': resid, 'resi': resi, 'aligned': true}

        return resObject;
    }

    setSeqAlignForSymmetry(residArray1, residArray2, bOnechain) { var ic = this.icn3d, me = ic.icn3dui;
          //loadSeqAlignment
          var alignedAtoms = {}
          //var structureArray = Object.keys(ic.structures);
          //var structure1 = structureArray[0];
          //var structure2 = structureArray[1];

          ic.conservedName1 = 'symOri_cons'; //structure1 + '_cons';
          ic.conservedName2 = 'symPerm_cons'; //structure2 + '_cons';

          ic.consHash1 = {}
          ic.consHash2 = {}

          ic.alnChainsAnTtl = {}
          ic.alnChainsAnno = {}

          ic.alnChainsSeq = {}
          ic.alnChains = {}

          ic.alnChainsSeq = {}

          var residuesHash = {}

          for(var i = 0, il = residArray1.length; i < il; ++i) { // K $1KQ2.A:2
              var resObject1 = this.getResObj(residArray1[i]);
              var resObject2 = this.getResObj(residArray2[i]);

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
              var color2 = '#' + ic.showAnnoCls.getColorhexFromBlosum62(resObject1.resn, resObject2.resn);

              resObject1.color = color;
              resObject2.color = color;

              resObject1.color2 = color2;
              resObject2.color2 = color2;

              for(var j in ic.residues[resObject1.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
                  ic.atomPrevColors[j] = me.parasCls.thr(color);
              }
              for(var j in ic.residues[resObject2.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
                  ic.atomPrevColors[j] = me.parasCls.thr(color);
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

              if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {}
              if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {}
              $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + resObject1.resi] );
              $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resObject2.resi] );

              ic.consHash1[chainid1 + '_' + resObject1.resi] = 1;
              ic.consHash2[chainid2 + '_' + resObject2.resi] = 1;

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
            var select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));

            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
    */
    }

    retrieveSymmetry(pdbid) { var ic = this.icn3d, me = ic.icn3dui;
       var thisClass =this;

       var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";

       $.ajax({
          url: url,
          dataType: "json",
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              var symmetryArray = data.rcsb_struct_symmetry;
              var rot, centerFrom, centerTo;

              if(symmetryArray !== undefined) {
                  if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                      rot = ic.rmsd_supr.rot;
                      centerFrom = ic.rmsd_supr.trans1;
                      centerTo = ic.rmsd_supr.trans2;
                  }

                  ic.symmetryHash = {}
                  for(var i = 0, il = symmetryArray.length; i < il; ++i) {
                      if(symmetryArray[i].symbol == 'C1') continue;
                      var title = 'no title';
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
                              start = ic.surfaceCls.transformMemPro(start, rot, centerFrom, centerTo);
                              end = ic.surfaceCls.transformMemPro(end, rot, centerFrom, centerTo);
                          }

                          tmpArray.push(start);
                          tmpArray.push(end);

                          // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                          var colorAxis = thisClass.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                          var colorPolygon = thisClass.getPolygonColor(symmetryArray[i].symbol);
                          tmpArray.push(colorAxis);
                          tmpArray.push(colorPolygon);

                          tmpArray.push(rotation_axes[j].order);

                          // selected chain
                          tmpArray.push(symmetryArray[i].clusters[0].members[0].asym_id);

                          axesArray.push(tmpArray);
                      }

                      ic.symmetryHash[title] = axesArray;
                  }

                  if(Object.keys(ic.symmetryHash).length == 0) {
                      $("#" + ic.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
                  }
                  else {
                      var html = "<option value='none'>None</option>", index = 0;
                      for(var title in ic.symmetryHash) {
                          var selected =(index == 0) ? 'selected' : '';
                          html += "<option value=" + "'" + title + "' " + selected + ">" + title + "</option>";
                          ++index;
                      }

                      $("#" + ic.pre + "selectSymmetry").html(html);
                  }
              }
              else {
                  $("#" + ic.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
              }

              ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symmetry', 'Symmetry');

              if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            $("#" + ic.pre + "dl_symmetry").html("<br>This structure has no symmetry.");

            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symmetry', 'Symmetry');

            if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
            return;
          }
       });
    }

    getPolygonColor(symbol) { var ic = this.icn3d, me = ic.icn3dui;
        var type = symbol.substr(0, 1);

        //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
        if(type == 'C') { // Cyclic Cn
            return me.parasCls.thr(0xFF8C00); // dark orange
        }
        else if(type == 'D') { // Dihedral Dn
            return me.parasCls.thr(0x00FFFF); // cyan
        }
        else if(type == 'T') { // Tetrahedral T
            return me.parasCls.thr(0xEE82EE); //0x800080); // purple
        }
        else if(type == 'O') { // Octahedral O
            return me.parasCls.thr(0xFFA500); // orange
        }
        else if(type == 'I') { // Icosahedral I
            return me.parasCls.thr(0x00FF00); // green
        }
        else { // Helical H, etc
            return me.parasCls.thr(0xA9A9A9); // dark grey
        }
    }

    getAxisColor(symbol, order) { var ic = this.icn3d, me = ic.icn3dui;
        var type = symbol.substr(0, 1);

        //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
        if(type == 'C') { // Cyclic Cn
            return me.parasCls.thr(0xFF0000); // red
        }
        else if(type == 'D') { // Dihedral Dn
            if(order == 2) {
                return me.parasCls.thr(0x00FFFF); // cyan
            }
            else {
                return me.parasCls.thr(0xFF0000); // red
            }
        }
        else if(type == 'T') { // Tetrahedral T
            if(order == 2) {
                return me.parasCls.thr(0x00FFFF); // cyan
            }
            else {
                return me.parasCls.thr(0x00FF00); // green
            }
        }
        else if(type == 'O') { // Octahedral O
            if(order == 2) {
                return me.parasCls.thr(0x00FFFF); // cyan
            }
            else if(order == 3) {
                return me.parasCls.thr(0x00FF00); // green
            }
            else {
                return me.parasCls.thr(0xFF0000); // red
            }
        }
        else if(type == 'I') { // Icosahedral I
            if(order == 2) {
                return me.parasCls.thr(0x00FFFF); // cyan
            }
            else if(order == 3) {
                return me.parasCls.thr(0x00FF00); // green
            }
            else {
                return me.parasCls.thr(0xFF0000); // red
            }
        }
        else { // Helical H, etc
            return me.parasCls.thr(0xFF0000); // red
        }
    }
}

export {Symd}
