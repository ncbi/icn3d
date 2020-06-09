//http://emptypipes.org/2017/04/29/d3v4-selectable-zoomable-force-directed-graph/
//https://gist.github.com/pkerpedjiev/f2e6ebb2532dae603de13f0606563f5b
iCn3DUI.prototype.drawGraph = function (jsonStr) {  var me = this; //"use strict";
//function createV4SelectableForceDirectedGraph(svg, graph) {
    // if both d3v3 and d3v4 are loaded, we'll assume
    // that d3v4 is called d3v4, otherwise we'll assume
    // that d3v4 is the default (d3)
    if (typeof d3v4 == 'undefined')
        d3v4 = d3;

    //if(me.icn3d.bRender !== true) return;

    var graph = JSON.parse(jsonStr);

    //var width = +svg.attr("width"),
    //    height = +svg.attr("height");

    var width = $("#" + me.pre + "dl_graph").width();
    var height = $("#" + me.pre + "dl_graph").height();

    var widthView = width * 1.0;
    var heightView = height * 1.0;

    var parentWidth = width;
    var parentHeight = height;

//    var svg = d3v4.select('svg')
//    .attr('width', parentWidth)
//    .attr('height', parentHeight)

    var svg = d3.select("#" + me.svgid)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0,0," + widthView + "," + heightView);

    // remove any previous graphs
    svg.selectAll('.g-main').remove();

    var gMain = svg.append('g')
    .classed('g-main', true);

    var rect = gMain.append('rect')
    .attr('width', parentWidth)
    .attr('height', parentHeight)
    .style('fill', '#FFF')

    var gDraw = gMain.append('g');

    var zoom = d3v4.zoom()
    .on('zoom', zoomed)

    gMain.call(zoom);


    function zoomed() {
        gDraw.attr('transform', d3v4.event.transform);
    }

    //var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

    if (! (graph.links)) {
        console.log("Graph is missing links");
        return;
    }

    // clean graph.links
    var linkArray = [];

    var nodeHash = {};
    for(var i = 0, il = graph.nodes.length; i < il; ++i) {
      var node = graph.nodes[i];
      nodeHash[node.id] = 1;
    }

    var bError = false;
    for(var i = 0, il = graph.links.length; i < il; ++i) {
      var link = graph.links[i];

      if(nodeHash.hasOwnProperty(link.source) && nodeHash.hasOwnProperty(link.target)) {
          linkArray.push(link);
      }
      else {
          if(!nodeHash.hasOwnProperty(link.source)) {
            console.log("The node " + link.source + " is not found... " );
          }
          if(!nodeHash.hasOwnProperty(link.target)) {
            console.log("The node " + link.target + " is not found... " );
          }

          bError = true;
      }
    }

    if(bError) console.log(JSON.stringify(graph));

    graph.links = linkArray;

    var nodes = {};
    var i;
    for (i = 0; i < graph.nodes.length; i++) {
        // enlarge the distance when no force
        if(!me.force) {
            graph.nodes[i].x *= 10;
            graph.nodes[i].y *= 10;
        }
        nodes[graph.nodes[i].id] = graph.nodes[i];
        graph.nodes[i].weight = 1.01;
    }

    // remove the internal edges when no force
    if(me.hideedges) {
        var links2 = [];
        for (i = 0; i < graph.links.length; i++) {
            if(graph.links[i].c != 'FFF') {
                links2.push(graph.links[i]);
            }
        }

        graph.links = links2;
    }

    // the brush needs to go before the nodes so that it doesn't
    // get called when the mouse is over a node
    var gBrushHolder = gDraw.append('g');
    var gBrush = null;

    var link = gDraw.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        //.attr("stroke", function(d) { return "#" + d.c; })
        .attr("stroke", function(d) {
            if(d.v == me.contactInsideValue) return "#" + me.contactInsideColor;
            else if(d.v == me.hbondInsideValue) return "#" + me.hbondInsideColor;
            else if(d.v == me.ionicInsideValue) return "#" + me.ionicInsideColor;
            else if(d.v == me.halogenInsideValue) return "#" + me.halogenInsideColor;
            else if(d.v == me.picationInsideValue) return "#" + me.picationInsideColor;
            else if(d.v == me.pistackingInsideValue) return "#" + me.pistackingInsideColor;
            else return "#" + d.c;
          })
        .attr("stroke-width", function(d) {
            if(d.v == me.contactValue || d.v == me.contactInsideValue
              || d.v == me.hbondInsideValue || d.v == me.ionicInsideValue
              || d.v == me.halogenInsideValue || d.v == me.picationInsideValue
              || d.v == me.pistackingInsideValue) return "1px";
            else if(d.v == me.hbondValue || d.v == me.ionicValue
              || d.v == me.halogenValue || d.v == me.picationValue
              || d.v == me.pistackingValue) return "2px";
            else if(d.v == me.ssbondValue || d.v == me.clbondValue) return "3px";
            else return d.v + "px";
          });

    var allNodes = gDraw.append("g")
        .attr("class", "node");

    var node = allNodes.selectAll("circle")
        .data(graph.nodes)
        //.attr("cx", function(d){return d.x})
        //.attr("cy", function(d){return d.y})
        .enter().append("circle")
        .attr("r", 3) //5)
        .attr("fill", function(d) { return "#" + d.c; })
        .attr("stroke", function(d) { return "#" + d.c; })
        .attr("res", function(d) { return d.r; })
        .attr("class", "icn3d-node")
        .call(d3v4.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    var label = allNodes.selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .text(function(d) {
            var idStr = d.id;
            var pos = idStr.indexOf('.');
            if(pos !== -1) idStr = idStr.substr(0, pos);
            return idStr;
        })
        //.style("stroke", function(d) { return "#" + d.c; })
        .attr("fill", function(d) { return "#" + d.c; })
        .attr("stroke", "none")
        .attr("class", "icn3d-node-text8");
        //.style("font-size", "8px")
        //.style("font-weight", "bold")
        //.attr("x", function(d){return d.x + 6})
        //.attr("y", function(d){return d.y + 3})

    // add titles for mouseover blurbs
    node.append("title")
        .text(function(d) { return d.id; });

    var dist_ss = parseInt($("#" + me.pre + "dist_ss").val());
    var dist_coil = parseInt($("#" + me.pre + "dist_coil").val());
    var dist_hbond = parseInt($("#" + me.pre + "dist_hbond").val());
    var dist_inter = parseInt($("#" + me.pre + "dist_inter").val());
    var dist_ssbond = parseInt($("#" + me.pre + "dist_ssbond").val());
    var dist_ionic = parseInt($("#" + me.pre + "dist_ionic").val());

    var dist_halogen = parseInt($("#" + me.pre + "dist_halogen").val());
    var dist_pication = parseInt($("#" + me.pre + "dist_pication").val());
    var dist_pistacking = parseInt($("#" + me.pre + "dist_pistacking").val());

    me.simulation = d3v4.forceSimulation()
        .force("link", d3v4.forceLink()
            .id(function(d) { return d.id; })
            .distance(function(d) {
                //var dist = 20 / d.value;
                //return dist;

                return 30;
            })
            .strength(function(d) {
                if(!me.force) {
                    return 0;
                }
                else {
                    //return 1 / Math.min(count(d.source), count(d.target));

                    // larger distance means more relaxed
                    if(d.v == me.ssValue) { // secondary
                        return !isNaN(dist_ss) ? dist_ss / 100.0 : 1;
                    }
                    else if(d.v == me.coilValue || d.v == me.clbondValue) { // coil
                        return !isNaN(dist_coil) ? dist_coil / 100.0 : 0.5;
                    }
                    else if(d.v == me.hbondValue || d.v == me.hbondInsideValue) { // hydrogen bonds
                        return !isNaN(dist_hbond) ? dist_hbond / 100.0 : 0.5;
                    }
                    else if(d.v == me.contactValue || d.v == me.contactInsideValue) { // interactions
                        return !isNaN(dist_inter) ? dist_inter / 100.0 : 0.25;
                    }
                    else if(d.v == me.ssbondValue) { // hydrogen bonds
                        return !isNaN(dist_ssbond) ? dist_ssbond / 100.0 : 0.5;
                    }
                    else if(d.v == me.ionicValue || d.v == me.ionicInsideValue ) { // ionic interaction
                        return !isNaN(dist_ionic) ? dist_ionic / 100.0 : 0.5;
                    }
                    else if(d.v == me.halogenValue || d.v == me.halogenInsideValue ) {
                        return !isNaN(dist_halogen) ? dist_halogen / 100.0 : 0.5;
                    }
                    else if(d.v == me.picationValue || d.v == me.picationInsideValue ) {
                        return !isNaN(dist_pication) ? dist_pication / 100.0 : 0.5;
                    }
                    else if(d.v == me.pistackingValue || d.v == me.pistackingInsideValue ) {
                        return !isNaN(dist_pistacking) ? dist_pistacking / 100.0 : 0.5;
                    }
                    else {
                        return 0;
                    }
                } // else
            })
          )
        .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2));

    if(me.force) {
        me.simulation.force("charge", d3v4.forceManyBody());
    }

    //me.simulation.force("x", d3v4.forceX(parentWidth/2))
    //    .force("y", d3v4.forceY(parentHeight/2));

    if(me.force == 1) {  // x-axis
        me.simulation.force("x", d3v4.forceX(function(d) {
            if(d.s == 'a') {
                return parentWidth/4;
            }
            else {
                return parentWidth * 0.75;
            }
        }).strength(function(d) { return 0.4;}) )
        .force("y", d3v4.forceY(parentHeight/2).strength(function(d) { return 0.02;}));

    }
    else if(me.force == 2) { // y-axis
        me.simulation.force("y", d3v4.forceY(function(d) {
            if(d.s == 'a') {
                return parentHeight * 0.75;
            }
            else {
                return parentHeight/4;
            }
        }).strength(function(d) { return 0.4;}) )
        .force("x", d3v4.forceX(parentWidth/2).strength(function(d) { return 0.02;}));
    }
    else if(me.force == 3) { // circle
        me.simulation.force("r", d3v4.forceRadial(function(d) {
            if(d.s == 'a') {
                return 200;
            }
            else {
                return 100;
            }

        }, parentWidth/2, parentHeight/2).strength(function(d) { return 0.8;}) );
    }
    else if(me.force == 4) { // random
        // do nothing
    }

    me.simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    me.simulation.force("link")
        .links(graph.links);

//    me.simulation.stop();
//    me.simulation.restart();

    function ticked() {
        // update node and line positions at every step of
        // the force me.simulation
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return parentHeight - d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return parentHeight - d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return parentHeight - d.y; });

        label.attr("x", function(d) { return d.x + 6; })
            .attr("y", function(d) { return parentHeight - (d.y + 3); });

    }

    var brushMode = false;
    var brushing = false;

    var brush = d3v4.brush()
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

        var extent = d3v4.event.selection;

        node.classed("selected", function(d) {
          return d.selected = d.previouslySelected ^
            (extent[0][0] <= d.x && d.x < extent[1][0]
             && extent[0][1] <= parentHeight - d.y && parentHeight - d.y < extent[1][1]);
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

    var ctrlKey;

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
      if (!d3v4.event.active) me.simulation.alphaTarget(0.9).restart();

        if (!d.selected && !ctrlKey) {
            // if this node isn't selected, then we have to unselect every other node
            node.classed("selected", function(p) {
                  return p.selected =  p.previouslySelected = false;
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
      if (!d3v4.event.active) me.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
        node.filter(function(d) { return d.selected; })
        .each(function(d) { //d.fixed &= ~6;
            d.fx = null;
            d.fy = null;
        })
    }

    return graph;
};

iCn3DUI.prototype.getSvgXml = function (id) {  var me = this; //"use strict";
    // font is not good
    var svg_data = document.getElementById(id).innerHTML; //put id of your svg element here

    var head = "<svg title=\"graph\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

    //if you have some additional styling like graph edges put them inside <style> tag
    var style = "<style>text {font-family: sans-serif; font-weight: bold; font-size: 18px;}</style>";

    var full_svg = head +  style + svg_data + "</svg>"

    return full_svg;
};

iCn3DUI.prototype.saveSvg = function (id, filename) {  var me = this; //"use strict";
    var svg = me.getSvgXml(id);

    var blob = new Blob([svg], {type: "image/svg+xml"});
    saveAs(blob, filename);
};

iCn3DUI.prototype.savePng = function (id, filename, width, height) {  var me = this; //"use strict";
    // https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
    var svg = document.getElementById(id);
    var bbox = svg.getBBox();

    var copy = svg.cloneNode(true);
    me.copyStylesInline(copy, svg);
    var canvas = document.createElement("CANVAS");
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, bbox.width, bbox.height);

    var data = me.getSvgXml(id); //(new XMLSerializer()).serializeToString(copy); //me.getSvgXml();
    var DOMURL = window.URL || window.webkitURL || window;
    var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});

    var img = new Image();
    img.src = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(this.src);

        if(me.isIE()) {
            var blob = canvas.msToBlob();

            saveAs(blob, filename);

            canvas.remove();

            return;
        }
        else {
            canvas.toBlob(function(data) {
                var blob = data;
                saveAs(blob, filename);

                canvas.remove();

                return;
            });
        }
    };
};

iCn3DUI.prototype.copyStylesInline = function (destinationNode, sourceNode) {  var me = this; //"use strict";
   var containerElements = ["svg","g"];
   for (var cd = 0; cd < destinationNode.childNodes.length; cd++) {
       var child = destinationNode.childNodes[cd];
       if (containerElements.indexOf(child.tagName) != -1) {
            me.copyStylesInline(child, sourceNode.childNodes[cd]);
            continue;
       }
       var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
       if (style == "undefined" || style == null) continue;
       for (var st = 0; st < style.length; st++){
            child.style.setProperty(style[st], style.getPropertyValue(style[st]));
       }
   }
};
