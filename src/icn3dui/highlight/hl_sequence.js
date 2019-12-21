/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectResidues = function(id, that) { var me = this; //"use strict";
  if(id !== undefined && id !== '') {
    // add "align_" in front of id so that full sequence and aligned sequence will not conflict
    //if(id.substr(0, 5) === 'align') id = id.substr(5);

    // seq_div0_1TSR_A_1, align_div0..., giseq_div0..., snp_div0..., interaction_div0..., cddsite_div0..., domain_div0...
    id = id.substr(id.indexOf('_') + 1);

    me.bSelectResidue = true;

    $(that).toggleClass('icn3d-highlightSeq');

    var residueid = id.substr(id.indexOf('_') + 1);

    if(me.icn3d.residues.hasOwnProperty(residueid)) {
        if($(that).hasClass('icn3d-highlightSeq')) {
          for(var j in me.icn3d.residues[residueid]) {
            me.icn3d.hAtoms[j] = 1;
          }
          me.selectedResidues[residueid] = 1;

          if(me.bAnnotations && $(that).attr('disease') !== undefined) {
              var label = $(that).attr('disease');

              var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.residues[residueid]));
              //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit

              var maxlen = 15;
              if(label.length > maxlen) label = label.substr(0, maxlen) + '...';

              //var size = parseInt(me.icn3d.LABELSIZE * 10 / label.length);
              var size = me.icn3d.LABELSIZE;
              var color = me.GREYD;
              me.addLabel(label, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');
          }
        }
        else {
            for (var i in me.icn3d.residues[residueid]) {
              //me.icn3d.hAtoms[i] = undefined;
              delete me.icn3d.hAtoms[i];
            }
            //me.selectedResidues[residueid] = undefined;
            delete me.selectedResidues[residueid];

            me.icn3d.removeHlObjects();
        }
    }
  }
};

iCn3DUI.prototype.selectTitle = function(that) { var me = this; //"use strict";
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

    if(!me.icn3d.bCtrl && !me.icn3d.bShift) {
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
            if(me.icn3d.bCtrl || me.icn3d.bShift) {
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
            me.setLogCmd('select saved atoms ' + setNames, true);
        }
        else {
            if($(that).hasClass('icn3d-highlightSeq')) {
                me.removeHl2D();

                if($(that).attr('gi') !== undefined) {
                    if(me.icn3d.bCtrl || me.icn3d.bShift) {
                        me.currSelectedSets.push(chainid);
                        me.selectAChain(chainid, chainid, false, true);
                    }
                    else {
                        me.currSelectedSets = [chainid];
                        me.selectAChain(chainid, chainid, false);
                    }

                    me.setLogCmd('select chain ' + chainid, true);

                    var setNames = me.currSelectedSets.join(' or ');
                    me.setLogCmd('select saved atoms ' + setNames, true);
                }
                else {
                    var residueidHash = {};
                    if($(that).attr('domain') !== undefined || $(that).attr('3ddomain') !== undefined) {
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

                                //atomHash = me.icn3d.unionHash(atomHash, me.icn3d.residues[residueid]);
                            }
                        }

                        if(me.icn3d.bCtrl || me.icn3d.bShift) {
                            me.selectResidueList(residueidHash, commandname, commanddescr, true);
                        }
                        else {
                            me.selectResidueList(residueidHash, commandname, commanddescr, false);
                        }

                        //me.updateHlAll();

                        residueid = chainid + '_' + parseInt((from + to)/2).toString();
                        //residueid = chainid + '_' + from.toString();
                        position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.residues[residueid]));
                    }
                    //else if($(that).attr('site') !== undefined || $(that).attr('clinvar') !== undefined) {
                    else if($(that).attr('posarray') !== undefined) {
                        var posArray = $(that).attr('posarray').split(',');

                        //me.icn3d.hAtoms = {};

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
                            //atomHash = me.icn3d.unionHash(atomHash, me.icn3d.residues[residueid]);
                        }

                        if(me.icn3d.bCtrl || me.icn3d.bShift) {
                            me.selectResidueList(residueidHash, commandname, commanddescr, true);
                        }
                        else {
                            me.selectResidueList(residueidHash, commandname, commanddescr, false);
                        }

                        residueid = chainid + '_' + posArray[parseInt((0 + posArray.length)/2)].toString();
                        //residueid = chainid + '_' + posArray[0].toString();
                        position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.residues[residueid]));
                    }

                    //removeAllLabels
                    for(var name in me.icn3d.labels) {
                        if(name !== 'schematic' && name !== 'distance') {
                           me.icn3d.labels[name] = [];
                        }
                    }

                    //var size = parseInt(me.icn3d.LABELSIZE * 10 / commandname.length);
                    var size = me.icn3d.LABELSIZE;
                    var color = "FFFF00";
                    if(position !== undefined) me.addLabel(commanddescr, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');

                    me.icn3d.draw();

                    me.setLogCmd('select ' + me.residueids2spec(Object.keys(residueidHash)) + ' | name ' + commandname, true);

                    if(me.icn3d.bCtrl || me.icn3d.bShift) {
                        me.currSelectedSets.push(commandname);
                    }
                    else {
                        me.currSelectedSets = [commandname];
                    }

                    var setNames = me.currSelectedSets.join(' or ');
                    me.setLogCmd('select saved atoms ' + setNames, true);
                } // if($(that).attr('gi') !== undefined) {
            } // if($(that).hasClass('icn3d-highlightSeq')) {
        } // if(!me.bAnnotations) {
    } // if($(that).hasClass('icn3d-highlightSeq')) {
    else {
        me.icn3d.removeHlObjects();
        me.removeHl2D();

       $("#" + me.pre + "atomsCustom").val("");
    }

  }
};

iCn3DUI.prototype.selectSequenceNonMobile = function() { var me = this; //"use strict";
  //$("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").add("#" + me.pre + "dl_annotations").selectable({
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "dt_giseq]").add("[id^=" + me.pre + "dt_site]").add("[id^=" + me.pre + "dt_snp]").add("[id^=" + me.pre + "dt_clinvar]").add("[id^=" + me.pre + "dt_cdd]").add("[id^=" + me.pre + "dt_domain]").add("[id^=" + me.pre + "dt_interaction]").add("[id^=" + me.pre + "dt_ssbond]").add("[id^=" + me.pre + "dt_transmem]")
  .add("[id^=" + me.pre + "tt_giseq]").add("[id^=" + me.pre + "tt_site]").add("[id^=" + me.pre + "tt_snp]").add("[id^=" + me.pre + "tt_clinvar]").add("[id^=" + me.pre + "tt_cdd]").add("[id^=" + me.pre + "tt_domain]").add("[id^=" + me.pre + "tt_interaction]").add("[id^=" + me.pre + "tt_ssbond]").add("[id^=" + me.pre + "tt_transmem]")
  .selectable({
  //$(".icn3d-dl_sequence").selectable({
      stop: function() {
          if($(this).attr('id') === me.pre + "dl_sequence2") {
              me.bAlignSeq = true;
              me.bAnnotations = false;
          }
          //else if($(this).attr('id') === me.pre + "dl_annotations") {
          else {
              me.bAlignSeq = false;
              me.bAnnotations = true;
          }

          if(me.bSelectResidue === false && !me.icn3d.bShift && !me.icn3d.bCtrl) {
              me.removeSelection();
          }

          // select residues
          $("span.ui-selected", this).each(function() {
              var id = $(this).attr('id');

              if(id !== undefined) {
                 me.selectResidues(id, this);
             }
          });

/*
          if(me.bAnnotations) {
              me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

              me.icn3d.draw();
          }
          else {
              me.icn3d.addHlObjects();  // render() is called
          }
*/

          //me.icn3d.addResiudeLabels(me.icn3d.hAtoms, false, 0.5);
          me.icn3d.addHlObjects();  // render() is called

          // get all chainid in the selected residues
          var chainHash = {};
          for(var residueid in me.selectedResidues) {
              var pos = residueid.lastIndexOf('_');
              var chainid = residueid.substr(0, pos);

              chainHash[chainid] = 1;
          }

          // highlight the nodes
          var chainArray2d = Object.keys(chainHash);
          me.updateHl2D(chainArray2d);

          // select annotation title
          $("div.ui-selected", this).each(function() {
              if($(this).attr('chain') !== undefined) {

                  me.selectTitle(this);
              }
          });
      }
  });

  $("[id^=" + me.pre + "ov_giseq]").add("[id^=" + me.pre + "ov_site]").add("[id^=" + me.pre + "ov_snp]").add("[id^=" + me.pre + "ov_clinvar]").add("[id^=" + me.pre + "ov_cdd]").add("[id^=" + me.pre + "ov_domain]").add("[id^=" + me.pre + "ov_interaction]").add("[id^=" + me.pre + "ov_ssbond]").add("[id^=" + me.pre + "ov_transmem]")
  .add("[id^=" + me.pre + "tt_giseq]").add("[id^=" + me.pre + "tt_site]").add("[id^=" + me.pre + "tt_snp]").add("[id^=" + me.pre + "tt_clinvar]").add("[id^=" + me.pre + "tt_cdd]").add("[id^=" + me.pre + "tt_domain]").add("[id^=" + me.pre + "tt_interaction]").add("[id^=" + me.pre + "tt_ssbond]").add("[id^=" + me.pre + "tt_transmem]")
  .on('click', '.icn3d-seqTitle', function(e) {
      e.stopImmediatePropagation();

      me.bAlignSeq = false;
      me.bAnnotations = true;

      // select annotation title
      //$("div .ui-selected", this).each(function() {
          me.selectTitle(this);

          me.hlSummaryDomain3ddomain(this);
       //});

        // remove possible text selection
        if (window.getSelection) {
          if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {  // IE?
          document.selection.empty();
        }
  });
};

iCn3DUI.prototype.hlSummaryDomain3ddomain = function(that) { var me = this; //"use strict";
  if($(that).attr('domain') !== undefined) { // domain
    var index = $(that).attr('index');
    var chainid = $(that).attr('chain');

    if($("[id^=" + chainid + "_domain_" + index + "]").length !== 0) {
        $("[id^=" + chainid + "_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
    }
  }

  if($(that).attr('3ddomain') !== undefined) { // 3d domain
    var index = $(that).attr('index');
    var chainid = $(that).attr('chain');

    if($("[id^=" + chainid + "_3d_domain_" + index + "]").length !== 0) {
        $("[id^=" + chainid + "_3d_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
    }
  }
};

iCn3DUI.prototype.selectSequenceMobile = function() { var me = this; //"use strict";
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "giseq]").add("[id^=" + me.pre + "site]").add("[id^=" + me.pre + "clinvar]").add("[id^=" + me.pre + "snp]").add("[id^=" + me.pre + "cdd]").add("[id^=" + me.pre + "domain]").add("[id^=" + me.pre + "interaction]").add("[id^=" + me.pre + "ssbond]").add("[id^=" + me.pre + "transmem]").on('click', '.icn3d-residue', function(e) {
  //$(".icn3d-dl_sequence").on('click', '.icn3d-residue', function(e) {
      e.stopImmediatePropagation();

      if($(this).attr('id') === me.pre + "dl_sequence2") {
          me.bAlignSeq = true;
          me.bAnnotations = false;
      }
      //else if($(this).attr('id') === me.pre + "dl_annotations") {
      else {
          me.bAlignSeq = false;
          me.bAnnotations = true;
      }

      // select residues
      //$("span.ui-selected", this).each(function() {
          var id = $(this).attr('id');

          if(id !== undefined) {
               me.selectResidues(id, this);
         }
      //});

/*
      if(me.bAnnotations) {
          me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

          me.icn3d.draw();
      }
      else {
          me.icn3d.addHlObjects();  // render() is called
      }
*/

      //me.icn3d.addResiudeLabels(me.icn3d.hAtoms, false, 0.5);
       me.icn3d.addHlObjects();  // render() is called

      // get all chainid in the selected residues
      var chainHash = {};
      for(var residueid in me.selectedResidues) {
          var pos = residueid.lastIndexOf('_');
          var chainid = residueid.substr(0, pos);

          chainHash[chainid] = 1;
      }

      // clear nodes in 2d dgm
      me.removeHl2D();

      // highlight the nodes
      var chainArray2d = Object.keys(chainHash);
      me.updateHl2D(chainArray2d);
  });
};

iCn3DUI.prototype.selectChainMobile = function() { var me = this; //"use strict";
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "giseq]").add("[id^=" + me.pre + "site]").add("[id^=" + me.pre + "clinvar]").add("[id^=" + me.pre + "snp]").add("[id^=" + me.pre + "cdd]").add("[id^=" + me.pre + "domain]").add("[id^=" + me.pre + "interaction]").add("[id^=" + me.pre + "ssbond]").add("[id^=" + me.pre + "transmem]").on('click', '.icn3d-seqTitle', function(e) {
  //$(".icn3d-dl_sequence").on('click', '.icn3d-seqTitle', function(e) {
      e.stopImmediatePropagation();

      if($(this).attr('id') === me.pre + "dl_sequence2") {
          me.bAlignSeq = true;
          me.bAnnotations = false;
      }
      //else if($(this).attr('id') === me.pre + "dl_annotations") {
      else {
          me.bAlignSeq = false;
          me.bAnnotations = true;
      }

      // select annotation title
      //$("div.ui-selected", this).each(function() {
          me.selectTitle(this);

          me.hlSummaryDomain3ddomain(this);
      //});
  });
};

// remove highlight of chains
iCn3DUI.prototype.removeSeqChainBkgd = function(currChain) {
  if(currChain === undefined) {
    $( ".icn3d-seqTitle" ).each(function( index ) {
      $( this ).removeClass('icn3d-highlightSeq');
      $( this ).removeClass('icn3d-highlightSeqBox');
    });
  }
  else {
    $( ".icn3d-seqTitle" ).each(function( index ) {
      if($(this).attr('chain') !== currChain) {
          $( this ).removeClass('icn3d-highlightSeq');
          $( this ).removeClass('icn3d-highlightSeqBox');
      }
    });
  }
};

// remove all highlighted residue color
iCn3DUI.prototype.removeSeqResidueBkgd = function() {
    $( ".icn3d-residue" ).each(function( index ) {
      $( this ).removeClass('icn3d-highlightSeq');
    });
};

