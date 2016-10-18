/*! full_ui.js
 * @author Jiyao Wang / https://github.com/ncbi/icn3d
 * UI with full features of iCn3D
 */

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

    me.LESSWIDTH = 20;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROTATION_DIRECTION = 'right';
    me.bHideSelection = true;

    me.EXTRAHEIGHT = 2.8*me.MENU_HEIGHT;
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
        me.EXTRAHEIGHT = 0.8*me.MENU_HEIGHT;
    }

    me.GREY8 = "#888888"; // style protein grey
    me.GREYB = "#BBBBBB";
    me.GREYC = "#CCCCCC"; // grey background
    me.GREYD = "#DDDDDD";
    me.ORANGE = "#FFA500";

    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;
    me.selectedResidues = {};

    me.bCrashed = false;
    me.prevCommands = "";

    me.options = {};
    me.options['camera']             = 'perspective';        //perspective, orthographic
    me.options['background']         = 'black';              //black, grey, white
    me.options['color']              = 'spectrum';           //spectrum, secondary structure, charge, hydrophobic, conserved, chain, residue, atom, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.options['sidechains']         = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    me.options['proteins']          = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
    me.options['surface']            = 'nothing';             //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    me.options['opacity']            = '0.8';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.options['wireframe']          = 'no';                 //yes, no
    me.options['ligands']            = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    me.options['water']              = 'nothing';            //sphere, dot, nothing
    me.options['ions']               = 'sphere';             //sphere, dot, nothing
    me.options['hbonds']             = 'no';                 //yes, no
    me.options['ssbonds']            = 'no';                 //yes, no
    //me.options['labels']             = 'no';                 //yes, no
    //me.options['lines']                   = 'no';                 //yes, no
    me.options['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.options['axis']               = 'no';                 //yes, no
    me.options['fog']                = 'no';                 //yes, no
    me.options['slab']               = 'no';                 //yes, no
    me.options['picking']            = 'residue';                 //no, atom, residue, strand
    me.options['nucleotides']        = 'nucleotide cartoon';   //nucleotide cartoon, schematic, phosphorus trace, lines, stick, ball and stick, sphere, nothing

    if(me.cfg.align !== undefined) me.options['color'] = 'conserved';

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

          // highlight the sequence background
          var idArray = this.id.split('_'); // id: div0_canvas
          me.pre = idArray[0] + "_";

          me.clearSelection();

          if(!me.icn3d.bShiftKey && !me.icn3d.bCtrlKey) {
              me.removeSeqChainBkgd();
              me.removeSeqResidueBkgd();
          }

          var firstAtom, lastAtom;

          if(me.icn3d.bShiftKey) {
              firstAtom = this.getFirstAtomObj(this.highlightAtoms);
              lastAtom = this.getLastAtomObj(this.highlightAtoms);
          }
          else {
              firstAtom = this.getFirstAtomObj(this.pickedAtomList);
              lastAtom = this.getLastAtomObj(this.pickedAtomList);
          }

          var pickedResidue, prevResidue = '';
          for(var i = firstAtom.serial; i <= lastAtom.serial; ++i) {
              pickedResidue = this.atoms[i].structure + '_' + this.atoms[i].chain + '_' + this.atoms[i].resi;

              if(prevResidue !== pickedResidue) {
                  if($("#" + me.pre + pickedResidue).length !== 0) {
                    $("#" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
                  }

                  // add "align" in front of id so that full sequence and aligned sequence will not conflict
                  if($("#align" + me.pre + pickedResidue).length !== 0) {
                    $("#align" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
                  }
              }

              prevResidue = pickedResidue;
          }

          // highlight 2d diagram
          if(!me.icn3d.bShiftKey && !me.icn3d.bCtrlKey) {
              // clear all nodes
              me.remove2DHighlight();
          }

          // get all chains
          var chainHash = {};
          for(var i = firstAtom.serial; i <= lastAtom.serial; ++i) {
              var chainid = this.atoms[i].structure + '_' + this.atoms[i].chain;
              chainHash[chainid] = 1;
          }

          if(!me.icn3d.bShiftKey && !me.icn3d.bCtrlKey) {
              me.chainArray2d = Object.keys(chainHash);
          }
          else {
              for(var i = 0, il = me.chainArray2d.length; i < il; ++i) {
                  chainHash[me.chainArray2d[i]] = 1;
              }

              me.chainArray2d = Object.keys(chainHash);
          }

          // highlight each chain in 2d diagram
          me.add2DHighlight(me.chainArray2d);

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
                me.updateSeqWin2DWinForCurrentAtoms();
            }
            else if(e.keyCode === 40) { // arrow down, select down level of atoms
                me.updateSeqWin2DWinForCurrentAtoms();
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
            if(id === me.cfg.mmtfid || id === me.cfg.pdbid || id === me.cfg.mmdbid || id === me.cfg.gi || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align) {
                me.loadScript(me.commandsBeforeCrash, true);

                return;
            }
        }

        me.icn3d.moleculeTitle = '';

        if(me.cfg.url !== undefined) {
            var type_url = me.cfg.url.split('|');
            var type = type_url[0];
            var url = type_url[1];

            me.icn3d.moleculeTitle = "";
            me.inputid = undefined;

            me.setLogCommand('load url ' + url + ' | type ' + type, true);

            me.downloadUrl(url, type);
        }
        else if(me.cfg.mmtfid !== undefined) {
           me.inputid = me.cfg.mmtfid;

           me.setLogCommand('load mmtf ' + me.cfg.mmtfid, true);

           me.downloadMmtf(me.cfg.mmtfid);
        }
        else if(me.cfg.pdbid !== undefined) {
           me.inputid = me.cfg.pdbid;

           me.setLogCommand('load pdb ' + me.cfg.pdbid, true);

           me.downloadPdb(me.cfg.pdbid);
        }
        else if(me.cfg.mmdbid !== undefined) {
           me.inputid = me.cfg.mmdbid;

           me.setLogCommand('load mmdb ' + me.cfg.mmdbid + ' | parameters ' + me.cfg.inpara, true);

           me.downloadMmdb(me.cfg.mmdbid);
        }
        else if(me.cfg.gi !== undefined) {
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
            alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
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
              var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
              var description = $("#" + me.pre + "seq_command_desc").val();

              if(name === "") {
                name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
                description = $("#" + me.pre + "alignseq_command_desc").val();
			  }

              if(name !== "") me.saveSelection(name, description);

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


          me.icn3d.draw();

            setTimeout(function(){
              me.updateSeqWin2DWinForCurrentAtoms(false);
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
              calpha_atoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, me.icn3d.calphas);
              // include calphas
              atoms = me.icn3d.unionHash(atoms, calpha_atoms);
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

      // draw sidechains separatedly
      if(selectionType === 'sidechains') {
		  for(var i in atoms) {
			me.icn3d.atoms[i].style2 = style;
		  }
	  }
	  else {
		  for(var i in atoms) {
			me.icn3d.atoms[i].style = style;
		  }
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

              jQuery.extend(me.icn3d.options, me.options);
              me.icn3d.draw();
          }
          else {
              jQuery.extend(me.icn3d.options, me.options);
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

      //if(me.cfg.show2d !== undefined && me.cfg.show2d && (me.cfg.mmdbid !== undefined || me.cfg.align !== undefined) ) me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');
      if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

      // display the structure right away. load the menus and sequences later
//      setTimeout(function(){
          //if(me.cfg.command === undefined && (me.cfg.showmenu === undefined || me.cfg.showmenu || me.cfg.showseq || me.cfg.showalignseq) ) {
          if(Object.keys(me.icn3d.highlightAtoms).length === Object.keys(me.icn3d.atoms).length && (me.cfg.showmenu === undefined || me.cfg.showmenu || me.cfg.showseq || me.cfg.showalignseq || me.cfg.show2d) ) {
              me.selectAllUpdateMenuSeq(me.bInitial, false);
          }
          else {
              //me.updateMenus(me.bInitial);
              if(me.bInitial) me.setProteinsNucleotidesLigands();
              me.updateMenus(false);

              me.updateSeqWin2DWinForCurrentAtoms();
          }
//      }, 0);

      if(me.bInitial && me.cfg.command !== undefined && me.cfg.command !== '') {
              me.icn3d.bRender = true;
              me.loadScript(me.cfg.command);
      }

      me.bInitial = false;
    },

    setStructureMenu: function (bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      var keys = Object.keys(me.icn3d.structures);

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

      sequencesHtml += "<div style='min-width:200px;'><Selection:</b> Name: <input type='text' id='" + me.pre + "seq_command_name' value='seq_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='10'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "seq_command_desc' value='seq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='20'> <button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection'>Save Selection</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection'>Clear Selection</button></div><br/>";

      sequencesHtml += resCategories + scroll + "<br/>";

      if(me.icn3d.moleculeTitle !== "") sequencesHtml += "<br/><b>Title:</b> " + me.icn3d.moleculeTitle + "<br/>";
      if(me.icn3d.bSSOnly) sequencesHtml += "(<b>Note:</b> Protein sequences are not shown in the condensed view.)<br/>";
      sequencesHtml += "<br/>";

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

          var maxResi = 1;
          if(me.icn3d.chainsSeq[i] !== undefined) { // me.icn3d.chainsSeq[i] should be defined, just in case
            seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + me.icn3d.chainsSeq[i][0].resi + "</span>";

            maxResi = parseInt(me.icn3d.chainsSeq[i][0].resi);
          }

          for(var k=0, kl=seqLength; k < kl; ++k) {
            var resiId = structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi;
            var bWithCoord = (me.icn3d.chainsSeq[i][k].name === me.icn3d.chainsSeq[i][k].name.toUpperCase() ) ? true : false;

            var classForAlign = "class='icn3d-residue'"; // used to identify a residue when clicking a residue in sequence

            if( (bShowHighlight === undefined || bShowHighlight) && ( bHighlightChain || (bWithCoord && residueArray !== undefined && residueArray.indexOf(resiId) !== -1) ) ) {
                classForAlign = "class='icn3d-residue icn3d-highlightSeq'";
            }

            var residueName = (me.icn3d.chainsSeq[i][k].name.length === 1) ? me.icn3d.chainsSeq[i][k].name : me.icn3d.chainsSeq[i][k].name.trim().substr(0, 1) + '.';

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

      sequencesHtml += "<div style='min-width:200px;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "alignseq_command_name' value='alseq_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='10'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "alignseq_command_desc' value='alseq_desc_" + Object.keys(me.icn3d.definedNames2Residues).length + "' size='20'> <button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save Selection</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear Selection</button></div><br/>";

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

    remove2DHighlight: function() { var me = this;
          // clear nodes in 2d diagram
          $("#" + me.pre + "dl_2ddiagram rect").attr('stroke', '#000000');
          $("#" + me.pre + "dl_2ddiagram circle").attr('stroke', '#000000');
          $("#" + me.pre + "dl_2ddiagram polygon").attr('stroke', '#000000');

          $("#" + me.pre + "dl_2ddiagram line").attr('stroke', '#000000');
    },

    add2DHighlight: function(chainArray2d) { var me = this;
      if(!me.bClickInteraction && chainArray2d !== undefined) {
          for(var i = 0, il = chainArray2d.length; i < il; ++i) {
			  var hlatoms = me.icn3d.intersectHash(me.icn3d.chains[chainArray2d[i]], me.icn3d.highlightAtoms);
			  var ratio = 1.0 * Object.keys(hlatoms).length / Object.keys(me.icn3d.chains[chainArray2d[i]]).length;

              var firstAtom = me.icn3d.getFirstAtomObj(hlatoms);
              if(me.icn3d.alignChains[chainArray2d[i]] !== undefined) {
              	  var alignedAtoms = me.icn3d.intersectHash(me.icn3d.alignChains[chainArray2d[i]], hlatoms);
              	  if(Object.keys(alignedAtoms).length > 0) firstAtom = me.icn3d.getFirstAtomObj(alignedAtoms);
		  	  }
              var color = (firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() : '#FFFFFF';

			  var target = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-hlnode']");
			  var base = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-basenode']");
			  if(target !== undefined) {
				  me.highlightNode('rect', target, base, ratio);
			      $(target).attr('fill', color);
			  }

			  target = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-hlnode']");
			  base = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-basenode']");
			  if(target !== undefined) {
			  	  me.highlightNode('circle', target, base, ratio);
			  	  $(target).attr('fill', color);
			  }

			  target = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-hlnode']");
			  base = $("#" + me.pre + "dl_2ddiagram g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-basenode']");

			  if(target !== undefined) {
			      me.highlightNode('polygon', target, base, ratio);
			      $(target).attr('fill', color);
			  }
          }
      }
      else if(me.bClickInteraction && me.lineArray2d !== undefined) {
          //for(var i = 0, il = me.lineArray2d.length; i < il; ++i) {
              $("#" + me.pre + "dl_2ddiagram g[chainid1=" + me.lineArray2d[0] + "][chainid2=" + me.lineArray2d[1] + "] line").attr('stroke', me.ORANGE);
              // random order
              //$("#" + me.pre + "dl_2ddiagram g[chainid1=" + me.lineArray2d[1] + "][chainid2=" + me.lineArray2d[0] + "] line").attr('stroke', me.ORANGE);
          //}
      }

      // update the previously highlisghted atoms for switching between all and selection
      me.icn3d.prevHighlightAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

      me.setMode('selection');
    },

    changeStructureid: function (moleculeArray, bUpdateHighlight, bUpdateSequence) { var me = this;
       // reset alternate structure
       me.icn3d.ALTERNATE_STRUCTURE = Object.keys(me.icn3d.structures).indexOf(moleculeArray[0]);

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
		   me.highlightChains(chainArray);
       }
       else {
       	   me.icn3d.removeHighlightObjects();
       	   me.remove2DHighlight();

		   me.icn3d.addHighlightObjects();
		   me.add2DHighlight(chainArray);
	   }
    },

    highlightChains: function(chainArray) { var me = this;
	   var seqObj = me.getSequencesAnnotations(chainArray);

	   $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
	   $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

	   if(me.cfg.align !== undefined) {
		   seqObj = me.getAlignSequencesAnnotations(chainArray);

		   $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
		   $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
	   }

       me.icn3d.removeHighlightObjects();
       me.remove2DHighlight();

	   me.icn3d.addHighlightObjects();
	   me.add2DHighlight(chainArray);
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

       me.highlightChains(chainArray);
    },

    changeAlignChainid: function (alignChainArray) { var me = this;
       me.icn3d.removeHighlightObjects();
       me.remove2DHighlight();

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
       me.add2DHighlight(alignChainArray);
    },

    changeResidueid: function (residueArray) { var me = this;
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

       me.highlightResidues(residueArray, sequencesHtml);
    },

    highlightResidues: function(residueArray, prevHtml) { var me = this;
       if(prevHtml === undefined) prevHtml = "";

       me.icn3d.removeHighlightObjects();
       me.remove2DHighlight();

       var seqObj = me.getSequencesAnnotations(undefined, true, residueArray);
       $("#" + me.pre + "dl_sequence").html(prevHtml + seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
           seqObj = me.getAlignSequencesAnnotations(undefined, true, residueArray);

           $("#" + me.pre + "dl_sequence2").html(prevHtml + seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
       }

       me.icn3d.addHighlightObjects();

       var chainHash = {};
       for(var i = 0, il = residueArray.length; i < il; ++i) {
           var residueid = residueArray[i];
           var pos = residueid.lastIndexOf('_');
           var chainid = residueid.substr(0, pos);

           chainHash[chainid] = 1;
       }

       me.add2DHighlight(Object.keys(chainHash));
	},

    changeCustomResidues: function (nameArray) { var me = this;
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

       var annoTmp = '';
       var allResidues = {};
       for(var i = 0; i < nameArray.length; ++i) {
         var residueArray = me.icn3d.definedNames2Residues[nameArray[i]];

         if(residueArray === undefined) continue;

         var residueTitle = me.icn3d.definedNames2Descr[nameArray[i]];

         annoTmp += "<b>" + nameArray[i] + ":</b> " + residueTitle + "; ";

         for(var j = 0, jl = residueArray.length; j < jl; ++j) {
           allResidues[residueArray[j]] = 1;
           me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residueArray[j]]);
         }
       } // outer for

       sequencesHtml += "<b>Annotation(s):</b> " + annoTmp + "<br/>";

       me.highlightResidues(Object.keys(allResidues), sequencesHtml);
    },

    changeCustomAtoms: function (nameArray) { var me = this;
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

         var residueTitle = me.icn3d.definedNames2Descr[nameArray[i]];

         annoTmp += "<b>" + nameArray[i] + ":</b> " + residueTitle + "; ";

         for(var j = 0, jl = residueArray.length; j < jl; ++j) {
           allResidues[residueArray[j]] = 1;
         }
       } // outer for

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

       sequencesHtml += "<b>Annotation(s):</b> " + annoTmp + "<br/>";

       me.highlightResidues(Object.keys(allResidues), sequencesHtml);
    },

    exportCustomAtoms: function () { var me = this;
       var html = "";

       var nameArray = Object.keys(me.icn3d.definedNames2Atoms).sort();

       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var atomArray = me.icn3d.definedNames2Atoms[name];
         var description = me.icn3d.definedNames2Descr[name];
         var command = me.icn3d.definedNames2Command[name];
         command = command.replace(/,/g, ', ');

         html += name + "\tselect ";

         var residuesHash = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             var atom = me.icn3d.atoms[atomArray[j]];
             var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
             residuesHash[residueid] = 1;
         }

         var residueArray = Object.keys(residuesHash);

         html += me.residueids2spec(residueArray);

         html += "\n";
       } // outer for

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

    showSelection: function (id) { var me = this;
       me.icn3d.displayAtoms = {};

       me.icn3d.displayAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

       var centerAtomsResults = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.displayAtoms));
       me.icn3d.maxD = centerAtomsResults.maxD;
       if (me.icn3d.maxD < 25) me.icn3d.maxD = 25;

       //show selected rotationcenter
       me.icn3d.options['rotationcenter'] = 'display center';

       me.saveSelectionIfSelected();

       me.icn3d.draw();
    },

    selectByCommand: function (select, commandname, commanddesc) { var me = this;
           var selectTmp = select.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ or and /g, ' and ').replace(/ and /g, ' or and ').replace(/ or not /g, ' not ').replace(/ not /g, ' or not ');

           var commandStr = (selectTmp.trim().substr(0, 6) === 'select') ? selectTmp.trim().substr(7) : selectTmp.trim();

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
           //$1,2,3.A,B,C:5-10,LYS,ligands@CA,C
           // $1,2,3: Structure
           // .A,B,C: chain
           // :5-10,LYS,ligands: residues, could be 'proteins', 'nucleotides', 'ligands', 'ions', and 'water'
           // @CA,C: atoms
           // wild card * can be used to select all
           var currHighlightAtoms = {};

           var poundPos = commandArray[i].indexOf('$');
           var periodPos = commandArray[i].indexOf('.');
           var colonPos = commandArray[i].indexOf(':');
           var atPos = commandArray[i].indexOf('@');

           var moleculeStr, chainStr, residueStr, atomStr;
           var testStr = commandArray[i];

           if(atPos === -1) {
             atomStr = "*";
           }
           else {
             atomStr = testStr.substr(atPos + 1);
             testStr = testStr.substr(0, atPos);
           }

           if(colonPos === -1) {
             residueStr = "*";
           }
           else {
             residueStr = testStr.substr(colonPos + 1);
             testStr = testStr.substr(0, colonPos);
           }

           if(periodPos === -1) {
             chainStr = "*";
           }
           else {
             chainStr = testStr.substr(periodPos + 1);
             testStr = testStr.substr(0, periodPos);
           }

           if(poundPos === -1) {
             moleculeStr = "*";
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
                         if(i === 0) {
                             currHighlightAtoms[m] = 1;
                             atomHash[m] = 1;
                         }
                         else {
                             currHighlightAtoms[m] = undefined;
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
                             if(i === 0) {
                                 currHighlightAtoms[m] = 1;
                                 atomHash[m] = 1;
                             }
                             else {
                                 currHighlightAtoms[m] = undefined;
                                 atomHash[m] = undefined;
                             }
                         }

                       }
                     } // end for
                   }
                 } // end else
               } // end for(var mc = 0
           } // for (j

           if(i === 0) {
               me.icn3d.highlightAtoms = me.icn3d.cloneHash(currHighlightAtoms);
           }
           else {
               me.icn3d.highlightAtoms = me.icn3d.intersectHash(me.icn3d.highlightAtoms, currHighlightAtoms);
           }
       }  // for (i

       if(bDisplay === undefined || bDisplay) me.updateSeqWin2DWinForCurrentAtoms();

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
    },

    // between the highlighted and the rest atoms
    showHbonds: function (threshold) { var me = this;
        me.icn3d.options["hbonds"] = "yes";
        me.icn3d.options["water"] = "dot";

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

            // show side chains for the selected atoms
            me.setStyle('sidechains', 'ball and stick');

            //me.icn3d.draw();
        }
    },

    // show all disulfide bonds
    showSsbonds: function () { var me = this;
         me.icn3d.options["ssbonds"] = "yes";

         var select = 'disulfide bonds';

         me.clearSelection();

         var residues = {}, atomArray = [];

         for (var i = 0, lim = Math.floor(me.icn3d.ssbondpoints.length / 2); i < lim; i++) {
            var res1 = me.icn3d.ssbondpoints[2 * i], res2 = me.icn3d.ssbondpoints[2 * i + 1];

            residues[res1] = 1;
            residues[res2] = 1;

            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[res1]);
            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[res2]);

            for(var j in me.icn3d.residues[res1]) {
                atomArray.push(j);
            }

            for(var j in me.icn3d.residues[res2]) {
                atomArray.push(j);
            }
        }

        if(atomArray.length > 0) {
            var commandname = 'ssbonds';
            var commanddesc = 'all atoms that have disulfide bonds';
            me.addCustomSelection(Object.keys(residues), atomArray, commandname, commanddesc, select, true);

            var nameArray = [commandname];

            me.changeCustomResidues(nameArray);

            me.saveSelectionIfSelected();

            // show side chains for the selected atoms
            me.setStyle('sidechains', 'ball and stick');

            //me.icn3d.draw();
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
        me.remove2DHighlight();

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
        me.add2DHighlight([chainid]);
    },

    selectAAlignChain: function (chainid, commanddesc) { var me = this;
        var commandname = commanddesc.replace(/\s/g, '');
        var select = "Selection from chain annotation in 'Select Residue' dialog";

        var residueArray = [], atomArray = [];

        me.icn3d.removeHighlightObjects();
        me.remove2DHighlight();

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
        me.add2DHighlight([chainid]);
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
                    me.icn3d.setAtomStyleByOptions(me.icn3d.optionsHistory[steps - 1]);
                    me.icn3d.setColorByOptions(me.icn3d.optionsHistory[steps - 1], me.icn3d.highlightAtoms);

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

                        me.updateSeqWin2DWinForCurrentAtoms();

                        //me.icn3d.draw(me.icn3d.optionsHistory[steps - 1]);
                        jQuery.extend(me.icn3d.options, me.icn3d.optionsHistory[steps - 1]);
                        me.icn3d.draw();
                    }
                    else {
                        me.updateSeqWin2DWinForCurrentAtoms();

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
            var firstSpacePos = load_parameters[load_parameters.length - 1].indexOf(' ');
            me.cfg.inpara = load_parameters[load_parameters.length - 1].substr(firstSpacePos + 1);
        }

        // load pdb, mmcif, mmdb, cid
        var id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
        if(command.indexOf('load mmtf') !== -1) {
          me.downloadMmtf(id);
          me.cfg.mmtfid = id;
        }
        else if(command.indexOf('load pdb') !== -1) {
          me.downloadPdb(id);
          me.cfg.pdbid = id;
        }
        else if(command.indexOf('load mmcif') !== -1) {
          me.downloadMmcif(id);
          me.cfg.mmcifid = id;
        }
        else if(command.indexOf('load mmdb') !== -1) {
          me.downloadMmdb(id);
          me.cfg.mmdbid = id;
        }
        else if(command.indexOf('load gi') !== -1) {
          me.downloadGi(id);
          me.cfg.gi = id;
        }
        else if(command.indexOf('load cid') !== -1) {
          me.downloadCid(id);
          me.cfg.cid = id;
        }
        else if(command.indexOf('load align') !== -1) {
          me.downloadAlignment(id);
          me.cfg.align = id;
        }
        else if(command.indexOf('load url') !== -1) {
            var typeStr = load_parameters[1]; // type pdb
            var pos = (typeStr !== undefined) ? typeStr.indexOf('type ') : -1;
            var type = 'pdb';

            if(pos !== -1) {
                type = typeStr.substr(pos + 5);
            }

            me.downloadUrl(id, type);
            me.cfg.url = id;
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
      }
      else if(commandOri.indexOf('select chain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

        //if(idArray !== null) me.changeChainid(idArray);
        for(var i = 0, il = idArray.length; i < il; ++i) {
        	me.selectAChain(idArray[i], idArray[i]);
		}
      }
      else if(commandOri.indexOf('select interaction') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.selectInteraction(idArray[0], idArray[1]);
      }
      else if(commandOri.indexOf('select alignChain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

        //if(idArray !== null) me.changeAlignChainid(idArray);
        for(var i = 0, il = idArray.length; i < il; ++i) {
        	me.selectAAlignChain(idArray[i], "align_" + idArray[i]);
		}
      }
      else if(commandOri.indexOf('select residue') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeResidueid(idArray);
      }
      else if(commandOri.indexOf('select saved selection') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeCustomResidues(idArray);
      }
      else if(commandOri.indexOf('select saved atoms') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeCustomAtoms(idArray);
      }
      else if(command.indexOf('show selection') !== -1) {
        me.showSelection();
      }
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
      }
      else if(command.indexOf('select $') !== -1 || command.indexOf('select .') !== -1 || command.indexOf('select :') !== -1 || command.indexOf('select @') !== -1) {
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
        me.icn3d.options['color'] = color;

        me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.highlightAtoms);

        me.updateSeqWin2DWinForCurrentAtoms();
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
      else if(command.indexOf('clear selection') !== -1) {
        //if(me.icn3d.prevHighlightObjects.length > 0) { // remove
            me.icn3d.removeHighlightObjects();
            me.remove2DHighlight();
            me.icn3d.bShowHighlight = false;
        //}
      }
      else if(command.indexOf('set assembly on') !== -1) {
        me.icn3d.bAssembly = true;
      }
      else if(command.indexOf('set assembly off') !== -1) {
        me.icn3d.bAssembly = false;
      }
      else if(commandOri.indexOf('add label') !== -1) {
        var paraArray = commandOri.split(' | ');
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
        var threshold = command.substr(command.indexOf(' ') + 1);

        me.showHbonds(threshold);
      }
      else if(command.indexOf('disulfide bonds') !== -1) {
        me.showSsbonds();
      }
      else if(command.indexOf('cross linkage') !== -1) {
        me.icn3d.bShowCrossResidueBond = true;
        //me.options['proteins'] = 'lines';
        //me.icn3d.draw();

        me.setStyle('proteins', 'lines')
      }
      else if(command.indexOf('set hbonds off') !== -1) {
        me.icn3d.options["hbonds"] = "no";
        me.icn3d.draw();
      }
      else if(command.indexOf('set disulfide bonds off') !== -1) {
        me.icn3d.options["ssbonds"] = "no";
        me.icn3d.draw();
      }
      else if(command.indexOf('set cross linkage off') !== -1) {
        me.icn3d.bShowCrossResidueBond = false;
        //me.options['proteins'] = 'ribbon';
        //me.icn3d.draw();
        me.setStyle('proteins', 'ribbon')
      }
      else if(command.indexOf('set lines off') !== -1) {
        me.icn3d.draw();
      }
      else if(command.indexOf('set labels off') !== -1) {
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
         //me.icn3d.addHighlightObjects();
      }
      else if(command.indexOf('clear all') !== -1) {
         me.selectAll();
      }
      else if(command.indexOf('set mode all') !== -1) {
         me.setModeAndDisplay('all');
      }
      else if(command.indexOf('set mode selection') !== -1) {
         me.setModeAndDisplay('selection');
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
        html += "    <td valign='top'>" + me.setMenu5b() + "</td>";
        html += "    <td valign='top'>" + me.setMenu6() + "</td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "    <a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html' target='_blank'><span class='ui-icon ui-icon-help icn3d-middleIcon icn3d-link' title='click to see the help page'></span></a>";
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

        //$("#" + me.divid).css('background-color', me.GREYD);

        if(me.cfg.mmtfid === undefined) {
            if(me.realHeight < 300) {
                html += "    <div id='" + me.pre + "wait' style='position:absolute; top:100px; left:50px; font-size: 1.2em; color: #444444;'>Loading the structure...</div>";
            }
            else {
                html += "    <div id='" + me.pre + "wait' style='position:absolute; top:180px; left:50px; font-size: 1.8em; color: #444444;'>Loading the structure...</div>";
            }
        }
        html += "    <canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        // separate for the log box
        if(me.cfg.showcommand === undefined || me.cfg.showcommand) html += me.setLogWindow();

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

        $("#" + me.pre + "accordion5b").hover( function(){ $("#" + me.pre + "accordion5b div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion5b div").css("display", "none"); } );

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
        html += "                    <li><span id='" + me.pre + "menu1_mmtfid' class='icn3d-link'>MMTF ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_pdbid' class='icn3d-link'>PDB ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmcifid' class='icn3d-link'>mmCIF ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmdbid' class='icn3d-link'>MMDB ID</span></li>";
        //html += "                    <li><span id='" + me.pre + "menu1_term' class='icn3d-link'>Search MMDB term</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_gi' class='icn3d-link'>gi</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_cid' class='icn3d-link'>PubChem CID</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li><span id='" + me.pre + "menu1_align' class='icn3d-link'>Align</span></li>";
        html += "                <li>Open File";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_pdbfile' class='icn3d-link'>PDB File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmciffile' class='icn3d-link'>mmCIF File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mol2file' class='icn3d-link'>Mol2 File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_sdffile' class='icn3d-link'>SDF File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_xyzfile' class='icn3d-link'>XYZ File</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_urlfile' class='icn3d-link'>Url (Same Host) </span></li>";
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

        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_command'><label for='" + me.pre + "menu2_command'>Advanced</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_aroundsphere'><label for='" + me.pre + "menu2_aroundsphere'>by Distance</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectcomplement'><label for='" + me.pre + "menu2_selectcomplement'>Complement</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_select_chain'><label for='" + me.pre + "menu2_select_chain'>Defined Sets</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectall'><label for='" + me.pre + "menu2_selectall'>All</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectresidues'><label for='" + me.pre + "menu2_selectresidues'>Sequence</label></li>";
            if(me.cfg.mmdbid !== undefined || me.cfg.align !== undefined) {
                html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_2ddiagram'><label for='" + me.pre + "menu2_2ddiagram'>Interactions</label></li>";
            }
        }

        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_alignment'><label for='" + me.pre + "menu2_alignment'>Aligned Seq.</label></li>";
        }

        html += "                <li>Picking with<br>\"Alt\" + Click";
        html += "                  <ul>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue' checked><label for='" + me.pre + "menu2_pickingResidue'>Residue</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes'><label for='" + me.pre + "menu2_pickingYes'>Atom</label></li>";
        }
        else {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue'><label for='" + me.pre + "menu2_pickingResidue'>Residue (Alt)</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes' checked><label for='" + me.pre + "menu2_pickingYes'>Atom (Alt)</label></li>";
        }

        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Display";
        html += "                  <ul>";
        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_alternate'><label for='" + me.pre + "menu2_alternate'>Alternate (Key \"a\")</label></li>";
        }

        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_show_selected'><label for='" + me.pre + "menu2_show_selected'>Display Selection</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_selectedcenter'><label for='" + me.pre + "menu2_selectedcenter'>Zoom in Selection</label></li>";
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
        html += "              <h3 id='" + me.pre + "style'>Style</h3>";
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
                html += "                <li>Proteins";
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
        html += "              <h3 id='" + me.pre + "color'>Color</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        if(me.cfg.cid === undefined) {
            if(me.cfg.mmdbid !== undefined || me.cfg.align !== undefined) {
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
                html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorConserved' checked><label for='" + me.pre + "menu4_colorConserved'>Identity</label></li>";
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
        html += "              <h3 id='" + me.pre + "surface'>Surface</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li>Type";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceVDW'><label for='" + me.pre + "menu5_surfaceVDW'>Van der Waals</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceMolecular'><label for='" + me.pre + "menu5_surfaceMolecular'>Molecular Surface</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceSAS'><label for='" + me.pre + "menu5_surfaceSAS'>Solvent Accessible</label></li>";

        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceNothing' checked><label for='" + me.pre + "menu5_surfaceNothing'>Remove</label></li>";
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

    setMenu5b: function() { var me = this;
        var html = "";

        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion5b'>";
        html += "              <h3>&nbsp;Analysis</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        html += "                <li>Distance";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_distance' id='" + me.pre + "menu6_distanceYes'><label for='" + me.pre + "menu6_distanceYes'>Measure</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_distance' id='" + me.pre + "menu6_distanceNo' checked><label for='" + me.pre + "menu6_distanceNo'>Hide</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Label";
        html += "                  <ul>";

        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelYes'><label for='" + me.pre + "menu6_addlabelYes'>by Picking Atoms</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelSelection'><label for='" + me.pre + "menu6_addlabelSelection'>per Selection</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelResidues'><label for='" + me.pre + "menu6_addlabelResidues'>per Residue</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelNo' checked><label for='" + me.pre + "menu6_addlabelNo'>Remove</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        if(me.cfg.cid === undefined) {
            html += "                <li>-</li>";

            html += "                <li>H-Bonds to<br/>Selection";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsYes'><label for='" + me.pre + "menu6_hbondsYes'>Show</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsNo' checked><label for='" + me.pre + "menu6_hbondsNo'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

            html += "                <li>Disulfide Bonds";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_ssbonds' id='" + me.pre + "menu6_ssbondsYes'><label for='" + me.pre + "menu6_ssbondsYes'>Show</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_ssbonds' id='" + me.pre + "menu6_ssbondsNo' checked><label for='" + me.pre + "menu6_ssbondsNo'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

            html += "                <li>Cross-Linkages";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_clbonds' id='" + me.pre + "menu6_clbondsYes'><label for='" + me.pre + "menu6_clbondsYes'>Show</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_clbonds' id='" + me.pre + "menu6_clbondsNo' checked><label for='" + me.pre + "menu6_clbondsNo'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

            if(me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.mmcifid !== undefined) {
                html += "                <li>Assembly";
                html += "                  <ul>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyYes'><label for='" + me.pre + "menu6_assemblyYes'>Yes</label></li>";
                html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyNo' checked><label for='" + me.pre + "menu6_assemblyNo'>No</label></li>";
                html += "                  </ul>";
                html += "                </li>";
            }
        }

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

        html += "                <li>Display Mode";
        html += "                  <ul>";
        html += "                      <li><span id='" + me.pre + "menu6_modeall' class='icn3d-link'>Apply style, color, <br/>surface to all atoms</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_modeselection' class='icn3d-link'>Apply style, color, <br/>surface only to selection</span></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li><span id='" + me.pre + "menu6_center' class='icn3d-link'>Center</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_back' class='icn3d-link'>Backward</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_forward' class='icn3d-link'>Forward</span></li>";

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
        html += "                        </ul>";
        html += "                    </li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html' target='_blank'>Help</a></li>";
        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";

        return html;
    },

    setLogWindow: function() { var me = this;
        var html = "";

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
        html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
        html += "<button id='" + me.pre + "highlight_3d_diagram' style='margin-left:10px;'><span style='white-space:nowrap'><b>Highlight</b></span></button></div>";
        html += "  <div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
        html += "  </div>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_selectresidues'>";

        html += "  <div id='" + me.pre + "dl_sequence' class='icn3d-dl_sequence'>";
        html += "  </div>";

        html += "</div>";

        html += "<div id='" + me.pre + "dl_2ddiagram' class='icn3d-dl_2ddiagram'>";
        html += "</div>";

        if(me.cfg.align !== undefined) {
          html += "<div id='" + me.pre + "dl_alignment'>";
          html += "  <div id='" + me.pre + "dl_sequence2' class='icn3d-dl_sequence'>";
          html += "  </div>";
          html += "</div>";
        }

        html += "<div id='" + me.pre + "dl_command'>";
        html += "  <table width='500'><tr><td valign='top'><table>";
        html += "<tr><td align='right'><b>Select:</b></td><td><input type='text' id='" + me.pre + "command' placeholder='$[structures].[chains]:[residues]@[atoms]' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Name:</b></td><td><input type='text' id='" + me.pre + "command_name' placeholder='my_selection' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Description:</b></td><td><input type='text' id='" + me.pre + "command_desc' placeholder='description about my selection' size='30'></td></tr>";
        html += "<tr><td colspan='2' align='center'><button id='" + me.pre + "command_apply'><b>Save Selection</b></button></td></tr>";
        html += "  </table></td>";

        html += "  <td valign='top'><div>";
        html += "    <b>All Selections:</b> <br/>";
        html += "    <select id='" + me.pre + "customAtoms' multiple size='3' style='min-width:100px;'>";
        html += "    </select>";
        html += "  </td>";

        html += "  </td></tr>";

        html += "  <tr><td colspan='2'><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html$selectb' target='_blank'><span title='click to see how to select'><b>Hint</b></span></a>: <br/>";
        html += "  <b>Specification:</b> In the selection \"$1,2,3.A,B,C:5-10,Lys,ligands@CA,C\":";
        html += "  <ul><li>\"$1,2,3\" uses \"$\" to indicate structure selection.<br/>";
        html += "  <li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
        html += "  <li>\":5-10,Lys,ligands\" uses \":\" to indicate residue selection. Residue could be predefined names: \"proteins\", \"nucleotides\", \"ligands\", \"ions\", and \"water\".<br/>";
        html += "  <li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
        html += "  <li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/></ul>";
        html += "  <b>Set Operation:</b>";
        html += "  <ul><li>Users can select multiple items in \"All Selections\" above.<br/>";
        html += "  <li>Different selections can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, \":1-10 or :Lys\" selects all residues 1-10 and all Lys residues. \":1-10 and :Lys\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :Lys\" selects all residues 1-10, which are not Lys residues.</ul>";
        html += "  <b>Full commands in url or command window:</b>";
        html += "  <ul><li>Select without saving the set: select $1,2,3.A,B,C:5-10,Lys,ligands@CA,C<br/>";
        html += "  <li>Select and save: select $1,2,3.A,B,C:5-10,Lys,ligands@CA,C | name my_name | description my_description</ul>";
        html += "  </td></tr></table>";

        html += "</div>";

        html += "<div id='" + me.pre + "dl_mmtfid'>";
        html += "MMTF ID: <input type='text' id='" + me.pre + "mmtfid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_mmtf'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbid'>";
        html += "PDB ID: <input type='text' id='" + me.pre + "pdbid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_pdb'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbfile'>";
        html += "PDB File: <input type='file' id='" + me.pre + "pdbfile' size=8> ";
        html += "<button id='" + me.pre + "reload_pdbfile'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_align'>";
        html += "Enter the PDB IDs or MMDB IDs of two structures that have been found to be similar by <A HREF=' https://www.ncbi.nlm.nih.gov/Structure/VAST/vast.shtml'>VAST</A> or <A HREF=' https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi'>VAST+</A> : <br/><br/>ID1: <input type='text' id='" + me.pre + "alignid1' value='1HHO' size=8>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ID2: <input type='text' id='" + me.pre + "alignid2' value='4N7N' size=8><br/><br/>";
        html += "<button id='" + me.pre + "reload_align_refined'>Invariant Substructure Superposed</button>&nbsp;&nbsp;&nbsp;<button id='" + me.pre + "reload_align_ori'>All Matching Molecules Superposed</button>";
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
        html += "<div id='" + me.pre + "dl_urlfile'>";
        html += "File type: ";
        html += "<select id='" + me.pre + "filetype'>";
        html += "<option value='pdb' selected>pdb</option>";
        html += "<option value='mol2'>mol2</option>";
        html += "<option value='sdf'>sdf</option>";
        html += "<option value='xyz'>xyz</option>";
        html += "</select><br/>";
        html += "URL in the same host: <input type='text' id='" + me.pre + "urlfile' size=20><br/> ";
        html += "<button id='" + me.pre + "reload_urlfile'>Load</button>";
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
        html += "Custom Color: <input type='text' id='" + me.pre + "color' value='FF0000' size=8> ";
        html += "<button id='" + me.pre + "applycustomcolor'>Apply</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_hbonds'>";
        html += "<div style='width:400px;'>To select residues that have hydrogen bonds with the current selection, please select the threshold of H-bonds.</div><br/>";
        html += "  <span style='white-space:nowrap;font-weight:bold;'>Threshold: <select id='" + me.pre + "hbondthreshold'>";
        html += "  <option value='3.2'>3.2</option>";
        html += "  <option value='3.3'>3.3</option>";
        html += "  <option value='3.4'>3.4</option>";
        html += "  <option value='3.5' selected>3.5</option>";
        html += "  <option value='3.6'>3.6</option>";
        html += "  <option value='3.7'>3.7</option>";
        html += "  <option value='3.8'>3.8</option>";
        html += "  <option value='3.9'>3.9</option>";
        html += "  <option value='4.0'>4.0</option>";
        html += "  </select> &#197;</span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "applyhbonds'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_aroundsphere'";
        html += "  <span style='white-space:nowrap'>1. Sphere with a radius: <input type='text' id='" + me.pre + "radius_aroundsphere' value='4' size='2'> &#197;</span><br/>";
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
        html += "3. Color: <input type='text' id='" + me.pre + "labelcolor' value='ffff00' size=4><br/>";
        html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd' value='cccccc' size=4><br/>";
        html += "<span style='white-space:nowrap'>5. Pick TWO atoms while holding \"Alt\" key</span><br/>";
        html += "<span style='white-space:nowrap'>6. <button id='" + me.pre + "applypick_labels'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_addlabelselection'>";
        html += "1. Text: <input type='text' id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
        html += "2. Size: <input type='text' id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
        html += "3. Color: <input type='text' id='" + me.pre + "labelcolor2' value='ffff00' size=4><br/>";
        html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd2' value='cccccc' size=4><br/>";
        html += "<span style='white-space:nowrap'>5. <button id='" + me.pre + "applyselection_labels'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_distance'>";
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
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
        html += "    <table style='margin-top: 3px; width:100px;'><tr valign='center'>";

        html += "        <td valign='top'><div class='icn3d-commandTitle' style='min-width:40px; margin-top: 24px; white-space: nowrap;'><span id='" + me.pre + "modeall' title='Style, color, and surface menu options will be applied to all atoms in the structure'>All atoms</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style, color, and surface menu options will be applied only to selected atoms'>Selection</span></div>";
        html += "        <label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 12px 0px 0px 3px;' title='Left (\"All atoms\"): Style, color, and surface menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style, color, and surface menu options will be applied only to selected atoms'></div></label></td>";

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

        if(me.cfg.cid === undefined) {
            html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_sequences'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Show the sequences of the selected structure'>View<br/>Sequence</span></button></div></td>";

            if(me.cfg.align !== undefined) {
                html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_alignsequences'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Show the sequences of the aligned structures'>Aligned<br/>Sequence</span></button></div></td>";
            }

            if(me.cfg.mmdbid !== undefined || me.cfg.align !== undefined) {
                html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_2ddiagram'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Show the interactions of the structure'>View<br/>Interactions</span></button></div></td>";
            }

            html += "      <td valign='top'><div id='" + me.pre + "alternateWrapper' style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "alternate'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Alternate the structures'>Alternate<br/>(Key \"a\")</span></button></div></td>";
        }

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_selected'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Display ONLY the selected atoms'>Display Only<br/>Selection</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "toggleHighlight'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Turn on and off the 3D highlight in the viewer'>Toggle<br/>Highlight</span></button></div></td>";

        //html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "clearall'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Clear all selections'>Clear<br/>All</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "resetorientation'><span style='white-space:nowrap' class='icn3d-commandTitle' title='Reset Orientation'>Reset<br/>Orientation</span></button></div></td>";

        html += "    </tr></table>";
        html += "    </div>";

        return html;
    },

    updateMenus: function(bInitial) { var me = this;
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
       if(bInitial) me.setProteinsNucleotidesLigands();

       this.updateMenus(bInitial);

       var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), undefined, undefined, bShowHighlight);

       $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
       $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

       if(me.cfg.align !== undefined) {
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
           me.remove2DHighlight();

           me.bSelectResidue = false;
           me.bSelectAlignResidue = false;

           me.selectAllUpdateMenuSeq(true, false);

           me.setMode('all');
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

           var sequencesHtml = "<b>Annotation(s):</b> Complement of the current selection<br/>";

           me.highlightResidues(Object.keys(residuesHash), sequencesHtml);
    },

    updateSeqWin2DWinForCurrentAtoms: function(bShowHighlight) { var me = this;
           var residuesHash = me.icn3d.getResiduesFromAtoms(me.icn3d.highlightAtoms);

           var seqObj = me.getSequencesAnnotations(undefined, false, Object.keys(residuesHash), bShowHighlight);
           $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

           if(me.cfg.align !== undefined) {
               seqObj = me.getAlignSequencesAnnotations(undefined, false, Object.keys(residuesHash), bShowHighlight);

               $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
               $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
           }

           // update 2D window
           var chainsHash = {};
           for(var i in me.icn3d.highlightAtoms) {
			   var atom = me.icn3d.atoms[i];
			   var chainid = atom.structure + "_" + atom.chain;

			   chainsHash[chainid] = 1;
		   }

		   me.add2DHighlight(Object.keys(chainsHash));
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
           me.setLogCommand("toggle selection", true);
           me.toggleSelection();
        });
    },

    clickHlColorYellow: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorYellow").click(function(e) {
           me.setLogCommand("set highlight color yellow", true);
           me.icn3d.highlightColor = new THREE.Color(0xFFFF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorGreen: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorGreen").click(function(e) {
           me.setLogCommand("set highlight color green", true);
           me.icn3d.highlightColor = new THREE.Color(0x00FF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('green');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlColorRed: function() { var me = this;
        $("#" + me.pre + "menu2_hl_colorRed").click(function(e) {
           me.setLogCommand("set highlight color red", true);
           me.icn3d.highlightColor = new THREE.Color(0xFF0000);
           me.icn3d.matShader = me.icn3d.setOutlineColor('red');
           me.icn3d.draw(); // required to make it work properly
        });
    },

    clickHlStyleOutline: function() { var me = this;
        $("#" + me.pre + "menu2_hl_styleOutline").click(function(e) {
           me.setLogCommand("set highlight style outline", true);
           me.icn3d.bHighlight = 1;

           me.icn3d.draw();
        });
    },

    clickHlStyleObject: function() { var me = this;
        $("#" + me.pre + "menu2_hl_styleObject").click(function(e) {
           me.setLogCommand("set highlight style 3d", true);
           me.icn3d.bHighlight = 2;

           me.icn3d.draw();
        });
    },

    clickAlternate: function() { var me = this;
        $("#" + me.pre + "alternate").add("#" + me.pre + "menu2_alternate").click(function(e) {
           me.setLogCommand("alternate structures", false);
           me.icn3d.alternateStructures();
        });
    },

    //menu 1
    clickMenu1_mmtfid: function() { var me = this;
        $("#" + me.pre + "menu1_mmtfid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmtfid', 'Please input MMTF ID');
        });
    },

    clickMenu1_pdbid: function() { var me = this;
        $("#" + me.pre + "menu1_pdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_pdbid', 'Please input PDB ID');
        });
    },

    clickMenu1_align: function() { var me = this;
        $("#" + me.pre + "menu1_align").click(function(e) {
           me.openDialog(me.pre + 'dl_align', 'Please input two PDB IDs or MMDB IDs');
        });
    },

    clickMenu1_pdbfile: function() { var me = this;
        $("#" + me.pre + "menu1_pdbfile").click(function(e) {
           me.openDialog(me.pre + 'dl_pdbfile', 'Please input PDB File');
        });
    },

    clickMenu1_mol2file: function() { var me = this;
        $("#" + me.pre + "menu1_mol2file").click(function(e) {
           me.openDialog(me.pre + 'dl_mol2file', 'Please input Mol2 File');
        });
    },
    clickMenu1_sdffile: function() { var me = this;
        $("#" + me.pre + "menu1_sdffile").click(function(e) {
           me.openDialog(me.pre + 'dl_sdffile', 'Please input SDF File');
        });
    },
    clickMenu1_xyzfile: function() { var me = this;
        $("#" + me.pre + "menu1_xyzfile").click(function(e) {
           me.openDialog(me.pre + 'dl_xyzfile', 'Please input XYZ File');
        });
    },
    clickMenu1_urlfile: function() { var me = this;
        $("#" + me.pre + "menu1_urlfile").click(function(e) {
           me.openDialog(me.pre + 'dl_urlfile', 'Load data by URL');
        });
    },

    clickMenu1_mmciffile: function() { var me = this;
        $("#" + me.pre + "menu1_mmciffile").click(function(e) {
           me.openDialog(me.pre + 'dl_mmciffile', 'Please input mmCIF File');
        });
    },

    clickMenu1_mmcifid: function() { var me = this;
        $("#" + me.pre + "menu1_mmcifid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmcifid', 'Please input mmCIF ID');
        });
    },

    clickMenu1_mmdbid: function() { var me = this;
        $("#" + me.pre + "menu1_mmdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmdbid', 'Please input MMDB ID');
        });
    },

    clickMenu1_gi: function() { var me = this;
        $("#" + me.pre + "menu1_gi").click(function(e) {
           me.openDialog(me.pre + 'dl_gi', 'Please input protein gi');
        });
    },

    clickMenu1_cid: function() { var me = this;
        $("#" + me.pre + "menu1_cid").click(function(e) {
           me.openDialog(me.pre + 'dl_cid', 'Please input PubChem CID');
        });
    },

    clickMenu1_state: function() { var me = this;
        $("#" + me.pre + "menu1_state").click(function(e) {
           me.openDialog(me.pre + 'dl_state', 'Please input the state file');
        });
    },

    clickMenu1_selection: function() { var me = this;
        $("#" + me.pre + "menu1_selection").click(function(e) {
           me.openDialog(me.pre + 'dl_selection', 'Please input the selection file');
        });
    },

    clickMenu1_exportState: function() { var me = this;
        $("#" + me.pre + "menu1_exportState").click(function (e) {
           me.setLogCommand("export state file", false);

           me.saveFile(me.inputid + '_statefile.txt', 'command');
        });
    },

    clickMenu1_exportCanvas: function() { var me = this;
        $("#" + me.pre + "menu1_exportCanvas").click(function (e) {
           me.setLogCommand("export canvas", false);

           me.saveFile(me.inputid + '_image.png', 'png');
        });
    },

    clickMenu1_exportCounts: function() { var me = this;
        $("#" + me.pre + "menu1_exportCounts").click(function (e) {
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
           me.setLogCommand("export all selections", false);

           var text = me.exportCustomAtoms();

           me.saveFile(me.inputid + '_selections.txt', 'text', text);
        });
    },

    clickMenu1_sharelink: function() { var me = this;
        $("#" + me.pre + "menu1_sharelink").click(function (e) {
           var url = "./full.html?";

           var pos = -1;
           if(me.cfg.inpara !== undefined) pos = me.cfg.inpara.indexOf('&command=');
           var inparaWithoutCommand = (pos !== -1 ) ? me.cfg.inpara.substr(0, pos) : me.cfg.inpara;

           url += inparaWithoutCommand.substr(1) + '&command=';

		   var transformation = {};
		   transformation.factor = me.icn3d._zoomFactor;
		   transformation.mouseChange = me.icn3d.mouseChange;
		   transformation.quaternion = me.icn3d.quaternion;

           for(var i = 1, il = me.icn3d.commands.length; i < il; ++i) {
               var command_tf = me.icn3d.commands[i].split('|||');

               if(i === il - 1) {
                   //var transformation = (command_tf.length > 1) ? ('|||' + command_tf[1]) : '';
                   if(i !== 1) {
                       url += '; ';
                   }
                   url += command_tf[0] + '|||' + JSON.stringify(transformation);
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
           var url = me.getLinkToStructureSummary(true);

           window.open(url, '_blank');
        });
    },

    clickMenu1_link_bind: function() { var me = this;
        $("#" + me.pre + "menu1_link_bind").click(function (e) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + me.inputid;
           me.setLogCommand("link to 3D protein structures bound to CID " + me.inputid + ": " + url, false);

           window.open(url, '_blank');
        });
    },

    clickMenu1_link_vast: function() { var me = this;
        $("#" + me.pre + "menu1_link_vast").click(function (e) {
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
           me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');
        });
    },

    clickMenu2_selectall: function() { var me = this;
        $("#" + me.pre + "menu2_selectall").click(function (e) {
           me.setLogCommand("select all", true);

           me.selectAll();

           //me.icn3d.addHighlightObjects();
           me.icn3d.draw();

        });

        $("#" + me.pre + "clearall").click(function (e) {
           me.setLogCommand("clear all", true);

           me.selectAll();

           me.icn3d.draw();

        });

    },

    clickMenu2_selectcomplement: function() { var me = this;
        $("#" + me.pre + "menu2_selectcomplement").click(function (e) {
           if(Object.keys(me.icn3d.highlightAtoms).length < Object.keys(me.icn3d.atoms).length) {
               me.setLogCommand("select complement", true);

               me.selectComplement();
           }
        });
    },

    clickMenu2_alignment: function() { var me = this;
        $("#" + me.pre + "menu2_alignment").click(function (e) {
           me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clickMenu2_command: function() { var me = this;
        $("#" + me.pre + "menu2_command").click(function (e) {
           me.openDialog(me.pre + 'dl_command', 'Advanced set selection');
        });
    },

    clickMenu2_pickingNo: function() { var me = this;
        $("#" + me.pre + "menu2_pickingNo").click(function (e) {
           me.icn3d.picking = 0;
           me.icn3d.options['picking'] = 'no';
           me.setLogCommand('set picking off', true);

           me.icn3d.draw();
           me.icn3d.removeHighlightObjects();
        });
    },

    clickMenu2_pickingYes: function() { var me = this;
        $("#" + me.pre + "menu2_pickingYes").click(function (e) {
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.setLogCommand('set picking atom', true);
        });
    },

    clickMenu2_pickingResidue: function() { var me = this;
        $("#" + me.pre + "menu2_pickingResidue").click(function (e) {
           me.icn3d.picking = 2;
           me.icn3d.options['picking'] = 'residue';
           me.setLogCommand('set picking residue', true);
        });
    },

    clickMenu2_pickingStrand: function() { var me = this;
        $("#" + me.pre + "menu2_pickingStrand").click(function (e) {
           me.icn3d.picking = 3;
           me.icn3d.options['picking'] = 'strand';
           me.setLogCommand('set picking strand', true);
        });
    },

    clickMenu2_aroundsphere: function() { var me = this;
        $("#" + me.pre + "menu2_aroundsphere").click(function (e) {
           me.openDialog(me.pre + 'dl_aroundsphere', 'Select a sphere around current selection');
        });
    },

    clickMenu2_select_chain: function() { var me = this;
        $("#" + me.pre + "menu2_select_chain").click(function (e) {
           me.openDialog(me.pre + 'dl_select_chain', 'Select Structure/Chain/Custom Selection');
        });
    },

    // menu 3
    clickmenu3_proteinsRibbon: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsRibbon").click(function (e) {
           me.setStyle('proteins', 'ribbon');
           me.setLogCommand('style proteins ribbon', true);
        });
    },

    clickmenu3_proteinsStrand: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsStrand").click(function (e) {
           me.setStyle('proteins', 'strand');

           me.setLogCommand('style proteins strand', true);
        });
    },

    clickmenu3_proteinsCylinder: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsCylinder").click(function (e) {
           me.setStyle('proteins', 'cylinder and plate');
           me.setLogCommand('style proteins cylinder and plate', true);
        });
    },

    clickMenu3_proteinsSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsSchematic").click(function (e) {
           me.setStyle('proteins', 'schematic');
           me.setLogCommand('style proteins schematic', true);
        });
    },

    clickmenu3_proteinsCalpha: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsCalpha").click(function (e) {
           me.setStyle('proteins', 'c alpha trace');
           me.setLogCommand('style proteins c alpha trace', true);
        });
    },

    clickmenu3_proteinsBfactor: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsBfactor").click(function (e) {
           me.setStyle('proteins', 'b factor tube');
           me.setLogCommand('style proteins b factor tube', true);
        });
    },

    clickmenu3_proteinsLines: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsLines").click(function (e) {
           me.setStyle('proteins', 'lines');
           me.setLogCommand('style proteins lines', true);
        });
    },

    clickmenu3_proteinsStick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsStick").click(function (e) {
           me.setStyle('proteins', 'stick');
           me.setLogCommand('style proteins stick', true);
        });
    },

    clickmenu3_proteinsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsBallstick").click(function (e) {
           me.setStyle('proteins', 'ball and stick');
           me.setLogCommand('style proteins ball and stick', true);
        });
    },

    clickmenu3_proteinsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsSphere").click(function (e) {
           me.setStyle('proteins', 'sphere');
           me.setLogCommand('style proteins sphere', true);
        });
    },

    clickmenu3_proteinsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_proteinsNothing").click(function (e) {
           me.setStyle('proteins', 'nothing');
           me.setLogCommand('style proteins nothing', true);
        });
    },

    clickMenu3_sidechainsLines: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsLines").click(function (e) {
           me.setStyle('sidechains', 'lines');
           me.setLogCommand('style sidechains lines', true);
        });
    },

    clickMenu3_sidechainsStick: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsStick").click(function (e) {
           me.setStyle('sidechains', 'stick');
           me.setLogCommand('style sidechains stick', true);
        });
    },

    clickMenu3_sidechainsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsBallstick").click(function (e) {
           me.setStyle('sidechains', 'ball and stick');
           me.setLogCommand('style sidechains ball and stick', true);
        });
    },

    clickMenu3_sidechainsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsSphere").click(function (e) {
           me.setStyle('sidechains', 'sphere');
           me.setLogCommand('style sidechains sphere', true);
        });
    },

    clickMenu3_sidechainsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_sidechainsNothing").click(function (e) {
           me.setStyle('sidechains', 'nothing');
           me.setLogCommand('style sidechains nothing', true);
        });
    },


    clickmenu3_nuclCartoon: function() { var me = this;
        $("#" + me.pre + "menu3_nuclCartoon").click(function (e) {
           me.setStyle('nucleotides', 'nucleotide cartoon');
           me.setLogCommand('style nucleotides nucleotide cartoon', true);
        });
    },

    clickmenu3_nuclSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_nuclSchematic").click(function (e) {
           me.setStyle('nucleotides', 'schematic');
           me.setLogCommand('style nucleotides schematic', true);
        });
    },

    clickmenu3_nuclPhos: function() { var me = this;
        $("#" + me.pre + "menu3_nuclPhos").click(function (e) {
           me.setStyle('nucleotides', 'phosphorus trace');
           me.setLogCommand('style nucleotides phosphorus trace', true);
        });
    },

    clickmenu3_nuclLines: function() { var me = this;
        $("#" + me.pre + "menu3_nuclLines").click(function (e) {
           me.setStyle('nucleotides', 'lines');
           me.setLogCommand('style nucleotides lines', true);
        });
    },

    clickmenu3_nuclStick: function() { var me = this;
        $("#" + me.pre + "menu3_nuclStick").click(function (e) {
           me.setStyle('nucleotides', 'stick');
           me.setLogCommand('style nucleotides stick', true);
        });
    },

    clickmenu3_nuclBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_nuclBallstick").click(function (e) {
           me.setStyle('nucleotides', 'ball and stick');
           me.setLogCommand('style nucleotides ball and stick', true);
        });
    },

    clickmenu3_nuclSphere: function() { var me = this;
        $("#" + me.pre + "menu3_nuclSphere").click(function (e) {
           me.setStyle('nucleotides', 'sphere');
           me.setLogCommand('style nucleotides sphere', true);
        });
    },

    clickmenu3_nuclNothing: function() { var me = this;
        $("#" + me.pre + "menu3_nuclNothing").click(function (e) {
           me.setStyle('nucleotides', 'nothing');
           me.setLogCommand('style nucleotides nothing', true);
        });
    },

    clickMenu3_ligandsLines: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsLines").click(function (e) {
           me.setStyle('ligands', 'lines');
           me.setLogCommand('style ligands lines', true);
        });
    },

    clickMenu3_ligandsStick: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsStick").click(function (e) {
           me.setStyle('ligands', 'stick');
           me.setLogCommand('style ligands stick', true);
        });
    },

    clickMenu3_ligandsBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsBallstick").click(function (e) {
           me.setStyle('ligands', 'ball and stick');
           me.setLogCommand('style ligands ball and stick', true);
        });
    },

    clickMenu3_ligandsSchematic: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsSchematic").click(function (e) {
           me.setStyle('ligands', 'schematic');
           me.setLogCommand('style ligands schematic', true);
        });
    },

    clickMenu3_ligandsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsSphere").click(function (e) {
           me.setStyle('ligands', 'sphere');
           me.setLogCommand('style ligands sphere', true);
        });
    },

    clickMenu3_ligandsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_ligandsNothing").click(function (e) {
           me.setStyle('ligands', 'nothing');
           me.setLogCommand('style ligands nothing', true);
        });
    },

    clickMenu3_ionsSphere: function() { var me = this;
        $("#" + me.pre + "menu3_ionsSphere").click(function (e) {
           me.setStyle('ions', 'sphere');
           me.setLogCommand('style ions sphere', true);
        });
    },

    clickMenu3_ionsDot: function() { var me = this;
        $("#" + me.pre + "menu3_ionsDot").click(function (e) {
           me.setStyle('ions', 'dot');
           me.setLogCommand('style ions dot', true);
        });
    },

    clickMenu3_ionsNothing: function() { var me = this;
        $("#" + me.pre + "menu3_ionsNothing").click(function (e) {
           me.setStyle('ions', 'nothing');
           me.setLogCommand('style ions nothing', true);
        });
    },

    clickMenu3_waterSphere: function() { var me = this;
        $("#" + me.pre + "menu3_waterSphere").click(function (e) {
           me.setStyle('water', 'sphere');
           me.setLogCommand('style water sphere', true);
        });
    },

    clickMenu3_waterDot: function() { var me = this;
        $("#" + me.pre + "menu3_waterDot").click(function (e) {
           me.setStyle('water', 'dot');
           me.setLogCommand('style water dot', true);
        });
    },

    clickMenu3_waterNothing: function() { var me = this;
        $("#" + me.pre + "menu3_waterNothing").click(function (e) {
           me.setStyle('water', 'nothing');
           me.setLogCommand('style water nothing', true);
        });
    },

    // menu 4
    clickMenu4_colorSpectrum: function() { var me = this;
        $("#" + me.pre + "menu4_colorSpectrum").click(function (e) {
           me.setOption('color', 'spectrum');
           me.setLogCommand('color spectrum', true);
        });
    },

    clickMenu4_colorChain: function() { var me = this;
        $("#" + me.pre + "menu4_colorChain").click(function (e) {
           me.setOption('color', 'chain');
           me.setLogCommand('color chain', true);
        });
    },

    clickMenu4_colorSS: function() { var me = this;
        $("#" + me.pre + "menu4_colorSS").click(function (e) {
           me.setOption('color', 'secondary structure');
           me.setLogCommand('color secondary structure', true);
        });
    },

    clickMenu4_colorResidue: function() { var me = this;
        $("#" + me.pre + "menu4_colorResidue").click(function (e) {
           me.setOption('color', 'residue');
           me.setLogCommand('color residue', true);
        });
    },

    clickMenu4_colorCharge: function() { var me = this;
        $("#" + me.pre + "menu4_colorCharge").click(function (e) {
           me.setOption('color', 'charge');
           me.setLogCommand('color charge', true);
        });
    },

    clickMenu4_colorHydrophobic: function() { var me = this;
        $("#" + me.pre + "menu4_colorHydrophobic").click(function (e) {
           me.setOption('color', 'hydrophobic');
           me.setLogCommand('color hydrophobic', true);
        });
    },

    clickMenu4_colorAtom: function() { var me = this;
        $("#" + me.pre + "menu4_colorAtom").click(function (e) {
           me.setOption('color', 'atom');
           me.setLogCommand('color atom', true);
        });
    },

    clickMenu4_colorConserved: function() { var me = this;
        $("#" + me.pre + "menu4_colorConserved").click(function (e) {
           me.setOption('color', 'conserved');
           me.setLogCommand('color conserved', true);
        });
    },

    clickMenu4_colorRed: function() { var me = this;
        $("#" + me.pre + "menu4_colorRed").click(function (e) {
           me.setOption('color', 'red');
           me.setLogCommand('color red', true);
        });
    },

    clickMenu4_colorGreen: function() { var me = this;
        $("#" + me.pre + "menu4_colorGreen").click(function (e) {
           me.setOption('color', 'green');
           me.setLogCommand('color green', true);
        });
    },

    clickMenu4_colorBlue: function() { var me = this;
        $("#" + me.pre + "menu4_colorBlue").click(function (e) {
           me.setOption('color', 'blue');
           me.setLogCommand('color blue', true);
        });
    },

    clickMenu4_colorMagenta: function() { var me = this;
        $("#" + me.pre + "menu4_colorMagenta").click(function (e) {
           me.setOption('color', 'magenta');
           me.setLogCommand('color magenta', true);
        });
    },

    clickMenu4_colorYellow: function() { var me = this;
        $("#" + me.pre + "menu4_colorYellow").click(function (e) {
           me.setOption('color', 'yellow');
           me.setLogCommand('color yellow', true);
        });
    },

    clickMenu4_colorCyan: function() { var me = this;
        $("#" + me.pre + "menu4_colorCyan").click(function (e) {
           me.setOption('color', 'cyan');
           me.setLogCommand('color cyan', true);
        });
    },

    clickMenu4_colorWhite: function() { var me = this;
        $("#" + me.pre + "menu4_colorWhite").click(function (e) {
           me.setOption('color', 'white');
           me.setLogCommand('color white', true);
        });
    },

    clickMenu4_colorGrey: function() { var me = this;
        $("#" + me.pre + "menu4_colorGrey").click(function (e) {
           me.setOption('color', 'grey');
           me.setLogCommand('color grey', true);
        });
    },

    clickMenu4_colorCustom: function() { var me = this;
        $("#" + me.pre + "menu4_colorCustom").click(function (e) {
           me.openDialog(me.pre + 'dl_color', 'Choose custom color');
        });
    },

    // menu 5
    clickMenu5_neighborsYes: function() { var me = this;
        $("#" + me.pre + "menu5_neighborsYes").click(function (e) {
           me.icn3d.bConsiderNeighbors = true;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCommand('set surface neighbors on', true);
        });
    },

    clickMenu5_neighborsNo: function() { var me = this;
        $("#" + me.pre + "menu5_neighborsNo").click(function (e) {
           me.icn3d.bConsiderNeighbors = false;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           me.icn3d.render();

           me.setLogCommand('set surface neighbors off', true);
        });
    },

    clickMenu5_surfaceVDW: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceVDW").click(function (e) {
           me.setOption('surface', 'Van der Waals surface');
           me.setLogCommand('set surface Van der Waals surface', true);
        });
    },

    clickMenu5_surfaceSAS: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceSAS").click(function (e) {
           me.setOption('surface', 'solvent accessible surface');
           me.setLogCommand('set surface solvent accessible surface', true);
        });
    },

    clickMenu5_surfaceMolecular: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceMolecular").click(function (e) {
           me.setOption('surface', 'molecular surface');
           me.setLogCommand('set surface molecular surface', true);
        });
    },

    clickMenu5_surfaceNothing: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceNothing").click(function (e) {
           me.setOption('surface', 'nothing');
           me.setLogCommand('set surface nothing', true);
        });
    },

    clickMenu5_opacity10: function() { var me = this;
        $("#" + me.pre + "menu5_opacity10").click(function (e) {
           me.setOption('opacity', '1.0');
           me.setLogCommand('set surface opacity 1.0', true);
        });
    },

    clickMenu5_opacity09: function() { var me = this;
        $("#" + me.pre + "menu5_opacity09").click(function (e) {
           me.setOption('opacity', '0.9');
           me.setLogCommand('set surface opacity 0.9', true);
        });
    },

    clickMenu5_opacity08: function() { var me = this;
        $("#" + me.pre + "menu5_opacity08").click(function (e) {
           me.setOption('opacity', '0.8');
           me.setLogCommand('set surface opacity 0.8', true);
        });
    },

    clickMenu5_opacity07: function() { var me = this;
        $("#" + me.pre + "menu5_opacity07").click(function (e) {
           me.setOption('opacity', '0.7');
           me.setLogCommand('set surface opacity 0.7', true);
        });
    },

    clickMenu5_opacity06: function() { var me = this;
        $("#" + me.pre + "menu5_opacity06").click(function (e) {
           me.setOption('opacity', '0.6');
           me.setLogCommand('set surface opacity 0.6', true);
        });
    },

    clickMenu5_opacity05: function() { var me = this;
        $("#" + me.pre + "menu5_opacity05").click(function (e) {
           me.setOption('opacity', '0.5');
           me.setLogCommand('set surface opacity 0.5', true);
        });
    },

    clickMenu5_wireframeYes: function() { var me = this;
        $("#" + me.pre + "menu5_wireframeYes").click(function (e) {
           me.setOption('wireframe', 'yes');
           me.setLogCommand('set surface wireframe on', true);
        });
    },

    clickMenu5_wireframeNo: function() { var me = this;
        $("#" + me.pre + "menu5_wireframeNo").click(function (e) {
           me.setOption('wireframe', 'no');
           me.setLogCommand('set surface wireframe off', true);
        });
    },

    // menu 6
    clickMenu6_assemblyYes: function() { var me = this;
        $("#" + me.pre + "menu6_assemblyYes").click(function (e) {
           me.icn3d.bAssembly = true;
           me.setLogCommand('set assembly on', true);
           me.icn3d.draw();
        });
    },

    clickMenu6_assemblyNo: function() { var me = this;
        $("#" + me.pre + "menu6_assemblyNo").click(function (e) {
           me.icn3d.bAssembly = false;
           me.setLogCommand('set assembly off', true);
           me.icn3d.draw();
        });
    },

    clickMenu6_addlabelResidues: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelResidues").click(function (e) {
           me.setLogCommand('add residue labels', true);

           me.icn3d.addResiudeLabels(me.icn3d.highlightAtoms);

             me.saveSelectionIfSelected();
           me.icn3d.draw();
        });
    },

    clickMenu6_addlabelYes: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelYes").click(function (e) {
           me.openDialog(me.pre + 'dl_addlabel', 'Add custom labels by picking');
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pickedatomNum = 0;
        });
    },

    clickMenu6_addlabelSelection: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelSelection").click(function (e) {
           me.openDialog(me.pre + 'dl_addlabelselection', 'Add custom labels by the current selection');
        });
    },

    clickMenu6_addlabelNo: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelNo").click(function (e) {
           me.icn3d.pickpair = false;

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
           me.openDialog(me.pre + 'dl_distance', 'Measure the distance of atoms');
           me.icn3d.picking = 1;
           me.icn3d.options['picking'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pickedatomNum = 0;
        });
    },

    clickMenu6_distanceNo: function() { var me = this;
        $("#" + me.pre + "menu6_distanceNo").click(function (e) {
           me.icn3d.pickpair = false;

           var select = "set lines off";
           me.setLogCommand(select, true);

           me.icn3d.labels['distance'] = [];
           me.icn3d.lines['distance'] = [];

           me.icn3d.draw();
        });
    },

    clickmenu2_selectedcenter: function() { var me = this;
        $("#" + me.pre + "menu2_selectedcenter").add("#" + me.pre + "zoomin_selection").click(function (e) {
           me.setLogCommand('zoom selection', true);

           me.icn3d.zoominSelection();
        });
    },

    clickMenu6_center: function() { var me = this;
        $("#" + me.pre + "menu6_center").click(function (e) {
           me.setLogCommand('center selection', true);

           me.icn3d.centerSelection();
        });
    },

    clickMenu6_resetorientation: function() { var me = this;
        $("#" + me.pre + "menu6_resetorientation").add("#" + me.pre + "resetorientation").click(function (e) {
           me.setLogCommand('reset orientation', true);

           me.icn3d.resetOrientation();
        });
    },


    clickMenu6_rotateleft: function() { var me = this;
        $("#" + me.pre + "menu6_rotateleft").click(function (e) {
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
           me.setOption('camera', 'perspective');
           me.setLogCommand('set camera perspective', true);
        });
    },

    clickMenu6_cameraOrth: function() { var me = this;
        $("#" + me.pre + "menu6_cameraOrth").click(function (e) {
           me.setOption('camera', 'orthographic');
           me.setLogCommand('set camera orthographic', true);
        });
    },

    clickMenu6_bkgdBlack: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdBlack").click(function (e) {
           me.setOption('background', 'black');
           me.setLogCommand('set background black', true);
        });
    },

    clickMenu6_bkgdGrey: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdGrey").click(function (e) {
           me.setOption('background', 'grey');
           me.setLogCommand('set background grey', true);
        });
    },

    clickMenu6_bkgdWhite: function() { var me = this;
        $("#" + me.pre + "menu6_bkgdWhite").click(function (e) {
           me.setOption('background', 'white');
           me.setLogCommand('set background white', true);
        });
    },

    clickMenu6_showfogYes: function() { var me = this;
        $("#" + me.pre + "menu6_showfogYes").click(function (e) {
           me.setOption('fog', 'yes');
           me.setLogCommand('set fog on', true);
        });
    },

    clickMenu6_showfogNo: function() { var me = this;
        $("#" + me.pre + "menu6_showfogNo").click(function (e) {
           me.setOption('fog', 'no');
           me.setLogCommand('set fog off', true);
        });
    },

    clickMenu6_showslabYes: function() { var me = this;
        $("#" + me.pre + "menu6_showslabYes").click(function (e) {
           me.setOption('slab', 'yes');
           me.setLogCommand('set slab on', true);
        });
    },

    clickMenu6_showslabNo: function() { var me = this;
        $("#" + me.pre + "menu6_showslabNo").click(function (e) {
           me.setOption('slab', 'no');
           me.setLogCommand('set slab off', true);
        });
    },

    clickMenu6_showaxisYes: function() { var me = this;
        $("#" + me.pre + "menu6_showaxisYes").click(function (e) {
           me.setOption('axis', 'yes');
           me.setLogCommand('set axis on', true);
        });
    },

    clickMenu6_showaxisNo: function() { var me = this;
        $("#" + me.pre + "menu6_showaxisNo").click(function (e) {
           me.setOption('axis', 'no');
           me.setLogCommand('set axis off', true);
        });
    },

    clickMenu6_hbondsYes: function() { var me = this;
        $("#" + me.pre + "menu6_hbondsYes").click(function (e) {
           me.openDialog(me.pre + 'dl_hbonds', 'Hydrogen bonds to selection');
        });
    },

    clickMenu6_hbondsNo: function() { var me = this;
        $("#" + me.pre + "menu6_hbondsNo").click(function (e) {
           me.icn3d.options["hbonds"] = "no";

           var select = "set hbonds off";
           me.setLogCommand(select, true);

           me.icn3d.lines['hbond'] = [];

           me.setStyle('sidechains', 'nothing');
           me.setStyle('water', 'nothing');
        });
    },

    clickMenu6_ssbondsYes: function() { var me = this;
        $("#" + me.pre + "menu6_ssbondsYes").click(function (e) {
           var select = "disulfide bonds";
           me.setLogCommand(select, true);

           me.showSsbonds();
        });
    },

    clickMenu6_ssbondsNo: function() { var me = this;
        $("#" + me.pre + "menu6_ssbondsNo").click(function (e) {
           me.icn3d.options["ssbonds"] = "no";

           var select = "set disulfide bonds off";
           me.setLogCommand(select, true);

           me.icn3d.lines['ssbond'] = [];

           me.setStyle('sidechains', 'nothing');
        });
    },

    clickMenu6_clbondsYes: function() { var me = this;
        $("#" + me.pre + "menu6_clbondsYes").click(function (e) {
           var select = "cross linkage";
           me.setLogCommand(select, true);

           me.icn3d.bShowCrossResidueBond = true;
           //me.options['proteins'] = 'lines';

           //me.icn3d.draw();
           me.setStyle('proteins', 'lines')
        });
    },

    clickMenu6_clbondsNo: function() { var me = this;
        $("#" + me.pre + "menu6_clbondsNo").click(function (e) {
           me.icn3d.options["clbonds"] = "no";

           var select = "set cross linkage off";
           me.setLogCommand(select, true);

           me.icn3d.bShowCrossResidueBond = false;
           //me.options['proteins'] = 'ribbon';

           //me.icn3d.draw();
           me.setStyle('proteins', 'ribbon')
        });
    },

    setMode: function(mode) { var me = this;
    	if(mode === 'all') { // mode all
			// set text
			$("#" + me.pre + "modeall").show();
			$("#" + me.pre + "modeselection").hide();

			$("#" + me.pre + "modeswitch")[0].checked = false;

			if($("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").removeClass('icn3d-modeselection');
			if($("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").removeClass('icn3d-modeselection');
			if($("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").removeClass('icn3d-modeselection');
		}
		else { // mode selection
			// set text
			$("#" + me.pre + "modeall").hide();
			$("#" + me.pre + "modeselection").show();

			$("#" + me.pre + "modeswitch")[0].checked = true;

			if(!$("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").addClass('icn3d-modeselection');
			if(!$("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").addClass('icn3d-modeselection');
			if(!$("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").addClass('icn3d-modeselection');
		}
	},

    setModeAndDisplay: function(mode) { var me = this;
    	if(mode === 'all') { // mode all
			me.setMode('all');

			// remember previous selection
			me.icn3d.prevHighlightAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

           // select all
           me.setLogCommand("set mode all", true);

           me.selectAll();

           me.icn3d.draw();
		}
		else { // mode selection
			me.setMode('selection');

			// get the previous highlightAtoms
			if(me.icn3d.prevHighlightAtoms !== undefined) {
				me.icn3d.highlightAtoms = me.icn3d.cloneHash(me.icn3d.prevHighlightAtoms);
			}
			else {
				me.selectAll();
			}

            me.setLogCommand("set mode selection", true);

			// select highlightAtoms
			var residueHash = {};
			for(var i in me.icn3d.highlightAtoms) {
				var resid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
				residueHash[resid] = 1;
			}

			me.highlightResidues(Object.keys(residueHash));
		}
	},

    // other
    clickModeswitch: function() { var me = this;
        $("#" + me.pre + "modeswitch").click(function (e) {
			if($("#" + me.pre + "modeswitch")[0].checked) { // mode: selection
				me.setModeAndDisplay('selection');
			}
			else { // mode: all
				me.setModeAndDisplay('all');
			}
        });

        $("#" + me.pre + "menu6_modeall").click(function (e) {
			me.setModeAndDisplay('all');
        });

        $("#" + me.pre + "menu6_modeselection").click(function (e) {
			me.setModeAndDisplay('selection');
        });
    },

    removeSelection: function() { var me = this;
		  me.removeSeqChainBkgd();
		  me.removeSeqResidueBkgd();

		  me.selectedResidues = {};
		  me.icn3d.highlightAtoms = {};

		  me.icn3d.removeHighlightObjects();

		  me.remove2DHighlight();
	},

    selectSequenceNonMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").selectable({
          stop: function() {
			  if($(this).attr('id') === me.pre + "dl_sequence") {
				  me.bAlignSeq = false;
			  }
			  else if($(this).attr('id') === me.pre + "dl_sequence2") {
				  me.bAlignSeq = true;
			  }

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              if(me.bSelectResidue === false) {
                  me.removeSelection();
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

              // get all chainid in the selected residues
              var chainHash = {};
              for(var residueid in me.selectedResidues) {
                  var pos = residueid.lastIndexOf('_');
                  var chainid = residueid.substr(0, pos);

                  chainHash[chainid] = 1;
              }

              // highlight the nodes
              var chainArray2d = Object.keys(chainHash);
              me.add2DHighlight(chainArray2d);

              // update menu
              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select annotation title
              $(".ui-selected", this).each(function() {
                  var currChain = $(this).attr('chain');
                  if($(this).hasClass('icn3d-seqTitle')) {
                    if(me.bAlignSeq) {
                        me.bSelectAlignResidue = false;
                    }
                    else {
                        me.bSelectResidue = false;
                    }

                    me.removeSeqChainBkgd(currChain);
                    me.removeSeqResidueBkgd();

                    $(this).toggleClass('icn3d-highlightSeq');

                    var chainid = $(this).attr('chain');
                    var commandname;

                    if(me.bAlignSeq) {
                        commandname = "align_" + chainid;
                    }
                    else {
                        commandname = chainid;
                    }

                    if($(this).hasClass('icn3d-highlightSeq')) {
                        if(me.bAlignSeq) {
                            me.selectAAlignChain(chainid, commandname);
                            me.setLogCommand('select alignChain ' + chainid, true);
                        }
                        else {
                            me.selectAChain(chainid, commandname);
                            me.setLogCommand('select chain ' + chainid, true);
                        }
                    }
                    else {
                        me.icn3d.removeHighlightObjects();
                        me.remove2DHighlight();

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
      $("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").on('click', '.icn3d-residue', function(e) {
		  if($(this).attr('id') === me.pre + "dl_sequence") {
			  me.bAlignSeq = false;
		  }
		  else if($(this).attr('id') === me.pre + "dl_sequence2") {
			  me.bAlignSeq = true;
		  }

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

                  if( (!me.bAlignSeq && me.bSelectResidue === false) || (me.bAlignSeq && me.bSelectAlignResidue === false) ) {
                      me.removeSelection();

                      if(me.bAlignSeq) {
                          me.bSelectAlignResidue = true;
                      }
                      else {
                          me.bSelectResidue = true;
                      }
                  }

                $(this).toggleClass('icn3d-highlightSeq');

                var residueid = id.substr(id.indexOf('_') + 1);
                if($(this).hasClass('icn3d-highlightSeq')) {
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

          me.icn3d.addHighlightObjects();

          // get all chainid in the selected residues
          var chainHash = {};
          for(var residueid in me.selectedResidues) {
              var pos = residueid.lastIndexOf('_');
              var chainid = residueid.substr(0, pos);

              chainHash[chainid] = 1;
          }

          // clear nodes in 2d diagram
          me.remove2DHighlight();

          // highlight the nodes
          var chainArray2d = Object.keys(chainHash);
          me.add2DHighlight(chainArray2d);
      });
    },

    selectChainMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").on('click', '.icn3d-seqTitle', function(e) {
		  if($(this).attr('id') === me.pre + "dl_sequence") {
			  me.bAlignSeq = false;
		  }
		  else if($(this).attr('id') === me.pre + "dl_sequence2") {
			  me.bAlignSeq = true;
		  }

          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

            var currChain = $(this).attr('chain');

            if(me.bAlignSeq) {
                me.bSelectAlignResidue = false;
            }
            else {
                me.bSelectResidue = false;
            }

            me.removeSeqChainBkgd(currChain);
            me.removeSeqResidueBkgd();

            // select annotation title
            $(this).toggleClass('icn3d-highlightSeq');

            var chainid = $(this).attr('chain');
            var commandname;
            if(me.bAlignSeq) {
                commandname = "align_" + chainid;
            }
            else {
                commandname = chainid;
            }

            if($(this).hasClass('icn3d-highlightSeq')) {
                if(me.bAlignSeq) {
                    me.selectAAlignChain(chainid, commandname);
                    me.setLogCommand('select alignChain ' + chainid, true);
                }
                else {
                    me.selectAChain(chainid, commandname);
                    me.setLogCommand('select chain ' + chainid, true);
                }
            }
            else {
                me.icn3d.removeHighlightObjects();
                me.remove2DHighlight();

                me.icn3d.highlightAtoms = {};

               $("#" + me.pre + "customResidues").val("");
               $("#" + me.pre + "customResidues2").val("");
               $("#" + me.pre + "customAtoms").val("");
            }
      });
    },

    clickStructureid: function() { var me = this;
        $("#" + me.pre + "structureid").change(function(e) {
           var moleculeArray = $(this).val();
           $("#" + me.pre + "structureid2").val("");

           me.changeStructureid(moleculeArray);
        });

        $("#" + me.pre + "structureid2").change(function(e) {
           var moleculeArray = $(this).val();
           $("#" + me.pre + "structureid").val("");

           me.changeStructureid(moleculeArray);
        });

        $("#" + me.pre + "structureid").focus(function(e) {
           if(me.isMobile()) { // mobile has some problem in selecting
               $("#" + me.pre + "structureid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "structureid option").length);
        });

        $("#" + me.pre + "structureid").blur(function(e) {
           $(this).attr('size', 1);
        });
    },

    clickChainid: function() { var me = this;
        $("#" + me.pre + "chainid").change(function(e) {
           var chainArray = $(this).val();
           $("#" + me.pre + "chainid2").val("");

           me.changeChainid(chainArray);
        });

        $("#" + me.pre + "chainid2").change(function(e) {
           var chainArray = $(this).val();
           $("#" + me.pre + "chainid").val("");

           me.changeChainid(chainArray);
        });

        $("#" + me.pre + "chainid").focus(function(e) {
           if(me.isMobile()) {
               $("#" + me.pre + "chainid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "chainid option").length);
        });

        $("#" + me.pre + "chainid").blur(function(e) {
           $(this).attr('size', 1);
        });
    },

    clickAlignChainid: function() { var me = this;
        $("#" + me.pre + "alignChainid").change(function(e) {
           var alignChainArray = $(this).val();
           $("#" + me.pre + "alignChainid2").val();

           me.changeAlignChainid(alignChainArray);
        });

        $("#" + me.pre + "alignChainid2").change(function(e) {
           var alignChainArray = $(this).val();
           $("#" + me.pre + "alignChainid").val();

           me.changeAlignChainid(alignChainArray);
        });

        $("#" + me.pre + "alignChainid").focus(function(e) {
           if(me.isMobile()) {
               $("#" + me.pre + "alignChainid").val("");
           }

           $(this).attr('size', $("#" + me.pre + "alignChainid option").length);
        });

        $("#" + me.pre + "alignChainid").blur(function(e) {
           $(this).attr('size', 1);
        });
    },

    clickCustomResidues: function() { var me = this;
        $("#" + me.pre + "customResidues").change(function(e) {
           var nameArray = $(this).val();
           $("#" + me.pre + "customResidues2").val("");

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved selection ' + nameArray.toString(), true);

             me.changeCustomResidues(nameArray);
           }
        });

        $("#" + me.pre + "customResidues2").change(function(e) {
           var nameArray = $(this).val();
           $("#" + me.pre + "customResidues").val("");

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved selection ' + nameArray.toString(), true);

             me.changeCustomResidues(nameArray);
           }
        });

        $("#" + me.pre + "customResidues").focus(function(e) {
           if(me.isMobile()) {
               $("#" + me.pre + "customResidues").val("");
           }

           $(this).attr('size', $("#" + me.pre + "customResidues option").length);
        });

        $("#" + me.pre + "customResidues").blur(function(e) {
           $(this).attr('size', 1);
        });
    },

    clickCustomAtoms: function() { var me = this;
        $("#" + me.pre + "customAtoms").change(function(e) {
           var nameArray = $(this).val();

           if(nameArray !== null) {
             // log the selection
             me.setLogCommand('select saved atoms ' + nameArray.toString(), true);

             me.changeCustomAtoms(nameArray);
           }
        });

        $("#" + me.pre + "customAtoms").focus(function(e) {
           if(me.isMobile()) $("#" + me.pre + "customAtoms").val("");
        });
    },

    clickShow_selected: function() { var me = this;
        $("#" + me.pre + "show_selected").add("#" + me.pre + "menu2_show_selected").click(function(e) {
           me.setLogCommand("show selection", true);

           me.showSelection();
        });
    },

    clickShow_sequences: function() { var me = this;
        $("#" + me.pre + "show_sequences").click(function(e) {
             me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');
        });
    },

    clickShow_alignsequences: function() { var me = this;
        $("#" + me.pre + "show_alignsequences").click(function(e) {
             me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
        });
    },

    clickShow_2ddiagram: function() { var me = this;
        $("#" + me.pre + "show_2ddiagram").add("#" + me.pre + "menu2_2ddiagram").click(function(e) {
             me.openDialog(me.pre + 'dl_2ddiagram', 'Interactions');
        });
    },

    clickShow_selected_atom: function() { var me = this;
        $("#" + me.pre + "show_selected_atom").click(function(e) {
           e.preventDefault();

           me.setLogCommand("show selection", true);
           me.showSelection();
        });
    },

    clickCommand_apply: function() { var me = this;
        $("#" + me.pre + "command_apply").click(function(e) {
           e.preventDefault();

           var select = $("#" + me.pre + "command").val();
           var commandname = $("#" + me.pre + "command_name").val().replace(/;/g, '_').replace(/\s+/g, '_');
           var commanddesc = $("#" + me.pre + "command_desc").val().replace(/;/g, '_').replace(/\s+/g, '_');

           me.setLogCommand('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);

           me.selectByCommand(select, commandname, commanddesc);
        });
    },

    clickReload_mmtf: function() { var me = this;
        $("#" + me.pre + "reload_mmtf").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmtfid=' + $("#" + me.pre + "mmtfid").val(), '_blank');
        });
    },

    clickReload_pdb: function() { var me = this;
        $("#" + me.pre + "reload_pdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load pdb " + $("#" + me.pre + "pdbid").val(), false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
        });
    },

    clickReload_align_refined: function() { var me = this;
        $("#" + me.pre + "reload_align_refined").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCommand("load alignment " + alignment + ' | parameters &atype=1', false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=1', '_blank');
        });
    },

    clickReload_align_ori: function() { var me = this;
        $("#" + me.pre + "reload_align_ori").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCommand("load alignment " + alignment + ' | parameters &atype=0', false);

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=0', '_blank');
        });
    },

    clickReload_mmcif: function() { var me = this;
        $("#" + me.pre + "reload_mmcif").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);

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

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');
        });
    },

    clickReload_cid: function() { var me = this;
        $("#" + me.pre + "reload_cid").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load cid " + $("#" + me.pre + "cid").val(), false);

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

               me.loadXyzData(dataStr);
             };

             reader.readAsText(file);
           }

        });
    },

    clickReload_urlfile: function() { var me = this;
        $("#" + me.pre + "reload_urlfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var type = $("#" + me.pre + "filetype").val();
           var url = $("#" + me.pre + "urlfile").val();

           me.downloadUrl(url, type);
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

               me.icn3d.moleculeTitle = "";

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

             me.setLogCommand('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background + ' | type custom', true);

             me.addLabel(text, x, y, z, size, color, background, 'custom');

             me.icn3d.pickpair = false;

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

             me.icn3d.pickpair = false;

             me.icn3d.draw();
           }
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            me.setLogCommand("reset", true);

            //reset me.icn3d.maxD
            me.icn3d.maxD = me.icn3d.oriMaxD;
            me.icn3d.center = me.icn3d.oriCenter.clone();

            me.icn3d.reinitAfterLoad();

            me.renderFinalStep(1);

            me.setMode('all');

            me.removeSeqChainBkgd();
            me.removeSeqResidueBkgd();
        });
    },

    toggleHighlight: function() { var me = this;
            me.setLogCommand("toggle highlight", true);

            if(me.icn3d.prevHighlightObjects.length > 0) { // remove
                me.icn3d.removeHighlightObjects();
                me.remove2DHighlight();
                me.icn3d.render();

                me.removeSeqChainBkgd();
                me.removeSeqResidueBkgd();

                me.bSelectResidue = false;
            }
            else { // add
                me.icn3d.addHighlightObjects();
                me.updateSeqWin2DWinForCurrentAtoms();
/*
                var chainHash = {};
                for(var i in me.icn3d.highlightAtoms) {
                    var chainid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain;
                    chainHash[chainid] = 1;
                }
                me.add2DHighlight(Object.keys(chainHash));
*/
                me.bSelectResidue = true;
            }
    },

    clearHighlight: function() { var me = this;
            me.setLogCommand("clear selection", true);

            //if(me.icn3d.prevHighlightObjects.length > 0) { // remove
                me.icn3d.removeHighlightObjects();
                me.remove2DHighlight();
                me.icn3d.render();

                me.removeSeqChainBkgd();
                me.removeSeqResidueBkgd();

                me.bSelectResidue = false;
            //}
    },

    clickToggleHighlight: function() { var me = this;
        $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function (e) {
            me.toggleHighlight();
        });

        $(document).on("click", "#" + me.pre + "seq_clearselection", function(e) {
            me.clearHighlight();
        });

        $(document).on("click", "#" + me.pre + "alignseq_clearselection", function(e) {
            me.clearHighlight();
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
              var lastCommand = commandArray[commandArray.length - 1].substr(2); // skip "> "
              me.icn3d.logs.push(lastCommand);
              $("#" + me.pre + "logtext").val("> " + me.icn3d.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);

              if(lastCommand !== '') {
                var transformation = {};
                transformation.factor = me.icn3d._zoomFactor;
                transformation.mouseChange = me.icn3d.mouseChange;
                transformation.quaternion = me.icn3d.quaternion;

                me.icn3d.commands.push(lastCommand + '|||' + JSON.stringify(transformation));
                me.icn3d.optionsHistory.push(me.icn3d.cloneHash(me.icn3d.options));
                me.icn3d.optionsHistory[me.icn3d.optionsHistory.length - 1].hlatomcount = Object.keys(me.icn3d.highlightAtoms).length;

                if(me.isSessionStorageSupported()) me.saveCommandsToSession();

                me.STATENUMBER = me.icn3d.commands.length;

                if(lastCommand.indexOf('load') !== -1) {
                    me.applyCommandLoad(lastCommand);
                }
                else {
                    me.applyCommand(lastCommand + '|||' + JSON.stringify(transformation));
                }

                me.saveSelectionIfSelected();
                me.icn3d.draw();
              }
           }

           me.bAddLogs = true;
        });
    },

    clickFilter_ckbx_all: function() { var me = this;
        $("#" + me.pre + "filter_ckbx_all").click(function (e) {
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

    saveSelection: function(name, description) { var me = this;
            //if(Object.keys(me.selectedResidues).length === 0) {
                for(var i in me.icn3d.highlightAtoms) {
                    var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                    me.selectedResidues[residueid] = 1;
                }
            //}

            me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name + ' | description ' + description, true);

            me.selectResidueList(me.selectedResidues, name, description);

            me.updateSelectionNameDesc();
    },

    clickSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "seq_saveselection", function(e) {
           me.bSelectResidue = false;

           var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
           var description = $("#" + me.pre + "seq_command_desc").val();

           me.saveSelection(name, description);
        });
    },

    clickAlignSeqSaveSelection: function() { var me = this;
        $(document).on("click", "#" + me.pre + "alignseq_saveselection", function(e) {
            me.bSelectAlignResidue = false;

            var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
            var description = $("#" + me.pre + "alignseq_command_desc").val();

            me.saveSelection(name, description);
/*
            if(Object.keys(me.selectedResidues).length === 0) {
                for(var i in me.icn3d.highlightAtoms) {
                    var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                    me.selectedResidues[residueid] = 1;
                }
            }

            me.setLogCommand('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name + ' | description ' + description, true);

            me.selectResidueList(me.selectedResidues, name, description);

            me.updateSelectionNameDesc();
*/
        });
    },

    clickOutputSelection: function() { var me = this;
        $(document).on("click", "." + me.pre + "outputselection", function(e) {
            me.bSelectResidue = false;
            me.bSelectAlignResidue = false;
            me.setLogCommand('output selection', true);
            me.outputSelection();
        });
    },

	highlightNode: function(type, highlight, base, ratio) { var me = this;
	    if(ratio < 0.2) ratio = 0.2;

    	if(type === 'rect') {
            $(highlight).attr('stroke', me.ORANGE);
            var x = Number($(base).attr('x'));
            var y = Number($(base).attr('y'));
            var width = Number($(base).attr('width'));
            var height = Number($(base).attr('height'));
            $(highlight).attr('x', x + width / 2.0 * (1 - ratio));
            $(highlight).attr('y', y + height / 2.0 * (1 - ratio));
            $(highlight).attr('width', width * ratio);
            $(highlight).attr('height', height * ratio);
    	}
    	else if(type === 'circle') {
            $(highlight).attr('stroke', me.ORANGE);
            $(highlight).attr('r', Number($(base).attr('r')) * ratio);
		}
		else if(type === 'polygon') {
            $(highlight).attr('stroke', me.ORANGE);
            var x = Number($(base).attr('x0'));
            var y = Number($(base).attr('y1'));
            var x0 = Number($(base).attr('x0'));
            var y0 = Number($(base).attr('y0'));
            var x1 = Number($(base).attr('x1'));
            var y1 = Number($(base).attr('y1'));
            $(highlight).attr('points', x0 + ", " + (y+(y0-y)*ratio).toString() + ", " + (x+(x1-x)*ratio).toString() + ", " + y1 + ", " + x0 + ", " + (y-(y0-y)*ratio).toString() + ", " + (x-(x1-x)*ratio).toString() + ", " + y1);
		}
	},

    click2Ddiagram: function() { var me = this;
        $("#" + me.pre + "dl_2ddiagram").on("click", ".icn3d-node", function(e) {
			me.setMode('selection');

            me.bClickInteraction = false;

            var chainid = $(this).attr('chainid');

            // clear all nodes
            if(!me.icn3d.bCtrlKey && !me.icn3d.bShiftKey) {
                me.removeSelection();
            }

            //$(this).find('rect').attr('stroke', me.ORANGE);
            //$(this).find('circle').attr('stroke', me.ORANGE);
            //$(this).find('polygon').attr('stroke', me.ORANGE);

			var ratio = 1.0;
			if(me.icn3d.alignChains[chainid] !== undefined) ratio = 1.0 * Object.keys(me.icn3d.alignChains[chainid]).length / Object.keys(me.icn3d.chains[chainid]).length;

			var target = $(this).find("rect[class='icn3d-hlnode']");
			var base = $(this).find("rect[class='icn3d-basenode']");
			me.highlightNode('rect', target, base, ratio);

			target = $(this).find("circle[class='icn3d-hlnode']");
			base = $(this).find("circle[class='icn3d-basenode']");
            me.highlightNode('circle', target, base, ratio);

			target = $(this).find("polygon[class='icn3d-hlnode']");
			base = $(this).find("polygon[class='icn3d-basenode']");
			me.highlightNode('polygon', target, base, ratio);

            // highlight on 3D structure
            me.icn3d.removeHighlightObjects();

            if(!me.icn3d.bCtrlKey && !me.icn3d.bShiftKey) {
                me.icn3d.highlightAtoms = me.icn3d.cloneHash(me.icn3d.chains[chainid]);
            }
            else {
                me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chainid]);
            }

            me.icn3d.addHighlightObjects();

            // highlight on 2D sequence
            if(!me.icn3d.bCtrlKey && !me.icn3d.bShiftKey) {
                me.chainArray2d = [chainid];
            }
            else {
                if(me.chainArray2d === undefined) me.chainArray2d = [];
                me.chainArray2d.push(chainid);
            }

            var seqObj = me.getSequencesAnnotations(me.chainArray2d);

            $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
            $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

            if(me.cfg.align !== undefined) {
                seqObj = me.getAlignSequencesAnnotations(me.chainArray2d);

                $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
            }

            // highlight the condensed view
            if(me.icn3d.bSSOnly) { // the condensed view with only secondary structure information
			    var molid2ss = {}, molid2color = {};
			    for(var i = 0, il = me.chainArray2d.length; i < il; ++i) {
                    var molid = me.icn3d.chain2molid[me.chainArray2d[i]];
                    molid2ss[molid] = me.icn3d.molid2ss[molid];
                    molid2color[molid] = me.icn3d.molid2color[molid];
                }

                me.icn3d.drawHelixBrick(molid2ss, molid2color, me.icn3d.bHighlight);

                me.icn3d.render();
            }

            var select = "select chain " + chainid;
            me.setLogCommand(select, true);
        });

        $("#" + me.pre + "dl_2ddiagram").on("click", ".icn3d-interaction", function(e) {
			me.setMode('selection');

            me.bClickInteraction = true;

            var chainid1 = $(this).attr('chainid1');
            var chainid2 = $(this).attr('chainid2');

            $(this).find('line').attr('stroke', me.ORANGE);

            // interaction of chain1 with chain2, only show the part of chain1 interacting with chain2
            me.selectInteraction(chainid1, chainid2);

            var select = "select interaction " + chainid1 + "," + chainid2;
            me.setLogCommand(select, true);

            me.bClickInteraction = false;
        });
    },

    selectInteraction: function (chainid1, chainid2) {   var me = this;
            // clear all nodes
            //if(!me.icn3d.bCtrlKey && !me.icn3d.bShiftKey) {
            //    me.remove2DHighlight();
            //}
            me.remove2DHighlight();

            // highlight on 2D sequence
            // no ctrl and shift keys for lines(interactions) selections
            me.lineArray2d = [chainid1, chainid2];

            // highlight on 3D structure
            me.icn3d.removeHighlightObjects();

            //var prevHighlightAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

            //if(!me.icn3d.bCtrlKey && !me.icn3d.bShiftKey) {
                // set highlightAtoms
            //    me.selectInteractionAtoms(chainid1, chainid2);
            //}
            //else {
                // set highlightAtoms
            //    me.selectInteractionAtoms(chainid1, chainid2);
            //    me.icn3d.highlightAtoms = me.icn3d.unionHash(prevHighlightAtoms, me.icn3d.highlightAtoms);
            //}

            me.selectInteractionAtoms(chainid1, chainid2);

            me.icn3d.addHighlightObjects();


            me.updateSeqWin2DWinForCurrentAtoms(true);
    },

    selectInteractionAtoms: function (chainid1, chainid2) {   var me = this; // me.icn3d.pickedatom is set already
        var radius = 4;

    	// Method 1. calculated on the fly
/*
        var atomlistTarget = {};

        for(var i in me.icn3d.highlightAtoms) {
          atomlistTarget[i] = me.icn3d.atoms[i];
        }

        // select all atom, not just displayed atoms

        // find atoms in chainid2, which interact with chainid1
        //var atomsChainid2 = me.icn3d.getAtomsWithinAtom(me.icn3d.hash2Atoms(me.icn3d.chains[chainid2]), me.icn3d.hash2Atoms(me.icn3d.chains[chainid1]), radius);
        // find atoms in chainid1, which interact with atomsChainid2
        //var atomsChainid1 = me.icn3d.getAtomsWithinAtom(me.icn3d.hash2Atoms(me.icn3d.chains[chainid1]), atomsChainid2, radius);

        //me.icn3d.highlightAtoms = me.icn3d.unionHash(atomsChainid1, atomsChainid2);

        // find atoms in chainid1, which interact with chainid2
        var atomsChainid1 = me.icn3d.getAtomsWithinAtom(me.icn3d.hash2Atoms(me.icn3d.chains[chainid1]), me.icn3d.hash2Atoms(me.icn3d.chains[chainid2]), radius);

        me.icn3d.highlightAtoms = me.icn3d.cloneHash(atomsChainid1);

        var residues = {}, atomArray = [];

        for (var i in me.icn3d.highlightAtoms) {
            var atom = me.icn3d.atoms[i];
            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;

            atomArray.push(i);
        }

        var residueArray = Object.keys(residues);
*/


        // Method 2. Retrieved from the cgi
        var residueArray = me.chainids2resids[chainid1][chainid2];
        me.icn3d.highlightAtoms = {};
        var atomArray = [];
        for(var i = 0, il = residueArray.length; i < il; ++i) {
			me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.residues[residueArray[i]]);
			for(var serial in me.icn3d.residues[residueArray[i]]) {
				atomArray.push(serial);
			}
		}

        var commandname, commanddesc;
        if(Object.keys(me.icn3d.structures).length > 1) {
            commandname = "inter_" + chainid1 + "_" + chainid2;
        }
        else {
            var pos1 = chainid1.indexOf('_');
            var pos2 = chainid2.indexOf('_');

            commandname = "inter_" + chainid1.substr(pos1 + 1) + "_" + chainid2.substr(pos2 + 1);
        }

        commanddesc = "select the atoms in chain " + chainid1 + " interacting with chain " + chainid2 + " in a distance of " + radius + " angstrom";

        var select = "select interaction " + chainid1 + "," + chainid2;

        me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, true);

        var nameArray = [commandname];

        me.changeCustomResidues(nameArray);

        //me.saveSelectionIfSelected();

        //me.icn3d.draw();
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
        me.clickModeswitch();

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
        me.clickMenu1_mmtfid();
        me.clickMenu1_pdbid();
        me.clickMenu1_align();
        me.clickMenu1_pdbfile();
        me.clickMenu1_mol2file();
        me.clickMenu1_sdffile();
        me.clickMenu1_xyzfile();
        me.clickMenu1_urlfile();
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
        me.clickmenu2_selectedcenter();
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
        me.clickMenu6_ssbondsYes();
        me.clickMenu6_ssbondsNo();
        me.clickMenu6_clbondsYes();
        me.clickMenu6_clbondsNo();
        me.clickStructureid();
        me.clickChainid();
        me.clickAlignChainid();
        me.clickCustomResidues();
        me.clickCustomAtoms();
        me.clickShow_selected();
        me.clickShow_sequences();
        me.clickShow_alignsequences();
        me.clickShow_2ddiagram();
        me.clickShow_selected_atom();
        me.clickCommand_apply();
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
        me.click2Ddiagram();
        me.bindMouseup();
        me.bindMousedown();
        me.windowResize();
    },

    allCustomEvents: function() { var me = this;
      // add custom events here
    }
  };

