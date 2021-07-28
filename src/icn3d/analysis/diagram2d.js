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

class Diagram2d {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // draw 2D dgm for MMDB ID
    // Used as a reference the work at 2016 ISMB hackathon: https://github.com/NCBI-Hackathons/3D_2D_Rep_Structure
    // bUpdate: redraw 2Ddiagramfor the displayed structure
    draw2Ddgm(data, mmdbid, structureIndex, bUpdate) { let ic = this.icn3d, me = ic.icn3dui;
        // only show the 2D diagrams for displayed structures

        mmdbid = mmdbid.substr(0, 4);

        // reduce the size from 300 to 150
        let factor = 0.5;

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
                  //chainid += ic.icn3dui.htmlCls.postfix;
                  chainid = mmdbid + ic.icn3dui.htmlCls.postfix + '_' + chainNameFinal;
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

        html += "<svg viewBox='0,0,150,150'>";
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

        $("#" + ic.pre + "dl_2ddgm").html(ic.html2ddgm);

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
            $(highlight).attr('stroke', ic.icn3dui.htmlCls.ORANGE);
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
            $(highlight).attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(highlight).attr('stroke-width', strokeWidth);

            $(highlight).attr('r', Number($(base).attr('r')) * ratio);
        }
        else if(type === 'polygon') {
            $(highlight).attr('stroke', ic.icn3dui.htmlCls.ORANGE);
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
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
        });

        //$("#" + ic.pre + "dl_2ddgm .icn3d-interaction", "click", function(e) { let ic = thisClass.icn3d;
        $(document).on("click", "#" + ic.pre + "dl_2ddgm .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            ic.bClickInteraction = true;

            let chainid1 = $(this).attr('chainid1');
            let chainid2 = $(this).attr('chainid2');

            $(this).find('line').attr('stroke', ic.icn3dui.htmlCls.ORANGE);

            // interaction of chain1 with chain2, only show the part of chain1 interacting with chain2
            thisClass.selectInteraction(chainid1, chainid2);

            // show selected chains in annotation window
            ic.annotationCls.showAnnoSelectedChains();

            let select = "select interaction " + chainid1 + "," + chainid2;
            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

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
            $(this).find('circle').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(this).find('circle').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
        });

        //$("#" + ic.pre + "dl_scatterplot .icn3d-node", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_scatterplot .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);

/*
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid = $(this).attr('resid');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeScatterplotSelection();
            }

            let strokeWidth = 2;
            $(this).find('circle').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(this).find('circle').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
*/
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

            $(this).find('line.icn3d-hlline').attr('stroke', ic.icn3dui.htmlCls.ORANGE);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
        });

        //$("#" + ic.pre + "dl_scatterplot .icn3d-interaction", "click", function(e) { let ic = this.icn3d, me = ic.icn3dui;
        $(document).on("click", "#" + ic.pre + "dl_scatterplot .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);

/*
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid1 = $(this).attr('resid1');
            let resid2 = $(this).attr('resid2');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeScatterplotSelection();
            }

            let strokeWidth = 2;
            $(this).find('rect').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(this).find('rect').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
*/
        });

        $(document).on("click", "#" + ic.pre + "dl_contactmap .icn3d-interaction", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickInteraction(this);
/*
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid1 = $(this).attr('resid1');
            let resid2 = $(this).attr('resid2');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeScatterplotSelection();
            }

            let strokeWidth = 2;
            $(this).find('rect').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(this).find('rect').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
*/
        });

        $(document).on("click", "#" + ic.pre + "dl_contactmap .icn3d-node", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            thisClass.clickNode(this);
/*
            if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) ic.definedSetsCls.setMode('selection');

            let resid = $(this).attr('resid');

            if(!ic.bCtrl && !ic.bShift) {
              ic.hAtoms = {}

              thisClass.removeScatterplotSelection();
            }

            let strokeWidth = 2;
            $(this).find('circle').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
            $(this).find('circle').attr('stroke-width', strokeWidth);

            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

            let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

            ic.hlUpdateCls.updateHlAll();

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

            ic.bSelectResidue = false;
*/
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
        $(node).find('circle').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
        $(node).find('circle').attr('stroke-width', strokeWidth);

        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);

        let select = 'select ' + ic.resid2specCls.residueids2spec([resid]);

        ic.hlUpdateCls.updateHlAll();

        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);

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
        $(node).find('rect').attr('stroke', ic.icn3dui.htmlCls.ORANGE);
        $(node).find('rect').attr('stroke-width', strokeWidth);

        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid1]);
        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid2]);

        let select = 'select ' + ic.resid2specCls.residueids2spec([resid1, resid2]);

        ic.hlUpdateCls.updateHlAll();

        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
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
}

export {Diagram2d}

