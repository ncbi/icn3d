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
        //ic.bResetAnno = true;

        // await ic.showAnnoCls.showAnnotations();
        if(ic.bAnnoShown) {
            for(let chain in ic.protein_chainid) {
                let chainidBase = ic.protein_chainid[chain];
                ic.showSeqCls.showSeq(chain, chainidBase, 'protein');
            }
        }
        else {
            await ic.showAnnoCls.showAnnotations();
        }

        ic.hlUpdateCls.updateHlAll();
    }
 
    setRefPdbs() { let ic = this.icn3d, me = ic.icn3dui;
        // round 1, 16 templates
        ic.refpdbArray = ['1InsulinR_8guyE_human_FN3-n1', '1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', '1CoAtomerGamma1_1r4xA_human', '1C3_2qkiD_human_n1', '1CuZnSuperoxideDismutase_1hl5C_human', '1ASF1A_2iijA_human', '1FAB-LIGHT_5esv_C1-n2', '1CD2_1hnfA_human_C2-n2', '1NaCaExchanger_2fwuA_dog_n2', '1NaKATPaseTransporterBeta_2zxeB_spurdogshark', '1FAB-HEAVY_5esv_V-n1', '1PDL1_4z18B_human_V-n1', '1BTLA_2aw2A_human_Iset', '1LaminAC_1ifrA_human', '1CD3g_6jxrg_human_Iset', '1CD28_1yjdC_human_V', '1CD19_6al5A_human_C2orV-n1'];

        // round 2
        ic.refpdbHash = {};
        ic.refpdbHash['1InsulinR_8guyE_human_FN3-n1'] = ['InsulinR_8guyE_human_FN3-n1', 'IL6Rb_1bquB_human_FN3-n3', 'Sidekick2_1wf5A_human_FN3-n7', 'InsulinR_8guyE_human_FN3-n2', 'Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n2'];
        ic.refpdbHash['1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'ICOS_6x4gA_human_V'];
        ic.refpdbHash['1CoAtomerGamma1_1r4xA_human'] = ['CoAtomerGamma1_1r4xA_human', 'TP34_2o6cA_bacteria'];
        ic.refpdbHash['1C3_2qkiD_human_n1'] = ['C3_2qkiD_human_n1', 'BArrestin1_4jqiA_rat_n1', 'RBPJ_6py8C_human_Unk-n1'];
        ic.refpdbHash['1CuZnSuperoxideDismutase_1hl5C_human'] = ['CuZnSuperoxideDismutase_1hl5C_human', 'TEAD1_3kysC_human'];
        ic.refpdbHash['1ASF1A_2iijA_human'] = ['ASF1A_2iijA_human', 'RBPJ_6py8C_human_Unk-n2', 'TP47_1o75A_bacteria'];
        ic.refpdbHash['1FAB-LIGHT_5esv_C1-n2'] = ['FAB-LIGHT_5esv_C1-n2', 'GHR_1axiB_human_FN3-n1', 'VTCN1_Q7Z7D3_human_V-n2', 'B2Microglobulin_7phrL_human_C1', 'FAB-HEAVY_5esv_C1-n2', 'MHCIa_7phrH_human_C1'];
        ic.refpdbHash['1CD2_1hnfA_human_C2-n2'] = ['CD2_1hnfA_human_C2-n2', 'Siglec3_5j0bB_human_C2-n2'];
        ic.refpdbHash['1NaCaExchanger_2fwuA_dog_n2'] = ['NaCaExchanger_2fwuA_dog_n2', 'ORF7a_1xakA_virus', 'ECadherin_4zt1A_human_n2'];
        ic.refpdbHash['1NaKATPaseTransporterBeta_2zxeB_spurdogshark'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1FAB-HEAVY_5esv_V-n1'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1', 'VNAR_1t6vN_shark_V', 'TCRa_6jxrm_human_V-n1', 'VISTA_6oilA_human_V', 'CD8a_1cd8A_human_V', 'PD1_4zqkB_human_V'];
        ic.refpdbHash['1PDL1_4z18B_human_V-n1'] = ['PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1', 'LAG3_7tzgD_human_V-n1'];
        ic.refpdbHash['1BTLA_2aw2A_human_Iset'] = ['BTLA_2aw2A_human_Iset', 'Palladin_2dm3A_human_Iset-n1', 'Titin_4uowM_human_Unk-n152', 'LAG3_7tzgD_human_C2-n2', 'JAM1_1nbqA_human_VorIset-n2', 'Contactin1_3s97C_human_C2-n2'];
        ic.refpdbHash['1LaminAC_1ifrA_human'] = ['LaminAC_1ifrA_human', 'CD3d_6jxrd_human_Iset'];
        ic.refpdbHash['1CD3g_6jxrg_human_Iset'] = ['CD3g_6jxrg_human_Iset', 'TCRa_6jxrm_human_C1-n2', 'IsdA_2iteA_bacteria'];
        ic.refpdbHash['1CD28_1yjdC_human_V'] = ['CD28_1yjdC_human_V', 'MPT63_1lmiA_bacteria', 'CD3e_6jxrf_human_Iset'];
        ic.refpdbHash['1CD19_6al5A_human_C2orV-n1'] = ['CD19_6al5A_human_C2orV-n1']; 

        // use known ref structure
        ic.refpdbHash['5ESV_C'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-HEAVY_5esv_C1-n2'];
        ic.refpdbHash['5ESV_D'] = ['FAB-LIGHT_5esv_V-n1', 'FAB-LIGHT_5esv_C1-n2'];
        ic.refpdbHash['8GUY_E'] = ['InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2'];
        ic.refpdbHash['6JXR_m'] = ['TCRa_6jxrm_human_V-n1', 'TCRa_6jxrm_human_C1-n2'];
        ic.refpdbHash['1HNF_A'] = ['CD2_1hnfA_human_V-n1', 'CD2_1hnfA_human_C2-n2'];
        ic.refpdbHash['7TZG_D'] = ['LAG3_7tzgD_human_V-n1', 'LAG3_7tzgD_human_C2-n2'];
        ic.refpdbHash['6PY8_C'] = ['RBPJ_6py8C_human_Unk-n1', 'RBPJ_6py8C_human_Unk-n2'];
        ic.refpdbHash['1BQU_B'] = ['IL6Rb_1bquB_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n3'];

        ic.refpdbHash['1R4X_A'] = ['CoAtomerGamma1_1r4xA_human'];
        ic.refpdbHash['6OIL_A'] = ['VISTA_6oilA_human_V'];
        ic.refpdbHash['2ZXE_B'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1I8A_A'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'];
        ic.refpdbHash['2FWU_A'] = ['NaCaExchanger_2fwuA_dog_n2'];
        ic.refpdbHash['4JQI_A'] = ['BArrestin1_4jqiA_rat_n1'];
        ic.refpdbHash['1NBQ_A'] = ['JAM1_1nbqA_human_VorIset-n2'];
        ic.refpdbHash['1O75_A'] = ['TP47_1o75A_bacteria'];
        ic.refpdbHash['7PHR_H'] = ['MHCIa_7phrH_human_C1'];
        ic.refpdbHash['2IIJ_A'] = ['ASF1A_2iijA_human'];
        ic.refpdbHash['4Z18_B'] = ['PDL1_4z18B_human_V-n1'];
        ic.refpdbHash['1T6V_N'] = ['VNAR_1t6vN_shark_V'];
        ic.refpdbHash['2O6C_A'] = ['TP34_2o6cA_bacteria'];
        ic.refpdbHash['3KYS_C'] = ['TEAD1_3kysC_human'];
        ic.refpdbHash['7PHR_L'] = ['B2Microglobulin_7phrL_human_C1'];
        ic.refpdbHash['2AW2_A'] = ['BTLA_2aw2A_human_Iset'];
        ic.refpdbHash['1HL5_C'] = ['CuZnSuperoxideDismutase_1hl5C_human'];
        ic.refpdbHash['1WF5_A'] = ['Sidekick2_1wf5A_human_FN3-n7'];
        ic.refpdbHash['5J0B_B'] = ['Siglec3_5j0bB_human_C2-n2'];
        ic.refpdbHash['1IFR_A'] = ['LaminAC_1ifrA_human'];
        ic.refpdbHash['Q7Z7D3_A'] = ['VTCN1_Q7Z7D3_human_V-n2'];
        ic.refpdbHash['4ZQK_B'] = ['PD1_4zqkB_human_V'];
        ic.refpdbHash['2DM3_A'] = ['Palladin_2dm3A_human_Iset-n1'];
        ic.refpdbHash['2ITE_A'] = ['IsdA_2iteA_bacteria'];
        ic.refpdbHash['1XAK_A'] = ['ORF7a_1xakA_virus'];
        ic.refpdbHash['4ZT1_A'] = ['ECadherin_4zt1A_human_n2'];
        ic.refpdbHash['1LMI_A'] = ['MPT63_1lmiA_bacteria'];
        ic.refpdbHash['1CD8_A'] = ['CD8a_1cd8A_human_V'];
        ic.refpdbHash['3S97_C'] = ['Contactin1_3s97C_human_C2-n2'];
        ic.refpdbHash['1AXI_B'] = ['GHR_1axiB_human_FN3-n1'];
        ic.refpdbHash['6X4G_A'] = ['ICOS_6x4gA_human_V'];
        ic.refpdbHash['2EE2_A'] = ['Contactin1_2ee2A_human_FN3-n9'];
        ic.refpdbHash['4UOW_M'] = ['Titin_4uowM_human_Unk-n152'];
        ic.refpdbHash['6A15_A'] = ['CD19_6al5A_human_C2orV-n1'];
        ic.refpdbHash['2QKI_D'] = ['C3_2qkiD_human_n1'];
        ic.refpdbHash['1YJD_C'] = ['CD28_1yjdC_human_V'];
        ic.refpdbHash['6JXR_d'] = ['CD3d_6jxrd_human_Iset'];
        ic.refpdbHash['6JXR_f'] = ['CD3e_6jxrf_human_Iset'];
        ic.refpdbHash['6JXR_g'] = ['CD3g_6jxrg_human_Iset'];
    }

    getPdbAjaxArray() {  let ic = this.icn3d, me = ic.icn3dui;
        let pdbAjaxArray = [];
        for(let k = 0, kl = ic.refpdbArray.length; k < kl; ++k) {
            let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + ic.refpdbArray[k];
            //let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refjsonid=" + ic.refpdbArray[k];

            let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

            pdbAjaxArray.push(pdbAjax);
        }

        return pdbAjaxArray;
    }

    async showIgRefNum(template) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        this.setRefPdbs();

        let pdbAjaxArray = this.getPdbAjaxArray();

        // try {
            if(!template) {
                //let allPromise = Promise.allSettled(pdbAjaxArray);
                //ic.pdbDataArray = await allPromise;

                ic.pdbDataArray = await this.promiseWithFixedJobs(pdbAjaxArray);

                await thisClass.parseRefPdbData(ic.pdbDataArray, template);
            }
            else {
                await thisClass.parseRefPdbData(undefined, template);
            }
        // }
        // catch(err) {
        //     if(!me.bNode) alert("Error in retrieveing reference PDB data...");
        //     return;
        // }
    }

    async parseRefPdbData(dataArray, template) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let struArray = Object.keys(ic.structures);
 
        let ajaxArray = [];
        let domainidpairArray = [];

        let urltmalign = me.htmlCls.tmalignUrl;
        // let urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi";

        if(!ic.resid2domainid) ic.resid2domainid = {};
        //ic.resid2domainid = {};
        ic.domainid2pdb = {};

        for(let i = 0, il = struArray.length; i < il; ++i) {
            let struct = struArray[i];
            let chainidArray = ic.structures[struct];

            for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
                let chainid = chainidArray[j];

                let domainAtomsArray = this.getDomainAtomsArray(chainid);
                    
                if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
                if(!ic.domainid2score) ic.domainid2score = {};

                for(let k = 0, kl = domainAtomsArray.length; k < kl; ++k) {
                    let pdb_target = ic.saveFileCls.getAtomPDB(domainAtomsArray[k], undefined, undefined, undefined, undefined, struct);
                    //let bForceOneDomain = true;
                    //let jsonStr_t = ic.domain3dCls.getDomainJsonForAlign(domainAtomsArray[k], bForceOneDomain);

                    // ig strand for any subset will have the same k, use the number of residue to separate them
                    let atomFirst = ic.firstAtomObjCls.getFirstAtomObj(domainAtomsArray[k]);
                    let atomLast = ic.firstAtomObjCls.getLastAtomObj(domainAtomsArray[k]);
                    let resiSum = atomFirst.resi + ':' + atomLast.resi;
                    //let domainid = chainid + '-' + k + '_' + Object.keys(domainAtomsArray[k]).length; 
                    let domainid = chainid + ',' + k + '_' + resiSum; 
                    ic.domainid2pdb[domainid] = pdb_target;

                    if(!template) {
                        for(let index = 0, indexl = dataArray.length; index < indexl; ++index) {
                            let struct2 = ic.defaultPdbId + index;
                            let pdb_query = dataArray[index].value; //[0];
                            let header = 'HEADER                                                        ' + struct2 + '\n';
                            pdb_query = header + pdb_query;
                            //let jsonStr_q = dataArray[index].value; //[0];

                            let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbArray[index]};
                            let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);

                            // let dataObj = {'domains1': jsonStr_q, 'domains2': jsonStr_t};
                            // let alignAjax = me.getAjaxPostPromise(urlalign, dataObj);

                            ajaxArray.push(alignAjax);
                            
                            domainidpairArray.push(domainid + "|" + ic.refpdbArray[index]);
                        }
                    }
                    else {
                        ic.domainid2refpdbname[domainid] = template;
                        domainidpairArray.push(domainid + "|1" + template); // "1" was added for the first round strand-only template
                    }
                }
            }
        }

        //try {
            if(!template) {
                let dataArray2 = [];

                // let allPromise = Promise.allSettled(ajaxArray);
                // dataArray2 = await allPromise;

                dataArray2 = await this.promiseWithFixedJobs(ajaxArray);
            
                let bRound1 = true;
                await thisClass.parseAlignData(dataArray2, domainidpairArray, bRound1);

                /// if(ic.deferredRefnum !== undefined) ic.deferredRefnum.resolve();
            }
            else {
                if(!me.bNode) console.log("Start alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));   

                // start round2
                let ajaxArray = [];
                let domainidpairArray3 = [];
                let urltmalign = me.htmlCls.tmalignUrl;

                let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + template;
                let pdbAjax = me.getAjaxPromise(urlpdb, 'text');
                let pdbAjaxArray = [];
                pdbAjaxArray.push(pdbAjax);

                //let allPromise2 = Promise.allSettled(pdbAjaxArray);
                //ic.pdbDataArray = await allPromise2;

                ic.pdbDataArray = await this.promiseWithFixedJobs(pdbAjaxArray);

                for(let domainid in ic.domainid2refpdbname) {
                    let refpdbname = ic.domainid2refpdbname[domainid];
                    let chainid = domainid.substr(0, domainid.indexOf(','));

                    let pdb_target = ic.domainid2pdb[domainid];
                    for(let index = 0, indexl = ic.pdbDataArray.length; index < indexl; ++index) {
                        let struct2 = ic.defaultPdbId + index;
                        let pdb_query = ic.pdbDataArray[index].value; //[0];

                        let header = 'HEADER                                                        ' + struct2 + '\n';
                        pdb_query = header + pdb_query;
    
                        let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": template};
                        let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);
                        ajaxArray.push(alignAjax);
                        
                        //domainidpairArray3.push(domainid + "," + refpdbname);
                        domainidpairArray3.push(domainid + "|" + template);
                    }
                }
    
                let dataArray3 = [];
                //let allPromise = Promise.allSettled(ajaxArray);
                //dataArray3 = await allPromise;

                dataArray3 = await this.promiseWithFixedJobs(ajaxArray);
    
                await thisClass.parseAlignData(dataArray3, domainidpairArray3);
            }
            /*
        }
        catch(err) {
            let mess = "Some of " + ajaxArray.length + " TM-align alignments failed. Please select a chain or a subset to assing reference numbers to avoid overloading the server...";
            if(!me.bNode) {
                alert(mess);
            }
            else {
                console.log(mess);
            }
            //console.log("Error in aligning with TM-align...");
            return;
        }        
        */           
    }

    getDomainAtomsArray(chainid) { let ic = this.icn3d, me = ic.icn3dui;
        let domainAtomsArray = [];

        let minResidues = 20;

        if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]).serial)
        && !ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getMiddleAtomObj(ic.chains[chainid]).serial)) return domainAtomsArray;
        if(ic.chainsSeq[chainid].length < minResidues) return domainAtomsArray; // peptide

        let currAtoms = me.hashUtilsCls.intHash(ic.chains[chainid], ic.hAtoms);
        if(Object.keys(currAtoms).length == 0) return domainAtomsArray;

        // align each 3D domain with reference structure
        //let result = ic.domain3dCls.c2b_NewSplitChain(ic.chains[chainid]);
        // assign ref numbers to selected residues
        let result = ic.domain3dCls.c2b_NewSplitChain(currAtoms);
        let subdomains = result.subdomains;  
        let pos2resi = result.pos2resi;

        if(subdomains.length <= 1) {
            //domainAtomsArray.push(ic.chains[chainid]);
            domainAtomsArray.push(currAtoms);

            let residueArray = ic.resid2specCls.atoms2residues(Object.keys(currAtoms));

            let atomFirst = ic.firstAtomObjCls.getFirstAtomObj(currAtoms);
            let atomLast = ic.firstAtomObjCls.getLastAtomObj(currAtoms);
            let resiSum = atomFirst.resi + ':' + atomLast.resi;

            for(let n = 0, nl = residueArray.length; n < nl; ++n) {
                let resid = residueArray[n];
                ic.resid2domainid[resid] = chainid + '-0' + '_' + resiSum; 

                // clear previous refnum assignment if any
                if(ic.resid2refnum && ic.resid2refnum[resid]) {
                    delete ic.resid2refnum[resid];
                }
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
                        let resid = chainid + '_' + pos2resi[n];
                        domainAtoms = me.hashUtilsCls.unionHash(domainAtoms, ic.residues[resid]);
                        //ic.resid2domainid[resid] = chainid + '-' + k;

                        // clear previous refnum assignment if any
                        if(ic.resid2refnum && ic.resid2refnum[resid]) {
                            delete ic.resid2refnum[resid];
                        }
                    }
                }

                domainAtomsArray.push(domainAtoms);

                let atomFirst = ic.firstAtomObjCls.getFirstAtomObj(domainAtoms);
                let atomLast = ic.firstAtomObjCls.getLastAtomObj(domainAtoms);
                let resiSum = atomFirst.resi + ':' + atomLast.resi;

                for(let m = 0, ml = segArray.length; m < ml; m += 2) {
                    let startResi = segArray[m];
                    let endResi = segArray[m+1];
                    for(let n = parseInt(startResi); n <= parseInt(endResi); ++n) {
                        let resid = chainid + '_' + pos2resi[n];
                        //domainAtoms = me.hashUtilsCls.unionHash(domainAtoms, ic.residues[resid]);
                        ic.resid2domainid[resid] = chainid + '-' + k + '_' + resiSum; 
                    }
                }
            }
        }

        return domainAtomsArray;
    }

    getTemplateList(chainid) { let ic = this.icn3d, me = ic.icn3dui;
        let domainid2refpdbname = {}, domainid2score = {};

        for(let i = 0, il = ic.chainid2refpdbname[chainid].length; i < il; ++i) {
            let refpdbname_domainid = ic.chainid2refpdbname[chainid][i].split('|');
            domainid2refpdbname[refpdbname_domainid[1]] = refpdbname_domainid[0];
        }

        for(let i = 0, il = ic.chainid2score[chainid].length; i < il; ++i) {
            let score_domainid = ic.chainid2score[chainid][i].split('|');
            domainid2score[score_domainid[1]] = score_domainid[0];
        }

        let domainidArray = Object.keys(domainid2refpdbname);
        domainidArray.sort(function(id1, id2) {
            let resi1 = parseInt(id1.substr(id1.lastIndexOf('_') + 1));
            let resi2 = parseInt(id2.substr(id2.lastIndexOf('_') + 1));
            return resi1 - resi2;
        });

        let refpdbnameList = '';
        for(let i = 0, il = domainidArray.length; i < il; ++i) {
            refpdbnameList += domainid2refpdbname[domainidArray[i]];
            if(i < il - 1) refpdbnameList += ", ";
        }

        let scoreList = '', seqidList = '', nresAlignList = '';
        for(let i = 0, il = domainidArray.length; i < il; ++i) {
            let itemArray = domainid2score[domainidArray[i]].split('_');

            scoreList += itemArray[0];
            seqidList += itemArray[1];
            nresAlignList += itemArray[2];

            if(i < il - 1) {
                scoreList += ", ";
                seqidList += ", ";
                nresAlignList += ", ";
            }
        }

        return {'refpdbnameList': refpdbnameList, 'scoreList': scoreList, 'seqidList': seqidList, 'nresAlignList': nresAlignList};
    }

    parseAlignData_part1(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
    // async parseAlignData(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
        let tmscoreThreshold = 0.4; // 0.4; //0.5;
        //let rmsdThreshold = 10;

        // find the best alignment for each chain
        let domainid2segs = {};

        if(!ic.chainid2refpdbname) ic.chainid2refpdbname = {};
        if(!ic.chainid2score) ic.chainid2score = {};
        if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
        if(!ic.domainid2score) ic.domainid2score = {};
        if(!ic.domainid2ig2kabat) ic.domainid2ig2kabat = {};
        if(!ic.domainid2ig2imgt) ic.domainid2ig2imgt = {};

        let minResidues = 20;

        for(let i = 0, il = domainidpairArray.length; i < il; ++i) {
            //let queryData = (me.bNode) ? dataArray[i] : dataArray[i].value; //[0];
            let queryData = dataArray[i].value; //[0];

            if(!queryData || queryData.length == 0) {
                if(!me.bNode) console.log("The alignment data for " + domainidpairArray[i] + " is unavailable...");
                continue;
            }
            
            //let domainid_index = domainidpairArray[i].split(',');
            //let domainid = domainid_index[0];
            let domainid = domainidpairArray[i].substr(0, domainidpairArray[i].indexOf('|'));
            let refpdbname = domainidpairArray[i].substr(domainidpairArray[i].indexOf('|') + 1);
            //let chainid = domainid.split('-')[0];

            if(!bRound1) {
                if(queryData[0].score < tmscoreThreshold || queryData[0].num_res < minResidues) {
                    if(!me.bNode) console.log("domainid " + domainid + " and refpdbname " + refpdbname + " were skipped due to a TM-score less than " + tmscoreThreshold);
                    continue;
                }
            }
            else {
                // if(queryData[0].super_rmsd > rmsdThreshold || queryData[0].num_res < minResidues) {
                //     continue;
                // }
                if(queryData[0].score < tmscoreThreshold || queryData[0].num_res < minResidues) {
                    continue;
                }
            }
            
            if(!bRound1) {
                if(!me.bNode) console.log("refpdbname " + refpdbname + " TM-score: " + queryData[0].score);
            }
            else {
                // if(!me.bNode) console.log("domainid: " + domainid + " refpdbname " + refpdbname + " RMSD: " + queryData[0].super_rmsd + ", num_seg: " + queryData[0].num_seg + ",  10/RMSD + num_seg/5: " + (10 / queryData[0].super_rmsd + queryData[0].num_seg / 5).toFixed(1));
                if(!me.bNode) console.log("domainid: " + domainid + " refpdbname " + refpdbname + " TM-score: " + queryData[0].score);
            }

            // Ig-like domains: B (2150, 2150a, 2150b), C (3150, 3250), E (7150, 7250), F (8150, 8250) strands
            // Ig domain may require G (7050). But we'll leave that out for now.
            if(!bRound1) {
                let bBstrand = false, bCstrand = false, bEstrand = false, bFstrand = false, bGstrand = false;
                for(let i = 0, il = queryData[0].segs.length; i < il; ++i) {
                    let seg = queryData[0].segs[i];

                    if(seg.q_start.indexOf('2550') != -1) {
                        bBstrand = true;
                    }
                    else if(seg.q_start.indexOf('3550') != -1) {
                        bCstrand = true;
                    }
                    else if(seg.q_start.indexOf('7550') != -1) {
                        bEstrand = true;
                    }
                    else if(seg.q_start.indexOf('8550') != -1) {
                        bFstrand = true;
                    }

                    //if(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand) break;
                    if(bBstrand && bCstrand && bEstrand && bFstrand) break;
                }

                //if(!(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand)) continue;
                if(!(bBstrand && bCstrand && bEstrand && bFstrand)) {
                    if(!me.bNode) console.log("Some of the Ig strands B, C, E, F are missing in the domain " + domainid + "...");
                    if(ic.domainid2refpdbname[domainid] == refpdbname) {
                        delete ic.domainid2refpdbname[domainid];
                        delete ic.domainid2score[domainid];
                    }
                    continue;
                }
            }

            if(!bRound1) {
                if(!me.bNode) console.log("domainid: " + domainid);
            }

            if(!domainid2segs.hasOwnProperty(domainid) || queryData[0].score >= ic.domainid2score[domainid].split('_')[0]) {
                ic.domainid2score[domainid] = queryData[0].score + '_' + queryData[0].frac_identical + '_' + queryData[0].num_res ;  
                ic.domainid2refpdbname[domainid] = refpdbname;
                domainid2segs[domainid] = queryData[0].segs;
                ic.domainid2ig2kabat[domainid] = queryData[0].ig2kabat;
                ic.domainid2ig2imgt[domainid] = queryData[0].ig2imgt;
            }
        }

        return domainid2segs;
    }

    async parseAlignData(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
        let domainid2segs = this.parseAlignData_part1(dataArray, domainidpairArray, bRound1);

        if(bRound1) {
            if(!me.bNode) console.log("Start round 2 alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));   

            // start round2
            let ajaxArray = [];
            let domainidpairArray3 = [];
            let urltmalign = me.htmlCls.tmalignUrl;
            for(let domainid in ic.domainid2refpdbname) {
                let pdbAjaxArray = [];
                let refpdbname = ic.domainid2refpdbname[domainid];
                //let pdbid = domainid.substr(0, domainid.indexOf('_'));
                let chainid = domainid.substr(0, domainid.indexOf(','));

                //if(ic.refpdbHash.hasOwnProperty(pdbid)) {
                if(ic.refpdbHash.hasOwnProperty(chainid)) {
                    // use itself as the ref structure
                    //refpdbname = pdbid;
                    refpdbname = chainid;

                    if(!me.bNode) console.log("Adjusted refpdbname for domainid " + domainid + ": " + refpdbname);   
                }

                if(!ic.refpdbHash[refpdbname]) {
                    continue;
                }

                for(let k = 0, kl = ic.refpdbHash[refpdbname].length; k < kl; ++k) {
                    let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + ic.refpdbHash[refpdbname][k];

                    let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

                    pdbAjaxArray.push(pdbAjax);
                }

                //let allPromise2 = Promise.allSettled(pdbAjaxArray);
                //ic.pdbDataArray = await allPromise2;

                ic.pdbDataArray = await this.promiseWithFixedJobs(pdbAjaxArray);

                let pdb_target = ic.domainid2pdb[domainid];
                for(let index = 0, indexl = ic.pdbDataArray.length; index < indexl; ++index) {
                    let struct2 = ic.defaultPdbId + index;
                    //let pdb_query = (me.bNode) ? ic.pdbDataArray[index] : ic.pdbDataArray[index].value; //[0];
                    let pdb_query = ic.pdbDataArray[index].value; //[0];
                    let header = 'HEADER                                                        ' + struct2 + '\n';
                    pdb_query = header + pdb_query;

                    let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbHash[refpdbname][index]};
                    let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);
                    ajaxArray.push(alignAjax);
                    
                    //domainidpairArray3.push(domainid + "," + refpdbname);
                    domainidpairArray3.push(domainid + "|" + ic.refpdbHash[refpdbname][index]);
                }
            }

            let dataArray3 = [];
            //let allPromise = Promise.allSettled(ajaxArray);
            //dataArray3 = await allPromise;

            dataArray3 = await this.promiseWithFixedJobs(ajaxArray);

            await this.parseAlignData(dataArray3, domainidpairArray3, false);
            
            // end of round 2
            return;
        }

        await this.parseAlignData_part3(domainid2segs);
    }

    async parseAlignData_part3(domainid2segs) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid2segs = {};

        // combine domainid into chainid
        let processedChainid = {};

        for(let domainid in ic.domainid2refpdbname) {
            // remove the first round template
            if(ic.domainid2refpdbname[domainid].substr(0,1) == '1') {
                delete ic.domainid2refpdbname[domainid];
                delete ic.domainid2score[domainid];
                continue;
            }

            let chainid = domainid.split(',')[0];

            if(!processedChainid.hasOwnProperty(chainid)) {
                ic.chainid2refpdbname[chainid] = [];
                ic.chainid2score[chainid] = [];
            }
            processedChainid[chainid] = 1;

            if(!ic.chainid2refpdbname.hasOwnProperty(chainid)) ic.chainid2refpdbname[chainid] = [];
            ic.chainid2refpdbname[chainid].push(ic.domainid2refpdbname[domainid] + '|' + domainid);

            if(!ic.chainid2score.hasOwnProperty(chainid)) ic.chainid2score[chainid] = [];
            ic.chainid2score[chainid].push(ic.domainid2score[domainid] + '|' + domainid);
        }

        // combine domainid into chainid
        for(let domainid in domainid2segs) {
            let chainid = domainid.split(',')[0];
            if(!chainid2segs[chainid]) chainid2segs[chainid] = [];
            chainid2segs[chainid] = chainid2segs[chainid].concat(domainid2segs[domainid]);
        }

        // assign ic.resid2refnum, ic.refnum2residArray, ic.chainsMapping
        if(!ic.resid2refnum) ic.resid2refnum = {};
        if(!ic.refnum2residArray) ic.refnum2residArray = {};
        if(!ic.chainsMapping) ic.chainsMapping = {};

        if(!ic.refPdbList) ic.refPdbList = [];

        for(let chainid in chainid2segs) {
            let segArray = chainid2segs[chainid];

            let refpdbnameArray = ic.chainid2refpdbname[chainid];

            let result = this.getTemplateList(chainid);
            let refpdbnameList = result.refpdbnameList;
            let scoreList = result.scoreList;
            let seqidList = result.seqidList;
            let nresAlignList = result.nresAlignList;

            let message = "The reference PDB(s) for chain " + chainid + " is(are) " + refpdbnameList + ". The TM-score(s) is(are) " + scoreList  + ". The sequence identitie(s) is(are) " + seqidList  + ". The number of aligned residue(s) is(are) " + nresAlignList + ".";
            if(!me.bNode) {
                console.log(message);
                me.htmlCls.clickMenuCls.setLogCmd(message, false, true);
            }
            ic.refPdbList.push(message);

            let prevStrand;
            let bCd19 = refpdbnameArray.length == 1 && refpdbnameArray[0] == 'CD19_6al5A_human_C2orV-n1';
            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                let qStart = seg.q_start;
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
                    //let refnum = qStartInt.toString() + postfix;
                    //let refnum = qStart + postfix;
                    let refnum = qStart;

                    let refnumLabel = this.getLabelFromRefnum(refnum, prevStrand, bCd19);
                    prevStrand = (refnumLabel) ? refnumLabel.replace(new RegExp(refnum,'g'), '') : undefined;

                    ic.resid2refnum[resid] = refnumLabel;

                    // final reference numbers will be assign in ic.showSeqCls.showRefNum()

                    // if(!ic.refnum2residArray.hasOwnProperty(refnum)) {
                    //     ic.refnum2residArray[refnum] = [resid];
                    // }
                    // else {
                    //     ic.refnum2residArray[refnum].push(resid);
                    // }

                    // if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                    //     ic.chainsMapping[chainid] = {};
                    // }
                    // ic.chainsMapping[chainid][resid] = refnumLabel;
                //}
            }
        }

        if(Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;

            // open sequence view
            ic.hAtomsRefnum = {};
            //ic.bResetAnno = true;
            if(ic.bAnnoShown) {
                for(let chain in ic.protein_chainid) {
                    let chainidBase = ic.protein_chainid[chain];
                    ic.showSeqCls.showSeq(chain, chainidBase, 'protein');
                }
            }
            else {
                await ic.showAnnoCls.showAnnotations();
            }
            
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else {
            alert("No Ig reference numbers are assigned based on the reference structures in iCn3D...");
        }
    }

    getLabelFromRefnum(oriRefnum, prevStrand, bCd19) { let ic = this.icn3d, me = ic.icn3dui;
        let refnum = parseInt(oriRefnum);

        //N-terminus = 0999-0001
        //A--- = 12xx
        //A-- = 13xx
        //A- = 14xx
        //A = 15xx (anchor 1550)
        //A+ = 16xx
        //A' = 18xx (anchor 1850)
        //B = 25xx (anchor 2550)
        //C-- = 33xx
        //C- = 34xx
        //C = 35xx (anchor 3550)
        //C' = 45xx (anchor 4550)
        //C'' = 55xx (anchor 5550)
        //D = 65xx (anchor 3550)
        //E = 75xx (anchor 7550)
        //E+ = 76xx
        //F = 85xx (anchor 8550)
        //G = 95xx (anchor 9550)
        //G+ = 96xx
        //G++ = 97xx
        //C-terminus = 9901-9999 (no anchor, numbering going forward)

        // loops may have numbers such as 1310, 1410

        if(refnum < 1000) return undefined;
        else if(refnum >= 1200 && refnum < 1290) return "A---" + oriRefnum;
        else if(refnum >= 1320 && refnum < 1390) return "A--" + oriRefnum;
        else if(refnum >= 1420 && refnum < 1490) return "A-" + oriRefnum;
        else if(refnum >= 1520 && refnum < 1590) return "A" + oriRefnum; 
        else if(refnum >= 1620 && refnum < 1690) return "A+" + oriRefnum; 
        else if(refnum >= 1820 && refnum < 1890) return "A'" + oriRefnum;
        else if(refnum >= 2000 && refnum < 2900) return "B" + oriRefnum;
        else if(refnum >= 3300 && refnum < 3390) return "C--" + oriRefnum;
        else if(refnum >= 3420 && refnum < 3490) return "C-" + oriRefnum;
        else if(refnum >= 3520 && refnum < 3590) return "C" + oriRefnum;
        else if(refnum >= 4000 && refnum < 4900) return "C'" + oriRefnum;
        else if(refnum >= 5000 && refnum < 5900) return "C''" + oriRefnum;
        else if(refnum >= 6000 && refnum < 6900) return "D" + oriRefnum;
        else if(refnum >= 7500 && refnum < 7590) return "E" + oriRefnum; 
        else if(refnum >= 7620 && refnum < 7900) return "E+" + oriRefnum; 
        else if(refnum >= 8000 && refnum < 8900) return "F" + oriRefnum;
        else if(refnum >= 9500 && refnum < 9590) return "G" + oriRefnum;
        else if(refnum >= 9620 && refnum < 9690) return "G+" + oriRefnum;
        else if(refnum >= 9720 && refnum < 9790) return "G++" + oriRefnum;
        else if(refnum > 9900) return undefined;
        else return " " + oriRefnum;;
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

    rmStrandFromRefnumlabel(refnumLabel) { let ic = this.icn3d, me = ic.icn3dui;
        return (!refnumLabel) ? refnumLabel : refnumLabel.replace(/'/g, '').replace(/\*/g, '').replace(/\^/g, '').replace(/\+/g, '').replace(/\-/g, '').substr(1); // C', C''
    }

    exportRefnum(type, bCalcRef) { let ic = this.icn3d, me = ic.icn3dui;
        let refData = '';

        // 1. show IgStrand ref numbers
        if(type == 'igstrand' || type == 'IgStrand') {
            // iGStrand reference numbers were adjusted when showing in sequences
            if(me.bNode) {
                for(let chnid in ic.chains) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chnid]);
                    if(ic.proteins.hasOwnProperty(atom.serial)) {
                        let giSeq = [];
                        for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
                            giSeq.push(ic.chainsSeq[chnid][i].name);
                        }
                        ic.showSeqCls.showRefNum(giSeq, chnid);
                    }
                }
            }
    
            let resid2refnum = {};
            for(let resid in ic.resid2refnum) {
                let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                if(!atom) continue;
                
                let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
        
                let domainid = ic.resid2domainid[resid];
                let refnumStr, refnumLabel = ic.resid2refnum[resid];
        
                if(refnumLabel) {
                    let refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    refnumStr = (ic.domainid2ig2kabat[domainid]) ? ic.domainid2ig2kabat[domainid][refnumStr_ori] : undefined;
                }
        
                if(ic.resid2refnum[resid]) {
                    if(ic.residIgLoop.hasOwnProperty(resid)) { // loop
                    resid2refnum[resid + '_' + resn] = ic.resid2refnum[resid] + '_loop';
                    }
                    else {
                    resid2refnum[resid + '_' + resn] = ic.resid2refnum[resid];
                    }
                }
            }

            let bIgDomain = (ic.refPdbList.length > 0) ? 1 : 0;

            refData += '{"Ig domain" : ' + bIgDomain + ', "ref PDB" : ' + JSON.stringify(ic.refPdbList) + ",\n"
    
            if(bIgDomain) {
                refData += '"data": {\n';
                for(let chnid in ic.chains) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chnid]);
                    if(ic.proteins.hasOwnProperty(atom.serial)) {
                        let bIgChain = false;
                        let chainRefData = '"' + chnid + '": [\n';
                        for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
                            const resid = chnid + '_' + ic.chainsSeq[chnid][i].resi + '_' + ic.chainsSeq[chnid][i].name;
                            chainRefData += '{"' + resid + '": "' + resid2refnum[resid] + '"},\n';
                            if(resid2refnum[resid]) bIgChain = true;
                        }
                        chainRefData += '],\n';

                        if(bIgChain) {
                            refData += chainRefData;
                        }
                    }
                }
                refData += '}\n';
            }

            refData += '}\n';
        }
        // 2. show Kabat ref numbers
        else if(type == 'kabat' || type == 'Kabat') {
            let resid2kabat = {};
            for(let resid in ic.resid2refnum) {
            let domainid = ic.resid2domainid[resid];
            let refnumStr, refnumLabel = ic.resid2refnum[resid];
    
            let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
            let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
    
            if(refnumLabel) {
                let refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                refnumStr = (ic.domainid2ig2kabat[domainid]) ? ic.domainid2ig2kabat[domainid][refnumStr_ori] : undefined;
            }
    
            resid2kabat[resid + '_' + resn] = refnumStr;
            }
            
            refData += JSON.stringify(resid2kabat);
        }
        // 3. show IMGT ref numbers
        else if(type == 'imgt'|| type == 'IMGT') {
            let resid2imgt = {};
            for(let resid in ic.resid2refnum) {
            let domainid = ic.resid2domainid[resid];
            let refnumStr, refnumLabel = ic.resid2refnum[resid];
    
            let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
            let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
    
            if(refnumLabel) {
                let refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                refnumStr = (ic.domainid2ig2imgt[domainid]) ? ic.domainid2ig2imgt[domainid][refnumStr_ori] : undefined;
            }
    
            resid2imgt[resid + '_' + resn] = refnumStr;
            }
            
            refData += JSON.stringify(resid2imgt);
        }


        if(!me.bNode) {
            let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
    
            ic.saveFileCls.saveFile(file_pref + '_refnum_' + type + '.txt', 'text', [refData]);
        }
        else {
            return refData;
        }
    }

    async promiseWithFixedJobs(ajaxArray) { let ic = this.icn3d, me = ic.icn3dui;
        let dataArray3 = [];
        //let allPromise = Promise.allSettled(ajaxArray);
        //dataArray3 = await allPromise;

        //split arrays into chunks of 48 jobs or me.cfg.maxajax jobs
        let n = (me.cfg.maxajax) ? me.cfg.maxajax : ic.refpdbArray.length * 6;

        for(let i = 0, il = parseInt((ajaxArray.length - 1) / n + 1); i < il; ++i) {
            let currAjaxArray = []
            if(i == il - 1) { // last one 
                currAjaxArray = ajaxArray.slice(i * n, ajaxArray.length);
            }
            else {
                currAjaxArray = ajaxArray.slice(i * n, (i + 1) * n);
            }

            let currPromise = Promise.allSettled(currAjaxArray);
            let currDataArray = await currPromise;

            dataArray3 = dataArray3.concat(currDataArray);
        }

        return dataArray3;
    }
 }
 
 export {Refnum}
 