/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {DefinedSets} from '../selection/definedSets.js';
import {ViewInterPairs} from '../interaction/viewInterPairs.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Contact} from '../interaction/contact.js';
import {HBond} from '../interaction/hBond.js';
import {PiHalogen} from '../interaction/piHalogen.js';
import {Saltbridge} from '../interaction/saltbridge.js';
import {Selection} from '../selection/selection.js';
import {Draw} from '../display/draw.js';
import {ApplyClbonds} from '../display/applyClbonds.js';
import {HlUpdate} from '../highlight/hlUpdate.js';

class ContactMap {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    contactMap(contactDist, type) { let ic = this.icn3d, me = ic.icn3dui;
       let nameArray = ['selected'];
       let nameArray2 = ['selected'];
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           ic.definedSetsCls.setMode('selection');
           let bHbond = false;
           let bSaltbridge = false;
           let bInteraction = true;
           let bHalogen = false;
           let bPication = false;
           let bPistacking = false;

           let interact
           let result = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking, contactDist);
       }
    }

    drawContactMap(lineGraphStr) { let ic = this.icn3d, me = ic.icn3dui;
        let html, graph = JSON.parse(lineGraphStr);
        let linkArray = graph.links;

        let nodeArray1 = [], nodeArray2 = [];
        let name2node = {}
        for(let i = 0, il = graph.nodes.length; i < il; ++i) {
            let node = graph.nodes[i];
            if(!node) continue;

            name2node[node.id] = node;

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
          return ic.getGraphCls.compNode(a, b);
        });
        nodeArray2.sort(function(a,b) {
          return ic.getGraphCls.compNode(a, b);
        });

        let graphStr = '{\n';

        let struc1 = Object.keys(ic.structures)[0];
        let len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        let factor = 1;
        let r = 3 * factor;
        let gap = 7 * factor;
        let height, width, heightAll;
        let marginX = 10,
            marginY = 10,
            legendWidth = 30;
        heightAll =(len1 + 2) *(r + gap) + 2 * marginY + legendWidth;
        width =(len2 + 2) *(r + gap) + 2 * marginX + legendWidth;

        let id, graphWidth;
        ic.contactmapWidth = 2 * width;
        graphWidth = ic.contactmapWidth;
        id = me.contactmapid;
        html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
        html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
        let bContactMap = true;
        html += ic.lineGraphCls.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0, bContactMap);
        graphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
        html += "</svg>";

        graphStr += '}\n';
        ic.contactmapStr = graphStr;

        $("#" + ic.pre + "contactmapDiv").html(html);
        return html;
    }
}

export {ContactMap}

