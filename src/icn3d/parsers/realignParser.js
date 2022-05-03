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

    // realign based on sequence
    realign() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.selectionCls.saveSelectionPrep();

        let  index = Object.keys(ic.defNames2Atoms).length;
        let  name = 'alseq_' + index;

        ic.selectionCls.saveSelection(name, name);

        let  structHash = {}, struct2chain = {};
        ic.realignResid = {};
        let  lastStruResi = '';
        for(let serial in ic.hAtoms) {
            let  atom = ic.atoms[serial];
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

                struct2chain[atom.structure] = atom.structure + '_' + atom.chain;

                lastStruResi = atom.structure + '_' + atom.resi;
            }
        }

        let  structArray = Object.keys(structHash);

        let  toStruct = structArray[0];

        for(let i = 1, il = structArray.length; i < il; ++i) {
            let  fromStruct = structArray[i];

            // transform from the second structure to the first structure
            let  coordsFrom = structHash[fromStruct];
            let  coordsTo = structHash[toStruct];

            let  bKeepSeq = true;
            //ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq);
            ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq, struct2chain[toStruct], struct2chain[fromStruct]);
        }

        ic.hlUpdateCls.updateHlAll();
    }

    parseChainRealignPredefined(chainidArray, struct2SeqHash, struct2CoorHash, struct2resid) { let  ic = this.icn3d, me = ic.icn3dui;
      let  bRealign = true; //undefined;

      let  toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')); //.toUpperCase();
      if(!bRealign) toStruct = toStruct.toUpperCase();

      let  hAtoms = {}

      ic.realignResid = {}

      ic.opts['color'] = 'grey';
      ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

      for(let index = 0, indexl = chainidArray.length - 1; index < indexl; ++index) {
          let chainpair = chainidArray[0] + ',' + chainidArray[index + 1];
          let  fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')); //.toUpperCase();
          if(!bRealign) fromStruct = fromStruct.toUpperCase();

          if(toStruct == fromStruct) fromStruct += me.htmlCls.postfix;

          if(!struct2SeqHash[chainpair]) continue;

          let  seq1 = struct2SeqHash[chainpair][toStruct];
          let  seq2 = struct2SeqHash[chainpair][fromStruct];

          let  coord1 = struct2CoorHash[chainpair][toStruct];
          let  coord2 = struct2CoorHash[chainpair][fromStruct];

          let  residArray1 = struct2resid[chainpair][toStruct];
          let  residArray2 = struct2resid[chainpair][fromStruct];

          // transform from the second structure to the first structure
          let  coordsTo = [];
          let  coordsFrom = [];

          let  seqto = '', seqfrom = ''

          ic.realignResid[toStruct] = [];
          ic.realignResid[fromStruct] = [];

          for(let i = 0, il = seq1.length; i < il; ++i) {
              ic.realignResid[toStruct].push({'resid':residArray1[i], 'resn':seq1[i]});
              ic.realignResid[fromStruct].push({'resid':residArray2[i], 'resn':seq2[i]});
          }

          let  chainTo = chainidArray[0];
          let  chainFrom = chainidArray[index + 1];

          let  bChainAlign = true;
          let  hAtomsTmp = ic.ParserUtilsCls.alignCoords(coord2, coord1, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
          hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
      }

      ic.chainalignParserCls.downloadChainalignmentPart3(undefined, chainidArray, hAtoms);
    }

    parseChainRealignData(dataArray, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign) { let  ic = this.icn3d, me = ic.icn3dui;
      //var dataArray =(chainidArray.length == 2) ? [ajaxData] : ajaxData;

      let  toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')); //.toUpperCase();
      if(!bRealign) toStruct = toStruct.toUpperCase();

      let  hAtoms = {}

      ic.realignResid = {}

      ic.opts['color'] = 'grey';
      ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

      // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
      //var data2 = v2[0];
      for(let index = 0, indexl = dataArray.length; index < indexl; ++index) {
    //  for(let index = 1, indexl = dataArray.length; index < indexl; ++index) {
          let  data = dataArray[index][0];
          if(!data) continue;

          let  fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')); //.toUpperCase();
          if(!bRealign) fromStruct = fromStruct.toUpperCase();

          if(toStruct == fromStruct) fromStruct += me.htmlCls.postfix;

          let  seq1 = struct2SeqHash[toStruct];
          let  seq2 = struct2SeqHash[fromStruct];

          let  coord1 = struct2CoorHash[toStruct];
          let  coord2 = struct2CoorHash[fromStruct];

          let  residArray1 = struct2resid[toStruct];
          let  residArray2 = struct2resid[fromStruct];

          let  query, target;

          if(data.data !== undefined) {
              query = data.data[0].query;
              let  targetName = Object.keys(data.data[0].targets)[0];
              target = data.data[0].targets[targetName];

              target = target.hsps[0];
          }

          if(query !== undefined && target !== undefined) {
              // transform from the second structure to the first structure
              let  coordsTo = [];
              let  coordsFrom = [];

              let  seqto = '', seqfrom = ''

              ic.realignResid[toStruct] = [];
              ic.realignResid[fromStruct] = [];

              let  segArray = target.segs;
              for(let i = 0, il = segArray.length; i < il; ++i) {
                  let  seg = segArray[i];
                  let  prevChain1 = '', prevChain2 = '';
                  for(let j = 0; j <= seg.orito - seg.orifrom; ++j) {
                      let  chainid1 = residArray1[j + seg.orifrom].substr(0, residArray1[j + seg.orifrom].lastIndexOf('_'));
                      let  chainid2 = residArray2[j + seg.from].substr(0, residArray2[j + seg.from].lastIndexOf('_'));

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

              let  chainTo = chainidArray[0];
              let  chainFrom = chainidArray[index + 1];

              let  bChainAlign = true;
              let  hAtomsTmp = ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
              hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);

    //          ic.opts['color'] = 'identity';
    //          ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

              //ic.hlUpdateCls.updateHlAll();
          }
          else {
              if(fromStruct === undefined && !me.cfg.command) {
                 alert('Please do not align residues in the same structure');
              }
              else if(seq1 && seq2) {
                if((seq1.length < 6 || seq2.length < 6) && !me.cfg.command) {
                    alert('These sequences are too short for alignment');
                }
                else if(seq1.length >= 6 && seq2.length >= 6 && !me.cfg.command) {
                    alert('These sequences can not be aligned to each other');
                }
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

    realignOnSeqAlign() { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainidHash = ic.firstAtomObjCls.getChainsFromAtoms(ic.hAtoms);

        let  chainidArrayTmp = Object.keys(chainidHash);
        let  chainidArray = [];

        let  prevChainid = '';
        for(let i = 0, il = chainidArrayTmp.length; i < il; ++i) {
            if(chainidArrayTmp[i] != prevChainid) chainidArray.push(chainidArrayTmp[i]);
            prevChainid = chainidArrayTmp[i];
        }

        let  bRealign = true;

        this.realignChainOnSeqAlign(undefined, chainidArray, bRealign);
    }

    realignOnStructAlign() { let  ic = this.icn3d, me = ic.icn3dui;
        // each 3D domain should have at least 3 secondary structures
        let minSseCnt = 3;
        let struct2domain = {};

        for(let struct in ic.structures) {
            struct2domain[struct] = {};
            let chainidArray = ic.structures[struct];
            for(let i = 0, il = chainidArray.length; i < il; ++i) {
                let chainid = chainidArray[i];
                let atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid]);               
                let sseCnt = 0;
                for(let serial in atoms) {
                    if(ic.atoms[serial].ssbegin) ++sseCnt;
                    if(sseCnt == minSseCnt) {
                        struct2domain[struct][chainid] = atoms;
                        break;
                    }
                }
            }
        }

        let  ajaxArray = [], chainidPairArray = [], struArray = [];
        let urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi";

        let cnt = 0;
        let structArray = Object.keys(struct2domain);
        for(let s = 0, sl = structArray.length; s < sl; ++s) {
            let struct1 = structArray[s];
            let chainidArray1 = Object.keys(struct2domain[struct1]);
            if(chainidArray1.length == 0) continue;
            for(let t = s+1, tl = structArray.length; t < tl; ++t) {
                let struct2 = structArray[t];
                let chainidArray2 = Object.keys(struct2domain[struct2]);
                if(chainidArray2.length == 0) continue;

                for(let i = 0, il = chainidArray1.length; i < il; ++i) {
                    let chainid1 = chainidArray1[i];
                    for(let j = 0, jl = chainidArray2.length; j < jl; ++j) {
                        let chainid2 = chainidArray2[j];

                        let jsonStr_t = ic.domain3dCls.getDomainJsonForAlign(struct2domain[struct1][chainid1]);
                        let jsonStr_q = ic.domain3dCls.getDomainJsonForAlign(struct2domain[struct2][chainid2]);
                      
                        let alignAjax = $.ajax({
                            url: urlalign,
                            type: 'POST',
                            data: {'domains1': jsonStr_q, 'domains2': jsonStr_t},
                            dataType: 'jsonp',
                            cache: true
                        });

                        ajaxArray.push(alignAjax);
                        chainidPairArray.push(chainid1 + ',' + chainid2); // chainid2 is target
                        ++cnt;
                    }
                }
            }
        }

        //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
        //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
        $.when.apply(undefined, ajaxArray).then(function() {
            let  dataArray =(chainidPairArray.length == 1) ? [arguments] : Array.from(arguments);
            ic.chainalignParserCls.downloadChainalignmentPart2bRealign(dataArray, chainidPairArray);
        })
        .fail(function() {
            alert("These structures can NOT be aligned to each other...");
        });            
    }

    realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray, bRealign, bPredefined) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        //bRealign: realign based on seq alignment
        //bPredefined: chain alignment with predefined matching residues

        let  struct2SeqHash = {}
        let  struct2CoorHash = {}
        let  struct2resid = {}
        let  lastStruResi = '';

        let jsonStr_q, jsonStr_t;

        let  mmdbid_t, chainid_t, base_t, base;
        let  ajaxArray = [];
        let  url = me.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=chainalign';

        let  predefinedResArray, predefinedResPair;

        if(bPredefined) {
            predefinedResArray = me.cfg.resdef.trim().replace(/\+/gi, ' ').split('; ');

            if(predefinedResArray.length != chainidArray.length - 1) {
               alert("Please make sure the number of chains and the lines of predefined residues are the same...");
               return;
            }
        }

        let result, resiArray;
        for(let i = 0, il = chainidArray.length; i < il; ++i) {
            //if(bPredefined) predefinedRes = predefinedResArray[i].trim();

            let  pos = chainidArray[i].indexOf('_');
            let  mmdbid = chainidArray[i].substr(0, pos); //.toUpperCase();

            if(!bRealign) mmdbid =  mmdbid.toUpperCase();

            if(i == 0) {
                mmdbid_t = mmdbid;
            }
            else if(mmdbid_t == mmdbid) {
                mmdbid += me.htmlCls.postfix;
            }

            let  chainid = mmdbid + chainidArray[i].substr(pos);
            if(i == 0) chainid_t = chainid;

            if(!ic.chainsSeq[chainid]) {
                //alert("Please select one chain per structure and try it again...");
                //return;

                continue;
            }

            if(!struct2SeqHash.hasOwnProperty(mmdbid) && !bPredefined) {
                struct2SeqHash[mmdbid] = '';
                struct2CoorHash[mmdbid] = [];
                struct2resid[mmdbid] = [];
            }
 
            if(bPredefined) {
                base = parseInt(ic.chainsSeq[chainid][0].resi);

                if(i == 0) { // master
                    base_t = base;
                }
                else {
                    predefinedResPair = predefinedResArray[i - 1].split(' | ');

                    let chainidpair = chainid_t + ',' + chainid;
                    if(!struct2SeqHash[chainidpair]) struct2SeqHash[chainidpair] = {};
                    if(!struct2CoorHash[chainidpair]) struct2CoorHash[chainidpair] = {};
                    if(!struct2resid[chainidpair]) struct2resid[chainidpair] = {};

                    // master
                    resiArray = predefinedResPair[0].split(",");
                    result = thisClass.getSeqCoorResid(resiArray, chainid_t, base_t);

                    if(!struct2SeqHash[chainidpair][mmdbid_t]) struct2SeqHash[chainidpair][mmdbid_t] = '';
                    if(!struct2CoorHash[chainidpair][mmdbid_t]) struct2CoorHash[chainidpair][mmdbid_t] = [];
                    if(!struct2resid[chainidpair][mmdbid_t]) struct2resid[chainidpair][mmdbid_t] = [];

                    struct2SeqHash[chainidpair][mmdbid_t] += result.seq;
                    struct2CoorHash[chainidpair][mmdbid_t] = struct2CoorHash[chainidpair][mmdbid_t].concat(result.coor);
                    struct2resid[chainidpair][mmdbid_t] = struct2resid[chainidpair][mmdbid_t].concat(result.resid);

                    // slave
                    resiArray = predefinedResPair[1].split(",");
                    result = thisClass.getSeqCoorResid(resiArray, chainid, base);
                    
                    if(!struct2SeqHash[chainidpair][mmdbid]) struct2SeqHash[chainidpair][mmdbid] = '';
                    if(!struct2CoorHash[chainidpair][mmdbid]) struct2CoorHash[chainidpair][mmdbid] = [];
                    if(!struct2resid[chainidpair][mmdbid]) struct2resid[chainidpair][mmdbid] = [];

                    struct2SeqHash[chainidpair][mmdbid] += result.seq;
                    struct2CoorHash[chainidpair][mmdbid] = struct2CoorHash[chainidpair][mmdbid].concat(result.coor);
                    struct2resid[chainidpair][mmdbid] = struct2resid[chainidpair][mmdbid].concat(result.resid);
                }
            }
            else {
                if(i == 0) { // master
                    base = parseInt(ic.chainsSeq[chainid][0].resi);

                    resiArray = [];
                    if(bRealign) {
                        //resiArray = [resRange];
                        let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.hAtoms);
                        for(var resid in residHash) {
                            let resi = resid.substr(resid.lastIndexOf('_') + 1);

                            let chainidTmp = resid.substr(0, resid.lastIndexOf('_'));
                            if(chainidTmp == chainid) resiArray.push(resi);
                        }
                    }
                    else if(me.cfg.resnum) {
                        resiArray = me.cfg.resnum.split(",");
                    }

                    //if(!bPredefined) {
                        result = thisClass.getSeqCoorResid(resiArray, chainid, base);
                        struct2SeqHash[mmdbid] += result.seq;
                        struct2CoorHash[mmdbid] = struct2CoorHash[mmdbid].concat(result.coor);
                        struct2resid[mmdbid] = struct2resid[mmdbid].concat(result.resid);
                    //}
                }
                else {
                    // if selected both chains
                    let bSelectedBoth = false;
                    if(bRealign) {
                        //resiArray = [resRange];
                        let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.hAtoms);
                        for(var resid in residHash) {
                            //let resi = resid.substr(resid.lastIndexOf('_') + 1);
                            let chainidTmp = resid.substr(0, resid.lastIndexOf('_'));
                            if(chainidTmp == chainid) {
                                bSelectedBoth = true;

                                let resn = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]).resn;
                                struct2SeqHash[mmdbid] += me.utilsCls.residueName2Abbr(resn);

                                struct2CoorHash[mmdbid] = struct2CoorHash[mmdbid].concat(this.getResCoorArray(resid));

                                struct2resid[mmdbid].push(resid);
                            }
                        }
                    }

                    if(!bSelectedBoth) {
                        for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                            struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][j].name;
                            let  resid = chainid + '_' + ic.chainsSeq[chainid][j].resi;

                            struct2CoorHash[mmdbid] = struct2CoorHash[mmdbid].concat(this.getResCoorArray(resid));

                            struct2resid[mmdbid].push(resid);
                        }
                    }

                    let  toStruct = mmdbid_t;
                    let  fromStruct = mmdbid;

                    let  seq1 = struct2SeqHash[toStruct];
                    let  seq2 = struct2SeqHash[fromStruct];

                    let  queryAjax = $.ajax({
                        url: url,
                        type: 'POST',
                        data : {'targets': seq1, 'queries': seq2},
                        dataType: 'jsonp',
                        cache: true
                    });

                    ajaxArray.push(queryAjax);
                }
            }        
        } // for

        if(bPredefined) {
            thisClass.parseChainRealignPredefined(chainidArray, struct2SeqHash, struct2CoorHash, struct2resid);
        }
        else {
            //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
            //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
            $.when.apply(undefined, ajaxArray).then(function() {
                let  dataArray =(chainidArray.length == 2) ? [arguments] : Array.from(arguments);
                thisClass.parseChainRealignData(Array.from(dataArray), chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign);
            })
            .fail(function() {
               alert("The realignment did not work...");
               //thisClass.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign);
            });
        }
    }

    getSeqCoorResid(resiArray, chainid, base) { let  ic = this.icn3d, me = ic.icn3dui;
        let seq = '', coorArray = [], residArray = [];

        for(let j = 0, jl = resiArray.length; j < jl; ++j) {
            if(resiArray[j].indexOf('-') != -1) {
                let  startEnd = resiArray[j].split('-');

                for(let k = parseInt(startEnd[0]); k <= parseInt(startEnd[1]); ++k) {
                    // from VAST neighbor page, use NCBI residue number
                    //if(me.cfg.usepdbnum === false) k += base - 1;

                    let seqIndex = k - base;
                    if(ic.bNCBI) {
                        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[chainid + '_' + k]);
                        if(atom && atom.resiNCBI) seqIndex = atom.resiNCBI - 1;
                    }

                    // don't align solvent or chemicals
                    if(!ic.chainsSeq[chainid] || !ic.chainsSeq[chainid][seqIndex] || me.parasCls.b62ResArray.indexOf(ic.chainsSeq[chainid][seqIndex].name.toUpperCase()) == -1) continue;

                    seq += ic.chainsSeq[chainid][seqIndex].name.toUpperCase();

                    coorArray = coorArray.concat(this.getResCoorArray(chainid + '_' + k));

                    residArray.push(chainid + '_' + k);
                }
            }
            else { // one residue
                let  k = parseInt(resiArray[j]);
                // from VAST neighbor page, use NCBI residue number
                //if(me.cfg.usepdbnum === false) k += base - 1;

                let seqIndex = k - base;
                if(ic.bNCBI) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[chainid + '_' + k]);
                    if(atom && atom.resiNCBI) seqIndex = atom.resiNCBI - 1;
                }

                if(!ic.chainsSeq[chainid][seqIndex]) continue;

                let resCoorArray = this.getResCoorArray(chainid + '_' + k);
                //if(resCoorArray.length == 1 && resCoorArray[0] === undefined) continue;

                seq += ic.chainsSeq[chainid][seqIndex].name.toUpperCase();

                coorArray = coorArray.concat(resCoorArray);

                residArray.push(chainid + '_' + k);
            }
        }

        return {seq: seq, coor: coorArray, resid: residArray};
    }

    getResCoorArray(resid) { let  ic = this.icn3d, me = ic.icn3dui;
        let struct2CoorArray = [];

        let  bFound = false;
        for(let serial in ic.residues[resid]) {
            let  atom = ic.atoms[serial];
            if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
              ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                struct2CoorArray.push(atom.coord.clone());
                bFound = true;
                break;
            }
        }
        if(!bFound) struct2CoorArray.push(undefined);

        return struct2CoorArray;
    }
}

export {RealignParser}
