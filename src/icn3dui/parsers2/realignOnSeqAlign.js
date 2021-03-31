/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.realignOnSeqAlign = function () { var me = this, ic = me.icn3d; "use strict";
    me.saveSelectionPrep();

    var index = Object.keys(ic.defNames2Atoms).length;
    var name = 'alseq_' + index;

    me.saveSelection(name, name);

    me.opts['color'] = 'grey';
    ic.setColorByOptions(me.opts, ic.dAtoms);

    var struct2SeqHash = {};
    var struct2CoorHash = {};
    var struct2resid = {};
    var lastStruResi = '';
    for(var serial in ic.hAtoms) {
        var atom = ic.atoms[serial];
        if( (ic.proteins.hasOwnProperty(serial) && atom.name == "CA")
          || (ic.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*")) ) {
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

            if(resid == lastStruResi) continue; // e.g., Alt A and B

            if(!struct2SeqHash.hasOwnProperty(atom.structure)) {
                struct2SeqHash[atom.structure] = '';
                struct2CoorHash[atom.structure] = [];
                struct2resid[atom.structure] = [];
            }

            var oneLetterRes = ic.residueName2Abbr(atom.resn.substr(0, 3)).substr(0, 1);

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
                  var prevChain1 = '', prevChain2 = '';
                  for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                      var chainid1 = residArray1[j + seg.orifrom].substr(0, residArray1[j + seg.orifrom].lastIndexOf('_'));
                      var chainid2 = residArray2[j + seg.from].substr(0, residArray2[j + seg.from].lastIndexOf('_'));

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

              me.alignCoords(coordsFrom, coordsTo, fromStruct, undefined, chainid1, chainid2, 1);

              ic.draw();
              me.updateHlAll();
          }
          else {
              if(fromStruct === undefined && !me.cfg.command) {
                 alert('Please do not align residues in the same chain');
              }
              else if(((seq1 && seq1.length < 6) || (seq2 && seq2.length < 6)) && !me.cfg.command) {
                 alert('These sequences are too short for alignment');
              }
              else if(seq1 && seq2 && seq1.length >= 6 && seq2.length >= 6 && !me.cfg.command) {
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
           else if(((seq1 && seq1.length < 6) || (seq2 && seq2.length < 6)) && !me.cfg.command) {
              alert('These sequences are too short for alignment');
           }
           else if(seq1 && seq2 && seq1.length >= 6 && seq2.length >= 6 && !me.cfg.command) {
              alert('These sequences can not be aligned to each other');
           }

        if(me.deferredRealign !== undefined) me.deferredRealign.resolve();
      }
    });

};
