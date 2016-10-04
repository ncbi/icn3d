/*! simple_ui.js
 * @author Jiyao Wang / https://github.com/ncbi/me.icn3d
 * simple UI of me.icn3d
 */

var iCn3DUI = function(cfg) {
    var me = this;

    me.bFullUi = false;

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    me.inputid = '';

    me.WIDTH = 400; // total width of view area
    me.HEIGHT = 400; // total height of view area

    me.RESIDUE_WIDTH = 10;  // sequences
    me.MENU_HEIGHT = 0; //40;

    // used to set the position for the log/command textarea
    me.MENU_WIDTH = $( window ).width(); //690;

    me.LESSWIDTH = 0;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROTATION_DIRECTION = 'right';
    me.bHideSelection = true;
    me.ALTERNATE_STRUCTURE = -1;

    me.EXTRAHEIGHT = 0;

    me.GREY8 = "#888888"; // style protein grey
    me.GREYB = "#BBBBBB";
    me.GREYC = "#CCCCCC"; // grey background
    me.GREYD = "#DDDDDD";

    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;
    me.selectedResidues = {};

    me.bCrashed = false;
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

        html += "<div id='" + me.pre + "title' style='position:absolute; top:20px; left:80px; color:" + me.GREYD + ";'></div>";

        if(me.cfg.mmtfid === undefined) html += "<div id='" + me.pre + "wait' style='width:100%; height: 100%; background-color: rgba(0,0,0, 0.8);'><div style='padding-top:15%; text-align: center; font-size: 2em; color: #FFFF00;'>Loading the structure...</div></div>";

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
            html += "<option value='hydrophobic'>Hydrophobic</option>";
            html += "<option value='chain'>Chain</option>";
            html += "<option value='residue'>Residue</option>";
        }
        html += "<option value='atom'>Atom</option>";
        if(me.cfg.align !== undefined) {
            html += "<option value='conserved'>Identity</option>";
        }
        html += "<option value='red'>Red</option>";
        html += "<option value='green'>Green</option>";
        html += "<option value='blue'>Blue</option>";
        html += "<option value='magenta'>Magenta</option>";
        html += "<option value='yellow'>Yellow</option>";
        html += "<option value='cyan'>Cyan</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Camera&nbsp;</b>";
        html += "<select id='" + me.pre + "camera'>";
        html += "<option value='perspective' selected>Perspective</option>";
        html += "<option value='orthographic'>Orthographic</option>";
        html += "</select>";
        html += "</div>";

        if(!me.isMobile()) {
            html += "<div class='icn3d-option'>";

            html += "&nbsp;&nbsp;<b>Pick</b>: hold \"Alt\" and pick<br/>";
            html += "&nbsp;&nbsp;<b>Union</b>: hold \"Ctrl\" to union<br/>";
            html += "&nbsp;&nbsp;<b>Switch</b>: after picking, press up/down arrow";
            html += "</div>";
        }

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

        if(me.cfg.mmtfid !== undefined) {
           me.inputid = me.cfg.mmtfid;

           me.downloadMmtf(me.cfg.mmtfid);
        }
        else if(me.cfg.pdbid !== undefined) {
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
        else if(me.cfg.url !== undefined) {
            var type_url = me.cfg.url.split('|');
            var type = type_url[0];
            var url = type_url[1];

            me.inputid = undefined;

            me.downloadUrl(url, type);
        }
        else {
            alert("Please input a gi, MMDB ID, PDB ID, CID, or mmCIF ID...");
        }
    },

    renderStructure: function(bInitial) { var me = this;
        if(bInitial) {
            //me.icn3d.draw(me.options);

            jQuery.extend(me.icn3d.options, me.options);
            me.icn3d.draw();
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

    setCamera: function(id, value) { var me = this;
      me.icn3d.options[id] = value;

      me.icn3d.draw();
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
                $(".icn3d-insideTab").height(250);
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
           //me.icn3d.draw(undefined, false);
           me.icn3d.draw();
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

            window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html', '_blank');
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

    changeSelection: function() { var me = this;
        ['camera', 'color', 'sidechains', 'proteins', 'ligands', 'water', 'ions', 'nucleotides'].forEach(function (opt) {
            $('#' + me.pre + opt).change(function (e) {
                if(opt === 'camera') {
                  me.setCamera(opt, $('#' + me.pre + opt).val());
                }
                else if(opt === 'color') {
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
