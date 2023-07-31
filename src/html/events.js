/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Events {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    // simplify setLogCmd from clickMenuCls
    setLogCmd(str, bSetCommand, bAddLogs) {var me = this.icn3dui, ic = me.icn3d;
        me.htmlCls.clickMenuCls.setLogCmd(str, bSetCommand, bAddLogs);
    }

    // ====== events start ===============
    fullScreenChange() { let me = this.icn3dui, ic = me.icn3d, thisClass = this; // event handler uses ".bind(inputAsThis)" to define "this"
        if(me.bNode) return;

        let fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
          || document.mozFullscreenElement || document.msFullscreenElement;
        if(!fullscreenElement) {
            thisClass.setLogCmd("exit full screen", false);
            ic.bFullscreen = false;
            me.utilsCls.setViewerWidthHeight(me, true);
            ic.applyCenterCls.setWidthHeight(me.htmlCls.WIDTH, me.htmlCls.HEIGHT);
            ic.drawCls.draw();
        }
    }

    convertUniProtInChains(alignment) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        let idArray = alignment.split(',');
        let alignment_final = '';
        for(let i = 0, il = idArray.length; i < il; ++i) {
            alignment_final += (idArray[i].indexOf('_') != -1) ? idArray[i] : idArray[i] + '_A'; // AlphaFold ID
            if(i < il - 1) alignment_final += ',';
        }

        return alignment_final;
    }

    async searchSeq() { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
       let select = $("#" + me.pre + "search_seq").val();
       if(isNaN(select) && select.indexOf('$') == -1 && select.indexOf('.') == -1 && select.indexOf(':') == -1 
       && select.indexOf('@') == -1) {
           select = ':' + select;
       }
       let commandname = select.replace(/\s+/g, '_');
       let commanddesc = commandname;
       await ic.selByCommCls.selectByCommand(select, commandname, commanddesc);
       thisClass.setLogCmd('select ' + select + ' | name ' + commandname, true);
    }

    async setRealign(alignType, bMsa) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        let nameArray = $("#" + me.pre + "atomsCustomRealignByStruct").val();
        if(nameArray.length > 0) {
            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        }

        me.cfg.aligntool = alignType;

        let alignStr = (alignType == 'vast') ? 'structure align' : 'tmalign';
        alignStr += (bMsa) ? ' msa' : '';

        if(nameArray.length > 0) {
            thisClass.setLogCmd("realign on " + alignStr + " | " + nameArray, true);
        }
        else {
            thisClass.setLogCmd("realign on " + alignStr, true);
        }

        if(bMsa) {
            // choose the first chain for each structure
            if(nameArray.length == 0) {
                nameArray = [];
                let structureHash = {};
                
                for(let chainid in ic.chains) {
                    let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]);
                    if(!structureHash.hasOwnProperty(atom.structure) && (ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial))) {
                        nameArray.push(chainid);
                        structureHash[atom.structure] = 1;
                    }
                }
            }

            await ic.realignParserCls.realignOnStructAlignMsa(nameArray);
        }
        else {
            await ic.realignParserCls.realignOnStructAlign();
        }
    }

    readFile(bAppend, files, index, dataStrAll) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        let file = files[index];
        let commandName = (bAppend) ? 'append': 'load';
        
        let reader = new FileReader();
        reader.onload = async function(e) {
            //++ic.loadedFileCnt;

            let dataStr = e.target.result; // or = reader.result;
            //thisClass.setLogCmd(commandName + ' pdb file ' + $("#" + me.pre + fileId).val(), false);
            thisClass.setLogCmd(commandName + ' pdb file ' + file.name, false);

            if(!bAppend) {
                ic.init();
            }
            else {
                ic.resetConfig();
                //ic.hAtoms = {};
                //ic.dAtoms = {};
                ic.bResetAnno = true;
                ic.bResetSets = true;
            }

            ic.bInputfile = true;
            ic.InputfileType = 'pdb';
            ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + dataStr : dataStr;

            dataStrAll = (index > 0) ? dataStrAll + '\nENDMDL\n' + dataStr : dataStr;

            if(Object.keys(files).length == index + 1) {
                if(bAppend) {
                    ic.hAtoms = {};
                    ic.dAtoms = {};
                }
                await ic.pdbParserCls.loadPdbData(dataStrAll, undefined, undefined, bAppend);
            }
            else {
                thisClass.readFile(bAppend, files, index + 1, dataStrAll);
            }
        }

        if (typeof file === "object") {
            reader.readAsText(file);
        }
    }

    async loadPdbFile(bAppend) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
       let fileId = (bAppend) ? 'pdbfile_app' : 'pdbfile';

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
       let files = $("#" + me.pre + fileId)[0].files;
       if(!files[0]) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
            me.htmlCls.setHtmlCls.fileSupport();
            ic.molTitle = "";

            //ic.fileCnt = Object.keys(files).length;
            //ic.loadedFileCnt = 0;

            ic.dataStrAll = '';

            this.readFile(bAppend, files, 0, '');

            if(bAppend) {
                if(ic.bSetChainsAdvancedMenu) ic.definedSetsCls.showSets();
                //if(ic.bSetChainsAdvancedMenu) ic.legendTableCls.showSets();
                if(ic.bAnnoShown) await ic.showAnnoCls.showAnnotations();
            }
       }
    }

    saveHtml(id) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        let html = '';
        html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/lib/jquery-ui-1.13.2.min.css">\n';
        html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/icn3d_full_ui.css">\n';
        html += $("#" + id).html();
        let idArray = id.split('_');
        let idStr =(idArray.length > 2) ? idArray[2] : id;
        let structureStr = Object.keys(ic.structures)[0];
        if(Object.keys(ic.structures).length > 1) structureStr += '-' + Object.keys(ic.structures)[1];
        ic.saveFileCls.saveFile(structureStr + '-' + idStr + '.html', 'html', encodeURIComponent(html));
    }

    setPredefinedMenu(id) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        if(Object.keys(ic.chains).length < 2) {
            alert("At least two chains are required for alignment...");
            return;
        }
        me.htmlCls.clickMenuCls.SetChainsAdvancedMenu();
        let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
        if($("#" + me.pre + id).length) {
            $("#" + me.pre + id).html(definedAtomsHtml);
        }
        
        $("#" + me.pre + id).resizable();
    }

    async launchMmdb(ids, bBiounit, hostUrl, bAppend) { let me = this.icn3dui, ic = me.icn3d, thisClass = this;
        if(!me.cfg.notebook) dialog.dialog( "close" );
        
        let flag = bBiounit ? 1 : 0;

        // remove space
        ids = ids.replace(/,/g, ' ').replace(/\s+/g, ',').trim();

        if(!ids) {
            alert("Please enter a list of PDB IDs or AlphaFold UniProt IDs...");
            return;
        }

        let idArray = ids.split(',');

        if(!bAppend) {
            if(idArray.length == 1 && (idArray[0].length == 4 || !isNaN(idArray[0])) ) {
                thisClass.setLogCmd("load mmdb" + flag + " " + ids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?mmdbid=' + ids + '&bu=' + flag, urlTarget);
            }
            else {
                thisClass.setLogCmd("load mmdbaf" + flag + " " + ids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?mmdbafid=' + ids + '&bu=' + flag, urlTarget);
            }
        }
        else {
            // single MMDB ID could show memebranes
            if(!ic.structures && idArray.length == 1 && (idArray[0].length == 4 || !isNaN(idArray[0])) ) {
                thisClass.setLogCmd("load mmdb" + flag + " " + ids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?mmdbid=' + ids + '&bu=' + flag, urlTarget);
            }
            else {
                me.cfg.mmdbafid = ids;
                me.cfg.bu = flag;

                ic.bMmdbafid = true;
                ic.inputid = (ic.inputid) ? ic.inputid + me.cfg.mmdbafid : me.cfg.mmdbafid;
                if(me.cfg.bu == 1) {
                    ic.loadCmd = 'load mmdbaf1 ' + me.cfg.mmdbafid;
                }
                else {
                    ic.loadCmd = 'load mmdbaf0 ' + me.cfg.mmdbafid;
                }
                me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);  

                let bStructures = (ic.structures && Object.keys(ic.structures).length > 0) ? true : false;

                await ic.chainalignParserCls.downloadMmdbAf(me.cfg.mmdbafid);   

                if(bStructures) {
                    if(ic.bSetChainsAdvancedMenu) ic.definedSetsCls.showSets();
                    if(ic.bAnnoShown) await ic.showAnnoCls.showAnnotations();
                }
            }
        }
    }

    //Hold all functions related to click events.
    allEventFunctions() { let me = this.icn3dui, ic = me.icn3d;
        let thisClass = this;

        if(me.bNode) return;

        let hostUrl = document.URL;
        let pos = hostUrl.indexOf("?");
        hostUrl = (pos == -1) ? hostUrl : hostUrl.substr(0, pos);

        // some URLs from VAST search are like https://www.ncbi.nlm.nih.gov/Structure/vast/icn3d/
        if(hostUrl == 'https://www.ncbi.nlm.nih.gov/Structure/vast/icn3d/') {
            hostUrl = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/';
        }

        ic.definedSetsCls.clickCustomAtoms();
        ic.definedSetsCls.clickCommand_apply();
        ic.definedSetsCls.clickModeswitch();

        ic.selectionCls.clickShow_selected();
        ic.selectionCls.clickHide_selected();

        ic.diagram2dCls.click2Ddgm();
        ic.cartoon2dCls.click2Dcartoon();
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
        me.myEventCls.onIds(["#" + me.pre + "back", "#" + me.pre + "mn6_back"], "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           thisClass.setLogCmd("back", false);
           await ic.resizeCanvasCls.back();
        });

        me.myEventCls.onIds(["#" + me.pre + "forward", "#" + me.pre + "mn6_forward"], "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           thisClass.setLogCmd("forward", false);
           await ic.resizeCanvasCls.forward();
        });

        me.myEventCls.onIds(["#" + me.pre + "fullscreen", "#" + me.pre + "mn6_fullscreen"], "click", function(e) { let ic = me.icn3d; // from expand icon for mobilemenu
           e.preventDefault();
           //me = ic.setIcn3dui($(this).attr('id'));
           thisClass.setLogCmd("enter full screen", false);
           ic.bFullscreen = true;
           me.htmlCls.WIDTH = $( window ).width();
           me.htmlCls.HEIGHT = $( window ).height();
           ic.applyCenterCls.setWidthHeight(me.htmlCls.WIDTH, me.htmlCls.HEIGHT);
           ic.drawCls.draw();
           ic.resizeCanvasCls.openFullscreen($("#" + me.pre + "canvas")[0]);
        });

        document.addEventListener('fullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.fullScreenChange.bind(this));
        document.addEventListener('msfullscreenchange', this.fullScreenChange.bind(this));


        me.myEventCls.onIds(["#" + me.pre + "toggle", "#" + me.pre + "mn2_toggle"], "click", function(e) { let ic = me.icn3d;
           //thisClass.setLogCmd("toggle selection", true);
           ic.selectionCls.toggleSelection();
           thisClass.setLogCmd("toggle selection", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrYellow", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("set highlight color yellow", true);
           ic.hColor = me.parasCls.thr(0xFFFF00);
           ic.matShader = ic.setColorCls.setOutlineColor('yellow');
           ic.drawCls.draw(); // required to make it work properly
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrGreen", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("set highlight color green", true);
           ic.hColor = me.parasCls.thr(0x00FF00);
           ic.matShader = ic.setColorCls.setOutlineColor('green');
           ic.drawCls.draw(); // required to make it work properly
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_clrRed", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("set highlight color red", true);
           ic.hColor = me.parasCls.thr(0xFF0000);
           ic.matShader = ic.setColorCls.setOutlineColor('red');
           ic.drawCls.draw(); // required to make it work properly
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleOutline", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("set highlight style outline", true);
           ic.bHighlight = 1;
           ic.hlUpdateCls.showHighlight();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleObject", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("set highlight style 3d", true);
           ic.bHighlight = 2;
           ic.hlUpdateCls.showHighlight();
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_hl_styleNone", "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.clearHighlight();
            thisClass.setLogCmd("clear selection", true);
        });

        me.myEventCls.onIds(["#" + me.pre + "alternate", "#" + me.pre + "mn2_alternate", "#" + me.pre + "alternate2"], "click", function(e) { let ic = me.icn3d;
           ic.bAlternate = true;
           ic.alternateCls.alternateStructures();
           ic.bAlternate = false;

           thisClass.setLogCmd("alternate structures", false);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_realignresbyres", "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_realignresbyres', 'Align multiple chains residue by residue');
        });

        me.myEventCls.onIds("#" + me.pre + "realignSelection", "click", function(e) { let ic = me.icn3d;
            if(Object.keys(ic.chains).length < 2) {
                alert("At least two chains are required for alignment...");
                return;
            }
            
           ic.realignParserCls.realign();
           thisClass.setLogCmd("realign", true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_realignonseqalign", "click", function(e) { let ic = me.icn3d;
            if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_realign', 'Please select chains to realign');

            thisClass.setPredefinedMenu('atomsCustomRealign');
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_realignonstruct", "click", function(e) { let ic = me.icn3d;
            if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_realignbystruct', 'Please select chains to realign');

            thisClass.setPredefinedMenu('atomsCustomRealignByStruct');
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_realigntwostru", "click", function(e) { let ic = me.icn3d;
            if(ic.bRender) me.htmlCls.dialogCls.openDlg('dl_realigntwostru', 'Please select structures to realign');

            thisClass.setPredefinedMenu('atomsCustomRealignByStruct2');
        });


        me.myEventCls.onIds("#" + me.pre + "applyRealign", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let nameArray = $("#" + me.pre + "atomsCustomRealign").val();
           if(nameArray.length > 0) {
               ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
           }

           await ic.realignParserCls.realignOnSeqAlign();

           if(nameArray.length > 0) {
               thisClass.setLogCmd("realign on seq align | " + nameArray, true);
           }
           else {
               thisClass.setLogCmd("realign on seq align", true);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "applyRealignByStruct", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            await thisClass.setRealign('vast', false);
         });

         me.myEventCls.onIds("#" + me.pre + "applyRealignByStruct_tmalign", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            await thisClass.setRealign('tmalign', false);
         });

         me.myEventCls.onIds("#" + me.pre + "applyRealignByStructMsa", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            await thisClass.setRealign('vast', true);
         });

         me.myEventCls.onIds("#" + me.pre + "applyRealignByStructMsa_tmalign", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            await thisClass.setRealign('tmalign', true);
         });

         me.myEventCls.onIds("#" + me.pre + "applyRealignByStruct_vastplus", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let nameArray = $("#" + me.pre + "atomsCustomRealignByStruct2").val();
            if(nameArray.length > 0) {
                ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
            }

            //me.cfg.aligntool = 'tmalign';

            await ic.vastplusCls.realignOnVastplus();

            if(nameArray.length > 0) {
                thisClass.setLogCmd("realign on vastplus | " + nameArray, true);
            }
            else {
                thisClass.setLogCmd("realign on vastplus", true);
            }
         });


        me.myEventCls.onIds("#" + me.pre + "applyColorSpectrumAcrossSets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let nameArray = $("#" + me.pre + "atomsCustomColorSpectrumAcross").val();
            if(nameArray.length == 0) {
                alert("Please select some sets");
                return;
            }

            let bSpectrum = true;
            ic.setColorCls.setColorAcrossSets(nameArray, bSpectrum);

            thisClass.setLogCmd("set color spectrum | " + nameArray, true);
        });

        me.myEventCls.onIds("#" + me.pre + "applyColorSpectrumBySets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let nameArray = $("#" + me.pre + "atomsCustomColorSpectrum").val();
            if(nameArray.length == 0) {
                alert("Please select some sets");
                return;
            }

            let bSpectrum = true;
            ic.setColorCls.setColorBySets(nameArray, bSpectrum);

            thisClass.setLogCmd("set residues color spectrum | " + nameArray, true);
        });

        me.myEventCls.onIds("#" + me.pre + "applyColorRainbowAcrossSets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let nameArray = $("#" + me.pre + "atomsCustomColorRainbowAcross").val();
            if(nameArray.length == 0) {
                alert("Please select some sets");
                return;
            }

            let bSpectrum = false;
            ic.setColorCls.setColorAcrossSets(nameArray, bSpectrum);

            thisClass.setLogCmd("set color rainbow | " + nameArray, true);
        });

        me.myEventCls.onIds("#" + me.pre + "applyColorRainbowBySets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let nameArray = $("#" + me.pre + "atomsCustomColorRainbow").val();
            if(nameArray.length == 0) {
                alert("Please select some sets");
                return;
            }

            let bSpectrum = false;
            ic.setColorCls.setColorBySets(nameArray, bSpectrum);

            thisClass.setLogCmd("set residues color rainbow | " + nameArray, true);
        });

        // other
        me.myEventCls.onIds("#" + me.pre + "anno_summary", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            ic.annotationCls.setAnnoViewAndDisplay('overview');
            thisClass.setLogCmd("set view overview", true);
        });
        me.myEventCls.onIds("#" + me.pre + "anno_details", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            ic.annotationCls.setAnnoViewAndDisplay('detailed view');
            thisClass.setLogCmd("set view detailed view", true);
        });

        me.myEventCls.onIds("#" + me.pre + "show_annotations", "click", async function(e) { let ic = me.icn3d;
            await ic.showAnnoCls.showAnnotations();
            thisClass.setLogCmd("view annotations", true);
        });

        me.myEventCls.onIds("#" + me.pre + "showallchains", "click", function(e) { let ic = me.icn3d;
           ic.annotationCls.showAnnoAllChains();
           thisClass.setLogCmd("show annotations all chains", true);
        });

        me.myEventCls.onIds("#" + me.pre + "show_alignsequences", "click", function(e) { let ic = me.icn3d;
             me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        });

        me.myEventCls.onIds(["#" + me.pre + "show_2ddgm", "#" + me.pre + "mn2_2ddgm"], "click", async function(e) { let ic = me.icn3d;
             me.htmlCls.dialogCls.openDlg('dl_2ddgm', '2D Diagram');
             await ic.viewInterPairsCls.retrieveInteractionData();
             thisClass.setLogCmd("view interactions", true);
        });

        me.myEventCls.onIds("#" + me.pre + "search_seq_button", "click", async function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           await thisClass.searchSeq();
        });

        me.myEventCls.onIds("#" + me.pre + "search_seq", "keyup", async function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               await thisClass.searchSeq();
           }
        });


        me.myEventCls.onIds("#" + me.pre + "reload_vastplus", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            thisClass.setLogCmd("vast+ search " + $("#" + me.pre + "vastpluspdbid").val(), false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open('https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=' + $("#" + me.pre + "vastpluspdbid").val(), urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_vast", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            thisClass.setLogCmd("vast search " + $("#" + me.pre + "vastpdbid").val() + "_" + $("#" + me.pre + "vastchainid").val(), false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open('https://www.ncbi.nlm.nih.gov/Structure/vast/vastsrv.cgi?pdbid=' + $("#" + me.pre + "vastpdbid").val() + '&chain=' + $("#" + me.pre + "vastchainid").val(), urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_foldseek", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            let alignment = $("#" + me.pre + "foldseekchainids").val();
            let alignment_final = thisClass.convertUniProtInChains(alignment);

            thisClass.setLogCmd("load chainalignment " + alignment_final, true);
            window.open(hostUrl + '?chainalign=' + alignment_final + '&aligntool=tmalign&showalignseq=1&bu=0', '_self');
         });

        me.myEventCls.onIds("#" + me.pre + "reload_mmtf", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?mmtfid=' + $("#" + me.pre + "mmtfid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mmtfid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?mmtfid=' + $("#" + me.pre + "mmtfid").val(), urlTarget);
           }
        });


        me.myEventCls.onIds("#" + me.pre + "reload_pdb", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?pdbid=' + $("#" + me.pre + "pdbid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "pdbid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?pdbid=' + $("#" + me.pre + "pdbid").val(), urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_af", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load af " + $("#" + me.pre + "afid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?afid=' + $("#" + me.pre + "afid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_afmap", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let afid = me.cfg.afid ? me.cfg.afid : $("#" + me.pre + "afid").val();

            thisClass.setLogCmd("set half pae map " + afid, true);
            
            await ic.contactMapCls.afErrorMap(afid);
        });
        me.myEventCls.onIds("#" + me.pre + "reload_afmapfull", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let afid = me.cfg.afid ? me.cfg.afid : $("#" + me.pre + "afid").val();

            thisClass.setLogCmd("set full pae map " + afid, true);
            
            await ic.contactMapCls.afErrorMap(afid, true);
        });

        me.myEventCls.onIds("#" + me.pre + "afid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load af " + $("#" + me.pre + "afid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?afid=' + $("#" + me.pre + "afid").val(), urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_opm", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load opm " + $("#" + me.pre + "opmid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?opmid=' + $("#" + me.pre + "opmid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "opmid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load opm " + $("#" + me.pre + "opmid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?opmid=' + $("#" + me.pre + "opmid").val(), urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_align_refined", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
            thisClass.setLogCmd("load alignment " + alignment + ' | parameters &atype=1&bu=1', false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?align=' + alignment + '&showalignseq=1&atype=1&bu=1', urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_align_ori", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
            thisClass.setLogCmd("load alignment " + alignment + ' | parameters &atype=0&bu=1', false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?align=' + alignment + '&showalignseq=1&atype=0&bu=1', urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_align_tmalign", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();
            thisClass.setLogCmd("load alignment " + alignment + ' | parameters &atype=2&bu=1', false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?align=' + alignment + '&showalignseq=1&atype=2&bu=1', urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_alignaf", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let alignment = $("#" + me.pre + "alignafid1").val() + "_A," + $("#" + me.pre + "alignafid2").val() + "_A";
            thisClass.setLogCmd("load chains " + alignment + " | residues | resdef ", false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?chainalign=' + alignment + '&resnum=&resdef=&showalignseq=1', urlTarget);
          });

        me.myEventCls.onIds("#" + me.pre + "reload_alignaf_tmalign", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let alignment = $("#" + me.pre + "alignafid1").val() + "_A," + $("#" + me.pre + "alignafid2").val() + "_A";
            thisClass.setLogCmd("load chains " + alignment + " | residues | resdef | align tmalign", false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?chainalign=' + alignment + '&aligntool=tmalign&resnum=&resdef=&showalignseq=1', urlTarget);
          });


        me.myEventCls.onIds("#" + me.pre + "reload_chainalign_asym", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );

           let alignment = $("#" + me.pre + "chainalignids").val();
           let alignment_final = thisClass.convertUniProtInChains(alignment);

           thisClass.setLogCmd("load chains " + alignment_final + " on asymmetric unit | residues | resdef ", false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?chainalign=' + alignment_final + '&resnum=&resdef=&showalignseq=1&bu=0', urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_chainalign_asym2", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
 
            let alignment = $("#" + me.pre + "chainalignids2").val();
            let alignment_final = thisClass.convertUniProtInChains(alignment);
            let resalign = $("#" + me.pre + "resalignids").val();
 
            thisClass.setLogCmd("load chains " + alignment_final + " on asymmetric unit | residues " + resalign + " | resdef ", false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?chainalign=' + alignment_final + '&resnum=' + resalign + '&resdef=&showalignseq=1&bu=0', urlTarget);
         });

         me.myEventCls.onIds("#" + me.pre + "reload_chainalign_asym3", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
 
            let alignment = $("#" + me.pre + "chainalignids3").val();
            let alignment_final = thisClass.convertUniProtInChains(alignment);

            let predefinedres = $("#" + me.pre + "predefinedres").val().trim().replace(/\n/g, ': ');
            if(predefinedres && alignment_final.split(',').length - 1 != predefinedres.split(': ').length) {
                alert("Please make sure the number of chains and the lines of predefined residues are the same...");
                return;
            }
 
            thisClass.setLogCmd("load chains " + alignment_final + " on asymmetric unit | residues | resdef " + predefinedres, false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?chainalign=' + alignment_final + '&resnum=&resdef=' + predefinedres + '&showalignseq=1&bu=0', urlTarget);
         });

         me.myEventCls.onIds("#" + me.pre + "reload_chainalign_asym4", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
 
            let alignment = $("#" + me.pre + "chainalignids4").val();
            let alignment_final = thisClass.convertUniProtInChains(alignment);

            let predefinedres = $("#" + me.pre + "predefinedres2").val().trim().replace(/\n/g, ': ');
            if(predefinedres && alignment_final.split(',').length - 1 != predefinedres.split(': ').length) {
                alert("Please make sure the number of chains and the lines of predefined residues are the same...");
                return;
            }

            me.cfg.resdef = predefinedres.replace(/:/gi, ';');

            let bRealign = true, bPredefined = true;
            let chainidArray = alignment_final.split(',');
            await ic.realignParserCls.realignChainOnSeqAlign(undefined, chainidArray, bRealign, bPredefined);
 
            thisClass.setLogCmd("realign predefined " + alignment_final + " " + predefinedres, true);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_chainalign_tmalign", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            let alignment = $("#" + me.pre + "chainalignids").val();
            let alignment_final = thisClass.convertUniProtInChains(alignment);
 
            thisClass.setLogCmd("load chains " + alignment_final + " on asymmetric unit | residues | resdef | align tmalign", false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?chainalign=' + alignment_final + '&aligntool=tmalign&resnum=&resdef=&showalignseq=1&bu=0', urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_3d", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let mutationids = $("#" + me.pre + "mutationids").val();
           //let idsource = $("#" + me.pre + "idsource").val();
           let idsource, pdbsource;
           if($("#" + me.pre + "type_mmdbid").is(":checked")) {
                idsource = 'mmdbid';
           }
           else {
                idsource = 'afid';
           }
           if($("#" + me.pre + "showin_currentpage").is(":checked")) {
                pdbsource = 'currentpage';
            }
            else {
                pdbsource = 'newpage';
            }

           if(pdbsource == 'currentpage') {
                let snp = mutationids;

                await ic.scapCls.retrieveScap(snp);
                thisClass.setLogCmd('scap 3d ' + snp, true);
                thisClass.setLogCmd("select displayed set", true);
           }
           else {
                let mmdbid = mutationids.substr(0, mutationids.indexOf('_'));           
                thisClass.setLogCmd("3d of mutation " + mutationids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?' + idsource + '=' + mmdbid + '&command=scap 3d ' + mutationids + '; select displayed set', urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_pdb", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let mutationids = $("#" + me.pre + "mutationids").val();
           //let idsource = $("#" + me.pre + "idsource").val();
           let idsource, pdbsource;
           if($("#" + me.pre + "type_mmdbid").is(":checked")) {
                idsource = 'mmdbid';
           }
           else {
                idsource = 'afid';
           }
           if($("#" + me.pre + "showin_currentpage").is(":checked")) {
                pdbsource = 'currentpage';
            }
            else {
                pdbsource = 'newpage';
            }

           if(pdbsource == 'currentpage') {
                let snp = mutationids;

                let bPdb = true;
                await ic.scapCls.retrieveScap(snp, undefined, bPdb);
                thisClass.setLogCmd('scap pdb ' + snp, true);
           }
           else {
                let mmdbid = mutationids.substr(0, mutationids.indexOf('_'));
                thisClass.setLogCmd("pdb of mutation " + mutationids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?' + idsource + '=' + mmdbid + '&command=scap pdb ' + mutationids + '; select displayed set', urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mutation_inter", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let mutationids = $("#" + me.pre + "mutationids").val();
           //let idsource = $("#" + me.pre + "idsource").val();
           let idsource, pdbsource;
           if($("#" + me.pre + "type_mmdbid").is(":checked")) {
                idsource = 'mmdbid';
           }
           else {
                idsource = 'afid';
           }
           if($("#" + me.pre + "showin_currentpage").is(":checked")) {
                pdbsource = 'currentpage';
            }
            else {
                pdbsource = 'newpage';
            }

           if(pdbsource == 'currentpage') {
                let snp = mutationids;

                let bInteraction = true;
                await ic.scapCls.retrieveScap(snp, bInteraction);
                thisClass.setLogCmd('scap interaction ' + snp, true);

                let idArray = snp.split('_'); //stru_chain_resi_snp
                let select = '.' + idArray[1] + ':' + idArray[2];
                let name = 'snp_' + idArray[1] + '_' + idArray[2];
                thisClass.setLogCmd("select " + select + " | name " + name, true);
                thisClass.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);
                thisClass.setLogCmd("adjust dialog dl_linegraph", true);
                thisClass.setLogCmd("select displayed set", true);
           }
           else {
                let mutationArray = mutationids.split(',');
                let residArray = [];
                for(let i = 0, il = mutationArray.length; i < il; ++i) {
                    let pos = mutationArray[i].lastIndexOf('_');
                    let resid = mutationArray[i].substr(0, pos);
                    residArray.push(resid);
                }

                let mmdbid = mutationids.substr(0, mutationids.indexOf('_'));

                // if no structures are loaded yet
                if(!ic.structures) {
                    ic.structures = {}
                    ic.structures[mmdbid] = 1;
                }
                let selectSpec = ic.resid2specCls.residueids2spec(residArray);

                thisClass.setLogCmd("interaction change of mutation " + mutationids, false);
                let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
                window.open(hostUrl + '?' + idsource + '=' + mmdbid + '&command=scap interaction ' + mutationids, urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mmcif", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?mmcifid=' + $("#" + me.pre + "mmcifid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "mmcifid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?mmcifid=' + $("#" + me.pre + "mmcifid").val(), urlTarget);
           }
        });


        me.myEventCls.onIds("#" + me.pre + "reload_mmdb", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           thisClass.setLogCmd("load mmdb1 " + $("#" + me.pre + "mmdbid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?mmdbid=' + $("#" + me.pre + "mmdbid").val() + '&bu=1', urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mmdb_asym", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            thisClass.setLogCmd("load mmdb0 " + $("#" + me.pre + "mmdbid").val(), false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?mmdbid=' + $("#" + me.pre + "mmdbid").val() + '&bu=0', urlTarget);
        });

         me.myEventCls.onIds("#" + me.pre + "reload_mmdbaf", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            let ids = $("#" + me.pre + "mmdbafid").val();
            thisClass.launchMmdb(ids, 1, hostUrl);
        });
 
         me.myEventCls.onIds("#" + me.pre + "reload_mmdbaf_asym", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            let ids = $("#" + me.pre + "mmdbafid").val();
            thisClass.launchMmdb(ids, 0, hostUrl);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mmdbaf_append", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            let ids = $("#" + me.pre + "mmdbafid").val();
            thisClass.launchMmdb(ids, 1, hostUrl, true);
        });
 
         me.myEventCls.onIds("#" + me.pre + "reload_mmdbaf_asym_append", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            let ids = $("#" + me.pre + "mmdbafid").val();
            thisClass.launchMmdb(ids, 0, hostUrl, true);
        });

        me.myEventCls.onIds("#" + me.pre + "mmdbid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               
               thisClass.setLogCmd("load mmdb1 " + $("#" + me.pre + "mmdbid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?mmdbid=' + $("#" + me.pre + "mmdbid").val() + '&bu=1', urlTarget);
              }
        });

        me.myEventCls.onIds("#" + me.pre + "mmdbafid", "keyup", function(e) { let ic = me.icn3d;
            if (e.keyCode === 13) {
                e.preventDefault();
                
                let ids = $("#" + me.pre + "mmdbafid").val();
                thisClass.launchMmdb(ids, 1, hostUrl);
               }
         });


        me.myEventCls.onIds("#" + me.pre + "reload_blast_rep_id", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let query_id = $("#" + me.pre + "query_id").val();
           let query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
           let blast_rep_id = $("#" + me.pre + "blast_rep_id").val();
           thisClass.setLogCmd("load seq_struct_ids " + query_id + "," + blast_rep_id, false);
           query_id =(query_id !== '' && query_id !== undefined) ? query_id : query_fasta;
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?from=icn3d&alg=blast&blast_rep_id=' + blast_rep_id
             + '&query_id=' + query_id
             + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
             + blast_rep_id + '; show selection', urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "run_esmfold", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );

            if($('#' + me.pre + 'dl_mmdbafid').hasClass('ui-dialog-content')) {
                $('#' + me.pre + 'dl_mmdbafid').dialog( 'close' );
            }

            let esmfold_fasta = $("#" + me.pre + "esmfold_fasta").val();
            let pdbid = 'stru--';

            if(esmfold_fasta.indexOf('>') != -1) { //FASTA with header
                let pos = esmfold_fasta.indexOf('\n');
                ic.esmTitle = esmfold_fasta.substr(1, pos - 1).trim();
                if(ic.esmTitle.indexOf('|') != -1) { // uniprot
                    let idArray = ic.esmTitle.split('|');
                    pdbid = (idArray.length > 2) ? idArray[1] : ic.esmTitle;
                }
                else { // NCBI
                    pdbid = (ic.esmTitle.indexOf(' ') != -1) ? ic.esmTitle.substr(0, ic.esmTitle.indexOf(' ')) : ic.esmTitle;
                }

                if(pdbid.length < 6) pdbid = pdbid.padEnd(6, '-');

                esmfold_fasta = esmfold_fasta.substr(pos + 1);
            }

            // remove new lines
            esmfold_fasta = esmfold_fasta.replace(/\s/g, '');

            if(esmfold_fasta.length > 400) {
                alert("Your sequence is larger than 400 characters. Please consider to split it as described at https://github.com/facebookresearch/esm/issues/21.");
                return;
            }

            let esmUrl = "https://api.esmatlas.com/foldSequence/v1/pdb/";
            let alertMess = 'Problem in returning PDB from ESMFold server...';
            thisClass.setLogCmd("Run ESMFold with the sequence " + esmfold_fasta, false);

            let esmData = await me.getAjaxPostPromise(esmUrl, esmfold_fasta, true, alertMess, undefined, true, 'text');
            
            ic.bResetAnno = true;
            
            ic.bInputfile = true;
            ic.InputfileType = 'pdb';
            ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + esmData : esmData;

            ic.bEsmfold = true;
            let bAppend = true;
            await ic.pdbParserCls.loadPdbData(esmData, pdbid, undefined, bAppend, undefined, undefined, undefined, ic.bEsmfold);
         });

        me.myEventCls.onIds("#" + me.pre + "reload_alignsw", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let query_id = $("#" + me.pre + "query_id").val();
            let query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
            let blast_rep_id = $("#" + me.pre + "blast_rep_id").val();
            thisClass.setLogCmd("load seq_struct_ids_smithwm " + query_id + "," + blast_rep_id, false);
            query_id =(query_id !== '' && query_id !== undefined) ? query_id : query_fasta;
            
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?from=icn3d&alg=smithwm&blast_rep_id=' + blast_rep_id
              + '&query_id=' + query_id
              + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
              + blast_rep_id + '; show selection', urlTarget);
         });

         me.myEventCls.onIds("#" + me.pre + "reload_alignswlocal", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let query_id = $("#" + me.pre + "query_id").val();
            let query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
            let blast_rep_id = $("#" + me.pre + "blast_rep_id").val();
            thisClass.setLogCmd("load seq_struct_ids_local_smithwm " + query_id + "," + blast_rep_id, false);
            query_id =(query_id !== '' && query_id !== undefined) ? query_id : query_fasta;
            
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?from=icn3d&alg=local_smithwm&blast_rep_id=' + blast_rep_id
              + '&query_id=' + query_id
              + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
              + blast_rep_id + '; show selection', urlTarget);
         });


        me.myEventCls.onIds("#" + me.pre + "reload_proteinname", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load protein " + $("#" + me.pre + "proteinname").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?protein=' + $("#" + me.pre + "proteinname").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_refseq", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            thisClass.setLogCmd("load refseq " + $("#" + me.pre + "refseqid").val(), false);
            let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
            window.open(hostUrl + '?refseqid=' + $("#" + me.pre + "refseqid").val(), urlTarget);
         });

        me.myEventCls.onIds("#" + me.pre + "gi", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load gi " + $("#" + me.pre + "gi").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?gi=' + $("#" + me.pre + "gi").val(), urlTarget);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_uniprotid", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load uniprotid " + $("#" + me.pre + "uniprotid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?uniprotid=' + $("#" + me.pre + "uniprotid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "uniprotid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load uniprotid " + $("#" + me.pre + "uniprotid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?uniprotid=' + $("#" + me.pre + "uniprotid").val(), urlTarget);
           }
        });


        me.myEventCls.onIds("#" + me.pre 
        + "reload_cid", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);
           let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
           window.open(hostUrl + '?cid=' + $("#" + me.pre + "cid").val(), urlTarget);
        });

        me.myEventCls.onIds("#" + me.pre + "cid", "keyup", function(e) { let ic = me.icn3d;
           if (e.keyCode === 13) {
               e.preventDefault();
               if(!me.cfg.notebook) dialog.dialog( "close" );
               thisClass.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);
               let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
               window.open(hostUrl + '?cid=' + $("#" + me.pre + "cid").val(), urlTarget);
           }
        });


        me.htmlCls.setHtmlCls.clickReload_pngimage();

        me.myEventCls.onIds("#" + me.pre + "reload_state", "click", function(e) { let ic = me.icn3d;
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
           let file = $("#" + me.pre + "state")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
               ic.bStatefile = true;

               let dataStr = e.target.result; // or = reader.result;
               thisClass.setLogCmd('load state file ' + $("#" + me.pre + "state").val(), false);
               ic.commands = [];
               ic.optsHistory = [];
               await ic.loadScriptCls.loadScript(dataStr, true);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_selectionfile", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let file = $("#" + me.pre + "selectionfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
               let dataStr = e.target.result; // or = reader.result;
               await ic.selectionCls.loadSelection(dataStr);
               thisClass.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_dsn6file2fofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6File('2fofc');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_dsn6filefofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6File('fofc');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_delphifile", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadDelphiFile('delphi');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrfile", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('pqr');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phifile", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('phi');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubefile", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('cube');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrurlfile", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('pqrurl');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phiurlfile", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('phiurl');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubeurlfile", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('cubeurl');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_delphifile2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('delphi');

           if(!me.cfg.notebook) dialog.dialog( "close" );

           await ic.delphiCls.loadDelphiFile('delphi2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrfile2", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('pqr2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phifile2", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('phi2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubefile2", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phi');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.delphiCls.loadPhiFile('cube2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_pqrurlfile2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('pqrurl2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_phiurlfile2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('phiurl2');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_cubeurlfile2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           me.htmlCls.setHtmlCls.updateSurfPara('phiurl');

           if(!me.cfg.notebook) dialog.dialog( "close" );
           await ic.delphiCls.loadPhiFileUrl('cubeurl2');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_dsn6fileurl2fofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6FileUrl('2fofc');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_dsn6fileurlfofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.dsn6ParserCls.loadDsn6FileUrl('fofc');
        });

        me.myEventCls.onIds("#" + me.pre + "reload_pdbfile", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();

           let bAppend = false;
           await thisClass.loadPdbFile(bAppend);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_pdbfile_app", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();

           ic.bAppend = true;
           await thisClass.loadPdbFile(ic.bAppend);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mol2file", "click", function(e) { let ic = me.icn3d;
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
           let file = $("#" + me.pre + "mol2file")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
               let dataStr = e.target.result; // or = reader.result;
               thisClass.setLogCmd('load mol2 file ' + $("#" + me.pre + "mol2file").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + dataStr : dataStr;
               ic.InputfileType = 'mol2';
               await ic.mol2ParserCls.loadMol2Data(dataStr);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_sdffile", "click", function(e) { let ic = me.icn3d;
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
           let file = $("#" + me.pre + "sdffile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
               let dataStr = e.target.result; // or = reader.result;
               thisClass.setLogCmd('load sdf file ' + $("#" + me.pre + "sdffile").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + dataStr : dataStr;
               ic.InputfileType = 'sdf';
               await ic.sdfParserCls.loadSdfData(dataStr);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_xyzfile", "click", function(e) { let ic = me.icn3d;
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
           let file = $("#" + me.pre + "xyzfile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
               let dataStr = e.target.result; // or = reader.result;
               thisClass.setLogCmd('load xyz file ' + $("#" + me.pre + "xyzfile").val(), false);
               ic.molTitle = "";
               ic.inputid = undefined;
               //ic.initUI();
               ic.init();
               ic.bInputfile = true;
               ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + dataStr : dataStr;
               ic.InputfileType = 'xyz';
               await ic.xyzParserCls.loadXyzData(dataStr);
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "reload_afmapfile", "click", function(e) { let ic = me.icn3d;
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
            let file = $("#" + me.pre + "afmapfile")[0].files[0];
            if(!file) {
              alert("Please select a file before clicking 'Load'");
            }
            else {
              me.htmlCls.setHtmlCls.fileSupport();
              let reader = new FileReader();
              reader.onload = function(e) {
                let dataStr = e.target.result; // or = reader.result;
                thisClass.setLogCmd('load AlphaFold PAE file ' + $("#" + me.pre + "afmapfile").val(), false);
                
                me.htmlCls.dialogCls.openDlg('dl_alignerrormap', 'Show Predicted Aligned Error (PAE) map');
                ic.contactMapCls.processAfErrorMap(JSON.parse(dataStr));
              }
              reader.readAsText(file);
            }
         });

         me.myEventCls.onIds("#" + me.pre + "reload_afmapfilefull", "click", function(e) { let ic = me.icn3d;
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
            let file = $("#" + me.pre + "afmapfile")[0].files[0];
            if(!file) {
              alert("Please select a file before clicking 'Load'");
            }
            else {
              me.htmlCls.setHtmlCls.fileSupport();
              let reader = new FileReader();
              reader.onload = function(e) {
                let dataStr = e.target.result; // or = reader.result;
                thisClass.setLogCmd('load AlphaFold PAE file ' + $("#" + me.pre + "afmapfile").val(), false);
                
                me.htmlCls.dialogCls.openDlg('dl_alignerrormap', 'Show Predicted Aligned Error (PAE) map');
                ic.contactMapCls.processAfErrorMap(JSON.parse(dataStr), true);
              }
              reader.readAsText(file);
            }
         });

        me.myEventCls.onIds("#" + me.pre + "reload_urlfile", "click", async function(e) { let ic = me.icn3d;
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
           let type = $("#" + me.pre + "filetype").val();
           let url = $("#" + me.pre + "urlfile").val();
           ic.inputurl = 'type=' + type + '&url=' + encodeURIComponent(url);
           //ic.initUI();
           ic.init();
           ic.bInputfile = true;
           ic.bInputUrlfile = true;
           await ic.pdbParserCls.downloadUrl(url, type);
        });

        me.myEventCls.onIds("#" + me.pre + "reload_mmciffile", "click", function(e) { let ic = me.icn3d;
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
           let file = $("#" + me.pre + "mmciffile")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             me.htmlCls.setHtmlCls.fileSupport();
             let reader = new FileReader();
             reader.onload = async function(e) {
                let dataStr = e.target.result; // or = reader.result;
                thisClass.setLogCmd('load mmcif file ' + $("#" + me.pre + "mmciffile").val(), false);
                ic.molTitle = "";
                let url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
                //ic.bCid = undefined;

                let dataObj = {'mmciffile': dataStr};
                let data = await me.getAjaxPostPromise(url, dataObj, true);

                //ic.initUI();
                ic.init();
                ic.bInputfile = true;
                ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + data : data;
                ic.InputfileType = 'mmcif';
                await ic.mmcifParserCls.loadMmcifData(data); //await 
             }
             reader.readAsText(file);
           }
        });

        me.myEventCls.onIds("#" + me.pre + "applycustomcolor", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.setOptionCls.setOption("color", $("#" + me.pre + "colorcustom").val());
           thisClass.setLogCmd("color " + $("#" + me.pre + "colorcustom").val(), true);
        });

        me.myEventCls.onIds(["#" + me.pre + "atomsCustomSphere2", "#" + me.pre + "atomsCustomSphere", "#" + me.pre + "radius_aroundsphere"], "change", function(e) { let ic = me.icn3d;
            ic.bSphereCalc = false;
            //thisClass.setLogCmd('set calculate sphere false', true);
        });
        me.myEventCls.onIds("#" + me.pre + "applypick_aroundsphere", "click", function(e) { let ic = me.icn3d;
            //e.preventDefault();
            
            let radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            let nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            let nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                let select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + ic.bSphereCalc;
                if(!ic.bSphereCalc) ic.showInterCls.pickCustomSphere(radius, nameArray2, nameArray, ic.bSphereCalc);
                ic.bSphereCalc = true;
                //thisClass.setLogCmd('set calculate sphere true', true);
                ic.hlUpdateCls.updateHlAll();
                thisClass.setLogCmd(select, true);
            }
        });
        me.myEventCls.onIds("#" + me.pre + "sphereExport", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            let nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            let nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();
            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                ic.showInterCls.pickCustomSphere(radius, nameArray2, nameArray, ic.bSphereCalc);
                ic.bSphereCalc = true;
                let text = ic.viewInterPairsCls.exportSpherePairs();
                let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
                ic.saveFileCls.saveFile(file_pref + '_sphere_pairs.html', 'html', text);

                thisClass.setLogCmd("export pairs | " + nameArray2 + " " + nameArray + " | dist " + radius, true);
            }
        });

        me.myEventCls.onIds("#" + me.pre + "apply_adjustmem", "click", function(e) { let ic = me.icn3d;
            //e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let extra_mem_z = parseFloat($("#" + me.pre + "extra_mem_z").val());
            let intra_mem_z = parseFloat($("#" + me.pre + "intra_mem_z").val());
            ic.selectionCls.adjustMembrane(extra_mem_z, intra_mem_z);
            let select = "adjust membrane z-axis " + extra_mem_z + " " + intra_mem_z;
            thisClass.setLogCmd(select, true);
        });

        me.myEventCls.onIds("#" + me.pre + "apply_selectplane", "click", function(e) { let ic = me.icn3d;
            //e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            let large = parseFloat($("#" + me.pre + "selectplane_z1").val());
            let small = parseFloat($("#" + me.pre + "selectplane_z2").val());
            ic.selectionCls.selectBtwPlanes(large, small);
            let select = "select planes z-axis " + large + " " + small;
            thisClass.setLogCmd(select, true);
        });

        me.myEventCls.onIds(["#" + me.pre + "atomsCustomHbond2", "#" + me.pre + "atomsCustomHbond", "#" + me.pre + "analysis_hbond", "#" + me.pre + "analysis_saltbridge", "#" + me.pre + "analysis_contact", "#" + me.pre + "hbondthreshold", "#" + me.pre + "saltbridgethreshold", "#" + me.pre + "contactthreshold"], "change", function(e) { let ic = me.icn3d;
            ic.bHbondCalc = false;
            //thisClass.setLogCmd('set calculate hbond false', true);
        });
        me.myEventCls.onIds("#" + me.pre + "crossstrucinter", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.crossstrucinter = parseInt($("#" + me.pre + "crossstrucinter").val());
           thisClass.setLogCmd("cross structure interaction " + ic.crossstrucinter, true);
        });
        me.myEventCls.onIds("#" + me.pre + "applyhbonds", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           await ic.showInterCls.showInteractions('3d');
        });
        me.myEventCls.onIds("#" + me.pre + "applycontactmap", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );

           let contactdist = parseFloat($("#" + ic.pre + "contactdist").val());
           let contacttype = $("#" + ic.pre + "contacttype").val();

           await ic.contactMapCls.contactMap(contactdist, contacttype);
           thisClass.setLogCmd('contact map | dist ' + contactdist + ' | type ' + contacttype, true);
        });
        me.myEventCls.onIds("#" + me.pre + "hbondWindow", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           await ic.showInterCls.showInteractions('view');
        });
        me.myEventCls.onIds("#" + me.pre + "areaWindow", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let nameArray = $("#" + me.pre + "atomsCustomHbond").val();
           let nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();
           ic.analysisCls.calcBuriedSurface(nameArray2, nameArray);
           thisClass.setLogCmd("calc buried surface | " + nameArray2 + " " + nameArray, true);
        });
        me.myEventCls.onIds("#" + me.pre + "sortSet1", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           await ic.showInterCls.showInteractions('save1');
        });
        $(document).on("click", "." + me.pre + "showintercntonly", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            $(".icn3d-border").hide();
            thisClass.setLogCmd("table inter count only", true);
        });
        $(document).on("click", "." + me.pre + "showinterdetails", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            $(".icn3d-border").show();
            thisClass.setLogCmd("table inter details", true);
        });
        me.myEventCls.onIds("#" + me.pre + "sortSet2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           await ic.showInterCls.showInteractions('save2');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondGraph", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           await ic.showInterCls.showInteractions('graph');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondLineGraph", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.bShownRefnum = false;
           thisClass.setLogCmd("hide ref number", true);
           await ic.showInterCls.showInteractions('linegraph');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondLineGraph2", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            ic.bShownRefnum = true;
            thisClass.setLogCmd("show ref number", true);
            await ic.showInterCls.showInteractions('linegraph');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondScatterplot", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            ic.bShownRefnum = false;
            thisClass.setLogCmd("hide ref number", true);
            await ic.showInterCls.showInteractions('scatterplot');
        });
        me.myEventCls.onIds("#" + me.pre + "hbondScatterplot2", "click", async function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.bShownRefnum = true;
           thisClass.setLogCmd("show ref number", true);
           await ic.showInterCls.showInteractions('scatterplot');
        });
        // select residues
        $(document).on("click", "#" + me.svgid + " circle.selected", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            let id = $(this).attr('res');
            if(ic.bSelectResidue === false && !ic.bShift && !ic.bCtrl) {
              ic.selectionCls.removeSelection();
            }
            if(id !== undefined) {
               ic.hlSeqCls.selectResidues(id, this);
               ic.hlObjectsCls.addHlObjects();  // render() is called
            }
        });
        me.myEventCls.onIds("#" + me.svgid + "_svg", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.saveSvg(me.svgid, ic.inputid + "_force_directed_graph.svg");
        });
        me.myEventCls.onIds("#" + me.svgid + "_png", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.savePng(me.svgid, ic.inputid + "_force_directed_graph.png");
        });
        me.myEventCls.onIds("#" + me.svgid + "_json", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let graphStr2 = ic.graphStr.substr(0, ic.graphStr.lastIndexOf('}'));
            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_force_directed_graph.json", "text", [graphStr2]);
        });

        $(document).on("click", "#" + me.svgid_ct + "_svg", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.saveSvg(me.svgid_ct, ic.inputid + "_cartoon.svg");
        });
        $(document).on("click", "#" + me.svgid_ct + "_png", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.savePng(me.svgid_ct, ic.inputid + "_cartoon.png");
        });
        $(document).on("click", "#" + me.svgid_ct + "_json", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            //let graphStr2 = ic.graphStr.substr(0, ic.graphStr.lastIndexOf('}'));

            ic.saveFileCls.saveFile(ic.inputid + "_cartoon.json", "text", [ic.graphStr]);
        });
        $(document).on("change", "#" + me.svgid_ct + "_label", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let className = $("#" + me.svgid_ct + "_label").val();
           $("#" + me.svgid_ct + " text").removeClass();
           $("#" + me.svgid_ct + " text").addClass(className);
           thisClass.setLogCmd("cartoon label " + className, true);
        });

        me.myEventCls.onIds("#" + me.linegraphid + "_svg", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.saveSvg(me.linegraphid, ic.inputid + "_line_graph.svg");
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_png", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.savePng(me.linegraphid, ic.inputid + "_line_graph.png");
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_json", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let graphStr2 = ic.lineGraphStr.substr(0, ic.lineGraphStr.lastIndexOf('}'));

            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_line_graph.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.linegraphid + "_scale", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let scale = $("#" + me.linegraphid + "_scale").val();
           $("#" + me.linegraphid).attr("width",(ic.linegraphWidth * parseFloat(scale)).toString() + "px");
           thisClass.setLogCmd("line graph scale " + scale, true);
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_svg", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.saveSvg(me.scatterplotid, ic.inputid + "_scatterplot.svg");
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_png", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.savePng(me.scatterplotid, ic.inputid + "_scatterplot.png");
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_json", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let graphStr2 = ic.scatterplotStr.substr(0, ic.scatterplotStr.lastIndexOf('}'));

            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_scatterplot.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.scatterplotid + "_scale", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let scale = $("#" + me.scatterplotid + "_scale").val();
           $("#" + me.scatterplotid).attr("width",(ic.scatterplotWidth * parseFloat(scale)).toString() + "px");
           thisClass.setLogCmd("scatterplot scale " + scale, true);
        });

        me.myEventCls.onIds("#" + me.contactmapid + "_svg", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.saveSvg(me.contactmapid, ic.inputid + "_contactmap.svg", true);
        });
        me.myEventCls.onIds("#" + me.contactmapid + "_png", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.saveFileCls.savePng(me.contactmapid, ic.inputid + "_contactmap.png", true);
        });
        me.myEventCls.onIds("#" + me.contactmapid + "_json", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let graphStr2 = ic.contactmapStr.substr(0, ic.contactmapStr.lastIndexOf('}'));

            graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();

            ic.saveFileCls.saveFile(ic.inputid + "_contactmap.json", "text", [graphStr2]);
        });
        me.myEventCls.onIds("#" + me.contactmapid + "_scale", "change", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let scale = $("#" + me.contactmapid + "_scale").val();
            $("#" + me.contactmapid).attr("width",(ic.contactmapWidth * parseFloat(scale)).toString() + "px");
            thisClass.setLogCmd("contactmap scale " + scale, true);
         });

        me.myEventCls.onIds("#" + me.alignerrormapid + "_svg", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let scale = 1;
            $("#" + me.alignerrormapid + "_scale").val(scale);
            $("#" + me.alignerrormapid).attr("width",(ic.alignerrormapWidth * parseFloat(scale)).toString() + "px");
            
            ic.saveFileCls.saveSvg(me.alignerrormapid, ic.inputid + "_alignerrormap.svg", true);
         });
         me.myEventCls.onIds("#" + me.alignerrormapid + "_png", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            let scale = 1;
            $("#" + me.alignerrormapid + "_scale").val(scale);
            $("#" + me.alignerrormapid).attr("width",(ic.alignerrormapWidth * parseFloat(scale)).toString() + "px");
            
            ic.saveFileCls.savePng(me.alignerrormapid, ic.inputid + "_alignerrormap.png", true);
         });
         me.myEventCls.onIds("#" + me.alignerrormapid + "_full", "click", async function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            await ic.contactMapCls.afErrorMap(afid, true);
         });
         me.myEventCls.onIds("#" + me.alignerrormapid + "_json", "click", function(e) { let ic = me.icn3d;
             e.preventDefault();
             
             
             let graphStr2 = ic.alignerrormapStr.substr(0, ic.alignerrormapStr.lastIndexOf('}'));
 
             graphStr2 += me.htmlCls.setHtmlCls.getLinkColor();
 
             ic.saveFileCls.saveFile(ic.inputid + "_alignerrormap.json", "text", [graphStr2]);
         });

        me.myEventCls.onIds("#" + me.alignerrormapid + "_scale", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let scale = $("#" + me.alignerrormapid + "_scale").val();
           $("#" + me.alignerrormapid).attr("width",(ic.alignerrormapWidth * parseFloat(scale)).toString() + "px");
           thisClass.setLogCmd("alignerrormap scale " + scale, true);
        });

        me.myEventCls.onIds("#" + me.svgid + "_label", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           let className = $("#" + me.svgid + "_label").val();
           $("#" + me.svgid + " text").removeClass();
           $("#" + me.svgid + " text").addClass(className);
           thisClass.setLogCmd("graph label " + className, true);
        });
        me.myEventCls.onIds("#" + me.svgid + "_hideedges", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
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
               thisClass.setLogCmd("hide edges " + me.htmlCls.hideedges, true);
           }
        });
        me.myEventCls.onIds("#" + me.svgid + "_force", "change", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           me.htmlCls.force = parseInt($("#" + me.svgid + "_force").val());
           if(ic.graphStr !== undefined) {
               thisClass.setLogCmd("graph force " + me.htmlCls.force, true);
               ic.getGraphCls.handleForce();
           }
        });
        me.myEventCls.onIds("#" + me.pre + "hbondReset", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           
           ic.viewInterPairsCls.resetInteractionPairs();
           thisClass.setLogCmd("reset interaction pairs", true);
        });

        me.myEventCls.onIds("#" + me.pre + "applypick_labels", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let text = $("#" + me.pre + "labeltext" ).val();
           let size = $("#" + me.pre + "labelsize" ).val();
           let color = $("#" + me.pre + "labelcolor" ).val();
           let background = $("#" + me.pre + "labelbkgd" ).val();
           if(size === '0' || size === '' || size === 'undefined') size = 0;
           if(color === '0' || color === '' || color === 'undefined') color = 0;
           if(background === '0' || background === '' || background === 'undefined') background = 0;
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             let x =(ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
             let y =(ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
             let z =(ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'custom');
             ic.pickpair = false;
             let sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             thisClass.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
             ic.drawCls.draw();
           }
        });

        me.myEventCls.onIds("#" + me.pre + "applyselection_labels", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           let text = $("#" + me.pre + "labeltext2" ).val();
           let size = $("#" + me.pre + "labelsize2" ).val();
           let color = $("#" + me.pre + "labelcolor2" ).val();
           let background = $("#" + me.pre + "labelbkgd2" ).val();
           if(size === '0' || size === '' || size === 'undefined') size = 0;
           if(color === '0' || color === '' || color === 'undefined') color = 0;
           if(background === '0' || background === '' || background === 'undefined') background = 0;
             let position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms));
             let x = position.center.x;
             let y = position.center.y;
             let z = position.center.z;
             //thisClass.setLogCmd('add label ' + text + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'custom');
             let sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             thisClass.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
             ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "applylabelcolor", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            ic.labelcolor = $("#" + me.pre + "labelcolorall" ).val();

            thisClass.setLogCmd('set label color ' + ic.labelcolor, true);
            ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "applypick_stabilizer", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             ic.pickpair = false;
             thisClass.setLogCmd('add one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
             if(ic.pairArray === undefined) ic.pairArray = [];
             ic.pairArray.push(ic.pAtom.serial);
             ic.pairArray.push(ic.pAtom2.serial);
             //ic.updateStabilizer();
             ic.threeDPrintCls.setThichknessFor3Dprint();
             ic.drawCls.draw();
           }
        });

    // https://github.com/tovic/color-picker
    // https://tovic.github.io/color-picker/color-picker.value-update.html
    //    pickColor: function() {
        let picker = new CP(document.querySelector("#" + me.pre + "colorcustom"));
        picker.on("change", function(color) {
            this.target.value = color;
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "input", function() {
            let color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "keyup", function() {
            let color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "paste", function() {
            let color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "colorcustom", "cut", function() {
            let color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });

        let picker2 = new CP(document.querySelector("#" + me.pre + "labelcolorall"));
        picker2.on("change", function(color) {
            this.target.value = color;
        });
        me.myEventCls.onIds("#" + me.pre + "labelcolorall", "input", function() {
            let color = $("#" + me.pre + "labelcolorall").val();
            picker2.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "labelcolorall", "keyup", function() {
            let color = $("#" + me.pre + "labelcolorall").val();
            picker2.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "labelcolorall", "paste", function() {
            let color = $("#" + me.pre + "labelcolorall").val();
            picker2.set('#' + color).enter();
        });
        me.myEventCls.onIds("#" + me.pre + "labelcolorall", "cut", function() {
            let color = $("#" + me.pre + "labelcolorall").val();
            picker2.set('#' + color).enter();
        });    

        me.myEventCls.onIds("#" + me.pre + "applypick_stabilizer_rm", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             ic.pickpair = false;
             thisClass.setLogCmd('remove one stabilizer | ' + ic.pAtom.serial + ' ' + ic.pAtom2.serial, true);
             let rmLineArray = [];
             rmLineArray.push(ic.pAtom.serial);
             rmLineArray.push(ic.pAtom2.serial);
             ic.threeDPrintCls.removeOneStabilizer(rmLineArray);
             //ic.updateStabilizer();
             ic.drawCls.draw();
           }
        });

        me.myEventCls.onIds("#" + me.pre + "applypick_measuredistance", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.bMeasureDistance = false;
           if(ic.pAtom === undefined || ic.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             let size = 0, background = 0;
             let color = $("#" + me.pre + "linecolor" ).val();
             let x =(ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
             let y =(ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
             let z =(ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
             ic.analysisCls.addLineFromPicking('distance');
             let distance = parseInt(ic.pAtom.coord.distanceTo(ic.pAtom2.coord) * 10) / 10;
             let text = distance.toString() + " A";
             ic.analysisCls.addLabel(text, x, y, z, size, color, background, 'distance');
             let sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;
             thisClass.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type distance', true);
             ic.drawCls.draw();
             ic.pk = 2;
           }
        });


        me.myEventCls.onIds("#" + me.pre + "applydist2", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.bMeasureDistance = false;

           let nameArray = $("#" + me.pre + "atomsCustomDist").val();
           let nameArray2 = $("#" + me.pre + "atomsCustomDist2").val();

           ic.analysisCls.measureDistTwoSets(nameArray, nameArray2);
           thisClass.setLogCmd("dist | " + nameArray2 + " " + nameArray, true);
        });

        $(document).on("click", ".icn3d-distance", function(e) { let ic = me.icn3d;
            e.preventDefault();
            ic.bMeasureDistance = false;

            ic.distPnts = [];
            ic.labels['distance'] = [];
            ic.lines['distance'] = [];

            let sets = $(this).attr('sets').split('|');
 
            let nameArray = [sets[0]];
            let nameArray2 = [sets[1]];
 
            ic.analysisCls.measureDistTwoSets(nameArray, nameArray2);
            thisClass.setLogCmd("dist | " + nameArray2 + " " + nameArray, true);
         });

        me.myEventCls.onIds("#" + me.pre + "applydisttable", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            ic.bMeasureDistance = false;
 
            let nameArray = $("#" + me.pre + "atomsCustomDistTable").val();
            let nameArray2 = $("#" + me.pre + "atomsCustomDistTable2").val();
 
            ic.analysisCls.measureDistManySets(nameArray, nameArray2);
            me.htmlCls.dialogCls.openDlg('dl_disttable', 'Distance among the sets');

            thisClass.setLogCmd("disttable | " + nameArray2 + " " + nameArray, true);
        });

        me.myEventCls.onIds("#" + me.pre + "applylinebtwsets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            ic.bLinebtwsets = false;
 
            let nameArray = $("#" + me.pre + "linebtwsets").val();
            let nameArray2 = $("#" + me.pre + "linebtwsets2").val();
 
            let atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
            let atomSet2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);

            let posArray1 = ic.contactCls.getExtent(atomSet1);
            let posArray2 = ic.contactCls.getExtent(atomSet2);

            let pos1 = new THREE.Vector3(posArray1[2][0], posArray1[2][1], posArray1[2][2]);
            let pos2 = new THREE.Vector3(posArray2[2][0], posArray2[2][1], posArray2[2][2]);

            let radius = $("#" + me.pre + "linebtwsets_radius").val(); 
            let color = $("#" + me.pre + "linebtwsets_customcolor").val(); 
            let opacity = $("#" + me.pre + "linebtwsets_opacity").val();
            let dashed = ($("#" + me.pre + "linebtwsets_style").val() == 'Solid') ? false : true;
            let type = 'cylinder';

            let command = 'add line | x1 ' + pos1.x.toPrecision(4)  + ' y1 ' + pos1.y.toPrecision(4) + ' z1 ' + pos1.z.toPrecision(4) + ' | x2 ' + pos2.x.toPrecision(4)  + ' y2 ' + pos2.y.toPrecision(4) + ' z2 ' + pos2.z.toPrecision(4) + ' | color ' + color + ' | dashed ' + dashed + ' | type ' + type + ' | radius ' + radius + ' | opacity ' + opacity;

            thisClass.setLogCmd(command, true);

            ic.analysisCls.addLine(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, color, dashed, type, radius, opacity);
            ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "applycartoonshape", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            
            ic.bCartoonshape = false;
 
            let nameArray = $("#" + me.pre + "cartoonshape").val();
            let atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
            let posArray1 = ic.contactCls.getExtent(atomSet1);
            let pos1 = new THREE.Vector3(posArray1[2][0], posArray1[2][1], posArray1[2][2]);

            let shape = $("#" + me.pre + "cartoonshape_shape").val(); // Sphere or Cube
            let radius = $("#" + me.pre + "cartoonshape_radius").val(); 
            let colorStr = $("#" + me.pre + "cartoonshape_customcolor").val(); 
            let opacity = $("#" + me.pre + "cartoonshape_opacity").val();

            colorStr = '#' + colorStr.replace(/\#/g, '');
            let color = me.parasCls.thr(colorStr);
         
            // draw the shape
            let command;
            if(shape == 'Sphere') {
                ic.sphereCls.createSphereBase(pos1, color, radius, undefined, undefined, undefined, opacity);
                command = 'add sphere | x1 ' + pos1.x.toPrecision(4)  + ' y1 ' + pos1.y.toPrecision(4) + ' z1 ' + pos1.z.toPrecision(4) + ' | color ' + colorStr + ' | opacity ' + opacity + ' | radius ' + radius;
            }
            else {
                ic.boxCls.createBox_base(pos1, radius, color, undefined, undefined, undefined, opacity);
                command = 'add cube | x1 ' + pos1.x.toPrecision(4)  + ' y1 ' + pos1.y.toPrecision(4) + ' z1 ' + pos1.z.toPrecision(4) + ' | color ' + colorStr + ' | opacity ' + opacity + ' | radius ' + radius;
            }

            thisClass.setLogCmd(command, true);
            ic.shapeCmdHash[command] = 1;

            ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "clearlinebtwsets", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            

            ic.lines['cylinder'] = [];
            thisClass.setLogCmd('clear line between sets', true);

            ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "clearcartoonshape", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();
            

            ic.shapeCmdHash = {};
            thisClass.setLogCmd('clear shape', true);

            ic.drawCls.draw();
        });

        me.myEventCls.onIds("#" + me.pre + "apply_thickness_3dprint", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("3dprint");
        });
        me.myEventCls.onIds("#" + me.pre + "apply_thickness_style", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("style");
            me.htmlCls.setMenuCls.setLogWindow(true);
        });

        me.myEventCls.onIds("#" + me.pre + "reset_thickness_3dprint", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("3dprint", true);
        });
        me.myEventCls.onIds("#" + me.pre + "reset_thickness_style", "click", function(e) { let ic = me.icn3d;
            e.preventDefault();

            me.htmlCls.setHtmlCls.setLineThickness("style", true);
            me.htmlCls.setMenuCls.setLogWindow(true);
        });


        me.myEventCls.onIds("#" + me.pre + "reset", "click", function(e) { let ic = me.icn3d;
            ic.selectionCls.resetAll();

            // need to render
            if(ic.bRender) ic.drawCls.draw(); //ic.drawCls.render();
        });

        me.myEventCls.onIds(["#" + me.pre + "toggleHighlight", "#" + me.pre + "toggleHighlight2"], "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.toggleHighlight();
            thisClass.setLogCmd("toggle highlight", true);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_clearselection", "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            ic.hlUpdateCls.clearHighlight();
            thisClass.setLogCmd("clear selection", true);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_clearselection2", "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            e.preventDefault();
            ic.hlUpdateCls.clearHighlight();
            thisClass.setLogCmd("clear selection", true);
        });
        me.myEventCls.onIds("#" + me.pre + "alignseq_clearselection", "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            ic.hlUpdateCls.clearHighlight();
            thisClass.setLogCmd("clear selection", true);
        });

        me.myEventCls.onIds("#" + me.pre + "replay", "click", async function(e) { let ic = me.icn3d;
             e.stopImmediatePropagation();
             ic.CURRENTNUMBER++;
             let currentNumber =(me.cfg.replay) ? ic.STATENUMBER : ic.STATENUMBER - 1;

             if(ic.CURRENTNUMBER == currentNumber) {
                  ic.bReplay = 0;
                  $("#" + me.pre + "replay").hide();
             }
             else if(ic.commands.length > 0 && ic.commands[ic.CURRENTNUMBER]) {         
                  await ic.loadScriptCls.execCommandsBase(ic.CURRENTNUMBER, ic.CURRENTNUMBER, ic.STATENUMBER);
                  let pos = ic.commands[ic.CURRENTNUMBER].indexOf('|||');
                  let cmdStrOri =(pos != -1) ? ic.commands[ic.CURRENTNUMBER].substr(0, pos) : ic.commands[ic.CURRENTNUMBER];
                  let maxLen = 30;
                  let cmdStr =(cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;
                  let menuStr = ic.applyCommandCls.getMenuFromCmd(cmdStr);
                  $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
                  $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);

                  thisClass.setLogCmd(cmdStrOri, true);

                  ic.drawCls.draw();
             }
        });


        ic.loadScriptCls.pressCommandtext();

        me.myEventCls.onIds("#" + me.pre + "seq_saveselection", "click", function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.selectionCls.saveSelectionPrep();
           let name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc").val();
           ic.selectionCls.saveSelection(name, name);
        });
        me.myEventCls.onIds("#" + me.pre + "seq_saveselection2", "click", function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           ic.selectionCls.saveSelectionPrep();
           let name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc2").val();
           ic.selectionCls.saveSelection(name, name);
        });

        me.myEventCls.onIds("#" + me.pre + "mn2_saveresidue", "click", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            if(!me.cfg.notebook) dialog.dialog( "close" );
            
            ic.selectionCls.saveEachResiInSel();

            thisClass.setLogCmd('select each residue', true);
         });


        me.myEventCls.onIds("#" + me.pre + "alignseq_saveselection", "click", function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           ic.selectionCls.saveSelectionPrep();
           let name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "alignseq_command_desc").val();
           ic.selectionCls.saveSelection(name, name);
        });

        $(document).on("click", "." + me.pre + "outputselection", function(e) { let ic = me.icn3d;
              e.stopImmediatePropagation();
            ic.bSelectResidue = false;
            ic.bSelectAlignResidue = false;
            thisClass.setLogCmd('output selection', true);
            ic.threeDPrintCls.outputSelection();
        });

        $(document).on("click", ".icn3d-saveicon", function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           let id = $(this).attr('pid');

           thisClass.saveHtml(id);
           thisClass.setLogCmd("save html " + id, true);
        });

        $(document).on("click", ".icn3d-hideicon", function(e) { let ic = me.icn3d;
           e.stopImmediatePropagation();
           let id = $(this).attr('pid');
           if(!me.cfg.notebook) {
               if(ic.dialogHashHideDone === undefined) ic.dialogHashHideDone = {}
               if(ic.dialogHashPosToRight === undefined) ic.dialogHashPosToRight = {}
               if(!ic.dialogHashHideDone.hasOwnProperty(id)) {
                   ic.dialogHashHideDone[id] = {"width": $("#" + id).dialog( "option", "width"), "height": $("#" + id).dialog( "option", "height"), "position": $("#" + id).dialog( "option", "position")}
                   let dialogWidth = 160;
                   let dialogHeight = 80;
                   $("#" + id).dialog( "option", "width", dialogWidth );
                   $("#" + id).dialog( "option", "height", dialogHeight );
                   let posToRight;
                   if(ic.dialogHashPosToRight.hasOwnProperty(id)) {
                       posToRight = ic.dialogHashPosToRight[id];
                   }
                   else {
                       posToRight = Object.keys(ic.dialogHashPosToRight).length *(dialogWidth + 10);
                       ic.dialogHashPosToRight[id] = posToRight;
                   }
                   let position ={ my: "right bottom", at: "right-" + posToRight + " bottom+60", of: "#" + ic.divid, collision: "none" }
                   $("#" + id).dialog( "option", "position", position );
               }
               else {
                   let width = ic.dialogHashHideDone[id].width;
                   let height = ic.dialogHashHideDone[id].height;
                   let position = ic.dialogHashHideDone[id].position;
                   $("#" + id).dialog( "option", "width", width );
                   $("#" + id).dialog( "option", "height", height );
                   $("#" + id).dialog( "option", "position", position );
                   delete ic.dialogHashHideDone[id];
               }
           }
        });

        // highlight a pair residues
        $(document).on("click", "." + me.pre + "selres", function(e) { let ic = me.icn3d;
              e.stopImmediatePropagation();
              ic.bSelOneRes = false;
              let elems = $( "." + me.pre + "seloneres" );
              for(let i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }
              let idArray = $(this).attr('resid').split('|');
              ic.hAtoms = {}
              ic.selectedResidues = {}
              let cmd = 'select ';
              for(let i = 0, il = idArray.length; i < il; ++i) {
                  let idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40
                  if(i > 0) cmd += ' or ';
                  cmd += ic.selectionCls.selectOneResid(idStr);
              }
              ic.hlUpdateCls.updateHlAll();
              thisClass.setLogCmd(cmd, true);
        });
        // highlight a residue
        $(document).on("click", "." + me.pre + "seloneres", function(e) { let ic = me.icn3d;
              e.stopImmediatePropagation();
              if(!ic.bSelOneRes) {
                  ic.hAtoms = {}
                  ic.selectedResidues = {}
                  ic.bSelOneRes = true;
              }
              let resid = $(this).attr('resid');
              let id = $(this).attr('id');
              if($("#" + id).length && $("#" + id)[0].checked) { // checked
                  ic.selectionCls.selectOneResid(resid);
              }
              else if($("#" + id).length && !$("#" + id)[0].checked) { // unchecked
                  ic.selectionCls.selectOneResid(resid, true);
              }
              ic.hlUpdateCls.updateHlAll();
        });
        // highlight a set of residues
        $(document).on("click", "." + me.pre + "selset", async function(e) { let ic = me.icn3d;
              e.stopImmediatePropagation();
              ic.bSelOneRes = false;
              let elems = $( "." + me.pre + "seloneres" );
              for(let i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }
              let cmd = $(this).attr('cmd');
              await ic.selByCommCls.selectByCommand(cmd, '', '');
              ic.hlObjectsCls.removeHlObjects();  // render() is called
              ic.hlObjectsCls.addHlObjects();  // render() is called
              thisClass.setLogCmd(cmd, true);
        });


        $(document).on("click", ".icn3d-addtrack", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          $("#" + me.pre + "anno_custom")[0].checked = true;
          $("[id^=" + me.pre + "custom]").show();
          //e.preventDefault();
          let chainid = $(this).attr('chainid');
          let geneid = ic.chainsGene[chainid].geneId;
          $("#" + me.pre + "track_chainid").val(chainid);
          $("#" + me.pre + "track_geneid").val(geneid);
          me.htmlCls.dialogCls.openDlg('dl_addtrack', 'Add track for Chain: ' + chainid);
          $( "#" + me.pre + "track_gi" ).focus();
        });

        $(document).on("click", ".icn3d-customcolor", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let chainid = $(this).attr('chainid');
          $("#" + me.pre + "customcolor_chainid").val(chainid);
          me.htmlCls.dialogCls.openDlg('dl_customcolor', 'Apply custom color or tube for Chain: ' + chainid);
        });

        $(document).on("click", ".icn3d-helixsets", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'helix');
          thisClass.setLogCmd('define helix sets | chain ' + chainid, true);
        });

        $(document).on("click", ".icn3d-sheetsets", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'sheet');
          thisClass.setLogCmd('define sheet sets | chain ' + chainid, true);
        });

        $(document).on("click", ".icn3d-coilsets", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let chainid = $(this).attr('chainid');
          ic.addTrackCls.defineSecondary(chainid, 'coil');
          thisClass.setLogCmd('define coil sets | chain ' + chainid, true);
        });

        $(document).on("click", ".icn3d-igstrandsets", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            //e.preventDefault();
            let chainid = $(this).attr('chainid');
            ic.addTrackCls.defineIgstrand(chainid, 'igstrand');
            thisClass.setLogCmd('define igstrand sets | chain ' + chainid, true);
        });

        $(document).on("click", ".icn3d-igloopsets", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            //e.preventDefault();
            let chainid = $(this).attr('chainid');
            ic.addTrackCls.defineIgstrand(chainid, 'igloop');
            thisClass.setLogCmd('define igloop sets | chain ' + chainid, true);
        });

        me.myEventCls.onIds("#" + me.pre + "deletesets", "click", function(e) { let ic = me.icn3d;
             ic.definedSetsCls.deleteSelectedSets();
             thisClass.setLogCmd("delete selected sets", true);
        });

        $(document).on('mouseup touchend', "accordion", function(e) { let ic = me.icn3d;
          if(ic.bControlGl && !me.bNode) {
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

       $(document).on('mousedown touchstart', "accordion", function(e) { let ic = me.icn3d;
          if(ic.bControlGl && !me.bNode) {
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

        //$("[id$=_cddseq_expand]").on('click', '.ui-icon-plus', function(e) { let ic = me.icn3d;
        $(document).on("click", ".icn3d-expand", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            let oriId = $(this).attr('id');
            let pos = oriId.lastIndexOf('_');
            let id = oriId.substr(0, pos);
            $("#" + id).show();
            $("#" + id + "_expand").hide();
            $("#" + id + "_shrink").show();
        });
        //$("[id$=_cddseq_shrink]").on('click', '.ui-icon-minus', function(e) { let ic = me.icn3d;
        $(document).on("click", ".icn3d-shrink", function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();
            let oriId = $(this).attr('id');
            let pos = oriId.lastIndexOf('_');
            let id = oriId.substr(0, pos);
            $("#" + id).hide();
            $("#" + id + "_expand").show();
            $("#" + id + "_shrink").hide();
        });

        window.onscroll = function(e) { let ic = me.icn3d;
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


        me.myEventCls.onIds("#" + me.pre + "mn6_themeBlue", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('blue');
           thisClass.setLogCmd("set theme blue", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_themeOrange", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('orange');
           thisClass.setLogCmd("set theme orange", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_themeBlack", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.setMenuCls.setTheme('black');
           thisClass.setLogCmd("set theme black", true);
        });

        $(document).on("click", "." + me.pre + "snpin3d", async function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();

            let snp = $(this).attr('snp');

            await ic.scapCls.retrieveScap(snp);
            thisClass.setLogCmd('scap 3d ' + snp, true);
            thisClass.setLogCmd("select displayed set", true);
        });

        $(document).on("click", "." + me.pre + "snpinter", async function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();

            let snp = $(this).attr('snp');

            let bInteraction = true;
            await ic.scapCls.retrieveScap(snp, bInteraction);
            thisClass.setLogCmd('scap interaction ' + snp, true);

            let idArray = snp.split('_'); //stru_chain_resi_snp
            let select = '.' + idArray[1] + ':' + idArray[2];
            let name = 'snp_' + idArray[1] + '_' + idArray[2];
            thisClass.setLogCmd("select " + select + " | name " + name, true);
            thisClass.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);
            thisClass.setLogCmd("adjust dialog dl_linegraph", true);
            thisClass.setLogCmd("select displayed set", true);
        });

        $(document).on("click", "." + me.pre + "snppdb", async function(e) { let ic = me.icn3d;
            e.stopImmediatePropagation();

            let snp = $(this).attr('snp');

            let bPdb = true;
            await ic.scapCls.retrieveScap(snp, undefined, bPdb);
            thisClass.setLogCmd('scap pdb ' + snp, true);
        });

    }

}

export {Events}
