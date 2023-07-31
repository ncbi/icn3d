/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AnnoPTM {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the annotations of CDD domains and binding sites.
    async showPTM(chnid, chnidBase, type, begin, end) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // UniProt ID
        let structure = chnid.substr(0, chnid.indexOf('_'));
        let chain = chnid.substr(chnid.indexOf('_') + 1);

        if(type == 'afmem') {
            let ptmHash = {'Transmembrane': [{'begin': begin, 'end': end}]};
            this.setAnnoPtmTransmem('transmem', ptmHash, chnid);        
        }
        // UniProt ID
        else if( structure.length > 5 ) {
            let url =  "https://www.ebi.ac.uk/proteins/api/features/" + structure; 
            let data;
            try {
                data = await me.getAjaxPromise(url, 'json');

                thisClass.parsePTM(data, chnid, type);
                /// if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
            }
            catch {
                thisClass.getNoPTM(chnid, type);

                return;
            }
        }
        else { // PDB
            // get PDB to UniProt mapping
            // https://www.ebi.ac.uk/pdbe/api/doc/sifts.html
            // https://www.ebi.ac.uk/pdbe/api/doc/
            let structLower = structure.substr(0, 4).toLowerCase();
            let urlMap = "https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/" + structLower;

            let dataMap;
            try {
                dataMap = await me.getAjaxPromise(urlMap, 'json');

                let UniProtID = '';
                if(!ic.UPResi2ResiPosPerChain) ic.UPResi2ResiPosPerChain = {};
                ic.UPResi2ResiPosPerChain[chnid] = {};
                let mapping = dataMap[structLower].UniProt;

                let bFound = false;
                for(let up in mapping) {
                    let chainArray = mapping[up].mappings;
                    //if(bFound) break;

                    for(let i = 0, il = chainArray.length; i < il; ++i) {
                    //"entity_id": 3, "end": { "author_residue_number": null, "author_insertion_code": "", "residue_number": 219 }, "chain_id": "A", "start": { "author_residue_number": 94, "author_insertion_code": "", "residue_number": 1 }, "unp_end": 312, "unp_start": 94, "struct_asym_id": "C"
                        let chainObj = chainArray[i];
                        if(chainObj.chain_id == chain) {
                            let start = chainObj.unp_start;
                            let end = chainObj.unp_end;
                            let posStart = chainObj.start.residue_number;
                            let posEnd = chainObj.end.residue_number;

                            if(posEnd - posStart != end - start) {
                                console.log("There might be some issues in the PDB to UniProt residue mapping.");
                            }

                            for(let j = 0; j <= end - start; ++j) {
                                ic.UPResi2ResiPosPerChain[chnid][j + start] = j + posStart - 1; // 0-based
                            }

                            if(UniProtID == '' || UniProtID.length != 6) UniProtID = up;
                            bFound = true;
                            //break;
                        }
                    }
                }

                if(!ic.annoPtmData) ic.annoPtmData = {};

                if(UniProtID == '') {
                    thisClass.getNoPTM(chnid, type);
                }
                else {
                    // call just once for one UniProt ID
                    if(ic.annoPtmData.hasOwnProperty(UniProtID)) {
                        thisClass.parsePTM(ic.annoPtmData[UniProtID], chnid, type);
                    }
                    else {
                        
                        let url =  "https://www.ebi.ac.uk/proteins/api/features/" + UniProtID;     
                        let data;
                        try {
                            data = await me.getAjaxPromise(url, 'json');
                            ic.annoPtmData[UniProtID] = data;

                            thisClass.parsePTM(data, chnid, type);
                            /// if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
                        }
                        catch(err) {
                            thisClass.getNoPTM(chnid, type);
                            return;
                        }
                    }
                }
            }
            catch(err) {
                thisClass.getNoPTM(chnid, type);
                return;
            }
        }
    }

    parsePTM(data, chnid, type) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) {
            if(type == 'ptm') {
                ic.resid2ptm = {};
                ic.resid2ptm[chnid] = [];
            }
            else {
                ic.resid2transmem = {};
                ic.resid2transmem[chnid] = [];
            }
        }

        let ptmHash = {}, transmemHash = {};
        for(let i = 0, il = data.features.length; i < il; ++i) {
            let feature = data.features[i];

            if(type == 'ptm' && feature.category == 'PTM' && feature.type != 'DISULFID' && feature.type != 'CROSSLNK') {
                let title = '';
                if(feature.type == 'CARBOHYD') {
                    //title = 'Glycosylation, ' + feature.description;
                    title = 'Glycosylation';
                }
                else if(feature.type == 'LIPID') {
                    title = 'Lipidation, ' + feature.description;
                }
                else if(feature.description.indexOf('Phospho') == 0) {
                    title = 'Phosphorylation';
                }
                else if(feature.description) {
                    title = feature.description;
                }
                else {
                    title = feature.type;
                }

                if(!ptmHash[title]) ptmHash[title] = [];
                ptmHash[title].push(feature);
            }
            else if(type == 'transmem' && feature.category == 'TOPOLOGY' && feature.type == 'TRANSMEM') {
                let title = 'Transmembrane';
                if(!transmemHash[title]) transmemHash[title] = [];
                transmemHash[title].push(feature);
            }
        }

        if(type == 'ptm') {
            this.setAnnoPtmTransmem('ptm', ptmHash, chnid)
        }
        else {
            this.setAnnoPtmTransmem('transmem', transmemHash, chnid)
        }

        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxPTM = true;
    }

    setAnnoPtmTransmem(type, ptmHash, chnid) { let ic = this.icn3d, me = ic.icn3dui;
        let index = 0;
        let html = '', html2 = '', html3 = ''; 
        html += '<div id="' + ic.pre + chnid + '_' + type + 'seq_sequence" class="icn3d-cdd icn3d-dl_sequence">';
        html2 += html;
        html3 += html;
        let stucture = chnid.substr(0, chnid.indexOf('_'));

        for(let ptm in ptmHash) {
            let ptmArray = ptmHash[ptm];
            //"type": "MOD_RES", "category": "PTM", "description": "4-hydroxyproline", "begin": "382", "end": "382",
            let resPosArray = [];
            let bCoordinates = false;
            for(let i = 0, il = ptmArray.length; i < il; ++i) {
                let begin = parseInt(ptmArray[i].begin);
                let end = parseInt(ptmArray[i].end);

                for(let j = begin; j <= end; ++j) {
                    if(stucture.length > 5) { // UniProt
                        resPosArray.push(j - 1); // 0-based
                    } 
                    else { // PDB                       
                        if(ic.UPResi2ResiPosPerChain && ic.UPResi2ResiPosPerChain[chnid][j]) resPosArray.push(ic.UPResi2ResiPosPerChain[chnid][j]);
                    }
                    
                    if(!bCoordinates && ic.residues.hasOwnProperty(chnid + '_' + j)) {
                        bCoordinates = true;
                    }
                }
            }

            if(resPosArray.length == 0) continue;

            let resCnt = resPosArray.length;
            let title = (type == 'ptm') ? 'PTM: ' + ptm : 'Transmembrane';
            if(title.length > 17) title = title.substr(0, 17) + '...';
            let fulltitle = ptm;

            let linkStr = (bCoordinates) ? 'icn3d-link icn3d-blue' : '';

            let htmlTmp2 = '<div class="icn3d-seqTitle ' + linkStr + '" ' + type + '="' + type + '" posarray="' 
                + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_' + type + '_' 
                + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            let htmlTmp = '<span class="icn3d-seqLine">';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
            let pre = type + index.toString();
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
                    // let pos = ic.annoCddSiteCls.getAdjustedResi(i, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi);
                    let pos = ic.ParserUtilsCls.getResi(chnid, i);
                    
                    html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                    if(me.bNode) {
                        let obj = {};
                        obj[chnid + '_' + pos] = title;
                        ic.resid2ptm[chnid].push(obj);
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

            ++index;
        }

        html += '</div>';
        html2 += '</div>';
        html3 += '</div>';

        $("#" + ic.pre + "dt_" + type + "_" + chnid).html(html);
        $("#" + ic.pre + "ov_" + type + "_" + chnid).html(html2);
        $("#" + ic.pre + "tt_" + type + "_" + chnid).html(html3);
    }

    getNoPTM(chnid, type) { let ic = this.icn3d, me = ic.icn3dui;
        console.log( "No PTM data were found for the chain " + chnid + "..." );

        let idStr = (type == 'ptm') ? 'ptm' : 'transmem';
   
        $("#" + ic.pre + "dt_" + idStr + "_" + chnid).html('');
        $("#" + ic.pre + "ov_" + idStr + "_" + chnid).html('');
        $("#" + ic.pre + "tt_" + idStr + "_" + chnid).html('');

        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxPTM = true;
        /// if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
    }
}

export {AnnoPTM}
