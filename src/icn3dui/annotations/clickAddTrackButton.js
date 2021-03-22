/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickAddTrackButton = function() { var me = this, ic = me.icn3d; "use strict";
    // ncbi gi/accession
    $(document).on('click', "#" + me.pre + "addtrack_button1", function(e) { var ic = me.icn3d;
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
    $(document).on('click', "#" + me.pre + "addtrack_button2", function(e) { var ic = me.icn3d;
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
    $(document).on('click', "#" + me.pre + "addtrack_button2b", function(e) { var ic = me.icn3d;
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

       var startposGiSeq = undefined;
       for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
           var pos = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;

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
              me.targetGapHash[from + startposGiSeq] = {'from': from + startposGiSeq, 'to': to + dashCnt - 1 + startposGiSeq};
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
           for(var k = 0; k < startposGiSeq; ++k) {
               if(me.targetGapHash.hasOwnProperty(k)) {
                   for(var m = 0; m < me.targetGapHash[k].to - me.targetGapHash[k].from + 1; ++m) {
                       text += '-';
                   }
               }

               text += '-';
           }

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
            if(ic.queryresi2score === undefined) ic.queryresi2score = {};
            if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {};

            var nSeq = trackSeqArray.length;
            for(var resi in resi2cntSameRes) {
                var score = parseInt(resi2cntSameRes[resi] / nSeq * 100);
                ic.queryresi2score[chainid][resi] = score;
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

            ic.opts['color'] = 'align custom';
            ic.setColorByOptions(ic.opts, ic.hAtoms);

            me.updateHlAll();

            ic.draw();

            me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
       }
    });

    // BED file
    $(document).on('click', "#" + me.pre + "addtrack_button3", function(e) { var ic = me.icn3d;
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

                      var score, strand, thickStart, thickEnd, itemRgb, blockCount, blockSizes, blockStarts;

                      if(fieldArray.length > 4) score = fieldArray[4];
                      if(fieldArray.length > 5) strand = fieldArray[5]; // ., +, or -
                      if(fieldArray.length > 6) thickStart = fieldArray[6];
                      if(fieldArray.length > 7) thickEnd = fieldArray[7];
                      if(fieldArray.length > 8) itemRgb = fieldArray[8];
                      if(fieldArray.length > 9) blockCount = fieldArray[9];
                      if(fieldArray.length > 10) blockSizes = fieldArray[10];
                      if(fieldArray.length > 11) blockStarts = fieldArray[11];

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
    $(document).on('click', "#" + me.pre + "addtrack_button4", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();
       var title = $("#" + me.pre + "track_title").val();
       var text = $("#" + me.pre + "track_text").val(); // input simplifyText

       //me.showNewTrack(chainid, title, text);
       //me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);
       var result = me.getFullText(text);

       me.showNewTrack(chainid, title,  result.text, undefined, undefined, 'custom', undefined, undefined, result.fromArray, result.toArray);

       me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + text + " | type custom", true);
    });

    // current selection
    $(document).on('click', "#" + me.pre + "addtrack_button5", function(e) { var ic = me.icn3d;
       e.stopImmediatePropagation();
       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();
       var title = $("#" + me.pre + "track_selection").val();
       var text = '';

       var selectedAtoms = ic.intHash(ic.hAtoms, ic.chains[chainid]);

       var residueHash = ic.getResiduesFromCalphaAtoms(selectedAtoms);

       var cssColorArray = [];
       for(var i = 0, il = me.giSeq[chainid].length; i < il; ++i) {
          var cFull = me.giSeq[chainid][i];

          var c = cFull;
          if(cFull.length > 1) {
              //c = cFull[0] + '..';
              c = cFull[0]; // one letter for each residue
          }

          var pos = (i >= me.matchedPos[chainid] && i - me.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - me.matchedPos[chainid]].resi : me.baseResi[chainid] + 1 + i;

          if( residueHash.hasOwnProperty(chainid + '_' + pos) ) {
              var atom = ic.getFirstCalphaAtomObj(ic.residues[chainid + '_' + pos]);
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
