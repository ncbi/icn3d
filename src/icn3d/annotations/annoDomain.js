/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AnnoDomain {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showDomainPerStructure(index, bNotShowDomain) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        //var chnid = Object.keys(ic.protein_chainid)[0];
        //var pdbid = chnid.substr(0, chnid.indexOf('_'));
        let pdbArray = Object.keys(ic.structures);
        // show 3D domains
        let pdbid = pdbArray[index];
        //let url = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=" + pdbid;

/*
        if(!ic.bResetAnno && index == 0 && ic.mmdb_data !== undefined) {      
            for(let chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                    this.showDomainWithData(chnid, ic.mmdb_data);
                }
            }
        }
        else if(!ic.bResetAnno && ic.mmdb_dataArray[index] !== undefined) {
            for(let chnid in ic.protein_chainid) {
                if(chnid.indexOf(pdbid) !== -1) {
                   this.showDomainWithData(chnid, ic.mmdb_dataArray[index]);
                }
            }
        }
        else {
*/
            // calculate 3D domains on-the-fly
            //ic.protein_chainid[chainArray[i]] 
            let data = {};
            data.domains = {};
            for(let chainid in ic.chains) {
                let structure = chainid.substr(0, chainid.indexOf('_'));
                // if(pdbid == structure && ic.protein_chainid.hasOwnProperty(chainid)) {
                if(pdbid == structure) {
                    data.domains[chainid] = {};
                    data.domains[chainid].domains = [];

                    let atoms = ic.chains[chainid];

                    let result = ic.domain3dCls.c2b_NewSplitChain(atoms);
                    let subdomains = result.subdomains;
                    // let pos2resi = result.pos2resi;

                    for(let i = 0, il = subdomains.length; i < il; ++i) {
                        // domain item: {"sdid":1722375,"intervals":[[1,104],[269,323]]}
                        let domain = {};
                        domain.intervals = [];

                        for(let j = 0, jl = subdomains[i].length; j < jl; j += 2) {
                            domain.intervals.push([subdomains[i][j], subdomains[i][j+1]]);
                        }

                        data.domains[chainid].domains.push(domain);
                    }

                    // data.domains[chainid].pos2resi = pos2resi;
                }
            }

            ic.mmdb_dataArray[index] = data;
            // for(let chnid in ic.protein_chainid) {
            for(let chnid in ic.chains) {
                if(chnid.indexOf(pdbid) !== -1) {
                    thisClass.showDomainWithData(chnid, ic.mmdb_dataArray[index], bNotShowDomain);
                }
            }

            ic.bAjax3ddomain = true;
            ic.bAjaxDoneArray[index] = true;          
        // }
    }

    //Show the annotations of 3D domains.
    showDomainAll(bNotShowDomain) { let ic = this.icn3d, me = ic.icn3dui;
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
            this.showDomainPerStructure(i, bNotShowDomain);
        }
    }

    getResiFromNnbiresid(ncbiresid) { let ic = this.icn3d, me = ic.icn3dui;
        let resid = (ic.ncbi2resid[ncbiresid]) ? ic.ncbi2resid[ncbiresid] : ncbiresid;
        let resi = resid.substr(resid.lastIndexOf('_') + 1);

        return resi;
    }

    getNcbiresiFromResid(resid) { let ic = this.icn3d, me = ic.icn3dui;
        let ncbiresid = (ic.resid2ncbi[resid]) ? ic.resid2ncbi[resid] : resid;
        let resi = ncbiresid.substr(ncbiresid.lastIndexOf('_') + 1);

        return resi;
    }

    showDomainWithData(chnid, data, bNotShowDomain) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '<div id="' + ic.pre + chnid + '_domainseq_sequence" class="icn3d-dl_sequence">';
        let html2 = html;
        let html3 = html;
        let domainArray, pos2resi, proteinname;
        let pos = chnid.indexOf('_');
        let chain = chnid.substr(pos + 1);
        // MMDB symmetry chain has the form of 'A1'
        if(chain.length > 1 && chain.substr(chain.length - 1) == '1') {
            chain = chain.substr(0, chain.length - 1);
        }

        // if(bCalcDirect) {
            proteinname = chnid;
            domainArray = (data.domains[chnid]) ? data.domains[chnid].domains : [];
            // pos2resi = data.domains[chnid].pos2resi;
/*            
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
*/        

        for(let index = 0, indexl = domainArray.length; index < indexl; ++index) {
            //var fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname + '(PDB ID: ' + data.pdbId + ')';
            let fulltitle = '3D domain ' +(index+1).toString() + ' of ' + proteinname;
            let title =(fulltitle.length > 17) ? fulltitle.substr(0,17) + '...' : fulltitle;
            let subdomainArray = domainArray[index].intervals;
            // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
            // let domainFromHash = {}, domainToHash = {};
            let fromArray = [], toArray = []; // posFromArray = [], posToArray = [];
            let resiHash = {};
            let resCnt = 0;

            // subdomainArray contains NCBI residue number
            for(let i = 0, il = subdomainArray.length; i < il; ++i) {
                // let domainFrom = Math.round(subdomainArray[i][0]) - 1; // convert 1-based to 0-based
                // let domainTo = Math.round(subdomainArray[i][1]) - 1;

                let domainFrom = parseInt(subdomainArray[i][0]);
                let domainTo = parseInt(subdomainArray[i][1]);


                // fromArray.push(pos2resi[domainFrom]);
                // toArray.push(pos2resi[domainTo]);

                fromArray.push(domainFrom);
                toArray.push(domainTo);

                // posFromArray.push(domainFrom);
                // posToArray.push(domainTo);

                resCnt += domainTo - domainFrom + 1;
                for(let j = domainFrom; j <= domainTo; ++j) {
                    // let resi = pos2resi[j];
                    let resi = this.getResiFromNnbiresid(chnid + '_' + j);
                    resiHash[resi] = 1;
                }
            }

            if(ic.chainid2clashedResidpair) { //assign domain size to each residue in the clashed residues
                for(let residpair in ic.chainid2clashedResidpair) {
                    let residArray = residpair.split('|');
                    let valueArray = ic.chainid2clashedResidpair[residpair].split('|');

                    for(let i = 0, il = residArray.length; i < il; ++i) {
                        let chainid = residArray[i][0] + '_' + residArray[i][1];

                        if(chainid == chnid) {
                            let resi = residArray[i][3];
                            if(resiHash.hasOwnProperty(resi)) {
                                ic.chainid2clashedResidpair[residpair] = (i == 0) ? resCnt + '|' + valueArray[1] : valueArray[1] + '|' + resCnt;
                            }
                        }
                    }
                }
            }

            // save 3D domain info for node.js script
            if(me.bNode) {
                let domainName = '3D domain ' +(index+1).toString();
                            
                if(!ic.resid2domain) ic.resid2domain = {};
                if(!ic.resid2domain[chnid]) ic.resid2domain[chnid] = [];
                // for(let i = 0, il = posFromArray.length; i < il; ++i) {
                for(let i = 0, il = fromArray.length; i < il; ++i) {
                    let from = fromArray[i];
                    let to = toArray[i];
                    for(let j = from; j <= to; ++j) {
                        // 0-based
                        let obj = {};
                        // let resi = ic.ParserUtilsCls.getResi(chnid, j);
                        let resid = ic.ncbi2resid[chnid + '_' + j];
                        obj[resid] = domainName;
                        ic.resid2domain[chnid].push(obj);
                    }
                }
            }

            if(bNotShowDomain) continue;

            let htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            let htmlTmp = '<span class="icn3d-seqLine">';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
            let pre = 'domain3d' + index.toString();

            if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');

            for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
              html += ic.showSeqCls.insertGap(chnid, i, '-');
              //if(i >= domainFrom && i <= domainTo) {
              let resi = ic.ParserUtilsCls.getResi(chnid, i);
            //   if(resiHash.hasOwnProperty(i+1)) {
              if(resiHash.hasOwnProperty(resi)) {
                  let cFull = ic.giSeq[chnid][i];
                  let c = cFull;
                  if(cFull.length > 1) {
                      c = cFull[0] + '..';
                  }
                  
                //   let pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
                  let pos = resi;
                  html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + cFull + '</span>';
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
                    // let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i] - ic.baseResi[chnid] - 1) / ic.maxAnnoLength) : Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);
                    let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth *(fromArray[i]) / ic.maxAnnoLength) : Math.round(ic.seqAnnWidth *(fromArray[i] - toArray[i-1] - 1) / ic.maxAnnoLength);

                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray[i] - fromArray[i] + 1) / ic.maxAnnoLength) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" id="' + chnid + '_3d_domain_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">3D domain ' +(index+1).toString() + '</div>';
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
                    html2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" 3ddomain="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + title + '" index="' + index + '" setname="' + chnid + '_3d_domain_' +(index+1).toString() + '" id="' + chnid + '_3d_domain_' + index + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">3D domain ' +(index+1).toString() + '</div>';
                }
            }
            htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
            htmlTmp += '</span>';
            htmlTmp += '<br>';
            html += htmlTmp;
            html2 += htmlTmp;
        }

        if(!bNotShowDomain) {
            html += '</div>';
            html2 += '</div>';
            html3 += '</div>';
            $("#" + ic.pre + "dt_domain_" + chnid).html(html);
            $("#" + ic.pre + "ov_domain_" + chnid).html(html2);
            $("#" + ic.pre + "tt_domain_" + chnid).html(html3);
        }

        // hide clashed residues between two chains
        if(bNotShowDomain && ic.chainid2clashedResidpair) {
            ic.clashedResidHash = {};
            for(let residpair in ic.chainid2clashedResidpair) {
                let residArray = residpair.split('|');
                let valueArray = ic.chainid2clashedResidpair[residpair].split('|');
                
                if(parseInt(valueArray[0]) < parseInt(valueArray[1])) {
                    ic.clashedResidHash[residArray[0]] = 1;
                }
                else {
                    ic.clashedResidHash[residArray[1]] = 1;
                }
            }

            // expand clashed residues to the SSE and the loops connecting the SSE
            let addResidHash = {}, tmpHash = {};
            for(let resid in ic.clashedResidHash) {
                let pos = resid.lastIndexOf('_');
                let resi = parseInt(resid.substr(pos + 1));
                let chainid = resid.substr(0, pos);
                let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                if(atom.ss == 'coil') {
                    tmpHash = this.getMoreResidues(resi, chainid, 1, 'not coil');
                    addResidHash = me.hashUtilsCls.unionHash(addResidHash, tmpHash);
                    tmpHash = this.getMoreResidues(resi, chainid, -1, 'not coil');
                    addResidHash = me.hashUtilsCls.unionHash(addResidHash, tmpHash);
                }
                else {
                    tmpHash = this.getMoreResidues(resi, chainid, 1, 'ssbegin');
                    addResidHash = me.hashUtilsCls.unionHash(addResidHash, tmpHash);
                    tmpHash = this.getMoreResidues(resi, chainid, -1, 'ssend');
                    addResidHash = me.hashUtilsCls.unionHash(addResidHash, tmpHash);
                }
            }

            ic.clashedResidHash = me.hashUtilsCls.unionHash(ic.clashedResidHash, addResidHash);
        }
    }

    showHideClashedResidues() { let ic = this.icn3d, me = ic.icn3dui;
        // show or hide clashed residues
        if(ic.clashedResidHash && Object.keys(ic.clashedResidHash).length > 0) {
            let tmpHash = {};
            for(let resid in ic.clashedResidHash) {
                tmpHash = me.hashUtilsCls.unionHash(tmpHash, ic.residues[resid]);
            }

            if(ic.bHideClashed) {
                ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, tmpHash);
            }
            else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, tmpHash);
            }
        
            // if(ic.bHideClashed) ic.definedSetsCls.setMode('selection');
            ic.dAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
        }
    }

    getMoreResidues(resi, chainid, direction, condition) { let ic = this.icn3d, me = ic.icn3dui;
        let addResidHash = {};
        for(let i = 1; i < 100; ++i) {
            let resid2 = chainid + '_' + (resi + direction * i).toString();
            let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
            if(atom2) {
                let bBreak = false;
                if(condition == 'not coil') {
                    bBreak = (atom2.ss != 'coil');
                }
                else if(condition == 'ssbegin') {
                    bBreak = atom2.ssbegin;
                }
                else if(condition == 'ssend') {
                    bBreak = atom2.ssend;
                }

                if(bBreak) {
                    break;
                }
                else {
                    addResidHash[resid2] = 1;
                }
            }
        }

        return addResidHash;
    }

}

export {AnnoDomain}
