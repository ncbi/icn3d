    iCn3DUI.prototype.downloadPdb = function (pdbid) { var me = this;
       var url, dataType;

       url = "https://files.rcsb.org/view/" + pdbid + ".pdb";

       dataType = "text";

       me.icn3d.bCid = undefined;

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").show();
          },
          success: function(data) {
              me.loadPdbData(data);
          }
       });
    };

    iCn3DUI.prototype.downloadUrl = function (url, type) { var me = this;
       var dataType = "text";

       me.icn3d.bCid = undefined;

       //var url = '//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?dataurl=' + encodeURIComponent(url);

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").show();
          },
          success: function(data) {
                if(type === 'pdb') {
                    me.loadPdbData(data);
                }
                else if(type === 'mol2') {
                    me.loadMol2Data(data);
                }
                else if(type === 'sdf') {
                    me.loadSdfData(data);
                }
                else if(type === 'xyz') {
                    me.loadXyzData(data);
                }
          }
       });
    };

    iCn3DUI.prototype.loadPdbData = function(data) {
          var me = this;

          me.icn3d.loadPDB(data); // defined in the core library

          // test whether calpha only
          var bCalphaOnly = false;

          var index = 0, testLength = 30;
          var bOtherAtoms = false;
          for(var i in me.icn3d.proteins) {
            if(index < testLength) {
              if(me.icn3d.atoms[i].name !== 'CA') {
                bOtherAtoms = true;
                break;
              }
            }
            else {
              break;
            }

            ++index;
          }

          if(!bOtherAtoms) {
            bCalphaOnly = true;
          }

          var calphaonly = (bCalphaOnly) ? '1' : '0';

        // calculate secondary structures if not available
        // DSSP only works for structures with all atoms. The Calpha only strucutres didn't work
        if(!me.icn3d.bSecondaryStructure && !bCalphaOnly) {
               var url = "//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

               $.ajax({
                  url: url,
                  type: 'POST',
                  data: {'dssp':'t', 'calphaonly': calphaonly, 'pdbfile': data},
                  dataType: 'jsonp',
                  cache: true,
                  success: function(ssdata) {
                    var ssHash = ssdata;

                    if(JSON.stringify(ssdata).indexOf('Oops there was a problem') === -1) {
                      for(var chainNum in me.icn3d.chainsSeq) {
                          var pos = chainNum.indexOf('_');
                          var chain = chainNum.substr(pos + 1);

                          var residueObjectArray = me.icn3d.chainsSeq[chainNum];
                          var prevSS = 'coil';

                          for(var i = 0, il = residueObjectArray.length; i < il; ++i) {
                            var resi = residueObjectArray[i].resi;
                            var chain_resi = chain + '_' + resi;

                            var ssOneLetter = '-';
                            if(ssHash.hasOwnProperty(chain_resi)) {
                                ssOneLetter = ssHash[chain_resi];
                            }

                            var ss;
                            if(ssOneLetter === 'H') {
                                ss = 'helix';
                            }
                            else if(ssOneLetter === 'E') {
                                ss = 'sheet';
                            }
                            else {
                                ss = 'coil';
                            }

                            // update ss in sequence window
                            me.icn3d.chainsAnno[chainNum][1][i] = ssOneLetter;

                            // assign atom ss, ssbegin, and ssend
                            var resid = chainNum + '_' + resi;

                            // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                            var bSetPrevResidue = 0; // 0: no need to reset, 1: reset previous residue to "ssbegin = true", 2: reset previous residue to "ssend = true"

                            if(ss !== prevSS) {
                                if(prevSS === 'coil') {
                                    ssbegin = true;
                                    ssend = false;
                                }
                                else if(ss === 'coil') {
                                    bSetPrevResidue = 2;
                                    ssbegin = false;
                                    ssend = false;
                                }
                                else if( (prevSS === 'sheet' && ss === 'helix') || (prevSS === 'helix' && ss === 'sheet')) {
                                    bSetPrevResidue = 1;
                                    ssbegin = true;
                                    ssend = false;
                                }
                            }
                            else {
                                    ssbegin = false;
                                    ssend = false;
                            }

                            if(bSetPrevResidue == 1) { //1: reset previous residue to "ssbegin = true"
                                var prevResid = chainNum + '_' + (resi - 1).toString();
                                for(var j in me.icn3d.residues[prevResid]) {
                                    me.icn3d.atoms[j].ssbegin = true;
                                    me.icn3d.atoms[j].ssend = false;
                                }
                            }
                            else if(bSetPrevResidue == 2) { //2: reset previous residue to "ssend = true"
                                var prevResid = chainNum + '_' + (resi - 1).toString();
                                for(var j in me.icn3d.residues[prevResid]) {
                                    me.icn3d.atoms[j].ssbegin = false;
                                    me.icn3d.atoms[j].ssend = true;
                                }
                            }

                            // set the current residue
                            for(var j in me.icn3d.residues[resid]) {
                                me.icn3d.atoms[j].ss = ss;
                                me.icn3d.atoms[j].ssbegin = ssbegin;
                                me.icn3d.atoms[j].ssend = ssend;
                            }

                            prevSS = ss;
                          } // for each residue
                      } // for each chain
                    } // if no error

                    me.loadPdbDataRender();
                  }
                })
                .fail(function() {
                    me.loadPdbDataRender();
                });
        }
        else {
            me.loadPdbDataRender();
        }
    };

    iCn3DUI.prototype.loadPdbDataRender = function() {
        var me = this;

        me.pmid = me.icn3d.pmid;

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        me.icn3d.setAtomStyleByOptions(me.options);
        me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

        me.renderStructure();

        me.showTitle();

        if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

        if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    };
