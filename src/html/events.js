/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from './html.js';

import {MyEventCls} from '../utils/myEventCls.js';
import {HashUtilsCls} from '../utils/hashUtilsCls.js';
import {UtilsCls} from '../utils/utilsCls.js';
import {ParasCls} from '../utils/parasCls.js';

import {ResizeCanvas} from '../icn3d/transform/resizeCanvas.js';
import {Draw} from '../icn3d/display/draw.js';
import {ApplyCenter} from '../icn3d/display/applyCenter.js';
import {DefinedSets} from '../icn3d/selection/definedSets.js';
import {Selection} from '../icn3d/selection/selection.js';
import {LoadScript} from '../icn3d/selection/loadScript.js';
import {SelectByCommand} from '../icn3d/selection/selectByCommand.js';

import {Diagram2d} from '../icn3d/analysis/diagram2d.js';
import {AddTrack} from '../icn3d/annotations/addTrack.js';
import {Annotation} from '../icn3d/annotations/annotation.js';
import {ShowAnno} from '../icn3d/annotations/showAnno.js';
import {Resid2spec} from '../icn3d/selection/resid2spec.js';
import {HlSeq} from '../icn3d/highlight/hlSeq.js';
import {HlUpdate} from '../icn3d/highlight/hlUpdate.js';
import {HlObjects} from '../icn3d/highlight/hlObjects.js';

import {ViewInterPairs} from '../icn3d/interaction/viewInterPairs.js';
import {ShowInter} from '../icn3d/interaction/showInter.js';
import {GetGraph} from '../icn3d/interaction/getGraph.js';

import {ClickMenu} from './clickMenu.js';
import {Delphi} from '../icn3d/analysis/delphi.js';
import {Scap} from '../icn3d/analysis/scap.js';
import {SaveFile} from '../icn3d/export/saveFile.js';

import {ParserUtils} from '../icn3d/parsers/parserUtils.js';
import {Dsn6Parser} from '../icn3d/parsers/dsn6Parser.js';
import {PdbParser} from '../icn3d/parsers/pdbParser.js';
import {MmtfParser} from '../icn3d/parsers/mmtfParser.js';
import {OpmParser} from '../icn3d/parsers/opmParser.js';
import {MmdbParser} from '../icn3d/parsers/mmdbParser.js';
import {SdfParser} from '../icn3d/parsers/sdfParser.js';
import {MmcifParser} from '../icn3d/parsers/mmcifParser.js';
import {AlignParser} from '../icn3d/parsers/alignParser.js';
import {ChainalignParser} from '../icn3d/parsers/chainalignParser.js';

class Events {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    // ====== events start ===============
    fullScreenChange() { var me = this.icn3dui, ic = me.icn3d; // event handler uses ".bind(inputAsThis)" to define "this"
        if(me.bNode) return;

        var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
          || document.mozFullscreenElement || document.msFullscreenElement;
        if(!fullscreenElement) {
            me.htmlCls.clickMenuCls.setLogCmd("exit full screen", false);
            ic.bFullscreen = false;
            me.utilsCls.setViewerWidthHeight(me);
            ic.applyCenterCls.setWidthHeight(me.htmlCls.WIDTH, me.htmlCls.HEIGHT);
            ic.drawCls.draw();
        }
    }

    //Hold all functions related to click events.
    allEventFunctions() { var me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        ic.definedSetsCls.clickCustomAtoms();
        ic.definedSetsCls.clickCommand_apply();
        ic.definedSetsCls.clickModeswitch();

        ic.selectionCls.clickShow_selected();
        ic.selectionCls.clickHide_selected();

        ic.diagram2dCls.click2Ddgm();
        ic.addTrackCls.clickAddTrackButton();
        ic.resizeCanvasCls.windowResize();
        ic.annotationCls.setTabs();
        ic.resid2specCls.switchHighlightLevel();

        if(! me.utilsCls.isMobile()) {
            ic.hlSeqCls.selectSequenceNonMobile();
        }
        else {
            ic.hlSeqCls.selectSequenceMobile();
            ic.hlSeqCls.selectChainMobile();
        }

        me.htmlCls.clickMenuCls.clickMenu1();
        me.htmlCls.clickMenuCls.clickMenu2();
        me.htmlCls.clickMenuCls.clickMenu3();
        me.htmlCls.clickMenuCls.clickMenu4();
        me.htmlCls.clickMenuCls.clickMenu5();
        me.htmlCls.clickMenuCls.clickMenu6();

    // back and forward arrows
    //    clickBack: function() {
        me.myEventCls.onIds(["#" + me.pre + "back", "#" + me.pre + "mn6_back"], "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.clickMenuCls.setLogCmd("back", false);
           ic.resizeCanvasCls.back();
        });
    //    },
    //    clickForward: function() {
        me.myEventCls.onIds(["#" + me.pre + "forward", "#" + me.pre + "mn6_forward"], "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.clickMenuCls.setLogCmd("forward", false);
           ic.resizeCanvasCls.forward();
        });
    //    },
    //    clickFullscreen: function() {
        me.myEventCls.onIds(["#" + me.pre + "fullscreen", "#" + me.pre + "mn6_fullscreen"], "click", function(e) { var ic = me.icn3d; // from expand icon for mobilemenu
           e.preventDefault();
           //me = ic.setIcn3dui($(this).attr('id'));
           me.htmlCls.clickMenuCls.setLogCmd("enter full screen", false);
           ic.bFullscreen = true;
           me.htmlCls.WIDTH = $( window ).width();
           me.htmlCls.HEIGHT = $( window ).height();
           ic.applyCenterCls.setWidthHeight(me.htmlCls.WIDTH, me.htmlCls.HEIGHT);
           ic.drawCls.draw();
           ic.resizeCanvasCls.openFullscreen($("#" + me.pre + "canvas")[0]);
        });

        //$(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('fullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('msfullscreenchange', this.fullScreenChange.bind(this));

    //    },
    //    clickToggle: function() {
        me.myEventCls.onIds(["#" + me.pre + "toggle", "#" + me.pre + "mn2_toggle"], "click", function(e) { var ic = me.icn3d;
           //me.htmlCls.clickMenuCls.setLogCmd("toggle selection", true);
           ic.selectionCls.toggleSelection();
           me.htmlCls.clickMenuCls.setLogCmd("toggle selection", true);
        });
    //    },
    //    clickHlColorYellow: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrYellow", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.clickMenuCls.setLogCmd("set highlight color yellow", true);
           ic.hColor = me.parasCls.thr(0xFFFF00);
           ic.matShader = ic.setColorCls.setOutlineColor('yellow');
           ic.drawCls.draw(); // required to make it work properly
        });
    //    },
    //    clickHlColorGreen: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrGreen", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.clickMenuCls.setLogCmd("set highlight color green", true);
           ic.hColor = me.parasCls.thr(0x00FF00);
           ic.matShader = ic.setColorCls.setOutlineColor('green');
           ic.drawCls.draw(); // required to make it work properly
        });
    //    },
    //    clickHlColorRed: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrRed", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.clickMenuCls.setLogCmd("set highlight color red", true);
           ic.hColor = me.parasCls.thr(0xFF0000);
           ic.matShader = ic.setColorCls.setOutlineColor('red');
           ic.drawCls.draw(); // required to make it work properly
        });
    //    },
    //    clickHlStyleOutline: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleOutline", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.clickMenuCls.setLogCmd("set highlight style outline", true);
           ic.bHighlight = 1;
           ic.hlUpdateCls.showHighlight();
        });
    //    },
    //    clickHlStyleObject: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleObject", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.clickMenuCls.setLogCmd("set highlight style 3d", true);
           ic.bHighlight = 2;
           ic.hlUpdateCls.showHighlight();
        });
    //    },
    //    clickHlStyleNone: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleNone", "click", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.clearHighlight();
            me.htmlCls.clickMenuCls.setLogCmd("clear selection", true);
        });
    //    },
    //    clickAlternate: function() {
        me.myEventCls.onIds(["#" + me.pre + "alternate", "#" + me.pre + "mn2_alternate", "#" + me.pre + "alternate2"], "click", function(e) { var ic = me.icn3d;
           ic.bAlternate = true;
           ic.alternateCls.alternateStructures();
           ic.bAlternate = false;

           me.htmlCls.clickMenuCls.setLogCmd("alternate structures", false);
           //var structures = Object.keys(ic.structures);
           //me.htmlCls.clickMenuCls.setLogCmd("select $" + structures[ic.ALTERNATE_STRUCTURE] + " | name " + structures[ic.ALTERNATE_STRUCTURE], true);
           //me.htmlCls.clickMenuCls.setLogCmd("show selection", true);
        });
    //    },
    //    clickRealign: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_realignresbyres", "click", function(e) { var ic = me.icn3d;
           ic.realignParserCls.realign();
           me.htmlCls.clickMenuCls.setLogCmd("realign", true);
        });
    //    },
    //    clickRealignonseqalign: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_realignonseqalign", "click", function(e) { var ic = me.icn3d;
            if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
               var prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
               ic.definedSetsCls.setPredefinedInMenu();
               ic.bSetChainsAdvancedMenu = true;
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            }
            var definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
            if($("#" + me.pre + "atomsCustomRealign").length) {
                $("#" + me.pre + "atomsCustomRealign").html(definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomRealign2").length) {
                $("#" + me.pre + "atomsCustomRealign2").html(definedAtomsHtml);
            }
            if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_realign', 'Please select two sets to realign');
            $("#" + me.pre + "atomsCustomRealign").resizable();
            $("#" + me.pre + "atomsCustomRealign2").resizable();
        });
    //    },
    //    clickApplyRealign: function() {
        me.myEventCls.onIds("#" + me.pre + "applyRealign", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var nameArray = $("#" + me.pre + "atomsCustomRealign").val();
           if(nameArray.length > 0) {
               ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
           }
           ic.realignParserCls.realignOnSeqAlign();
           if(nameArray.length > 0) {
               me.htmlCls.clickMenuCls.setLogCmd("realign on seq align | " + nameArray, true);
           }
           else {
               me.htmlCls.clickMenuCls.setLogCmd("realign on seq align", true);
           }
        });
    //    },

    // other
    //    clickViewswitch: function() {
        me.myEventCls.onIds("#" + me.pre + "anno_summary", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            ic.annotationCls.setAnnoViewAndDisplay('overview');
            me.htmlCls.clickMenuCls.setLogCmd("set view overview", true);
        });
        me.myEventCls.onIds("#" + me.pre + "anno_details", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
            me.htmlCls.clickMenuCls.setLogCmd("set view detailed view", true);
        });
    //    },
    //    clickShow_annotations: function() {
        me.myEventCls.onIds("#" + me.pre + "show_annotations", "click", function(e) { var ic = me.icn3d;
             ic.showAnnoCls.showAnnotations();
             me.htmlCls.clickMenuCls.setLogCmd("view annotations", true);
        });
    //    },
    //    clickShowallchains: function() {
        me.myEventCls.onIds("#" + me.pre + "showallchains", "click", function(e) { var ic = me.icn3d;
           ic.annotationCls.showAnnoAllChains();
           me.htmlCls.clickMenuCls.setLogCmd("show annotations all chains", true);
           ////$( ".icn3d-accordion" ).accordion(me.htmlCls.closeAc);
        });
    //    },
    //    clickShow_alignsequences: function() {
        me.myEventCls.onIds("#" + me.pre + "show_alignsequences", "click", function(e) { var ic = me.icn3d;
             me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        });
    //    },
    //    clickShow_2ddgm: function() {
        me.myEventCls.onIds(["#" + me.pre + "show_2ddgm", "#" + me.pre + "mn2_2ddgm"], "click", function(e) { var ic = me.icn3d;
             me.htmlCls.dialogCls.openDlg('dl_2ddgm', '2D Diagram');
             ic.viewInterPairsCls.retrieveInteractionData();
             me.htmlCls.clickMenuCls.setLogCmd("view interactions", true);
             //me.htmlCls.clickMenuCls.setLogCmd("window interactions", true);
        });
    //    },
    //    clickSearchSeq: function() {
        me.myEventCls.onIds("#" + me.pre + "search_seq_button", "click", function(e) { var ic = me.icn3d;
           e.stopImmediatePropagation();
           var select = $("#" + me.pre + "search_seq").val();
           if(isNaN(select) && select.indexOf('$') == -1 && select.indexOf('.') == -1 && select.indexOf(':') == -1 && select.indexOf('@') == -1) {
               select = ':' + select;
           }
           var commandname = select.replace(/\s+/g, '_');
           //var commanddesc = "search with the one-letter sequence " + select;
           var commanddesc = commandname;
           ic.selByCommCls.selectByCommand(select, commandname, commanddesc);
           //me.htmlCls.clickMenuCls.setLogCmd('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);
           me.htmlCls.clickMenuCls.setLogCmd('select ' + select + ' | name ' + commandname, true);
           ////$( ".icn3d-accordion" ).accordion(me.htmlCls.closeAc);
        });
    //    },
    //    clickReload_mmtf: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_mmtf", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmtfid=' + $("#" + me.pre + "mmtfid").val(), '_blank');
        });
    //    },
    //    clickReload_pdb: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_pdb", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
        });
    //    },
    //    clickReload_opm: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_opm", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load opm " + $("#" + me.pre + "opmid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?opmid=' + $("#" + me.pre + "opmid").val(), '_blank');
        });
    //    },
    //    clickReload_align_refined: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_align_refined", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
           me.htmlCls.clickMenuCls.setLogCmd("load alignment " + alignment + ' | parameters &atype=1', false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=1', '_blank');
        });
    //    },
    //    clickReload_align_ori: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_align_ori", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
           me.htmlCls.clickMenuCls.setLogCmd("load alignment " + alignment + ' | parameters &atype=0', false);
           window.open( me.htmlCls.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=0', '_blank');
        });
    //    },
    //    clickReload_chainalign: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_chainalign", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
    //       var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();
           var alignment = $("#" + me.pre + "chainalignids").val();
           var resalign = $("#" + me.pre + "resalignids").val();
           var predefinedres = $("#" + me.pre + "predefinedres").val().trim().replace(/\n/g, ' | ');

           if(predefinedres && alignment.split(',').length != predefinedres.split(' | ').length) {
               alert("Please make sure the number of chains and the lines of predefined residues are the same...");
               return;
           }

           me.htmlCls.clickMenuCls.setLogCmd("load chains " + alignment + " | residues " + resalign + " | resdef " + predefinedres, false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&resnum=' + resalign + '&resdef=' + predefinedres + '&showalignseq=1', '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_chainalign_asym", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
    //       var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();
           var alignment = $("#" + me.pre + "chainalignids").val();
           var resalign = $("#" + me.pre + "resalignids").val();
           var predefinedres = $("#" + me.pre + "predefinedres").val().trim().replace(/\n/g, ' | ');
           if(predefinedres && alignment.split(',').length != predefinedres.split(' | ').length) {
               alert("Please make sure the number of chains and the lines of predefined residues are the same...");
               return;
           }

           me.htmlCls.clickMenuCls.setLogCmd("load chains " + alignment + " on asymmetric unit | residues " + resalign + " | resdef " + predefinedres, false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&resnum=' + resalign + '&resdef=' + predefinedres + '&showalignseq=1&buidx=0', '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_3d", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var mutationids = $("#" + me.pre + "mutationids").val();
           var mmdbid = mutationids.substr(0, mutationids.indexOf('_'));
           me.htmlCls.clickMenuCls.setLogCmd("3d of mutation " + mutationids, false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap 3d ' + mutationids + '; select displayed set', '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_pdb", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var mutationids = $("#" + me.pre + "mutationids").val();
           var mmdbid = mutationids.substr(0, mutationids.indexOf('_'));
           me.htmlCls.clickMenuCls.setLogCmd("pdb of mutation " + mutationids, false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap pdb ' + mutationids + '; select displayed set', '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_inter", "click", function(e) { var ic = me.icn3d;
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
               ic.structures = {}
               ic.structures[mmdbid] = 1;
           }
           var selectSpec = ic.resid2specCls.residueids2spec(residArray);

           me.htmlCls.clickMenuCls.setLogCmd("interaction change of mutation " + mutationids, false);
           //window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap interaction ' + mutationids + '; select ' + selectSpec + ' | name test; line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5; adjust dialog dl_linegraph; select displayed set', '_blank');
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmdbid=' + mmdbid + '&command=scap interaction ' + mutationids, '_blank');
        });

    //    },
    //    clickReload_mmcif: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_mmcif", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmcifid=' + $("#" + me.pre + "mmcifid").val(), '_blank');
        });
    //    },
    //    clickReload_mmdb: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_mmdb", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load mmdb " + $("#" + me.pre + "mmdbid").val(), false);
           //ic.mmdbParserCls.downloadMmdb($("#" + me.pre + "mmdbid").val());
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?mmdbid=' + $("#" + me.pre + "mmdbid").val(), '_blank');
        });
    //    },
    //    clickReload_blast_rep_id: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_blast_rep_id", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //var query_id = $("#" + me.pre + "query_id").val().toUpperCase();
           var query_id = $("#" + me.pre + "query_id").val();
           var query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
           //var blast_rep_id = $("#" + me.pre + "blast_rep_id").val().toUpperCase();
           var blast_rep_id = $("#" + me.pre + "blast_rep_id").val();
           me.htmlCls.clickMenuCls.setLogCmd("load seq_struc_ids " + query_id + "," + blast_rep_id, false);
           query_id =(query_id !== '' && query_id !== undefined) ? query_id : query_fasta;
    //           if(query_id !== '' && query_id !== undefined) {
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?from=icn3d&blast_rep_id=' + blast_rep_id
             + '&query_id=' + query_id
             + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
             + blast_rep_id + '; show selection', '_blank');
        });
    //    },
    //    clickReload_gi: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_gi", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load gi " + $("#" + me.pre + "gi").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_uniprotid", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load uniprotid " + $("#" + me.pre + "uniprotid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?uniprotid=' + $("#" + me.pre + "uniprotid").val(), '_blank');
        });
    //    },
    //    clickReload_cid: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_cid", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.clickMenuCls.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);
           window.open(me.htmlCls.baseUrl + 'icn3d/full.html?cid=' + $("#" + me.pre + "cid").val(), '_blank');
        });
    //    },

        me.htmlCls.setHtmlCls.clickReload_pngimage();

    //    clickReload_state: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_state", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           // initialize icn3dui
           //Do NOT clear data if iCn3D loads a pdb or other data file and then load a state file
           if(!ic.bInputfile) {
               //ic.initUI();
               ic.init();
           }
           var file = $("#" + me.pre + "state")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               ic.bStatefile = true;

               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load state file ' + $("#" + me.pre + "state").val(), false);
               ic.commands = [];
               ic.optsHistory = [];
               ic.loadScriptCls.loadScript(dataStr, true);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_selectionfile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_selectionfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var file = $("#" + me.pre + "selectionfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               //me.htmlCls.clickMenuCls.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
               ic.selectionCls.loadSelection(dataStr);
               me.htmlCls.clickMenuCls.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_dsn6file: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_dsn6file2fofc", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6File('2fofc');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_dsn6filefofc", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6File('fofc');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_delphifile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadDelphiFile('delphi');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('pqr');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phifile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('phi');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubefile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('cube');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrurlfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('pqrurl');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phiurlfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('phiurl');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubeurlfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('cubeurl');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_delphifile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('delphi');

           if(!me.cfg.notebook) dialog.dialog( "close" );

           ic.delphiCls.loadDelphiFile('delphi2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrfile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('pqr2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phifile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('phi2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubefile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('cube2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrurlfile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('pqrurl2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phiurlfile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('phiurl2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubeurlfile2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFileUrl('cubeurl2');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_dsn6fileurl2fofc", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6FileUrl('2fofc');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_dsn6fileurlfofc", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6FileUrl('fofc');
        });
    //    },
    //    clickReload_pdbfile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_pdbfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //me = ic.setIcn3dui(this.id);
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var file = $("#" + me.pre + "pdbfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load pdb file ' + $("#" + me.pre + "pdbfile").val(), false);
               ic.molTitle = "";
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = dataStr;
               ic.InputfileType = 'pdb';
               ic.pdbParserCls.loadPdbData(dataStr);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_mol2file: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_mol2file", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var file = $("#" + me.pre + "mol2file")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load mol2 file ' + $("#" + me.pre + "mol2file").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = dataStr;
               ic.InputfileType = 'mol2';
               ic.mol2ParserCls.loadMol2Data(dataStr);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_sdffile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_sdffile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var file = $("#" + me.pre + "sdffile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load sdf file ' + $("#" + me.pre + "sdffile").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = dataStr;
               ic.InputfileType = 'sdf';
               ic.sdfParserCls.loadSdfData(dataStr);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_xyzfile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_xyzfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var file = $("#" + me.pre + "xyzfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load xyz file ' + $("#" + me.pre + "xyzfile").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = dataStr;
               ic.InputfileType = 'xyz';
               ic.xyzParserCls.loadXyzData(dataStr);
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickReload_urlfile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_urlfile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var type = $("#" + me.pre + "filetype").val();
           var url = $("#" + me.pre + "urlfile").val();
           ic.inputurl = 'type=' + type + '&url=' + encodeURIComponent(url);
           //ic.initUI();
           ic.init();
           ic.bInputfile = true;
           ic.bInputUrlfile = true;
           ic.pdbParserCls.downloadUrl(url, type);
        });
    //    },
    //    clickReload_mmciffile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_mmciffile", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           ic.bInitial = true;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           var file = $("#" + me.pre + "mmciffile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             var reader = new FileReader();
             reader.onload = function(e) {
               var dataStr = e.target.result; // or = reader.result;
               me.htmlCls.clickMenuCls.setLogCmd('load mmcif file ' + $("#" + me.pre + "mmciffile").val(), false);
               ic.molTitle = "";
                var url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
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
                      ic.ParserUtilsCls.showLoading();
                  },
                  complete: function() {
                      //ic.ParserUtilsCls.hideLoading();
                  },
                  success: function(data) {
                      //ic.initUI();
                      ic.init();
                      ic.bInputfile = true;
                      ic.InputfileData = data;
                      ic.InputfileType = 'mmcif';
                      ic.mmcifParserCls.loadMmcifData(data);
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if(this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    return;
                  }
                });
             }
             reader.readAsText(file);
           }
        });
    //    },
    //    clickApplycustomcolor: function() {
        me.myEventCls.onIds("#" + me.pre + "applycustomcolor", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.setOptionCls.setOption("color", $("#" + me.pre + "colorcustom").val());
           me.htmlCls.clickMenuCls.setLogCmd("color " + $("#" + me.pre + "colorcustom").val(), true);
        });
    //    },
    //    clickApplypick_aroundsphere: function() {
        me.myEventCls.onIds(["#" + me.pre + "atomsCustomSphere2", "#" + me.pre + "atomsCustomSphere", "#" + me.pre + "radius_aroundsphere"], "change", function(e) { var ic = me.icn3d;
            ic.bSphereCalc = false;
            //me.htmlCls.clickMenuCls.setLogCmd('set calculate sphere false', true);
        });
        me.myEventCls.onIds("#" + me.pre + "applypick_aroundsphere", "click", function(e) { var ic = me.icn3d;
            //e.preventDefault();
            //if(!me.cfg.notebook) dialog.dialog( "close" );
            var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + ic.bSphereCalc;
                if(!ic.bSphereCalc) ic.showInterCls.pickCustomSphere(radius, nameArray2, nameArray, ic.bSphereCalc);
                ic.bSphereCalc = true;
                //me.htmlCls.clickMenuCls.setLogCmd('set calculate sphere true', true);
                ic.hlUpdateCls.updateHlAll();
                me.htmlCls.clickMenuCls.setLogCmd(select, true);
            }
        });
        me.myEventCls.onIds("#" + me.pre + "sphereExport", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            //if(!me.cfg.notebook) dialog.dialog( "close" );
            var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                ic.showInterCls.pickCustomSphere(radius, nameArray2, nameArray, ic.bSphereCalc);
                ic.bSphereCalc = true;
                var text = ic.viewInterPairsCls.exportSpherePairs();
                var file_pref =(ic.inputid) ? ic.inputid : "custom";
                ic.saveFileCls.saveFile(file_pref + '_sphere_pairs.html', 'html', text);

                me.htmlCls.clickMenuCls.setLogCmd("export pairs | " + nameArray2 + " " + nameArray + " | dist " + radius, true);
            }
        });
    //    },
    //    clickApply_adjustmem: function() {
        me.myEventCls.onIds("#" + me.pre + "apply_adjustmem", "click", function(e) { var ic = me.icn3d;
            //e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            var extra_mem_z = parseFloat($("#" + me.pre + "extra_mem_z").val());
            var intra_mem_z = parseFloat($("#" + me.pre + "intra_mem_z").val());
            ic.selectionCls.adjustMembrane(extra_mem_z, intra_mem_z);
            var select = "adjust membrane z-axis " + extra_mem_z + " " + intra_mem_z;
            me.htmlCls.clickMenuCls.setLogCmd(select, true);
        });
    //    },
    //    clickApply_selectplane: function() {
        me.myEventCls.onIds("#" + me.pre + "apply_selectplane", "click", function(e) { var ic = me.icn3d;
            //e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            var large = parseFloat($("#" + me.pre + "selectplane_z1").val());
            var small = parseFloat($("#" + me.pre + "selectplane_z2").val());
            ic.selectionCls.selectBtwPlanes(large, small);
            var select = "select planes z-axis " + large + " " + small;
            me.htmlCls.clickMenuCls.setLogCmd(select, true);
        });
    //    },
    //    clickApplyhbonds: function() {
        me.myEventCls.onIds(["#" + me.pre + "atomsCustomHbond2", "#" + me.pre + "atomsCustomHbond", "#" + me.pre + "analysis_hbond", "#" + me.pre + "analysis_saltbridge", "#" + me.pre + "analysis_contact", "#" + me.pre + "hbondthreshold", "#" + me.pre + "saltbridgethreshold", "#" + me.pre + "contactthreshold"], "change", function(e) { var ic = me.icn3d;
            ic.bHbondCalc = false;
            //me.htmlCls.clickMenuCls.setLogCmd('set calculate hbond false', true);
        });
        me.myEventCls.onIds("#" + me.pre + "crossstrucinter", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.crossstrucinter = parseInt($("#" + me.pre + "crossstrucinter").val());
           me.htmlCls.clickMenuCls.setLogCmd("cross structure interaction " + ic.crossstrucinter, true);
        });
        me.myEventCls.onIds("#" + me.pre + "applyhbonds", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('3d');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondWindow", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('view');
        });
        me.myEventCls.onIds("#" + me.pre + "areaWindow", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var nameArray = $("#" + me.pre + "atomsCustomHbond").val();
           var nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();
           ic.analysisCls.calcBuriedSurface(nameArray2, nameArray);
           me.htmlCls.clickMenuCls.setLogCmd("calc buried surface | " + nameArray2 + " " + nameArray, true);
        });
        me.myEventCls.onIds("#" + me.pre + "sortSet1", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('save1');
        });
        $(document).on("click", "." + me.pre + "showintercntonly", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            $(".icn3d-border").hide();
            me.htmlCls.clickMenuCls.setLogCmd("table inter count only", true);
        });
        $(document).on("click", "." + me.pre + "showinterdetails", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            $(".icn3d-border").show();
            me.htmlCls.clickMenuCls.setLogCmd("table inter details", true);
        });
        me.myEventCls.onIds("#" + me.pre + "sortSet2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('save2');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondGraph", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('graph');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondLineGraph", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('linegraph');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondScatterplot", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.showInterCls.showInteractions('scatterplot');
        });
        // select residues
        $(document).on("click", "#" + me.svgid + " circle.selected", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            var id = $(this).attr('res');
            if(ic.bSelectResidue === false && !ic.bShift && !ic.bCtrl) {
              ic.selectionCls.removeSelection();
            }
            if(id !== undefined) {
               ic.hlSeqCls.selectResidues(id, this);
               ic.hlObjectsCls.addHlObjects();  // render() is called
            }
        });
        me.myEventCls.onIds("#" + me.svgid + "_svg", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.saveFileCls.saveSvg(me.svgid, ic.inputid + "_force_directed_graph.svg");
        });
        me.myEventCls.onIds("#" + me.svgid + "_png", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var width = $("#" + me.pre + "dl_graph").width();
           var height = $("#" + me.pre + "dl_graph").height();
           ic.saveFileCls.savePng(me.svgid, ic.inputid + "_force_directed_graph.png", width, height);
        });
        me.myEventCls.onIds("#" + me.svgid + "_json", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            //if(!me.cfg.notebook) dialog.dialog( "close" );
            var graphStr2 = ic.graphStr.substr(0, ic.graphStr.lastIndexOf('}'));
            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_force_directed_graph.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_svg", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.saveFileCls.saveSvg(me.linegraphid, ic.inputid + "_line_graph.svg");
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_png", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var width = $("#" + me.pre + "dl_linegraph").width();
           var height = $("#" + me.pre + "dl_linegraph").height();
           ic.saveFileCls.savePng(me.linegraphid, ic.inputid + "_line_graph.png", width, height);
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_json", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            //if(!me.cfg.notebook) dialog.dialog( "close" );
            var graphStr2 = ic.lineGraphStr.substr(0, ic.lineGraphStr.lastIndexOf('}'));

            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_line_graph.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_scale", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var scale = $("#" + me.linegraphid + "_scale").val();
           $("#" + me.linegraphid).attr("width",(ic.linegraphWidth * parseFloat(scale)).toString() + "px");
           me.htmlCls.clickMenuCls.setLogCmd("line graph scale " + scale, true);
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_svg", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.saveFileCls.saveSvg(me.scatterplotid, ic.inputid + "_scatterplot.svg");
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_png", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var width = $("#" + me.pre + "dl_scatterplot").width();
           var height = $("#" + me.pre + "dl_scatterplot").height();
           ic.saveFileCls.savePng(me.scatterplotid, ic.inputid + "_scatterplot.png", width, height);
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_json", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();
            //if(!me.cfg.notebook) dialog.dialog( "close" );
            var graphStr2 = ic.scatterplotStr.substr(0, ic.scatterplotStr.lastIndexOf('}'));

            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_scatterplot.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_scale", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var scale = $("#" + me.scatterplotid + "_scale").val();
           $("#" + me.scatterplotid).attr("width",(ic.scatterplotWidth * parseFloat(scale)).toString() + "px");
           me.htmlCls.clickMenuCls.setLogCmd("scatterplot scale " + scale, true);
        });
        me.myEventCls.onIds("#" + me.svgid + "_label", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           var className = $("#" + me.svgid + "_label").val();
           $("#" + me.svgid + " text").removeClass();
           $("#" + me.svgid + " text").addClass(className);
           me.htmlCls.clickMenuCls.setLogCmd("graph label " + className, true);
        });
        me.myEventCls.onIds("#" + me.svgid + "_hideedges", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.hideedges = parseInt($("#" + me.svgid + "_hideedges").val());
           if(me.htmlCls.hideedges) {
                me.htmlCls.contactInsideColor = 'FFF';
                me.htmlCls.hbondInsideColor = 'FFF';
                me.htmlCls.ionicInsideColor = 'FFF';
           }
           else {
                me.htmlCls.contactInsideColor = 'DDD';
                me.htmlCls.hbondInsideColor = 'AFA';
                me.htmlCls.ionicInsideColor = '8FF';
           }
           if(ic.graphStr !== undefined) {
               if(ic.bRender && me.htmlCls.force) me.drawGraph(ic.graphStr, me.pre + 'dl_graph');
               me.htmlCls.clickMenuCls.setLogCmd("hide edges " + me.htmlCls.hideedges, true);
           }
        });
        me.myEventCls.onIds("#" + me.svgid + "_force", "change", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           me.htmlCls.force = parseInt($("#" + me.svgid + "_force").val());
           if(ic.graphStr !== undefined) {
               me.htmlCls.clickMenuCls.setLogCmd("graph force " + me.htmlCls.force, true);
               ic.getGraphCls.handleForce();
           }
        });
        me.myEventCls.onIds("#" + me.pre + "hbondReset", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.viewInterPairsCls.resetInteractionPairs();
           me.htmlCls.clickMenuCls.setLogCmd("reset interaction pairs", true);
        });
    //    },
    //    clickApplypick_labels: function() {
        me.myEventCls.onIds("#" + me.pre + "applypick_labels", "click", function(e) { var ic = me.icn3d;
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
             var x =(ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
             var y =(ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
             var z =(ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
             //me.htmlCls.clickMenuCls.setLogCmd('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'custom');
             ic.pickpair = false;
             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             me.htmlCls.clickMenuCls.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
             ic.drawCls.draw();
           }
        });
    //    },
    //    clickApplyselection_labels: function() {
        me.myEventCls.onIds("#" + me.pre + "applyselection_labels", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           var text = $("#" + me.pre + "labeltext2" ).val();
           var size = $("#" + me.pre + "labelsize2" ).val();
           var color = $("#" + me.pre + "labelcolor2" ).val();
           var background = $("#" + me.pre + "labelbkgd2" ).val();
           if(size === '0' || size === '' || size === 'undefined') size = 0;
           if(color === '0' || color === '' || color === 'undefined') color = 0;
           if(background === '0' || background === '' || background === 'undefined') background = 0;
             var position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms));
             var x = position.center.x;
             var y = position.center.y;
             var z = position.center.z;
             //me.htmlCls.clickMenuCls.setLogCmd('add label ' + text + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'custom');
             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             me.htmlCls.clickMenuCls.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
             ic.drawCls.draw();
        });
    //    },
    //    clickApplypick_stabilizer: function() {
        me.myEventCls.onIds("#" + me.pre + "applypick_stabilizer", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             ic.pickpair = false;
             me.htmlCls.clickMenuCls.setLogCmd('add one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
             if(ic.pairArray === undefined) ic.pairArray = [];
             ic.pairArray.push(ic.pAtom.serial);
             ic.pairArray.push(ic.pAtom2.serial);
             //ic.updateStabilizer();
             ic.threeDPrintCls.setThichknessFor3Dprint();
             ic.drawCls.draw();
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
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "input", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "keyup", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "paste", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "cut", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
    //    },
    //    clickApplypick_stabilizer_rm: function() {
        me.myEventCls.onIds("#" + me.pre + "applypick_stabilizer_rm", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             ic.pickpair = false;
             me.htmlCls.clickMenuCls.setLogCmd('remove one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
             var rmLineArray = [];
             rmLineArray.push(ic.pAtom.serial);
             rmLineArray.push(ic.pAtom2.serial);
             ic.threeDPrintCls.removeOneStabilizer(rmLineArray);
             //ic.updateStabilizer();
             ic.drawCls.draw();
           }
        });
    //    },
    //    clickApplypick_measuredistance: function() {
        me.myEventCls.onIds("#" + me.pre + "applypick_measuredistance", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.bMeasureDistance = false;
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             var size = 0, background = 0;
             var color = $("#" + me.pre + "linecolor" ).val();
             var x =(ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
             var y =(ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
             var z =(ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
             ic.analysisCls.addLineFromPicking('distance');
             var distance = parseInt(ic.pAtom.coord.distanceTo(ic.pAtom2.coord) * 10) / 10;
             var text = distance.toString() + " A";
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'distance');
             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             me.htmlCls.clickMenuCls.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type distance', true);
             ic.drawCls.draw();
             ic.pk = 2;
           }
        });
    //    },

        me.myEventCls.onIds("#" + me.pre + "applydist2", "click", function(e) { var ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.bMeasureDistance = false;

           var nameArray = $("#" + me.pre + "atomsCustomDist").val();
           var nameArray2 = $("#" + me.pre + "atomsCustomDist2").val();

           ic.analysisCls.measureDistTwoSets(nameArray, nameArray2);
           me.htmlCls.clickMenuCls.setLogCmd("dist | " + nameArray2 + " " + nameArray, true);
        });

    //    clickApply_thickness: function() {
        me.myEventCls.onIds("#" + me.pre + "apply_thickness_3dprint", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("3dprint");
        });
        me.myEventCls.onIds("#" + me.pre + "apply_thickness_style", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("style");
        });

        me.myEventCls.onIds("#" + me.pre + "reset_thickness_3dprint", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("3dprint", true);
        });
        me.myEventCls.onIds("#" + me.pre + "reset_thickness_style", "click", function(e) { var ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("style", true);
        });

    //    },
    //    clickReset: function() {
        me.myEventCls.onIds("#" + me.pre + "reset", "click", function(e) { var ic = me.icn3d;
            ic.selectionCls.resetAll();

            // need to render
            if(ic.bRender) ic.drawCls.draw(); //ic.drawCls.render();
        });
    //    },
    //    clickToggleHighlight: function() {
        me.myEventCls.onIds(["#" + me.pre + "toggleHighlight", "#" + me.pre + "toggleHighlight2"], "click", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.toggleHighlight();
            me.htmlCls.clickMenuCls.setLogCmd("toggle highlight", true);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_clearselection", "click", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            ic.hlUpdateCls.clearHighlight();
            me.htmlCls.clickMenuCls.setLogCmd("clear selection", true);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_clearselection2", "click", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            e.preventDefault();
            ic.hlUpdateCls.clearHighlight();
            me.htmlCls.clickMenuCls.setLogCmd("clear selection", true);
        });
        me.myEventCls.onIds("#" + me.pre + "alignseq_clearselection", "click", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.clearHighlight();
            me.htmlCls.clickMenuCls.setLogCmd("clear selection", true);
        });
    //    },
    //    clickReplay: function() {
        me.myEventCls.onIds("#" + me.pre + "replay", "click", function(e) { var ic = me.icn3d;
             e.stopImmediatePropagation();
             ic.CURRENTNUMBER++;
             var currentNumber =(me.cfg.replay) ? ic.STATENUMBER : ic.STATENUMBER - 1;

             if(ic.CURRENTNUMBER == currentNumber) {
                  ic.bReplay = 0;
                  $("#" + me.pre + "replay").hide();
             }
             else if(ic.commands.length > 0 && ic.commands[ic.CURRENTNUMBER]) {
                  ic.loadScriptCls.execCommandsBase(ic.CURRENTNUMBER, ic.CURRENTNUMBER, ic.STATENUMBER);
                  var pos = ic.commands[ic.CURRENTNUMBER].indexOf('|||');
                  var cmdStrOri =(pos != -1) ? ic.commands[ic.CURRENTNUMBER].substr(0, pos) : ic.commands[ic.CURRENTNUMBER];
                  var maxLen = 30;
                  var cmdStr =(cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;
                  var menuStr = ic.applyCommandCls.getMenuFromCmd(cmdStr);
                  $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
                  $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);
                  ic.drawCls.draw();
             }
        });
    //    },

        ic.loadScriptCls.pressCommandtext();

    //    clickSeqSaveSelection: function() {
        me.myEventCls.onIds("#" + me.pre + "seq_saveselection", "click", function(e) { var ic = me.icn3d;
           e.stopImmediatePropagation();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.selectionCls.saveSelectionPrep();
           var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc").val();
           ic.selectionCls.saveSelection(name, name);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_saveselection2", "click", function(e) { var ic = me.icn3d;
           e.stopImmediatePropagation();
           ic.selectionCls.saveSelectionPrep();
           var name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc2").val();
           ic.selectionCls.saveSelection(name, name);
        });
    //    },
    //    clickAlignSeqSaveSelection: function() {
        me.myEventCls.onIds("#" + me.pre + "alignseq_saveselection", "click", function(e) { var ic = me.icn3d;
           e.stopImmediatePropagation();
           ic.selectionCls.saveSelectionPrep();
           var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "alignseq_command_desc").val();
           ic.selectionCls.saveSelection(name, name);
        });
    //    },
    //    clickOutputSelection: function() {
        $(document).on("click", "." + me.pre + "outputselection", function(e) { var ic = me.icn3d;
              e.stopImmediatePropagation();
            ic.bSelectResidue = false;
            ic.bSelectAlignResidue = false;
            me.htmlCls.clickMenuCls.setLogCmd('output selection', true);
            ic.threeDPrintCls.outputSelection();
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
           var idStr =(idArray.length > 2) ? idArray[2] : id;
           var structureStr = Object.keys(ic.structures)[0];
           if(Object.keys(ic.structures).length > 1) structureStr += '-' + Object.keys(ic.structures)[1];
           ic.saveFileCls.saveFile(structureStr + '-' + idStr + '.html', 'html', encodeURIComponent(html));
        });
    //    },
    //    clickHideDialog: function() {
        $(document).on("click", ".icn3d-hideicon", function(e) { var ic = me.icn3d;
           e.stopImmediatePropagation();
           var id = $(this).attr('pid');
           if(!me.cfg.notebook) {
               if(ic.dialogHashHideDone === undefined) ic.dialogHashHideDone = {}
               if(ic.dialogHashPosToRight === undefined) ic.dialogHashPosToRight = {}
               if(!ic.dialogHashHideDone.hasOwnProperty(id)) {
                   ic.dialogHashHideDone[id] = {"width": $("#" + id).dialog( "option", "width"), "height": $("#" + id).dialog( "option", "height"), "position": $("#" + id).dialog( "option", "position")}
                   var dialogWidth = 160;
                   var dialogHeight = 80;
                   $("#" + id).dialog( "option", "width", dialogWidth );
                   $("#" + id).dialog( "option", "height", dialogHeight );
                   var posToRight;
                   if(ic.dialogHashPosToRight.hasOwnProperty(id)) {
                       posToRight = ic.dialogHashPosToRight[id];
                   }
                   else {
                       posToRight = Object.keys(ic.dialogHashPosToRight).length *(dialogWidth + 10);
                       ic.dialogHashPosToRight[id] = posToRight;
                   }
                   var position ={ my: "right bottom", at: "right-" + posToRight + " bottom+60", of: "#" + ic.divid, collision: "none" }
                   $("#" + id).dialog( "option", "position", position );
               }
               else {
                   var width = ic.dialogHashHideDone[id].width;
                   var height = ic.dialogHashHideDone[id].height;
                   var position = ic.dialogHashHideDone[id].position;
                   $("#" + id).dialog( "option", "width", width );
                   $("#" + id).dialog( "option", "height", height );
                   $("#" + id).dialog( "option", "position", position );
                   delete ic.dialogHashHideDone[id];
               }
           }
        });
    //    },
    //    clickResidueOnInteraction: function() {
        // highlight a pair residues
        $(document).on("click", "." + me.pre + "selres", function(e) { var ic = me.icn3d;
              e.stopImmediatePropagation();
              ic.bSelOneRes = false;
              var elems = $( "." + me.pre + "seloneres" );
              for(var i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }
              var idArray = $(this).attr('resid').split('|');
              ic.hAtoms = {}
              ic.selectedResidues = {}
              var cmd = 'select ';
              for(var i = 0, il = idArray.length; i < il; ++i) {
                  var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40
                  if(i > 0) cmd += ' or ';
                  cmd += ic.selectionCls.selectOneResid(idStr);
              }
              ic.hlUpdateCls.updateHlAll();
              me.htmlCls.clickMenuCls.setLogCmd(cmd, true);
        });
        // highlight a residue
        $(document).on("click", "." + me.pre + "seloneres", function(e) { var ic = me.icn3d;
              e.stopImmediatePropagation();
              if(!ic.bSelOneRes) {
                  ic.hAtoms = {}
                  ic.selectedResidues = {}
                  ic.bSelOneRes = true;
              }
              var resid = $(this).attr('resid');
              var id = $(this).attr('id');
              if($("#" + id).length && $("#" + id)[0].checked) { // checked
                  ic.selectionCls.selectOneResid(resid);
              }
              else if($("#" + id).length && !$("#" + id)[0].checked) { // unchecked
                  ic.selectionCls.selectOneResid(resid, true);
              }
              ic.hlUpdateCls.updateHlAll();
        });
        // highlight a set of residues
        $(document).on("click", "." + me.pre + "selset", function(e) { var ic = me.icn3d;
              e.stopImmediatePropagation();
              ic.bSelOneRes = false;
              var elems = $( "." + me.pre + "seloneres" );
              for(var i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }
              var cmd = $(this).attr('cmd');
              ic.selByCommCls.selectByCommand(cmd, '', '');
              ic.hlObjectsCls.removeHlObjects();  // render() is called
              ic.hlObjectsCls.addHlObjects();  // render() is called
              me.htmlCls.clickMenuCls.setLogCmd(cmd, true);
        });
    //    },

    //    clickAddTrack: function() {
        $(document).on("click", ".icn3d-addtrack", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          $("#" + me.pre + "anno_custom")[0].checked = true;
          $("[id^=" + me.pre + "custom]").show();
          //e.preventDefault();
          var chainid = $(this).attr('chainid');
          $("#" + me.pre + "track_chainid").val(chainid);
          me.htmlCls.dialogCls.openDlg('dl_addtrack', 'Add track for Chain: ' + chainid);
          $( "#" + me.pre + "track_gi" ).focus();
        });
    //    },
    //    clickCustomColor: function() {
        $(document).on("click", ".icn3d-customcolor", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          var chainid = $(this).attr('chainid');
          $("#" + me.pre + "customcolor_chainid").val(chainid);
          me.htmlCls.dialogCls.openDlg('dl_customcolor', 'Apply custom color or tube for Chain: ' + chainid);
        });
    //    },
    //    clickDefineHelix: function() {
        $(document).on("click", ".icn3d-helixsets", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          var chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'helix');
          me.htmlCls.clickMenuCls.setLogCmd('define helix sets | chain ' + chainid, true);
        });
    //    },
    //    clickDefineSheet: function() {
        $(document).on("click", ".icn3d-sheetsets", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          var chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'sheet');
          me.htmlCls.clickMenuCls.setLogCmd('define sheet sets | chain ' + chainid, true);
        });
    //    },
    //    clickDefineCoil: function() {
        $(document).on("click", ".icn3d-coilsets", function(e) { var ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          var chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'coil');
          me.htmlCls.clickMenuCls.setLogCmd('define coil sets | chain ' + chainid, true);
        });
    //    },
    //    clickDeleteSets: function() {
        me.myEventCls.onIds("#" + me.pre + "deletesets", "click", function(e) { var ic = me.icn3d;
             ic.definedSetsCls.deleteSelectedSets();
             me.htmlCls.clickMenuCls.setLogCmd("delete selected sets", true);
        });
    //    },
    //    bindMouseup: function() {
        $(document).on('mouseup touchend', "accordion", function(e) { var ic = me.icn3d;
          if(ic.bControlGl && !ic.icn3dui.bNode) {
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
       $(document).on('mousedown touchstart', "accordion", function(e) { var ic = me.icn3d;
          if(ic.bControlGl && !ic.icn3dui.bNode) {
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
        window.onscroll = function(e) { var ic = me.icn3d;
            if(ic.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
                // show fixed titles
                ic.annotationCls.showFixedTitle();
            }
            else {
                // remove fixed titles
                ic.annotationCls.hideFixedTitle();
            }
        } ;
        me.myEventCls.onIds( "#" + me.pre + "dl_selectannotations", "scroll", function() {
            if(ic.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
                // show fixed titles
                ic.annotationCls.showFixedTitle();
            }
            else {
                // remove fixed titles
                ic.annotationCls.hideFixedTitle();
            }
        });
    //    },

        me.myEventCls.onIds("#" + me.pre + "mn6_themeBlue", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('blue');
           me.htmlCls.clickMenuCls.setLogCmd("set theme blue", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_themeOrange", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('orange');
           me.htmlCls.clickMenuCls.setLogCmd("set theme orange", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_themeBlack", "click", function(e) { var ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('black');
           me.htmlCls.clickMenuCls.setLogCmd("set theme black", true);
        });

/*
        me.myEventCls.onIds("#" + me.pre + "mn6_doublecolorYes", "click", function(e) { var ic = me.icn3d;
           ic.bDoublecolor = true;
           ic.setOptionCls.setStyle('proteins', 'ribbon');
           //ic.drawCls.draw();
           me.htmlCls.clickMenuCls.setLogCmd("set double color on", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_doublecolorNo", "click", function(e) { var ic = me.icn3d;
           ic.bDoublecolor = false;
           ic.drawCls.draw();
           me.htmlCls.clickMenuCls.setLogCmd("set double color off", true);
        });
*/

        $(document).on("click", "." + me.pre + "snpin3d", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();

            var snp = $(this).attr('snp');

            ic.scapCls.retrieveScap(snp);
            me.htmlCls.clickMenuCls.setLogCmd('scap 3d ' + snp, true);
            me.htmlCls.clickMenuCls.setLogCmd("select displayed set", true);
        });

        $(document).on("click", "." + me.pre + "snpinter", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();

            var snp = $(this).attr('snp');

            var bInteraction = true;
            ic.scapCls.retrieveScap(snp, bInteraction);
            me.htmlCls.clickMenuCls.setLogCmd('scap interaction ' + snp, true);

            var idArray = snp.split('_'); //stru_chain_resi_snp
            var select = '.' + idArray[1] + ':' + idArray[2];
            var name = 'snp_' + idArray[1] + '_' + idArray[2];
            me.htmlCls.clickMenuCls.setLogCmd("select " + select + " | name " + name, true);
            me.htmlCls.clickMenuCls.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);
            me.htmlCls.clickMenuCls.setLogCmd("adjust dialog dl_linegraph", true);
            me.htmlCls.clickMenuCls.setLogCmd("select displayed set", true);
        });

        $(document).on("click", "." + me.pre + "snppdb", function(e) { var ic = me.icn3d;
            e.stopImmediatePropagation();

            var snp = $(this).attr('snp');

            var bPdb = true;
            ic.scapCls.retrieveScap(snp, undefined, bPdb);
            me.htmlCls.clickMenuCls.setLogCmd('scap pdb ' + snp, true);
        });

    }

}

export {Events}
