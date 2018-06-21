/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.addTrack = function() { var me = this;
    $(document).on('click', ".addtrack", function(e) {
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

iCn3DUI.prototype.simplifyText = function(text) { var me = this;
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
}

iCn3DUI.prototype.clickAddTrackButton = function() { var me = this;
    // ncbi gi
    $(document).on('click', "#" + me.pre + "addtrack_button1", function(e) {
       e.stopImmediatePropagation();

       //e.preventDefault();
       dialog.dialog( "close" );

       var chainid = $("#" + me.pre + "track_chainid").val();

       var gi = $("#" + me.pre + "track_gi").val().toUpperCase();
       var title = (isNaN(gi)) ? 'Acc ' + gi : 'gi ' + gi;

       //var text = $("#" + me.pre + "track_text").val();
       var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?fmt';
       $.ajax({
          url: url,
          type: 'POST',
          data : {'targets': chainid, 'queries': gi},
          dataType: 'jsonp',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              var query, target;

              if(data.data !== undefined) {
                  query = data.data[0].query;
                  target = data.data[0].targets[chainid];
              }

              var text = '';

              if(query !== undefined && query.to > 0 && target !== undefined) {
                  var queryStart = query.start;
                  var queryEnd = query.end;

                  var targetStart = target.start;
                  var targetEnd = target.end;

                  // two sequences are combined to determine the start and end
                  var offset = targetStart - queryStart;

                  var from = (targetStart < queryStart) ? query.from : query.from - offset;
                  var to = (targetStart < queryStart) ? query.to : query.to - offset;

                  var evalue = target.scores.e_value.toPrecision(2);
                  if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();
                  //if(evalue.length > 10) evalue = evalue.substr(0, 10);

                  var bitscore = target.scores.bit_score;

                  var seq = target.seqdata;
                  var querySeq = query.seqdata;

                  // the missing residuesatthe end ofthe seq will be filled up in the API showNewTrack()
                  for(var i = 0, il = seq.length; i < il && i <= to; ++i) {
                      if(i < from) {
                          text += '-';
                      }
                      else {
                          //text += seq[i];
                          text += querySeq[i + offset];
                      }
                  }

                  //title += ' (eval: ' + evalue + ')';
                  title += ', E: ' + evalue;
              }
              else {
                  text += "cannot be aligned";
              }

              me.showNewTrack(chainid, title, text);

              me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);
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
       var title = 'fasta ' + fasta.substr(0, 5);

       //var text = $("#" + me.pre + "track_text").val();
       var url = 'https://www.ncbi.nlm.nih.gov/Structure/pwaln/pwaln.fcgi?fmt';
       $.ajax({
          url: url,
          type: 'POST',
          data : {'targets': chainid, 'queries': fasta},
          dataType: 'jsonp',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              var query, target;

              if(data.data !== undefined) {
                  query = data.data[0].query;
                  target = data.data[0].targets[chainid];
              }

              var text = '';

              if(query !== undefined && query.to > 0 && target !== undefined) {
                  var queryStart = query.start;
                  var queryEnd = query.end;

                  var targetStart = target.start;
                  var targetEnd = target.end;

                  // two sequences are combined to determine the start and end
                  var offset = targetStart - queryStart;

                  var from = (targetStart < queryStart) ? query.from : query.from - offset;
                  var to = (targetStart < queryStart) ? query.to : query.to - offset;

                  var evalue = target.scores.e_value.toPrecision(2);
                  if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();
//                  if(evalue.length > 10) evalue = evalue.substr(0, 10);

                  var bitscore = target.scores.bit_score;

                  var seq = target.seqdata;
                  var querySeq = query.seqdata;

                  // the missing residuesatthe end ofthe seq will be filled up in the API showNewTrack()
                  for(var i = 0, il = seq.length; i < il && i <= to; ++i) {
                      if(i < from) {
                          text += '-';
                      }
                      else {
                          //text += seq[i];
                          text += querySeq[i + offset];
                      }
                  }

                  //title += ' (eval: ' + evalue + ')';
                  title += ', E: ' + evalue;
              }
              else {
                  text += "cannot be aligned";
              }

              me.showNewTrack(chainid, title, text);

              me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);
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

                   me.showNewTrack(chainid, title, text, cssColorArray);

                   me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);
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

       me.showNewTrack(chainid, title,  me.getFullText(text));
       me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + text, true);
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

       var residueHash = me.icn3d.getResiduesFromAtoms(selectedAtoms);

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
              var atom = me.icn3d.getFirstAtomObj(me.icn3d.residues[chainid + '_' + pos]);
              var color = atom.color.getHexString();

              text += c;
              cssColorArray.push('#' + color);
          }
          else {
              text += '-';
              cssColorArray.push('');
          }
       }

       me.showNewTrack(chainid, title, text, cssColorArray);

       me.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + me.simplifyText(text), true);
    });

};

iCn3DUI.prototype.showNewTrack = function(chnid, title, text, cssColorArray) {  var me = this;
    //if(me.customTracks[chnid] === undefined) {
    //    me.customTracks[chnid] = {};
    //}

    var bErrorMess = false;
    if(text == 'cannot be aligned') {
        bErrorMess = true;
    }

    var textForCnt = text.replace(/-/g, '');
    var resCnt = textForCnt.length;
    if(resCnt > me.giSeq[chnid].length) {
        resCnt = me.giSeq[chnid].length;
    }

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

    var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
    var htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';

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

    for(var i = 0, il = text.length; i < il; ++i) {
      var c = text.charAt(i);

      if(c != ' ' && c != '-') {
          //var pos = me.icn3d.chainsSeq[chnid][i - me.matchedPos[chnid] ].resi;
          var pos = me.icn3d.chainsSeq[chnid][i].resi - me.matchedPos[chnid];

          if(cssColorArray !== undefined && cssColorArray[i] != '') {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" style="color:' + cssColorArray[i] + '">' + c + '</span>';
          }
          else {
              html += '<span id="' + pre + '_' + me.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue">' + c + '</span>';
          }

          var emptyWidth = parseInt(me.seqAnnWidth * i / me.maxAnnoLength - prevEmptyWidth - prevLineWidth);
          if(emptyWidth < 0) emptyWidth = 0;

          html2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;"></div>';
          if(cssColorArray !== undefined && cssColorArray[i] != '') {
              html2 += '<div style="display:inline-block; background-color:' + cssColorArray[i] + '; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }
          else {
              html2 += '<div style="display:inline-block; background-color:#333; width:' + widthPerRes + 'px;" title="' + c + (i+1).toString() + '">&nbsp;</div>';
          }

          prevEmptyWidth += emptyWidth;
          prevLineWidth += widthPerRes;
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
    var htmlTmp = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Res</span>';
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

iCn3DUI.prototype.checkGiSeq = function (chainid, title, text, index) { var me = this;
    if(index > 20) return false;

    if(me.giSeq !== undefined && me.giSeq[chainid] !== undefined) {
        text = me.getFullText(text);
        me.showNewTrack(chainid, title, text);
        return false;
    }

    // wait for me.giSeq to be available
    setTimeout(function(){ me.checkGiSeq(chainid, title, text, index + 1); }, 100);
};

iCn3DUI.prototype.getFullText = function (text) { var me = this;
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

        out += rangeText;

        lastTextPos = end;
    }

    return out;
};
