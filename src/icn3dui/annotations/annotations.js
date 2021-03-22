/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.hideAllAnno = function() { var me = this, ic = me.icn3d; "use strict";
        me.hideAllAnnoBase();
        $("[id^=" + me.pre + "custom]").hide();
};
iCn3DUI.prototype.hideAllAnnoBase = function() { var me = this, ic = me.icn3d; "use strict";
    me.setAnnoSeqBase(false);
};
iCn3DUI.prototype.setAnnoSeqBase = function (bShow) {  var me = this, ic = me.icn3d; "use strict";
    var itemArray = ['site', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem'];
    for(var i in itemArray) {
        var item = itemArray[i];
        if(bShow) {
            $("[id^=" + me.pre + item + "]").show();
        }
        else {
            $("[id^=" + me.pre + item + "]").hide();
        }
    }
};
iCn3DUI.prototype.setAnnoTabBase = function (bChecked) {  var me = this, ic = me.icn3d; "use strict";
    var itemArray = ['all', 'binding', 'snp', 'clinvar', 'cdd', '3dd', 'interact', 'custom', 'ssbond', 'crosslink', 'transmem'];
    for(var i in itemArray) {
        var item = itemArray[i];
        if($("#" + me.pre + "anno_" + item).length) $("#" + me.pre + "anno_" + item)[0].checked = bChecked;
    }
};
iCn3DUI.prototype.setAnnoTabAll = function () {  var me = this, ic = me.icn3d; "use strict";
    me.setAnnoTabBase(true);
    me.setAnnoSeqBase(true);
    me.updateClinvar();
    me.updateSnp();
    me.updateDomain();
    me.updateInteraction();
    me.updateSsbond();
    me.updateCrosslink();
    me.updateTransmem();
};
iCn3DUI.prototype.hideAnnoTabAll = function () {  var me = this, ic = me.icn3d; "use strict";
    me.setAnnoTabBase(false);
    me.hideAllAnno();
};
iCn3DUI.prototype.resetAnnoTabAll = function () {  var me = this, ic = me.icn3d; "use strict";
    if($("#" + me.pre + "anno_binding").length && $("#" + me.pre + "anno_binding")[0].checked) {
        $("[id^=" + me.pre + "site]").show();
    }
    if($("#" + me.pre + "anno_snp").length && $("#" + me.pre + "anno_snp")[0].checked) {
        $("[id^=" + me.pre + "snp]").show();
        me.bSnpShown = false;
        me.updateSnp();
    }
    if($("#" + me.pre + "anno_clinvar").length && $("#" + me.pre + "anno_clinvar")[0].checked) {
        $("[id^=" + me.pre + "clinvar]").show();
        me.bClinvarShown = false;
        me.updateClinvar();
    }
    if($("#" + me.pre + "anno_cdd").length && $("#" + me.pre + "anno_cdd")[0].checked) {
        $("[id^=" + me.pre + "cdd]").show();
    }
    if($("#" + me.pre + "anno_3dd").length && $("#" + me.pre + "anno_3dd")[0].checked) {
        $("[id^=" + me.pre + "domain]").show();
        me.bDomainShown = false;
        me.updateDomain();
    }
    if($("#" + me.pre + "anno_interact").length && $("#" + me.pre + "anno_interact")[0].checked) {
        $("[id^=" + me.pre + "interaction]").show();
        me.bInteractionShown = false;
        me.updateInteraction();
    }
    if($("#" + me.pre + "anno_custom").length && $("#" + me.pre + "anno_custom")[0].checked) {
        $("[id^=" + me.pre + "custom]").show();
    }
    if($("#" + me.pre + "anno_ssbond").length && $("#" + me.pre + "anno_ssbond")[0].checked) {
        $("[id^=" + me.pre + "ssbond]").show();
        me.bSSbondShown = false;
        me.updateSsbond();
    }
    if($("#" + me.pre + "anno_crosslink").length && $("#" + me.pre + "anno_crosslink")[0].checked) {
        $("[id^=" + me.pre + "crosslink]").show();
        me.bCrosslinkShown = false;
        me.updateCrosslink();
    }
    if($("#" + me.pre + "anno_transmem").length && $("#" + me.pre + "anno_transmem")[0].checked) {
        $("[id^=" + me.pre + "transmem]").show();
        me.bTranememShown = false;
        me.updateTransmem();
    }
};
iCn3DUI.prototype.setAnnoTabCustom = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "custom]").show();
    if($("#" + me.pre + "anno_custom").length) $("#" + me.pre + "anno_custom")[0].checked = true;
};
iCn3DUI.prototype.hideAnnoTabCustom = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "custom]").hide();
    if($("#" + me.pre + "anno_custom").length) $("#" + me.pre + "anno_custom")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabClinvar = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "clinvar]").show();
    if($("#" + me.pre + "anno_clinvar").length) $("#" + me.pre + "anno_clinvar")[0].checked = true;
    me.updateClinvar();
};
iCn3DUI.prototype.hideAnnoTabClinvar = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "clinvar]").hide();
    if($("#" + me.pre + "anno_clinvar").length) $("#" + me.pre + "anno_clinvar")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabSnp = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "snp]").show();
    if($("#" + me.pre + "anno_snp").length) $("#" + me.pre + "anno_snp")[0].checked = true;
    me.updateSnp();
};
iCn3DUI.prototype.hideAnnoTabSnp = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "snp]").hide();
    if($("#" + me.pre + "anno_snp").length) $("#" + me.pre + "anno_snp")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabCdd = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "cdd]").show();
    if($("#" + me.pre + "anno_cdd").length) $("#" + me.pre + "anno_cdd")[0].checked = true;
};
iCn3DUI.prototype.hideAnnoTabCdd = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "cdd]").hide();
    if($("#" + me.pre + "anno_cdd").length) $("#" + me.pre + "anno_cdd")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTab3ddomain = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "domain]").show();
    if($("#" + me.pre + "anno_3dd").length) $("#" + me.pre + "anno_3dd")[0].checked = true;
    me.updateDomain();
};
iCn3DUI.prototype.hideAnnoTab3ddomain = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "domain]").hide();
    if($("#" + me.pre + "anno_3dd").length) $("#" + me.pre + "anno_3dd")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabSite = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "site]").show();
    if($("#" + me.pre + "anno_binding").length) $("#" + me.pre + "anno_binding")[0].checked = true;
};
iCn3DUI.prototype.hideAnnoTabSite = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "site]").hide();
    if($("#" + me.pre + "anno_binding").length) $("#" + me.pre + "anno_binding")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabInteraction = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "interaction]").show();
    if($("#" + me.pre + "anno_interact").length) $("#" + me.pre + "anno_interact")[0].checked = true;
    me.updateInteraction();
};
iCn3DUI.prototype.hideAnnoTabInteraction = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "interaction]").hide();
    if($("#" + me.pre + "anno_interact").length) $("#" + me.pre + "anno_interact")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabSsbond = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "ssbond]").show();
    if($("#" + me.pre + "anno_ssbond").length) $("#" + me.pre + "anno_ssbond")[0].checked = true;
    me.updateSsbond();
};
iCn3DUI.prototype.hideAnnoTabSsbond = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "ssbond]").hide();
    if($("#" + me.pre + "anno_ssbond").length) $("#" + me.pre + "anno_ssbond")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabCrosslink = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "crosslink]").show();
    if($("#" + me.pre + "anno_crosslink").length) $("#" + me.pre + "anno_crosslink")[0].checked = true;
    me.updateCrosslink();
};
iCn3DUI.prototype.hideAnnoTabCrosslink = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "crosslink]").hide();
    if($("#" + me.pre + "anno_crosslink").length) $("#" + me.pre + "anno_crosslink")[0].checked = false;
};
iCn3DUI.prototype.setAnnoTabTransmem = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "transmem]").show();
    if($("#" + me.pre + "anno_transmem").length) $("#" + me.pre + "anno_transmem")[0].checked = true;
    me.updateTransmem();
};
iCn3DUI.prototype.hideAnnoTabTransmem = function () {  var me = this, ic = me.icn3d; "use strict";
    $("[id^=" + me.pre + "transmem]").hide();
    if($("#" + me.pre + "anno_transmem").length) $("#" + me.pre + "anno_transmem")[0].checked = false;
};
iCn3DUI.prototype.setTabs = function () {  var me = this, ic = me.icn3d; "use strict";
//        $("#" + me.pre + "dl_annotations_tabs").tabs();
    $("#" + me.pre + "dl_addtrack_tabs").tabs();
    $("#" + me.pre + "dl_anno_view_tabs").tabs();
    $("#" + me.pre + "anno_all").click(function (e) {
    if($("#" + me.pre + "anno_all")[0].checked) {
        me.setAnnoTabAll();
        me.setLogCmd("set annotation all", true);
    }
    else{
        me.hideAnnoTabAll();
        me.setLogCmd("hide annotation all", true);
    }
    });
    $("#" + me.pre + "anno_binding").click(function (e) {
    if($("#" + me.pre + "anno_binding")[0].checked) {
        me.setAnnoTabSite();
        me.setLogCmd("set annotation site", true);
    }
    else{
        me.hideAnnoTabSite();
        me.setLogCmd("hide annotation site", true);
    }
    });
    $("#" + me.pre + "anno_snp").click(function (e) {
    if($("#" + me.pre + "anno_snp")[0].checked) {
        me.setAnnoTabSnp();
        me.setLogCmd("set annotation snp", true);
    }
    else{
        me.hideAnnoTabSnp();
        me.setLogCmd("hide annotation snp", true);
    }
    });
    $("#" + me.pre + "anno_clinvar").click(function (e) {
    if($("#" + me.pre + "anno_clinvar")[0].checked) {
        me.setAnnoTabClinvar();
        me.setLogCmd("set annotation clinvar", true);
    }
    else{
        me.hideAnnoTabClinvar();
        me.setLogCmd("hide annotation clinvar", true);
    }
    });
    $("#" + me.pre + "anno_cdd").click(function (e) {
        me.clickCdd();
    });
    $("#" + me.pre + "anno_3dd").click(function (e) {
    if($("#" + me.pre + "anno_3dd")[0].checked) {
        me.setAnnoTab3ddomain();
        me.setLogCmd("set annotation 3ddomain", true);
    }
    else{
        me.hideAnnoTab3ddomain();
        me.setLogCmd("hide annotation 3ddomain", true);
    }
    });
    $("#" + me.pre + "anno_interact").click(function (e) {
    if($("#" + me.pre + "anno_interact")[0].checked) {
        me.setAnnoTabInteraction();
        me.setLogCmd("set annotation interaction", true);
    }
    else{
        me.hideAnnoTabInteraction();
        me.setLogCmd("hide annotation interaction", true);
    }
    });
    $("#" + me.pre + "anno_custom").click(function (e) {
    if($("#" + me.pre + "anno_custom")[0].checked) {
        me.setAnnoTabCustom();
        me.setLogCmd("set annotation custom", true);
    }
    else{
        me.hideAnnoTabCustom();
        me.setLogCmd("hide annotation custom", true);
    }
    });
    $("#" + me.pre + "anno_ssbond").click(function (e) {
    if($("#" + me.pre + "anno_ssbond")[0].checked) {
        me.setAnnoTabSsbond();
        me.setLogCmd("set annotation ssbond", true);
    }
    else{
        me.hideAnnoTabSsbond();
        me.setLogCmd("hide annotation ssbond", true);
    }
    });
    $("#" + me.pre + "anno_crosslink").click(function (e) {
    if($("#" + me.pre + "anno_crosslink")[0].checked) {
        me.setAnnoTabCrosslink();
        me.setLogCmd("set annotation crosslink", true);
    }
    else{
        me.hideAnnoTabCrosslink();
        me.setLogCmd("hide annotation crosslink", true);
    }
    });
    $("#" + me.pre + "anno_transmem").click(function (e) {
    if($("#" + me.pre + "anno_transmem").length && $("#" + me.pre + "anno_transmem")[0].checked) {
        me.setAnnoTabTransmem();
        me.setLogCmd("set annotation transmembrane", true);
    }
    else{
        me.hideAnnoTabTransmem();
        me.setLogCmd("hide annotation transmembrane", true);
    }
    });
};
iCn3DUI.prototype.clickCdd = function() { var me = this, ic = me.icn3d; "use strict";
  if($("[id^=" + me.pre + "cdd]").length > 0) {
    if($("#" + me.pre + "anno_cdd")[0].checked) {
        me.setAnnoTabCdd();
        me.setLogCmd("set annotation cdd", true);
    }
    else{
        me.hideAnnoTabCdd();
        me.setLogCmd("hide annotation cdd", true);
    }
  }
};

iCn3DUI.prototype.showAnnoSelectedChains = function () {   var me = this, ic = me.icn3d; "use strict";
    // show selected chains in annotation window
    var chainHash = {};
    for(var i in ic.hAtoms) {
        var atom = ic.atoms[i];
        var chainid = atom.structure + '_' + atom.chain;
        chainHash[chainid] = 1;
    }
    $("#" + me.pre + "dl_annotations > .icn3d-annotation").hide();
    for(var chainid in chainHash) {
        if($("#" + me.pre + "anno_" + chainid).length) {
            $("#" + me.pre + "anno_" + chainid).show();
        }
        var atom = ic.getFirstCalphaAtomObj(ic.chains[chainid]);
        if(atom.resn !== undefined) {
            var oneLetterRes = ic.residueName2Abbr(atom.resn.substr(0, 3));
            $("#" + me.pre + "anno_" + oneLetterRes).show();
        }
    }
};
iCn3DUI.prototype.showAnnoAllChains = function () {   var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "dl_annotations > .icn3d-annotation").show();
};
iCn3DUI.prototype.setAnnoView = function(view) { var me = this, ic = me.icn3d; "use strict";
    if(view === 'detailed view') {
        me.view = 'detailed view';
        $( "#" + me.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 1 );
    }
    else { // overview
        me.view = 'overview';
        $( "#" + me.pre + "dl_anno_view_tabs" ).tabs( "option", "active", 0 );
    }
};
iCn3DUI.prototype.setAnnoDisplay = function(display, prefix) { var me = this, ic = me.icn3d; "use strict";
    var itemArray = ['giseq', 'custom', 'site', 'snp', 'clinvar', 'cdd', 'domain', 'interaction', 'ssbond', 'crosslink', 'transmem'];
    for(var i in itemArray) {
        var item = itemArray[i];
        $("[id^=" + me.pre + prefix + "_" + item + "]").attr('style', display);
    }
};
iCn3DUI.prototype.showFixedTitle = function() { var me = this, ic = me.icn3d; "use strict";
        var style = 'display:block;'
        me.setAnnoDisplay(style, 'tt');
};
iCn3DUI.prototype.hideFixedTitle = function() { var me = this, ic = me.icn3d; "use strict";
        var style = 'display:none!important;'
        me.setAnnoDisplay(style, 'tt');
};
iCn3DUI.prototype.setAnnoViewAndDisplay = function(view) { var me = this, ic = me.icn3d; "use strict";
    if(view === 'detailed view') {
        me.setAnnoView('detailed view');
        var style = 'display:block;'
        me.setAnnoDisplay(style, 'dt');
        $("#" + me.pre + "seqguide_wrapper").attr('style', style);
        style = 'display:none;'
        me.setAnnoDisplay(style, 'ov');
    }
    else { // overview
        me.setAnnoView('overview');
        me.hideFixedTitle();
        var style = 'display:none;'
        me.setAnnoDisplay(style, 'dt');
        $("#" + me.pre + "seqguide_wrapper").attr('style', style);
        style = 'display:block;'
        me.setAnnoDisplay(style, 'ov');
    }
};
