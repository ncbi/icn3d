/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getSequenceData = function(chnid, chnidBase, type, index) { var me = this, ic = me.icn3d; "use strict";
    var fullProteinName = me.getProteinName(chnid);
    var proteinName = fullProteinName;
    if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
    var categoryStr = "";
    if(index == 0) {
        if(type == 'protein') {
            categoryStr = "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>";
        }
        else if(type == 'nucleotide') {
            categoryStr = "<span class='icn3d-annoLargeTitle'><b>Nucleotides</b>: </span><br><br>";
        }
        else if(type == 'chemical') {
            categoryStr = "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>";
        }
    }
    $("#" + me.pre + "dl_annotations").append("<div id='" + me.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr + "<b>" + chnid + "</b>: " + "<span title='" + fullProteinName + "'>" + proteinName + "</span> </div>");
    // dt: detailed view, hide by default; ov: overview, show by default
    $("#" + me.pre + "anno_" + chnid).append(me.getAnDiv(chnid, 'giseq'));
    //$("#" + me.pre + "anno_" + chnid).append(me.getAnDiv(chnid, 'custom'));
    $("#" + me.pre + "anno_" + chnid).append(me.getAnDiv(chnid, 'interaction'));
    $("#" + me.pre + "anno_" + chnid).append("<br><hr><br>");
    // show the sequence and 3D structure
    me.giSeq[chnid] = [];

    for(var i = 0; i < ic.chainsSeq[chnid].length; ++i) {
        var res = ic.chainsSeq[chnid][i].name;
        //me.giSeq[chnid][i] = (res.length > 1) ? res.substr(0, 1) : res;
        me.giSeq[chnid][i] = res;
    }
    me.matchedPos[chnid] = 0;
    me.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - me.matchedPos[chnid] - 1;
    me.showSeq(chnid, chnidBase, type);
    //me.showInteraction(chnid, chnidBase);
};
iCn3DUI.prototype.getCombinedSequenceData = function(name, residArray, index) { var me = this, ic = me.icn3d; "use strict";
    var categoryStr = (index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>" : "";
    var chemName;
    var pos = residArray[0].lastIndexOf('_');
    var firstChainid = residArray[0].substr(0, pos);
    var sid = (me.cfg.mmdbid !== undefined && me.chainid2sid !== undefined) ? me.chainid2sid[firstChainid] : undefined;
    if(sid !== undefined) {
        chemName = "<b><a class='icn3d-blue' href='https://pubchem.ncbi.nlm.nih.gov/substance/" + sid + "#section=2D-Structure' target='_blank'>" + name + " <img src='https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?sid=" + sid + "'></a></b>";
    }
    else {
        chemName = "<b>" + name + "</b>";
    }
    $("#" + me.pre + "dl_annotations").append("<div id='" + me.pre + "anno_" + name + "' class='icn3d-annotation'>" + categoryStr + chemName + "</div>");
    // dt: detailed view, hide by default; ov: overview, show by default
    $("#" + me.pre + "anno_" + name).append("<div id='" + me.pre + "giseq_" + name + "'><div id='" + me.pre + "dt_giseq_" + name + "' style='display:none'></div><div id='" + me.pre + "ov_giseq_" + name + "'></div></div>");
    $("#" + me.pre + "anno_" + name).append("<br><hr><br>");
    // sequence, detailed view
    var htmlTmp = '<div id="' + me.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
    var chainType = 'Chem.', chainTypeFull = 'Chemical';
    htmlTmp += '<div class="icn3d-seqTitle2" anno="sequence"><span style="white-space:nowrap;" title="' + chainTypeFull + ' ' + name + '">' + chainType + ' ' + name + '</span></div>';
    htmlTmp += '<span class="icn3d-residueNum" style="width:60px!important;" title="starting protein sequence number">Count: ' + residArray.length + '</span>';
    htmlTmp += '<span class="icn3d-seqLine">';
    // sequence, overview
    var html = htmlTmp;
    var html2 = htmlTmp;
    for(var i = 0, il = residArray.length; i < il; ++i) {
      var cFull = name;
      var c = cFull;
      if(cFull.length > 3) {
          c = cFull.substr(0,3);
      }
      if(i < residArray.length - 1) c = c + ',';
      var resid = residArray[i];
      var resi = resid.substr(resid.lastIndexOf('_') + 1);
      html += '<span id="giseq_' + me.pre + resid + '" title="' + cFull + resi + '" class="icn3d-residue icn3d-chemical">' + c + '</span>';
    }
    var color = me.GREY8;
    //html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + Math.round(me.seqAnnWidth * residArray.length / me.maxAnnoLength) + 'px;">' + name + '</div>';
    var width = Math.round(me.seqAnnWidth * residArray.length / me.maxAnnoLength);
    if(width < 1) width = 1;
    html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + width + 'px;">&nbsp;</div>';
    //htmlTmp = '<span class="icn3d-residueNum" title="ending protein sequence number">' + residArray.length + '</span>';
    //htmlTmp += '</span>';
    htmlTmp = '</span>';
    htmlTmp += '<br>';
    htmlTmp += '</div>';
    html += htmlTmp;
    html2 += htmlTmp;
    $("#" + me.pre + 'dt_giseq_' + name).html(html);
    $("#" + me.pre + 'ov_giseq_' + name).html(html2);
};
