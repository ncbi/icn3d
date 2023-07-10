/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Vastplus {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Load the VAST+ structure alignment for the pair of structures "align", e.g., "align" could be "1HHO,4N7N".
    // vastplusAtype: 0: VAST, global, 1: VAST, invarant core, 2: TM-align, global
    async vastplusAlign(structArray, vastplusAtype, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // 1. pairwise alignment
        let ajaxArray = [], chainidpairArray = [];
        if(structArray.length != 2) {
            console.log("VAST+ needs two input structures...");
            return;
        }

        let struct1 = structArray[0], struct2 = structArray[1];

        // get protein chains since TM-align doesn't work for nucleotides
        let chainidArray1 = [], chainidArray2 = [];
        for(let i = 0, il = ic.structures[struct1].length; i < il; ++i) {
            let chainid1 = ic.structures[struct1][i];
            if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid1]).serial)) continue;
            chainidArray1.push(chainid1);
        }
        for(let i = 0, il = ic.structures[struct2].length; i < il; ++i) {
            let chainid2 = ic.structures[struct2][i];
            if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid2]).serial)) continue;
            chainidArray2.push(chainid2);
        }

        let node2chainindex = {};
        let node = 0;

        // align A to A, B to B first
        for(let i = 0, il = chainidArray1.length; i < il; ++i) {
            let chainid1 = chainidArray1[i];
            for(let j = 0, jl = chainidArray2.length; j < jl; ++j) {
                let chainid2 = chainidArray2[j];
                if(i == j) {
                    let alignAjax = this.setAlignment(struct1, struct2, chainid1, chainid2, bRealign);

                    ajaxArray.push(alignAjax);
                    chainidpairArray.push(chainid1 + ',' + chainid2);
                    node2chainindex[node] = [i, j];

                    ++node;
                }
            }
        }

        for(let i = 0, il = chainidArray1.length; i < il; ++i) {
            let chainid1 = chainidArray1[i];
            for(let j = 0, jl = chainidArray2.length; j < jl; ++j) {
                let chainid2 = chainidArray2[j];
                if(i != j) {
                    let alignAjax = this.setAlignment(struct1, struct2, chainid1, chainid2, bRealign);

                    ajaxArray.push(alignAjax);
                    chainidpairArray.push(chainid1 + ',' + chainid2);
                    node2chainindex[node] = [i, j];

                    ++node;
                }
            }
        }

        let allPromise = Promise.allSettled(ajaxArray);
        try {
            let dataArray = await allPromise;

            // 2. cluster pairs
            thisClass.clusterAlignment(dataArray, chainidpairArray, node2chainindex, vastplusAtype);

            // 3. superpose the top selection

            ic.ParserUtilsCls.hideLoading();
            await ic.pdbParserCls.loadPdbDataRender(true);

            /// if(ic.deferredRealignByVastplus !== undefined) ic.deferredRealignByVastplus.resolve();
        }
        catch(err) {
            alert("There are some problems in aligning the chains...");
        }          
    }

    setAlignment(struct1, struct2, chainid1, chainid2, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";

        let sel_t = (bRealign) ? me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid1]) : ic.chains[chainid1];
        let sel_q = (bRealign) ? me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid2]) : ic.chains[chainid2];

        let pdb_target = ic.saveFileCls.getAtomPDB(sel_t, undefined, undefined, undefined, undefined, struct1);
        let pdb_query = ic.saveFileCls.getAtomPDB(sel_q, undefined, undefined, undefined, undefined, struct2);

        let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target};
        let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);

        return alignAjax;
    }

    async realignOnVastplus() { let ic = this.icn3d, me = ic.icn3dui;
        let structHash = [];
        for(let struct in ic.structures) {
            let chainidArray = ic.structures[struct];
            for(let i = 0, il = chainidArray.length; i < il; ++i) {
                let chainid = chainidArray[i];
                let atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid]);               
                let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(atoms);
                structHash[firstAtom.structure] = 1;
            }
        }

        let bRealign = true, atype = 2; // VAST+ based on TM-align
        await ic.vastplusCls.vastplusAlign(Object.keys(structHash), atype, bRealign);
    }

    getResisFromSegs(segArray) { let ic = this.icn3d, me = ic.icn3dui;
        let resiArray_t = [], resiArray_q = [];
        for(let i = 0, il = segArray.length; i < il; ++i) {
            let seg = segArray[i];
            // for(let j = 0; j <= seg.t_end - seg.t_start; ++j) {
            //     resiArray_t.push(j);
            // }
            // for(let j = 0; j <= seg.q_end - seg.q_start; ++j) {
            //     resiArray_q.push(j);
            // }
            resiArray_t.push(seg.t_start + '-' + seg.t_end);
            resiArray_q.push(seg.q_start + '-' + seg.q_end);
        }

        return {resiArray_t: resiArray_t, resiArray_q: resiArray_q};
    }

    clusterAlignment(dataArray, chainidpairArray, node2chainindex, vastplusAtype) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let queryDataArray = [];
        for(let index = 0, indexl = chainidpairArray.length; index < indexl; ++index) {
            // let queryData = (me.bNode) ? dataArray[index] : dataArray[index].value; //[0];
            let queryData = dataArray[index].value; //[0];

            queryDataArray.push(queryData);
/*
            if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                ) {
                queryDataArray.push(queryData);
            }
            else {
                console.log("The alignment data can NOT be retrieved for the pair " + chainidpairArray[index] + "...");
                //return;
                queryDataArray.push([]);
            }
*/            
        }

        //src/internal/structure/MMDBUpdateTools/Interactions/compbu/comparebuEngine.cpp
        //  Doing a new comparison; remove any existing results.
        let m_qpMatrixDist = [];

        let outlier = 1.0, maxDist = 0;

        let bAligned = false;
        for(let i = 0, il = chainidpairArray.length; i < il; ++i) {
            let vdist = [];
            if(queryDataArray[i].length > 0) bAligned = true;

            for(let j = 0, jl = chainidpairArray.length; j < jl; ++j) {
                let result = this.RotMatrixTransDist(queryDataArray[i][0], queryDataArray[j][0], outlier, vastplusAtype);

                // 1.0: not aligned
                let dist = (i == j) ? 0.0 : ( (queryDataArray[i].length == 0 || queryDataArray[j].length == 0) ? 1.0 : result);
                //if(dist < outlier && dist > maxDist) {
                if(dist > maxDist) {
                    maxDist = dist;
                }
                vdist.push(dist);                
            }

            m_qpMatrixDist.push(vdist);
        }

        if(!bAligned) {
            if(ic.bRender) alert("These structures can not be aligned...");
            return;
        }

        if(maxDist < 1e-6) maxDist = 1;

        // normalize the score matrix
        for(let i = 0, il = chainidpairArray.length; i < il; ++i) {
            for(let j = 0, jl = chainidpairArray.length; j < jl; ++j) {
                m_qpMatrixDist[i][j] = m_qpMatrixDist[i][j] / maxDist;
            }
        }
        
        // cluster
        let threshold = 1.0;

        let bLastTiedValue = false;
        let m_clusteringResult = this.clusterLinkage(threshold, m_qpMatrixDist, bLastTiedValue);

        let m_buChainMap = this.GetChainMappings(m_clusteringResult, chainidpairArray);

        //  By default, clusters populate m_buChainMap in order of increasing score.
        let allnodesHash = {};
        for (let i = 0, il = m_buChainMap.length; i < il; ++i) {
            let nodeArray = m_buChainMap[i].nodeArray;
            let allnodes = nodeArray.join(',');

            // use the sum of all pairs
            // let sum = 0;
            // for(let j = 0, jl = nodeArray.length; j < jl; ++j) {
            //     let chainindexArray = node2chainindex[parseInt(nodeArray[j])];
            //     sum += m_qpMatrixDist[chainindexArray[0]][chainindexArray[1]];
            // }

            // use the best match
            let chainindexArray = node2chainindex[parseInt(nodeArray[0])];
            let sum = m_qpMatrixDist[chainindexArray[0]][chainindexArray[1]];           

            if(!allnodesHash[allnodes]) {
                allnodesHash[allnodes] = sum;
            }
            else if(sum < allnodesHash[allnodes]) {
                allnodesHash[allnodes] = sum;
            }
        }

        // sort the hash by value, then sort by key
        let allnodesArray = Object.keys(allnodesHash).sort((key1, key2) => (allnodesHash[key1] < allnodesHash[key2]) ? -1 : ( (parseInt(10000*allnodesHash[key1]) == parseInt(10000*allnodesHash[key2])) ? ( (key1 < key2) ? -1 : 1 ) : 1 ));

        let badRmsd = parseInt($("#" + me.pre + "maxrmsd").val());
        if(!badRmsd) badRmsd = 30;
        
        bAligned = false;

        for(let i = 0, il = allnodesArray.length; i < il; ++i) {
            let nodeArray = allnodesArray[i].split(',');

            ic.opts['color'] = 'grey';
            ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

            // get the mapped coords
            let coor_t = [], coor_q = [];
            let chainid_t, chainid_q;
            let hAtomsAll = {};

            // reinitialize the alignment
            $("#" + ic.pre + "dl_sequence2").html('');

            for(let j = 0, jl = nodeArray.length; j < jl; ++j) {
                let node = parseInt(nodeArray[j]);
                let segs = queryDataArray[node][0].segs;
                let chainidArray = chainidpairArray[node].split(',');

                chainid_t = chainidArray[0];
                chainid_q = chainidArray[1];

                let resiArrays = this.getResisFromSegs(segs);
                let resiArray_t = resiArrays.resiArray_t;
                let resiArray_q = resiArrays.resiArray_q;

                //let base = parseInt(ic.chainsSeq[chainid_t][0].resi);
                let result_t = ic.realignParserCls.getSeqCoorResid(resiArray_t, chainid_t);
                coor_t = coor_t.concat(result_t.coor);

                //base = parseInt(ic.chainsSeq[chainid_q][0].resi);
                let result_q = ic.realignParserCls.getSeqCoorResid(resiArray_q, chainid_q);
                coor_q = coor_q.concat(result_q.coor);

                // align seq 
                ic.qt_start_end = [];
                ic.qt_start_end.push(segs);
                let bVastplus = true, bRealign = true;
                let hAtomsTmp = ic.chainalignParserCls.setMsa(chainidArray, bVastplus, bRealign);
                hAtomsAll = me.hashUtilsCls.unionHash(hAtomsAll, hAtomsTmp);
            }

            ic.hAtoms = me.hashUtilsCls.cloneHash(hAtomsAll);

            // ic.opts['color'] = 'identity';
            // ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

            // align residue by residue
            let n =(coor_q.length < coor_t.length) ? coor_q.length : coor_t.length;
   
            if(n < 4) continue;

            if(n >= 4) {
                ic.rmsd_suprTmp = me.rmsdSuprCls.getRmsdSuprCls(coor_q, coor_t, n);
     
                // superpose
                if(ic.rmsd_suprTmp.rot !== undefined) {
                    let rot = ic.rmsd_suprTmp.rot;
                    if(rot[0] === null) continue;
      
                    let centerFrom = ic.rmsd_suprTmp.trans1;
                    let centerTo = ic.rmsd_suprTmp.trans2;
                    let rmsd = ic.rmsd_suprTmp.rmsd;

                    if(rmsd < badRmsd) {
                        bAligned = true;

                        me.htmlCls.clickMenuCls.setLogCmd("realignment RMSD: " + rmsd.toPrecision(4), false);
                        $("#" + ic.pre + "dl_rmsd_html").html("<br><b>Realignment RMSD</b>: " + rmsd.toPrecision(4) + " &#8491;<br><br>");
                        if(!me.cfg.bSidebyside) me.htmlCls.dialogCls.openDlg('dl_rmsd', 'Realignment RMSD');

                        // apply matrix for each atom                       
                        ic.q_rotation = [];
                        ic.q_trans_sub = [];
                        ic.t_trans_add = [];

                        ic.q_rotation.push({x1: rot[0], y1: rot[1], z1: rot[2], x2: rot[3], y2: rot[4], z2: rot[5], x3: rot[6], y3: rot[7], z3: rot[8]});
                        ic.q_trans_sub.push(centerFrom);
                        ic.t_trans_add.push({x: -centerTo.x, y: -centerTo.y, z: -centerTo.z});

                        me.cfg.aligntool = 'vast'; //!= 'tmalign';
                        let index = 0, alignType = 'query';
                        let mmdbid_q = chainid_q.substr(0, chainid_q.indexOf('_'));
                        let bForce = true;
                        ic.chainalignParserCls.transformStructure(mmdbid_q, index, alignType, bForce);

                        let chainpairStr = '';
                        for(let j = 0, jl = nodeArray.length; j < jl; ++j) {
                            chainpairStr += chainidpairArray[parseInt(nodeArray[j])] + '; ';
                        }
                        if(!me.bNode) console.log("Selected the alignment: " + chainpairStr);

                        break;
                    }
                    else {
                        let chainpairStr = '';
                        for(let j = 0, jl = nodeArray.length; j < jl; ++j) {
                            chainpairStr += chainidpairArray[parseInt(nodeArray[j])] + '; ';
                        }
                        if(!me.bNode) console.log("skipped the alignment: " + chainpairStr);
                    }
                }
            }
        }

        if(!bAligned) {
            if(ic.bRender) alert("These structures can not be aligned...");
            return;
        }
    }

    // src/internal/structure/MMDBUpdateTools/Interactions/compbu/qaAlignment.cpp
    RotMatrixTransDist(qpa1, qpa2, outlier, vastplusAtype) { let ic = this.icn3d, me = ic.icn3dui;
        let cosval = 0.866, lenval = 8.0; 

        if(!qpa1 || !qpa2) return outlier;
        
        let rmat1 = this.GetRotMatrix(qpa1, 1.0, vastplusAtype);
        let rmat2 = this.GetRotMatrix(qpa2, 1.0, vastplusAtype);
        let tA1 = [], tA2 = [], tB1 = [], tB2 = [];
        tA1[0] = rmat1[9];  // qpa1.t1x;
        tA1[1] = rmat1[10]; // qpa1.t1y;
        tA1[2] = rmat1[11]; // qpa1.t1z;
        tA2[0] = rmat1[12]; // qpa1.t2x;
        tA2[1] = rmat1[13]; // qpa1.t2y;
        tA2[2] = rmat1[14]; // qpa1.t2z;
        tB1[0] = rmat2[9];  // qpa2.t1x;
        tB1[1] = rmat2[10]; // qpa2.t1y;
        tB1[2] = rmat2[11]; // qpa2.t1z;
        tB2[0] = rmat2[12]; // qpa2.t2x;
        tB2[1] = rmat2[13]; // qpa2.t2y;
        tB2[2] = rmat2[14]; // qpa2.t2z;
        let vecl = [], vecr = [];
        vecl[0] = tA2[0] - tB2[0];
        vecl[1] = tA2[1] - tB2[1];
        vecl[2] = tA2[2] - tB2[2];
        vecr[0] = tA1[0] - tB1[0];
        vecr[1] = tA1[1] - tB1[1];
        vecr[2] = tA1[2] - tB1[2];
    
        let sum = 0.0, l1, l2;
        sum += Math.pow(vecl[0], 2);
        sum += Math.pow(vecl[1], 2);
        sum += Math.pow(vecl[2], 2);
        l1 = Math.sqrt(sum);
        sum = 0.0;
        sum += Math.pow(vecr[0], 2);
        sum += Math.pow(vecr[1], 2);
        sum += Math.pow(vecr[2], 2);
        l2 = Math.sqrt(sum);

        // l1 == 0.0 or l2 == 0.0 may occur, if two of the molecules are the same
        if(vastplusAtype != 2) { // VAST
            if ((l1 < 1e-10) || (l2 < 1e-10)) {
                return outlier;
            }
        }
        else {
            if (l2 < 1e-10) {
                return outlier;
            }
        }
 
        if (Math.abs(l1 - l2) > lenval) {
            return outlier;
        }

        // additional check!
        let vecr0 = [];
        vecr0[0] = rmat1[0]*tA1[0] + rmat1[1]*tA1[1] + rmat1[2]*tA1[2];
        vecr0[1] = rmat1[3]*tA1[0] + rmat1[4]*tA1[1] + rmat1[5]*tA1[2];
        vecr0[2] = rmat1[6]*tA1[0] + rmat1[7]*tA1[1] + rmat1[8]*tA1[2];
        vecr0[0] -= rmat1[0]*tB1[0] + rmat1[1]*tB1[1] + rmat1[2]*tB1[2];
        vecr0[1] -= rmat1[3]*tB1[0] + rmat1[4]*tB1[1] + rmat1[5]*tB1[2];
        vecr0[2] -= rmat1[6]*tB1[0] + rmat1[7]*tB1[1] + rmat1[8]*tB1[2];
        let dot0 = 0.0;
        dot0 = vecl[0]*vecr0[0];
        dot0 += vecl[1]*vecr0[1];
        dot0 += vecl[2]*vecr0[2];
        dot0 /= (l1*l2);

        if (dot0 < cosval) {
            return outlier;
        }

        // additional check!
        vecr0[0] = rmat2[0]*tA1[0] + rmat2[1]*tA1[1] + rmat2[2]*tA1[2];
        vecr0[1] = rmat2[3]*tA1[0] + rmat2[4]*tA1[1] + rmat2[5]*tA1[2];
        vecr0[2] = rmat2[6]*tA1[0] + rmat2[7]*tA1[1] + rmat2[8]*tA1[2];
        vecr0[0] -= rmat2[0]*tB1[0] + rmat2[1]*tB1[1] + rmat2[2]*tB1[2];
        vecr0[1] -= rmat2[3]*tB1[0] + rmat2[4]*tB1[1] + rmat2[5]*tB1[2];
        vecr0[2] -= rmat2[6]*tB1[0] + rmat2[7]*tB1[1] + rmat2[8]*tB1[2];
        dot0 = vecl[0]*vecr0[0];
        dot0 += vecl[1]*vecr0[1];
        dot0 += vecl[2]*vecr0[2];
        dot0 /= (l1*l2);

        if (dot0 < cosval) {
            return outlier;
        }

        sum = 0.0;
        sum += Math.pow(qpa1.q_rotation.x1 - qpa2.q_rotation.x1, 2);
        sum += Math.pow(qpa1.q_rotation.y1 - qpa2.q_rotation.y1, 2);
        sum += Math.pow(qpa1.q_rotation.z1 - qpa2.q_rotation.z1, 2);
        sum += Math.pow(qpa1.q_rotation.x2 - qpa2.q_rotation.x2, 2);
        sum += Math.pow(qpa1.q_rotation.y2 - qpa2.q_rotation.y2, 2);
        sum += Math.pow(qpa1.q_rotation.z2 - qpa2.q_rotation.z2, 2);
        sum += Math.pow(qpa1.q_rotation.x3 - qpa2.q_rotation.x3, 2);
        sum += Math.pow(qpa1.q_rotation.y3 - qpa2.q_rotation.y3, 2);
        sum += Math.pow(qpa1.q_rotation.z3 - qpa2.q_rotation.z3, 2);
   
        return Math.sqrt(sum);
    }
    
    GetRotMatrix(qpa, scaleFactor, vastplusAtype) { let ic = this.icn3d, me = ic.icn3dui;
        let result = [];
        if (result) {
            result[0] = qpa.q_rotation.x1 / scaleFactor;
            result[1] = qpa.q_rotation.y1 / scaleFactor;
            result[2] = qpa.q_rotation.z1 / scaleFactor;
            result[3] = qpa.q_rotation.x2 / scaleFactor;
            result[4] = qpa.q_rotation.y2 / scaleFactor;
            result[5] = qpa.q_rotation.z2 / scaleFactor;
            result[6] = qpa.q_rotation.x3 / scaleFactor;
            result[7] = qpa.q_rotation.y3 / scaleFactor;
            result[8] = qpa.q_rotation.z3 / scaleFactor;
            
            if(vastplusAtype != 2) { // VAST
                result[9] = qpa.t_trans_add.x / scaleFactor;
                result[10] = qpa.t_trans_add.y / scaleFactor;
                result[11] = qpa.t_trans_add.z / scaleFactor;
                result[12] = -qpa.q_trans_sub.x / scaleFactor;
                result[13] = -qpa.q_trans_sub.y / scaleFactor;
                result[14] = -qpa.q_trans_sub.z / scaleFactor;
            }
            else {
                //TM-align
                result[9] = -qpa.q_trans_add.x / scaleFactor;
                result[10] = -qpa.q_trans_add.y / scaleFactor;
                result[11] = -qpa.q_trans_add.z / scaleFactor;
                result[12] = 0;
                result[13] = 0;
                result[14] = 0;
            }
        }
        
        return result;
    }

    cbu_dist( v1, v2, vvDist)  {
        return (v1 < v2) ?  vvDist[v1][v2] : vvDist[v2][v1];
    }  
    
    compareFloat(cumul, node1, node2 )  {
        // let v1 = cumul[node1].joinDist;
        // let v2 = cumul[node2].joinDist;
        let v1 = cumul[node1].dist;
        let v2 = cumul[node2].dist;

        if(parseInt(10000 * v1) == parseInt(10000 * v2)) {
            return 0;
        }
        else if(parseInt(10000 * v1) < parseInt(10000 * v2)) {
            return -1;
        }
        else {
            return 1;
        }
    } 

    //  This method has been adapted from the code at:
    //  src/internal/structure/PubChem/graphicsapi/graphicsapi.cpp
    // ref: Olson CF, 1995, Parallel algorithms for hierarchical clustering.
    // http://linkinghub.elsevier.com/retrieve/pii/016781919500017I
    
    // single linkage method
    clusterLinkage(threshold, distmat, bLastTiedValue) { let ic = this.icn3d, me = ic.icn3dui;
        let cumul = [];
    
        let CBU_ROOT = -1, CBU_TERMINAL = -2, CBU_MAX_DIST = 2;

        let i, j, n = distmat.length;

        let oriNode, selI, selJ, count;

        let distTmp, distPair, maxDist = 2.0;

        for(i = 0; i < 2*n - 1; ++i) {
            cumul[i] = {};
            cumul[i].leaves = []; // array of array
        }
    
        // make a matrix to hold the dynamic distance
        let vvDist = [];
        for(i = 0; i < 2*n - 1; ++i) {
            vvDist[i] = [];
            for(j = 0; j < 2*n - 1; ++j) {
                vvDist[i][j] = maxDist;
            }
        }
    
        for(i = 0; i < n; ++i) {
            for(j = i; j < n; ++j) {
                vvDist[i][j] = distmat[i][j];
            }
        }

        // for each curernt nodes, assign its nearest neighbor and the distance
        let mNearestNB = {}, mNearestNBCopy = {}, mNearestNBDist = {};
    
        selI = n;
        selJ = n;
        for(i = 0; i < n; ++i) {
            distTmp = maxDist;
            for(j = 0; j < n; ++j) {
                let bComp = (bLastTiedValue) ? (parseInt(10000 * this.cbu_dist(i, j, vvDist)) <= parseInt(10000 * distTmp)) : (parseInt(10000 * this.cbu_dist(i, j, vvDist)) < parseInt(10000 * distTmp));
                if(j != i && bComp) {
                    distTmp = this.cbu_dist(i, j, vvDist);
                    selI = i;
                    selJ = j;
                }
            }
    
            mNearestNB[selI] = selJ;
            mNearestNBDist[selI] = distTmp;
        }

        let childDist = []; // the distance between its children
    
        for(count=0; count < n; ++count){
            cumul[count].child1     = CBU_TERMINAL;
            cumul[count].child2     = CBU_TERMINAL;
            cumul[count].parent     = count;
            cumul[count].dist       = 0.0;
            cumul[count].leaves.push([count]);
            childDist[count]     = 0.0;
        }

        let structArray = Object.keys(ic.structures);
        let nChain1 = ic.structures[structArray[0]].length;
        let nChain2 = ic.structures[structArray[1]].length;
        let nChain = (nChain1 < nChain2) ? nChain1 : nChain2;

        for(count = n; count < 2*n-1; ++count) {
            // find the min dist
            distTmp = maxDist;
            for(oriNode in mNearestNB) {
                distPair = mNearestNBDist[oriNode];
                if(distPair < distTmp) {
                    distTmp = distPair;
                    selI = oriNode;
                    selJ = mNearestNB[oriNode];
                }
            }

            let distance = distTmp;

            // update the nodes
            cumul[count].child1 = (selI < n) ? selI : -selI;
            cumul[count].child2 = (selJ < n) ? selJ : -selJ;
            cumul[count].parent = -1 * count;

            // distance of its two children
            cumul[selI].dist = distance - childDist[selI];
            cumul[selJ].dist = distance - childDist[selJ];
            childDist[count] = distance;

            // update the dist matrix for the current one "count"
            for(j = 0; j < 2*n - 1; ++j) {
                let v1 = this.cbu_dist(selI, j, vvDist);
                let v2 = this.cbu_dist(selJ, j, vvDist);
                if(count < j) vvDist[count][j] = (v1 < v2) ? v1 : v2;
                else vvDist[j][count] = (v1 < v2) ? v1 : v2;
            }

            // assign the connected nodes with maxDist
            for(j = 0; j < 2*n - 1; ++j) {
                if(selI < j) vvDist[selI][j] = maxDist;
                else vvDist[j][selI] = maxDist;

                if(selJ < j) vvDist[selJ][j] = maxDist;
                else vvDist[j][selJ] = maxDist;
            }

            let factor = 4; // 2-4 fold more chains/alignments
            if(cumul[selI].leaves.length < factor * nChain && cumul[selJ].leaves.length < factor * nChain) {
                cumul[count].leaves = [];
                
                for(let i = 0, il = cumul[selI].leaves.length; i < il; ++i) {
                    for(let j = 0, jl = cumul[selJ].leaves.length; j < jl; ++j) {
                        // let nodeI = cumul[selI].leaves[i][0];
                        // let nodeJ = cumul[selJ].leaves[j][0];

                        // skip non-similar alignments
                        // if(cumul[selI].dist > threshold) {
                        //     cumul[count].leaves.push(cumul[selJ].leaves[j]);
                        // } else if(cumul[selJ].dist > threshold) {
                        //     cumul[count].leaves = [];
                        // }
                        // else {
                            
                            // if(this.compareFloat(cumul, nodeI, nodeJ) == 0) {
                            //     cumul[count].leaves.push(cumul[selI].leaves[i].concat(cumul[selJ].leaves[j]));
                            //     cumul[count].leaves.push(cumul[selJ].leaves[j].concat(cumul[selI].leaves[i]));
                            // }
                            // else if(this.compareFloat(cumul, nodeI, nodeJ) == -1) {
                            //     cumul[count].leaves.push(cumul[selI].leaves[i].concat(cumul[selJ].leaves[j]));
                            // }
                            // else if(this.compareFloat(cumul, nodeI, nodeJ) == 1) {
                            //     cumul[count].leaves.push(cumul[selJ].leaves[j].concat(cumul[selI].leaves[i]));
                            // }

                            cumul[count].leaves.push(cumul[selI].leaves[i].concat(cumul[selJ].leaves[j]));
                            cumul[count].leaves.push(cumul[selJ].leaves[j].concat(cumul[selI].leaves[i]));

                        // }
                    }
                }

                cumul[selI].leaves = [];
                cumul[selJ].leaves = [];
            }
            
            // update mNearestNB and mNearestNBDist
            delete mNearestNB[selI];
            delete mNearestNB[selJ];

            delete mNearestNBDist[selI];
            delete mNearestNBDist[selJ];

            // replace previous node with the new merged one
            mNearestNBCopy = me.hashUtilsCls.cloneHash(mNearestNB);
            for(oriNode in mNearestNBCopy) {
                if(mNearestNBCopy[oriNode] == selI || mNearestNBCopy[oriNode] == selJ) {
                    delete mNearestNB[oriNode];
                    mNearestNB[oriNode] = count;
                }
            }

            // calculate the nearest neighbor of the current node
            let selNode = 2*n;
            distTmp = maxDist;
            for(j = 0; j < 2*n - 1; ++j) {
                if(j != count && this.cbu_dist(count, j, vvDist) < distTmp) {
                    distTmp = this.cbu_dist(count, j, vvDist);
                    selNode = j;
                }
            }

            mNearestNB[count] = selNode;
            mNearestNBDist[count] = distTmp;
        }

        if (count == 2*n - 1) {
            cumul[count-1].parent = CBU_ROOT;
            cumul[count-1].dist = 0.0;
        }

        return cumul;
    }

    GetChainMappings(m_clusteringResult, chainidpairArray) { let ic = this.icn3d, me = ic.icn3dui;
        let mappings = [];
    
        let isClusterOk;
        let nQpAligns = chainidpairArray.length;
        let chain1a, chain2a;
    
        let result = this.getClusters(m_clusteringResult, true);
        //let clusterScores = result.scores;
        let clusters = result.clusters;
        let nClusters = clusters.length;

        for(let i = 0; i < nClusters; ++i) {
            //isClusterOk = true;       

            let leavesArray = clusters[i];        
            for(let j = 0, jl = leavesArray.length; j < jl; ++j) {
                let bucm = {};
                //bucm.score = clusterScores[i];
                bucm.nodeArray = [];
  
                let chainSet1 = {}, chainSet2 = {};

                for(let k = 0, kl = leavesArray[j].length; k < kl; ++k) {
                    let node1 = leavesArray[j][k];

                    // if (node < nQpAligns) {
                        let chainArray1 = chainidpairArray[node1].split(',');
                        chain1a = chainArray1[0];
                        chain2a = chainArray1[1];
                        
                        // if (chainSet1.hasOwnProperty(chain1)) continue;
                        if (chainSet1.hasOwnProperty(chain1a) || chainSet2.hasOwnProperty(chain2a)) continue;
                        
                        bucm.nodeArray.push(node1.toString().padStart(5, '0'));
            
                        chainSet1[chain1a] = 1;
                        chainSet2[chain2a] = 1;
                    // } 
                    // else {
                    //     isClusterOk = false;
                    //     console.log("Skipping cluster");
                    //     break;
                    // }
                }
        
                //if (isClusterOk) {
                    mappings.push(bucm);
                //}
            }           
        }
        
        return mappings;
    }
    
    getClusters(tree, includeSingletons) { let ic = this.icn3d, me = ic.icn3dui;
        let clusters = [], scores = [];

        let result = 0;
        let i = 0, n = tree.length;
        let minClusterSize = (includeSingletons) ? 0 : 1;
    
        for (; i < n; ++i) {
            if (tree[i].leaves.length > minClusterSize) {
                clusters.push(tree[i].leaves);
                scores.push(tree[i].dist);
            }
        }

        return {"clusters": clusters, "scores": scores};
    }
}

export {Vastplus}
