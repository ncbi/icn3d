/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.viewInteractionPairs = function(nameArray2, nameArray, bHbondCalc, type,
  bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking) { var me = this, ic = me.icn3d; "use strict";
   // type: view, save, forcegraph
   ic.bRender = false;
   var hAtoms = {};
   var prevHatoms = ic.cloneHash(ic.hAtoms);
   var atomSet1 = me.getAtomsFromNameArray(nameArray2);
   var atomSet2 = me.getAtomsFromNameArray(nameArray);

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
       ic.resids2inter = {};
       ic.resids2interAll = {};
   }
   if(bSaltbridge) {
       var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());
       if(!bHbondCalc) {
           ic.hAtoms = ic.cloneHash(prevHatoms);
           //me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           me.showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, true, type);
       }
       hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
   }
   if(bHbond) {
       var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());
       if(!bHbondCalc) {
           ic.hAtoms = ic.cloneHash(prevHatoms);
           me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, undefined, type);
       }
       hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
   }
   // switch display order, show hydrogen first
   var tableHtml = '';
   if(bHbond) {
       tableHtml += me.exportHbondPairs(type, labelType);
   }
   if(bSaltbridge) {
       tableHtml += me.exportSaltbridgePairs(type, labelType);
   }
   if(bHalogen) {
       var threshold = parseFloat($("#" + me.pre + "halogenthreshold" ).val());
       if(!bHbondCalc) {
           ic.hAtoms = ic.cloneHash(prevHatoms);
           me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'halogen');
       }
       hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       tableHtml += me.exportHalogenPiPairs(type, labelType, 'halogen');
   }
   if(bPication) {
       var threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());
       if(!bHbondCalc) {
           ic.hAtoms = ic.cloneHash(prevHatoms);
           me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-cation');
       }
       hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-cation');
   }
   if(bPistacking) {
       var threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());
       if(!bHbondCalc) {
           ic.hAtoms = ic.cloneHash(prevHatoms);
           me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-stacking');
       }
       hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       //tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-stacking');
       var tmp = me.exportHalogenPiPairs(type, labelType, 'pi-stacking');
       tableHtml += tmp;
   }
   if(bInteraction) {
       var threshold = parseFloat($("#" + me.pre + "contactthreshold" ).val());
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
            if(!bHbondCalc) {
                ic.hAtoms = ic.cloneHash(prevHatoms);
                me.pickCustomSphere(threshold, nameArray2, nameArray, bHbondCalc, true, type);
            }
            hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
            tableHtml += me.exportSpherePairs(true, type, labelType);
       }
       else { // contact in a set, atomSet1 same as atomSet2
            if(!bHbondCalc) {
                var ssAtomsArray = [];
                var prevSS = '', prevChain = '';
                var ssAtoms = {};
                for(var i in atomSet1) {
                    var atom = ic.atoms[i];
                    if(atom.ss != prevSS || atom.chain != prevChain) {
                        if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                        ssAtoms = {};
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
                var residues = {};
                var resid2ResidhashInteractions = {};
                for(var i = 0; i < len; ++i) {
                    for(var j = i + 1; j < len; ++j) {
                        ic.hAtoms = ic.cloneHash(prevHatoms);
                        var result = me.pickCustomSphere_base(threshold, ssAtomsArray[i], ssAtomsArray[j], bHbondCalc, true, type, select, true);
                        residues = ic.unionHash(residues, result.residues);
                        for(var resid in result.resid2Residhash) {
                            resid2ResidhashInteractions[resid] = ic.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                        }
                    }
                }
                me.resid2ResidhashInteractions = resid2ResidhashInteractions;
                var residueArray = Object.keys(residues);
                ic.hAtoms = {};
                for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
                  var residueid = residueArray[index];
                  for(var i in ic.residues[residueid]) {
                    ic.hAtoms[i] = 1;
                  }
                }
                // do not change the set of displaying atoms
                //ic.dAtoms = ic.cloneHash(ic.atoms);
                var commandname, commanddesc;
                var firstAtom = ic.getFirstAtomObj(residues);
                if(firstAtom !== undefined) {
                    commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
                    if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + me.pre + "contactthreshold").val() + "A";
                    commanddesc = commandname;
                    me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
                }
                me.saveSelectionIfSelected();
                ic.draw();
            }
            hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
            tableHtml += me.exportSpherePairs(true, type, labelType);
       } // same set
   }
   ic.hAtoms = ic.cloneHash(hAtoms);
   ic.bRender = true;
   //me.updateHlAll();
   ic.draw();
   var residHash, select, commandname, commanddesc;
   residHash = ic.getResiduesFromAtoms(hAtoms);
   select = "select " + me.residueids2spec(Object.keys(residHash));
   commandname = 'interface_all';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
   var interface1 = ic.intHash(hAtoms, atomSet1);
   residHash = ic.getResiduesFromAtoms(interface1);
   select = "select " + me.residueids2spec(Object.keys(residHash));
   commandname = 'interface_1';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
   var interface2 = ic.intHash(hAtoms, atomSet2);
   residHash = ic.getResiduesFromAtoms(interface2);
   select = "select " + me.residueids2spec(Object.keys(residHash));
   commandname = 'interface_2';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
   //var html = '<div style="text-align:center"><b>Hydrogen Bonds, Salt Bridges, Contacts, Halogen Bonds, &pi;-cation, &pi;-stacking between Two Sets:</b><br>';
   var html = '<div style="text-align:center"><b>' + interactionTypes.join(', ') + ' between Two Sets:</b><br>';
   var residueArray1 = me.atoms2residues(Object.keys(atomSet1));
   var residueArray2 = me.atoms2residues(Object.keys(atomSet2));
   var cmd1 = 'select ' + me.residueids2spec(residueArray1);
   var cmd2 = 'select ' + me.residueids2spec(residueArray2);
   html += 'Set 1: ' + nameArray2 + ' <button class="' + me.pre + 'selset" cmd="' + cmd1 + '">Highlight in 3D</button><br>';
   html += 'Set 2: ' + nameArray + ' <button class="' + me.pre + 'selset" cmd="' + cmd2 + '">Highlight in 3D</button><br><br></div>';
   html += '<div style="text-align:center"><b>The interfaces are:</b><br>';
   var residueArray3 = me.atoms2residues(Object.keys(interface1));
   var residueArray4 = me.atoms2residues(Object.keys(interface2));
   var cmd3 = 'select ' + me.residueids2spec(residueArray3);
   var cmd4 = 'select ' + me.residueids2spec(residueArray4);
   html += 'interface_1 <button class="' + me.pre + 'selset" cmd="' + cmd3 + '">Highlight in 3D</button><br>';
   html += 'interface_2 <button class="' + me.pre + 'selset" cmd="' + cmd4 + '">Highlight in 3D</button><br><br></div>';
   html += '<div><b>Note</b>: Each checkbox below selects the corresponding residue. '
     + 'You can click "Save Selection" in the "Select" menu to save the selection '
     + 'and click on "Highlight" button to clear the checkboxes.</div><br>';
   var header = html;
   if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') html = '';
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
       html += '<div style="text-align:center"><br><b>Interactions Sorted on ' + tmpText + '</b>: <button class="' + me.pre + 'showintercntonly" style="margin-left:20px">Show Count Only</button><button class="' + me.pre + 'showinterdetails" style="margin-left:20px">Show Details</button></div>';
       html += me.getAllInteractionTable(type);
       $("#" + me.pre + "dl_interactionsorted").html(html);
       me.openDlg('dl_interactionsorted', 'Show sorted interactions');
   }
   else if(type == 'view') {
       $("#" + me.pre + "dl_allinteraction").html(html);
       me.openDlg('dl_allinteraction', 'Show interactions');
   }
   else if(type == 'linegraph') {
       me.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
       var bLine = true;
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bLinegraph = true;
       // draw SVG
       var svgHtml = me.drawLineGraph(me.graphStr);
       $("#" + me.pre + "linegraphDiv").html(svgHtml);
   }
   else if(type == 'scatterplot') {
       me.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
       var bLine = true;
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bScatterplot = true;
       // draw SVG
       var svgHtml = me.drawLineGraph(me.graphStr, true);
       $("#" + me.pre + "scatterplotDiv").html(svgHtml);
   }
   else if(type == 'graph') {
       // atomSet1 and atomSet2 are in the right order here
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bGraph = true;
       // show only displayed set in 2D graph
       if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(ic.dAtoms).length) {
           me.graphStr = me.getGraphDataForDisplayed();
       }
       if(me.bD3 === undefined) {
           var url = "https://d3js.org/d3.v4.min.js";
           $.ajax({
              url: url,
              dataType: "script",
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                   var url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/script/graph_d3v4.min.js";
                   $.ajax({
                      url: url2,
                      dataType: "script",
                      cache: true,
                      tryCount : 0,
                      retryLimit : 1,
                      success: function(data2) {
                           me.bD3 = true;
                           $("#" + me.svgid).empty();
                           me.openDlg('dl_graph', 'Force-directed graph');
                           me.drawGraph(me.graphStr, me.pre + 'dl_graph');
                           if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                      },
                      error : function(xhr, textStatus, errorThrown ) {
                        this.tryCount++;
                        if (this.tryCount <= this.retryLimit) {
                            //try again
                            $.ajax(this);
                            return;
                        }
                        if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                        return;
                      }
                   });
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                return;
              }
           });
       }
       else {
           $("#" + me.svgid).empty();
           me.openDlg('dl_graph', 'Force-directed graph');
           me.drawGraph(me.graphStr, me.pre + 'dl_graph');
       }
   }
   return interactionTypes.toString();
};
iCn3DUI.prototype.clearInteractions = function() { var me = this, ic = me.icn3d; "use strict";
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
};

iCn3DUI.prototype.resetInteractionPairs = function() { var me = this, ic = me.icn3d; "use strict";
   me.bHbondCalc = false;
   //me.setLogCmd('set calculate hbond false', true);
   me.hideHbondsContacts();
   me.clearHighlight();
   // reset the interaction pairs
   ic.resids2inter = {};
   ic.resids2interAll = {};
};
