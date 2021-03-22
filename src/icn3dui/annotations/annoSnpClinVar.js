/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.navClinVar = function(chnid) { var me = this, ic = me.icn3d; "use strict";
    me.currClin[chnid] = - 1;
    $(document).on('click', "#" + me.pre + chnid + "_prevclin", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var maxLen = (me.resi2disease_nonempty[chnid] !== undefined) ? Object.keys(me.resi2disease_nonempty[chnid]).length : 0;
      --me.currClin[chnid];
      if(me.currClin[chnid] < 0) me.currClin[chnid] = maxLen - 1; // 0;
      me.showClinVarLabelOn3D(chnid);
    });
    $(document).on('click', "#" + me.pre + chnid + "_nextclin", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var maxLen = (me.resi2disease_nonempty[chnid] !== undefined) ? Object.keys(me.resi2disease_nonempty[chnid]).length : 0;
      ++me.currClin[chnid];
      if(me.currClin[chnid] > maxLen - 1) me.currClin[chnid] = 0; // me.resi2disease_nonempty[chnid].length - 1;
      me.showClinVarLabelOn3D(chnid);
    });
};
iCn3DUI.prototype.showClinVarLabelOn3D = function(chnid) { var me = this, ic = me.icn3d; "use strict";
      var resiArray = Object.keys(me.resi2disease_nonempty[chnid]);
      var chainid, residueid;
      chainid = chnid;
      residueid = chainid + '_' + resiArray[me.currClin[chnid]];
      var label = '';
      var diseaseArray = me.resi2disease_nonempty[chnid][resiArray[me.currClin[chnid]]];
      for(var k = 0, kl = diseaseArray.length; k < kl; ++k) {
          if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
            label = diseaseArray[k];
            break;
          }
      }
      var position = ic.centerAtoms(ic.hash2Atoms(ic.residues[residueid]));
      //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit
      var maxlen = 30;
      if(label.length > maxlen) label = label.substr(0, maxlen) + '...';
      me.removeSelection();
      if(ic.labels == undefined) ic.labels = {};
      ic.labels['clinvar'] = [];
      //var size = Math.round(ic.LABELSIZE * 10 / label.length);
      var size = ic.LABELSIZE;
      var color = "#FFFF00";
      me.addLabel(label, position.center.x + 1, position.center.y + 1, position.center.z + 1, size, color, undefined, 'clinvar');
      ic.hAtoms = {};
      for(var j in ic.residues[residueid]) {
          ic.hAtoms[j] = 1;
      }
      //ic.addResiudeLabels(ic.hAtoms);
      $("#clinvar_" + me.pre + residueid).addClass('icn3d-highlightSeq');
      if($("#" + me.pre + "modeswitch")[0] !== undefined && !$("#" + me.pre + "modeswitch")[0].checked) {
          me.setMode('selection');
      }
      ic.draw();
};
iCn3DUI.prototype.getSnpLine = function(line, totalLineNum, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, bStartEndRes, chnid, bOverview, bClinvar, bTitleOnly, bSnpOnly) { var me = this, ic = me.icn3d; "use strict";
    var html = '';
    var altName = bClinvar ? 'clinvar' : 'snp';
    // determine whether the SNPis from virus directly
    var bVirus = false;
    for(var resi in resi2rsnum) {
        for(var i = 0, il = resi2rsnum[resi].length; i < il; ++i) {
            if(resi2rsnum[resi][i] == 0) {
                bVirus = true;
                break;
            }
        }
        if(bVirus) break;
    }
    if(bStartEndRes) {
        var title1 = 'ClinVar', title2 = 'SNP', title2b = 'SNP', warning = "", warning2 = "";
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
        var buttonStyle = me.isMobile() ? 'none' : 'button';
        html += '<div id="' + me.pre + chnid + '_prevclin" style="display:inline-block; font-size:11px; font-weight:bold; width:60px!important;"><button class="link" style="-webkit-appearance:' + buttonStyle + '; height:18px; width:55px;"><span style="white-space:nowrap; margin-left:-40px;" title="Show the previous ClinVar on structure">&lt; ClinVar</span></button></div>';
        html += '<div id="' + me.pre + chnid + '_nextclin" style="display:inline-block; font-size:11px; font-weight:bold; width:60px!important;"><button class="link" style="-webkit-appearance:' + buttonStyle + '; height:18px; width:55px;"><span style="white-space:nowrap; margin-left:-40px;" title="Show the next ClinVar on structure">ClinVar &gt;</span></button></div>';
    }
    else {
        html += '<div class="icn3d-seqTitle"></div>';
    }
    var pre = altName;
    var snpCnt = 0, clinvarCnt = 0;
    var snpTypeHash = {}, currSnpTypeHash = {};
    for(var i = 1, il = me.giSeq[chnid].length; i <= il; ++i) {
        if(resi2index[i] !== undefined) {
            ++snpCnt;
            var snpType = '', allDiseaseTitle = '';
            for(var j = 0, jl = resi2snp[i].length; j < jl && !bSnpOnly; ++j) {
                var diseaseArray = resi2disease[i][j].split('; ');
                var sigArray = resi2sig[i][j].split('; ');
                var diseaseTitle = '';
                for(var k = 0, kl = diseaseArray.length; k < kl; ++k) {
                    if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                        diseaseTitle += diseaseArray[k] + ' (' + sigArray[k] + '); ';
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
        $("#" + me.pre + 'dt_clinvar_' + chnid).html('');
        $("#" + me.pre + 'ov_clinvar_' + chnid).html('');
        $("#" + me.pre + 'tt_clinvar_' + chnid).html('');
        $("#" + me.pre + 'dt_snp_' + chnid).html('');
        $("#" + me.pre + 'ov_snp_' + chnid).html('');
        $("#" + me.pre + 'tt_snp_' + chnid).html('');
        return '';
    }
    if(clinvarCnt == 0 && bClinvar) {
        $("#" + me.pre + 'dt_clinvar_' + chnid).html('');
        $("#" + me.pre + 'ov_clinvar_' + chnid).html('');
        $("#" + me.pre + 'tt_clinvar_' + chnid).html('');
        return '';
    }
    var cnt = bClinvar ? clinvarCnt : snpCnt;
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
    var diseaseStr = '';
    var prevEmptyWidth = 0;
    var prevLineWidth = 0;
    var widthPerRes = 1;
    for(var i = 1, il = me.giSeq[chnid].length; i <= il; ++i) {
        if(bOverview) {
            if(resi2index[i] !== undefined) {
                // get the mouse over text
                var cFull = me.giSeq[chnid][i-1];
                var c = cFull;
                if(cFull.length > 1) {
                    c = cFull[0] + '..';
                }
                var pos = (i >= me.matchedPos[chnid] && i-1 - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i-1;
                var snpTitle = pos + c + '>';
                var allDiseaseTitle = '';
                for(var j = 0, jl = resi2snp[i].length; j < jl; ++j) {
                    snpTitle += resi2snp[i][j];
                    if(!bSnpOnly) {
                        var diseaseArray = resi2disease[i][j].split('; ');
                        var sigArray = resi2sig[i][j].split('; ');
                        var diseaseTitle = '';
                        for(var k = 0, kl = diseaseArray.length; k < kl; ++k) {
                            if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                diseaseTitle += diseaseArray[k] + ' (' + sigArray[k] + '); ';
                            }
                        }
                        allDiseaseTitle += diseaseTitle + ' | ';
                    }
                }
                html += me.insertGapOverview(chnid, i-1);
                var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * (i-1) / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * (i-1) / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
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
          html += me.insertGap(chnid, i-1, '-');
          if(resi2index[i] !== undefined) {
              if(!bClinvar && line == 1) {
                  html += '<span>&dArr;</span>'; // or down triangle &#9660;
              }
              else {
                var cFull = me.giSeq[chnid][i-1];
                var c = cFull;
                if(cFull.length > 1) {
                  c = cFull[0] + '..';
                }
                var pos = (i >= me.matchedPos[chnid] && i-1 - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i-1 - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i-1;
                var snpStr = "", snpTitle = "<div class='snptip'>"
                //var snpType = '';
                var jl = resi2snp[i].length;
                var start = 0, end = 0;
                var shownResCnt;
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
                    for(var j = start; j < jl && j < end; ++j) {
                        var snpTmpStr = chnid + "_" + pos + "_" + resi2snp[i][j];
                        var buttonStyle = me.isMobile() ? 'none' : 'button';

                        var bCoord = true;
                        if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                            bCoord = false;
                        }

                        if(j < shownResCnt) snpStr += resi2snp[i][j];
                        snpTitle += pos + c + '>' + resi2snp[i][j];

                        if(!bSnpOnly) {
                            // disease and significace
                            var diseaseArray = resi2disease[i][j].split('; ');
                            var sigArray = resi2sig[i][j].split('; ');
                            var diseaseTitle = '';
                            var index = 0;
                            for(var k = 0, kl = diseaseArray.length; k < kl; ++k) {
                                if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                    if(index > 0) {
                                        diseaseTitle += '; ';
                                    }
                                    else {
                                        if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                    }
                                    diseaseTitle += diseaseArray[k] + ' (' + sigArray[k] + ')';
                                    ++index;
                                }
                            }

                            //resi2rsnum, resi2clinAllele,
                            if(diseaseTitle != '') {
                                //snpType = 'icn3d-clinvar';
                                snpTitle += ': ' + diseaseTitle;

                                if(bCoord) {
                                    snpTitle += '<br>' + me.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += me.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += me.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                }

                                //snpTitle += "<br>Links: <span class='" + me.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + me.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + me.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                                snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                            }
                            else {
                                if(bCoord) {
                                    snpTitle += '<br>' + me.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += me.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                    snpTitle += me.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                                }

                                //snpTitle += "<br>Links: <span class='" + me.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + me.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + me.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>"
                                snpTitle += "<br>Link: <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>"
                            }
                            if(j < jl - 1) {
                                //if(j < 1) snpStr += ';';
                                snpTitle += '<br><br>';
                            }
                        }
                        else { //if(bSnpOnly) {
                            if(bCoord) {
                                snpTitle += '<br>' + me.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                snpTitle += me.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                snpTitle += me.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                            }

                            if(resi2rsnum[i][j] != 0) {
                                //snpTitle += "<br>Links: <span class='" + me.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + me.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + me.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                                snpTitle += "<br>Link: <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                            }
                            else {
                                //snpTitle += "<br>Links: <span class='" + me.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + me.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + me.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>";
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
                    var diseaseCnt = 0;
                    for(var j = start; j < jl && j < end; ++j) {
                        var snpTmpStr = chnid + "_" + pos + "_" + resi2snp[i][j];
                        var buttonStyle = me.isMobile() ? 'none' : 'button';

                        var bCoord = true;
                        if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                            bCoord = false;
                        }

                        // disease and significace
                        var diseaseArray = resi2disease[i][j].split('; ');
                        var sigArray = resi2sig[i][j].split('; ');
                        var diseaseTitle = '';
                        var index = 0;
                        for(var k = 0, kl = diseaseArray.length; k < kl; ++k) {
                            if(diseaseArray[k] != '' && diseaseArray[k] != 'not specified' && diseaseArray[k] != 'not provided') {
                                if(index > 0) {
                                    diseaseTitle += '; ';
                                }
                                else {
                                    if( j === 0 || j === 1) diseaseStr = 'disease="' + diseaseArray[k] + '"';
                                }
                                diseaseTitle += diseaseArray[k] + ' (' + sigArray[k] + ')';
                                ++index;
                            }
                        }
                        if(diseaseTitle != '') {
                            if(diseaseCnt < shownResCnt) snpStr += resi2snp[i][j];
                            snpTitle += pos + c + '>' + resi2snp[i][j];
                            //snpType = 'icn3d-clinvar';
                            snpTitle += ': ' + diseaseTitle;

                            if(bCoord) {
                                snpTitle += '<br>' + me.addSnpButton(snpTmpStr, 'snpin3d', '3D with scap', 'SNP in 3D with scap', 70, buttonStyle) + '&nbsp;&nbsp;';
                                snpTitle += me.addSnpButton(snpTmpStr, 'snpinter', 'Interactions', 'SNP Interactions in 3D', 70, buttonStyle) + '&nbsp;&nbsp;';
                                snpTitle += me.addSnpButton(snpTmpStr, 'snppdb', 'PDB', 'Download SNP PDB', 35, buttonStyle);
                            }

                            //snpTitle += "<br>Links: <span class='" + me.pre + "snpin3d icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP in 3D with scap</span>, <span class='" + me.pre + "snpinter icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP Interactions in 3D</span>, <span class='" + me.pre + "snppdb icn3d-snplink' snp='" + chnid + "_" + pos + "_" + resi2snp[i][j] + "'>SNP PDB</span>, <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                            snpTitle += "<br>Links: <a href='https://www.ncbi.nlm.nih.gov/clinvar/?term=" + resi2clinAllele[i][j] + "[AlleleID]' target='_blank'>ClinVar</a>, <a href='https://www.ncbi.nlm.nih.gov/snp/?term=" + resi2rsnum[i][j] + "' target='_blank'>dbSNP (rs" + resi2rsnum[i][j] + ")</a>";
                            if(j < jl - 1) {
                                snpTitle += '<br><br>';
                            }
                            ++diseaseCnt;
                        } // if(diseaseTitle != '') {
                    } // for(var j = start; j < jl && j < end; ++j) {
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
                                html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
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
                            html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" ' + diseaseStr + ' class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
                        }
                        else {
                            html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" label title="' + snpTitle + '" class="icn3d-tooltip icn3d-residue ' + currSnpTypeHash[i] + '">' + snpStr + '</span>';
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
    //var end = bStartEndRes ? ic.chainsSeq[chnid][me.giSeq[chnid].length - 1 - me.matchedPos[chnid] ].resi : '';
    if(line == 1) {
        html += '<span class="icn3d-residueNum" title="residue count">&nbsp;' + cnt + ' Residues</span>';
    }
    else {
        html += '<span class="icn3d-residueNum"></span>';
    }
    html += '</span>';
    html += '<br>';
    return html;
};
iCn3DUI.prototype.processSnpClinvar = function(data, chnid, chnidBase, bSnpOnly, bVirus) { var me = this, ic = me.icn3d; "use strict";
    var html = '<div id="' + me.pre + chnid + '_snpseq_sequence" class="icn3d-dl_sequence">';
    var html2 = html;
    var html3 = html;
    var htmlClinvar = '<div id="' + me.pre + chnid + '_clinvarseq_sequence" class="icn3d-dl_sequence">';
    var htmlClinvar2 = htmlClinvar;
    var htmlClinvar3 = htmlClinvar;
    var lineArray = (!bSnpOnly || bVirus) ? data.data : data.split('\n');
    var resi2snp = {};
    var resi2index = {};
    var resi2disease = {};
    if(me.resi2disease_nonempty[chnid] === undefined) me.resi2disease_nonempty[chnid] = {};
    var resi2sig = {};
    var resi2rsnum = {};
    var resi2clinAllele = {};
    var posHash = {}, posClinHash = {};
    var prevSnpStr = '';
    for(var i = 0, il = lineArray.length; i < il; ++i) {
     //bSnpOnly: false
     //1310770    13    14    14Y>H    368771578    150500    Hereditary cancer-predisposing syndrome; Li-Fraumeni syndrome; not specified; Li-Fraumeni syndrome 1    Likely benign; Uncertain significance; Uncertain significance; Uncertain significance    1TSR_A    120407068    NP_000537.3
     //Pdb_gi, Pos from, Pos to, Pos & Amino acid change, rs#, ClinVar Allele ID, Disease name, Clinical significance, master accession, master_gi, master_accession.version
     //bSnpOnly: true
     //1310770    13    14    14Y>H    1111111
     if(lineArray[i] != '') {
      var fieldArray = (!bSnpOnly || bVirus) ? lineArray[i] : lineArray[i].split('\t');
      var snpStr = fieldArray[3];
      if(snpStr == prevSnpStr) continue;
      prevSnpStr = snpStr;
      var resiStr = snpStr.substr(0, snpStr.length - 3);
      var resi = Math.round(resiStr);
      var currRes = snpStr.substr(snpStr.length - 3, 1);
      var snpRes = snpStr.substr(snpStr.length - 1, 1);
      //var rsnum = bSnpOnly ? '' : fieldArray[4];
      var rsnum = fieldArray[4];
      var clinAllele = bSnpOnly ? '' : fieldArray[5];
      var disease = bSnpOnly ? '' : fieldArray[6];  // When more than 2+ diseases, they are separated by "; "
                                    // Some are "not specified", "not provided"
      var clinSig = bSnpOnly ? '' : fieldArray[7];     // Clinical significance, When more than 2+ diseases, they are separated by "; "
      // "*" means terminating codon, "-" means deleted codon
      //if(currRes !== '-' && currRes !== '*' && snpRes !== '-' && snpRes !== '*') {
            posHash[resi + me.baseResi[chnid]] = 1;
            if(disease != '') posClinHash[resi + me.baseResi[chnid]] = 1;
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
                if(me.resi2disease_nonempty[chnid][resi] === undefined) {
                    me.resi2disease_nonempty[chnid][resi] = [];
                }
                me.resi2disease_nonempty[chnid][resi].push(disease);
            }
            if(resi2sig[resi] === undefined) {
                resi2sig[resi] = [];
            }
            resi2sig[resi].push(clinSig);
      //}
     }
    }
    var posarray = Object.keys(posHash);
    var posClinArray = Object.keys(posClinHash);
    if(bSnpOnly) {
        var bClinvar = false;
        html += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, undefined, bSnpOnly);
        html += me.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
        //html += me.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
        html3 += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, true, bSnpOnly);
        html3 += me.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
        //html3 += me.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
        html2 += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, true, bClinvar, undefined, bSnpOnly);
        html += '</div>';
        html2 += '</div>';
        html3 += '</div>';
        $("#" + me.pre + 'dt_snp_' + chnid).html(html);
        $("#" + me.pre + 'ov_snp_' + chnid).html(html2);
        $("#" + me.pre + 'tt_snp_' + chnid).html(html3);
    }
    else {
    //if(!bSnpOnly && me.bClinvarCnt) {
        bClinvar = true;
        htmlClinvar += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, undefined, bSnpOnly);
        htmlClinvar += me.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
        //htmlClinvar += me.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, undefined, bSnpOnly);
        htmlClinvar3 += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, false, bClinvar, true, bSnpOnly);
        htmlClinvar3 += me.getSnpLine(2, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
        //htmlClinvar3 += me.getSnpLine(3, 3, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 0, chnid, false, bClinvar, true, bSnpOnly);
        htmlClinvar2 += me.getSnpLine(1, 2, resi2snp, resi2rsnum, resi2clinAllele, resi2disease, resi2index, resi2sig, posarray, posClinArray, 1, chnid, true, bClinvar, undefined, bSnpOnly);
        htmlClinvar += '</div>';
        htmlClinvar2 += '</div>';
        htmlClinvar3 += '</div>';
        $("#" + me.pre + 'dt_clinvar_' + chnid).html(htmlClinvar);
        $("#" + me.pre + 'ov_clinvar_' + chnid).html(htmlClinvar2);
        $("#" + me.pre + 'tt_clinvar_' + chnid).html(htmlClinvar3);
        me.navClinVar(chnid, chnidBase);
    }
    // add here after the ajax call
    me.enableHlSeq();
    if(bSnpOnly) {
        me.bAjaxSnp = true;
        if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
    }
    else {
        me.bAjaxClinvar = true;
        if(me.deferredClinvar !== undefined) me.deferredClinvar.resolve();
    }
};
iCn3DUI.prototype.showClinvarPart2 = function(chnid, chnidBase, gi) { var me = this, ic = me.icn3d; "use strict";
    //var url = "https://www.ncbi.nlm.nih.gov/projects/SNP/beVarSearch_mt.cgi?appname=iCn3D&format=bed&report=pdb2bed&acc=" + chnidBase;
    //var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/clinvar.txt";
    var url = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_clinvar=" + chnidBase;
    $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(indata) {
        if(indata && indata.data && indata.data.length > 0) {
            var bSnpOnly = false;
            var data = indata;
            me.processSnpClinvar(data, chnid, chnidBase, bSnpOnly);
        }
        else {
            me.processNoClinvar(chnid);
        }
        //if(me.deferredClinvar !== undefined) me.deferredClinvar.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        me.processNoClinvar(chnid);
        //if(me.deferredClinvar !== undefined) me.deferredClinvar.resolve();
        return;
      }
    });
};
iCn3DUI.prototype.showSnp = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    me.showSnpClinvar(chnid, chnidBase, true);
};
iCn3DUI.prototype.showClinvar = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    me.showSnpClinvar(chnid, chnidBase, false);
};
iCn3DUI.prototype.showSnpClinvar = function(chnid, chnidBase, bSnpOnly) { var me = this, ic = me.icn3d; "use strict";
   // get gi from acc
   //var url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/chainid2repgi.txt";
   var url2 = me.baseUrl + "vastdyn/vastdyn.cgi?chainid=" + chnidBase;
   $.ajax({
      url: url2,
      dataType: 'jsonp', //'text',
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data2) {
        //me.chainid2repgi = JSON.parse(data2);
        //var gi = me.chainid2repgi[chnidBase];
        var snpgi = data2.snpgi;
        var gi = data2.gi;
        if(bSnpOnly) {
            me.showSnpPart2(chnid, chnidBase, snpgi);
        }
        else {
            var specialGiArray = [6137708,1942289,224510717,2624886,253723219,2554905,75765331,3660278,312207882,319443632,342350956,1827805,109157826,1065265,40889086,6730307,163931185,494469,163931091,60594093,55669745,18655489,17942684,6980537,166235465,6435586,4139398,4389047,364506122,78101667,262118402,20664221,2624640,158430173,494395,28948777,34810587,13399647,3660342,261278854,342350965,384482350,378792570,15988303,213424334,4558333,2098365,10835631,3318817,374074330,332639529,122919696,4389286,319443573,2781341,67464020,194709238,210061039,364506106,28949044,40889076,161172338,17943181,4557976,62738484,365813173,6137343,350610552,17942703,576308,223674070,15826518,1310997,93279697,4139395,255311799,157837067,361132363,357380836,146387678,383280379,1127268,299856826,13786789,1311054,46015217,3402130,381353319,30750059,218766885,340707375,27065817,355333104,2624634,62738384,241913553,304446010];
            var giUsed = snpgi;
            if(specialGiArray.includes(gi)) giUsed = gi;
            me.showClinvarPart2(chnid, chnidBase, giUsed);
        }
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        if(bSnpOnly) {
            me.processNoSnp(chnid);
        }
        else {
            me.processNoClinvar(chnid);
        }
        return;
      }
   });
};
iCn3DUI.prototype.showSnpPart2 = function(chnid, chnidBase, gi) { var me = this, ic = me.icn3d; "use strict";
    if(gi !== undefined) {
        var url3 = "https://www.ncbi.nlm.nih.gov/projects/SNP/beVarSearch.cgi?appname=iCn3D&format=bed&report=pdb2bed&connect=MSSNPSUBMISSION1&gi=" + gi;

        $.ajax({
          url: url3,
          dataType: 'text',
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(data3) {
            if(data3) {
                var bSnpOnly = true;
                me.processSnpClinvar(data3, chnid, chnidBase, bSnpOnly);
            } //if(data3 != "") {
            else {
                var url4 = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_snp=" + chnidBase;
                $.ajax({
                  url: url4,
                  dataType: 'jsonp', //'text',
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data4) {
                    if(data4 && data4.data && data4.data.length > 0) {
                        var bSnpOnly = true;
                        var bVirus = true;
                        me.processSnpClinvar(data4, chnid, chnidBase, bSnpOnly, bVirus);
                    } //if(data4 != "") {
                    else {
                        me.processNoSnp(chnid);
                    }
                    //if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    me.processNoSnp(chnid);
                    //if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
                    return;
                  }
                });
            }
            //if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            me.processNoSnp(chnid);
            //if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
            return;
          }
        });
    }
    else {
        me.processNoSnp(chnid);
        console.log( "No gi was found for the chain " + chnidBase + "..." );
    }
};
iCn3DUI.prototype.processNoClinvar = function(chnid) { var me = this, ic = me.icn3d; "use strict";
        console.log( "No ClinVar data were found for the protein " + chnid + "..." );
        $("#" + me.pre + 'dt_clinvar_' + chnid).html('');
        $("#" + me.pre + 'ov_clinvar_' + chnid).html('');
        me.enableHlSeq();
        me.bAjaxClinvar = true;
        if(me.deferredClinvar !== undefined) me.deferredClinvar.resolve();
};
iCn3DUI.prototype.processNoSnp = function(chnid) { var me = this, ic = me.icn3d; "use strict";
        console.log( "No SNP data were found for the protein " + chnid + "..." );
        $("#" + me.pre + 'dt_snp_' + chnid).html('');
        $("#" + me.pre + 'ov_snp_' + chnid).html('');
        me.enableHlSeq();
        me.bAjaxSnp = true;
        if(me.deferredSnp !== undefined) me.deferredSnp.resolve();
};
