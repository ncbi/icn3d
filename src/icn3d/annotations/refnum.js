/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 class Refnum {
    constructor(icn3d) {
        this.icn3d = icn3d;
        this.TMThresholdIgType = 0.85
        this.TMThresholdTemplate = 0.4
        this.topClusters = 5;
    }

    async hideIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        ic.bShowRefnum = false;
        // ic.bRunRefnum = false;

        // redo all ref numbers
        ic.resid2refnum = {};

        ic.annotationCls.hideAnnoTabIg();

        ic.selectionCls.selectAll_base();
        ic.opts.color = 'chain';
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        ic.hlUpdateCls.updateHlAll();
        ic.drawCls.draw();

        ic.bResetAnno = true;
        // await ic.showAnnoCls.showAnnotations();
        if(ic.bAnnoShown) {
        //     for(let chain in ic.protein_chainid) {
        //         let chainidBase = ic.protein_chainid[chain];
        //         ic.showSeqCls.showSeq(chain, chainidBase, 'protein');
        //     }
        // }
        // else {
            // await ic.showAnnoCls.showAnnotations();
            await ic.annotationCls.resetAnnoTabAll();
        }
    }

    setRefPdbs() { let ic = this.icn3d, me = ic.icn3dui;
        // round 1, 16 templates
        ic.refpdbArray = ['1InsulinR_8guyE_human_FN3-n1', '1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', '1CoAtomerGamma1_1r4xA_human', '1C3_2qkiD_human_n1', '1CuZnSuperoxideDismutase_1hl5C_human', '1ASF1A_2iijA_human', '1FAB-LIGHT_5esv_C1-n2', '1CD2_1hnfA_human_C2-n2', '1NaCaExchanger_2fwuA_dog_n2', '1NaKATPaseTransporterBeta_2zxeB_spurdogshark', '1FAB-HEAVY_5esv_V-n1', '1PDL1_4z18B_human_V-n1', '1BTLA_2aw2A_human_Iset', '1LaminAC_1ifrA_human', '1CD3g_6jxrg_human_C2', '1CD28_1yjdC_human_V', '1CD19_6al5A_human-n1'];

        // round 2
        ic.refpdbHash = {};
        ic.refpdbHash['1InsulinR_8guyE_human_FN3-n1'] = ['InsulinR_8guyE_human_FN3-n1', 'IL6Rb_1bquB_human_FN3-n3', 'Sidekick2_1wf5A_human_FN3-n7', 'InsulinR_8guyE_human_FN3-n2', 'Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n2'];
        ic.refpdbHash['1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'ICOS_6x4gA_human_V'];
        ic.refpdbHash['1CoAtomerGamma1_1r4xA_human'] = ['CoAtomerGamma1_1r4xA_human', 'TP34_2o6cA_bacteria'];
        ic.refpdbHash['1C3_2qkiD_human_n1'] = ['C3_2qkiD_human_n1', 'BArrestin1_4jqiA_rat_n1', 'RBPJ_6py8C_human_Unk-n1'];
        ic.refpdbHash['1CuZnSuperoxideDismutase_1hl5C_human'] = ['CuZnSuperoxideDismutase_1hl5C_human', 'TEAD1_3kysC_human'];
        ic.refpdbHash['1ASF1A_2iijA_human'] = ['ASF1A_2iijA_human', 'RBPJ_6py8C_human_Unk-n2', 'TP47_1o75A_bacteria'];
        ic.refpdbHash['1FAB-LIGHT_5esv_C1-n2'] = ['FAB-LIGHT_5esv_C1-n2', 'GHR_1axiB_human_C1-n1', 'VTCN1_Q7Z7D3_human_C1-n2', 'B2Microglobulin_7phrL_human_C1', 'FAB-HEAVY_5esv_C1-n2', 'MHCIa_7phrH_human_C1'];
        ic.refpdbHash['1CD2_1hnfA_human_C2-n2'] = ['CD2_1hnfA_human_C2-n2', 'Siglec3_5j0bB_human_C1-n2'];
        ic.refpdbHash['1NaCaExchanger_2fwuA_dog_n2'] = ['NaCaExchanger_2fwuA_dog_n2', 'ORF7a_1xakA_virus', 'ECadherin_4zt1A_human_n2'];
        ic.refpdbHash['1NaKATPaseTransporterBeta_2zxeB_spurdogshark'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1FAB-HEAVY_5esv_V-n1'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1', 'VNAR_1t6vN_shark_V', 'TCRa_6jxrm_human_V-n1', 'VISTA_6oilA_human_V', 'CD8a_1cd8A_human_V', 'PD1_4zqkB_human_V'];
        ic.refpdbHash['1PDL1_4z18B_human_V-n1'] = ['PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1', 'LAG3_7tzgD_human_V-n1'];
        ic.refpdbHash['1BTLA_2aw2A_human_Iset'] = ['BTLA_2aw2A_human_Iset', 'Palladin_2dm3A_human_Iset-n1', 'Titin_4uowM_human_Iset-n152', 'LAG3_7tzgD_human_C1-n2', 'JAM1_1nbqA_human_Iset-n2', 'Contactin1_3s97C_human_Iset-n2'];
        ic.refpdbHash['1LaminAC_1ifrA_human'] = ['LaminAC_1ifrA_human', 'CD3d_6jxrd_human_C1'];
        ic.refpdbHash['1CD3g_6jxrg_human_C2'] = ['CD3g_6jxrg_human_C2', 'TCRa_6jxrm_human_C1-n2', 'IsdA_2iteA_bacteria'];
        ic.refpdbHash['1CD28_1yjdC_human_V'] = ['CD28_1yjdC_human_V', 'MPT63_1lmiA_bacteria', 'CD3e_6jxrf_human_C1'];
        ic.refpdbHash['1CD19_6al5A_human-n1'] = ['CD19_6al5A_human-n1'];

        ic.refpdbHash['all_templates'] = ['ASF1A_2iijA_human', 'B2Microglobulin_7phrL_human_C1', 'BArrestin1_4jqiA_rat_n1', 'BTLA_2aw2A_human_Iset', 'C3_2qkiD_human_n1', 'CD19_6al5A_human-n1', 'CD28_1yjdC_human_V', 'CD2_1hnfA_human_C2-n2', 'CD2_1hnfA_human_V-n1', 'CD3d_6jxrd_human_C1', 'CD3e_6jxrf_human_C1', 'CD3g_6jxrg_human_C2', 'CD8a_1cd8A_human_V', 'CoAtomerGamma1_1r4xA_human', 'Contactin1_2ee2A_human_FN3-n9', 'Contactin1_3s97C_human_Iset-n2', 'CuZnSuperoxideDismutase_1hl5C_human', 'ECadherin_4zt1A_human_n2', 'Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'FAB-HEAVY_5esv_C1-n2', 'FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_C1-n2', 'FAB-LIGHT_5esv_V-n1', 'GHR_1axiB_human_C1-n1', 'ICOS_6x4gA_human_V', 'IL6Rb_1bquB_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n3', 'InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2', 'IsdA_2iteA_bacteria', 'JAM1_1nbqA_human_Iset-n2', 'LAG3_7tzgD_human_C1-n2', 'LAG3_7tzgD_human_V-n1', 'LaminAC_1ifrA_human', 'MHCIa_7phrH_human_C1', 'MPT63_1lmiA_bacteria', 'NaCaExchanger_2fwuA_dog_n2', 'NaKATPaseTransporterBeta_2zxeB_spurdogshark', 'ORF7a_1xakA_virus', 'PD1_4zqkB_human_V', 'PDL1_4z18B_human_V-n1', 'Palladin_2dm3A_human_Iset-n1', 'RBPJ_6py8C_human_Unk-n1', 'RBPJ_6py8C_human_Unk-n2', 'Sidekick2_1wf5A_human_FN3-n7', 'Siglec3_5j0bB_human_C1-n2', 'TCRa_6jxrm_human_C1-n2', 'TCRa_6jxrm_human_V-n1', 'TEAD1_3kysC_human', 'TP34_2o6cA_bacteria', 'TP47_1o75A_bacteria', 'Titin_4uowM_human_Iset-n152', 'VISTA_6oilA_human_V', 'VNAR_1t6vN_shark_V', 'VTCN1_Q7Z7D3_human_C1-n2'];

        // use known ref structure
        ic.refpdbHash['5ESV_C'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-HEAVY_5esv_C1-n2'];
        ic.refpdbHash['5ESV_D'] = ['FAB-LIGHT_5esv_V-n1', 'FAB-LIGHT_5esv_C1-n2'];
        ic.refpdbHash['8GUY_E'] = ['InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2'];
        ic.refpdbHash['6JXR_m'] = ['TCRa_6jxrm_human_V-n1', 'TCRa_6jxrm_human_C1-n2'];
        ic.refpdbHash['1HNF_A'] = ['CD2_1hnfA_human_V-n1', 'CD2_1hnfA_human_C2-n2'];
        ic.refpdbHash['7TZG_D'] = ['LAG3_7tzgD_human_V-n1', 'LAG3_7tzgD_human_C1-n2'];
        ic.refpdbHash['6PY8_C'] = ['RBPJ_6py8C_human_Unk-n1', 'RBPJ_6py8C_human_Unk-n2'];
        ic.refpdbHash['1BQU_B'] = ['IL6Rb_1bquB_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n3'];

        ic.refpdbHash['1R4X_A'] = ['CoAtomerGamma1_1r4xA_human'];
        ic.refpdbHash['6OIL_A'] = ['VISTA_6oilA_human_V'];
        ic.refpdbHash['2ZXE_B'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1I8A_A'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'];
        ic.refpdbHash['2FWU_A'] = ['NaCaExchanger_2fwuA_dog_n2'];
        ic.refpdbHash['4JQI_A'] = ['BArrestin1_4jqiA_rat_n1'];
        ic.refpdbHash['1NBQ_A'] = ['JAM1_1nbqA_human_Iset-n2'];
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
        ic.refpdbHash['5J0B_B'] = ['Siglec3_5j0bB_human_C1-n2'];
        ic.refpdbHash['1IFR_A'] = ['LaminAC_1ifrA_human'];
        ic.refpdbHash['Q7Z7D3_A'] = ['VTCN1_Q7Z7D3_human_C1-n2'];
        ic.refpdbHash['4ZQK_B'] = ['PD1_4zqkB_human_V'];
        ic.refpdbHash['2DM3_A'] = ['Palladin_2dm3A_human_Iset-n1'];
        ic.refpdbHash['2ITE_A'] = ['IsdA_2iteA_bacteria'];
        ic.refpdbHash['1XAK_A'] = ['ORF7a_1xakA_virus'];
        ic.refpdbHash['4ZT1_A'] = ['ECadherin_4zt1A_human_n2'];
        ic.refpdbHash['1LMI_A'] = ['MPT63_1lmiA_bacteria'];
        ic.refpdbHash['1CD8_A'] = ['CD8a_1cd8A_human_V'];
        ic.refpdbHash['3S97_C'] = ['Contactin1_3s97C_human_Iset-n2'];
        ic.refpdbHash['1AXI_B'] = ['GHR_1axiB_human_C1-n1'];
        ic.refpdbHash['6X4G_A'] = ['ICOS_6x4gA_human_V'];
        ic.refpdbHash['2EE2_A'] = ['Contactin1_2ee2A_human_FN3-n9'];
        ic.refpdbHash['4UOW_M'] = ['Titin_4uowM_human_Iset-n152'];
        ic.refpdbHash['6A15_A'] = ['CD19_6al5A_human-n1'];
        ic.refpdbHash['2QKI_D'] = ['C3_2qkiD_human_n1'];
        ic.refpdbHash['1YJD_C'] = ['CD28_1yjdC_human_V'];
        ic.refpdbHash['6JXR_d'] = ['CD3d_6jxrd_human_C1'];
        ic.refpdbHash['6JXR_f'] = ['CD3e_6jxrf_human_C1'];
        ic.refpdbHash['6JXR_g'] = ['CD3g_6jxrg_human_C2'];

        // assign Ig types
        ic.ref2igtype = {};

        ic.ref2igtype['ASF1A_2iijA_human'] = 'IgE';
        ic.ref2igtype['B2Microglobulin_7phrL_human_C1'] = 'IgC1';
        ic.ref2igtype['BArrestin1_4jqiA_rat_n1'] = 'IgFN3-like';
        ic.ref2igtype['BTLA_2aw2A_human_Iset'] = 'IgI';
        ic.ref2igtype['C3_2qkiD_human_n1'] = 'IgFN3-like';
        ic.ref2igtype['CD19_6al5A_human-n1'] = 'CD19';
        ic.ref2igtype['CD28_1yjdC_human_V'] = 'IgV';
        ic.ref2igtype['CD2_1hnfA_human_C2-n2'] = 'IgC2';
        ic.ref2igtype['CD2_1hnfA_human_V-n1'] = 'IgV';
        ic.ref2igtype['CD3d_6jxrd_human_C1'] = 'IgC1';
        ic.ref2igtype['CD3e_6jxrf_human_C1'] = 'IgC1';
        ic.ref2igtype['CD3g_6jxrg_human_C2'] = 'IgC2';
        ic.ref2igtype['CD8a_1cd8A_human_V'] = 'IgV';
        ic.ref2igtype['CoAtomerGamma1_1r4xA_human'] = 'IgE';
        ic.ref2igtype['Contactin1_2ee2A_human_FN3-n9'] = 'IgFN3';
        ic.ref2igtype['Contactin1_3s97C_human_Iset-n2'] = 'IgI';
        ic.ref2igtype['CuZnSuperoxideDismutase_1hl5C_human'] = 'SOD';
        ic.ref2igtype['ECadherin_4zt1A_human_n2'] = 'Cadherin';
        ic.ref2igtype['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'] = 'IgE';
        ic.ref2igtype['FAB-HEAVY_5esv_C1-n2'] = 'IgC1';
        ic.ref2igtype['FAB-HEAVY_5esv_V-n1'] = 'IgV';
        ic.ref2igtype['FAB-LIGHT_5esv_C1-n2'] = 'IgC1';
        ic.ref2igtype['FAB-LIGHT_5esv_V-n1'] = 'IgV';
        ic.ref2igtype['GHR_1axiB_human_C1-n1'] = 'IgC1';
        ic.ref2igtype['ICOS_6x4gA_human_V'] = 'IgV';
        ic.ref2igtype['IL6Rb_1bquB_human_FN3-n2'] = 'IgFN3';
        ic.ref2igtype['IL6Rb_1bquB_human_FN3-n3'] = 'IgFN3';
        ic.ref2igtype['InsulinR_8guyE_human_FN3-n1'] = 'IgFN3';
        ic.ref2igtype['InsulinR_8guyE_human_FN3-n2'] = 'IgFN3';
        ic.ref2igtype['IsdA_2iteA_bacteria'] = 'IgE';
        ic.ref2igtype['JAM1_1nbqA_human_Iset-n2'] = 'IgI';
        ic.ref2igtype['LAG3_7tzgD_human_C1-n2'] = 'IgC1';
        ic.ref2igtype['LAG3_7tzgD_human_V-n1'] = 'IgV';
        ic.ref2igtype['LaminAC_1ifrA_human'] = 'Lamin';
        ic.ref2igtype['MHCIa_7phrH_human_C1'] = 'IgC1';
        ic.ref2igtype['MPT63_1lmiA_bacteria'] = 'IgE';
        ic.ref2igtype['NaCaExchanger_2fwuA_dog_n2'] = 'IgFN3-like';
        ic.ref2igtype['NaKATPaseTransporterBeta_2zxeB_spurdogshark'] = 'IgE';
        ic.ref2igtype['ORF7a_1xakA_virus'] = 'ORF';
        ic.ref2igtype['PD1_4zqkB_human_V'] = 'IgV';
        ic.ref2igtype['PDL1_4z18B_human_V-n1'] = 'IgV';
        ic.ref2igtype['Palladin_2dm3A_human_Iset-n1'] = 'IgI';
        ic.ref2igtype['RBPJ_6py8C_human_Unk-n1'] = 'IgFN3-like';
        ic.ref2igtype['RBPJ_6py8C_human_Unk-n2'] = 'IgFN3-like';
        ic.ref2igtype['Sidekick2_1wf5A_human_FN3-n7'] = 'IgFN3';
        ic.ref2igtype['Siglec3_5j0bB_human_C1-n2'] = 'IgC1';
        ic.ref2igtype['TCRa_6jxrm_human_C1-n2'] = 'IgC1';
        ic.ref2igtype['TCRa_6jxrm_human_V-n1'] = 'IgV';
        ic.ref2igtype['TEAD1_3kysC_human'] = 'IgE';
        ic.ref2igtype['TP34_2o6cA_bacteria'] = 'IgE';
        ic.ref2igtype['TP47_1o75A_bacteria'] = 'IgE';
        ic.ref2igtype['Titin_4uowM_human_Iset-n152'] = 'IgI';
        ic.ref2igtype['VISTA_6oilA_human_V'] = 'IgV';
        ic.ref2igtype['VNAR_1t6vN_shark_V'] = 'IgV';
        ic.ref2igtype['VTCN1_Q7Z7D3_human_C1-n2'] = 'IgC1';
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

                let bNoMoreIg = await thisClass.parseRefPdbData(ic.pdbDataArray, template);
                let numRound = 0;

                //while(!bNoMoreIg) {
                while(!bNoMoreIg && numRound < 15) {
                    let bRerun = true;
                    bNoMoreIg = await thisClass.parseRefPdbData(ic.pdbDataArray, template, bRerun);
                    ++numRound;
                }
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

    async parseRefPdbData(dataArray, template, bRerun) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let struArray = Object.keys(ic.structures);

        let ajaxArray = [];
        let domainidpairArray = [];

        let urltmalign = me.htmlCls.tmalignUrl;
        // let urlalign = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi";

        if(!ic.resid2domainid) ic.resid2domainid = {};
        //ic.resid2domainid = {};
        ic.domainid2pdb = {};

        let bNoMoreIg = true;
        let bFoundDomain = false;
        for(let i = 0, il = struArray.length; i < il; ++i) {
            let struct = struArray[i];
            let chainidArray = ic.structures[struct];

            for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
                let chainid = chainidArray[j];

                // for selected atoms only
                let domainAtomsArray = this.getDomainAtomsArray(chainid, bRerun);

                if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
                if(!ic.domainid2score) ic.domainid2score = {};

                if(domainAtomsArray.length == 0) {
                    continue;
                }

                bFoundDomain = true;

                for(let k = 0, kl = domainAtomsArray.length; k < kl; ++k) {
                    bNoMoreIg = false;

                    let pdb_target = ic.saveFileCls.getAtomPDB(domainAtomsArray[k], undefined, undefined, undefined, undefined, struct);

                    // ig strand for any subset will have the same k, use the number of residue to separate them
                    let atomFirst = ic.firstAtomObjCls.getFirstAtomObj(domainAtomsArray[k]);
                    let atomLast = ic.firstAtomObjCls.getLastAtomObj(domainAtomsArray[k]);
                    let resiSum = atomFirst.resi + ':' + atomLast.resi + ':' + Object.keys(domainAtomsArray[k]).length;
                    //let domainid = chainid + '-' + k + '_' + Object.keys(domainAtomsArray[k]).length;
                    let domainid = chainid + ',' + k + '_' + resiSum;

                    // clear score
                    delete ic.domainid2score[domainid];

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
                        ic.domainid2refpdbname[domainid] = [template];
                        domainidpairArray.push(domainid + "|1" + template); // "1" was added for the first round strand-only template
                    }
                }
            }
        }

        if(!bFoundDomain) {
            return bNoMoreIg;
        }

        //try {
            if(!template) {
                let dataArray2 = [];

                // let allPromise = Promise.allSettled(ajaxArray);
                // dataArray2 = await allPromise;

                dataArray2 = await this.promiseWithFixedJobs(ajaxArray);

                let bRound1 = true;
                bNoMoreIg = await thisClass.parseAlignData(dataArray2, domainidpairArray, bRound1);

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

                let pdbDataArray = await this.promiseWithFixedJobs(pdbAjaxArray);

                for(let domainid in ic.domainid2refpdbname) {
                    let pdb_target = ic.domainid2pdb[domainid];
                    for(let index = 0, indexl = pdbDataArray.length; index < indexl; ++index) {
                        let struct2 = ic.defaultPdbId + index;
                        let pdb_query = pdbDataArray[index].value; //[0];

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

                bNoMoreIg = await thisClass.parseAlignData(dataArray3, domainidpairArray3);
            }

            return bNoMoreIg;
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

    getDomainAtomsArray(chainid, bRerunDomain) { let ic = this.icn3d, me = ic.icn3dui;
        let domainAtomsArray = [];

        let minResidues = 20, minAtoms = 200;

        if(!ic.chainid2atomsLeft) ic.chainid2atomsLeft = {};

        if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]).serial)
        && !ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getMiddleAtomObj(ic.chains[chainid]).serial)) return domainAtomsArray;
        if(ic.chainsSeq[chainid].length < minResidues) return domainAtomsArray; // peptide

        // only consider selected atoms
        let currAtoms = me.hashUtilsCls.intHash(ic.chains[chainid], ic.hAtoms);
        if(Object.keys(currAtoms).length == 0) return domainAtomsArray;

        if(bRerunDomain) {
            let atomsAssigned = {};
            // for(let resid in ic.resid2refnum_ori) {
            for(let resid in ic.resid2domainid) {
                if(ic.resid2domainid[resid]) atomsAssigned = me.hashUtilsCls.unionHash(atomsAssigned, ic.residues[resid]);
            }

            currAtoms = me.hashUtilsCls.exclHash(currAtoms, atomsAssigned);

            // no need to rerun the rest residues any more
            if(ic.chainid2atomsLeft[chainid] == Object.keys(currAtoms).length) {
                return domainAtomsArray;
            }

            ic.chainid2atomsLeft[chainid] = Object.keys(currAtoms).length;

            if(Object.keys(currAtoms).length < minAtoms) return domainAtomsArray;
        }

        // align each 3D domain with reference structure
        //let result = ic.domain3dCls.c2b_NewSplitChain(ic.chains[chainid]);
        // assign ref numbers to selected residues
        let result = ic.domain3dCls.c2b_NewSplitChain(currAtoms, undefined);
        let subdomains = result.subdomains;
        // let pos2resi = result.pos2resi;

        if(subdomains.length >= 1) {
            for(let k = 0, kl = subdomains.length; k < kl; ++k) {
                let domainAtoms = {};
                let segArray = subdomains[k];

                let resCnt = 0; // minResi = 999, maxResi = -999;
                for(let m = 0, ml = segArray.length; m < ml; m += 2) {
                    let startResi = parseInt(segArray[m]);
                    let endResi = parseInt(segArray[m+1]);

                    // if(startResi < minResi) minResi = startResi;
                    // if(endResi > maxResi) maxResi = endResi;

                    for(let n = startResi; n <= endResi; ++n) {
                        // let resid = chainid + '_' + pos2resi[n - 1];
                        let resid = ic.ncbi2resid[chainid + '_' + n];
                        ++resCnt;
                        domainAtoms = me.hashUtilsCls.unionHash(domainAtoms, ic.residues[resid]);

                        // clear previous refnum assignment if any
                        // delete ic.resid2refnum[resid];
                        delete ic.residIgLoop[resid];
                        delete ic.resid2domainid[resid];
                    }
                }

                if(resCnt < minResidues) continue;

                domainAtomsArray.push(domainAtoms);
            }
        }
        // else { // no domain
        //     domainAtomsArray = [currAtoms];
        // }

        return domainAtomsArray;
    }

    getTemplateList(domainid) { let ic = this.icn3d, me = ic.icn3dui;
        let refpdbname = '', score = '', seqid = '', nresAlign = '';

        refpdbname = ic.domainid2refpdbname[domainid][0]; // one template in round 2

        if(ic.domainid2score[domainid]) {
            let itemArray = ic.domainid2score[domainid].split('_');

            score = itemArray[0];
            seqid = itemArray[1];
            nresAlign = itemArray[2];
        }

        return {'refpdbname': refpdbname, 'score': score, 'seqid': seqid, 'nresAlign': nresAlign};
    }

    parseAlignData_part1(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
    // async parseAlignData(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
        // find the best alignment for each chain
        let domainid2segs = {};
        let domainid2strandcnt = {};
        let domainid2refpdbnamelist = {};

        if(!ic.chainid2refpdbname) ic.chainid2refpdbname = {};
        // if(!ic.chainid2score) ic.chainid2score = {};
        if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
        if(!ic.domainid2score) ic.domainid2score = {};
        if(!ic.domainid2ig2kabat) ic.domainid2ig2kabat = {};
        if(!ic.domainid2ig2imgt) ic.domainid2ig2imgt = {};

        let minResidues = 20;

        for(let i = 0, il = domainidpairArray.length; i < il; ++i) {
            //let queryData = (me.bNode) ? dataArray[i] : dataArray[i].value; //[0];
            let queryData = (dataArray[i]) ? dataArray[i].value : undefined; //[0];

            if(!queryData || queryData.length == 0) {
                if(!me.bNode) console.log("The alignment data for " + domainidpairArray[i] + " is unavailable...");
                continue;
            }

            if(queryData[0].score === undefined) continue;
            let score = parseFloat(queryData[0].score);

            //let domainid_index = domainidpairArray[i].split(',');
            //let domainid = domainid_index[0];
            let domainid = domainidpairArray[i].substr(0, domainidpairArray[i].indexOf('|'));
            let refpdbname = domainidpairArray[i].substr(domainidpairArray[i].indexOf('|') + 1);
            //let chainid = domainid.split('-')[0];

            if(!bRound1) {
                if(queryData[0].score < this.TMThresholdTemplate || queryData[0].num_res < minResidues) {
                    if(!me.bNode) console.log("bRound1: " + bRound1 + ": domainid " + domainid + " and refpdbname " + refpdbname + " were skipped due to a TM-score less than " + this.TMThresholdTemplate);
                    continue;
                }
            }
            else {
                if(queryData[0].score < this.TMThresholdTemplate || queryData[0].num_res < minResidues / 2) {
                    continue;
                }
            }

            if(!bRound1) {
                if(!me.bNode) console.log("refpdbname " + refpdbname + " TM-score: " + queryData[0].score);
            }
            else {
                // if(!me.bNode) console.log("domainid: " + domainid + " refpdbname " + refpdbname + " RMSD: " + queryData[0].super_rmsd + ", num_seg: " + queryData[0].num_seg + ",  10/RMSD + num_seg/5: " + (10 / queryData[0].super_rmsd + queryData[0].num_seg / 5).toFixed(1));
                if(!me.bNode) console.log("domainid: " + domainid + " refpdbname " + refpdbname + " TM-score: " + queryData[0].score);

                if(!domainid2refpdbnamelist[domainid]) domainid2refpdbnamelist[domainid] = {};
                domainid2refpdbnamelist[domainid][refpdbname] = score;
            }

            // Ig-like domains: B (2150, 2150a, 2150b), C (3150, 3250), E (7150, 7250), F (8150, 8250) strands
            // Ig domain may require G (7050). But we'll leave that out for now.
            if(!bRound1 && queryData[0].segs) {
                let bBstrand = false, bCstrand = false, bEstrand = false, bFstrand = false, bGstrand = false;
                let bBSheet = true, bCSheet = true, bESheet = true, bFSheet = true;
                let chainid = domainid.split(',')[0];

                for(let j = 0, jl = queryData[0].segs.length; j < jl; ++j) {
                    let seg = queryData[0].segs[j];
                    let resi = seg.t_start;
                    let resid = chainid + '_' + resi;
                    let q_start = parseInt(seg.q_start)

                    if(q_start > 2540 && q_start < 2560) {
                        bBstrand = true;
                    }
                    else if(q_start > 3540 && q_start < 3560) {
                        bCstrand = true;
                    }
                    else if(q_start > 7540 && q_start < 7560) {
                        bEstrand = true;
                    }
                    else if(q_start > 8540 && q_start < 8560) {
                        bFstrand = true;
                    }

                    if(q_start == 2550) {
                        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                        if(atom.ss == 'helix') bBSheet = false;
                    }
                    else if(q_start == 3550) {
                        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                        if(atom.ss == 'helix') bCSheet = false;
                    }
                    else if(q_start == 7550) {
                        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                        if(atom.ss == 'helix') bESheet = false; 
                    }
                    else if(q_start == 8550) {
                        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                        if(atom.ss == 'helix') bFSheet = false;
                    }

                    //if(bBstrand && bCstrand && bEstrand && bFstrand && bGstrand) break;
                    if(bBstrand && bCstrand && bEstrand && bFstrand) break;
                }

                // if(refpdbname != 'CD19_6al5A_human-n1') { // relax for CD19
                    if(!(bBstrand && bCstrand && bEstrand && bFstrand) || !(bBSheet && bCSheet && bESheet && bFSheet)) {
                    // if(!(bBstrand && bCstrand && bEstrand && bFstrand)) {
                        if(!me.bNode && !(bBstrand && bCstrand && bEstrand && bFstrand)) console.log("Some of the Ig strands B, C, E, F are missing in the domain " + domainid + "...");
                        if(!me.bNode && !(bBSheet && bCSheet && bESheet && bFSheet)) console.log("Some of the Ig strands B, C, E, F are not beta sheets...");

                        if(ic.domainid2refpdbname[domainid][0] == refpdbname) {
                            delete ic.domainid2refpdbname[domainid];
                            delete ic.domainid2score[domainid];
                        }
                        continue;  
                  }
                // }
            }

            if(!bRound1) {
                if(!me.bNode) console.log("domainid: " + domainid);
            }

            // count the number of matched strands
            // let strandHash = {};
            // for(let j = 0, jl = queryData[0].segs.length; j < jl; ++j) {
            //     let seg = queryData[0].segs[j];
            //     let q_start = parseInt(seg.q_start)

            //     let strand = this.getStrandFromRefnum(q_start);
            //     strandHash[strand] = 1;
            // }

            // let tmAdjust = 0.1; 

            // if the TM score difference is within 0.1 and more strands are found, use the template with more strands
            // if(!domainid2segs.hasOwnProperty(domainid) || 
            //     (score >= parseFloat(ic.domainid2score[domainid].split('_')[0]) + tmAdjust)
            //     || (score >= parseFloat(ic.domainid2score[domainid].split('_')[0]) - tmAdjust && score < parseFloat(ic.domainid2score[domainid].split('_')[0]) + tmAdjust && Object.keys(strandHash).length > domainid2strandcnt[domainid])
            //     ) {

            // use TM-score alone
            if(!domainid2segs.hasOwnProperty(domainid) || score >= parseFloat(ic.domainid2score[domainid].split('_')[0])) {      
                ic.domainid2score[domainid] = queryData[0].score + '_' + queryData[0].frac_identical + '_' + queryData[0].num_res ;

                if(bRound1) {
                    ic.domainid2refpdbname[domainid] = score >= this.TMThresholdIgType ? [refpdbname] : ['all_templates'];
                }
                else {
                    ic.domainid2refpdbname[domainid] = [refpdbname];
                }

                domainid2segs[domainid] = queryData[0].segs;
                // domainid2strandcnt[domainid] = Object.keys(strandHash).length;

                ic.domainid2ig2kabat[domainid] = queryData[0].ig2kabat;
                ic.domainid2ig2imgt[domainid] = queryData[0].ig2imgt;
            }
        }

        // combine the top  clusters for the 2nd round alignment
        if(bRound1) {
            for(let domainid in domainid2refpdbnamelist) {
                if(!me.bNode && ic.domainid2refpdbname[domainid][0] == 'all_templates') {
                    let refpdbname2score = domainid2refpdbnamelist[domainid];
                    let refpdbnameList = Object.keys(refpdbname2score);
                    refpdbnameList.sort(function(a, b) {
                        return refpdbname2score[b] - refpdbname2score[a]
                    });
                    // top templates
                    ic.domainid2refpdbname[domainid] = refpdbnameList.slice(0, this.topClusters);
                }
            }
        }

        return domainid2segs; // only used in round 2
    }

    async parseAlignData(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
        let bNoMoreIg = false;

        let domainid2segs = this.parseAlignData_part1(dataArray, domainidpairArray, bRound1);

        // no more Igs to detect
        // no need to rerun the rest residues any more
        if(Object.keys(domainid2segs).length == 0) {
            bNoMoreIg = true;
            return bNoMoreIg;
        }

        if(bRound1) {
            if(!me.bNode) console.log("Start round 2 alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));

            // start round2
            let ajaxArray = [];
            let domainidpairArray3 = [];
            let urltmalign = me.htmlCls.tmalignUrl;
            for(let domainid in ic.domainid2refpdbname) {
                let pdbAjaxArray = [];
                let refpdbnameList = ic.domainid2refpdbname[domainid];
                //let pdbid = domainid.substr(0, domainid.indexOf('_'));
                let chainid = domainid.substr(0, domainid.indexOf(','));

                if(ic.refpdbHash.hasOwnProperty(chainid)) {
                    refpdbnameList = [chainid];

                    if(!me.bNode) console.log("Adjusted refpdbname for domainid " + domainid + ": " + chainid);
                }

                let templates = [];
                for(let i = 0, il = refpdbnameList.length; i < il; ++i) {
                    let refpdbname = refpdbnameList[i];
                    if(!ic.refpdbHash[refpdbname]) continue;
                    templates = templates.concat(ic.refpdbHash[refpdbname]);
                }
    
                // if(!ic.refpdbHash[refpdbname]) {
                if(templates.length == 0) {
                    continue;
                }

                for(let k = 0, kl = templates.length; k < kl; ++k) {
                    let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + templates[k];

                    let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

                    pdbAjaxArray.push(pdbAjax);
                }

                //let allPromise2 = Promise.allSettled(pdbAjaxArray);
                //ic.pdbDataArray = await allPromise2;

                let pdbDataArray = await this.promiseWithFixedJobs(pdbAjaxArray);

                let pdb_target = ic.domainid2pdb[domainid];
                for(let index = 0, indexl = pdbDataArray.length; index < indexl; ++index) {
                    let struct2 = ic.defaultPdbId + index;
                    //let pdb_query = (me.bNode) ? pdbDataArray[index] : pdbDataArray[index].value; //[0];
                    let pdb_query = pdbDataArray[index].value; //[0];
                    let header = 'HEADER                                                        ' + struct2 + '\n';
                    pdb_query = header + pdb_query;

                    let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": templates[index]};
                    let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);
                    ajaxArray.push(alignAjax);

                    domainidpairArray3.push(domainid + "|" + templates[index]);
                }
            }

            let dataArray3 = [];
            //let allPromise = Promise.allSettled(ajaxArray);
            //dataArray3 = await allPromise;

            dataArray3 = await this.promiseWithFixedJobs(ajaxArray);

            bNoMoreIg = await this.parseAlignData(dataArray3, domainidpairArray3, false);

            // end of round 2
            return bNoMoreIg;
        }

        this.parseAlignData_part3(domainid2segs);

        return bNoMoreIg;
    }

    parseAlignData_part3(domainid2segs) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid2segs = {};

        // combine domainid into chainid
        let processedChainid = {};

        for(let domainid in ic.domainid2refpdbname) {
            // remove the first round template
            if(ic.domainid2refpdbname[domainid][0].substr(0,1) == '1') {
                delete ic.domainid2refpdbname[domainid];
                delete ic.domainid2score[domainid];
                continue;
            }

            let chainid = domainid.split(',')[0];

            if(!processedChainid.hasOwnProperty(chainid)) {
                ic.chainid2refpdbname[chainid] = [];
                // ic.chainid2score[chainid] = [];
            }
            processedChainid[chainid] = 1;

            if(!ic.chainid2refpdbname.hasOwnProperty(chainid)) ic.chainid2refpdbname[chainid] = [];
            ic.chainid2refpdbname[chainid].push(ic.domainid2refpdbname[domainid][0] + '|' + domainid);

            // if(!ic.chainid2score.hasOwnProperty(chainid)) ic.chainid2score[chainid] = [];
            // ic.chainid2score[chainid].push(ic.domainid2score[domainid] + '|' + domainid);
        }

/*
        // combine domainid into chainid
        for(let domainid in domainid2segs) {
            let chainid = domainid.split(',')[0];
            if(!chainid2segs[chainid]) chainid2segs[chainid] = [];
            chainid2segs[chainid] = chainid2segs[chainid].concat(domainid2segs[domainid]);
        }
*/

        // assign ic.resid2refnum, ic.refnum2residArray, ic.chainsMapping
        if(!ic.resid2refnum) ic.resid2refnum = {};
        // if(!ic.resid2refnum_ori) ic.resid2refnum_ori = {};
        if(!ic.refnum2residArray) ic.refnum2residArray = {};
        if(!ic.chainsMapping) ic.chainsMapping = {};

        // if(!ic.refPdbList) ic.refPdbList = [];
        if(!ic.domainid2info) ic.domainid2info = {};

        //for(let chainid in chainid2segs) {
            // let segArray = chainid2segs[chainid];
        for(let domainid in domainid2segs) {
            let segArray = domainid2segs[domainid];
            let chainid = domainid.split(',')[0];

            let result = this.getTemplateList(domainid);
            let refpdbname = result.refpdbname;
            let score = result.score;
            let seqid = result.seqid;
            let nresAlign = result.nresAlign;

            if(refpdbname) {
                let message = "The reference PDB for domain " + domainid + " is " + refpdbname + ". The TM-score is " + score  + ". The sequence identity is " + seqid  + ". The number of aligned residues is " + nresAlign + ".";

                if(!me.bNode) {
                    console.log(message);
                    me.htmlCls.clickMenuCls.setLogCmd(message, false, true);
                }

                // ic.refPdbList.push(message);
                ic.domainid2info[domainid] = {'refpdbname': refpdbname, 'score': score, 'seqid': seqid, 'nresAlign': nresAlign};
            }

            // adjust C' and D strands ======start
            let bCstrand = false, bCpstrand = false, bCppstrand = false, bDstrand = false, bEstrand = false;
            let CAtom, CpAtom, DAtom, EAtom;
            let CAtomArray = [], EAtomArray = [];

            //let chainid = domainid.split(',')[0];

            let cntBtwCE;
            let CpToDResi = [], DToCpResi = [];
            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                if(!seg) continue;

                let resi = seg.t_start;
                let resid = chainid + '_' + resi;

                if(seg.q_start.indexOf('3550') != -1) {
                    bCstrand = true;
                    CAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);

                    // a chain could have multiple Ig domains
                    cntBtwCE = 0;
                }
                else if(seg.q_start.indexOf('4550') != -1) {
                    bCpstrand = true;
                    CpAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                    ++cntBtwCE;
                }
                // else if(seg.q_start.indexOf('5550') != -1) {
                //     bCppstrand = true;
                //     CppAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                //     ++cntBtwCE;
                // }
                else if(seg.q_start.indexOf('6550') != -1) {
                    bDstrand = true;
                    DAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                    ++cntBtwCE;
                }
                else if(seg.q_start.indexOf('7550') != -1) {
                    bEstrand = true;
                    EAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                }

                if(seg.q_start >= 3545 && seg.q_start <= 3555) {
                    let atomTmp = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                    if(atomTmp) CAtomArray.push(atomTmp);
                }
                else if(seg.q_start >= 7545 && seg.q_start <= 7555) {
                    let atomTmp = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                    if(atomTmp) EAtomArray.push(atomTmp);
                }

                if(seg.q_start.indexOf('8550') != -1) {
                    // check C' and D strands
                    if(cntBtwCE == 1 && CAtom && EAtom && (CpAtom || DAtom)) {
                        let distToC = 999, distToE = 999;
                        for(let j = 0, jl = CAtomArray.length; j < jl; ++j) {
                            let dist = (bCpstrand) ? CpAtom.coord.distanceTo(CAtomArray[j].coord) : DAtom.coord.distanceTo(CAtomArray[j].coord);
                            if(dist < distToC) distToC = dist;
                        }
                        for(let j = 0, jl = EAtomArray.length; j < jl; ++j) {
                            let dist = (bCpstrand) ? CpAtom.coord.distanceTo(EAtomArray[j].coord) : DAtom.coord.distanceTo(EAtomArray[j].coord);
                            if(dist < distToE) distToE = dist;
                        }

                        distToC = parseInt(distToC);
                        distToE = parseInt(distToE);

                        let resiDistToC = (bCpstrand) ? parseInt(CpAtom.resi) - parseInt(CAtom.resi) : parseInt(DAtom.resi) - parseInt(CAtom.resi);
                        let resiDistToE = (bCpstrand) ? parseInt(EAtom.resi) - parseInt(CpAtom.resi) : parseInt(EAtom.resi) - parseInt(DAtom.resi);

                        let adjust = 1;

                        if(bCpstrand) {
                            if(distToC > distToE + adjust || (distToC == distToE + adjust && resiDistToC > resiDistToE + adjust)) { // rename C' to D
                                CpToDResi.push(CpAtom.resi);
                                if(!me.bNode) console.log("Rename strand C' to D: distToC " + distToC + " distToE " + distToE + " resiDistToC " + resiDistToC + " resiDistToE " + resiDistToE)
                            }
                        }
                        else if(bDstrand) {
                            if(distToC + adjust < distToE || (distToC + adjust == distToE && resiDistToC + adjust < resiDistToE)) { // rename D to C'
                                DToCpResi.push(DAtom.resi);
                                if(!me.bNode) console.log("Rename strand D to C': distToC " + distToC + " distToE " + distToE + " resiDistToC " + resiDistToC + " resiDistToE " + resiDistToE)
                            }
                        }
                    }
                }

                if(bCstrand && bCpstrand && bCppstrand && bDstrand && bEstrand) break;
            }

            let currStrand;

            // let bCd19 = refpdbnameArray.length == 1 && refpdbnameArray[0] == 'CD19_6al5A_human-n1';
            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                if(!seg) continue;

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
                    //let refnum = qStart;
                    let refnum = qStartInt;

                    let refnumLabel = this.getLabelFromRefnum(refnum, postfix);
                    currStrand = (refnumLabel) ? refnumLabel.replace(new RegExp(refnum,'g'), '') : undefined;

                    let currStrandFinal = currStrand;
                    if(currStrand == "C'" && CpToDResi.length > 0) {
                        for(let j = 0, jl = CpToDResi.length; j < jl; ++j) {
                            if(parseInt(seg.t_start) < parseInt(CpToDResi[j]) + 10 && parseInt(seg.t_start) > parseInt(CpToDResi[j]) - 10 ) {
                                currStrandFinal = "D";
                                break;
                            }
                        }
                    }
                    else if(currStrand == "D" && DToCpResi.length > 0) {
                        for(let j = 0, jl = DToCpResi.length; j < jl; ++j) {
                            if(parseInt(seg.t_start) < parseInt(DToCpResi[j]) + 10 && parseInt(seg.t_start) > parseInt(DToCpResi[j]) - 10 ) {
                                currStrandFinal = "C'";
                                break;
                            }
                        }
                    }

                    if(currStrand != currStrandFinal) {
                        refnumLabel = this.getLabelFromRefnum(refnum, postfix, currStrandFinal);
                    }

                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                    // only sheet or loop will be aligned
                    if(atom.ss != 'helix') {
                        ic.resid2refnum[resid] = refnumLabel;
                        // ic.resid2refnum_ori[resid] = refnumLabel;
                        ic.resid2domainid[resid] = domainid;
                    }
                //}
            }
        }

        if(Object.keys(ic.resid2refnum).length > 0) {
            ic.bShowRefnum = true;
            //ic.annotationCls.setAnnoViewAndDisplay('detailed view');
        }
        else if(!me.bNode) {
            if(!ic.bNoIg) {
                // alert("No Ig reference numbers are assigned based on the reference structures in iCn3D...");
                console.log("No Ig reference numbers are assigned based on the reference structures in iCn3D...");
                ic.bNoIg = true;
            }
        }

        if(!ic.chainid2igtrack) ic.chainid2igtrack = {};
        for(let chainid in ic.chains) {
            let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]);
            if(ic.proteins.hasOwnProperty(atom.serial)) {
                let giSeq = ic.showSeqCls.getSeq(chainid);
                ic.chainid2igtrack[chainid] = this.ajdustRefnum(giSeq, chainid);
            }
        }
    }

    getStrandFromRefnum(oriRefnum, finalStrand) { let ic = this.icn3d, me = ic.icn3dui;
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

        let strand;
/*
        if(refnum < 1000) strand = undefined;
        else if(refnum >= 1200 && refnum < 1290) strand = "A---";
        else if(refnum >= 1320 && refnum < 1390) strand = "A--";
        else if(refnum >= 1420 && refnum < 1490) strand = "A-";
        else if(refnum >= 1520 && refnum < 1590) strand = "A";
        else if(refnum >= 1620 && refnum < 1690) strand = "A+";
        else if(refnum >= 1820 && refnum < 1890) strand = "A'";
        else if(refnum >= 2000 && refnum < 2900) strand = "B";
        else if(refnum >= 3300 && refnum < 3390) strand = "C--";
        else if(refnum >= 3420 && refnum < 3490) strand = "C-";
        else if(refnum >= 3520 && refnum < 3590) strand = "C";
        else if(refnum >= 4000 && refnum < 4900) strand = "C'";
        else if(refnum >= 5000 && refnum < 5900) strand = "C''";
        else if(refnum >= 6000 && refnum < 6900) strand = "D";
        else if(refnum >= 7500 && refnum < 7590) strand = "E";
        else if(refnum >= 7620 && refnum < 7900) strand = "E+";
        else if(refnum >= 8000 && refnum < 8900) strand = "F";
        else if(refnum >= 9500 && refnum < 9590) strand = "G";
        else if(refnum >= 9620 && refnum < 9690) strand = "G+";
        else if(refnum >= 9720 && refnum < 9790) strand = "G++";
        else if(refnum > 9900) strand = undefined;
        else strand = " ";
*/

        // cover all ranges
        if(refnum < 1000) strand = undefined;
        else if(refnum >= 1200 && refnum < 1320) strand = "A---";
        else if(refnum >= 1320 && refnum < 1420) strand = "A--";
        else if(refnum >= 1420 && refnum < 1520) strand = "A-";
        else if(refnum >= 1520 && refnum < 1620) strand = "A";
        else if(refnum >= 1620 && refnum < 1720) strand = "A+";
        else if(refnum >= 1720 && refnum < 1820) strand = "A++";
        else if(refnum >= 1820 && refnum < 2000) strand = "A'";
        else if(refnum >= 2000 && refnum < 3000) strand = "B";
        else if(refnum >= 3000 && refnum < 3420) strand = "C--";
        else if(refnum >= 3420 && refnum < 3520) strand = "C-";
        else if(refnum >= 3520 && refnum < 4000) strand = "C";
        else if(refnum >= 4000 && refnum < 5000) strand = "C'";
        else if(refnum >= 5000 && refnum < 6000) strand = "C''";
        else if(refnum >= 6000 && refnum < 7000) strand = "D";
        else if(refnum >= 7000 && refnum < 7620) strand = "E";
        else if(refnum >= 7620 && refnum < 8000) strand = "E+";
        else if(refnum >= 8000 && refnum < 9000) strand = "F";
        else if(refnum >= 9000 && refnum < 9620) strand = "G";
        else if(refnum >= 9620 && refnum < 9720) strand = "G+";
        else if(refnum >= 9720 && refnum < 9820) strand = "G++";
        else if(refnum >= 9820 && refnum < 9900) strand = "G+++";
        else if(refnum > 9900) strand = undefined;
        else strand = " ";

        if(finalStrand) strand = finalStrand;

        return strand
    }

    getLabelFromRefnum(oriRefnum, postfix, finalStrand) { let ic = this.icn3d, me = ic.icn3dui;
        let strand = this.getStrandFromRefnum(oriRefnum, finalStrand);

        // rename C' to D or D to C'
        let refnum = oriRefnum.toString();
        if(finalStrand == "C'" && refnum.substr(0, 1) == '6') { // previous D
            refnum = '4' + refnum.substr(1);
        }
        else if(finalStrand == "D" && refnum.substr(0, 1) == '4') { // previous C'
            refnum = '6' + refnum.substr(1);
        }

        if(strand) {
            return strand + refnum + postfix;
        }
        else {
            return undefined;
        }
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

                if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                    ic.chainsMapping[chainid] = {};
                }

                let resid = chainid + '_' + resi;

                if(resi && refnum) {
                    ic.resid2refnum[resid] = refnum;

                    ic.chainsMapping[chainid][resid] = refnum;
                }
                else {
                    ic.chainsMapping[chainid][resid] = resi;
                }
            }
        }

        // open sequence view
        await ic.showAnnoCls.showAnnotations();
        ic.annotationCls.setAnnoViewAndDisplay('detailed view');
    }

    rmStrandFromRefnumlabel(refnumLabel) { let ic = this.icn3d, me = ic.icn3dui;
        if(refnumLabel && isNaN(refnumLabel.substr(0,1))) {
            return (!refnumLabel) ? refnumLabel : refnumLabel.replace(/'/g, '').replace(/\*/g, '').replace(/\^/g, '').replace(/\+/g, '').replace(/\-/g, '').substr(1); // C', C''
        }
        else { // custom ref numbers
            return refnumLabel;
        }
    }

    exportRefnum(type, bNoArraySymbol) { let ic = this.icn3d, me = ic.icn3dui;
        let refData = '';

        // 1. show IgStrand ref numbers
        if(type == 'igstrand' || type == 'IgStrand') {
            // iGStrand reference numbers were adjusted when showing in sequences
            // if(me.bNode) {        
            if(ic.bShowRefnum) {
                for(let chnid in ic.chains) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chnid]);
                    if(ic.proteins.hasOwnProperty(atom.serial)) {
                        let giSeq = [];
                        for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
                            giSeq.push(ic.chainsSeq[chnid][i].name);
                        }
                        ic.annoIgCls.showRefNum(giSeq, chnid);
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

        // if(bIgDomain) {
            for(let structure in ic.structures) {
                let bIgDomain = 0;
                let refDataTmp = '';
                for(let m = 0, ml = ic.structures[structure].length; ic.bShowRefnum && m < ml; ++m) {
                    let chnid = ic.structures[structure][m]; 
                    let igArray = ic.chain2igArray[chnid];

                    if(igArray && igArray.length > 0) {
                        refDataTmp += '{"' + chnid + '": {\n';

                        for(let i = 0, il = igArray.length; i < il; ++i) {
                            let startPosArray = igArray[i].startPosArray;
                            let endPosArray = igArray[i].endPosArray;
                            let domainid = igArray[i].domainid;
                            let info = ic.domainid2info[domainid];
                            if(!info) continue;

                            refDataTmp += '"' + domainid + '": {\n';

                            refDataTmp += '"refpdbname":"' + info.refpdbname + '", "score":' + info.score + ', "seqid":' + info.seqid + ', "nresAlign":' + info.nresAlign + ', "data": [';
                            for(let j = 0, jl = startPosArray.length; j < jl; ++j) {
                                let startPos = startPosArray[j];
                                let endPos = endPosArray[j];
                                for(let k = startPos; k <= endPos; ++k) {
                                    const resid = chnid + '_' + ic.chainsSeq[chnid][k].resi + '_' + ic.chainsSeq[chnid][k].name;
                                    refDataTmp += '{"' + resid + '": "' + resid2refnum[resid] + '"},\n';
                                }
                            }
                            refDataTmp += '],\n';

                            refDataTmp += '},\n';

                            bIgDomain = 1;
                        }

                        refDataTmp += '}},\n';
                    }
                }

                refData += '{"' + structure + '": {"Ig domain" : ' + bIgDomain + ', "igs": [\n';

                if(bIgDomain) refData += refDataTmp;

                refData += ']}},\n';
            }
        // }
        }
        // 2. show Kabat ref numbers
        else if(type == 'kabat' || type == 'Kabat') {
            let resid2kabat = {};
            for(let resid in ic.resid2refnum) {
                let domainid = ic.resid2domainid[resid];
                let refnumStr, refnumLabel = ic.resid2refnum[resid];

                let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                if(!atom) continue;
                let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));

                if(refnumLabel) {
                    let refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    refnumStr = (ic.domainid2ig2kabat[domainid]) ? ic.domainid2ig2kabat[domainid][refnumStr_ori] : undefined;
                }

                resid2kabat[resid + '_' + resn] = refnumStr;
            }

            refData += '{"Kabat": ';
            refData += JSON.stringify(resid2kabat);
            refData += ',\n';
        }
        // 3. show IMGT ref numbers
        else if(type == 'imgt'|| type == 'IMGT') {
            let resid2imgt = {};
            for(let resid in ic.resid2refnum) {
                let domainid = ic.resid2domainid[resid];
                let refnumStr, refnumLabel = ic.resid2refnum[resid];

                let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                if(!atom) continue;
                let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));

                if(refnumLabel) {
                    let refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                    refnumStr = (ic.domainid2ig2imgt[domainid]) ? ic.domainid2ig2imgt[domainid][refnumStr_ori] : undefined;
                }

                resid2imgt[resid + '_' + resn] = refnumStr;
            }

            refData += '{"Kabat": ';
            refData += JSON.stringify(resid2imgt);
            refData += ',\n';
        }


        if(!bNoArraySymbol) {
            refData = '[' + refData + ']';
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
        if(!me.bNode) me.icn3d.ParserUtilsCls.showLoading();

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

        if(!me.bNode) me.icn3d.ParserUtilsCls.hideLoading();

        return dataArray3;
    }

    ajdustRefnum(giSeq, chnid) {  let ic = this.icn3d, me = ic.icn3dui;
        if(!ic.chainid2refpdbname[chnid]) return false;

        // auto-generate ref numbers for loops 
        let bLoop = false, currStrand = '', prevStrand = '', prevValidStrand = '', currFirstDigit = '', currCnt =  1;
        let refnumLabel, refnumStr_ori, refnumStr, postfix, strandPostfix, refnum, refnum3c, refnum2c;
        let bExtendedStrand = false, bSecThird9 = false;

        // set hash for the loops
        let strand2len_start_stop = {};
        let prevRefnumStr, prevPostfix, prevRefnum;

        // sometimes one chain may have several Ig domains,set an index for each IgDomain
        let index = 1, prevStrandPostfix = '', bStart = false;

        if(!me.bNode) { // do not overwrite loops in node  
            // reset ic.residIgLoop for the current selection, which could be the second round of ref num assignment
            // just current chain
            let atomHash = me.hashUtilsCls.intHash(ic.chains[chnid], ic.hAtoms);
            let residHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomHash);
        }

        // 1. get the range of each strand excluding loops
        let strandArray = [], strandHash = {}, strandCnt = 0, resCnt = 0, resCntBfAnchor = 0, resCntAtAnchor = 0;
        let bFoundAnchor = false;

        for(let i = 0, il = giSeq.length; i < il; ++i, ++resCnt, ++resCntBfAnchor, ++resCntAtAnchor) {
            let currResi = ic.ParserUtilsCls.getResi(chnid, i);
            let residueid = chnid + '_' + currResi;
            let domainid;

            refnumLabel = ic.resid2refnum[residueid];

            let firstChar = (refnumLabel) ? refnumLabel.substr(0,1) : '';
            if(!bStart && refnumLabel && (firstChar == 'A' || firstChar == 'B')) { // start of a new IG domain
                bStart = true;
                resCnt = 1; // the first one is included
                bFoundAnchor = false;
            }

            //if((prevStrand.substr(0,1) == 'F' || prevStrand.substr(0,1) == 'G') && !refnumLabel) { // indicate the end of an IG domain
            if((prevStrand.substr(0,1) == 'G') && !refnumLabel) { // indicate the end of an IG domain
                    bStart = false;
            }

            if(refnumLabel) {    
                domainid = ic.resid2domainid[residueid];

                refnumStr_ori = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                currStrand = refnumLabel.replace(new RegExp(refnumStr_ori,'g'), '');
                currFirstDigit = refnumStr_ori.substr(0, 1);

                refnumStr = refnumStr_ori;
                refnum = parseInt(refnumStr);
                refnum3c = (refnum - parseInt(refnum/1000) * 1000).toString();
                refnum2c = (refnum - parseInt(refnum/100) * 100).toString();

                // for extended strands, since A is 1550 and A+ is 1650, then the AA+ loop will be 1591, 1592, ... 1618, 1619, etc
                bSecThird9 = refnum3c.substr(0,1) == '9' || refnum2c.substr(0,1) == '9' || refnum2c.substr(0,1) == '0' || refnum2c.substr(0,1) == '1';
                if(bSecThird9) ic.residIgLoop[residueid] = 1;

                strandPostfix = refnumStr.replace(refnum.toString(), '');

                postfix = strandPostfix + '_' + index;

                let firstTwo = parseInt(refnum.toString().substr(0, 2)); // check extended strands
                bExtendedStrand = refnum3c.substr(0,1) != '5' && firstTwo != '18'; // all strands and A' (18##)

                if(currStrand && currStrand != ' ') {
                    if(!bSecThird9 || (bExtendedStrand && !bSecThird9)) {
                        let lastTwo = parseInt(refnum.toString().substr(refnum.toString().length - 2, 2));
                        
                        // reset currCnt
                        if(currStrand != prevStrand && currStrand != prevValidStrand) { // sometimes the same resid appear several times, e.g, 7M7B_H_135
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
                            
                            strandArray[strandCnt].domainid = domainid;

                            strandArray[strandCnt].endResi = currResi;
                            strandArray[strandCnt].endRefnum = refnum; // 1250a

                            if(lastTwo == 50) {
                                strandArray[strandCnt].anchorRefnum = refnum;
                                strandArray[strandCnt].resCntBfAnchor = resCntBfAnchor;

                                resCntAtAnchor = 0;

                                bFoundAnchor = true;
                            }
                            
                            // in case A1550 is not found, but A1551 is found
                            if(!bFoundAnchor && (lastTwo >= 46 && lastTwo <= 54) ) {
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
                                if(!bFoundAnchor && (lastTwo == 51 || lastTwo == 52 || lastTwo == 53 || lastTwo == 54) ) {
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

                                strandArray[strandCnt - 1].domainid = domainid;

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

                    prevValidStrand = currStrand;
                }
            }

            prevRefnumStr = refnumStr;
            prevRefnum = refnum;
            prevPostfix = postfix;

            prevStrand = currStrand;
        }

        // 2. extend the strand to end of sheet
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
                    let domainid = ic.resid2domainid[currResid];
                    if(currAtom.ssbegin) { // find the start of the sheet
                        // update the following: startResi,startRefnum,endResi,endRefnum,loopResCnt,resCntBfAnchor,resCntAtAnchor
                        let oriStartRefnum = strandArray[i].startRefnum;
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
                            ic.resid2refnum[currResid] = strandArray[i].strand + (oriStartRefnum - k).toString();

                            ic.resid2domainid[currResid] = domainid;
                            // ic.resid2refnum_ori[currResid] = 1; // a hash to check which residues were assigned
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
                    let domainid = ic.resid2domainid[currResid];
                    if(currAtom.ssend) { // find the end of the sheet
                        // update the following: startResi,startRefnum,endResi,endRefnum,loopResCnt,resCntBfAnchor,resCntAtAnchor
                        let oriEndRefnum = strandArray[i].endRefnum;
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
                            ic.resid2refnum[currResid] = strandArray[i].strand + (oriEndRefnum + k).toString();

                            ic.resid2domainid[currResid] = domainid;
                            // ic.resid2refnum_ori[currResid] = 1; // a hash to check which residues were assigned
                        }

                        break;
                    }
                }
            }
        }

        // 2b. remove strands with less than 3 residues except G strand
        let removeDomainidHash = {};
        for(let il = strandArray.length, i = il - 1; i >= 0; --i) {
            // let strandTmp = strandArray[i].strand.substr(0, 1);
            let strandTmp = strandArray[i].strand;

            if(strandTmp != 'G' && strandArray[i].endRefnum - strandArray[i].startRefnum + 1 < 3) { // remove the strand
                if(strandArray[i + 1]) { // modify 
                    strandArray[i + 1].loopResCnt += strandArray[i].loopResCnt + parseInt(strandArray[i].endResi) - parseInt(strandArray[i].startResi) + 1;
                }
                
                // assign before removing
                let resid = chnid + '_' + strandArray[i].startResi;

                strandArray.splice(i, 1);

                // do not remove BCEF strands even though they are short
                // if(strandTmp == 'B' || strandTmp == 'C' || strandTmp == 'E' || strandTmp == 'F') {
                //     if(!me.bNode) console.log("Ig strand " + strandTmp + " is removed since it is too short...");
                    
                //     let domainid = ic.resid2domainid[resid];
                //     removeDomainidHash[domainid] = 1;
                //     continue;
                // }   
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

                let domainid;

                if(refnumLabel) {
                    domainid = ic.resid2domainid[residueid];

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
                                domainid = strandArray[strandCnt].domainid;
                            }    
                            else {
                                refnumLabelNoPostfix = undefined;
                                refnumLabel = undefined;
                            }                        
                        }
                        else {
                            // if(prevStrandCnt >= 0 && (strandArray[prevStrandCnt].strand.substr(0, 1) == 'G')) {
                            if(prevStrandCnt >= 0 && (strandArray[prevStrandCnt].strand.substr(0, 1) == 'G' || (strandArray[prevStrandCnt].strand.substr(0, 1) == 'F' && strandArray[strandCnt].strand.substr(0, 1) != 'G') )) {
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
                                        domainid = strandArray[prevStrandCnt].domainid;
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
                                    if(strandArray[prevStrandCnt]) {
                                        currRefnum = strandArray[prevStrandCnt].endRefnum + loopCnt;
                                        refnumLabelNoPostfix = strandArray[prevStrandCnt].strand + currRefnum;
                                        refnumLabel = refnumLabelNoPostfix  + strandArray[prevStrandCnt].strandPostfix; 
                                        domainid = strandArray[prevStrandCnt].domainid;
                                    }
                                }
                                else {
                                    currRefnum = strandArray[strandCnt].startRefnum - len + loopCnt - 1;
                                    refnumLabelNoPostfix = strandArray[strandCnt].strand + currRefnum;
                                    refnumLabel = refnumLabelNoPostfix  + strandArray[strandCnt].strandPostfix; 
                                    domainid = strandArray[strandCnt].domainid;
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
                            domainid = strandArray[strandCnt].domainid;
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
                                domainid = strandArray[strandCnt].domainid;
                            }
                        }
                    }
                }

                prevStrand = currStrand;
                prevStrandCnt = strandCnt - 1;

                // remove domians without B,C,E,F strands
                if(removeDomainidHash.hasOwnProperty(domainid)) {
                    delete ic.resid2refnum[residueid];
                    delete ic.residIgLoop[residueid];
                    delete ic.resid2domainid[residueid];

                    continue;
                }

                // assign the adjusted reference numbers
                ic.resid2refnum[residueid] = refnumLabel;
                ic.resid2domainid[residueid] = domainid;

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
                ic.chainsMapping[chnid][residueid] = (refnumLabelNoPostfix) ? refnumLabelNoPostfix : currResi;
            }
        }

        return true;
    }
 }

 export {Refnum}
