/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

var iCn3DUI = function(cfg) {
    var me = this, ic = me.icn3d; "use strict";

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

    me.baseUrl = "https://structure.ncbi.nlm.nih.gov/";

    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;
    me.selectedResidues = {};

    me.bCrashed = false;
    me.prevCommands = "";

    me.opts = {};
    me.opts['camera']             = 'perspective';        //perspective, orthographic
    me.opts['background']         = 'transparent';        //transparent, black, grey, white
    me.opts['color']              = 'chain';              //spectrum, secondary structure, charge, hydrophobic, chain, residue, atom, b factor, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.opts['proteins']           = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, backbone, b factor tube, lines, stick, ball and stick, sphere, nothing
    me.opts['sidec']              = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    me.opts['nucleotides']        = 'nucleotide cartoon'; //nucleotide cartoon, o3 trace, backbone, schematic, lines, stick,
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

    // modify ic function
    modifyIcn3d: function() { var  me = this; "use strict";
        me.modifyIcn3dshowPicking();
    },

    modifyIcn3dshowPicking: function() { var  me = this; "use strict";
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
        };
    },

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this; //"use strict";
        var html = me.setHtml();

        $( "#" + me.divid).html(html);

        me.setViewerWidthHeight();

        var width = me.WIDTH; // - me.LESSWIDTH_RESIZE;
        var height = me.HEIGHT; // - me.LESSHEIGHT - me.EXTRAHEIGHT;

        me.oriWidth = width;
        me.oriHeight = height;

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
        var ic = me.icn3d;

        ic.setControl(); // rotation, translation, zoom, etc

        me.handleContextLost();

        if(me.cfg.bCalphaOnly !== undefined) ic.bCalphaOnly = me.cfg.bCalphaOnly;

        me.loadStructure();
    },

    setHtml: function() { var me = this, ic = me.icn3d; "use strict";
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

        var optStr = "<option value=";

        if(me.cfg.cid === undefined) {
        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Proteins&nbsp;</b>";
        html += "<select id='" + me.pre + "proteins'>";
        html += optStr + "'ribbon' selected>Ribbon</option>";
        html += optStr + "'strand'>Strand</option>";
        html += optStr + "'cylinder and plate'>Cylinder and Plate</option>";
        html += optStr + "'schematic'>Schematic</option>";
        html += optStr + "'c alpha trace'>C Alpha Trace</option>";
        html += optStr + "'backbone'>Backbone</option>";
        html += optStr + "'b factor tube'>B Factor Tube</option>";
        html += optStr + "'lines'>Lines</option>";
        html += optStr + "'stick'>Stick</option>";
        html += optStr + "'ball and stick'>Ball and Stick</option>";
        html += optStr + "'sphere'>Sphere</option>";
        html += optStr + "'nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Side Chains&nbsp;</b>";
        html += "<select id='" + me.pre + "sidec'>";
        html += optStr + "'lines'>Lines</option>";
        html += optStr + "'stick'>Stick</option>";
        html += optStr + "'ball and stick'>Ball and Stick</option>";
        html += optStr + "'sphere'>Sphere</option>";
        html += optStr + "'nothing' selected>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Nucleotides&nbsp;</b>";
        html += "<select id='" + me.pre + "nucleotides'>";
        html += optStr + "'nucleotide cartoon' selected>Cartoon</option>";
        html += optStr + "'o3 trace'>O3' Trace</option>";
        html += optStr + "'backbone'>Backbone</option>";
        html += optStr + "'schematic'>Schematic</option>";
        html += optStr + "'lines'>Lines</option>";
        html += optStr + "'stick'>Stick</option>";
        html += optStr + "'ball and stick'>Ball and Stick</option>";
        html += optStr + "'sphere'>Sphere</option>";
        html += optStr + "'nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Chemicals&nbsp;</b>";
        html += "<select id='" + me.pre + "chemicals'>";
        html += optStr + "'lines'>Lines</option>";
        html += optStr + "'stick' selected>Stick</option>";
        html += optStr + "'ball and stick'>Ball and Stick</option>";
        html += optStr + "'schematic'>Schematic</option>";
        html += optStr + "'sphere'>Sphere</option>";
        html += optStr + "'nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";
        }
        else {
        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Chemicals&nbsp;</b>";
        html += "<select id='" + me.pre + "chemicals'>";
        html += optStr + "'lines'>Lines</option>";
        html += optStr + "'stick'>Stick</option>";
        html += optStr + "'ball and stick' selected>Ball and Stick</option>";
        html += optStr + "'schematic'>Schematic</option>";
        html += optStr + "'sphere'>Sphere</option>";
        html += optStr + "'nothing'>Hide</option>";
        html += "</select>";
        html += "</div>";
        }

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Color&nbsp;</b>";
        html += "<select id='" + me.pre + "color'>";
        if(me.cfg.cid === undefined) {
            html += optStr + "'spectrum'>Spectrum</option>";

            html += optStr + "'secondary structure'>Secondary Structure</option>";

            html += optStr + "'charge'>Charge</option>";
            html += optStr + "'hydrophobic'>Hydrophobic</option>";

            html += optStr + "'chain' selected>Chain</option>";

            html += optStr + "'residue'>Residue</option>";
            html += optStr + "'atom'>Atom</option>";
            html += optStr + "'b factor'>B-factor</option>";
        }
        else {
            html += optStr + "'atom' selected>Atom</option>";
        }

        if(me.cfg.align !== undefined) {
            html += optStr + "'conserved'>Identity</option>";
        }
        html += optStr + "'red'>Red</option>";
        html += optStr + "'green'>Green</option>";
        html += optStr + "'blue'>Blue</option>";
        html += optStr + "'magenta'>Magenta</option>";
        html += optStr + "'yellow'>Yellow</option>";
        html += optStr + "'cyan'>Cyan</option>";
        html += "</select>";
        html += "</div>";

        html += "<div class='icn3d-option'>";
        html += "<b>&nbsp;&nbsp;Camera&nbsp;</b>";
        html += "<select id='" + me.pre + "camera'>";
        html += optStr + "'perspective' selected>Perspective</option>";
        html += optStr + "'orthographic'>Orthographic</option>";
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

        html += "</div>";

        return html;
    },

    loadStructure: function() { var me = this, ic = me.icn3d; "use strict";
        ic.molTitle = '';

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
                  if(data.InformationList !== undefined && data.InformationList.Information !== undefined) ic.molTitle = data.InformationList.Information[0].Title;
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

    renderStructure: function() { var me = this, ic = me.icn3d; "use strict";
        if(ic.bInitial) {
          //ic.draw(me.opts);

          jQuery.extend(ic.opts, me.opts);
          ic.draw();

          if(ic.bOpm) {
              var axis = new THREE.Vector3(1,0,0);
              var angle = -0.5 * Math.PI;

              ic.setRotation(axis, angle);
          }
        }
        else {
          ic.draw();
        }

        ic.bInitial = false;

        if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    },

    selectAll: function() { var me = this, ic = me.icn3d; "use strict";
          // select all atoms again
          for(var i in ic.atoms) {
              ic.hAtoms[i] = 1;
          }
    },

    setCamera: function(id, value) { var me = this, ic = me.icn3d; "use strict";
      ic.opts[id] = value;

      ic.draw();
    },

    setColor: function(id, value) { var me = this, ic = me.icn3d; "use strict";
      ic.opts[id] = value;

      me.selectAll();

      ic.setColorByOptions(ic.opts, ic.atoms);

      ic.draw();
    },

    setStyle: function(selectionType, style) { var me = this, ic = me.icn3d; "use strict";
      var atoms = {};

      me.selectAll();

      switch (selectionType) {
          case 'proteins':
              atoms = ic.intHash(ic.hAtoms, ic.proteins);
              break;
          case 'sidec':
              atoms = ic.intHash(ic.hAtoms, ic.sidec);
              calpha_atoms = ic.intHash(ic.hAtoms, ic.calphas);
              // include calphas
              atoms = ic.unionHash(atoms, calpha_atoms);
              break;
          case 'nucleotides':
              atoms = ic.intHash(ic.hAtoms, ic.nucleotides);
              break;
          case 'chemicals':
              atoms = ic.intHash(ic.hAtoms, ic.chemicals);
              break;
          case 'ions':
              atoms = ic.intHash(ic.hAtoms, ic.ions);
              break;
          case 'water':
              atoms = ic.intHash(ic.hAtoms, ic.water);
              break;
      }

      // draw sidec separatedly
      if(selectionType === 'sidec') {
          for(var i in atoms) {
            ic.atoms[i].style2 = style;
          }
      }
      else {
          for(var i in atoms) {
            ic.atoms[i].style = style;
          }
      }

      ic.opts[selectionType] = style;

      ic.draw();
    },

    clickTab: function() { var me = this, ic = me.icn3d; "use strict";
        $("#" + me.pre + "toolbox > .icn3d-bottomTab").click(function (e) {
           var height = $("#" + me.pre + "toolbox > .icn3d-insideTab").height();
           if(height === 0) {
                $("#" + me.pre + "toolbox > .icn3d-insideTab").height(260);
           }
           else {
             $("#" + me.pre + "toolbox > .icn3d-insideTab").height(0);
           }
        });
    },

    changeProteinStyle: function() { var me = this, ic = me.icn3d; "use strict";
        $("#" + me.pre + "proteins").change(function(e) {
           e.preventDefault();

           $("#" + me.pre + "sidec").val("nothing");
        });
    },

    clickReset: function() { var me = this, ic = me.icn3d; "use strict";
        $("#" + me.pre + "reset").click(function (e) {
            e.preventDefault();

            //me.loadStructure();
            ic.resetOrientation();

            ic.draw();
        });
    },

    clickSaveimage: function() { var me = this, ic = me.icn3d; "use strict";
        $("#" + me.pre + "saveimage").click(function (e) {
            e.preventDefault();

            var file_pref = (me.inputid) ? me.inputid : "custom";

            me.saveFile(file_pref + '_image.png', 'png');
        });
    },

    clickHelp: function() { var me = this, ic = me.icn3d; "use strict";
        $("#" + me.pre + "help").click(function (e) {
            e.preventDefault();

            window.open('https://structure.ncbi.nlm.nih.gov/icn3d/docs/icn3d_help.html', '_blank');
        });
    },

    showSubsets: function() { var me = this, ic = me.icn3d; "use strict";
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

    changeSelection: function() { var me = this, ic = me.icn3d; "use strict";
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

    allEventFunctions: function() { var me = this, ic = me.icn3d; "use strict";
        me.clickTab();

        me.changeProteinStyle();
        me.clickReset();
        me.clickSaveimage();
        me.clickHelp();
        me.showSubsets();
        me.windowResize();
        me.changeSelection();
    },

    allCustomEvents: function() { var me = this, ic = me.icn3d; "use strict";
      // add custom events here
    },

    download2Ddgm: function(mmdbid, structureIndex) { var  me = this; "use strict";
      // not used in simple version, but called in common API downloadMmdb()
    }
};
