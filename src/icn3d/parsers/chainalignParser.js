/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Html} from '../../html/html.js';

import {MmdbParser} from '../parsers/mmdbParser.js';
import {RealignParser} from '../parsers/realignParser.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {Selection} from '../selection/selection.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {LoadPDB} from '../parsers/loadPDB.js';

class ChainalignParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    downloadChainalignmentPart2(data1, data2Array, chainresiCalphaHash2, chainidArray) { var ic = this.icn3d, me = ic.icn3dui;
        //ic.interactionData_q = [];
        //ic.mmdb_data_q = [];

        var hAtoms = {}
        hAtoms = ic.mmdbParserCls.parseMmdbData(data1, 'target', chainidArray[0], 0);

        var bLastQuery = false;
        for(var i = 0, il = data2Array.length; i < il; ++i) {
            if(i == data2Array.length - 1) bLastQuery = true;
            // each alignment has a chainIndex i
            var hAtomsTmp = ic.mmdbParserCls.parseMmdbData(data2Array[i], 'query', chainidArray[i + 1], i, bLastQuery);
            hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
        }

        if(ic.icn3dui.cfg.resnum) {
            ic.realignParserCls.realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray);
        }
        else if(ic.icn3dui.cfg.resdef) {
            ic.realignParserCls.realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray, undefined, true);
        }
        else {
            this.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms);
        }
    }

    downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms) { var ic = this.icn3d, me = ic.icn3dui;
        // select all
        var allAtoms = {}
        for(var i in ic.atoms) {
            allAtoms[i] = 1;
        }
        ic.dAtoms = allAtoms;
        ic.hAtoms = allAtoms;

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // change the default color to "Identity"

        ic.opts['color'] = 'identity';
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        // memebrane is determined by one structure. But transform both structures
        if(chainresiCalphaHash2 !== undefined) ic.ParserUtilsCls.transformToOpmOriForAlign(ic.selectedPdbid, chainresiCalphaHash2, true);

        ic.dAtoms = hAtoms;
        ic.hAtoms = hAtoms;

        ic.ParserUtilsCls.renderStructure();

        if(ic.chainidArray.length > 2) {
            var residuesHash = {}
            for(var i in hAtoms) {
                var atom = ic.atoms[i];
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residuesHash[resid] = 1;
            }

            var commandname = 'protein_aligned';
            var commanddescr = 'protein aligned';
            var select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));

            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
        }

        ic.hlUpdateCls.updateHlAll();

        if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

        ic.html2ddgm = '';

        // by default, open the seq alignment window
        //if(ic.icn3dui.cfg.show2d !== undefined && ic.icn3dui.cfg.show2d) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
        if(ic.icn3dui.cfg.showalignseq) {
            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        }

        if(ic.icn3dui.cfg.show2d && ic.bFullUi) {
            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
            if(ic.bFullUi) {
                if(!ic.bChainAlign) {
                    ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
                }
                else {
                    //ic.ParserUtilsCls.set2DDiagramsForAlign(ic.inputid2.toUpperCase(), ic.inputid.toUpperCase());
                    ic.ParserUtilsCls.set2DDiagramsForChainalign(chainidArray);
                }
            }
        }

        //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    downloadChainalignment(chainalign, resnum, resdef) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        ic.opts['proteins'] = 'c alpha trace';

        var alignArray = chainalign.split(',');

        for(var i = 0, il = alignArray.length; i < il; ++i) {
            var chainid = alignArray[i];
            var pos = chainid.indexOf('_');
            alignArray[i] = chainid.substr(0, pos).toUpperCase() + chainid.substr(pos);
        }

        ic.chainidArray = alignArray;

        var pos1 = alignArray[0].indexOf('_');
        ic.mmdbid_t = alignArray[0].substr(0, pos1).toUpperCase();
        ic.chain_t = alignArray[0].substr(pos1+1);
        var url_t = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + ic.mmdbid_t;
        if(ic.icn3dui.cfg.inpara !== undefined) url_t += ic.icn3dui.cfg.inpara;

        var ajaxArray = [];
        var targetAjax = $.ajax({
          url: url_t,
          dataType: 'jsonp',
          cache: true
        });

        ajaxArray.push(targetAjax);

        ic.ParserUtilsCls.setYourNote(chainalign.toUpperCase() + ' in iCn3D');
        ic.bCid = undefined;
        // define for 'align' only
        ic.pdbid_chain2title = {}
        if(ic.chainids2resids === undefined) ic.chainids2resids = {} // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

        for(var index = 1, indexLen = alignArray.length; index < indexLen; ++index) {
            var pos2 = alignArray[index].indexOf('_');
            ic.mmdbid_q = alignArray[index].substr(0, pos2).toUpperCase();
            ic.chain_q = alignArray[index].substr(pos2+1);

            var chainalignFinal = ic.mmdbid_q + "_" + ic.chain_q + "," + ic.mmdbid_t + "_" + ic.chain_t;

            var urlalign = ic.icn3dui.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainpairs=" + chainalignFinal;
            var url_q = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + ic.mmdbid_q;

            if(ic.icn3dui.cfg.inpara !== undefined) url_q += ic.icn3dui.cfg.inpara;

            var queryAjax = $.ajax({
              url: url_q,
              dataType: 'jsonp',
              cache: true
            });

            ajaxArray.push(queryAjax);

            if(!ic.icn3dui.cfg.resnum && !ic.icn3dui.cfg.resdef) {
                var alignAjax = $.ajax({
                  url: urlalign,
                  dataType: 'jsonp',
                  cache: true
                });

                ajaxArray.push(alignAjax);
            }
        }

        //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
        //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
        $.when.apply(undefined, ajaxArray).then(function() {
          thisClass.parseChainAlignData(arguments, alignArray, ic.mmdbid_t, ic.chain_t);
        });
//        .fail(function() {
//          thisClass.parseChainAlignData(arguments, alignArray, ic.mmdbid_t, ic.chain_t);
//        });
    }

    parseChainAlignData(data, chainidArray, mmdbid_t, chain_t) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        var dataArray =(chainidArray.length == 1) ? [data] : data;

        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        //var data2 = v2[0];
        // index = 0: the mmdb data of target
        var targetData = dataArray[0][0];

        ic.t_trans_add = [];
        ic.q_trans_sub = [];
        ic.q_rotation = [];
        ic.qt_start_end = [];

        ic.mmdbidArray = [];
        ic.mmdbidArray.push(mmdbid_t);

        var queryDataArray = [];

        var step =(ic.icn3dui.cfg.resnum || ic.icn3dui.cfg.resdef) ? 1 : 2;

        for(var index = 1, indexl = dataArray.length; index < indexl; index += step) {
            var queryData = dataArray[index][0];

            var index2 = parseInt(index / step);
            var pos2 = chainidArray[index2].indexOf('_');
            var mmdbid_q = chainidArray[index2].substr(0, pos2).toUpperCase();
            var chain_q = chainidArray[index2].substr(pos2+1);

            if(ic.icn3dui.cfg.resnum || ic.icn3dui.cfg.resdef) {
                if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                  ) {
                    ic.mmdbidArray.push(mmdbid_q);

                    queryDataArray.push(queryData);
                }
            }
            else {
                var align = dataArray[index + 1][0];

                if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                    && align !== undefined && JSON.stringify(align).indexOf('Oops there was a problem') === -1
                  ) {
                    if((align === undefined || align.length == 0) && mmdbid_q == mmdbid_t && chain_q == chain_t) {
                        ic.t_trans_add.push({"x":0, "y":0, "z":0});
                        ic.q_trans_sub.push({"x":0, "y":0, "z":0});
                        ic.q_rotation.push({"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1});
                        ic.qt_start_end.push(undefined);
                    }
                    else if(align === undefined || align.length == 0) {
                        if(!ic.icn3dui.cfg.command) alert('These two chains ' + chainidArray[index2] + ' can not align to each other. ' + 'Please select sequences from these two chains in the "Sequences & Annotations" window, ' + 'and click "Realign Selection" in the "File" menu to align your selection.');

                        ic.icn3dui.cfg.showanno = 1;
                        ic.icn3dui.cfg.showalignseq = 0;
                    }
                    else {
                        ic.t_trans_add.push(align[0].t_trans_add);
                        ic.q_trans_sub.push(align[0].q_trans_sub);
                        ic.q_rotation.push(align[0].q_rotation);
                        ic.qt_start_end.push(align[0].segs);
                    }

                    ic.mmdbidArray.push(mmdbid_q);

                    queryDataArray.push(queryData);
                }
            }
        }

        ic.mmdb_data_q = queryDataArray;

        this.loadOpmDataForChainalign(targetData, queryDataArray, chainidArray, ic.mmdbidArray);
    }

    loadOpmDataForChainalign(data1, data2, chainidArray, mmdbidArray) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        if(ic.icn3dui.cfg.resnum || ic.icn3dui.cfg.resdef) {
            if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
            this.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

            if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
        }
        else {
            var url = ic.icn3dui.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?mmdbids2opm=" + mmdbidArray.join("','");

            $.ajax({
              url: url,
              dataType: 'jsonp',
              cache: true,
              //tryCount : 0,
              //retryLimit : 1,
              success: function(data) {
                var mmdbid = data.mmdbid;
                ic.selectedPdbid = mmdbid;

                if(!mmdbid) {
                  if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                  thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                  if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                }
                else {
                    var url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbid.toLowerCase()+ ".pdb";
                    $.ajax({
                      url: url2,
                      dataType: 'text',
                      cache: true,
                      //tryCount : 0,
                      //retryLimit : 1,
                      success: function(opmdata) {
                          ic.bOpm = true;
                          var bVector = true;
                          var chainresiCalphaHash = ic.loadPDBCls.loadPDB(opmdata, mmdbid, ic.bOpm, bVector); // defined in the core library

                          $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
                          $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

                          $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
                          $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

                          if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                          thisClass.downloadChainalignmentPart2(data1, data2, chainresiCalphaHash, chainidArray);

                          if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                      },
                      error : function(xhr, textStatus, errorThrown ) {
                          if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                          thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                          if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                          return;
                      }
                    });
                }
              },
              error : function(xhr, textStatus, errorThrown ) {
                  if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                  thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                  if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                  return;
              }
            });
        }
    }
}

export {ChainalignParser}
