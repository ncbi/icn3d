/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setSeqAlignChain = function (chainid, chainIndex) { var me = this, ic = me.icn3d; "use strict";
      //loadSeqAlignment
      var alignedAtoms = {};

      //var chainidArray = me.cfg.chainalign.split(',');
      var pos1 = me.chainidArray[0].indexOf('_');
      var pos2 = chainid.indexOf('_');

      var mmdbid1 = me.mmdbid_t; //me.chainidArray[0].substr(0, pos1).toUpperCase();
      var mmdbid2 = chainid.substr(0, pos2).toUpperCase();

      var chain1 = me.chainidArray[0].substr(pos1 + 1);
      var chain2 = chainid.substr(pos2 + 1);

      if(mmdbid1 == mmdbid2 && chain1 == chain2) {
        var chainLen = ic.chainsSeq[me.mmdbid_q + '_' + me.chain_q].length;
        me.qt_start_end[chainIndex] =  {"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen};
      }

      var chainid1 = mmdbid1 + "_" + chain1;
      var chainid2 = mmdbid2 + "_" + chain2;

      if(mmdbid2 !== undefined && mmdbid2 === me.mmdbid_t) {
          //chainid1 += me.postfix;
          chainid2 = mmdbid2 + me.postfix + "_" + chain2;
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

      ic.alnChains = {};

      ic.alnChainsSeq[chainid1] = [];
      ic.alnChains[chainid1] = {};
      ic.alnChainsAnno[chainid1] = [];
      ic.alnChainsAnTtl[chainid1] = [];

      if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];
      for(var i = 0; i < 7; ++i) {
          if(ic.alnChainsAnTtl[chainid1][i] === undefined ) ic.alnChainsAnTtl[chainid1][i] = [];
      }

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

      var color, color2, classname;
      var firstIndex1 = 0;
      var firstIndex2 = 0;
      var prevIndex1, prevIndex2;

      if(me.qt_start_end[chainIndex] === undefined) return;

      var alignIndex = 1;
      for (var i = 0, il = me.qt_start_end[chainIndex].length; i < il; ++i) {
          //var start1 = me.qt_start_end[chainIndex][i].q_start - 1;
          //var start2 = me.qt_start_end[chainIndex][i].t_start - 1;
          //var end1 = me.qt_start_end[chainIndex][i].q_end - 1;
          //var end2 = me.qt_start_end[chainIndex][i].t_end - 1;

          var start1 = me.qt_start_end[chainIndex][i].t_start - 1;
          var start2 = me.qt_start_end[chainIndex][i].q_start - 1;
          var end1 = me.qt_start_end[chainIndex][i].t_end - 1;
          var end2 = me.qt_start_end[chainIndex][i].q_end - 1;

          if(i > 0) {
              var index1 = alignIndex;
              for(var j = prevIndex1 + 1, jl = start1; j < jl; ++j) {
                  if(ic.chainsSeq[chainid1] === undefined) break;
                  var resi = ic.chainsSeq[chainid1][j].resi;
                  var resn = ic.chainsSeq[chainid1][j].name.toLowerCase();
                  color = me.GREY8;
                  classname = 'icn3d-nalign';

                  me.nalignHash1[chainid1 + '_' + resi] = 1;
                  me.setSeqPerResi(chainid1, chainid1, chainid2, resi, resn, false, color, undefined, classname, true, false, index1);
                  ++index1;
              }

              var index2 = alignIndex;
              for(var j = prevIndex2 + 1, jl = start2; j < jl; ++j) {
                  if(ic.chainsSeq[chainid2] === undefined) break;
                  var resi = ic.chainsSeq[chainid2][j].resi;
                  var resn = ic.chainsSeq[chainid2][j].name.toLowerCase();

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
          }


          for(var j = 0; j <= end1 - start1; ++j) {
              if(ic.chainsSeq[chainid1] === undefined || ic.chainsSeq[chainid2] === undefined) break;

              if(ic.chainsSeq[chainid1][j + start1] === undefined || ic.chainsSeq[chainid2][j + start2] === undefined) continue;

              var resi1 = ic.chainsSeq[chainid1][j + start1].resi;
              var resi2 = ic.chainsSeq[chainid2][j + start2].resi;
              var resn1 = ic.chainsSeq[chainid1][j + start1].name.toUpperCase();
              var resn2 = ic.chainsSeq[chainid2][j + start2].name.toUpperCase();

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
