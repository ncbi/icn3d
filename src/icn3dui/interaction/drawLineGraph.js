/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.drawLineGraph = function(lineGraphStr, bScatterplot) {
    var me = this,
        ic = me.icn3d;
    "use strict";
    var html, graph = JSON.parse(lineGraphStr);
    var linkArray = [],
        nodeArray1 = [],
        nodeArray2 = [];
    var name2node = {};
    for (var i = 0, il = graph.nodes.length; i < il; ++i) {
        var node = graph.nodes[i];
        name2node[node.id] = node;
    }
    // only get interaction links
    var nameHash = {};
    for (var i = 0, il = graph.links.length; i < il; ++i) {
        var link = graph.links[i];
        if (link.v == me.hbondValue || link.v == me.ionicValue || link.v == me.halogenValue ||
            link.v == me.picationValue || link.v == me.pistackingValue || link.v == me.contactValue) {
            linkArray.push(link);
            nameHash[link.source] = 1;
            nameHash[link.target] = 1;
        }
    }
    var nodeArrays = me.getNodeTopBottom(nameHash, name2node);
    nodeArray1 = nodeArrays.nodeArray1;
    nodeArray2 = nodeArrays.nodeArray2;
    me.lineGraphStr = '{\n';
    if (Object.keys(ic.structures).length > 1) {
        var nodeArray1a = [],
            nodeArray1b = [],
            nodeArray2a = [],
            nodeArray2b = [],
            nodeArray3a = [],
            nodeArray3b = [];
        var nodeArray1aTmp = [],
            nodeArray1bTmp = [],
            nodeArray2aTmp = [],
            nodeArray2bTmp = [];
        var struc1 = Object.keys(ic.structures)[0],
            struc2 = Object.keys(ic.structures)[1];
        var linkArrayA = [],
            linkArrayB = [],
            linkArrayAB = [];
        var nameHashA = {},
            nameHashB = {},
            nameHashAB = {};
        for (var i = 0, il = linkArray.length; i < il; ++i) {
            var link = linkArray[i];
            var nodeA = name2node[link.source];
            var nodeB = name2node[link.target];
            //var idArrayA = nodeA.r.split('_'); // 1_1_1KQ2_A_1
            var idArrayA = [];
            idArrayA.push('');
            idArrayA.push('');

            var tmpStr = nodeA.r.substr(4);
            idArrayA = idArrayA.concat(me.getIdArray(tmpStr));

            //var idArrayB = nodeB.r.split('_'); // 1_1_1KQ2_A_1
            var idArrayB = [];
            idArrayB.push('');
            idArrayB.push('');

            tmpStr = nodeB.r.substr(4);
            idArrayB = idArrayB.concat(me.getIdArray(tmpStr));

            if (idArrayA[2] == struc1 && idArrayB[2] == struc1) {
                linkArrayA.push(link);
                nameHashA[link.source] = 1;
                nameHashA[link.target] = 1;
            } else if (idArrayA[2] == struc2 && idArrayB[2] == struc2) {
                linkArrayB.push(link);
                nameHashB[link.source] = 1;
                nameHashB[link.target] = 1;
            } else {
                linkArrayAB.push(link);
                nameHashAB[link.source] = 1;
                nameHashAB[link.target] = 1;
            }
        }
        var nodeArraysA = me.getNodeTopBottom(nameHashA, name2node);
        nodeArray1a = nodeArraysA.nodeArray1;
        nodeArray1b = nodeArraysA.nodeArray2;
        var nodeArraysB = me.getNodeTopBottom(nameHashB, name2node);
        nodeArray2a = nodeArraysB.nodeArray1;
        nodeArray2b = nodeArraysB.nodeArray2;
        var nodeArraysAB = me.getNodeTopBottom(nameHashAB, name2node, true);
        nodeArray3a = nodeArraysAB.nodeArray1;
        nodeArray3b = nodeArraysAB.nodeArray2;
        var len1a = nodeArray1a.length,
            len1b = nodeArray1b.length;
        var len2a = nodeArray2a.length,
            len2b = nodeArray2b.length;
        var len3a = nodeArray3a.length,
            len3b = nodeArray3b.length;
        var maxLen = Math.max(len1a, len1b, len2a, len2b, len3a, len3b);
        var strucArray = [];
        if (linkArrayA.length > 0) strucArray.push(struc1);
        if (linkArrayB.length > 0) strucArray.push(struc2);
        if (linkArrayAB.length > 0) strucArray.push(struc1 + '_' + struc2);
        var factor = 1;
        var r = 3 * factor;
        var gap = 7 * factor;
        var height, width, heightAll;
        var marginX = 10,
            marginY = 10,
            legendWidth = 30;
        if (bScatterplot) {
            heightAll = (len1a + 2 + len2a + 2) * (r + gap) + 4 * marginY + 2 * legendWidth;
            width = (Math.max(len1b, len2b) + 2) * (r + gap) + 2 * marginX + legendWidth;
        } else {
            height = 110;
            heightAll = height * strucArray.length;
            width = maxLen * (r + gap) + 2 * marginX;
        }
        var id, graphWidth;
        if (bScatterplot) {
            me.scatterplotWidth = 2 * width;
            graphWidth = me.scatterplotWidth;
            id = me.scatterplotid;
        } else {
            me.linegraphWidth = 2 * width;
            graphWidth = me.linegraphWidth;
            id = me.linegraphid;
        }
        html = (strucArray.length == 0) ? "No interactions found for each structure<br><br>" :
            "2D integration graph for structure(s) <b>" + strucArray + "</b><br><br>";
        html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
        var heightFinal = 0;
        if (linkArrayA.length > 0) {
            if (bScatterplot) {
                heightFinal -= 15;
                html += me.drawScatterplot_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
                heightFinal = 15;
                height = (len1a + 1) * (r + gap) + 2 * marginY;
            } else {
                html += me.drawLineGraph_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
            }
            heightFinal += height;
            me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1a, nodeArray1b, linkArrayA);
        }
        if (linkArrayB.length > 0) {
            if (bScatterplot) {
                html += me.drawScatterplot_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
                height = (len2a + 1) * (r + gap) + 2 * marginY;
            } else {
                html += me.drawLineGraph_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
            }
            heightFinal += height;
            if (linkArrayA.length > 0) me.lineGraphStr += ', \n';
            me.lineGraphStr += me.updateGraphJson(struc2, 2, nodeArray2a, nodeArray2b, linkArrayB);
        }
        if (linkArrayAB.length > 0 && !bScatterplot) {
            html += me.drawLineGraph_base(nodeArray3a, nodeArray3b, linkArrayAB, name2node, heightFinal);
            if (linkArrayA.length > 0 || linkArrayB.length > 0) me.lineGraphStr += ', \n';
            me.lineGraphStr += '"structure1_2": {"id1": "' + struc1 + '", "id2": "' + struc2 + '", "nodes1":[';
            me.lineGraphStr += me.getJSONFromArray(nodeArray3a);
            me.lineGraphStr += '], \n"nodes2":[';
            me.lineGraphStr += me.getJSONFromArray(nodeArray3b);
            me.lineGraphStr += '], \n"links":[';
            me.lineGraphStr += me.getJSONFromArray(linkArrayAB);
            me.lineGraphStr += ']}';
        }
        html += "</svg>";
    } else {
        if (!bScatterplot) {
            var struc1 = Object.keys(ic.structures)[0];
            var len1 = nodeArray1.length,
                len2 = nodeArray2.length;
            var factor = 1;
            var r = 3 * factor;
            var gap = 7 * factor;
            var height = 110;
            var margin = 10;
            var width = (len1 > len2) ? len1 * (r + gap) + 2 * margin : len2 * (r + gap) + 2 * margin;
            me.linegraphWidth = 2 * width;
            html = (linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
            html += "<svg id='" + me.linegraphid + "' viewBox='0,0," + width + "," + height + "' width='" + me.linegraphWidth + "px'>";
            html += me.drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
            me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
            html += "</svg>";
        } else {
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
            heightAll = (len1 + 2) * (r + gap) + 2 * marginY + legendWidth;
            width = (len2 + 2) * (r + gap) + 2 * marginX + legendWidth;

            var id, graphWidth;
            me.scatterplotWidth = 2 * width;
            graphWidth = me.scatterplotWidth;
            id = me.scatterplotid;
            html = (linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
            html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
            html += me.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
            me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
            html += "</svg>";
        }
    }
    me.lineGraphStr += '}\n';
    me.scatterplotStr = me.lineGraphStr;
    if (bScatterplot) {
        $("#" + me.pre + "scatterplotDiv").html(html);
    } else {
        $("#" + me.pre + "linegraphDiv").html(html);
    }
    return html;
};

iCn3DUI.prototype.drawLineGraph_base = function(nodeArray1, nodeArray2, linkArray, name2node, height) {
    var me = this,
        ic = me.icn3d;
    "use strict";
    var html = '';
    var len1 = nodeArray1.length,
        len2 = nodeArray2.length;
    var factor = 1;
    var r = 3 * factor;
    var gap = 7 * factor;
    var margin = 10;
    // draw nodes
    var margin1, margin2;
    if (len1 > len2) {
        margin1 = margin;
        margin2 = Math.abs(len1 - len2) * (r + gap) * 0.5 + margin;
    } else {
        margin2 = margin;
        margin1 = Math.abs(len1 - len2) * (r + gap) * 0.5 + margin;
    }
    var h1 = 30 + height,
        h2 = 80 + height;
    var nodeHtml = '';
    var node2posSet1 = {},
        node2posSet2 = {};
    for (var i = 0; i < len1; ++i) {
        nodeHtml += me.drawResNode(nodeArray1[i], i, r, gap, margin1, h1, 'a');
        node2posSet1[nodeArray1[i].id] = { x: margin1 + i * (r + gap), y: h1 };
    }
    for (var i = 0; i < len2; ++i) {
        nodeHtml += me.drawResNode(nodeArray2[i], i, r, gap, margin2, h2, 'b');
        node2posSet2[nodeArray2[i].id] = { x: margin2 + i * (r + gap), y: h2 };
    }
    // draw lines
    for (var i = 0, il = linkArray.length; i < il; ++i) {
        var link = linkArray[i];
        var node1 = name2node[link.source];
        var node2 = name2node[link.target];
        var resid1 = node1.r.substr(4);
        var resid2 = node2.r.substr(4);
        var pos1 = node2posSet1[node1.id];
        var pos2 = node2posSet2[node2.id];
        if (pos1 === undefined || pos2 === undefined) continue;
        var linestrokewidth;
        if (link.v == me.contactValue) {
            linestrokewidth = 1;
        } else {
            linestrokewidth = 2;
        }
        var strokecolor;
        if (link.v == me.hbondValue) {
            strokecolor = "#" + me.hbondColor;
        } else if (link.v == me.ionicValue) {
            strokecolor = "#" + me.ionicColor;
        } else if (link.v == me.halogenValue) {
            strokecolor = "#" + me.halogenColor;
        } else if (link.v == me.picationValue) {
            strokecolor = "#" + me.picationColor;
        } else if (link.v == me.pistackingValue) {
            strokecolor = "#" + me.pistackingColor;
        } else if (link.v == me.contactValue) {
            strokecolor = "#" + me.contactColor;
        }
        html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
        html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
        html += "<line x1='" + pos1.x + "' y1='" + pos1.y + "' x2='" + pos2.x + "' y2='" + pos2.y + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
    }
    // show nodes later
    html += nodeHtml;
    return html;
};

iCn3DUI.prototype.drawScatterplot_base = function(nodeArray1, nodeArray2, linkArray, name2node, height) {
    var me = this,
        ic = me.icn3d;
    "use strict";
    var html = '';
    var len1 = nodeArray1.length,
        len2 = nodeArray2.length;
    var factor = 1;
    var r = 3 * factor;
    var gap = 7 * factor;
    var legendWidth = 30;
    var marginX = 10,
        marginY = 20;
    var heightTotal = (len1 + 1) * (r + gap) + legendWidth + 2 * marginY;
    var margin1 = height + heightTotal - (legendWidth + marginY + (r + gap)); // y-axis
    var margin2 = legendWidth + marginX + (r + gap); // x-axis
    var x = legendWidth + marginX;
    var nodeHtml = '';
    var node2posSet1 = {},
        node2posSet2 = {};
    for (var i = 0; i < len1; ++i) {
        nodeHtml += me.drawResNode(nodeArray1[i], i, r, gap, margin1, x, 'a', true);
        node2posSet1[nodeArray1[i].id] = { x: x, y: margin1 - i * (r + gap) };
    }
    var y = height + heightTotal - (legendWidth + marginY);
    for (var i = 0; i < len2; ++i) {
        nodeHtml += me.drawResNode(nodeArray2[i], i, r, gap, margin2, y, 'b');
        node2posSet2[nodeArray2[i].id] = { x: margin2 + i * (r + gap), y: y };
    }
    // draw rect
    var rectSize = 1.5 * r;
    var halfSize = 0.5 * rectSize;
    for (var i = 0, il = linkArray.length; i < il; ++i) {
        var link = linkArray[i];
        var node1 = name2node[link.source];
        var node2 = name2node[link.target];
        var resid1 = node1.r.substr(4);
        var resid2 = node2.r.substr(4);
        var pos1 = node2posSet1[node1.id];
        var pos2 = node2posSet2[node2.id];
        if (pos1 === undefined || pos2 === undefined) continue;
        var strokecolor;
        if (link.v == me.hbondValue) {
            strokecolor = "#" + me.hbondColor;
        } else if (link.v == me.ionicValue) {
            strokecolor = "#" + me.ionicColor;
        } else if (link.v == me.halogenValue) {
            strokecolor = "#" + me.halogenColor;
        } else if (link.v == me.picationValue) {
            strokecolor = "#" + me.picationColor;
        } else if (link.v == me.pistackingValue) {
            strokecolor = "#" + me.pistackingColor;
        } else if (link.v == me.contactValue) {
            strokecolor = "#" + me.contactColor;
        }
        var linestrokewidth;
        if (link.v == me.contactValue) {
            linestrokewidth = 1;
        } else {
            linestrokewidth = 2;
        }
        html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
        html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
        html += "<rect x='" + (pos2.x - halfSize).toString() + "' y='" + (pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' fill-opacity='0.6' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
        html += "</g>";
    }
    // show nodes later
    html += nodeHtml;
    return html;
};

iCn3DUI.prototype.copyStylesInline = function(destinationNode, sourceNode) {
    var me = this,
        ic = me.icn3d;
    "use strict";
    var containerElements = ["svg", "g"];
    for (var cd = 0; cd < destinationNode.childNodes.length; cd++) {
        var child = destinationNode.childNodes[cd];
        if (containerElements.indexOf(child.tagName) != -1) {
            me.copyStylesInline(child, sourceNode.childNodes[cd]);
            continue;
        }
        var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
        if (style == "undefined" || style == null) continue;
        for (var st = 0; st < style.length; st++) {
            child.style.setProperty(style[st], style.getPropertyValue(style[st]));
        }
    }
};