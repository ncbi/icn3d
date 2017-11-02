    iCn3DUI.prototype.downloadMmcif = function (mmcifid) { var me = this;
       var url, dataType;

       url = "https://files.rcsb.org/view/" + mmcifid + ".cif";

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
               url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

               $.ajax({
                  url: url,
                  type: 'POST',
                  data : {'mmciffile': data},
                  dataType: 'jsonp',
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
                      me.loadMmcifData(data);
                  }
                });
          }
        });
    };

    iCn3DUI.prototype.loadMmcifData = function(data) { var me = this;
        if (data.atoms !== undefined) {
            me.loadAtomDataIn(data, data.mmcif, 'mmcifid');

            if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                $("#" + me.pre + "alternateWrapper").hide();
            }

            // load assembly info
            var assembly = data.assembly;
            for(var i = 0, il = assembly.length; i < il; ++i) {
              if (me.icn3d.biomtMatrices[i] == undefined) me.icn3d.biomtMatrices[i] = new THREE.Matrix4().identity();

              for(var j = 0, jl = assembly[i].length; j < jl; ++j) {
                me.icn3d.biomtMatrices[i].elements[j] = assembly[i][j];
              }
            }

            me.icn3d.setAtomStyleByOptions(me.options);
            me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

            me.renderStructure();

            if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

            if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

            if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
        else {
            alert('invalid atoms data.');
            return false;
        }
    };

    iCn3DUI.prototype.downloadAlignment = function (align) { var me = this;
        me.options['proteins'] = 'c alpha trace';
        me.icn3d.options['proteins'] = 'c alpha trace';

        if(me.bFullUi && me.isMac() && me.isMobile) {
            me.MENU_WIDTH = 950; // have enough space to show image in iphone

            me.setViewerWidthHeight();

            var width = me.WIDTH - me.LESSWIDTH;
            var height = me.HEIGHT - me.LESSHEIGHT;

            me.resizeCanvas(width, height, true, false);
        }

        var alignArray = align.split(',');
        //var ids_str = (alignArray.length === 2? 'uids=' : 'ids=') + align;
        var ids_str = 'ids=' + align;
        //var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c&w3d&' + ids_str;
        //var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c1&d&' + ids_str;

        var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c&w3d&' + ids_str + '&v=1.3.4';
        var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c1&d=1&' + ids_str + '&v=1.3.4';

        if(me.cfg.inpara !== undefined) {
          url += me.cfg.inpara;
          url2 += me.cfg.inpara;
        }

        me.icn3d.bCid = undefined;

        // define for 'align' only
        me.icn3d.pdbid_chain2title = {};

        if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

        var request = $.ajax({
           url: url2,
           dataType: 'jsonp',
           cache: true
/*
           ,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "commandlog")) $("#" + me.pre + "commandlog").show();
          }
*/
        });

        var seqalign = {};

        var chained = request.then(function( data ) {
            seqalign = data.seqalign;
            if(seqalign === undefined) {
                alert("These two MMDB IDs " + alignArray + " do not have 3D alignment data.");
                return false;
            }

            // set me.icn3d.pdbid_molid2chain and me.icn3d.chainsColor
            me.icn3d.pdbid_molid2chain = {};
            me.icn3d.chainsColor = {};
            //me.mmdbidArray = [];
            //for(var i in data) {
			for(var i = 0, il = 2; i < il; ++i) {
				//if(i === 'seqalign') continue;
				var mmdbTmp = data['aligned_structures'][0][i];

				//var pdbid = (data[i].pdbid !== undefined) ? data[i].pdbid : i;
				var pdbid = (mmdbTmp.pdb_id !== undefined) ? mmdbTmp.pdb_id : mmdbTmp.mmdb_id;
				//me.mmdbidArray.push(pdbid); // here two molecules are in alphabatic order, themaster molecule could not be the first one

				var chainNameHash = {}; // chain name may be the same in assembly
				for(var molid in mmdbTmp.molecules) {
				  var chainName = mmdbTmp.molecules[molid].chain.trim();
				  if(chainNameHash[chainName] === undefined) {
					  chainNameHash[chainName] = 1;
				  }
				  else {
					  ++chainNameHash[chainName];
				  }

				  var finalChain = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();

				  me.icn3d.pdbid_molid2chain[pdbid + '_' + molid] = finalChain;

				  if(mmdbTmp.molecules[molid].kind === 'p' || mmdbTmp.molecules[molid].kind === 'n') {
					  me.icn3d.chainsColor[pdbid + '_' + finalChain] = new THREE.Color(me.GREY8);
				  }
				}
			}

            //var index = 0;
            //for(var mmdbid in data) {
			for(var i = 0, il = 2; i < il; ++i) {
                //if(index < 2) {
					var mmdbTmp = data['aligned_structures'][0][i];

                    var pdbid = mmdbTmp.pdb_id;

                    var molecule = mmdbTmp.molecules;
                    for(var molname in molecule) {
                        var chain = molecule[molname].chain;
                        me.icn3d.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                    }
                //}

                //++index;
            }

            // get the color for each aligned chain pair
            me.alignmolid2color = [];
            me.alignmolid2color[0] = {};
            me.alignmolid2color[1] = {};
            var colorLength = me.icn3d.stdChainColors.length;

            for(var i = 0, il = seqalign.length; i < il; ++i) {
                var molid1 = seqalign[i][0].molecule_id;
                var molid2 = seqalign[i][1].molecule_id;

                //var colorIndex = i % colorLength;
                //var colorStr = "#" + me.icn3d.stdChainColors[colorIndex].getHexString();

                //me.alignmolid2color[0][molid1] = colorStr;
                //me.alignmolid2color[1][molid2] = colorStr;

                me.alignmolid2color[0][molid1] = (i+1).toString();
                me.alignmolid2color[1][molid2] = (i+1).toString();
            }

            return $.ajax({
               url: url,
               dataType: 'jsonp',
               //jsonp: 'jpf',
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
              }
            });
        });

        chained.done(function( data ) {
            if (data.atoms !== undefined) {
                me.loadAtomDataIn(data, undefined, 'align', seqalign);

                if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                    $("#" + me.pre + "alternateWrapper").hide();
                }

/*
                me.icn3d.setAtomStyleByOptions(me.options);
                // change the default color to "Identity"
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

//                me.icn3d.bRender = false;
                me.renderStructure();
*/

                // for alignment, show aligned residues, ligands, and ions
                var displayAtoms = {};
                for(var alignChain in me.icn3d.alignChains) {
					displayAtoms = me.icn3d.unionHash(displayAtoms, me.icn3d.alignChains[alignChain]);
				}

                var residuesHash = {}, chains = {};
                for(var i in displayAtoms) {
					var atom = me.icn3d.atoms[i];

					var chainid = atom.structure + '_' + atom.chain;
					var resid = chainid + '_' + atom.resi;
					residuesHash[resid] = 1;
					chains[chainid] = 1;
				}

				var commandname = 'aligned_protein';
				var commanddescr = 'aligned protein and nucleotides';
				var select = "select " + me.residueids2spec(Object.keys(residuesHash));

				me.addCustomSelection(Object.keys(residuesHash), Object.keys(displayAtoms), commandname, commanddescr, select, true);

// expensive to generate "aligned_ligands"
/*
				var atoms1 = {}, atoms = {};

				atoms1 = me.icn3d.getAtomsWithinAtom(me.icn3d.ligands, displayAtoms, 0);
				atoms = me.icn3d.unionHash(atoms,  atoms1);

				atoms1 = me.icn3d.getAtomsWithinAtom(me.icn3d.ions, displayAtoms, 0);
				atoms = me.icn3d.unionHash(atoms,  atoms1);

				atoms1 = me.icn3d.getAtomsWithinAtom(me.icn3d.water, displayAtoms, 0);
				atoms = me.icn3d.unionHash(atoms,  atoms1);

                residuesHash = {};
                for(var i in atoms) {
					var atom = me.icn3d.atoms[i];

					var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
					residuesHash[resid] = 1;
				}

				commandname = 'aligned_ligands';
				commanddescr = 'ligands located inside the aligned structures';
				select = "select " + me.residueids2spec(Object.keys(residuesHash));

				me.addCustomSelection(Object.keys(residuesHash), Object.keys(atoms), commandname, commanddescr, select, true);

				//expand to all atoms in the ligands
				var residues = {};
				for(var i in atoms) {
					var atom = me.icn3d.atoms[i];
					var chainid = atom.structure + '_' + atom.chain;
					var resid = chainid + '_' + atom.resi;

					residues[resid] = 1;
					chains[chainid] = 1;
				}

				atoms = {};
				for(var resid in residues) {
					atoms = me.icn3d.unionHash(atoms,  me.icn3d.residues[resid]);
				}

				displayAtoms = me.icn3d.unionHash(displayAtoms,  atoms);
*/

//                me.setMode('all');

                me.icn3d.setAtomStyleByOptions(me.options);
                // change the default color to "Identity"
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

//                me.icn3d.bRender = false;
                me.renderStructure();

/*
				me.icn3d.displayAtoms = me.icn3d.cloneHash(displayAtoms);
				me.icn3d.highlightAtoms = me.icn3d.cloneHash(displayAtoms);

				if(Object.keys(displayAtoms).length < Object.keys(me.icn3d.atoms).length) {
					me.setMode('selection');

					me.updateSeqWinForCurrentAtoms(true);
				}

				me.icn3d.bRender = true;
				me.icn3d.draw();
*/

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                if(me.icn3d.bSSOnly) {
                    me.html2ddiagram = "<div style='width:150px'><b>Nodes</b>: chains</div><br/>";
                }
                else if(me.cfg.align !== undefined) {
                    me.html2ddiagram = "<div style='width:150px'><b>Nodes</b>: chains<br/><b>Lines</b>: interactions (4 &#197;)<br/><b>Numbers in red</b>: aligned chains</div><br/>";
                }
                else {
                    me.html2ddiagram = "<div style='width:150px'><b>Nodes</b>: chains<br/><b>Lines</b>: interactions (4 &#197;)</div><br/>";
				}

                //var mmdbidArray = me.inputid.split('_');
                var mmdbidArray = [];
                for(var i = 0, il = data.aligned_structures[0].length; i < il; ++i) {
					mmdbidArray.push(data.aligned_structures[0][i].pdb_id);
				}

                setTimeout(function(){
                	me.set2DDiagramsForAlign(mmdbidArray[0].toUpperCase(), mmdbidArray[1].toUpperCase());
                }, 0);

                // by default, open the seq alignment window
                if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');
                if(me.cfg.showalignseq !== undefined && me.cfg.showalignseq) me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');

                if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

                if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }
            else {
                alert('invalid atoms data.');
                return false;
            }
        });
    };

    iCn3DUI.prototype.set2DDiagramsForAlign = function (mmdbid1, mmdbid2) { var me = this;
	   var url1="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?uid="+mmdbid1+"&format=json&intrac=3";
	   var url2="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?uid="+mmdbid2+"&format=json&intrac=3";

       var request1 = $.ajax({
            url: url1,
            dataType: 'jsonp',
            cache: true
       });

       var request2 = request1.then(function( data ) {
            me.draw2Ddiagram(data, mmdbid1, 0);
            if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');

            return $.ajax({
              url: url2,
              dataType: 'jsonp',
              cache: true
            });
       });

       request2.done(function( data ) {
            me.draw2Ddiagram(data, mmdbid2, 1);
            if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');

//            me.add2DHighlight(Object.keys(chains));
       });

//		var request1 = me.download2Ddiagram(mmdbid1, 0);
//		var request2 = request1.then(me.download2Ddiagram(mmdbid2, 1));
    };

    iCn3DUI.prototype.downloadMmdb = function (mmdbid, bGi) { var me = this;
       var maxatomcnt = (me.cfg.maxatomcnt === undefined) ? 50000 : me.cfg.maxatomcnt;

       var url;
       if(bGi !== undefined && bGi) {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&b&complexity=3&gi=" + mmdbid + "&ath=" + maxatomcnt;
       }
       else {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&b&complexity=3&uid=" + mmdbid + "&ath=" + maxatomcnt;
       }

       me.icn3d.bCid = undefined;

       if(me.cfg.inpara !== undefined) {
         url += me.cfg.inpara;
       }

       if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

       $.ajax({
          url: url,
          dataType: 'jsonp',
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
          error: function(xhr, textStatus, errorThrown){
              if(bGi) {
                  alert("This gi " + mmdbid + " has no corresponding 3D structure...");
              }
              else {
                  alert("This mmdbid " + mmdbid + " with the parameters " + me.cfg.inpara + " has no corresponding 3D structure...");
              }

              return false;
          },
          success: function(data) {
            var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
            me.inputid = id;

            // get molid2color = {}, chain2molid = {}, molid2chain = {};
            var labelsize = 40;

            var molid2rescount = data.molid2rescount;
            var molid2color = {}, chain2molid = {}, molid2chain = {};
            me.icn3d.chainsColor = {};

            var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

            var index = 1;
            var chainNameHash = {};
            for(var i in molid2rescount) {
              var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
              var chainName = molid2rescount[i].chain.trim();
              if(chainNameHash[chainName] === undefined) {
                  chainNameHash[chainName] = 1;
              }
              else {
                  ++chainNameHash[chainName];
              }

              var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
              var chain = id + '_' + chainNameFinal;
              html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='" + i + "' chain='" + chain + "'/></td><td align='center'>" + index + "</td><td align='center'>" + chainNameFinal + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

              molid2color[i] = color;
              chain2molid[chain] = i;
              molid2chain[i] = chain;

              me.icn3d.chainsColor[chain] = new THREE.Color(color);
              ++index;
            }

            if(me.icn3d.ligands !== undefined && Object.keys(me.icn3d.ligands).length > 0) {
              html += "<tr><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='ligands'/></td><td align='center'>" + index + "</td><td align='center'>Ligands</td><td align='center'>" + Object.keys(me.icn3d.ligands).length + " atoms</td></tr>";
            }

            html += "</table>";

            me.icn3d.molid2color = molid2color;
            me.icn3d.chain2molid = chain2molid;
            me.icn3d.molid2chain = molid2chain;

            //if ((me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= data.threshold && data.atoms !== undefined) ) {
            if ((me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= maxatomcnt && data.atoms !== undefined) ) {
                // small structure with all atoms
                // show surface options
                $("#" + me.pre + "accordion5").show();

                me.loadAtomDataIn(data, id, 'mmdbid');

                if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                    if($("#" + me.pre + "alternateWrapper") !== null) $("#" + me.pre + "alternateWrapper").hide();
                }

                me.icn3d.setAtomStyleByOptions(me.options);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms, true);

                me.renderStructure();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);
            }

            //if(me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') == -1 && data.atomcount > data.threshold && data.molid2rescount !== undefined) {
            if(me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') == -1 && data.atomcount > maxatomcnt && data.molid2rescount !== undefined) {
                // hide surface option
                $("#" + me.pre + "accordion5").hide();

                // large struture with helix/brick, phosphorus, and ligand info
                me.icn3d.bSSOnly = true;

                // do not show the sequence dialog, show the filter dialog
                me.cfg.showseq = false;

                // load atom info
                me.loadAtomDataIn(data, id, 'mmdbid');

                var options2 = me.icn3d.cloneHash(me.options);
                options2['nucleotides'] = 'phosphorus lines';

                me.icn3d.setAtomStyleByOptions(options2);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(options2, me.icn3d.atoms, true);

                // get brick and helix info to draw secondary structure for the coarse 3D view
                molid2ss = {}; // hash of molid -> array of object
                for(var i in data.helix) {
                  for(var j = 0, jl = data.helix[i].length; j < jl; ++j) {
                    var helix = data.helix[i][j];

                    var resiCoords = {};

                    resiCoords.type = 'helix';
                    resiCoords.startResi = helix.from;
                    resiCoords.endResi = helix.to;

                    // helix from and to coords are switched
                    resiCoords.coords = [];
                    resiCoords.coords.push(helix.end);
                    resiCoords.coords.push(helix.start);

                    if(molid2ss[i] === undefined) molid2ss[i] = [];
                    molid2ss[i].push(resiCoords);
                  }
                }

                for(var i in data.brick) {
                  for(var j = 0, jl = data.brick[i].length; j < jl; ++j) {
                    var brick = data.brick[i][j];

                    var resiCoords = {};

                    resiCoords.type = 'brick';
                    resiCoords.startResi = brick.from;
                    resiCoords.endResi = brick.to;

                    // coords
                    resiCoords.coords = [];
                    var start = {}, end = {}, direction = {};

                    start.x = 0.25 * (brick['000'][0] + brick['010'][0] + brick['011'][0] + brick['001'][0]);
                    start.y = 0.25 * (brick['000'][1] + brick['010'][1] + brick['011'][1] + brick['001'][1]);
                    start.z = 0.25 * (brick['000'][2] + brick['010'][2] + brick['011'][2] + brick['001'][2]);

                    end.x = 0.25 * (brick['100'][0] + brick['110'][0] + brick['111'][0] + brick['101'][0]);
                    end.y = 0.25 * (brick['100'][1] + brick['110'][1] + brick['111'][1] + brick['101'][1]);
                    end.z = 0.25 * (brick['100'][2] + brick['110'][2] + brick['111'][2] + brick['101'][2]);

                    direction.x = brick['010'][0] - brick['000'][0];
                    direction.y = brick['010'][1] - brick['000'][1];
                    direction.z = brick['010'][2] - brick['000'][2];

                    resiCoords.coords.push(start);
                    resiCoords.coords.push(end);
                    resiCoords.coords.push(direction);

                    if(molid2ss[i] === undefined) molid2ss[i] = [];
                    molid2ss[i].push(resiCoords);
                  }
                }

                // sort the arrays
                for(var i in molid2ss) {
                    molid2ss[i].sort(function(a, b) {
                        return parseFloat(a.startResi) - parseFloat(b.startResi);
                    });
                }

                // set the center and maxD
                if(me.icn3d.cnt !== 0) {
                    var pmin = me.icn3d.pmin;
                    var pmax = me.icn3d.pmax;
                    var psum = me.icn3d.center.multiplyScalar(me.icn3d.cnt);
                    var cnt = me.icn3d.cnt;
                }
                else {
                    var pmin = new THREE.Vector3( 9999, 9999, 9999);
                    var pmax = new THREE.Vector3(-9999,-9999,-9999);
                    var psum = new THREE.Vector3();
                    var cnt = 0;
                }

                for(var i in molid2ss) {
                    var pminMolid = new THREE.Vector3( 9999, 9999, 9999);
                    var pmaxMolid = new THREE.Vector3(-9999,-9999,-9999);
                    var psumMolid = new THREE.Vector3();
                    var cntMolid= 0;

                    for(var j = 0, jl = molid2ss[i].length; j < jl; ++j) {
                        var coord = molid2ss[i][j].coords[0];
                        pmin.min(coord);
                        pmax.max(coord);
                        psum.add(coord);

                        pminMolid.min(coord);
                        pmaxMolid.max(coord);
                        psumMolid.add(coord);

                        ++cnt;
                        ++cntMolid;

                        coord = molid2ss[i][j].coords[1];
                        pmin.min(coord);
                        pmax.max(coord);
                        psum.add(coord);

                        pminMolid.min(coord);
                        pmaxMolid.max(coord);
                        psumMolid.add(coord);

                        ++cnt;
                        ++cntMolid;
                    }

                    var centerMolid = psumMolid.multiplyScalar(1.0 / cntMolid);
                }
                me.icn3d.maxD = pmax.distanceTo(pmin);
                me.icn3d.center = psum.multiplyScalar(1.0 / cnt);

                me.icn3d.oriMaxD = me.icn3d.maxD;
                me.icn3d.oriCenter = me.icn3d.center.clone();

                // set the start and end of coils
                for(var i in molid2ss) {
                    // skip the first one since its end is the start of the first coil
                    for(var j = 1, jl = molid2ss[i].length; j < jl; ++j) {
                        var resiCoords = {};

                        resiCoords.type = 'coil';
                        resiCoords.startResi = molid2ss[i][j-1].endResi;
                        resiCoords.endResi = molid2ss[i][j].startResi;

                        resiCoords.coords = [];
                        resiCoords.coords.push(molid2ss[i][j-1].coords[1]);
                        resiCoords.coords.push(molid2ss[i][j].coords[0]);

                        //if(molid2ss[i] === undefined) molid2ss[i] = [];
                        molid2ss[i].push(resiCoords);
                    }
                }

                // sort the arrays
                //for(var i in molid2ss) {
                //    molid2ss[i].sort(function(a, b) {
                //        return parseFloat(a.startResi) - parseFloat(b.startResi);
                //    });
                //}

                me.icn3d.molid2ss = molid2ss;
                //me.icn3d.molid2color = molid2color;

                me.renderStructure();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                // show the dialog to select structures
                $( "#" + me.pre + "dl_filter_table" ).html(html);

                var title = "Select chains to display";

                var id = me.pre + "dl_filter";

                me.openDialog(id, title);
            }

            me.html2ddiagram = "<div style='width:150px'><b>Nodes</b>: chains<br/><b>Lines</b>: interactions (4 &#197;)</div><br/>";

            setTimeout(function(){
            	me.download2Ddiagram(me.inputid.toUpperCase());
            }, 0);

            //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');
            if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

            if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

            if(data.atoms === undefined && data.molid2rescount === undefined) {
                alert('invalid MMDB data.');
                return false;
            }

          } // success
        }); // ajax
    };

    iCn3DUI.prototype.download2Ddiagram = function(mmdbid, structureIndex) {var me = this;
      me.deferred3 = $.Deferred(function() {
        var url="https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?uid="+mmdbid+"&format=json&intrac=3";
        $.ajax({
            url: url,
            dataType: 'jsonp',
            success: function( data ) {
                me.draw2Ddiagram(data, mmdbid, structureIndex);

                if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');
                if(me.deferred3 !== undefined) me.deferred3.resolve();
            }
        });
	  });

	  return me.deferred3;
    };

    // draw 2D diagram for MMDB ID
    // Used as a reference the work at 2016 ISMB hackathon: https://github.com/NCBI-Hackathons/3D_2D_Rep_Structure
    iCn3DUI.prototype.draw2Ddiagram = function(data, mmdbid, structureIndex, bDraw) { var me = this;
        // reduce the size from 300 to 150
        var factor = 0.5;

		// set molid2chain
		var molid2chain = {}, molid2color = {}, molid2name = {};
		var chainNameHash = {};
		for(var molid in data.molid2molinfor) {
              var color = '#' + ( '000000' + data.molid2molinfor[molid].color.toString( 16 ) ).slice( - 6 );
              var chainName = data.molid2molinfor[molid].chain.trim();
              if(chainNameHash[chainName] === undefined) {
                  chainNameHash[chainName] = 1;
              }
              else {
                  ++chainNameHash[chainName];
              }

              var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
              var chainid = mmdbid + '_' + chainNameFinal;

              molid2chain[molid] = chainid;
              molid2color[molid] = color;
              molid2name[molid] = data.molid2molinfor[molid].name;
		}

        // save the interacting residues
        for(var i = 0, il = data['intrac-residues'].length; i < il; ++i) {
			var pair = data['intrac-residues'][i];

			var index = 0;
			var chainid1, chainid2;

			for(var molid in pair) {
				var chainid;

	            chainid = molid2chain[molid];

	            if(index === 0) {
					chainid1 = chainid;
				}
				else {
					chainid2 = chainid;
				}

				++index;
			}

			index = 0;
			for(var molid in pair) {
	            var resArray = pair[molid];

				var fisrtChainid, secondChainid;
				if(index === 0) {
					fisrtChainid = chainid1;
					secondChainid = chainid2;
				}
				else {
					fisrtChainid = chainid2;
					secondChainid = chainid1;
				}

				if(me.chainids2resids[fisrtChainid] === undefined) {
					me.chainids2resids[fisrtChainid] = {};
				}

				if(me.chainids2resids[fisrtChainid][secondChainid] === undefined) {
					me.chainids2resids[fisrtChainid][secondChainid] = [];
				}

	            for(var j = 0, jl = resArray.length; j < jl; ++j) {
					var res = resArray[j];
					var resid = me.mmdbMolidResid2mmdbChainResi[mmdbid.toUpperCase() + '_' + molid + '_' + res];

					me.chainids2resids[fisrtChainid][secondChainid].push(resid);
				}

				++index;
			}
		}

        var html = "<div id='#" + me.pre + mmdbid + "'>";

        html += "<b>" + mmdbid.toUpperCase() + "</b><br/>";

        html += "<svg viewBox='0,0,150,150'>";
        var strokecolor = '#000000';
        var strokewidth = '1';
        var linestrokewidth = '2';
        var textcolor = '#000000';
        var fontsize = '10';
        var smallfontsize = '8';
        var adjustx = 0, adjusty = 4, smalladjustx = 1, smalladjusty = 2, halfLetHigh = 6;

        var posHash = {};
        var lines = [];

        var nodeHtml = "";

		var alignedAtomArray = [];

        for(var molid in data.intrac) {
            var diagram = data.intrac[molid];
            var color = "#FFFFFF";
            var oricolor = molid2color[molid];
            var alignNum = "";
            if(structureIndex !== undefined && structureIndex === 0) {
                if(me.alignmolid2color !== undefined && me.alignmolid2color[0].hasOwnProperty(molid)) {
                    //color = me.alignmolid2color[0][molid];
                    alignNum = me.alignmolid2color[0][molid];
                    oricolor = "#FF0000";
                }
                else {
                	oricolor = "#FFFFFF";
				}
            }
            else if(structureIndex !== undefined && structureIndex === 1) {
                if(me.alignmolid2color !== undefined && me.alignmolid2color[1].hasOwnProperty(molid)) {
                    //color = me.alignmolid2color[1][molid];
                    alignNum = me.alignmolid2color[1][molid];
                    oricolor = "#FF0000";
                }
                else {
                	oricolor = "#FFFFFF";
				}
            }

            var chainid;

            chainid = molid2chain[molid];

            var chainname = molid2name[molid];

            var chain = ' ', oriChain = ' ';
            if(chainid !== undefined) {
                var pos = chainid.indexOf('_');
                oriChain = chainid.substr(pos + 1);

                if(oriChain.length > 1) {
                    chain = oriChain.substr(0, 1) + '.';
                }
                else {
                    chain = oriChain;
                }
            }
            else {
                chainid = 'Misc';
            }

            if(oricolor === undefined) {
                oricolor = '#FFFFFF';
            }

            for(var i = 0, il = diagram.intrac.length; i < il; ++i) {
                lines.push([molid, diagram.intrac[i] ]);
            }

			var ratio = 1.0;
			if(me.icn3d.alignChains[chainid] !== undefined) {
				//ratio = 1.0 * Object.keys(me.icn3d.alignChains[chainid]).length / Object.keys(me.icn3d.chains[chainid]).length;
				var alignedAtomCnt = 0;
				for(var i in me.icn3d.alignChains[chainid]) {
					var colorStr = me.icn3d.atoms[i].color.getHexString().toUpperCase();
					if(colorStr === 'FF0000' || colorStr === '00FF00') {
						++alignedAtomCnt;
					}
				}
				ratio = 1.0 * alignedAtomCnt / Object.keys(me.icn3d.chains[chainid]).length;
			}
			if(ratio < 0.2) ratio = 0.2;

            if(diagram.shape === 'rect') {
                var x = diagram.coords[0][0] * factor;
                var y = diagram.coords[0][1] * factor;
                var width = diagram.coords[0][2] * factor - x;
                var height = diagram.coords[0][3] * factor - y;

                nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
                nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
                // place holder
                nodeHtml += "<rect class='icn3d-basenode' x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";
                // highlight
                nodeHtml += "<rect class='icn3d-hlnode' x='" + (x + width / 2.0 * (1 - ratio)).toString() + "' y='" + (y + height / 2.0 * (1 - ratio)).toString() + "' width='" + (width * ratio).toString() + "' height='" + (height * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

                nodeHtml += "<text x='" + (x + width / 2 - adjustx).toString() + "' y='" + (y + height / 2 + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

                if(alignNum !== "") nodeHtml += "<text x='" + (x + width / 2 - adjustx).toString() + "' y='" + (y + height + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

                nodeHtml += "</g>";

                posHash[molid] = [x + width/2, y + height/2];
            }
            else if(diagram.shape === 'circle') {
                var x = diagram.coords[0][0] * factor;
                var y = diagram.coords[0][1] * factor;
                var r = diagram.coords[0][2] * factor;

                nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
                nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
                nodeHtml += "<circle class='icn3d-basenode' cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' class='icn3d-node' chainid='" + chainid + "' />";

                nodeHtml += "<circle class='icn3d-hlnode' cx='" + x + "' cy='" + y + "' r='" + (r * ratio).toString() + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

                nodeHtml += "<text x='" + (x - adjustx).toString() + "' y='" + (y + adjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + fontsize + "; text-anchor:middle' >" + chain + "</text>";

                if(alignNum !== "") nodeHtml += "<text x='" + (x - adjustx).toString() + "' y='" + (y + r + adjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

                nodeHtml += "</g>";

                posHash[molid] = [x, y];
            }
            else if(diagram.shape === 'poly') {
                var x0 = diagram.coords[0][0] * factor;
                var y0 = diagram.coords[0][1] * factor;
                var x1 = diagram.coords[1][0] * factor;
                var y1 = diagram.coords[1][1] * factor;
                var x2 = diagram.coords[2][0] * factor;
                var y2 = diagram.coords[2][1] * factor;
                var x3 = diagram.coords[3][0] * factor;
                var y3 = diagram.coords[3][1] * factor;

                var x = x0, y = y1;


                nodeHtml += "<g class='icn3d-node' chainid='" + chainid + "' >";
                nodeHtml += "<title>Chain " + oriChain + ": " + chainname + "</title>";
                nodeHtml += "<polygon class='icn3d-basenode' points='" + x0 + ", " + y0 + "," + x1 + ", " + y1 + "," + x2 + ", " + y2 + "," + x3 + ", " + y3 + "' x0='" + x0 + "' y0='" + y0 + "' x1='" + x1 + "' y1='" + y1 + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

                nodeHtml += "<polygon class='icn3d-hlnode' points='" + x0 + ", " + (y+(y0-y)*ratio).toString() + "," + (x+(x1-x)*ratio).toString() + ", " + y1 + "," + x0 + ", " + (y-(y0-y)*ratio).toString() + "," + (x-(x1-x)*ratio).toString() + ", " + y1 + "' fill='" + oricolor + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' />";

                nodeHtml += "<text x='" + (x0 + smalladjustx).toString() + "' y='" + (y1 + smalladjusty).toString() + "' style='fill:" + textcolor + "; font-size:" + smallfontsize + "; text-anchor:middle' >" + chain + "</text>";

                if(alignNum !== "") nodeHtml += "<text x='" + (x0 + smalladjustx).toString() + "' y='" + (y0 + smalladjusty + halfLetHigh).toString() + "' style='fill:" + oricolor + "; font-size:" + smallfontsize + "; font-weight:bold; text-anchor:middle' >" + alignNum + "</text>";

                nodeHtml += "</g>";

                posHash[molid] = [x0, y1];
            }
        }

        for(var i = 0, il = lines.length; i < il; ++i) {
            var pair = lines[i];

            var node1 = posHash[pair[0]];
            var node2 = posHash[pair[1]];

            var chainid1, chainid2;

            chainid1 = molid2chain[pair[0]];
            chainid2 = molid2chain[pair[1]];

            var pos1 = chainid1.indexOf('_');
            var pos2 = chainid2.indexOf('_');

            var chain1 = chainid1.substr(pos1 + 1);
            var chain2 = chainid2.substr(pos2 + 1);

            var x1 = node1[0], y1 = node1[1], x2 = node2[0], y2 = node2[1], xMiddle = (x1 + x2) * 0.5, yMiddle = (y1 + y2) * 0.5;

            if(me.icn3d.bSSOnly) { // the condensed view with only secondary structure information
                html += "<g chainid1='" + chainid1 + "' chainid2='" + chainid2 + "' >";
                html += "<title>Interactions NOT shown in the condensed view</title>";
                html += "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
            }
            else {
                html += "<g class='icn3d-interaction' chainid1='" + chainid1 + "' chainid2='" + chainid2 + "' >";
                html += "<title>Interaction of chain " + chain1 + " with chain " + chain2 + "</title>";
                html += "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + xMiddle + "' y2='" + yMiddle + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";

                html += "<g class='icn3d-interaction' chainid1='" + chainid2 + "' chainid2='" + chainid1 + "' >";
                html += "<title>Interaction of chain " + chain2 + " with chain " + chain1 + "</title>";
                html += "<line x1='" + xMiddle + "' y1='" + yMiddle + "' x2='" + x2 + "' y2='" + y2 + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
            }
        }

        html += nodeHtml;

          html += "</svg>";

          html += "</div>";

        if(bDraw === undefined || bDraw) {
			me.html2ddiagram += html;

			$("#" + me.pre + "dl_2ddiagram").html(me.html2ddiagram);
		}
    };

    iCn3DUI.prototype.downloadGi = function (gi) { var me = this;
        me.icn3d.bCid = undefined;
        var bGi = true;
        me.downloadMmdb(gi, bGi);

    };

    iCn3DUI.prototype.loadAtomDataIn = function (data, id, type, seqalign) { var me = this;
        me.icn3d.init();

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();

        var atoms = data.atoms;

        var serial = 0;
        var prevResi = 0;

        var serial2structure = {}; // for "align" only
        var mmdbid2pdbid = {}; // for "align" only

        me.pmid = data.pubmedid;

        if(type === 'align') {
          //serial2structure
          me.pmid = "";
          var refinedStr = (me.cfg.inpara.indexOf('atype=1') !== -1) ? 'Invariant Core ' : '';
          me.icn3d.moleculeTitle = refinedStr + 'Structure Alignment of ';

          for (var i = 0, il = data.aligned_structures[0].length; i < il; ++i) {
              var structure = data.aligned_structures[0][i];

              if(i === 1) {
                  me.icn3d.secondId = structure.pdb_id; // set the second pdbid to add indent in the structure and chain menus
              }

              for(var j = structure.atom_range[0]; j <= structure.atom_range[1]; ++j) {
                  var pdbidTmp = structure.pdb_id;
                  var mmdbidTmp = structure.mmdb_id;
                  serial2structure[j] = pdbidTmp.toString();
                  mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
              }

              me.icn3d.moleculeTitle +=  "<a href=\"https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=" + structure.pdb_id.toUpperCase() + "\" target=\"_blank\" style=\"color: " + me.GREYD + ";\">" + structure.pdb_id.toUpperCase() + "</a>";

              if(structure.descr !== undefined) me.pmid += structure.descr.pubmedid;
              if(i === 0) {
                  me.icn3d.moleculeTitle += " and ";
                  if(structure.descr !== undefined) me.pmid += "_";
              }
          }

          me.icn3d.moleculeTitle += ' from VAST+';

        }
        else { // mmdbid or mmcifid
              if(data.descr !== undefined) me.icn3d.moleculeTitle += data.descr.name;
        }

        var chainMissingResArray = {};
        if(type === 'mmdbid' || type === 'mmcifid') {
            for(var chain in data.sequences) {
                var seqArray = data.sequences[chain];
                var chainid = id + '_' + chain;
                if(type === 'mmcifid') chainid = '1_' + chain;

                prevResi = -999;
                var missingResBegin = 0;
                var bCount = true;
                for(var i = 0, il = seqArray.length; i < il; ++i) {
                    var seqName = seqArray[i][1]; // mmdbid: ["0","R","ARG"],["502","V","VAL"] mmcifid: [1, "ARG"]
                    if(type === 'mmcifid') seqName = me.icn3d.residueName2Abbr(seqName);

                    var resObject = {};
                    resObject.resi = i + 1;
                    if(parseInt(seqArray[i][0]) === 0 && prevResi !== -1) { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
                        resObject.name = seqName.toLowerCase();
                        ++missingResBegin;

                        bCount = true;
                    }
                    else {
                        resObject.name = seqName.toLowerCase();

                        if(bCount && missingResBegin > 0) {
                            if(chainMissingResArray[chain] === undefined) chainMissingResArray[chain] = [];

                            var count_nextresi = [missingResBegin, parseInt(seqArray[i][0])];

                            chainMissingResArray[chain].push(count_nextresi);

                            missingResBegin = 0;
                        }

                        bCount = false;
                    }

                      if(me.icn3d.chainsSeq[chainid] === undefined) me.icn3d.chainsSeq[chainid] = [];

                      if(me.icn3d.chainsAnno[chainid] === undefined ) me.icn3d.chainsAnno[chainid] = [];
                      if(me.icn3d.chainsAnno[chainid][0] === undefined ) me.icn3d.chainsAnno[chainid][0] = [];
                      if(me.icn3d.chainsAnno[chainid][1] === undefined ) me.icn3d.chainsAnno[chainid][1] = [];

                      var numberStr = '';
                      if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

                      var secondaries = '-';

                      me.icn3d.chainsSeq[chainid].push(resObject);
                      me.icn3d.chainsAnno[chainid][0].push(numberStr);
                      me.icn3d.chainsAnno[chainid][1].push(secondaries);

                      prevResi = parseInt(seqArray[i][0]);
                }
            }
        }

        var atomid2serial = {};
        var prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
        var structureNum = '', chainNum = '', residueNum = '';
        var currContinueSeq = '';
        var oldResi, prevOldResi = -999;
        var prevResi = 0; // continuous from 1 for each chain
        var missingResIndex = 0;
        var bChainSeqSet = true;

        // In align, ligands do not have assigned chains. Assembly will have the same residue id so that two different residues will be combined in one residue. To avoid this, build an array to check for molid
        var resiArray = [];
        var molid, prevMolid = '', prevMmdb_id = '';

        // set mmdbMolidResid2mmdbChainResi
        me.mmdbMolidResid2mmdbChainResi = {};

        for (var i in atoms) {
            ++serial;

            atomid2serial[i] = serial;

            var atm = atoms[i];
            atm.serial = serial;

            var mmdb_id;

            if(type === 'mmdbid' || type === 'mmcifid') {
              mmdb_id = id; // here mmdb_id is pdbid or mmcif id
            }
            else if(type === 'align') {
              mmdb_id = serial2structure[serial]; // here mmdb_id is pdbid
            }

            if(mmdb_id !== prevMmdb_id) resiArray = [];

            if(atm.chain === undefined && (type === 'mmdbid' || type === 'align')) {
                if(type === 'mmdbid') {
                  molid = atm.ids.m;

                  if(me.icn3d.molid2chain[molid] !== undefined) {
					  var pos = me.icn3d.molid2chain[molid].indexOf('_');
                      atm.chain = me.icn3d.molid2chain[molid].substr(pos + 1);
                  }
                  else {
                      if(molid !== prevMolid) {
                          resiArray.push(atm.resi);
                      }

                      var miscName;
                      if($.inArray(atm.resi, resiArray) === resiArray.length - 1) {
                          miscName = 'Misc';
                      }
                      else {
                          miscName = 'Misc2';
                      }

                      //all should be defined, no "Misc" should appear
                      atm.chain = miscName;
                  }
                }
                else if(type === 'align') {
                  molid = atm.ids.m;

                  if(me.icn3d.pdbid_molid2chain[mmdb_id + '_' + molid] !== undefined) {
                      atm.chain = me.icn3d.pdbid_molid2chain[mmdb_id + '_' + molid];
                  }
                  else {
                      if(molid !== prevMolid) {
                          resiArray.push(atm.resi);
                      }

                      var miscName;
                      if($.inArray(atm.resi, resiArray) === resiArray.length - 1) {
                          miscName = 'Misc';
                      }
                      else {
                          miscName = 'Misc2';
                      }

                      // ligands do not have assigned chains.
                      atm.chain = miscName;
                  }
                }
            }
            else {
              atm.chain = (atm.chain === '') ? 'Misc' : atm.chain;
            }


            if(atm.color !== undefined) atm.color = new THREE.Color(atm.color);
            atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);

            // mmcif has pre-assigned structure in mmcifparser.cgi output
            if(type === 'mmdbid' || type === 'align') {
				atm.structure = mmdb_id;
			}

            structureNum = atm.structure;
            chainNum = structureNum + '_' + atm.chain;

            if(chainNum !== prevChainNum) {
                missingResIndex = 0;
                prevResi = 0;
            }

            var oneLetterRes = me.icn3d.residueName2Abbr(atm.resn.substr(0, 3));

            //atm.resi = parseInt(atm.resi); // has to be integer
            atm.resi = atm.ids.r; // corrected for residue insertion code

            // modify resi since MMDB used the same resi as in PDB where resi is not continuous
            // No need to modify mmcif resi
            if(type === 'mmdbid' || type === 'align') {
				// bfactor
				if(type === 'mmdbid') atm.b = (atm.b.length > 0) ? atm.b[0] : 1;

                oldResi = atm.resi;

                if(atm.resi !== prevOldResi && atm.resi !== prevOldResi + 1 && chainMissingResArray[atm.chain] !== undefined && chainMissingResArray[atm.chain][missingResIndex] !== undefined && atm.resi === chainMissingResArray[atm.chain][missingResIndex][1]) {
                    // add missed residues
                    var count = chainMissingResArray[atm.chain][missingResIndex][0];
                    prevResi += count;

                    ++missingResIndex;
                }

                //if(atm.resi !== prevOldResi || molid !== prevMolid) {
                //    atm.resi = prevResi + 1;
				//}
                if(molid !== prevMolid) {
					atm.resi = atm.resi; // don't change the assigned resi
				}
                else if(atm.resi !== prevOldResi) {
                    atm.resi = prevResi + 1;
                }

                else {
                    atm.resi = prevResi;
                }

                prevOldResi = oldResi;
//            }

//            if(type === 'mmdbid' || type === 'align') {
				// set me.mmdbMolidResid2mmdbChainResi
				me.mmdbMolidResid2mmdbChainResi[mmdb_id + '_' + atm.ids.m + '_' + atm.ids.r] = mmdb_id + '_' + atm.chain + '_' + atm.resi;
            }

            // Dachuan's later modification caused this change
/*
            if(type === 'align') {
				atm.coord.x = parseFloat(atm.coord.x);
				atm.coord.y = parseFloat(atm.coord.y);
				atm.coord.z = parseFloat(atm.coord.z);

				for(var i = 0, il = atm.bonds.length; i < il; ++i) {
					atm.bonds[i] = parseInt(atm.bonds[i]);
				}
			}
*/

            pmin.min(atm.coord);
            pmax.max(atm.coord);
            psum.add(atm.coord);

            if (atm.mt === 'p' || atm.mt === 'n')
            {
                if (atm.mt === 'p') {
                  me.icn3d.proteins[serial] = 1;

                  if (atm.name === 'CA') me.icn3d.calphas[serial] = 1;
                  if (atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') me.icn3d.sidechains[serial] = 1;
                }
                else if (atm.mt === 'n') {
                  me.icn3d.nucleotides[serial] = 1;

                  if (atm.name == 'P') me.icn3d.nucleotidesP[serial] = 1;
                }

                me.icn3d.het = false;
            }
            else if (atm.mt === 's') { // solvent
              me.icn3d.water[serial] = 1;

              me.icn3d.het = true;
            }
            else if (atm.mt === 'l') { // ligands and ions
              //if (atm.bonds.length === 0) me.icn3d.ions[serial] = 1;
              if (atm.elem === atm.resn) {
                  me.icn3d.ions[serial] = 1;
              }
              else {
                  me.icn3d.ligands[serial] = 1;
              }

              me.icn3d.het = true;
            }

            if(atm.resn.charAt(0) !== ' ' && atm.resn.charAt(1) === ' ') {
              atm.resn = atm.resn.charAt(0);
            }

            // double check
            if (atm.resn == 'HOH') me.icn3d.water[serial] = 1

            me.icn3d.atoms[serial] = atm;
            me.icn3d.displayAtoms[serial] = 1;
            me.icn3d.highlightAtoms[serial] = 1;

            // chain level
            var chainid = atm.structure + '_' + atm.chain;
            if (me.icn3d.chains[chainid] === undefined) me.icn3d.chains[chainid] = {};
            me.icn3d.chains[chainid][serial] = 1;

            // residue level
            var residueid = atm.structure + '_' + atm.chain + '_' + atm.resi;
            if (me.icn3d.residues[residueid] === undefined) me.icn3d.residues[residueid] = {};
            me.icn3d.residues[residueid][serial] = 1;

            residueNum = chainNum + '_' + atm.resi;

            // different residue
            if(residueNum !== prevResidueNum) {
                // different chain
                if(chainNum !== prevChainNum) {
                    bChainSeqSet = true;

                    if(serial !== 1) {
                        if(me.icn3d.structures[prevStructureNum] === undefined) me.icn3d.structures[prevStructureNum] = [];
                        me.icn3d.structures[prevStructureNum].push(prevChainNum);
                    }
                }
            }

            me.icn3d.residueId2Name[residueid] = oneLetterRes;

            var secondaries = '-';
            if(atm.ss === 'helix') {
                secondaries = 'H';
            }
            else if(atm.ss === 'sheet') {
                secondaries = 'E';
            }
            else if(atm.ss === 'coil') {
                secondaries = 'c';
            }
            else if(!atm.het && me.icn3d.residueColors.hasOwnProperty(atm.resn.toUpperCase()) ) {
                secondaries = 'c';
            }

            me.icn3d.secondaries[atm.structure + '_' + atm.chain + '_' + atm.resi] = secondaries;

            if( atm.resi != prevResi || molid != prevMolid ) { // mmdbid 2por has different molid, same resi
              if(me.icn3d.chainsSeq[chainid] === undefined) {
                  me.icn3d.chainsSeq[chainid] = [];
                  bChainSeqSet = false;
              }
              if(me.icn3d.chainsAnno[chainid] === undefined ) me.icn3d.chainsAnno[chainid] = [];
              if(me.icn3d.chainsAnno[chainid][0] === undefined ) me.icn3d.chainsAnno[chainid][0] = [];
              if(me.icn3d.chainsAnno[chainid][1] === undefined ) me.icn3d.chainsAnno[chainid][1] = [];

              if(me.icn3d.chainsAnnoTitle[chainid] === undefined ) me.icn3d.chainsAnnoTitle[chainid] = [];
              if(me.icn3d.chainsAnnoTitle[chainid][0] === undefined ) me.icn3d.chainsAnnoTitle[chainid][0] = [];
              if(me.icn3d.chainsAnnoTitle[chainid][1] === undefined ) me.icn3d.chainsAnnoTitle[chainid][1] = [];

              // me.icn3d.chainsSeq[chainid][atm.resi - 1] should be defined if everything works
              if( (type === 'mmdbid' || type === 'mmcifid') && bChainSeqSet && me.icn3d.chainsSeq[chainid][atm.resi - 1] !== undefined) {
                  me.icn3d.chainsSeq[chainid][atm.resi - 1].name = oneLetterRes;
                  me.icn3d.chainsAnno[chainid][1][atm.resi - 1] = secondaries;
              }
              else {
                  var resObject = {};
                  resObject.resi = atm.resi;
                  resObject.name = oneLetterRes;

                  var numberStr = '';
                  if(atm.resi % 10 === 0) numberStr = atm.resi.toString();

                  me.icn3d.chainsSeq[chainid].push(resObject);
                  me.icn3d.chainsAnno[chainid][0].push(numberStr);
                  me.icn3d.chainsAnno[chainid][1].push(secondaries);
              }

              me.icn3d.chainsAnnoTitle[chainid][0].push('');
              me.icn3d.chainsAnnoTitle[chainid][1].push('SS');
            }

            prevResi = atm.resi;

            prevStructureNum = structureNum;
            prevChainNum = chainNum;
            prevResidueNum = residueNum;

            prevMolid = molid;
            prevMmdb_id = mmdb_id;
        }

        // remove the reference
        data.atoms = {};

        // add the last residue set
        if(me.icn3d.structures[structureNum] === undefined) me.icn3d.structures[structureNum] = [];
        me.icn3d.structures[structureNum].push(chainNum);

        // update bonds info
        if(type !== 'mmcifid') {
        for (var i in me.icn3d.atoms) {
            var bondLength = (me.icn3d.atoms[i].bonds === undefined) ? 0 : me.icn3d.atoms[i].bonds.length;

            for(var j = 0; j < bondLength; ++j) {
                me.icn3d.atoms[i].bonds[j] = atomid2serial[me.icn3d.atoms[i].bonds[j]];
            }
        }
        }

        me.icn3d.cnt = serial;

        me.icn3d.pmin = pmin;
        me.icn3d.pmax = pmax;
        me.icn3d.maxD = pmax.distanceTo(pmin);
        me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

        if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;
        me.icn3d.oriMaxD = me.icn3d.maxD;
        me.icn3d.oriCenter = me.icn3d.center.clone();

        // set up disulfide bonds
        if(type === 'mmdbid') {
            var disulfideArray = data.disulfides;

            if(disulfideArray !== undefined) {
                for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                    var serial1 = disulfideArray[i][0].ca;
                    var serial2 = disulfideArray[i][1].ca;

                    var atom1 = me.icn3d.atoms[serial1];
                    var atom2 = me.icn3d.atoms[serial2];

                    var resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
                    var resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;

                    me.icn3d.ssbondpoints.push(resid1);
                    me.icn3d.ssbondpoints.push(resid2);
                }
            }
        }
        else if(type === 'mmcifid') {
            var disulfideArray = data.disulfides;

            if(disulfideArray !== undefined) {
                for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                    var resid1 = disulfideArray[i][0];
                    var resid2 = disulfideArray[i][1];

                    me.icn3d.ssbondpoints.push(resid1);
                    me.icn3d.ssbondpoints.push(resid2);
                }
            }
        }

        // set up sequence alignment
        // display the structure right away. load the menus and sequences later
//        setTimeout(function(){
        if(type === 'align' && seqalign !== undefined) {
          //loadSeqAlignment
          var alignedAtoms = {};
          var mmdbid1 = data.aligned_structures[0][0].pdb_id;
          var mmdbid2 = data.aligned_structures[0][1].pdb_id;

          var conservedName1 = mmdbid1 + '_cons', nonConservedName1 = mmdbid1 + '_ncons', notAlignedName1 = mmdbid1 + '_nalign';
          var conservedName2 = mmdbid2 + '_cons', nonConservedName2 = mmdbid2 + '_ncons', notAlignedName2 = mmdbid2 + '_nalign';

          var consHash1 = {}, nconsHash1 = {}, nalignHash1 = {};
          var consHash2 = {}, nconsHash2 = {}, nalignHash2 = {};

          for (var i = 0, il = seqalign.length; i < il; ++i) {
              // first sequence
              var alignData = seqalign[i][0];
              var molid1 = alignData.molecule_id;

              var chain1 = me.icn3d.pdbid_molid2chain[mmdbid1 + '_' + molid1];
              var chainid1 = mmdbid1 + '_' + chain1;

              var id2aligninfo = {};
              var start = alignData.sequence.length, end = -1;
              for(var j = 0, jl = alignData.sequence.length; j < jl; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //var resi = alignData.sequence[j][1];
                  var resi = alignData.sequence[j][0];
                  var resn = (alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
                  // not aligned residues also Uppercase, but italic using css
                  resn = resn.toUpperCase();

                  var aligned = alignData.sequence[j][3]; // 0 or 1

                  if(aligned == 1) {
                      if(j < start) start = j;
                      if(j > end) end = j;
                  }

                  id2aligninfo[j] = {"resi": resi, "resn": resn, "aligned": aligned};
              }

              // second sequence
              alignData = seqalign[i][1];
              var molid2 = alignData.molecule_id;

              var chain2 = me.icn3d.pdbid_molid2chain[mmdbid2 + '_' + molid2];
              var chainid2 = mmdbid2 + '_' + chain2;

              // annoation title for the master seq only
              if(me.icn3d.alignChainsAnnoTitle[chainid1] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][0] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][0] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][1] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][1] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][2] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][2] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][3] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][3] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][4] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][4] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][5] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][5] = [];

              // two annotations without titles
              me.icn3d.alignChainsAnnoTitle[chainid1][0].push("SS");
              me.icn3d.alignChainsAnnoTitle[chainid1][1].push("");
              me.icn3d.alignChainsAnnoTitle[chainid1][2].push("");

              // 2nd chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][3].push(chainid2);
              // master chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][4].push(chainid1);
              // empty line
              me.icn3d.alignChainsAnnoTitle[chainid1][5].push("");

              var alignIndex = 1;
              //for(var j = 0, jl = alignData.sseq.length; j < jl; ++j) {
              for(var j = start; j <= end; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //var resi = alignData.sequence[j][1];
                  var resi = alignData.sequence[j][0];
                  var resn = (alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
                  // not aligned residues also Uppercase, but italic using css
                  resn = resn.toUpperCase();

                  var aligned = id2aligninfo[j].aligned + alignData.sequence[j][3]; // 0 or 2

                  var color, classname;
                  if(aligned === 2) { // aligned
                      if(id2aligninfo[j].resn === resn) {
                          color = '#FF0000';
                          classname = 'icn3d-cons';

                          consHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          consHash2[chainid2 + '_' + resi] = 1;
                      }
                      else {
                          color = '#0000FF';
                          classname = 'icn3d-ncons';

                          nconsHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          nconsHash2[chainid2 + '_' + resi] = 1;
                      }

                      // expensive and thus remove
                      //alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                      //alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid2 + '_' + resi]);
                  }
                  else {
                      color = me.GREY8;
                      classname = 'icn3d-nalign';

                      nalignHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                      nalignHash2[chainid2 + '_' + resi] = 1;
                  }

                  // chain1
                  if(me.icn3d.alignChainsSeq[chainid1] === undefined) me.icn3d.alignChainsSeq[chainid1] = [];

                  var resObject = {};
                  resObject.mmdbid = mmdbid1;
                  resObject.chain = chain1;
                  resObject.resi = id2aligninfo[j].resi;
                  // resi will be empty if there is no coordinates
                  resObject.resn = (resObject.resi === '' || classname === 'icn3d-nalign') ? id2aligninfo[j].resn.toLowerCase() : id2aligninfo[j].resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (resObject.resi === '') ? me.GREYC : color;
                  resObject.class = classname;

                  me.icn3d.alignChainsSeq[chainid1].push(resObject);

                  if(id2aligninfo[j].resi !== '') {
                      if(me.icn3d.alignChains[chainid1] === undefined) me.icn3d.alignChains[chainid1] = {};
                      $.extend(me.icn3d.alignChains[chainid1], me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi] );
                  }

                  // chain2
                  if(me.icn3d.alignChainsSeq[chainid2] === undefined) me.icn3d.alignChainsSeq[chainid2] = [];

                  resObject = {};
                  resObject.mmdbid = mmdbid2;
                  resObject.chain = chain2;
                  resObject.resi = resi;
                  // resi will be empty if there is no coordinates
                  resObject.resn = (resObject.resi === '' || classname === 'icn3d-nalign') ? resn.toLowerCase() : resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (resObject.resi === '') ? me.GREYC : color;
                  resObject.class = classname;

                  me.icn3d.alignChainsSeq[chainid2].push(resObject);

                  if(resObject.resi !== '') {
                      if(me.icn3d.alignChains[chainid2] === undefined) me.icn3d.alignChains[chainid2] = {};
                      $.extend(me.icn3d.alignChains[chainid2], me.icn3d.residues[chainid2 + '_' + resi] );
                  }

                  // annotation is for the master seq only
                  if(me.icn3d.alignChainsAnno[chainid1] === undefined ) me.icn3d.alignChainsAnno[chainid1] = [];
                  if(me.icn3d.alignChainsAnno[chainid1][0] === undefined ) me.icn3d.alignChainsAnno[chainid1][0] = [];
                  if(me.icn3d.alignChainsAnno[chainid1][1] === undefined ) me.icn3d.alignChainsAnno[chainid1][1] = [];
                  if(me.icn3d.alignChainsAnno[chainid1][2] === undefined ) me.icn3d.alignChainsAnno[chainid1][2] = [];
                  if(j === start) {
                      // empty line
                      // 2nd chain title
                      if(me.icn3d.alignChainsAnno[chainid1][3] === undefined ) me.icn3d.alignChainsAnno[chainid1][3] = [];
                      // master chain title
                      if(me.icn3d.alignChainsAnno[chainid1][4] === undefined ) me.icn3d.alignChainsAnno[chainid1][4] = [];
                      // empty line
                      if(me.icn3d.alignChainsAnno[chainid1][5] === undefined ) me.icn3d.alignChainsAnno[chainid1][5] = [];

                      me.icn3d.alignChainsAnno[chainid1][3].push(me.icn3d.pdbid_chain2title[chainid2]);
                      me.icn3d.alignChainsAnno[chainid1][4].push(me.icn3d.pdbid_chain2title[chainid1]);
                      me.icn3d.alignChainsAnno[chainid1][5].push('');
                    }

                  var residueid = chainid1 + '_' + id2aligninfo[j].resi;
                  var ss = me.icn3d.secondaries[residueid];
                  if(ss !== undefined) {
                      me.icn3d.alignChainsAnno[chainid1][0].push(ss);
                  }
                  else {
                      me.icn3d.alignChainsAnno[chainid1][0].push('-');
                  }

                  var symbol = '.';
                  if(alignIndex % 5 === 0) symbol = '*';
                  if(alignIndex % 10 === 0) symbol = '|';
                  me.icn3d.alignChainsAnno[chainid1][1].push(symbol); // symbol: | for 10th, * for 5th, . for rest

                  var numberStr = '';
                  if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
                  me.icn3d.alignChainsAnno[chainid1][2].push(numberStr); // symbol: 10, 20, etc, empty for rest

                  ++alignIndex;
              } // end for(var j
          } // end for(var i

          if(me.bFullUi) {
            me.selectResidueList(consHash1, conservedName1, conservedName1);
            me.selectResidueList(consHash2, conservedName2, conservedName2);

            me.selectResidueList(nconsHash1, nonConservedName1, nonConservedName1);
            me.selectResidueList(nconsHash2, nonConservedName2, nonConservedName2);

            me.selectResidueList(nalignHash1, notAlignedName1, notAlignedName1);
            me.selectResidueList(nalignHash2, notAlignedName2, notAlignedName2);
          }

/*
          // assign grey color to all unaligned atoms
          var color = new THREE.Color(me.GREYB);
          for(var i in me.icn3d.atoms) {
              if(!alignedAtoms.hasOwnProperty(i)) {
                  me.icn3d.atoms[i].color = color;
              }
          }
*/
          seqalign = {};
        } // if(align

        me.showTitle();

        data = {};
//        }, 0); // execute later
    };
