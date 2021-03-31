/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// ====== events start ===============
iCn3DUI.prototype.allEventFunctions = function() { var me = this;
    me.clickCustomAtoms();
    me.clickShow_selected();
    me.clickHide_selected();
    me.clickCommand_apply();
    me.click2Ddgm();
    me.clickAddTrackButton();
    me.windowResize();
    me.setTabs();
    me.switchHighlightLevel();
    me.clickModeswitch();

    if(! me.isMobile()) {
        me.selectSequenceNonMobile();
    }
    else {
        me.selectSequenceMobile();
        me.selectChainMobile();
    }

    me.clickMenu1();
    me.clickMenu2();
    me.clickMenu3();
    me.clickMenu4();
    me.clickMenu5();
    me.clickMenu6();

// back and forward arrows
//    clickBack: function() {
    $("#" + me.pre + "back").add("#" + me.pre + "mn6_back").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.setLogCmd("back", false);
       me.back();
    });
//    },
//    clickForward: function() {
    $("#" + me.pre + "forward").add("#" + me.pre + "mn6_forward").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.setLogCmd("forward", false);
       me.forward();
    });
//    },
//    clickFullscreen: function() {
    $("#" + me.pre + "fullscreen").add("#" + me.pre + "mn6_fullscreen").click(function(e) { var ic = me.icn3d; // from expand icon for mobilemenu
       e.preventDefault();
       me = me.setIcn3dui($(this).attr('id'));
       me.setLogCmd("enter full screen", false);
       ic.bFullscreen = true;
       me.WIDTH = $( window ).width();
       me.HEIGHT = $( window ).height();
       ic.setWidthHeight(me.WIDTH, me.HEIGHT);
       ic.draw();
       me.openFullscreen($("#" + me.pre + "canvas")[0]);
    });
    $(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', function (e) { var ic = me.icn3d;
        var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement || document.msFullscreenElement;
        if (!fullscreenElement) {
            me.setLogCmd("exit full screen", false);
            ic.bFullscreen = false;
            me.setViewerWidthHeight();
            ic.setWidthHeight(me.WIDTH, me.HEIGHT);
            ic.draw();
        }
    });
//    },
//    clickToggle: function() {
    $("#" + me.pre + "toggle").add("#" + me.pre + "mn2_toggle").click(function(e) { var ic = me.icn3d;
       //me.setLogCmd("toggle selection", true);
       me.toggleSelection();
       me.setLogCmd("toggle selection", true);
    });
//    },
//    clickHlColorYellow: function() {
    $("#" + me.pre + "mn2_hl_clrYellow").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("set highlight color yellow", true);
       ic.hColor = ic.thr(0xFFFF00);
       ic.matShader = ic.setOutlineColor('yellow');
       ic.draw(); // required to make it work properly
    });
//    },
//    clickHlColorGreen: function() {
    $("#" + me.pre + "mn2_hl_clrGreen").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("set highlight color green", true);
       ic.hColor = ic.thr(0x00FF00);
       ic.matShader = ic.setOutlineColor('green');
       ic.draw(); // required to make it work properly
    });
//    },
//    clickHlColorRed: function() {
    $("#" + me.pre + "mn2_hl_clrRed").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("set highlight color red", true);
       ic.hColor = ic.thr(0xFF0000);
       ic.matShader = ic.setOutlineColor('red');
       ic.draw(); // required to make it work properly
    });
//    },
//    clickHlStyleOutline: function() {
    $("#" + me.pre + "mn2_hl_styleOutline").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("set highlight style outline", true);
       ic.bHighlight = 1;
       me.showHighlight();
    });
//    },
//    clickHlStyleObject: function() {
    $("#" + me.pre + "mn2_hl_styleObject").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("set highlight style 3d", true);
       ic.bHighlight = 2;
       me.showHighlight();
    });
//    },
//    clickHlStyleNone: function() {
    $("#" + me.pre + "mn2_hl_styleNone").click(function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        me.clearHighlight();
        me.setLogCmd("clear selection", true);
    });
//    },
//    clickAlternate: function() {
    $("#" + me.pre + "alternate").add("#" + me.pre + "mn2_alternate").add("#" + me.pre + "alternate2").click(function(e) { var ic = me.icn3d;
       ic.bAlternate = true;
       ic.alternateStructures();
       ic.bAlternate = false;
       //me.setLogCmd("alternate structures", false);
       var structures = Object.keys(me.structures);
       me.setLogCmd("select $" + structures[ic.ALTERNATE_STRUCTURE] + " | name " + structures[ic.ALTERNATE_STRUCTURE], true);
       me.setLogCmd("show selection", true);
    });
//    },
//    clickRealign: function() {
    $("#" + me.pre + "mn2_realignresbyres").click(function(e) { var ic = me.icn3d;
       me.realign();
       me.setLogCmd("realign", true);
    });
//    },
//    clickRealignonseqalign: function() {
    $("#" + me.pre + "mn2_realignonseqalign").click(function(e) { var ic = me.icn3d;
        if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           me.setPredefinedInMenu();
           me.bSetChainsAdvancedMenu = true;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
        }
        var definedAtomsHtml = me.setAtomMenu(['protein']);
        if($("#" + me.pre + "atomsCustomRealign").length) {
            $("#" + me.pre + "atomsCustomRealign").html(definedAtomsHtml);
        }
        if($("#" + me.pre + "atomsCustomRealign2").length) {
            $("#" + me.pre + "atomsCustomRealign2").html(definedAtomsHtml);
        }
        if(ic.bRender) me.openDlg('dl_realign', 'Please select two sets to realign');
        $("#" + me.pre + "atomsCustomRealign").resizable();
        $("#" + me.pre + "atomsCustomRealign2").resizable();
    });
//    },
//    clickApplyRealign: function() {
    $("#" + me.pre + "applyRealign").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var nameArray = $("#" + me.pre + "atomsCustomRealign").val();
       if(nameArray.length > 0) {
           ic.hAtoms = me.getAtomsFromNameArray(nameArray);
       }
       me.realignOnSeqAlign();
       if(nameArray.length > 0) {
           me.setLogCmd("realign on seq align | " + nameArray, true);
       }
       else {
           me.setLogCmd("realign on seq align", true);
       }
    });
//    },

// other
//    clickViewswitch: function() {
    $("#" + me.pre + "anno_summary").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        me.setAnnoViewAndDisplay('overview');
        me.setLogCmd("set view overview", true);
    });
    $("#" + me.pre + "anno_details").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        me.setAnnoViewAndDisplay('detailed view');
        me.setLogCmd("set view detailed view", true);
    });
//    },
//    clickShow_annotations: function() {
    $("#" + me.pre + "show_annotations").click(function(e) { var ic = me.icn3d;
         me.showAnnotations();
         me.setLogCmd("view annotations", true);
    });
//    },
//    clickShowallchains: function() {
    $("#" + me.pre + "showallchains").click(function(e) { var ic = me.icn3d;
       me.showAnnoAllChains();
       me.setLogCmd("show annotations all chains", true);
       ////$( ".icn3d-accordion" ).accordion(me.closeAc);
    });
//    },
//    clickShow_alignsequences: function() {
    $("#" + me.pre + "show_alignsequences").click(function(e) { var ic = me.icn3d;
         me.openDlg('dl_alignment', 'Select residues in aligned sequences');
    });
//    },
//    clickShow_2ddgm: function() {
    $("#" + me.pre + "show_2ddgm").add("#" + me.pre + "mn2_2ddgm").click(function(e) { var ic = me.icn3d;
         me.openDlg('dl_2ddgm', '2D Diagram');
         me.retrieveInteractionData();
         me.setLogCmd("view interactions", true);
         //me.setLogCmd("window interactions", true);
    });
//    },
//    clickSearchSeq: function() {
    $(document).on("click", "#" + me.pre + "search_seq_button", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       var select = $("#" + me.pre + "search_seq").val();
       if(isNaN(select) && select.indexOf('$') == -1 && select.indexOf('.') == -1 && select.indexOf(':') == -1 && select.indexOf('@') == -1) {
           select = ':' + select;
       }
       var commandname = select.replace(/\s+/g, '_');
       //var commanddesc = "search with the one-letter sequence " + select;
       var commanddesc = commandname;
       me.selectByCommand(select, commandname, commanddesc);
       //me.setLogCmd('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);
       me.setLogCmd('select ' + select + ' | name ' + commandname, true);
       ////$( ".icn3d-accordion" ).accordion(me.closeAc);
    });
//    },
//    clickReload_mmtf: function() {
    $("#" + me.pre + "reload_mmtf").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?mmtfid=' + $("#" + me.pre + "mmtfid").val(), '_blank');
    });
//    },
//    clickReload_pdb: function() {
    $("#" + me.pre + "reload_pdb").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
    });
//    },
//    clickReload_opm: function() {
    $("#" + me.pre + "reload_opm").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load opm " + $("#" + me.pre + "opmid").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?opmid=' + $("#" + me.pre + "opmid").val(), '_blank');
    });
//    },
//    clickReload_align_refined: function() {
    $("#" + me.pre + "reload_align_refined").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
       me.setLogCmd("load alignment " + alignment + ' | parameters &atype=1', false);
       window.open(me.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=1', '_blank');
    });
//    },
//    clickReload_align_ori: function() {
    $("#" + me.pre + "reload_align_ori").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
       me.setLogCmd("load alignment " + alignment + ' | parameters &atype=0', false);
       window.open( me.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=0', '_blank');
    });
//    },
//    clickReload_chainalign: function() {
    $("#" + me.pre + "reload_chainalign").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
//       var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();
       var alignment = $("#" + me.pre + "chainalignids").val();
       var resalign = $("#" + me.pre + "resalignids").val();
       me.setLogCmd("load chains " + alignment + " on biological unit | residues " + resalign, false);
       window.open(me.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&resnum=' + resalign + '&showalignseq=1', '_blank');
    });

    $("#" + me.pre + "reload_chainalign_asym").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
//       var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();
       var alignment = $("#" + me.pre + "chainalignids").val();
       var resalign = $("#" + me.pre + "resalignids").val();
       me.setLogCmd("load chains " + alignment + " on asymmetric unit | residues " + resalign, false);
       window.open(me.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&resnum=' + resalign + '&showalignseq=1&buidx=0', '_blank');
    });

    $("#" + me.pre + "reload_mutation_3d").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var mutationids = $("#" + me.pre + "mutationids").val();
       var mmdbid = mutationids.substr(0, mutationids.indexOf('_'));
       me.setLogCmd("3d of mutation " + mutationids, false);
       window.open(me.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap 3d ' + mutationids + '; select displayed set', '_blank');
    });

    $("#" + me.pre + "reload_mutation_pdb").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var mutationids = $("#" + me.pre + "mutationids").val();
       var mmdbid = mutationids.substr(0, mutationids.indexOf('_'));
       me.setLogCmd("pdb of mutation " + mutationids, false);
       window.open(me.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap pdb ' + mutationids + '; select displayed set', '_blank');
    });

    $("#" + me.pre + "reload_mutation_inter").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var mutationids = $("#" + me.pre + "mutationids").val();

       var mutationArray = mutationids.split(',');
       var residArray = [];
       for(var i = 0, il = mutationArray.length; i < il; ++i) {
           var pos = mutationArray[i].lastIndexOf('_');
           var resid = mutationArray[i].substr(0, pos);
           residArray.push(resid);
       }

       var mmdbid = mutationids.substr(0, mutationids.indexOf('_'));

       // if no structures are loaded yet
       if(!ic.structures) {
           ic.structures = {};
           ic.structures[mmdbid] = 1;
       }
       var selectSpec = me.residueids2spec(residArray);

       me.setLogCmd("interaction change of mutation " + mutationids, false);
       window.open(me.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap interaction ' + mutationids + '; select ' + selectSpec + ' | name test; line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5; adjust dialog dl_linegraph; select displayed set', '_blank');
    });

//    },
//    clickReload_mmcif: function() {
    $("#" + me.pre + "reload_mmcif").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?mmcifid=' + $("#" + me.pre + "mmcifid").val(), '_blank');
    });
//    },
//    clickReload_mmdb: function() {
    $("#" + me.pre + "reload_mmdb").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load mmdb " + $("#" + me.pre + "mmdbid").val(), false);
       //me.downloadMmdb($("#" + me.pre + "mmdbid").val());
       window.open(me.baseUrl + 'icn3d/full.html?mmdbid=' + $("#" + me.pre + "mmdbid").val(), '_blank');
    });
//    },
//    clickReload_blast_rep_id: function() {
    $("#" + me.pre + "reload_blast_rep_id").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //var query_id = $("#" + me.pre + "query_id").val().toUpperCase();
       var query_id = $("#" + me.pre + "query_id").val();
       var query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
       //var blast_rep_id = $("#" + me.pre + "blast_rep_id").val().toUpperCase();
       var blast_rep_id = $("#" + me.pre + "blast_rep_id").val();
       me.setLogCmd("load seq_struc_ids " + query_id + "," + blast_rep_id, false);
       query_id = (query_id !== '' && query_id !== undefined) ? query_id : query_fasta;
//           if(query_id !== '' && query_id !== undefined) {
       window.open(me.baseUrl + 'icn3d/full.html?from=icn3d&blast_rep_id=' + blast_rep_id
         + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
         + blast_rep_id + '; show selection'
         + '&query_id=' + query_id, '_blank');
    });
//    },
//    clickReload_gi: function() {
    $("#" + me.pre + "reload_gi").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load gi " + $("#" + me.pre + "gi").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');
    });
//    },
//    clickReload_cid: function() {
    $("#" + me.pre + "reload_cid").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);
       window.open(me.baseUrl + 'icn3d/full.html?cid=' + $("#" + me.pre + "cid").val(), '_blank');
    });
//    },

    me.clickReload_pngimage();

//    clickReload_state: function() {
    $("#" + me.pre + "reload_state").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       // initialize icn3dui
       //Do NOT clear data if iCn3D loads a pdb or other data file and then load a state file
       if(!me.bInputfile) {
           me.init();
           ic.init();
       }
       var file = $("#" + me.pre + "state")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           me.bStatefile = true;

           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load state file ' + $("#" + me.pre + "state").val(), false);
           ic.commands = [];
           ic.optsHistory = [];
           me.loadScript(dataStr, true);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_selectionfile: function() {
    $("#" + me.pre + "reload_selectionfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var file = $("#" + me.pre + "selectionfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           //me.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
           me.loadSelection(dataStr);
           me.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_dsn6file: function() {
    $("#" + me.pre + "reload_dsn6file2fofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadDsn6File('2fofc');
    });
    $("#" + me.pre + "reload_dsn6filefofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadDsn6File('fofc');
    });

    $("#" + me.pre + "reload_delphifile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadDelphiFile('delphi');
    });
    $("#" + me.pre + "reload_pqrfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('pqr');
    });
    $("#" + me.pre + "reload_phifile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('phi');
    });
    $("#" + me.pre + "reload_cubefile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('cube');
    });
    $("#" + me.pre + "reload_pqrurlfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('pqrurl');
    });
    $("#" + me.pre + "reload_phiurlfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('phiurl');
    });
    $("#" + me.pre + "reload_cubeurlfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('cubeurl');
    });

    $("#" + me.pre + "reload_delphifile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('delphi');

       if(!me.cfg.notebook) dialog.dialog( "close" );

       me.loadDelphiFile('delphi2');
    });
    $("#" + me.pre + "reload_pqrfile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phi');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('pqr2');
    });
    $("#" + me.pre + "reload_phifile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phi');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('phi2');
    });
    $("#" + me.pre + "reload_cubefile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phi');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFile('cube2');
    });
    $("#" + me.pre + "reload_pqrurlfile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phiurl');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('pqrurl2');
    });
    $("#" + me.pre + "reload_phiurlfile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phiurl');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('phiurl2');
    });
    $("#" + me.pre + "reload_cubeurlfile2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.updateSurfPara('phiurl');

       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadPhiFileUrl('cubeurl2');
    });

    $("#" + me.pre + "reload_dsn6fileurl2fofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadDsn6FileUrl('2fofc');
    });
    $("#" + me.pre + "reload_dsn6fileurlfofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.loadDsn6FileUrl('fofc');
    });
//    },
//    clickReload_pdbfile: function() {
    $("#" + me.pre + "reload_pdbfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me = me.setIcn3dui(this.id);
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var file = $("#" + me.pre + "pdbfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load pdb file ' + $("#" + me.pre + "pdbfile").val(), false);
           ic.molTitle = "";
           me.init();
           ic.init();
           me.bInputfile = true;
           me.InputfileData = dataStr;
           me.InputfileType = 'pdb';
           me.loadPdbData(dataStr);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_mol2file: function() {
    $("#" + me.pre + "reload_mol2file").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var file = $("#" + me.pre + "mol2file")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load mol2 file ' + $("#" + me.pre + "mol2file").val(), false);
           ic.molTitle = "";
           me.inputid = undefined;
           me.init();
           ic.init();
           me.bInputfile = true;
           me.InputfileData = dataStr;
           me.InputfileType = 'mol2';
           me.loadMol2Data(dataStr);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_sdffile: function() {
    $("#" + me.pre + "reload_sdffile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var file = $("#" + me.pre + "sdffile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load sdf file ' + $("#" + me.pre + "sdffile").val(), false);
           ic.molTitle = "";
           me.inputid = undefined;
           me.init();
           ic.init();
           me.bInputfile = true;
           me.InputfileData = dataStr;
           me.InputfileType = 'sdf';
           me.loadSdfData(dataStr);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_xyzfile: function() {
    $("#" + me.pre + "reload_xyzfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var file = $("#" + me.pre + "xyzfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load xyz file ' + $("#" + me.pre + "xyzfile").val(), false);
           ic.molTitle = "";
           me.inputid = undefined;
           me.init();
           ic.init();
           me.bInputfile = true;
           me.InputfileData = dataStr;
           me.InputfileType = 'xyz';
           me.loadXyzData(dataStr);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickReload_urlfile: function() {
    $("#" + me.pre + "reload_urlfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var type = $("#" + me.pre + "filetype").val();
       var url = $("#" + me.pre + "urlfile").val();
       me.inputurl = 'type=' + type + '&url=' + encodeURIComponent(url);
       me.init();
       ic.init();
       me.bInputfile = true;
       me.bInputUrlfile = true;
       me.downloadUrl(url, type);
    });
//    },
//    clickReload_mmciffile: function() {
    $("#" + me.pre + "reload_mmciffile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       ic.bInitial = true;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       var file = $("#" + me.pre + "mmciffile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;
           me.setLogCmd('load mmcif file ' + $("#" + me.pre + "mmciffile").val(), false);
           ic.molTitle = "";
            var url = me.baseUrl + "mmcifparser/mmcifparser.cgi";
            ic.bCid = undefined;
           $.ajax({
              url: url,
              type: 'POST',
              data : {'mmciffile': dataStr},
              dataType: 'jsonp',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              beforeSend: function() {
                  me.showLoading();
              },
              complete: function() {
                  //me.hideLoading();
              },
              success: function(data) {
                  me.init();
                  ic.init();
                  me.bInputfile = true;
                  me.InputfileData = data;
                  me.InputfileType = 'mmcif';
                  me.loadMmcifData(data);
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
              }
            });
         };
         reader.readAsText(file);
       }
    });
//    },
//    clickApplycustomcolor: function() {
    $("#" + me.pre + "applycustomcolor").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setOption("color", $("#" + me.pre + "colorcustom").val());
       me.setLogCmd("color " + $("#" + me.pre + "colorcustom").val(), true);
    });
//    },
//    clickApplypick_aroundsphere: function() {
    $("#" + me.pre + "atomsCustomSphere2").add("#" + me.pre + "atomsCustomSphere").add("#" + me.pre + "radius_aroundsphere").change(function(e) { var ic = me.icn3d;
        me.bSphereCalc = false;
        //me.setLogCmd('set calculate sphere false', true);
    });
    $("#" + me.pre + "applypick_aroundsphere").click(function(e) { var ic = me.icn3d;
        //e.preventDefault();
        //if(!me.cfg.notebook) dialog.dialog( "close" );
        var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
        var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
        var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
        if(nameArray2.length == 0) {
            alert("Please select the first set at step #1");
        }
        else {
            var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + me.bSphereCalc;
            if(!me.bSphereCalc) me.pickCustomSphere(radius, nameArray2, nameArray, me.bSphereCalc);
            me.bSphereCalc = true;
            //me.setLogCmd('set calculate sphere true', true);
            me.updateHlAll();
            me.setLogCmd(select, true);
        }
    });
    $("#" + me.pre + "sphereExport").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        //if(!me.cfg.notebook) dialog.dialog( "close" );
        var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
        var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
        var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
        if(nameArray2.length == 0) {
            alert("Please select the first set at step #1");
        }
        else {
            me.pickCustomSphere(radius, nameArray2, nameArray, me.bSphereCalc);
            me.bSphereCalc = true;
            var text = me.exportSpherePairs();
            var file_pref = (me.inputid) ? me.inputid : "custom";
            me.saveFile(file_pref + '_sphere_pairs.html', 'html', text);

            me.setLogCmd("export pairs | " + nameArray2 + " " + nameArray + " | dist " + radius, true);
        }
    });
//    },
//    clickApply_adjustmem: function() {
    $("#" + me.pre + "apply_adjustmem").click(function(e) { var ic = me.icn3d;
        //e.preventDefault();
        if(!me.cfg.notebook) dialog.dialog( "close" );
        var extra_mem_z = parseFloat($("#" + me.pre + "extra_mem_z").val());
        var intra_mem_z = parseFloat($("#" + me.pre + "intra_mem_z").val());
        me.adjustMembrane(extra_mem_z, intra_mem_z);
        var select = "adjust membrane z-axis " + extra_mem_z + " " + intra_mem_z;
        me.setLogCmd(select, true);
    });
//    },
//    clickApply_selectplane: function() {
    $("#" + me.pre + "apply_selectplane").click(function(e) { var ic = me.icn3d;
        //e.preventDefault();
        if(!me.cfg.notebook) dialog.dialog( "close" );
        var large = parseFloat($("#" + me.pre + "selectplane_z1").val());
        var small = parseFloat($("#" + me.pre + "selectplane_z2").val());
        me.selectBtwPlanes(large, small);
        var select = "select planes z-axis " + large + " " + small;
        me.setLogCmd(select, true);
    });
//    },
//    clickApplyhbonds: function() {
    $("#" + me.pre + "atomsCustomHbond2").add("#" + me.pre + "atomsCustomHbond").add("#" + me.pre + "analysis_hbond").add("#" + me.pre + "analysis_saltbridge").add("#" + me.pre + "analysis_contact").add("#" + me.pre + "hbondthreshold").add("#" + me.pre + "saltbridgethreshold").add("#" + me.pre + "contactthreshold").change(function(e) { var ic = me.icn3d;
        me.bHbondCalc = false;
        //me.setLogCmd('set calculate hbond false', true);
    });
    $("#" + me.pre + "crossstrucinter").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       ic.crossstrucinter = parseInt($("#" + me.pre + "crossstrucinter").val());
       me.setLogCmd("cross structure interaction " + ic.crossstrucinter, true);
    });
    $("#" + me.pre + "applyhbonds").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('3d');
    });
    $("#" + me.pre + "hbondWindow").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('view');
    });
    $("#" + me.pre + "areaWindow").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var nameArray = $("#" + me.pre + "atomsCustomHbond").val();
       var nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();
       me.calcBuriedSurface(nameArray2, nameArray);
       me.setLogCmd("calc buried surface | " + nameArray2 + " " + nameArray, true);
    });
    $("#" + me.pre + "sortSet1").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('save1');
    });
    $(document).on("click", "." + me.pre + "showintercntonly", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        $(".icn3d-border").hide();
        me.setLogCmd("table inter count only", true);
    });
    $(document).on("click", "." + me.pre + "showinterdetails", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        $(".icn3d-border").show();
        me.setLogCmd("table inter details", true);
    });
    $("#" + me.pre + "sortSet2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('save2');
    });
    $("#" + me.pre + "hbondGraph").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('graph');
    });
    $("#" + me.pre + "hbondLineGraph").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('linegraph');
    });
    $("#" + me.pre + "hbondScatterplot").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.showInteractions('scatterplot');
    });
    // select residues
    $(document).on("click", "#" + me.svgid + " circle.selected", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        var id = $(this).attr('res');
        if(me.bSelectResidue === false && !ic.bShift && !ic.bCtrl) {
          me.removeSelection();
        }
        if(id !== undefined) {
           me.selectResidues(id, this);
           ic.addHlObjects();  // render() is called
        }
    });
    $("#" + me.svgid + "_svg").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.saveSvg(me.svgid, me.inputid + "_force_directed_graph.svg");
    });
    $("#" + me.svgid + "_png").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var width = $("#" + me.pre + "dl_graph").width();
       var height = $("#" + me.pre + "dl_graph").height();
       me.savePng(me.svgid, me.inputid + "_force_directed_graph.png", width, height);
    });
    $("#" + me.svgid + "_json").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        //if(!me.cfg.notebook) dialog.dialog( "close" );
        var graphStr2 = me.graphStr.substr(0, me.graphStr.lastIndexOf('}'));
        graphStr2 += me.getLinkColor();

        me.saveFile(me.inputid + "_force_directed_graph.json", "text", [graphStr2]);
    });
    $("#" + me.linegraphid + "_svg").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.saveSvg(me.linegraphid, me.inputid + "_line_graph.svg");
    });
    $("#" + me.linegraphid + "_png").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var width = $("#" + me.pre + "dl_linegraph").width();
       var height = $("#" + me.pre + "dl_linegraph").height();
       me.savePng(me.linegraphid, me.inputid + "_line_graph.png", width, height);
    });
    $("#" + me.linegraphid + "_json").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        //if(!me.cfg.notebook) dialog.dialog( "close" );
        var graphStr2 = me.lineGraphStr.substr(0, me.lineGraphStr.lastIndexOf('}'));

        graphStr2 += me.getLinkColor();

        me.saveFile(me.inputid + "_line_graph.json", "text", [graphStr2]);
    });
    $("#" + me.linegraphid + "_scale").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var scale = $("#" + me.linegraphid + "_scale").val();
       $("#" + me.linegraphid).attr("width", (me.linegraphWidth * parseFloat(scale)).toString() + "px");
       me.setLogCmd("line graph scale " + scale, true);
    });
    $("#" + me.scatterplotid + "_svg").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.saveSvg(me.scatterplotid, me.inputid + "_scatterplot.svg");
    });
    $("#" + me.scatterplotid + "_png").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var width = $("#" + me.pre + "dl_scatterplot").width();
       var height = $("#" + me.pre + "dl_scatterplot").height();
       me.savePng(me.scatterplotid, me.inputid + "_scatterplot.png", width, height);
    });
    $("#" + me.scatterplotid + "_json").click(function(e) { var ic = me.icn3d;
        e.preventDefault();
        //if(!me.cfg.notebook) dialog.dialog( "close" );
        var graphStr2 = me.scatterplotStr.substr(0, me.scatterplotStr.lastIndexOf('}'));

        graphStr2 += me.getLinkColor();

        me.saveFile(me.inputid + "_scatterplot.json", "text", [graphStr2]);
    });
    $("#" + me.scatterplotid + "_scale").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var scale = $("#" + me.scatterplotid + "_scale").val();
       $("#" + me.scatterplotid).attr("width", (me.scatterplotWidth * parseFloat(scale)).toString() + "px");
       me.setLogCmd("scatterplot scale " + scale, true);
    });
    $("#" + me.svgid + "_label").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var className = $("#" + me.svgid + "_label").val();
       $("#" + me.svgid + " text").removeClass();
       $("#" + me.svgid + " text").addClass(className);
       me.setLogCmd("graph label " + className, true);
    });
    $("#" + me.svgid + "_hideedges").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.hideedges = parseInt($("#" + me.svgid + "_hideedges").val());
       if(me.hideedges) {
            me.contactInsideColor = 'FFF';
            me.hbondInsideColor = 'FFF';
            me.ionicInsideColor = 'FFF';
       }
       else {
            me.contactInsideColor = 'DDD';
            me.hbondInsideColor = 'AFA';
            me.ionicInsideColor = '8FF';
       }
       if(me.graphStr !== undefined) {
           if(ic.bRender && me.force) me.drawGraph(me.graphStr, me.pre + 'dl_graph');
           me.setLogCmd("hide edges " + me.hideedges, true);
       }
    });
    $("#" + me.svgid + "_force").change(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.force = parseInt($("#" + me.svgid + "_force").val());
       if(me.graphStr !== undefined) {
           me.setLogCmd("graph force " + me.force, true);
           me.handleForce();
       }
    });
    $("#" + me.pre + "hbondReset").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       me.resetInteractionPairs();
       me.setLogCmd("reset interaction pairs", true);
    });
//    },
//    clickApplypick_labels: function() {
    $("#" + me.pre + "applypick_labels").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var text = $("#" + me.pre + "labeltext" ).val();
       var size = $("#" + me.pre + "labelsize" ).val();
       var color = $("#" + me.pre + "labelcolor" ).val();
       var background = $("#" + me.pre + "labelbkgd" ).val();
       if(size === '0' || size === '' || size === 'undefined') size = 0;
       if(color === '0' || color === '' || color === 'undefined') color = 0;
       if(background === '0' || background === '' || background === 'undefined') background = 0;
       if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
         alert("Please pick another atom");
       }
       else {
         var x = (ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
         var y = (ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
         var z = (ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
         //me.setLogCmd('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);
         me.addLabel(text, x, y, z, size, color, background, 'custom');
         ic.pickpair = false;
         var sizeStr = '', colorStr = '', backgroundStr = '';
         if(size != 0) sizeStr = ' | size ' + size;
         if(color != 0) colorStr = ' | color ' + color;
         if(background != 0) backgroundStr = ' | background ' + background;
         me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
         ic.draw();
       }
    });
//    },
//    clickApplyselection_labels: function() {
    $("#" + me.pre + "applyselection_labels").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var text = $("#" + me.pre + "labeltext2" ).val();
       var size = $("#" + me.pre + "labelsize2" ).val();
       var color = $("#" + me.pre + "labelcolor2" ).val();
       var background = $("#" + me.pre + "labelbkgd2" ).val();
       if(size === '0' || size === '' || size === 'undefined') size = 0;
       if(color === '0' || color === '' || color === 'undefined') color = 0;
       if(background === '0' || background === '' || background === 'undefined') background = 0;
         var position = ic.centerAtoms(ic.hash2Atoms(ic.hAtoms));
         var x = position.center.x;
         var y = position.center.y;
         var z = position.center.z;
         //me.setLogCmd('add label ' + text + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);
         me.addLabel(text, x, y, z, size, color, background, 'custom');
         var sizeStr = '', colorStr = '', backgroundStr = '';
         if(size != 0) sizeStr = ' | size ' + size;
         if(color != 0) colorStr = ' | color ' + color;
         if(background != 0) backgroundStr = ' | background ' + background;
         me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
         ic.draw();
    });
//    },
//    clickApplypick_stabilizer: function() {
    $("#" + me.pre + "applypick_stabilizer").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
         alert("Please pick another atom");
       }
       else {
         ic.pickpair = false;
         me.setLogCmd('add one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
         if(ic.pairArray === undefined) ic.pairArray = [];
         ic.pairArray.push(ic.pAtom.serial);
         ic.pairArray.push(ic.pAtom2.serial);
         //me.updateStabilizer();
         me.setThichknessFor3Dprint();
         ic.draw();
       }
    });
//    },
// https://github.com/tovic/color-picker
// https://tovic.github.io/color-picker/color-picker.value-update.html
//    pickColor: function() {
    var picker = new CP(document.querySelector("#" + me.pre + "colorcustom"));
    picker.on("change", function(color) {
        this.target.value = color;
    });
    $("#" + me.pre + "colorcustom").on("input keyup paste cut", function() {
        var color = $("#" + me.pre + "colorcustom").val();
        picker.set('#' + color).enter();
    });
//    },
//    clickApplypick_stabilizer_rm: function() {
    $("#" + me.pre + "applypick_stabilizer_rm").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
         alert("Please pick another atom");
       }
       else {
         ic.pickpair = false;
         me.setLogCmd('remove one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
         var rmLineArray = [];
         rmLineArray.push(ic.pAtom.serial);
         rmLineArray.push(ic.pAtom2.serial);
         me.removeOneStabilizer(rmLineArray);
         //me.updateStabilizer();
         ic.draw();
       }
    });
//    },
//    clickApplypick_measuredistance: function() {
    $("#" + me.pre + "applypick_measuredistance").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.bMeasureDistance = false;
       if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
         alert("Please pick another atom");
       }
       else {
         var size = 0, background = 0;
         var color = $("#" + me.pre + "linecolor" ).val();
         var x = (ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
         var y = (ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
         var z = (ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
         me.addLineFromPicking('distance');
         var distance = parseInt(ic.pAtom.coord.distanceTo(ic.pAtom2.coord) * 10) / 10;
         var text = distance.toString() + " A";
         me.addLabel(text, x, y, z, size, color, background, 'distance');
         var sizeStr = '', colorStr = '', backgroundStr = '';
         if(size != 0) sizeStr = ' | size ' + size;
         if(color != 0) colorStr = ' | color ' + color;
         if(background != 0) backgroundStr = ' | background ' + background;
         me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type distance', true);
         ic.draw();
         ic.pk = 2;
       }
    });
//    },

    $("#" + me.pre + "applydist2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.bMeasureDistance = false;

       var nameArray = $("#" + me.pre + "atomsCustomDist").val();
       var nameArray2 = $("#" + me.pre + "atomsCustomDist2").val();

       me.measureDistTwoSets(nameArray, nameArray2);
       me.setLogCmd("dist | " + nameArray2 + " " + nameArray, true);
    });

//    clickApply_thickness: function() {
    $("#" + me.pre + "apply_thickness_3dprint").click(function(e) { var ic = me.icn3d;
        e.preventDefault();

        me.setLineThickness("3dprint");
    });
    $("#" + me.pre + "apply_thickness_style").click(function(e) { var ic = me.icn3d;
        e.preventDefault();

        me.setLineThickness("style");
    });
//    },
//    clickReset: function() {
    $("#" + me.pre + "reset").click(function(e) { var ic = me.icn3d;
        //me.setLogCmd("reset", true);
        //reset ic.maxD
        ic.maxD = ic.oriMaxD;
        ic.center = ic.oriCenter.clone();
        ic.reinitAfterLoad();
        me.renderFinalStep(1);
        me.setMode('all');
        me.setLogCmd("reset", true);
        me.removeSeqChainBkgd();
        me.removeSeqResidueBkgd();
        me.removeHl2D();
        me.removeHlMenus();
    });
//    },
//    clickToggleHighlight: function() {
    $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        me.toggleHighlight();
        me.setLogCmd("toggle highlight", true);
    });
    $(document).on("click", "#" + me.pre + "seq_clearselection", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        if(!me.cfg.notebook) dialog.dialog( "close" );
        me.clearHighlight();
        me.setLogCmd("clear selection", true);
    });
    $(document).on("click", "#" + me.pre + "seq_clearselection2", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        e.preventDefault();
        me.clearHighlight();
        me.setLogCmd("clear selection", true);
    });
    $(document).on("click", "#" + me.pre + "alignseq_clearselection", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        me.clearHighlight();
        me.setLogCmd("clear selection", true);
    });
//    },
//    clickReplay: function() {
    $("#" + me.pre + "replay").click(function(e) { var ic = me.icn3d;
         e.stopImmediatePropagation();
         me.CURRENTNUMBER++;
         var currentNumber = (me.cfg.replay) ? me.STATENUMBER : me.STATENUMBER - 1;
         if(me.CURRENTNUMBER == currentNumber) {
              me.bReplay = 0;
              $("#" + me.pre + "replay").hide();
         } else {
              me.execCommandsBase(me.CURRENTNUMBER, me.CURRENTNUMBER, me.STATENUMBER);
              var pos = ic.commands[me.CURRENTNUMBER].indexOf('|||');
              var cmdStrOri = (pos != -1) ? ic.commands[me.CURRENTNUMBER].substr(0, pos) : ic.commands[me.CURRENTNUMBER];
              var maxLen = 30;
              var cmdStr = (cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;
              var menuStr = me.getMenuFromCmd(cmdStr);
              $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
              $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);
              ic.draw();
         }
    });
//    },

    me.pressCommandtext();

//    clickSeqSaveSelection: function() {
    $(document).on("click", "#" + me.pre + "seq_saveselection", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.saveSelectionPrep();
       var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
       //var description = $("#" + me.pre + "seq_command_desc").val();
       me.saveSelection(name, name);
    });
    $(document).on("click", "#" + me.pre + "seq_saveselection2", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       me.saveSelectionPrep();
       var name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
       //var description = $("#" + me.pre + "seq_command_desc2").val();
       me.saveSelection(name, name);
    });
//    },
//    clickAlignSeqSaveSelection: function() {
    $(document).on("click", "#" + me.pre + "alignseq_saveselection", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       me.saveSelectionPrep();
       var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
       //var description = $("#" + me.pre + "alignseq_command_desc").val();
       me.saveSelection(name, name);
    });
//    },
//    clickOutputSelection: function() {
    $(document).on("click", "." + me.pre + "outputselection", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
        me.bSelectResidue = false;
        me.bSelectAlignResidue = false;
        me.setLogCmd('output selection', true);
        me.outputSelection();
    });
//    },
//    clickSaveDialog: function() {
    $(document).on("click", ".icn3d-saveicon", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       var id = $(this).attr('pid');
       var html = '';
       html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/lib/jquery-ui-1.12.1.min.css">\n';
       html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/icn3d_full_ui.css">\n';
       html += $("#" + id).html();
       var idArray = id.split('_');
       var idStr = (idArray.length > 2) ? idArray[2] : id;
       var structureStr = Object.keys(ic.structures)[0];
       if(Object.keys(ic.structures).length > 1) structureStr += '-' + Object.keys(ic.structures)[1];
       me.saveFile(structureStr + '-' + idStr + '.html', 'html', encodeURIComponent(html));
    });
//    },
//    clickHideDialog: function() {
    $(document).on("click", ".icn3d-hideicon", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       var id = $(this).attr('pid');
       if(!me.cfg.notebook) {
           if(me.dialogHashHideDone === undefined) me.dialogHashHideDone = {};
           if(me.dialogHashPosToRight === undefined) me.dialogHashPosToRight = {};
           if(!me.dialogHashHideDone.hasOwnProperty(id)) {
               me.dialogHashHideDone[id] = {"width": $("#" + id).dialog( "option", "width"), "height": $("#" + id).dialog( "option", "height"), "position": $("#" + id).dialog( "option", "position")};
               var dialogWidth = 160;
               var dialogHeight = 80;
               $("#" + id).dialog( "option", "width", dialogWidth );
               $("#" + id).dialog( "option", "height", dialogHeight );
               var posToRight;
               if(me.dialogHashPosToRight.hasOwnProperty(id)) {
                   posToRight = me.dialogHashPosToRight[id];
               }
               else {
                   posToRight = Object.keys(me.dialogHashPosToRight).length * (dialogWidth + 10);
                   me.dialogHashPosToRight[id] = posToRight;
               }
               var position ={ my: "right bottom", at: "right-" + posToRight + " bottom+60", of: "#" + me.divid, collision: "none" };
               $("#" + id).dialog( "option", "position", position );
           }
           else {
               var width = me.dialogHashHideDone[id].width;
               var height = me.dialogHashHideDone[id].height;
               var position = me.dialogHashHideDone[id].position;
               $("#" + id).dialog( "option", "width", width );
               $("#" + id).dialog( "option", "height", height );
               $("#" + id).dialog( "option", "position", position );
               delete me.dialogHashHideDone[id];
           }
       }
    });
//    },
//    clickResidueOnInteraction: function() {
    // highlight a pair residues
    $(document).on("click", "." + me.pre + "selres", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          me.bSelOneRes = false;
          var elems = $( "." + me.pre + "seloneres" );
          for(var i = 0, il = elems.length; i < il;  ++i) {
              elems[i].checked = false;
          }
          var idArray = $(this).attr('resid').split('|');
          ic.hAtoms = {};
          me.selectedResidues = {};
          var cmd = 'select ';
          for(var i = 0, il = idArray.length; i < il; ++i) {
              var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40
              if(i > 0) cmd += ' or ';
              cmd += me.selectOneResid(idStr);
          }
          me.updateHlAll();
          me.setLogCmd(cmd, true);
    });
    // highlight a residue
    $(document).on("click", "." + me.pre + "seloneres", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          if(!me.bSelOneRes) {
              ic.hAtoms = {};
              me.selectedResidues = {};
              me.bSelOneRes = true;
          }
          var resid = $(this).attr('resid');
          var id = $(this).attr('id');
          if($("#" + id).length && $("#" + id)[0].checked) { // checked
              me.selectOneResid(resid);
          }
          else if($("#" + id).length && !$("#" + id)[0].checked) { // unchecked
              me.selectOneResid(resid, true);
          }
          me.updateHlAll();
    });
    // highlight a set of residues
    $(document).on("click", "." + me.pre + "selset", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          me.bSelOneRes = false;
          var elems = $( "." + me.pre + "seloneres" );
          for(var i = 0, il = elems.length; i < il;  ++i) {
              elems[i].checked = false;
          }
          var cmd = $(this).attr('cmd');
          me.selectByCommand(cmd, '', '');
          ic.removeHlObjects();  // render() is called
          ic.addHlObjects();  // render() is called
          me.setLogCmd(cmd, true);
    });
//    },
//    clickAddTrack: function() {
    $(document).on('click', ".icn3d-addtrack", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      $("#" + me.pre + "anno_custom")[0].checked = true;
      $("[id^=" + me.pre + "custom]").show();
      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      $("#" + me.pre + "track_chainid").val(chainid);
      me.openDlg('dl_addtrack', 'Add track for Chain: ' + chainid);
      $( "#" + me.pre + "track_gi" ).focus();
    });
//    },
//    clickCustomColor: function() {
    $(document).on('click', ".icn3d-customcolor", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      $("#" + me.pre + "customcolor_chainid").val(chainid);
      me.openDlg('dl_customcolor', 'Apply custom color or tube for Chain: ' + chainid);
    });
//    },
//    clickDefineHelix: function() {
    $(document).on('click', ".icn3d-helixsets", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      me.defineSecondary(chainid, 'helix');
      me.setLogCmd('define helix sets | chain ' + chainid, true);
    });
//    },
//    clickDefineSheet: function() {
    $(document).on('click', ".icn3d-sheetsets", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      me.defineSecondary(chainid, 'sheet');
      me.setLogCmd('define sheet sets | chain ' + chainid, true);
    });
//    },
//    clickDefineCoil: function() {
    $(document).on('click', ".icn3d-coilsets", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      me.defineSecondary(chainid, 'coil');
      me.setLogCmd('define coil sets | chain ' + chainid, true);
    });
//    },
//    clickDeleteSets: function() {
    $("#" + me.pre + "deletesets").click(function(e) { var ic = me.icn3d;
         me.deleteSelectedSets();
         me.setLogCmd("delete selected sets", true);
    });
//    },
//    bindMouseup: function() {
    $("accordion").bind('mouseup touchend', function (e) { var ic = me.icn3d;
      if(ic.bControlGl) {
          if(window.controls) {
            window.controls.noRotate = false;
            window.controls.noZoom = false;
            window.controls.noPan = false;
          }
      }
      else {
          if(ic.controls) {
            ic.controls.noRotate = false;
            ic.controls.noZoom = false;
            ic.controls.noPan = false;
          }
      }
    });
//    },
//    bindMousedown: function() {
    $("accordion").bind('mousedown touchstart', function (e) { var ic = me.icn3d;
      if(ic.bControlGl) {
          if(window.controls) {
            window.controls.noRotate = true;
            window.controls.noZoom = true;
            window.controls.noPan = true;
          }
      }
      else {
          if(ic.controls) {
            ic.controls.noRotate = true;
            ic.controls.noZoom = true;
            ic.controls.noPan = true;
          }
      }
    });
//    },
//    expandShrink: function() {
    //$("[id$=_cddseq_expand]").on('click', '.ui-icon-plus', function(e) { var ic = me.icn3d;
    $(document).on("click", ".icn3d-expand", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        var oriId = $(this).attr('id');
        var pos = oriId.lastIndexOf('_');
        var id = oriId.substr(0, pos);
        $("#" + id).show();
        $("#" + id + "_expand").hide();
        $("#" + id + "_shrink").show();
    });
    //$("[id$=_cddseq_shrink]").on('click', '.ui-icon-minus', function(e) { var ic = me.icn3d;
    $(document).on("click", ".icn3d-shrink", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();
        var oriId = $(this).attr('id');
        var pos = oriId.lastIndexOf('_');
        var id = oriId.substr(0, pos);
        $("#" + id).hide();
        $("#" + id + "_expand").show();
        $("#" + id + "_shrink").hide();
    });
//    },
//    scrollAnno: function() {
    window.onscroll = function (e) { var ic = me.icn3d;
        if(me.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
            // show fixed titles
            me.showFixedTitle();
        }
        else {
            // remove fixed titles
            me.hideFixedTitle();
        }
    } ;
    $( "#" + me.pre + "dl_selectannotations" ).scroll(function() {
        if(me.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
            // show fixed titles
            me.showFixedTitle();
        }
        else {
            // remove fixed titles
            me.hideFixedTitle();
        }
    });
//    },

    $("#" + me.pre + "mn6_themeBlue").click(function(e) { var ic = me.icn3d;
       me.setTheme('blue');
       me.setLogCmd("set theme blue", true);
    });
    $("#" + me.pre + "mn6_themeOrange").click(function(e) { var ic = me.icn3d;
       me.setTheme('orange');
       me.setLogCmd("set theme orange", true);
    });
    $("#" + me.pre + "mn6_themeBlack").click(function(e) { var ic = me.icn3d;
       me.setTheme('black');
       me.setLogCmd("set theme black", true);
    });

    $("#" + me.pre + "mn6_doublecolorYes").click(function(e) { var ic = me.icn3d;
       ic.bDoublecolor = true;
       me.setStyle('proteins', 'ribbon');
       //ic.draw();
       me.setLogCmd("set double color on", true);
    });
    $("#" + me.pre + "mn6_doublecolorNo").click(function(e) { var ic = me.icn3d;
       ic.bDoublecolor = false;
       ic.draw();
       me.setLogCmd("set double color off", true);
    });

    $(document).on("click", "." + me.pre + "snpin3d", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();

        var snp = $(this).attr('snp');

        me.retrieveScap(snp);
        me.setLogCmd('scap 3d ' + snp, true);
        me.setLogCmd("select displayed set", true);
    });

    $(document).on("click", "." + me.pre + "snpinter", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();

        var snp = $(this).attr('snp');

        var bInteraction = true;
        me.retrieveScap(snp, bInteraction);
        me.setLogCmd('scap interaction ' + snp, true);

        var idArray = snp.split('_'); //stru_chain_resi_snp
        var select = '.' + idArray[1] + ':' + idArray[2];
        var name = 'snp_' + idArray[1] + '_' + idArray[2];
        me.setLogCmd("select " + select + " | name " + name, true);
        me.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);
        me.setLogCmd("adjust dialog dl_linegraph", true);
        me.setLogCmd("select displayed set", true);
    });

    $(document).on("click", "." + me.pre + "snppdb", function(e) { var ic = me.icn3d;
        e.stopImmediatePropagation();

        var snp = $(this).attr('snp');

        var bPdb = true;
        me.retrieveScap(snp, undefined, bPdb);
        me.setLogCmd('scap pdb ' + snp, true);
    });

};

iCn3DUI.prototype.fileSupport = function() {
     if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
     }
};

iCn3DUI.prototype.getLinkColor = function() {
    var graphStr2 = '';
    graphStr2 += ', linkmap: {\n';
    graphStr2 += '3: {"type": "peptidebond", "c":""},\n';
    graphStr2 += '4: {"type": "ssbond", "c":"FFA500"},\n';
    graphStr2 += '5: {"type": "ionic", "c":"0FF"},\n';
    graphStr2 += '6: {"type": "ionicInside", "c":"FFF"},\n';
    graphStr2 += '11: {"type": "contact", "c":"888"},\n';
    graphStr2 += '12: {"type": "contactInside", "c":"FFF"},\n';
    graphStr2 += '13: {"type": "hbond", "c":"0F0"},\n';
    graphStr2 += '14: {"type": "hbondInside", "c":"FFF"},\n';
    graphStr2 += '15: {"type": "clbond", "c":"006400"},\n';
    graphStr2 += '17: {"type": "halogen", "c":"F0F"},\n';
    graphStr2 += '18: {"type": "halogenInside", "c":"FFF"},\n';
    graphStr2 += '19: {"type": "pication", "c":"F00"},\n';
    graphStr2 += '20: {"type": "picationInside", "c":"FFF"},\n';
    graphStr2 += '21: {"type": "pistacking", "c":"00F"},\n';
    graphStr2 += '22: {"type": "pistackingInside", "c":"FFF"}\n';
    graphStr2 += '}}\n';

    return graphStr2;
};

iCn3DUI.prototype.setLineThickness = function(postfix) { var me = this, ic = me.icn3d; "use strict";
    me.bSetThickness = true;
    ic.lineRadius = parseFloat($("#" + me.pre + "linerad_" + postfix ).val()); //0.1; // hbonds, distance lines
    ic.coilWidth = parseFloat($("#" + me.pre + "coilrad_" + postfix ).val()); //0.4; // style cartoon-coil
    ic.cylinderRadius = parseFloat($("#" + me.pre + "stickrad_" + postfix ).val()); //0.4; // style stick
    ic.traceRadius = parseFloat($("#" + me.pre + "stickrad_" + postfix ).val()); //0.2; // style c alpha trace, nucleotide stick
    ic.dotSphereScale = parseFloat($("#" + me.pre + "ballscale_" + postfix ).val()); //0.3; // style ball and stick, dot
    ic.ribbonthickness = parseFloat($("#" + me.pre + "ribbonthick_" + postfix ).val()); //0.4; // style ribbon, nucleotide cartoon, stand thickness
    ic.helixSheetWidth = parseFloat($("#" + me.pre + "prtribbonwidth_" + postfix ).val()); //1.3; // style ribbon, stand thickness
    ic.nucleicAcidWidth = parseFloat($("#" + me.pre + "nucleotideribbonwidth_" + postfix ).val()); //0.8; // nucleotide cartoon
    me.setLogCmd('set thickness | linerad ' + ic.lineRadius + ' | coilrad ' + ic.coilWidth + ' | stickrad ' + ic.cylinderRadius + ' | tracerad ' + ic.traceRadius + ' | ribbonthick ' + ic.ribbonthickness + ' | proteinwidth ' + ic.helixSheetWidth + ' | nucleotidewidth ' + ic.nucleicAcidWidth  + ' | ballscale ' + ic.dotSphereScale, true);
    ic.draw();
};

iCn3DUI.prototype.updateSurfPara = function(type) { var me = this, ic = me.icn3d; "use strict";
   ic.phisurftype = $("#" + me.pre + type + "surftype").val();
   ic.phisurfop = $("#" + me.pre + type + "surfop").val();
   ic.phisurfwf = $("#" + me.pre + type + "surfwf").val();
};

iCn3DUI.prototype.exportPdb = function() { var me = this, ic = me.icn3d; "use strict";
   var pdbStr = '';
   pdbStr += me.getPDBHeader();
   var atoms = ic.intHash(ic.dAtoms, ic.hAtoms);
   //pdbStr += me.getAtomPDB(atoms, undefined, true);
   pdbStr += me.getAtomPDB(atoms);

   var file_pref = (me.inputid) ? me.inputid : "custom";
   me.saveFile(file_pref + '_icn3d.pdb', 'text', [pdbStr]);
};
