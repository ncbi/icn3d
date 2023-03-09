/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 class Refnum {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async hideIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        ic.bShowRefnum = false;

        ic.hAtoms = {};
        ic.bResetAnno = true;
        await ic.showAnnoCls.showAnnotations();
        ic.hlUpdateCls.updateHlAll();
    }
 
    async showIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        if(ic.resid2refnum  && Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;

            // open sequence view
            ic.hAtomsRefnum = {};
            await ic.showAnnoCls.showAnnotations();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else {
            //ic.refpdbArray = ['1bqu_fn3', '1cd8_igv', '1t6v_vnar', '1wio_c2', '1wio_igv', '2atp_a', '2atp_b', '2dm3_iset', '5esv_vh', '5esv_vl', '6al5_cd19', '7bz5_cl1', '7bz5_vh', '7bz5_vl'];
            ic.refpdbArray = ['1bqu_fn3', '1cd8_igv', '1cdh_cd4', '1dr9_cd80', '1hnf_cd2', '1hxm_d', '1hxm_g', '1ifr_lamin', '1ncn_cd86', '1t6v_vnar', '1yjd_cd28', '2atp_a', '2atp_b', '2dm3_iset', '3kys_tead1', '3pv7_ncr', '4f9l_cd277', '4gos_vtc', '4i0k_cd276', '4jqi_b', '4z18_cd274', '4zqk_pd1', '4zt1_e', '5esv_vh', '5esv_vl', '6al5_cd19', '6jxr_a', '6jxr_b', '6jxr_d', '6jxr_e', '6jxr_g', '6oil_vista', '6rp8_at', '6rp8_t', '6umt_cd273', '6x4g_cd275', '6x4g_icos', '7xq8_a', '7xq8_b', 'q71h61_ild', 'q9um44_hhl', 'p42081_cd86', 'q7z7d3_vtc', '1bqu_x', '1cdh_x', '1hnf_x', '1hxm_dx', '1hxm_gx', '4jqi_x', '4zt1_x', '5esv_vhx', '5esv_vlx', '6jxr_ax', '6jxr_bx', '1dr9_x', '3pv7_x', '4f9l_x', '4iok_x', '4z18_x', '6x4g_cd275x', 'q9um44_x'];

            if(ic.pdbDataArray) {
                await thisClass.parseRefPdbData(ic.pdbDataArray);
            }
            else {

                let pdbAjaxArray = [];
                for(let k = 0, kl = ic.refpdbArray.length; k < kl; ++k) {
                    //let urlpdb = me.htmlCls.baseUrl + "icn3d/refpdb/" + ic.refpdbArray[k] + ".pdb";
                    let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + ic.refpdbArray[k];

                    let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

                    pdbAjaxArray.push(pdbAjax);
                }

                // try {
                    // if(!me.bNode) {
                        let allPromise = Promise.allSettled(pdbAjaxArray);
                        ic.pdbDataArray = await allPromise;
                        await thisClass.parseRefPdbData(ic.pdbDataArray);
                    // }
                    // else {
                    //     ic.pdbDataArray = [];
                    //     for(let i = 0, il = pdbAjaxArray.length; i < il; ++i) {
                    //         try {
                    //             let dataTmp = await pdbAjaxArray[i];
                    //             ic.pdbDataArray.push({'value': dataTmp});
                    //         }
                    //         catch(err) {
                    //             ic.pdbDataArray.push({'value': ''});
                    //         }
                    //     }

                    //     await thisClass.parseRefPdbData(ic.pdbDataArray);
                    // }
                // }
                // catch(err) {
                //     if(!me.bNode) alert("Error in retrieveing reference PDB data...");
                //     //alert("Error in retrieveing reference PDB data...");
                //     return;
                // }             
            }
        }
    }

    async parseRefPdbData(dataArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let struArray = Object.keys(ic.structures);
 
        let ajaxArray = [];
        let domainidpairArray = [];

        let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";

        ic.resid2domainid = {};

        for(let i = 0, il = struArray.length; i < il; ++i) {
            let struct = struArray[i];
            let chainidArray = ic.structures[struct];

            for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
                let chainid = chainidArray[j];

                if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]).serial)) continue;
                if(ic.chainsSeq[chainid].length < 50) continue; // peptide

                // align each 3D domain with reference structure
                let result = ic.domain3dCls.c2b_NewSplitChain(ic.chains[chainid]);
                let subdomains = result.subdomains;
                
                let domainAtomsArray = [];
                if(subdomains.length <= 1) {
                    domainAtomsArray.push(ic.chains[chainid]);

                    for(let n = 0, nl = ic.chainsSeq[chainid].length; n < nl; ++n) {
                        let resid = chainid + '_' + ic.chainsSeq[chainid][n].resi;
                        ic.resid2domainid[resid] = chainid + '-0';
                    }             
                }
                else {
                    for(let k = 0, kl = subdomains.length; k < kl; ++k) {
                        let domainAtoms = {};
                        let segArray = subdomains[k];

                        for(let m = 0, ml = segArray.length; m < ml; m += 2) {
                            let startResi = segArray[m];
                            let endResi = segArray[m+1];
                            for(let n = parseInt(startResi); n <= parseInt(endResi); ++n) {
                                let resid = chainid + '_' + n;
                                domainAtoms = me.hashUtilsCls.unionHash(domainAtoms, ic.residues[resid]);
                                ic.resid2domainid[resid] = chainid + '-' + k;
                            }
                        }

                        domainAtomsArray.push(domainAtoms);
                    }
                }
       
                for(let k = 0, kl = domainAtomsArray.length; k < kl; ++k) {

                    let pdb_target = ic.saveFileCls.getAtomPDB(domainAtomsArray[k], undefined, undefined, undefined, undefined, struct);
                    let domainid = chainid + '-' + k;
                    for(let index = 0, indexl = dataArray.length; index < indexl; ++index) {
                        let struct2 = ic.defaultPdbId + index;
                        let pdb_query = dataArray[index].value; //[0];
                        let header = 'HEADER                                                        ' + struct2 + '\n';
                        pdb_query = header + pdb_query;

                        let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbArray[index]};
                        let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);
                        ajaxArray.push(alignAjax);
                        
                        domainidpairArray.push(domainid + "," + index);
                    }
                }
            }
       }

        try {
            let dataArray2 = [];
            // if(!me.bNode) {
                let allPromise = Promise.allSettled(ajaxArray);
                dataArray2 = await allPromise;
            // }
            // else {
            //     for(let i = 0, il = ajaxArray.length; i < il; ++i) {
            //         try {
            //             let dataTmp = await ajaxArray[i];
            //             dataArray2.push({'value': dataTmp});
            //         }
            //         catch(err) {
            //             dataArray2.push({'value': []});
            //         }
            //     }
            // }
            
            await thisClass.parseAlignData(dataArray2, domainidpairArray);

            /// if(ic.deferredRefnum !== undefined) ic.deferredRefnum.resolve();
        }
        catch(err) {
            if(!me.bNode) console.log("Error in aligning with TM-align...");
            //console.log("Error in aligning with TM-align...");
            return;
        }                       
    }

    async parseAlignData(dataArray, domainidpairArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let tmscoreThreshold = 0.4; //0.5;

        // find the best alignment for each chain
        let domainid2score = {}, domainid2segs = {}, chainid2segs = {};
        ic.chainid2index = {};
        ic.domainid2index = {};
        ic.domainid2ig2kabat = {};
        ic.domainid2ig2imgt = {};

        for(let i = 0, il = domainidpairArray.length; i < il; ++i) {
            let queryData = dataArray[i].value; //[0];

            if(!queryData) {
                console.log("The alignment data for " + domainidpairArray[i] + " is unavailable...");
                continue;
            }

            if(queryData.length == 0) continue;

            if(queryData[0].score < tmscoreThreshold || queryData[0].num_res < 50) continue;

            let domainid_index = domainidpairArray[i].split(',');
            let domainid = domainid_index[0];
            let chainid = domainid.split('-')[0];

            // Ig-like domains: B (2150, 2150a, 2150b), C (3150, 3250), E (7150, 7250), F (8150, 8250) strands
            // Ig domain may require G (7050). But we'll leave that out for now.
            let bBstrand = false, bCstrand = false, bEstrand = false, bFstrand = false, bGstrand = false;
            for(let i = 0, il = queryData[0].segs.length; i < il; ++i) {
                let seg = queryData[0].segs[i];

                if(seg.q_start.indexOf('2150') != -1 || seg.q_start.indexOf('2250') != -1) {
                    bBstrand = true;
                }
                else if(seg.q_start.indexOf('3150') != -1 || seg.q_start.indexOf('3250') != -1) {
                    bCstrand = true;
                }
                else if(seg.q_start.indexOf('7150') != -1 || seg.q_start.indexOf('7250') != -1) {
                    bEstrand = true;
                }
                else if(seg.q_start.indexOf('8150') != -1 || seg.q_start.indexOf('8250') != -1) {
                    bFstrand = true;
                }

                //if(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand) break;
                if(bBstrand && bCstrand && bEstrand && bFstrand) break;
            }

            //if(!(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand)) continue;
            if(!(bBstrand && bCstrand && bEstrand && bFstrand)) continue;

            if(!domainid2score.hasOwnProperty(domainid) || queryData[0].score > domainid2score[domainid]) {
                domainid2score[domainid] = queryData[0].score;
if(!me.bNode) console.log(domainid + ' TM-score: ' + domainid2score[domainid] + ' matched ' + ic.refpdbArray[domainid_index[1]]);           
                //ic.chainid2index[chainid] = domainid_index[1]; // could be several, just take the recent one for simplicity
                ic.domainid2index[domainid] = domainid_index[1];
                domainid2segs[domainid] = queryData[0].segs;
                ic.domainid2ig2kabat[domainid] = queryData[0].ig2kabat;
                ic.domainid2ig2imgt[domainid] = queryData[0].ig2imgt;
            }
        }

        // combine domainid into chainid
        for(let domainid in ic.domainid2index) {
            let chainid = domainid.split('-')[0];
            if(!ic.chainid2index.hasOwnProperty(chainid)) ic.chainid2index[chainid] = [];
            ic.chainid2index[chainid].push(ic.domainid2index[domainid]);
        }
        
        // combine domainid into chainid
        for(let domainid in domainid2segs) {
            let chainid = domainid.split('-')[0];
            if(!chainid2segs[chainid]) chainid2segs[chainid] = [];
            chainid2segs[chainid] = chainid2segs[chainid].concat(domainid2segs[domainid]);
        }
        
        // assign ic.resid2refnum, ic.refnum2residArray, ic.chainsMapping
        if(!ic.resid2refnum) ic.resid2refnum = {};
        if(!ic.refnum2residArray) ic.refnum2residArray = {};
        if(!ic.chainsMapping) ic.chainsMapping = {};
        for(let chainid in chainid2segs) {
            let segArray = chainid2segs[chainid];
if(!me.bNode) {
    let chainList = '';
    for(let i = 0, il = ic.chainid2index[chainid].length; i < il; ++i) {
        chainList += ic.refpdbArray[ic.chainid2index[chainid][i]] + " ";
    }
    console.log("The reference PDB(s) for chain " + chainid + " are " + chainList);
}

            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                let qStartInt = parseInt(seg.q_start);
                let postfix = '';
                if(isNaN(seg.q_start)) postfix = seg.q_start.substr(seg.q_start.length - 1, 1);

                // one item in "seq"
                // q_start and q_end are numbers, but saved in string
                // t_start and t_end are strings such as 100a
                //for(let j = 0; j <= parseInt(seg.t_end) - parseInt(seg.t_start); ++j) {
                    // let resid = chainid + '_' + (j + parseInt(seg.t_start)).toString();
                    // let refnum = (j + qStartInt).toString() + postfix;

                    let resid = chainid + '_' + seg.t_start;
                    let refnum = qStartInt.toString() + postfix;

                    let refnumLabel = thisClass.getLabelFromRefnum(refnum);

                    ic.resid2refnum[resid] = refnumLabel;

                    if(!ic.refnum2residArray.hasOwnProperty(refnum)) {
                        ic.refnum2residArray[refnum] = [resid];
                    }
                    else {
                        ic.refnum2residArray[refnum].push(resid);
                    }

                    if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                        ic.chainsMapping[chainid] = {};
                    }
                    ic.chainsMapping[chainid][resid] = refnumLabel;
                //}
            }
        }

        if(Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;

            // open sequence view
            ic.hAtomsRefnum = {};
            await ic.showAnnoCls.showAnnotations();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else {
            alert("No Ig reference numbers are assigned based on the reference structures in iCn3D...");
        }
    }

    getLabelFromRefnum(oriRefnum) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(oriRefnum);

        if(refnum < 100) return oriRefnum;
        else if(refnum >= 100 && refnum < 1000) return "A^" + oriRefnum; 
        else if(refnum >= 1000 && refnum < 1200) return "A" + oriRefnum; // “A” strand or “A*” strand
        else if(refnum >= 1200 && refnum < 1900) return "A'" + oriRefnum;
        else if(refnum >= 1900 && refnum < 2000) return "A" + oriRefnum; // “A” strand or “A'” strand
        else if(refnum >= 2000 && refnum < 3000) return "B" + oriRefnum;
        else if(refnum >= 3000 && refnum < 4000) return "C" + oriRefnum;
        else if(refnum >= 4000 && refnum < 5000) return "C'" + oriRefnum;
        else if(refnum >= 5000 && refnum < 6000) return "C''" + oriRefnum;
        else if(refnum >= 6000 && refnum < 7000) return "D" + oriRefnum;
        else if(refnum >= 7000 && refnum < 8000) return "E" + oriRefnum;
        else if(refnum >= 8000 && refnum < 9000) return "F" + oriRefnum;
        else if(refnum >= 9000 && refnum < 9200) return "G" + oriRefnum; // 1st beta sheet, “G” strand or “G*” strand
        else if(refnum >= 9200 && refnum < 9900) return "G*" + oriRefnum; // 2nd beta sheet,  “G” strand or “G*” strand
        else if(refnum >= 9900) return "G" + oriRefnum;
    }

    async parseCustomRefFile(data) { let ic = this.icn3d, me = ic.icn3dui;
        ic.bShowCustomRefnum = true;

        //refnum,11,12,,21,22
        //1TUP_A,100,101,,,132
        //1TUP_B,110,111,,141,142

        let lineArray = data.split('\n');

        if(!ic.resid2refnum) ic.resid2refnum = {};
        if(!ic.refnum2residArray) ic.refnum2residArray = {};
        if(!ic.chainsMapping) ic.chainsMapping = {};

        let refAA = [];
        for(let i = 0, il = lineArray.length; i < il; ++i) {
            let numArray = lineArray[i].split(',');
            refAA.push(numArray);
        }

        // assign ic.refnum2residArray
        let refI = 0;
        for(let j = 1, jl = refAA[refI].length; j < jl; ++j) {
            if(!refAA[refI][j]) continue;

            let refnum = refAA[refI][j].trim();
            if(refnum) {
                for(let i = 1, il = refAA.length; i < il; ++i) {
                    if(!refAA[i][j]) continue;
                    let chainid = refAA[i][0].trim();
                    let resid = chainid + '_' + refAA[i][j].trim();
                    if(!ic.refnum2residArray[refnum]) {
                        ic.refnum2residArray[refnum] = [resid];
                    }
                    else {
                        ic.refnum2residArray[refnum].push(resid);
                    }
                }
            }
        }

        // assign ic.resid2refnum and ic.chainsMapping
        for(let i = 1, il = refAA.length; i < il; ++i) {
            let chainid = refAA[i][0].trim();

            for(let j = 1, jl = refAA[i].length; j < jl; ++j) {
                if(!refAA[i][j] || !refAA[refI][j]) continue;

                let resi = refAA[i][j].trim();
                let refnum = refAA[refI][j].trim();
                if(resi && refnum) {
                    let resid = chainid + '_' + resi;
                    ic.resid2refnum[resid] = refnum;

                    if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                        ic.chainsMapping[chainid] = {};
                    }
                    ic.chainsMapping[chainid][resid] = refnum;
                }
            }
        }

        // open sequence view
        await ic.showAnnoCls.showAnnotations();
        ic.annotationCls.setAnnoViewAndDisplay('detailed view');
    }
 }
 
 export {Refnum}
 