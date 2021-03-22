/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu6 = function() { var me = this, ic = me.icn3d; "use strict";
// mn 6
//    clkMn6_assemblyYes: function() {
    $("#" + me.pre + "mn6_assemblyYes").click(function(e) { var ic = me.icn3d;
       ic.bAssembly = true;
       me.setLogCmd('set assembly on', true);
       ic.draw();
    });
//    },
//    clkMn6_assemblyNo: function() {
    $("#" + me.pre + "mn6_assemblyNo").click(function(e) { var ic = me.icn3d;
       ic.bAssembly = false;
       me.setLogCmd('set assembly off', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelAtoms: function() {
    $("#" + me.pre + "mn6_addlabelAtoms").click(function(e) { var ic = me.icn3d;
       ic.addAtomLabels(ic.hAtoms);
       me.saveSelectionIfSelected();
       me.setLogCmd('add atom labels', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelResidues: function() {
    $("#" + me.pre + "mn6_addlabelResidues").click(function(e) { var ic = me.icn3d;
       ic.addResiudeLabels(ic.hAtoms);
       me.saveSelectionIfSelected();
       me.setLogCmd('add residue labels', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelResnum: function() {
    $("#" + me.pre + "mn6_addlabelResnum").click(function(e) { var ic = me.icn3d;
       ic.addResiudeLabels(ic.hAtoms, undefined, undefined, true);
       me.saveSelectionIfSelected();
       me.setLogCmd('add residue number labels', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelChains: function() {
    $("#" + me.pre + "mn6_addlabelChains").click(function(e) { var ic = me.icn3d;
       me.addChainLabels(ic.hAtoms);
       me.saveSelectionIfSelected();
       me.setLogCmd('add chain labels', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelTermini: function() {
    $("#" + me.pre + "mn6_addlabelTermini").click(function(e) { var ic = me.icn3d;
       me.addTerminiLabels(ic.hAtoms);
       me.saveSelectionIfSelected();
       me.setLogCmd('add terminal labels', true);
       ic.draw();
    });
//    },
//    clkMn6_addlabelYes: function() {
    $("#" + me.pre + "mn6_addlabelYes").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_addlabel', 'Add custom labels by selection');
       ic.pk = 1;
       ic.opts['pk'] = 'atom';
       ic.pickpair = true;
       ic.pAtomNum = 0;
    });
//    },
//    clkMn6_addlabelSelection: function() {
    $("#" + me.pre + "mn6_addlabelSelection").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_addlabelselection', 'Add custom labels by the selected');
    });
//    },
//    clkMn2_saveselection: function() {
    $("#" + me.pre + "mn2_saveselection").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_saveselection', 'Save the selected');
    });
//    },
//    clkMn6_addlabelNo: function() {
    $("#" + me.pre + "mn6_addlabelNo").add("#" + me.pre + "removeLabels").click(function(e) { var ic = me.icn3d;
       ic.pickpair = false;
       //ic.labels['residue'] = [];
       //ic.labels['custom'] = [];
       var select = "set labels off";
       me.setLogCmd(select, true);
       for(var name in ic.labels) {
           //if(name === 'residue' || name === 'custom') {
               ic.labels[name] = [];
           //}
       }
       ic.draw();
    });
//    },

    $("." + me.pre + "mn6_labelscale").each(function () {
       var value = $(this).attr('v');

       $(this).click(function(e) { var ic = me.icn3d;
           ic.labelScale = value;
           ic.draw();
           me.setLogCmd('set label scale ' + value, true);
       });
    });

//    clkMn6_distanceYes: function() {
    $("#" + me.pre + "mn6_distanceYes").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_distance', 'Measure the distance of atoms');
       ic.pk = 1;
       ic.opts['pk'] = 'atom';
       ic.pickpair = true;
       ic.pAtomNum = 0;
       me.bMeasureDistance = true;
    });
//    },

    $("#" + me.pre + "mn6_distTwoSets").click(function(e) { var ic = me.icn3d;
        me.openDlg('dl_disttwosets', 'Measure the distance between two sets');

        if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           me.setPredefinedInMenu();
           me.bSetChainsAdvancedMenu = true;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
        }
        var definedAtomsHtml = me.setAtomMenu(['protein']);
        if($("#" + me.pre + "atomsCustomDist").length) {
            $("#" + me.pre + "atomsCustomDist").html("  <option value='selected'>selected</option>" + definedAtomsHtml);
        }
        if($("#" + me.pre + "atomsCustomDist2").length) {
            $("#" + me.pre + "atomsCustomDist2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
        }

       $("#" + me.pre + "atomsCustomDist").resizable();
       $("#" + me.pre + "atomsCustomDist2").resizable();

       me.bMeasureDistance = true;
    });

//    clkMn6_distanceNo: function() {
    $("#" + me.pre + "mn6_distanceNo").click(function(e) { var ic = me.icn3d;
       ic.pickpair = false;
       var select = "set lines off";
       me.setLogCmd(select, true);
       ic.labels['distance'] = [];
       ic.lines['distance'] = [];
       ic.pk = 2;
       ic.draw();
    });
//    },
//    clkMn2_selectedcenter: function() {
    $("#" + me.pre + "mn2_selectedcenter").add("#" + me.pre + "zoomin_selection").click(function(e) { var ic = me.icn3d;
       //me.setLogCmd('zoom selection', true);
       ic.zoominSelection();
       ic.draw();
       me.setLogCmd('zoom selection', true);
    });
//    },
//    clkMn6_center: function() {
    $("#" + me.pre + "mn6_center").click(function(e) { var ic = me.icn3d;
       //me.setLogCmd('center selection', true);
       ic.centerSelection();
       ic.draw();
       me.setLogCmd('center selection', true);
    });
//    },
//    clkMn6_resetOrientation: function() {
    $("#" + me.pre + "mn6_resetOrientation").add("#" + me.pre + "resetOrientation").click(function(e) { var ic = me.icn3d;
       //me.setLogCmd('reset orientation', true);
       ic.resetOrientation();
       //ic.applyOriginalColor();
       ic.draw();
       me.setLogCmd('reset orientation', true);
    });
//    },
//    clkMn6_chemicalbindingshow: function() {
    $("#" + me.pre + "mn6_chemicalbindingshow").add("#" + me.pre + "chemicalbindingshow").click(function(e) { var ic = me.icn3d;
       me.setOption('chemicalbinding', 'show');
       me.setLogCmd('set chemicalbinding show', true);
    });
//    },
//    clkMn6_chemicalbindinghide: function() {
    $("#" + me.pre + "mn6_chemicalbindinghide").add("#" + me.pre + "chemicalbindinghide").click(function(e) { var ic = me.icn3d;
       me.setOption('chemicalbinding', 'hide');
       me.setLogCmd('set chemicalbinding hide', true);
    });
//    },
//    clkMn6_sidebyside: function() {
    $("#" + me.pre + "mn6_sidebyside").click(function(e) { var ic = me.icn3d;
       var bSidebyside = true;
       var url = me.shareLinkUrl(undefined);
       if(url.indexOf('http') !== 0) {
           alert("The url is more than 4000 characters and may not work.");
       }
       else {
           url = url.replace("full.html", "full2.html");
           window.open(url, '_blank');
           me.setLogCmd('side by side | ' + url, true);
       }
    });
//    },

    $("." + me.pre + "mn6_rotate").each(function () {
       var value = $(this).attr('v').toLowerCase();
       var direction = value.split(' ')[1];

       $(this).click(function(e) { var ic = me.icn3d;
           me.setLogCmd(value, true);
           ic.bStopRotate = false;
           ic.rotateCount = 0;
           ic.rotateCountMax = 6000;
           me.ROT_DIR = direction;
           me.rotStruc(direction);
       });
    });

    $("." + me.pre + "mn6_rotate90").each(function () {
       var value = $(this).attr('v').toLowerCase();
       var direction = value.split('-')[0];

       $(this).click(function(e) { var ic = me.icn3d;
          me.setLogCmd(value, true);
          var axis;
          if(direction == 'x') {
              axis = new THREE.Vector3(1,0,0);
          }
          else if(direction == 'y') {
              axis = new THREE.Vector3(0,1,0);
          }
          else if(direction == 'z') {
              axis = new THREE.Vector3(0,0,1);
          }
          var angle = 0.5 * Math.PI;
          ic.setRotation(axis, angle);
       });
    });


//    clkMn6_cameraPers: function() {
    $("#" + me.pre + "mn6_cameraPers").click(function(e) { var ic = me.icn3d;
       me.setOption('camera', 'perspective');
       me.setLogCmd('set camera perspective', true);
    });
//    },
//    clkMn6_cameraOrth: function() {
    $("#" + me.pre + "mn6_cameraOrth").click(function(e) { var ic = me.icn3d;
       me.setOption('camera', 'orthographic');
       me.setLogCmd('set camera orthographic', true);
    });
//    },
//    clkMn6_bkgdBlack: function() {
    $("#" + me.pre + "mn6_bkgdBlack").click(function(e) { var ic = me.icn3d;
       me.setBackground('black');
    });
//    },
//    clkMn6_bkgdGrey: function() {
    $("#" + me.pre + "mn6_bkgdGrey").click(function(e) { var ic = me.icn3d;
       me.setBackground('grey');
    });
//    },
//    clkMn6_bkgdWhite: function() {
    $("#" + me.pre + "mn6_bkgdWhite").click(function(e) { var ic = me.icn3d;
       me.setBackground('white');
    });
//    },
//    clkMn6_bkgdTransparent: function() {
    $("#" + me.pre + "mn6_bkgdTransparent").click(function(e) { var ic = me.icn3d;
       me.setBackground('transparent');
    });
//    },
//    clkMn6_showfogYes: function() {
    $("#" + me.pre + "mn6_showfogYes").click(function(e) { var ic = me.icn3d;
       //me.setOption('fog', 'yes');
       ic.opts['fog'] = 'yes';
       ic.setFog(true);
       ic.draw();
       me.setLogCmd('set fog on', true);
    });
//    },
//    clkMn6_showfogNo: function() {
    $("#" + me.pre + "mn6_showfogNo").click(function(e) { var ic = me.icn3d;
       //me.setOption('fog', 'no');
       ic.opts['fog'] = 'no';
       ic.setFog(true);
       ic.draw();
       me.setLogCmd('set fog off', true);
    });
//    },
//    clkMn6_showslabYes: function() {
    $("#" + me.pre + "mn6_showslabYes").click(function(e) { var ic = me.icn3d;
       me.setOption('slab', 'yes');
       me.setLogCmd('set slab on', true);
    });
//    },
//    clkMn6_showslabNo: function() {
    $("#" + me.pre + "mn6_showslabNo").click(function(e) { var ic = me.icn3d;
       me.setOption('slab', 'no');
       me.setLogCmd('set slab off', true);
    });
//    },
//    clkMn6_showaxisYes: function() {
    $("#" + me.pre + "mn6_showaxisYes").click(function(e) { var ic = me.icn3d;
       me.setOption('axis', 'yes');
       me.setLogCmd('set axis on', true);
    });

    $("#" + me.pre + "mn6_showaxisSel").click(function(e) { var ic = me.icn3d;
       ic.pc1 = true;

       ic.setPc1Axes();
       me.setLogCmd('set pc1 axis', true);
    });

//    },
//    clkMn6_showaxisNo: function() {
    $("#" + me.pre + "mn6_showaxisNo").click(function(e) { var ic = me.icn3d;
       ic.pc1 = false;
       ic.axes = [];

       me.setOption('axis', 'no');

       me.setLogCmd('set axis off', true);
    });
//    },
//    clkMn6_symmetry: function() {
    $("#" + me.pre + "mn6_symmetry").click(function(e) { var ic = me.icn3d;
       me.retrieveSymmetry(Object.keys(ic.structures)[0]);
       //me.openDlg('dl_symmetry', 'Symmetry');
    });

    $("#" + me.pre + "mn6_symd").click(function(e) { var ic = me.icn3d;
       me.retrieveSymd();
       me.bSymd = true;
       //me.openDlg('dl_symmetry', 'Symmetry');

       //var title = $("#" + me.pre + "selectSymd" ).val();
       //me.setLogCmd('symd symmetry ' + title, true);
       me.setLogCmd('symd symmetry', true);
    });
    $("#" + me.pre + "mn6_clear_sym").click(function(e) { var ic = me.icn3d;
       ic.symdArray = [];
       ic.draw();
       me.setLogCmd('clear symd symmetry', true);
    });

//    },
//    clkMn6_area: function() {
    $("#" + me.pre + "mn6_area").click(function(e) { var ic = me.icn3d;
        me.calculateArea();
        me.setLogCmd('area', true);
    });
//    },
//    clkMn6_applysymmetry: function() {
    $("#" + me.pre + "applysymmetry").click(function(e) { var ic = me.icn3d;
       var title = $("#" + me.pre + "selectSymmetry" ).val();
       ic.symmetrytitle = (title === 'none') ? undefined : title;
       //if(title !== 'none') ic.applySymmetry(title);
       ic.draw();
       me.setLogCmd('symmetry ' + title, true);
    });
    $("#" + me.pre + "clearsymmetry").click(function(e) { var ic = me.icn3d;
       var title = 'none';
       ic.symmetrytitle = undefined;
       ic.draw();
       me.setLogCmd('symmetry ' + title, true);
    });

/*
    $("#" + me.pre + "applysymd").click(function(e) { var ic = me.icn3d;
       var title = $("#" + me.pre + "selectSymd" ).val();
       ic.symdtitle = (title === 'none') ? undefined : title;
       ic.draw();
       me.setLogCmd('symd symmetry ' + title, true);
    });
    $("#" + me.pre + "clearsymd").click(function(e) { var ic = me.icn3d;
       var title = 'none';
       ic.symdtitle = undefined;
       ic.draw();
       me.setLogCmd('symd symmetry ' + title, true);
    });
*/

//    },
//    clkMn6_hbondsYes: function() {
    $("#" + me.pre + "mn6_hbondsYes").add("#" + me.pre + "hbondsYes").click(function(e) { var ic = me.icn3d;
        if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           me.setPredefinedInMenu();
           me.bSetChainsAdvancedMenu = true;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
        }
        var definedAtomsHtml = me.setAtomMenu(['protein']);
        if($("#" + me.pre + "atomsCustomHbond").length) {
            $("#" + me.pre + "atomsCustomHbond").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
        }
        if($("#" + me.pre + "atomsCustomHbond2").length) {
            $("#" + me.pre + "atomsCustomHbond2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
        }
       me.openDlg('dl_hbonds', 'Hydrogen bonds/interactions between two sets of atoms');
       me.bHbondCalc = false;
       //me.setLogCmd('set calculate hbond false', true);
       $("#" + me.pre + "atomsCustomHbond").resizable();
       $("#" + me.pre + "atomsCustomHbond2").resizable();
    });
//    },
//    clkMn6_hbondsNo: function() {
    $("#" + me.pre + "mn6_hbondsNo").click(function(e) { var ic = me.icn3d;
       me.hideHbondsContacts();
       ic.draw();
    });
//    },
//    clkmn1_stabilizerYes: function() {
    $("#" + me.pre + "mn1_stabilizerYes").click(function(e) { var ic = me.icn3d;
       //me.openDlg('dl_stabilizer', 'Hydrogen bonds inside selection');
       var select = "stabilizer";
       me.addStabilizer();
       me.prepareFor3Dprint();
       //ic.draw();
       me.setLogCmd(select, true);
    });
//    },
//    clkmn1_stabilizerNo: function() {
    $("#" + me.pre + "mn1_stabilizerNo").click(function(e) { var ic = me.icn3d;
       var select = "set stabilizer off";
       me.setLogCmd(select, true);
       me.hideStabilizer();
       ic.draw();
    });
//    },
//    clkmn1_stabilizerOne: function() {
    $("#" + me.pre + "mn1_stabilizerOne").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_stabilizer', 'Add One Stabilizer');
       ic.pk = 1;
       ic.opts['pk'] = 'atom';
       ic.pickpair = true;
       ic.pAtomNum = 0;
    });
//    },
//    clkmn1_stabilizerRmOne: function() {
    $("#" + me.pre + "mn1_stabilizerRmOne").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_stabilizer_rm', 'Remove One Stabilizer');
       ic.pk = 1;
       ic.opts['pk'] = 'atom';
       ic.pickpair = true;
       ic.pAtomNum = 0;
    });
//    },
//    clkmn1_thicknessSet: function() {
    $("#" + me.pre + "mn1_thicknessSet").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_thickness', 'Set Thickness for 3D Printing');
    });
//    },
//    clkmn5_setThickness: function() {
    $("#" + me.pre + "mn3_setThickness").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_thickness2', 'Set Thickness');
    });
//    },
//    clkmn1_thicknessReset: function() {
    $("#" + me.pre + "mn1_thicknessReset").click(function(e) { var ic = me.icn3d;
       var select = "reset thickness";
       me.setLogCmd(select, true);
       me.bSetThickness = false;
       me.resetAfter3Dprint();
       ic.draw();
    });
//    },
//    clkMn6_ssbondsYes: function() {
    $("#" + me.pre + "mn6_ssbondsYes").click(function(e) { var ic = me.icn3d;
       var select = "disulfide bonds";
       me.setLogCmd(select, true);
       me.showSsbonds();
    });
//    },
//    clkMn6_ssbondsExport: function() {
    $("#" + me.pre + "mn6_ssbondsExport").click(function(e) { var ic = me.icn3d;
       me.exportSsbondPairs();
       me.setLogCmd("export disulfide bond pairs", false);
    });
//    },
//    clkMn6_ssbondsNo: function() {
    $("#" + me.pre + "mn6_ssbondsNo").click(function(e) { var ic = me.icn3d;
       ic.opts["ssbonds"] = "no";
       var select = "set disulfide bonds off";
       me.setLogCmd(select, true);
       ic.lines['ssbond'] = [];
       me.setStyle('sidec', 'nothing');
    });
//    },
//    clkMn6_clbondsYes: function() {
    $("#" + me.pre + "mn6_clbondsYes").click(function(e) { var ic = me.icn3d;
       var select = "cross linkage";
       me.setLogCmd(select, true);
       //ic.bShowCrossResidueBond = true;
       //me.setStyle('proteins', 'lines')
       me.showClbonds();
    });
//    },
//    clkMn6_clbondsExport: function() {
    $("#" + me.pre + "mn6_clbondsExport").click(function(e) { var ic = me.icn3d;
       me.exportClbondPairs();
       me.setLogCmd("export cross linkage pairs", false);
    });
//    },
//    clkMn6_clbondsNo: function() {
    $("#" + me.pre + "mn6_clbondsNo").click(function(e) { var ic = me.icn3d;
       ic.opts["clbonds"] = "no";
       var select = "set cross linkage off";
       me.setLogCmd(select, true);
       //ic.bShowCrossResidueBond = false;
       //me.setStyle('proteins', 'ribbon')
       ic.lines['clbond'] = [];
       me.setStyle('sidec', 'nothing');
    });
//    },
};
