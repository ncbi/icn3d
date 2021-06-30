/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {DefinedSets} from '../selection/definedSets.js';
import {ShowInter} from '../interaction/showInter.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Selection} from '../selection/selection.js';
import {Draw} from '../display/draw.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {LineGraph} from '../interaction/lineGraph.js';
import {GetGraph} from '../interaction/getGraph.js';
import {ParserUtils} from '../parsers/parserUtils.js';
import {SaveFile} from '../export/saveFile.js';
import {HlUpdate} from '../highlight/hlUpdate.js';

class ViewInterPairs {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    viewInteractionPairs(nameArray2, nameArray, bHbondCalc, type,
      bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking, contactDist) { var ic = this.icn3d, me = ic.icn3dui;
       var bondCnt;

       // type: view, save, forcegraph
       ic.bRender = false;
       var hAtoms = {}
       var prevHatoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

       var bContactMapLocal = (type == 'calpha' || type == 'cbeta' || type == 'heavyatoms');

       var atomSet1 = {}, atomSet2 = {};
       if(bContactMapLocal) { // contact map
           for(var i in ic.hAtoms) {
               var atom = ic.atoms[i];
               if(atom.het) continue;

               if(type == 'calpha' && (atom.elem == 'C' && atom.name != 'CA')) continue;
               if(type == 'cbeta' && (atom.elem == 'C' && atom.name != 'CB')) continue;

               atomSet1[i] = atom;
               atomSet2[i] = atom;
           }
       }
       else {
           atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
           atomSet2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
       }

       var labelType; // residue, chain, structure
       var cntChain = 0, cntStructure = 0;
       for(var structure in ic.structures) {
           var bStructure = false;
           for(var i = 0, il = ic.structures[structure].length; i < il; ++i) {
               var chainid = ic.structures[structure][i];
               for(var serial in ic.chains[chainid]) {
                   if(atomSet1.hasOwnProperty(serial) || atomSet2.hasOwnProperty(serial)) {
                       ++cntChain;
                       bStructure = true;
                       break;
                   }
               }
           }
           ++cntStructure;
       }
       if(cntStructure > 1) labelType = 'structure';
       else if(cntChain > 1) labelType = 'chain';
       else labelType = 'residue';
       // fixed order of interaction type
       var interactionTypes = [];
       if(bHbond) {
           interactionTypes.push('hbonds');
       }
       if(bSaltbridge) {
           interactionTypes.push('salt bridge');
       }
       if(bInteraction) {
           interactionTypes.push('interactions');
       }
       if(bHalogen) {
           interactionTypes.push('halogen');
       }
       if(bPication) {
           interactionTypes.push('pi-cation');
       }
       if(bPistacking) {
           interactionTypes.push('pi-stacking');
       }
       if(!bHbondCalc) {
           ic.resids2inter = {}
           ic.resids2interAll = {}
       }
       if(bSaltbridge) {
           var threshold = parseFloat($("#" + ic.pre + "saltbridgethreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsIonic;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               //ic.showInterCls.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true, type);
               ic.showInterCls.showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
       }
       if(bHbond) {
           var threshold = parseFloat($("#" + ic.pre + "hbondthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsHbond;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, undefined, type);
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
       }
       // switch display order, show hydrogen first
       var tableHtml = '';
       if(bHbond) {
           tableHtml += this.exportHbondPairs(type, labelType);
       }
       if(bSaltbridge) {
           tableHtml += this.exportSaltbridgePairs(type, labelType);
       }
       if(bHalogen) {
           var threshold = parseFloat($("#" + ic.pre + "halogenthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsHalogen;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'halogen');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           tableHtml += this.exportHalogenPiPairs(type, labelType, 'halogen');
       }
       if(bPication) {
           var threshold = parseFloat($("#" + ic.pre + "picationthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsPication;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-cation');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           tableHtml += this.exportHalogenPiPairs(type, labelType, 'pi-cation');
       }
       if(bPistacking) {
           var threshold = parseFloat($("#" + ic.pre + "pistackingthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsPistacking;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-stacking');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           //tableHtml += this.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           var tmp = this.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           tableHtml += tmp;
       }
       if(bInteraction) {
           var threshold = (bContactMapLocal) ? contactDist : parseFloat($("#" + ic.pre + "contactthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsContact;
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
                if(!bHbondCalc) {
                    ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
                    ic.showInterCls.pickCustomSphere(threshold, nameArray2, nameArray, bHbondCalc, true, type);
                }
                hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
                tableHtml += this.exportSpherePairs(true, type, labelType);
           }
           else { // contact in a set, atomSet1 same as atomSet2
                if(!bHbondCalc) {
                    var residues = {};
                    var resid2ResidhashInteractions = {};

                    if(bContactMapLocal) {
                        var bIncludeTarget = true;
                        var result = ic.showInterCls.pickCustomSphere_base(threshold, atomSet1, atomSet2, bHbondCalc, true, undefined, undefined, true, bIncludeTarget);
                        residues = me.hashUtilsCls.unionHash(residues, result.residues);
                        for(var resid in result.resid2Residhash) {
                            resid2ResidhashInteractions[resid] = me.hashUtilsCls.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                        }
                    }
                    else {
                        var ssAtomsArray = [];
                        var prevSS = '', prevChain = '';
                        var ssAtoms = {}
                        for(var i in atomSet1) {
                            var atom = ic.atoms[i];
                            if(atom.ss != prevSS || atom.chain != prevChain) {
                                if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                                ssAtoms = {}
                            }
                            ssAtoms[atom.serial] = 1;
                            prevSS = atom.ss;
                            prevChain = atom.chain;
                        }
                        // last ss
                        if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                        var len = ssAtomsArray.length;
                        var interStr = '';
                        select = "interactions " + threshold + " | sets " + nameArray2 + " " + nameArray + " | true";
                        ic.opts['contact'] = "yes";

                        for(var i = 0; i < len; ++i) {
                            for(var j = i + 1; j < len; ++j) {
                                ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
                                var result = ic.showInterCls.pickCustomSphere_base(threshold, ssAtomsArray[i], ssAtomsArray[j], bHbondCalc, true, type, select, true);
                                residues = me.hashUtilsCls.unionHash(residues, result.residues);
                                for(var resid in result.resid2Residhash) {
                                    resid2ResidhashInteractions[resid] = me.hashUtilsCls.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                                }
                            }
                        }
                    }

                    ic.resid2ResidhashInteractions = resid2ResidhashInteractions;
                    var residueArray = Object.keys(residues);
                    ic.hAtoms = {}
                    for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
                      var residueid = residueArray[index];
                      for(var i in ic.residues[residueid]) {
                        ic.hAtoms[i] = 1;
                      }
                    }
                    // do not change the set of displaying atoms
                    //ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
                    var commandname, commanddesc;
                    var firstAtom = ic.firstAtomObjCls.getFirstAtomObj(residues);
                    if(firstAtom !== undefined) {
                        commandname = "sphere." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
                        if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + ic.pre + "contactthreshold").val() + "A";
                        commanddesc = commandname;
                        ic.selectionCls.addCustomSelection(residueArray, commandname, commanddesc, select, true);
                    }
                    ic.selectionCls.saveSelectionIfSelected();
                    ic.drawCls.draw();
                }
                hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
                tableHtml += this.exportSpherePairs(true, type, labelType);
           } // same set
       }
       ic.hAtoms = me.hashUtilsCls.cloneHash(hAtoms);
       ic.bRender = true;
       //ic.hlUpdateCls.updateHlAll();
       ic.drawCls.draw();
       var residHash, select, commandname, commanddesc;
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(hAtoms);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_all';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       var interface1 = me.hashUtilsCls.intHash(hAtoms, atomSet1);
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(interface1);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_1';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       var interface2 = me.hashUtilsCls.intHash(hAtoms, atomSet2);
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(interface2);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_2';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       //var html = '<div style="text-align:center"><b>Hydrogen Bonds, Salt Bridges, Contacts, Halogen Bonds, &pi;-cation, &pi;-stacking between Two Sets:</b><br>';
       var html = '<div style="text-align:center"><b>' + interactionTypes.join(', ') + ' between Two Sets:</b><br>';
       var residueArray1 = ic.resid2specCls.atoms2residues(Object.keys(atomSet1));
       var residueArray2 = ic.resid2specCls.atoms2residues(Object.keys(atomSet2));
       var cmd1 = 'select ' + ic.resid2specCls.residueids2spec(residueArray1);
       var cmd2 = 'select ' + ic.resid2specCls.residueids2spec(residueArray2);
       html += 'Set 1: ' + nameArray2 + ' <button class="' + ic.pre + 'selset" cmd="' + cmd1 + '">Highlight in 3D</button><br>';
       html += 'Set 2: ' + nameArray + ' <button class="' + ic.pre + 'selset" cmd="' + cmd2 + '">Highlight in 3D</button><br><br></div>';
       html += '<div style="text-align:center"><b>The interfaces are:</b><br>';
       var residueArray3 = ic.resid2specCls.atoms2residues(Object.keys(interface1));
       var residueArray4 = ic.resid2specCls.atoms2residues(Object.keys(interface2));
       var cmd3 = 'select ' + ic.resid2specCls.residueids2spec(residueArray3);
       var cmd4 = 'select ' + ic.resid2specCls.residueids2spec(residueArray4);
       html += 'interface_1 <button class="' + ic.pre + 'selset" cmd="' + cmd3 + '">Highlight in 3D</button><br>';
       html += 'interface_2 <button class="' + ic.pre + 'selset" cmd="' + cmd4 + '">Highlight in 3D</button><br><br></div>';
       html += '<div><b>Note</b>: Each checkbox below selects the corresponding residue. '
         + 'You can click "Save Selection" in the "Select" menu to save the selection '
         + 'and click on "Highlight" button to clear the checkboxes.</div><br>';
       var header = html;
       if(type == 'graph' || type == 'linegraph' || type == 'scatterplot' || bContactMapLocal) html = '';
       html += tableHtml;

       if(type == 'save1' || type == 'save2') {
           html = header;
           var tmpText = '';
           if(type == 'save1') {
               tmpText = 'Set 1';
           }
           else if(type == 'save2') {
               tmpText = 'Set 2';
           }
           html += '<div style="text-align:center"><br><b>Interactions Sorted on ' + tmpText + '</b>: <button class="' + ic.pre + 'showintercntonly" style="margin-left:20px">Show Count Only</button><button class="' + ic.pre + 'showinterdetails" style="margin-left:20px">Show Details</button></div>';
           html += this.getAllInteractionTable(type).html;
           bondCnt = this.getAllInteractionTable(type).bondCnt;

           $("#" + ic.pre + "dl_interactionsorted").html(html);
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_interactionsorted', 'Show sorted interactions');
       }
       else if(type == 'view') {
           $("#" + ic.pre + "dl_allinteraction").html(html);
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_allinteraction', 'Show interactions');
       }
       else if(type == 'linegraph') {
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
           var bLine = true;
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bLinegraph = true;
           // draw SVG
           var svgHtml = ic.lineGraphCls.drawLineGraph(ic.graphStr);
           $("#" + ic.pre + "linegraphDiv").html(svgHtml);
       }
       else if(type == 'scatterplot') {
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
           var bLine = true;
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bScatterplot = true;
           // draw SVG
           var svgHtml = ic.lineGraphCls.drawLineGraph(ic.graphStr, true);
           $("#" + ic.pre + "scatterplotDiv").html(svgHtml);
       }
       else if(bContactMapLocal) {
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_contactmap', 'Show contacts as contact map');
           var bLine = true;
           var bAnyAtom = true;
           var graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType, bAnyAtom);
           ic.bContactMap = true;
           // draw SVG
           var svgHtml = ic.contactMapCls.drawContactMap(graphStr);
           $("#" + ic.pre + "contactmapDiv").html(svgHtml);
       }
       else if(type == 'graph') {
           // atomSet1 and atomSet2 are in the right order here
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bGraph = true;
           // show only displayed set in 2D graph
           if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(ic.dAtoms).length) {
               ic.graphStr = ic.getGraphCls.getGraphDataForDisplayed();
           }

           if(ic.bD3 === undefined) {
               //var url = "https://d3js.org/d3.v4.min.js";
               var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/script/d3v4-force-all.min.js";
               $.ajax({
                  url: url,
                  dataType: "script",
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                       ic.bD3 = true;

                       $("#" + ic.icn3dui.svgid).empty();
                       ic.icn3dui.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
                       ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
                       if(ic.deferredGraphinteraction !== undefined) ic.deferredGraphinteraction.resolve();
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if(this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    if(ic.deferredGraphinteraction !== undefined) ic.deferredGraphinteraction.resolve();
                    return;
                  }
               });
           }
           else {
               $("#" + ic.icn3dui.svgid).empty();
               ic.icn3dui.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
               ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
           }
       }
       return {interactionTypes: interactionTypes.toString(), bondCnt: bondCnt};
    }

    clearInteractions() { var ic = this.icn3d, me = ic.icn3dui;
        ic.lines['hbond'] = [];
        ic.hbondpnts = [];
        ic.lines['saltbridge'] = [];
        ic.saltbridgepnts = [];
        ic.lines['contact'] = [];
        ic.contactpnts = [];

        ic.lines['halogen'] = [];
        ic.lines['pi-cation'] = [];
        ic.lines['pi-stacking'] = [];
        ic.halogenpnts = [];
        ic.picationpnts = [];
        ic.pistackingpnts = [];
    }

    resetInteractionPairs() { var ic = this.icn3d, me = ic.icn3dui;
       ic.bHbondCalc = false;
       //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set calculate hbond false', true);
       ic.showInterCls.hideHbondsContacts();
       ic.hlUpdateCls.clearHighlight();
       // reset the interaction pairs
       ic.resids2inter = {}
       ic.resids2interAll = {}
    }

    retrieveInteractionData() { var ic = this.icn3d, me = ic.icn3dui;
         if(!ic.b2DShown) {
             if(ic.icn3dui.cfg.align !== undefined) {
                 var structureArray = Object.keys(ic.structures);
                 ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
             }
             else if(ic.icn3dui.cfg.chainalign !== undefined) {
                 var structureArray = Object.keys(ic.structures);
                 //if(structureArray.length == 2) {
                 //   ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[1].toUpperCase(), structureArray[0].toUpperCase());
                 //}
                 //else if(structureArray.length == 1) {
                 //   ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[0].toUpperCase());
                 //}
                 ic.ParserUtilsCls.set2DDiagramsForChainalign(ic.chainidArray);
             }
             else {
                 ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
             }
         }
    }

    getAllInteractionTable(type) { var ic = this.icn3d, me = ic.icn3dui;
        var bondCnt = [];

        var residsArray = Object.keys(ic.resids2inter);
        if(type == 'save1') {
           residsArray.sort(function(a,b) {
              return me.utilsCls.compResid(a, b, type);
           });
        }
        else if(type == 'save2') {
           residsArray.sort(function(a,b) {
              return me.utilsCls.compResid(a, b, type);
           });
        }
        //ic.resids2inter
        var tmpText = '';
        var prevResidname1 = '', prevIds = '';
        var strHbond = '', strIonic = '', strContact = '', strHalegen = '', strPication = '', strPistacking = '';
        var cntHbond = 0, cntIonic = 0, cntContact = 0, cntHalegen = 0, cntPication = 0, cntPistacking = 0;
        for(var i = 0, il = residsArray.length; i < il; ++i) {
            var resids = residsArray[i];
            var residname1_residname2 = resids.split(',');
            var residname1 =(type == 'save1') ? residname1_residname2[0] : residname1_residname2[1];
            var residname2 =(type == 'save1') ? residname1_residname2[1] : residname1_residname2[0];
            // stru_chain_resi_resn
            var ids = residname1.split('_');
            if(i > 0 && residname1 != prevResidname1) {
                bondCnt.push({cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

                tmpText += this.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
                  cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
                strHbond = ''; strIonic = ''; strContact = ''; strHalegen = ''; strPication = ''; strPistacking = '';
                cntHbond = 0; cntIonic = 0; cntContact = 0; cntHalegen = 0; cntPication = 0; cntPistacking = 0;
            }
            var labels2dist, result;
            labels2dist = ic.resids2inter[resids]['hbond'];
            result = this.getInteractionPairDetails(labels2dist, type, 'hbond');
            strHbond += result.html;
            cntHbond += result.cnt;
            labels2dist = ic.resids2inter[resids]['ionic'];
            result = this.getInteractionPairDetails(labels2dist, type, 'ionic');
            strIonic += result.html;
            cntIonic += result.cnt;
            labels2dist = ic.resids2inter[resids]['contact'];
            result = this.getContactPairDetails(labels2dist, type, 'contact');
            strContact += result.html;
            cntContact += result.cnt;
            labels2dist = ic.resids2inter[resids]['halogen'];
            result = this.getInteractionPairDetails(labels2dist, type, 'halogen');
            strHalegen += result.html;
            cntHalegen += result.cnt;
            labels2dist = ic.resids2inter[resids]['pi-cation'];
            result = this.getInteractionPairDetails(labels2dist, type, 'pi-cation');
            strPication += result.html;
            cntPication += result.cnt;
            labels2dist = ic.resids2inter[resids]['pi-stacking'];
            result = this.getInteractionPairDetails(labels2dist, type, 'pi-stacking');
            strPistacking += result.html;
            cntPistacking += result.cnt;
            prevResidname1 = residname1;
            prevIds = ids;
        }
        bondCnt.push({cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

        tmpText += this.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
          cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
        var html = '';
        if(residsArray.length > 0) {
            html += '<br><table class="icn3d-sticky" align=center border=1 cellpadding=10 cellspacing=0><thead>';
            html += '<tr><th rowspan=2>Residue</th><th rowspan=2># Hydrogen<br>Bond</th><th rowspan=2># Salt Bridge<br>/Ionic Interaction</th><th rowspan=2># Contact</th>';
            html += '<th rowspan=2># Halogen<br>Bond</th><th rowspan=2># &pi;-Cation</th><th rowspan=2># &pi;-Stacking</th>';
            html += '<th>Hydrogen Bond</th><th>Salt Bridge/Ionic Interaction</th><th>Contact</th>';
            html += '<th>Halogen Bond</th><th>&pi;-Cation</th><th>&pi;-Stacking</th></tr>';
            html += '<tr>';
            var tmpStr = '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance(&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += tmpStr;
            html += tmpStr;
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td># Contacts</td><td>Min Distance(&#8491;)</td><td>C-alpha Distance(&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += tmpStr;
            html += tmpStr;
            html += tmpStr;
            html += '</tr>';
            html += '</thead><tbody>';
            html += tmpText;
            html += '</tbody></table><br/>';
        }
        return  {html: html, bondCnt: bondCnt};
    }
    getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) { var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

        var itemArray = [strHbond, strIonic, strContact, strHalegen, strPication, strPistacking];
        for(var i in itemArray) {
            var item = itemArray[i];
            tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + item + '</table></td>';
        }
        tmpText += '</tr>';
        return tmpText;
    }
    getInteractionPairDetails(labels2dist, type, interactionType) { var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');
                var resid1 =(type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 =(type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
                var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
                var color1 = (atom1.color) ? atom1.color.getHexString() : '';
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist = Math.sqrt(labels2dist[labels]).toFixed(1);
                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + dist + '</td>';
                tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        return {html: tmpText, cnt: cnt}
    }
    getContactPairDetails(labels2dist, type) { var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');
                var resid1 =(type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 =(type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
                var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
                var color1 = (atom1.color) ? atom1.color.getHexString() : '';
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                var atom1Name = dist1_dist2_atom1_atom2[2];
                var atom2Name = dist1_dist2_atom1_atom2[3];
                var contactCnt = dist1_dist2_atom1_atom2[4];
                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1Name + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2Name + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                cnt += parseInt(contactCnt);
            }
        }
        return {html: tmpText, cnt: cnt}
    }

    //Export the list of residues in some chain interacting with residues in another chain.
    exportInteractions() {var ic = this.icn3d, me = ic.icn3dui;
       var text = '<html><body><div style="text-align:center"><br><b>Interacting residues</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Base Chain: Residues</th><th>Interacting Chain</th></tr>';
       for(var fisrtChainid in ic.chainname2residues) {
           for(var name in ic.chainname2residues[fisrtChainid]) {
               var secondChainid = fisrtChainid.substr(0, fisrtChainid.indexOf('_')) + '_' + name.substr(0, name.indexOf(' '));
               text += '<tr><td>' + fisrtChainid + ': ';
               text += ic.resid2specCls.residueids2spec(ic.chainname2residues[fisrtChainid][name]);
               text += '</td><td>' + secondChainid + '</td></tr>';
           }
       }
       text += '</table><br/></div></body></html>';
       var file_pref =(ic.inputid) ? ic.inputid : "custom";
       ic.saveFileCls.saveFile(file_pref + '_interactions.html', 'html', text);
    }
    exportSsbondPairs() {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        for(var structure in ic.structures) {
            var ssbondArray = ic.ssbondpnts[structure];
            if(ssbondArray === undefined) {
                break;
            }
            for(var i = 0, il = ssbondArray.length; i < il; i = i + 2) {
                var resid1 = ssbondArray[i];
                var resid2 = ssbondArray[i+1];
                tmpText += '<tr><td>' + resid1 + ' Cys</td><td>' + resid2 + ' Cys</td></tr>';
                ++cnt;
            }
        }
        var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' disulfide pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
        text += tmpText;
        text += '</table><br/></div></body></html>';
        var file_pref =(ic.inputid) ? ic.inputid : "custom";
        ic.saveFileCls.saveFile(file_pref + '_disulfide_pairs.html', 'html', text);
    }
    exportClbondPairs() {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        var residHash = {}
        for(var structure in ic.structures) {
            var clbondArray = ic.clbondpnts[structure];
            if(clbondArray === undefined) {
                break;
            }
            for(var i = 0, il = clbondArray.length; i < il; i = i + 2) {
                var resid1 = clbondArray[i];
                var resid2 = clbondArray[i+1];
                if(!residHash.hasOwnProperty(resid1 + '_' + resid2)) {
                    var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                    var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                    tmpText += '<tr><td>' + resid1 + ' ' + atom1.resn + '</td><td>' + resid2 + ' ' + atom2.resn + '</td></tr>';
                    ++cnt;
                }
                residHash[resid1 + '_' + resid2] = 1;
                residHash[resid2 + '_' + resid1] = 1;
            }
        }
        var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' cross-linkage pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
        text += tmpText;
        text += '</table><br/></div></body></html>';
        var file_pref =(ic.inputid) ? ic.inputid : "custom";
        ic.saveFileCls.saveFile(file_pref + '_crosslinkage_pairs.html', 'html', text);
    }
    exportHbondPairs(type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in ic.resid2ResidhashHbond) {
            var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(var resid2 in ic.resid2ResidhashHbond[resid1]) {
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist = Math.sqrt(ic.resid2ResidhashHbond[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'hbond_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'hbond_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' hydrogen bond pairs</b>:</div><br>';
        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
            + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance(&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
            text += tmpText;
            text += '</table><br/>';
        }
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = ic.getGraphCls.getGraphLinks(ic.resid2ResidhashHbond, ic.resid2ResidhashHbond, ic.icn3dui.htmlCls.hbondColor, labelType, ic.icn3dui.htmlCls.hbondValue);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportSaltbridgePairs(type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in ic.resid2ResidhashSaltbridge) {
            var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(var resid2 in ic.resid2ResidhashSaltbridge[resid1]) {
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist = Math.sqrt(ic.resid2ResidhashSaltbridge[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'saltb_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'saltb_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' salt bridge/ionic interaction pairs</b>:</div><br>';
        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance(&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
            text += tmpText;
            text += '</table><br/>';
        }
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = ic.getGraphCls.getGraphLinks(ic.resid2ResidhashSaltbridge, ic.resid2ResidhashSaltbridge, ic.icn3dui.htmlCls.ionicColor, labelType, ic.icn3dui.htmlCls.ionicValue);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportHalogenPiPairs(type, labelType, interactionType) {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        var resid2Residhash, color, value;
        if(interactionType == 'halogen') {
            resid2Residhash = ic.resid2ResidhashHalogen;
            color = ic.icn3dui.htmlCls.halogenColor;
            value = ic.icn3dui.htmlCls.halogenValue;
        }
        else if(interactionType == 'pi-cation') {
            resid2Residhash = ic.resid2ResidhashPication;
            color = ic.icn3dui.htmlCls.picationColor;
            value = ic.icn3dui.htmlCls.picationValue;
        }
        else if(interactionType == 'pi-stacking') {
            resid2Residhash = ic.resid2ResidhashPistacking;
            color = ic.icn3dui.htmlCls.pistackingColor;
            value = ic.icn3dui.htmlCls.pistackingValue;
        }
        for(var resid1 in resid2Residhash) {
            var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(var resid2 in resid2Residhash[resid1]) {
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist = Math.sqrt(resid2Residhash[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' ' + interactionType + ' pairs</b>:</div><br>';
        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance(&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
            text += tmpText;
            text += '</table><br/>';
        }
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = ic.getGraphCls.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportSpherePairs(bInteraction, type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        var tmpText = '';
        var cnt = 0;
        var residHash =(bInteraction) ? ic.resid2ResidhashInteractions : ic.resid2ResidhashSphere;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
            var resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(var resid2 in residHash[resid1]) {
                var resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = (atom2.color) ? atom2.color.getHexString() : '';
                var dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                atom1 = dist1_dist2_atom1_atom2[2];
                atom2 = dist1_dist2_atom1_atom2[3];
                var contactCnt = dist1_dist2_atom1_atom2[4];
                if(bInteraction) {
                    tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                    if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                    tmpText += '</tr>';
                }
                else {
                    tmpText += '<tr><td>' + resid1 + '</td><td>' + resid2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td></tr>';
                }
                ++cnt;
            }
        }
        var nameStr =(bInteraction) ? "the contacts" : "sphere";
        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' residue pairs in ' + nameStr + '</b>:</div><br>';
        if(cnt > 0) {
            if(bInteraction) {
                text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
                  + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance(&#8491;)</th><th align="center">C-alpha Distance(&#8491;)</th>';
                if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
                text += '</tr>';
            }
            else {
                text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
                  + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance(&#8491;)</th><th align="center">C-alpha Distance(&#8491;)</th></tr>';
            }
            text += tmpText;
            text += '</table><br/>';
        }
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot'
          || type == 'calpha' || type == 'cbeta' || type == 'heavyatoms') {
            var interStr = ic.getGraphCls.getGraphLinks(residHash, residHash, ic.icn3dui.htmlCls.contactColor, labelType, ic.icn3dui.htmlCls.contactValue);
            return interStr;
        }
        else {
            return text;
        }
    }

}

export {ViewInterPairs}
