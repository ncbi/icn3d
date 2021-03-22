/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.realignChainOnSeqAlign = function (chainresiCalphaHash2, chainidArray) { var me = this, ic = me.icn3d; "use strict";
//    me.saveSelectionPrep();

//    var index = Object.keys(ic.defNames2Atoms).length;
//    var name = 'alseq_' + index;

//    me.saveSelection(name, name);

    me.opts['color'] = 'grey';
    ic.setColorByOptions(me.opts, ic.dAtoms);

    var struct2SeqHash = {};
    var struct2CoorHash = {};
    var struct2resid = {};
    var lastStruResi = '';

    var mmdbid_t;
    var ajaxArray = [];
    var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=chainalign';

//    for(var serial in ic.hAtoms) {
    for(var i = 0, il = chainidArray.length; i < il; ++i) {
        var pos = chainidArray[i].indexOf('_');
        var mmdbid = chainidArray[i].substr(0, pos).toUpperCase();
        if(i == 0) {
            mmdbid_t = mmdbid;
        }
        else if(mmdbid_t == mmdbid) {
            mmdbid += me.postfix;
        }

        var chainid = mmdbid + chainidArray[i].substr(pos);

        if(!struct2SeqHash.hasOwnProperty(mmdbid)) {
            struct2SeqHash[mmdbid] = '';
            struct2CoorHash[mmdbid] = [];
            struct2resid[mmdbid] = [];
        }

        if(i == 0) { // master
            var resiArray = me.cfg.resnum.split(",");
            var base = ic.chainsSeq[chainid][0].resi;
            for(var j = 0, jl = resiArray.length; j < jl; ++j) {
                if(resiArray[j].indexOf('-') != -1) {
                    var startEnd = resiArray[j].split('-');
                    for(var k = parseInt(startEnd[0]); k <= parseInt(startEnd[1]); ++k) {
                        struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][k - base].name;
                        var bFound = false;
                        for(var serial in ic.residues[chainid + '_' + k]) {
                            var atom = ic.atoms[serial];
                            if( (ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                              || (ic.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                                struct2CoorHash[mmdbid].push(atom.coord.clone());
                                bFound = true;
                                break;
                            }
                        }
                        if(!bFound) struct2CoorHash[mmdbid].push(undefined);

                        struct2resid[mmdbid].push(chainid + '_' + k);
                    }
                }
                else { // one residue
                    var k = parseInt(resiArray[j]);
                    struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][k - base].name;
                    var bFound = false;
                    for(var serial in ic.residues[chainid + '_' + k]) {
                        var atom = ic.atoms[serial];
                        if( (ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                          || (ic.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                            struct2CoorHash[mmdbid].push(atom.coord.clone());
                            bFound = true;
                            break;
                        }
                    }
                    if(!bFound) struct2CoorHash[mmdbid].push(undefined);
                    struct2resid[mmdbid].push(chainid + '_' + k);
                }
            }
        }
        else {
            for(var j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                struct2SeqHash[mmdbid] += ic.chainsSeq[chainid][j].name;
                var resid = chainid + '_' + ic.chainsSeq[chainid][j].resi;
                var bFound = false;
                for(var serial in ic.residues[resid]) {
                    var atom = ic.atoms[serial];
                    if( (ic.proteins.hasOwnProperty(serial) && atom.name == "CA" && atom.elem == "C")
                      || (ic.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*") && atom.elem == "O") ) {
                        struct2CoorHash[mmdbid].push(atom.coord.clone());
                        bFound = true;
                        break;
                    }
                }
                if(!bFound) struct2CoorHash[mmdbid].push(undefined);

                struct2resid[mmdbid].push(resid);
            }
        }

        if(i > 0) {
            var toStruct = mmdbid_t;
            var fromStruct = mmdbid;

            var seq1 = struct2SeqHash[toStruct];
            var seq2 = struct2SeqHash[fromStruct];

            var queryAjax = $.ajax({
               url: url,
               type: 'POST',
               data : {'targets': seq1, 'queries': seq2},
               dataType: 'jsonp',
               cache: true
            });

            ajaxArray.push(queryAjax);
        }
    } // for

    //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
    //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
    $.when.apply(undefined, ajaxArray).then(function() {
       me.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid);
    })
    .fail(function() {
       me.parseChainRealignData(arguments, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid);
    });
};
