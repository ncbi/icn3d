/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

 import {Html} from '../../html/html.js';
 
 import {SaveFile} from '../export/saveFile.js';
 import {PdbParser} from '../parsers/pdbParser.js';
 
 class Refnum {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    hideIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        ic.bShowRefnum = false;

        ic.hAtoms = {};
        ic.bResetAnno = true;
        ic.showAnnoCls.showAnnotations();
        ic.hlUpdateCls.updateHlAll();
    }
 
    showIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        if(Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;

            // open sequence view
            ic.hAtomsRefnum = {};
            ic.showAnnoCls.showAnnotations();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else {
            ic.refpdbArray = ['1bqu_fn3', '1cd8_igv', '1t6v_vnar', '1wio_c2', '1wio_igv', '2atp_a', '2atp_b', '2dm3_iset', '5esv_vh', '5esv_vl', '6al5_cd19', '7bz5_cl1', '7bz5_vh', '7bz5_vl'];

            if(ic.pdbDataArray) {
                thisClass.parseRefPdbData(ic.pdbDataArray);
            }
            else {

                let pdbAjaxArray = [];
                for(let k = 0, kl = ic.refpdbArray.length; k < kl; ++k) {
                    let urlpdb = me.htmlCls.baseUrl + "icn3d/refpdb/" + ic.refpdbArray[k] + ".pdb";

                    let pdbAjax = $.ajax({
                        url: urlpdb,
                        type: 'GET',
                        dataType: "text",
                        cache: true
                    });

                    pdbAjaxArray.push(pdbAjax);
                }

                $.when.apply(undefined, pdbAjaxArray).then(function() {
                    ic.pdbDataArray = (pdbAjaxArray.length == 1) ? [arguments] : Array.from(arguments);

                    thisClass.parseRefPdbData(ic.pdbDataArray);
                })
                .fail(function() {
                    alert("Error in retrieveing reference PDB data...");
                    return;
                });
            }
        }
    }

    parseRefPdbData(dataArray) { let ic = this.icn3d, me = ic.icn3dui;
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
                        let struct2 = "stru" + index;
                        let pdb_query = dataArray[index][0];

                        let header = 'HEADER                                                        ' + struct2 + '\n';
                        pdb_query = header + pdb_query;

                        let alignAjax = $.ajax({
                            url: urltmalign,
                            type: 'POST',
                            data: {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbArray[index]},
                            dataType: 'jsonp',
                            cache: true
                        });

                        ajaxArray.push(alignAjax);
                        
                        domainidpairArray.push(domainid + "," + index);
                    }
                }
            }
       }

       //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
       //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
       $.when.apply(undefined, ajaxArray).then(function() {
           let dataArray =(ajaxArray.length == 1) ? [arguments] : Array.from(arguments);
           thisClass.parseAlignData(dataArray, domainidpairArray);

           if(ic.deferredRefnum !== undefined) ic.deferredRefnum.resolve();
       })
       .fail(function() {
           console.log("Error in aligning with TM-align...");
           return;
       });    
    }

    parseAlignData(dataArray, domainidpairArray) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        let tmscoreThreshold = 0.4; //0.5;

        // find the best alignment for each chain
        let domainid2score = {}, domainid2segs = {}, chainid2segs = {};
        ic.chainid2index = {};
        ic.domainid2ig2kabat = {};
        for(let i = 0, il = domainidpairArray.length; i < il; ++i) {
            let  queryData = dataArray[i][0];
            if(queryData.length == 0) continue;
            if(queryData[0].score < tmscoreThreshold || queryData[0].num_res < 50) continue;

            let domainid_index = domainidpairArray[i].split(',');
            let domainid = domainid_index[0];
            let chainid = domainid.split('-')[0];

            // Ig-like domains: B (2050, 2050a, 2050b), C (3050), E (5050), F (6050) strands
            // Ig domain may require G (7050). But we'll leave that out for now.
            let bBstrand = false, bCstrand = false, bEstrand = false, bFstrand = false, bGstrand = false;
            for(let i = 0, il = queryData[0].segs.length; i < il; ++i) {
                let seg = queryData[0].segs[i];
                if(seg.q_start.indexOf('2050') != -1) {
                    bBstrand = true;
                }
                else if(seg.q_start.indexOf('3050') != -1) {
                    bCstrand = true;
                }
                else if(seg.q_start.indexOf('5050') != -1) {
                    bEstrand = true;
                }
                else if(seg.q_start.indexOf('6050') != -1) {
                    bFstrand = true;
                }
                // else if(seg.q_start.indexOf('7050') != -1) {
                //     bGstrand = true;
                // }

                //if(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand) break;
                if(bBstrand && bCstrand && bEstrand && bFstrand) break;
            }
            //if(!(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand)) continue;
            if(!(bBstrand && bCstrand && bEstrand && bFstrand)) continue;

            if(!domainid2score.hasOwnProperty(domainid) || queryData[0].score > domainid2score[domainid]) {
                domainid2score[domainid] = queryData[0].score;
console.log(domainid + ' TM-score: ' + domainid2score[domainid] + ' matched ' + ic.refpdbArray[domainid_index[1]]);                
                ic.chainid2index[chainid] = domainid_index[1]; // could be several, just take the recent one for simplicity
                domainid2segs[domainid] = queryData[0].segs;
                ic.domainid2ig2kabat[domainid] = queryData[0].ig2kabat;
            }
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
console.log("One of the reference PDBs for chain chainid: " + ic.refpdbArray[ic.chainid2index[chainid]]);

            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                let qStartInt = parseInt(seg.q_start);
                let postfix = '';
                if(isNaN(seg.q_start)) postfix = seg.q_start.substr(seg.q_start.length - 1, 1);

                for(let j = 0; j <= parseInt(seg.t_end) - parseInt(seg.t_start); ++j) {
                    let resid = chainid + '_' + (j + parseInt(seg.t_start)).toString();
                    //let refnum = j + seg.q_start;
                    let refnum = (j + qStartInt).toString() + postfix;

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
                }
            }
        }

        if(Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;

            // open sequence view
            ic.hAtomsRefnum = {};
            ic.showAnnoCls.showAnnotations();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else {
            alert("No Ig reference numbers are assigned based on the reference structures in iCn3D...");
        }
    }

    getLabelFromRefnum(oriRefnum) { let  ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(oriRefnum);

        if(refnum >= 1000 && refnum < 1200) return "A" + oriRefnum;
        else if(refnum >= 1200 && refnum < 2000) return "A'" + oriRefnum;
        else if(refnum >= 2000 && refnum < 3000) return "B" + oriRefnum;
        else if(refnum >= 3000 && refnum < 3200) return "C" + oriRefnum;
        else if(refnum >= 3200 && refnum < 3700) return "C'" + oriRefnum;
        else if(refnum >= 3700 && refnum < 4000) return "C''" + oriRefnum;
        else if(refnum >= 4000 && refnum < 5000) return "D" + oriRefnum;
        else if(refnum >= 5000 && refnum < 6000) return "E" + oriRefnum;
        else if(refnum >= 6000 && refnum < 7000) return "F" + oriRefnum;
        else if(refnum >= 7000 && refnum < 7200) return "G" + oriRefnum;
        else if(refnum >= 7200 && refnum < 8000) return "G'" + oriRefnum;
    }

    parseCustomRefFile(data) { let  ic = this.icn3d, me = ic.icn3dui;
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
        ic.showAnnoCls.showAnnotations();
        ic.annotationCls.setAnnoViewAndDisplay('detailed view');
    }
 }
 
 export {Refnum}
 