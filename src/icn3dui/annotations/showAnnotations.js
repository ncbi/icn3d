/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showAnnotations = function() { var me = this, ic = me.icn3d; "use strict";
    me.openDlg('dl_selectannotations', 'Sequences and Annotations');
    // add note about assembly
    if( (me.bAssemblyNote === undefined || !me.bAssemblyNote) && ic.asuCnt !== undefined ) {
        var html = "     <br><div id='" + me.pre + "assembly_note' style='margin-left:5px;'><span class='icn3d-annoLargeTitle'>Assembly Tips:</span> Only the asymmetric unit is shown in the sequence window.<br>Click \"Assembly\" in the menu \"View\" to switch between asymmetric unit and biological assembly (<b>" + ic.asuCnt + "</b> asymmetric unit).</div>";
        $("#" + me.pre + "dl_annotations_tabs").append(html);
        me.bAssemblyNote = true;
    }
    if(me.bAnnoShown === undefined || !me.bAnnoShown) {
        var chainArray = Object.keys(ic.chains);
        if(me.giSeq === undefined) me.giSeq = {};
        if(me.currClin === undefined) me.currClin = {};
        if(me.resi2disease_nonempty === undefined) me.resi2disease_nonempty = {};
        if(me.baseResi === undefined) me.baseResi = {};
        if(me.matchedPos === undefined) me.matchedPos = {};
        var dialogWidth = (me.cfg.notebook) ? me.WIDTH / 2 : $("#" + me.pre + "dl_selectannotations").dialog( "option", "width" );
        me.seqAnnWidth = dialogWidth - 120 - 30*2 - 50; // title: 120px, start and end resi: 30px, extra space on the left and right: 50px
        me.maxAnnoLength = 1;
        for(var chainid in ic.chainsSeq) {
            if(ic.chainsSeq[chainid].length > me.maxAnnoLength) {
                me.maxAnnoLength = ic.chainsSeq[chainid].length;
            }
        }
        var nucleotide_chainid = {}, chemical_chainid = {}, chemical_set = {};
        me.protein_chainid = {};
        for(var i = 0, il = chainArray.length; i < il; ++i) {
            var pos = Math.round(chainArray[i].indexOf('_'));
            //if(pos > 4) continue; // NMR structures with structure id such as 2K042,2K043, ...
            var atom = ic.getFirstCalphaAtomObj(ic.chains[chainArray[i]]);
            if(atom === undefined) atom = ic.getFirstAtomObj(ic.chains[chainArray[i]]);
            if(atom === undefined) continue;

            // only single letter chain has accession such as 1P9M_A
            var chainLetter = chainArray[i].substr(chainArray[i].indexOf('_') + 1);
            var chainidBase;
            if(chainLetter.indexOf('_') !== -1) { // NCBI modified chainid, e.g., A_1
                chainLetter = chainLetter.substr(0, chainLetter.indexOf('_'));
                chainidBase = chainArray[i].substr(0, chainArray[i].indexOf('_')) + '_' + chainLetter;
            }
            else {
                chainidBase = chainArray[i];
            }
            //if(me.cfg.mmdbid !== undefined) { // protein and chemicals/ions are in different chains
            if(ic.proteins.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                me.protein_chainid[chainArray[i]] = chainidBase;
            }
            else if(ic.nucleotides.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                nucleotide_chainid[chainArray[i]] = chainidBase;
            }
            else {
                if(ic.chainsSeq[chainArray[i]].length > 1) {
                    chemical_chainid[chainArray[i]] = chainidBase;
                }
                else {
                    var name = ic.chainsSeq[chainArray[i]][0].name;
                    var resid = chainArray[i] + '_' + ic.chainsSeq[chainArray[i]][0].resi;
                    if(chemical_set[name] === undefined) chemical_set[name] = [];
                    chemical_set[name].push(resid);
                }
            }
            //}
            // protein and nucleotide chain may have chemicals/ions attached at the end
            if( (me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmtfid !== undefined)
              && (ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) ) {
                for(var r = 0, rl = ic.chainsSeq[chainArray[i]].length; r < rl; ++r) {
                    var resObj = ic.chainsSeq[chainArray[i]][r];
                    if(resObj.name !== '' && resObj.name !== '-' && resObj.name == resObj.name.toUpperCase()) {
                        var resid = chainArray[i] + '_' + resObj.resi;
                        var atom = ic.getFirstCalphaAtomObj(ic.residues[resid]);
                        if(atom === undefined) atom = ic.getFirstAtomObj(ic.chains[chainArray[i]]);
                        if(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) {
                            continue;
                        }
                        else {
                            var name = resObj.name.trim();
                            if(chemical_set[name] === undefined) chemical_set[name] = [];
                            chemical_set[name].push(resid);
                        }
                    } // if(resObj.name !== ''
                } // for(var r = 0
            } // if(me.cfg.mmdbid
        } // for(var i = 0
        if(me.cfg.blast_rep_id === undefined) {
           if(me.bFullUi) {
               if(me.cfg.mmtfid !== undefined) { // mmtf data do NOT have the missing residues
                   var id = chainArray[0].substr(0, chainArray[0].indexOf('_'));
                   $.when(me.downloadMmcifSymmetry(id, 'mmtfid')).then(function() {
                       me.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
                   });
               }
               else {
                   me.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
               }
           }
        }
        else if(me.cfg.blast_rep_id !== undefined) { // align sequence to structure
           var url = me.baseUrl + 'pwaln/pwaln.fcgi?from=querytarget';
           var dataObj = {'targets': me.cfg.blast_rep_id, 'queries': me.cfg.query_id};
           if(me.cfg.query_from_to !== undefined ) {
               // convert from 1-based to 0-based
               var query_from_to_array = me.cfg.query_from_to.split(':');
               for(var i = 0, il = query_from_to_array.length; i < il; ++i) {
                   query_from_to_array[i] = parseInt(query_from_to_array[i]) - 1;
               }
               dataObj['queries'] = me.cfg.query_id + ':' + query_from_to_array.join(':');
           }
           if(me.cfg.target_from_to !== undefined) {
               // convert from 1-based to 0-based
               var target_from_to_array = me.cfg.target_from_to.split(':');
               for(var i = 0, il = target_from_to_array.length; i < il; ++i) {
                   target_from_to_array[i] = parseInt(target_from_to_array[i]) - 1;
               }
               dataObj['targets'] = me.cfg.blast_rep_id + ':' + target_from_to_array.join(':');
           }
           $.ajax({
              url: url,
              type: 'POST',
              data : dataObj,
              dataType: 'jsonp',
              //dataType: 'json',
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                me.seqStructAlignData = data;
                me.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
              }
            });
        } // align seq to structure
    }
    me.bAnnoShown = true;
};
iCn3DUI.prototype.showAnnoSeqData = function(nucleotide_chainid, chemical_chainid, chemical_set) { var me = this, ic = me.icn3d; "use strict";
    me.getAnnotationData();
    var i = 0;
    for(var chain in nucleotide_chainid) {
        me.getSequenceData(chain, nucleotide_chainid[chain], 'nucleotide', i);
        ++i;
    }
    me.interactChainbase = ic.unionHash(me.interactChainbase, me.protein_chainid);
    me.interactChainbase = ic.unionHash(me.interactChainbase, nucleotide_chainid);
    i = 0;
    for(var chain in chemical_chainid) {
        me.getSequenceData(chain, chemical_chainid[chain], 'chemical', i);
        ++i;
    }
    me.interactChainbase = ic.unionHash(me.interactChainbase, chemical_chainid);
    me.ssbondChainbase = ic.unionHash(me.ssbondChainbase, me.protein_chainid);
    me.ssbondChainbase = ic.unionHash(me.ssbondChainbase, chemical_chainid);
    me.crosslinkChainbase = ic.unionHash(me.crosslinkChainbase, me.protein_chainid);
    me.crosslinkChainbase = ic.unionHash(me.crosslinkChainbase, nucleotide_chainid);
    me.crosslinkChainbase = ic.unionHash(me.crosslinkChainbase, chemical_chainid);
    for(var name in chemical_set) {
        me.getCombinedSequenceData(name, chemical_set[name], i);
        ++i;
    }
    me.enableHlSeq();
    setTimeout(function(){
      me.hideAllAnno();
      me.clickCdd();
    }, 0);
};
