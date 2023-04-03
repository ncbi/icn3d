/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ShowSeq {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the sequences and secondary structures.
    showSeq(chnid, chnidBase, type, queryTitle, compTitle, queryText, compText) {  let ic = this.icn3d, me = ic.icn3dui;
        let bNonMmdb = false;
        let giSeq;
        if(me.cfg.mmdbid === undefined && me.cfg.gi === undefined && me.cfg.blast_rep_id === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined && me.cfg.mmdbafid === undefined) {
            bNonMmdb = true;
            giSeq = [];
            for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
                giSeq.push(ic.chainsSeq[chnid][i]);
            }
        }
        else {
            giSeq = ic.giSeq[chnid];
        }

        // remove null giSeq[i]
        let giSeqTmp = [];
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            if(giSeq[i]) {
                giSeqTmp.push(giSeq[i]);
            }
        }
        giSeq = giSeqTmp;

        //let divLength = me.htmlCls.RESIDUE_WIDTH * ic.giSeq[chnid].length + 200;
        let divLength = me.htmlCls.RESIDUE_WIDTH * (ic.giSeq[chnid].length + ic.nTotalGap) + 200;

        // let seqLength = ic.giSeq[chnid].length
        // if(seqLength > ic.maxAnnoLength) {
        //     ic.maxAnnoLength = seqLength;
        // }

        //let itemArray = ['giseq', 'cddsite', 'ptm', 'clinvar', 'snp', 'domain', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
        let itemArray = ['giseq', 'cddsite', 'clinvar', 'snp', 'ptm', 'ssbond', 'crosslink', 'transmem', 'domain', 'custom', 'interaction'];
        for(let i in itemArray) {
            let item = itemArray[i];
            if($("#" + ic.pre + item + "_" + chnid).length) $("#" + ic.pre + item + "_" + chnid).width(divLength);
        }
        // gi html
        let html = '', html2 = '', html3 = '', htmlTmp;
        html += '<div class="icn3d-dl_sequence">';
        html3 += '<div class="icn3d-dl_sequence">';
        // html to display protein positions(10, 20, etc)
        //if(Object.keys(ic.chains[chnid]).length > 10) {

        if(ic.giSeq[chnid].length > 10) {
            htmlTmp = '<div class="icn3d-residueLine" style="white-space:nowrap;">';
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            //if(ic.baseResi[chnid] != 0 &&(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.align !== undefined)) {
            if((me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.mmdbafid !== undefined) && atom.resi_ori !== undefined && atom.resi_ori != atom.resi && chnid.indexOf('Misc') == -1 ) {
                htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="NCBI Residue Numbers">NCBI Residue Numbers</div>';
            }
            else {
                htmlTmp += '<div class="icn3d-annoTitle" anno="0"></div>';
            }
            htmlTmp += '<span class="icn3d-residueNum"></span>';
            html3 += htmlTmp + '<br>';
            html += htmlTmp + '<span class="icn3d-seqLine">';
            let helixCnt = 0, sheetCnt = 0;
            let savedSsName = '';
            for(let i = 0, il = giSeq.length; i < il; ++i) {
              html += this.insertGap(chnid, i, '-');
              let currResi;
            //   if(bNonMmdb) {
            //     currResi = giSeq[i].resi;
            //   }
            //   else {
            //     currResi =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
            //   }
              currResi = ic.ParserUtilsCls.getResi(chnid, i);
              html += '<span>'
              if( currResi % 10 === 0) {
                //html += currResi + ' ';
                html += currResi;
              }

              // name of secondary structures
              let residueid = chnid + '_' + currResi;
              // do not overlap residue number with ss label
              let bshowSsName =(currResi % 10 != 0 && currResi % 10 != 1 && currResi % 10 != 9) ? true : false;
              if( ic.residues.hasOwnProperty(residueid) ) {
                let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                if(ic.secondaries[residueid] == 'H' && atom.ssbegin) {
                    ++helixCnt;

                    savedSsName = '<span class="icn3d-helix-color">H' + helixCnt + '</span>';

                    if(bshowSsName) {
                        html += savedSsName;
                        savedSsName = '';
                    }
                }
                else if(ic.secondaries[residueid] == 'E' && atom.ssbegin) {
                    ++sheetCnt;
                    if(ic.sheetcolor == 'green') {
                        savedSsName = '<span class="icn3d-sheet-color">S' + sheetCnt + '</span>';
                    }
                    else if(ic.sheetcolor == 'yellow') {
                        savedSsName = '<span class="icn3d-sheet-colory">S' + sheetCnt + '</span>';
                    }

                    if(bshowSsName) {
                        html += savedSsName;
                        savedSsName = '';
                    }
                }
                else if(atom.ssend) {
                    savedSsName = '';
                }

                if(savedSsName != '' && bshowSsName) {
                    html += savedSsName;
                    savedSsName = '';
                }
              }
              html += '</span>'
            }
            html += '<span class="icn3d-residueNum"></span>';
            html += '</span>';
            html += '<br>';
            html += '</div>';
            html3 += '</div>';
        }
        // html to display secondary structures
        htmlTmp = '<div class="icn3d-residueLine" style="white-space:nowrap;">';
        htmlTmp += '<div class="icn3d-annoTitle" anno="0"></div>';
        htmlTmp += '<span class="icn3d-residueNum"></span>';
        html3 += htmlTmp + '<br>';
        html += htmlTmp + '<span class="icn3d-seqLine">';
        for(let i = 0, il = giSeq.length; i < il; ++i) {
          html += this.insertGap(chnid, i, '-');
        //   let resi =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
          let resi = ic.ParserUtilsCls.getResi(chnid, i);
          let residueid = chnid + '_' + resi;
          if( ic.residues.hasOwnProperty(residueid) ) {
            if(ic.secondaries[residueid] == 'H') {
                if(i % 2 == 0) {
                    html += '<span class="icn3d-helix">';
                }
                else {
                    html += '<span class="icn3d-helix2">';
                }
                html += '&nbsp;</span>';
            }
            else if(ic.secondaries[residueid] == 'E') {
                let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                if(atom.ssend) {
                    if(ic.sheetcolor == 'green') {
                        html += '<span class="icn3d-sheet2">';
                    }
                    else if(ic.sheetcolor == 'yellow') {
                        html += '<span class="icn3d-sheet2y">';
                    }
                }
                else {
                    if(ic.sheetcolor == 'green') {
                        html += '<span class="icn3d-sheet">';
                    }
                    else if(ic.sheetcolor == 'yellow') {
                        html += '<span class="icn3d-sheety">';
                    }
                }
                html += '&nbsp;</span>';
            }
            else if(ic.secondaries[residueid] == 'c') {
                html += '<span class="icn3d-coil">&nbsp;</span>';
            }
            else if(ic.secondaries[residueid] == 'o') {
                html += '<span class="icn3d-other">&nbsp;</span>';
            }
          }
          else {
            html += '<span>-</span>'; //'<span>-</span>';
          }
        }
        html += '<span class="icn3d-residueNum"></span>';
        html += '</span>';
        html += '<br>';
        html += '</div>';
        html += '</div>'; // corresponds to above: html += '<div class="icn3d-dl_sequence">';
        html3 += '</div></div>';
        if(me.cfg.blast_rep_id === chnid) {
            htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence" style="border: solid 1px #000">';
        }
        else {
            htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        }
        let chainType = 'Protein', chainTypeFull = 'Protein';
        if(type !== undefined) {
            if(type == 'nucleotide') {
                chainType = 'Nucl.';
                chainTypeFull = 'Nucleotide';
            }
            else if(type == 'chemical') {
                chainType = 'Chem.';
                chainTypeFull = 'Chemical';
            }
        }
        // sequence, detailed view
        htmlTmp += '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;" title="' + chainTypeFull + ' ' + chnid + '">' + chainType + ' ' + chnid + '</span></div>';
        htmlTmp += '<span class="icn3d-residueNum" title="starting protein sequence number">' +(ic.baseResi[chnid]+1).toString() + '</span>';
        html3 += htmlTmp + '<br>';
        let htmlTmp2 = '<span class="icn3d-seqLine">';
        html += htmlTmp + htmlTmp2;
        html2 += htmlTmp + htmlTmp2;
        let pos, nGap = 0;

        for(let i = 0, il = giSeq.length; i < il; ++i) {
          html += this.insertGap(chnid, i, '-');
          if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(i)) nGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
          let cFull =(bNonMmdb) ? giSeq[i].name : giSeq[i];
          let c = cFull;
          if(cFull.length > 1) {
              c = cFull[0] + '..';
          }
          
        //   pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
          pos = ic.ParserUtilsCls.getResi(chnid, i);
              
          if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
              c = c.toLowerCase();
              html += '<span title="' + cFull + pos + '" class="icn3d-residue">' + c + '</span>';
          }
          else {
              let color = '333333';
              if(me.cfg.blast_rep_id == chnid && ic.fullpos2ConsTargetpos !== undefined && ic.fullpos2ConsTargetpos[i + nGap] !== undefined) {
                  color = ic.fullpos2ConsTargetpos[i + nGap].color;
              }
              else {
                  let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[chnid + '_' + pos]);
                  let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                  color =(atom.color !== undefined) ? colorStr : "CCCCCC";
              }
              html += '<span id="giseq_' + ic.pre + chnid + '_' + pos + '" title="' + cFull + pos + '" class="icn3d-residue" style="color:#' + color + '">' + c + '</span>';
          }
        }
        if(me.cfg.blast_rep_id == chnid) {
          // change color in 3D
          ic.opts['color'] = (ic.blastAcxn) ? 'confidence' : 'conservation';
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
          // remove highlight
          //ic.hlUpdateCls.removeHlSeq();
        }
        // sequence, overview
        let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
        let color =(atom.color) ? atom.color.getHexString() : "CCCCCC";
        let width = Math.round(ic.seqAnnWidth * giSeq.length / ic.maxAnnoLength);
        if(width < 1) width = 1;
        if(me.cfg.blast_rep_id != chnid) { // regular
            html2 += '<div id="giseq_summary_' + ic.pre + chnid + '" class="icn3d-seqTitle icn3d-link" gi chain="' + chnid + '" style="display:inline-block; color:white; font-weight:bold; background-color:#' + color + '; width:' + width + 'px;">' + chnid + '</div>';
        }
        else { // with potential gaps
            let fromArray2 = [], toArray2 = [];
            fromArray2.push(0);
            for(let i = 0, il = giSeq.length; i < il; ++i) {
                if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(i)) {
                    toArray2.push(i - 1);
                    fromArray2.push(i);
                }
            }
            toArray2.push(giSeq.length - 1);
            html2 += '<div id="giseq_summary_' + ic.pre + chnid + '" class="icn3d-seqTitle icn3d-link" gi chain="' + chnid + '" style="width:' + width + 'px;">';
            for(let i = 0, il = fromArray2.length; i < il; ++i) {
                html2 += this.insertGapOverview(chnid, fromArray2[i]);
                html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" anno="sequence" gi chain="' + chnid + '" title="' + chnid + '">' + chnid + '</div>';
            }
            html2 += '</div>';
        }
        htmlTmp = '<span class="icn3d-residueNum" title="ending protein sequence number">' + pos + '</span>';
        htmlTmp += '</span>';
        htmlTmp += '<br>';
        html += htmlTmp;
        html2 += htmlTmp;
        if(me.cfg.blast_rep_id == chnid) {
            // 1. residue conservation
            if(compText !== undefined && compText !== '') {
            // conservation, detailed view
            htmlTmp = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" blast="" posarray="' + ic.consrvResPosArray.toString() + '" title="' + compTitle + '" setname="' + chnid + '_blast" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;" title="' + compTitle + '">' + compTitle + '</span></div>';
            htmlTmp += '<span class="icn3d-residueNum"></span>';
            html3 += htmlTmp + '<br>';
            let htmlTmp2 = '<span class="icn3d-seqLine">';
            html += htmlTmp + htmlTmp2;
            html2 += htmlTmp + htmlTmp2;
            let prevEmptyWidth = 0;
            let prevLineWidth = 0;
            let widthPerRes = 1;
            let queryPos = ic.queryStart;
            for(let i = 0, il = compText.length; i < il; ++i) {
              let c = compText[i];
              if(c == '-') {
                  html += '<span>-</span>';
              }
              else if(c == ' ') {
                  html += '<span> </span>';
              }
              else {
                  let pos = ic.fullpos2ConsTargetpos[i].pos;
                  if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                      c = c.toLowerCase();
                      html += '<span class="icn3d-residue">' + c + '</span>';
                  }
                  else {
                      let color = ic.fullpos2ConsTargetpos[i].color;
                      html += '<span id="giseq_' + ic.pre + chnid + '_' + pos + '" title="' + ic.fullpos2ConsTargetpos[i].res + pos + '" class="icn3d-residue" style="color:#' + color + '">' + c + '</span>';
                  }
                  html2 += this.insertGapOverview(chnid, i);
                  let emptyWidth = Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth);
                  //if(emptyWidth < 0) emptyWidth = 0;
                  if(emptyWidth >= 0) {
                  html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                  html2 += '<div style="display:inline-block; background-color:#F00; width:' + widthPerRes + 'px;" title="' + c + pos + '">&nbsp;</div>';
                  prevEmptyWidth += emptyWidth;
                  prevLineWidth += widthPerRes;
                  }
                  ++queryPos;
              }
            }
            htmlTmp = '<span class="icn3d-residueNum"></span>';
            htmlTmp += '</span>';
            htmlTmp += '<br>';
            html += htmlTmp;
            html2 += htmlTmp;
            }
            // 2. Query text
            // query protein, detailed view
            htmlTmp = '<div class="icn3d-annoTitle" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;" title="' + queryTitle + '">' + queryTitle + '</span></div>';
            htmlTmp += '<span class="icn3d-residueNum" title="starting protein sequence number">' + ic.queryStart + '</span>';
            html3 += htmlTmp + '<br>';
            //var htmlTmp2 = '<span class="icn3d-seqLine">';
            let htmlTmp2 = '<span class="icn3d-seqLine" style="font-weight: bold;">';
            html += htmlTmp + htmlTmp2;
            html2 += htmlTmp + htmlTmp2;
            let queryPos = ic.queryStart;
            for(let i = 0, il = queryText.length; i < il; ++i) {
              let c = queryText[i];
              if(c == ' ' || c == '-') {
                  html += '<span>-</span>';
              }
              else {
                  if( ic.fullpos2ConsTargetpos !== undefined && ic.fullpos2ConsTargetpos[i] !== undefined && !ic.residues.hasOwnProperty(chnid + '_' + ic.fullpos2ConsTargetpos[i].pos) ) {
                      c = c.toLowerCase();
                      html += '<span title="' + c + queryPos + '" class="icn3d-residue">' + c + '</span>';
                  }
                  else {
                      html += '<span title="' + c + queryPos + '" class="icn3d-residue">' + c + '</span>';
                  }
                  ++queryPos;
              }
            }
            // query protein, overview
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            let color =(atom.color !== undefined) ? colorStr : "CCCCCC";
            let fromArray2 = [], toArray2 = [];
            let prevChar = '-';
            for(let i = 0, il = queryText.length; i < il; ++i) {
                let c = queryText[i];
                if(c != '-' && prevChar == '-') {
                    fromArray2.push(i);
                }
                else if(c == '-' && prevChar != '-' ) {
                    toArray2.push(i-1);
                }
                prevChar = c;
            }
            if(prevChar != '-') {
                toArray2.push(queryText.length - 1);
            }
            for(let i = 0, il = fromArray2.length; i < il; ++i) {
                let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray2[i] - ic.baseResi[chnid] - 1) /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
                html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" anno="sequence" chain="' + chnid + '" title="' + queryTitle + '">' + queryTitle + '</div>';
            }
            htmlTmp = '<span class="icn3d-residueNum" title="ending protein sequence number">' + ic.queryEnd + '</span>';
            htmlTmp += '</span>';
            htmlTmp += '<br>';
            html += htmlTmp;
            html2 += htmlTmp;
        }
        html += '</div>';
        html2 += '</div>';
        html3 += '</div>';

        //if(Object.keys(ic.chains[chnid]).length > 10) {
        if(ic.giSeq[chnid].length > 10) {
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            //if(ic.baseResi[chnid] != 0 &&(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.align !== undefined)) {
            if((me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.mmdbafid !== undefined) && atom.resi_ori !== undefined && atom.resi_ori != atom.resi && chnid.indexOf('Misc') == -1 ) {
                htmlTmp = '<div class="icn3d-dl_sequence">';
                htmlTmp += '<div class="icn3d-residueLine" style="white-space:nowrap;">';
                htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="PDB Residue Numbers">PDB Residue Numbers</div>';
                htmlTmp += '<span class="icn3d-residueNum"></span>';
                html3 += htmlTmp + '<br>';
                html += htmlTmp + '<span class="icn3d-seqLine">';
                for(let i = 0, il = giSeq.length; i < il; ++i) {
                    html += this.insertGap(chnid, i, '-');
                    //if(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) {
                    //   let currResi = ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi;
                      let currResi = ic.ParserUtilsCls.getResi(chnid, i);
                      let residueid = chnid + '_' + currResi;
                      if(!ic.residues.hasOwnProperty(residueid)) {
                          html += '<span></span>';
                      }
                      else {
                          let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                          let resi_ori = atom.resi_ori;
                          html += '<span>';
                          if( resi_ori % 10 === 0) {
                            html += resi_ori + ' ';
                          }
                          html += '</span>';
                      }
                    // }
                    // else {
                    //   html += '<span></span>';
                    // }
                }
                html += '<span class="icn3d-residueNum"></span>';
                html += '</span>';
                html += '<br>';
                html += '</div>';
                html += '</div>';
                html3 += '</div></div>';
            }         
            else if(ic.bShowRefnum && ic.chainid2index.hasOwnProperty(chnid)) {              
                let result = this.showRefNum(giSeq, chnid);
                html += result.html;
                html3 += result.html3;

                let kabat_or_imgt = 1;
                result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
                html += result.html;
                html3 += result.html3;

                kabat_or_imgt = 2;
                result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
                html += result.html;
                html3 += result.html3;
            }
            else if(ic.bShowCustomRefnum && ic.chainsMapping.hasOwnProperty(chnid)) {              
                let bCustom = true;
                let result = this.showRefNum(giSeq, chnid, undefined, bCustom);
                html += result.html;
                html3 += result.html3;
            }
        }

        // highlight reference numbers
        if(ic.bShowRefnum) {
            ic.hAtoms = ic.hAtomsRefnum;
            
            // commented out because it produced too many commands
            // let name = 'refnum_anchors';
            // ic.selectionCls.saveSelection(name, name);
            
            ic.hlUpdateCls.updateHlAll();
        }

        $("#" + ic.pre + 'dt_giseq_' + chnid).html(html);
        $("#" + ic.pre + 'ov_giseq_' + chnid).html(html2);
        $("#" + ic.pre + 'tt_giseq_' + chnid).html(html3); // fixed title for scrolling
    }

    showRefNum(giSeq, chnid, kabat_or_imgt, bCustom) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html3 = '';

        let chainList = '';
        for(let i = 0, il = ic.chainid2index[chnid].length; i < il; ++i) {
            chainList += ic.refpdbArray[ic.chainid2index[chnid][i]] + " ";
        }

        let refStruTitle = (chainList) ? "based on " + chainList : "";

        let htmlTmp = '<div class="icn3d-dl_sequence">';
        htmlTmp += '<div class="icn3d-residueLine" style="white-space:nowrap;">';
        if(bCustom) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="Custom Reference Numbers">Custom Ref. No.</div>';
        }
        else if(kabat_or_imgt == 1) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="Kabat Reference Numbers ' + refStruTitle + '">Kabat Ref. No.</div>';
        }
        else if(kabat_or_imgt == 2) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="IMGT Reference Numbers ' + refStruTitle + '">IMGT Ref. No.</div>';
        }
        else {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="IgStRAnD Reference Numbers ' + refStruTitle + '">IgStRAnD Ref. No.</div>';
        }
        htmlTmp += '<span class="icn3d-residueNum"></span>';
        html3 += htmlTmp + '<br>';
        html += htmlTmp + '<span class="icn3d-seqLine">';

        //check if Kabat refnum available
        let bKabatFound = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];

            if(ic.domainid2ig2kabat[domainid] && Object.keys(ic.domainid2ig2kabat[domainid]).length > 0) {
                bKabatFound = true;
                break;
            }
        }
        if(kabat_or_imgt == 1 && !bKabatFound) {
            return {html: '', html3: ''};
        }

        //check if Kabat refnum available
        let bImgtFound = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];

            if(ic.domainid2ig2imgt[domainid] && Object.keys(ic.domainid2ig2imgt[domainid]).length > 0) {
                bImgtFound = true;
                break;
            }
        }
        if(kabat_or_imgt == 2 && !bImgtFound) {
            return {html: '', html3: ''};
        }

        // auto-generate ref numbers for loops 
        let bLoop = false, currStrand = '', prevStrand = '', currFirstDigit = '', currCnt =  1;
        let refnumLabel, refnumStr_ori, refnumStr, postfix, refnum;

        // set hash for the loops
        let strand2len_start_stop = {};
        let prevRefnumStr, prevPostfix, prevRefnum;

        // sometimes one chain may have several Ig domains,set a index for each IgDomain
        let index = 1, prevStrandPostfix = '', bStart = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            //if(ic.residues.hasOwnProperty(residueid)) {
                refnumLabel = ic.resid2refnum[residueid];
                if(refnumLabel) {                        
                    refnumStr_ori = refnumLabel.replace(/'/g, '').replace(/\*/g, '').replace(/\^/g, '').substr(1); // C', C''
                    currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                    currFirstDigit = refnumStr_ori.substr(0, 1);

                    refnumStr = refnumStr_ori;
                    refnum = parseInt(refnumStr);
                    postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;

                    if(!bCustom && !kabat_or_imgt) {
                        if(currStrand != prevStrand) { // reset currCnt
                            // end of a loop
                            if(strand2len_start_stop[prevStrand + prevPostfix]) {
                                strand2len_start_stop[prevStrand + prevPostfix].len = currCnt - 1;
                                strand2len_start_stop[prevStrand + prevPostfix].end = refnumStr;
                                strand2len_start_stop[prevStrand + prevPostfix].nextStrand = currStrand;
                            }

                            bStart = false;

                            currCnt = 1;
                        }

                        // sometimes insertions may happen inside a strand. Reset currCnt
                        if(currStrand == prevStrand && refnum > 1000 && refnumStr.substr(1,1) != '9') { // strand region
                            currCnt = 1;
                            
                            if(bStart && prevStrandPostfix) {
                                delete strand2len_start_stop[prevStrandPostfix];
                                prevStrandPostfix = '';
                            }
                        }

                        // #9##
                        if(prevStrand && currStrand != ' ' && refnum > 1000 && refnumStr.substr(1,1) == '9') { // loop region
                            if(currCnt == 1) { // start of a loop
                                if(strand2len_start_stop.hasOwnProperty(currStrand + postfix)) { // the strand appeared in 2nd Id domain
                                    ++index;
                                }
                                
                                postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;
                                strand2len_start_stop[currStrand + postfix] = {};

                                strand2len_start_stop[currStrand + postfix].start = prevRefnumStr;
                                strand2len_start_stop[currStrand + postfix].chainid = chnid;

                                //prevStrandPostfix = currStrand + postfix;
                            }
                            refnumStr = (parseInt(currFirstDigit) * 1000 + 900 + currCnt).toString();
                            refnumLabel = currStrand + refnumStr;
                            
                            ++currCnt;
                        }
                    }
                }
                else {
                    if(prevStrand && currStrand != ' ' && !bCustom && !kabat_or_imgt) {
                        if(currCnt == 1) { // start of a loop
                            if(strand2len_start_stop.hasOwnProperty(currStrand + postfix)) { // the strand appeared in 2nd Id domain
                                ++index;
                                postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;
                                strand2len_start_stop[currStrand + postfix] = {};
                            }
                            else {
                                strand2len_start_stop[currStrand + postfix] = {};
                            }

                            strand2len_start_stop[currStrand + postfix].start = prevRefnumStr;
                            strand2len_start_stop[currStrand + postfix].chainid = chnid;

                            prevStrandPostfix = currStrand + postfix;
                            bStart = true;
                        }
                        
                        // no ref num
                        refnumStr = (parseInt(currFirstDigit) * 1000 + 900 + currCnt).toString();
                        refnumLabel = currStrand + refnumStr;
                        ++currCnt;
                    }
                }

                prevRefnumStr = refnumStr;
                prevRefnum = refnum;
                prevPostfix = postfix;
            //}

            prevStrand = currStrand;
        }
        if(strand2len_start_stop[prevStrand + prevPostfix]) {
            strand2len_start_stop[prevStrand + prevPostfix].len = currCnt - 1;
            strand2len_start_stop[prevStrand + prevPostfix].end = prevRefnumStr;
            //strand2len_start_stop[prevStrand].nextStrand = undefined;
        }
        
        let refnumLabelNoPostfix;
        // sometimes one chain may have several Ig domains,set a index for each IgDomain
        index = 1;
        prevStrandPostfix = '';
        bStart = false;
        let appearedStrands = {}, currStrand_ori, bShowRefnum = true;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            bLoop = false;

            html += this.insertGap(chnid, i, '-');

            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];
            //if(!ic.residues.hasOwnProperty(residueid)) {
            //    html += '<span></span>';
            //}
            //else {
                refnumLabel = ic.resid2refnum[residueid];
                let bHidelabel = false;

                if(refnumLabel) {                        
                    refnumStr_ori = refnumLabel.replace(/'/g, '').replace(/\*/g, '').replace(/\^/g, '').substr(1); // C', C''
                    currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                    currStrand_ori = currStrand;

                    currFirstDigit = refnumStr_ori.substr(0, 1);

                    refnumLabelNoPostfix = currStrand + parseInt(refnumStr_ori);

                    if(currStrand_ori != prevStrand) { // reset currCnt
                        bStart = false;
                        currCnt = 1;
                    }

                    if(bCustom) {
                        refnumStr = refnumLabel;
                    }
                    else if(kabat_or_imgt == 1) {
                        refnumStr = (ic.domainid2ig2kabat[domainid]) ? ic.domainid2ig2kabat[domainid][refnumStr_ori] : undefined;                            
                    }
                    else if(kabat_or_imgt == 2) {
                        refnumStr = (ic.domainid2ig2imgt[domainid]) ? ic.domainid2ig2imgt[domainid][refnumStr_ori] : undefined;                            
                    }
                    else {
                        refnumStr = refnumStr_ori;
                        refnum = parseInt(refnumStr);
                        postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;

                        // sometimes insertions may happen inside a strand. Reset currCnt
                        if(currStrand_ori == prevStrand && refnum > 1000 && refnumStr.substr(1,1) != '9') { // strand region
                            currCnt = 1;
                            
                            if(bStart && prevStrandPostfix) {
                                --index;
                                prevStrandPostfix = '';
                            }
                        }

                        // #9##
                        if(prevStrand && refnum > 1000 && refnumStr.substr(1,1) == '9') { // loop region
                            bLoop = true;

                            if(currCnt == 1) { // start of a loop
                                if(appearedStrands.hasOwnProperty(currStrand_ori + postfix)) { // the strand appeared in 2nd Id domain
                                    ++index;
                                    postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;
                                }

                                appearedStrands[currStrand_ori + postfix] = 1;
                            }

                            let result = this.getAdjustedRefnum(strand2len_start_stop, currStrand_ori, currCnt, currFirstDigit, postfix, prevRefnum);

                            refnum = result.refnum;
                            bShowRefnum = result.bShowRefnum;
                            refnumStr = result.refnumStr;
                            refnumLabel = result.refnumLabel;
                            refnumLabelNoPostfix = result.refnumLabelNoPostfix;

                            bHidelabel = result.bHidelabel;
                            currStrand = refnumLabel.replace(new RegExp(refnumStr,'g'), '');

                            ++currCnt;
                        }

                        prevRefnum = refnum;
                    }
                
                    if(bCustom) {
                        if(!refnumStr) {                               
                            html += '<span></span>';
                        }
                        else {
                            let refnum = parseInt(refnumStr);

                            if(refnum % 2 == 0) {
                                html += '<span title="' + refnumStr + '">' + refnumStr + '</span>';
                            }
                            else {
                                html += '<span title="' + refnumStr + '">&nbsp;</span>';
                            }
                        }
                    }
                    else if(kabat_or_imgt == 1 || kabat_or_imgt == 2) {
                        if(!refnumStr) {                               
                            html += '<span></span>';
                        }
                        else {
                            let refnum = parseInt(refnumStr).toString();
                            let color = this.getRefnumColor(currStrand);
                            let colorStr = 'style="color:' + color + '"'

                            let lastTwo = parseInt(refnum.substr(refnum.length - 2, 2));

                            if(lastTwo % 2 == 0) {
                                html += '<span ' + colorStr + ' title="' + refnumStr + '">' + refnumStr + '</span>';
                            }
                            else {
                                html += '<span ' + colorStr + ' title="' + refnumStr + '">&nbsp;</span>';
                            }
                        }
                    }
                    else {
                        if(bShowRefnum && currStrand != ' ') {
                            html += this.getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel);
                            if(bLoop) ic.residIgLoop[residueid] = 1;
                        }
                        else {
                            html += '<span></span>';
                        }
                    }
                }
                else {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[residueid]);

                    // skip non-protein residues
                    // after G strand and before A strand, just use the mapped reference number
                    if((!atom || ic.proteins.hasOwnProperty(atom.serial)) && prevStrand && !bCustom && !kabat_or_imgt
                      && (!currStrand_ori || currStrand_ori.substr(0,1) != 'G')) {
                        // no ref num
                        bLoop = true;

                        if(currCnt == 1) { // start of a loop
                            if(appearedStrands.hasOwnProperty(currStrand_ori + postfix)) { // the strand appeared in 2nd Id domain
                                ++index;
                            }
                            
                            postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;

                            appearedStrands[currStrand_ori + postfix] = 1;

                            bStart = true;
                            prevStrandPostfix = currStrand_ori + postfix;
                        }

                        // use previous postfix
                        let result = this.getAdjustedRefnum(strand2len_start_stop, currStrand_ori, currCnt, currFirstDigit, postfix, prevRefnum);

                        refnum = result.refnum;
                        bShowRefnum = result.bShowRefnum;                        
                        refnumStr = result.refnumStr
                        refnumLabel = result.refnumLabel;
                        refnumLabelNoPostfix = result.refnumLabelNoPostfix;

                        prevRefnum = refnum;

                        bHidelabel = result.bHidelabel;
                        currStrand = refnumLabel.replace(new RegExp(refnumStr,'g'), '');
                  
                        ++currCnt;

                        if(bShowRefnum && currStrand != ' ') {
                            html += this.getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel);
                            if(bLoop) ic.residIgLoop[residueid] = 1;
                        }
                        else {
                            html += '<span></span>';
                        }
                    }
                    else {
                        html += '<span></span>';
                    }
                }

                // assign the adjusted reference numbers
                ic.resid2refnum[residueid] = refnumLabel;

                if(!ic.refnum2residArray.hasOwnProperty(refnumStr)) {
                    ic.refnum2residArray[refnumStr] = [residueid];
                }
                else {
                    ic.refnum2residArray[refnumStr].push(residueid);
                }

                if(!ic.chainsMapping.hasOwnProperty(chnid)) {
                    ic.chainsMapping[chnid] = {};
                }

                // remove the postfix when comparing interactions
                //ic.chainsMapping[chnid][residueid] = refnumLabel;
                ic.chainsMapping[chnid][residueid] = refnumLabelNoPostfix;
            //}

            prevStrand = currStrand_ori; //currStrand;
        }

        html += '<span class="icn3d-residueNum"></span>';
        html += '</span>';
        html += '<br>';
        html += '</div>';
        html += '</div>';
        html3 += '</div></div>';

        return {html: html, html3: html3}
    }

    getAdjustedRefnum(strand2len_start_stop, currStrand, currCnt, currFirstDigit, postfix, prevRefnum) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum, refnumStr, refnumLabel, refnumLabelNoPostfix;

        let bHidelabel = false; // do not show the label
        let bShowRefnum = true;

        if(strand2len_start_stop[currStrand + postfix]) {
            let start = parseInt(strand2len_start_stop[currStrand + postfix].start);
            let end = parseInt(strand2len_start_stop[currStrand + postfix].end);
            // e.g., 2150a
            let postfixStart = strand2len_start_stop[currStrand + postfix].start.replace(start.toString(), '');
            let postfixEnd = strand2len_start_stop[currStrand + postfix].end.replace(end.toString(), '');

            let len = strand2len_start_stop[currStrand + postfix].len;
            let halfLen = (strand2len_start_stop[currStrand + postfix].nextStrand) ? parseInt(len / 2.0 + 0.5) : len;

            if(currCnt <= halfLen) {
                refnum = start + currCnt;
                refnumStr = refnum + postfixStart;
                refnumLabel = currStrand + refnumStr;
            }
            else {
                refnum = end - (len + 1 - currCnt);
                refnumStr = refnum + postfixEnd;
                
                refnumLabel = (strand2len_start_stop[currStrand + postfix].nextStrand !== undefined) ? strand2len_start_stop[currStrand + postfix].nextStrand + refnumStr : ' ' + refnumStr;
            }

            refnumLabelNoPostfix = currStrand + refnum;

            //if(currCnt == 0 || currCnt == halfLen || currCnt == halfLen + 1 || currCnt == end - 1) {
            // if(currCnt == 1 || currCnt == halfLen || currCnt == halfLen + 1 || currCnt == end - 1) {
            //     bHidelabel = true;
            // }
            if(currCnt == 1 || currCnt == end - 1) {
                bHidelabel = true;
            }

            if(currCnt == 1 && start != prevRefnum) { // skip insertions
                bShowRefnum = false;
                
                refnum = 0;
                refnumStr = '';
                refnumLabel = '';
                refnumLabelNoPostfix = '';
            }
        }
        else {
            // refnumStr = (parseInt(currFirstDigit) * 1000 + 900 + currCnt).toString();
            // refnumLabel = currStrand + refnumStr;

            refnum = 0;
            refnumStr = '';
            refnumLabel = '';
            refnumLabelNoPostfix = '';

            bHidelabel = true;
        }

        return {refnum: refnum, refnumStr: refnumStr, refnumLabel: refnumLabel, refnumLabelNoPostfix: refnumLabelNoPostfix, bHidelabel: bHidelabel, bShowRefnum: bShowRefnum};
    }

    getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(refnumStr).toString();
        let color = this.getRefnumColor(currStrand);
        let colorStr = (!bLoop) ? 'style="color:' + color + '; text-decoration: underline overline;"' : 'style="color:' + color + '"';

        let lastTwo = parseInt(refnum.substr(refnum.length - 2, 2));
        let lastThree = parseInt(refnum.substr(refnum.length - 3, 3));

        let html = '';

        if(lastTwo == 50 && !bLoop) {
            // highlight the anchor residues
            ic.hAtomsRefnum = me.hashUtilsCls.unionHash(ic.hAtomsRefnum, ic.residues[residueid]);

            html += '<span ' + colorStr + ' title="' + refnumLabel + '"><b>' + refnumLabel.substr(0, 1) + '</b>' + refnumLabel.substr(1) + '</span>';
        }
        else if(lastTwo % 2 == 0 && lastTwo != 52 && !bHidelabel) { // don't show label for the first, middle, and last loop residues
            // e.g., 2152a
            let lastTwoStr = isNaN(refnumStr) ? lastTwo + refnumStr.substr(refnumStr.length - 1, 1) : lastTwo;
            html += '<span ' + colorStr + ' title="' + refnumLabel + '">' + lastTwoStr + '</span>';
        }
        else {
            html += '<span ' + colorStr + ' title="' + refnumLabel + '">&nbsp;</span>';
        }

        return html;
    }

    getRefnumColor(currStrand) {  let ic = this.icn3d, me = ic.icn3dui;
        if(currStrand == "A^") { //magenta // deep sky blue
            return '#FF00FF'; //'#9900ff'; //'#00BFFF';
        }
        else if(currStrand == "A") { //rebecca purple // blue
            return '#663399'; //'#9900ff'; //'#0000FF';
        }
        else if(currStrand == "A*") { //pink  // sky blue
            return '#FFC0CB'; //'#9900ff'; //'#87CEEB';
        }
        else if(currStrand == "A'") { //medium purple // steel blue
            return '#9370db'; //'#9900ff'; //'#4682B4';
        }
        else if(currStrand == "B") { //medium orchid // cyan
            return '#ba55d3'; //'#0000FF'; //'#4a86e8'; //'#00FFFF';
        }
        else if(currStrand == "C") { //blue // green
            return '#0000FF'; //'#76d6ff'; //'#00FF00';
        }
        else if(currStrand == "C'") { //corn blue // yellow
            return '#6495ED'; //'#006400'; //'#00b050'; //'#FFFF00';
        }
        else if(currStrand == "C''") { //dark green // orange
            return '#006400'; //'#00ff00'; //'#FFA500';
        }
        else if(currStrand == "D") { //green // brown
            return '#00FF00'; //'#fffb00'; //'#A52A2A';
        }
        else if(currStrand == "E") { //yellow // pink
            return '#FFFF00'; //'#ff9900'; //'#ffd966'; //'#FFC0CB';
        }
        else if(currStrand == "F") { //orange // magenta
            return '#FFA500'; //'#FF00FF'; //'#ff9900'; //'#FF00FF';
        }
        else if(currStrand == "G") { //red // red
            return '#FF0000'; //'#ff2600'; //'#FF0000';
        }
        else if(currStrand == "G*") { //dark red // salmon
            return '#8B0000'; //'#ff2600'; //'#FA8072';
        }
        else {
            return me.htmlCls.GREYB;
        }
    }

    insertGap(chnid, seqIndex, text, bNohtml) {  let ic = this.icn3d, me = ic.icn3dui;
      let html = '';
      //if(me.cfg.blast_rep_id == chnid && ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
      if(ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
          for(let j = 0; j <(ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1); ++j) {
              if(bNohtml) {
                 html += text;
              }
              else {
                 html += '<span>' + text + '</span>';
              }
          }
      }
      return html;
    }
    insertGapOverview(chnid, seqIndex) {  let ic = this.icn3d, me = ic.icn3dui;
      let html2 = '';
      if(me.cfg.blast_rep_id == chnid && ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
          let width = ic.seqAnnWidth *(ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1) /(ic.maxAnnoLength + ic.nTotalGap);
          html2 += '<div style="display:inline-block; background-color:#333; width:' + width + 'px; height:3px;">&nbsp;</div>';
      }
      return html2;
    }

    setAlternativeSeq(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        //if(ic.chainsSeq[chnid] !== undefined) {
        let resArray = ic.chainsSeq[chnid];
        ic.giSeq[chnid] = [];
        for(let i = 0, il = resArray.length; i < il; ++i) {
            let res = resArray[i].name;
            ic.giSeq[chnid][i] = res;
        }
        ic.matchedPos[chnid] = 0;
        ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
    }

    getProteinName(chnid) { let ic = this.icn3d, me = ic.icn3dui;
        let fullProteinName = '';
        if((me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined) && ic.mmdb_data !== undefined) {
            let moleculeInfor = ic.mmdb_data.moleculeInfor;
            let chain = chnid.substr(chnid.indexOf('_') + 1);
            for(let i in moleculeInfor) {
                if(moleculeInfor[i].chain == chain) {
                    fullProteinName = moleculeInfor[i].name.replace(/\'/g, '&prime;');
                    let proteinName = fullProteinName;
                    //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
                    break;
                }
            }
        }
        else if((me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.mmdbafid !== undefined || ic.bRealign || ic.bSymd) && ic.chainid2title !== undefined) {
            if(ic.chainid2title[chnid] !== undefined) {
                fullProteinName = ic.chainid2title[chnid];
            }
        }
        return fullProteinName;
    }
}

export {ShowSeq}
