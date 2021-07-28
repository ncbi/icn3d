/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {Html} from './html.js';

import {HashUtilsCls} from '../utils/hashUtilsCls.js';
import {UtilsCls} from '../utils/utilsCls.js';
import {ParasCls} from '../utils/parasCls.js';
import {MyEventCls} from '../utils/myEventCls.js';

import {SaveFile} from '../icn3d/export/saveFile.js';
import {Export3D} from '../icn3d/export/export3D.js';
import {ThreeDPrint} from '../icn3d/export/threeDPrint.js';
import {ShareLink} from '../icn3d/export/shareLink.js';

import {ViewInterPairs} from '../icn3d/interaction/viewInterPairs.js';
import {ShowInter} from '../icn3d/interaction/showInter.js';

import {ResizeCanvas} from '../icn3d/transform/resizeCanvas.js';
import {Transform} from '../icn3d/transform/transform.js';

import {ShowAnno} from '../icn3d/annotations/showAnno.js';
import {AddTrack} from '../icn3d/annotations/addTrack.js';
import {AnnoSsbond} from '../icn3d/annotations/annoSsbond.js';

import {DefinedSets} from '../icn3d/selection/definedSets.js';
import {FirstAtomObj} from '../icn3d/selection/firstAtomObj.js';
import {Selection} from '../icn3d/selection/selection.js';
import {Resid2spec} from '../icn3d/selection/resid2spec.js';

import {HlUpdate} from '../icn3d/highlight/hlUpdate.js';
import {HlObjects} from '../icn3d/highlight/hlObjects.js';

import {Draw} from '../icn3d/display/draw.js';
import {SetOption} from '../icn3d/display/setOption.js';
import {SetStyle} from '../icn3d/display/setStyle.js';

import {ApplyMap} from '../icn3d/surface/applyMap.js';

import {Dsn6Parser} from '../icn3d/parsers/dsn6Parser.js';

import {ResidueLabels} from '../icn3d/geometry/residueLabels.js';
import {Axes} from '../icn3d/geometry/axes.js';

class ClickMenu {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    setLegendHtml() { let me = this.icn3dui, ic = me.icn3d;
        let startColorStr = (ic.startColor == 'red') ? '#F00' : (ic.startColor == 'green') ? '#0F0' : '#00F';
        let midColorStr = (ic.midColor == 'white') ? '#FFF' : '#000';
        let endColorStr = (ic.endColor == 'red') ? '#F00' : (ic.endColor == 'green') ? '#0F0' : '#00F';
        let rangeStr = startColorStr + ' 0%, ' + midColorStr + ' 50%, ' + endColorStr + ' 100%';

        let legendHtml = "<div style='height: 20px; background: linear-gradient(to right, " + rangeStr + ");'></div><table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td width='33%'>" + ic.startValue + "</td><td width='33%' align='center'>" + ic.midValue + "</td><td width='33%' align='right'>" + ic.endValue + "</td></tr></table>";

        return legendHtml;
    }

    clickMenu1() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    //mn 1
    //    clkMn1_mmtfid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_mmtfid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mmtfid', 'Please input MMTF ID');
        });
    //    },
    //    clkMn1_pdbid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_pdbid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_pdbid', 'Please input PDB ID');
        });
    //    },
    //    clkMn1_opmid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_opmid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_opmid', 'Please input OPM PDB ID');
        });
    //    },
    //    clkMn1_align: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_align", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_align', 'Align two 3D structures');
        });
    //    },
    //    clkMn1_chainalign: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_chainalign", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_chainalign', 'Align multiple chains of 3D structures');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_mutation", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mutation', 'Show the mutations in 3D');
        });

    //    },
    //    clkMn1_pdbfile: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_pdbfile", "click", function(e) { let ic = me.icn3d;
           //me = me.setIcn3dui($(this).attr('id'));
           me.htmlCls.dialogCls.openDlg('dl_pdbfile', 'Please input PDB File');
        });
    //    },
    //    clkMn1_mol2file: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_mol2file", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mol2file', 'Please input Mol2 File');
        });
    //    },
    //    clkMn1_sdffile: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_sdffile", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_sdffile', 'Please input SDF File');
        });
    //    },
    //    clkMn1_xyzfile: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_xyzfile", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_xyzfile', 'Please input XYZ File');
        });
    //    },
    //    clkMn1_urlfile: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_urlfile", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_urlfile', 'Load data by URL');
        });
    //    },
    //    clkMn1_fixedversion: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_fixedversion", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_fixedversion', 'Open Share Link URL in the archived version of iCn3D');
        });
        me.myEventCls.onIds("#" + me.pre + "reload_fixedversion", "click", function(e) { let ic = me.icn3d;
           let url = $("#" + me.pre + "sharelinkurl").val();
           thisClass.setLogCmd("open " + url, false);
           localStorage.setItem('fixedversion', '1');
           window.open(url, '_blank');
        });
    //    },
    //    clkMn1_mmciffile: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_mmciffile", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mmciffile', 'Please input mmCIF File');
        });
    //    },
    //    clkMn1_mmcifid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_mmcifid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mmcifid', 'Please input mmCIF ID');
        });
    //    },
    //    clkMn1_mmdbid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_mmdbid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
        });
    //    },
    //    clkMn1_blast_rep_id: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_blast_rep_id", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_blast_rep_id', 'Align sequence to structure');
        });
    //    },
    //    clkMn1_gi: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_gi", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_gi', 'Please input protein gi');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_uniprotid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_uniprotid', 'Please input UniProt ID');
        });
    //    },
    //    clkMn1_cid: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_cid", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_cid', 'Please input PubChem CID');
        });
    //    },
    //    clkMn1_pngimage: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_pngimage", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_pngimage', 'Please input the PNG image');
        });
    //    },
    //    clkMn1_state: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_state", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_state', 'Please input the state file');
        });
    //    },
    //    clkMn1_selection: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_selection", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_selection', 'Please input the selection file');
        });
    //    },
    //    clkMn1_dsn6: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_dsn6", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_dsn6', 'Please input the DSN6 file to display electron density map');
        });
    //    },

        me.myEventCls.onIds(["#" + me.pre + "mn1_delphi", "#" + me.pre + "mn1_delphi2"], "click", function(e) { let ic = me.icn3d;
           ic.loadPhiFrom = 'delphi';
           $("#" + me.pre + "dl_delphi_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_delphi', 'Please set parameters to display DelPhi potential map');
        });

        me.myEventCls.onIds("#" + me.pre + "mn1_phi", "click", function(e) { let ic = me.icn3d;
           ic.loadPhiFrom = 'phi';
           $("#" + me.pre + "dl_phi_tabs").tabs();
           $("#" + me.pre + "phitab1_tabs").tabs();
           $("#" + me.pre + "phitab2_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_phi', 'Please input local phi or cube file to display DelPhi potential map');
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_phiurl", "click", function(e) { let ic = me.icn3d;
           ic.loadPhiFrom = 'phiurl';
           $("#" + me.pre + "dl_phiurl_tabs").tabs();
           $("#" + me.pre + "phiurltab1_tabs").tabs();
           $("#" + me.pre + "phiurltab2_tabs").tabs();
           me.htmlCls.dialogCls.openDlg('dl_phiurl', 'Please input URL phi or cube file to display DelPhi potential map');
        });

    //    clkMn1_dsn6url: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_dsn6url", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_dsn6url', 'Please input the DSN6 file to display electron density map');
        });
    //    },
    //    clkMn1_exportState: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportState", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export state file", false);
           let file_pref =(ic.inputid) ? ic.inputid : "custom";

           ic.saveFileCls.saveFile(file_pref + '_statefile.txt', 'command');
        });
    //    },

        me.myEventCls.onIds("#" + me.pre + "mn1_exportPdbRes", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.setHtmlCls.exportPdb();

           thisClass.setLogCmd("export pdb", true);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphipdb", "#" + me.pre + "phipdb"], "click", function(e) { let ic = me.icn3d;
           let pdbStr = ic.saveFileCls.getSelectedResiduePDB();

           thisClass.setLogCmd("export PDB of selected residues", false);
           let file_pref =(ic.inputid) ? ic.inputid : "custom";
           ic.saveFileCls.saveFile(file_pref + '_icn3d_residues.pdb', 'text', [pdbStr]);
        });
    /*
        me.myEventCls.onIds("#" + me.pre + "mn1_exportPdbChain", "click", function(e) { let ic = me.icn3d;
           let  pdbStr = me.getSelectedChainPDB();

           thisClass.setLogCmd("export PDB of selected chains", false);
           let file_pref =(ic.inputid) ? ic.inputid : "custom";
           ic.saveFileCls.saveFile(file_pref + '_icn3d_chains.pdb', 'text', [pdbStr]);
        });
    */
        me.myEventCls.onIds(["#" + me.pre + "delphipqr", "#" + me.pre + "phipqr", "#" + me.pre + "phiurlpqr"], "click", function(e) { let ic = me.icn3d;
           me.htmlCls.setHtmlCls.exportPqr();
           thisClass.setLogCmd("export pqr", true);
        });

    //    clkMn1_exportStl: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportStl", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export stl file", false);
           //ic.threeDPrintCls.hideStabilizer();
           ic.export3DCls.exportStlFile('');
        });
    //    },
    //    clkMn1_exportVrml: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportVrml", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export vrml file", false);
           //ic.threeDPrintCls.hideStabilizer();
           ic.export3DCls.exportVrmlFile('');
        });
    //    },
    //    clkMn1_exportStlStab: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportStlStab", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export stl stabilizer file", false);
           //ic.bRender = false;
           ic.threeDPrintCls.hideStabilizer();
           ic.threeDPrintCls.resetAfter3Dprint();
           ic.threeDPrintCls.addStabilizer();
           ic.export3DCls.exportStlFile('_stab');
        });
    //    },
    //    clkMn1_exportVrmlStab: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportVrmlStab", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export vrml stabilizer file", false);
           //ic.bRender = false;
           ic.threeDPrintCls.hideStabilizer();
           ic.threeDPrintCls.resetAfter3Dprint();
           ic.threeDPrintCls.addStabilizer();
           ic.export3DCls.exportVrmlFile('_stab');
        });
    //    },
    //    clkMn6_exportInteraction: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_exportInteraction", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export interactions", false);
           if(me.cfg.mmdbid !== undefined) ic.viewInterPairsCls.retrieveInteractionData();
           ic.viewInterPairsCls.exportInteractions();
        });
    //    },
    //    clkMn1_exportCanvas: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn1_exportCanvas", "#" + me.pre + "saveimage"], "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export canvas", false);
           //var file_pref =(ic.inputid) ? ic.inputid : "custom";
           //ic.saveFileCls.saveFile(file_pref + '_image_icn3d_loadable.png', 'png');
           let bPngHtml = true;
           ic.shareLinkCls.shareLink(bPngHtml);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas2", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export canvas 2", false);
           ic.scaleFactor = 2;
           ic.shareLinkCls.shareLink(true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas4", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export canvas 4", false);
           ic.scaleFactor = 4;
           ic.shareLinkCls.shareLink(true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCanvas8", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export canvas 8", false);
           ic.scaleFactor = 8;
           ic.shareLinkCls.shareLink(true);
        });
    //    },
    //    clkMn1_exportCounts: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportCounts", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export counts", false);
           let text = '<html><body><div style="text-align:center"><br><b>Total Count for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';
           text += '<tr><td>' + Object.keys(ic.structures).length + '</td><td>' + Object.keys(ic.chains).length + '</td><td>' + Object.keys(ic.residues).length + '</td><td>' + Object.keys(ic.atoms).length + '</td></tr>';
           text += '</table><br/>';
           text += '<b>Counts by Chain for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure</th><th>Chain</th><th>Residue Count</th><th>Atom Count</th></tr>';
           let chainArray = Object.keys(ic.chains);
           for(let i = 0, il = chainArray.length; i < il; ++i) {
               let chainid = chainArray[i];
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
           let file_pref =(ic.inputid) ? ic.inputid : "custom";
           ic.saveFileCls.saveFile(file_pref + '_counts.html', 'html', text);
        });
    //    },
    //    clkMn1_exportSelections: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_exportSelections", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("export all selections", false);
          if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
               let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
               ic.definedSetsCls.setPredefinedInMenu();
               ic.bSetChainsAdvancedMenu = true;
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
          }
           let text = ic.saveFileCls.exportCustomAtoms();
           let file_pref =(ic.inputid) ? ic.inputid : "custom";
           ic.saveFileCls.saveFile(file_pref + '_selections.txt', 'text', [text]);
        });
    //    },
    //    clkMn1_sharelink: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_sharelink", "click", function(e) { let ic = me.icn3d;
            ic.shareLinkCls.shareLink();
        });
    //    },
    //    clkMn1_replay: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_replayon", "click", function(e) { let ic = me.icn3d;
          ic.resizeCanvasCls.replayon();
          thisClass.setLogCmd("replay on", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_replayoff", "click", function(e) { let ic = me.icn3d;
            ic.resizeCanvasCls.replayoff();
            thisClass.setLogCmd("replay off", true);
        });
    //    },
    //    clkMn1_link_structure: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_link_structure", "click", function(e) { let ic = me.icn3d;
           let url = ic.saveFileCls.getLinkToStructureSummary(true);
           window.open(url, '_blank');
        });
    //    },
    //    clkMn1_link_bind: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_link_bind", "click", function(e) { let ic = me.icn3d;
           url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + ic.inputid;
           thisClass.setLogCmd("link to 3D protein structures bound to CID " + ic.inputid + ": " + url, false);
           window.open(url, '_blank');
        });
    //    },
    //    clkMn1_link_vast: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_link_vast", "click", function(e) { let ic = me.icn3d;
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
                   let url;
                   if(idArray.length === 1) {
                       url = me.htmlCls.baseUrl + "vastplus/vastplus.cgi?uid=" + ic.inputid;
                       thisClass.setLogCmd("link to structures similar to " + ic.inputid + ": " + url, false);
                   }
                   else if(idArray.length === 2) {
                       url = me.htmlCls.baseUrl + "vastplus/vastplus.cgi?uid=" + idArray[0];
                       thisClass.setLogCmd("link to structures similar to " + idArray[0] + ": " + url, false);
                   }
               }
               window.open(url, '_blank');
           }
        });
    //    },
    //    clkMn1_link_pubmed: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_link_pubmed", "click", function(e) { let ic = me.icn3d;
           let url;
           if(ic.inputid === undefined) {
               let url;
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + ic.molTitle;
               thisClass.setLogCmd("link to literature about " + ic.molTitle + ": " + url, false);
               window.open(url, '_blank');
           }
           else if(ic.pmid) {
               let idArray = ic.pmid.toString().split('_');
               let url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/" + ic.pmid;
                   thisClass.setLogCmd("link to PubMed ID " + ic.pmid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   thisClass.setLogCmd("link to PubMed IDs " + idArray[0] + ", " + idArray[1] + ": " + url, false);
               }
               window.open(url, '_blank');
           }
           else if(isNaN(ic.inputid)) {
               let idArray = ic.inputid.toString().split('_');
               let url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + ic.inputid;
                   thisClass.setLogCmd("link to literature about PDB " + ic.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   thisClass.setLogCmd("link to literature about PDB " + idArray[0] + " OR " + idArray[1] + ": " + url, false);
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
        me.myEventCls.onIds("#" + me.pre + "mn1_link_protein", "click", function(e) { let ic = me.icn3d;
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
          window.open(url, '_blank');
        });
    //    },
    }

    clickMenu2() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 2
    //    clkMn2_selectannotations: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_selectannotations", "click", function(e) { let ic = me.icn3d;
           ic.showAnnoCls.showAnnotations();
           thisClass.setLogCmd("view annotations", true);
           //thisClass.setLogCmd("window annotations", true);
        });
    //    },
    //    clkMn2_selectall: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectall", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select all", true);
           ic.selectionCls.selectAll();
           ic.hlUpdateCls.removeHlAll();
           ic.drawCls.draw();
        });
        me.myEventCls.onIds("#" + me.pre + "clearall", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("clear all", true);
           ic.bSelectResidue = false;
           ic.selectionCls.selectAll();
           ic.hlUpdateCls.removeHlAll();
           ic.drawCls.draw();
        });
    //    },
    //    clkMn2_selectdisplayed: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectdisplayed", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select displayed set", true);
           ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
           ic.hlUpdateCls.updateHlAll();
           //ic.drawCls.draw();
        });
    //    },
    //    clkMn2_fullstru: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_fullstru", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("show all", true);
           ic.selectionCls.showAll();
        });
    //    },
    //    clkMn2_selectcomplement: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectcomplement", "click", function(e) { let ic = me.icn3d;
           if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
               thisClass.setLogCmd("select complement", true);
               ic.resid2specCls.selectComplement();
           }
        });
    //    },
    //    clkMn2_selectmainchains: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectmainchains", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select main chains", true);
           ic.selectionCls.selectMainChains();
        });
    //    },
    //    clkMn2_selectsidechains: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectsidechains", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select side chains", true);
           ic.selectionCls.selectSideChains();
        });
    //    },
    //    clkMn2_selectmainsidechains: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_selectmainsidechains", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select main side chains", true);
           ic.selectionCls.selectMainSideChains();
        });
    //    },
    //    clkMn2_propperty: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_propPos", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select prop positive", true);
           ic.resid2specCls.selectProperty('positive');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propNeg", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select prop negative", true);
           ic.resid2specCls.selectProperty('negative');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propHydro", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select prop hydrophobic", true);
           ic.resid2specCls.selectProperty('hydrophobic');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propPolar", "click", function(e) { let ic = me.icn3d;
           thisClass.setLogCmd("select prop polar", true);
           ic.resid2specCls.selectProperty('polar');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propBfactor", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_propbybfactor', 'Select residue based on B-factor');
        });
        me.myEventCls.onIds("#" + me.pre + "mn2_propSolAcc", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_propbypercentout', 'Select residue based on the percentage of solvent accessilbe surface area');
        });
        me.myEventCls.onIds("#" + me.pre + "applypropbybfactor", "click", function(e) { let ic = me.icn3d;
           let from = $("#" + me.pre + "minbfactor").val();
           let to = $("#" + me.pre + "maxbfactor").val();
           thisClass.setLogCmd("select prop b factor | " + from + '_' + to, true);
           ic.resid2specCls.selectProperty('b factor', from, to);
        });
        me.myEventCls.onIds("#" + me.pre + "applypropbypercentout", "click", function(e) { let ic = me.icn3d;
           let from = $("#" + me.pre + "minpercentout").val();
           let to = $("#" + me.pre + "maxpercentout").val();
           thisClass.setLogCmd("select prop percent out | " + from + '_' + to, true);
           ic.resid2specCls.selectProperty('percent out', from, to);
        });
    //    },
    //    clkMn2_alignment: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_alignment", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
           thisClass.setLogCmd("window aligned sequences", true);
        });
    //    },
    //    clkMn2_windows: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_window_table", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_allinteraction', 'Show interactions');
           thisClass.setLogCmd("window interaction table", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_linegraph", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
           thisClass.setLogCmd("window interaction graph", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_scatterplot", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_scatterplot', 'Show interactions as map');
           thisClass.setLogCmd("window interaction scatterplot", true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn1_window_graph", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
           thisClass.setLogCmd("window force-directed graph", true);
        });
    //    },
    //    clkMn6_yournote: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_yournote", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_yournote', 'Your note about the current display');
        });
    //    },
    //    clkApplyYournote: function() {
        me.myEventCls.onIds("#" + me.pre + "applyyournote", "click", function(e) { let ic = me.icn3d;
           ic.yournote = $("#" + me.pre + "yournote").val();
           if(ic.icn3dui.cfg.shownote) document.title = ic.yournote;
           if(!me.cfg.notebook) dialog.dialog( "close" );
           thisClass.setLogCmd('your note | ' + ic.yournote, true);
        });
    //    },
    //    clkMn2_command: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_command", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_advanced2', 'Select by specification');
        });
    //    },
    //    clkMn2_definedsets: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn2_definedsets", "#" + me.pre + "definedsets", "#" + me.pre + "definedsets2"], "click", function(e) { let ic = me.icn3d;
           ic.definedSetsCls.showSets();
           thisClass.setLogCmd('defined sets', true);
           //thisClass.setLogCmd('window defined sets', true);
        });
        me.myEventCls.onIds("#" + me.pre + "setOr", "click", function(e) { let ic = me.icn3d;
           ic.setOperation = 'or';
        });
        me.myEventCls.onIds("#" + me.pre + "setAnd", "click", function(e) { let ic = me.icn3d;
           ic.setOperation = 'and';
        });
        me.myEventCls.onIds("#" + me.pre + "setNot", "click", function(e) { let ic = me.icn3d;
           ic.setOperation = 'not';
        });
    //    },
    //    clkMn2_pkNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkNo", "click", function(e) { let ic = me.icn3d;
           ic.pk = 0;
           ic.opts['pk'] = 'no';
           thisClass.setLogCmd('set pk off', true);
           ic.drawCls.draw();
           ic.hlObjectsCls.removeHlObjects();
        });
    //    },
    //    clkMn2_pkYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkYes", "click", function(e) { let ic = me.icn3d;
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           thisClass.setLogCmd('set pk atom', true);
        });
    //    },
    //    clkMn2_pkResidue: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkResidue", "click", function(e) { let ic = me.icn3d;
           ic.pk = 2;
           ic.opts['pk'] = 'residue';
           thisClass.setLogCmd('set pk residue', true);
        });
    //    },
    //    clkMn2_pkStrand: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkStrand", "click", function(e) { let ic = me.icn3d;
           ic.pk = 3;
           ic.opts['pk'] = 'strand';
           thisClass.setLogCmd('set pk strand', true);
        });
    //    },
    //    clkMn2_pkDomain: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkDomain", "click", function(e) { let ic = me.icn3d;
           ic.pk = 4;
           ic.opts['pk'] = 'domain';
           thisClass.setLogCmd('set pk domain', true);
        });
    //    },
    //    clkMn2_pkChain: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_pkChain", "click", function(e) { let ic = me.icn3d;
           ic.pk = 5;
           ic.opts['pk'] = 'chain';
           thisClass.setLogCmd('set pk chain', true);
        });
    //    },
    //    clk_adjustmem: function() {
        me.myEventCls.onIds("#" + me.pre + "adjustmem", "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_adjustmem', 'Adjust the Z-axis positions of the membrane');
        });
    //    },
    //    clk_togglemem: function() {
        me.myEventCls.onIds("#" + me.pre + "togglemem", "click", function(e) { let ic = me.icn3d;
           ic.selectionCls.toggleMembrane();
           thisClass.setLogCmd('toggle membrane', true);
        });
    //    },
    //    clk_selectplane: function() {
        me.myEventCls.onIds("#" + me.pre + "selectplane", "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_selectplane', 'Select a region between two planes');
        });
    //    },
    //    clkMn2_aroundsphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_aroundsphere", "click", function(e) { let ic = me.icn3d;
            if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
               let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
               ic.definedSetsCls.setPredefinedInMenu();
               ic.bSetChainsAdvancedMenu = true;
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            }
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
    //    },
    //    clkMn2_select_chain: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn2_select_chain", "#" + me.pre + "definedSets"], "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_select_chain', 'Select Structure/Chain/Custom Selection');
        });
    //    },
    }

    clickMenu3() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 3
    //    clkMn3_proteinsRibbon: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsRibbon", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'ribbon');
           thisClass.setLogCmd('style proteins ribbon', true);
        });
    //    },
    //    clkMn3_proteinsStrand: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsStrand", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'strand');
           thisClass.setLogCmd('style proteins strand', true);
        });
    //    },
    //    clkMn3_proteinsCylinder: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsCylinder", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'cylinder and plate');
           thisClass.setLogCmd('style proteins cylinder and plate', true);
        });
    //    },
    //    clkMn3_proteinsSchematic: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsSchematic", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'schematic');
           thisClass.setLogCmd('style proteins schematic', true);
        });
    //    },
    //    clkMn3_proteinsCalpha: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsCalpha", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'c alpha trace');
           thisClass.setLogCmd('style proteins c alpha trace', true);
        });
    //    },
    //    clkMn3_proteinsBackbone: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsBackbone", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'backbone');
           thisClass.setLogCmd('style proteins backbone', true);
        });
    //    },
    //    clkMn3_proteinsBfactor: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsBfactor", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'b factor tube');
           thisClass.setLogCmd('style proteins b factor tube', true);
        });
    //    },
    //    clkMn3_proteinsLines: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsLines", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'lines');
           thisClass.setLogCmd('style proteins lines', true);
        });
    //    },
    //    clkMn3_proteinsStick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsStick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'stick');
           thisClass.setLogCmd('style proteins stick', true);
        });
    //    },
    //    clkMn3_proteinsBallstick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsBallstick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'ball and stick');
           thisClass.setLogCmd('style proteins ball and stick', true);
        });
    //    },
    //    clkMn3_proteinsSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'sphere');
           thisClass.setLogCmd('style proteins sphere', true);
        });
    //    },
    //    clkMn3_proteinsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_proteinsNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('proteins', 'nothing');
           thisClass.setLogCmd('style proteins nothing', true);
        });
    //    },
    //    clkMn3_sidecLines: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_sidecLines", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('sidec', 'lines');
           thisClass.setLogCmd('style sidec lines', true);
        });
    //    },
    //    clkMn3_sidecStick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_sidecStick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('sidec', 'stick');
           thisClass.setLogCmd('style sidec stick', true);
        });
    //    },
    //    clkMn3_sidecBallstick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_sidecBallstick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('sidec', 'ball and stick');
           thisClass.setLogCmd('style sidec ball and stick', true);
        });
    //    },
    //    clkMn3_sidecSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_sidecSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('sidec', 'sphere');
           thisClass.setLogCmd('style sidec sphere', true);
        });
    //    },
    //    clkMn3_sidecNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_sidecNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('sidec', 'nothing');
           thisClass.setLogCmd('style sidec nothing', true);
        });
    //    },
    //    clkMn3_nuclCartoon: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclCartoon", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'nucleotide cartoon');
           thisClass.setLogCmd('style nucleotides nucleotide cartoon', true);
       });
    //    },
    //    clkMn3_nuclBackbone: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclBackbone", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'backbone');
           thisClass.setLogCmd('style nucleotides backbone', true);
        });
    //    },
    //    clkMn3_nuclSchematic: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclSchematic", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'schematic');
           thisClass.setLogCmd('style nucleotides schematic', true);
        });
    //    },
    //    clkMn3_nuclPhos: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclPhos", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'o3 trace');
           thisClass.setLogCmd('style nucleotides o3 trace', true);
        });
    //    },
    //    clkMn3_nuclLines: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclLines", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'lines');
           thisClass.setLogCmd('style nucleotides lines', true);
        });
    //    },
    //    clkMn3_nuclStick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclStick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'stick');
           thisClass.setLogCmd('style nucleotides stick', true);
        });
    //    },
    //    clkMn3_nuclBallstick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclBallstick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'ball and stick');
           thisClass.setLogCmd('style nucleotides ball and stick', true);
        });
    //    },
    //    clkMn3_nuclSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'sphere');
           thisClass.setLogCmd('style nucleotides sphere', true);
        });
    //    },
    //    clkMn3_nuclNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_nuclNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('nucleotides', 'nothing');
           thisClass.setLogCmd('style nucleotides nothing', true);
        });
    //    },
    //    clkMn3_ligLines: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligLines", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'lines');
           thisClass.setLogCmd('style chemicals lines', true);
        });
    //    },
    //    clkMn3_ligStick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligStick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'stick');
           thisClass.setLogCmd('style chemicals stick', true);
        });
    //    },
    //    clkMn3_ligBallstick: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligBallstick", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'ball and stick');
           thisClass.setLogCmd('style chemicals ball and stick', true);
        });
    //    },
    //    clkMn3_ligSchematic: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligSchematic", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'schematic');
           thisClass.setLogCmd('style chemicals schematic', true);
        });
    //    },
    //    clkMn3_ligSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'sphere');
           thisClass.setLogCmd('style chemicals sphere', true);
        });
    //    },
    //    clkMn3_ligNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ligNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('chemicals', 'nothing');
           thisClass.setLogCmd('style chemicals nothing', true);
        });
    //    },

        me.myEventCls.onIds("#" + me.pre + "mn3_glycansCartYes", "click", function(e) { let ic = me.icn3d;
           ic.bGlycansCartoon = true;
           ic.drawCls.draw();
           thisClass.setLogCmd('glycans cartoon yes', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn3_glycansCartNo", "click", function(e) { let ic = me.icn3d;
           ic.bGlycansCartoon = false;
           ic.drawCls.draw();
           thisClass.setLogCmd('glycans cartoon no', true);
        });


    //    clkMn3_hydrogensYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_hydrogensYes", "click", function(e) { let ic = me.icn3d;
           ic.showInterCls.showHydrogens();
           ic.drawCls.draw();
           thisClass.setLogCmd('hydrogens', true);
        });
    //    },
    //    clkMn3_hydrogensNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_hydrogensNo", "click", function(e) { let ic = me.icn3d;
           ic.showInterCls.hideHydrogens();
           ic.drawCls.draw();
           thisClass.setLogCmd('set hydrogens off', true);
        });
    //    },
    //    clkMn3_ionsSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ionsSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('ions', 'sphere');
           thisClass.setLogCmd('style ions sphere', true);
        });
    //    },
    //    clkMn3_ionsDot: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ionsDot", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('ions', 'dot');
           thisClass.setLogCmd('style ions dot', true);
        });
    //    },
    //    clkMn3_ionsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_ionsNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('ions', 'nothing');
           thisClass.setLogCmd('style ions nothing', true);
        });
    //    },
    //    clkMn3_waterSphere: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_waterSphere", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('water', 'sphere');
           thisClass.setLogCmd('style water sphere', true);
        });
    //    },
    //    clkMn3_waterDot: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_waterDot", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('water', 'dot');
           thisClass.setLogCmd('style water dot', true);
        });
    //    },
    //    clkMn3_waterNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_waterNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setStyle('water', 'nothing');
           thisClass.setLogCmd('style water nothing', true);
        });
    //    },
    }

    clickMenu4() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 4
    //    clkMn4_clrSpectrum: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSpectrum", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'spectrum');
           thisClass.setLogCmd('color spectrum', true);
        });
    //    },
    //    clkMn4_clrChain: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrChain", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'chain');
           thisClass.setLogCmd('color chain', true);
        });
    //    },
    //    clkMn4_clrDomain: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrdomain", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'domain');
           thisClass.setLogCmd('color domain', true);
        });
    //    },
    //    clkMn4_clrSSGreen: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSSGreen", "click", function(e) { let ic = me.icn3d;
           ic.sheetcolor = 'green';
           ic.setOptionCls.setOption('color', 'secondary structure green');
           thisClass.setLogCmd('color secondary structure green', true);
        });
    //    },
    //    clkMn4_clrSSYellow: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSSYellow", "click", function(e) { let ic = me.icn3d;
           ic.sheetcolor = 'yellow';
           ic.setOptionCls.setOption('color', 'secondary structure yellow');
           thisClass.setLogCmd('color secondary structure yellow', true);
        });
    //    },
    //    clkMn4_clrSSSpectrum: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSSSpectrum", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'secondary structure spectrum');
           thisClass.setLogCmd('color secondary structure spectrum', true);
        });
    //    },
    //    clkMn4_clrResidue: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrResidue", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'residue');
           thisClass.setLogCmd('color residue', true);
        });
    //    },
    //    clkMn4_clrResidueCustom: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrResidueCustom", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_rescolorfile', 'Please input the file on residue colors');
        });
    //    },
    //    clkMn4_reloadRescolorfile: function() {
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
    //    },
    //    clkMn4_reloadCustomcolorfile: function() {
        me.myEventCls.onIds("#" + me.pre + "reload_customcolorfile", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.startColor = $("#" + me.pre + "startColor").val();
           ic.midColor = $("#" + me.pre + "midColor").val();
           ic.endColor = $("#" + me.pre + "endColor").val();

           let legendHtml = thisClass.setLegendHtml();
           $("#" + me.pre + "legend").html(legendHtml).show();

           ic.addTrackCls.setCustomFile('color', ic.startColor, ic.midColor, ic.endColor);
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
    //    },
    //    clkMn4_clrCharge: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrCharge", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'charge');
           thisClass.setLogCmd('color charge', true);
        });
    //    },
    //    clkMn4_clrHydrophobic: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrHydrophobic", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'hydrophobic');
           thisClass.setLogCmd('color hydrophobic', true);
        });
    //    },
    //    clkMn4_clrAtom: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrAtom", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'atom');
           thisClass.setLogCmd('color atom', true);
        });
    //    },
    //    clkMn4_clrBfactor: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrBfactor", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'b factor');
           thisClass.setLogCmd('color b factor', true);
        });
    //    },
    //    clkMn4_clrArea: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrArea", "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_colorbyarea', "Color based on residue's solvent accessibility");
        });
        me.myEventCls.onIds("#" + me.pre + "applycolorbyarea", "click", function(e) { let ic = me.icn3d;
            ic.midpercent = $("#" + me.pre + 'midpercent').val();
            ic.setOptionCls.setOption('color', 'area');
            thisClass.setLogCmd('color area | ' + ic.midpercent, true);

        });
    //    },
    //    clkMn4_clrBfactorNorm: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrBfactorNorm", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'b factor percentile');
           thisClass.setLogCmd('color b factor percentile', true);
        });
    //    },
    //    clkMn4_clrIdentity: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrIdentity", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'identity');
           thisClass.setLogCmd('color identity', true);
        });
    //    },
    //    clkMn4_clrConserved: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrConserved", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('color', 'conservation');
           thisClass.setLogCmd('color conservation', true);
        });
    //    },
    //    clkMn4_clrCustom: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrCustom", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_clr', 'Color picker');
        });
    //    },
    //    clkMn4_clrOther: function() {
        $(document).on("click", ".icn3d-color-rad-text", function(e) { let ic = me.icn3d;
          e.stopImmediatePropagation();
          //e.preventDefault();
          let color = $(this).attr('color');
          ic.setOptionCls.setOption("color", color);
          thisClass.setLogCmd("color " + color, true);
        });
    //    },
    //    clkMn4_clrSave: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrSave", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.saveColor();
           thisClass.setLogCmd('save color', true);
        });
    //    },
    //    clkMn4_clrApplySave: function() {
        me.myEventCls.onIds("#" + me.pre + "mn4_clrApplySave", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.applySavedColor();
           thisClass.setLogCmd('apply saved color', true);
        });
    //    },
    //    clkMn3_styleSave: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_styleSave", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.saveStyle();
           thisClass.setLogCmd('save style', true);
        });
    //    },
    //    clkMn3_styleApplySave: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_styleApplySave", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.applySavedStyle();
           thisClass.setLogCmd('apply saved style', true);
        });
    //    },
    }

    clickMenu5() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 5
    //    clkMn5_neighborsYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_neighborsYes", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = true;
           ic.applyMapCls.removeLastSurface();
           ic.applyMapCls.applySurfaceOptions();
           if(ic.bRender) ic.drawCls.render();
           thisClass.setLogCmd('set surface neighbors on', true);
        });
    //    },
    //    clkMn5_neighborsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_neighborsNo", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = false;
           ic.applyMapCls.removeLastSurface();
           ic.applyMapCls.applySurfaceOptions();
           if(ic.bRender) ic.drawCls.render();
           thisClass.setLogCmd('set surface neighbors off', true);
        });
    //    },
    //    clkMn5_surfaceVDW: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceVDW", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'Van der Waals surface');
           thisClass.setLogCmd('set surface Van der Waals surface', true);
        });
    //    },
    //    clkMn5_surfaceSAS: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceSAS", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'solvent accessible surface');
           thisClass.setLogCmd('set surface solvent accessible surface', true);
        });
    //    },
    //    clkMn5_surfaceMolecular: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceMolecular", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = false;
           ic.setOptionCls.setOption('surface', 'molecular surface');
           thisClass.setLogCmd('set surface molecular surface', true);
        });
    //    },
    //    clkMn5_surfaceVDWContext: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceVDWContext", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'Van der Waals surface with context');
           thisClass.setLogCmd('set surface Van der Waals surface with context', true);
        });
    //    },
    //    clkMn5_surfaceSASContext: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceSASContext", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'solvent accessible surface with context');
           thisClass.setLogCmd('set surface solvent accessible surface with context', true);
        });
    //    },
    //    clkMn5_surfaceMolecularContext: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceMolecularContext", "click", function(e) { let ic = me.icn3d;
           ic.bConsiderNeighbors = true;
           ic.setOptionCls.setOption('surface', 'molecular surface with context');
           thisClass.setLogCmd('set surface molecular surface with context', true);
        });
    //    },
    //    clkMn5_surfaceNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_surfaceNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('surface', 'nothing');
           thisClass.setLogCmd('set surface nothing', true);
        });
    //    },

    /*
        $("." + me.pre + "mn5_opacity").each(function() {
           let value = $(this).attr('v');

           $(this, "click", function(e) { let ic = me.icn3d;
               ic.setOptionCls.setOption('opacity', value);
               thisClass.setLogCmd('set surface opacity ' + value, true);
           });
        });
    */

        $(document).on("click", "." + me.pre + "mn5_opacity", function(e) { let ic = me.icn3d;
           let value = $(this).attr('v');
           ic.setOptionCls.setOption('opacity', value);
           thisClass.setLogCmd('set surface opacity ' + value, true);
        });

    //    clkMn5_wireframeYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_wireframeYes", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('wireframe', 'yes');
           thisClass.setLogCmd('set surface wireframe on', true);
        });
    //    },
    //    clkMn5_wireframeNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_wireframeNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('wireframe', 'no');
           thisClass.setLogCmd('set surface wireframe off', true);
        });
    //    },
    //    clkMn5_elecmap2fofc: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_elecmap2fofc", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_elecmap2fofc', '2Fo-Fc Electron Density Map');
        });
    //    },
    //    clkMn5_elecmapfofc: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_elecmapfofc", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_elecmapfofc', 'Fo-Fc Electron Density Map');
        });
    //    },
    //    clkMn5_elecmapNo: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn5_elecmapNo", "#" + me.pre + "elecmapNo2", "#" + me.pre + "elecmapNo3", "#" + me.pre + "elecmapNo4", "#" + me.pre + "elecmapNo5"], "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('map', 'nothing');
           thisClass.setLogCmd('setoption map nothing', true);
        });
    //    },
        me.myEventCls.onIds(["#" + me.pre + "delphimapNo", "#" + me.pre + "phimapNo", "#" + me.pre + "phiurlmapNo", "#" + me.pre + "mn1_phimapNo"], "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('phimap', 'nothing');
           thisClass.setLogCmd('setoption phimap nothing', true);
        });

        me.myEventCls.onIds(["#" + me.pre + "delphimapNo2", "#" + me.pre + "phimapNo2", "#" + me.pre + "phiurlmapNo2"], "click", function(e) { let ic = me.icn3d;
           //ic.setOptionCls.setOption('surface', 'nothing');
           //thisClass.setLogCmd('set surface nothing', true);
           ic.setOptionCls.setOption('phisurface', 'nothing');
           thisClass.setLogCmd('setoption phisurface nothing', true);
        });

    //    clickApplymap2fofc: function() {
        me.myEventCls.onIds("#" + me.pre + "applymap2fofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let sigma2fofc = parseFloat($("#" + me.pre + "sigma2fofc" ).val());
           let type = '2fofc';
           ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigma2fofc);
           //ic.setOptionCls.setOption('map', '2fofc');
           thisClass.setLogCmd('set map 2fofc sigma ' + sigma2fofc, true);
        });
    //    },
    //    clickApplymapfofc: function() {
        me.myEventCls.onIds("#" + me.pre + "applymapfofc", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let sigmafofc = parseFloat($("#" + me.pre + "sigmafofc" ).val());
           let type = 'fofc';
           ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigmafofc);
           //ic.setOptionCls.setOption('map', 'fofc');
           thisClass.setLogCmd('set map fofc sigma ' + sigmafofc, true);
        });
    //    },
    //    clkMn5_mapwireframeYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_mapwireframeYes", "click", function(e) { let ic = me.icn3d;
           //ic.dsn6ParserCls.dsn6Parser(ic.inputid);
           ic.setOptionCls.setOption('mapwireframe', 'yes');
           thisClass.setLogCmd('set map wireframe on', true);
        });
    //    },
    //    clkMn5_mapwireframeNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_mapwireframeNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('mapwireframe', 'no');
           thisClass.setLogCmd('set map wireframe off', true);
        });
    //    },
    //    clkMn5_emmap: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_emmap", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_emmap', 'EM Density Map');
        });
    //    },
    //    clkMn5_emmapNo: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn5_emmapNo", "#" + me.pre + "emmapNo2"], "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('emmap', 'nothing');
           thisClass.setLogCmd('setoption emmap nothing', true);
        });
    //    },
    //    clickApplyemmap: function() {
        me.myEventCls.onIds("#" + me.pre + "applyemmap", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           let empercentage = parseFloat($("#" + me.pre + "empercentage" ).val());
           let type = 'em';
           //ic.emd = 'emd-3906';

           ic.densityCifParserCls.densityCifParser(ic.inputid, type, empercentage, ic.emd);
           thisClass.setLogCmd('set emmap percentage ' + empercentage, true);
        });
    //    },
    //    clkMn5_emmapwireframeYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_emmapwireframeYes", "click", function(e) { let ic = me.icn3d;
           //ic.dsn6ParserCls.dsn6Parser(ic.inputid);
           ic.setOptionCls.setOption('emmapwireframe', 'yes');
           thisClass.setLogCmd('set emmap wireframe on', true);
        });
    //    },
    //    clkMn5_emmapwireframeNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn5_emmapwireframeNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('emmapwireframe', 'no');
           thisClass.setLogCmd('set emmap wireframe off', true);
        });
    //    },
    }

    clickMenu6() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
    // mn 6
    //    clkMn6_assemblyYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_assemblyYes", "click", function(e) { let ic = me.icn3d;
           ic.bAssembly = true;
           thisClass.setLogCmd('set assembly on', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_assemblyNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_assemblyNo", "click", function(e) { let ic = me.icn3d;
           ic.bAssembly = false;
           thisClass.setLogCmd('set assembly off', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelAtoms: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelAtoms", "click", function(e) { let ic = me.icn3d;
           ic.residueLabelsCls.addAtomLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add atom labels', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelResidues: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelResidues", "click", function(e) { let ic = me.icn3d;
           ic.residueLabelsCls.addResidueLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add residue labels', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelResnum: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelResnum", "click", function(e) { let ic = me.icn3d;
           ic.residueLabelsCls.addResidueLabels(ic.hAtoms, undefined, undefined, true);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add residue number labels', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelChains: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelChains", "click", function(e) { let ic = me.icn3d;
           ic.analysisCls.addChainLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add chain labels', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelTermini: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelTermini", "click", function(e) { let ic = me.icn3d;
           ic.analysisCls.addTerminiLabels(ic.hAtoms);
           ic.selectionCls.saveSelectionIfSelected();
           thisClass.setLogCmd('add terminal labels', true);
           ic.drawCls.draw();
        });
    //    },
    //    clkMn6_addlabelYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelYes", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_addlabel', 'Add custom labels by selection');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });
    //    },
    //    clkMn6_addlabelSelection: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_addlabelSelection", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_addlabelselection', 'Add custom labels by the selected');
        });
    //    },
    //    clkMn2_saveselection: function() {
        me.myEventCls.onIds("#" + me.pre + "mn2_saveselection", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_saveselection', 'Save the selected');
        });
    //    },
    //    clkMn6_addlabelNo: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn6_addlabelNo", "#" + me.pre + "removeLabels"], "click", function(e) { let ic = me.icn3d;
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
    //    },

    /*
        $("." + me.pre + "mn6_labelscale").each(function() {
           let value = $(this).attr('v');

           $(this, "click", function(e) { let ic = me.icn3d;
               ic.labelScale = value;
               ic.drawCls.draw();
               thisClass.setLogCmd('set label scale ' + value, true);
           });
        });
    */
        $(document).on("click", "." + me.pre + "mn6_labelscale", function(e) { let ic = me.icn3d;
           let value = $(this).attr('v');
           ic.labelScale = value;
           ic.drawCls.draw();
           thisClass.setLogCmd('set label scale ' + value, true);
        });

    //    clkMn6_distanceYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_distanceYes", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_distance', 'Measure the distance of atoms');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
           ic.bMeasureDistance = true;
        });
    //    },

        me.myEventCls.onIds("#" + me.pre + "mn6_distTwoSets", "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_disttwosets', 'Measure the distance between two sets');

            if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
               let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
               ic.definedSetsCls.setPredefinedInMenu();
               ic.bSetChainsAdvancedMenu = true;
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            }
            let definedAtomsHtml = ic.definedSetsCls.setAtomMenu(['protein']);
            if($("#" + me.pre + "atomsCustomDist").length) {
                $("#" + me.pre + "atomsCustomDist").html("  <option value='selected'>selected</option>" + definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomDist2").length) {
                $("#" + me.pre + "atomsCustomDist2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
            }

           $("#" + me.pre + "atomsCustomDist").resizable();
           $("#" + me.pre + "atomsCustomDist2").resizable();

           ic.bMeasureDistance = true;
        });

    //    clkMn6_distanceNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_distanceNo", "click", function(e) { let ic = me.icn3d;
           ic.pickpair = false;
           let select = "set lines off";
           thisClass.setLogCmd(select, true);
           ic.labels['distance'] = [];
           ic.lines['distance'] = [];
           ic.distPnts = [];
           ic.pk = 2;
           ic.drawCls.draw();
        });
    //    },
    //    clkMn2_selectedcenter: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn2_selectedcenter", "#" + me.pre + "zoomin_selection"], "click", function(e) { let ic = me.icn3d;
           //thisClass.setLogCmd('zoom selection', true);
           ic.transformCls.zoominSelection();
           ic.drawCls.draw();
           thisClass.setLogCmd('zoom selection', true);
        });
    //    },
    //    clkMn6_center: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_center", "click", function(e) { let ic = me.icn3d;
           //thisClass.setLogCmd('center selection', true);
           ic.applyCenterCls.centerSelection();
           ic.drawCls.draw();
           thisClass.setLogCmd('center selection', true);
        });
    //    },
    //    clkMn6_resetOrientation: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn6_resetOrientation", "#" + me.pre + "resetOrientation"], "click", function(e) { let ic = me.icn3d;
           //thisClass.setLogCmd('reset orientation', true);
           ic.transformCls.resetOrientation();
           //ic.setColorCls.applyOriginalColor();
           ic.drawCls.draw();
           thisClass.setLogCmd('reset orientation', true);
        });
    //    },
    //    clkMn6_chemicalbindingshow: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn6_chemicalbindingshow", "#" + me.pre + "chemicalbindingshow"], "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('chemicalbinding', 'show');
           thisClass.setLogCmd('set chemicalbinding show', true);
        });
    //    },
    //    clkMn6_chemicalbindinghide: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn6_chemicalbindinghide", "#" + me.pre + "chemicalbindinghide"], "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('chemicalbinding', 'hide');
           thisClass.setLogCmd('set chemicalbinding hide', true);
        });
    //    },
    //    clkMn6_sidebyside: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_sidebyside", "click", function(e) { let ic = me.icn3d;
           let bSidebyside = true;
           let url = ic.shareLinkCls.shareLinkUrl(undefined);
           if(url.indexOf('http') !== 0) {
               alert("The url is more than 4000 characters and may not work.");
           }
           else {
               url = url.replace("full.html", "full2.html");
               url += '&closepopup=1';
               window.open(url, '_blank');
               thisClass.setLogCmd('side by side | ' + url, true);
           }
        });
    //    },
    /*
        $("." + me.pre + "mn6_rotate").each(function() {
           let value = $(this).attr('v').toLowerCase();
           let direction = value.split(' ')[1];

           $(this, "click", function(e) { let ic = me.icn3d;
               thisClass.setLogCmd(value, true);
               ic.bStopRotate = false;
               ic.transformCls.rotateCount = 0;
               ic.transformCls.rotateCountMax = 6000;
               ic.ROT_DIR = direction;
               ic.resizeCanvasCls.rotStruc(direction);
           });
        });

        $("." + me.pre + "mn6_rotate90").each(function() {
           let value = $(this).attr('v').toLowerCase();
           let direction = value.split('-')[0];

           $(this, "click", function(e) { let ic = me.icn3d;
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
        });
    */

        $(document).on("click", "." + me.pre + "mn6_rotate", function(e) { let ic = me.icn3d;
           let value = $(this).attr('v').toLowerCase();
           let direction = value.split(' ')[1];

           thisClass.setLogCmd(value, true);
           ic.bStopRotate = false;
           ic.transformCls.rotateCount = 0;
           ic.transformCls.rotateCountMax = 6000;
           ic.ROT_DIR = direction;
           ic.resizeCanvasCls.rotStruc(direction);
        });

        $(document).on("click", "." + me.pre + "mn6_rotate90", function(e) { let ic = me.icn3d;
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

    //    clkMn6_cameraPers: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_cameraPers", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('camera', 'perspective');
           thisClass.setLogCmd('set camera perspective', true);
        });
    //    },
    //    clkMn6_cameraOrth: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_cameraOrth", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('camera', 'orthographic');
           thisClass.setLogCmd('set camera orthographic', true);
        });
    //    },
    //    clkMn6_bkgdBlack: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdBlack", "click", function(e) { let ic = me.icn3d;
           ic.setStyleCls.setBackground('black');
        });
    //    },
    //    clkMn6_bkgdGrey: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdGrey", "click", function(e) { let ic = me.icn3d;
           ic.setStyleCls.setBackground('grey');
        });
    //    },
    //    clkMn6_bkgdWhite: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdWhite", "click", function(e) { let ic = me.icn3d;
           ic.setStyleCls.setBackground('white');
        });
    //    },
    //    clkMn6_bkgdTransparent: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_bkgdTransparent", "click", function(e) { let ic = me.icn3d;
           ic.setStyleCls.setBackground('transparent');
        });
    //    },
    //    clkMn6_showfogYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showfogYes", "click", function(e) { let ic = me.icn3d;
           //ic.setOptionCls.setOption('fog', 'yes');
           ic.opts['fog'] = 'yes';
           ic.fogCls.setFog(true);
           ic.drawCls.draw();
           thisClass.setLogCmd('set fog on', true);
        });
    //    },
    //    clkMn6_showfogNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showfogNo", "click", function(e) { let ic = me.icn3d;
           //ic.setOptionCls.setOption('fog', 'no');
           ic.opts['fog'] = 'no';
           ic.fogCls.setFog(true);
           ic.drawCls.draw();
           thisClass.setLogCmd('set fog off', true);
        });
    //    },
    //    clkMn6_showslabYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showslabYes", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('slab', 'yes');
           thisClass.setLogCmd('set slab on', true);
        });
    //    },
    //    clkMn6_showslabNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showslabNo", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('slab', 'no');
           thisClass.setLogCmd('set slab off', true);
        });
    //    },
    //    clkMn6_showaxisYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisYes", "click", function(e) { let ic = me.icn3d;
           ic.setOptionCls.setOption('axis', 'yes');
           thisClass.setLogCmd('set axis on', true);
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisSel", "click", function(e) { let ic = me.icn3d;
           ic.pc1 = true;

           ic.axesCls.setPc1Axes();
           thisClass.setLogCmd('set pc1 axis', true);
        });

    //    },
    //    clkMn6_showaxisNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_showaxisNo", "click", function(e) { let ic = me.icn3d;
           ic.pc1 = false;
           ic.axes = [];

           ic.setOptionCls.setOption('axis', 'no');

           thisClass.setLogCmd('set axis off', true);
        });
    //    },
    //    clkMn6_symmetry: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_symmetry", "click", function(e) { let ic = me.icn3d;
           ic.bAxisOnly = false;
           ic.symdCls.retrieveSymmetry(Object.keys(ic.structures)[0]);
           //me.htmlCls.dialogCls.openDlg('dl_symmetry', 'Symmetry');
        });

        me.myEventCls.onIds("#" + me.pre + "mn6_symd", "click", function(e) { let ic = me.icn3d;
           ic.bAxisOnly = false;
           ic.symdCls.retrieveSymd();
           ic.bSymd = true;
           //me.htmlCls.dialogCls.openDlg('dl_symmetry', 'Symmetry');

           //var title = $("#" + me.pre + "selectSymd" ).val();
           //thisClass.setLogCmd('symd symmetry ' + title, true);
           thisClass.setLogCmd('symd symmetry', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_clear_sym", "click", function(e) { let ic = me.icn3d;
           ic.symdArray = [];
           ic.drawCls.draw();
           thisClass.setLogCmd('clear symd symmetry', true);
        });
        me.myEventCls.onIds("#" + me.pre + "mn6_axes_only", "click", function(e) { let ic = me.icn3d;
           ic.bAxisOnly = true;
           ic.drawCls.draw();
           thisClass.setLogCmd('show axis', true);
        });

    //    },
    //    clkMn6_area: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_area", "click", function(e) { let ic = me.icn3d;
            ic.analysisCls.calculateArea();
            thisClass.setLogCmd('area', true);
        });
    //    },
    //    clkMn6_applysymmetry: function() {
        me.myEventCls.onIds("#" + me.pre + "applysymmetry", "click", function(e) { let ic = me.icn3d;
           ic.bAxisOnly = false;

           let title = $("#" + me.pre + "selectSymmetry" ).val();

           ic.symmetrytitle =(title === 'none') ? undefined : title;
           //if(title !== 'none') ic.applySymmetry(title);
           ic.drawCls.draw();
           thisClass.setLogCmd('symmetry ' + title, true);
        });
        me.myEventCls.onIds("#" + me.pre + "clearsymmetry", "click", function(e) { let ic = me.icn3d;
           let title = 'none';
           ic.symmetrytitle = undefined;
           ic.drawCls.draw();
           thisClass.setLogCmd('symmetry ' + title, true);
        });

    /*
        me.myEventCls.onIds("#" + me.pre + "applysymd", "click", function(e) { let ic = me.icn3d;
           let title = $("#" + me.pre + "selectSymd" ).val();
           ic.symdtitle =(title === 'none') ? undefined : title;
           ic.drawCls.draw();
           thisClass.setLogCmd('symd symmetry ' + title, true);
        });
        me.myEventCls.onIds("#" + me.pre + "clearsymd", "click", function(e) { let ic = me.icn3d;
           let title = 'none';
           ic.symdtitle = undefined;
           ic.drawCls.draw();
           thisClass.setLogCmd('symd symmetry ' + title, true);
        });
    */

    //    },
    //    clkMn6_hbondsYes: function() {
        me.myEventCls.onIds(["#" + me.pre + "mn6_hbondsYes", "#" + me.pre + "hbondsYes"], "click", function(e) { let ic = me.icn3d;
            if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
               let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
               ic.definedSetsCls.setPredefinedInMenu();
               ic.bSetChainsAdvancedMenu = true;
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            }
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

        me.myEventCls.onIds(["#" + me.pre + "mn6_contactmap"], "click", function(e) { let ic = me.icn3d;
            me.htmlCls.dialogCls.openDlg('dl_contact', 'Set contact map');
        });

    //    },
    //    clkMn6_hbondsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_hbondsNo", "click", function(e) { let ic = me.icn3d;
           ic.showInterCls.hideHbondsContacts();
           ic.drawCls.draw();
        });
    //    },
    //    clkmn1_stabilizerYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerYes", "click", function(e) { let ic = me.icn3d;
           //me.htmlCls.dialogCls.openDlg('dl_stabilizer', 'Hydrogen bonds inside selection');
           let select = "stabilizer";
           ic.threeDPrintCls.addStabilizer();
           ic.threeDPrintCls.prepareFor3Dprint();
           //ic.drawCls.draw();
           thisClass.setLogCmd(select, true);
        });
    //    },
    //    clkmn1_stabilizerNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerNo", "click", function(e) { let ic = me.icn3d;
           let select = "set stabilizer off";
           thisClass.setLogCmd(select, true);
           ic.threeDPrintCls.hideStabilizer();
           ic.drawCls.draw();
        });
    //    },
    //    clkmn1_stabilizerOne: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerOne", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_stabilizer', 'Add One Stabilizer');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });
    //    },
    //    clkmn1_stabilizerRmOne: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_stabilizerRmOne", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_stabilizer_rm', 'Remove One Stabilizer');
           ic.pk = 1;
           ic.opts['pk'] = 'atom';
           ic.pickpair = true;
           ic.pAtomNum = 0;
        });
    //    },
    //    clkmn1_thicknessSet: function() {
        me.myEventCls.onIds("#" + me.pre + "mn1_thicknessSet", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_thickness', 'Set Thickness for 3D Printing');
        });
    //    },
    //    clkmn5_setThickness: function() {
        me.myEventCls.onIds("#" + me.pre + "mn3_setThickness", "click", function(e) { let ic = me.icn3d;
           me.htmlCls.dialogCls.openDlg('dl_thickness2', 'Preferences');
        });
    //    },
    //    clkmn1_thicknessReset: function() {
/*
        me.myEventCls.onIds("#" + me.pre + "mn1_thicknessReset", "click", function(e) { let ic = me.icn3d;
           let select = "reset thickness";
           thisClass.setLogCmd(select, true);
           ic.bSetThickness = false;
           ic.threeDPrintCls.resetAfter3Dprint();
           ic.drawCls.draw();
        });
*/
    //    },
    //    clkMn6_ssbondsYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsYes", "click", function(e) { let ic = me.icn3d;
           let select = "disulfide bonds";
           thisClass.setLogCmd(select, true);
           ic.annoSsbondCls.showSsbonds();
        });
    //    },
    //    clkMn6_ssbondsExport: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsExport", "click", function(e) { let ic = me.icn3d;
           ic.viewInterPairsCls.exportSsbondPairs();
           thisClass.setLogCmd("export disulfide bond pairs", false);
        });
    //    },
    //    clkMn6_ssbondsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_ssbondsNo", "click", function(e) { let ic = me.icn3d;
           ic.opts["ssbonds"] = "no";
           let select = "set disulfide bonds off";
           thisClass.setLogCmd(select, true);
           ic.lines['ssbond'] = [];
           ic.setOptionCls.setStyle('sidec', 'nothing');
        });
    //    },
    //    clkMn6_clbondsYes: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsYes", "click", function(e) { let ic = me.icn3d;
           let select = "cross linkage";
           thisClass.setLogCmd(select, true);
           //ic.bShowCrossResidueBond = true;
           //ic.setOptionCls.setStyle('proteins', 'lines')
           ic.showInterCls.showClbonds();
        });
    //    },
    //    clkMn6_clbondsExport: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsExport", "click", function(e) { let ic = me.icn3d;
           ic.viewInterPairsCls.exportClbondPairs();
           thisClass.setLogCmd("export cross linkage pairs", false);
        });
    //    },
    //    clkMn6_clbondsNo: function() {
        me.myEventCls.onIds("#" + me.pre + "mn6_clbondsNo", "click", function(e) { let ic = me.icn3d;
           ic.opts["clbonds"] = "no";
           let select = "set cross linkage off";
           thisClass.setLogCmd(select, true);
           //ic.bShowCrossResidueBond = false;
           //ic.setOptionCls.setStyle('proteins', 'ribbon')
           ic.lines['clbond'] = [];
           ic.setOptionCls.setStyle('sidec', 'nothing');
        });
    //    },
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
          ic.logs.push(str);
          // move cursor to the end, and scroll to the end
          $("#" + me.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
      }
      ic.setStyleCls.adjustIcon();
    }
}

export {ClickMenu}
