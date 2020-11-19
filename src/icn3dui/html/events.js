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
       //me.setLogCmd("alternate structures", false);
       ic.bAlternate = true;
       ic.alternateStructures();
       ic.bAlternate = false;
       me.setLogCmd("alternate structures", false);
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
//mn 1
//    clkMn1_mmtfid: function() {
    $("#" + me.pre + "mn1_mmtfid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mmtfid', 'Please input MMTF ID');
    });
//    },
//    clkMn1_pdbid: function() {
    $("#" + me.pre + "mn1_pdbid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_pdbid', 'Please input PDB ID');
    });
//    },
//    clkMn1_opmid: function() {
    $("#" + me.pre + "mn1_opmid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_opmid', 'Please input OPM PDB ID');
    });
//    },
//    clkMn1_align: function() {
    $("#" + me.pre + "mn1_align").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_align', 'Align two 3D structures');
    });
//    },
//    clkMn1_chainalign: function() {
    $("#" + me.pre + "mn1_chainalign").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_chainalign', 'Align two chains of 3D structures');
    });
//    },
//    clkMn1_pdbfile: function() {
    $("#" + me.pre + "mn1_pdbfile").click(function(e) { var ic = me.icn3d;
       me = me.setIcn3dui($(this).attr('id'));
       me.openDlg('dl_pdbfile', 'Please input PDB File');
    });
//    },
//    clkMn1_mol2file: function() {
    $("#" + me.pre + "mn1_mol2file").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mol2file', 'Please input Mol2 File');
    });
//    },
//    clkMn1_sdffile: function() {
    $("#" + me.pre + "mn1_sdffile").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_sdffile', 'Please input SDF File');
    });
//    },
//    clkMn1_xyzfile: function() {
    $("#" + me.pre + "mn1_xyzfile").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_xyzfile', 'Please input XYZ File');
    });
//    },
//    clkMn1_urlfile: function() {
    $("#" + me.pre + "mn1_urlfile").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_urlfile', 'Load data by URL');
    });
//    },
//    clkMn1_fixedversion: function() {
    $("#" + me.pre + "mn1_fixedversion").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_fixedversion', 'Open Share Link URL in the archived version of iCn3D');
    });
    $("#" + me.pre + "reload_fixedversion").click(function(e) { var ic = me.icn3d;
       var url = $("#" + me.pre + "sharelinkurl").val();
       me.setLogCmd("open " + url, false);
       localStorage.setItem('fixedversion', '1');
       window.open(url, '_blank');
    });
//    },
//    clkMn1_mmciffile: function() {
    $("#" + me.pre + "mn1_mmciffile").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mmciffile', 'Please input mmCIF File');
    });
//    },
//    clkMn1_mmcifid: function() {
    $("#" + me.pre + "mn1_mmcifid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mmcifid', 'Please input mmCIF ID');
    });
//    },
//    clkMn1_mmdbid: function() {
    $("#" + me.pre + "mn1_mmdbid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
    });
//    },
//    clkMn1_blast_rep_id: function() {
    $("#" + me.pre + "mn1_blast_rep_id").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_blast_rep_id', 'Align sequence to structure');
    });
//    },
//    clkMn1_gi: function() {
    $("#" + me.pre + "mn1_gi").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_gi', 'Please input protein gi');
    });
//    },
//    clkMn1_cid: function() {
    $("#" + me.pre + "mn1_cid").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_cid', 'Please input PubChem CID');
    });
//    },
//    clkMn1_pngimage: function() {
    $("#" + me.pre + "mn1_pngimage").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_pngimage', 'Please input the PNG image');
    });
//    },
//    clkMn1_state: function() {
    $("#" + me.pre + "mn1_state").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_state', 'Please input the state file');
    });
//    },
//    clkMn1_selection: function() {
    $("#" + me.pre + "mn1_selection").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_selection', 'Please input the selection file');
    });
//    },
//    clkMn1_dsn6: function() {
    $("#" + me.pre + "mn1_dsn6").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_dsn6', 'Please input the DSN6 file to display electron density map');
    });
//    },

    $("#" + me.pre + "mn1_delphi").add("#" + me.pre + "mn1_delphi2").click(function(e) { var ic = me.icn3d;
       ic.loadPhiFrom = 'delphi';
       $("#" + me.pre + "dl_delphi_tabs").tabs();
       me.openDlg('dl_delphi', 'Please set parameters to display DelPhi potential map');
    });

    $("#" + me.pre + "mn1_phi").click(function(e) { var ic = me.icn3d;
       ic.loadPhiFrom = 'phi';
       $("#" + me.pre + "dl_phi_tabs").tabs();
       $("#" + me.pre + "phitab1_tabs").tabs();
       $("#" + me.pre + "phitab2_tabs").tabs();
       me.openDlg('dl_phi', 'Please input local phi or cube file to display DelPhi potential map');
    });
    $("#" + me.pre + "mn1_phiurl").click(function(e) { var ic = me.icn3d;
       ic.loadPhiFrom = 'phiurl';
       $("#" + me.pre + "dl_phiurl_tabs").tabs();
       $("#" + me.pre + "phiurltab1_tabs").tabs();
       $("#" + me.pre + "phiurltab2_tabs").tabs();
       me.openDlg('dl_phiurl', 'Please input URL phi or cube file to display DelPhi potential map');
    });

//    clkMn1_dsn6url: function() {
    $("#" + me.pre + "mn1_dsn6url").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_dsn6url', 'Please input the DSN6 file to display electron density map');
    });
//    },
//    clkMn1_exportState: function() {
    $("#" + me.pre + "mn1_exportState").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export state file", false);
       var file_pref = (me.inputid) ? me.inputid : "custom";

       me.saveFile(file_pref + '_statefile.txt', 'command');
    });
//    },

    $("#" + me.pre + "mn1_exportPdbRes").click(function(e) { var ic = me.icn3d;
       me.exportPdb();

       me.setLogCmd("export pdb", true);
    });

    $("#" + me.pre + "delphipdb")
      .add("#" + me.pre + "phipdb").add("#" + me.pre + "phiurlpdb").click(function(e) { var ic = me.icn3d;
       var  pdbStr = me.getSelectedResiduePDB();

       me.setLogCmd("export PDB of selected residues", false);
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + '_icn3d_residues.pdb', 'text', [pdbStr]);
    });
/*
    $("#" + me.pre + "mn1_exportPdbChain").click(function(e) { var ic = me.icn3d;
       var  pdbStr = me.getSelectedChainPDB();

       me.setLogCmd("export PDB of selected chains", false);
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + '_icn3d_chains.pdb', 'text', [pdbStr]);
    });
*/
    $("#" + me.pre + "delphipqr").add("#" + me.pre + "phipqr").add("#" + me.pre + "phiurlpqr").click(function(e) { var ic = me.icn3d;
       me.exportPqr();
       me.setLogCmd("export pqr", true);
    });

//    clkMn1_exportStl: function() {
    $("#" + me.pre + "mn1_exportStl").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export stl file", false);
       //me.hideStabilizer();
       me.exportStlFile('');
    });
//    },
//    clkMn1_exportVrml: function() {
    $("#" + me.pre + "mn1_exportVrml").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export vrml file", false);
       //me.hideStabilizer();
       me.exportVrmlFile('');
    });
//    },
//    clkMn1_exportStlStab: function() {
    $("#" + me.pre + "mn1_exportStlStab").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export stl stabilizer file", false);
       //ic.bRender = false;
       me.hideStabilizer();
       me.resetAfter3Dprint();
       me.addStabilizer();
       me.exportStlFile('_stab');
    });
//    },
//    clkMn1_exportVrmlStab: function() {
    $("#" + me.pre + "mn1_exportVrmlStab").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export vrml stabilizer file", false);
       //ic.bRender = false;
       me.hideStabilizer();
       me.resetAfter3Dprint();
       me.addStabilizer();
       me.exportVrmlFile('_stab');
    });
//    },
//    clkMn6_exportInteraction: function() {
    $("#" + me.pre + "mn6_exportInteraction").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export interactions", false);
       if(me.cfg.mmdbid !== undefined) me.retrieveInteractionData();
       me.exportInteractions();
    });
//    },
//    clkMn1_exportCanvas: function() {
    $("#" + me.pre + "mn1_exportCanvas").add("#" + me.pre + "saveimage").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export canvas", false);
       //var file_pref = (me.inputid) ? me.inputid : "custom";
       //me.saveFile(file_pref + '_image_icn3d_loadable.png', 'png');
       var bPngHtml = true;
       me.shareLink(bPngHtml);
    });
    $("#" + me.pre + "mn1_exportCanvas2").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export canvas 2", false);
       ic.scaleFactor = 2;
       me.shareLink(true);
    });
    $("#" + me.pre + "mn1_exportCanvas4").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export canvas 4", false);
       ic.scaleFactor = 4;
       me.shareLink(true);
    });
    $("#" + me.pre + "mn1_exportCanvas8").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export canvas 8", false);
       ic.scaleFactor = 8;
       me.shareLink(true);
    });
//    },
//    clkMn1_exportCounts: function() {
    $("#" + me.pre + "mn1_exportCounts").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export counts", false);
       var text = '<html><body><div style="text-align:center"><br><b>Total Count for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';
       text += '<tr><td>' + Object.keys(ic.structures).length + '</td><td>' + Object.keys(ic.chains).length + '</td><td>' + Object.keys(ic.residues).length + '</td><td>' + Object.keys(ic.atoms).length + '</td></tr>';
       text += '</table><br/>';
       text += '<b>Counts by Chain for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure</th><th>Chain</th><th>Residue Count</th><th>Atom Count</th></tr>';
       var chainArray = Object.keys(ic.chains);
       for(var i = 0, il = chainArray.length; i < il; ++i) {
           var chainid = chainArray[i];
           var pos = chainid.indexOf('_');
           var structure = chainid.substr(0, pos);
           var chain = chainid.substr(pos + 1);
           var residueHash = {};
           var atoms = ic.chains[chainid];
           for(var j in atoms) {
               residueHash[ic.atoms[j].resi] = 1;
           }
           text += '<tr><td>' + structure + '</td><td>' + chain + '</td><td>' + Object.keys(residueHash).length + '</td><td>' + Object.keys(ic.chains[chainid]).length + '</td></tr>';
       }
       text += '</table><br/></div></body></html>';
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + '_counts.html', 'html', text);
    });
//    },
//    clkMn1_exportSelections: function() {
    $("#" + me.pre + "mn1_exportSelections").click(function(e) { var ic = me.icn3d;
       me.setLogCmd("export all selections", false);
      if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           me.setPredefinedInMenu();
           me.bSetChainsAdvancedMenu = true;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
      }
       var text = me.exportCustomAtoms();
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + '_selections.txt', 'text', [text]);
    });
//    },
//    clkMn1_sharelink: function() {
    $("#" + me.pre + "mn1_sharelink").click(function(e) { var ic = me.icn3d;
        me.shareLink();
    });
//    },
//    clkMn1_replay: function() {
    $("#" + me.pre + "mn1_replayon").click(function(e) { var ic = me.icn3d;
      me.replayon();
      me.setLogCmd("replay on", true);
    });
    $("#" + me.pre + "mn1_replayoff").click(function(e) { var ic = me.icn3d;
        me.replayoff();
        me.setLogCmd("replay off", true);
    });
//    },
//    clkMn1_link_structure: function() {
    $("#" + me.pre + "mn1_link_structure").click(function(e) { var ic = me.icn3d;
       var url = me.getLinkToStructureSummary(true);
       window.open(url, '_blank');
    });
//    },
//    clkMn1_link_bind: function() {
    $("#" + me.pre + "mn1_link_bind").click(function(e) { var ic = me.icn3d;
       url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + me.inputid;
       me.setLogCmd("link to 3D protein structures bound to CID " + me.inputid + ": " + url, false);
       window.open(url, '_blank');
    });
//    },
//    clkMn1_link_vast: function() {
    $("#" + me.pre + "mn1_link_vast").click(function(e) { var ic = me.icn3d;
       if(me.inputid === undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pccompound?term=" + ic.molTitle;
               me.setLogCmd("link to compounds " + ic.molTitle + ": " + url, false);
       }
       else {
           if(me.cfg.cid !== undefined) {
                   url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_pccompound_3d&from_uid=" + me.inputid;
                   me.setLogCmd("link to compounds with structure similar to CID " + me.inputid + ": " + url, false);
           }
           else {
               var idArray = me.inputid.split('_');
               var url;
               if(idArray.length === 1) {
                   url = me.baseUrl + "vastplus/vastplus.cgi?uid=" + me.inputid;
                   me.setLogCmd("link to structures similar to " + me.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = me.baseUrl + "vastplus/vastplus.cgi?uid=" + idArray[0];
                   me.setLogCmd("link to structures similar to " + idArray[0] + ": " + url, false);
               }
           }
           window.open(url, '_blank');
       }
    });
//    },
//    clkMn1_link_pubmed: function() {
    $("#" + me.pre + "mn1_link_pubmed").click(function(e) { var ic = me.icn3d;
       var url;
       if(me.inputid === undefined) {
           var url;
           url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + ic.molTitle;
           me.setLogCmd("link to literature about " + ic.molTitle + ": " + url, false);
           window.open(url, '_blank');
       }
       else if(me.pmid !== undefined) {
           var idArray = me.pmid.toString().split('_');
           var url;
           if(idArray.length === 1) {
               url = "https://www.ncbi.nlm.nih.gov/pubmed/" + me.pmid;
               me.setLogCmd("link to PubMed ID " + me.pmid + ": " + url, false);
           }
           else if(idArray.length === 2) {
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
               me.setLogCmd("link to PubMed IDs " + idArray[0] + ", " + idArray[1] + ": " + url, false);
           }
           window.open(url, '_blank');
       }
       else if(isNaN(me.inputid)) {
           var idArray = me.inputid.toString().split('_');
           var url;
           if(idArray.length === 1) {
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + me.inputid;
               me.setLogCmd("link to literature about PDB " + me.inputid + ": " + url, false);
           }
           else if(idArray.length === 2) {
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
               me.setLogCmd("link to literature about PDB " + idArray[0] + " OR " + idArray[1] + ": " + url, false);
           }
           window.open(url, '_blank');
       }
       else {
           if(me.cfg.cid !== undefined) {
               alert("No literature information is available for this compound in the SDF file.");
           }
           else {
               alert("No literature information is available for this structure.");
           }
       }
    });
//    },
//    clkMn1_link_protein: function() {
    $("#" + me.pre + "mn1_link_protein").click(function(e) { var ic = me.icn3d;
      //me.setEntrezLinks('protein');
      var structArray = Object.keys(ic.structures);
      var chainArray = Object.keys(ic.chains);
      var text = '';
      for(var i = 0, il = chainArray.length; i < il; ++i) {
          var firstAtom = ic.getFirstCalphaAtomObj(ic.chains[chainArray[i]]);
          if(ic.proteins.hasOwnProperty(firstAtom.serial) && chainArray[i].length == 6) {
              text += chainArray[i] + '[accession] OR ';
          }
      }
      if(text.length > 0) text = text.substr(0, text.length - 4);
      var url = "https://www.ncbi.nlm.nih.gov/protein/?term=" + text;
      me.setLogCmd("link to Entrez protein about PDB " + structArray + ": " + url, false);
      window.open(url, '_blank');
    });
//    },
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
// mn 3
//    clkMn3_proteinsRibbon: function() {
    $("#" + me.pre + "mn3_proteinsRibbon").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'ribbon');
       me.setLogCmd('style proteins ribbon', true);
    });
//    },
//    clkMn3_proteinsStrand: function() {
    $("#" + me.pre + "mn3_proteinsStrand").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'strand');
       me.setLogCmd('style proteins strand', true);
    });
//    },
//    clkMn3_proteinsCylinder: function() {
    $("#" + me.pre + "mn3_proteinsCylinder").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'cylinder and plate');
       me.setLogCmd('style proteins cylinder and plate', true);
    });
//    },
//    clkMn3_proteinsSchematic: function() {
    $("#" + me.pre + "mn3_proteinsSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'schematic');
       me.setLogCmd('style proteins schematic', true);
    });
//    },
//    clkMn3_proteinsCalpha: function() {
    $("#" + me.pre + "mn3_proteinsCalpha").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'c alpha trace');
       me.setLogCmd('style proteins c alpha trace', true);
    });
//    },
//    clkMn3_proteinsBackbone: function() {
    $("#" + me.pre + "mn3_proteinsBackbone").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'backbone');
       me.setLogCmd('style proteins backbone', true);
    });
//    },
//    clkMn3_proteinsBfactor: function() {
    $("#" + me.pre + "mn3_proteinsBfactor").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'b factor tube');
       me.setLogCmd('style proteins b factor tube', true);
    });
//    },
//    clkMn3_proteinsLines: function() {
    $("#" + me.pre + "mn3_proteinsLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'lines');
       me.setLogCmd('style proteins lines', true);
    });
//    },
//    clkMn3_proteinsStick: function() {
    $("#" + me.pre + "mn3_proteinsStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'stick');
       me.setLogCmd('style proteins stick', true);
    });
//    },
//    clkMn3_proteinsBallstick: function() {
    $("#" + me.pre + "mn3_proteinsBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'ball and stick');
       me.setLogCmd('style proteins ball and stick', true);
    });
//    },
//    clkMn3_proteinsSphere: function() {
    $("#" + me.pre + "mn3_proteinsSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'sphere');
       me.setLogCmd('style proteins sphere', true);
    });
//    },
//    clkMn3_proteinsNo: function() {
    $("#" + me.pre + "mn3_proteinsNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'nothing');
       me.setLogCmd('style proteins nothing', true);
    });
//    },
//    clkMn3_sidecLines: function() {
    $("#" + me.pre + "mn3_sidecLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'lines');
       me.setLogCmd('style sidec lines', true);
    });
//    },
//    clkMn3_sidecStick: function() {
    $("#" + me.pre + "mn3_sidecStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'stick');
       me.setLogCmd('style sidec stick', true);
    });
//    },
//    clkMn3_sidecBallstick: function() {
    $("#" + me.pre + "mn3_sidecBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'ball and stick');
       me.setLogCmd('style sidec ball and stick', true);
    });
//    },
//    clkMn3_sidecSphere: function() {
    $("#" + me.pre + "mn3_sidecSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'sphere');
       me.setLogCmd('style sidec sphere', true);
    });
//    },
//    clkMn3_sidecNo: function() {
    $("#" + me.pre + "mn3_sidecNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'nothing');
       me.setLogCmd('style sidec nothing', true);
    });
//    },
//    clkMn3_nuclCartoon: function() {
    $("#" + me.pre + "mn3_nuclCartoon").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'nucleotide cartoon');
       me.setLogCmd('style nucleotides nucleotide cartoon', true);
   });
//    },
//    clkMn3_nuclBackbone: function() {
    $("#" + me.pre + "mn3_nuclBackbone").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'backbone');
       me.setLogCmd('style nucleotides backbone', true);
    });
//    },
//    clkMn3_nuclSchematic: function() {
    $("#" + me.pre + "mn3_nuclSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'schematic');
       me.setLogCmd('style nucleotides schematic', true);
    });
//    },
//    clkMn3_nuclPhos: function() {
    $("#" + me.pre + "mn3_nuclPhos").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'o3 trace');
       me.setLogCmd('style nucleotides o3 trace', true);
    });
//    },
//    clkMn3_nuclLines: function() {
    $("#" + me.pre + "mn3_nuclLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'lines');
       me.setLogCmd('style nucleotides lines', true);
    });
//    },
//    clkMn3_nuclStick: function() {
    $("#" + me.pre + "mn3_nuclStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'stick');
       me.setLogCmd('style nucleotides stick', true);
    });
//    },
//    clkMn3_nuclBallstick: function() {
    $("#" + me.pre + "mn3_nuclBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'ball and stick');
       me.setLogCmd('style nucleotides ball and stick', true);
    });
//    },
//    clkMn3_nuclSphere: function() {
    $("#" + me.pre + "mn3_nuclSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'sphere');
       me.setLogCmd('style nucleotides sphere', true);
    });
//    },
//    clkMn3_nuclNo: function() {
    $("#" + me.pre + "mn3_nuclNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'nothing');
       me.setLogCmd('style nucleotides nothing', true);
    });
//    },
//    clkMn3_ligLines: function() {
    $("#" + me.pre + "mn3_ligLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'lines');
       me.setLogCmd('style chemicals lines', true);
    });
//    },
//    clkMn3_ligStick: function() {
    $("#" + me.pre + "mn3_ligStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'stick');
       me.setLogCmd('style chemicals stick', true);
    });
//    },
//    clkMn3_ligBallstick: function() {
    $("#" + me.pre + "mn3_ligBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'ball and stick');
       me.setLogCmd('style chemicals ball and stick', true);
    });
//    },
//    clkMn3_ligSchematic: function() {
    $("#" + me.pre + "mn3_ligSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'schematic');
       me.setLogCmd('style chemicals schematic', true);
    });
//    },
//    clkMn3_ligSphere: function() {
    $("#" + me.pre + "mn3_ligSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'sphere');
       me.setLogCmd('style chemicals sphere', true);
    });
//    },
//    clkMn3_ligNo: function() {
    $("#" + me.pre + "mn3_ligNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'nothing');
       me.setLogCmd('style chemicals nothing', true);
    });
//    },
//    clkMn3_hydrogensYes: function() {
    $("#" + me.pre + "mn3_hydrogensYes").click(function(e) { var ic = me.icn3d;
       me.showHydrogens();
       ic.draw();
       me.setLogCmd('hydrogens', true);
    });
//    },
//    clkMn3_hydrogensNo: function() {
    $("#" + me.pre + "mn3_hydrogensNo").click(function(e) { var ic = me.icn3d;
       me.hideHydrogens();
       ic.draw();
       me.setLogCmd('set hydrogens off', true);
    });
//    },
//    clkMn3_ionsSphere: function() {
    $("#" + me.pre + "mn3_ionsSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'sphere');
       me.setLogCmd('style ions sphere', true);
    });
//    },
//    clkMn3_ionsDot: function() {
    $("#" + me.pre + "mn3_ionsDot").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'dot');
       me.setLogCmd('style ions dot', true);
    });
//    },
//    clkMn3_ionsNo: function() {
    $("#" + me.pre + "mn3_ionsNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'nothing');
       me.setLogCmd('style ions nothing', true);
    });
//    },
//    clkMn3_waterSphere: function() {
    $("#" + me.pre + "mn3_waterSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'sphere');
       me.setLogCmd('style water sphere', true);
    });
//    },
//    clkMn3_waterDot: function() {
    $("#" + me.pre + "mn3_waterDot").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'dot');
       me.setLogCmd('style water dot', true);
    });
//    },
//    clkMn3_waterNo: function() {
    $("#" + me.pre + "mn3_waterNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'nothing');
       me.setLogCmd('style water nothing', true);
    });
//    },
// mn 4
//    clkMn4_clrSpectrum: function() {
    $("#" + me.pre + "mn4_clrSpectrum").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'spectrum');
       me.setLogCmd('color spectrum', true);
    });
//    },
//    clkMn4_clrChain: function() {
    $("#" + me.pre + "mn4_clrChain").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'chain');
       me.setLogCmd('color chain', true);
    });
//    },
//    clkMn4_clrDomain: function() {
    $("#" + me.pre + "mn4_clrdomain").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'domain');
       me.setLogCmd('color domain', true);
    });
//    },
//    clkMn4_clrSSGreen: function() {
    $("#" + me.pre + "mn4_clrSSGreen").click(function(e) { var ic = me.icn3d;
       ic.sheetcolor = 'green';
       me.setOption('color', 'secondary structure green');
       me.setLogCmd('color secondary structure green', true);
    });
//    },
//    clkMn4_clrSSYellow: function() {
    $("#" + me.pre + "mn4_clrSSYellow").click(function(e) { var ic = me.icn3d;
       ic.sheetcolor = 'yellow';
       me.setOption('color', 'secondary structure yellow');
       me.setLogCmd('color secondary structure yellow', true);
    });
//    },
//    clkMn4_clrSSSpectrum: function() {
    $("#" + me.pre + "mn4_clrSSSpectrum").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'secondary structure spectrum');
       me.setLogCmd('color secondary structure spectrum', true);
    });
//    },
//    clkMn4_clrResidue: function() {
    $("#" + me.pre + "mn4_clrResidue").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'residue');
       me.setLogCmd('color residue', true);
    });
//    },
//    clkMn4_clrResidueCustom: function() {
    $("#" + me.pre + "mn4_clrResidueCustom").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_rescolorfile', 'Please input the file on residue colors');
    });
//    },
//    clkMn4_reloadRescolorfile: function() {
    $("#" + me.pre + "reload_rescolorfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var file = $("#" + me.pre + "rescolorfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStrTmp = e.target.result; // or = reader.result;
           var dataStr = dataStrTmp.replace(/#/g, "");
           ic.customResidueColors = JSON.parse(dataStr);
           for(var res in ic.customResidueColors) {
               ic.customResidueColors[res.toUpperCase()] = ic.thr("#" + ic.customResidueColors[res]);
           }
           me.setOption('color', 'residue custom');
           me.setLogCmd('color residue custom | ' + dataStr, true);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clkMn4_reloadCustomcolorfile: function() {
    $("#" + me.pre + "reload_customcolorfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setCustomFile('color');
    });
    $("#" + me.pre + "reload_customtubefile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setCustomFile('tube');
    });
//    },
//    clkMn4_clrCharge: function() {
    $("#" + me.pre + "mn4_clrCharge").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'charge');
       me.setLogCmd('color charge', true);
    });
//    },
//    clkMn4_clrHydrophobic: function() {
    $("#" + me.pre + "mn4_clrHydrophobic").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'hydrophobic');
       me.setLogCmd('color hydrophobic', true);
    });
//    },
//    clkMn4_clrAtom: function() {
    $("#" + me.pre + "mn4_clrAtom").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'atom');
       me.setLogCmd('color atom', true);
    });
//    },
//    clkMn4_clrBfactor: function() {
    $("#" + me.pre + "mn4_clrBfactor").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'b factor');
       me.setLogCmd('color b factor', true);
    });
//    },
//    clkMn4_clrArea: function() {
    $("#" + me.pre + "mn4_clrArea").click(function(e) { var ic = me.icn3d;
        me.openDlg('dl_colorbyarea', "Color based on residue's solvent accessibility");
    });
    $("#" + me.pre + "applycolorbyarea").click(function(e) { var ic = me.icn3d;
        ic.midpercent = $("#" + me.pre + 'midpercent').val();
        me.setOption('color', 'area');
        me.setLogCmd('color area | ' + ic.midpercent, true);

    });
//    },
//    clkMn4_clrBfactorNorm: function() {
    $("#" + me.pre + "mn4_clrBfactorNorm").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'b factor percentile');
       me.setLogCmd('color b factor percentile', true);
    });
//    },
//    clkMn4_clrIdentity: function() {
    $("#" + me.pre + "mn4_clrIdentity").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'identity');
       me.setLogCmd('color identity', true);
    });
//    },
//    clkMn4_clrConserved: function() {
    $("#" + me.pre + "mn4_clrConserved").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'conservation');
       me.setLogCmd('color conservation', true);
    });
//    },
//    clkMn4_clrCustom: function() {
    $("#" + me.pre + "mn4_clrCustom").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_clr', 'Color picker');
    });
//    },
//    clkMn4_clrOther: function() {
    $(document).on('click', ".icn3d-color-rad-text", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var color = $(this).attr('color');
      me.setOption("color", color);
      me.setLogCmd("color " + color, true);
    });
//    },
//    clkMn4_clrSave: function() {
    $("#" + me.pre + "mn4_clrSave").click(function(e) { var ic = me.icn3d;
       me.saveColor();
       me.setLogCmd('save color', true);
    });
//    },
//    clkMn4_clrApplySave: function() {
    $("#" + me.pre + "mn4_clrApplySave").click(function(e) { var ic = me.icn3d;
       me.applySavedColor();
       me.setLogCmd('apply saved color', true);
    });
//    },
//    clkMn3_styleSave: function() {
    $("#" + me.pre + "mn3_styleSave").click(function(e) { var ic = me.icn3d;
       me.saveStyle();
       me.setLogCmd('save style', true);
    });
//    },
//    clkMn3_styleApplySave: function() {
    $("#" + me.pre + "mn3_styleApplySave").click(function(e) { var ic = me.icn3d;
       me.applySavedStyle();
       me.setLogCmd('apply saved style', true);
    });
//    },
// mn 5
//    clkMn5_neighborsYes: function() {
    $("#" + me.pre + "mn5_neighborsYes").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       ic.removeLastSurface();
       ic.applySurfaceOptions();
       if(ic.bRender) ic.render();
       me.setLogCmd('set surface neighbors on', true);
    });
//    },
//    clkMn5_neighborsNo: function() {
    $("#" + me.pre + "mn5_neighborsNo").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       ic.removeLastSurface();
       ic.applySurfaceOptions();
       if(ic.bRender) ic.render();
       me.setLogCmd('set surface neighbors off', true);
    });
//    },
//    clkMn5_surfaceVDW: function() {
    $("#" + me.pre + "mn5_surfaceVDW").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'Van der Waals surface');
       me.setLogCmd('set surface Van der Waals surface', true);
    });
//    },
//    clkMn5_surfaceSAS: function() {
    $("#" + me.pre + "mn5_surfaceSAS").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'solvent accessible surface');
       me.setLogCmd('set surface solvent accessible surface', true);
    });
//    },
//    clkMn5_surfaceMolecular: function() {
    $("#" + me.pre + "mn5_surfaceMolecular").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'molecular surface');
       me.setLogCmd('set surface molecular surface', true);
    });
//    },
//    clkMn5_surfaceVDWContext: function() {
    $("#" + me.pre + "mn5_surfaceVDWContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'Van der Waals surface with context');
       me.setLogCmd('set surface Van der Waals surface with context', true);
    });
//    },
//    clkMn5_surfaceSASContext: function() {
    $("#" + me.pre + "mn5_surfaceSASContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'solvent accessible surface with context');
       me.setLogCmd('set surface solvent accessible surface with context', true);
    });
//    },
//    clkMn5_surfaceMolecularContext: function() {
    $("#" + me.pre + "mn5_surfaceMolecularContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'molecular surface with context');
       me.setLogCmd('set surface molecular surface with context', true);
    });
//    },
//    clkMn5_surfaceNo: function() {
    $("#" + me.pre + "mn5_surfaceNo").click(function(e) { var ic = me.icn3d;
       me.setOption('surface', 'nothing');
       me.setLogCmd('set surface nothing', true);
    });
//    },

    $("." + me.pre + "mn5_opacity").each(function () {
       var value = $(this).attr('v');

       $(this).click(function(e) { var ic = me.icn3d;
           me.setOption('opacity', value);
           me.setLogCmd('set surface opacity ' + value, true);
       });
    });

//    clkMn5_wireframeYes: function() {
    $("#" + me.pre + "mn5_wireframeYes").click(function(e) { var ic = me.icn3d;
       me.setOption('wireframe', 'yes');
       me.setLogCmd('set surface wireframe on', true);
    });
//    },
//    clkMn5_wireframeNo: function() {
    $("#" + me.pre + "mn5_wireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('wireframe', 'no');
       me.setLogCmd('set surface wireframe off', true);
    });
//    },
//    clkMn5_elecmap2fofc: function() {
    $("#" + me.pre + "mn5_elecmap2fofc").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_elecmap2fofc', '2Fo-Fc Electron Density Map');
    });
//    },
//    clkMn5_elecmapfofc: function() {
    $("#" + me.pre + "mn5_elecmapfofc").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_elecmapfofc', 'Fo-Fc Electron Density Map');
    });
//    },
//    clkMn5_elecmapNo: function() {
    $("#" + me.pre + "mn5_elecmapNo").add("#" + me.pre + "elecmapNo2").add("#" + me.pre + "elecmapNo3").add("#" + me.pre + "elecmapNo4").add("#" + me.pre + "elecmapNo5").click(function(e) { var ic = me.icn3d;
       me.setOption('map', 'nothing');
       me.setLogCmd('setoption map nothing', true);
    });
//    },
    $("#" + me.pre + "delphimapNo").add("#" + me.pre + "phimapNo").add("#" + me.pre + "phiurlmapNo")
      .add("#" + me.pre + "mn1_phimapNo").click(function(e) { var ic = me.icn3d;
       me.setOption('phimap', 'nothing');
       me.setLogCmd('setoption phimap nothing', true);
    });

    $("#" + me.pre + "delphimapNo2").add("#" + me.pre + "phimapNo2").add("#" + me.pre + "phiurlmapNo2")
      .click(function(e) { var ic = me.icn3d;
       //me.setOption('surface', 'nothing');
       //me.setLogCmd('set surface nothing', true);
       me.setOption('phisurface', 'nothing');
       me.setLogCmd('setoption phisurface nothing', true);
    });

//    clickApplymap2fofc: function() {
    $("#" + me.pre + "applymap2fofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var sigma2fofc = parseFloat($("#" + me.pre + "sigma2fofc" ).val());
       var type = '2fofc';
       me.Dsn6Parser(me.inputid, type, sigma2fofc);
       //me.setOption('map', '2fofc');
       me.setLogCmd('set map 2fofc sigma ' + sigma2fofc, true);
    });
//    },
//    clickApplymapfofc: function() {
    $("#" + me.pre + "applymapfofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var sigmafofc = parseFloat($("#" + me.pre + "sigmafofc" ).val());
       var type = 'fofc';
       me.Dsn6Parser(me.inputid, type, sigmafofc);
       //me.setOption('map', 'fofc');
       me.setLogCmd('set map fofc sigma ' + sigmafofc, true);
    });
//    },
//    clkMn5_mapwireframeYes: function() {
    $("#" + me.pre + "mn5_mapwireframeYes").click(function(e) { var ic = me.icn3d;
       //me.Dsn6Parser(me.inputid);
       me.setOption('mapwireframe', 'yes');
       me.setLogCmd('set map wireframe on', true);
    });
//    },
//    clkMn5_mapwireframeNo: function() {
    $("#" + me.pre + "mn5_mapwireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('mapwireframe', 'no');
       me.setLogCmd('set map wireframe off', true);
    });
//    },
//    clkMn5_emmap: function() {
    $("#" + me.pre + "mn5_emmap").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_emmap', 'EM Density Map');
    });
//    },
//    clkMn5_emmapNo: function() {
    $("#" + me.pre + "mn5_emmapNo").add("#" + me.pre + "emmapNo2").click(function(e) { var ic = me.icn3d;
       me.setOption('emmap', 'nothing');
       me.setLogCmd('setoption emmap nothing', true);
    });
//    },
//    clickApplyemmap: function() {
    $("#" + me.pre + "applyemmap").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var empercentage = parseFloat($("#" + me.pre + "empercentage" ).val());
       var type = 'em';
       //me.emd = 'emd-3906';
       if(iCn3DUI.prototype.DensityCifParser === undefined) {
           var url = me.baseUrl + "icn3d/script/density_cif_parser.min.js";
           $.ajax({
              url: url,
              dataType: "script",
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                   me.DensityCifParser(me.inputid, type, empercentage, ic.emd);
                   me.setLogCmd('set emmap percentage ' + empercentage, true);
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
       }
       else {
           me.DensityCifParser(me.inputid, type, empercentage, ic.emd);
           me.setLogCmd('set emmap percentage ' + empercentage, true);
       }
    });
//    },
//    clkMn5_emmapwireframeYes: function() {
    $("#" + me.pre + "mn5_emmapwireframeYes").click(function(e) { var ic = me.icn3d;
       //me.Dsn6Parser(me.inputid);
       me.setOption('emmapwireframe', 'yes');
       me.setLogCmd('set emmap wireframe on', true);
    });
//    },
//    clkMn5_emmapwireframeNo: function() {
    $("#" + me.pre + "mn5_emmapwireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('emmapwireframe', 'no');
       me.setLogCmd('set emmap wireframe off', true);
    });
//    },
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
//    },
//    clkMn6_showaxisNo: function() {
    $("#" + me.pre + "mn6_showaxisNo").click(function(e) { var ic = me.icn3d;
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
       var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();
       me.setLogCmd("load chain alignment " + alignment, false);
       window.open(me.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&showalignseq=1', '_blank');
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
//    clickReload_pngimage: function() {
    $("#" + me.pre + "reload_pngimage").click(function(e) { var ic = me.icn3d;
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
       me.init();
       ic.init();
       var file = $("#" + me.pre + "pngimage")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var imageStr = e.target.result; // or = reader.result;
           var matchedStr = 'Share Link: ';
           var pos = imageStr.indexOf(matchedStr);
           var matchedStrState = "Start of state file======\n";
           var posState = imageStr.indexOf(matchedStrState);
           if(pos == -1 && posState == -1) {
               alert('Please load a PNG image saved by clicking "Save Datas > PNG Image" in the Data menu...');
           }
           else if(pos != -1) {
               var url = imageStr.substr(pos + matchedStr.length);
               me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
               window.open(url);
           }
           else if(posState != -1) {
               var matchedStrData = "Start of data file======\n";
               var posData = imageStr.indexOf(matchedStrData);
               me.bInputfile = (posData == -1) ? false : true;
               if(me.bInputfile) {
                   var posDataEnd = imageStr.indexOf("End of data file======\n");
                   var data = imageStr.substr(posData + matchedStrData.length, posDataEnd - posData - matchedStrData.length);
                   var matchedStrType = "Start of type file======\n";
                   var posType = imageStr.indexOf(matchedStrType);
                   var posTypeEnd = imageStr.indexOf("End of type file======\n");
                   var type = imageStr.substr(posType + matchedStrType.length, posTypeEnd - posType - matchedStrType.length - 1); // remove the new line char
                   //var matchedStrState = "Start of state file======\n";
                   //var posState = imageStr.indexOf(matchedStrState);
                   var posStateEnd = imageStr.indexOf("End of state file======\n");
                   var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                   statefile = decodeURIComponent(statefile);
                    if(type === 'pdb') {
                        $.when( me.loadPdbData(data))
                         .then(function() {
                             ic.commands = [];
                             ic.optsHistory = [];
                             me.loadScript(statefile, true);
                         });
                    }
                    else {
                        if(type === 'mol2') {
                            me.loadMol2Data(data);
                        }
                        else if(type === 'sdf') {
                            me.loadSdfData(data);
                        }
                        else if(type === 'xyz') {
                            me.loadXyzData(data);
                        }
                        else if(type === 'mmcif') {
                            me.loadMmcifData(data);
                        }
                       ic.commands = [];
                       ic.optsHistory = [];
                       me.loadScript(statefile, true);
                   }
               }
               else { // url length > 4000
                   //var matchedStrState = "Start of state file======\n";
                   //var posState = imageStr.indexOf(matchedStrState);
                   var posStateEnd = imageStr.indexOf("End of state file======\n");
                   var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                   statefile = decodeURIComponent(statefile);
                   ic.commands = [];
                   ic.optsHistory = [];
                   me.loadScript(statefile, true);
               }
               me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
           }
         };
         reader.readAsText(file);
       }
    });
//    },
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
//    pressCommandtext: function() {
    $("#" + me.pre + "logtext").keypress(function(e){ var ic = me.icn3d;
       me.bAddLogs = false; // turn off log
       var code = (e.keyCode ? e.keyCode : e.which);
       if(code == 13) { //Enter keycode
          e.preventDefault();
          var dataStr = $(this).val();
          ic.bRender = true;
          var commandArray = dataStr.split('\n');
          var lastCommand = commandArray[commandArray.length - 1].substr(2).trim(); // skip "> "
          ic.logs.push(lastCommand);
          $("#" + me.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
          if(lastCommand !== '') {
            var transformation = {};
            transformation.factor = ic._zoomFactor;
            transformation.mouseChange = ic.mouseChange;
            transformation.quaternion = ic.quaternion;
            ic.commands.push(lastCommand + '|||' + me.getTransformationStr(transformation));
            ic.optsHistory.push(ic.cloneHash(ic.opts));
            ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
            if(me.isSessionStorageSupported()) me.saveCommandsToSession();
            me.STATENUMBER = ic.commands.length;
            if(lastCommand.indexOf('load') !== -1) {
                me.applyCommandLoad(lastCommand);
            }
            else if(lastCommand.indexOf('set map') !== -1 && lastCommand.indexOf('set map wireframe') === -1) {
                me.applyCommandMap(lastCommand);
            }
            else if(lastCommand.indexOf('set emmap') !== -1 && lastCommand.indexOf('set emmap wireframe') === -1) {
                me.applyCommandEmmap(lastCommand);
            }
            else if(lastCommand.indexOf('set phi') !== -1) {
                me.applyCommandPhi(lastCommand);
            }
            else if(lastCommand.indexOf('set delphi') !== -1) {
                me.applyCommandDelphi(lastCommand);
            }
            else if(lastCommand.indexOf('view annotations') == 0
              //|| lastCommand.indexOf('set annotation cdd') == 0
              //|| lastCommand.indexOf('set annotation site') == 0
              ) {
                me.applyCommandAnnotationsAndCddSite(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation clinvar') == 0 ) {
                me.applyCommandClinvar(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation snp') == 0) {
                me.applyCommandSnp(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                me.applyCommand3ddomain(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation all') == 0) {
                //$.when(me.applyCommandAnnotationsAndCddSite(lastCommand))
                //    .then(me.applyCommandSnpClinvar(lastCommand))
                $.when(me.applyCommandClinvar(lastCommand))
                    .then(me.applyCommandSnp(lastCommand))
                    .then(me.applyCommand3ddomain(lastCommand));
                me.setAnnoTabAll();
            }
            else if(lastCommand.indexOf('view interactions') == 0 && me.cfg.align !== undefined) {
                me.applyCommandViewinteraction(lastCommand);
            }
            else if(lastCommand.indexOf('symmetry') == 0) {
                var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                ic.symmetrytitle = (title === 'none') ? undefined : title;
                if(title !== 'none') {
                    if(ic.symmetryHash === undefined) {
                        me.applyCommandSymmetry(lastCommand);
                    }
                }
            }
            else if(lastCommand.indexOf('symd symmetry') == 0) {
                //var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                //ic.symdtitle = (title === 'none') ? undefined : title;
                //if(title !== 'none') {
                    //if(ic.symdHash === undefined) {
                        me.applyCommandSymd(lastCommand);
                    //}
                //}
            }
            else if(lastCommand.indexOf('scap ') == 0) {
                me.applyCommandScap(lastCommand);
            }
            else if(lastCommand.indexOf('realign on seq align') == 0) {
                var paraArray = lastCommand.split(' | ');
                if(paraArray.length == 2) {
                    var nameArray = paraArray[1].split(',');
                    ic.hAtoms = me.getAtomsFromNameArray(nameArray);
                }
                me.applyCommandRealign(lastCommand);
            }
            else if(lastCommand.indexOf('graph interaction pairs') == 0) {
                me.applyCommandGraphinteraction(lastCommand);
            }
            else {
                me.applyCommand(lastCommand + '|||' + me.getTransformationStr(transformation));
            }
            me.saveSelectionIfSelected();
            ic.draw();
          }
       }
       me.bAddLogs = true;
    });
//    },
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
       ic.draw();
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
        me.setLogCmd('scap ' + snp, true);
    });

};

iCn3DUI.prototype.setTheme = function(color) { var me = this, ic = me.icn3d; "use strict";
    var borderColor, bkgdColor, bkgdImg, iconImg, activeTabColor;

    me.themecolor = color;

    if(color == 'orange') {
        borderColor = '#e78f08';
        bkgdColor = '#f6a828';
        bkgdImg = 'ui-bg_gloss-wave_35_f6a828_500x100.png';
        iconImg = 'ui-icons_ef8c08_256x240.png';
        activeTabColor = '#eb8f00';
    }
    else if(color == 'black') {
        borderColor = '#333333';
        bkgdColor = '#333333';
        bkgdImg = 'ui-bg_gloss-wave_25_333333_500x100.png';
        iconImg = 'ui-icons_222222_256x240.png';
        activeTabColor = '#222222';
    }
    else if(color == 'blue') {
        borderColor = '#4297d7';
        bkgdColor = '#5c9ccc';
        bkgdImg = 'ui-bg_gloss-wave_55_5c9ccc_500x100.png';
        iconImg = 'ui-icons_228ef1_256x240.png';
        activeTabColor = '#444';
    }

    $('.ui-widget-header').css({
        'border': '1px solid ' + borderColor,
        'background': bkgdColor + ' url("lib/images/' + bkgdImg + '") 50% 50% repeat-x',
        'color':'#fff',
        'font-weight':'bold'
    });

    $('.ui-button .ui-icon').css({
        'background-image': 'url(lib/images/' + iconImg + ')'
    });

    $('.ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited').css({
        'color': activeTabColor,
        'text-decoration': 'none'
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
   pdbStr += me.getAtomPDB(atoms, undefined, true);

   var file_pref = (me.inputid) ? me.inputid : "custom";
   me.saveFile(file_pref + '_icn3d.pdb', 'text', [pdbStr]);
};

iCn3DUI.prototype.exportPqr = function() { var me = this, ic = me.icn3d; "use strict";
   var chainHash = {}, ionHash = {};
   var atomHash = {};
/*
   for(var i in ic.hAtoms) {
       var atom = ic.atoms[i];

       if(ic.ions.hasOwnProperty(i)) {
         ionHash[i] = 1;
       }
       else {
         chainHash[atom.structure + '_' + atom.chain] = 1;
       }
   }

   for(var chainid in chainHash) {
       atomHash = ic.unionHash(atomHash, ic.chains[chainid]);
   }
*/

   var atoms = ic.intHash(ic.dAtoms, ic.hAtoms);
   for(var i in atoms) {
       var atom = ic.atoms[i];

       if(ic.ions.hasOwnProperty(i)) {
         ionHash[i] = 1;
       }
       else {
         atomHash[i] = 1;
       }
   }

   if(me.cfg.cid) {
      var pqrStr = '';
      pqrStr += me.getPDBHeader();
      pqrStr += me.getAtomPDB(atomHash, true) + me.getAtomPDB(ionHash, true);

      var file_pref = (me.inputid) ? me.inputid : "custom";
      me.saveFile(file_pref + '_icn3d.pqr', 'text', [pqrStr]);
   }
   else {
       var bCalphaOnly = ic.isCalphaPhosOnly(ic.hash2Atoms(atomHash));
       if(bCalphaOnly) {
           alert("The potential will not be shown because the side chains are missing in the structure...");
           return;
       }

       var pdbstr = '';
       pdbstr += me.getPDBHeader();

       pdbstr += me.getAtomPDB(atomHash);
       pdbstr += me.getAtomPDB(ionHash, true);

       var url = "https://www.ncbi.nlm.nih.gov/Structure/delphi/delphi.fcgi";

       var pdbid = (me.cfg.cid) ? me.cfg.cid : Object.keys(ic.structures).toString();

       $.ajax({
          url: url,
          type: 'POST',
          data : {'pdb2pqr': pdbstr, 'pdbid': pdbid},
          dataType: 'text',
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1,
          beforeSend: function() {
              me.showLoading();
          },
          complete: function() {
              me.hideLoading();
          },
          success: function(data) {
              var pqrStr = data;

              var file_pref = (me.inputid) ? me.inputid : "custom";
              me.saveFile(file_pref + '_icn3d_residues.pqr', 'text', [pqrStr]);
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
   }
};
