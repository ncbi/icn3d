/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ShowSeq {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    getSeq(chnid) {  let ic = this.icn3d, me = ic.icn3dui;
        let giSeq;
        if(me.cfg.mmdbid === undefined && me.cfg.gi === undefined && me.cfg.blast_rep_id === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined && me.cfg.mmdbafid === undefined) {
            giSeq = [];
            for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
                giSeq.push(ic.chainsSeq[chnid][i]);
            }
        }
        else {
            giSeq = ic.giSeq[chnid];
        }

        if(!giSeq) return [];

        // remove null giSeq[i]
        let giSeqTmp = [];
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            if(giSeq[i]) {
                giSeqTmp.push(giSeq[i]);
            }
        }
        giSeq = giSeqTmp;

        return giSeq;
    }

    //Show the sequences and secondary structures.
    showSeq(chnid, chnidBase, type, queryTitle, compTitle, queryText, compText) {  let ic = this.icn3d, me = ic.icn3dui;
        let giSeq = this.getSeq(chnid);

        let bNonMmdb = false;
        if(me.cfg.mmdbid === undefined && me.cfg.gi === undefined && me.cfg.blast_rep_id === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined && me.cfg.mmdbafid === undefined) {
            bNonMmdb = true;
        }

        //let divLength = me.htmlCls.RESIDUE_WIDTH * (ic.giSeq[chnid].length + ic.nTotalGap) + 200;
        let divLength = me.htmlCls.RESIDUE_WIDTH * (giSeq.length + ic.nTotalGap) + 200;

        // let seqLength = ic.giSeq[chnid].length
        // if(seqLength > ic.maxAnnoLength) {
        //     ic.maxAnnoLength = seqLength;
        // }

        //let itemArray = ['giseq', 'cddsite', 'ptm', 'clinvar', 'snp', 'domain', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
        let itemArray = ['giseq', 'cddsite', 'clinvar', 'snp', 'ptm', 'ssbond', 'crosslink', 'transmem', 'domain', 'custom', 'interaction', 'ig'];
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

        if(giSeq.length > 10) {
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
        if(giSeq.length > 10) {
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

            // if(ic.bShowRefnum && ic.chainid2refpdbname.hasOwnProperty(chnid) && ic.chainid2refpdbname[chnid].length > 0) {                                       
            //     let result = ic.annoIgCls.showAllRefNum(giSeq, chnid);
                
            //     html += result.html;
            //     html3 += result.html3;
            // }
            
            if(ic.bShowCustomRefnum && ic.chainsMapping.hasOwnProperty(chnid)) {              
                let bCustom = true;
                let result = ic.annoIgCls.showRefNum(giSeq, chnid, undefined, bCustom);
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
