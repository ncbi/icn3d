/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ClickMenu {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    setAlphaFoldLegend() { let me = this.icn3dui, ic = me.icn3d;
        let legendHtml;
        legendHtml = '<div>';
        legendHtml += '<span class="icn3d-square" style="background-color: rgb(0, 83, 204);">&nbsp;</span> <span>Very high (pLDDT &gt; 90)</span><br>';
        legendHtml += '<span class="icn3d-square" style="background-color: rgb(101, 203, 243);">&nbsp;</span> <span>Confident (90 &gt; pLDDT &gt; 70)</span><br>';
        legendHtml += '<span class="icn3d-square" style="background-color: rgb(255, 209, 19);">&nbsp;</span> <span>Low (70 &gt; pLDDT &gt; 50)</span><br>';
        legendHtml += '<span class="icn3d-square" style="background-color: rgb(255, 125, 69);">&nbsp;</span> <span>Very low (pLDDT &lt; 50)</span><br>';
        legendHtml += '</div>';

        return legendHtml;
    }

    setLegendHtml(bAf) { let me = this.icn3dui, ic = me.icn3d;
        let legendHtml = "<br>";
        if(bAf) {
            legendHtml += this.setAlphaFoldLegend();
        }
        else {
            let startColorStr = (ic.startColor == 'red') ? '#F00' : (ic.startColor == 'green') ? '#0F0' : '#00F';
            let midColorStr = (ic.midColor == 'white') ? '#FFF' : '#000';
            let endColorStr = (ic.endColor == 'red') ? '#F00' : (ic.endColor == 'green') ? '#0F0' : '#00F';
            let rangeStr = startColorStr + ' 0%, ' + midColorStr + ' 50%, ' + endColorStr + ' 100%';

            legendHtml += "<div style='height: 20px; background: linear-gradient(to right, " + rangeStr + ");'></div><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td width='33%'>" + ic.startValue + "</td><td width='33%' align='center'>" + ic.midValue + "</td><td width='33%' align='right'>" + ic.endValue + "</td></tr></table>";
        }

        return legendHtml;
    }

    SetChainsAdvancedMenu() { let me = this.icn3dui, ic = me.icn3d;
        if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
            let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
            ic.definedSetsCls.setPredefinedInMenu();
            ic.bSetChainsAdvancedMenu = true;
            ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
        }
    }

    setSetsMenus(id, bOneset) { let me = this.icn3dui, ic = me.icn3d;
        this.SetChainsAdvancedMenu();

        let id1 = id;
        let id2 = id + '2';

        let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
        if($("#" + me.pre + id1).length) {
            $("#" + me.pre + id1).html("  <option value='selected'>selected</option>" + definedAtomsHtml);
        }
        if(!bOneset && $("#" + me.pre + id2).length) {
            $("#" + me.pre + id2).html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
        }

        $("#" + me.pre + id1).resizable();
        if(!bOneset) $("#" + me.pre + id2).resizable();
    }

    applyShownMenus(bNoSave) { let me = this.icn3dui, ic = me.icn3d;
        let idArray = [];
        for(let id in me.htmlCls.allMenus) {
            if(me.htmlCls.shownMenus.hasOwnProperty(id)) {
                $("#" + me.pre + id).parent().show();
            }
            else {            
                $("#" + me.pre + id).parent().hide();     
                idArray.push(id);         
            }
        }   

        if(Object.keys(me.htmlCls.shownMenus).length == Object.keys(me.htmlCls.allMenus).length) {
            $(".icn3d-menusep").show();
        }
        else {
            $(".icn3d-menusep").hide();
        }

        // save to localStorage
        if(localStorage && !bNoSave) localStorage.setItem('hiddenmenus', JSON.stringify(idArray));
    }

    getHiddenMenusFromCache() { let me = this.icn3dui, ic = me.icn3d;
        me.htmlCls.shownMenus = {};

        let idArrayStr = (localStorage) ? localStorage.getItem('hiddenmenus') : '';
        
        if(idArrayStr && idArrayStr != '[]') {
            let idArray = JSON.parse(idArrayStr);

            // for(let i = 0, il = idArray.length; i < il; ++i) {
            //     me.htmlCls.shownMenus[idArray[i]] = 1;
            // }
            for(let menu in me.htmlCls.allMenus) {
                if(idArray.indexOf(menu) == -1) {
                    me.htmlCls.shownMenus[menu] = 1;
                }
            }
        }
        else {
            me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.allMenus);
        }
    }
    
    displayShownMenus() { let me = this.icn3dui, ic = me.icn3d;
        let html = "<form name='" + me.pre + "selmenu'>";
        html += "<table><tr><th>File</th><th>Select</th><th>View</th><th>Style</th><th>Color</th><th>Analysis</th><th>Help</th></tr>";
        html += "<tr>";
        for(let id in me.htmlCls.allMenusSel) {
            // skip all unicolor: too many
            if(id.substr(0, 6) == 'uniclr' 
                || id.substr(0, 11) == 'mn5_opacity'
                || id.substr(0, 14) == 'mn6_labelscale'
                || id.substr(0, 4) == 'faq_'
                || id.substr(0, 4) == 'dev_') {
                    continue;
            }

            if(id == 'mn1_searchgrooup') {
                html += "<td valign='top'>";
            }
            else if(id == 'mn2_definedsets') {
                html += "</td><td valign='top'>";
            }
            else if(id == 'mn2_show_selected') {
                html += "</td><td valign='top'>";
            }
            else if(id == 'mn3_proteinwrap' || (me.cfg.cid && id == 'mn3_ligwrap')) {
                html += "</td><td valign='top'>";
            }
            else if(id == 'mn4_clrwrap') {
                html += "</td><td valign='top'>";
            }
            else if(id == 'mn6_selectannotations') {
                html += "</td><td valign='top'>";
            }
            else if(id == 'abouticn3d') {
                html += "</td><td valign='top'>";
            }

            let checkStr = (me.htmlCls.shownMenus.hasOwnProperty(id)) ? "checked" : "";

            let selType = me.htmlCls.allMenusSel[id];
            let styleStr = (selType == 3) ? " style='margin-left:30px'" : ((selType == 2) ? " style='margin-left:15px'" : "");

            html += "<span style='white-space:nowrap'><input type='checkbox' name='" + id + "' value='" + id + "'" + checkStr + styleStr + ">" + me.htmlCls.allMenus[id] + "</span><br>";
        }  
        html += "</td></tr></table></form>";

        $("#" + me.pre + "menulist").html(html);
    }


    clickMenu1() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    //mn 1
    //    clkMn1_mmtfid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_vastplus", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_vastplus', 'Please input PDB ID for VAST+');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_vast", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_vast', 'Please input chain or PDB file for VAST');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_foldseek", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_foldseek', 'Submit your selection to Foldseek');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_mmtfid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mmtfid', 'Please input MMTF ID');
        });

    //    clkMn1_pdbid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_pdbid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_pdbid', 'Please input PDB ID');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_afid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_afid', 'Please input AlphaFold UniProt ID');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_refseqid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_refseqid', 'Please input NCBI Protein Accession');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_opmid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_opmid', 'Please input OPM PDB ID');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_align", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_align', 'Align two PDB structures');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_alignaf", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_alignaf', 'Align two AlphaFold structures');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_chainalign", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_chainalign', 'Align multiple chains by structure alignment');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_chainalign2", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_chainalign2', 'Align multiple chains by sequence alignment');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_chainalign3", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_chainalign3', 'Align multiple chains residue by residue');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_mutation", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mutation', 'Show the mutations in 3D');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_pdbfile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //me = me.setIcn3dui($(this).attr('id'));
           me.htmlCls.dialogCls.openDlg('dl_pdbfile', 'Please input PDB File');
        });
        me.myEventCls.onIds(["#" + me.pre + "mn1_pdbfile_app", "#" + me.pre + "tool_pdbfile"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //me = me.setIcn3dui($(this).attr('id'));
           me.htmlCls.dialogCls.openDlg('dl_pdbfile_app', 'Please append PDB Files');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_mol2file", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mol2file', 'Please input Mol2 File');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_sdffile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_sdffile', 'Please input SDF File');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_xyzfile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_xyzfile', 'Please input XYZ File');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_afmapfile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_afmapfile', 'Please input AlphaFold PAE File');
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_urlfile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_urlfile', 'Load data by URL');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_fixedversion", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_fixedversion', 'Open Share Link URL in the archived version of iCn3D');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_fixedversion", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let url = $("#" + me.pre + "sharelinkurl").val();
           thisClass.setLogCmd("open " + url, false);
           localStorage.setItem('fixedversion', '1');
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(url, urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_mmciffile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mmciffile', 'Please input mmCIF File');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_mmcifid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mmcifid', 'Please input mmCIF ID');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_mmdbid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn1_mmdbafid", , "#" + me.pre + "tool_mmdbafid"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_mmdbafid', 'Please input PDB/MMDB/AlphaFold UniProt IDs');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_blast_rep_id", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_blast_rep_id', 'Align sequence to structure');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_esmfold", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_esmfold', 'Sequence to structure prediction with ESMFold');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_proteinname", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_proteinname', 'Please input protein or gene name');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_cid", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_cid', 'Please input PubChem CID');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_pngimage", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_pngimage', 'Please input the PNG image');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_state", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_state', 'Please input the state file');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_selection", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_selection', 'Please input the selection file');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_dsn6", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_dsn6', 'Please input the DSN6 file to display electron density map');
        });


        me.myEventCls.onIds(["#" + me.pre + "mn1_delphi", "#" + me.pre + "mn1_delphi2", "#" + me.pre + "tool_delphi"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.loadPhiFrom = 'delphi';
           $("#" + me.pre + "dl_delphi_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_delphi', 'Please set parameters to display DelPhi potential map');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_phi", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.loadPhiFrom = 'phi';
           $("#" + me.pre + "dl_phi_tabs").tabs();
           $("#" + me.pre + "phitab1_tabs").tabs();
           $("#" + me.pre + "phitab2_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_phi', 'Please input local phi or cube file to display DelPhi potential map');
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_phiurl", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.loadPhiFrom = 'phiurl';
           $("#" + me.pre + "dl_phiurl_tabs").tabs();
           $("#" + me.pre + "phiurltab1_tabs").tabs();
           $("#" + me.pre + "phiurltab2_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_phiurl', 'Please input URL phi or cube file to display DelPhi potential map');
        });


        me.myEventCls.onIds("#" + me.pre + "mn1_dsn6url", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_dsn6url', 'Please input the DSN6 file to display electron density map');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportState", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export state file", false);
           let file_pref = Object.keys(ic.structures).join(',');

           ic.saveFileCls.saveFile(file_pref + '_statefile.txt', 'command');
        });


        me.myEventCls.onIds("#" + me.pre + "mn1_exportPdbRes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.setHtmlCls.exportPdb();

           thisClass.setLogCmd("export pdb", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportSecondary", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.setHtmlCls.exportSecondary();

           thisClass.setLogCmd("export secondary structure", true);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphipdb", "#" + me.pre + "phipdb"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let pdbStr = ic.saveFileCls.getSelectedResiduePDB();

           thisClass.setLogCmd("export PDB of selected residues", false);
           //let file_pref = Object.keys(ic.structures).join(',');
           let file_pref = Object.keys(ic.structures).join(',');
           ic.saveFileCls.saveFile(file_pref + '_icn3d_residues.pdb', 'text', [pdbStr]);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphipqr", "#" + me.pre + "phipqr", "#" + me.pre + "phiurlpqr"], "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           await me.htmlCls.setHtmlCls.exportPqr();
           thisClass.setLogCmd("export pqr", true);
        });

      //   me.myEventCls.onIds("#" + me.pre + "delphipqbh", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
      //       let bPdb = true;
      //       await me.htmlCls.setHtmlCls.exportPqr(bPdb);
      //       thisClass.setLogCmd("export pdbh", false);
      //    });

        me.myEventCls.onIds("#" + me.pre + "profixpdb", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
         let bHydrogen = false;
         await ic.scapCls.exportPdbProfix(bHydrogen);
         thisClass.setLogCmd("export pdb missing atoms", true);
        });

        me.myEventCls.onIds("#" + me.pre + "profixpdbh", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
        let bHydrogen = true;
        await ic.scapCls.exportPdbProfix(bHydrogen);
        thisClass.setLogCmd("export pdb hydrogen", true);
       });

       me.myEventCls.onIds("#" + me.pre + "mn1_exportIgstrand", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
       ic.refnumCls.exportRefnum('igstrand');
       thisClass.setLogCmd("export refnum igstrand", true);
      });

      me.myEventCls.onIds("#" + me.pre + "mn1_exportKabat", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
         ic.refnumCls.exportRefnum('kabat');
         thisClass.setLogCmd("export refnum kabat", true);
      });

      me.myEventCls.onIds("#" + me.pre + "mn1_exportImgt", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
      ic.refnumCls.exportRefnum('imgt');
      thisClass.setLogCmd("export refnum imgt", true);
      });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportStl", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export stl file", false);
           //ic.threeDPrintCls.hideStabilizer();
           ic.export3DCls.exportStlFile('');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportVrml", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export vrml file", false);
           //ic.threeDPrintCls.hideStabilizer();
           ic.export3DCls.exportVrmlFile('');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportStlStab", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export stl stabilizer file", false);
           //ic.bRender = false;
           ic.threeDPrintCls.hideStabilizer();
           ic.threeDPrintCls.resetAfter3Dprint();
           ic.threeDPrintCls.addStabilizer();
           ic.export3DCls.exportStlFile('_stab');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportVrmlStab", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export vrml stabilizer file", false);
           //ic.bRender = false;
           ic.threeDPrintCls.hideStabilizer();
           ic.threeDPrintCls.resetAfter3Dprint();
           ic.threeDPrintCls.addStabilizer();
           ic.export3DCls.exportVrmlFile('_stab');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_exportInteraction", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export interactions", false);
           if(me.cfg.mmdbid !== undefined) await ic.viewInterPairsCls.retrieveInteractionData();
           ic.viewInterPairsCls.exportInteractions();
        });

        me.myEventCls.onIds(["#" + me.pre + "mn1_exportCanvas", "#" + me.pre + "saveimage"], "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           // do not record the export command
           //thisClass.setLogCmd("export canvas", true);
           thisClass.setLogCmd("export canvas", false);
           //var file_pref =(ic.inputid) ? ic.inputid : "custom";
           //ic.saveFileCls.saveFile(file_pref + '_image_icn3d_loadable.png', 'png');
           let bPngHtml = true;
           await ic.shareLinkCls.shareLink(bPngHtml);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas1", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export canvas 1", true);
           ic.scaleFactor = 1;
           await ic.shareLinkCls.shareLink(true, true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas2", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export canvas 2", true);
           ic.scaleFactor = 2;
           await ic.shareLinkCls.shareLink(true, true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas4", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export canvas 4", true);
           ic.scaleFactor = 4;
           await ic.shareLinkCls.shareLink(true, true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas8", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export canvas 8", true);
           ic.scaleFactor = 8;
           await ic.shareLinkCls.shareLink(true, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportCounts", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export counts", false);
           let text = '<html><body><div style="text-align:center"><br><b>Total Count for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';
           text += '<tr><td>' + Object.keys(ic.structures).length + '</td><td>' + Object.keys(ic.chains).length + '</td><td>' + Object.keys(ic.residues).length + '</td><td>' + Object.keys(ic.atoms).length + '</td></tr>';
           text += '</table><br/>';
           text += '<b>Counts by Chain for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure</th><th>Chain</th><th>Residue Count</th><th>Atom Count</th></tr>';
           let chainArray = Object.keys(ic.chains);

           for(let i = 0, il = chainArray.length; i < il; ++i) {
               let chainid = chainArray[i];
               //if(!chainid) continue;

               let pos = chainid.indexOf('_');
               let structure = chainid.substr(0, pos);
               let chain = chainid.substr(pos + 1);
               let residueHash = {}
               let atoms = ic.chains[chainid];
               for(let j in atoms) {
                   residueHash[ic.atoms[j].resi] = 1;
               }
               text += '<tr><td>' + structure + '</td><td>' + chain + '</td><td>' + Object.keys(residueHash).length + '</td><td>' + Object.keys(ic.chains[chainid]).length + '</td></tr>';
           }
           text += '</table><br/></div></body></html>';
           let file_pref = Object.keys(ic.structures).join(',');
           ic.saveFileCls.saveFile(file_pref + '_counts.html', 'html', text);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportSelections", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export all selections", false);
          
           thisClass.SetChainsAdvancedMenu();

           let text = ic.saveFileCls.exportCustomAtoms();
           let file_pref = Object.keys(ic.structures).join(',');
           ic.saveFileCls.saveFile(file_pref + '_selections.txt', 'text', [text]);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_exportSelDetails", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("export all selections with details", false);
          
           thisClass.SetChainsAdvancedMenu();

           let bDetails = true;
           let text = ic.saveFileCls.exportCustomAtoms(bDetails);
           let file_pref = Object.keys(ic.structures).join(',');
           ic.saveFileCls.saveFile(file_pref + '_sel_details.txt', 'text', [text]);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn1_sharelink", "#" + me.pre + "tool_sharelink"], "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            await ic.shareLinkCls.shareLink();
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_replayon", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
          await ic.resizeCanvasCls.replayon();
          thisClass.setLogCmd("replay on", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_replayoff", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            await ic.resizeCanvasCls.replayoff();
            thisClass.setLogCmd("replay off", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_menuall", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.allMenus);

            thisClass.applyShownMenus();    
          });

        me.myEventCls.onIds("#" + me.pre + "mn1_menusimple", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.simpleMenus);

            thisClass.applyShownMenus();
          });

        me.myEventCls.onIds("#" + me.pre + "mn1_menupref", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_menupref', 'Select Menus');

            thisClass.getHiddenMenusFromCache();

            thisClass.displayShownMenus();
         });

         me.myEventCls.onIds(["#" + me.pre + "apply_menupref", "#" + me.pre + "apply_menupref2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            var checkboxes = document.querySelectorAll('form[name="' + me.pre + 'selmenu"] input:checked');
            me.htmlCls.shownMenus = {};
            for (var checkbox of checkboxes) {
                me.htmlCls.shownMenus[checkbox.value] = 1;
            }

            thisClass.applyShownMenus();
         });

         me.myEventCls.onIds(["#" + me.pre + "reset_menupref", "#" + me.pre + "reset_menupref2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.simpleMenus);

            thisClass.applyShownMenus();
            thisClass.displayShownMenus();
         });

         me.myEventCls.onIds(["#" + me.pre + "reset_menupref_all", "#" + me.pre + "reset_menupref_all2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.allMenus);

            thisClass.applyShownMenus();
            thisClass.displayShownMenus();
         });

         me.myEventCls.onIds(["#" + me.pre + "savepref", "#" + me.pre + "savepref2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            let menuStr = '[';

            //var checkboxes = document.querySelectorAll('form[name="' + me.pre + 'selmenu"] input:checked');
            var checkboxes = document.querySelectorAll('form[name="' + me.pre + 'selmenu"] input:not(:checked)');
            let cnt = 0;
            for (var checkbox of checkboxes) {
                if(cnt > 0) menuStr += ', ';
                menuStr += '"' + checkbox.value + '"';
                ++cnt;
            }
            
            menuStr += ']';
    
            ic.saveFileCls.saveFile('icn3d_menus_pref.txt', 'text', [menuStr]);
         });

         me.myEventCls.onIds("#" + me.pre + "reload_menupreffile", "click", function(e) { let ic = me.icn3d; 
            e.preventDefault();

            if(!me.cfg.notebook) dialog.dialog( "close" );
            let file = $("#" + me.pre + "menupreffile")[0].files[0];
            if(!file) {
              alert("Please select a file before clicking 'Load'");
            }
            else {
              me.htmlCls.setHtmlCls.fileSupport();
              let reader = new FileReader();
              reader.onload = function(e) {
                let dataStr = e.target.result; // or = reader.result;
                let idArray = JSON.parse(dataStr);

                me.htmlCls.shownMenus = {};
                // for(let i = 0, il = idArray.length; i < il; ++i) {
                //     me.htmlCls.shownMenus[idArray[i]] = 1;
                // }
                for(let menu in me.htmlCls.allMenus) {
                    if(idArray.indexOf(menu) == -1) {
                        me.htmlCls.shownMenus[menu] = 1;
                    }
                }

                thisClass.applyShownMenus();
                thisClass.displayShownMenus();
              }
              reader.readAsText(file);
            }
         });

        me.myEventCls.onIds("#" + me.pre + "mn1_menuloadpref", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_menuloadpref', 'Please input the menu preference file');
        });
         

        me.myEventCls.onIds("#" + me.pre + "mn1_link_structure", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let url = ic.saveFileCls.getLinkToStructureSummary(true);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(url, urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_alphafold", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let url = 'https://github.com/sokrypton/ColabFold';
           window.open(url, '_blank');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_link_bind", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + ic.inputid;
           thisClass.setLogCmd("link to 3D protein structures bound to CID " + ic.inputid + ": " + url, false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(url, urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_link_vast", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
         let url;  
         if(ic.inputid === undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pccompound?term=" + ic.molTitle;
               thisClass.setLogCmd("link to compounds " + ic.molTitle + ": " + url, false);
           }
           else {
               if(me.cfg.cid !== undefined) {
                       url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_pccompound_3d&from_uid=" + ic.inputid;
                       thisClass.setLogCmd("link to compounds with structure similar to CID " + ic.inputid + ": " + url, false);
               }
               else {
                   let idArray = ic.inputid.split('_');
                   
                   if(idArray.length === 1) {
                       url = me.htmlCls.baseUrl + "vastplus/vastplus.cgi?uid=" + ic.inputid;
                       thisClass.setLogCmd("link to structures similar to " + ic.inputid + ": " + url, false);
                   }
                   else if(idArray.length === 2) {
                       url = me.htmlCls.baseUrl + "vastplus/vastplus.cgi?uid=" + idArray[0];
                       thisClass.setLogCmd("link to structures similar to " + idArray[0] + ": " + url, false);
                   }
               }
           }

           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(url, urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_link_pubmed", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let url;
           if(ic.inputid === undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + ic.molTitle;
               thisClass.setLogCmd("link to literature about " + ic.molTitle + ": " + url, false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(url, urlTarget);
           }
           else if(ic.pmid) {
               let idArray = ic.pmid.toString().split('_');
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/" + ic.pmid;
                   thisClass.setLogCmd("link to PubMed ID " + ic.pmid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   thisClass.setLogCmd("link to PubMed IDs " + idArray[0] + ", " + idArray[1] + ": " + url, false);
               }
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(url, urlTarget);
           }
           else if(isNaN(ic.inputid)) {
               let idArray = ic.inputid.toString().split('_');
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + ic.inputid;
                   thisClass.setLogCmd("link to literature about PDB " + ic.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   thisClass.setLogCmd("link to literature about PDB " + idArray[0] + " OR " + idArray[1] + ": " + url, false);
               }
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(url, urlTarget);
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

        me.myEventCls.onIds("#" + me.pre + "mn1_link_protein", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
          //ic.saveFileCls.setEntrezLinks('protein');
          let structArray = Object.keys(ic.structures);
          let chainArray = Object.keys(ic.chains);
          let text = '';
          for(let i = 0, il = chainArray.length; i < il; ++i) {
              let firstAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainArray[i]]);
              if(ic.proteins.hasOwnProperty(firstAtom.serial) && chainArray[i].length == 6) {
                  text += chainArray[i] + '[accession] OR ';
              }
          }
          if(text.length > 0) text = text.substr(0, text.length - 4);
          let url = "https://www.ncbi.nlm.nih.gov/protein/?term=" + text;
          thisClass.setLogCmd("link to Entrez protein about PDB " + structArray + ": " + url, false);
          let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
          window.open(url, urlTarget);
        });

    }

    clickMenu2() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;

        me.myEventCls.onIds(["#" + me.pre + "mn6_selectannotations", "#" + me.pre + "tool_selectannotations"], "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           await ic.showAnnoCls.showAnnotations();
           thisClass.setLogCmd("view annotations", true);
           //thisClass.setLogCmd("window annotations", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectall", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select all", true);
           ic.selectionCls.selectAll();
           ic.hlUpdateCls.removeHlAll();
           ic.drawCls.draw();
        });
        me.myEventCls.onIds("#" + me.pre + "clearall", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("clear all", true);
           ic.bSelectResidue = false;
           ic.selectionCls.selectAll();
           ic.hlUpdateCls.removeHlAll();
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectdisplayed", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select displayed set", true);
           //ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
           ic.hAtoms = me.hashUtilsCls.cloneHash(ic.viewSelectionAtoms);
           ic.hlUpdateCls.updateHlAll();
           //ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_fullstru", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("show all", true);
           ic.selectionCls.showAll();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectcomplement", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
               thisClass.setLogCmd("select complement", true);
               ic.resid2specCls.selectComplement();
           }
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectmainchains", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select main chains", true);
           ic.selectionCls.selectMainChains();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectsidechains", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select side chains", true);
           ic.selectionCls.selectSideChains();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_selectmainsidechains", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select main side chains", true);
           ic.selectionCls.selectMainSideChains();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_propPos", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select prop positive", true);
           ic.resid2specCls.selectProperty('positive');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propNeg", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select prop negative", true);
           ic.resid2specCls.selectProperty('negative');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propHydro", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select prop hydrophobic", true);
           ic.resid2specCls.selectProperty('hydrophobic');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propPolar", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           thisClass.setLogCmd("select prop polar", true);
           ic.resid2specCls.selectProperty('polar');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propBfactor", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_propbybfactor', 'Select residue based on B-factor');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propSolAcc", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_propbypercentout', 'Select residue based on the percentage of solvent accessilbe surface area');
        });
        me.myEventCls.onIds("#" + me.pre + "applypropbybfactor", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let from = $("#" + me.pre + "minbfactor").val();
           let to = $("#" + me.pre + "maxbfactor").val();
           thisClass.setLogCmd("select prop b factor | " + from + '_' + to, true);
           ic.resid2specCls.selectProperty('b factor', from, to);
        });
        me.myEventCls.onIds("#" + me.pre + "applypropbypercentout", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let from = $("#" + me.pre + "minpercentout").val();
           let to = $("#" + me.pre + "maxpercentout").val();
           thisClass.setLogCmd("select prop percent out | " + from + '_' + to, true);
           ic.resid2specCls.selectProperty('percent out', from, to);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_alignment", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
           thisClass.setLogCmd("window aligned sequences", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_window_table", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_allinteraction', 'Show interactions');
           thisClass.setLogCmd("window interaction table", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_linegraph", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
           thisClass.setLogCmd("window interaction graph", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_scatterplot", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_scatterplot', 'Show interactions as map');
           thisClass.setLogCmd("window interaction scatterplot", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_graph", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
           thisClass.setLogCmd("window force-directed graph", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_yournote", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_yournote', 'Your note about the current display');
        });

        me.myEventCls.onIds("#" + me.pre + "applyyournote", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.yournote = $("#" + me.pre + "yournote").val();
           if(me.cfg.shownote) document.title = ic.yournote;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd('your note | ' + ic.yournote, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_command", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_advanced2', 'Select by specification');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn2_definedsets", "#" + me.pre + "definedsets", "#" + me.pre + "definedsets2", "#" + me.pre + "tool_definedsets"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.definedSetsCls.showSets();
           thisClass.setLogCmd('defined sets', true);
           //thisClass.setLogCmd('window defined sets', true);
        });
        $(document).on("click", "#" + me.pre + "setOr", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.setOperation = 'or';
        });
        $(document).on("click", "#" + me.pre + "setAnd", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.setOperation = 'and';
        });
        $(document).on("click", "#" + me.pre + "setNot", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.setOperation = 'not';
        });


        me.myEventCls.onIds("#" + me.pre + "mn2_pkNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 0;
           ic.opts['pk'] = 'no';
           thisClass.setLogCmd('set pk off', true);
           ic.drawCls.draw();
           ic.hlObjectsCls.removeHlObjects();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_pkYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           thisClass.setLogCmd('set pk atom', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_pkResidue", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 2;
           ic.opts['pk'] = 'residue';
           thisClass.setLogCmd('set pk residue', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_pkStrand", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 3;
           ic.opts['pk'] = 'strand';
           thisClass.setLogCmd('set pk strand', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_pkDomain", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 4;
           ic.opts['pk'] = 'domain';
           thisClass.setLogCmd('set pk domain', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_pkChain", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pk = 5;
           ic.opts['pk'] = 'chain';
           thisClass.setLogCmd('set pk chain', true);
        });

        me.myEventCls.onIds("#" + me.pre + "adjustmem", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_adjustmem', 'Adjust the Z-axis positions of the membrane');
        });

        me.myEventCls.onIds("#" + me.pre + "togglemem", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.selectionCls.toggleMembrane();
           thisClass.setLogCmd('toggle membrane', true);
        });

        me.myEventCls.onIds("#" + me.pre + "selectplane", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_selectplane', 'Select a region between two planes');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn2_aroundsphere", "#" + me.pre + "tool_aroundsphere"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            thisClass.SetChainsAdvancedMenu();

            let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
            if($("#" + me.pre + "atomsCustomSphere").length) {
                $("#" + me.pre + "atomsCustomSphere").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomSphere2").length) {
                $("#" + me.pre + "atomsCustomSphere2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
            }
            me.htmlCls.dialogCls.openDlg('dl_aroundsphere', 'Select a sphere around a set of residues');
            ic.bSphereCalc = false;
            //thisClass.setLogCmd('set calculate sphere false', true);
            $("#" + me.pre + "atomsCustomSphere").resizable();
            $("#" + me.pre + "atomsCustomSphere2").resizable();
        });

        me.myEventCls.onIds(["#" + me.pre + "mn2_select_chain", "#" + me.pre + "definedSets"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_select_chain', 'Select Structure/Chain/Custom Selection');
        });

    }

    clickMenu3() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 3
        me.myEventCls.onIds(["#" + me.pre + "mn3_proteinsRibbon","#" + me.pre + "tool_proteinsRibbon"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'ribbon');
           thisClass.setLogCmd('style proteins ribbon', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsStrand", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'strand');
           thisClass.setLogCmd('style proteins strand', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsCylinder", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'cylinder and plate');
           thisClass.setLogCmd('style proteins cylinder and plate', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsSchematic", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'schematic');
           thisClass.setLogCmd('style proteins schematic', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsCalpha", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'c alpha trace');
           thisClass.setLogCmd('style proteins c alpha trace', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsBackbone", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'backbone');
           thisClass.setLogCmd('style proteins backbone', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsBfactor", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'b factor tube');
           thisClass.setLogCmd('style proteins b factor tube', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsLines", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'lines');
           thisClass.setLogCmd('style proteins lines', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsStick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'stick');
           thisClass.setLogCmd('style proteins stick', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn3_proteinsBallstick", "#" + me.pre + "tool_proteinsBallstick"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'ball and stick');
           thisClass.setLogCmd('style proteins ball and stick', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn3_proteinsSphere", "#" + me.pre + "tool_proteinsSphere"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'sphere');
           thisClass.setLogCmd('style proteins sphere', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('proteins', 'nothing');
           thisClass.setLogCmd('style proteins nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_sidecLines", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('sidec', 'lines2');
           thisClass.setLogCmd('style sidec lines2', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_sidecStick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('sidec', 'stick2');
           thisClass.setLogCmd('style sidec stick2', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_sidecBallstick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('sidec', 'ball and stick2');
           thisClass.setLogCmd('style sidec ball and stick2', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_sidecSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('sidec', 'sphere2');
           thisClass.setLogCmd('style sidec sphere2', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_sidecNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('sidec', 'nothing');
           thisClass.setLogCmd('style sidec nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ntbaseLines", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setStyle('ntbase', 'lines2');
            thisClass.setLogCmd('style ntbase lines2', true);
         });
 
         me.myEventCls.onIds("#" + me.pre + "mn3_ntbaseStick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setStyle('ntbase', 'stick2');
            thisClass.setLogCmd('style ntbase stick2', true);
         });
 
         me.myEventCls.onIds("#" + me.pre + "mn3_ntbaseBallstick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setStyle('ntbase', 'ball and stick2');
            thisClass.setLogCmd('style ntbase ball and stick2', true);
         });
 
         me.myEventCls.onIds("#" + me.pre + "mn3_ntbaseSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setStyle('ntbase', 'sphere2');
            thisClass.setLogCmd('style ntbase sphere2', true);
         });
 
         me.myEventCls.onIds("#" + me.pre + "mn3_ntbaseNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setStyle('ntbase', 'nothing');
            thisClass.setLogCmd('style ntbase nothing', true);
         });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclCartoon", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'nucleotide cartoon');
           thisClass.setLogCmd('style nucleotides nucleotide cartoon', true);
       });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclBackbone", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'backbone');
           thisClass.setLogCmd('style nucleotides backbone', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclSchematic", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'schematic');
           thisClass.setLogCmd('style nucleotides schematic', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclPhos", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'o3 trace');
           thisClass.setLogCmd('style nucleotides o3 trace', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclLines", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'lines');
           thisClass.setLogCmd('style nucleotides lines', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclStick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'stick');
           thisClass.setLogCmd('style nucleotides stick', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclBallstick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'ball and stick');
           thisClass.setLogCmd('style nucleotides ball and stick', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'sphere');
           thisClass.setLogCmd('style nucleotides sphere', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_nuclNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('nucleotides', 'nothing');
           thisClass.setLogCmd('style nucleotides nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligLines", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'lines');
           thisClass.setLogCmd('style chemicals lines', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligStick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'stick');
           thisClass.setLogCmd('style chemicals stick', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligBallstick", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'ball and stick');
           thisClass.setLogCmd('style chemicals ball and stick', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligSchematic", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'schematic');
           thisClass.setLogCmd('style chemicals schematic', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'sphere');
           thisClass.setLogCmd('style chemicals sphere', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ligNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('chemicals', 'nothing');
           thisClass.setLogCmd('style chemicals nothing', true);
        });


        me.myEventCls.onIds("#" + me.pre + "mn3_glycansCartYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bGlycansCartoon = true;
           ic.drawCls.draw();
           thisClass.setLogCmd('glycans cartoon yes', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn3_glycansCartNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bGlycansCartoon = false;
           ic.drawCls.draw();
           thisClass.setLogCmd('glycans cartoon no', true);
        });


        me.myEventCls.onIds("#" + me.pre + "mn3_hydrogensYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.showInterCls.showHydrogens();
           ic.drawCls.draw();
           thisClass.setLogCmd('hydrogens', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_hydrogensNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.showInterCls.hideHydrogens();
           ic.drawCls.draw();
           thisClass.setLogCmd('set hydrogens off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ionsSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('ions', 'sphere');
           thisClass.setLogCmd('style ions sphere', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ionsDot", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('ions', 'dot');
           thisClass.setLogCmd('style ions dot', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_ionsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('ions', 'nothing');
           thisClass.setLogCmd('style ions nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_waterSphere", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('water', 'sphere');
           thisClass.setLogCmd('style water sphere', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_waterDot", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('water', 'dot');
           thisClass.setLogCmd('style water dot', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_waterNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setStyle('water', 'nothing');
           thisClass.setLogCmd('style water nothing', true);
        });

    }

    clickMenu4() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 4
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSpectrum", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'spectrum');
           thisClass.setLogCmd('color spectrum', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSpectrumChain", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'spectrum for chains');
           thisClass.setLogCmd('color spectrum for chains', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrSpectrumAcrossSets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
             thisClass.SetChainsAdvancedMenu();
             let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
             if($("#" + me.pre + "atomsCustomColorSpectrumAcross").length) {
                 $("#" + me.pre + "atomsCustomColorSpectrumAcross").html(definedAtomsHtml);
             }

             if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_colorspectrumacrosssets', 'Please select sets to apply spectrum color for sets');
             $("#" + me.pre + "atomsCustomColorSpectrumAcross").resizable();
         });

         me.myEventCls.onIds("#" + me.pre + "mn4_clrSpectrumSets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
             thisClass.SetChainsAdvancedMenu();
             let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
             if($("#" + me.pre + "atomsCustomColorSpectrum").length) {
                 $("#" + me.pre + "atomsCustomColorSpectrum").html(definedAtomsHtml);
             }

             if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_colorspectrumbysets', 'Please select sets to apply spectrum color for residues');
             $("#" + me.pre + "atomsCustomColorSpectrum").resizable();
         });

         me.myEventCls.onIds("#" + me.pre + "mn4_clrRainbowAcrossSets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
             thisClass.SetChainsAdvancedMenu();
             let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
             if($("#" + me.pre + "atomsCustomColorRainbowAcross").length) {
                 $("#" + me.pre + "atomsCustomColorRainbowAcross").html(definedAtomsHtml);
             }

             if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_colorrainbowacrosssets', 'Please select sets to apply rainbow color for sets');
             $("#" + me.pre + "atomsCustomColorRainbowAcross").resizable();
         });

         me.myEventCls.onIds("#" + me.pre + "mn4_clrRainbowSets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
             thisClass.SetChainsAdvancedMenu();
             let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
             if($("#" + me.pre + "atomsCustomColorRainbow").length) {
                 $("#" + me.pre + "atomsCustomColorRainbow").html(definedAtomsHtml);
             }

             if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_colorrainbowbysets', 'Please select sets to apply rainbow color for residues');
             $("#" + me.pre + "atomsCustomColorRainbow").resizable();
         });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrRainbow", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'rainbow');
           thisClass.setLogCmd('color rainbow', true);
        });
        me.myEventCls.onIds(["#" + me.pre + "mn4_clrRainbowChain", "#" + me.pre + "tool_clrRainbowChain"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'rainbow for chains');
           thisClass.setLogCmd('color rainbow for chains', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn4_clrChain", "#" + me.pre + "tool_clrChain"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'chain');
           thisClass.setLogCmd('color chain', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn4_clrStructure", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.setOptionCls.setOption('color', 'structure');
            thisClass.setLogCmd('color structure', true);
         });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrdomain", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'domain');
           thisClass.setLogCmd('color domain', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrsets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'defined sets');
           thisClass.setLogCmd('color defined sets', true);
        });


        me.myEventCls.onIds(["#" + me.pre + "mn4_clrSSGreen", "#" + me.pre + "tool_clrSSGreen"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.sheetcolor = 'green';
           ic.setOptionCls.setOption('color', 'secondary structure green');
           thisClass.setLogCmd('color secondary structure green', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrSSYellow", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.sheetcolor = 'yellow';
           ic.setOptionCls.setOption('color', 'secondary structure yellow');
           thisClass.setLogCmd('color secondary structure yellow', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrSSSpectrum", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'secondary structure spectrum');
           thisClass.setLogCmd('color secondary structure spectrum', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrResidue", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 2;
            ic.setOptionCls.setOption('color', 'residue');
            thisClass.setLogCmd('color residue', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrResidueCustom", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 2;
            me.htmlCls.dialogCls.openDlg('dl_rescolorfile', 'Please input the file on residue colors');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_rescolorfile", "click", function(e) { let ic = me.icn3d; 
           e.preventDefault();

           if(!me.cfg.notebook) dialog.dialog( "close" );
           let file = $("#" + me.pre + "rescolorfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = function(e) {
               let dataStrTmp = e.target.result; // or = reader.result;
               let dataStr = dataStrTmp.replace(/#/g, "");
               ic.customResidueColors = JSON.parse(dataStr);
               for(let res in ic.customResidueColors) {
                   ic.customResidueColors[res.toUpperCase()] = me.parasCls.thr("#" + ic.customResidueColors[res]);
               }
               ic.setOptionCls.setOption('color', 'residue custom');
               thisClass.setLogCmd('color residue custom | ' + dataStr, true);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_customcolorfile", "click", function(e) { let ic = me.icn3d; 
           e.preventDefault();

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.startColor = $("#" + me.pre + "startColor").val();
           ic.midColor = $("#" + me.pre + "midColor").val();
           ic.endColor = $("#" + me.pre + "endColor").val();

           let legendHtml = thisClass.setLegendHtml();
           //$("#" + me.pre + "legend").html(legendHtml).show();
           $("#" + me.pre + "dl_legend_html").html(legendHtml);
           me.htmlCls.dialogCls.openDlg('dl_legend', 'Color range');

           ic.addTrackCls.setCustomFile('color', ic.startColor, ic.midColor, ic.endColor);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_customref", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
 
            me.htmlCls.dialogCls.openDlg('dl_customref', 'Set custom reference numbers');
         });

        me.myEventCls.onIds("#" + me.pre + "reload_customreffile", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
 
            if(!me.cfg.notebook) dialog.dialog( "close" );
            
            let file = $("#" + ic.pre + "cstreffile")[0].files[0];
            if(!file) {
                alert("Please select a file before clicking 'Apply'");
            }
            else {
                me.utilsCls.checkFileAPI();
                let reader = new FileReader();
                reader.onload = async function(e) {
                    let dataStr = e.target.result; // or = reader.result;
                    await ic.refnumCls.parseCustomRefFile(dataStr);

                    dataStr = dataStr.replace(/\r/g, '').replace(/\n/g, '\\n');

                    thisClass.setLogCmd('custom refnum | ' + dataStr, true);
                }
                reader.readAsText(file);
            }
        }); 

        me.myEventCls.onIds("#" + me.pre + "remove_legend", "click", function(e) { let ic = me.icn3d; 
           e.preventDefault();

           $("#" + me.pre + "legend").hide();

           thisClass.setLogCmd('remove legend', true);
        });
        me.myEventCls.onIds("#" + me.pre + "reload_customtubefile", "click", function(e) { let ic = me.icn3d; 
           e.preventDefault();

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.addTrackCls.setCustomFile('tube');
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrCharge", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 3;
            ic.setOptionCls.setOption('color', 'charge');
            thisClass.setLogCmd('color charge', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrHydrophobic", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 4; 
            ic.setOptionCls.setOption('color', 'hydrophobic');
            thisClass.setLogCmd('color hydrophobic', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrNormalizedHP", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 4;
            ic.setOptionCls.setOption('color', 'normalized hydrophobic');
            thisClass.setLogCmd('color normalized hydrophobic', true);
        });


        me.myEventCls.onIds(["#" + me.pre + "mn4_clrAtom", "#" + me.pre + "tool_clrAtom"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 1;
            ic.setOptionCls.setOption('color', 'atom');
            thisClass.setLogCmd('color atom', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrBfactor", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 5;
            ic.setOptionCls.setOption('color', 'b factor');
            thisClass.setLogCmd('color b factor', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrConfidence", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 6;
            ic.setOptionCls.setOption('color', 'confidence');
            thisClass.setLogCmd('color confidence', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrIgstrand", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 6;
            ic.setOptionCls.setOption('color', 'ig strand');
            thisClass.setLogCmd('color ig strand', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrIgproto", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            //ic.legendClick = 6;
            ic.setOptionCls.setOption('color', 'ig protodomain');
            thisClass.setLogCmd('color ig protodomain', true);
        });


        me.myEventCls.onIds("#" + me.pre + "mn4_clrArea", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_colorbyarea', "Color based on residue's solvent accessibility");
        });
        me.myEventCls.onIds("#" + me.pre + "applycolorbyarea", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.midpercent = $("#" + me.pre + 'midpercent').val();
            ic.setOptionCls.setOption('color', 'area');
            thisClass.setLogCmd('color area | ' + ic.midpercent, true);

        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrBfactorNorm", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'b factor percentile');
           thisClass.setLogCmd('color b factor percentile', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrIdentity", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'identity');
           thisClass.setLogCmd('color identity', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrConserved", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('color', 'conservation');
           thisClass.setLogCmd('color conservation', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrCustom", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_clr', 'Color picker');
        });

        $(document).on("click", ".icn3d-color-rad-text", function(e) { let ic = me.icn3d; 
          e.stopImmediatePropagation();
          //e.preventDefault();
          let color = $(this).attr('color');
          ic.setOptionCls.setOption("color", color);
          thisClass.setLogCmd("color " + color, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrSave", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.saveColor();
           thisClass.setLogCmd('save color', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn4_clrApplySave", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.applySavedColor();
           thisClass.setLogCmd('apply saved color', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_styleSave", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.saveStyle();
           thisClass.setLogCmd('save style', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_styleApplySave", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.applySavedStyle();
           thisClass.setLogCmd('apply saved style', true);
        });

    }

    clickMenu5() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 5
        me.myEventCls.onIds("#" + me.pre + "mn5_neighborsYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = true;
           ic.applyMapCls.removeLastSurface();
           ic.applyMapCls.applySurfaceOptions();
           if(ic.bRender) ic.drawCls.render();
           thisClass.setLogCmd('set surface neighbors on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_neighborsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = false;
           ic.applyMapCls.removeLastSurface();
           ic.applyMapCls.applySurfaceOptions();
           if(ic.bRender) ic.drawCls.render();
           thisClass.setLogCmd('set surface neighbors off', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn5_surfaceVDW", "#" + me.pre + "tool_surfaceVDW"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'Van der Waals surface');
           thisClass.setLogCmd('set surface Van der Waals surface', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceSAS", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'solvent accessible surface');
           thisClass.setLogCmd('set surface solvent accessible surface', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceMolecular", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'molecular surface');
           thisClass.setLogCmd('set surface molecular surface', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceVDWContext", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'Van der Waals surface with context');
           thisClass.setLogCmd('set surface Van der Waals surface with context', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceSASContext", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'solvent accessible surface with context');
           thisClass.setLogCmd('set surface solvent accessible surface with context', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceMolecularContext", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'molecular surface with context');
           thisClass.setLogCmd('set surface molecular surface with context', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('surface', 'nothing');
           thisClass.setLogCmd('set surface nothing', true);
        });

        $(document).on("click", "." + me.pre + "mn5_opacity", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.transparentRenderOrder = false;

            let value = $(this).attr('v');
           ic.setOptionCls.setOption('opacity', value);
           thisClass.setLogCmd('set surface opacity ' + value, true);
        });

        $(document).on("click", "." + me.pre + "mn5_opacityslow", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.transparentRenderOrder = true;

            let value = $(this).attr('v');
            ic.setOptionCls.setOption('opacity', value);
            thisClass.setLogCmd('set surface2 opacity ' + value, true);
         });

        me.myEventCls.onIds("#" + me.pre + "mn5_wireframeYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('wireframe', 'yes');
           thisClass.setLogCmd('set surface wireframe on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_wireframeNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('wireframe', 'no');
           thisClass.setLogCmd('set surface wireframe off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_elecmap2fofc", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_elecmap2fofc', '2Fo-Fc Electron Density Map');
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_elecmapfofc", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_elecmapfofc', 'Fo-Fc Electron Density Map');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn5_elecmapNo", "#" + me.pre + "elecmapNo2", "#" + me.pre + "elecmapNo3", "#" + me.pre + "elecmapNo4", "#" + me.pre + "elecmapNo5"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('map', 'nothing');
           thisClass.setLogCmd('setoption map nothing', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphimapNo", "#" + me.pre + "phimapNo", "#" + me.pre + "phiurlmapNo", "#" + me.pre + "mn1_phimapNo"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('phimap', 'nothing');
           thisClass.setLogCmd('setoption phimap nothing', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphimapNo2", "#" + me.pre + "phimapNo2", "#" + me.pre + "phiurlmapNo2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //ic.setOptionCls.setOption('surface', 'nothing');
           //thisClass.setLogCmd('set surface nothing', true);
           ic.setOptionCls.setOption('phisurface', 'nothing');
           thisClass.setLogCmd('setoption phisurface nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "applymap2fofc", "click", async function(e) { let ic = me.icn3d; 
           e.preventDefault();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let sigma2fofc = parseFloat($("#" + me.pre + "sigma2fofc" ).val());
           let type = '2fofc';
           await ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigma2fofc);
           //ic.setOptionCls.setOption('map', '2fofc');
           thisClass.setLogCmd('set map 2fofc sigma ' + sigma2fofc, true);
        });

        me.myEventCls.onIds("#" + me.pre + "applymapfofc", "click", async function(e) { let ic = me.icn3d; 
           e.preventDefault();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let sigmafofc = parseFloat($("#" + me.pre + "sigmafofc" ).val());
           let type = 'fofc';
           await ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigmafofc);
           //ic.setOptionCls.setOption('map', 'fofc');
           thisClass.setLogCmd('set map fofc sigma ' + sigmafofc, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_mapwireframeYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //ic.dsn6ParserCls.dsn6Parser(ic.inputid);
           ic.setOptionCls.setOption('mapwireframe', 'yes');
           thisClass.setLogCmd('set map wireframe on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_mapwireframeNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('mapwireframe', 'no');
           thisClass.setLogCmd('set map wireframe off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_emmap", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_emmap', 'EM Density Map');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn5_emmapNo", "#" + me.pre + "emmapNo2"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('emmap', 'nothing');
           thisClass.setLogCmd('setoption emmap nothing', true);
        });

        me.myEventCls.onIds("#" + me.pre + "applyemmap", "click", async function(e) { let ic = me.icn3d; 
           e.preventDefault();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let empercentage = parseFloat($("#" + me.pre + "empercentage" ).val());
           let type = 'em';
           //ic.emd = 'emd-3906';

           await ic.densityCifParserCls.densityCifParser(ic.inputid, type, empercentage, ic.emd);
           thisClass.setLogCmd('set emmap percentage ' + empercentage, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_emmapwireframeYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //ic.dsn6ParserCls.dsn6Parser(ic.inputid);
           ic.setOptionCls.setOption('emmapwireframe', 'yes');
           thisClass.setLogCmd('set emmap wireframe on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_emmapwireframeNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('emmapwireframe', 'no');
           thisClass.setLogCmd('set emmap wireframe off', true);
        });

    }

    clickMenu6() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 6
        me.myEventCls.onIds("#" + me.pre + "mn6_assemblyYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAssembly = true;
           thisClass.setLogCmd('set assembly on', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_assemblyNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAssembly = false;
           thisClass.setLogCmd('set assembly off', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_igrefYes", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            thisClass.setLogCmd('ig refnum on', true);
            await ic.refnumCls.showIgRefNum();

            // if(ic.bShowRefnum) {
            //    ic.opts.color = 'ig strand';
            //    ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
   
            //    ic.selectionCls.selectAll_base();
            //    ic.hlUpdateCls.updateHlAll();
            //    ic.drawCls.draw();
            // }
         });

        me.myEventCls.onIds("#" + me.pre + "mn6_igrefTpl", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_igrefTpl', 'Choose an Ig template');
         });

        me.myEventCls.onIds("#" + me.pre + "mn6_igrefTpl_apply", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
                  
            let template = $("#" + me.pre + "igrefTpl").val();
            thisClass.setLogCmd('ig template ' + template, true);
            await ic.refnumCls.showIgRefNum(template);
         });

         me.myEventCls.onIds("#" + me.pre + "mn6_igrefNo", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
            thisClass.setLogCmd('ig refnum off', true);
            await ic.refnumCls.hideIgRefNum();

            ic.opts.color = 'chain';
            ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

            ic.selectionCls.selectAll_base();
            ic.hlUpdateCls.updateHlAll();
            ic.drawCls.draw();
         });


        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelAtoms", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.residueLabelsCls.addAtomLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add atom labels', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelElements", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.residueLabelsCls.addAtomLabels(ic.hAtoms, true);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add element labels', true);
           ic.drawCls.draw();
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelResidues", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.residueLabelsCls.addResidueLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add residue labels', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelResnum", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.residueLabelsCls.addResidueLabels(ic.hAtoms, undefined, undefined, true);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add residue number labels', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelRefnum", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
         ic.residueLabelsCls.addResidueLabels(ic.hAtoms, undefined, undefined, undefined, true);
         ic.selectionCls.saveSelectionIfSelected();
         thisClass.setLogCmd('add reference number labels', true);
         ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelChains", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.analysisCls.addChainLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add chain labels', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelTermini", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.analysisCls.addTerminiLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add terminal labels', true);
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_addlabel', 'Add custom labels by selection');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelSelection", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_addlabelselection', 'Add custom labels by the selected');
        });

         me.myEventCls.onIds("#" + me.pre + "mn6_labelColor", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_labelColor', 'Change color for all labels');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn2_saveselection","#" + me.pre + "tool_saveselection"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_saveselection', 'Save the selected');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_addlabelNo", "#" + me.pre + "removeLabels"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.labelcolor = undefined;
            ic.pickpair = false;
           //ic.labels['residue'] = [];
           //ic.labels['custom'] = [];
           let select = "set labels off";
           thisClass.setLogCmd(select, true);
           for(let name in ic.labels) {
               //if(name === 'residue' || name === 'custom') {
                   ic.labels[name] = [];
               //}
           }
           ic.drawCls.draw();
        });

        $(document).on("click", "." + me.pre + "mn6_labelscale", function(e) { let ic = me.icn3d; //e.preventDefault();
           let value = $(this).attr('v');
           ic.labelScale = value;
           ic.drawCls.draw();
           thisClass.setLogCmd('set label scale ' + value, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_distanceYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_distance', 'Measure the distance of atoms');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
           ic.bMeasureDistance = true;
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_distTwoSets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_disttwosets', 'Measure the distance between two sets');

            thisClass.setSetsMenus('atomsCustomDist');

           ic.bMeasureDistance = true;
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_distManySets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_distmanysets', 'Measure the pairwise distance among many sets');

            thisClass.setSetsMenus('atomsCustomDistTable');

           ic.bMeasureDistance = true;
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_distanceNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pickpair = false;
           let select = "set lines off";
           thisClass.setLogCmd(select, true);
           ic.labels['distance'] = [];
           ic.lines['distance'] = [];
           ic.distPnts = [];
           ic.pk = 2;
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_cartoonshape", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_cartoonshape', 'Draw cartoon for a set');

            let bOneset = true;
            thisClass.setSetsMenus('cartoonshape', bOneset);

           ic.bCartoonshape = true;
        });

        me.myEventCls.onIds("#" + me.pre + "mn5_linebtwsets", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_linebtwsets', 'Draw a line between two sets');

            thisClass.setSetsMenus('linebtwsets');

           ic.bLinebtwsets = true;
        });


        me.myEventCls.onIds(["#" + me.pre + "mn2_selectedcenter", "#" + me.pre + "zoomin_selection", "#" + me.pre + "tool_selectedcenter"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //thisClass.setLogCmd('zoom selection', true);
           ic.transformCls.zoominSelection();
           ic.drawCls.draw();
           thisClass.setLogCmd('zoom selection', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_center", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //thisClass.setLogCmd('center selection', true);
           ic.applyCenterCls.centerSelection();
           ic.drawCls.draw();
           thisClass.setLogCmd('center selection', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_resetOrientation", "#" + me.pre + "resetOrientation", "#" + me.pre + "tool_resetOrientation"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //thisClass.setLogCmd('reset orientation', true);
           ic.transformCls.resetOrientation();
           //ic.setColorCls.applyOriginalColor();
           ic.drawCls.draw();
           thisClass.setLogCmd('reset orientation', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_chemicalbindingshow", "#" + me.pre + "chemicalbindingshow"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('chemicalbinding', 'show');
           thisClass.setLogCmd('set chemicalbinding show', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_chemicalbindinghide", "#" + me.pre + "chemicalbindinghide"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('chemicalbinding', 'hide');
           thisClass.setLogCmd('set chemicalbinding hide', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_sidebyside", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           if(ic.bInputfile) {
                alert("Side-by-Side does NOT work when the input is from a local file.");
                return;
           }

           let bSidebyside = true;
           let url = ic.shareLinkCls.shareLinkUrl(undefined);
           //if(url.indexOf('http') !== 0) {
           //    alert("The url is more than 4000 characters and may not work.");
           //}
           //else {
               url = url.replace("full.html", "full2.html");
               url += '&closepopup=1';
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(url, urlTarget);
               thisClass.setLogCmd('side by side | ' + url, true);
           //}
        });


        $(document).on("click", "." + me.pre + "mn6_rotate", function(e) { let ic = me.icn3d; //e.preventDefault();
           let value = $(this).attr('v').toLowerCase();
           let direction = value.split(' ')[1];

           thisClass.setLogCmd(value, true);
           ic.bStopRotate = false;
           ic.transformCls.rotateCount = 0;
           ic.transformCls.rotateCountMax = 6000;
           ic.ROT_DIR = direction;
           ic.resizeCanvasCls.rotStruc(direction);
        });

        $(document).on("click", "." + me.pre + "mn6_rotate90", function(e) { let ic = me.icn3d; //e.preventDefault();
          let value = $(this).attr('v').toLowerCase();
          let direction = value.split('-')[0];

          thisClass.setLogCmd(value, true);
          let axis;
          if(direction == 'x') {
              axis = new THREE.Vector3(1,0,0);
          }
          else if(direction == 'y') {
              axis = new THREE.Vector3(0,1,0);
          }
          else if(direction == 'z') {
              axis = new THREE.Vector3(0,0,1);
          }
          let angle = 0.5 * Math.PI;
          ic.transformCls.setRotation(axis, angle);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_cameraPers", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('camera', 'perspective');
           thisClass.setLogCmd('set camera perspective', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_cameraOrth", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('camera', 'orthographic');
           thisClass.setLogCmd('set camera orthographic', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdBlack", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setStyleCls.setBackground('black');
        });

        me.myEventCls.onIds("#" + me.pre + "tool_bkgd", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            if(ic.opts['background'] == 'black') {
                ic.setStyleCls.setBackground('white');
            }
            else {
                ic.setStyleCls.setBackground('black');
            }
         });

        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdGrey", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setStyleCls.setBackground('grey');
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_bkgdWhite", "#" + me.pre + "tool_bkgdWhite"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setStyleCls.setBackground('white');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdTransparent", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setStyleCls.setBackground('transparent');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showfogYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //ic.setOptionCls.setOption('fog', 'yes');
           ic.opts['fog'] = 'yes';
           ic.fogCls.setFog(true);
           ic.drawCls.draw();
           thisClass.setLogCmd('set fog on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showfogNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           //ic.setOptionCls.setOption('fog', 'no');
           ic.opts['fog'] = 'no';
           ic.fogCls.setFog(true);
           ic.drawCls.draw();
           thisClass.setLogCmd('set fog off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showslabYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('slab', 'yes');
           thisClass.setLogCmd('set slab on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showslabNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('slab', 'no');
           thisClass.setLogCmd('set slab off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.setOptionCls.setOption('axis', 'yes');
           thisClass.setLogCmd('set axis on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisSel", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pc1 = true;

           ic.axesCls.setPc1Axes();
           thisClass.setLogCmd('set pc1 axis', true);
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.pc1 = false;
           ic.axes = [];

           ic.setOptionCls.setOption('axis', 'no');

           thisClass.setLogCmd('set axis off', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_symmetry", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAxisOnly = false;
           await ic.symdCls.retrieveSymmetry(Object.keys(ic.structures)[0]);
           //me.htmlCls.dialogCls.openDlg('dl_symmetry', 'Symmetry');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_symd", "click", async function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAxisOnly = false;
           await ic.symdCls.retrieveSymd();
           ic.bSymd = true;

           thisClass.setLogCmd('symd symmetry', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_clear_sym", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.symdArray = [];
           ic.drawCls.draw();
           thisClass.setLogCmd('clear symd symmetry', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_axes_only", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAxisOnly = true;
           ic.drawCls.draw();
           thisClass.setLogCmd('show axis', true);
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_area", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            ic.analysisCls.calculateArea();
            thisClass.setLogCmd('area', true);
        });

        me.myEventCls.onIds("#" + me.pre + "applysymmetry", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.bAxisOnly = false;

           let title = $("#" + me.pre + "selectSymmetry" ).val();

           ic.symmetrytitle =(title === 'none') ? undefined : title;
           //if(title !== 'none') ic.applySymmetry(title);
           ic.drawCls.draw();
           thisClass.setLogCmd('symmetry ' + title, true);
        });
        me.myEventCls.onIds("#" + me.pre + "clearsymmetry", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let title = 'none';
           ic.symmetrytitle = undefined;
           ic.drawCls.draw();
           thisClass.setLogCmd('symmetry ' + title, true);
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_hbondsYes", "#" + me.pre + "hbondsYes"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            thisClass.SetChainsAdvancedMenu();

            let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
            if($("#" + me.pre + "atomsCustomHbond").length) {
                $("#" + me.pre + "atomsCustomHbond").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomHbond2").length) {
                $("#" + me.pre + "atomsCustomHbond2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
            }
           me.htmlCls.dialogCls.openDlg('dl_hbonds', 'Hydrogen bonds/interactions between two sets of atoms');
           ic.bHbondCalc = false;
           //thisClass.setLogCmd('set calculate hbond false', true);
           $("#" + me.pre + "atomsCustomHbond").resizable();
           $("#" + me.pre + "atomsCustomHbond2").resizable();
        });

        me.myEventCls.onIds(["#" + me.pre + "mn6_contactmap"], "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            me.htmlCls.dialogCls.openDlg('dl_contact', 'Set contact map');
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_hbondsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.showInterCls.hideHbondsContacts();
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let select = "stabilizer";
           ic.threeDPrintCls.addStabilizer();
           ic.threeDPrintCls.prepareFor3Dprint();
           //ic.drawCls.draw();
           thisClass.setLogCmd(select, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let select = "set stabilizer off";
           thisClass.setLogCmd(select, true);
           ic.threeDPrintCls.hideStabilizer();
           ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerOne", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_stabilizer', 'Add One Stabilizer');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerRmOne", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_stabilizer_rm', 'Remove One Stabilizer');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_thicknessSet", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_thickness', 'Set Thickness for 3D Printing');
        });

        me.myEventCls.onIds("#" + me.pre + "mn3_setThickness", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           me.htmlCls.dialogCls.openDlg('dl_thickness2', 'Style Preferences');
        });


        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let select = "disulfide bonds";
           thisClass.setLogCmd(select, true);
           ic.showInterCls.showSsbonds();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsExport", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.viewInterPairsCls.exportSsbondPairs();
           thisClass.setLogCmd("export disulfide bond pairs", false);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.opts["ssbonds"] = "no";
           let select = "set disulfide bonds off";
           thisClass.setLogCmd(select, true);
           ic.lines['ssbond'] = [];
           ic.setOptionCls.setStyle('sidec', 'nothing');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsYes", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           let select = "cross linkage";
           thisClass.setLogCmd(select, true);
           //ic.bShowCrossResidueBond = true;
           //ic.setOptionCls.setStyle('proteins', 'lines')
           ic.showInterCls.showClbonds();
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsExport", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.viewInterPairsCls.exportClbondPairs();
           thisClass.setLogCmd("export cross linkage pairs", false);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsNo", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
           ic.opts["clbonds"] = "no";
           let select = "set cross linkage off";
           thisClass.setLogCmd(select, true);
           //ic.bShowCrossResidueBond = false;
           //ic.setOptionCls.setStyle('proteins', 'ribbon')
           ic.lines['clbond'] = [];
           ic.setOptionCls.setStyle('sidec', 'nothing');
        });


        $("#" + me.pre + "newvs2").on('submit', function() {
            // fill the pdbstr
            let pdbstr = ic.saveFileCls.getAtomPDB(ic.hAtoms);
            $("#" + me.pre + "pdbstr").val(pdbstr);

            return true;
        });

        $("#" + me.pre + "fssubmit").on('click', function() {
            let pdbstr = ic.saveFileCls.getAtomPDB(ic.hAtoms);
            let url = 'https://search.foldseek.com/api/ticket';


            let template = "<!doctype html>\n<head>\n<title>Loading Foldseek</title>\n<style>\n  body {\n    background-color: #121212;\n    color: #fff;\n    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    flex-wrap: wrap;\n    justify-content: center;\n    align-items: center;\n  }\n  .loader {\n    display: block;\n    width: 80px;\n    height: 80px;\n  }\n  .loader:after {\n    content: \" \";\n    display: block;\n    width: 64px;\n    height: 64px;\n    margin: 8px;\n    border-radius: 50%;\n    border: 6px solid #fff;\n    border-color: #fff transparent #fff transparent;\n    animation: loader 1.2s linear infinite;\n  }\n  @keyframes loader {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n</style>\n</head>\n<body>\n<div>Foldseek is loading...</div><div class=\"loader\"></div>\n</body>";

            let urlTarget = '_blank';
            let w = window.open('', urlTarget);
            w.document.body.innerHTML = template;

            $.ajax({
                url: url,
                type: 'POST',
                data: { 
                    q : pdbstr,
                    database: ["afdb50", "afdb-swissprot", "gmgcl_id", "pdb100", "afdb-proteome", "mgnify_esm30"],
                    mode: "3diaa"
                },
                dataType: 'text',
                success: function(data) {
                    w.location = 'https://search.foldseek.com/queue/' + JSON.parse(data).id;
                },
                error : function(xhr, textStatus, errorThrown ) {
                  console.log("Error in submitting data to Foldseek...");
                }
            });
        });

        me.myEventCls.onIds("#" + me.pre + "jn_copy", "click", function(e) { let ic = me.icn3d; //e.preventDefault();
            let text = $("#" + me.pre + "jn_commands").val();
            navigator.clipboard.writeText(text);
        });
    } 

    //Show the input command in log. If "bSetCommand" is true, the command will be saved in the state file as well.
    setLogCmd(str, bSetCommand, bAddLogs) {var me = this.icn3dui, ic = me.icn3d;
      if(str.trim() === '') return false;
      let pos = str.indexOf('|||');
      if(pos !== -1) str = str.substr(0, pos);
      let transformation = {}
      transformation.factor = ic._zoomFactor;
      transformation.mouseChange = ic.mouseChange;
      transformation.quaternion = {}
      transformation.quaternion._x = parseFloat(ic.quaternion._x).toPrecision(5);
      transformation.quaternion._y = parseFloat(ic.quaternion._y).toPrecision(5);
      transformation.quaternion._z = parseFloat(ic.quaternion._z).toPrecision(5);
      transformation.quaternion._w = parseFloat(ic.quaternion._w).toPrecision(5);
      if(bSetCommand) {
          // save the command only when it's not a history command, i.e., not in the process of going back and forth
          if(ic.bAddCommands) {
              // If a new command was called, remove the forward commands and push to the command array
              if(ic.STATENUMBER < ic.commands.length) {
                  let oldCommand = ic.commands[ic.STATENUMBER - 1];
                  let pos = oldCommand.indexOf('|||');
                  if(pos != -1 && str !== oldCommand.substr(0, pos)) {
                    ic.commands = ic.commands.slice(0, ic.STATENUMBER);
                    ic.commands.push(str + '|||' + ic.transformCls.getTransformationStr(transformation));
                    ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                    ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                    if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                    ic.STATENUMBER = ic.commands.length;
                  }
              }
              else {
                ic.commands.push(str + '|||' + ic.transformCls.getTransformationStr(transformation));
                ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                if(ic.hAtoms !== undefined) ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                ic.STATENUMBER = ic.commands.length;
              }
          }
      }
      if(ic.bAddLogs && me.cfg.showcommand) {
          let finalStr = (bSetCommand) ? str : '[comment] ' + str;
          ic.logs.push(finalStr);
          // move cursor to the end, and scroll to the end
          $("#" + me.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ");
          if($("#" + me.pre + "logtext")[0]) {
            $("#" + me.pre + "logtext").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
          }
      }
      ic.setStyleCls.adjustIcon();
    }
}

export {ClickMenu}
