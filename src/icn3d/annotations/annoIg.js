/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AnnoIg {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the annotations of CDD domains and binding sites.
    async showIg(chnid, template) { let ic = this.icn3d, me = ic.icn3dui;
        if(!ic.bRunRefnum || Object.keys(ic.atoms).length > Object.keys(ic.hAtoms).length) {
            await ic.refnumCls.showIgRefNum(template);
            ic.bRunRefnum = true;
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

        let result = this.showRefNum(giSeq, chnid);
        html += result.html;
        html2 += result.html2;
        html3 += result.html3;

        let kabat_or_imgt = 1;
        result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
        html += result.html;
        html2 += result.html2;
        html3 += result.html3;

        kabat_or_imgt = 2;
        result = this.showRefNum(giSeq, chnid, kabat_or_imgt);
        html += result.html;
        html2 += result.html2;
        html3 += result.html3;

        return {'html': html, 'html2': html2, 'html3': html3};
    }

    showRefNum(giSeq, chnid, kabat_or_imgt, bCustom) {  let ic = this.icn3d, me = ic.icn3dui;
        let html = '', html2 = '', html3 = '';
        let type = 'ig';

        if(!ic.chainid2refpdbname[chnid]) return {html: html, html2: html2, html3: html3};

        //check if Kabat refnum available
        let bKabatFound = false;

        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];
            
            if(ic.domainid2ig2kabat[domainid] && Object.keys(ic.domainid2ig2kabat[domainid]).length > 0) {
                bKabatFound = true;
                break;
            }
        }

        if(kabat_or_imgt == 1 && !bKabatFound) {
            return {html: '', html2: '', html3: ''};
        }

        //check if IMGT refnum available
        let bImgtFound = false;
        for(let i = 0, il = giSeq.length; i < il; ++i) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid = (bCustom) ? 0 : ic.resid2domainid[residueid];

            if(ic.domainid2ig2imgt[domainid] && Object.keys(ic.domainid2ig2imgt[domainid]).length > 0) {
                bImgtFound = true;
                break;
            }
        }
        if(kabat_or_imgt == 2 && !bImgtFound) {
            return {html: '', html2: '', html3: ''};
        }

        // auto-generate ref numbers for loops 
        let bLoop = false, currStrand = '', prevStrand = '', currFirstDigit = '', currCnt =  1;
        let refnumLabel, refnumStr_ori, refnumStr, postfix, strandPostfix, refnum, refnum3c, refnum2c;
        let bExtendedStrand = false, bSecThird9 = false;

        // set hash for the loops
        let strand2len_start_stop = {};
        let prevRefnumStr, prevPostfix, prevRefnum;

        // sometimes one chain may have several Ig domains,set an index for each IgDomain
        let index = 1, prevStrandPostfix = '', bStart = false;

        if(!bCustom && !kabat_or_imgt && !me.bNode) { // do not overwrite loops in node  
            // reset ic.residIgLoop for the current selection, which could be the second round of ref num assignment
            // just current chain
            let atomHash = me.hashUtilsCls.intHash(ic.chains[chnid], ic.hAtoms);
            let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomHash);
            
            // for(let resid in residHash) {
            //     // not in loop any more if you assign ref numbers multiple times
            //     delete ic.residIgLoop[resid];
            // }
        }

        // 1. get the range of each strand excluding loops
        let strandArray = [], strandHash = {}, strandCnt = 0, resCnt = 0, resCntBfAnchor = 0, resCntAtAnchor = 0;
        let bFoundAnchor = false;
        if(!bCustom && !kabat_or_imgt) {
            for(let i = 0, il = giSeq.length; i < il; ++i, ++resCnt, ++resCntBfAnchor, ++resCntAtAnchor) {
                let currResi = ic.ParserUtilsCls.getResi(chnid, i);
                let residueid = chnid + '_' + currResi;

                refnumLabel = ic.resid2refnum[residueid];

                let firstChar = (refnumLabel) ? refnumLabel.substr(0,1) : '';
                if(!bStart && refnumLabel && (firstChar == 'A' || firstChar == 'B')) { // start of a new IG domain
                    bStart = true;
                    resCnt = 1; // the first one is included
                    bFoundAnchor = false;
                }

                if(prevStrand.substr(0,1) == 'G' && !refnumLabel) { // indicate the end of an IG domain
                    bStart = false;
                }

                if(refnumLabel) {                        
                    refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                    currFirstDigit = refnumStr_ori.substr(0, 1);

                    refnumStr = refnumStr_ori;
                    refnum = parseInt(refnumStr);
                    refnum3c = (refnum - parseInt(refnum/1000) * 1000).toString();
                    refnum2c = (refnum - parseInt(refnum/100) * 100).toString();

                    // for extended strands, since A is 1550 and A+ is 1650, then the AA+ loop will be 1591, 1592, ... 1610, 1611, etc
                    bSecThird9 = refnum3c.substr(0,1) == '9' || refnum2c.substr(0,1) == '9' || refnum2c.substr(0,1) == '0' || refnum2c.substr(0,1) == '1';
                    if(bSecThird9) ic.residIgLoop[residueid] = 1;

                    strandPostfix = refnumStr.replace(refnum.toString(), '');

                    postfix = strandPostfix + '_' + index;

                    let firstTwo = parseInt(refnum.toString().substr(0, 2)); // check extended strands
                    bExtendedStrand = refnum3c.substr(0,1) != '5' && firstTwo != '18'; // all strands and A' (18##)

                    if(currStrand && currStrand != ' ') {
                        if(!bSecThird9 || (bExtendedStrand && !bSecThird9)) {
                            let lastTwo = parseInt(refnum.toString().substr(refnum.toString().length - 2, 2));
                            
                            if(currStrand != prevStrand) { // reset currCnt
                                bFoundAnchor = false;

                                if(strandHash[currStrand + postfix]) {
                                    ++index;
                                    postfix = refnumStr.replace(refnum.toString(), '') + '_' + index;
                                }

                                strandHash[currStrand + postfix] = 1;

                                strandArray[strandCnt] = {};    
                                strandArray[strandCnt].startResi = currResi;
                                strandArray[strandCnt].startRefnum = refnum; // 1250 in A1250a

                                resCntBfAnchor = 0;
                                
                                strandArray[strandCnt].endResi = currResi;
                                strandArray[strandCnt].endRefnum = refnum; // 1250a

                                if(lastTwo == 50) {
                                    strandArray[strandCnt].anchorRefnum = refnum;
                                    strandArray[strandCnt].resCntBfAnchor = resCntBfAnchor;

                                    resCntAtAnchor = 0;

                                    bFoundAnchor = true;
                                }
                                
                                // in case A1550 is not found, but A1551 is found
                                if(!bFoundAnchor && (lastTwo == 51 || lastTwo == 52 || lastTwo == 53) ) {
                                    let offset = lastTwo - 50;
                                    strandArray[strandCnt].anchorRefnum = refnum - offset;
                                    strandArray[strandCnt].resCntBfAnchor = resCntBfAnchor - offset;

                                    resCntAtAnchor = offset;

                                    bFoundAnchor = true;
                                }

                                if(bExtendedStrand) {
                                    strandArray[strandCnt].anchorRefnum = 0;
                                }

                                strandArray[strandCnt].strandPostfix = strandPostfix; // a in A1250a
                                strandArray[strandCnt].strand = currStrand; // A in A1250a

                                strandArray[strandCnt].postfix = postfix; // Aa_1

                                strandArray[strandCnt].loopResCnt = resCnt - 1;

                                ++strandCnt;
                                resCnt = 0;
                            }
                            else {
                                if(strandHash[currStrand + postfix]) {
                                    if(lastTwo == 50) {
                                        strandArray[strandCnt - 1].anchorRefnum = refnum;
                                        strandArray[strandCnt - 1].resCntBfAnchor = resCntBfAnchor;

                                        // update
                                        strandArray[strandCnt - 1].startRefnum = strandArray[strandCnt - 1].anchorRefnum - strandArray[strandCnt - 1].resCntBfAnchor;

                                        resCntAtAnchor = 0;

                                        bFoundAnchor = true;
                                    }
                                    
                                    // in case A1550 is not found, but A1551 is found
                                    if(!bFoundAnchor && (lastTwo == 51 || lastTwo == 52 || lastTwo == 53) ) {
                                        let offset = lastTwo - 50;
                                        strandArray[strandCnt - 1].anchorRefnum = refnum - offset;
                                        strandArray[strandCnt - 1].resCntBfAnchor = resCntBfAnchor - offset;

                                        // update
                                        strandArray[strandCnt - 1].startRefnum = strandArray[strandCnt - 1].anchorRefnum - strandArray[strandCnt - 1].resCntBfAnchor;

                                        resCntAtAnchor = offset;

                                        bFoundAnchor = true;
                                    }

                                    if(bExtendedStrand) {
                                        strandArray[strandCnt - 1].anchorRefnum = 0;
                                    }

                                    strandArray[strandCnt - 1].endResi = currResi;
                                    strandArray[strandCnt - 1].endRefnum = refnum; // 1250a
                                    strandArray[strandCnt - 1].resCntAtAnchor = resCntAtAnchor;

                                    if(strandArray[strandCnt - 1].anchorRefnum) {
                                        strandArray[strandCnt - 1].endRefnum = strandArray[strandCnt - 1].anchorRefnum + strandArray[strandCnt - 1].resCntAtAnchor;
                                    }

                                    resCnt = 0;
                                }
                            }
                        }
                    }
                }

                prevRefnumStr = refnumStr;
                prevRefnum = refnum;
                prevPostfix = postfix;

                prevStrand = currStrand;
            }

            // 2. remove strands with less than 3 residues except G strand
            for(let il = strandArray.length, i = il - 1; i >= 0; --i) {
                if(strandArray[i].strand.substr(0, 1) != 'G' && strandArray[i].endRefnum - strandArray[i].startRefnum + 1 < 3) { // remove the strand
                    if(i != il - 1) { // modify 
                        strandArray[i + 1].loopResCnt += strandArray[i].loopResCnt + parseInt(strandArray[i].endResi) - parseInt(strandArray[i].startResi) + 1;
                    }

                    strandArray.splice(i, 1);
                }
            }

            // 2b. extend the strand to end of sheet
            let maxExtend = 8;
            for(let i = 0, il = strandArray.length; i < il; ++i) {
                let startAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[chnid + '_' + strandArray[i].startResi]);
                let endAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[chnid + '_' + strandArray[i].endResi]);

                let startPos = ic.setSeqAlignCls.getPosFromResi(chnid, strandArray[i].startResi);
                let endPos = ic.setSeqAlignCls.getPosFromResi(chnid, strandArray[i].endResi);

                if(startAtom.ss == 'sheet' && !startAtom.ssbegin) {
                    for(let j = 1; j <= maxExtend; ++j) {
                        let currPos = startPos - j;
                        let currResi = ic.ParserUtilsCls.getResi(chnid, currPos);
                        if(i > 0 && parseInt(currResi) <= parseInt(strandArray[i-1].endResi)) break;

                        let currResid = chnid + '_' + currResi;
                        let currAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[currResid]);
                        if(currAtom.ssbegin) { // find the start of the sheet
                            // update the following: startResi,startRefnum,endResi,endRefnum,loopResCnt,resCntBfAnchor,resCntAtAnchor
                            strandArray[i].startResi = currResi;
                            strandArray[i].startRefnum -= j;
                            strandArray[i].loopResCnt -= j;
                            if(strandArray[i].loopResCnt < 0) strandArray[i].loopResCnt = 0;
                            strandArray[i].resCntBfAnchor += j;

                            // update ic.resid2refnum
                            for(let k = 1; k <= j; ++k) {
                                currPos = startPos - k;
                                currResi = ic.ParserUtilsCls.getResi(chnid, currPos);
                                let currResid = chnid + '_' + currResi;
                                delete ic.residIgLoop[currResid];
                            }

                            break;
                        }
                    }
                }

                if(endAtom.ss == 'sheet' && !endAtom.ssend) {
                    for(let j = 1; j <= maxExtend; ++j) {
                        let currPos = endPos + j;
                        let currResi = ic.ParserUtilsCls.getResi(chnid, currPos);
                        if(i < il - 1 && parseInt(currResi) >= parseInt(strandArray[i+1].startResi)) break; 

                        let currResid = chnid + '_' + currResi;
                        let currAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[currResid]);
                        if(currAtom.ssend) { // find the end of the sheet
                            // update the following: startResi,startRefnum,endResi,endRefnum,loopResCnt,resCntBfAnchor,resCntAtAnchor
                            strandArray[i].endResi = currResi;
                            strandArray[i].endRefnum += j;
                            if(i < il - 1) {
                                strandArray[i + 1].loopResCnt -= j;
                                if(strandArray[i + 1].loopResCnt < 0) strandArray[i + 1].loopResCnt = 0;
                            }
                            strandArray[i].resCntAtAnchor += j;

                            // update ic.residIgLoop[resid];
                            for(let k = 1; k <= j; ++k) {
                                currPos = endPos + k;
                                currResi = ic.ParserUtilsCls.getResi(chnid, currPos);
                                let currResid = chnid + '_' + currResi;
                                delete ic.residIgLoop[currResid];
                            }

                            break;
                        }
                    }
                }
            }
            
            // 3. assign refnumLabel for each resid
            strandCnt = 0;
            let loopCnt = 0;

            let bBeforeAstrand = true, bAfterGstrand = true, refnumLabelNoPostfix, prevStrandCnt = 0, currRefnum;
            bStart = false;
            let refnumInStrand = 0;
            if(strandArray.length > 0) {
                for(let i = 0, il = giSeq.length; i < il; ++i, ++loopCnt, ++refnumInStrand) {
                    let currResi = ic.ParserUtilsCls.getResi(chnid, i);
                    let residueid = chnid + '_' + currResi;
                    refnumLabel = ic.resid2refnum[residueid];

                    currStrand = strandArray[strandCnt].strand;

                    if(refnumLabel) {
                        refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                        currRefnum = parseInt(refnumStr);
                        refnumLabelNoPostfix = currStrand + currRefnum;

                        currStrand = refnumLabel.replace(new RegExp(refnumStr,'g'), '');
                        
                        let firstChar = refnumLabel.substr(0,1);
                        if(!bStart && (firstChar == 'A' || firstChar == 'B')) { // start of a new IG domain
                            bStart = true;
                            bBeforeAstrand = true;
                            loopCnt = 0;
                        }
                    }

                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[residueid]);

                    // skip non-protein residues
                    if(!atom || !ic.proteins.hasOwnProperty(atom.serial)) {
                        refnumLabel = undefined;
                    }
                    else {
                        let bBefore = false, bInRange= false, bAfter = false;
                        // 100, 100A
                        if(parseInt(currResi) == parseInt(strandArray[strandCnt].startResi) && currResi != strandArray[strandCnt].startResi) {
                            bBefore = currResi < strandArray[strandCnt].startResi;
                        }
                        else {
                            bBefore = parseInt(currResi) < parseInt(strandArray[strandCnt].startResi);
                        }

                        // 100, 100A
                        if(parseInt(currResi) == parseInt(strandArray[strandCnt].endResi) && currResi != strandArray[strandCnt].endResi) {
                            bAfter = currResi > strandArray[strandCnt].endResi;
                        }
                        else {
                            bAfter = parseInt(currResi) > parseInt(strandArray[strandCnt].endResi);
                        }

                        bInRange = (!bBefore && !bAfter) ? true : false;

                        if(bBefore) {
                            ic.residIgLoop[residueid] = 1;

                            if(bBeforeAstrand) { // make it continuous to the 1st strand
                                if(bStart) {
                                    currRefnum = strandArray[strandCnt].startRefnum - strandArray[strandCnt].loopResCnt + loopCnt;
                                    refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                    refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix;
                                }    
                                else {
                                    //loopCnt = 0;
                                    refnumLabelNoPostfix = undefined;
                                    refnumLabel = undefined;
                                }                        
                            }
                            else {
                                if(prevStrandCnt >= 0 && strandArray[prevStrandCnt].strand.substr(0, 1) == 'G') {
                                    if(!bAfterGstrand) {
                                        //loopCnt = 0;
                                        refnumLabelNoPostfix = undefined;
                                        refnumLabel = undefined;
                                    }
                                    else {
                                        if(bStart && ic.resid2refnum[residueid]) {
                                            bAfterGstrand = true;

                                            currRefnum = strandArray[prevStrandCnt].endRefnum + loopCnt;
                                            refnumLabelNoPostfix = strandArray[prevStrandCnt].strand + currRefnum;
                                            refnumLabel = refnumLabelNoPostfix  + strandArray[prevStrandCnt].strandPostfix; 
                                        }
                                        else {
                                            bStart = false;
                                            bBeforeAstrand = true;
                                            //loopCnt = 0;

                                            bAfterGstrand = false;
        
                                            refnumLabelNoPostfix = undefined;
                                            refnumLabel = undefined;
                                        }
                                    }
                                }
                                else {
                                    bAfterGstrand = true; // reset

                                    let len = strandArray[strandCnt].loopResCnt;
                                    let halfLen = parseInt(len / 2.0 + 0.5);
                        
                                    if(loopCnt <= halfLen) {
                                        currRefnum = strandArray[prevStrandCnt].endRefnum + loopCnt;
                                        refnumLabelNoPostfix = strandArray[prevStrandCnt].strand + currRefnum;
                                        refnumLabel = refnumLabelNoPostfix  + strandArray[prevStrandCnt].strandPostfix; 
                                    }
                                    else {
                                        currRefnum = strandArray[strandCnt].startRefnum - len + loopCnt - 1;
                                        refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                        refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                                    }
                                }
                            }
                        }
                        else if(bInRange) {
                            // not in loop any more if you assign ref numbers multiple times
                            //delete ic.residIgLoop[residueid];

                            bBeforeAstrand = false;

                            if(strandArray[strandCnt].anchorRefnum) { // use anchor to name refnum
                                if(currResi == strandArray[strandCnt].startResi) {
                                    refnumInStrand = strandArray[strandCnt].anchorRefnum - strandArray[strandCnt].resCntBfAnchor;
                                    strandArray[strandCnt].startRefnum = refnumInStrand;
                                }
                                else if(currResi == strandArray[strandCnt].endResi) {
                                    strandArray[strandCnt].endRefnum = refnumInStrand;
                                }

                                refnumLabelNoPostfix = strandArray[strandCnt].strand + refnumInStrand;
                                refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                            }

                            if(currResi == strandArray[strandCnt].endResi) {
                                ++strandCnt; // next strand
                                loopCnt = 0;

                                if(!strandArray[strandCnt]) { // last strand
                                    --strandCnt;
                                }
                            }
                        }
                        else if(bAfter) {     
                            ic.residIgLoop[residueid] = 1;    

                            if(!bAfterGstrand) {
                                refnumLabelNoPostfix = undefined;
                                refnumLabel = undefined;
                            }
                            else {
                                // C-terminal
                                if(!ic.resid2refnum[residueid]) {
                                    bAfterGstrand = false;

                                    refnumLabelNoPostfix = undefined;
                                    refnumLabel = undefined;
                                }
                                else {
                                    bAfterGstrand = true;

                                    currRefnum = strandArray[strandCnt].endRefnum + loopCnt;
                                    refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                    refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                                }
                            }
                        }
                    }

                    prevStrand = currStrand;
                    prevStrandCnt = strandCnt - 1;

                    // assign the adjusted reference numbers
                    ic.resid2refnum[residueid] = refnumLabel;

                    refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);

                    if(!ic.refnum2residArray.hasOwnProperty(refnumStr)) {
                        ic.refnum2residArray[refnumStr] = [residueid];
                    }
                    else {
                        ic.refnum2residArray[refnumStr].push(residueid);
                    }

                    if(!ic.chainsMapping.hasOwnProperty(chnid)) {
                        ic.chainsMapping[chnid] = {};
                    }

                    // remove the postfix when comparing interactions
                    //ic.chainsMapping[chnid][residueid] = refnumLabel;
                    ic.chainsMapping[chnid][residueid] = refnumLabelNoPostfix;
                }
            }
        }

        if(!ic.chain2igArray) ic.chain2igArray = {};
        ic.chain2igArray[chnid] = [];

        let igElem = {};
        bStart = false;
 
        let refnumLabelNoPostfix;
        let appearedStrands = {}, currStrand_ori, bShowRefnum = true;
        prevStrand = undefined;
        let prevPos;

        // show tracks
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

                    let prevStrandFirstLet = (prevStrand) ? prevStrand.substr(0, 1) : '';
                    let currStrandFirstLet = (currStrand) ? currStrand.substr(0, 1) : '';

                    if(prevStrand != currStrand && (!prevStrandFirstLet || prevStrandFirstLet == 'F' || prevStrandFirstLet == 'G') && (currStrandFirstLet == 'A' || currStrandFirstLet == 'B') ) { // a new Ig domain starts
                        if(prevStrand) {
                            igElem.endPos = prevPos;
                            ic.chain2igArray[chnid].push(igElem);
                        }

                        igElem = {};
                        igElem.startPos = i;
                    }

                    if(domainid) igElem.domainid = domainid;
                
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

        igElem.endPos = prevPos;
        ic.chain2igArray[chnid].push(igElem);

        if(me.bNode) return {html: '', html2: '', html3: ''};

        let maxTextLen = 19;
        let titleSpace = 120;

        let linkStr = 'icn3d-link icn3d-blue';
        let title = 'IgStRAnD Ref. No.';

        let igCnt = ic.chain2igArray[chnid].length;
        let fromArray = [], toArray = [];
        for(let i = 0; i < igCnt; ++i) {
            let igElem = ic.chain2igArray[chnid][i];
            fromArray.push(igElem.startPos);
            toArray.push(igElem.endPos);
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

        // summary html2
        html2 += htmlTitle; 
        html2 += htmlCnt + '<span class="icn3d-seqLine">';


        html += htmlIg;

        html += htmlCnt;
        html += '</span>';
        html += '<br>';
        html += '</div>';
        html += '</div>';

        let igArray = ic.chain2igArray[chnid];      
        if(igArray.length == 0) return {html: '', html2: '', html3: ''};
        let rangeArray = [], titleArray = [], fullTitleArray = [], domainArray = [];

        for(let i = 0, il = igArray.length; i < il; ++i) {
            let domainid = igArray[i].domainid;
            let info = ic.domainid2info[domainid];
            if(!info) continue;

            let tmscore = info.score;
            let igType = ic.ref2igtype[info.refpdbname];
            titleArray.push(igType + ' (TM:' + parseFloat(tmscore).toFixed(2) + ')');
            fullTitleArray.push(igType + ' (TM:' + parseFloat(tmscore).toFixed(2) + '), template: ' + info.refpdbname + ', Seq. identity: ' + parseFloat(info.seqid).toFixed(2) + ', aligned residues: ' + info.nresAlign);
            domainArray.push(igType);

            let range = {};
            range.locs = [{"from":igArray[i].startPos, "to":igArray[i].endPos}];
            rangeArray.push(range);
        }
        if(titleArray.length == 0) return {html: '', html2: '', html3: ''};

        // add tracks for the summary view
        for(let i = 0, il = fromArray.length; i < il; ++i) {
            let resi = ic.ParserUtilsCls.getResi(chnid, fromArray[i]);
            let resid = chnid + "_" + resi;
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
            let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            let color =(atom.color !== undefined) ? colorStr : "CCCCCC";

            let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i]) / ic.maxAnnoLength) : 
                Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);
            html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
            html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle ' + linkStr + '" ig="0" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + domainArray[i] + '" index="0" setname="' + chnid + '_igs" id="' + chnid + '_igs" anno="sequence" chain="' + chnid + '" title="' + domainArray[i] + '">' +  domainArray[i] + ' </div>';
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
