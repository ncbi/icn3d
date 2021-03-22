/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu2 = function() { var me = this, ic = me.icn3d; "use strict";
// mn 2
//    clkMn2_selectannotations: function() {
    $("#" + me.pre + "mn6_selectannotations").click(function(e) { var ic = me.icn3d;
       me.showAnnotations();
       me.setLogCmd("view annotations", true);
       //me.setLogCmd("window annotations", true);
    });
//    },
//    clkMn2_selectall: function() {
    $("#" + me.pre + "mn2_selectall").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select all", true);
       me.selectAll();
       me.removeHlAll();
       ic.draw();
    });
    $("#" + me.pre + "clearall").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("clear all", true);
       me.bSelectResidue = false;
       me.selectAll();
       me.removeHlAll();
       ic.draw();
    });
//    },
//    clkMn2_selectdisplayed: function() {
    $("#" + me.pre + "mn2_selectdisplayed").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select displayed set", true);
       ic.hAtoms = ic.cloneHash(ic.dAtoms);
       me.updateHlAll();
       //ic.draw();
    });
//    },
//    clkMn2_fullstru: function() {
    $("#" + me.pre + "mn2_fullstru").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("show all", true);
       me.showAll();
    });
//    },
//    clkMn2_selectcomplement: function() {
    $("#" + me.pre + "mn2_selectcomplement").click(function(e) { var ic = me.icn3d;
       if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
           me.setLogCmd("select complement", true);
           me.selectComplement();
       }
    });
//    },
//    clkMn2_selectmainchains: function() {
    $("#" + me.pre + "mn2_selectmainchains").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select main chains", true);
       me.selectMainChains();
    });
//    },
//    clkMn2_selectsidechains: function() {
    $("#" + me.pre + "mn2_selectsidechains").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select side chains", true);
       me.selectSideChains();
    });
//    },
//    clkMn2_selectmainsidechains: function() {
    $("#" + me.pre + "mn2_selectmainsidechains").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select main side chains", true);
       me.selectMainSideChains();
    });
//    },
//    clkMn2_propperty: function() {
    $("#" + me.pre + "mn2_propPos").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select prop positive", true);
       me.selectProperty('positive');
    });
    $("#" + me.pre + "mn2_propNeg").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select prop negative", true);
       me.selectProperty('negative');
    });
    $("#" + me.pre + "mn2_propHydro").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select prop hydrophobic", true);
       me.selectProperty('hydrophobic');
    });
    $("#" + me.pre + "mn2_propPolar").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("select prop polar", true);
       me.selectProperty('polar');
    });
    $("#" + me.pre + "mn2_propBfactor").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_propbybfactor', 'Select residue based on B-factor');
    });
    $("#" + me.pre + "mn2_propSolAcc").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_propbypercentout', 'Select residue based on the percentage of solvent accessilbe surface area');
    });
    $("#" + me.pre + "applypropbybfactor").click(function(e) { var ic = me.icn3d;
       var from = $("#" + me.pre + "minbfactor").val();
       var to = $("#" + me.pre + "maxbfactor").val();
       me.setLogCmd("select prop b factor | " + from + '_' + to, true);
       me.selectProperty('b factor', from, to);
    });
    $("#" + me.pre + "applypropbypercentout").click(function(e) { var ic = me.icn3d;
       var from = $("#" + me.pre + "minpercentout").val();
       var to = $("#" + me.pre + "maxpercentout").val();
       me.setLogCmd("select prop percent out | " + from + '_' + to, true);
       me.selectProperty('percent out', from, to);
    });
//    },
//    clkMn2_alignment: function() {
    $("#" + me.pre + "mn2_alignment").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_alignment', 'Select residues in aligned sequences');
       me.setLogCmd("window aligned sequences", true);
    });
//    },
//    clkMn2_windows: function() {
    $("#" + me.pre + "mn1_window_table").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_allinteraction', 'Show interactions');
       me.setLogCmd("window interaction table", true);
    });
    $("#" + me.pre + "mn1_window_linegraph").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
       me.setLogCmd("window interaction graph", true);
    });
    $("#" + me.pre + "mn1_window_scatterplot").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_scatterplot', 'Show interactions as map');
       me.setLogCmd("window interaction scatterplot", true);
    });
    $("#" + me.pre + "mn1_window_graph").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_graph', 'Force-directed graph');
       me.setLogCmd("window force-directed graph", true);
    });
//    },
//    clkMn6_yournote: function() {
    $("#" + me.pre + "mn6_yournote").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_yournote', 'Your note about the current display');
    });
//    },
//    clkApplyYournote: function() {
    $("#" + me.pre + "applyyournote").click(function(e) { var ic = me.icn3d;
       me.yournote = $("#" + me.pre + "yournote").val();
       document.title = me.yournote;
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setLogCmd('your note | ' + me.yournote, true);
    });
//    },
//    clkMn2_command: function() {
    $("#" + me.pre + "mn2_command").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_advanced2', 'Select by specification');
    });
//    },
//    clkMn2_definedsets: function() {
    $("#" + me.pre + "mn2_definedsets").add("#" + me.pre + "definedsets").add("#" + me.pre + "definedsets2").click(function(e) { var ic = me.icn3d;
       me.showSets();
       me.setLogCmd('defined sets', true);
       //me.setLogCmd('window defined sets', true);
    });
    $("#" + me.pre + "setOr").click(function(e) { var ic = me.icn3d;
       me.setOperation = 'or';
    });
    $("#" + me.pre + "setAnd").click(function(e) { var ic = me.icn3d;
       me.setOperation = 'and';
    });
    $("#" + me.pre + "setNot").click(function(e) { var ic = me.icn3d;
       me.setOperation = 'not';
    });
//    },
//    clkMn2_pkNo: function() {
    $("#" + me.pre + "mn2_pkNo").click(function(e) { var ic = me.icn3d;
       ic.pk = 0;
       ic.opts['pk'] = 'no';
       me.setLogCmd('set pk off', true);
       ic.draw();
       ic.removeHlObjects();
    });
//    },
//    clkMn2_pkYes: function() {
    $("#" + me.pre + "mn2_pkYes").click(function(e) { var ic = me.icn3d;
       ic.pk = 1;
       ic.opts['pk'] = 'atom';
       me.setLogCmd('set pk atom', true);
    });
//    },
//    clkMn2_pkResidue: function() {
    $("#" + me.pre + "mn2_pkResidue").click(function(e) { var ic = me.icn3d;
       ic.pk = 2;
       ic.opts['pk'] = 'residue';
       me.setLogCmd('set pk residue', true);
    });
//    },
//    clkMn2_pkStrand: function() {
    $("#" + me.pre + "mn2_pkStrand").click(function(e) { var ic = me.icn3d;
       ic.pk = 3;
       ic.opts['pk'] = 'strand';
       me.setLogCmd('set pk strand', true);
    });
//    },
//    clkMn2_pkDomain: function() {
    $("#" + me.pre + "mn2_pkDomain").click(function(e) { var ic = me.icn3d;
       ic.pk = 4;
       ic.opts['pk'] = 'domain';
       me.setLogCmd('set pk domain', true);
    });
//    },
//    clkMn2_pkChain: function() {
    $("#" + me.pre + "mn2_pkChain").click(function(e) { var ic = me.icn3d;
       ic.pk = 5;
       ic.opts['pk'] = 'chain';
       me.setLogCmd('set pk chain', true);
    });
//    },
//    clk_adjustmem: function() {
    $("#" + me.pre + "adjustmem").click(function(e) { var ic = me.icn3d;
        me.openDlg('dl_adjustmem', 'Adjust the Z-axis positions of the membrane');
    });
//    },
//    clk_togglemem: function() {
    $("#" + me.pre + "togglemem").click(function(e) { var ic = me.icn3d;
       me.toggleMembrane();
       me.setLogCmd('toggle membrane', true);
    });
//    },
//    clk_selectplane: function() {
    $("#" + me.pre + "selectplane").click(function(e) { var ic = me.icn3d;
        me.openDlg('dl_selectplane', 'Select a region between two planes');
    });
//    },
//    clkMn2_aroundsphere: function() {
    //$("#" + me.pre + "mn2_aroundsphere").add("#" + me.pre + "mn2_aroundsphere2").click(function(e) { var ic = me.icn3d;
    $("#" + me.pre + "mn2_aroundsphere").click(function(e) { var ic = me.icn3d;
        if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           me.setPredefinedInMenu();
           me.bSetChainsAdvancedMenu = true;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
        }
        var definedAtomsHtml = me.setAtomMenu(['protein']);
        if($("#" + me.pre + "atomsCustomSphere").length) {
            $("#" + me.pre + "atomsCustomSphere").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
        }
        if($("#" + me.pre + "atomsCustomSphere2").length) {
            $("#" + me.pre + "atomsCustomSphere2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
        }
        me.openDlg('dl_aroundsphere', 'Select a sphere around a set of residues');
        me.bSphereCalc = false;
        //me.setLogCmd('set calculate sphere false', true);
        $("#" + me.pre + "atomsCustomSphere").resizable();
        $("#" + me.pre + "atomsCustomSphere2").resizable();
    });
//    },
//    clkMn2_select_chain: function() {
    $("#" + me.pre + "mn2_select_chain").add("#" + me.pre + "definedSets").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_select_chain', 'Select Structure/Chain/Custom Selection');
    });
//    },
};
