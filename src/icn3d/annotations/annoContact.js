/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Contact} from '../interaction/contact.js';
import {ShowSeq} from '../annotations/showSeq.js';
import {HlSeq} from '../highlight/hlSeq.js';

class AnnoContact {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the residues interacting with the chain.
    showInteraction(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(ic.chainname2residues === undefined &&(ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.blast_rep_id !== undefined || ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) ) {
            // 2d interaction didn't finish loading data yet
            setTimeout(function(){
              thisClass.showInteraction_base(chnid, chnidBase);
            }, 1000);
        }
        else {
            this.showInteraction_base(chnid, chnidBase);
        }
    }
    showInteraction_base(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        // set interaction
        if(ic.chainname2residues === undefined) ic.chainname2residues = {}
        let radius = 4;
        let chainArray = Object.keys(ic.chains);
        let chainid = chnid;
        let pos = Math.round(chainid.indexOf('_'));
        if(pos > 4) return; // NMR structures with structure id such as 2K042,2K043, ...
        let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainid]);
        if(ic.chainname2residues[chainid] === undefined) {
            ic.chainname2residues[chainid] = {}
            let jl = chainArray.length;
            if(jl > 100 && ic.icn3dui.cfg.mmdbid === undefined && ic.icn3dui.cfg.gi === undefined && ic.icn3dui.cfg.blast_rep_id === undefined && ic.icn3dui.cfg.align === undefined && ic.icn3dui.cfg.chainalign === undefined) {
            //if(jl > 100) {
                //console.log("Do not show interactions if there are more than 100 chains");
                $("#" + ic.pre + "dt_interaction_" + chnid).html("");
                $("#" + ic.pre + "ov_interaction_" + chnid).html("");
                return; // skip interactions if there are more than 100 chains
            }
            for(let j = 0; j < jl; ++j) {
                let chainid2 = chainArray[j];
                if(chainid2 === chainid) continue;
                // interactions should be on the same structure
                if(chainid2.substr(0, chainid2.indexOf('_')) !== chainid.substr(0, chainid.indexOf('_'))) continue;
                pos = Math.round(chainid.indexOf('_'));
                if(pos > 4) continue; // NMR structures with structure id such as 2K042,2K043, ...
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
                // find atoms in chainid1, which interact with chainid2
                let atomsChainid1 = ic.contactCls.getAtomsWithinAtom(me.hashUtilsCls.hash2Atoms(ic.chains[chainid], ic.atoms), me.hashUtilsCls.hash2Atoms(ic.chains[chainid2], ic.atoms), radius);
                if(Object.keys(atomsChainid1).length == 0) continue;
                let residues = {}
                for(let k in atomsChainid1) {
                    let atom = ic.atoms[k];
                    let residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                    residues[residueid] = 1;
                }
                let name = chainid2.substr(chainid2.indexOf('_') + 1) + "(" + type2 + ")";
                ic.chainname2residues[chainid][name] = Object.keys(residues);
            } // for
        }
        let html = '<div id="' + ic.pre + chnid + '_interseq_sequence" class="icn3d-dl_sequence">';
        let html2 = html;
        let html3 = html;
        let index = 0;
        for(let chainname in ic.chainname2residues[chnid]) {
            let residueArray = ic.chainname2residues[chnid][chainname];
            let title = "Interact ." + chainname;
            if(title.length > 17) title = title.substr(0, 17) + '...';
            let fulltitle = "Interact ." + chainname;
            let resPosArray = [];
            for(let i = 0, il = residueArray.length; i < il; ++i) {
                let resid = residueArray[i];
                let resi = Math.round(resid.substr(residueArray[i].lastIndexOf('_') + 1) );
                // exclude chemical, water and ions
                let serial = Object.keys(ic.residues[resid])[0];
                if(ic.proteins.hasOwnProperty(serial) || ic.nucleotides.hasOwnProperty(serial)) {
                    resPosArray.push( resi );
                }
            }
            let resCnt = resPosArray.length;
            if(resCnt == 0) continue;
            let chainnameNospace = chainname.replace(/\s/g, '');
            let htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" interaction="' +(index+1).toString() + '" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_' + chainnameNospace + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
            let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
            html3 += htmlTmp2 + htmlTmp3 + '<br>';
            let htmlTmp = '<span class="icn3d-seqLine">';
            html += htmlTmp2 + htmlTmp3 + htmlTmp;
            html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
            let pre = 'inter' + index.toString();
            let prevEmptyWidth = 0;
            let prevLineWidth = 0;
            let widthPerRes = 1;
            for(let i = 0, il = ic.giSeq[chnid].length; i < il; ++i) {
              html += ic.showSeqCls.insertGap(chnid, i, '-');
              if(resPosArray.indexOf(i+1 + ic.baseResi[chnid]) != -1) {
                  let cFull = ic.giSeq[chnid][i];
                  let c = cFull;
                  if(cFull.length > 1) {
                      c = cFull[0] + '..';
                  }
    //            let pos =(ic.baseResi[chnid] + i+1).toString();
    //            let pos = ic.chainsSeq[chnid][i - ic.matchedPos[chnid] ].resi;
                  let pos =(i >= ic.matchedPos[chnid] && i - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + i;
                  html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + cFull + pos + '" class="icn3d-residue">' + c + '</span>';
                  html2 += ic.showSeqCls.insertGapOverview(chnid, i);
                  let emptyWidth =(ic.icn3dui.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth * i / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
                    //if(emptyWidth < 0) emptyWidth = 0;
                    if(emptyWidth >= 0) {
                    html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
                    html2 += '<div style="display:inline-block; background-color:#000; width:' + widthPerRes + 'px;" title="' + c + pos + '">&nbsp;</div>';
                    prevEmptyWidth += emptyWidth;
                    prevLineWidth += widthPerRes;
                    }
              }
              else {
                html += '<span>-</span>'; //'<span>-</span>';
              }
            }
            htmlTmp = '<span class="icn3d-residueNum" title="residue count">&nbsp;' + resCnt.toString() + ' Residues</span>';
            htmlTmp += '</span>';
            htmlTmp += '<br>';
            html += htmlTmp;
            html2 += htmlTmp;
            ++index;
        }
        html += '</div>';
        html2 += '</div>';
        html3 += '</div>';
        $("#" + ic.pre + "dt_interaction_" + chnid).html(html);
        $("#" + ic.pre + "ov_interaction_" + chnid).html(html2);
        $("#" + ic.pre + "tt_interaction_" + chnid).html(html3);
        // add here after the ajax call
        if(! me.utilsCls.isMobile()) {
            ic.hlSeqCls.selectSequenceNonMobile();
        }
        else {
            ic.hlSeqCls.selectSequenceMobile();
            ic.hlSeqCls.selectChainMobile();
        }
    }

}

export {AnnoContact}
