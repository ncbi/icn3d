/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class CurveStripArrow {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    createCurveSubArrow(p, width, colors, div, bHighlight, bRibbon, num, positionIndex,
      pntsCA, prevCOArray, positions, bShowArrow) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let divPoints = [], linePos = [];

        divPoints.push(p);
        linePos.push(positionIndex);

        this.prepareStrand(divPoints, linePos, width, colors, div, undefined, bHighlight, bRibbon, num,
          pntsCA, prevCOArray, positions, false, bShowArrow);

        divPoints = [];
        linePos = [];
    }

    createStripArrow(p0, p1, colors, div, thickness, bHighlight, num, start, end,
      pntsCA, prevCOArray, positions, bShowArrow, ) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let divPoints = [], linePos = [];

        divPoints.push(p0);
        divPoints.push(p1);
        linePos.push(start);
        linePos.push(end);

        this.prepareStrand(divPoints, linePos, undefined, colors, div, thickness, bHighlight, undefined, num,
          pntsCA, prevCOArray, positions,true, bShowArrow);

        divPoints = [];
        linePos = [];
    }

    /**
     * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
     */

    prepareStrand(divPoints, linePos, width, colors, div, thickness, bHighlight, bRibbon, num,
      pntsCA, prevCOArray, positions, bStrip, bShowArrow) { let ic = this.icn3d, me = ic.icn3dui;
        if(pntsCA.length === 1) {
            return;
        }

        let oriColors = colors;
        let bHelix = (bShowArrow) ? false : true;

        div = div || ic.axisDIV;
        let numM1Inv2 = 2 / (num - 1);
        let delta, lastCAIndex, lastPrevCOIndex, v;

        let pnts = {};
        for(let i = 0, il = linePos.length; i < il; ++i) pnts[i] = [];

        //let startOffset = Math.floor(ic.axisDIV / 2) + 1; // first residue has floor(DIV/2)+1 points (8 when axisDIV = 15)

        // draw the sheet without the last residue
        // use the sheet coord for n-2 residues
        let colorsTmp = [];
        let extraArrow = (bStrip) ? 2 : 0; // extend the tube by 5 sub-points into a preceding/following helix/sheet

        let i, lastIndex = (bShowArrow === undefined || bShowArrow) ? pntsCA.length - ic.axisDIV + extraArrow : pntsCA.length;

        let il = lastIndex;
        let posIndex = [], pntsCATmp = [], prevCOArrayTmp = [];
        for (i = 0; i < il; ++i) {
            for(let index = 0, indexl = linePos.length; index < indexl; ++index) {
                pnts[index].push(divPoints[index][i]);
            }
            pntsCATmp.push(pntsCA[i]);
            prevCOArrayTmp.push(prevCOArray[i]);
            colorsTmp.push(colors[i]);
            posIndex.push(positions[i]); 
        }

        if(bStrip) {
            if(bHelix) {
                ic.stripCls.createStrip(pnts[0], pnts[1], colorsTmp, div, thickness, bHighlight, true,
                      undefined, posIndex, pntsCATmp, prevCOArrayTmp);
            }
            else {
                ic.stripCls.createStrip(pnts[0], pnts[1], colorsTmp, div, thickness, bHighlight, true,
                  undefined, posIndex);
            }
        }
        else {
            ic.curveCls.createCurveSub(pnts[0], width, colorsTmp, div, bHighlight, bRibbon, true,
              undefined, posIndex);
        }

        if(bShowArrow === undefined || bShowArrow) {
            // draw the arrow
            colorsTmp = [];

            posIndex = [];
            for(let index = 0, indexl = linePos.length; index < indexl; ++index) {
                pnts[index] = [];

                let cnt = 0;
                for (let i = lastIndex - extraArrow, il = lastIndex - extraArrow + ic.axisDIV; i < il; ++i, ++cnt) {
                    let pos = positions[i];
                    let delta = -1 + numM1Inv2 * linePos[index];
                    let scale = 1.8; // scale of the arrow width
                    delta = delta * scale * (ic.axisDIV - cnt) / ic.axisDIV;

                    let v = new THREE.Vector3(pntsCA[i].x + prevCOArray[i].x * delta,
                        pntsCA[i].y + prevCOArray[i].y * delta,
                        pntsCA[i].z + prevCOArray[i].z * delta);
                    //v.smoothen = true;
                    pnts[index].push(v);
                    colorsTmp.push(colors[i]);
                    if(index === 0) posIndex.push(pos);
                }
                               
                // last residue
                // make the arrow end with 0
                let lastCAIndex = pntsCA.length - 1;
                let delta = -1 + numM1Inv2 * linePos[index];
                let scale = 1.8; // scale of the arrow width
                delta = delta * scale / ic.axisDIV;

                let v = new THREE.Vector3(pntsCA[lastCAIndex].x + prevCOArray[lastCAIndex].x * delta,
                    pntsCA[lastCAIndex].y + prevCOArray[lastCAIndex].y * delta,
                    pntsCA[lastCAIndex].z + prevCOArray[lastCAIndex].z * delta);

                pnts[index].push(v);
                colorsTmp.push(colors[i]);
                if(index === 0) posIndex.push(positions[lastCAIndex]);
            }

            if(bStrip) {
                ic.stripCls.createStrip(pnts[0], pnts[1], colorsTmp, div, thickness, bHighlight, true,
                undefined, undefined, posIndex);
            }
            else {
                ic.curveCls.createCurveSub(pnts[0], width, colorsTmp, div, bHighlight, bRibbon, true,
                undefined, undefined, posIndex);
            }
        }

        //pntsCA = [];

        for(let i in pnts) {
            for(let j = 0, jl = pnts[i].length; j < jl; ++j) {
                pnts[i][j] = null;
            }
            pnts[i] = [];
        }

        pnts = {};
    }  
}

export {CurveStripArrow}