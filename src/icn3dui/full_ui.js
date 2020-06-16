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

var iCn3DUI = function(cfg) { var me = this; //"use strict";
    this.REVISION = '2.17.1';

    me.bFullUi = true;

    me.cfg = cfg;
    me.divid = me.cfg.divid;
    me.pre = me.divid + "_";

    if(me.cfg.command === undefined) me.cfg.command = '';

    if(me.cfg.width === undefined) me.cfg.width = '100%';
    if(me.cfg.height === undefined) me.cfg.height = '100%';

    if(me.cfg.resize === undefined) me.cfg.resize = true;
    if(me.cfg.showmenu === undefined) me.cfg.showmenu = true;
    if(me.cfg.showtitle === undefined) me.cfg.showtitle = true;
    if(me.cfg.showcommand === undefined) me.cfg.showcommand = true;

    if(me.cfg.simplemenu === undefined) me.cfg.simplemenu = false;
    if(me.cfg.mobilemenu === undefined) me.cfg.mobilemenu = false;
    if(me.cfg.closepopup === undefined) me.cfg.closepopup = false;
    if(me.cfg.showanno === undefined) me.cfg.showanno = false;
    if(me.cfg.showseq === undefined) me.cfg.showseq = false;
    if(me.cfg.showalignseq === undefined) me.cfg.showalignseq = false;
    if(me.cfg.show2d === undefined) me.cfg.show2d = false;
    if(me.cfg.showsets === undefined) me.cfg.showsets = false;

    if(me.cfg.rotate === undefined) me.cfg.rotate = 'right';

/*
    if(me.cfg.blast_rep_id !== undefined) {
      var pos1 = me.cfg.blast_rep_id.indexOf(':');
      var pos2 = me.cfg.query_id.indexOf(':');
      if(pos1 !== -1) {
        me.cfg.target_from_to = me.cfg.blast_rep_id.substr(pos1 + 1);
        me.cfg.blast_rep_id = me.cfg.blast_rep_id.substr(0, pos1);
      }

      if(pos2 !== -1) {
        me.cfg.query_from_to = me.cfg.query_id.substr(pos2 + 1);
        me.cfg.query_id = me.cfg.query_id.substr(0, pos2);
      }
    }
*/

    me.inputid = '';

    me.setOperation = 'or'; // by default the set operation is 'or'

    me.currSelectedSets = []; // for selecting multiple sets in sequence & annotations

    me.WIDTH = 400; // total width of view area
    me.HEIGHT = 400; // total height of view area

    me.RESIDUE_WIDTH = 10;  // sequences

    if(me.isMobile() || me.cfg.mobilemenu) {
        me.MENU_HEIGHT = 0;
    }
    else {
        me.MENU_HEIGHT = 40;
    }

    me.LOG_HEIGHT = 40;

    // used to set the position for the log/command textarea
    me.MENU_WIDTH = 750;

    me.LESSWIDTH = 20;
    me.LESSWIDTH_RESIZE = 20;
    me.LESSHEIGHT = 20;

    me.ROT_DIR = 'right';
    me.bHideSelection = true;

    me.CMD_HEIGHT = 0.8*me.LOG_HEIGHT;

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

    me.cmd2menu = {};

    // used in graph
    me.ssValue = 3;
    me.coilValue = 3;

    me.contactValue = 11;
    me.contactInsideValue = 12;
    me.hbondValue = 13;
    me.hbondInsideValue = 14;

    me.ssbondValue = 4;
    me.ionicValue = 5;
    me.ionicInsideValue = 6;

    me.clbondValue = 15;

    me.halogenValue = 17;
    me.halogenInsideValue = 18;

    me.picationValue = 19;
    me.picationInsideValue = 20;

    me.pistackingValue = 21;
    me.pistackingInsideValue = 22;

    me.contactColor = '222';
    me.contactInsideColor = 'FFF'; //'DDD';
    me.hbondColor = '0F0';
    me.hbondInsideColor = 'FFF'; //'AFA';

    me.ssbondColor = 'FFA500';
    me.ionicColor = '0FF';
    me.ionicInsideColor = 'FFF'; //'8FF';

    me.clbondColor = '006400';

    me.halogenColor = 'F0F';
    me.halogenInsideColor = 'FFF';

    me.picationColor = 'F00';
    me.picationInsideColor = 'FFF';

    me.pistackingColor = '00F';
    me.pistackingInsideColor = 'FFF';

    me.hideedges = 1;
    //me.pushcenter = 0;
    me.force = 4;

    //me.baseUrl = "https://structure.ncbi.nlm.nih.gov/";
    me.baseUrl = "https://www.ncbi.nlm.nih.gov/Structure/";
    me.divStr = "<div id='" + me.pre;
    me.divNowrapStr = "<div style='white-space:nowrap'>";
    me.spanNowrapStr = "<span style='white-space:nowrap'>";
    me.inputTextStr = "<input type='text' ";
    me.inputFileStr = "<input type='file' ";
    me.inputRadioStr = "<input type='radio' ";
    me.inputCheckStr = "<input type='checkbox' ";
    me.buttonStr = "<button id='" + me.pre;

    me.postfix = "2"; // add postfix for the structure of the query protein when align two chains in one protein

    me.closeAc = {collapsible: true, active: false}; // close accordion

    // https://www.ncbi.nlm.nih.gov/Class/FieldGuide/BLOSUM62.txt, range from -4 to 11
    me.b62ResArray = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V', 'B', 'Z', 'X', '*']; // length: 24

    me.b62Matrix = [
            [4, -1, -2, -2, 0, -1, -1, 0, -2, -1, -1, -1, -1, -2, -1, 1, 0, -3, -2, 0, -2, -1, 0, -4],
            [-1, 5, 0, -2, -3, 1, 0, -2, 0, -3, -2, 2, -1, -3, -2, -1, -1, -3, -2, -3, -1, 0, -1, -4],
            [-2, 0, 6, 1, -3, 0, 0, 0, 1, -3, -3, 0, -2, -3, -2, 1, 0, -4, -2, -3, 3, 0, -1, -4],
            [-2, -2, 1, 6, -3, 0, 2, -1, -1, -3, -4, -1, -3, -3, -1, 0, -1, -4, -3, -3, 4, 1, -1, -4],
            [0, -3, -3, -3, 9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1, -3, -3, -2, -4],
            [-1, 1, 0, 0, -3, 5, 2, -2, 0, -3, -2, 1, 0, -3, -1, 0, -1, -2, -1, -2, 0, 3, -1, -4],
            [-1, 0, 0, 2, -4, 2, 5, -2, 0, -3, -3, 1, -2, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1, -4],
            [0, -2, 0, -1, -3, -2, -2, 6, -2, -4, -4, -2, -3, -3, -2, 0, -2, -2, -3, -3, -1, -2, -1, -4],
            [-2, 0, 1, -1, -3, 0, 0, -2, 8, -3, -3, -1, -2, -1, -2, -1, -2, -2, 2, -3, 0, 0, -1, -4],
            [-1, -3, -3, -3, -1, -3, -3, -4, -3, 4, 2, -3, 1, 0, -3, -2, -1, -3, -1, 3, -3, -3, -1, -4],
            [-1, -2, -3, -4, -1, -2, -3, -4, -3, 2, 4, -2, 2, 0, -3, -2, -1, -2, -1, 1, -4, -3, -1, -4],
            [-1, 2, 0, -1, -3, 1, 1, -2, -1, -3, -2, 5, -1, -3, -1, 0, -1, -3, -2, -2, 0, 1, -1, -4],
            [-1, -1, -2, -3, -1, 0, -2, -3, -2, 1, 2, -1, 5, 0, -2, -1, -1, -1, -1, 1, -3, -1, -1, -4],
            [-2, -3, -3, -3, -2, -3, -3, -3, -1, 0, 0, -3, 0, 6, -4, -2, -2, 1, 3, -1, -3, -3, -1, -4],
            [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4, 7, -1, -1, -4, -3, -2, -2, -1, -2, -4],
            [1, -1, 1, 0, -1, 0, 0, 0, -1, -2, -2, 0, -1, -2, -1, 4, 1, -3, -2, -2, 0, 0, 0, -4],
            [0, -1, 0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1, 1, 5, -2, -2, 0, -1, -1, 0, -4],
            [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1, 1, -4, -3, -2, 11, 2, -3, -4, -3, -2, -4],
            [-2, -2, -2, -3, -2, -1, -2, -3, 2, -1, -1, -2, -1, 3, -3, -2, -2, 2, 7, -1, -3, -2, -1, -4],
            [0, -3, -3, -3, -1, -2, -2, -3, -3, 3, 1, -2, 1, -1, -2, -2, 0, -3, -1, 4, -3, -2, -1, -4],
            [-2, -1, 3, 4, -3, 0, 1, -1, 0, -3, -4, 0, -3, -3, -2, 0, -1, -4, -3, -3, 4, 1, -1, -4],
            [-1, 0, 0, 1, -3, 3, 4, -2, 0, -3, -3, 1, -1, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1, -4],
            [0, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2, 0, 0, -2, -1, -1, -1, -1, -1, -4],
            [-4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, 1],
        ];

    me.opts = {};
    me.opts['camera']             = 'perspective';        //perspective, orthographic
    me.opts['background']         = 'transparent';        //transparent, black, grey, white
    me.opts['color']              = 'chain';              //spectrum, secondary structure, charge, hydrophobic, conserved, chain, residue, atom, b factor, red, green, blue, magenta, yellow, cyan, white, grey, custom
    me.opts['proteins']           = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, backbone, b factor tube, lines, stick, ball and stick, sphere, nothing
    me.opts['sidec']              = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    me.opts['nucleotides']        = 'nucleotide cartoon'; //nucleotide cartoon, o3 trace, backbone, schematic, lines, stick,
                                                              // nucleotides ball and stick, sphere, nothing
    me.opts['surface']            = 'nothing';            //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    me.opts['opacity']            = '1.0';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.opts['wireframe']          = 'no';                 //yes, no
    me.opts['map']                = 'nothing';            //2fofc, fofc, nothing
    me.opts['mapwireframe']       = 'yes';                //yes, no
    me.opts['emmap']              = 'nothing';            //em, nothing
    me.opts['emmapwireframe']     = 'yes';                //yes, no
    me.opts['chemicals']          = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    me.opts['water']              = 'nothing';            //sphere, dot, nothing
    me.opts['ions']               = 'sphere';             //sphere, dot, nothing
    me.opts['hbonds']             = 'no';                 //yes, no
    me.opts['saltbridge']         = 'no';                 //yes, no
    me.opts['contact']            = 'no';                 //yes, no
    me.opts['halogen']            = 'no';                 //yes, no
    me.opts['pi-cation']            = 'no';                 //yes, no
    me.opts['pi-stacking']            = 'no';                 //yes, no
    //me.opts['stabilizer']           = 'no';                 //yes, no
    me.opts['ssbonds']            = 'yes';                 //yes, no
    me.opts['clbonds']            = 'yes';                 //yes, no
    me.opts['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.opts['axis']               = 'no';                 //yes, no
    me.opts['fog']                = 'no';                 //yes, no
    me.opts['slab']               = 'no';                 //yes, no
    me.opts['pk']                 = 'residue';            //no, atom, residue, strand, chain
    me.opts['chemicalbinding']      = 'hide';               //show, hide

    if(me.cfg.align !== undefined) me.opts['color'] = 'identity';
    if(me.cfg.chainalign !== undefined) me.opts['color'] = 'identity';
    if(me.cfg.blast_rep_id !== undefined) me.opts['color'] = 'conservation';
    if(me.cfg.cid !== undefined) me.opts['color'] = 'atom';

    if(me.cfg.options !== undefined) jQuery.extend(me.opts, me.cfg.options);

    me.init();

    me.modifyIcn3d();

};

iCn3DUI.prototype = {

    constructor: iCn3DUI,

    init: function () { var me = this; //"use strict";
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

        //me.bInputfile = false;

        $("#" + me.pre + "dl_annotations").html('');
        $("#" + me.pre + "dl_2ddgm").html('');
    },

    // modify iCn3D function
    modifyIcn3d: function() {var me = this; //"use strict";
        me.modifyIcn3dshowPicking();
    },

    switchHighlightLevelUp: function() { var me = this; //"use strict";
          if(!me.icn3d.bShift && !me.icn3d.bCtrl) me.icn3d.removeHlObjects();

          if(me.icn3d.pickedAtomList === undefined || Object.keys(me.icn3d.pickedAtomList).length === 0) {
              me.icn3d.pickedAtomList = me.icn3d.cloneHash(me.icn3d.hAtoms);
          }

          if(me.icn3d.highlightlevel === 1) { // atom -> residue
              me.icn3d.highlightlevel = 2;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);

              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
            else {
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
          }
          else if(me.icn3d.highlightlevel === 2) { // residue -> strand
              me.icn3d.highlightlevel = 3;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.selectStrandHelixFromAtom(firstAtom));
            }
            else {
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.selectStrandHelixFromAtom(firstAtom));
            }
          }
          else if(me.icn3d.highlightlevel === 3) {
              var atomLevel4;
              if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // strand -> domain
                  me.icn3d.highlightlevel = 4;

                  var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);

                  atomLevel4 = me.icn3d.select3ddomainFromAtom(firstAtom);
                  if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                      me.icn3d.hAtoms = me.icn3d.cloneHash(atomLevel4);
                  }
                  else {
                    me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, atomLevel4);
                  }
              }

              if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // strand -> chain
                  me.icn3d.highlightlevel = 5;

                  var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
                  if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                      me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
                  }
                  else {
                    me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
                  }
              }
          }
          else if(me.icn3d.highlightlevel === 4) { // domain -> chain
              me.icn3d.highlightlevel = 5;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
              else {
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
          }
          else if(me.icn3d.highlightlevel === 5 || me.icn3d.highlightlevel === 6) { // chain -> structure
              me.icn3d.highlightlevel = 6;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);

              if(!me.icn3d.bShift && !me.icn3d.bCtrl) me.icn3d.hAtoms = {};
              var chainArray = me.icn3d.structures[firstAtom.structure];
              for(var i = 0, il = chainArray.length; i < il; ++i) {
                  me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[chainArray[i]]);
            }
          }

          me.icn3d.addHlObjects();
          me.updateHlAll();
    },

    switchHighlightLevelDown: function() { var me = this; //"use strict";
          me.icn3d.removeHlObjects();

          if(me.icn3d.pickedAtomList === undefined || Object.keys(me.icn3d.pickedAtomList).length === 0) {
              me.icn3d.pickedAtomList = me.icn3d.cloneHash(me.icn3d.hAtoms);
          }

          if( (me.icn3d.highlightlevel === 2 || me.icn3d.highlightlevel === 1) && Object.keys(me.icn3d.pickedAtomList).length === 1) { // residue -> atom
              me.icn3d.highlightlevel = 1;

              me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.pickedAtomList);
              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.pickedAtomList);
            }
            else {
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.pickedAtomList);
            }
          }
          else if(me.icn3d.highlightlevel === 3) { // strand -> residue
            var residueHash = {};

            for(var i in me.icn3d.pickedAtomList) {
                residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residueHash[residueid] = 1;
            }

            if(Object.keys(residueHash).length === 1) {
                me.icn3d.highlightlevel = 2;

                var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
                if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                    me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
                else {
                    me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
            }
          }
          else if(me.icn3d.highlightlevel === 4) { // domain -> strand
              me.icn3d.highlightlevel = 3;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.selectStrandHelixFromAtom(firstAtom));
              }
              else {
                  me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.selectStrandHelixFromAtom(firstAtom));
              }
          }
          else if(me.icn3d.highlightlevel === 5) {
              var atomLevel4;
              if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // chain -> domain
                  me.icn3d.highlightlevel = 4;

                  var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
                  atomLevel4 = me.icn3d.select3ddomainFromAtom(firstAtom);
                  if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                      me.icn3d.hAtoms = me.icn3d.cloneHash(atomLevel4);
                  }
                  else {
                      me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, atomLevel4);
                  }
              }


              if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // chain -> strand
                  me.icn3d.highlightlevel = 3;

                  var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
                  if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                      me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.selectStrandHelixFromAtom(firstAtom));
                  }
                  else {
                      me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.selectStrandHelixFromAtom(firstAtom));
                  }
              }
          }
          else if(me.icn3d.highlightlevel === 6) { // structure -> chain
              me.icn3d.highlightlevel = 5;

              var firstAtom = me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList);
              if(!me.icn3d.bShift && !me.icn3d.bCtrl) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
            else {
                me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
          }

          me.icn3d.addHlObjects();
          me.updateHlAll();
    },

    switchHighlightLevel: function() { var me = this; //"use strict";
      $(document).bind('keydown', function (e) {
        if(e.keyCode === 38) { // arrow up, select upper level of atoms
          e.preventDefault();

          if(Object.keys(me.icn3d.pickedAtomList).length == 0 || !me.icn3d.hAtoms.hasOwnProperty(me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList).serial)) {
              me.icn3d.pickedAtomList = me.icn3d.cloneHash(me.icn3d.hAtoms);
              //me.icn3d.pk = 2;
          }

          me.switchHighlightLevelUp();
          me.setLogCmd("highlight level up", true);
        }
        else if(e.keyCode === 40) { // arrow down, select down level of atoms
          e.preventDefault();

          if(Object.keys(me.icn3d.pickedAtomList).length == 0 || !me.icn3d.hAtoms.hasOwnProperty(me.icn3d.getFirstAtomObj(me.icn3d.pickedAtomList).serial)) {
              me.icn3d.pickedAtomList = me.icn3d.cloneHash(me.icn3d.hAtoms);
              //me.icn3d.pk = 2;
          }

          me.switchHighlightLevelDown();
          me.setLogCmd("highlight level down", true);
        }
      });
    },

    allCustomEvents: function() { var me = this; //"use strict";
      // add custom events here
    },

    setCustomDialogs: function() { var me = this; //"use strict";
        var html = "";

        return html;
    },

    modifyIcn3dshowPicking: function() {var me = this; //"use strict";
        iCn3D.prototype.rayCaster = function(e, bClick) {
            me = me.setIcn3dui(this.id);

            me.icn3d.rayCasterBase(e, bClick);
        };

        iCn3D.prototype.showPicking = function(atom, x, y) {
          me = me.setIcn3dui(this.id);

          if(me.cfg.cid !== undefined) {
              this.pk = 1; // atom
          }
          else {
              // do not change the picking option
          }

          me.icn3d.highlightlevel = me.icn3d.pk;

          this.showPickingBase(atom, x, y);

          if(x !== undefined && y !== undefined) { // mouse over
            if(me.cfg.showmenu != undefined && me.cfg.showmenu == true) {
                y += me.MENU_HEIGHT;
            }

            var text = (this.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            if(me.icn3d.structures !== undefined && Object.keys(me.icn3d.structures).length > 1) {
                text = atom.structure + '_' + atom.chain + ' ' + text;
                $("#" + me.pre + "popup").css("width", "140px");
            }
            else {
                $("#" + me.pre + "popup").css("width", "80px");
            }

            $("#" + me.pre + "popup").html(text);
            $("#" + me.pre + "popup").css("top", y).css("left", x+20).show();
          }
          else {
              // highlight the sequence background
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

              // update the interaction flag
              me.bSphereCalc = false;
              //me.setLogCmd('set calculate sphere false', true);
              me.bHbondCalc = false;
              //me.setLogCmd('set calculate hbond false', true);
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

    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this; //"use strict";
      me.deferred = $.Deferred(function() {
        me.setViewerWidthHeight();

        if(me.isMobile() || me.cfg.mobilemenu) {
            me.setTopMenusHtmlMobile(me.divid);
        }
        else {
            me.setTopMenusHtml(me.divid);
        }

        if(me.isSessionStorageSupported()) me.getCommandsBeforeCrash();

        //me.setViewerWidthHeight();

        var width = me.WIDTH; // - me.LESSWIDTH_RESIZE;
        var height = me.HEIGHT; // - me.LESSHEIGHT - me.EXTRAHEIGHT;

        me.oriWidth = width;
        me.oriHeight = height;

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

        if(me.cfg.showtitle != undefined && me.cfg.showtitle == false) {
          $("#" + me.pre + "title").hide();
        }
        else {
          $("#" + me.pre + "title").show();
        }

        $("#" + me.pre + "viewer").width(width).height(parseInt(height) + extraHeight);
        $("#" + me.pre + "canvas").width(width).height(parseInt(height));
        $("#" + me.pre + "canvas").resizable({
          resize: function( event, ui ) {
            me.WIDTH = $("#" + me.pre + "canvas").width();
            me.HEIGHT = $("#" + me.pre + "canvas").height();
            if(me.icn3d !== undefined && !me.icn3d.bFullscreen) {
                me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
            }
          }
        });

        me.icn3d = new iCn3D(me.pre + 'canvas');

        if(me.cfg.replay) {
            $("#" + me.pre + "replay").show();
        }
        else {
            $("#" + me.pre + "replay").hide();
        }

        if(me.isMobile()) me.icn3d.threshbox = 60;

        if(me.cfg.controlGl) {
            me.icn3d.bControlGl = true;
            me.icn3d.container = (me.icn3d.bControlGl) ? $(document) : $('#' + me.icn3d.id);
        }
        me.icn3d.setControl(); // rotation, translation, zoom, etc

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
            if(id === me.cfg.mmtfid || id === me.cfg.pdbid || id === me.cfg.opmid || id === me.cfg.mmdbid || id === me.cfg.gi  || id === me.cfg.blast_rep_id
              || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align || id === me.cfg.chainalign) {
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
            me.inputid = url;

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
        else if(me.cfg.opmid !== undefined) {
           me.inputid = me.cfg.opmid;

           me.setLogCmd('load opm ' + me.cfg.opmid, true);

           me.downloadOpm(me.cfg.opmid);
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
        else if(me.cfg.blast_rep_id !== undefined) {
           if(me.cfg.query_id.substr(0,5) !== 'Query') { //Query_78989
               me.inputid = me.cfg.query_id + '_' + me.cfg.blast_rep_id;

               me.setLogCmd('load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id, true);

               me.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
           }
           else if(me.cfg.rid !== undefined) {
               var url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?RESULTS_FILE=on&FORMAT_TYPE=JSON2_S&FORMAT_OBJECT=Alignment&CMD=Get&RID=" + me.cfg.rid; // e.g., RID=EFTRU3W5014

               $.ajax({
                  url: url,
                  dataType: 'json',
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                    for(var q = 0, ql = data.BlastOutput2.length; q < ql; ++q) {
                      if(data.BlastOutput2[q].report.results.search.query_id != me.cfg.query_id) continue;

                      var hitArray = data.BlastOutput2[q].report.results.search.hits;
                      var qseq = undefined;
                      for(var i = 0, il = hitArray.length; i < il; ++i) {
                        var hit = hitArray[i];
                        var bFound = false;
                        for(var j = 0, jl = hit.description.length; j < jl; ++j) {
                          var acc = hit.description[j].accession;
                          if(acc == me.cfg.blast_rep_id) {
                            bFound = true;
                            break;
                          }
                        }

                        if(bFound) {
                          qseq = hit.hsps[0].qseq;
                          //remove gap '-'
                          qseq = qseq.replace(/-/g, '');

                          break;
                        }
                      }

                      if(qseq !== undefined) me.cfg.query_id = qseq;

                      me.inputid = me.cfg.query_id + '_' + me.cfg.blast_rep_id;

                      me.setLogCmd('load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id, true);

                      me.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
                    }
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    else {
                        alert('The RID ' + me.cfg.rid + ' may have expired...');
                    }
                    return;
                  }
               });
           }
           else {
               alert('BLAST "RID" is a required parameter...');
           }
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
        else if(me.cfg.chainalign !== undefined) {
            me.icn3d.bChainAlign = true;

            me.inputid = me.cfg.chainalign;

            me.setLogCmd('load chainalignment ' + me.cfg.chainalign + ' | parameters ' + me.cfg.inpara, true);

            me.downloadChainAlignment(me.cfg.chainalign);
        }
        else if(me.cfg.command !== undefined && me.cfg.command !== '') {
            me.loadScript(me.cfg.command);
        }
        else {
            //alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
            me.openDialog(me.pre + 'dl_mmdbid', 'Please input MMDB or PDB ID');
        }
      });

      return me.deferred.promise();
    },

    hideMenu: function() { var me = this; //"use strict";
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "none";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "none";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "none";

      $("#" + me.pre + "title")[0].style.margin = "10px 0 0 10px";
    },

    showMenu: function() { var me = this; //"use strict";
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "block";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "block";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "block";

      //if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";
    },

    saveSelectionIfSelected: function (id, value) { var me = this; //"use strict";
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

    updateGraphCOlor: function () { var me = this; //"use strict";
      // change graph color
      if(me.graphStr !== undefined) {
          var graphJson = JSON.parse(me.graphStr);

          var resid2color = {};
          for(var resid in me.icn3d.residues) {
              var atom = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid]);
              resid2color[resid] = atom.color.getHexString().toUpperCase();
          }

          var target2resid = {};
          for(var i = 0, il = graphJson.nodes.length; i < il; ++i) {
              var node = graphJson.nodes[i];

              //node.r: 1_1_1KQ2_A_1
              var idArray = node.r.split('_');
              var resid = idArray[2] + '_' + idArray[3] + '_' + idArray[4];

              node.c = resid2color[resid];

              target2resid[node.id] = resid;
          }

          for(var i = 0, il = graphJson.links.length; i < il; ++i) {
              var link = graphJson.links[i];

              if(link.v == me.ssValue || link.v == me.coilValue) {
                  var resid = target2resid[link.target];
                  link.c = resid2color[resid];
              }
          }

          me.graphStr = JSON.stringify(graphJson);
      }

      if(me.bGraph) me.drawGraph(me.graphStr);
      if(me.bLinegraph) me.drawLineGraph(me.graphStr);
    },

    setOption: function (id, value) { var me = this; //"use strict";
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

          // change graph color
          me.updateGraphCOlor();
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          if(id === 'opacity' || id === 'wireframe') {
              me.icn3d.removeLastSurface();
          }
          me.icn3d.applySurfaceOptions();
          //if(me.icn3d.bRender) me.icn3d.render();

          me.icn3d.draw(); // to make surface work in assembly
      }
      else if(id === 'map' || id === 'mapwireframe') {
          if(id === 'mapwireframe') {
              me.icn3d.removeLastMap();
          }

          me.icn3d.applyMapOptions();

          //if(me.icn3d.bRender) me.icn3d.render();
          me.icn3d.draw(); // to make surface work in assembly
      }
      else if(id === 'emmap' || id === 'emmapwireframe') {
          if(id === 'emmapwireframe') {
              me.icn3d.removeLastEmmap();
          }

          me.icn3d.applyEmmapOptions();

          //if(me.icn3d.bRender) me.icn3d.render();
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

    setStyle: function (selectionType, style) { var me = this; //"use strict";
      var atoms = {};
      var bAll = true;
      switch (selectionType) {
          case 'proteins':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.proteins);
              if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.proteins).length) bAll = false;
              break;
          case 'sidec':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.sidec);
              //calpha_atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.calphas);
              // include calphas
              //atoms = me.icn3d.unionHash(atoms, calpha_atoms);
              break;
          case 'nucleotides':
              atoms = me.icn3d.intHash(me.icn3d.hAtoms, me.icn3d.nucleotides);
              if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.nucleotides).length) bAll = false;
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
          //if(!bAll) {
          //    atoms = me.icn3d.getSSExpandedAtoms(me.icn3d.hash2Atoms(atoms));
          //}

          for(var i in atoms) {
            me.icn3d.atoms[i].style = style;
          }
      }

      me.icn3d.opts[selectionType] = style;

      me.saveSelectionIfSelected();

      me.icn3d.draw();
    },

    setLogCmd: function (str, bSetCommand, bAddLogs) { var me = this; //"use strict";
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

    renderStructure: function () {  var me = this; //"use strict";
      if(me.icn3d.bInitial) {
          jQuery.extend(me.icn3d.opts, me.opts);

          if(me.icn3d.bOpm && (me.cfg.align !== undefined || me.cfg.chainalign !== undefined)) { // show membrane
              var resid = me.selectedPdbid + '_MEM_1';
              for(var i in me.icn3d.residues[resid]) {
                  var atom = me.icn3d.atoms[i];
                  atom.style = 'stick';
                  atom.color = me.icn3d.atomColors[atom.name];
                  me.icn3d.atomPrevColors[i] = atom.color;

                  me.icn3d.dAtoms[i] = 1;
              }
          }

          if(me.cfg.command !== undefined && me.cfg.command !== '') {
              me.icn3d.bRender = false;

              me.icn3d.draw();
          }
          else {
              me.oneStructurePerWindow(); // for alignment

              me.icn3d.draw();
          }

          if(me.icn3d.bOpm) {
              var axis = new THREE.Vector3(1,0,0);
              var angle = -0.5 * Math.PI;

              me.icn3d.setRotation(axis, angle);
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

      if(me.icn3d.bInitial && me.cfg.command !== undefined && me.cfg.command !== '') {
          if(Object.keys(me.icn3d.structures).length == 1) {
              var id = Object.keys(me.icn3d.structures)[0];
              me.cfg.command = me.cfg.command.replace(new RegExp('!','g'), id + '_');
          }
          me.loadScript(me.cfg.command);
      }

      if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign || ( me.bInputfile && me.InputfileType == 'pdb' && Object.keys(me.icn3d.structures).length >= 2) ) {
          $("#" + me.pre + "mn2_alternateWrap").show();
          $("#" + me.pre + "mn2_realignWrap").show();
      }
      else {
          $("#" + me.pre + "mn2_alternateWrap").hide();
          $("#" + me.pre + "mn2_realignWrap").hide();
      }

      // display the structure right away. load the mns and sequences later
      setTimeout(function(){
          if(me.icn3d.bInitial) {
              if(me.cfg.showsets) {
                   me.showSets();
              }

              if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
                  // expand the toolbar
                  var id = me.pre + 'selection';
                  $("#" + id).show();
                  $("#" + id + "_expand").hide();
                  $("#" + id + "_shrink").show();

                  var bShowHighlight = false;
                  var seqObj = me.getAlignSequencesAnnotations(Object.keys(me.icn3d.alnChains), undefined, undefined, bShowHighlight);

                  $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                  $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
              }

              //me.setProtNuclLigInMenu();

              if(me.cfg.showanno) {
                   var cmd = "view annotations";
                   me.setLogCmd(cmd, true);

                   me.showAnnotations();
              }

              if(me.cfg.closepopup) {
                  me.closeDialogs();
              }
          }
          else {
              me.updateHlAll();
          }

          if($("#" + me.pre + "atomsCustom").length > 0) $("#" + me.pre + "atomsCustom")[0].blur();

          me.icn3d.bInitial = false;
      }, 0);
    },

    closeDialogs: function () { var me = this; //"use strict";
        if($('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' )) $('#' + me.pre + 'dl_selectannotations').dialog( 'close' );
        if($('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' )) $('#' + me.pre + 'dl_alignment').dialog( 'close' );
        if($('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' )) $('#' + me.pre + 'dl_2ddgm').dialog( 'close' );
        if($('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) $('#' + me.pre + 'dl_definedsets').dialog( 'close' );
        if($('#' + me.pre + 'dl_graph').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_graph').dialog( 'isOpen' )) $('#' + me.pre + 'dl_graph').dialog( 'close' );
        if($('#' + me.pre + 'dl_linegraph').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_linegraph').dialog( 'isOpen' )) $('#' + me.pre + 'dl_linegraph').dialog( 'close' );

        me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
    },

    exportCustomAtoms: function () { var me = this; //"use strict";
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

    atoms2residues: function(atomArray) { var me = this; //"use strict";
         var atoms = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             atoms[atomArray[j]] = 1;
         }

         //var residueHash = me.icn3d.getResiduesFromCalphaAtoms(atoms);
         var residueHash = me.icn3d.getResiduesFromAtoms(atoms);

         return Object.keys(residueHash);
    },

    residueids2spec: function(residueArray) { var me = this; //"use strict";
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

    getAtomsFromSets: function (nameArray) {   var me = this; //"use strict";  // me.icn3d.pAtom is set already
       var residuesHash = {};

       for(var i = 0, il = nameArray.length; i < il; ++i) {
           commandname = nameArray[i];
           var residuesHashTmp = me.getAtomsFromSet(commandname);

           residuesHash = me.icn3d.unionHash(residuesHash, residuesHashTmp);
       }

       return residuesHash;
    },

    getAtomsFromSet: function (commandname) {   var me = this; //"use strict";  // me.icn3d.pAtom is set already
       var residuesHash = {};

       // defined sets is not set up
       if(me.icn3d.defNames2Residues['proteins'] === undefined) {
           me.showSets();
       }

       //for(var i = 0, il = nameArray.length; i < il; ++i) {
           //var commandname = nameArray[i];
           if(Object.keys(me.icn3d.chains).indexOf(commandname) !== -1) {
               residuesHash = me.icn3d.unionHash(residuesHash, me.icn3d.chains[commandname]);
           }
           else {
               if(me.icn3d.defNames2Residues[commandname] !== undefined && me.icn3d.defNames2Residues[commandname].length > 0) {
                   for(var j = 0, jl = me.icn3d.defNames2Residues[commandname].length; j < jl; ++j) {
                       var resid = me.icn3d.defNames2Residues[commandname][j]; // return an array of resid

                       residuesHash = me.icn3d.unionHash(residuesHash, me.icn3d.residues[resid]);
                   }
               }

               if(me.icn3d.defNames2Atoms[commandname] !== undefined && me.icn3d.defNames2Atoms[commandname].length > 0) {
                   for(var j = 0, jl = me.icn3d.defNames2Atoms[commandname].length; j < jl; ++j) {
                       //var resid = me.icn3d.defNames2Atoms[commandname][j]; // return an array of serial
                       //residuesHash = me.icn3d.unionHash(residuesHash, me.icn3d.residues[resid]);

                       var serial = me.icn3d.defNames2Atoms[commandname][j]; // return an array of serial
                       residuesHash[serial] = 1;
                   }
               }
           }
       //}

       return residuesHash;
    },

    getAtomsFromNameArray: function (nameArray) {   var me = this; //"use strict";
        var selAtoms = {};

        for(var i = 0, il = nameArray.length; i < il; ++i) {
            if(nameArray[i] === 'non-selected') { // select all hAtoms
               var currAtoms = {};
               for(var i in me.icn3d.atoms) {
                   if(!me.icn3d.hAtoms.hasOwnProperty(i) && me.icn3d.dAtoms.hasOwnProperty(i)) {
                       currAtoms[i] = me.icn3d.atoms[i];
                   }
               }
               selAtoms = me.icn3d.unionHash(selAtoms, currAtoms);
            }
            else if(nameArray[i] === 'selected') {
                selAtoms = me.icn3d.unionHash(selAtoms, me.icn3d.hash2Atoms(me.icn3d.hAtoms) );
            }
            else {
                selAtoms = me.icn3d.unionHash(selAtoms, me.icn3d.hash2Atoms(me.getAtomsFromSet(nameArray[i])) );
            }
        }
        if(nameArray.length == 0) selAtoms = me.icn3d.atoms;

        return selAtoms;
    },

    pickCustomSphere: function (radius, nameArray2, nameArray, bSphereCalc, bInteraction, type) {   var me = this; //"use strict";  // me.icn3d.pAtom is set already
//        me.removeHlMenus();

        if(bSphereCalc) return;

        var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
        if(bInteraction) {
            select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
            me.icn3d.opts['contact'] = "yes";
        }

        var atomlistTarget, otherAtoms;

        // could be ligands
/*
        if(type == 'graph') { // only consider protein or nucleotide
            var atoms = me.getAtomsFromNameArray(nameArray2);
            atomlistTarget = me.icn3d.intHash(atoms, me.icn3d.proteins);
            atomlistTarget = me.icn3d.unionHash2Atoms(atomlistTarget, me.icn3d.intHash(atoms, me.icn3d.nucleotides));

            atoms = me.getAtomsFromNameArray(nameArray);
            otherAtoms = me.icn3d.intHash(atoms, me.icn3d.proteins);
            otherAtoms = me.icn3d.unionHash2Atoms(otherAtoms, me.icn3d.intHash(atoms, me.icn3d.nucleotides));
        }
        else {
*/
            atomlistTarget = me.getAtomsFromNameArray(nameArray2);
            otherAtoms = me.getAtomsFromNameArray(nameArray);
//        }

        // select all atom, not just displayed atoms
        var bGetPairs = true;

        var atoms;
        if(bInteraction) {
            atoms = me.icn3d.getAtomsWithinAtom(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, otherAtoms), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, atomlistTarget), parseFloat(radius), bGetPairs, bInteraction);

            me.resid2ResidhashInteractions = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }
        else {
            atoms = me.icn3d.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction);

            me.resid2ResidhashSphere = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }

        var residues = {}, atomArray = undefined;

        for (var i in atoms) {
            var atom = atoms[i];

            if(me.icn3d.bOpm && atom.resn === 'DUM') continue;

            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;
        }

        var residueArray = Object.keys(residues);

        me.icn3d.hAtoms = {};
        for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
          var residueid = residueArray[index];
          for(var i in me.icn3d.residues[residueid]) {
            me.icn3d.hAtoms[i] = 1;
          }
        }

        // do not change the set of displaying atoms
        //me.icn3d.dAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

        var commandname, commanddesc;
        var firstAtom = me.icn3d.getFirstAtomObj(atomlistTarget);

        if(firstAtom !== undefined) {
            commandname = "sphere." + firstAtom.chain + ":" + me.icn3d.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
            if(bInteraction) commandname = "contact." + firstAtom.chain + ":" + me.icn3d.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + me.pre + "contactthreshold").val() + "A";
            //commanddesc = "select a sphere around currently selected " + Object.keys(me.icn3d.hAtoms).length + " atoms with a radius of " + radius + " angstrom";
            commanddesc = commandname;

            me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
        }

        //var nameArray = [commandname];

        //me.changeCustomResidues(nameArray);

        me.saveSelectionIfSelected();

        me.icn3d.draw();
    },

    // between the highlighted and atoms in nameArray
    showHbonds: function (threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var me = this; //"use strict";
        if(bHbondCalc) return;

        var hbonds_saltbridge, select;
        if(bSaltbridge) {
            hbonds_saltbridge = 'saltbridge';
            select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        }
        else {
            hbonds_saltbridge = 'hbonds';
            select = 'hbonds ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        }

        me.icn3d.opts[hbonds_saltbridge] = "yes";
        me.icn3d.opts["water"] = "dot";

        var firstSetAtoms, complement;
/*
        if(type == 'graph') { // only consider protein or nucleotide
            var atoms = me.getAtomsFromNameArray(nameArray2);
            firstSetAtoms = me.icn3d.intHash(atoms, me.icn3d.proteins);
            firstSetAtoms = me.icn3d.unionHash2Atoms(firstSetAtoms, me.icn3d.intHash(atoms, me.icn3d.nucleotides));

            atoms = me.getAtomsFromNameArray(nameArray);
            complement = me.icn3d.intHash(atoms, me.icn3d.proteins);
            complement = me.icn3d.unionHash2Atoms(complement, me.icn3d.intHash(atoms, me.icn3d.nucleotides));
        }
*/
        //else {
            firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
            complement = me.getAtomsFromNameArray(nameArray);
        //}

        var firstAtom = me.icn3d.getFirstAtomObj(firstSetAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateChemicalHbonds(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge );

            var commanddesc;
            if(bSaltbridge) {
                me.resid2ResidhashSaltbridge = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
                commanddesc = 'all atoms that have salt bridges with the selected atoms';
            }
            else {
                me.resid2ResidhashHbond = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
                commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            }

            var residues = {}, atomArray = undefined;

            for (var i in selectedAtoms) {
                var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueid] = 1;
            }

            me.icn3d.hAtoms = {};
            for(var resid in residues) {
                for(var i in me.icn3d.residues[resid]) {
                    me.icn3d.hAtoms[i] = 1;
                    me.icn3d.atoms[i].style2 = 'stick';
                    //me.icn3d.atoms[i].style2 = 'lines';
                }
            }

            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            me.saveSelectionIfSelected();

            me.icn3d.draw();
        }
    },

    showIonicInteractions: function (threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var me = this; //"use strict";
        if(bHbondCalc) return;

        var hbonds_saltbridge, select;
        hbonds_saltbridge = 'saltbridge';
        select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;

        me.icn3d.opts[hbonds_saltbridge] = "yes";

        var firstSetAtoms, complement;
        firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
        complement = me.getAtomsFromNameArray(nameArray);

        var firstAtom = me.icn3d.getFirstAtomObj(firstSetAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateIonicInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge );

            var commanddesc;
            me.resid2ResidhashSaltbridge = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
            commanddesc = 'all atoms that have ionic interactions with the selected atoms';

            var residues = {}, atomArray = undefined;

            for (var i in selectedAtoms) {
                var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueid] = 1;
            }

            me.icn3d.hAtoms = {};
            for(var resid in residues) {
                for(var i in me.icn3d.residues[resid]) {
                    me.icn3d.hAtoms[i] = 1;
                    me.icn3d.atoms[i].style2 = 'stick';

                    if(me.icn3d.ions.hasOwnProperty(i)) me.icn3d.atoms[i].style2 = 'sphere';
                    //me.icn3d.atoms[i].style2 = 'lines';
                }
            }

            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            me.saveSelectionIfSelected();

            me.icn3d.draw();
        }
    },

    showHalogenPi: function (threshold, nameArray2, nameArray, bHbondCalc, type, interactionType) { var me = this; //"use strict";
        if(bHbondCalc) return;

        var select = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;

        me.icn3d.opts[interactionType] = "yes";

        var firstSetAtoms, complement;
        firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
        complement = me.getAtomsFromNameArray(nameArray);

        var firstAtom = me.icn3d.getFirstAtomObj(firstSetAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateHalogenPiInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), parseFloat(threshold), type, interactionType );

            var commanddesc;
            if(interactionType == 'halogen') {
                me.resid2ResidhashHalogen = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
                commanddesc = 'all atoms that have halogen bonds with the selected atoms';
            }
            else if(interactionType == 'pi-cation') {
                me.resid2ResidhashPication = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
                commanddesc = 'all atoms that have pi-cation interactions with the selected atoms';
            }
            else if(interactionType == 'pi-stacking') {
                me.resid2ResidhashPistacking = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
                commanddesc = 'all atoms that have pi-stacking with the selected atoms';
            }

            var residues = {}, atomArray = undefined;

            for (var i in selectedAtoms) {
                var residueid = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
                residues[residueid] = 1;
            }

            me.icn3d.hAtoms = {};
            for(var resid in residues) {
                for(var i in me.icn3d.residues[resid]) {
                    me.icn3d.hAtoms[i] = 1;
                    me.icn3d.atoms[i].style2 = 'stick';

                    if(me.icn3d.ions.hasOwnProperty(i)) me.icn3d.atoms[i].style2 = 'sphere';
                    //me.icn3d.atoms[i].style2 = 'lines';
                }
            }

            var commandname = interactionType + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            me.saveSelectionIfSelected();

            me.icn3d.draw();
        }
    },

    // show all disulfide bonds
    showSsbonds: function () { var me = this; //"use strict";
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

    // show all cross-linkages bonds
    showClbonds: function () { var me = this; //"use strict";
         me.icn3d.opts["clbonds"] = "yes";

         var select = 'cross linkage';

         // find all bonds to chemicals
         var residues = me.icn3d.applyClbondsOptions();

         for(var resid in residues) {
             me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[resid]);
         }

         if(Object.keys(residues).length > 0) {
            var commandname = 'clbonds';
            var commanddesc = 'all atoms that have cross-linkages';
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);

            var nameArray = [commandname];

            //me.changeCustomResidues(nameArray);

            me.saveSelectionIfSelected();

            // show side chains for the selected atoms
            //me.setStyle('sidec', 'stick');

            me.icn3d.draw();
         }
    },

    addLine: function (x1, y1, z1, x2, y2, z2, color, dashed, type) { var me = this; //"use strict";
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

    back: function () { var me = this; //"use strict";
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
        me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER, true);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    forward: function () { var me = this; //"use strict";
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
        me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER, true);
      }

      me.adjustIcon();

      me.bAddCommands = true;
      me.bAddLogs = true;
    },

    toggleSelection: function () { var me = this; //"use strict";
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

    adjustIcon: function () { var me = this; //"use strict";
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

    toggle: function (id1, id2, id3, id4) { var me = this; //"use strict";
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

    selectComplement: function() { var me = this; //"use strict";
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

    saveCommandsToSession: function() { var me = this; //"use strict";
        var dataStr = me.icn3d.commands.join('\n');
        var data = decodeURIComponent(dataStr);

        sessionStorage.setItem('commands', data);
    },

    addChainLabels: function (atoms) { var me = this; //"use strict";
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

    addTerminiLabels: function (atoms) { var me = this; //"use strict";
        var size = 18;
        var background = "#CCCCCC";

        var protNucl;
        protNucl = me.icn3d.unionHash(protNucl, me.icn3d.proteins);
        protNucl = me.icn3d.unionHash(protNucl, me.icn3d.nucleotides);
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
    getCommandsBeforeCrash: function() { var me = this; //"use strict";
       window.addEventListener('load', function () {
          sessionStorage.setItem('good_exit', 'pending');
       });

       window.addEventListener('beforeunload', function () {
          sessionStorage.setItem('good_exit', 'true');
       });

       if(sessionStorage.getItem('good_exit') && sessionStorage.getItem('good_exit') === 'pending') {
          if(!me.isMac()) me.bCrashed = true;  // this doesn't work in mac
          me.commandsBeforeCrash = sessionStorage.getItem('commands');
          if(!me.commandsBeforeCrash) me.commandsBeforeCrash = '';
       }
    },

    addLineFromPicking: function(type) { var me = this; //"use strict";
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

    setEntrezLinks: function(db) { var me = this; //"use strict";
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

    shareLink: function(bPngHtml) { var me = this; //"use strict";
           var url = me.shareLinkUrl();
           var bTooLong = (url.length > 4000 || url.indexOf('http') !== 0) ? true : false;

           if(bPngHtml) url += "&random=" + parseInt(Math.random() * 1000); // generate a new shorten URL and thus image name everytime

           var inputid = (me.inputid) ? me.inputid : "custom";

           if(!bPngHtml) {
               if(me.bInputfile) {
                   alert("Share Link does NOT work when the data is from custom files. Please save 'iCn3D PNG Image' in the File menu and open it in iCn3D.");
                   return;
               }

               if(bTooLong) {
                   alert("The url is more than 4000 characters and may not work. Please save 'iCn3D PNG Image' or 'State File' and open them in iCn3D.");
                   return;
               }


               me.setLogCmd("share link: " + url, false);
           }
           else {
               if(me.bInputfile || bTooLong) {
                   me.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
                   return;
               }
           }

           //https://firebase.google.com/docs/dynamic-links/rest
           //Web API Key: AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc
           var fdlUrl = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc";
           $.ajax({
              url: fdlUrl,
              type: 'POST',
              //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + url, "suffix": {"option": "SHORT"}},
              //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + encodeURIComponent(url)},
              data : {'longDynamicLink': 'https://icn3d.page.link/?link=' + encodeURIComponent(url)},
              dataType: 'json',
              success: function(data) {
                var shorturl = 'Problem in getting shortened URL';
                if(data.shortLink !== undefined) {
                    shorturl = data.shortLink;

                    if(bPngHtml) { // save png and corresponding html
                        var strArray = shorturl.split("/");
                        var shortName = strArray[strArray.length - 1];
                        me.saveFile(inputid + '-' + shortName + '.png', 'png');

                        var text = '<div style="float:left; border: solid 1px #0000ff; padding: 5px; margin: 10px; text-align:center;">';
                        text += '<a href="https://icn3d.page.link/' + shortName + '" target="_blank">';
                        text += '<img style="height:300px" src ="' + inputid + '-' + shortName + '.png"><br>\n';
                        text += '<!--Start of your comments==================-->\n';
                        var yournote = (me.yournote) ? ': ' + me.yournote.replace(/\n/g, "<br>") : '';
                        text += 'PDB ' + inputid + yournote + '\n';
                        text += '<!--End of your comments====================-->\n';
                        text += '</a>';
                        text += '</div>\n\n';

                        me.saveFile(inputid + '-' + shortName + '.html', 'html', text);
                    }
                }

                if(bPngHtml && data.shortLink === undefined) {
                    me.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
                }

                //shorturl: https://icn3d.page.link/NvbAh1Vmiwc4bgX87
                var urlArray = shorturl.split('page.link/');
                //if(urlArray.length == 2) shorturl = me.baseUrl + 'icn3d/share.html?' + urlArray[1];
                // When the baseURL is structure.ncbi.nlm.nih.gov, mmcifparser.cgi has a problem to past posted data in Mac/iphone
                // So the base URL is still www.ncbi.nlm.nih.gov/Structure,just use short URL here
                if(urlArray.length == 2) shorturl = 'https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + urlArray[1];

                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);

                if(!bPngHtml) me.openDialog(me.pre + 'dl_copyurl', 'Copy a Share Link URL');
              },
              error : function(xhr, textStatus, errorThrown ) {
                var shorturl = 'Problem in getting shortened URL';

                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);

                if(!bPngHtml) me.openDialog(me.pre + 'dl_copyurl', 'Copy a Share Link URL');
              }
           });
    },

    exportInteractions: function() { var me = this; //"use strict";
       var text = '<html><body><div style="text-align:center"><br><b>Interacting residues</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Base Chain: Residues</th><th>Interacting Chain</th></tr>';

       for(var fisrtChainid in me.chainname2residues) {
           for(var name in me.chainname2residues[fisrtChainid]) {
               var secondChainid = fisrtChainid.substr(0, fisrtChainid.indexOf('_')) + '_' + name.substr(0, name.indexOf(' '));
               text += '<tr><td>' + fisrtChainid + ': ';
               text += me.residueids2spec(me.chainname2residues[fisrtChainid][name]);
               text += '</td><td>' + secondChainid + '</td></tr>';
           }
       }

       text += '</table><br/></div></body></html>';

       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + '_interactions.html', 'html', text);
    },

    exportSsbondPairs: function() { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;
        for(var structure in me.icn3d.structures) {
            var ssbondArray = me.icn3d.ssbondpnts[structure];
            if(ssbondArray === undefined) {
                break;
            }

            for(var i = 0, il = ssbondArray.length; i < il; i = i + 2) {
                var resid1 = ssbondArray[i];
                var resid2 = ssbondArray[i+1];

                tmpText += '<tr><td>' + resid1 + ' Cys</td><td>' + resid2 + ' Cys</td></tr>';
                ++cnt;
            }
        }

        var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' disulfide pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';

        text += tmpText;

        text += '</table><br/></div></body></html>';

        var file_pref = (me.inputid) ? me.inputid : "custom";
        me.saveFile(file_pref + '_disulfide_pairs.html', 'html', text);
    },

    exportClbondPairs: function() { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;

        var residHash = {};
        for(var structure in me.icn3d.structures) {
            var clbondArray = me.icn3d.clbondpnts[structure];
            if(clbondArray === undefined) {
                break;
            }

            for(var i = 0, il = clbondArray.length; i < il; i = i + 2) {
                var resid1 = clbondArray[i];
                var resid2 = clbondArray[i+1];

                if(!residHash.hasOwnProperty(resid1 + '_' + resid2)) {
                    var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1]);
                    var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2]);

                    tmpText += '<tr><td>' + resid1 + ' ' + atom1.resn + '</td><td>' + resid2 + ' ' + atom2.resn + '</td></tr>';
                    ++cnt;
                }

                residHash[resid1 + '_' + resid2] = 1;
                residHash[resid2 + '_' + resid1] = 1;
            }
        }

        var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' cross-linkage pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';

        text += tmpText;

        text += '</table><br/></div></body></html>';

        var file_pref = (me.inputid) ? me.inputid : "custom";
        me.saveFile(file_pref + '_crosslinkage_pairs.html', 'html', text);
    },

    getGraphLinks: function(hash1, hash2, color, labelType, value) { var me = this; //"use strict";
        var hbondStr = '';

        value = (value === undefined) ? 1 : value;

        var prevLinkStr = '';
        for(var resid1 in hash1) {
            //ASN $1KQ2.A:6@ND2
            //or ASN $1KQ2.A:6
            resid1 = resid1.trim();

            var pos1a = resid1.indexOf(' ');
            var pos1b = resid1.indexOf(':');
            var posTmp1 = resid1.indexOf('@');
            var pos1c = (posTmp1 !== -1) ? posTmp1 : resid1.length;
            var pos1d = resid1.indexOf('.');
            var pos1e = resid1.indexOf('$');
            var resName1 = me.icn3d.residueName2Abbr(resid1.substr(0, pos1a)) + resid1.substr(pos1b + 1, pos1c - pos1b - 1);
            if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + resid1.substr(pos1d + 1, pos1b - pos1d - 1);
            if(labelType == 'structure') resName1 += '.' + resid1.substr(pos1e + 1, pos1d - pos1e - 1);

            for(var resid2 in hash2[resid1]) {
                resid2 = resid2.trim();

                var pos2a = resid2.indexOf(' ');
                var pos2b = resid2.indexOf(':');
                var posTmp2 = resid2.indexOf('@');
                var pos2c = (posTmp2 !== -1) ? posTmp2 : resid2.length;
                var pos2d = resid2.indexOf('.');
                var pos2e = resid2.indexOf('$');
                var resName2 = me.icn3d.residueName2Abbr(resid2.substr(0, pos2a)) + resid2.substr(pos2b + 1, pos2c - pos2b - 1); //
                    + '_' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
                if(labelType == 'structure') resName2 += '.' + resid2.substr(pos2e + 1, pos2d - pos2e - 1);

                var linkStr = ', {"source": "' + resName1 + '", "target": "' + resName2 + '", "v": ' + value + ', "c": "' + color + '"}';

                if(linkStr != prevLinkStr) hbondStr += linkStr;

                prevLinkStr = linkStr;
            }
        }

        return hbondStr;
    },

    convertLabel2Resid: function(residLabel) { var me = this; //"use strict";
        //ASN $1KQ2.A:6@ND2
        //or ASN $1KQ2.A:6
        var pos1 = residLabel.indexOf(' ');
        var pos2Tmp = residLabel.indexOf('@');
        var pos2 = (pos2Tmp !== -1) ? pos2Tmp : residLabel.length;
        var pos3 = residLabel.indexOf('$');
        var pos4 = residLabel.indexOf('.');
        var pos5 = residLabel.indexOf(':');

        var resid = residLabel.substr(pos3 + 1, pos4 - pos3 - 1) + '_' + residLabel.substr(pos4 + 1, pos5 - pos4 - 1)
            + '_' + residLabel.substr(pos5 + 1, pos2 - pos5 - 1);

        return resid;
    },

    exportHbondPairs: function(type, labelType) { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        for(var resid1 in me.resid2ResidhashHbond) {
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
            var color1 = atom1.color.getHexString();

            for(var resid2 in me.resid2ResidhashHbond[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();
                var dist = Math.sqrt(me.resid2ResidhashHbond[resid1][resid2]).toFixed(1);

                tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'hbond_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'hbond_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }

        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' hydrogen bond pairs</b>:</div><br>';

        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
            + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';

            text += tmpText;

            text += '</table><br/>';
        }

        if(type == 'graph' || type == 'linegraph') {
            var hbondStr = me.getGraphLinks(me.resid2ResidhashHbond, me.resid2ResidhashHbond, me.hbondColor, labelType, me.hbondValue);
            return hbondStr;
        }
        else {
            return text;
        }
    },

    exportSaltbridgePairs: function(type, labelType) { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        for(var resid1 in me.resid2ResidhashSaltbridge) {
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
            var color1 = atom1.color.getHexString();

            for(var resid2 in me.resid2ResidhashSaltbridge[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();
                var dist = Math.sqrt(me.resid2ResidhashSaltbridge[resid1][resid2]).toFixed(1);

                tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'saltb_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'saltb_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }

        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' salt bridge/ionic interaction pairs</b>:</div><br>';

        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';

            text += tmpText;

            text += '</table><br/>';
        }

        if(type == 'graph' || type == 'linegraph') {
            var hbondStr = me.getGraphLinks(me.resid2ResidhashSaltbridge, me.resid2ResidhashSaltbridge, me.ionicColor, labelType, me.ionicValue);
            return hbondStr;
        }
        else {
            return text;
        }
    },

    exportHalogenPiPairs: function(type, labelType, interactionType) { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        var resid2Residhash, color, value;
        if(interactionType == 'halogen') {
            resid2Residhash = me.resid2ResidhashHalogen;
            color = me.halogenColor;
            value = me.halogenValue;
        }
        else if(interactionType == 'pi-cation') {
            resid2Residhash = me.resid2ResidhashPication;
            color = me.picationColor;
            value = me.picationValue;
        }
        else if(interactionType == 'pi-stacking') {
            resid2Residhash = me.resid2ResidhashPistacking;
            color = me.pistackingColor;
            value = me.pistackingValue;
        }

        for(var resid1 in resid2Residhash) {
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
            var color1 = atom1.color.getHexString();

            for(var resid2 in resid2Residhash[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();
                var dist = Math.sqrt(resid2Residhash[resid1][resid2]).toFixed(1);

                tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                ++cnt;
            }
        }

        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' ' + interactionType + ' pairs</b>:</div><br>';

        if(cnt > 0) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';

            text += tmpText;

            text += '</table><br/>';
        }

        if(type == 'graph' || type == 'linegraph') {
            var hbondStr = me.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
            return hbondStr;
        }
        else {
            return text;
        }
    },

    exportSpherePairs: function(bInteraction, type, labelType) { var me = this; //"use strict";
        var tmpText = '';
        var cnt = 0;
        var residHash = (bInteraction) ? me.resid2ResidhashInteractions : me.resid2ResidhashSphere;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        for(var resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
            var color1 = atom1.color.getHexString();

            for(var resid2 in residHash[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();

                var dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                var atom1 = dist1_dist2_atom1_atom2[2];
                var atom2 = dist1_dist2_atom1_atom2[3];
                var contactCnt = dist1_dist2_atom1_atom2[4];

                if(bInteraction) {
                    tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                    if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                    tmpText += '</tr>';
                }
                else {
                    tmpText += '<tr><td>' + resid1 + '</td><td>' + resid2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1_dist2[0] + '</td><td align="center">' + dist1_dist2[1] + '</td></tr>';
                }

                ++cnt;
            }
        }

        var nameStr = (bInteraction) ? "the contacts" : "sphere";
        var text = '<div style="text-align:center"><br><b>' + cnt
          + ' residue pairs in ' + nameStr + '</b>:</div><br>';

        if(cnt > 0) {
            if(bInteraction) {
                text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
                  + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th>';
                if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
                text += '</tr>';
            }
            else {
                text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
                  + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th></tr>';
            }

            text += tmpText;

            text += '</table><br/>';
        }

        if(type == 'graph' || type == 'linegraph') {
            var interStr = me.getGraphLinks(residHash, residHash, me.contactColor, labelType, me.contactValue);

            return interStr;
        }
        else {
            return text;
        }
    },

    saveColor: function() { var me = this; //"use strict";
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           atom.colorSave = atom.color.clone();
       }
    },

    applySavedColor: function() { var me = this; //"use strict";
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.colorSave !== undefined) {
               atom.color = atom.colorSave.clone();
           }
       }

       me.icn3d.draw();

       me.changeSeqColor(Object.keys(me.icn3d.residues));
    },

    saveStyle: function() { var me = this; //"use strict";
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           atom.styleSave = atom.style;
           if(atom.style2 !== undefined) atom.style2Save = atom.style2;
       }
    },

    applySavedStyle: function() { var me = this; //"use strict";
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

    showHydrogens: function() { var me = this; //"use strict";
/*
       // get all hydrogen atoms
       for(var i in me.icn3d.atoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.name === 'H') {
               //me.icn3d.atoms[atom.serial].bonds = me.icn3d.atoms[atom.serial].bonds2.concat();

               var otherSerial = me.icn3d.atoms[atom.serial].bonds[0];
               if(me.icn3d.atoms[otherSerial].bonds2 !== undefined) {
                   me.icn3d.atoms[otherSerial].bonds = me.icn3d.atoms[otherSerial].bonds2.concat();
                   me.icn3d.atoms[otherSerial].bondOrder = me.icn3d.atoms[otherSerial].bondOrder2.concat();
               }

               me.icn3d.dAtoms[atom.serial] = 1;
               me.icn3d.hAtoms[atom.serial] = 1;
           }
       }
*/
       // get hydrogen atoms for currently selected atoms
       for(var i in me.icn3d.hAtoms) {
           var atom = me.icn3d.atoms[i];

           if(atom.name !== 'H') {
               me.icn3d.atoms[atom.serial].bonds = me.icn3d.atoms[atom.serial].bonds2.concat();
               me.icn3d.atoms[atom.serial].bondOrder = me.icn3d.atoms[atom.serial].bondOrder2.concat();

               for(var j = 0, jl = me.icn3d.atoms[atom.serial].bonds.length; j < jl; ++j) {
                   var serial = me.icn3d.atoms[atom.serial].bonds[j];

                   if(me.icn3d.atoms[serial].name === 'H') {
                       me.icn3d.dAtoms[serial] = 1;
                       me.icn3d.hAtoms[serial] = 1;
                   }
               }
           }
       }
    },

    hideHydrogens: function() { var me = this; //"use strict";
       // remove hydrogen atoms for currently selected atoms
       for(var i in me.icn3d.hAtoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.name === 'H') {
               if(me.icn3d.atoms[atom.serial].bonds.length > 0) {
                   var otherSerial = me.icn3d.atoms[atom.serial].bonds[0];

                   //me.icn3d.atoms[atom.serial].bonds = [];

                   var pos = me.icn3d.atoms[otherSerial].bonds.indexOf(atom.serial);
                   if(pos !== -1) {
                       me.icn3d.atoms[otherSerial].bonds.splice(pos, 1);
                       me.icn3d.atoms[otherSerial].bondOrder.splice(pos, 1);
                   }
               }

               delete me.icn3d.dAtoms[atom.serial];
               delete me.icn3d.hAtoms[atom.serial];
           }
       }
    },

    showAll: function() { var me = this; //"use strict";
           me.icn3d.dAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

           me.icn3d.maxD = me.icn3d.oriMaxD;

           me.icn3d.draw();
    },

    // ====== functions end ===============

    // ====== events start ===============
    // back and forward arrows
    clickBack: function() { var me = this; //"use strict";
        $("#" + me.pre + "back").add("#" + me.pre + "mn6_back").click(function(e) {
           e.preventDefault();

           me.setLogCmd("back", false);
           me.back();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickForward: function() { var me = this; //"use strict";
        $("#" + me.pre + "forward").add("#" + me.pre + "mn6_forward").click(function(e) {
           e.preventDefault();

           me.setLogCmd("forward", false);
           me.forward();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    openFullscreen: function(elem) { var me = this; //"use strict";
      if (!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
          }
      }
    },

    clickFullscreen: function() { var me = this; //"use strict";
/*
        $("#" + me.pre + "mn6_fullscreen").click(function(e) { // from menu "View > Full Screen"
           e.preventDefault();

           me.setLogCmd("enter full screen", false);

           me.WIDTH = $( window ).width() - me.LESSWIDTH;
           me.HEIGHT = $( window ).height() - me.EXTRAHEIGHT - me.LESSHEIGHT;

           me.resizeCanvas(me.WIDTH, me.HEIGHT, true);

           if($("#" + me.pre + "fullscreen")[0] !== undefined) $("#" + me.pre + "fullscreen").hide();
        });

        $("#" + me.pre + "mn6_exitfullscreen").click(function(e) { // from menu "View > Exit Full Screen"
           e.preventDefault();

           me.setLogCmd("exit full screen", false);

           me.setViewerWidthHeight();

           me.resizeCanvas(me.WIDTH, me.HEIGHT, true);

           if($("#" + me.pre + "fullscreen")[0] !== undefined) $("#" + me.pre + "fullscreen").show();
        });
*/

        $("#" + me.pre + "fullscreen").add("#" + me.pre + "mn6_fullscreen").click(function(e) { // from expand icon for mobilemenu
           e.preventDefault();

           me = me.setIcn3dui($(this).attr('id'));

           me.setLogCmd("enter full screen", false);
           me.icn3d.bFullscreen = true;

           me.WIDTH = $( window ).width();
           me.HEIGHT = $( window ).height();

           me.icn3d.setWidthHeight(me.WIDTH, me.HEIGHT);

           me.icn3d.draw();

           me.openFullscreen($("#" + me.pre + "canvas")[0]);
        });

        $(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', function (e) {
            var fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement || document.msFullscreenElement;

            if (!fullscreenElement) {
                me.setLogCmd("exit full screen", false);
                me.icn3d.bFullscreen = false;

                me.setViewerWidthHeight();

                me.icn3d.setWidthHeight(me.WIDTH, me.HEIGHT);

                me.icn3d.draw();
            }
        });
    },

    clickToggle: function() { var me = this; //"use strict";
        $("#" + me.pre + "toggle").add("#" + me.pre + "mn2_toggle").click(function(e) {
           //me.setLogCmd("toggle selection", true);
           me.toggleSelection();
           me.setLogCmd("toggle selection", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlColorYellow: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_clrYellow").click(function(e) {
           me.setLogCmd("set highlight color yellow", true);
           me.icn3d.hColor = new THREE.Color(0xFFFF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
           me.icn3d.draw(); // required to make it work properly

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlColorGreen: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_clrGreen").click(function(e) {
           me.setLogCmd("set highlight color green", true);
           me.icn3d.hColor = new THREE.Color(0x00FF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('green');
           me.icn3d.draw(); // required to make it work properly

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlColorRed: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_clrRed").click(function(e) {
           me.setLogCmd("set highlight color red", true);
           me.icn3d.hColor = new THREE.Color(0xFF0000);
           me.icn3d.matShader = me.icn3d.setOutlineColor('red');
           me.icn3d.draw(); // required to make it work properly

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlStyleOutline: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_styleOutline").click(function(e) {
           me.setLogCmd("set highlight style outline", true);
           me.icn3d.bHighlight = 1;

           me.showHighlight();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlStyleObject: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_styleObject").click(function(e) {
           me.setLogCmd("set highlight style 3d", true);
           me.icn3d.bHighlight = 2;

           me.showHighlight();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickHlStyleNone: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_hl_styleNone").click(function(e) {
            e.stopImmediatePropagation();

            me.clearHighlight();

            me.setLogCmd("clear selection", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickAlternate: function() { var me = this; //"use strict";
        $("#" + me.pre + "alternate").add("#" + me.pre + "mn2_alternate").add("#" + me.pre + "alternate2").click(function(e) {
           //me.setLogCmd("alternate structures", false);
           me.icn3d.bAlternate = true;

           me.icn3d.alternateStructures();

           me.icn3d.bAlternate = false;
           me.setLogCmd("alternate structures", false);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickRealign: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_realignresbyres").click(function(e) {
           me.realign();
           me.setLogCmd("realign", true);
        });
    },

    clickRealignonseqalign: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_realignonseqalign").click(function(e) {
            if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
               var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

               me.setPredefinedInMenu();
               me.bSetChainsAdvancedMenu = true;

               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
            }

            var definedAtomsHtml = me.setAtomMenu(['protein']);

            if($("#" + me.pre + "atomsCustomRealign").length) {
                $("#" + me.pre + "atomsCustomRealign").html(definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomRealign2").length) {
                $("#" + me.pre + "atomsCustomRealign2").html(definedAtomsHtml);
            }

            if(me.icn3d.bRender) me.openDialog(me.pre + 'dl_realign', 'Please select two sets to realign');

            $("#" + me.pre + "atomsCustomRealign").resizable();
            $("#" + me.pre + "atomsCustomRealign2").resizable();
        });
    },

    clickApplyRealign: function() { var me = this; //"use strict";
        $("#" + me.pre + "applyRealign").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           var nameArray = $("#" + me.pre + "atomsCustomRealign").val();

           if(nameArray.length > 0) {
               me.icn3d.hAtoms = me.getAtomsFromNameArray(nameArray);
           }

           me.realignOnSeqAlign();
           if(nameArray.length > 0) {
               me.setLogCmd("realign on seq align | " + nameArray, true);
           }
           else {
               me.setLogCmd("realign on seq align", true);
           }
        });
    },

    //mn 1
    clkMn1_mmtfid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_mmtfid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmtfid', 'Please input MMTF ID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_pdbid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_pdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_pdbid', 'Please input PDB ID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_opmid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_opmid").click(function(e) {
           me.openDialog(me.pre + 'dl_opmid', 'Please input OPM PDB ID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_align: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_align").click(function(e) {
           me.openDialog(me.pre + 'dl_align', 'Align two 3D structures');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_chainalign: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_chainalign").click(function(e) {
           me.openDialog(me.pre + 'dl_chainalign', 'Align two chains of 3D structures');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    setIcn3dui: function(id) { var me = this; //"use strict";
           var idArray = id.split('_'); // id: div0_reload_pdbfile
           me.pre = idArray[0] + "_";

           if(window.icn3duiHash !== undefined && window.icn3duiHash.hasOwnProperty(idArray[0])) { // for multiple 3D display
              me = window.icn3duiHash[idArray[0]];
           }

           return me;
    },

    clkMn1_pdbfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_pdbfile").click(function(e) {
           me = me.setIcn3dui($(this).attr('id'));

           me.openDialog(me.pre + 'dl_pdbfile', 'Please input PDB File');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_mol2file: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_mol2file").click(function(e) {
           me.openDialog(me.pre + 'dl_mol2file', 'Please input Mol2 File');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },
    clkMn1_sdffile: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_sdffile").click(function(e) {
           me.openDialog(me.pre + 'dl_sdffile', 'Please input SDF File');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },
    clkMn1_xyzfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_xyzfile").click(function(e) {
           me.openDialog(me.pre + 'dl_xyzfile', 'Please input XYZ File');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },
    clkMn1_urlfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_urlfile").click(function(e) {
           me.openDialog(me.pre + 'dl_urlfile', 'Load data by URL');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_mmciffile: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_mmciffile").click(function(e) {
           me.openDialog(me.pre + 'dl_mmciffile', 'Please input mmCIF File');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_mmcifid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_mmcifid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmcifid', 'Please input mmCIF ID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_mmdbid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_mmdbid").click(function(e) {
           me.openDialog(me.pre + 'dl_mmdbid', 'Please input MMDB or PDB ID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_blast_rep_id: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_blast_rep_id").click(function(e) {
           me.openDialog(me.pre + 'dl_blast_rep_id', 'Align sequence to structure');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_gi: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_gi").click(function(e) {
           me.openDialog(me.pre + 'dl_gi', 'Please input protein gi');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_cid: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_cid").click(function(e) {
           me.openDialog(me.pre + 'dl_cid', 'Please input PubChem CID');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_pngimage: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_pngimage").click(function(e) {
           me.openDialog(me.pre + 'dl_pngimage', 'Please input the PNG image');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_state: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_state").click(function(e) {
           me.openDialog(me.pre + 'dl_state', 'Please input the state file');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_selection: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_selection").click(function(e) {
           me.openDialog(me.pre + 'dl_selection', 'Please input the selection file');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_dsn6: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_dsn6").click(function(e) {
           me.openDialog(me.pre + 'dl_dsn6', 'Please input the DSN6 file to display electron density map');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_dsn6url: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_dsn6url").click(function(e) {
           me.openDialog(me.pre + 'dl_dsn6url', 'Please input the DSN6 file to display electron density map');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_exportState: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportState").click(function(e) {
           me.setLogCmd("export state file", false);

           var file_pref = (me.inputid) ? me.inputid : "custom";
           me.saveFile(file_pref + '_statefile.txt', 'command');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    exportStlFile: function(postfix) { var me = this; //"use strict";
       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly) {
            // use a smaller grid to build the surface for assembly
            me.icn3d.threshbox = 180 / Math.pow(me.icn3d.biomtMatrices.length, 0.33);

            me.icn3d.removeSurfaces();
            me.icn3d.applySurfaceOptions();

            me.icn3d.removeMaps();
            me.icn3d.applyMapOptions();

            me.icn3d.removeEmmaps();
            me.icn3d.applyEmmapOptions();
       }

       var text = me.saveStlFile();
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + postfix + '.stl', 'binary', text);

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
                  me.saveFile(file_pref + postfix + index + '.stl', 'binary', text);
                  text = '';
              }.bind(this, mat, index), time);

              ++index;
            }

            // reset grid to build the surface for assembly
            me.icn3d.threshbox = 180;
       }
    },

    exportVrmlFile: function(postfix) { var me = this; //"use strict";
       // assemblies
       if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1 && me.icn3d.bAssembly) {
            // use a smaller grid to build the surface for assembly
            me.icn3d.threshbox = 180 / Math.pow(me.icn3d.biomtMatrices.length, 0.33);

            me.icn3d.removeSurfaces();
            me.icn3d.applySurfaceOptions();

            me.icn3d.removeMaps();
            me.icn3d.applyMapOptions();

            me.icn3d.removeEmmaps();
            me.icn3d.applyEmmapOptions();
       }

       var text = me.saveVrmlFile();
       var file_pref = (me.inputid) ? me.inputid : "custom";
       //me.saveFile(file_pref + postfix + '.wrl', 'text', text);
       me.saveFile(file_pref + postfix + '.vrml', 'text', text);

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
                  //me.saveFile(me.inputid + postfix + index + '.wrl', 'text', text);
                  me.saveFile(file_pref + postfix + index + '.vrml', 'text', text);
                  text = '';
              }.bind(this, mat, index), time);

              ++index;
            }

            // reset grid to build the surface for assembly
            me.icn3d.threshbox = 180;
       }
    },

    clkMn1_exportStl: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportStl").click(function(e) {
           me.setLogCmd("export stl file", false);

           //me.hideStabilizer();

           me.exportStlFile('');
        });
    },

    clkMn1_exportVrml: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportVrml").click(function(e) {
           me.setLogCmd("export vrml file", false);

           //me.hideStabilizer();

           me.exportVrmlFile('');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_exportStlStab: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportStlStab").click(function(e) {
           me.setLogCmd("export stl stabilizer file", false);

           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportStlFile('_stab');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_exportVrmlStab: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportVrmlStab").click(function(e) {
           me.setLogCmd("export vrml stabilizer file", false);

           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportVrmlFile('_stab');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_exportInteraction: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_exportInteraction").click(function(e) {
           me.setLogCmd("export interactions", false);

           if(me.cfg.mmdbid !== undefined) me.retrieveInteractionData();

           me.exportInteractions();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_exportCanvas: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportCanvas").add("#" + me.pre + "saveimage").click(function(e) {
           me.setLogCmd("export canvas", false);

           //var file_pref = (me.inputid) ? me.inputid : "custom";
           //me.saveFile(file_pref + '_image_icn3d_loadable.png', 'png');
           var bPngHtml = true;
           me.shareLink(bPngHtml);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
        $("#" + me.pre + "mn1_exportCanvas2").click(function(e) {
           me.setLogCmd("export canvas 2", false);

           me.icn3d.scaleFactor = 2;
           me.shareLink(true);
        });
        $("#" + me.pre + "mn1_exportCanvas4").click(function(e) {
           me.setLogCmd("export canvas 4", false);

           me.icn3d.scaleFactor = 4;
           me.shareLink(true);
        });
        $("#" + me.pre + "mn1_exportCanvas8").click(function(e) {
           me.setLogCmd("export canvas 8", false);

           me.icn3d.scaleFactor = 8;
           me.shareLink(true);
        });
    },

    clkMn1_exportCounts: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportCounts").click(function(e) {
           me.setLogCmd("export counts", false);

           var text = '<html><body><div style="text-align:center"><br><b>Total Count for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure Count</th><th>Chain Count</th><th>Residue Count</th><th>Atom Count</th></tr>';

           text += '<tr><td>' + Object.keys(me.icn3d.structures).length + '</td><td>' + Object.keys(me.icn3d.chains).length + '</td><td>' + Object.keys(me.icn3d.residues).length + '</td><td>' + Object.keys(me.icn3d.atoms).length + '</td></tr>';

           text += '</table><br/>';

           text += '<b>Counts by Chain for atoms with coordinates</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Structure</th><th>Chain</th><th>Residue Count</th><th>Atom Count</th></tr>';

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

           text += '</table><br/></div></body></html>';

           var file_pref = (me.inputid) ? me.inputid : "custom";
           me.saveFile(file_pref + '_counts.html', 'html', text);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_exportSelections: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_exportSelections").click(function(e) {
           me.setLogCmd("export all selections", false);

          if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
               var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

               me.setPredefinedInMenu();
               me.bSetChainsAdvancedMenu = true;

               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
          }

           var text = me.exportCustomAtoms();

           var file_pref = (me.inputid) ? me.inputid : "custom";
           me.saveFile(file_pref + '_selections.txt', 'text', [text]);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_sharelink: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_sharelink").click(function(e) {
            me.shareLink();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },


    clkMn1_replay: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_replayon").click(function(e) {

          me.replayon();

          me.setLogCmd("replay on", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn1_replayoff").click(function(e) {
            me.replayoff();

            me.setLogCmd("replay off", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    replayon: function() { var me = this; //"use strict";
      me.CURRENTNUMBER = 0;

      me.cfg.replay = 1;
      $("#" + me.pre + "replay").show();

      me.closeDialogs();

      // select all
      me.selectAll();

      me.renderFinalStep(1);

      var currentNumber = me.CURRENTNUMBER;

      var pos = me.icn3d.commands[currentNumber].indexOf(' | ');
      var cmdStrOri = me.icn3d.commands[currentNumber].substr(0, pos);
      var maxLen = 20;
      var cmdStr = (cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;

      var menuStr = me.getMenuFromCmd(cmdStr); // 'File > Retrieve by ID, Align';

      $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
      $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);
    },

    replayoff: function() { var me = this; //"use strict";
        me.cfg.replay = 0;
        $("#" + me.pre + "replay").hide();

        // replay all steps
        ++me.CURRENTNUMBER;
        me.execCommands(me.CURRENTNUMBER, me.STATENUMBER-1, me.STATENUMBER);
    },

    clkMn1_link_structure: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_link_structure").click(function(e) {
           var url = me.getLinkToStructureSummary(true);

           window.open(url, '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_link_bind: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_link_bind").click(function(e) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound?LinkName=pccompound_structure&from_uid=" + me.inputid;
           me.setLogCmd("link to 3D protein structures bound to CID " + me.inputid + ": " + url, false);

           window.open(url, '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_link_vast: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_link_vast").click(function(e) {
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
                       url = me.baseUrl + "vastplus/vastplus.cgi?uid=" + me.inputid;
                       me.setLogCmd("link to structures similar to " + me.inputid + ": " + url, false);
                   }
                   else if(idArray.length === 2) {
                       url = me.baseUrl + "vastplus/vastplus.cgi?uid=" + idArray[0];
                       me.setLogCmd("link to structures similar to " + idArray[0] + ": " + url, false);
                   }
               }

               window.open(url, '_blank');
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_link_pubmed: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_link_pubmed").click(function(e) {
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn1_link_protein: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_link_protein").click(function(e) {
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // mn 2
    clkMn2_selectannotations: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_selectannotations").click(function(e) {
           me.showAnnotations();
           me.setLogCmd("view annotations", true);
           //me.setLogCmd("window annotations", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_selectall: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectall").click(function(e) {
           me.setLogCmd("select all", true);

           me.selectAll();

           me.removeHlAll();

           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "clearall").click(function(e) {
           me.setLogCmd("clear all", true);

           me.bSelectResidue = false;

           me.selectAll();

           me.removeHlAll();

           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

    },

    clkMn2_selectdisplayed: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectdisplayed").click(function(e) {
           me.setLogCmd("select displayed set", true);

           me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.dAtoms);
           me.updateHlAll();

           //me.icn3d.draw();
        });
    },

    clkMn2_fullstru: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_fullstru").click(function(e) {
           me.setLogCmd("show all", true);

           me.showAll();
        });
    },

    clkMn2_selectcomplement: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectcomplement").click(function(e) {
           if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.atoms).length) {
               me.setLogCmd("select complement", true);

               me.selectComplement();
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_selectmainchains: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectmainchains").click(function(e) {
           me.setLogCmd("select main chains", true);

           me.selectMainChains();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_selectsidechains: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectsidechains").click(function(e) {
           me.setLogCmd("select side chains", true);

           me.selectSideChains();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_propperty: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_propPos").click(function(e) {
           me.setLogCmd("select prop positive", true);

           me.selectProperty('positive');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn2_propNeg").click(function(e) {
           me.setLogCmd("select prop negative", true);

           me.selectProperty('negative');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn2_propHydro").click(function(e) {
           me.setLogCmd("select prop hydrophobic", true);

           me.selectProperty('hydrophobic');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn2_propPolar").click(function(e) {
           me.setLogCmd("select prop polar", true);

           me.selectProperty('polar');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn2_propBfactor").click(function(e) {
           me.openDialog(me.pre + 'dl_propbybfactor', 'Select residue based on B-factor');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "mn2_propSolAcc").click(function(e) {
           me.openDialog(me.pre + 'dl_propbypercentout', 'Select residue based on the percentage of solvent accessilbe surface area');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "applypropbybfactor").click(function(e) {
           var from = $("#" + me.pre + "minbfactor").val();
           var to = $("#" + me.pre + "maxbfactor").val();

           me.setLogCmd("select prop b factor | " + from + '_' + to, true);

           me.selectProperty('b factor', from, to);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "applypropbypercentout").click(function(e) {
           var from = $("#" + me.pre + "minpercentout").val();
           var to = $("#" + me.pre + "maxpercentout").val();

           me.setLogCmd("select prop percent out | " + from + '_' + to, true);

           me.selectProperty('percent out', from, to);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    selectProperty: function(property, from, to) { var me = this; //"use strict";
        var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

        if(property == 'positive') {
            var select = ':r,k,h';
            me.icn3d.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'negative') {
            var select = ':d,e';
            me.icn3d.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'hydrophobic') {
            var select = ':w,f,y,l,i,c,m';
            me.icn3d.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'polar') {
            var select = ':g,v,s,t,a,n,p,q';
            me.icn3d.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'b factor') {
            var atoms = me.icn3d.cloneHash(me.icn3d.calphas);
            atoms = me.icn3d.unionHash(atoms, me.icn3d.nucleotidesO3);
            atoms = me.icn3d.unionHash(atoms, me.icn3d.chemicals);
            atoms = me.icn3d.unionHash(atoms, me.icn3d.ions);
            atoms = me.icn3d.unionHash(atoms, me.icn3d.water);

            me.icn3d.hAtoms = {};
            for(var i in atoms) {
                var atom = me.icn3d.atoms[i];
                if(atom.b >= from && atom.b <= to) {
                    me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[atom.structure + '_' + atom.chain + '_' + atom.resi]);
                }
            }
        }
        else if(property == 'percent out') {
           me.icn3d.bCalcArea = true;
           me.icn3d.opts.surface = 'solvent accessible surface';
           me.icn3d.applySurfaceOptions();

           me.icn3d.bCalcArea = false;

           me.icn3d.hAtoms = {};
           for(var resid in me.icn3d.resid2area) { // resid: structure_chain_resi_resn
                var idArray = resid.split('_');
                if(me.icn3d.residueArea.hasOwnProperty(idArray[3])) {
                    var percent = parseInt(me.icn3d.resid2area[resid] / me.icn3d.residueArea[idArray[3]] * 100);

                    if(percent >= from && percent <= to) {
                        var residReal = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
                        me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.residues[residReal]);
                    }
                }
           }
        }

        me.icn3d.hAtoms = me.icn3d.intHash(me.icn3d.hAtoms, prevHAtoms);

        me.icn3d.draw();

        me.updateHlAll();
    },

    clkMn2_alignment: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_alignment").click(function(e) {
           me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
           me.setLogCmd("window aligned sequences", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_yournote: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_yournote").click(function(e) {
           me.openDialog(me.pre + 'dl_yournote', 'Your note about the current display');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkApplyYournote: function() { var me = this; //"use strict";
        $("#" + me.pre + "applyyournote").click(function(e) {
           me.yournote = $("#" + me.pre + "yournote").val();

           document.title = me.yournote;

           dialog.dialog( "close" );

           me.setLogCmd('your note | ' + me.yournote, true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_command: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_command").click(function(e) {
           me.openDialog(me.pre + 'dl_advanced2', 'Select by specification');
           //$("#" + me.pre + "dl_setsmenu").hide();
           //$("#" + me.pre + "dl_setoperations").hide();
           //$("#" + me.pre + "dl_command").show();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_definedsets: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_definedsets").add("#" + me.pre + "definedsets").add("#" + me.pre + "definedsets2").click(function(e) {
           me.showSets();

           me.setLogCmd('defined sets', true);
           //me.setLogCmd('window defined sets', true);
        });

        $("#" + me.pre + "setOr").click(function(e) {
           me.setOperation = 'or';
        });
        $("#" + me.pre + "setAnd").click(function(e) {
           me.setOperation = 'and';
        });
        $("#" + me.pre + "setNot").click(function(e) {
           me.setOperation = 'not';
        });
    },

    clkMn2_pkNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkNo").click(function(e) {
           me.icn3d.pk = 0;
           me.icn3d.opts['pk'] = 'no';
           me.setLogCmd('set pk off', true);

           me.icn3d.draw();
           me.icn3d.removeHlObjects();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_pkYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkYes").click(function(e) {
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.setLogCmd('set pk atom', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_pkResidue: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkResidue").click(function(e) {
           me.icn3d.pk = 2;
           me.icn3d.opts['pk'] = 'residue';
           me.setLogCmd('set pk residue', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_pkStrand: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkStrand").click(function(e) {
           me.icn3d.pk = 3;
           me.icn3d.opts['pk'] = 'strand';
           me.setLogCmd('set pk strand', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_pkDomain: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkDomain").click(function(e) {
           me.icn3d.pk = 4;
           me.icn3d.opts['pk'] = 'domain';
           me.setLogCmd('set pk domain', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_pkChain: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_pkChain").click(function(e) {
           me.icn3d.pk = 5;
           me.icn3d.opts['pk'] = 'chain';
           me.setLogCmd('set pk chain', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clk_adjustmem: function() { var me = this; //"use strict";
        $("#" + me.pre + "adjustmem").click(function(e) {
            me.openDialog(me.pre + 'dl_adjustmem', 'Adjust the Z-axis positions of the membrane');
        });
    },

    toggleMembrane: function() { var me = this; //"use strict";
        var structure = Object.keys(me.icn3d.structures)[0];
        var atomsHash = me.icn3d.residues[structure + '_MEM_1'];
        var firstAtom = me.icn3d.getFirstAtomObj(atomsHash);
        var oriStyle = firstAtom.style;

        if(!me.icn3d.dAtoms.hasOwnProperty(firstAtom.serial)) {
            // add membrane to displayed atoms if the membrane is not part of the display
            me.icn3d.dAtoms = me.icn3d.unionHash(me.icn3d.dAtoms, atomsHash);
            oriStyle = 'nothing';
        }

        for(var i in atomsHash) {
            var atom = me.icn3d.atoms[i];

            if(oriStyle !== 'nothing') {
                atom.style = 'nothing';
            }
            else {
                atom.style = 'stick';
            }
        }

        me.icn3d.draw();
    },

    clk_togglemem: function() { var me = this; //"use strict";
        $("#" + me.pre + "togglemem").click(function(e) {
           me.toggleMembrane();
           me.setLogCmd('toggle membrane', true);
        });
    },

/*
    clk_addplane: function() { var me = this; //"use strict";
        $("#" + me.pre + "addplane").click(function(e) {
            me.openDialog(me.pre + 'dl_addplane', 'Add a plane parallel to the membranes');
        });
    },
*/

    clk_selectplane: function() { var me = this; //"use strict";
        $("#" + me.pre + "selectplane").click(function(e) {
            me.openDialog(me.pre + 'dl_selectplane', 'Select a region between two planes');
        });
    },

    clkMn2_aroundsphere: function() { var me = this; //"use strict";
        //$("#" + me.pre + "mn2_aroundsphere").add("#" + me.pre + "mn2_aroundsphere2").click(function(e) {
        $("#" + me.pre + "mn2_aroundsphere").click(function(e) {
            if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
               var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

               me.setPredefinedInMenu();
               me.bSetChainsAdvancedMenu = true;

               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
            }

            var definedAtomsHtml = me.setAtomMenu(['protein']);

            if($("#" + me.pre + "atomsCustomSphere").length) {
                $("#" + me.pre + "atomsCustomSphere").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomSphere2").length) {
                $("#" + me.pre + "atomsCustomSphere2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
            }

            me.openDialog(me.pre + 'dl_aroundsphere', 'Select a sphere around a set of residues');
            me.bSphereCalc = false;
            //me.setLogCmd('set calculate sphere false', true);

            $("#" + me.pre + "atomsCustomSphere").resizable();
            $("#" + me.pre + "atomsCustomSphere2").resizable();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_select_chain: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_select_chain").add("#" + me.pre + "definedSets").click(function(e) {
           me.openDialog(me.pre + 'dl_select_chain', 'Select Structure/Chain/Custom Selection');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // mn 3
    clkMn3_proteinsRibbon: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsRibbon").click(function(e) {
           me.setStyle('proteins', 'ribbon');
           me.setLogCmd('style proteins ribbon', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsStrand: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsStrand").click(function(e) {
           me.setStyle('proteins', 'strand');

           me.setLogCmd('style proteins strand', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsCylinder: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsCylinder").click(function(e) {
           me.setStyle('proteins', 'cylinder and plate');
           me.setLogCmd('style proteins cylinder and plate', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsSchematic: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsSchematic").click(function(e) {
           me.setStyle('proteins', 'schematic');
           me.setLogCmd('style proteins schematic', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsCalpha: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsCalpha").click(function(e) {
           me.setStyle('proteins', 'c alpha trace');
           me.setLogCmd('style proteins c alpha trace', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsBackbone: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsBackbone").click(function(e) {
           me.setStyle('proteins', 'backbone');
           me.setLogCmd('style proteins backbone', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsBfactor: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsBfactor").click(function(e) {
           me.setStyle('proteins', 'b factor tube');
           me.setLogCmd('style proteins b factor tube', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsLines: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsLines").click(function(e) {
           me.setStyle('proteins', 'lines');
           me.setLogCmd('style proteins lines', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsStick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsStick").click(function(e) {
           me.setStyle('proteins', 'stick');
           me.setLogCmd('style proteins stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsBallstick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsBallstick").click(function(e) {
           me.setStyle('proteins', 'ball and stick');
           me.setLogCmd('style proteins ball and stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsSphere").click(function(e) {
           me.setStyle('proteins', 'sphere');
           me.setLogCmd('style proteins sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_proteinsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_proteinsNo").click(function(e) {
           me.setStyle('proteins', 'nothing');
           me.setLogCmd('style proteins nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_sidecLines: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_sidecLines").click(function(e) {
           me.setStyle('sidec', 'lines');
           me.setLogCmd('style sidec lines', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_sidecStick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_sidecStick").click(function(e) {
           me.setStyle('sidec', 'stick');
           me.setLogCmd('style sidec stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_sidecBallstick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_sidecBallstick").click(function(e) {
           me.setStyle('sidec', 'ball and stick');
           me.setLogCmd('style sidec ball and stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_sidecSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_sidecSphere").click(function(e) {
           me.setStyle('sidec', 'sphere');
           me.setLogCmd('style sidec sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_sidecNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_sidecNo").click(function(e) {
           me.setStyle('sidec', 'nothing');
           me.setLogCmd('style sidec nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },


    clkMn3_nuclCartoon: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclCartoon").click(function(e) {
           me.setStyle('nucleotides', 'nucleotide cartoon');
           me.setLogCmd('style nucleotides nucleotide cartoon', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
       });
    },

    clkMn3_nuclBackbone: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclBackbone").click(function(e) {
           me.setStyle('nucleotides', 'backbone');
           me.setLogCmd('style nucleotides backbone', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclSchematic: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclSchematic").click(function(e) {
           me.setStyle('nucleotides', 'schematic');
           me.setLogCmd('style nucleotides schematic', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclPhos: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclPhos").click(function(e) {
           me.setStyle('nucleotides', 'o3 trace');
           me.setLogCmd('style nucleotides o3 trace', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclLines: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclLines").click(function(e) {
           me.setStyle('nucleotides', 'lines');
           me.setLogCmd('style nucleotides lines', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclStick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclStick").click(function(e) {
           me.setStyle('nucleotides', 'stick');
           me.setLogCmd('style nucleotides stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclBallstick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclBallstick").click(function(e) {
           me.setStyle('nucleotides', 'ball and stick');
           me.setLogCmd('style nucleotides ball and stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclSphere").click(function(e) {
           me.setStyle('nucleotides', 'sphere');
           me.setLogCmd('style nucleotides sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_nuclNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_nuclNo").click(function(e) {
           me.setStyle('nucleotides', 'nothing');
           me.setLogCmd('style nucleotides nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligLines: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligLines").click(function(e) {
           me.setStyle('chemicals', 'lines');
           me.setLogCmd('style chemicals lines', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligStick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligStick").click(function(e) {
           me.setStyle('chemicals', 'stick');
           me.setLogCmd('style chemicals stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligBallstick: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligBallstick").click(function(e) {
           me.setStyle('chemicals', 'ball and stick');
           me.setLogCmd('style chemicals ball and stick', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligSchematic: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligSchematic").click(function(e) {
           me.setStyle('chemicals', 'schematic');
           me.setLogCmd('style chemicals schematic', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligSphere").click(function(e) {
           me.setStyle('chemicals', 'sphere');
           me.setLogCmd('style chemicals sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ligNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ligNo").click(function(e) {
           me.setStyle('chemicals', 'nothing');
           me.setLogCmd('style chemicals nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_hydrogensYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_hydrogensYes").click(function(e) {
           me.showHydrogens();
           me.icn3d.draw();
           me.setLogCmd('hydrogens', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_hydrogensNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_hydrogensNo").click(function(e) {
           me.hideHydrogens();
           me.icn3d.draw();
           me.setLogCmd('set hydrogens off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ionsSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ionsSphere").click(function(e) {
           me.setStyle('ions', 'sphere');
           me.setLogCmd('style ions sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ionsDot: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ionsDot").click(function(e) {
           me.setStyle('ions', 'dot');
           me.setLogCmd('style ions dot', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_ionsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_ionsNo").click(function(e) {
           me.setStyle('ions', 'nothing');
           me.setLogCmd('style ions nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_waterSphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_waterSphere").click(function(e) {
           me.setStyle('water', 'sphere');
           me.setLogCmd('style water sphere', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_waterDot: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_waterDot").click(function(e) {
           me.setStyle('water', 'dot');
           me.setLogCmd('style water dot', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_waterNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_waterNo").click(function(e) {
           me.setStyle('water', 'nothing');
           me.setLogCmd('style water nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // mn 4
    clkMn4_clrSpectrum: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrSpectrum").click(function(e) {
           me.setOption('color', 'spectrum');
           me.setLogCmd('color spectrum', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrChain: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrChain").click(function(e) {
           me.setOption('color', 'chain');
           me.setLogCmd('color chain', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrDomain: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrdomain").click(function(e) {
           me.setOption('color', 'domain');
           me.setLogCmd('color domain', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrSSGreen: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrSSGreen").click(function(e) {
           me.icn3d.sheetcolor = 'green';

           me.setOption('color', 'secondary structure green');
           me.setLogCmd('color secondary structure green', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrSSYellow: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrSSYellow").click(function(e) {
           me.icn3d.sheetcolor = 'yellow';

           me.setOption('color', 'secondary structure yellow');
           me.setLogCmd('color secondary structure yellow', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrSSSpectrum: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrSSSpectrum").click(function(e) {
           me.setOption('color', 'secondary structure spectrum');
           me.setLogCmd('color secondary structure spectrum', true);
        });
    },

    clkMn4_clrResidue: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrResidue").click(function(e) {
           me.setOption('color', 'residue');
           me.setLogCmd('color residue', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrResidueCustom: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrResidueCustom").click(function(e) {
           me.openDialog(me.pre + 'dl_rescolorfile', 'Please input the file on residue colors');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_reloadRescolorfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_rescolorfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var file = $("#" + me.pre + "rescolorfile")[0].files[0];

           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
             }

             var reader = new FileReader();
             reader.onload = function (e) {
               var dataStrTmp = e.target.result; // or = reader.result;
               var dataStr = dataStrTmp.replace(/#/g, "");

               me.icn3d.customResidueColors = JSON.parse(dataStr);
               for(var res in me.icn3d.customResidueColors) {
                   me.icn3d.customResidueColors[res.toUpperCase()] = new THREE.Color("#" + me.icn3d.customResidueColors[res]);
               }

               me.setOption('color', 'residue custom');
               me.setLogCmd('color residue custom | ' + dataStr, true);
             };

             reader.readAsText(file);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    setCustomFile: function(type) { var me = this; //"use strict";
       var chainid = $("#" + me.pre + "customcolor_chainid").val();
       var file = $("#" + me.pre + "cstcolorfile")[0].files[0];

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
            var lineArray = dataStr.split('\n');

            if(me.icn3d.queryresi2score === undefined) me.icn3d.queryresi2score = {};
            //if(me.icn3d.queryresi2score[chainid] === undefined) me.icn3d.queryresi2score[chainid] = {};
            me.icn3d.queryresi2score[chainid] = {};

            for(var i = 0, il = lineArray.length; i < il; ++i) {
                if(lineArray[i].trim() !== '') {
                    var columnArray = lineArray[i].split(/\s+/);

                    me.icn3d.queryresi2score[chainid][columnArray[0]] = columnArray[1];
                }
            }

            var resiArray = Object.keys(me.icn3d.queryresi2score[chainid]);
            var start = Math.min.apply(null, resiArray);
            var end = Math.max.apply(null, resiArray);

            var resiScoreStr = '';
            for(var resi = start; resi <= end; ++resi) {
                if(me.icn3d.queryresi2score[chainid].hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(me.icn3d.queryresi2score[chainid][resi]/11); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }

            if(type == 'color') {
                me.icn3d.opts['color'] = 'align custom';
                me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.hAtoms);

                me.updateHlAll();

                me.setLogCmd('custom tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }
            else if(type == 'tube') {
                me.setStyle('proteins', 'custom tube');
                me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }

            me.icn3d.draw();
         };

         reader.readAsText(file);
       }
    },

    clkMn4_reloadCustomcolorfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_customcolorfile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setCustomFile('color');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "reload_customtubefile").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setCustomFile('tube');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrCharge: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrCharge").click(function(e) {
           me.setOption('color', 'charge');
           me.setLogCmd('color charge', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrHydrophobic: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrHydrophobic").click(function(e) {
           me.setOption('color', 'hydrophobic');
           me.setLogCmd('color hydrophobic', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrAtom: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrAtom").click(function(e) {
           me.setOption('color', 'atom');
           me.setLogCmd('color atom', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrBfactor: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrBfactor").click(function(e) {
           me.setOption('color', 'b factor');
           me.setLogCmd('color b factor', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrArea: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrArea").click(function(e) {
            me.openDialog(me.pre + 'dl_colorbyarea', "Color based on residue's solvent accessibility");
        });

        $("#" + me.pre + "applycolorbyarea").click(function(e) {
            me.icn3d.midpercent = $("#" + me.pre + 'midpercent').val();

            me.setOption('color', 'area');
            me.setLogCmd('color area | ' + me.icn3d.midpercent, true);

            //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrBfactorNorm: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrBfactorNorm").click(function(e) {
           me.setOption('color', 'b factor percentile');
           me.setLogCmd('color b factor percentile', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrIdentity: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrIdentity").click(function(e) {
           me.setOption('color', 'identity');
           me.setLogCmd('color identity', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrConserved: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrConserved").click(function(e) {
           me.setOption('color', 'conservation');
           me.setLogCmd('color conservation', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrRed: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrRed").click(function(e) {
           me.setOption('color', 'red');
           me.setLogCmd('color red', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrGreen: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrGreen").click(function(e) {
           me.setOption('color', 'green');
           me.setLogCmd('color green', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrBlue: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrBlue").click(function(e) {
           me.setOption('color', 'blue');
           me.setLogCmd('color blue', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrMagenta: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrMagenta").click(function(e) {
           me.setOption('color', 'magenta');
           me.setLogCmd('color magenta', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrYellow: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrYellow").click(function(e) {
           me.setOption('color', 'yellow');
           me.setLogCmd('color yellow', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrCyan: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrCyan").click(function(e) {
           me.setOption('color', 'cyan');
           me.setLogCmd('color cyan', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrWhite: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrWhite").click(function(e) {
           me.setOption('color', 'white');
           me.setLogCmd('color white', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrGrey: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrGrey").click(function(e) {
           me.setOption('color', 'grey');
           me.setLogCmd('color grey', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrCustom: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrCustom").click(function(e) {
           me.openDialog(me.pre + 'dl_clr', 'Color picker');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrOther: function() { var me = this; //"use strict";
        $(document).on('click', ".icn3d-color-rad-text", function(e) {
          e.stopImmediatePropagation();

          //e.preventDefault();
          var color = $(this).attr('color');
          me.setOption("color", color);
          me.setLogCmd("color " + color, true);
        });
    },

    clkMn4_clrSave: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrSave").click(function(e) {
           me.saveColor();

           me.setLogCmd('save color', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn4_clrApplySave: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn4_clrApplySave").click(function(e) {
           me.applySavedColor();

           me.setLogCmd('apply saved color', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_styleSave: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_styleSave").click(function(e) {
           me.saveStyle();
           me.setLogCmd('save style', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn3_styleApplySave: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_styleApplySave").click(function(e) {
           me.applySavedStyle();
           me.setLogCmd('apply saved style', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // mn 5
    clkMn5_neighborsYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_neighborsYes").click(function(e) {
           me.icn3d.bConsiderNeighbors = true;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           if(me.icn3d.bRender) me.icn3d.render();

           me.setLogCmd('set surface neighbors on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_neighborsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_neighborsNo").click(function(e) {
           me.icn3d.bConsiderNeighbors = false;

           me.icn3d.removeLastSurface();
           me.icn3d.applySurfaceOptions();
           if(me.icn3d.bRender) me.icn3d.render();

           me.setLogCmd('set surface neighbors off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceVDW: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceVDW").click(function(e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'Van der Waals surface');
           me.setLogCmd('set surface Van der Waals surface', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceSAS: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceSAS").click(function(e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'solvent accessible surface');
           me.setLogCmd('set surface solvent accessible surface', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceMolecular: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceMolecular").click(function(e) {
           me.icn3d.bConsiderNeighbors = false;
           me.setOption('surface', 'molecular surface');
           me.setLogCmd('set surface molecular surface', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceVDWContext: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceVDWContext").click(function(e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'Van der Waals surface with context');
           me.setLogCmd('set surface Van der Waals surface with context', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceSASContext: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceSASContext").click(function(e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'solvent accessible surface with context');
           me.setLogCmd('set surface solvent accessible surface with context', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceMolecularContext: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceMolecularContext").click(function(e) {
           me.icn3d.bConsiderNeighbors = true;
           me.setOption('surface', 'molecular surface with context');
           me.setLogCmd('set surface molecular surface with context', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_surfaceNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_surfaceNo").click(function(e) {
           me.setOption('surface', 'nothing');
           me.setLogCmd('set surface nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity10: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity10").click(function(e) {
           me.setOption('opacity', '1.0');
           me.setLogCmd('set surface opacity 1.0', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity09: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity09").click(function(e) {
           me.setOption('opacity', '0.9');
           me.setLogCmd('set surface opacity 0.9', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity08: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity08").click(function(e) {
           me.setOption('opacity', '0.8');
           me.setLogCmd('set surface opacity 0.8', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity07: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity07").click(function(e) {
           me.setOption('opacity', '0.7');
           me.setLogCmd('set surface opacity 0.7', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity06: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity06").click(function(e) {
           me.setOption('opacity', '0.6');
           me.setLogCmd('set surface opacity 0.6', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity05: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity05").click(function(e) {
           me.setOption('opacity', '0.5');
           me.setLogCmd('set surface opacity 0.5', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity04: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity04").click(function(e) {
           me.setOption('opacity', '0.4');
           me.setLogCmd('set surface opacity 0.4', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity03: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity03").click(function(e) {
           me.setOption('opacity', '0.3');
           me.setLogCmd('set surface opacity 0.3', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity02: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity02").click(function(e) {
           me.setOption('opacity', '0.2');
           me.setLogCmd('set surface opacity 0.2', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_opacity01: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_opacity01").click(function(e) {
           me.setOption('opacity', '0.1');
           me.setLogCmd('set surface opacity 0.1', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_wireframeYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_wireframeYes").click(function(e) {
           me.setOption('wireframe', 'yes');
           me.setLogCmd('set surface wireframe on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_wireframeNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_wireframeNo").click(function(e) {
           me.setOption('wireframe', 'no');
           me.setLogCmd('set surface wireframe off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_elecmap2fofc: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_elecmap2fofc").click(function(e) {
           me.openDialog(me.pre + 'dl_elecmap2fofc', '2Fo-Fc Electron Density Map');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_elecmapfofc: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_elecmapfofc").click(function(e) {
           me.openDialog(me.pre + 'dl_elecmapfofc', 'Fo-Fc Electron Density Map');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_elecmapNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_elecmapNo").add("#" + me.pre + "elecmapNo2").add("#" + me.pre + "elecmapNo3").add("#" + me.pre + "elecmapNo4").add("#" + me.pre + "elecmapNo5").click(function(e) {
           me.setOption('map', 'nothing');
           me.setLogCmd('set map nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplymap2fofc: function() { var me = this; //"use strict";
        $("#" + me.pre + "applymap2fofc").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var sigma2fofc = parseFloat($("#" + me.pre + "sigma2fofc" ).val());

           var type = '2fofc';
           me.Dsn6Parser(me.inputid, type, sigma2fofc);

           //me.setOption('map', '2fofc');
           me.setLogCmd('set map 2fofc sigma ' + sigma2fofc, true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplymapfofc: function() { var me = this; //"use strict";
        $("#" + me.pre + "applymapfofc").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var sigmafofc = parseFloat($("#" + me.pre + "sigmafofc" ).val());

           var type = 'fofc';
           me.Dsn6Parser(me.inputid, type, sigmafofc);

           //me.setOption('map', 'fofc');
           me.setLogCmd('set map fofc sigma ' + sigmafofc, true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_mapwireframeYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_mapwireframeYes").click(function(e) {
           //me.Dsn6Parser(me.inputid);

           me.setOption('mapwireframe', 'yes');
           me.setLogCmd('set map wireframe on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_mapwireframeNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_mapwireframeNo").click(function(e) {
           me.setOption('mapwireframe', 'no');
           me.setLogCmd('set map wireframe off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_emmap: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_emmap").click(function(e) {
           me.openDialog(me.pre + 'dl_emmap', 'EM Density Map');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_emmapNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_emmapNo").add("#" + me.pre + "emmapNo2").click(function(e) {
           me.setOption('emmap', 'nothing');
           me.setLogCmd('set emmap nothing', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplyemmap: function() { var me = this; //"use strict";
        $("#" + me.pre + "applyemmap").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var empercentage = parseFloat($("#" + me.pre + "empercentage" ).val());

           var type = 'em';
           //me.emd = 'emd-3906';

           if(iCn3DUI.prototype.DensityCifParser === undefined) {
               var url = me.baseUrl + "icn3d/density_cif_parser.min.js";
               $.ajax({
                  url: url,
                  dataType: "script",
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                       me.DensityCifParser(me.inputid, type, empercentage, me.icn3d.emd);

                       me.setLogCmd('set emmap percentage ' + empercentage, true);
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
           }
           else {
               me.DensityCifParser(me.inputid, type, empercentage, me.icn3d.emd);

               me.setLogCmd('set emmap percentage ' + empercentage, true);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_emmapwireframeYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_emmapwireframeYes").click(function(e) {
           //me.Dsn6Parser(me.inputid);

           me.setOption('emmapwireframe', 'yes');
           me.setLogCmd('set emmap wireframe on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn5_emmapwireframeNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn5_emmapwireframeNo").click(function(e) {
           me.setOption('emmapwireframe', 'no');
           me.setLogCmd('set emmap wireframe off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // mn 6
    clkMn6_assemblyYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_assemblyYes").click(function(e) {
           me.icn3d.bAssembly = true;
           me.setLogCmd('set assembly on', true);
           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_assemblyNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_assemblyNo").click(function(e) {
           me.icn3d.bAssembly = false;
           me.setLogCmd('set assembly off', true);
           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_addlabelAtoms: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelAtoms").click(function(e) {
           me.icn3d.addAtomLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add atom labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelResidues: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelResidues").click(function(e) {
           me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add residue labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelResnum: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelResnum").click(function(e) {
           me.icn3d.addResiudeLabels(me.icn3d.hAtoms, undefined, undefined, true);

           me.saveSelectionIfSelected();
           me.setLogCmd('add residue number labels', true);
           me.icn3d.draw();
        });
    },

    clkMn6_addlabelChains: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelChains").click(function(e) {
           me.addChainLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add chain labels', true);
           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_addlabelTermini: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelTermini").click(function(e) {
           me.addTerminiLabels(me.icn3d.hAtoms);

           me.saveSelectionIfSelected();
           me.setLogCmd('add terminal labels', true);
           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_addlabelYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelYes").click(function(e) {
           me.openDialog(me.pre + 'dl_addlabel', 'Add custom labels by selection');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_addlabelSelection: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelSelection").click(function(e) {
           me.openDialog(me.pre + 'dl_addlabelselection', 'Add custom labels by the selected');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_saveselection: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_saveselection").click(function(e) {
           me.openDialog(me.pre + 'dl_saveselection', 'Save the selected');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_addlabelNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_addlabelNo").add("#" + me.pre + "removeLabels").click(function(e) {
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_labelscale01: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale01").click(function(e) {
           me.icn3d.labelScale = 0.1;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.1', true);
        });
    },

    clkMn6_labelscale02: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale02").click(function(e) {
           me.icn3d.labelScale = 0.2;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.2', true);
        });
    },

    clkMn6_labelscale03: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale03").click(function(e) {
           me.icn3d.labelScale = 0.3;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.3', true);
        });
    },

    clkMn6_labelscale04: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale04").click(function(e) {
           me.icn3d.labelScale = 0.4;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.4', true);
        });
    },

    clkMn6_labelscale05: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale05").click(function(e) {
           me.icn3d.labelScale = 0.5;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.5', true);
        });
    },

    clkMn6_labelscale06: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale06").click(function(e) {
           me.icn3d.labelScale = 0.6;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.6', true);
        });
    },

    clkMn6_labelscale07: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale07").click(function(e) {
           me.icn3d.labelScale = 0.7;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.7', true);
        });
    },

    clkMn6_labelscale08: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale08").click(function(e) {
           me.icn3d.labelScale = 0.8;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.8', true);
        });
    },

    clkMn6_labelscale09: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale09").click(function(e) {
           me.icn3d.labelScale = 0.9;
           me.icn3d.draw();
           me.setLogCmd('set label scale 0.9', true);
        });
    },

    clkMn6_labelscale10: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale10").click(function(e) {
           me.icn3d.labelScale = 1.0;
           me.icn3d.draw();
           me.setLogCmd('set label scale 1.0', true);
        });
    },

    clkMn6_labelscale20: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale20").click(function(e) {
           me.icn3d.labelScale = 2.0;
           me.icn3d.draw();
           me.setLogCmd('set label scale 2.0', true);
        });
    },

    clkMn6_labelscale40: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_labelscale40").click(function(e) {
           me.icn3d.labelScale = 4.0;
           me.icn3d.draw();
           me.setLogCmd('set label scale 4.0', true);
        });
    },

    clkMn6_distanceYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_distanceYes").click(function(e) {
           me.openDialog(me.pre + 'dl_distance', 'Measure the distance of atoms');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;

           me.bMeasureDistance = true;

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_distanceNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_distanceNo").click(function(e) {
           me.icn3d.pickpair = false;

           var select = "set lines off";
           me.setLogCmd(select, true);

           me.icn3d.labels['distance'] = [];
           me.icn3d.lines['distance'] = [];

           me.icn3d.pk = 2;

           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn2_selectedcenter: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn2_selectedcenter").add("#" + me.pre + "zoomin_selection").click(function(e) {
           //me.setLogCmd('zoom selection', true);

           me.icn3d.zoominSelection();
           me.icn3d.draw();
           me.setLogCmd('zoom selection', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_center: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_center").click(function(e) {
           //me.setLogCmd('center selection', true);

           me.icn3d.centerSelection();
           me.icn3d.draw();
           me.setLogCmd('center selection', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_resetOrientation: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_resetOrientation").add("#" + me.pre + "resetOrientation").click(function(e) {
           //me.setLogCmd('reset orientation', true);

           me.icn3d.resetOrientation();

           //me.icn3d.applyOriginalColor();

           me.icn3d.draw();
           me.setLogCmd('reset orientation', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_chemicalbindingshow: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_chemicalbindingshow").add("#" + me.pre + "chemicalbindingshow").click(function(e) {
           me.setOption('chemicalbinding', 'show');
           me.setLogCmd('set chemicalbinding show', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_chemicalbindinghide: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_chemicalbindinghide").add("#" + me.pre + "chemicalbindinghide").click(function(e) {
           me.setOption('chemicalbinding', 'hide');
           me.setLogCmd('set chemicalbinding hide', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_rotateleft: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotateleft").click(function(e) {
           me.setLogCmd('rotate left', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'left';

           me.rotStruc('left');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_sidebyside: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_sidebyside").click(function(e) {
           var bSidebyside = true;
           var url = me.shareLinkUrl(undefined);

           if(url.indexOf('http') !== 0) {
               alert("The url is more than 4000 characters and may not work.");
           }
           else {
               url = url.replace("full.html", "full2.html");
               window.open(url, '_blank');

               me.setLogCmd('side by side | ' + url, true);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_rotateright: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotateright").click(function(e) {
           me.setLogCmd('rotate right', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'right';

           me.rotStruc('right');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_rotateup: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotateup").click(function(e) {
           me.setLogCmd('rotate up', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'up';

           me.rotStruc('up');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_rotatedown: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotatedown").click(function(e) {
           me.setLogCmd('rotate down', true);

           me.icn3d.bStopRotate = false;
           me.icn3d.rotateCount = 0;
           me.icn3d.rotateCountMax = 6000;
           me.ROT_DIR = 'down';

           me.rotStruc('down');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_rotatex: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotatex").click(function(e) {
          me.setLogCmd('rotate x', true);

          var axis = new THREE.Vector3(1,0,0);
          var angle = 0.5 * Math.PI;

          me.icn3d.setRotation(axis, angle);
        });
    },

    clkMn6_rotatey: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotatey").click(function(e) {
          me.setLogCmd('rotate y', true);

          var axis = new THREE.Vector3(0,1,0);
          var angle = 0.5 * Math.PI;

          me.icn3d.setRotation(axis, angle);
        });
    },

    clkMn6_rotatez: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_rotatez").click(function(e) {
          me.setLogCmd('rotate z', true);

          var axis = new THREE.Vector3(0,0,1);
          var angle = 0.5 * Math.PI;

          me.icn3d.setRotation(axis, angle);
        });
    },

    clkMn6_cameraPers: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_cameraPers").click(function(e) {
           me.setOption('camera', 'perspective');
           me.setLogCmd('set camera perspective', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_cameraOrth: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_cameraOrth").click(function(e) {
           me.setOption('camera', 'orthographic');
           me.setLogCmd('set camera orthographic', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_bkgdBlack: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_bkgdBlack").click(function(e) {
           me.setOption('background', 'black');
           me.setLogCmd('set background black', true);

           $("#" + me.pre + "title").css("color", me.GREYD);
           $("#" + me.pre + "titlelink").css("color", me.GREYD);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_bkgdGrey: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_bkgdGrey").click(function(e) {
           me.setOption('background', 'grey');
           me.setLogCmd('set background grey', true);

           $("#" + me.pre + "title").css("color", "black");
           $("#" + me.pre + "titlelink").css("color", "black");

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_bkgdWhite: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_bkgdWhite").click(function(e) {
           me.setOption('background', 'white');
           me.setLogCmd('set background white', true);

           $("#" + me.pre + "title").css("color", "black");
           $("#" + me.pre + "titlelink").css("color", "black");

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_bkgdTransparent: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_bkgdTransparent").click(function(e) {
           me.setOption('background', 'transparent');
           me.setLogCmd('set background transparent', true);

           $("#" + me.pre + "title").css("color", me.GREYD);
           $("#" + me.pre + "titlelink").css("color", me.GREYD);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showfogYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showfogYes").click(function(e) {
           //me.setOption('fog', 'yes');
           me.icn3d.opts['fog'] = 'yes';
           me.icn3d.setFog(true);
           me.icn3d.draw();
           me.setLogCmd('set fog on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showfogNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showfogNo").click(function(e) {
           //me.setOption('fog', 'no');
           me.icn3d.opts['fog'] = 'no';
           me.icn3d.setFog(true);
           me.icn3d.draw();
           me.setLogCmd('set fog off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showslabYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showslabYes").click(function(e) {
           me.setOption('slab', 'yes');
           me.setLogCmd('set slab on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showslabNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showslabNo").click(function(e) {
           me.setOption('slab', 'no');
           me.setLogCmd('set slab off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showaxisYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showaxisYes").click(function(e) {
           me.setOption('axis', 'yes');
           me.setLogCmd('set axis on', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_showaxisNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_showaxisNo").click(function(e) {
           me.setOption('axis', 'no');
           me.setLogCmd('set axis off', true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_symmetry: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_symmetry").click(function(e) {
           me.retrieveSymmetry(Object.keys(me.icn3d.structures)[0]);

           //me.openDialog(me.pre + 'dl_symmetry', 'Symmetry');
        });
    },

    clkMn6_area: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_area").click(function(e) {
            me.calculateArea();
            me.setLogCmd('area', true);
        });
    },

    calculateArea: function() { var me = this; //"use strict";
       me.icn3d.bCalcArea = true;

       me.icn3d.opts.surface = 'solvent accessible surface';

       me.icn3d.applySurfaceOptions();

       $("#" + me.pre + "areavalue").val(me.icn3d.areavalue);
       $("#" + me.pre + "areatable").html(me.icn3d.areahtml);

       me.openDialog(me.pre + 'dl_area', 'Surface area calculation');

       me.icn3d.bCalcArea = false;
    },

    clkMn6_applysymmetry: function() { var me = this; //"use strict";
        $("#" + me.pre + "applysymmetry").click(function(e) {
           var title = $("#" + me.pre + "selectSymmetry" ).val();
           me.icn3d.symmetrytitle = (title === 'none') ? undefined : title;

           //if(title !== 'none') me.icn3d.applySymmetry(title);

           me.icn3d.draw();

           me.setLogCmd('symmetry ' + title, true);
        });

        $("#" + me.pre + "clearsymmetry").click(function(e) {
           var title = 'none';
           me.icn3d.symmetrytitle = undefined;

           me.icn3d.draw();

           me.setLogCmd('symmetry ' + title, true);
        });
    },

    clkMn6_hbondsYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_hbondsYes").add("#" + me.pre + "hbondsYes").click(function(e) {
            if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
               var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

               me.setPredefinedInMenu();
               me.bSetChainsAdvancedMenu = true;

               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
            }

            var definedAtomsHtml = me.setAtomMenu(['protein']);

            if($("#" + me.pre + "atomsCustomHbond").length) {
                $("#" + me.pre + "atomsCustomHbond").html("  <option value='non-selected' selected>non-selected</option><option value='selected'>selected</option>" + definedAtomsHtml);
            }
            if($("#" + me.pre + "atomsCustomHbond2").length) {
                $("#" + me.pre + "atomsCustomHbond2").html("  <option value='selected' selected>selected</option>" + definedAtomsHtml);
            }

           me.openDialog(me.pre + 'dl_hbonds', 'Hydrogen bonds/contacts between two sets of atoms');
           me.bHbondCalc = false;
           //me.setLogCmd('set calculate hbond false', true);

           $("#" + me.pre + "atomsCustomHbond").resizable();
           $("#" + me.pre + "atomsCustomHbond2").resizable();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_hbondsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_hbondsNo").click(function(e) {
           me.hideHbondsContacts();

           me.icn3d.draw();
        });
    },

    hideHbondsContacts: function() { var me = this; //"use strict";
           var select = "set hbonds off";
           me.setLogCmd(select, true);

           me.icn3d.hideHbonds();
           //me.icn3d.draw();

           select = "set salt bridge off";
           me.setLogCmd(select, true);

           me.icn3d.hideSaltbridge();

           select = "set contact off";
           me.setLogCmd(select, true);

           me.icn3d.hideContact();

           select = "set halogen pi off";
           me.setLogCmd(select, true);

           me.icn3d.hideHalogenPi();

    },

    clkmn1_stabilizerYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_stabilizerYes").click(function(e) {
           //me.openDialog(me.pre + 'dl_stabilizer', 'Hydrogen bonds inside selection');

           var select = "stabilizer";

           me.addStabilizer();
           me.prepareFor3Dprint();
           //me.icn3d.draw();

           me.setLogCmd(select, true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn1_stabilizerNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_stabilizerNo").click(function(e) {
           var select = "set stabilizer off";
           me.setLogCmd(select, true);

           me.hideStabilizer();

           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn1_stabilizerOne: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_stabilizerOne").click(function(e) {
           me.openDialog(me.pre + 'dl_stabilizer', 'Add One Stabilizer');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn1_stabilizerRmOne: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_stabilizerRmOne").click(function(e) {
           me.openDialog(me.pre + 'dl_stabilizer_rm', 'Remove One Stabilizer');
           me.icn3d.pk = 1;
           me.icn3d.opts['pk'] = 'atom';
           me.icn3d.pickpair = true;
           me.icn3d.pAtomNum = 0;

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn1_thicknessSet: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_thicknessSet").click(function(e) {
           me.openDialog(me.pre + 'dl_thickness', 'Set Thickness for 3D Printing');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn5_setThickness: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn3_setThickness").click(function(e) {
           me.openDialog(me.pre + 'dl_thickness2', 'Set Thickness');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkmn1_thicknessReset: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn1_thicknessReset").click(function(e) {
           var select = "reset thickness";
           me.setLogCmd(select, true);

           me.bSetThickness = false;

           me.resetAfter3Dprint();
           me.icn3d.draw();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_ssbondsYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_ssbondsYes").click(function(e) {
           var select = "disulfide bonds";
           me.setLogCmd(select, true);

           me.showSsbonds();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_ssbondsExport: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_ssbondsExport").click(function(e) {
           me.exportSsbondPairs();

           me.setLogCmd("export disulfide bond pairs", false);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_ssbondsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_ssbondsNo").click(function(e) {
           me.icn3d.opts["ssbonds"] = "no";

           var select = "set disulfide bonds off";
           me.setLogCmd(select, true);

           me.icn3d.lines['ssbond'] = [];

           me.setStyle('sidec', 'nothing');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_clbondsYes: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_clbondsYes").click(function(e) {
           var select = "cross linkage";
           me.setLogCmd(select, true);

           //me.icn3d.bShowCrossResidueBond = true;
           //me.setStyle('proteins', 'lines')

           me.showClbonds(true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_clbondsExport: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_clbondsExport").click(function(e) {
           me.exportClbondPairs();

           me.setLogCmd("export cross linkage pairs", false);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clkMn6_clbondsNo: function() { var me = this; //"use strict";
        $("#" + me.pre + "mn6_clbondsNo").click(function(e) {
           me.icn3d.opts["clbonds"] = "no";

           var select = "set cross linkage off";
           me.setLogCmd(select, true);

           //me.icn3d.bShowCrossResidueBond = false;
           //me.setStyle('proteins', 'ribbon')

           me.icn3d.lines['clbond'] = [];

           me.setStyle('sidec', 'nothing');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // other
    clickViewswitch: function() { var me = this; //"use strict";
/*
        $("#" + me.pre + "viewswitch").click(function(e) {
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
        $("#" + me.pre + "anno_summary").click(function(e) {
            e.preventDefault();

            me.setAnnoViewAndDisplay('overview');
            me.setLogCmd("set view overview", true);
        });

        $("#" + me.pre + "anno_details").click(function(e) {
            e.preventDefault();

            me.setAnnoViewAndDisplay('detailed view');
            me.setLogCmd("set view detailed view", true);
        });
    },

    clickShow_annotations: function() { var me = this; //"use strict";
        $("#" + me.pre + "show_annotations").click(function(e) {
             me.showAnnotations();
             me.setLogCmd("view annotations", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickShowallchains: function() { var me = this; //"use strict";
        $("#" + me.pre + "showallchains").click(function(e) {
           me.showAnnoAllChains();
           me.setLogCmd("show annotations all chains", true);

           ////$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickShow_alignsequences: function() { var me = this; //"use strict";
        $("#" + me.pre + "show_alignsequences").click(function(e) {
             me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickShow_2ddgm: function() { var me = this; //"use strict";
        $("#" + me.pre + "show_2ddgm").add("#" + me.pre + "mn2_2ddgm").click(function(e) {
             me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
             me.retrieveInteractionData();

             me.setLogCmd("view interactions", true);
             //me.setLogCmd("window interactions", true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    retrieveInteractionData: function() { var me = this; //"use strict";
         if(!me.b2DShown) {
             if(me.cfg.align !== undefined) {
                 var structureArray = Object.keys(me.icn3d.structures);
                 me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
             }
             else if(me.cfg.chainalign !== undefined) {
                 var structureArray = Object.keys(me.icn3d.structures);
                 if(structureArray.length == 2) {
                    me.set2DDiagramsForAlign(structureArray[1].toUpperCase(), structureArray[0].toUpperCase());
                 }
                 else if(structureArray.length == 1) {
                    me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[0].toUpperCase());
                 }
             }
             else {
                 me.download2Ddgm(me.inputid.toUpperCase());
             }
         }
    },

    clickSearchSeq: function() { var me = this; //"use strict";
        $(document).on("click", "#" + me.pre + "search_seq_button", function(e) {
           e.stopImmediatePropagation();

           var select = $("#" + me.pre + "search_seq").val();
           if(isNaN(select) && select.indexOf('$') == -1 && select.indexOf('.') == -1 && select.indexOf(':') == -1 && select.indexOf('@') == -1) {
               select = ':' + select;
           }

           var commandname = select.replace(/\s+/g, '_');
           //var commanddesc = "search with the one-letter sequence " + select;
           var commanddesc = commandname;

           me.selectByCommand(select, commandname, commanddesc);
           //me.setLogCmd('select ' + select + ' | name ' + commandname + ' | description ' + commanddesc, true);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);

           ////$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_mmtf: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_mmtf").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmtf " + $("#" + me.pre + "mmtfid").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?mmtfid=' + $("#" + me.pre + "mmtfid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_pdb: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_pdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load pdb " + $("#" + me.pre + "pdbid").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?pdbid=' + $("#" + me.pre + "pdbid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_opm: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_opm").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load opm " + $("#" + me.pre + "opmid").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?opmid=' + $("#" + me.pre + "opmid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_align_refined: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_align_refined").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCmd("load alignment " + alignment + ' | parameters &atype=1', false);

           window.open(me.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=1', '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_align_ori: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_align_ori").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "alignid1").val() + "," + $("#" + me.pre + "alignid2").val();

           me.setLogCmd("load alignment " + alignment + ' | parameters &atype=0', false);

           window.open( me.baseUrl + 'icn3d/full.html?align=' + alignment + '&showalignseq=1&atype=0', '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_chainalign: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_chainalign").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           var alignment = $("#" + me.pre + "chainalignid1").val() + "," + $("#" + me.pre + "chainalignid2").val();

           me.setLogCmd("load chain alignment " + alignment, false);

           window.open(me.baseUrl + 'icn3d/full.html?chainalign=' + alignment + '&showalignseq=1', '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_mmcif: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_mmcif").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmcif " + $("#" + me.pre + "mmcifid").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?mmcifid=' + $("#" + me.pre + "mmcifid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_mmdb: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_mmdb").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load mmdb " + $("#" + me.pre + "mmdbid").val(), false);

           //me.downloadMmdb($("#" + me.pre + "mmdbid").val());
           window.open(me.baseUrl + 'icn3d/full.html?mmdbid=' + $("#" + me.pre + "mmdbid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_blast_rep_id: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_blast_rep_id").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           //var query_id = $("#" + me.pre + "query_id").val().toUpperCase();
           var query_id = $("#" + me.pre + "query_id").val();
           var query_fasta = encodeURIComponent($("#" + me.pre + "query_fasta").val());
           //var blast_rep_id = $("#" + me.pre + "blast_rep_id").val().toUpperCase();
           var blast_rep_id = $("#" + me.pre + "blast_rep_id").val();

           me.setLogCmd("load seq_struc_ids " + query_id + "," + blast_rep_id, false);

           query_id = (query_id !== '' && query_id !== undefined) ? query_id : query_fasta;

//           if(query_id !== '' && query_id !== undefined) {
               window.open(me.baseUrl + 'icn3d/full.html?from=icn3d&blast_rep_id=' + blast_rep_id
                 + '&command=view annotations; set annotation cdd; set annotation site; set view detailed view; select chain '
                 + blast_rep_id + '; show selection'
                 + '&query_id=' + query_id, '_blank');
/*
           }
           else if(query_fasta !== '' && query_fasta !== undefined) {
               var form = document.createElement("form");
               form.setAttribute("method", "post");
               form.setAttribute("action", "https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html");

               form.setAttribute("target", "_blank");

               var hiddenField = document.createElement("input");
               hiddenField.setAttribute('command', 'view+annotations;+set+annotation+cdd;+set+view+detailed+view;+select+chain+' + blast_rep_id + ';+show+selection');
               hiddenField.setAttribute('query_id', query_fasta);
               hiddenField.setAttribute('blast_rep_id', blast_rep_id);
               form.appendChild(hiddenField);
               document.body.appendChild(form);

               var newWin = window.open('', '_blank');

               if (newWin) {
                   form.submit();
               } else {
                   alert('You must allow popups for this to work.');
               }
           }
*/

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_gi: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_gi").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load gi " + $("#" + me.pre + "gi").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?gi=' + $("#" + me.pre + "gi").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_cid: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_cid").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.setLogCmd("load cid " + $("#" + me.pre + "cid").val(), false);

           window.open(me.baseUrl + 'icn3d/full.html?cid=' + $("#" + me.pre + "cid").val(), '_blank');

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_pngimage: function() { var me = this; //"use strict";
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

               var matchedStrState = "Start of state file======\n";
               var posState = imageStr.indexOf(matchedStrState);

               if(pos == -1 && posState == -1) {
                   alert('Please load a PNG image saved by clicking "Save Datas > PNG Image" in the Data menu...');
               }
               else if(pos != -1) {
                   var url = imageStr.substr(pos + matchedStr.length);

                   me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);

                   window.open(url);
               }
               else if(posState != -1) {
                   var matchedStrData = "Start of data file======\n";
                   var posData = imageStr.indexOf(matchedStrData);

                   me.bInputfile = (posData == -1) ? false : true;

                   if(me.bInputfile) {
                       var posDataEnd = imageStr.indexOf("End of data file======\n");
                       var data = imageStr.substr(posData + matchedStrData.length, posDataEnd - posData - matchedStrData.length);

                       var matchedStrType = "Start of type file======\n";
                       var posType = imageStr.indexOf(matchedStrType);

                       var posTypeEnd = imageStr.indexOf("End of type file======\n");
                       var type = imageStr.substr(posType + matchedStrType.length, posTypeEnd - posType - matchedStrType.length - 1); // remove the new line char

                       //var matchedStrState = "Start of state file======\n";
                       //var posState = imageStr.indexOf(matchedStrState);

                       var posStateEnd = imageStr.indexOf("End of state file======\n");
                       var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);

                       statefile = decodeURIComponent(statefile);

                        if(type === 'pdb') {
                            $.when( me.loadPdbData(data))
                             .then(function() {
                                 me.icn3d.commands = [];
                                 me.icn3d.optsHistory = [];

                                 me.loadScript(statefile, true);
                             });
                        }
                        else {
                            if(type === 'mol2') {
                                me.loadMol2Data(data);
                            }
                            else if(type === 'sdf') {
                                me.loadSdfData(data);
                            }
                            else if(type === 'xyz') {
                                me.loadXyzData(data);
                            }
                            else if(type === 'mmcif') {
                                me.loadMmcifData(data);
                            }

                           me.icn3d.commands = [];
                           me.icn3d.optsHistory = [];

                           me.loadScript(statefile, true);
                       }
                   }
                   else { // url length > 4000
                       //var matchedStrState = "Start of state file======\n";
                       //var posState = imageStr.indexOf(matchedStrState);

                       var posStateEnd = imageStr.indexOf("End of state file======\n");
                       var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);

                       statefile = decodeURIComponent(statefile);

                       me.icn3d.commands = [];
                       me.icn3d.optsHistory = [];

                       me.loadScript(statefile, true);
                   }

                   me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
               }
             };

             reader.readAsText(file);
           }


           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_state: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_state").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           // initialize icn3dui
           //Do NOT clear data if iCn3D loads a pdb or other data file and then load a state file
           if(!me.bInputfile) {
               me.init();
               me.icn3d.init();
           }

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


           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_selectionfile: function() { var me = this; //"use strict";
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


           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    loadDsn6File: function(type) { var me = this; //"use strict";
       var file = $("#" + me.pre + "dsn6file" + type)[0].files[0];
       var sigma = $("#" + me.pre + "dsn6sigma" + type).val();

       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }

         var reader = new FileReader();
         reader.onload = function (e) {
           var arrayBuffer = e.target.result; // or = reader.result;

           me.loadDsn6Data(arrayBuffer, type, sigma);

           if(type == '2fofc') {
               me.bAjax2fofc = true;
           }
           else if(type == 'fofc') {
               me.bAjaxfofc = true;
           }

           me.setOption('map', type);

           me.setLogCmd('load dsn6 file ' + $("#" + me.pre + "dsn6file" + type).val(), false);
         };

         reader.readAsArrayBuffer(file);
       }
    },

    loadDsn6FileUrl: function(type) { var me = this; //"use strict";
       var url = $("#" + me.pre + "dsn6fileurl" + type).val();
       var sigma = $("#" + me.pre + "dsn6sigmaurl" + type).val();

       me.Dsn6ParserBase(url, type, sigma);

       me.setLogCmd('set map ' + type + ' sigma ' + sigma + ' | ' + encodeURIComponent(url), true);

/*
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }

         var reader = new FileReader();
         reader.onload = function (e) {
           var arrayBuffer = e.target.result; // or = reader.result;

           me.loadDsn6Data(arrayBuffer, type, sigma);

           if(type == '2fofc') {
               me.bAjax2fofc = true;
           }
           else if(type == 'fofc') {
               me.bAjaxfofc = true;
           }

           me.setOption('map', type);

           me.setLogCmd('load dsn6 file ' + $("#" + me.pre + "dsn6file" + type).val(), false);
         };

         reader.readAsArrayBuffer(file);
       }
*/

    },

    clickReload_dsn6file: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_dsn6file2fofc").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.loadDsn6File('2fofc');
        });

        $("#" + me.pre + "reload_dsn6filefofc").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.loadDsn6File('fofc');
        });

        $("#" + me.pre + "reload_dsn6fileurl2fofc").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.loadDsn6FileUrl('2fofc');
        });

        $("#" + me.pre + "reload_dsn6fileurlfofc").click(function(e) {
           e.preventDefault();

           dialog.dialog( "close" );

           me.loadDsn6FileUrl('fofc');
        });
    },

    clickReload_pdbfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_pdbfile").click(function(e) {
           e.preventDefault();

           me = me.setIcn3dui(this.id);

           me.icn3d.bInitial = true;

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

               me.bInputfile = true;
               me.InputfileData = dataStr;
               me.InputfileType = 'pdb';

               me.loadPdbData(dataStr);
             };

             reader.readAsText(file);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_mol2file: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_mol2file").click(function(e) {
           e.preventDefault();

           me.icn3d.bInitial = true;

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

               me.bInputfile = true;
               me.InputfileData = dataStr;
               me.InputfileType = 'mol2';

               me.loadMol2Data(dataStr);
             };

             reader.readAsText(file);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_sdffile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_sdffile").click(function(e) {
           e.preventDefault();

           me.icn3d.bInitial = true;

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

               me.bInputfile = true;
               me.InputfileData = dataStr;
               me.InputfileType = 'sdf';

               me.loadSdfData(dataStr);
             };

             reader.readAsText(file);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_xyzfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_xyzfile").click(function(e) {
           e.preventDefault();

           me.icn3d.bInitial = true;

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

               me.bInputfile = true;
               me.InputfileData = dataStr;
               me.InputfileType = 'xyz';

               me.loadXyzData(dataStr);
             };

             reader.readAsText(file);
           }

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_urlfile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_urlfile").click(function(e) {
           e.preventDefault();

           me.icn3d.bInitial = true;

           dialog.dialog( "close" );
           //close all dialog
           $(".ui-dialog-content").dialog("close");

           var type = $("#" + me.pre + "filetype").val();
           var url = $("#" + me.pre + "urlfile").val();

           me.init();
           me.icn3d.init();

           me.bInputfile = true;

           me.downloadUrl(url, type);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReload_mmciffile: function() { var me = this; //"use strict";
        $("#" + me.pre + "reload_mmciffile").click(function(e) {
           e.preventDefault();

           me.icn3d.bInitial = true;

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

                var url = me.baseUrl + "mmcifparser/mmcifparser.cgi";

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
                      me.showLoading();
                  },
                  complete: function() {
                      //me.hideLoading();
                  },
                  success: function(data) {
                      me.init();
                      me.icn3d.init();

                      me.bInputfile = true;
                      me.InputfileData = data;
                      me.InputfileType = 'mmcif';

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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplycustomcolor: function() { var me = this; //"use strict";
        $("#" + me.pre + "applycustomcolor").click(function(e) {
           e.preventDefault();
           dialog.dialog( "close" );

           me.setOption("color", $("#" + me.pre + "colorcustom").val());
           me.setLogCmd("color " + $("#" + me.pre + "colorcustom").val(), true);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplypick_aroundsphere: function() { var me = this; //"use strict";
        $("#" + me.pre + "atomsCustomSphere2").add("#" + me.pre + "atomsCustomSphere").add("#" + me.pre + "radius_aroundsphere").change(function(e) {
            me.bSphereCalc = false;
            //me.setLogCmd('set calculate sphere false', true);
        });

        $("#" + me.pre + "applypick_aroundsphere").click(function(e) {
            //e.preventDefault();
            //dialog.dialog( "close" );

            var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();

            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + me.bSphereCalc;

                if(!me.bSphereCalc) me.pickCustomSphere(radius, nameArray2, nameArray, me.bSphereCalc);
                me.bSphereCalc = true;
                //me.setLogCmd('set calculate sphere true', true);

                me.updateHlAll();

                me.setLogCmd(select, true);
            }
        });

        $("#" + me.pre + "sphereExport").click(function(e) {
            e.preventDefault();
            //dialog.dialog( "close" );

            var radius = parseFloat($("#" + me.pre + "radius_aroundsphere").val());
            var nameArray = $("#" + me.pre + "atomsCustomSphere").val();
            var nameArray2 = $("#" + me.pre + "atomsCustomSphere2").val();

            if(nameArray2.length == 0) {
                alert("Please select the first set at step #1");
            }
            else {
                me.pickCustomSphere(radius, nameArray2, nameArray, me.bSphereCalc);
                me.bSphereCalc = true;
                //me.setLogCmd('set calculate sphere true', true);

                me.setLogCmd("export pairs in the sphere", false);

                var text = me.exportSpherePairs();

                var file_pref = (me.inputid) ? me.inputid : "custom";
                me.saveFile(file_pref + '_sphere_pairs.html', 'html', text);
            }
        });
    },

    clickApply_adjustmem: function() { var me = this; //"use strict";
        $("#" + me.pre + "apply_adjustmem").click(function(e) {
            //e.preventDefault();
            dialog.dialog( "close" );

            var extra_mem_z = parseFloat($("#" + me.pre + "extra_mem_z").val());
            var intra_mem_z = parseFloat($("#" + me.pre + "intra_mem_z").val());

            me.adjustMembrane(extra_mem_z, intra_mem_z);

            var select = "adjust membrane z-axis " + extra_mem_z + " " + intra_mem_z;

            me.setLogCmd(select, true);
        });
    },

    adjustMembrane: function(extra_mem_z, intra_mem_z) { var me = this; //"use strict";
        for(var i in me.icn3d.chains[me.inputid.toUpperCase() + '_MEM']) {
            var atom = me.icn3d.atoms[i];

            if(atom.name == 'O') {
                atom.coord.z = extra_mem_z;
            }
            else if(atom.name == 'N') {
                atom.coord.z = intra_mem_z;
            }
        }

        // reset transmembrane set
        var bReset = true;
        me.setTransmemInMenu(extra_mem_z, intra_mem_z, bReset);

        me.updateHlMenus();

        me.icn3d.draw();
    },

    clickApply_selectplane: function() { var me = this; //"use strict";
        $("#" + me.pre + "apply_selectplane").click(function(e) {
            //e.preventDefault();
            dialog.dialog( "close" );

            var large = parseFloat($("#" + me.pre + "selectplane_z1").val());
            var small = parseFloat($("#" + me.pre + "selectplane_z2").val());

            me.selectBtwPlanes(large, small);

            var select = "select planes z-axis " + large + " " + small;

            me.setLogCmd(select, true);
        });
    },

    selectBtwPlanes: function(large, small) { var me = this; //"use strict";
        if(large < small) {
            var tmp = small;
            small = large;
            large = tmp;
        }

        var residueHash = {};
        for(var i in me.icn3d.atoms) {
            var atom = me.icn3d.atoms[i];
            if(atom.resn == 'DUM') continue;

            if(atom.coord.z >= small && atom.coord.z <= large) {
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residueHash[resid] = 1;
            }
        }

        var commandname = "z_planes_" + large + "_" + small;
        var commanddescr = commandname;
        me.selectResidueList(residueHash, commandname, commanddescr, false);
    },
/*
    displayInteraction3d: function(nameArray2, nameArray, bHbondCalc, interactionTypes) { var me = this; //"use strict";
       me.icn3d.bRender = false;
       var hAtoms = {};
       var prevHatoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

       for(var i = 0, il = interactionTypes.length; i < il; ++i) {
           var type = interactionTypes[i];

           var threshold = parseFloat(type.substr(type.lastIndexOf(' ') + 1));

           if(type.indexOf('hbonds') !== -1) {
               if(!bHbondCalc) {
                   me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
                   me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc);
               }

               hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);
           }

           if(type.indexOf('salt bridge') !== -1) {
               if(!bHbondCalc) {
                   me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
                   me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true);
               }

               hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);
           }

           if(type.indexOf('interactions') !== -1) {
               if(!bHbondCalc) {
                   me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
                   me.pickCustomSphere(threshold, nameArray2, nameArray, me.bSphereCalc, true);
               }

               hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);
           }
       }

       me.icn3d.hAtoms = me.icn3d.cloneHash(hAtoms);

       me.icn3d.bRender = false;
       me.icn3d.draw();

       me.bHbondCalc = true;
    },
*/
    calcBuriedSurface: function(nameArray2, nameArray) { var me = this; //"use strict";
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

           var atomSet2 = me.getAtomsFromNameArray(nameArray2);
           var atomSet1 = me.getAtomsFromNameArray(nameArray);

           me.icn3d.bCalcArea = true;
           me.icn3d.opts.surface = 'solvent accessible surface';

           me.icn3d.hAtoms = me.icn3d.cloneHash(atomSet2);
           me.icn3d.applySurfaceOptions();
           var area2 = me.icn3d.areavalue;

           me.icn3d.hAtoms = me.icn3d.cloneHash(atomSet1);
           me.icn3d.applySurfaceOptions();
           var area1 = me.icn3d.areavalue;

           me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, atomSet2);
           me.icn3d.applySurfaceOptions();
           var areaTotal = me.icn3d.areavalue;

           me.icn3d.bCalcArea = false;
           me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);

           var buriedArea = (parseFloat(area1) + parseFloat(area2) - parseFloat(areaTotal)).toFixed(2);

           var html = '<br>Calculate solvent accessible surface area in the interface:<br><br>';

           html += 'Set 1: ' + nameArray2 + ', Surface: ' +  area2 + ' &#8491;<sup>2</sup><br>';
           html += 'Set 2: ' + nameArray + ', Surface: ' +  area1 + ' &#8491;<sup>2</sup><br>';
           html += 'Total Surface: ' +  areaTotal + ' &#8491;<sup>2</sup><br>';
           html += '<b>Buried Surface</b>: ' +  buriedArea + ' &#8491;<sup>2</sup><br><br>';

           $("#" + me.pre + "dl_buriedarea").html(html);
           me.openDialog(me.pre + 'dl_buriedarea', 'Buried solvent accessible surface area in the interface');

           me.setLogCmd('buried surface ' + buriedArea, false);
       }
    },

    showInteractions: function(type) { var me = this; //"use strict";
       var nameArray = $("#" + me.pre + "atomsCustomHbond").val();
       var nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();

       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           me.setMode('selection');

           var bHbond = $("#" + me.pre + "analysis_hbond")[0].checked;
           var bSaltbridge = $("#" + me.pre + "analysis_saltbridge")[0].checked;
           var bInteraction = $("#" + me.pre + "analysis_contact")[0].checked;
           var bHalogen = $("#" + me.pre + "analysis_halogen")[0].checked;
           var bPication = $("#" + me.pre + "analysis_pication")[0].checked;
           var bPistacking = $("#" + me.pre + "analysis_pistacking")[0].checked;

           var thresholdHbond = $("#" + me.pre + "hbondthreshold").val();
           var thresholdSaltbridge = $("#" + me.pre + "saltbridgethreshold").val();
           var thresholdContact = $("#" + me.pre + "contactthreshold").val();
           var thresholdHalogen = $("#" + me.pre + "halogenthreshold").val();
           var thresholdPication = $("#" + me.pre + "picationthreshold").val();
           var thresholdPistacking = $("#" + me.pre + "pistackingthreshold").val();
           var thresholdStr = 'threshold ' + thresholdHbond + ' ' + thresholdSaltbridge + ' ' + thresholdContact
            + ' ' + thresholdHalogen + ' ' + thresholdPication + ' ' + thresholdPistacking;

           var interactionTypes = me.viewInteractionPairs(nameArray2, nameArray, me.bHbondCalc, type,
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);

           if(type == '3d') {
               me.setLogCmd("display interaction 3d | " + nameArray2 + " " + nameArray + " | " + interactionTypes + " | false | " + thresholdStr, true);
           }
           else if(type == 'view') {
               me.setLogCmd("view interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes + " | false | " + thresholdStr, true);
           }
           else if(type == 'save1') {
               me.setLogCmd("save1 interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes + " | false | " + thresholdStr, true);
           }
           else if(type == 'save2') {
               me.setLogCmd("save2 interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes + " | false | " + thresholdStr, true);
           }
           else if(type == 'linegraph') {
               me.setLogCmd("line graph interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes + " | false | " + thresholdStr, true);
           }
           else if(type == 'graph') { // force-directed graph
                var dist_ss = parseInt($("#" + me.pre + "dist_ss").val());
                var dist_coil = parseInt($("#" + me.pre + "dist_coil").val());
                var dist_hbond = parseInt($("#" + me.pre + "dist_hbond").val());
                var dist_inter = parseInt($("#" + me.pre + "dist_inter").val());
                var dist_ssbond = parseInt($("#" + me.pre + "dist_ssbond").val());
                var dist_ionic = parseInt($("#" + me.pre + "dist_ionic").val());

                var dist_halogen = parseInt($("#" + me.pre + "dist_halogen").val());
                var dist_pication = parseInt($("#" + me.pre + "dist_pication").val());
                var dist_pistacking = parseInt($("#" + me.pre + "dist_pistacking").val());

                me.setLogCmd("graph interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes
                    + " | false | " + thresholdStr + " | " + dist_ss + " " + dist_coil
                    + " " + dist_hbond + " " + dist_inter + " " + dist_ssbond + " " + dist_ionic
                    + " " + dist_halogen + " " + dist_pication + " " + dist_pistacking, true);
           }
       }
    },

    clickApplyhbonds: function() { var me = this; //"use strict";
        $("#" + me.pre + "atomsCustomHbond2").add("#" + me.pre + "atomsCustomHbond").add("#" + me.pre + "analysis_hbond").add("#" + me.pre + "analysis_saltbridge").add("#" + me.pre + "analysis_contact").add("#" + me.pre + "hbondthreshold").add("#" + me.pre + "saltbridgethreshold").add("#" + me.pre + "contactthreshold").change(function(e) {
            me.bHbondCalc = false;
            //me.setLogCmd('set calculate hbond false', true);
        });

        $("#" + me.pre + "applyhbonds").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('3d');
        });

        $("#" + me.pre + "hbondWindow").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('view');
        });

        $("#" + me.pre + "areaWindow").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var nameArray = $("#" + me.pre + "atomsCustomHbond").val();
           var nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();

           me.calcBuriedSurface(nameArray2, nameArray);

           me.setLogCmd("calc buried surface | " + nameArray2 + " " + nameArray, true);
        });

        $("#" + me.pre + "sortSet1").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('save1');
        });

        $(document).on("click", "." + me.pre + "showintercntonly", function(e) {
            e.stopImmediatePropagation();

            $(".icn3d-border").hide();
            me.setLogCmd("table inter count only", true);
        });

        $(document).on("click", "." + me.pre + "showinterdetails", function(e) {
            e.stopImmediatePropagation();

            $(".icn3d-border").show();
            me.setLogCmd("table inter details", true);
        });

        $("#" + me.pre + "sortSet2").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('save2');
        });

        $("#" + me.pre + "hbondGraph").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('graph');
        });

        $("#" + me.pre + "hbondLineGraph").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.showInteractions('linegraph');
        });

        // select residues
        $(document).on("click", "#" + me.svgid + " circle.selected", function(e) {
            e.stopImmediatePropagation();
            var id = $(this).attr('res');

            if(me.bSelectResidue === false && !me.icn3d.bShift && !me.icn3d.bCtrl) {
              me.removeSelection();
            }

            if(id !== undefined) {
               me.selectResidues(id, this);
               me.icn3d.addHlObjects();  // render() is called
            }
        });

        $("#" + me.svgid + "_svg").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.saveSvg(me.svgid, me.inputid + "_force_directed_graph.svg");
        });

        $("#" + me.svgid + "_png").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var width = $("#" + me.pre + "dl_graph").width();
           var height = $("#" + me.pre + "dl_graph").height();

           me.savePng(me.svgid, me.inputid + "_force_directed_graph.png", width, height);
        });

        $("#" + me.linegraphid + "_svg").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.saveSvg(me.linegraphid, me.inputid + "_line_graph.svg");
        });

        $("#" + me.linegraphid + "_png").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var width = $("#" + me.pre + "dl_linegraph").width();
           var height = $("#" + me.pre + "dl_linegraph").height();

           me.savePng(me.linegraphid, me.inputid + "_line_graph.png", width, height);
        });

        $("#" + me.svgid + "_label").change(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           var className = $("#" + me.svgid + "_label").val();

           $("#" + me.svgid + " text").removeClass();
           $("#" + me.svgid + " text").addClass(className);

           me.setLogCmd("graph label " + className, true);
        });

        $("#" + me.svgid + "_hideedges").change(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.hideedges = parseInt($("#" + me.svgid + "_hideedges").val());

           if(me.hideedges) {
                me.contactInsideColor = 'FFF';
                me.hbondInsideColor = 'FFF';
                me.ionicInsideColor = 'FFF';
           }
           else {
                me.contactInsideColor = 'DDD';
                me.hbondInsideColor = 'AFA';
                me.ionicInsideColor = '8FF';
           }

           if(me.graphStr !== undefined) {
               if(me.icn3d.bRender && me.force) me.drawGraph(me.graphStr);

               me.setLogCmd("hide edges " + me.hideedges, true);
           }
        });
/*
        $("#" + me.svgid + "_pushcenter").change(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.pushcenter = parseInt($("#" + me.svgid + "_pushcenter").val());

           if(me.graphStr !== undefined) {
               me.drawGraph(me.graphStr);

               me.setLogCmd("graph center " + me.pushcenter, true);
           }
        });
*/
        $("#" + me.svgid + "_force").change(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.force = parseInt($("#" + me.svgid + "_force").val());

           if(me.graphStr !== undefined) {
               me.setLogCmd("graph force " + me.force, true);

               me.handleForce();
           }
        });

        $("#" + me.pre + "hbondReset").click(function(e) {
           e.preventDefault();
           //dialog.dialog( "close" );

           me.resetInteractionPairs();

           me.setLogCmd("reset interaction pairs", true);
        });

    },

    handleForce: function() { var me = this; //"use strict";
       if(me.force == 0 && me.simulation !== undefined) {
           me.simulation.stop();

           me.simulation.force("charge", null);
           me.simulation.force("x", null);
           me.simulation.force("y", null);
           me.simulation.force("r", null);

           me.simulation.force("link", null);
       }
       else {
           me.drawGraph(me.graphStr);
       }
    },

    resetInteractionPairs: function() { var me = this; //"use strict";
       //$("#" + me.pre + "analysis_hbond")[0].checked = true;
       //$("#" + me.pre + "analysis_saltbridge")[0].checked = true;
       //$("#" + me.pre + "analysis_contact")[0].checked = true;

       //$("#" + me.pre + "atomsCustomHbond2").val(['selected']);
       //$("#" + me.pre + "atomsCustomHbond").val(['non-selected']);

       //$("#" + me.pre + "hbondthreshold" ).val(3.5);
       //$("#" + me.pre + "saltbridgethreshold" ).val(4.0); // this one somehow not working
       //$("#" + me.pre + "contactthreshold" ).val(4);

       me.bHbondCalc = false;
       //me.setLogCmd('set calculate hbond false', true);

       me.hideHbondsContacts();

       me.clearHighlight();

       // reset the interaction pairs
       me.icn3d.resids2inter = {};
       me.icn3d.resids2interAll = {};
    },

    viewInteractionPairs: function(nameArray2, nameArray, bHbondCalc, type,
      bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking) { var me = this; //"use strict";
       // type: view, save, forcegraph
       me.icn3d.bRender = false;
       var hAtoms = {};
       var prevHatoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

       var atomSet1 = me.getAtomsFromNameArray(nameArray2);
       var atomSet2 = me.getAtomsFromNameArray(nameArray);

       var labelType; // residue, chain, structure
       var cntChain = 0, cntStructure = 0;
       for(var structure in me.icn3d.structures) {
           var bStructure = false;
           for(var i = 0, il = me.icn3d.structures[structure].length; i < il; ++i) {
               var chainid = me.icn3d.structures[structure][i];
               for(var serial in me.icn3d.chains[chainid]) {
                   if(atomSet1.hasOwnProperty(serial) || atomSet2.hasOwnProperty(serial)) {
                       ++cntChain;
                       bStructure = true;
                       break;
                   }
               }
           }
           ++cntStructure;
       }

       if(cntStructure > 1) labelType = 'structure';
       else if(cntChain > 1) labelType = 'chain';
       else labelType = 'residue';

       // fixed order of interaction type
       var interactionTypes = [];
       if(bHbond) {
           interactionTypes.push('hbonds');
       }
       if(bSaltbridge) {
           interactionTypes.push('salt bridge');
       }
       if(bInteraction) {
           interactionTypes.push('interactions');
       }
       if(bHalogen) {
           interactionTypes.push('halogen');
       }
       if(bPication) {
           interactionTypes.push('pi-cation');
       }
       if(bPistacking) {
           interactionTypes.push('pi-stacking');
       }

       if(!bHbondCalc) {
           me.icn3d.resids2inter = {};
           me.icn3d.resids2interAll = {};
       }

       if(bSaltbridge) {
           var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               //me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true, type);
               me.showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);
       }

       if(bHbond) {
           var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, undefined, type);
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);
       }

       // switch display order, show hydrogen first
       var tableHtml = '';
       if(bHbond) {
           tableHtml += me.exportHbondPairs(type, labelType);
       }

       if(bSaltbridge) {
           tableHtml += me.exportSaltbridgePairs(type, labelType);
       }

       if(bHalogen) {
           var threshold = parseFloat($("#" + me.pre + "halogenthreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'halogen');
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);

           tableHtml += me.exportHalogenPiPairs(type, labelType, 'halogen');
       }

       if(bPication) {
           var threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-cation');
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);

           tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-cation');
       }

       if(bPistacking) {
           var threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-stacking');
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);

           tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-stacking');
       }

       if(bInteraction) {
           var threshold = parseFloat($("#" + me.pre + "contactthreshold" ).val());

           if(!bHbondCalc) {
               me.icn3d.hAtoms = me.icn3d.cloneHash(prevHatoms);
               me.pickCustomSphere(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           }

           hAtoms = me.icn3d.unionHash(hAtoms, me.icn3d.hAtoms);

           tableHtml += me.exportSpherePairs(true, type, labelType);
       }

       me.icn3d.hAtoms = me.icn3d.cloneHash(hAtoms);

       me.icn3d.bRender = true;
       //me.updateHlAll();
       me.icn3d.draw();

       var residHash, select, commandname, commanddesc;

       residHash = me.icn3d.getResiduesFromAtoms(hAtoms);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_all';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);

       var interface1 = me.icn3d.intHash(hAtoms, atomSet1);
       residHash = me.icn3d.getResiduesFromAtoms(interface1);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_1';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);

       var interface2 = me.icn3d.intHash(hAtoms, atomSet2);
       residHash = me.icn3d.getResiduesFromAtoms(interface2);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_2';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);

       var html = '<div style="text-align:center"><b>Hydrogen Bonds, Salt Bridges, Contacts, Halogen Bonds, &pi;-cation, &pi;-stacking between Two Sets:</b><br>';

       var residueArray1 = me.atoms2residues(Object.keys(atomSet1));
       var residueArray2 = me.atoms2residues(Object.keys(atomSet2));

       var cmd1 = 'select ' + me.residueids2spec(residueArray1);
       var cmd2 = 'select ' + me.residueids2spec(residueArray2);

       html += 'Set 1: ' + nameArray2 + ' <button class="' + me.pre + 'selset" cmd="' + cmd1 + '">Highlight in 3D</button><br>';
       html += 'Set 2: ' + nameArray + ' <button class="' + me.pre + 'selset" cmd="' + cmd2 + '">Highlight in 3D</button><br><br></div>';

       html += '<div style="text-align:center"><b>The interfaces are:</b><br>';

       var residueArray3 = me.atoms2residues(Object.keys(interface1));
       var residueArray4 = me.atoms2residues(Object.keys(interface2));

       var cmd3 = 'select ' + me.residueids2spec(residueArray3);
       var cmd4 = 'select ' + me.residueids2spec(residueArray4);

       html += 'interface_1 <button class="' + me.pre + 'selset" cmd="' + cmd3 + '">Highlight in 3D</button><br>';
       html += 'interface_2 <button class="' + me.pre + 'selset" cmd="' + cmd4 + '">Highlight in 3D</button><br><br></div>';

       html += '<div><b>Note</b>: Each checkbox below selects the corresponding residue. '
         + 'You can click "Save Selection" in the "Select" menu to save the selection '
         + 'and click on "Highlight" button to clear the checkboxes.</div><br>';

       var header = html;

       if(type == 'graph' || type == 'linegraph') html = '';

       html += tableHtml;

       if(type == 'save1' || type == 'save2') {
           var html = header;

           var tmpText = '';
           if(type == 'save1') {
               tmpText = 'Set 1';
           }
           else if(type == 'save2') {
               tmpText = 'Set 2';
           }
           html += '<div style="text-align:center"><br><b>Interactions Sorted on ' + tmpText + '</b>: <button class="' + me.pre + 'showintercntonly" style="margin-left:20px">Show Count Only</button><button class="' + me.pre + 'showinterdetails" style="margin-left:20px">Show Details</button></div>';

           html += me.getAllInteractionTable(type);

           //var file_pref = (me.inputid) ? me.inputid : "custom";
           //if(type == 'save1') {
           //    me.saveFile(file_pref + '_interaction_sort_set1.html', 'html', encodeURIComponent(html));
           //}
           //else if(type == 'save2') {
           //    me.saveFile(file_pref + '_interaction_sort_set2.html', 'html', encodeURIComponent(html));
           //}

           $("#" + me.pre + "dl_interactionsorted").html(html);
           me.openDialog(me.pre + 'dl_interactionsorted', 'Show sorted interactions');
       }
       else if(type == 'view') {
           $("#" + me.pre + "dl_allinteraction").html(html);
           me.openDialog(me.pre + 'dl_allinteraction', 'Show interactions');
       }
       else if(type == 'linegraph') {
           me.openDialog(me.pre + 'dl_linegraph', 'Show interactions with two lines of residue nodes');

           var bLine = true;
           me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);

           me.bLinegraph = true;

           // draw SVG
           var svgHtml = me.drawLineGraph(me.graphStr);

           $("#" + me.pre + "linegraphDiv").html(svgHtml);
       }
       else if(type == 'graph') {
           // atomSet1 and atomSet2 are in the right order here
           me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           me.bGraph = true;

           // showonly displayed set in 2D graph
           if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(me.icn3d.dAtoms).length) {
               me.graphStr = me.getGraphDataForDisplayed();
           }

           if(me.bD3 === undefined) {
               var url = "https://d3js.org/d3.v4.min.js";
               $.ajax({
                  url: url,
                  dataType: "script",
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                       me.bD3 = true;

                       $("#" + me.svgid).empty();
                       me.openDialog(me.pre + 'dl_graph', 'Force-directed graph');
                       //if(me.icn3d.bRender) me.drawGraph(me.graphStr);
                       me.drawGraph(me.graphStr);

                       if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }

                    if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();

                    return;
                  }
               });
           }
           else {
               $("#" + me.svgid).empty();
               me.openDialog(me.pre + 'dl_graph', 'Force-directed graph');
               //if(me.icn3d.bRender) me.drawGraph(me.graphStr);
               me.drawGraph(me.graphStr);
           }
       }

       me.bHbondCalc = true;
       //me.setLogCmd('set calculate hbond true', true);

       return interactionTypes.toString();
    },

    compResid: function(a, b, type) { var me = this; //"use strict";
      var aArray = a.split(',');
      var bArray = b.split(',');

      var aIdArray, bIdArray;
      if(type == 'save1') {
        aIdArray = aArray[0].split('_');
        bIdArray = bArray[0].split('_');
      }
      else if(type == 'save2') {
        aIdArray = aArray[1].split('_');
        bIdArray = bArray[1].split('_');
      }

      var aChainid = aIdArray[0] + '_' + aIdArray[1];
      var bChainid = bIdArray[0] + '_' + bIdArray[1];

      var aResi = parseInt(aIdArray[2]);
      var bResi = parseInt(bIdArray[2]);

      if(aChainid > bChainid){
        return 1;
      }
      else if(aChainid < bChainid){
        return -1;
      }
      else if(aChainid == bChainid){
        return (aResi > bResi) ? 1 : (aResi < bResi) ? -1 : 0;
      }
    },

    getAllInteractionTable: function(type) { var me = this; //"use strict";
        var residsArray = Object.keys(me.icn3d.resids2inter);

        if(type == 'save1') {
           residsArray.sort(function(a,b) {
              return me.compResid(a, b, type);
           });
        }
        else if(type == 'save2') {
           residsArray.sort(function(a,b) {
              return me.compResid(a, b, type);
           });
        }

        //me.icn3d.resids2inter
        tmpText = '';

        var prevResidname1 = '', prevIds = '';
        var strHbond = '', strIonic = '', strContact = '', strHalegen = '', strPication = '', strPistacking = '';
        var cntHbond = 0, cntIonic = 0, cntContact = 0, cntHalegen = 0, cntPication = 0, cntPistacking = 0;
        for(var i = 0, il = residsArray.length; i < il; ++i) {
            var resids = residsArray[i];
            var residname1_residname2 = resids.split(',');
            var residname1 = (type == 'save1') ? residname1_residname2[0] : residname1_residname2[1];
            var residname2 = (type == 'save1') ? residname1_residname2[1] : residname1_residname2[0];

            // stru_chain_resi_resn
            var ids = residname1.split('_');

            if(i > 0 && residname1 != prevResidname1) {
                tmpText += me.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
                  cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
                strHbond = ''; strIonic = ''; strContact = ''; strHalegen = ''; strPication = ''; strPistacking = '';
                cntHbond = 0; cntIonic = 0; cntContact = 0; cntHalegen = 0; cntPication = 0; cntPistacking = 0;
            }

            var labels2dist, result;

            labels2dist = me.icn3d.resids2inter[resids]['hbond'];
            result = me.getInteractionPairDetails(labels2dist, type, 'hbond');
            strHbond += result.html;
            cntHbond += result.cnt;

            labels2dist = me.icn3d.resids2inter[resids]['ionic'];
            result = me.getInteractionPairDetails(labels2dist, type, 'ionic');
            strIonic += result.html;
            cntIonic += result.cnt;

            labels2dist = me.icn3d.resids2inter[resids]['contact'];
            result = me.getContactPairDetails(labels2dist, type, 'contact');
            strContact += result.html;
            cntContact += result.cnt;

            labels2dist = me.icn3d.resids2inter[resids]['halogen'];
            result = me.getInteractionPairDetails(labels2dist, type, 'halogen');
            strHalegen += result.html;
            cntHalegen += result.cnt;

            labels2dist = me.icn3d.resids2inter[resids]['pi-cation'];
            result = me.getInteractionPairDetails(labels2dist, type, 'pi-cation');
            strPication += result.html;
            cntPication += result.cnt;

            labels2dist = me.icn3d.resids2inter[resids]['pi-stacking'];
            result = me.getInteractionPairDetails(labels2dist, type, 'pi-stacking');
            strPistacking += result.html;
            cntPistacking += result.cnt;

            prevResidname1 = residname1;
            prevIds = ids;
        }

        tmpText += me.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
          cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);

        var html = '';
        if(residsArray.length > 0) {
            html += '<br><table class="icn3d-sticky" align=center border=1 cellpadding=10 cellspacing=0><thead>';
            html += '<tr><th rowspan=2>Residue</th><th rowspan=2># Hydrogen<br>Bond</th><th rowspan=2># Salt Bridge<br>/Ionic Interaction</th><th rowspan=2># Contact</th>';
            html += '<th rowspan=2># Halogen<br>Bond</th><th rowspan=2># &pi;-Cation</th><th rowspan=2># &pi;-Stacking</th>';
            html += '<th>Hydrogen Bond</th><th>Salt Bridge/Ionic Interaction</th><th>Contact</th>';
            html += '<th>Halogen Bond</th><th>&pi;-Cation</th><th>&pi;-Stacking</th></tr>';
            html += '<tr>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td># Contacts</td><td>Min Distance (&#8491;)</td><td>C-alpha Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += '</tr>';
            html += '</thead><tbody>';

            html += tmpText;

            html += '</tbody></table><br/>';
        }

        return  html;
    },

    getInteractionPerResidue: function(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) { var me = this; //"use strict";
        var tmpText = '';

        tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strHbond + '</table></td>';
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strIonic + '</table></td>';
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strContact + '</table></td>';
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strHalegen + '</table></td>';
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strPication + '</table></td>';
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + strPistacking + '</table></td>';
        tmpText += '</tr>';

        return tmpText;
    },

    getInteractionPairDetails: function(labels2dist, type, interactionType) { var me = this; //"use strict";
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');

                var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];

                var resid1Real = me.convertLabel2Resid(resid1);
                var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
                var color1 = atom1.color.getHexString();

                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();

                var dist = Math.sqrt(labels2dist[labels]).toFixed(1);

                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + dist + '</td>';
                tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';

                ++cnt;
            }
        }

        return {html: tmpText, cnt: cnt};
    },

    getContactPairDetails: function(labels2dist, type) { var me = this; //"use strict";
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';

        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');

                var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];

                var resid1Real = me.convertLabel2Resid(resid1);
                var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1Real]);
                var color1 = atom1.color.getHexString();

                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2Real]);
                var color2 = atom2.color.getHexString();

                var dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                var atom1 = dist1_dist2_atom1_atom2[2];
                var atom2 = dist1_dist2_atom1_atom2[3];
                var contactCnt = dist1_dist2_atom1_atom2[4];

                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';

                cnt += parseInt(contactCnt);
            }
        }

        return {html: tmpText, cnt: cnt};
    },

    getGraphData: function(atomSet2, atomSet1, nameArray2, nameArray, html, labelType) { var me = this; //"use strict";
       // get the nodes and links data
       var nodeStr = '', linkStr = '';

       var nodeArray = [], linkArray = [];

       var node_link1 = me.getNodesLinksForSet(atomSet2, labelType, 'a');
       var node_link2 = me.getNodesLinksForSet(atomSet1, labelType, 'b');

       nodeArray = node_link1.node.concat(node_link2.node);

       // removed duplicated nodes
       var nodeJsonArray = [];
       var checkedNodeidHash = {};
       var cnt = 0;
       for(var i = 0, il = nodeArray.length; i < il; ++i) {
           var node = nodeArray[i];
           var nodeJson = JSON.parse(node);

           if(!checkedNodeidHash.hasOwnProperty(nodeJson.id)) {
               nodeJsonArray.push(nodeJson);
               checkedNodeidHash[nodeJson.id] = cnt;
               ++cnt;
           }
           else {
               var pos = checkedNodeidHash[nodeJson.id];
               nodeJsonArray[pos].s = 'ab'; // appear in both sets
           }
       }

       var nodeStrArray = [];
       for(var i = 0, il = nodeJsonArray.length; i < il; ++i) {
           var nodeJson = nodeJsonArray[i];
           nodeStrArray.push(JSON.stringify(nodeJson));
       }

       nodeStr = nodeStrArray.join(', ');

       // linkStr
       linkArray = node_link1.link.concat(node_link2.link);
       linkStr = linkArray.join(', ');

       // add chemicals, no links for chemicals
       var selectedAtoms = me.icn3d.unionHash(me.icn3d.cloneHash(atomSet1), atomSet2);
       var chemcicalAtoms = me.icn3d.exclHash(me.icn3d.cloneHash(selectedAtoms), me.icn3d.proteins);
       chemcicalAtoms = me.icn3d.exclHash(chemcicalAtoms, me.icn3d.nucleotides);

       var chemicalNodeStr = '', prevResi = '', prevChain = '';
       for(var i in chemcicalAtoms) {
           var atom = me.icn3d.atoms[i];
           if(atom.resi != prevResi || atom.chain != prevChain) {
               var resName = me.icn3d.residueName2Abbr(atom.resn) + atom.resi;
               if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
               if(labelType == 'structure') resName += '.' + atom.structure;
               // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
               var resid = '1_1_' + atom.structure + '_' + atom.chain + '_' + atom.resi;

               chemicalNodeStr += ', {"id": "' + resName + '", "r": "' + resid + '", "x": ' + atom.coord.x.toFixed(0)
                   + ', "y": ' + atom.coord.y.toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}';
           }

           prevResi = atom.resi;
           prevChain = atom.chain;
       }

       var hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
         disulfideLinkStr = '', crossLinkStr = '';

           // add hydrogen bonds for each set

           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               hBondLinkStr += me.getHbondLinksForSet(atomSet2, labelType);
               hBondLinkStr += me.getHbondLinksForSet(atomSet1, labelType);
           }

           // add ionic interaction for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               ionicLinkStr += me.getIonicLinksForSet(atomSet2, labelType);
               ionicLinkStr += me.getIonicLinksForSet(atomSet1, labelType);
           }

           // add halogen, pi-cation and pi-stacking for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               halogenpiLinkStr += me.getHalogenPiLinksForSet(atomSet2, labelType);
               halogenpiLinkStr += me.getHalogenPiLinksForSet(atomSet1, labelType);
           }

           // add contacts for each set
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
               contactLinkStr += me.getContactLinksForSet(atomSet2, labelType);
               contactLinkStr += me.getContactLinksForSet(atomSet1, labelType);
           }
           else {
               contactLinkStr += me.getContactLinksForSet(atomSet1, labelType);
           }

           // add disulfide bonds
           for(var structure in me.icn3d.ssbondpnts) {
               for(var i = 0, il = me.icn3d.ssbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = me.icn3d.ssbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = me.icn3d.ssbondpnts[structure][i+1];
                   var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1]);
                   var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2]);

                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = me.icn3d.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;

                       var resName2 = me.icn3d.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;

                       disulfideLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.ssbondValue + ', "c": "' + me.ssbondColor + '"}';
                   }
               }
           }

           // add cross linkage
           for(var structure in me.icn3d.clbondpnts) {
               for(var i = 0, il = me.icn3d.clbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = me.icn3d.clbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = me.icn3d.clbondpnts[structure][i+1];
                   var atom1 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid1]);
                   var atom2 = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid2]);

                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = me.icn3d.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;

                       var resName2 = me.icn3d.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;

                       crossLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.clbondValue + ', "c": "' + me.clbondColor + '"}';
                   }
               }
           }

       var resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';

       resStr += linkStr + html + hBondLinkStr + ionicLinkStr + halogenpiLinkStr + disulfideLinkStr + crossLinkStr + contactLinkStr;

       resStr += ']}';

       return resStr;
    },

    drawResNode: function(node, i, r, gap, margin, y, setName) { var me = this; //"use strict";
        var resid = node.r.substr(4);
        var x = margin + i * (r + gap);

        var atom = me.icn3d.getFirstAtomObj(me.icn3d.residues[resid]);
        //var color = "#" + atom.color.getHexString().toUpperCase();
        var color = "#" + node.c.toUpperCase();
        var hlColor = "#" + me.icn3d.hColor.getHexString().toUpperCase();

        var pos = node.id.indexOf('.');
        var nodeName = (pos == -1) ? node.id : node.id.substr(0, pos);

        var adjustx = 0, adjusty = (setName == 'a') ? -7 : 10;
        if(i % 2 == 1) adjusty = (setName == 'a') ? adjusty - 7 : adjusty + 7;

        var strokecolor = '#000';
        var strokewidth = '1';
        var textcolor = '#000';
        var fontsize = '6';

        var html = "<g class='icn3d-node' resid='" + resid + "' >";
        html += "<title>" + node.id + "</title>";
        html += "<circle cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";

        html += "<text x='" + (x + adjustx).toString() + "' y='" + (y + adjusty).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";

        html += "</g>";

        return html;
    },

    drawLineGraph: function(lineGraphStr) { var me = this; //"use strict";
        var graph = JSON.parse(lineGraphStr);

        var linkArray = [], nodeArray1 = [], nodeArray2 = [];

        var name2node = {};
        for(var i = 0, il = graph.nodes.length; i < il; ++i) {
            var node = graph.nodes[i];
            name2node[node.id] = node;
        }

        // only get interaction links
        var nameHash = {};
        for(var i = 0, il = graph.links.length; i < il; ++i) {
            var link = graph.links[i];
            if(link.v == me.hbondValue || link.v == me.ionicValue || link.v == me.halogenValue
              || link.v == me.picationValue || link.v == me.pistackingValue || link.v == me.contactValue) {
                linkArray.push(link);

                nameHash[link.source] = 1;
                nameHash[link.target] = 1;
            }
        }

        // get involved nodes
        for(var name in nameHash) {
            var node = name2node[name];
            if(node.s == 'a') {
                nodeArray1.push(node);
            }
            else if(node.s == 'b') {
                nodeArray2.push(node);
            }
            else if(node.s == 'ab') {
                nodeArray1.push(node);
                nodeArray2.push(node);
            }
        }

        // sort array
        nodeArray1.sort(function(a,b) {
          return me.compNode(a, b);
        });

        nodeArray2.sort(function(a,b) {
          return me.compNode(a, b);
        });

        var len1 = nodeArray1.length, len2 = nodeArray2.length;

        var factor = 1;
        var r = 3 * factor;
        var gap = 10 * factor;

        var height = 110;
        var margin = 10;
        var width = (len1 > len2) ? len1 * (r + gap) + 2 * margin : len2 * (r + gap) + 2 * margin;
        me.linegraphWidth = 2 * width;

        me.linegraphid = me.pre + 'linegraph';
        var html = "<svg id='" + me.linegraphid + "' viewBox='0,0," + width + "," + height + "' width='" + me.linegraphWidth + "px'>";

        // draw nodes
        var margin1, margin2;

        if(len1 > len2) {
            margin1 = margin;
            margin2 = Math.abs(len1 - len2) * (r + gap) * 0.5 + margin;
        }
        else {
            margin2 = margin;
            margin1 = Math.abs(len1 - len2) * (r + gap) * 0.5 + margin;
        }

        var h1 = 30, h2 = 80;
        var nodeHtml = '';
        var node2posSet1 = {}, node2posSet2 = {};
        for(var i = 0; i < len1; ++i) {
            nodeHtml += me.drawResNode(nodeArray1[i], i, r, gap, margin1, h1, 'a');
            node2posSet1[nodeArray1[i].id] = {x: margin1 + i * (r + gap), y: h1};
        }

        for(var i = 0; i < len2; ++i) {
            nodeHtml += me.drawResNode(nodeArray2[i], i, r, gap, margin2, h2, 'b');
            node2posSet2[nodeArray2[i].id] = {x: margin2 + i * (r + gap), y: h2};
        }

        // draw lines
        for(var i = 0, il = linkArray.length; i < il; ++i) {
            var link = linkArray[i];

            var node1 = name2node[link.source];
            var node2 = name2node[link.target];

            var resid1 = node1.r.substr(4);
            var resid2 = node2.r.substr(4);

            var pos1 = node2posSet1[node1.id];
            var pos2 = node2posSet2[node2.id];

            var linestrokewidth;
            if(link.v == me.contactValue) {
                linestrokewidth = 1;
            }
            else {
                linestrokewidth = 2;
            }

            var strokecolor;
            if(link.v == me.hbondValue) {
                strokecolor = "#" + me.hbondColor;
            }
            else if(link.v == me.ionicValue) {
                strokecolor = "#" + me.ionicColor;
            }
            else if(link.v == me.halogenValue) {
                strokecolor = "#" + me.halogenColor;
            }
            else if(link.v == me.picationValue) {
                strokecolor = "#" + me.picationColor;
            }
            else if(link.v == me.pistackingValue) {
                strokecolor = "#" + me.pistackingColor;
            }
            else if(link.v == me.contactValue) {
                strokecolor = "#" + me.contactColor;
            }

            html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
            html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
            html += "<line x1='" + pos1.x + "' y1='" + pos1.y + "' x2='" + pos2.x + "' y2='" + pos2.y + "' stroke='" + strokecolor + "' stroke-width='" + linestrokewidth + "' /></g>";
        }

        // show nodes later
        html += nodeHtml;

        $("#" + me.pre + "linegraphDiv").html(html);

        return html;
    },

    compNode: function(a, b, type) { var me = this; //"use strict";
      var resid1 = a.r.substr(4); // 1_1_1KQ2_A_1
      var resid2 = b.r.substr(4); // 1_1_1KQ2_A_1

      var aIdArray = resid1.split('_');
      var bIdArray = resid2.split('_');

      var aChainid = aIdArray[0] + '_' + aIdArray[1];
      var bChainid = bIdArray[0] + '_' + bIdArray[1];

      var aResi = parseInt(aIdArray[2]);
      var bResi = parseInt(bIdArray[2]);

      if(aChainid > bChainid){
        return 1;
      }
      else if(aChainid < bChainid){
        return -1;
      }
      else if(aChainid == bChainid){
        return (aResi > bResi) ? 1 : (aResi < bResi) ? -1 : 0;
      }
    },

    getNodesLinksForSet: function(atomSet, labelType, setName) { var me = this; //"use strict";
       //var nodeStr = '', linkStr = '';
       var nodeArray = [], linkArray = [];
       var cnt = 0, linkCnt = 0;
       var thickness = me.coilValue;
       var prevChain = '', prevResName = '', prevResi = 0, prevAtom;
       // proteins and nucleotides
       for(var i in atomSet) {
           var atom = me.icn3d.atoms[i];
           if(atom.chain != 'DUM' && ((atom.name == "CA" && atom.elem == "C") || atom.name == "O3'" || atom.name == "O3*")) {
           // starting nucleotide have "P"
           //if(atom.chain != 'DUM' && (atom.name == "CA" || atom.name == "P")) {
               var resName = me.icn3d.residueName2Abbr(atom.resn) + atom.resi;
               if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
               if(labelType == 'structure') resName += '.' + atom.structure;
               // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
               var resid = '1_1_' + atom.structure + '_' + atom.chain + '_' + atom.resi;


               //if(cnt > 0) nodeStr += ', ';
               nodeArray.push('{"id": "' + resName + '", "r": "' + resid + '", "s": "' + setName + '", "x": ' + atom.coord.x.toFixed(0)
                   + ', "y": ' + atom.coord.y.toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');

               if(cnt > 0 && prevChain == atom.chain && (atom.resi == prevResi + 1 || atom.resi == prevResi) ) {
                   //if(linkCnt > 0) linkStr += ', ';
                   linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                       + '", "v": ' + thickness + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');

                   if(atom.ssbegin) thickness = me.ssValue;
                   if(atom.ssend) thickness = me.coilValue;
                   ++linkCnt;
               }

               prevChain = atom.chain;
               prevResName = resName;
               prevResi = atom.resi;
               ++cnt;
           }
       }

       return {"node": nodeArray, "link":linkArray};
    },

    getHbondLinksForSet: function(atoms, labelType) { var me = this; //"use strict";
        var resid2ResidhashHbond = {};

        var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());

        //var atoms = me.getAtomsFromNameArray(nameArray);

        //var firstSetAtoms = me.icn3d.intHash(atoms, me.icn3d.proteins);
        //firstSetAtoms = me.icn3d.unionHash2Atoms(firstSetAtoms, me.icn3d.intHash(atoms, me.icn3d.nucleotides));
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;

        var complement = firstSetAtoms;

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = me.icn3d.calculateChemicalHbonds(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );

            resid2ResidhashHbond = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }

        var hbondStr = me.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.hbondInsideColor, labelType, me.hbondInsideValue);

        return hbondStr;
    },

    getIonicLinksForSet: function(atoms, labelType) { var me = this; //"use strict";
        var resid2Residhash = {};

        var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());

        //var atoms = me.getAtomsFromNameArray(nameArray);

        //var firstSetAtoms = me.icn3d.intHash(atoms, me.icn3d.proteins);
        //firstSetAtoms = me.icn3d.unionHash2Atoms(firstSetAtoms, me.icn3d.intHash(atoms, me.icn3d.nucleotides));
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;

        var complement = firstSetAtoms;

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = me.icn3d.calculateIonicInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );

            resid2Residhash = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }
        var ionicStr = me.getGraphLinks(resid2Residhash, resid2Residhash, me.ionicInsideColor, labelType, me.ionicInsideValue);

        return ionicStr;
    },

    getHalogenPiLinksForSet: function(atoms, labelType) { var me = this; //"use strict";
        var resid2Residhash = {};

        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;

        var halogenpiStr = '', threshold;

        threshold = parseFloat($("#" + me.pre + "halogenthreshold" ).val());

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateHalogenPiInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), parseFloat(threshold), 'graph', 'halogen', true );

            resid2Residhash = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }

        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.halogenInsideColor, labelType, me.halogenInsideValue);


        threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateHalogenPiInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-cation', true );

            resid2Residhash = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }

        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.picationInsideColor, labelType, me.picationInsideValue);


        threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = me.icn3d.calculateHalogenPiInteractions(me.icn3d.intHash2Atoms(me.icn3d.dAtoms, firstSetAtoms), me.icn3d.intHash2Atoms(me.icn3d.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-stacking', true );

            resid2Residhash = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        }

        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.pistackingInsideColor, labelType, me.pistackingInsideValue);

        return halogenpiStr;
    },

    getContactLinksForSet: function(atoms, labelType) { var me = this; //"use strict";
        // get secondary structure elements and coil elements
        //var atoms = me.getAtomsFromNameArray(nameArray);

        // include all atoms
        //var atoms = me.icn3d.intHash(atoms, me.icn3d.proteins);
        //atoms = me.icn3d.unionHash2Atoms(firstSetAtoms, me.icn3d.intHash(atoms, me.icn3d.nucleotides));

        var ssAtomsArray = [];
        var prevSS = '', prevChain = '';
        var ssAtoms = {};

        for(var i in atoms) {
            var atom = me.icn3d.atoms[i];
            if(atom.ss != prevSS || atom.chain != prevChain) {
                if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                ssAtoms = {};
            }

            ssAtoms[atom.serial] = 1;

            prevSS = atom.ss;
            prevChain = atom.chain;
        }

        // last ss
        if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);

        var len = ssAtomsArray.length;
        var interStr = '';
        for(var i = 0; i < len; ++i) {
            for(var j = i + 1; j < len; ++j) {
                interStr += me.getContactLinks(ssAtomsArray[i], ssAtomsArray[j], labelType, true);
            }
        }

        return interStr;
    },

    getContactLinks: function(atomlistTarget, otherAtoms, labelType, bInternal) { var me = this; //"use strict";
        var radius = parseFloat($("#" + me.pre + "contactthreshold" ).val());

        var bGetPairs = true, bInteraction = false;
        var atoms = me.icn3d.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction, bInternal);

        var residHash = me.icn3d.cloneHash(me.icn3d.resid2Residhash);
        var interStr = me.getGraphLinks(residHash, residHash, me.contactInsideColor, labelType, me.contactInsideValue);
        return interStr;
    },

    clickApplypick_labels: function() { var me = this; //"use strict";
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplyselection_labels: function() { var me = this; //"use strict";
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplypick_stabilizer: function() { var me = this; //"use strict";
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    // https://github.com/tovic/color-picker
    // https://tovic.github.io/color-picker/color-picker.value-update.html
    pickColor: function() { var me = this; //"use strict";
        var picker = new CP(document.querySelector("#" + me.pre + "colorcustom"));

        picker.on("change", function(color) {
            this.target.value = color;
        });

        $("#" + me.pre + "colorcustom").on("input keyup paste cut", function() {
            var color = $("#" + me.pre + "colorcustom").val();
            picker.set('#' + color).enter();
        });
    },

    clickApplypick_stabilizer_rm: function() { var me = this; //"use strict";
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApplypick_measuredistance: function() { var me = this; //"use strict";
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickApply_thickness: function() { var me = this; //"use strict";
        $("#" + me.pre + "apply_thickness_3dprint").click(function(e) {
            e.preventDefault();
            //dialog.dialog( "close" );

            me.bSetThickness = true;

            me.icn3d.lineRadius = parseFloat($("#" + me.pre + "linerad_3dprint" ).val()); //0.1; // hbonds, distance lines
            me.icn3d.coilWidth = parseFloat($("#" + me.pre + "coilrad_3dprint" ).val()); //0.4; // style cartoon-coil
            me.icn3d.cylinderRadius = parseFloat($("#" + me.pre + "stickrad_3dprint" ).val()); //0.4; // style stick
            me.icn3d.traceRadius = parseFloat($("#" + me.pre + "stickrad_3dprint" ).val()); //0.2; // style c alpha trace, nucleotide stick
            me.icn3d.dotSphereScale = parseFloat($("#" + me.pre + "ballscale_3dprint" ).val()); //0.3; // style ball and stick, dot

            me.icn3d.ribbonthickness = parseFloat($("#" + me.pre + "ribbonthick_3dprint" ).val()); //0.4; // style ribbon, nucleotide cartoon, stand thickness
            me.icn3d.helixSheetWidth = parseFloat($("#" + me.pre + "prtribbonwidth_3dprint" ).val()); //1.3; // style ribbon, stand thickness
            me.icn3d.nucleicAcidWidth = parseFloat($("#" + me.pre + "nucleotideribbonwidth_3dprint" ).val()); //0.8; // nucleotide cartoon

            me.setLogCmd('set thickness | linerad ' + me.icn3d.lineRadius + ' | coilrad ' + me.icn3d.coilWidth + ' | stickrad ' + me.icn3d.cylinderRadius + ' | tracerad ' + me.icn3d.traceRadius + ' | ribbonthick ' + me.icn3d.ribbonthickness + ' | proteinwidth ' + me.icn3d.helixSheetWidth + ' | nucleotidewidth ' + me.icn3d.nucleicAcidWidth  + ' | ballscale ' + me.icn3d.dotSphereScale, true);

            me.icn3d.draw();

           ////$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $("#" + me.pre + "apply_thickness_style").click(function(e) {
            e.preventDefault();
            //dialog.dialog( "close" );

            me.bSetThickness = true;

            me.icn3d.lineRadius = parseFloat($("#" + me.pre + "linerad_style" ).val()); //0.1; // hbonds, distance lines
            me.icn3d.coilWidth = parseFloat($("#" + me.pre + "coilrad_style" ).val()); //0.4; // style cartoon-coil
            me.icn3d.cylinderRadius = parseFloat($("#" + me.pre + "stickrad_style" ).val()); //0.4; // style stick
            me.icn3d.traceRadius = parseFloat($("#" + me.pre + "stickrad_style" ).val()); //0.2; // style c alpha trace, nucleotide stick
            me.icn3d.dotSphereScale = parseFloat($("#" + me.pre + "ballscale_style" ).val()); //0.3; // style ball and stick, dot

            me.icn3d.ribbonthickness = parseFloat($("#" + me.pre + "ribbonthick_style" ).val()); //0.4; // style ribbon, nucleotide cartoon, stand thickness
            me.icn3d.helixSheetWidth = parseFloat($("#" + me.pre + "prtribbonwidth_style" ).val()); //1.3; // style ribbon, stand thickness
            me.icn3d.nucleicAcidWidth = parseFloat($("#" + me.pre + "nucleotideribbonwidth_style" ).val()); //0.8; // nucleotide cartoon

            me.setLogCmd('set thickness | linerad ' + me.icn3d.lineRadius + ' | coilrad ' + me.icn3d.coilWidth + ' | stickrad ' + me.icn3d.cylinderRadius + ' | tracerad ' + me.icn3d.traceRadius + ' | ribbonthick ' + me.icn3d.ribbonthickness + ' | proteinwidth ' + me.icn3d.helixSheetWidth + ' | nucleotidewidth ' + me.icn3d.nucleicAcidWidth  + ' | ballscale ' + me.icn3d.dotSphereScale, true);

            me.icn3d.draw();

           ////$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickReset: function() { var me = this; //"use strict";
        $("#" + me.pre + "reset").click(function(e) {
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

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickToggleHighlight: function() { var me = this; //"use strict";
        $("#" + me.pre + "toggleHighlight").add("#" + me.pre + "toggleHighlight2").click(function(e) {
            e.stopImmediatePropagation();
            me.toggleHighlight();
            me.setLogCmd("toggle highlight", true);
        });

        $(document).on("click", "#" + me.pre + "seq_clearselection", function(e) {
            e.stopImmediatePropagation();
            dialog.dialog( "close" );

            me.clearHighlight();
            me.setLogCmd("clear selection", true);
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

    clickReplay: function() { var me = this; //"use strict";
        $("#" + me.pre + "replay").click(function(e) {
             e.stopImmediatePropagation();

             me.CURRENTNUMBER++;

             if(me.CURRENTNUMBER < me.STATENUMBER) {
                  me.execCommandsBase(me.CURRENTNUMBER, me.CURRENTNUMBER, me.STATENUMBER);

                  var pos = me.icn3d.commands[me.CURRENTNUMBER].indexOf('|||');
                  var cmdStrOri = (pos != -1) ? me.icn3d.commands[me.CURRENTNUMBER].substr(0, pos) : me.icn3d.commands[me.CURRENTNUMBER];
                  var maxLen = 30;
                  var cmdStr = (cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;

                  var menuStr = me.getMenuFromCmd(cmdStr);

                  $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
                  $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);

                  me.icn3d.draw();
             }
        });
    },

    pressCommandtext: function() { var me = this; //"use strict";
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
                else if(lastCommand.indexOf('set map') !== -1 && lastCommand.indexOf('set map wireframe') === -1) {
                    me.applyCommandMap(lastCommand);
                }
                else if(lastCommand.indexOf('view annotations') == 0
                  //|| lastCommand.indexOf('set annotation cdd') == 0
                  //|| lastCommand.indexOf('set annotation site') == 0
                  ) {
                    me.applyCommandAnnotationsAndCddSite(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation clinvar') == 0 ) {
                    me.applyCommandClinvar(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation snp') == 0) {
                    me.applyCommandSnp(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                    me.applyCommand3ddomain(lastCommand);
                }
                else if(lastCommand.indexOf('set annotation all') == 0) {
                    //$.when(me.applyCommandAnnotationsAndCddSite(lastCommand))
                    //    .then(me.applyCommandSnpClinvar(lastCommand))
                    $.when(me.applyCommandClinvar(lastCommand))
                        .then(me.applyCommandSnp(lastCommand))
                        .then(me.applyCommand3ddomain(lastCommand));

                    me.setAnnoTabAll();
                }
                else if(lastCommand.indexOf('view interactions') == 0 && me.cfg.align !== undefined) {
                    me.applyCommandViewinteraction(lastCommand);
                }
                else if(lastCommand.indexOf('symmetry') == 0) {
                    var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                    me.icn3d.symmetrytitle = (title === 'none') ? undefined : title;

                    if(title !== 'none') {
                        if(me.icn3d.symmetryHash === undefined) {
                            me.applyCommandSymmetry(lastCommand);
                        }
                    }
                }
                else if(lastCommand.indexOf('realign on seq align') == 0) {
                    var paraArray = lastCommand.split(' | ');
                    if(paraArray.length == 2) {
                        var nameArray = paraArray[1].split(',');
                        me.icn3d.hAtoms = me.getAtomsFromNameArray(nameArray);
                    }

                    me.applyCommandRealign(lastCommand);
                }
                else if(lastCommand.indexOf('graph interaction pairs') == 0) {
                    me.applyCommandGraphinteraction(lastCommand);
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

    saveSelectionPrep: function() { var me = this; //"use strict";
           if(!$('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) {
             me.openDialog(me.pre + 'dl_definedsets', 'Select sets');
             $("#" + me.pre + "atomsCustom").resizable();
           }

           me.bSelectResidue = false;
           me.bSelectAlignResidue = false;
    },

    clickSeqSaveSelection: function() { var me = this; //"use strict";
        $(document).on("click", "#" + me.pre + "seq_saveselection", function(e) {
           e.stopImmediatePropagation();
           dialog.dialog( "close" );

           me.saveSelectionPrep();

           var name = $("#" + me.pre + "seq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc").val();

           me.saveSelection(name, name);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });

        $(document).on("click", "#" + me.pre + "seq_saveselection2", function(e) {
           e.stopImmediatePropagation();

           me.saveSelectionPrep();

           var name = $("#" + me.pre + "seq_command_name2").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "seq_command_desc2").val();

           me.saveSelection(name, name);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickAlignSeqSaveSelection: function() { var me = this; //"use strict";
        $(document).on("click", "#" + me.pre + "alignseq_saveselection", function(e) {
           e.stopImmediatePropagation();

           me.saveSelectionPrep();

           var name = $("#" + me.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
           //var description = $("#" + me.pre + "alignseq_command_desc").val();

           me.saveSelection(name, name);

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickOutputSelection: function() { var me = this; //"use strict";
        $(document).on("click", "." + me.pre + "outputselection", function(e) {
              e.stopImmediatePropagation();
            me.bSelectResidue = false;
            me.bSelectAlignResidue = false;
            me.setLogCmd('output selection', true);
            me.outputSelection();

           //$( ".icn3d-accordion" ).accordion(me.closeAc);
        });
    },

    clickSaveDailog: function() { var me = this; //"use strict";
        $(document).on("click", ".icn3d-saveicon", function(e) {
           e.stopImmediatePropagation();

           var id = $(this).attr('pid');

           var html = '';

           html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/lib/jquery-ui-1.12.1.min.css">\n';
           html += '<link rel="stylesheet" href="https:///structure.ncbi.nlm.nih.gov/icn3d/icn3d_full_ui_2.16.1.css">\n';
           html += $("#" + id).html();

           var idArray = id.split('_');
           var idStr = (idArray.length > 2) ? idArray[2] : id;

           var structureStr = Object.keys(me.icn3d.structures)[0];
           if(Object.keys(me.icn3d.structures).length > 1) structureStr += '-' + Object.keys(me.icn3d.structures)[1];

           me.saveFile(structureStr + '-' + idStr + '.html', 'html', encodeURIComponent(html));
        });
    },

    selectOneResid: function(idStr, bUnchecked) { var me = this; //"use strict";
      //var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, $1KQ2.B:40 ASP
      //change to: var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40
      var posStructure = idStr.indexOf('$');
      var posChain = idStr.indexOf('.');
      var posRes = idStr.indexOf(':');
      var posAtom = idStr.indexOf('@');
      if(posAtom == -1) posAtom = idStr.length; //idStr.indexOf(' ');

      var structure = idStr.substr(posStructure + 1, posChain - posStructure - 1);
      var chain = idStr.substr(posChain + 1, posRes - posChain - 1);
      var resi = idStr.substr(posRes + 1, posAtom - posRes - 1);

      var resid = structure + '_' + chain + '_' + resi;

      for(var j in me.icn3d.residues[resid]) {
          if(bUnchecked) {
              delete me.icn3d.hAtoms[j];
          }
          else {
              me.icn3d.hAtoms[j] = 1;
          }
      }

      if(bUnchecked) {
          delete me.selectedResidues[resid];
      }
      else {
          me.selectedResidues[resid] = 1;
      }

      var cmd = '$' + structure + '.' + chain + ':' + resi;

      return cmd;
    },

    clickResidueOnInteraction: function() { var me = this; //"use strict";
        // highlight a pair residues
        $(document).on("click", "." + me.pre + "selres", function(e) {
              e.stopImmediatePropagation();

              me.bSelOneRes = false;
              var elems = $( "." + me.pre + "seloneres" );
              for(var i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }

              var idArray = $(this).attr('resid').split('|');

              me.icn3d.hAtoms = {};
              me.selectedResidues = {};
              var cmd = 'select ';
              for(var i = 0, il = idArray.length; i < il; ++i) {
                  var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40

                  if(i > 0) cmd += ' or ';
                  cmd += me.selectOneResid(idStr);
              }

              me.updateHlAll();

              me.setLogCmd(cmd, true);
        });

        // highlight a residue
        $(document).on("click", "." + me.pre + "seloneres", function(e) {
              e.stopImmediatePropagation();

              if(!me.bSelOneRes) {
                  me.icn3d.hAtoms = {};
                  me.selectedResidues = {};

                  me.bSelOneRes = true;
              }

              var resid = $(this).attr('resid');
              var id = $(this).attr('id');

              if($("#" + id).length && $("#" + id)[0].checked) { // checked
                  me.selectOneResid(resid);
              }
              else if($("#" + id).length && !$("#" + id)[0].checked) { // unchecked
                  me.selectOneResid(resid, true);
              }

              me.updateHlAll();

/*
              var cmd = 'select ';
              var cnt = 0;
              for(var resid in me.selectedResidues) {
                  if(cnt > 0) cmd += ' or ';
                  cmd += resid;

                  ++cnt;
              }

              me.setLogCmd(cmd, true);
*/
        });

        // highlight a set of residues
        $(document).on("click", "." + me.pre + "selset", function(e) {
              e.stopImmediatePropagation();

              me.bSelOneRes = false;
              var elems = $( "." + me.pre + "seloneres" );
              for(var i = 0, il = elems.length; i < il;  ++i) {
                  elems[i].checked = false;
              }

              var cmd = $(this).attr('cmd');

              me.selectByCommand(cmd, '', '');

              me.icn3d.removeHlObjects();  // render() is called
              me.icn3d.addHlObjects();  // render() is called

              me.setLogCmd(cmd, true);
        });
    },

    bindMouseup: function() { var me = this; //"use strict";
        $("accordion").bind('mouseup touchend', function (e) {
          if(me.icn3d.bControlGl) {
              if(window.controls) {
                window.controls.noRotate = false;
                window.controls.noZoom = false;
                window.controls.noPan = false;
              }
          }
          else {
              if(me.icn3d.controls) {
                me.icn3d.controls.noRotate = false;
                me.icn3d.controls.noZoom = false;
                me.icn3d.controls.noPan = false;
              }
          }
        });
    },

    bindMousedown: function() { var me = this; //"use strict";
        $("accordion").bind('mousedown touchstart', function (e) {
          if(me.icn3d.bControlGl) {
              if(window.controls) {
                window.controls.noRotate = true;
                window.controls.noZoom = true;
                window.controls.noPan = true;
              }
          }
          else {
              if(me.icn3d.controls) {
                me.icn3d.controls.noRotate = true;
                me.icn3d.controls.noZoom = true;
                me.icn3d.controls.noPan = true;
              }
          }
        });
    },

    expandShrink: function() { var me = this; //"use strict";
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

    scrollAnno: function() { var me = this; //"use strict";
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
    allEventFunctions: function() { var me = this; //"use strict";
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
        me.clickFullscreen();
        me.clickToggle();

        me.clickHlColorYellow();
        me.clickHlColorGreen();
        me.clickHlColorRed();
        me.clickHlStyleOutline();
        me.clickHlStyleObject();
        me.clickHlStyleNone();

        me.clickAlternate();
        me.clickRealign();
        me.clickRealignonseqalign();
        me.clickApplyRealign();
        me.clkMn1_mmtfid();
        me.clkMn1_pdbid();
        me.clkMn1_opmid();
        me.clkMn1_align();
        me.clkMn1_chainalign();
        me.clkMn1_pdbfile();
        me.clkMn1_mol2file();
        me.clkMn1_sdffile();
        me.clkMn1_xyzfile();
        me.clkMn1_urlfile();
        me.clkMn1_mmciffile();
        me.clkMn1_mmcifid();
        me.clkMn1_mmdbid();
        me.clkMn1_blast_rep_id();
        me.clkMn1_gi();
        me.clkMn1_cid();
        me.clkMn1_pngimage();
        me.clkMn1_state();
        me.clkMn1_selection();
        me.clkMn1_dsn6();
        me.clkMn1_dsn6url();
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
        me.clkMn1_replay();
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
        me.clkMn2_selectmainchains();
        me.clkMn2_selectsidechains();
        me.clkMn2_propperty();
        me.clkMn2_selectall();
        me.clkMn2_selectdisplayed();
        me.clkMn2_fullstru();
        me.clkMn2_alignment();
        me.clkMn6_yournote();
        me.clkApplyYournote();
        me.clkMn2_command();
        me.clkMn2_definedsets();
        me.clkMn2_pkYes();
        me.clkMn2_pkNo();
        me.clkMn2_pkResidue();
        me.clkMn2_pkStrand();
        me.clkMn2_pkDomain();
        me.clkMn2_pkChain();
        me.clkMn2_aroundsphere();
        me.clk_adjustmem();
        me.clk_togglemem();
        me.clk_selectplane();
        me.clkMn2_select_chain();
        me.clkMn3_proteinsRibbon();
        me.clkMn3_proteinsStrand();
        me.clkMn3_proteinsCylinder();
        me.clkMn3_proteinsSchematic();
        me.clkMn3_proteinsCalpha();
        me.clkMn3_proteinsBackbone();
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
        me.clkMn3_nuclBackbone();
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
        me.clkMn3_hydrogensYes();
        me.clkMn3_hydrogensNo();
        me.clkMn3_ionsSphere();
        me.clkMn3_ionsDot();
        me.clkMn3_ionsNo();
        me.clkMn3_waterSphere();
        me.clkMn3_waterDot();
        me.clkMn3_waterNo();
        me.clkMn4_clrSpectrum();
        me.clkMn4_clrChain();
        me.clkMn4_clrDomain();
        me.clkMn4_clrSSGreen();
        me.clkMn4_clrSSYellow();
        me.clkMn4_clrSSSpectrum();
        me.clkMn4_clrResidue();
        me.clkMn4_clrResidueCustom();
        me.clkMn4_reloadRescolorfile();
        me.clkMn4_reloadCustomcolorfile();
        me.clkMn4_clrCharge();
        me.clkMn4_clrHydrophobic();
        me.clkMn4_clrAtom();
        me.clkMn4_clrBfactor();
        me.clkMn4_clrBfactorNorm();
        me.clkMn4_clrArea();
        me.clkMn4_clrConserved();
        me.clkMn4_clrIdentity();
        me.clkMn4_clrRed();
        me.clkMn4_clrGreen();
        me.clkMn4_clrBlue();
        me.clkMn4_clrMagenta();
        me.clkMn4_clrYellow();
        me.clkMn4_clrCyan();
        me.clkMn4_clrWhite();
        me.clkMn4_clrGrey();
        me.clkMn4_clrCustom();
        me.clkMn4_clrOther();
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
        me.clkMn5_opacity04();
        me.clkMn5_opacity03();
        me.clkMn5_opacity02();
        me.clkMn5_opacity01();
        me.clkMn5_wireframeYes();
        me.clkMn5_wireframeNo();
        me.clkMn5_elecmap2fofc();
        me.clkMn5_elecmapfofc();
        me.clkMn5_elecmapNo();
        me.clkMn5_mapwireframeYes();
        me.clkMn5_mapwireframeNo();

        me.clkMn5_emmap();
        me.clkMn5_emmapNo();
        me.clickApplyemmap();
        me.clkMn5_emmapwireframeYes();
        me.clkMn5_emmapwireframeNo();

        me.clkMn6_assemblyYes();
        me.clkMn6_assemblyNo();
        me.clkMn6_addlabelResidues();
        me.clkMn6_addlabelResnum();
        me.clkMn6_addlabelAtoms();
        me.clkMn6_addlabelChains();
        me.clkMn6_addlabelTermini();
        me.clkMn6_addlabelYes();
        me.clkMn6_addlabelSelection();
        me.clkMn6_labelscale01();
        me.clkMn6_labelscale02();
        me.clkMn6_labelscale03();
        me.clkMn6_labelscale04();
        me.clkMn6_labelscale05();
        me.clkMn6_labelscale06();
        me.clkMn6_labelscale07();
        me.clkMn6_labelscale08();
        me.clkMn6_labelscale09();
        me.clkMn6_labelscale10();
        me.clkMn6_labelscale20();
        me.clkMn6_labelscale40();

        me.clkMn2_saveselection();
        me.clkMn6_addlabelNo();
        me.clkMn6_distanceYes();
        me.clkmn1_stabilizerOne();
        me.clkmn1_stabilizerRmOne();
        me.clkmn1_thicknessSet();
        me.clkmn5_setThickness();
        me.clkmn1_thicknessReset();
        me.clkMn6_distanceNo();
        me.clkMn2_selectedcenter();
        me.clkMn6_center();
        me.clkMn6_resetOrientation();
        me.clkMn6_chemicalbindingshow();
        me.clkMn6_chemicalbindinghide();
        me.clkMn6_rotateleft();
        me.clkMn6_sidebyside();
        me.clkMn6_rotateright();
        me.clkMn6_rotateup();
        me.clkMn6_rotatedown();
        me.clkMn6_rotatex();
        me.clkMn6_rotatey();
        me.clkMn6_rotatez();
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
        me.clkMn6_symmetry();
        me.clkMn6_area();
        me.clkMn6_applysymmetry();
        me.clkMn6_hbondsYes();
        me.clkMn6_hbondsNo();
        //me.clkMn6_saltbridgeYes();
        //me.clkMn6_saltbridgeNo();
        me.clkmn1_stabilizerYes();
        me.clkmn1_stabilizerNo();
        me.clkMn6_ssbondsYes();
        me.clkMn6_ssbondsExport();
        me.clkMn6_ssbondsNo();
        me.clkMn6_clbondsYes();
        me.clkMn6_clbondsExport();
        me.clkMn6_clbondsNo();
        me.clickCustomAtoms();
        me.clickShow_selected();
        me.clickHide_selected();
        me.clickShow_annotations();
        me.clickShowallchains();
//        me.clickShow_sequences();
        me.clickShow_alignsequences();
        me.clickShow_2ddgm();
//        me.clickShow_selected_atom();
        me.clickCommand_apply();
        me.clickSearchSeq();
        me.clickReload_pdb();
        me.clickReload_opm();
        me.clickReload_align_refined();
        me.clickReload_align_ori();
        me.clickReload_chainalign();
        me.clickReload_mmtf();
        me.clickReload_pdbfile();
        me.clickReload_mol2file();
        me.clickReload_sdffile();
        me.clickReload_xyzfile();
        me.clickReload_urlfile();
        me.clickReload_mmciffile();
        me.clickReload_mmcif();
        me.clickReload_mmdb();
        me.clickReload_blast_rep_id();
        me.clickReload_gi();
        me.clickReload_cid();
        me.clickReload_pngimage();
        me.clickReload_state();
        me.clickReload_selectionfile();
        me.clickReload_dsn6file();
        me.clickApplycustomcolor();
        me.clickApplypick_aroundsphere();

        me.clickApply_adjustmem();
        //me.clickApply_addplane();
        me.clickApply_selectplane();

        me.clickApplyhbonds();
        //me.clickApplysaltbridge();
        me.clickApplymap2fofc();
        me.clickApplymapfofc();
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
        me.clickReplay();
        me.pressCommandtext();
//        me.clickFilter_ckbx_all();
//        me.clickFilter();
//        me.clickHighlight_3d_dgm();
        me.clickSeqSaveSelection();
        me.clickAlignSeqSaveSelection();
        me.clickOutputSelection();
        me.clickSaveDailog();
        me.clickResidueOnInteraction();
        me.click2Ddgm();
        me.bindMouseup();
        me.bindMousedown();
        me.windowResize();
        me.setTabs();
        me.clickAddTrack();
        me.clickCustomColor();
        me.clickDefineHelix();
        me.clickDefineSheet();
        me.clickDefineCoil();
        me.clickDeleteSets();
        me.clickAddTrackButton();

        me.expandShrink();
        me.scrollAnno();
        me.switchHighlightLevel();
    }
};
