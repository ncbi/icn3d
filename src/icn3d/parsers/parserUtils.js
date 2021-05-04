/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';
import {RmsdSuprCls} from '../../utils/rmsdSuprCls.js';

import {Html} from '../../html/html.js';

import {Surface} from '../surface/surface.js';
import {SetSeqAlign} from '../parsers/setSeqAlign.js';
import {SetColor} from '../display/setColor.js';
import {Diagram2d} from '../analysis/diagram2d.js';
import {LoadPDB} from '../parsers/loadPDB.js';
import {Draw} from '../display/draw.js';
import {LoadScript} from '../selection/loadScript.js';
import {Selection} from '../selection/selection.js';
import {Transform} from '../transform/transform.js';
import {DefinedSets} from '../selection/definedSets.js';
import {ShowAnno} from '../annotations/showAnno.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {HlUpdate} from '../highlight/hlUpdate.js';

class ParserUtils {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    alignCoords(coordsFrom, coordsTo, secondStruct, bKeepSeq, chainid_t, chainid, chainIndex, bChainAlign) { var ic = this.icn3d, me = ic.icn3dui;
      //var n = coordsFrom.length;
      var n =(coordsFrom.length < coordsTo.length) ? coordsFrom.length : coordsTo.length;

      var hAtoms = {}

      if(n < 4) alert("Please select at least four residues in each structure...");
      if(n >= 4) {
          ic.rmsd_suprTmp = me.rmsdSuprCls.getRmsdSuprCls(coordsFrom, coordsTo, n);

          // apply matrix for each atom
          if(ic.rmsd_suprTmp.rot !== undefined) {
              var rot = ic.rmsd_suprTmp.rot;
              if(rot[0] === null) alert("Please select more residues in each structure...");

              var centerFrom = ic.rmsd_suprTmp.trans1;
              var centerTo = ic.rmsd_suprTmp.trans2;
              var rmsd = ic.rmsd_suprTmp.rmsd;

              if(rmsd) {
                  ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("realignment RMSD: " + rmsd.toPrecision(4), false);
                  $("#" + ic.pre + "realignrmsd").val(rmsd.toPrecision(4));
                  if(!ic.icn3dui.cfg.bSidebyside) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_rmsd', 'Realignment RMSD');
              }

              for(var i = 0, il = ic.structures[secondStruct].length; i < il; ++i) {
                  var chainidTmp = ic.structures[secondStruct][i];

                  for(var j in ic.chains[chainidTmp]) {
                    var atom = ic.atoms[j];
                    atom.coord = ic.surfaceCls.transformMemPro(atom.coord, rot, centerFrom, centerTo);
                  }
              }

              ic.bRealign = true;

              if(!bKeepSeq) ic.setSeqAlignCls.setSeqAlignForRealign(chainid_t, chainid, chainIndex);

              var bShowHighlight = false;
              var seqObj = ic.icn3dui.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight);

              var oriHtml =(chainIndex === 1) ? '' : $("#" + ic.pre + "dl_sequence2").html();
              $("#" + ic.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
              $("#" + ic.pre + "dl_sequence2").width(ic.icn3dui.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

              ic.icn3dui.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');

              if(!bChainAlign) {
                  ic.opts['color'] = 'identity';
                  ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
              }

              //ic.drawCls.draw();

              hAtoms = ic.hAtoms;
          }
      }

      return hAtoms;
    }

    getMissingResidues(seqArray, type, chainid) { var ic = this.icn3d, me = ic.icn3dui;
        var prevResi = -9999;
        //var missingResBegin = 0;
        //var bCount = true;

        ic.chainsSeq[chainid] = [];
        for(var i = 0, il = seqArray.length; i < il; ++i) {
            var seqName, resiPos;
            // mmdbid: ["0","R","ARG"],["502","V","VAL"]; mmcifid: [1, "ARG"]; align: ["0","R","ARG"] //align: [1, "0","R","ARG"]
            if(type === 'mmdbid') {
                seqName = seqArray[i][1];
                resiPos = 0;
            }
            else if(type === 'mmcifid') {
                seqName = seqArray[i][1];
                seqName = me.utilsCls.residueName2Abbr(seqName);
                resiPos = 0;
            }
            else if(type === 'align') {
                //seqName = seqArray[i][2];
                seqName = seqArray[i][1];
                resiPos = 0;
            }

            // fixe some missing residue names such as residue 6 in 5C1M_A
            if(seqName === '') {
                seqName = 'x';
            }

            var resObject = {}

            if(!ic.bUsePdbNum) {
                resObject.resi = i + 1;
            }
            else {
                var offset =(ic.chainid2offset[chainid]) ? ic.chainid2offset[chainid] : 0;
                resObject.resi =(seqArray[i][resiPos] == '0') ? i + 1 + offset : seqArray[i][resiPos];
            }

            var resi = parseInt(seqArray[i][resiPos]);
            var nextResi =(i == il - 1) ? 9999 : parseInt(seqArray[i+1][resiPos]);

            if(resi !== 0 ||
             (resi === 0 &&(prevResi === -1 || nextResi == 1) )
              ) {
                resObject.name = seqName.toUpperCase();

                //if(bCount && missingResBegin > 0) {
                    //if(ic.countNextresiArray[chainid] === undefined) ic.countNextresiArray[chainid] = [];

                    //var count_nextresi = [missingResBegin, parseInt(seqArray[i][0])];

                    //ic.countNextresiArray[chainid].push(count_nextresi);

                //    missingResBegin = 0;
                //}

                //bCount = false;
            }
            //else if(resi === 0 && prevResi !== -1) { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
            else { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
                resObject.name = seqName.toLowerCase();

                //++missingResBegin;

                //if(ic.chainMissingResidueArray[chainid] === undefined) ic.chainMissingResidueArray[chainid] = [];
                //ic.chainMissingResidueArray[chainid].push(resObject);

                //bCount = true;
            }

            //if(ic.chainsSeq[chainid] === undefined) ic.chainsSeq[chainid] = [];

            //var numberStr = '';
            //if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

            ic.chainsSeq[chainid].push(resObject);

            prevResi = resi;
        }
    }

    //Generate the 2D interaction diagram for the structure "mmdbid", which could be PDB ID. The 2D
    //interaction diagram is only available when the input is NCBI MMDB ID, i.e., the URL is something like "&mmdbid=...".
    set2DDiagramsForAlign(mmdbid1, mmdbid2) { var ic = this.icn3d, me = ic.icn3dui;
       ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

       mmdbid1 = mmdbid1.substr(0, 4);
       mmdbid2 = mmdbid2.substr(0, 4);

       var url1 = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid1+"&intrac=1";
       var url2 = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid2+"&intrac=1";

       if(ic.icn3dui.cfg.inpara !== undefined) {
          url1 += ic.icn3dui.cfg.inpara;
          url2 += ic.icn3dui.cfg.inpara;
       }

       var request1 = $.ajax({
            url: url1,
            dataType: 'jsonp',
            cache: true
       });

       var request2 = request1.then(function( data ) {
            ic.interactionData1 = data;

            ic.html2ddgm = '';

            ic.diagram2dCls.draw2Ddgm(data, mmdbid1, 0);
            if(ic.icn3dui.cfg.show2d) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

            return $.ajax({
              url: url2,
              dataType: 'jsonp',
              cache: true
            });
       });

       request2.done(function( data ) {
            ic.interactionData2 = data;

            ic.diagram2dCls.draw2Ddgm(data, mmdbid2, 1);

            ic.html2ddgm += "<br>" + ic.diagram2dCls.set2DdgmNote(true);
            $("#" + ic.pre + "dl_2ddgm").html(ic.html2ddgm);

            ic.b2DShown = true;
            //if(ic.icn3dui.cfg.show2d !== undefined && ic.icn3dui.cfg.show2d) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

            if(ic.deferredViewinteraction !== undefined) ic.deferredViewinteraction.resolve();
       });
    }

    set2DDiagramsForChainalign(chainidArray) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

        var ajaxArray = [];
        for(var index = 0, indexLen = chainidArray.length; index < indexLen; ++index) {
           var pos = chainidArray[index].indexOf('_');
           var mmdbid = chainidArray[index].substr(0, pos).toUpperCase();

           var url = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid+"&intrac=1";

           if(ic.icn3dui.cfg.inpara !== undefined) url += ic.icn3dui.cfg.inpara;

           var twodAjax = $.ajax({
                url: url,
                dataType: 'jsonp',
                cache: true
           });

           ajaxArray.push(twodAjax);
        }

        //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
        //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
        $.when.apply(undefined, ajaxArray).then(function() {
          thisClass.parse2DDiagramsData(arguments, chainidArray);
        })
        .fail(function() {
          thisClass.parse2DDiagramsData(arguments, chainidArray);
        });
    }

    parse2DDiagramsData(dataInput, chainidArray) { var ic = this.icn3d, me = ic.icn3dui;
        var dataArray =(chainidArray.length == 1) ? [dataInput] : dataInput;

        ic.html2ddgm = '';

        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        //var data2 = v2[0];
        for(var index = 0, indexl = chainidArray.length; index < indexl; ++index) {
            var data = dataArray[index][0];
            var mmdbid = chainidArray[index].substr(0, chainidArray[index].indexOf('_'));

            ic.diagram2dCls.draw2Ddgm(data, mmdbid, 0);
        }

        ic.html2ddgm += "<br>" + ic.diagram2dCls.set2DdgmNote(true);

        ic.b2DShown = true;
        $("#" + ic.pre + "dl_2ddgm").html(ic.html2ddgm);
        if(ic.icn3dui.cfg.show2d) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

        if(ic.deferredViewinteraction !== undefined) ic.deferredViewinteraction.resolve();
    }

    download2Ddgm(mmdbid, structureIndex) { var  me = this; "use strict";
        this.set2DDiagrams(mmdbid);
    }

    set2DDiagrams(mmdbid) { var ic = this.icn3d, me = ic.icn3dui;
        ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');

        if(ic.b2DShown === undefined || !ic.b2DShown) {
            ic.html2ddgm = '';

            ic.diagram2dCls.draw2Ddgm(ic.interactionData, mmdbid);

            ic.html2ddgm += "<br>" + ic.diagram2dCls.set2DdgmNote();
            $("#" + ic.pre + "dl_2ddgm").html(ic.html2ddgm);
        }

        ic.b2DShown = true;
    }

    showLoading() { var ic = this.icn3d, me = ic.icn3dui;
          if($("#" + ic.pre + "wait")) $("#" + ic.pre + "wait").show();
          if($("#" + ic.pre + "canvas")) $("#" + ic.pre + "canvas").hide();
          if($("#" + ic.pre + "cmdlog")) $("#" + ic.pre + "cmdlog").hide();
    }

    hideLoading() { var ic = this.icn3d, me = ic.icn3dui;
        //if(ic.bCommandLoad === undefined || !ic.bCommandLoad) {
          if($("#" + ic.pre + "wait")) $("#" + ic.pre + "wait").hide();
          if($("#" + ic.pre + "canvas")) $("#" + ic.pre + "canvas").show();
          if($("#" + ic.pre + "cmdlog")) $("#" + ic.pre + "cmdlog").show();
        //}
    }

    setYourNote(yournote) { var ic = this.icn3d, me = ic.icn3dui;
        ic.yournote = yournote;
        $("#" + ic.pre + "yournote").val(ic.yournote);
        if(ic.icn3dui.cfg.shownote) document.title = ic.yournote;
    }

    transformToOpmOri(pdbid) { var ic = this.icn3d, me = ic.icn3dui;
      // apply matrix for each atom
      if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
          var rot = ic.rmsd_supr.rot;
          var centerFrom = ic.rmsd_supr.trans1;
          var centerTo = ic.rmsd_supr.trans2;
          var rmsd = ic.rmsd_supr.rmsd;

          var dxymaxsq = 0;
          for(var i in ic.atoms) {
            var atom = ic.atoms[i];

            atom.coord = ic.surfaceCls.transformMemPro(atom.coord, rot, centerFrom, centerTo);
            var xysq = atom.coord.x * atom.coord.x + atom.coord.y * atom.coord.y;
            if(Math.abs(atom.coord.z) <= 25 && xysq > dxymaxsq) {
                dxymaxsq = xysq;
            }
          }

          //ic.center = chainresiCalphaHash2.center;
          //ic.oriCenter = ic.center.clone();

          // add membranes
          // the membrane atoms belongs to the structure "pdbid"
          this.addMemAtoms(ic.halfBilayerSize, pdbid, Math.sqrt(dxymaxsq));

          // no rotation
          ic.bStopRotate = true;

          ic.bOpm = true;

          // show transmembrane features
          $("#" + ic.pre + "togglememli").show();
          $("#" + ic.pre + "adjustmemli").show();
          $("#" + ic.pre + "selectplaneli").show();
          $("#" + ic.pre + "anno_transmemli").show();
      }
      else {
          ic.bOpm = false;
      }
    }

    transformToOpmOriForAlign(pdbid, chainresiCalphaHash2, bResi_ori) { var ic = this.icn3d, me = ic.icn3dui;
      if(chainresiCalphaHash2 !== undefined) {
          var chainresiCalphaHash1 = ic.loadPDBCls.getChainCalpha(ic.chains, ic.atoms, bResi_ori, pdbid);

          var bOneChain =(Object.keys(chainresiCalphaHash1.chainresiCalphaHash).length == 1 || Object.keys(chainresiCalphaHash2.chainresiCalphaHash).length == 1) ? true : false;

          var coordsFrom = [], coordsTo = [];
          for(var chain in chainresiCalphaHash1.chainresiCalphaHash) {
              if(chainresiCalphaHash2.chainresiCalphaHash.hasOwnProperty(chain)) {
                  var coord1 = chainresiCalphaHash1.chainresiCalphaHash[chain];
                  var coord2 = chainresiCalphaHash2.chainresiCalphaHash[chain];

                  if(coord1.length == coord2.length || bOneChain) {
                      coordsFrom = coordsFrom.concat(coord1);
                      coordsTo = coordsTo.concat(coord2);
                  }

                  if(coordsFrom.length > 500) break; // no need to use all c-alpha
              }
          }

          //var n = coordsFrom.length;
          var n =(coordsFrom.length < coordsTo.length) ? coordsFrom.length : coordsTo.length;

          if(n >= 4) {
              ic.rmsd_supr = me.rmsdSuprCls.getRmsdSuprCls(coordsFrom, coordsTo, n);

              // apply matrix for each atom
              if(ic.rmsd_supr.rot !== undefined && ic.rmsd_supr.rmsd < 0.1) {
                  var rot = ic.rmsd_supr.rot;
                  var centerFrom = ic.rmsd_supr.trans1;
                  var centerTo = ic.rmsd_supr.trans2;
                  var rmsd = ic.rmsd_supr.rmsd;

                  ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("RMSD of alignment to OPM: " + rmsd.toPrecision(4), false);
                  $("#" + ic.pre + "realignrmsd").val(rmsd.toPrecision(4));
                  if(!ic.icn3dui.cfg.bSidebyside) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_rmsd', 'RMSD of alignment to OPM');

                  var dxymaxsq = 0;
                  for(var i in ic.atoms) {
                    var atom = ic.atoms[i];

                    atom.coord = ic.surfaceCls.transformMemPro(atom.coord, rot, centerFrom, centerTo);
                    var xysq = atom.coord.x * atom.coord.x + atom.coord.y * atom.coord.y;
                    if(Math.abs(atom.coord.z) <= 25 && xysq > dxymaxsq) {
                        dxymaxsq = xysq;
                    }
                  }

                  ic.center = chainresiCalphaHash2.center;
                  ic.oriCenter = ic.center.clone();

                  // add membranes
                  this.addMemAtoms(ic.halfBilayerSize, pdbid, Math.sqrt(dxymaxsq));

                  // no rotation
                  ic.bStopRotate = true;

                  ic.bOpm = true;

                  // show transmembrane features
                  $("#" + ic.pre + "togglememli").show();
                  $("#" + ic.pre + "adjustmemli").show();
                  $("#" + ic.pre + "selectplaneli").show();
                  $("#" + ic.pre + "anno_transmemli").show();
              }
              else {
                  ic.bOpm = false;
              }
          }
          else {
              ic.bOpm = false;
          }
      }
    }

    addOneDumAtom(pdbid, atomName, x, y, z, lastSerial) { var ic = this.icn3d, me = ic.icn3dui;
      var resn = 'DUM';
      var chain = 'MEM';
      var resi = 1;
      var coord = new THREE.Vector3(x, y, z);

      var atomDetails = {
          het: true, // optional, used to determine chemicals, water, ions, etc
          serial: ++lastSerial,         // required, unique atom id
          name: atomName,             // required, atom name
          alt: undefined,               // optional, some alternative coordinates
          resn: resn,             // optional, used to determine protein or nucleotide
          structure: pdbid,   // optional, used to identify structure
          chain: chain,           // optional, used to identify chain
          resi: resi,             // optional, used to identify residue ID
          coord: coord,           // required, used to draw 3D shape
          b: undefined, // optional, used to draw B-factor tube
          elem: atomName,             // optional, used to determine hydrogen bond
          bonds: [],              // required, used to connect atoms
          ss: '',             // optional, used to show secondary structures
          ssbegin: false,         // optional, used to show the beginning of secondary structures
          ssend: false,            // optional, used to show the end of secondary structures
          color: me.parasCls.atomColors[atomName]
      }
      ic.atoms[lastSerial] = atomDetails;

      ic.chains[pdbid + '_MEM'][lastSerial] = 1;
      ic.residues[pdbid + '_MEM_1'][lastSerial] = 1;

      ic.chemicals[lastSerial] = 1;

      ic.dAtoms[lastSerial] = 1;
      ic.hAtoms[lastSerial] = 1;

      return lastSerial;
    }

    addMemAtoms(dmem, pdbid, dxymax) { var ic = this.icn3d, me = ic.icn3dui;
      var npoint=40; // points in radius
      var step = 2;
      var maxpnt=2*npoint+1; // points in diameter
      var fn=step*npoint; // center point

      //var dxymax = npoint / 2.0 * step;

      pdbid =(pdbid) ? pdbid.toUpperCase() : 'stru';

      ic.structures[pdbid].push(pdbid + '_MEM');
      ic.chains[pdbid + '_MEM'] = {}
      ic.residues[pdbid + '_MEM_1'] = {}

      ic.chainsSeq[pdbid + '_MEM'] = [{'name':'DUM', 'resi': 1}];

      var m=0;
      var lastSerial = Object.keys(ic.atoms).length;
      for(var i = 0; i < 1000; ++i) {
          if(!ic.atoms.hasOwnProperty(lastSerial + i)) {
              lastSerial = lastSerial + i - 1;
              break;
          }
      }

      for(var i=0; i < maxpnt; ++i) {
         for(var j=0; j < maxpnt; ++j) {
            ++m;
            var a=step*i-fn;
            var b=step*j-fn;
            var dxy=Math.sqrt(a*a+b*b);
            if(dxy < dxymax) {
                  var c=-dmem-0.4;
                  // Resn: DUM, name: N, a,b,c
                  lastSerial = this.addOneDumAtom(pdbid, 'N', a, b, c, lastSerial);

                  c=dmem+0.4;
                  // Resn: DUM, name: O, a,b,c
                  lastSerial = this.addOneDumAtom(pdbid, 'O', a, b, c, lastSerial);
            }
         }
      }
    }

    setMaxD() { var ic = this.icn3d, me = ic.icn3dui;
        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for(var i in ic.atoms) {
            var atom = ic.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(atom.het) {
              //if($.inArray(atom.elem, me.parasCls.ionsArray) !== -1) {
              if(atom.bonds.length == 0) {
                ic.ions[atom.serial] = 1;
              }
              else {
                ic.chemicals[atom.serial] = 1;
              }
            }
        } // end of for


        ic.pmin = pmin;
        ic.pmax = pmax;

        ic.cnt = cnt;

        ic.maxD = ic.pmax.distanceTo(ic.pmin);
        ic.center = psum.multiplyScalar(1.0 / ic.cnt);

        if(ic.maxD < 5) ic.maxD = 5;
        ic.oriMaxD = ic.maxD;
        ic.oriCenter = ic.center.clone();
    }

    //Update the dropdown menu and show the structure by calling the function "draw()".
    renderStructure() { var ic = this.icn3d, me = ic.icn3dui;
      if(ic.bInitial) {
          //$.extend(ic.opts, ic.opts);
          if(ic.bOpm &&(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined)) { // show membrane
              var resid = ic.selectedPdbid + '_MEM_1';
              for(var i in ic.residues[resid]) {
                  var atom = ic.atoms[i];
                  atom.style = 'stick';
                  atom.color = me.parasCls.atomColors[atom.name];
                  ic.atomPrevColors[i] = atom.color;
                  ic.dAtoms[i] = 1;
              }
          }
          if(ic.icn3dui.cfg.command !== undefined && ic.icn3dui.cfg.command !== '') {
              ic.bRender = false;
              ic.drawCls.draw();
          }
          else {
              ic.selectionCls.oneStructurePerWindow(); // for alignment
              ic.drawCls.draw();
          }
          if(ic.bOpm) {
              var axis = new THREE.Vector3(1,0,0);
              var angle = -0.5 * Math.PI;
              ic.transformCls.setRotation(axis, angle);
          }
          if(Object.keys(ic.structures).length > 1) {
              $("#" + ic.pre + "alternate").show();
          }
          else {
              $("#" + ic.pre + "alternate").hide();
          }
      }
      else {
          ic.selectionCls.saveSelectionIfSelected();
          ic.drawCls.draw();
      }

      if(ic.bInitial && ic.icn3dui.cfg.command !== undefined && ic.icn3dui.cfg.command !== '') {
          if(Object.keys(ic.structures).length == 1) {
              var id = Object.keys(ic.structures)[0];
              ic.icn3dui.cfg.command = ic.icn3dui.cfg.command.replace(new RegExp('!','g'), id + '_');
          }
          // final step resolved ic.deferred
          ic.loadScriptCls.loadScript(ic.icn3dui.cfg.command);
      }
      else {
          if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
      }
      //if(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined || ic.bRealign ||( ic.bInputfile && ic.InputfileType == 'pdb' && Object.keys(ic.structures).length >= 2) ) {
      if(Object.keys(ic.structures).length >= 2) {
          $("#" + ic.pre + "mn2_alternateWrap").show();
          $("#" + ic.pre + "mn2_realignWrap").show();
      }
      else {
          $("#" + ic.pre + "mn2_alternateWrap").hide();
          $("#" + ic.pre + "mn2_realignWrap").hide();
      }
      // display the structure right away. load the mns and sequences later
      setTimeout(function(){
          if(ic.bInitial) {
              if(ic.icn3dui.cfg.showsets) {
                   ic.definedSetsCls.showSets();
              }
              if(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) {
                  // expand the toolbar
                  var id = ic.pre + 'selection';
                  $("#" + id).show();
                  $("#" + id + "_expand").hide();
                  $("#" + id + "_shrink").show();

                  if(ic.icn3dui.cfg.align !== undefined) {
                      var bShowHighlight = false;
                      var seqObj = ic.icn3dui.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight);
                      $("#" + ic.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                      $("#" + ic.pre + "dl_sequence2").width(ic.icn3dui.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
                  }
              }
              //ic.definedSetsCls.setProtNuclLigInMenu();
              if(ic.icn3dui.cfg.showanno) {
                   var cmd = "view annotations";
                   ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(cmd, true);
                   ic.showAnnoCls.showAnnotations();
              }
              if(ic.icn3dui.cfg.closepopup) {
                  ic.resizeCanvasCls.closeDialogs();
              }
          }
          else {
              ic.hlUpdateCls.updateHlAll();
          }
          if($("#" + ic.pre + "atomsCustom").length > 0) $("#" + ic.pre + "atomsCustom")[0].blur();
          ic.bInitial = false;
      }, 0);
    }
}

export {ParserUtils}
