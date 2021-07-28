/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {MmcifParser} from '../parsers/mmcifParser.js';
import {Annotation} from '../annotations/annotation.js';
import {AnnoCddSite} from '../annotations/annoCddSite.js';
import {ShowSeq} from '../annotations/showSeq.js';
import {Selection} from '../selection/selection.js';
import {HlSeq} from '../highlight/hlSeq.js';

class ShowAnno {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //show annotations such as SNPs, ClinVar, domains, binding sites, etc.
    showAnnotations() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        ic.icn3dui.htmlCls.dialogCls.openDlg('dl_selectannotations', 'Sequences and Annotations');
        // add note about assembly
        if((ic.bAssemblyNote === undefined || !ic.bAssemblyNote) && ic.asuCnt !== undefined ) {
            let html = "     <br><div id='" + ic.pre + "assembly_note' style='margin-left:5px;'><span class='icn3d-annoLargeTitle'>Assembly Tips:</span> Only the asymmetric unit is shown in the sequence window.<br>Click \"Assembly\" in the menu \"View\" to switch between asymmetric unit and biological assembly(<b>" + ic.asuCnt + "</b> asymmetric unit).</div>";
            $("#" + ic.pre + "dl_annotations_tabs").append(html);
            ic.bAssemblyNote = true;
        }
        if(ic.bAnnoShown === undefined || !ic.bAnnoShown) {
            let chainArray = Object.keys(ic.chains);
            if(ic.giSeq === undefined) ic.giSeq = {}
            if(ic.currClin === undefined) ic.currClin = {}
            if(ic.resi2disease_nonempty === undefined) ic.resi2disease_nonempty = {}
            if(ic.baseResi === undefined) ic.baseResi = {}
            if(ic.matchedPos === undefined) ic.matchedPos = {}
            let dialogWidth =(ic.icn3dui.cfg.notebook) ? ic.icn3dui.htmlCls.WIDTH / 2 : $("#" + ic.pre + "dl_selectannotations").dialog( "option", "width" );
            ic.seqAnnWidth = dialogWidth - 120 - 30*2 - 50; // title: 120px, start and end resi: 30px, extra space on the left and right: 50px
            ic.maxAnnoLength = 1;
            for(let chainid in ic.chainsSeq) {
                if(ic.chainsSeq[chainid].length > ic.maxAnnoLength) {
                    ic.maxAnnoLength = ic.chainsSeq[chainid].length;
                }
            }
            let nucleotide_chainid = {}, chemical_chainid = {}, chemical_set = {}
            ic.protein_chainid = {}
            for(let i = 0, il = chainArray.length; i < il; ++i) {
                let pos = Math.round(chainArray[i].indexOf('_'));
                //if(pos > 4) continue; // NMR structures with structure id such as 2K042,2K043, ...
                let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainArray[i]]);
                if(atom === undefined) atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainArray[i]]);
                if(atom === undefined) continue;

                // only single letter chain has accession such as 1P9M_A
                let chainLetter = chainArray[i].substr(chainArray[i].indexOf('_') + 1);
                let chainidBase;
                if(chainLetter.indexOf('_') !== -1) { // NCBI modified chainid, e.g., A_1
                    chainLetter = chainLetter.substr(0, chainLetter.indexOf('_'));
                    chainidBase = chainArray[i].substr(0, chainArray[i].indexOf('_')) + '_' + chainLetter;
                }
                else {
                    chainidBase = chainArray[i];
                }
                //if(ic.icn3dui.cfg.mmdbid !== undefined) { // protein and chemicals/ions are in different chains
                if(ic.proteins.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                    ic.protein_chainid[chainArray[i]] = chainidBase;
                }
                else if(ic.nucleotides.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                    nucleotide_chainid[chainArray[i]] = chainidBase;
                }
                else {
                    if(ic.chainsSeq[chainArray[i]].length > 1) {
                        chemical_chainid[chainArray[i]] = chainidBase;
                    }
                    else {
                        let name = ic.chainsSeq[chainArray[i]][0].name;
                        let resid = chainArray[i] + '_' + ic.chainsSeq[chainArray[i]][0].resi;
                        if(chemical_set[name] === undefined) chemical_set[name] = [];
                        chemical_set[name].push(resid);
                    }
                }
                //}
                // protein and nucleotide chain may have chemicals/ions attached at the end
                if((ic.icn3dui.cfg.pdbid !== undefined || ic.icn3dui.cfg.opmid !== undefined || ic.icn3dui.cfg.mmcifid !== undefined || ic.icn3dui.cfg.mmtfid !== undefined)
                  &&(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) ) {
                    for(let r = 0, rl = ic.chainsSeq[chainArray[i]].length; r < rl; ++r) {
                        let resObj = ic.chainsSeq[chainArray[i]][r];
                        if(resObj.name !== '' && resObj.name !== '-' && resObj.name == resObj.name.toUpperCase()) {
                            let resid = chainArray[i] + '_' + resObj.resi;
                            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                            if(atom === undefined) atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainArray[i]]);
                            if(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) {
                                continue;
                            }
                            else {
                                let name = resObj.name.trim();
                                if(chemical_set[name] === undefined) chemical_set[name] = [];
                                chemical_set[name].push(resid);
                            }
                        } // if(resObj.name !== ''
                    } // for(let r = 0
                } // if(ic.icn3dui.cfg.mmdbid
            } // for(let i = 0
            if(ic.icn3dui.cfg.blast_rep_id === undefined) {
               if(ic.bFullUi) {
                   if(ic.icn3dui.cfg.mmtfid !== undefined) { // mmtf data do NOT have the missing residues
                       let id = chainArray[0].substr(0, chainArray[0].indexOf('_'));
                       $.when(ic.mmcifParserCls.downloadMmcifSymmetry(id, 'mmtfid')).then(function() {
                           thisClass.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
                       });
                   }
                   else {
                       this.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
                   }
               }
            }
            else if(ic.icn3dui.cfg.blast_rep_id !== undefined) { // align sequence to structure
               let url = ic.icn3dui.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=querytarget';
               let dataObj = {'targets': ic.icn3dui.cfg.blast_rep_id, 'queries': ic.icn3dui.cfg.query_id}
               if(ic.icn3dui.cfg.query_from_to !== undefined ) {
                   // convert from 1-based to 0-based
                   let query_from_to_array = ic.icn3dui.cfg.query_from_to.split(':');
                   for(let i = 0, il = query_from_to_array.length; i < il; ++i) {
                       query_from_to_array[i] = parseInt(query_from_to_array[i]) - 1;
                   }
                   dataObj['queries'] = ic.icn3dui.cfg.query_id + ':' + query_from_to_array.join(':');
               }
               if(ic.icn3dui.cfg.target_from_to !== undefined) {
                   // convert from 1-based to 0-based
                   let target_from_to_array = ic.icn3dui.cfg.target_from_to.split(':');
                   for(let i = 0, il = target_from_to_array.length; i < il; ++i) {
                       target_from_to_array[i] = parseInt(target_from_to_array[i]) - 1;
                   }
                   dataObj['targets'] = ic.icn3dui.cfg.blast_rep_id + ':' + target_from_to_array.join(':');
               }
               $.ajax({
                  url: url,
                  type: 'POST',
                  data : dataObj,
                  dataType: 'jsonp',
                  //dataType: 'json',
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                    ic.seqStructAlignData = data;
                    thisClass.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if(this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    return;
                  }
                });
            } // align seq to structure
        }
        ic.bAnnoShown = true;
    }
    showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set) { let ic = this.icn3d, me = ic.icn3dui;
        this.getAnnotationData();
        let i = 0;
        for(let chain in nucleotide_chainid) {
            this.getSequenceData(chain, nucleotide_chainid[chain], 'nucleotide', i);
            ++i;
        }
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, ic.protein_chainid);
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, nucleotide_chainid);
        i = 0;
        for(let chain in chemical_chainid) {
            this.getSequenceData(chain, chemical_chainid[chain], 'chemical', i);
            ++i;
        }
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, chemical_chainid);
        ic.ssbondChainbase = me.hashUtilsCls.unionHash(ic.ssbondChainbase, ic.protein_chainid);
        ic.ssbondChainbase = me.hashUtilsCls.unionHash(ic.ssbondChainbase, chemical_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, ic.protein_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, nucleotide_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, chemical_chainid);
        for(let name in chemical_set) {
            this.getCombinedSequenceData(name, chemical_set[name], i);
            ++i;
        }
        this.enableHlSeq();

        setTimeout(function(){
          ic.annotationCls.hideAllAnno();
          ic.annotationCls.clickCdd();
        }, 0);
    }

    getAnnotationData() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
        let index = 0;
        for(let chnid in ic.protein_chainid) {
            let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';
            let fullProteinName = ic.showSeqCls.getProteinName(chnid);
            let proteinName = fullProteinName;
            //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
            let categoryStr =(index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>" : "";
            let geneLink =(ic.chainsGene[chnid] && ic.chainsGene[chnid].geneId) ? "(Gene: <a href='https://www.ncbi.nlm.nih.gov/gene/" + ic.chainsGene[chnid].geneId + "' target='_blank' title='" + ic.chainsGene[chnid].geneDesc + "'>" + ic.chainsGene[chnid].geneSymbol + "</a>)" : '';
            let chainHtml = "<div id='" + ic.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr
                + "<span style='font-weight:bold;'>Annotations of " + chnid
                + "</span>: <a class='icn3d-blue' href='https://www.ncbi.nlm.nih.gov/protein?term="
                + chnid + "' target='_blank' title='" + fullProteinName + "'>" + proteinName + "</a>"
                + geneLink + "&nbsp;&nbsp;&nbsp;"
                + this.addButton(chnid, "icn3d-addtrack", "Add Track", "Add a custom track", 60, buttonStyle)
                + "&nbsp;&nbsp;&nbsp;";
            //if(ic.icn3dui.cfg.blast_rep_id !== undefined && ic.icn3dui.cfg.blast_rep_id == chnid) {
                chainHtml += this.addButton(chnid, "icn3d-customcolor", "Custom Color/Tube", "Use a custom file to define the colors or tubes in 3D structure", 110, buttonStyle) + "&nbsp;&nbsp;&nbsp;";
            //}
                chainHtml += this.addButton(chnid, "icn3d-helixsets", "Helix Sets", "Define sets for each helix in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
                + this.addButton(chnid, "icn3d-sheetsets", "Sheet Sets", "Define sets for each sheet in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
                + this.addButton(chnid, "icn3d-coilsets", "Coil Sets", "Define sets for each coil in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle);
            $("#" + ic.pre + "dl_annotations").append(chainHtml);
            let itemArray = ['giseq', 'cdd', 'clinvar', 'snp', 'domain', 'site', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
            // dt: detailed view, hide by default; ov: overview, show by default
            for(let i in itemArray) {
                let item = itemArray[i];
                $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, item));
            }
            $("#" + ic.pre + "anno_" + chnid).append("<br><hr><br>");
            ++index;
        }
        ic.annoCddSiteCls.setToolTip();
        // show the sequence and 3D structure
        //var url = "https://eme.utilsCls.ncbi.nlm.nih.gov/entrez/eUtilsCls/efetch.fcgi?db=protein&retmode=json&rettype=fasta&id=" + chnidBaseArray;
        let url = ic.icn3dui.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + chnidBaseArray;

        if(ic.chainid_seq !== undefined) {
            this.processSeqData(ic.chainid_seq);
        }
        else {
            $.ajax({
              url: url,
              dataType: 'jsonp', //'text',
              cache: true,
              tryCount : 0,
              retryLimit : 0, //1,
              success: function(data) {
                ic.chainid_seq = data;
                thisClass.processSeqData(ic.chainid_seq);
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                this.enableHlSeq();
                console.log( "No data were found for the protein " + chnidBaseArray + "..." );
                for(let chnid in ic.protein_chainid) {
                    let chnidBase = ic.protein_chainid[chnid];
                    ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
                    ic.showSeqCls.showSeq(chnid, chnidBase);
                }
                // get CDD/Binding sites
                ic.annoCddSiteCls.showCddSiteAll();
                return;
              }
            });
        }
    }

    getSequenceData(chnid, chnidBase, type, index) { let ic = this.icn3d, me = ic.icn3dui;
        let fullProteinName = ic.showSeqCls.getProteinName(chnid);
        let proteinName = fullProteinName;
        if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
        let categoryStr = "";
        if(index == 0) {
            if(type == 'protein') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>";
            }
            else if(type == 'nucleotide') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Nucleotides</b>: </span><br><br>";
            }
            else if(type == 'chemical') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>";
            }
        }
        $("#" + ic.pre + "dl_annotations").append("<div id='" + ic.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr + "<b>" + chnid + "</b>: " + "<span title='" + fullProteinName + "'>" + proteinName + "</span> </div>");
        // dt: detailed view, hide by default; ov: overview, show by default
        $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'giseq'));
        //$("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'custom'));
        $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'interaction'));
        $("#" + ic.pre + "anno_" + chnid).append("<br><hr><br>");
        // show the sequence and 3D structure
        ic.giSeq[chnid] = [];

        for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
            let res = ic.chainsSeq[chnid][i].name;
            //ic.giSeq[chnid][i] =(res.length > 1) ? res.substr(0, 1) : res;
            ic.giSeq[chnid][i] = res;
        }
        ic.matchedPos[chnid] = 0;
        ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
        ic.showSeqCls.showSeq(chnid, chnidBase, type);
        //ic.annoContactCls.showInteraction(chnid, chnidBase);
    }
    getCombinedSequenceData(name, residArray, index) { let ic = this.icn3d, me = ic.icn3dui;
        let categoryStr =(index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>" : "";
        let chemName;
        let pos = residArray[0].lastIndexOf('_');
        let firstChainid = residArray[0].substr(0, pos);
        let sid =(ic.icn3dui.cfg.mmdbid !== undefined && ic.chainid2sid !== undefined) ? ic.chainid2sid[firstChainid] : undefined;
        if(sid !== undefined) {
            chemName = "<b><a class='icn3d-blue' href='https://pubchem.ncbi.nlm.nih.gov/substance/" + sid + "#section=2D-Structure' target='_blank'>" + name + " <img src='https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?sid=" + sid + "'></a></b>";
        }
        else {
            chemName = "<b>" + name + "</b>";
        }
        $("#" + ic.pre + "dl_annotations").append("<div id='" + ic.pre + "anno_" + name + "' class='icn3d-annotation'>" + categoryStr + chemName + "</div>");
        // dt: detailed view, hide by default; ov: overview, show by default
        $("#" + ic.pre + "anno_" + name).append("<div id='" + ic.pre + "giseq_" + name + "'><div id='" + ic.pre + "dt_giseq_" + name + "' style='display:none'></div><div id='" + ic.pre + "ov_giseq_" + name + "'></div></div>");
        $("#" + ic.pre + "anno_" + name).append("<br><hr><br>");
        // sequence, detailed view
        let htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        let chainType = 'Chem.', chainTypeFull = 'Chemical';
        htmlTmp += '<div class="icn3d-seqTitle2" anno="sequence"><span style="white-space:nowrap;" title="' + chainTypeFull + ' ' + name + '">' + chainType + ' ' + name + '</span></div>';
        htmlTmp += '<span class="icn3d-residueNum" style="width:60px!important;" title="starting protein sequence number">Count: ' + residArray.length + '</span>';
        htmlTmp += '<span class="icn3d-seqLine">';
        // sequence, overview
        let html = htmlTmp;
        let html2 = htmlTmp;
        for(let i = 0, il = residArray.length; i < il; ++i) {
          let cFull = name;
          let c = cFull;
          if(cFull.length > 3) {
              c = cFull.substr(0,3);
          }
          if(i < residArray.length - 1) c = c + ',';
          let resid = residArray[i];
          let resi = resid.substr(resid.lastIndexOf('_') + 1);
          html += '<span id="giseq_' + ic.pre + resid + '" title="' + cFull + resi + '" class="icn3d-residue icn3d-chemical">' + c + '</span>';
        }
        let color = ic.icn3dui.htmlCls.GREY8;
        //html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + Math.round(ic.seqAnnWidth * residArray.length / ic.maxAnnoLength) + 'px;">' + name + '</div>';
        let width = Math.round(ic.seqAnnWidth * residArray.length / ic.maxAnnoLength);
        if(width < 1) width = 1;
        html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + width + 'px;">&nbsp;</div>';
        //htmlTmp = '<span class="icn3d-residueNum" title="ending protein sequence number">' + residArray.length + '</span>';
        //htmlTmp += '</span>';
        htmlTmp = '</span>';
        htmlTmp += '<br>';
        htmlTmp += '</div>';
        html += htmlTmp;
        html2 += htmlTmp;
        $("#" + ic.pre + 'dt_giseq_' + name).html(html);
        $("#" + ic.pre + 'ov_giseq_' + name).html(html2);
    }

    processSeqData(chainid_seq) { let ic = this.icn3d, me = ic.icn3dui;
        for(let chnid in ic.protein_chainid) {
            let chnidBase = ic.protein_chainid[chnid];
            //if(chainid_seq.hasOwnProperty(chnid)) {
            //    let allSeq = chainid_seq[chnid];
            if(chainid_seq.hasOwnProperty(chnidBase)) {
                let allSeq = chainid_seq[chnidBase];
                ic.giSeq[chnid] = allSeq;
                // the first 10 residues from sequences with structure
                let startResStr = '';
                for(let i = 0; i < 10 && i < ic.chainsSeq[chnid].length; ++i) {
                    startResStr += ic.chainsSeq[chnid][i].name.substr(0, 1);
                }
                let pos = allSeq.toLowerCase().indexOf(startResStr.toLowerCase());
                if(pos == -1) {
                    console.log("The gi sequence didn't match the protein sequence. The start of 3D protein sequence: " + startResStr + ". The gi sequence: " + allSeq.substr(0, 10) + ".");
                    ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
                }
                else {
                    ic.matchedPos[chnid] = pos;
                    ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
                }
            }
            else {
                console.log( "No data were found for the protein " + chnid + "..." );
                ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
            }
            if(ic.icn3dui.cfg.blast_rep_id != chnid) {
                ic.showSeqCls.showSeq(chnid, chnidBase);
            }
            else if(ic.icn3dui.cfg.blast_rep_id == chnid && ic.seqStructAlignData.data === undefined) {
              let title;
              if(ic.icn3dui.cfg.query_id.length > 14) {
                  title = 'Query: ' + ic.icn3dui.cfg.query_id.substr(0, 6) + '...';
              }
              else {
                  title =(isNaN(ic.icn3dui.cfg.query_id)) ? 'Query: ' + ic.icn3dui.cfg.query_id : 'Query: gi ' + ic.icn3dui.cfg.query_id;
              }
              compTitle = undefined;
              compText = undefined;
              let text = "cannot be aligned";
              ic.queryStart = '';
              ic.queryEnd = '';
              alert('The sequence can NOT be aligned to the structure');
              ic.showSeqCls.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
            }
            else if(ic.icn3dui.cfg.blast_rep_id == chnid && ic.seqStructAlignData.data !== undefined) { // align sequence to structure
              //var title = 'Query: ' + ic.icn3dui.cfg.query_id.substr(0, 6);
              let title;
              if(ic.icn3dui.cfg.query_id.length > 14) {
                  title = 'Query: ' + ic.icn3dui.cfg.query_id.substr(0, 6) + '...';
              }
              else {
                  title =(isNaN(ic.icn3dui.cfg.query_id)) ? 'Query: ' + ic.icn3dui.cfg.query_id : 'Query: gi ' + ic.icn3dui.cfg.query_id;
              }
              let data = ic.seqStructAlignData;

              let query, target;
              if(data.data !== undefined) {
                  query = data.data[0].query;
                  //target = data.data[0].targets[chnid.replace(/_/g, '')];
                  target = data.data[0].targets[chnid];
                  target =(target !== undefined && target.hsps.length > 0) ? target.hsps[0] : undefined;
              }
              let text = '', compText = '';
              ic.queryStart = '';
              ic.queryEnd = '';
              let evalue;
              if(query !== undefined && target !== undefined) {
                  evalue = target.scores.e_value.toPrecision(2);
                  if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();
                  let bitscore = target.scores.bit_score;
                  //var targetSeq = data.targets[chnid.replace(/_/g, '')].seqdata;
                  let targetSeq = data.targets[chnid].seqdata;
                  let querySeq = query.seqdata;
                  let segArray = target.segs;
                  let target2queryHash = {}
                  if(ic.targetGapHash === undefined) ic.targetGapHash = {}
                  ic.fullpos2ConsTargetpos = {}
                  ic.consrvResPosArray = [];
                  let prevTargetTo = 0, prevQueryTo = 0;
                  ic.nTotalGap = 0;
                  ic.queryStart = segArray[0].from + 1;
                  ic.queryEnd = segArray[segArray.length - 1].to + 1;
                  for(let i = 0, il = segArray.length; i < il; ++i) {
                      let seg = segArray[i];
                      if(i > 0) { // determine gap
                        if(seg.orifrom - prevTargetTo < seg.from - prevQueryTo) { // gap in target
                            ic.targetGapHash[seg.orifrom] = {'from': prevQueryTo + 1, 'to': seg.from - 1}
                            ic.nTotalGap += ic.targetGapHash[seg.orifrom].to - ic.targetGapHash[seg.orifrom].from + 1;
                        }
                        else if(seg.orifrom - prevTargetTo > seg.from - prevQueryTo) { // gap in query
                            for(let j = prevTargetTo + 1; j < seg.orifrom; ++j) {
                              target2queryHash[j] = -1; // means gap in query
                            }
                        }
                      }
                      for(let j = 0; j <= seg.orito - seg.orifrom; ++j) {
                          target2queryHash[j + seg.orifrom] = j + seg.from;
                      }
                      prevTargetTo = seg.orito;
                      prevQueryTo = seg.to;
                  }
                  // the missing residues at the end of the seq will be filled up in the API showNewTrack()
                  let nGap = 0;
                  ic.alnChainsSeq[chnid] = [];
                  let offset =(ic.chainid2offset[chnid]) ? ic.chainid2offset[chnid] : 0;
                  for(let i = 0, il = targetSeq.length; i < il; ++i) {
                      //text += ic.showSeqCls.insertGap(chnid, i, '-', true);
                      if(ic.targetGapHash.hasOwnProperty(i)) {
                          for(let j = ic.targetGapHash[i].from; j <= ic.targetGapHash[i].to; ++j) {
                              text += querySeq[j];
                          }
                      }
                      compText += ic.showSeqCls.insertGap(chnid, i, '-', true);
                      if(ic.targetGapHash.hasOwnProperty(i)) nGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
                      let pos =(ic.bUsePdbNum) ? i+1 + offset : i+1;
                      if(target2queryHash.hasOwnProperty(i) && target2queryHash[i] !== -1) {
                          text += querySeq[target2queryHash[i]];
                          let colorHexStr = this.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
                          if(targetSeq[i] == querySeq[target2queryHash[i]]) {
                              compText += targetSeq[i];
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': 1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.consrvResPosArray.push(pos);
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#FF0000', 'color2': '#' + colorHexStr});
                          }
                          else if(this.conservativeReplacement(targetSeq[i], querySeq[target2queryHash[i]])) {
                              compText += '+';
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': 0, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.consrvResPosArray.push(pos);
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#0000FF', 'color2': '#' + colorHexStr});
                          }
                          else {
                              compText += ' ';
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': -1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': ic.icn3dui.htmlCls.GREYC, 'color2': '#' + colorHexStr});
                          }
                      }
                      else {
                          text += '-';
                          compText += ' ';
                      }
                  }
                  //title += ', E: ' + evalue;
              }
              else {
                  text += "cannot be aligned";
                  alert('The sequence can NOT be aligned to the structure');
              }
              let compTitle = 'BLAST, E: ' + evalue;
              ic.showSeqCls.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
              let residueidHash = {}
              let residueid;
              if(ic.consrvResPosArray !== undefined) {
                for(let i = 0, il = ic.consrvResPosArray.length; i < il; ++i) {
                    residueid = chnidBase + '_' + ic.consrvResPosArray[i];
                    residueidHash[residueid] = 1;
                    //atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueid]);
                }
              }
              let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
              //ic.selectionCls.selectResidueList(residueidHash, chnidBase + '_blast', compTitle, false);
              ic.selectionCls.selectResidueList(residueidHash, 'protein_aligned', compTitle, false);
              ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            } // align seq to structure
        } // for loop
        this.enableHlSeq();
        // get CDD/Binding sites
        ic.annoCddSiteCls.showCddSiteAll();
    }

    enableHlSeq() { let ic = this.icn3d, me = ic.icn3dui;
        if(! me.utilsCls.isMobile()) {
            ic.hlSeqCls.selectSequenceNonMobile();
        }
        else {
            ic.hlSeqCls.selectSequenceMobile();
            ic.hlSeqCls.selectChainMobile();
        }
        // highlight seq after the ajax calls
        if(Object.keys(ic.hAtoms).length < Object.keys(ic.dAtoms).length) {
            ic.hlUpdateCls.updateHlSeq();
        }
    }

    getAnDiv(chnid, anno) { let ic = this.icn3d, me = ic.icn3dui;
        let message = 'Loading ' + anno + '...';
        if(anno == 'custom') {
            message = ''
        }
        else if(anno == 'domain') {
            message = 'Loading 3D ' + anno + '...';
        }
        return "<div id='" + ic.pre + anno + "_" + chnid + "'><div id='" + ic.pre + "tt_" + anno + "_" + chnid + "' class='icn3d-fixed-pos' style='display:none!important'></div><div id='" + ic.pre + "dt_" + anno + "_" + chnid + "' style='display:none'>" + message + "</div><div id='" + ic.pre + "ov_" + anno + "_" + chnid + "'>" + message + "</div></div>";
    }
    addButton(chnid, classvalue, name, desc, width, buttonStyle) { let ic = this.icn3d, me = ic.icn3dui;
        return "<div class='" + classvalue + "' chainid='" + chnid + "' style='display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
    }
    addSnpButton(snp, classvalue, name, desc, width, buttonStyle) { let ic = this.icn3d, me = ic.icn3dui;
        return "<div class='" + ic.pre + classvalue + "' snp='" + snp + "' style='margin:3px 0 3px 0; display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
    }
    conservativeReplacement(resA, resB) { let ic = this.icn3d, me = ic.icn3dui;
        let iA =(me.parasCls.b62ResArray.indexOf(resA) !== -1) ? me.parasCls.b62ResArray.indexOf(resA) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let iB =(me.parasCls.b62ResArray.indexOf(resB) !== -1) ? me.parasCls.b62ResArray.indexOf(resB) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let matrixValue = me.parasCls.b62Matrix[iA][iB];
        if(matrixValue > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    getColorhexFromBlosum62(resA, resB) { let ic = this.icn3d, me = ic.icn3dui;
        let iA =(me.parasCls.b62ResArray.indexOf(resA) !== -1) ? me.parasCls.b62ResArray.indexOf(resA) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let iB =(me.parasCls.b62ResArray.indexOf(resB) !== -1) ? me.parasCls.b62ResArray.indexOf(resB) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let matrixValue = me.parasCls.b62Matrix[iA][iB];
        if(matrixValue === undefined) return '333333';
        // range and color: blue for -4 ~ 0, red for 0 ~ 11
        // max value 221 to avoid white
        let color = '333333';
        if(matrixValue > 0) {
            let c = 221 - parseInt(matrixValue / 11.0 * 221);
            let cStr =(c < 10) ? '0' + c.toString(16) : c.toString(16);
            color = 'DD' + cStr + cStr;
        }
        else {
            let c = 221 - parseInt(-1.0 * matrixValue / 4.0 * 221);
            let cStr =(c < 10) ? '0' + c.toString(16) : c.toString(16);
            color = cStr + cStr + 'DD';
        }
        return color;
    }

}

export {ShowAnno}
