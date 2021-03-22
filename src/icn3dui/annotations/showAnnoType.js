/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showAnnoType = function(chnid, chnidBase, type, title, residueArray, resid2resids) { var me = this, ic = me.icn3d; "use strict";
    var html = '<div id="' + me.pre + chnid + '_' + type + 'seq_sequence" class="icn3d-dl_sequence">';
    var html2 = html;
    var html3 = html;
    if(residueArray.length == 0) {
        $("#" + me.pre + "dt_" + type + "_" + chnid).html('');
        $("#" + me.pre + "ov_" + type + "_" + chnid).html('');
        $("#" + me.pre + "tt_" + type + "_" + chnid).html('');
        return;
    }
    var fulltitle = title;
    if(title.length > 17) title = title.substr(0, 17) + '...';
    var resPosArray = [];
    for(var i = 0, il = residueArray.length; i < il; ++i) {
        var resid = residueArray[i];
        var resi = Math.round(resid.substr(residueArray[i].lastIndexOf('_') + 1) );
        resPosArray.push( resi );
    }
    var resCnt = resPosArray.length;
    var chainnameNospace = type;
    var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" ' + type + '="" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_' + chainnameNospace + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
    var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
    html3 += htmlTmp2 + htmlTmp3 + '<br>';
    var htmlTmp = '<span class="icn3d-seqLine">';
    html += htmlTmp2 + htmlTmp3 + htmlTmp;
    html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
    var pre = type;
    var prevEmptyWidth = 0;
    var prevLineWidth = 0;
    var widthPerRes = 1;
    for(var i = 0, il = me.giSeq[chnid].length; i < il; ++i) {
      html += me.insertGap(chnid, i, '-');
      if(resPosArray.indexOf(i+1 + me.baseResi[chnid]) != -1) {
          var cFull = me.giSeq[chnid][i];
          var c = cFull;
          if(cFull.length > 1) {
              c = cFull[0] + '..';
          }
          var pos = (i >= me.matchedPos[chnid] && i - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i;
          var resid = chnid + '_' + (i+1 + me.baseResi[chnid]).toString();
          var title = cFull + (i+1 + me.baseResi[chnid]).toString();
          if(type == 'ssbond') {
              title = 'Residue ' + resid + ' has disulfide bond with';
              if(resid2resids[resid] !== undefined) {
                  for(var j = 0, jl = resid2resids[resid].length; j < jl; ++j) {
                      title += ' residue ' + resid2resids[resid][j];
                  }
              }
          }
          else if(type == 'crosslink') {
              title = 'Residue ' + resid + ' has cross-linkage with';
              if(resid2resids[resid] !== undefined) {
                  for(var j = 0, jl = resid2resids[resid].length; j < jl; ++j) {
                      title += ' residue ' + resid2resids[resid][j];
                  }
              }
          }
          html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + title + '" class="icn3d-residue">' + c + '</span>';
          html2 += me.insertGapOverview(chnid, i);
          var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * i / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
            //if(emptyWidth < 0) emptyWidth = 0;
            if(emptyWidth >= 0) {
            html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
            html2 += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + title + '">&nbsp;</div>';
            prevEmptyWidth += emptyWidth;
            prevLineWidth += widthPerRes;
            }
      }
      else {
        html += '<span>-</span>'; //'<span>-</span>';
      }
    }
    htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
    htmlTmp += '</span>';
    htmlTmp += '<br>';
    html += htmlTmp;
    html2 += htmlTmp;
    html += '</div>';
    html2 += '</div>';
    html3 += '</div>';
    $("#" + me.pre + "dt_" + type + "_" + chnid).html(html);
    $("#" + me.pre + "ov_" + type + "_" + chnid).html(html2);
    $("#" + me.pre + "tt_" + type + "_" + chnid).html(html3);
};
