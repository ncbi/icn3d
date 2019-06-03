/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
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

    me.ROT_DIR = 'right';
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

    me.opts = {};
    me.opts['camera']             = 'perspective';        //perspective, orthographic
    me.opts['background']         = 'transparent';        //transparent, black, grey, white
    me.opts['color']              = 'chain';              //spectrum, secondary structure, charge, hydrophobic, chain, residue, atom, b factor, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.opts['proteins']           = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
    me.opts['sidec']              = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    me.opts['nucleotides']        = 'nucleotide cartoon'; //nucleotide cartoon, o3 trace, schematic, lines, stick,
                                                              // nucleotides ball and stick, sphere, nothing
    me.opts['surface']            = 'nothing';            //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    me.opts['opacity']            = '1.0';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.opts['wireframe']          = 'no';                 //yes, no
    me.opts['map']                = 'nothing';            //2fofc, fofc
    me.opts['mapwireframe']       = 'yes';                //yes, no
    me.opts['chemicals']          = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    me.opts['water']              = 'nothing';            //sphere, dot, nothing
    me.opts['ions']               = 'sphere';             //sphere, dot, nothing
    me.opts['hbonds']             = 'no';                 //yes, no
    me.opts['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.opts['axis']               = 'no';                 //yes, no
    me.opts['fog']                = 'no';                 //yes, no
    me.opts['slab']               = 'no';                 //yes, no
    me.opts['pk']                 = 'residue';            //no, atom, residue, strand
    me.opts['chemicalbinding']      = 'hide';               //show, hide

    if(me.cfg.cid !== undefined) {
        me.opts['pk'] = 'atom';
        me.opts['chemicals'] = 'ball and stick';
        me.opts['color'] = 'atom';
    }

    if(me.cfg.options !== undefined) jQuery.extend(me.opts, me.cfg.options);

    me.modifyIcn3d();
};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    // modify me.icn3d function
    modifyIcn3d: function() {var me = this;
        me.modifyIcn3dshowPicking();
    },

    modifyIcn3dshowPicking: function() {var me = this;
        iCn3D.prototype.showPicking = function(atom, x, y) {
          if(me.cfg.cid !== undefined) {
              this.pk = 1; // atom
          }
          else {
              this.pk = 2; // residue
          }

          this.showPickingBase(atom, x, y); // including render step

          if(x !== undefined && y !== undefined) { // mouse over
            var text = (this.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            $("#" + me.pre + "popup").html(text);
            $("#" + me.pre + "popup").css("top", y).css("left", x+20).show();
          }

/*
          var residueText = atom.resn + atom.resi;

          var text;
          if(me.cfg.cid !== undefined) {
              text = atom.name;
              this.pk = 1; // atom
          }
          else {
              text = residueText + '@' + atom.name;
              this.pk = 2; // residue
          }

          var labels = {};
          labels['custom'] = [];

          var label = {};
          label.position = new THREE.Vector3(atom.coord.x + 1, atom.coord.y + 1, atom.coord.z + 1); // shifted by 1

          if(this.pk === 1) {
            label.text = text;
          }
          else if(this.pk === 2) {
            label.text = residueText;
          }

          label.background = "#CCCCCC";

          labels['custom'].push(label);

          //http://www.johannes-raida.de/tutorials/three.js/tutorial13/tutorial13.htm
          this.createLabelRepresentation(labels);
*/
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

        if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
          $("#" + me.pre + "toolbox").hide();
        }
        else {
          $("#" + me.pre + "toolbox").show();
        }

        if(me.cfg.showtitle != undefined && me.cfg.showtitle == false) {
          $("#" + me.pre + "title").hide();
        }
        else {
          $("#" + me.pre + "title").show();
        }

        me.icn3d = new iCn3D(me.pre + 'canvas');
        if(!me.isMobile()) me.icn3d.scaleFactor = 2.0;

        me.handleContextLost();

        if(me.cfg.bCalphaOnly !== undefined) me.icn3d.bCalphaOnly = me.cfg.bCalphaOnly;

        me.loadStructure();
    },

    setHtml: function() { var me = this;
        var html = "";

        html += "<div id='" + me.pre + "viewer' style='position:relative; width:100%; height:100%;'>";

        html += "<div id='" + me.pre + "popup' class='icn3d-text icn3d-popup'></div>";

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
        html += "<select id='" + me.pre + "sidec'>";
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
        html += "<option value='nucleotide cartoon' selected>Cartoon</option>";
        html += "<option value='o3 trace'>O3' Trace</option>";
        html += "<option value='schematic'>Schematic</option>";
        html += "<option value='lines'>Lines</option>";
        html += "<option value='stick'>Stick</option>";
        html += "<option value='ball and stick'>Ball and Stick</option>";
        html += "<option value='sphere'>Sphere</option>";
        html += "<option value='nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Chemicals&nbsp;</b>";
        html += "<select id='" + me.pre + "chemicals'>";
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
        html += "<b>&nbsp;&nbsp;Chemicals&nbsp;</b>";
        html += "<select id='" + me.pre + "chemicals'>";
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
            html += "<option value='spectrum'>Spectrum</option>";

            html += "<option value='secondary structure'>Secondary Structure</option>";

            html += "<option value='charge'>Charge</option>";
            html += "<option value='hydrophobic'>Hydrophobic</option>";

            html += "<option value='chain' selected>Chain</option>";

            html += "<option value='residue'>Residue</option>";
            html += "<option value='atom'>Atom</option>";
            html += "<option value='b factor'>B-factor</option>";
        }
        else {
            html += "<option value='atom' selected>Atom</option>";
        }

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

            html += "&nbsp;&nbsp;<b>Select</b>: hold \"Alt\" and select<br/>";
            html += "&nbsp;&nbsp;<b>Union</b>: hold \"Ctrl\" to union<br/>";
            html += "&nbsp;&nbsp;<b>Switch</b>: after picking, press up/down arrow";
            html += "</div>";
        }

        html += "<div class='icn3d-option'>";
        html += "&nbsp;&nbsp;<button id='" + me.pre + "saveimage'>Save Image</button> <button id='" + me.pre + "reset'>Reset</button> <button id='" + me.pre + "help'>Help</button>";
        html += "</div>";

        html += "</form>";
        html += "</div>";
        html += "</div>";

        html += "</div>";

        html += "<!-- dialog will not be part of the form -->";
        html += "<div id='" + me.pre + "alldialogs' class='icn3d-hidden'>";

        // filter for large structure
        //html += "<div id='" + me.pre + "dl_filter' style='overflow:auto; position:relative'>";

        //html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
        //html += "<button id='" + me.pre + "label_3d_dgm' style='margin-left:10px;'><span style='white-space:nowrap'><b>Show Labels</b></span></button></div>";
        //html += "  <div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
        //html += "  </div>";
        //html += "</div>";

        html += "</div>";

        return html;
    },

    loadStructure: function() { var me = this;
        me.icn3d.molTitle = '';

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
            me.downloadGi(me.cfg.gi);
        }
        else if(me.cfg.cid !== undefined) {
           me.inputid = me.cfg.cid;
           var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + me.cfg.cid + "/description/jsonp";
           $.ajax({
              url: url,
              dataType: 'jsonp',
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                  if(data.InformationList !== undefined && data.InformationList.Information !== undefined) me.icn3d.molTitle = data.InformationList.Information[0].Title;
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
            //me.icn3d.draw(me.opts);

            jQuery.extend(me.icn3d.opts, me.opts);
            me.icn3d.draw();
        }
        else {
            me.icn3d.draw();
        }
    },

    selectAll: function() { var me = this;
          // select all atoms again
          for(var i in me.icn3d.atoms) {
              me.icn3d.hAtoms[i] = 1;
          }
    },

    setCamera: function(id, value) { var me = this;
      me.icn3d.opts[id] = value;

      me.icn3d.draw();
    },

    setColor: function(id, value) { var me = this;
      me.icn3d.opts[id] = value;

      me.selectAll();

      me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.atoms);

      me.icn3d.draw();
    },

    setStyle: function(selectionType, style) { var me = this;
      var atoms = {};

      me.selectAll();

      switch (selectionType) {
          case 'proteins':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.proteins);
              break;
          case 'sidec':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.sidec);
              calpha_atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.calphas);
              // include calphas
              atoms = me.icn3d.unionHash(atoms, calpha_atoms);
              break;
          case 'nucleotides':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.nucleotides);
              break;
          case 'chemicals':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.chemicals);
              break;
          case 'ions':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.ions);
              break;
          case 'water':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.water);
              break;
      }

      // draw sidec separatedly
      if(selectionType === 'sidec') {
          for(var i in atoms) {
            me.icn3d.atoms[i].style2 = style;
          }
      }
      else {
          for(var i in atoms) {
            me.icn3d.atoms[i].style = style;
          }
      }

      me.icn3d.opts[selectionType] = style;

      me.icn3d.draw();
    },

    clickTab: function() { var me = this;
        $('.icn3d-bottomTab').click(function (e) {
           var height = $(".icn3d-insideTab").height();
           if(height === 0) {
                $(".icn3d-insideTab").height(260);
           }
           else {
             $(".icn3d-insideTab").height(0);
           }
        });
    },

/*
    clickPicking: function() { var me = this;
        $("#" + me.pre + "enablepick").click(function(e) {
           e.preventDefault();

           if(me.cfg.cid !== undefined) {
               me.icn3d.pk = 1;
               me.icn3d.opts['pk'] = 'atom';
           }
           else {
               me.icn3d.pk = 2;
               me.icn3d.opts['pk'] = 'residue';
           }

        });
    },

    clickNoPicking: function() { var me = this;
        $("#" + me.pre + "disablepick").click(function(e) {
           e.preventDefault();

           me.icn3d.pk = 0;
           me.icn3d.opts['pk'] = 'no';
           //me.icn3d.draw(undefined, false);
           me.icn3d.draw();
           me.icn3d.removeHlObjects();

        });
    },
*/

    changeProteinStyle: function() { var me = this;
        $("#" + me.pre + "proteins").change(function(e) {
           e.preventDefault();

           $("#" + me.pre + "sidec").val("nothing");
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            e.preventDefault();

            //me.loadStructure();
            me.icn3d.resetOrientation();

            me.icn3d.draw();
        });
    },

    clickSaveimage: function() { var me = this;
        $("#" + me.pre + "saveimage").click(function (e) {
            e.preventDefault();

            var file_pref = (me.inputid) ? me.inputid : "custom";

            me.saveFile(file_pref + '_image.png', 'png');
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

            var chemicalFlag = "&het=0";
            for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
              if(ckbxes[i].checked) {
                  if(ckbxes[i].value == 'chemicals') {
                      chemicalFlag = "&het=2";
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

            var url = document.URL + "&mols=" + mols + "&complexity=2" + chemicalFlag;

            window.open(url, '_self');
        });
    },

    changeSelection: function() { var me = this;
        ['camera', 'color', 'sidec', 'proteins', 'chemicals', 'water', 'ions', 'nucleotides'].forEach(function (opt) {
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
//        me.clickPicking();
//        me.clickNoPicking();
        me.changeProteinStyle();
        me.clickReset();
        me.clickSaveimage();
        me.clickHelp();
        me.showSubsets();
        //me.clickHighlight_3d_dgm();
        me.windowResize();
        me.changeSelection();
    },

    allCustomEvents: function() { var me = this;
      // add custom events here
    },

    download2Ddgm: function(mmdbid, structureIndex) {var me = this;
      // not used in simple version, but called in common API downloadMmdb()
    }
};
