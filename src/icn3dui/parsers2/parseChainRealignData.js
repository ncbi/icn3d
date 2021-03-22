/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.parseChainRealignData = function (ajaxData, chainresiCalphaHash2, chainidArray, struct2SeqHash, struct2CoorHash, struct2resid) { var me = this, ic = me.icn3d; "use strict";
  var dataArray = (chainidArray.length == 2) ? [ajaxData] : ajaxData;

  var toStruct = chainidArray[0].substr(0, chainidArray[0].indexOf('_')).toUpperCase();

  var hAtoms = {};

  me.realignResid = {};

  // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
  //var data2 = v2[0];
  for(var index = 0, indexl = dataArray.length; index < indexl; ++index) {
//  for(var index = 1, indexl = dataArray.length; index < indexl; ++index) {
      var data = dataArray[index][0];

      var fromStruct = chainidArray[index + 1].substr(0, chainidArray[index + 1].indexOf('_')).toUpperCase();
      if(toStruct == fromStruct) fromStruct += me.postfix;

      var seq1 = struct2SeqHash[toStruct];
      var seq2 = struct2SeqHash[fromStruct];

      var coord1 = struct2CoorHash[toStruct];
      var coord2 = struct2CoorHash[fromStruct];

      var residArray1 = struct2resid[toStruct];
      var residArray2 = struct2resid[fromStruct];

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

          me.realignResid[toStruct] = [];
          me.realignResid[fromStruct] = [];

          var segArray = target.segs;
          for(var i = 0, il = segArray.length; i < il; ++i) {
              var seg = segArray[i];
              var prevChain1 = '', prevChain2 = '';
              for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                  var chainid1 = residArray1[j + seg.orifrom].substr(0, residArray1[j + seg.orifrom].lastIndexOf('_'));
                  var chainid2 = residArray2[j + seg.from].substr(0, residArray2[j + seg.from].lastIndexOf('_'));

                  if(!coord1[j + seg.orifrom] || !coord2[j + seg.from]) continue;

                  coordsTo.push(coord1[j + seg.orifrom]);
                  coordsFrom.push(coord2[j + seg.from]);

                  seqto += seq1[j + seg.orifrom];
                  seqfrom += seq2[j + seg.from];

                  // one chaincould be longer than the other
                  if(j == 0 || (prevChain1 == chainid1 && prevChain2 == chainid2) || (prevChain1 != chainid1 && prevChain2 != chainid2)) {
                      me.realignResid[toStruct].push({'resid':residArray1[j + seg.orifrom], 'resn':seq1[j + seg.orifrom]});
                      me.realignResid[fromStruct].push({'resid':residArray2[j + seg.from], 'resn':seq2[j + seg.from]});
                  }

                  prevChain1 = chainid1;
                  prevChain2 = chainid2;
              }
          }

          var chainTo = chainidArray[0];
          var chainFrom = chainidArray[index + 1];

          var bChainAlign = true;
          var hAtomsTmp = me.alignCoords(coordsFrom, coordsTo, fromStruct, undefined, chainTo, chainFrom, index + 1, bChainAlign);
          hAtoms = ic.unionHash(hAtoms, hAtomsTmp);

//          me.opts['color'] = 'identity';
//          ic.setColorByOptions(me.opts, ic.hAtoms);

          //me.updateHlAll();
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

      // update all residue color

      //if(me.deferredRealign !== undefined) me.deferredRealign.resolve();
  }

  me.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms);

//  ic.draw();
//  me.updateHlAll();
};
