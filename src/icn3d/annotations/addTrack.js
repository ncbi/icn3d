/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AddTrack {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    clickAddTrackButton() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        // ncbi gi/accession
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button1", "click", async function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();

           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();

           //var gi = $("#" + ic.pre + "track_gi").val().toUpperCase();
           let gi = $("#" + ic.pre + "track_gi").val();
           let title =(isNaN(gi)) ? 'Acc ' + gi : 'gi ' + gi;

           //var text = $("#" + ic.pre + "track_text").val();
           let url = me.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=track';

           let dataObj = {'targets': chainid, 'queries': gi};
           let data = await me.getAjaxPostPromise(url, dataObj);

           thisClass.alignSequenceToStructure(chainid, data, title);
        });

        // FASTA
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button2", "click", async function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();

           let fasta = $("#" + ic.pre + "track_fasta").val();
           //var title = 'fasta ' + fasta.substr(0, 5);
           let title = $("#" + ic.pre + "fasta_title").val();

           let structure = chainid.substr(0, chainid.indexOf('_'));
           let targets = chainid;
           if(structure.length == 5) { // e.g., 1TUP2
              targets = targets.substr(0,4);
           }
           else if(structure.length > 5) { // AlphaFold UniProt
              targets = '';
              for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
                targets += ic.chainsSeq[chainid][i].name;
              }
           }

           //var text = $("#" + ic.pre + "track_text").val();
           let url = me.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=track';
           let dataObj = {'targets': targets, 'queries': fasta};
           let data = await me.getAjaxPostPromise(url, dataObj);

           thisClass.alignSequenceToStructure(chainid, data, title);
        });

        // MSA 
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button2b", "click", async function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();
           let startpos = $("#" + ic.pre + "fasta_startpos").val();
           if(!startpos) startpos = 1;

           let colorseqby = $("#" + ic.pre + "colorseqby").val();
           let type =(colorseqby == 'identity') ? 'identity' : 'custom';

           let fastaList = $("#" + ic.pre + "track_fastaalign").val();

           if(fastaList) {
                await thisClass.addMsaTracks(chainid, startpos, type, fastaList);
            }
            else {
                /*
                let acclist = $("#" + ic.pre + "track_acclist").val().trim();

                acclist = acclist.replace(/\s+/g, ',');
                // remove version from acc
                let acclist = thisClass.processAccList(acclist);

                let structure = chainid.substr(0, chainid.indexOf('_'));
                let firstAcc;
                if(structure.length > 5) {
                     if(ic.uniprot2acc && ic.uniprot2acc[structure]) structure = ic.uniprot2acc[structure];
                     firstAcc = structure ;
                }
                else {
                    firstAcc = chainid;
                }

                let result;
                if(structure.length > 5) {
                    let chainSeq = '';
                    for(let i = 0, il = ic.chainsSeq.length; i < il; ++i) {
                        chainSeq += ic.chainsSeq[i].resn;
                    }
    
                    result = await thisClass.getMsa(acclist, firstAcc, chainSeq);
                }
                else {
                    result = await thisClass.getMsa(acclist, firstAcc);
                }
                
                trackTitleArray = result.trackTitleArray;
                trackSeqArray = result.trackSeqArray;
                seqFirst = result.seqFirst;

                await thisClass.showMsaTracks(chainid, seqFirst, trackTitleArray, trackSeqArray, startpos, type);
                */
            }
        });

        // Gene table
        me.myEventCls.onIds("#" + ic.pre + "exons_table", "click", async function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            //dialog.dialog( "close" );

            let geneid = $("#" + ic.pre + "track_geneid").val().trim();
            window.open('https://www.ncbi.nlm.nih.gov/gene/' + geneid + '?report=gene_table', '_blank');
        });

        // Isoform Alignment
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button2c", "click", async function(e) { let ic = thisClass.icn3d;
            e.stopImmediatePropagation();
            //e.preventDefault();
            dialog.dialog( "close" );

            let chainid = $("#" + ic.pre + "track_chainid").val();    
            let geneid = $("#" + ic.pre + "track_geneid").val();
            if(!geneid) {
                alert("Please fill in the Gene ID...");
                return;
            }

            let startpos = $("#" + ic.pre + "fasta_startpos2").val();
            if(!startpos) startpos = 1;

            //let colorseqby = $("#" + ic.pre + "colorseqby2").val();
            //let type =(colorseqby == 'identity') ? 'identity' : 'custom';

            let type = 'identity';
    
            await thisClass.addExonTracks(chainid, geneid, startpos, type);
        });

        // BED file
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button3", "click", function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();


           let file = $("#" + ic.pre + "track_bed")[0].files[0];

           if(!file) {
             alert("Please select a file...");
           }
           else {
             if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             let reader = new FileReader();
             reader.onload = function(e) {
               let dataStr = e.target.result; // or = reader.result;

               let lineArray = dataStr.split('\n');

               let bItemRgb = false, bColorByStrand = false;
               let strandRgbArray;
               for(let i = 0, il = lineArray.length; i < il; ++i) {
                   if(lineArray[i].substr(0, 7) == 'browser') continue;

                   if(lineArray[i].substr(0, 5) == 'track') {
                       if(lineArray[i].toLowerCase().indexOf('itemrgb') != -1) bItemRgb = true;
                       if(lineArray[i].toLowerCase().indexOf('colorbystrand=') != -1) {
                           bColorByStrand = true;

                           //e.g., colorByStrand="255,0,0 0,0,255"
                           let pos = lineArray[i].toLowerCase().indexOf('colorbystrand=');
                           let restStr = lineArray[i].substr(pos);
                           let quotePos = restStr.indexOf('"');
                           if(quotePos != -1) {
                             let quoteStr = restStr.substr(quotePos + 1);
                             let quotePos2 = quoteStr.indexOf('"');
                             if(quotePos != -1) {
                               let colorList = quoteStr.substr(0, quotePos2);
                               strandRgbArray = colorList.split(' ');
                             }
                           }

                       }
                   }
                   else { // tracks
                          if(lineArray[i] == '') continue;
                          let fieldArray = lineArray[i].replace(/\s+/g, ' ').split(' ');

                          if(fieldArray.length > 8 || fieldArray.length < 6) bColorByStrand = false;
                          if(fieldArray.length < 9) bItemRgb = false;

                          //https://genoic.ucsc.edu/FAQ/FAQformat.html#format1
                          let chromName = fieldArray[0];
                          let chromStart = fieldArray[1];
                          let chromEnd = fieldArray[2];
                          let trackName = fieldArray[3];

                          let score, strand, thickStart, thickEnd, itemRgb, blockCount, blockSizes, blockStarts;

                          if(fieldArray.length > 4) score = fieldArray[4];
                          if(fieldArray.length > 5) strand = fieldArray[5]; // ., +, or -
                          if(fieldArray.length > 6) thickStart = fieldArray[6];
                          if(fieldArray.length > 7) thickEnd = fieldArray[7];
                          if(fieldArray.length > 8) itemRgb = fieldArray[8];
                          if(fieldArray.length > 9) blockCount = fieldArray[9];
                          if(fieldArray.length > 10) blockSizes = fieldArray[10];
                          if(fieldArray.length > 11) blockStarts = fieldArray[11];

                       let title = trackName;

                       let rgbColor = '51,51,51';
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

                       let text = '';
                       let cssColorArray = [];
                       for(let j = 0, jl = chromEnd; j < jl; ++j) {
                           if(j < chromStart) {
                               text += '-';
                               cssColorArray.push('');
                           }
                           else {
                               text += ic.giSeq[chainid][j];
                               cssColorArray.push('rgb(' + rgbColor + ')');
                           }
                       }

                       thisClass.showNewTrack(chainid, title, text, cssColorArray, undefined, undefined, rgbColor);

                       me.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text) + " | type bed | color " + rgbColor, true);
                   }
               }
             };

             reader.readAsText(file);
           }
        });

        // custom
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button4", "click", function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();
           let title = $("#" + ic.pre + "track_title").val();
           let text = $("#" + ic.pre + "track_text").val(); // input simplifyText

           //this.showNewTrack(chainid, title, text);
           //me.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + this.simplifyText(text), true);
           let result = thisClass.getFullText(text);

           thisClass.showNewTrack(chainid, title,  result.text, undefined, undefined, 'custom', undefined, undefined, result.fromArray, result.toArray);

           me.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text) + " | type custom", true);
        });

        // current selection
        me.myEventCls.onIds("#" + ic.pre + "addtrack_button5", "click", function(e) { let ic = thisClass.icn3d;
           e.stopImmediatePropagation();
           //e.preventDefault();
           dialog.dialog( "close" );

           let chainid = $("#" + ic.pre + "track_chainid").val();
           let title = $("#" + ic.pre + "track_selection").val();
           let text = '';

           let selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chains[chainid]);

           let residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(selectedAtoms);

           let cssColorArray = [];
           for(let i = 0, il = ic.giSeq[chainid].length; i < il; ++i) {
              let cFull = ic.giSeq[chainid][i];

              let c = cFull;
              if(cFull.length > 1) {
                  //c = cFull[0] + '..';
                  c = cFull[0]; // one letter for each residue
              }

              //let pos =(i >= ic.matchedPos[chainid] && i - ic.matchedPos[chainid] < ic.chainsSeq[chainid].length) ? ic.chainsSeq[chainid][i - ic.matchedPos[chainid]].resi : ic.baseResi[chainid] + 1 + i;
              let pos = ic.ParserUtilsCls.getResi(chainid, i);

              if( residueHash.hasOwnProperty(chainid + '_' + pos) ) {
                  let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[chainid + '_' + pos]);
                  let colorStr =(atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
                  let color =(atom.color !== undefined) ? colorStr : "CCCCCC";

                  text += c;
                  cssColorArray.push('#' + color);
              }
              else {
                  text += '-';
                  cssColorArray.push('');
              }
           }

           thisClass.showNewTrack(chainid, title, text, cssColorArray, undefined, 'selection', undefined);

           me.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + thisClass.simplifyText(text) + " | type selection", true);
        });

    }

    showNewTrack(chnid, title, text, cssColorArray, inTarget2queryHash, type, color, bMsa, fromArray, toArray, seqStartLen, exonArray) {  let ic = this.icn3d, me = ic.icn3dui;
        //if(ic.customTracks[chnid] === undefined) {
        //    ic.customTracks[chnid] = {}
        //}

        let bErrorMess = false;
        if(text == 'cannot be aligned') {
            bErrorMess = true;
        }

        let textForCnt = text.replace(/-/g, '');
        let resCnt = textForCnt.length;
        //if(resCnt > ic.giSeq[chnid].length) {
        //    resCnt = ic.giSeq[chnid].length;
        //}

        if(!bMsa) {
            if(text.length > ic.giSeq[chnid].length) {
                text = text.substr(0, ic.giSeq[chnid].length);
            }
            else if(text.length < ic.giSeq[chnid].length && !bErrorMess) {
                // .fill is not supported in IE
                //var extra = Array(ic.giSeq[chnid].length - text.length).fill(' ').join('');
                let extra = '';
                for(let i = 0, il = ic.giSeq[chnid].length - text.length; i < il; ++i) {
                    extra += '-';
                }

                text += extra;
            }
        }

        let simpTitle = title.replace(/\s/g, '_').replace(/\./g, 'dot').replace(/\W/g, '');
        if(simpTitle.length > 20) simpTitle = simpTitle.substr(0, 20);

        //ic.customTracks[chnid][simpTitle] = text;

        let divLength = me.htmlCls.RESIDUE_WIDTH * text.length + 200;

        $("#" + ic.pre + "dt_custom_" + chnid).append("<div id='" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle).width(divLength);

        $("#" + ic.pre + "ov_custom_" + chnid).append("<div id='" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle).width(divLength);

        $("#" + ic.pre + "tt_custom_" + chnid).append("<div id='" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle + "'></div>");
        $("#" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle).width(divLength);

        let html = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        let htmlExon = html;
        let html2 = html;
        let html3 = html;
        let html3Exon = html;

        //var htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
        //var htmlTmp2 = '<div class="icn3d-seqTitle" gi="' + chnid + '" anno="sequence" chain="' + chnid + '"><span style="white-space:nowrap;">' + title + '</span></div>';
        let index = parseInt(Math.random()*10);
        let htmlTmp2 = '<div class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' +(index+1).toString() + '" from="' + fromArray + '" to="' + toArray + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' +(index+1).toString() + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + simpTitle + ' </div>';
        let htmlTmp2Exon = '<div class="icn3d-seqTitle" chain="' + chnid + '" title="Exons of ' + title + '">Exons </div>';

        let htmlTmp3 = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';

        html3 += htmlTmp2 + htmlTmp3 + '<br>';
        html3Exon += htmlTmp2Exon + htmlTmp3 + '<br>';

        let htmlTmp = '<span class="icn3d-seqLine">';

        html += htmlTmp2 + htmlTmp3 + htmlTmp;
        htmlExon += htmlTmp2Exon + htmlTmp3 + htmlTmp;
        html2 += htmlTmp2 + htmlTmp3 + htmlTmp;
        
        //var pre ='cst' + ic.customTracks[chnid].length;
        let posTmp = chnid.indexOf('_');
        //var pre ='cst' + chnid.substr(posTmp);
        let pre ='cst' + chnid.substr(posTmp + 1);

        let prevEmptyWidth = 0;
        let prevLineWidth = 0;
        let widthPerRes = 1;

        let bAlignColor =(type === undefined || type === 'seq' || type === 'custom') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

        let bIdentityColor =(type === 'identity') && text.indexOf('cannot-be-aligned') == -1 && text.indexOf('cannot be aligned') == -1 ? true : false;

        let parsedResn = {}
        let gapCnt = 0, currResi = 1;
        htmlTmp2 = '';

        // if(ic.seqStartLen && ic.seqStartLen[chnid]) html2 += ic.showSeqCls.insertMulGapOverview(chnid, ic.seqStartLen[chnid]);
        // if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqStartLen[chnid], '-');

        let pos2exonColor = {}, pos2genome = {}, pos2exonIndex = {};
        let cnt = 0;
        if(exonArray) {
            for(let j = 0, jl = exonArray.length; j < jl; ++j) {
                let start = exonArray[j].resStart, end = exonArray[j].resEnd;
                let genStart = parseInt(exonArray[j].genomeRange.split('-')[0]);

                for(let k = 0, kl = end - start + 1; k < kl; ++k) {
                    let colorStr = this.getExonColor(start, end, cnt);

                    pos2exonColor[cnt] = colorStr;
                    pos2genome[cnt] = (genStart + ic.exonOrder * k*3) + '-' + (genStart + ic.exonOrder * k*3 + ic.exonOrder * 2); // reverse order from large to small
                    pos2exonIndex[cnt] = j;

                    ++cnt;
                }
            }
        }

        cnt = 0;
        for(let i = 0, il = text.length; i < il; ++i) {
          let resNum = i - gapCnt - ((ic.seqStartLen && ic.seqStartLen[chnid]) ? ic.seqStartLen[chnid] : 0);

          if(!bMsa) {
              html += ic.showSeqCls.insertGap(chnid, i, '-');
          }
          else {
              if(ic.targetGapHash.hasOwnProperty(resNum) && !parsedResn.hasOwnProperty(resNum)) {
                  gapCnt += ic.targetGapHash[resNum].to - ic.targetGapHash[resNum].from + 1;

                  parsedResn[resNum] = 1;
              }
          }

          let c = text.charAt(i);

          if(c != ' ' && c != '-') {
              let resName =(ic.chainsSeq[chnid][resNum]) ? ic.chainsSeq[chnid][resNum].name : ' ';
              let colorHexStr = ic.showAnnoCls.getColorhexFromBlosum62(c, resName);
              let identityColorStr =(c == resName) ? 'FF0000' : '0000FF';

              //var pos =(resNum >= ic.matchedPos[chnid] && resNum - ic.matchedPos[chnid] < ic.chainsSeq[chnid].length) ? ic.chainsSeq[chnid][resNum - ic.matchedPos[chnid]].resi : ic.baseResi[chnid] + 1 + resNum;
              //   let pos = ic.baseResi[chnid] + currResi;
              let pos = ic.baseResi[chnid] + (i+1) - ((ic.seqStartLen && ic.seqStartLen[chnid]) ? ic.seqStartLen[chnid] : 0);

              if(inTarget2queryHash !== undefined) pos = ic.baseResi[chnid] + inTarget2queryHash[i] + 1; // 0-based

              let tmpStr;
              if(cssColorArray !== undefined && cssColorArray[i] != '') {
                  tmpStr = 'style="color:' + cssColorArray[i] + '"';
              }
              else if(color) {
                  tmpStr = 'style="color:rgb(' + color + ')"';
              }
              else if(bAlignColor || type == 'seq') {
                  tmpStr = 'style="color:#' + colorHexStr + '"';

                  if(type == 'seq') { // reset the color of atoms
                      for(let serial in ic.residues[chnid + '_' + pos]) {
                          let color2 = me.parasCls.thr("#" + colorHexStr);
                          ic.atoms[serial].color = color2;
                          ic.atomPrevColors[serial] = color2;
                      }
                  }
              }
              else if(bIdentityColor) {
                  tmpStr = 'style="color:#' + identityColorStr + '"';
              }
              else {
                  tmpStr = '';
              }

              html += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + '" class="icn3d-residue" ' + tmpStr + '>' + c + '</span>';

              let tmpStrExon = 'style="background-color:' + pos2exonColor[cnt] + '"';
              htmlExon += '<span id="' + pre + '_' + ic.pre + chnid + '_' + pos + '" title="' + c + pos + ', Exon ' + (pos2exonIndex[cnt] + 1) + ': ' + pos2genome[cnt] + '" class="icn3d-residue" ' + tmpStrExon + '>&nbsp;</span>';

              // set atom color
              for(let serial in ic.residues[chnid + '_' + pos]) {
                let atom = ic.atoms[serial];
                atom.color = me.parasCls.thr(pos2exonColor[cnt]);
                ic.atomPrevColors[serial] = atom.color;
              }

              htmlTmp2 += ic.showSeqCls.insertGapOverview(chnid, i);

            //   let emptyWidth =(me.cfg.blast_rep_id == chnid) ? Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth) : Math.round(ic.seqAnnWidth * i / ic.maxAnnoLength - prevEmptyWidth - prevLineWidth);
              let emptyWidth = Math.round(ic.seqAnnWidth * i /(ic.maxAnnoLength + ic.nTotalGap) - prevEmptyWidth - prevLineWidth);
              if(emptyWidth < 0) emptyWidth = 0;

              htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';
              if(cssColorArray !== undefined && cssColorArray[i] != '') {
                  tmpStr = cssColorArray[i];
              }
              else if(color) {
                  tmpStr = 'rgb(' + color + ')';
              }
              else if(bAlignColor) {
                  tmpStr = '#' + colorHexStr;
              }
              else {
                  tmpStr = '#333';
              }

              htmlTmp2 += '<div style="display:inline-block; background-color:' + tmpStr + '; width:' + widthPerRes + 'px;" title="' + c +(i+1).toString() + '">&nbsp;</div>';

              prevEmptyWidth += emptyWidth;
              prevLineWidth += widthPerRes;

              ++currResi;
              ++cnt;
          }
          else {
              if(bErrorMess) {
                html += '<span>' + c + '</span>';
              }
              else {
                html += '<span>-</span>';
                htmlExon += '<span></span>';
              }
          }
        }

        // if(ic.seqStartLen && ic.seqStartLen[chnid]) html += ic.showSeqCls.insertMulGap(ic.seqEndLen[chnid], '-');

        if(fromArray !== undefined) {
            htmlTmp2 = '';
            let fromArray2 = [], toArray2 = [];
            for(let i = 0, il = fromArray.length; i < il; ++i) {
                fromArray2.push(fromArray[i]);

                for(let j = parseInt(fromArray[i]); j <= parseInt(toArray[i]); ++j) {
                    if(ic.targetGapHash !== undefined && ic.targetGapHash.hasOwnProperty(j)) {
                        toArray2.push(j - 1);
                        fromArray2.push(j);
                    }
                }

                toArray2.push(toArray[i]);
            }

            ic.nTotalGap = 0;
            for(let i in ic.targetGapHash) {
                ic.nTotalGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
            }

            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chnid]);
            let colorStr =(atom.color === undefined || atom.color.getHexString() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
            let color =(atom.color !== undefined) ? colorStr : "CCCCCC";

            let cnt, prevCntTotal = 0;
            for(let i = 0, il = fromArray2.length; i < il; ++i) {
                htmlTmp2 += ic.showSeqCls.insertGapOverview(chnid, fromArray2[i]);

                let initialPos = (seqStartLen) ? fromArray2[i] : fromArray2[i] - ic.baseResi[chnid] - 1;

                let emptyWidth =(i == 0) ? Math.round(ic.seqAnnWidth * initialPos /(ic.maxAnnoLength + ic.nTotalGap)) : Math.round(ic.seqAnnWidth *(fromArray2[i] - toArray2[i-1] - 1) /(ic.maxAnnoLength + ic.nTotalGap));
                if(emptyWidth < 0) emptyWidth = 0;

                htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';

                if(!exonArray) {
                    htmlTmp2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' +(index+1).toString() + '" id="' + chnid + '_custom_' + index + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + title + '</div>';
                }
                else {
                    // determine how this range sits in the exon ranges in exonArray
                    let startExon, endExon, bStart = false, bEnd = false;
                    
                    cnt = toArray[i] - fromArray[i] + 1;
                    let from = prevCntTotal, to = prevCntTotal + cnt - 1;

                    prevCntTotal += cnt;

                    // fromArray2 was adjusted with gaps, no gaps in this case
                    // let offset = fromArray2[i] - fromArray[i];
                    // let emptyWidth = Math.round(ic.seqAnnWidth * offset /(ic.maxAnnoLength + ic.nTotalGap));
                    // htmlTmp2 += '<div style="display:inline-block; width:' + emptyWidth + 'px;">&nbsp;</div>';

                    for(let j = 0, jl = exonArray.length; j < jl; ++j) {
                        let start = exonArray[j].resStart, end = exonArray[j].resEnd;

                        if(from >= start && from <= end) {
                            startExon = {exonIndex: j, rangeStart: start, rangeEnd: end, from: from, genomeRange: exonArray[j].genomeRange};
                        }

                        if(to >= start && to <= end) {
                            endExon = {exonIndex: j, rangeStart: start, rangeEnd: end, to: to, genomeRange: exonArray[j].genomeRange};
                        }
                    }

                    let startColorStr, endColorStr, colorGradient;
                    if(startExon && endExon && startExon.exonIndex == endExon.exonIndex) { // 
                        startColorStr = this.getExonColor(startExon.rangeStart, startExon.rangeEnd, from);
                        endColorStr = this.getExonColor(startExon.rangeStart, startExon.rangeEnd, to);

                        colorGradient = startColorStr + ' 0%, #FFF 50%, ' + endColorStr + ' 100%';
                        htmlTmp2 += this.getExonHtml(startExon.exonIndex, colorGradient, startExon.from, endExon.to, startExon.genomeRange, chnid, simpTitle);
                    }
                    else {
                        if(startExon) {
                            startColorStr = this.getExonColor(startExon.rangeStart, startExon.rangeEnd, from);

                            colorGradient = startColorStr + ' 0%, #FFF 50%, #00F 100%';
                            htmlTmp2 += this.getExonHtml(startExon.exonIndex, colorGradient, startExon.from, startExon.rangeEnd, startExon.genomeRange, chnid, simpTitle);
                        }

                        if(startExon && endExon) {
                            for(let j = startExon.exonIndex + 1; j < endExon.exonIndex; ++j) {
                                colorGradient = '#F00 0%, #FFF 50%, #00F 100%';
                                htmlTmp2 += this.getExonHtml(j, colorGradient, exonArray[j].resStart, exonArray[j].resEnd, exonArray[j].genomeRange, chnid, simpTitle);
                            }

                            endColorStr = this.getExonColor(endExon.rangeStart, endExon.rangeEnd, to);

                            colorGradient = '#F00 0%, #FFF 50%, ' + endColorStr + ' 100%';
                            htmlTmp2 += this.getExonHtml(endExon.exonIndex, colorGradient, endExon.rangeStart, endExon.to, endExon.genomeRange, chnid, simpTitle);
                        }
                    }

                    //htmlTmp2 += '<div style="display:inline-block; color:white!important; font-weight:bold; background-color:#' + color + '; width:' + Math.round(ic.seqAnnWidth *(toArray2[i] - fromArray2[i] + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" custom="' +(index+1).toString() + '" from="' + fromArray2 + '" to="' + toArray2 + '" shorttitle="' + simpTitle + '" index="' + index + '" setname="' + chnid + '_custom_' +(index+1).toString() + '" id="' + chnid + '_custom_' + index + '" anno="sequence" chain="' + chnid + '" title="' + title + '">' + title + '</div>';
                }
            }
        }

        htmlTmp = '<span class="icn3d-residueNum" title="residue count">' + resCnt.toString() + ' Pos</span>';
        htmlTmp += '</span>';
        htmlTmp += '<br>';

        htmlTmp += '</div>';

        html += htmlTmp;
        html2 += htmlTmp2 + htmlTmp;
        htmlExon += htmlTmp;

        html3 += '</div>';
        html3Exon += '</div>';

        if(!exonArray) {
            $("#" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle).html(html);
            $("#" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle).html(html2);
            $("#" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle).html(html3);
        }
        else {
            $("#" + ic.pre + "dt_custom_" + chnid + "_" + simpTitle).html(htmlExon + html);
            $("#" + ic.pre + "ov_custom_" + chnid + "_" + simpTitle).html(html2);
            $("#" + ic.pre + "tt_custom_" + chnid + "_" + simpTitle).html(html3Exon + html3);      
        }
    }

    getExonHtml(exonIndex, colorGradient, from, to, genomeRange, chainid, simpTitle) { let ic = this.icn3d, me = ic.icn3dui;
        return '<div style="display:inline-block; color:white!important; width:' + Math.round(ic.seqAnnWidth *(to - from + 1) /(ic.maxAnnoLength + ic.nTotalGap)) + 'px;" class="icn3d-seqTitle icn3d-link icn3d-blue" domain="' + (exonIndex + 1) + '" from="' + from + '" to="' + to + '" setname="' + simpTitle + ', Exon ' + (exonIndex + 1) + '" title="Exon ' + (exonIndex + 1) + ': ' + genomeRange + ' genomic interval" anno="sequence" chain="' + chainid + '"><div style="height: 12px; border: 1px solid #000; background: linear-gradient(to right, ' + colorGradient + ');"></div></div>';
    }

    getExonColor(start, end, pos) { let ic = this.icn3d, me = ic.icn3dui;
        let middle = ( start + end) * 0.5;
        if(pos < middle) {
            let gb = parseInt((pos - start) / (middle - start) * 255);
            return "rgb(255, " + gb + ", " + gb + ")";
        }
        else {
            let rg = parseInt((end - pos) / (end - middle) * 255);
            return "rgb(" + rg + ", " + rg + ", 255)";
        }
    }

    alignSequenceToStructure(chainid, data, title) { let ic = this.icn3d, me = ic.icn3dui;
      let query, target, firstKey;

      if(data.data !== undefined) {
          query = data.data[0].query;
          //target = data.data[0].targets[chainid.replace(/_/g, '')];
          //target = data.data[0].targets[chainid];
          firstKey = Object.keys(data.data[0].targets)[0];
          target = data.data[0].targets[firstKey];

          target = target.hsps[0];
      }

      let text = '';

      let cssColorArray = [];
      let target2queryHash = {}
      if(query !== undefined && target !== undefined) {
          let evalue = target.scores.e_value.toPrecision(2);
          if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();

          let bitscore = target.scores.bit_score;

          //var targetSeq = data.targets[chainid.replace(/_/g, '')].seqdata;
          //let targetSeq = data.targets[chainid].seqdata;
          let targetSeq = data.targets[firstKey].seqdata;
          let querySeq = query.seqdata;

          let segArray = target.segs;
          for(let i = 0, il = segArray.length; i < il; ++i) {
              let seg = segArray[i];
              for(let j = 0; j <= seg.orito - seg.orifrom; ++j) {
                  target2queryHash[j + seg.orifrom] = j + seg.from;
              }
          }

          // the missing residues at the end of the seq will be filled up in the API showNewTrack()
          for(let i = 0, il = targetSeq.length; i < il; ++i) {
              if(target2queryHash.hasOwnProperty(i)) {
                  text += querySeq[target2queryHash[i]];

                  let colorHexStr = ic.showAnnoCls.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
                  cssColorArray.push("#" + colorHexStr);

                //   let resi =  ic.baseResi[chainid] + 1 + i; //i + 1;
                  let resi =  ic.ParserUtilsCls.getResi(chainid, i);
                  for(let serial in ic.residues[chainid + '_' + resi]) {
                      let color = me.parasCls.thr("#" + colorHexStr);
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

      this.showNewTrack(chainid, title, text, cssColorArray, target2queryHash, 'seq');

      ic.hlUpdateCls.updateHlAll();
      ic.drawCls.draw();

      me.htmlCls.clickMenuCls.setLogCmd("add track | chainid " + chainid + " | title " + title + " | text " + this.simplifyText(text) + " | type seq", true);
    }

    defineSecondary(chainid, type) { let ic = this.icn3d, me = ic.icn3dui;
        if(!$('#' + ic.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + ic.pre + 'dl_definedsets').dialog( 'isOpen' )) {
            me.htmlCls.dialogCls.openDlg('dl_definedsets', 'Select sets');
            $("#" + ic.pre + "atomsCustom").resizable();
        }

        let selectedResidues = {};
        let bUnion = false, bUpdateHighlight = true;

        // order of secondary structures
        let index = 1;

        let helixCnt = 0, sheetCnt = 0, bFirstSS = true;
        let zero = '0';
        //var prevName = chainid + zero + index + '_L(N', currName, setName;
        let prevName = chainid + '_C(Nterm', currName, setName;

        // clear selection
        ic.hAtoms = {};

        for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
          let currResi = ic.chainsSeq[chainid][i].resi;

          // name of secondary structures
          let residueid = chainid + '_' + currResi;

          if( ic.residues.hasOwnProperty(residueid) ) {
            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
            let currSS = ic.secondaries[residueid];

            if(currSS == 'H') {
                if(atom.ssbegin) {
                    ++helixCnt;

                    if(Object.keys(selectedResidues).length > 0) {
                        setName = currName + 'H' + helixCnt.toString().padStart(2, '0') + ')';
                        if(type == 'coil') {
                            ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                            if(!bUnion) bUnion = true;
                        }
                        selectedResidues = {}
                        ++index;
                    }
                }

                //zero =(index < 10) ? '0' : '';
                //currName = chainid + zero + index + '_H' + helixCnt;
                currName = chainid + '_H' + helixCnt.toString().padStart(2, '0');
                selectedResidues[residueid] = 1;

                if(atom.ssend) {
                    //zero =(index < 9) ? '0' : '';
                    //prevName = chainid + zero +(index+1) + '_L(H' + helixCnt;
                    prevName = chainid + '_C(H' + helixCnt.toString().padStart(2, '0');
                    if(type == 'helix') {
                        ic.selectionCls.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {}
                    ++index;
                }
            }
            else if(currSS == 'E') {
                if(atom.ssbegin) {
                    ++sheetCnt;

                    if(Object.keys(selectedResidues).length > 0) {
                        setName = currName + 'S' + sheetCnt.toString().padStart(2, '0') + ')';
                        if(type == 'coil') {
                            ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                            if(!bUnion) bUnion = true;
                        }
                        selectedResidues = {}
                        ++index;
                    }
                }

                //zero =(index < 10) ? '0' : '';
                //currName = chainid + zero + index + '_S' + sheetCnt;
                currName = chainid + '_S' + sheetCnt.toString().padStart(2, '0');
                selectedResidues[residueid] = 1;

                if(atom.ssend) {
                    //zero =(index < 9) ? '0' : '';
                    //prevName = chainid + zero +(index+1) + '_L(S' + sheetCnt;
                    prevName = chainid + '_C(S' + sheetCnt.toString().padStart(2, '0');
                    if(type == 'sheet') {
                        ic.selectionCls.selectResidueList(selectedResidues, currName, currName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    selectedResidues = {}
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
                ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
            }
        }
    }

    // type: igstrand, igloop
    defineIgstrand(chainid, type) { let ic = this.icn3d, me = ic.icn3dui;       
        if(!$('#' + ic.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + ic.pre + 'dl_definedsets').dialog( 'isOpen' )) {
            me.htmlCls.dialogCls.openDlg('dl_definedsets', 'Select sets');
            $("#" + ic.pre + "atomsCustom").resizable();
        }

        let selectedResidues = {};
        let bUnion = false, bUpdateHighlight = true;

        let strandCnt = 0, loopCnt = 0;
        let setName, currStrand, prevStrand, prevStrandReal = 'NT', currType, prevType;

        // clear selection
        ic.hAtoms = {};

        let bStart = false;

        for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
            let currResi = ic.chainsSeq[chainid][i].resi;
            let resid = chainid + '_' + currResi;

            if(!ic.residues.hasOwnProperty(resid) ) continue;
          
            let refnumLabel, refnumStr, refnum;
            refnumLabel = ic.resid2refnum[resid];
            if(!refnumLabel) continue;

            refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
            currStrand = refnumLabel.replace(refnumStr, '');
            refnum = parseInt(refnumStr);

            if(ic.residIgLoop.hasOwnProperty(resid)) {
                currType = 'igloop';
            }
            else {
                currType = 'igstrand';
            }

            if(bStart && currType != prevType && Object.keys(selectedResidues).length > 0) {
                if(prevType == 'igstrand') {
                    ++strandCnt;
                    setName = 'Strand-' + prevStrand + '-' + chainid + '-' + strandCnt.toString().padStart(3, '0');
                    setName = setName.replace(/'/g, '`');
                    if(type == 'igstrand') {
                        ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                    prevStrandReal = prevStrand;
                }
                else if(prevType == 'igloop') {
                    ++loopCnt;
                    setName = 'Loop-' + prevStrandReal + '_' + currStrand + '-' + chainid + '-' + loopCnt.toString().padStart(3, '0');
                    setName = setName.replace(/'/g, '`');
                    if(type == 'igloop') {
                        ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
                        if(!bUnion) bUnion = true;
                    }
                }

                selectedResidues = {};
            }

            selectedResidues[resid] = 1;

            prevStrand = currStrand;
            prevType = currType;

            bStart = true;
        } // for loop

        if(prevType == 'igstrand') {
            ++strandCnt;
            setName = 'Strand-' + prevStrand + '-' + chainid + '-' + strandCnt.toString().padStart(3, '0');
            setName = setName.replace(/'/g, '`');
            if(type == 'igstrand') ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
        }
        else if(prevType == 'igloop') {
            ++loopCnt;
            currStrand = 'CT';
            setName = 'Loop-' + prevStrandReal + '_' + currStrand + '-' + chainid + '-' + loopCnt.toString().padStart(3, '0');
            setName = setName.replace(/'/g, '`');
            if(type == 'igloop') ic.selectionCls.selectResidueList(selectedResidues, setName, setName, bUnion, bUpdateHighlight);
        }
    }

    simplifyText(text) { let ic = this.icn3d, me = ic.icn3dui;
        let out = ''; // 1-based text positions
        let bFoundText = false;

        // replace 'undefined' to space
        text = text.replace(/undefined/g, ' ');

        let i, il, prevEmptyPos = -1;
        for(i = 0, il = text.length; i < il; ++i) {
            if(text[i] == '-' || text[i] == ' ') {
                if(bFoundText && i !== prevEmptyPos) {
                    if(prevEmptyPos+1 == i-1) {
                        out +=(prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
                   }
                    else {
                        out +=(prevEmptyPos+1 + 1).toString() + '-' +(i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
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
                out +=(prevEmptyPos+1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
            }
            else {
                out +=(prevEmptyPos+1 + 1).toString() + '-' +(i-1 + 1).toString() + ' ' + text.substr(prevEmptyPos+1, i - 1 - prevEmptyPos) + ', ';
            }
        }

        return out;
    }

    checkGiSeq(chainid, title, text, type, color, bMsa, index) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(index > 20) return false;

        if(ic.giSeq !== undefined && ic.giSeq[chainid] !== undefined) {
            let result = this.getFullText(text);
            text = result.text;
            this.showNewTrack(chainid, title, text, undefined, undefined, type, color, bMsa);

            return false;
        }

        // wait for ic.giSeq to be available
        setTimeout(function(){ thisClass.checkGiSeq(chainid, title, text, type, color, bMsa, index + 1); }, 100);
    }

    getFullText(text) { let ic = this.icn3d, me = ic.icn3dui;
        let out = '', fromArray = [], toArray = [];

        let textArray = text.split(',');
        let lastTextPos = -1;
        for(let i = 0, il = textArray.length; i < il; ++i) {
            let eachText = textArray[i].trim();
            if(eachText.length == 0) continue;

            let range_text = eachText.split(' ');
            if(range_text.length !== 2) continue;

            let rangeText = range_text[1];
            let start_end = range_text[0].split('-');

            let start, end;
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
            for(let j = 0; j < start - lastTextPos - 1; ++j) {
                out += '-';
            }

            let range = end - start + 1;

            if(rangeText.length > range) {
                 out += rangeText.substr(0, range);
            }
            else {
                 out += rangeText;
            }

            // fill up rangeText
            for(let j = 0; j < range - rangeText.length; ++j) {
                out += '-';
            }

            lastTextPos = end;
        }

        return {"text": out, "fromArray": fromArray, "toArray": toArray}
    }

    setCustomFile(type, startColor, midColor, endColor) {var ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let chainid = $("#" + ic.pre + "customcolor_chainid").val();
       let file = $("#" + ic.pre + "cstcolorfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         let reader = new FileReader();
         reader.onload = function(e) { let ic = thisClass.icn3d;
            let dataStr = e.target.result; // or = reader.result;
            let lineArray = dataStr.split('\n');
            if(ic.queryresi2score === undefined) ic.queryresi2score = {}
            //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {}
            ic.queryresi2score[chainid] = {}
            for(let i = 0, il = lineArray.length; i < il; ++i) {
                if(lineArray[i].trim() !== '') {
                    let columnArray = lineArray[i].split(/\s+/);
                    ic.queryresi2score[chainid][columnArray[0]] = columnArray[1];
                }
            }
            let resiArray = Object.keys(ic.queryresi2score[chainid]);
            let start = Math.min.apply(null, resiArray);
            let end = Math.max.apply(null, resiArray);
            let resiScoreStr = '';
            for(let resi = start; resi <= end; ++resi) {
                if(ic.queryresi2score[chainid].hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(ic.queryresi2score[chainid][resi]/11); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }

            if(type == 'color') {
                ic.opts['color'] = 'align custom';

                ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
                ic.hlUpdateCls.updateHlAll();
                me.htmlCls.clickMenuCls.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr + ' | colorrange ' + startColor + ' ' + midColor + ' ' + endColor, true);

                let legendHtml = me.htmlCls.clickMenuCls.setLegendHtml();

                //$("#" + me.pre + "legend").html(legendHtml);
                $("#" + me.pre + "dl_legend_html").html(legendHtml);
                me.htmlCls.dialogCls.openDlg('dl_legend', 'Color range');
            }
            else if(type == 'tube') {
                ic.setOptionCls.setStyle('proteins', 'custom tube');
                me.htmlCls.clickMenuCls.setLogCmd('color tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }
            ic.drawCls.draw();
         }
         reader.readAsText(file);
       }
    }

    async getMsa(acclist, firstAcc, chainSeq) { let ic = this.icn3d, me = ic.icn3dui;
        let trackTitleArray = [firstAcc], trackSeqArray = [];
        // get all seq
        let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + acclist;
        let data = await me.getAjaxPromise(url, 'jsonp');
        let maxLen = 0, maxIndex = 0, index = 0;
        //let seqArray = [];
        for(let acc in data) {
            let seq = data[acc];
            //seqArray.push(seq);

            let pos = acc.indexOf('.');
            if(pos != -1) {
                acc = acc.substr(0, pos)
            }
            trackTitleArray.push(acc);

            if(seq.length > maxLen) {
                maxLen = seq.length;
                maxIndex = index;
            }
            ++index;
        }
        
        // pairwise align each seq to the one with maxIndex
        url = me.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=msa';

        let accArray = acclist.split(',');
        // oroginal index, chain as the first one
        let acc2index = {};
        acc2index[firstAcc] = 0;
        for(let i = 0, il = accArray.length; i < il; ++i) {
            acc2index[accArray[i]] = i + 1;
        }
        let targetId = accArray[maxIndex];
        accArray.splice(maxIndex, 1);

        let queries = (chainSeq) ? chainSeq : firstAcc;
        if(accArray.length > 0) queries += ',' + accArray.join(',');

        let dataObj = {'targets': targetId, 'queries': queries};
        let alignData = await me.getAjaxPostPromise(url, dataObj);

        if(!alignData.data) {
            console.log("The protein accessions " + targetId + "," + queries + " can not be aligned...");
            return;
        }

        // get aligned length for each pair
        let index_alignLen = [];
        ic.qt_start_end = {};
        // target: targetId
        // queries: accArray
        let accArrayFound = [], querySeqArray = [];
        let firstKey = Object.keys(alignData.targets)[0];
        let targetSeq = alignData.targets[firstKey].seqdata;

        //add firstAcc to accArray
        accArray.splice(0, 0, firstAcc);
        
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) {
            let query, target;

            if(!alignData.data[index]) {
                continue;
            }
        
            query = alignData.data[index].query;
            let acc;
            if(query.acc.length <= 5) { // PDB
                acc = query.acc.substr(0, 4) + '_' + query.acc.substr(4, 1);
            }
            else {
                acc = query.acc;
            }

            if(index == 0) acc = firstAcc;

            accArrayFound.push(acc);

            firstKey = Object.keys(alignData.data[index].targets)[0];
            target = alignData.data[index].targets[firstKey];

            target = target.hsps[0];

            querySeqArray.push(query.seqdata);
            let alignLen = target.scores.num_ident * 100 + query.sz; // order by aligned seq length, then seq length

            ic.qt_start_end[index] = [];

            let segArray = target.segs;
            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                let qt_start_end = {t_start: seg.orifrom, t_end: seg.orito, q_start: seg.from, q_end: seg.to};
                ic.qt_start_end[index].push(qt_start_end);
            }

            index_alignLen.push({index: index, alignLen: alignLen});
        }

        accArray = accArrayFound;

        index_alignLen.sort(function(a,b){
            return b.alignLen - a.alignLen;
        });

        // start and end of MSA
        let start_t = 9999, end_t = -1;
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) { 
            if(!ic.qt_start_end[index]) continue;

            for(let i = 0, il = ic.qt_start_end[index].length; i < il; ++i) {
                let start1, end1;
                
                start1 = ic.qt_start_end[index][i].t_start;
                end1 = ic.qt_start_end[index][i].t_end;

                for(let j = start1; j <= end1; ++j) {
                    if(j < start_t) start_t = j;
                    if(j > end_t) end_t = j;
                }
            }
        }

        // N- and C-terminal residues
        let maxNtermLen = start_t, maxCtermLen = targetSeq.length - (end_t + 1);
        let startArray = [], endArray = [];
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) { 
            if(!ic.qt_start_end[index]) continue;

            let qPos = ic.qt_start_end[index][0].q_start;
            startArray.push(qPos);
            if(maxNtermLen < qPos) maxNtermLen = qPos;

            let lastIndex = ic.qt_start_end[index].length - 1;
            qPos = ic.qt_start_end[index][lastIndex].q_end;
            endArray.push(qPos);
            let dist = querySeqArray[index].length - (qPos + 1);
            if(maxCtermLen < dist) maxCtermLen = dist;
        }

        ic.msaSeq = {};
        // assign the template
        ic.msaSeq[targetId] = '';
        
        for(let i = start_t; i <= end_t; ++i) {
            ic.msaSeq[targetId] += targetSeq[i];           
        }    

        // progressively merge sequences, starting from most similar to least similar
        let alignedChainIndice = [0];
        for(let arrayIndex = 0, arrayIndexl = index_alignLen.length; arrayIndex < arrayIndexl; ++arrayIndex) { 
            let index = index_alignLen[arrayIndex].index;
            alignedChainIndice.push(index);

            ic.msaSeq[accArray[index]] = '';

            // some proteins may not be aligned
            if(!querySeqArray[index]) continue;

            ic.setSeqAlignCls.mergeTwoSeqForAllSimple(targetId, accArray, index, alignedChainIndice, start_t, end_t, querySeqArray);
        }  

        // add N-terminal seq
        let seqN = '', cnt;
        for(let i = 0; i < maxNtermLen - start_t; ++i) {
            seqN += '-';
        }
        for(let i = 0; i < start_t; ++i) {
            seqN += targetSeq[i];
        }
        ic.msaSeq[targetId] = seqN + ic.msaSeq[targetId];

        for(let index = 0, indexl = accArray.length; index < indexl; ++index) { 
            seqN = '';
            for(let i = 0; i < maxNtermLen - startArray[index]; ++i) {
                seqN += '-';
            }
            for(let i = 0; i < startArray[index]; ++i) {
                seqN += querySeqArray[index][i];
            }

            ic.msaSeq[accArray[index]] = seqN + ic.msaSeq[accArray[index]];
        }

        // add C-terminal seq
        for(let i = end_t + 1; i < targetSeq.length; ++i) {
            ic.msaSeq[targetId] += targetSeq[i];
        }

        cnt = targetSeq.length - (end_t + 1);
        for(let i = 0; i < maxCtermLen - cnt; ++i) {
            ic.msaSeq[targetId] += '-';
        }

        for(let index = 0, indexl = accArray.length; index < indexl; ++index) {
            for(let i = endArray[index] + 1; i < querySeqArray[index].length; ++i) {
                ic.msaSeq[accArray[index]] += querySeqArray[index][i];
            }

            cnt = querySeqArray[index].length - (endArray[index] + 1);
            for(let i = 0; i < maxCtermLen - cnt; ++i) {
                ic.msaSeq[accArray[index]] += '-';
            }
        }

        for(let acc in ic.msaSeq) {
            let index = acc2index[acc];
            trackSeqArray[index] = ic.msaSeq[acc];
            trackTitleArray[index] = acc;
        }

        // some of the protein may not be aligned
        let trackTitleArrayFinal = [], trackSeqArrayFinal = [];
        for(let i = 0, il = trackSeqArray.length; i < il; ++i) {
            if(trackSeqArray[i]) {
                trackSeqArrayFinal.push(trackSeqArray[i]);
                trackTitleArrayFinal.push(trackTitleArray[i]);
            }
        }

        let seqFirst = trackSeqArrayFinal[0];

        trackSeqArrayFinal.splice(0, 1);
        trackTitleArrayFinal.splice(0, 1);

        return {trackTitleArray: trackTitleArrayFinal, trackSeqArray: trackSeqArrayFinal, seqFirst: seqFirst};
    }

    async getIsoformMsa(acclist, acc2exons) { let ic = this.icn3d, me = ic.icn3dui;
        let trackTitleArray = [], trackSeqArray = [];
        // get all seq
        let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + acclist;
        let data = await me.getAjaxPromise(url, 'jsonp');
        let maxLen = 0, maxIndex = 0, index = 0;
        let accArray = [], querySeqArray = [];
        for(let acc in data) {
            let seq = data[acc];
            querySeqArray.push(seq);

            let pos = acc.indexOf('.');
            if(pos != -1) {
                acc = acc.substr(0, pos)
            }
            accArray.push(acc);

            if(seq.length > maxLen) {
                maxLen = seq.length;
                maxIndex = index;
            }
            ++index;
        }

        // get aligned length for each pair
        ic.qt_start_end = {};

        // use the genomic interval as the alignment template
        let targetId = 'genomeRes';

        let acc2index = {};
        
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) {
            let acc = accArray[index];

            acc2index[acc] = index;

            ic.qt_start_end[index] = [];

            let segArray = acc2exons[acc];     

            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                
                // mRNA has the reverse order, use negative to make the order right, then minus the offset
                let qt_start_end = {t_start: ic.exonOrder * seg.genResStart, t_end: ic.exonOrder * seg.genResEnd, q_start: seg.resStart, q_end: seg.resEnd};
                ic.qt_start_end[index].push(qt_start_end);
            }
        }

        // start and end of MSA
        let start_t = 999999999, end_t = -999999999;
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) { 
            if(!ic.qt_start_end[index]) continue;

            for(let i = 0, il = ic.qt_start_end[index].length; i < il; ++i) {
                let start1, end1;
                
                start1 = ic.qt_start_end[index][i].t_start;
                end1 = ic.qt_start_end[index][i].t_end;

                for(let j = start1; j <= end1; ++j) {
                    if(j < start_t) start_t = j;
                    if(j > end_t) end_t = j;
                }
            }
        }

        // minus the offset start_t
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) {
            let segArray = ic.qt_start_end[index];
            for(let i = 0, il = segArray.length; i < il; ++i) {
                let seg = segArray[i];
                seg.t_start -= start_t;
                seg.t_end -= start_t;
            }
        }

        ic.msaSeq = {};
        // assign the template
        ic.msaSeq[targetId] = '';

        let start_tFinal = 0;
        let end_tFinal = end_t - start_t;

        for(let i = start_tFinal; i <= end_tFinal; ++i) {
            ic.msaSeq[targetId] += 'X';   // fake seq        
        }    

        // progressively merge sequences, starting from most similar to least similar
        let alignedChainIndice = [0];
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) { 
            alignedChainIndice.push(index);

            ic.msaSeq[accArray[index]] = '';

            // some proteins may not be aligned
            if(!querySeqArray[index]) continue;

            let maxNtermLen = 0;
            ic.setSeqAlignCls.mergeTwoSeqForAllSimple(targetId, accArray, index, alignedChainIndice, start_tFinal, end_tFinal, querySeqArray);
        }  

        for(let acc in ic.msaSeq) {
            let index = acc2index[acc];

            if(index !== undefined) {
                trackSeqArray[index] = ic.msaSeq[acc];
                trackTitleArray[index] = acc;
            }
        }

        // remove introns in trackSeqArray
        let trackSeqArrayFinal = [];
        for(let i = 0, il = trackSeqArray.length; i < il; ++i) {
            trackSeqArrayFinal[i] = '';
        }

        for(let j = 0, jl = trackSeqArray[maxIndex].length; j < jl; ++j) {
            let seq = trackSeqArray[maxIndex][j];

            let bExon = (seq != '-') ? true : false;
            if(!bExon) {
                for(let i = 0, il = trackSeqArray.length; i < il; ++i) {
                    if(trackSeqArray[i][j] != '-') {
                        bExon = true;
                        break;
                    }
                }
            }
            
            if(bExon) {
                for(let i = 0, il = trackSeqArray.length; i < il; ++i) {
                    trackSeqArrayFinal[i] += trackSeqArray[i][j];
                }
            }
        }

        return {trackTitleArray: trackTitleArray, trackSeqArray: trackSeqArrayFinal, maxIndex: maxIndex};
    }

    async showMsaTracks(chainid, seqFirst, trackTitleArray, trackSeqArray, startpos, type, acc2exons) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.startposGiSeq = undefined;
        for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
            //let pos =(i >= ic.matchedPos[chainid] && i - ic.matchedPos[chainid] < ic.chainsSeq, [chainid].length) ? ic.chainsSeq[chainid][i - ic.matchedPos[chainid]].resi : ic.baseResi[chainid] + 1 + i;
            let pos = ic.ParserUtilsCls.getResi(chainid, i);

            if(pos != startpos) {
                continue;
            }
            else {
                ic.startposGiSeq = i;
            }
        }

        if(ic.startposGiSeq === undefined) {
            alert("Please double check the start position before clicking \"Add Track\"");
            return;
        }

        // set up gap for the master seq
        // don't count gaps in both ends
        ic.targetGapHash = {}
        let prevSeq = '-', prevPos = 0, from, to, cnt = 0, dashCnt = 0;
        let bFound = false, seqStart = 0, seqEnd = 0, seqLength = seqFirst.length;
        // add gaps to the N- and C-terminal
        if(!ic.seqStartLen) ic.seqStartLen = {};
        if(!ic.seqEndLen) ic.seqEndLen = {};
        for(let i = 0, il = seqFirst.length; i < il; ++i) {
            if(seqFirst[i] == '-' && seqFirst[i] != prevSeq) { // start of gap
                from = cnt;
                dashCnt = 0;
            }

            if(prevSeq == '-' && seqFirst[i] != prevSeq && cnt > 0) { // end of gap
                to = prevPos;
                ic.targetGapHash[from + ic.startposGiSeq] = {'from': from + ic.startposGiSeq, 'to': to + dashCnt - 1 + ic.startposGiSeq}
            }

            prevSeq = seqFirst[i];
            prevPos = cnt;

            if(seqFirst[i] != '-') {
                ++cnt;
                seqEnd = i;
                ic.seqEndLen[chainid] = seqLength - 1 - seqEnd;

                if(!bFound) {
                    seqStart = i;
                    ic.seqStartLen[chainid] = seqStart;

                    bFound = true;
                }
            }
            else {
                ++dashCnt;
            }
        }

        // adjust the total length
        if(ic.maxAnnoLength < ic.maxAnnoLengthOri + ic.seqStartLen[chainid] + ic.seqEndLen[chainid]) {
                ic.maxAnnoLength = ic.maxAnnoLengthOri + ic.seqStartLen[chainid] + ic.seqEndLen[chainid];
        }

        await ic.annotationCls.resetAnnoAll();

        let targetGapHashStr = '';
        let cntTmp = 0;
        for(let i in ic.targetGapHash) {
            if(cntTmp > 0) targetGapHashStr += ' ';
            targetGapHashStr += i + '_' + ic.targetGapHash[i].from + '_' + ic.targetGapHash[i].to;
            ++cntTmp;
        }

        //me.htmlCls.clickMenuCls.setLogCmd("msa | " + targetGapHashStr, true);

        // add tracks
        let resi2cntSameRes = {}; // count of same residue at each position
        for(let j = 0, jl = trackSeqArray.length; j < jl; ++j) {
            let resi = startpos;
            let text = '';
            for(let k = 0; k < ic.startposGiSeq; ++k) {
                if(ic.targetGapHash.hasOwnProperty(k)) {
                    for(let m = 0; m < ic.targetGapHash[k].to - ic.targetGapHash[k].from + 1; ++m) {
                        text += '-';
                    }
                }

                text += '-';
            }

            let resn, prevResn = '-';
            let fromArray = [], toArray = [];
            let bFound = false;
            let seqStartLen = 0;
            //    for(let k = seqStart; k <= seqEnd; ++k) {
            for(let k = 0; k < seqLength; ++k) {
                //if(seqFirst[k] == '-') continue;

                if(j == 0) resi2cntSameRes[resi] = 0;

                resn = trackSeqArray[j][k];

                if(prevResn == '-' && resn != '-') {
                    fromArray.push(k);
                }

                if(prevResn != '-' && resn == '-') {
                    toArray.push(k - 1);
                }

                if(resn != '-') {
                    if(!bFound) {
                        seqStartLen = k;
                        bFound = true;
                    }
                }

                text += resn; //ic.giSeq[chainid][i];

                if(seqFirst[k] != '-') {
                    if(seqFirst[k] == trackSeqArray[j][k]) ++resi2cntSameRes[resi];
                    ++resi;
                }

                prevResn = resn;
            }

            // last one
            if(prevResn != '-') {
                toArray.push(seqLength - 1);
            }

            let title =(trackTitleArray[j].length < 20) ? trackTitleArray[j] : trackTitleArray[j].substr(0, 20) + '...';
            let bMsa = true;
            let exonArray = (acc2exons) ? acc2exons[trackTitleArray[j]] : undefined;
            this.showNewTrack(chainid, title, text, undefined, undefined, type, undefined, bMsa, fromArray, toArray, seqStartLen, exonArray);
        }

        // update exon color
        ic.opts['color'] = 'exon';
        ic.legendTableCls.showColorLegend(ic.opts['color']);

        ic.hlUpdateCls.updateHlAll();
        ic.drawCls.draw();

/*
        // set color for the master seq
        if(trackSeqArray.length > 0) {
            if(ic.queryresi2score === undefined) ic.queryresi2score = {}
            if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {}

            let nSeq = trackSeqArray.length;
            for(let resi in resi2cntSameRes) {
                let score = parseInt(resi2cntSameRes[resi] / nSeq * 100);
                ic.queryresi2score[chainid][resi] = score;
            }

            let resiArray = Object.keys(resi2cntSameRes);
            let start = Math.min.apply(null, resiArray);
            let end = Math.max.apply(null, resiArray);

            let resiScoreStr = '';
            for(let resi = start; resi <= end; ++resi) {
                if(resi2cntSameRes.hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(resi2cntSameRes[resi] / nSeq * 9); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }

            ic.opts['color'] = 'align custom';
            ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

            ic.hlUpdateCls.updateHlAll();

            ic.drawCls.draw();

            //me.htmlCls.clickMenuCls.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
        }
        */
    }

    processAccList(acclist) { let ic = this.icn3d, me = ic.icn3dui;
        // remove version from acc
        let accArray = acclist.split(',');
        let accHash = {};
        let acclistTmp = '';
        for(let i = 0, il = accArray.length; i < il; ++i) {
            let acc = accArray[i];

            if(accHash.hasOwnProperty(acc)) {
                continue;
            }
            else {
                accHash[acc] = 1;
            }
            
            let pos = acc.indexOf('.');
            if(pos != -1) {
                acclistTmp += acc.substr(0, pos);
            }
            else {
                acclistTmp += acc;
            }

            if(i < accArray.length - 1) {
                acclistTmp += ',';
            }
        }

        return acclistTmp;
    }

    async addExonTracks(chainid, geneid, startpos, type) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let seqFirst, trackTitleArray = [], trackSeqArray = [];

        // get acclist from geneid
        let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?geneid2isoforms=" + geneid;
        let data = await me.getAjaxPromise(url, 'jsonp');
        let accArray = data.acclist;
        let exons = data.exons;
        let acc2exons = {};

        let acclist = '';
        ic.exonOrder = 1; // 1: increasing bp order; -1 decreasing bp order
        for(let i = 0, il = accArray.length; i < il; ++i) {
            let accOri = accArray[i];
            let pos = accOri.indexOf('.');
            let acc = (pos != -1) ? accOri.substr(0, pos) : accOri;

            let cnt, cntTotal = 0, prevCntTotal = 0, rangeArray = [];
            for(let j = 0, jl = exons[accOri].length; j < jl; ++j) {
                let itemArray = exons[accOri][j].split('-');
                itemArray[0] = parseInt(itemArray[0]);
                itemArray[1] = parseInt(itemArray[1]);
                itemArray[2] = parseInt(itemArray[2]);

                ic.exonOrder = (itemArray[0] < itemArray[1]) ? 1 : -1;

                let genomeRange = itemArray[0] + '-' + itemArray[1];
                let cnt = (j == jl - 1) ? itemArray[2] - 3 : itemArray[2]; // The last one is stop codeon
                cntTotal += cnt;

                let resStart = parseInt(prevCntTotal/3.0 + 0.5); // 0-based
                let resEnd = parseInt(cntTotal/3.0 + 0.5) - 1; // 0-based

                let genResStart = parseInt(itemArray[0] / 3.0 + 0.5);
                
                //let genResEnd = parseInt(itemArray[1] / 3.0 + 0.5); // some difference due to round
                let genResEnd = genResStart + ic.exonOrder * (resEnd - resStart);

                rangeArray.push({genomeRange: genomeRange, genResStart: genResStart, genResEnd: genResEnd, resStart: resStart, resEnd: resEnd});

                prevCntTotal = cntTotal;
            }
            acc2exons[acc] = rangeArray;

            acclist += acc;
            if(i < il - 1) {
                acclist += ',';
            }
        }

        let result = await this.getIsoformMsa(acclist, acc2exons);
        trackTitleArray = result.trackTitleArray;
        trackSeqArray = result.trackSeqArray;
        //seqFirst = result.seqFirst;
        let maxIndex = result.maxIndex;

        let acclist2 = trackTitleArray[maxIndex];
        let structure = chainid.substr(0, chainid.indexOf('_'));
        let firstAcc;
        if(structure.length > 5) {
            if(ic.uniprot2acc && ic.uniprot2acc[structure]) structure = ic.uniprot2acc[structure];
            firstAcc = structure;
        }
        else {
            firstAcc = chainid;
        }

        // get the sequence from iCn3D because a uniProt ID can not be retrieved in pwaln.fcgi
        if(structure.length > 5) {
            let chainSeq = '';
            for(let i = 0, il = ic.chainsSeq.length; i < il; ++i) {
                chainSeq += ic.chainsSeq[i].resn;
            }

            result = await this.getMsa(acclist2, firstAcc, chainSeq);
        }
        else {
            result = await this.getMsa(acclist2, firstAcc);
        }

        let trackTitleArray2 = result.trackTitleArray;
        let trackSeqArray2 = result.trackSeqArray;
        seqFirst = result.seqFirst;

        // merge trackTitleArray2[0] with trackSeqArray[maxIndex]
        let A = trackSeqArray[maxIndex], B = trackSeqArray2[0];
        let i = 0, j = 0, k = 0;

        let ALen = trackSeqArray.length;

        while (i < A.length && j < B.length) {
            if(A[i] != B[j]) {
                if(A[i] == '-') { 
                    // inser "-" in B
                    B = B.substr(0, j) + '-' + B.substr(j);
                    seqFirst = seqFirst.substr(0, j) + '-' + seqFirst.substr(j);
                }
                else { //if(B[j] == '-') { 
                    // inser "-" in A
                    for(let k = 0; k < ALen; ++k) {
                        trackSeqArray[k] = trackSeqArray[k].substr(0, i) + '-' + trackSeqArray[k].substr(i);
                    }
                }
            }

            ++i;
            ++j;
        }

        await thisClass.showMsaTracks(chainid, seqFirst, trackTitleArray, trackSeqArray, startpos, type, acc2exons);

        me.htmlCls.clickMenuCls.setLogCmd("add exon track | chainid " + chainid + " | geneid " + geneid + " | startpos " + startpos + " | type " + type, true);
    }

    async addMsaTracks(chainid, startpos, type, fastaList) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let seqFirst, trackTitleArray = [], trackSeqArray = [];

        let fastaArray = fastaList.split('>');

        // the first array item is empty
        // the second array item is the sequence of the structure, start with i = 2
        let posFirst = fastaArray[1].indexOf('\n');
        //let titleFirst = fastaArray[1].substr(0, posFirst);
        seqFirst = fastaArray[1].substr(posFirst + 1).replace(/\n/g, '');

        for(let i = 2, il = fastaArray.length; i < il; ++i) {
            let pos = fastaArray[i].indexOf('\n');
            let title = fastaArray[i].substr(0, pos);
            if(title.indexOf('|') != -1) {
                title = title.split('|')[1];
                //   if(title.indexOf('.') != -1) {
                //     title = title.split('.')[0];
                //   }
            }
            trackTitleArray.push(title);
            let seq = fastaArray[i].substr(pos + 1).replace(/\n/g, '');
            trackSeqArray.push(seq);
        }

        await thisClass.showMsaTracks(chainid, seqFirst, trackTitleArray, trackSeqArray, startpos, type);
        
        me.htmlCls.clickMenuCls.setLogCmd("add msa track | chainid " + chainid + " | startpos " + startpos + " | type " + type + " | fastaList " + fastaList , true);
    }
}

export {AddTrack}
