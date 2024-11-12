/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// import { Refnum } from "../annotations/refnum";

class GetGraph {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    getGraphData(atomSet2, atomSet1, nameArray2, nameArray, html, labelType, bAnyAtom) { let ic = this.icn3d, me = ic.icn3dui;
       // get the nodes and links data
       let nodeStr = '', linkStr = '';
       let nodeArray = [], linkArray = [];
       let node_link1 = this.getNodesLinksForSet(atomSet2, labelType, 'a', bAnyAtom);
       let node_link2 = this.getNodesLinksForSet(atomSet1, labelType, 'b', bAnyAtom);

       nodeArray = node_link1.node.concat(node_link2.node);
       // removed duplicated nodes
       let nodeJsonArray = [];
       let checkedNodeidHash = {}
       let cnt = 0;
       for(let i = 0, il = nodeArray.length; i < il; ++i) {
           let node = nodeArray[i];
           let nodeJson = JSON.parse(node);
           if(!checkedNodeidHash.hasOwnProperty(nodeJson.id)) {
               nodeJsonArray.push(nodeJson);
               checkedNodeidHash[nodeJson.id] = cnt;
               ++cnt;
           }
           else {
               let pos = checkedNodeidHash[nodeJson.id];
               nodeJsonArray[pos].s = 'ab'; // appear in both sets
           }
       }
       let nodeStrArray = [];
       for(let i = 0, il = nodeJsonArray.length; i < il; ++i) {
           let nodeJson = nodeJsonArray[i];
           nodeStrArray.push(JSON.stringify(nodeJson));
       }
       nodeStr = nodeStrArray.join(', ');
       // linkStr
       linkArray = node_link1.link.concat(node_link2.link);
       linkStr = linkArray.join(', ');
       // add chemicals, no links for chemicals
       let selectedAtoms = me.hashUtilsCls.unionHash(me.hashUtilsCls.cloneHash(atomSet1), atomSet2);
       let chemicalNodeStr = '';
       let hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
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
           for(let structure in ic.ssbondpnts) {
               for(let i = 0, il = ic.ssbondpnts[structure].length; i < il; i += 2) {
                   let resid1 = ic.ssbondpnts[structure][i]; //1GPK_A_402
                   let resid2 = ic.ssbondpnts[structure][i+1];
                   let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                   let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       let resName1 = me.utilsCls.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       let resName2 = me.utilsCls.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       disulfideLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.htmlCls.ssbondValue + ', "c": "' + me.htmlCls.ssbondColor + '"}';
                   }
               }
           }
           // add cross linkage
           for(let structure in ic.clbondpnts) {
               for(let i = 0, il = ic.clbondpnts[structure].length; i < il; i += 2) {
                   let resid1 = ic.clbondpnts[structure][i]; //1GPK_A_402
                   let resid2 = ic.clbondpnts[structure][i+1];
                   let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1]);
                   let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       let resName1 = me.utilsCls.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       let resName2 = me.utilsCls.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       crossLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.htmlCls.clbondValue + ', "c": "' + me.htmlCls.clbondColor + '"}';
                   }
               }
           }
       let resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
       //resStr += linkStr + html + hBondLinkStr + ionicLinkStr + halogenpiLinkStr + disulfideLinkStr + crossLinkStr + contactLinkStr;
       if(linkStr == '') {
           resStr += linkStr + html.substr(1) + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;
       }
       else {
           resStr += linkStr + html + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;
       }
       resStr += ']}';

       return resStr;
    }

    drawResNode(node, i, r, gap, margin, y, setName, bVertical, bContactMap, bAfMap) { let ic = this.icn3d, me = ic.icn3dui;
        let x, resid = node.r.substr(4);
        if(bVertical) {
            x = margin - i *(r + gap);
        }
        else {
            x = margin + i *(r + gap);
        }
        let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
        //var color = "#" + atom.color.getHexString().toUpperCase();
        let color = "#" + node.c.toUpperCase();
        let hlColor = "#" + ic.hColor.getHexString().toUpperCase();
        let pos = node.id.indexOf('.');
        let nodeName =(pos == -1) ? node.id : node.id.substr(0, pos);
        let adjustx = 0, adjusty =(setName == 'a') ? -7 : 10;
        if(i % 2 == 1) adjusty =(setName == 'a') ? adjusty - 7 : adjusty + 7;

        if(bContactMap) {
            nodeName = nodeName.substr(1);
            if(!bVertical) adjusty += 4 * r;
        }

        // show reference numbers
        if(ic.bShownRefnum && ic.resid2refnum[resid]) {
            let refnumLabel = ic.resid2refnum[resid];
            let refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);

            let resn = ic.residueId2Name[resid]
            nodeName = resn + refnumStr;
        }

        let strokecolor = '#000';
        let strokewidth = '1';
        let textcolor = '#000';
        let fontsize = '6px'; // '6';
        //let html = (bAfMap) ? "<g>" : "<g class='icn3d-node' resid='" + resid + "' >";
        let html = "<g class='icn3d-node' resid='" + resid + "' >";
        let title = node.id;
        if(ic.resid2refnum[resid]) {
            title += '=>' + ic.resid2refnum[resid];
        }
        html += "<title>" + title + "</title>";
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
    getNodeTopBottom(nameHash, name2node, bReverseNode, bCommonDiff, nameHashCommon) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        let nodeArray1 = [], nodeArray2 = [], name2nodeCommon = {};

        let separatorCommon = "=>", separatorDiff = "==>", postCommon = "-", postDiff = "--";
        for(let name in nameHash) {
            let node = name2node[name];
            if(!node) continue;

            if(bCommonDiff == 1 || bCommonDiff == 2) {
                node = me.hashUtilsCls.cloneHash(node);

                if(bCommonDiff == 1) {
                    let mapping = (nameHashCommon[name]) ? nameHashCommon[name] : postCommon;
                    node.id += separatorCommon + mapping;
                }
                else {
                    let mapping = (nameHashCommon[name]) ? nameHashCommon[name] : postDiff;
                    node.id += separatorDiff + mapping;
                }

                name2nodeCommon[node.id] = node;
            }

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

        return {"nodeArray1": nodeArray1, "nodeArray2": nodeArray2, "name2node": name2nodeCommon};
    }
    updateGraphJson(struc, index, nodeArray1, nodeArray2, linkArray) { let ic = this.icn3d, me = ic.icn3dui;
        let lineGraphStr = '';
        lineGraphStr += '"structure' + index + '": {"id": "' + struc + '", "nodes1":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray1);
        lineGraphStr += '], \n"nodes2":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray2);
        lineGraphStr += '], \n"links":[';
        lineGraphStr += me.utilsCls.getJSONFromArray(linkArray);
        lineGraphStr += ']}';
        return lineGraphStr;
    }

    updateGraphColor() { let ic = this.icn3d, me = ic.icn3dui;
      // change graph color

      // do not update the graph for now
      /*
      if(ic.graphStr !== undefined) {
          let graphJson = JSON.parse(ic.graphStr);
          let resid2color = {}
          for(let resid in ic.residues) {
              let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
              resid2color[resid] = atom.color.getHexString().toUpperCase();
          }

          let target2resid = {}
          for(let i = 0, il = graphJson.nodes.length; i < il; ++i) {
              let node = graphJson.nodes[i];
              //node.r: 1_1_1KQ2_A_1
              //var idArray = node.r.split('_');
              let idArray = [];
              idArray.push('');
              idArray.push('');

              let tmpStr = node.r.substr(4);
              idArray = idArray.concat(me.utilsCls.getIdArray(tmpStr));

              let resid = idArray[2] + '_' + idArray[3] + '_' + idArray[4];
              node.c = resid2color[resid];
              target2resid[node.id] = resid;
          }
          for(let i = 0, il = graphJson.links.length; i < il; ++i) {
              let link = graphJson.links[i];
              if(link.v == me.htmlCls.ssValue || link.v == me.htmlCls.coilValue) {
                  let resid = target2resid[link.target];
                  link.c = resid2color[resid];
              }
          }
          ic.graphStr = JSON.stringify(graphJson);
      }

      if(ic.bGraph) ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
      if(ic.bLinegraph) ic.lineGraphCls.drawLineGraph(ic.graphStr);
      if(ic.bScatterplot) ic.lineGraphCls.drawLineGraph(ic.graphStr, true);
      */
    }

    handleForce() { let ic = this.icn3d, me = ic.icn3dui;
       if(me.htmlCls.force == 0 && ic.simulation !== undefined) {
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

    getNodesLinksForSet(atomSet, labelType, setName, bAnyAtom) { let ic = this.icn3d, me = ic.icn3dui;
       //var nodeStr = '', linkStr = '';
       let nodeArray = [], linkArray = [];
       let cnt = 0, linkCnt = 0;
       let thickness = me.htmlCls.coilValue;
       let prevChain = '', prevResName = '', prevResi = 0, prevAtom;
       // add chemicals as well
       let residHash = {}
       for(let i in atomSet) {
           let atom = ic.atoms[i];

           if(atom.chain != 'DUM' && (bAnyAtom || atom.het || (atom.name == "CA" && atom.elem == "C") || atom.name == "O3'" || atom.name == "O3*" || atom.name == "P")) {
           // starting nucleotide have "P"
           //if(atom.chain != 'DUM' &&(atom.name == "CA" || atom.name == "P")) {
               let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
               if(residHash.hasOwnProperty(resid)) {
                   continue;
               }
               else {
                   residHash[resid] = 1;
               }
               let resName = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi;
               if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
               if(labelType == 'structure') resName += '.' + atom.structure;
               // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
               let residLabel = '1_1_' + resid;
               //if(cnt > 0) nodeStr += ', ';
               let colorStr = (atom.color) ? atom.color.getHexString().toUpperCase() : '000';
               
               nodeArray.push('{"id": "' + resName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + atom.coord.x.toFixed(0)
                   + ', "y": ' + atom.coord.y.toFixed(0) + ', "c": "' + colorStr + '"}');
               if(cnt > 0 && prevChain == atom.chain &&(ic.resid2ncbi[atom.resi] == ic.resid2ncbi[prevResi] + 1 || ic.resid2ncbi[atom.resi] == ic.resid2ncbi[prevResi]) ) {
                   //if(linkCnt > 0) linkStr += ', ';
                   linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                       + '", "v": ' + thickness + ', "c": "' + colorStr + '"}');
                   if(atom.ssbegin) thickness = me.htmlCls.ssValue;
                   if(atom.ssend) thickness = me.htmlCls.coilValue;
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
    getHbondLinksForSet(atoms, labelType) { let ic = this.icn3d, me = ic.icn3dui;
        let resid2ResidhashHbond = {}
        let threshold = parseFloat($("#" + ic.pre + "hbondthreshold" ).val());
        // not only protein or nucleotides, could be ligands
        let firstSetAtoms = atoms;
        let complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            let bSaltbridge = false;
            // let selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            let selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.hash2Atoms(complement, ic.atoms), me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2ResidhashHbond = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }

        //let hbondStr = this.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.htmlCls.hbondInsideColor, labelType, me.htmlCls.hbondValuehbondInsideValue);
        let hbondStr = this.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.htmlCls.hbondInsideColor, labelType, me.htmlCls.hbondInsideValue);

        return hbondStr;
    }
    getIonicLinksForSet(atoms, labelType) { let ic = this.icn3d, me = ic.icn3dui;
        let resid2Residhash = {}
        let threshold = parseFloat($("#" + ic.pre + "saltbridgethreshold" ).val());
        // not only protein or nucleotides, could be ligands
        let firstSetAtoms = atoms;
        let complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            let bSaltbridge = false;
            // let selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            let selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.hash2Atoms(complement, ic.atoms), me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        let ionicStr = this.getGraphLinks(resid2Residhash, resid2Residhash, me.htmlCls.ionicInsideColor, labelType, me.htmlCls.ionicInsideValue);
        return ionicStr;
    }
    getHalogenPiLinksForSet(atoms, labelType) { let ic = this.icn3d, me = ic.icn3dui;
        let resid2Residhash = {}
        let firstSetAtoms = atoms;
        let complement = firstSetAtoms;
        let halogenpiStr = '', threshold;
        threshold = parseFloat($("#" + ic.pre + "halogenthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'halogen', true );
            let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), me.hashUtilsCls.hash2Atoms(complement, ic.atoms), parseFloat(threshold), 'graph', 'halogen', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, me.htmlCls.halogenInsideColor, labelType, me.htmlCls.halogenInsideValue);
        threshold = parseFloat($("#" + ic.pre + "picationthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-cation', true );
            let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), me.hashUtilsCls.hash2Atoms(complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-cation', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, me.htmlCls.picationInsideColor, labelType, me.htmlCls.picationInsideValue);
        threshold = parseFloat($("#" + ic.pre + "pistackingthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-stacking', true );
            let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), me.hashUtilsCls.hash2Atoms(complement, ic.atoms), parseFloat(threshold), 'graph', 'pi-stacking', true );
            resid2Residhash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += this.getGraphLinks(resid2Residhash, resid2Residhash, me.htmlCls.pistackingInsideColor, labelType, me.htmlCls.pistackingInsideValue);
        return halogenpiStr;
    }
    getContactLinksForSet(atoms, labelType, bCartoon2d) { let ic = this.icn3d, me = ic.icn3dui;
        let ssAtomsArray = [];
        let prevSS = '', prevChain = '';
        let ssAtoms = {}
        for(let i in atoms) {
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
        for(let i = 0; i < len; ++i) {
            for(let j = i + 1; j < len; ++j) {
                interStr += this.getContactLinks(ssAtomsArray[i], ssAtomsArray[j], labelType, true, bCartoon2d);
            }
        }

        return interStr;
    }
    getContactLinks(atomlistTarget, otherAtoms, labelType, bInternal, bCartoon2d) { let ic = this.icn3d, me = ic.icn3dui;
        let radius = parseFloat($("#" + ic.pre + "contactthreshold" ).val());
        let bGetPairs = true, bInteraction = false;
        let atoms = ic.contactCls.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction, bInternal);
        let residHash = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        let interStr = this.getGraphLinks(residHash, residHash, me.htmlCls.contactInsideColor, labelType, me.htmlCls.contactInsideValue, bCartoon2d);
        return interStr;
    }
    compNode(a, b, bReverseChain) { let ic = this.icn3d, me = ic.icn3dui;
      let resid1 = a.r.substr(4); // 1_1_1KQ2_A_1
      let resid2 = b.r.substr(4); // 1_1_1KQ2_A_1
      let aIdArray = me.utilsCls.getIdArray(resid1); //resid1.split('_');
      let bIdArray = me.utilsCls.getIdArray(resid2); //resid2.split('_');
      let aChainid = aIdArray[0] + '_' + aIdArray[1];
      let bChainid = bIdArray[0] + '_' + bIdArray[1];
      let aResi = parseInt(aIdArray[2]);
      let bResi = parseInt(bIdArray[2]);
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

    getGraphLinks(hash1, hash2, color, labelType, value, bCartoon2d) {var ic = this.icn3d, me = ic.icn3dui;
        let hbondStr = '';
        value =(value === undefined) ? 1 : value;
        //let prevLinkStr = '';
        //let sourceTargetHash = {};

        let linkstr2cnt = {};
        for(let resid1 in hash1) {
            //ASN $1KQ2.A:6@ND2
            //or ASN $1KQ2.A:6
            // or ASN $1KQ2.A:6@ND2 2006
            let resid1Ori = resid1.trim();

            let idArray1 = resid1Ori.split(' ');
            if(idArray1.length == 3) {
                resid1 = idArray1[0] + ' ' + idArray1[1];
            }
            
            let pos1a = resid1.indexOf(' ');
            let pos1b = resid1.indexOf(':');
            let posTmp1 = resid1.indexOf('@');
            let pos1c =(posTmp1 !== -1) ? posTmp1 : resid1.length;
            let pos1d = resid1.indexOf('.');
            let pos1e = resid1.indexOf('$');
            let resName1 = me.utilsCls.residueName2Abbr(resid1.substr(0, pos1a)) + resid1.substr(pos1b + 1, pos1c - pos1b - 1);
            if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + resid1.substr(pos1d + 1, pos1b - pos1d - 1);
            if(labelType == 'structure') resName1 += '.' + resid1.substr(pos1e + 1, pos1d - pos1e - 1);
            for(let resid2 in hash2[resid1Ori]) {
                let resid2Ori = resid2.trim();

                let idArray2 = resid2Ori.split(' ');
                if(idArray2.length == 3) {
                    resid2 = idArray2[0] + ' ' + idArray2[1];
                }

                let pos2a = resid2.indexOf(' ');
                let pos2b = resid2.indexOf(':');
                let posTmp2 = resid2.indexOf('@');
                let pos2c =(posTmp2 !== -1) ? posTmp2 : resid2.length;
                let pos2d = resid2.indexOf('.');
                let pos2e = resid2.indexOf('$');
                let resName2 = me.utilsCls.residueName2Abbr(resid2.substr(0, pos2a)) + resid2.substr(pos2b + 1, pos2c - pos2b - 1); //
                    + '_' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'structure') resName2 += '.' + resid2.substr(pos2e + 1, pos2d - pos2e - 1);

                if(bCartoon2d) {
                    resName1 = ic.resi2resirange[resName1];
                    resName2 = ic.resi2resirange[resName2];
                }

                if(resName1 !== undefined && resName2 !== undefined ) {
                    let linkStr = '"source": "' + resName1 + '", "target": "' + resName2 + '", "v": ' + value + ', "c": "' + color + '"';

                    //prevLinkStr = linkStr;

                    if(!linkstr2cnt.hasOwnProperty(linkStr)) {
                        linkstr2cnt[linkStr] = 1;
                    }
                    else {
                        ++linkstr2cnt[linkStr];
                    }
                }
            }
        }

        for(let linkStr in linkstr2cnt) {
            // do not differentiate the number of contacts
            let n = (value == me.htmlCls.contactInsideValue || value == me.htmlCls.contactValue) ? 1 : linkstr2cnt[linkStr];
            hbondStr += ', {' + linkStr + ', "n": ' + n + '}';
        }

        return hbondStr;
    }
    convertLabel2Resid(residLabel) {var ic = this.icn3d, me = ic.icn3dui;
        //ASN $1KQ2.A:6@ND2
        //or ASN $1KQ2.A:6
        // or ASN $1KQ2.A:6@ND2 1234
        let idArray = residLabel.split(' ');
        residLabel = (idArray.length == 2) ? residLabel : residLabel.substr(0, residLabel.lastIndexOf(' '));
        
        let pos1 = residLabel.indexOf(' ');
        let pos2Tmp = residLabel.indexOf('@');
        let pos2 =(pos2Tmp !== -1) ? pos2Tmp : residLabel.length;
        let pos3 = residLabel.indexOf('$');
        let pos4 = residLabel.indexOf('.');
        let pos5 = residLabel.indexOf(':');
        let resid = residLabel.substr(pos3 + 1, pos4 - pos3 - 1) + '_' + residLabel.substr(pos4 + 1, pos5 - pos4 - 1)
            + '_' + residLabel.substr(pos5 + 1, pos2 - pos5 - 1);
        return resid;
    }

}

export {GetGraph}
