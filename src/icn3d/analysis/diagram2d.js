/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class Diagram2d {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // draw 2D dgm for MMDB ID
    // Used as a reference the work at 2016 ISMB hackathon: https://github.com/NCBI-Hackathons/3D_2D_Rep_Structure
    // bUpdate: redraw 2Ddiagramfor the displayed structure
    draw2Ddgm(data, mmdbid, structureIndex, bUpdate) { let ic = this.icn3d, me = ic.icn3dui;
        // only show the 2D diagrams for displayed structures

///        mmdbid = mmdbid.substr(0, 4);

        // reduce the size from 300 to 200 (150)
        let factor = 0.667;

        // set molid2chain
        let molid2chain = {}, molid2color = {}, molid2name = {}, chainid2molid = {}
        let chainNameHash = {}

        if(data === undefined) return '';

        for(let molid in data.moleculeInfor) {
              let color = '#' +( '000000' + data.moleculeInfor[molid].color.toString( 16 ) ).slice( - 6 );
              let chainName = data.moleculeInfor[molid].chain.trim();
              if(chainNameHash[chainName] === undefined) {
                  chainNameHash[chainName] = 1;
              }
              else {
                  ++chainNameHash[chainName];
              }

              let chainNameFinal =(chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
              let chainid = mmdbid + '_' + chainNameFinal;
              if(ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t && structureIndex === 0) {
                  //chainid = mmdbid + me.htmlCls.postfix + '_' + chainNameFinal;
              }

              molid2chain[molid] = chainid;
              molid2color[molid] = color;
              molid2name[molid] = data.moleculeInfor[molid].name;

              chainid2molid[chainid] = molid;
        }

        // save the interacting residues
        if(bUpdate === undefined || !bUpdate) {
            for(let i = 0, il = data['intracResidues'].length; i < il; ++i) {
                let pair = data['intracResidues'][i];

                let index = 0;
                let chainid1, chainid2;

                for(let molid in pair) {
                    //molid = parseInt(molid);

                    let chainid;

                    chainid = molid2chain[molid];
                    if(index === 0) {
                        chainid1 = chainid;
                    }
                    else {
                        chainid2 = chainid;
                    }

                    ++index;
                }

                if(chainid1 === undefined || chainid2 === undefined) continue;

                index = 0;
                for(let molid in pair) {
                    let resArray = pair[molid];

                    let fisrtChainid, secondChainid;
                    if(index === 0) {
                        fisrtChainid = chainid1;
                        secondChainid = chainid2;
                    }
                    else {
                        fisrtChainid = chainid2;
                        secondChainid = chainid1;
                    }

                    if(ic.chainids2resids[fisrtChainid] === undefined) {
                        ic.chainids2resids[fisrtChainid] = {}
                    }

                    if(ic.chainids2resids[fisrtChainid][secondChainid] === undefined) {
                        ic.chainids2resids[fisrtChainid][secondChainid] = [];
                    }

                    for(let j = 0, jl = resArray.length; j < jl; ++j) {
                        let res = resArray[j];
                        let resid = ic.mmdbMolidResid2mmdbChainResi[mmdbid.toUpperCase() + '_' + molid + '_' + res];

                        ic.chainids2resids[fisrtChainid][secondChainid].push(resid);
                    }

                    // update ic.chainname2residues
                    if(ic.chainname2residues === undefined) ic.chainname2residues = {}

                    chainid2 = secondChainid;

                    if(!ic.chains.hasOwnProperty(chainid2)) continue;

                    let atom2 = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainid2]);
                    //if(ic.chainname2residues[chainid2] === undefined) ic.chainname2residues[chainid2] = {}

                    let type2;
                    if(ic.chemicals.hasOwnProperty(atom2.serial)) { // 1. chemical interacting with proteins
                        type2 = 'chemical';
                    }
                    else if(ic.nucleotides.hasOwnProperty(atom2.serial)) { // 2. DNA interacting with proteins
                        type2 = 'nucleotide';
                    }
                    else if(ic.ions.hasOwnProperty(atom2.serial)) { // 3. ions interacting with proteins
                        type2 = 'ion';
                    }
                    else if(ic.proteins.hasOwnProperty(atom2.serial)) { // 4. protein interacting with proteins
                        type2 = 'protein';
                    }
                    else if(ic.water.hasOwnProperty(atom2.serial)) { // 5. water interacting with proteins
                        type2 = 'water';
                    }

                    let name = chainid2.substr(chainid2.indexOf('_') + 1) + "(" + type2 + ")";

                    if(ic.chainname2residues[fisrtChainid] === undefined) ic.chainname2residues[fisrtChainid] = {}

                    ic.chainname2residues[fisrtChainid][name] = ic.chainids2resids[fisrtChainid][secondChainid];


                    ++index;
                }
            }
        }

        let html = "<div id='#" + ic.pre + mmdbid + "'>";

        html += "<b>" + mmdbid.toUpperCase() + "</b><br/>";

        html += "<svg viewBox='0,0," + me.htmlCls.width2d + "," + me.htmlCls.width2d + "'>";
        let strokecolor = '#000000';
        let strokewidth = '1';
        let linestrokewidth = '2';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let posHash = {}
        let lines = [];

        let nodeHtml = "", chemNodeHtml = "";

        let alignedAtomArray = [];

        let displayedMolids = {}
        if(bUpdate) {
            // get all displayed chains
            for(let i in ic.dAtoms) {
                let atom = ic.atoms[i];
                let chainid = atom.structure + '_' + atom.chain;
                let molid = chainid2molid[chainid];

                displayedMolids[molid] = 1;
            }
        }

        let allMolidArray = Object.keys(data.moleculeInfor);
        let intracMolidArray = Object.keys(data.intrac);

        let missingMolidArray = [];
        for(let i = 0, il = allMolidArray.length; i < il; ++i) {
            if(intracMolidArray.indexOf(allMolidArray[i]) === -1) missingMolidArray.push(allMolidArray[i]);
        }

        let missingMolid2intrac = {} // biopolymer

        if(missingMolidArray.length > 0) {
            for(let molid in data.intrac) {
                let dgm = data.intrac[molid];
                for(let i = 0, il = dgm.intrac.length; i < il; ++i) {
                    let intracMolid = dgm.intrac[i].toString();
                    if(missingMolidArray.indexOf(intracMolid) !== -1) {
                        if(missingMolid2intrac[intracMolid] === undefined) missingMolid2intrac[intracMolid] = [];
                        missingMolid2intrac[intracMolid].push(molid);
                        lines.push([intracMolid, molid]);
                    }
                }

                if(dgm.shape === 'rect') {
                    let x = dgm.coords[0] * factor;
                    let y = dgm.coords[1] * factor;
                    let width = dgm.coords[2] * factor - x;
                    let height = dgm.coords[3] * factor - y;

                    posHash[molid] = [x + width/2, y + height/2];
                }
                else if(dgm.shape === 'circle') {
                    let x = dgm.coords[0] * factor;
                    let y = dgm.coords[1] * factor;
                    let r = dgm.coords[2] * factor;

                    posHash[molid] = [x, y];
                }
                else if(dgm.shape === 'poly') {
                    let x0 = dgm.coords[0] * factor;
                    let y0 = dgm.coords[1] * factor;
                    let x1 = dgm.coords[2] * factor;
                    let y1 = dgm.coords[3] * factor;
                    let x2 = dgm.coords[4] * factor;
                    let y2 = dgm.coords[5] * factor;
                    let x3 = dgm.coords[6] * factor;
                    let y3 = dgm.coords[7] * factor;

                    let x = x0, y = y1;

                    posHash[molid] = [x0, y1];
                }
            }
        }

        let cntNointeraction = 0;
        //for(let molid in data.intrac) {
        for(let index = 0, indexl = allMolidArray.length; index < indexl; ++index) {
            let molid = allMolidArray[index];

            let chainid = molid2chain[molid];

            // if redraw2d diagram and the molid is not displayed, skip
            if(bUpdate && !displayedMolids.hasOwnProperty(molid)) continue;

            let dgm = data.intrac[molid];
            let color = "#FFFFFF";
            let oricolor = molid2color[molid];
            if(chainid !== undefined && ic.chains[chainid] !== undefined) {
                let atomArray = Object.keys(ic.chains[chainid]);
                if(atomArray.length > 0) {
                    oricolor = "#" + ic.atoms[atomArray[0]].color.getHexString().toUpperCase();
                }
            }

            let alignNum = "";
            if(ic.bInitial && structureIndex !== undefined) {
                if(ic.alignmolid2color !== undefined && ic.alignmolid2color[structureIndex].hasOwnProperty(molid)) {
                    alignNum = ic.alignmolid2color[structureIndex][molid];
                    oricolor = "#FF0000";
                }
                else {
                    oricolor = "#FFFFFF";
                }
            }

            let chainname = molid2name[molid];

            let chain = ' ', oriChain = ' ';
            if(chainid !== undefined) {
                let pos = chainid.indexOf('_');
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

            let ratio = 1.0;
            if(ic.bInitial && ic.alnChains[chainid] !== undefined) {
                //ratio = 1.0 * Object.keys(ic.alnChains[chainid]).length / Object.keys(ic.chains[chainid]).length;
                let alignedAtomCnt = 0;
                for(let i in ic.alnChains[chainid]) {
                    let colorStr = ic.atoms[i].color.getHexString().toUpperCase();
                    if(colorStr === 'FF0000' || colorStr === '00FF00') {
                        ++alignedAtomCnt;
                    }
                }
                ratio = 1.0 * alignedAtomCnt / Object.keys(ic.chains[chainid]).length;
            }
            if(ratio < 0.2) ratio = 0.2;

            if(missingMolidArray.indexOf(molid) === -1) {
                for(let i = 0, il = dgm.intrac.length; i < il; ++i) {
                    // show the interactin line once
                    if(parseInt(molid) < parseInt(dgm.intrac[i])) lines.push([molid, dgm.intrac[i] ]);
                }

                if(dgm.shape === 'rect') {
                    let x = dgm.coords[0] * factor;
                    let y = dgm.coords[1] * factor;
                    let width = dgm.coords[2] * factor - x;
                    let height = dgm.coords[3] * factor - y;

                    nodeHtml += this.draw2DNucleotide(x + 0.5 * width, y + 0.5 * height, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio);

                    posHash[molid] = [x + width/2, y + height/2];
                }
                else if(dgm.shape === 'circle') {
                    let x = dgm.coords[0] * factor;
                    let y = dgm.coords[1] * factor;

                    nodeHtml += this.draw2DProtein(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio);

                    posHash[molid] = [x, y];
                }
                else if(dgm.shape === 'poly') {
                  let x0 = dgm.coords[0] * factor;
                  let y0 = dgm.coords[1] * factor;
                  let x1 = dgm.coords[2] * factor;
                  let y1 = dgm.coords[3] * factor;
                  let x2 = dgm.coords[4] * factor;
                  let y2 = dgm.coords[5] * factor;
                  let x3 = dgm.coords[6] * factor;
                  let y3 = dgm.coords[7] * factor;

                  let x = x0, y = y1;

                  let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]);

                  chemNodeHtml += this.draw2DChemical(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio);

                  posHash[molid] = [x0, y1];
                }
            }
            else { // missing biopolymer
                // max x and y value: 300
                let maxSize = 300;
                let step = 50;

                let xCenter, yCenter;
                if(missingMolid2intrac[molid] !== undefined && missingMolid2intrac[molid].length > 1) { // has interactions
                    // find its position
                    let xSum = 0, ySum = 0;

                    for(let j = 0, jl = missingMolid2intrac[molid].length; j < jl; ++j) {
                        let intracMolid = missingMolid2intrac[molid][j];
                        if(posHash.hasOwnProperty(intracMolid)) {
                            let node = posHash[intracMolid];
                            xSum += node[0];
                            ySum += node[1];
                        }
                    }

                    xCenter = xSum / missingMolid2intrac[molid].length;
                    yCenter = ySum / missingMolid2intrac[molid].length;
                }
                else { // has NO interactions or just one interaction
                    let nSteps = maxSize / step;

                    if(cntNointeraction < nSteps - 1) {
                        xCenter =(cntNointeraction + 1) * step * factor;
                        yCenter = 0.1 * maxSize * factor;
                    }
                    else if(cntNointeraction -(nSteps - 1) < nSteps - 1) {
                        xCenter = 0.1 * maxSize * factor;
                        yCenter =(cntNointeraction -(nSteps - 1) + 1) * step * factor;
                    }
                    else {
                        xCenter = 0.25 * maxSize * factor;
                        yCenter = xCenter;
                    }

                    ++cntNointeraction;

                }

                let x = xCenter, y = yCenter;

                let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainid]);

                let bBiopolymer = true;
                chemNodeHtml += this.draw2DChemical(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio, bBiopolymer);

                posHash[molid] = [x, y];
            }
        }

        for(let i = 0, il = lines.length; i < il; ++i) {
            let pair = lines[i];

            // if redraw2d diagram and the molid is not displayed, skip
            if(bUpdate &&(!displayedMolids.hasOwnProperty(pair[0]) || !displayedMolids.hasOwnProperty(pair[1])) ) continue;

            let node1 = posHash[parseInt(pair[0])];
            let node2 = posHash[parseInt(pair[1])];

            if(node1 === undefined || node2 === undefined) continue;

            let chainid1, chainid2;

            chainid1 = molid2chain[pair[0]];
            chainid2 = molid2chain[pair[1]];

            let pos1 = chainid1.indexOf('_');
            let pos2 = chainid2.indexOf('_');

            let chain1 = chainid1.substr(pos1 + 1);
            let chain2 = chainid2.substr(pos2 + 1);

            let x1 = node1[0], y1 = node1[1], x2 = node2[0], y2 = node2[1], xMiddle =(x1 + x2) * 0.5, yMiddle =(y1 + y2) * 0.5;

            html += "<g class='icn3d-interaction' chainid1='" + chainid1 + "' chainid2='" + chainid2 + "' >";
            html += "<title>Interaction of chain " + chain1 + " with chain " + chain2 + "</title>";
            html += "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + xMiddle + "' y2='" + yMiddle + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";

            html += "<g class='icn3d-interaction' chainid1='" + chainid2 + "' chainid2='" + chainid1 + "' >";
            html += "<title>Interaction of chain " + chain2 + " with chain " + chain1 + "</title>";
            html += "<line x1='" + xMiddle + "' y1='" + yMiddle + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        }

        html += chemNodeHtml + nodeHtml; // draw chemicals at the bottom layer

        html += "</svg>";
        html += "</div>";

        ic.html2ddgm += html;

        $("#" + ic.pre + "dl_2ddgm_html").html(ic.html2ddgm);

        return html;
    }

    set2DdgmNote(bAlign) { let ic = this.icn3d, me = ic.icn3dui;
        let html = "<div style='width:150px'><b>Nodes</b>:<br>";

        if(me.utilsCls.isMac()) {
            html += "<span style='margin-right:18px;'>&#9711;</span>Protein<br>";
            html += "<span style='margin-right:18px;'>&#9634;</span>Nucleotide<br>";
            html += "<span style='margin-right:18px;'>&#9826;</span>Chemical<br>";
            html += "<span style='margin-right:18px;display: inline-block;transform: skew(-25deg);'>&#9634;</span>Biopolymer<br>";
        }
        else {
            html += "<span style='margin-right:18px;'>O</span>Protein<br>";
            html += "<span style='margin-right:18px;'>&#9634;</span>Nucleotide<br>";
            html += "<span style='margin-right:18px;'>&#9671;</span>Chemical<br>";
            html += "<span style='margin-right:18px;display: inline-block;transform: skew(-25deg);'>&#9634;</span>Biopolymer<br>";
        }

        html += "<br><b>Lines</b>:<br> Interactions at 4 &#197;<br>"
        if(bAlign) html += "<b>Numbers in red</b>:<br> Aligned chains"
        html += "</div><br/>";

        return html;
    }

    highlightNode(type, highlight, base, ratio) { let ic = this.icn3d, me = ic.icn3dui;
        if(ratio < 0.2) ratio = 0.2;
        let strokeWidth = 3; // default 1

        if(type === 'rect') {
            $(highlight).attr('stroke', me.htmlCls.ORANGE);
            $(highlight).attr('stroke-width', strokeWidth);

            let x = Number($(base).attr('x'));
            let y = Number($(base).attr('y'));
            let width = Number($(base).attr('width'));
            let height = Number($(base).attr('height'));
            $(highlight).attr('x', x + width / 2.0 *(1 - ratio));
            $(highlight).attr('y', y + height / 2.0 *(1 - ratio));
            $(highlight).attr('width', width * ratio);
            $(highlight).attr('height', height * ratio);
        }
        else if(type === 'circle') {
            $(highlight).attr('stroke', me.htmlCls.ORANGE);
            $(highlight).attr('stroke-width', strokeWidth);

            $(highlight).attr('r', Number($(base).attr('r')) * ratio);
        }
        else if(type === 'polygon') {
            $(highlight).attr('stroke', me.htmlCls.ORANGE);
            $(highlight).attr('stroke-width', strokeWidth);

            let x = Number($(base).attr('x'));
            let y = Number($(base).attr('y'));

            let x0diff = Number($(base).attr('x0d'));
            let y0diff = Number($(base).attr('y0d'));
            let x1diff = Number($(base).attr('x1d'));
            let y1diff = Number($(base).attr('y1d'));
            let x2diff = Number($(base).attr('x2d'));
            let y2diff = Number($(base).attr('y2d'));
            let x3diff = Number($(base).attr('x3d'));
            let y3diff = Number($(base).attr('y3d'));

            $(highlight).attr('points',(x+x0diff*ratio).toString() + ", " +(y+y0diff*ratio).toString() + ", " +(x+x1diff*ratio).toString() + ", " +(y+y1diff*ratio).toString() + ", " +(x+x2diff*ratio).toString() + ", " +(y+y2diff*ratio).toString() + ", " +(x+x3diff*ratio).toString() + ", " +(y+y3diff*ratio).toString());
        }
    }

    removeLineGraphSelection() { let ic = this.icn3d, me = ic.icn3dui;
          $("#" + ic.pre + "dl_linegraph circle").attr('stroke', '#000000');
          $("#" + ic.pre + "dl_linegraph circle").attr('stroke-width', 1);

          $("#" + ic.pre + "dl_linegraph svg line.icn3d-hlline").attr('stroke', '#FFF');
          //$("#" + ic.pre + "dl_linegraph svg line .icn3d-hlline").attr('stroke-width', 1);
    }

    removeScatterplotSelection() { let ic = this.icn3d, me = ic.icn3dui;
          $("#" + ic.pre + "dl_scatterplot circle").attr('stroke', '#000000');
          $("#" + ic.pre + "dl_scatterplot circle").attr('stroke-width', 1);

          $("#" + ic.pre + "dl_scatterplot rect").attr('stroke', '#000000');
          $("#" + ic.pre + "dl_scatterplot rect").attr('stroke-width', 1);
    }

    click2Ddgm() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //$("#" + ic.pre + "dl_2ddgm .icn3d-node", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_2ddgm .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            //ic.bClickInteraction = false;

            let chainid = $(this).attr('chainid');

            // clear all nodes
            if(!ic.bCtrl && !ic.bShift) {
                ic.selectionCls.removeSelection();

                // ic.lineArray2d is used to highlight lines in 2D diagram
                ic.lineArray2d = [];
            }

            let ratio = 1.0;
            if(ic.alnChains[chainid] !== undefined) ratio = 1.0 * Object.keys(ic.alnChains[chainid]).length / Object.keys(ic.chains[chainid]).length;

            let target = $(this).find("rect[class='icn3d-hlnode']");
            let base = $(this).find("rect[class='icn3d-basenode']");
            thisClass.highlightNode('rect', target, base, ratio);

            target = $(this).find("circle[class='icn3d-hlnode']");
            base = $(this).find("circle[class='icn3d-basenode']");
            thisClass.highlightNode('circle', target, base, ratio);

            target = $(this).find("polygon[class='icn3d-hlnode']");
            base = $(this).find("polygon[class='icn3d-basenode']");
            thisClass.highlightNode('polygon', target, base, ratio);

            if(!ic.bCtrl && !ic.bShift) {
                ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[chainid]);
            }
            else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[chainid]);
            }

            // get the name array
            if(!ic.bCtrl && !ic.bShift) {
                ic.chainArray2d = [chainid];
            }
            else {
                if(ic.chainArray2d === undefined) ic.chainArray2d = [];
                ic.chainArray2d.push(chainid);
            }

            ic.hlUpdateCls.updateHlAll(ic.chainArray2d);

            // show selected chains in annotation window
            ic.annotationCls.showAnnoSelectedChains();

            let select = "select chain " + chainid;
            me.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
        });

        //$("#" + ic.pre + "dl_2ddgm .icn3d-interaction", "click", function(e) { let ic = thisClass.icn3d;
        $(document).on("click", "#" + ic.pre + "dl_2ddgm .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            ic.bClickInteraction = true;

            let chainid1 = $(this).attr('chainid1');
            let chainid2 = $(this).attr('chainid2');

            $(this).find('line').attr('stroke', me.htmlCls.ORANGE);

            // interaction of chain1 with chain2, only show the part of chain1 interacting with chain2
            thisClass.selectInteraction(chainid1, chainid2);

            // show selected chains in annotation window
            ic.annotationCls.showAnnoSelectedChains();

            let select = "select interaction " + chainid1 + "," + chainid2;
            me.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bClickInteraction = false;
        });

        //$("#" + ic.pre + "dl_linegraph .icn3d-node", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_linegraph .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid = $(this).attr('resid');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeLineGraphSelection();
            }

            let strokeWidth = 2;
            $(this).find('circle').attr('stroke', me.htmlCls.ORANGE);
            $(this).find('circle').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

            ic.hlUpdateCls.updateHlAll();

            me.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
        });

        //$("#" + ic.pre + "dl_scatterplot .icn3d-node", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_scatterplot .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);
        });

        $(document).on("click", "#" + ic.pre + "dl_ligplot .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);
        });

        //$("#" + ic.pre + "dl_linegraph .icn3d-interaction", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_linegraph .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
              e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid1 = $(this).attr('resid1');
            let resid2 = $(this).attr('resid2');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeLineGraphSelection();
            }

            $(this).find('line.icn3d-hlline').attr('stroke', me.htmlCls.ORANGE);

            let strokeWidth = 2;
            $("[resid=" + resid1 + "]").find('circle').attr('stroke', me.htmlCls.ORANGE);
            $("[resid=" + resid1 + "]").find('circle').attr('stroke-width', strokeWidth);

            $("[resid=" + resid2 + "]").find('circle').attr('stroke', me.htmlCls.ORANGE);
            $("[resid=" + resid2 + "]").find('circle').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

            ic.hlUpdateCls.updateHlAll();

            ic.transformCls.zoominSelection();

            me.htmlCls.clickMenuCls.setLogCmd(select, true);
        });

        //$("#" + ic.pre + "dl_scatterplot .icn3d-interaction", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_scatterplot .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);
            ic.transformCls.zoominSelection();
        });

        $(document).on("click", "#" + ic.pre + "dl_contactmap .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);
        });

        $(document).on("click", "#" + ic.pre + "dl_contactmap .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);
        });

        $(document).on("click", "#" + ic.pre + "dl_alignerrormap .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);
        });

        $(document).on("click", "#" + ic.pre + "dl_ligplot .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);
        });

        $(document).on("click", "#" + ic.pre + "dl_alignerrormap .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);
        });

        $(document).on("change", "#" + me.pre + "basepairType", function(e) { let ic = thisClass.icn3d;
            let nonWC = $("#" + me.pre + "basepairType").val().join(',');

            thisClass.updateRnacanvas(nonWC);
            me.htmlCls.clickMenuCls.setLogCmd('update rnacanvas ' + nonWC, true);
        }); 

        $(document).on("from_rnacanvas", function(event, data) {
            let pos_resn = data.split('_');
            let resn = pos_resn[1];

            let resid = ic.ncbi2resid[ic.rnacanvas_chainid + '_' + pos_resn[0]];
            let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);

            if(!atom) {
                alert('This residue has no 3D coordinates...');
            }
            else {
                let oneLetterRes = me.utilsCls.residueName2Abbr(atom.resn);

                if(resn != oneLetterRes) {
                	console.log('The residue name in 2D ' + resn + ' did not match that in 3D view ' + oneLetterRes + '...');
                }
                //else {
                    // highlight the selected residue
                    if(ic.bCtrl || ic.bShift) {
                        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
                    }
                    else {
                        ic.hAtoms = ic.residues[resid];
                    }

                    ic.hlUpdateCls.showHighlight();
                //}
            }
        });

        //$("#" + me.pre + "ig2ddgmDiv").html(svgHtml);
        $(document).on("change", "#" + me.pre + "iglist", async function(e) { let ic = thisClass.icn3d;
            let igIndex_igType = $("#" + me.pre + "iglist").val().split('_');

            await thisClass.show2DdgmForIg(igIndex_igType[0], igIndex_igType[1]);

            me.htmlCls.clickMenuCls.setLogCmd('update ig ' + igIndex_igType, true);
        }); 

        // ig 2D diagram: 2D -> 3D
        $(document).on('click', '#ig2ddgmSvg .node', function(e) { let ic = thisClass.icn3d;
            // clear all node color
            thisClass.resetAllNodes('ig2ddgmSvg');

            $(this).css({'font-size': '20px', 'font-weight': 'bold'});

            //<text x="502.1" y="301.8" class="s9 c8547"><title>Ref. Num. 8547</title> N99 </text>
            let text = $(this).html().trim();
            let resnresi = text.substr(text.lastIndexOf(' ') + 1);

            let resid = ic.ncbi2resid[ic.ig2ddgm_chainid + '_' + resnresi.substr(1)];

            // highlight the selected residue
            if(ic.bCtrl || ic.bShift) {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
            }
            else {
                ic.hAtoms = ic.residues[resid];
            }

            ic.hlUpdateCls.showHighlight();
        });

        // $(document).on('mouseout', '#ig2ddgmSvg .node', function(e) { let ic = thisClass.icn3d;
        //     thisClass.resetAllNodes('ig2ddgmSvg');
        // });

        // ig 2D diagram: 3D -> 2D
        $(document).on('icn3d.pick.click icn3d.pick.mouseover', function(ev, data) { let ic = thisClass.icn3d;
            // get the residues in the selection
            let ncbiresid = data;
            let resid = ic.ncbi2resid[ncbiresid];

            if(ic.ig2ddgm_chainid && ic.resid2refnum && ic.resid2refnum[resid]) {
                let refnumLabel = ic.resid2refnum[resid];
                let refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);

                // clear all node color
                thisClass.resetAllNodes('ig2ddgmSvg');

                // highlight the residue
                $("#ig2ddgmSvg .c" + refnumStr).css({'font-size': '20px', 'font-weight': 'bold'});
            }
        });        
    }

    // reset all nodes
    resetAllNodes(id) { let ic = this.icn3d, me = ic.icn3dui;
        // Select the SVG container
        const svg = document.getElementById(id);

        // Select all text-related nodes: <text>
        const textElements = svg.querySelectorAll('text');

        textElements.forEach((node) => {
            node.style = {};
        });
    }

    clickNode(node) {  let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

        let resid = $(node).attr('resid');

        if(!ic.bCtrl && !ic.bShift) {
          ic.hAtoms = {}

          this.removeScatterplotSelection();
        }

        let strokeWidth = 2;
        $(node).find('circle').attr('stroke', me.htmlCls.ORANGE);
        $(node).find('circle').attr('stroke-width', strokeWidth);
        $(node).find('rect').attr('stroke', me.htmlCls.ORANGE);
        $(node).find('rect').attr('stroke-width', strokeWidth);

        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

        let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

        ic.hlUpdateCls.updateHlAll();

        me.htmlCls.clickMenuCls.setLogCmd(select, true);

        ic.bSelectResidue = false;
    }

    clickInteraction(node) {  let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

        let resid1 = $(node).attr('resid1');
        let resid2 = $(node).attr('resid2');

        if(!ic.bCtrl && !ic.bShift) {
          ic.hAtoms = {}

          this.removeScatterplotSelection();
        }

        let strokeWidth = 2;
        $(node).find('rect').attr('stroke', me.htmlCls.ORANGE);
        $(node).find('rect').attr('stroke-width', strokeWidth);

        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

        let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

        ic.hlUpdateCls.updateHlAll();

        me.htmlCls.clickMenuCls.setLogCmd(select, true);
    }

    selectInteraction(chainid1, chainid2) {  let ic = this.icn3d, me = ic.icn3dui;
            ic.hlUpdateCls.removeHl2D();
            ic.hlObjectsCls.removeHlObjects();

            if(!ic.bCtrl && !ic.bShift) {
                // ic.lineArray2d is used to highlight lines in 2D diagram
                ic.lineArray2d = [chainid1, chainid2];
            }
            else {
                if(ic.lineArray2d === undefined) ic.lineArray2d = [];
                ic.lineArray2d.push(chainid1);
                ic.lineArray2d.push(chainid2);
            }

            this.selectInteractionAtoms(chainid1, chainid2);

            ic.hlObjectsCls.addHlObjects();

            ic.hlUpdateCls.updateHlAll();
    }

    selectInteractionAtoms(chainid1, chainid2) {  let ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
        let radius = 4;

        // method 2. Retrieved from the cgi(This previously had problems in sharelink where the data from ajax is async. Now the data is from the same cgi as the atom data and there is no problem.)
        let residueArray = ic.chainids2resids[chainid1][chainid2];

        if(!ic.bCtrl && !ic.bShift) ic.hAtoms = {}

        for(let i = 0, il = residueArray.length; i < il; ++i) {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[residueArray[i]]);
        }

        let commandname, commanddesc;
        if(Object.keys(ic.structures).length > 1) {
            commandname = "inter_" + chainid1 + "_" + chainid2;
        }
        else {
            let pos1 = chainid1.indexOf('_');
            let pos2 = chainid2.indexOf('_');

            commandname = "inter_" + chainid1.substr(pos1 + 1) + "_" + chainid2.substr(pos2 + 1);
        }

        commanddesc = "select the atoms in chain " + chainid1 + " interacting with chain " + chainid2 + " in a distance of " + radius + " angstrom";

        let select = "select interaction " + chainid1 + "," + chainid2;

        ic.selectionCls.addCustomSelection(residueArray, commandname, commanddesc, select, true);

        let nameArray = [commandname];
    }

    draw2DProtein(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio) { let ic = this.icn3d, me = ic.icn3dui;
        let strokecolor = '#000000';
        let strokewidth = '1';
        let linestrokewidth = '2';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let r = 20 * factor;

        let html = "<g class='icn3d-node' chainid='" + chainid + "' >";
        html += "<title>Chain " + oriChain + ": " + chainname + "</title>";
        html += "<circle class='icn3d-basenode' cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' class='icn3d-node' chainid='" + chainid + "' />";

        html += "<circle class='icn3d-hlnode' cx='" + x + "' cy='" + y + "' r='" +(r * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

        html += "<text x='" +(x - adjustx).toString() + "' y='" +(y + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

        if(alignNum !== "") html += "<text x='" +(x - adjustx).toString() + "' y='" +(y + r + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

        html += "</g>";

        return html;
    }

    draw2DNucleotide(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio) { let ic = this.icn3d, me = ic.icn3dui;
        let strokecolor = '#000000';
        let strokewidth = '1';
        let linestrokewidth = '2';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let width = 30 * factor;
        let height = 30 * factor;

        x -= 0.5 * width;
        y -= 0.5 * height;

        let html = "<g class='icn3d-node' chainid='" + chainid + "' >";
        html += "<title>Chain " + oriChain + ": " + chainname + "</title>";
        // place holder
        html += "<rect class='icn3d-basenode' x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";
        // highlight
        html += "<rect class='icn3d-hlnode' x='" +(x + width / 2.0 *(1 - ratio)).toString() + "' y='" +(y + height / 2.0 *(1 - ratio)).toString() + "' width='" +(width * ratio).toString() + "' height='" +(height * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

        html += "<text x='" +(x + width / 2 - adjustx).toString() + "' y='" +(y + height / 2 + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

        if(alignNum !== "") html += "<text x='" +(x + width / 2 - adjustx).toString() + "' y='" +(y + height + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

        html += "</g>";

        return html;
    }

    draw2DChemical(x, y, chainid, oriChain, chain, chainname, alignNum, color, oricolor, factor, ratio, bBiopolymer) { let ic = this.icn3d, me = ic.icn3dui;
        let strokecolor = '#000000';
        let strokewidth = '1';
        let linestrokewidth = '2';
        let textcolor = '#000000';
        let fontsize = '10';
        let smallfontsize = '8';
        let adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        let bpsize = 30 * factor;

        let x0, y0, x1, y1, x2, y2, x3, y3;
        if(bBiopolymer) {
            // biopolymer
            let xOffset = 0.5 * bpsize / Math.sqrt(3);
            let yOffset = 0.5 * bpsize;

            x0 = x - xOffset;
            y0 = y - yOffset;
            x1 = x + 3 * xOffset;
            y1 = y - yOffset;
            x2 = x + xOffset;
            y2 = y + yOffset;
            x3 = x - 3 * xOffset;
            y3 = y + yOffset;
        }
        else {
            // diamond
            let xOffset = 0.5 * bpsize;
            let yOffset = 0.5 * bpsize;

            x0 = x - xOffset;
            y0 = y;
            x1 = x;
            y1 = y + yOffset;
            x2 = x + xOffset;
            y2 = y;
            x3 = x;
            y3 = y - yOffset;
        }

        let x0diff = x0 - x;
        let y0diff = y0 - y;
        let x1diff = x1 - x;
        let y1diff = y1 - y;
        let x2diff = x2 - x;
        let y2diff = y2 - y;
        let x3diff = x3 - x;
        let y3diff = y3 - y;

        let html = "<g class='icn3d-node' chainid='" + chainid + "' >";
        html += "<title>Chain " + oriChain + ": " + chainname + "</title>";
        html += "<polygon class='icn3d-basenode' points='" + x0 + ", " + y0 + "," + x1 + ", " + y1 + "," + x2 + ", " + y2 + "," + x3 + ", " + y3 + "' x='" + x + "' y='" + y + "' x0d='" + x0diff + "' y0d='" + y0diff + "' x1d='" + x1diff + "' y1d='" + y1diff + "' x2d='" + x2diff + "' y2d='" + y2diff + "' x3d='" + x3diff + "' y3d='" + y3diff + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

        html += "<polygon class='icn3d-hlnode' points='" +(x+x0diff*ratio).toString() + ", " +(y+y0diff*ratio).toString() + "," +(x+x1diff*ratio).toString() + ", " +(y+y1diff*ratio).toString() + "," +(x+x2diff*ratio).toString() + ", " +(y+y2diff*ratio).toString() + "," +(x+x3diff*ratio).toString() + ", " +(y+y3diff*ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

        html += "<text x='" +(x + smalladjustx).toString() + "' y='" +(y + smalladjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + smallfontsize + "; text-anchor:middle' >" + chain + "</text>";

        if(alignNum !== "") html += "<text x='" +(x + smalladjustx).toString() + "' y='" +(y + smalladjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

        html += "</g>";

        return html;
    }

    async drawR2dt(chainid) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        ic.bAddedCursors = false;

        let pos = chainid.lastIndexOf('_');
        let pdbid = chainid.substr(0, pos);
        let chain = chainid.substr(pos + 1);

		//https://9c5d031c.na-hackathon-2026.pages.dev/api.json
		//https://www.ebi.ac.uk/pdbe/static/entry/1ffk_2_9.json, or 1ffk_1_0.json [pdbid_molid_chain]
        let molid = 1;
        for(let i in ic.molid2chain) {
            if(ic.molid2chain[i] == chainid) {
                molid = i;
                break;
            }
        }

		let url = "https://www.ebi.ac.uk/pdbe/static/entry/" + pdbid.toLowerCase() + "_" + molid + "_" + chain + ".json";
		let apiData = await me.getAjaxPromise(url, 'json', undefined, 'The chain ' + chainid + ' with molid ' + molid + ' has no R2DT information in PDBe...');

		//https://9c5d031c.na-hackathon-2026.pages.dev/fr3d.json
        //https://www.ebi.ac.uk/pdbe/static/entry/1ffk_9_basepair.json
        let url2 = "https://www.ebi.ac.uk/pdbe/static/entry/" + pdbid.toLowerCase() + "_" + chain + "_basepair.json";
		let fr3dData = await me.getAjaxPromise(url2, 'json', undefined, 'The chain ' + chainid + ' with molid ' + molid + ' has no FR3D information in PDBe...');

        let html = '';

		html += "<link rel='stylesheet' type='text/css' href='./script/pdb-rna-viewer-0.3.0.css'>\n";
		html += "<div id='pdb-rna-viewer' style='width: " + ($(window).width() / 2 - 150) + "px; height: " + ($(window).height() - 240) + "px'></div>\n";
		html += "<script type='text/javascript' src='./script/pdb-rna-viewer-plugin-0.3.0.js'></script>\n";
		html += "<script type='text/javascript'>\n";
		html += "  var rnaPlugin = new PdbRnaViewerPlugin();\n";
		html += "  rnaPlugin.render(\n";
		html += "    document.getElementById('pdb-rna-viewer'),\n";
		html += "    {\n";
		html += "      pdbId: '" + pdbid.toLowerCase() + "',\n";
		html += "      entityId: '1',\n";
		html += "      chainId: '" + chain + "',\n";
		html += "      subscribeEvents: true,\n";
		html += "      apiData: " + JSON.stringify(apiData) + ",\n";
		html += "      FR3DData: " + JSON.stringify(fr3dData) + ",\n";
		html += "      theme: { unobservedColor: '#bbbbbb' },\n";
		html += "    }\n";
		html += "  );\n";
		html += "</script>\n";

		$("#" + me.pre + "2ddiagramDiv").html(html);

        setTimeout(function(){
            // grey out residues without 3D coordinates
            const unobserved = apiData.unobserved_label_seq_ids || [];
            const PDB_LOWER = pdbid.toLowerCase();
            unobserved.forEach((seqId) => {
              document
                .querySelectorAll(`text.rnaview_${PDB_LOWER}_${seqId}`)
                .forEach((el) => { el.setAttribute('fill', '#bbbbbb');});
            });

            // click 2D to show in 3D
            document.addEventListener('PDB.RNA.viewer.click', (ev) => {
            // $(document).on("PDB.RNA.viewer.click", function(ev, data) {
                let posArray = [];
                const d = ev.eventData || ev.detail || {};
                if (Array.isArray(d.label_seq_ids)) posArray = d.label_seq_ids;
                if (d.label_seq_id !== undefined && d.label_seq_id !== null) posArray = [d.label_seq_id];

                let hAtoms = {};
                for(let i = 0, il = posArray.length; i < il; ++i) {
                    let resid = ic.ncbi2resid[chainid + '_' + posArray[i]];                  
                    // highlight the selected residue
                    hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[resid]);
                }

                if(ic.bCtrl || ic.bShift) {
                    ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, hAtoms);
                }
                else {
                    ic.hAtoms = hAtoms;
                }

                ic.hlUpdateCls.showHighlight();
            });

            // click 3D to highlight in 2D
            $(document).on("icn3d.pick.click", function(ev, data) {
                // get the residue position in the selection
                let ncbiresid = data;
                let pos = ncbiresid.substr(ncbiresid.lastIndexOf('_') + 1);

                document.dispatchEvent(new CustomEvent('protvista-click', {
                    detail: { start: pos, end: pos }
                }));
            });

            $(document).on("icn3d.pick.mouseover", function(ev, data) {
                // get the residue position in the selection
                let ncbiresid = data;
                let pos = ncbiresid.substr(ncbiresid.lastIndexOf('_') + 1);

                document.dispatchEvent(new CustomEvent('protvista-mouseover', {
                    detail: { start: pos, end: pos }
                }));
            });

        }, 1000);

		me.htmlCls.dialogCls.openDlg('dl_2ddiagram', 'Show R2DT Diagram for chain ' + chainid);
    }

    async getDotbracket(chainid) { let ic = this.icn3d, me = ic.icn3dui;
        let pos = chainid.lastIndexOf('_');
        let pdbid = chainid.substr(0, pos);
        let chain = chainid.substr(pos + 1);

        let result;
        if(ic.chain2pairs_resns_lw) {
			let pairs_resns_lw = ic.chain2pairs_resns_lw[chain];
			let pairs = [], lw2pairs = {};

			for(let i = 0, il = pairs_resns_lw.length; i < il; i += 5) {
				let pos1 = pairs_resns_lw[i];
				let pos2 = pairs_resns_lw[i + 1];
				let resn1 = pairs_resns_lw[i + 2];
				let resn2 = pairs_resns_lw[i + 3];
				let lw = pairs_resns_lw[i + 4];

				if(lw == 'cWW') {
					pairs.push([parseInt(pos1), parseInt(pos2)]);
				}
				else {
					if(!lw2pairs[lw]) lw2pairs[lw] = [];
					lw2pairs[lw].push(parseInt(pos1));
					lw2pairs[lw].push(parseInt(pos2));
				}
			}

			result = this.pairs2dotbracket(pairs, lw2pairs, chainid);
		}
		else {
			let url = "https://rna.bgsu.edu/rna3dhub/pdb/" + pdbid + "/interactions/fr3d/basepairs/tsv";

			let data = await me.getAjaxPromise(url, 'text');
			if(!data || data == 'Not a valid PDB id.') {
				alert('The chain ' + chainid + ' has no basepair information in FR3D...');
				return;
			}

            let ret2 = this.fr3d2pairs(data, chainid); //pairs_lw2pairs_annotations
            // annotations = ret2.anno;
            result = this.pairs2dotbracket(ret2.pairs, ret2.lw2pairs, chainid)
		}


        return result;
	}

    fr3d2pairs(data, chainid) { let ic = this.icn3d, me = ic.icn3dui;
        let pos = chainid.lastIndexOf('_');
        let chain = chainid.substr(pos + 1);

        let lines = data.split('\n');

        let pairs = []; // 0-based, only for canonical base pairs
        let lw2pairs = {}; // 1-based, for non-canonical base pairs and base stacking interactions
        for (let i in lines) {
            let line = lines[i]; // e.g., 9CFN|1|A|A|2	cWW	9CFN|1|A|U|38	
            let from_type_to = line.trim().split('\t');
            if(from_type_to.length != 3) continue;

            let fromArray = from_type_to[0].split('|'), toArray = from_type_to[2].split('|');
            if(fromArray.length < 5 || toArray.length < 5) continue;
            if(fromArray[2] != chain || toArray[2] != chain) continue;
            let resi1 = fromArray[4], resi2 = toArray[4]; 
            let ncbiResid1 = ic.resid2ncbi[chainid + '_' + resi1], ncbiResid2 = ic.resid2ncbi[chainid + '_' + resi2];
            let pos1 = parseInt(ncbiResid1.substr(ncbiResid1.lastIndexOf('_') + 1)) - 1, pos2 = parseInt(ncbiResid2.substr(ncbiResid2.lastIndexOf('_') + 1)) - 1;
 
            if(pos1 > pos2) continue; // each pair is listed twice in FR3D data, with the from and to residues swapped. Only process the one with pos1 < pos2 to avoid duplication.

            if(from_type_to[1] == 'cWW') {
               if(fromArray[2] == chain && toArray[2] == chain) {
                    pairs.push([Math.min(pos1, pos2), Math.max(pos1, pos2)]);
                }
            }
            else {
                let type = from_type_to[1];
                if(!lw2pairs[type]) lw2pairs[type] = [];
                
                lw2pairs[type].push(pos1);
                lw2pairs[type].push(pos2);
            }

        }

        return {'pairs': pairs, 'lw2pairs': lw2pairs};
    }

    isCrossed(pair1, pair2) {
        let i = pair1[0], j = pair1[1];
        let k = pair2[0], l = pair2[1];
        return (i < k && k < j && j < l) || (k < i && i < l && l < j);
    }

    // modified from a python script by Eugene Baulin (https://imol.institute/leaders/baulin-group/)
    // pairs: list of (i, j) with 0 <= i < j < length
    pairs2dotbracket(pairs, lw2pairs, chainid) { let ic = this.icn3d, me = ic.icn3dui;
        //Dot-bracket notation for RNA secondary structures with pseudoknots.

        //Positions are 0-indexed. Crossing pairs require different bracket types.
        //Levels are minimized by greedy coloring of the crossing graph, with pairs
        //sorted by ascending conflict count so that pairs involved in fewer crossings
        //(which form larger conflict-free groups) occupy the lower bracket levels.

        //Bracket levels: () [] {} <> Aa Bb Cc ... Zz  (30 levels total).

        let BRACKETS = ['()', '[]', '{}', '<>'];
        for(let ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
            BRACKETS.push(ch + ch.toLowerCase());
        }

        pairs.sort((a, b) => parseInt(a[0]) - parseInt(b[0])); 

        // Pairs with fewer crossings tend to belong to larger conflict-free groups
        // and should occupy lower levels. Sort ascending by crossing count so they
        // are placed at level 0 first; break ties by left endpoint for determinism.
        let pairstr2crosscnt = {};
        for(let i = 0, il = pairs.length; i < il; ++i) {
            let pairstr1 = pairs[i][0] + '_' + pairs[i][1];
            for(let j = i + 1; j < il; ++j) {
                let pairstr2 = pairs[j][0] + '_' + pairs[j][1];
                if(this.isCrossed(pairs[i], pairs[j])) {
                    pairstr2crosscnt[pairstr1] = (pairstr2crosscnt[pairstr1] || 0) + 1;
                    pairstr2crosscnt[pairstr2] = (pairstr2crosscnt[pairstr2] || 0) + 1;
                }
            }
        }

        let pairsSortbyCross = pairs.sort((a, b) => {
            let pairstr1 = a[0] + '_' + a[1], pairstr2 = b[0] + '_' + b[1];
            let crosscnt1 = pairstr2crosscnt[pairstr1] || 0, crosscnt2 = pairstr2crosscnt[pairstr2] || 0;
            if(crosscnt1 != crosscnt2) {
                return crosscnt1 - crosscnt2;
            } else {
                return a[0] - b[0];
            }
        });

        // Greedy level assignment: for each pair (in conflict-count order),
        // use the lowest level whose existing pairs do not cross it.
        let levels = []; // each level is an array of pairs
        for(let index = 0, indexl = pairsSortbyCross.length; index < indexl; ++index) {
            let pair = pairsSortbyCross[index];

            if(levels.length == 0) {
                levels.push([pair]);
                continue;
            }

            let bCrossed = false;
            for(let i = 0, il = levels.length; i < il; ++i) {
                bCrossed = false;
                
                let level_pairs = levels[i];
                
                for(let j = 0, jl = level_pairs.length; j < jl; ++j) {
                    if(this.isCrossed(pair, level_pairs[j])) {
                        bCrossed = true;
                        break;
                    }
                }

                if(!bCrossed) {
                    levels[i].push(pair);
                    break;
                }
            }

            if(bCrossed) {
                levels.push([pair]);
            }
        }

        // Relabel so larger groups use lower-level brackets, minimising the total
        // number of characters at higher levels. Bracket types are just labels —
        // any permutation of levels is valid as long as pairs on the same level
        // do not cross.
        levels.sort((a, b) => b.length - a.length); // sort descending by group size

        let dotb = [], seq = '';
        for(let i = 0; i < ic.chainsSeq[chainid].length; ++i) {
            dotb.push('.');
            seq += ic.chainsSeq[chainid][i].name;
        }

        let type = 'cWW';
        if(!lw2pairs[type]) lw2pairs[type] = [];

        for(let i = 0, il = levels.length; i < il; ++i) {
            let pairs = levels[i];
            for(let j = 0, jl = pairs.length; j < jl; ++j) {
                dotb[pairs[j][0]] = BRACKETS[i][0];
                dotb[pairs[j][1]] = BRACKETS[i][1];
                
                if(i > 0) { // level 0 is for nested base pairs
                   lw2pairs[type].push(pairs[j][0] + 1); // 1-based
                   lw2pairs[type].push(pairs[j][1] + 1);
                }
            }
        }

        return {'dotb': dotb.join(''), 'seq': seq, 'lw2pairs': lw2pairs};
    }

    async drawRnacanvas(chainid) { let ic = this.icn3d, me = ic.icn3dui;
        ic.bAddedCursors = false;

        ic.rnacanvas_chainid = chainid;

        let pos = chainid.lastIndexOf('_');
        let pdbid = chainid.substr(0, pos);

        let result = await this.getDotbracket(chainid);

        ic.dot_bracket = result.dotb;
        ic.rnaseq = result.seq;
        ic.lw2pairs = result.lw2pairs;

        let nonWC = '';
        this.updateRnacanvas(nonWC);
        //me.htmlCls.clickMenuCls.setLogCmd('update forna ' + nonWC, true);

        me.htmlCls.dialogCls.openDlg('dl_rnacanvas', 'Show 2D Diagram for chain ' + chainid + ' with RNAcanvas');
        $("#" + me.pre + "basepairType").resizable();
    }

    updateRnacanvas(nonWC) { let ic = this.icn3d, me = ic.icn3dui;
        let html = '';

		html += "<div id='rnacanvasSvg'></div>\n";

		html += "<script type='module'>\n";       
		//html += "  import 'https://cdn.jsdelivr.net/npm/@rnacanvas/embedded@3.1.0';\n";
		html += "  import './script/rnacanvas-4.0.0.js';\n";
        html += "</script>\n";

        html += "<script type='text/javascript'>\n";
        html += "var attempts = 0;\n";
        html += "var tick = () => {\n";
        html += "   if (typeof RNAcanvas !== 'undefined') {\n";

        // html += "<script type='text/javascript'>\n";
        // html += "setTimeout(function(){\n";
		html += "	// create a new RNAcanvas app instance\n";
        html += "	var rnaCanvas = new RNAcanvas();\n";
		html += "   // Target your container and append the canvas element\n";
		html += "	var container = document.getElementById('rnacanvasSvg');\n";
		html += "	rnaCanvas.appendTo(container);\n";
		html += "   // control the size of the component\n";
		html += "	rnaCanvas.domNode.style.width = '" + ($(window).width() / 2 - 150) + "px';\n";
		html += "	rnaCanvas.domNode.style.height = '" + ($(window).height() - 200) + "px';\n";
		//html += "	rnaCanvas.domNode.style.width = '600px';\n";
		//html += "	rnaCanvas.domNode.style.height = '600px';\n";
		html += "	// Render the structure\n";
		html += "	rnaCanvas.drawDotBracket('" + ic.rnaseq + "', '" + ic.dot_bracket + "');\n";
		html += "   // add padding around the drawn structure\n";
		html += "	rnaCanvas.drawing.setPadding(20);\n";
		//html += "	rnaCanvas.drawing.setPadding(1000);\n";
		html += "   // bring the drawn structure into view\n";
		html += "	rnaCanvas.drawingView.fitToContent();\n";
		html += "	$('.UDedZ1UaiPZJsRmm1yxA').hide();\n"; // hide the "Powered by RNAcanvas" label

		html += "var pos2node = {};\n";
		html += "var nodes = rnaCanvas.drawing.bases;\n";

		html += "for (var i = 0, il = nodes.length; i < il; i++) {\n";
		html += "  pos2node[i + 1] = nodes[i];\n";
        html += "  nodes[i].setAttribute('resi', i + 1);\n";
		html += "}\n";

        html += "$(document).on('click', '#rnacanvasSvg svg text', function(e) {\n";
        html += "    var id = $(this).attr('id');\n";
        html += "    // clear all node color\n";
		html += "    for (var i = 0, il = nodes.length; i < il; i++) {\n";
		html += "       nodes[i].setAttribute('fill', '#000');\n";
		html += "    }\n";
        html += "    $(this)[0].setAttribute('fill', '#f8b84e');\n";

        html += "    var resn = $(this).text().split(' ')[0];\n"; //C Position 8
        html += "    $(document).trigger('from_rnacanvas', $(this).attr('resi') + '_' + resn);\n";
        html += "    document.dispatchEvent(event);\n";
        html += "});\n";

        html += "$(document).on('mouseover', '#rnacanvasSvg svg text', function(e) {\n";
        html += "   var id = $(this).attr('id');\n";
        html += "    $(this)[0].setAttribute('fill', '#f8b84e');\n";
        html += "   if(!$(this)[0].querySelector('title')) {\n";
        html += "       var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');\n";
        html += "       title.textContent = ' Position ' + $(this).attr('resi');\n";
        html += "       $(this)[0].appendChild(title);\n";
        html += "   }\n";
        html += "});\n";

        html += "$(document).on('mouseout', '#rnacanvasSvg svg text', function(e) {\n";
        html += "   var id = $(this).attr('id');\n";
        html += "    $(this)[0].setAttribute('fill', '#000');\n";
        html += "});\n";

        // click 3D to highlight in 2D
        html += "$(document).on('icn3d.pick.click icn3d.pick.mouseover', function(ev, data) {\n";
        html += "    // get the residues in the selection\n";
        html += "    var ncbiresid = data;\n";
        html += "    var pos = ncbiresid.substr(ncbiresid.lastIndexOf('_') + 1);\n";

        html += "    // clear all node color\n";
		html += "    for (var i = 0, il = nodes.length; i < il; i++) {\n";
		html += "       nodes[i].setAttribute('fill', '#000');\n";
		html += "    }\n";

        html += "    var node = pos2node[parseInt(pos)];\n";
        html += "    node.setAttribute('fill', '#f8b84e');\n";
        html += "});\n";

        if(nonWC) {
            let lwTypesTmp = nonWC.split(',');
            let lwTypes = [...new Set(lwTypesTmp)]; // unique

            for(let i = 0, il = lwTypes.length; i < il; ++i) {
                let type = lwTypes[i];
                let pairs = ic.lw2pairs[type];
                if(!pairs) continue;

                for(let j = 0, jl = pairs.length; j < jl; j += 2) {
                    let pos1 = pairs[j], pos2 = pairs[j + 1];
                    html += "if(pos2node[" + pos1 + "] && pos2node[" + pos2 + "]) {\n";
                    html += "  var node1 = pos2node[" + pos1 + "].centerPoint;\n";
                    html += "  var node2 = pos2node[" + pos2 + "].centerPoint;\n";
                    html += "  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');\n";
					html += "  line.setAttribute('x1', node1.x);\n";
					html += "  line.setAttribute('y1', node1.y);\n";
					html += "  line.setAttribute('x2', node2.x);\n";
					html += "  line.setAttribute('y2', node2.y);\n";
					html += "  line.setAttribute('stroke', 'black');\n";
					html += "  line.setAttribute('stroke-width', '1');\n";
					//html += "  line.setAttribute('title', '" + type + "');\n";

                    html += "  var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');\n";
                    html += "  title.textContent = '" + pos1 + " - " + pos2 + "; " + type + "';\n";
                    html += "  line.appendChild(title);\n";

                    html += "  rnaCanvas.drawing.domNode.appendChild(line);";
                    html += "}\n";
                }
            }
        }

        // html += "}, 10000);\n";

        html += "       return;\n";
        html += "   }\n";
        html += "   if (attempts++ > 200) return;\n";
        html += "   setTimeout(tick, 100);\n";
        html += "};\n";
        html += "tick();\n";   

        html += "</script>\n";

        $("#" + me.pre + "rnacanvasDiv").html(html);
    }

    async drawIgdgm(chainid, bDownload) { let ic = this.icn3d, me = ic.icn3dui;
        // select the current chain
        //ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[chainid]);

        ic.ig2ddgm_chainid = chainid;

        // run ig detection
        ic.bRunRefnumAgain = true;
        if(!ic.bAnnoShown) await ic.showAnnoCls.showAnnotations();
        await ic.annotationCls.setAnnoTabIg(true);
        ic.bRunRefnumAgain = false;

        if(!ic.chain2igArray) {
            alert("No Ig domain was found for chain " + chainid);
            return;
        }

        let igArray = ic.chain2igArray[chainid]; 

        let igTypeArray = [], bFound = false;
        for(let i = 0, il = igArray.length; i < il; ++i) {
            let domainid = igArray[i].domainid;
            if(!ic.domainid2info) continue;

            let info = ic.domainid2info[domainid];
            if(!info) continue;
            
            let igType = ic.ref2igtype[info.refpdbname];

            if(igType == 'IgV' || igType == 'IgC1' || igType == 'IgC2' || igType == 'IgI' || igType == 'IgFN3') {
                bFound = true;
            }

            igTypeArray.push(igType);
        }

        if(!bFound) {
            alert("The Ig type(s) for chain " + chainid + " is/are " + igTypeArray + ". Currently only IgV, IgC1, IgC2, IgI and IgFN3 types are supported for drawing Ig diagrams.");
            return;
        }

        // get the hash of refnum to resn
        ic.refnum2resn = {};
        for(let resid in ic.resid2refnum) {
            let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
            if(!atom) continue;

            // let resn = me.utilsCls.residueName2Abbr(atom.resn.substr(0, 3));
            let resn = me.utilsCls.residueName2Abbr(atom.resn);

            let refnumStr, refnumLabel = ic.resid2refnum[resid];
            let domainid = ic.resid2domainid[resid];

            if(refnumLabel) {
                refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                if(!ic.refnum2resn[domainid]) ic.refnum2resn[domainid] = {};
                ic.refnum2resn[domainid][refnumStr] = resn + resid.split('_')[2];
            }
        }

        if(bDownload) {
            if(ic.bXlsx === undefined) {
                let urlScript = "/Structure/icn3d/script/exceljs.min.js";
                await me.getAjaxPromise(urlScript, 'script');

                ic.bXlsx = true;
            }

            const mainWorkbook = new ExcelJS.Workbook();

            let ig2width = {'IgC1': 17, 'IgC2': 18, 'IgI': 19, 'IgV': 19};

            for(let i = 0, il = igArray.length; i < il; ++i) {
                let domainid = igArray[i].domainid;
                let igType = igTypeArray[i];
                if(!(igType == 'IgV' || igType == 'IgC1' || igType == 'IgC2' || igType == 'IgI' || igType == 'IgFN3')) {
                    const newSheet = mainWorkbook.addWorksheet((i + 1) + ". " + igType);
                }
                else {
                    let url = "/Structure/icn3d/template/igstrand_template_" + igType + ".xlsx";
                    let arrayBuffer = await me.getXMLHttpRqstPromise(url, 'GET', 'arraybuffer', 'xlsx');

                    const workbook = new ExcelJS.Workbook();
                    // Load the workbook from the buffer
                    await workbook.xlsx.load(arrayBuffer);
                    const worksheet = workbook.getWorksheet(1);

                    const newSheet = mainWorkbook.addWorksheet();
                    // Clone the model to transfer styles and data
                    newSheet.model = worksheet.model;
                    newSheet.name = (i + 1) + ". " + igType;

                    // Iterate over all rows that have values
                    newSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                        // Iterate over all cells in the row
                        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            //console.log(`Cell [${rowNumber}, ${colNumber}] = ${cell.value}`);
                            if (cell.value && !isNaN(cell.value) && cell.value > 1000 && cell.value < 10000) {
                                if(ic.refnum2resn[domainid].hasOwnProperty(cell.value)) {
                                    cell.value = ic.refnum2resn[domainid][cell.value];
                                }
                                else {
                                    cell.value = '';
                                }
                            }
                            else if(cell.value == 'NUMBERING') {
                                cell.value = '';
                            }
                        });
                    });

                    // copy the original data
                    let colNum = ig2width[igType]; // some extra columns
                    for(let i = 1; i <= colNum; ++i) {
                        const sourceCol = worksheet.getColumn(i);

                        // Copy values and styles
                        sourceCol.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                            const targetCell = newSheet.getRow(rowNumber).getCell(colNum + 2 + i);
                            
                            targetCell.value = cell.value;
                            targetCell.style = cell.style; // Copies font, borders, and fills
                        });

                        // reset width for each column
                        newSheet.getColumn(colNum + 2 + i).width = worksheet.getColumn(i).width;
                    }
                }
            }

            // Generate the workbook as a Buffer
            const data = await mainWorkbook.xlsx.writeBuffer();

            // Access the underlying ArrayBuffer
            ic.saveFileCls.saveFile(ic.inputid + '_ig_diagram.xlsx', 'xlsx', data);
        }
        else { // show interactive SVG
            // generate a dropdown menu
            let menuHtml = '';
            for(let i = 0, il = igArray.length; i < il; ++i) {
                let domainid = igArray[i].domainid;
                let igType = igTypeArray[i];
                
                let selStr = (i == 0) ? ' selected' : '';
                menuHtml += "<option value='" + i + '_' + igType + "' " + selStr + ">" + (i+1) + ". " + igType + "</option>";
            }
            $("#" + me.pre + "iglist").html(menuHtml);
            
            await this.show2DdgmForIg(0, igTypeArray[0]); // default

            $("#" + me.pre + "iglist").resizable();
        }

        ic.drawCls.draw();
    }

    async show2DdgmForIg(igIndex, igType) { let ic = this.icn3d, me = ic.icn3dui;
        if(!(igType == 'IgV' || igType == 'IgC1' || igType == 'IgC2' || igType == 'IgI' || igType == 'IgFN3')) {
            alert("This Ig type " + igType + "has no 2D template yet...");
            return '';
        }
        else {
            let url = "/Structure/icn3d/template/igstrand_template_" + igType + ".svg";
            let svgHtml = await me.getAjaxPromise(url, 'text');

            let igArray = ic.chain2igArray[ic.ig2ddgm_chainid]; 
            let domainid = igArray[igIndex].domainid;

            // loop through all text node
            let lineArray = svgHtml.split('\n');

            let html = '';
            for(let i = 0, il = lineArray.length; i < il; ++i) {
                let line = lineArray[i];
                if(line.indexOf('<text ') == 0) { // <text x="502.1" y="301.8" class="s9 c8547"><title>Ref. Num. 8547</title> 8547 </text>
                    let pos = line.indexOf('</title> ');
                    let refnumStr = line.substr(pos + 9).split(' ')[0];
                    let refnum = parseInt(refnumStr);

                    if(!isNaN(refnumStr) && refnum > 1000 && refnum < 10000) {
                        if(ic.refnum2resn[domainid].hasOwnProperty(refnumStr)) {
                            let resn = ic.refnum2resn[domainid][refnumStr];
                            let pos2 = line.indexOf('class=');
                            html += line.substr(0, pos2) + 'class="node ' + line.substr(pos2 + 7, pos - (pos2 + 7)) + '</title> ' + resn + ' </text>';
                        }
                        else {
                            html += line.substr(0, pos) + '</title>  </text>';
                        }
                    }
                    else {
                        html += line + '\n';
                    }
                }
                else {
                    html += line + '\n';
                }
            }

            $("#" + me.pre + "ig2ddgmDiv").html(html);

            me.htmlCls.dialogCls.openDlg('dl_ig2ddgm', 'Show 2D diagram for Ig ' + (igIndex + 1) + '.' + igType + ' in '  + ic.ig2ddgm_chainid);
        }
    }
}

export {Diagram2d}

