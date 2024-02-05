/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AnnoCddSite {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the annotations of CDD domains and binding sites.
    async showCddSiteAll() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.chainid2pssmid = {};

        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
        let chnidArray = Object.keys(ic.protein_chainid);
        // show conserved domains and binding sites
        // live search
        let url = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&frclive&live=lcl&queries=" + chnidBaseArray;     
        // precalculated
        //let url = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&live=lcl&queries=" + chnidBaseArray;
        // live search for AlphaFold structures
        //if(me.cfg.afid) {

        // use precalculated CDD annotation if
        if( (Object.keys(ic.structures).length == 1 && !me.cfg.afid && (me.cfg.mmtfid || me.cfg.pdbid || me.cfg.opmid || me.cfg.mmdbid || me.cfg.gi || me.cfg.uniprotid || me.cfg.blast_rep_id || me.cfg.cid || me.cfg.mmcifid))
            || (Object.keys(ic.structures).length == 2 && me.cfg.align) ) {
                let data = {};
                try {
                    if(me.bNode) {
                        data = await me.getAjaxPromise(url, 'jsonp');
                    }
                    else {
                        data.value = await me.getAjaxPromise(url, 'jsonp');
                    }
                 
                    thisClass.parseCddData([data], chnidArray);
                    /// if(ic.deferredAnnoCddSite !== undefined) ic.deferredAnnoCddSite.resolve();
                }
                catch(err) {
                    thisClass.getNoCdd(chnidBaseArray);
                    /// if(ic.deferredAnnoCddSite !== undefined) ic.deferredAnnoCddSite.resolve();

                    return;
                }
        }
        else {
            let ajaxArray = [];

            for(let i = 0, il = chnidArray.length; i < il; ++i) {
                //let seq = Array.isArray(ic.giSeq[chnidArray[i]]) ? ic.giSeq[chnidArray[i]].join('') : ic.giSeq[chnidArray[i]];
                let seq = Array.isArray(ic.giSeq[chnidArray[i]]) ? ic.giSeq[chnidArray[i]].join('').toUpperCase() : ic.giSeq[chnidArray[i]].toUpperCase();

                // remove water molecules
                seq = seq.replace(/O/g, '');

                //url = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&live=lcl&queries=" + ic.giSeq[chnidArray[0]].join('');
                // live searchE
                url = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&frclive&live=lcl&queries=" + seq;             
                // precalculated
                //url = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&live=lcl&queries=" + seq;

                let cdd = me.getAjaxPromise(url, 'jsonp');

                ajaxArray.push(cdd);
            }

            let allPromise = Promise.allSettled(ajaxArray);
            try {
                let dataArray = await allPromise;

                thisClass.parseCddData(dataArray, chnidArray, true);
                /// if(ic.deferredAnnoCddSite !== undefined) ic.deferredAnnoCddSite.resolve();
            }
            catch(err) {
                
            }            
        }
    }

    parseCddData(dataArray, chnidArray, bSeq) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let chainWithData = {};

        if(me.bNode) {
            if(!ic.resid2cdd) ic.resid2cdd = {};
            if(!ic.resid2site) ic.resid2site = {};
        }

        for(let i = 0, il = dataArray.length; i < il; ++i) {
            //let data = (bSeq) ? dataArray[i][0] : dataArray[i];
            // somehow Node.js returned data in dataArray[i]
            let data = (me.bNode) ? dataArray[i] : dataArray[i].value;

            if(!data) continue;

            for(let chainI = 0, chainLen = data.data.length; chainI < chainLen; ++chainI) {
                let cddData = data.data[chainI];
                let chnidBase = cddData._id;
                //var pos = chnidBaseArray.indexOf(chnidBase);
                //var chnid = chnidArray[pos];
                //let chnid = chnidArray[chainI];
                let chnid = (bSeq) ? chnidArray[i] : chnidArray[chainI];
                chainWithData[chnid] = 1;
                let html = '<div id="' + ic.pre + chnid + '_cddseq_sequence" class="icn3d-cdd icn3d-dl_sequence">';
                let html2 = html;
                let html3 = html;
                let domainArray = cddData.doms;
                if(me.bNode && !ic.resid2cdd[chnid]) ic.resid2cdd[chnid] = [];
                let result = thisClass.setDomainFeature(domainArray, chnid, 'domain', html, html2, html3);

                ic.chainid2pssmid[chnid] = {pssmid2name: result.pssmid2name, pssmid2fromArray: result.pssmid2fromArray, pssmid2toArray: result.pssmid2toArray};

                let acc2domain = result.acc2domain;
                html = result.html + '</div>';
                html2 = result.html2 + '</div>';
                html3 = result.html3 + '</div>';
                $("#" + ic.pre + "dt_cdd_" + chnid).html(html);
                $("#" + ic.pre + "ov_cdd_" + chnid).html(html2);
                $("#" + ic.pre + "tt_cdd_" + chnid).html(html3);

                html = '<div id="' + ic.pre + chnid + '_siteseq_sequence" class="icn3d-dl_sequence">';
                html2 = html;
                html3 = html;

                // features
                let featuteArray = cddData.motifs;
                if(me.bNode && !ic.resid2site[chnid]) ic.resid2site[chnid] = [];
                result = thisClass.setDomainFeature(featuteArray, chnid, 'feat', html, html2, html3, acc2domain);

                html = result.html; // + '</div>';
                html2 = result.html2; // + '</div>';
                html3 = result.html3; // + '</div>';

                let siteArray = data.data[chainI].sites;
                let indexl =(siteArray !== undefined) ? siteArray.length : 0;
                for(let index = 0; index < indexl; ++index) {
                    let domain = siteArray[index].srcdom;
                    let type = siteArray[index].type;
                    let resCnt = siteArray[index].sz;
                    let title = 'site: ' + siteArray[index].title;
                    if(title.length > 17) title = title.substr(0, 17) + '...';
                    //var fulltitle = "site: " + siteArray[index].title + "(domain: " + domain + ")";
                    let fulltitle = siteArray[index].title;
                    let resPosArray, adjustedResPosArray = [];
                    for(let i = 0, il = siteArray[index].locs.length; i < il; ++i) {
                        resPosArray = siteArray[index].locs[i].coords;
                        for(let j = 0, jl = resPosArray.length; j < jl; ++j) {
                            // if(ic.bNCBI) {
                            //     adjustedResPosArray.push(Math.round(resPosArray[j]));
                            // }
                            // else {
                            //     adjustedResPosArray.push(thisClass.getAdjustedResi(Math.round(resPosArray[j]), chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi) - 1);
                            // }
                            adjustedResPosArray.push(ic.ParserUtilsCls.getResi(chnid, Math.round(resPosArray[j])) );
                        }
                    }

                    let bCoordinates = false;
                    for(let i = 0, il = adjustedResPosArray.length; i < il; ++i) {
                        let resid = chnid + "_" + adjustedResPosArray[i];
                        if(ic.residues.hasOwnProperty(resid)) {
                            bCoordinates = true;
                            break;
                        }
                    }
    
                    let linkStr = (bCoordinates) ? 'icn3d-link icn3d-blue' : '';

                    let htmlTmp2 = '<div class="icn3d-seqTitle ' + linkStr + '" site="site" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_site_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
                    let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
                    let htmlTmp = '<span class="icn3d-seqLine">';
                    html3 += htmlTmp2 + htmlTmp3 + '<br>';
                    html += htmlTmp2 + htmlTmp3 + htmlTmp;
                    html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
                    let pre = 'site' + index.toString();
                    //var widthPerRes = ic.seqAnnWidth / ic.maxAnnoLength;
                    let prevEmptyWidth = 0;
                    let prevLineWidth = 0;
                    let widthPerRes = 1;

                    if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);
                    if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');

                    for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
                        html += ic.showSeqCls.insertGap(chnid, i, '-');
                        if(resPosArray.indexOf(i) != -1) {
                            let cFull = ic.giSeq[chnid][i];
                            let c = cFull;
                            if(cFull.length > 1) {
                                c = cFull[0] + '..';
                            }
                            //let pos = thisClass.getAdjustedResi(i, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi);
                            let pos = ic.ParserUtilsCls.getResi(chnid, i);
                            
                            html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                            if(me.bNode) {
                                let obj = {};
                                obj[chnid + '_' + pos] = 'site: ' + siteArray[index].title;
                                ic.resid2site[chnid].push(obj);
                            }

                            html2 += ic.showSeqCls.insertGapOverview(chnid, i);
                            let emptyWidth =(me.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth * i / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
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

                    if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');

                    htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
                    htmlTmp += '</span>';
                    htmlTmp += '<br>';
                    html += htmlTmp;
                    html2 += htmlTmp;
                }
                html += '</div>';
                html2 += '</div>';
                html3 += '</div>';
                $("#" + ic.pre + "dt_site_" + chnid).html(html);
                $("#" + ic.pre + "ov_site_" + chnid).html(html2);
                $("#" + ic.pre + "tt_site_" + chnid).html(html3);
            }
        } // outer for loop

        // missing CDD data
        for(let chnid in ic.protein_chainid) {
            if(!chainWithData.hasOwnProperty(chnid)) {
                $("#" + ic.pre + "dt_cdd_" + chnid).html('');
                $("#" + ic.pre + "ov_cdd_" + chnid).html('');
                $("#" + ic.pre + "tt_cdd_" + chnid).html('');
                $("#" + ic.pre + "dt_site_" + chnid).html('');
                $("#" + ic.pre + "ov_site_" + chnid).html('');
                $("#" + ic.pre + "tt_site_" + chnid).html('');
            }
        }
        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxCddSite = true;
    }

    getNoCdd(chnidBaseArray) { let ic = this.icn3d, me = ic.icn3dui;
        console.log( "No CDD data were found for the protein " + chnidBaseArray + "..." );
        for(let chnid in ic.protein_chainid) {
            $("#" + ic.pre + "dt_cdd_" + chnid).html('');
            $("#" + ic.pre + "ov_cdd_" + chnid).html('');
            $("#" + ic.pre + "tt_cdd_" + chnid).html('');
            $("#" + ic.pre + "dt_site_" + chnid).html('');
            $("#" + ic.pre + "ov_site_" + chnid).html('');
            $("#" + ic.pre + "tt_site_" + chnid).html('');
        }
        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxCddSite = true;
    }

    setDomainFeature(domainArray, chnid, type, html, html2, html3, acc2domain, titleArray, fullTitleArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let bNonDomainFeat = (type != 'domain' && type != 'feat') ? true : false;

        let pssmid2name, pssmid2fromArray, pssmid2toArray;
        if(type == 'domain') {
            acc2domain = {};
            pssmid2name = {};
            pssmid2fromArray = {};
            pssmid2toArray = {};
        }

        let indexl =(domainArray !== undefined) ? domainArray.length : 0;
        let maxTextLen =(type == 'domain') ? 14 : 19;
        let titleSpace =(type == 'domain') ? 100 : 120;
        for(let index = 0; index < indexl; ++index) {
            let pssmid = (type == 'domain') ? domainArray[index].pssmid : 0;

            let acc =(type == 'domain') ? domainArray[index].acc : (type == 'feat' ? domainArray[index].srcdom : '');
            // let type = domainArray[index].type;
            // type = (type == 'domain') ? 'domain' : 'feat';
            let domain =(type == 'domain') ? domainArray[index].title.split(':')[0] : (type == 'feat' ? domainArray[index].title : titleArray[index]);
            // convert double quote
            domain = domain.replace(/\"/g, "``");
            // convert single quote
            domain = domain.replace(/'/g, "`");

            if(type == 'domain') acc2domain[acc] = domain;

            let defline =(type == 'domain') ? domainArray[index].defline : '';
            let title = (bNonDomainFeat) ? titleArray[index] : type + ': ' + domain;

            if(title.length > maxTextLen) title = title.substr(0, maxTextLen) + '...';
            let fulltitle = (bNonDomainFeat) ? fullTitleArray[index] : type + ": " + domain;

            if(type == 'domain') pssmid2name[pssmid] = domain;

            // each domain may have several repeat. Treat each repeat as a domain
            let domainRepeatArray = domainArray[index].locs;

            if(!domainRepeatArray) continue;

            for(let r = 0, rl = domainRepeatArray.length; r < rl; ++r) {
                // each domain repeat or domain may have several segments, i.e., a domain may not be continuous
                let fromArray = [], toArray = [];
                let resiHash = {}
                let resCnt = 0;
                let segArray =(type == 'domain') ? domainRepeatArray[r].segs : [domainRepeatArray[r]];
                for(let s = 0, sl = segArray.length; s < sl; ++s) {
                    let domainFrom = Math.round(segArray[s].from);
                    let domainTo = Math.round(segArray[s].to);

                    // if(ic.bNCBI) {
                    //     fromArray.push(domainFrom);
                    //     toArray.push(domainTo);
                    // }
                    // else {
                    //     fromArray.push(thisClass.getAdjustedResi(domainFrom, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi) - 1);
                    //     toArray.push(thisClass.getAdjustedResi(domainTo, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi) - 1);
                    // }

                    // fromArray.push(ic.ParserUtilsCls.getResi(chnid, domainFrom));
                    // toArray.push(ic.ParserUtilsCls.getResi(chnid, domainTo));

                    fromArray.push(domainFrom);
                    toArray.push(domainTo);

                    for(let i = domainFrom; i <= domainTo; ++i) {
                        resiHash[i] = 1;
                    }
                    resCnt += domainTo - domainFrom + 1;
                }

                //var setname = chnid + "_" + domain + "_" + index + "_" + r; //chnid + "_" + type + "_" + index + "_" + r;
                let setname = chnid + "_" + domain;
                if(type != 'domain') setname += "_" + index + "_" + r; // + acc2domain[acc];

                if(type == 'domain') pssmid2fromArray[pssmid] = fromArray;
                if(type == 'domain') pssmid2toArray[pssmid] = toArray;

                let bCoordinates = false;
                for(let i = 0, il = fromArray.length; i < il; ++i) {
                    let from = parseInt(fromArray[i]), to = parseInt(toArray[i]);
                                       
                    for(let j = from; j <= to; ++j) {
                        let resi = ic.ParserUtilsCls.getResi(chnid, j);
                        //let resid = chnid + "_" + j;
                        let resid = chnid + "_" + resi;
                        
                        if(ic.residues.hasOwnProperty(resid)) {
                            bCoordinates = true;
                            break;
                        }
                    }

                    if(bCoordinates) {
                        break;
                    }
                }

                let linkStr = (bCoordinates) ? 'icn3d-link icn3d-blue' : '';

                let htmlTmp2 = '<div class="icn3d-seqTitle ' + linkStr + '" ' + type + '="' + acc + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" setname="' + setname + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
                let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
                html3 += htmlTmp2 + htmlTmp3 + '<br>';
                let htmlTmp = '<span class="icn3d-seqLine">';
                html += htmlTmp2 + htmlTmp3 + htmlTmp;
                if(type == 'domain') {
                    html2 += '<div style="width:20px; display:inline-block;"><span id="' + ic.pre + chnid + '_' + acc + '_' + r + '_cddseq_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + ic.pre + chnid + '_' + acc + '_' + r + '_cddseq_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div>';
                }
                html2 += '<div style="width:' + titleSpace + 'px!important;" class="icn3d-seqTitle ' + linkStr + '" ' + type + '="' + acc + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + setname + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
                html2 += htmlTmp3 + htmlTmp;
                let pre = type + index.toString();

                if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');

                for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
                  html += ic.showSeqCls.insertGap(chnid, i, '-');

                  if(resiHash.hasOwnProperty(i)) {
                      let cFull = ic.giSeq[chnid][i];
                      let c = cFull;
                      if(cFull.length > 1) {
                          c = cFull[0] + '..';
                      }
                      // let pos = thisClass.getAdjustedResi(i, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi);
                      let pos = ic.ParserUtilsCls.getResi(chnid, i);
                      html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                      if(me.bNode) {
                        let obj = {};
                        obj[chnid + '_' + pos] = fulltitle;
                        if(type == 'domain') {
                            ic.resid2cdd[chnid].push(obj);
                        }
                        else {
                            ic.resid2site[chnid].push(obj);
                        }
                      }
                  }
                  else {
                      html += '<span>-</span>'; //'<span>-</span>';
                  }
                }

                if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');

                let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
                let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                let color =(atom.color !== undefined) ? colorStr : "CCCCCC";

                if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);

                if(me.cfg.blast_rep_id != chnid) { // regular
                    for(let i = 0, il = fromArray.length; i < il; ++i) {
                        let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i] - ic.baseResi[chnid] - 1) / ic.maxAnnoLength) : Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);

                        html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                        html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle ' + linkStr + '" ' + type + '="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + setname + '" id="' + chnid + '_domain_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + domain + ' </div>';
                    }
                }
                else { // with potential gaps
                    let fromArray2 = [], toArray2 = [];
                    for(let i = 0, il = fromArray.length; i < il; ++i) {
                        fromArray2.push(fromArray[i]);
                        for(let j = parseInt(fromArray[i]); j <= parseInt(toArray[i]); ++j) {
                            if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(j)) {
                                toArray2.push(j - 1);
                                fromArray2.push(j);
                            }
                        }
                        toArray2.push(toArray[i]);
                    }
                    for(let i = 0, il = fromArray2.length; i < il; ++i) {
                        html2 += ic.showSeqCls.insertGapOverview(chnid, fromArray2[i]);
                        let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray2[i] - ic.baseResi[chnid] - 1) /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
                        html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                        html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle ' + linkStr + '" ' + type + '="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + title + '" index="' + index + '" setname="' + setname + '" id="' + chnid + '_domain_' + index + '_' + r + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + domain + ' </div>';
                    }
                }
                htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
                htmlTmp += '</span>';
                htmlTmp += '<br>';
                html += htmlTmp;
                html2 += htmlTmp;
                if(type == 'domain') {
                    html2 += '<div id="' + ic.pre + chnid + '_' + acc + '_' + r + '_cddseq" style="display:none; white-space:normal;" class="icn3d-box">' + defline + '(<a href="' + me.htmlCls.baseUrl + 'cdd/cddsrv.cgi?uid=' + acc + '" target="_blank" class="icn3d-blue">open details view...</a>)</div>';
                }
            } // for(let r = 0,
        }

        return {html: html, html2: html2, html3: html3, acc2domain: acc2domain,
          pssmid2name: pssmid2name, pssmid2fromArray: pssmid2fromArray, pssmid2toArray: pssmid2toArray}
    }

    // getAdjustedResi(resi, chnid, matchedPos, chainsSeq, baseResi) { let ic = this.icn3d, me = ic.icn3dui;
    //     return (resi >= matchedPos[chnid] && resi - matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][resi - matchedPos[chnid]].resi : baseResi[chnid] + 1 + resi;
    // }

    showAnnoType(chnid, chnidBase, type, title, residueArray, resid2resids) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '<div id="' + ic.pre + chnid + '_' + type + 'seq_sequence" class="icn3d-dl_sequence">';
        let html2 = html;
        let html3 = html;
        if(residueArray.length == 0) {
            $("#" + ic.pre + "dt_" + type + "_" + chnid).html('');
            $("#" + ic.pre + "ov_" + type + "_" + chnid).html('');
            $("#" + ic.pre + "tt_" + type + "_" + chnid).html('');
            return;
        }
        let fulltitle = title;
        if(title.length > 17) title = title.substr(0, 17) + '...';
        let resPosArray = [];
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            let resid = residueArray[i];
            //let resi = Math.round(resid.substr(residueArray[i].lastIndexOf('_') + 1) );
            let resi = resid.substr(residueArray[i].lastIndexOf('_') + 1);
            resPosArray.push( resi );
        }
        let resCnt = resPosArray.length;
        let chainnameNospace = type;
        let htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" ' + type + '="" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_' + chainnameNospace + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
        let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
        html3 += htmlTmp2 + htmlTmp3 + '<br>';
        let htmlTmp = '<span class="icn3d-seqLine">';
        html += htmlTmp2 + htmlTmp3 + htmlTmp;
        html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
        let pre = type;
        let prevEmptyWidth = 0;
        let prevLineWidth = 0;
        let widthPerRes = 1;

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);
        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');

        for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
          html += ic.showSeqCls.insertGap(chnid, i, '-');
          let resi = ic.ParserUtilsCls.getResi(chnid, i);
          //if(resPosArray.indexOf(i+1 + ic.baseResi[chnid]) != -1) {
          if(resPosArray.indexOf(resi) != -1) {
              let cFull = ic.giSeq[chnid][i];
              let c = cFull;
              if(cFull.length > 1) {
                  c = cFull[0] + '..';
              }
            //   let pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
            //   let resid = chnid + '_' +(i+1 + ic.baseResi[chnid]).toString();
            //   let title = cFull +(i+1 + ic.baseResi[chnid]).toString();
              let pos = resi;
              let resid = chnid + '_' + resi;
              let title = cFull + resi;
              
              if(type == 'ssbond') {
                  title = 'Residue ' + resid + ' has disulfide bond with';
                  let sstitle = '';
                  if(resid2resids[resid] !== undefined) {
                      for(let j = 0, jl = resid2resids[resid].length; j < jl; ++j) {
                        sstitle += ' residue ' + resid2resids[resid][j];
                      }
                  }
                  title += sstitle;

                  if(me.bNode) {
                    let obj = {};
                    obj[resid] = 'disulfide bond with' + sstitle;
                    ic.resid2ssbond[chnid].push(obj);
                  }
              }
              else if(type == 'crosslink') {
                  title = 'Residue ' + resid + ' has cross-linkage with';
                  let cltitle = '';
                  if(resid2resids[resid] !== undefined) {
                      for(let j = 0, jl = resid2resids[resid].length; j < jl; ++j) {
                        cltitle += ' residue ' + resid2resids[resid][j];
                      }
                  }
                  title += cltitle;

                  if(me.bNode) {
                    let obj = {};
                    obj[resid] = 'cross-linkage with' + cltitle;
                    ic.resid2crosslink[chnid].push(obj);
                  }
              }
              else {
                title = 'Residue ' + resid + ' has connection with';
                let cltitle = '';
                if(resid2resids && resid2resids[resid] !== undefined) {
                    for(let j = 0, jl = resid2resids[resid].length; j < jl; ++j) {
                      cltitle += ' residue ' + resid2resids[resid][j];
                    }
                }
                title += cltitle;
              }

              html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + title + '" class="icn3d-residue">' + c + '</span>';
              html2 += ic.showSeqCls.insertGapOverview(chnid, i);
              let emptyWidth =(me.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth * i / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
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

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');

        htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
        htmlTmp += '</span>';
        htmlTmp += '<br>';
        html += htmlTmp;
        html2 += htmlTmp;
        html += '</div>';
        html2 += '</div>';
        html3 += '</div>';
        $("#" + ic.pre + "dt_" + type + "_" + chnid).html(html);
        $("#" + ic.pre + "ov_" + type + "_" + chnid).html(html2);
        $("#" + ic.pre + "tt_" + type + "_" + chnid).html(html3);
    }

    // jquery tooltip
    //https://stackoverflow.com/questions/18231315/jquery-ui-tooltip-html-with-links
    setToolTip() {  let ic = this.icn3d, me = ic.icn3dui;
      $("[id^=" + ic.pre + "snp]").add("[id^=" + ic.pre + "clinvar]").add("[id^=" + ic.pre + "ssbond]").add("[id^=" + ic.pre + "crosslink]").tooltip({
        content: function() {
            return $(this).prop('title');
        },
        show: null,
        close: function(event, ui) {
            ui.tooltip.hover(
            function() {
                $(this).stop(true).fadeTo(400, 1);
            },
            function() {
                $(this).fadeOut("400", function() {
                    $(this).remove();
                })
            });
        }
      });
    }

}

export {AnnoCddSite}
