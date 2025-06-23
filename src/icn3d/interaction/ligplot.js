/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Ligplot {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async drawLigplot(atomSet1, bDepiction) { let ic = this.icn3d, me = ic.icn3dui;
        if(bDepiction) {
            me.htmlCls.dialogCls.openDlg('dl_ligplot', '2D Depiction');
        }
        else {
            me.htmlCls.dialogCls.openDlg('dl_ligplot', 'Show ligand interactions with atom details');
        }

        let widthOri, heightOri, width = 100, height = 100;
        ic.len4ang = 80;

        // get SVG from backend
        let pdbStr = ic.saveFileCls.getAtomPDB(atomSet1);
        pdbStr = pdbStr.trim();
        pdbStr = pdbStr.replace(/\n\n/g, '\n'); // remove empty lines

        let dataObj = {'pdb2svg': pdbStr}
        let url = me.htmlCls.baseUrl + "openbabel/openbabel.cgi"; 
        let dataStr = await me.getAjaxPostPromise(url, dataObj, undefined, undefined, undefined, undefined, 'text');

        let lineArray = dataStr.split('\n');
        let lineSvg = '', nodeSvg = '', index2xy = {};
        let xmin = 9999, ymin = 9999, xmax = -9999, ymax = -9999;
        let xsum = 0, ysum = 0, cnt = 0;
        ic.svgGridSize = ic.len4ang; // make the scg into many  grids to tell whether the grid is empty, 30 is about bond length (1.5 angstrom)
        ic.gridXY2used = {};
        for(let i = 0, il = lineArray.length; i < il; ++i) {
            let line = lineArray[i];
            if(line.indexOf('<svg width') == 0) { 
                //<svg width="100" height="100" x="0" y="0" viewBox="0 0 634.256 380"
                // get real width and height
                let start = line.indexOf('viewBox="') + 9;
                let linePart = line.substr(start);
                let viewbox = linePart.substr(0, linePart.indexOf('"'));
                let viewboxArray = viewbox.split(' ');
                widthOri = parseFloat(viewboxArray[2]);
                heightOri = parseFloat(viewboxArray[3]);
                width = widthOri + 2*ic.len4ang;
                height = heightOri + 2*ic.len4ang;
            }
            else if(line.indexOf('<line') == 0) { 
                lineSvg += line + '\n';
            }
            else if(line.indexOf('<text') == 0) { 
                if(line.indexOf('font-size="12"') != -1) { 
                    // index node
                    //<text x="40.000000" y="120.000000" fill="rgb(255,0,0)" stroke-width="0" font-weight="bold" font-size="12" >1</text>
                    let start = line.indexOf('>') + 1;
                    let indexPart = line.substr(start);
                    let index = parseInt(indexPart.substr(0, indexPart.indexOf('<')));
                    
                    start = line.indexOf('x="') + 3;
                    let xPart = line.substr(start);
                    let x = parseFloat(xPart.substr(0, xPart.indexOf('"')));

                    start = line.indexOf('y="') + 3;
                    let yPart = line.substr(start);
                    let y = parseFloat(yPart.substr(0, yPart.indexOf('"')));

                    index2xy[index] = {"x": x, "y": y};
                    let xGrid = parseInt(x / ic.svgGridSize);
                    let yGrid = parseInt(y / ic.svgGridSize);
                    ic.gridXY2used[xGrid + '_' + yGrid] = 1;

                    if(x > xmax) xmax = x;
                    if(y > ymax) ymax = y;

                    if(x < xmin) xmin = x;
                    if(y < ymin) ymin = y;

                    xsum += x;
                    ysum += y;
                    ++cnt;
                }
                else { // font-size > 12
                    nodeSvg += line + '\n';
                }
            }
            else if(line.indexOf('</svg>') == 0) { 
                break;
            }
        }

        let xcenter = xsum / cnt, ycenter = ysum / cnt;

        let id = me.ligplotid;
        ic.ligplotWidth = width;
        let graphWidth = ic.ligplotWidth;
        
        let textHeight = 30;
        let heightAll = height + textHeight;

        let offset = - ic.len4ang;
        let svgHtml = "<svg id='" + id + "' viewBox='" + offset + "," + offset + "," + width + "," + heightAll + "' width='" + graphWidth + "px' font-family='sans-serif' stroke='rgb(0,0,0)' stroke-width='2' stroke-linecap='round'>";

        if(bDepiction) {
            svgHtml += lineSvg + nodeSvg;
        }
        else {
            let xlen = parseInt(widthOri / ic.svgGridSize), ylen = parseInt(heightOri / ic.svgGridSize);
            let result = ic.viewInterPairsCls.getAllInteractionTable("save1", index2xy, xlen, ylen, xcenter, ycenter); // sort on the ligand/set1
            // ic.bLigplot = true;

            svgHtml += lineSvg + result.svgHtmlLine;

            svgHtml += nodeSvg + result.svgHtmlNode;
        }

        svgHtml += "</svg>";

        if(bDepiction) {
            $("#" + ic.pre + "ligplotDiv").html(svgHtml);
        }
        else {
            $("#" + ic.pre + "ligplotDiv").html(svgHtml);
            this.setEventsForLigplot();
        }  
    }

    
    getSvgPerPair(serialArray1, resid1, resid2, interactionType, index2xy, xlen, ylen, xcenter, ycenter, dist, bNotDrawNode, prevX2, prevY2) { let ic = this.icn3d, me = ic.icn3dui;
        let xOffset = 1, yOffset = -1;
        let bondLen = (interactionType == 'hbond' || interactionType == 'contact' || interactionType == 'halogen') ? ic.len4ang : ic.len4ang * 1.5; // real distance should be bout 120, not 80
        let shortBondLen = ic.len4ang / 2;
        let strokeWidth = (interactionType == 'contact') ? 1 : 2;

        let resid1Real = ic.getGraphCls.convertLabel2Resid(resid1);
        let atom1 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid1Real]);
        let resid2Real = ic.getGraphCls.convertLabel2Resid(resid2);
        let atom2 = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid2Real]);

        let xSum = 0, ySum = 0, cntPoint = 0;
        let baseSerial = atom1.serial;
        for(let i = 0, il = serialArray1.length; i < il; ++i) {
            let index = serialArray1[i] - baseSerial + 1;
            xSum += index2xy[index].x;
            ySum += index2xy[index].y;
            ++cntPoint;
        }

        let x1 = xSum / cntPoint - xOffset;
        let y1 = ySum / cntPoint - yOffset;

        if(!ic.resid2cnt.hasOwnProperty(resid1)) {
            ic.resid2cnt[resid1] = 0;
        }
        else {
            ++ic.resid2cnt[resid1];
        }

        let x2, y2, angle, baseAngle;
        if(!bNotDrawNode && !ic.resid2ToXy.hasOwnProperty(resid2Real)) {
            // 1st and ideal way to find a position. If failed, use the 2nd way
            let xGrid = parseInt(x1 / ic.svgGridSize);
            let yGrid = parseInt(y1 / ic.svgGridSize);
            let gridArray = [];
            for(let i = 1; i >= -1; --i) { // try right-bottom first
                for(let j = 1; j >= -1; --j) {
                    if(!(i == 0 && j == 0)) {
                        if(xGrid + i >= 0 && xGrid + i <= xlen && yGrid + j >= 0 && yGrid + j <= ylen) gridArray.push((xGrid + i) + '_' + (yGrid + j));
                    }
                }
            }
            for(let i = 2; i >= -2; --i) { // try right-bottom first
                for(let j = 2; j >= -2; --j) {
                    if(!(i >= -1 && i <= 1 && j >= -1 && j <= 1 )) {
                        if(xGrid + i >= 0 && xGrid + i <= xlen && yGrid + j >= 0 && yGrid + j <= ylen) gridArray.push((xGrid + i) + '_' + (yGrid + j));
                    }
                }
            }

            let bFound = false, xyGrids;
            for(let i = 0, il = gridArray.length; i < il; ++i) {
                if(!ic.gridXY2used[gridArray[i]]) { // found a spot to put the residue
                    xyGrids = gridArray[i].split('_');
                    x2 = (parseInt(xyGrids[0]) + 0.5) * ic.svgGridSize;
                    y2 = (parseInt(xyGrids[1]) + 0.5) * ic.svgGridSize;

                    let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                    let x2b = bondLen / dist * (x2 - x1) + x1;
                    let y2b = bondLen / dist * (y2 - y1) + y1;
                    x2 = x2b;
                    y2 = y2b;

                    ic.gridXY2used[gridArray[i]] = 1;
                    bFound = true;
                    break;
                }
            }
            
            if(!bFound) {
                // 2nd way to find a position from the center to the outside
                let dx = x1 - xcenter;
                let dy = y1 - ycenter;

                let baseAngle = 0;
                if(Math.abs(dx) > Math.abs(dy)) { // extend along x-axis
                    if(dx > 0) { // +x direction
                        baseAngle = 0;
                    }
                    else { // -x direction
                        baseAngle = 180;
                    }
                }
                else { // extend along y-axis
                    if(dy > 0) { // +y direction
                        baseAngle = 90;
                    }
                    else { // -y direction
                        baseAngle = 270;
                    }
                }
                angle = baseAngle - 10 + ic.resid2cnt[resid1] * 30; 

                x2 = x1 + bondLen * Math.cos(angle * Math.PI/180);
                y2 = y1 + bondLen * Math.sin(angle * Math.PI/180);
            }
        }

        let oneLetterRes = me.utilsCls.residueName2Abbr(atom2.resn.substr(0, 3));
        let resName2 = oneLetterRes + atom2.resi;
        let textColor2 = (atom2.color) ? atom2.color.getHexString() : '000';
        let lineColor = ic.lineGraphCls.getStrokecolor(undefined, interactionType);

        // let node = '<circle cx="' + x2 + '" cy="' + y2 + '" r="8" fill="#' + textColor2 + '" stroke-width="1" stroke="' + textColor2 + '" resid="' + resid2 + '"></circle>\n<text x="' + x2 + '" y="' + y2 + '" stroke="#000" stroke-width="1px" text-anchor="middle" alignment-baseline="central" font-size="8px">' + resName2 + '</text>';
      
        let node = '', line = '';

        // id can't contain comma and thus use '-'
        // sometimes the same ligand atom is used in both Hbond and contact. THus we add "interactionType"
        let idpair = resid2Real + '--' + serialArray1.join('-') + interactionType; 

        let interactionTypeStr;
        if(interactionType == 'hbond') {
            interactionTypeStr = 'H-Bonds';
        }
        else if(interactionType == 'ionic') {
            interactionTypeStr = 'Salt Bridge/Ionic';
        }
        else if(interactionType == 'halogen') {
            interactionTypeStr = 'Halogen Bonds';
        }
        else if(interactionType == 'pi-cation') {
            interactionTypeStr = '&pi;-Cation';
        }
        else if(interactionType == 'pi-stacking') {
            interactionTypeStr = '&pi;-Stacking';
        }
        else if(interactionType == 'contact') {
            interactionTypeStr = 'Contacts';
        }

        let id = resid2Real;
        if(bNotDrawNode || ic.resid2ToXy.hasOwnProperty(id)) {
            x2 = (ic.resid2ToXy.hasOwnProperty(id)) ? ic.resid2ToXy[id].x2 : prevX2;
            y2 = (ic.resid2ToXy.hasOwnProperty(id)) ? ic.resid2ToXy[id].y2 : prevY2;

            // draw a short line from x2, y2 to x1, y1 with the distance shortBondLen
            let x1b = x1, y1b = y1, bShort = 0;
            if(interactionType == 'contact') {
                let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                if(shortBondLen < dist) {
                    x1b = shortBondLen / dist * (x1 - x2) + x2;
                    y1b = shortBondLen / dist * (y1 - y2) + y2;
                    bShort = 1;
                }
            }

            line +='<g><title>Interaction type: ' + interactionTypeStr + '; Distance: ' + parseFloat(dist).toFixed(1) + ' &#197;</title>';
            line += '<line class="icn3d-interaction" id="' + idpair + '" resid1="' + resid1Real + '" resid2="' + resid2Real + '" x1="' + x1b.toFixed(2)  + '" y1="' + y1b.toFixed(2)  + '" x2="' + x2.toFixed(2)  + '" y2="' + y2.toFixed(2)  + '" x0="' + x1.toFixed(2)  + '" y0="' + y1.toFixed(2)  + '" short="' + bShort + '" opacity="1.0" stroke="' + lineColor + '"  stroke-width="' + strokeWidth + '" stroke-dasharray="5,5"/>\n';
            line += '</g>\n'
        }
        else {
            node +='<g><title>' + resName2 + '</title>';
            // node += '<circle class='icn3d-ctnode' cx="' + x2.toFixed(2) + '" cy="' + y2.toFixed(2)  + '" r="10" fill="#' + textColor2 + '" stroke-width="1" stroke="' + textColor2 + '" resid="' + resid2Real + '"/>';
            let boxWidth = 28, boxHeight = 14;
            node += '<rect id="' + id + '_node" x="' + (x2 - boxWidth*0.5).toFixed(2) + '" y="' + (y2 - boxHeight*0.5).toFixed(2)  + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="2" ry="2" fill="#' + textColor2 + '" stroke-width="1" stroke="' + textColor2 + '" resid="' + resid2Real + '"/>';

            node += '<text class="icn3d-ctnode" resid="' + id + '" id="' + id + '" x="' + x2.toFixed(2)  + '" y="' + y2.toFixed(2)  + '" fill="#000" stroke="none" text-anchor="middle" alignment-baseline="central" style="font-size:10px">' + resName2 + '</text>'
            node += '</g>\n'

            line +='<g><title>Interaction type: ' + interactionTypeStr + '; Distance: ' + parseFloat(dist).toFixed(1) + ' &#197;</title>';
            line += '<line class="icn3d-interaction" id="' + idpair + '" resid1="' + resid1Real + '" resid2="' + resid2Real + '" x1="' + x1.toFixed(2)  + '" y1="' + y1.toFixed(2)  + '" x2="' + x2.toFixed(2)  + '" y2="' + y2.toFixed(2)  + '" opacity="1.0" stroke="' + lineColor + '"  stroke-width="' + strokeWidth + '" stroke-dasharray="5,5"/>';
            line += '</g>\n'

            if(interactionType != 'contact') {
                if(!ic.resid2ToXy.hasOwnProperty(resid2Real)) ic.resid2ToXy[resid2Real] = {x2: x2, y2: y2};
            }
        }

        if(!ic.nodeid2lineid.hasOwnProperty(id)) ic.nodeid2lineid[id] = [];
        ic.nodeid2lineid[id].push(idpair);

        return {node: node, line: line, x2: x2, y2: y2};
    }

    setEventsForLigplot() {  let ic = this.icn3d, me = ic.icn3dui;
        //https://stackoverflow.com/questions/1108480/svg-draggable-using-jquery-and-jquery-svg
        $("#" + me.ligplotid + " .icn3d-ctnode")
        .draggable({
            start: function( e, ui ) {
                let oriX= parseFloat(e.target.getAttribute('x'));
                let oriY = parseFloat(e.target.getAttribute('y'));
                e.target.setAttribute('x', oriX);
                e.target.setAttribute('y', oriY);
            },
            drag: function( e, ui ) {
                let ligplotScale = (ic.ligplotScale) ? ic.ligplotScale : 1;

                let offsetX = $("#" + me.ligplotid).offset().left + ic.len4ang * ligplotScale; // ic.len4ang was defined in svg viewbox
                let offsetY = $("#" + me.ligplotid).offset().top + ic.len4ang * ligplotScale;

                let id = e.target.getAttribute('resid');
                let x = (e.clientX - offsetX) / ligplotScale;
                let y = (e.clientY - offsetY) / ligplotScale;

                let oriX = parseFloat(e.target.getAttribute('x'));
                let oriY = parseFloat(e.target.getAttribute('y'));

                // change for each step
                // let dx = (x - oriX) / ic.resizeRatioX;
                // let dy = (y - oriY) / ic.resizeRatioY;
                let dx = (x - oriX);
                let dy = (y - oriY);

                // move the node
                oriX = parseFloat($("#" + id + "_node").attr('x'));
                oriY = parseFloat($("#" + id + "_node").attr('y'));

                $("#" + id + "_node").attr('x', oriX + dx);
                $("#" + id + "_node").attr('y', oriY + dy);

                // update the center
                e.target.setAttribute('x', x);
                e.target.setAttribute('y', y);

                // update the edges
                if(ic.nodeid2lineid[id]) {
                    for(let i = 0, il = ic.nodeid2lineid[id].length; i < il; ++i) {
                        let idpair = ic.nodeid2lineid[id][i];

                        updateEdges(idpair, id);
                    }
                }

                function updateEdges(idpair, id) {
                    if(idpair && idpair.indexOf(id) != -1) {
                        let idArray = idpair.split('--');
                        if(idArray.length == 2) {
                            let id1, id2;

                            id1 = idArray[1];
                            id2 = idArray[0];

                            let x2 = parseFloat($("#" + id2).attr('x'));
                            let y2 = parseFloat($("#" + id2).attr('y'));

                            $("#" + idpair).attr('x2', x2);
                            $("#" + idpair).attr('y2', y2);

                            let x1 = $("#" + idpair).attr('x1');
                            let y1 = $("#" + idpair).attr('y1');
                            let x1b = x1, y1b = y1;

                            let bShort = parseInt($("#" + idpair).attr('short'));
                            if(bShort) { // adjust x1,y1
                                x1 = $("#" + idpair).attr('x0');
                                y1 = $("#" + idpair).attr('y0');

                                let dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                                let shortBondLen = ic.len4ang / 2;
                                
                                if(shortBondLen < dist) {
                                    x1b = shortBondLen / dist * (x1 - x2) + x2;
                                    y1b = shortBondLen / dist * (y1 - y2) + y2;
                                }
                            }

                            $("#" + idpair).attr('x1', x1b);
                            $("#" + idpair).attr('y1', y1b);
                        }
                    } // if
                } // function
            }
        });
    }

    clickLigplot() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        $(document).on("click", "#" + ic.pre + "dl_ligplot .icn3d-ctnode", function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();

            ic.diagram2dCls.clickNode(this);
        });
    }
}

export {Ligplot}
