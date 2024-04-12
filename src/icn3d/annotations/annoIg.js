/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AnnoIg {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the annotations of CDD domains and binding sites.
    async showIg(chnid, template) { let ic = this.icn3d, me = ic.icn3dui;
        // if(!ic.bRunRefnum || Object.keys(ic.atoms).length > Object.keys(ic.hAtoms).length) {
        if(ic.bRunRefnumAgain) {
            await ic.refnumCls.showIgRefNum(template);
            // ic.bRunRefnum = true;    
        }

        let type = 'ig';
        let html = '', html2 = '', html3 = ''; 

        if(ic.bShowRefnum && ic.chainid2refpdbname.hasOwnProperty(chnid) && ic.chainid2refpdbname[chnid].length > 0) {  
            let giSeq = ic.showSeqCls.getSeq(chnid);                                     
            let result = ic.annoIgCls.showAllRefNum(giSeq, chnid);

            html += result.html;
            html2 += result.html2;
            html3 += result.html3;
        }

        $("#" + ic.pre + "dt_" + type + "_" + chnid).html(html);
        $("#" + ic.pre + "ov_" + type + "_" + chnid).html(html2);
        $("#" + ic.pre + "tt_" + type + "_" + chnid).html(html3);
    }

    showAllRefNum(giSeq, chnid) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html2 = '', html3 = '';

        //check if Kabat refnum available
        let bKabatFound = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = ic.resid2domainid[residueid];
            
            if(ic.domainid2ig2kabat[domainid] && Object.keys(ic.domainid2ig2kabat[domainid]).length > 0) {
                bKabatFound = true;
                break;
            }
        }

        //check if IMGT refnum available
        let bImgtFound = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = ic.resid2domainid[residueid];

            if(ic.domainid2ig2imgt[domainid] && Object.keys(ic.domainid2ig2imgt[domainid]).length > 0) {
                bImgtFound = true;
                break;
            }
        }

        let result = this.showRefNum(giSeq, chnid);
        html += result.html;
        html2 += result.html2;
        html3 += result.html3;

        let kabat_or_imgt = 1;
        if(bKabatFound) {
            result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
            html += result.html;
            html2 += result.html2;
            html3 += result.html3;
        }

        kabat_or_imgt = 2;
        if(bImgtFound) {
            result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
            html += result.html;
            html2 += result.html2;
            html3 += result.html3;
        }

        return {html: html, html2: html2, html3: html3};
    }

    showRefNum(giSeq, chnid, kabat_or_imgt, bCustom) {  let ic = this.icn3d, me = ic.icn3dui;
        let bResult = ic.chainid2igtrack[chnid];
        if(!bResult) return {html: '', html2: '', html3: ''};

        let html = this.getIgAnnoHtml(chnid, giSeq, bCustom, kabat_or_imgt);

        // add color to atoms
        if(ic.bShowRefnum) {
            ic.opts.color = 'ig strand';
            // ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);
            ic.setColorCls.setColorByOptions(ic.opts, ic.chains[chnid]);
        }

        return html;
    }

    setChain2igArray(chnid, giSeq, bCustom) { let ic = this.icn3d, me = ic.icn3dui;
        let refnumLabel;

        let domainid2respos = {};
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];

            refnumLabel = ic.resid2refnum[residueid];

            if(refnumLabel) {              
                if(!domainid2respos[domainid]) domainid2respos[domainid] = [];
                domainid2respos[domainid].push(i);
            }
        }

        for(let domainid in domainid2respos) {
            let posArray = domainid2respos[domainid];
            let pos, prevPos, startPosArray = [], endPosArray = [];
            for(let i = 0, il = posArray.length; i < il; ++i) {
                pos = posArray[i];
                if(i == 0) startPosArray.push(pos);

                if(i > 0 && pos != prevPos + 1) { // a new range
                    endPosArray.push(prevPos);
                    startPosArray.push(pos);
                }

                prevPos = pos;
            }
            endPosArray.push(pos);

            let igElem = {};
            igElem.domainid = domainid;
            igElem.startPosArray = startPosArray;
            igElem.endPosArray = endPosArray;
            ic.chain2igArray[chnid].push(igElem);
        }
    }

    getIgAnnoHtml(chnid, giSeq, bCustom, kabat_or_imgt) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html2 = '', html3 = '';
        let type = 'ig';

        if(!ic.chain2igArray) ic.chain2igArray = {};

        // let igElem = {};
        let bStart = false;
 
        let refnumLabelNoPostfix;
        let appearedStrands = {}, currStrand_ori, bShowRefnum = true;
        let prevStrand = undefined;
        let prevPos;

        let bLoop = false, currStrand = '', currFirstDigit = '';
        let refnumLabel, refnumStr_ori, refnumStr, refnum;

        ic.chain2igArray[chnid] = [];
        this.setChain2igArray(chnid, giSeq, bCustom);


        // remove Igs without BCEF strands one more time
        let igArray = ic.chain2igArray[chnid];    

        for(let i = 0, il = igArray.length; i < il; ++i) {
            let domainid = igArray[i].domainid;
            let info = ic.domainid2info[domainid];
            if(!info) continue;

            let bBStrand = false, bCStrand = false, bEStrand = false, bFStrand = false;

            let residHash = {};
            for(let j = 0, jl = igArray[i].startPosArray.length; j < jl; ++j) {
                let startPos = igArray[i].startPosArray[j];
                let endPos = igArray[i].endPosArray[j];
                for(let k = startPos; k <= endPos; ++k) {
                    const resid = chnid + '_' + ic.chainsSeq[chnid][k].resi;
                    residHash[resid] = 1;
                    let refnum = ic.resid2refnum[resid];

                    if(refnum) {
                        if(refnum.indexOf('B2550') != -1) bBStrand = true;
                        if(refnum.indexOf('C3550') != -1) bCStrand = true;
                        if(refnum.indexOf('E7550') != -1) bEStrand = true;
                        if(refnum.indexOf('F8550') != -1) bFStrand = true;
                    }
                }
            }

            if(!(bBStrand && bCStrand && bEStrand && bFStrand)) {
                // reset for these residues
                for(let resid in residHash) {
                    delete ic.resid2refnum[resid];
                    delete ic.residIgLoop[resid];
                    delete ic.resid2domainid[resid];
                }

                let residArray = Object.keys(residHash);

                // delete the following loops
                let lastPos = ic.setSeqAlignCls.getPosFromResi(chnid, residArray[residArray.length - 1].split('_')[2]);

                for(let j = lastPos + 1, jl = ic.chainsSeq[chnid].length; j < jl; ++j) {
                    let resi = ic.chainsSeq[chnid][j].resi;
                    let resid = chnid + '_' + resi;
                    if(ic.residIgLoop.hasOwnProperty(resid)) {
                        delete ic.resid2refnum[resid];
                        delete ic.residIgLoop[resid];
                        delete ic.resid2domainid[resid]; 
                    }
                    else {
                        break;
                    }
                }

                // delete the previous loops
                let firstPos = ic.setSeqAlignCls.getPosFromResi(chnid, residArray[0].split('_')[2]);

                for(let j = lastPos - 1; j >= 0; --j) {
                    let resi = ic.chainsSeq[chnid][j].resi;
                    let resid = chnid + '_' + resi;
                    if(ic.residIgLoop.hasOwnProperty(resid)) {
                        delete ic.resid2refnum[resid];
                        delete ic.residIgLoop[resid];
                        delete ic.resid2domainid[resid]; 
                    }
                    else {
                        break;
                    }
                }
            }
        }


        // reset ic.chain2igArray
        ic.chain2igArray[chnid] = [];
        this.setChain2igArray(chnid, giSeq, bCustom);

        // show tracks
        // let domainid2respos = {};
        let htmlIg = '';
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            htmlIg += ic.showSeqCls.insertGap(chnid, i, '-');

            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];

            //if(!ic.residues.hasOwnProperty(residueid)) {
            //    htmlIg += '<span></span>';
            //}
            //else {
                refnumLabel = ic.resid2refnum[residueid];
                let bHidelabel = false;

                if(refnumLabel) {              
                    // if(!domainid2respos[domainid]) domainid2respos[domainid] = [];
                    // domainid2respos[domainid].push(i);
            
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
                            htmlIg += '<span></span>';
                        }
                        else {
                            let refnum = parseInt(refnumStr);

                            if(refnum % 2 == 0) {
                                htmlIg += '<span title="' + refnumStr + '">' + refnumStr + '</span>';
                            }
                            else {
                                htmlIg += '<span title="' + refnumStr + '">&nbsp;</span>';
                            }
                        }
                    }
                    else if(kabat_or_imgt == 1 || kabat_or_imgt == 2) {
                        if(!refnumStr) {                               
                            htmlIg += '<span></span>';
                        }
                        else {
                            let refnum = parseInt(refnumStr).toString();
                            let color = this.getRefnumColor(currStrand, true);
                            let colorStr = 'style="color:' + color + '"'

                            let lastTwo = parseInt(refnum.substr(refnum.length - 2, 2));

                            if(lastTwo % 2 == 0) {
                                htmlIg += '<span ' + colorStr + ' title="' + refnumStr + '">' + refnumStr + '</span>';
                            }
                            else {
                                htmlIg += '<span ' + colorStr + ' title="' + refnumStr + '">&nbsp;</span>';
                            }
                        }
                    }
                    else {                       
                        if(bShowRefnum && currStrand != ' ') {
                            bLoop = ic.residIgLoop[residueid];
                            htmlIg += this.getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel);
                            // if(bLoop) ic.residIgLoop[residueid] = 1;
                        }
                        else {
                            htmlIg += '<span></span>';
                        }
                    }

                    prevStrand = currStrand_ori; //currStrand;
                    prevPos = i;
                }
                else {
                    htmlIg += '<span></span>';
                }
            //}
        }

        if(me.bNode) return {html: html, html2: html2, html3: html3}

        let maxTextLen = 19;
        let titleSpace = 120;

        let linkStr = 'icn3d-link icn3d-blue';
        let title = 'IgStRAnD Ref. No.';

        let igCnt = ic.chain2igArray[chnid].length;
        let fromArray = [], toArray = [];
        let posindex2domainindex = {};
        for(let i = 0; i < igCnt; ++i) {
            let igElem = ic.chain2igArray[chnid][i];
            fromArray = fromArray.concat(igElem.startPosArray);
            toArray = toArray.concat(igElem.endPosArray);

            for(let j = 0, jl = igElem.startPosArray.length; j < jl; ++j) {
                let pos = igElem.startPosArray[j];
                posindex2domainindex[pos] = i;
            }
        }

        // let htmlCnt = '<span class="icn3d-residueNum" title="Ig domain count">' + igCnt.toString() + ' Igs</span>';
        let htmlCnt = '<div style="display:inline-block" class="icn3d-residueNum" title="Ig domain count">' + igCnt.toString() + ' Ig(s)</div>';

        let htmlTmp = '<div id="' + ic.pre + chnid + '_' + type + 'seq_sequence" class="icn3d-ig icn3d-dl_sequence">';
        if(bCustom) htmlTmp = '<div class="icn3d-dl_sequence">';

        let htmlTitle = '<div style="width:' + titleSpace + 'px!important;" class="icn3d-seqTitle ' + linkStr + '" ig="0" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="0" setname="' + chnid + '_Igs" anno="sequence" chain="' + chnid + '" title="IgStRAnD Reference Numbers">' + title + ' </div>';

        htmlTmp += '<div class="icn3d-residueLine" style="white-space:nowrap;">';
        if(bCustom) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="Custom Reference Numbers">Custom Ref. No.</div>';
            htmlTmp += '<span class="icn3d-residueNum"></span>';
        }
        else if(kabat_or_imgt == 1) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="Kabat Reference Numbers">Kabat Ref. No.</div>';
            htmlTmp += '<span class="icn3d-residueNum"></span>';
        }
        else if(kabat_or_imgt == 2) {
            htmlTmp += '<div class="icn3d-annoTitle" anno="0" title="IMGT Reference Numbers">IMGT Ref. No.</div>';
            htmlTmp += '<span class="icn3d-residueNum"></span>';
        }
        else {
            htmlTmp += htmlTitle;
            htmlTmp += htmlCnt;
        }
        
        html3 += htmlTmp + '<br>';
        html += htmlTmp + '<span class="icn3d-seqLine">';

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');
 
        html += htmlIg;

        if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');
        
        html += htmlCnt;
        html += '</span>';
        html += '<br>';
        html += '</div>';
        html += '</div>';

        // use the updated ic.chain2igArray
        igArray = ic.chain2igArray[chnid];      

        if(igArray.length == 0) return {html: html, html2: html2, html3: html3}
        let rangeArray = [], titleArray = [], fullTitleArray = [], domainArray = [];

        for(let i = 0, il = igArray.length; i < il; ++i) {
            let domainid = igArray[i].domainid;
            let info = ic.domainid2info[domainid];
            if(!info) continue;

            let tmscore = info.score;

            let igType = (parseFloat(tmscore) < ic.refnumCls.TMThresholdIgType ) ? 'Ig' : ic.ref2igtype[info.refpdbname];
            titleArray.push(igType + ' (TM:' + parseFloat(tmscore).toFixed(2) + ')');
            fullTitleArray.push(igType + ' (TM:' + parseFloat(tmscore).toFixed(2) + '), template: ' + info.refpdbname + ', type: ' + ic.ref2igtype[info.refpdbname] + ', Seq. identity: ' + parseFloat(info.seqid).toFixed(2) + ', aligned residues: ' + info.nresAlign);

            domainArray.push(igType);

            let segs = [];
            for(let j = 0, jl = igArray[i].startPosArray.length; j < jl; ++j) {
                segs.push({"from":igArray[i].startPosArray[j], "to":igArray[i].endPosArray[j]});
            }
            let range = {};
            range.locs = [{"segs": segs}];
            rangeArray.push(range);
        }

        if(rangeArray.length == 0) return {html: html, html2: html2, html3: html3}

        // add tracks for the summary view
        if(!kabat_or_imgt && !bCustom) {
            // summary html2
            html2 += htmlTitle; 
            html2 += htmlCnt + '<span class="icn3d-seqLine">';

            if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);

            let prevDomainindex, color;
            for(let i = 0, il = fromArray.length; i < il; ++i) {
                let resi = ic.ParserUtilsCls.getResi(chnid, fromArray[i]);
                let resid = chnid + "_" + resi;

                let domainindex = posindex2domainindex[fromArray[i]];
                if(domainindex != prevDomainindex) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                    let colorStr =(!atom || atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                    color =(atom && atom.color !== undefined) ? colorStr : "CCCCCC";
                }

                let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i]) / ic.maxAnnoLength) : 
                    Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);
                html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle ' + linkStr + '" ig="0" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + domainArray[domainindex] + '" index="0" setname="' + chnid + '_igs" id="' + chnid + '_igs" anno="sequence" chain="' + chnid + '" title="' + domainArray[domainindex] + '">' +  domainArray[domainindex] + ' </div>';

                prevDomainindex = domainindex;
            }

            html2 += htmlCnt;

            html2 += '</div></div>';
            html3 += '</div></div>';

            // add tracks for each Ig domain
            htmlTmp = '<div id="' + ic.pre + chnid + '_igseq_sequence" class="icn3d-ig icn3d-dl_sequence">';
            let htmlTmp2 = htmlTmp;
            let htmlTmp3 = htmlTmp;

            let result = ic.annoCddSiteCls.setDomainFeature(rangeArray, chnid, 'ig', htmlTmp, htmlTmp2, htmlTmp3, undefined, titleArray, fullTitleArray);

            html += result.html + '</div>';
            html2 += result.html2 + '</div>';
            html3 += result.html3 + '</div>';
        }

        return {html: html, html2: html2, html3: html3}
    }

    getRefnumHtml(residueid, refnumStr, refnumStr_ori, refnumLabel, currStrand, bLoop, bHidelabel) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(refnumStr).toString();

        let refnum3c = (refnum - parseInt(refnum/1000) * 1000).toString();
        let firstTwo = parseInt(refnum.toString().substr(0, 2)); // check extended strands
        let bExtendedStrand = refnum3c.substr(0,1) != '5' && firstTwo != '18'; // all strands and A' (18##)

        let color = this.getRefnumColor(currStrand, true);
        let colorStr = (!bLoop) ? 'style="color:' + color + '; text-decoration: underline overline;"' : 'style="color:' + color + '"';

        let lastTwoStr = refnum.substr(refnum.length - 2, 2);
        let lastTwo = parseInt(lastTwoStr);
        let lastThree = parseInt(refnum.substr(refnum.length - 3, 3));

        let html = '';

        if(refnumLabel && lastTwo == 50 && !bExtendedStrand && !bLoop) {
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
        let strand = (currStrand) ? currStrand.substr(0,1) : '';
        
        if(currStrand == "C") { 
            return '#0000FF'; 
        }
        else if(currStrand == "C'") { 
            return '#6495ED'; 
        }
        else if(currStrand == "C''") { 
            return '#006400'; 
        }

        else if(strand == "A") { 
            return '#9400D3'; //'#663399'; 
        }
        else if(strand == "B") { 
            return '#ba55d3'; 
        }
        else if(strand == "D") { 
            return '#00FF00'; 
        }
        else if(strand == "E") {
            return "#FFD700"; 
        }
        else if(strand == "F") { 
            return '#FF8C00'; 
        }
        else if(strand == "G") { 
            return '#FF0000'; 
        }
        else {
            return me.htmlCls.GREYB;
        }
    }

    getProtodomainColor(currStrand) {  let ic = this.icn3d, me = ic.icn3dui;
        let strand = (currStrand) ? currStrand.substr(0,1) : '';

        if(strand == "A" || strand == "D") {
            return '#0000FF';
        }
        else if(strand == "B" || strand == "E") {
            return '#006400';
        }
        else if(currStrand == "C" || strand == "F") {
            return "#FFD700"; //"#FFFF00"; //'#F0E68C'; 
        }
        else if(currStrand == "C'" || strand == "G") {
            return '#FF8C00'; 
        }
        else if(currStrand == "C''") { //linker
            return '#FF0000'; 
        }
        else {
            return me.htmlCls.GREYB;
        }
    }    
}

export {AnnoIg}
