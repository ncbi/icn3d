/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Annotation {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    hideAllAnno() { let ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoSeqBase(false);
        $("[id^=" + ic.pre + "custom]").hide();
    }
    setAnnoSeqBase(bShow) {  let ic = this.icn3d, me = ic.icn3dui;
        //let itemArray = ['site', 'ptm', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem'];
        let itemArray = ['cdd', 'clinvar', 'snp', 'site', 'ptm', 'ssbond', 'crosslink', 'transmem', 'domain', 'interaction', 'ig'];
        for(let i in itemArray) {
            let item = itemArray[i];
            if(bShow) {
                $("[id^=" + ic.pre + item + "]").show();
            }
            else {
                $("[id^=" + ic.pre + item + "]").hide();
            }
        }
    }
    setAnnoTabBase(bChecked) {  let ic = this.icn3d, me = ic.icn3dui;
        //let itemArray = ['all', 'binding', 'ptm', 'snp', 'clinvar', 'cdd', '3dd', 'interact', 'custom', 'ssbond', 'crosslink', 'transmem'];
        let itemArray = ['all', 'cdd', 'clinvar', 'snp', 'binding', 'ptm', 'ssbond', 'crosslink', 'transmem', '3dd', 'custom', 'interact', 'ig'];
        for(let i in itemArray) {
            let item = itemArray[i];
            if($("#" + ic.pre + "anno_" + item).length) $("#" + ic.pre + "anno_" + item)[0].checked = bChecked;
        }
    }
    async setAnnoTabAll() {  let ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoTabBase(true);
        this.setAnnoSeqBase(true);
        await this.updateClinvar();
        await this.updateSnp();
        this.updateDomain();
        await this.updatePTM();
        this.updateSsbond();
        this.updateCrosslink();
        await this.updateTransmem();

        ic.bRunRefnumAgain = true;
        await this.updateIg();
        ic.bRunRefnumAgain = false;

        this.updateInteraction();
    }
    hideAnnoTabAll() {  let ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoTabBase(false);
        this.hideAllAnno();
    }
    async resetAnnoAll() {  let ic = this.icn3d, me = ic.icn3dui;
       // reset annotations
       //$("#" + ic.pre + "dl_annotations").html("");
       //ic.bAnnoShown = false;
       //ic.showAnnoCls.showAnnotations();

       $("[id^=" + ic.pre + "dt_]").html("");
       $("[id^=" + ic.pre + "tt_]").html("");
       $("[id^=" + ic.pre + "ov_]").html("");
       await ic.showAnnoCls.processSeqData(ic.chainid_seq);

       //if($("#" + ic.pre + "dt_giseq_" + chainid).css("display") != 'block') {
       //    this.setAnnoViewAndDisplay('overview');
       //}
       //else {
           this.setAnnoViewAndDisplay('detailed view');
       //}
       await this.resetAnnoTabAll();
    }

    async resetAnnoTabAll() {  let ic = this.icn3d, me = ic.icn3dui;
        if($("#" + ic.pre + "anno_binding").length && $("#" + ic.pre + "anno_binding")[0].checked) {
            $("[id^=" + ic.pre + "site]").show();
        }
        if($("#" + ic.pre + "anno_snp").length && $("#" + ic.pre + "anno_snp")[0].checked) {
            ic.bSnpShown = false;
            await this.updateSnp();

            $("[id^=" + ic.pre + "snp]").show();
        }
        if($("#" + ic.pre + "anno_clinvar").length && $("#" + ic.pre + "anno_clinvar")[0].checked) {
            ic.bClinvarShown = false;
            await this.updateClinvar();

            $("[id^=" + ic.pre + "clinvar]").show();
        }
        if($("#" + ic.pre + "anno_cdd").length && $("#" + ic.pre + "anno_cdd")[0].checked) {
            $("[id^=" + ic.pre + "cdd]").show();
        }
        if($("#" + ic.pre + "anno_3dd").length && $("#" + ic.pre + "anno_3dd")[0].checked) {
            $("[id^=" + ic.pre + "domain]").show();
            ic.bDomainShown = false;
            this.updateDomain();
        }
        if($("#" + ic.pre + "anno_interact").length && $("#" + ic.pre + "anno_interact")[0].checked) {
            $("[id^=" + ic.pre + "interaction]").show();
            ic.bInteractionShown = false;
            this.updateInteraction();
        }
        if($("#" + ic.pre + "anno_ptm").length && $("#" + ic.pre + "anno_ptm")[0].checked) {
            ic.bPTMShown = false;
            await this.updatePTM();

            $("[id^=" + ic.pre + "ptm]").show();
        }
        if($("#" + ic.pre + "anno_custom").length && $("#" + ic.pre + "anno_custom")[0].checked) {
            $("[id^=" + ic.pre + "custom]").show();
        }
        if($("#" + ic.pre + "anno_ssbond").length && $("#" + ic.pre + "anno_ssbond")[0].checked) {
            $("[id^=" + ic.pre + "ssbond]").show();
            ic.bSSbondShown = false;
            this.updateSsbond();
        }
        if($("#" + ic.pre + "anno_crosslink").length && $("#" + ic.pre + "anno_crosslink")[0].checked) {
            $("[id^=" + ic.pre + "crosslink]").show();
            ic.bCrosslinkShown = false;
            this.updateCrosslink();
        }
        if($("#" + ic.pre + "anno_transmem").length && $("#" + ic.pre + "anno_transmem")[0].checked) {
            ic.bTranememShown = false;
            await this.updateTransmem();

            $("[id^=" + ic.pre + "transmem]").show();
        }
        if($("#" + ic.pre + "anno_ig").length && $("#" + ic.pre + "anno_ig")[0].checked || ic.bShowRefnum) {
            // no need to redo ref num calculation
            ic.bRunRefnumAgain = false;

            await this.updateIg();

            $("[id^=" + ic.pre + "ig]").show();

            // ic.bRunRefnumAgain = false;
        }
    }
    setAnnoTabCustom() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "custom]").show();
        if($("#" + ic.pre + "anno_custom").length) $("#" + ic.pre + "anno_custom")[0].checked = true;
    }
    hideAnnoTabCustom() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "custom]").hide();
        if($("#" + ic.pre + "anno_custom").length) $("#" + ic.pre + "anno_custom")[0].checked = false;
    }
    async setAnnoTabClinvar() {  let ic = this.icn3d, me = ic.icn3dui;
        await this.updateClinvar();

        $("[id^=" + ic.pre + "clinvar]").show();
        if($("#" + ic.pre + "anno_clinvar").length) $("#" + ic.pre + "anno_clinvar")[0].checked = true;
    }
    hideAnnoTabClinvar() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "clinvar]").hide();
        if($("#" + ic.pre + "anno_clinvar").length) $("#" + ic.pre + "anno_clinvar")[0].checked = false;
    }
    async setAnnoTabSnp() {  let ic = this.icn3d, me = ic.icn3dui;
        await this.updateSnp();

        $("[id^=" + ic.pre + "snp]").show();
        if($("#" + ic.pre + "anno_snp").length) $("#" + ic.pre + "anno_snp")[0].checked = true;
    }
    hideAnnoTabSnp() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "snp]").hide();
        if($("#" + ic.pre + "anno_snp").length) $("#" + ic.pre + "anno_snp")[0].checked = false;
    }
    setAnnoTabCdd() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "cdd]").show();
        if($("#" + ic.pre + "anno_cdd").length) $("#" + ic.pre + "anno_cdd")[0].checked = true;
    }
    hideAnnoTabCdd() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "cdd]").hide();
        if($("#" + ic.pre + "anno_cdd").length) $("#" + ic.pre + "anno_cdd")[0].checked = false;
    }
    setAnnoTab3ddomain() {  let ic = this.icn3d, me = ic.icn3dui;
        this.updateDomain();

        $("[id^=" + ic.pre + "domain]").show();
        if($("#" + ic.pre + "anno_3dd").length) $("#" + ic.pre + "anno_3dd")[0].checked = true;
    }
    hideAnnoTab3ddomain() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "domain]").hide();
        if($("#" + ic.pre + "anno_3dd").length) $("#" + ic.pre + "anno_3dd")[0].checked = false;
    }
    setAnnoTabSite() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "site]").show();
        $("[id^=" + ic.pre + "feat]").show();
        if($("#" + ic.pre + "anno_binding").length) $("#" + ic.pre + "anno_binding")[0].checked = true;
    }
    hideAnnoTabSite() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "site]").hide();
        $("[id^=" + ic.pre + "feat]").hide();
        if($("#" + ic.pre + "anno_binding").length) $("#" + ic.pre + "anno_binding")[0].checked = false;
    }
    setAnnoTabInteraction() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "interaction]").show();
        if($("#" + ic.pre + "anno_interact").length) $("#" + ic.pre + "anno_interact")[0].checked = true;
        this.updateInteraction();
    }
    hideAnnoTabInteraction() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "interaction]").hide();
        if($("#" + ic.pre + "anno_interact").length) $("#" + ic.pre + "anno_interact")[0].checked = false;
    }
    async setAnnoTabPTM() {  let ic = this.icn3d, me = ic.icn3dui;
        await this.updatePTM();

        $("[id^=" + ic.pre + "ptm]").show();
        if($("#" + ic.pre + "anno_ptm").length) $("#" + ic.pre + "anno_ptm")[0].checked = true;
    }
    hideAnnoTabPTM() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ptm]").hide();
        if($("#" + ic.pre + "anno_ptm").length) $("#" + ic.pre + "anno_ptm")[0].checked = false;
    }
    setAnnoTabSsbond() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ssbond]").show();
        if($("#" + ic.pre + "anno_ssbond").length) $("#" + ic.pre + "anno_ssbond")[0].checked = true;
        this.updateSsbond();
    }
    hideAnnoTabSsbond() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ssbond]").hide();
        if($("#" + ic.pre + "anno_ssbond").length) $("#" + ic.pre + "anno_ssbond")[0].checked = false;
    }
    setAnnoTabCrosslink() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "crosslink]").show();
        if($("#" + ic.pre + "anno_crosslink").length) $("#" + ic.pre + "anno_crosslink")[0].checked = true;
        this.updateCrosslink();
    }
    hideAnnoTabCrosslink() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "crosslink]").hide();
        if($("#" + ic.pre + "anno_crosslink").length) $("#" + ic.pre + "anno_crosslink")[0].checked = false;
    }
    async setAnnoTabTransmem() {  let ic = this.icn3d, me = ic.icn3dui;
        await this.updateTransmem();

        $("[id^=" + ic.pre + "transmem]").show();
        if($("#" + ic.pre + "anno_transmem").length) $("#" + ic.pre + "anno_transmem")[0].checked = true;
    }
    hideAnnoTabTransmem() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "transmem]").hide();
        if($("#" + ic.pre + "anno_transmem").length) $("#" + ic.pre + "anno_transmem")[0].checked = false;
    }
    async setAnnoTabIg(bSelection, template) {  let ic = this.icn3d, me = ic.icn3dui;

        await this.updateIg(bSelection, template);

        $("[id^=" + ic.pre + "ig]").show();
        if($("#" + ic.pre + "anno_ig").length) $("#" + ic.pre + "anno_ig")[0].checked = true;
    }
    hideAnnoTabIg() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ig]").hide();
        if($("#" + ic.pre + "anno_ig").length) $("#" + ic.pre + "anno_ig")[0].checked = false;
    }
    setTabs() {  let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

    //        $("#" + ic.pre + "dl_annotations_tabs").tabs();
        $("#" + ic.pre + "dl_addtrack_tabs").tabs();
        $("#" + ic.pre + "dl_anno_view_tabs").tabs();
        //$("#" + ic.pre + "anno_all", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_all", "click", async function(e) {

        if($("#" + ic.pre + "anno_all")[0].checked) {
            await thisClass.setAnnoTabAll();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation all", true);
        }
        else{
            thisClass.hideAnnoTabAll();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation all", true);
        }
        });

        //$("#" + ic.pre + "anno_binding", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_binding", "click", function(e) {
        if($("#" + ic.pre + "anno_binding")[0].checked) {
            thisClass.setAnnoTabSite();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation site", true);
        }
        else{
            thisClass.hideAnnoTabSite();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation site", true);
        }
        });

        //$("#" + ic.pre + "anno_snp", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_snp", "click", async function(e) {
        if($("#" + ic.pre + "anno_snp")[0].checked) {
            await thisClass.setAnnoTabSnp();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation snp", true);
        }
        else{
            thisClass.hideAnnoTabSnp();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation snp", true);
        }
        });

        //$("#" + ic.pre + "anno_clinvar", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_clinvar", "click", async function(e) {
        if($("#" + ic.pre + "anno_clinvar")[0].checked) {
            await thisClass.setAnnoTabClinvar();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation clinvar", true);
        }
        else{
            thisClass.hideAnnoTabClinvar();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation clinvar", true);
        }
        });

        //$("#" + ic.pre + "anno_cdd", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_cdd", "click", function(e) {
            thisClass.clickCdd();
        });

        //$("#" + ic.pre + "anno_3dd", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_3dd", "click", function(e) {
        if($("#" + ic.pre + "anno_3dd")[0].checked) {
            thisClass.setAnnoTab3ddomain();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation 3ddomain", true);
        }
        else{
            thisClass.hideAnnoTab3ddomain();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation 3ddomain", true);
        }
        });

        //$("#" + ic.pre + "anno_interact", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_interact", "click", function(e) {
        if($("#" + ic.pre + "anno_interact")[0].checked) {
            thisClass.setAnnoTabInteraction();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation interaction", true);
        }
        else{
            thisClass.hideAnnoTabInteraction();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation interaction", true);
        }
        });

        me.myEventCls.onIds("#" + ic.pre + "anno_ptm", "click", async function(e) {
            if($("#" + ic.pre + "anno_ptm")[0].checked) {
                await thisClass.setAnnoTabPTM();
                me.htmlCls.clickMenuCls.setLogCmd("set annotation ptm", true);
            }
            else{
                thisClass.hideAnnoTabPTM();
                me.htmlCls.clickMenuCls.setLogCmd("hide annotation ptm", true);
            }
        });

        //$("#" + ic.pre + "anno_custom", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_custom", "click", function(e) {
        if($("#" + ic.pre + "anno_custom")[0].checked) {
            thisClass.setAnnoTabCustom();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation custom", true);
        }
        else{
            thisClass.hideAnnoTabCustom();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation custom", true);
        }
        });

        //$("#" + ic.pre + "anno_ssbond", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_ssbond", "click", function(e) {
        if($("#" + ic.pre + "anno_ssbond")[0].checked) {
            thisClass.setAnnoTabSsbond();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation ssbond", true);
        }
        else{
            thisClass.hideAnnoTabSsbond();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation ssbond", true);
        }
        });

        //$("#" + ic.pre + "anno_crosslink", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_crosslink", "click", function(e) {
        if($("#" + ic.pre + "anno_crosslink")[0].checked) {
            thisClass.setAnnoTabCrosslink();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation crosslink", true);
        }
        else{
            thisClass.hideAnnoTabCrosslink();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation crosslink", true);
        }
        });

        //$("#" + ic.pre + "anno_transmem", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_transmem", "click", async function(e) {
        if($("#" + ic.pre + "anno_transmem").length && $("#" + ic.pre + "anno_transmem")[0].checked) {
            await thisClass.setAnnoTabTransmem();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation transmembrane", true);
        }
        else{
            thisClass.hideAnnoTabTransmem();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation transmembrane", true);
        }
        });

        me.myEventCls.onIds("#" + ic.pre + "anno_ig", "click", async function(e) {
            if($("#" + ic.pre + "anno_ig").length && $("#" + ic.pre + "anno_ig")[0].checked) {
                // if(Object.keys(ic.atoms).length > Object.keys(ic.hAtoms).length) {
                //     ic.bRunRefnum = false;
                // }

                ic.bRunRefnumAgain = true;
                await thisClass.setAnnoTabIg();
                me.htmlCls.clickMenuCls.setLogCmd("set annotation ig", true);

                ic.bRunRefnumAgain = false;
            }
            else{
                thisClass.hideAnnoTabIg();
                me.htmlCls.clickMenuCls.setLogCmd("hide annotation ig", true);
            }
            });
    }
    clickCdd() { let ic = this.icn3d, me = ic.icn3dui;
      if($("[id^=" + ic.pre + "cdd]").length > 0) {
        if($("#" + ic.pre + "anno_cdd")[0].checked) {
            this.setAnnoTabCdd();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation cdd", true);
        }
        else{
            this.hideAnnoTabCdd();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation cdd", true);
        }
      }
    }

    showAnnoSelectedChains() {   let ic = this.icn3d, me = ic.icn3dui;
        // show selected chains in annotation window
        let chainHash = {}
        for(let i in ic.hAtoms) {
            let atom = ic.atoms[i];
            let chainid = atom.structure + '_' + atom.chain;
            chainHash[chainid] = 1;
        }
        $("#" + ic.pre + "dl_annotations > .icn3d-annotation").hide();
        for(let chainid in chainHash) {
            if($("#" + ic.pre + "anno_" + chainid).length) {
                $("#" + ic.pre + "anno_" + chainid).show();
            }
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainid]);
            if(atom.resn !== undefined) {
                let oneLetterRes = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
                $("#" + ic.pre + "anno_" + oneLetterRes).show();
            }
        }
    }
    showAnnoAllChains() {   let ic = this.icn3d, me = ic.icn3dui;
        $("#" + ic.pre + "dl_annotations > .icn3d-annotation").show();
    }
    setAnnoView(view) { let ic = this.icn3d, me = ic.icn3dui;
        if(!me.bNode) {
            if(view === 'detailed view') {
                ic.view = 'detailed view';
                $( "#" + ic.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 1 );
            }
            else { // overview
                ic.view = 'overview';
                $( "#" + ic.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 0 );
            }
        }
    }
    setAnnoDisplay(display, prefix) { let ic = this.icn3d, me = ic.icn3dui;
        let itemArray = ['giseq', 'custom', 'site', 'ptm', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem', 'ig'];
        for(let i in itemArray) {
            let item = itemArray[i];
            $("[id^=" + ic.pre + prefix + "_" + item + "]").attr('style', display);
        }
    }
    showFixedTitle() { let ic = this.icn3d, me = ic.icn3dui;
            let style = 'display:block;'
            this.setAnnoDisplay(style, 'tt');
    }
    hideFixedTitle() { let ic = this.icn3d, me = ic.icn3dui;
            let style = 'display:none!important;'
            this.setAnnoDisplay(style, 'tt');
    }
    setAnnoViewAndDisplay(view) { let ic = this.icn3d, me = ic.icn3dui;
        if(view === 'detailed view') {
            this.setAnnoView('detailed view');
            let style = 'display:block;'
            this.setAnnoDisplay(style, 'dt');
            $("#" + ic.pre + "seqguide_wrapper").attr('style', style);
            style = 'display:none;'
            this.setAnnoDisplay(style, 'ov');
        }
        else { // overview
            this.setAnnoView('overview');
            this.hideFixedTitle();
            let style = 'display:none;'
            this.setAnnoDisplay(style, 'dt');
            $("#" + ic.pre + "seqguide_wrapper").attr('style', style);
            style = 'display:block;'
            this.setAnnoDisplay(style, 'ov');
        }
    }

    // by default, showSeq and showCddSite are called at showAnnotations
    // the following will be called only when the annotation is selected: showSnpClinvar, showDomain, showInteraction
    // showSnpClinvar and showDomain will loop through ic.protein_chainid
    // showInteraction will loop through ic.interactChainbase
    async updateClinvar() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bClinvarShown === undefined || !ic.bClinvarShown) {
            for(let chainid in ic.protein_chainid) {
                let chainidBase = ic.protein_chainid[chainid];
                await ic.annoSnpClinVarCls.showClinvar(chainid, chainidBase);
            }
        }
        ic.bClinvarShown = true;
    }
    async updateSnp() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bSnpShown === undefined || !ic.bSnpShown) {
            for(let chainid in ic.protein_chainid) {
                let chainidBase = ic.protein_chainid[chainid];
                await ic.annoSnpClinVarCls.showSnp(chainid, chainidBase);
            }
        }
        ic.bSnpShown = true;
    }
    updateDomain() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bDomainShown === undefined || !ic.bDomainShown) {
            ic.annoDomainCls.showDomainAll();
        }
        ic.bDomainShown = true;
    }
    updateInteraction() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bInteractionShown === undefined || !ic.bInteractionShown) {
            for(let chainid in ic.interactChainbase) {
                let chainidBase = ic.interactChainbase[chainid];
                ic.annoContactCls.showInteraction(chainid, chainidBase);
            }
        }
        ic.bInteractionShown = true;
    }
    async updatePTM() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bPTMShown === undefined || !ic.bPTMShown) {
            for(let chainid in ic.PTMChainbase) {
                let chainidBase = ic.PTMChainbase[chainid];
                await ic.annoPTMCls.showPTM(chainid, chainidBase, 'ptm');
            }
        }
        ic.bPTMShown = true;
    }
    updateSsbond() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bSSbondShown === undefined || !ic.bSSbondShown) {
            for(let chainid in ic.ssbondChainbase) {
                let chainidBase = ic.ssbondChainbase[chainid];
                ic.annoSsbondCls.showSsbond(chainid, chainidBase);
            }
        }
        ic.bSSbondShown = true;
    }
    updateCrosslink() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bCrosslinkShown === undefined || !ic.bCrosslinkShown) {
            for(let chainid in ic.crosslinkChainbase) {
                let chainidBase = ic.crosslinkChainbase[chainid];
                ic.annoCrossLinkCls.showCrosslink(chainid, chainidBase);
            }
        }
        ic.bCrosslinkShown = true;
    }

    async updateTransmem() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bTranememShown === undefined || !ic.bTranememShown) {
            for(let chainid in ic.protein_chainid) {
                let chainidBase = ic.protein_chainid[chainid];
                if(me.cfg.opmid !== undefined) {
                    ic.annoTransMemCls.showTransmem(chainid, chainidBase);
                }
                else if(ic.bAfMem && ic.afmem_start_end) {
                    let begin = ic.afmem_start_end[0];
                    let end = ic.afmem_start_end[1];
                    await ic.annoPTMCls.showPTM(chainid, chainidBase, 'afmem', begin, end);
                }
                else {
                    await ic.annoPTMCls.showPTM(chainid, chainidBase, 'transmem');
                }
            }
        }
        ic.bTranememShown = true;
    }

    async updateIg(bSelection, template) { let ic = this.icn3d, me = ic.icn3dui;
        if(bSelection) { // clear previous refnum
            let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.hAtoms);
            for(let resid in residueHash) {
                if(ic.resid2refnum) delete ic.resid2refnum[resid];
                if(ic.residIgLoop) delete ic.residIgLoop[resid];
                if(ic.resid2domainid) delete ic.resid2domainid[resid];
            }
        }

        // if(!ic.bIgShown) {
            if(!bSelection && !template) {
                // select all protein chains
                ic.hAtoms = {};
                for(let chainid in ic.protein_chainid) {
                    ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[chainid]);
                }
            }

            for(let chainid in ic.protein_chainid) {
                await ic.annoIgCls.showIg(chainid, template);
            }
        // }
        // ic.bIgShown = true;

        if(ic.bShowRefnum) {
            // ic.opts.color = 'ig strand';
            // ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

            ic.hlUpdateCls.updateHlAll();
            ic.drawCls.draw();
        } 
  
    }
}

export {Annotation}
