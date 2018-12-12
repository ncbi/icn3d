/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

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

    me.bFullUi = true;

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    me.inputid = '';

    me.setOperation = 'or'; // by default the set operation is 'or'

    me.WIDTH = 400; // total width of view area
    me.HEIGHT = 400; // total height of view area

    me.RESIDUE_WIDTH = 10;  // sequences
    me.MENU_HEIGHT = 40;

    // used to set the position for the log/command textarea
    //me.MENU_WIDTH = 690;
    me.MENU_WIDTH = 750;

    me.LESSWIDTH = 20;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROT_DIR = 'right';
    me.bHideSelection = true;

    me.CMD_HEIGHT = 0.8*me.MENU_HEIGHT;

    //me.EXTRAHEIGHT = 2*me.MENU_HEIGHT + me.CMD_HEIGHT;
    me.EXTRAHEIGHT = me.MENU_HEIGHT + me.CMD_HEIGHT;
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
        //me.EXTRAHEIGHT -= 2*me.MENU_HEIGHT;
        me.EXTRAHEIGHT -= me.MENU_HEIGHT;
    }
    if(me.cfg.showcommand != undefined && me.cfg.showcommand == false) {
        me.EXTRAHEIGHT -= me.CMD_HEIGHT;
    }

    me.GREY8 = "#888888"; // style protein grey
    me.GREYB = "#BBBBBB";
    me.GREYC = "#CCCCCC"; // grey background
    me.GREYD = "#DDDDDD";
    me.ORANGE = "#FFA500";

    me.opts = {};
    me.opts['camera']             = 'perspective';        //perspective, orthographic
    me.opts['background']         = 'transparent';        //transparent, black, grey, white
    me.opts['color']              = 'chain';              //spectrum, secondary structure, charge, hydrophobic, conserved, chain, residue, atom, b factor, red, green, blue, magenta, yellow, cyan, white, grey, custom
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
    //me.opts['stabilizer']           = 'no';                 //yes, no
    me.opts['ssbonds']            = 'yes';                 //yes, no
    me.opts['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.opts['axis']               = 'no';                 //yes, no
    me.opts['fog']                = 'no';                 //yes, no
    me.opts['slab']               = 'no';                 //yes, no
    me.opts['pk']                 = 'residue';            //no, atom, residue, strand, chain
    me.opts['chemicalbinding']      = 'hide';               //show, hide

    if(me.cfg.align !== undefined) me.opts['color'] = 'conserved';
    if(me.cfg.cid !== undefined) me.opts['color'] = 'atom';

    if(me.cfg.options !== undefined) jQuery.extend(me.opts, me.cfg.options);

    me.init();

    me.modifyIcn3d();


};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    init: function () { var me = this;
        me.bSelectResidue = false;
        me.bSelectAlignResidue = false;
        me.selectedResidues = {};

        me.bAnnoShown = false;
        me.bSetChainsAdvancedMenu = false;
        me.b2DShown = false;

        me.bCrashed = false;
        me.prevCommands = "";

        me.bAddCommands = true;
        me.bAddLogs = true;

        me.bNotLoadStructure = false;

        me.bInitial = true;

        $("#" + me.pre + "dl_annotations").html('');
        $("#" + me.pre + "dl_2ddgm").html('');
    },

    // modify iCn3D function
    modifyIcn3d: function() {var me = this;
        me.modifyIcn3dshowPicking();
        me.modifySwitchHighlightLevel();
    },

    allCustomEvents: function() { var me = this;
      // add custom events here
    },

    setCustomDialogs: function() { var me = this;
        var html = "";

        return html;
    },

    modifyIcn3dshowPicking: function() {var me = this;
        iCn3D.prototype.showPicking = function(atom, x, y) {
          if(me.cfg.cid !== undefined) {
              this.pk = 1; // atom
          }
          else {
              // do not change the picking option
          }

          this.showPickingBase(atom, x, y);

          if(x !== undefined && y !== undefined) { // mouse over
            if(me.cfg.showmenu != undefined && me.cfg.showmenu == true) {
                y += me.MENU_HEIGHT;
            }

            var text = (this.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            $("#" + me.pre + "popup").html(text);
            $("#" + me.pre + "popup").css("top", y).css("left", x+20).show();
          }
          else {
              // highlight the sequence background
              var idArray = this.id.split('_'); // id: div0_canvas
              me.pre = idArray[0] + "_";

              me.updateHlAll();

              var transformation = {};
              transformation.factor = this._zoomFactor;
              transformation.mouseChange = this.mouseChange;
              //transformation.quaternion = this.quaternion;
              transformation.quaternion = {};
              transformation.quaternion._x = parseFloat(this.quaternion._x).toPrecision(5);
              transformation.quaternion._y = parseFloat(this.quaternion._y).toPrecision(5);
              transformation.quaternion._z = parseFloat(this.quaternion._z).toPrecision(5);
              transformation.quaternion._w = parseFloat(this.quaternion._w).toPrecision(5);

              if(me.bAddCommands) {
                  this.commands.push('pickatom ' + atom.serial + '|||' + me.getTransformationStr(transformation));
                  this.optsHistory.push(this.cloneHash(this.opts));
                  this.optsHistory[this.optsHistory.length - 1].hlatomcount = Object.keys(this.hAtoms).length;

                  if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                  me.STATENUMBER = this.commands.length;
              }

              this.logs.push('pickatom ' + atom.serial + ' (chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
              if ( $( "#" + me.pre + "logtext" ).length )  {
                $("#" + me.pre + "logtext").val("> " + this.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
              }
          }
/*
          // add label
          var residueText = atom.resn + atom.resi;

          var text;
          if(me.cfg.cid !== undefined) {
              text = atom.name;
              this.pk = 1; // atom
          }
          else {
              text = residueText + '@' + atom.name;
              // do not change the picking option
              //this.pk = 2; // residue
          }

          var labels = {};
          labels['picking'] = [];

          var label = {};
          label.position = new THREE.Vector3(atom.coord.x + 1, atom.coord.y + 1, atom.coord.z + 1); // shifted by 1

          if(this.pk === 1) {
            label.text = text;
          }
          else if(this.pk === 2) {
            label.text = residueText;
          }

          label.background = "#CCCCCC";

          if(this.pk === 1 || this.pk === 2) {
              labels['picking'].push(label);

              //http://www.johannes-raida.de/tutorials/three.js/tutorial13/tutorial13.htm
              if(me.bMeasureDistance === undefined || !me.bMeasureDistance) this.createLabelRepresentation(labels);
          }
*/
        };
    },

    modifySwitchHighlightLevel: function() {var me = this;
        iCn3D.prototype.switchHighlightLevel = function() {
          this.switchHighlightLevelBase();

          $(document).bind('keydown', function (e) {
            if(e.keyCode === 38 || e.keyCode === 40) { // arrow up/down, select upper/down level of atoms
                me.updateHlAll();
            }
          });
        };
    },

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this;
      me.deferred = $.Deferred(function() {
        if(me.isSessionStorageSupported()) me.getCommandsBeforeCrash();

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

        me.realWidth = width;
        me.realHeight = height;

        me.setTopMenusHtml(me.divid);

        me.allEventFunctions();

        me.allCustomEvents();

        var extraHeight = 0;
        if(me.cfg.showmenu == undefined || me.cfg.showmenu) {
            //extraHeight += 2*me.MENU_HEIGHT;
            extraHeight += me.MENU_HEIGHT;
        }
        if(me.cfg.showcommand == undefined || me.cfg.showcommand) {
            extraHeight += me.CMD_HEIGHT;
        }

        if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
          me.hideMenu();
        }
        else {
          me.showMenu();
        }

        $("#" + me.pre + "viewer").width(width).height(parseInt(height) + extraHeight);
        $("#" + me.pre + "canvas").width(width).height(parseInt(height));
        //$("#" + me.pre + "canvas").resizable(); // resizing behavor not good for canvas.

        me.icn3d = new iCn3D(me.pre + 'canvas');
        if(!me.isMobile()) me.icn3d.scaleFactor = 2.0;

        me.handleContextLost();

        me.icn3d.setWidthHeight(width, height);

        me.icn3d.ori_chemicalbinding = me.opts['chemicalbinding'];


        if(me.cfg.bCalphaOnly !== undefined) me.icn3d.bCalphaOnly = me.cfg.bCalphaOnly;

        //me.deferred = undefined; // sequential calls

        me.icn3d.opts = me.icn3d.cloneHash(me.opts);

        me.STATENUMBER = me.icn3d.commands.length;

        // If previously crashed, recover it
        if(me.isSessionStorageSupported() && me.bCrashed) {
            me.bCrashed = false;

            var loadCommand = me.commandsBeforeCrash.split('|||')[0];
            var id = loadCommand.substr(loadCommand.lastIndexOf(' ') + 1);

            // reload only if viewing the same structure
            if(id === me.cfg.mmtfid || id === me.cfg.pdbid || id === me.cfg.mmdbid || id === me.cfg.gi || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align) {
                me.loadScript(me.commandsBeforeCrash, true);

                return;
            }
        }

        me.icn3d.molTitle = '';

        if(me.cfg.url !== undefined) {
            var type_url = me.cfg.url.split('|');
            var type = type_url[0];
            var url = type_url[1];

            me.icn3d.molTitle = "";
            me.inputid = undefined;

            me.setLogCmd('load url ' + url + ' | type ' + type, true);

            me.downloadUrl(url, type);
        }
        else if(me.cfg.mmtfid !== undefined) {
           me.inputid = me.cfg.mmtfid;

           me.setLogCmd('load mmtf ' + me.cfg.mmtfid, true);

           me.downloadMmtf(me.cfg.mmtfid);
        }
        else if(me.cfg.pdbid !== undefined) {
           me.inputid = me.cfg.pdbid;

           me.setLogCmd('load pdb ' + me.cfg.pdbid, true);

           me.downloadPdb(me.cfg.pdbid);
        }
        else if(me.cfg.mmdbid !== undefined) {
           me.inputid = me.cfg.mmdbid;

           me.setLogCmd('load mmdb ' + me.cfg.mmdbid + ' | parameters ' + me.cfg.inpara, true);

           me.downloadMmdb(me.cfg.mmdbid);
        }
        else if(me.cfg.gi !== undefined) {
           me.setLogCmd('load gi ' + me.cfg.gi, true);

           me.downloadGi(me.cfg.gi);
        }
        else if(me.cfg.cid !== undefined) {
           me.inputid = me.cfg.cid;

           var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + me.inputid + "/description/jsonp";
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

            me.setLogCmd('load cid ' + me.cfg.cid, true);

            me.downloadCid(me.cfg.cid);
        }
        else if(me.cfg.mmcifid !== undefined) {
           me.inputid = me.cfg.mmcifid;

            me.setLogCmd('load mmcif ' + me.cfg.mmcifid, true);

            me.downloadMmcif(me.cfg.mmcifid);
        }
        else if(me.cfg.align !== undefined) {
            var alignArray = me.cfg.align.split(','); // e.g., 6 IDs: 103701,1,4,68563,1,167 [mmdbid1,biounit,molecule,mmdbid2,biounit,molecule], or 2IDs: 103701,68563 [mmdbid1,mmdbid2]

            if(alignArray.length === 6) {
                me.inputid = alignArray[0] + "_" + alignArray[3];
            }
            else if(alignArray.length === 2) {
                me.inputid = alignArray[0] + "_" + alignArray[1];
            }

            me.setLogCmd('load alignment ' + me.cfg.align + ' | parameters ' + me.cfg.inpara, true);

            me.downloadAlignment(me.cfg.align);
        }
        else if(me.cfg.command !== undefined && me.cfg.command !== '') {
            me.loadScript(me.cfg.command);
        }
        else {
            alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
        }
      });

      return me.deferred.promise();
    },

    hideMenu: function() { var me = this;
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "none";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "none";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "none";
//      if($("#" + me.pre + "selection")[0] !== undefined) $("#" + me.pre + "selection")[0].style.display = "none";

      //if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "none";
      $("#" + me.pre + "title")[0].style.margin = "10px 0 0 10px";
    },

    showMenu: function() { var me = this;
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "block";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "block";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "block";
//      if($("#" + me.pre + "selection")[0] !== undefined) $("#" + me.pre + "selection")[0].style.display = "block";

      if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";
    },

    saveSelectionIfSelected: function (id, value) { var me = this;
      if(me.bSelectResidue || me.bSelectAlignResidue) {
          var name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
          //var description = $("#" + me.pre + "seq_command_desc2").val();

          if(name === "") {
            name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
            //description = $("#" + me.pre + "alignseq_command_desc").val();
          }

          if(name !== "") me.saveSelection(name, name);

          me.bSelectResidue = false;
          me.bSelectAlignResidue = false;
      }
    },

    setOption: function (id, value) { var me = this;
      //var options2 = {};
      //options2[id] = value;

      // remember the options
      me.icn3d.opts[id] = value;

      me.saveSelectionIfSelected();

      if(id === 'color') {
          me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.hAtoms);

          me.icn3d.draw();

          var residueHash = me.icn3d.getResiduesFromCalphaAtoms(me.icn3d.hAtoms);
          me.changeSeqColor(Object.keys(residueHash));
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          if(id === 'opacity' || id === 'wireframe') {
              me.icn3d.removeLastSurface();
          }
          me.icn3d.applySurfaceOptions();
          //me.icn3d.render();
          me.icn3d.draw(); // to make surface work in assembly
      }
      else if(id === 'map' || id === 'mapwireframe') {
          if(id === 'mapwireframe') {
              me.icn3d.removeLastMap();
          }
          me.icn3d.applyMapOptions();
          //me.icn3d.render();
          me.icn3d.draw(); // to make surface work in assembly
      }
      else if(id === 'chemicalbinding') {
          me.icn3d.bSkipChemicalbinding = false;
          me.icn3d.draw();
      }
      else {
          me.icn3d.draw();
      }
    },

    setStyle: function (selectionType, style) { var me = this;
      var atoms = {};
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

      me.saveSelectionIfSelected();

      me.icn3d.draw();
    },

    setLogCmd: function (str, bSetCommand, bAddLogs) { var me = this;
      if(str.trim() === '') return false;

      var pos = str.indexOf('|||');
      if(pos !== -1) str = str.substr(0, pos);

      var transformation = {};
      transformation.factor = me.icn3d._zoomFactor;
      transformation.mouseChange = me.icn3d.mouseChange;

      transformation.quaternion = {};
      transformation.quaternion._x = parseFloat(me.icn3d.quaternion._x).toPrecision(5);
      transformation.quaternion._y = parseFloat(me.icn3d.quaternion._y).toPrecision(5);
      transformation.quaternion._z = parseFloat(me.icn3d.quaternion._z).toPrecision(5);
      transformation.quaternion._w = parseFloat(me.icn3d.quaternion._w).toPrecision(5);

      if(bSetCommand) {
          // save the command only when it's not a history command, i.e., not in the process of going back and forth
          if(me.bAddCommands) {
              // If a new command was called, remove the forward commands and push to the command array
              if(me.STATENUMBER < me.icn3d.commands.length) {
                  var oldCommand = me.icn3d.commands[me.STATENUMBER - 1];
                  var pos = oldCommand.indexOf('|||');
                  if(str !== oldCommand.substr(0, pos)) {
                    me.icn3d.commands = me.icn3d.commands.slice(0, me.STATENUMBER);

                    me.icn3d.commands.push(str + '|||' + me.getTransformationStr(transformation));
                    me.icn3d.optsHistory.push(me.icn3d.cloneHash(me.icn3d.opts));
                    me.icn3d.optsHistory[me.icn3d.optsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.hAtoms).length;

                    if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                    me.STATENUMBER = me.icn3d.commands.length;
                  }
              }
              else {
                me.icn3d.commands.push(str + '|||' + me.getTransformationStr(transformation));

                me.icn3d.optsHistory.push(me.icn3d.cloneHash(me.icn3d.opts));
                if(me.icn3d.hAtoms !== undefined) me.icn3d.optsHistory[me.icn3d.optsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.hAtoms).length;

                if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                me.STATENUMBER = me.icn3d.commands.length;
              }
          }
      }

      if(me.bAddLogs && me.cfg.showcommand) {
          me.icn3d.logs.push(str);

          // move cursor to the end, and scroll to the end
          $("#" + me.pre + "logtext").val("> " + me.icn3d.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
      }

      me.adjustIcon();
    },

    renderStructure: function () {  var me = this;
      if(me.bInitial) {
          if(me.cfg.command !== undefined && me.cfg.command !== '') {
              me.icn3d.bRender = false;

              jQuery.extend(me.icn3d.opts, me.opts);
              me.icn3d.draw();
          }
          else {
              jQuery.extend(me.icn3d.opts, me.opts);
              me.icn3d.draw();
          }

          if(Object.keys(me.icn3d.structures).length > 1) {
              $("#" + me.pre + "alternate").show();
          }
          else {
              $("#" + me.pre + "alternate").hide();
          }
      }
      else {
          me.saveSelectionIfSelected();

          me.icn3d.draw();
      }

      if(me.bInitial && me.cfg.command !== undefined && me.cfg.command !== '') {
              me.icn3d.bRender = true;
              me.loadScript(me.cfg.command);
      }

      // display the structure right away. load the mns and sequences later
      setTimeout(function(){
          if(me.bInitial) {
              if(me.cfg.showsets !== undefined && me.cfg.showsets) {
                   me.showSets();
              }

              if(me.cfg.align !== undefined) {
                  var bShowHighlight = false;
                  seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alnChains), undefined, undefined, bShowHighlight);

                  $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                  $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
              }

              //me.setProtNuclLigInMenu();

              if(me.cfg.showanno !== undefined && me.cfg.showanno) {
                   var cmd = "view annotations";
                   me.setLogCmd(cmd, true);

                   me.showAnnotations();
/*
                   if(Object.keys(me.icn3d.proteins).length > 0) {
                      $.when(me.applyCommandAnnotationsAndCddSite(cmd)).then(function() {
                          // do something afterward
                      });
                   }
                   else {
                      me.applyCommandAnnotationsAndCddSiteBase(cmd);
                   }
*/
              }
          }
          else {
              me.updateHlAll();
          }

          me.bInitial = false;
      }, 0);
    },

    exportCustomAtoms: function () { var me = this;
       var html = "";

       var nameArray = (me.icn3d.defNames2Residues !== undefined) ? Object.keys(me.icn3d.defNames2Residues).sort() : [];

       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var residueArray = me.icn3d.defNames2Residues[name];
         var description = me.icn3d.defNames2Descr[name];
         var command = me.icn3d.defNames2Command[name];
         command = command.replace(/,/g, ', ');

         html += name + "\tselect ";

         html += me.residueids2spec(residueArray);

         html += "\n";
       } // outer for

       nameArray = (me.icn3d.defNames2Atoms !== undefined) ? Object.keys(me.icn3d.defNames2Atoms).sort() : [];

       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var atomArray = me.icn3d.defNames2Atoms[name];
         var description = me.icn3d.defNames2Descr[name];
         var command = me.icn3d.defNames2Command[name];
         command = command.replace(/,/g, ', ');

         var residueArray = me.atoms2residues(atomArray);

         if(residueArray.length > 0) {
             html += name + "\tselect ";
             html += me.residueids2spec(residueArray);

             html += "\n";
         }
       } // outer for

       return html;
    },

    atoms2residues: function(atomArray) { var me = this;
         var atoms = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             atoms[atomArray[j]] = 1;
         }

         var residueHash = me.icn3d.getResiduesFromCalphaAtoms(atoms);

         return Object.keys(residueHash);
    },

    residueids2spec: function(residueArray) { var me = this;
         var spec = "";

         if(residueArray !== undefined){
             var residueArraySorted = residueArray.sort(function(a, b) {
                        if(a !== '' && !isNaN(a)) {
                            return parseInt(a) - parseInt(b);
                        }
                        else {
                            var lastPosA = a.lastIndexOf('_');
                            var lastPosB = b.lastIndexOf('_');
                            if(a.substr(0, lastPosA) < b.substr(0, lastPosB)) return -1;
                            else if(a.substr(0, lastPosA) > b.substr(0, lastPosB)) return 1;
                            else if(a.substr(0, lastPosA) == b.substr(0, lastPosB)) {
                                if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                                else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                                else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                            }
                        }
                    });

             var prevChain = '', chain, prevResi = 0, resi, lastDashPos, firstDashPos, struturePart, chainPart;
             var startResi;
             var bMultipleStructures = (Object.keys(me.icn3d.structures).length == 1) ? false : true;
             for(var j = 0, jl = residueArraySorted.length; j < jl; ++j) {
                 var residueid = residueArraySorted[j];

                 lastDashPos = residueid.lastIndexOf('_');
                 chain = residueid.substr(0, lastDashPos);
                 resi = parseInt(residueid.substr(lastDashPos+1));

                 firstDashPos = prevChain.indexOf('_');
                 struturePart = prevChain.substr(0, firstDashPos);
                 chainPart = prevChain.substr(firstDashPos + 1);

                 if(prevChain !== chain) {
                     if(j > 0) {
                         if(prevResi === startResi) {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                         }
                     }

                     startResi = resi;
                 }
                 else if(prevChain === chain) {
                     if(resi !== prevResi + 1) {
                         if(prevResi === startResi) {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                         }

                         startResi = resi;
                     }
                 }

                 prevChain = chain;
                 prevResi = resi;
             }

             // last residue
             firstDashPos = prevChain.indexOf('_');
             struturePart = prevChain.substr(0, firstDashPos);
             chainPart = prevChain.substr(firstDashPos + 1);

             if(prevResi === startResi) {
                 if(bMultipleStructures) {
                     spec += '$' + struturePart + '.' + chainPart + ':' + startResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi;
                 }
             }
             else {
                 if(bMultipleStructures) {
                     spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
             }
         }

         return spec;
    },

    pickCustomSphere: function (radius) {   var me = this; // me.icn3d.pAtom is set already
//        me.removeHlMenus();

        var select = "select zone cutoff " + radius;

        var atomlistTarget = {};

        for(var i in me.icn3d.hAtoms) {
          atomlistTarget[i] = me.icn3d.atoms[i];
        }

        // select all atom, not just displayed atoms
        var atoms = me.icn3d.getAtomsWithinAtom(me.icn3d.atoms, atomlistTarget, parseFloat(radius));

        var residues = {}, atomArray = undefined;

        for (var i in atoms) {
            var atom = atoms[i];
            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;

            //atomArray.push(i);
        }

        var residueArray = Object.keys(residues);

        me.icn3d.hAtoms = {};
        for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
          var residueid = residueArray[index];
          for(var i in me.icn3d.residues[residueid]) {
            //var atom = me.icn3d.atoms[i];
            //atom.color = new THREE.Color(0xFF0000);

            //me.icn3d.atomPrevColors[i] = atom.color;

            me.icn3d.hAtoms[i] = 1;
          }
        }

        me.icn3d.dAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

        var commandname, commanddesc;
          var firstAtom = me.icn3d.getFirstAtomObj(atomlistTarget);
          commandname = "sphere." + firstAtom.chain + ":" + me.icn3d.residueName2Abbr(firstAtom.resn.substr(0, 3)) + firstAtom.resi + "-" + $("#" + me.pre + "radius_aroundsphere").val() + "A";
          commanddesc = "select a sphere around currently selected " + Object.keys(me.icn3d.hAtoms).length + " atoms with a radius of " + radius + " angstrom";

        me.addCustomSelection(residueArray, commandname, commanddesc, select, true);

        var nameArray = [commandname];

        //me.changeCustomResidues(nameArray);

        me.saveSelectionIfSelected();

        me.icn3d.draw(); // show all neighbors, even not displayed before
    },

    // between the highlighted and the rest atoms
    showHbonds: function (threshold) { var me = this;
        me.icn3d.opts["hbonds"] = "yes";
        me.icn3d.opts["water"] = "dot";

        var select = 'hbonds ' + threshold;

       var complement = {};

       for(var i in me.icn3d.atoms) {
           if(!me.icn3d.hAtoms.hasOwnProperty(i) && me.icn3d.dAtoms.hasOwnProperty(i)) {
               complement[i] = me.icn3d.atoms[i];
           }
       }

        var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.hAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(me.icn3d.hAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateChemicalHbonds(complement, me.icn3d.intHash2Atoms(me.icn3d.dAtoms, me.icn3d.hAtoms), parseFloat(threshold) );

            var residues = {}, atomArray = undefined;

            for (var i in selectedAtoms) {
                var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueid] = 1;

                //atomArray.push(i);

                //me.icn3d.atoms[i].style2 = 'stick';
            }

            me.icn3d.hAtoms = {};
            for(var resid in residues) {
                for(var i in me.icn3d.residues[resid]) {
                    me.icn3d.hAtoms[i] = 1;
                    me.icn3d.atoms[i].style2 = 'stick';
                    //me.icn3d.atoms[i].style2 = 'lines';
                }
            }

            var commandname = 'hbonds_' + firstAtom.serial;
            var commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            //me.changeCustomResidues(nameArray);

            me.saveSelectionIfSelected();

            //me.setStyle('sidec', 'ball and stick');

            me.icn3d.draw();
        }
    },

    // show all disulfide bonds
    showSsbonds: function () { var me = this;
         me.icn3d.opts["ssbonds"] = "yes";

         var select = 'disulfide bonds';

//         me.removeHlMenus();

         var residues = {}, atomArray = undefined;

         var structureArray = Object.keys(me.icn3d.structures);

         for(var s = 0, sl = structureArray.length; s < sl; ++s) {
             var structure = structureArray[s];

             if(me.icn3d.ssbondpnts[structure] === undefined) continue;

             for (var i = 0, lim = Math.floor(me.icn3d.ssbondpnts[structure].length / 2); i < lim; i++) {
                var res1 = me.icn3d.ssbondpnts[structure][2 * i], res2 = me.icn3d.ssbondpnts[structure][2 * i + 1];

                residues[res1] = 1;
                residues[res2] = 1;

                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[res1]);
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[res2]);

            }
        }

        if(Object.keys(residues).length > 0) {
            var commandname = 'ssbonds';
            var commanddesc = 'all atoms that have disulfide bonds';
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            //me.changeCustomResidues(nameArray);

            me.saveSelectionIfSelected();

            // show side chains for the selected atoms
            //me.setStyle('sidec', 'stick');

            me.icn3d.draw();
        }
    },

    addLabel: function (text, x, y, z, size, color, background, type) { var me = this;
        var label = {}; // Each label contains 'position', 'text', 'color', 'background'

        if(size === '0' || size === '' || size === 'undefined') size = undefined;
        if(color === '0' || color === '' || color === 'undefined') color = undefined;
        if(background === '0' || background === '' || background === 'undefined') background = undefined;

        var position = new THREE.Vector3();
        position.x = x;
        position.y = y;
        position.z = z;

        label.position = position;

        label.text = text;
        label.size = size;
        label.color = color;
        label.background = background;

        if(me.icn3d.labels[type] === undefined) me.icn3d.labels[type] = [];

        if(type !== undefined) {
            me.icn3d.labels[type].push(label);
        }
        else {
            me.icn3d.labels['custom'].push(label);
        }

        me.icn3d.removeHlObjects();

        //me.icn3d.draw();
    },

    addLine: function (x1, y1, z1, x2, y2, z2, color, dashed, type) { var me = this;
        var line = {}; // Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
        line.position1 = new THREE.Vector3(x1, y1, z1);
        line.position2 = new THREE.Vector3(x2, y2, z2);
        line.color = color;
        line.dashed = dashed;

        if(me.icn3d.lines[type] === undefined) me.icn3d.lines[type] = [];

        if(type !== undefined) {
            me.icn3d.lines[type].push(line);
        }
        else {
            me.icn3d.lines['custom'].push(line);
        }

        me.icn3d.removeHlObjects();

        //me.icn3d.draw();
    },

    back: function () { var me = this;
      me.backForward = true;

      me.STATENUMBER--;

      // do not add to the array me.icn3d.commands
      me.bAddCommands = false;
      me.bAddLogs = false; // turn off log

      me.bNotLoadStructure = true;

      if(me.STATENUMBER < 1) {
        me.STATENUMBER = 1;
      }
      else {
        me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    forward: function () { var me = this;
      me.backForward = true;

      me.STATENUMBER++;

      // do not add to the array me.icn3d.commands
      me.bAddCommands = false;
      me.bAddLogs = false; // turn off log

      me.bNotLoadStructure = true;

      if(me.STATENUMBER > me.icn3d.commands.length) {
        me.STATENUMBER = me.icn3d.commands.length;
      }
      else {
        me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    toggleSelection: function () { var me = this;
        if(me.bHideSelection) {
            for(var i in me.icn3d.dAtoms) {
                if(me.icn3d.hAtoms.hasOwnProperty(i)) delete me.icn3d.dAtoms[i];
            }

              me.bHideSelection = false;
        }
        else {
            me.icn3d.dAtoms = me.icn3d.unionHash(me.icn3d.dAtoms, me.icn3d.hAtoms);

              me.bHideSelection = true;
        }

        me.icn3d.draw();
    },

    adjustIcon: function () { var me = this;
      if(me.STATENUMBER === 1) {
        if($("#" + me.pre + "back").hasClass('icn3d-middleIcon')) {
          $("#" + me.pre + "back").toggleClass('icn3d-middleIcon');
          $("#" + me.pre + "back").toggleClass('icn3d-endIcon');
        }
      }
      else {
        if($("#" + me.pre + "back").hasClass('icn3d-endIcon')) {
          $("#" + me.pre + "back").toggleClass('icn3d-middleIcon');
          $("#" + me.pre + "back").toggleClass('icn3d-endIcon');
        }
      }

      if(me.STATENUMBER === me.icn3d.commands.length) {
        if($("#" + me.pre + "forward").hasClass('icn3d-middleIcon')) {
          $("#" + me.pre + "forward").toggleClass('icn3d-middleIcon');
          $("#" + me.pre + "forward").toggleClass('icn3d-endIcon');
        }
      }
      else {
        if($("#" + me.pre + "forward").hasClass('icn3d-endIcon')) {
          $("#" + me.pre + "forward").toggleClass('icn3d-middleIcon');
          $("#" + me.pre + "forward").toggleClass('icn3d-endIcon');
        }
      }
    },

    toggle: function (id1, id2, id3, id4) { var me = this;
      $("#" + id1).toggleClass('ui-icon-plus');
      $("#" + id1).toggleClass('ui-icon-minus');

      $("#" + id2).toggleClass('ui-icon-plus');
      $("#" + id2).toggleClass('ui-icon-minus');

      $("#" + id1).toggleClass('icn3d-shown');
      $("#" + id1).toggleClass('icn3d-hidden');

      $("#" + id2).toggleClass('icn3d-shown');
      $("#" + id2).toggleClass('icn3d-hidden');

      $("#" + id3).toggleClass('icn3d-shown');
      $("#" + id3).toggleClass('icn3d-hidden');

      $("#" + id4).toggleClass('icn3d-shown');
      $("#" + id4).toggleClass('icn3d-hidden');
    },

    selectComplement: function() { var me = this;
           var complement = {};
           //var residueHash = {}, chainHash = {};
           //var residueid, chainid;

           for(var i in me.icn3d.atoms) {
               if(!me.icn3d.hAtoms.hasOwnProperty(i)) {
                   complement[i] = 1;
                   //chainid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain;
                   //residueid = chainid + '_' + me.icn3d.atoms[i].resi;
                   //chainHash[chainid] =1;
                   //residueHash[residueid] = 1;
               }
           }

           me.icn3d.hAtoms = me.icn3d.cloneHash(complement);

           //me.highlightResidues(Object.keys(residueHash), Object.keys(chainHash));
           me.updateHlAll();
    },

    saveCommandsToSession: function() { var me = this;
        var dataStr = me.icn3d.commands.join('\n');
        var data = decodeURIComponent(dataStr);

        sessionStorage.setItem('commands', data);
    },

    addChainLabels: function (atoms) { var me = this;
        var size = 18;
        var background = "#CCCCCC";

        var atomsHash = me.icn3d.intHash(me.icn3d.hAtoms, atoms);

        if(me.icn3d.labels['chain'] === undefined) me.icn3d.labels['chain'] = [];

        var chainHash = me.icn3d.getChainsFromAtoms(atomsHash);

        for(var chainid in chainHash) {
            var label = {};

            label.position = me.icn3d.centerAtoms(me.icn3d.chains[chainid]).center;

            var pos = chainid.indexOf('_');
            var chainName = chainid.substr(pos + 1);
            var proteinName = me.getProteinName(chainid);
            if(proteinName.length > 20) proteinName = proteinName.substr(0, 20) + '...';

            label.text = 'Chain ' + chainName + ': ' + proteinName;
            label.size = size;

            var atomColorStr = me.icn3d.getFirstCalphaAtomObj(me.icn3d.chains[chainid]).color.getHexString().toUpperCase();
            label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;

            me.icn3d.labels['chain'].push(label);
        }

        me.icn3d.removeHlObjects();
    },

    addTerminiLabels: function (atoms) { var me = this;
        var size = 18;
        var background = "#CCCCCC";

        var protNucl = me.icn3d.unionHash(me.icn3d.proteins, me.icn3d.nucleotides);
        var hlProtNucl = me.icn3d.intHash(me.icn3d.dAtoms, protNucl);
        var atomsHash = me.icn3d.intHash(hlProtNucl, atoms);

        if(me.icn3d.labels['chain'] === undefined) me.icn3d.labels['chain'] = [];

        var chainHash = me.icn3d.getChainsFromAtoms(atomsHash);

        for(var chainid in chainHash) {
            var chainAtomsHash = me.icn3d.intHash(hlProtNucl, me.icn3d.chains[chainid]);
            var serialArray = Object.keys(chainAtomsHash);
            var firstAtom = me.icn3d.atoms[serialArray[0]];
            var lastAtom = me.icn3d.atoms[serialArray[serialArray.length - 1]];

            var labelN = {}, labelC = {};

            labelN.position = firstAtom.coord;
            labelC.position = lastAtom.coord;

            labelN.text = 'N-';
            labelC.text = 'C-';

            if(me.icn3d.nucleotides.hasOwnProperty(firstAtom.serial)) {
                labelN.text = "5'";
                labelC.text = "3'";
            }

            labelN.size = size;
            labelC.size = size;

            var atomNColorStr = firstAtom.color.getHexString().toUpperCase();
            var atomCColorStr = lastAtom.color.getHexString().toUpperCase();

            labelN.color = (atomNColorStr === "CCCCCC" || atomNColorStr === "C8C8C8") ? "#888888" : "#" + atomNColorStr;
            labelC.color = (atomCColorStr === "CCCCCC" || atomCColorStr === "C8C8C8") ? "#888888" : "#" + atomCColorStr;

            labelN.background = background;
            labelC.background = background;

            me.icn3d.labels['chain'].push(labelN);
            me.icn3d.labels['chain'].push(labelC);
        }

        me.icn3d.removeHlObjects();
    },

    //http://jasonjl.me/blog/2015/06/21/taking-action-on-browser-crashes/
    getCommandsBeforeCrash: function() { var me = this;
       window.addEventListener('load', function () {
          sessionStorage.setItem('good_exit', 'pending');
       });

       window.addEventListener('beforeunload', function () {
          sessionStorage.setItem('good_exit', 'true');
       });

       if(sessionStorage.getItem('good_exit') && sessionStorage.getItem('good_exit') === 'pending') {
          if(!me.isMac()) me.bCrashed = true;  // this doesn't work in mac
          me.commandsBeforeCrash = sessionStorage.getItem('commands');
       }
    },

    addLineFromPicking: function(type) { var me = this;
             var size = 0, color, background = 0;
             var color = $("#" + me.pre + type + "color" ).val();

             var x = (me.icn3d.pAtom.coord.x + me.icn3d.pAtom2.coord.x) / 2;
             var y = (me.icn3d.pAtom.coord.y + me.icn3d.pAtom2.coord.y) / 2;
             var z = (me.icn3d.pAtom.coord.z + me.icn3d.pAtom2.coord.z) / 2;

             var dashed = (type == 'stabilizer') ? false : true;

             me.setLogCmd('add line | x1 ' + me.icn3d.pAtom.coord.x.toPrecision(4)  + ' y1 ' + me.icn3d.pAtom.coord.y.toPrecision(4) + ' z1 ' + me.icn3d.pAtom.coord.z.toPrecision(4) + ' | x2 ' + me.icn3d.pAtom2.coord.x.toPrecision(4)  + ' y2 ' + me.icn3d.pAtom2.coord.y.toPrecision(4) + ' z2 ' + me.icn3d.pAtom2.coord.z.toPrecision(4) + ' | color ' + color + ' | dashed ' + dashed + ' | type ' + type, true);

             me.addLine(me.icn3d.pAtom.coord.x, me.icn3d.pAtom.coord.y, me.icn3d.pAtom.coord.z, me.icn3d.pAtom2.coord.x, me.icn3d.pAtom2.coord.y, me.icn3d.pAtom2.coord.z, color, dashed, type);

             me.icn3d.pickpair = false;
    },

    setEntrezLinks: function(db) { var me = this;
      var structArray = Object.keys(me.icn3d.structures);

      var url;

      if(structArray.length === 1) {
          url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0];
          me.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + ": " + url, false);

          window.open(url, '_blank');
      }
      else if(structArray.length === 2) {
          url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0] + " OR " + structArray[1];
          me.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + " OR " + structArray[1] + ": " + url, false);

          window.open(url, '_blank');
      }
    },

    shareLink: function() { var me = this;
           var url = me.shareLinkUrl();

           me.setLogCmd("share link: " + url, false);

           if(url.length > 4000) alert("The url is more than 4000 characters and may not work. Please export the 'State File' and open it in the viewer.");

           //window.open(url, '_blank');

/*
           //https://gist.github.com/hayageek/4584508
           var request = gapi.client.urlshortener.url.insert({
                'resource': {
                  'longUrl': url
                }
           });
           request.execute(function(response) {
                var shorturl = 'Problem in getting shortened URL';
                if(response.id !== undefined) {
                    shorturl = response.id;
                }

                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);

                me.openDialog(me.pre + 'dl_copyurl', 'Copy a Share Link URL');
           });
*/

           //https://firebase.google.com/docs/dynamic-links/rest
           //Web API Key: AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc
           var fdlUrl = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc";
           $.ajax({
              url: fdlUrl,
              type: 'POST',
              //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + url, "suffix": {"option": "SHORT"}},
              data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + encodeURIComponent(url)},
              dataType: 'json',
              success: function(data) {
                var shorturl = 'Problem in getting shortened URL';
                if(data.shortLink !== undefined) {
                    shorturl = data.shortLink;
                }

                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);

                me.openDialog(me.pre + 'dl_copyurl', 'Copy a Share Link URL');
              },
              error : function(xhr, textStatus, errorThrown ) {
                var shorturl = 'Problem in getting shortened URL';

                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);

                me.openDialog(me.pre + 'dl_copyurl', 'Copy a Share Link URL');
              }
           });
    },

    exportInteractions: function() { var me = this;
       var text = '<html><body><b>Interacting residues</b>:<br/><table border=1 cellpadding=0 cellspacing=0><tr><th>Base Chain: Residues</th><th>Interacting Chain</th></tr>';

       //me.chainids2resids[fisrtChainid][secondChainid].push(resid);
/*
       for(var fisrtChainid in me.chainids2resids) {
           for(var secondChainid in me.chainids2resids[fisrtChainid]) {
               text += '<tr><td>' + fisrtChainid + ': ';
               text += me.residueids2spec(me.chainids2resids[fisrtChainid][secondChainid]);
               text += '</td><td>' + secondChainid + '</td></tr>';
           }
       }
*/

       for(var fisrtChainid in me.chainname2residues) {
           for(var name in me.chainname2residues[fisrtChainid]) {
               var secondChainid = fisrtChainid.substr(0, fisrtChainid.indexOf('_')) + '_' + name.substr(0, name.indexOf(' '));
               text += '<tr><td>' + fisrtChainid + ': ';
               text += me.residueids2spec(me.chainname2residues[fisrtChainid][name]);
               text += '</td><td>' + secondChainid + '</td></tr>';
           }
       }

       text += '</table><br/></body></html>';

       me.saveFile(me.inputid + '_interactions.html', 'html', text);
    },

    saveColor: function() { var me = this;
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           atom.colorSave = atom.color.clone();
       }
    },

    applySavedColor: function() { var me = this;
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.colorSave !== undefined) {
               atom.color = atom.colorSave.clone();
           }
       }

       me.icn3d.draw();

       me.changeSeqColor(Object.keys(me.icn3d.residues));
    },

    saveStyle: function() { var me = this;
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           atom.styleSave = atom.style;
           if(atom.style2 !== undefined) atom.style2Save = atom.style2;
       }
    },

    applySavedStyle: function() { var me = this;
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.styleSave !== undefined) {
               atom.style = atom.styleSave;
           }
           if(atom.style2Save !== undefined) {
               atom.style2 = atom.style2Save;
           }
       }

       me.icn3d.draw();
    },

    // ====== functions end ===============

    // ====== events start ===============
    // back and forward arrows
    clickBack: function() { var me = this;
        $("#" + me.pre + "back").add("#" + me.pre + "mn6_back").click(function(e) {
           e.preventDefault();

           me.setLogCmd("back", false);
           me.back();
        });
    },

    clickForward: function() { var me = this;
        $("#" + me.pre + "forward").add("#" + me.pre + "mn6_forward").click(function(e) {
           e.preventDefault();

           me.setLogCmd("forward", false);
           me.forward();
        });
    },

    clickToggle: function() { var me = this;
        $("#" + me.pre + "toggle").add("#" + me.pre + "mn2_toggle").click(function(e) {
           //me.setLogCmd("toggle selection", true);
           me.toggleSelection();
           me.setLogCmd("toggle selection", true);
        });
    },

    clickHlColorYellow: function() { var me = this;
        $("#" + me.pre + "mn2_hl_clrYellow").click(function(e) {
           me.setLogCmd("set highlight color yellow", true);
           me.icn3d.hColor = new THREE.Color(0xFFFF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorGreen: function() { var me = this;
        $("#" + me.pre + "mn2_hl_clrGreen").click(function(e) {
           me.setLogCmd("set highlight color green", true);
           me.icn3d.hColor = new THREE.Color(0x00FF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('green');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorRed: function() { var me = this;
        $("#" + me.pre + "mn2_hl_clrRed").click(function(e) {
           me.setLogCmd("set highlight color red", true);
           me.icn3d.hColor = new THREE.Color(0xFF0000);
           me.icn3d.matShader = me.icn3d.setOutlineColor('red');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlStyleOutline: function() { var me = this;
        $("#" + me.pre + "mn2_hl_styleOutline").click(function(e) {
           me.setLogCmd("set highlight style outline", true);
           me.icn3d.bHighlight = 1;

           me.showHighlight();

           //me.icn3d.draw();
        });
    },

    clickHlStyleObject: function() { var me = this;
        $("#" + me.pre + "mn2_hl_styleObject").click(function(e) {
           me.setLogCmd("set highlight style 3d", true);
           me.icn3d.bHighlight = 2;

           me.showHighlight();

           //me.icn3d.draw();
        });
    },

    clickHlStyleNone: function() { var me = this;
        $("#" + me.pre + "mn2_hl_styleNone").click(function (e) {
            e.stopImmediatePropagation();

            me.clearHighlight();

            me.setLogCmd("clear selection", true);
        });
    },

    clickAlternate: function() { var me = this;
        $("#" + me.pre + "alternate").add("#" + me.pre + "mn2_alternate").click(function(e) {
           //me.setLogCmd("alternate structures", false);
           me.icn3d.bAlternate = true;

           me.icn3d.alternateStructures();

           me.icn3d.bAlternate = false;
           me.setLogCmd("alternate structures", false);
        });
    },

    //mn 1
    clkMn1_mmtfid: function() { var me = this;
        $("#" + me.pre + "mn1_mmtfid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmtfid', 'Please input MMTF ID');
        });
    },

    clkMn1_pdbid: function() { var me = this;
        $("#" + me.pre + "mn1_pdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_pdbid', 'Please input PDB ID');
        });
    },

    clkMn1_align: function() { var me = this;
        $("#" + me.pre + "mn1_align").click(function(e) {
           me.openDialog(me.pre + 'dl_align', 'Please input two PDB IDs or MMDB IDs');
        });
    },

    clkMn1_pdbfile: function() { var me = this;
        $("#" + me.pre + "mn1_pdbfile").click(function(e) {
           me.openDialog(me.pre + 'dl_pdbfile', 'Please input PDB File');
        });
    },

    clkMn1_mol2file: function() { var me = this;
        $("#" + me.pre + "mn1_mol2file").click(function(e) {
           me.openDialog(me.pre + 'dl_mol2file', 'Please input Mol2 File');
        });
    },
    clkMn1_sdffile: function() { var me = this;
        $("#" + me.pre + "mn1_sdffile").click(function(e) {
           me.openDialog(me.pre + 'dl_sdffile', 'Please input SDF File');
        });
    },
    clkMn1_xyzfile: function() { var me = this;
        $("#" + me.pre + "mn1_xyzfile").click(function(e) {
           me.openDialog(me.pre + 'dl_xyzfile', 'Please input XYZ File');
        });
    },
    clkMn1_urlfile: function() { var me = this;
        $("#" + me.pre + "mn1_urlfile").click(function(e) {
           me.openDialog(me.pre + 'dl_urlfile', 'Load data by URL');
        });
    },

    clkMn1_mmciffile: function() { var me = this;
        $("#" + me.pre + "mn1_mmciffile").click(function(e) {
           me.openDialog(me.pre + 'dl_mmciffile', 'Please input mmCIF File');
        });
    },

    clkMn1_mmcifid: function() { var me = this;
        $("#" + me.pre + "mn1_mmcifid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmcifid', 'Please input mmCIF ID');
        });
    },

    clkMn1_mmdbid: function() { var me = this;
        $("#" + me.pre + "mn1_mmdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmdbid', 'Please input MMDB ID');
        });
    },

    clkMn1_gi: function() { var me = this;
        $("#" + me.pre + "mn1_gi").click(function(e) {
           me.openDialog(me.pre + 'dl_gi', 'Please input protein gi');
        });
    },

    clkMn1_cid: function() { var me = this;
        $("#" + me.pre + "mn1_cid").click(function(e) {
           me.openDialog(me.pre + 'dl_cid', 'Please input PubChem CID');
        });
    },

    clkMn1_pngimage: function() { var me = this;
        $("#" + me.pre + "mn1_pngimage").click(function(e) {
           me.openDialog(me.pre + 'dl_pngimage', 'Please input the PNG image');
        });
    },

    clkMn1_state: function() { var me = this;
        $("#" + me.pre + "mn1_state").click(function(e) {
           me.openDialog(me.pre + 'dl_state', 'Please input the state file');
        });
    },

    clkMn1_selection: function() { var me = this;
        $("#" + me.pre + "mn1_selection").click(function(e) {
           me.openDialog(me.pre + 'dl_selection', 'Please input the selection file');
        });
    },

    clkMn1_exportState: function() { var me = this;
        $("#" + me.pre + "mn1_exportState").click(function (e) {
           me.setLogCmd("export state file", false);

           me.saveFile(me.inputid + '_statefile.txt', 'command');
        });
    },

    exportStlFile: function(postfix) { var me = this;
       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly) {
            // use a smaller grid to build the surface for assembly
            me.icn3d.threshbox = 180 / Math.pow(me.icn3d.biomtMatrices.length, 0.33);

            me.icn3d.removeSurfaces();
            me.icn3d.applySurfaceOptions();

            me.icn3d.removeMaps();
            me.icn3d.applyMapOptions();
       }

       var text = me.saveStlFile();
       me.saveFile(me.inputid + postfix + '.stl', 'binary', text);

       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly
         && Object.keys(me.icn3d.dAtoms).length * me.icn3d.biomtMatrices.length > me.icn3d.maxAtoms3DMultiFile ) {
            alert(me.icn3d.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");

            var identity = new THREE.Matrix4();
            identity.identity();

            var index = 1;
            for (var i = 0; i < me.icn3d.biomtMatrices.length; i++) {  // skip itself
              var mat = me.icn3d.biomtMatrices[i];
              if (mat === undefined) continue;

              // skip itself
              if(mat.equals(identity)) continue;

              var time = (i + 1) * 100;

              //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
              setTimeout(function(mat, index){
                  text = me.saveStlFile(mat);
                  me.saveFile(me.inputid + postfix + index + '.stl', 'binary', text);
                  text = '';
              }.bind(this, mat, index), time);

              ++index;
            }

            // reset grid to build the surface for assembly
            me.icn3d.threshbox = 180;
       }
    },

    exportVrmlFile: function(postfix) { var me = this;
       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly) {
            // use a smaller grid to build the surface for assembly
            me.icn3d.threshbox = 180 / Math.pow(me.icn3d.biomtMatrices.length, 0.33);

            me.icn3d.removeSurfaces();
            me.icn3d.applySurfaceOptions();

            me.icn3d.removeMaps();
            me.icn3d.applyMapOptions();
       }

       var text = me.saveVrmlFile();
       me.saveFile(me.inputid + postfix + '.wrl', 'text', text);

       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly
         && Object.keys(me.icn3d.dAtoms).length * me.icn3d.biomtMatrices.length > me.icn3d.maxAtoms3DMultiFile ) {
            alert(me.icn3d.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");

            var identity = new THREE.Matrix4();
            identity.identity();

            var index = 1;
            for (var i = 0; i < me.icn3d.biomtMatrices.length; i++) {  // skip itself
              var mat = me.icn3d.biomtMatrices[i];
              if (mat === undefined) continue;

              // skip itself
              if(mat.equals(identity)) continue;

              var time = (i + 1) * 100;

              //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
              setTimeout(function(mat, index){
                  text = me.saveVrmlFile(mat);
                  me.saveFile(me.inputid + postfix + index + '.wrl', 'text', text);
                  text = '';
              }.bind(this, mat, index), time);

              ++index;
            }

            // reset grid to build the surface for assembly
            me.icn3d.threshbox = 180;
       }
    },

    clkMn1_exportStl: function() { var me = this;
        $("#" + me.pre + "mn1_exportStl").click(function (e) {
           me.setLogCmd("export stl file", false);

           //me.hideStabilizer();

           me.exportStlFile('');
        });
    },

    clkMn1_exportVrml: function() { var me = this;
        $("#" + me.pre + "mn1_exportVrml").click(function (e) {
           me.setLogCmd("export vrml file", false);

           //me.hideStabilizer();

           me.exportVrmlFile('');
        });
    },

    clkMn1_exportStlStab: function() { var me = this;
        $("#" + me.pre + "mn1_exportStlStab").click(function (e) {
           me.setLogCmd("export stl stabilizer file", false);

           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportStlFile('_stab');
        });
    },

    clkMn1_exportVrmlStab: function() { var me = this;
        $("#" + me.pre + "mn1_exportVrmlStab").click(function (e) {
           me.setLogCmd("export vrml stabilizer file", false);

           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportVrmlFile('_stab');
        });
    },

    clkMn6_exportInteraction: function() { var me = this;
        $("#" + me.pre + "mn6_exportInteraction").click(function (e) {
           me.setLogCmd("export interactions", false);

           me.exportInteractions();
        });
    },

    clkMn1_exportCanvas: function() { var me = this;
        $("#" + me.pre + "mn1_exportCanvas").add("#" + me.pre + "saveimage").click(function (e) {
           me.setLogCmd("export canvas", false);

           me.saveFile(me.inputid + '_image.png', 'png');
        });
    },

    clkMn1_exportCounts: function() { var me = this;
        $("#" + me.pre + "mn1_exportCounts").click(function (e) {
           me.setLogCmd("export counts", false);

           var text = '<html><body><b>Total Count for atoms with coordinates</b>:<br/><table border=1><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';

           text += '<tr><td>' + Object.keys(me.icn3d.structures).length + '</td><td>' + Object.keys(me.icn3d.chains).length + '</td><td>' + Object.keys(me.icn3d.residues).length + '</td><td>' + Object.keys(me.icn3d.atoms).length + '</td></tr>';

           text += '</table><br/>';

           text += '<b>Counts by Chain for atoms with coordinates</b>:<br/><table border=1><tr><th>Structure</th><th>Chain</th><th>Residue Count</th><th>Atom Count</th></tr>';

           var chainArray = Object.keys(me.icn3d.chains);
           for(var i = 0, il = chainArray.length; i < il; ++i) {
               var chainid = chainArray[i];
               var pos = chainid.indexOf('_');
               var structure = chainid.substr(0, pos);
               var chain = chainid.substr(pos + 1);

               var residueHash = {};
               var atoms = me.icn3d.chains[chainid];
               for(var j in atoms) {
                   residueHash[me.icn3d.atoms[j].resi] = 1;
               }

               text += '<tr><td>' + structure + '</td><td>' + chain + '</td><td>' + Object.keys(residueHash).length + '</td><td>' + Object.keys(me.icn3d.chains[chainid]).length + '</td></tr>';
           }

           text += '</table><br/></body></html>';

           me.saveFile(me.inputid + '_counts.html', 'html', text);
        });
    },

    clkMn1_exportSelections: function() { var me = this;
        $("#" + me.pre + "mn1_exportSelections").click(function (e) {
           me.setLogCmd("export all selections", false);

           var text = me.exportCustomAtoms();

           me.saveFile(me.inputid + '_selections.txt', 'text', [text]);
        });
    },

    clkMn1_sharelink: function() { var me = this;
        $("#" + me.pre + "mn1_sharelink").click(function (e) {
            me.shareLink();
        });
    },

    clkMn1_link_structure: function() { var me = this;
        $("#" + me.pre + "mn1_link_structure").click(function (e) {
           var url = me.getLinkToStructureSummary(true);

           window.open(url, '_blank');
        });
    },

    clkMn1_link_bind: function() { var me = this;
        $("#" + me.pre + "mn1_link_bind").click(function (e) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + me.inputid;
           me.setLogCmd("link to 3D protein structures bound to CID " + me.inputid + ": " + url, false);

           window.open(url, '_blank');
        });
    },

    clkMn1_link_vast: function() { var me = this;
        $("#" + me.pre + "mn1_link_vast").click(function (e) {
           if(me.inputid === undefined) {
                   url = "https://www.ncbi.nlm.nih.gov/pccompound?term=" + me.icn3d.molTitle;
                   me.setLogCmd("link to compounds " + me.icn3d.molTitle + ": " + url, false);
           }
           else {
               if(me.cfg.cid !== undefined) {
                       url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_pccompound_3d&from_uid=" + me.inputid;
                       me.setLogCmd("link to compounds with structure similar to CID " + me.inputid + ": " + url, false);
               }
               else {
                   var idArray = me.inputid.split('_');

                   var url;
                   if(idArray.length === 1) {
                       url = "https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=" + me.inputid;
                       me.setLogCmd("link to structures similar to " + me.inputid + ": " + url, false);
                   }
                   else if(idArray.length === 2) {
                       url = "https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=" + idArray[0];
                       me.setLogCmd("link to structures similar to " + idArray[0] + ": " + url, false);
                   }
               }

               window.open(url, '_blank');
           }
        });
    },

    clkMn1_link_pubmed: function() { var me = this;
        $("#" + me.pre + "mn1_link_pubmed").click(function (e) {
           var url;
           if(me.inputid === undefined) {
               var url;
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + me.icn3d.molTitle;
               me.setLogCmd("link to literature about " + me.icn3d.molTitle + ": " + url, false);

               window.open(url, '_blank');
           }
           else if(me.pmid !== undefined) {
               var idArray = me.pmid.toString().split('_');

               var url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/" + me.pmid;
                   me.setLogCmd("link to PubMed ID " + me.pmid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   me.setLogCmd("link to PubMed IDs " + idArray[0] + ", " + idArray[1] + ": " + url, false);
               }

               window.open(url, '_blank');
           }
           else if(isNaN(me.inputid)) {
               var idArray = me.inputid.toString().split('_');

               var url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + me.inputid;
                   me.setLogCmd("link to literature about PDB " + me.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   me.setLogCmd("link to literature about PDB " + idArray[0] + " OR " + idArray[1] + ": " + url, false);
               }

               window.open(url, '_blank');
           }
           else {
               if(me.cfg.cid !== undefined) {
                   alert("No literature information is available for this compound in the SDF file.");
               }
               else {
                   alert("No literature information is available for this structure.");
               }
           }
        });
    },

    clkMn1_link_protein: function() { var me = this;
        $("#" + me.pre + "mn1_link_protein").click(function (e) {
          //me.setEntrezLinks('protein');
          var structArray = Object.keys(me.icn3d.structures);

          var chainArray = Object.keys(me.icn3d.chains);
          var text = '';
          for(var i = 0, il = chainArray.length; i < il; ++i) {
              var firstAtom = me.icn3d.getFirstCalphaAtomObj(me.icn3d.chains[chainArray[i]]);

              if(me.icn3d.proteins.hasOwnProperty(firstAtom.serial) && chainArray[i].length == 6) {
                  text += chainArray[i] + '[accession] OR ';
              }
          }
          if(text.length > 0) text = text.substr(0, text.length - 4);

          var url = "https://www.ncbi.nlm.nih.gov/protein/?term=" + text;
          me.setLogCmd("link to Entrez protein about PDB " + structArray + ": " + url, false);

          window.open(url, '_blank');
        });
    },

    // mn 2
    clkMn2_selectannotations: function() { var me = this;
        $("#" + me.pre + "mn6_selectannotations").click(function (e) {
           me.showAnnotations();
           me.setLogCmd("view annotations", true);
        });
    },

    clkMn2_selectall: function() { var me = this;
        $("#" + me.pre + "mn2_selectall").click(function (e) {
           me.setLogCmd("select all", true);

           me.selectAll();

           // do not highlight
           //me.removeHlAll();
           me.removeSelection();

           //me.icn3d.addHlObjects();
           me.icn3d.draw();

        });

        $("#" + me.pre + "clearall").click(function (e) {
           me.setLogCmd("clear all", true);

           me.bSelectResidue = false;

           me.selectAll();

           me.removeHlAll();

           me.icn3d.draw();

        });

    },

    clkMn2_selectcomplement: function() { var me = this;
        $("#" + me.pre + "mn2_selectcomplement").click(function (e) {
           if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.atoms).length) {
               me.setLogCmd("select complement", true);

               me.selectComplement();
           }
        });
    },

    clkMn2_selectsidechains: function() { var me = this;
        $("#" + me.pre + "mn2_selectsidechains").click(function (e) {
           me.setLogCmd("select side chains", true);

           me.selectSideChains();
        });
    },

    clkMn2_alignment: function() { var me = this;
        $("#" + me.pre + "mn2_alignment").click(function (e) {
           me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clkMn2_command: function() { var me = this;
        $("#" + me.pre + "mn2_command").click(function (e) {
           me.openDialog(me.pre + 'dl_definedsets', 'Select by specification');
           $("#" + me.pre + "dl_setsmenu").hide();
           $("#" + me.pre + "dl_setoperations").hide();
           $("#" + me.pre + "dl_command").show();
        });
    },

    clkMn2_definedsets: function() { var me = this;
        $("#" + me.pre + "mn2_definedsets").add("#" + me.pre + "definedsets").click(function (e) {
           me.showSets();

           me.setLogCmd('defined sets', true);
        });

        $("#" + me.pre + "setOr").click(function (e) {
           me.setOperation = 'or';
        });
        $("#" + me.pre + "setAnd").click(function (e) {
           me.setOperation = 'and';
        });
        $("#" + me.pre + "setNot").click(function (e) {
           me.setOperation = 'not';
        });
    },

    clkMn2_pkNo: function() { var me = this;
        $("#" + me.pre + "mn2_pkNo").click(function (e) {
           me.icn3d.pk = 0;
           me.icn3d.opts['pk'] = 'no';
           me.setLogCmd('set pk off', true);

           me.icn3d.draw();
           me.icn3d.removeHlObjects();
        });
    },

    clkMn2_pkYes: function() { var me = this;
        $("#" + me.pre + "mn2_pkYes").click(function (e) {
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.setLogCmd('set pk atom', true);
        });
    },

    clkMn2_pkResidue: function() { var me = this;
        $("#" + me.pre + "mn2_pkResidue").click(function (e) {
           me.icn3d.pk = 2;
           me.icn3d.opts['pk'] = 'residue';
           me.setLogCmd('set pk residue', true);
        });
    },

    clkMn2_pkStrand: function() { var me = this;
        $("#" + me.pre + "mn2_pkStrand").click(function (e) {
           me.icn3d.pk = 3;
           me.icn3d.opts['pk'] = 'strand';
           me.setLogCmd('set pk strand', true);
        });
    },

    clkMn2_pkChain: function() { var me = this;
        $("#" + me.pre + "mn2_pkChain").click(function (e) {
           me.icn3d.pk = 4;
           me.icn3d.opts['pk'] = 'chain';
           me.setLogCmd('set pk chain', true);
        });
    },

    clkMn2_aroundsphere: function() { var me = this;
        $("#" + me.pre + "mn2_aroundsphere").click(function (e) {
           me.openDialog(me.pre + 'dl_aroundsphere', 'Select a sphere around current selection');
        });
    },

    clkMn2_select_chain: function() { var me = this;
        $("#" + me.pre + "mn2_select_chain").add("#" + me.pre + "definedSets").click(function (e) {
           me.openDialog(me.pre + 'dl_select_chain', 'Select Structure/Chain/Custom Selection');
        });
    },

    // mn 3
    clkMn3_proteinsRibbon: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsRibbon").click(function (e) {
           me.setStyle('proteins', 'ribbon');
           me.setLogCmd('style proteins ribbon', true);
        });
    },

    clkMn3_proteinsStrand: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsStrand").click(function (e) {
           me.setStyle('proteins', 'strand');

           me.setLogCmd('style proteins strand', true);
        });
    },

    clkMn3_proteinsCylinder: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsCylinder").click(function (e) {
           me.setStyle('proteins', 'cylinder and plate');
           me.setLogCmd('style proteins cylinder and plate', true);
        });
    },

    clkMn3_proteinsSchematic: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsSchematic").click(function (e) {
           me.setStyle('proteins', 'schematic');
           me.setLogCmd('style proteins schematic', true);
        });
    },

    clkMn3_proteinsCalpha: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsCalpha").click(function (e) {
           me.setStyle('proteins', 'c alpha trace');
           me.setLogCmd('style proteins c alpha trace', true);
        });
    },

    clkMn3_proteinsBfactor: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsBfactor").click(function (e) {
           me.setStyle('proteins', 'b factor tube');
           me.setLogCmd('style proteins b factor tube', true);
        });
    },

    clkMn3_proteinsLines: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsLines").click(function (e) {
           me.setStyle('proteins', 'lines');
           me.setLogCmd('style proteins lines', true);
        });
    },

    clkMn3_proteinsStick: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsStick").click(function (e) {
           me.setStyle('proteins', 'stick');
           me.setLogCmd('style proteins stick', true);
        });
    },

    clkMn3_proteinsBallstick: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsBallstick").click(function (e) {
           me.setStyle('proteins', 'ball and stick');
           me.setLogCmd('style proteins ball and stick', true);
        });
    },

    clkMn3_proteinsSphere: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsSphere").click(function (e) {
           me.setStyle('proteins', 'sphere');
           me.setLogCmd('style proteins sphere', true);
        });
    },

    clkMn3_proteinsNo: function() { var me = this;
        $("#" + me.pre + "mn3_proteinsNo").click(function (e) {
           me.setStyle('proteins', 'nothing');
           me.setLogCmd('style proteins nothing', true);
        });
    },

    clkMn3_sidecLines: function() { var me = this;
        $("#" + me.pre + "mn3_sidecLines").click(function (e) {
           me.setStyle('sidec', 'lines');
           me.setLogCmd('style sidec lines', true);
        });
    },

    clkMn3_sidecStick: function() { var me = this;
        $("#" + me.pre + "mn3_sidecStick").click(function (e) {
           me.setStyle('sidec', 'stick');
           me.setLogCmd('style sidec stick', true);
        });
    },

    clkMn3_sidecBallstick: function() { var me = this;
        $("#" + me.pre + "mn3_sidecBallstick").click(function (e) {
           me.setStyle('sidec', 'ball and stick');
           me.setLogCmd('style sidec ball and stick', true);
        });
    },

    clkMn3_sidecSphere: function() { var me = this;
        $("#" + me.pre + "mn3_sidecSphere").click(function (e) {
           me.setStyle('sidec', 'sphere');
           me.setLogCmd('style sidec sphere', true);
        });
    },

    clkMn3_sidecNo: function() { var me = this;
        $("#" + me.pre + "mn3_sidecNo").click(function (e) {
           me.setStyle('sidec', 'nothing');
           me.setLogCmd('style sidec nothing', true);
        });
    },


    clkMn3_nuclCartoon: function() { var me = this;
        $("#" + me.pre + "mn3_nuclCartoon").click(function (e) {
           me.setStyle('nucleotides', 'nucleotide cartoon');
           me.setLogCmd('style nucleotides nucleotide cartoon', true);
        });
    },

    clkMn3_nuclSchematic: function() { var me = this;
        $("#" + me.pre + "mn3_nuclSchematic").click(function (e) {
           me.setStyle('nucleotides', 'schematic');
           me.setLogCmd('style nucleotides schematic', true);
        });
    },

    clkMn3_nuclPhos: function() { var me = this;
        $("#" + me.pre + "mn3_nuclPhos").click(function (e) {
           me.setStyle('nucleotides', 'o3 trace');
           me.setLogCmd('style nucleotides o3 trace', true);
        });
    },

    clkMn3_nuclLines: function() { var me = this;
        $("#" + me.pre + "mn3_nuclLines").click(function (e) {
           me.setStyle('nucleotides', 'lines');
           me.setLogCmd('style nucleotides lines', true);
        });
    },

    clkMn3_nuclStick: function() { var me = this;
        $("#" + me.pre + "mn3_nuclStick").click(function (e) {
           me.setStyle('nucleotides', 'stick');
           me.setLogCmd('style nucleotides stick', true);
        });
    },

    clkMn3_nuclBallstick: function() { var me = this;
        $("#" + me.pre + "mn3_nuclBallstick").click(function (e) {
           me.setStyle('nucleotides', 'ball and stick');
           me.setLogCmd('style nucleotides ball and stick', true);
        });
    },

    clkMn3_nuclSphere: function() { var me = this;
        $("#" + me.pre + "mn3_nuclSphere").click(function (e) {
           me.setStyle('nucleotides', 'sphere');
           me.setLogCmd('style nucleotides sphere', true);
        });
    },

    clkMn3_nuclNo: function() { var me = this;
        $("#" + me.pre + "mn3_nuclNo").click(function (e) {
           me.setStyle('nucleotides', 'nothing');
           me.setLogCmd('style nucleotides nothing', true);
        });
    },

    clkMn3_ligLines: function() { var me = this;
        $("#" + me.pre + "mn3_ligLines").click(function (e) {
           me.setStyle('chemicals', 'lines');
           me.setLogCmd('style chemicals lines', true);
        });
    },

    clkMn3_ligStick: function() { var me = this;
        $("#" + me.pre + "mn3_ligStick").click(function (e) {
           me.setStyle('chemicals', 'stick');
           me.setLogCmd('style chemicals stick', true);
        });
    },

    clkMn3_ligBallstick: function() { var me = this;
        $("#" + me.pre + "mn3_ligBallstick").click(function (e) {
           me.setStyle('chemicals', 'ball and stick');
           me.setLogCmd('style chemicals ball and stick', true);
        });
    },

    clkMn3_ligSchematic: function() { var me = this;
        $("#" + me.pre + "mn3_ligSchematic").click(function (e) {
           me.setStyle('chemicals', 'schematic');
           me.setLogCmd('style chemicals schematic', true);
        });
    },

    clkMn3_ligSphere: function() { var me = this;
        $("#" + me.pre + "mn3_ligSphere").click(function (e) {
           me.setStyle('chemicals', 'sphere');
           me.setLogCmd('style chemicals sphere', true);
        });
    },

    clkMn3_ligNo: function() { var me = this;
        $("#" + me.pre + "mn3_ligNo").click(function (e) {
           me.setStyle('chemicals', 'nothing');
           me.setLogCmd('style chemicals nothing', true);
        });
    },

    clkMn3_ionsSphere: function() { var me = this;
        $("#" + me.pre + "mn3_ionsSphere").click(function (e) {
           me.setStyle('ions', 'sphere');
           me.setLogCmd('style ions sphere', true);
        });
    },

    clkMn3_ionsDot: function() { var me = this;
        $("#" + me.pre + "mn3_ionsDot").click(function (e) {
           me.setStyle('ions', 'dot');
           me.setLogCmd('style ions dot', true);
        });
    },

    clkMn3_ionsNo: function() { var me = this;
        $("#" + me.pre + "mn3_ionsNo").click(function (e) {
           me.setStyle('ions', 'nothing');
           me.setLogCmd('style ions nothing', true);
        });
    },

    clkMn3_waterSphere: function() { var me = this;
        $("#" + me.pre + "mn3_waterSphere").click(function (e) {
           me.setStyle('water', 'sphere');
           me.setLogCmd('style water sphere', true);
        });
    },

    clkMn3_waterDot: function() { var me = this;
        $("#" + me.pre + "mn3_waterDot").click(function (e) {
           me.setStyle('water', 'dot');
           me.setLogCmd('style water dot', true);
        });
    },

    clkMn3_waterNo: function() { var me = this;
        $("#" + me.pre + "mn3_waterNo").click(function (e) {
           me.setStyle('water', 'nothing');
           me.setLogCmd('style water nothing', true);
        });
    },

    // mn 4
    clkMn4_clrSpectrum: function() { var me = this;
        $("#" + me.pre + "mn4_clrSpectrum").click(function (e) {
           me.setOption('color', 'spectrum');
           me.setLogCmd('color spectrum', true);
        });
    },

    clkMn4_clrChain: function() { var me = this;
        $("#" + me.pre + "mn4_clrChain").click(function (e) {
           me.setOption('color', 'chain');
           me.setLogCmd('color chain', true);
        });
    },

    clkMn4_clrSSGreen: function() { var me = this;
        $("#" + me.pre + "mn4_clrSSGreen").click(function (e) {
           me.icn3d.sheetcolor = 'green';

           me.setOption('color', 'secondary structure');
           me.setLogCmd('color secondary structure', true);
        });
    },

    clkMn4_clrSSYellow: function() { var me = this;
        $("#" + me.pre + "mn4_clrSSYellow").click(function (e) {
           me.icn3d.sheetcolor = 'yellow';

           me.setOption('color', 'secondary structure yellow');
           me.setLogCmd('color secondary structure yellow', true);
        });
    },

    clkMn4_clrResidue: function() { var me = this;
        $("#" + me.pre + "mn4_clrResidue").click(function (e) {
           me.setOption('color', 'residue');
           me.setLogCmd('color residue', true);
        });
    },

    clkMn4_clrCharge: function() { var me = this;
        $("#" + me.pre + "mn4_clrCharge").click(function (e) {
           me.setOption('color', 'charge');
           me.setLogCmd('color charge', true);
        });
    },

    clkMn4_clrHydrophobic: function() { var me = this;
        $("#" + me.pre + "mn4_clrHydrophobic").click(function (e) {
           me.setOption('color', 'hydrophobic');
           me.setLogCmd('color hydrophobic', true);
        });
    },

    clkMn4_clrAtom: function() { var me = this;
        $("#" + me.pre + "mn4_clrAtom").click(function (e) {
           me.setOption('color', 'atom');
           me.setLogCmd('color atom', true);
        });
    },

    clkMn4_clrBfactor: function() { var me = this;
        $("#" + me.pre + "mn4_clrBfactor").click(function (e) {
           me.setOption('color', 'b factor');
           me.setLogCmd('color b factor', true);
        });
    },

    clkMn4_clrBfactorNorm: function() { var me = this;
        $("#" + me.pre + "mn4_clrBfactorNorm").click(function (e) {
           me.setOption('color', 'b factor percentile');
           me.setLogCmd('color b factor percentile', true);
        });
    },

    clkMn4_clrConserved: function() { var me = this;
        $("#" + me.pre + "mn4_clrConserved").click(function (e) {
           me.setOption('color', 'conserved');
           me.setLogCmd('color conserved', true);
        });
    },

    clkMn4_clrRed: function() { var me = this;
        $("#" + me.pre + "mn4_clrRed").click(function (e) {
           me.setOption('color', 'red');
           me.setLogCmd('color red', true);
        });
    },

    clkMn4_clrGreen: function() { var me = this;
        $("#" + me.pre + "mn4_clrGreen").click(function (e) {
           me.setOption('color', 'green');
           me.setLogCmd('color green', true);
        });
    },

    clkMn4_clrBlue: function() { var me = this;
        $("#" + me.pre + "mn4_clrBlue").click(function (e) {
           me.setOption('color', 'blue');
           me.setLogCmd('color blue', true);
        });
    },

    clkMn4_clrMagenta: function() { var me = this;
        $("#" + me.pre + "mn4_clrMagenta").click(function (e) {
           me.setOption('color', 'magenta');
           me.setLogCmd('color magenta', true);
        });
    },

    clkMn4_clrYellow: function() { var me = this;
        $("#" + me.pre + "mn4_clrYellow").click(function (e) {
           me.setOption('color', 'yellow');
           me.setLogCmd('color yellow', true);
        });
    },

    clkMn4_clrCyan: function() { var me = this;
        $("#" + me.pre + "mn4_clrCyan").click(function (e) {
           me.setOption('color', 'cyan');
           me.setLogCmd('color cyan', true);
        });
    },

    clkMn4_clrWhite: function() { var me = this;
        $("#" + me.pre + "mn4_clrWhite").click(function (e) {
           me.setOption('color', 'white');
           me.setLogCmd('color white', true);
        });
    },

    clkMn4_clrGrey: function() { var me = this;
        $("#" + me.pre + "mn4_clrGrey").click(function (e) {
           me.setOption('color', 'grey');
           me.setLogCmd('color grey', true);
        });
    },

    clkMn4_clrCustom: function() { var me = this;
        $("#" + me.pre + "mn4_clrCustom").click(function (e) {
           me.openDialog(me.pre + 'dl_clr', 'Color picker');
        });
    },

    clkMn4_clrSave: function() { var me = this;
        $("#" + me.pre + "mn4_clrSave").click(function (e) {
           me.saveColor();

           me.setLogCmd('save color', true);
        });
    },

    clkMn4_clrApplySave: function() { var me = this;
        $("#" + me.pre + "mn4_clrApplySave").click(function (e) {
           me.applySavedColor();

           me.setLogCmd('apply saved color', true);
        });
    },

    clkMn3_styleSave: function() { var me = this;
        $("#" + me.pre + "mn3_styleSave").click(function (e) {
           me.saveStyle();
           me.setLogCmd('save style', true);
        });
    },

    clkMn3_styleApplySave: function() { var me = this;
        $("#" + me.pre + "mn3_styleApplySave").click(function (e) {
           me.applySavedStyle();
           me.setLogCmd('apply saved style', true);
        });
    },

    // mn 5
    clkMn5_neighborsYes: function() { var me = this;
        $("#" + me.pre + "mn5_neighborsYes").click(function (e) {
           me.icn3d.bConsiderNeighbors = true;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCmd('set surface neighbors on', true);
        });
    },

    clkMn5_neighborsNo: function() { var me = this;
        $("#" + me.pre + "mn5_neighborsNo").click(function (e) {
           me.icn3d.bConsiderNeighbors = false;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCmd('set surface neighbors off', true);
        });
    },

    clkMn5_surfaceVDW: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceVDW").click(function (e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'Van der Waals surface');
           me.setLogCmd('set surface Van der Waals surface', true);
        });
    },

    clkMn5_surfaceSAS: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceSAS").click(function (e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'solvent accessible surface');
           me.setLogCmd('set surface solvent accessible surface', true);
        });
    },

    clkMn5_surfaceMolecular: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceMolecular").click(function (e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'molecular surface');
           me.setLogCmd('set surface molecular surface', true);
        });
    },

    clkMn5_surfaceVDWContext: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceVDWContext").click(function (e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'Van der Waals surface with context');
           me.setLogCmd('set surface Van der Waals surface with context', true);
        });
    },

    clkMn5_surfaceSASContext: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceSASContext").click(function (e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'solvent accessible surface with context');
           me.setLogCmd('set surface solvent accessible surface with context', true);
        });
    },

    clkMn5_surfaceMolecularContext: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceMolecularContext").click(function (e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'molecular surface with context');
           me.setLogCmd('set surface molecular surface with context', true);
        });
    },

    clkMn5_surfaceNo: function() { var me = this;
        $("#" + me.pre + "mn5_surfaceNo").click(function (e) {
           me.setOption('surface', 'nothing');
           me.setLogCmd('set surface nothing', true);
        });
    },

    clkMn5_opacity10: function() { var me = this;
        $("#" + me.pre + "mn5_opacity10").click(function (e) {
           me.setOption('opacity', '1.0');
           me.setLogCmd('set surface opacity 1.0', true);
        });
    },

    clkMn5_opacity09: function() { var me = this;
        $("#" + me.pre + "mn5_opacity09").click(function (e) {
           me.setOption('opacity', '0.9');
           me.setLogCmd('set surface opacity 0.9', true);
        });
    },

    clkMn5_opacity08: function() { var me = this;
        $("#" + me.pre + "mn5_opacity08").click(function (e) {
           me.setOption('opacity', '0.8');
           me.setLogCmd('set surface opacity 0.8', true);
        });
    },

    clkMn5_opacity07: function() { var me = this;
        $("#" + me.pre + "mn5_opacity07").click(function (e) {
           me.setOption('opacity', '0.7');
           me.setLogCmd('set surface opacity 0.7', true);
        });
    },

    clkMn5_opacity06: function() { var me = this;
        $("#" + me.pre + "mn5_opacity06").click(function (e) {
           me.setOption('opacity', '0.6');
           me.setLogCmd('set surface opacity 0.6', true);
        });
    },

    clkMn5_opacity05: function() { var me = this;
        $("#" + me.pre + "mn5_opacity05").click(function (e) {
           me.setOption('opacity', '0.5');
           me.setLogCmd('set surface opacity 0.5', true);
        });
    },

    clkMn5_wireframeYes: function() { var me = this;
        $("#" + me.pre + "mn5_wireframeYes").click(function (e) {
           me.setOption('wireframe', 'yes');
           me.setLogCmd('set surface wireframe on', true);
        });
    },

    clkMn5_wireframeNo: function() { var me = this;
        $("#" + me.pre + "mn5_wireframeNo").click(function (e) {
           me.setOption('wireframe', 'no');
           me.setLogCmd('set surface wireframe off', true);
        });
    },

    clkMn5_elecmap2fofc: function() { var me = this;
        $("#" + me.pre + "mn5_elecmap2fofc").click(function (e) {
           var type = '2fofc';
           me.Dsn6Parser(me.inputid, type);

           //me.setOption('map', '2fofc');
           me.setLogCmd('set map 2fofc', true);
        });
    },

    clkMn5_elecmapfofc: function() { var me = this;
        $("#" + me.pre + "mn5_elecmapfofc").click(function (e) {
           var type = 'fofc';
           me.Dsn6Parser(me.inputid, type);

           //me.setOption('map', 'fofc');
           me.setLogCmd('set map fofc', true);
        });
    },

    clkMn5_elecmapNo: function() { var me = this;
        $("#" + me.pre + "mn5_elecmapNo").click(function (e) {
           me.setOption('map', 'nothing');
           me.setLogCmd('set map nothing', true);
        });
    },

    clkMn5_mapwireframeYes: function() { var me = this;
        $("#" + me.pre + "mn5_mapwireframeYes").click(function (e) {
           //me.Dsn6Parser(me.inputid);

           me.setOption('mapwireframe', 'yes');
           me.setLogCmd('set map wireframe on', true);
        });
    },

    clkMn5_mapwireframeNo: function() { var me = this;
        $("#" + me.pre + "mn5_mapwireframeNo").click(function (e) {
           me.setOption('mapwireframe', 'no');
           me.setLogCmd('set map wireframe off', true);
        });
    },

    // mn 6
    clkMn6_assemblyYes: function() { var me = this;
        $("#" + me.pre + "mn6_assemblyYes").click(function (e) {
           me.icn3d.bAssembly = true;
           me.setLogCmd('set assembly on', true);
           me.icn3d.draw();
        });
    },

    clkMn6_assemblyNo: function() { var me = this;
        $("#" + me.pre + "mn6_assemblyNo").click(function (e) {
           me.icn3d.bAssembly = false;
           me.setLogCmd('set assembly off', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelResidues: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelResidues").click(function (e) {
           //me.setLogCmd('add residue labels', true);

           me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add residue labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelChains: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelChains").click(function (e) {
           me.addChainLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add chain labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelTermini: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelTermini").click(function (e) {
           me.addTerminiLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add terminal labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelYes: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelYes").click(function (e) {
           me.openDialog(me.pre + 'dl_addlabel', 'Add custom labels by selection');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;
        });
    },

    clkMn6_addlabelSelection: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelSelection").click(function (e) {
           me.openDialog(me.pre + 'dl_addlabelselection', 'Add custom labels by the current selection');
        });
    },

    clkMn2_saveselection: function() { var me = this;
        $("#" + me.pre + "mn2_saveselection").click(function (e) {
           me.openDialog(me.pre + 'dl_saveselection', 'Save the current selection');
        });
    },

    clkMn6_addlabelNo: function() { var me = this;
        $("#" + me.pre + "mn6_addlabelNo").add("#" + me.pre + "removeLabels").click(function (e) {
           me.icn3d.pickpair = false;

           //me.icn3d.labels['residue'] = [];
           //me.icn3d.labels['custom'] = [];

           var select = "set labels off";
           me.setLogCmd(select, true);

           for(var name in me.icn3d.labels) {
               //if(name === 'residue' || name === 'custom') {
                   me.icn3d.labels[name] = [];
               //}
           }

           me.icn3d.draw();
        });
    },

    clkMn6_distanceYes: function() { var me = this;
        $("#" + me.pre + "mn6_distanceYes").click(function (e) {
           me.openDialog(me.pre + 'dl_distance', 'Measure the distance of atoms');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;

           me.bMeasureDistance = true;
        });
    },

    clkMn6_distanceNo: function() { var me = this;
        $("#" + me.pre + "mn6_distanceNo").click(function (e) {
           me.icn3d.pickpair = false;

           var select = "set lines off";
           me.setLogCmd(select, true);

           me.icn3d.labels['distance'] = [];
           me.icn3d.lines['distance'] = [];

           me.icn3d.pk = 2;

           me.icn3d.draw();
        });
    },

    clkMn2_selectedcenter: function() { var me = this;
        $("#" + me.pre + "mn2_selectedcenter").add("#" + me.pre + "zoomin_selection").click(function (e) {
           //me.setLogCmd('zoom selection', true);

           me.icn3d.zoominSelection();
           me.icn3d.draw();
           me.setLogCmd('zoom selection', true);
        });
    },

    clkMn6_center: function() { var me = this;
        $("#" + me.pre + "mn6_center").click(function (e) {
           //me.setLogCmd('center selection', true);

           me.icn3d.centerSelection();
           me.icn3d.draw();
           me.setLogCmd('center selection', true);
        });
    },

    clkMn6_resetOrientation: function() { var me = this;
        $("#" + me.pre + "mn6_resetOrientation").add("#" + me.pre + "resetOrientation").click(function (e) {
           //me.setLogCmd('reset orientation', true);

           me.icn3d.resetOrientation();

           me.icn3d.applyOriginalColor();

           me.icn3d.draw();
           me.setLogCmd('reset orientation', true);
        });
    },

    clkMn6_chemicalbindingshow: function() { var me = this;
        $("#" + me.pre + "mn6_chemicalbindingshow").add("#" + me.pre + "chemicalbindingshow").click(function (e) {
           me.setOption('chemicalbinding', 'show');
           me.setLogCmd('set chemicalbinding show', true);
        });
    },

    clkMn6_chemicalbindinghide: function() { var me = this;
        $("#" + me.pre + "mn6_chemicalbindinghide").add("#" + me.pre + "chemicalbindinghide").click(function (e) {
           me.setOption('chemicalbinding', 'hide');
           me.setLogCmd('set chemicalbinding hide', true);
        });
    },

    clkMn6_rotateleft: function() { var me = this;
        $("#" + me.pre + "mn6_rotateleft").click(function (e) {
           me.setLogCmd('rotate left', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'left';

           me.rotStruc('left');
        });
    },

    clkMn6_rotateright: function() { var me = this;
        $("#" + me.pre + "mn6_rotateright").click(function (e) {
           me.setLogCmd('rotate right', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'right';

           me.rotStruc('right');
        });
    },

    clkMn6_rotateup: function() { var me = this;
        $("#" + me.pre + "mn6_rotateup").click(function (e) {
           me.setLogCmd('rotate up', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'up';

           me.rotStruc('up');
        });
    },

    clkMn6_rotatedown: function() { var me = this;
        $("#" + me.pre + "mn6_rotatedown").click(function (e) {
           me.setLogCmd('rotate down', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'down';

           me.rotStruc('down');
        });
    },

    clkMn6_cameraPers: function() { var me = this;
        $("#" + me.pre + "mn6_cameraPers").click(function (e) {
           me.setOption('camera', 'perspective');
           me.setLogCmd('set camera perspective', true);
        });
    },

    clkMn6_cameraOrth: function() { var me = this;
        $("#" + me.pre + "mn6_cameraOrth").click(function (e) {
           me.setOption('camera', 'orthographic');
           me.setLogCmd('set camera orthographic', true);
        });
    },

    clkMn6_bkgdBlack: function() { var me = this;
        $("#" + me.pre + "mn6_bkgdBlack").click(function (e) {
           me.setOption('background', 'black');
           me.setLogCmd('set background black', true);
        });
    },

    clkMn6_bkgdGrey: function() { var me = this;
        $("#" + me.pre + "mn6_bkgdGrey").click(function (e) {
           me.setOption('background', 'grey');
           me.setLogCmd('set background grey', true);
        });
    },

    clkMn6_bkgdWhite: function() { var me = this;
        $("#" + me.pre + "mn6_bkgdWhite").click(function (e) {
           me.setOption('background', 'white');
           me.setLogCmd('set background white', true);
        });
    },

    clkMn6_bkgdTransparent: function() { var me = this;
        $("#" + me.pre + "mn6_bkgdTransparent").click(function (e) {
           me.setOption('background', 'transparent');
           me.setLogCmd('set background transparent', true);
        });
    },

    clkMn6_showfogYes: function() { var me = this;
        $("#" + me.pre + "mn6_showfogYes").click(function (e) {
           me.setOption('fog', 'yes');
           me.setLogCmd('set fog on', true);
        });
    },

    clkMn6_showfogNo: function() { var me = this;
        $("#" + me.pre + "mn6_showfogNo").click(function (e) {
           me.setOption('fog', 'no');
           me.setLogCmd('set fog off', true);
        });
    },

    clkMn6_showslabYes: function() { var me = this;
        $("#" + me.pre + "mn6_showslabYes").click(function (e) {
           me.setOption('slab', 'yes');
           me.setLogCmd('set slab on', true);
        });
    },

    clkMn6_showslabNo: function() { var me = this;
        $("#" + me.pre + "mn6_showslabNo").click(function (e) {
           me.setOption('slab', 'no');
           me.setLogCmd('set slab off', true);
        });
    },

    clkMn6_showaxisYes: function() { var me = this;
        $("#" + me.pre + "mn6_showaxisYes").click(function (e) {
           me.setOption('axis', 'yes');
           me.setLogCmd('set axis on', true);
        });
    },

    clkMn6_showaxisNo: function() { var me = this;
        $("#" + me.pre + "mn6_showaxisNo").click(function (e) {
           me.setOption('axis', 'no');
           me.setLogCmd('set axis off', true);
        });
    },

    clkMn6_hbondsYes: function() { var me = this;
        $("#" + me.pre + "mn6_hbondsYes").click(function (e) {
           me.openDialog(me.pre + 'dl_hbonds', 'Hydrogen bonds to selection');
        });
    },

    clkMn6_hbondsNo: function() { var me = this;
        $("#" + me.pre + "mn6_hbondsNo").click(function (e) {
           var select = "set hbonds off";
           me.setLogCmd(select, true);

           me.icn3d.hideHbonds();
           me.icn3d.draw();
        });
    },

    clkmn1_stabilizerYes: function() { var me = this;
        $("#" + me.pre + "mn1_stabilizerYes").click(function (e) {
           //me.openDialog(me.pre + 'dl_stabilizer', 'Hydrogen bonds inside selection');

           var select = "stabilizer";

           me.addStabilizer();
           me.prepareFor3Dprint();
           //me.icn3d.draw();

           me.setLogCmd(select, true);
        });
    },

    clkmn1_stabilizerNo: function() { var me = this;
        $("#" + me.pre + "mn1_stabilizerNo").click(function (e) {
           var select = "set stabilizer off";
           me.setLogCmd(select, true);

           me.hideStabilizer();

           me.icn3d.draw();
        });
    },

    clkmn1_stabilizerOne: function() { var me = this;
        $("#" + me.pre + "mn1_stabilizerOne").click(function (e) {
           me.openDialog(me.pre + 'dl_stabilizer', 'Add One Stabilizer');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;
        });
    },

    clkmn1_stabilizerRmOne: function() { var me = this;
        $("#" + me.pre + "mn1_stabilizerRmOne").click(function (e) {
           me.openDialog(me.pre + 'dl_stabilizer_rm', 'Remove One Stabilizer');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;
        });
    },

    clkmn1_thicknessSet: function() { var me = this;
        $("#" + me.pre + "mn1_thicknessSet").click(function (e) {
           me.openDialog(me.pre + 'dl_thickness', 'Set Thickness for 3D Printing');
        });
    },

    clkmn1_thicknessReset: function() { var me = this;
        $("#" + me.pre + "mn1_thicknessReset").click(function (e) {
           var select = "reset thickness";
           me.setLogCmd(select, true);

           me.bSetThickness = false;

           me.resetAfter3Dprint();
           me.icn3d.draw();
        });
    },

    clkMn6_ssbondsYes: function() { var me = this;
        $("#" + me.pre + "mn6_ssbondsYes").click(function (e) {
           var select = "disulfide bonds";
           me.setLogCmd(select, true);

           me.showSsbonds();
        });
    },

    clkMn6_ssbondsNo: function() { var me = this;
        $("#" + me.pre + "mn6_ssbondsNo").click(function (e) {
           me.icn3d.opts["ssbonds"] = "no";

           var select = "set disulfide bonds off";
           me.setLogCmd(select, true);

           me.icn3d.lines['ssbond'] = [];

           me.setStyle('sidec', 'nothing');
        });
    },

    clkMn6_clbondsYes: function() { var me = this;
        $("#" + me.pre + "mn6_clbondsYes").click(function (e) {
           var select = "cross linkage";
           me.setLogCmd(select, true);

           me.icn3d.bShowCrossResidueBond = true;

           me.setStyle('proteins', 'lines')
           //me.icn3d.draw();
        });
    },

    clkMn6_clbondsNo: function() { var me = this;
        $("#" + me.pre + "mn6_clbondsNo").click(function (e) {
           me.icn3d.opts["clbonds"] = "no";

           var select = "set cross linkage off";
           me.setLogCmd(select, true);

           me.icn3d.bShowCrossResidueBond = false;
           //me.opts['proteins'] = 'ribbon';

           //me.icn3d.draw();
           me.setStyle('proteins', 'ribbon')
        });
    },

    // other
    clickViewswitch: function() { var me = this;
/*
        $("#" + me.pre + "viewswitch").click(function (e) {
            if($("#" + me.pre + "viewswitch")[0].checked) { // mode: Detailed View
                me.setAnnoViewAndDisplay('overview');
                me.setLogCmd("set view overview", true);
            }
            else { // mode: all
                me.setAnnoViewAndDisplay('detailed view');
                me.setLogCmd("set view detailed view", true);
            }
        });
*/
        $("#" + me.pre + "anno_summary").click(function (e) {
            e.preventDefault();

            me.setAnnoViewAndDisplay('overview');
            me.setLogCmd("set view overview", true);
        });

        $("#" + me.pre + "anno_details").click(function (e) {
            e.preventDefault();

            me.setAnnoViewAndDisplay('detailed view');
            me.setLogCmd("set view detailed view", true);
        });
    },

    clickShow_annotations: function() { var me = this;
        $("#" + me.pre + "show_annotations").click(function(e) {
             me.showAnnotations();
             me.setLogCmd("view annotations", true);
        });
    },

    clickShowallchains: function() { var me = this;
        $("#" + me.pre + "showallchains").click(function(e) {
             me.showAnnoAllChains();
             me.setLogCmd("show annotations all chains", true);
        });
    },

    clickShow_alignsequences: function() { var me = this;
        $("#" + me.pre + "show_alignsequences").click(function(e) {
             me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clickShow_2ddgm: function() { var me = this;
        $("#" + me.pre + "show_2ddgm").add("#" + me.pre + "mn2_2ddgm").click(function(e) {
             me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
             if(!me.b2DShown) {
                 if(me.cfg.align !== undefined) {
                     var structureArray = Object.keys(me.icn3d.structures);
                     me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
                 }
                 else {
                     me.download2Ddgm(me.inputid.toUpperCase());
                 }
             }

             me.setLogCmd("view interactions", true);
        });
    },

    clickSearchSeq: function() { var me = this;
        $(document).on("click", "#" + me.pre + "search_seq_button", function(e) {
           e.stopImmediatePropagation();

           var select = $("#" + me.pre + "search_seq").val();
           if(isNaN(select) && select.indexOf('$') == -1 && select.indexOf('.') == -1 && select.indexOf(':') == -1 && select.indexOf('@') == -1) {
               select = ':' + select;
           }

           var commandname = select;
           //var commanddesc = "search with the one-letter sequence " + select;
           var commanddesc = select;

           me.selectByCommand(select, commandname, commanddesc);
           //me.setLogCmd('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);
        });
    },

    clickReload_mmtf: function() { var me = this;
        $("#" + me.pre + "reload_mmtf").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=' + $("#" + me.pre + "mmtfid").val(), '_blank');
        });
    },

    clickReload_pdb: function() { var me = this;
        $("#" + me.pre + "reload_pdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
        });
    },

    clickReload_align_refined: function() { var me = this;
        $("#" + me.pre + "reload_align_refined").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCmd("load alignment " + alignment + ' | parameters &atype=1', false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=1', '_blank');
        });
    },

    clickReload_align_ori: function() { var me = this;
        $("#" + me.pre + "reload_align_ori").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCmd("load alignment " + alignment + ' | parameters &atype=0', false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=0', '_blank');
        });
    },

    clickReload_mmcif: function() { var me = this;
        $("#" + me.pre + "reload_mmcif").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=' + $("#" + me.pre + "mmcifid").val(), '_blank');
        });
    },

    clickReload_mmdb: function() { var me = this;
        $("#" + me.pre + "reload_mmdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmdb " + $("#" + me.pre + "mmdbid").val(), false);

           //me.downloadMmdb($("#" + me.pre + "mmdbid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=' + $("#" + me.pre + "mmdbid").val(), '_blank');
        });
    },

    clickReload_gi: function() { var me = this;
        $("#" + me.pre + "reload_gi").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load gi " + $("#" + me.pre + "gi").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');
        });
    },

    clickReload_cid: function() { var me = this;
        $("#" + me.pre + "reload_cid").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=' + $("#" + me.pre + "cid").val(), '_blank');
        });
    },

    clickReload_pngimage: function() { var me = this;
        $("#" + me.pre + "reload_pngimage").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           // initialize icn3dui
           me.init();
           me.icn3d.init();

           var file = $("#" + me.pre + "pngimage")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var imageStr = e.target.result; // or = reader.result;
               var matchedStr = 'Share Link: ';
               var pos = imageStr.indexOf(matchedStr);
               if(pos == -1) {
                   alert('Please load a PNG image saved by clicking "Save Files > PNG Image" in the File menu...');
               }
               else {
                   var url = imageStr.substr(pos + matchedStr.length);

                   me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);

                   window.open(url);
               }
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_state: function() { var me = this;
        $("#" + me.pre + "reload_state").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           // initialize icn3dui
           me.init();
           me.icn3d.init();

           var file = $("#" + me.pre + "state")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load state file ' + $("#" + me.pre + "state").val(), false);

               me.icn3d.commands = [];
               me.icn3d.optsHistory = [];

               me.loadScript(dataStr, true);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_selectionfile: function() { var me = this;
        $("#" + me.pre + "reload_selectionfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var file = $("#" + me.pre + "selectionfile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               //me.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);

               me.loadSelection(dataStr);
               me.setLogCmd('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_pdbfile: function() { var me = this;
        $("#" + me.pre + "reload_pdbfile").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var file = $("#" + me.pre + "pdbfile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load pdb file ' + $("#" + me.pre + "pdbfile").val(), false);

               me.icn3d.molTitle = "";

               me.init();
               me.icn3d.init();

               me.loadPdbData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_mol2file: function() { var me = this;
        $("#" + me.pre + "reload_mol2file").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var file = $("#" + me.pre + "mol2file")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load mol2 file ' + $("#" + me.pre + "mol2file").val(), false);

               me.icn3d.molTitle = "";

               me.inputid = undefined;

               me.init();
               me.icn3d.init();

               me.loadMol2Data(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_sdffile: function() { var me = this;
        $("#" + me.pre + "reload_sdffile").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var file = $("#" + me.pre + "sdffile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load sdf file ' + $("#" + me.pre + "sdffile").val(), false);

               me.icn3d.molTitle = "";
               me.inputid = undefined;

               me.init();
               me.icn3d.init();

               me.loadSdfData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_xyzfile: function() { var me = this;
        $("#" + me.pre + "reload_xyzfile").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var file = $("#" + me.pre + "xyzfile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load xyz file ' + $("#" + me.pre + "xyzfile").val(), false);

               me.icn3d.molTitle = "";
               me.inputid = undefined;

               me.init();
               me.icn3d.init();

               me.loadXyzData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_urlfile: function() { var me = this;
        $("#" + me.pre + "reload_urlfile").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var type = $("#" + me.pre + "filetype").val();
           var url = $("#" + me.pre + "urlfile").val();

           me.init();
           me.icn3d.init();

           me.downloadUrl(url, type);
        });
    },

    clickReload_mmciffile: function() { var me = this;
        $("#" + me.pre + "reload_mmciffile").click(function(e) {
           e.preventDefault();

           me.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var file = $("#" + me.pre + "mmciffile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStr = e.target.result; // or = reader.result;

               me.setLogCmd('load mmcif file ' + $("#" + me.pre + "mmciffile").val(), false);

               me.icn3d.molTitle = "";

                var url = "//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

                me.icn3d.bCid = undefined;

               $.ajax({
                  url: url,
                  type: 'POST',
                  data : {'mmciffile': dataStr},
                  dataType: 'jsonp',
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  beforeSend: function() {
                      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
                      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
                      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").hide();
                  },
                  complete: function() {
                      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
                      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
                      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").show();
                  },
                  success: function(data) {
                      me.init();
                      me.icn3d.init();

                      me.loadMmcifData(data);
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
             };

             reader.readAsText(file);
           }

        });
    },

    clickApplycustomcolor: function() { var me = this;
        $("#" + me.pre + "applycustomcolor").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           me.setOption("color", $("#" + me.pre + "colorcustom").val());
           me.setLogCmd("color " + $("#" + me.pre + "colorcustom").val(), true);
        });
    },

    clickApplypick_aroundsphere: function() { var me = this;
        $("#" + me.pre + "applypick_aroundsphere").click(function(e) {
            e.preventDefault();

            dialog.dialog( "close" );
            var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());

               var select = "select zone cutoff " + radius;
               //me.setLogCmd(select, true);

               me.pickCustomSphere(radius);

               me.updateHlAll();

               me.setLogCmd(select, true);
        });
    },

    clickApplyhbonds: function() { var me = this;
        $("#" + me.pre + "applyhbonds").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());

           var select = "hbonds " + threshold;
           //me.setLogCmd(select, true);

           me.showHbonds(threshold);
           me.setLogCmd(select, true);
        });
    },

    clickApplypick_labels: function() { var me = this;
        $("#" + me.pre + "applypick_labels").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           var text = $("#" + me.pre + "labeltext" ).val();
           var size = $("#" + me.pre + "labelsize" ).val();
           var color = $("#" + me.pre + "labelcolor" ).val();
           var background = $("#" + me.pre + "labelbkgd" ).val();
           if(size === '0' || size === '' || size === 'undefined') size = 0;
           if(color === '0' || color === '' || color === 'undefined') color = 0;
           if(background === '0' || background === '' || background === 'undefined') background = 0;

           if(me.icn3d.pAtom === undefined || me.icn3d.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             var x = (me.icn3d.pAtom.coord.x + me.icn3d.pAtom2.coord.x) / 2;
             var y = (me.icn3d.pAtom.coord.y + me.icn3d.pAtom2.coord.y) / 2;
             var z = (me.icn3d.pAtom.coord.z + me.icn3d.pAtom2.coord.z) / 2;

             //me.setLogCmd('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);

             me.addLabel(text, x, y, z, size, color, background, 'custom');

             me.icn3d.pickpair = false;

             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;

             me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);
             me.icn3d.draw();
           }
        });
    },

    clickApplyselection_labels: function() { var me = this;
        $("#" + me.pre + "applyselection_labels").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           var text = $("#" + me.pre + "labeltext2" ).val();
           var size = $("#" + me.pre + "labelsize2" ).val();
           var color = $("#" + me.pre + "labelcolor2" ).val();
           var background = $("#" + me.pre + "labelbkgd2" ).val();
           if(size === '0' || size === '' || size === 'undefined') size = 0;
           if(color === '0' || color === '' || color === 'undefined') color = 0;
           if(background === '0' || background === '' || background === 'undefined') background = 0;

             var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.hAtoms));
             var x = position.center.x;
             var y = position.center.y;
             var z = position.center.z;

             //me.setLogCmd('add label ' + text + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);

             me.addLabel(text, x, y, z, size, color, background, 'custom');

             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;

             me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type custom', true);

             me.icn3d.draw();
        });
    },

    clickApplypick_stabilizer: function() { var me = this;
        $("#" + me.pre + "applypick_stabilizer").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           if(me.icn3d.pAtom === undefined || me.icn3d.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             me.icn3d.pickpair = false;

             me.setLogCmd('add one stabilizer | ' + me.icn3d.pAtom.serial + ' ' + me.icn3d.pAtom2.serial, true);

             if(me.icn3d.pairArray === undefined) me.icn3d.pairArray = [];
             me.icn3d.pairArray.push(me.icn3d.pAtom.serial);
             me.icn3d.pairArray.push(me.icn3d.pAtom2.serial);

             //me.updateStabilizer();
             me.setThichknessFor3Dprint();

             me.icn3d.draw();
           }
        });
    },

    // https://github.com/tovic/color-picker
    // https://tovic.github.io/color-picker/color-picker.value-update.html
    pickColor: function() { var me = this;
        var picker = new CP(document.querySelector("#" + me.pre + "colorcustom"));

        picker.on("change", function(color) {
            this.target.value = color;
        });

        $("#" + me.pre + "colorcustom").on("input keyup paste cut", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
    },

    clickApplypick_stabilizer_rm: function() { var me = this;
        $("#" + me.pre + "applypick_stabilizer_rm").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           if(me.icn3d.pAtom === undefined || me.icn3d.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             me.icn3d.pickpair = false;

             me.setLogCmd('remove one stabilizer | ' + me.icn3d.pAtom.serial + ' ' + me.icn3d.pAtom2.serial, true);

             var rmLineArray = [];
             rmLineArray.push(me.icn3d.pAtom.serial);
             rmLineArray.push(me.icn3d.pAtom2.serial);

             me.removeOneStabilizer(rmLineArray);

             //me.updateStabilizer();

             me.icn3d.draw();
           }
        });
    },

    clickApplypick_measuredistance: function() { var me = this;
        $("#" + me.pre + "applypick_measuredistance").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );
           me.bMeasureDistance = false;

           if(me.icn3d.pAtom === undefined || me.icn3d.pAtom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             var size = 0, color, background = 0;
             var color = $("#" + me.pre + "linecolor" ).val();

             var x = (me.icn3d.pAtom.coord.x + me.icn3d.pAtom2.coord.x) / 2;
             var y = (me.icn3d.pAtom.coord.y + me.icn3d.pAtom2.coord.y) / 2;
             var z = (me.icn3d.pAtom.coord.z + me.icn3d.pAtom2.coord.z) / 2;

             me.addLineFromPicking('distance');

             var distance = parseInt(me.icn3d.pAtom.coord.distanceTo(me.icn3d.pAtom2.coord) * 10) / 10;

             var text = distance.toString() + " A";

             me.addLabel(text, x, y, z, size, color, background, 'distance');

             var sizeStr = '', colorStr = '', backgroundStr = '';
             if(size != 0) sizeStr = ' | size ' + size;
             if(color != 0) colorStr = ' | color ' + color;
             if(background != 0) backgroundStr = ' | background ' + background;

             me.setLogCmd('add label ' + text + ' | x ' + x.toPrecision(4)  + ' y ' + y.toPrecision(4) + ' z ' + z.toPrecision(4) + sizeStr + colorStr + backgroundStr + ' | type distance', true);

             me.icn3d.draw();

             me.icn3d.pk = 2;
           }
        });
    },

    clickApply_thickness: function() { var me = this;
        $("#" + me.pre + "apply_thickness").click(function(e) {
            e.preventDefault();
            //dialog.dialog( "close" );

            me.bSetThickness = true;

            me.icn3d.lineRadius = parseFloat($("#" + me.pre + "linerad" ).val()); //0.1; // hbonds, distance lines
            me.icn3d.coilWidth = parseFloat($("#" + me.pre + "coilrad" ).val()); //0.4; // style cartoon-coil
            me.icn3d.cylinderRadius = parseFloat($("#" + me.pre + "stickrad" ).val()); //0.4; // style stick
            me.icn3d.traceRadius = parseFloat($("#" + me.pre + "stickrad" ).val()); //0.2; // style c alpha trace, nucleotide stick
            me.icn3d.dotSphereScale = parseFloat($("#" + me.pre + "ballscale" ).val()); //0.3; // style ball and stick, dot

            me.icn3d.ribbonthickness = parseFloat($("#" + me.pre + "ribbonthick" ).val()); //0.4; // style ribbon, nucleotide cartoon, stand thickness
            me.icn3d.helixSheetWidth = parseFloat($("#" + me.pre + "prtribbonwidth" ).val()); //1.3; // style ribbon, stand thickness
            me.icn3d.nucleicAcidWidth = parseFloat($("#" + me.pre + "nucleotideribbonwidth" ).val()); //0.8; // nucleotide cartoon

            me.setLogCmd('set thickness | linerad ' + me.icn3d.lineRadius + ' | coilrad ' + me.icn3d.coilWidth + ' | stickrad ' + me.icn3d.cylinderRadius + ' | tracerad ' + me.icn3d.traceRadius + ' | ribbonthick ' + me.icn3d.ribbonthickness + ' | proteinwidth ' + me.icn3d.helixSheetWidth + ' | nucleotidewidth ' + me.icn3d.nucleicAcidWidth  + ' | ballscale ' + me.icn3d.dotSphereScale, true);

            me.icn3d.draw();
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            //me.setLogCmd("reset", true);

            //reset me.icn3d.maxD
            me.icn3d.maxD = me.icn3d.oriMaxD;
            me.icn3d.center = me.icn3d.oriCenter.clone();

            me.icn3d.reinitAfterLoad();

            me.renderFinalStep(1);
            me.setMode('all');

            me.setLogCmd("reset", true);

            me.removeSeqChainBkgd();
            me.removeSeqResidueBkgd();

            me.removeHl2D();
            me.removeHlMenus();
        });
    },

    clickToggleHighlight: function() { var me = this;
        $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function (e) {
            e.stopImmediatePropagation();
            me.toggleHighlight();
        });

        $(document).on("click", "#" + me.pre + "seq_clearselection", function(e) {
            e.stopImmediatePropagation();
            dialog.dialog( "close" );

            me.clearHighlight();
        });

        $(document).on("click", "#" + me.pre + "seq_clearselection2", function(e) {
            e.stopImmediatePropagation();

            e.preventDefault();

            me.clearHighlight();
            me.setLogCmd("clear selection", true);
        });

        $(document).on("click", "#" + me.pre + "alignseq_clearselection", function(e) {
            e.stopImmediatePropagation();
            me.clearHighlight();
            me.setLogCmd("clear selection", true);
        });
    },

    pressCommandtext: function() { var me = this;
        $("#" + me.pre + "logtext").keypress(function(e){
           me.bAddLogs = false; // turn off log

           var code = (e.keyCode ? e.keyCode : e.which);

           if(code == 13) { //Enter keycode
              e.preventDefault();

              var dataStr = $(this).val();

              me.icn3d.bRender = true;

              var commandArray = dataStr.split('\n');
              var lastCommand = commandArray[commandArray.length - 1].substr(2).trim(); // skip "> "
              me.icn3d.logs.push(lastCommand);
              $("#" + me.pre + "logtext").val("> " + me.icn3d.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);

              if(lastCommand !== '') {
                var transformation = {};
                transformation.factor = me.icn3d._zoomFactor;
                transformation.mouseChange = me.icn3d.mouseChange;
                transformation.quaternion = me.icn3d.quaternion;

                me.icn3d.commands.push(lastCommand + '|||' + me.getTransformationStr(transformation));
                me.icn3d.optsHistory.push(me.icn3d.cloneHash(me.icn3d.opts));
                me.icn3d.optsHistory[me.icn3d.optsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.hAtoms).length;

                if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                me.STATENUMBER = me.icn3d.commands.length;

                if(lastCommand.indexOf('load') !== -1) {
                    me.applyCommandLoad(lastCommand);
                }
                else if(lastCommand.indexOf('view annotations') == 0
                  //|| lastCommand.indexOf('set annotation cdd') == 0
                  //|| lastCommand.indexOf('set annotation site') == 0
                  ) {
                    me.applyCommandAnnotationsAndCddSite(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation clinvar') == 0
                  || lastCommand.indexOf('set annotation snp') == 0) {
                    me.applyCommandSnpClinvar(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                    me.applyCommand3ddomain(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation all') == 0) {
                    //$.when(me.applyCommandAnnotationsAndCddSite(lastCommand))
                    //    .then(me.applyCommandSnpClinvar(lastCommand))
                    $.when(me.applyCommandSnpClinvar(lastCommand))
                        .then(me.applyCommandSnpClinvar(lastCommand));

                    me.setAnnoTabAll();
                }
                else {
                    me.applyCommand(lastCommand + '|||' + me.getTransformationStr(transformation));
                }

                me.saveSelectionIfSelected();
                me.icn3d.draw();
              }
           }

           me.bAddLogs = true;
        });
    },

    clickSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "seq_saveselection", function(e) {
           e.stopImmediatePropagation();
           dialog.dialog( "close" );

           me.bSelectResidue = false;

           var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc").val();

           me.saveSelection(name, name);
        });

        $(document).on("click", "#" + me.pre + "seq_saveselection2", function(e) {
           e.stopImmediatePropagation();

           me.bSelectResidue = false;

           var name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc2").val();

           me.saveSelection(name, name);
        });
    },

    clickAlignSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "alignseq_saveselection", function(e) {
              e.stopImmediatePropagation();
            me.bSelectAlignResidue = false;

            var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
            //var description = $("#" + me.pre + "alignseq_command_desc").val();

            me.saveSelection(name, name);
        });
    },

    clickOutputSelection: function() { var me = this;
        $(document).on("click", "." + me.pre + "outputselection", function(e) {
              e.stopImmediatePropagation();
            me.bSelectResidue = false;
            me.bSelectAlignResidue = false;
            me.setLogCmd('output selection', true);
            me.outputSelection();
        });
    },

    bindMouseup: function() { var me = this;
        $("accordion").bind('mouseup touchend', function (e) {
          if(me.icn3d.controls) {
            me.icn3d.controls.noRotate = false;
            me.icn3d.controls.noZoom = false;
            me.icn3d.controls.noPan = false;
          }
        });
    },

    bindMousedown: function() { var me = this;
        $("accordion").bind('mousedown touchstart', function (e) {
          if(me.icn3d.controls) {
            me.icn3d.controls.noRotate = true;
            me.icn3d.controls.noZoom = true;
            me.icn3d.controls.noPan = true;
          }
        });
    },

    expandShrink: function() { var me = this;
        //$("[id$=_cddseq_expand]").on('click', '.ui-icon-plus', function(e) {
        $(document).on("click", ".icn3d-expand", function(e) {
            e.stopImmediatePropagation();

            var oriId = $(this).attr('id');
            var pos = oriId.lastIndexOf('_');
            var id = oriId.substr(0, pos);

            $("#" + id).show();
            $("#" + id + "_expand").hide();
            $("#" + id + "_shrink").show();
        });

        //$("[id$=_cddseq_shrink]").on('click', '.ui-icon-minus', function(e) {
        $(document).on("click", ".icn3d-shrink", function(e) {
            e.stopImmediatePropagation();

            var oriId = $(this).attr('id');
            var pos = oriId.lastIndexOf('_');
            var id = oriId.substr(0, pos);

            $("#" + id).hide();
            $("#" + id + "_expand").show();
            $("#" + id + "_shrink").hide();
        });
    },

    scrollAnno: function() { var me = this;
        window.onscroll = function (e) {
            if(me.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
                // show fixed titles
                me.showFixedTitle();
            }
            else {
                // remove fixed titles
                me.hideFixedTitle();
            }
        } ;

        $( "#" + me.pre + "dl_selectannotations" ).scroll(function() {
            if(me.view == 'detailed view' && $(window).scrollTop() == 0 && $(window).scrollTop() == 0 && $("#" + me.pre + "dl_selectannotations").scrollTop() == 0) {
                // show fixed titles
                me.showFixedTitle();
            }
            else {
                // remove fixed titles
                me.hideFixedTitle();
            }
        });
    },

    // ===== events end
    allEventFunctions: function() { var me = this;
        me.clickModeswitch();
        me.clickViewswitch();

        if(! me.isMobile()) {
            me.selectSequenceNonMobile();
        }
        else {
            me.selectSequenceMobile();
            me.selectChainMobile();
        }

        me.clickBack();
        me.clickForward();
        me.clickToggle();

        me.clickHlColorYellow();
        me.clickHlColorGreen();
        me.clickHlColorRed();
        me.clickHlStyleOutline();
        me.clickHlStyleObject();
        me.clickHlStyleNone();

        me.clickAlternate();
        me.clkMn1_mmtfid();
        me.clkMn1_pdbid();
        me.clkMn1_align();
        me.clkMn1_pdbfile();
        me.clkMn1_mol2file();
        me.clkMn1_sdffile();
        me.clkMn1_xyzfile();
        me.clkMn1_urlfile();
        me.clkMn1_mmciffile();
        me.clkMn1_mmcifid();
        me.clkMn1_mmdbid();
        me.clkMn1_gi();
        me.clkMn1_cid();
        me.clkMn1_pngimage();
        me.clkMn1_state();
        me.clkMn1_selection();
        me.clkMn1_exportState();
        me.clkMn1_exportStl();
        me.clkMn1_exportVrml();
        me.clkMn1_exportStlStab();
        me.clkMn1_exportVrmlStab();
        me.clkMn6_exportInteraction();
        me.clkMn1_exportCanvas();
        me.clkMn1_exportCounts();
        me.clkMn1_exportSelections();
        me.clkMn1_sharelink();
        me.clkMn1_link_structure();
        me.clkMn1_link_bind();
        me.clkMn1_link_vast();
        me.clkMn1_link_pubmed();
        me.clkMn1_link_protein();
//        me.clkMn1_link_gene();
//        me.clkMn1_link_chemicals();
        me.clkMn2_selectannotations();
//        me.clkMn2_selectresidues();
        me.clkMn2_selectcomplement();
        me.clkMn2_selectsidechains();
        me.clkMn2_selectall();
        me.clkMn2_alignment();
        me.clkMn2_command();
        me.clkMn2_definedsets();
        me.clkMn2_pkYes();
        me.clkMn2_pkNo();
        me.clkMn2_pkResidue();
        me.clkMn2_pkStrand();
        me.clkMn2_pkChain();
        me.clkMn2_aroundsphere();
        me.clkMn2_select_chain();
        me.clkMn3_proteinsRibbon();
        me.clkMn3_proteinsStrand();
        me.clkMn3_proteinsCylinder();
        me.clkMn3_proteinsSchematic();
        me.clkMn3_proteinsCalpha();
        me.clkMn3_proteinsBfactor();
        me.clkMn3_proteinsLines();
        me.clkMn3_proteinsStick();
        me.clkMn3_proteinsBallstick();
        me.clkMn3_proteinsSphere();
        me.clkMn3_proteinsNo();
        me.clkMn3_sidecLines();
        me.clkMn3_sidecStick();
        me.clkMn3_sidecBallstick();
        me.clkMn3_sidecSphere();
        me.clkMn3_sidecNo();
        me.clkMn3_nuclCartoon();
        me.clkMn3_nuclSchematic();
        me.clkMn3_nuclPhos();
        me.clkMn3_nuclLines();
        me.clkMn3_nuclStick();
        me.clkMn3_nuclBallstick();
        me.clkMn3_nuclSphere();
        me.clkMn3_nuclNo();
        me.clkMn3_ligLines();
        me.clkMn3_ligStick();
        me.clkMn3_ligBallstick();
        me.clkMn3_ligSchematic();
        me.clkMn3_ligSphere();
        me.clkMn3_ligNo();
        me.clkMn3_ionsSphere();
        me.clkMn3_ionsDot();
        me.clkMn3_ionsNo();
        me.clkMn3_waterSphere();
        me.clkMn3_waterDot();
        me.clkMn3_waterNo();
        me.clkMn4_clrSpectrum();
        me.clkMn4_clrChain();
        me.clkMn4_clrSSGreen();
        me.clkMn4_clrSSYellow();
        me.clkMn4_clrResidue();
        me.clkMn4_clrCharge();
        me.clkMn4_clrHydrophobic();
        me.clkMn4_clrAtom();
        me.clkMn4_clrBfactor();
        me.clkMn4_clrBfactorNorm();
        me.clkMn4_clrConserved();
        me.clkMn4_clrRed();
        me.clkMn4_clrGreen();
        me.clkMn4_clrBlue();
        me.clkMn4_clrMagenta();
        me.clkMn4_clrYellow();
        me.clkMn4_clrCyan();
        me.clkMn4_clrWhite();
        me.clkMn4_clrGrey();
        me.clkMn4_clrCustom();
        me.clkMn4_clrSave();
        me.clkMn4_clrApplySave();
        me.clkMn3_styleSave();
        me.clkMn3_styleApplySave();
        me.clkMn5_neighborsYes();
        me.clkMn5_neighborsNo();
        me.clkMn5_surfaceVDW();
        //me.clkMn5_surfaceSES();
        me.clkMn5_surfaceSAS();
        me.clkMn5_surfaceMolecular();
        me.clkMn5_surfaceVDWContext();
        me.clkMn5_surfaceSASContext();
        me.clkMn5_surfaceMolecularContext();
        me.clkMn5_surfaceNo();
        me.clkMn5_opacity10();
        me.clkMn5_opacity09();
        me.clkMn5_opacity08();
        me.clkMn5_opacity07();
        me.clkMn5_opacity06();
        me.clkMn5_opacity05();
        me.clkMn5_wireframeYes();
        me.clkMn5_wireframeNo();
        me.clkMn5_elecmap2fofc();
        me.clkMn5_elecmapfofc();
        me.clkMn5_elecmapNo();
        me.clkMn5_mapwireframeYes();
        me.clkMn5_mapwireframeNo();
        me.clkMn6_assemblyYes();
        me.clkMn6_assemblyNo();
        me.clkMn6_addlabelResidues();
        me.clkMn6_addlabelChains();
        me.clkMn6_addlabelTermini();
        me.clkMn6_addlabelYes();
        me.clkMn6_addlabelSelection();
        me.clkMn2_saveselection();
        me.clkMn6_addlabelNo();
        me.clkMn6_distanceYes();
        me.clkmn1_stabilizerOne();
        me.clkmn1_stabilizerRmOne();
        me.clkmn1_thicknessSet();
        me.clkmn1_thicknessReset();
        me.clkMn6_distanceNo();
        me.clkMn2_selectedcenter();
        me.clkMn6_center();
        me.clkMn6_resetOrientation();
        me.clkMn6_chemicalbindingshow();
        me.clkMn6_chemicalbindinghide();
        me.clkMn6_rotateleft();
        me.clkMn6_rotateright();
        me.clkMn6_rotateup();
        me.clkMn6_rotatedown();
        me.clkMn6_cameraPers();
        me.clkMn6_cameraOrth();
        me.clkMn6_bkgdBlack();
        me.clkMn6_bkgdGrey();
        me.clkMn6_bkgdWhite();
        me.clkMn6_bkgdTransparent();
        me.clkMn6_showfogYes();
        me.clkMn6_showfogNo();
        me.clkMn6_showslabYes();
        me.clkMn6_showslabNo();
        me.clkMn6_showaxisYes();
        me.clkMn6_showaxisNo();
        me.clkMn6_hbondsYes();
        me.clkMn6_hbondsNo();
        me.clkmn1_stabilizerYes();
        me.clkmn1_stabilizerNo();
        me.clkMn6_ssbondsYes();
        me.clkMn6_ssbondsNo();
        me.clkMn6_clbondsYes();
        me.clkMn6_clbondsNo();
        me.clickCustomAtoms();
        me.clickShow_selected();
        me.clickShow_annotations();
        me.clickShowallchains();
//        me.clickShow_sequences();
        me.clickShow_alignsequences();
        me.clickShow_2ddgm();
//        me.clickShow_selected_atom();
        me.clickCommand_apply();
        me.clickSearchSeq();
        me.clickReload_pdb();
        me.clickReload_align_refined();
        me.clickReload_align_ori();
        me.clickReload_mmtf();
        me.clickReload_pdbfile();
        me.clickReload_mol2file();
        me.clickReload_sdffile();
        me.clickReload_xyzfile();
        me.clickReload_urlfile();
        me.clickReload_mmciffile();
        me.clickReload_mmcif();
        me.clickReload_mmdb();
        me.clickReload_gi();
        me.clickReload_cid();
        me.clickReload_pngimage();
        me.clickReload_state();
        me.clickReload_selectionfile();
        me.clickApplycustomcolor();
        me.clickApplypick_aroundsphere();
        me.clickApplyhbonds();
//        me.clickApplystabilizer();
        me.clickApplypick_labels();
        me.clickApplyselection_labels();
        me.clickApplypick_measuredistance();
        me.clickApplypick_stabilizer();
        me.clickApplypick_stabilizer_rm();
        me.pickColor();
        me.clickApply_thickness();
        me.clickReset();
        me.clickToggleHighlight();
        me.pressCommandtext();
//        me.clickFilter_ckbx_all();
//        me.clickFilter();
//        me.clickHighlight_3d_dgm();
        me.clickSeqSaveSelection();
        me.clickAlignSeqSaveSelection();
        me.clickOutputSelection();
        me.click2Ddgm();
        me.bindMouseup();
        me.bindMousedown();
        me.windowResize();
        me.setTabs();
        me.clickAddTrack();
        me.clickDefineHelix();
        me.clickDefineSheet();
        me.clickDefineCoil();
        me.clickDeleteSets();
        me.clickAddTrackButton();

        me.expandShrink();
        me.scrollAnno();
    }
};
