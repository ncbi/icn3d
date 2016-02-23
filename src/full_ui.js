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

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    me.inputid = '';

    me.RESIDUE_WIDTH = 10;  // sequences
    me.MENU_HEIGHT = 40;

    // used to set the position for the log/command textarea
    me.MENU_WIDTH = 690;

    me.LESSWIDTH = 20;
    me.LESSHEIGHT = 20;

    me.ROTATION_DIRECTION = 'right';
    me.HIDE_SELECTION = true;
    me.ALTERNATE_STRUCTURE = -1;

    me.EXTRAHEIGHT = 2*me.MENU_HEIGHT;
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
        me.EXTRAHEIGHT = 0;
    }

    me.SELECT_RESIDUE = false;
    me.selectedResidues = {};

    me.CRASHED = false;
    me.prevCommands = "";

    me.options = {};
    me.options['camera']             = 'perspective';        //perspective, orthographic
    me.options['background']         = 'black';              //black, grey, white
    me.options['color']              = 'spectrum';           //spectrum, secondary structure, charge, chain, residue, atom, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.options['sidechains']         = 'nothing';            //lines, stick, ball & stick, sphere, nothing
    me.options['secondary']          = 'ribbon';             //ribbon, strand, cylinder & plate, C alpha trace, B factor tube, lines, stick, ball & stick, sphere, nothing
    me.options['surface']            = 'nothing';    //Van der Waals surface, solvent excluded surface, solvent accessible surface, molecular surface, nothing
    me.options['opacity']            = '0.8';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.options['wireframe']          = 'no';                 //yes, no
    me.options['ligands']            = 'stick';              //lines, stick, ball & stick, sphere, nothing
    me.options['water']              = 'nothing';            //sphere, dot, nothing
    me.options['ions']               = 'sphere';             //sphere, dot, nothing
    me.options['hbonds']             = 'no';                 //yes, no
    me.options['labels']             = 'no';                 //yes, no
    me.options['lines']                   = 'no';                 //yes, no
    me.options['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.options['axis']               = 'no';                 //yes, no
    me.options['picking']            = 'residue';                 //no, atom, residue, strand
    me.options['nucleotides']        = 'phosphorus trace';   //nucleotide cartoon, phosphorus trace, lines, stick, ball & stick, sphere, nothing

    me.options['surfaceregion']      = 'nothing';            //nothing, all, sphere

    if(me.cfg.cid !== undefined) {
        me.options['picking'] = 'atom';
        me.options['ligands'] = 'ball & stick';
    }

    me.modifyIcn3d();

};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    // modify iCn3D function
    modifyIcn3d: function() {var me = this;
        me.modifyIcn3dShowPicking();
    },

    modifyIcn3dShowPicking: function() {var me = this;
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
          else if(this.picking === 3) {
              this.selectStrandHelixFromAtom(atom);
          }

          this.addHighlightObjects();

          if(this.picking === 1) {
              me.removeSeqChainBkgd();
              me.removeSeqResidueBkgd();
          }
          else if(this.picking === 2) {
              // highlight the sequence background
              var idArray = this.id.split('_'); // id: div0_canvas
              me.pre = idArray[0] + "_";

              var pickedResidue = atom.structure + '_' + atom.chain + '_' + atom.resi;

              me.clearSelection();

              me.removeSeqChainBkgd();
              me.removeSeqResidueBkgd();

              if($("#" + me.pre + pickedResidue).length !== 0) {
                $("#" + me.pre + pickedResidue).addClass('highlightSeq');
              }
          }
          else if(this.picking === 3) {
              // highlight the sequence background
              var idArray = this.id.split('_'); // id: div0_canvas
              me.pre = idArray[0] + "_";

              var firstAtom = this.getFirstAtomObj(this.highlightAtoms);
              var lastAtom = this.getLastAtomObj(this.highlightAtoms);

              me.clearSelection();

              me.removeSeqChainBkgd();
              me.removeSeqResidueBkgd();

              for(var i = firstAtom.resi; i <= lastAtom.resi; ++i) {
                  var pickedResidue = atom.structure + '_' + atom.chain + '_' + i;

                  if($("#" + me.pre + pickedResidue).length !== 0) {
                    $("#" + me.pre + pickedResidue).addClass('highlightSeq');
                    }
              }
          }

          var transformation = {};
          transformation.factor = this._zoomFactor;
          transformation.mouseChange = this.mouseChange;
          transformation.quaternion = this.quaternion;
          //this.transformation.push(transformation);

          this.commands.push('pickatom ' + atom.serial + '|||' + JSON.stringify(transformation));

          this.logs.push('pickatom ' + atom.serial + ' (chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
          if ( $( "#" + me.pre + "logtext" ).length )  {
            $("#" + me.pre + "logtext").val("> " + this.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
          }
        };
    },

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this;
      me.deferred = $.Deferred(function() {
        if(me.isSessionStorageSupported()) me.getCommandsBeforeCrash();

        var width = window.innerWidth, height = window.innerHeight;

        if(me.cfg.width.toString().indexOf('%') !== -1) {
          width = width * me.cfg.width.substr(0, me.cfg.width.toString().indexOf('%')) / 100.0 - me.LESSWIDTH;
        }
        else {
          width = me.cfg.width;
        }

        if(me.cfg.height.toString().indexOf('%') !== -1) {
          height = height * me.cfg.height.substr(0, me.cfg.height.toString().indexOf('%')) / 100.0 - me.EXTRAHEIGHT - me.LESSHEIGHT;
        }
        else {
          height = me.cfg.height;
        }

        me.setTopMenusHtml(me.divid);

        me.allEventFunctions();

        me.allCustomEvents();

        if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
          me.EXTRAHEIGHT = 0;
          me.hideMenu(width, height);
        }
        else {
          me.EXTRAHEIGHT = 2*me.MENU_HEIGHT;
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
        if(me.isSessionStorageSupported() && me.CRASHED) {
            me.CRASHED = false;

            var loadCommand = me.commandsBeforeCrash.split('|||')[0];
            var id = loadCommand.substr(loadCommand.lastIndexOf(' ') + 1);

            // reload only if viewing the same structure
            if(id === me.cfg.pdbid || id === me.cfg.mmdbid || id === me.cfg.gi || id === me.cfg.cid || id === me.cfg.mmcif || id === me.cfg.align) {
                me.loadScript(me.commandsBeforeCrash);

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

            me.setLogCommand('load mmdb ' + me.cfg.mmdbid, true);

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

            me.icn3d.moleculeTitle = 'PubChem CID ' + me.cfg.cid;

            me.setLogCommand('load cid ' + me.cfg.cid, true);

            me.downloadCid(me.cfg.cid);
        }
        else if(me.cfg.mmcif !== undefined) {
           me.inputid = me.cfg.mmcif;

            //me.icn3d.moleculeTitle = 'mmCIF ' + me.cfg.mmcif.toUpperCase();

            me.setLogCommand('load mmcif ' + me.cfg.mmcif, true);

            me.downloadMmcif(me.cfg.mmcif);
        }
        else if(me.cfg.align !== undefined) {
            var alignArray = me.cfg.align.split(','); // e.g., 6 IDs: 103701,1,4,68563,1,167 [mmdbid1,biounit,molecule,mmdbid2,biounit,molecule], or 2IDs: 103701,68563 [mmdbid1,mmdbid2]

            if(alignArray.length === 6) {
                me.inputid = alignArray[0] + "_" + alignArray[3];
            }
            else if(alignArray.length === 2) {
                me.inputid = alignArray[0] + "_" + alignArray[1];
            }

            me.setLogCommand('load alignment ' + me.cfg.align, true);

            me.downloadAlignment(me.cfg.align);
        }
        else {
            alert("Please input a gi, MMDB ID, PDB ID, CID, or mmCIF...");
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
        $( ".seqTitle" ).each(function( index ) {
          if(currChain === undefined) {
              $( this ).removeClass('highlightSeq');
          }
          else {
              if($(this).attr('chain') !== currChain) $( this ).removeClass('highlightSeq');
          }
        });
    },

    // remove all highlighted residue color
    removeSeqResidueBkgd: function() {
        $( ".residue" ).each(function( index ) {
          $( this ).removeClass('highlightSeq');
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

    resizeCanvas: function (width, height) { var me = this;
      if(me.cfg.resize !== undefined && me.cfg.resize && !me.isMobile() ) {

        var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
        $("#" + me.pre + "canvas").width(width).height(heightTmp);

        $("#" + me.pre + "viewer").width(width).height(height);

        me.icn3d.setWidthHeight(width, heightTmp);

        me.icn3d.draw();
      }
    },

    setOption: function (id, value) { var me = this;
      //var options2 = {};
      //options2[id] = value;

      // remember the options
      me.icn3d.options[id] = value;

      if(id === 'color') {
          me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.highlightAtoms);

          //me.icn3d.draw(options2);
          me.icn3d.draw();
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          me.icn3d.removeSurfaces();
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
          case 'protein':
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

    setLogCommand: function (str, bSetCommand) { var me = this;
      var transformation = {};
      transformation.factor = me.icn3d._zoomFactor;
      transformation.mouseChange = me.icn3d.mouseChange;
      transformation.quaternion = me.icn3d.quaternion;
      //me.icn3d.transformation.push(transformation);

      if(bSetCommand) {
        me.icn3d.commands.push(str + '|||' + JSON.stringify(transformation));

        if(me.isSessionStorageSupported()) me.saveCommandsToSession();

        me.STATENUMBER = me.icn3d.commands.length;
      }

      me.icn3d.logs.push(str);

      // move cursor to the end, and scroll to the end
      $("#" + me.pre + "logtext").val("> " + me.icn3d.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
    },

    openDialog: function (id, title) {  var me = this;
        var width = 400, height = 150;

        var bExpandDialog = me.isMac() && !me.isMobile();

        if(id === me.pre + 'dl_selectresidues' || id === me.pre + 'dl_alignment') {
            if($( window ).width() > $( window ).height() ) {
                me.resizeCanvas(0.5 * $( window ).width(), $( window ).height() - me.LESSHEIGHT);

                height = bExpandDialog ? 'auto' : $( window ).height() - me.LESSHEIGHT - 2*me.MENU_HEIGHT;
                width = bExpandDialog ? 'auto' : 0.5 * $( window ).width() - me.LESSWIDTH;

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
                      me.cfg.resize = true;
                      me.resizeCanvas($( window ).width() - me.LESSWIDTH, $( window ).height() - me.LESSHEIGHT);
                  }
                });
            }
            else {
                if(me.isMobile()) me.resizeCanvas($( window ).width() - me.LESSWIDTH, $( window ).height() - me.LESSHEIGHT - 30);

                height = bExpandDialog ? 'auto' : 250;
                width = bExpandDialog ? 'auto' : $( window ).width() - me.LESSWIDTH;

                var position ={ my: "left top", at: "left bottom-30", of: "#" + me.pre + "canvas", collision: "none" };

                window.dialog = $( "#" + id ).dialog({
                  autoOpen: true,
                  title: title,
                  height: height,
                  width: width,
                  modal: false,
                  position: position
                });
            }
        }
        else {
            height = 'auto';
            width = 'auto';

            var position ={ my: "left top", at: "left bottom-30", of: "#" + me.pre + "canvas", collision: "none" };

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
    },

    renderStructure: function (bInitial) {  var me = this;
      if(bInitial) {
          me.icn3d.draw(me.options);
      }
      else {
          me.icn3d.draw();
      }

      // display the structure right away. load the menus and sequences later
      setTimeout(function(){
          if(me.cfg.showmenu === undefined || me.cfg.showmenu || me.cfg.showseq || me.cfg.showalignseq) {
              me.selectAllUpdateMenuSeq(bInitial, false);
          }

          if(me.cfg.command !== undefined) {
              me.loadScript(me.cfg.command);
          }
      }, 0);
    },

    downloadPdb: function (pdbid) { var me = this;
       // The PDB service doesn't support https, so use our reverse-proxy
       // service when using https
       var uri, dataType;
       if(document.location.protocol !== "https:") {
           uri = "http://www.rcsb.org/pdb/files/" + pdbid + ".pdb";
           dataType = "text";
       }
       else {
           uri = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?jsonp=t&pdbid=" + pdbid;
           dataType = "jsonp";
       }

       me.icn3d.bCid = undefined;

       $.ajax({
          url: uri,
          dataType: dataType,
          cache: true,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
          },
          success: function(data) {
              if(document.location.protocol !== "https:") {
                  me.loadPdbData(data);
              }
              else {
                  me.loadPdbData(data.data);
              }
          }
       });
    },

    loadPdbData: function(data) {
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

        me.renderStructure(true);

        me.showTitle();

        if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

        if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');

        if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    },

    rotateStructure: function (direction, bInitial) { var me = this;
        if(me.icn3d.bStopRotate) return false;

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
          me.icn3d.rotateLeft(5);
        }
        else if(direction === 'right' && me.ROTATION_DIRECTION === 'right') {
          me.icn3d.rotateRight(5);
        }
        else if(direction === 'up' && me.ROTATION_DIRECTION === 'up') {
          me.icn3d.rotateUp(5);
        }
        else if(direction === 'down' && me.ROTATION_DIRECTION === 'down') {
          me.icn3d.rotateDown(5);
        }
        else {
          return false;
        }

        setTimeout(function(){ me.rotateStructure(direction); }, 1000);
    },

    downloadMmcif: function (mmcif) { var me = this;
        var url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?mmcif=" + mmcif;
        me.icn3d.bCid = undefined;

       $.ajax({
          url: url,
          dataType: 'jsonp',
          cache: true,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
          },
          success: function(data) {
                me.loadMmcifData(data);
          }
        });
    },

    loadMmcifData: function(data) { var me = this;
        if (data.atoms !== undefined) {
            me.loadAtomDataIn(data, data.mmcif, 'mmcif');

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

            //me.icn3d.inputid.idtype = "mmcif";
            //me.icn3d.inputid.id = mmcif;

            me.icn3d.setAtomStyleByOptions(me.options);
            me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

            me.renderStructure(true);

            if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

            if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');

            if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
        else {
            alert('invalid atoms data.');
            return false;
        }
    },

    downloadAlignment: function (align) { var me = this;
        var url = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c&w3d&ids=" + align;
        var url2 = "https://www.ncbi.nlm.nih.gov/Structure/vastpp/vastpp.cgi?cmd=c1&d&ids=" + align;

        //var alignArray = me.cfg.align.split(',');
        //var ids_str = (alignArray.length === 2? 'uids=' : 'ids=') + align;
        //var url = '/Structure/vastplusdev/vastplus.cgi?cmd=c&w3d&' + ids_str;
        //var url2 = '/Structure/vastplusdev/vastplus.cgi?cmd=c1&d&' + ids_str;

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
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
          }
        });

        var seqalign = {};

        var chained = request.then(function( data ) {
            seqalign = data.seqalign;

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
                  if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
              },
              complete: function() {
                  if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
                  if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
                  if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
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

                me.renderStructure(true);

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                // by default, open the seq alignment window
                if(me.cfg.showalignseq !== undefined && me.cfg.showalignseq) me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');

                if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');

                if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }
            else {
                alert('invalid atoms data.');
                return false;
            }
        });
    },

    downloadCid: function (cid) { var me = this;
        var uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/record/SDF/?record_type=3d&response_type=display";

        me.icn3d.bCid = true;

        $.ajax({
          url: uri,
          dataType: 'text',
          cache: true,
          beforeSend: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
          },
          success: function(data) {
            var bResult = me.loadCidAtomData(data);

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

              me.renderStructure(true);

              if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

              if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }
          }
        })
        .fail(function() {
            alert( "This CID may not have 3D structure..." );
        });
    },

    loadCidAtomData: function (data) { var me = this;
        var lines = data.split('\n');
        if (lines.length < 4) return false;

        me.icn3d.init();

        var structure = '1';
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

            me.icn3d.atoms[serial] = atomDetails;
            AtomHash[serial] = 1;
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

        for (i = 0; i < bondCount; i++) {
            line = lines[offset];
            offset++;
            var from = parseInt(line.substr(0, 3)) - 1 + start;
            var to = parseInt(line.substr(3, 3)) - 1 + start;
            var order = parseInt(line.substr(6, 3));
            me.icn3d.atoms[from].bonds.push(to);
            me.icn3d.atoms[from].bondOrder.push(order);
            me.icn3d.atoms[to].bonds.push(from);
            me.icn3d.atoms[to].bondOrder.push(order);
            if(order == 2) {
                me.icn3d.doublebonds[from + '_' + to] = 1;
                me.icn3d.doublebonds[to + '_' + from] = 1;
            }
            else if(order == 3) {
                me.icn3d.triplebonds[from + '_' + to] = 1;
                me.icn3d.triplebonds[to + '_' + from] = 1;
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
    },

    showTitle: function() { var me = this;
        if(me.icn3d.moleculeTitle !== undefined && me.icn3d.moleculeTitle !== '') {
            var title = me.icn3d.moleculeTitle;

            var url = me.getLinkToStructureSummary();

            if(me.cfg.cid !== undefined) {
                $("#" + me.pre + "title").html("<a href='" + url + "' target='_blank' style='color:#DDD'>" + title + "</a>");
            }
            else if(me.cfg.align !== undefined) {
                $("#" + me.pre + "title").html(title);
            }
            else {
                if(me.icn3d.moleculeTitle.length > 50) title = me.icn3d.moleculeTitle.substr(0, 50) + "...";

                $("#" + me.pre + "title").html(title + " (PDB ID <a href='" + url + "' target='_blank' style='color:#DDD'>" + me.inputid.toUpperCase() + "</a>)");
            }
        }
        else {
            $("#" + me.pre + "title").html("");
        }
    },

    downloadMmdb: function (mmdbid) { var me = this;
       var url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&uid=" + mmdbid;

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
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").hide();
          },
          complete: function() {
              if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
              if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
              if($("#" + me.pre + "log")) $("#" + me.pre + "log").show();
          },
          success: function(data) {
            if ((me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= data.threshold && data.atoms !== undefined) ) {
                // small structure with all atoms
                var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
                me.loadAtomDataIn(data, id, 'mmdbid');

                if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
                    if($("#" + me.pre + "alternateWrapper") !== null) $("#" + me.pre + "alternateWrapper").hide();
                }

                //me.icn3d.inputid.idtype = "mmdbid";
                //me.icn3d.inputid.id = id;

                me.icn3d.setAtomStyleByOptions(me.options);
                // use the original color from cgi output
                me.icn3d.setColorByOptions(me.options, me.icn3d.atoms, true);

                me.renderStructure(true);

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
            }

            if(me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') == -1 && data.atomcount > data.threshold && data.molid2rescount !== undefined) {
                var labelsize = 40;

                // large struture with helix/brick, phosphorus, and ligand info
                me.icn3d.bSSOnly = true;

                // load atom info
                var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
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
                  html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='" + i + "'/></td><td align='center'>" + index + "</td><td align='center'>" + molid2rescount[i].chain + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

                  molid2color[i] = color;
                  var chain = id + '_' + molid2rescount[i].chain;
                  chain2molid[chain] = i;
                  molid2chain[i] = chain;
                  ++index;
                }

                if(Object.keys(me.icn3d.ligands).length > 0) {
                  html += "<tr><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='ligands'/></td><td align='center'>" + index + "</td><td align='center'>Ligands</td><td align='center'>" + Object.keys(me.icn3d.ligands).length + " atoms</td></tr>";
                }

                html += "</table>";

                 // add labels for each RNA/DNA molecule
                 // hash of molid to label object
                 var labels = {};

                 for(var i in me.icn3d.chains) {
                     var label = {}; // Each label contains 'position', 'text', 'color', 'background'

                     var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.chains[i])).center;
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
                me.icn3d.savedLabels = labels;

                me.icn3d.molid2ss = molid2ss;
                me.icn3d.molid2color = molid2color;

                me.renderStructure(true);

                if(me.cfg.rotate !== undefined) me.rotateStructure(me.cfg.rotate, true);

                //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

                // show the dialog to select structures
                $( "#" + me.pre + "dl_filter_table" ).html(html);

                var title = "Select chains to display";

                var width = 250, height = (me.isMobile()) ? 'auto' : 200;

                var position = { my: "left top", at: "left+10 top+93", of: "#" + me.pre + "canvas", collision: "none" };

                window.dialog = $( "#" + me.pre + "dl_filter" ).dialog({
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

            if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');

            if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();

            if(data.atoms === undefined && data.molid2rescount === undefined) {
                alert('invalid MMDB data.');
                return false;
            }
          }
        });
    },

    downloadGi: function (gi) { var me = this;
        var mmdbid;

        // get mmdbid from gi
        var uri = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=protein&db=structure&linkname=protein_structure_direct&id=" + gi;

        me.icn3d.bCid = undefined;

        me.setLogCommand("load gi " + gi, false);

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
    },

    loadAtomDataIn: function (data, id, type, seqalign) { var me = this;
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

              me.icn3d.moleculeTitle +=  "<a href=\"https://www.ncbi.nlm.nih.gov/structure/?term=" + structure.pdbid.toUpperCase() + "\" target=\"_blank\" style=\"color: #DDD;\">" + structure.pdbid.toUpperCase() + "</a>";

              if(structure.descr !== undefined) me.pmid += structure.descr.pubmedid;
              if(i === 0) {
                  me.icn3d.moleculeTitle += " and ";
                  if(structure.descr !== undefined) me.pmid += "_";
              }
          }
        }
        else { // mmdbid or mmcif
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

        var atomid2serial = {};
        var prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
        var structureNum = '', chainNum = '', residueNum = '';
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

            atm.resi = parseInt(atm.resi); // has to be integer

            if(atm.color !== undefined) atm.color = new THREE.Color(atm.color);
            atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);

            // mmcif has pre-assigned structure in mmcifparser.cgi output
            if(type === 'mmdbid' || type === 'align') {
                atm.structure = mmdb_id;
            }

            var secondaries = '-';
            if(atm.ss === 'helix') {
                secondaries = 'H';
            }
            else if(atm.ss === 'sheet') {
                secondaries = 'E';
            }
            else if(!atm.het && me.icn3d.residueColors.hasOwnProperty(atm.resn.toUpperCase()) ) {
            //else if(!atm.het) {
                secondaries = 'C';
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

              if (atm.bonds.length === 0) me.icn3d.ions[serial] = 1;

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

            structureNum = atm.structure;
            chainNum = structureNum + '_' + atm.chain;
            residueNum = chainNum + '_' + atm.resi;

            // different residue
            if(residueNum !== prevResidueNum) {
                // different chain
                if(chainNum !== prevChainNum) {
                    if(serial !== 1) {
                        if(me.icn3d.structures[prevStructureNum] === undefined) me.icn3d.structures[prevStructureNum] = [];
                        me.icn3d.structures[prevStructureNum].push(prevChainNum);
                    }
                }
            }

            var oneLetterRes = me.icn3d.residueName2Abbr(atm.resn.substr(0, 3));

            me.icn3d.residueId2Name[residueid] = oneLetterRes;

            if(atm.resi != prevResi) {
              if(me.icn3d.chainsSeq[chainid] === undefined) me.icn3d.chainsSeq[chainid] = [];
              if(me.icn3d.chainsAnno[chainid] === undefined ) me.icn3d.chainsAnno[chainid] = [];
              if(me.icn3d.chainsAnno[chainid][0] === undefined ) me.icn3d.chainsAnno[chainid][0] = [];
              if(me.icn3d.chainsAnno[chainid][1] === undefined ) me.icn3d.chainsAnno[chainid][1] = [];
              if(me.icn3d.chainsAnnoTitle[chainid] === undefined ) me.icn3d.chainsAnnoTitle[chainid] = [];
              if(me.icn3d.chainsAnnoTitle[chainid][0] === undefined ) me.icn3d.chainsAnnoTitle[chainid][0] = [];
              if(me.icn3d.chainsAnnoTitle[chainid][1] === undefined ) me.icn3d.chainsAnnoTitle[chainid][1] = [];

              var resObject = {};
              resObject.resi = atm.resi;
              resObject.name = oneLetterRes;

              var numberStr = '';
              if(atm.resi % 10 === 0) numberStr = atm.resi.toString();

              me.icn3d.chainsSeq[chainid].push(resObject);
              me.icn3d.chainsAnno[chainid][0].push(numberStr);
              me.icn3d.chainsAnno[chainid][1].push(secondaries);
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
        if(type !== 'mmcif') {
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
                      color = '#000';
                  }

                  // chain1
                  if(me.icn3d.alignChainsSeq[chainid1] === undefined) me.icn3d.alignChainsSeq[chainid1] = [];

                  var resObject = {};
                  resObject.mmdbid = mmdbid1;
                  resObject.chain = chain1;
                  resObject.resi = id2aligninfo[j].resi;
                  resObject.resn = id2aligninfo[j].resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (isNaN(resObject.resi)) ? '#ccc' : color;

                  me.icn3d.alignChainsSeq[chainid1].push(resObject);

                  if(!isNaN(id2aligninfo[j].resi)) {
                      if(me.icn3d.alignChains[chainid1] === undefined) me.icn3d.alignChains[chainid1] = {};
                      $.extend(me.icn3d.alignChains[chainid1], me.icn3d.residues[chainid1 + '_' + id2aligninfo[j].resi] );
                  }

                  // chain2
                  if(me.icn3d.alignChainsSeq[chainid2] === undefined) me.icn3d.alignChainsSeq[chainid2] = [];

                  resObject = {};
                  resObject.mmdbid = mmdbid2;
                  resObject.chain = chain2;
                  resObject.resi = resi;
                  resObject.resn = resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color = (isNaN(resObject.resi)) ? '#ccc' : color;

                  me.icn3d.alignChainsSeq[chainid2].push(resObject);

                  if(!isNaN(resi)) {
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
          seqalign = {};
        } // if(align

        me.showTitle();

        data = {};
    },

    setStructureMenu: function (bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      var keys = Object.keys(me.icn3d.structures).sort();

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
      }

      return html;
    },

    setChainMenu: function (bInitial, moleculeArray) { var me = this;
      var html = "";

      var selected = bInitial ? " selected" : "";

      if(moleculeArray === undefined) {
        for(var chain in me.icn3d.chains) {
            var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';
            html += "<option value='" + chain + "' " + selected + ">" + indent + chain + "</option>";

            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);
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

    getAlignChainSelections: function() { var me = this;
      var html = "";

        for(var chain in me.icn3d.alignChains) {
            var indent = (me.icn3d.secondId !== undefined && chain.indexOf(me.icn3d.secondId) === 0) ? '&nbsp;&nbsp;&nbsp;' : '';

            html += "<option value='" + chain + "'>" + indent + chain + "</option>";

            me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.alignChains[chain]);
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
      for(var i in me.icn3d.definedNames2Atoms) {
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

    getSequencesAnnotations: function (chainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight) { var me = this;
      var sequencesHtml = "<b>Sequences with coordinates:</b> (drag/click to select, drag/click again to deselect, click \"Stop Selection\" to stop the current selection)<br/><button style='white-space:nowrap;' class='" + me.pre + "stopselection'>Stop Selection</button> <button style='white-space:nowrap;' class='" + me.pre + "outputselection'>Output Selection</button><br/>";
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

          //seqHtml += "<span class='residueNum' title='starting residue number'>" + me.icn3d.chainsAnno[i][0][0] + "</span>";
          seqHtml += "<span class='residueNum' title='starting residue number'>" + me.icn3d.chainsSeq[i][0].resi + "</span>";

          var maxResi = parseInt(me.icn3d.chainsSeq[i][0].resi);

          for(var k=0, kl=seqLength; k < kl; ++k) {
            var resiId = structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi;

            var classForAlign = "class='residue'"; // used to identify a residue when clicking a residue in sequence

            if( (bShowHighlight === undefined || bShowHighlight) && ( bHighlightChain || (residueArray !== undefined && residueArray.indexOf(resiId) !== -1) ) ) {
                classForAlign = "class='residue highlightSeq'";
            }

            var residueName = (me.icn3d.chainsSeq[i][k].name.length === 1) ? me.icn3d.chainsSeq[i][k].name : me.icn3d.chainsSeq[i][k].name.trim().substr(0, 1).toLowerCase();

            //seqHtml += "<span id='" + me.pre + structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi + "' " + classForAlign + " title='Structure " + structure + ", Chain " + chain + ", Residue " + me.icn3d.chainsSeq[i][k].name + me.icn3d.chainsSeq[i][k].resi + "'>" + residueName + "</span>";
            seqHtml += "<span id='" + me.pre + structure + "_" + chain + "_" + me.icn3d.chainsSeq[i][k].resi + "' " + classForAlign + ">" + residueName + "</span>";

            if(maxResi < parseInt(me.icn3d.chainsSeq[i][k].resi)) {
                maxResi = parseInt(me.icn3d.chainsSeq[i][k].resi);
            }
          }

          //seqHtml += "<span class='residueNum' title='ending residue number'>" + me.icn3d.chainsAnno[i][0][seqLength-1] + "</span>";
          //seqHtml += "<span class='residueNum' title='ending residue number'>" + me.icn3d.chainsSeq[i][seqLength-1].resi + "</span>";
          seqHtml += "<span class='residueNum' title='ending residue number'>" + maxResi + "</span>";

          var annoLength = (me.icn3d.chainsAnno[i] !== undefined) ? me.icn3d.chainsAnno[i].length : 0;

          for(var j=0, jl=annoLength; j < jl; ++j) {
            resiHtmlArray[j] = "";

            resiHtmlArray[j] += "<span class='residueNum'></span>"; // a spot corresponding to the starting and ending residue number
            for(var k=0, kl=me.icn3d.chainsAnno[i][j].length; k < kl; ++k) {
              var text = me.icn3d.chainsAnno[i][j][k];

              resiHtmlArray[j] += "<span>" + text + "</span>";
            }
            resiHtmlArray[j] += "<span class='residueNum'></span>"; // a spot corresponding to the starting and ending residue number
          }

          for(var j=0, jl=annoLength; j < jl; ++j) {
            //sequencesHtml += "<div class='residueLine' style='white-space:nowrap;'><div class='seqTitle' chain='" + i + "' anno='" + j + "'>" + me.icn3d.chainsAnnoTitle[i][j][0] + " </div>" + resiHtmlArray[j] + "<br/></div>";
            sequencesHtml += "<div class='residueLine' style='white-space:nowrap;'><div class='annoTitle' chain='" + i + "' anno='" + j + "'>" + me.icn3d.chainsAnnoTitle[i][j][0] + " </div>" + resiHtmlArray[j] + "<br/></div>";
          }

          var color = (me.icn3d.chainsColor[i] !== undefined) ? '#' + me.icn3d.chainsColor[i].getHexString() : '#000000';

          var chainidTmp = i; title = (me.icn3d.pdbid_chain2title !== undefined) ? me.icn3d.pdbid_chain2title[i] : '';

          sequencesHtml += '<div class="seqTitle" chain="' + i + '" anno="sequence" style="color:' + color + '" title="' + title + '">' + chainidTmp + ' </div><span class="seqLine" style="color:' + color + '">' + seqHtml + '</span><br/>';
      }

      return {"sequencesHtml": sequencesHtml, "maxSeqCnt":maxSeqCnt};
    },

    getAlignSequencesAnnotations: function (alignChainArray, bUpdateHighlightAtoms, residueArray) { var me = this;
      var sequencesHtml = "<b>Aligned Sequences:</b>";
      sequencesHtml += " (drag/click to select, drag/click again to deselect, click \"Stop Selection\" to stop the current selection)<br/><button style='white-space:nowrap;' class='" + me.pre + "stopselection'>Stop Selection</button> <button style='white-space:nowrap;' class='" + me.pre + "outputselection'>Output Selection</button><br/>";

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

          seqHtml += "<span class='residueNum' title='starting residue number'>" + me.icn3d.alignChainsSeq[i][0].resi + "</span>";
          var bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

          for(var k=0, kl=seqLength; k < kl; ++k) {
            // resiId is empty if it's gap
            var resiId = 'N/A', resIdFull = '', color = '#000';
            if(!isNaN(me.icn3d.alignChainsSeq[i][k].resi)) {
                resiId = me.icn3d.alignChainsSeq[i][k].resi;
                resIdFull = structure + "_" + chain + "_" + resiId;
                color = me.icn3d.alignChainsSeq[i][k].color;
            }

            //var classForAlign = "class='residue'"; // used to identify a residue when clicking a residue in sequence
            //if(me.icn3d.alignChainsSeq[i][k].aligned === 2) classForAlign = "class='residue alignSeq'";

            var classForAlign = "class='residue'"; // used to identify a residue when clicking a residue in sequence

            if( bHighlightChain || (me.icn3d.alignChainsSeq[i][k].aligned === 2 && residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) {
                classForAlign = "class='residue highlightSeq'";
            }

            seqHtml += "<span id='" + me.pre + resIdFull + "' " + classForAlign + " style='color:" + color + "'>" + me.icn3d.alignChainsSeq[i][k].resn + "</span>";
          }
          seqHtml += "<span class='residueNum' title='ending residue number'>" + me.icn3d.alignChainsSeq[i][seqLength-1].resi + "</span>";

          var annoLength = (me.icn3d.alignChainsAnno[i] !== undefined) ? me.icn3d.alignChainsAnno[i].length : 0;

          for(var j=0, jl=annoLength; j < jl; ++j) {
            resiHtmlArray[j] = "";

            resiHtmlArray[j] += "<span class='residueNum'></span>"; // a spot corresponding to the starting and ending residue number
            for(var k=0, kl=me.icn3d.alignChainsAnno[i][j].length; k < kl; ++k) {
              resiHtmlArray[j] += "<span>" + me.icn3d.alignChainsAnno[i][j][k] + "</span>";
            }
            resiHtmlArray[j] += "<span class='residueNum'></span>"; // a spot corresponding to the starting and ending residue number
          }

          var color = (me.icn3d.chainsColor[i] !== undefined) ? '#' + me.icn3d.chainsColor[i].getHexString() : '#000000';

          var chainidTmp = i, title = (me.icn3d.pdbid_chain2title !== undefined) ? me.icn3d.pdbid_chain2title[i] : '';

          // add markers and residue numbers
          for(var j=annoLength-1; j >= 0; --j) {
            sequencesHtml += "<div class='residueLine' style='white-space:nowrap;'><div class='seqTitle' chain='" + i + "' anno='" + j + "'>" + me.icn3d.alignChainsAnnoTitle[i][j][0] + "</div>" + resiHtmlArray[j] + "<br/></div>";
          }

          sequencesHtml += '<div class="seqTitle" chain="' + i + '" anno="sequence" style="color:' + color + '" title="' + title + '">' + chainidTmp + ' </div><span class="seqLine" style="color:' + color + '">' + seqHtml + '</span><br/>';
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
         me.icn3d.definedNames2Command[commandname] = select;

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

       var chainArray = [];
       for(var i = 0, il=moleculeArray.length; i < il; ++i) {
           chainArray = chainArray.concat(me.icn3d.structures[moleculeArray[i]]);
       }

       if(bUpdateHighlight === undefined || bUpdateHighlight) me.icn3d.highlightAtoms = {};

       if(bUpdateSequence === undefined || bUpdateSequence) {
           //var residueArray = this.getResiduesUpdateHighlight(chainArray, bUpdateHighlight);
           //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), false, residueArray);
           var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains));

           $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
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
       if(residueArray !== null) me.setLogCommand('select residue ' + residueArray.toString(), true);

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

       sequencesHtml += " (drag/click to select, drag/click again to deselect, click \"Stop Selection\" to stop the current selection)<br/><button style='white-space:nowrap;' class='" + me.pre + "stopselection'>Stop Selection</button> <button style='white-space:nowrap;' class='" + me.pre + "outputselection'>Output Selection</button><br/>";
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

       sequencesHtml += " (drag/click to select, drag/click again to deselect, click \"Stop Selection\" to stop the current selection)<br/><button style='white-space:nowrap;' class='" + me.pre + "stopselection'>Stop Selection</button> <button style='white-space:nowrap;' class='" + me.pre + "outputselection'>Output Selection</button><br/>";
       var sequencesHtml = "";

       //var maxSeqCnt = 0;

       var annoTmp = '';
       var allResidues = {};
       for(var i = 0; i < nameArray.length; ++i) {
         var atomArray = me.icn3d.definedNames2Atoms[nameArray[i]];

         var residueHash = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             var atom = me.icn3d.atoms[atomArray[j]];
             var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
             residueHash[residueid] = 1;
         }

         var residueArray = Object.keys(residueHash);

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

     // fill the dialog
     me.icn3d.highlightAtoms = {};
     for(var i = 0, il = nameArray.length; i < il; ++i) {
       var atomArray = me.icn3d.definedNames2Atoms[nameArray[i]];
       var atomTitle = me.icn3d.definedNames2Descr[nameArray[i]];
       var atomCommand = me.icn3d.definedNames2Command[nameArray[i]];

       if(i === 0) {
         $("#" + me.pre + "command").val(atomCommand);
         $("#" + me.pre + "command_name").val(nameArray[i]);
         $("#" + me.pre + "command_desc").val(atomTitle);
       }
       else {
         var prevValue = $("#command").val();
         $("#" + me.pre + "command").val(prevValue + "; " + atomCommand);

         var prevValue = $("#command_name").val();
         $("#" + me.pre + "command_name").val(prevValue + "; " + nameArray[i]);

         var prevValue = $("#command_desc").val();
         $("#" + me.pre + "command_desc").val(prevValue + "; " + atomTitle);
       }

       for(var j = 0, jl = atomArray.length; j < jl; ++j) {
         me.icn3d.highlightAtoms[atomArray[j]] = 1;
       }

     } // outer for

       me.icn3d.addHighlightObjects();
    },

    showSelection: function (id) { var me = this;
       me.icn3d.displayAtoms = {};

       me.icn3d.displayAtoms = me.icn3d.cloneHash(me.icn3d.highlightAtoms);

       var options2 = {};
       //show selected rotationcenter
       options2['rotationcenter'] = 'display center';

       me.icn3d.setAtomStyleByOptions(me.options);

       me.icn3d.draw(options2);
    },

    selectByCommand: function (select, commandname, commanddesc) { var me = this;
       // selection definition is similar to Chimera: https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/frameatom_spec.html
       // semicolon-separated different seletions, which will be unioned
       var commandArray = select.replace(/\s/g, '').split(';');

       var residueArray = [];
       var atomArray = [];

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
                 if(!isNaN(residueStrArray[j])) { // residue id
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

               var residueHashTmp = {};

               for(var mc = 0, mcl = Molecule_ChainArray.length; mc < mcl; ++mc) {
                 molecule_chain = Molecule_ChainArray[mc];

                 if(bResidueId) {
                   for(var k = parseInt(start); k <= parseInt(end); ++k) {
                     var residueId = molecule_chain + '_' + k;
                     residueArray.push(residueId);

                     for(var m in me.icn3d.residues[residueId]) {
                       if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
//                         me.icn3d.highlightAtoms[m] = 1;
                         atomArray.push(m);
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
                         residueHashTmp[molecule_chain + '_' + me.icn3d.atoms[m].resi] = 1;

                         if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
//                           me.icn3d.highlightAtoms[m] = 1;
                           atomArray.push(m);
                         }

                       }
                     }
                   }
                 }
               }

               for(var residueid in residueHashTmp) {
                 residueArray.push(residueid);
               }
           } // for (j
       }  // for (i

       if(commandname !== "") {
           me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, bSelectResidues);

           var nameArray = [commandname];
           me.changeCustomResidues(nameArray);
       }
    },

    pickCustomSphere: function (radius) {   var me = this; // me.icn3d.pickedatom is set already
        me.clearSelection();

        var select = "select zone cutoff " + radius;

        var atomlistTarget = {};

        for(var i in me.icn3d.highlightAtoms) {
          atomlistTarget[i] = me.icn3d.atoms[i];
        }

        var atoms = me.icn3d.getAtomsWithinAtom(me.icn3d.hash2Atoms(me.icn3d.displayAtoms), atomlistTarget, parseFloat(radius));

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

        var commandname, commanddesc;
          var firstAtom = me.icn3d.getFirstAtomObj(atomlistTarget);
          commandname = "sphere." + firstAtom.chain + ":" + me.icn3d.residueName2Abbr(firstAtom.resn.substr(0, 3)) + firstAtom.resi + "-" + $("#" + me.pre + "radius_aroundsphere").val() + "A";
          commanddesc = "select a sphere around currently selected " + Object.keys(me.icn3d.highlightAtoms).length + " atoms with a radius of " + radius + " angstrom";

        me.addCustomSelection(residueArray, atomArray, commandname, commanddesc, select, true);

        var nameArray = [commandname];

        me.changeCustomResidues(nameArray);

        //me.icn3d.draw();

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

            //me.icn3d.draw(options2);
            me.icn3d.draw();
        }
    },

    addLabel: function (text, x, y, z, size, color, background) { var me = this;
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

        me.icn3d.labels.push(label);

        me.icn3d.removeHighlightObjects();

        //me.icn3d.draw();
    },

    addResiudeLabels: function () { var me = this;
        var size = 40;
        var background = "#CCCCCC";

        for(var i in me.icn3d.highlightAtoms) {
            var atom = me.icn3d.atoms[i];

            if(atom.het) continue;
            if(atom.name !== 'CA' && atom.name !== 'P') continue;

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.text = me.icn3d.residueName2Abbr(atom.resn);
            label.size = size;
            label.color = "#" + atom.color.getHexString();
            label.background = background;

            me.icn3d.labels.push(label);
        }

        me.icn3d.removeHighlightObjects();
    },

    addLine: function (x1, y1, z1, x2, y2, z2, color, dashed) { var me = this;
        var line = {}; // Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
        line.position1 = new THREE.Vector3(x1, y1, z1);
        line.position2 = new THREE.Vector3(x2, y2, z2);
        line.color = color;
        line.dashed = dashed;

        me.icn3d.lines.push(line);

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

            var value = resObj.name;

            if(value !== '' && value !== '-') {
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

    back: function () { var me = this;
      me.STATENUMBER--;

      if(me.STATENUMBER < 1) {
        me.STATENUMBER = 1;
      }
      else {
        me.execCommands(me.STATENUMBER);
      }

      me.adjustIcon();
    },

    forward: function () { var me = this;
      me.STATENUMBER++;

      if(me.STATENUMBER > me.icn3d.commands.length) {
        me.STATENUMBER = me.icn3d.commands.length;
      }
      else {
        me.execCommands(me.STATENUMBER);
      }

      me.adjustIcon();
    },

    toggleSelection: function () { var me = this;
        if(me.HIDE_SELECTION) {
            for(var i in me.icn3d.displayAtoms) {
                if(me.icn3d.highlightAtoms.hasOwnProperty(i)) delete me.icn3d.displayAtoms[i];
            }

              me.HIDE_SELECTION = false;
        }
        else {
            me.icn3d.displayAtoms = me.icn3d.unionHash(me.icn3d.displayAtoms, me.icn3d.highlightAtoms);

              me.HIDE_SELECTION = true;
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
        }

        me.icn3d.draw();
    },

    adjustIcon: function () { var me = this;
      if(me.STATENUMBER === 1) {
        if($("#" + me.pre + "back").hasClass('middleIcon')) {
          $("#" + me.pre + "back").toggleClass('middleIcon');
          $("#" + me.pre + "back").toggleClass('endIcon');
        }
      }
      else {
        if($("#" + me.pre + "back").hasClass('endIcon')) {
          $("#" + me.pre + "back").toggleClass('middleIcon');
          $("#" + me.pre + "back").toggleClass('endIcon');
        }
      }

      if(me.STATENUMBER === me.icn3d.commands.length) {
        if($("#" + me.pre + "forward").hasClass('middleIcon')) {
          $("#" + me.pre + "forward").toggleClass('middleIcon');
          $("#" + me.pre + "forward").toggleClass('endIcon');
        }
      }
      else {
        if($("#" + me.pre + "forward").hasClass('endIcon')) {
          $("#" + me.pre + "forward").toggleClass('middleIcon');
          $("#" + me.pre + "forward").toggleClass('endIcon');
        }
      }
    },

    toggle: function (id1, id2, id3, id4) { var me = this;
      $("#" + id1).toggleClass('ui-icon-plus');
      $("#" + id1).toggleClass('ui-icon-minus');

      $("#" + id2).toggleClass('ui-icon-plus');
      $("#" + id2).toggleClass('ui-icon-minus');

      $("#" + id1).toggleClass('shown');
      $("#" + id1).toggleClass('hidden');

      $("#" + id2).toggleClass('shown');
      $("#" + id2).toggleClass('hidden');

      $("#" + id3).toggleClass('shown');
      $("#" + id3).toggleClass('hidden');

      $("#" + id4).toggleClass('shown');
      $("#" + id4).toggleClass('hidden');
    },

//    exportState: function() { var me = this;
//        //http://stackoverflow.com/questions/22055598/writing-a-json-object-to-a-text-file-in-javascript
//        var url = 'data:text;charset=utf-8,' + encodeURIComponent(me.icn3d.commands.join('\n'));
//        window.open(url, '_blank');
//    },

    isIE: function() { var me = this;
        //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
            return true;
        else                 // If another browser, return 0
            return false;
    },

    saveFile: function(filename, type, text) { var me = this;
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
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
            }

            window.open(data, '_blank');
        }
    },

    loadScript: function (dataStr, bAddCommands) { var me = this;
      me.icn3d.bRender = false;

      dataStr = dataStr.replace(/;/g, '\n')

      me.icn3d.commands = dataStr.split('\n');

      me.STATENUMBER = me.icn3d.commands.length;

      me.execCommands(me.STATENUMBER, bAddCommands);
    },

    execCommandsBase: function (start, end, bAddCommands, steps) { var me = this;
      for(var i=start; i <= end; ++i) {
          if(me.icn3d.commands[i].indexOf('load') !== -1) {
              $.when(me.applyCommandLoad(me.icn3d.commands[i], bAddCommands)).then(function() {
                  me.execCommandsBase(i + 1, end, bAddCommands, steps);
              });
              return;
          }
          else {
              me.applyCommand(me.icn3d.commands[i], bAddCommands);
          }

          if(i === steps - 1) {
                me.icn3d.bRender = true;

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

                me.icn3d.draw();
          }
      }
    },

    execCommands: function (steps, bAddCommands) { var me = this;
        me.icn3d.bRender = false;
        me.execCommandsBase(0, steps-1, bAddCommands, steps);
    },

    applyCommandLoad: function (commandStr, bAddCommands) { var me = this;
      if(bAddCommands !== undefined && bAddCommands) me.setLogCommand(commandStr, true);

      // chain functions together
      me.deferred2 = $.Deferred(function() {
      var commandTransformation = commandStr.split('|||');

      var commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
      var command = commandOri.toLowerCase();

      if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
        // load pdb, mmcif, mmdb, cid
        var id = command.substr(command.lastIndexOf(' ') + 1);
        if(command.indexOf('pdb') !== -1) {
          me.downloadPdb(id);
        }
        else if(command.indexOf('mmcif') !== -1) {
          me.downloadMmcif(id);
        }
        else if(command.indexOf('mmdb') !== -1) {
          me.downloadMmdb(id);
        }
        else if(command.indexOf('gi') !== -1) {
          me.downloadGi(id);
        }
        else if(command.indexOf('cid') !== -1) {
          me.downloadCid(id);
        }
        else if(command.indexOf('align') !== -1) {
          me.downloadAlignment(id);
        }
      }
      }); // end of me.deferred = $.Deferred(function() {

      return me.deferred2;
    },

    applyCommand: function (commandStr, bAddCommands) { var me = this;
      if(bAddCommands !== undefined && bAddCommands) me.setLogCommand(commandStr, true);

      var commandTransformation = commandStr.split('|||');

      var commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
      var command = commandOri.toLowerCase();

      if(command.indexOf('export state file') !== -1) { // last step to update transformation
        // the last transformation will be applied
      }
      else if(commandOri.indexOf('select structure') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeStructureid(idArray);
      }
      else if(commandOri.indexOf('select chain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeChainid(idArray);
      }
      else if(commandOri.indexOf('select alignChain') !== -1) {
        var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) me.changeAlignChainid(idArray);
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
      //else if(command.indexOf('show saved atoms') !== -1) {
      //  me.showSelection('customAtoms');
      //}
      else if(command.indexOf('select') !== -1 && command.indexOf('name') !== -1 && command.indexOf('description') !== -1) {
        var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        var select = paraArray[0].substr(paraArray[0].lastIndexOf(' ') + 1);
        var commandname = paraArray[1].substr(paraArray[1].lastIndexOf(' ') + 1);
        var commanddesc = paraArray[2].substr(paraArray[2].lastIndexOf(' ') + 1);

        me.selectByCommand(select, commandname, commanddesc);
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

        // highlight the sequence background
        var pickedResidue = me.icn3d.pickedatom.structure + '_' + me.icn3d.pickedatom.chain + '_' + me.icn3d.pickedatom.resi;
        if($("#" + me.pre + pickedResidue).length !== 0) {
          $("#" + me.pre + pickedResidue).toggleClass('highlightSeq');
        }
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
      else if(command.indexOf('color') !== -1) {
        var color = command.substr(command.indexOf(' ') + 1);
        //var options2 = {};
        //options2['color'] = color;
        me.icn3d.options['color'] = color;

        //me.icn3d.setColorByOptions(options2, me.icn3d.highlightAtoms);
        me.icn3d.setColorByOptions(me.icn3d.options, me.icn3d.highlightAtoms);

        //me.icn3d.draw();
      }
      else if(command.indexOf('set surface wireframe on') !== -1) {
        me.icn3d.options['wireframe'] = 'yes';
      }
      else if(command.indexOf('set surface wireframe off') !== -1) {
        me.icn3d.options['wireframe'] = 'no';
      }
      else if(command.indexOf('set surface opacity') !== -1) {
        var value = command.substr(command.lastIndexOf(' ') + 1);
        me.icn3d.options['opacity'] = value;
      }
      else if(command.indexOf('set surface neighbors on') !== -1) {
        me.icn3d.bConsiderNeighbors = true;
      }
      else if(command.indexOf('set surface neighbors off') !== -1) {
        me.icn3d.bConsiderNeighbors = false;
      }
      else if(command.indexOf('set surface') !== -1) {
        var value = command.substr(12);

        me.icn3d.options['surface'] = value;
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
      else if(command.indexOf('reset') !== -1) {
        location.reload();
      }
      else if(command.indexOf('toggle highlight') !== -1) {
        if(me.icn3d.prevHighlightObjects.length > 0) { // remove
            me.icn3d.removeHighlightObjects();
        }
        else { // add
            me.icn3d.addHighlightObjects();
        }
      }
      else if(command.indexOf('set assembly on') !== -1) {
        me.icn3d.bAssembly = true;
      }
      else if(command.indexOf('set assembly off') !== -1) {
        me.icn3d.bAssembly = false;
      }
      else if(command.indexOf('add label') !== -1) {
        var paraArray = command.split(' | ');
        var text = paraArray[0].substr(paraArray[0].lastIndexOf(' ') + 1);

        var positionArray = paraArray[1].split(' ');
        var x = position[1], y = position[3], z = position[5];

        var size = paraArray[2].substr(paraArray[2].lastIndexOf(' ') + 1);
        var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
        var background = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1);

        me.addLabel(text, x,y,z, size, color, background);
        me.icn3d.draw();
      }
      else if(command.indexOf('add residue labels') !== -1) {
        me.addResiudeLabels();

       var options2 = {};
       options2['secondary'] = 'nothing';
       options2['nucleotides'] = 'nothing';
       options2['ligands'] = 'nothing';
       options2['water'] = 'nothing';
       options2['ions'] = 'nothing';

       //me.icn3d.setAtomStyleByOptions(options2);

       me.icn3d.options['labels'] = 'yes';

        //me.icn3d.draw(options2);
        me.icn3d.draw();
      }
      else if(command.indexOf('add line') !== -1) {
        var paraArray = command.split(' | ');
        var p1Array = paraArray[1].split(' ');
        var p2Array = paraArray[2].split(' ');
        var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
        var dashed = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1) === 'true' ? true : false;

        me.addLine(p1Array[0], p1Array[1], p1Array[2], p2Array[0], p2Array[1], p2Array[2], color, dashed);
      }
      else if(command.indexOf('zoom selection') !== -1) {
        me.icn3d.zoominSelection();
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
        me.icn3d.options["lines"] = "no";
        me.icn3d.draw();
        }
      else if(command.indexOf('set labels off') !== -1) {
        me.icn3d.options["labels"] = "no";
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
      // other select commands
      else if(command.indexOf('select') !== -1) {
        var select = commandOri;
        var commandname = "unspecified" + parseInt(Math.random() * 100);
        var commanddesc = "description not available";

        me.selectByCommand(select, commandname, commanddesc);
      }
    },

    setTopMenusHtml: function (id) { var me = this;
        var html = "";

        html += "<div style='position:relative;'>";
        html += "  <!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
        html += "  <div id='" + me.pre + "menulist' style='position:absolute; z-index:999; float:left; display:table-row; margin: 3px 0px 0px 3px;'>";
        html += "    <table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "          <span id='" + me.pre + "back' class='ui-icon ui-icon-arrowthick-1-w middleIcon link' title='Step backward'></span>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "          <span id='" + me.pre + "forward' class='ui-icon ui-icon-arrowthick-1-e middleIcon link' title='Step forward'></span>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion1'>";
        html += "              <h3>File</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li>Retrieve by ID";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_pdbid' class='link'>PDB ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmcifid' class='link'>mmCIF ID</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_mmdbid' class='link'>MMDB ID</span></li>";
        //html += "                    <li><span id='" + me.pre + "menu1_term' class='link'>Search MMDB term</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_gi' class='link'>gi</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_cid' class='link'>PubChem CID</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li><span id='" + me.pre + "menu1_pdbfile' class='link'>Open PDB File</span></li>";
        html += "                <li><span id='" + me.pre + "menu1_state' class='link'>Open State/Script</span></li>";
        html += "                <li><span id='" + me.pre + "menu1_exportState' class='link'>Export State<br/></span></li>";
        html += "                <li><span id='" + me.pre + "menu1_exportCanvas' class='link'>Export Image</span></li>";
        html += "                <li>Links";
        html += "                  <ul>";
        html += "                    <li><span id='" + me.pre + "menu1_link_structure' class='link'>Structure Summary</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_link_vast' class='link'>Find Similar Structures</span></li>";
        html += "                    <li><span id='" + me.pre + "menu1_link_pubmed' class='link'>Literature</span></li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion2'>";
        html += "              <h3>Select</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        html += "                <li>Select";
        html += "                  <ul>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_select_chain'><label for='" + me.pre + "menu2_select_chain'>Structure/Chain</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectall'><label for='" + me.pre + "menu2_selectall'>All</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectcomplement'><label for='" + me.pre + "menu2_selectcomplement'>Complement</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_aroundsphere'><label for='" + me.pre + "menu2_aroundsphere'>Custom Sphere</label></li>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_selectresidues'><label for='" + me.pre + "menu2_selectresidues'>Sequence</label></li>";
        }
        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_alignment'><label for='" + me.pre + "menu2_alignment'>Aligned Seq.</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_select' id='" + me.pre + "menu2_command'><label for='" + me.pre + "menu2_command'>by Command</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Picking";
        html += "                  <ul>";
        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue' checked><label for='" + me.pre + "menu2_pickingResidue'>Residue</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes'><label for='" + me.pre + "menu2_pickingYes'>Atom</label></li>";
        }
        else {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingStrand'><label for='" + me.pre + "menu2_pickingStrand'>Strand/Helix</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingResidue'><label for='" + me.pre + "menu2_pickingResidue'>Residue</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingYes' checked><label for='" + me.pre + "menu2_pickingYes'>Atom</label></li>";
        }

        html += "                      <li><input type='radio' name='" + me.pre + "menu2_picking' id='" + me.pre + "menu2_pickingNo'><label for='" + me.pre + "menu2_pickingNo'>Off</label></li>";
        html += "                  </ul>";
        html += "                </li>";

        html += "                <li>Display";
        html += "                  <ul>";
        if(me.cfg.align !== undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_alternate'><label for='" + me.pre + "menu2_alternate'>Alternate Structures</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu2_display' id='" + me.pre + "menu2_toggle'><label for='" + me.pre + "menu2_toggle'>Toggle Selection</label></li>";
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
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion3'>";
        html += "              <h3>Style</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";

        if(me.cfg.cid === undefined) {
            html += "                <li>Protein";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinRibbon' checked><label for='" + me.pre + "menu3_proteinRibbon'>Ribbon</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinStrand'><label for='" + me.pre + "menu3_proteinStrand'>Strand</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinCylinder'><label for='" + me.pre + "menu3_proteinCylinder'>Cylinder and Plate</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinCalpha'><label for='" + me.pre + "menu3_proteinCalpha'>C alpha Trace</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinBfactor'><label for='" + me.pre + "menu3_proteinBfactor'>B Factor Tube</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinLines'><label for='" + me.pre + "menu3_proteinLines'>Lines</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinStick'><label for='" + me.pre + "menu3_proteinStick'>Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinBallstick'><label for='" + me.pre + "menu3_proteinBallstick'>Ball and Stick</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinSphere'><label for='" + me.pre + "menu3_proteinSphere'>Sphere</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_protein' id='" + me.pre + "menu3_proteinNothing'><label for='" + me.pre + "menu3_proteinNothing'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";

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
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclCartoon'><label for='" + me.pre + "menu3_nuclCartoon'>Cartoon</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu3_nucl' id='" + me.pre + "menu3_nuclPhos' checked><label for='" + me.pre + "menu3_nuclPhos'>Phosphorus Trace</label></li>";
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
        html += "    </td>";

        html += "    <td valign='top'>";
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
            //html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorBfactor'><label for='" + me.pre + "menu4_colorBfactor'>B Factor</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorChain'><label for='" + me.pre + "menu4_colorChain'>Chain</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorResidue'><label for='" + me.pre + "menu4_colorResidue'>Residue</label></li>";
            html += "                <li><input type='radio' name='" + me.pre + "menu4_color' id='" + me.pre + "menu4_colorAtom'><label for='" + me.pre + "menu4_colorAtom'>Atom</label></li>";
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
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion5'>";
        html += "              <h3>Surface</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li>Type";
        html += "                  <ul>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceVDW'><label for='" + me.pre + "menu5_surfaceVDW'>Van der Waals</label></li>";
        html += "                      <li><input type='radio' name='" + me.pre + "menu5_surface' id='" + me.pre + "menu5_surfaceSES'><label for='" + me.pre + "menu5_surfaceSES'>Molecular Surface</label></li>";
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
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left;'>";
        html += "          <accordion id='" + me.pre + "accordion6'>";
        html += "              <h3>Other</h3>";
        html += "              <div>";
        html += "              <ul class='menu'>";
        html += "                <li><span id='" + me.pre + "reset' class='link'>Reset</span></li>";
        //html += "                <li><span id='" + me.pre + "menu6_pickcenter' class='link'>Center on Picked Atom</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_selectedcenter' class='link'>Zoom in Selection</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_back' class='link'>Back</span></li>";
        html += "                <li><span id='" + me.pre + "menu6_forward' class='link'>Forward</span></li>";
        if(me.cfg.cid === undefined) {
            html += "                <li>Assembly";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyYes'><label for='" + me.pre + "menu6_assemblyYes'>Yes</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_assembly' id='" + me.pre + "menu6_assemblyNo' checked><label for='" + me.pre + "menu6_assemblyNo'>No</label></li>";
            html += "                  </ul>";
            html += "                </li>";
            html += "                <li>H-bonds to selection";
            html += "                  <ul>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsYes'><label for='" + me.pre + "menu6_hbondsYes'>Show</label></li>";
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_hbonds' id='" + me.pre + "menu6_hbondsNo' checked><label for='" + me.pre + "menu6_hbondsNo'>Hide</label></li>";
            html += "                  </ul>";
            html += "                </li>";
        }
        html += "                <li>Label";
        html += "                  <ul>";

        if(me.cfg.cid === undefined) {
            html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelResidues'><label for='" + me.pre + "menu6_addlabelResidues'>Label Residues</label></li>";
        }
        html += "                      <li><input type='radio' name='" + me.pre + "menu6_addlabel' id='" + me.pre + "menu6_addlabelYes'><label for='" + me.pre + "menu6_addlabelYes'>Custom Label</label></li>";
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
        html += "                      <li><span id='" + me.pre + "menu6_rotateleft' class='link'>Rotate Left</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotateright' class='link'>Rotate Right</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotateup' class='link'>Rotate Up</span></li>";
        html += "                      <li><span id='" + me.pre + "menu6_rotatedown' class='link'>Rotate Down</span></li>";
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
        html += "                            <li>Left Mouse + Shift</li>";
        html += "                            <li>Key Z: Zoom in</li>";
        html += "                            <li>Key X: Zoom out</li>";
        html += "                        </ul>";
        html += "                    </li>";
        html += "                    <li>Translate";
        html += "                        <ul>";
        html += "                            <li>Right Mouse</li>";
        html += "                            <li>Left Mouse + Ctrl</li>";
        html += "                            <li>Arrow Left: Left</li>";
        html += "                            <li>Arrow Right: Right</li>";
        html += "                            <li>Arrow Up: Up</li>";
        html += "                            <li>Arrow Down: Down</li>";
        html += "                        </ul>";
        html += "                    </li>";
        html += "                  </ul>";
        html += "                </li>";
        html += "                <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html' target='_blank'>Help</a></li>";
        html += "              </ul>";
        html += "              </div>";
        html += "          </accordion>";
        html += "    </div>";
        html += "    </td>";

        html += "    <td valign='top'>";
        html += "    <div style='float:left; margin:10px 5px 0px 5px;'>";
        html += "    <a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html' target='_blank'><span class='ui-icon ui-icon-help middleIcon link' title='click to see the help page'></span></a>";
        html += "    </div>";
        html += "    </td>";

        html += "  </tr>";
        html += "  </table>";
        html += "  </div>";

        // separate for the log box
        html += "  <div id='" + me.pre + "commandlog' style='position:absolute; z-index:555; float:left; display:table-row; margin: 3px 0px 0px " + me.MENU_WIDTH + "px;'>";

        html += "    <div style='float:left' class='commandTitle'>Script/Log (<a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands' target='_blank'><span title='click to see all commands'>Hint</span></a>)</div><br/>";
        html += "    <textarea id='" + me.pre + "logtext' rows='3' cols='40'></textarea>";
        html += "  </div>";

        html += me.setTools();

        // show title at the top left corner
        html += "  <div id='" + me.pre + "title' class='commandTitle' style='position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color: #DDD'></div>";

        html += "  <div id='" + me.pre + "viewer' style='width:100%; height:100%; background-color: #ddd;'>";
        html += "   <div id='" + me.pre + "menuLogSection'>";
        html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";
        html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";

        html += "   </div>";

        html += "    <div id='" + me.pre + "wait' style='width:100%; height: 100%; background-color: rgba(221,221,221, 0.8);'><div style='padding-top:25%; text-align: center; font-size: 2em; color: #777777;'>Loading the structure...</div></div>";
        html += "    <canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        html += "  </div>";

        html += "</div>";

        html += "<!-- dialog will not be part of the form -->";
        html += "<div id='" + me.pre + "allselections' class='hidden'>";

        // filter for large structure
        html += "<div id='" + me.pre + "dl_filter' style='overflow:auto; position:relative;'>";
        //html += "  <div>This large structure contains more than 50,000 atoms. Please select some structures/chains below to display.</div>";
        //html += "  <input style='position:absolute; top:8px; left:15px;' type='checkbox' id='" + me.pre + "filter_ckbx_all'/>";
        html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
        html += "<button id='" + me.pre + "label_3d_diagram' style='margin-left:10px;'><span style='white-space:nowrap'><b>Show Labels</b></span></button></div>";
        html += "  <div id='" + me.pre + "dl_filter_table' class='box'>";
        html += "  </div>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_selectresidues'>";

        html += "  <div id='" + me.pre + "dl_sequence' class='dl_sequence'>";
        html += "  </div>";

        html += "</div>";

        if(me.cfg.align !== undefined) {
          html += "<div id='" + me.pre + "dl_alignment'>";
          html += "  <div id='" + me.pre + "dl_sequence2' class='dl_sequence'>";
          html += "  </div>";
          html += "</div>";
        }

        html += "<div id='" + me.pre + "dl_command'>";
        html += "  <table width='500'><tr><td valign='top'><table>";
        html += "<tr><td align='right'><b>Select:</b></td><td><input type='text' id='" + me.pre + "command' placeholder='#[structures].[chains]:[residues]@[atoms]' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Name:</b></td><td><input type='text' id='" + me.pre + "command_name' placeholder='my_selection' size='30'></td></tr>";
        html += "<tr><td align='right'><b>Description:</b></td><td><input type='text' id='" + me.pre + "command_desc' placeholder='description about my selection' size='30'></td></tr>";
        html += "<tr><td colspan='2' align='center'><button id='" + me.pre + "command_apply'><b>Apply</b></button></td></tr>";
        html += "  </table></td>";

        html += "  <td valign='top'><div>";
        html += "    <b>Atom Selection(s):</b> <br/>";
        html += "    <select id='" + me.pre + "customAtoms' multiple size='3' style='min-width:100px;'>";
        html += "    </select>";
        html += "  </td>";

        html += "  <td valign='top'><div>";
        html += "    <button id='" + me.pre + "show_selected_atom'><span style='white-space:nowrap'><b>Display Selection</b></span></button>";
        html += "  </div></td></tr>";

        //html += "  <tr><td colspan='3'>One line command: select [my_select] | name [my_name] | description [my_description], e.g., select :1-10 | name residue1-20 | description residues 1-20 in all chains<br/><br/></td></tr>";

        html += "  <tr><td colspan='3'><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#selectb' target='_blank'><span title='click to see how to select'>Hint</span></a>: <br/>Users can define \"select\" command similar to Chimera. For example, in the selection \"#1,2,3.A,B,C:5-10,Lys,ligands@CA,C\":<br/>\"#1,2,3\" uses \"#\" to indicate structure selection.<br/>\".A,B,C\" uses \".\" to indicate chain selection.<br/>\":5-10,Lys,ligands\" uses \":\" to indicate residue selection. Residue could be predefined names: 'proteins', 'nucleotides', 'ligands', 'ions', and 'water'.<br/>\"@CA,C\" uses \"@\" to indicate atom selection.<br/><br/>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/><br/>Different selections can be concatenated using semicolon, e.g., \":1-10; :Lys\" selects all residue IDs 1-10 and all Lys residues.</td></tr></table>";

        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbid'>";
        html += "PDB ID: <input type='text' id='" + me.pre + "pdbid' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_pdb'>Load</button>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_pdbfile'>";
        html += "PDB File: <input type='file' id='" + me.pre + "pdbfile' value='2POR' size=8> ";
        html += "<button id='" + me.pre + "reload_pdbfile'>Load</button>";
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
        html += "2. Size: <input type='text' id='" + me.pre + "labelsize' value='40' size=4><br/>";
        html += "3. Color: <input type='text' id='" + me.pre + "labelcolor' value='#ffff00' size=4><br/>";
        html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd' value='#cccccc' size=4><br/>";
        html += "<span style='white-space:nowrap'>5. Pick TWO atoms</span><br/>";
        html += "<span style='white-space:nowrap'>6. <button id='" + me.pre + "applypick_labels'>Display</button></span>";
        html += "</div>";

        html += "<div id='" + me.pre + "dl_distance'>";
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms</span><br/>";
        html += "  <span style='white-space:nowrap'>2. <button id='" + me.pre + "applypick_measuredistance'>Display</button></span>";
        html += "</div>";

        html += "</div>";
        html += "<!--/form-->";

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

    setTools: function() { var me = this;
        // second row
        var html = "";

        html += "  <div id='" + me.pre + "selection' style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 3px;'>";
        html += "    <table style='margin-top: 3px;'><tr valign='center'>";

        if(me.cfg.cid === undefined) {
            html += "        <td valign='top'><span class='commandTitle'>Structure:</span><br/>";
            html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "structureid' multiple size='1' style='min-width:50px;'>";
            html += "        </select></div></td>";

            if(me.cfg.align !== undefined) {
                html += "        <td valign='top'><span class='commandTitle'>Aligned:</span><br/>";
                html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "alignChainid' multiple size='1' style='min-width:50px;'>";
                html += "        </select></div></td>";
            }
            else {
                html += "        <td valign='top'><span class='commandTitle'>Chain:</span><br/>";
                html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "chainid' multiple size='1' style='min-width:50px;'>";
                html += "        </select></div></td>";
            }
        }

        html += "        <td valign='top'><span class='commandTitle'>Custom:</span><br/>";
        html += "        <div style='margin-top:-3px;'><select id='" + me.pre + "customResidues' multiple size='1' style='min-width:50px;'>";
        html += "        </select></div></td>";

        var buttonStyle = me.isMobile() ? 'none' : 'button';

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "selectall'><span style='white-space:nowrap' class='commandTitle' title='Select all atoms'>Select<br/>All</span></button></div></td>";

        var seqName;
        if(me.cfg.align !== undefined) {
            //seqName = (me.isMobile()) ? 'Aligned<br/>Seq.' : 'Aligned<br/>Sequences';
            seqName = 'Aligned<br/>Sequence';
        }
        else {
            //seqName = (me.isMobile()) ? 'Seq.' : 'Sequences';
            seqName = 'View<br/>Sequence';
        }

        if(me.cfg.cid === undefined) {
            html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_sequences'><span style='white-space:nowrap' class='commandTitle' title='Show the sequences of the selected structure'>" + seqName + "</span></button></div></td>";

            //if(me.cfg.align !== undefined) {
            html += "      <td valign='top'><div id='" + me.pre + "alternateWrapper' style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "alternate'><span style='white-space:nowrap' class='commandTitle' title='Alternate the structures'>Alternate<br/>Selection</span></button></div></td>";
            //}
        }

//        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button id='" + me.pre + "toggle'><span style='white-space:nowrap' class='commandTitle' title='Toggle the selected atoms on and off'>Toggle<br/>Selection</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "show_selected'><span style='white-space:nowrap' class='commandTitle' title='Display the selected atoms ONLY'>Display<br/>Selection</span></button></div></td>";

        html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "zoomin_selection'><span style='white-space:nowrap' class='commandTitle' title='Center on the selected atoms and zoom in'>Zoom in<br/>Selection</span></button></div></td>";

        if(me.cfg.align === undefined) {
            html += "      <td valign='top'><div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;' id='" + me.pre + "toggleHighlight'><span style='white-space:nowrap' class='commandTitle' title='Turn on and off the 3D highlight in the viewer'>Toggle<br/>Highlight</span></button></div></td>";
        }

        html += "    </tr></table>";
        html += "    </div>";

        return html;
    },

    selectAllUpdateMenuSeq: function(bInitial, bShowHighlight) { var me = this;
          var structuresHtml = me.setStructureMenu(bInitial);
          var chainsHtml = me.setChainMenu(bInitial);
          var alignChainsHtml = me.getAlignChainSelections();
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

           //var residueArray = this.getResiduesUpdateHighlight(Object.keys(me.icn3d.chains));
           //var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), false, residueArray);

           var seqObj = me.getSequencesAnnotations(Object.keys(me.icn3d.chains), undefined, undefined, bShowHighlight);

           $("#" + me.pre + "dl_sequence").html(seqObj.sequencesHtml);
           $("#" + me.pre + "dl_sequence").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

           if(me.cfg.align !== undefined) {
               //residueArray = this.getResiduesUpdateHighlight(Object.keys(me.icn3d.alignChains));

               //seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alignChains), false, residueArray);

               seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alignChains));

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

           me.selectAllUpdateMenuSeq(true);

           me.icn3d.addHighlightObjects();
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

    outputSelection: function() { var me = this;
            var residues = {};
            for(var i in me.icn3d.highlightAtoms) {
                var residueId = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueId] = 1;
            }

            var residueArray = Object.keys(residues).sort();

            var output = "Structure\tChain\tResidue Number\n";
            for(var i = 0, il = residueArray.length; i < il; ++i) {
                //if(typeof(residueArray[i]) === 'function') continue;

                var firstPos = residueArray[i].indexOf('_');
                var lastPos = residueArray[i].lastIndexOf('_');
                var structure = residueArray[i].substr(0, firstPos);
                var chain = residueArray[i].substr(firstPos + 1, lastPos - firstPos - 1);
                var resi = residueArray[i].substr(lastPos + 1);

                output += structure + "\t" + chain + "\t" + resi + "\n";
            }

            me.saveFile(me.inputid + '_residues.txt', 'residue', output);
    },

    getLinkToStructureSummary: function(bLog) { var me = this;
           var idArray = me.inputid.split('_');

           var url = (me.cfg.cid !== undefined) ? "https://www.ncbi.nlm.nih.gov/pccompound/?term=" : "https://www.ncbi.nlm.nih.gov/structure/?term=";

           if(idArray.length === 1) {
               url += me.inputid;
               if(bLog !== undefined && bLog) me.setLogCommand("link to Structure Summary " + me.inputid + ": " + url, false);
           }
           else if(idArray.length === 2) {
               url += idArray[0] + " OR " + idArray[1];
               if(bLog !== undefined && bLog) me.setLogCommand("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
           }

           return url;
    },

    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isMac: function() {
        return /Mac/i.test(navigator.userAgent);
    },

    isSessionStorageSupported: function() {
      var testKey = 'test';
      try {
        sessionStorage.setItem(testKey, '1');
        sessionStorage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    },

    saveCommandsToSession: function() { var me = this;
        var dataStr = me.icn3d.commands.join('\n');
        var data = decodeURIComponent(dataStr);

        sessionStorage.setItem('commands', data);
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

    clickMenu1_exportState: function() { var me = this;
        $("#" + me.pre + "menu1_exportState").click(function (e) {
           //e.preventDefault();

           me.setLogCommand("export state file", false);

           //me.exportState();
           me.saveFile(me.inputid + '_statefile.txt', 'text');
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

    clickMenu1_link_structure: function() { var me = this;
        $("#" + me.pre + "menu1_link_structure").click(function (e) {
           //e.preventDefault();
           var url = me.getLinkToStructureSummary(true);

           //me.exportState();
           window.open(url, '_blank');
        });
    },

    clickMenu1_link_vast: function() { var me = this;
        $("#" + me.pre + "menu1_link_vast").click(function (e) {
           //e.preventDefault();

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
        });
    },

    clickMenu1_link_pubmed: function() { var me = this;
        $("#" + me.pre + "menu1_link_pubmed").click(function (e) {
           //e.preventDefault();

           var url;
           if(me.pmid !== undefined) {
               var idArray = me.pmid.split('_');

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
               var idArray = me.inputid.split('_');

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

           me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');
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

           me.openDialog(me.pre + 'dl_command', 'Use command to define selections');
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
    clickMenu3_proteinRibbon: function() { var me = this;
        $("#" + me.pre + "menu3_proteinRibbon").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'ribbon');
           me.setLogCommand('style protein ribbon', true);
        });
    },

    clickMenu3_proteinStrand: function() { var me = this;
        $("#" + me.pre + "menu3_proteinStrand").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'strand');
           me.setLogCommand('style protein strand', true);
        });
    },

    clickMenu3_proteinCylinder: function() { var me = this;
        $("#" + me.pre + "menu3_proteinCylinder").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'cylinder & plate');
           me.setLogCommand('style protein cylinder & plate', true);
        });
    },

    clickMenu3_proteinCalpha: function() { var me = this;
        $("#" + me.pre + "menu3_proteinCalpha").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'C alpha trace');
           me.setLogCommand('style protein C alpha trace', true);
        });
    },

    clickMenu3_proteinBfactor: function() { var me = this;
        $("#" + me.pre + "menu3_proteinBfactor").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'B factor tube');
           me.setLogCommand('style protein B factor tube', true);
        });
    },

    clickMenu3_proteinLines: function() { var me = this;
        $("#" + me.pre + "menu3_proteinLines").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'lines');
           me.setLogCommand('style protein lines', true);
        });
    },

    clickMenu3_proteinStick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinStick").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'stick');
           me.setLogCommand('style protein stick', true);
        });
    },

    clickMenu3_proteinBallstick: function() { var me = this;
        $("#" + me.pre + "menu3_proteinBallstick").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'ball & stick');
           me.setLogCommand('style protein ball & stick', true);
        });
    },

    clickMenu3_proteinSphere: function() { var me = this;
        $("#" + me.pre + "menu3_proteinSphere").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'sphere');
           me.setLogCommand('style protein sphere', true);
        });
    },

    clickMenu3_proteinNothing: function() { var me = this;
        $("#" + me.pre + "menu3_proteinNothing").click(function (e) {
           //e.preventDefault();

           me.setStyle('protein', 'nothing');
           me.setLogCommand('style protein nothing', true);
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

           me.setStyle('sidechains', 'ball & stick');
           me.setLogCommand('style sidechains ball & stick', true);
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

           me.setStyle('nucleotides', 'ball & stick');
           me.setLogCommand('style nucleotides ball & stick', true);
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

           me.setStyle('ligands', 'ball & stick');
           me.setLogCommand('style ligands ball & stick', true);
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

           me.setOption('color', 'B factor');
           me.setLogCommand('color B factor', true);
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

    clickMenu4_colorAtom: function() { var me = this;
        $("#" + me.pre + "menu4_colorAtom").click(function (e) {
           //e.preventDefault();

           me.setOption('color', 'atom');
           me.setLogCommand('color atom', true);
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

           me.icn3d.draw();

           me.setLogCommand('set surface neighbors on', true);
        });
    },

    clickMenu5_neighborsNo: function() { var me = this;
        $("#" + me.pre + "menu5_neighborsNo").click(function (e) {
           //e.preventDefault();

           me.icn3d.bConsiderNeighbors = false;
           me.icn3d.draw();

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

    clickMenu5_surfaceSES: function() { var me = this;
        $("#" + me.pre + "menu5_surfaceSES").click(function (e) {
           //e.preventDefault();

           me.setOption('surface', 'solvent excluded surface');
           me.setLogCommand('set surface solvent excluded surface', true);
        });
    },

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

           me.setLogCommand('add residue labels', true);

           me.addResiudeLabels();

           var options2 = {};

           options2['secondary'] = 'nothing';
           options2['nucleotides'] = 'nothing';
           options2['ligands'] = 'nothing';
           options2['water'] = 'nothing';
           options2['ions'] = 'nothing';

           //me.icn3d.setAtomStyleByOptions(options2);

           me.icn3d.options['labels'] = 'yes';
           //me.icn3d.draw(options2);
           me.icn3d.draw();
        });
    },

    clickMenu6_addlabelYes: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelYes").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_addlabel', 'Add custom labels');
           me.icn3d.picking = 1;
           me.icn3d.pickpair = true;
           me.icn3d.pickedatomNum = 0;
        });
    },

    clickMenu6_addlabelNo: function() { var me = this;
        $("#" + me.pre + "menu6_addlabelNo").click(function (e) {
           //e.preventDefault();

           //me.icn3d.picking = 1;
           me.icn3d.pickpair = false;
           //me.icn3d.pickedatomNum = 0;

           var select = "set labels off";
           me.setLogCommand(select, true);

           me.icn3d.labels = [];

            me.icn3d.options["labels"] = "no";
            me.icn3d.draw();

        });
    },

    clickMenu6_distanceYes: function() { var me = this;
        $("#" + me.pre + "menu6_distanceYes").click(function (e) {
           //e.preventDefault();

           me.openDialog(me.pre + 'dl_distance', 'Measure the distance of atoms');
           me.icn3d.picking = 1;
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

           var select = "set lines off";
           me.setLogCommand(select, true);

            me.icn3d.lines = [];

            me.icn3d.options["lines"] = "no";
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

    clickMenu6_rotateleft: function() { var me = this;
        $("#" + me.pre + "menu6_rotateleft").click(function (e) {
           //e.preventDefault();
           me.setLogCommand('rotate left', true);

           me.icn3d.bStopRotate = false;
           me.ROTATION_DIRECTION = 'left';

           me.rotateStructure('left');
        });
    },

    clickMenu6_rotateright: function() { var me = this;
        $("#" + me.pre + "menu6_rotateright").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate right', true);

           me.icn3d.bStopRotate = false;
           me.ROTATION_DIRECTION = 'right';

           me.rotateStructure('right');
        });
    },

    clickMenu6_rotateup: function() { var me = this;
        $("#" + me.pre + "menu6_rotateup").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate up', true);

           me.icn3d.bStopRotate = false;
           me.ROTATION_DIRECTION = 'up';

           me.rotateStructure('up');
        });
    },

    clickMenu6_rotatedown: function() { var me = this;
        $("#" + me.pre + "menu6_rotatedown").click(function (e) {
           //e.preventDefault();

           me.setLogCommand('rotate down', true);

           me.icn3d.bStopRotate = false;
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

           me.openDialog(me.pre + 'dl_hbonds', 'Hydrogen Bonds');
        });
    },

    clickMenu6_hbondsNo: function() { var me = this;
        $("#" + me.pre + "menu6_hbondsNo").click(function (e) {
           //e.preventDefault();

           var select = "set hbonds off";
           me.setLogCommand(select, true);

            me.icn3d.options["hbonds"] = "no";
            me.icn3d.options["lines"] = "no";

            me.icn3d.lines = [];

            me.icn3d.draw();
        });
    },

    // other
    selectSequenceNonMobile: function() { var me = this;
      $("#" + me.pre + "dl_sequence").selectable({
          stop: function() {
              // reset original color
              //me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select residues
              $(".ui-selected", this).each(function() {
                  var id = $(this).attr('id');
                  if(id !== undefined && id !== '') {
                      if(me.SELECT_RESIDUE === false) {
                            me.removeSeqChainBkgd();
                            me.removeSeqResidueBkgd();

                          //me.icn3d.removeHighlightObjects();

                          me.SELECT_RESIDUE = true;
                          me.selectedResidues = {};
                          me.icn3d.highlightAtoms = {};

                          me.commandname = "seq_" + id.substr(id.indexOf('_') + 1);
                      }

                    $(this).toggleClass('highlightSeq');

                    var residueid = id.substr(id.indexOf('_') + 1);
                    if($(this).hasClass('highlightSeq')) {
                      //atom.color = new THREE.Color(0xFFFF00);

                      me.selectAResidue(residueid, me.commandname);
                      me.selectedResidues[residueid] = 1;
                    }

                    for (var i in me.icn3d.residues[residueid]) {
                        var atom = me.icn3d.atoms[i];

                        if(!$(this).hasClass('highlightSeq')) {
                          //atom.color = me.icn3d.atomPrevColors[i];

                          //delete me.icn3d.highlightAtoms[i];
                          me.icn3d.highlightAtoms[i] = undefined;
                          me.selectedResidues[residueid] = undefined;
                        }
                    }

                      me.icn3d.removeHighlightObjects();
                      me.icn3d.addHighlightObjects();
                  }
              });

              // reset original color
              //me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select annotation title
              $(".ui-selected", this).each(function() {
                  var currChain = $(this).attr('chain');
                  if($(this).hasClass('seqTitle')) {
                    me.SELECT_RESIDUE = false;
                    me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);

                    me.removeSeqChainBkgd(currChain);
                    me.removeSeqResidueBkgd();

                    $(this).toggleClass('highlightSeq');

                    var chainid = $(this).attr('chain');
                    //var anno = $(this).attr('anno'); // annotation ids are from 0 to number of annotations. "anno" is "sequence" for the sequence line
                    //var commanddesc = $(this).text() + " (" + chainid + ")";
                    var commandname = "seq_" + $(this).text().trim();

                    if($(this).hasClass('highlightSeq')) {
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

              // select residues
              $(".ui-selected", this).each(function() {
                  var id = $(this).attr('id');
                  if(id !== undefined && id !== '') {
                      if(me.SELECT_RESIDUE === false) {
                            me.removeSeqChainBkgd();
                            me.removeSeqResidueBkgd();

                          //me.icn3d.removeHighlightObjects();

                          me.SELECT_RESIDUE = true;
                          me.selectedResidues = {};
                          me.icn3d.highlightAtoms = {};

                          me.commandname = "alignSeq_" + id.substr(id.indexOf('_') + 1);
                      }

                    $(this).toggleClass('highlightSeq');

                    var residueid = id.substr(id.indexOf('_') + 1);
                    if($(this).hasClass('highlightSeq')) {
                      //atom.color = new THREE.Color(0xFFFF00);

                      me.selectAResidue(residueid, me.commandname);
                      me.selectedResidues[residueid] = 1;
                    }

                    for (var i in me.icn3d.residues[residueid]) {
                        var atom = me.icn3d.atoms[i];

                        if(!$(this).hasClass('highlightSeq')) {
                          //atom.color = me.icn3d.atomPrevColors[i];

                          delete me.icn3d.highlightAtoms[i];
                          me.selectedResidues[residueid] = undefined;
                        }
                    }

                    me.icn3d.removeHighlightObjects();
                    me.icn3d.addHighlightObjects();
                  }
              });

              //me.icn3d.addHighlightObjects();

              // reset original color
              //me.icn3d.setColorByOptions(me.options, me.icn3d.atoms);

              $("#" + me.pre + "chainid").val("");
              $("#" + me.pre + "structureid").val("");

              $("#" + me.pre + "chainid2").val("");
              $("#" + me.pre + "structureid2").val("");

              // select annotation title
              $(".ui-selected", this).each(function() {
                  var currChain = $(this).attr('chain');
                  if($(this).hasClass('seqTitle')) {
                    me.SELECT_RESIDUE = false;
                    me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);

                    me.removeSeqChainBkgd(currChain);
                    me.removeSeqResidueBkgd();

                    $(this).toggleClass('highlightSeq');

                    var chainid = $(this).attr('chain');
                    //var anno = $(this).attr('anno'); // annotation ids are from 0 to number of annotations. "anno" is "sequence" for the sequence line
                    //var commanddesc = $(this).text() + " (" + chainid + ")";
                    var commanddesc = "alignSeq_" + $(this).text().trim();

                    if($(this).hasClass('highlightSeq')) {
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
      $("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").on('click', '.residue', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

          // select residues
          //$(".ui-selected", this).each(function() {
              var id = $(this).attr('id');

              if(id !== undefined && id !== '') {
                  if(me.SELECT_RESIDUE === false) {

                        me.removeSeqChainBkgd();
                        me.removeSeqResidueBkgd();

                      me.icn3d.removeHighlightObjects();
                      me.icn3d.highlightAtoms = {};

                      me.SELECT_RESIDUE = true;
                      me.selectedResidues = {};
                      me.icn3d.highlightAtoms = {};

                      me.commandname = "seq_" + id.substr(id.indexOf('_') + 1);
                  }

                $(this).toggleClass('highlightSeq');

                var residueid = id.substr(id.indexOf('_') + 1);
                if($(this).hasClass('highlightSeq')) {
                  //atom.color = new THREE.Color(0xFFFF00);

                  me.selectAResidue(residueid, me.commandname);
                  me.selectedResidues[residueid] = 1;
                }

                for (var i in me.icn3d.residues[residueid]) {
                    var atom = me.icn3d.atoms[i];

                    if(!$(this).hasClass('highlightSeq')) {
                      //atom.color = me.icn3d.atomPrevColors[i];

                      delete me.icn3d.highlightAtoms[i];
                      me.selectedResidues[residueid] = undefined;
                    }
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
      $("#" + me.pre + "dl_sequence").on('click', '.seqTitle', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

            var currChain = $(this).attr('chain');

            me.SELECT_RESIDUE = false;
            me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);

            me.removeSeqChainBkgd(currChain);
            me.removeSeqResidueBkgd();

            // select annotation title
            $(this).toggleClass('highlightSeq');

            var chainid = $(this).attr('chain');
            //var anno = $(this).attr('anno'); // annotation ids are from 0 to number of annotations. "anno" is "sequence" for the sequence line
            //var commanddesc = $(this).text() + " (" + chainid + ")";
            var commandname = "seq_" + $(this).text().trim();

            if($(this).hasClass('highlightSeq')) {
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

      $("#" + me.pre + "dl_sequence2").on('click', '.seqTitle', function(e) {
          $("#" + me.pre + "chainid").val("");
          $("#" + me.pre + "structureid").val("");

          $("#" + me.pre + "chainid2").val("");
          $("#" + me.pre + "structureid2").val("");

            var currChain = $(this).attr('chain');

            //me.SELECT_RESIDUE = false;
            //me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);

            me.removeSeqChainBkgd(currChain);
            me.removeSeqResidueBkgd();

            // select annotation title
            $(this).toggleClass('highlightSeq');

            var chainid = $(this).attr('chain');
            //var anno = $(this).attr('anno'); // annotation ids are from 0 to number of annotations. "anno" is "sequence" for the sequence line
            //var commanddesc = $(this).text() + " (" + chainid + ")";
            var commanddesc = "alignSeq_" + $(this).text().trim();

            if($(this).hasClass('highlightSeq')) {
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
             me.setLogCommand('select saved matoms ' + nameArray.toString(), true);

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

           if($("#" + me.pre + "alignChainid").length > 0) {
               me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
           }
           else if($("#" + me.pre + "chainid").length > 0) {
               me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences with coordinates');
           }
        });
    },

    clickShow_selected_atom: function() { var me = this;
        $("#" + me.pre + "show_selected_atom").click(function(e) {
           e.preventDefault();

           //me.setLogCommand("show saved atoms", true);
           me.setLogCommand("show election", true);
           //me.showSelection("customAtoms");
           me.showSelection();
        });
    },

    clickCommand_apply: function() { var me = this;
        $("#" + me.pre + "command_apply").click(function(e) {
           e.preventDefault();

           var select = $("#" + me.pre + "command").val();
           var commandname = $("#" + me.pre + "command_name").val();
           var commanddesc = $("#" + me.pre + "command_desc").val();

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

           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');
        });
    },

    clickReload_mmcif: function() { var me = this;
        $("#" + me.pre + "reload_mmcif").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCommand("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);

           //me.downloadMmcif($("#" + me.pre + "mmcifid").val());
           window.open('https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?mmcif=' + $("#" + me.pre + "mmcifid").val(), '_blank');
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

               me.setLogCommand('load state file ' + file, false);

               var bAddCommands = true;
               me.loadScript(dataStr, bAddCommands);
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

           if(me.icn3d.pickedatom === undefined || me.icn3d.pickedatom2 === undefined) {
             alert("Please pick another atom");
           }
           else {
             var x = (me.icn3d.pickedatom.coord.x + me.icn3d.pickedatom2.coord.x) / 2;
             var y = (me.icn3d.pickedatom.coord.y + me.icn3d.pickedatom2.coord.y) / 2;
             var z = (me.icn3d.pickedatom.coord.z + me.icn3d.pickedatom2.coord.z) / 2;

             me.setLogCommand('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background, true);

             me.addLabel(text, x, y, z, size, color, background);

    //         me.icn3d.picking = 0;
             me.icn3d.pickpair = false;

             //var options2 = {};
             me.icn3d.options['labels'] = 'yes';
             me.icn3d.draw();
           }
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

             me.setLogCommand('add label ' + text + ' | x ' + x  + ' y ' + y + ' z ' + z + ' | size ' + size + ' | color ' + color + ' | background ' + background, true);

             me.addLabel(text, x, y, z, size, color, background);

             var color = "#FFFF00";
             var dashed = true;

             me.setLogCommand('add line | x1 ' + me.icn3d.pickedatom.coord.x  + ' y1 ' + me.icn3d.pickedatom.coord.y + ' z1 ' + me.icn3d.pickedatom.coord.z + ' | x2 ' + me.icn3d.pickedatom2.coord.x  + ' y2 ' + me.icn3d.pickedatom2.coord.y + ' z2 ' + me.icn3d.pickedatom2.coord.z + ' | color ' + color + ' | dashed ' + dashed, true);

             me.addLine(me.icn3d.pickedatom.coord.x, me.icn3d.pickedatom.coord.y, me.icn3d.pickedatom.coord.z, me.icn3d.pickedatom2.coord.x, me.icn3d.pickedatom2.coord.y, me.icn3d.pickedatom2.coord.z, color, dashed);

    //         me.icn3d.picking = 0;
             me.icn3d.pickpair = false;

             //var options2 = {};
             me.icn3d.options['labels'] = 'yes';
             me.icn3d.options['lines'] = 'yes';
             me.icn3d.draw();
           }
        });
    },

    clickReset: function() { var me = this;
        $("#" + me.pre + "reset").click(function (e) {
            //e.preventDefault();

            me.setLogCommand("reset", true);

            location.reload();
        });
    },

    clickToggleHighlight: function() { var me = this;
        $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function (e) {
    //        e.preventDefault();

            me.setLogCommand("toggle highlight", true);

            if(me.icn3d.prevHighlightObjects.length > 0) { // remove
                me.icn3d.removeHighlightObjects();
                me.icn3d.render();
            }
            else { // add
                me.icn3d.addHighlightObjects();
                //me.icn3d.applyTransformation(me.icn3d._zoomFactor, me.icn3d.mouseChange, me.icn3d.quaternion);
            }
        });
    },

    pressCommandtext: function() { var me = this;
        //$("#" + me.pre + "commandtext").keypress(function(e){
        $("#" + me.pre + "logtext").keypress(function(e){
           //e.preventDefault();

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

                me.applyCommand(lastCommand + '|||' + JSON.stringify(transformation));

                //me.renderStructure(true);
                me.icn3d.draw();
              }
           }
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

    clickLabel_3d_diagram: function() { var me = this;
        $("#" + me.pre + "label_3d_diagram").click(function (e) {
           //e.preventDefault();

           var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

           var mols = "";

           var labels = [];

           for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
             if(ckbxes[i].checked) {
               if(ckbxes[i].value != 'ligands') labels.push(me.icn3d.savedLabels[ckbxes[i].value]);
             }
           }

           me.icn3d.labels = labels;

           me.icn3d.createLabelRepresentation(me.icn3d.labels);

           me.icn3d.render();
        });
    },

    clickStopSelection: function() { var me = this;
        $(document).on("click", "." + me.pre + "stopselection", function(e) {
           //e.preventDefault();

            me.SELECT_RESIDUE = false;
            me.setLogCommand('select residue ' + Object.keys(me.selectedResidues), true);
        });
    },

    clickOutputSelection: function() { var me = this;
        $(document).on("click", "." + me.pre + "outputselection", function(e) {
           //e.preventDefault();

            me.SELECT_RESIDUE = false;
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

    windowResize: function() { var me = this;
        if(me.cfg.resize !== undefined && me.cfg.resize && !me.isMobile() ) {
            $(window).resize(function() {
                var width = $( window ).width() - me.LESSWIDTH;
                var height = $( window ).height() - me.LESSHEIGHT;

                me.resizeCanvas(width, height);
            });
        }
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
          if(!me.isMac()) me.CRASHED = true;  // this doesn't work in mac
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
        me.clickMenu1_mmcifid();
        me.clickMenu1_mmdbid();
        me.clickMenu1_gi();
        me.clickMenu1_cid();
        me.clickMenu1_state();
        me.clickMenu1_exportState();
        me.clickMenu1_exportCanvas();
        me.clickMenu1_link_structure();
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
        me.clickMenu3_proteinRibbon();
        me.clickMenu3_proteinStrand();
        me.clickMenu3_proteinCylinder();
        me.clickMenu3_proteinCalpha();
        me.clickMenu3_proteinBfactor();
        me.clickMenu3_proteinLines();
        me.clickMenu3_proteinStick();
        me.clickMenu3_proteinBallstick();
        me.clickMenu3_proteinSphere();
        me.clickMenu3_proteinNothing();
        me.clickMenu3_sidechainsLines();
        me.clickMenu3_sidechainsStick();
        me.clickMenu3_sidechainsBallstick();
        me.clickMenu3_sidechainsSphere();
        me.clickMenu3_sidechainsNothing();
        me.clickmenu3_nuclCartoon();
        me.clickmenu3_nuclPhos();
        me.clickmenu3_nuclLines();
        me.clickmenu3_nuclStick();
        me.clickmenu3_nuclBallstick();
        me.clickmenu3_nuclSphere();
        me.clickmenu3_nuclNothing();
        me.clickMenu3_ligandsLines();
        me.clickMenu3_ligandsStick();
        me.clickMenu3_ligandsBallstick();
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
        me.clickMenu4_colorAtom();
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
        me.clickMenu5_surfaceSES();
        me.clickMenu5_surfaceSAS();
        me.clickMenu5_surfaceSAS();
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
        me.clickMenu6_addlabelNo();
        me.clickMenu6_distanceYes();
        me.clickMenu6_distanceNo();
        me.clickMenu6_selectedcenter();
        me.clickMenu6_rotateleft();
        me.clickMenu6_rotateright();
        me.clickMenu6_rotateup();
        me.clickMenu6_rotatedown();
        me.clickMenu6_cameraPers();
        me.clickMenu6_cameraOrth();
        me.clickMenu6_bkgdBlack();
        me.clickMenu6_bkgdGrey();
        me.clickMenu6_bkgdWhite();
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
        me.clickShow_selected_atom();
        me.clickCommand_apply();
        me.clickReload_pdb();
        me.clickReload_pdbfile();
        me.clickReload_mmcif();
        me.clickReload_mmdb();
        me.clickReload_gi();
        me.clickReload_cid();
        me.clickReload_state();
        me.clickApplycustomcolor();
        me.clickApplypick_aroundsphere();
        me.clickApplyhbonds();
        me.clickApplypick_labels();
        me.clickApplypick_measuredistance();
        me.clickReset();
        me.clickToggleHighlight();
        me.pressCommandtext();
        me.clickFilter_ckbx_all();
        me.clickFilter();
        me.clickLabel_3d_diagram();
        me.clickStopSelection();
        me.clickOutputSelection();
        me.bindMouseup();
        me.bindMousedown();
        me.windowResize();
    },

    allCustomEvents: function() { var me = this;
      // add custom events here
    }
  };
