/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.alignSequenceToStructure = function(chainid, data, title) { var me = this, ic = me.icn3d; "use strict";
  var query, target;

  if(data.data !== undefined) {
      query = data.data[0].query;
      //target = data.data[0].targets[chainid.replace(/_/g, '')];
      target = data.data[0].targets[chainid];

      target = target.hsps[0];
  }

  var text = '';

  if(query !== undefined && target !== undefined) {
      var evalue = target.scores.e_value.toPrecision(2);
      if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();

      var bitscore = target.scores.bit_score;

      //var targetSeq = data.targets[chainid.replace(/_/g, '')].seqdata;
      var targetSeq = data.targets[chainid].seqdata;
      var querySeq = query.seqdata;

      var segArray = target.segs;
      var target2queryHash = {};
      for(var i = 0, il = segArray.length; i < il; ++i) {
          var seg = segArray[i];
          for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
              target2queryHash[j + seg.orifrom] = j + seg.from;
          }
      }

      var cssColorArray = [];
      // the missing residuesatthe end ofthe seq will be filled up in the API showNewTrack()
      for(var i = 0, il = targetSeq.length; i < il; ++i) {
          if(target2queryHash.hasOwnProperty(i)) {
              text += querySeq[target2queryHash[i]];

              var colorHexStr = me.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
              cssColorArray.push("#" + colorHexStr);

              var resi = i + 1;
              for(var serial in ic.residues[chainid + '_' + resi]) {
                  var color = ic.thr("#" + colorHexStr);
                  ic.atoms[serial].color = color;
                  ic.atomPrevColors[serial] = color;
              }
          }
          else {
              text += '-';
              cssColorArray.push("");
          }
      }

      title += ', E: ' + evalue;
  }
  else {
      text += "cannot be aligned";
  }

  me.showNewTrack(chainid, title, text, cssColorArray, target2queryHash, 'seq');

  me.updateHlAll();
  ic.draw();

  me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text) + " | type seq", true);
};
