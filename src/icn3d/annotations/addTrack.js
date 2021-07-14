/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {MyEventCls} from '../../utils/myEventCls.js';
import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {Annotation} from '../annotations/annotation.js';
import {SetColor} from '../display/setColor.js';
import {SetOption} from '../display/setOption.js';
import {Draw} from '../display/draw.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {ShowAnno} from '../annotations/showAnno.js';
import {ShowSeq} from '../annotations/showSeq.js';

class AddTrack {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    clickAddTrackButton() { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;
        // ncbi gi/accession
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button1", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();

           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();

           //var gi = $("#" + ic.pre + "track_gi").val().toUpperCase();
           var gi = $("#" + ic.pre + "track_gi").val();
           var title =(isNaN(gi)) ? 'Acc ' + gi : 'gi ' + gi;

           //var text = $("#" + ic.pre + "track_text").val();
           var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=track';

           $.ajax({
              url: url,
              type: 'POST',
              data : {'targets': chainid, 'queries': gi},
              dataType: 'jsonp',
              //dataType: 'json',
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                  thisClass.alignSequenceToStructure(chainid, data, title);
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
        });

        // FASTA
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button2", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();

           var fasta = $("#" + ic.pre + "track_fasta").val();
           //var title = 'fasta ' + fasta.substr(0, 5);
           var title = $("#" + ic.pre + "fasta_title").val();

           //var text = $("#" + ic.pre + "track_text").val();
           var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=track';
           $.ajax({
              url: url,
              type: 'POST',
              data : {'targets': chainid, 'queries': fasta},
              dataType: 'jsonp',
              //dataType: 'json',
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                  thisClass.alignSequenceToStructure(chainid, data, title);
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
        });

        // FASTA Alignment
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button2b", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();
           var startpos = $("#" + ic.pre + "fasta_startpos").val();
           var colorseqby = $("#" + ic.pre + "colorseqby").val();
           var type =(colorseqby == 'identity') ? 'identity' : 'custom';

           var fastaList = $("#" + ic.pre + "track_fastaalign").val();
           var fastaArray = fastaList.split('>');

           // the first array item is empty
           // the second array item is the sequence of the structure, start with i = 2
           var posFirst = fastaArray[1].indexOf('\n');
           var titleFirst = fastaArray[1].substr(0, posFirst);
           var seqFirst = fastaArray[1].substr(posFirst + 1).replace(/\n/g, '');

           var trackTitleArray = [];
           var trackSeqArray = [];
           for(var i = 2, il = fastaArray.length; i < il; ++i) {
               var pos = fastaArray[i].indexOf('\n');
               var title = fastaArray[i].substr(0, pos);
               trackTitleArray.push(title);
               var seq = fastaArray[i].substr(pos + 1).replace(/\n/g, '');
               trackSeqArray.push(seq);
           }

           var startposGiSeq = undefined;
           for(var i = 0, il = ic.giSeq[chainid].length; i < il; ++i) {
               var pos =(i >= ic.matchedPos[chainid] && i - ic.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - ic.matchedPos[chainid]].resi : ic.baseResi[chainid] + 1 + i;

               if(pos != startpos) {
                   continue;
               }
               else {
                   startposGiSeq = i;
               }
           }

           if(startposGiSeq === undefined) alert("Please double check the start position before clicking \"Add Track\"");


           // set up gap for the master seq
           // don't count gaps in both ends
           ic.targetGapHash = {}
           var prevSeq = '-', prevPos = 0, from, to, cnt = 0, dashCnt = 0;
           var bFound = false, seqStart = 0, seqEnd = 0;
           for(var i = 0, il = seqFirst.length; i < il; ++i) {
              if(seqFirst[i] == '-' && seqFirst[i] != prevSeq) { // start of gap
                  from = cnt;
                  dashCnt = 0;
              }

              if(prevSeq == '-' && seqFirst[i] != prevSeq && cnt > 0) { // end of gap
                  to = prevPos;
                  ic.targetGapHash[from + startposGiSeq] = {'from': from + startposGiSeq, 'to': to + dashCnt - 1 + startposGiSeq}
              }

              prevSeq = seqFirst[i];
              prevPos = cnt;

              if(seqFirst[i] != '-') {
                  ++cnt;
                  seqEnd = i;

                  if(!bFound) {
                      seqStart = i;
                      bFound = true;
                  }
              }
              else {
                  ++dashCnt;
              }
           }

           ic.annotationCls.resetAnnoAll();

           var targetGapHashStr = '';
           var cntTmp = 0;
           for(var i in ic.targetGapHash) {
               if(cntTmp > 0) targetGapHashStr += ' ';
               targetGapHashStr += i + '_' + ic.targetGapHash[i].from + '_' + ic.targetGapHash[i].to;
               ++cntTmp;
           }

           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("msa | " + targetGapHashStr, true);

           // add tracks
           var resi2cntSameRes = {} // count of same residue at each position
           for(var j = 0, jl = trackSeqArray.length; j < jl; ++j) {
               var resi = startpos; //startposGiSeq + 1;
               var text = '';
               for(var k = 0; k < startposGiSeq; ++k) {
                   if(ic.targetGapHash.hasOwnProperty(k)) {
                       for(var m = 0; m < ic.targetGapHash[k].to - ic.targetGapHash[k].from + 1; ++m) {
                           text += '-';
                       }
                   }

                   text += '-';
               }

               for(var k = seqStart; k <= seqEnd; ++k) {
                  //if(seqFirst[k] == '-') continue;

                  if(j == 0) resi2cntSameRes[resi] = 0;

                  text += trackSeqArray[j][k]; //ic.giSeq[chainid][i];

                  if(seqFirst[k] != '-') {
                      if(seqFirst[k] == trackSeqArray[j][k]) ++resi2cntSameRes[resi];
                      ++resi;
                  }
               }

               var title =(trackTitleArray[j].length < 20) ? trackTitleArray[j] : trackTitleArray[j].substr(0, 20) + '...';
               var bMsa = true;
               thisClass.showNewTrack(chainid, title, text, undefined, undefined, type, undefined, bMsa);

               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text)
                + " | type " + type + " | color 0 | msa 1", true);
           }

           // set colot for the master seq
           if(trackSeqArray.length > 0) {
                if(ic.queryresi2score === undefined) ic.queryresi2score = {}
                if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {}

                var nSeq = trackSeqArray.length;
                for(var resi in resi2cntSameRes) {
                    var score = parseInt(resi2cntSameRes[resi] / nSeq * 100);
                    ic.queryresi2score[chainid][resi] = score;
                }

                var resiArray = Object.keys(resi2cntSameRes);
                var start = Math.min.apply(null, resiArray);
                var end = Math.max.apply(null, resiArray);

                var resiScoreStr = '';
                for(var resi = start; resi <= end; ++resi) {
                    if(resi2cntSameRes.hasOwnProperty(resi)) {
                        resiScoreStr += Math.round(resi2cntSameRes[resi] / nSeq * 9); // max 9
                    }
                    else {
                        resiScoreStr += '_';
                    }
                }

                ic.opts['color'] = 'align custom';
                ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

                ic.hlUpdateCls.updateHlAll();

                ic.drawCls.draw();

                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
           }
        });

        // BED file
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button3", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();


           var file = $("#" + ic.pre + "track_bed")[0].files[0];

           if(!file) {
             alert("Please select a file...");
           }
           else {
             if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;

               var lineArray = dataStr.split('\n');

               var bItemRgb = false, bColorByStrand = false;
               var strandRgbArray;
               for(var i = 0, il = lineArray.length; i < il; ++i) {
                   if(lineArray[i].substr(0, 7) == 'browser') continue;

                   if(lineArray[i].substr(0, 5) == 'track') {
                       if(lineArray[i].toLowerCase().indexOf('itemrgb') != -1) bItemRgb = true;
                       if(lineArray[i].toLowerCase().indexOf('colorbystrand=') != -1) {
                           bColorByStrand = true;

                           //e.g., colorByStrand="255,0,0 0,0,255"
                           var pos = lineArray[i].toLowerCase().indexOf('colorbystrand=');
                           var restStr = lineArray[i].substr(pos);
                           var quotePos = restStr.indexOf('"');
                           if(quotePos != -1) {
                             var quoteStr = restStr.substr(quotePos + 1);
                             var quotePos2 = quoteStr.indexOf('"');
                             if(quotePos != -1) {
                               var colorList = quoteStr.substr(0, quotePos2);
                               strandRgbArray = colorList.split(' ');
                             }
                           }

                       }
                   }
                   else { // tracks
                          if(lineArray[i] == '') continue;
                          var fieldArray = lineArray[i].replace(/\s+/g, ' ').split(' ');

                          if(fieldArray.length > 8 || fieldArray.length < 6) bColorByStrand = false;
                          if(fieldArray.length < 9) bItemRgb = false;

                          //https://genoic.ucsc.edu/FAQ/FAQformat.html#format1
                          var chromName = fieldArray[0];
                          var chromStart = fieldArray[1];
                          var chromEnd = fieldArray[2];
                          var trackName = fieldArray[3];

                          var score, strand, thickStart, thickEnd, itemRgb, blockCount, blockSizes, blockStarts;

                          if(fieldArray.length > 4) score = fieldArray[4];
                          if(fieldArray.length > 5) strand = fieldArray[5]; // ., +, or -
                          if(fieldArray.length > 6) thickStart = fieldArray[6];
                          if(fieldArray.length > 7) thickEnd = fieldArray[7];
                          if(fieldArray.length > 8) itemRgb = fieldArray[8];
                          if(fieldArray.length > 9) blockCount = fieldArray[9];
                          if(fieldArray.length > 10) blockSizes = fieldArray[10];
                          if(fieldArray.length > 11) blockStarts = fieldArray[11];

                       var title = trackName;

                       var rgbColor = '51,51,51';
                       if(bItemRgb) {
                           rgbColor = itemRgb;
                       }
                       else if(bColorByStrand) {
                           if(strand == '+' && strandRgbArray.length > 0) {
                               rgbColor = strandRgbArray[0];
                           }
                           else if(strand == '-' && strandRgbArray.length > 1) {
                               rgbColor = strandRgbArray[1];
                           }
                           else if(strand == '.' && strandRgbArray.length > 2) {
                               rgbColor = strandRgbArray[2];
                           }
                       }

                       var text = '';
                       var cssColorArray = [];
                       for(var j = 0, jl = chromEnd; j < jl; ++j) {
                           if(j < chromStart) {
                               text += '-';
                               cssColorArray.push('');
                           }
                           else {
                               text += ic.giSeq[chainid][j];
                               cssColorArray.push('rgb(' + rgbColor + ')');
                           }
                       }

                       thisClass.showNewTrack(chainid, title, text, cssColorArray, undefined, undefined, rgbColor);

                       ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text) + " | type bed | color " + rgbColor, true);
                   }
               }
             };

             reader.readAsText(file);
           }
        });

        // custom
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button4", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();
           var title = $("#" + ic.pre + "track_title").val();
           var text = $("#" + ic.pre + "track_text").val(); // input simplifyText

           //this.showNewTrack(chainid, title, text);
           //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + this.simplifyText(text), true);
           var result = this.getFullText(text);

           thisClass.showNewTrack(chainid, title,  result.text, undefined, undefined, 'custom', undefined, undefined, result.fromArray, result.toArray);

           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + text + " | type custom", true);
        });

        // current selection
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button5", "click", function(e) { var ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           var chainid = $("#" + ic.pre + "track_chainid").val();
           var title = $("#" + ic.pre + "track_selection").val();
           var text = '';

           var selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid]);

           var residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(selectedAtoms);

           var cssColorArray = [];
           for(var i = 0, il = ic.giSeq[chainid].length; i < il; ++i) {
              var cFull = ic.giSeq[chainid][i];

              var c = cFull;
              if(cFull.length > 1) {
                  //c = cFull[0] + '..';
                  c = cFull[0]; // one letter for each residue
              }

              var pos =(i >= ic.matchedPos[chainid] && i - ic.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - ic.matchedPos[chainid]].resi : ic.baseResi[chainid] + 1 + i;

              if( residueHash.hasOwnProperty(chainid + '_' + pos) ) {
                  var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[chainid + '_' + pos]);
                  var colorStr =(atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                  var color =(atom.color !== undefined) ? colorStr : "CCCCCC";

                  text += c;
                  cssColorArray.push('#' + color);
              }
              else {
                  text += '-';
                  cssColorArray.push('');
              }
           }

           thisClass.showNewTrack(chainid, title, text, cssColorArray, undefined, 'selection', undefined);

           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text) + " | type selection", true);
        });

    }

    showNewTrack(chnid, title, text, cssColorArray, inTarget2queryHash, type, color, bMsa, fromArray, toArray) {  var ic = this.icn3d, me = ic.icn3dui;
        //if(ic.customTracks[chnid] === undefined) {
        //    ic.customTracks[chnid] = {}
        //}

        var bErrorMess = false;
        if(text == 'cannot be aligned') {
            bErrorMess = true;
        }

        var textForCnt = text.replace(/-/g, '');
        var resCnt = textForCnt.length;
        //if(resCnt > ic.giSeq[chnid].length) {
        //    resCnt = ic.giSeq[chnid].length;
        //}

        if(!bMsa) {
            if(text.length > ic.giSeq[chnid].length) {
                text = text.substr(0, ic.giSeq[chnid].length);
            }
            else if(text.length < ic.giSeq[chnid].length && !bErrorMess) {
                // .fill is not supported in IE
                //var extra = Array(ic.giSeq[chnid].length - text.length).fill(' ').join('');
                var extra = '';
                for(var i = 0, il = ic.giSeq[chnid].length - text.length; i < il; ++i) {
                    extra += '-';
                }

                text += extra;
            }
        }

        var simpTitle = title.replace(/\s/g, '_').replace(/\./g, 'dot').replace(/\W/g, '');
        if(simpTitle.length > 20) simpTitle = simpTitle.substr(0, 20);

        //ic.customTracks[chnid][simpTitle] = text;

        var divLength = ic.icn3dui.htmlCls.RESIDUE_WIDTH * text.length + 200;

        $("#" + ic.pre + "dt_custom_" + chnid).append("<div id='" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle).width(divLength);

        $("#" + ic.pre + "ov_custom_" + chnid).append("<div id='" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle).width(divLength);

        $("#" + ic.pre + "tt_custom_" + chnid).append("<div id='" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle).width(divLength);

        var html = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        var html2 = html;
        var html3 = html;

        //var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
        //var htmlTmp2 = '<div class="icn3d-seqTitle" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
        var index = parseInt(Math.random()*10);
        var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' +(index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + simpTitle + ' </div>';
        var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';

        html3 += htmlTmp2 + htmlTmp3 + '<br>';

        var htmlTmp = '<span class="icn3d-seqLine">';

        html += htmlTmp2 + htmlTmp3 + htmlTmp;
        html2 += htmlTmp2 + htmlTmp3 + htmlTmp;

        //var pre ='cst' + ic.customTracks[chnid].length;
        var posTmp = chnid.indexOf('_');
        //var pre ='cst' + chnid.substr(posTmp);
        var pre ='cst' + chnid.substr(posTmp + 1);

        var prevEmptyWidth = 0;
        var prevLineWidth = 0;
        var widthPerRes = 1;

        var bAlignColor =(type === undefined || type === 'seq' || type === 'custom') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

        var bIdentityColor =(type === 'identity') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

        var parsedResn = {}
        var gapCnt = 0, currResi = 1;
        htmlTmp2 = '';
        for(var i = 0, il = text.length; i < il; ++i) {
          var resNum = i-gapCnt;

          if(!bMsa) {
              html += ic.showSeqCls.insertGap(chnid, i, '-');
          }
          else {
              if(ic.targetGapHash.hasOwnProperty(resNum) && !parsedResn.hasOwnProperty(resNum)) {
                  gapCnt += ic.targetGapHash[resNum].to - ic.targetGapHash[resNum].from + 1;

                  parsedResn[resNum] = 1;
              }
          }

          var c = text.charAt(i);

          if(c != ' ' && c != '-') {
              var resName =(ic.chainsSeq[chnid][resNum]) ? ic.chainsSeq[chnid][resNum].name : ' ';
              var colorHexStr = ic.showAnnoCls.getColorhexFromBlosum62(c, resName);
              var identityColorStr =(c == resName) ? 'FF0000' : '0000FF';

              //var pos =(resNum >= ic.matchedPos[chnid] && resNum - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][resNum - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + resNum;
              var pos = currResi;

              if(inTarget2queryHash !== undefined) pos = inTarget2queryHash[i] + 1; // 0-based

              var tmpStr;
              if(cssColorArray !== undefined && cssColorArray[i] != '') {
                  tmpStr = 'style="color:' + cssColorArray[i] + '"';
              }
              else if(color) {
                  tmpStr = 'style="color:rgb(' + color + ')"';
              }
              else if(bAlignColor) {
                  tmpStr = 'style="color:#' + colorHexStr + '"';
              }
              else if(bIdentityColor) {
                  tmpStr = 'style="color:#' + identityColorStr + '"';
              }
              else {
                  tmpStr = '';
              }

              html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" ' + tmpStr + '>' + c + '</span>';

              htmlTmp2 += ic.showSeqCls.insertGapOverview(chnid, i);

              var emptyWidth =(ic.icn3dui.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth * i / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
              if(emptyWidth < 0) emptyWidth = 0;

              htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
              if(cssColorArray !== undefined && cssColorArray[i] != '') {
                  tmpStr = cssColorArray[i];
              }
              else if(color) {
                  tmpStr = 'rgb(' + color + ')';
              }
              else if(bAlignColor) {
                  tmpStr = '#' + colorHexStr;
              }
              else {
                  tmpStr = '#333';
              }

              htmlTmp2 += '<div style="display:inline-block; background-color:' + tmpStr + '; width:' + widthPerRes + 'px;" title="' + c +(i+1).toString() + '">&nbsp;</div>';

              prevEmptyWidth += emptyWidth;
              prevLineWidth += widthPerRes;

              ++currResi;
          }
          else {
              if(bErrorMess) {
                  html += '<span>' + c + '</span>';
              }
              else {
                html += '<span>-</span>';
              }
          }
        }

        if(fromArray !== undefined) {
            htmlTmp2 = '';
            var fromArray2 = [], toArray2 = [];
            for(var i = 0, il = fromArray.length; i < il; ++i) {
                fromArray2.push(fromArray[i]);

                for(var j = fromArray[i]; j <= toArray[i]; ++j) {
                    if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(j)) {
                        toArray2.push(j - 1);
                        fromArray2.push(j);
                    }
                }

                toArray2.push(toArray[i]);
            }

            ic.nTotalGap = 0;
            for(var i in ic.targetGapHash) {
                ic.nTotalGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
            }

            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            var colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            var color =(atom.color !== undefined) ? colorStr : "CCCCCC";

            for(var i = 0, il = fromArray2.length; i < il; ++i) {
                htmlTmp2 += ic.showSeqCls.insertGapOverview(chnid, fromArray2[i]);

                var emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray2[i] - ic.baseResi[chnid] - 1) /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
                htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';

                htmlTmp2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' +(index+1).toString() + '" id="' + chnid + '_custom_' + index + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + title + '</div>';
            }
        }

        htmlTmp = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';
        htmlTmp += '</span>';
        htmlTmp += '<br>';

        htmlTmp += '</div>';

        html += htmlTmp;
        html2 += htmlTmp2 + htmlTmp;

        html3 += '</div>';

        $("#" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle).html(html);
        $("#" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle).html(html2);
        $("#" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle).html(html3);
    }

    alignSequenceToStructure(chainid, data, title) { var ic = this.icn3d, me = ic.icn3dui;
      var query, target;

      if(data.data !== undefined) {
          query = data.data[0].query;
          //target = data.data[0].targets[chainid.replace(/_/g, '')];
          target = data.data[0].targets[chainid];

          target = target.hsps[0];
      }

      var text = '';

      if(query !== undefined && target !== undefined) {
          var evalue = target.scores.e_value.toPrecision(2);
          if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();

          var bitscore = target.scores.bit_score;

          //var targetSeq = data.targets[chainid.replace(/_/g, '')].seqdata;
          var targetSeq = data.targets[chainid].seqdata;
          var querySeq = query.seqdata;

          var segArray = target.segs;
          var target2queryHash = {}
          for(var i = 0, il = segArray.length; i < il; ++i) {
              var seg = segArray[i];
              for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                  target2queryHash[j + seg.orifrom] = j + seg.from;
              }
          }

          var cssColorArray = [];
          // the missing residuesatthe end ofthe seq will be filled up in the API showNewTrack()
          for(var i = 0, il = targetSeq.length; i < il; ++i) {
              if(target2queryHash.hasOwnProperty(i)) {
                  text += querySeq[target2queryHash[i]];

                  var colorHexStr = ic.showAnnoCls.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
                  cssColorArray.push("#" + colorHexStr);

                  var resi = i + 1;
                  for(var serial in ic.residues[chainid + '_' + resi]) {
                      var color = me.parasCls.thr("#" + colorHexStr);
                      ic.atoms[serial].color = color;
                      ic.atomPrevColors[serial] = color;
                  }
              }
              else {
                  text += '-';
                  cssColorArray.push("");
              }
          }

          title += ', E: ' + evalue;
      }
      else {
          text += "cannot be aligned";
      }

      this.showNewTrack(chainid, title, text, cssColorArray, target2queryHash, 'seq');

      ic.hlUpdateCls.updateHlAll();
      ic.drawCls.draw();

      ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + this.simplifyText(text) + " | type seq", true);
    }

    defineSecondary(chainid, type) { var ic = this.icn3d, me = ic.icn3dui;
        if(!$('#' + ic.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + ic.pre + 'dl_definedsets').dialog( 'isOpen' )) {
            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_definedsets', 'Select sets');
            $("#" + ic.pre + "atomsCustom").resizable();
        }

        var selectedResidues = {}
        var bUnion = false, bUpdateHighlight = true;

        // order of secondary structures
        var index = 1;

        var helixCnt = 0, sheetCnt = 0, bFirstSS = true;
        var zero = '0';
        //var prevName = chainid + zero + index + '_L(N', currName, setName;
        var prevName = chainid + '_C(Nterm', currName, setName;

        // clear selection
        ic.hAtoms = {}

        //for(var i = 0, il = ic.giSeq[chainid].length; i < il; ++i) {
          //var currResi =(i >= ic.matchedPos[chainid] && i - ic.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - ic.matchedPos[chainid]].resi : ic.baseResi[chainid] + 1 + i;
        for(var i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
          var currResi = ic.chainsSeq[chainid][i].resi;

          // name of secondary structures
          var residueid = chainid + '_' + currResi;

          if( ic.residues.hasOwnProperty(residueid) ) {
            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
            var currSS = ic.secondaries[residueid];

            if(currSS == 'H') {
                if(atom.ssbegin) {
                    ++helixCnt;

                    if(Object.keys(selectedResidues).length > 0) {
                        setName = currName + 'H' + helixCnt + ')';
                        if(type == 'coil') {
                            ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                            if(!bUnion) bUnion = true;
                        }
                        selectedResidues = {}
                        ++index;
                    }
                }

                //zero =(index < 10) ? '0' : '';
                //currName = chainid + zero + index + '_H' + helixCnt;
                currName = chainid + '_H' + helixCnt;
                selectedResidues[residueid] = 1;

                if(atom.ssend) {
                    //zero =(index < 9) ? '0' : '';
                    //prevName = chainid + zero +(index+1) + '_L(H' + helixCnt;
                    prevName = chainid + '_C(H' + helixCnt;
                    if(type == 'helix') {
                        ic.selectionCls.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {}
                    ++index;
                }
            }
            else if(currSS == 'E') {
                if(atom.ssbegin) {
                    ++sheetCnt;

                    if(Object.keys(selectedResidues).length > 0) {
                        setName = currName + 'S' + sheetCnt + ')';
                        if(type == 'coil') {
                            ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                            if(!bUnion) bUnion = true;
                        }
                        selectedResidues = {}
                        ++index;
                    }
                }

                //zero =(index < 10) ? '0' : '';
                //currName = chainid + zero + index + '_S' + sheetCnt;
                currName = chainid + '_S' + sheetCnt;
                selectedResidues[residueid] = 1;

                if(atom.ssend) {
                    //zero =(index < 9) ? '0' : '';
                    //prevName = chainid + zero +(index+1) + '_L(S' + sheetCnt;
                    prevName = chainid + '_C(S' + sheetCnt;
                    if(type == 'sheet') {
                        ic.selectionCls.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {}
                    ++index;
                }
            }
            else {
                currName = prevName + '-';
                selectedResidues[residueid] = 1;
            }
          } // end if( ic.residues.hasOwnProperty(residueid) ) {
        } // for loop

        if(Object.keys(selectedResidues).length > 0) {
            setName = currName + 'Cterm)';
            if(type == 'coil') {
                ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
            }
        }
    }

    simplifyText(text) { var ic = this.icn3d, me = ic.icn3dui;
        var out = ''; // 1-based text positions
        var bFoundText = false;

        var i, il, prevEmptyPos = -1;
        for(i = 0, il = text.length; i < il; ++i) {
            if(text[i] == '-' || text[i] == ' ') {
                if(bFoundText && i !== prevEmptyPos) {
                    if(prevEmptyPos+1 == i-1) {
                        out +=(prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
                   }
                    else {
                        out +=(prevEmptyPos+1 + 1).toString() + '-' +(i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
                    }
                    bFoundText = false;
                }

                prevEmptyPos = i;
            }
            else {
                bFoundText = true;
            }
        }

        if(bFoundText && i == il) {
            if(prevEmptyPos+1 == i-1) {
                out +=(prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
            }
            else {
                out +=(prevEmptyPos+1 + 1).toString() + '-' +(i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
            }
        }

        return out;
    }

    checkGiSeq(chainid, title, text, type, color, bMsa, index) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;
        if(index > 20) return false;

        if(ic.giSeq !== undefined && ic.giSeq[chainid] !== undefined) {
            var result = this.getFullText(text);
            text = result.text;
            this.showNewTrack(chainid, title, text, undefined, undefined, type, color, bMsa);
            return false;
        }

        // wait for ic.giSeq to be available
        setTimeout(function(){ thisClass.checkGiSeq(chainid, title, text, type, color, bMsa, index + 1); }, 100);
    }

    getFullText(text) { var ic = this.icn3d, me = ic.icn3dui;
        var out = '', fromArray = [], toArray = [];

        var textArray = text.split(',');
        var lastTextPos = -1;
        for(var i = 0, il = textArray.length; i < il; ++i) {
            var eachText = textArray[i].trim();
            if(eachText.length == 0) continue;

            var range_text = eachText.split(' ');
            if(range_text.length !== 2) continue;

            var rangeText = range_text[1];
            var start_end = range_text[0].split('-');

            var start, end;
            if(start_end.length == 2) {
                start = start_end[0] - 1; // 1-based
                end = start_end[1] - 1;
            }
            else if(start_end.length == 1) {
                start = start_end[0] - 1;
                end = start;
            }
            else {
                continue;
            }

            fromArray.push(start);
            toArray.push(end);

            // previous empty text
            for(var j = 0; j < start - lastTextPos - 1; ++j) {
                out += '-';
            }

            var range = end - start + 1;

            if(rangeText.length > range) {
                 out += rangeText.substr(0, range);
            }
            else {
                 out += rangeText;
            }

            // fill up rangeText
            for(var j = 0; j < range - rangeText.length; ++j) {
                out += '-';
            }

            lastTextPos = end;
        }

        return {"text": out, "fromArray": fromArray, "toArray": toArray}
    }

    setCustomFile(type, startColor, midColor, endColor) {var ic = this.icn3d, me = ic.icn3dui;
       var thisClass = this;

       var chainid = $("#" + ic.pre + "customcolor_chainid").val();
       var file = $("#" + ic.pre + "cstcolorfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         var reader = new FileReader();
         reader.onload = function(e) { var ic = thisClass.icn3d;
            var dataStr = e.target.result; // or = reader.result;
            var lineArray = dataStr.split('\n');
            if(ic.queryresi2score === undefined) ic.queryresi2score = {}
            //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {}
            ic.queryresi2score[chainid] = {}
            for(var i = 0, il = lineArray.length; i < il; ++i) {
                if(lineArray[i].trim() !== '') {
                    var columnArray = lineArray[i].split(/\s+/);
                    ic.queryresi2score[chainid][columnArray[0]] = columnArray[1];
                }
            }
            var resiArray = Object.keys(ic.queryresi2score[chainid]);
            var start = Math.min.apply(null, resiArray);
            var end = Math.max.apply(null, resiArray);
            var resiScoreStr = '';
            for(var resi = start; resi <= end; ++resi) {
                if(ic.queryresi2score[chainid].hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(ic.queryresi2score[chainid][resi]/11); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }

            if(type == 'color') {
                ic.opts['color'] = 'align custom';

                ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
                ic.hlUpdateCls.updateHlAll();
                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr + ' | colorrange ' + startColor + ' ' + midColor + ' ' + endColor, true);

                var legendHtml = me.htmlCls.clickMenuCls.setLegendHtml();

                $("#" + me.pre + "legend").html(legendHtml);
            }
            else if(type == 'tube') {
                ic.setOptionCls.setStyle('proteins', 'custom tube');
                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('color tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }
            ic.drawCls.draw();
         }
         reader.readAsText(file);
       }
    }

}

export {AddTrack}
