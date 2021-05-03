/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {SetColor} from '../display/setColor.js';

class ShowSeq {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the sequences and secondary structures.
    showSeq(chnid, chnidBase, type, queryTitle, compTitle, queryText, compText) {  var ic = this.icn3d, me = ic.icn3dui;
        var bNonMmdb = false;
        var giSeq;
        if(ic.icn3dui.cfg.mmdbid === undefined && ic.icn3dui.cfg.gi === undefined && ic.icn3dui.cfg.blast_rep_id === undefined && ic.icn3dui.cfg.align === undefined && ic.icn3dui.cfg.chainalign === undefined) {
            bNonMmdb = true;
            giSeq = [];
            for(var i = 0; i < ic.giSeq[chnid].length; ++i) {
                giSeq.push(ic.chainsSeq[chnid][i]);
            }
        }
        else {
            giSeq = ic.giSeq[chnid];
        }

        // remove null giSeq[i]
        var giSeqTmp = [];
        for(var i = 0, il = giSeq.length; i < il; ++i) {
            if(giSeq[i]) {
                giSeqTmp.push(giSeq[i]);
            }
        }
        giSeq = giSeqTmp;
        var divLength = ic.icn3dui.htmlCls.RESIDUE_WIDTH * ic.giSeq[chnid].length + 200;
        var seqLength = ic.giSeq[chnid].length
        if(seqLength > ic.maxAnnoLength) {
            ic.maxAnnoLength = seqLength;
        }
        var itemArray = ['giseq', 'cddsite', 'clinvar', 'snp', 'domain', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
        for(var i in itemArray) {
            var item = itemArray[i];
            if($("#" + ic.pre + item + "_" + chnid).length) $("#" + ic.pre + item + "_" + chnid).width(divLength);
        }
        // gi html
        var html = '', html2 = '', html3 = '', htmlTmp;
        html += '<div class="icn3d-dl_sequence">';
        html3 += '<div class="icn3d-dl_sequence">';
        // html to display protein positions(10, 20, etc)
        //if(Object.keys(ic.chains[chnid]).length > 10) {
        if(ic.giSeq[chnid].length > 10) {
            htmlTmp = '<div class="icn3d-residueLine" style="white-space:nowrap;">';
            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            //if(ic.baseResi[chnid] != 0 &&(ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.align !== undefined)) {
            if((ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.blast_rep_id !== undefined || ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) && atom.resi_ori !== undefined && atom.resi_ori != atom.resi && chnid.indexOf('Misc') == -1 ) {
                htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="NCBI Residue Numbers">NCBI Residue Numbers</div>';
            }
            else {
                htmlTmp += '<div class="icn3d-annoTitle" anno="0"></div>';
            }
            htmlTmp += '<span class="icn3d-residueNum"></span>';
            html3 += htmlTmp + '<br>';
            html += htmlTmp + '<span class="icn3d-seqLine">';
            var helixCnt = 0, sheetCnt = 0;
            var savedSsName = '';
            for(var i = 0, il = giSeq.length; i < il; ++i) {
              html += this.insertGap(chnid, i, '-');
              var currResi;
              if(bNonMmdb) {
                currResi = giSeq[i].resi;
              }
              else {
                currResi =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
              }
              html += '<span>'
              if( currResi % 10 === 0) {
                //html += currResi + ' ';
                html += currResi;
              }

              // name of secondary structures
              var residueid = chnid + '_' + currResi;
              // do not overlap residue number with ss label
              var bshowSsName =(currResi % 10 != 0 && currResi % 10 != 1 && currResi % 10 != 9) ? true : false;
              if( ic.residues.hasOwnProperty(residueid) ) {
                var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
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
        for(var i = 0, il = giSeq.length; i < il; ++i) {
          html += this.insertGap(chnid, i, '-');
    //      var resi =(ic.baseResi[chnid] + i+1).toString();
    //      var resi = ic.chainsSeq[chnid][i - ic.matchedPos[chnid] ].resi;
          var resi =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
          var residueid = chnid + '_' + resi;
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
                var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
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
        if(ic.icn3dui.cfg.blast_rep_id === chnid) {
            htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence" style="border: solid 1px #000;">';
        }
        else {
            htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        }
        var chainType = 'Protein', chainTypeFull = 'Protein';
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
        var htmlTmp2 = '<span class="icn3d-seqLine">';
        html += htmlTmp + htmlTmp2;
        html2 += htmlTmp + htmlTmp2;
        var pos, nGap = 0;

        for(var i = 0, il = giSeq.length; i < il; ++i) {
          html += this.insertGap(chnid, i, '-');
          if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(i)) nGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
          var cFull =(bNonMmdb) ? giSeq[i].name : giSeq[i];
          var c = cFull;
          if(cFull.length > 1) {
              c = cFull[0] + '..';
          }
    //      pos =(ic.baseResi[chnid] + i+1).toString();
    //      pos = ic.chainsSeq[chnid][i - ic.matchedPos[chnid] ].resi;
          pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
          if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
              c = c.toLowerCase();
              html += '<span title="' + cFull + pos + '" class="icn3d-residue">' + c + '</span>';
          }
          else {
              var color = '333333';
              if(ic.icn3dui.cfg.blast_rep_id == chnid && ic.fullpos2ConsTargetpos !== undefined && ic.fullpos2ConsTargetpos[i + nGap] !== undefined) {
                  color = ic.fullpos2ConsTargetpos[i + nGap].color;
              }
              else {
                  var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[chnid + '_' + pos]);
                  var colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                  color =(atom.color !== undefined) ? colorStr : "CCCCCC";
              }
              html += '<span id="giseq_' + ic.pre + chnid + '_' + pos + '" title="' + cFull + pos + '" class="icn3d-residue" style="color:#' + color + '">' + c + '</span>';
          }
        }
        if(ic.icn3dui.cfg.blast_rep_id == chnid) {
          // change color in 3D
          ic.opts['color'] = 'conservation';
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
          // remove highlight
          //ic.hlUpdateCls.removeHlSeq();
        }
        // sequence, overview
        var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
        var color =(atom.color) ? atom.color.getHexString() : "CCCCCC";
        var width = Math.round(ic.seqAnnWidth * giSeq.length / ic.maxAnnoLength);
        if(width < 1) width = 1;
        if(ic.icn3dui.cfg.blast_rep_id != chnid) { // regular
            html2 += '<div id="giseq_summary_' + ic.pre + chnid + '" class="icn3d-seqTitle icn3d-link" gi chain="' + chnid + '" style="display:inline-block; color:white; font-weight:bold; background-color:#' + color + '; width:' + width + 'px;">' + chnid + '</div>';
        }
        else { // with potential gaps
            var fromArray2 = [], toArray2 = [];
            fromArray2.push(0);
            for(var i = 0, il = giSeq.length; i < il; ++i) {
                if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(i)) {
                    toArray2.push(i - 1);
                    fromArray2.push(i);
                }
            }
            toArray2.push(giSeq.length - 1);
            html2 += '<div id="giseq_summary_' + ic.pre + chnid + '" class="icn3d-seqTitle icn3d-link" gi chain="' + chnid + '" style="width:' + width + 'px;">';
            for(var i = 0, il = fromArray2.length; i < il; ++i) {
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
        if(ic.icn3dui.cfg.blast_rep_id == chnid) {
            // 1. residue conservation
            if(compText !== undefined && compText !== '') {
            // conservation, detailed view
            htmlTmp = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" blast="" posarray="' + ic.consrvResPosArray.toString() + '" title="' + compTitle + '" setname="' + chnid + '_blast" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;" title="' + compTitle + '">' + compTitle + '</span></div>';
            htmlTmp += '<span class="icn3d-residueNum"></span>';
            html3 += htmlTmp + '<br>';
            var htmlTmp2 = '<span class="icn3d-seqLine">';
            html += htmlTmp + htmlTmp2;
            html2 += htmlTmp + htmlTmp2;
            var prevEmptyWidth = 0;
            var prevLineWidth = 0;
            var widthPerRes = 1;
            var queryPos = ic.queryStart;
            for(var i = 0, il = compText.length; i < il; ++i) {
              var c = compText[i];
              if(c == '-') {
                  html += '<span>-</span>';
              }
              else if(c == ' ') {
                  html += '<span> </span>';
              }
              else {
                  var pos = ic.fullpos2ConsTargetpos[i].pos;
                  if( !ic.residues.hasOwnProperty(chnid + '_' + pos) ) {
                      c = c.toLowerCase();
                      html += '<span class="icn3d-residue">' + c + '</span>';
                  }
                  else {
                      var color = ic.fullpos2ConsTargetpos[i].color;
                      html += '<span id="giseq_' + ic.pre + chnid + '_' + pos + '" title="' + ic.fullpos2ConsTargetpos[i].res + pos + '" class="icn3d-residue" style="color:#' + color + '">' + c + '</span>';
                  }
                  html2 += this.insertGapOverview(chnid, i);
                  var emptyWidth = Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth);
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
            var htmlTmp2 = '<span class="icn3d-seqLine" style="font-weight: bold;">';
            html += htmlTmp + htmlTmp2;
            html2 += htmlTmp + htmlTmp2;
            var queryPos = ic.queryStart;
            for(var i = 0, il = queryText.length; i < il; ++i) {
              var c = queryText[i];
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
            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            var colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            var color =(atom.color !== undefined) ? colorStr : "CCCCCC";
            var fromArray2 = [], toArray2 = [];
            var prevChar = '-';
            for(var i = 0, il = queryText.length; i < il; ++i) {
                var c = queryText[i];
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
            for(var i = 0, il = fromArray2.length; i < il; ++i) {
                var emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray2[i] - ic.baseResi[chnid] - 1) /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
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
            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            //if(ic.baseResi[chnid] != 0 &&(ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.align !== undefined)) {
            if((ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.blast_rep_id !== undefined || ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) && atom.resi_ori !== undefined && atom.resi_ori != atom.resi && chnid.indexOf('Misc') == -1 ) {
                htmlTmp = '<div class="icn3d-dl_sequence">';
                htmlTmp += '<div class="icn3d-residueLine" style="white-space:nowrap;">';
                htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="PDB Residue Numbers">PDB Residue Numbers</div>';
                htmlTmp += '<span class="icn3d-residueNum"></span>';
                html3 += htmlTmp + '<br>';
                html += htmlTmp + '<span class="icn3d-seqLine">';
                for(var i = 0, il = giSeq.length; i < il; ++i) {
                    html += this.insertGap(chnid, i, '-');
                    if(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) {
                      var currResi = ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi;
                      var residueid = chnid + '_' + currResi;
                      if(!ic.residues.hasOwnProperty(residueid)) {
                          html += '<span></span>';
                      }
                      else {
                          var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                          var resi_ori = atom.resi_ori;
                          html += '<span>';
                          if( resi_ori % 10 === 0) {
                            html += resi_ori + ' ';
                          }
                          html += '</span>';
                      }
                    }
                    else {
                      html += '<span></span>';
                    }
                }
                html += '<span class="icn3d-residueNum"></span>';
                html += '</span>';
                html += '<br>';
                html += '</div>';
                html += '</div>';
                html3 += '</div></div>';
            }
        }
        $("#" + ic.pre + 'dt_giseq_' + chnid).html(html);
        $("#" + ic.pre + 'ov_giseq_' + chnid).html(html2);
        $("#" + ic.pre + 'tt_giseq_' + chnid).html(html3); // fixed title for scrolling
    }

    insertGap(chnid, seqIndex, text, bNohtml) {  var ic = this.icn3d, me = ic.icn3dui;
      var html = '';
      //if(ic.icn3dui.cfg.blast_rep_id == chnid && ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
      if(ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
          for(var j = 0; j <(ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1); ++j) {
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
    insertGapOverview(chnid, seqIndex) {  var ic = this.icn3d, me = ic.icn3dui;
      var html2 = '';
      if(ic.icn3dui.cfg.blast_rep_id == chnid && ic.targetGapHash!== undefined && ic.targetGapHash.hasOwnProperty(seqIndex)) {
          var width = ic.seqAnnWidth *(ic.targetGapHash[seqIndex].to - ic.targetGapHash[seqIndex].from + 1) /(ic.maxAnnoLength + ic.nTotalGap);
          html2 += '<div style="display:inline-block; background-color:#333; width:' + width + 'px; height:3px;">&nbsp;</div>';
      }
      return html2;
    }

    setAlternativeSeq(chnid, chnidBase) { var ic = this.icn3d, me = ic.icn3dui;
        //if(ic.chainsSeq[chnid] !== undefined) {
        var resArray = ic.chainsSeq[chnid];
        ic.giSeq[chnid] = [];
        for(var i = 0, il = resArray.length; i < il; ++i) {
            var res = resArray[i].name;
            ic.giSeq[chnid][i] = res;
        }
        ic.matchedPos[chnid] = 0;
        ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
    }
    getProteinName(chnid) { var ic = this.icn3d, me = ic.icn3dui;
        var fullProteinName = '';
        if((ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.blast_rep_id !== undefined) && ic.mmdb_data !== undefined) {
            var moleculeInfor = ic.mmdb_data.moleculeInfor;
            var chain = chnid.substr(chnid.indexOf('_') + 1);
            for(var i in moleculeInfor) {
                if(moleculeInfor[i].chain == chain) {
                    fullProteinName = moleculeInfor[i].name.replace(/\'/g, '&prime;');
                    var proteinName = fullProteinName;
                    //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
                    break;
                }
            }
        }
        else if((ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined || ic.bRealign || ic.bSymd) && ic.chainid2title !== undefined) {
            if(ic.chainid2title[chnid] !== undefined) {
                fullProteinName = ic.chainid2title[chnid];
            }
        }
        return fullProteinName;
    }
}

export {ShowSeq}
