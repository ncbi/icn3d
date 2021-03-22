/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setSeqAlign = function (seqalign, alignedStructures) { var me = this, ic = me.icn3d; "use strict";
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

          var chain1 = ic.pdbid_molid2chain[mmdbid1 + '_' + molid1];
          var chainid1 = mmdbid1 + '_' + chain1;

          var id2aligninfo = {};
          var start = alignData.sequence.length, end = -1;
          var bStart = false;
          for(var j = 0, jl = alignData.sequence.length; j < jl; ++j) {
              // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
              //var resi = alignData.sequence[j][1];
              var offset = (ic.chainid2offset[chainid1]) ? ic.chainid2offset[chainid1] : 0;
              var resi = (ic.bUsePdbNum) ? alignData.sequence[j][0] + offset : alignData.sequence[j][0];
              var resn = (alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
              resn = (resn === ' ' || resn === '') ? 'X' : resn;
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

          var chain2 = ic.pdbid_molid2chain[mmdbid2 + '_' + molid2];
          var chainid2 = mmdbid2 + '_' + chain2;

          // annoation title for the master seq only
          if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];
          if(ic.alnChainsAnTtl[chainid1][0] === undefined ) ic.alnChainsAnTtl[chainid1][0] = [];
          if(ic.alnChainsAnTtl[chainid1][1] === undefined ) ic.alnChainsAnTtl[chainid1][1] = [];
          if(ic.alnChainsAnTtl[chainid1][2] === undefined ) ic.alnChainsAnTtl[chainid1][2] = [];
          if(ic.alnChainsAnTtl[chainid1][3] === undefined ) ic.alnChainsAnTtl[chainid1][3] = [];
          if(ic.alnChainsAnTtl[chainid1][4] === undefined ) ic.alnChainsAnTtl[chainid1][4] = [];
          if(ic.alnChainsAnTtl[chainid1][5] === undefined ) ic.alnChainsAnTtl[chainid1][5] = [];
          if(ic.alnChainsAnTtl[chainid1][6] === undefined ) ic.alnChainsAnTtl[chainid1][6] = [];

          // two annotations without titles
          ic.alnChainsAnTtl[chainid1][0].push(chainid2);
          ic.alnChainsAnTtl[chainid1][1].push(chainid1);
          ic.alnChainsAnTtl[chainid1][2].push("");
          ic.alnChainsAnTtl[chainid1][3].push("");

          // 2nd chain title
          ic.alnChainsAnTtl[chainid1][4].push(chainid2);
          // master chain title
          ic.alnChainsAnTtl[chainid1][5].push(chainid1);
          // empty line
          ic.alnChainsAnTtl[chainid1][6].push("");

          var alignIndex = 1;
          //for(var j = 0, jl = alignData.sseq.length; j < jl; ++j) {
          for(var j = start; j <= end; ++j) {
              // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
              //var resi = alignData.sequence[j][1];
              //var resi = alignData.sequence[j][0];
              var offset = (ic.chainid2offset[chainid2]) ? ic.chainid2offset[chainid2] : 0;
              var resi = (ic.bUsePdbNum) ? alignData.sequence[j][0] + offset : alignData.sequence[j][0];
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
                  //alignedAtoms = ic.unionHash(alignedAtoms, ic.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                  //alignedAtoms = ic.unionHash(alignedAtoms, ic.residues[chainid2 + '_' + resi]);
              }
              else {
                  color = me.GREY8;
                  classname = 'icn3d-nalign';

                  me.nalignHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                  me.nalignHash2[chainid2 + '_' + resi] = 1;
              }

              // chain1
              if(ic.alnChainsSeq[chainid1] === undefined) ic.alnChainsSeq[chainid1] = [];

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

              ic.alnChainsSeq[chainid1].push(resObject);

              if(id2aligninfo[j].resi !== '') {
                  if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {};
                  $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + id2aligninfo[j].resi] );
              }

              // chain2
              if(ic.alnChainsSeq[chainid2] === undefined) ic.alnChainsSeq[chainid2] = [];

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

              ic.alnChainsSeq[chainid2].push(resObject);

              if(resObject.resi !== '') {
                  if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {};
                  $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resi] );
              }

              // annotation is for the master seq only
              if(ic.alnChainsAnno[chainid1] === undefined ) ic.alnChainsAnno[chainid1] = [];
              if(ic.alnChainsAnno[chainid1][0] === undefined ) ic.alnChainsAnno[chainid1][0] = [];
              if(ic.alnChainsAnno[chainid1][1] === undefined ) ic.alnChainsAnno[chainid1][1] = [];
              if(ic.alnChainsAnno[chainid1][2] === undefined ) ic.alnChainsAnno[chainid1][2] = [];
              if(ic.alnChainsAnno[chainid1][3] === undefined ) ic.alnChainsAnno[chainid1][3] = [];
              if(j === start) {
                  // empty line
                  // 2nd chain title
                  if(ic.alnChainsAnno[chainid1][4] === undefined ) ic.alnChainsAnno[chainid1][4] = [];
                  // master chain title
                  if(ic.alnChainsAnno[chainid1][5] === undefined ) ic.alnChainsAnno[chainid1][5] = [];
                  // empty line
                  if(ic.alnChainsAnno[chainid1][6] === undefined ) ic.alnChainsAnno[chainid1][6] = [];

                  ic.alnChainsAnno[chainid1][4].push(ic.pdbid_chain2title[chainid2]);
                  ic.alnChainsAnno[chainid1][5].push(ic.pdbid_chain2title[chainid1]);
                  ic.alnChainsAnno[chainid1][6].push('');
              }

              var residueid1 = chainid1 + '_' + id2aligninfo[j].resi;
              var residueid2 = chainid2 + '_' + resi;
              var ss1 = ic.secondaries[residueid1];
              var ss2 = ic.secondaries[residueid2];
              if(ss2 !== undefined) {
                  ic.alnChainsAnno[chainid1][0].push(ss2);
              }
              else {
                  ic.alnChainsAnno[chainid1][0].push('-');
              }

              if(ss1 !== undefined) {
                  ic.alnChainsAnno[chainid1][1].push(ss1);
              }
              else {
                  ic.alnChainsAnno[chainid1][1].push('-');
              }

              var symbol = '.';
              if(alignIndex % 5 === 0) symbol = '*';
              if(alignIndex % 10 === 0) symbol = '|';
              ic.alnChainsAnno[chainid1][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

              var numberStr = '';
              if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
              ic.alnChainsAnno[chainid1][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

              ++alignIndex;
          } // end for(var j
      } // end for(var i

      seqalign = {};
};
