/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

class DrawGraph {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    drawGraph(jsonStr, divid) { let ic = this.icn3d, me = ic.icn3dui;
        //function createV4SelectableForceDirectedGraph(svg, graph) {
        // if both d3v3 and d3v4 are loaded, we'll assume
        // that d3v4 is called d3v4, otherwise we'll assume
        // that d3v4 is the default (d3)
        //if (typeof d3v4 == 'undefined') {
            let d3v4 = d3;
        //}

        //if(ic.bRender !== true) return;

        let graph = JSON.parse(jsonStr);

        //var width = +svg.attr("width"),
        //    height = +svg.attr("height");

        let width = $("#" + divid).width();
        let height = $("#" + divid).height();

        let widthView = (!isNaN(width)) ? width * 1.0 : 300;
        let heightView = (!isNaN(height)) ? height * 1.0 : 300;

        let parentWidth = width;
        let parentHeight = height;

        //    let svg = d3v4.select('svg')
        //    .attr('width', parentWidth)
        //    .attr('height', parentHeight)

        let svg = d3.select("#" + me.svgid)
            .attr("xmlns:xl", "http://www.w3.org/1999/xlink")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:dc", "http://purl.org/dc/elements/1.1/")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0,0," + widthView + "," + heightView);

        svg.selectAll('.g-main').remove();
        // added
        //$("#" + ic.icn3dui.svgid).empty();

        let gMain = svg.append('g')
            .classed('g-main', true);

        let rect = gMain.append('rect')
            .attr('width', parentWidth)
            .attr('height', parentHeight)
            .style('fill', '#FFF')

        let gDraw = gMain.append('g');

        let zoom = d3v4.zoom()
            .on('zoom', zoomed)

        gMain.call(zoom);


        function zoomed() {
            gDraw.attr('transform', d3v4.event.transform);
        }

        //var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

        if (!(graph.links)) {
            console.log("Graph is missing links");
            return;
        }

        // clean graph.links
        let linkArray = [];

        let nodeHash = {};
        for (let i = 0, il = graph.nodes.length; i < il; ++i) {
            let node = graph.nodes[i];
            nodeHash[node.id] = 1;
        }

        let bError = false;
        for (let i = 0, il = graph.links.length; i < il; ++i) {
            let link = graph.links[i];

            if (nodeHash.hasOwnProperty(link.source) && nodeHash.hasOwnProperty(link.target)) {
                linkArray.push(link);
            } else {
                if (!nodeHash.hasOwnProperty(link.source)) {
                    console.log("The node " + link.source + " is not found... ");
                }
                if (!nodeHash.hasOwnProperty(link.target)) {
                    console.log("The node " + link.target + " is not found... ");
                }

                bError = true;
            }
        }

        if (bError) console.log(JSON.stringify(graph));

        graph.links = linkArray;

        let nodes = {};
        let i;

        for (i = 0; i < graph.nodes.length; i++) {
            // enlarge the distance when no force
            if (!me.htmlCls.force) {
                graph.nodes[i].x *= 10;
                graph.nodes[i].y *= 10;
            }
            nodes[graph.nodes[i].id] = graph.nodes[i];
            graph.nodes[i].weight = 1.01;
        }

        // remove the internal edges when no force
        if (me.htmlCls.hideedges && !me.htmlCls.force) {
            let links2 = [];
            for (i = 0; i < graph.links.length; i++) {
                if (graph.links[i].c != 'FFF') {
                    links2.push(graph.links[i]);
                }
            }

            graph.links = links2;
        }

        // the brush needs to go before the nodes so that it doesn't
        // get called when the mouse is over a node
        let gBrushHolder = gDraw.append('g');
        let gBrush = null;

        let link = gDraw.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            //.attr("stroke", function(d) { return "#" + d.c; })
            .attr("stroke", function(d) {
                if (d.v == me.htmlCls.contactInsideValue) return "#" + me.htmlCls.contactInsideColor;
                else if (d.v == me.htmlCls.hbondInsideValue) return "#" + me.htmlCls.hbondInsideColor;
                else if (d.v == me.htmlCls.ionicInsideValue) return "#" + me.htmlCls.ionicInsideColor;
                else if (d.v == me.htmlCls.halogenInsideValue) return "#" + me.htmlCls.halogenInsideColor;
                else if (d.v == me.htmlCls.picationInsideValue) return "#" + me.htmlCls.picationInsideColor;
                else if (d.v == me.htmlCls.pistackingInsideValue) return "#" + me.htmlCls.pistackingInsideColor;
                else return "#" + d.c;
            })
            .attr("stroke-width", function(d) {
                if (d.v == me.htmlCls.contactValue || d.v == me.htmlCls.contactInsideValue ||
                    d.v == me.htmlCls.hbondInsideValue || d.v == me.htmlCls.ionicInsideValue ||
                    d.v == me.htmlCls.halogenInsideValue || d.v == me.htmlCls.picationInsideValue ||
                    d.v == me.htmlCls.pistackingInsideValue) return "1px";
                else if (d.v == me.htmlCls.hbondValue || d.v == me.htmlCls.ionicValue ||
                    d.v == me.htmlCls.halogenValue || d.v == me.htmlCls.picationValue ||
                    d.v == me.htmlCls.pistackingValue) return "2px";
                else if (d.v == me.htmlCls.ssbondValue || d.v == me.htmlCls.clbondValue) return "3px";
                //else return d.v + "px";
                else return "2px"; // default width
            });

        let allNodes = gDraw.append("g")
            .attr("class", "node");

        let bCartoon = (graph.level) ? true : false;

        // append gradient
        if(bCartoon) {
            for(let i = 0, il = graph.nodes.length; i < il; ++i) {
              let gradient = "";

              let node = graph.nodes[i];

              let cx = node.x, cy = parentHeight - node.y;
              let rx = node.rx, ry = node.ry;
              let tx = cx + 0.3 * rx, ty = cy - 0.3 * ry;
              let scale = 1.7 * (rx + ry) * 0.5;

/*
              //gradient += "<defs>";
              gradient += "<radialGradient cx='0' cy='0' r='1' id='" + node.id + "_g' gradientUnits='userSpaceOnUse'>";
              gradient += "  <stop offset='0' stop-color='#FFFFFF'/>";
              gradient += "  <stop offset='.5' stop-color='#" + node.c + "'/>";
              gradient += "  <stop offset='1' stop-color='black'/>";
              gradient += "</radialGradient>";
              gradient += "<radialGradient id='" + node.id + "_g_obj' xl:href='#" + node.id
                + "_g' gradientTransform='translate(" + tx.toFixed(0) + " " + ty.toFixed(0)
                + ") scale(" + scale.toFixed(0) + ")'/>";
              //gradient += "</defs>\n";
*/

              gradient += "<linearGradient id='" + node.id + "_g_obj' x1='0%' y1='0%' x2='100%' y2='0%'>";
              gradient += "  <stop offset='0%' style='stop-color:rgb(255,255,255);stop-opacity:1' />";
              gradient += "  <stop offset='100%' style='stop-color:#" + node.c + ";stop-opacity:1' />";
              gradient += "</linearGradient>";

              //allNodes.appendHTML(gradient);
              allNodes.append("defs").html(gradient);
            }
        }

        let scaleFactor = 0.5;

        let node = allNodes.selectAll("ellipse")
            .data(graph.nodes)
            //.attr("cx", function(d){return d.x})
            //.attr("cy", function(d){return d.y})
            .enter().append("ellipse")
            .attr("rx", function(d) { return (bCartoon) ? d.rx * scaleFactor : 3; })
            .attr("ry", function(d) { return (bCartoon) ? d.ry * scaleFactor : 3; })
            .attr("fill", function(d) { return (bCartoon) ? "url(#" + d.id + "_g_obj)" : "#" + d.c; })
            .attr("stroke", function(d) { return (bCartoon) ? "none" : "#" + d.c; })
            .attr("res", function(d) { return d.r; })
            .attr("class", "icn3d-node")
            .call(d3v4.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        let label = allNodes.selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .text(function(d) {
                let idStr = d.id;
                let pos = idStr.indexOf('.');
                if (pos !== -1) idStr = idStr.substr(0, pos);

                if(bCartoon) idStr = idStr.substr(idStr.lastIndexOf('_') + 1);

                return idStr;
            })
            //.style("stroke", function(d) { return "#" + d.c; })
            .attr("fill", function(d) { return (bCartoon) ? "#000" : "#" + d.c; })
            .attr("stroke", "none")
            .attr("class", "icn3d-node-text8");
        //.style("font-size", "8px")
        //.style("font-weight", "bold")
        //.attr("x", function(d){return d.x + 6})
        //.attr("y", function(d){return d.y + 3})

        // add titles for mouseover blurbs
        node.append("title")
            .text(function(d) { return d.id; });

        let dist_ss = parseInt($("#" + ic.pre + "dist_ss").val());
        let dist_coil = parseInt($("#" + ic.pre + "dist_coil").val());
        let dist_hbond = parseInt($("#" + ic.pre + "dist_hbond").val());
        let dist_inter = parseInt($("#" + ic.pre + "dist_inter").val());
        let dist_ssbond = parseInt($("#" + ic.pre + "dist_ssbond").val());
        let dist_ionic = parseInt($("#" + ic.pre + "dist_ionic").val());

        let dist_halogen = parseInt($("#" + ic.pre + "dist_halogen").val());
        let dist_pication = parseInt($("#" + ic.pre + "dist_pication").val());
        let dist_pistacking = parseInt($("#" + ic.pre + "dist_pistacking").val());

        ic.simulation = d3v4.forceSimulation()
            .force("link", d3v4.forceLink()
                .id(function(d) { return d.id; })
                .distance(function(d) {
                    //var dist = 20 / d.value;
                    //return dist;

                    return 30;
                })
                .strength(function(d) {
                    if (!me.htmlCls.force) {
                        return 0;
                    } else {
                        //return 1 / Math.min(count(d.source), count(d.target));

                        // larger distance means more relaxed
                        if (d.v == me.htmlCls.ssValue) { // secondary
                            return !isNaN(dist_ss) ? dist_ss / 100.0 : 1;
                        } else if (d.v == me.htmlCls.coilValue || d.v == me.htmlCls.clbondValue) { // coil
                            return !isNaN(dist_coil) ? dist_coil / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.hbondValue || d.v == me.htmlCls.hbondInsideValue) { // hydrogen bonds
                            return !isNaN(dist_hbond) ? dist_hbond / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.contactValue || d.v == me.htmlCls.contactInsideValue) { // interactions
                            return !isNaN(dist_inter) ? dist_inter / 100.0 : 0.25;
                        } else if (d.v == me.htmlCls.ssbondValue) { // hydrogen bonds
                            return !isNaN(dist_ssbond) ? dist_ssbond / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.ionicValue || d.v == me.htmlCls.ionicInsideValue) { // ionic interaction
                            return !isNaN(dist_ionic) ? dist_ionic / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.halogenValue || d.v == me.htmlCls.halogenInsideValue) {
                            return !isNaN(dist_halogen) ? dist_halogen / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.picationValue || d.v == me.htmlCls.picationInsideValue) {
                            return !isNaN(dist_pication) ? dist_pication / 100.0 : 0.5;
                        } else if (d.v == me.htmlCls.pistackingValue || d.v == me.htmlCls.pistackingInsideValue) {
                            return !isNaN(dist_pistacking) ? dist_pistacking / 100.0 : 0.5;
                        } else {
                            return 0;
                        }
                    } // else
                })
            )
            .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2));

        if (me.htmlCls.force) {
            ic.simulation.force("charge", d3v4.forceManyBody());
        }

        //ic.simulation.force("x", d3v4.forceX(parentWidth/2))
        //    .force("y", d3v4.forceY(parentHeight/2));

        if (me.htmlCls.force == 1) { // x-axis
            ic.simulation.force("x", d3v4.forceX(function(d) {
                    if (d.s == 'a') {
                        return parentWidth / 4;
                    } else {
                        return parentWidth * 0.75;
                    }
                }).strength(function(d) { return 0.4; }))
                .force("y", d3v4.forceY(parentHeight / 2).strength(function(d) { return 0.02; }));

        } else if (me.htmlCls.force == 2) { // y-axis
            ic.simulation.force("y", d3v4.forceY(function(d) {
                    if (d.s == 'a') {
                        return parentHeight * 0.75;
                    } else {
                        return parentHeight / 4;
                    }
                }).strength(function(d) { return 0.4; }))
                .force("x", d3v4.forceX(parentWidth / 2).strength(function(d) { return 0.02; }));
        } else if (me.htmlCls.force == 3) { // circle
            ic.simulation.force("r", d3v4.forceRadial(function(d) {
                if (d.s == 'a') {
                    return 200;
                } else {
                    return 100;
                }

            }, parentWidth / 2, parentHeight / 2).strength(function(d) { return 0.8; }));
        } else if (me.htmlCls.force == 4) { // random
            // do nothing
        }

        ic.simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        ic.simulation.force("link")
            .links(graph.links);

        //    ic.simulation.stop();
        //    ic.simulation.restart();

        function ticked() {
            // update node and line positions at every step of
            // the force ic.simulation
            link.attr("x1", function(d) { let ret = d.source.x; return !isNaN(ret) ? ret : 0; })
                .attr("y1", function(d) { let ret = parentHeight - d.source.y; return !isNaN(ret) ? ret : 0; })
                .attr("x2", function(d) { let ret = d.target.x; return !isNaN(ret) ? ret : 0; })
                .attr("y2", function(d) { let ret = parentHeight - d.target.y; return !isNaN(ret) ? ret : 0; });

            node.attr("cx", function(d) { let ret = d.x.toFixed(0); return !isNaN(ret) ? ret : 0; })
                .attr("cy", function(d) { let ret = (parentHeight - d.y).toFixed(0); return !isNaN(ret) ? ret : 0; })
                .attr("transform", function(d) { return (bCartoon) ? "rotate(" + d.ang + "," + d.x.toFixed(0) + "," + (parentHeight - d.y).toFixed(0) + ")" : ""; })

            label.attr("x", function(d) { let ret = (bCartoon) ? d.x : d.x + 6; return !isNaN(ret) ? ret : 0; })
                .attr("y", function(d) { let ret = (bCartoon) ?  parentHeight - d.y : parentHeight - (d.y + 3); return !isNaN(ret) ? ret : 0; });

        }

        let brushMode = false;
        let brushing = false;

        let brush = d3v4.brush()
            .on("start", brushstarted)
            .on("brush", brushed)
            .on("end", brushended);

        function brushstarted() {
            // keep track of whether we're actively brushing so that we
            // don't remove the brush on keyup in the middle of a selection
            brushing = true;

            node.each(function(d) {
                d.previouslySelected = ctrlKey && d.selected;
            });
        }

        rect.on('click', function() {
            node.each(function(d) {
                d.selected = false;
                d.previouslySelected = false;
            });
            node.classed("selected", false);
        });

        function brushed() {
            if (!d3v4.event.sourceEvent) return;
            if (!d3v4.event.selection) return;

            let extent = d3v4.event.selection;

            node.classed("selected", function(d) {
                return d.selected = d.previouslySelected ^
                    (extent[0][0] <= d.x && d.x < extent[1][0] &&
                        extent[0][1] <= parentHeight - d.y && parentHeight - d.y < extent[1][1]);
            });
        }

        function brushended() {
            if (!d3v4.event.sourceEvent) return;
            if (!d3v4.event.selection) return;
            if (!gBrush) return;

            gBrush.call(brush.move, null);

            if (!brushMode) {
                // the shift key has been release before we ended our brushing
                gBrush.remove();
                gBrush = null;
            }

            brushing = false;
        }

        d3v4.select('body').on('keydown', keydown);
        d3v4.select('body').on('keyup', keyup);

        let ctrlKey;

        function keydown() {
            ctrlKey = d3v4.event.ctrlKey;

            if (ctrlKey) {
                // if we already have a brush, don't do anything
                if (gBrush)
                    return;

                brushMode = true;

                if (!gBrush) {
                    gBrush = gBrushHolder.append('g');
                    gBrush.call(brush);
                }
            }
        }

        function keyup() {
            ctrlKey = false;
            brushMode = false;

            if (!gBrush)
                return;

            if (!brushing) {
                // only remove the brush if we're not actively brushing
                // otherwise it'll be removed when the brushing ends
                gBrush.remove();
                gBrush = null;
            }
        }

        function dragstarted(d) {
            if (!d3v4.event.active) ic.simulation.alphaTarget(0.9).restart();

            if (!d.selected && !ctrlKey) {
                // if this node isn't selected, then we have to unselect every other node
                node.classed("selected", function(p) {
                    return p.selected = p.previouslySelected = false;
                });
            }

            d3v4.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; return d.selected = true; });

            node.filter(function(d) { return d.selected; })
                .each(function(d) { //d.fixed |= 2;
                    d.fx = d.x;
                    d.fy = d.y;
                })

        }

        function dragged(d) {
            //d.fx = d3v4.event.x;
            //d.fy = d3v4.event.y;
            node.filter(function(d) { return d.selected; })
                .each(function(d) {
                    d.fx += d3v4.event.dx;
                    d.fy -= d3v4.event.dy; // += d3v4.event.dy;
                })
        }

        function dragended(d) {
            if (!d3v4.event.active) ic.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            node.filter(function(d) { return d.selected; })
                .each(function(d) { //d.fixed &= ~6;
                    d.fx = null;
                    d.fy = null;
                })
        }

        return graph;
    }
}

export {DrawGraph}
