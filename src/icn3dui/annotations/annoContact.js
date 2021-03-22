/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showInteraction = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    if(me.chainname2residues === undefined && (me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) ) {
        // 2d interaction didn't finish loading data yet
        setTimeout(function(){
          me.showInteraction_base(chnid, chnidBase);
        }, 1000);
    }
    else {
        me.showInteraction_base(chnid, chnidBase);
    }
};
iCn3DUI.prototype.showInteraction_base = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    // set interaction
    if(me.chainname2residues === undefined) me.chainname2residues = {};
    var radius = 4;
    var chainArray = Object.keys(ic.chains);
    var chainid = chnid;
    var pos = Math.round(chainid.indexOf('_'));
    if(pos > 4) return; // NMR structures with structure id such as 2K042,2K043, ...
    var atom = ic.getFirstCalphaAtomObj(ic.chains[chainid]);
    if(me.chainname2residues[chainid] === undefined) {
        me.chainname2residues[chainid] = {};
        var jl = chainArray.length;
        if(jl > 100 && me.cfg.mmdbid === undefined && me.cfg.gi === undefined && me.cfg.blast_rep_id === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined) {
        //if(jl > 100) {
            //console.log("Do not show interactions if there are more than 100 chains");
            $("#" + me.pre + "dt_interaction_" + chnid).html("");
            $("#" + me.pre + "ov_interaction_" + chnid).html("");
            return; // skip interactions if there are more than 100 chains
        }
        for(var j = 0; j < jl; ++j) {
            var chainid2 = chainArray[j];
            if(chainid2 === chainid) continue;
            // interactions should be on the same structure
            if(chainid2.substr(0, chainid2.indexOf('_')) !== chainid.substr(0, chainid.indexOf('_'))) continue;
            pos = Math.round(chainid.indexOf('_'));
            if(pos > 4) continue; // NMR structures with structure id such as 2K042,2K043, ...
            var atom2 = ic.getFirstCalphaAtomObj(ic.chains[chainid2]);
            //if(me.chainname2residues[chainid2] === undefined) me.chainname2residues[chainid2] = {};
            var type2;
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
            var atomsChainid1 = ic.getAtomsWithinAtom(ic.hash2Atoms(ic.chains[chainid]), ic.hash2Atoms(ic.chains[chainid2]), radius);
            if(Object.keys(atomsChainid1).length == 0) continue;
            var residues = {};
            for (var k in atomsChainid1) {
                var atom = ic.atoms[k];
                var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residues[residueid] = 1;
            }
            var name = chainid2.substr(chainid2.indexOf('_') + 1) + " (" + type2 + ")";
            me.chainname2residues[chainid][name] = Object.keys(residues);
        } // for
    }
    var html = '<div id="' + me.pre + chnid + '_interseq_sequence" class="icn3d-dl_sequence">';
    var html2 = html;
    var html3 = html;
    var index = 0;
    for(var chainname in me.chainname2residues[chnid]) {
        var residueArray = me.chainname2residues[chnid][chainname];
        var title = "Interact ." + chainname;
        if(title.length > 17) title = title.substr(0, 17) + '...';
        var fulltitle = "Interact ." + chainname;
        var resPosArray = [];
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            var resid = residueArray[i];
            var resi = Math.round(resid.substr(residueArray[i].lastIndexOf('_') + 1) );
            // exclude chemical, water and ions
            var serial = Object.keys(ic.residues[resid])[0];
            if(ic.proteins.hasOwnProperty(serial) || ic.nucleotides.hasOwnProperty(serial)) {
                resPosArray.push( resi );
            }
        }
        var resCnt = resPosArray.length;
        if(resCnt == 0) continue;
        var chainnameNospace = chainname.replace(/\s/g, '');
        var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" interaction="' + (index+1).toString() + '" posarray="' + resPosArray.toString() + '" shorttitle="' + title + '" setname="' + chnid + '_' + chainnameNospace + '" anno="sequence" chain="' + chnid + '" title="' + fulltitle + '">' + title + ' </div>';
        var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
        html3 += htmlTmp2 + htmlTmp3 + '<br>';
        var htmlTmp = '<span class="icn3d-seqLine">';
        html += htmlTmp2 + htmlTmp3 + htmlTmp;
        html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
        var pre = 'inter' + index.toString();
        var prevEmptyWidth = 0;
        var prevLineWidth = 0;
        var widthPerRes = 1;
        for(var i = 0, il = me.giSeq[chnid].length; i < il; ++i) {
          html += me.insertGap(chnid, i, '-');
          if(resPosArray.indexOf(i+1 + me.baseResi[chnid]) != -1) {
              var cFull = me.giSeq[chnid][i];
              var c = cFull;
              if(cFull.length > 1) {
                  c = cFull[0] + '..';
              }
//            var pos = (me.baseResi[chnid] + i+1).toString();
//            var pos = ic.chainsSeq[chnid][i - me.matchedPos[chnid] ].resi;
              var pos = (i >= me.matchedPos[chnid] && i - me.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][i - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + i;
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + cFull + pos + '" class="icn3d-residue">' + c + '</span>';
              html2 += me.insertGapOverview(chnid, i);
              var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * i / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
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
    $("#" + me.pre + "dt_interaction_" + chnid).html(html);
    $("#" + me.pre + "ov_interaction_" + chnid).html(html2);
    $("#" + me.pre + "tt_interaction_" + chnid).html(html3);
    // add here after the ajax call
    if(! me.isMobile()) {
        me.selectSequenceNonMobile();
    }
    else {
        me.selectSequenceMobile();
        me.selectChainMobile();
    }
};
