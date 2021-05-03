/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {SubdivideCls} from '../../utils/subdivideCls.js';

import {Strip} from '../geometry/strip.js';
import {Curve} from '../geometry/curve.js';

class CurveStripArrow {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    createCurveSubArrow(p, width, colors, div, bHighlight, bRibbon, num, positionIndex,
      pntsCA, prevCOArray, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var divPoints = [], positions = [];

        divPoints.push(p);
        positions.push(positionIndex);

        this.prepareStrand(divPoints, positions, width, colors, div, undefined, bHighlight, bRibbon, num,
          pntsCA, prevCOArray, false, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo);

        divPoints = [];
        positions = [];
    }

    createStripArrow(p0, p1, colors, div, thickness, bHighlight, num, start, end,
      pntsCA, prevCOArray, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var divPoints = [], positions = [];

        divPoints.push(p0);
        divPoints.push(p1);
        positions.push(start);
        positions.push(end);

        this.prepareStrand(divPoints, positions, undefined, colors, div, thickness, bHighlight, undefined, num,
          pntsCA, prevCOArray, true, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo);

        divPoints = [];
        positions = [];
    }

    /**
     * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
     */

    prepareStrand(divPoints, positions, width, colors, div, thickness, bHighlight, bRibbon, num,
      pntsCA, prevCOArray, bStrip, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) { var ic = this.icn3d, me = ic.icn3dui;
        if(pntsCA.length === 1) {
            return;
        }

        var oriColors = colors;
        var bHelix = (bShowArrow) ? false : true;

        var colorsLastTwo = [];
        colorsLastTwo.push(colors[colors.length - 2]);
        colorsLastTwo.push(colors[colors.length - 1]);

        div = div || ic.axisDIV;
        var numM1Inv2 = 2 / (num - 1);
        var delta, lastCAIndex, lastPrevCOIndex, v;

        var pnts = {};
        for(var i = 0, il = positions.length; i < il; ++i) pnts[i] = [];

        // smooth C-alpha
        var pnts_clrs = me.subdivideCls.subdivide(pntsCA, colors, div, undefined, undefined, prevone, nexttwo);
        var pntsCASmooth = pnts_clrs[0]; // get all smoothen pnts, do not use 'bShowArray'
        //colors = pnts_clrs[2];

        if(pntsCASmooth.length === 1) {
            return;
        }

        // draw the sheet without the last residue
        // use the sheet coord for n-2 residues
        var colorsTmp = [];
        var i, lastIndex = (bShowArrow === undefined || bShowArrow) ? pntsCA.length - 2 : pntsCA.length;

        for (i = 0, il = lastIndex; i < il; ++i) {
            for(var index = 0, indexl = positions.length; index < indexl; ++index) {
                pnts[index].push(divPoints[index][i]);
            }
            colorsTmp.push(colors[i]);
        }
        colorsTmp.push(colors[i]);

        if(bShowArrow === undefined || bShowArrow) {
            // assign the sheet coord from C-alpha for the 2nd to the last residue of the sheet
            for(var i = 0, il = positions.length; i < il; ++i) {
                delta = -1 + numM1Inv2 * positions[i];
                lastCAIndex = pntsCASmooth.length - 1 - div;
                lastPrevCOIndex = pntsCA.length - 2;
                v = new THREE.Vector3(pntsCASmooth[lastCAIndex].x + prevCOArray[lastPrevCOIndex].x * delta,
                  pntsCASmooth[lastCAIndex].y + prevCOArray[lastPrevCOIndex].y * delta,
                  pntsCASmooth[lastCAIndex].z + prevCOArray[lastPrevCOIndex].z * delta);
                pnts[i].push(v);
            }
        }

        var posIndex = [];
        var results;
        for(var i = 0, il = positions.length; i < il; ++i) {
            results = me.subdivideCls.subdivide(pnts[i], colorsTmp, div, bShowArray, bHighlight);
            pnts[i] = results[0];
            colors = results[2];
            if(i === 0) {
                posIndex = results[1];
            }
        }

        if(bStrip) {
            if(bHelix) {
                if(!ic.bDoublecolor) {
                    ic.stripCls.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight, true,
                      undefined, calphaIdArray, posIndex, prevone, nexttwo, pntsCA, prevCOArray);
                }
                else {
                    ic.stripCls.createStrip(pnts[0], pnts[1], oriColors, div, thickness, bHighlight, true,
                      undefined, calphaIdArray, posIndex, prevone, nexttwo, pntsCA, prevCOArray);
                }
            }
            else {
                ic.stripCls.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight, true,
                  undefined, calphaIdArray, posIndex, prevone, nexttwo);
            }
        }
        else {
            ic.curveCls.createCurveSub(pnts[0], width, colors, div, bHighlight, bRibbon, true,
              undefined, calphaIdArray, posIndex, prevone, nexttwo);
        }

        if(bShowArrow === undefined || bShowArrow) {
            // draw the arrow
            colorsTmp = [];

            posIndex = [];
            for(var index = 0, indexl = positions.length; index < indexl; ++index) {
                pnts[index] = [];

                for (var i = div * (pntsCA.length - 2), il = div * (pntsCA.length - 1);
                  bShowArray[parseInt(i/div)] && i < il; i = i + div) {
                    var pos = parseInt(i/div);
                    for (var j = 0; j < div; ++j) {
                        var delta = -1 + numM1Inv2 * positions[index];
                        var scale = 1.8; // scale of the arrow width
                        delta = delta * scale * (div - j) / div;
                        var oriIndex = parseInt(i/div);

                        var v = new THREE.Vector3(pntsCASmooth[i+j].x + prevCOArray[oriIndex].x * delta,
                          pntsCASmooth[i+j].y + prevCOArray[oriIndex].y * delta,
                          pntsCASmooth[i+j].z + prevCOArray[oriIndex].z * delta);
                        v.smoothen = true;
                        pnts[index].push(v);
                        colorsTmp.push(colorsLastTwo[0]);
                        if(index === 0) posIndex.push(pos);
                    }
                }

                // last residue
                // make the arrow end with 0
                var delta = 0;
                var lastCAIndex = pntsCASmooth.length - 1;
                var lastPrevCOIndex = pntsCA.length - 1;

                //if(bShowArray[lastPrevCOIndex]) {
                    var v = new THREE.Vector3(pntsCASmooth[lastCAIndex].x + prevCOArray[lastPrevCOIndex].x * delta,
                      pntsCASmooth[lastCAIndex].y + prevCOArray[lastPrevCOIndex].y * delta,
                      pntsCASmooth[lastCAIndex].z + prevCOArray[lastPrevCOIndex].z * delta);
                    v.smoothen = true;
                    pnts[index].push(v);
                    colorsTmp.push(colorsLastTwo[1]);
                    if(index === 0) posIndex.push(lastCAIndex);
                //}
            }

            pntsCASmooth = [];

            //colorsTmp.push(colors[colors.length - 2]);
            //colorsTmp.push(colors[colors.length - 1]);

            if(bStrip) {
                ic.stripCls.createStrip(pnts[0], pnts[1], colorsTmp, div, thickness, bHighlight, true,
                  undefined, undefined, posIndex, prevone, nexttwo);
            }
            else {
                ic.curveCls.createCurveSub(pnts[0], width, colorsTmp, div, bHighlight, bRibbon, true,
                  undefined, undefined, posIndex, prevone, nexttwo);
            }
        }

        for(var i in pnts) {
            for(var j = 0, jl = pnts[i].length; j < jl; ++j) {
                pnts[i][j] = null;
            }
            pnts[i] = [];
        }

        pnts = {};
    }
}

export {CurveStripArrow}