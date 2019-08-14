/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadAlignment = function (align) { var me = this;
    me.opts['proteins'] = 'c alpha trace';
    me.icn3d.opts['proteins'] = 'c alpha trace';

/*
    if(me.bFullUi && me.isMac() && me.isMobile) {
        me.MENU_WIDTH = 950; // have enough space to show image in iphone

        me.setViewerWidthHeight();

        var width = me.WIDTH; // - me.LESSWIDTH;
        var height = me.HEIGHT; // - me.LESSHEIGHT;

        me.resizeCanvas(width, height, true, false);
    }
*/

    var alignArray = align.split(',');
    //var ids_str = (alignArray.length === 2? 'uids=' : 'ids=') + align;
    var ids_str = 'ids=' + align;
    //var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c&w3d&' + ids_str;
    //var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c1&d&' + ids_str;

    var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?v=2&cmd=c1&b=1&s=1&d=1&' + ids_str;

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
              me.hideLoading();
          }
        });
    });

    chained.done(function( data ) { // url
        if (data.atoms !== undefined) {
            me.icn3d.init();

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

            //var mmdbidArray = me.inputid.split('_');
            me.mmdbidArray = [];
            for(var i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
                me.mmdbidArray.push(data.alignedStructures[0][i].pdbId);
            }

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
        }
        else {
            alert('invalid atoms data.');
            return false;
        }
    });
};

iCn3DUI.prototype.set2DDiagramsForAlign = function (mmdbid1, mmdbid2) { var me = this;
   me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

   var url1="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid1+"&intrac=1";
   var url2="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid2+"&intrac=1";

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

iCn3DUI.prototype.download2Ddgm = function(mmdbid, structureIndex) {var me = this;
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

iCn3DUI.prototype.set2DDiagrams = function (mmdbid) { var me = this;
    me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');

    if(me.b2DShown === undefined || !me.b2DShown) {
        me.html2ddgm = '';

        me.draw2Ddgm(me.interactionData, mmdbid);

        me.html2ddgm += "<br>" + me.set2DdgmNote();
        $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);
    }

    me.b2DShown = true;
};

iCn3DUI.prototype.setSeqAlign = function (seqalign, alignedStructures) { var me = this;
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
