/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {GetGraph} from '../interaction/getGraph.js';

class LineGraph {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    drawLineGraph(lineGraphStr, bScatterplot) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html, graph = JSON.parse(lineGraphStr);
        let  linkArray = [],
            nodeArray1 = [],
            nodeArray2 = [];
        let  name2node = {}
        for(let i = 0, il = graph.nodes.length; i < il; ++i) {
            let  node = graph.nodes[i];
            name2node[node.id] = node;
        }
        // only get interaction links
        let  nameHash = {}
        for(let i = 0, il = graph.links.length; i < il; ++i) {
            let  link = graph.links[i];
            if(link.v == ic.icn3dui.htmlCls.hbondValue || link.v == ic.icn3dui.htmlCls.ionicValue || link.v == ic.icn3dui.htmlCls.halogenValue ||
                link.v == ic.icn3dui.htmlCls.picationValue || link.v == ic.icn3dui.htmlCls.pistackingValue || link.v == ic.icn3dui.htmlCls.contactValue) {
                linkArray.push(link);
                nameHash[link.source] = 1;
                nameHash[link.target] = 1;
            }
        }
        let  nodeArrays = ic.getGraphCls.getNodeTopBottom(nameHash, name2node);
        nodeArray1 = nodeArrays.nodeArray1;
        nodeArray2 = nodeArrays.nodeArray2;
        ic.lineGraphStr = '{\n';
        if(Object.keys(ic.structures).length > 1) {
            let  nodeArray1a = [],
                nodeArray1b = [],
                nodeArray2a = [],
                nodeArray2b = [],
                nodeArray3a = [],
                nodeArray3b = [];
            let  nodeArray1aTmp = [],
                nodeArray1bTmp = [],
                nodeArray2aTmp = [],
                nodeArray2bTmp = [];
            let  struc1 = Object.keys(ic.structures)[0],
                struc2 = Object.keys(ic.structures)[1];
            let  linkArrayA = [],
                linkArrayB = [],
                linkArrayAB = [];
            let  nameHashA = {},
                nameHashB = {},
                nameHashAB = {}
            for(let i = 0, il = linkArray.length; i < il; ++i) {
                let  link = linkArray[i];
                let  nodeA = name2node[link.source];
                let  nodeB = name2node[link.target];

                if(!nodeA || !nodeB || !nodeA.r || !nodeB.r) {
                    continue;
                }

                //var idArrayA = nodeA.r.split('_'); // 1_1_1KQ2_A_1
                let  idArrayA = [];
                idArrayA.push('');
                idArrayA.push('');

                let  tmpStr = nodeA.r.substr(4);
                idArrayA = idArrayA.concat(me.utilsCls.getIdArray(tmpStr));

                //var idArrayB = nodeB.r.split('_'); // 1_1_1KQ2_A_1
                let  idArrayB = [];
                idArrayB.push('');
                idArrayB.push('');

                tmpStr = nodeB.r.substr(4);
                idArrayB = idArrayB.concat(me.utilsCls.getIdArray(tmpStr));

                if(idArrayA[2] == struc1 && idArrayB[2] == struc1) {
                    linkArrayA.push(link);
                    nameHashA[link.source] = 1;
                    nameHashA[link.target] = 1;
                } else if(idArrayA[2] == struc2 && idArrayB[2] == struc2) {
                    linkArrayB.push(link);
                    nameHashB[link.source] = 1;
                    nameHashB[link.target] = 1;
                } else {
                    linkArrayAB.push(link);
                    nameHashAB[link.source] = 1;
                    nameHashAB[link.target] = 1;
                }
            }
            let  nodeArraysA = ic.getGraphCls.getNodeTopBottom(nameHashA, name2node);
            nodeArray1a = nodeArraysA.nodeArray1;
            nodeArray1b = nodeArraysA.nodeArray2;
            let  nodeArraysB = ic.getGraphCls.getNodeTopBottom(nameHashB, name2node);
            nodeArray2a = nodeArraysB.nodeArray1;
            nodeArray2b = nodeArraysB.nodeArray2;
            let  nodeArraysAB = ic.getGraphCls.getNodeTopBottom(nameHashAB, name2node, true);
            nodeArray3a = nodeArraysAB.nodeArray1;
            nodeArray3b = nodeArraysAB.nodeArray2;
            let  len1a = nodeArray1a.length,
                len1b = nodeArray1b.length;
            let  len2a = nodeArray2a.length,
                len2b = nodeArray2b.length;
            let  len3a = nodeArray3a.length,
                len3b = nodeArray3b.length;
            let  maxLen = Math.max(len1a, len1b, len2a, len2b, len3a, len3b);
            let  strucArray = [];
            if(linkArrayA.length > 0) strucArray.push(struc1);
            if(linkArrayB.length > 0) strucArray.push(struc2);
            if(linkArrayAB.length > 0) strucArray.push(struc1 + '_' + struc2);
            let  factor = 1;
            let  r = 3 * factor;
            let  gap = 7 * factor;
            let  height, width, heightAll;
            let  marginX = 10,
                marginY = 10,
                legendWidth = 30;
            if(bScatterplot) {
                heightAll =(len1a + 2 + len2a + 2) *(r + gap) + 4 * marginY + 2 * legendWidth;
                width =(Math.max(len1b, len2b) + 2) *(r + gap) + 2 * marginX + legendWidth;
            } else {
                height = 110;
                heightAll = height * strucArray.length;
                width = maxLen *(r + gap) + 2 * marginX;
            }
            let  id, graphWidth;
            if(bScatterplot) {
                ic.scatterplotWidth = 2 * width;
                graphWidth = ic.scatterplotWidth;
                id = me.scatterplotid;
            } else {
                ic.linegraphWidth = 2 * width;
                graphWidth = ic.linegraphWidth;
                id = me.linegraphid;
            }
            html =(strucArray.length == 0) ? "No interactions found for each structure<br><br>" :
                "2D integration graph for structure(s) <b>" + strucArray + "</b><br><br>";
            html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
            let  heightFinal = 0;
            if(linkArrayA.length > 0) {
                if(bScatterplot) {
                    heightFinal -= 15;
                    html += this.drawScatterplot_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
                    heightFinal = 15;
                    height =(len1a + 1) *(r + gap) + 2 * marginY;
                } else {
                    html += this.drawLineGraph_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
                }
                heightFinal += height;
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1a, nodeArray1b, linkArrayA);
            }
            if(linkArrayB.length > 0) {
                if(bScatterplot) {
                    html += this.drawScatterplot_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
                    height =(len2a + 1) *(r + gap) + 2 * marginY;
                } else {
                    html += this.drawLineGraph_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
                }
                heightFinal += height;
                if(linkArrayA.length > 0) ic.lineGraphStr += ', \n';
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc2, 2, nodeArray2a, nodeArray2b, linkArrayB);
            }
            if(linkArrayAB.length > 0 && !bScatterplot) {
                html += this.drawLineGraph_base(nodeArray3a, nodeArray3b, linkArrayAB, name2node, heightFinal);
                if(linkArrayA.length > 0 || linkArrayB.length > 0) ic.lineGraphStr += ', \n';
                ic.lineGraphStr += '"structure1_2": {"id1": "' + struc1 + '", "id2": "' + struc2 + '", "nodes1":[';
                ic.lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray3a);
                ic.lineGraphStr += '], \n"nodes2":[';
                ic.lineGraphStr += me.utilsCls.getJSONFromArray(nodeArray3b);
                ic.lineGraphStr += '], \n"links":[';
                ic.lineGraphStr += me.utilsCls.getJSONFromArray(linkArrayAB);
                ic.lineGraphStr += ']}';
            }
            html += "</svg>";
        } else {
            if(!bScatterplot) {
                let  struc1 = Object.keys(ic.structures)[0];
                let  len1 = nodeArray1.length,
                    len2 = nodeArray2.length;
                let  factor = 1;
                let  r = 3 * factor;
                let  gap = 7 * factor;
                let  height = 110;
                let  margin = 10;
                let  width =(len1 > len2) ? len1 *(r + gap) + 2 * margin : len2 *(r + gap) + 2 * margin;
                ic.linegraphWidth = 2 * width;
                html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + me.linegraphid + "' viewBox='0,0," + width + "," + height + "' width='" + ic.linegraphWidth + "px'>";
                html += this.drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            } else {
                let  struc1 = Object.keys(ic.structures)[0];
                let  len1 = nodeArray1.length,
                    len2 = nodeArray2.length;
                let  factor = 1;
                let  r = 3 * factor;
                let  gap = 7 * factor;
                let  height, width, heightAll;
                let  marginX = 10,
                    marginY = 10,
                    legendWidth = 30;
                heightAll =(len1 + 2) *(r + gap) + 2 * marginY + legendWidth;
                width =(len2 + 2) *(r + gap) + 2 * marginX + legendWidth;

                let  id, graphWidth;
                ic.scatterplotWidth = 2 * width;
                graphWidth = ic.scatterplotWidth;
                id = me.scatterplotid;
                html =(linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
                html += this.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                ic.lineGraphStr += ic.getGraphCls.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            }
        }
        ic.lineGraphStr += '}\n';
        ic.scatterplotStr = ic.lineGraphStr;
        if(bScatterplot) {
            $("#" + ic.pre + "scatterplotDiv").html(html);
        } else {
            $("#" + ic.pre + "linegraphDiv").html(html);
        }
        return html;
    }

    drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, height) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html = '';
        let  len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        let  factor = 1;
        let  r = 3 * factor;
        let  gap = 7 * factor;
        let  margin = 10;
        // draw nodes
        let  margin1, margin2;
        if(len1 > len2) {
            margin1 = margin;
            margin2 = Math.abs(len1 - len2) *(r + gap) * 0.5 + margin;
        } else {
            margin2 = margin;
            margin1 = Math.abs(len1 - len2) *(r + gap) * 0.5 + margin;
        }
        let  h1 = 30 + height,
            h2 = 80 + height;
        let  nodeHtml = '';
        let  node2posSet1 = {},
            node2posSet2 = {}
        for(let i = 0; i < len1; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray1[i], i, r, gap, margin1, h1, 'a');
            node2posSet1[nodeArray1[i].id] = { x: margin1 + i *(r + gap), y: h1 }
        }
        for(let i = 0; i < len2; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray2[i], i, r, gap, margin2, h2, 'b');
            node2posSet2[nodeArray2[i].id] = { x: margin2 + i *(r + gap), y: h2 }
        }
        // draw lines
        for(let i = 0, il = linkArray.length; i < il; ++i) {
            let  link = linkArray[i];
            let  node1 = name2node[link.source];
            let  node2 = name2node[link.target];

            if(node1 === undefined || node2 === undefined) continue;

            let  resid1 = node1.r.substr(4);
            let  resid2 = node2.r.substr(4);
            let  pos1 = node2posSet1[node1.id];
            let  pos2 = node2posSet2[node2.id];
            if(pos1 === undefined || pos2 === undefined) continue;
            let  linestrokewidth;
            if(link.v == ic.icn3dui.htmlCls.contactValue) {
                linestrokewidth = 1;
            } else {
                linestrokewidth = 2;
            }
            let  strokecolor;
            if(link.v == ic.icn3dui.htmlCls.hbondValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.hbondColor;
            } else if(link.v == ic.icn3dui.htmlCls.ionicValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.ionicColor;
            } else if(link.v == ic.icn3dui.htmlCls.halogenValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.halogenColor;
            } else if(link.v == ic.icn3dui.htmlCls.picationValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.picationColor;
            } else if(link.v == ic.icn3dui.htmlCls.pistackingValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.pistackingColor;
            } else if(link.v == ic.icn3dui.htmlCls.contactValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.contactColor;
            }
            html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
            html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
            html += "<line x1='" + pos1.x + "' y1='" + pos1.y + "' x2='" + pos2.x + "' y2='" + pos2.y + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        }
        // show nodes later
        html += nodeHtml;
        return html;
    }

    drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, height, bContactMap) { let  ic = this.icn3d, me = ic.icn3dui;
        let  html = '';
        let  len1 = nodeArray1.length,
            len2 = nodeArray2.length;
        let  factor = 1;
        let  r = 3 * factor;
        let  gap = (bContactMap) ? r : 7 * factor;
        let  legendWidth = 30;
        let  marginX = 10,
            marginY = 20;
        let  heightTotal =(len1 + 1) *(r + gap) + legendWidth + 2 * marginY;
        let  margin1 = height + heightTotal -(legendWidth + marginY +(r + gap)); // y-axis
        let  margin2 = legendWidth + marginX +(r + gap); // x-axis
        let  x = legendWidth + marginX;
        let  nodeHtml = '';
        let  node2posSet1 = {},
            node2posSet2 = {}
        for(let i = 0; i < len1; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray1[i], i, r, gap, margin1, x, 'a', true);
            node2posSet1[nodeArray1[i].id] = { x: x, y: margin1 - i *(r + gap) }
        }
        let  y = height + heightTotal -(legendWidth + marginY);
        for(let i = 0; i < len2; ++i) {
            nodeHtml += ic.getGraphCls.drawResNode(nodeArray2[i], i, r, gap, margin2, y, 'b', false, bContactMap);
            node2posSet2[nodeArray2[i].id] = { x: margin2 + i *(r + gap), y: y }
        }
        // draw rect
        let  rectSize = (bContactMap) ? 2 * r : 1.5 * r;
        let  halfSize = 0.5 * rectSize;
        for(let i = 0, il = linkArray.length; i < il; ++i) {
            let  link = linkArray[i];
            let  node1 = name2node[link.source];
            let  node2 = name2node[link.target];
            let  resid1 = node1.r.substr(4);
            let  resid2 = node2.r.substr(4);
            let  pos1 = node2posSet1[node1.id];
            let  pos2 = node2posSet2[node2.id];
            if(pos1 === undefined || pos2 === undefined) continue;
            let  strokecolor;
            if(link.v == ic.icn3dui.htmlCls.hbondValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.hbondColor;
            } else if(link.v == ic.icn3dui.htmlCls.ionicValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.ionicColor;
            } else if(link.v == ic.icn3dui.htmlCls.halogenValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.halogenColor;
            } else if(link.v == ic.icn3dui.htmlCls.picationValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.picationColor;
            } else if(link.v == ic.icn3dui.htmlCls.pistackingValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.pistackingColor;
            } else if(link.v == ic.icn3dui.htmlCls.contactValue) {
                strokecolor = "#" + ic.icn3dui.htmlCls.contactColor;
            }
            let  linestrokewidth;
            if(link.v == ic.icn3dui.htmlCls.contactValue) {
                linestrokewidth = 1;
            } else {
                linestrokewidth = 2;
            }
            html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
            html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
            if(bContactMap) {
                html += "<rect x='" +(pos2.x - halfSize).toString() + "' y='" +(pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
            }
            else {
                html += "<rect x='" +(pos2.x - halfSize).toString() + "' y='" +(pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' fill-opacity='0.6' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
            }
            html += "</g>";
        }
        // show nodes later
        html += nodeHtml;
        return html;
    }

    copyStylesInline(destinationNode, sourceNode) { let  ic = this.icn3d, me = ic.icn3dui;
        let  containerElements = ["svg", "g"];
        for(let cd = 0; cd < destinationNode.childNodes.length; cd++) {
            let  child = destinationNode.childNodes[cd];
            if(containerElements.indexOf(child.tagName) != -1) {
                this.copyStylesInline(child, sourceNode.childNodes[cd]);
                continue;
            }
            let  style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
            if(style == "undefined" || style == null) continue;
            for(let st = 0; st < style.length; st++) {
                child.style.setProperty(style[st], style.getPropertyValue(style[st]));
            }
        }
    }
}

export {LineGraph}
