/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class AnnoSnpClinVar {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async showSnp(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        await this.showSnpClinvar(chnid, chnidBase, true);
    }
    async showClinvar(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        await this.showSnpClinvar(chnid, chnidBase, false);
    }

    //Show the annotations of SNPs and ClinVar.
    async showSnpClinvar(chnid, chnidBase, bSnpOnly) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // get gi from acc
        //var url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/chainid2repgi.txt";
        let url2 = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainid=" + chnidBase;
        try {
            let data2 = await me.getAjaxPromise(url2, 'jsonp');

            //ic.chainid2repgi = JSON.parse(data2);
            //var gi = ic.chainid2repgi[chnidBase];
            let snpgi = data2.snpgi;
            let gi = data2.gi;
            if(bSnpOnly) {
                await thisClass.showSnpPart2(chnid, chnidBase, snpgi);
            }
            else {
                let specialGiArray = [6137708,1942289,224510717,2624886,253723219,2554905,75765331,3660278,312207882,319443632,342350956,1827805,109157826,1065265,40889086,6730307,163931185,494469,163931091,60594093,55669745,18655489,17942684,6980537,166235465,6435586,4139398,4389047,364506122,78101667,262118402,20664221,2624640,158430173,494395,28948777,34810587,13399647,3660342,261278854,342350965,384482350,378792570,15988303,213424334,4558333,2098365,10835631,3318817,374074330,332639529,122919696,4389286,319443573,2781341,67464020,194709238,210061039,364506106,28949044,40889076,161172338,17943181,4557976,62738484,365813173,6137343,350610552,17942703,576308,223674070,15826518,1310997,93279697,4139395,255311799,157837067,361132363,357380836,146387678,383280379,1127268,299856826,13786789,1311054,46015217,3402130,381353319,30750059,218766885,340707375,27065817,355333104,2624634,62738384,241913553,304446010];
                let giUsed = snpgi;
                if(specialGiArray.includes(gi)) giUsed = gi;
                await thisClass.showClinvarPart2(chnid, chnidBase, giUsed);
            }
        }
        catch(err) {
            if(bSnpOnly) {
                thisClass.processNoSnp(chnid);
            }
            else {             
                thisClass.processNoClinvar(chnid);
            }
            return;
        }
    }

    navClinVar(chnid) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        ic.currClin[chnid] = - 1;
        //me.myEventCls.onIds("#" + ic.pre + chnid + "_prevclin", "click", function(e) { let ic = thisClass.icn3d;
        $(document).on("click", "#" + ic.pre + chnid + "_prevclin", function(e) { let ic = thisClass.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let maxLen =(ic.resi2disease_nonempty[chnid] !== undefined) ? Object.keys(ic.resi2disease_nonempty[chnid]).length : 0;
          --ic.currClin[chnid];
          if(ic.currClin[chnid] < 0) ic.currClin[chnid] = maxLen - 1; // 0;
          thisClass.showClinVarLabelOn3D(chnid);
        });
        //me.myEventCls.onIds("#" + ic.pre + chnid + "_nextclin", "click", function(e) { let ic = thisClass.icn3d;
        $(document).on("click", "#" + ic.pre + chnid + "_nextclin", function(e) { let ic = thisClass.icn3d;
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
          residueid = chainid + '_' + (parseInt(resiArray[ic.currClin[chnid]]) + ic.baseResi[chnid]).toString();
 
          let label = '';
          let diseaseArray = ic.resi2disease_nonempty[chnid][resiArray[ic.currClin[chnid]]];
          for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
              if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                label = diseaseArray[k];
                break;
              }
          }
          if(label == '') label = (diseaseArray.length > 0) ? diseaseArray[0] : "N/A";

          let position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
          //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit
          let maxlen = 30;
          if(label.length > maxlen) label = label.substr(0, maxlen) + '...';
          ic.selectionCls.removeSelection();
          if(ic.labels == undefined) ic.labels = {}
          ic.labels['clinvar'] = [];
          //var size = Math.round(ic.LABELSIZE * 10 / label.length);
          let size = ic.LABELSIZE;
          let color = (ic.opts.background != 'black') ? ic.colorWhitebkgd : ic.colorBlackbkgd; //"#FFFF00";
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

   //getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
 
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

            if(!bVirus && ic.organism !== undefined && ic.organism.toLowerCase() !== 'human' && ic.organism.toLowerCase() !== 'homo sapiens') {
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
        let snpTypeHash = {}, currSnpTypeHash = {};
        let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.chains[chnid]);
        // for(let i = 1, il = ic.giSeq[chnid].length; i <= il; ++i) {
        for(let resid in residHash) {
            let i = resid.split('_')[2];
            
            if(resi2index[i] !== undefined) {            
                ++snpCnt;
                let snpType = '', allDiseaseTitle = '';
                for(let j = 0, jl = resi2snp[i].length; j < jl && !bSnpOnly; ++j) {
                    let diseaseArray = resi2disease[i][j].split('; ');
                    let sigArray = resi2sig[i][j].split('; ');
                    let diseaseTitle = '';
                    for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {   
                        // relax the restriction to show all clinvar    
                        //if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                            diseaseTitle += diseaseArray[k];
                            if(sigArray[k] != '') {
                                diseaseTitle += '(' + sigArray[k] + ')';
                            }
                            diseaseTitle += '; ';
                        //}
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

        if(bOverview) {
            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);
        }
        else {
            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');
        }

        for(let index = 1, indexl = ic.giSeq[chnid].length; index <= indexl; ++index) {
            let pos = ic.ParserUtilsCls.getResi(chnid, index - 1);
            let i = pos;

            if(bOverview) {
                if(resi2index[i] !== undefined) {
                    
                    // get the mouse over text
                    let cFull = ic.giSeq[chnid][index-1];
                    let c = cFull;
                    if(cFull.length > 1) {
                        c = cFull[0] + '..';
                    }
                    // let pos =(i >= ic.matchedPos[chnid] && i-1 - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i-1;

                    let snpTitle = pos + c + '>';
                    let allDiseaseTitle = '';
                    for(let j = 0, jl = resi2snp[i].length; j < jl; ++j) {
                        snpTitle += resi2snp[i][j];
                        if(!bSnpOnly) {
                            let diseaseArray = resi2disease[i][j].split('; ');
                            let sigArray = resi2sig[i][j].split('; ');
                            let diseaseTitle = '';
                            for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                // relax the restriction to show all clinvar
                                //if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                    diseaseTitle += diseaseArray[k];
                                    if(sigArray[k] != '') {
                                        diseaseTitle += '(' + sigArray[k] + ')';
                                    }
                                    diseaseTitle += '; ';
                                //}
                            }
                            allDiseaseTitle += diseaseTitle + ' | ';
                        }
                    }
                    html += ic.showSeqCls.insertGapOverview(chnid, index-1);
                    let emptyWidth = Math.round(ic.seqAnnWidth *(index-1) /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth);
                    //let emptyWidth =(me.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth *(i-1) /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth *(i-1) / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
                    //if(emptyWidth < 0) emptyWidth = 0;
                    if(bClinvar) {
                        // if(snpTypeHash[i] == 'icn3d-clinvar' || snpTypeHash[i] == 'icn3d-clinvar-path') {
                            if(emptyWidth >= 0) {
                                html += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                                html += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + snpTitle + '">&nbsp;</div>';
                                prevEmptyWidth += emptyWidth;
                                prevLineWidth += widthPerRes;
                            }
                        // }
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
              html += ic.showSeqCls.insertGap(chnid, index-1, '-');

              if(resi2index[i] !== undefined) {
                  if(!bClinvar && line == 1) {
                      html += '<span>&dArr;</span>'; // or down triangle &#9660;
                  }
                  else {
                    let cFull = ic.giSeq[chnid][index-1];
                    let c = cFull;
                    if(cFull.length > 1) {
                      c = cFull[0] + '..';
                    }
                    // let pos =(i >= ic.matchedPos[chnid] && i-1 - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i-1;
                    // let pos = ic.ParserUtilsCls.getResi(chnid, index - 1);
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
                                // disease and significance
                                let diseaseArray = resi2disease[i][j].split('; ');
                                let sigArray = resi2sig[i][j].split('; ');
                                let diseaseTitle = '';
                                let index = 0;
                                for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                    // relax the restriction to show all clinvar
                                    //if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                        if(index > 0) {
                                            diseaseTitle += '; ';
                                        }
                                        else {
                                            if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                        }
                                        diseaseTitle += diseaseArray[k];
                                        if(sigArray[k] != '') {
                                            diseaseTitle += '(' + sigArray[k] + ')';
                                        }
                                        ++index;
                                    //}
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
                                    snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' style='color:blue' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' style='color:blue' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
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

                            // disease and significance
                            let diseaseArray = resi2disease[i][j].split('; ');
                            let sigArray = resi2sig[i][j].split('; ');
                            let diseaseTitle = '';
                            let indexTmp = 0;
                            
                            for(let k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                // relax the restriction to show all clinvar
                                //if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                    if(indexTmp > 0) {
                                        diseaseTitle += '; ';
                                    }
                                    else {
                                        if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                    }
                                    diseaseTitle += diseaseArray[k];
                                    if(sigArray[k] != '') {
                                        diseaseTitle += '(' + sigArray[k] + ')';
                                    }
                                    ++indexTmp;
                                //}
                            }

                            // if(diseaseTitle != '') {
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
                                snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' style='color:blue' target='_blank'>ClinVar</a>";
                                if(resi2rsnum[i][j] != 0) {
                                    snpTitle += ", <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' style='color:blue' target='_blank'>dbSNP(rs" + resi2rsnum[i][j] + ")</a>";
                                }
                                if(j < jl - 1) {
                                    snpTitle += '<br><br>';
                                }
                                ++diseaseCnt;
                            // } // if(diseaseTitle != '') {
                        } // for(let j = start; j < jl && j < end; ++j) {
                        //if(diseaseCnt > shownResCnt && line == 3) snpStr += '..';
                        if(diseaseCnt > shownResCnt && line == 2) snpStr += '..';
                    } // else { // if(bClinvar)
                    snpTitle += '</div>';
                    if(bClinvar) {                
                        // if(snpTypeHash[i] == 'icn3d-clinvar' || snpTypeHash[i] == 'icn3d-clinvar-path') {
                            if(line == 1) {
                                html += '<span>&dArr;</span>'; // or down triangle &#9660;
                            }
                            else {
                                if(snpStr == '' || snpStr == ' ') {
                                    html += '<span>-</span>';
                                }
                                else {
                                    // html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                                    html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + snpTypeHash[i] + '">' + snpStr + '</span>';
                                }
                            }
                        // }
                        // else {
                        //     html += '<span>-</span>';
                        // }
                    }
                    else {
                        if(snpStr == '' || snpStr == ' ') {
                            html += '<span>-</span>';
                        }
                        else {
                            if(!bSnpOnly) {
                                // html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                                html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + snpTypeHash[i] + '">' + snpStr + '</span>';
                            }
                            else {
                                // html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                                html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" class="icn3d-tooltip icn3d-residue ' + snpTypeHash[i] + '">' + snpStr + '</span>';
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

        if(!bOverview) {
            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');
        }
        
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
        if(me.bNode) {
            if(bSnpOnly) {
                if(!ic.resid2snp) ic.resid2snp = {};
                if(!ic.resid2snp[chnid]) ic.resid2snp[chnid] = [];
            }
            else {
                if(!ic.resid2clinvar) ic.resid2clinvar = {};
                if(!ic.resid2clinvar[chnid]) ic.resid2clinvar[chnid] = [];
            }
        }

        let foundRealSnp = {};
        for(let i = 0, il = lineArray.length; i < il; ++i) {
         //bSnpOnly: false
         //1310770    13    14    14Y>H    368771578    150500    Hereditary cancer-predisposing syndrome; Li-Fraumeni syndrome; not specified; Li-Fraumeni syndrome 1    Likely benign; Uncertain significance; Uncertain significance; Uncertain significance   0 
         //Pdb_gi, Pos from, Pos to, Pos & Amino acid change, rs#, ClinVar Allele ID, Disease name, Clinical significance, [whether data is directly from ClinVar database, 0 or 1]
         //bSnpOnly: true
         //1310770    13    14    14Y>H    1111111 0
         if(lineArray[i] != '') {
          let fieldArray =(!bSnpOnly || bVirus) ? lineArray[i] : lineArray[i].split('\t');
          let snpStr = fieldArray[3];
          let rsnum = fieldArray[4];
          let bFromClinVarDb = false;
          
          if(bSnpOnly) {
            if(fieldArray.length > 5) bFromClinVarDb =  parseInt(fieldArray[5]);
          }
          else {
            if(fieldArray.length > 8) bFromClinVarDb =  parseInt(fieldArray[8]);
          }
          if(snpStr == prevSnpStr) continue;
          prevSnpStr = snpStr;

          let posSymbol = snpStr.indexOf('>');
        //   let resiStr = snpStr.substr(0, snpStr.length - 3);
          let resiStr = snpStr.substr(0, posSymbol - 1);
          let resi = Math.round(resiStr);

          // if the data is From ClinVar Db directly, the residue numbers are PDB residue numbers. Otherwise, the residue numbers are NCBI residue numbers.
          let realResi = (bFromClinVarDb) ? resi : ic.ParserUtilsCls.getResi(chnid, resi - 1);

          let realSnp = realResi + snpStr.substr(posSymbol - 1);
          if(foundRealSnp.hasOwnProperty(realSnp)) {
            continue;
          }
          else {
            foundRealSnp[realSnp] = 1;
          }

          let snpResn = snpStr.substr(posSymbol - 1, 1);
          let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[chnid + '_' + realResi]);
        //   let oneLetterRes = (atom) ? me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3)) : ''; // !!!
          let oneLetterRes = (atom) ? me.utilsCls.residueName2Abbr(atom.resn) : '';
          if(!bFromClinVarDb && ic.chainsSeq[chnid][resi - 1]) {
            oneLetterRes = ic.chainsSeq[chnid][resi - 1].name;
          }

          if(snpResn != oneLetterRes) {
            // console.error("The snp " + snpStr + " didn't match the residue name " + oneLetterRes);
            continue;
          }

          if(me.bNode) {
              let obj = {};
            //   obj[chnid + '_' + resi] = snpStr;
              obj[chnid + '_' + realResi] = realSnp;
                
              if(bSnpOnly) {
                ic.resid2snp[chnid].push(obj);
              }
              else {
                ic.resid2clinvar[chnid].push(obj);
              }
          }

        //   let currRes = snpStr.substr(snpStr.length - 3, 1);
        //   let snpRes = snpStr.substr(snpStr.indexOf('>') + 1); //snpStr.substr(snpStr.length - 1, 1);
          let snpRes = realSnp.substr(realSnp.indexOf('>') + 1); //realSnp.substr(realSnp.length - 1, 1);
          //var rsnum = bSnpOnly ? '' : fieldArray[4];
          
          let clinAllele = bSnpOnly ? '' : fieldArray[5];
          let disease = bSnpOnly ? '' : fieldArray[6];  // When more than 2+ diseases, they are separated by "; "
                                        // Some are "not specified", "not provided"
          let clinSig = bSnpOnly ? '' : fieldArray[7];     // Clinical significance, When more than 2+ diseases, they are separated by "; "
          // "*" means terminating codon, "-" means deleted codon
          //if(currRes !== '-' && currRes !== '*' && snpRes !== '-' && snpRes !== '*') {
                
                // posHash[resi + ic.baseResi[chnid]] = 1;
                // if(disease != '') posClinHash[resi + ic.baseResi[chnid]] = 1;
                posHash[realResi] = 1;
                if(disease != '') posClinHash[realResi] = 1;
                resi2index[realResi] = i + 1;
                if(resi2snp[realResi] === undefined) {
                    resi2snp[realResi] = [];
                }
                resi2snp[realResi].push(snpRes);
                if(resi2rsnum[realResi] === undefined) {
                    resi2rsnum[realResi] = [];
                }
                resi2rsnum[realResi].push(rsnum);
                if(resi2clinAllele[realResi] === undefined) {
                    resi2clinAllele[realResi] = [];
                }
                resi2clinAllele[realResi].push(clinAllele);
                if(resi2disease[realResi] === undefined) {
                    resi2disease[realResi] = [];
                }
                resi2disease[realResi].push(disease);
                if(disease != '') {
                    if(ic.resi2disease_nonempty[chnid][realResi] === undefined) {
                        ic.resi2disease_nonempty[chnid][realResi] = [];
                    }
                    ic.resi2disease_nonempty[chnid][realResi].push(disease);
                }
                if(resi2sig[realResi] === undefined) {
                    resi2sig[realResi] = [];
                }
                resi2sig[realResi].push(clinSig);
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
            let bClinvar = true;
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
            /// if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
        }
        else {
            ic.bAjaxClinvar = true;
            /// if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
        }
    }
    async showClinvarPart2(chnid, chnidBase, gi) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        if(!ic.chainid2uniport) await this.getUniprotForAllStructures();

        //var url = "https://www.ncbi.nlm.nih.gov/projects/SNP/beVarSearch_mt.cgi?appname=iCn3D&format=bed&report=pdb2bed&acc=" + chnidBase;
        //var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/clinvar.txt";
        let url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainid_clinvar=" + chnidBase + "&uniprot=" + ic.chainid2uniport[chnidBase];
        if(ic.chainsGene[chnid] && ic.chainsGene[chnid].geneSymbol) {
            url += "&gene=" + ic.chainsGene[chnid].geneSymbol;
        }

        try {
            let indata = await me.getAjaxPromise(url, 'jsonp');

            if(indata && indata.data && indata.data.length > 0) {
                let bSnpOnly = false;
                let data = indata;         
                
                thisClass.processSnpClinvar(data, chnid, chnidBase, bSnpOnly);
            }
            else {               
                thisClass.processNoClinvar(chnid);
            }
        }
        catch(err) {            
            thisClass.processNoClinvar(chnid);
            return;
        }
    }

    async getUniprotForAllStructures() { let ic = this.icn3d, me = ic.icn3dui;
        ic.chainid2uniport = {};

        // get UniProt ID ffrom chainid
        for(let structure in ic.structures) {
            if(structure.length > 5) {
                let chainidArray = ic.structures[structure];
                for(let i = 0, il = chainidArray.length; i < il; ++i) {
                    ic.chainid2uniport[chainidArray[i]] = structure;
                }
            }
            else {
                let structLower = structure.toLowerCase();
                let url = "https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/" + structLower;
                let dataJson = await me.getAjaxPromise(url, 'json');
                let data= dataJson[structLower]['UniProt']; 
                for(let uniprot in data) {
                    let chainDataArray = data[uniprot].mappings;
                    for(let i = 0, il = chainDataArray.length; i < il; ++i) {
                        let chain = chainDataArray[i].chain_id;
                        ic.chainid2uniport[structure + '_' + chain] = uniprot;
                    }
                }
            }
        }
    }

    async showSnpPart2(chnid, chnidBase, gi) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(!ic.chainid2uniport) await this.getUniprotForAllStructures();

        if(gi !== undefined) {          
            let url4 = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainid_snp=" + chnidBase + "&uniprot=" + ic.chainid2uniport[chnidBase];
            if(ic.chainsGene[chnid] && ic.chainsGene[chnid].geneSymbol) {
                url4 += "&gene=" + ic.chainsGene[chnid].geneSymbol;
            }

            try {
                let data4 = await me.getAjaxPromise(url4, 'jsonp');

                if(data4 && data4.data && data4.data.length > 0) {
                    let bSnpOnly = true;
                    let bVirus = true;
                    
                    thisClass.processSnpClinvar(data4, chnid, chnidBase, bSnpOnly, bVirus);
                } //if(data4 != "") {
                else {
                    thisClass.processNoSnp(chnid);
                }
                ///// if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
            }
            catch(err) {
                thisClass.processNoSnp(chnid);
                ///// if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
                return;
            }
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
            /// if(ic.deferredClinvar !== undefined) ic.deferredClinvar.resolve();
    }
    processNoSnp(chnid) { let ic = this.icn3d, me = ic.icn3dui;
            console.log( "No SNP data were found for the protein " + chnid + "..." );
            $("#" + ic.pre + 'dt_snp_' + chnid).html('');
            $("#" + ic.pre + 'ov_snp_' + chnid).html('');
            ic.showAnnoCls.enableHlSeq();
            ic.bAjaxSnp = true;
            /// if(ic.deferredSnp !== undefined) ic.deferredSnp.resolve();
    }

}

export {AnnoSnpClinVar}
