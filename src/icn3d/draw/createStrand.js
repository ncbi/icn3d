/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// significantly modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createStrand = function (atoms, num, div, fill, coilWidth, helixSheetWidth, doNotSmoothen, thickness, bHighlight) {
    var bRibbon = fill ? true: false;

    // when highlight, the input atoms may only include part of sheet or helix
    // include the whole sheet or helix when highlighting
    var atomsAdjust = {};

    //if( (bHighlight === 1 || bHighlight === 2) && !this.bAllAtoms) {
    if( !this.bAllAtoms) {
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
            thickness = this.ribbonthickness;
        }
    }

    num = num || this.strandDIV;
    div = div || this.axisDIV;
    coilWidth = coilWidth || this.coilWidth;
    doNotSmoothen = doNotSmoothen || false;
    helixSheetWidth = helixSheetWidth || this.helixSheetWidth;
    var pnts = {}; for (var k = 0; k < num; ++k) pnts[k] = [];
    var pntsCA = [];
    var prevCOArray = [];
    var bShowArray = [];
    var calphaIdArray = []; // used to store one of the final positions drawn in 3D
    var colors = [];
    var currentChain, currentResi, currentCA = null, currentO = null, currentColor = null, prevCoorCA = null, prevCoorO = null, prevColor = null;
    var prevCO = null, ss = null, ssend = false, atomid = null, prevAtomid = null, prevResi = null, calphaid = null, prevCalphaid = null;
    var strandWidth, bSheetSegment = false, bHelixSegment = false;
    var atom, tubeAtoms = {};

    // test the first 30 atoms to see whether only C-alpha is available
    this.bCalphaOnly = this.isCalphaPhosOnly(atomsAdjust); //, 'CA');

    // when highlight, draw whole beta sheet and use bShowArray to show the highlight part
    var residueHash = {};
    for(var i in atomsAdjust) {
        var atom = atomsAdjust[i];

        var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        residueHash[residueid] = 1;
    }
    var totalResidueCount = Object.keys(residueHash).length;

    var drawnResidueCount = 0;
    var highlightResiduesCount = 0;

    var bFullAtom = (Object.keys(this.hAtoms).length == Object.keys(this.atoms).length) ? true : false;

    var caArray = []; // record all C-alpha atoms to predict the helix

    for (var i in atomsAdjust) {
        atom = atomsAdjust[i];
        var atomOxygen = undefined;
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

                if (atom.name === 'O' || (this.bCalphaOnly && atom.name === 'CA')) {
                    if(currentCA === null || currentCA === undefined) {
                        currentCA = atom.coord;
                        currentColor = atom.color;
                        calphaid = atom.serial;
                    }

                    if(atom.name === 'O') {
                        currentO = atom.coord;
                    }
                    // smoothen each coil, helix and sheet separately. The joint residue has to be included both in the previous and next segment
                    var bSameChain = true;
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
                            colors.push(this.hColor);
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

                        var O, oldCA, resSpan = 4;
                        if(atom.name === 'O') {
                            O = prevCoorO.clone();
                            if(prevCoorCA !== null && prevCoorCA !== undefined) {
                                O.sub(prevCoorCA);
                            }
                            else {
                                prevCoorCA = prevCoorO.clone();
                                if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                    O = prevCoorCA.clone();
                                    oldCA = this.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
                                    //O.sub(oldCA);
                                    oldCA.sub(O);
                                }
                                else {
                                    O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                                }
                            }
                        }
                        else if(this.bCalphaOnly && atom.name === 'CA') {
                            if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                O = prevCoorCA.clone();
                                oldCA = this.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
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

                        for (var j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
                            var delta = -1 + numM1Inv2 * j;
                            var v = new THREE.Vector3(prevCoorCA.x + prevCO.x * delta, prevCoorCA.y + prevCO.y * delta, prevCoorCA.z + prevCO.z * delta);
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

                    var maxDist = 6.0;
                    var bBrokenSs = (prevCoorCA && Math.abs(currentCA.x - prevCoorCA.x) > maxDist) || (prevCoorCA && Math.abs(currentCA.y - prevCoorCA.y) > maxDist) || (prevCoorCA && Math.abs(currentCA.z - prevCoorCA.z) > maxDist);

                    if ((atom.ssbegin || atom.ssend || (drawnResidueCount === totalResidueCount - 1) || bBrokenSs) && pnts[0].length > 0 && bSameChain) {
                        var atomName = 'CA';

                        var prevone = [], nexttwo = [];

                        var prevoneResid = this.atoms[prevAtomid].structure + '_' + this.atoms[prevAtomid].chain + '_' + (this.atoms[prevAtomid].resi - 1).toString();
                        var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                        prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                        var nextoneResid = this.atoms[prevAtomid].structure + '_' + this.atoms[prevAtomid].chain + '_' + (this.atoms[prevAtomid].resi + 1).toString();
                        var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
                        if(nextoneCoord !== undefined) {
                            nexttwo.push(nextoneCoord);
                        }

                        var nexttwoResid = this.atoms[prevAtomid].structure + '_' + this.atoms[prevAtomid].chain + '_' + (this.atoms[prevAtomid].resi + 2).toString();
                        var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
                        if(nexttwoCoord !== undefined) {
                            nexttwo.push(nexttwoCoord);
                        }

                    if(!bBrokenSs) { // include the current residue
                        // assign the current joint residue to the previous segment
                        if(bHighlight === 1 || bHighlight === 2) {
                            colors.push(this.hColor);
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

                        var O, oldCA, resSpan = 4;
                        if(atom.name === 'O') {
                            O = currentO.clone();
                            O.sub(currentCA);
                        }
                        else if(this.bCalphaOnly && atom.name === 'CA') {
                            if(caArray.length > resSpan) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                O = currentCA.clone();
                                oldCA = this.atoms[caArray[caArray.length - 1 - resSpan]].coord.clone();
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

                        for (var j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
                            var delta = -1 + numM1Inv2 * j;
                            var v = new THREE.Vector3(currentCA.x + prevCO.x * delta, currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
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
                        for (var j = 0; !fill && j < num; ++j) {
                            if(bSheetSegment) {
                                this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                            }
                            else if(bHelixSegment) {
                                if(bFullAtom) {
                                    this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                                else {
                                    this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                                }
                            }
                        }
                        if (fill) {
                            if(bSheetSegment) {
                                var start = 0, end = num - 1;
                                this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                            }
                            else if(bHelixSegment) {
                                if(bFullAtom) {
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                                }
                                else {
                                    var start = 0, end = num - 1;
                                    this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                                }
                            }
                            else {
                                if(bHighlight === 2) { // draw coils only when highlighted. if not highlighted, coils will be drawn as tubes separately
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                                }
                            }
                        }
                        for (var k = 0; k < num; ++k) pnts[k] = [];

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

                        var atomName = 'CA';

                        var prevoneResid = this.atoms[prevAtomid].structure + '_' + this.atoms[prevAtomid].chain + '_' + (this.atoms[prevAtomid].resi - 1).toString();
                        var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                        var prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                        var nexttwo = [];

                        for (var j = 0; !fill && j < num; ++j) {
                            if(bSheetSegment) {
                                this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                            }
                            else if(bHelixSegment) {
                                if(bFullAtom) {
                                    this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                                else {
                                    this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                                }
                            }
                        }
                        if (fill) {
                            if(bSheetSegment) {
                                var start = 0, end = num - 1;
                                this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                            }
                            else if(bHelixSegment) {
                                if(bFullAtom) {
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo, pntsCA, prevCOArray);
                                }
                                else {
                                    var start = 0, end = num - 1;
                                    this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, false, prevone, nexttwo);
                                }
                            }
                        }

                        for (var k = 0; k < num; ++k) pnts[k] = [];
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
                } // end if (atom.name === 'O' || (this.bCalphaOnly && atom.name === 'CA') ) {
        } // end if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
    } // end for

    caArray = [];

    this.createTube(tubeAtoms, 'CA', coilWidth, bHighlight);

    tubeAtoms = {};
    pnts = {};
};
