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

    contactMap(contactDist, type) { var ic = this.icn3d, me = ic.icn3dui;
       var nameArray = ['selected'];
       var nameArray2 = ['selected'];
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           ic.definedSetsCls.setMode('selection');
           var bHbond = false;
           var bSaltbridge = false;
           var bInteraction = true;
           var bHalogen = false;
           var bPication = false;
           var bPistacking = false;

           var interact
           var result = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking, contactDist);
       }
    }

    drawContactMap(lineGraphStr) { var ic = this.icn3d, me = ic.icn3dui;
        var html, graph = JSON.parse(lineGraphStr);
        var linkArray = graph.links;

        var nodeArray1 = [], nodeArray2 = [];
        var name2node = {}
        for(var i = 0, il = graph.nodes.length; i < il; ++i) {
            var node = graph.nodes[i];
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

        var graphStr = '{\n';

        var struc1 = Object.keys(ic.structures)[0];
        var len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        var factor = 1;
        var r = 3 * factor;
        var gap = 7 * factor;
        var height, width, heightAll;
        var marginX = 10,
            marginY = 10,
            legendWidth = 30;
        heightAll =(len1 + 2) *(r + gap) + 2 * marginY + legendWidth;
        width =(len2 + 2) *(r + gap) + 2 * marginX + legendWidth;

        var id, graphWidth;
        ic.contactmapWidth = 2 * width;
        graphWidth = ic.contactmapWidth;
        id = me.contactmapid;
        html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
        html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
        var bContactMap = true;
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

