/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectTitle = function(that) { var me = this, ic = me.icn3d; "use strict";
  if($(that).hasClass('icn3d-seqTitle')) {
    var chainid = $(that).attr('chain');

    if(me.bAlignSeq) {
        me.bSelectAlignResidue = false;
    }
    else {
        me.bSelectResidue = false;
    }

    if(!me.bAnnotations) {
        me.removeSeqChainBkgd(chainid);
    }
    //else {
    //    me.removeSeqChainBkgd();
    //}

    if(!ic.bCtrl && !ic.bShift) {
        me.removeSeqResidueBkgd();

        me.removeSeqChainBkgd();

        me.currSelectedSets = [];
    }

    $(that).toggleClass('icn3d-highlightSeq');

    var commandname, commanddescr, position;
    if(!me.bAnnotations) {
        if(me.bAlignSeq) {
            commandname = "align_" + chainid;
        }
        else {
            commandname = chainid;
        }
    }
    else {
        commandname = $(that).attr('setname');
        commanddescr = $(that).attr('title');
    }

    if($(that).hasClass('icn3d-highlightSeq')) {
        if(!me.bAnnotations) {
            if(ic.bCtrl || ic.bShift) {
                me.currSelectedSets.push(commandname);
                me.selectAChain(chainid, commandname, true, true);
            }
            else {
                me.currSelectedSets = [commandname];
                me.selectAChain(chainid, commandname, true);
            }

            if(me.bAlignSeq) {
                me.setLogCmd('select alignChain ' + chainid, true);
            }
            else {
                me.setLogCmd('select chain ' + chainid, true);
            }

            var setNames = me.currSelectedSets.join(' or ');
            //if(me.currSelectedSets.length > 1) me.setLogCmd('select saved atoms ' + setNames, true);
            if(me.currSelectedSets.length > 1) me.setLogCmd('select sets ' + setNames, true);
        }
        else {
            if($(that).hasClass('icn3d-highlightSeq')) {
                me.removeHl2D();

                if($(that).attr('gi') !== undefined) {
                    if(ic.bCtrl || ic.bShift) {
                        me.currSelectedSets.push(chainid);
                        me.selectAChain(chainid, chainid, false, true);
                    }
                    else {
                        me.currSelectedSets = [chainid];
                        me.selectAChain(chainid, chainid, false);
                    }

                    me.setLogCmd('select chain ' + chainid, true);

                    var setNames = me.currSelectedSets.join(' or ');
                    //if(me.currSelectedSets.length > 1) me.setLogCmd('select saved atoms ' + setNames, true);
                    if(me.currSelectedSets.length > 1) me.setLogCmd('select sets ' + setNames, true);
                }
                else {
                    var residueidHash = {};
                    if($(that).attr('domain') !== undefined || $(that).attr('feat') !== undefined || $(that).attr('3ddomain') !== undefined || $(that).attr('custom') !== undefined) {
                        me.hlSummaryDomain3ddomain(that);

                        var fromArray = $(that).attr('from').split(',');
                        var toArray = $(that).attr('to').split(',');

                        // protein chains
                        var residueid;
                        for(var i = 0, il = fromArray.length; i < il; ++i) {
                            var from = parseInt(fromArray[i]);
                            var to = parseInt(toArray[i]);

                            for(var j = from; j <= to; ++j) {
                                residueid = chainid + '_' + (j+1).toString();
                                residueidHash[residueid] = 1;

                                //atomHash = ic.unionHash(atomHash, ic.residues[residueid]);
                            }
                        }

                        if(ic.bCtrl || ic.bShift) {
                            me.selectResidueList(residueidHash, commandname, commanddescr, true);
                        }
                        else {
                            me.selectResidueList(residueidHash, commandname, commanddescr, false);
                        }

                        //me.updateHlAll();

                        residueid = chainid + '_' + parseInt((from + to)/2).toString();
                        //residueid = chainid + '_' + from.toString();
                        position = ic.centerAtoms(ic.hash2Atoms(ic.residues[residueid]));
                    }
                    //else if($(that).attr('site') !== undefined || $(that).attr('clinvar') !== undefined) {
                    else if($(that).attr('posarray') !== undefined) {
                        var posArray = $(that).attr('posarray').split(',');
                        //ic.hAtoms = {};

                        //removeAllLabels();

                        //var  atomHash = {}, residueidHash = {};
                        var residueid;
                        for(var i = 0, il = posArray.length; i < il; ++i) {
                            if($(that).attr('site') !== undefined) {
                                residueid = chainid + '_' + (parseInt(posArray[i])+1).toString();
                            }
                            //else if($(that).attr('clinvar') !== undefined) {
                            else {
                                residueid = chainid + '_' + posArray[i];
                            }

                            residueidHash[residueid] = 1;
                            //atomHash = ic.unionHash(atomHash, ic.residues[residueid]);
                        }

                        if(ic.bCtrl || ic.bShift) {
                            me.selectResidueList(residueidHash, commandname, commanddescr, true);
                        }
                        else {
                            me.selectResidueList(residueidHash, commandname, commanddescr, false);
                        }

                        residueid = chainid + '_' + posArray[parseInt((0 + posArray.length)/2)].toString();
                        //residueid = chainid + '_' + posArray[0].toString();
                        position = ic.centerAtoms(ic.hash2Atoms(ic.residues[residueid]));
                    }

                    //removeAllLabels
                    for(var name in ic.labels) {
                        if(name !== 'schematic' && name !== 'distance') {
                           ic.labels[name] = [];
                        }
                    }

                    //var size = parseInt(ic.LABELSIZE * 10 / commandname.length);
                    var size = ic.LABELSIZE;
                    var color = "FFFF00";
                    if(position !== undefined) me.addLabel(commanddescr, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');

                    ic.draw();

                    me.setLogCmd('select ' + me.residueids2spec(Object.keys(residueidHash)) + ' | name ' + commandname, true);

                    if(ic.bCtrl || ic.bShift) {
                        me.currSelectedSets.push(commandname);
                    }
                    else {
                        me.currSelectedSets = [commandname];
                    }

                    var setNames = me.currSelectedSets.join(' or ');
                    //if(me.currSelectedSets.length > 1) me.setLogCmd('select saved atoms ' + setNames, true);
                    if(me.currSelectedSets.length > 1) me.setLogCmd('select sets ' + setNames, true);
                } // if($(that).attr('gi') !== undefined) {
            } // if($(that).hasClass('icn3d-highlightSeq')) {
        } // if(!me.bAnnotations) {
    } // if($(that).hasClass('icn3d-highlightSeq')) {
    else {
        ic.removeHlObjects();
        me.removeHl2D();

       $("#" + me.pre + "atomsCustom").val("");
    }

  }
};
