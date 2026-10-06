/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';


import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {CurveStripArrow} from '../geometry/curveStripArrow.js';
import {Curve} from '../geometry/curve.js';
import {Strip} from '../geometry/strip.js';
import {Tube} from '../geometry/tube.js';

class Strand {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // significantly modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create the style of ribbon or strand for "atoms". "num" means how many lines define the curve.
    //"num" is 2 for ribbon and 6 for strand. "div" means how many pnts are used to smooth the curve.
    //It's typically 5. "coilWidth" is the width of curve for coil. "helixSheetWidth" is the width of curve for helix or sheet.
    //"doNotSmoothen" is a flag to smooth the curve or not. "thickness" is the thickness of the curve.
    //"bHighlight" is an option to draw the highlight for these atoms. The highlight could be outlines
    //with bHighlight=1 and 3D objects with bHighlight=2.
    createStrand(atoms, num, div, fill, coilWidth, helixSheetWidth, doNotSmoothen, thickness, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let bRibbon = fill ? true: false;

        // when highlight, the input atoms may only include part of sheet or helix
        // include the whole sheet or helix when highlighting
        let atomsAdjust = {};

        //if( (bHighlight === 1 || bHighlight === 2) && !ic.bAllAtoms) {
        //if( !ic.bAllAtoms) {
        if( Object.keys(atoms).length < Object.keys(ic.atoms).length) {
            atomsAdjust = this.getSSExpandedAtoms(atoms);
        }
        else {
            atomsAdjust = atoms;
        }

        if(bHighlight === 2) {
            if(fill) {
                fill = false;
                num = null;
                div = null;
                coilWidth = null;
                helixSheetWidth = null;
                thickness = undefined;
            }
            else {
                fill = true;
                num = 2;
                div = undefined;
                coilWidth = undefined;
                helixSheetWidth = undefined;
                thickness = ic.ribbonthickness;
            }
        }

        num = num || ic.strandDIV;
        div = div || ic.axisDIV;
        coilWidth = coilWidth || ic.coilWidth;
        doNotSmoothen = doNotSmoothen || false;
        helixSheetWidth = helixSheetWidth || ic.helixSheetWidth;

        // test the first 30 atoms to see whether only C-alpha is available
        ic.bCalphaOnly = me.utilsCls.isCalphaPhosOnly(atomsAdjust); //, 'CA');

        // get chains
        let chainidHash = {};
        for(let i in atomsAdjust) {
            let atom = ic.atoms[i];
            let chainid = atom.structure + '_' + atom.chain;
            chainidHash[chainid] = 1;
        }

      for(let chainid in chainidHash) {
        let pntsAll = {}; for (let k = 0; k < num; ++k) pntsAll[k] = [];
        let pntsAllSub = {}; for (let k = 0; k < num; ++k) pntsAllSub[k] = [];
        let pntsCA = [], pntsCAAll = [], posArray = [], tubePosArray = [], missingResArray = [];
        let prevCOArray = [], prevCOArrayAll = [];
        let colors = [], colorsAll = [];

        let pntsCAAllSub = [], prevCOArrayAllSub = [], positionsSub = [], colorsAllSub = [];

        let currentChain, currentStyle, currentCA = null, currentColor = null, prevCoorCA = null, prevCoorO = null, prevColor = null;
        let prevCO = null, ss = null, ssend = false, ssJoint = false, prevAtomid = null, prevResi = null, prevResid = null;
        let strandWidth, bSheetSegment = false, bHelixSegment = false;
        let atom, tubeAtoms = [];

        let drawnResidueCount = 0;

        let bFullAtom = (Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length) ? true : false;

        let caArray = []; // record all C-alpha atoms to predict the helix

        let chainAtoms = me.hashUtilsCls.intHash(ic.chains[chainid], atomsAdjust);

        let residueArray = ic.resid2specCls.atoms2residues(Object.keys(chainAtoms));
        let totalResidueCount = residueArray.length;

        let index = 0;

        // get pntsAll, pntsCAAll, prevCOArrayAll, colorsAll
        // get the subdivided points for all atoms
        let resi2pos = {};
        for (let i in ic.chains[chainid]) {
          atom = ic.atoms[i];

          if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
            if (atom.name === 'CA') {
                currentCA = atom.coord;
                currentColor = atom.color;
                caArray.push(atom.serial);
            }

            if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA')) {
                ++index;

                if(currentCA === null || currentCA === undefined) {
                    currentCA = atom.coord;
                    currentColor = atom.color;
                }

                // assign the previous residue
                if(prevCoorO) {
                    // posArray.push(index - 1 - 1);
                    resi2pos[prevResi] = index - 1 - 1;

                    /*
                    strandWidth = (ss === 'coil') ? coilWidth : helixSheetWidth;

                    if(ss == 'sheet' && atom.ss == 'sheet' && atom.ssend) { // a transition between two sheets
                        strandWidth = 1.8 * helixSheetWidth;
                    }
                    else if(ss == 'sheet' && ssend && atom.ss == 'coil') { // a transition between two ss
                        strandWidth = 0;
                    }
                    */
                    strandWidth = helixSheetWidth;

                    if(bHighlight === 1 || bHighlight === 2) {
                        colorsAll.push(ic.hColor);
                    }
                    else {
                        colorsAll.push(prevColor);
                    }

                    let O, oldCA, resSpan = 4;
                    if(atom.name === 'O') {
                        O = prevCoorO.clone();
                        if(prevCoorCA !== null && prevCoorCA !== undefined) {
                            O.sub(prevCoorCA);
                        }
                        else {
                            prevCoorCA = prevCoorO.clone();
                            if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                O = prevCoorCA.clone();
                                oldCA = ic.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
                                //O.sub(oldCA);
                                oldCA.sub(O);
                            }
                            else {
                                O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                            }
                        }
                    }
                    else if(ic.bCalphaOnly && atom.name === 'CA') {
                        if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                            O = prevCoorCA.clone();
                            oldCA = ic.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
                            //O.sub(oldCA);
                            oldCA.sub(O);
                        }
                        else {
                            O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                        }
                    }

                    O.normalize(); // can be omitted for performance
                    O.multiplyScalar(strandWidth);
                    if (prevCO !== null && O.dot(prevCO) < 0) O.negate();
                    prevCO = O;

                    for (let j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
                        let delta = -1 + numM1Inv2 * j;
                        let v = new THREE.Vector3(prevCoorCA.x + prevCO.x * delta, prevCoorCA.y + prevCO.y * delta, prevCoorCA.z + prevCO.z * delta);
                        // no smoothen for the last two residues in sheet
                        // if (!doNotSmoothen && ss === 'sheet' && !ssJoint && !(atom.ssend)) v.smoothen = true;
                        if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
                        pntsAll[j].push(v);
                    }

                    if (!doNotSmoothen && ss === 'sheet') {
                        prevCoorCA.smoothen = true;
                        prevCO.smoothen = true;
                    }
                    pntsCAAll.push(prevCoorCA);
                    prevCOArrayAll.push(prevCO);
                }

                // only update when atom.name === 'O'
                prevResi = atom.resi;

                prevCoorCA = currentCA;
                prevCoorO = atom.coord;
                prevColor = currentColor;

                ss = atom.ss;
                ssend = atom.ssend;
                ssJoint = atom.ssbegin || atom.ssend;
            } // end if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA') ) {
          } // end if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
        } // end for

        // add the last residue
        // posArray.push(index - 1);
        resi2pos[prevResi] = index - 1;

        colorsAll.push(prevColor);
        for (let j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
            let delta = -1 + numM1Inv2 * j;
            let v = new THREE.Vector3(prevCoorCA.x + prevCO.x * delta, prevCoorCA.y + prevCO.y * delta, prevCoorCA.z + prevCO.z * delta);
            // no smoothen for the last two residues in sheet
            //if (!doNotSmoothen && ss === 'sheet' && !ssJoint && !(ssend)) v.smoothen = true;
            if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
            pntsAll[j].push(v);
        }
        if (!doNotSmoothen && ss === 'sheet') {
            prevCoorCA.smoothen = true;
            prevCO.smoothen = true;
        }
        pntsCAAll.push(prevCoorCA);
        prevCOArrayAll.push(prevCO);

        // each point except the last one are divided into div segments. The last point is not divided.
        let pnts_clrs;
        for(let i = 0; i < num; ++i) {
            pnts_clrs = me.subdivideCls.subdivide(pntsAll[i], colorsAll, div);
            pntsAllSub[i] = pnts_clrs[0];
        }

        pnts_clrs = me.subdivideCls.subdivide(pntsCAAll, colorsAll, div);
        pntsCAAllSub = pnts_clrs[0];
        colorsAllSub = pnts_clrs[2];
        
        pnts_clrs = me.subdivideCls.subdivide(prevCOArrayAll, colorsAll, div);
        prevCOArrayAllSub = pnts_clrs[0];
        positionsSub = pnts_clrs[1];

        posArray = [];
        prevCoorO = null;
        prevCoorCA = null;
        ss = null;
        ssend = false;
        ssJoint = false;

        index = 0;
        let tubeIndex = 0;
        let bLastResDrawn = false;

        // draw only for the selected atoms
        for (let i in chainAtoms) {
          atom = ic.atoms[i];
          if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
            // "CA" has to appear before "O"

            if (atom.name === 'CA') {
                // if ( atoms.hasOwnProperty(i) && ((atom.ss !== 'helix' && atom.ss !== 'sheet') || atom.ssend || atom.ssbegin) ) {
                if ( atoms.hasOwnProperty(i) && ((atom.ss !== 'helix' && atom.ss !== 'sheet') ) ) {
                    tubeAtoms.push(atom);
                    let pos = resi2pos[atom.resi];
                    tubePosArray.push(pos);

                    continue;
                }
            }

            if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA')) {
                ++index;

                currentCA = atom.coord;

                // smoothen each coil, helix and sheet separately. The joint residue has to be included both in the previous and next segment
                // if((atom.ssend || currentStyle != atom.style)&& atom.ss === 'sheet') {
                //     bSheetSegment = true;
                // }
                // else if((atom.ssend || currentStyle != atom.style) && atom.ss === 'helix') {
                //     bHelixSegment = true;
                // }
                if(atom.ss === 'sheet') {
                    bSheetSegment = true;
                    bHelixSegment = false;
                }
                else if(atom.ss === 'helix') {
                    bSheetSegment = false;
                    bHelixSegment = true;
                }
                else {
                    bSheetSegment = false;
                    bHelixSegment = false;
                }

                // assign the previous residue
                if(prevCoorO) {
                    //pntsCA.push(prevCoorCA);
                    //prevCOArray.push(prevCO);
                    let pos = resi2pos[prevResi];
                    // posArray.push(index - 1 - 1);
                    posArray.push(pos);

                    let bMissingStart = ic.missingResStart[prevResid];
                    let bMissingEnd = ic.missingResEnd[prevResid];
                    let missingResType = bMissingStart ? 1 : (bMissingEnd ? 2 : 0);
                    missingResArray.push(missingResType);

                    ++drawnResidueCount;
                }

                let maxDist = 6.0;
                let bBrokenSs = (ic.ParserUtilsCls.getResiNCBI(chainid, atom.resi) > ic.ParserUtilsCls.getResiNCBI(chainid,prevResi) + 1) || (prevCoorCA && Math.abs(currentCA.x - prevCoorCA.x) > maxDist) || (prevCoorCA && Math.abs(currentCA.y - prevCoorCA.y) > maxDist) || (prevCoorCA && Math.abs(currentCA.z - prevCoorCA.z) > maxDist);

                // check for the last atom
                if ((atom.ssbegin || atom.ssend || bBrokenSs || currentStyle != atom.style || currentChain !== atom.chain) ) {
                //   && posArray.length > 0) {
                    if(!bBrokenSs) { // include the current residue
                        if(drawnResidueCount === totalResidueCount - 1) bLastResDrawn = true;

                        let pos = resi2pos[atom.resi];
                        // posArray.push(index - 1);
                        posArray.push(pos);

                        let bMissingStart = ic.missingResStart[atom.structure + '_' + atom.chain + '_' + atom.resi];
                        let bMissingEnd = ic.missingResEnd[atom.structure + '_' + atom.chain + '_' + atom.resi];
                        let missingResType = bMissingStart ? 1 : (bMissingEnd ? 2 : 0);
                        missingResArray.push(missingResType);
                    }

                    bSheetSegment = prevCoorO ? (ss === 'sheet') : (atom.ss === 'sheet');
                    bHelixSegment = prevCoorO ? (ss === 'helix') : (atom.ss === 'helix');
                    // skip the 2-residue joint between two adjacent SS (sheet end -> helix begin)
                    if(!(ssend && atom.ssbegin)) {
                        this.createStrand_base(posArray, pntsAllSub, pntsCAAllSub, prevCOArrayAllSub, colorsAllSub, positionsSub, missingResArray, fill, bHighlight, bRibbon, num, bSheetSegment, bHelixSegment, bFullAtom, thickness);
                    }
                    posArray = [];
                    missingResArray = [];
                } // end if (atom.ssbegin || atom.ssend)

                currentChain = atom.chain;
                currentStyle = atom.style;
                ss = atom.ss;
                ssend = atom.ssend;
                prevAtomid = atom.serial;
                prevResi = atom.resi;

                prevResid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                // only update when atom.name === 'O'
                prevCoorCA = currentCA;
                prevCoorO = atom.coord;
                prevColor = currentColor;
            } // end if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA') ) {
          } // end if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
        } // end for

        // draw the last residue
        if(!bLastResDrawn && drawnResidueCount === totalResidueCount - 1) {
            let pos = resi2pos[prevResi];
            // posArray.push(index - 1);
            posArray.push(pos);

            let bMissingStart = ic.missingResStart[prevResid];
            let bMissingEnd = ic.missingResEnd[prevResid];
            let missingResType = bMissingStart ? 1 : (bMissingEnd ? 2 : 0);
            missingResArray.push(missingResType);

            bSheetSegment = prevCoorO ? (ss === 'sheet') : (atom.ss === 'sheet');
            bHelixSegment = prevCoorO ? (ss === 'helix') : (atom.ss === 'helix');
            this.createStrand_base(posArray, pntsAllSub, pntsCAAllSub, prevCOArrayAllSub, colorsAllSub, positionsSub, missingResArray, fill, bHighlight, bRibbon, num, bSheetSegment, bHelixSegment, bFullAtom, thickness);
        } // end if (atom.ssbegin || atom.ssend)

        ic.tubeCls.createTube(tubeAtoms, 'CA', coilWidth, bHighlight, undefined, undefined, tubePosArray, pntsCAAllSub, colorsAllSub);
        
        caArray = [];
        tubeAtoms = [];
        posArray = [];
        missingResArray = [];
        tubePosArray = [];

        pntsCA = [], prevCOArray = [], colors = [];
        pntsAll = {}, pntsCAAll = [], prevCOArrayAll = [], colorsAll = [];
      } // end for chainid in ic.chains
    }

    createStrand_base(posArray, pntsAllSub, pntsCAAllSub, prevCOArrayAllSub, colorsAllSub, positionsSub, missingResArray, fill, bHighlight, bRibbon, num, bSheetSegment, bHelixSegment, bFullAtom, thickness) { let ic = this.icn3d, me = ic.icn3dui;
        let pntsCATmp = [], prevCOArrayTmp = [], colorsTmp = [], positionsTmp = [];
        let pntsTmp = {}; for (let k = 0; k < num; ++k) pntsTmp[k] = [];
        let half = Math.floor(ic.axisDIV / 2) - 1;

        for(let j = 0, jl = posArray.length; j < jl; ++j) {
            let pos = posArray[j];
            let missingResType = missingResArray[j];

            let offsetStart = (missingResType == 1) ?  half : 0;
            let offsetEnd = (missingResType == 2) ?  half : 0;

            let indexArray = this.pos2IndexArray(pos, pntsCAAllSub);

            for(let k = offsetEnd, kl = indexArray.length - offsetStart; k < kl; ++k) {
                pntsCATmp.push(pntsCAAllSub[indexArray[k]]);
                prevCOArrayTmp.push(prevCOArrayAllSub[indexArray[k]]);
                colorsTmp.push(colorsAllSub[indexArray[k]]);
                positionsTmp.push(positionsSub[indexArray[k]]);
            }

            for(let k = 0; k < num; ++k) {
                for(let l = 0, ll = indexArray.length; l < ll; ++l) {
                    pntsTmp[k].push(pntsAllSub[k][indexArray[l]]);
                }
            }
        }

        // draw the current segment
        for (let j = 0; !fill && j < num; ++j) {
            if(bSheetSegment) {
                ic.curveStripArrowCls.createCurveSubArrow(pntsTmp[j], 1, colorsTmp, 1, bHighlight, bRibbon, num, j, pntsCATmp, prevCOArrayTmp, positionsTmp, true);
            }
            else if(bHelixSegment) {
                if(bFullAtom) {
                    ic.curveCls.createCurveSub(pntsTmp[j], 1, colorsTmp, 1, bHighlight, bRibbon, false, undefined);
                }
                else {
                    ic.curveStripArrowCls.createCurveSubArrow(pntsTmp[j], 1, colorsTmp, 1, bHighlight, bRibbon, num, j, pntsCATmp, prevCOArrayTmp, positionsTmp, false);
                }
            }
        }
        if (fill) {
            if(bSheetSegment) {
                let start = 0, end = num - 1;
                ic.curveStripArrowCls.createStripArrow(pntsTmp[0], pntsTmp[num - 1], colorsTmp, 1, thickness, bHighlight, num, start, end, pntsCATmp, prevCOArrayTmp, positionsTmp, true);
            }
            else if(bHelixSegment) {
                if(bFullAtom) {
                    ic.stripCls.createStrip(pntsTmp[0], pntsTmp[num - 1], colorsTmp, 1, thickness, bHighlight, false, undefined, pntsCATmp, prevCOArrayTmp);
                }
                else {
                    let start = 0, end = num - 1;
                    ic.curveStripArrowCls.createStripArrow(pntsTmp[0], pntsTmp[num - 1], colorsTmp, 1, thickness, bHighlight, num, start, end, pntsCATmp, prevCOArrayTmp, positionsTmp, false);
                }
            }
            else {
                if(bHighlight === 2) { // draw coils only when highlighted. if not highlighted, coils will be drawn as tubes separately
                    ic.stripCls.createStrip(pntsTmp[0], pntsTmp[num - 1], colorsTmp, 1, thickness, bHighlight, false, undefined, pntsCATmp, prevCOArrayTmp);
                }
            }
        }
    }

    getSSExpandedAtoms(atoms, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        let currChain, currResi, currAtom, prevChain, prevResi, prevAtom;
        let firstAtom, lastAtom;
        let index = 0, length = Object.keys(atoms).length;

        let atomsAdjust = me.hashUtilsCls.cloneHash(atoms);
        for(let serial in atoms) {
          currChain = atoms[serial].structure + '_' + atoms[serial].chain;
          currResi = atoms[serial].resi; //parseInt(atoms[serial].resi);
          currAtom = atoms[serial];

          if(prevChain === undefined) firstAtom = atoms[serial];

          if( (currChain !== prevChain && prevChain !== undefined)
           || (currResi !== prevResi && currResi !== parseInt(prevResi) + 1 && prevResi !== undefined) || index === length - 1) {
            if( (currChain !== prevChain && prevChain !== undefined)
              || (currResi !== prevResi && currResi !== parseInt(prevResi) + 1 && prevResi !== undefined) ) {
                lastAtom = prevAtom;
            }
            else if(index === length - 1) {
                lastAtom = currAtom;
            }
/*
            // fill the beginning
            let beginResi = firstAtom.resi;
            if(!isNaN(firstAtom.resi) && firstAtom.ss !== 'coil' && !(firstAtom.ssbegin) ) {
                for(let i = parseInt(firstAtom.resi) - 1; i > 0; --i) {
                    let residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                    if(!ic.residues.hasOwnProperty(residueid)) break;

                    let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);

                    if(atom.ss === firstAtom.ss && atom.ssbegin) {
                        beginResi = atom.resi;
                        break;
                    }
                }

                for(let i = beginResi; i < firstAtom.resi; ++i) {
                    let residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                    atomsAdjust = me.hashUtilsCls.unionHash(atomsAdjust, me.hashUtilsCls.hash2Atoms(ic.residues[residueid],
                      ic.atoms));
                }
            }
*/
            // add one extra residue for coils between strands/helix if the style is NOT stick, ball and stick, lines, sphere, and dot
            // if(!isNaN(firstAtom.resi) && ic.pk === 3 && bHighlight === 1 && firstAtom.ss === 'coil') {
            if(!isNaN(firstAtom.resi) && ic.pk === 3 && bHighlight === 1 && firstAtom.ss === 'coil' && firstAtom.style != 'stick' && firstAtom.style != 'ball and stick' && firstAtom.style != 'lines' && firstAtom.style != 'sphere' && firstAtom.style != 'dot') {
                    let residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + (parseInt(firstAtom.resi) - 1).toString();
                    if(ic.residues.hasOwnProperty(residueid)) {
                        atomsAdjust = me.hashUtilsCls.unionHash(atomsAdjust, me.hashUtilsCls.hash2Atoms(ic.residues[residueid],
                          ic.atoms));
                        atoms = me.hashUtilsCls.unionHash(atoms, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                    }
            }
/*
            // fill the end
            let endResi = lastAtom.resi;
            // when a coil connects to a sheet and the last residue of coil is highlighted, the first sheet residue is set as atom.notshow. This residue should not be shown.

            if(lastAtom.ss !== undefined && lastAtom.ss !== 'coil' && !(lastAtom.ssend) && !(lastAtom.notshow)) {

                let endChainResi = ic.firstAtomObjCls.getLastAtomObj(ic.chains[lastAtom.structure + '_' + lastAtom.chain]).resi;
                for(let i = parseInt(lastAtom.resi) + 1; i <= parseInt(endChainResi); ++i) {
                    let residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
                    if(!ic.residues.hasOwnProperty(residueid)) break;

                    let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);

                    if(atom.ss === lastAtom.ss && atom.ssend) {
                        endResi = atom.resi;
                        break;
                    }
                }

                for(let i = parseInt(lastAtom.resi) + 1; i <= parseInt(endResi); ++i) {
                    let residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
                    atomsAdjust = me.hashUtilsCls.unionHash(atomsAdjust, me.hashUtilsCls.hash2Atoms(ic.residues[residueid],
                      ic.atoms));
                }
            }
*/
            // add one extra residue for coils between strands/helix if the style is NOT stick, ball and stick, lines, sphere, and dot
            if(ic.pk === 3 && bHighlight === 1 && lastAtom.ss === 'coil' && firstAtom.style != 'stick' && firstAtom.style != 'ball and stick' && firstAtom.style != 'lines' && firstAtom.style != 'sphere' && firstAtom.style != 'dot') {
                    let residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + (parseInt(lastAtom.resi) + 1).toString();
                    if(ic.residues.hasOwnProperty(residueid)) {
                        atomsAdjust = me.hashUtilsCls.unionHash(atomsAdjust, me.hashUtilsCls.hash2Atoms(ic.residues[residueid],
                          ic.atoms));
                        atoms = me.hashUtilsCls.unionHash(atoms, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                    }
            }

            // reset notshow
            if(lastAtom.notshow) lastAtom.notshow = undefined;

            firstAtom = currAtom;
          }

          prevChain = currChain;
          prevResi = currResi;
          prevAtom = currAtom;

          ++index;
        }

        return atomsAdjust;
    }

    pos2IndexArray(pos, pntsCAAllSub) { let ic = this.icn3d, me = ic.icn3dui;
        let indexArray = [];

        let offset = Math.floor(ic.axisDIV / 2) + 1; // first residue has floor(DIV/2)+1 points (8 when axisDIV = 15)

        //subdivide() gives the first residue only floor(DIV/2)+1 points (8 when axisDIV = 15) and each later residue 15.
        if(pos == 0) {
            for(let j = 0; j < offset; ++j) {
                indexArray.push(j);
            }
        }
        else {
            for(let j = 0; j < ic.axisDIV; ++j) {
                let index = offset  + (pos - 1) * ic.axisDIV + j;
                if(index >= pntsCAAllSub.length) {
                    indexArray.push(pntsCAAllSub.length - 1);
                    break;
                } else {
                    indexArray.push(index);
                }
            }
        }

        return indexArray;
    }
}

export {Strand}
