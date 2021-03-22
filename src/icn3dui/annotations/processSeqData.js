/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.processSeqData = function(chainid_seq) { var me = this, ic = me.icn3d; "use strict";
    for(var chnid in me.protein_chainid) {
        var chnidBase = me.protein_chainid[chnid];
        //if(chainid_seq.hasOwnProperty(chnid)) {
        //    var allSeq = chainid_seq[chnid];
        if(chainid_seq.hasOwnProperty(chnidBase)) {
            var allSeq = chainid_seq[chnidBase];
            me.giSeq[chnid] = allSeq;
            // the first 10 residues from sequences with structure
            var startResStr = '';
            for(var i = 0; i < 10 && i < ic.chainsSeq[chnid].length; ++i) {
                startResStr += ic.chainsSeq[chnid][i].name.substr(0, 1);
            }
            var pos = allSeq.toLowerCase().indexOf(startResStr.toLowerCase());
            if(pos == -1) {
                console.log("The gi sequence didn't match the protein sequence. The start of 3D protein sequence: " + startResStr + ". The gi sequence: " + allSeq.substr(0, 10) + ".");
                me.setAlternativeSeq(chnid, chnidBase);
            }
            else {
                me.matchedPos[chnid] = pos;
                me.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - me.matchedPos[chnid] - 1;
            }
        }
        else {
            console.log( "No data were found for the protein " + chnid + "..." );
            me.setAlternativeSeq(chnid, chnidBase);
        }
        if(me.cfg.blast_rep_id != chnid) {
            me.showSeq(chnid, chnidBase);
        }
        else if(me.cfg.blast_rep_id == chnid && me.seqStructAlignData.data === undefined) {
          var title;
          if(me.cfg.query_id.length > 14) {
              title = 'Query: ' + me.cfg.query_id.substr(0, 6) + '...';
          }
          else {
              title = (isNaN(me.cfg.query_id)) ? 'Query: ' + me.cfg.query_id : 'Query: gi ' + me.cfg.query_id;
          }
          compTitle = undefined;
          compText = undefined;
          var text = "cannot be aligned";
          me.queryStart = '';
          me.queryEnd = '';
          alert('The sequence can NOT be aligned to the structure');
          me.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
        }
        else if(me.cfg.blast_rep_id == chnid && me.seqStructAlignData.data !== undefined) { // align sequence to structure
          //var title = 'Query: ' + me.cfg.query_id.substr(0, 6);
          var title;
          if(me.cfg.query_id.length > 14) {
              title = 'Query: ' + me.cfg.query_id.substr(0, 6) + '...';
          }
          else {
              title = (isNaN(me.cfg.query_id)) ? 'Query: ' + me.cfg.query_id : 'Query: gi ' + me.cfg.query_id;
          }
          var data = me.seqStructAlignData;

          var query, target;
          if(data.data !== undefined) {
              query = data.data[0].query;
              //target = data.data[0].targets[chnid.replace(/_/g, '')];
              target = data.data[0].targets[chnid];
              target = (target !== undefined && target.hsps.length > 0) ? target.hsps[0] : undefined;
          }
          var text = '', compText = '';
          me.queryStart = '';
          me.queryEnd = '';
          var evalue;
          if(query !== undefined && target !== undefined) {
              evalue = target.scores.e_value.toPrecision(2);
              if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();
              var bitscore = target.scores.bit_score;
              //var targetSeq = data.targets[chnid.replace(/_/g, '')].seqdata;
              var targetSeq = data.targets[chnid].seqdata;
              var querySeq = query.seqdata;
              var segArray = target.segs;
              var target2queryHash = {};
              if(me.targetGapHash === undefined) me.targetGapHash = {};
              me.fullpos2ConsTargetpos = {};
              me.consrvResPosArray = [];
              var prevTargetTo = 0, prevQueryTo = 0;
              me.nTotalGap = 0;
              me.queryStart = segArray[0].from + 1;
              me.queryEnd = segArray[segArray.length - 1].to + 1;
              for(var i = 0, il = segArray.length; i < il; ++i) {
                  var seg = segArray[i];
                  if(i > 0) { // determine gap
                    if(seg.orifrom - prevTargetTo < seg.from - prevQueryTo) { // gap in target
                        me.targetGapHash[seg.orifrom] = {'from': prevQueryTo + 1, 'to': seg.from - 1};
                        me.nTotalGap += me.targetGapHash[seg.orifrom].to - me.targetGapHash[seg.orifrom].from + 1;
                    }
                    else if(seg.orifrom - prevTargetTo > seg.from - prevQueryTo) { // gap in query
                        for(var j = prevTargetTo + 1; j < seg.orifrom; ++j) {
                          target2queryHash[j] = -1; // means gap in query
                        }
                    }
                  }
                  for(var j = 0; j <= seg.orito - seg.orifrom; ++j) {
                      target2queryHash[j + seg.orifrom] = j + seg.from;
                  }
                  prevTargetTo = seg.orito;
                  prevQueryTo = seg.to;
              }
              // the missing residues at the end of the seq will be filled up in the API showNewTrack()
              var nGap = 0;
              ic.alnChainsSeq[chnid] = [];
              var offset = (ic.chainid2offset[chnid]) ? ic.chainid2offset[chnid] : 0;
              for(var i = 0, il = targetSeq.length; i < il; ++i) {
                  //text += me.insertGap(chnid, i, '-', true);
                  if(me.targetGapHash.hasOwnProperty(i)) {
                      for(var j = me.targetGapHash[i].from; j <= me.targetGapHash[i].to; ++j) {
                          text += querySeq[j];
                      }
                  }
                  compText += me.insertGap(chnid, i, '-', true);
                  if(me.targetGapHash.hasOwnProperty(i)) nGap += me.targetGapHash[i].to - me.targetGapHash[i].from + 1;
                  var pos = (ic.bUsePdbNum) ? i+1 + offset : i+1;
                  if(target2queryHash.hasOwnProperty(i) && target2queryHash[i] !== -1) {
                      text += querySeq[target2queryHash[i]];
                      var colorHexStr = me.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
                      if(targetSeq[i] == querySeq[target2queryHash[i]]) {
                          compText += targetSeq[i];
                          me.fullpos2ConsTargetpos[i + nGap] = {'same': 1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr};
                          me.consrvResPosArray.push(pos);
                          ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#FF0000', 'color2': '#' + colorHexStr});
                      }
                      else if(me.conservativeReplacement(targetSeq[i], querySeq[target2queryHash[i]])) {
                          compText += '+';
                          me.fullpos2ConsTargetpos[i + nGap] = {'same': 0, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr};
                          me.consrvResPosArray.push(pos);
                          ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#0000FF', 'color2': '#' + colorHexStr});
                      }
                      else {
                          compText += ' ';
                          me.fullpos2ConsTargetpos[i + nGap] = {'same': -1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr};
                          ic.alnChainsSeq[chnid].push({'resi': pos, 'color': me.GREYC, 'color2': '#' + colorHexStr});
                      }
                  }
                  else {
                      text += '-';
                      compText += ' ';
                  }
              }
              //title += ', E: ' + evalue;
          }
          else {
              text += "cannot be aligned";
              alert('The sequence can NOT be aligned to the structure');
          }
          var compTitle = 'BLAST, E: ' + evalue;
          me.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
          var residueidHash = {};
          var residueid;
          if(me.consrvResPosArray !== undefined) {
            for(var i = 0, il = me.consrvResPosArray.length; i < il; ++i) {
                residueid = chnidBase + '_' + me.consrvResPosArray[i];
                residueidHash[residueid] = 1;
                //atomHash = ic.unionHash(atomHash, ic.residues[residueid]);
            }
          }
          var prevHAtoms = ic.cloneHash(ic.hAtoms);
          //me.selectResidueList(residueidHash, chnidBase + '_blast', compTitle, false);
          me.selectResidueList(residueidHash, 'protein_aligned', compTitle, false);
          ic.hAtoms = ic.cloneHash(prevHAtoms);
        } // align seq to structure
    } // for loop
    me.enableHlSeq();
    // get CDD/Binding sites
    me.showCddSiteAll();
};

iCn3DUI.prototype.enableHlSeq = function() { var me = this, ic = me.icn3d; "use strict";
    if(! me.isMobile()) {
        me.selectSequenceNonMobile();
    }
    else {
        me.selectSequenceMobile();
        me.selectChainMobile();
    }
    // highlight seq after the ajax calls
    if(Object.keys(ic.hAtoms).length < Object.keys(ic.dAtoms).length) {
        me.updateHlSeq();
    }
};

iCn3DUI.prototype.getAnDiv = function(chnid, anno) { var me = this, ic = me.icn3d; "use strict";
    var message = 'Loading ' + anno + '...';
    if(anno == 'custom') {
        message = ''
    }
    else if(anno == 'domain') {
        message = 'Loading 3D ' + anno + '...';
    }
    return "<div id='" + me.pre + anno + "_" + chnid + "'><div id='" + me.pre + "tt_" + anno + "_" + chnid + "' class='icn3d-fixed-pos' style='display:none!important'></div><div id='" + me.pre + "dt_" + anno + "_" + chnid + "' style='display:none'>" + message + "</div><div id='" + me.pre + "ov_" + anno + "_" + chnid + "'>" + message + "</div></div>";
};
iCn3DUI.prototype.addButton = function(chnid, classvalue, name, desc, width, buttonStyle) { var me = this, ic = me.icn3d; "use strict";
    return "<div class='" + classvalue + "' chainid='" + chnid + "' style='display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
};
iCn3DUI.prototype.addSnpButton = function(snp, classvalue, name, desc, width, buttonStyle) { var me = this, ic = me.icn3d; "use strict";
    return "<div class='" + me.pre + classvalue + "' snp='" + snp + "' style='margin:3px 0 3px 0; display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
};
iCn3DUI.prototype.conservativeReplacement = function(resA, resB) { var me = this, ic = me.icn3d; "use strict";
    var iA = (me.b62ResArray.indexOf(resA) !== -1) ? me.b62ResArray.indexOf(resA) : me.b62ResArray.length - 1; // or the last one "*"
    var iB = (me.b62ResArray.indexOf(resB) !== -1) ? me.b62ResArray.indexOf(resB) : me.b62ResArray.length - 1; // or the last one "*"
    var matrixValue = me.b62Matrix[iA][iB];
    if(matrixValue > 0) {
        return true;
    }
    else {
        return false;
    }
};
iCn3DUI.prototype.getColorhexFromBlosum62 = function(resA, resB) { var me = this, ic = me.icn3d; "use strict";
    var iA = (me.b62ResArray.indexOf(resA) !== -1) ? me.b62ResArray.indexOf(resA) : me.b62ResArray.length - 1; // or the last one "*"
    var iB = (me.b62ResArray.indexOf(resB) !== -1) ? me.b62ResArray.indexOf(resB) : me.b62ResArray.length - 1; // or the last one "*"
    var matrixValue = me.b62Matrix[iA][iB];
    if(matrixValue === undefined) return '333333';
    // range and color: blue for -4 ~ 0, red for 0 ~ 11
    // max value 221 to avoid white
    var color = '333333';
    if(matrixValue > 0) {
        var c = 221 - parseInt(matrixValue / 11.0 * 221);
        var cStr = (c < 10) ? '0' + c.toString(16) : c.toString(16);
        color = 'DD' + cStr + cStr;
    }
    else {
        var c = 221 - parseInt(-1.0 * matrixValue / 4.0 * 221);
        var cStr = (c < 10) ? '0' + c.toString(16) : c.toString(16);
        color = cStr + cStr + 'DD';
    }
    return color;
};
