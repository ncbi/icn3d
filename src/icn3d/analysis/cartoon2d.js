/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Selection} from '../selection/selection.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {Annotation} from '../annotations/annotation.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {HlObjects} from '../highlight/hlObjects.js';

class Cartoon2d {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    draw2Dcartoon(type) { let ic = this.icn3d, me = ic.icn3dui;
        me.htmlCls.clickMenuCls.setLogCmd("cartoon 2d " + type, true);
        this.draw2Dcartoon_base(type);
    }

    draw2Dcartoon_base(type, bResize) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.cartoon2dType = type;

        //ic.bGraph = false; // differentiate from force-directed graph for interactions

        if(bResize) {
            let html = thisClass.getCartoonSvg(type, ic.graphStr);
            $("#" + me.svgid_ct).html(html);
        }
        else {
            if(type == 'domain' && !ic.chainid2pssmid) {
                $.when(thisClass.getNodesLinksForSetCartoon(type)).then(function() {
                   ic.graphStr = thisClass.getCartoonData(type, ic.node_link);
                   //ic.viewInterPairsCls.drawGraphWrapper(ic.graphStr, ic.deferredCartoon2d, true);
                   let html = thisClass.getCartoonSvg(type, ic.graphStr);
                   $("#" + me.svgid_ct).html(html);
                   thisClass.setEventsForCartoon2d();

                   me.htmlCls.dialogCls.openDlg('dl_2dctn', '2D Cartoon');

                   if(ic.deferredCartoon2d !== undefined) ic.deferredCartoon2d.resolve();
                });
            }
            else {
                this.getNodesLinksForSetCartoonBase(type);
                ic.graphStr = thisClass.getCartoonData(type, ic.node_link);

                //ic.viewInterPairsCls.drawGraphWrapper(ic.graphStr, ic.deferredCartoon2d, true);
                let html = thisClass.getCartoonSvg(type, ic.graphStr);

                $("#" + me.svgid_ct).html(html);
                thisClass.setEventsForCartoon2d();

                me.htmlCls.dialogCls.openDlg('dl_2dctn', '2D Cartoon');
            }
        }
    }

    getCartoonSvg(type, graphStr) { let ic = this.icn3d, me = ic.icn3dui;
        //let html = "<svg id='" + me.svgid_ct + "' viewBox='" + "0,0," + me.htmlCls.width2d + "," + me.htmlCls.width2d + "'>";
        let html = "";

        let strokecolor = '#bbbbbb';
        let strokewidth = '1';
        let linestrokewidth = '1';
        let hlStrokeWidth = '3';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let nodeHtml = "";

        let graph = JSON.parse(graphStr);
        ic.ctnNodeHash = {};
        for(let i = 0, il = graph.nodes.length; i < il; ++i) {
            let node = graph.nodes[i];
            ic.ctnNodeHash[node.id] = node;

            if(type == 'secondary') {
                nodeHtml += this.drawHelix(type, node.id, node.ss, node.x, node.y, node.x1, node.y1, node.x2, node.y2, node.len, node.ang, node.c);
            }
            else {
                nodeHtml += this.drawOval(type, node.id, node.x, node.y, node.rx, node.ry, node.ang, node.c, node.from, node.to);
            }
        }

        ic.nodeid2lineid = {};
        for(let i = 0, il = graph.links.length; i < il; ++i) {
            let id1 = graph.links[i].source;
            let id2 = graph.links[i].target;

            let x1 = ic.ctnNodeHash[id1].x, y1 = me.htmlCls.width2d - ic.ctnNodeHash[id1].y, x2 = ic.ctnNodeHash[id2].x, y2 = me.htmlCls.width2d - ic.ctnNodeHash[id2].y;

            if(type == 'chain') {
                html += "<g class='icn3d-ctinteraction' chainid1='" + ic.ctnNodeHash[id1].id + "' chainid2='" + ic.ctnNodeHash[id2].id + "' >";
            }
            else if(type == 'domain') {
                html += "<g class='icn3d-ctinteraction' from1='" + ic.ctnNodeHash[id1].from + "' to1='" + ic.ctnNodeHash[id1].to
                    + "' from2='" + ic.ctnNodeHash[id2].from + "' to2='" + ic.ctnNodeHash[id2].to + "' >";
            }
            else if(type == 'secondary') {
                x1 = ic.ctnNodeHash[id1].x2, y1 = me.htmlCls.width2d - ic.ctnNodeHash[id1].y2, x2 = ic.ctnNodeHash[id2].x1, y2 = me.htmlCls.width2d - ic.ctnNodeHash[id2].y1;

                html += "<g class='icn3d-ctinteraction' range1='" + ic.ctnNodeHash[id1].range + "' range2='" + ic.ctnNodeHash[id2].range + "' >";
            }

            let idStr1 = this.getLabelFromId(id1, type);
            let idStr2 = this.getLabelFromId(id2, type);
            let idpair = id1 + "--" + id2;

            html += "<title>Interaction of " + type + " " + idStr1 + " with " + type + " " + idStr2 + "</title>";
            html += "<line class='icn3d-edge' id='" + idpair + "' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";

            if(!ic.nodeid2lineid.hasOwnProperty(id1)) {
                ic.nodeid2lineid[id1] = [];
            }
            if(!ic.nodeid2lineid.hasOwnProperty(id2)) {
                ic.nodeid2lineid[id2] = [];
            }
            ic.nodeid2lineid[id1].push(idpair);
            ic.nodeid2lineid[id2].push(idpair);
        }

        html += nodeHtml; // draw chemicals at the bottom layer

        //html += "</svg>";

        return html;
    }

    setEventsForCartoon2d() {  let ic = this.icn3d, me = ic.icn3dui;
        //https://stackoverflow.com/questions/1108480/svg-draggable-using-jquery-and-jquery-svg
        $("#" + me.svgid_ct + " .icn3d-ctnode")
        .draggable({
            start: function( e, ui ) {
                let oriCx = parseFloat(e.target.getAttribute('cx'));
                let oriCy = parseFloat(e.target.getAttribute('cy'));

                e.target.setAttribute('cx', oriCx);
                e.target.setAttribute('cy', oriCy);

                let angle = e.target.getAttribute('ang');

                if(angle) {
                    // update coordinates manually, since top/left style props don't work on SVG
                    e.target.setAttribute('transform', "rotate(" + angle + "," + oriCx + "," + oriCy + ")");
                }
                else {
                    let x1 = parseFloat(e.target.getAttribute('x1'));
                    let y1 = parseFloat(e.target.getAttribute('y1'));

                    let x2 = parseFloat(e.target.getAttribute('x2'));
                    let y2 = parseFloat(e.target.getAttribute('y2'));

                    e.target.setAttribute('x1', x1);
                    e.target.setAttribute('y1', y1);
                    e.target.setAttribute('x2', x2);
                    e.target.setAttribute('y2', y2);
                }
            },
            drag: function( e, ui ) {
                let offsetX = $("#" + me.svgid_ct).offset().left;
                let offsetY = $("#" + me.svgid_ct).offset().top;

                let id = e.target.getAttribute('id');
                let angle = e.target.getAttribute('ang');

                //let cx = ui.position.left - offsetX;
                //let cy = ui.position.top - offsetY;
                let cx = (e.clientX - offsetX);
                let cy = (e.clientY - offsetY);

                let oriCx = parseFloat(e.target.getAttribute('cx'));
                let oriCy = parseFloat(e.target.getAttribute('cy'));

                // change for each step
                let dx = (cx - oriCx) / ic.resizeRatioX;
                let dy = (cy - oriCy) / ic.resizeRatioY;

                // move the text label
                let oriX = parseFloat($("#" + id + "_text").attr('x'));
                let oriY = parseFloat($("#" + id + "_text").attr('y'));

                $("#" + id + "_text").attr('x', oriX + dx);
                $("#" + id + "_text").attr('y', oriY + dy);

                // update the center
                e.target.setAttribute('cx', cx);
                e.target.setAttribute('cy', cy);

                if(angle) {
                    // update coordinates manually, since top/left style props don't work on SVG
                    e.target.setAttribute('transform', "rotate(" + angle + "," + cx + "," + cy + ")");
                }
                else {
                    let x1 = parseFloat(e.target.getAttribute('x1'));
                    let y1 = parseFloat(e.target.getAttribute('y1'));

                    let x2 = parseFloat(e.target.getAttribute('x2'));
                    let y2 = parseFloat(e.target.getAttribute('y2'));

                    e.target.setAttribute('x1', x1 + dx);
                    e.target.setAttribute('y1', y1 + dy);
                    e.target.setAttribute('x2', x2 + dx);
                    e.target.setAttribute('y2', y2 + dy);

                    // move the outer box for sheets
                    if(id.substr(0, 1) == 'S') {
                        let oriX1 = parseFloat($("#" + id + "_box").attr('x1'));
                        let oriY1 = parseFloat($("#" + id + "_box").attr('y1'));
                        let oriX2 = parseFloat($("#" + id + "_box").attr('x2'));
                        let oriY2 = parseFloat($("#" + id + "_box").attr('y2'));

                        $("#" + id + "_box").attr('x1', oriX1 + dx);
                        $("#" + id + "_box").attr('y1', oriY1 + dy);
                        $("#" + id + "_box").attr('x2', oriX2 + dx);
                        $("#" + id + "_box").attr('y2', oriY2 + dy);
                    }
                }

                // update the edges
                if(ic.nodeid2lineid[id]) {
                    for(let i = 0, il = ic.nodeid2lineid[id].length; i < il; ++i) {
                        let idpair = ic.nodeid2lineid[id][i];

                        updateEdges(idpair, id, angle);
                    }
                }

                function updateEdges(idpair, id, angle) {
                    if(idpair && idpair.indexOf(id) != -1) {
                        let idArray = idpair.split('--');
                        if(idArray.length == 2) {
                            let id1, id2;

                            id1 = idArray[1];
                            id2 = idArray[0];

                            let posX1 = (angle) ? 'cx' : 'x1';
                            let posY1 = (angle) ? 'cy' : 'y1';

                            let x1 = $("#" + id1).attr(posX1);
                            let y1 = $("#" + id1).attr(posY1);

                            $("#" + idpair).attr('x1', x1);
                            $("#" + idpair).attr('y1', y1);

                            let posX2 = (angle) ? 'cx' : 'x2';
                            let posY2 = (angle) ? 'cy' : 'y2';

                            let x2 = $("#" + id2).attr(posX2);
                            let y2 = $("#" + id2).attr(posY2);

                            $("#" + idpair).attr('x2', x2);
                            $("#" + idpair).attr('y2', y2);
                        }
                    } // if
                } // function
            }
        });
    }

    getLabelFromId(id, type) {
        let idStr = id;
        let pos = idStr.indexOf('__');
        if (pos !== -1) idStr = idStr.substr(0, pos);
        if(type == 'secondary') {
            idStr = idStr.substr(0, idStr.indexOf('-'));
        }
        else {
            idStr = idStr.substr(idStr.lastIndexOf('_') + 1);
        }

        return idStr;
    }

    drawHelix(type, id, ss, x, y, x1, y1, x2, y2, length, angle, color) { let ic = this.icn3d, me = ic.icn3dui;
        let strokecolor = 'none';
        let strokewidth = '1';
        let linestrokewidth = '1';
        let helixstrokewidth = '3';
        let helixstrokewidth2 = '1';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let idStr = this.getLabelFromId(id, type);
        let oriY = y;
        y = me.htmlCls.width2d - y; // flip
        y1 = me.htmlCls.width2d - y1; // flip
        y2 = me.htmlCls.width2d - y2; // flip
        angle = 180 - angle; // flip

        let range = idStr.substr(1);
        //let html = "<g class='icn3d-node' range='" + range + "' >";
        let html = "<g range='" + range + "' >";
        html += "<title>" + type + " " + idStr + "</title>";

        if(id.substr(0,1) == 'H') {
            html += "<line id='" + id + "' class='icn3d-ctnode' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' cx='" + 0.5*(x1+x2).toFixed(1) + "' cy='" + 0.5*(y1+y2).toFixed(1) + "' stroke='#" + color + "' stroke-width='" + helixstrokewidth + "' stroke-linecap='round' />";
        }
        else {
            html += "<line id='" + id + "_box' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='#" + color + "' stroke-width='" + helixstrokewidth + "' stroke-linecap='square' />";
            html += "<line id='" + id + "' class='icn3d-ctnode' x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' cx='" + 0.5*(x1+x2).toFixed(1) + "' cy='" + 0.5*(y1+y2).toFixed(1) + "' stroke='#FFF' stroke-width='" + helixstrokewidth2 + "' stroke-linecap='square' />";
        }

        html += "<text id='" + id + "_text' x='" +(x - adjustx).toString() + "' y='" +(y + adjusty).toString() + "' style='fill:" + textcolor + "; text-anchor:middle' class='icn3d-node-text8' >" + idStr + "</text>";

        html += "</g>";

        return html;
    }

    drawOval(type, id, x, y, rx, ry, angle, color, from, to) { let ic = this.icn3d, me = ic.icn3dui;
        let strokecolor = 'none';
        let strokewidth = '1';
        let linestrokewidth = '2';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let idStr = this.getLabelFromId(id, type);
        y = me.htmlCls.width2d - y; // flip
        angle = 180 - angle; // flip

        let html = (type == 'chain') ? "<g chainid='" + id + "' >"
            : "<g from='" + from + "' to='" + to + "' >";
        html += "<title>" + type + " " + idStr + "</title>";

        html += "<defs>";
        html += "<linearGradient id='" + id + "_g_obj' x1='0%' y1='0%' x2='100%' y2='0%'>";
        html += "  <stop offset='0%' style='stop-color:rgb(255,255,255);stop-opacity:1' />";
        html += "  <stop offset='100%' style='stop-color:#" + color + ";stop-opacity:1' />";
        html += "</linearGradient>";
        html += "</defs>";

        html += "<ellipse id='" + id + "' class='icn3d-ctnode' cx='" + x.toFixed(0) + "' cy='" + y.toFixed(0) + "' rx='" + rx.toFixed(0) + "' ry='" + ry.toFixed(0) + "' fill='url(#" + id + "_g_obj)' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' ";
        html += " ang='" + angle + "' transform='rotate(" + angle + "," + x.toFixed(0) + "," + y.toFixed(0) + ")'";
        html += (type == 'chain') ? " chainid='" + id + "' />" : " from='" + from + "' to='" + to + "' />";

        html += "<text id='" + id + "_text' x='" +(x - adjustx).toString() + "' y='" +(y + adjusty).toString() + "' style='fill:" + textcolor + "; text-anchor:middle' class='icn3d-node-text12' >" + idStr + "</text>";

        html += "</g>";

        return html;
    }

    getCartoonData(type, node_link) { let ic = this.icn3d, me = ic.icn3dui;
       // get the nodes and links data
       let nodeArray = [], linkArray = [];
       let nodeStr, linkStr;

       nodeArray = node_link.node;

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
       }
       let nodeStrArray = [];
       for(let i = 0, il = nodeJsonArray.length; i < il; ++i) {
           let nodeJson = nodeJsonArray[i];
           nodeStrArray.push(JSON.stringify(nodeJson));
       }
       nodeStr = nodeStrArray.join(', ');
       // linkStr
       linkArray = node_link.link;
       linkStr = linkArray.join(', ');

       let selectedAtoms = ic.hAtoms;
       let chemicalNodeStr = '';
       let hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
         disulfideLinkStr = '', crossLinkStr = '';

//       contactLinkStr += ic.getGraphCls.getContactLinksForSet(ic.hAtoms, 'chain', true);

       let resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
       resStr += linkStr + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;

       let level = (node_link.level) ? node_link.level : '';
       resStr += '], "level": "' + level + '"}';
       return resStr;
    }

    getNodesLinksForSetCartoon(type) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
      ic.deferredCartoonData = $.Deferred(function() {
          thisClass.getNodesLinksForSetCartoonBase(type);
      });

      return ic.deferredCartoonData.promise();
    }

    projectTo2d(v3) { let ic = this.icn3d, me = ic.icn3dui;
        let v2 = v3.project( ic.cam );

        var realV3 = new THREE.Vector3();
        realV3.x = Math.round((v2.x + 1) * me.htmlCls.width2d * 0.5);
        realV3.y = Math.round((-v2.y) * me.htmlCls.width2d * 0.5);
        realV3.z = 0;

        if(realV3.y > 0) {
            realV3.y = me.htmlCls.width2d - realV3.y;
        }
        else {
            realV3.y = -realV3.y;
        }

        return realV3;
    }

    getNodesLinksForSetCartoonBase(type) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let nodeArray = [], linkArray = [];
       let cnt = 0;
       let thickness = me.htmlCls.defaultValue; // 1

       let prevChain = '', prevResName = '', prevResi = 0, prevAtom, lastChain = '';
       let x, y, z, length = 0, angle;
       let bBegin = false, bEnd = true;
       let resName, residLabel;

       let setName = 'a';

       if(type == 'chain') {
           let chainidHash = {};
           for(let i in ic.hAtoms) {
               let atom = ic.atoms[i];
               if(atom.chain == 'DUM') continue;

               let chainid = atom.structure + '_' + atom.chain;

               if(ic.proteins.hasOwnProperty(i) || ic.nucleotides.hasOwnProperty(i)) {
                   if(!chainidHash.hasOwnProperty(chainid)) {
                       chainidHash[chainid] = {};
                   }
                   chainidHash[chainid][atom.serial] = atom;
               }
           }

           let min_max_center = ic.contactCls.getExtent(ic.atoms);

           let minX=9999, minY=9999, maxX=-9999, maxY=-9999, maxR = -9999;
           let itemArray = [];
           for(let chainid in chainidHash) {
               ic.hAtom = {};
               ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[chainid]);

               let center_x_y_z = ic.axesCls.setPc1Axes();
               let center = center_x_y_z[0];
               let rx = center_x_y_z[1].distanceTo(center_x_y_z[0]);
               let ry = center_x_y_z[2].distanceTo(center_x_y_z[0]);
               let angle = new THREE.Vector2(center_x_y_z[1].x - center_x_y_z[0].x, center_x_y_z[1].y - center_x_y_z[0].y).angle() * 180 / Math.PI;
               if(angle > 180) angle -= 180;

               let serial = Object.keys(ic.hAtoms)[0];
               let atom = ic.atoms[serial];

               residLabel = chainid; //.substr(chainid.lastIndexOf('_') + 1); //chainid;
               //let shapeid = 0;

               center = this.projectTo2d(center);
               let x = center.x;
               let y = center.y;

               if(x < minX) minX = x;
               if(x > maxX) maxX = x;
               if(y < minY) minY = y;
               if(y > maxY) maxY = y;

               //let x = me.htmlCls.width2d * (center.x - min_max_center[0][0]) / (min_max_center[1][0] - min_max_center[0][0]);
               //let y = me.htmlCls.width2d * (center.y - min_max_center[0][1]) / (min_max_center[1][1] - min_max_center[0][1]);

               let factor = 0.5;
               rx = factor * me.htmlCls.width2d * rx / (min_max_center[1][0] - min_max_center[0][0]);
               ry = factor * me.htmlCls.width2d * ry / (min_max_center[1][1] - min_max_center[0][1]);

               if(rx > maxR) maxR = rx;
               if(ry > maxR) maxR = ry;

               itemArray.push({"id":chainid, "r":residLabel, "x":x, "y":y, "rx":rx, "ry":ry,
                 "ang":angle, "c":atom.color.getHexString()});
           }

           let offset = maxR + 2;
           let rangeX = maxX - minX, rangeY = maxY - minY;

           for(let i = 0, il = itemArray.length; i < il; ++i) {
               let item = itemArray[i];
               let x = (rangeX < 1) ? 0.5 * me.htmlCls.width2d : (item.x - minX) / rangeX * (me.htmlCls.width2d - 2 * offset) + offset;
               let y = (rangeY < 1) ? 0.5 * me.htmlCls.width2d : (item.y - minY) / rangeY * (me.htmlCls.width2d - 2 * offset) + offset;

               nodeArray.push('{"id": "' + item.id + '", "r": "' + item.r //+ '", "s": "' + setName
                   + '", "x": ' + x.toFixed(0) + ', "y": ' + y.toFixed(0)
                   + ', "rx": ' + item.rx.toFixed(0) + ', "ry": ' + item.ry.toFixed(0)
                   + ', "ang": ' + item.ang.toFixed(0) //+ ', "shape": ' + shapeid
                   + ', "c": "' + item.c.toUpperCase() + '"}');
           }

           ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);

           ic.node_link = {"node": nodeArray, "link":linkArray, "level": "chain"};
       }
       else if(type == 'domain') {
           if(!ic.chainid2pssmid) { // mmtf data do NOT have the missing residues
                $.when(ic.loadScriptCls.applyCommandAnnotationsAndCddSite('view annotations')).then(function() {
                   thisClass.getNodesLinksForDomains(ic.chainid2pssmid);
                   if(ic.deferredCartoonData !== undefined) ic.deferredCartoonData.resolve();
                   return;
                });
           }
           else {
               thisClass.getNodesLinksForDomains(ic.chainid2pssmid);
               if(ic.deferredCartoonData !== undefined) ic.deferredCartoonData.resolve();
               return;
           }
       }
       else if(type == 'secondary') {
           ic.resi2resirange = {};
           let resiArray = [], tmpResName;

           let min_max_center = ic.contactCls.getExtent(ic.atoms);

           let ss = '';

           let minX=9999, minY=9999, maxX=-9999, maxY=-9999, maxR = 2;
           let itemArray = [];
           for(let i in ic.hAtoms) {
               let atom = ic.atoms[i];
               if(atom.chain == 'DUM') continue;

               if((atom.ssbegin || atom.ssend) && atom.name == "CA" && atom.elem == "C") {
                   let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                   //if((prevChain === '' || prevChain == atom.chain) && bEnd && atom.ssbegin) {
                   if(bEnd && atom.ssbegin) {
                       bBegin = true;
                       bEnd = false;

                       prevAtom = atom;

                       ss = (atom.ss == 'helix') ? 'H' : 'S';

                       resName = ss + atom.resi
                       // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
                       residLabel = '1_1_' + resid;

                       lastChain = atom.chain;
                   }

                   if(bBegin) {
                       tmpResName = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi
                       tmpResName += '__' + atom.chain;
                       if(Object.keys(ic.structures).length > 1) tmpResName += '__' + atom.structure;

                       resiArray.push(tmpResName);
                   }

                   if(lastChain == atom.chain && bBegin && atom.ssend) {
                       let v2a = this.projectTo2d(prevAtom.coord.clone());
                       let x1 = v2a.x;
                       let y1 = v2a.y;

                       let v2b = this.projectTo2d(atom.coord.clone());
                       let x2 = v2b.x;
                       let y2 = v2b.y;

                       x = 0.5 * (x1 + x2);
                       y = 0.5 * (y1 + y2);

                       // use half length of the helix or sheet to make the display clear
                       x1 = 0.5 * (x + x1);
                       y1 = 0.5 * (y + y1);
                       x2 = 0.5 * (x + x2);
                       y2 = 0.5 * (y + y2);

                       if(x1 < minX) minX = x1;
                       if(x1 > maxX) maxX = x1;
                       if(y1 < minY) minY = y1;
                       if(y1 > maxY) maxY = y1;

                       if(x2 < minX) minX = x2;
                       if(x2 > maxX) maxX = x2;
                       if(y2 < minY) minY = y2;
                       if(y2 > maxY) maxY = y2;

                       bBegin = false;
                       bEnd = true;

                       resName += '-' + atom.resi;
                       residLabel += '-' + atom.resi;

                       resName += '__' + atom.chain;
                       if(Object.keys(ic.structures).length > 1) resName += '__' + atom.structure;

                       for(let j = 0, jl = resiArray.length; j < jl; ++j) {
                           tmpResName = resiArray[j];
                           ic.resi2resirange[tmpResName] = resName;
                       }
                       resiArray = [];

                       if(cnt > 0 && prevChain == atom.chain) {
                           linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                               + '", "v": ' + thickness + ', "c": "' + prevAtom.color.getHexString().toUpperCase() + '"}');
                       }

                       itemArray.push({"id":resName, "r":residLabel, "ss":ss, "x":x, "y":y,
                         "x1":x1, "y1":y1, "x2":x2, "y2":y2, "c":atom.color.getHexString()});

                       prevChain = atom.chain;
                       prevResName = resName;
                       ++cnt;
                   }
               }
           } //end for

           let offset = maxR + 2;
           let rangeX = maxX - minX, rangeY = maxY - minY;

           for(let i = 0, il = itemArray.length; i < il; ++i) {
               let item = itemArray[i];
               let x = (rangeX < 1) ? 0.5 * me.htmlCls.width2d : (item.x - minX) / rangeX * (me.htmlCls.width2d - 2 * offset) + offset;
               let y = (rangeY < 1) ? 0.5 * me.htmlCls.width2d : (item.y - minY) / rangeY * (me.htmlCls.width2d - 2 * offset) + offset;
               let x1 = (rangeX < 1) ? 0.5 * me.htmlCls.width2d : (item.x1 - minX) / rangeX * (me.htmlCls.width2d - 2 * offset) + offset;
               let y1 = (rangeY < 1) ? 0.5 * me.htmlCls.width2d : (item.y1 - minY) / rangeY * (me.htmlCls.width2d - 2 * offset) + offset;
               let x2 = (rangeX < 1) ? 0.5 * me.htmlCls.width2d : (item.x2 - minX) / rangeX * (me.htmlCls.width2d - 2 * offset) + offset;
               let y2 = (rangeY < 1) ? 0.5 * me.htmlCls.width2d : (item.y2 - minY) / rangeY * (me.htmlCls.width2d - 2 * offset) + offset;

               nodeArray.push('{"id": "' + item.id + '", "r": "' + item.r
                   + '", "x": ' + x.toFixed(0) + ', "y": ' + y.toFixed(0)
                   + ', "x1": ' + x1.toFixed(0) + ', "y1": ' + y1.toFixed(0)
                   + ', "x2": ' + x2.toFixed(0) + ', "y2": ' + y2.toFixed(0)
                   + ', "c": "' + item.c.toUpperCase() + '"}');
           }

           ic.node_link = {"node": nodeArray, "link":linkArray, "level": "secondary"};
       }

       if(ic.deferredCartoonData !== undefined) ic.deferredCartoonData.resolve();
    }

    getNodesLinksForDomains(chainid2pssmid) { let ic = this.icn3d, me = ic.icn3dui;
       let nodeArray = [], linkArray = [];
       let cnt = 0;
       let thickness = me.htmlCls.defaultValue; // 1

       let prevChain = '', prevResName = '', prevResi = 0, prevAtom, lastChain = '';
       let x, y, z, length = 0, prevX, prevY, prevZ;
       let resName, residLabel;

       let setName = 'a';

       ic.resi2resirange = {};
       let resiArray = [], tmpResName;

       // find the chainids
       let chainidHash = {};
       for(let i in ic.hAtoms) {
           let atom = ic.atoms[i];
           if(atom.chain == 'DUM') continue;

           chainidHash[atom.structure + '_' + atom.chain] = 1;
       }

       let min_max_center = ic.contactCls.getExtent(ic.atoms);

       let minX=9999, minY=9999, maxX=-9999, maxY=-9999, maxR = -9999;
       let itemArray = [];

       // show domains for each chain
       for(let chainid in chainidHash) {
           if(!chainid2pssmid.hasOwnProperty(chainid)) continue;

           let pssmid2name = chainid2pssmid[chainid].pssmid2name;
           let pssmid2fromArray = chainid2pssmid[chainid].pssmid2fromArray;
           let pssmid2toArray = chainid2pssmid[chainid].pssmid2toArray;

           // sort the domains according to the starting residue number
           let pssmid2start = {};
           for(let pssmid in pssmid2name) {
               let fromArray = pssmid2fromArray[pssmid];
               pssmid2start[pssmid] = fromArray[0];
           }

           var pssmidArray = Object.keys(pssmid2start);
           pssmidArray.sort(function(a, b) {
               return pssmid2start[a] - pssmid2start[b]
           });

           let bNewChain = true;
           let prevDomainName, prevAtom;
           //for(let pssmid in pssmid2name) {
           for(let i = 0, il = pssmidArray.length; i < il; ++i) {
               let pssmid = pssmidArray[i];

               let domainName = pssmid2name[pssmid];
               domainName += '__' + chainid.substr(chainid.indexOf('_') + 1);
               if(Object.keys(ic.structures).length > 1) domainName += '__' + chainid.substr(0, chainid.indexOf('_'));

               let fromArray = pssmid2fromArray[pssmid];
               let toArray = pssmid2toArray[pssmid];

               ic.hAtoms = {};
               for(let j = 0, jl = fromArray.length; j < jl; ++j) {
                   let resiStart = fromArray[j] + 1;
                   let resiEnd = toArray[j] + 1;

                   for(let k = resiStart; k <= resiEnd; ++k) {
                       ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[chainid + '_' + k]);
                   }
               }

               if(Object.keys(ic.hAtoms).length == 0) continue;

               //let extent = ic.contactCls.getExtent(atomSet);

               //let radiusSq = (extent[1][0] - extent[0][0]) * (extent[1][0] - extent[0][0]) + (extent[1][1] - extent[0][1]) * (extent[1][1] - extent[0][1]) + (extent[1][2] - extent[0][2]) * (extent[1][2] - extent[0][2]);
               //let radius = Math.sqrt(radiusSq);

               let center_x_y_z = ic.axesCls.setPc1Axes();
               let center = center_x_y_z[0];
               let rx = center_x_y_z[1].distanceTo(center_x_y_z[0]);
               let ry = center_x_y_z[2].distanceTo(center_x_y_z[0]);
               let angle = new THREE.Vector2(center_x_y_z[1].x - center_x_y_z[0].x, center_x_y_z[1].y - center_x_y_z[0].y).angle() * 180 / Math.PI;
               if(angle > 180) angle -= 180;

               let serial = Object.keys(ic.hAtoms)[0];
               let atom = ic.atoms[serial];

               residLabel = chainid;
               //let shapeid = 0;

               //let x = me.htmlCls.width2d * (center.x - min_max_center[0][0]) / (min_max_center[1][0] - min_max_center[0][0]);
               //let y = me.htmlCls.width2d * (center.y - min_max_center[0][1]) / (min_max_center[1][1] - min_max_center[0][1]);
               center = this.projectTo2d(center);
               let x = center.x;
               let y = center.y;

               if(x < minX) minX = x;
               if(x > maxX) maxX = x;
               if(y < minY) minY = y;
               if(y > maxY) maxY = y;

               let factor = 0.5;
               rx = factor * me.htmlCls.width2d * rx / (min_max_center[1][0] - min_max_center[0][0]);
               ry = factor * me.htmlCls.width2d * ry / (min_max_center[1][1] - min_max_center[0][1]);

               if(rx > maxR) maxR = rx;
               if(ry > maxR) maxR = ry;

               if(prevDomainName !== undefined) {
                   linkArray.push('{"source": "' + prevDomainName + '", "target": "' + domainName
                       + '", "v": ' + thickness + ', "c": "' + prevAtom.color.getHexString().toUpperCase() + '"}');
               }

               itemArray.push({"id":domainName, "from":fromArray + '', "to":toArray + '', "x":x, "y":y, "rx":rx, "ry":ry,
                 "ang":angle, "c":atom.color.getHexString()});

               prevDomainName = domainName;
               prevAtom = atom;
           }
       }

       let offset = maxR + 2;
       let rangeX = maxX - minX, rangeY = maxY - minY;

       for(let i = 0, il = itemArray.length; i < il; ++i) {
           let item = itemArray[i];
           let x = (rangeX < 1) ? 0.5 * me.htmlCls.width2d : (item.x - minX) / rangeX * (me.htmlCls.width2d - 2 * offset) + offset;
           let y = (rangeY < 1) ? 0.5 * me.htmlCls.width2d : (item.y - minY) / rangeY * (me.htmlCls.width2d - 2 * offset) + offset;

           nodeArray.push('{"id": "' + item.id
               + '", "from": "' + item.from + '", "to": "' + item.to
               + '", "x": ' + x.toFixed(0) + ', "y": ' + y.toFixed(0)
               + ', "rx": ' + item.rx.toFixed(0) + ', "ry": ' + item.ry.toFixed(0)
               + ', "ang": ' + item.ang.toFixed(0)
               + ', "c": "' + item.c.toUpperCase() + '"}');
       }

       ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);

       ic.node_link = {"node": nodeArray, "link":linkArray, "level": "domain"};

       //return {"node": nodeArray, "link":linkArray};
    }

    getSelection(idArray, from, to) { let ic = this.icn3d, me = ic.icn3dui;
        let atomSet = {};
        let residArray = [];

        let fromArray = from.toString().split(',');
        let toArray = to.toString().split(',');

        let structure = (idArray.length == 3) ? idArray[2] : Object.keys(ic.structures)[0];
        let chainidTmp = (idArray.length >= 2) ? structure + '_' + idArray[1] : Object.keys(ic.chains)[0];

        for(let i = 0, il = fromArray.length; i < il; ++i) {
            let from = parseInt(fromArray[i]) + 1
            let to = parseInt(toArray[i]) + 1
            for(let j = from; j <= to; ++j) {
                let resid = chainidTmp + '_' + j;
                atomSet = me.hashUtilsCls.unionHash(atomSet, ic.residues[resid]);
                residArray.push(resid);
            }
        }

        return {"atomSet": atomSet, "residArray": residArray};
    }

    click2Dcartoon() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        me.myEventCls.onIds("#" + me.pre + "2dctn_chain", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           thisClass.initCartoonSvg();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('chain');
        });

        me.myEventCls.onIds("#" + me.pre + "2dctn_domain", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           thisClass.initCartoonSvg();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('domain');
        });

        me.myEventCls.onIds("#" + me.pre + "2dctn_secondary", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           thisClass.initCartoonSvg();

           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('secondary');
        });

        $(document).on("click", "#" + ic.pre + "dl_2dctn .icn3d-ctnode", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            //ic.bClickInteraction = false;

            let atomSet = {}, residArray = [], type;

            let id = $(this).attr('id');
            let chainid = $(this).attr('chainid');
            let from = $(this).attr('from');
            let to = $(this).attr('to');
            let x1 = $(this).attr('x1');

            if(chainid !== undefined) {
                type = 'chain';
                atomSet = ic.chains[chainid];
            }
            else if(from !== undefined) {
                type = 'domain';

                let idArray = id.split('__');
                let result = thisClass.getSelection(idArray, from, to);
                atomSet = result.atomSet;
                residArray = result.residArray;
            }
            else if(x1 !== undefined) {
                type = 'secondary';

                let idArray = id.split('__');
                let from_to = idArray[0].substr(1).split('-');
                let from = parseInt(from_to[0]) - 1; // 0-based
                let to = parseInt(from_to[1]) - 1;
                let result = thisClass.getSelection(idArray, from, to);
                atomSet = result.atomSet;
                residArray = result.residArray;
            }

            // clear all nodes
            if(!ic.bCtrl && !ic.bShift) {
                ic.selectionCls.removeSelection();

                // ic.lineArray2d is used to highlight lines in 2D diagram
                ic.lineArray2d = [];
            }

            let ratio = 1.0;
            if(ic.alnChains[chainid] !== undefined) ratio = 1.0 * Object.keys(ic.alnChains[chainid]).length / Object.keys(ic.chains[chainid]).length;

            if(!ic.bCtrl && !ic.bShift) {
                ic.hAtoms = me.hashUtilsCls.cloneHash(atomSet); //ic.chains[chainid]);
            }
            else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomSet); //ic.chains[chainid]);
            }

            // get the name array
            if(type == 'chain') {
                if(!ic.bCtrl && !ic.bShift) {
                    ic.chainArray2d = [chainid];
                }
                else {
                    if(ic.chainArray2d === undefined) ic.chainArray2d = [];
                    ic.chainArray2d.push(chainid);
                }

                ic.hlUpdateCls.updateHlAll(ic.chainArray2d);
            }
            else {
                ic.hlUpdateCls.updateHlAll();
            }

            // show selected chains in annotation window
            ic.annotationCls.showAnnoSelectedChains();

            let select = (type == 'chain') ? "select chain " + chainid : "select " + ic.resid2specCls.residueids2spec(residArray);
            me.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
        });
    }

    initCartoonSvg() { let ic = this.icn3d, me = ic.icn3dui;
       ic.resizeRatioX = 1.0;
       ic.resizeRatioY = 1.0;
       $("#" + me.svgid_ct).empty();
    }
}

export {Cartoon2d}
