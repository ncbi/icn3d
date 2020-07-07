/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickAddTrack = function() { var me = this; //"use strict";
    $(document).on('click', ".icn3d-addtrack", function(e) {
      e.stopImmediatePropagation();

      $("#" + me.pre + "anno_custom")[0].checked = true;
      $("[id^=" + me.pre + "custom]").show();

      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      $("#" + me.pre + "track_chainid").val(chainid);
      me.openDialog(me.pre + 'dl_addtrack', 'Add track for Chain: ' + chainid);
      $( "#" + me.pre + "track_gi" ).focus();
    });
};

iCn3DUI.prototype.clickCustomColor = function() { var me = this; //"use strict";
    $(document).on('click', ".icn3d-customcolor", function(e) {
      e.stopImmediatePropagation();

      //e.preventDefault();
      var chainid = $(this).attr('chainid');
      $("#" + me.pre + "customcolor_chainid").val(chainid);
      me.openDialog(me.pre + 'dl_customcolor', 'Apply custom color or tube for Chain: ' + chainid);
    });
};

iCn3DUI.prototype.clickDefineHelix = function() { var me = this; //"use strict";
    $(document).on('click', ".icn3d-helixsets", function(e) {
      e.stopImmediatePropagation();

      //e.preventDefault();
      var chainid = $(this).attr('chainid');

      me.defineSecondary(chainid, 'helix');

      me.setLogCmd('define helix sets | chain ' + chainid, true);
    });
};

iCn3DUI.prototype.clickDefineSheet = function() { var me = this; //"use strict";
    $(document).on('click', ".icn3d-sheetsets", function(e) {
      e.stopImmediatePropagation();

      //e.preventDefault();
      var chainid = $(this).attr('chainid');

      me.defineSecondary(chainid, 'sheet');

      me.setLogCmd('define sheet sets | chain ' + chainid, true);
    });
};

iCn3DUI.prototype.clickDefineCoil = function() { var me = this; //"use strict";
    $(document).on('click', ".icn3d-coilsets", function(e) {
      e.stopImmediatePropagation();

      //e.preventDefault();
      var chainid = $(this).attr('chainid');

      me.defineSecondary(chainid, 'coil');

      me.setLogCmd('define coil sets | chain ' + chainid, true);
    });
};

iCn3DUI.prototype.clickDeleteSets = function() { var me = this; //"use strict";
    $("#" + me.pre + "deletesets").click(function(e) {
         me.deleteSelectedSets();
         me.setLogCmd("delete selected sets", true);
    });
};

iCn3DUI.prototype.defineSecondary = function(chainid, type) { var me = this; //"use strict";
    if(!$('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) {
        me.openDialog(me.pre + 'dl_definedsets', 'Select sets');
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
    me.icn3d.hAtoms = {};

    //for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
      //var currResi = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < me.icn3d.chainsSeq[chainid].length) ? me.icn3d.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;
    for(var i = 0, il = me.icn3d.chainsSeq[chainid].length; i < il; ++i) {
      var currResi = me.icn3d.chainsSeq[chainid][i].resi;

      // name of secondary structures
      var residueid = chainid + '_' + currResi;

      if( me.icn3d.residues.hasOwnProperty(residueid) ) {
        var atom = me.icn3d.getFirstCalphaAtomObj(me.icn3d.residues[residueid]);
        var currSS = me.icn3d.secondaries[residueid];

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
      } // end if( me.icn3d.residues.hasOwnProperty(residueid) ) {
    } // for loop

    if(Object.keys(selectedResidues).length > 0) {
        setName = currName + 'Cterm)';
        if(type == 'coil') {
            me.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
        }
    }
};

iCn3DUI.prototype.simplifyText = function(text) { var me = this; //"use strict";
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

iCn3DUI.prototype.alignSequenceToStructure = function(chainid, data, title) { var me = this; //"use strict";
  var query, target;

  if(data.data !== undefined) {
      query = data.data[0].query;
      target = data.data[0].targets[chainid.replace(/_/g, '')];

      target = target.hsps[0];
  }

  var text = '';

  if(query !== undefined && target !== undefined) {
      var evalue = target.scores.e_value.toPrecision(2);
      if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();

      var bitscore = target.scores.bit_score;

      var targetSeq = data.targets[chainid.replace(/_/g, '')].seqdata;
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
              for(var serial in me.icn3d.residues[chainid + '_' + resi]) {
                  var color = new THREE.Color("#" + colorHexStr);
                  me.icn3d.atoms[serial].color = color;
                  me.icn3d.atomPrevColors[serial] = color;
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
  me.icn3d.draw();

  me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text) + " | type seq", true);
};


iCn3DUI.prototype.resetAnnoAll = function () {  var me = this; //"use strict";
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

iCn3DUI.prototype.clickAddTrackButton = function() { var me = this; //"use strict";
    // ncbi gi/accession
    $(document).on('click', "#" + me.pre + "addtrack_button1", function(e) {
       e.stopImmediatePropagation();

       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();

       //var gi = $("#" + me.pre + "track_gi").val().toUpperCase();
       var gi = $("#" + me.pre + "track_gi").val();
       var title = (isNaN(gi)) ? 'Acc ' + gi : 'gi ' + gi;

       //var text = $("#" + me.pre + "track_text").val();
       var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=track';

       $.ajax({
          url: url,
          type: 'POST',
          data : {'targets': chainid, 'queries': gi},
          dataType: 'jsonp',
          //dataType: 'json',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              me.alignSequenceToStructure(chainid, data, title);
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

    // FASTA
    $(document).on('click', "#" + me.pre + "addtrack_button2", function(e) {
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();

       var fasta = $("#" + me.pre + "track_fasta").val();
       //var title = 'fasta ' + fasta.substr(0, 5);
       var title = $("#" + me.pre + "fasta_title").val();

       //var text = $("#" + me.pre + "track_text").val();
       var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?from=track';
       $.ajax({
          url: url,
          type: 'POST',
          data : {'targets': chainid, 'queries': fasta},
          dataType: 'jsonp',
          //dataType: 'json',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              me.alignSequenceToStructure(chainid, data, title);
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

    // FASTA Alignment
    $(document).on('click', "#" + me.pre + "addtrack_button2b", function(e) {
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();
       var startpos = $("#" + me.pre + "fasta_startpos").val();
       var colorseqby = $("#" + me.pre + "colorseqby").val();
       var type = (colorseqby == 'identity') ? 'identity' : 'custom';

       var fastaList = $("#" + me.pre + "track_fastaalign").val();
       var fastaArray = fastaList.split('>');

       // the first array item is empty
       // the second array item is the sequence of the structure, start with i = 2
       var posFirst = fastaArray[1].indexOf('\n');
       var titleFirst = fastaArray[1].substr(0, posFirst);
       var seqFirst = fastaArray[1].substr(posFirst + 1).replace(/\n/g, '');

       var trackTitleArray = [];
       var trackSeqArray = [];
       for(var i = 2, il = fastaArray.length; i < il; ++i) {
           var pos = fastaArray[i].indexOf('\n');
           var title = fastaArray[i].substr(0, pos);
           trackTitleArray.push(title);
           var seq = fastaArray[i].substr(pos + 1).replace(/\n/g, '');
           trackSeqArray.push(seq);
       }

       var startposGiSeq;
       for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
           var pos = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < me.icn3d.chainsSeq[chainid].length) ? me.icn3d.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;

           if(pos != startpos) {
               continue;
           }
           else {
               startposGiSeq = i;
           }
       }

       if(startposGiSeq === undefined) alert("Please double check the start position before clicking \"Add Track\"");


       // set up gap for the master seq
       // don't count gaps in both ends
       me.targetGapHash = {};
       var prevSeq = '-', prevPos = 0, from, to, cnt = 0, dashCnt = 0;
       var bFound = false, seqStart = 0, seqEnd = 0;
       for(var i = 0, il = seqFirst.length; i < il; ++i) {
          if(seqFirst[i] == '-' && seqFirst[i] != prevSeq) { // start of gap
              from = cnt;
              dashCnt = 0;
          }

          if(prevSeq == '-' && seqFirst[i] != prevSeq && cnt > 0) { // end of gap
              to = prevPos;
              me.targetGapHash[from] = {'from': from, 'to': to + dashCnt - 1};
          }

          prevSeq = seqFirst[i];
          prevPos = cnt;

          if(seqFirst[i] != '-') {
              ++cnt;
              seqEnd = i;

              if(!bFound) {
                  seqStart = i;
                  bFound = true;
              }
          }
          else {
              ++dashCnt;
          }
       }

       me.resetAnnoAll();

       var targetGapHashStr = '';
       var cntTmp = 0;
       for(var i in me.targetGapHash) {
           if(cntTmp > 0) targetGapHashStr += ' ';
           targetGapHashStr += i + '_' + me.targetGapHash[i].from + '_' + me.targetGapHash[i].to;
           ++cntTmp;
       }

       me.setLogCmd("msa | " + targetGapHashStr, true);

       // add tracks
       var resi2cntSameRes = {}; // count of same residue at each position
       for(var j = 0, jl = trackSeqArray.length; j < jl; ++j) {
           var resi = startposGiSeq + 1;
           var text = '';
           for(var k = seqStart; k <= seqEnd; ++k) {
              //if(seqFirst[k] == '-') continue;

              if(j == 0) resi2cntSameRes[resi] = 0;

              text += trackSeqArray[j][k]; //me.giSeq[chainid][i];

              if(seqFirst[k] != '-') {
                  if(seqFirst[k] == trackSeqArray[j][k]) ++resi2cntSameRes[resi];
                  ++resi;
              }
           }

           var title = (trackTitleArray[j].length < 20) ? trackTitleArray[j] : trackTitleArray[j].substr(0, 20) + '...';
           var bMsa = true;
           me.showNewTrack(chainid, title, text, undefined, undefined, type, undefined, bMsa);

           me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text)
            + " | type " + type + " | color 0 | msa 1", true);
       }

       // set colot for the master seq
       if(trackSeqArray.length > 0) {
            if(me.icn3d.queryresi2score === undefined) me.icn3d.queryresi2score = {};
            if(me.icn3d.queryresi2score[chainid] === undefined) me.icn3d.queryresi2score[chainid] = {};

            var nSeq = trackSeqArray.length;
            for(var resi in resi2cntSameRes) {
                var score = parseInt(resi2cntSameRes[resi] / nSeq * 100);
                me.icn3d.queryresi2score[chainid][resi] = score;
            }

            var resiArray = Object.keys(resi2cntSameRes);
            var start = Math.min.apply(null, resiArray);
            var end = Math.max.apply(null, resiArray);

            var resiScoreStr = '';
            for(var resi = start; resi <= end; ++resi) {
                if(resi2cntSameRes.hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(resi2cntSameRes[resi] / nSeq * 9); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }

            me.icn3d.opts['color'] = 'align custom';
            me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.hAtoms);

            me.updateHlAll();

            me.icn3d.draw();

            me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
       }
    });

    // BED file
    $(document).on('click', "#" + me.pre + "addtrack_button3", function(e) {
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();


       var file = $("#" + me.pre + "track_bed")[0].files[0];

       if(!file) {
         alert("Please select a file...");
       }
       else {
         if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }

         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStr = e.target.result; // or = reader.result;

           var lineArray = dataStr.split('\n');

           var bItemRgb = false, bColorByStrand = false;
           var strandRgbArray;
           for(var i = 0, il = lineArray.length; i < il; ++i) {
               if(lineArray[i].substr(0, 7) == 'browser') continue;

               if(lineArray[i].substr(0, 5) == 'track') {
                   if(lineArray[i].toLowerCase().indexOf('itemrgb') != -1) bItemRgb = true;
                   if(lineArray[i].toLowerCase().indexOf('colorbystrand=') != -1) {
                       bColorByStrand = true;

                       //e.g., colorByStrand="255,0,0 0,0,255"
                       var pos = lineArray[i].toLowerCase().indexOf('colorbystrand=');
                       var restStr = lineArray[i].substr(pos);
                       var quotePos = restStr.indexOf('"');
                       if(quotePos != -1) {
                         var quoteStr = restStr.substr(quotePos + 1);
                         var quotePos2 = quoteStr.indexOf('"');
                         if(quotePos != -1) {
                           var colorList = quoteStr.substr(0, quotePos2);
                           strandRgbArray = colorList.split(' ');
                         }
                       }

                   }
               }
               else { // tracks
                      if(lineArray[i] == '') continue;
                      var fieldArray = lineArray[i].replace(/\s+/g, ' ').split(' ');

                      if(fieldArray.length > 8 || fieldArray.length < 6) bColorByStrand = false;
                      if(fieldArray.length < 9) bItemRgb = false;

                      //https://genome.ucsc.edu/FAQ/FAQformat.html#format1
                      var chromName = fieldArray[0];
                      var chromStart = fieldArray[1];
                      var chromEnd = fieldArray[2];
                      var trackName = fieldArray[3];

                      if(fieldArray.length > 4) var score = fieldArray[4];
                      if(fieldArray.length > 5) var strand = fieldArray[5]; // ., +, or -
                      if(fieldArray.length > 6) var thickStart = fieldArray[6];
                      if(fieldArray.length > 7) var thickEnd = fieldArray[7];
                      if(fieldArray.length > 8) var itemRgb = fieldArray[8];
                      if(fieldArray.length > 9) var blockCount = fieldArray[9];
                      if(fieldArray.length > 10) var blockSizes = fieldArray[10];
                      if(fieldArray.length > 11) var blockStarts = fieldArray[11];

                   var title = trackName;

                   var rgbColor = '51,51,51';
                   if(bItemRgb) {
                       rgbColor = itemRgb;
                   }
                   else if(bColorByStrand) {
                       if(strand == '+' && strandRgbArray.length > 0) {
                           rgbColor = strandRgbArray[0];
                       }
                       else if(strand == '-' && strandRgbArray.length > 1) {
                           rgbColor = strandRgbArray[1];
                       }
                       else if(strand == '.' && strandRgbArray.length > 2) {
                           rgbColor = strandRgbArray[2];
                       }
                   }

                   var text = '';
                   var cssColorArray = [];
                   for(var j = 0, jl = chromEnd; j < jl; ++j) {
                       if(j < chromStart) {
                           text += '-';
                           cssColorArray.push('');
                       }
                       else {
                           text += me.giSeq[chainid][j];
                           cssColorArray.push('rgb(' + rgbColor + ')');
                       }
                   }

                   me.showNewTrack(chainid, title, text, cssColorArray, undefined, undefined, rgbColor);

                   me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text) + " | type bed | color " + rgbColor, true);
               }
           }
         };

         reader.readAsText(file);
       }
    });

    // custom
    $(document).on('click', "#" + me.pre + "addtrack_button4", function(e) {
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();
       var title = $("#" + me.pre + "track_title").val();
       var text = $("#" + me.pre + "track_text").val(); // input simplifyText

       //me.showNewTrack(chainid, title, text);
       //me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);

       me.showNewTrack(chainid, title,  me.getFullText(text), undefined, 'custom', undefined);
       me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + text + " | type custom", true);
    });

    // current selection
    $(document).on('click', "#" + me.pre + "addtrack_button5", function(e) {
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();
       var title = $("#" + me.pre + "track_selection").val();
       var text = '';

       var selectedAtoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.chains[chainid]);

       var residueHash = me.icn3d.getResiduesFromCalphaAtoms(selectedAtoms);

       var cssColorArray = [];
       for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
          var cFull = me.giSeq[chainid][i];

          var c = cFull;
          if(cFull.length > 1) {
              //c = cFull[0] + '..';
              c = cFull[0]; // one letter for each residue
          }

          var pos = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < me.icn3d.chainsSeq[chainid].length) ? me.icn3d.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;

          if( residueHash.hasOwnProperty(chainid + '_' + pos) ) {
              var atom = me.icn3d.getFirstCalphaAtomObj(me.icn3d.residues[chainid + '_' + pos]);
              var colorStr = (atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
              var color = (atom.color !== undefined) ? colorStr : "CCCCCC";

              text += c;
              cssColorArray.push('#' + color);
          }
          else {
              text += '-';
              cssColorArray.push('');
          }
       }

       me.showNewTrack(chainid, title, text, cssColorArray, undefined, 'selection', undefined);

       me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text) + " | type selection", true);
    });

};

iCn3DUI.prototype.showNewTrack = function(chnid, title, text, cssColorArray, inTarget2queryHash, type, color, bMsa) {  var me = this; //"use strict";
    //if(me.customTracks[chnid] === undefined) {
    //    me.customTracks[chnid] = {};
    //}

    var bErrorMess = false;
    if(text == 'cannot be aligned') {
        bErrorMess = true;
    }

    var textForCnt = text.replace(/-/g, '');
    var resCnt = textForCnt.length;
    //if(resCnt > me.giSeq[chnid].length) {
    //    resCnt = me.giSeq[chnid].length;
    //}

    if(!bMsa) {
        if(text.length > me.giSeq[chnid].length) {
            text = text.substr(0, me.giSeq[chnid].length);
        }
        else if(text.length < me.giSeq[chnid].length && !bErrorMess) {
            // .fill is not supported in IE
            //var extra = Array(me.giSeq[chnid].length - text.length).fill(' ').join('');
            var extra = '';
            for(var i = 0, il = me.giSeq[chnid].length - text.length; i < il; ++i) {
                extra += '-';
            }

            text += extra;
        }
    }

    var simpTitle = title.replace(/\s/g, '_').replace(/\./g, 'dot').replace(/\W/g, '');
    if(simpTitle.length > 20) simpTitle = simpTitle.substr(0, 20);

    //me.customTracks[chnid][simpTitle] = text;

    var divLength = me.RESIDUE_WIDTH * text.length + 200;

    $("#" + me.pre + "dt_custom_" + chnid).append("<div id='" + me.pre + "dt_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "dt_custom_" + chnid + "_" + simpTitle).width(divLength);

    $("#" + me.pre + "ov_custom_" + chnid).append("<div id='" + me.pre + "ov_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "ov_custom_" + chnid + "_" + simpTitle).width(divLength);

    $("#" + me.pre + "tt_custom_" + chnid).append("<div id='" + me.pre + "tt_custom_" + chnid + "_" + simpTitle + "'></div>");
    $("#" + me.pre + "tt_custom_" + chnid + "_" + simpTitle).width(divLength);

    var html = '<div id="' + me.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
    var html2 = html;
    var html3 = html;

    //var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
    var htmlTmp2 = '<div class="icn3d-seqTitle" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
    var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';

    html3 += htmlTmp2 + htmlTmp3 + '<br>';

    var htmlTmp = '<span class="icn3d-seqLine">';

    html += htmlTmp2 + htmlTmp3 + htmlTmp;
    html2 += htmlTmp2 + htmlTmp3 + htmlTmp;

    //var pre ='cst' + me.customTracks[chnid].length;
    var posTmp = chnid.indexOf('_');
    var pre ='cst' + chnid.substr(posTmp);

    var prevEmptyWidth = 0;
    var prevLineWidth = 0;
    var widthPerRes = 1;

    var bAlignColor = (type === undefined || type === 'seq' || type === 'custom') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

    var bIdentityColor = (type === 'identity') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

    var parsedResn = {};
    var gapCnt = 0, currResi = 1;
    for(var i = 0, il = text.length; i < il; ++i) {
      var resNum = i-gapCnt;

      if(!bMsa) {
          html += me.insertGap(chnid, i, '-');
      }
      else {
          if(me.targetGapHash.hasOwnProperty(resNum) && !parsedResn.hasOwnProperty(resNum)) {
              gapCnt += me.targetGapHash[resNum].to - me.targetGapHash[resNum].from + 1;

              parsedResn[resNum] = 1;
          }
      }

      var c = text.charAt(i);

      if(c != ' ' && c != '-') {
          var colorHexStr = me.getColorhexFromBlosum62(c, me.icn3d.chainsSeq[chnid][resNum].name);
          var identityColorStr = (c == me.icn3d.chainsSeq[chnid][resNum].name) ? 'FF0000' : '0000FF';

          //var pos = (resNum >= me.matchedPos[chnid] && resNum - me.matchedPos[chnid] < me.icn3d.chainsSeq[chnid].length) ? me.icn3d.chainsSeq[chnid][resNum - me.matchedPos[chnid]].resi : me.baseResi[chnid] + 1 + resNum;
          var pos = currResi;

          if(inTarget2queryHash !== undefined) pos = inTarget2queryHash[i] + 1; // 0-based

          if(cssColorArray !== undefined && cssColorArray[i] != '') {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" style="color:' + cssColorArray[i] + '">' + c + '</span>';
          }
          else if(color) {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" style="color:rgb(' + color + ')">' + c + '</span>';
          }
          else if(bAlignColor) {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" style="color:#' + colorHexStr + '">' + c + '</span>';
          }
          else if(bIdentityColor) {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" style="color:#' + identityColorStr + '">' + c + '</span>';
          }
          else {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + c + '</span>';
          }

          html2 += me.insertGapOverview(chnid, i);

          var emptyWidth = (me.cfg.blast_rep_id == chnid) ? Math.round(me.seqAnnWidth * i / (me.maxAnnoLength + me.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
          if(emptyWidth < 0) emptyWidth = 0;

          html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
          if(cssColorArray !== undefined && cssColorArray[i] != '') {
              html2 += '<div style="display:inline-block; background-color:' + cssColorArray[i] + '; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }
          else if(color) {
              html2 += '<div style="display:inline-block; background-color:rgb(' + color + '); width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }
          else if(bAlignColor) {
              html2 += '<div style="display:inline-block; background-color:#' + colorHexStr + '; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }
          else {
              html2 += '<div style="display:inline-block; background-color:#333; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }

          prevEmptyWidth += emptyWidth;
          prevLineWidth += widthPerRes;

          ++currResi;
      }
      else {
          if(bErrorMess) {
              html += '<span>' + c + '</span>';
          }
          else {
            html += '<span>-</span>';
          }
      }
    }
    var htmlTmp = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';
    htmlTmp += '</span>';
    htmlTmp += '<br>';

    htmlTmp += '</div>';

    html += htmlTmp;
    html2 += htmlTmp;

    html3 += '</div>';

    $("#" + me.pre + "dt_custom_" + chnid + "_" + simpTitle).html(html);
    $("#" + me.pre + "ov_custom_" + chnid + "_" + simpTitle).html(html2);
    $("#" + me.pre + "tt_custom_" + chnid + "_" + simpTitle).html(html3);
};

iCn3DUI.prototype.checkGiSeq = function (chainid, title, text, type, color, bMsa, index) { var me = this; //"use strict";
    if(index > 20) return false;

    if(me.giSeq !== undefined && me.giSeq[chainid] !== undefined) {
        text = me.getFullText(text);
        me.showNewTrack(chainid, title, text, undefined, undefined, type, color, bMsa);
        return false;
    }

    // wait for me.giSeq to be available
    setTimeout(function(){ me.checkGiSeq(chainid, title, text, type, color, bMsa, index + 1); }, 100);
};

iCn3DUI.prototype.getFullText = function (text) { var me = this; //"use strict";
    var out = '';

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

    return out;
};
