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

            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqStartLen[chnid], ' ');

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

            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqEndLen[chnid], ' ');

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

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqStartLen[chnid], '-');

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

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqEndLen[chnid], '-');

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

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqStartLen[chnid], '-');

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
                  let colorStr =(atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF' || atom.color.getHexString().toUpperCase() === 'FFF') ? 'DDDDDD' : atom.color.getHexString();
                  color =(atom.color !== undefined) ? colorStr : "CCCCCC";
              }
              html += '<span id="giseq_' + ic.pre + chnid + '_' + pos + '" title="' + cFull + pos + '" class="icn3d-residue" style="color:#' + color + '">' + c + '</span>';
          }
        }

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqEndLen[chnid], '-');

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
        let width = Math.round(ic.seqAnnWidth * giSeq.length / (ic.maxAnnoLength + ic.nTotalGap));
        if(width < 1) width = 1;

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += this.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);

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

                if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqStartLen[chnid], '-');

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

                if(ic.seqStartLen && ic.seqStartLen[chnid]) html += this.insertMulGap(ic.seqEndLen[chnid], '-');

                html += '<span class="icn3d-residueNum"></span>';
                html += '</span>';
                html += '<br>';
                html += '</div>';
                html += '</div>';
                html3 += '</div></div>';
            }         
            
            if(ic.bShowRefnum && ic.chainid2refpdbname.hasOwnProperty(chnid) && ic.chainid2refpdbname[chnid].length > 0) {                          
                let result = this.showAllRefNum(giSeq, chnid);
                html += result.html;
                html3 += result.html3;
            }
            
            if(ic.bShowCustomRefnum && ic.chainsMapping.hasOwnProperty(chnid)) {              
                let bCustom = true;
                let result = this.showRefNum(giSeq, chnid, undefined, bCustom);
                html += result.html;
                html3 += result.html3;
            }
        }

        // highlight reference numbers
        if(ic.bShowRefnum) {
            // comment out so that this process didn't change the selection
            //ic.hAtoms = ic.hAtomsRefnum;
            
            // commented out because it produced too many commands
            // let name = 'refnum_anchors';
            // ic.selectionCls.saveSelection(name, name);
            
            ic.hlUpdateCls.updateHlAll();
        }

        $("#" + ic.pre + 'dt_giseq_' + chnid).html(html);
        $("#" + ic.pre + 'ov_giseq_' + chnid).html(html2);
        $("#" + ic.pre + 'tt_giseq_' + chnid).html(html3); // fixed title for scrolling
    }

    showAllRefNum(giSeq, chnid) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html3 = '';

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

        if(ic.bShowRefnum) {
            ic.opts.color = 'ig strand';
            //ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
            ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

            ic.selectionCls.selectAll_base();
            ic.hlUpdateCls.updateHlAll();
            //ic.drawCls.draw();
            ic.drawCls.draw();
        }

        return {'html': html, 'html3': html3};
    }

    showRefNum(giSeq, chnid, kabat_or_imgt, bCustom) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html3 = '';

        if(!ic.chainid2refpdbname[chnid]) return {html: html, html3: html3};

        let chainList = ic.refnumCls.getTemplateList(chnid);

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

        //check if IMGT refnum available
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
        let refnumLabel, refnumStr_ori, refnumStr, postfix, strandPostfix, refnum, refnum3c;

        // set hash for the loops
        let strand2len_start_stop = {};
        let prevRefnumStr, prevPostfix, prevRefnum;

        // sometimes one chain may have several Ig domains,set an index for each IgDomain
        let index = 1, prevStrandPostfix = '', bStart = false;

        if(!bCustom && !kabat_or_imgt && !me.bNode) { // do not overwrite loops in node  
            // reset ic.residIgLoop for the current selection, which could be the second round of ref num assignment
            // just current chain
            let atomHash = me.hashUtilsCls.intHash(ic.chains[chnid], ic.hAtoms);
            let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomHash);
            
            for(let resid in residHash) {
                // not in loop any more if you assign ref numbers multiple times
                delete ic.residIgLoop[resid];
            }
        }

        // 1. get the range of each strand excluding loops
        let strandArray = [], strandHash = {}, strandCnt = 0, resCnt = 0, resCntBfAnchor = 0, resCntAtAnchor = 0;
        if(!bCustom && !kabat_or_imgt) {
            for(let i = 0, il = giSeq.length; i < il; ++i, ++resCnt, ++resCntBfAnchor, ++resCntAtAnchor) {
                let currResi = ic.ParserUtilsCls.getResi(chnid, i);
                let residueid = chnid + '_' + currResi;

                refnumLabel = ic.resid2refnum[residueid];

                let firstChar = (refnumLabel) ? refnumLabel.substr(0,1) : ' ';
                if(!bStart && refnumLabel && (firstChar == ' ' || firstChar == 'A' || firstChar == 'B')) { // start of a new IG domain
                    bStart = true;
                    resCnt = 1; // the first oen is included
                }

                if(prevStrand.substr(0,1) == 'G' && !refnumLabel) { // indicate the end of an IG domain
                    bStart = false;
                }

                if(refnumLabel) {                        
                    refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                    currFirstDigit = refnumStr_ori.substr(0, 1);

                    refnumStr = refnumStr_ori;
                    refnum = parseInt(refnumStr);
                    refnum3c = (refnum - parseInt(refnum/1000) * 1000).toString();
                    strandPostfix = refnumStr.replace(refnum.toString(), '');

                    postfix = strandPostfix + '_' + index;

                    if(currStrand && currStrand != ' ') {
                        if(refnum3c.substr(0,1) != '9') {
                            let lastTwo = parseInt(refnum.toString().substr(refnum.toString().length - 2, 2));
                            
                            if(currStrand != prevStrand) { // reset currCnt
                                if(strandHash[currStrand + postfix]) {
                                    ++index;
                                    postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;
                                }

                                strandHash[currStrand + postfix] = 1;

                                strandArray[strandCnt] = {};    
                                strandArray[strandCnt].startResi = currResi;
                                strandArray[strandCnt].startRefnum = refnum; // 1250 in A1250a

                                resCntBfAnchor = 0;
                                
                                strandArray[strandCnt].endResi = currResi;
                                strandArray[strandCnt].endRefnum = refnum; // 1250a

                                if(lastTwo == 50) {
                                    strandArray[strandCnt].anchorRefnum = refnum;
                                    strandArray[strandCnt].resCntBfAnchor = resCntBfAnchor;

                                    resCntAtAnchor = 0;
                                }

                                strandArray[strandCnt].strandPostfix = strandPostfix; // a in A1250a
                                strandArray[strandCnt].strand = currStrand; // A in A1250a

                                strandArray[strandCnt].postfix = postfix; // Aa_1

                                strandArray[strandCnt].loopResCnt = resCnt - 1;

                                ++strandCnt;
                                resCnt = 0;
                            }
                            else {
                                if(strandHash[currStrand + postfix]) {
                                    if(lastTwo == 50) {
                                        strandArray[strandCnt - 1].anchorRefnum = refnum;
                                        strandArray[strandCnt - 1].resCntBfAnchor = resCntBfAnchor;

                                        // update
                                        strandArray[strandCnt - 1].startRefnum = strandArray[strandCnt - 1].anchorRefnum - strandArray[strandCnt - 1].resCntBfAnchor;

                                        resCntAtAnchor = 0;
                                    }

                                    strandArray[strandCnt - 1].endResi = currResi;
                                    strandArray[strandCnt - 1].endRefnum = refnum; // 1250a
                                    strandArray[strandCnt - 1].resCntAtAnchor = resCntAtAnchor;

                                    if(strandArray[strandCnt - 1].anchorRefnum) {
                                        strandArray[strandCnt - 1].endRefnum = strandArray[strandCnt - 1].anchorRefnum + strandArray[strandCnt - 1].resCntAtAnchor;
                                    }

                                    resCnt = 0;
                                }
                            }
                        }
                    }
                }

                prevRefnumStr = refnumStr;
                prevRefnum = refnum;
                prevPostfix = postfix;

                prevStrand = currStrand;
            }

            // 2. remove strands with less than 3 residues except G strand
            for(let il = strandArray.length, i = il - 1; i >= 0; --i) {
                if(strandArray[i].strand.substr(0, 1) != 'G' && strandArray[i].endRefnum - strandArray[i].startRefnum + 1 < 3) { // remove the strand
                    if(i != il - 1) { // modify 
                        strandArray[i + 1].loopResCnt += strandArray[i].loopResCnt + parseInt(strandArray[i].endResi) - parseInt(strandArray[i].startResi) + 1;
                    }

                    strandArray.splice(i, 1);
                }
            }

            // 3. assign refnumLabel for each resid
            strandCnt = 0;
            let loopCnt = 0;

            let bBeforeAstrand = true, bAfterGstrand = true, refnumLabelNoPostfix, prevStrandCnt = 0, currRefnum;
            bStart = false;
            let refnumInStrand = 0;
            if(strandArray.length > 0) {
                for(let i = 0, il = giSeq.length; i < il; ++i, ++loopCnt, ++refnumInStrand) {
                    let currResi = ic.ParserUtilsCls.getResi(chnid, i);
                    let residueid = chnid + '_' + currResi;
                    refnumLabel = ic.resid2refnum[residueid];

                    currStrand = strandArray[strandCnt].strand;

                    if(refnumLabel) {
                        refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                        currRefnum = parseInt(refnumStr);
                        refnumLabelNoPostfix = currStrand + currRefnum;

                        currStrand = refnumLabel.replace(new RegExp(refnumStr,'g'), '');
                        
                        let firstChar = refnumLabel.substr(0,1);
                        if(!bStart && (firstChar == ' ' || firstChar == 'A' || firstChar == 'B')) { // start of a new IG domain
                            bStart = true;
                            bBeforeAstrand = true;
                            loopCnt = 0;
                        }
                    }

                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[residueid]);

                    // skip non-protein residues
                    if(!atom || !ic.proteins.hasOwnProperty(atom.serial)) {
                        refnumLabel = undefined;
                    }
                    else {
                        let bBefore = false, bInRange= false, bAfter = false;
                        // 100, 100A
                        if(parseInt(currResi) == parseInt(strandArray[strandCnt].startResi) && currResi != strandArray[strandCnt].startResi) {
                            bBefore = currResi < strandArray[strandCnt].startResi;
                        }
                        else {
                            bBefore = parseInt(currResi) < parseInt(strandArray[strandCnt].startResi);
                        }

                        // 100, 100A
                        if(parseInt(currResi) == parseInt(strandArray[strandCnt].endResi) && currResi != strandArray[strandCnt].endResi) {
                            bAfter = currResi > strandArray[strandCnt].endResi;
                        }
                        else {
                            bAfter = parseInt(currResi) > parseInt(strandArray[strandCnt].endResi);
                        }

                        bInRange = (!bBefore && !bAfter) ? true : false;

                        if(bBefore) {
                            ic.residIgLoop[residueid] = 1;

                            if(bBeforeAstrand) { // make it continuous to the 1st strand
                                if(bStart) {
                                    currRefnum = strandArray[strandCnt].startRefnum - strandArray[strandCnt].loopResCnt + loopCnt;
                                    refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                    refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix;
                                }    
                                else {
                                    //loopCnt = 0;
                                    refnumLabelNoPostfix = undefined;
                                    refnumLabel = undefined;
                                }                        
                            }
                            else {
                                if(prevStrandCnt >= 0 && strandArray[prevStrandCnt].strand.substr(0, 1) == 'G') {
                                    if(!bAfterGstrand) {
                                        //loopCnt = 0;
                                        refnumLabelNoPostfix = undefined;
                                        refnumLabel = undefined;
                                    }
                                    else {
                                        if(bStart && ic.resid2refnum[residueid]) {
                                            bAfterGstrand = true;

                                            currRefnum = strandArray[prevStrandCnt].endRefnum + loopCnt;
                                            refnumLabelNoPostfix = strandArray[prevStrandCnt].strand + currRefnum;
                                            refnumLabel = refnumLabelNoPostfix  + strandArray[prevStrandCnt].strandPostfix; 
                                        }
                                        else {
                                            bStart = false;
                                            bBeforeAstrand = true;
                                            //loopCnt = 0;

                                            bAfterGstrand = false;
        
                                            refnumLabelNoPostfix = undefined;
                                            refnumLabel = undefined;
                                        }
                                    }
                                }
                                else {
                                    bAfterGstrand = true; // reset

                                    let len = strandArray[strandCnt].loopResCnt;
                                    let halfLen = parseInt(len / 2.0 + 0.5);
                        
                                    if(loopCnt <= halfLen) {
                                        currRefnum = strandArray[prevStrandCnt].endRefnum + loopCnt;
                                        refnumLabelNoPostfix = strandArray[prevStrandCnt].strand + currRefnum;
                                        refnumLabel = refnumLabelNoPostfix  + strandArray[prevStrandCnt].strandPostfix; 
                                    }
                                    else {
                                        currRefnum = strandArray[strandCnt].startRefnum - len + loopCnt - 1;
                                        refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                        refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                                    }
                                }
                            }
                        }
                        else if(bInRange) {
                            // not in loop any more if you assign ref numbers multiple times
                            //delete ic.residIgLoop[residueid];

                            bBeforeAstrand = false;

                            if(strandArray[strandCnt].anchorRefnum) { // use anchor to name refnum
                                if(currResi == strandArray[strandCnt].startResi) {
                                    refnumInStrand = strandArray[strandCnt].anchorRefnum - strandArray[strandCnt].resCntBfAnchor;
                                    strandArray[strandCnt].startRefnum = refnumInStrand;
                                }
                                else if(currResi == strandArray[strandCnt].endResi) {
                                    strandArray[strandCnt].endRefnum = refnumInStrand;
                                }

                                refnumLabelNoPostfix = strandArray[strandCnt].strand + refnumInStrand;
                                refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                            }

                            if(currResi == strandArray[strandCnt].endResi) {
                                ++strandCnt; // next strand
                                loopCnt = 0;

                                if(!strandArray[strandCnt]) { // last strand
                                    --strandCnt;
                                }
                            }
                        }
                        else if(bAfter) {     
                            ic.residIgLoop[residueid] = 1;    

                            if(!bAfterGstrand) {
                                refnumLabelNoPostfix = undefined;
                                refnumLabel = undefined;
                            }
                            else {
                                // C-terminal
                                if(!ic.resid2refnum[residueid]) {
                                    bAfterGstrand = false;

                                    refnumLabelNoPostfix = undefined;
                                    refnumLabel = undefined;
                                }
                                else {
                                    bAfterGstrand = true;

                                    currRefnum = strandArray[strandCnt].endRefnum + loopCnt;
                                    refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                    refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                                }
                            }
                        }
                    }

                    prevStrand = currStrand;
                    prevStrandCnt = strandCnt - 1;

                    // assign the adjusted reference numbers
                    ic.resid2refnum[residueid] = refnumLabel;

                    refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);

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
                }
            }
        }
 
        let refnumLabelNoPostfix;
        let appearedStrands = {}, currStrand_ori, bShowRefnum = true;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
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
                    refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                    currStrand_ori = currStrand;

                    currFirstDigit = refnumStr_ori.substr(0, 1);

                    refnumLabelNoPostfix = currStrand + parseInt(refnumStr_ori);

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
                            let color = this.getRefnumColor(currStrand, true);
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
                            bLoop = ic.residIgLoop[residueid];
                            html += this.getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel);
                            // if(bLoop) ic.residIgLoop[residueid] = 1;
                        }
                        else {
                            html += '<span></span>';
                        }
                    }
                }
                else {
                    html += '<span></span>';
                }
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

    getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(refnumStr).toString();
        let color = this.getRefnumColor(currStrand, true);
        let colorStr = (!bLoop) ? 'style="color:' + color + '; text-decoration: underline overline;"' : 'style="color:' + color + '"';

        let lastTwoStr = refnum.substr(refnum.length - 2, 2);
        let lastTwo = parseInt(lastTwoStr);
        let lastThree = parseInt(refnum.substr(refnum.length - 3, 3));

        let html = '';

        if(refnumLabel && lastTwo == 50 && !bLoop) {
            // highlight the anchor residues
            ic.hAtomsRefnum = me.hashUtilsCls.unionHash(ic.hAtomsRefnum, ic.residues[residueid]);

            html += '<span ' + colorStr + ' title="' + refnumLabel + '"><b>' + refnumLabel.substr(0, 1) + '</b>' + refnumLabel.substr(1) + '</span>';
        }
        else if(refnumLabel && lastTwo % 2 == 0 && lastTwo != 52 && !bHidelabel) { // don't show label for the first, middle, and last loop residues
            // e.g., 2152a
            lastTwoStr = isNaN(refnumStr) ? lastTwoStr + refnumStr.substr(refnumStr.length - 1, 1) : lastTwoStr;
            html += '<span ' + colorStr + ' title="' + refnumLabel + '">' + lastTwoStr + '</span>';
        }
        else {
            html += '<span ' + colorStr + ' title="' + refnumLabel + '">&nbsp;</span>';
        }

        return html;
    }

    getRefnumColor(currStrand, bText) {  let ic = this.icn3d, me = ic.icn3dui;
        if(currStrand == "A-") { 
            return '#9400D3'; //'#663399'; 
        }
        else if(currStrand == "A") { 
            return '#9400D3'; //'#663399'; 
        }
        //else if(currStrand == "A*") { 
        else if(currStrand == "A+") { 
            return '#9400D3'; //'#663399'; 
        }
        else if(currStrand == "A'") { 
            return '#9400D3'; //'#663399'; 
        }
        else if(currStrand == "B") { 
            return '#ba55d3'; 
        }
        else if(currStrand == "C") { 
            return '#0000FF'; 
        }
        else if(currStrand == "C'") { 
            return '#6495ED'; 
        }
        else if(currStrand == "C''") { 
            return '#006400'; 
        }
        else if(currStrand == "D") { 
            return '#00FF00'; 
        }
        else if(currStrand == "E") { 
            return (bText) ? "#F7DC6F" : "#FFFF00"; 
        }
        else if(currStrand == "F") { 
            return '#FFA500'; 
        }
        else if(currStrand == "G") { 
            return '#FF0000'; 
        }
        else if(currStrand == "G+") { 
            return '#8B0000'; 
        }
        else {
            return me.htmlCls.GREYB;
        }
    }

    getProtodomainColor(currStrand) {  let ic = this.icn3d, me = ic.icn3dui;
        if((currStrand && currStrand.substr(0,1) == "A") || currStrand == "D") {
            return '#0000FF';
        }
        else if(currStrand == "B" || currStrand == "E") {
            return '#006400';
        }
        else if(currStrand == "C" || currStrand == "F") {
            return "#FFFF00"; //'#F0E68C'; 
        }
        else if(currStrand == "C'" || (currStrand && currStrand.substr(0, 1) == "G")) {
            return '#FFA500'; 
        }
        else if(currStrand == "C''") { //linker
            return '#FF0000'; 
        }
        else {
            return me.htmlCls.GREYB;
        }
    }

    insertGap(chnid, seqIndex, text, bNohtml) {  let ic = this.icn3d, me = ic.icn3dui;
      let html = '';
      //if(me.cfg.blast_rep_id == chnid && ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
      if(ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
        html += this.insertMulGap(ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1, text, bNohtml);
      }
      return html;
    }

    insertMulGap(n, text, bNohtml) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '';
        for(let j = 0; j < n; ++j) {
            if(bNohtml) {
                html += text;
            }
            else {
                html += '<span>' + text + '</span>';
            }
        }
        return html;
    }

    insertGapOverview(chnid, seqIndex) {  let ic = this.icn3d, me = ic.icn3dui;
      let html2 = '';
    //   if(me.cfg.blast_rep_id == chnid && ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
      if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
        html2 += this.insertMulGapOverview(chnid, ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1);
      }
      return html2;
    }

    insertMulGapOverview(chnid, n) {  let ic = this.icn3d, me = ic.icn3dui;
        let html2 = '';
        let width = ic.seqAnnWidth * n /(ic.maxAnnoLength + ic.nTotalGap);
        width = parseInt(width);
        
        // html2 += '<div style="display:inline-block; background-color:#333; width:' + width + 'px; height:3px;">&nbsp;</div>';
        html2 += '<div style="display:inline-block; width:' + width + 'px;">&nbsp;</div>';
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
