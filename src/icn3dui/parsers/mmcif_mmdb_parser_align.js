/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadAlignment = function (align) { var me = this; //"use strict";
    me.opts['proteins'] = 'c alpha trace';
    me.icn3d.opts['proteins'] = 'c alpha trace';

    var alignArray = align.split(',');
    //var ids_str = (alignArray.length === 2? 'uids=' : 'ids=') + align;
    var ids_str = 'ids=' + align;
    //var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c&w3d&' + ids_str;
    //var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c1&d&' + ids_str;

    var url = me.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    var url2 = me.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c1&b=1&s=1&d=1&' + ids_str;

    if(me.cfg.inpara !== undefined) {
      url += me.cfg.inpara;
      url2 += me.cfg.inpara;
    }

    me.icn3d.bCid = undefined;

    // define for 'align' only
    me.icn3d.pdbid_chain2title = {};

    if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

    var request = $.ajax({
       url: url2,
       dataType: 'jsonp',
       cache: true
    });

    var seqalign = {};

    var chained = request.then(function( data ) {
        seqalign = data.seqalign;
        if(seqalign === undefined) {
            alert("These two MMDB IDs " + alignArray + " do not have 3D alignment data.");
            return false;
        }

        // set me.icn3d.pdbid_molid2chain and me.icn3d.chainsColor
        me.icn3d.pdbid_molid2chain = {};
        me.icn3d.chainsColor = {};
        //me.mmdbidArray = [];
        //for(var i in data) {

        for(var i = 0, il = 2; i < il; ++i) {
            //if(i === 'seqalign') continue;
            var mmdbTmp = data['alignedStructures'][0][i];

            //var pdbid = (data[i].pdbid !== undefined) ? data[i].pdbid : i;
            var pdbid = (mmdbTmp.pdbId !== undefined) ? mmdbTmp.pdbId : mmdbTmp.mmdbId;
            //me.mmdbidArray.push(pdbid); // here two molecules are in alphabatic order, themaster molecule could not be the first one

            var chainNameHash = {}; // chain name may be the same in assembly
            for(var molid in mmdbTmp.molecules) {
              var chainName = mmdbTmp.molecules[molid].chain.trim();
              if(chainNameHash[chainName] === undefined) {
                  chainNameHash[chainName] = 1;
              }
              else {
                  ++chainNameHash[chainName];
              }

              var finalChain = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();

              me.icn3d.pdbid_molid2chain[pdbid + '_' + molid] = finalChain;

              if(mmdbTmp.molecules[molid].kind === 'p' || mmdbTmp.molecules[molid].kind === 'n') {
                  me.icn3d.chainsColor[pdbid + '_' + finalChain] = new THREE.Color(me.GREY8);
              }
            }
        }

        //var index = 0;
        //for(var mmdbid in data) {
        for(var i = 0, il = 2; i < il; ++i) {
            //if(index < 2) {
                var mmdbTmp = data['alignedStructures'][0][i];

                var pdbid = mmdbTmp.pdbId;

                var molecule = mmdbTmp.molecules;
                for(var molname in molecule) {
                    var chain = molecule[molname].chain;
                    me.icn3d.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                }
            //}

            //++index;
        }

        // get the color for each aligned chain pair
        me.alignmolid2color = [];
        me.alignmolid2color[0] = {};
        me.alignmolid2color[1] = {};
        var colorLength = me.icn3d.stdChainColors.length;

        for(var i = 0, il = seqalign.length; i < il; ++i) {
            var molid1 = seqalign[i][0].moleculeId;
            var molid2 = seqalign[i][1].moleculeId;

            me.alignmolid2color[0][molid1] = (i+1).toString();
            me.alignmolid2color[1][molid2] = (i+1).toString();
        }

        return $.ajax({
          url: url,
          dataType: 'jsonp',
          //jsonp: 'jpf',
          cache: true,
          beforeSend: function() {
              me.showLoading();
          },
          complete: function() {
              //me.hideLoading();
          }
        });
    });

    chained.done(function( data ) { // url
        if (data.atoms !== undefined) {
            me.deferredOpm = $.Deferred(function() {
                //var mmdbidArray = me.inputid.split('_');
                me.mmdbidArray = [];
                for(var i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
                    me.mmdbidArray.push(data.alignedStructures[0][i].pdbId);
                }

                me.loadOpmDataForAlign(data, seqalign, me.mmdbidArray);
            });

            return me.deferredOpm.promise();
        }
        else {
            alert('invalid atoms data.');
            return false;
        }
    });
};

iCn3DUI.prototype.downloadAlignmentPart2 = function (data, seqalign, chainresiCalphaHash2) { var me = this; //"use strict";
    //me.icn3d.init();
    me.loadAtomDataIn(data, undefined, 'align', seqalign);

    if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    // show all
    var allAtoms = {};
    for(var i in me.icn3d.atoms) {
        allAtoms[i] = 1;
    }
    me.icn3d.dAtoms = allAtoms;
    me.icn3d.hAtoms = allAtoms;

    me.icn3d.setAtomStyleByOptions(me.opts);
    // change the default color to "Identity"
    me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

    // memebrane is determined by one structure. But transform both structures
    if(chainresiCalphaHash2 !== undefined) me.transformToOpmOriForAlign(me.selectedPdbid, chainresiCalphaHash2, true);

    me.renderStructure();

    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    me.html2ddgm = '';

    //setTimeout(function(){
    //    me.set2DDiagramsForAlign(me.mmdbidArray[0].toUpperCase(), me.mmdbidArray[1].toUpperCase());
    //}, 0);

    // by default, open the seq alignment window
    //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
    if(me.cfg.showalignseq !== undefined && me.cfg.showalignseq) {
        me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
    }

    if(me.cfg.show2d !== undefined && me.cfg.show2d && me.bFullUi) {
        me.set2DDiagramsForAlign(me.mmdbidArray[0].toUpperCase(), me.mmdbidArray[1].toUpperCase());
    }

    //if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

    if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

iCn3DUI.prototype.downloadChainalignmentPart2 = function (data1, data2, chainresiCalphaHash2) { var me = this; //"use strict";
    me.parseMmdbData(data1, 'target');
    me.parseMmdbData(data2, 'query');

    //if(me.cfg.chainalign === undefined && Object.keys(me.icn3d.structures).length == 1) {
    //    $("#" + me.pre + "alternateWrapper").hide();
    //}

    // show all
    var allAtoms = {};
    for(var i in me.icn3d.atoms) {
        allAtoms[i] = 1;
    }
    me.icn3d.dAtoms = allAtoms;
    me.icn3d.hAtoms = allAtoms;

    me.icn3d.setAtomStyleByOptions(me.opts);
    // change the default color to "Identity"
    me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

    //me.mmdbidArray = Object.keys(me.icn3d.structures);

    // memebrane is determined by one structure. But transform both structures
    if(chainresiCalphaHash2 !== undefined) me.transformToOpmOriForAlign(me.selectedPdbid, chainresiCalphaHash2, true);

    me.renderStructure();

    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    me.html2ddgm = '';

    // by default, open the seq alignment window
    //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
    if(me.cfg.showalignseq !== undefined && me.cfg.showalignseq) {
        me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
    }

    if(me.cfg.show2d !== undefined && me.cfg.show2d && me.bFullUi) {
        me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
        if(me.bFullUi) {
            if(!me.icn3d.bChainAlign) {
                me.download2Ddgm(me.inputid.toUpperCase());
            }
            else {
                me.set2DDiagramsForAlign(me.inputid2.toUpperCase(), me.inputid.toUpperCase());
            }
        }
    }

    if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

iCn3DUI.prototype.downloadChainAlignment = function (chainalign) { var me = this; //"use strict";
    me.opts['proteins'] = 'c alpha trace';
    me.icn3d.opts['proteins'] = 'c alpha trace';

    var alignArray = chainalign.split(',');
    var pos1 = alignArray[0].indexOf('_');
    var pos2 = alignArray[1].indexOf('_');
    me.mmdbid_q = alignArray[0].substr(0, pos1).toUpperCase();
    me.mmdbid_t = alignArray[1].substr(0, pos2).toUpperCase();
    me.chain_q = alignArray[0].substr(pos1+1);
    me.chain_t = alignArray[1].substr(pos2+1);

    var chainalignFinal = me.mmdbid_q + "_" + me.chain_q + "," + me.mmdbid_t + "_" + me.chain_t;

    var urlalign = me.baseUrl + "vastdyn/vastdyn.cgi?chainpairs=" + chainalignFinal;
    var url_t = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + me.mmdbid_t;
    var url_q = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + me.mmdbid_q;

    if(me.cfg.inpara !== undefined) {
      url_t += me.cfg.inpara;
      url_q += me.cfg.inpara;
    }

    me.icn3d.bCid = undefined;

    // define for 'align' only
    me.icn3d.pdbid_chain2title = {};

    if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

    $.ajax({
      url: urlalign,
      dataType: 'jsonp',
      cache: true,
      beforeSend: function() {
          me.showLoading();
      },
      complete: function() {
          //me.hideLoading();
      },
      success: function(align) {
        if((align === undefined || align.length == 0) && me.mmdbid_q == me.mmdbid_t && me.chain_q == me.chain_t) {
            me.t_trans_add = {"x":0, "y":0, "z":0};
            me.q_trans_sub = {"x":0, "y":0, "z":0};
            me.q_rotation = {"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1};

            //var chainLen = me.icn3d.chainsSeq[me.mmdbid_q + '_' + me.chain_q].length;
            //me.qt_start_end =  [{"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen}];
        }
        else if(align === undefined || align.length == 0) {
            if(!me.cfg.command) alert('These two chains ' + chainalign + ' can not align to each other. ' + 'Please select sequences from two chains in the "Sequences & Annotations" window, ' + 'and click "Realign Selection" in the "File" menu to align your selection.');

            me.cfg.showanno = 1;
            me.cfg.showalignseq = 0;
            //return false;
        }
        else {
            me.t_trans_add = align[0].t_trans_add;
            me.q_trans_sub = align[0].q_trans_sub;
            me.q_rotation = align[0].q_rotation;
            me.qt_start_end = align[0].segs;
        }

        $.ajax({
          url: url_t,
          dataType: 'jsonp',
          cache: true,
          beforeSend: function() {
              me.showLoading();
          },
          complete: function() {
              //me.hideLoading();
          },
          success: function(data1) {
            $.ajax({
              url: url_q,
              dataType: 'jsonp',
              cache: true,
              beforeSend: function() {
                  me.showLoading();
              },
              complete: function() {
                  //me.hideLoading();
              },
              success: function(data2) {
                me.mmdbidArray = [];
                me.mmdbidArray.push(me.mmdbid_q);
                me.mmdbidArray.push(me.mmdbid_t);

                me.loadOpmDataForChainalign(data1, data2, me.mmdbidArray);

                //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
              } // success
            }); // ajax
          } // success
        }); // ajax
      }, // success
      error : function(xhr, textStatus, errorThrown ) {
        alert("One of the chains is unavailable in the NCBI MMDB database.");
        return;
      }
    }); // ajax
};

iCn3DUI.prototype.set2DDiagramsForAlign = function (mmdbid1, mmdbid2) { var me = this; //"use strict";
   me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

   mmdbid1 = mmdbid1.substr(0, 4);
   mmdbid2 = mmdbid2.substr(0, 4);

   var url1 = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid1+"&intrac=1";
   var url2 = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid2+"&intrac=1";

   if(me.cfg.inpara !== undefined) {
      url1 += me.cfg.inpara;
      url2 += me.cfg.inpara;
   }

   var request1 = $.ajax({
        url: url1,
        dataType: 'jsonp',
        cache: true
   });

   var request2 = request1.then(function( data ) {
        me.interactionData1 = data;

        me.html2ddgm = '';

        me.draw2Ddgm(data, mmdbid1, 0);
        if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

        return $.ajax({
          url: url2,
          dataType: 'jsonp',
          cache: true
        });
   });

   request2.done(function( data ) {
        me.interactionData2 = data;

        me.draw2Ddgm(data, mmdbid2, 1);

        me.html2ddgm += "<br>" + me.set2DdgmNote(true);
        $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);

        me.b2DShown = true;
        //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

        if(me.deferredViewinteraction !== undefined) me.deferredViewinteraction.resolve();
   });
};

iCn3DUI.prototype.download2Ddgm = function(mmdbid, structureIndex) {var me = this; //"use strict";
/*
  me.deferred3 = $.Deferred(function() {
    var url="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?uid="+mmdbid+"&format=json&intrac=3";

   if(me.cfg.inpara !== undefined) {
      url += me.cfg.inpara;
   }

    $.ajax({
        url: url,
        dataType: 'jsonp',
        tryCount : 0,
        retryLimit : 1,
        success: function( data ) {
            me.draw2Ddgm(data, mmdbid, structureIndex);

            if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
            if(me.deferred3 !== undefined) me.deferred3.resolve();
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
  });

  return me.deferred3.promise();
*/

    me.set2DDiagrams(mmdbid);
};

iCn3DUI.prototype.set2DDiagrams = function (mmdbid) { var me = this; //"use strict";
    me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

    if(me.b2DShown === undefined || !me.b2DShown) {
        me.html2ddgm = '';

        me.draw2Ddgm(me.interactionData, mmdbid);

        me.html2ddgm += "<br>" + me.set2DdgmNote();
        $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);
    }

    me.b2DShown = true;
};

iCn3DUI.prototype.setSeqAlign = function (seqalign, alignedStructures) { var me = this; //"use strict";
      //loadSeqAlignment
      var alignedAtoms = {};
      var mmdbid1 = alignedStructures[0][0].pdbId;
      var mmdbid2 = alignedStructures[0][1].pdbId;

      me.conservedName1 = mmdbid1 + '_cons';
      me.nonConservedName1 = mmdbid1 + '_ncons';
      me.notAlignedName1 = mmdbid1 + '_nalign';

      me.conservedName2 = mmdbid2 + '_cons';
      me.nonConservedName2 = mmdbid2 + '_ncons';
      me.notAlignedName2 = mmdbid2 + '_nalign';

      me.consHash1 = {};
      me.nconsHash1 = {};
      me.nalignHash1 = {};

      me.consHash2 = {};
      me.nconsHash2 = {};
      me.nalignHash2 = {};

      for (var i = 0, il = seqalign.length; i < il; ++i) {
          // first sequence
          var alignData = seqalign[i][0];
          var molid1 = alignData.moleculeId;

          var chain1 = me.icn3d.pdbid_molid2chain[mmdbid1 + '_' + molid1];
          var chainid1 = mmdbid1 + '_' + chain1;

          var id2aligninfo = {};
          var start = alignData.sequence.length, end = -1;
          var bStart = false;
          for(var j = 0, jl = alignData.sequence.length; j < jl; ++j) {
              // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
              //var resi = alignData.sequence[j][1];
              var resi = alignData.sequence[j][0];
              var resn = (alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
              //resn = resn.toUpperCase();

              var aligned = (alignData.sequence[j][3]) ? 1 : 0; // alignData.sequence[j][3]: 0, false, 1, true

              if(aligned == 1) {
                  if(j < start && !bStart) {
                      start = j;
                      bStart = true; // set start just once
                  }
                  if(j > end) end = j;
              }

              id2aligninfo[j] = {"resi": resi, "resn": resn, "aligned": aligned};
          }

          // second sequence
          alignData = seqalign[i][1];
          var molid2 = alignData.moleculeId;

          var chain2 = me.icn3d.pdbid_molid2chain[mmdbid2 + '_' + molid2];
          var chainid2 = mmdbid2 + '_' + chain2;

          // annoation title for the master seq only
          if(me.icn3d.alnChainsAnTtl[chainid1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][0] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][0] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][1] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][2] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][2] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][3] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][3] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][4] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][4] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][5] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][5] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][6] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][6] = [];

          // two annotations without titles
          me.icn3d.alnChainsAnTtl[chainid1][0].push(chainid2);
          me.icn3d.alnChainsAnTtl[chainid1][1].push(chainid1);
          me.icn3d.alnChainsAnTtl[chainid1][2].push("");
          me.icn3d.alnChainsAnTtl[chainid1][3].push("");

          // 2nd chain title
          me.icn3d.alnChainsAnTtl[chainid1][4].push(chainid2);
          // master chain title
          me.icn3d.alnChainsAnTtl[chainid1][5].push(chainid1);
          // empty line
          me.icn3d.alnChainsAnTtl[chainid1][6].push("");

          var alignIndex = 1;
          //for(var j = 0, jl = alignData.sseq.length; j < jl; ++j) {
          for(var j = start; j <= end; ++j) {
              // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
              //var resi = alignData.sequence[j][1];
              var resi = alignData.sequence[j][0];
              var resn = (alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
              //resn = resn.toUpperCase();

              var alignedTmp = (alignData.sequence[j][3]) ? 1 : 0; // alignData.sequence[j][3]: 0, false, 1, true

              var aligned = id2aligninfo[j].aligned + alignedTmp; // 0 or 2

              var color, color2, classname;
              if(aligned === 2) { // aligned
                  if(id2aligninfo[j].resn === resn) {
                      color = '#FF0000';
                      classname = 'icn3d-cons';

                      me.consHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                      me.consHash2[chainid2 + '_' + resi] = 1;
                  }
                  else {
                      color = '#0000FF';
                      classname = 'icn3d-ncons';

                      me.nconsHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                      me.nconsHash2[chainid2 + '_' + resi] = 1;
                  }

                  color2 = '#' + me.getColorhexFromBlosum62(id2aligninfo[j].resn, resn);

                  // expensive and thus remove
                  //alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                  //alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid2 + '_' + resi]);
              }
              else {
                  color = me.GREY8;
                  classname = 'icn3d-nalign';

                  me.nalignHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                  me.nalignHash2[chainid2 + '_' + resi] = 1;
              }

              // chain1
              if(me.icn3d.alnChainsSeq[chainid1] === undefined) me.icn3d.alnChainsSeq[chainid1] = [];

              var resObject = {};
              resObject.mmdbid = mmdbid1;
              resObject.chain = chain1;
              resObject.resi = id2aligninfo[j].resi;
              // resi will be empty if there is no coordinates
              resObject.resn = (resObject.resi === '' || classname === 'icn3d-nalign') ? id2aligninfo[j].resn.toLowerCase() : id2aligninfo[j].resn;
              resObject.aligned = aligned;
              // resi will be empty if there is no coordinates
              resObject.color = (resObject.resi === '') ? me.GREYC : color; // color by identity
              resObject.color2 = (resObject.resi === '') ? me.GREYC : color2; // color by conservation
              resObject.class = classname;

              me.icn3d.alnChainsSeq[chainid1].push(resObject);

              if(id2aligninfo[j].resi !== '') {
                  if(me.icn3d.alnChains[chainid1] === undefined) me.icn3d.alnChains[chainid1] = {};
                  $.extend(me.icn3d.alnChains[chainid1], me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi] );
              }

              // chain2
              if(me.icn3d.alnChainsSeq[chainid2] === undefined) me.icn3d.alnChainsSeq[chainid2] = [];

              resObject = {};
              resObject.mmdbid = mmdbid2;
              resObject.chain = chain2;
              resObject.resi = resi;
              // resi will be empty if there is no coordinates
              resObject.resn = (resObject.resi === '' || classname === 'icn3d-nalign') ? resn.toLowerCase() : resn;
              resObject.aligned = aligned;
              // resi will be empty if there is no coordinates
              resObject.color = (resObject.resi === '') ? me.GREYC : color; // color by identity
              resObject.color2 = (resObject.resi === '') ? me.GREYC : color2; // color by conservation
              resObject.class = classname;

              me.icn3d.alnChainsSeq[chainid2].push(resObject);

              if(resObject.resi !== '') {
                  if(me.icn3d.alnChains[chainid2] === undefined) me.icn3d.alnChains[chainid2] = {};
                  $.extend(me.icn3d.alnChains[chainid2], me.icn3d.residues[chainid2 + '_' + resi] );
              }

              // annotation is for the master seq only
              if(me.icn3d.alnChainsAnno[chainid1] === undefined ) me.icn3d.alnChainsAnno[chainid1] = [];
              if(me.icn3d.alnChainsAnno[chainid1][0] === undefined ) me.icn3d.alnChainsAnno[chainid1][0] = [];
              if(me.icn3d.alnChainsAnno[chainid1][1] === undefined ) me.icn3d.alnChainsAnno[chainid1][1] = [];
              if(me.icn3d.alnChainsAnno[chainid1][2] === undefined ) me.icn3d.alnChainsAnno[chainid1][2] = [];
              if(me.icn3d.alnChainsAnno[chainid1][3] === undefined ) me.icn3d.alnChainsAnno[chainid1][3] = [];
              if(j === start) {
                  // empty line
                  // 2nd chain title
                  if(me.icn3d.alnChainsAnno[chainid1][4] === undefined ) me.icn3d.alnChainsAnno[chainid1][4] = [];
                  // master chain title
                  if(me.icn3d.alnChainsAnno[chainid1][5] === undefined ) me.icn3d.alnChainsAnno[chainid1][5] = [];
                  // empty line
                  if(me.icn3d.alnChainsAnno[chainid1][6] === undefined ) me.icn3d.alnChainsAnno[chainid1][6] = [];

                  me.icn3d.alnChainsAnno[chainid1][4].push(me.icn3d.pdbid_chain2title[chainid2]);
                  me.icn3d.alnChainsAnno[chainid1][5].push(me.icn3d.pdbid_chain2title[chainid1]);
                  me.icn3d.alnChainsAnno[chainid1][6].push('');
              }

              var residueid1 = chainid1 + '_' + id2aligninfo[j].resi;
              var residueid2 = chainid2 + '_' + resi;
              var ss1 = me.icn3d.secondaries[residueid1];
              var ss2 = me.icn3d.secondaries[residueid2];
              if(ss2 !== undefined) {
                  me.icn3d.alnChainsAnno[chainid1][0].push(ss2);
              }
              else {
                  me.icn3d.alnChainsAnno[chainid1][0].push('-');
              }

              if(ss1 !== undefined) {
                  me.icn3d.alnChainsAnno[chainid1][1].push(ss1);
              }
              else {
                  me.icn3d.alnChainsAnno[chainid1][1].push('-');
              }

              var symbol = '.';
              if(alignIndex % 5 === 0) symbol = '*';
              if(alignIndex % 10 === 0) symbol = '|';
              me.icn3d.alnChainsAnno[chainid1][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

              var numberStr = '';
              if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
              me.icn3d.alnChainsAnno[chainid1][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

              ++alignIndex;
          } // end for(var j
      } // end for(var i

      seqalign = {};
};

iCn3DUI.prototype.setSeqPerResi = function (chainid, chainid1, chainid2, resi, resn, bAligned, color, color2, classname, bFirstChain, bFirstResi, alignIndex) { var me = this; //"use strict";
      if(me.icn3d.alnChainsSeq[chainid] === undefined) me.icn3d.alnChainsSeq[chainid] = [];

      var resObject = {};
      var pos = chainid.indexOf('_');
      resObject.mmdbid = chainid.substr(0, pos);
      resObject.chain = chainid.substr(pos+1);
      resObject.resi = resi;
      // resi will be empty if there is no coordinates
      resObject.resn = (resObject.resi === '' || classname === 'icn3d-nalign') ? resn.toLowerCase() : resn;
      resObject.aligned = bAligned;
      // resi will be empty if there is no coordinates
      resObject.color = (resObject.resi === '') ? me.GREYC : color; // color by identity
      resObject.color2 = (resObject.resi === '') ? me.GREYC : color2; // color by conservation
      resObject.class = classname;

      me.icn3d.alnChainsSeq[chainid].push(resObject);

      if(resObject.resi !== '') {
          if(me.icn3d.alnChains[chainid] === undefined) me.icn3d.alnChains[chainid] = {};
          $.extend(me.icn3d.alnChains[chainid], me.icn3d.residues[chainid + '_' + resObject.resi] );
      }

      if(bFirstChain) {
          // annotation is for the master seq only
          if(me.icn3d.alnChainsAnno[chainid] === undefined ) me.icn3d.alnChainsAnno[chainid] = [];
          if(me.icn3d.alnChainsAnno[chainid][0] === undefined ) me.icn3d.alnChainsAnno[chainid][0] = [];
          if(me.icn3d.alnChainsAnno[chainid][1] === undefined ) me.icn3d.alnChainsAnno[chainid][1] = [];
          if(me.icn3d.alnChainsAnno[chainid][2] === undefined ) me.icn3d.alnChainsAnno[chainid][2] = [];
          if(me.icn3d.alnChainsAnno[chainid][3] === undefined ) me.icn3d.alnChainsAnno[chainid][3] = [];
          if(bFirstResi) {
              // empty line
              // 2nd chain title
              if(me.icn3d.alnChainsAnno[chainid][4] === undefined ) me.icn3d.alnChainsAnno[chainid][4] = [];
              // master chain title
              if(me.icn3d.alnChainsAnno[chainid][5] === undefined ) me.icn3d.alnChainsAnno[chainid][5] = [];
              // empty line
              if(me.icn3d.alnChainsAnno[chainid][6] === undefined ) me.icn3d.alnChainsAnno[chainid][6] = [];

              var title1 = me.icn3d.pdbid_chain2title && me.icn3d.pdbid_chain2title.hasOwnProperty(chainid2) ? me.icn3d.pdbid_chain2title[chainid2] : ""
              var title2 = me.icn3d.pdbid_chain2title && me.icn3d.pdbid_chain2title.hasOwnProperty(chainid) ? me.icn3d.pdbid_chain2title[chainid] : ""
              me.icn3d.alnChainsAnno[chainid][4].push(title1);
              me.icn3d.alnChainsAnno[chainid][5].push(title2);
              me.icn3d.alnChainsAnno[chainid][6].push('');
          }

          var symbol = '.';
          if(alignIndex % 5 === 0) symbol = '*';
          if(alignIndex % 10 === 0) symbol = '|';
          me.icn3d.alnChainsAnno[chainid][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

          var numberStr = '';
          if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
          me.icn3d.alnChainsAnno[chainid][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

          var residueid = chainid + '_' + resi;
          var ss = me.icn3d.secondaries[residueid];

          if(ss !== undefined) {
              me.icn3d.alnChainsAnno[chainid][1].push(ss);
          }
          else {
              me.icn3d.alnChainsAnno[chainid][1].push('-');
          }
      }
      else {
          var residueid = chainid + '_' + resi;
          var ss = me.icn3d.secondaries[residueid];

          if(me.icn3d.alnChainsAnno.hasOwnProperty(chainid1) && me.icn3d.alnChainsAnno[chainid1].length > 0) {
              if(ss !== undefined) {
                  me.icn3d.alnChainsAnno[chainid1][0].push(ss);
              }
              else {
                  me.icn3d.alnChainsAnno[chainid1][0].push('-');
              }
          }
          else {
              console.log("Error: me.icn3d.alnChainsAnno[chainid1] is undefined");
          }
      }
};

iCn3DUI.prototype.setSeqAlignChain = function () { var me = this; //"use strict";
      //loadSeqAlignment
      var alignedAtoms = {};
      var mmdbid1 = me.inputid2;
      var mmdbid2 = me.inputid;

      var chainidArray = me.cfg.chainalign.split(',');
      var pos1 = chainidArray[0].indexOf('_');
      var pos2 = chainidArray[1].indexOf('_');

      var chain1 = chainidArray[0].substr(pos1 + 1);
      var chain2 = chainidArray[1].substr(pos2 + 1);

      if(mmdbid1 == mmdbid2 && chain1 == chain2) {
        var chainLen = me.icn3d.chainsSeq[me.mmdbid_q + '_' + me.chain_q].length;
        me.qt_start_end =  [{"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen}];
      }

      var chainid1 = chainidArray[0].substr(0, pos1).toUpperCase() + "_" + chain1;
      var chainid2 = chainidArray[1].substr(0, pos2).toUpperCase() + "_" + chain2;

      if(me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t) {
          //chainid1 += me.postfix;
          chainid1 = chainidArray[0].substr(0, pos1).toUpperCase() + me.postfix + "_" + chain1;
      }

      me.conservedName1 = chainid1 + '_cons';
      me.nonConservedName1 = chainid1 + '_ncons';
      me.notAlignedName1 = chainid1 + '_nalign';

      me.conservedName2 = chainid2 + '_cons';
      me.nonConservedName2 = chainid2 + '_ncons';
      me.notAlignedName2 = chainid2 + '_nalign';

      me.consHash1 = {};
      me.nconsHash1 = {};
      me.nalignHash1 = {};

      me.consHash2 = {};
      me.nconsHash2 = {};
      me.nalignHash2 = {};

      // annoation title for the master seq only
      if(me.icn3d.alnChainsAnTtl[chainid1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][0] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][0] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][1] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][2] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][2] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][3] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][3] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][4] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][4] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][5] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][5] = [];
      if(me.icn3d.alnChainsAnTtl[chainid1][6] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][6] = [];

      // two annotations without titles
      me.icn3d.alnChainsAnTtl[chainid1][0].push(chainid2);
      me.icn3d.alnChainsAnTtl[chainid1][1].push(chainid1);
      me.icn3d.alnChainsAnTtl[chainid1][2].push("");
      me.icn3d.alnChainsAnTtl[chainid1][3].push("");

      // 2nd chain title
      me.icn3d.alnChainsAnTtl[chainid1][4].push(chainid2);
      // master chain title
      me.icn3d.alnChainsAnTtl[chainid1][5].push(chainid1);
      // empty line
      me.icn3d.alnChainsAnTtl[chainid1][6].push("");

      var color, color2, classname;
      var firstIndex1 = 0;
      var firstIndex2 = 0;
      var prevIndex1, prevIndex2;

      var alignIndex = 1;
      for (var i = 0, il = me.qt_start_end.length; i < il; ++i) {
          var start1 = me.qt_start_end[i].q_start - 1;
          var start2 = me.qt_start_end[i].t_start - 1;
          var end1 = me.qt_start_end[i].q_end - 1;
          var end2 = me.qt_start_end[i].t_end - 1;

          var index1 = alignIndex;
          for(var j = prevIndex1 + 1, jl = start1; prevIndex1 !== undefined && j < jl; ++j) {
              if(me.icn3d.chainsSeq[chainid1] === undefined) break;
              var resi = me.icn3d.chainsSeq[chainid1][j].resi;
              var resn = me.icn3d.chainsSeq[chainid1][j].name.toLowerCase();

              color = me.GREY8;
              classname = 'icn3d-nalign';

              me.nalignHash1[chainid1 + '_' + resi] = 1;
              me.setSeqPerResi(chainid1, chainid1, chainid2, resi, resn, false, color, undefined, classname, true, false, index1);
              ++index1;
          }

          var index2 = alignIndex;
          for(var j = prevIndex2 + 1, jl = start2; prevIndex2 !== undefined && j < jl; ++j) {
              if(me.icn3d.chainsSeq[chainid2] === undefined) break;
              var resi = me.icn3d.chainsSeq[chainid2][j].resi;
              var resn = me.icn3d.chainsSeq[chainid2][j].name.toLowerCase();

              color = me.GREY8;
              classname = 'icn3d-nalign';

              me.nalignHash2[chainid2 + '_' + resi] = 1;
              me.setSeqPerResi(chainid2, chainid1, chainid2, resi, resn, false, color, undefined, classname, false, false, index2);
              ++index2; // count just once
          }

          if(index1 < index2) {
              alignIndex = index2;

              for(var j = 0; j < index2 - index1; ++j) {
                  var resi = '';
                  var resn = '-';

                  color = me.GREY8;
                  classname = 'icn3d-nalign';

                  me.setSeqPerResi(chainid1, chainid1, chainid2, resi, resn, false, color, undefined, classname, true, false, index1 + j);
              }
          }
          else {
              alignIndex = index1;

              for(var j = 0; j < index1 - index2; ++j) {
                  var resi = '';
                  var resn = '-';

                  color = me.GREY8;
                  classname = 'icn3d-nalign';

                  me.setSeqPerResi(chainid2, chainid1, chainid2, resi, resn, false, color, undefined, classname, false, false, index2 + j);
              }
          }

          for(var j = 0; j <= end1 - start1; ++j) {
              if(me.icn3d.chainsSeq[chainid1] === undefined || me.icn3d.chainsSeq[chainid2] === undefined) break;

              var resi1 = me.icn3d.chainsSeq[chainid1][j + start1].resi;
              var resi2 = me.icn3d.chainsSeq[chainid2][j + start2].resi;
              var resn1 = me.icn3d.chainsSeq[chainid1][j + start1].name.toUpperCase();
              var resn2 = me.icn3d.chainsSeq[chainid2][j + start2].name.toUpperCase();

              if(resn1 === resn2) {
                  color = '#FF0000';
                  classname = 'icn3d-cons';

                  me.consHash1[chainid1 + '_' + resi1] = 1;
                  me.consHash2[chainid2 + '_' + resi2] = 1;
              }
              else {
                  color = '#0000FF';
                  classname = 'icn3d-ncons';

                  me.nconsHash1[chainid1 + '_' + resi1] = 1;
                  me.nconsHash2[chainid2 + '_' + resi2] = 1;
              }

              color2 = '#' + me.getColorhexFromBlosum62(resn1, resn2);

              var bFirstResi = (i === 0 && j === 0) ? true : false;
              me.setSeqPerResi(chainid1, chainid1, chainid2, resi1, resn1, true, color, color2, classname, true, bFirstResi, alignIndex);
              me.setSeqPerResi(chainid2, chainid1, chainid2, resi2, resn2, true, color, color2, classname, false, bFirstResi, alignIndex);

              ++alignIndex;
          } // end for(var j

          prevIndex1 = end1;
          prevIndex2 = end2;
      } // end for(var i
};

iCn3DUI.prototype.setSeqAlignForRealign = function () { var me = this; //"use strict";
      //loadSeqAlignment
      var alignedAtoms = {};
      var structureArray = Object.keys(me.icn3d.structures);
      var structure1 = structureArray[0];
      var structure2 = structureArray[1];

      me.conservedName1 = structure1 + '_cons';
      me.conservedName2 = structure2 + '_cons';

      me.consHash1 = {};
      me.consHash2 = {};

      me.icn3d.alnChainsAnTtl = {};
      me.icn3d.alnChainsAnno = {};

      me.icn3d.alnChainsSeq = {};
      me.icn3d.alnChains = {};

      for(var i = 0, il = me.realignResid[structure1].length; i < il; ++i) {
          var resObject1 = me.realignResid[structure1][i];
          var pos1 = resObject1.resid.lastIndexOf('_');
          var chainid1 = resObject1.resid.substr(0, pos1);
          var resi1 = resObject1.resid.substr(pos1 + 1);
          resObject1.resi = resi1;
          resObject1.aligned = true;

          var resObject2 = me.realignResid[structure2][i];
          var pos2 = resObject2.resid.lastIndexOf('_');
          var chainid2 = resObject2.resid.substr(0, pos2);
          var resi2 = resObject2.resid.substr(pos2 + 1);
          resObject2.resi = resi2;
          resObject2.aligned = true;

          var color;
          if(resObject1.resn == resObject2.resn) {
              color = "#FF0000";
          }
          else {
              color = "#0000FF";
          }
          var color2 = '#' + me.getColorhexFromBlosum62(resObject1.resn, resObject2.resn);

          resObject1.color = color;
          resObject2.color = color;

          resObject1.color2 = color2;
          resObject2.color2 = color2;

          for(var j in me.icn3d.residues[resObject1.resid]) {
              me.icn3d.atoms[j].color = new THREE.Color(color);
          }
          for(var j in me.icn3d.residues[resObject2.resid]) {
              me.icn3d.atoms[j].color = new THREE.Color(color);
          }

          // annoation title for the master seq only
          if(me.icn3d.alnChainsAnTtl[chainid1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1] = [];
          //if(me.icn3d.alnChainsAnTtl[chainid2] === undefined ) me.icn3d.alnChainsAnTtl[chainid2] = [];

          if(me.icn3d.alnChainsAnTtl[chainid1][0] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][0] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][1] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][1] = [];
          if(me.icn3d.alnChainsAnTtl[chainid1][2] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][2] = [];
          //if(me.icn3d.alnChainsAnTtl[chainid1][3] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][3] = [];
          //if(me.icn3d.alnChainsAnTtl[chainid1][4] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][4] = [];
          //if(me.icn3d.alnChainsAnTtl[chainid1][5] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][5] = [];
          //if(me.icn3d.alnChainsAnTtl[chainid1][6] === undefined ) me.icn3d.alnChainsAnTtl[chainid1][6] = [];

          // two annotations without titles
          me.icn3d.alnChainsAnTtl[chainid1][0].push("");
          me.icn3d.alnChainsAnTtl[chainid1][1].push("");
          me.icn3d.alnChainsAnTtl[chainid1][2].push("");
          //me.icn3d.alnChainsAnTtl[chainid1][3].push("");

          // 2nd chain title
          //me.icn3d.alnChainsAnTtl[chainid1][4].push("");
          // master chain title
          //me.icn3d.alnChainsAnTtl[chainid1][5].push("");
          // empty line
          //me.icn3d.alnChainsAnTtl[chainid1][6].push("");

          if(me.icn3d.alnChainsSeq[chainid1] === undefined) me.icn3d.alnChainsSeq[chainid1] = [];
          if(me.icn3d.alnChainsSeq[chainid2] === undefined) me.icn3d.alnChainsSeq[chainid2] = [];

          me.icn3d.alnChainsSeq[chainid1].push(resObject1);
          me.icn3d.alnChainsSeq[chainid2].push(resObject2);

          if(me.icn3d.alnChains[chainid1] === undefined) me.icn3d.alnChains[chainid1] = {};
          if(me.icn3d.alnChains[chainid2] === undefined) me.icn3d.alnChains[chainid2] = {};
          $.extend(me.icn3d.alnChains[chainid1], me.icn3d.residues[chainid1 + '_' + resObject1.resi] );
          $.extend(me.icn3d.alnChains[chainid2], me.icn3d.residues[chainid2 + '_' + resObject2.resi] );

          me.consHash1[chainid1 + '_' + resObject1.resi] = 1;
          me.consHash2[chainid2 + '_' + resObject2.resi] = 1;

          // annotation is for the master seq only
          if(me.icn3d.alnChainsAnno[chainid1] === undefined ) me.icn3d.alnChainsAnno[chainid1] = [];
          //if(me.icn3d.alnChainsAnno[chainid2] === undefined ) me.icn3d.alnChainsAnno[chainid2] = [];

          if(me.icn3d.alnChainsAnno[chainid1][0] === undefined ) me.icn3d.alnChainsAnno[chainid1][0] = [];
          if(me.icn3d.alnChainsAnno[chainid1][1] === undefined ) me.icn3d.alnChainsAnno[chainid1][1] = [];
          if(me.icn3d.alnChainsAnno[chainid1][2] === undefined ) me.icn3d.alnChainsAnno[chainid1][2] = [];
          //if(me.icn3d.alnChainsAnno[chainid1][3] === undefined ) me.icn3d.alnChainsAnno[chainid1][3] = [];
          //if(i == 0) {
              // empty line
              // 2nd chain title
              //if(me.icn3d.alnChainsAnno[chainid1][4] === undefined ) me.icn3d.alnChainsAnno[chainid1][4] = [];
              // master chain title
              //if(me.icn3d.alnChainsAnno[chainid1][5] === undefined ) me.icn3d.alnChainsAnno[chainid1][5] = [];
              // empty line
              //if(me.icn3d.alnChainsAnno[chainid1][6] === undefined ) me.icn3d.alnChainsAnno[chainid1][6] = [];

              //me.icn3d.alnChainsAnno[chainid1][4].push(structure2);
              //me.icn3d.alnChainsAnno[chainid1][5].push(structure1);
              //me.icn3d.alnChainsAnno[chainid1][6].push('');
          //}

          var symbol = '.';
          if(i % 5 === 0) symbol = '*';
          if(i % 10 === 0) symbol = '|';
          me.icn3d.alnChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

          var numberStr = '';
          if(i % 10 === 0) numberStr = i.toString();
          me.icn3d.alnChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest
      }
};

/*
iCn3DUI.prototype.realign = function() { var me = this; //"use strict";
    me.saveSelectionPrep();

    var index = Object.keys(me.icn3d.defNames2Atoms).length;
    var name = 'alseq_' + index;

    me.saveSelection(name, name);

    var structArray = Object.keys(structHash);

    if(structArray.length >= 2) {
        var toStruct = structArray[0];
        var fromStruct = structArray[1];

        me.realignResid = {};

        var structHash = {};
        var lastStruResi = '';
        for(var serial in me.icn3d.hAtoms) {
            var atom = me.icn3d.atoms[serial];
            if( (me.icn3d.proteins.hasOwnProperty(serial) && atom.name == "CA")
              || (me.icn3d.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*")) ) {
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                if(resid == lastStruResi) continue; // e.g., Alt A and B

                if(!structHash.hasOwnProperty(atom.structure)) {
                    structHash[atom.structure] = [];
                }

                structHash[atom.structure].push(atom.coord.clone());

                if(me.realignResid[atom.structure] === undefined) me.realignResid[atom.structure] = [];
                me.realignResid[atom.structure].push(resid);

                lastStruResi = resid;
            }
        }


        // transform from the second structure to the first structure
        var coordsFrom = structHash[fromStruct];
        var coordsTo = structHash[toStruct];

        me.alignCoords(coordsFrom, coordsTo, fromStruct);
    }
};
*/

iCn3DUI.prototype.realignOnSeqAlign = function () { var me = this; //"use strict";
    me.saveSelectionPrep();

    var index = Object.keys(me.icn3d.defNames2Atoms).length;
    var name = 'alseq_' + index;

    me.saveSelection(name, name);

    var struct2SeqHash = {};
    var struct2CoorHash = {};
    var struct2resid = {};
    var lastStruResi = '';
    for(var serial in me.icn3d.hAtoms) {
        var atom = me.icn3d.atoms[serial];
        if( (me.icn3d.proteins.hasOwnProperty(serial) && atom.name == "CA")
          || (me.icn3d.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*")) ) {
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

            if(resid == lastStruResi) continue; // e.g., Alt A and B

            if(!struct2SeqHash.hasOwnProperty(atom.structure)) {
                struct2SeqHash[atom.structure] = '';
                struct2CoorHash[atom.structure] = [];
                struct2resid[atom.structure] = [];
            }

            var oneLetterRes = me.icn3d.residueName2Abbr(atom.resn.substr(0, 3));

            struct2SeqHash[atom.structure] += oneLetterRes;
            struct2CoorHash[atom.structure].push(atom.coord.clone());
            struct2resid[atom.structure].push(resid);

            //if(me.realignResid[atom.structure] === undefined) me.realignResid[atom.structure] = [];
            //me.realignResid[atom.structure].push(resid);

            lastStruResi = resid;
        }
    }

    var structArray = Object.keys(struct2SeqHash);

    var toStruct = structArray[0];
    var fromStruct = structArray[1];

    var seq1 = struct2SeqHash[toStruct];
    var seq2 = struct2SeqHash[fromStruct];

    var coord1 = struct2CoorHash[toStruct];
    var coord2 = struct2CoorHash[fromStruct];

    var residArray1 = struct2resid[toStruct];
    var residArray2 = struct2resid[fromStruct];

    // chain functions together
    me.deferredRealign = $.Deferred(function() {
       var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=track';
       $.ajax({
          url: url,
          type: 'POST',
          data : {'targets': seq1, 'queries': seq2},
          dataType: 'jsonp',
          //dataType: 'json',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              var query, target;

              if(data.data !== undefined) {
                  query = data.data[0].query;
                  var targetName = Object.keys(data.data[0].targets)[0];
                  target = data.data[0].targets[targetName];

                  target = target.hsps[0];
              }

              if(query !== undefined && target !== undefined) {
                  // transform from the second structure to the first structure
                  var coordsTo = [];
                  var coordsFrom = [];

                  var seqto = '', seqfrom = ''

                  me.realignResid = {};
                  me.realignResid[toStruct] = [];
                  me.realignResid[fromStruct] = [];

                  var segArray = target.segs;
                  for(var i = 0, il = segArray.length; i < il; ++i) {
                      var seg = segArray[i];
                      for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                          coordsTo.push(coord1[j + seg.orifrom]);
                          coordsFrom.push(coord2[j + seg.from]);

                          seqto += seq1[j + seg.orifrom];
                          seqfrom += seq2[j + seg.from];

                          me.realignResid[toStruct].push({'resid':residArray1[j + seg.orifrom], 'resn':seq1[j + seg.orifrom]});
                          me.realignResid[fromStruct].push({'resid':residArray2[j + seg.from], 'resn':seq2[j + seg.from]});
                      }
                  }

                  me.alignCoords(coordsFrom, coordsTo, fromStruct);
              }
              else {
                  if(fromStruct === undefined && !me.cfg.command) {
                     alert('Please do not align residues in the same structure');
                  }
                  else if((seq1.length < 6 || seq2.length < 6) && !me.cfg.command) {
                     alert('These sequences are too short for alignment');
                  }
                  else if(seq1.length >= 6 && seq2.length >= 6 && !me.cfg.command) {
                     alert('These sequences can not be aligned to each other');
                  }
              }

              if(me.deferredRealign !== undefined) me.deferredRealign.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }

               if(fromStruct === undefined && !me.cfg.command) {
                  alert('Please do not align residues in the same structure');
               }
               else if((seq1.length < 6 || seq2.length < 6) && !me.cfg.command) {
                  alert('These sequences are too short for alignment');
               }
               else if(seq1.length >= 6 && seq2.length >= 6 && !me.cfg.command) {
                  alert('These sequences can not be aligned to each other');
               }

            if(me.deferredRealign !== undefined) me.deferredRealign.resolve();
            return;
          }
        });
    }); // end of me.deferred = $.Deferred(function() {

    return me.deferredRealign.promise();
};
