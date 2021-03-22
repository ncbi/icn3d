/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu1 = function() { var me = this, ic = me.icn3d; "use strict";
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
       me.openDlg('dl_chainalign', 'Align multiple chains of 3D structures');
    });

    $("#" + me.pre + "mn1_mutation").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_mutation', 'Show the mutations in 3D');
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
};
