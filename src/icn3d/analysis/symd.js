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

    applyCommandSymdBase(command) { let ic = this.icn3d, me = ic.icn3dui;
        this.retrieveSymd()
    }

    applyCommandSymd(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;
      // chain functions together
      ic.deferredSymd = $.Deferred(function() {
         thisClass.applyCommandSymdBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredSymd.promise();
    }

    retrieveSymd() { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       //var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";
       let url = "https://www.ncbi.nlm.nih.gov/Structure/symd/symd.cgi";

       let atomHash = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

       // just output C-alpha atoms
       // the number of residues matters
    //   atomHash = me.hashUtilsCls.intHash(atomHash, ic.calphas);
       // just output proteins
       atomHash = me.hashUtilsCls.intHash(atomHash, ic.proteins);

       let atomCnt = Object.keys(atomHash).length;

       let residHash = {}
       for(let serial in atomHash) {
           let atom = ic.atoms[serial];
           let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           residHash[resid] = 1;
       }

       // the cgi took too long for structures with more than 10000 atoms
       if(atomCnt > 10000) {
           alert("The maximum number of allowed atoms is 10,000. Please try it again with smaller sets...");
           return;
       }

       let pdbstr = '';
       pdbstr += ic.saveFileCls.getPDBHeader();
       pdbstr += ic.saveFileCls.getAtomPDB(atomHash);

       let dataObj = {'pdb': pdbstr, 'pdbid': Object.keys(ic.structures).toString()}

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
              let symmetryArray = data.rcsb_struct_symmetry;
              let rot, centerFrom, centerTo;

              let title = 'none';

              if(symmetryArray !== undefined) {
                  if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                      rot = ic.rmsd_supr.rot;
                      centerFrom = ic.rmsd_supr.trans1;
                      centerTo = ic.rmsd_supr.trans2;
                  }

                  //ic.symdHash = {}
                  if(ic.symdArray === undefined) ic.symdArray = [];
                  let order;
                  for(let i = 0, il = symmetryArray.length; i < il; ++i) {
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

                      let rotation_axes = symmetryArray[i].rotation_axes;
                      let axesArray = [];
                      for(let j = 0, jl = rotation_axes.length; j < jl; ++j) {
                          let tmpArray = [];
                          let start = new THREE.Vector3(rotation_axes[j].start[0], rotation_axes[j].start[1], rotation_axes[j].start[2]);
                          let end = new THREE.Vector3(rotation_axes[j].end[0], rotation_axes[j].end[1], rotation_axes[j].end[2]);

                          order = rotation_axes[j].order;

                          // apply matrix for each atom
                          //if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                          //    start = ic.surfaceCls.transformMemPro(start, rot, centerFrom, centerTo);
                          //    end = ic.surfaceCls.transformMemPro(end, rot, centerFrom, centerTo);
                          //}

                          tmpArray.push(start);
                          tmpArray.push(end);

                          // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                          let colorAxis = thisClass.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                          let colorPolygon = thisClass.getPolygonColor(symmetryArray[i].symbol);
                          tmpArray.push(colorAxis);
                          tmpArray.push(colorPolygon);

                          tmpArray.push(rotation_axes[j].order);

                          // selected chain
                          tmpArray.push('selection');

                          axesArray.push(tmpArray);
                      }
                      let symdHash = {}
                      symdHash[title] = axesArray;
                      ic.symdArray.push(symdHash);
                  }

                  if(ic.symdArray.length == 0) {
                      $("#" + ic.pre + "dl_symd").html("<br>The selected residues have no detected symmetry with a Z score of " + data.zscore + " from the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>.");
                      ic.icn3dui.htmlCls.dialogCls.openDlg('dl_symd', 'Dynamically Calculated Symmetry Using SymD');
                  }
                  else {
                      let ori_permSeq = data.seqalign.replace(/ /g, '').split(','); //oriSeq,permSeq
                      let nres = data.nres;
                      let shift = data.shift;
                      let rmsd = data.rmsd;

                      let oriResidArray = Object.keys(residHash);
                      let residArrayHash1 = {}, residArrayHash2 = {}
                      let residArray1 = [], residArray2 = [];
                      let index1 = 0, index2 = 0;
                      let chainCntHash = {}
                      for(let i = 0, il = ori_permSeq[0].length; i < il; ++i) {
                          let resn1 = ori_permSeq[0][i];
                          let resn2 = ori_permSeq[1][i];

                          if(resn1 != '-') {
                              if(resn1 == resn1.toUpperCase()) { // aligned
                                 residArrayHash1[oriResidArray[index1]] = 1;

                                 let idArray1 = me.utilsCls.getIdArray(oriResidArray[index1]);
                                 residArray1.push(resn1 + ' $' + idArray1[0] + '.' + idArray1[1] + ':' + idArray1[2]);

                                 let chainid = idArray1[0] + '_' + idArray1[1];
                                 if(!chainCntHash.hasOwnProperty(chainid)) {
                                     chainCntHash[chainid] = [];
                                 }

                                 chainCntHash[chainid].push(residArray1.length - 1); // the position in the array
                              }
                              ++index1;
                          }

                          if(resn2 != '-') {
                              if(resn2 == resn2.toUpperCase()) { // aligned
                                 let oriIndex =(index2 + shift + nres) % nres;
                                 residArrayHash2[oriResidArray[oriIndex]] = 1;

                                 let idArray2 = me.utilsCls.getIdArray(oriResidArray[oriIndex]);
                                 residArray2.push(resn2 + ' $' + idArray2[0] + '.' + idArray2[1] + ':' + idArray2[2]);
                              }
                              ++index2;
                          }
                      }

                      let residArrayHashFinal1 = {}, residArrayHashFinal2 = {}
                      let residArrayFinal1 = [], residArrayFinal2 = [];

                      let bOnechain = false;
                      if(Object.keys(chainCntHash).length == 1) {
                          bOnechain = true;
                          let nResUnit = parseInt(residArray1.length / order + 0.5);
                          let residArrayFromHash1 = Object.keys(residArrayHash1), residArrayFromHash2 = Object.keys(residArrayHash2);
                          for(let i = 0; i < nResUnit; ++i) {
                            if(!residArrayHashFinal1.hasOwnProperty(residArrayFromHash2[i])) { // do not appear in both original and permuted
                              residArrayFinal1.push(residArray1[i]);
                              residArrayFinal2.push(residArray2[i]);
                              residArrayHashFinal1[residArrayFromHash1[i]] = 1;
                              residArrayHashFinal2[residArrayFromHash2[i]] = 1;
                            }
                          }
                      }
                      else {
                          let selChainid, selCnt = 0;
                          for(let chainid in chainCntHash) {
                              if(chainCntHash[chainid].length > selCnt) {
                                  selCnt = chainCntHash[chainid].length;
                                  selChainid = chainid;
                              }
                          }

                          let residArrayFromHash1 = Object.keys(residArrayHash1), residArrayFromHash2 = Object.keys(residArrayHash2);
                          for(let i = 0, il = chainCntHash[selChainid].length; i < il; ++i) {
                            let pos = chainCntHash[selChainid][i];
                            if(!residArrayHashFinal1.hasOwnProperty(residArrayFromHash2[pos])) { // do not appear in both original and permuted
                              residArrayFinal1.push(residArray1[pos]);
                              residArrayFinal2.push(residArray2[pos]);
                              residArrayHashFinal1[residArrayFromHash1[pos]] = 1;
                              residArrayHashFinal2[residArrayFromHash2[pos]] = 1;
                            }
                          }
                      }

                      let html = '<br>';
                      html += "The symmetry " + symmetryArray[0].symbol + " was calculated dynamically using the program <a href='https://symd.nci.nih.gov/' target='_blank'>SymD</a>. The Z score " + data.zscore + " is greater than the threshold Z score 8. The RMSD is " + rmsd + " angstrom. <br><br>The following sequence alignment shows the residue mapping of the best aligned sets: \"symOri\" and \"symPerm\", which are also available in the menu \"Analysis > Defined Sets\".<br>";

                      $("#" + ic.pre + "symd_info").html(html);

                      thisClass.setSeqAlignForSymmetry(residArrayFinal1, residArrayFinal2, bOnechain);

                      let bShowHighlight = false;
                      let seqObj = ic.icn3dui.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight, bOnechain);

                      html = $("#" + ic.pre + "dl_sequence2").html() + seqObj.sequencesHtml;

                      $("#" + ic.pre + "dl_sequence2").html(html);
                      $("#" + ic.pre + "dl_sequence2").width(ic.icn3dui.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

                      ic.icn3dui.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences from SymD');

                      let numDef = Object.keys(ic.defNames2Residues).length + Object.keys(ic.defNames2Atoms).length;

                      let name = 'symOri' + numDef;
                      ic.selectionCls.selectResidueList(residArrayHashFinal1, name, name);
                      ic.selectionCls.updateSelectionNameDesc();
                      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residArrayHashFinal1)) + ' | name ' + name, false);

                      name = 'symPerm' + numDef;
                      ic.selectionCls.selectResidueList(residArrayHashFinal2, name, name);
                      ic.selectionCls.updateSelectionNameDesc();
                      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residArrayHashFinal2)) + ' | name ' + name, false);

                      name = 'symBoth' + numDef;
                      residArrayHashFinal1 = me.hashUtilsCls.unionHash(residArrayHashFinal1, residArrayHashFinal2);
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

    getResObj(resn_resid) { let ic = this.icn3d, me = ic.icn3dui;
        // K $1KQ2.A:2

        let resn = resn_resid.substr(0, resn_resid.indexOf(' '));
        let pos1 = resn_resid.indexOf('$');
        let pos2 = resn_resid.indexOf('.');
        let pos3 = resn_resid.indexOf(':');

        let structure = resn_resid.substr(pos1 + 1, pos2 - pos1 - 1);
        let chain = resn_resid.substr(pos2 + 1, pos3 - pos2 - 1);
        let resi = resn_resid.substr(pos3 + 1);
        let resid = structure + '_' + chain + '_' + resi;

        let resObject = {'resn': resn, 'resid': resid, 'resi': resi, 'aligned': true}

        return resObject;
    }

    setSeqAlignForSymmetry(residArray1, residArray2, bOnechain) { let ic = this.icn3d, me = ic.icn3dui;
          //loadSeqAlignment
          let alignedAtoms = {}
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

          let residuesHash = {}

          for(let i = 0, il = residArray1.length; i < il; ++i) { // K $1KQ2.A:2
              let resObject1 = this.getResObj(residArray1[i]);
              let resObject2 = this.getResObj(residArray2[i]);

              let chainid1 = resObject1.resid.substr(0, resObject1.resid.lastIndexOf('_'));
              let chainid2Ori = resObject2.resid.substr(0, resObject2.resid.lastIndexOf('_'));
              let chainid2 = chainid2Ori;
              // if one chain, separate it into two chains to show seq alignment
              if(bOnechain) {
                  let stucture = chainid2Ori.substr(0, chainid2Ori.indexOf('_'));
                  chainid2 = stucture + '2' + chainid2Ori.substr(chainid2Ori.indexOf('_'));
              }

              residuesHash[resObject1.resid] = 1;
              residuesHash[resObject2.resid] = 1;

              let color;
              if(resObject1.resn == resObject2.resn) {
                  color = "#FF0000";
              }
              else {
                  color = "#0000FF";
              }
              let color2 = '#' + ic.showAnnoCls.getColorhexFromBlosum62(resObject1.resn, resObject2.resn);

              resObject1.color = color;
              resObject2.color = color;

              resObject1.color2 = color2;
              resObject2.color2 = color2;

              for(let j in ic.residues[resObject1.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
                  ic.atomPrevColors[j] = me.parasCls.thr(color);
              }
              for(let j in ic.residues[resObject2.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
                  ic.atomPrevColors[j] = me.parasCls.thr(color);
              }

              // annoation title for the master seq only
              if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];

              for(let j = 0; j < 3; ++j) {
                  if(ic.alnChainsAnTtl[chainid1][j] === undefined ) ic.alnChainsAnTtl[chainid1][j] = [];
              }

              // two annotations without titles
              for(let j = 0; j < 3; ++j) {
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

              for(let j = 0; j < 3; ++j) {
                  if(ic.alnChainsAnno[chainid1][j] === undefined ) ic.alnChainsAnno[chainid1][j] = [];
              }

              let symbol = '.';
              if(i % 5 === 0) symbol = '*';
              if(i % 10 === 0) symbol = '|';
              ic.alnChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

              let numberStr = '';
              if(i % 10 === 0) numberStr = i.toString();
              ic.alnChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest
          }

    /*
            let commandname = 'symBoth_aligned'; //'protein_aligned';
            let commanddescr = 'symBoth aligned'; //'protein aligned';
            let select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));

            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
    */
    }

    retrieveSymmetry(pdbid) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass =this;

       let url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";

       $.ajax({
          url: url,
          dataType: "json",
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              let symmetryArray = data.rcsb_struct_symmetry;
              let rot, centerFrom, centerTo;

              if(symmetryArray !== undefined) {
                  if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                      rot = ic.rmsd_supr.rot;
                      centerFrom = ic.rmsd_supr.trans1;
                      centerTo = ic.rmsd_supr.trans2;
                  }

                  ic.symmetryHash = {}
                  for(let i = 0, il = symmetryArray.length; i < il; ++i) {
                      if(symmetryArray[i].symbol == 'C1') continue;
                      let title = 'no title';
                      if(symmetryArray[i].kind == "Pseudo Symmetry") {
                          title = symmetryArray[i].symbol + ' (pseudo)';
                      }
                      else if(symmetryArray[i].kind == "Global Symmetry") {
                          title = symmetryArray[i].symbol + ' (global)';
                      }
                      else if(symmetryArray[i].kind == "Local Symmetry") {
                          title = symmetryArray[i].symbol + ' (local)';
                      }

                      let rotation_axes = symmetryArray[i].rotation_axes;
                      let axesArray = [];
                      for(let j = 0, jl = rotation_axes.length; j < jl; ++j) {
                          let tmpArray = [];
                          let start = new THREE.Vector3(rotation_axes[j].start[0], rotation_axes[j].start[1], rotation_axes[j].start[2]);
                          let end = new THREE.Vector3(rotation_axes[j].end[0], rotation_axes[j].end[1], rotation_axes[j].end[2]);

                          // apply matrix for each atom
                          if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                              start = ic.surfaceCls.transformMemPro(start, rot, centerFrom, centerTo);
                              end = ic.surfaceCls.transformMemPro(end, rot, centerFrom, centerTo);
                          }

                          tmpArray.push(start);
                          tmpArray.push(end);

                          // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                          let colorAxis = thisClass.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                          let colorPolygon = thisClass.getPolygonColor(symmetryArray[i].symbol);
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
                      let html = "<option value='none'>None</option>", index = 0;
                      for(let title in ic.symmetryHash) {
                          let selected =(index == 0) ? 'selected' : '';
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

    getPolygonColor(symbol) { let ic = this.icn3d, me = ic.icn3dui;
        let type = symbol.substr(0, 1);

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

    getAxisColor(symbol, order) { let ic = this.icn3d, me = ic.icn3dui;
        let type = symbol.substr(0, 1);

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
