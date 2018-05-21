/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// draw 2D dgm for MMDB ID
// Used as a reference the work at 2016 ISMB hackathon: https://github.com/NCBI-Hackathons/3D_2D_Rep_Structure
// bUpdate: redraw 2Ddiagramfor the displayed structure
iCn3DUI.prototype.draw2Ddgm = function(data, mmdbid, structureIndex, bUpdate) { var me = this;
    // only show the 2D diagrams for displayed structures

    // reduce the size from 300 to 150
    var factor = 0.5;

    // set molid2chain
    var molid2chain = {}, molid2color = {}, molid2name = {}, chainid2molid = {};
    var chainNameHash = {};

    if(data === undefined) return '';

    for(var molid in data.moleculeInfor) {
          var color = '#' + ( '000000' + data.moleculeInfor[molid].color.toString( 16 ) ).slice( - 6 );
          var chainName = data.moleculeInfor[molid].chain.trim();
          if(chainNameHash[chainName] === undefined) {
              chainNameHash[chainName] = 1;
          }
          else {
              ++chainNameHash[chainName];
          }

          var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
          var chainid = mmdbid + '_' + chainNameFinal;

          molid2chain[molid] = chainid;
          molid2color[molid] = color;
          molid2name[molid] = data.moleculeInfor[molid].name;

          chainid2molid[chainid] = molid;
    }

    // save the interacting residues
    if(bUpdate === undefined || !bUpdate) {
        for(var i = 0, il = data['intracResidues'].length; i < il; ++i) {
            var pair = data['intracResidues'][i];

            var index = 0;
            var chainid1, chainid2;

            for(var molid in pair) {
                //molid = parseInt(molid);

                var chainid;

                chainid = molid2chain[molid];
                if(index === 0) {
                    chainid1 = chainid;
                }
                else {
                    chainid2 = chainid;
                }

                ++index;
            }

            index = 0;
            for(var molid in pair) {
                var resArray = pair[molid];

                var fisrtChainid, secondChainid;
                if(index === 0) {
                    fisrtChainid = chainid1;
                    secondChainid = chainid2;
                }
                else {
                    fisrtChainid = chainid2;
                    secondChainid = chainid1;
                }

                if(me.chainids2resids[fisrtChainid] === undefined) {
                    me.chainids2resids[fisrtChainid] = {};
                }

                if(me.chainids2resids[fisrtChainid][secondChainid] === undefined) {
                    me.chainids2resids[fisrtChainid][secondChainid] = [];
                }

                for(var j = 0, jl = resArray.length; j < jl; ++j) {
                    var res = resArray[j];
                    var resid = me.mmdbMolidResid2mmdbChainResi[mmdbid.toUpperCase() + '_' + molid + '_' + res];

                    me.chainids2resids[fisrtChainid][secondChainid].push(resid);
                }

                // update me.chainname2residues
                if(me.chainname2residues === undefined) me.chainname2residues = {};

                var chainid2 = secondChainid;

                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.chains[chainid2]);
                //if(me.chainname2residues[chainid2] === undefined) me.chainname2residues[chainid2] = {};

                var type2;
                if(me.icn3d.chemicals.hasOwnProperty(atom2.serial)) { // 1. chemical interacting with proteins
                    type2 = 'chemical';
                }
                else if(me.icn3d.nucleotides.hasOwnProperty(atom2.serial)) { // 2. DNA interacting with proteins
                    type2 = 'nucleotide';
                }
                else if(me.icn3d.ions.hasOwnProperty(atom2.serial)) { // 3. ions interacting with proteins
                    type2 = 'ion';
                }
                else if(me.icn3d.proteins.hasOwnProperty(atom2.serial)) { // 4. protein interacting with proteins
                    type2 = 'protein';
                }

                var name = chainid2.substr(chainid2.indexOf('_') + 1) + " (" + type2 + ")";

                if(me.chainname2residues[fisrtChainid] === undefined) me.chainname2residues[fisrtChainid] = {};

                me.chainname2residues[fisrtChainid][name] = me.chainids2resids[fisrtChainid][secondChainid];


                ++index;
            }
        }
    }

    var html = "<div id='#" + me.pre + mmdbid + "'>";

    html += "<b>" + mmdbid.toUpperCase() + "</b><br/>";

    html += "<svg viewBox='0,0,150,150'>";
    var strokecolor = '#000000';
    var strokewidth = '1';
    var linestrokewidth = '2';
    var textcolor = '#000000';
    var fontsize = '10';
    var smallfontsize = '8';
    var adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

    var posHash = {};
    var lines = [];

    var nodeHtml = "";

    var alignedAtomArray = [];

    var displayedMolids = {};
    if(bUpdate !== undefined && bUpdate) {
        // get all displayed chains
        for(var i in me.icn3d.dAtoms) {
            var atom = me.icn3d.atoms[i];
            var chainid = atom.structure + '_' + atom.chain;
            var molid = chainid2molid[chainid];

            displayedMolids[molid] = 1;
        }
    }

    for(var molid in data.intrac) {
        // if redraw2d diagram and the molid is not displayed, skip
        if(bUpdate !== undefined && bUpdate && !displayedMolids.hasOwnProperty(molid)) continue;

        var dgm = data.intrac[molid];
        var color = "#FFFFFF";
        var oricolor = molid2color[molid];
        var alignNum = "";
        if(structureIndex !== undefined && structureIndex === 0) {
            if(me.alignmolid2color !== undefined && me.alignmolid2color[0].hasOwnProperty(molid)) {
                //color = me.alignmolid2color[0][molid];
                alignNum = me.alignmolid2color[0][molid];
                oricolor = "#FF0000";
            }
            else {
                oricolor = "#FFFFFF";
            }
        }
        else if(structureIndex !== undefined && structureIndex === 1) {
            if(me.alignmolid2color !== undefined && me.alignmolid2color[1].hasOwnProperty(molid)) {
                //color = me.alignmolid2color[1][molid];
                alignNum = me.alignmolid2color[1][molid];
                oricolor = "#FF0000";
            }
            else {
                oricolor = "#FFFFFF";
            }
        }

        var chainid;

        chainid = molid2chain[molid];

        var chainname = molid2name[molid];

        var chain = ' ', oriChain = ' ';
        if(chainid !== undefined) {
            var pos = chainid.indexOf('_');
            oriChain = chainid.substr(pos + 1);

            if(oriChain.length > 1) {
                chain = oriChain.substr(0, 1) + '..';
            }
            else {
                chain = oriChain;
            }
        }
        else {
            chainid = 'Misc';
        }

        if(oricolor === undefined) {
            oricolor = '#FFFFFF';
        }

        for(var i = 0, il = dgm.intrac.length; i < il; ++i) {
            lines.push([molid, dgm.intrac[i] ]);
        }

        var ratio = 1.0;
        if(me.icn3d.alnChains[chainid] !== undefined) {
            //ratio = 1.0 * Object.keys(me.icn3d.alnChains[chainid]).length / Object.keys(me.icn3d.chains[chainid]).length;
            var alignedAtomCnt = 0;
            for(var i in me.icn3d.alnChains[chainid]) {
                var colorStr = me.icn3d.atoms[i].color.getHexString().toUpperCase();
                if(colorStr === 'FF0000' || colorStr === '00FF00') {
                    ++alignedAtomCnt;
                }
            }
            ratio = 1.0 * alignedAtomCnt / Object.keys(me.icn3d.chains[chainid]).length;
        }
        if(ratio < 0.2) ratio = 0.2;

        if(dgm.shape === 'rect') {
            var x = dgm.coords[0] * factor;
            var y = dgm.coords[1] * factor;
            var width = dgm.coords[2] * factor - x;
            var height = dgm.coords[3] * factor - y;

            nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
            nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
            // place holder
            nodeHtml += "<rect class='icn3d-basenode' x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";
            // highlight
            nodeHtml += "<rect class='icn3d-hlnode' x='" + (x + width / 2.0 * (1 - ratio)).toString() + "' y='" + (y + height / 2.0 * (1 - ratio)).toString() + "' width='" + (width * ratio).toString() + "' height='" + (height * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

            nodeHtml += "<text x='" + (x + width / 2 - adjustx).toString() + "' y='" + (y + height / 2 + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

            if(alignNum !== "") nodeHtml += "<text x='" + (x + width / 2 - adjustx).toString() + "' y='" + (y + height + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

            nodeHtml += "</g>";

            posHash[molid] = [x + width/2, y + height/2];
        }
        else if(dgm.shape === 'circle') {
            var x = dgm.coords[0] * factor;
            var y = dgm.coords[1] * factor;
            var r = dgm.coords[2] * factor;

            nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
            nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
            nodeHtml += "<circle class='icn3d-basenode' cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' class='icn3d-node' chainid='" + chainid + "' />";

            nodeHtml += "<circle class='icn3d-hlnode' cx='" + x + "' cy='" + y + "' r='" + (r * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

            nodeHtml += "<text x='" + (x - adjustx).toString() + "' y='" + (y + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

            if(alignNum !== "") nodeHtml += "<text x='" + (x - adjustx).toString() + "' y='" + (y + r + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

            nodeHtml += "</g>";

            posHash[molid] = [x, y];
        }
        else if(dgm.shape === 'poly') {
            var x0 = dgm.coords[0] * factor;
            var y0 = dgm.coords[1] * factor;
            var x1 = dgm.coords[2] * factor;
            var y1 = dgm.coords[3] * factor;
            var x2 = dgm.coords[4] * factor;
            var y2 = dgm.coords[5] * factor;
            var x3 = dgm.coords[6] * factor;
            var y3 = dgm.coords[7] * factor;

            var x = x0, y = y1;


            nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
            nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
            nodeHtml += "<polygon class='icn3d-basenode' points='" + x0 + ", " + y0 + "," + x1 + ", " + y1 + "," + x2 + ", " + y2 + "," + x3 + ", " + y3 + "' x0='" + x0 + "' y0='" + y0 + "' x1='" + x1 + "' y1='" + y1 + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

            nodeHtml += "<polygon class='icn3d-hlnode' points='" + x0 + ", " + (y+(y0-y)*ratio).toString() + "," + (x+(x1-x)*ratio).toString() + ", " + y1 + "," + x0 + ", " + (y-(y0-y)*ratio).toString() + "," + (x-(x1-x)*ratio).toString() + ", " + y1 + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

            nodeHtml += "<text x='" + (x0 + smalladjustx).toString() + "' y='" + (y1 + smalladjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + smallfontsize + "; text-anchor:middle' >" + chain + "</text>";

            if(alignNum !== "") nodeHtml += "<text x='" + (x0 + smalladjustx).toString() + "' y='" + (y0 + smalladjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

            nodeHtml += "</g>";

            posHash[molid] = [x0, y1];
        }
    }

    for(var i = 0, il = lines.length; i < il; ++i) {
        var pair = lines[i];

        // if redraw2d diagram and the molid is not displayed, skip
        if(bUpdate !== undefined && bUpdate && (!displayedMolids.hasOwnProperty(pair[0]) || !displayedMolids.hasOwnProperty(pair[1])) ) continue;

        var node1 = posHash[parseInt(pair[0])];
        var node2 = posHash[parseInt(pair[1])];

        if(node1 === undefined || node2 === undefined) continue;

        var chainid1, chainid2;

        chainid1 = molid2chain[pair[0]];
        chainid2 = molid2chain[pair[1]];

        var pos1 = chainid1.indexOf('_');
        var pos2 = chainid2.indexOf('_');

        var chain1 = chainid1.substr(pos1 + 1);
        var chain2 = chainid2.substr(pos2 + 1);

        var x1 = node1[0], y1 = node1[1], x2 = node2[0], y2 = node2[1], xMiddle = (x1 + x2) * 0.5, yMiddle = (y1 + y2) * 0.5;

        //if(me.icn3d.bSSOnly) { // the condensed view with only secondary structure information
        //    html += "<g chainid1='" + chainid1 + "' chainid2='" + chainid2 + "' >";
        //    html += "<title>Interactions NOT shown in the condensed view</title>";
        //    html += "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        //}
        //else {
            html += "<g class='icn3d-interaction' chainid1='" + chainid1 + "' chainid2='" + chainid2 + "' >";
            html += "<title>Interaction of chain " + chain1 + " with chain " + chain2 + "</title>";
            html += "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + xMiddle + "' y2='" + yMiddle + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";

            html += "<g class='icn3d-interaction' chainid1='" + chainid2 + "' chainid2='" + chainid1 + "' >";
            html += "<title>Interaction of chain " + chain2 + " with chain " + chain1 + "</title>";
            html += "<line x1='" + xMiddle + "' y1='" + yMiddle + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        //}
    }

    html += nodeHtml;

    html += "</svg>";
    html += "</div>";

    me.html2ddgm += html;

    $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);

    return html;
};

iCn3DUI.prototype.set2DdgmNote = function(bAlign) { var me = this;
    var html = "<div style='width:150px'><b>Nodes</b>:<br>";
    //html += "<span style='margin-right:18px;'>&#9675;</span>Protein<br>";
    //html += "<span style='margin-right:18px;'>&#9633;</span>Nucleotide<br>";
    //html += "<span style='margin-right:18px;'>&#9671;</span>Chemical<br>";

    html += "<span style='margin-right:18px;'>&#9711;</span>Protein<br>";
    html += "<span style='margin-right:18px;'>&#9633;</span>Nucleotide<br>";
    html += "<span style='margin-right:18px;'>&#9674;</span>Chemical<br>";

    html += "<b>Lines</b>:<br> Interactions at 4 &#197;<br>"
    if(bAlign !== undefined && bAlign) html += "<b>Numbers in red</b>:<br> Aligned chains"
    html += "</div><br/>";

    return html;
};

iCn3DUI.prototype.highlightNode = function(type, highlight, base, ratio) { var me = this;
    if(ratio < 0.2) ratio = 0.2;
    var strokeWidth = 3; // default 1

    if(type === 'rect') {
        $(highlight).attr('stroke', me.ORANGE);
        $(highlight).attr('stroke-width', strokeWidth);

        var x = Number($(base).attr('x'));
        var y = Number($(base).attr('y'));
        var width = Number($(base).attr('width'));
        var height = Number($(base).attr('height'));
        $(highlight).attr('x', x + width / 2.0 * (1 - ratio));
        $(highlight).attr('y', y + height / 2.0 * (1 - ratio));
        $(highlight).attr('width', width * ratio);
        $(highlight).attr('height', height * ratio);
    }
    else if(type === 'circle') {
        $(highlight).attr('stroke', me.ORANGE);
        $(highlight).attr('stroke-width', strokeWidth);

        $(highlight).attr('r', Number($(base).attr('r')) * ratio);
    }
    else if(type === 'polygon') {
        $(highlight).attr('stroke', me.ORANGE);
        $(highlight).attr('stroke-width', strokeWidth);

        var x = Number($(base).attr('x0'));
        var y = Number($(base).attr('y1'));
        var x0 = Number($(base).attr('x0'));
        var y0 = Number($(base).attr('y0'));
        var x1 = Number($(base).attr('x1'));
        var y1 = Number($(base).attr('y1'));
        $(highlight).attr('points', x0 + ", " + (y+(y0-y)*ratio).toString() + ", " + (x+(x1-x)*ratio).toString() + ", " + y1 + ", " + x0 + ", " + (y-(y0-y)*ratio).toString() + ", " + (x-(x1-x)*ratio).toString() + ", " + y1);
    }
};

iCn3DUI.prototype.click2Ddgm = function() { var me = this;
    $("#" + me.pre + "dl_2ddgm").on("click", ".icn3d-node", function(e) {
          e.stopImmediatePropagation();
        if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.atoms).length) me.setMode('selection');

        me.bClickInteraction = false;

        var chainid = $(this).attr('chainid');

        // clear all nodes
        if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
            me.removeSelection();

            // me.lineArray2d is used to highlight lines in 2D diagram
            me.lineArray2d = [];
        }

        //$(this).find('rect').attr('stroke', me.ORANGE);
        //$(this).find('circle').attr('stroke', me.ORANGE);
        //$(this).find('polygon').attr('stroke', me.ORANGE);

        var ratio = 1.0;
        if(me.icn3d.alnChains[chainid] !== undefined) ratio = 1.0 * Object.keys(me.icn3d.alnChains[chainid]).length / Object.keys(me.icn3d.chains[chainid]).length;

        var target = $(this).find("rect[class='icn3d-hlnode']");
        var base = $(this).find("rect[class='icn3d-basenode']");
        me.highlightNode('rect', target, base, ratio);

        target = $(this).find("circle[class='icn3d-hlnode']");
        base = $(this).find("circle[class='icn3d-basenode']");
        me.highlightNode('circle', target, base, ratio);

        target = $(this).find("polygon[class='icn3d-hlnode']");
        base = $(this).find("polygon[class='icn3d-basenode']");
        me.highlightNode('polygon', target, base, ratio);

        if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
            me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.chains[chainid]);
        }
        else {
            me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[chainid]);
        }

/*
        // highlight on 3D structure
        me.icn3d.removeHlObjects();

        me.icn3d.addHlObjects();

        // highlight on 2D diagram
        if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
            me.chainArray2d = [chainid];
        }
        else {
            if(me.chainArray2d === undefined) me.chainArray2d = [];
            me.chainArray2d.push(chainid);
        }

        // highlight residues in annotation window and alignment window
        var residueArray = [];
        for(var i = 0, il = me.chainArray2d.length; i < il; ++i) {
            var chainid = me.chainArray2d[i];
            for(var j = 0, jl = me.icn3d.chainsSeq[chainid].length; j < jl; ++j) {
                residueArray.push(chainid + '_' + me.icn3d.chainsSeq[chainid][j].resi);
            }
        }

        me.hlSeq(residueArray);
*/

        // get the name array
        if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
            me.chainArray2d = [chainid];
        }
        else {
            if(me.chainArray2d === undefined) me.chainArray2d = [];
            me.chainArray2d.push(chainid);
        }

        me.updateHlAll(me.chainArray2d);

        // show selected chains in annotation window
        me.showAnnoSelectedChains();

        var select = "select chain " + chainid;
        me.setLogCmd(select, true);

        me.bSelectResidue = false;
    });

    $("#" + me.pre + "dl_2ddgm").on("click", ".icn3d-interaction", function(e) {
          e.stopImmediatePropagation();
        if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.atoms).length) me.setMode('selection');

        // clear all nodes
        //if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
        //    me.removeSelection();
        //}

        me.bClickInteraction = true;

        var chainid1 = $(this).attr('chainid1');
        var chainid2 = $(this).attr('chainid2');

        $(this).find('line').attr('stroke', me.ORANGE);

        // interaction of chain1 with chain2, only show the part of chain1 interacting with chain2
        me.selectInteraction(chainid1, chainid2);

        // show selected chains in annotation window
        me.showAnnoSelectedChains();

        var select = "select interaction " + chainid1 + "," + chainid2;
        me.setLogCmd(select, true);

        me.bClickInteraction = false;
    });
};

iCn3DUI.prototype.selectInteraction = function (chainid1, chainid2) {   var me = this;
        me.removeHl2D();
        me.icn3d.removeHlObjects();

        if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
            // me.lineArray2d is used to highlight lines in 2D diagram
            me.lineArray2d = [chainid1, chainid2];
        }
        else {
            if(me.lineArray2d === undefined) me.lineArray2d = [];
            me.lineArray2d.push(chainid1);
            me.lineArray2d.push(chainid2);
        }

        me.selectInteractionAtoms(chainid1, chainid2);

        me.icn3d.addHlObjects();

        me.updateHlAll();
};

iCn3DUI.prototype.selectInteractionAtoms = function (chainid1, chainid2) {   var me = this; // me.icn3d.pAtom is set already
    var radius = 4;

    // method 2. Retrieved from the cgi (This previously had problems in sharelink where the data from ajax is async. Now the data is from the same cgi as the atom data and there is no problem.)
    var residueArray = me.chainids2resids[chainid1][chainid2];

    if(!me.icn3d.bCtrl && !me.icn3d.bShift) me.icn3d.hAtoms = {};

    for(var i = 0, il = residueArray.length; i < il; ++i) {
        me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[residueArray[i]]);
    }

    var commandname, commanddesc;
    if(Object.keys(me.icn3d.structures).length > 1) {
        commandname = "inter_" + chainid1 + "_" + chainid2;
    }
    else {
        var pos1 = chainid1.indexOf('_');
        var pos2 = chainid2.indexOf('_');

        commandname = "inter_" + chainid1.substr(pos1 + 1) + "_" + chainid2.substr(pos2 + 1);
    }

    commanddesc = "select the atoms in chain " + chainid1 + " interacting with chain " + chainid2 + " in a distance of " + radius + " angstrom";

    var select = "select interaction " + chainid1 + "," + chainid2;

    me.addCustomSelection(residueArray, commandname, commanddesc, select, true);

    var nameArray = [commandname];
};



