/*! simple_ui.js
 * @author Jiyao Wang
 * simple UI of iCn3D
 */

var show3DStructure = function(cfg) {
    var divid = cfg.divid;
    var pre = divid + "_";

    var residueWidth = 30;

    iCn3D.prototype.showPicking = function(atom) {
      this.removeHighlightObjects();

      this.highlightAtoms = {};
      if(this.picking === 1) {
          this.highlightAtoms[atom.serial] = 1;
       }
      else if(this.picking === 2) {
        var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        this.highlightAtoms = this.residues[residueid];
      }

      this.addHighlightObjects();

      //var text = '#' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
      var residueText = '.' + atom.chain + ':' + atom.resi;

      var text;
      if(cfg.cid !== undefined) {
          text = atom.name;
      }
      else {
          text = residueText + '@' + atom.name;
      }

      var labels = [];
      var label = {};
      label.position = atom.coord;

      if(this.picking === 1) {
        label.text = text;
      }
      else if(this.picking === 2) {
        label.text = residueText;
      }

      labels.push(label);

      //http://www.johannes-raida.de/tutorials/three.js/tutorial13/tutorial13.htm
      this.createLabelRepresentation(labels);
    };

    // set up Tools =======================================================
    var html = "";

    html += "<div id='" + pre + "viewer' style='position:relative; width:100%; height:100%;'>";
    html += "<!--div style='height:18px'></div-->";

    html += "<div id='" + pre + "wait' style='width:100%; height: 100%; background-color: rgba(0,0,0, 0.8);'><div style='padding-top:25%; text-align: center; font-size: 2em; color: #FFFF00;'>Loading the structure...</div></div>";

    html += "<canvas id='" + pre + "canvas' style='width:100%; height:100%;'>Your browser does not support WebGL.</canvas>";

    html += "<div class='tabBox' id='" + pre + "toolbox'>";
    html += "<span class='bottomTab'>Tools</span>";
    html += "<div class='insideTab' style='overflow: auto;'>";
    html += "<form action='' id='" + pre + "paraform' method='POST'>";

    if(cfg.cid === undefined) {
        html += "<div class='option'>";
        html += "<b>&nbsp;&nbsp;Secondary Structure</b>";
        html += "<select id='" + pre + "secondary'>";
        html += "<option value='ribbon' selected>ribbon</option>";
        html += "<option value='strand'>strand</option>";
        html += "<option value='cylinder & plate'>cylinder and plate</option>";
        html += "<option value='C alpha trace'>C alpha trace</option>";
        html += "<option value='B factor tube'>B factor tube</option>";
        html += "<option value='lines'>lines</option>";
        html += "<option value='stick'>stick</option>";
        html += "<option value='ball & stick'>ball and stick</option>";
        html += "<option value='sphere'>sphere</option>";
        html += "<option value='nothing'>hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='option'>";
        html += "<b>&nbsp;&nbsp;Nucleotides</b>";
        html += "<select id='" + pre + "nucleotides'>";
        html += "<option value='nucleotide cartoon'>cartoon</option>";
        html += "<option value='phosphorus trace' selected>phosphorus trace</option>";
        html += "<option value='lines'>lines</option>";
        html += "<option value='stick'>stick</option>";
        html += "<option value='ball & stick'>ball and stick</option>";
        html += "<option value='sphere'>sphere</option>";
        html += "<option value='nothing'>hide</option>";
        html += "</select>";
        html += "</div>";
    }

    html += "<div class='option'>";
    html += "<b>&nbsp;&nbsp;Ligands</b>";
    html += "<select id='" + pre + "ligands'>";
    html += "<option value='lines'>lines</option>";
    html += "<option value='stick' selected>stick</option>";
    html += "<option value='ball & stick'>ball and stick</option>";
    html += "<option value='sphere'>sphere</option>";
    html += "<option value='nothing'>hide</option>";
    html += "</select>";
    html += "</div>";

    html += "<div class='option'>";
    html += "<b>&nbsp;&nbsp;Color</b>";
    html += "<select id='" + pre + "color'>";
    if(cfg.cid === undefined) {
        html += "<option value='spectrum' selected>spectrum</option>";
        html += "<option value='chain'>chain</option>";
        html += "<option value='secondary structure'>secondary structure</option>";
        html += "<option value='B factor'>B factor</option>";
        html += "<option value='residue'>residue</option>";
        html += "<option value='polarity'>polarity</option>";
    }
    html += "<option value='atom'>atom</option>";
    html += "<option value='red'>red</option>";
    html += "<option value='green'>green</option>";
    html += "<option value='blue'>blue</option>";
    html += "<option value='magenta'>magenta</option>";
    html += "<option value='yellow'>yellow</option>";
    html += "<option value='cyan'>cyan</option>";
    html += "</select>";
    html += "</div>";

    html += "<div class='option'>";
    html += "&nbsp;&nbsp;<button class='enablepick'>Picking</button> <button class='disablepick'>No Picking</button>";
    html += "</div>";

    html += "<div class='option'>";
    html += "&nbsp;&nbsp;<button id='" + pre + "reset'>Reset</button>";
    html += "</div>";

    html += "</form>";
    html += "</div>";
    html += "</div>";

    html += "</div>";

    html += "<!-- dialog will not be part of the form -->";
    html += "<div id='" + pre + "allselections' class='hidden'>";

    // filter for large structure
    html += "<div id='" + pre + "dl_filter' style='overflow:auto; position:relative'>";
    //html += "  <div>This large structure contains more than 50,000 atoms. Please select some structures/chains below to display.</div>";
    //html += "  <input style='position:absolute; top:13px; left:20px;' type='checkbox' id='" + pre + "filter_ckbx_all'/>";
    html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
    html += "<button id='" + pre + "label_3d_diagram' style='margin-left:10px;'><span style='white-space:nowrap'><b>Show Labels</b></span></button></div>";
    html += "  <div id='" + pre + "dl_filter_table' class='box'>";
    html += "  </div>";
    html += "</div>";

    html += "</div>";

    $( "#" + divid).html(html);

    var width = window.innerWidth, height = window.innerHeight;

    if(cfg.width.toString().indexOf('%') !== -1) {
      width = width * (cfg.width).substr(0, cfg.width.toString().indexOf('%')) / 100.0 - 20;
    }
    else {
      width = cfg.width;
    }

    if(cfg.height.toString().indexOf('%') !== -1) {
      height = height * (cfg.height).substr(0, cfg.height.toString().indexOf('%')) / 100.0 - 20;
    }
    else {
      height = cfg.height;
    }

    $("#" + pre + "viewer").width(width).height(height);
    $("#" + pre + "canvas").width(width).height(height);

    if(parseInt(width) <= 200) {
      $("#" + pre + "toolbox").hide();
    }
    // end set up Tools =======================================================

    // javascript =======================================================
    $('.bottomTab').click(function (e) {
       var height = $(".insideTab").height();
       if(height === 0) {
         $(".insideTab").height(200);
       }
       else {
         $(".insideTab").height(0);
       }
    });

    var icn3d = new iCn3D(pre + 'canvas');

    if(cfg.bCalphaOnly !== undefined) icn3d.bCalphaOnly = cfg.bCalphaOnly;

    var options = {};
    options['camera']             = 'perspective';        //perspective, orthographic
    options['background']         = 'black';              //black, grey, white
    options['color']              = 'spectrum';           //spectrum, chain, secondary structure, B factor, residue, polarity, atom
    options['sidechains']         = 'nothing';            //lines, stick, ball & stick, sphere, nothing
    options['secondary']          = 'ribbon';             // ribbon, strand, cylinder & plate, C alpha trace, B factor tube, lines, stick, ball & stick, sphere, nothing
    options['surface']            = 'nothing';            //Van der Waals surface, solvent excluded surface, solvent accessible surface, molecular surface, nothing
    options['opacity']            = '0.8';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    options['wireframe']          = 'no';                 //yes, no
    options['ligands']            = 'stick';              //lines, stick, ball & stick, sphere
    options['water']              = 'nothing';            //sphere, dot, nothing
    options['ions']               = 'sphere';             //sphere, dot, nothing
    options['hbonds']             = 'no';                 //yes, no
    options['labels']             = 'no';                 //yes, no
    options['lines']              = 'no';                 //yes, no
    options['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    options['axis']               = 'no';                 //yes, no
    options['picking']            = 'residue';            //no, atom, residue
    options['nucleotides']        = 'phosphorus trace';   //nucleotide cartoon, phosphorus trace, lines, stick, ball & stick, sphere, nothing
    options['surfaceregion']      = 'nothing';            //nothing, all, sphere

    if(cfg.cid !== undefined) {
        options['picking'] = 'atom';
    }

    icn3d.cloneHash(options, icn3d.options);

    loadStructure();

    function loadStructure() {
        if(cfg.pdbid !== undefined) {
             var pdbid = cfg.pdbid.toLowerCase(); // http://www.rcsb.org/pdb/files/1gpk.pdb only allow lower case

             downloadPdb(pdbid);
        }
        else if(cfg.mmdbid !== undefined) {
            downloadMmdb(cfg.mmdbid);
        }
        else if(cfg.gi !== undefined) {
            var mmdbid;

            // get mmdbid from gi
            var uri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=protein&db=structure&linkname=protein_structure&id=" + cfg.gi;

           $.ajax({
              url: uri,
              dataType: 'text',
              cache: true,
              success: function(data) {
                if(data.indexOf('<Link>') === -1) {
                  alert("There are no MMDB IDs available for the gi " + cfg.gi);
                }
                else {
                  var linkStr = data.substr(data.indexOf('<Link>'));
                  var start = linkStr.indexOf('<Id>');
                  var end = linkStr.indexOf('</Id>');
                  var mmdbid = linkStr.substr(start + 4, end - start - 4);

                  downloadMmdb(mmdbid);
                }
              }
           });
        }
        else if(cfg.cid !== undefined) {
            downloadCid(cfg.cid);
        }
        else if(cfg.mmcif !== undefined) {
            downloadMmcif(cfg.mmcif);
        }
        else if(cfg.align !== undefined) {
            downloadAlignment(cfg.align);
        }
        else {
            alert("Please input a gi, MMDB ID, PDB ID, CID, or mmCIF...");
        }
    }

    function downloadPdb(pdbid) {
       //var uri = "http://www.rcsb.org/pdb/files/" + pdbid + ".pdb";
       var uri = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?pdbid=" + pdbid;

       icn3d.bCid = undefined;

       var nameLevel1 = "Molecule";
       var nameLevel2 = "Chain";

       $.ajax({
          url: uri,
          dataType: 'text',
          cache: true,
          beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); },
          complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); },
          success: function(data) {
            icn3d.loadPDB(data);

            icn3d.inputid.idtype = "pdbid";
            icn3d.inputid.id = pdbid;

            icn3d.setAtomStyleByOptions(options);
            icn3d.setColorByOptions(options, icn3d.atoms);

            icn3d.draw(options);

            if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');
          }
       });
    }

    function rotateStructure(direction) {
        if(icn3d.bStopRotate) return false;

        if(direction === 'left') {
          icn3d.rotateLeft(5);
        }
        else if(direction === 'right') {
          icn3d.rotateRight(5);
        }
        else if(direction === 'up') {
          icn3d.rotateUp(5);
        }
        else if(direction === 'down') {
          icn3d.rotateDown(5);
        }
        else {
          return false;
        }

        setTimeout(function(){ rotateStructure(direction); }, 1000);
    }

    function downloadMmcif(mmcif) {
        var url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?mmcif=" + mmcif;
        icn3d.bCid = undefined;

       $.ajax({
          url: url,
          dataType: "jsonp",
          cache: true,
          //async: false, // make it sync so that the structure is always there first, expecially when loading state with many steps
          beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); $("#" + pre + "log").hide();},
          complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); $("#" + pre + "log").show(); },
          success: function(data) {
            if (data.atoms !== undefined)
            {
                loadAtomDataIn(data, data.mmcif, 'mmcif');

                icn3d.inputid.idtype = "mmcif";
                icn3d.inputid.id = mmcif;

                icn3d.setAtomStyleByOptions(options);
                icn3d.setColorByOptions(options, icn3d.atoms);

                icn3d.draw(options);

                if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');
            }
            else {
                alert("invalid atoms data.");
                return false;
            }
          }
        });
    }

    function downloadAlignment(align) {
       var url = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c&w3d&ids=" + align;
       var url2 = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c1&d&ids=" + align;
       if(cfg.inpara !== undefined) {
         url += cfg.inpara;
         url2 += cfg.inpara;
       }

       icn3d.bCid = undefined;

       // define for 'align' only
       icn3d.pdbid_chain2title = {};

       var request = $.ajax({
          url: url2,
          //dataType: 'json',
          dataType: 'jsonp',
          //jsonp: 'jpf',
          cache: true,
          beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); },
          complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); }
       });

       var seqalign;

       var chained = request.then(function( data ) {
           seqalign = data.seqalign;

           var index = 0;
           for(var mmdbid in data) {
               if(index < 2) {
                   var pdbid = data[mmdbid].pdbid;

                   var molecule = data[mmdbid].molecule;
                   for(var molname in molecule) {
                       var chain = molecule[molname].chain;
                       icn3d.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                   }
               }

               ++index;
           }

           return $.ajax({
              url: url,
              dataType: 'jsonp',
              //jsonp: 'jpf',
              cache: true,
              beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); },
              complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); }
           });
       });

       chained.done(function( data ) {
            if (data.atoms !== undefined)
            {
                loadAtomDataIn(data, undefined, 'align', seqalign);

                icn3d.inputid.idtype = "alignment";
                icn3d.inputid.id = align;

                icn3d.setAtomStyleByOptions(options);
                // use the original color from cgi output
                icn3d.setColorByOptions(options, icn3d.atoms, true);

                icn3d.draw(options);

                if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');
            }
            else {
                alert('invalid atoms data.');
                return false;
            }
        });
    }

    function downloadCid(cid) {
       var uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/SDF?record_type=3d";
       icn3d.bCid = true;

       $.ajax({
          url: uri,
          dataType: 'text',
          cache: true,
          beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); $("#" + pre + "log").hide();},
          complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); $("#" + pre + "log").show(); },
          success: function(data) {
            var bResult = loadCidAtomData(data);

            if(!bResult) {
              alert('The SDF of CID ' + cid + ' has the wrong format...');
            }
            else {
              icn3d.inputid.idtype = "cid";
              icn3d.inputid.id = cid;

              icn3d.setAtomStyleByOptions(options);
              icn3d.setColorByOptions(options, icn3d.atoms);

              icn3d.draw(options);

              if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');
            }
          }
       })
       .fail(function() {
           alert( "This CID may not have 3D structure..." );
       });
    }

    function loadCidAtomData(data) {
        var lines = data.split('\n');
        if (lines.length < 4) return false;

        icn3d.init();

        var structure = '1';
        var chain = '1';
        var resi = '1';
        var resn = 'LIG';

        var moleculeNum = structure;
        var chainNum = structure + '_' + chain;
        var residueNum = chainNum + '_' + resi;

        var atomCount = parseInt(lines[3].substr(0, 3));
        if (isNaN(atomCount) || atomCount <= 0) return false;

        var bondCount = parseInt(lines[3].substr(3, 3));
        var offset = 4;
        if (lines.length < offset + atomCount + bondCount) return false;

        var start = 0;
        var end = atomCount;
        var i, line;
        var AtomHash = {};
        for (i = start; i < end; i++) {
            line = lines[offset];
            offset++;

            var serial = i;

            var x = parseFloat(line.substr(0, 10));
            var y = parseFloat(line.substr(10, 10));
            var z = parseFloat(line.substr(20, 10));
            var coord = new THREE.Vector3(x, y, z);

            var name = line.substr(31, 3).replace(/ /g, "");

            var atomDetails = {
                het: true,              // optional, used to determine ligands, water, ions, etc
                serial: serial,         // required, unique atom id
                name: name,             // required, atom name
                resn: resn,             // optional, used to determine protein or nucleotide
                structure: structure,   // optional, used to identify structure
                chain: chain,           // optional, used to identify chain
                resi: resi,             // optional, used to identify residue ID
                coord: coord,           // required, used to draw 3D shape
                b: 0,                   // optional, used to draw B-factor tube
                elem: name,             // optional, used to determine hydrogen bond
                bonds: [],              // required, used to connect atoms
                ss: 'coil',             // optional, used to show secondary structures
                ssbegin: false,         // optional, used to show the beginning of secondary structures
                ssend: false,           // optional, used to show the end of secondary structures

                bondOrder: []           // optional, specific for chemicals
            };

            icn3d.atoms[serial] = atomDetails;
            AtomHash[serial] = 1;
        }

        icn3d.displayAtoms = AtomHash;
        icn3d.highlightAtoms= AtomHash;
        icn3d.structures[moleculeNum] = AtomHash;
        icn3d.chains[chainNum] = AtomHash;
        icn3d.residues[residueNum] = AtomHash;

        icn3d.residueId2Name[residueNum] = resn;

        if(icn3d.chainsSeq[chainNum] === undefined) icn3d.chainsSeq[chainNum] = [];
        if(icn3d.chainsAnno[chainNum] === undefined ) icn3d.chainsAnno[chainNum] = [];
        if(icn3d.chainsAnno[chainNum][0] === undefined ) icn3d.chainsAnno[chainNum][0] = [];

        icn3d.chainsSeq[chainNum].push(resn);
        icn3d.chainsAnno[chainNum][0].push(resi);

        for (i = 0; i < bondCount; i++) {
            line = lines[offset];
            offset++;
            var from = parseInt(line.substr(0, 3)) - 1 + start;
            var to = parseInt(line.substr(3, 3)) - 1 + start;
            var order = parseInt(line.substr(6, 3));
            icn3d.atoms[from].bonds.push(to);
            icn3d.atoms[from].bondOrder.push(order);
            icn3d.atoms[to].bonds.push(from);
            icn3d.atoms[to].bondOrder.push(order);
        }

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for (var i in icn3d.atoms) {
            var atom = icn3d.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(atom.het) {
              if($.inArray(atom.elem, icn3d.ionsArray) !== -1) {
                icn3d.ions[atom.serial] = 1;
              }
              else {
                icn3d.ligands[atom.serial] = 1;
              }
            }
        } // end of for


        icn3d.pmin = pmin;
        icn3d.pmax = pmax;

        icn3d.cnt = cnt;

        icn3d.maxD = icn3d.pmax.distanceTo(icn3d.pmin);
        icn3d.center = psum.multiplyScalar(1.0 / icn3d.cnt);

        if (icn3d.maxD < 25) icn3d.maxD = 25;

        return true;
    }

    function downloadMmdb(mmdbid) {
       var url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&uid=" + mmdbid;
       icn3d.bCid = undefined;

       if(cfg.inpara !== undefined) {
         url += cfg.inpara;
       }

       $.ajax({
          url: url,
          dataType: 'jsonp',
          cache: true,
          beforeSend: function() { $("#" + pre + "wait").show(); $("#" + pre + "canvas").hide(); },
          complete: function() { $("#" + pre + "wait").hide(); $("#" + pre + "canvas").show(); },
          success: function(data) {
            if ((cfg.inpara !== undefined && cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= data.threshold && data.atoms !== undefined) ) {
                // small structure with all atoms
                var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
                loadAtomDataIn(data, id, 'mmdbid');

                icn3d.inputid.idtype = "mmdbid";
                icn3d.inputid.id = id;

                icn3d.setAtomStyleByOptions(options);
                // use the original color from cgi output
                icn3d.setColorByOptions(options, icn3d.atoms, true);

                icn3d.draw(options);

                if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');
            }

            if(cfg.inpara !== undefined && cfg.inpara.indexOf('mols=') == -1 && data.atomcount > data.threshold && data.molid2rescount !== undefined) {
                var labelsize = 40;

                // large struture with helix/brick, phosphorus, and ligand info
                icn3d.bSSOnly = true;

                // load atom info
                var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
                loadAtomDataIn(data, id, 'mmdbid');

                icn3d.inputid.idtype = "mmdbid";
                icn3d.inputid.id = id;

                options['nucleotides'] = 'phosphorus lines';

                //options['color'] = 'spectrum';

                icn3d.setAtomStyleByOptions(options);
                // use the original color from cgi output
                icn3d.setColorByOptions(options, icn3d.atoms, true);

                var molid2rescount = data.molid2rescount;
                var molid2color = {}, chain2molid = {}, molid2chain = {};

                var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

                var index = 1;
                for(var i in molid2rescount) {
                  var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
                  html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + pre + "filter_ckbx' value='" + i + "'/></td><td align='center'>" + index + "</td><td align='center'>" + molid2rescount[i].chain + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

                  molid2color[i] = color;
                  var chain = id + '_' + molid2rescount[i].chain;
                  chain2molid[chain] = i;
                  molid2chain[i] = chain;
                  ++index;
                }

                if(Object.keys(icn3d.ligands).length > 0) {
                  html += "<tr><td><input type='checkbox' name='" + pre + "filter_ckbx' value='ligands'/></td><td align='center'>" + index + "</td><td align='center'>Ligands</td><td align='center'>" + Object.keys(icn3d.ligands).length + " atoms</td></tr>";
                }

                html += "</table>";

                 // add labels for each RNA/DNA molecule
                 // hash of molid to label object
                 var labels = {};

                 for(var i in icn3d.chains) {
                     var label = {}; // Each label contains 'position', 'text', 'color', 'background'

                     var position = icn3d.centerAtoms(icn3d.hash2Atoms(icn3d.chains[i]));
                     label.position = position;

                     var chain = i.substr(i.indexOf('_') + 1);
                     label.text = chain;
                     label.size = labelsize;
                     label.color = molid2color[chain2molid[i]];
                     label.background = "#FFFFFF";

                     labels[chain2molid[i]] = label;
                 }

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
                if(icn3d.cnt !== 0) {
                    var pmin = icn3d.pmin;
                    var pmax = icn3d.pmax;
                    var psum = icn3d.center.multiplyScalar(icn3d.cnt);
                    var cnt = icn3d.cnt;
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


                     // add labels for each protein molecule
                     var label = {}; // Each label contains 'position', 'text', 'color', 'background'

                     var position = new THREE.Vector3();
                     position.x = centerMolid.x;
                     position.y = centerMolid.y;
                     position.z = centerMolid.z;

                     label.position = position;

                     var chain = molid2chain[i];
                     label.text = chain.substr(chain.indexOf('_') + 1);
                     label.size = labelsize;
                     label.color = molid2color[i];
                     label.background = "#FFFFFF";

                     labels[i] = label;
                }
                icn3d.maxD = pmax.distanceTo(pmin);
                icn3d.center = psum.multiplyScalar(1.0 / cnt);

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

                // draw labels
                // there might be too many labels
                //options['labels'] = 'add labels';
                icn3d.savedLabels = labels;

                icn3d.molid2ss = molid2ss;
                icn3d.molid2color = molid2color;

                icn3d.draw(options);

                if(cfg.rotate !== undefined && cfg.rotate) rotateStructure('right');

                // show the dialog to select structures
                $( "#" + pre + "dl_filter_table" ).html(html);

                var title = "Select chains to display";

                var width = 250, height =  (/Mac/i.test(navigator.userAgent) && ! /iPhone|iPad|iPod/i.test(navigator.userAgent)) ? 'auto' : 200;

                var position = { my: "left top", at: "left+10 top+93", of: "#" + pre + "canvas", collision: "none" };

                window.dialog = $( "#" + pre + "dl_filter" ).dialog({
                  autoOpen: true,
                  title: title,
                  height: height,
                  width: width,
                  modal: false,
                  position: position
                });

                $(".ui-dialog .ui-button span")
                  .removeClass("ui-icon-closethick")
                  .addClass("ui-icon-close");

            }

            if(data.atoms === undefined && data.molid2rescount === undefined) {
                alert('invalid MMDB data.');
                return false;
            }
          }
        });
    }

    function loadAtomDataIn(data, id, type, seqalign) {
        icn3d.init();

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();

        var atoms = data.atoms;

        var serial = 0;
        var prevResi = 0;

        var serial2structure = {}; // for "align" only
        var mmdbid2pdbid = {}; // for "align" only

        if(type === 'align') {
          //serial2structure
          for (var i = 0, il = data.aligned_structures.length; i < il; ++i) {
              var structure = data.aligned_structures[i];
              for(var j = structure.range[0]; j <= structure.range[1]; ++j) {
                  var pdbidTmp = structure.pdbid;
                  var mmdbidTmp = structure.mmdbid;
                  serial2structure[j] = pdbidTmp.toString();
                  mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
              }
          }
        }

        var molid2chain = {}; // for "mmdbid"
        var pdbid_molid2chain = {}; // for "align"
        if(type === 'mmdbid' || type === 'align') {
          //molid2chain
          if(type === 'mmdbid') {
              if(data.molid2chain !== undefined) {
                  for (var molid in data.molid2chain) {
                      molid2chain[molid] = data.molid2chain[molid].chain;
                  }
              }
          }
          else if(type === 'align') {
              if(data.molid2chain !== undefined) {
                  for (var mmdbid in data.molid2chain) {
                    for (var molid in data.molid2chain[mmdbid]) {
                      pdbid_molid2chain[mmdbid2pdbid[mmdbid] + '_' + molid] = data.molid2chain[mmdbid][molid].chain;
                      }
                  }
              }
          }
        }

        var atomid2serial = {};
        for (var i in atoms) {
            ++serial;

            atomid2serial[i] = serial;

            var atm = atoms[i];
            atm.serial = serial;

            var mmdb_id;

            if(type === 'mmdbid' || type === 'mmcif') {
              mmdb_id = id; // here mmdb_id is pdbid or mmcif id
            }
            else if(type === 'align') {
              mmdb_id = serial2structure[serial]; // here mmdb_id is pdbid
            }

            if(atm.chain === undefined && (type === 'mmdbid' || type === 'align')) {
                if(type === 'mmdbid') {
                  var molid = atm.ids.m;
                  atm.chain = (molid2chain[molid] === undefined) ? '?' : molid2chain[molid];
                }
                else if(type === 'align') {
                  var molid = atm.ids.m;
                  atm.chain = (pdbid_molid2chain[mmdb_id + '_' + molid] === undefined) ? '?' : pdbid_molid2chain[mmdb_id + '_' + molid];
                }
            }
            else {
              atm.chain = (atm.chain === '') ? '?' : atm.chain;
            }

            atm.resi = parseInt(atm.resi); // has to be integer

            if(atm.color !== undefined) atm.color = new THREE.Color(atm.color);
            atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);

            // mmcif has pre-assigned structure in mmcifparser.cgi output
            if(type === 'mmdbid' || type === 'align') {
                atm.structure = mmdb_id;
            }

            pmin.min(atm.coord);
            pmax.max(atm.coord);
            psum.add(atm.coord);

            if (atm.mt === 'p' || atm.mt === 'n')
            {
                //icn3d.proteinsnucleotides[serial] = 1;
                if (atm.mt === 'p') {
                  icn3d.proteins[serial] = 1;

                  if (atm.name === 'CA') icn3d.calphas[serial] = 1;
                }
                else if (atm.mt === 'n') {
                  icn3d.nucleotides[serial] = 1;

                  if (atm.name == 'P') icn3d.nucleotidesP[serial] = 1;
                }

                icn3d.het = false;
            }
            else if (atm.mt === 's') { // solvent
              icn3d.water[serial] = 1;

              icn3d.het = true;
            }
            else if (atm.mt === 'l') { // ligands and ions
              icn3d.ligands[serial] = 1;

              if (atm.bonds.length === 0) icn3d.ions[serial] = 1;

              icn3d.het = true;
            }

            // double check
            if (atm.resn == 'HOH') icn3d.water[serial] = 1

            icn3d.atoms[serial] = atm;
            icn3d.displayAtoms[serial] = 1;
            icn3d.highlightAtoms[serial] = 1;

            // structure level
            if (icn3d.structures[mmdb_id] === undefined) icn3d.structures[mmdb_id] = {};
            icn3d.structures[mmdb_id][serial] = 1;

            // chain level
            var chainid = atm.structure + '_' + atm.chain;
            if (icn3d.chains[chainid] === undefined) icn3d.chains[chainid] = {};
            icn3d.chains[chainid][serial] = 1;

            // residue level
            var residueid = atm.structure + '_' + atm.chain + '_' + atm.resi;
            if (icn3d.residues[residueid] === undefined) icn3d.residues[residueid] = {};
            icn3d.residues[residueid][serial] = 1;

            var oneLetterRes = icn3d.residueName2Abbr(atm.resn.substr(0, 3));

            icn3d.residueId2Name[residueid] = oneLetterRes;

            if(atm.resi != prevResi) {
              if(icn3d.chainsSeq[chainid] === undefined) icn3d.chainsSeq[chainid] = [];
              if(icn3d.chainsAnno[chainid] === undefined ) icn3d.chainsAnno[chainid] = [];
              if(icn3d.chainsAnno[chainid][0] === undefined ) icn3d.chainsAnno[chainid][0] = [];
                if(icn3d.chainsAnnoTitle[chainid] === undefined ) icn3d.chainsAnnoTitle[chainid] = [];
                if(icn3d.chainsAnnoTitle[chainid][0] === undefined ) icn3d.chainsAnnoTitle[chainid][0] = [];

              icn3d.chainsSeq[chainid].push(oneLetterRes);
              icn3d.chainsAnno[chainid][0].push(atm.resi);
              icn3d.chainsAnnoTitle[chainid][0].push('');

              if(type === 'mmdbid' || type === 'align') {
                    icn3d.chainsColor[chainid] = atm.color;
              }
            }

            prevResi = atm.resi;
        }

        // update bonds info
        if(type !== 'mmcif') {
        for (var i in icn3d.atoms) {
            var bondLength = (icn3d.atoms[i].bonds === undefined) ? 0 : icn3d.atoms[i].bonds.length;

            for(var j = 0; j < bondLength; ++j) {
                icn3d.atoms[i].bonds[j] = atomid2serial[icn3d.atoms[i].bonds[j]];
            }
        }
        }

        icn3d.cnt = serial;

        icn3d.pmin = pmin;
        icn3d.pmax = pmax;
        icn3d.maxD = pmax.distanceTo(pmin);
        icn3d.center = psum.multiplyScalar(1.0 / icn3d.cnt);

        if (icn3d.maxD < 25) icn3d.maxD = 25;

        // set up sequence alignment
        if(type === 'align' && seqalign !== undefined) {
          //loadSeqAlignment
          for (var i = 0, il = seqalign.length; i < il; ++i) {
              // first sequence
              var alignData = seqalign[i][0];
              var mmdbid1 = data.aligned_structures[0].pdbid;
              var molid1 = alignData.mid;

              var chain1 = pdbid_molid2chain[mmdbid1 + '_' + molid1];
              var chainid1 = mmdbid1 + '_' + chain1;

              var id2aligninfo = {};
              var start = alignData.mseq.length, end = -1;
              for(var j = 0, jl = alignData.mseq.length; j < jl; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //var id = alignData.mseq[j][0];
                  var resi = alignData.mseq[j][1];
                  var resn = (alignData.mseq[j][2] === '~') ? '-' : alignData.mseq[j][2];
                  var aligned = alignData.mseq[j][3]; // 0 or 1

                  if(aligned == 1) {
                      if(j < start) start = j;
                      if(j > end) end = j;
                  }

                  id2aligninfo[j] = {"resi": resi, "resn": resn, "aligned": aligned};
              }

              // second sequence
              alignData = seqalign[i][1];
              var mmdbid2 = data.aligned_structures[1].pdbid;
              var molid2 = alignData.sid;

              var chain2 = pdbid_molid2chain[mmdbid2 + '_' + molid2];
              var chainid2 = mmdbid2 + '_' + chain2;

              // annoation title for the master seq only
              if(icn3d.alignChainsAnnoTitle[chainid1] === undefined ) icn3d.alignChainsAnnoTitle[chainid1] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][0] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][0] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][1] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][1] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][2] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][2] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][3] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][3] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][4] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][4] = [];
              if(icn3d.alignChainsAnnoTitle[chainid1][5] === undefined ) icn3d.alignChainsAnnoTitle[chainid1][5] = [];

              icn3d.chainsAnnoTitle[chainid1][0].push("");

              // two annotations without titles
              icn3d.alignChainsAnnoTitle[chainid1][0].push("");
              icn3d.alignChainsAnnoTitle[chainid1][1].push("");
              // empty line
              icn3d.alignChainsAnnoTitle[chainid1][2].push("");
              // 2nd chain title
              icn3d.alignChainsAnnoTitle[chainid1][3].push(chainid2);
              // master chain title
              icn3d.alignChainsAnnoTitle[chainid1][4].push(chainid1);
              // empty line
              icn3d.alignChainsAnnoTitle[chainid1][5].push("");

              var alignIndex = 1;
              //for(var j = 0, jl = alignData.sseq.length; j < jl; ++j) {
              for(var j = start; j <= end; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //var id = alignData.sseq[j][0];
                  var resi = alignData.sseq[j][1];
                  var resn = (alignData.sseq[j][2] === '~') ? '-' : alignData.sseq[j][2];
                  var aligned = id2aligninfo[j].aligned + alignData.sseq[j][3]; // 0 or 2

                  var color;
                  if(aligned === 2) { // aligned
                      if(id2aligninfo[j].resn === resn) {
                          color = '#F00';
                      }
                      else {
                          color = '#00F';
                      }
                  }
                  else {
                      color = '#CCC';
                  }

                  // chain1
                  if(icn3d.alignChainsSeq[chainid1] === undefined) icn3d.alignChainsSeq[chainid1] = [];

                  var resObject = {};
                  resObject.mmdbid = mmdbid1;
                  resObject.chain = chain1;
                  resObject.resi = id2aligninfo[j].resi;
                  resObject.resn = id2aligninfo[j].resn;
                  resObject.aligned = aligned;
                  resObject.color = color;

                  icn3d.alignChainsSeq[chainid1].push(resObject);

                  if(!isNaN(id2aligninfo[j].resi)) {
                      if(icn3d.alignChains[chainid1] === undefined) icn3d.alignChains[chainid1] = {};
                      $.extend(icn3d.alignChains[chainid1], icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi] );
                  }

                  // chain2
                  if(icn3d.alignChainsSeq[chainid2] === undefined) icn3d.alignChainsSeq[chainid2] = [];

                  resObject = {};
                  resObject.mmdbid = mmdbid2;
                  resObject.chain = chain2;
                  resObject.resi = resi;
                  resObject.resn = resn;
                  resObject.aligned = aligned;
                  resObject.color = color;

                  icn3d.alignChainsSeq[chainid2].push(resObject);

                  if(!isNaN(resi)) {
                      if(icn3d.alignChains[chainid2] === undefined) icn3d.alignChains[chainid2] = {};
                      $.extend(icn3d.alignChains[chainid2], icn3d.residues[chainid2 + '_' + resi] );
                  }

                  // annotation is for the master seq only
                  if(icn3d.alignChainsAnno[chainid1] === undefined ) icn3d.alignChainsAnno[chainid1] = [];
                  if(icn3d.alignChainsAnno[chainid1][0] === undefined ) icn3d.alignChainsAnno[chainid1][0] = [];
                  if(icn3d.alignChainsAnno[chainid1][1] === undefined ) icn3d.alignChainsAnno[chainid1][1] = [];
                  if(j === start) {
                      // empty line
                      if(icn3d.alignChainsAnno[chainid1][2] === undefined ) icn3d.alignChainsAnno[chainid1][2] = [];
                      // 2nd chain title
                      if(icn3d.alignChainsAnno[chainid1][3] === undefined ) icn3d.alignChainsAnno[chainid1][3] = [];
                      // master chain title
                      if(icn3d.alignChainsAnno[chainid1][4] === undefined ) icn3d.alignChainsAnno[chainid1][4] = [];
                      // empty line
                      if(icn3d.alignChainsAnno[chainid1][5] === undefined ) icn3d.alignChainsAnno[chainid1][5] = [];

                      icn3d.alignChainsAnno[chainid1][2].push('');
                      icn3d.alignChainsAnno[chainid1][3].push(icn3d.pdbid_chain2title[chainid2]);
                      icn3d.alignChainsAnno[chainid1][4].push(icn3d.pdbid_chain2title[chainid1]);
                      icn3d.alignChainsAnno[chainid1][5].push('');
                    }

                  var symbol = '.';
                  if(alignIndex % 5 === 0) symbol = '*';
                  if(alignIndex % 10 === 0) symbol = '|';
                  icn3d.alignChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

                  var numberStr = '';
                  if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
                  icn3d.alignChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest

                  ++alignIndex;
              } // end for(var j
          } // end for(var i
        }
    }

    function selectAll()
    {
          // select all atoms again
          for(var i in icn3d.atoms) {
              icn3d.highlightAtoms[i] = 1;
          }
    }

    function setColor(id, value)
    {
      var options2 = {};
      options2[id] = value;

      selectAll();

      icn3d.setColorByOptions(options2, icn3d.atoms);

      icn3d.draw(options2);
    }

    function setStyle(selectionType, style)
    {
      var atoms = {};

      selectAll();

      switch (selectionType) {
          case 'secondary':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.proteins);
              break;
          case 'sidechains':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.proteins);
              break;
          case 'nucleotides':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.nucleotides);
              break;
          case 'ligands':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.ligands);
              break;
          case 'ions':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.ions);
              break;
          case 'water':
              atoms = icn3d.intersectHash(icn3d.highlightAtoms, icn3d.water);
              break;
      }

      for(var i in atoms) {
        icn3d.atoms[i].style = style;
      }

      icn3d.draw(options);
    }

    $('.enablepick').click(function(e) {
       e.preventDefault();

       if(cfg.cid !== undefined) {
           icn3d.picking = 1;
           icn3d.options['picking'] = 'atom';
       }
       else {
           icn3d.picking = 2;
           icn3d.options['picking'] = 'residue';
       }
    });

    $('.disablepick').click(function(e) {
       e.preventDefault();

       icn3d.picking = 0;
       icn3d.options['picking'] = 'no';
       icn3d.draw(undefined, undefined, false);
       icn3d.removeHighlightObjects();

    });

    $("#" + pre + "reset").click(function (e) {
        e.preventDefault();

        loadStructure();
    });

    $("#" + pre + "filter_ckbx_all").click(function (e) {
        //e.preventDefault();

        var ckbxes = document.getElementsByName(pre + "filter_ckbx");

        if($(this)[0].checked == true) {
          for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
            ckbxes[i].checked = true;
          }
        }
        else {
          for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
            ckbxes[i].checked = false;
          }
        }
    });

    $("#" + pre + "filter").click(function (e) {
        e.preventDefault();

        var ckbxes = document.getElementsByName(pre + "filter_ckbx");

        var mols = "";

        var ligandFlag = "&het=0";
        for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
          if(ckbxes[i].checked) {
              if(ckbxes[i].value == 'ligands') {
                  ligandFlag = "&het=2";
              }
              else {
                  mols += ckbxes[i].value + ",";
               }
          }
        }

        // have to choose one
        if(mols == "") {
            mols = ckbxes[0].value
        }

        var url = document.URL + "&mols=" + mols + "&complexity=2" + ligandFlag;

        window.open(url, '_self');
    });

    $("#" + pre + "label_3d_diagram").click(function (e) {
        //e.preventDefault();

        var ckbxes = document.getElementsByName(pre + "filter_ckbx");

        var mols = "";

        var labels = [];

        for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
          if(ckbxes[i].checked) {
            if(ckbxes[i].value != 'ligands') labels.push(icn3d.savedLabels[ckbxes[i].value]);
          }
        }

        icn3d.labels = labels;

        icn3d.createLabelRepresentation(icn3d.labels);

        icn3d.render();
    });

    if(cfg.resize !== undefined && cfg.resize && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    $(window).resize(function() {
      if(cfg.resize !== undefined && cfg.resize) {
        $("#" + pre + "canvas").width($( window ).width() - 20).height($( window ).height() - 20);
        $("#" + pre + "viewer").width($( window ).width() - 20).height($( window ).height() - 20);

        icn3d.setWidthHeight($( window ).width() - 20, $( window ).height() - 20);

        icn3d.draw(options);

        // do not change the colors, i.e., use the previous colors
        //options['color'] = 'custom';
      }
    });
    }

    ['color', 'sidechains', 'secondary', 'ligands', 'water', 'ions', 'nucleotides'].forEach(function (opt) {
        $('#' + pre + opt).change(function (e) {
            if(opt === 'color') {
              setColor(opt, $('#' + pre + opt).val());
            }
            else {
              setStyle(opt, $('#' + pre + opt).val());
            }

        });
    });
}