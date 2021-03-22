/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.defineSecondary = function(chainid, type) { var me = this, ic = me.icn3d; "use strict";
    if(!$('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) {
        me.openDlg('dl_definedsets', 'Select sets');
        $("#" + me.pre + "atomsCustom").resizable();
    }

    var selectedResidues = {};
    var bUnion = false, bUpdateHighlight = true;

    // order of secondary structures
    var index = 1;

    var helixCnt = 0, sheetCnt = 0, bFirstSS = true;
    var zero = '0';
    //var prevName = chainid + zero + index + '_L(N', currName, setName;
    var prevName = chainid + '_C(Nterm', currName, setName;

    // clear selection
    ic.hAtoms = {};

    //for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
      //var currResi = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;
    for(var i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
      var currResi = ic.chainsSeq[chainid][i].resi;

      // name of secondary structures
      var residueid = chainid + '_' + currResi;

      if( ic.residues.hasOwnProperty(residueid) ) {
        var atom = ic.getFirstCalphaAtomObj(ic.residues[residueid]);
        var currSS = ic.secondaries[residueid];

        if(currSS == 'H') {
            if(atom.ssbegin) {
                ++helixCnt;

                if(Object.keys(selectedResidues).length > 0) {
                    setName = currName + 'H' + helixCnt + ')';
                    if(type == 'coil') {
                        me.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {};
                    ++index;
                }
            }

            //zero = (index < 10) ? '0' : '';
            //currName = chainid + zero + index + '_H' + helixCnt;
            currName = chainid + '_H' + helixCnt;
            selectedResidues[residueid] = 1;

            if(atom.ssend) {
                //zero = (index < 9) ? '0' : '';
                //prevName = chainid + zero + (index+1) + '_L(H' + helixCnt;
                prevName = chainid + '_C(H' + helixCnt;
                if(type == 'helix') {
                    me.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                    if(!bUnion) bUnion = true;
                }
                selectedResidues = {};
                ++index;
            }
        }
        else if(currSS == 'E') {
            if(atom.ssbegin) {
                ++sheetCnt;

                if(Object.keys(selectedResidues).length > 0) {
                    setName = currName + 'S' + sheetCnt + ')';
                    if(type == 'coil') {
                        me.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {};
                    ++index;
                }
            }

            //zero = (index < 10) ? '0' : '';
            //currName = chainid + zero + index + '_S' + sheetCnt;
            currName = chainid + '_S' + sheetCnt;
            selectedResidues[residueid] = 1;

            if(atom.ssend) {
                //zero = (index < 9) ? '0' : '';
                //prevName = chainid + zero + (index+1) + '_L(S' + sheetCnt;
                prevName = chainid + '_C(S' + sheetCnt;
                if(type == 'sheet') {
                    me.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                    if(!bUnion) bUnion = true;
                }
                selectedResidues = {};
                ++index;
            }
        }
        else {
            currName = prevName + '-';
            selectedResidues[residueid] = 1;
        }
      } // end if( ic.residues.hasOwnProperty(residueid) ) {
    } // for loop

    if(Object.keys(selectedResidues).length > 0) {
        setName = currName + 'Cterm)';
        if(type == 'coil') {
            me.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
        }
    }
};

iCn3DUI.prototype.simplifyText = function(text) { var me = this, ic = me.icn3d; "use strict";
    var out = ''; // 1-based text positions
    var bFoundText = false;

    var i, prevEmptyPos = -1;
    for(i = 0, il = text.length; i < il; ++i) {
        if(text[i] == '-' || text[i] == ' ') {
            if(bFoundText && i !== prevEmptyPos) {
                if(prevEmptyPos+1 == i-1) {
                    out += (prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
               }
                else {
                    out += (prevEmptyPos+1 + 1).toString() + '-' + (i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
                }
                bFoundText = false;
            }

            prevEmptyPos = i;
        }
        else {
            bFoundText = true;
        }
    }

    if(bFoundText && i == il) {
        if(prevEmptyPos+1 == i-1) {
            out += (prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
        }
        else {
            out += (prevEmptyPos+1 + 1).toString() + '-' + (i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
        }
    }

    return out;
};

iCn3DUI.prototype.resetAnnoAll = function () {  var me = this, ic = me.icn3d; "use strict";
   // reset annotations
   //$("#" + me.pre + "dl_annotations").html("");
   //me.bAnnoShown = false;
   //me.showAnnotations();

   $("[id^=" + me.pre + "dt_]").html("");
   $("[id^=" + me.pre + "tt_]").html("");
   $("[id^=" + me.pre + "ov_]").html("");
   me.processSeqData(me.chainid_seq);

   //if($("#" + me.pre + "dt_giseq_" + chainid).css("display") != 'block') {
   //    me.setAnnoViewAndDisplay('overview');
   //}
   //else {
       me.setAnnoViewAndDisplay('detailed view');
   //}
   me.resetAnnoTabAll();
};

iCn3DUI.prototype.checkGiSeq = function (chainid, title, text, type, color, bMsa, index) { var me = this, ic = me.icn3d; "use strict";
    if(index > 20) return false;

    if(me.giSeq !== undefined && me.giSeq[chainid] !== undefined) {
        var result = me.getFullText(text);
        text = result.text;
        me.showNewTrack(chainid, title, text, undefined, undefined, type, color, bMsa);
        return false;
    }

    // wait for me.giSeq to be available
    setTimeout(function(){ me.checkGiSeq(chainid, title, text, type, color, bMsa, index + 1); }, 100);
};

iCn3DUI.prototype.getFullText = function (text) { var me = this, ic = me.icn3d; "use strict";
    var out = '', fromArray = [], toArray = [];

    var textArray = text.split(',');
    var lastTextPos = -1;
    for(var i = 0, il = textArray.length; i < il; ++i) {
        var eachText = textArray[i].trim();
        if(eachText.length == 0) continue;

        var range_text = eachText.split(' ');
        if(range_text.length !== 2) continue;

        var rangeText = range_text[1];
        var start_end = range_text[0].split('-');

        var start, end;
        if(start_end.length == 2) {
            start = start_end[0] - 1; // 1-based
            end = start_end[1] - 1;
        }
        else if(start_end.length == 1) {
            start = start_end[0] - 1;
            end = start;
        }
        else {
            continue;
        }

        fromArray.push(start);
        toArray.push(end);

        // previous empty text
        for(var j = 0; j < start - lastTextPos - 1; ++j) {
            out += '-';
        }

        var range = end - start + 1;

        if(rangeText.length > range) {
             out += rangeText.substr(0, range);
        }
        else {
             out += rangeText;
        }

        // fill up rangeText
        for(var j = 0; j < range - rangeText.length; ++j) {
            out += '-';
        }

        lastTextPos = end;
    }

    return {"text": out, "fromArray": fromArray, "toArray": toArray};
};
