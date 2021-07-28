/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {MyEventCls} from '../../utils/myEventCls.js';
import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {Selection} from '../selection/selection.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {Analysis} from '../analysis/analysis.js';
import {DefinedSets} from '../selection/definedSets.js';
import {Draw} from '../display/draw.js';
import {ShowAnno} from '../annotations/showAnno.js';
import {ShowSeq} from '../annotations/showSeq.js';

class AnnoSnpClinVar {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    navClinVar(chnid) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        ic.currClin[chnid] = - 1;
        me.myEventCls.onIds("#" + ic.pre + chnid + "_prevclin", "click", function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let maxLen =(ic.resi2disease_nonempty[chnid] !== undefined) ? Object.keys(ic.resi2disease_nonempty[chnid]).length : 0;
          --ic.currClin[chnid];
          if(ic.currClin[chnid] < 0) ic.currClin[chnid] = maxLen - 1; // 0;
          thisClass.showClinVarLabelOn3D(chnid);
        });
        me.myEventCls.onIds("#" + ic.pre + chnid + "_nextclin", "click", function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let maxLen =(ic.resi2disease_nonempty[chnid] !== undefined) ? Object.keys(ic.resi2disease_nonempty[chnid]).length : 0;
          ++ic.currClin[chnid];
          if(ic.currClin[chnid] > maxLen - 1) ic.currClin[chnid] = 0; // ic.resi2disease_nonempty[chnid].length - 1;
          thisClass.showClinVarLabelOn3D(chnid);
        });
    }
    showClinVarLabelOn3D(chnid) { let ic = this.icn3d, me = ic.icn3dui;
          let resiArray = Object.keys(ic.resi2disease_nonempty[chnid]);
          let chainid, residueid;
          chainid = chnid;
          residueid = chainid + '_' + resiArray[ic.currClin[chnid]];
          let label = '';
          let diseaseArray = ic.resi2disease_nonempty[chnid][resiArray[ic.currClin[chnid]]];
          for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
              if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                label = diseaseArray[k];
                break;
              }
          }
          let position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
          //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit
          let maxlen = 30;
          if(label.length > maxlen) label = label.substr(0, maxlen) + '...';
          ic.selectionCls.removeSelection();
          if(ic.labels == undefined) ic.labels = {}
          ic.labels['clinvar'] = [];
          //var size = Math.round(ic.LABELSIZE * 10 / label.length);
          let size = ic.LABELSIZE;
          let color = "#FFFF00";
          ic.analysisCls.addLabel(label, position.center.x + 1, position.center.y + 1, position.center.z + 1, size, color, undefined, 'clinvar');
          ic.hAtoms = {}
          for(let j in ic.residues[residueid]) {
              ic.hAtoms[j] = 1;
          }
          //ic.residueLabelsCls.addResidueLabels(ic.hAtoms);
          $("#clinvar_" + ic.pre + residueid).addClass('icn3d-highlightSeq');
          if($("#" + ic.pre + "modeswitch")[0] !== undefined && !$("#" + ic.pre + "modeswitch")[0].checked) {
              ic.definedSetsCls.setMode('selection');
          }
          ic.drawCls.draw();
    }
    getSnpLine(line, totalLineNum, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, bStartEndRes, chnid, bOverview, bClinvar, bTitleOnly, bSnpOnly) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '';
        let altName = bClinvar ? 'clinvar' : 'snp';
        // determine whether the SNPis from virus directly
        let bVirus = false;
        for(let resi in resi2rsnum) {
            for(let i = 0, il = resi2rsnum[resi].length; i < il; ++i) {
                if(resi2rsnum[resi][i] == 0) {
                    bVirus = true;
                    break;
                }
            }
            if(bVirus) break;
        }
        if(bStartEndRes) {
            let title1 = 'ClinVar', title2 = 'SNP', title2b = 'SNP', warning = "", warning2 = "";
            if(!bVirus && ic.organism !== undefined && ic.organism !== 'human' && ic.organism !== 'homo sapiens') {
                warning = " <span style='color:#FFA500'>(from human)</span>";
                warning2 = " <span style='color:#FFA500'>(based on human sequences and mapped to this structure by sequence similarity)</span>";
            }
            if(bClinvar) {
                html += '<div class="icn3d-seqTitle icn3d-link icn3d-blue icn3d-clinvar-path" clinvar="clinvar" posarray="' + posClinArray + '" shorttitle="' + title1 + '" setname="' + chnid + '_' + title1 + '" anno="sequence" chain="' + chnid + '" title="' + title1 + warning2 + '">' + title1 + warning + '</div>';
            }
            else {
                html += '<div class="icn3d-seqTitle icn3d-link icn3d-blue" clinvar="clinvar" posarray="' + posarray + '" shorttitle="' + title2 + '" setname="' + chnid + '_' + title2 + '" anno="sequence" chain="' + chnid + '" title="' + title2 + warning2 + '">' + title2 + warning + '</div>';
            }
        }
        else if(line == 2 && bClinvar) {
            let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';
            html += '<div id="' + ic.pre + chnid + '_prevclin" style="display:inline-block; font-size:11px; font-weight:bold; width:60px!important;"><button class="link" style="-webkit-appearance:' + buttonStyle + '; height:18px; width:55px;"><span style="white-space:nowrap; margin-left:-40px;" title="Show the previous ClinVar on structure">&lt; ClinVar</span></button></div>';
            html += '<div id="' + ic.pre + chnid + '_nextclin" style="display:inline-block; font-size:11px; font-weight:bold; width:60px!important;"><button class="link" style="-webkit-appearance:' + buttonStyle + '; height:18px; width:55px;"><span style="white-space:nowrap; margin-left:-40px;" title="Show the next ClinVar on structure">ClinVar &gt;</span></button></div>';
        }
        else {
            html += '<div class="icn3d-seqTitle"></div>';
        }
        let pre = altName;
        let snpCnt = 0, clinvarCnt = 0;
        let snpTypeHash = {}, currSnpTypeHash = {}
        for(let i = 1, il = ic.giSeq[chnid].length; i <= il; ++i) {
            if(resi2index[i] !== undefined) {
                ++snpCnt;
                let snpType = '', allDiseaseTitle = '';
                for(let j = 0, jl = resi2snp[i].length; j < jl && !bSnpOnly; ++j) {
                    let diseaseArray = resi2disease[i][j].split('; ');
                    let sigArray = resi2sig[i][j].split('; ');
                    let diseaseTitle = '';
                    for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                        if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                            diseaseTitle += diseaseArray[k] + '(' + sigArray[k] + '); ';
                        }
                    }
                    if(diseaseTitle != '') {
                        snpTypeHash[i] = 'icn3d-clinvar';
                        if(j == line - 2) { // just check the current line, "line = 2" means the first SNP
                            currSnpTypeHash[i] = 'icn3d-clinvar';
                            if(diseaseTitle.indexOf('Pathogenic') != -1) {
                                currSnpTypeHash[i] = 'icn3d-clinvar-path';
                            }
                        }
                    }
                    allDiseaseTitle += diseaseTitle + ' | ';
                }
                if(allDiseaseTitle.indexOf('Pathogenic') != -1) {
                    snpTypeHash[i] = 'icn3d-clinvar-path';
                }
                if(snpTypeHash[i] == 'icn3d-clinvar' || snpTypeHash[i] == 'icn3d-clinvar-path') {
                    ++clinvarCnt;
                }
            }
        }
        if(snpCnt == 0 && !bClinvar) {
            $("#" + ic.pre + 'dt_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'ov_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'tt_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'dt_snp_' + chnid).html('');
            $("#" + ic.pre + 'ov_snp_' + chnid).html('');
            $("#" + ic.pre + 'tt_snp_' + chnid).html('');
            return '';
        }
        if(clinvarCnt == 0 && bClinvar) {
            $("#" + ic.pre + 'dt_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'ov_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'tt_clinvar_' + chnid).html('');
            return '';
        }
        let cnt = bClinvar ? clinvarCnt : snpCnt;
        if(line == 1) {
            html += '<span class="icn3d-residueNum" title="residue count">' + cnt + ' Res</span>';
        }
        else {
            html += '<span class="icn3d-residueNum"></span>';
        }
        if(bTitleOnly) {
            return html + '<br>';
        }
        html += '<span class="icn3d-seqLine">';
        let diseaseStr = '';
        let prevEmptyWidth = 0;
        let prevLineWidth = 0;
        let widthPerRes = 1;
        for(let i = 1, il = ic.giSeq[chnid].length; i <= il; ++i) {
            if(bOverview) {
                if(resi2index[i] !== undefined) {
                    // get the mouse over text
                    let cFull = ic.giSeq[chnid][i-1];
                    let c = cFull;
                    if(cFull.length > 1) {
                        c = cFull[0] + '..';
                    }
                    let pos =(i >= ic.matchedPos[chnid] && i-1 - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i-1;
                    let snpTitle = pos + c + '>';
                    let allDiseaseTitle = '';
                    for(let j = 0, jl = resi2snp[i].length; j < jl; ++j) {
                        snpTitle += resi2snp[i][j];
                        if(!bSnpOnly) {
                            let diseaseArray = resi2disease[i][j].split('; ');
                            let sigArray = resi2sig[i][j].split('; ');
                            let diseaseTitle = '';
                            for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                    diseaseTitle += diseaseArray[k] + '(' + sigArray[k] + '); ';
                                }
                            }
                            allDiseaseTitle += diseaseTitle + ' | ';
                        }
                    }
                    html += ic.showSeqCls.insertGapOverview(chnid, i-1);
                    let emptyWidth =(ic.icn3dui.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth *(i-1) /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth *(i-1) / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
                    //if(emptyWidth < 0) emptyWidth = 0;
                    if(bClinvar) {
                        if(snpTypeHash[i] == 'icn3d-clinvar' || snpTypeHash[i] == 'icn3d-clinvar-path') {
                            if(emptyWidth >= 0) {
                                html += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                                html += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + snpTitle + '">&nbsp;</div>';
                                prevEmptyWidth += emptyWidth;
                                prevLineWidth += widthPerRes;
                            }
                        }
                    }
                    else {
                        if(emptyWidth > 0) {
                            html += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                            html += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + snpTitle + '">&nbsp;</div>';
                            prevEmptyWidth += emptyWidth;
                            prevLineWidth += widthPerRes;
                        }
                    }
                }
            }
            else { // detailed view
              html += ic.showSeqCls.insertGap(chnid, i-1, '-');
              if(resi2index[i] !== undefined) {
                  if(!bClinvar && line == 1) {
                      html += '<span>&dArr;</span>'; // or down triangle &#9660;
                  }
                  else {
                    let cFull = ic.giSeq[chnid][i-1];
                    let c = cFull;
                    if(cFull.length > 1) {
                      c = cFull[0] + '..';
                    }
                    let pos =(i >= ic.matchedPos[chnid] && i-1 - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i-1;
                    let snpStr = "", snpTitle = "<div class='snptip'>"
                    //var snpType = '';
                    let jl = resi2snp[i].length;
                    let start = 0, end = 0;
                    let shownResCnt;
                    if(line == 2) {
                        start = 0;
                        //end = 1;
                        end = jl;
                    }
                    //else if(line == 3) {
                    //    start = 1;
                    //    end = jl;
                    //}
                    if(!bClinvar) {
                        //shownResCnt = 2;
                        shownResCnt = 1;
                        for(let j = start; j < jl && j < end; ++j) {
                            let snpTmpStr = chnid + "_" + pos + "_" + resi2snp[i][j];
                            let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';

                            let bCoord = true;
                            if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                                bCoord = false;
                            }

                            if(j < shownResCnt) snpStr += resi2snp[i][j];
                            snpTitle += pos + c + '>' + resi2snp[i][j];

                            if(!bSnpOnly) {
                                // disease and significace
                                let diseaseArray = resi2disease[i][j].split('; ');
                                let sigArray = resi2sig[i][j].split('; ');
                                let diseaseTitle = '';
                                let index = 0;
                                for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                    if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                        if(index > 0) {
                                            diseaseTitle += '; ';
                                        }
                                        else {
                                            if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                        }
                                        diseaseTitle += diseaseArray[k] + '(' + sigArray[k] + ')';
                                        ++index;
                                    }
                                }

                                //resi2rsnum, resi2clinAllele,
                                if(diseaseTitle != '') {
                                    //snpType = 'icn3d-clinvar';
                                    snpTitle += ': ' + diseaseTitle;

                                    if(bCoord && !me.cfg.hidelicense) {
                                        snpTitle += '<br>' + ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                        snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                        snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                    }

                                    //snpTitle += "<br>Links: <span class='" + ic.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + ic.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + ic.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                    snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                }
                                else {
                                    if(bCoord && !me.cfg.hidelicense) {
                                        snpTitle += '<br>' + ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                        snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                        snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                    }

                                    //snpTitle += "<br>Links: <span class='" + ic.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + ic.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + ic.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>"
                                    snpTitle += "<br>Link: <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>"
                                }
                                if(j < jl - 1) {
                                    //if(j < 1) snpStr += ';';
                                    snpTitle += '<br><br>';
                                }
                            }
                            else { //if(bSnpOnly) {
                                if(bCoord && !me.cfg.hidelicense) {
                                    snpTitle += '<br>' + ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                }

                                if(resi2rsnum[i][j] != 0) {
                                    //snpTitle += "<br>Links: <span class='" + ic.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + ic.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + ic.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                    snpTitle += "<br>Link: <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                }
                                else {
                                    //snpTitle += "<br>Links: <span class='" + ic.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + ic.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + ic.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>";
                                }

                                if(j < jl - 1) {
                                    snpTitle += '<br><br>';
                                }
                            }
                        }
                        //if(jl > shownResCnt && line == 3) snpStr += '..';
                        if(jl > shownResCnt && line == 2) snpStr += '..';
                    }
                    else { // if(bClinvar)
                        shownResCnt = 1;
                        let diseaseCnt = 0;
                        for(let j = start; j < jl && j < end; ++j) {
                            let snpTmpStr = chnid + "_" + pos + "_" + resi2snp[i][j];
                            let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';

                            let bCoord = true;
                            if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                                bCoord = false;
                            }

                            // disease and significace
                            let diseaseArray = resi2disease[i][j].split('; ');
                            let sigArray = resi2sig[i][j].split('; ');
                            let diseaseTitle = '';
                            let index = 0;
                            for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                    if(index > 0) {
                                        diseaseTitle += '; ';
                                    }
                                    else {
                                        if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                    }
                                    diseaseTitle += diseaseArray[k] + '(' + sigArray[k] + ')';
                                    ++index;
                                }
                            }
                            if(diseaseTitle != '') {
                                if(diseaseCnt < shownResCnt) snpStr += resi2snp[i][j];
                                snpTitle += pos + c + '>' + resi2snp[i][j];
                                //snpType = 'icn3d-clinvar';
                                snpTitle += ': ' + diseaseTitle;

                                if(bCoord && !me.cfg.hidelicense) {
                                    snpTitle += '<br>' + ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += ic.showAnnoCls.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                }

                                //snpTitle += "<br>Links: <span class='" + ic.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + ic.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + ic.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                if(j < jl - 1) {
                                    snpTitle += '<br><br>';
                                }
                                ++diseaseCnt;
                            } // if(diseaseTitle != '') {
                        } // for(let j = start; j < jl && j < end; ++j) {
                        //if(diseaseCnt > shownResCnt && line == 3) snpStr += '..';
                        if(diseaseCnt > shownResCnt && line == 2) snpStr += '..';
                    } // else { // if(bClinvar)
                    snpTitle += '</div>';
                    if(bClinvar) {
                        if(snpTypeHash[i] == 'icn3d-clinvar' || snpTypeHash[i] == 'icn3d-clinvar-path') {
                            if(line == 1) {
                                html += '<span>&dArr;</span>'; // or down triangle &#9660;
                            }
                            else {
                                if(snpStr == '' || snpStr == ' ') {
                                    html += '<span>-</span>';
                                }
                                else {
                                    html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                                }
                            }
                        }
                        else {
                            html += '<span>-</span>';
                        }
                    }
                    else {
                        if(snpStr == '' || snpStr == ' ') {
                            html += '<span>-</span>';
                        }
                        else {
                            if(!bSnpOnly) {
                                html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                            }
                            else {
                                html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                            }
                        }
                    }
                  } // if(!bClinvar && line == 1) {
              }
              else {
                html += '<span>-</span>'; //'<span>-</span>';
              }
            } // if(bOverview) {
        } // for
        //var end = bStartEndRes ? ic.chainsSeq[chnid][ic.giSeq[chnid].length - 1 - ic.matchedPos[chnid] ].resi : '';
        if(line == 1) {
            html += '<span class="icn3d-residueNum" title="residue count">&nbsp;' + cnt + ' Residues</span>';
        }
        else {
            html += '<span class="icn3d-residueNum"></span>';
        }
        html += '</span>';
        html += '<br>';
        return html;
    }
    processSnpClinvar(data, chnid, chnidBase, bSnpOnly, bVirus) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '<div id="' + ic.pre + chnid + '_snpseq_sequence" class="icn3d-dl_sequence">';
        let html2 = html;
        let html3 = html;
        let htmlClinvar = '<div id="' + ic.pre + chnid + '_clinvarseq_sequence" class="icn3d-dl_sequence">';
        let htmlClinvar2 = htmlClinvar;
        let htmlClinvar3 = htmlClinvar;
        let lineArray =(!bSnpOnly || bVirus) ? data.data : data.split('\n');
        let resi2snp = {}
        let resi2index = {}
        let resi2disease = {}
        if(ic.resi2disease_nonempty[chnid] === undefined) ic.resi2disease_nonempty[chnid] = {}
        let resi2sig = {}
        let resi2rsnum = {}
        let resi2clinAllele = {}
        let posHash = {}, posClinHash = {}
        let prevSnpStr = '';
        for(let i = 0, il = lineArray.length; i < il; ++i) {
         //bSnpOnly: false
         //1310770    13    14    14Y>H    368771578    150500    Hereditary cancer-predisposing syndrome; Li-Fraumeni syndrome; not specified; Li-Fraumeni syndrome 1    Likely benign; Uncertain significance; Uncertain significance; Uncertain significance    1TSR_A    120407068    NP_000537.3
         //Pdb_gi, Pos from, Pos to, Pos & Amino acid change, rs#, ClinVar Allele ID, Disease name, Clinical significance, master accession, master_gi, master_accession.version
         //bSnpOnly: true
         //1310770    13    14    14Y>H    1111111
         if(lineArray[i] != '') {
          let fieldArray =(!bSnpOnly || bVirus) ? lineArray[i] : lineArray[i].split('\t');
          let snpStr = fieldArray[3];
          if(snpStr == prevSnpStr) continue;
          prevSnpStr = snpStr;
          let resiStr = snpStr.substr(0, snpStr.length - 3);
          let resi = Math.round(resiStr);
          let currRes = snpStr.substr(snpStr.length - 3, 1);
          let snpRes = snpStr.substr(snpStr.length - 1, 1);
          //var rsnum = bSnpOnly ? '' : fieldArray[4];
          let rsnum = fieldArray[4];
          let clinAllele = bSnpOnly ? '' : fieldArray[5];
          let disease = bSnpOnly ? '' : fieldArray[6];  // When more than 2+ diseases, they are separated by "; "
                                        // Some are "not specified", "not provided"
          let clinSig = bSnpOnly ? '' : fieldArray[7];     // Clinical significance, When more than 2+ diseases, they are separated by "; "
          // "*" means terminating codon, "-" means deleted codon
          //if(currRes !== '-' && currRes !== '*' && snpRes !== '-' && snpRes !== '*') {
                posHash[resi + ic.baseResi[chnid]] = 1;
                if(disease != '') posClinHash[resi + ic.baseResi[chnid]] = 1;
                resi2index[resi] = i + 1;
                if(resi2snp[resi] === undefined) {
                    resi2snp[resi] = [];
                }
                resi2snp[resi].push(snpRes);
                if(resi2rsnum[resi] === undefined) {
                    resi2rsnum[resi] = [];
                }
                resi2rsnum[resi].push(rsnum);
                if(resi2clinAllele[resi] === undefined) {
                    resi2clinAllele[resi] = [];
                }
                resi2clinAllele[resi].push(clinAllele);
                if(resi2disease[resi] === undefined) {
                    resi2disease[resi] = [];
                }
                resi2disease[resi].push(disease);
                if(disease != '') {
                    if(ic.resi2disease_nonempty[chnid][resi] === undefined) {
                        ic.resi2disease_nonempty[chnid][resi] = [];
                    }
                    ic.resi2disease_nonempty[chnid][resi].push(disease);
                }
                if(resi2sig[resi] === undefined) {
                    resi2sig[resi] = [];
                }
                resi2sig[resi].push(clinSig);
          //}
         }
        }
        let posarray = Object.keys(posHash);
        let posClinArray = Object.keys(posClinHash);
        if(bSnpOnly) {
            let bClinvar = false;
            html += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, undefined, bSnpOnly);
            html += this.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
            //html += this.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
            html3 += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, true, bSnpOnly);
            html3 += this.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
            //html3 += this.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
            html2 += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, true, bClinvar, undefined, bSnpOnly);
            html += '</div>';
            html2 += '</div>';
            html3 += '</div>';
            $("#" + ic.pre + 'dt_snp_' + chnid).html(html);
            $("#" + ic.pre + 'ov_snp_' + chnid).html(html2);
            $("#" + ic.pre + 'tt_snp_' + chnid).html(html3);
        }
        else {
        //if(!bSnpOnly && ic.bClinvarCnt) {
            bClinvar = true;
            htmlClinvar += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, undefined, bSnpOnly);
            htmlClinvar += this.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
            //htmlClinvar += this.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
            htmlClinvar3 += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, true, bSnpOnly);
            htmlClinvar3 += this.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
            //htmlClinvar3 += this.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
            htmlClinvar2 += this.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, true, bClinvar, undefined, bSnpOnly);
            htmlClinvar += '</div>';
            htmlClinvar2 += '</div>';
            htmlClinvar3 += '</div>';
            $("#" + ic.pre + 'dt_clinvar_' + chnid).html(htmlClinvar);
            $("#" + ic.pre + 'ov_clinvar_' + chnid).html(htmlClinvar2);
            $("#" + ic.pre + 'tt_clinvar_' + chnid).html(htmlClinvar3);
            this.navClinVar(chnid, chnidBase);
        }
        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        if(bSnpOnly) {
            ic.bAjaxSnp = true;
            if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
        }
        else {
            ic.bAjaxClinvar = true;
            if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
        }
    }
    showClinvarPart2(chnid, chnidBase, gi) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        //var url = "https://www.ncbi.nlm.nih.gov/projects/SNP/beVarSearch_mt.cgi?appname=iCn3D&format=bed&report=pdb2bed&acc=" + chnidBase;
        //var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/clinvar.txt";
        let url = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_clinvar=" + chnidBase;
        $.ajax({
          url: url,
          dataType: 'jsonp',
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(indata) {
            if(indata && indata.data && indata.data.length > 0) {
                let bSnpOnly = false;
                let data = indata;
                thisClass.processSnpClinvar(data, chnid, chnidBase, bSnpOnly);
            }
            else {
                thisClass.processNoClinvar(chnid);
            }
            //if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            this.processNoClinvar(chnid);
            //if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
            return;
          }
        });
    }
    showSnp(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        this.showSnpClinvar(chnid, chnidBase, true);
    }
    showClinvar(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        this.showSnpClinvar(chnid, chnidBase, false);
    }

    //Show the annotations of SNPs and ClinVar.
    showSnpClinvar(chnid, chnidBase, bSnpOnly) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       // get gi from acc
       //var url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/chainid2repgi.txt";
       let url2 = ic.icn3dui.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainid=" + chnidBase;
       $.ajax({
          url: url2,
          dataType: 'jsonp', //'text',
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(data2) {
            //ic.chainid2repgi = JSON.parse(data2);
            //var gi = ic.chainid2repgi[chnidBase];
            let snpgi = data2.snpgi;
            let gi = data2.gi;
            if(bSnpOnly) {
                thisClass.showSnpPart2(chnid, chnidBase, snpgi);
            }
            else {
                let specialGiArray = [6137708,1942289,224510717,2624886,253723219,2554905,75765331,3660278,312207882,319443632,342350956,1827805,109157826,1065265,40889086,6730307,163931185,494469,163931091,60594093,55669745,18655489,17942684,6980537,166235465,6435586,4139398,4389047,364506122,78101667,262118402,20664221,2624640,158430173,494395,28948777,34810587,13399647,3660342,261278854,342350965,384482350,378792570,15988303,213424334,4558333,2098365,10835631,3318817,374074330,332639529,122919696,4389286,319443573,2781341,67464020,194709238,210061039,364506106,28949044,40889076,161172338,17943181,4557976,62738484,365813173,6137343,350610552,17942703,576308,223674070,15826518,1310997,93279697,4139395,255311799,157837067,361132363,357380836,146387678,383280379,1127268,299856826,13786789,1311054,46015217,3402130,381353319,30750059,218766885,340707375,27065817,355333104,2624634,62738384,241913553,304446010];
                let giUsed = snpgi;
                if(specialGiArray.includes(gi)) giUsed = gi;
                thisClass.showClinvarPart2(chnid, chnidBase, giUsed);
            }
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            if(bSnpOnly) {
                thisClass.processNoSnp(chnid);
            }
            else {
                thisClass.processNoClinvar(chnid);
            }
            return;
          }
       });
    }
    showSnpPart2(chnid, chnidBase, gi) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(gi !== undefined) {
            let url3 = "https://www.ncbi.nlm.nih.gov/projects/SNP/beVarSearch.cgi?appname=iCn3D&format=bed&report=pdb2bed&connect=MSSNPSUBMISSION1&gi=" + gi;

            $.ajax({
              url: url3,
              dataType: 'text',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data3) {
                if(data3) {
                    let bSnpOnly = true;
                    thisClass.processSnpClinvar(data3, chnid, chnidBase, bSnpOnly);
                } //if(data3 != "") {
                else {
                    let url4 = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_snp=" + chnidBase;
                    $.ajax({
                      url: url4,
                      dataType: 'jsonp', //'text',
                      cache: true,
                      tryCount : 0,
                      retryLimit : 1,
                      success: function(data4) {
                        if(data4 && data4.data && data4.data.length > 0) {
                            let bSnpOnly = true;
                            let bVirus = true;
                            thisClass.processSnpClinvar(data4, chnid, chnidBase, bSnpOnly, bVirus);
                        } //if(data4 != "") {
                        else {
                            thisClass.processNoSnp(chnid);
                        }
                        //if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
                      },
                      error : function(xhr, textStatus, errorThrown ) {
                        this.tryCount++;
                        if(this.tryCount <= this.retryLimit) {
                            //try again
                            $.ajax(this);
                            return;
                        }
                        thisClass.processNoSnp(chnid);
                        //if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
                        return;
                      }
                    });
                }
                //if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                this.processNoSnp(chnid);
                //if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
                return;
              }
            });
        }
        else {
            this.processNoSnp(chnid);
            console.log( "No gi was found for the chain " + chnidBase + "..." );
        }
    }
    processNoClinvar(chnid) { let ic = this.icn3d, me = ic.icn3dui;
            console.log( "No ClinVar data were found for the protein " + chnid + "..." );
            $("#" + ic.pre + 'dt_clinvar_' + chnid).html('');
            $("#" + ic.pre + 'ov_clinvar_' + chnid).html('');
            ic.showAnnoCls.enableHlSeq();
            ic.bAjaxClinvar = true;
            if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
    }
    processNoSnp(chnid) { let ic = this.icn3d, me = ic.icn3dui;
            console.log( "No SNP data were found for the protein " + chnid + "..." );
            $("#" + ic.pre + 'dt_snp_' + chnid).html('');
            $("#" + ic.pre + 'ov_snp_' + chnid).html('');
            ic.showAnnoCls.enableHlSeq();
            ic.bAjaxSnp = true;
            if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
    }

}

export {AnnoSnpClinVar}
