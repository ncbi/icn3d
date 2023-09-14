/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ChainalignParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async downloadChainalignmentPart2(data1, data2Array, chainresiCalphaHash2, chainidArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let hAtoms = {}, hAtomsTmp = {};
        let mmdbid_t, mmdbid_q;
        mmdbid_t = chainidArray[0].substr(0, chainidArray[0].indexOf('_'));
        let bLastQuery = false;
        if(mmdbid_t.length > 5) { 
            let bAppend = false, bNoDssp = true;
            hAtoms = await ic.pdbParserCls.loadPdbData(data1, mmdbid_t, false, bAppend, 'target', bLastQuery, bNoDssp);
        }
        else {
            let bNoSeqalign = true;
            hAtoms = await ic.mmdbParserCls.parseMmdbData(data1, 'target', chainidArray[0], 0, bLastQuery, bNoSeqalign);
        }

        for(let i = 0, il = data2Array.length; i < il; ++i) {
            if(i == data2Array.length - 1) bLastQuery = true;
            // each alignment has a chainIndex i
            mmdbid_q = chainidArray[i + 1].substr(0, chainidArray[i + 1].indexOf('_'));
            //mmdbid_q = (mmdbid_q_tmp.length == 5) ? mmdbid_q_tmp.substr(0, 4) : mmdbid_q_tmp; // added postfixfor same PDB IDs

            //if(mmdbid_q.length > 4) {
            if(mmdbid_q.length > 5) {  // PDB ID plus postfix could be 5 
                let bAppend = true, bNoDssp = true;
                hAtomsTmp = await ic.pdbParserCls.loadPdbData(data2Array[i], mmdbid_q, false, bAppend, 'query', bLastQuery, bNoDssp);
            }
            else {
                let bNoSeqalign = true;
                hAtomsTmp = await ic.mmdbParserCls.parseMmdbData(data2Array[i], 'query', chainidArray[i + 1], i, bLastQuery, bNoSeqalign);
            }
            hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
        }

        if(me.cfg.resnum) {
            await ic.realignParserCls.realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray);
        }
        else if(me.cfg.resdef) {
            await ic.realignParserCls.realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray, undefined, true);
        }
        else {
            // calculate secondary structures with applyCommandDssp
            //$.when(ic.pdbParserCls.applyCommandDssp(true)).then(function() {
                await ic.pdbParserCls.applyCommandDssp(true);

                // align PDB chains
                for(let index in ic.pdbChainIndexHash) {
                    let idArray = ic.pdbChainIndexHash[index].split('_');
                    mmdbid_q = idArray[0];
                    let chain_q = idArray[1];
                    mmdbid_t = idArray[2];
                    let chain_t = idArray[3];

                    thisClass.transformStructure(mmdbid_q, index-1, 'query');                
                }

                // dynamicly align pairs in ic.afChainIndexHash
                let ajaxArray = [], indexArray = [], struArray = [];
                let urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi";
                let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";

                for(let index in ic.afChainIndexHash) {
                    let idArray = ic.afChainIndexHash[index].split('_');
                    mmdbid_q = idArray[0];
                    let chain_q = idArray[1];
                    mmdbid_t = idArray[2];
                    let chain_t = idArray[3];

                    let alignAjax;
                    if(me.cfg.aligntool != 'tmalign') {
                        let jsonStr_q = ic.domain3dCls.getDomainJsonForAlign(ic.chains[mmdbid_q + '_' + chain_q]);
                        let jsonStr_t = ic.domain3dCls.getDomainJsonForAlign(ic.chains[mmdbid_t + '_' + chain_t]);
                            
                        let dataObj = {'domains1': jsonStr_q, 'domains2': jsonStr_t};
                        alignAjax = me.getAjaxPostPromise(urlalign, dataObj);
                    }
                    else {
                        let pdb_query = ic.saveFileCls.getAtomPDB(ic.chains[mmdbid_q + '_' + chain_q]);
                
                        let pdb_target= ic.saveFileCls.getAtomPDB(ic.chains[mmdbid_t + '_' + chain_t]);

                        let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target};
                        alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);                
                    }

                    ajaxArray.push(alignAjax);
                    indexArray.push(index - 1);
                    struArray.push(mmdbid_q);
                }

                let allPromise = Promise.allSettled(ajaxArray);
                // try {
                    let dataArray = await allPromise;
                    await thisClass.downloadChainalignmentPart2b(chainresiCalphaHash2, chainidArray, hAtoms, dataArray, indexArray, mmdbid_t, struArray);
                // }
                // catch(err) {
                //     if(ic.bRender) alert("These structures can NOT be aligned to each other...");
                // }                  
            //});
        }
    }

    async downloadChainalignmentPart2b(chainresiCalphaHash2, chainidArray, hAtoms, dataArray, 
        indexArray, mmdbid_t, struArray) { let ic = this.icn3d, me = ic.icn3dui;
        //let bTargetTransformed = (ic.qt_start_end[0]) ? true : false;

        // modify the previous trans and rotation matrix
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            // let align = (me.bNode) ? dataArray[i] : dataArray[i].value;//[0];
            let align = dataArray[i].value;//[0];

            let mmdbid_q = struArray[i];
            let index = indexArray[i];

            let bEqualMmdbid = (mmdbid_q == mmdbid_t);
            let bEqualChain = false;

            let queryData = {}; // check whether undefined

            this.processAlign(align, index, queryData, bEqualMmdbid, bEqualChain);
        }
       
        // do not transform the target
        //if(!bTargetTransformed) {
        //    this.transformStructure(mmdbid_t, indexArray[0], 'target');
        //}

        // transform the rest
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            let mmdbid_q = struArray[i];
            let index = indexArray[i];

            this.transformStructure(mmdbid_q, index, 'query');
        }

        let hAtomsTmp = {}, hAtomsAll = {};

        if(ic.bFullUi && ic.q_rotation !== undefined && !me.cfg.resnum && !me.cfg.resdef) {
            // set multiple sequence alignment from ic.qt_start_end
            hAtomsAll = this.setMsa(chainidArray);
        }

        // highlight all aligned atoms
        //ic.hAtoms = me.hashUtilsCls.cloneHash(hAtomsTmp);
        ic.hAtoms = me.hashUtilsCls.cloneHash(hAtomsAll);

        ic.transformCls.zoominSelection();

        // do the rest
        await this.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, ic.hAtoms);
    }

    setMsa(chainidArray, bVastplus, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        // get aligned length for each pair
        let index_alignLen = [];
        for(let index = 1, indexl = chainidArray.length; index < indexl; ++index) {
            let alignLen = 0;
            if(ic.qt_start_end && ic.qt_start_end[index - 1]) {
                for(let i = 0, il = ic.qt_start_end[index - 1].length; i < il; ++i) { 
                    alignLen += parseInt(ic.qt_start_end[index - 1][i].q_end) - parseInt(ic.qt_start_end[index - 1][i].q_start) + 1;
                }
            }
            index_alignLen.push({index: index, alignLen: alignLen});
        }
        index_alignLen.sort(function(a,b){
            return b.alignLen - a.alignLen;
        });

        let hAtomsAll = ic.setSeqAlignCls.setSeqAlignChainForAll(chainidArray, index_alignLen, bRealign);

        if(bVastplus) {
            ic.opts['color'] = 'identity';
            ic.setColorCls.setColorByOptions(ic.opts, hAtomsAll);
        }

        let bReverse = false;
        let seqObj = me.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, false, undefined, bReverse);
        let oriHtml = $("#" + ic.pre + "dl_sequence2").html();

        $("#" + ic.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
        $("#" + ic.pre + "dl_sequence2").width(me.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

        me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');

        return hAtomsAll;
    }

    downloadChainalignmentPart2bRealign(dataArray, chainidPairArray, bReverse) { let ic = this.icn3d, me = ic.icn3dui;
        // set trans and rotation matrix
        ic.t_trans_add = [];
        ic.q_trans_sub = [];

        if(me.cfg.aligntool == 'tmalign') ic.q_trans_add = [];

        ic.q_rotation = [];
        ic.qt_start_end = [];

        let mmdbid2cnt = {}, mmdbidpairHash = {};

        let bFoundAlignment = false;
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            // let align = (me.bNode) ? dataArray[i] : dataArray[i].value;//[0];
            let align = dataArray[i].value;//[0];

            let bEqualMmdbid = false;
            let bEqualChain = false;

            let queryData = {}; // check whether undefined

            let chainpair = chainidPairArray[i].split(',');
            let mmdbid1 = chainpair[0].substr(0, chainpair[0].indexOf('_'));
            let mmdbid2 = chainpair[1].substr(0, chainpair[1].indexOf('_'));
            if(mmdbidpairHash.hasOwnProperty(mmdbid1 + '_' + mmdbid2)) { // aligned already
                continue;
            }

            let bNoAlert = true;
            let bAligned = this.processAlign(align, i, queryData, bEqualMmdbid, bEqualChain, bNoAlert);

            if(bAligned) {
                bFoundAlignment = true;

                mmdbid2cnt[mmdbid1] = (mmdbid2cnt[mmdbid1] === undefined) ? 1 : ++mmdbid2cnt[mmdbid1];
                mmdbid2cnt[mmdbid2] = (mmdbid2cnt[mmdbid2] === undefined) ? 1 : ++mmdbid2cnt[mmdbid2];

                mmdbidpairHash[mmdbid1 + '_' + mmdbid2] = chainpair + ',' + i;
            }
        }

        if(!bFoundAlignment) {
            // sometimes VAST align works for the reversed pair
            if(!bReverse) {
                ic.realignParserCls.realignOnStructAlign(true);
                return;
            }
            else {
                /// if(ic.deferredRealignByStruct !== undefined) ic.deferredRealignByStruct.resolve();
                if(ic.bRender) alert("These structures can NOT be aligned...");
                return;
            }
        }

        // find the max aligned mmdbid as mmdbid_t
        let cnt = 0, mmdbid_t;
        for(let mmdbidpair in mmdbidpairHash) {
            let mmdbidArray = mmdbidpair.split('_');
            if(mmdbid2cnt[mmdbidArray[0]] > cnt) {
                cnt = mmdbid2cnt[mmdbidArray[0]];
                mmdbid_t = mmdbidArray[0];
            }
            if(mmdbid2cnt[mmdbidArray[1]] > cnt) {
                cnt = mmdbid2cnt[mmdbidArray[1]];
                mmdbid_t = mmdbidArray[1];
            }
        }

        let aligType;
        // transform all pairs 
        let allChainidHash = {}, hAtoms = {}, alignMMdbids = {}, mmdbidpairFinalHash = {};
        for(let mmdbidpair in mmdbidpairHash) {
            let mmdbidArray = mmdbidpair.split('_');
            let chainidArray = mmdbidpairHash[mmdbidpair].split(',');
            let index = chainidArray[2];

            let target, query;
            if(mmdbid_t == mmdbidArray[0]) {
                target = mmdbidArray[0];
                query = mmdbidArray[1];
            } 
            else if(mmdbid_t == mmdbidArray[1]) {
                target = mmdbidArray[1];
                query = mmdbidArray[0];               
            }
            else {
                target = mmdbidArray[0];
                query = mmdbidArray[1];               
            }

            // If all chains align to the same target, just check the query.
            // If there are different targets, also just check the query. The taget should not appear again in the query.
            alignMMdbids[target] = 1;
              
            if(alignMMdbids.hasOwnProperty(query)) continue;
            alignMMdbids[query] = 1;

            mmdbidpairFinalHash[mmdbidpair] = mmdbidpairHash[mmdbidpair];

            // chainid1 is target
            aligType = 'target';
            this.transformStructure(target, index, aligType);

            aligType = 'query';
            this.transformStructure(query, index, aligType);

            allChainidHash[chainidArray[0]] = 1;
            allChainidHash[chainidArray[1]] = 1;

            //hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.chains[chainidArray[0]]);
            //hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.chains[chainidArray[1]]);
        }
        
        // set up the view of sequence alignment for each pair
        for(let mmdbidpair in mmdbidpairFinalHash) {                 
            if(ic.q_rotation !== undefined) {
                let chainidArrayTmp = mmdbidpairFinalHash[mmdbidpair].split(','); // chainid_chainid_index
                // switch these two chains
                let chainidArray = [chainidArrayTmp[1], chainidArrayTmp[0], chainidArrayTmp[2]];

                let hAtomsTmp = ic.setSeqAlignCls.setSeqAlignChain(undefined, undefined, chainidArray);
                hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);

                let bReverse = false;
                let seqObj = me.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, false, undefined, bReverse);
                let oriHtml = $("#" + ic.pre + "dl_sequence2").html();

                $("#" + ic.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
                $("#" + ic.pre + "dl_sequence2").width(me.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
            }
        }

        //this.downloadChainalignmentPart3(undefined, Object.keys(allChainidHash), hAtoms);

        ic.dAtoms = me.hashUtilsCls.cloneHash(hAtoms);
        ic.hAtoms = me.hashUtilsCls.cloneHash(hAtoms);

        let name = 'protein_aligned';
        ic.selectionCls.saveSelection(name, name);

        ic.opts['color'] = 'identity';
        //ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

        me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');

        ic.drawCls.draw();
        ic.transformCls.zoominSelection();
        
        ic.hlUpdateCls.updateHlAll();

        /// if(ic.deferredRealignByStruct !== undefined) ic.deferredRealignByStruct.resolve();
    }

    transformStructure(mmdbid, index, alignType, bForce) { let ic = this.icn3d, me = ic.icn3dui;
        let chainidArray = ic.structures[mmdbid];

        for(let i = 0, il = chainidArray.length; i < il; ++i) {
            for(let serial in ic.chains[chainidArray[i]]) {
                let atm = ic.atoms[serial];
                //if(ic.q_rotation !== undefined && ic.t_trans_add.length > 0 && !me.cfg.resnum && !me.cfg.resdef) {
                if(ic.q_rotation !== undefined && (bForce || (!me.cfg.resnum && !me.cfg.resdef)) ) {
                    atm = this.transformAtom(atm, index, alignType);
                }
            }
        }
    }

    transformAtom(atm, index, alignType) { let ic = this.icn3d, me = ic.icn3dui;
        if(alignType === 'target') {
            // atm.coord.x += ic.t_trans_add[index].x;
            // atm.coord.y += ic.t_trans_add[index].y;
            // atm.coord.z += ic.t_trans_add[index].z;
        }
        else if(alignType === 'query') {
            if(me.cfg.aligntool != 'tmalign') {
                atm.coord.x -= ic.q_trans_sub[index].x;
                atm.coord.y -= ic.q_trans_sub[index].y;
                atm.coord.z -= ic.q_trans_sub[index].z;
            }

            let x = atm.coord.x * ic.q_rotation[index].x1 + atm.coord.y * ic.q_rotation[index].y1 + atm.coord.z * ic.q_rotation[index].z1;
            let y = atm.coord.x * ic.q_rotation[index].x2 + atm.coord.y * ic.q_rotation[index].y2 + atm.coord.z * ic.q_rotation[index].z2;
            let z = atm.coord.x * ic.q_rotation[index].x3 + atm.coord.y * ic.q_rotation[index].y3 + atm.coord.z * ic.q_rotation[index].z3;

            if(me.cfg.aligntool != 'tmalign') {
                x -= ic.t_trans_add[index].x;
                y -= ic.t_trans_add[index].y;
                z -= ic.t_trans_add[index].z;
            }
            else {
                x += ic.q_trans_add[index].x;
                y += ic.q_trans_add[index].y;
                z += ic.q_trans_add[index].z;
            }

            atm.coord.x = x;
            atm.coord.y = y;
            atm.coord.z = z;
        }

        return atm;
    }

    async downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms) { let ic = this.icn3d, me = ic.icn3dui;
        // select all
        let allAtoms = {}
        for(let i in ic.atoms) {
            allAtoms[i] = 1;
        }
        ic.dAtoms = allAtoms;
        ic.hAtoms = allAtoms;

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // change the default color to "Identity"

        ic.opts['color'] = 'identity';
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        // memebrane is determined by one structure. But transform both structures
        if(chainresiCalphaHash2 !== undefined) ic.ParserUtilsCls.transformToOpmOriForAlign(ic.selectedPdbid, chainresiCalphaHash2, true);

        //ic.dAtoms = hAtoms;
        //ic.hAtoms = hAtoms;
        ic.hAtoms = me.hashUtilsCls.cloneHash(hAtoms);
        ic.dAtoms = me.hashUtilsCls.cloneHash(hAtoms);
        
        await ic.ParserUtilsCls.renderStructure();

        //if(ic.chainidArray.length > 2) {
        if(chainidArray.length > 2) {
            let residuesHash = ic.firstAtomObjCls.getResiduesFromAtoms(hAtoms);

            let commandname = 'protein_aligned';
            let commanddescr = 'protein aligned';
            let select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));

            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
        }

        ic.hlUpdateCls.updateHlAll();

        me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');

        if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

        ic.html2ddgm = '';

        // by default, open the seq alignment window
         //if(me.cfg.showalignseq) {
//            me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        //}

        if(me.cfg.show2d && ic.bFullUi) {
            me.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
            if(ic.bFullUi) {
                if(!ic.bChainAlign) {
                    ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
                }
                else {
                    //ic.ParserUtilsCls.set2DDiagramsForAlign(ic.inputid2.toUpperCase(), ic.inputid.toUpperCase());
                    await ic.ParserUtilsCls.set2DDiagramsForChainalign(chainidArray);
                }
            }
        }

        //if(me.deferred !== undefined) me.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    addPostfixForChainids(chainidArray) { let ic = this.icn3d, me = ic.icn3dui;
        let struct2cnt = {};
        for(let i = 0, il = chainidArray.length; i < il; ++i) {
            let chainid = chainidArray[i];
            let pos = chainid.indexOf('_');
            let struct = chainid.substr(0, pos); 
            //if(struct != ic.defaultPdbId) struct = struct.toUpperCase();

            if(!struct2cnt.hasOwnProperty(struct)) {
                struct2cnt[struct] = 1;
            }
            else {
                ++struct2cnt[struct];
            }

            struct = (struct2cnt[struct] == 1) ? struct : struct + struct2cnt[struct];

            chainidArray[i] = struct + chainid.substr(pos);
        }

        return chainidArray;
    }

    async downloadChainalignment(chainalign, resnum, resdef) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.opts['proteins'] = 'c alpha trace';

        let alignArray = chainalign.split(',');
        let domainArray = (me.cfg.domainids) ? me.cfg.domainids.split(',') : [];
        if(domainArray.length < alignArray.length) domainArray = [];

        ic.chainidArray = this.addPostfixForChainids(alignArray);

        let pos1 = alignArray[0].indexOf('_');
        ic.mmdbid_t = alignArray[0].substr(0, pos1).toUpperCase();
        ic.chain_t = alignArray[0].substr(pos1+1);

        let ajaxArray = [];
        let targetAjax;

        let url_t;
        if(ic.mmdbid_t.length > 5) {
            url_t = "https://alphafold.ebi.ac.uk/files/AF-" + ic.mmdbid_t + "-F1-model_" + ic.AFUniprotVersion + ".pdb";

            targetAjax = me.getAjaxPromise(url_t, 'text');
        }
        else {
            url_t = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&uid=" + ic.mmdbid_t;
            if(me.cfg.inpara !== undefined) url_t += me.cfg.inpara;

            targetAjax = me.getAjaxPromise(url_t, 'jsonp');
        }

        ajaxArray.push(targetAjax);

        ic.ParserUtilsCls.setYourNote(chainalign.toUpperCase() + ' in iCn3D');
        //ic.bCid = undefined;
        // define for 'align' only
        ic.pdbid_chain2title = {}
        if(ic.chainids2resids === undefined) ic.chainids2resids = {} // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

        ic.afChainIndexHash = {};
        ic.pdbChainIndexHash = {};
        for(let index = 1, indexLen = alignArray.length; index < indexLen; ++index) {
            let pos2 = alignArray[index].indexOf('_');
            let mmdbid_q_tmp = alignArray[index].substr(0, pos2).toUpperCase();
            ic.mmdbid_q = (mmdbid_q_tmp.length == 5) ? mmdbid_q_tmp.substr(0, 4) : mmdbid_q_tmp; // added postfix for same PDB IDs

            ic.chain_q = alignArray[index].substr(pos2+1);

            let url_q, queryAjax;
            if(ic.mmdbid_q.length > 5) {
                url_q = "https://alphafold.ebi.ac.uk/files/AF-" + ic.mmdbid_q + "-F1-model_" + ic.AFUniprotVersion + ".pdb";

                queryAjax = me.getAjaxPromise(url_q, 'text');
            }
            else {
                url_q = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&uid=" + ic.mmdbid_q;
                if(me.cfg.inpara !== undefined) url_q += me.cfg.inpara;

                queryAjax = me.getAjaxPromise(url_q, 'jsonp');
            }

            ajaxArray.push(queryAjax);
        }
        
        for(let index = 1, indexLen = alignArray.length; index < indexLen; ++index) {
            let pos2 = alignArray[index].indexOf('_');
            let mmdbid_q_tmp = alignArray[index].substr(0, pos2).toUpperCase();
            ic.mmdbid_q = (mmdbid_q_tmp.length == 5) ? mmdbid_q_tmp.substr(0, 4) : mmdbid_q_tmp; // added postfix for same PDB IDs

            ic.chain_q = alignArray[index].substr(pos2+1);

            if(!me.cfg.resnum && !me.cfg.resdef) {
                let chainalignFinal = ic.mmdbid_q + "_" + ic.chain_q + "," + ic.mmdbid_t + "_" + ic.chain_t;
                let domainalign = (domainArray.length > 0) ? domainArray[index] + "," + domainArray[0] : undefined;

                // TM-align (me.cfg.aligntool == 'tmalign') needs to input PDB
                if(me.cfg.aligntool != 'tmalign' && ic.mmdbid_t.length == 4 && ic.mmdbid_q.length == 4) {
                    let urlalign;
                    
                    if(domainArray.length > 0) {
                        urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?domainpairs=" + domainalign;
                    }
                    else {
                        urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?chainpairs=" + chainalignFinal;
                    }
                    
                    let alignAjax = me.getAjaxPromise(urlalign, 'jsonp');

                    ajaxArray.push(alignAjax);

                    ic.pdbChainIndexHash[index] = mmdbid_q_tmp + "_" + ic.chain_q + "_" + ic.mmdbid_t + "_" + ic.chain_t;
                }
                else {
                    // get the dynamic alignment after loading the structures
                    ic.afChainIndexHash[index] = ic.mmdbid_q + "_" + ic.chain_q + "_" + ic.mmdbid_t + "_" + ic.chain_t;
                }
            }
        }

        let allPromise = Promise.allSettled(ajaxArray);
        // try {
            let dataArray = await allPromise;
            await thisClass.parseChainAlignData(dataArray, alignArray, ic.mmdbid_t, ic.chain_t);
        // }
        // catch(err) {
        //     let serverName = (me.cfg.aligntool == 'tmalign') ? 'TM-align' : 'VAST';
         
        //     if(ic.bRender) alert("These chains can not be aligned by " + serverName + ". You can specify the residue range and try it again...");
        // }          
    }

    async parseChainAlignData(dataArray, chainidArray, mmdbid_t, chain_t) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //var dataArray =(chainidArray.length == 1) ? [data] : data;

        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        //var data2 = v2[0];
        // index = 0: the mmdb data of target
        // let targetData = (me.bNode) ? dataArray[0] : dataArray[0].value; //[0];
        let targetData = dataArray[0].value; //[0];
        let header = 'HEADER                                                        ' + mmdbid_t + '\n';
        if(isNaN(mmdbid_t) && mmdbid_t.length > 5) targetData = header + targetData;

        ic.t_trans_add = [];
        ic.q_trans_sub = [];

        if(me.cfg.aligntool == 'tmalign') ic.q_trans_add = [];

        ic.q_rotation = [];
        ic.qt_start_end = [];

        ic.mmdbidArray = [];
        ic.mmdbidArray.push(mmdbid_t);

        let queryDataArray = [];

        for(let index = 1, indexl = chainidArray.length; index < indexl; ++index) {
            // let queryData = (me.bNode) ? dataArray[index] : dataArray[index].value;//[0];
            let queryData = dataArray[index].value;//[0];

            let pos = chainidArray[index].indexOf('_');
            let mmdbid_q = chainidArray[index].substr(0, pos).toUpperCase();

            let header = 'HEADER                                                        ' + mmdbid_q + '\n';
            if(isNaN(mmdbid_q) && mmdbid_q.length > 5) queryData = header + queryData;

            if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                ) {
                ic.mmdbidArray.push(mmdbid_q);
                queryDataArray.push(queryData);
            }
            else {
                alert("The coordinate data can NOT be retrieved for the structure " + mmdbid_q + "...");
                return;
            }
        }

        let missedChainCnt = 0;
        //for(let index = chainidArray.length, indexl = dataArray.length; index < indexl; index += step) {
        for(let index = 1, indexl = chainidArray.length; index < indexl; ++index) {
            let queryData = queryDataArray[index - 1]; 

            let pos = chainidArray[index].indexOf('_');
            let mmdbid_q = chainidArray[index].substr(0, pos).toUpperCase();
            let chain_q = chainidArray[index].substr(pos+1);

            if(!me.cfg.resnum && !me.cfg.resdef) {
                let index2 = chainidArray.length + index - 1;
                if(ic.afChainIndexHash.hasOwnProperty(index)) {
                    ++missedChainCnt;

                    if(me.cfg.aligntool == 'tmalign') {
                        ic.q_trans_add[index-1] = {"x":0, "y":0, "z":0};
                    }
                    else {
                        // need to pass C-alpha coords and get transformation matrix from backend
                        ic.t_trans_add[index-1] = {"x":0, "y":0, "z":0};
                        ic.q_trans_sub[index-1] = {"x":0, "y":0, "z":0};
                    }

                    ic.q_rotation[index-1] = {"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1};
                    ic.qt_start_end[index-1] = undefined;
                }
                else {
                    // let align = (me.bNode) ? dataArray[index2 - missedChainCnt] : dataArray[index2 - missedChainCnt].value;//[0];
                    let align = dataArray[index2 - missedChainCnt].value;//[0];

                    let bEqualMmdbid = (mmdbid_q == mmdbid_t);
                    let bEqualChain = (chain_q == chain_t);

                    this.processAlign(align, index-1, queryData, bEqualMmdbid, bEqualChain);
                }
            }
        }

        ic.mmdb_data_q = queryDataArray;

        await this.loadOpmDataForChainalign(targetData, queryDataArray, chainidArray, ic.mmdbidArray);
    }

    processAlign(align, index, queryData, bEqualMmdbid, bEqualChain, bNoAlert) { let ic = this.icn3d, me = ic.icn3dui;
        let bAligned = false;

        if((!align || align.length == 0) && !bNoAlert) {
            let serverName = (me.cfg.aligntool == 'tmalign') ? 'TM-align' : 'VAST';
        
            if(ic.bRender) alert("These chains can not be aligned by " + serverName + ".");
            return bAligned;
        }

        if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
            && align !== undefined && JSON.stringify(align).indexOf('Oops there was a problem') === -1
        ) {
            if((align === undefined || align.length == 0) && bEqualMmdbid && bEqualChain) {
                ic.t_trans_add[index] = {"x":0, "y":0, "z":0};
                ic.q_trans_sub[index] = {"x":0, "y":0, "z":0};
                ic.q_rotation[index] = {"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1};
                ic.qt_start_end[index] = undefined;
            }
            else if(align === undefined || align.length == 0) {
                if(!me.cfg.command && !bNoAlert) alert('These two chains can not align to each other. ' + 'Please select sequences from these two chains in the "Sequences & Annotations" window, ' + 'and click "Realign Selection" in the "File" menu to align your selection.');

                ic.t_trans_add[index] = {"x":0, "y":0, "z":0};
                ic.q_trans_sub[index] = {"x":0, "y":0, "z":0};
                ic.q_rotation[index] = {"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1};
                ic.qt_start_end[index] = undefined;

                me.cfg.showanno = 1;
                me.cfg.showalignseq = 0;
            }
            else {
                /*
                ic.t_trans_add.push(align[0].t_trans_add);
                ic.q_trans_sub.push(align[0].q_trans_sub);
                ic.q_rotation.push(align[0].q_rotation);
                ic.qt_start_end.push(align[0].segs);
                */

                if(me.cfg.aligntool == 'tmalign') {
                    ic.q_trans_add[index] = align[0].q_trans_add;
                }
                else {
                    ic.t_trans_add[index] = align[0].t_trans_add;
                    ic.q_trans_sub[index] = align[0].q_trans_sub;
                }

                ic.q_rotation[index] = align[0].q_rotation;
                ic.qt_start_end[index] = align[0].segs;

                let rmsd = align[0].super_rmsd;

                let logStr = "alignment RMSD: " + rmsd.toPrecision(4);
                if(me.cfg.aligntool == 'tmalign') logStr += "; TM-score: " + align[0].score.toPrecision(4);
                me.htmlCls.clickMenuCls.setLogCmd(logStr, false);
                let html = "<br><b>Alignment RMSD</b>: " + rmsd.toPrecision(4) + " &#8491;<br>";
                if(me.cfg.aligntool == 'tmalign') html += "<b>TM-score</b>: " + align[0].score.toPrecision(4) + "<br><br>";
                $("#" + ic.pre + "dl_rmsd_html").html(html);
                if(!me.cfg.bSidebyside) me.htmlCls.dialogCls.openDlg('dl_rmsd', 'RMSD of alignment');

                bAligned = true;
            }
        }

        return bAligned;
    }

    async loadOpmDataForChainalign(data1, data2, chainidArray, mmdbidArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        if(me.cfg.resnum || me.cfg.resdef) {
            if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
            await this.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

            /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
        }
        else {
            let url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?mmdbids2opm=" + mmdbidArray.join("','");

            // try {
                let data = await me.getAjaxPromise(url, 'jsonp');

                if(!data || !data.mmdbid) {
                  if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                  await thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                  /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                }
                else {
                    let mmdbid = data.mmdbid;
                    ic.selectedPdbid = mmdbid;

                    let url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbid.toLowerCase()+ ".pdb";

                    // try {
                        let opmdata = await me.getAjaxPromise(url2, 'text');

                        ic.bOpm = true;
                        let bVector = true;
                        let chainresiCalphaHash = ic.loadPDBCls.loadPDB(opmdata, mmdbid, ic.bOpm, bVector); // defined in the core library

                        $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
                        $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

                        $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
                        $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

                        if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                        await thisClass.downloadChainalignmentPart2(data1, data2, chainresiCalphaHash, chainidArray);

                        /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                    // }
                    // catch(err) {
                    //     if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
                    //     await thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                    //     /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                    //     return;
                    // }
                }
            // }
            // catch(err) {
            //       if(!ic.bCommandLoad) ic.init(); // remove all previously loaded data
            //       await thisClass.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

            //       /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
            //       return;
            // }
        }
    }

    async downloadMmdbAf(idlist, bQuery, vastplusAtype) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.structArray = (ic.structures) ? Object.keys(ic.structures) : [];

        if(ic.structArray.length == 0) {
            ic.init();
        }
        else {
            ic.resetConfig();
        
            ic.bResetAnno = true;
            ic.bResetSets = true;
        }

        // ic.deferredMmdbaf = $.Deferred(function() {
        let structArrayTmp = idlist.split(',');

        let structArray = [];
        // remove redundant structures
        for(let i = 0, il = structArrayTmp.length; i < il; ++i) {
            if(!ic.structures.hasOwnProperty(structArrayTmp[i].toUpperCase())) {
                structArray.push(structArrayTmp[i]);
            }
        }
        
        if(structArray.length == 0) return;
        
        ic.structArray = ic.structArray.concat(structArray);

        let ajaxArray = [];

        for(let i = 0, il = structArray.length; i < il; ++i) {
            let url_t, targetAjax;
            let structure = structArray[i];

            if(isNaN(structure) && structure.length > 5) {
                url_t = "https://alphafold.ebi.ac.uk/files/AF-" + structure + "-F1-model_" + ic.AFUniprotVersion + ".pdb";

                targetAjax = me.getAjaxPromise(url_t, 'text');
            }
            else {
                let structureTmp = structure;
                if(structure.length == 5) {
                    structureTmp = structure.substr(0,4);
                }

                url_t = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&uid=" + structureTmp;
                if(me.cfg.inpara !== undefined) url_t += me.cfg.inpara;

                targetAjax = me.getAjaxPromise(url_t, 'jsonp');
            }

            ajaxArray.push(targetAjax);
        }

        ic.ParserUtilsCls.setYourNote(ic.structArray + ' in iCn3D');
        //ic.bCid = undefined;

        ic.ParserUtilsCls.showLoading();

        let allPromise = Promise.allSettled(ajaxArray);
        // try {
            let dataArray = await allPromise;
            await thisClass.parseMMdbAfData(dataArray, structArray, bQuery, vastplusAtype);
            if(vastplusAtype === undefined) ic.ParserUtilsCls.hideLoading();
        // }
        // catch(err) {
        //     alert("There are some problems in retrieving the coordinates...");
        // }          
    //   });
    
    //   return ic.deferredMmdbaf.promise();
    }

    async parseMMdbAfData(dataArray, structArray, bQuery, vastplusAtype) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let queryDataArray = [];
        for(let index = 0, indexl = structArray.length; index < indexl; ++index) {
            // let queryData = (me.bNode) ? dataArray[index] : dataArray[index].value;//[0];
            let queryData = dataArray[index].value;//[0];
            let header = 'HEADER                                                        ' + structArray[index] + '\n';
            if(isNaN(structArray[index]) && structArray[index].length > 5) queryData = header + queryData;

            if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                ) {
                queryDataArray.push(queryData);
            }
            else {
                alert("The coordinate data can NOT be retrieved for the structure " + structArray[index] + "...");
                return;
            }
        }

        //if(!ic.bCommandLoad && !bQuery) ic.init(); // remove all previously loaded data
        
        let hAtoms = {}, hAtomsTmp = {};
        let bLastQuery = false;

        ic.opts['color'] = (ic.structArray.length > 1) ? 'structure' : ((structArray[0].length > 5) ? 'confidence' : 'chain');

        for(let i = 0, il = structArray.length; i < il; ++i) {
            if(i == structArray.length - 1) bLastQuery = true;

            let targetOrQuery, bAppend;
            //if(i == 0 && !bQuery) {
            // check if structures were loaded before
            if(i == 0 && !bQuery && ic.structArray.length == structArray.length) {
                targetOrQuery = 'target';
                bAppend = false; 
            }
            else {
                targetOrQuery = 'query';
                bAppend = true; 
            }
            
            //if(structArray[i].length > 4) {
            if(isNaN(structArray[i]) && structArray[i].length > 5) {  // PDB ID plus postfix could be 5 
                //let bNoDssp = true;
                let bNoDssp = false; // get secondary structure info
                hAtomsTmp = await ic.pdbParserCls.loadPdbData(queryDataArray[i], structArray[i], false, bAppend, targetOrQuery, bLastQuery, bNoDssp);
            }
            else {
                let bNoSeqalign = true;
                let pdbid = structArray[i];
                hAtomsTmp = await ic.mmdbParserCls.parseMmdbData(queryDataArray[i], targetOrQuery, undefined, undefined, bLastQuery, bNoSeqalign, pdbid);
            }
                    
            hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
        }

        // parseMmdbData() didn't render structures for mmdbafid input
        if(ic.structArray.length > 1) ic.opts['color'] = 'structure';
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        
        await ic.ParserUtilsCls.renderStructure();
        if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

        if(bQuery && me.cfg.matchedchains) {          
           // $.when(ic.pdbParserCls.applyCommandDssp(true)).then(function() {
                let bRealign = true, bPredefined = true;
                await ic.realignParserCls.realignChainOnSeqAlign(undefined, ic.chainidArray, bRealign, bPredefined);
                // reset annotations
                $("#" + ic.pre + "dl_annotations").html("");
                ic.bAnnoShown = false;
                if($('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content') && $('#' + ic.pre + 'dl_selectannotations').dialog( 'isOpen' )) {
                    $('#' + ic.pre + 'dl_selectannotations').dialog( 'close' );
                }
           //});
        }
        else if(vastplusAtype !== undefined) {
            // vastplusAtype: 0: VAST, global, 1: VAST, invarant core, 2: TM-align, global
            // VAST+ on the fly
            let structArray = Object.keys(ic.structures);
            await ic.vastplusCls.vastplusAlign(structArray, vastplusAtype);
        }

        // /// if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();

        // if(Object.keys(ic.structures).length == 1 && me.cfg.mmdbafid.length > 5) {
        //     ic.ParserUtilsCls.checkMemProtein(me.cfg.mmdbafid);
        // }
        // else {
        //     /// if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();
        // }
    }
}

export {ChainalignParser}
