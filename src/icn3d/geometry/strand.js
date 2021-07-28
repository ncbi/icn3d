/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

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
        if(ic.icn3dui.bNode) return;

        let bRibbon = fill ? true: false;

        // when highlight, the input atoms may only include part of sheet or helix
        // include the whole sheet or helix when highlighting
        let atomsAdjust = {};

        //if( (bHighlight === 1 || bHighlight === 2) && !ic.bAllAtoms) {
        if( !ic.bAllAtoms) {
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
        let pnts = {}; for (let k = 0; k < num; ++k) pnts[k] = [];
        let pntsCA = [];
        let prevCOArray = [];
        let bShowArray = [];
        let calphaIdArray = []; // used to store one of the final positions drawn in 3D
        let colors = [];
        let currentChain, currentResi, currentCA = null, currentO = null, currentColor = null, prevCoorCA = null, prevCoorO = null, prevColor = null;
        let prevCO = null, ss = null, ssend = false, atomid = null, prevAtomid = null, prevResi = null, calphaid = null, prevCalphaid = null;
        let strandWidth, bSheetSegment = false, bHelixSegment = false;
        let atom, tubeAtoms = {};

        // test the first 30 atoms to see whether only C-alpha is available
        ic.bCalphaOnly = me.utilsCls.isCalphaPhosOnly(atomsAdjust); //, 'CA');

        // when highlight, draw whole beta sheet and use bShowArray to show the highlight part
        let residueHash = {};
        for(let i in atomsAdjust) {
            let atom = atomsAdjust[i];

            let residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residueHash[residueid] = 1;
        }
        let totalResidueCount = Object.keys(residueHash).length;

        let drawnResidueCount = 0;
        let highlightResiduesCount = 0;

        let bFullAtom = (Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length) ? true : false;

        let caArray = []; // record all C-alpha atoms to predict the helix

        for (let i in atomsAdjust) {
          atom = atomsAdjust[i];
          let atomOxygen = undefined;
          if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
            // "CA" has to appear before "O"

            if (atom.name === 'CA') {
                if ( atoms.hasOwnProperty(i) && ((atom.ss !== 'helix' && atom.ss !== 'sheet') || atom.ssend || atom.ssbegin) ) {
                    tubeAtoms[i] = atom;
                }

                currentCA = atom.coord;
                currentColor = atom.color;
                calphaid = atom.serial;

                caArray.push(atom.serial);
            }

            if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA')) {
                if(currentCA === null || currentCA === undefined) {
                    currentCA = atom.coord;
                    currentColor = atom.color;
                    calphaid = atom.serial;
                }

                if(atom.name === 'O') {
                    currentO = atom.coord;
                }
                // smoothen each coil, helix and sheet separately. The joint residue has to be included both in the previous and next segment
                let bSameChain = true;
//                    if (currentChain !== atom.chain || currentResi + 1 !== atom.resi) {
                if (currentChain !== atom.chain) {
                    bSameChain = false;
                }

                if(atom.ssend && atom.ss === 'sheet') {
                    bSheetSegment = true;
                }
                else if(atom.ssend && atom.ss === 'helix') {
                    bHelixSegment = true;
                }

                // assign the previous residue
                if(prevCoorO) {
                    if(bHighlight === 1 || bHighlight === 2) {
                        colors.push(ic.hColor);
                    }
                    else {
                        colors.push(prevColor);
                    }

                    if(ss !== 'coil' && atom.ss === 'coil') {
                        strandWidth = coilWidth;
                    }
                    else if(ssend && atom.ssbegin) { // a transition between two ss
                        strandWidth = coilWidth;
                    }
                    else {
                        strandWidth = (ss === 'coil') ? coilWidth : helixSheetWidth;
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
                        if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
                        pnts[j].push(v);
                    }

                    pntsCA.push(prevCoorCA);
                    prevCOArray.push(prevCO);

                    if(atoms.hasOwnProperty(prevAtomid)) {
                        bShowArray.push(prevResi);
                        calphaIdArray.push(prevCalphaid);

                        ++highlightResiduesCount;
                    }
                    else {
                        bShowArray.push(0);
                        calphaIdArray.push(0);
                    }

                    ++drawnResidueCount;
                }

                let maxDist = 6.0;
                let bBrokenSs = (prevCoorCA && Math.abs(currentCA.x - prevCoorCA.x) > maxDist) || (prevCoorCA && Math.abs(currentCA.y - prevCoorCA.y) > maxDist) || (prevCoorCA && Math.abs(currentCA.z - prevCoorCA.z) > maxDist);

                if ((atom.ssbegin || atom.ssend || (drawnResidueCount === totalResidueCount - 1) || bBrokenSs) && pnts[0].length > 0 && bSameChain) {
                    let atomName = 'CA';

                    let prevone = [], nexttwo = [];

                    if(isNaN(ic.atoms[prevAtomid].resi)) {
                        prevone = [];
                    }
                    else {
                        let prevoneResid = ic.atoms[prevAtomid].structure + '_' + ic.atoms[prevAtomid].chain + '_' + (parseInt(ic.atoms[prevAtomid].resi) - 1).toString();
                        let prevoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(prevoneResid, atomName);
                        prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];
                    }

                    if(!isNaN(ic.atoms[prevAtomid].resi)) {
                        let nextoneResid = ic.atoms[prevAtomid].structure + '_' + ic.atoms[prevAtomid].chain + '_' + (parseInt(ic.atoms[prevAtomid].resi) + 1).toString();
                        let nextoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nextoneResid, atomName);
                        if(nextoneCoord !== undefined) {
                            nexttwo.push(nextoneCoord);
                        }

                        let nexttwoResid = ic.atoms[prevAtomid].structure + '_' + ic.atoms[prevAtomid].chain + '_' + (parseInt(ic.atoms[prevAtomid].resi) + 2).toString();
                        let nexttwoCoord = ic.firstAtomObjCls.getAtomCoordFromResi(nexttwoResid, atomName);
                        if(nexttwoCoord !== undefined) {
                            nexttwo.push(nexttwoCoord);
                        }
                    }

                    if(!bBrokenSs) { // include the current residue
                        // assign the current joint residue to the previous segment
                        if(bHighlight === 1 || bHighlight === 2) {
                            colors.push(ic.hColor);
                        }
                        else {
                            //colors.push(atom.color);
                            colors.push(prevColor);
                        }

                        if(atom.ssend && atom.ss === 'sheet') { // current residue is the end of ss and is the end of arrow
                            strandWidth = 0; // make the arrow end sharp
                        }
                        else if(ss === 'coil' && atom.ssbegin) {
                            strandWidth = coilWidth;
                        }
                        else if(ssend && atom.ssbegin) { // current residue is the start of ss and  the previous residue is the end of ss, then use coil
                            strandWidth = coilWidth;
                        }
                        else { // use the ss from the previous residue
                            strandWidth = (atom.ss === 'coil') ? coilWidth : helixSheetWidth;
                        }

                        let O, oldCA, resSpan = 4;
                        if(atom.name === 'O') {
                            O = currentO.clone();
                            O.sub(currentCA);
                        }
                        else if(ic.bCalphaOnly && atom.name === 'CA') {
                            if(caArray.length > resSpan) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                O = currentCA.clone();
                                oldCA = ic.atoms[caArray[caArray.length - 1 - resSpan]].coord.clone();
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
                            let v = new THREE.Vector3(currentCA.x + prevCO.x * delta, currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
                            if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
                            pnts[j].push(v);
                        }

                        atomid = atom.serial;

                        pntsCA.push(currentCA);
                        prevCOArray.push(prevCO);

                        // when a coil connects to a sheet and the last residue of coild is highlighted, the first sheet residue is set as atom.highlightStyle. This residue should not be shown.
                        //if(atoms.hasOwnProperty(atomid) && (bHighlight === 1 && !atom.notshow) ) {
                        if(atoms.hasOwnProperty(atomid)) {
                            bShowArray.push(atom.resi);
                            calphaIdArray.push(calphaid);
                        }
                        else {
                            bShowArray.push(0);
                            calphaIdArray.push(0);
                        }
                    }

                    // draw the current segment
                    for (let j = 0; !fill && j < num; ++j) {
                        if(bSheetSegment) {
                            ic.curveStripArrowCls.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                        }
                        else if(bHelixSegment) {
                            if(bFullAtom) {
                                ic.curveCls.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                            else {
                                ic.curveStripArrowCls.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                            }
                        }
                    }
                    if (fill) {
                        if(bSheetSegment) {
                            let start = 0, end = num - 1;
                            ic.curveStripArrowCls.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                        }
                        else if(bHelixSegment) {
                            if(bFullAtom) {
                                ic.stripCls.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                            }
                            else {
                                let start = 0, end = num - 1;
                                ic.curveStripArrowCls.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                            }
                        }
                        else {
                            if(bHighlight === 2) { // draw coils only when highlighted. if not highlighted, coils will be drawn as tubes separately
                                ic.stripCls.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                            }
                        }
                    }
                    for (let k = 0; k < num; ++k) pnts[k] = [];

                    colors = [];
                    pntsCA = [];
                    prevCOArray = [];
                    bShowArray = [];
                    calphaIdArray = [];
                    bSheetSegment = false;
                    bHelixSegment = false;
                } // end if (atom.ssbegin || atom.ssend)

                // end of a chain
//                    if ((currentChain !== atom.chain || currentResi + 1 !== atom.resi) && pnts[0].length > 0) {
                if ((currentChain !== atom.chain) && pnts[0].length > 0) {

                    let atomName = 'CA';

                    let prevone = [], nexttwo = [];
                    if(isNaN(ic.atoms[prevAtomid].resi)) {
                        prevone = [];
                    }
                    else {
                        let prevoneResid = ic.atoms[prevAtomid].structure + '_' + ic.atoms[prevAtomid].chain + '_' + (parseInt(ic.atoms[prevAtomid].resi) - 1).toString();
                        let prevoneCoord = ic.firstAtomObjCls.getAtomCoordFromResi(prevoneResid, atomName);
                        let prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];
                    }

                    for (let j = 0; !fill && j < num; ++j) {
                        if(bSheetSegment) {
                            ic.curveStripArrowCls.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                        }
                        else if(bHelixSegment) {
                            if(bFullAtom) {
                                ic.curveCls.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                            else {
                                ic.curveStripArrowCls.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                            }
                        }
                    }
                    if (fill) {
                        if(bSheetSegment) {
                            let start = 0, end = num - 1;
                            ic.curveStripArrowCls.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                        }
                        else if(bHelixSegment) {
                            if(bFullAtom) {
                                ic.stripCls.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                            }
                            else {
                                let start = 0, end = num - 1;
                                ic.curveStripArrowCls.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                            }
                        }
                    }

                    for (let k = 0; k < num; ++k) pnts[k] = [];
                    colors = [];
                    pntsCA = [];
                    prevCOArray = [];
                    bShowArray = [];
                    calphaIdArray = [];
                    bSheetSegment = false;
                    bHelixSegment = false;
                }

                currentChain = atom.chain;
                currentResi = atom.resi;
                ss = atom.ss;
                ssend = atom.ssend;
                prevAtomid = atom.serial;
                prevResi = atom.resi;

                prevCalphaid = calphaid;

                // only update when atom.name === 'O'
                prevCoorCA = currentCA;
                prevCoorO = atom.coord;
                prevColor = currentColor;
            } // end if (atom.name === 'O' || (ic.bCalphaOnly && atom.name === 'CA') ) {
          } // end if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
        } // end for

        caArray = [];

        ic.tubeCls.createTube(tubeAtoms, 'CA', coilWidth, bHighlight);

        tubeAtoms = {};
        pnts = {};
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

            // add one extra residue for coils between strands/helix
            if(!isNaN(firstAtom.resi) && ic.pk === 3 && bHighlight === 1 && firstAtom.ss === 'coil') {
                    let residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + (parseInt(firstAtom.resi) - 1).toString();
                    if(ic.residues.hasOwnProperty(residueid)) {
                        atomsAdjust = me.hashUtilsCls.unionHash(atomsAdjust, me.hashUtilsCls.hash2Atoms(ic.residues[residueid],
                          ic.atoms));
                        atoms = me.hashUtilsCls.unionHash(atoms, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
                    }
            }

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

            // add one extra residue for coils between strands/helix
            if(ic.pk === 3 && bHighlight === 1 && lastAtom.ss === 'coil') {
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
}

export {Strand}
