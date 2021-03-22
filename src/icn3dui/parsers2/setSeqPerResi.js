/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setSeqPerResi = function (chainid, chainid1, chainid2, resi, resn, bAligned, color, color2, classname, bFirstChain, bFirstResi, alignIndex) { var me = this, ic = me.icn3d; "use strict";
      if(ic.alnChainsSeq[chainid] === undefined) ic.alnChainsSeq[chainid] = [];

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

      ic.alnChainsSeq[chainid].push(resObject);

      if(resObject.resi !== '') {
          if(ic.alnChains[chainid] === undefined) ic.alnChains[chainid] = {};
          $.extend(ic.alnChains[chainid], ic.residues[chainid + '_' + resObject.resi] );
      }

      if(bFirstChain) {
          // annotation is for the master seq only
          if(ic.alnChainsAnno[chainid] === undefined ) ic.alnChainsAnno[chainid] = [];
          if(ic.alnChainsAnno[chainid][0] === undefined ) ic.alnChainsAnno[chainid][0] = [];
          if(ic.alnChainsAnno[chainid][1] === undefined ) ic.alnChainsAnno[chainid][1] = [];
          if(ic.alnChainsAnno[chainid][2] === undefined ) ic.alnChainsAnno[chainid][2] = [];
          if(ic.alnChainsAnno[chainid][3] === undefined ) ic.alnChainsAnno[chainid][3] = [];
          if(bFirstResi) {
              // empty line
              // 2nd chain title
              if(ic.alnChainsAnno[chainid][4] === undefined ) ic.alnChainsAnno[chainid][4] = [];
              // master chain title
              if(ic.alnChainsAnno[chainid][5] === undefined ) ic.alnChainsAnno[chainid][5] = [];
              // empty line
              if(ic.alnChainsAnno[chainid][6] === undefined ) ic.alnChainsAnno[chainid][6] = [];

              var title1 = ic.pdbid_chain2title && ic.pdbid_chain2title.hasOwnProperty(chainid2) ? ic.pdbid_chain2title[chainid2] : ""
              var title2 = ic.pdbid_chain2title && ic.pdbid_chain2title.hasOwnProperty(chainid) ? ic.pdbid_chain2title[chainid] : ""
              ic.alnChainsAnno[chainid][4].push(title1);
              ic.alnChainsAnno[chainid][5].push(title2);
              ic.alnChainsAnno[chainid][6].push('');
          }

          var symbol = '.';
          if(alignIndex % 5 === 0) symbol = '*';
          if(alignIndex % 10 === 0) symbol = '|';
          ic.alnChainsAnno[chainid][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

          var numberStr = '';
          if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
          ic.alnChainsAnno[chainid][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

          var residueid = chainid + '_' + resi;
          var ss = ic.secondaries[residueid];

          if(ss !== undefined) {
              ic.alnChainsAnno[chainid][1].push(ss);
          }
          else {
              ic.alnChainsAnno[chainid][1].push('-');
          }
      }
      else {
          var residueid = chainid + '_' + resi;
          var ss = ic.secondaries[residueid];

          if(ic.alnChainsAnno.hasOwnProperty(chainid1) && ic.alnChainsAnno[chainid1].length > 0) {
              if(ss !== undefined) {
                  ic.alnChainsAnno[chainid1][0].push(ss);
              }
              else {
                  ic.alnChainsAnno[chainid1][0].push('-');
              }
          }
          else {
              console.log("Error: ic.alnChainsAnno[chainid1] is undefined");
          }
      }
};
