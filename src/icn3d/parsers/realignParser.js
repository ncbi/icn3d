/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {Selection} from '../selection/selection.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {SetColor} from '../display/setColor.js';
import {Draw} from '../display/draw.js';
import {ChainalignParser} from '../parsers/chainalignParser.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';

class RealignParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    realign() { var ic = this.icn3d, me = ic.icn3dui;
        ic.selectionCls.saveSelectionPrep();

        var index = Object.keys(ic.defNames2Atoms).length;
        var name = 'alseq_' + index;

        ic.selectionCls.saveSelection(name, name);

        var structHash = {}
        ic.realignResid = {}
        var lastStruResi = '';
        for(var serial in ic.hAtoms) {
            var atom = ic.atoms[serial];
            if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA")
              ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*")) ) {
                if(atom.structure + '_' + atom.resi == lastStruResi) continue; // e.g., Alt A and B

                if(!structHash.hasOwnProperty(atom.structure)) {
                    structHash[atom.structure] = [];
                }
                structHash[atom.structure].push(atom.coord.clone());

                if(!ic.realignResid.hasOwnProperty(atom.structure)) {
                    ic.realignResid[atom.structure] = [];
                }

                ic.realignResid[atom.structure].push({'resid': atom.structure + '_' + atom.chain + '_' + atom.resi, 'resn': me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3)).substr(0, 1)});

                lastStruResi = atom.structure + '_' + atom.resi;
            }
        }

        var structArray = Object.keys(structHash);

        var toStruct = structArray[0];
        var fromStruct = structArray[1];

        // transform from the second structure to the first structure
        var coordsFrom = structHash[fromStruct];
        var coordsTo = structHash[toStruct];

        var bKeepSeq = true;
        ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq);

        ic.hlUpdateCls.updateHlAll();
    }

    parseChainRealignPredefined(chainidArray, struct2SeqHash, struct2CoorHash, struct2resid) { var ic = this.icn3d, me = ic.icn3dui;
      var bRealign = undefined;

      var toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')); //.toUpperCase();
      if(!bRealign) toStruct = toStruct.toUpperCase();

      var hAtoms = {}

      ic.realignResid = {}

      ic.opts['color'] = 'grey';
      ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

      for(var index = 0, indexl = chainidArray.length - 1; index < indexl; ++index) {
          var fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')); //.toUpperCase();
          if(!bRealign) fromStruct = fromStruct.toUpperCase();

          if(toStruct == fromStruct) fromStruct += ic.icn3dui.htmlCls.postfix;

          var seq1 = struct2SeqHash[toStruct];
          var seq2 = struct2SeqHash[fromStruct];

          var coord1 = struct2CoorHash[toStruct];
          var coord2 = struct2CoorHash[fromStruct];

          var residArray1 = struct2resid[toStruct];
          var residArray2 = struct2resid[fromStruct];

          // transform from the second structure to the first structure
          var coordsTo = [];
          var coordsFrom = [];

          var seqto = '', seqfrom = ''

          ic.realignResid[toStruct] = [];
          ic.realignResid[fromStruct] = [];

          for(var i = 0, il = seq1.length; i < il; ++i) {
              ic.realignResid[toStruct].push({'resid':residArray1[i], 'resn':seq1[i]});
              ic.realignResid[fromStruct].push({'resid':residArray2[i], 'resn':seq2[i]});
          }

          var chainTo = chainidArray[0];
          var chainFrom = chainidArray[index + 1];

          var bChainAlign = true;
          var hAtomsTmp = ic.ParserUtilsCls.alignCoords(coord2, coord1, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
          hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
      }

      ic.chainalignParserCls.downloadChainalignmentPart3(undefined, chainidArray, hAtoms);
    }

    parseChainRealignData(ajaxData, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign) { var ic = this.icn3d, me = ic.icn3dui;
      var dataArray =(chainidArray.length == 2) ? [ajaxData] : ajaxData;

      var toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')); //.toUpperCase();
      if(!bRealign) toStruct = toStruct.toUpperCase();

      var hAtoms = {}

      ic.realignResid = {}

      ic.opts['color'] = 'grey';
      ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

      // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
      //var data2 = v2[0];
      for(var index = 0, indexl = dataArray.length; index < indexl; ++index) {
    //  for(var index = 1, indexl = dataArray.length; index < indexl; ++index) {
          var data = dataArray[index][0];

          var fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')); //.toUpperCase();
          if(!bRealign) fromStruct = fromStruct.toUpperCase();

          if(toStruct == fromStruct) fromStruct += ic.icn3dui.htmlCls.postfix;

          var seq1 = struct2SeqHash[toStruct];
          var seq2 = struct2SeqHash[fromStruct];

          var coord1 = struct2CoorHash[toStruct];
          var coord2 = struct2CoorHash[fromStruct];

          var residArray1 = struct2resid[toStruct];
          var residArray2 = struct2resid[fromStruct];

          var query, target;

          if(data.data !== undefined) {
              query = data.data[0].query;
              var targetName = Object.keys(data.data[0].targets)[0];
              target = data.data[0].targets[targetName];

              target = target.hsps[0];
          }

          if(query !== undefined && target !== undefined) {
              // transform from the second structure to the first structure
              var coordsTo = [];
              var coordsFrom = [];

              var seqto = '', seqfrom = ''

              ic.realignResid[toStruct] = [];
              ic.realignResid[fromStruct] = [];

              var segArray = target.segs;
              for(var i = 0, il = segArray.length; i < il; ++i) {
                  var seg = segArray[i];
                  var prevChain1 = '', prevChain2 = '';
                  for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                      var chainid1 = residArray1[j + seg.orifrom].substr(0, residArray1[j + seg.orifrom].lastIndexOf('_'));
                      var chainid2 = residArray2[j + seg.from].substr(0, residArray2[j + seg.from].lastIndexOf('_'));

                      if(!coord1[j + seg.orifrom] || !coord2[j + seg.from]) continue;

                      coordsTo.push(coord1[j + seg.orifrom]);
                      coordsFrom.push(coord2[j + seg.from]);

                      seqto += seq1[j + seg.orifrom];
                      seqfrom += seq2[j + seg.from];

                      // one chaincould be longer than the other
                      if(j == 0 ||(prevChain1 == chainid1 && prevChain2 == chainid2) ||(prevChain1 != chainid1 && prevChain2 != chainid2)) {
                          ic.realignResid[toStruct].push({'resid':residArray1[j + seg.orifrom], 'resn':seq1[j + seg.orifrom]});
                          ic.realignResid[fromStruct].push({'resid':residArray2[j + seg.from], 'resn':seq2[j + seg.from]});
                      }

                      prevChain1 = chainid1;
                      prevChain2 = chainid2;
                  }
              }

              var chainTo = chainidArray[0];
              var chainFrom = chainidArray[index + 1];

              var bChainAlign = true;
              var hAtomsTmp = ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
              hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);

    //          ic.opts['color'] = 'identity';
    //          ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

              //ic.hlUpdateCls.updateHlAll();
          }
          else {
              if(fromStruct === undefined && !ic.icn3dui.cfg.command) {
                 alert('Please do not align residues in the same structure');
              }
              else if((seq1.length < 6 || seq2.length < 6) && !ic.icn3dui.cfg.command) {
                 alert('These sequences are too short for alignment');
              }
              else if(seq1.length >= 6 && seq2.length >= 6 && !ic.icn3dui.cfg.command) {
                 alert('These sequences can not be aligned to each other');
              }
          }

          // update all residue color

          //if(ic.deferredRealign !== undefined) ic.deferredRealign.resolve();
      }

      if(bRealign) {
          ic.dAtoms = hAtoms;
          ic.hAtoms = hAtoms;

          ic.opts['color'] = 'identity';
          //ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
          ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

          ic.drawCls.draw();
          ic.hlUpdateCls.updateHlAll();
          if(ic.deferredRealign !== undefined) ic.deferredRealign.resolve();
      }
      else {
          ic.chainalignParserCls.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms);
      }
    }

    realignOnSeqAlign() { var ic = this.icn3d, me = ic.icn3dui;
        var chainidHash = ic.firstAtomObjCls.getChainsFromAtoms(ic.hAtoms);

        var chainidArrayTmp = Object.keys(chainidHash);
        var chainidArray = [];

        var prevChainid = '';
        for(var i = 0, il = chainidArrayTmp.length; i < il; ++i) {
            if(chainidArrayTmp[i] != prevChainid) chainidArray.push(chainidArrayTmp[i]);
            prevChainid = chainidArrayTmp[i];
        }

        var bRealign = true;
        this.realignChainOnSeqAlign(undefined, chainidArray, bRealign);
    }

    realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray, bRealign, bPredefined) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        //bRealign: realign based on seq alignment
        //bPredefined: chain alignment with predefined matching residues

        var struct2SeqHash = {}
        var struct2CoorHash = {}
        var struct2resid = {}
        var lastStruResi = '';

        var mmdbid_t;
        var ajaxArray = [];
        var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=chainalign';

        var predefinedResArray, predefinedRes;

        if(bPredefined) {
            predefinedResArray = me.cfg.resdef.trim().replace(/\+/gi, ' ').split(' | ');

            if(predefinedResArray.length != chainidArray.length) {
               alert("Please make sure the number of chains and the lines of predefined residues are the same...");
               return;
            }
        }

        for(var i = 0, il = chainidArray.length; i < il; ++i) {
            if(bPredefined) predefinedRes = predefinedResArray[i].trim();

            var pos = chainidArray[i].indexOf('_');
            var mmdbid = chainidArray[i].substr(0, pos); //.toUpperCase();
            if(!bRealign) mmdbid =  mmdbid.toUpperCase();

            if(i == 0) {
                mmdbid_t = mmdbid;
            }
            else if(mmdbid_t == mmdbid) {
                mmdbid += ic.icn3dui.htmlCls.postfix;
            }

            var chainid = mmdbid + chainidArray[i].substr(pos);

            if(!struct2SeqHash.hasOwnProperty(mmdbid)) {
                struct2SeqHash[mmdbid] = '';
                struct2CoorHash[mmdbid] = [];
                struct2resid[mmdbid] = [];
            }

            if(i == 0 || bPredefined) { // master
                var base = parseInt(ic.chainsSeq[chainid][0].resi);

                var resRange;
                if(bRealign) {
                    var seqLen = ic.chainsSeq[chainid].length;
                    var lastResi = ic.chainsSeq[chainid][seqLen - 1].resi;
                    resRange = base.toString() + '-' + lastResi.toString();
                }

                var resiArray;
                if(bRealign) {
                    resiArray = [resRange];
                }
                else if(bPredefined) {
                    resiArray = predefinedRes.split(",");
                }
                else {
                    resiArray = ic.icn3dui.cfg.resnum.split(",");
                }

                for(var j = 0, jl = resiArray.length; j < jl; ++j) {
                    if(resiArray[j].indexOf('-') != -1) {
                        var startEnd = resiArray[j].split('-');

                        for(var k = parseInt(startEnd[0]); k <= parseInt(startEnd[1]); ++k) {
                            // don't align solvent or chemicals
                            if(!ic.chainsSeq[chainid][k - base] || me.parasCls.b62ResArray.indexOf(ic.chainsSeq[chainid][k - base].name.toUpperCase()) == -1) continue;

                            struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][k - base].name;
                            var bFound = false;
                            for(var serial in ic.residues[chainid + '_' + k]) {
                                var atom = ic.atoms[serial];
                                if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                                  ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                                    struct2CoorHash[mmdbid].push(atom.coord.clone());
                                    bFound = true;
                                    break;
                                }
                            }
                            if(!bFound) struct2CoorHash[mmdbid].push(undefined);

                            struct2resid[mmdbid].push(chainid + '_' + k);
                        }
                    }
                    else { // one residue
                        var k = parseInt(resiArray[j]);
                        struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][k - base].name;
                        var bFound = false;
                        for(var serial in ic.residues[chainid + '_' + k]) {
                            var atom = ic.atoms[serial];
                            if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                              ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                                struct2CoorHash[mmdbid].push(atom.coord.clone());
                                bFound = true;
                                break;
                            }
                        }
                        if(!bFound) struct2CoorHash[mmdbid].push(undefined);
                        struct2resid[mmdbid].push(chainid + '_' + k);
                    }
                }
            }
            else {
                for(var j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                    struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][j].name;
                    var resid = chainid + '_' + ic.chainsSeq[chainid][j].resi;
                    var bFound = false;
                    for(var serial in ic.residues[resid]) {
                        var atom = ic.atoms[serial];
                        if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                          ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                            struct2CoorHash[mmdbid].push(atom.coord.clone());
                            bFound = true;
                            break;
                        }
                    }
                    if(!bFound) struct2CoorHash[mmdbid].push(undefined);

                    struct2resid[mmdbid].push(resid);
                }
            }

            if(i > 0 && !bPredefined) {
                var toStruct = mmdbid_t;
                var fromStruct = mmdbid;

                var seq1 = struct2SeqHash[toStruct];
                var seq2 = struct2SeqHash[fromStruct];

                var queryAjax = $.ajax({
                   url: url,
                   type: 'POST',
                   data : {'targets': seq1, 'queries': seq2},
                   dataType: 'jsonp',
                   cache: true
                });

                ajaxArray.push(queryAjax);
            }
        } // for

        if(bPredefined) {
            thisClass.parseChainRealignPredefined(chainidArray, struct2SeqHash, struct2CoorHash, struct2resid);
        }
        else {
            //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
            //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
            $.when.apply(undefined, ajaxArray).then(function() {
               thisClass.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign);
            })
            .fail(function() {
               alert("The realignment did notwork...");
               //thisClass.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign);
            });
        }
    }
}

export {RealignParser}
