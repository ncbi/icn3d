/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {LineGraph} from '../interaction/lineGraph.js';
import {Contact} from '../interaction/contact.js';
import {HBond} from '../interaction/hBond.js';
import {PiHalogen} from '../interaction/piHalogen.js';
import {Saltbridge} from '../interaction/saltbridge.js';

class GetGraph {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    getGraphData(atomSet2, atomSet1, nameArray2, nameArray, html, labelType) { var ic = this.icn3d, me = ic.icn3dui;
       // get the nodes and links data
       var nodeStr = '', linkStr = '';
       var nodeArray = [], linkArray = [];
       var node_link1 = this.getNodesLinksForSet(atomSet2, labelType, 'a');
       var node_link2 = this.getNodesLinksForSet(atomSet1, labelType, 'b');
       nodeArray = node_link1.node.concat(node_link2.node);
       // removed duplicated nodes
       var nodeJsonArray = [];
       var checkedNodeidHash = {}
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
       var selectedAtoms = me.hashUtilsCls.unionHash(me.hashUtilsCls.cloneHash(atomSet1), atomSet2);
       var chemicalNodeStr = '';
       var hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
         disulfideLinkStr = '', crossLinkStr = '';
           // add hydrogen bonds for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               hBondLinkStr += this.getHbondLinksForSet(atomSet2, labelType);
               hBondLinkStr += this.getHbondLinksForSet(atomSet1, labelType);
           }
           // add ionic interaction for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               ionicLinkStr += this.getIonicLinksForSet(atomSet2, labelType);
               ionicLinkStr += this.getIonicLinksForSet(atomSet1, labelType);
           }
           // add halogen, pi-cation and pi-stacking for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               halogenpiLinkStr += this.getHalogenPiLinksForSet(atomSet2, labelType);
               halogenpiLinkStr += this.getHalogenPiLinksForSet(atomSet1, labelType);
           }
           // add contacts for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               contactLinkStr += this.getContactLinksForSet(atomSet2, labelType);
               contactLinkStr += this.getContactLinksForSet(atomSet1, labelType);
           }
           //else {
           //    contactLinkStr += this.getContactLinksForSet(atomSet1, labelType);
           //}
           // add disulfide bonds
           for(var structure in ic.ssbondpnts) {
               for(var i = 0, il = ic.ssbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = ic.ssbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = ic.ssbondpnts[structure][i+1];
                   var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                   var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = me.utilsCls.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       var resName2 = me.utilsCls.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       disulfideLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + ic.icn3dui.htmlCls.ssbondValue + ', "c": "' + ic.icn3dui.htmlCls.ssbondColor + '"}';
                   }
               }
           }
           // add cross linkage
           for(var structure in ic.clbondpnts) {
               for(var i = 0, il = ic.clbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = ic.clbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = ic.clbondpnts[structure][i+1];
                   var atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                   var atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = me.utilsCls.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       var resName2 = me.utilsCls.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       crossLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + ic.icn3dui.htmlCls.clbondValue + ', "c": "' + ic.icn3dui.htmlCls.clbondColor + '"}';
                   }
               }
           }
       var resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
       //resStr += linkStr + html + hBondLinkStr + ionicLinkStr + halogenpiLinkStr + disulfideLinkStr + crossLinkStr + contactLinkStr;
       resStr += linkStr + html + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;
       resStr += ']}';
       return resStr;
    }
    drawResNode(node, i, r, gap, margin, y, setName, bVertical) { var ic = this.icn3d, me = ic.icn3dui;
        var x, resid = node.r.substr(4);
        if(bVertical) {
            x = margin - i *(r + gap);
        }
        else {
            x = margin + i *(r + gap);
        }
        var atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
        //var color = "#" + atom.color.getHexString().toUpperCase();
        var color = "#" + node.c.toUpperCase();
        var hlColor = "#" + ic.hColor.getHexString().toUpperCase();
        var pos = node.id.indexOf('.');
        var nodeName =(pos == -1) ? node.id : node.id.substr(0, pos);
        var adjustx = 0, adjusty =(setName == 'a') ? -7 : 10;
        if(i % 2 == 1) adjusty =(setName == 'a') ? adjusty - 7 : adjusty + 7;
        var strokecolor = '#000';
        var strokewidth = '1';
        var textcolor = '#000';
        var fontsize = '6';
        var html = "<g class='icn3d-node' resid='" + resid + "' >";
        html += "<title>" + node.id + "</title>";
        if(bVertical) {
            html += "<circle cx='" + y + "' cy='" + x + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
            html += "<text x='" +(y - 20).toString() + "' y='" +(x + 2).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
        }
        else {
            html += "<circle cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
            html += "<text x='" +(x + adjustx).toString() + "' y='" +(y + adjusty).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
        }
        html += "</g>";
        return html;
    }
    getNodeTopBottom(nameHash, name2node, bReverseNode) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;
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
          return thisClass.compNode(a, b);
        });
        nodeArray2.sort(function(a,b) {
          return thisClass.compNode(a, b, bReverseNode);
        });
        return {"nodeArray1": nodeArray1, "nodeArray2": nodeArray2}
    }
    updateGraphJson(struc, index, nodeArray1, nodeArray2, linkArray) { var ic = this.icn3d, me = ic.icn3dui;
        var lineGraphStr = '';
        lineGraphStr += '"structure' + index + '": {"id": "' + struc + '", "nodes1":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray1);
        lineGraphStr += '], \n"nodes2":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray2);
        lineGraphStr += '], \n"links":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(linkArray);
        lineGraphStr += ']}';
        return lineGraphStr;
    }

    updateGraphColor() { var ic = this.icn3d, me = ic.icn3dui;
      // change graph color
      if(ic.graphStr !== undefined) {
          var graphJson = JSON.parse(ic.graphStr);
          var resid2color = {}
          for(var resid in ic.residues) {
              var atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
              resid2color[resid] = atom.color.getHexString().toUpperCase();
          }
          var target2resid = {}
          for(var i = 0, il = graphJson.nodes.length; i < il; ++i) {
              var node = graphJson.nodes[i];
              //node.r: 1_1_1KQ2_A_1
              //var idArray = node.r.split('_');
              var idArray = [];
              idArray.push('');
              idArray.push('');

              var tmpStr = node.r.substr(4);
              idArray = idArray.concat(me.utilsCls.getIdArray(tmpStr));

              var resid = idArray[2] + '_' + idArray[3] + '_' + idArray[4];
              node.c = resid2color[resid];
              target2resid[node.id] = resid;
          }
          for(var i = 0, il = graphJson.links.length; i < il; ++i) {
              var link = graphJson.links[i];
              if(link.v == ic.icn3dui.htmlCls.ssValue || link.v == ic.icn3dui.htmlCls.coilValue) {
                  var resid = target2resid[link.target];
                  link.c = resid2color[resid];
              }
          }
          ic.graphStr = JSON.stringify(graphJson);
      }
      if(ic.bGraph) ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
      if(ic.bLinegraph) ic.lineGraphCls.drawLineGraph(ic.graphStr);
      if(ic.bScatterplot) ic.lineGraphCls.drawLineGraph(ic.graphStr, true);
    }

    handleForce() { var ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.htmlCls.force == 0 && ic.simulation !== undefined) {
           ic.simulation.stop();
           ic.simulation.force("charge", null);
           ic.simulation.force("x", null);
           ic.simulation.force("y", null);
           ic.simulation.force("r", null);
           ic.simulation.force("link", null);
       }
       else {
           ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
       }
    }

    getNodesLinksForSet(atomSet, labelType, setName) { var ic = this.icn3d, me = ic.icn3dui;
       //var nodeStr = '', linkStr = '';
       var nodeArray = [], linkArray = [];
       var cnt = 0, linkCnt = 0;
       var thickness = ic.icn3dui.htmlCls.coilValue;
       var prevChain = '', prevResName = '', prevResi = 0, prevAtom;
       // add chemicals as well
       var residHash = {}
       for(var i in atomSet) {
           var atom = ic.atoms[i];
           if(atom.chain != 'DUM' &&(atom.het ||(atom.name == "CA" && atom.elem == "C") || atom.name == "O3'" || atom.name == "O3*" || atom.name == "P")) {
           // starting nucleotide have "P"
           //if(atom.chain != 'DUM' &&(atom.name == "CA" || atom.name == "P")) {
               var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
               if(residHash.hasOwnProperty(resid)) {
                   continue;
               }
               else {
                   residHash[resid] = 1;
               }
               var resName = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi;
               if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
               if(labelType == 'structure') resName += '.' + atom.structure;
               // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
               var residLabel = '1_1_' + resid;
               //if(cnt > 0) nodeStr += ', ';
               nodeArray.push('{"id": "' + resName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + atom.coord.x.toFixed(0)
                   + ', "y": ' + atom.coord.y.toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
               if(cnt > 0 && prevChain == atom.chain &&(atom.resi == prevResi + 1 || atom.resi == prevResi) ) {
                   //if(linkCnt > 0) linkStr += ', ';
                   linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                       + '", "v": ' + thickness + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
                   if(atom.ssbegin) thickness = ic.icn3dui.htmlCls.ssValue;
                   if(atom.ssend) thickness = ic.icn3dui.htmlCls.coilValue;
                   ++linkCnt;
               }
               prevChain = atom.chain;
               prevResName = resName;
               prevResi = atom.resi;
               ++cnt;
           }
       }
       return {"node": nodeArray, "link":linkArray}
    }
    getHbondLinksForSet(atoms, labelType) { var ic = this.icn3d, me = ic.icn3dui;
        var resid2ResidhashHbond = {}
        var threshold = parseFloat($("#" + ic.pre + "hbondthreshold" ).val());
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2ResidhashHbond = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        var hbondStr = this.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, ic.icn3dui.htmlCls.hbondInsideColor, labelType, ic.icn3dui.htmlCls.hbondValuehbondInsideValue);
        return hbondStr;
    }
    getIonicLinksForSet(atoms, labelType) { var ic = this.icn3d, me = ic.icn3dui;
        var resid2Residhash = {}
        var threshold = parseFloat($("#" + ic.pre + "saltbridgethreshold" ).val());
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        var ionicStr = this.getGraphLinks(resid2Residhash, resid2Residhash, ic.icn3dui.htmlCls.ionicInsideColor, labelType, ic.icn3dui.htmlCls.ionicInsideValue);
        return ionicStr;
    }
    getHalogenPiLinksForSet(atoms, labelType) { var ic = this.icn3d, me = ic.icn3dui;
        var resid2Residhash = {}
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        var halogenpiStr = '', threshold;
        threshold = parseFloat($("#" + ic.pre + "halogenthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'halogen', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, ic.icn3dui.htmlCls.halogenInsideColor, labelType, ic.icn3dui.htmlCls.halogenInsideValue);
        threshold = parseFloat($("#" + ic.pre + "picationthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-cation', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, ic.icn3dui.htmlCls.picationInsideColor, labelType, ic.icn3dui.htmlCls.picationInsideValue);
        threshold = parseFloat($("#" + ic.pre + "pistackingthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-stacking', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, ic.icn3dui.htmlCls.pistackingInsideColor, labelType, ic.icn3dui.htmlCls.pistackingInsideValue);
        return halogenpiStr;
    }
    getContactLinksForSet(atoms, labelType) { var ic = this.icn3d, me = ic.icn3dui;
        var ssAtomsArray = [];
        var prevSS = '', prevChain = '';
        var ssAtoms = {}
        for(var i in atoms) {
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
        for(var i = 0; i < len; ++i) {
            for(var j = i + 1; j < len; ++j) {
                interStr += this.getContactLinks(ssAtomsArray[i], ssAtomsArray[j], labelType, true);
            }
        }
        return interStr;
    }
    getContactLinks(atomlistTarget, otherAtoms, labelType, bInternal) { var ic = this.icn3d, me = ic.icn3dui;
        var radius = parseFloat($("#" + ic.pre + "contactthreshold" ).val());
        var bGetPairs = true, bInteraction = false;
        var atoms = ic.contactCls.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction, bInternal);
        var residHash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        var interStr = this.getGraphLinks(residHash, residHash, ic.icn3dui.htmlCls.contactInsideColor, labelType, ic.icn3dui.htmlCls.contactInsideValue);
        return interStr;
    }
    compNode(a, b, bReverseChain) { var ic = this.icn3d, me = ic.icn3dui;
      var resid1 = a.r.substr(4); // 1_1_1KQ2_A_1
      var resid2 = b.r.substr(4); // 1_1_1KQ2_A_1
      var aIdArray = me.utilsCls.getIdArray(resid1); //resid1.split('_');
      var bIdArray = me.utilsCls.getIdArray(resid2); //resid2.split('_');
      var aChainid = aIdArray[0] + '_' + aIdArray[1];
      var bChainid = bIdArray[0] + '_' + bIdArray[1];
      var aResi = parseInt(aIdArray[2]);
      var bResi = parseInt(bIdArray[2]);
      if(aChainid > bChainid){
          if(bReverseChain) return -1;
          else return 1;
      }
      else if(aChainid < bChainid){
          if(bReverseChain) return 1;
          else return -1;
      }
      else if(aChainid == bChainid){
        return(aResi > bResi) ? 1 :(aResi < bResi) ? -1 : 0;
      }
    }

    getGraphLinks(hash1, hash2, color, labelType, value) {var ic = this.icn3d, me = ic.icn3dui;
        var hbondStr = '';
        value =(value === undefined) ? 1 : value;
        var prevLinkStr = '';
        for(var resid1 in hash1) {
            //ASN $1KQ2.A:6@ND2
            //or ASN $1KQ2.A:6
            resid1 = resid1.trim();
            var pos1a = resid1.indexOf(' ');
            var pos1b = resid1.indexOf(':');
            var posTmp1 = resid1.indexOf('@');
            var pos1c =(posTmp1 !== -1) ? posTmp1 : resid1.length;
            var pos1d = resid1.indexOf('.');
            var pos1e = resid1.indexOf('$');
            var resName1 = me.utilsCls.residueName2Abbr(resid1.substr(0, pos1a)) + resid1.substr(pos1b + 1, pos1c - pos1b - 1);
            if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + resid1.substr(pos1d + 1, pos1b - pos1d - 1);
            if(labelType == 'structure') resName1 += '.' + resid1.substr(pos1e + 1, pos1d - pos1e - 1);
            for(var resid2 in hash2[resid1]) {
                resid2 = resid2.trim();
                var pos2a = resid2.indexOf(' ');
                var pos2b = resid2.indexOf(':');
                var posTmp2 = resid2.indexOf('@');
                var pos2c =(posTmp2 !== -1) ? posTmp2 : resid2.length;
                var pos2d = resid2.indexOf('.');
                var pos2e = resid2.indexOf('$');
                var resName2 = me.utilsCls.residueName2Abbr(resid2.substr(0, pos2a)) + resid2.substr(pos2b + 1, pos2c - pos2b - 1); //
                    + '_' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'structure') resName2 += '.' + resid2.substr(pos2e + 1, pos2d - pos2e - 1);
                var linkStr = ', {"source": "' + resName1 + '", "target": "' + resName2 + '", "v": ' + value + ', "c": "' + color + '"}';
                if(linkStr != prevLinkStr) hbondStr += linkStr;
                prevLinkStr = linkStr;
            }
        }
        return hbondStr;
    }
    convertLabel2Resid(residLabel) {var ic = this.icn3d, me = ic.icn3dui;
        //ASN $1KQ2.A:6@ND2
        //or ASN $1KQ2.A:6
        var pos1 = residLabel.indexOf(' ');
        var pos2Tmp = residLabel.indexOf('@');
        var pos2 =(pos2Tmp !== -1) ? pos2Tmp : residLabel.length;
        var pos3 = residLabel.indexOf('$');
        var pos4 = residLabel.indexOf('.');
        var pos5 = residLabel.indexOf(':');
        var resid = residLabel.substr(pos3 + 1, pos4 - pos3 - 1) + '_' + residLabel.substr(pos4 + 1, pos5 - pos4 - 1)
            + '_' + residLabel.substr(pos5 + 1, pos2 - pos5 - 1);
        return resid;
    }

}

export {GetGraph}
