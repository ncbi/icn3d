/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {ShowAnno} from '../annotations/showAnno.js';
import {ShowSeq} from '../annotations/showSeq.js';

class AnnoPTM {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the annotations of CDD domains and binding sites.
    showPTM(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // UniProt ID
        let structure = chnid.substr(0, chnid.indexOf('_'));
        let chain = chnid.substr(chnid.indexOf('_') + 1);

        // UniProt ID
        if( structure.length > 5 ) {
            let url =  "https://www.ebi.ac.uk/proteins/api/features/" + structure;     
            $.ajax({
              url: url,
              dataType: 'json',
              cache: true,
              tryCount : 0,
              retryLimit : 0, //1
              success: function(data) {
                thisClass.parsePTM(data, chnid);
                if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }

                thisClass.getNoPTM(chnid);

                return;
              }
            });
        }
        else { // PDB
            // get PDB to UniProt mapping
            // https://www.ebi.ac.uk/pdbe/api/doc/sifts.html
            // https://www.ebi.ac.uk/pdbe/api/doc/
            let structLower = structure.substr(0, 4).toLowerCase();
            let urlMap = "https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/" + structLower;

            $.ajax({
              url: urlMap,
              dataType: 'json',
              cache: true,
              success: function(dataMap) {
                let UniProtID = '';
                if(!ic.UPResi2ResiPosPerChain) ic.UPResi2ResiPosPerChain = {};
                ic.UPResi2ResiPosPerChain[chnid] = {};
                let mapping = dataMap[structLower].UniProt;

                let bFound = false;
                for(let up in mapping) {
                    let chainArray = mapping[up].mappings;
                    if(bFound) break;

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

                            UniProtID = up;
                            bFound = true;
                            break;
                        }
                    }
                }

                if(UniProtID == '') {
                    thisClass.getNoPTM(chnid);
                }
                else {
                    let url =  "https://www.ebi.ac.uk/proteins/api/features/" + UniProtID;     
                    $.ajax({
                        url: url,
                        dataType: 'json',
                        cache: true,
                        tryCount : 0,
                        retryLimit : 0, //1
                        success: function(data) {
                            thisClass.parsePTM(data, chnid);
                            if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
                        },
                        error : function(xhr, textStatus, errorThrown ) {
                            this.tryCount++;
                            if(this.tryCount <= this.retryLimit) {
                                //try again
                                $.ajax(this);
                                return;
                            }

                            thisClass.getNoPTM(chnid);

                            return;
                        }
                    });
                }
              },
              error : function(xhr, textStatus, errorThrown ) {
                thisClass.getNoPTM(chnid);
              }
            });
        }
    }

    parsePTM(data, chnid) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let chainWithData = {};

        if(me.bNode) {
            //if(!ic.resid2ptm) ic.resid2ptm = {};
            ic.resid2ptm = {};
            ic.resid2ptm[chnid] = [];
        }

        let ptmHash = {};
        for(let i = 0, il = data.features.length; i < il; ++i) {
            let feature = data.features[i];

            if(feature.category == 'PTM' && feature.type != 'DISULFID' && feature.type != 'CROSSLNK') {
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
        }

        let index = 0;
        let html = '', html2 = '', html3 = ''; 
        html += '<div id="' + ic.pre + chnid + '_ptmseq_sequence" class="icn3d-cdd icn3d-dl_sequence">';
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
                        if(ic.UPResi2ResiPosPerChain[chnid][j]) resPosArray.push(ic.UPResi2ResiPosPerChain[chnid][j]);
                    }
                    
                    if(!bCoordinates && ic.residues.hasOwnProperty(chnid + '_' + j)) {
                        bCoordinates = true;
                    }
                }
            }

            if(resPosArray.length == 0) continue;

            let resCnt = resPosArray.length;
            let title = 'PTM: ' + ptm;
            if(title.length > 17) title = title.substr(0, 17) + '...';
            let fulltitle = ptm;

            let linkStr = (bCoordinates) ? 'icn3d-link icn3d-blue' : '';

            let htmlTmp2 = '<div class="icn3d-seqTitle ' + linkStr + '" ptm="ptm" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_ptm_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            let htmlTmp = '<span class="icn3d-seqLine">';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
            let pre = 'ptm' + index.toString();
            //var widthPerRes = ic.seqAnnWidth / ic.maxAnnoLength;
            let prevEmptyWidth = 0;
            let prevLineWidth = 0;
            let widthPerRes = 1;
            for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
                html += ic.showSeqCls.insertGap(chnid, i, '-');
                if(resPosArray.indexOf(i) != -1) {
                    let cFull = ic.giSeq[chnid][i];
                    let c = cFull;
                    if(cFull.length > 1) {
                        c = cFull[0] + '..';
                    }
                    let pos = ic.annoCddSiteCls.getAdjustedResi(i, chnid, ic.matchedPos, ic.chainsSeq, ic.baseResi);

                    html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
                    if(me.bNode) {
                        let obj = {};
                        obj[chnid + '_' + pos] = 'PTM: ' + ptm;
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

        $("#" + ic.pre + "dt_ptm_" + chnid).html(html);
        $("#" + ic.pre + "ov_ptm_" + chnid).html(html2);
        $("#" + ic.pre + "tt_ptm_" + chnid).html(html3);

        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxPTM = true;
    }

    getNoPTM(chnid) { let ic = this.icn3d, me = ic.icn3dui;
        console.log( "No PTM data were found for the chain " + chnid + "..." );
   
        $("#" + ic.pre + "dt_ptm_" + chnid).html('');
        $("#" + ic.pre + "ov_ptm_" + chnid).html('');
        $("#" + ic.pre + "tt_ptm_" + chnid).html('');

        // add here after the ajax call
        ic.showAnnoCls.enableHlSeq();
        ic.bAjaxPTM = true;
        if(ic.deferredPTM !== undefined) ic.deferredPTM.resolve();
    }
}

export {AnnoPTM}
