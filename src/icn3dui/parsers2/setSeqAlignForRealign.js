/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setSeqAlignForRealign = function (chainid_t, chainid, chainIndex) { var me = this, ic = me.icn3d; "use strict";
      //loadSeqAlignment
      var alignedAtoms = {};

      //var chainid_t = me.chainidArray[0];

//      var structureArray = Object.keys(ic.structures);
      var structure1 = chainid_t.substr(0, chainid_t.indexOf('_')); //structureArray[0];
      var structure2 = chainid.substr(0, chainid.indexOf('_')); //structureArray[1];

      if(structure1 == structure2) structure2 += me.postfix;

      me.conservedName1 = structure1 + '_cons';
      me.conservedName2 = structure2 + '_cons';

      me.consHash1 = {};
      me.consHash2 = {};

      ic.alnChainsAnTtl = {};
      ic.alnChainsAnno = {};

      if(ic.alnChainsSeq === undefined) ic.alnChainsSeq = {};
      ic.alnChains = {};

      ic.alnChainsSeq[chainid_t] = [];
      ic.alnChains[chainid_t] = {};
      ic.alnChainsAnno[chainid_t] = [];
      ic.alnChainsAnTtl[chainid_t] = [];

//      var emptyResObject = {resid: '', resn:'', resi: 0, aligned: false};

//      var prevChainid1 = '', prevChainid2 = '', cnt1 = 0, cnt2 = 0;

      var residuesHash = {};

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

          residuesHash[resObject1.resid] = 1;
          residuesHash[resObject2.resid] = 1;

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

          for(var j in ic.residues[resObject1.resid]) {
              ic.atoms[j].color = ic.thr(color);
          }
          for(var j in ic.residues[resObject2.resid]) {
              ic.atoms[j].color = ic.thr(color);
          }

          // annoation title for the master seq only
          if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];

          for(var j = 0; j < 3; ++j) {
              if(ic.alnChainsAnTtl[chainid1][j] === undefined ) ic.alnChainsAnTtl[chainid1][j] = [];
          }

          // two annotations without titles
          for(var j = 0; j < 3; ++j) {
              ic.alnChainsAnTtl[chainid1][j].push("");
          }

          if(ic.alnChainsSeq[chainid1] === undefined) ic.alnChainsSeq[chainid1] = [];
          if(ic.alnChainsSeq[chainid2] === undefined) ic.alnChainsSeq[chainid2] = [];

          ic.alnChainsSeq[chainid1].push(resObject1);
          ic.alnChainsSeq[chainid2].push(resObject2);

          if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {};
          if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {};
          $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + resObject1.resi] );
          $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resObject2.resi] );

          me.consHash1[chainid1 + '_' + resObject1.resi] = 1;
          me.consHash2[chainid2 + '_' + resObject2.resi] = 1;

          // annotation is for the master seq only
          if(ic.alnChainsAnno[chainid1] === undefined ) ic.alnChainsAnno[chainid1] = [];
          //if(ic.alnChainsAnno[chainid2] === undefined ) ic.alnChainsAnno[chainid2] = [];

          for(var j = 0; j < 3; ++j) {
              if(ic.alnChainsAnno[chainid1][j] === undefined ) ic.alnChainsAnno[chainid1][j] = [];
          }

          var symbol = '.';
          if(i % 5 === 0) symbol = '*';
          if(i % 10 === 0) symbol = '|';
          ic.alnChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

          var numberStr = '';
          if(i % 10 === 0) numberStr = i.toString();
          ic.alnChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest
      }

        var commandname = 'protein_aligned';
        var commanddescr = 'protein aligned';
        var select = "select " + me.residueids2spec(Object.keys(residuesHash));
        me.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
};
