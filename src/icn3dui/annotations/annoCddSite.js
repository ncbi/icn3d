/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showCddSiteAll = function() { var me = this, ic = me.icn3d; "use strict";
    var chnidBaseArray = $.map(me.protein_chainid, function(v) { return v; });
    var chnidArray = Object.keys(me.protein_chainid);
    // show conserved domains and binding sites
    var url = me.baseUrl + "cdannots/cdannots.fcgi?fmt&live=lcl&queries=" + chnidBaseArray;
    $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data) {
          var chainWithData = {};
          for(var chainI = 0, chainLen = data.data.length; chainI < chainLen; ++chainI) {
            var cddData = data.data[chainI];
            var chnidBase = cddData._id;
            //var pos = chnidBaseArray.indexOf(chnidBase);
            //var chnid = chnidArray[pos];
            var chnid = chnidArray[chainI];
            chainWithData[chnid] = 1;
            var html = '<div id="' + me.pre + chnid + '_cddseq_sequence" class="icn3d-cdd icn3d-dl_sequence">';
            var html2 = html;
            var html3 = html;
            var domainArray = cddData.doms;
            var result = me.setDomainFeature(domainArray, chnid, true, html, html2, html3);

            html = result.html + '</div>';
            html2 = result.html2 + '</div>';
            html3 = result.html3 + '</div>';
            $("#" + me.pre + "dt_cdd_" + chnid).html(html);
            $("#" + me.pre + "ov_cdd_" + chnid).html(html2);
            $("#" + me.pre + "tt_cdd_" + chnid).html(html3);
            html = '<div id="' + me.pre + chnid + '_siteseq_sequence" class="icn3d-dl_sequence">';
            html2 = html;
            html3 = html;

            // features
            var featuteArray = cddData.motifs;
            var result = me.setDomainFeature(featuteArray, chnid, false, html, html2, html3);

            html = result.html + '</div>';
            html2 = result.html2 + '</div>';
            html3 = result.html3 + '</div>';

            var siteArray = data.data[chainI].sites;
            indexl = (siteArray !== undefined) ? siteArray.length : 0;
            for(var index = 0; index < indexl; ++index) {
                var domain = siteArray[index].srcdom;
                var type = siteArray[index].type;
                var resCnt = siteArray[index].sz;
                var title = 'site: ' + siteArray[index].title;
                if(title.length > 17) title = title.substr(0, 17) + '...';
                //var fulltitle = "site: " + siteArray[index].title + " (domain: " + domain + ")";
                var fulltitle = siteArray[index].title;
                var resPosArray, adjustedResPosArray = [];
                for(var i = 0, il = siteArray[index].locs.length; i < il; ++i) {
                    resPosArray = siteArray[index].locs[i].coords;
                    for(var j = 0, jl = resPosArray.length; j < jl; ++j) {
                        //adjustedResPosArray.push(Math.round(resPosArray[j]) + me.baseResi[chnid]);
                        adjustedResPosArray.push(me.getAdjustedResi(Math.round(resPosArray[j]), chnid, me.matchedPos, me.chainsSeq, me.baseResi) - 1);
                    }
                }
                var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" site="site" posarray="' + adjustedResPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_site_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
                var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
                var htmlTmp = '<span class="icn3d-seqLine">';
                html3 += htmlTmp2 + htmlTmp3 + '<br>';
                html += htmlTmp2 + htmlTmp3 + htmlTmp;
                html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
                var pre = 'site' + index.toString();
                //var widthPerRes = me.seqAnnWidth / me.maxAnnoLength;
                var prevEmptyWidth = 0;
                var prevLineWidth = 0;
                var widthPerRes = 1;
                for(var i = 0, il = me.giSeq[chnid].length; i < il; ++i) {
                  html += me.insertGap(chnid, i, '-');
                  if(resPosArray.indexOf(i) != -1) {
                      var cFull = me.giSeq[chnid][i];
                      var c = cFull;
                      if(cFull.length > 1) {
                          c = cFull[0] + '..';
                      }
                      //var pos = (i >= me.matchedPos[chnid] && i - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i;
                      var pos = me.getAdjustedResi(i, chnid, me.matchedPos, me.chainsSeq, me.baseResi);

                    html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                    html2 += me.insertGapOverview(chnid, i);
                    var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * i / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
                    //if(emptyWidth < 0) emptyWidth = 0;
                    if(emptyWidth >= 0) {
                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + c + pos + '">&nbsp;</div>';
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
            }
            html += '</div>';
            html2 += '</div>';
            html3 += '</div>';
            $("#" + me.pre + "dt_site_" + chnid).html(html);
            $("#" + me.pre + "ov_site_" + chnid).html(html2);
            $("#" + me.pre + "tt_site_" + chnid).html(html3);
        } // outer for loop
        // missing CDD data
        for(var chnid in me.protein_chainid) {
            if(!chainWithData.hasOwnProperty(chnid)) {
                $("#" + me.pre + "dt_cdd_" + chnid).html('');
                $("#" + me.pre + "ov_cdd_" + chnid).html('');
                $("#" + me.pre + "tt_cdd_" + chnid).html('');
                $("#" + me.pre + "dt_site_" + chnid).html('');
                $("#" + me.pre + "ov_site_" + chnid).html('');
                $("#" + me.pre + "tt_site_" + chnid).html('');
            }
        }
        // add here after the ajax call
        me.enableHlSeq();
        me.bAjaxCddSite = true;
        if(me.deferredAnnoCddSite !== undefined) me.deferredAnnoCddSite.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        console.log( "No CDD data were found for the protein " + chnidBaseArray + "..." );
        for(var chnid in me.protein_chainid) {
            $("#" + me.pre + "dt_cdd_" + chnid).html('');
            $("#" + me.pre + "ov_cdd_" + chnid).html('');
            $("#" + me.pre + "tt_cdd_" + chnid).html('');
            $("#" + me.pre + "dt_site_" + chnid).html('');
            $("#" + me.pre + "ov_site_" + chnid).html('');
            $("#" + me.pre + "tt_site_" + chnid).html('');
        }
        // add here after the ajax call
        me.enableHlSeq();
        me.bAjaxCddSite = true;
        if(me.deferredAnnoCddSite !== undefined) me.deferredAnnoCddSite.resolve();
        return;
      }
    });
};

iCn3DUI.prototype.setDomainFeature = function(domainArray, chnid, bDomain, html, html2, html3) { var me = this, ic = me.icn3d; "use strict";
    var indexl = (domainArray !== undefined) ? domainArray.length : 0;
    var maxTextLen = (bDomain) ? 14 : 17;
    var titleSpace = (bDomain) ? 100 : 120;
    for(var index = 0; index < indexl; ++index) {
        var acc = (bDomain) ? domainArray[index].acc : domainArray[index].srcdom;
        var type = domainArray[index].type;
        type = (bDomain) ? 'domain' : 'feat';
        var domain = (bDomain) ? domainArray[index].title.split(':')[0] : domainArray[index].title;
        var defline = (bDomain) ? domainArray[index].defline : '';
        var title = type + ': ' + domain;

        if(title.length > maxTextLen) title = title.substr(0, maxTextLen) + '...';
        var fulltitle = type + ": " + domain;
        // each domain may have several repeat. Treat each repeat as a domain
        var domainRepeatArray = domainArray[index].locs;

        for(var r = 0, rl = domainRepeatArray.length; r < rl; ++r) {
            // each domain repeat or domain may have several segments, i.e., a domain may not be continous
            var fromArray = [], toArray = [];
            var resiHash = {};
            var resCnt = 0;
            var segArray = (bDomain) ? domainRepeatArray[r].segs : [domainRepeatArray[r]];
            for(var s = 0, sl = segArray.length; s < sl; ++s) {
                var domainFrom = Math.round(segArray[s].from);
                var domainTo = Math.round(segArray[s].to);
                //fromArray.push(domainFrom + me.baseResi[chnid]);
                //toArray.push(domainTo + me.baseResi[chnid]);
                fromArray.push(me.getAdjustedResi(domainFrom, chnid, me.matchedPos, me.chainsSeq, me.baseResi) - 1);
                toArray.push(me.getAdjustedResi(domainTo, chnid, me.matchedPos, me.chainsSeq, me.baseResi) - 1);
                for(var i = domainFrom; i <= domainTo; ++i) {
                    resiHash[i] = 1;
                }
                resCnt += domainTo - domainFrom + 1;
            }

            var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" ' + type + '="' + acc + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" setname="' + chnid + '_' + type + '_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            var htmlTmp = '<span class="icn3d-seqLine">';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            if(bDomain) {
                html2 += '<div style="width:20px; display:inline-block;"><span id="' + me.pre + chnid + '_' + acc + '_' + r + '_cddseq_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + chnid + '_' + acc + '_' + r + '_cddseq_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div>';
            }
            html2 += '<div style="width:' + titleSpace + 'px!important;" class="icn3d-seqTitle icn3d-link icn3d-blue" ' + type + '="' + acc + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_' + type + '_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            html2 += htmlTmp3 + htmlTmp;
            var pre = type + index.toString();
            for(var i = 0, il = me.giSeq[chnid].length; i < il; ++i) {
              html += me.insertGap(chnid, i, '-');
              if(resiHash.hasOwnProperty(i)) {
                  var cFull = me.giSeq[chnid][i];
                  var c = cFull;
                  if(cFull.length > 1) {
                      c = cFull[0] + '..';
                  }
                  //var pos = (i >= me.matchedPos[chnid] && i - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i;
                  var pos = me.getAdjustedResi(i, chnid, me.matchedPos, me.chainsSeq, me.baseResi);
                  html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
              }
              else {
                  html += '<span>-</span>'; //'<span>-</span>';
              }
            }
            var atom = ic.getFirstCalphaAtomObj(ic.chains[chnid]);
            var colorStr = (atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            var color = (atom.color !== undefined) ? colorStr : "CCCCCC";
            if(me.cfg.blast_rep_id != chnid) { // regular
                for(var i = 0, il = fromArray.length; i < il; ++i) {
                    var emptyWidth = (i == 0) ? Math.round(me.seqAnnWidth * (fromArray[i] - me.baseResi[chnid] - 1) / me.maxAnnoLength) : Math.round(me.seqAnnWidth * (fromArray[i] - toArray[i-1] - 1) / me.maxAnnoLength);
                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(me.seqAnnWidth * (toArray[i] - fromArray[i] + 1) / me.maxAnnoLength) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" domain="' + (index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_domain_' + index + '_' + r + '" id="' + chnid + '_domain_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + domain + ' </div>';
                }
            }
            else { // with potential gaps
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
                for(var i = 0, il = fromArray2.length; i < il; ++i) {
                    html2 += me.insertGapOverview(chnid, fromArray2[i]);
                    var emptyWidth = (i == 0) ? Math.round(me.seqAnnWidth * (fromArray2[i] - me.baseResi[chnid] - 1) / (me.maxAnnoLength + me.nTotalGap)) : Math.round(me.seqAnnWidth * (fromArray2[i] - toArray2[i-1] - 1) / (me.maxAnnoLength + me.nTotalGap));
                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(me.seqAnnWidth * (toArray2[i] - fromArray2[i] + 1) / (me.maxAnnoLength + me.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" domain="' + (index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_domain_' + index + '_' + r + '" id="' + chnid + '_domain_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + domain + ' </div>';
                }
            }
            htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
            htmlTmp += '</span>';
            htmlTmp += '<br>';
            html += htmlTmp;
            html2 += htmlTmp;
            if(bDomain) {
                html2 += '<div id="' + me.pre + chnid + '_' + acc + '_' + r + '_cddseq" style="display:none; white-space:normal;" class="icn3d-box">' + defline + ' (<a href="' + me.baseUrl + 'cdd/cddsrv.cgi?uid=' + acc + '" target="_blank" class="icn3d-blue">open details view...</a>)</div>';
            }
        } // for(var r = 0,
    }

    return {html: html, html2: html2, html3: html3};
};

iCn3DUI.prototype.getAdjustedResi = function(resi, chnid, matchedPos, chainsSeq, baseResi) { var me = this, ic = me.icn3d; "use strict";
    return (resi >= matchedPos[chnid] && resi - matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][resi - matchedPos[chnid]].resi : baseResi[chnid] + 1 + resi;
};
