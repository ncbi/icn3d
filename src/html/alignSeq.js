/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import { Html } from './html.js';
import { HashUtilsCls } from '../utils/hashUtilsCls.js';
import { FirstAtomObj } from '../icn3d/selection/firstAtomObj.js';

class AlignSeq {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    //Set up the sequence display with the aligned sequences. Either chains in "alignChainArray" or residues
    //in "residueArray" will be highlighted. "bUpdateHighlightAtoms" is a flag to update the highlight atoms
    //or not. "bShowHighlight" is a flag to show highlight or not.
    getAlignSequencesAnnotations(alignChainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight, bOnechain, bReverse) {
        let me = this.icn3dui,
            ic = me.icn3d;
        let sequencesHtml = '';

        alignChainArray = Object.keys(ic.alnChains);

        if (bReverse) alignChainArray = alignChainArray.reverse();

        let maxSeqCnt = 0;

        let chainHash = {}
        if (alignChainArray !== undefined) {
            for (let i = 0, il = alignChainArray.length; i < il; ++i) {
                chainHash[alignChainArray[i]] = 1;
            }
        }

        //  let bModifyHAtoms = Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length && bHighlightChain &&(bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms);
        //  let bModifyHAtoms = Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length &&(bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms);
        let bModifyHAtoms = (bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms);

        if (bModifyHAtoms) {
            ic.hAtoms = {}
        }

        let bHighlightChain;
        let index = 0,
            prevResCnt2nd = 0;
        let firstChainid, oriChainid;
        //  for(let i in ic.alnChains) {
        for (let m = 0, ml = alignChainArray.length; m < ml; ++m) {
            let i = alignChainArray[m];

            if (index == 0) firstChainid = i;

            if (bOnechain && index > 0) {
                oriChainid = firstChainid;
            } else {
                oriChainid = i;
            }

            //bHighlightChain =(alignChainArray !== undefined && chainHash.hasOwnProperty(oriChainid)) ? true : false;

            //if( bHighlightChain &&(bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms) ) {
            // do not update isa subset is selected already
            if (bModifyHAtoms) {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.alnChains[i]);
            }

            let resiHtmlArray = [],
                seqHtml = "";
            let seqLength = (ic.alnChainsSeq[i] !== undefined) ? ic.alnChainsSeq[i].length : 0;

            if (seqLength > maxSeqCnt) maxSeqCnt = seqLength;

            let dashPos = oriChainid.indexOf('_');
            let structure = oriChainid.substr(0, dashPos);
            let chain = oriChainid.substr(dashPos + 1);

            let startResi = (ic.alnChainsSeq[i][0] !== undefined) ? ic.alnChainsSeq[i][0].resi : '';
            seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + startResi + "</span>";
            bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(oriChainid)) ? true : false;

            for (let k = 0, kl = seqLength; k < kl; ++k) {
                // resiId is empty if it's gap
                let resiId = 'N/A',
                    resIdFull = '',
                    color = '#000';
                if (ic.alnChainsSeq[i][k].resi !== '' && !isNaN(ic.alnChainsSeq[i][k].resi)) {
                    resiId = ic.alnChainsSeq[i][k].resi;
                    resIdFull = structure + "_" + chain + "_" + resiId;
                    color = ic.alnChainsSeq[i][k].color;
                }

                let classForAlign = "class='icn3d-residue"; // used to identify a residue when clicking a residue in sequence

                //if((bShowHighlight === undefined || bShowHighlight) &&(bHighlightChain ||(ic.alnChainsSeq[i][k].aligned === 2 && residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) ) {
                if ((bShowHighlight === undefined || bShowHighlight) && (bHighlightChain || (residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1))) {
                    classForAlign = "class='icn3d-residue icn3d-highlightSeq";
                }

                // class for alignment: cons, ncons, nalign
                if (resIdFull === '') {
                    classForAlign += "'";
                } else {
                    classForAlign += " " + ic.alnChainsSeq[i][k].class + "'";
                }

                let colorRes;
                if (!ic.residues.hasOwnProperty(resIdFull)) {
                    colorRes = '#000000;';
                } else {
                    let firstAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resIdFull]);
                    colorRes = (firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() + ';' : '#000000;';
                }

                if (colorRes.toUpperCase() === '#FFFFFF;') colorRes = me.htmlCls.GREYD;

                let bWithCoord = (resIdFull !== '') ? true : false;

                if (bOnechain && k == 0) {
                    let letterSpace = 10;
                    let empthWidth = prevResCnt2nd * letterSpace;
                    seqHtml += "<span style='width:" + empthWidth + "px'></span>";
                }

                if (bWithCoord) {
                    if (ic.alnChainsSeq[i][k].resi != -1) {
                        // add "align" in front of id so that full sequence and aligned sequence will not conflict
                        seqHtml += "<span id='align_" + me.pre + resIdFull + "' " + classForAlign + " style='color:" + colorRes + "' title='" + ic.alnChainsSeq[i][k].resn + ic.alnChainsSeq[i][k].resi + "'>" + ic.alnChainsSeq[i][k].resn + "</span>";
                    } else {
                        seqHtml += "<span>" + ic.alnChainsSeq[i][k].resn + "</span>";
                    }
                } else {
                    seqHtml += "<span title='" + ic.alnChainsSeq[i][k].resn + ic.alnChainsSeq[i][k].resi + "'>" + ic.alnChainsSeq[i][k].resn + "</span>";
                }

            }
            let endResi = (ic.alnChainsSeq[i][seqLength - 1] !== undefined) ? ic.alnChainsSeq[i][seqLength - 1].resi : '';
            seqHtml += "<span class='icn3d-residueNum' title='ending residue number'>" + endResi + "</span>";

            // the first chain stores all annotations
            let annoLength = (ic.alnChainsAnno[i] !== undefined) ? ic.alnChainsAnno[i].length : 0;

            for (let j = 0, jl = annoLength; j < jl; ++j) {
                resiHtmlArray[j] = "";

                let chainid = (j == 0 && annoLength >= 7) ? ic.alnChainsAnTtl[i][4][0] : oriChainid; // bottom secondary, j == 0: chain2,  next secondary, j == 1: chain1,

                resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
                for (let k = 0, kl = ic.alnChainsAnno[i][j].length; k < kl; ++k) {
                    let text = ic.alnChainsAnno[i][j][k];

                    if (text == 'H' || text == 'E' || text == 'c' || text == 'o') {

                        if (text == 'H') {
                            if (k % 2 == 0) {
                                resiHtmlArray[j] += '<span class="icn3d-helix">&nbsp;</span>';
                            } else {
                                resiHtmlArray[j] += '<span class="icn3d-helix2">&nbsp;</span>';
                            }
                        } else if (text == 'E') {
                            if (ic.alnChainsSeq[chainid][k] !== undefined) {
                                //var resiId = ic.alnChainsSeq[i][k].resi;
                                let resiId = ic.alnChainsSeq[chainid][k].resi;
                                let resIdFull = chainid + "_" + resiId;

                                if (ic.residues.hasOwnProperty(resIdFull)) {
                                    let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resIdFull]);

                                    if (atom.ssend) {
                                        resiHtmlArray[j] += '<span class="icn3d-sheet2">&nbsp;</span>';
                                    } else {
                                        resiHtmlArray[j] += '<span class="icn3d-sheet">&nbsp;</span>';
                                    }
                                }
                            }
                        } else if (text == 'c') {
                            resiHtmlArray[j] += '<span class="icn3d-coil">&nbsp;</span>';
                        } else if (text == 'o') {
                            resiHtmlArray[j] += '<span class="icn3d-other">&nbsp;</span>';
                        } else {
                            resiHtmlArray[j] += "<span></span>";
                        }
                    } else {
                        resiHtmlArray[j] += "<span>" + text + "</span>";
                    }
                    //resiHtmlArray[j] += "<span>" + ic.alnChainsAnno[i][j][k] + "</span>";
                }
                resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
            }

            let chainidTmp = i,
                title = (ic.pdbid_chain2title !== undefined) ? ic.pdbid_chain2title[oriChainid] : '';

            // add markers and residue numbers
            for (let j = annoLength - 1; j >= 0; --j) {
                let annotitle = ic.alnChainsAnTtl[i][j][0];
                if (annotitle == 'SS') annotitle = '';
                //sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-seqTitle' chain='" + i + "' anno='" + j + "'>" + annotitle + "</div>" + resiHtmlArray[j] + "<br/></div>";
                sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-seqTitle' anno='" + j + "'>" + annotitle + "</div>" + resiHtmlArray[j] + "<br/></div>";
            }

            sequencesHtml += '<div class="icn3d-seqTitle icn3d-link icn3d-blue" chain="' + i + '" anno="sequence" title="' + title + '">' + chainidTmp + ' </div><span class="icn3d-seqLine">' + seqHtml + '</span><br/>';

            if (index > 0) prevResCnt2nd += seqLength;

            ++index;
        }

        return { "sequencesHtml": sequencesHtml, "maxSeqCnt": maxSeqCnt }
    }
}

export { AlignSeq }