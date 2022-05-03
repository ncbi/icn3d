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

    afErrorMap(afid, bFull) { let  ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        me.htmlCls.dialogCls.openDlg('dl_alignerrormap', 'Show Predicted Aligned Error (PAE) map');

        let  url, dataType;
    
        url = "https://alphafold.ebi.ac.uk/files/AF-" + afid + "-F1-predicted_aligned_error_v2.json";

        dataType = "json";
    
        $.ajax({
            url: url,
            dataType: dataType,
            cache: true,
            tryCount : 0,
            retryLimit : 0, //1
            success: function(data) {
                thisClass.processAfErrorMap(data, bFull);
            },
            error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                alert("There are some problems in loading the PAE file...");
                return;
            }
        });      
    }

    processAfErrorMap(dataJson, bFull) { let ic = this.icn3d, me = ic.icn3dui;
        // json format: [{"residue1": [1, ..., 1, ..., n, ..., n], "residue2": [1, 2, ..., n, ..., 1, 2, ..., n], 
        // "distance": [n*n matrix],"max_predicted_aligned_error":31.75}]
        let distMatrix = dataJson[0].distance;
        let max = dataJson[0].max_predicted_aligned_error;
        if(!distMatrix || !max) {
            alert("The PAE file didn't have the right format...");
            return;
        }

        // generate lineGraphStr
        // e.g.,  {"nodes": [{"id":"A1.A","r":"1_1_1TOP_A_1","s":"ab","x":1,"y":21,"c":"FF00FF"}, ...],
        // "links": [{"source": "A1.A", "target": "S2.A", "v": 3, "c": "FF00FF"}, ...]}
        let nodeStr = '"nodes": [', linkStr = '"links": [';
        let bNode = false, bLink = false;
        let postA = '', postB = '.';

        // initialize some parameters if no structure wasloaded yet
        let bStruData;
        if(!ic.chains || Object.keys(ic.chains).length == 0) {
            bStruData = false;
            ic.init_base();
        }
        else {
            bStruData = true;
        }

        //let chainidArray = Object.keys(ic.chains);
        //let chainid = (chainidArray.length == 1) ? chainidArray[0] : 'stru_A';

        let dim = parseInt(Math.sqrt(distMatrix.length));

        // map index with residue number when the structure has multiple chains
        let index = 0;
        let index2resObj = {};
        for(let chainid in ic.chains) {
            for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                index2resObj[index] = ic.chainsSeq[chainid][j];
                index2resObj[index].chainid = chainid;
                ++index;
            }
        }

        //for(let chainid in ic.chains) {
        //for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
        index = 0;
        for(let i = 0; i < dim; ++i) {
            let resi = (bStruData) ? index2resObj[i].resi : i + 1;
            let resn = (bStruData) ? index2resObj[i].name : '*';
            let chainid = (bStruData) ? index2resObj[i].chainid : 'stru_A';

            let resid = chainid + '_' + resi;
            let atom = (ic.residues[resid]) ? ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]) 
                : {color: me.parasCls.thr(0x888888)};
            let chain = chainid.substr(chainid.indexOf('_') + 1);
            let color = atom.color.getHexString();

            if(bNode) nodeStr += ', ';
            let idStr = resn + resi + '.' + chain;
            nodeStr += '{"id":"' + idStr + postA + '","r":"1_1_' + resid + '","s":"a","c":"' + color + '"}\n';
            nodeStr += ', {"id":"' + idStr + postB + '","r":"1_1_' + resid + '","s":"b","c":"' + color + '"}';
            bNode = true;

            let start = (bFull) ? 0 : i; // full map, or half map

            //for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
            //for(let j = 0; j < dim; ++j) {
            for(let j = start; j < dim; ++j) { 
                index = i * dim + j;
                let resi2 = (bStruData) ? index2resObj[j].resi : j + 1;
                let resn2 = (bStruData) ? index2resObj[j].name : '*';
                let chainid2 = (bStruData) ? index2resObj[j].chainid : 'stru_A';
                let chain2 = chainid2.substr(chainid2.indexOf('_') + 1);

                let idStr2 = resn2 + resi2 + '.' + chain2;
                
                // max dark green color 004d00, 0x4d = 77, 77/255 = 0.302
                // 0: 004d00, max: FFFFFF
                let ratio = (distMatrix[index]) ? distMatrix[index] / max : 0;
                let r = parseInt(ratio*255).toString(16);
                let g = parseInt(((1.0 - 0.302)*ratio + 0.302) * 255).toString(16);
                let rHex = (r.length == 1) ? '0' + r : r;
                let gHex = (g.length == 1) ? '0' + g : g;
                let bHex = rHex;
                let color2 = rHex + gHex + bHex;

                if(bLink) linkStr += ', ';
                linkStr += '{"source": "' + idStr + postA + '", "target": "' + idStr2 + postB + '", "v": 11, "c": "' + color2 + '"}\n';
                bLink = true;
            }
        }
        //}

        dataJson = {};

        let lineGraphStr = '{' + nodeStr + '], ' + linkStr + ']}';
        let bAfMap = true;
        this.drawContactMap(lineGraphStr, bAfMap, max);    
        
        if(ic.deferredAfmap !== undefined) ic.deferredAfmap.resolve();
    }

    drawContactMap(lineGraphStr, bAfMap, max) { let ic = this.icn3d, me = ic.icn3dui;
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

        let struc1 = (ic.structures.length > 0) ? ic.structures[0] : 'STRU';
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
        if(bAfMap) {
            ic.alignerrormapWidth = 2 * width;
            graphWidth = ic.alignerrormapWidth;
            id = me.alignerrormapid;
        }
        else {
            ic.contactmapWidth = 2 * width;
            graphWidth = ic.contactmapWidth;
            id = me.contactmapid;
        }

        html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
        html += "<svg xmlns='http://www.w3.org/2000/svg' id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
        let bContactMap = true;

        if(bAfMap) { // cleaned the code by using "use" in SVG, but didn't improve rendering
            let  factor = 1;
            let  r = 3 * factor;
            let  rectSize = 2 * r;

            ic.hex2id = {};
            let threshold = 29.0 / max;
            ic.hex2skip = {}; // do not display any error larger than 29 angstrom

//            html += "<defs>";

            let linestrokewidth = 1;
            let nRef = 1000;
            for(let i = 0; i < nRef; ++i) {
                let ratio = 1.0 * i / nRef;
                let r = parseInt(ratio*255).toString(16);
                let g = parseInt(((1.0 - 0.302)*ratio + 0.302) * 255).toString(16);
                let rHex = (r.length == 1) ? '0' + r : r;
                let gHex = (g.length == 1) ? '0' + g : g;
                let bHex = rHex;
                let color = rHex + gHex + bHex;
                let strokecolor = "#" + color;

                let idRect = me.pre + "afmap_" + i;

                ic.hex2id[color] = idRect;
                if(ratio > threshold) {
                    ic.hex2skip[color] = idRect;
                }
                
                //html += "<g id='" + id + "'>";
//                html += "<rect id='" + idRect + "' x='0' y='0' width='" + rectSize + "' height='" + rectSize + "' fill='" 
//                    + strokecolor + "' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
                //html += "</g>"
            }
//            html += "</defs>";
        }

        html += ic.lineGraphCls.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0, bContactMap, undefined, undefined, bAfMap);
        graphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
        html += "</svg>";

        graphStr += '}\n';
        if(bAfMap) {
            ic.alignerrormapStr = graphStr;
            $("#" + ic.pre + "alignerrormapDiv").html(html);
  
            let scale = $("#" + me.alignerrormapid + "_scale").val();
            $("#" + me.alignerrormapid).attr("width",(ic.alignerrormapWidth * parseFloat(scale)).toString() + "px");
        }
        else {
            ic.contactmapStr = graphStr;
            $("#" + ic.pre + "contactmapDiv").html(html);
        }

        return html;
    }
}

export {ContactMap}

