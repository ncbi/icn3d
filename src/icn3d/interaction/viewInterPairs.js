/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ViewInterPairs {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async viewInteractionPairs(nameArray2, nameArray, bHbondCalc, type,
      bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking, contactDist) { let ic = this.icn3d, me = ic.icn3dui;
       let bondCnt;

       // reset
       if(!bHbondCalc) {
            ic.hbondpnts = [];
            ic.saltbridgepnts = [];
            ic.contactpnts = [];
            ic.halogenpnts = [];
            ic.picationpnts = [];
            ic.pistackingpnts = [];
       }

       // type: view, save, forcegraph
       ic.bRender = false;
       let hAtoms = {}
       let prevHatoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

       let bContactMapLocal = (type == 'calpha' || type == 'cbeta' || type == 'heavyatoms');

       let atomSet1 = {}, atomSet2 = {};
       if(bContactMapLocal) { // contact map
           for(let i in ic.hAtoms) {
               let atom = ic.atoms[i];

               // skip solvent
               if(atom.resn == 'HOH' || atom.resn == 'WAT' || atom.resn == 'SOL') continue;

               if( (type == 'calpha' && ( atom.het || atom.name == "CA" || atom.name == "O3'" || atom.name == "O3*"))
                   || (type == 'cbeta' && ( atom.het || atom.name == "CB" || atom.name == "O3'" || atom.name == "O3*"))
                   || (type == 'heavyatoms' && atom.elem != "H")
               ) {
                   atomSet1[i] = atom;
                   atomSet2[i] = atom;
               }
           }
       }
       else {
           atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
           atomSet2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
       }

       let labelType; // residue, chain, structure
       let cntChain = 0, cntStructure = 0;
       for(let structure in ic.structures) {
           let bStructure = false;
           for(let i = 0, il = ic.structures[structure].length; i < il; ++i) {
               let chainid = ic.structures[structure][i];
               for(let serial in ic.chains[chainid]) {
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
       let interactionTypes = [];
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
           ic.resids2inter = {};
           ic.resids2interAll = {};
       }

       if(bSaltbridge) {
           let threshold = parseFloat($("#" + ic.pre + "saltbridgethreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsIonic;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               //ic.showInterCls.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true, type);
               ic.showInterCls.showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
       }
       if(bHbond) {
           let threshold = parseFloat($("#" + ic.pre + "hbondthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsHbond;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);

               ic.showInterCls.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, undefined, type);
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
       }
       // switch display order, show hydrogen first
       let tableHtml = '';
       if(bHbond) {
           tableHtml += this.exportHbondPairs(type, labelType);
       }
       if(bSaltbridge) {
           tableHtml += this.exportSaltbridgePairs(type, labelType);
       }
       if(bHalogen) {
           let threshold = parseFloat($("#" + ic.pre + "halogenthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsHalogen;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'halogen');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           tableHtml += this.exportHalogenPiPairs(type, labelType, 'halogen');
       }
       if(bPication) {
           let threshold = parseFloat($("#" + ic.pre + "picationthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsPication;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-cation');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           tableHtml += this.exportHalogenPiPairs(type, labelType, 'pi-cation');
       }
       if(bPistacking) {
           let threshold = parseFloat($("#" + ic.pre + "pistackingthreshold" ).val());
           if(!threshold || isNaN(threshold)) threshold = ic.tsPistacking;
           if(!bHbondCalc) {
               ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
               ic.showInterCls.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-stacking');
           }
           hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.hAtoms);
           //tableHtml += this.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           let tmp = this.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           tableHtml += tmp;
       }
       if(bInteraction) {
           let threshold = (bContactMapLocal) ? contactDist : parseFloat($("#" + ic.pre + "contactthreshold" ).val());
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
                    let residues = {};
                    let resid2ResidhashInteractions = {};

                    if(bContactMapLocal) {
                        let bIncludeTarget = true;
                        let result = ic.showInterCls.pickCustomSphere_base(threshold, atomSet1, atomSet2, bHbondCalc, true, undefined, undefined, true, bIncludeTarget);
                        residues = me.hashUtilsCls.unionHash(residues, result.residues);
                        for(let resid in result.resid2Residhash) {
                            resid2ResidhashInteractions[resid] = me.hashUtilsCls.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                        }
                    }
                    else {
                        let ssAtomsArray = [];
                        let prevSS = '', prevChain = '';
                        let ssAtoms = {}
                        for(let i in atomSet1) {
                            let atom = ic.atoms[i];
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
                        let len = ssAtomsArray.length;
                        let interStr = '';
                        let select = "interactions " + threshold + " | sets " + nameArray2 + " " + nameArray + " | true";
                        ic.opts['contact'] = "yes";

                        for(let i = 0; i < len; ++i) {
                            for(let j = i + 1; j < len; ++j) {
                                ic.hAtoms = me.hashUtilsCls.cloneHash(prevHatoms);
                                let result = ic.showInterCls.pickCustomSphere_base(threshold, ssAtomsArray[i], ssAtomsArray[j], bHbondCalc, true, type, select, true);
                                residues = me.hashUtilsCls.unionHash(residues, result.residues);
                                for(let resid in result.resid2Residhash) {
                                    resid2ResidhashInteractions[resid] = me.hashUtilsCls.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                                }
                            }
                        }
                    }

                    ic.resid2ResidhashInteractions = resid2ResidhashInteractions;
                    let residueArray = Object.keys(residues);
                    ic.hAtoms = {}
                    for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
                      let residueid = residueArray[index];
                      for(let i in ic.residues[residueid]) {
                        ic.hAtoms[i] = 1;
                      }
                    }
                    // do not change the set of displaying atoms
                    //ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
                    let commandname, commanddesc;
                    let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(residues);
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
       let residHash, select, commandname, commanddesc;
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(hAtoms);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_all';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       let interface1 = me.hashUtilsCls.intHash(hAtoms, atomSet1);
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(interface1);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_1';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       let interface2 = me.hashUtilsCls.intHash(hAtoms, atomSet2);
       residHash = ic.firstAtomObjCls.getResiduesFromAtoms(interface2);
       select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residHash));
       commandname = 'interface_2';
       commanddesc = commandname;
       ic.selectionCls.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       //var html = '<div style="text-align:center"><b>Hydrogen Bonds, Salt Bridges, Contacts, Halogen Bonds, &pi;-cation, &pi;-stacking between Two Sets:</b><br>';
       let html = '<div style="text-align:center"><b>' + interactionTypes.join(', ') + ' between Two Sets:</b><br>';
       let residueArray1 = ic.resid2specCls.atoms2residues(Object.keys(atomSet1));
       let residueArray2 = ic.resid2specCls.atoms2residues(Object.keys(atomSet2));
       let cmd1 = 'select ' + ic.resid2specCls.residueids2spec(residueArray1);
       let cmd2 = 'select ' + ic.resid2specCls.residueids2spec(residueArray2);
       html += 'Set 1: ' + nameArray2 + ' <button class="' + ic.pre + 'selset" cmd="' + cmd1 + '">Highlight in 3D</button><br>';
       html += 'Set 2: ' + nameArray + ' <button class="' + ic.pre + 'selset" cmd="' + cmd2 + '">Highlight in 3D</button><br><br></div>';
       html += '<div style="text-align:center"><b>The interfaces are:</b><br>';
       let residueArray3 = ic.resid2specCls.atoms2residues(Object.keys(interface1));
       let residueArray4 = ic.resid2specCls.atoms2residues(Object.keys(interface2));
       let cmd3 = 'select ' + ic.resid2specCls.residueids2spec(residueArray3);
       let cmd4 = 'select ' + ic.resid2specCls.residueids2spec(residueArray4);
       html += 'interface_1 <button class="' + ic.pre + 'selset" cmd="' + cmd3 + '">Highlight in 3D</button><br>';
       html += 'interface_2 <button class="' + ic.pre + 'selset" cmd="' + cmd4 + '">Highlight in 3D</button><br><br></div>';
       html += '<div><b>Note</b>: Each checkbox below selects the corresponding residue. '
         + 'You can click "Save Selection" in the "Select" menu to save the selection '
         + 'and click on "Highlight" button to clear the checkboxes.</div><br>';
       let header = html;
       if(type == 'graph' || type == 'linegraph' || type == 'scatterplot' || bContactMapLocal) html = '';
       html += tableHtml;

       if(type == 'save1' || type == 'save2') {
           html = header;
           let tmpText = '';
           if(type == 'save1') {
               tmpText = 'Set 1';
           }
           else if(type == 'save2') {
               tmpText = 'Set 2';
           }
           html += '<div style="text-align:center"><br><b>Interactions Sorted on ' + tmpText + '</b>: <button class="' + ic.pre + 'showintercntonly" style="margin-left:20px">Show Count Only</button><button class="' + ic.pre + 'showinterdetails" style="margin-left:20px">Show Details</button></div>';
           let result = this.getAllInteractionTable(type);
           html += result.html;
           bondCnt = result.bondCnt;

           $("#" + ic.pre + "dl_interactionsorted_html").html(html);
           me.htmlCls.dialogCls.openDlg('dl_interactionsorted', 'Show sorted interactions');
       }
       else if(type == 'view') {
           $("#" + ic.pre + "dl_allinteraction_html").html(html);
           me.htmlCls.dialogCls.openDlg('dl_allinteraction', 'Show interactions');
       }
       else if(type == 'linegraph') {
           me.htmlCls.dialogCls.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
           let bLine = true;
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bLinegraph = true;
           // draw SVG
           let svgHtml = ic.lineGraphCls.drawLineGraph(ic.graphStr);
           $("#" + ic.pre + "linegraphDiv").html(svgHtml);
       }
       else if(type == 'scatterplot') {
           me.htmlCls.dialogCls.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
           let bLine = true;
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bScatterplot = true;
           // draw SVG
           let svgHtml = ic.lineGraphCls.drawLineGraph(ic.graphStr, true);
           $("#" + ic.pre + "scatterplotDiv").html(svgHtml);
       }
       else if(type == 'ligplot') {
            await ic.ligplotCls.drawLigplot(atomSet1);
       }
       else if(bContactMapLocal) {
           me.htmlCls.dialogCls.openDlg('dl_contactmap', 'Show contact map');
           let bLine = true;
           let bAnyAtom = true;
           let graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType, bAnyAtom);
           ic.bContactMap = true;
           // draw SVG
           let svgHtml = ic.contactMapCls.drawContactMap(graphStr);
           $("#" + ic.pre + "contactmapDiv").html(svgHtml);
       }
       else if(type == 'graph') {
           // atomSet1 and atomSet2 are in the right order here
           ic.graphStr = ic.getGraphCls.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           ic.bGraph = true;
           // show only displayed set in 2D graph
           if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(ic.dAtoms).length) {
               ic.graphStr = ic.selectionCls.getGraphDataForDisplayed();
           }

           if(ic.bD3 === undefined) {
                //let url = "https://d3js.org/d3.v4.min.js";
                let url = "./script/d3v4-force-all.min.js";
                await me.getAjaxPromise(url, 'script');

                ic.bD3 = true;
           }

            $("#" + me.svgid).empty();
            me.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
            ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
       }

       return {interactionTypes: interactionTypes.toString(), bondCnt: bondCnt};
    }

    clearInteractions() { let ic = this.icn3d, me = ic.icn3dui;
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

    resetInteractionPairs() { let ic = this.icn3d, me = ic.icn3dui;
       ic.bHbondCalc = false;
       //me.htmlCls.clickMenuCls.setLogCmd('set calculate hbond false', true);
       ic.showInterCls.hideHbondsContacts();
       ic.hlUpdateCls.clearHighlight();
       // reset the interaction pairs
       ic.resids2inter = {}
       ic.resids2interAll = {}
    }

    async retrieveInteractionData() { let ic = this.icn3d, me = ic.icn3dui;
         if(!ic.b2DShown) {
             if(me.cfg.align !== undefined) {
                 let structureArray = Object.keys(ic.structures);

                 if(me.cfg.atype == 2) {
                    let bDiagramOnly = true;
                    await ic.alignParserCls.downloadAlignment(structureArray[0] + ',' + structureArray[1], bDiagramOnly);
                 }
                 
                 await ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
             }
             else if(me.cfg.chainalign !== undefined) {
                 let structureArray = Object.keys(ic.structures);
                 //if(structureArray.length == 2) {
                 //   ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[1].toUpperCase(), structureArray[0].toUpperCase());
                 //}
                 //else if(structureArray.length == 1) {
                 //   ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[0].toUpperCase());
                 //}

                 await ic.ParserUtilsCls.set2DDiagramsForChainalign(ic.chainidArray);
             }
             else {
                 ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
             }
         }
    }

    getAllInteractionTable(type, index2xy, xlen, ylen, xcenter, ycenter) { let ic = this.icn3d, me = ic.icn3dui;
        let svgHtmlNode = '', svgHtmlLine = '';

        let bondCnt = [];

        let residsArray = Object.keys(ic.resids2inter);
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
        let tmpText = '';
        let prevResidname1 = '', prevIds = '';
        let strHbond = '', strIonic = '', strContact = '', strHalegen = '', strPication = '', strPistacking = '';
        let cntHbond = 0, cntIonic = 0, cntContact = 0, cntHalegen = 0, cntPication = 0, cntPistacking = 0;
        let residname1, residname2, residname2List = '';
        for(let i = 0, il = residsArray.length; i < il; ++i) {
            let resids = residsArray[i];
            let residname1_residname2 = resids.split(',');
            residname1 =(type == 'save1') ? residname1_residname2[0] : residname1_residname2[1];
            residname2 =(type == 'save1') ? residname1_residname2[1] : residname1_residname2[0];

            // stru_chain_resi_resn
            let ids = residname1.split('_');
            if(i > 0 && residname1 != prevResidname1) {
                bondCnt.push({res1: prevResidname1, res2: residname2List, cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

                tmpText += this.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
                  cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
                strHbond = ''; strIonic = ''; strContact = ''; strHalegen = ''; strPication = ''; strPistacking = '';
                cntHbond = 0; cntIonic = 0; cntContact = 0; cntHalegen = 0; cntPication = 0; cntPistacking = 0;
                residname2List = '';
            }
            let labels2dist, result;
            labels2dist = ic.resids2inter[resids]['hbond'];
            result = this.getInteractionPairDetails(labels2dist, type, 'hbond', index2xy, xlen, ylen, xcenter, ycenter);
            strHbond += result.html;
            cntHbond += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":hbond_" + result.cnt + " ";

            labels2dist = ic.resids2inter[resids]['ionic'];
            result = this.getInteractionPairDetails(labels2dist, type, 'ionic', index2xy, xlen, ylen, xcenter, ycenter);
            strIonic += result.html;
            cntIonic += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":ionic_" + result.cnt + " ";

            labels2dist = ic.resids2inter[resids]['halogen'];
            result = this.getInteractionPairDetails(labels2dist, type, 'halogen', index2xy, xlen, ylen, xcenter, ycenter);
            strHalegen += result.html;
            cntHalegen += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":halogen_" + result.cnt + " ";

            labels2dist = ic.resids2inter[resids]['pi-cation'];
            result = this.getInteractionPairDetails(labels2dist, type, 'pi-cation', index2xy, xlen, ylen, xcenter, ycenter);
            strPication += result.html;
            cntPication += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":pi-cation_" + result.cnt + " ";

            labels2dist = ic.resids2inter[resids]['pi-stacking'];
            result = this.getInteractionPairDetails(labels2dist, type, 'pi-stacking', index2xy, xlen, ylen, xcenter, ycenter);
            strPistacking += result.html;
            cntPistacking += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":pi-stacking_" + result.cnt + " ";

            // put contact as the last one since contact will use the same node as other interactions in ligand-protein interactoin
            labels2dist = ic.resids2inter[resids]['contact'];
            result = this.getContactPairDetails(labels2dist, type, 'contact', index2xy, xlen, ylen, xcenter, ycenter);
            strContact += result.html;
            cntContact += result.cnt;
            svgHtmlNode += result.svgHtmlNode;
            svgHtmlLine += result.svgHtmlLine;
            if(result.cnt > 0) residname2List += residname2 + ":contact_" + result.cnt + " ";

            prevResidname1 = residname1;
            prevIds = ids;
        }
        bondCnt.push({res1: prevResidname1, res2: residname2List, cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

        tmpText += this.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
          cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
        let html = '';
        if(residsArray.length > 0) {
            html += '<br><table class="icn3d-sticky" align=center border=1 cellpadding=10 cellspacing=0><thead>';
            html += '<tr><th rowspan=2>Residue</th><th rowspan=2># Hydrogen<br>Bond</th><th rowspan=2># Salt Bridge<br>/Ionic Interaction</th><th rowspan=2># Contact</th>';
            html += '<th rowspan=2># Halogen<br>Bond</th><th rowspan=2># &pi;-Cation</th><th rowspan=2># &pi;-Stacking</th>';
            html += '<th>Hydrogen Bond (backbone atoms: @CA, @N, @C, @O)</th><th>Salt Bridge/Ionic Interaction</th><th>Contact</th>';
            html += '<th>Halogen Bond</th><th>&pi;-Cation</th><th>&pi;-Stacking</th></tr>';
            html += '<tr>';
            let tmpStr = '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance(&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
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
        return  {html: html, bondCnt: bondCnt, svgHtmlNode: svgHtmlNode, svgHtmlLine: svgHtmlLine};
    }
    getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) { let ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

        let itemArray = [strHbond, strIonic, strContact, strHalegen, strPication, strPistacking];
        for(let i in itemArray) {
            let item = itemArray[i];
            tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + item + '</table></td>';
        }
        tmpText += '</tr>';
        return tmpText;
    }
    getInteractionPairDetails(labels2dist, type, interactionType, index2xy, xlen, ylen, xcenter, ycenter) { let ic = this.icn3d, me = ic.icn3dui;
        let svgHtmlNode = '', svgHtmlLine = '', tmpText = '', cnt = 0;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            if(!ic.resid2cnt) ic.resid2cnt = {};
            if(!ic.resid2ToXy) ic.resid2ToXy = {};
            if(!ic.nodeid2lineid) ic.nodeid2lineid = {};
            for(let labels in labels2dist) {
                let resid1_resid2 = labels.split('|');
                let resid1Ori =(type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                let resid2Ori =(type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                //resid1: MET $3GVU.A:364@N 1234
                let pos1 = resid1Ori.lastIndexOf(' ');
                let pos2 = resid2Ori.lastIndexOf(' ');
                let resid1 = resid1Ori.substr(0, pos1);
                let resid2 = resid2Ori.substr(0, pos2);

                let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
                let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
                let color1 = (atom1.color) ? atom1.color.getHexString() : '';
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist = Math.sqrt(labels2dist[labels]).toFixed(1);
                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + dist + '</td>';
                tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;

                if(index2xy) {
                    let serialArray1 = resid1Ori.substr(pos1 + 1).split(',');

                    let result = ic.ligplotCls.getSvgPerPair(serialArray1, resid1, resid2, interactionType, index2xy, xlen, ylen, xcenter, ycenter, dist);
                    svgHtmlNode += result.node;
                    svgHtmlLine += result.line;
                }
            }
        }
        return {html: tmpText, cnt: cnt, svgHtmlNode: svgHtmlNode, svgHtmlLine: svgHtmlLine}
    }

    getContactPairDetails(labels2dist, type, interactionType, index2xy, xlen, ylen, xcenter, ycenter) { let ic = this.icn3d, me = ic.icn3dui;
        let svgHtmlNode = '', svgHtmlLine = '', tmpText = '', cnt = 0;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            let resids2distCnt = {};
            if(!ic.resid2cnt) ic.resid2cnt = {};
            if(!ic.resid2ToXy) ic.resid2ToXy = {};
            if(!ic.nodeid2lineid) ic.nodeid2lineid = {};
            for(let labels in labels2dist) {
                let resid1_resid2 = labels.split('|');
                let resid1Ori =(type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                let resid2Ori =(type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                //resid1: MET $3GVU.A:364 1234
                let pos1 = resid1Ori.lastIndexOf(' ');
                let pos2 = resid2Ori.lastIndexOf(' ');
                
                let serialArray1 = resid1Ori.substr(pos1 + 1).split(',');
                let resid1 = resid1Ori.substr(0, pos1);
                if(index2xy) {
                    // add atom name to resid1
                    resid1 += '@' + ic.atoms[serialArray1[0]].name;
                }
                
                let resid2 = resid2Ori.substr(0, pos2);
                let resids = resid1 + '|' + resid2;

                let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
                let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
                // let color1 = (atom1.color) ? atom1.color.getHexString() : '';
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                // let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
                let dist1 = parseFloat(dist1_dist2_atom1_atom2[0]);
                // let dist2 = parseFloat(dist1_dist2_atom1_atom2[1]);
                // let atom1Name = dist1_dist2_atom1_atom2[2];
                // let atom2Name = dist1_dist2_atom1_atom2[3];
                let contactCnt = parseInt(dist1_dist2_atom1_atom2[4]);
                if(!resids2distCnt.hasOwnProperty(resids)) {
                    resids2distCnt[resids] = {'dist1': dist1, 'dist1_dist2_atom1_atom2': dist1_dist2_atom1_atom2, 'cnt': contactCnt, 'serialArray1': serialArray1};
                }
                else {
                    resids2distCnt[resids].cnt += contactCnt;
                    if(dist1 < resids2distCnt[resids].dist1) {
                        resids2distCnt[resids].dist1 = dist1;
                        resids2distCnt[resids].dist1_dist2_atom1_atom2 = dist1_dist2_atom1_atom2;
                        resids2distCnt[resids].serialArray1 = serialArray1;
                    }
                }
            }

            let resid2ToResid1 = {};
            for(let resids in resids2distCnt) {
                let resid1_resid2 = resids.split('|');
                let resid1 = resid1_resid2[0];
                let resid2 = resid1_resid2[1];

                if(!resid2ToResid1.hasOwnProperty(resid2)) {
                    resid2ToResid1[resid2] = [resid1];
                }
                else {
                    resid2ToResid1[resid2].push(resid1);
                }

                let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
                let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
                let color1 = (atom1.color) ? atom1.color.getHexString() : '';
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist1_dist2_atom1_atom2 = resids2distCnt[resids].dist1_dist2_atom1_atom2;
                let dist1 = dist1_dist2_atom1_atom2[0];
                let dist2 = dist1_dist2_atom1_atom2[1];
                let atom1Name = dist1_dist2_atom1_atom2[2];
                let atom2Name = dist1_dist2_atom1_atom2[3];
                let contactCnt = 1; //resids2distCnt[resids].cnt;
                
                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1Name + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2Name + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                cnt += parseInt(contactCnt);
            }

            if(index2xy) {
                for(let resid2 in resid2ToResid1) {
                    let resid1Array = resid2ToResid1[resid2];
                    let prevX2, prevY2;
                    for(let i = 0, il = resid1Array.length; i < il; ++i) {
                        let resid1 = resid1Array[i];
                        let resids = resid1 + '|' + resid2;
            
                        let serialArray1 = resids2distCnt[resids].serialArray1;
                        let dist1_dist2_atom1_atom2 = resids2distCnt[resids].dist1_dist2_atom1_atom2;
                        let dist1 = dist1_dist2_atom1_atom2[0]; // min dist
                        let dist2 = dist1_dist2_atom1_atom2[1]; // c-alpha dist
                        // let dist = (dist1 < dist2) ? dist1 : dist2;
                        let bNotDrawNode = (i == 0) ? false : true;
                        let result = ic.ligplotCls.getSvgPerPair(serialArray1, resid1, resid2, interactionType, index2xy, xlen, ylen, xcenter, ycenter, dist1, bNotDrawNode, prevX2, prevY2);
                        svgHtmlNode += result.node;
                        svgHtmlLine += result.line;
                        prevX2 = result.x2;
                        prevY2 = result.y2;
                    }
                }
            }
        }

        return {html: tmpText, cnt: cnt, svgHtmlNode: svgHtmlNode, svgHtmlLine: svgHtmlLine};
    }

    //Export the list of residues in some chain interacting with residues in another chain.
    exportInteractions() {var ic = this.icn3d, me = ic.icn3dui;
       let text = '<html><body><div style="text-align:center"><br><b>Interacting residues</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Base Chain: Residues</th><th>Interacting Chain</th></tr>';
       for(let fisrtChainid in ic.chainname2residues) {
           for(let name in ic.chainname2residues[fisrtChainid]) {
               let secondChainid = fisrtChainid.substr(0, fisrtChainid.indexOf('_')) + '_' + name.substr(0, name.indexOf(' '));
               text += '<tr><td>' + fisrtChainid + ': ';
               text += ic.resid2specCls.residueids2spec(ic.chainname2residues[fisrtChainid][name]);
               text += '</td><td>' + secondChainid + '</td></tr>';
           }
       }
       text += '</table><br/></div></body></html>';
       let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
       ic.saveFileCls.saveFile(file_pref + '_interactions.html', 'html', text);
    }
    exportSsbondPairs() {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        for(let structure in ic.structures) {
            let ssbondArray = ic.ssbondpnts[structure];
            if(ssbondArray === undefined) {
                break;
            }
            for(let i = 0, il = ssbondArray.length; i < il; i = i + 2) {
                let resid1 = ssbondArray[i];
                let resid2 = ssbondArray[i+1];
                tmpText += '<tr><td>' + resid1 + ' Cys</td><td>' + resid2 + ' Cys</td></tr>';
                ++cnt;
            }
        }
        let text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' disulfide pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
        text += tmpText;
        text += '</table><br/></div></body></html>';
        let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
        ic.saveFileCls.saveFile(file_pref + '_disulfide_pairs.html', 'html', text);
    }
    exportClbondPairs() {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        let residHash = {}
        for(let structure in ic.structures) {
            let clbondArray = ic.clbondpnts[structure];
            if(clbondArray === undefined) {
                break;
            }
            for(let i = 0, il = clbondArray.length; i < il; i = i + 2) {
                let resid1 = clbondArray[i];
                let resid2 = clbondArray[i+1];
                if(!residHash.hasOwnProperty(resid1 + '_' + resid2)) {
                    let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                    let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                    tmpText += '<tr><td>' + resid1 + ' ' + atom1.resn + '</td><td>' + resid2 + ' ' + atom2.resn + '</td></tr>';
                    ++cnt;
                }
                residHash[resid1 + '_' + resid2] = 1;
                residHash[resid2 + '_' + resid1] = 1;
            }
        }
        let text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' cross-linkage pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
        text += tmpText;
        text += '</table><br/></div></body></html>';
        let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
        ic.saveFileCls.saveFile(file_pref + '_crosslinkage_pairs.html', 'html', text);
    }
    exportHbondPairs(type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(let resid1 in ic.resid2ResidhashHbond) {
            let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            let color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(let resid2 in ic.resid2ResidhashHbond[resid1]) {
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist = Math.sqrt(ic.resid2ResidhashHbond[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'hbond_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'hbond_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        let text = '<div style="text-align:center"><br><b>' + cnt
          + ' hydrogen bond pairs</b> (backbone atoms: @CA, @N, @C, @O):</div><br>';
        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
            + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance(&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
            text += tmpText;
            text += '</table><br/>';
        }
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            let hbondStr = ic.getGraphCls.getGraphLinks(ic.resid2ResidhashHbond, ic.resid2ResidhashHbond, me.htmlCls.hbondColor, labelType, me.htmlCls.hbondValue);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportSaltbridgePairs(type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(let resid1 in ic.resid2ResidhashSaltbridge) {
            let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            let color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(let resid2 in ic.resid2ResidhashSaltbridge[resid1]) {
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist = Math.sqrt(ic.resid2ResidhashSaltbridge[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'saltb_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + 'saltb_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        let text = '<div style="text-align:center"><br><b>' + cnt
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
            let hbondStr = ic.getGraphCls.getGraphLinks(ic.resid2ResidhashSaltbridge, ic.resid2ResidhashSaltbridge, me.htmlCls.ionicColor, labelType, me.htmlCls.ionicValue);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportHalogenPiPairs(type, labelType, interactionType) {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        let resid2Residhash, color, value;
        if(interactionType == 'halogen') {
            resid2Residhash = ic.resid2ResidhashHalogen;
            color = me.htmlCls.halogenColor;
            value = me.htmlCls.halogenValue;
        }
        else if(interactionType == 'pi-cation') {
            resid2Residhash = ic.resid2ResidhashPication;
            color = me.htmlCls.picationColor;
            value = me.htmlCls.picationValue;
        }
        else if(interactionType == 'pi-stacking') {
            resid2Residhash = ic.resid2ResidhashPistacking;
            color = me.htmlCls.pistackingColor;
            value = me.htmlCls.pistackingValue;
        }
        for(let resid1 in resid2Residhash) {
            let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            let color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(let resid2 in resid2Residhash[resid1]) {
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist = Math.sqrt(resid2Residhash[resid1][resid2]).toFixed(1);
                tmpText += '<tr><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + ic.pre + 'seloneres" id="' + ic.pre + interactionType + '_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + ic.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }
        let text = '<div style="text-align:center"><br><b>' + cnt
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
            let hbondStr = ic.getGraphCls.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
            return hbondStr;
        }
        else {
            return text;
        }
    }
    exportSpherePairs(bInteraction, type, labelType) {var ic = this.icn3d, me = ic.icn3dui;
        let tmpText = '';
        let cnt = 0;
        let residHash =(bInteraction) ? ic.resid2ResidhashInteractions : ic.resid2ResidhashSphere;
        let colorText1 = ' <span style="background-color:#';
        let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(let resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
            let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
            let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
            let color1 = (atom1.color) ? atom1.color.getHexString() : '';
            for(let resid2 in residHash[resid1]) {
                let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
                let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);
                let color2 = (atom2.color) ? atom2.color.getHexString() : '';
                let dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
                let dist1 = dist1_dist2_atom1_atom2[0];
                let dist2 = dist1_dist2_atom1_atom2[1];
                atom1 = dist1_dist2_atom1_atom2[2];
                atom2 = dist1_dist2_atom1_atom2[3];
                let contactCnt = dist1_dist2_atom1_atom2[4];
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
        let nameStr =(bInteraction) ? "the contacts" : "sphere";
        let text = '<div style="text-align:center"><br><b>' + cnt
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
            let interStr = ic.getGraphCls.getGraphLinks(residHash, residHash, me.htmlCls.contactColor, labelType, me.htmlCls.contactValue);
            return interStr;
        }
        else {
            return text;
        }
    }

}

export {ViewInterPairs}
