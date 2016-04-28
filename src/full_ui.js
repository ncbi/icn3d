/*! full_ui.js
 * @author Jiyao Wang / https://github.com/ncbi/icn3d
 * UI with full features of iCn3D
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

    me.bFullUi = true;

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    me.inputid = '';

    me.WIDTH = 400; // total width of view area
    me.HEIGHT = 400; // total height of view area

    me.RESIDUE_WIDTH = 10;  // sequences
    me.MENU_HEIGHT = 40;

    // used to set the position for the log/command textarea
    //me.MENU_WIDTH = 690;
    me.MENU_WIDTH = 750;

    me.LESSWIDTH = 0; //20;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROTATION_DIRECTION = 'right';
    me.bHideSelection = true;
    me.ALTERNATE_STRUCTURE = -1;

    me.EXTRAHEIGHT = 2.8*me.MENU_HEIGHT;
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
        me.EXTRAHEIGHT = 0.8*me.MENU_HEIGHT;
    }

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
    me.options['color']              = 'spectrum';           //spectrum, secondary structure, charge, hydrophobic, chain, residue, atom, red, green, blue, magenta, yellow, cyan, white, grey, custom
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
    me.options['fog']                = 'no';                 //yes, no
    me.options['slab']               = 'no';                 //yes, no
    me.options['picking']            = 'residue';                 //no, atom, residue, strand
    me.options['nucleotides']        = 'nucleotide cartoon';   //nucleotide cartoon, schematic, phosphorus trace, lines, stick, ball and stick, sphere, nothing

    me.modifyIcn3d();

    me.bAddCommands = true;
    me.bAddLogs = true;

    me.bNotLoadStructure = false;

    me.bInitial = true;

};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    // modify iCn3D function
    modifyIcn3d: function() {var me = this;
        me.modifyIcn3dShowPicking();
        me.modifySwitchHighlightLevel();
    },

    modifyIcn3dShowPicking: function() {var me = this;
        iCn3D.prototype.showPicking = function(atom) {
          this.showPickingBase(atom);

          //if(this.picking === 1) {
          //    if(!me.icn3d.bShiftKey) {
        //          me.removeSeqChainBkgd();
        //          me.removeSeqResidueBkgd();
        //      }
        //  }
        //  else
          if(this.picking === 1 || this.picking === 2) {
              // highlight the sequence background
              var idArray = this.id.split('_'); // id: div0_canvas
              me.pre = idArray[0] + "_";

              var pickedResidue = atom.structure + '_' + atom.chain + '_' + atom.resi;

              me.clearSelection();

              if(!me.icn3d.bShiftKey) {
                  me.removeSeqChainBkgd();
                  me.removeSeqResidueBkgd();
              }

              if($("#" + me.pre + pickedResidue).length !== 0) {
                $("#" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
              }

              // add "align" in front of id so that full sequence and aligned sequence will not conflict
              if($("#align" + me.pre + pickedResidue).length !== 0) {
                $("#align" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
              }
          }
          else if(this.picking === 3) {
              // highlight the sequence background
              var idArray = this.id.split('_'); // id: div0_canvas
              me.pre = idArray[0] + "_";

              var firstAtom = this.getFirstAtomObj(this.highlightAtoms);
              var lastAtom = this.getLastAtomObj(this.highlightAtoms);

              me.clearSelection();

              if(!me.icn3d.bShiftKey) {
                  me.removeSeqChainBkgd();
                  me.removeSeqResidueBkgd();
              }

              for(var i = firstAtom.resi; i <= lastAtom.resi; ++i) {
                  var pickedResidue = atom.structure + '_' + atom.chain + '_' + i;

                  if($("#" + me.pre + pickedResidue).length !== 0) {
                    $("#" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
                  }

                  // add "align" in front of id so that full sequence and aligned sequence will not conflict
                  if($("#align" + me.pre + pickedResidue).length !== 0) {
                    $("#align" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
                  }
              }
          }

          var transformation = {};
          transformation.factor = this._zoomFactor;
          transformation.mouseChange = this.mouseChange;
          //transformation.quaternion = this.quaternion;
          transformation.quaternion = {};
          transformation.quaternion._x = parseInt(this.quaternion._x * 1000) / 1000;
          transformation.quaternion._y = parseInt(this.quaternion._y * 1000) / 1000;
          transformation.quaternion._z = parseInt(this.quaternion._z * 1000) / 1000;
          transformation.quaternion._w = parseInt(this.quaternion._w * 1000) / 1000;

          if(me.bAddCommands) {
              this.commands.push('pickatom ' + atom.serial + '|||' + JSON.stringify(transformation));
              this.optionsHistory.push(this.cloneHash(this.options));
              this.optionsHistory[this.optionsHistory.length - 1].hlatomcount = Object.keys(this.highlightAtoms).length;

              if(me.isSessionStorageSupported()) me.saveCommandsToSession();

              me.STATENUMBER = this.commands.length;
          }

          this.logs.push('pickatom ' + atom.serial + ' (chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
          if ( $( "#" + me.pre + "logtext" ).length )  {
            $("#" + me.pre + "logtext").val("> " + this.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
          }
        };
    },

    modifySwitchHighlightLevel: function() {var me = this;
        iCn3D.prototype.switchHighlightLevel = function() {
          this.switchHighlightLevelBase();

          $(document).bind('keydown', function (e) {
            if(e.keyCode === 38) { // arrow up, select upper level of atoms
                me.updateSeqWinForCurrentAtoms();
            }
            else if(e.keyCode === 40) { // arrow down, select down level of atoms
                me.updateSeqWinForCurrentAtoms();
            }
          });
        };
    },

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this;
      me.deferred = $.Deferred(function() {
        if(me.isSessionStorageSupported()) me.getCommandsBeforeCrash();

        me.setTopMenusHtml(me.divid);

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

        me.allEventFunctions();

        me.allCustomEvents();

        if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
          me.EXTRAHEIGHT = 0;
          me.hideMenu(width, height);
        }
        else {
          me.EXTRAHEIGHT = 2.8*me.MENU_HEIGHT;
          me.showMenu(width, height);
        }

        me.icn3d = new iCn3D(me.pre + 'canvas');

        //resizeCanvas
        $("#" + me.pre + "canvas").width(width).height(height);
        var heightTmp = parseInt(height) + me.EXTRAHEIGHT;
        $("#" + me.pre + "viewer").width(width).height(heightTmp);
        me.icn3d.setWidthHeight(width, height);

        if(me.cfg.bCalphaOnly !== undefined) me.icn3d.bCalphaOnly = me.cfg.bCalphaOnly;

        //me.deferred = undefined; // sequential calls

        me.icn3d.options = me.icn3d.cloneHash(me.options);

        me.STATENUMBER = me.icn3d.commands.length;

        // If previously crashed, recover it
        if(me.isSessionStorageSupported() && me.bCrashed) {
            me.bCrashed = false;

            var loadCommand = me.commandsBeforeCrash.split('|||')[0];
            var id = loadCommand.substr(loadCommand.lastIndexOf(' ') + 1);

            // reload only if viewing the same structure
            if(id === me.cfg.pdbid || id === me.cfg.mmdbid || id === me.cfg.gi || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align) {
                me.loadScript(me.commandsBeforeCrash, true);

                return;
            }
        }

        me.icn3d.moleculeTitle = '';

        if(me.cfg.pdbid !== undefined) {
           me.inputid = me.cfg.pdbid;

           me.setLogCommand('load pdb ' + me.cfg.pdbid, true);

           me.downloadPdb(me.cfg.pdbid);
        }
        else if(me.cfg.mmdbid !== undefined) {
           me.inputid = me.cfg.mmdbid;

            //if(!isNaN(me.cfg.mmdbid)) {
            //    me.icn3d.moleculeTitle = 'MMDB ' + me.cfg.mmdbid.toUpperCase() + '; ';
            //}

            me.setLogCommand('load mmdb ' + me.cfg.mmdbid + ' | parameters ' + me.cfg.inpara, true);

            me.downloadMmdb(me.cfg.mmdbid);
        }
        else if(me.cfg.gi !== undefined) {
           // use the mmdb ID as inputid
           //me.inputid = me.cfg.gi;

            //me.icn3d.moleculeTitle = 'Protein gi ' + me.cfg.gi + '; ';

            me.setLogCommand('load gi ' + me.cfg.gi, true);

            me.downloadGi(me.cfg.gi);
        }
        else if(me.cfg.cid !== undefined) {
           me.inputid = me.cfg.cid;

           var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + me.inputid + "/description/jsonp";
           $.ajax({
              url: url,
              dataType: 'jsonp',
              success: function(data) {
                  if(data.InformationList !== undefined && data.InformationList.Information !== undefined) me.icn3d.moleculeTitle = data.InformationList.Information[0].Title;
              }
           });

            me.setLogCommand('load cid ' + me.cfg.cid, true);

            me.downloadCid(me.cfg.cid);
        }
        else if(me.cfg.mmcifid !== undefined) {
           me.inputid = me.cfg.mmcifid;

            me.setLogCommand('load mmcif ' + me.cfg.mmcifid, true);

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

            me.setLogCommand('load alignment ' + me.cfg.align + ' | parameters ' + me.cfg.inpara, true);

            me.downloadAlignment(me.cfg.align);
        }
        else {
            alert("Please input a gi, MMDB ID, PDB ID, CID, or mmCIF ID...");
        }
      });

      return me.deferred;
    },

    clearSelection: function() { var me = this;
        $("#" + me.pre + "chainid").val("");
        $("#" + me.pre + "structureid").val("");
        $("#" + me.pre + "alignChainid").val("");
        $("#" + me.pre + "customResidues").val("");

        $("#" + me.pre + "chainid2").val("");
        $("#" + me.pre + "structureid2").val("");
        $("#" + me.pre + "alignChainid2").val("");
        $("#" + me.pre + "customResidues2").val("");

        $("#" + me.pre + "customAtoms").val("");
    },

    // remove highlight of chains
    removeSeqChainBkgd: function(currChain) {
        $( ".icn3d-seqTitle" ).each(function( index ) {
          if(currChain === undefined) {
              $( this ).removeClass('icn3d-highlightSeq');
          }
          else {
              if($(this).attr('chain') !== currChain) $( this ).removeClass('icn3d-highlightSeq');
          }
        });
    },

    // remove all highlighted residue color
    removeSeqResidueBkgd: function() {
        $( ".icn3d-residue" ).each(function( index ) {
          $( this ).removeClass('icn3d-highlightSeq');
        });
    },

    hideMenu: function(width, height) { var me = this;
      if($("#" + me.pre + "menulist")[0] !== undefined) $("#" + me.pre + "menulist")[0].style.display = "none";
      if($("#" + me.pre + "menuLogSection")[0] !== undefined) $("#" + me.pre + "menuLogSection")[0].style.display = "none";
      if($("#" + me.pre + "commandlog")[0] !== undefined) $("#" + me.pre + "commandlog")[0].style.display = "none";
      if($("#" + me.pre + "selection")[0] !== undefined) $("#" + me.pre + "selection")[0].style.display = "none";

      if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "none";

      $("#" + me.pre + "viewer").width(width).height(height);
      $("#" + me.pre + "canvas").width(width).height(height);
    },

    showMenu: function(width, height) { var me = this;
      if($("#" + me.pre + "menulist")[0] !== undefined) $("#" + me.pre + "menulist")[0].style.display = "block";
      if($("#" + me.pre + "menuLogSection")[0] !== undefined) $("#" + me.pre + "menuLogSection")[0].style.display = "block";
      if($("#" + me.pre + "commandlog")[0] !== undefined) $("#" + me.pre + "commandlog")[0].style.display = "block";
      if($("#" + me.pre + "selection")[0] !== undefined) $("#" + me.pre + "selection")[0].style.display = "block";

      if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";

      var heightTmp = parseInt(height) + me.EXTRAHEIGHT;
      $("#" + me.pre + "viewer").width(width).height(heightTmp);
      $("#" + me.pre + "canvas").width(width).height(height);
    },

    saveSelectionIfSelected: function (id, value) { var me = this;
          if(me.bSelectResidue || me.bSelectAlignResidue) {
              me.saveSelection();

              me.bSelectResidue = false;
              me.bSelectAlignResidue = false;
          }
    },

    setOption: function (id, value) { var me = this;
      //var options2 = {};
      //options2[id] = value;

      // remember the options
      me.icn3d.options[id] = value;

      me.saveSelectionIfSelected();

      if(id === 'color') {
          me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.highlightAtoms);

          //me.icn3d.draw(options2);
          me.icn3d.draw();

            setTimeout(function(){
              me.updateSeqWinForCurrentAtoms(false);
            }, 0);
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          if(id === 'opacity' || id === 'wireframe') {
              me.icn3d.removeLastSurface();
          }
          me.icn3d.applySurfaceOptions();
          me.icn3d.render();
      }
      else {
          //me.icn3d.draw(options2);
          me.icn3d.draw();
      }
    },

    setStyle: function (selectionType, style) { var me = this;
      var atoms = {};
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

      me.saveSelectionIfSelected();

      me.icn3d.draw();
    },

    setLogCommand: function (str, bSetCommand, bAddLogs) { var me = this;
      if(str.trim() === '') return false;

      var pos = str.indexOf('|||');
      if(pos !== -1) str = str.substr(0, pos);

      var transformation = {};
      transformation.factor = me.icn3d._zoomFactor;
      transformation.mouseChange = me.icn3d.mouseChange;

      //transformation.quaternion = me.icn3d.quaternion;
      transformation.quaternion = {};
      transformation.quaternion._x = parseInt(me.icn3d.quaternion._x * 1000) / 1000;
      transformation.quaternion._y = parseInt(me.icn3d.quaternion._y * 1000) / 1000;
      transformation.quaternion._z = parseInt(me.icn3d.quaternion._z * 1000) / 1000;
      transformation.quaternion._w = parseInt(me.icn3d.quaternion._w * 1000) / 1000;

      if(bSetCommand) {
          // save the command only when it's not a history command, i.e., not in the process of going back and forth
          if(me.bAddCommands) {
              // If a new command was called, remove the forward commands and push to the command array
              if(me.STATENUMBER < me.icn3d.commands.length) {
                  var oldCommand = me.icn3d.commands[me.STATENUMBER - 1];
                  var pos = oldCommand.indexOf('|||');
                  if(str !== oldCommand.substr(0, pos)) {
                    me.icn3d.commands = me.icn3d.commands.slice(0, me.STATENUMBER);

                    me.icn3d.commands.push(str + '|||' + JSON.stringify(transformation));
                    me.icn3d.optionsHistory.push(me.icn3d.cloneHash(me.icn3d.options));
                    me.icn3d.optionsHistory[me.icn3d.optionsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.highlightAtoms).length;

                    if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                    me.STATENUMBER = me.icn3d.commands.length;
                  }
              }
              else {
                me.icn3d.commands.push(str + '|||' + JSON.stringify(transformation));

                me.icn3d.optionsHistory.push(me.icn3d.cloneHash(me.icn3d.options));
                if(me.icn3d.highlightAtoms !== undefined) me.icn3d.optionsHistory[me.icn3d.optionsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.highlightAtoms).length;

                if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                me.STATENUMBER = me.icn3d.commands.length;
              }
          }
      }

      if(me.bAddLogs) {
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
              me.icn3d.draw(me.options);
              me.icn3d.bRender = true;

              //var bAddPrevCommand = false;
              //me.loadScript(me.cfg.command, bAddPrevCommand);
              me.loadScript(me.cfg.command);
          }
          else {
              me.icn3d.draw(me.options);
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

      if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

      // display the structure right away. load the menus and sequences later
//      setTimeout(function(){
          //if(me.cfg.command === undefined && (me.cfg.showmenu === undefined || me.cfg.showmenu || me.cfg.showseq || me.cfg.showalignseq) ) {
          if(Object.keys(me.icn3d.highlightAtoms).length === Object.keys(me.icn3d.atoms).length && (me.cfg.showmenu === undefined || me.cfg.showmenu || me.cfg.showseq || me.cfg.showalignseq) ) {
              me.selectAllUpdateMenuSeq(me.bInitial, false);
              me.bInitial = false;
          }
          else {
              me.updateMenus(me.bInitial);
              me.updateSeqWinForCurrentAtoms();

              me.bInitial = false;
          }
//      }, 0);
    },

    setStructureMenu: function (bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      var keys = Object.keys(me.icn3d.structures);
/*
      var keys = Object.keys(me.icn3d.structures).sort(function(a, b) {
                        if(a !== '' && !isNaN(a)) {
                            return parseInt(a) - parseInt(b);
                        }
                        else {
                            if(a < b) return -1;
                            else if(a > b) return 1;
                            else if(a == b) return 0;
                        }
                    });
*/

      for(var i = 0, il = keys.length; i < il; ++i) {
          var molecule = keys[i];

          if(moleculeArray !== undefined) {
              selected = (moleculeArray.indexOf(molecule) !== -1) ? " selected" : "";
          }

          var indent = (me.icn3d.secondId !== undefined && molecule.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';
          html += "<option value='" + molecule + "'" + selected + ">" + indent + keys[i] + "</option>";

          if(selected === " selected") {
              for(var j in me.icn3d.structures[molecule]) {
                  var chain = me.icn3d.structures[molecule][j];

                  me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);
              }
          }

          if(bInitial) {
              var atomsHash = {};
              for(var j in me.icn3d.structures[molecule]) {
                  var chain = me.icn3d.structures[molecule][j];

                  atomsHash = me.icn3d.unionHash(atomsHash, me.icn3d.chains[chain]);
              }

              // Initially, add structures into the menu "atom selections"
              me.icn3d.definedNames2Atoms[molecule] = Object.keys(atomsHash);

              me.icn3d.definedNames2Descr[molecule] = molecule;
              me.icn3d.definedNames2Command[molecule] = 'select structure ' + molecule;

              atomsHash = {};
          }
      }

      return html;
    },

    setProteinsNucleotidesLigands: function () { var me = this;
        for(var chain in me.icn3d.chains) {
              // Initially, add proteins, nucleotides, ligands, ions, water into the menu "custom selections"
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  me.icn3d.definedNames2Atoms['proteins'] = Object.keys(me.icn3d.proteins);
                  me.icn3d.definedNames2Residues['proteins'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.proteins));
                  me.icn3d.definedNames2Descr['proteins'] = 'proteins';
                  me.icn3d.definedNames2Command['proteins'] = 'select :proteins';
              }

              if(Object.keys(me.icn3d.nucleotides).length > 0) {
                  me.icn3d.definedNames2Atoms['nucleotides'] = Object.keys(me.icn3d.nucleotides);
                  me.icn3d.definedNames2Residues['nucleotides'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.nucleotides));
                  me.icn3d.definedNames2Descr['nucleotides'] = 'nucleotides';
                  me.icn3d.definedNames2Command['nucleotides'] = 'select :nucleotides';
              }

              if(Object.keys(me.icn3d.ligands).length > 0) {
                  me.icn3d.definedNames2Atoms['ligands'] = Object.keys(me.icn3d.ligands);
                  me.icn3d.definedNames2Residues['ligands'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.ligands));
                  me.icn3d.definedNames2Descr['ligands'] = 'ligands';
                  me.icn3d.definedNames2Command['ligands'] = 'select :ligands';
              }

              if(Object.keys(me.icn3d.ions).length > 0) {
                  me.icn3d.definedNames2Atoms['ions'] = Object.keys(me.icn3d.ions);
                  me.icn3d.definedNames2Residues['ions'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.ions));
                  me.icn3d.definedNames2Descr['ions'] = 'ions';
                  me.icn3d.definedNames2Command['ions'] = 'select :ions';
              }

              if(Object.keys(me.icn3d.water).length > 0) {
                  me.icn3d.definedNames2Atoms['water'] = Object.keys(me.icn3d.water);
                  me.icn3d.definedNames2Residues['water'] = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.water));
                  me.icn3d.definedNames2Descr['water'] = 'water';
                  me.icn3d.definedNames2Command['water'] = 'select :water';
              }
        }
    },

    setChainMenu: function (bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      if(moleculeArray === undefined) {
        for(var chain in me.icn3d.chains) {
          var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';
          html += "<option value='" + chain + "' " + selected + ">" + indent + chain + "</option>";

          if(selected === " selected") me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);

            if(bInitial) {
                  // Initially, add chains into the menu "atom selections"
                  me.icn3d.definedNames2Atoms[chain] = Object.keys(me.icn3d.chains[chain]);
                  me.icn3d.definedNames2Descr[chain] = chain;
                  me.icn3d.definedNames2Command[chain] = 'select chain ' + chain;
            }

        }
      }
      else {
        for(var chain in me.icn3d.chains) {
          var dashPos = chain.indexOf('_');
          var molecule = chain.substr(0, dashPos);

          var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';

          if(moleculeArray !== null && moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
            html += "<option value='" + chain + "' selected>" + indent + chain + "</option>";

            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);
          }
          else {
            html += "<option value='" + chain + "'>" + indent + chain + "</option>";
          }
        }
      }

      return html;
    },

    setAlignChainMenu: function(bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      if(moleculeArray === undefined) {
        for(var chain in me.icn3d.alignChains) {
          var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';
          html += "<option value='" + chain + "' " + selected + ">" + indent + chain + "</option>";

          if(selected === " selected") me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.alignChains[chain]);

          if(bInitial) {
              // Initially, add chains into the menu "atom selections"
              me.icn3d.definedNames2Atoms[chain] = Object.keys(me.icn3d.alignChains[chain]);
              me.icn3d.definedNames2Descr[chain] = chain;
              me.icn3d.definedNames2Command[chain] = 'select alignChain ' + chain;
          }
        }
      }
      else {
        for(var chain in me.icn3d.alignChains) {
          var dashPos = chain.indexOf('_');
          var molecule = chain.substr(0, dashPos);

          var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';

          if(moleculeArray !== null && moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
            html += "<option value='" + chain + "' selected>" + indent + chain + "</option>";

            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.alignChains[chain]);
          }
          else {
            html += "<option value='" + chain + "'>" + indent + chain + "</option>";
          }
        }
      }

      return html;
    },

    setResidueMenu: function (commandname) { var me = this;
      var html = "";

      var bSelected = false;
      for(var i in me.icn3d.definedNames2Residues) {
          if(i === commandname) {
            html += "<option value='" + i + "' selected='selected'>" + i + "</option>";
            bSelected = true;
          }
          else {
            html += "<option value='" + i + "'>" + i + "</option>";
          }
      }

      if(bSelected) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");
      }

      return html;
    },

    setAtomMenu: function (commandname) { var me = this;
      var html = "";

      var bSelected = false;
      var nameArray = Object.keys(me.icn3d.definedNames2Atoms).sort();

      //for(var i in me.icn3d.definedNames2Atoms) {
      for(var i = 0, il = nameArray.length; i < il; ++i) {
          var name = nameArray[i];

          if(name === commandname) {
            html += "<option value='" + name + "' selected='selected'>" + name + "</option>";
            bSelected = true;
          }
          else {
            html += "<option value='" + name + "'>" + name + "</option>";
          }
      }

      if(bSelected) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");
      }

      return html;
    },

    getSequencesAnnotations: function (chainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight) { var me = this;
      var resCategories = "<b>Residue labeling:</b> standard residue with coordinates: UPPER case letter; nonstandard residue with coordinates: the first UPPER case letter plus a period except that water residue uses the letter 'O'; residue missing coordinates: lower case letter.";
      var scroll = (me.isMac() && !me.isMobile()) ? "<br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

      var sequencesHtml;

      if(!me.isMobile()) {
            sequencesHtml = "<b>Select on 1D Sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection<br/>";

          sequencesHtml += "<b>Select on 3D structures:</b> hold \"Alt\" and use mouse to pick, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection<br/>";
      }
      else {
            sequencesHtml = "<b>Select Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection<br/>";
      }

      sequencesHtml += "<div style='min-width:200px;'><Selection:</b> Name: <input type='text' id='" + me.pre + "seq_command_name' value='seq_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='10'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "seq_command_desc' value='seq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='20'> <button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection'>Save Selection</button><br/><button style='white-space:nowrap;' id='" + me.pre + "seq_clearselection'>Toggle Highlight</button></div><br/>";

      sequencesHtml += resCategories + scroll + "<br/>";

      if(me.icn3d.moleculeTitle !== "") sequencesHtml += "<br/><b>Title:</b> " + me.icn3d.moleculeTitle + "<br/><br/>";

      var maxSeqCnt = 0;

      var chainHash = {};
      if(chainArray !== undefined) {
          for(var i = 0, il = chainArray.length; i < il; ++i) {
              chainHash[chainArray[i]] = 1;
          }
      }

      for(var i in me.icn3d.chains) {
          var bHighlightChain = (chainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

          if( bHighlightChain && (bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms) ) {
              me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[i]);
          }

          var resiHtmlArray = [], seqHtml = "";
          var seqLength = (me.icn3d.chainsSeq[i] !== undefined) ? me.icn3d.chainsSeq[i].length : 0;

          if(seqLength > maxSeqCnt) maxSeqCnt = seqLength;

          var dashPos = i.indexOf('_');
          var structure = i.substr(0, dashPos);
          var chain = i.substr(dashPos + 1);

//          if(me.icn3d.chainsSeq[i] !== undefined) {
          seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + me.icn3d.chainsSeq[i][0].resi + "</span>";

          var maxResi = parseInt(me.icn3d.chainsSeq[i][0].resi);

          for(var k=0, kl=seqLength; k < kl; ++k) {
            var resiId = structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi;
            var bWithCoord = (me.icn3d.chainsSeq[i][k].name === me.icn3d.chainsSeq[i][k].name.toUpperCase() ) ? true : false;

            var classForAlign = "class='icn3d-residue'"; // used to identify a residue when clicking a residue in sequence

            if( (bShowHighlight === undefined || bShowHighlight) && ( bHighlightChain || (bWithCoord && residueArray !== undefined && residueArray.indexOf(resiId) !== -1) ) ) {
                classForAlign = "class='icn3d-residue icn3d-highlightSeq'";
            }

            //var residueName = (me.icn3d.chainsSeq[i][k].name.length === 1) ? me.icn3d.chainsSeq[i][k].name : me.icn3d.chainsSeq[i][k].name.trim().substr(0, 1).toLowerCase();
            var residueName = (me.icn3d.chainsSeq[i][k].name.length === 1) ? me.icn3d.chainsSeq[i][k].name : me.icn3d.chainsSeq[i][k].name.trim().substr(0, 1) + '.';

            //seqHtml += "<span id='" + me.pre + structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi + "' " + classForAlign + " title='Structure " + structure + ", Chain " + chain + ", Residue " + me.icn3d.chainsSeq[i][k].name + me.icn3d.chainsSeq[i][k].resi + "'>" + residueName + "</span>";
            var titleResidueName = (me.icn3d.chainsSeq[i][k].name === 'O') ? 'HOH' : me.icn3d.chainsSeq[i][k].name;

            var colorRes;
            if(!me.icn3d.residues.hasOwnProperty(resiId)) {
                colorRes = '#000000;';
            }
            else {
                var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.residues[resiId]);
                colorRes = (firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() + ';' : '#000000;';
            }

            if(colorRes.toUpperCase() === '#FFFFFF;') colorRes = me.GREYD;

            if(bWithCoord) {
                seqHtml += "<span id='" + me.pre + resiId + "' title='" + titleResidueName + me.icn3d.chainsSeq[i][k].resi + "' style='color:" + colorRes + "'" + classForAlign + ">" + residueName + "</span>";
            }
            else {
                seqHtml += "<span title='" + titleResidueName + me.icn3d.chainsSeq[i][k].resi + "'>" + residueName + "</span>";
            }

            if(maxResi < parseInt(me.icn3d.chainsSeq[i][k].resi)) {
                maxResi = parseInt(me.icn3d.chainsSeq[i][k].resi);
            }
          }

          seqHtml += "<span class='icn3d-residueNum' title='ending residue number'>" + maxResi + "</span>";

          var annoLength = (me.icn3d.chainsAnno[i] !== undefined) ? me.icn3d.chainsAnno[i].length : 0;

          for(var j=0, jl=annoLength; j < jl; ++j) {
            resiHtmlArray[j] = "";

            resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
            for(var k=0, kl=me.icn3d.chainsAnno[i][j].length; k < kl; ++k) {
              var text = me.icn3d.chainsAnno[i][j][k];

              resiHtmlArray[j] += "<span>" + text + "</span>";
            }
            resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
          }

          for(var j=0, jl=annoLength; j < jl; ++j) {
            sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-annoTitle' chain='" + i + "' anno='" + j + "'>" + me.icn3d.chainsAnnoTitle[i][j][0] + " </div>" + resiHtmlArray[j] + "<br/></div>";
          }

          //var color = (me.icn3d.chainsColor[i] !== undefined) ? '#' + me.icn3d.chainsColor[i].getHexString() : '#000000';

          var chainidTmp = i; title = (me.icn3d.pdbid_chain2title !== undefined) ? me.icn3d.pdbid_chain2title[i] : '';

          sequencesHtml += '<div class="icn3d-seqTitle" chain="' + i + '" anno="sequence" title="' + title + '">' + chainidTmp + ' </div><span class="icn3d-seqLine">' + seqHtml + '</span><br/>';
      }

      return {"sequencesHtml": sequencesHtml, "maxSeqCnt":maxSeqCnt};
    },

    getAlignSequencesAnnotations: function (alignChainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight) { var me = this;
      var resCategories = "<b>Residue labeling:</b> aligned residue with coordinates: UPPER case letter; non-aligned residue with coordinates: lower case letter which can be highlighted; residue missing coordinates: lower case letter which can NOT be highlighted.";
      var scroll = (me.isMac() && !me.isMobile()) ? "<br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

      var sequencesHtml;

      if(!me.isMobile()) {
            sequencesHtml = "<b>Select on 1D Sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection<br/>";

          sequencesHtml += "<b>Select on 3D structures:</b> hold \"Alt\" and use mouse to pick, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection<br/>";
      }
      else {
            sequencesHtml = "<b>Select Aligned Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection<br/>";
      }

      sequencesHtml += "<div style='min-width:200px;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "alignseq_command_name' value='alseq_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='10'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "alignseq_command_desc' value='alseq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='20'> <button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save Selection</button> <br/><button style='white-space:nowrap;' id='" + me.pre + "alignseq_clearselection'>Toggle Highlight</button></div><br/>";

      sequencesHtml += resCategories + scroll + "<br/>";

      var maxSeqCnt = 0;

      var chainHash = {};
      if(alignChainArray !== undefined) {
          for(var i = 0, il = alignChainArray.length; i < il; ++i) {
              chainHash[alignChainArray[i]] = 1;
          }
      }

      for(var i in me.icn3d.alignChains) {
          var bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

          if( bHighlightChain && (bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms) ) {
              me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.alignChains[i]);
          }

          var resiHtmlArray = [], seqHtml = "";
          var seqLength = (me.icn3d.alignChainsSeq[i] !== undefined) ? me.icn3d.alignChainsSeq[i].length : 0;

          if(seqLength > maxSeqCnt) maxSeqCnt = seqLength;

          var dashPos = i.indexOf('_');
          var structure = i.substr(0, dashPos);
          var chain = i.substr(dashPos + 1);

          seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + me.icn3d.alignChainsSeq[i][0].resi + "</span>";
          var bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

          for(var k=0, kl=seqLength; k < kl; ++k) {
            // resiId is empty if it's gap
            var resiId = 'N/A', resIdFull = '', color = '#000';
            if(me.icn3d.alignChainsSeq[i][k].resi !== '' && !isNaN(me.icn3d.alignChainsSeq[i][k].resi)) {
                resiId = me.icn3d.alignChainsSeq[i][k].resi;
                resIdFull = structure + "_" + chain + "_" + resiId;
                color = me.icn3d.alignChainsSeq[i][k].color;
            }

            var classForAlign = "class='icn3d-residue"; // used to identify a residue when clicking a residue in sequence

            //if( (bShowHighlight === undefined || bShowHighlight) && (bHighlightChain || (me.icn3d.alignChainsSeq[i][k].aligned === 2 && residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) ) {
            if( (bShowHighlight === undefined || bShowHighlight) && (bHighlightChain || (residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) ) {
                classForAlign = "class='icn3d-residue icn3d-highlightSeq";
            }

            // class for alignment: cons, ncons, nalign
            if(resIdFull === '') {
                classForAlign += "'";
            }
            else {
                classForAlign += " " + me.icn3d.alignChainsSeq[i][k].class + "'";
            }

            var colorRes;
            if(!me.icn3d.residues.hasOwnProperty(resIdFull)) {
                colorRes = '#000000;';
            }
            else {
                var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.residues[resIdFull]);
                colorRes = (firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() + ';' : '#000000;';
            }

            if(colorRes.toUpperCase() === '#FFFFFF;') colorRes = me.GREYD;

            //if(me.icn3d.alignChainsSeq[i][k].class === 'icn3d-cons' || me.icn3d.alignChainsSeq[i][k].class === 'icn3d-ncons') colorRes += ' text-decoration: underline;';
            //if(me.icn3d.alignChainsSeq[i][k].class === 'icn3d-nalign') colorRes += ' text-decoration: underline;';

            //var bWithCoord = (me.icn3d.alignChainsSeq[i][k].resn === me.icn3d.alignChainsSeq[i][k].resn.toUpperCase() ) ? true : false;
            var bWithCoord = (resIdFull !== '') ? true : false;

            if(bWithCoord) {
                // add "align" in front of id so that full sequence and aligned sequence will not conflict
                seqHtml += "<span id='align" + me.pre + resIdFull + "' " + classForAlign + " style='color:" + colorRes + "' title='" + me.icn3d.alignChainsSeq[i][k].resn + me.icn3d.alignChainsSeq[i][k].resi + "'>" + me.icn3d.alignChainsSeq[i][k].resn + "</span>";
            }
            else {
                seqHtml += "<span title='" + me.icn3d.alignChainsSeq[i][k].resn + me.icn3d.alignChainsSeq[i][k].resi + "'>" + me.icn3d.alignChainsSeq[i][k].resn + "</span>";
            }

          }
          seqHtml += "<span class='icn3d-residueNum' title='ending residue number'>" + me.icn3d.alignChainsSeq[i][seqLength-1].resi + "</span>";

          var annoLength = (me.icn3d.alignChainsAnno[i] !== undefined) ? me.icn3d.alignChainsAnno[i].length : 0;

          for(var j=0, jl=annoLength; j < jl; ++j) {
            resiHtmlArray[j] = "";

            resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
            for(var k=0, kl=me.icn3d.alignChainsAnno[i][j].length; k < kl; ++k) {
              resiHtmlArray[j] += "<span>" + me.icn3d.alignChainsAnno[i][j][k] + "</span>";
            }
            resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
          }

          //color = (me.icn3d.chainsColor[i] !== undefined) ? '#' + me.icn3d.chainsColor[i].getHexString() : '#000000';

          var chainidTmp = i, title = (me.icn3d.pdbid_chain2title !== undefined) ? me.icn3d.pdbid_chain2title[i] : '';

          // add markers and residue numbers
          for(var j=annoLength-1; j >= 0; --j) {
            sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-seqTitle' chain='" + i + "' anno='" + j + "'>" + me.icn3d.alignChainsAnnoTitle[i][j][0] + "</div>" + resiHtmlArray[j] + "<br/></div>";
          }

          sequencesHtml += '<div class="icn3d-seqTitle" chain="' + i + '" anno="sequence" title="' + title + '">' + chainidTmp + ' </div><span class="icn3d-seqLine">' + seqHtml + '</span><br/>';
      }

      return {"sequencesHtml": sequencesHtml, "maxSeqCnt":maxSeqCnt};
    },

    addCustomSelection: function (residueArray, atomArray, commandname, commanddesc, select, bSelectResidues) { var me = this;
       // if selecting residues, show both in "sequence" and "command" dialogs
       // if selecting atoms (not full residues), show just in "command" dialog
       if(!(commandname in me.icn3d.definedNames2Residues) ) {
         if(bSelectResidues) {
           me.icn3d.definedNames2Residues[commandname] = residueArray;
         }

         me.icn3d.definedNames2Atoms[commandname] = atomArray;
         me.icn3d.definedNames2Descr[commandname] = commanddesc;
         me.icn3d.definedNames2Command[commandname] = select;

         var definedResiduesHtml = me.setResidueMenu(commandname);
         var definedAtomsHtml = me.setAtomMenu(commandname);

         $("#" + me.pre + "customResidues").html(definedResiduesHtml);
         $("#" + me.pre + "customResidues2").html(definedResiduesHtml);
         $("#" + me.pre + "customAtoms").html(definedAtomsHtml);
       }
       else { // concatenate the residues
         if(bSelectResidues) {
           me.icn3d.definedNames2Residues[commandname] = me.icn3d.definedNames2Residues[commandname].concat(residueArray);
         }

         me.icn3d.definedNames2Atoms[commandname] = me.icn3d.definedNames2Atoms[commandname].concat(atomArray);
         me.icn3d.definedNames2Descr[commandname] = commanddesc;
         if(bSelectResidues) {
             me.icn3d.definedNames2Command[commandname] += ',' + residueArray;
         }
         else {
             me.icn3d.definedNames2Command[commandname] = select;
         }

         var definedResiduesHtml = me.setResidueMenu(commandname);
         var definedAtomsHtml = me.setAtomMenu(commandname);

         $("#" + me.pre + "customResidues").html(definedResiduesHtml);
         $("#" + me.pre + "customResidues2").html(definedResiduesHtml);
         $("#" + me.pre + "customAtoms").html(definedAtomsHtml);
       }
    },

    changeStructureid: function (moleculeArray, bUpdateHighlight, bUpdateSequence) { var me = this;
       me.icn3d.removeHighlightObjects();

       // reset alternate structure
       me.ALTERNATE_STRUCTURE = Object.keys(me.icn3d.structures).indexOf(moleculeArray[0]);

       // clear custom defined residues
       $("#" + me.pre + "chainid").val("");
       $("#" + me.pre + "alignChainid").val("");
       $("#" + me.pre + "customResidues").val("");

       $("#" + me.pre + "chainid2").val("");
       $("#" + me.pre + "alignChainid2").val("");
       $("#" + me.pre + "customResidues2").val("");

       $("#" + me.pre + "customAtoms").val("");

       // log the selection
       if(moleculeArray !== null) me.setLogCommand('select structure ' + moleculeArray.toString(), true);

       var chainsHtml = me.setChainMenu(false, moleculeArray);
       $("#" + me.pre + "chainid").html(chainsHtml);
       $("#" + me.pre + "chainid2").html(chainsHtml);

       var alignChainsHtml = me.setAlignChainMenu(false, moleculeArray);
       $("#" + me.pre + "alignChainid").html(alignChainsHtml);
       $("#" + me.pre + "alignChainid2").html(alignChainsHtml);

       var chainArray = [];
       for(var i = 0, il=moleculeArray.length; i < il; ++i) {
           chainArray = chainArray.concat(me.icn3d.structures[moleculeArray[i]]);
       }

       if(bUpdateHighlight === undefined || bUpdateHighlight) me.icn3d.highlightAtoms = {};

       if(bUpdateSequence === undefined || bUpdateSequence) {
           //var residueArray = this.getResiduesUpdateHighlight(chainArray, bUpdateHighlight);
           //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), false, residueArray);
           //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains));
           var seqObj = me.getSequencesAnnotations(chainArray);

           $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

           if(me.cfg.align !== undefined) {
               seqObj = me.getAlignSequencesAnnotations(chainArray);

               $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
               $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
           }
       }

       me.icn3d.addHighlightObjects();
    },

    getResiduesUpdateHighlight: function (chainArray, bUpdateHighlight) { var me = this;
       var residueArray = [];

       var chainHash = {};
       for(var i = 0, il = chainArray.length; i < il; ++i) {
           chainHash[chainArray[i]] = 1;
       }

       for(var residue in me.icn3d.residues) {
          var dashPos = residue.lastIndexOf('_');
          var chain = residue.substr(0, dashPos);

          //if(chainArray.toString().toLowerCase().indexOf(chain.toLowerCase()) !== -1) {
          if(chainHash.hasOwnProperty(chain)) {
            residueArray.push(residue);
            if(bUpdateHighlight === undefined || bUpdateHighlight) me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residue]);
          }
       }

       return residueArray;
    },

    changeChainid: function (chainArray) { var me = this;
       me.icn3d.removeHighlightObjects();

       me.icn3d.highlightAtoms = {};

       // clear custom defined residues;
       $("#" + me.pre + "structureid").val("");
       $("#" + me.pre + "alignChainid").val("");
       $("#" + me.pre + "customResidues").val("");

       $("#" + me.pre + "structureid2").val("");
       $("#" + me.pre + "alignChainid2").val("");
       $("#" + me.pre + "customResidues2").val("");

       $("#" + me.pre + "customAtoms").val("");

       // log the selection
       if(chainArray !== null) me.setLogCommand('select chain ' + chainArray.toString(), true);

       var seqObj = me.getSequencesAnnotations(chainArray);

       //var residueArray = this.getResiduesUpdateHighlight(chainArray);
       //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), false, residueArray);

       $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           seqObj = me.getAlignSequencesAnnotations(chainArray);

           $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }

       me.icn3d.addHighlightObjects();
    },

    changeAlignChainid: function (alignChainArray) { var me = this;
       me.icn3d.removeHighlightObjects();

       me.icn3d.highlightAtoms = {};

       // clear custom defined residues;
       $("#" + me.pre + "structureid").val("");
       $("#" + me.pre + "chainid").val("");
       $("#" + me.pre + "customResidues").val("");

       $("#" + me.pre + "structureid2").val("");
       $("#" + me.pre + "chainid2").val("");
       $("#" + me.pre + "customResidues2").val("");

       $("#" + me.pre + "customAtoms").val("");

       // log the selection
       if(alignChainArray !== null) me.setLogCommand('select alignChain ' + alignChainArray.toString(), true);

       var seqObj = me.getAlignSequencesAnnotations(alignChainArray);

       //var residueArray = this.getResiduesUpdateHighlight(alignChainArray);
       //var seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alignChains), false, residueArray);

       $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       var residuesHash = {};
       for(var i = 0, il = alignChainArray.length; i < il; ++i) {
           var chainid = alignChainArray[i];
              residuesHash = me.icn3d.unionHash(residuesHash, me.icn3d.getResiduesFromAtoms(me.icn3d.alignChains[chainid]));
          }

       seqObj = me.getSequencesAnnotations(undefined, true, Object.keys(residuesHash));

       $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       me.icn3d.addHighlightObjects();
    },

    changeResidueid: function (residueArray) { var me = this;
       me.icn3d.removeHighlightObjects();

       me.icn3d.highlightAtoms = {};

       // clear custom defined residues;
       $("#" + me.pre + "structureid").val("");
       $("#" + me.pre + "chainid").val("");
       $("#" + me.pre + "alignChainid").val("");
       $("#" + me.pre + "customResidues").val("");

       $("#" + me.pre + "structureid2").val("");
       $("#" + me.pre + "chainid2").val("");
       $("#" + me.pre + "alignChainid2").val("");
       $("#" + me.pre + "customResidues2").val("");

       $("#" + me.pre + "customAtoms").val("");

       // log the selection
       if(residueArray !== null) me.setLogCommand('select residue ' + me.residueids2spec(residueArray), true);

       var sequencesHtml = "";

       for(var j = 0, jl = residueArray.length; j < jl; ++j) {
           me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residueArray[j]]);
       }

       sequencesHtml += "<b>Annotation(s):</b> Previously selected residues<br/>";

       //var chainArray = [];
       //for(var chain in me.icn3d.chains) {
       //    chainArray.push(chain);
       //}

       var seqObj = me.getSequencesAnnotations(undefined, true, residueArray);
       $("#" + me.pre + "dl_sequence").html(sequencesHtml + seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           seqObj = me.getAlignSequencesAnnotations(undefined, true, residueArray);

           $("#" + me.pre + "dl_sequence2").html(sequencesHtml + seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }

       me.icn3d.addHighlightObjects();
    },

    changeCustomResidues: function (nameArray) { var me = this;
       me.icn3d.removeHighlightObjects();

       me.icn3d.highlightAtoms = {};

       // clear molecule and chain
       $("#" + me.pre + "chainid").val("");
       $("#" + me.pre + "alignChainid").val("");
       $("#" + me.pre + "structureid").val("");

       $("#" + me.pre + "chainid2").val("");
       $("#" + me.pre + "alignChainid2").val("");
       $("#" + me.pre + "structureid2").val("");

       $("#" + me.pre + "customAtoms").val("");

       var sequencesHtml = "";

       //var maxSeqCnt = 0;

       var annoTmp = '';
       var allResidues = {};
       for(var i = 0; i < nameArray.length; ++i) {
         var residueArray = me.icn3d.definedNames2Residues[nameArray[i]];

         if(residueArray === undefined) continue;

         //if(residueArray.length > maxSeqCnt) maxSeqCnt = residueArray.length;

         var residueTitle = me.icn3d.definedNames2Descr[nameArray[i]];

         annoTmp += "<b>" + nameArray[i] + ":</b> " + residueTitle + "; ";

         for(var j = 0, jl = residueArray.length; j < jl; ++j) {
           allResidues[residueArray[j]] = 1;
           me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residueArray[j]]);
         }
       } // outer for

       sequencesHtml += "<b>Annotation(s):</b> " + annoTmp + "<br/>";

       //var chainArray = [];
       //for(var chain in me.icn3d.chains) {
       //     chainArray.push(chain);
       //}

       var seqObj = me.getSequencesAnnotations(undefined, true, Object.keys(allResidues));
       $("#" + me.pre + "dl_sequence").html(sequencesHtml + seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           seqObj = me.getAlignSequencesAnnotations(undefined, true, Object.keys(allResidues));

           $("#" + me.pre + "dl_sequence2").html(sequencesHtml + seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }

       me.icn3d.addHighlightObjects();
    },

    changeCustomAtoms: function (nameArray) { var me = this;
       me.icn3d.removeHighlightObjects();

       me.icn3d.highlightAtoms = {};

       // clear molecule and chain
       $("#" + me.pre + "chainid").val("");
       $("#" + me.pre + "alignChainid").val("");
       $("#" + me.pre + "structureid").val("");
       $("#" + me.pre + "customResidues").val("");

       $("#" + me.pre + "chainid2").val("");
       $("#" + me.pre + "alignChainid2").val("");
       $("#" + me.pre + "structureid2").val("");
       $("#" + me.pre + "customResidues2").val("");

       // clear commmand
       $("#" + me.pre + "command").val("");
       $("#" + me.pre + "command_name").val("");
       $("#" + me.pre + "command_desc").val("");

       var sequencesHtml = "";

       //var maxSeqCnt = 0;

       var annoTmp = '';
       var allResidues = {};
       for(var i = 0; i < nameArray.length; ++i) {
         var atomArray = me.icn3d.definedNames2Atoms[nameArray[i]];

         if(atomArray === undefined) continue;

         var residuesHash = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             var atom = me.icn3d.atoms[atomArray[j]];
             var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
             residuesHash[residueid] = 1;
         }

         var residueArray = Object.keys(residuesHash);

         if(residueArray === undefined) continue;

         //if(residueArray.length > maxSeqCnt) maxSeqCnt = residueArray.length;

         var residueTitle = me.icn3d.definedNames2Descr[nameArray[i]];

         annoTmp += "<b>" + nameArray[i] + ":</b> " + residueTitle + "; ";

         for(var j = 0, jl = residueArray.length; j < jl; ++j) {
           allResidues[residueArray[j]] = 1;
           //me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residueArray[j]]);
         }
       } // outer for

       sequencesHtml += "<b>Annotation(s):</b> " + annoTmp + "<br/>";

       //var chainArray = [];
       //for(var chain in me.icn3d.chains) {
       //     chainArray.push(chain);
       //}

       var seqObj = me.getSequencesAnnotations(undefined, true, Object.keys(allResidues));
       $("#" + me.pre + "dl_sequence").html(sequencesHtml + seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           seqObj = me.getAlignSequencesAnnotations(undefined, true, Object.keys(allResidues));

           $("#" + me.pre + "dl_sequence2").html(sequencesHtml + seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }

     // fill the dialog
     me.icn3d.highlightAtoms = {};
     for(var i = 0, il = nameArray.length; i < il; ++i) {
       var atomArray = me.icn3d.definedNames2Atoms[nameArray[i]];
       var atomTitle = me.icn3d.definedNames2Descr[nameArray[i]];
       var atomCommand = me.icn3d.definedNames2Command[nameArray[i]];

       if(atomCommand === undefined) continue;

       if(atomCommand.indexOf('select ') !== -1) atomCommand = atomCommand.replace(/select /g, '');

       if(i === 0) {
         $("#" + me.pre + "command").val(atomCommand);
         $("#" + me.pre + "command_name").val(nameArray[i]);
         $("#" + me.pre + "command_desc").val(atomTitle);
       }
       else {
         var prevValue = $("#" + me.pre + "command").val();
         $("#" + me.pre + "command").val(prevValue + " or " + atomCommand);

         var prevValue = $("#" + me.pre + "command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + " or " + nameArray[i]);

         var prevValue = $("#" + me.pre + "command_desc").val();
         $("#" + me.pre + "command_desc").val(prevValue + " or " + atomTitle);
       }

       for(var j = 0, jl = atomArray.length; j < jl; ++j) {
         me.icn3d.highlightAtoms[atomArray[j]] = 1;
       }

     } // outer for

       me.icn3d.addHighlightObjects();
    },

    exportCustomAtoms: function () { var me = this;
       //var html = "<b>All selections:</b><br/>";
       var html = "";
       //html += "<table border=1><tr><th>Name</th><th>Description</th><th width='45%'>Residues</th><th width='45%'>Command</th></tr>";
       //html += "<table border=1><tr><th>Name</th><th width='80%'>Select Residues</th></tr>";

       var nameArray = Object.keys(me.icn3d.definedNames2Atoms).sort();

       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var atomArray = me.icn3d.definedNames2Atoms[name];
         var description = me.icn3d.definedNames2Descr[name];
         var command = me.icn3d.definedNames2Command[name];
         command = command.replace(/,/g, ', ');

         //var firstLetter = command.substr(0, 1);

        // if(firstLetter === '#' || firstLetter === '.' || firstLetter === ':' || firstLetter === '@') {
        //     command = 'select ' + command;
        // }

         //html += "<tr><td>" + name + "</td><td>" + description + "</td><td>select ";
         //html += "<tr><td>" + name + "</td><td>select ";
         html += name + "\tselect ";

         var residuesHash = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             var atom = me.icn3d.atoms[atomArray[j]];
             var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
             residuesHash[residueid] = 1;
         }

         var residueArray = Object.keys(residuesHash);

         html += me.residueids2spec(residueArray);

         //html += "</td><td>" + command + "</td></tr>";
         //html += "</td></tr>";
         html += "\n";
       } // outer for

       //html += "</table>";

       return html;
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
                                 spec += '#' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '#' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
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
                                 spec += '#' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '#' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
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
                     spec += '#' + struturePart + '.' + chainPart + ':' + startResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi;
                 }
             }
             else {
                 if(bMultipleStructures) {
                     spec += '#' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
             }
         }

         return spec;
    },

    showSelection: function (id) { var me = this;
       me.icn3d.displayAtoms = {};

       me.icn3d.displayAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

       var centerAtomsResults = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.displayAtoms));
       me.icn3d.maxD = centerAtomsResults.maxD;
       if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;

//       var options2 = {};
       //show selected rotationcenter
//       options2['rotationcenter'] = 'display center';

//       me.icn3d.setAtomStyleByOptions(me.options);

//       me.icn3d.draw(options2);

       //show selected rotationcenter
       me.icn3d.options['rotationcenter'] = 'display center';

       // show side chains in case residues are all stand-alone residues
       //me.icn3d.options['sidechains'] = 'lines';

//       me.icn3d.setAtomStyleByOptions(me.icn3d.options);
       me.saveSelectionIfSelected();

       me.icn3d.draw();
    },

    selectByCommand: function (select, commandname, commanddesc) { var me = this;
           var commandStr = (select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();

           // each select command may have several commands separated by ' or '
           var commandArray = commandStr.split(' or ');
           var allHighlightAtoms = {};
           for(var i = 0, il = commandArray.length; i < il; ++i) {
               var command = commandArray[i].trim().replace(/\s+/g, ' ');
               var pos = command.indexOf(' ');

               me.icn3d.highlightAtoms = {};

               if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = me.icn3d.intersectHash(allHighlightAtoms, me.icn3d.highlightAtoms);
               }
               else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = me.icn3d.excludeHash(allHighlightAtoms, me.icn3d.highlightAtoms);
               }
               else { // union
                       me.applyCommand('select ' + command);

                       allHighlightAtoms = me.icn3d.unionHash(allHighlightAtoms, me.icn3d.highlightAtoms);
               }
           }

           me.icn3d.highlightAtoms = me.icn3d.cloneHash(allHighlightAtoms);

           var atomArray = Object.keys(me.icn3d.highlightAtoms);
           var residueArray = Object.keys(me.icn3d.getResiduesFromAtoms(me.icn3d.highlightAtoms));

           if(commandname !== "") {
               me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, true);

               var nameArray = [commandname];
               me.changeCustomResidues(nameArray);

               me.changeCustomAtoms(nameArray);
           }
    },

    selectBySpec: function (select, commandname, commanddesc, bDisplay) { var me = this;
       select = (select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();

       me.icn3d.highlightAtoms = {};

       // selection definition is similar to Chimera: https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/frameatom_spec.html
       // There will be no ' or ' in the spec. It's already separated in selectByCommand()
       // There could be ' and ' in the spec.
       var commandArray = select.replace(/\s+/g, ' ').replace(/ AND /g, ' and ').split(' and ');

       var residueHash = {};
       var atomHash = {};

       var bSelectResidues = true;
       for(var i = 0, il=commandArray.length; i < il; ++i) {
           //#1,2,3.A,B,C:5-10,LYS,ligands@CA,C
           // #1,2,3: Structure
           // .A,B,C: chain
           // :5-10,LYS,ligands: residues, could be 'proteins', 'nucleotides', 'ligands', 'ions', and 'water'
           // @CA,C: atoms
           // wild card * can be used to select all

           var poundPos = commandArray[i].indexOf('#');
           var periodPos = commandArray[i].indexOf('.');
           var colonPos = commandArray[i].indexOf(':');
           var atPos = commandArray[i].indexOf('@');

           var moleculeStr, chainStr, residueStr, atomStr;
           var testStr = commandArray[i];

           if(atPos === -1) {
             atomStr = "*";
             //testStr = testStr; // no change
           }
           else {
             atomStr = testStr.substr(atPos + 1);
             testStr = testStr.substr(0, atPos);
           }

           if(colonPos === -1) {
             residueStr = "*";
             //testStr = testStr; // no change
           }
           else {
             residueStr = testStr.substr(colonPos + 1);
             testStr = testStr.substr(0, colonPos);
           }

           if(periodPos === -1) {
             chainStr = "*";
             //testStr = testStr; // no change
           }
           else {
             chainStr = testStr.substr(periodPos + 1);
             testStr = testStr.substr(0, periodPos);
           }

           if(poundPos === -1) {
             moleculeStr = "*";
             //testStr = testStr; // no change
           }
           else {
             moleculeStr = testStr.substr(poundPos + 1);
             testStr = testStr.substr(0, poundPos);
           }

           if(atomStr !== '*') {
             bSelectResidues = false; // selected atoms
           }

           var molecule, chain, molecule_chain, moleculeArray=[], Molecule_ChainArray=[], start, end;

           if(moleculeStr === '*') {
             moleculeArray = Object.keys(me.icn3d.structures);
           }
           else {
             moleculeArray = moleculeStr.split(",")
           }

           if(chainStr === '*') {
             var tmpArray = Object.keys(me.icn3d.chains);  // 1_A (molecule_chain)

             for(var j = 0, jl = tmpArray.length; j < jl; ++j) {
               molecule_chain = tmpArray[j];

               molecule = molecule_chain.substr(0, molecule_chain.indexOf('_'));
               if(moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
                 Molecule_ChainArray.push(molecule_chain);
               }
             }
           }
           else {
             for(var j = 0, jl = moleculeArray.length; j < jl; ++j) {
               molecule = moleculeArray[j];

               var chainArray = chainStr.split(",");
               for(var k in chainArray) {
                 Molecule_ChainArray.push(molecule + '_' + chainArray[k]);
               }
             }
           }

           var residueStrArray = residueStr.split(',');
           for(var j = 0, jl = residueStrArray.length; j < jl; ++j) {
               var bResidueId = false;

               var hyphenPos = residueStrArray[j].indexOf('-');

               var oneLetterResidue;
               var bAllResidues = false;

               if(hyphenPos !== -1) {
                 start = residueStrArray[j].substr(0, hyphenPos);
                 end = residueStrArray[j].substr(hyphenPos+1);
                 bResidueId = true;
               }
               else {
                 if(residueStrArray[j] !== '' && !isNaN(residueStrArray[j])) { // residue id
                   start = residueStrArray[j];
                   end = start;
                   bResidueId = true;
                 }
                 else if(residueStrArray[j] === '*') { // all resiues
                   bAllResidues = true;
                 }
                 else if(residueStrArray[j] !== 'proteins' && residueStrArray[j] !== 'nucleotides' && residueStrArray[j] !== 'ligands' && residueStrArray[j] !== 'ions' && residueStrArray[j] !== 'water') { // residue name
                   var tmpStr = residueStrArray[j].toUpperCase();
                   oneLetterResidue = (residueStrArray[j].length === 1) ? tmpStr : me.icn3d.residueName2Abbr(tmpStr);
                 }
               }

               for(var mc = 0, mcl = Molecule_ChainArray.length; mc < mcl; ++mc) {
                 molecule_chain = Molecule_ChainArray[mc];

                 if(bResidueId) {
                   for(var k = parseInt(start); k <= parseInt(end); ++k) {
                     var residueId = molecule_chain + '_' + k;
                     if(i === 0) {
                          residueHash[residueId] = 1;
                     }
                     else {
                         residueHash[residueId] = undefined;
                     }

                     for(var m in me.icn3d.residues[residueId]) {
                       if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
//                         me.icn3d.highlightAtoms[m] = 1;
                         if(i === 0) {
                             me.icn3d.highlightAtoms[m] = 1;
                             atomHash[m] = 1;
                         }
                         else {
                             me.icn3d.highlightAtoms[m] = undefined;
                             atomHash[m] = undefined;
                         }
                       }
                     }
                   }
                 }
                 else {
                   if(molecule_chain in me.icn3d.chains) {
                     var atomHash = me.icn3d.chains[molecule_chain];
                     for(var m in atomHash) {
                       // residue could also be 'proteins', 'nucleotides', 'ligands', 'ions', and 'water'
                       var tmpStr = me.icn3d.atoms[m].resn.substr(0,3).toUpperCase();
                       if(bAllResidues
                           || me.icn3d.residueName2Abbr(tmpStr) === oneLetterResidue
                           || (residueStrArray[j] === 'proteins' && m in me.icn3d.proteins)
                           || (residueStrArray[j] === 'nucleotides' && m in me.icn3d.nucleotides)
                           || (residueStrArray[j] === 'ligands' && m in me.icn3d.ligands)
                           || (residueStrArray[j] === 'ions' && m in me.icn3d.ions)
                           || (residueStrArray[j] === 'water' && m in me.icn3d.water)
                           ) {
                         // many duplicates
                         residueHash[molecule_chain + '_' + me.icn3d.atoms[m].resi] = 1;

                         if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
//                           me.icn3d.highlightAtoms[m] = 1;
                             if(i === 0) {
                                 me.icn3d.highlightAtoms[m] = 1;
                                 atomHash[m] = 1;
                             }
                             else {
                                 me.icn3d.highlightAtoms[m] = undefined;
                                 atomHash[m] = undefined;
                             }
                         }

                       }
                     } // end for
                   }
                 } // end else
               } // end for(var mc = 0
           } // for (j
       }  // for (i

       if(bDisplay === undefined || bDisplay) me.updateSeqWinForCurrentAtoms();

       if(commandname !== "") {
           me.addCustomSelection(Object.keys(residueHash), Object.keys(atomHash), commandname, commanddesc, select, bSelectResidues);

           var nameArray = [commandname];
           me.changeCustomResidues(nameArray);
           me.changeCustomAtoms(nameArray);
       }
    },

    pickCustomSphere: function (radius) {   var me = this; // me.icn3d.pickedatom is set already
        me.clearSelection();

        var select = "select zone cutoff " + radius;

        var atomlistTarget = {};

        for(var i in me.icn3d.highlightAtoms) {
          atomlistTarget[i] = me.icn3d.atoms[i];
        }

        //var atoms = me.icn3d.getAtomsWithinAtom(me.icn3d.hash2Atoms(me.icn3d.displayAtoms), atomlistTarget, parseFloat(radius));
        // select all atom, not just displayed atoms
        var atoms = me.icn3d.getAtomsWithinAtom(me.icn3d.atoms, atomlistTarget, parseFloat(radius));

        var residues = {}, atomArray = [];

        for (var i in atoms) {
            var atom = atoms[i];
            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;

            atomArray.push(i);
        }

        var residueArray = Object.keys(residues);

        me.icn3d.highlightAtoms = {};
        for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
          var residueid = residueArray[index];
          for(var i in me.icn3d.residues[residueid]) {
            //var atom = me.icn3d.atoms[i];
            //atom.color = new THREE.Color(0xFF0000);

            //me.icn3d.atomPrevColors[i] = atom.color;

            me.icn3d.highlightAtoms[i] = 1;
          }
        }

        me.icn3d.displayAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

        var commandname, commanddesc;
          var firstAtom = me.icn3d.getFirstAtomObj(atomlistTarget);
          commandname = "sphere." + firstAtom.chain + ":" + me.icn3d.residueName2Abbr(firstAtom.resn.substr(0, 3)) + firstAtom.resi + "-" + $("#" + me.pre + "radius_aroundsphere").val() + "A";
          commanddesc = "select a sphere around currently selected " + Object.keys(me.icn3d.highlightAtoms).length + " atoms with a radius of " + radius + " angstrom";

        me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, true);

        var nameArray = [commandname];

        me.changeCustomResidues(nameArray);

        me.saveSelectionIfSelected();

        me.icn3d.draw(); // show all neighbors, even not displayed before

//    me.icn3d.picking = 0;
    },

    // between the highlighted and the rest atoms
    showHbonds: function (threshold) { var me = this;
        //var options2 = {};
        //options2["hbonds"] = "yes";
        me.icn3d.options["hbonds"] = "yes";

        var select = 'hbonds ' + threshold;

       var complement = {};

       for(var i in me.icn3d.atoms) {
           if(!me.icn3d.highlightAtoms.hasOwnProperty(i) && me.icn3d.displayAtoms.hasOwnProperty(i)) {
               complement[i] = me.icn3d.atoms[i];
           }
       }


        var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.highlightAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(me.icn3d.highlightAtoms).length > 0) {
            me.icn3d.calculateLigandHbonds(complement, me.icn3d.intersectHash2Atoms(me.icn3d.displayAtoms, me.icn3d.highlightAtoms), parseFloat(threshold) );

            me.clearSelection();

            var residues = {}, atomArray = [];

            for (var i in me.icn3d.highlightAtoms) {
                var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueid] = 1;

                atomArray.push(i);
            }

            var commandname = 'hbonds_' + firstAtom.serial;
            var commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            me.addCustomSelection(Object.keys(residues), atomArray, commandname, commanddesc, select, true);

            var nameArray = [commandname];

            me.changeCustomResidues(nameArray);

              me.saveSelectionIfSelected();

            //me.icn3d.draw(options2);
            me.icn3d.draw();
        }
    },

    addLabel: function (text, x, y, z, size, color, background, type) { var me = this;
        var label = {}; // Each label contains 'position', 'text', 'color', 'background'

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

        me.icn3d.removeHighlightObjects();

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

        me.icn3d.removeHighlightObjects();

        //me.icn3d.draw();
    },

    selectAChain: function (chainid, commandname) { var me = this;
        var commandname = commandname.replace(/\s/g, '');
        var command = 'select chain ' + chainid;

        var residueArray = [], atomArray = [];

        me.icn3d.removeHighlightObjects();

        //if(Object.keys(me.icn3d.highlightAtoms).length === Object.keys(me.icn3d.displayAtoms).length) me.icn3d.highlightAtoms = {};
        me.icn3d.highlightAtoms = {};
        for(var i in me.icn3d.chainsSeq[chainid]) { // get residue number
          var resObj = me.icn3d.chainsSeq[chainid][i];
          var residueid = chainid + "_" + resObj.resi;

            var value = resObj.name;

            if(value !== '' && value !== '-') {
              residueArray.push(residueid);
              for(var j in me.icn3d.residues[residueid]) {
                atomArray.push(j);
                me.icn3d.highlightAtoms[j] = 1;
              }
            }
        }

        me.addCustomSelection(residueArray, atomArray, commandname, commandname, command, true);

        me.icn3d.addHighlightObjects();
    },

    selectAAlignChain: function (chainid, commanddesc) { var me = this;
        var commandname = commanddesc.replace(/\s/g, '');
        var select = "Selection from chain annotation in 'Select Residue' dialog";

        var residueArray = [], atomArray = [];

        me.icn3d.removeHighlightObjects();

        //if(Object.keys(me.icn3d.highlightAtoms).length === Object.keys(me.icn3d.displayAtoms).length) me.icn3d.highlightAtoms = {};
        me.icn3d.highlightAtoms = {};

        for(var i in me.icn3d.alignChainsSeq[chainid]) { // get residue number
          var resObj = me.icn3d.alignChainsSeq[chainid][i];
          var residueid = chainid + "_" + resObj.resi;

            var value = resObj.resn;

            if(resObj.resi !== '') {
              residueArray.push(residueid);
              for(var j in me.icn3d.residues[residueid]) {
                atomArray.push(j);
                me.icn3d.highlightAtoms[j] = 1;
              }
            }
        }

        me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, true);

        me.icn3d.addHighlightObjects();
    },

    selectAResidue: function (residueid, commandname) { var me = this;
        var commandname = commandname.replace(/\s/g, '');
        var select = "select residue " + residueid;

        var residueArray = [], atomArray = [];

        residueArray.push(residueid);
        for(var j in me.icn3d.residues[residueid]) {
          atomArray.push(j);
          me.icn3d.highlightAtoms[j] = 1;
        }

        me.addCustomSelection(residueArray, atomArray, commandname, commandname, select, true);
    },

    selectResidueList: function (residueidHash, commandname, commanddescr) { var me = this;
      if(Object.keys(residueidHash).length > 0) {
        var commandname = commandname.replace(/\s/g, '');
        var select = "select " + me.residueids2spec(Object.keys(residueidHash));

        var residueArray = Object.keys(residueidHash), atomArray = [];

        for(var i in residueidHash) {
            for(var j in me.icn3d.residues[i]) {
              atomArray.push(j);
              me.icn3d.highlightAtoms[j] = 1;
            }
        }

        me.addCustomSelection(residueArray, atomArray, commandname, commanddescr, select, true);
      }
    },

    back: function () { var me = this;
      me.STATENUMBER--;

      // do not add to the array me.icn3d.commands
      me.bAddCommands = false;
      me.bAddLogs = false; // turn off log

      me.bNotLoadStructure = true;

      if(me.STATENUMBER < 1) {
        me.STATENUMBER = 1;
      }
      else {
        me.execCommands(me.STATENUMBER);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    forward: function () { var me = this;
      me.STATENUMBER++;

      // do not add to the array me.icn3d.commands
      me.bAddCommands = false;
      me.bAddLogs = false; // turn off log

      me.bNotLoadStructure = true;

      if(me.STATENUMBER > me.icn3d.commands.length) {
        me.STATENUMBER = me.icn3d.commands.length;
      }
      else {
        me.execCommands(me.STATENUMBER);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    toggleSelection: function () { var me = this;
        if(me.bHideSelection) {
            for(var i in me.icn3d.displayAtoms) {
                if(me.icn3d.highlightAtoms.hasOwnProperty(i)) delete me.icn3d.displayAtoms[i];
            }

              me.bHideSelection = false;
        }
        else {
            me.icn3d.displayAtoms = me.icn3d.unionHash(me.icn3d.displayAtoms, me.icn3d.highlightAtoms);

              me.bHideSelection = true;
        }

        me.icn3d.draw();
    },

    alternateStructures: function () { var me = this;
        me.icn3d.displayAtoms = {};

        var highlightAtomsCount = Object.keys(me.icn3d.highlightAtoms).length;
        var allAtomsCount = Object.keys(me.icn3d.atoms).length;

        var moleculeArray = Object.keys(me.icn3d.structures);
        for(var i = 0, il = moleculeArray.length; i < il; ++i) {
            var structure = moleculeArray[i];
            if(i > me.ALTERNATE_STRUCTURE || (me.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
                for(var k in me.icn3d.structures[structure]) {
                    var chain = me.icn3d.structures[structure][k];
                    me.icn3d.displayAtoms = me.icn3d.unionHash(me.icn3d.displayAtoms, me.icn3d.chains[chain]);
                }

/*
                // change structure menu only when all atom are selected
                if(highlightAtomsCount === allAtomsCount) {
                    var moleculeArray = [];
                    moleculeArray.push(structure);

                    me.changeStructureid(moleculeArray, false, false); // do not update highlightAtoms, do not update the sequence highlight
                    var structuresHtml = me.setStructureMenu(false, moleculeArray);
                    $("#" + me.pre + "structureid").html(structuresHtml);
                    $("#" + me.pre + "structureid2").html(structuresHtml);
                }
*/

                //me.ALTERNATE_STRUCTURE = structure;
                me.ALTERNATE_STRUCTURE = i;
                break;
            }
        }

        if(highlightAtomsCount < allAtomsCount) {
            me.icn3d.displayAtoms = me.icn3d.intersectHash(me.icn3d.displayAtoms, me.icn3d.highlightAtoms);

            me.icn3d.bShowHighlight = false;
            me.icn3d.options['rotationcenter'] = 'highlight center';
        }

        me.icn3d.draw();

        me.icn3d.bShowHighlight = true;
        me.icn3d.options['rotationcenter'] = 'molecule center';
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

//    exportState: function() { var me = this;
//        //http://stackoverflow.com/questions/22055598/writing-a-json-object-to-a-text-file-in-javascript
//        var url = 'data:text;charset=utf-8,' + encodeURIComponent(me.icn3d.commands.join('\n'));
//        window.open(url, '_blank');
//    },

    loadScript: function (dataStr, bStatefile) { var me = this;
      me.icn3d.bRender = false;
      me.icn3d.bStopRotate = true;

      dataStr = dataStr.replace(/;/g, '\n')

      var preCommands = [];
      if(me.icn3d.commands.length > 0) preCommands[0] = me.icn3d.commands[0];

      me.icn3d.commands = dataStr.split('\n');

      me.STATENUMBER = me.icn3d.commands.length;

      if(bStatefile !== undefined && bStatefile) {
          me.icn3d.commands = preCommands.concat(me.icn3d.commands);
          me.STATENUMBER = me.icn3d.commands.length;

          me.execCommands(me.STATENUMBER);
      }
      else {
          me.execCommands(me.STATENUMBER);

          me.icn3d.commands = preCommands.concat(me.icn3d.commands);
          me.STATENUMBER = me.icn3d.commands.length;
      }
    },

    loadSelection: function (dataStr) { var me = this;
      var nameCommandArray = dataStr.trim().split('\n');

      for(var i = 0, il = nameCommandArray.length; i < il; ++i) {
          var nameCommand = nameCommandArray[i].split('\t');
          var name = nameCommand[0];
          var command = nameCommand[1];

          var pos = command.indexOf(' '); // select ...

          me.selectByCommand(command.substr(pos + 1), name, name, false);
      }
    },

    execCommandsBase: function (start, end, steps) { var me = this;
      for(var i=start; i <= end; ++i) {
          if(me.icn3d.commands[i].indexOf('load') !== -1) {
              if(end === 0 && start === end) {
                  if(me.bNotLoadStructure) {
                        me.icn3d.highlightAtoms = me.icn3d.cloneHash(me.icn3d.atoms);
                        me.icn3d.bRender = true;

                        // end of all commands
                        if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                        me.renderFinalStep(steps);                  }
                  else {
                      $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {
                        me.icn3d.bRender = true;

                        // end of all commands
                        if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                        me.renderFinalStep(steps);
                      });
                  }
                  return;
              }
              else {
                  if(me.bNotLoadStructure) {
                      me.icn3d.highlightAtoms = me.icn3d.cloneHash(me.icn3d.atoms);
                      me.execCommandsBase(i + 1, end, steps);
                  }
                  else {
                      $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {
                          me.execCommandsBase(i + 1, end, steps);
                      });
                  }
                  return;
              }
          }
          else {
              me.applyCommand(me.icn3d.commands[i]);
          }

          if(i === steps - 1) {
                me.icn3d.bRender = true;

                  // end of all commands
                  if(i + 1 === me.icn3d.commands.length) me.bAddCommands = true;

                  me.renderFinalStep(steps);
          }
      }
    },

    renderFinalStep: function(steps) { var me = this;
                var commandTransformation = me.icn3d.commands[steps-1].split('|||');

                if(commandTransformation.length == 2) {
                    var transformation = JSON.parse(commandTransformation[1]);

                    me.icn3d._zoomFactor = transformation.factor;

                    me.icn3d.mouseChange.x = transformation.mouseChange.x;
                    me.icn3d.mouseChange.y = transformation.mouseChange.y;

                    me.icn3d.quaternion._x = transformation.quaternion._x;
                    me.icn3d.quaternion._y = transformation.quaternion._y;
                    me.icn3d.quaternion._z = transformation.quaternion._z;
                    me.icn3d.quaternion._w = transformation.quaternion._w;
                }

                // simple if all atoms are modified
                if( me.cfg.command === undefined && (steps === 1 || (Object.keys(me.icn3d.highlightAtoms).length === Object.keys(me.icn3d.atoms).length) || (me.icn3d.optionsHistory[steps - 1] !== undefined && me.icn3d.optionsHistory[steps - 1].hasOwnProperty('hlatomcount') && me.icn3d.optionsHistory[steps - 1].hlatomcount === Object.keys(me.icn3d.atoms).length) ) ) {
                    // assign styles and color using the options at that stage
//                    var currHighlightAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);
//                    me.icn3d.highlightAtoms = me.icn3d.cloneHash(me.icn3d.atoms);
                    me.icn3d.setAtomStyleByOptions(me.icn3d.optionsHistory[steps - 1]);
                    me.icn3d.setColorByOptions(me.icn3d.optionsHistory[steps - 1], me.icn3d.highlightAtoms);

                    // set the highlightAtom back
//                    me.icn3d.highlightAtoms = me.icn3d.cloneHash(currHighlightAtoms);

                    if(me.icn3d.optionsHistory.length >= steps) {
                        var pickingOption = me.icn3d.optionsHistory[steps - 1].picking;
                        if(pickingOption === 'no') {
                            me.icn3d.picking = 0;
                        }
                        else if(pickingOption === 'atom') {
                            me.icn3d.picking = 1;
                        }
                        else if(pickingOption === 'residue') {
                            me.icn3d.picking = 2;
                        }
                        else if(pickingOption === 'strand') {
                            me.icn3d.picking = 3;
                        }

                        if(steps === 1) {
                            me.icn3d.applyOriginalColor();
                        }

                        me.updateSeqWinForCurrentAtoms();

                        me.icn3d.draw(me.icn3d.optionsHistory[steps - 1]);
                    }
                    else {
                        me.updateSeqWinForCurrentAtoms();

                        me.icn3d.draw();
                    }
                }
                else { // more complicated if partial atoms are modified
                    me.icn3d.draw();
                }
    },

    execCommands: function (steps) { var me = this;
        me.icn3d.bRender = false;

        // fresh start
        me.icn3d.reinitAfterLoad();

        me.icn3d.options = me.icn3d.cloneHash(me.options);

        me.execCommandsBase(0, steps-1, steps);
    },

    applyCommandLoad: function (commandStr) { var me = this;
      // chain functions together
      me.deferred2 = $.Deferred(function() {
      me.bAddCommands = false;
      var commandTransformation = commandStr.split('|||');

      var commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
      var command = commandOri.toLowerCase();

      if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
        var load_parameters = command.split(' | ');

        var loadStr = load_parameters[0];
        if(load_parameters.length > 1) {
            var firstSpacePos = load_parameters[1].indexOf(' ');
            me.cfg.inpara = load_parameters[1].substr(firstSpacePos + 1);

/*
            // remove &mmdbid=
            var mmdbidPos = me.cfg.inpara.indexOf('&mmdbid=');
            if(mmdbidPos !== -1) {
                var beforeStr = me.cfg.inpara.substr(0, mmdbidPos);
                var afterStr = me.cfg.inpara.substr(mmdbidPos + 1);

                var nextAmpPos = afterStr.indexOf('&');
                if(nextAmpPos !== -1) {
                    afterStr = afterStr.substr(nextAmpPos);
                }
                else {
                    afterStr = '';
                }

                me.cfg.inpara = beforeStr + afterStr;
            }
*/
        }

        // load pdb, mmcif, mmdb, cid
        var id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
        if(command.indexOf('pdb') !== -1) {
          me.downloadPdb(id);
          me.cfg.pdbid = id;
        }
        else if(command.indexOf('mmcif') !== -1) {
          me.downloadMmcif(id);
          me.cfg.mmcifid = id;
        }
        else if(command.indexOf('mmdb') !== -1) {
          me.downloadMmdb(id);
          me.cfg.mmdbid = id;
        }
        else if(command.indexOf('gi') !== -1) {
          me.downloadGi(id);
          me.cfg.gi = id;
        }
        else if(command.indexOf('cid') !== -1) {
          me.downloadCid(id);
          me.cfg.cid = id;
        }
        else if(command.indexOf('align') !== -1) {
          me.downloadAlignment(id);
          me.cfg.align = id;
        }
      }
      me.bAddCommands = true;
      }); // end of me.deferred = $.Deferred(function() {

      return me.deferred2;
    },

    applyCommand: function (commandStr) { var me = this;
      me.bAddCommands = false;

      var commandTransformation = commandStr.split('|||');

      var commandOri = commandTransformation[0].replace(/\s+/g, ' ').trim();
      var command = commandOri.toLowerCase();

      var bShowLog = true;

      if(command.indexOf('export state file') !== -1) { // last step to update transformation
        // the last transformation will be applied
      }
      else if(commandOri.indexOf('select structure') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeStructureid(idArray);

        //bShowLog = false;
      }
      else if(commandOri.indexOf('select chain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeChainid(idArray);

        //bShowLog = false;
      }
      else if(commandOri.indexOf('select alignChain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeAlignChainid(idArray);

        //bShowLog = false;
      }
      else if(commandOri.indexOf('select residue') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeResidueid(idArray);

        //bShowLog = false;
      }
      else if(commandOri.indexOf('select saved selection') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeCustomResidues(idArray);

        //bShowLog = false;
      }
      else if(commandOri.indexOf('select saved atoms') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeCustomAtoms(idArray);

        //bShowLog = false;
      }
      else if(command.indexOf('show selection') !== -1) {
        me.showSelection();
      }
      //else if(command.indexOf('show saved atoms') !== -1) {
      //  me.showSelection('customAtoms');
      //}
      //else if(command.indexOf('select') !== -1 && command.indexOf('name') !== -1 && command.indexOf('description') !== -1) {
      else if(command.indexOf('select') !== -1 && command.indexOf('name') !== -1) {
        var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        var select = '', commandname = '', commanddesc = '';
        for (var i = 0, il = paraArray.length; i < il; ++i) {
            var para = paraArray[i];

            if(para.indexOf('select') !== -1) {
                select = para.substr(para.indexOf(' ') + 1);
            }
            else if(para.indexOf('name') !== -1) {
                commandname = para.substr(para.indexOf(' ') + 1);
            }
            else if(para.indexOf('description') !== -1) {
                commanddesc = para.substr(para.indexOf(' ') + 1);
            }
        }

        if(paraArray.length < 3) commanddesc = commandname;

        me.selectByCommand(select, commandname, commanddesc);

        //bShowLog = false;
      }
      else if(command.indexOf('select #') !== -1 || command.indexOf('select .') !== -1 || command.indexOf('select :') !== -1 || command.indexOf('select @') !== -1) {
        var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        var select = paraArray[0].substr(paraArray[0].indexOf(' ') + 1);
        var commandname = '', commanddesc = '';
        if(paraArray.length === 3) {
            commandname = paraArray[1].substr(paraArray[1].indexOf(' ') + 1);
            commanddesc = paraArray[2].substr(paraArray[2].indexOf(' ') + 1);
        }

        if(select.indexOf(' or ') !== -1) { // "select " command without " | name"
            me.selectByCommand(select, commandname, commanddesc);
        }
        else { // only single query from selectByCommand()
            me.selectBySpec(select, commandname, commanddesc);
        }

        //bShowLog = false;
      }
      else if(command.indexOf('set picking atom') !== -1) {
        me.icn3d.picking = 1;
        me.icn3d.options['picking'] = 'atom';
      }
      else if(command.indexOf('set picking off') !== -1) {
        me.icn3d.picking = 0;
        me.icn3d.options['picking'] = 'no';
        me.icn3d.draw();
        me.icn3d.removeHighlightObjects();
      }
      else if(command.indexOf('set picking residue') !== -1) {
        me.icn3d.picking = 2;
        me.icn3d.options['picking'] = 'residue';
      }
      else if(command.indexOf('set picking strand') !== -1) {
        me.icn3d.picking = 3;
        me.icn3d.options['picking'] = 'strand';
      }
      else if(command.indexOf('pickatom') !== -1) {
        var atomid = parseInt(command.substr(command.lastIndexOf(' ') + 1));

        me.icn3d.pickedatom = me.icn3d.atoms[atomid];

        me.icn3d.showPicking(me.icn3d.pickedatom);

        //bShowLog = false;

        // highlight the sequence background
        //var pickedResidue = me.icn3d.pickedatom.structure + '_' + me.icn3d.pickedatom.chain + '_' + me.icn3d.pickedatom.resi;
        //if($("#" + me.pre + pickedResidue).length !== 0) {
        //  $("#" + me.pre + pickedResidue).toggleClass('icn3d-highlightSeq');
        //}
      }
      else if(command.indexOf('select zone cutoff') !== -1) {
        var radius = command.substr(command.lastIndexOf(' ') + 1);

        me.pickCustomSphere(radius);
      }
      else if(command.indexOf('style') !== -1) {
        var secondPart = command.substr(command.indexOf(' ') + 1);

        var selectionType = secondPart.substr(0, secondPart.indexOf(' '));
        var style = secondPart.substr(secondPart.indexOf(' ') + 1);

        me.setStyle(selectionType, style);
      }
      else if(command.indexOf('color') === 0) {
        var color = command.substr(command.indexOf(' ') + 1);
        //var options2 = {};
        //options2['color'] = color;
        me.icn3d.options['color'] = color;

        //me.icn3d.setColorByOptions(options2, me.icn3d.highlightAtoms);
        me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.highlightAtoms);

        me.updateSeqWinForCurrentAtoms();

        //me.icn3d.draw();
      }
      else if(command.indexOf('set surface wireframe on') !== -1) {
        me.icn3d.options['wireframe'] = 'yes';
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set surface wireframe off') !== -1) {
        me.icn3d.options['wireframe'] = 'no';
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set surface opacity') !== -1) {
        var value = command.substr(command.lastIndexOf(' ') + 1);
        me.icn3d.options['opacity'] = value;
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set surface neighbors on') !== -1) {
        me.icn3d.bConsiderNeighbors = true;
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set surface neighbors off') !== -1) {
        me.icn3d.bConsiderNeighbors = false;
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set surface') !== -1) {
        var value = command.substr(12);

        me.icn3d.options['surface'] = value;
        me.icn3d.applySurfaceOptions();
      }
      else if(command.indexOf('set camera') !== -1) {
        var value = command.substr(command.lastIndexOf(' ') + 1);
        me.icn3d.options['camera'] = value;
      }
      else if(command.indexOf('set background') !== -1) {
        var value = command.substr(command.lastIndexOf(' ') + 1);
        me.icn3d.options['background'] = value;
      }
      else if(command.indexOf('set axis on') !== -1) {
        me.icn3d.options['axis'] = 'yes';
      }
      else if(command.indexOf('set axis off') !== -1) {
        me.icn3d.options['axis'] = 'no';
      }
      else if(command.indexOf('set fog on') !== -1) {
        me.icn3d.options['fog'] = 'yes';
      }
      else if(command.indexOf('set fog off') !== -1) {
        me.icn3d.options['fog'] = 'no';
      }
      else if(command.indexOf('set slab on') !== -1) {
        me.icn3d.options['slab'] = 'yes';
      }
      else if(command.indexOf('set slab off') !== -1) {
        me.icn3d.options['slab'] = 'no';
      }
      else if(command === 'reset') {
        //location.reload();
        me.icn3d.reinitAfterLoad();
        me.renderFinalStep(1);
      }
      else if(command === 'reset orientation') {
        me.icn3d.resetOrientation();
      }
      else if(command.indexOf('toggle highlight') !== -1) {
        if(me.icn3d.prevHighlightObjects.length > 0) { // remove
            me.icn3d.removeHighlightObjects();
            me.icn3d.bShowHighlight = false;
        }
        else { // add
            me.icn3d.addHighlightObjects();
            me.icn3d.bShowHighlight = true;
        }
      }
      else if(command.indexOf('set assembly on') !== -1) {
        me.icn3d.bAssembly = true;
      }
      else if(command.indexOf('set assembly off') !== -1) {
        me.icn3d.bAssembly = false;
      }
      else if(commandOri.indexOf('add label') !== -1) {
        var paraArray = commandOri.split(' | ');
        //var text = paraArray[0].substr(paraArray[0].lastIndexOf(' ') + 1);
        var text = paraArray[0].substr(('add label').length + 1);

        // add label Text | x 40.45 y 24.465000000000003 z 53.48 | size 40 | color #ffff00 | background #cccccc | type custom
        if(paraArray.length == 6) { // specified position
            var positionArray = paraArray[1].split(' ');
            var x = positionArray[1], y = positionArray[3], z = positionArray[5];

            var size = paraArray[2].substr(paraArray[2].lastIndexOf(' ') + 1);
            var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
            var background = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1);
            var type = paraArray[5].substr(paraArray[5].lastIndexOf(' ') + 1);
            if(size === '0' || size === '' || size === 'undefined') size = undefined;
            if(color === '0' || color === '' || color === 'undefined') color = undefined;
            if(background === '0' || background === '' || background === 'undefined') background = undefined;

            me.addLabel(text, x,y,z, size, color, background, type);
            me.icn3d.draw();
        }
        else if(paraArray.length == 5) { // position is the center of the current selection
            var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.highlightAtoms));
            var x = position.center.x;
            var y = position.center.y;
            var z = position.center.z;

            var size = paraArray[1].substr(paraArray[1].lastIndexOf(' ') + 1);
            var color = paraArray[2].substr(paraArray[2].lastIndexOf(' ') + 1);
            var background = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
            var type = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1);
            if(size === '0' || size === '' || size === 'undefined') size = undefined;
            if(color === '0' || color === '' || color === 'undefined') color = undefined;
            if(background === '0' || background === '' || background === 'undefined') background = undefined;

            me.addLabel(text, x,y,z, size, color, background, type);
            me.icn3d.draw();
        }
      }
      else if(command.indexOf('add residue labels') !== -1) {
        //me.icn3d.options['labels'] = 'yes';

        me.icn3d.addResiudeLabels(me.icn3d.highlightAtoms);

        me.icn3d.draw();
      }
      else if(command.indexOf('add line') !== -1) {
        var paraArray = command.split(' | ');
        var p1Array = paraArray[1].split(' ');
        var p2Array = paraArray[2].split(' ');
        var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
        var dashed = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1) === 'true' ? true : false;
        var type = paraArray[5].substr(paraArray[5].lastIndexOf(' ') + 1);

        me.addLine(p1Array[1], p1Array[3], p1Array[5], p2Array[1], p2Array[3], p2Array[5], color, dashed, type);
      }
      else if(command.indexOf('zoom selection') !== -1) {
        me.icn3d.zoominSelection();
      }
      else if(command.indexOf('center selection') !== -1) {
        me.icn3d.centerSelection();
      }
      else if(command.indexOf('rotate left') !== -1) {
         me.icn3d.bStopRotate = false;
         me.ROTATION_DIRECTION = 'left';

         me.rotateStructure('left');
      }
      else if(command.indexOf('rotate right') !== -1) {
         me.icn3d.bStopRotate = false;
         me.ROTATION_DIRECTION = 'right';

         me.rotateStructure('right');
      }
      else if(command.indexOf('rotate up') !== -1) {
         me.icn3d.bStopRotate = false;
         me.ROTATION_DIRECTION = 'up';

         me.rotateStructure('up');
      }
      else if(command.indexOf('rotate down') !== -1) {
         me.icn3d.bStopRotate = false;
         me.ROTATION_DIRECTION = 'down';

         me.rotateStructure('down');
      }
      else if(command.indexOf('hbonds') !== -1) {
        var threshold = command.substr(command.lastIndexOf(' ') + 1);

        me.showHbonds(threshold);
      }
      else if(command.indexOf('set hbonds off') !== -1) {
        me.icn3d.options["hbonds"] = "no";
        me.icn3d.draw();
        }
      else if(command.indexOf('set lines off') !== -1) {
        //me.icn3d.options["lines"] = "no";
        me.icn3d.draw();
        }
      else if(command.indexOf('set labels off') !== -1) {
        //me.icn3d.options["labels"] = "no";
        me.icn3d.draw();
        }
      else if(command.indexOf('back') !== -1) {
         me.back();
      }
      else if(command.indexOf('forward') !== -1) {
         me.forward();
      }
      else if(command.indexOf('toggle selection') !== -1) {
         me.toggleSelection();
      }

      else if(command.indexOf('select all') !== -1) {
         me.selectAll();
      }
      else if(command.indexOf('select complement') !== -1) {
         me.selectComplement();
      }
      else if(command.indexOf('set highlight color') !== -1) {
           var color = command.substr(20);
           if(color === 'yellow') {
               me.icn3d.highlightColor = new THREE.Color(0xFFFF00);
               me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
           }
           else if(color === 'green') {
               me.icn3d.highlightColor = new THREE.Color(0x00FF00);
               me.icn3d.matShader = me.icn3d.setOutlineColor('green');
           }
           else if(color === 'red') {
               me.icn3d.highlightColor = new THREE.Color(0xFF0000);
               me.icn3d.matShader = me.icn3d.setOutlineColor('red');
           }
           me.icn3d.draw(); // required to make it work properly
      }
      else if(command.indexOf('set highlight style') !== -1) {
           var style = command.substr(20);
           if(style === 'outline') {
               me.icn3d.bHighlight = 1;
           }
           else if(style === '3d') {
               me.icn3d.bHighlight = 2;
           }

           me.icn3d.draw();
      }
      else if(command.indexOf('output selection') !== -1) {
          me.outputSelection();
      }
/*
      // other select commands
      else if(command.indexOf('select') !== -1) {
        var select = commandOri;
        var commandname = "unspecified" + parseInt(Math.random() * 100);
        var commanddesc = "description not available";

        me.selectByCommand(select, commandname, commanddesc);
      }
*/
      if(bShowLog) {
          me.setLogCommand(commandOri, false);
      }

      me.bAddCommands = true;
    },

    setTopMenusHtml: function (id) { var me = this;
        var html = "";

        html += "<div style='position:relative;'>";
        html += "  <!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
        html += "  <div id='" + me.pre + "menulist' style='position:absolute; z-index:999; float:left; display:table-row; margin: 3px 0px 0px 3px;'>";
        html += "    <table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "          <span id='" + me.pre + "back' class='ui-icon ui-icon-arrowthick-1-w icn3d-endIcon icn3d-link' title='Step backward'></span>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "          <span id='" + me.pre + "forward' class='ui-icon ui-icon-arrowthick-1-e icn3d-endIcon icn3d-link' title='Step forward'></span>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>" + me.setMenu1() + "</td>";
        html += "    <td valign='top'>" + me.setMenu2() + "</td>";
        html += "    <td valign='top'>" + me.setMenu3() + "</td>";
        html += "    <td valign='top'>" + me.setMenu4() + "</td>";
        html += "    <td valign='top'>" + me.setMenu5() + "</td>";
        html += "    <td valign='top'>" + me.setMenu6() + "</td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "    <a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html' target='_blank'><span class='ui-icon ui-icon-help icn3d-middleIcon icn3d-link' title='click to see the help page'></span></a>";
        html += "    </div>";
        html += "    </td>";

        html += "  </tr>";
        html += "  </table>";
        html += "  </div>";

        html += me.setTools();

        // show title at the top left corner
        html += "  <div id='" + me.pre + "title' class='icn3d-commandTitle' style='position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color: " + me.GREYD + "'></div>";
        html += "  <div id='" + me.pre + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.GREYD + ";'>";
        html += "   <div id='" + me.pre + "menuLogSection'>";
        html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";
        html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";

        html += "   </div>";

        html += "    <div id='" + me.pre + "wait' style='position:absolute; top:180px; left:100px; font-size: 2em; color: #444444;'>Loading the structure...</div>";
        html += "    <canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        // separate for the log box
        html += me.setLogWindow();

        html += "  </div>";

        html += "</div>";

        html += me.setDialogs();

        html += me.setCustomDialogs();

        $( "#" + id).html(html);

        // menu display
        $("accordion").accordion({ collapsible: true, active: false, heightStyle: "content"});
        $("accordion div").removeClass("ui-accordion-content ui-corner-all ui-corner-bottom ui-widget-content");

        $(".menu").menu({position: { my: "left top", at: "right top" }});
        $(".menu").hover(function(){},function(){$("accordion").accordion( "option", "active", "none");});

        $("#" + me.pre + "accordion1").hover( function(){ $("#" + me.pre + "accordion1 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion1 div").css("display", "none"); } );

        $("#" + me.pre + "accordion2").hover( function(){ $("#" + me.pre + "accordion2 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion2 div").css("display", "none"); } );

        $("#" + me.pre + "accordion3").hover( function(){ $("#" + me.pre + "accordion3 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion3 div").css("display", "none"); } );

        $("#" + me.pre + "accordion4").hover( function(){ $("#" + me.pre + "accordion4 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion4 div").css("display", "none"); } );

        $("#" + me.pre + "accordion5").hover( function(){ $("#" + me.pre + "accordion5 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion5 div").css("display", "none"); } );

        $("#" + me.pre + "accordion6").hover( function(){ $("#" + me.pre + "accordion6 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion6 div").css("display", "none"); } );
    },

    setMenu1: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion1'>";
        html += "              <h3>File</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li>Retrieve by ID";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_pdbid' class='icn3d-link'>PDB ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmcifid' class='icn3d-link'>mmCIF ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmdbid' class='icn3d-link'>MMDB ID</span></li>";
        //html += "                    <li><span id='" + me.pre + "menu1_term' class='icn3d-link'>Search MMDB term</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_gi' class='icn3d-link'>gi</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_cid' class='icn3d-link'>PubChem CID</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Open File";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_pdbfile' class='icn3d-link'>PDB File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmciffile' class='icn3d-link'>mmCIF File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mol2file' class='icn3d-link'>Mol2 File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_sdffile' class='icn3d-link'>SDF File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_xyzfile' class='icn3d-link'>XYZ File</span></li>";
        html += "                    <li>-</li>";
        html += "                    <li><span id='" + me.pre + "menu1_state' class='icn3d-link'>State/Script File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_selection' class='icn3d-link'>Selection File</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Save File";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_exportState' class='icn3d-link'>State File<br/></span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_exportSelections' class='icn3d-link'>Selection File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_exportCanvas' class='icn3d-link'>PNG Image File</span></li>";
        html += "                    <li>-</li>";
        html += "                    <li><span id='" + me.pre + "menu1_exportCounts' class='icn3d-link'>Residue Counts</span></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li><span id='" + me.pre + "menu1_sharelink' class='icn3d-link'>Share Link</span></li>";


        if(me.cfg.cid !== undefined) {
            html += "                <li>Links";
            html += "                  <ul>";
            html += "                    <li><span id='" + me.pre + "menu1_link_structure' class='icn3d-link'>Compound Summary</span></li>";
            html += "                    <li><span id='" + me.pre + "menu1_link_vast' class='icn3d-link'>Similar Compounds</span></li>";

            html += "                    <li><span id='" + me.pre + "menu1_link_bind' class='icn3d-link'>Structures Bound</span></li>";
            html += "                  </ul>";
            html += "                </li>";
        }
        else {
            html += "                <li>Links";
            html += "                  <ul>";
            html += "                    <li><span id='" + me.pre + "menu1_link_structure' class='icn3d-link'>Structure Summary</span></li>";
            html += "                    <li><span id='" + me.pre + "menu1_link_vast' class='icn3d-link'>Similar Structures</span></li>";

            html += "                    <li><span id='" + me.pre + "menu1_link_pubmed' class='icn3d-link'>Literature</span></li>";
            html += "                  </ul>";
            html += "                </li>";
        }

        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setMenu2: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion2'>";
        html += "              <h3>Select</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        //html += "                <li>Select";
        //html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_command'><label for='" + me.pre + "menu2_command'>Advanced</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_aroundsphere'><label for='" + me.pre + "menu2_aroundsphere'>Sphere</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectcomplement'><label for='" + me.pre + "menu2_selectcomplement'>Complement</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_select_chain'><label for='" + me.pre + "menu2_select_chain'>Chain</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectall'><label for='" + me.pre + "menu2_selectall'>All</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectresidues'><label for='" + me.pre + "menu2_selectresidues'>Sequence</label></li>";
        }
        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_alignment'><label for='" + me.pre + "menu2_alignment'>Aligned Seq.</label></li>";
        }
        //html += "                  </ul>";
        //html += "                </li>";

        html += "                <li>Picking";
        html += "                  <ul>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue' checked><label for='" + me.pre + "menu2_pickingResidue'>Residue (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes'><label for='" + me.pre + "menu2_pickingYes'>Atom (Alt)</label></li>";
        }
        else {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue'><label for='" + me.pre + "menu2_pickingResidue'>Residue (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes' checked><label for='" + me.pre + "menu2_pickingYes'>Atom (Alt)</label></li>";
        }

//        html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingNo'><label for='" + me.pre + "menu2_pickingNo'>Off</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Display";
        html += "                  <ul>";
        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_alternate'><label for='" + me.pre + "menu2_alternate'>Alternate Selection</label></li>";
        }
//        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_toggle'><label for='" + me.pre + "menu2_toggle'>Toggle Selection</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_show_selected'><label for='" + me.pre + "menu2_show_selected'>Display Selection</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "toggleHighlight2'><label for='" + me.pre + "toggleHighlight2'>Toggle Highlight</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                    <li>Highlight Color";
        html += "                      <ul>";
        html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_color' id='" + me.pre + "menu2_hl_colorYellow' checked><label for='" + me.pre + "menu2_hl_colorYellow'>Yellow</label></li>";
        html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_color' id='" + me.pre + "menu2_hl_colorGreen'><label for='" + me.pre + "menu2_hl_colorGreen'>Green</label></li>";
        html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_color' id='" + me.pre + "menu2_hl_colorRed'><label for='" + me.pre + "menu2_hl_colorRed'>Red</label></li>";
        html += "                      </ul>";
        html += "                    </li>";
        html += "                    <li>Highlight Style";
        html += "                      <ul>";

        if(Detector.webgl) {
            html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_style' id='" + me.pre + "menu2_hl_styleOutline' checked><label for='" + me.pre + "menu2_hl_styleOutline'>Outline</label></li>";
            html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_style' id='" + me.pre + "menu2_hl_styleObject'><label for='" + me.pre + "menu2_hl_styleObject'>3D Objects</label></li>";
        }
        else {
            html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_style' id='" + me.pre + "menu2_hl_styleOutline'><label for='" + me.pre + "menu2_hl_styleOutline'>Outline</label></li>";
            html += "                        <li><input type='radio' name='" + me.pre + "menu2_hl_style' id='" + me.pre + "menu2_hl_styleObject' checked><label for='" + me.pre + "menu2_hl_styleObject'>3D Objects</label></li>";
        }
        html += "                      </ul>";
        html += "                    </li>";

        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setMenu3: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion3'>";
        html += "              <h3>Style</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        if(me.cfg.cid === undefined) {
            if(me.cfg.align !== undefined) {
                html += "                <li>Proteins";
                html += "                  <ul>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsRibbon'><label for='" + me.pre + "menu3_proteinsRibbon'>Ribbon</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsStrand'><label for='" + me.pre + "menu3_proteinsStrand'>Strand</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsCylinder'><label for='" + me.pre + "menu3_proteinsCylinder'>Cylinder and Plate</label></li>";

                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsSchematic'><label for='" + me.pre + "menu3_proteinsSchematic'>Schematic</label></li>";

                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsCalpha' checked><label for='" + me.pre + "menu3_proteinsCalpha'>C Alpha Trace</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsBfactor'><label for='" + me.pre + "menu3_proteinsBfactor'>B Factor Tube</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsLines'><label for='" + me.pre + "menu3_proteinsLines'>Lines</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsStick'><label for='" + me.pre + "menu3_proteinsStick'>Stick</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsBallstick'><label for='" + me.pre + "menu3_proteinsBallstick'>Ball and Stick</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsSphere'><label for='" + me.pre + "menu3_proteinsSphere'>Sphere</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsNothing'><label for='" + me.pre + "menu3_proteinsNothing'>Hide</label></li>";
                html += "                  </ul>";
                html += "                </li>";
            }
            else {
                html += "                <li>Protein";
                html += "                  <ul>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsRibbon' checked><label for='" + me.pre + "menu3_proteinsRibbon'>Ribbon</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsStrand'><label for='" + me.pre + "menu3_proteinsStrand'>Strand</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsCylinder'><label for='" + me.pre + "menu3_proteinsCylinder'>Cylinder and Plate</label></li>";

                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsSchematic'><label for='" + me.pre + "menu3_proteinsSchematic'>Schematic</label></li>";

                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsCalpha'><label for='" + me.pre + "menu3_proteinsCalpha'>C Alpha Trace</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsBfactor'><label for='" + me.pre + "menu3_proteinsBfactor'>B Factor Tube</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsLines'><label for='" + me.pre + "menu3_proteinsLines'>Lines</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsStick'><label for='" + me.pre + "menu3_proteinsStick'>Stick</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsBallstick'><label for='" + me.pre + "menu3_proteinsBallstick'>Ball and Stick</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsSphere'><label for='" + me.pre + "menu3_proteinsSphere'>Sphere</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu3_proteins' id='" + me.pre + "menu3_proteinsNothing'><label for='" + me.pre + "menu3_proteinsNothing'>Hide</label></li>";
                html += "                  </ul>";
                html += "                </li>";
            }

            html += "                <li>Side Chains";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_sidechains' id='" + me.pre + "menu3_sidechainsLines'><label for='" + me.pre + "menu3_sidechainsLines'>Lines</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_sidechains' id='" + me.pre + "menu3_sidechainsStick'><label for='" + me.pre + "menu3_sidechainsStick'>Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_sidechains' id='" + me.pre + "menu3_sidechainsBallstick'><label for='" + me.pre + "menu3_sidechainsBallstick'>Ball and Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_sidechains' id='" + me.pre + "menu3_sidechainsSphere'><label for='" + me.pre + "menu3_sidechainsSphere'>Sphere</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_sidechains' id='" + me.pre + "menu3_sidechainsNothing' checked><label for='" + me.pre + "menu3_sidechainsNothing'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

            html += "                <li>Nucleotides";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclCartoon' checked><label for='" + me.pre + "menu3_nuclCartoon'>Cartoon</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclPhos'><label for='" + me.pre + "menu3_nuclPhos'>Phosphorus Trace</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclSchematic'><label for='" + me.pre + "menu3_nuclSchematic'>Schematic</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclLines'><label for='" + me.pre + "menu3_nuclLines'>Lines</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclStick'><label for='" + me.pre + "menu3_nuclStick'>Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclBallstick'><label for='" + me.pre + "menu3_nuclBallstick'>Ball and Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclSphere'><label for='" + me.pre + "menu3_nuclSphere'>Sphere</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclNothing'><label for='" + me.pre + "menu3_nuclNothing'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

            html += "                <li>Ligands";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsLines'><label for='" + me.pre + "menu3_ligandsLines'>Lines</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsStick' checked><label for='" + me.pre + "menu3_ligandsStick'>Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsBallstick'><label for='" + me.pre + "menu3_ligandsBallstick'>Ball and Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsSchematic'><label for='" + me.pre + "menu3_ligandsSchematic'>Schematic</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsSphere'><label for='" + me.pre + "menu3_ligandsSphere'>Sphere</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsNothing'><label for='" + me.pre + "menu3_ligandsNothing'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";
        }
        else {
            html += "                <li>Ligands";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsLines'><label for='" + me.pre + "menu3_ligandsLines'>Lines</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsStick'><label for='" + me.pre + "menu3_ligandsStick'>Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsBallstick' checked><label for='" + me.pre + "menu3_ligandsBallstick'>Ball and Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsSchematic'><label for='" + me.pre + "menu3_ligandsSchematic'>Schematic</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsSphere'><label for='" + me.pre + "menu3_ligandsSphere'>Sphere</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_ligands' id='" + me.pre + "menu3_ligandsNothing'><label for='" + me.pre + "menu3_ligandsNothing'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";
        }


        html += "                <li>Ions";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_ions' id='" + me.pre + "menu3_ionsSphere' checked><label for='" + me.pre + "menu3_ionsSphere'>Sphere</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_ions' id='" + me.pre + "menu3_ionsDot'><label for='" + me.pre + "menu3_ionsDot'>Dot</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_ions' id='" + me.pre + "menu3_ionsNothing'><label for='" + me.pre + "menu3_ionsNothing'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Water";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_water' id='" + me.pre + "menu3_waterSphere'><label for='" + me.pre + "menu3_waterSphere'>Sphere</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_water' id='" + me.pre + "menu3_waterDot'><label for='" + me.pre + "menu3_waterDot'>Dot</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu3_water' id='" + me.pre + "menu3_waterNothing' checked><label for='" + me.pre + "menu3_waterNothing'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setMenu4: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion4'>";
        html += "              <h3>Color</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        if(me.cfg.cid === undefined) {
            if(me.cfg.mmdbid !== undefined) {
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorSpectrum'><label for='" + me.pre + "menu4_colorSpectrum'>Spectrum</label></li>";
            }
            else {
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorSpectrum' checked><label for='" + me.pre + "menu4_colorSpectrum'>Spectrum</label></li>";
            }
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorSS'><label for='" + me.pre + "menu4_colorSS'>Secondary</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorCharge'><label for='" + me.pre + "menu4_colorCharge'>Charge</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorHydrophobic'><label for='" + me.pre + "menu4_colorHydrophobic'>Hydrophobic</label></li>";
            //html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorBfactor'><label for='" + me.pre + "menu4_colorBfactor'>B Factor</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorChain'><label for='" + me.pre + "menu4_colorChain'>Chain</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorResidue'><label for='" + me.pre + "menu4_colorResidue'>Residue</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorAtom'><label for='" + me.pre + "menu4_colorAtom'>Atom</label></li>";

            if(me.cfg.align !== undefined) {
                html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorConserved'><label for='" + me.pre + "menu4_colorConserved'>Identity</label></li>";
            }

        }
        else {
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorAtom' checked><label for='" + me.pre + "menu4_colorAtom'>Atom</label></li>";
        }

        html += "                <li>-</li>";
        html += "                <li>Unicolor";
        html += "                  <ul>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorRed'><label for='" + me.pre + "menu4_colorRed'>Red</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorGreen'><label for='" + me.pre + "menu4_colorGreen'>Green</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorBlue'><label for='" + me.pre + "menu4_colorBlue'>Blue</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorMagenta'><label for='" + me.pre + "menu4_colorMagenta'>Magenta</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorYellow'><label for='" + me.pre + "menu4_colorYellow'>Yellow</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorCyan'><label for='" + me.pre + "menu4_colorCyan'>Cyan</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorWhite'><label for='" + me.pre + "menu4_colorWhite'>White</label></li>";
        html += "                    <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorGrey'><label for='" + me.pre + "menu4_colorGrey'>Grey</label></li>";
        html += "                  </ul>";
        html += "                <li>-</li>";
        html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorCustom'><label for='" + me.pre + "menu4_colorCustom'>Custom</label></li>";
        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setMenu5: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion5'>";
        html += "              <h3>Surface</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li>Type";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceVDW'><label for='" + me.pre + "menu5_surfaceVDW'>Van der Waals</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceMolecular'><label for='" + me.pre + "menu5_surfaceMolecular'>Molecular Surface</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceSAS'><label for='" + me.pre + "menu5_surfaceSAS'>Solvent Accessible</label></li>";
    //        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceMolecular'><label for='" + me.pre + "menu5_surfaceMolecular'>Molecular Surface</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceNothing' checked><label for='" + me.pre + "menu5_surfaceNothing'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Opacity";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity10'><label for='" + me.pre + "menu5_opacity10'>1.0</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity09'><label for='" + me.pre + "menu5_opacity09'>0.9</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity08' checked><label for='" + me.pre + "menu5_opacity08'>0.8</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity07'><label for='" + me.pre + "menu5_opacity07'>0.7</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity06'><label for='" + me.pre + "menu5_opacity06'>0.6</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_opacity' id='" + me.pre + "menu5_opacity05'><label for='" + me.pre + "menu5_opacity05'>0.5</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Wireframe";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_wireframe' id='" + me.pre + "menu5_wireframeYes'><label for='" + me.pre + "menu5_wireframeYes'>Yes</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_wireframe' id='" + me.pre + "menu5_wireframeNo' checked><label for='" + me.pre + "menu5_wireframeNo'>No</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Neighbors";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_neighbors' id='" + me.pre + "menu5_neighborsYes'><label for='" + me.pre + "menu5_neighborsYes'>Yes</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_neighbors' id='" + me.pre + "menu5_neighborsNo' checked><label for='" + me.pre + "menu5_neighborsNo'>No</label></li>";
        html += "                  </ul>";
        html += "                </li>";


        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setMenu6: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion6'>";
        html += "              <h3>Other</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li><span id='" + me.pre + "reset' class='icn3d-link'>Reset</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_resetorientation' class='icn3d-link'>Reset Orien.</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_center' class='icn3d-link'>Center</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_selectedcenter' class='icn3d-link'>Zoom in</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_back' class='icn3d-link'>Backward</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_forward' class='icn3d-link'>Forward</span></li>";
        if(me.cfg.cid === undefined) {
            html += "                <li>Assembly";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyYes'><label for='" + me.pre + "menu6_assemblyYes'>Yes</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyNo' checked><label for='" + me.pre + "menu6_assemblyNo'>No</label></li>";
            html += "                  </ul>";
            html += "                </li>";
            html += "                <li>H-bonds";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsYes'><label for='" + me.pre + "menu6_hbondsYes'>Show</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsNo' checked><label for='" + me.pre + "menu6_hbondsNo'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";
        }
        html += "                <li>Label";
        html += "                  <ul>";

        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelYes'><label for='" + me.pre + "menu6_addlabelYes'>by Picking</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelSelection'><label for='" + me.pre + "menu6_addlabelSelection'>by Selection</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelResidues'><label for='" + me.pre + "menu6_addlabelResidues'>by Residues</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelNo' checked><label for='" + me.pre + "menu6_addlabelNo'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Distance";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_distance' id='" + me.pre + "menu6_distanceYes'><label for='" + me.pre + "menu6_distanceYes'>Show</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_distance' id='" + me.pre + "menu6_distanceNo' checked><label for='" + me.pre + "menu6_distanceNo'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Auto Rotation";
        html += "                  <ul>";
        html += "                      <li><span id='" + me.pre + "menu6_rotateleft' class='icn3d-link'>Rotate Left</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotateright' class='icn3d-link'>Rotate Right</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotateup' class='icn3d-link'>Rotate Up</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotatedown' class='icn3d-link'>Rotate Down</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Camera";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_camera' id='" + me.pre + "menu6_cameraPers' checked><label for='" + me.pre + "menu6_cameraPers'>Perspective</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_camera' id='" + me.pre + "menu6_cameraOrth'><label for='" + me.pre + "menu6_cameraOrth'>Orthographic</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Background";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_bkgd' id='" + me.pre + "menu6_bkgdBlack' checked><label for='" + me.pre + "menu6_bkgdBlack'>Black</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_bkgd' id='" + me.pre + "menu6_bkgdGrey'><label for='" + me.pre + "menu6_bkgdGrey'>Grey</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_bkgd' id='" + me.pre + "menu6_bkgdWhite'><label for='" + me.pre + "menu6_bkgdWhite'>White</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Fog";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showfog' id='" + me.pre + "menu6_showfogYes'><label for='" + me.pre + "menu6_showfogYes'>On</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showfog' id='" + me.pre + "menu6_showfogNo' checked><label for='" + me.pre + "menu6_showfogNo'>Off</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Slab";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showslab' id='" + me.pre + "menu6_showslabYes'><label for='" + me.pre + "menu6_showslabYes'>On</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showslab' id='" + me.pre + "menu6_showslabNo' checked><label for='" + me.pre + "menu6_showslabNo'>Off</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>XYZ-axes";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showaxis' id='" + me.pre + "menu6_showaxisYes'><label for='" + me.pre + "menu6_showaxisYes'>Show</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_showaxis' id='" + me.pre + "menu6_showaxisNo' checked><label for='" + me.pre + "menu6_showaxisNo'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li>Transform Hint";
        html += "                  <ul>";
        html += "                    <li>Rotate";
        html += "                        <ul>";
        html += "                            <li>Left Mouse</li>";
        html += "                            <li>Key L: Left</li>";
        html += "                            <li>Key J: Right</li>";
        html += "                            <li>Key I: Up</li>";
        html += "                            <li>Key M: Down</li>";
        html += "                        </ul>";
        html += "                    </li>";
        html += "                    <li>Zoom";
        html += "                        <ul>";
        html += "                            <li>Middle Mouse</li>";
        html += "                            <li>Key Z: Zoom in</li>";
        html += "                            <li>Key X: Zoom out</li>";
        html += "                        </ul>";
        html += "                    </li>";
        html += "                    <li>Translate";
        html += "                        <ul>";
        html += "                            <li>Right Mouse</li>";
//        html += "                            <li>Arrow Left: Left</li>";
//        html += "                            <li>Arrow Right: Right</li>";
//        html += "                            <li>Arrow Up: Up</li>";
//        html += "                            <li>Arrow Down: Down</li>";
        html += "                        </ul>";
        html += "                    </li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html' target='_blank'>Help</a></li>";
        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setLogWindow: function() { var me = this;
        var html = "";

//        html += "    <div style='float:left' class='icn3d-commandTitle'>Script/Log (<a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands' target='_blank'><span title='click to see all commands'>Hint</span></a>)</div><br/>";
//        html += "    <textarea id='" + me.pre + "logtext' rows='3' cols='40'></textarea>";

//        html += "  <div id='" + me.pre + "commandlog' style='position:absolute; z-index:555; float:left; display:table-row; margin: 3px 0px 0px " + me.MENU_WIDTH + "px;'>";

//        html += "    <textarea id='" + me.pre + "logtext' rows='2' cols='40'></textarea>";
//        html += "  </div>";

        html += "  <div id='" + me.pre + "commandlog' style='float:left; margin-top: -5px; width: 100%;'>";

        html += "    <textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + (0.8*me.MENU_HEIGHT) + "px; padding: 0px; border: 0px; background-color: " + me.GREYD + ";'></textarea>";
        html += "  </div>";

        return html;
    },

    setDialogs: function() { var me = this;
        var html = "";

        html += "<!-- dialog will not be part of the form -->";
        html += "<div id='" + me.pre + "allselections' class='icn3d-hidden'>";

        // filter for large structure
        html += "<div id='" + me.pre + "dl_filter' style='overflow:auto; position:relative;'>";
        //html += "  <div>This large structure contains more than 50,000 atoms. Please select some structures/chains below to display.</div>";
        //html += "  <input style='position:absolute; top:8px; left:15px;' type='checkbox' id='" + me.pre + "filter_ckbx_all'/>";
        html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
        html += "<button id='" + me.pre + "highlight_3d_diagram' style='margin-left:10px;'><span style='white-space:nowrap'><b>Highlight</b></span></button></div>";
        html += "  <div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
        html += "  </div>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_selectresidues'>";

        html += "  <div id='" + me.pre + "dl_sequence' class='icn3d-dl_sequence'>";
        html += "  </div>";

        html += "</div>";

        if(me.cfg.align !== undefined) {
          html += "<div id='" + me.pre + "dl_alignment'>";
          html += "  <div id='" + me.pre + "dl_sequence2' class='icn3d-dl_sequence'>";
          html += "  </div>";
          html += "</div>";
        }

        html += "<div id='" + me.pre + "dl_command'>";
        html += "  <table width='500'><tr><td valign='top'><table>";
        html += "<tr><td align='right'><b>Select:</b></td><td><input type='text' id='" + me.pre + "command' placeholder='#[structures].[chains]:[residues]@[atoms]' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Name:</b></td><td><input type='text' id='" + me.pre + "command_name' placeholder='my_selection' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Description:</b></td><td><input type='text' id='" + me.pre + "command_desc' placeholder='description about my selection' size='30'></td></tr>";
        html += "<tr><td colspan='2' align='center'><button id='" + me.pre + "command_apply'><b>Save Selection</b></button></td></tr>";
        html += "  </table></td>";

        html += "  <td valign='top'><div>";
        html += "    <b>All Selections:</b> <br/>";
        html += "    <select id='" + me.pre + "customAtoms' multiple size='3' style='min-width:100px;'>";
        html += "    </select>";
        html += "  </td>";

//       html += "  <td valign='top'><div>";
//        html += "    <button id='" + me.pre + "show_selected_atom'><span style='white-space:nowrap'><b>Display Selection</b></span></button>";
//        html += "  </div></td></tr>";

        html += "  </td></tr>";

        //html += "  <tr><td colspan='3'>One line command: select [my_select] | name [my_name] | description [my_description], e.g., select :1-10 | name residue1-20 | description residues 1-20 in all chains<br/><br/></td></tr>";

        html += "  <tr><td colspan='2'><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#selectb' target='_blank'><span title='click to see how to select'><b>Hint</b></span></a>: <br/>";
        html += "  <b>Specification:</b> In the selection \"#1,2,3.A,B,C:5-10,Lys,ligands@CA,C\":";
        html += "  <ul><li>\"#1,2,3\" uses \"#\" to indicate structure selection.<br/>";
        html += "  <li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
        html += "  <li>\":5-10,Lys,ligands\" uses \":\" to indicate residue selection. Residue could be predefined names: \"proteins\", \"nucleotides\", \"ligands\", \"ions\", and \"water\".<br/>";
        html += "  <li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
        html += "  <li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/></ul>";
        html += "  <b>Set Operation:</b>";
        html += "  <ul><li>Users can select multiple items in \"All Selections\" above.<br/>";
        html += "  <li>Different selections can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, \":1-10 or :Lys\" selects all residues 1-10 and all Lys residues. \":1-10 and :Lys\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :Lys\" selects all residues 1-10, which are not Lys residues.</ul>";
        html += "  </td></tr></table>";

        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbid'>";
        html += "PDB ID: <input type='text' id='" + me.pre + "pdbid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_pdb'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbfile'>";
        html += "PDB File: <input type='file' id='" + me.pre + "pdbfile' size=8> ";
        html += "<button id='" + me.pre + "reload_pdbfile'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_mol2file'>";
        html += "Mol2 File: <input type='file' id='" + me.pre + "mol2file' size=8> ";
        html += "<button id='" + me.pre + "reload_mol2file'>Load</button>";
        html += "</div>";
        html += "<div id='" + me.pre + "dl_sdffile'>";
        html += "SDF File: <input type='file' id='" + me.pre + "sdffile' size=8> ";
        html += "<button id='" + me.pre + "reload_sdffile'>Load</button>";
        html += "</div>";
        html += "<div id='" + me.pre + "dl_xyzfile'>";
        html += "XYZ File: <input type='file' id='" + me.pre + "xyzfile' size=8> ";
        html += "<button id='" + me.pre + "reload_xyzfile'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_mmciffile'>";
        html += "mmCIF File: <input type='file' id='" + me.pre + "mmciffile' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_mmciffile'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_mmcifid'>";
        html += "mmCIF ID: <input type='text' id='" + me.pre + "mmcifid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_mmcif'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_mmdbid'>";
        html += "MMDB ID: <input type='text' id='" + me.pre + "mmdbid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_mmdb'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_gi'>";
        html += "Protein gi: <input type='text' id='" + me.pre + "gi' value='827343227' size=8> ";
        html += "<button id='" + me.pre + "reload_gi'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_cid'>";
        html += "PubChem CID: <input type='text' id='" + me.pre + "cid' value='2244' size=8> ";
        html += "<button id='" + me.pre + "reload_cid'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_state'>";
        html += "State file: <input type='file' id='" + me.pre + "state'><br/>";
        html += "<button id='" + me.pre + "reload_state' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_selection'>";
        html += "Selection file: <input type='file' id='" + me.pre + "selectionfile'><br/>";
        html += "<button id='" + me.pre + "reload_selectionfile' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_color'>";
        html += "Custom Color: <input type='text' id='" + me.pre + "color' value='#FF0000' size=8> ";
        html += "<button id='" + me.pre + "applycustomcolor'>Apply</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_hbonds'>";
        html += "  <span style='white-space:nowrap;'>Threshold: <select id='" + me.pre + "hbondthreshold'>";
        html += "  <option value='3.2'>3.2</option>";
        html += "  <option value='3.3'>3.3</option>";
        html += "  <option value='3.4'>3.4</option>";
        html += "  <option value='3.5' selected>3.5</option>";
        html += "  <option value='3.6'>3.6</option>";
        html += "  <option value='3.7'>3.7</option>";
        html += "  <option value='3.8'>3.8</option>";
        html += "  <option value='3.9'>3.9</option>";
        html += "  <option value='4.0'>4.0</option>";
        html += "  </select> &#197;</span><br/>";
        html += "  <span style='white-space:nowrap'><button id='" + me.pre + "applyhbonds'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_aroundsphere'";
        html += "  <span style='white-space:nowrap'>1. Sphere with a radius: <input type='text' id='" + me.pre + "radius_aroundsphere' value='5' size='2'> &#197;</span><br/>";
        html += "  <span style='white-space:nowrap'>2. <button id='" + me.pre + "applypick_aroundsphere'>Display</button> the sphere around currently selected atoms</span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_select_chain'>";

        html += "    <table><tr valign='center'>";

        html += "        <td valign='top'><b>Structure:</b><br/>";
        html += "        <select id='" + me.pre + "structureid2' multiple size='3' style='min-width:50px;'>";
        html += "        </select></td>";

        html += "        <td valign='top'><b>Chain:</b><br/>";
        html += "        <select id='" + me.pre + "chainid2' multiple size='3' style='min-width:50px;'>";
        html += "        </select></td>";

        if(me.cfg.align !== undefined) {
            html += "        <td valign='top'><b>Aligned:</b><br/>";
            html += "        <select id='" + me.pre + "alignChainid2' multiple size='3' style='min-width:50px;'>";
            html += "        </select></td>";
        }

        html += "        <td valign='top'><b>Custom:</b><br/>";
        html += "        <select id='" + me.pre + "customResidues2' multiple size='3' style='min-width:50px;'>";
        html += "        </select></td>";

        html += "    </tr></table>";

        html += "</div>";

        html += "<div id='" + me.pre + "dl_addlabel'>";
        html += "1. Text: <input type='text' id='" + me.pre + "labeltext' value='Text' size=4><br/>";
        html += "2. Size: <input type='text' id='" + me.pre + "labelsize' value='18' size=4 maxlength=2><br/>";
        html += "3. Color: <input type='text' id='" + me.pre + "labelcolor' value='#ffff00' size=4><br/>";
        html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd' value='#cccccc' size=4><br/>";
        html += "<span style='white-space:nowrap'>5. Pick TWO atoms</span><br/>";
        html += "<span style='white-space:nowrap'>6. <button id='" + me.pre + "applypick_labels'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_addlabelselection'>";
        html += "1. Text: <input type='text' id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
        html += "2. Size: <input type='text' id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
        html += "3. Color: <input type='text' id='" + me.pre + "labelcolor2' value='#ffff00' size=4><br/>";
        html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd2' value='#cccccc' size=4><br/>";
        html += "<span style='white-space:nowrap'>5. <button id='" + me.pre + "applyselection_labels'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_distance'>";
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms</span><br/>";
        html += "  <span style='white-space:nowrap'>2. <button id='" + me.pre + "applypick_measuredistance'>Display</button></span>";
        html += "</div>";

        html += "</div>";
        html += "<!--/form-->";

        return html;
    },

    setCustomDialogs: function() { var me = this;
        var html = "";

        return html;
    },

    setTools: function() { var me = this;
        // second row
        var html = "";

        html += "  <div id='" + me.pre + "selection' style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 3px;'>";
        html += "    <table style='margin-top: 3px;'><tr valign='center'>";

        if(me.cfg.cid === undefined) {
            html += "        <td valign='top'><span class='icn3d-commandTitle'>Structure:</span><br/>";
            html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "structureid' multiple size='1' style='min-width:50px;'>";
            html += "        </select></div></td>";

            if(me.cfg.align !== undefined) {
                html += "        <td valign='top'><span class='icn3d-commandTitle'>Aligned:</span><br/>";
                html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "alignChainid' multiple size='1' style='min-width:50px;'>";
                html += "        </select></div></td>";
            }
            else {
                html += "        <td valign='top'><span class='icn3d-commandTitle'>Chain:</span><br/>";
                html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "chainid' multiple size='1' style='min-width:50px;'>";
                html += "        </select></div></td>";
            }
        }

        html += "        <td valign='top'><span class='icn3d-commandTitle'>Custom:</span><br/>";
        html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "customResidues' multiple size='1' style='min-width:50px;'>";
        html += "        </select></div></td>";

        var buttonStyle = me.isMobile() ? 'none' : 'button';

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "selectall'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Select all atoms'>Select<br/>All</span></button></div></td>";

        if(me.cfg.cid === undefined) {
            html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_sequences'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Show the sequences of the selected structure'>View<br/>Sequence</span></button></div></td>";

            if(me.cfg.align !== undefined) {
                html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_alignsequences'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Show the sequences of the aligned structures'>Aligned<br/>Sequence</span></button></div></td>";
            }

            //if(me.cfg.align !== undefined) {
                html += "      <td valign='top'><div id='" + me.pre + "alternateWrapper' style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "alternate'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Alternate the structures'>Alternate<br/>Selection</span></button></div></td>";
            //}
        }

//        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button id='" + me.pre + "toggle'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Toggle the selected atoms on and off'>Toggle<br/>Selection</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_selected'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Display the selected atoms ONLY'>Display<br/>Selection</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "zoomin_selection'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Center on the selected atoms and zoom in'>Zoom in<br/>Selection</span></button></div></td>";

        if(me.cfg.align === undefined) {
//            html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "toggleHighlight'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Turn on and off the 3D highlight in the viewer'>Toggle<br/>Highlight</span></button></div></td>";
        }

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "resetorientation'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Reset Orientation'>Reset<br/>Orientation</span></button></div></td>";

        html += "    </tr></table>";
        html += "    </div>";

        return html;
    },

    updateMenus: function(bInitial) { var me = this;
      if(bInitial) me.setProteinsNucleotidesLigands();

      var structuresHtml = me.setStructureMenu(bInitial);
      var chainsHtml = me.setChainMenu(bInitial);
      var alignChainsHtml = me.setAlignChainMenu(bInitial);
      var definedResiduesHtml = me.setResidueMenu();
      var definedAtomsHtml = me.setAtomMenu();

      if($("#" + me.pre + "structureid")) $("#" + me.pre + "structureid").html(structuresHtml);
      if($("#" + me.pre + "chainid")) $("#" + me.pre + "chainid").html(chainsHtml);
      if($("#" + me.pre + "alignChainid")) $("#" + me.pre + "alignChainid").html(alignChainsHtml);
      if($("#" + me.pre + "customResidues")) $("#" + me.pre + "customResidues").html(definedResiduesHtml);

      if($("#" + me.pre + "structureid2")) $("#" + me.pre + "structureid2").html(structuresHtml);
      if($("#" + me.pre + "chainid2")) $("#" + me.pre + "chainid2").html(chainsHtml);
      if($("#" + me.pre + "alignChainid2")) $("#" + me.pre + "alignChainid2").html(alignChainsHtml);
      if($("#" + me.pre + "customResidues2")) $("#" + me.pre + "customResidues2").html(definedResiduesHtml);

      if($("#" + me.pre + "customAtoms")) $("#" + me.pre + "customAtoms").html(definedAtomsHtml);
    },

    selectAllUpdateMenuSeq: function(bInitial, bShowHighlight) { var me = this;
       this.updateMenus(bInitial);

       //var residueArray = this.getResiduesUpdateHighlight(Object.keys(me.icn3d.chains));
       //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), false, residueArray);

       var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), undefined, undefined, bShowHighlight);

       $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           //residueArray = this.getResiduesUpdateHighlight(Object.keys(me.icn3d.alignChains));

           //seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alignChains), false, residueArray);

           seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alignChains), undefined, undefined, bShowHighlight);

           $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }
    },

    selectAll: function() { var me = this;
           me.icn3d.highlightAtoms = {};

           for(var i in me.icn3d.chains) {
               me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[i]);
               me.icn3d.displayAtoms = me.icn3d.unionHash(me.icn3d.displayAtoms, me.icn3d.chains[i]);
           }

           me.icn3d.removeHighlightObjects();
           me.bSelectResidue = false;
           me.bSelectAlignResidue = false;

           //me.selectAllUpdateMenuSeq(true);
           me.selectAllUpdateMenuSeq(true, false);

           // highlight condensed view
           //if(me.icn3d.molid2ss !== undefined) me.icn3d.drawHelixBrick(me.icn3d.molid2ss, me.icn3d.molid2color, me.icn3d.bHighlight); // condensed view

           //me.icn3d.addHighlightObjects();
           me.icn3d.draw();
    },

    selectComplement: function() { var me = this;
           var complement = {};
           var residuesHash = {};
           var residueid;

           for(var i in me.icn3d.atoms) {
               if(!me.icn3d.highlightAtoms.hasOwnProperty(i)) {
                   complement[i] = 1;
                   residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                   residuesHash[residueid] = 1;
               }
           }

           me.icn3d.highlightAtoms = {};
           me.icn3d.highlightAtoms = me.icn3d.cloneHash(complement);

           me.icn3d.removeHighlightObjects();

           var sequencesHtml = "<b>Annotation(s):</b> Complement of the current selection<br/>";

           //var chainArray = [];
           //for(var chain in me.icn3d.chains) {
           //    chainArray.push(chain);
           //}

           var seqObj = me.getSequencesAnnotations(undefined, true, Object.keys(residuesHash));
           $("#" + me.pre + "dl_sequence").html(sequencesHtml + seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

           me.icn3d.addHighlightObjects();
    },

    updateSeqWinForCurrentAtoms: function(bShowHighlight) { var me = this;
           var residuesHash = me.icn3d.getResiduesFromAtoms(me.icn3d.highlightAtoms);

           //me.icn3d.removeHighlightObjects();

           var seqObj = me.getSequencesAnnotations(undefined, false, Object.keys(residuesHash), bShowHighlight);
           $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

           if(me.cfg.align !== undefined) {
               seqObj = me.getAlignSequencesAnnotations(undefined, false, Object.keys(residuesHash), bShowHighlight);

               $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
               $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
           }

           //me.icn3d.addHighlightObjects();
    },

    outputSelection: function() { var me = this;
            var residues = {};
            for(var i in me.icn3d.highlightAtoms) {
                var residueId = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueId] = 1;
            }

            var residueArray = Object.keys(residues).sort(function(a, b) {
                        if(a !== '' && !isNaN(a)) {
                            return parseInt(a) - parseInt(b);
                        }
                        else {
                            var lastPosA = a.lastIndexOf('_');
                            var lastPosB = b.lastIndexOf('_');
                            if(a.substr(0, lastPosA) < b.substr(0, lastPosA)) return -1;
                            else if(a.substr(0, lastPosA) > b.substr(0, lastPosA)) return 1;
                            else if(a.substr(0, lastPosA) == b.substr(0, lastPosA)) {
                                if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                                else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                                else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                            }
                        }
                    });

            var output = "<table><tr><th>Structure</th><th>Chain</th><th>Residue Number</th></tr>";
            for(var i = 0, il = residueArray.length; i < il; ++i) {
                //if(typeof(residueArray[i]) === 'function') continue;

                var firstPos = residueArray[i].indexOf('_');
                var lastPos = residueArray[i].lastIndexOf('_');
                var structure = residueArray[i].substr(0, firstPos);
                var chain = residueArray[i].substr(firstPos + 1, lastPos - firstPos - 1);
                var resi = residueArray[i].substr(lastPos + 1);

                output += "<tr><td>" + structure + "</td><td>" + chain + "</td><td>" + resi + "</td></tr>";
            }

            me.saveFile(me.inputid + '_residues.txt', 'html', output);

    },

    saveCommandsToSession: function() { var me = this;
        var dataStr = me.icn3d.commands.join('\n');
        var data = decodeURIComponent(dataStr);

        sessionStorage.setItem('commands', data);
    },

    updateSelectionNameDesc: function() { var me = this;
        $("#" + me.pre + "seq_command_name").val("seq_" + Object.keys(me.icn3d.definedNames2Residues).length);
        $("#" + me.pre + "seq_command_desc").val("seq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length);

        $("#" + me.pre + "alignseq_command_name").val("alseq_" + Object.keys(me.icn3d.definedNames2Residues).length);
        $("#" + me.pre + "alignseq_command_desc").val("alseq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length);
    },

    // ====== functions end ===============

    // ====== events start ===============
    // back and forward arrows
    clickBack: function() { var me = this;
        $("#" + me.pre + "back").add("#" + me.pre + "menu6_back").click(function(e) {
           e.preventDefault();

           me.setLogCommand("back", false);
           me.back();
        });
    },

    clickForward: function() { var me = this;
        $("#" + me.pre + "forward").add("#" + me.pre + "menu6_forward").click(function(e) {
           e.preventDefault();

           me.setLogCommand("forward", false);
           me.forward();
        });
    },

    clickToggle: function() { var me = this;
        $("#" + me.pre + "toggle").add("#" + me.pre + "menu2_toggle").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("toggle selection", true);
           me.toggleSelection();
        });
    },

    clickHlColorYellow: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorYellow").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("set highlight color yellow", true);
           me.icn3d.highlightColor = new THREE.Color(0xFFFF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorGreen: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorGreen").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("set highlight color green", true);
           me.icn3d.highlightColor = new THREE.Color(0x00FF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('green');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorRed: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorRed").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("set highlight color red", true);
           me.icn3d.highlightColor = new THREE.Color(0xFF0000);
           me.icn3d.matShader = me.icn3d.setOutlineColor('red');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlStyleOutline: function() { var me = this;
        $("#" + me.pre + "menu2_hl_styleOutline").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("set highlight style outline", true);
           me.icn3d.bHighlight = 1;

           me.icn3d.draw();
        });
    },

    clickHlStyleObject: function() { var me = this;
        $("#" + me.pre + "menu2_hl_styleObject").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("set highlight style 3d", true);
           me.icn3d.bHighlight = 2;

           me.icn3d.draw();
        });
    },

    clickAlternate: function() { var me = this;
        $("#" + me.pre + "alternate").add("#" + me.pre + "menu2_alternate").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("alternate structures", false);
           me.alternateStructures();
        });
    },

    //menu 1
    clickMenu1_pdbid: function() { var me = this;
        $("#" + me.pre + "menu1_pdbid").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_pdbid', 'Please input PDB ID');
        });
    },

    clickMenu1_pdbfile: function() { var me = this;
        $("#" + me.pre + "menu1_pdbfile").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_pdbfile', 'Please input PDB File');
        });
    },

    clickMenu1_mol2file: function() { var me = this;
        $("#" + me.pre + "menu1_mol2file").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_mol2file', 'Please input Mol2 File');
        });
    },
    clickMenu1_sdffile: function() { var me = this;
        $("#" + me.pre + "menu1_sdffile").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_sdffile', 'Please input SDF File');
        });
    },
    clickMenu1_xyzfile: function() { var me = this;
        $("#" + me.pre + "menu1_xyzfile").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_xyzfile', 'Please input XYZ File');
        });
    },

    clickMenu1_mmciffile: function() { var me = this;
        $("#" + me.pre + "menu1_mmciffile").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_mmciffile', 'Please input mmCIF File');
        });
    },

    clickMenu1_mmcifid: function() { var me = this;
        $("#" + me.pre + "menu1_mmcifid").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_mmcifid', 'Please input mmCIF ID');
        });
    },

    clickMenu1_mmdbid: function() { var me = this;
        $("#" + me.pre + "menu1_mmdbid").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_mmdbid', 'Please input MMDB ID');
        });
    },

    clickMenu1_gi: function() { var me = this;
        $("#" + me.pre + "menu1_gi").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_gi', 'Please input protein gi');
        });
    },

    clickMenu1_cid: function() { var me = this;
        $("#" + me.pre + "menu1_cid").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_cid', 'Please input PubChem CID');
        });
    },

    clickMenu1_state: function() { var me = this;
        $("#" + me.pre + "menu1_state").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_state', 'Please input the state file');
        });
    },

    clickMenu1_selection: function() { var me = this;
        $("#" + me.pre + "menu1_selection").click(function(e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_selection', 'Please input the selection file');
        });
    },

    clickMenu1_exportState: function() { var me = this;
        $("#" + me.pre + "menu1_exportState").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("export state file", false);

           //me.exportState();
           me.saveFile(me.inputid + '_statefile.txt', 'command');
        });
    },

    clickMenu1_exportCanvas: function() { var me = this;
        $("#" + me.pre + "menu1_exportCanvas").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("export canvas", false);

           //me.icn3d.exportCanvas();
           me.saveFile(me.inputid + '_image.png', 'png');
        });
    },

    clickMenu1_exportCounts: function() { var me = this;
        $("#" + me.pre + "menu1_exportCounts").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("export counts", false);

           var text = '<b>Total Count for atoms with coordinates</b>:<br/><table border=1><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';

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

           text += '</table><br/>';

           me.saveFile(me.inputid + '_counts.html', 'html', text);
        });
    },

    clickMenu1_exportSelections: function() { var me = this;
        $("#" + me.pre + "menu1_exportSelections").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("export all selections", false);

           var text = me.exportCustomAtoms();

           me.saveFile(me.inputid + '_selections.txt', 'text', text);
        });
    },

    clickMenu1_sharelink: function() { var me = this;
        $("#" + me.pre + "menu1_sharelink").click(function (e) {
           //e.preventDefault();

           var url = "./full.html?";

           var pos = inpara.indexOf('&command=');
           var inparaWithoutCommand = (pos !== -1 ) ? inpara.substr(0, pos) : inpara;

           url += inparaWithoutCommand.substr(1) + '&command=';

           for(var i = 1, il = me.icn3d.commands.length; i < il; ++i) {
               var command_tf = me.icn3d.commands[i].split('|||');

               if(i === il - 1) {
                   var transformation = (command_tf.length > 1) ? ('|||' + command_tf[1]) : '';
                   if(i !== 1) {
                       url += '; ';
                   }
                   url += command_tf[0] + transformation;
               }
               else if(i === 1) {
                   url += command_tf[0];
               }
               else if(i !== 1 && i !== il - 1) {
                   url += '; ' + command_tf[0];
               }
           }

           me.setLogCommand("share link: " + url, false);

           if(url.length > 4000) alert("The url is more than 4000 characters and may not work. Please export the 'State File' and open it in the viewer.");

           window.open(url, '_blank');
        });
    },

    clickMenu1_link_structure: function() { var me = this;
        $("#" + me.pre + "menu1_link_structure").click(function (e) {
           //e.preventDefault();
           var url = me.getLinkToStructureSummary(true);

           //me.exportState();
           window.open(url, '_blank');
        });
    },

    clickMenu1_link_bind: function() { var me = this;
        $("#" + me.pre + "menu1_link_bind").click(function (e) {
           //e.preventDefault();

           url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + me.inputid;
           me.setLogCommand("link to 3D protein structures bound to CID " + me.inputid + ": " + url, false);

           window.open(url, '_blank');
        });
    },

    clickMenu1_link_vast: function() { var me = this;
        $("#" + me.pre + "menu1_link_vast").click(function (e) {
           //e.preventDefault();

           if(me.inputid === undefined) {
                   url = "https://www.ncbi.nlm.nih.gov/pccompound?term=" + me.icn3d.moleculeTitle;
                   me.setLogCommand("link to compounds " + me.icn3d.moleculeTitle + ": " + url, false);
           }
           else {
               if(me.cfg.cid !== undefined) {
                       url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_pccompound_3d&from_uid=" + me.inputid;
                       me.setLogCommand("link to compounds with structure similar to CID " + me.inputid + ": " + url, false);
               }
               else {
                   var idArray = me.inputid.split('_');

                   var url;
                   if(idArray.length === 1) {
                       url = "https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=" + me.inputid;
                       me.setLogCommand("link to structures similar to " + me.inputid + ": " + url, false);
                   }
                   else if(idArray.length === 2) {
                       url = "https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=" + idArray[0];
                       me.setLogCommand("link to structures similar to " + idArray[0] + ": " + url, false);
                   }
               }

               window.open(url, '_blank');
           }
        });
    },

    clickMenu1_link_pubmed: function() { var me = this;
        $("#" + me.pre + "menu1_link_pubmed").click(function (e) {
           //e.preventDefault();

           var url;
           if(me.inputid === undefined) {
               var url;
               url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + me.icn3d.moleculeTitle;
               me.setLogCommand("link to literature about " + me.icn3d.moleculeTitle + ": " + url, false);

               window.open(url, '_blank');
           }
           else if(me.pmid !== undefined) {
               var idArray = me.pmid.toString().split('_');

               var url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/" + me.pmid;
                   me.setLogCommand("link to PubMed ID " + me.pmid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   me.setLogCommand("link to PubMed IDs " + idArray[0] + ", " + idArray[1] + ": " + url, false);
               }

               window.open(url, '_blank');
           }
           else if(isNaN(me.inputid)) {
               var idArray = me.inputid.toString().split('_');

               var url;
               if(idArray.length === 1) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + me.inputid;
                   me.setLogCommand("link to literature about PDB " + me.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url = "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + idArray[0] + " OR " + idArray[1];
                   me.setLogCommand("link to literature about PDB " + idArray[0] + " OR " + idArray[1] + ": " + url, false);
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

    // menu 2
    clickMenu2_selectresidues: function() { var me = this;
        $("#" + me.pre + "menu2_selectresidues").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');
        });
    },

    clickMenu2_selectall: function() { var me = this;
        $("#" + me.pre + "menu2_selectall").add("#" + me.pre + "selectall").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("select all", true);

           me.selectAll();
        });
    },

    clickMenu2_selectcomplement: function() { var me = this;
        $("#" + me.pre + "menu2_selectcomplement").click(function (e) {
           //e.preventDefault();

           if(Object.keys(me.icn3d.highlightAtoms).length < Object.keys(me.icn3d.atoms).length) {
               me.setLogCommand("select complement", true);

               me.selectComplement();
           }
        });
    },

    clickMenu2_alignment: function() { var me = this;
        $("#" + me.pre + "menu2_alignment").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clickMenu2_command: function() { var me = this;
        $("#" + me.pre + "menu2_command").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_command', 'Advanced set selection');
        });
    },

    clickMenu2_pickingNo: function() { var me = this;
        $("#" + me.pre + "menu2_pickingNo").click(function (e) {
           //e.preventDefault();

           //setOption('picking', 'no');
           me.icn3d.picking = 0;
           me.icn3d.options['picking'] = 'no';
           me.setLogCommand('set picking off', true);

           me.icn3d.draw();
           me.icn3d.removeHighlightObjects();
        });
    },

    clickMenu2_pickingYes: function() { var me = this;
        $("#" + me.pre + "menu2_pickingYes").click(function (e) {
           //e.preventDefault();

           //setOption('picking', 'yes');
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.setLogCommand('set picking atom', true);
        });
    },

    clickMenu2_pickingResidue: function() { var me = this;
        $("#" + me.pre + "menu2_pickingResidue").click(function (e) {
           //e.preventDefault();

           //setOption('picking', 'yes');
           me.icn3d.picking = 2;
           me.icn3d.options['picking'] = 'residue';
           me.setLogCommand('set picking residue', true);
        });
    },

    clickMenu2_pickingStrand: function() { var me = this;
        $("#" + me.pre + "menu2_pickingStrand").click(function (e) {
           //e.preventDefault();

           //setOption('picking', 'yes');
           me.icn3d.picking = 3;
           me.icn3d.options['picking'] = 'strand';
           me.setLogCommand('set picking strand', true);
        });
    },

    clickMenu2_aroundsphere: function() { var me = this;
        $("#" + me.pre + "menu2_aroundsphere").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_aroundsphere', 'Select a sphere around current selection');
        });
    },

    clickMenu2_select_chain: function() { var me = this;
        $("#" + me.pre + "menu2_select_chain").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_select_chain', 'Select Structure/Chain/Custom Selection');
        });
    },

    // menu 3
    clickmenu3_proteinsRibbon: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsRibbon").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'ribbon');
           me.setLogCommand('style proteins ribbon', true);
        });
    },

    clickmenu3_proteinsStrand: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsStrand").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'strand');

           me.setLogCommand('style proteins strand', true);
        });
    },

    clickmenu3_proteinsCylinder: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsCylinder").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'cylinder and plate');
           me.setLogCommand('style proteins cylinder and plate', true);
        });
    },

    clickMenu3_proteinsSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsSchematic").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'schematic');
           me.setLogCommand('style proteins schematic', true);
        });
    },

    clickmenu3_proteinsCalpha: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsCalpha").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'c alpha trace');
           me.setLogCommand('style proteins c alpha trace', true);
        });
    },

    clickmenu3_proteinsBfactor: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsBfactor").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'b factor tube');
           me.setLogCommand('style proteins b factor tube', true);
        });
    },

    clickmenu3_proteinsLines: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsLines").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'lines');
           me.setLogCommand('style proteins lines', true);
        });
    },

    clickmenu3_proteinsStick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsStick").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'stick');
           me.setLogCommand('style proteins stick', true);
        });
    },

    clickmenu3_proteinsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsBallstick").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'ball and stick');
           me.setLogCommand('style proteins ball and stick', true);
        });
    },

    clickmenu3_proteinsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'sphere');
           me.setLogCommand('style proteins sphere', true);
        });
    },

    clickmenu3_proteinsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('proteins', 'nothing');
           me.setLogCommand('style proteins nothing', true);
        });
    },


    clickMenu3_sidechainsLines: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsLines").click(function (e) {
           //e.preventDefault();

           me.setStyle('sidechains', 'lines');
           me.setLogCommand('style sidechains lines', true);
        });
    },

    clickMenu3_sidechainsStick: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsStick").click(function (e) {
           //e.preventDefault();

           me.setStyle('sidechains', 'stick');
           me.setLogCommand('style sidechains stick', true);
        });
    },

    clickMenu3_sidechainsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsBallstick").click(function (e) {
           //e.preventDefault();

           me.setStyle('sidechains', 'ball and stick');
           me.setLogCommand('style sidechains ball and stick', true);
        });
    },

    clickMenu3_sidechainsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('sidechains', 'sphere');
           me.setLogCommand('style sidechains sphere', true);
        });
    },

    clickMenu3_sidechainsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('sidechains', 'nothing');
           me.setLogCommand('style sidechains nothing', true);
        });
    },


    clickmenu3_nuclCartoon: function() { var me = this;
        $("#" + me.pre + "menu3_nuclCartoon").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'nucleotide cartoon');
           me.setLogCommand('style nucleotides nucleotide cartoon', true);
        });
    },

    clickmenu3_nuclSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_nuclSchematic").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'schematic');
           me.setLogCommand('style nucleotides schematic', true);
        });
    },

    clickmenu3_nuclPhos: function() { var me = this;
        $("#" + me.pre + "menu3_nuclPhos").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'phosphorus trace');
           me.setLogCommand('style nucleotides phosphorus trace', true);
        });
    },

    clickmenu3_nuclLines: function() { var me = this;
        $("#" + me.pre + "menu3_nuclLines").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'lines');
           me.setLogCommand('style nucleotides lines', true);
        });
    },

    clickmenu3_nuclStick: function() { var me = this;
        $("#" + me.pre + "menu3_nuclStick").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'stick');
           me.setLogCommand('style nucleotides stick', true);
        });
    },

    clickmenu3_nuclBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_nuclBallstick").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'ball and stick');
           me.setLogCommand('style nucleotides ball and stick', true);
        });
    },

    clickmenu3_nuclSphere: function() { var me = this;
        $("#" + me.pre + "menu3_nuclSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'sphere');
           me.setLogCommand('style nucleotides sphere', true);
        });
    },

    clickmenu3_nuclNothing: function() { var me = this;
        $("#" + me.pre + "menu3_nuclNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('nucleotides', 'nothing');
           me.setLogCommand('style nucleotides nothing', true);
        });
    },

    clickMenu3_ligandsLines: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsLines").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'lines');
           me.setLogCommand('style ligands lines', true);
        });
    },

    clickMenu3_ligandsStick: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsStick").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'stick');
           me.setLogCommand('style ligands stick', true);
        });
    },

    clickMenu3_ligandsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsBallstick").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'ball and stick');
           me.setLogCommand('style ligands ball and stick', true);
        });
    },

    clickMenu3_ligandsSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsSchematic").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'schematic');
           me.setLogCommand('style ligands schematic', true);
        });
    },

    clickMenu3_ligandsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'sphere');
           me.setLogCommand('style ligands sphere', true);
        });
    },

    clickMenu3_ligandsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('ligands', 'nothing');
           me.setLogCommand('style ligands nothing', true);
        });
    },

    clickMenu3_ionsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_ionsSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('ions', 'sphere');
           me.setLogCommand('style ions sphere', true);
        });
    },

    clickMenu3_ionsDot: function() { var me = this;
        $("#" + me.pre + "menu3_ionsDot").click(function (e) {
           //e.preventDefault();

           me.setStyle('ions', 'dot');
           me.setLogCommand('style ions dot', true);
        });
    },

    clickMenu3_ionsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_ionsNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('ions', 'nothing');
           me.setLogCommand('style ions nothing', true);
        });
    },

    clickMenu3_waterSphere: function() { var me = this;
        $("#" + me.pre + "menu3_waterSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('water', 'sphere');
           me.setLogCommand('style water sphere', true);
        });
    },

    clickMenu3_waterDot: function() { var me = this;
        $("#" + me.pre + "menu3_waterDot").click(function (e) {
           //e.preventDefault();

           me.setStyle('water', 'dot');
           me.setLogCommand('style water dot', true);
        });
    },

    clickMenu3_waterNothing: function() { var me = this;
        $("#" + me.pre + "menu3_waterNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('water', 'nothing');
           me.setLogCommand('style water nothing', true);
        });
    },

    // menu 4
    clickMenu4_colorSpectrum: function() { var me = this;
        $("#" + me.pre + "menu4_colorSpectrum").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'spectrum');
           me.setLogCommand('color spectrum', true);
        });
    },

    clickMenu4_colorChain: function() { var me = this;
        $("#" + me.pre + "menu4_colorChain").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'chain');
           me.setLogCommand('color chain', true);
        });
    },

    clickMenu4_colorSS: function() { var me = this;
        $("#" + me.pre + "menu4_colorSS").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'secondary structure');
           me.setLogCommand('color secondary structure', true);
        });
    },

/*
    clickMenu4_colorBfactor: function() { var me = this;
        $("#" + me.pre + "menu4_colorBfactor").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'b factor');
           me.setLogCommand('color b factor', true);
        });
    },
*/

    clickMenu4_colorResidue: function() { var me = this;
        $("#" + me.pre + "menu4_colorResidue").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'residue');
           me.setLogCommand('color residue', true);
        });
    },

    clickMenu4_colorCharge: function() { var me = this;
        $("#" + me.pre + "menu4_colorCharge").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'charge');
           me.setLogCommand('color charge', true);
        });
    },

    clickMenu4_colorHydrophobic: function() { var me = this;
        $("#" + me.pre + "menu4_colorHydrophobic").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'hydrophobic');
           me.setLogCommand('color hydrophobic', true);
        });
    },

    clickMenu4_colorAtom: function() { var me = this;
        $("#" + me.pre + "menu4_colorAtom").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'atom');
           me.setLogCommand('color atom', true);
        });
    },

    clickMenu4_colorConserved: function() { var me = this;
        $("#" + me.pre + "menu4_colorConserved").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'conserved');
           me.setLogCommand('color conserved', true);
        });
    },

    clickMenu4_colorRed: function() { var me = this;
        $("#" + me.pre + "menu4_colorRed").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'red');
           me.setLogCommand('color red', true);
        });
    },

    clickMenu4_colorGreen: function() { var me = this;
        $("#" + me.pre + "menu4_colorGreen").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'green');
           me.setLogCommand('color green', true);
        });
    },

    clickMenu4_colorBlue: function() { var me = this;
        $("#" + me.pre + "menu4_colorBlue").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'blue');
           me.setLogCommand('color blue', true);
        });
    },

    clickMenu4_colorMagenta: function() { var me = this;
        $("#" + me.pre + "menu4_colorMagenta").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'magenta');
           me.setLogCommand('color magenta', true);
        });
    },

    clickMenu4_colorYellow: function() { var me = this;
        $("#" + me.pre + "menu4_colorYellow").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'yellow');
           me.setLogCommand('color yellow', true);
        });
    },

    clickMenu4_colorCyan: function() { var me = this;
        $("#" + me.pre + "menu4_colorCyan").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'cyan');
           me.setLogCommand('color cyan', true);
        });
    },

    clickMenu4_colorWhite: function() { var me = this;
        $("#" + me.pre + "menu4_colorWhite").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'white');
           me.setLogCommand('color white', true);
        });
    },

    clickMenu4_colorGrey: function() { var me = this;
        $("#" + me.pre + "menu4_colorGrey").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'grey');
           me.setLogCommand('color grey', true);
        });
    },

    clickMenu4_colorCustom: function() { var me = this;
        $("#" + me.pre + "menu4_colorCustom").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_color', 'Choose custom color');
        });
    },

    // menu 5
    clickMenu5_neighborsYes: function() { var me = this;
        $("#" + me.pre + "menu5_neighborsYes").click(function (e) {
           //e.preventDefault();

           me.icn3d.bConsiderNeighbors = true;

           me.icn3d.removeLastSurface();
           //me.icn3d.draw();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCommand('set surface neighbors on', true);
        });
    },

    clickMenu5_neighborsNo: function() { var me = this;
        $("#" + me.pre + "menu5_neighborsNo").click(function (e) {
           //e.preventDefault();

           me.icn3d.bConsiderNeighbors = false;

           me.icn3d.removeLastSurface();
           //me.icn3d.draw();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCommand('set surface neighbors off', true);
        });
    },

    clickMenu5_surfaceVDW: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceVDW").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'Van der Waals surface');
           me.setLogCommand('set surface Van der Waals surface', true);
        });
    },

/*
    clickMenu5_surfaceSES: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceSES").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'solvent excluded surface');
           me.setLogCommand('set surface solvent excluded surface', true);
        });
    },
*/
    clickMenu5_surfaceSAS: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceSAS").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'solvent accessible surface');
           me.setLogCommand('set surface solvent accessible surface', true);
        });
    },

    clickMenu5_surfaceMolecular: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceMolecular").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'molecular surface');
           me.setLogCommand('set surface molecular surface', true);
        });
    },

    clickMenu5_surfaceNothing: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceNothing").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'nothing');
           me.setLogCommand('set surface nothing', true);
        });
    },

    clickMenu5_opacity10: function() { var me = this;
        $("#" + me.pre + "menu5_opacity10").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '1.0');
           me.setLogCommand('set surface opacity 1.0', true);
        });
    },

    clickMenu5_opacity09: function() { var me = this;
        $("#" + me.pre + "menu5_opacity09").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '0.9');
           me.setLogCommand('set surface opacity 0.9', true);
        });
    },

    clickMenu5_opacity08: function() { var me = this;
        $("#" + me.pre + "menu5_opacity08").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '0.8');
           me.setLogCommand('set surface opacity 0.8', true);
        });
    },

    clickMenu5_opacity07: function() { var me = this;
        $("#" + me.pre + "menu5_opacity07").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '0.7');
           me.setLogCommand('set surface opacity 0.7', true);
        });
    },

    clickMenu5_opacity06: function() { var me = this;
        $("#" + me.pre + "menu5_opacity06").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '0.6');
           me.setLogCommand('set surface opacity 0.6', true);
        });
    },

    clickMenu5_opacity05: function() { var me = this;
        $("#" + me.pre + "menu5_opacity05").click(function (e) {
           //e.preventDefault();

           me.setOption('opacity', '0.5');
           me.setLogCommand('set surface opacity 0.5', true);
        });
    },

    clickMenu5_wireframeYes: function() { var me = this;
        $("#" + me.pre + "menu5_wireframeYes").click(function (e) {
           //e.preventDefault();

           me.setOption('wireframe', 'yes');
           me.setLogCommand('set surface wireframe on', true);
        });
    },

    clickMenu5_wireframeNo: function() { var me = this;
        $("#" + me.pre + "menu5_wireframeNo").click(function (e) {
           //e.preventDefault();

           me.setOption('wireframe', 'no');
           me.setLogCommand('set surface wireframe off', true);
        });
    },

    // menu 6
    clickMenu6_assemblyYes: function() { var me = this;
        $("#" + me.pre + "menu6_assemblyYes").click(function (e) {
           //e.preventDefault();

           me.icn3d.bAssembly = true;
           me.setLogCommand('set assembly on', true);
           me.icn3d.draw();
        });
    },

    clickMenu6_assemblyNo: function() { var me = this;
        $("#" + me.pre + "menu6_assemblyNo").click(function (e) {
           //e.preventDefault();

           me.icn3d.bAssembly = false;
           me.setLogCommand('set assembly off', true);
           me.icn3d.draw();
        });
    },

    clickMenu6_addlabelResidues: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelResidues").click(function (e) {
           //e.preventDefault();
           //me.icn3d.options['labels'] = 'yes';

           me.setLogCommand('add residue labels', true);

           me.icn3d.addResiudeLabels(me.icn3d.highlightAtoms);

             me.saveSelectionIfSelected();
           me.icn3d.draw();
        });
    },

    clickMenu6_addlabelYes: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelYes").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_addlabel', 'Add custom labels by picking');
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pickedatomNum = 0;
        });
    },

    clickMenu6_addlabelSelection: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelSelection").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_addlabelselection', 'Add custom labels by the current selection');
        });
    },

    clickMenu6_addlabelNo: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelNo").click(function (e) {
           //e.preventDefault();

           //me.icn3d.picking = 1;
           me.icn3d.pickpair = false;
           //me.icn3d.pickedatomNum = 0;

            //me.icn3d.options["labels"] = "no";

            me.icn3d.labels['residue'] = [];
            me.icn3d.labels['custom'] = [];

           var select = "set labels off";
           me.setLogCommand(select, true);

           for(var name in me.icn3d.labels) {
               if(name === 'residue' || name === 'custom') {
                   me.icn3d.labels[name] = [];
               }
           }

            me.icn3d.draw();

        });
    },

    clickMenu6_distanceYes: function() { var me = this;
        $("#" + me.pre + "menu6_distanceYes").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_distance', 'Measure the distance of atoms');
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pickedatomNum = 0;
        });
    },

    clickMenu6_distanceNo: function() { var me = this;
        $("#" + me.pre + "menu6_distanceNo").click(function (e) {
           //e.preventDefault();

           //me.icn3d.picking = 1;
           me.icn3d.pickpair = false;
           //me.icn3d.pickedatomNum = 0;

            //me.icn3d.options["lines"] = "no";

           var select = "set lines off";
           me.setLogCommand(select, true);

            me.icn3d.labels['distance'] = [];
            me.icn3d.lines['distance'] = [];

            me.icn3d.draw();
        });
    },

    clickMenu6_selectedcenter: function() { var me = this;
        $("#" + me.pre + "menu6_selectedcenter").add("#" + me.pre + "zoomin_selection").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('zoom selection', true);

           me.icn3d.zoominSelection();
        });
    },

    clickMenu6_center: function() { var me = this;
        $("#" + me.pre + "menu6_center").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('center selection', true);

           me.icn3d.centerSelection();
        });
    },

    clickMenu6_resetorientation: function() { var me = this;
        $("#" + me.pre + "menu6_resetorientation").add("#" + me.pre + "resetorientation").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('reset orientation', true);

           me.icn3d.resetOrientation();
        });
    },


    clickMenu6_rotateleft: function() { var me = this;
        $("#" + me.pre + "menu6_rotateleft").click(function (e) {
           //e.preventDefault();
           me.setLogCommand('rotate left', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROTATION_DIRECTION = 'left';

           me.rotateStructure('left');
        });
    },

    clickMenu6_rotateright: function() { var me = this;
        $("#" + me.pre + "menu6_rotateright").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate right', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROTATION_DIRECTION = 'right';

           me.rotateStructure('right');
        });
    },

    clickMenu6_rotateup: function() { var me = this;
        $("#" + me.pre + "menu6_rotateup").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate up', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROTATION_DIRECTION = 'up';

           me.rotateStructure('up');
        });
    },

    clickMenu6_rotatedown: function() { var me = this;
        $("#" + me.pre + "menu6_rotatedown").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate down', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROTATION_DIRECTION = 'down';

           me.rotateStructure('down');
        });
    },

    clickMenu6_cameraPers: function() { var me = this;
        $("#" + me.pre + "menu6_cameraPers").click(function (e) {
           //e.preventDefault();

           me.setOption('camera', 'perspective');
           me.setLogCommand('set camera perspective', true);
        });
    },

    clickMenu6_cameraOrth: function() { var me = this;
        $("#" + me.pre + "menu6_cameraOrth").click(function (e) {
           //e.preventDefault();

           me.setOption('camera', 'orthographic');
           me.setLogCommand('set camera orthographic', true);
        });
    },

    clickMenu6_bkgdBlack: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdBlack").click(function (e) {
           //e.preventDefault();

           me.setOption('background', 'black');
           me.setLogCommand('set background black', true);
        });
    },

    clickMenu6_bkgdGrey: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdGrey").click(function (e) {
           //e.preventDefault();

           me.setOption('background', 'grey');
           me.setLogCommand('set background grey', true);
        });
    },

    clickMenu6_bkgdWhite: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdWhite").click(function (e) {
           //e.preventDefault();

           me.setOption('background', 'white');
           me.setLogCommand('set background white', true);
        });
    },

    clickMenu6_showfogYes: function() { var me = this;
        $("#" + me.pre + "menu6_showfogYes").click(function (e) {
           //e.preventDefault();

           me.setOption('fog', 'yes');
           me.setLogCommand('set fog on', true);
        });
    },

    clickMenu6_showfogNo: function() { var me = this;
        $("#" + me.pre + "menu6_showfogNo").click(function (e) {
           //e.preventDefault();

           me.setOption('fog', 'no');
           me.setLogCommand('set fog off', true);
        });
    },

    clickMenu6_showslabYes: function() { var me = this;
        $("#" + me.pre + "menu6_showslabYes").click(function (e) {
           //e.preventDefault();

           me.setOption('slab', 'yes');
           me.setLogCommand('set slab on', true);
        });
    },

    clickMenu6_showslabNo: function() { var me = this;
        $("#" + me.pre + "menu6_showslabNo").click(function (e) {
           //e.preventDefault();

           me.setOption('slab', 'no');
           me.setLogCommand('set slab off', true);
        });
    },

    clickMenu6_showaxisYes: function() { var me = this;
        $("#" + me.pre + "menu6_showaxisYes").click(function (e) {
           //e.preventDefault();

           me.setOption('axis', 'yes');
           me.setLogCommand('set axis on', true);
        });
    },

    clickMenu6_showaxisNo: function() { var me = this;
        $("#" + me.pre + "menu6_showaxisNo").click(function (e) {
           //e.preventDefault();

           me.setOption('axis', 'no');
           me.setLogCommand('set axis off', true);
        });
    },

    clickMenu6_hbondsYes: function() { var me = this;
        $("#" + me.pre + "menu6_hbondsYes").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_hbonds', 'Hydrogen bonds to selection');
        });
    },

    clickMenu6_hbondsNo: function() { var me = this;
        $("#" + me.pre + "menu6_hbondsNo").click(function (e) {
           //e.preventDefault();

            me.icn3d.options["hbonds"] = "no";
            //me.icn3d.options["lines"] = "no";

           var select = "set hbonds off";
           me.setLogCommand(select, true);

            me.icn3d.lines['hbond'] = [];

            me.icn3d.draw();
        });
    },

    // other
    selectSequenceNonMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").selectable({
          stop: function() {
              // reset original color
              //me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);
              var bAlign = false

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              if(me.bSelectResidue === false) {
                  me.removeSeqChainBkgd();
                  me.removeSeqResidueBkgd();

                  me.selectedResidues = {};
                  me.icn3d.highlightAtoms = {};

                  me.icn3d.removeHighlightObjects();
              }

              // select residues
              $(".ui-selected", this).each(function() {
                  var id = $(this).attr('id');
                  if(id !== undefined && id !== '') {
                    // add "align" in front of id so that full sequence and aligned sequence will not conflict
                    if(id.substr(0, 5) === 'align') id = id.substr(5);

                    me.bSelectResidue = true;

                    $(this).toggleClass('icn3d-highlightSeq');

                    var residueid = id.substr(id.indexOf('_') + 1);
                    if($(this).hasClass('icn3d-highlightSeq')) {
                      for(var j in me.icn3d.residues[residueid]) {
                        me.icn3d.highlightAtoms[j] = 1;
                      }
                      me.selectedResidues[residueid] = 1;
                    }
                    else {
                        for (var i in me.icn3d.residues[residueid]) {
                          me.icn3d.highlightAtoms[i] = undefined;
                        }
                        me.selectedResidues[residueid] = undefined;

                        me.icn3d.removeHighlightObjects();
                    }
                  }
              });

              me.icn3d.addHighlightObjects();

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select annotation title
              $(".ui-selected", this).each(function() {
                  var currChain = $(this).attr('chain');
                  if($(this).hasClass('icn3d-seqTitle')) {
                    me.bSelectResidue = false;
                    ////me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);
                    //me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)), true);

                    me.removeSeqChainBkgd(currChain);
                    me.removeSeqResidueBkgd();

                    $(this).toggleClass('icn3d-highlightSeq');

                    var chainid = $(this).attr('chain');
                    //var commandname = "seq_" + $(this).text().trim();
                    var commandname = chainid;

                    if($(this).hasClass('icn3d-highlightSeq')) {
                        var command = 'select chain ' + chainid;
                        me.selectAChain(chainid, commandname);
                        me.setLogCommand(command, true);
                    }
                    else {
                        me.icn3d.removeHighlightObjects();

                        me.icn3d.highlightAtoms = {};

                       $("#" + me.pre + "customResidues").val("");
                       $("#" + me.pre + "customResidues2").val("");
                       $("#" + me.pre + "customAtoms").val("");
                    }
                  }
              });

          }
      });

      $("#" + me.pre + "dl_sequence2").selectable({
          stop: function() {
              // reset original color
              //me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              if(me.bSelectAlignResidue === false) {
                  me.removeSeqChainBkgd();
                  me.removeSeqResidueBkgd();

                  me.selectedResidues = {};
                  me.icn3d.highlightAtoms = {};

                  me.icn3d.removeHighlightObjects();
              }

              // select residues
              $(".ui-selected", this).each(function() {
                  var id = $(this).attr('id');
                  if(id !== undefined && id !== '') {
                    // add "align" in front of id so that full sequence and aligned sequence will not conflict
                    if(id.substr(0, 5) === 'align') id = id.substr(5);

                    me.bSelectAlignResidue = true;

                    $(this).toggleClass('icn3d-highlightSeq');

                    var residueid = id.substr(id.indexOf('_') + 1);
                    if($(this).hasClass('icn3d-highlightSeq')) {
                      //me.selectAResidue(residueid, me.commandname);
                      for(var j in me.icn3d.residues[residueid]) {
                        me.icn3d.highlightAtoms[j] = 1;
                      }
                      me.selectedResidues[residueid] = 1;
                    }
                    else {
                      for(var j in me.icn3d.residues[residueid]) {
                        me.icn3d.highlightAtoms[j] = undefined;
                      }
                      me.selectedResidues[residueid] = undefined;

                      me.icn3d.removeHighlightObjects();
                    }
                  }
              });

              me.icn3d.addHighlightObjects();

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select annotation title
              $(".ui-selected", this).each(function() {
                  var currChain = $(this).attr('chain');
                  if($(this).hasClass('icn3d-seqTitle')) {
                    me.bSelectAlignResidue = false;
                    //me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)), true);

                    me.removeSeqChainBkgd(currChain);
                    me.removeSeqResidueBkgd();

                    $(this).toggleClass('icn3d-highlightSeq');

                    var chainid = $(this).attr('chain');
                    //var commanddesc = "alignSeq_" + $(this).text().trim();
                    var commanddesc = "align_" + chainid;

                    if($(this).hasClass('icn3d-highlightSeq')) {
                        me.selectAAlignChain(chainid, commanddesc);
                        me.setLogCommand('select alignChain ' + chainid, true);
                    }
                    else {
                        me.icn3d.removeHighlightObjects();

                        me.icn3d.highlightAtoms = {};

                       $("#" + me.pre + "customResidues").val("");
                       $("#" + me.pre + "customResidues2").val("");
                       $("#" + me.pre + "customAtoms").val("");
                    }
                  }
              });

          }
      });
    },

    selectSequenceMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").on('click', '.icn3d-residue', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

          // select residues
          //$(".ui-selected", this).each(function() {
              var id = $(this).attr('id');

              if(id !== undefined && id !== '') {
                  // add "align" in front of id so that full sequence and aligned sequence will not conflict
                  if(id.substr(0, 5) === 'align') id = id.substr(5);

                  if(me.bSelectResidue === false) {
                      me.removeSeqChainBkgd();
                      me.removeSeqResidueBkgd();

                      me.selectedResidues = {};
                      me.icn3d.highlightAtoms = {};

                      me.icn3d.removeHighlightObjects();

                      me.bSelectResidue = true;
                  }

                $(this).toggleClass('icn3d-highlightSeq');

                var residueid = id.substr(id.indexOf('_') + 1);
                if($(this).hasClass('icn3d-highlightSeq')) {
                  //me.selectAResidue(residueid, me.commandname);
                  for(var j in me.icn3d.residues[residueid]) {
                    me.icn3d.highlightAtoms[j] = 1;
                  }

                  me.selectedResidues[residueid] = 1;
                }
                else {
                  for(var j in me.icn3d.residues[residueid]) {
                    me.icn3d.highlightAtoms[j] = undefined;
                  }

                  me.selectedResidues[residueid] = undefined;

                  me.icn3d.removeHighlightObjects();
                }
              }
          //});

          //var options2 = {};
          //options2['color'] = 'custom';

          //me.icn3d.draw(options2, false);
          me.icn3d.addHighlightObjects();
      });

      $("#" + me.pre + "dl_sequence2").on('click', '.icn3d-residue', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

          // select residues
          //$(".ui-selected", this).each(function() {
              var id = $(this).attr('id');

              if(id !== undefined && id !== '') {
                  // add "align" in front of id so that full sequence and aligned sequence will not conflict
                  if(id.substr(0, 5) === 'align') id = id.substr(5);

                  if(me.bSelectAlignResidue === false) {
                      me.removeSeqChainBkgd();
                      me.removeSeqResidueBkgd();

                      me.selectedResidues = {};
                      me.icn3d.highlightAtoms = {};

                      me.icn3d.removeHighlightObjects();

                      me.bSelectAlignResidue = true;
                  }

                $(this).toggleClass('icn3d-highlightSeq');

                var residueid = id.substr(id.indexOf('_') + 1);
                if($(this).hasClass('icn3d-highlightSeq')) {
                  //me.selectAResidue(residueid, me.commandname);
                  for(var j in me.icn3d.residues[residueid]) {
                    me.icn3d.highlightAtoms[j] = 1;
                  }

                  me.selectedResidues[residueid] = 1;
                }
                else {
                  for(var j in me.icn3d.residues[residueid]) {
                    me.icn3d.highlightAtoms[j] = undefined;
                  }

                  me.selectedResidues[residueid] = undefined;

                  me.icn3d.removeHighlightObjects();
                }
              }
          //});

          //var options2 = {};
          //options2['color'] = 'custom';

          //me.icn3d.draw(options2, false);
          me.icn3d.addHighlightObjects();
      });
    },

    selectChainMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").on('click', '.icn3d-seqTitle', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

            var currChain = $(this).attr('chain');

            me.bSelectResidue = false;
            //me.setLogCommand('select ' + Object.keys(me.selectedResidues), true);

            me.removeSeqChainBkgd(currChain);
            me.removeSeqResidueBkgd();

            // select annotation title
            $(this).toggleClass('icn3d-highlightSeq');

            var chainid = $(this).attr('chain');
            //var commandname = "seq_" + $(this).text().trim();
            var commandname = chainid;

            if($(this).hasClass('icn3d-highlightSeq')) {
                var command = 'select chain ' + chainid;
                me.selectAChain(chainid, commandname);
                me.setLogCommand(command, true);
            }
            else {
                me.icn3d.removeHighlightObjects();

                me.icn3d.highlightAtoms = {};

               $("#" + me.pre + "customResidues").val("");
               $("#" + me.pre + "customResidues2").val("");
               $("#" + me.pre + "customAtoms").val("");
            }
      });

      $("#" + me.pre + "dl_sequence2").on('click', '.icn3d-seqTitle', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

            var currChain = $(this).attr('chain');

            me.bSelectAlignResidue = false;

            me.removeSeqChainBkgd(currChain);
            me.removeSeqResidueBkgd();

            // select annotation title
            $(this).toggleClass('icn3d-highlightSeq');

            var chainid = $(this).attr('chain');
            //var commanddesc = "alignSeq_" + $(this).text().trim();
            var commanddesc = "align_" + chainid;

            if($(this).hasClass('icn3d-highlightSeq')) {
                me.selectAAlignChain(chainid, commanddesc);
                me.setLogCommand('select alignChain ' + chainid, true);
            }
            else {
                me.icn3d.removeHighlightObjects();

                me.icn3d.highlightAtoms = {};

               $("#" + me.pre + "customResidues").val("");
               $("#" + me.pre + "customResidues2").val("");
               $("#" + me.pre + "customAtoms").val("");
            }
      });
    },

    clickStructureid: function() { var me = this;
        $("#" + me.pre + "structureid").change(function(e) {
           //e.preventDefault();

           var moleculeArray = $(this).val();
           $("#" + me.pre + "structureid2").val("");

           me.changeStructureid(moleculeArray);
        });

        $("#" + me.pre + "structureid2").change(function(e) {
           //e.preventDefault();

           var moleculeArray = $(this).val();
           $("#" + me.pre + "structureid").val("");

           me.changeStructureid(moleculeArray);
        });

        $("#" + me.pre + "structureid").focus(function(e) {
           //e.preventDefault();
           if(me.isMobile()) { // mobile has some problem in selecting
               $("#" + me.pre + "structureid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "structureid option").length);
        });

        $("#" + me.pre + "structureid").blur(function(e) {
           //e.preventDefault();
           $(this).attr('size', 1);
        });
    },

    clickChainid: function() { var me = this;
        $("#" + me.pre + "chainid").change(function(e) {
           //e.preventDefault();

           var chainArray = $(this).val();
           $("#" + me.pre + "chainid2").val("");

           me.changeChainid(chainArray);
        });

        $("#" + me.pre + "chainid2").change(function(e) {
           //e.preventDefault();

           var chainArray = $(this).val();
           $("#" + me.pre + "chainid").val("");

           me.changeChainid(chainArray);
        });

        $("#" + me.pre + "chainid").focus(function(e) {
           //e.preventDefault();
           if(me.isMobile()) {
               $("#" + me.pre + "chainid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "chainid option").length);
        });

        $("#" + me.pre + "chainid").blur(function(e) {
           //e.preventDefault();
           $(this).attr('size', 1);
        });
    },

    clickAlignChainid: function() { var me = this;
        $("#" + me.pre + "alignChainid").change(function(e) {
           //e.preventDefault();

           var alignChainArray = $(this).val();
           $("#" + me.pre + "alignChainid2").val();

           me.changeAlignChainid(alignChainArray);
        });

        $("#" + me.pre + "alignChainid2").change(function(e) {
           //e.preventDefault();

           var alignChainArray = $(this).val();
           $("#" + me.pre + "alignChainid").val();

           me.changeAlignChainid(alignChainArray);
        });

        $("#" + me.pre + "alignChainid").focus(function(e) {
           //e.preventDefault();
           if(me.isMobile()) {
               $("#" + me.pre + "alignChainid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "alignChainid option").length);
        });

        $("#" + me.pre + "alignChainid").blur(function(e) {
           //e.preventDefault();
           $(this).attr('size', 1);
        });
    },

    clickCustomResidues: function() { var me = this;
        $("#" + me.pre + "customResidues").change(function(e) {
           //e.preventDefault();

           var nameArray = $(this).val();
           $("#" + me.pre + "customResidues2").val("");

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved selection ' + nameArray.toString(), true);

             me.changeCustomResidues(nameArray);
           }
        });

        $("#" + me.pre + "customResidues2").change(function(e) {
           //e.preventDefault();

           var nameArray = $(this).val();
           $("#" + me.pre + "customResidues").val("");

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved selection ' + nameArray.toString(), true);

             me.changeCustomResidues(nameArray);
           }
        });

        $("#" + me.pre + "customResidues").focus(function(e) {
           //e.preventDefault();
           if(me.isMobile()) {
               $("#" + me.pre + "customResidues").val("");
           }

           $(this).attr('size', $("#" + me.pre + "customResidues option").length);
        });

        $("#" + me.pre + "customResidues").blur(function(e) {
           //e.preventDefault();
           $(this).attr('size', 1);
        });
    },

    clickCustomAtoms: function() { var me = this;
        $("#" + me.pre + "customAtoms").change(function(e) {
           //e.preventDefault();

           var nameArray = $(this).val();

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved atoms ' + nameArray.toString(), true);

             me.changeCustomAtoms(nameArray);
           }
        });

        $("#" + me.pre + "customAtoms").focus(function(e) {
           //e.preventDefault();
           if(me.isMobile()) $("#" + me.pre + "customAtoms").val("");
        });
    },

    clickShow_selected: function() { var me = this;
        $("#" + me.pre + "show_selected").add("#" + me.pre + "menu2_show_selected").click(function(e) {
    //       e.preventDefault();

           me.setLogCommand("show selection", true);

           me.showSelection();

           //if($("#" + me.pre + "alignChainid").length > 0 && $("#" + me.pre + "alignChainid").val() !== null) {
           //    me.showSelection();
           //}
           //else if($("#" + me.pre + "chainid").val() !== null || $("#" + me.pre + "customResidues").val() !== null) {
           //    me.showSelection("customResidues");
           //}
        });
    },

    clickShow_sequences: function() { var me = this;
        $("#" + me.pre + "show_sequences").click(function(e) {
    //       e.preventDefault();

             me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');
        });
    },

    clickShow_alignsequences: function() { var me = this;
        $("#" + me.pre + "show_alignsequences").click(function(e) {
    //       e.preventDefault();

             me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clickShow_selected_atom: function() { var me = this;
        $("#" + me.pre + "show_selected_atom").click(function(e) {
           e.preventDefault();

           //me.setLogCommand("show saved atoms", true);
           me.setLogCommand("show selection", true);
           //me.showSelection("customAtoms");
           me.showSelection();
        });
    },

    clickCommand_apply: function() { var me = this;
        $("#" + me.pre + "command_apply").click(function(e) {
           e.preventDefault();

           var select = $("#" + me.pre + "command").val();
           //var commandname = $("#" + me.pre + "command_name").val().replace(/[#.:@,;]/g, '_').replace(/\s+/g, '_');
           //var commanddesc = $("#" + me.pre + "command_desc").val().replace(/[#.:@,;]/g, '_').replace(/\s+/g, '_');
           var commandname = $("#" + me.pre + "command_name").val().replace(/;/g, '_').replace(/\s+/g, '_');
           var commanddesc = $("#" + me.pre + "command_desc").val().replace(/;/g, '_').replace(/\s+/g, '_');

           me.setLogCommand('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);

           me.selectByCommand(select, commandname, commanddesc);
        });
    },

    clickReload_pdb: function() { var me = this;
        $("#" + me.pre + "reload_pdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load pdb " + $("#" + me.pre + "pdbid").val(), false);

           // The following pdb info are required: 1. ATOM, 2. HETATM, 3. SHEET, 4. HELIX, 5. CONECT
           //me.downloadPdb($("#" + me.pre + "pdbid").val());

           window.open('http://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
        });
    },

    clickReload_mmcif: function() { var me = this;
        $("#" + me.pre + "reload_mmcif").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);

           //me.downloadMmcif($("#" + me.pre + "mmcifid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcifid=' + $("#" + me.pre + "mmcifid").val(), '_blank');
        });
    },

    clickReload_mmdb: function() { var me = this;
        $("#" + me.pre + "reload_mmdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load mmdb " + $("#" + me.pre + "mmdbid").val(), false);

           //me.downloadMmdb($("#" + me.pre + "mmdbid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmdbid=' + $("#" + me.pre + "mmdbid").val(), '_blank');
        });
    },

    clickReload_gi: function() { var me = this;
        $("#" + me.pre + "reload_gi").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load gi " + $("#" + me.pre + "gi").val(), false);

           //me.downloadMmdb($("#" + me.pre + "mmdbid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');
        });
    },

    clickReload_cid: function() { var me = this;
        $("#" + me.pre + "reload_cid").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load cid " + $("#" + me.pre + "cid").val(), false);

           //me.downloadCid($("#" + me.pre + "cid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?cid=' + $("#" + me.pre + "cid").val(), '_blank');
        });
    },

    clickReload_state: function() { var me = this;
        $("#" + me.pre + "reload_state").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load state file ' + $("#" + me.pre + "state").val(), false);

               me.icn3d.commands = [];
               me.icn3d.optionsHistory = [];

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

               me.setLogCommand('load selection file ' + $("#" + me.pre + "selectionfile").val(), false);

               me.loadSelection(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_pdbfile: function() { var me = this;
        $("#" + me.pre + "reload_pdbfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load pdb file ' + $("#" + me.pre + "pdbfile").val(), false);

               //me.icn3d.bLoadpdbfile= true;
               me.icn3d.moleculeTitle = "";

               me.loadPdbData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_mol2file: function() { var me = this;
        $("#" + me.pre + "reload_mol2file").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load mol2 file ' + $("#" + me.pre + "mol2file").val(), false);

               me.icn3d.moleculeTitle = "";

               me.inputid = undefined;

               //$("#" + me.pre + "menu1_link_vast").hide();

               me.loadMol2Data(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_sdffile: function() { var me = this;
        $("#" + me.pre + "reload_sdffile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load sdf file ' + $("#" + me.pre + "sdffile").val(), false);

               me.icn3d.moleculeTitle = "";
               me.inputid = undefined;
               //$("#" + me.pre + "menu1_link_vast").hide();

               me.loadSdfData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_xyzfile: function() { var me = this;
        $("#" + me.pre + "reload_xyzfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load xyz file ' + $("#" + me.pre + "xyzfile").val(), false);

               me.icn3d.moleculeTitle = "";
               me.inputid = undefined;
               //$("#" + me.pre + "menu1_link_vast").hide();

               me.loadXyzData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_mmciffile: function() { var me = this;
        $("#" + me.pre + "reload_mmciffile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

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

               me.setLogCommand('load mmcif file ' + $("#" + me.pre + "mmciffile").val(), false);

               //me.icn3d.bLoadpdbfile= true;
               me.icn3d.moleculeTitle = "";

               //me.loadPdbData(dataStr);
                var url = "//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

                me.icn3d.bCid = undefined;

               $.ajax({
                  url: url,
                  type: 'POST',
                  data : {'mmciffile': dataStr},
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
             };

             reader.readAsText(file);
           }

        });
    },

    clickApplycustomcolor: function() { var me = this;
        $("#" + me.pre + "applycustomcolor").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           me.setOption("color", $("#" + me.pre + "color").val());
           me.setLogCommand("color " + $("#" + me.pre + "color").val(), true);
        });
    },

    clickApplypick_aroundsphere: function() { var me = this;
        $("#" + me.pre + "applypick_aroundsphere").click(function(e) {
            e.preventDefault();

            dialog.dialog( "close" );
            var radius = $("#" + me.pre + "radius_aroundsphere").val();

               var select = "select zone cutoff " + radius;
               me.setLogCommand(select, true);

               me.pickCustomSphere(radius);
        });
    },

    clickApplyhbonds: function() { var me = this;
        $("#" + me.pre + "applyhbonds").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           var threshold = $("#" + me.pre + "hbondthreshold" ).val();

           var select = "hbonds " + threshold;
           me.setLogCommand(select, true);

           me.showHbonds(threshold);
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
           if(background === '0' || background === '' || background === 'undefined') background = undefined;

           if(me.icn3d.pickedatom === undefined || me.icn3d.pickedatom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             var x = (me.icn3d.pickedatom.coord.x + me.icn3d.pickedatom2.coord.x) / 2;
             var y = (me.icn3d.pickedatom.coord.y + me.icn3d.pickedatom2.coord.y) / 2;
             var z = (me.icn3d.pickedatom.coord.z + me.icn3d.pickedatom2.coord.z) / 2;

             //me.icn3d.options['labels'] = 'yes';

             me.setLogCommand('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);

             me.addLabel(text, x, y, z, size, color, background, 'custom');

    //         me.icn3d.picking = 0;
             me.icn3d.pickpair = false;

             //var options2 = {};
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
           if(background === '0' || background === '' || background === 'undefined') background = undefined;

             var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.highlightAtoms));
             var x = position.center.x;
             var y = position.center.y;
             var z = position.center.z;

             me.setLogCommand('add label ' + text + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);

             me.addLabel(text, x, y, z, size, color, background, 'custom');

             me.icn3d.draw();
        });
    },

    clickApplypick_measuredistance: function() { var me = this;
        $("#" + me.pre + "applypick_measuredistance").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           if(me.icn3d.pickedatom === undefined || me.icn3d.pickedatom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             //me.icn3d.options['labels'] = 'yes';
             //me.icn3d.options['lines'] = 'yes';

             var distance = parseInt(me.icn3d.pickedatom.coord.distanceTo(me.icn3d.pickedatom2.coord) * 10) / 10;

             var text = distance.toString() + " A";

             var size, color, background;

             var x = (me.icn3d.pickedatom.coord.x + me.icn3d.pickedatom2.coord.x) / 2;
             var y = (me.icn3d.pickedatom.coord.y + me.icn3d.pickedatom2.coord.y) / 2;
             var z = (me.icn3d.pickedatom.coord.z + me.icn3d.pickedatom2.coord.z) / 2;

             me.setLogCommand('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type distance', true);

             me.addLabel(text, x, y, z, size, color, background, 'distance');

             var color = "#FFFF00";
             var dashed = true;

             me.setLogCommand('add line | x1 ' + me.icn3d.pickedatom.coord.x  + ' y1 ' + me.icn3d.pickedatom.coord.y + ' z1 ' + me.icn3d.pickedatom.coord.z + ' | x2 ' + me.icn3d.pickedatom2.coord.x  + ' y2 ' + me.icn3d.pickedatom2.coord.y + ' z2 ' + me.icn3d.pickedatom2.coord.z + ' | color ' + color + ' | dashed ' + dashed + ' | type distance', true);

             me.addLine(me.icn3d.pickedatom.coord.x, me.icn3d.pickedatom.coord.y, me.icn3d.pickedatom.coord.z, me.icn3d.pickedatom2.coord.x, me.icn3d.pickedatom2.coord.y, me.icn3d.pickedatom2.coord.z, color, dashed, 'distance');

    //         me.icn3d.picking = 0;
             me.icn3d.pickpair = false;

             //var options2 = {};
             me.icn3d.draw();
           }
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            //e.preventDefault();

            me.setLogCommand("reset", true);

            //reset me.icn3d.maxD
            me.icn3d.maxD = me.icn3d.oriMaxD;
            me.icn3d.center = me.icn3d.oriCenter.clone();

            //location.reload();
            me.icn3d.reinitAfterLoad();

            me.renderFinalStep(1);

            me.removeSeqChainBkgd();
            me.removeSeqResidueBkgd();
        });
    },

    toggleHighlight: function() { var me = this;
    //        e.preventDefault();

            me.setLogCommand("toggle highlight", true);

            if(me.icn3d.prevHighlightObjects.length > 0) { // remove
                me.icn3d.removeHighlightObjects();
                me.icn3d.render();

                me.removeSeqChainBkgd();
                me.removeSeqResidueBkgd();

                me.bSelectResidue = false;
            }
            else { // add
                me.icn3d.addHighlightObjects();
                me.updateSeqWinForCurrentAtoms();

                me.bSelectResidue = true;
                //me.icn3d.applyTransformation(me.icn3d._zoomFactor, me.icn3d.mouseChange, me.icn3d.quaternion);
            }
    },

    clickToggleHighlight: function() { var me = this;
        $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function (e) {
            me.toggleHighlight();
        });

        $(document).on("click", "#" + me.pre + "seq_clearselection", function(e) {
            me.toggleHighlight();
        });

        $(document).on("click", "#" + me.pre + "alignseq_clearselection", function(e) {
            me.toggleHighlight();
        });
    },

    pressCommandtext: function() { var me = this;
        //$("#" + me.pre + "commandtext").keypress(function(e){
        $("#" + me.pre + "logtext").keypress(function(e){
           //e.preventDefault();

           me.bAddLogs = false; // turn off log

           var code = (e.keyCode ? e.keyCode : e.which);

           if(code == 13) { //Enter keycode
              e.preventDefault();

              var dataStr = $(this).val();

              me.icn3d.bRender = true;

              var commandArray = dataStr.split('\n');
              var lastCommand = commandArray[commandArray.length - 1].substr(2); // skip "> "
              me.icn3d.logs.push(lastCommand);
              $("#" + me.pre + "logtext").val("> " + me.icn3d.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);

              if(lastCommand !== '') {
                  var transformation = {};
                  transformation.factor = me.icn3d._zoomFactor;
                  transformation.mouseChange = me.icn3d.mouseChange;
                  transformation.quaternion = me.icn3d.quaternion;
                  //me.icn3d.transformation.push(transformation);

                me.icn3d.commands.push(lastCommand + '|||' + JSON.stringify(transformation));
                me.icn3d.optionsHistory.push(me.icn3d.cloneHash(me.icn3d.options));
                me.icn3d.optionsHistory[me.icn3d.optionsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.highlightAtoms).length;

                if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                me.STATENUMBER = me.icn3d.commands.length;

                me.applyCommand(lastCommand + '|||' + JSON.stringify(transformation));

                  me.saveSelectionIfSelected();
                //me.renderStructure();
                me.icn3d.draw();
              }
           }

           me.bAddLogs = true;
        });
    },

    clickFilter_ckbx_all: function() { var me = this;
        $("#" + me.pre + "filter_ckbx_all").click(function (e) {
           //e.preventDefault();

           var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

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
    },

    clickFilter: function() { var me = this;
        $("#" + me.pre + "filter").click(function (e) {
           //e.preventDefault();

           var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

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

    saveSelection: function() { var me = this;
            me.bSelectResidue = false;
            var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
            var description = $("#" + me.pre + "seq_command_desc").val();

            if(Object.keys(me.selectedResidues).length === 0) {
                for(var i in me.icn3d.highlightAtoms) {
                    var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                    me.selectedResidues[residueid] = 1;
                }
            }

            me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name + ' | description ' + description, true);

            me.selectResidueList(me.selectedResidues, name, description);

            me.updateSelectionNameDesc();
    },

    clickSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "seq_saveselection", function(e) {
        //$("#" + me.pre + "seq_saveselection").click(function (e) {
           //e.preventDefault();

           me.saveSelection();
        });
    },

    clickAlignSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "alignseq_saveselection", function(e) {
        //$("#" + me.pre + "alignseq_saveselection").click(function (e) {
           //e.preventDefault();

            me.bSelectAlignResidue = false;

            var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
            var description = $("#" + me.pre + "alignseq_command_desc").val();

            if(Object.keys(me.selectedResidues).length === 0) {
                for(var i in me.icn3d.highlightAtoms) {
                    var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                    me.selectedResidues[residueid] = 1;
                }
            }

            me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name + ' | description ' + description, true);

            me.selectResidueList(me.selectedResidues, name, description);

            me.updateSelectionNameDesc();
        });
    },

    clickOutputSelection: function() { var me = this;
        $(document).on("click", "." + me.pre + "outputselection", function(e) {
           //e.preventDefault();

            me.bSelectResidue = false;
            me.bSelectAlignResidue = false;
            me.setLogCommand('output selection', true);
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

    // ===== events end
    allEventFunctions: function() { var me = this;
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

        me.clickAlternate();
        me.clickMenu1_pdbid();
        me.clickMenu1_pdbfile();
        me.clickMenu1_mol2file();
        me.clickMenu1_sdffile();
        me.clickMenu1_xyzfile();
        me.clickMenu1_mmciffile();
        me.clickMenu1_mmcifid();
        me.clickMenu1_mmdbid();
        me.clickMenu1_gi();
        me.clickMenu1_cid();
        me.clickMenu1_state();
        me.clickMenu1_selection();
        me.clickMenu1_exportState();
        me.clickMenu1_exportCanvas();
        me.clickMenu1_exportCounts();
        me.clickMenu1_exportSelections();
        me.clickMenu1_sharelink();
        me.clickMenu1_link_structure();
        me.clickMenu1_link_bind();
        me.clickMenu1_link_vast();
        me.clickMenu1_link_pubmed();
        me.clickMenu2_selectresidues();
        me.clickMenu2_selectcomplement();
        me.clickMenu2_selectall();
        me.clickMenu2_alignment();
        me.clickMenu2_command();
        me.clickMenu2_pickingYes();
        me.clickMenu2_pickingNo();
        me.clickMenu2_pickingResidue();
        me.clickMenu2_pickingStrand();
        me.clickMenu2_aroundsphere();
        me.clickMenu2_select_chain();
        me.clickmenu3_proteinsRibbon();
        me.clickmenu3_proteinsStrand();
        me.clickmenu3_proteinsCylinder();
        me.clickMenu3_proteinsSchematic();
        me.clickmenu3_proteinsCalpha();
        me.clickmenu3_proteinsBfactor();
        me.clickmenu3_proteinsLines();
        me.clickmenu3_proteinsStick();
        me.clickmenu3_proteinsBallstick();
        me.clickmenu3_proteinsSphere();
        me.clickmenu3_proteinsNothing();
        me.clickMenu3_sidechainsLines();
        me.clickMenu3_sidechainsStick();
        me.clickMenu3_sidechainsBallstick();
        me.clickMenu3_sidechainsSphere();
        me.clickMenu3_sidechainsNothing();
        me.clickmenu3_nuclCartoon();
        me.clickmenu3_nuclSchematic();
        me.clickmenu3_nuclPhos();
        me.clickmenu3_nuclLines();
        me.clickmenu3_nuclStick();
        me.clickmenu3_nuclBallstick();
        me.clickmenu3_nuclSphere();
        me.clickmenu3_nuclNothing();
        me.clickMenu3_ligandsLines();
        me.clickMenu3_ligandsStick();
        me.clickMenu3_ligandsBallstick();
        me.clickMenu3_ligandsSchematic();
        me.clickMenu3_ligandsSphere();
        me.clickMenu3_ligandsNothing();
        me.clickMenu3_ionsSphere();
        me.clickMenu3_ionsDot();
        me.clickMenu3_ionsNothing();
        me.clickMenu3_waterSphere();
        me.clickMenu3_waterDot();
        me.clickMenu3_waterNothing();
        me.clickMenu4_colorSpectrum();
        me.clickMenu4_colorChain();
        me.clickMenu4_colorSS();
        //me.clickMenu4_colorBfactor();
        me.clickMenu4_colorResidue();
        me.clickMenu4_colorCharge();
        me.clickMenu4_colorHydrophobic();
        me.clickMenu4_colorAtom();
        me.clickMenu4_colorConserved();
        me.clickMenu4_colorRed();
        me.clickMenu4_colorGreen();
        me.clickMenu4_colorBlue();
        me.clickMenu4_colorMagenta();
        me.clickMenu4_colorYellow();
        me.clickMenu4_colorCyan();
        me.clickMenu4_colorWhite();
        me.clickMenu4_colorGrey();
        me.clickMenu4_colorCustom();
        me.clickMenu5_neighborsYes();
        me.clickMenu5_neighborsNo();
        me.clickMenu5_surfaceVDW();
        //me.clickMenu5_surfaceSES();
        me.clickMenu5_surfaceSAS();
        me.clickMenu5_surfaceMolecular();
        me.clickMenu5_surfaceNothing();
        me.clickMenu5_opacity10();
        me.clickMenu5_opacity09();
        me.clickMenu5_opacity08();
        me.clickMenu5_opacity07();
        me.clickMenu5_opacity06();
        me.clickMenu5_opacity05();
        me.clickMenu5_wireframeYes();
        me.clickMenu5_wireframeNo();
        me.clickMenu6_assemblyYes();
        me.clickMenu6_assemblyNo();
        me.clickMenu6_addlabelResidues();
        me.clickMenu6_addlabelYes();
        me.clickMenu6_addlabelSelection();
        me.clickMenu6_addlabelNo();
        me.clickMenu6_distanceYes();
        me.clickMenu6_distanceNo();
        me.clickMenu6_selectedcenter();
        me.clickMenu6_center();
        me.clickMenu6_resetorientation();
        me.clickMenu6_rotateleft();
        me.clickMenu6_rotateright();
        me.clickMenu6_rotateup();
        me.clickMenu6_rotatedown();
        me.clickMenu6_cameraPers();
        me.clickMenu6_cameraOrth();
        me.clickMenu6_bkgdBlack();
        me.clickMenu6_bkgdGrey();
        me.clickMenu6_bkgdWhite();
        me.clickMenu6_showfogYes();
        me.clickMenu6_showfogNo();
        me.clickMenu6_showslabYes();
        me.clickMenu6_showslabNo();
        me.clickMenu6_showaxisYes();
        me.clickMenu6_showaxisNo();
        me.clickMenu6_hbondsYes();
        me.clickMenu6_hbondsNo();
        me.clickStructureid();
        me.clickChainid();
        me.clickAlignChainid();
        me.clickCustomResidues();
        me.clickCustomAtoms();
        me.clickShow_selected();
        me.clickShow_sequences();
        me.clickShow_alignsequences();
        me.clickShow_selected_atom();
        me.clickCommand_apply();
        me.clickReload_pdb();
        me.clickReload_pdbfile();
        me.clickReload_mol2file();
        me.clickReload_sdffile();
        me.clickReload_xyzfile();
        me.clickReload_mmciffile();
        me.clickReload_mmcif();
        me.clickReload_mmdb();
        me.clickReload_gi();
        me.clickReload_cid();
        me.clickReload_state();
        me.clickReload_selectionfile();
        me.clickApplycustomcolor();
        me.clickApplypick_aroundsphere();
        me.clickApplyhbonds();
        me.clickApplypick_labels();
        me.clickApplyselection_labels();
        me.clickApplypick_measuredistance();
        me.clickReset();
        me.clickToggleHighlight();
        me.pressCommandtext();
        me.clickFilter_ckbx_all();
        me.clickFilter();
        me.clickHighlight_3d_diagram();
        me.clickSeqSaveSelection();
        me.clickAlignSeqSaveSelection();
        me.clickOutputSelection();
        me.bindMouseup();
        me.bindMousedown();
        me.windowResize();
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

                $("#" + me.pre + "title").html(title + " (PubChem CID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>)");
            }
            else if(me.cfg.align !== undefined) {
                $("#" + me.pre + "title").html(title);
            }
            else {
                var url = me.getLinkToStructureSummary();

                if(me.icn3d.moleculeTitle.length > 40) title = me.icn3d.moleculeTitle.substr(0, 40) + "...";

                $("#" + me.pre + "title").html(title + " (PDB ID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>)");
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
                if(type === 'command') {
                    //var dataStr = me.icn3d.commands.join('\n');
                    var dataStr = '';
                    for(var i = 0, il = me.icn3d.commands.length; i < il; ++i) {
                        dataStr += me.icn3d.commands[i].trim() + '\n';
                    }
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'png') {
                   me.icn3d.render();
                   var blob = me.icn3d.renderer.domElement.msToBlob();

                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'html') {
                    var dataStr = text;
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'text') {
                    var dataStr = text;
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
            }
        }
        else {
            var data;

            if(type === 'command') {
                //var dataStr = me.icn3d.commands.join('\n');
                var dataStr = '';
                for(var i = 0, il = me.icn3d.commands.length; i < il; ++i) {
                    dataStr += me.icn3d.commands[i].trim() + '\n';
                }
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
            }
            else if(type === 'png') {
               me.icn3d.render();
               var dataStr = me.icn3d.renderer.domElement.toDataURL('image/png');

                data = dataStr;
            }
            else if(type === 'html') {
                var dataStr = text;
                data = "data:text/html;charset=utf-8," + encodeURIComponent(dataStr);
            }
            else if(type === 'text') {
                var dataStr = text;
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
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
        me.options['proteins'] = 'c alpha trace';
        me.icn3d.options['proteins'] = 'c alpha trace';

        if(me.bFullUi && me.isMac() && me.isMobile) {
            me.MENU_WIDTH = 950; // have enough space to show image in iphone

            me.setViewerWidthHeight();

            var width = me.WIDTH - me.LESSWIDTH;
            var height = me.HEIGHT - me.LESSHEIGHT;

            me.resizeCanvas(width, height, true, false);
        }

        //var url = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c&w3d&ids=" + align;
        //var url2 = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c1&d&ids=" + align;

        //var alignArray = me.cfg.align.split(',');
        var alignArray = align.split(',');
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
                return false;
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

        me.options['picking'] = 'atom';
        me.options['ligands'] = 'ball and stick';

        me.icn3d.options['picking'] = 'atom';
        me.icn3d.options['ligands'] = 'ball and stick';

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

        me.icn3d.oriMaxD = me.icn3d.maxD;
        me.icn3d.oriCenter = me.icn3d.center.clone();

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
        me.icn3d.oriMaxD = me.icn3d.maxD;
        me.icn3d.oriCenter = me.icn3d.center.clone();

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

            if(line !== '' && !isNaN(line)) { // start a new molecule
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
        me.icn3d.oriMaxD = me.icn3d.maxD;
        me.icn3d.oriCenter = me.icn3d.center.clone();

        me.showTitle();

        return true;
    };

    iCn3DUI.prototype.downloadMmdb = function (mmdbid, bGi) { var me = this;
       var url;
       if(bGi !== undefined && bGi) {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&gi=" + mmdbid;
       }
       else {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&uid=" + mmdbid;
       }

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
          error: function(xhr, textStatus, errorThrown){
              if(bGi) {
                  alert("This gi " + mmdbid + " has no corresponding 3D structure...");
              }
              else {
                  alert("This mmdbid " + mmdbid + " has no corresponding 3D structure...");
              }

              return false;
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
                var chainNameHash = {};
                for(var i in molid2rescount) {
                  var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
                  var chainName = molid2rescount[i].chain;
                  if(chainNameHash[chainName] === undefined) {
                      chainNameHash[chainName] = 1;
                  }
                  else {
                      ++chainNameHash[chainName];
                  }

                  var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
                  var chain = id + '_' + chainNameFinal;
                  html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='" + i + "' chain='" + chain + "'/></td><td align='center'>" + index + "</td><td align='center'>" + chainNameFinal +  + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

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
/*
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
*/

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

              me.icn3d.moleculeTitle +=  "<a href=\"https://www.ncbi.nlm.nih.gov/structure/?term=" + structure.pdbid.toUpperCase() + "\" target=\"_blank\" style=\"color: " + me.GREYD + ";\">" + structure.pdbid.toUpperCase() + "</a>";

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

        var molid2chain = {}; // for "mmdbid"
        var pdbid_molid2chain = {}; // for "align"
        if(type === 'mmdbid' || type === 'align') {
          //molid2chain
          if(type === 'mmdbid') {
              if(data.molid2chain !== undefined) {
                  var chainHash = {}; // there may have different chains with the same names in assembly
                  for (var molid in data.molid2chain) {
                      var chain = data.molid2chain[molid].chain;
                      if(chainHash[chain] === undefined) {
                          chainHash[chain] = 1;
                      }
                      else {
                          ++chainHash[chain];
                      }

                      molid2chain[molid] = (chainHash[chain] === 1) ? chain : chain + chainHash[chain].toString();
                  }
              }
          }
          else if(type === 'align') {
              if(data.molid2chain !== undefined) {
                  for (var mmdbid in data.molid2chain) {
                    var chainNameHash = {}; // chain name may be the same in assembly
                    for (var molid in data.molid2chain[mmdbid]) {
                      var chainName = data.molid2chain[mmdbid][molid].chain;
                      if(chainNameHash[chainName] === undefined) {
                          chainNameHash[chainName] = 1;
                      }
                      else {
                          ++chainNameHash[chainName];
                      }

                      pdbid_molid2chain[mmdbid2pdbid[mmdbid] + '_' + molid] = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
                    }
                  }
              }
          }

          // assign chain color
          if(type === 'mmdbid') {
                var molid2rescount = data.molid2rescount;
                for(var i in molid2rescount) {
                  var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
                  var chain = id + '_' + molid2rescount[i].chain;

                  me.icn3d.chainsColor[chain] = new THREE.Color(color);
                }
          }
          else if(type === 'align') {
              if(data.molid2chain !== undefined) {
                  for (var mmdbid in data.molid2chain) {
                    var chainNameHash = {}; // chain name may be the same in assembly
                    for (var molid in data.molid2chain[mmdbid]) {
                      var chainName = data.molid2chain[mmdbid][molid].chain;
                      if(chainNameHash[chainName] === undefined) {
                          chainNameHash[chainName] = 1;
                      }
                      else {
                          ++chainNameHash[chainName];
                      }

                      var color = '#' + ( '000000' + data.molid2chain[mmdbid][molid].color.toString( 16 ) ).slice( - 6 );
                      var chain = (chainNameHash[chainName] === 1) ? mmdbid2pdbid[mmdbid] + '_' + chainName : mmdbid2pdbid[mmdbid] + '_' + chainName + chainNameHash[chainName].toString();

                      me.icn3d.chainsColor[chain] = new THREE.Color(color);
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
                        //resObject.name = seqName;
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
        prevResi = 0; // continuous from 1 for each chain
        var missingResIndex = 0;
        var bChainSeqSet = true;

        // In align, ligands do not have assigned chains. Assembly will have the same residue id so that two different residues will be combined in one residue. To avoid this, build an array to check for molid
        var resiArray = [];
        var molid, prevMolid = '', prevMmdb_id = '';
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

                  if(molid2chain[molid] !== undefined) {
                      atm.chain = molid2chain[molid];
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

                  if(pdbid_molid2chain[mmdb_id + '_' + molid] !== undefined) {
                      atm.chain = pdbid_molid2chain[mmdb_id + '_' + molid];
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

//              if(type === 'mmdbid' || type === 'align') {
//                    me.icn3d.chainsColor[chainid] = atm.color;
//              }
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

        // set up sequence alignment
        if(type === 'align' && seqalign !== undefined) {
          //loadSeqAlignment
          var alignedAtoms = {};
          var mmdbid1 = data.aligned_structures[0].pdbid;
          var mmdbid2 = data.aligned_structures[1].pdbid;

          var conservedName1 = mmdbid1 + '_cons', nonConservedName1 = mmdbid1 + '_ncons', notAlignedName1 = mmdbid1 + '_nalign';
          var conservedName2 = mmdbid2 + '_cons', nonConservedName2 = mmdbid2 + '_ncons', notAlignedName2 = mmdbid2 + '_nalign';

          var consHash1 = {}, nconsHash1 = {}, nalignHash1 = {};
          var consHash2 = {}, nconsHash2 = {}, nalignHash2 = {};

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
              //if(me.icn3d.alignChainsAnnoTitle[chainid1][6] === undefined ) me.icn3d.alignChainsAnnoTitle[chainid1][6] = [];

              // two annotations without titles
              me.icn3d.alignChainsAnnoTitle[chainid1][0].push("SS");
              me.icn3d.alignChainsAnnoTitle[chainid1][1].push("");
              me.icn3d.alignChainsAnnoTitle[chainid1][2].push("");
/*
              // empty line
              me.icn3d.alignChainsAnnoTitle[chainid1][3].push("");
              // 2nd chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][4].push(chainid2);
              // master chain title
              me.icn3d.alignChainsAnnoTitle[chainid1][5].push(chainid1);
              // empty line
              me.icn3d.alignChainsAnnoTitle[chainid1][6].push("");
*/
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
                  //var id = alignData.sseq[j][0];
                  var resi = alignData.sseq[j][1];
                  var resn = (alignData.sseq[j][2] === '~') ? '-' : alignData.sseq[j][2];
                  // not aligned residues also Uppercase, but italic using css
                  resn = resn.toUpperCase();

                  var aligned = id2aligninfo[j].aligned + alignData.sseq[j][3]; // 0 or 2

                  var color, classname;
                  if(aligned === 2) { // aligned
                      if(id2aligninfo[j].resn === resn) {
                          color = '#FF0000';
                          classname = 'icn3d-cons';

                          // save concerved residues in a custom name
                          //me.selectAResidue(chainid1 + '_' + id2aligninfo[j].resi, conservedName1);
                          //me.selectAResidue(chainid2 + '_' + resi, conservedName2);
                          consHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          consHash2[chainid2 + '_' + resi] = 1;
                      }
                      else {
                          color = '#0000FF';
                          classname = 'icn3d-ncons';

                          // save nonconcerved residues in a custom name
                          //me.selectAResidue(chainid1 + '_' + id2aligninfo[j].resi, nonConservedName1);
                          //me.selectAResidue(chainid2 + '_' + resi, nonConservedName2);
                          nconsHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          nconsHash2[chainid2 + '_' + resi] = 1;
                      }

                      alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                      alignedAtoms = me.icn3d.unionHash(alignedAtoms, me.icn3d.residues[chainid2 + '_' + resi]);
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
                      //if(me.icn3d.alignChainsAnno[chainid1][3] === undefined ) me.icn3d.alignChainsAnno[chainid1][3] = [];
                      // 2nd chain title
                      if(me.icn3d.alignChainsAnno[chainid1][3] === undefined ) me.icn3d.alignChainsAnno[chainid1][3] = [];
                      // master chain title
                      if(me.icn3d.alignChainsAnno[chainid1][4] === undefined ) me.icn3d.alignChainsAnno[chainid1][4] = [];
                      // empty line
                      if(me.icn3d.alignChainsAnno[chainid1][5] === undefined ) me.icn3d.alignChainsAnno[chainid1][5] = [];

                      //me.icn3d.alignChainsAnno[chainid1][3].push('');
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

          // assign grey color to all unaligned atoms
          var color = new THREE.Color(me.GREYB);
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
                // determine whether dialogs initilaized
                var bSelectresidueInit = ($('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content')) ? true : false;
                var bAlignmentInit = ($('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content')) ? true : false;
                var bFilterInit = ($('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content')) ? true : false;

              if((id === me.pre + 'dl_selectresidues' && (!bAlignmentInit || $( '#' + me.pre + 'dl_alignment' ).dialog( 'isOpen' ) === false) && (!bFilterInit || $( '#' + me.pre + 'dl_filter' ).dialog( 'isOpen' ) === false) )
                || (id === me.pre + 'dl_alignment' && (!bSelectresidueInit || $( '#' + me.pre + 'dl_selectresidues' ).dialog( 'isOpen' ) === false) && (!bFilterInit || $( '#' + me.pre + 'dl_filter' ).dialog( 'isOpen' ) === false) )
                || (id === me.pre + 'dl_filter' && (!bAlignmentInit || $( '#' + me.pre + 'dl_alignment' ).dialog( 'isOpen' ) === false) && (!bSelectresidueInit || $( '#' + me.pre + 'dl_selectresidues' ).dialog( 'isOpen' ) === false) )
                ) {
                  me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT, true);
              }
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
                      //$( ".selector" ).dialog( "isOpen" )

                        // determine whether dialogs initilaized
                        var bSelectresidueInit = ($('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content')) ? true : false;
                        var bAlignmentInit = ($('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content')) ? true : false;
                        var bFilterInit = ($('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content')) ? true : false;

                      if((id === me.pre + 'dl_selectresidues' && (!bAlignmentInit || $( '#' + me.pre + 'dl_alignment' ).dialog( 'isOpen' ) === false) && (!bFilterInit || $( '#' + me.pre + 'dl_filter' ).dialog( 'isOpen' ) === false) )
                        || (id === me.pre + 'dl_alignment' && (!bSelectresidueInit || $( '#' + me.pre + 'dl_selectresidues' ).dialog( 'isOpen' ) === false) && (!bFilterInit || $( '#' + me.pre + 'dl_filter' ).dialog( 'isOpen' ) === false) )
                        || (id === me.pre + 'dl_filter' && (!bAlignmentInit || $( '#' + me.pre + 'dl_alignment' ).dialog( 'isOpen' ) === false) && (!bSelectresidueInit || $( '#' + me.pre + 'dl_selectresidues' ).dialog( 'isOpen' ) === false) )
                        ) {
                          me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT, true);
                      }
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

    iCn3DUI.prototype.resizeCanvas = function (width, height, bForceResize, bDraw) { var me = this;
      if( (bForceResize !== undefined && bForceResize) || (me.cfg.resize !== undefined && me.cfg.resize) ) {
        var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
        $("#" + me.pre + "canvas").width(width).height(heightTmp);

        $("#" + me.pre + "viewer").width(width).height(height);

        me.icn3d.setWidthHeight(width, heightTmp);

        if(bDraw === undefined || bDraw) me.icn3d.draw();
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
