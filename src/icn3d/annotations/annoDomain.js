/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {ShowAnno} from '../annotations/showAnno.js';
import {ShowSeq} from '../annotations/showSeq.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';

class AnnoDomain {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showDomainPerStructure(index) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;
        //var chnid = Object.keys(ic.protein_chainid)[0];
        //var pdbid = chnid.substr(0, chnid.indexOf('_'));
        var pdbArray = Object.keys(ic.structures);
        // show 3D domains
        var pdbid = pdbArray[index];
        var url = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=" + pdbid;
        if(index == 0 && ic.mmdb_data !== undefined) {
            for(var chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                    this.showDomainWithData(chnid, ic.mmdb_data);
                }
            }
        }
        else if(ic.mmdb_dataArray[index] !== undefined) {
            for(var chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                   this.showDomainWithData(chnid, ic.mmdb_dataArray[index]);
                }
            }
        }
        else {
            $.ajax({
              url: url,
              dataType: 'json',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                ic.mmdb_dataArray[index] = data;
                for(var chnid in ic.protein_chainid) {
                    if(chnid.indexOf(pdbid) !== -1) {
                        thisClass.showDomainWithData(chnid, ic.mmdb_dataArray[index]);
                    }
                }
                // add here after the ajax call
                ic.showAnnoCls.enableHlSeq();
                ic.bAjax3ddomain = true;
                ic.bAjaxDoneArray[index] = true;
                if(ic.deferred3ddomain !== undefined) {
                    if(ic.icn3dui.cfg.align === undefined || ic.icn3dui.cfg.chainalign === undefined || ic.bRealign) {
                        ic.deferred3ddomain.resolve();
                    }
                    else {
                        var bAjaxDoneAll = true;
                        for(var i = 0, il = pdbArray.length; i < il; ++i) {
                            bAjaxDoneAll = bAjaxDoneAll && ic.bAjaxDoneArray[i];
                        }
                        if(bAjaxDoneAll) ic.deferred3ddomain.resolve();
                    }
                }
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                console.log( "No 3D domain data were found for the protein " + pdbid + "..." );
                for(var chnid in ic.protein_chainid) {
                    if(chnid.indexOf(pdbid) !== -1) {
                        $("#" + ic.pre + "dt_domain_" + chnid).html('');
                        $("#" + ic.pre + "ov_domain_" + chnid).html('');
                        $("#" + ic.pre + "tt_domain_" + chnid).html('');
                    }
                }
                ic.showAnnoCls.enableHlSeq();
                ic.bAjax3ddomain = true;
                bAjaxDone1 = true;
                if(ic.deferred3ddomain !== undefined) {
                    if(ic.icn3dui.cfg.align === undefined || ic.icn3dui.cfg.chainalign === undefined) {
                        ic.deferred3ddomain.resolve();
                    }
                    else {
                        var bAjaxDoneAll = true;
                        for(var i = 0, il = pdbArray.length; i < il; ++i) {
                            bAjaxDoneAll = bAjaxDoneAll && ic.bAjaxDoneArray[i];
                        }
                        if(bAjaxDoneAll) ic.deferred3ddomain.resolve();
                    }
                }
                return;
              }
            });
        }
    }

    //Show the annotations of 3D domains.
    showDomainAll() { var ic = this.icn3d, me = ic.icn3dui;
        //var chnid = Object.keys(ic.protein_chainid)[0];
        //var pdbid = chnid.substr(0, chnid.indexOf('_'));
        var pdbArray = Object.keys(ic.structures);
        // show 3D domains
        ic.mmdb_dataArray = [];
        ic.bAjaxDoneArray = [];
        for(var i = 0, il = pdbArray.length; i < il; ++i) {
            ic.bAjaxDoneArray[i] = false;
        }
        for(var i = 0, il = pdbArray.length; i < il; ++i) {
            this.showDomainPerStructure(i);
        }
    }
    showDomainWithData(chnid, data) { var ic = this.icn3d, me = ic.icn3dui;
            var html = '<div id="' + ic.pre + chnid + '_domainseq_sequence" class="icn3d-dl_sequence">';
            var html2 = html;
            var html3 = html;
            var domainArray, proteinname;
            var pos = chnid.indexOf('_');
            var chain = chnid.substr(pos + 1);
            var molinfo = data.moleculeInfor;
            var currMolid;
            for(var molid in molinfo) {
            if(molinfo[molid].chain === chain) {
              currMolid = molid;
              proteinname = molinfo[molid].name;
              break;
            }
            }
            if(currMolid !== undefined && data.domains[currMolid] !== undefined) {
              domainArray = data.domains[currMolid].domains;
            }
            if(domainArray === undefined) {
              domainArray = [];
            }
            for(var index = 0, indexl = domainArray.length; index < indexl; ++index) {
                //var fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname + '(PDB ID: ' + data.pdbId + ')';
                var fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname;
                var title =(fulltitle.length > 17) ? fulltitle.substr(0,17) + '...' : fulltitle;
                var subdomainArray = domainArray[index].intervals;
                // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
                var domainFromHash = {}, domainToHash = {}
                var fromArray = [], toArray = [];
                var resiHash = {}
                var resCnt = 0
                for(var i = 0, il = subdomainArray.length; i < il; ++i) {
                    var domainFrom = Math.round(subdomainArray[i][0]) - 1; // 1-based
                    var domainTo = Math.round(subdomainArray[i][1]) - 1;
                    if(domainFromHash.hasOwnProperty(domainFrom) || domainToHash.hasOwnProperty(domainTo)) {
                        continue; // do nothing for duplicated "from" or "to", e.g, PDBID 1ITW, 5FWI
                    }
                    else {
                        domainFromHash[domainFrom] = 1;
                        domainToHash[domainTo] = 1;
                    }
                    fromArray.push(domainFrom + ic.baseResi[chnid]);
                    toArray.push(domainTo + ic.baseResi[chnid]);
                    resCnt += domainTo - domainFrom + 1;
                    for(var j = domainFrom; j <= domainTo; ++j) {
                        resiHash[j+1] = 1;
                    }
                }
                var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
                var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
                html3 += htmlTmp2 + htmlTmp3 + '<br>';
                var htmlTmp = '<span class="icn3d-seqLine">';
                html += htmlTmp2 + htmlTmp3 + htmlTmp;
                html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
                var pre = 'domain3d' + index.toString();
                for(var i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
                  html += ic.showSeqCls.insertGap(chnid, i, '-');
                  //if(i >= domainFrom && i <= domainTo) {
                  if(resiHash.hasOwnProperty(i+1)) {
                    var cFull = ic.giSeq[chnid][i];
                      var c = cFull;
                      if(cFull.length > 1) {
                          c = cFull[0] + '..';
                      }
    //                var pos =(ic.baseResi[chnid] + i+1).toString();
    //                var pos = ic.chainsSeq[chnid][i - ic.matchedPos[chnid] ].resi;
                      var pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
                    html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                  }
                  else {
                    html += '<span>-</span>'; //'<span>-</span>';
                  }
                }
                var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
                var colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                var color =(atom.color !== undefined) ? colorStr : "CCCCCC";
                if(ic.icn3dui.cfg.blast_rep_id != chnid) { // regular
                    for(var i = 0, il = fromArray.length; i < il; ++i) {
                        var emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i] - ic.baseResi[chnid] - 1) / ic.maxAnnoLength) : Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);
                        html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                        html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" id="' + chnid + '_3d_domain_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">3D domain ' +(index+1).toString() + '</div>';
                    }
                }
                else { // with potential gaps
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
                    for(var i = 0, il = fromArray2.length; i < il; ++i) {
                        html2 += ic.showSeqCls.insertGapOverview(chnid, fromArray2[i]);
                        var emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray2[i] - ic.baseResi[chnid] - 1) /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
                        html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                        html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" id="' + chnid + '_3d_domain_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">3D domain ' +(index+1).toString() + '</div>';
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
            $("#" + ic.pre + "dt_domain_" + chnid).html(html);
            $("#" + ic.pre + "ov_domain_" + chnid).html(html2);
            $("#" + ic.pre + "tt_domain_" + chnid).html(html3);
    }

}

export {AnnoDomain}
