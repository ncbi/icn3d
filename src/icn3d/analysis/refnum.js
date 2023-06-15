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
 
    async showIgRefNum() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        // if(ic.pdbDataArray) {
        //     await thisClass.parseRefPdbData(ic.pdbDataArray);
        // }
        // else {
        //ic.refpdbArray = ['ASF1A_2iijA_human', 'B2Microglobulin_7phrL_human_C1', 'BArrestin1_4jqiA_rat_n1', 'BTLA_2aw2A_human_Iset', 'C3_2qkiD_human_n1', 'CD19_6al5A_human_C2orV-n1', 'CD2_1hnfA_human_C2-n2', 'CD2_1hnfA_human_V-n1', 'CD8a_1cd8A_human_V', 'CoAtomerGamma1_1r4xA_human', 'Contactin1_2ee2A_human_FN3-n9', 'Contactin1_3s97C_human_C2-n2', 'CuZnSuperoxideDismutase_1hl5C_human', 'ECadherin_4zt1A_human_n2', 'Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'FAB-HEAVY_5esv_C1-n2', 'FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_C1-n2', 'FAB-LIGHT_5esv_V-n1', 'GHR_1axiB_human_FN3-n1', 'ICOS_6x4gA_human_V', 'IL6Rb_1bquB_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n3', 'InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2', 'IsdA_2iteA_bacteria', 'JAM1_1nbqA_human_VorIset-n2', 'LAG3_7tzgD_human_C2-n2', 'LAG3_7tzgD_human_V-n1', 'LaminAC_1ifrA_human', 'MHCIa_7phrH_human_C1', 'MPT63_1lmiA_bacteria', 'NaCaExchanger_2fwuA_dog_n2', 'NaKATPaseTransporterBeta_2zxeB_spurdogshark', 'ORF7a_1xakA_virus', 'PD1_4zqkB_human_V', 'PDL1_4z18B_human_V-n1', 'Palladin_2dm3A_human_Iset-n1', 'RBPJ_6py8C_human_Unk-n1', 'RBPJ_6py8C_human_Unk-n2', 'Sidekick2_1wf5A_human_FN3-n7', 'Siglec3_5j0bB_human_C2-n2', 'TCRa_6jxrm_human_C1-n2', 'TCRa_6jxrm_human_V-n1', 'TEAD1_3kysC_human', 'TP34_2o6cA_bacteria', 'TP47_1o75A_bacteria', 'Titin_4uowM_human_Unk-n152', 'VISTA_6oilA_human_V', 'VNAR_1t6vN_shark_V', 'VTCN1_Q7Z7D3_human_V-n2'];
        
        //ic.refpdbArray = ['1ASF1A_2iijA_human', '1B2Microglobulin_7phrL_human_C1', '1BArrestin1_4jqiA_rat_n1', '1BTLA_2aw2A_human_Iset', '1C3_2qkiD_human_n1', '1CD19_6al5A_human_C2orV-n1', '1CD2_1hnfA_human_C2-n2', '1CD2_1hnfA_human_V-n1', '1CD8a_1cd8A_human_V', '1CoAtomerGamma1_1r4xA_human', '1Contactin1_2ee2A_human_FN3-n9', '1Contactin1_3s97C_human_C2-n2', '1CuZnSuperoxideDismutase_1hl5C_human', '1ECadherin_4zt1A_human_n2', '1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', '1FAB-HEAVY_5esv_C1-n2', '1FAB-HEAVY_5esv_V-n1', '1FAB-LIGHT_5esv_C1-n2', '1FAB-LIGHT_5esv_V-n1', '1GHR_1axiB_human_FN3-n1', '1ICOS_6x4gA_human_V', '1IL6Rb_1bquB_human_FN3-n2', '1IL6Rb_1bquB_human_FN3-n3', '1InsulinR_8guyE_human_FN3-n1', '1InsulinR_8guyE_human_FN3-n2', '1IsdA_2iteA_bacteria', '1JAM1_1nbqA_human_VorIset-n2', '1LAG3_7tzgD_human_C2-n2', '1LAG3_7tzgD_human_V-n1', '1LaminAC_1ifrA_human', '1MHCIa_7phrH_human_C1', '1MPT63_1lmiA_bacteria', '1NaCaExchanger_2fwuA_dog_n2', '1NaKATPaseTransporterBeta_2zxeB_spurdogshark', '1ORF7a_1xakA_virus', '1PD1_4zqkB_human_V', '1PDL1_4z18B_human_V-n1', '1Palladin_2dm3A_human_Iset-n1', '1RBPJ_6py8C_human_Unk-n1', '1RBPJ_6py8C_human_Unk-n2', '1Sidekick2_1wf5A_human_FN3-n7', '1Siglec3_5j0bB_human_C2-n2', '1TCRa_6jxrm_human_C1-n2', '1TCRa_6jxrm_human_V-n1', '1TEAD1_3kysC_human', '1TP34_2o6cA_bacteria', '1TP47_1o75A_bacteria', '1Titin_4uowM_human_Unk-n152', '1VISTA_6oilA_human_V', '1VNAR_1t6vN_shark_V', '1VTCN1_Q7Z7D3_human_V-n2'];
     
/*
        // round 1
        ic.refpdbArray = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark', 'GHR_1axiB_human_FN3-n1', 'FAB-HEAVY_5esv_C1-n2', 'IL6Rb_1bquB_human_FN3-n2', 'LAG3_7tzgD_human_C2-n2', 'VNAR_1t6vN_shark_V', 'VISTA_6oilA_human_V', 'CD19_6al5A_human_C2orV-n1', 'TP47_1o75A_bacteria', 'TP34_2o6cA_bacteria'];
        // round 2
        ic.refpdbHash = {};

        ic.refpdbHash['NaKATPaseTransporterBeta_2zxeB_spurdogshark'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark', 'ORF7a_1xakA_virus', 'NaCaExchanger_2fwuA_dog_n2', 'BArrestin1_4jqiA_rat_n1', 'ECadherin_4zt1A_human_n2', 'C3_2qkiD_human_n1', 'RBPJ_6py8C_human_Unk-n1'];
        ic.refpdbHash['GHR_1axiB_human_FN3-n1'] = ['GHR_1axiB_human_FN3-n1', 'Siglec3_5j0bB_human_C2-n2', 'ICOS_6x4gA_human_V', 'CD2_1hnfA_human_C2-n2', 'Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'];
        ic.refpdbHash['FAB-HEAVY_5esv_C1-n2'] = ['FAB-HEAVY_5esv_C1-n2', 'B2Microglobulin_7phrL_human_C1', 'VTCN1_Q7Z7D3_human_V-n2', 'FAB-LIGHT_5esv_C1-n2', 'MHCIa_7phrH_human_C1'];
        ic.refpdbHash['IL6Rb_1bquB_human_FN3-n2'] = ['IL6Rb_1bquB_human_FN3-n2', 'Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n3', 'InsulinR_8guyE_human_FN3-n1', 'Sidekick2_1wf5A_human_FN3-n7', 'InsulinR_8guyE_human_FN3-n2'];
        ic.refpdbHash['LAG3_7tzgD_human_C2-n2'] = ['LAG3_7tzgD_human_C2-n2', 'JAM1_1nbqA_human_VorIset-n2', 'Contactin1_3s97C_human_C2-n2', 'Palladin_2dm3A_human_Iset-n1', 'BTLA_2aw2A_human_Iset', 'Titin_4uowM_human_Unk-n152'];
        ic.refpdbHash['VNAR_1t6vN_shark_V'] = ['VNAR_1t6vN_shark_V', 'PD1_4zqkB_human_V', 'CD8a_1cd8A_human_V', 'TCRa_6jxrm_human_V-n1', 'FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1'];
        ic.refpdbHash['VISTA_6oilA_human_V'] = ['VISTA_6oilA_human_V', 'LAG3_7tzgD_human_V-n1', 'PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1'];
        ic.refpdbHash['CD19_6al5A_human_C2orV-n1'] = ['CD19_6al5A_human_C2orV-n1'];
        ic.refpdbHash['TP47_1o75A_bacteria'] = ['TP47_1o75A_bacteria', 'TEAD1_3kysC_human', 'RBPJ_6py8C_human_Unk-n2', 'CuZnSuperoxideDismutase_1hl5C_human', 'ASF1A_2iijA_human'];
        ic.refpdbHash['TP34_2o6cA_bacteria'] = ['TP34_2o6cA_bacteria', 'TCRa_6jxrm_human_C1-n2', 'IsdA_2iteA_bacteria', 'LaminAC_1ifrA_human', 'CoAtomerGamma1_1r4xA_human', 'MPT63_1lmiA_bacteria'];
*/
/*
        // round 1
        ic.refpdbArray = ['NaCaExchanger_2fwuA_dog_n2', 'C3_2qkiD_human_n1', 'Siglec3_5j0bB_human_C2-n2', 'ICOS_6x4gA_human_V', 'B2Microglobulin_7phrL_human_C1', 'VTCN1_Q7Z7D3_human_V-n2', 'Contactin1_2ee2A_human_FN3-n9', 'InsulinR_8guyE_human_FN3-n1', 'JAM1_1nbqA_human_VorIset-n2', 'LAG3_7tzgD_human_C2-n2', 'Palladin_2dm3A_human_Iset-n1', 'PD1_4zqkB_human_V', 'CD8a_1cd8A_human_V', 'VISTA_6oilA_human_V', 'LAG3_7tzgD_human_V-n1', 'TP47_1o75A_bacteria', 'TP34_2o6cA_bacteria', 'TEAD1_3kysC_human', 'RBPJ_6py8C_human_Unk-n2', 'TCRa_6jxrm_human_C1-n2', 'IsdA_2iteA_bacteria', 'LaminAC_1ifrA_human', 'CD19_6al5A_human_C2orV-n1'];

        // round 2
        ic.refpdbHash = {};      
        ic.refpdbHash['NaCaExchanger_2fwuA_dog_n2'] = ['NaCaExchanger_2fwuA_dog_n2', 'ORF7a_1xakA_virus', 'ECadherin_4zt1A_human_n2', 'NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['C3_2qkiD_human_n1'] = ['C3_2qkiD_human_n1', 'RBPJ_6py8C_human_Unk-n1', 'BArrestin1_4jqiA_rat_n1'];
        ic.refpdbHash['Siglec3_5j0bB_human_C2-n2'] = ['Siglec3_5j0bB_human_C2-n2', 'CD2_1hnfA_human_C2-n2', 'GHR_1axiB_human_FN3-n1'];
        ic.refpdbHash['ICOS_6x4gA_human_V'] = ['ICOS_6x4gA_human_V', 'Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'];
        ic.refpdbHash['B2Microglobulin_7phrL_human_C1'] = ['B2Microglobulin_7phrL_human_C1', 'FAB-HEAVY_5esv_C1-n2', 'MHCIa_7phrH_human_C1'];
        ic.refpdbHash['VTCN1_Q7Z7D3_human_V-n2'] = ['VTCN1_Q7Z7D3_human_V-n2', 'FAB-LIGHT_5esv_C1-n2'];
        ic.refpdbHash['Contactin1_2ee2A_human_FN3-n9'] = ['Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n3', 'Sidekick2_1wf5A_human_FN3-n7'];
        ic.refpdbHash['InsulinR_8guyE_human_FN3-n1'] = ['InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n2'];
        ic.refpdbHash['JAM1_1nbqA_human_VorIset-n2'] = ['JAM1_1nbqA_human_VorIset-n2', 'Contactin1_3s97C_human_C2-n2'];
        ic.refpdbHash['LAG3_7tzgD_human_C2-n2'] = ['LAG3_7tzgD_human_C2-n2', 'BTLA_2aw2A_human_Iset'];
        ic.refpdbHash['Palladin_2dm3A_human_Iset-n1'] = ['Palladin_2dm3A_human_Iset-n1', 'Titin_4uowM_human_Unk-n152'];
        ic.refpdbHash['PD1_4zqkB_human_V'] = ['PD1_4zqkB_human_V', 'TCRa_6jxrm_human_V-n1', 'FAB-LIGHT_5esv_V-n1'];
        ic.refpdbHash['CD8a_1cd8A_human_V'] = ['CD8a_1cd8A_human_V', 'FAB-HEAVY_5esv_V-n1', 'VNAR_1t6vN_shark_V'];
        ic.refpdbHash['VISTA_6oilA_human_V'] = ['VISTA_6oilA_human_V', 'PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1'];
        ic.refpdbHash['LAG3_7tzgD_human_V-n1'] = ['LAG3_7tzgD_human_V-n1'];
        ic.refpdbHash['TP47_1o75A_bacteria'] = ['TP47_1o75A_bacteria'];
        ic.refpdbHash['TP34_2o6cA_bacteria'] = ['TP34_2o6cA_bacteria'];
        ic.refpdbHash['TEAD1_3kysC_human'] = ['TEAD1_3kysC_human', 'CuZnSuperoxideDismutase_1hl5C_human'];
        ic.refpdbHash['RBPJ_6py8C_human_Unk-n2'] = ['RBPJ_6py8C_human_Unk-n2', 'ASF1A_2iijA_human'];
        ic.refpdbHash['TCRa_6jxrm_human_C1-n2'] = ['TCRa_6jxrm_human_C1-n2'];
        ic.refpdbHash['IsdA_2iteA_bacteria'] = ['IsdA_2iteA_bacteria', 'CoAtomerGamma1_1r4xA_human'];
        ic.refpdbHash['LaminAC_1ifrA_human'] = ['LaminAC_1ifrA_human', 'MPT63_1lmiA_bacteria'];
        ic.refpdbHash['CD19_6al5A_human_C2orV-n1'] = ['CD19_6al5A_human_C2orV-n1'];
*/
        // round 1, 16 templates
        ic.refpdbArray = ['1InsulinR_8guyE_human_FN3-n1', '1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', '1CoAtomerGamma1_1r4xA_human', '1C3_2qkiD_human_n1', '1CuZnSuperoxideDismutase_1hl5C_human', '1ASF1A_2iijA_human', '1FAB-LIGHT_5esv_C1-n2', '1CD2_1hnfA_human_C2-n2', '1NaCaExchanger_2fwuA_dog_n2', '1FAB-HEAVY_5esv_V-n1', '1PDL1_4z18B_human_V-n1', '1BTLA_2aw2A_human_Iset', '1LaminAC_1ifrA_human', '1IsdA_2iteA_bacteria', '1TCRa_6jxrm_human_C1-n2', '1CD19_6al5A_human_C2orV-n1'];

        // round 2
        ic.refpdbHash = {};
        ic.refpdbHash['1InsulinR_8guyE_human_FN3-n1'] = ['InsulinR_8guyE_human_FN3-n1', 'IL6Rb_1bquB_human_FN3-n3', 'Sidekick2_1wf5A_human_FN3-n7', 'InsulinR_8guyE_human_FN3-n2', 'Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n2'];
        ic.refpdbHash['1Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'ICOS_6x4gA_human_V'];
        ic.refpdbHash['1CoAtomerGamma1_1r4xA_human'] = ['CoAtomerGamma1_1r4xA_human', 'TP34_2o6cA_bacteria', 'RBPJ_6py8C_human_Unk-n2', 'TP47_1o75A_bacteria'];
        ic.refpdbHash['1C3_2qkiD_human_n1'] = ['C3_2qkiD_human_n1', 'BArrestin1_4jqiA_rat_n1', 'RBPJ_6py8C_human_Unk-n1'];
        ic.refpdbHash['1CuZnSuperoxideDismutase_1hl5C_human'] = ['CuZnSuperoxideDismutase_1hl5C_human', 'TEAD1_3kysC_human'];
        ic.refpdbHash['1ASF1A_2iijA_human'] = ['ASF1A_2iijA_human', 'MPT63_1lmiA_bacteria'];
        ic.refpdbHash['1FAB-LIGHT_5esv_C1-n2'] = ['FAB-LIGHT_5esv_C1-n2', 'GHR_1axiB_human_FN3-n1', 'VTCN1_Q7Z7D3_human_V-n2', 'B2Microglobulin_7phrL_human_C1', 'FAB-HEAVY_5esv_C1-n2', 'MHCIa_7phrH_human_C1'];
        ic.refpdbHash['1CD2_1hnfA_human_C2-n2'] = ['CD2_1hnfA_human_C2-n2', 'Siglec3_5j0bB_human_C2-n2'];
        ic.refpdbHash['1NaCaExchanger_2fwuA_dog_n2'] = ['NaCaExchanger_2fwuA_dog_n2', 'ORF7a_1xakA_virus', 'ECadherin_4zt1A_human_n2', 'NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1FAB-HEAVY_5esv_V-n1'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1', 'VNAR_1t6vN_shark_V', 'TCRa_6jxrm_human_V-n1', 'VISTA_6oilA_human_V', 'CD8a_1cd8A_human_V', 'PD1_4zqkB_human_V'];
        ic.refpdbHash['1PDL1_4z18B_human_V-n1'] = ['PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1', 'LAG3_7tzgD_human_V-n1'];
        ic.refpdbHash['1BTLA_2aw2A_human_Iset'] = ['BTLA_2aw2A_human_Iset', 'Palladin_2dm3A_human_Iset-n1', 'Titin_4uowM_human_Unk-n152', 'LAG3_7tzgD_human_C2-n2', 'JAM1_1nbqA_human_VorIset-n2', 'Contactin1_3s97C_human_C2-n2'];
        ic.refpdbHash['1LaminAC_1ifrA_human'] = ['LaminAC_1ifrA_human'];
        ic.refpdbHash['1IsdA_2iteA_bacteria'] = ['IsdA_2iteA_bacteria'];
        ic.refpdbHash['1TCRa_6jxrm_human_C1-n2'] = ['TCRa_6jxrm_human_C1-n2'];
        ic.refpdbHash['1CD19_6al5A_human_C2orV-n1'] = ['CD19_6al5A_human_C2orV-n1'];         

        // use known ref structure
        ic.refpdbHash['5ESV'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1', 'FAB-HEAVY_5esv_C1-n2', 'FAB-LIGHT_5esv_C1-n2'];
        ic.refpdbHash['8GUY'] = ['InsulinR_8guyE_human_FN3-n1', 'InsulinR_8guyE_human_FN3-n2'];
        ic.refpdbHash['6JXR'] = ['TCRa_6jxrm_human_V-n1', 'TCRa_6jxrm_human_C1-n2'];
        ic.refpdbHash['1HNF'] = ['CD2_1hnfA_human_V-n1', 'CD2_1hnfA_human_C2-n2'];
        ic.refpdbHash['7TZG'] = ['LAG3_7tzgD_human_V-n1', 'LAG3_7tzgD_human_C2-n2'];
        ic.refpdbHash['6PY8'] = ['RBPJ_6py8C_human_Unk-n1', 'RBPJ_6py8C_human_Unk-n2'];
        ic.refpdbHash['1BQU'] = ['IL6Rb_1bquB_human_FN3-n2', 'IL6Rb_1bquB_human_FN3-n3'];

        ic.refpdbHash['1R4X'] = ['CoAtomerGamma1_1r4xA_human'];
        ic.refpdbHash['6OIL'] = ['VISTA_6oilA_human_V'];
        ic.refpdbHash['2ZXE'] = ['NaKATPaseTransporterBeta_2zxeB_spurdogshark'];
        ic.refpdbHash['1I8A'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4'];
        ic.refpdbHash['2FWU'] = ['NaCaExchanger_2fwuA_dog_n2'];
        ic.refpdbHash['4JQI'] = ['BArrestin1_4jqiA_rat_n1'];
        ic.refpdbHash['1NBQ'] = ['JAM1_1nbqA_human_VorIset-n2'];
        ic.refpdbHash['1O75'] = ['TP47_1o75A_bacteria'];
        ic.refpdbHash['7PHR'] = ['MHCIa_7phrH_human_C1'];
        ic.refpdbHash['2IIJ'] = ['ASF1A_2iijA_human'];
        ic.refpdbHash['4Z18'] = ['PDL1_4z18B_human_V-n1'];
        ic.refpdbHash['1T6V'] = ['VNAR_1t6vN_shark_V'];
        ic.refpdbHash['2O6C'] = ['TP34_2o6cA_bacteria'];
        ic.refpdbHash['3KYS'] = ['TEAD1_3kysC_human'];
        ic.refpdbHash['7PHR'] = ['B2Microglobulin_7phrL_human_C1'];
        ic.refpdbHash['2AW2'] = ['BTLA_2aw2A_human_Iset'];
        ic.refpdbHash['1HL5'] = ['CuZnSuperoxideDismutase_1hl5C_human'];
        ic.refpdbHash['1WF5'] = ['Sidekick2_1wf5A_human_FN3-n7'];
        ic.refpdbHash['5J0B'] = ['Siglec3_5j0bB_human_C2-n2'];
        ic.refpdbHash['1IFR'] = ['LaminAC_1ifrA_human'];
        ic.refpdbHash['Q7Z7D3'] = ['VTCN1_Q7Z7D3_human_V-n2'];
        ic.refpdbHash['4ZQK'] = ['PD1_4zqkB_human_V'];
        ic.refpdbHash['2DM3'] = ['Palladin_2dm3A_human_Iset-n1'];
        ic.refpdbHash['2ITE'] = ['IsdA_2iteA_bacteria'];
        ic.refpdbHash['1XAK'] = ['ORF7a_1xakA_virus'];
        ic.refpdbHash['4ZT1'] = ['ECadherin_4zt1A_human_n2'];
        ic.refpdbHash['1LMI'] = ['MPT63_1lmiA_bacteria'];
        ic.refpdbHash['1CD8'] = ['CD8a_1cd8A_human_V'];
        ic.refpdbHash['3S97'] = ['Contactin1_3s97C_human_C2-n2'];
        ic.refpdbHash['1AXI'] = ['GHR_1axiB_human_FN3-n1'];
        ic.refpdbHash['6X4G'] = ['ICOS_6x4gA_human_V'];
        ic.refpdbHash['2EE2'] = ['Contactin1_2ee2A_human_FN3-n9'];
        ic.refpdbHash['4UOW'] = ['Titin_4uowM_human_Unk-n152'];
        ic.refpdbHash['6A15'] = ['CD19_6al5A_human_C2orV-n1'];
        ic.refpdbHash['2QKI'] = ['C3_2qkiD_human_n1'];

        // if(ic.pdbDataArray) {
        //     await thisClass.parseRefPdbData(ic.pdbDataArray);
        // }
        // else {

        let pdbAjaxArray = [];
        for(let k = 0, kl = ic.refpdbArray.length; k < kl; ++k) {
            //let urlpdb = me.htmlCls.baseUrl + "icn3d/refpdb/" + ic.refpdbArray[k] + ".pdb";
            let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + ic.refpdbArray[k];

            let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

            pdbAjaxArray.push(pdbAjax);
        }

        try {
            let allPromise = Promise.allSettled(pdbAjaxArray);
            ic.pdbDataArray = await allPromise;
            await thisClass.parseRefPdbData(ic.pdbDataArray);
        }
        catch(err) {
            if(!me.bNode) alert("Error in retrieveing reference PDB data...");
            //alert("Error in retrieveing reference PDB data...");
            return;
        }       

        // }
        // }
    }

    async parseRefPdbData(dataArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let struArray = Object.keys(ic.structures);
 
        let ajaxArray = [];
        let domainidpairArray = [];

        let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";

        if(!ic.resid2domainid) ic.resid2domainid = {};
        //ic.resid2domainid = {};
        ic.domainid2pdb = {};

        let minResidues = 20;

        for(let i = 0, il = struArray.length; i < il; ++i) {
            let struct = struArray[i];
            let chainidArray = ic.structures[struct];

            for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
                let chainid = chainidArray[j];

                if(!ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]).serial)
                && !ic.proteins.hasOwnProperty(ic.firstAtomObjCls.getMiddleAtomObj(ic.chains[chainid]).serial)) continue;
                if(ic.chainsSeq[chainid].length < minResidues) continue; // peptide

                let currAtoms = me.hashUtilsCls.intHash(ic.chains[chainid], ic.hAtoms);
                if(Object.keys(currAtoms).length == 0) continue;

                // align each 3D domain with reference structure
                //let result = ic.domain3dCls.c2b_NewSplitChain(ic.chains[chainid]);
                // assign ref numbers to selected residues
                let result = ic.domain3dCls.c2b_NewSplitChain(currAtoms);
                let subdomains = result.subdomains;  
                let pos2resi = result.pos2resi;

                let domainAtomsArray = [];
                if(subdomains.length <= 1) {
                    //domainAtomsArray.push(ic.chains[chainid]);
                    domainAtomsArray.push(currAtoms);

                    let residueArray = ic.resid2specCls.atoms2residues(Object.keys(currAtoms));
                    for(let n = 0, nl = residueArray.length; n < nl; ++n) {
                        let resid = residueArray[n];
                        ic.resid2domainid[resid] = chainid + '-0' + '_' + Object.keys(currAtoms).length; 
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
                            }
                        }

                        domainAtomsArray.push(domainAtoms);

                        for(let m = 0, ml = segArray.length; m < ml; m += 2) {
                            let startResi = segArray[m];
                            let endResi = segArray[m+1];
                            for(let n = parseInt(startResi); n <= parseInt(endResi); ++n) {
                                let resid = chainid + '_' + pos2resi[n];
                                //domainAtoms = me.hashUtilsCls.unionHash(domainAtoms, ic.residues[resid]);
                                ic.resid2domainid[resid] = chainid + '-' + k + '_' + Object.keys(domainAtoms).length; 
                            }
                        }
                    }
                }

                for(let k = 0, kl = domainAtomsArray.length; k < kl; ++k) {
                    let pdb_target = ic.saveFileCls.getAtomPDB(domainAtomsArray[k], undefined, undefined, undefined, undefined, struct);
                    // ig strand for any subset will have the same k, use the number of residue to separate them
                    let domainid = chainid + '-' + k + '_' + Object.keys(domainAtomsArray[k]).length; 
                    ic.domainid2pdb[domainid] = pdb_target;

                    for(let index = 0, indexl = dataArray.length; index < indexl; ++index) {
                        let struct2 = ic.defaultPdbId + index;
                        //let pdb_query = (me.bNode) ? dataArray[index] : dataArray[index].value; //[0];
                        let pdb_query = dataArray[index].value; //[0];
                        let header = 'HEADER                                                        ' + struct2 + '\n';
                        pdb_query = header + pdb_query;

                        let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbArray[index]};
                        let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);
                        ajaxArray.push(alignAjax);
                        
                        domainidpairArray.push(domainid + "|" + ic.refpdbArray[index]);
                    }
                }
            }
        }

        try {
            let dataArray2 = [];
            let allPromise = Promise.allSettled(ajaxArray);
            dataArray2 = await allPromise;
        
            let bRound1 = true;
            await thisClass.parseAlignData(dataArray2, domainidpairArray, bRound1);

            /// if(ic.deferredRefnum !== undefined) ic.deferredRefnum.resolve();
        }
        catch(err) {
            if(!me.bNode) console.log("Error in aligning with TM-align...");
            //console.log("Error in aligning with TM-align...");
            return;
        }                       
    }

    async parseAlignData(dataArray, domainidpairArray, bRound1) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let tmscoreThreshold = 0.4; // 0.4; //0.5;

        // find the best alignment for each chain
        let domainid2score = {}, domainid2segs = {}, chainid2segs = {};

        if(!ic.chainid2refpdbname) ic.chainid2refpdbname = {};
        if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
        if(!ic.domainid2ig2kabat) ic.domainid2ig2kabat = {};
        if(!ic.domainid2ig2imgt) ic.domainid2ig2imgt = {};

        // ic.chainid2refpdbname = {};
        // ic.domainid2refpdbname = {};
        // ic.domainid2ig2kabat = {};
        // ic.domainid2ig2imgt = {};

        let minResidues = 20;

        for(let i = 0, il = domainidpairArray.length; i < il; ++i) {
            //let queryData = (me.bNode) ? dataArray[i] : dataArray[i].value; //[0];
            let queryData = dataArray[i].value; //[0];

            if(!queryData) {
                if(!me.bNode) console.log("The alignment data for " + domainidpairArray[i] + " is unavailable...");
                continue;
            }

            if(queryData.length == 0) continue;
            
            if(queryData[0].score < tmscoreThreshold || queryData[0].num_res < minResidues) {
                continue;
            }

            //let domainid_index = domainidpairArray[i].split(',');
            //let domainid = domainid_index[0];
            let domainid = domainidpairArray[i].substr(0, domainidpairArray[i].indexOf('|'));
            let refpdbname = domainidpairArray[i].substr(domainidpairArray[i].indexOf('|') + 1);
            //let chainid = domainid.split('-')[0];

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

                ic.domainid2refpdbname[domainid] = refpdbname;
                domainid2segs[domainid] = queryData[0].segs;
                ic.domainid2ig2kabat[domainid] = queryData[0].ig2kabat;
                ic.domainid2ig2imgt[domainid] = queryData[0].ig2imgt;
            }
        }

        if(bRound1) {
            if(!me.bNode) console.log("Start round 2 alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));   

            // start round2
            let ajaxArray = [];
            let domainidpairArray3 = [];
            let urltmalign = me.htmlCls.baseUrl + "tmalign/tmalign.cgi";
            for(let domainid in ic.domainid2refpdbname) {
                let pdbAjaxArray = [];
                let refpdbname = ic.domainid2refpdbname[domainid];
                let pdbid = domainid.substr(0, domainid.indexOf('_'));

                if(ic.refpdbHash.hasOwnProperty(pdbid)) {
                    // use itself as the ref structure
                    refpdbname = pdbid;

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

                let allPromise2 = Promise.allSettled(pdbAjaxArray);
                ic.pdbDataArray = await allPromise2;

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
            let allPromise = Promise.allSettled(ajaxArray);
            dataArray3 = await allPromise;

            await thisClass.parseAlignData(dataArray3, domainidpairArray3);

            // end of round 2
            return;
        }

        // combine domainid into chainid
        for(let domainid in ic.domainid2refpdbname) {
            let chainid = domainid.split('-')[0];
            if(!ic.chainid2refpdbname.hasOwnProperty(chainid)) ic.chainid2refpdbname[chainid] = [];
            ic.chainid2refpdbname[chainid].push(ic.domainid2refpdbname[domainid]);
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

            let chainList = '';
            for(let i = 0, il = ic.chainid2refpdbname[chainid].length; i < il; ++i) {
                chainList += ic.chainid2refpdbname[chainid][i] + " ";
            }
            if(!me.bNode) console.log("The reference PDB(s) for chain " + chainid + " are " + chainList);

            let prevStrand;
            let bCd19 = ic.chainid2refpdbname[chainid].length == 1 && ic.chainid2refpdbname[chainid][0] == 'CD19_6al5A_human_C2orV-n1';
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

                    let refnumLabel = thisClass.getLabelFromRefnum(refnum, prevStrand, bCd19);
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

        // A-: 10xx
        // A: 11xx
        // A': 12xx
        // A+: 13xx
        // B: 21xx
        // C: 32xx
        // C': 42xx
        // C'': 51xx, 52xx
        // D: 61xx
        // E: 71xx
        // F: 82xx
        // G: 91xx, 92xx
        // G+: 94xx

        // if(refnum < 100) return " " + oriRefnum;
        // else if(refnum >= 100 && refnum < 1000) {
        //     if(bCd19) return " " + oriRefnum;
        //     else return "A^" + oriRefnum;
        // }
        if(refnum < 900) return undefined;
        else if(refnum >= 900 && refnum < 1000) return " " + oriRefnum;
        else if(refnum >= 1000 && refnum < 1100) return "A-" + oriRefnum;
        else if(refnum >= 1100 && refnum < 1200) return "A" + oriRefnum;
        else if(refnum >= 1200 && refnum < 1300) return "A'" + oriRefnum;
        //else if(refnum >= 1300 && refnum < 1400) return "A*" + oriRefnum;
        else if(refnum >= 1300 && refnum < 1400) return "A+" + oriRefnum;
        else if(refnum >= 1400 && refnum < 2000) {
            if(prevStrand  && prevStrand.substr(0, 1) == 'A') {
                return prevStrand + oriRefnum;
            }
            else {
                return "A" + oriRefnum;
            }
        }
        else if(refnum >= 2000 && refnum < 3000) return "B" + oriRefnum;
        else if(refnum >= 3000 && refnum < 4000) return "C" + oriRefnum;
        else if(refnum >= 4000 && refnum < 5000) return "C'" + oriRefnum;
        else if(refnum >= 5000 && refnum < 6000) return "C''" + oriRefnum;
        else if(refnum >= 6000 && refnum < 7000) return "D" + oriRefnum;
        else if(refnum >= 7000 && refnum < 8000) return "E" + oriRefnum;
        else if(refnum >= 8000 && refnum < 9000) return "F" + oriRefnum;
        else if(refnum >= 9000 && refnum < 9400) return "G" + oriRefnum;
        //else if(refnum >= 9400 && refnum < 9500) return "G*" + oriRefnum;
        else if(refnum >= 9400 && refnum < 9500) return "G+" + oriRefnum;
        else if(refnum >= 9500) return "G" + oriRefnum;
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

    rmStrandFromRefnumlabel(refnumLabel) {
        return (!refnumLabel) ? refnumLabel : refnumLabel.replace(/'/g, '').replace(/\*/g, '').replace(/\^/g, '').replace(/\+/g, '').replace(/\-/g, '').substr(1); // C', C''
    }
 }
 
 export {Refnum}
 