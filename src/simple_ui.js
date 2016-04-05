/*! simple_ui.js
 * @author Jiyao Wang / https://github.com/ncbi/me.icn3d
 * simple UI of me.icn3d
 */

if (typeof jQuery === 'undefined') { throw new Error('iCn3DUI requires jQuery') }
if (typeof iCn3D === 'undefined') { throw new Error('iCn3DUI requires iCn3D') }

// make dialog movable outside of the window
// http://stackoverflow.com/questions/6696461/jquery-ui-dialog-drag-question
if (!$.ui.dialog.prototype._makeDraggableBase) {
    $.ui.dialog.prototype._makeDraggableBase = $.ui.dialog.prototype._makeDraggable;
    $.ui.dialog.prototype._makeDraggable = function() {
        this._makeDraggableBase();
        this.uiDialog.draggable("option", "containment", false);
    };
}

var iCn3DUI = function(cfg) {
    var me = this;

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    me.inputid = '';

    me.WIDTH = 400; // total width of view area
    me.HEIGHT = 400; // total height of view area

    me.RESIDUE_WIDTH = 10;  // sequences
    me.MENU_HEIGHT = 0; //40;

    // used to set the position for the log/command textarea
    me.MENU_WIDTH = 0; //690;

    me.LESSWIDTH = 0;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROTATION_DIRECTION = 'right';
    me.HIDE_SELECTION = true;
    me.ALTERNATE_STRUCTURE = -1;

    me.EXTRAHEIGHT = 0;

    me.SELECT_RESIDUE = false;
    me.selectedResidues = {};

    me.CRASHED = false;
    me.prevCommands = "";

    me.options = {};
    me.options['camera']             = 'perspective';        //perspective, orthographic
    me.options['background']         = 'black';              //black, grey, white
    me.options['color']              = 'spectrum';           //spectrum, secondary structure, charge, chain, residue, atom, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.options['sidechains']         = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    me.options['proteins']          = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
    me.options['surface']            = 'nothing';             //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    me.options['opacity']            = '0.8';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.options['wireframe']          = 'no';                 //yes, no
    me.options['ligands']            = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    me.options['water']              = 'nothing';            //sphere, dot, nothing
    me.options['ions']               = 'sphere';             //sphere, dot, nothing
    me.options['hbonds']             = 'no';                 //yes, no
    //me.options['labels']             = 'no';                 //yes, no
    //me.options['lines']                   = 'no';                 //yes, no
    me.options['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.options['axis']               = 'no';                 //yes, no
    me.options['fog']               = 'no';                 //yes, no
    me.options['slab']               = 'no';                 //yes, no
    me.options['picking']            = 'residue';                 //no, atom, residue, strand
    me.options['nucleotides']        = 'phosphorus trace';   //nucleotide cartoon, phosphorus trace, schematic, lines, stick, ball and stick, sphere, nothing

    me.options['surfaceregion']      = 'nothing';            //nothing, all, sphere

    if(me.cfg.cid !== undefined) {
        me.options['picking'] = 'atom';
        me.options['ligands'] = 'ball and stick';
    }

    me.modifyIcn3d();

};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    // modify me.icn3d function
    modifyIcn3d: function() {var me = this;
        me.modifyIcn3dShowPicking();
    },

    modifyIcn3dShowPicking: function() {var me = this;
        iCn3D.prototype.showPicking = function(atom) {
          this.showPickingBase(atom);

          //var text = '#' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
          //var residueText = '.' + atom.chain + ':' + atom.resi;
          var residueText = atom.resn + atom.resi;

          var text;
          if(me.cfg.cid !== undefined) {
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

          label.background = "#CCCCCC";

          labels.push(label);

          //http://www.johannes-raida.de/tutorials/three.js/tutorial13/tutorial13.htm
          this.createLabelRepresentation(labels);
        };
    },

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this;
        var html = me.setHtml();

        $( "#" + me.divid).html(html);

        me.setViewerWidthHeight();

        var width, height;

        if(me.cfg.width.toString().indexOf('%') !== -1) {
          width = me.WIDTH * me.cfg.width.substr(0, me.cfg.width.toString().indexOf('%')) / 100.0 - me.LESSWIDTH;
        }
        else {
          width = me.cfg.width;
        }

        if(me.cfg.height.toString().indexOf('%') !== -1) {
          height = me.HEIGHT * me.cfg.height.substr(0, me.cfg.height.toString().indexOf('%')) / 100.0 - me.EXTRAHEIGHT - me.LESSHEIGHT;
        }
        else {
          height = me.cfg.height;
        }

        $("#" + me.pre + "viewer").width(width).height(height);
        $("#" + me.pre + "canvas").width(width).height(height);

        if(parseInt(width) <= 200) {
          $("#" + me.pre + "toolbox").hide();
        }

        me.allEventFunctions();

        me.allCustomEvents();

        me.icn3d = new iCn3D(me.pre + 'canvas');

        if(me.cfg.bCalphaOnly !== undefined) me.icn3d.bCalphaOnly = me.cfg.bCalphaOnly;

        me.loadStructure();
    },

    setHtml: function() { var me = this;
        var html = "";

        html += "<div id='" + me.pre + "viewer' style='position:relative; width:100%; height:100%;'>";
        html += "<!--div style='height:18px'></div-->";
        html += "<div id='" + me.pre + "title' style='position:absolute; top:20px; left:80px; color: white;'></div>";

        html += "<div id='" + me.pre + "wait' style='width:100%; height: 100%; background-color: rgba(0,0,0, 0.8);'><div style='padding-top:15%; text-align: center; font-size: 2em; color: #FFFF00;'>Loading the structure...</div></div>";

        html += "<canvas id='" + me.pre + "canvas' style='width:100%; height:100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        html += "<div class='icn3d-tabBox' id='" + me.pre + "toolbox'>";
        html += "<span class='icn3d-bottomTab'>Tools</span>";
        html += "<div class='icn3d-insideTab' style='overflow: auto;'>";
        html += "<form action='' id='" + me.pre + "paraform' method='POST'>";

        if(me.cfg.cid === undefined) {
        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Proteins&nbsp;</b>";
        html += "<select id='" + me.pre + "proteins'>";
        html += "<option value='ribbon' selected>Ribbon</option>";
        html += "<option value='strand'>Strand</option>";
        html += "<option value='cylinder and plate'>Cylinder and Plate</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='c alpha trace'>C Alpha Trace</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='b factor tube'>B Factor Tube</option>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick'>Stick</option>";
        html += "<option value='ball and stick'>Ball and Stick</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Side Chains&nbsp;</b>";
        html += "<select id='" + me.pre + "sidechains'>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick'>Stick</option>";
        html += "<option value='ball and stick'>Ball and Stick</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing' selected>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Nucleotides&nbsp;</b>";
        html += "<select id='" + me.pre + "nucleotides'>";
        html += "<option value='nucleotide cartoon'>Cartoon</option>";
        html += "<option value='phosphorus trace' selected>Phosphorus Trace</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick'>Stick</option>";
        html += "<option value='ball and stick'>Ball and Stick</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Ligands&nbsp;</b>";
        html += "<select id='" + me.pre + "ligands'>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick' selected>Stick</option>";
        html += "<option value='ball and stick'>Ball and Stick</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";
        }
        else {
        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Ligands&nbsp;</b>";
        html += "<select id='" + me.pre + "ligands'>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick'>Stick</option>";
        html += "<option value='ball and stick' selected>Ball and Stick</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";
        }

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Color&nbsp;</b>";
        html += "<select id='" + me.pre + "color'>";
        if(me.cfg.cid === undefined) {
        html += "<option value='spectrum' selected>Spectrum</option>";
        html += "<option value='secondary structure'>Secondary Structure</option>";
        html += "<option value='charge'>Charge</option>";
        html += "<option value='chain'>Chain</option>";
        html += "<option value='residue'>Residue</option>";
        }
        html += "<option value='atom'>Atom</option>";
        html += "<option value='red'>Red</option>";
        html += "<option value='green'>Green</option>";
        html += "<option value='blue'>Blue</option>";
        html += "<option value='magenta'>Magenta</option>";
        html += "<option value='yellow'>Yellow</option>";
        html += "<option value='cyan'>Cyan</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
//        html += "&nbsp;&nbsp;<button id='" + me.pre + "enablepick'>Picking</button> <button id='" + me.pre + "disablepick'>No Picking</button>";
        html += "&nbsp;&nbsp;<b>Pick</b>: hold \"Ctrl\" and pick<br/>";
        html += "&nbsp;&nbsp;<b>Union</b>: hold \"Shift\" to union<br/>";
        html += "&nbsp;&nbsp;<b>Switch</b>: hold \"Ctrl\" and press up/down arrow";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "&nbsp;&nbsp;<button id='" + me.pre + "reset'>Reset</button> <button id='" + me.pre + "help'>Help</button>";
        html += "</div>";

        html += "</form>";
        html += "</div>";
        html += "</div>";

        html += "</div>";

        html += "<!-- dialog will not be part of the form -->";
        html += "<div id='" + me.pre + "allselections' class='icn3d-hidden'>";

        // filter for large structure
        html += "<div id='" + me.pre + "dl_filter' style='overflow:auto; position:relative'>";
        //html += "  <div>This large structure contains more than 50,000 atoms. Please select some structures/chains below to display.</div>";
        //html += "  <input style='position:absolute; top:13px; left:20px;' type='checkbox' id='" + me.pre + "filter_ckbx_all'/>";
        html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
        html += "<button id='" + me.pre + "label_3d_diagram' style='margin-left:10px;'><span style='white-space:nowrap'><b>Show Labels</b></span></button></div>";
        html += "  <div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
        html += "  </div>";
        html += "</div>";

        html += "</div>";

        return html;
    },

    loadStructure: function() { var me = this;
        me.icn3d.moleculeTitle = '';

        if(me.cfg.pdbid !== undefined) {
             me.inputid = me.cfg.pdbid;
             var pdbid = me.cfg.pdbid.toLowerCase(); // http://www.rcsb.org/pdb/files/1gpk.pdb only allow lower case

             me.downloadPdb(pdbid);
        }
        else if(me.cfg.mmdbid !== undefined) {
            me.inputid = me.cfg.mmdbid;
            me.downloadMmdb(me.cfg.mmdbid);
        }
        else if(me.cfg.gi !== undefined) {
            var mmdbid;

            // get mmdbid from gi
            var uri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=protein&db=structure&linkname=protein_structure_direct&id=" + me.cfg.gi;

           $.ajax({
              url: uri,
              dataType: 'text',
              cache: true,
              success: function(data) {
                if(data.indexOf('<Link>') === -1) {
                  alert("There are no MMDB IDs available for the gi " + me.cfg.gi);
                }
                else {
                  var linkStr = data.substr(data.indexOf('<Link>'));
                  var start = linkStr.indexOf('<Id>');
                  var end = linkStr.indexOf('</Id>');
                  var mmdbid = linkStr.substr(start + 4, end - start - 4);

                  me.inputid = mmdbid;

                  me.downloadMmdb(mmdbid);
                }
              }
           });
        }
        else if(me.cfg.cid !== undefined) {
           me.inputid = me.cfg.cid;
           var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + me.cfg.cid + "/description/jsonp";
           $.ajax({
              url: url,
              dataType: 'jsonp',
              success: function(data) {
                  if(data.InformationList !== undefined && data.InformationList.Information !== undefined) me.icn3d.moleculeTitle = data.InformationList.Information[0].Title;
              }
           });

            me.downloadCid(me.cfg.cid);
        }
        else if(me.cfg.mmcifid !== undefined) {
            me.inputid = me.cfg.mmcifid;
            me.downloadMmcif(me.cfg.mmcifid);
        }
        else if(me.cfg.align !== undefined) {
            me.inputid = me.cfg.align;
            me.downloadAlignment(me.cfg.align);
        }
        else {
            alert("Please input a gi, MMDB ID, PDB ID, CID, or mmCIF ID...");
        }
    },

    renderStructure: function(bInitial) { var me = this;
        if(bInitial) {
            me.icn3d.draw(me.options);
        }
        else {
            me.icn3d.draw();
        }
    },

    selectAll: function() { var me = this;
          // select all atoms again
          for(var i in me.icn3d.atoms) {
              me.icn3d.highlightAtoms[i] = 1;
          }
    },

    setColor: function(id, value) { var me = this;
      me.icn3d.options[id] = value;

      me.selectAll();

      me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.atoms);

      me.icn3d.draw();
    },

    setStyle: function(selectionType, style) { var me = this;
      var atoms = {};

      me.selectAll();

      switch (selectionType) {
          case 'proteins':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.proteins);
              break;
          case 'sidechains':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.sidechains);
              break;
          case 'nucleotides':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.nucleotides);
              break;
          case 'ligands':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.ligands);
              break;
          case 'ions':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.ions);
              break;
          case 'water':
              atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.water);
              break;
      }

      for(var i in atoms) {
        me.icn3d.atoms[i].style = style;
      }

      me.icn3d.options[selectionType] = style;

      me.icn3d.draw();
    },

    clickTab: function() { var me = this;
        $('.icn3d-bottomTab').click(function (e) {
           var height = $(".icn3d-insideTab").height();
           if(height === 0) {
             $(".icn3d-insideTab").height(230);
           }
           else {
             $(".icn3d-insideTab").height(0);
           }
        });
    },

    clickPicking: function() { var me = this;
        $("#" + me.pre + "enablepick").click(function(e) {
           e.preventDefault();

           if(me.cfg.cid !== undefined) {
               me.icn3d.picking = 1;
               me.icn3d.options['picking'] = 'atom';
           }
           else {
               me.icn3d.picking = 2;
               me.icn3d.options['picking'] = 'residue';
           }

        });
    },

    clickNoPicking: function() { var me = this;
        $("#" + me.pre + "disablepick").click(function(e) {
           e.preventDefault();

           me.icn3d.picking = 0;
           me.icn3d.options['picking'] = 'no';
           me.icn3d.draw(undefined, false);
           me.icn3d.removeHighlightObjects();

        });
    },

    changeProteinStyle: function() { var me = this;
        $("#" + me.pre + "proteins").change(function(e) {
           e.preventDefault();

           $("#" + me.pre + "sidechains").val("nothing");
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            e.preventDefault();

            me.loadStructure();
        });
    },

    clickHelp: function() { var me = this;
        $("#" + me.pre + "help").click(function (e) {
            e.preventDefault();

            window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html', '_blank');
        });
    },

    showSubsets: function() { var me = this;
        $("#" + me.pre + "filter").click(function (e) {
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
    },

/*
    windowResize: function() { var me = this;
        if(me.cfg.resize !== undefined && me.cfg.resize && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $(window).resize(function() {
          if(me.cfg.resize !== undefined && me.cfg.resize) {
            var width = $( window ).width();
            var height = $( window ).height();

            //var width = $( window ).width();
            //var height = $( window ).height();

            $("#" + me.pre + "canvas").width(width - 20).height(height - 20);
            $("#" + me.pre + "viewer").width(width - 20).height(height - 20);

            me.icn3d.setWidthHeight(width - 20, height - 20);

            me.icn3d.draw();

            // do not change the colors, i.e., use the previous colors
            //options['color'] = 'custom';
          }
        });
        }
    },
*/

    changeSelection: function() { var me = this;
        ['color', 'sidechains', 'proteins', 'ligands', 'water', 'ions', 'nucleotides'].forEach(function (opt) {
            $('#' + me.pre + opt).change(function (e) {
                if(opt === 'color') {
                  me.setColor(opt, $('#' + me.pre + opt).val());
                }
                else {
                  me.setStyle(opt, $('#' + me.pre + opt).val());
                }
            });
        });
    },

    allEventFunctions: function() { var me = this;
        me.clickTab();
        me.clickPicking();
        me.clickNoPicking();
        me.changeProteinStyle();
        me.clickReset();
        me.clickHelp();
        me.showSubsets();
        me.clickHighlight_3d_diagram();
        me.windowResize();
        me.changeSelection();
    },

    allCustomEvents: function() { var me = this;
      // add custom events here
    }
};

/*! The following are shared by full_ui.js and simple_ui.js */

    iCn3DUI.prototype.clickHighlight_3d_diagram = function() { var me = this;
        $("#" + me.pre + "highlight_3d_diagram").click(function (e) {
           //e.preventDefault();
           me.icn3d.removeHighlightObjects();

           var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

           var mols = "";

           //if(me.icn3d.labels['custom'] === undefined) me.icn3d.labels['custom'] = [];
           var molid2ssTmp = {}, molid2colorTmp = {};

           me.icn3d.highlightAtoms = {};
           for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
             if(ckbxes[i].checked && ckbxes[i].value != 'ligands') {
               //me.icn3d.labels['custom'].push(me.icn3d.savedLabels[ckbxes[i].value]);
               var value = ckbxes[i].value;
               var chain = ckbxes[i].getAttribute('chain');

               if(me.icn3d.molid2ss.hasOwnProperty(value)) { // condensed view
                   molid2ssTmp[value] = me.icn3d.molid2ss[value];
                   molid2colorTmp[value] = me.icn3d.molid2color[value];
               }
               else { // all atom view
                   me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);
               }
             }
           }

           //me.icn3d.createLabelRepresentation(me.icn3d.labels);

           me.icn3d.drawHelixBrick(molid2ssTmp, molid2colorTmp, me.icn3d.bHighlight); // condensed view
           me.icn3d.addHighlightObjects(undefined, false); // all atom view

           me.icn3d.render();
        });
    };

    iCn3DUI.prototype.rotateStructure = function (direction, bInitial) { var me = this;
        if(me.icn3d.bStopRotate) return false;
        if(me.icn3d.rotateCount > me.icn3d.rotateCountMax) return false;
        ++me.icn3d.rotateCount;

        if(bInitial !== undefined && bInitial) {
            if(direction === 'left') {
              me.ROTATION_DIRECTION = 'left';
            }
            else if(direction === 'right') {
              me.ROTATION_DIRECTION = 'right';
            }
            else if(direction === 'up') {
              me.ROTATION_DIRECTION = 'up';
            }
            else if(direction === 'down') {
              me.ROTATION_DIRECTION = 'down';
            }
            else {
              return false;
            }
        }

        if(direction === 'left' && me.ROTATION_DIRECTION === 'left') {
          me.icn3d.rotateLeft(1);
        }
        else if(direction === 'right' && me.ROTATION_DIRECTION === 'right') {
          me.icn3d.rotateRight(1);
        }
        else if(direction === 'up' && me.ROTATION_DIRECTION === 'up') {
          me.icn3d.rotateUp(1);
        }
        else if(direction === 'down' && me.ROTATION_DIRECTION === 'down') {
          me.icn3d.rotateDown(1);
        }
        else {
          return false;
        }

        setTimeout(function(){ me.rotateStructure(direction); }, 100);
    };

    iCn3DUI.prototype.showTitle = function() { var me = this;
        if(me.icn3d.moleculeTitle !== undefined && me.icn3d.moleculeTitle !== '') {
            var title = me.icn3d.moleculeTitle;

            if(me.inputid === undefined) {
                if(me.icn3d.moleculeTitle.length > 40) title = me.icn3d.moleculeTitle.substr(0, 40) + "...";

                $("#" + me.pre + "title").html(title);
            }
            else if(me.cfg.cid !== undefined) {
                var url = me.getLinkToStructureSummary();

                $("#" + me.pre + "title").html(title + " (PubChem CID <a href='" + url + "' target='_blank' style='color:#DDD'>" + me.inputid.toUpperCase() + "</a>)");
            }
            else if(me.cfg.align !== undefined) {
                $("#" + me.pre + "title").html(title);
            }
            else {
                var url = me.getLinkToStructureSummary();

                if(me.icn3d.moleculeTitle.length > 40) title = me.icn3d.moleculeTitle.substr(0, 40) + "...";

                $("#" + me.pre + "title").html(title + " (PDB ID <a href='" + url + "' target='_blank' style='color:#DDD'>" + me.inputid.toUpperCase() + "</a>)");
            }
        }
        else {
            $("#" + me.pre + "title").html("");
        }
    };

    iCn3DUI.prototype.getLinkToStructureSummary = function(bLog) { var me = this;

           var url = (me.cfg.cid !== undefined) ? "https://www.ncbi.nlm.nih.gov/pccompound/?term=" : "https://www.ncbi.nlm.nih.gov/structure/?term=";

           if(me.inputid === undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=" + me.moleculeTitle;
           }
           else {
               var idArray = me.inputid.split('_');

               if(idArray.length === 1) {
                   url += me.inputid;
                   if(bLog !== undefined && bLog) me.setLogCommand("link to Structure Summary " + me.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url += idArray[0] + " OR " + idArray[1];
                   if(bLog !== undefined && bLog) me.setLogCommand("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
               }
           }

           return url;
    },

    iCn3DUI.prototype.isIE = function() { var me = this;
        //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
            return true;
        else                 // If another browser, return 0
            return false;
    };

    iCn3DUI.prototype.saveFile = function(filename, type, text) { var me = this;
        //Save file
        if(me.isIE()) { // IE
            if(window.navigator.msSaveBlob){
                if(type === 'text') {
                    var dataStr = me.icn3d.commands.join('\n');
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'png') {
                   me.icn3d.render();
                   var blob = me.icn3d.renderer.domElement.msToBlob();

                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'residue') {
                    var dataStr = text;
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
            }
        }
        else {
            var data;

            if(type === 'text') {
                var dataStr = me.icn3d.commands.join('\n');
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
            }
            else if(type === 'png') {
               me.icn3d.render();
               var dataStr = me.icn3d.renderer.domElement.toDataURL('image/png');

                data = dataStr;
            }
            else if(type === 'residue') {
                var dataStr = text;
                data = "data:text/html;charset=utf-8," + encodeURIComponent(dataStr);
            }

            window.open(data, '_blank');
        }
    };

    iCn3DUI.prototype.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    iCn3DUI.prototype.isMac = function() {
        return /Mac/i.test(navigator.userAgent);
    };

    iCn3DUI.prototype.isSessionStorageSupported = function() {
      var testKey = 'test';
      try {
        sessionStorage.setItem(testKey, '1');
        sessionStorage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    };

/*! parsers */

    iCn3DUI.prototype.downloadPdb = function (pdbid) { var me = this;
       // The PDB service doesn't support https, so use our reverse-proxy
       // service when using https
       var uri, dataType;
       if(document.location.protocol !== "https:") {
           //uri = "http://www.rcsb.org/pdb/files/" + pdbid + ".pdb";
           uri = "http://files.rcsb.org/view/" + pdbid + ".pdb";

           dataType = "text";
       }
       else {
           //uri = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?jsonp=t&pdbid=" + pdbid;
           //dataType = "jsonp";
           var url = document.location.href;
           url = url.replace('https', 'http');
           window.open(url, '_self');
           return;
       }

       me.icn3d.bCid = undefined;

       $.ajax({
          url: uri,
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
              if(document.location.protocol !== "https:") {
                  me.loadPdbData(data);
              }
              else {
                  me.loadPdbData(data.data); // from mmcifparser.cgi
              }
          }
       });
    };

    iCn3DUI.prototype.loadPdbData = function(data) {
        var me = this;

        me.icn3d.loadPDB(data);

        me.pmid = me.icn3d.pmid;

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        //me.icn3d.inputid.idtype = "pdbid";
        //me.icn3d.inputid.id = pdbid;

        me.icn3d.setAtomStyleByOptions(me.options);
        me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

        me.renderStructure();

        me.showTitle();

        if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

        if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    };

    iCn3DUI.prototype.downloadMmcif = function (mmcifid) { var me = this;
        // The PDB service doesn't support https, so use our reverse-proxy
        // service when using https
        var url;
        if(document.location.protocol !== "https:") {
            //url = "http://www.rcsb.org/pdb/files/" + mmcifid + ".cif";
            url = "http://files.rcsb.org/view/" + mmcifid + ".cif";
        }
        else {
            //url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?jsonp=t&mmcifid=" + mmcifid;
            url = document.location.href;
            url = url.replace('https', 'http');
            window.open(url, '_self');
            return;
        }

        me.icn3d.bCid = undefined;

       $.ajax({
          url: url,
          dataType: 'text',
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
                url = "//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

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
        //var url = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c&w3d&ids=" + align;
        //var url2 = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c1&d&ids=" + align;

        var alignArray = me.cfg.align.split(',');
        var ids_str = (alignArray.length === 2? 'uids=' : 'ids=') + align;
        var url = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c&w3d&' + ids_str;
        var url2 = 'https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?cmd=c1&d&' + ids_str;

        if(me.cfg.inpara !== undefined) {
          url += me.cfg.inpara;
          url2 += me.cfg.inpara;
        }

        me.icn3d.bCid = undefined;

        // define for 'align' only
        me.icn3d.pdbid_chain2title = {};

        var request = $.ajax({
           url: url2,
           //dataType: 'json',
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

        var seqalign = {};

        var chained = request.then(function( data ) {
            seqalign = data.seqalign;

            if(seqalign === undefined) {
                alert("These two MMDB IDs " + alignArray + " do not have 3D alignment data.");
                return;
            }

            var index = 0;
            for(var mmdbid in data) {
                if(index < 2) {
                    var pdbid = data[mmdbid].pdbid;
                    //me.icn3d.mmdbid2pdbid[mmdbid] = pdbid;

                    var molecule = data[mmdbid].molecule;
                    for(var molname in molecule) {
                        var chain = molecule[molname].chain;
                        me.icn3d.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                    }
                }

                ++index;
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

                //me.icn3d.inputid.idtype = "alignment";
                //me.icn3d.inputid.id = align;

                me.icn3d.setAtomStyleByOptions(me.options);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms, true);

                me.renderStructure();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                // by default, open the seq alignment window
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

    iCn3DUI.prototype.downloadCid = function (cid) { var me = this;
        var uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/record/SDF/?record_type=3d&response_type=display";

        me.icn3d.bCid = true;

        $.ajax({
          url: uri,
          dataType: 'text',
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
            var bResult = me.loadSdfAtomData(data);

            if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                $("#" + me.pre + "alternateWrapper").hide();
            }

            if(!bResult) {
              alert('The SDF of CID ' + cid + ' has the wrong format...');
            }
            else {
              //me.icn3d.inputid.idtype = "cid";
              //me.icn3d.inputid.id = cid;

              me.icn3d.setAtomStyleByOptions(me.options);
              me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

              me.renderStructure();

              if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

              if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }
          }
        })
        .fail(function() {
            alert( "This CID may not have 3D structure..." );
        });
    };

    iCn3DUI.prototype.loadMol2Data = function(data) {
        var me = this;

        var bResult = me.loadMol2AtomData(data);

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The Mol2 file has the wrong format...');
        }
        else {
          //me.icn3d.inputid.idtype = "cid";
          //me.icn3d.inputid.id = cid;

          me.icn3d.setAtomStyleByOptions(me.options);
          me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

          me.renderStructure();

          if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

          if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
    };

    iCn3DUI.prototype.loadSdfData = function(data) {
        var me = this;

        var bResult = me.loadSdfAtomData(data);

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The SDF file has the wrong format...');
        }
        else {
          //me.icn3d.inputid.idtype = "cid";
          //me.icn3d.inputid.id = cid;

          me.icn3d.setAtomStyleByOptions(me.options);
          me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

          me.renderStructure();

          if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

          if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
    };

    iCn3DUI.prototype.loadXyzData = function(data) {
        var me = this;

        var bResult = me.loadXyzAtomData(data);

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The XYZ file has the wrong format...');
        }
        else {
          //me.icn3d.inputid.idtype = "cid";
          //me.icn3d.inputid.id = cid;

          me.icn3d.setAtomStyleByOptions(me.options);
          me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

          me.renderStructure();

          if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

          if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
    };

    iCn3DUI.prototype.loadMol2AtomData = function (data) { var me = this;
        var lines = data.split(/\r?\n|\r/);
        if (lines.length < 4) return false;

        me.icn3d.init();

        var structure = 1;
        var chain = 'A';
        var resn = 'LIG';
        var resi = 1;

        var AtomHash = {};
        var moleculeNum = 1, chainNum = '1_A', residueNum = '1_A_1';
        var atomCount, bondCount, atomIndex = 0, bondIndex = 0;
        var serial=1;

        var bAtomSection = false, bBondSection = false;

        var atomid2serial = {};
        var skipAtomids = {};

        var prevBondType = '', contiArrBondCnt = 0;

        for (var i = 0, il = lines.length; i < il; ++i) {
            var line = lines[i].trim();
            if(line === '') continue;
            if(line.substr(0, 1) === '#') continue;

            if(line == '@<TRIPOS>MOLECULE') {
                me.icn3d.moleculeTitle = lines[i + 1].trim();
                var atomCnt_bondCnt = lines[i + 2].trim().replace(/\s+/g, " ").split(" ");
                atomCount = atomCnt_bondCnt[0];
                bondCount = atomCnt_bondCnt[1];
                i = i + 4;
            }
            else if(line == '@<TRIPOS>ATOM') { // 1    C1    1.207    2.091    0.000    C.ar    1    BENZENE    0.000
                serial = 1;

                bAtomSection = true;

                ++i;
            }
            else if(line == '@<TRIPOS>BOND') { // 1    1    2    ar
                bBondSection = true;
                bAtomSection = false;

                ++i;
            }
            else if(line == '@<TRIPOS>SUBSTRUCTURE') { // 1    1    2    ar
                bBondSection = false;

                ++i;
            }

            line = lines[i].trim();
            if(line === '') continue;
            if(line.substr(0, 1) === '#') continue;

            if(bAtomSection && atomIndex < atomCount) {
                // 1    C1    1.207    2.091    0.000    C.ar    1    BENZENE    0.000
                var atomArray = line.replace(/\s+/g, " ").split(" ");

                var atomid = parseInt(atomArray[0]);
                atomid2serial[atomid] = serial;

                var name = atomArray[1];
                var x = parseFloat(atomArray[2]);
                var y = parseFloat(atomArray[3]);
                var z = parseFloat(atomArray[4]);
                var coord = new THREE.Vector3(x, y, z);

                var elemFull = atomArray[5];
                var pos = elemFull.indexOf('.');
                //var charge = parseFloat(atomArray[8]);

                var elem;
                if(pos === -1) {
                    elem = elemFull;
                }
                else {
                    elem = elemFull.substr(0, pos);
                }

                // skip H, but keep H.spc, H.t3p, etc
                if(elem === 'H' && elem === elemFull) {
                    skipAtomids[atomid] = 1;
                }
                else {
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
                        elem: elem,             // optional, used to determine hydrogen bond
                        bonds: [],              // required, used to connect atoms
                        ss: 'coil',             // optional, used to show secondary structures
                        ssbegin: false,         // optional, used to show the beginning of secondary structures
                        ssend: false,           // optional, used to show the end of secondary structures

                        bondOrder: []           // optional, specific for chemicals
                    };

                    me.icn3d.atoms[serial] = atomDetails;
                    AtomHash[serial] = 1;

                    ++serial;
                }

                ++atomIndex;
            }

            if(bBondSection && bondIndex < bondCount) {
                // 1    1    2    ar
                var bondArray = line.replace(/\s+/g, " ").split(" ");
                var fromAtomid = parseInt(bondArray[1]);
                var toAtomid = parseInt(bondArray[2]);
                var bondType = bondArray[3];
                var finalBondType = bondType;

                //• 1 = single • 2 = double • 3 = triple • am = amide • ar = aromatic • du = dummy • un = unknown (cannot be determined from the parameter tables) • nc = not connected
                if(bondType === 'am') {
                    finalBondType = '1';
                }

/*
                if(prevBondType !== 'ar' && bondType === 'ar') {
                    contiArrBondCnt = 1;
                }
                else if(prevBondType === 'ar' && bondType === 'ar') {
                    ++contiArrBondCnt;
                }
                else if(prevBondType === 'ar' && bondType !== 'ar') {
                    contiArrBondCnt = 0;
                }

                if(bondType === 'ar') {
                    if(contiArrBondCnt % 2 === 0) {
                        //finalBondType = '2';
                        finalBondType = '1';
                    }
                    else {
                        finalBondType = '1';
                    }
                }
*/
                if(bondType === 'ar') {
                    finalBondType = '1.5';
                }

                if(!skipAtomids.hasOwnProperty(fromAtomid) && !skipAtomids.hasOwnProperty(toAtomid) && (finalBondType === '1' || finalBondType === '2' || finalBondType === '3' || finalBondType === '1.5') ) {
                //if(finalBondType === '1' || finalBondType === '2' || finalBondType === '3') {
                    //var order = parseInt(finalBondType);
                    var order = finalBondType;
                    var from = atomid2serial[fromAtomid];
                    var to = atomid2serial[toAtomid];

                    // skip all bonds between H and C
                    //if( !(me.icn3d.atoms[from].elem === 'H' && me.icn3d.atoms[to].elem === 'C') && !(me.icn3d.atoms[from].elem === 'C' && me.icn3d.atoms[to].elem === 'H') ) {
                        me.icn3d.atoms[from].bonds.push(to);
                        me.icn3d.atoms[from].bondOrder.push(order);
                        me.icn3d.atoms[to].bonds.push(from);
                        me.icn3d.atoms[to].bondOrder.push(order);

                        if(order == '2') {
                            me.icn3d.doublebonds[from + '_' + to] = 1;
                            me.icn3d.doublebonds[to + '_' + from] = 1;
                        }
                        else if(order == '3') {
                            me.icn3d.triplebonds[from + '_' + to] = 1;
                            me.icn3d.triplebonds[to + '_' + from] = 1;
                        }
                        else if(order == '1.5') {
                            me.icn3d.aromaticbonds[from + '_' + to] = 1;
                            me.icn3d.aromaticbonds[to + '_' + from] = 1;
                        }
                    //}
                }

                ++bondIndex;
                prevBondType = bondType;
            }
        }

        me.icn3d.displayAtoms = AtomHash;
        me.icn3d.highlightAtoms= AtomHash;
        me.icn3d.structures[moleculeNum] = [chainNum]; //AtomHash;
        me.icn3d.chains[chainNum] = AtomHash;
        me.icn3d.residues[residueNum] = AtomHash;

        me.icn3d.residueId2Name[residueNum] = resn;

        if(me.icn3d.chainsSeq[chainNum] === undefined) me.icn3d.chainsSeq[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum] === undefined ) me.icn3d.chainsAnno[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum][0] === undefined ) me.icn3d.chainsAnno[chainNum][0] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum] === undefined ) me.icn3d.chainsAnnoTitle[chainNum] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum][0] === undefined ) me.icn3d.chainsAnnoTitle[chainNum][0] = [];

          var resObject = {};
          resObject.resi = resi;
          resObject.name = resn;

        me.icn3d.chainsSeq[chainNum].push(resObject);
        me.icn3d.chainsAnno[chainNum][0].push(resi);
        me.icn3d.chainsAnnoTitle[chainNum][0].push('');

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for (var i in me.icn3d.atoms) {
            var atom = me.icn3d.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(atom.het) {
              if($.inArray(atom.elem, me.icn3d.ionsArray) !== -1) {
                me.icn3d.ions[atom.serial] = 1;
              }
              else {
                me.icn3d.ligands[atom.serial] = 1;
              }
            }
        } // end of for


        me.icn3d.pmin = pmin;
        me.icn3d.pmax = pmax;

        me.icn3d.cnt = cnt;

        me.icn3d.maxD = me.icn3d.pmax.distanceTo(me.icn3d.pmin);
        me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

        if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;

        me.showTitle();

        return true;
    };

    iCn3DUI.prototype.loadSdfAtomData = function (data) { var me = this;
        var lines = data.split(/\r?\n|\r/);
        if (lines.length < 4) return false;

        me.icn3d.init();

        var structure = 1;
        var chain = 'A';
        var resi = 1;
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

        var atomid2serial = {};
        var skipAtomids = {}; // skip hydrgen atom

        var AtomHash = {};
        var serial = 1;
        for (i = start; i < end; i++) {
            line = lines[offset];
            offset++;

            var name = line.substr(31, 3).replace(/ /g, "");

            if(name !== 'H') {
                var x = parseFloat(line.substr(0, 10));
                var y = parseFloat(line.substr(10, 10));
                var z = parseFloat(line.substr(20, 10));
                var coord = new THREE.Vector3(x, y, z);

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

                me.icn3d.atoms[serial] = atomDetails;
                AtomHash[serial] = 1;

                atomid2serial[i] = serial;

                ++serial;
            }
            else {
                skipAtomids[i] = 1;
            }
        }

        me.icn3d.displayAtoms = AtomHash;
        me.icn3d.highlightAtoms= AtomHash;
        me.icn3d.structures[moleculeNum] = [chainNum]; //AtomHash;
        me.icn3d.chains[chainNum] = AtomHash;
        me.icn3d.residues[residueNum] = AtomHash;

        me.icn3d.residueId2Name[residueNum] = resn;

        if(me.icn3d.chainsSeq[chainNum] === undefined) me.icn3d.chainsSeq[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum] === undefined ) me.icn3d.chainsAnno[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum][0] === undefined ) me.icn3d.chainsAnno[chainNum][0] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum] === undefined ) me.icn3d.chainsAnnoTitle[chainNum] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum][0] === undefined ) me.icn3d.chainsAnnoTitle[chainNum][0] = [];

          var resObject = {};
          resObject.resi = resi;
          resObject.name = resn;

        me.icn3d.chainsSeq[chainNum].push(resObject);
        me.icn3d.chainsAnno[chainNum][0].push(resi);
        me.icn3d.chainsAnnoTitle[chainNum][0].push('');

//                if(!skipAtomids.hasOwnProperty(fromAtomid) && !skipAtomids.hasOwnProperty(toAtomid) && (finalBondType === '1' || finalBondType === '2' || finalBondType === '3') ) {
//                atomid2serial[i] = serial;
//                skipAtomids[i] = 1;


        for (i = 0; i < bondCount; i++) {
            line = lines[offset];
            offset++;
            var fromAtomid = parseInt(line.substr(0, 3)) - 1 + start;
            var toAtomid = parseInt(line.substr(3, 3)) - 1 + start;
            //var order = parseInt(line.substr(6, 3));
            var order = line.substr(6, 3).trim();

            if(!skipAtomids.hasOwnProperty(fromAtomid) && !skipAtomids.hasOwnProperty(toAtomid)) {
                var from = atomid2serial[fromAtomid];
                var to = atomid2serial[toAtomid];

                me.icn3d.atoms[from].bonds.push(to);
                me.icn3d.atoms[from].bondOrder.push(order);
                me.icn3d.atoms[to].bonds.push(from);
                me.icn3d.atoms[to].bondOrder.push(order);
                if(order == '2') {
                    me.icn3d.doublebonds[from + '_' + to] = 1;
                    me.icn3d.doublebonds[to + '_' + from] = 1;
                }
                else if(order == '3') {
                    me.icn3d.triplebonds[from + '_' + to] = 1;
                    me.icn3d.triplebonds[to + '_' + from] = 1;
                }
            }
        }

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for (var i in me.icn3d.atoms) {
            var atom = me.icn3d.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(atom.het) {
              if($.inArray(atom.elem, me.icn3d.ionsArray) !== -1) {
                me.icn3d.ions[atom.serial] = 1;
              }
              else {
                me.icn3d.ligands[atom.serial] = 1;
              }
            }
        } // end of for


        me.icn3d.pmin = pmin;
        me.icn3d.pmax = pmax;

        me.icn3d.cnt = cnt;

        me.icn3d.maxD = me.icn3d.pmax.distanceTo(me.icn3d.pmin);
        me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

        if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;

        me.showTitle();

        return true;
    };

    iCn3DUI.prototype.setXyzAtomSeq = function (AtomHash, moleculeNum, chainNum, residueNum) { var me = this;
        me.icn3d.displayAtoms = me.icn3d.unionHash(me.icn3d.displayAtoms, AtomHash);
        me.icn3d.highlightAtoms= me.icn3d.unionHash(me.icn3d.highlightAtoms, AtomHash);

        me.icn3d.structures[moleculeNum] = [chainNum]; //AtomHash;
        me.icn3d.chains[chainNum] = AtomHash;
        me.icn3d.residues[residueNum] = AtomHash;

        me.icn3d.residueId2Name[residueNum] = 'LIG';

        if(me.icn3d.chainsSeq[chainNum] === undefined) me.icn3d.chainsSeq[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum] === undefined ) me.icn3d.chainsAnno[chainNum] = [];
        if(me.icn3d.chainsAnno[chainNum][0] === undefined ) me.icn3d.chainsAnno[chainNum][0] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum] === undefined ) me.icn3d.chainsAnnoTitle[chainNum] = [];
        if(me.icn3d.chainsAnnoTitle[chainNum][0] === undefined ) me.icn3d.chainsAnnoTitle[chainNum][0] = [];

          var resObject = {};
          resObject.resi = 1;
          resObject.name = 'LIG';

        me.icn3d.chainsSeq[chainNum].push(resObject);
        me.icn3d.chainsAnno[chainNum][0].push(1);
        me.icn3d.chainsAnnoTitle[chainNum][0].push('');

        // determine bonds
        var serialArray = Object.keys(AtomHash);
        for(var j = 0, jl = serialArray.length; j < jl; ++j) {
            var atom0 = me.icn3d.atoms[serialArray[j]];

            for(var k = j + 1, kl = serialArray.length; k < kl; ++k) {
                var atom1 = me.icn3d.atoms[serialArray[k]];
                var maxR = 1.2 * (me.icn3d.covalentRadii[atom0.elem] + me.icn3d.covalentRadii[atom1.elem]);
                if(Math.abs(atom0.coord.x - atom1.coord.x) > maxR) continue;
                if(Math.abs(atom0.coord.y - atom1.coord.y) > maxR) continue;
                if(Math.abs(atom0.coord.z - atom1.coord.z) > maxR) continue;

                if(me.icn3d.hasCovalentBond(atom0, atom1)) {
                    me.icn3d.atoms[serialArray[j]].bonds.push(serialArray[k]);
                    me.icn3d.atoms[serialArray[k]].bonds.push(serialArray[j]);
                }
            }
        }
    },

    iCn3DUI.prototype.loadXyzAtomData = function (data) { var me = this;
        var lines = data.split(/\r?\n|\r/);
        if (lines.length < 3) return false;

        me.icn3d.init();

        var chain = 'A';
        var resn = 'LIG';
        var resi = 1;

        var AtomHash = {};
        var moleculeNum = 0, chainNum, residueNum;
        var structure, atomCount, serial=1, offset = 2;

        me.icn3d.moleculeTitle = "";

        for (var i = 0, il = lines.length; i < il; ++i) {
            var line = lines[i].trim();
            if(line === '') continue;

            if(!isNaN(line)) { // start a new molecule
                if(i !== 0) {
                    me.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);
                }

                ++moleculeNum;
                AtomHash = {};

                structure = moleculeNum;
                chainNum = structure + '_' + chain;
                residueNum = chainNum + '_' + resi;

//12
//glucose from 2gbp
//C  35.884  30.895  49.120

                atomCount = parseInt(line);
                if(moleculeNum > 1) {
                    me.icn3d.moleculeTitle += "; ";
                }
                me.icn3d.moleculeTitle += lines[i+1].trim();

                i = i + offset;
            }

            line = lines[i].trim();
            if(line === '') continue;

            var name_x_y_z = line.replace(/,/, " ").replace(/\s+/g, " ").split(" ");

            var name = name_x_y_z[0];
            var x = parseFloat(name_x_y_z[1]);
            var y = parseFloat(name_x_y_z[2]);
            var z = parseFloat(name_x_y_z[3]);
            var coord = new THREE.Vector3(x, y, z);

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

            me.icn3d.atoms[serial] = atomDetails;
            AtomHash[serial] = 1;

            ++serial;
        }

        me.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);

        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;
        // assign atoms
        for (var i in me.icn3d.atoms) {
            var atom = me.icn3d.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(atom.het) {
              if($.inArray(atom.elem, me.icn3d.ionsArray) !== -1) {
                me.icn3d.ions[atom.serial] = 1;
              }
              else {
                me.icn3d.ligands[atom.serial] = 1;
              }
            }
        } // end of for


        me.icn3d.pmin = pmin;
        me.icn3d.pmax = pmax;

        me.icn3d.cnt = cnt;

        me.icn3d.maxD = me.icn3d.pmax.distanceTo(me.icn3d.pmin);
        me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

        if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;

        me.showTitle();

        return true;
    };

    iCn3DUI.prototype.downloadMmdb = function (mmdbid) { var me = this;
       var url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&uid=" + mmdbid;

       me.icn3d.bCid = undefined;

       if(me.cfg.inpara !== undefined) {
         url += me.cfg.inpara;
       }

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
          success: function(data) {
            var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
            me.inputid = id;

            if ((me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= data.threshold && data.atoms !== undefined) ) {
                // small structure with all atoms
                // show surface options
                $("#" + me.pre + "accordion5").show();

                me.loadAtomDataIn(data, id, 'mmdbid');

                if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                    if($("#" + me.pre + "alternateWrapper") !== null) $("#" + me.pre + "alternateWrapper").hide();
                }

                //me.icn3d.inputid.idtype = "mmdbid";
                //me.icn3d.inputid.id = id;

                me.icn3d.setAtomStyleByOptions(me.options);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms, true);

                me.renderStructure();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }

            if(me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') == -1 && data.atomcount > data.threshold && data.molid2rescount !== undefined) {
                // hide surface option
                $("#" + me.pre + "accordion5").hide();

                var labelsize = 40;

                // large struture with helix/brick, phosphorus, and ligand info
                me.icn3d.bSSOnly = true;

                // do not show the sequence dialog, show the filter dialog
                me.cfg.showseq = false;

                // load atom info
                me.loadAtomDataIn(data, id, 'mmdbid');

                //me.icn3d.inputid.idtype = "mmdbid";
                //me.icn3d.inputid.id = id;

                var options2 = me.icn3d.cloneHash(me.options);
                options2['nucleotides'] = 'phosphorus lines';

                //me.options['color'] = 'spectrum';

                me.icn3d.setAtomStyleByOptions(options2);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(options2, me.icn3d.atoms, true);

                var molid2rescount = data.molid2rescount;
                var molid2color = {}, chain2molid = {}, molid2chain = {};

                var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

                var index = 1;
                for(var i in molid2rescount) {
                  var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
                  var chain = id + '_' + molid2rescount[i].chain;
                  html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='" + i + "' chain='" + chain + "'/></td><td align='center'>" + index + "</td><td align='center'>" + molid2rescount[i].chain + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

                  molid2color[i] = color;
                  chain2molid[chain] = i;
                  molid2chain[i] = chain;
                  ++index;
                }

                if(Object.keys(me.icn3d.ligands).length > 0) {
                  html += "<tr><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='ligands'/></td><td align='center'>" + index + "</td><td align='center'>Ligands</td><td align='center'>" + Object.keys(me.icn3d.ligands).length + " atoms</td></tr>";
                }

                html += "</table>";

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
                //me.options['labels'] = 'add labels';
//                me.icn3d.savedLabels = labels;

                me.icn3d.molid2ss = molid2ss;
                me.icn3d.molid2color = molid2color;

                me.renderStructure();

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

                // show the dialog to select structures
                $( "#" + me.pre + "dl_filter_table" ).html(html);

                var title = "Select chains to display";

                var id = me.pre + "dl_filter";

                me.openDialog(id, title);
            }

            if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

            if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

            if(data.atoms === undefined && data.molid2rescount === undefined) {
                alert('invalid MMDB data.');
                return false;
            }
          }
        });
    };

    iCn3DUI.prototype.downloadGi = function (gi) { var me = this;
        var mmdbid;

        // get mmdbid from gi
        var uri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=protein&db=structure&linkname=protein_structure_direct&id=" + gi;

        me.icn3d.bCid = undefined;

        //me.setLogCommand("load gi " + gi, false);

        $.ajax({
           url: uri,
           dataType: 'text',
           success: function(data) {
             if(data.indexOf('<Link>') === -1) {
               alert("There are no MMDB IDs available for the gi " + gi);
             }
             else {
               var linkStr = data.substr(data.indexOf('<Link>'));
               var start = linkStr.indexOf('<Id>');
               var end = linkStr.indexOf('</Id>');
               var mmdbid = linkStr.substr(start + 4, end - start - 4);

               me.inputid = mmdbid;

               me.downloadMmdb(mmdbid);
             }
           }
        });
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
          me.icn3d.moleculeTitle = 'Structure Alignment of ';

          for (var i = 0, il = data.aligned_structures.length; i < il; ++i) {
              var structure = data.aligned_structures[i];

              if(i === 1) {
                  me.icn3d.secondId = structure.pdbid; // set the second pdbid to add indent in the structure and chain menus
                  //me.ALTERNATE_STRUCTURE = me.icn3d.secondId;
              }

              for(var j = structure.range[0]; j <= structure.range[1]; ++j) {
                  var pdbidTmp = structure.pdbid;
                  var mmdbidTmp = structure.mmdbid;
                  serial2structure[j] = pdbidTmp.toString();
                  mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
              }

              me.icn3d.moleculeTitle +=  "<a href=\"https://www.ncbi.nlm.nih.gov/structure/?term=" + structure.pdbid.toUpperCase() + "\" target=\"_blank\" style=\"color: #00F;\">" + structure.pdbid.toUpperCase() + "</a>";

              if(structure.descr !== undefined) me.pmid += structure.descr.pubmedid;
              if(i === 0) {
                  me.icn3d.moleculeTitle += " and ";
                  if(structure.descr !== undefined) me.pmid += "_";
              }
          }
        }
        else { // mmdbid or mmcifid
              if(data.descr !== undefined) me.icn3d.moleculeTitle += data.descr.name;
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
                    var seqName = seqArray[i][1]; // mmdbid: [0,"R","ARG"],[502,"V","VAL"] mmcifid: [1, "ARG"]
                    if(type === 'mmcifid') seqName = me.icn3d.residueName2Abbr(seqName);

                    var resObject = {};
                    resObject.resi = i + 1;
                    if(seqArray[i][0] === 0 && prevResi !== -1) { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
                        resObject.name = seqName.toLowerCase();
                        ++missingResBegin;

                        bCount = true;
                    }
                    else {
                        //resObject.name = seqName;
                        resObject.name = seqName.toLowerCase();

                        if(bCount && missingResBegin > 0) {
                            if(chainMissingResArray[chain] === undefined) chainMissingResArray[chain] = [];

                            var count_nextresi = [missingResBegin, seqArray[i][0]];

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

                      prevResi = seqArray[i][0];
                }
            }
        }

        var atomid2serial = {};
        var prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
        var structureNum = '', chainNum = '', residueNum = '';
        var currContinueSeq = '';
        var oldResi, prevOldResi = -999;
        prevResi = 0; // continuous from 1 for each chain
        var missingResIndex = 0;
        var bChainSeqSet = true;
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

            if(atm.chain === undefined && (type === 'mmdbid' || type === 'align')) {
                if(type === 'mmdbid') {
                  var molid = atm.ids.m;
                  atm.chain = (molid2chain[molid] === undefined) ? 'Misc' : molid2chain[molid];
                }
                else if(type === 'align') {
                  var molid = atm.ids.m;
                  atm.chain = (pdbid_molid2chain[mmdb_id + '_' + molid] === undefined) ? 'Misc' : pdbid_molid2chain[mmdb_id + '_' + molid];
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

            atm.resi = parseInt(atm.resi); // has to be integer

            // modify resi icne MMDB used the same resi as in PDB where resi is not continuous
            // No need to modify mmcif resi
            if(type === 'mmdbid') {
                oldResi = atm.resi;

                if(atm.resi !== prevOldResi && atm.resi !== prevOldResi + 1 && chainMissingResArray[atm.chain] !== undefined && chainMissingResArray[atm.chain][missingResIndex] !== undefined && atm.resi === chainMissingResArray[atm.chain][missingResIndex][1]) {
                    // add missed residues
                    var count = chainMissingResArray[atm.chain][missingResIndex][0];
                    prevResi += count;

                    ++missingResIndex;
                }

                if(atm.resi !== prevOldResi) {
                    atm.resi = prevResi + 1;
                }
                else {
                    atm.resi = prevResi;
                }

                prevOldResi = oldResi;
            }

            me.icn3d.secondaries[atm.structure + '_' + atm.chain + '_' + atm.resi] = secondaries;

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
              me.icn3d.ligands[serial] = 1;

              //if (atm.bonds.length === 0) me.icn3d.ions[serial] = 1;
              if (atm.elem === atm.resn) me.icn3d.ions[serial] = 1;

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
            //else if(!atm.het) {
                secondaries = 'c';
            }

            if(atm.resi != prevResi) {
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

              if(type === 'mmdbid' || type === 'align') {
                    me.icn3d.chainsColor[chainid] = atm.color;
              }
            }

            prevResi = atm.resi;

            prevStructureNum = structureNum;
            prevChainNum = chainNum;
            prevResidueNum = residueNum;
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

        // set up sequence alignment
        if(type === 'align' && seqalign !== undefined) {
          //loadSeqAlignment
          var alignedAtoms = {};
          var mmdbid1 = data.aligned_structures[0].pdbid;
          var mmdbid2 = data.aligned_structures[1].pdbid;

          var conservedName1 = mmdbid1 + '_cons', nonConservedName1 = mmdbid1 + '_ncons';
          var conservedName2 = mmdbid2 + '_cons', nonConservedName2 = mmdbid2 + '_ncons';

          for (var i = 0, il = seqalign.length; i < il; ++i) {
              // first sequence
              var alignData = seqalign[i][0];
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
                  // not aligned residues also Uppercase, but italic using css
                  resn = resn.toUpperCase();

                  var aligned = alignData.mseq[j][3]; // 0 or 1

                  if(aligned == 1) {
                      if(j < start) start = j;
                      if(j > end) end = j;
                  }

                  id2aligninfo[j] = {"resi": resi, "resn": resn, "aligned": aligned};
              }

              // second sequence
              alignData = seqalign[i][1];
              var molid2 = alignData.sid;

              var chain2 = pdbid_molid2chain[mmdbid2 + '_' + molid2];
              var chainid2 = mmdbid2 + '_' + chain2;

              // annoation title for the master seq only
              if(me.icn3d.alignChainsAnnoTitle[chainid1] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][0] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][0] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][1] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][1] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][2] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][2] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][3] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][3] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][4] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][4] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][5] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][5] = [];
              if(me.icn3d.alignChainsAnnoTitle[chainid1][6] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][6] = [];

              // two annotations without titles
              me.icn3d.alignChainsAnnoTitle[chainid1][0].push("SS");
              me.icn3d.alignChainsAnnoTitle[chainid1][1].push("");
              me.icn3d.alignChainsAnnoTitle[chainid1][2].push("");
              // empty line
              me.icn3d.alignChainsAnnoTitle[chainid1][3].push("");
              // 2nd chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][4].push(chainid2);
              // master chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][5].push(chainid1);
              // empty line
              me.icn3d.alignChainsAnnoTitle[chainid1][6].push("");

              var alignIndex = 1;
              //for(var j = 0, jl = alignData.sseq.length; j < jl; ++j) {
              for(var j = start; j <= end; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //var id = alignData.sseq[j][0];
                  var resi = alignData.sseq[j][1];
                  var resn = (alignData.sseq[j][2] === '~') ? '-' : alignData.sseq[j][2];
                  // not aligned residues also Uppercase, but italic using css
                  resn = resn.toUpperCase();

                  var aligned = id2aligninfo[j].aligned + alignData.sseq[j][3]; // 0 or 2

                  var color, classname;
                  if(aligned === 2) { // aligned
                      if(id2aligninfo[j].resn === resn) {
                          color = '#F00';
                          classname = 'icn3d-cons';

                          // save concerved residues in a custom name
                          me.selectAResidue(chainid1 + '_' + id2aligninfo[j].resi, conservedName1);
                          me.selectAResidue(chainid2 + '_' + resi, conservedName2);
                      }
                      else {
                          color = '#00F';
                          classname = 'icn3d-ncons';

                          // save nonconcerved residues in a custom name
                          me.selectAResidue(chainid1 + '_' + id2aligninfo[j].resi, nonConservedName1);
                          me.selectAResidue(chainid2 + '_' + resi, nonConservedName2);
                      }

                      alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                      alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid2 + '_' + resi]);
                  }
                  else {
                      color = '#000';
                      classname = 'icn3d-nalign';
                  }

                  // chain1
                  if(me.icn3d.alignChainsSeq[chainid1] === undefined) me.icn3d.alignChainsSeq[chainid1] = [];

                  var resObject = {};
                  resObject.mmdbid = mmdbid1;
                  resObject.chain = chain1;
                  resObject.resi = id2aligninfo[j].resi;
                  // resi will be empty if there is no coordinates
                  resObject.resn = (resObject.resi === '') ? id2aligninfo[j].resn.toLowerCase() : id2aligninfo[j].resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (resObject.resi === '') ? '#ccc' : color; // not used
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
                  resObject.resn = (resObject.resi === '') ? resn.toLowerCase() : resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (resObject.resi === '') ? '#ccc' : color; // not used
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
                      if(me.icn3d.alignChainsAnno[chainid1][3] === undefined ) me.icn3d.alignChainsAnno[chainid1][3] = [];
                      // 2nd chain title
                      if(me.icn3d.alignChainsAnno[chainid1][4] === undefined ) me.icn3d.alignChainsAnno[chainid1][4] = [];
                      // master chain title
                      if(me.icn3d.alignChainsAnno[chainid1][5] === undefined ) me.icn3d.alignChainsAnno[chainid1][5] = [];
                      // empty line
                      if(me.icn3d.alignChainsAnno[chainid1][6] === undefined ) me.icn3d.alignChainsAnno[chainid1][6] = [];

                      me.icn3d.alignChainsAnno[chainid1][3].push('');
                      me.icn3d.alignChainsAnno[chainid1][4].push(me.icn3d.pdbid_chain2title[chainid2]);
                      me.icn3d.alignChainsAnno[chainid1][5].push(me.icn3d.pdbid_chain2title[chainid1]);
                      me.icn3d.alignChainsAnno[chainid1][6].push('');
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

          // assign grey color to all unaligned atoms
          var color = new THREE.Color("#BBBBBB");
          for(var i in me.icn3d.atoms) {
              if(!alignedAtoms.hasOwnProperty(i)) {
                  me.icn3d.atoms[i].color = color;
              }
          }

          seqalign = {};
        } // if(align

        me.showTitle();

        data = {};
    };

    iCn3DUI.prototype.openDialogHalfWindow = function (id, title, dialogWidth, bForceResize) {  var me = this;
        //var bExpandDialog = me.isMac() && !me.isMobile();
        var bExpandDialog = false;

        me.resizeCanvas(me.WIDTH - dialogWidth - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT, bForceResize);

        height = bExpandDialog ? 'auto' : me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;
        width = bExpandDialog ? 'auto' : dialogWidth;

        //var position={ my: "left top", at: "right top", of: "#" + me.pre + "canvas", collision: "none" };
        var position;
        if(me.cfg.showmenu) {
            position ={ my: "left top", at: "right top+80", of: "#" + me.pre + "viewer", collision: "none" };
        }
        else {
            position ={ my: "left top", at: "right top", of: "#" + me.pre + "viewer", collision: "none" };
        }

        // disable resize
        me.cfg.resize = false;

        window.dialog = $( "#" + id ).dialog({
          autoOpen: true,
          title: title,
          height: height,
          width: width,
          modal: false,
          position: position,
          close: function(e) {
              //me.cfg.resize = true;
              me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT, bForceResize);
          }
        });

        // scroll to the left when expanding the sequence window
        //if(bExpandDialog) $("#" + id).scrollLeft(0);
    };

    iCn3DUI.prototype.openDialog = function (id, title) {  var me = this;
        var width = 400, height = 150;

        //var bExpandDialog = me.isMac() && !me.isMobile();
        var bExpandDialog = false;

        if(id === me.pre + 'dl_selectresidues' || id === me.pre + 'dl_alignment' || id === me.pre + 'dl_filter') {
            var filterWidth = (0.5 * me.WIDTH > 250) ? 250 : 0.5 * (me.WIDTH - me.LESSWIDTH);
            var dialogWidth = (id === me.pre + 'dl_filter') ? filterWidth : 0.5 * (me.WIDTH - me.LESSWIDTH);

            //if(window_width > window_height && !me.isMobile()) {
            if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
                me.openDialogHalfWindow(id, title, dialogWidth, true);
            }
            else {
                me.resizeCanvas(me.WIDTH - me.LESSWIDTH, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5 + me.EXTRAHEIGHT, true);

                //height = bExpandDialog ? 'auto' : 250;
                height = bExpandDialog ? 'auto' : (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5;

                width = bExpandDialog ? 'auto' : me.WIDTH - me.LESSWIDTH;

                // 0.8 * me.MENU_HEIGHT = 32
                var position ={ my: "left top", at: "left bottom+32", of: "#" + me.pre + "canvas", collision: "none" };

                window.dialog = $( "#" + id ).dialog({
                  autoOpen: true,
                  title: title,
                  height: height,
                  width: width,
                  modal: false,
                  position: position,
                  close: function(e) {
                      //me.cfg.resize = true;
                      me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT, true);
                  }
                });

                // scroll to the left when expanding the sequence window
                //if(bExpandDialog) $("#" + id).scrollLeft(0);
            }
        }
        else {
            height = 'auto';
            width = 'auto';

            var position;

            if(me.isMobile()) {
                position ={ my: "left top", at: "left bottom-50", of: "#" + me.pre + "canvas", collision: "none" };
            }
            else {
                position ={ my: "left top", at: "left top+50", of: "#" + me.pre + "canvas", collision: "none" };
            }

            window.dialog = $( "#" + id ).dialog({
              autoOpen: true,
              title: title,
              height: height,
              width: width,
              modal: false,
              position: position
            });
        }

        $(".ui-dialog .ui-button span")
          .removeClass("ui-icon-closethick")
          .addClass("ui-icon-close");
    };

    iCn3DUI.prototype.resizeCanvas = function (width, height, bForceResize) { var me = this;
      if( (bForceResize !== undefined && bForceResize) || (me.cfg.resize !== undefined && me.cfg.resize) ) {
        var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
        $("#" + me.pre + "canvas").width(width).height(heightTmp);

        $("#" + me.pre + "viewer").width(width).height(height);

        me.icn3d.setWidthHeight(width, heightTmp);

        me.icn3d.draw();
      }
    };

    iCn3DUI.prototype.windowResize = function() { var me = this;
        if(me.cfg.resize !== undefined && me.cfg.resize && !me.isMobile() ) {
            $(window).resize(function() {
                me.WIDTH = $( window ).width();
                me.HEIGHT = $( window ).height();

                var width = me.WIDTH - me.LESSWIDTH_RESIZE;
                var height = me.HEIGHT - me.LESSHEIGHT;

                if(me.icn3d !== undefined) me.resizeCanvas(width, height);
            });
        }
    };

    iCn3DUI.prototype.setViewerWidthHeight = function() { var me = this;
        //var width = window.innerWidth, height = window.innerHeight;
        me.WIDTH = $( window ).width();
        me.HEIGHT = $( window ).height();

        var viewer_width = $( "#" + me.pre + "viewer" ).width();
        var viewer_height = $( "#" + me.pre + "viewer" ).height();

        if(viewer_width && me.WIDTH > viewer_width) me.WIDTH = viewer_width;
        if(viewer_height && me.height > viewer_height) me.height = viewer_height;

        if(me.isMac() && me.isMobile()) {
          if(me.WIDTH < me.MENU_WIDTH) me.WIDTH = me.MENU_WIDTH;

          me.HEIGHT = $( window ).height() / $( window ).width() * me.MENU_WIDTH;
        }

        if(me.cfg.width.toString().indexOf('%') === -1) {
            me.WIDTH = parseInt(me.cfg.width) + me.LESSWIDTH;
        }

        if(me.cfg.height.toString().indexOf('%') === -1) {
            me.HEIGHT = parseInt(me.cfg.height) + me.EXTRAHEIGHT + me.LESSHEIGHT;
        }
    };
