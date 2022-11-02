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

    // realign, residue by residue
    realign() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.selectionCls.saveSelectionPrep();

        let  index = Object.keys(ic.defNames2Atoms).length;
        let  name = 'alseq_' + index;

        ic.selectionCls.saveSelection(name, name);

        me.htmlCls.clickMenuCls.setLogCmd("realign", true);

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

        let chainidArray = [];
        ic.qt_start_end = []; // reset the alignment

        chainidArray.push(struct2chain[toStruct]);
        for(let i = 1, il = structArray.length; i < il; ++i) {
            let  fromStruct = structArray[i];

            // transform from the second structure to the first structure
            let  coordsFrom = structHash[fromStruct];
            let  coordsTo = structHash[toStruct];

            let  bKeepSeq = true;
            //ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq);
            ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq, struct2chain[toStruct], struct2chain[fromStruct]);
            chainidArray.push(struct2chain[fromStruct]);
        }

        // align seq
        //ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray, undefined, true);
        ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray);

        name = 'protein_aligned';
        ic.selectionCls.saveSelection(name, name);
      
        ic.transformCls.zoominSelection();

        ic.hlUpdateCls.updateHlAll();
    }

    parseChainRealignPredefined(chainidArray, struct2SeqHash, struct2CoorHash, struct2resid) { let  ic = this.icn3d, me = ic.icn3dui;
      let  bRealign = true; //undefined;

      let  toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')); //.toUpperCase();
      if(!bRealign) toStruct = toStruct.toUpperCase();

      let  hAtoms = {}, rmsd;

      ic.realignResid = {}

      ic.opts['color'] = 'grey';
      ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);
      
      for(let index = 0, indexl = chainidArray.length - 1; index < indexl; ++index) {         
          let  fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')); //.toUpperCase();
          if(!bRealign) fromStruct = fromStruct.toUpperCase();

          //if(toStruct == fromStruct) fromStruct += me.htmlCls.postfix;

          let  chainTo = toStruct + chainidArray[0].substr(chainidArray[0].indexOf('_'));
          let  chainFrom = fromStruct + chainidArray[index + 1].substr(chainidArray[index + 1].indexOf('_'));

          chainidArray[0] = chainTo;
          chainidArray[index + 1] = chainFrom;

          let chainpair =  chainTo + ',' + chainFrom;

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

          let  bChainAlign = true;
          // set ic.qt_start_end in alignCoords()

          let  result = ic.ParserUtilsCls.alignCoords(coord2, coord1, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
          hAtoms = me.hashUtilsCls.unionHash(hAtoms, result.hAtoms);
          rmsd = parseFloat(result.rmsd);
      }

      // If rmsd from vastsrv is too large, realign the chains
      if(me.cfg.chainalign && !me.cfg.usepdbnum && me.cfg.resdef && rmsd > 5) {      
        let nameArray = me.cfg.chainalign.split(',');
        if(nameArray.length > 0) {
            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        }

        me.cfg.aligntool = 'tmalign';

        ic.realignParserCls.realignOnStructAlign();
        // if(nameArray.length > 0) {
        //     me.htmlCls.clickMenuCls.setLogCmd("realign on tmalign | " + nameArray, true);
        // }
        // else {
        //     me.htmlCls.clickMenuCls.setLogCmd("realign on tmalign", true);
        // }
      }
      else {
        // align seq
        //ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray, undefined, true);
        ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray);

        ic.transformCls.zoominSelection();

        ic.chainalignParserCls.downloadChainalignmentPart3(undefined, chainidArray, ic.hAtoms);
      }
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

          //if(toStruct == fromStruct) fromStruct += me.htmlCls.postfix;

          let  chainTo = toStruct + chainidArray[0].substr(chainidArray[0].indexOf('_'));
          let  chainFrom = fromStruct + chainidArray[index + 1].substr(chainidArray[index + 1].indexOf('_'));

          chainidArray[0] = chainTo;
          chainidArray[index + 1] = chainFrom;

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

              //let  chainTo = chainidArray[0];
              //let  chainFrom = chainidArray[index + 1];

              let  bChainAlign = true;
              let  result = ic.ParserUtilsCls.alignCoords(coordsFrom, coordsTo, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
              hAtoms = me.hashUtilsCls.unionHash(hAtoms, result.hAtoms);

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
        // align seq
        //ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray, undefined, bRealign);
        ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray);
        let name = 'protein_aligned';
        ic.selectionCls.saveSelection(name, name);

        if(ic.bAfMem) {
            ic.selectionCls.selectAll_base();

            ic.opts['chemicals'] = 'stick';  
            ic.opts['color'] = 'structure';

            ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        }
        else {
            ic.transformCls.zoominSelection();

            ic.dAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms); //hAtoms;
    
            ic.opts['color'] = 'identity';

            ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
        }

        ic.drawCls.draw();
        ic.hlUpdateCls.updateHlAll();

        if(ic.bAfMem) {
            let  axis = new THREE.Vector3(1,0,0);
            let  angle = -90 / 180.0 * Math.PI;

            ic.transformCls.setRotation(axis, angle);
        }
               
        if(ic.deferredRealign !== undefined) ic.deferredRealign.resolve();
      }
      else {
        // align seq
        ic.hAtoms = ic.chainalignParserCls.setMsa(chainidArray);
        
        ic.transformCls.zoominSelection();

        ic.chainalignParserCls.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, ic.hAtoms);
      }
    }

    realignOnSeqAlign(pdbidTemplate) { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainidHash = ic.firstAtomObjCls.getChainsFromAtoms(ic.hAtoms);

        let  chainidArrayTmp = Object.keys(chainidHash);
        let  chainidArray = [];

        let  prevChainid = '';
        for(let i = 0, il = chainidArrayTmp.length; i < il; ++i) {
            if(chainidArrayTmp[i] != prevChainid) chainidArray.push(chainidArrayTmp[i]);
            prevChainid = chainidArrayTmp[i];
        }
        
        // use the model from Membranome as template
        if(ic.bAfMem && chainidArray.length == 2) {
            if(chainidArray[1].split('_')[0] == pdbidTemplate) {
                let tmp = chainidArray[0];
                chainidArray[0] = chainidArray[1]; 
                chainidArray[1] = tmp;
            }
        }
        
        let  bRealign = true;
        ic.qt_start_end = []; // reset the alignment

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
        let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";

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

                        let alignAjax;

                        if(me.cfg.aligntool != 'tmalign') {
                            let jsonStr_t = ic.domain3dCls.getDomainJsonForAlign(struct2domain[struct1][chainid1]);
                            let jsonStr_q = ic.domain3dCls.getDomainJsonForAlign(struct2domain[struct2][chainid2]);
                        
                            alignAjax = $.ajax({
                                url: urlalign,
                                type: 'POST',
                                data: {'domains1': jsonStr_q, 'domains2': jsonStr_t},
                                dataType: 'jsonp',
                                cache: true
                            });
                        }
                        else {
                            let pdb_target = ic.saveFileCls.getAtomPDB(struct2domain[struct1][chainid1], undefined, undefined, undefined, undefined, struct1);
                            let pdb_query = ic.saveFileCls.getAtomPDB(struct2domain[struct2][chainid2], undefined, undefined, undefined, undefined, struct2);
  
                            // let pdb_target = ic.saveFileCls.getAtomPDB(ic.chains[chainid1], undefined, undefined, undefined, undefined, struct1);
                            // let pdb_query = ic.saveFileCls.getAtomPDB(ic.chains[chainid2], undefined, undefined, undefined, undefined, struct2);
    
                            alignAjax = $.ajax({
                                url: urltmalign,
                                type: 'POST',
                                data: {'pdb_query': pdb_query, 'pdb_target': pdb_target},
                                dataType: 'jsonp',
                                cache: true
                            });                            
                        }

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
            ic.qt_start_end = []; // reset the alignment
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
                //mmdbid += me.htmlCls.postfix;
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
                    let hAtoms = {};

                    predefinedResPair = predefinedResArray[i - 1].split(' | ');

                    let chainidpair = chainid_t + ',' + chainid;
                    if(!struct2SeqHash[chainidpair]) struct2SeqHash[chainidpair] = {};
                    if(!struct2CoorHash[chainidpair]) struct2CoorHash[chainidpair] = {};
                    if(!struct2resid[chainidpair]) struct2resid[chainidpair] = {};

                    // master
                    resiArray = predefinedResPair[0].split(",");        
                    result = thisClass.getSeqCoorResid(resiArray, chainid_t, base_t);

                    hAtoms = me.hashUtilsCls.unionHash(hAtoms, result.hAtoms);

                    if(!struct2SeqHash[chainidpair][mmdbid_t]) struct2SeqHash[chainidpair][mmdbid_t] = '';
                    if(!struct2CoorHash[chainidpair][mmdbid_t]) struct2CoorHash[chainidpair][mmdbid_t] = [];
                    if(!struct2resid[chainidpair][mmdbid_t]) struct2resid[chainidpair][mmdbid_t] = [];

                    struct2SeqHash[chainidpair][mmdbid_t] += result.seq;
                    struct2CoorHash[chainidpair][mmdbid_t] = struct2CoorHash[chainidpair][mmdbid_t].concat(result.coor);
                    struct2resid[chainidpair][mmdbid_t] = struct2resid[chainidpair][mmdbid_t].concat(result.resid);

                    // slave
                    resiArray = predefinedResPair[1].split(",");
                    result = thisClass.getSeqCoorResid(resiArray, chainid, base); 
                    hAtoms = me.hashUtilsCls.unionHash(hAtoms, result.hAtoms);

                    if(!struct2SeqHash[chainidpair][mmdbid]) struct2SeqHash[chainidpair][mmdbid] = '';
                    if(!struct2CoorHash[chainidpair][mmdbid]) struct2CoorHash[chainidpair][mmdbid] = [];
                    if(!struct2resid[chainidpair][mmdbid]) struct2resid[chainidpair][mmdbid] = [];

                    struct2SeqHash[chainidpair][mmdbid] += result.seq;
                    struct2CoorHash[chainidpair][mmdbid] = struct2CoorHash[chainidpair][mmdbid].concat(result.coor);
                    struct2resid[chainidpair][mmdbid] = struct2resid[chainidpair][mmdbid].concat(result.resid);

                    // let  residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(hAtoms);
                    // let  residueArray = Object.keys(residueHash);
        
                    // let  commandname = chainidpair;
                    // let  commanddescr = 'aligned ' + chainidpair;
                    // let  select = "select " + ic.resid2specCls.residueids2spec(residueArray);
        
                    // ic.selectionCls.addCustomSelection(residueArray, commandname, commanddescr, select, true);
        
                    // me.htmlCls.clickMenuCls.setLogCmd(select + " | name " + commandname, true);
                    // me.htmlCls.clickMenuCls.setLogCmd("realign", true);
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

                //if(ic.deferredAfMem !== undefined) ic.deferredAfMem.resolve();
                if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();
                if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
            })
            .fail(function() {
                alert("The realignment did not work...");
                //if(ic.deferredAfMem !== undefined) ic.deferredAfMem.resolve();
                if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();
                if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();

                return;
               //thisClass.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid, bRealign);
            });
        }
    }

    getSeqCoorResid(resiArray, chainid, base) { let  ic = this.icn3d, me = ic.icn3dui;
        let seq = '', coorArray = [], residArray = [];
        let hAtoms = {};

        for(let j = 0, jl = resiArray.length; j < jl; ++j) {
            if(resiArray[j].indexOf('-') != -1) {
                let  startEnd = resiArray[j].split('-');

                for(let k = parseInt(startEnd[0]); k <= parseInt(startEnd[1]); ++k) {
                    // from VAST neighbor page, use NCBI residue number
                    //if(me.cfg.usepdbnum === false) k += base - 1;

                    //let seqIndex = k - base;
                    let seqIndex = ic.setSeqAlignCls.getPosFromResi(chainid, k);

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

                //let seqIndex = k - base;
                let seqIndex = ic.setSeqAlignCls.getPosFromResi(chainid, k);

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

        for(let i = 0, il = residArray.length; i < il; ++i) {
            hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[residArray[i]]);
        }

        return {seq: seq, coor: coorArray, resid: residArray, hAtoms: hAtoms};
    }

    getResCoorArray(resid) { let  ic = this.icn3d, me = ic.icn3dui;
        let struct2CoorArray = [];

        let  bFound = false;
        for(let serial in ic.residues[resid]) {
            let  atom = ic.atoms[serial];

            //if((ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
            //  ||(ic.nucleotides.hasOwnProperty(serial) &&(atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
            if((atom.name == "CA" && atom.elem == "C")
              ||((atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
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
