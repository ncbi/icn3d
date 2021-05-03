/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {UtilsCls} from '../../utils/utilsCls.js';
import {MyEventCls} from '../../utils/myEventCls.js';

import {ShowAnno} from '../annotations/showAnno.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {AnnoCddSite} from '../annotations/annoCddSite.js';
import {AnnoContact} from '../annotations/annoContact.js';
import {AnnoCrossLink} from '../annotations/annoCrossLink.js';
import {AnnoDomain} from '../annotations/annoDomain.js';
import {AnnoSnpClinVar} from '../annotations/annoSnpClinVar.js';
import {AnnoSsbond} from '../annotations/annoSsbond.js';
import {AnnoTransMem} from '../annotations/annoTransMem.js';

class Annotation {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    hideAllAnno() { var ic = this.icn3d, me = ic.icn3dui;
            this.hideAllAnnoBase();
            $("[id^=" + ic.pre + "custom]").hide();
    }
    hideAllAnnoBase() { var ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoSeqBase(false);
    }
    setAnnoSeqBase(bShow) {  var ic = this.icn3d, me = ic.icn3dui;
        var itemArray = ['site', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem'];
        for(var i in itemArray) {
            var item = itemArray[i];
            if(bShow) {
                $("[id^=" + ic.pre + item + "]").show();
            }
            else {
                $("[id^=" + ic.pre + item + "]").hide();
            }
        }
    }
    setAnnoTabBase(bChecked) {  var ic = this.icn3d, me = ic.icn3dui;
        var itemArray = ['all', 'binding', 'snp', 'clinvar', 'cdd', '3dd', 'interact', 'custom', 'ssbond', 'crosslink', 'transmem'];
        for(var i in itemArray) {
            var item = itemArray[i];
            if($("#" + ic.pre + "anno_" + item).length) $("#" + ic.pre + "anno_" + item)[0].checked = bChecked;
        }
    }
    setAnnoTabAll() {  var ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoTabBase(true);
        this.setAnnoSeqBase(true);
        this.updateClinvar();
        this.updateSnp();
        this.updateDomain();
        this.updateInteraction();
        this.updateSsbond();
        this.updateCrosslink();
        this.updateTransmem();
    }
    hideAnnoTabAll() {  var ic = this.icn3d, me = ic.icn3dui;
        this.setAnnoTabBase(false);
        this.hideAllAnno();
    }
    resetAnnoAll() {  var ic = this.icn3d, me = ic.icn3dui;
       // reset annotations
       //$("#" + ic.pre + "dl_annotations").html("");
       //ic.bAnnoShown = false;
       //ic.showAnnoCls.showAnnotations();

       $("[id^=" + ic.pre + "dt_]").html("");
       $("[id^=" + ic.pre + "tt_]").html("");
       $("[id^=" + ic.pre + "ov_]").html("");
       ic.showAnnoCls.processSeqData(ic.chainid_seq);

       //if($("#" + ic.pre + "dt_giseq_" + chainid).css("display") != 'block') {
       //    this.setAnnoViewAndDisplay('overview');
       //}
       //else {
           this.setAnnoViewAndDisplay('detailed view');
       //}
       this.resetAnnoTabAll();
    }

    resetAnnoTabAll() {  var ic = this.icn3d, me = ic.icn3dui;
        if($("#" + ic.pre + "anno_binding").length && $("#" + ic.pre + "anno_binding")[0].checked) {
            $("[id^=" + ic.pre + "site]").show();
        }
        if($("#" + ic.pre + "anno_snp").length && $("#" + ic.pre + "anno_snp")[0].checked) {
            $("[id^=" + ic.pre + "snp]").show();
            ic.bSnpShown = false;
            this.updateSnp();
        }
        if($("#" + ic.pre + "anno_clinvar").length && $("#" + ic.pre + "anno_clinvar")[0].checked) {
            $("[id^=" + ic.pre + "clinvar]").show();
            ic.bClinvarShown = false;
            this.updateClinvar();
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
            $("[id^=" + ic.pre + "transmem]").show();
            ic.bTranememShown = false;
            this.updateTransmem();
        }
    }
    setAnnoTabCustom() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "custom]").show();
        if($("#" + ic.pre + "anno_custom").length) $("#" + ic.pre + "anno_custom")[0].checked = true;
    }
    hideAnnoTabCustom() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "custom]").hide();
        if($("#" + ic.pre + "anno_custom").length) $("#" + ic.pre + "anno_custom")[0].checked = false;
    }
    setAnnoTabClinvar() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "clinvar]").show();
        if($("#" + ic.pre + "anno_clinvar").length) $("#" + ic.pre + "anno_clinvar")[0].checked = true;
        this.updateClinvar();
    }
    hideAnnoTabClinvar() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "clinvar]").hide();
        if($("#" + ic.pre + "anno_clinvar").length) $("#" + ic.pre + "anno_clinvar")[0].checked = false;
    }
    setAnnoTabSnp() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "snp]").show();
        if($("#" + ic.pre + "anno_snp").length) $("#" + ic.pre + "anno_snp")[0].checked = true;
        this.updateSnp();
    }
    hideAnnoTabSnp() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "snp]").hide();
        if($("#" + ic.pre + "anno_snp").length) $("#" + ic.pre + "anno_snp")[0].checked = false;
    }
    setAnnoTabCdd() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "cdd]").show();
        if($("#" + ic.pre + "anno_cdd").length) $("#" + ic.pre + "anno_cdd")[0].checked = true;
    }
    hideAnnoTabCdd() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "cdd]").hide();
        if($("#" + ic.pre + "anno_cdd").length) $("#" + ic.pre + "anno_cdd")[0].checked = false;
    }
    setAnnoTab3ddomain() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "domain]").show();
        if($("#" + ic.pre + "anno_3dd").length) $("#" + ic.pre + "anno_3dd")[0].checked = true;
        this.updateDomain();
    }
    hideAnnoTab3ddomain() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "domain]").hide();
        if($("#" + ic.pre + "anno_3dd").length) $("#" + ic.pre + "anno_3dd")[0].checked = false;
    }
    setAnnoTabSite() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "site]").show();
        $("[id^=" + ic.pre + "feat]").show();
        if($("#" + ic.pre + "anno_binding").length) $("#" + ic.pre + "anno_binding")[0].checked = true;
    }
    hideAnnoTabSite() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "site]").hide();
        $("[id^=" + ic.pre + "feat]").hide();
        if($("#" + ic.pre + "anno_binding").length) $("#" + ic.pre + "anno_binding")[0].checked = false;
    }
    setAnnoTabInteraction() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "interaction]").show();
        if($("#" + ic.pre + "anno_interact").length) $("#" + ic.pre + "anno_interact")[0].checked = true;
        this.updateInteraction();
    }
    hideAnnoTabInteraction() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "interaction]").hide();
        if($("#" + ic.pre + "anno_interact").length) $("#" + ic.pre + "anno_interact")[0].checked = false;
    }
    setAnnoTabSsbond() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ssbond]").show();
        if($("#" + ic.pre + "anno_ssbond").length) $("#" + ic.pre + "anno_ssbond")[0].checked = true;
        this.updateSsbond();
    }
    hideAnnoTabSsbond() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "ssbond]").hide();
        if($("#" + ic.pre + "anno_ssbond").length) $("#" + ic.pre + "anno_ssbond")[0].checked = false;
    }
    setAnnoTabCrosslink() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "crosslink]").show();
        if($("#" + ic.pre + "anno_crosslink").length) $("#" + ic.pre + "anno_crosslink")[0].checked = true;
        this.updateCrosslink();
    }
    hideAnnoTabCrosslink() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "crosslink]").hide();
        if($("#" + ic.pre + "anno_crosslink").length) $("#" + ic.pre + "anno_crosslink")[0].checked = false;
    }
    setAnnoTabTransmem() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "transmem]").show();
        if($("#" + ic.pre + "anno_transmem").length) $("#" + ic.pre + "anno_transmem")[0].checked = true;
        this.updateTransmem();
    }
    hideAnnoTabTransmem() {  var ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + "transmem]").hide();
        if($("#" + ic.pre + "anno_transmem").length) $("#" + ic.pre + "anno_transmem")[0].checked = false;
    }
    setTabs() {  var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

    //        $("#" + ic.pre + "dl_annotations_tabs").tabs();
        $("#" + ic.pre + "dl_addtrack_tabs").tabs();
        $("#" + ic.pre + "dl_anno_view_tabs").tabs();
        //$("#" + ic.pre + "anno_all", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_all", "click", function(e) {

        if($("#" + ic.pre + "anno_all")[0].checked) {
            thisClass.setAnnoTabAll();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation all", true);
        }
        else{
            thisClass.hideAnnoTabAll();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation all", true);
        }
        });

        //$("#" + ic.pre + "anno_binding", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_binding", "click", function(e) {
        if($("#" + ic.pre + "anno_binding")[0].checked) {
            thisClass.setAnnoTabSite();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation site", true);
        }
        else{
            thisClass.hideAnnoTabSite();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation site", true);
        }
        });

        //$("#" + ic.pre + "anno_snp", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_snp", "click", function(e) {
        if($("#" + ic.pre + "anno_snp")[0].checked) {
            thisClass.setAnnoTabSnp();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation snp", true);
        }
        else{
            thisClass.hideAnnoTabSnp();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation snp", true);
        }
        });

        //$("#" + ic.pre + "anno_clinvar", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_clinvar", "click", function(e) {
        if($("#" + ic.pre + "anno_clinvar")[0].checked) {
            thisClass.setAnnoTabClinvar();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation clinvar", true);
        }
        else{
            thisClass.hideAnnoTabClinvar();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation clinvar", true);
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
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation 3ddomain", true);
        }
        else{
            thisClass.hideAnnoTab3ddomain();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation 3ddomain", true);
        }
        });

        //$("#" + ic.pre + "anno_interact", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_interact", "click", function(e) {
        if($("#" + ic.pre + "anno_interact")[0].checked) {
            thisClass.setAnnoTabInteraction();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation interaction", true);
        }
        else{
            thisClass.hideAnnoTabInteraction();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation interaction", true);
        }
        });

        //$("#" + ic.pre + "anno_custom", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_custom", "click", function(e) {
        if($("#" + ic.pre + "anno_custom")[0].checked) {
            thisClass.setAnnoTabCustom();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation custom", true);
        }
        else{
            thisClass.hideAnnoTabCustom();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation custom", true);
        }
        });

        //$("#" + ic.pre + "anno_ssbond", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_ssbond", "click", function(e) {
        if($("#" + ic.pre + "anno_ssbond")[0].checked) {
            thisClass.setAnnoTabSsbond();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation ssbond", true);
        }
        else{
            thisClass.hideAnnoTabSsbond();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation ssbond", true);
        }
        });

        //$("#" + ic.pre + "anno_crosslink", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_crosslink", "click", function(e) {
        if($("#" + ic.pre + "anno_crosslink")[0].checked) {
            thisClass.setAnnoTabCrosslink();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation crosslink", true);
        }
        else{
            thisClass.hideAnnoTabCrosslink();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation crosslink", true);
        }
        });

        //$("#" + ic.pre + "anno_transmem", "click", function(e) {
        me.myEventCls.onIds("#" + ic.pre + "anno_transmem", "click", function(e) {
        if($("#" + ic.pre + "anno_transmem").length && $("#" + ic.pre + "anno_transmem")[0].checked) {
            thisClass.setAnnoTabTransmem();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation transmembrane", true);
        }
        else{
            thisClass.hideAnnoTabTransmem();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation transmembrane", true);
        }
        });
    }
    clickCdd() { var ic = this.icn3d, me = ic.icn3dui;
      if($("[id^=" + ic.pre + "cdd]").length > 0) {
        if($("#" + ic.pre + "anno_cdd")[0].checked) {
            this.setAnnoTabCdd();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set annotation cdd", true);
        }
        else{
            this.hideAnnoTabCdd();
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide annotation cdd", true);
        }
      }
    }

    showAnnoSelectedChains() {   var ic = this.icn3d, me = ic.icn3dui;
        // show selected chains in annotation window
        var chainHash = {}
        for(var i in ic.hAtoms) {
            var atom = ic.atoms[i];
            var chainid = atom.structure + '_' + atom.chain;
            chainHash[chainid] = 1;
        }
        $("#" + ic.pre + "dl_annotations > .icn3d-annotation").hide();
        for(var chainid in chainHash) {
            if($("#" + ic.pre + "anno_" + chainid).length) {
                $("#" + ic.pre + "anno_" + chainid).show();
            }
            var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainid]);
            if(atom.resn !== undefined) {
                var oneLetterRes = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
                $("#" + ic.pre + "anno_" + oneLetterRes).show();
            }
        }
    }
    showAnnoAllChains() {   var ic = this.icn3d, me = ic.icn3dui;
        $("#" + ic.pre + "dl_annotations > .icn3d-annotation").show();
    }
    setAnnoView(view) { var ic = this.icn3d, me = ic.icn3dui;
        if(view === 'detailed view') {
            ic.view = 'detailed view';
            $( "#" + ic.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 1 );
        }
        else { // overview
            ic.view = 'overview';
            $( "#" + ic.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 0 );
        }
    }
    setAnnoDisplay(display, prefix) { var ic = this.icn3d, me = ic.icn3dui;
        var itemArray = ['giseq', 'custom', 'site', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem'];
        for(var i in itemArray) {
            var item = itemArray[i];
            $("[id^=" + ic.pre + prefix + "_" + item + "]").attr('style', display);
        }
    }
    showFixedTitle() { var ic = this.icn3d, me = ic.icn3dui;
            var style = 'display:block;'
            this.setAnnoDisplay(style, 'tt');
    }
    hideFixedTitle() { var ic = this.icn3d, me = ic.icn3dui;
            var style = 'display:none!important;'
            this.setAnnoDisplay(style, 'tt');
    }
    setAnnoViewAndDisplay(view) { var ic = this.icn3d, me = ic.icn3dui;
        if(view === 'detailed view') {
            this.setAnnoView('detailed view');
            var style = 'display:block;'
            this.setAnnoDisplay(style, 'dt');
            $("#" + ic.pre + "seqguide_wrapper").attr('style', style);
            style = 'display:none;'
            this.setAnnoDisplay(style, 'ov');
        }
        else { // overview
            this.setAnnoView('overview');
            this.hideFixedTitle();
            var style = 'display:none;'
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
    updateClinvar() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bClinvarShown === undefined || !ic.bClinvarShown) {
            for(var chainid in ic.protein_chainid) {
                var chainidBase = ic.protein_chainid[chainid];
                ic.annoSnpClinVarCls.showClinvar(chainid, chainidBase);
            }
        }
        ic.bClinvarShown = true;
    }
    updateSnp() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bSnpShown === undefined || !ic.bSnpShown) {
            for(var chainid in ic.protein_chainid) {
                var chainidBase = ic.protein_chainid[chainid];
                ic.annoSnpClinVarCls.showSnp(chainid, chainidBase);
            }
        }
        ic.bSnpShown = true;
    }
    updateDomain() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bDomainShown === undefined || !ic.bDomainShown) {
            ic.annoDomainCls.showDomainAll();
        }
        ic.bDomainShown = true;
    }
    updateInteraction() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bInteractionShown === undefined || !ic.bInteractionShown) {
            for(var chainid in ic.interactChainbase) {
                var chainidBase = ic.interactChainbase[chainid];
                ic.annoContactCls.showInteraction(chainid, chainidBase);
            }
        }
        ic.bInteractionShown = true;
    }
    updateSsbond() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bSSbondShown === undefined || !ic.bSSbondShown) {
            for(var chainid in ic.ssbondChainbase) {
                var chainidBase = ic.ssbondChainbase[chainid];
                ic.annoSsbondCls.showSsbond(chainid, chainidBase);
            }
        }
        ic.bSSbondShown = true;
    }
    updateCrosslink() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bCrosslinkShown === undefined || !ic.bCrosslinkShown) {
            for(var chainid in ic.crosslinkChainbase) {
                var chainidBase = ic.crosslinkChainbase[chainid];
                ic.annoCrossLinkCls.showCrosslink(chainid, chainidBase);
            }
        }
        ic.bCrosslinkShown = true;
    }
    updateTransmem() { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bTranememShown === undefined || !ic.bTranememShown) {
            for(var chainid in ic.protein_chainid) {
                var chainidBase = ic.protein_chainid[chainid];
                ic.annoTransMemCls.showTransmem(chainid, chainidBase);
            }
        }
        ic.bTranememShown = true;
    }
}

export {Annotation}
