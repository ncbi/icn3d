/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.getGraphData = function(atomSet2, atomSet1, nameArray2, nameArray, html, labelType) { var me = this, ic = me.icn3d; "use strict";
   // get the nodes and links data
   var nodeStr = '', linkStr = '';
   var nodeArray = [], linkArray = [];
   var node_link1 = me.getNodesLinksForSet(atomSet2, labelType, 'a');
   var node_link2 = me.getNodesLinksForSet(atomSet1, labelType, 'b');
   nodeArray = node_link1.node.concat(node_link2.node);
   // removed duplicated nodes
   var nodeJsonArray = [];
   var checkedNodeidHash = {};
   var cnt = 0;
   for(var i = 0, il = nodeArray.length; i < il; ++i) {
       var node = nodeArray[i];
       var nodeJson = JSON.parse(node);
       if(!checkedNodeidHash.hasOwnProperty(nodeJson.id)) {
           nodeJsonArray.push(nodeJson);
           checkedNodeidHash[nodeJson.id] = cnt;
           ++cnt;
       }
       else {
           var pos = checkedNodeidHash[nodeJson.id];
           nodeJsonArray[pos].s = 'ab'; // appear in both sets
       }
   }
   var nodeStrArray = [];
   for(var i = 0, il = nodeJsonArray.length; i < il; ++i) {
       var nodeJson = nodeJsonArray[i];
       nodeStrArray.push(JSON.stringify(nodeJson));
   }
   nodeStr = nodeStrArray.join(', ');
   // linkStr
   linkArray = node_link1.link.concat(node_link2.link);
   linkStr = linkArray.join(', ');
   // add chemicals, no links for chemicals
   var selectedAtoms = ic.unionHash(ic.cloneHash(atomSet1), atomSet2);
   var chemicalNodeStr = '';
   var hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
     disulfideLinkStr = '', crossLinkStr = '';
       // add hydrogen bonds for each set
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
           hBondLinkStr += me.getHbondLinksForSet(atomSet2, labelType);
           hBondLinkStr += me.getHbondLinksForSet(atomSet1, labelType);
       }
       // add ionic interaction for each set
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
           ionicLinkStr += me.getIonicLinksForSet(atomSet2, labelType);
           ionicLinkStr += me.getIonicLinksForSet(atomSet1, labelType);
       }
       // add halogen, pi-cation and pi-stacking for each set
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
           halogenpiLinkStr += me.getHalogenPiLinksForSet(atomSet2, labelType);
           halogenpiLinkStr += me.getHalogenPiLinksForSet(atomSet1, labelType);
       }
       // add contacts for each set
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
           contactLinkStr += me.getContactLinksForSet(atomSet2, labelType);
           contactLinkStr += me.getContactLinksForSet(atomSet1, labelType);
       }
       //else {
       //    contactLinkStr += me.getContactLinksForSet(atomSet1, labelType);
       //}
       // add disulfide bonds
       for(var structure in ic.ssbondpnts) {
           for(var i = 0, il = ic.ssbondpnts[structure].length; i < il; i += 2) {
               var resid1 = ic.ssbondpnts[structure][i]; //1GPK_A_402
               var resid2 = ic.ssbondpnts[structure][i+1];
               var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
               var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
               if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                   var resName1 = ic.residueName2Abbr(atom1.resn) + atom1.resi;
                   if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                   if(labelType == 'structure') resName1 += '.' + atom1.structure;
                   var resName2 = ic.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                   if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                   if(labelType == 'structure') resName2 += '.' + atom2.structure;
                   disulfideLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                       + '", "v": ' + me.ssbondValue + ', "c": "' + me.ssbondColor + '"}';
               }
           }
       }
       // add cross linkage
       for(var structure in ic.clbondpnts) {
           for(var i = 0, il = ic.clbondpnts[structure].length; i < il; i += 2) {
               var resid1 = ic.clbondpnts[structure][i]; //1GPK_A_402
               var resid2 = ic.clbondpnts[structure][i+1];
               var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
               var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
               if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                   var resName1 = ic.residueName2Abbr(atom1.resn) + atom1.resi;
                   if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                   if(labelType == 'structure') resName1 += '.' + atom1.structure;
                   var resName2 = ic.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                   if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                   if(labelType == 'structure') resName2 += '.' + atom2.structure;
                   crossLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                       + '", "v": ' + me.clbondValue + ', "c": "' + me.clbondColor + '"}';
               }
           }
       }
   var resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
   //resStr += linkStr + html + hBondLinkStr + ionicLinkStr + halogenpiLinkStr + disulfideLinkStr + crossLinkStr + contactLinkStr;
   resStr += linkStr + html + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;
   resStr += ']}';
   return resStr;
};
iCn3DUI.prototype.drawResNode = function(node, i, r, gap, margin, y, setName, bVertical) { var me = this, ic = me.icn3d; "use strict";
    var x, resid = node.r.substr(4);
    if(bVertical) {
        x = margin - i * (r + gap);
    }
    else {
        x = margin + i * (r + gap);
    }
    var atom = ic.getFirstAtomObj(ic.residues[resid]);
    //var color = "#" + atom.color.getHexString().toUpperCase();
    var color = "#" + node.c.toUpperCase();
    var hlColor = "#" + ic.hColor.getHexString().toUpperCase();
    var pos = node.id.indexOf('.');
    var nodeName = (pos == -1) ? node.id : node.id.substr(0, pos);
    var adjustx = 0, adjusty = (setName == 'a') ? -7 : 10;
    if(i % 2 == 1) adjusty = (setName == 'a') ? adjusty - 7 : adjusty + 7;
    var strokecolor = '#000';
    var strokewidth = '1';
    var textcolor = '#000';
    var fontsize = '6';
    var html = "<g class='icn3d-node' resid='" + resid + "' >";
    html += "<title>" + node.id + "</title>";
    if(bVertical) {
        html += "<circle cx='" + y + "' cy='" + x + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
        html += "<text x='" + (y - 20).toString() + "' y='" + (x + 2).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
    }
    else {
        html += "<circle cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
        html += "<text x='" + (x + adjustx).toString() + "' y='" + (y + adjusty).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
    }
    html += "</g>";
    return html;
};
iCn3DUI.prototype.getNodeTopBottom = function(nameHash, name2node, bReverseNode) { var me = this, ic = me.icn3d; "use strict";
    var nodeArray1 = [], nodeArray2 = [];
    for(var name in nameHash) {
        var node = name2node[name];
        if(!node) continue;

        if(node.s == 'a') {
            nodeArray1.push(node);
        }
        else if(node.s == 'b') {
            nodeArray2.push(node);
        }
        else if(node.s == 'ab') {
            nodeArray1.push(node);
            nodeArray2.push(node);
        }
    }
    // sort array
    nodeArray1.sort(function(a,b) {
      return me.compNode(a, b);
    });
    nodeArray2.sort(function(a,b) {
      return me.compNode(a, b, bReverseNode);
    });
    return {"nodeArray1": nodeArray1, "nodeArray2": nodeArray2};
};
iCn3DUI.prototype.updateGraphJson = function(struc, index, nodeArray1, nodeArray2, linkArray) { var me = this, ic = me.icn3d; "use strict";
    var lineGraphStr = '';
    lineGraphStr += '"structure' + index + '": {"id": "' + struc + '", "nodes1":[';
    lineGraphStr += me.getJSONFromArray(nodeArray1);
    lineGraphStr += '], \n"nodes2":[';
    lineGraphStr += me.getJSONFromArray(nodeArray2);
    lineGraphStr += '], \n"links":[';
    lineGraphStr += me.getJSONFromArray(linkArray);
    lineGraphStr += ']}';
    return lineGraphStr;
};

iCn3DUI.prototype.updateGraphColor = function () { var me = this, ic = me.icn3d; "use strict";
  // change graph color
  if(me.graphStr !== undefined) {
      var graphJson = JSON.parse(me.graphStr);
      var resid2color = {};
      for(var resid in ic.residues) {
          var atom = ic.getFirstAtomObj(ic.residues[resid]);
          resid2color[resid] = atom.color.getHexString().toUpperCase();
      }
      var target2resid = {};
      for(var i = 0, il = graphJson.nodes.length; i < il; ++i) {
          var node = graphJson.nodes[i];
          //node.r: 1_1_1KQ2_A_1
          //var idArray = node.r.split('_');
          var idArray = [];
          idArray.push('');
          idArray.push('');

          var tmpStr = node.r.substr(4);
          idArray = idArray.concat(me.getIdArray(tmpStr));

          var resid = idArray[2] + '_' + idArray[3] + '_' + idArray[4];
          node.c = resid2color[resid];
          target2resid[node.id] = resid;
      }
      for(var i = 0, il = graphJson.links.length; i < il; ++i) {
          var link = graphJson.links[i];
          if(link.v == me.ssValue || link.v == me.coilValue) {
              var resid = target2resid[link.target];
              link.c = resid2color[resid];
          }
      }
      me.graphStr = JSON.stringify(graphJson);
  }
  if(me.bGraph) me.drawGraph(me.graphStr, me.pre + 'dl_graph');
  if(me.bLinegraph) me.drawLineGraph(me.graphStr);
  if(me.bScatterplot) me.drawLineGraph(me.graphStr, true);
};

iCn3DUI.prototype.handleForce = function() { var me = this, ic = me.icn3d; "use strict";
   if(me.force == 0 && me.simulation !== undefined) {
       me.simulation.stop();
       me.simulation.force("charge", null);
       me.simulation.force("x", null);
       me.simulation.force("y", null);
       me.simulation.force("r", null);
       me.simulation.force("link", null);
   }
   else {
       me.drawGraph(me.graphStr, me.pre + 'dl_graph');
   }
};

