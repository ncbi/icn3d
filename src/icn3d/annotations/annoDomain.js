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

    showDomainPerStructure(index) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        //var chnid = Object.keys(ic.protein_chainid)[0];
        //var pdbid = chnid.substr(0, chnid.indexOf('_'));
        let pdbArray = Object.keys(ic.structures);
        // show 3D domains
        let pdbid = pdbArray[index];
        //let url = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=" + pdbid;

        if(index == 0 && ic.mmdb_data !== undefined) {      
            for(let chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                    this.showDomainWithData(chnid, ic.mmdb_data);
                }
            }
        }
        else if(ic.mmdb_dataArray[index] !== undefined) {
            for(let chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                   this.showDomainWithData(chnid, ic.mmdb_dataArray[index]);
                }
            }
        }
        else {
            // calculate 3D domains on-the-fly
            //ic.protein_chainid[chainArray[i]] 
            let data = {};
            data.domains = {};
            for(let chainid in ic.chains) {
                let structure = chainid.substr(0, chainid.indexOf('_'));
                if(pdbid == structure && ic.protein_chainid.hasOwnProperty(chainid)) {
                    data.domains[chainid] = {};
                    data.domains[chainid].domains = [];

                    let atoms = ic.chains[chainid];

                    let result = ic.domain3dCls.c2b_NewSplitChain(atoms);
                    let subdomains = result.subdomains;
                    //let substruct = result.substruct;
                    //let jsonStr = ic.domain3dCls.getDomainJsonForAlign(atoms);
            
                    for(let i = 0, il = subdomains.length; i < il; ++i) {
                        // domain item: {"sdid":1722375,"intervals":[[1,104],[269,323]]}
                        let domain = {};
                        domain.intervals = [];

                        for(let j = 0, jl = subdomains[i].length; j < jl; j += 2) {
                            domain.intervals.push([subdomains[i][j], subdomains[i][j+1]]);
                        }

                        data.domains[chainid].domains.push(domain);
                    }
                }
            }

            ic.mmdb_dataArray[index] = data;
            let bCalcDirect = true;
            for(let chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                    thisClass.showDomainWithData(chnid, ic.mmdb_dataArray[index], bCalcDirect);
                }
            }

            ic.bAjax3ddomain = true;
            ic.bAjaxDoneArray[index] = true;          
        }
    }

    //Show the annotations of 3D domains.
    showDomainAll() { let ic = this.icn3d, me = ic.icn3dui;
        //var chnid = Object.keys(ic.protein_chainid)[0];
        //var pdbid = chnid.substr(0, chnid.indexOf('_'));
        let pdbArray = Object.keys(ic.structures);
        // show 3D domains
        ic.mmdb_dataArray = [];
        ic.bAjaxDoneArray = [];
        for(let i = 0, il = pdbArray.length; i < il; ++i) {
            ic.bAjaxDoneArray[i] = false;
        }

        for(let i = 0, il = pdbArray.length; i < il; ++i) {
            this.showDomainPerStructure(i);
        }
    }
    showDomainWithData(chnid, data, bCalcDirect) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '<div id="' + ic.pre + chnid + '_domainseq_sequence" class="icn3d-dl_sequence">';
        let html2 = html;
        let html3 = html;
        let domainArray, proteinname;
        let pos = chnid.indexOf('_');
        let chain = chnid.substr(pos + 1);

        if(bCalcDirect) {
            proteinname = chnid;
            domainArray = (data.domains[chnid]) ? data.domains[chnid].domains : [];
        }
        else {
            let molinfo = data.moleculeInfor;
            let currMolid;
            for(let molid in molinfo) {
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
        }

        for(let index = 0, indexl = domainArray.length; index < indexl; ++index) {
            //var fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname + '(PDB ID: ' + data.pdbId + ')';
            let fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname;
            let title =(fulltitle.length > 17) ? fulltitle.substr(0,17) + '...' : fulltitle;
            let subdomainArray = domainArray[index].intervals;
            // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
            let domainFromHash = {}, domainToHash = {}
            let fromArray = [], toArray = [];
            let resiHash = {}
            let resCnt = 0

            for(let i = 0, il = subdomainArray.length; i < il; ++i) {
                let domainFrom = Math.round(subdomainArray[i][0]) - 1; // convert 1-based to 0-based
                let domainTo = Math.round(subdomainArray[i][1]) - 1;
                if(domainFromHash.hasOwnProperty(domainFrom) || domainToHash.hasOwnProperty(domainTo)) {
                    continue; // do nothing for duplicated "from" or "to", e.g, PDBID 1ITW, 5FWI
                }
                else {
                    domainFromHash[domainFrom] = 1;
                    domainToHash[domainTo] = 1;
                }

                // use the NCBI residue number, and convert to PDB residue number during selection
                if(ic.bNCBI || bCalcDirect) {
                    fromArray.push(domainFrom);
                    toArray.push(domainTo);
                }
                else {
                    fromArray.push(domainFrom + ic.baseResi[chnid]);
                    toArray.push(domainTo + ic.baseResi[chnid]);
                }

                resCnt += domainTo - domainFrom + 1;
                for(let j = domainFrom; j <= domainTo; ++j) {
                    resiHash[j+1] = 1;
                }
            }

            // save 3D domain info for node.js script
            if(me.bNode) {
                let domainName = '3D domain ' +(index+1).toString();
                            
                if(!ic.resid2domain) ic.resid2domain = {};
                if(!ic.resid2domain[chnid]) ic.resid2domain[chnid] = [];
                for(let i = 0, il = fromArray.length; i < il; ++i) {
                    let from = fromArray[i];
                    let to = toArray[i];
                    for(let j = from; j <= to; ++j) {
                        // 0-based
                        let obj = {};
                        obj[chnid + '_' + (j+1).toString()] = domainName;
                        ic.resid2domain[chnid].push(obj);
                    }
                }
            }

            let htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            let htmlTmp = '<span class="icn3d-seqLine">';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
            let pre = 'domain3d' + index.toString();
            for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
              html += ic.showSeqCls.insertGap(chnid, i, '-');
              //if(i >= domainFrom && i <= domainTo) {
              if(resiHash.hasOwnProperty(i+1)) {
                let cFull = ic.giSeq[chnid][i];
                  let c = cFull;
                  if(cFull.length > 1) {
                      c = cFull[0] + '..';
                  }
//                let pos =(ic.baseResi[chnid] + i+1).toString();
//                let pos = ic.chainsSeq[chnid][i - ic.matchedPos[chnid] ].resi;
                  let pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
                html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
              }
              else {
                html += '<span>-</span>'; //'<span>-</span>';
              }
            }
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            let color =(atom.color !== undefined) ? colorStr : "CCCCCC";
            if(me.cfg.blast_rep_id != chnid) { // regular
                for(let i = 0, il = fromArray.length; i < il; ++i) {
                    let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i] - ic.baseResi[chnid] - 1) / ic.maxAnnoLength) : Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);
                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" id="' + chnid + '_3d_domain_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">3D domain ' +(index+1).toString() + '</div>';
                }
            }
            else { // with potential gaps
                let fromArray2 = [], toArray2 = [];
                for(let i = 0, il = fromArray.length; i < il; ++i) {
                    fromArray2.push(fromArray[i]);
                    for(let j = fromArray[i]; j <= toArray[i]; ++j) {
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
