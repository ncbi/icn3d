/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showNewTrack = function(chnid, title, text, cssColorArray, inTarget2queryHash, type, color, bMsa, fromArray, toArray) {  var me = this, ic = me.icn3d; "use strict";
    //if(me.customTracks[chnid] === undefined) {
    //    me.customTracks[chnid] = {};
    //}

    var bErrorMess = false;
    if(text == 'cannot be aligned') {
        bErrorMess = true;
    }

    var textForCnt = text.replace(/-/g, '');
    var resCnt = textForCnt.length;
    //if(resCnt > me.giSeq[chnid].length) {
    //    resCnt = me.giSeq[chnid].length;
    //}

    if(!bMsa) {
        if(text.length > me.giSeq[chnid].length) {
            text = text.substr(0, me.giSeq[chnid].length);
        }
        else if(text.length < me.giSeq[chnid].length && !bErrorMess) {
            // .fill is not supported in IE
            //var extra = Array(me.giSeq[chnid].length - text.length).fill(' ').join('');
            var extra = '';
            for(var i = 0, il = me.giSeq[chnid].length - text.length; i < il; ++i) {
                extra += '-';
            }

            text += extra;
        }
    }

    var simpTitle = title.replace(/\s/g, '_').replace(/\./g, 'dot').replace(/\W/g, '');
    if(simpTitle.length > 20) simpTitle = simpTitle.substr(0, 20);

    //me.customTracks[chnid][simpTitle] = text;

    var divLength = me.RESIDUE_WIDTH * text.length + 200;

    $("#" + me.pre + "dt_custom_" + chnid).append("<div id='" + me.pre + "dt_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "dt_custom_" + chnid + "_" + simpTitle).width(divLength);

    $("#" + me.pre + "ov_custom_" + chnid).append("<div id='" + me.pre + "ov_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "ov_custom_" + chnid + "_" + simpTitle).width(divLength);

    $("#" + me.pre + "tt_custom_" + chnid).append("<div id='" + me.pre + "tt_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "tt_custom_" + chnid + "_" + simpTitle).width(divLength);

    var html = '<div id="' + me.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
    var html2 = html;
    var html3 = html;

    //var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
    //var htmlTmp2 = '<div class="icn3d-seqTitle" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
    var index = parseInt(Math.random()*10);
    var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' + (index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' + (index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + simpTitle + ' </div>';
    var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';

    html3 += htmlTmp2 + htmlTmp3 + '<br>';

    var htmlTmp = '<span class="icn3d-seqLine">';

    html += htmlTmp2 + htmlTmp3 + htmlTmp;
    html2 += htmlTmp2 + htmlTmp3 + htmlTmp;

    //var pre ='cst' + me.customTracks[chnid].length;
    var posTmp = chnid.indexOf('_');
    //var pre ='cst' + chnid.substr(posTmp);
    var pre ='cst' + chnid.substr(posTmp + 1);

    var prevEmptyWidth = 0;
    var prevLineWidth = 0;
    var widthPerRes = 1;

    var bAlignColor = (type === undefined || type === 'seq' || type === 'custom') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

    var bIdentityColor = (type === 'identity') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

    var parsedResn = {};
    var gapCnt = 0, currResi = 1;
    htmlTmp2 = '';
    for(var i = 0, il = text.length; i < il; ++i) {
      var resNum = i-gapCnt;

      if(!bMsa) {
          html += me.insertGap(chnid, i, '-');
      }
      else {
          if(me.targetGapHash.hasOwnProperty(resNum) && !parsedResn.hasOwnProperty(resNum)) {
              gapCnt += me.targetGapHash[resNum].to - me.targetGapHash[resNum].from + 1;

              parsedResn[resNum] = 1;
          }
      }

      var c = text.charAt(i);

      if(c != ' ' && c != '-') {
          var resName = (ic.chainsSeq[chnid][resNum]) ? ic.chainsSeq[chnid][resNum].name : ' ';
          var colorHexStr = me.getColorhexFromBlosum62(c, resName);
          var identityColorStr = (c == resName) ? 'FF0000' : '0000FF';

          //var pos = (resNum >= me.matchedPos[chnid] && resNum - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][resNum - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + resNum;
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

          html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" ' + tmpStr + '>' + c + '</span>';

          htmlTmp2 += me.insertGapOverview(chnid, i);

          var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * i / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
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

          htmlTmp2 += '<div style="display:inline-block; background-color:' + tmpStr + '; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';

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
                if(me.targetGapHash !== undefined && me.targetGapHash.hasOwnProperty(j)) {
                    toArray2.push(j - 1);
                    fromArray2.push(j);
                }
            }

            toArray2.push(toArray[i]);
        }

        me.nTotalGap = 0;
        for(var i in me.targetGapHash) {
            me.nTotalGap += me.targetGapHash[i].to - me.targetGapHash[i].from + 1;
        }

        var atom = ic.getFirstCalphaAtomObj(ic.chains[chnid]);
        var colorStr = (atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
        var color = (atom.color !== undefined) ? colorStr : "CCCCCC";

        for(var i = 0, il = fromArray2.length; i < il; ++i) {
            htmlTmp2 += me.insertGapOverview(chnid, fromArray2[i]);

            var emptyWidth = (i == 0) ? Math.round(me.seqAnnWidth * (fromArray2[i] - me.baseResi[chnid] - 1) / (me.maxAnnoLength + me.nTotalGap)) : Math.round(me.seqAnnWidth * (fromArray2[i] - toArray2[i-1] - 1) / (me.maxAnnoLength + me.nTotalGap));
            htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';

            htmlTmp2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(me.seqAnnWidth * (toArray2[i] - fromArray2[i] + 1) / (me.maxAnnoLength + me.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' + (index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' + (index+1).toString() + '" id="' + chnid + '_custom_' + index + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + title + '</div>';
        }
    }

    htmlTmp = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';
    htmlTmp += '</span>';
    htmlTmp += '<br>';

    htmlTmp += '</div>';

    html += htmlTmp;
    html2 += htmlTmp2 + htmlTmp;

    html3 += '</div>';

    $("#" + me.pre + "dt_custom_" + chnid + "_" + simpTitle).html(html);
    $("#" + me.pre + "ov_custom_" + chnid + "_" + simpTitle).html(html2);
    $("#" + me.pre + "tt_custom_" + chnid + "_" + simpTitle).html(html3);
};
