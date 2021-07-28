/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */


import {Html} from '../../html/html.js';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Selection} from '../selection/selection.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {Analysis} from '../analysis/analysis.js';
import {Draw} from '../display/draw.js';

class HlSeq {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    selectSequenceNonMobile() { let ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      let thisClass = this;
      $("#" + ic.pre + "dl_sequence2").add("[id^=" + ic.pre + "dt_giseq]").add("[id^=" + ic.pre + "dt_custom]").add("[id^=" + ic.pre + "dt_site]").add("[id^=" + ic.pre + "dt_snp]").add("[id^=" + ic.pre + "dt_clinvar]").add("[id^=" + ic.pre + "dt_cdd]").add("[id^=" + ic.pre + "dt_domain]").add("[id^=" + ic.pre + "dt_interaction]").add("[id^=" + ic.pre + "dt_ssbond]").add("[id^=" + ic.pre + "dt_crosslink]").add("[id^=" + ic.pre + "dt_transmem]")
      .add("[id^=" + ic.pre + "tt_giseq]").add("[id^=" + ic.pre + "tt_custom]").add("[id^=" + ic.pre + "tt_site]").add("[id^=" + ic.pre + "tt_snp]").add("[id^=" + ic.pre + "tt_clinvar]").add("[id^=" + ic.pre + "tt_cdd]").add("[id^=" + ic.pre + "tt_domain]").add("[id^=" + ic.pre + "tt_interaction]").add("[id^=" + ic.pre + "tt_ssbond]").add("[id^=" + ic.pre + "tt_crosslink]").add("[id^=" + ic.pre + "tt_transmem]")
      .selectable({
          stop: function() { let ic = thisClass.icn3d;
              if($(this).attr('id') === ic.pre + "dl_sequence2") {
                  ic.bAlignSeq = true;
                  ic.bAnnotations = false;
              }
              //else if($(this).attr('id') === ic.pre + "dl_annotations") {
              else {
                  ic.bAlignSeq = false;
                  ic.bAnnotations = true;
              }

              if(ic.bSelectResidue === false && !ic.bShift && !ic.bCtrl) {
                  ic.selectionCls.removeSelection();
              }

              // select residues
              $("span.ui-selected", this).each(function() {
                  let id = $(this).attr('id');

                  if(id !== undefined) {
                     thisClass.selectResidues(id, this);
                 }
              });

              //ic.residueLabelsCls.addResidueLabels(ic.hAtoms, false, 0.5);
              ic.hlObjectsCls.addHlObjects();  // render() is called

              // get all chainid in the selected residues
              let chainHash = {}
              for(let residueid in ic.selectedResidues) {
                  let pos = residueid.lastIndexOf('_');
                  let chainid = residueid.substr(0, pos);

                  chainHash[chainid] = 1;
              }

              // highlight the nodes
              let chainArray2d = Object.keys(chainHash);
              ic.hlUpdateCls.updateHl2D(chainArray2d);

              // select annotation title
              //$("#" + ic.pre + "dl_selectannotations div.ui-selected", this).each(function() {
              $("div.ui-selected", this).each(function() {
                  if($(this).attr('chain') !== undefined) {

                      thisClass.selectTitle(this);
                  }
              });
          }
      });

      $("[id^=" + ic.pre + "ov_giseq]").add("[id^=" + ic.pre + "ov_custom]").add("[id^=" + ic.pre + "ov_site]").add("[id^=" + ic.pre + "ov_snp]").add("[id^=" + ic.pre + "ov_clinvar]").add("[id^=" + ic.pre + "ov_cdd]").add("[id^=" + ic.pre + "ov_domain]").add("[id^=" + ic.pre + "ov_interaction]").add("[id^=" + ic.pre + "ov_ssbond]").add("[id^=" + ic.pre + "ov_crosslink]").add("[id^=" + ic.pre + "ov_transmem]")
      .add("[id^=" + ic.pre + "tt_giseq]").add("[id^=" + ic.pre + "tt_custom]").add("[id^=" + ic.pre + "tt_site]").add("[id^=" + ic.pre + "tt_snp]").add("[id^=" + ic.pre + "tt_clinvar]").add("[id^=" + ic.pre + "tt_cdd]").add("[id^=" + ic.pre + "tt_domain]").add("[id^=" + ic.pre + "tt_interaction]").add("[id^=" + ic.pre + "tt_ssbond]").add("[id^=" + ic.pre + "tt_crosslink]").add("[id^=" + ic.pre + "tt_transmem]")
      .on('click', '.icn3d-seqTitle', function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();

          ic.bAlignSeq = false;
          ic.bAnnotations = true;

          // select annotation title
          //$("div .ui-selected", this).each(function() {
              thisClass.selectTitle(this);

              ic.hlUpdateCls.hlSummaryDomain3ddomain(this);
           //});

            // remove possible text selection
            if(window.getSelection) {
              if(window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
              } else if(window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
              }
            } else if(document.selection) {  // IE?
              document.selection.empty();
            }
      });
    }

    selectSequenceMobile() { let ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      let thisClass = this;

      $("#" + ic.pre + "dl_sequence2").add("[id^=" + ic.pre + "giseq]").add("[id^=" + ic.pre + "custom]").add("[id^=" + ic.pre + "site]").add("[id^=" + ic.pre + "clinvar]").add("[id^=" + ic.pre + "snp]").add("[id^=" + ic.pre + "cdd]").add("[id^=" + ic.pre + "domain]").add("[id^=" + ic.pre + "interaction]").add("[id^=" + ic.pre + "ssbond]").add("[id^=" + ic.pre + "crosslink]").add("[id^=" + ic.pre + "transmem]").on('click', '.icn3d-residue', function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();

          if($(this).attr('id') === ic.pre + "dl_sequence2") {
              ic.bAlignSeq = true;
              ic.bAnnotations = false;
          }
          //else if($(this).attr('id') === ic.pre + "dl_annotations") {
          else {
              ic.bAlignSeq = false;
              ic.bAnnotations = true;
          }

          // select residues
          //$("span.ui-selected", this).each(function() {
              let id = $(this).attr('id');

              if(id !== undefined) {
                   thisClass.selectResidues(id, this);
             }
          //});

          //ic.residueLabelsCls.addResidueLabels(ic.hAtoms, false, 0.5);
           ic.hlObjectsCls.addHlObjects();  // render() is called

          // get all chainid in the selected residues
          let chainHash = {}
          for(let residueid in ic.selectedResidues) {
              let pos = residueid.lastIndexOf('_');
              let chainid = residueid.substr(0, pos);

              chainHash[chainid] = 1;
          }

          // clear nodes in 2d dgm
          ic.hlUpdateCls.removeHl2D();

          // highlight the nodes
          let chainArray2d = Object.keys(chainHash);
          ic.hlUpdateCls.updateHl2D(chainArray2d);
      });
    }

    selectChainMobile() { let ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      let thisClass = this;

      $("#" + ic.pre + "dl_sequence2").add("[id^=" + ic.pre + "giseq]").add("[id^=" + ic.pre + "custom]").add("[id^=" + ic.pre + "site]").add("[id^=" + ic.pre + "feat]").add("[id^=" + ic.pre + "clinvar]").add("[id^=" + ic.pre + "snp]").add("[id^=" + ic.pre + "cdd]").add("[id^=" + ic.pre + "domain]").add("[id^=" + ic.pre + "interaction]").add("[id^=" + ic.pre + "ssbond]").add("[id^=" + ic.pre + "crosslink]").add("[id^=" + ic.pre + "transmem]").on('click', '.icn3d-seqTitle', function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();

          if($(this).attr('id') === ic.pre + "dl_sequence2") {
              ic.bAlignSeq = true;
              ic.bAnnotations = false;
          }
          //else if($(this).attr('id') === ic.pre + "dl_annotations") {
          else {
              ic.bAlignSeq = false;
              ic.bAnnotations = true;
          }

          // select annotation title
          //$("div.ui-selected", this).each(function() {
              thisClass.selectTitle(this);

              ic.hlUpdateCls.hlSummaryDomain3ddomain(this);
          //});
      });
    }

    selectTitle(that) { let ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      if($(that).hasClass('icn3d-seqTitle')) {
        let chainid = $(that).attr('chain');

        if(ic.bAlignSeq) {
            ic.bSelectAlignResidue = false;
        }
        else {
            ic.bSelectResidue = false;
        }

        if(!ic.bAnnotations) {
            ic.hlUpdateCls.removeSeqChainBkgd(chainid);
        }
        //else {
        //    ic.hlUpdateCls.removeSeqChainBkgd();
        //}

        if(!ic.bCtrl && !ic.bShift) {
            ic.hlUpdateCls.removeSeqResidueBkgd();

            ic.hlUpdateCls.removeSeqChainBkgd();

            ic.currSelectedSets = [];
        }

        $(that).toggleClass('icn3d-highlightSeq');

        let commandname, commanddescr, position;
        if(!ic.bAnnotations) {
            if(ic.bAlignSeq) {
                commandname = "align_" + chainid;
            }
            else {
                commandname = chainid;
            }
        }
        else {
            commandname = $(that).attr('setname');
            commanddescr = $(that).attr('title');
        }

        if($(that).hasClass('icn3d-highlightSeq')) {
            if(!ic.bAnnotations) {
                if(ic.bCtrl || ic.bShift) {
                    ic.currSelectedSets.push(commandname);
                    ic.selectionCls.selectAChain(chainid, commandname, true, true);
                }
                else {
                    ic.currSelectedSets = [commandname];
                    ic.selectionCls.selectAChain(chainid, commandname, true);
                }

                if(ic.bAlignSeq) {
                    ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select alignChain ' + chainid, true);
                }
                else {
                    ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select chain ' + chainid, true);
                }

                let setNames = ic.currSelectedSets.join(' or ');
                //if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select saved atoms ' + setNames, true);
                if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select sets ' + setNames, true);
            }
            else {
                if($(that).hasClass('icn3d-highlightSeq')) {
                    ic.hlUpdateCls.removeHl2D();

                    if($(that).attr('gi') !== undefined) {
                        if(ic.bCtrl || ic.bShift) {
                            ic.currSelectedSets.push(chainid);
                            ic.selectionCls.selectAChain(chainid, chainid, false, true);
                        }
                        else {
                            ic.currSelectedSets = [chainid];
                            ic.selectionCls.selectAChain(chainid, chainid, false);
                        }

                        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select chain ' + chainid, true);

                        let setNames = ic.currSelectedSets.join(' or ');
                        //if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select saved atoms ' + setNames, true);
                        if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select sets ' + setNames, true);
                    }
                    else {
                        let residueidHash = {}
                        if($(that).attr('domain') !== undefined || $(that).attr('feat') !== undefined || $(that).attr('3ddomain') !== undefined || $(that).attr('custom') !== undefined) {
                            ic.hlUpdateCls.hlSummaryDomain3ddomain(that);

                            let fromArray = $(that).attr('from').split(',');
                            let toArray = $(that).attr('to').split(',');

                            // protein chains
                            let residueid;
                            for(let i = 0, il = fromArray.length; i < il; ++i) {
                                let from = parseInt(fromArray[i]);
                                let to = parseInt(toArray[i]);

                                for(let j = from; j <= to; ++j) {
                                    residueid = chainid + '_' +(j+1).toString();
                                    residueidHash[residueid] = 1;

                                    //atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueid]);
                                }
                            }

                            if(ic.bCtrl || ic.bShift) {
                                ic.selectionCls.selectResidueList(residueidHash, commandname, commanddescr, true);
                            }
                            else {
                                ic.selectionCls.selectResidueList(residueidHash, commandname, commanddescr, false);
                            }

                            //ic.hlUpdateCls.updateHlAll();

                            residueid = chainid + '_' + parseInt((from + to)/2).toString();
                            //residueid = chainid + '_' + from.toString();
                            position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                        }
                        //else if($(that).attr('site') !== undefined || $(that).attr('clinvar') !== undefined) {
                        else if($(that).attr('posarray') !== undefined) {
                            let posArray = $(that).attr('posarray').split(',');
                            //ic.hAtoms = {}

                            //removeAllLabels();

                            //var  atomHash = {}, residueidHash = {}
                            let residueid;
                            for(let i = 0, il = posArray.length; i < il; ++i) {
                                if($(that).attr('site') !== undefined) {
                                    residueid = chainid + '_' +(parseInt(posArray[i])+1).toString();
                                }
                                //else if($(that).attr('clinvar') !== undefined) {
                                else {
                                    residueid = chainid + '_' + posArray[i];
                                }

                                residueidHash[residueid] = 1;
                                //atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueid]);
                            }

                            if(ic.bCtrl || ic.bShift) {
                                ic.selectionCls.selectResidueList(residueidHash, commandname, commanddescr, true);
                            }
                            else {
                                ic.selectionCls.selectResidueList(residueidHash, commandname, commanddescr, false);
                            }

                            residueid = chainid + '_' + posArray[parseInt((0 + posArray.length)/2)].toString();
                            //residueid = chainid + '_' + posArray[0].toString();
                            position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                        }

                        //removeAllLabels
                        for(let name in ic.labels) {
                            if(name !== 'schematic' && name !== 'distance') {
                               ic.labels[name] = [];
                            }
                        }

                        //var size = parseInt(ic.LABELSIZE * 10 / commandname.length);
                        let size = ic.LABELSIZE;
                        let color = "FFFF00";
                        if(position !== undefined) ic.analysisCls.addLabel(commanddescr, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');

                        ic.drawCls.draw();

                        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(residueidHash)) + ' | name ' + commandname, true);

                        if(ic.bCtrl || ic.bShift) {
                            ic.currSelectedSets.push(commandname);
                        }
                        else {
                            ic.currSelectedSets = [commandname];
                        }

                        let setNames = ic.currSelectedSets.join(' or ');
                        //if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select saved atoms ' + setNames, true);
                        if(ic.currSelectedSets.length > 1) ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select sets ' + setNames, true);
                    } // if($(that).attr('gi') !== undefined) {
                } // if($(that).hasClass('icn3d-highlightSeq')) {
            } // if(!ic.bAnnotations) {
        } // if($(that).hasClass('icn3d-highlightSeq')) {
        else {
            ic.hlObjectsCls.removeHlObjects();
            ic.hlUpdateCls.removeHl2D();

           $("#" + ic.pre + "atomsCustom").val("");
        }

      }
    }

    selectResidues(id, that) { let ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      if(id !== undefined && id !== '') {
        // add "align_" in front of id so that full sequence and aligned sequence will not conflict
        //if(id.substr(0, 5) === 'align') id = id.substr(5);

        // seq_div0_1TSR_A_1, align_div0..., giseq_div0..., snp_div0..., interaction_div0..., cddsite_div0..., domain_div0...
        id = id.substr(id.indexOf('_') + 1);

        ic.bSelectResidue = true;

        $(that).toggleClass('icn3d-highlightSeq');

        let residueid = id.substr(id.indexOf('_') + 1);

        if(ic.residues.hasOwnProperty(residueid)) {
            if($(that).hasClass('icn3d-highlightSeq')) {
              for(let j in ic.residues[residueid]) {
                ic.hAtoms[j] = 1;
              }

              ic.selectedResidues[residueid] = 1;

              if(ic.bAnnotations && $(that).attr('disease') !== undefined) {
                  let label = $(that).attr('disease');

                  let position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                  //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit

                  let maxlen = 15;
                  if(label.length > maxlen) label = label.substr(0, maxlen) + '...';

                  //var size = parseInt(ic.LABELSIZE * 10 / label.length);
                  let size = ic.LABELSIZE;
                  let color = ic.icn3dui.htmlCls.GREYD;
                  ic.analysisCls.addLabel(label, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');
              }
            }
            else {
                for(let i in ic.residues[residueid]) {
                  //ic.hAtoms[i] = undefined;
                  delete ic.hAtoms[i];
                }
                //ic.selectedResidues[residueid] = undefined;
                delete ic.selectedResidues[residueid];

                ic.hlObjectsCls.removeHlObjects();
            }
        }
      }
    }
}

export {HlSeq}
