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
var iCn3DUI = function(cfg) { var me = this, ic = me.icn3d; "use strict";
    this.REVISION = '2.19.1';
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
    me.contactColor = '888';
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
    me.space2 = "&nbsp;&nbsp;";
    me.space3 = me.space2 + "&nbsp;";
    me.space4 = me.space2 + me.space2;
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
    me.opts['phimap']              = 'nothing';            //phi, nothing
    me.opts['phimapwireframe']     = 'yes';                //yes, no
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
    init: function () { var me = this, ic = me.icn3d; "use strict";
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
    modifyIcn3d: function() { var  me = this; "use strict";
        me.modifyIcn3dshowPicking();
    },
    switchHighlightLevelUp: function() { var me = this, ic = me.icn3d; "use strict";
          if(!ic.bShift && !ic.bCtrl) ic.removeHlObjects();
          if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
              ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
          }
          if(Object.keys(ic.pickedAtomList).length === 0) {
              ic.pickedAtomList = ic.dAtoms;
          }
          if(ic.highlightlevel === 1) { // atom -> residue
              ic.highlightlevel = 2;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
            else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
          }
          else if(ic.highlightlevel === 2) { // residue -> strand
              ic.highlightlevel = 3;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
            }
            else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
            }
          }
          else if(ic.highlightlevel === 3) {
              var atomLevel4;
              if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // strand -> domain
                  ic.highlightlevel = 4;
                  var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
                  atomLevel4 = ic.select3ddomainFromAtom(firstAtom);
                  if(!ic.bShift && !ic.bCtrl) {
                      ic.hAtoms = ic.cloneHash(atomLevel4);
                  }
                  else {
                    ic.hAtoms = ic.unionHash(ic.hAtoms, atomLevel4);
                  }
              }
              if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // strand -> chain
                  ic.highlightlevel = 5;
                  var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
                  if(!ic.bShift && !ic.bCtrl) {
                      ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
                  }
                  else {
                    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
                  }
              }
          }
          else if(ic.highlightlevel === 4) { // domain -> chain
              ic.highlightlevel = 5;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
              else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
          }
          else if(ic.highlightlevel === 5 || ic.highlightlevel === 6) { // chain -> structure
              ic.highlightlevel = 6;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) ic.hAtoms = {};
              var chainArray = ic.structures[firstAtom.structure];
              for(var i = 0, il = chainArray.length; i < il; ++i) {
                  ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[chainArray[i]]);
            }
          }
          ic.addHlObjects();
          me.updateHlAll();
    },
    switchHighlightLevelDown: function() { var me = this, ic = me.icn3d; "use strict";
          ic.removeHlObjects();
          if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
              ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
          }
          if( (ic.highlightlevel === 2 || ic.highlightlevel === 1) && Object.keys(ic.pickedAtomList).length === 1) { // residue -> atom
              ic.highlightlevel = 1;
              ic.hAtoms = ic.cloneHash(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.pickedAtomList);
            }
            else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.pickedAtomList);
            }
          }
          else if(ic.highlightlevel === 3) { // strand -> residue
            var residueHash = {};
            for(var i in ic.pickedAtomList) {
                residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residueHash[residueid] = 1;
            }
            if(Object.keys(residueHash).length === 1) {
                ic.highlightlevel = 2;
                var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
                if(!ic.bShift && !ic.bCtrl) {
                    ic.hAtoms = ic.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
                else {
                    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
            }
          }
          else if(ic.highlightlevel === 4) { // domain -> strand
              ic.highlightlevel = 3;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
              }
              else {
                  ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
              }
          }
          else if(ic.highlightlevel === 5) {
              var atomLevel4;
              if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // chain -> domain
                  ic.highlightlevel = 4;
                  var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
                  atomLevel4 = ic.select3ddomainFromAtom(firstAtom);
                  if(!ic.bShift && !ic.bCtrl) {
                      ic.hAtoms = ic.cloneHash(atomLevel4);
                  }
                  else {
                      ic.hAtoms = ic.unionHash(ic.hAtoms, atomLevel4);
                  }
              }
              if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // chain -> strand
                  ic.highlightlevel = 3;
                  var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
                  if(!ic.bShift && !ic.bCtrl) {
                      ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
                  }
                  else {
                      ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
                  }
              }
          }
          else if(ic.highlightlevel === 6) { // structure -> chain
              ic.highlightlevel = 5;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
            else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
          }
          ic.addHlObjects();
          me.updateHlAll();
    },
    switchHighlightLevel: function() { var me = this, ic = me.icn3d; "use strict";
      $(document).bind('keydown', function (e) { var ic = me.icn3d;
        if(e.keyCode === 38) { // arrow up, select upper level of atoms
          e.preventDefault();
          if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.getFirstAtomObj(ic.pickedAtomList).serial)) {
              ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
              //ic.pk = 2;
          }
          me.switchHighlightLevelUp();
          me.setLogCmd("highlight level up", true);
        }
        else if(e.keyCode === 40) { // arrow down, select down level of atoms
          e.preventDefault();
          if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.getFirstAtomObj(ic.pickedAtomList).serial)) {
              ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
              //ic.pk = 2;
          }
          me.switchHighlightLevelDown();
          me.setLogCmd("highlight level down", true);
        }
      });
    },
    allCustomEvents: function() { var me = this, ic = me.icn3d; "use strict";
      // add custom events here
    },
    setCustomDialogs: function() { var me = this, ic = me.icn3d; "use strict";
        var html = "";
        return html;
    },
    modifyIcn3dshowPicking: function() { var  me = this; //"use strict";
        iCn3D.prototype.rayCaster = function(e, bClick) {
            me = me.setIcn3dui(this.id);
            this.rayCasterBase(e, bClick);
        };
        iCn3D.prototype.showPicking = function(atom, x, y) {
          me = me.setIcn3dui(this.id);
          if(me.cfg.cid !== undefined) {
              this.pk = 1; // atom
          }
          else {
              // do not change the picking option
          }
          me.icn3d.highlightlevel = this.pk;
          this.showPickingBase(atom, x, y);
          if(x !== undefined && y !== undefined) { // mouse over
            if(me.cfg.showmenu != undefined && me.cfg.showmenu == true) {
                y += me.MENU_HEIGHT;
            }
            var text = (this.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            if(this.structures !== undefined && Object.keys(this.structures).length > 1) {
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
        };
    },
    // ======= functions start==============
    // show3DStructure is the main function to show 3D structure
    show3DStructure: function() { var me = this; //"use strict";
      me.deferred = $.Deferred(function() {
        me.setViewerWidthHeight();

        var str1 = "<label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left (\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
        var str2 = "<span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div></td>";

        if(me.isMobile() || me.cfg.mobilemenu) {
            me.setTopMenusHtmlMobile(me.divid, str1, str2);
        }
        else {
            me.setTopMenusHtml(me.divid, str1, str2);
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
        var ic = me.icn3d;

        if(me.cfg.replay) {
            me.bReplay = 1;
            $("#" + me.pre + "replay").show();
        }
        else {
            me.bReplay = 0;
            $("#" + me.pre + "replay").hide();
        }
        if(me.isMobile()) ic.threshbox = 60;
        if(me.cfg.controlGl) {
            ic.bControlGl = true;
            ic.container = (ic.bControlGl) ? $(document) : $('#' + ic.id);
        }
        ic.setControl(); // rotation, translation, zoom, etc
        me.handleContextLost();
        ic.setWidthHeight(width, height);
        ic.ori_chemicalbinding = me.opts['chemicalbinding'];
        if(me.cfg.bCalphaOnly !== undefined) ic.bCalphaOnly = me.cfg.bCalphaOnly;
        //me.deferred = undefined; // sequential calls
        ic.opts = ic.cloneHash(me.opts);
        me.STATENUMBER = ic.commands.length;
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
        ic.molTitle = '';
        if(me.cfg.url !== undefined) {
            var type_url = me.cfg.url.split('|');
            var type = type_url[0];
            var url = type_url[1];
            ic.molTitle = "";
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
                      break;
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
            ic.bChainAlign = true;
            me.inputid = me.cfg.chainalign;
            me.setLogCmd('load chainalignment ' + me.cfg.chainalign + ' | parameters ' + me.cfg.inpara, true);
            me.downloadChainAlignment(me.cfg.chainalign);
        }
        else if(me.cfg.command !== undefined && me.cfg.command !== '') {
            if(me.cfg.command.indexOf('url=') !== -1) me.bInputUrlfile = true;
            me.loadScript(me.cfg.command);
        }
        else {
            //alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
            me.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
        }
      });
      return me.deferred.promise();
    },
    hideMenu: function() { var me = this, ic = me.icn3d; "use strict";
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "none";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "none";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "none";
      $("#" + me.pre + "title")[0].style.margin = "10px 0 0 10px";
    },
    showMenu: function() { var me = this, ic = me.icn3d; "use strict";
      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "block";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "block";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "block";
      //if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";
    },
    saveSelectionIfSelected: function (id, value) { var me = this, ic = me.icn3d; "use strict";
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
    updateGraphCOlor: function () { var me = this, ic = me.icn3d; "use strict";
      // change graph color
      if(me.graphStr !== undefined) {
          var graphJson = JSON.parse(me.graphStr);
          var resid2color = {};
          for(var resid in ic.residues) {
              var atom = ic.getFirstAtomObj(ic.residues[resid]);
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
      if(me.bGraph) me.drawGraph(me.graphStr, me.pre + 'dl_graph');
      if(me.bLinegraph) me.drawLineGraph(me.graphStr);
      if(me.bScatterplot) me.drawLineGraph(me.graphStr, true);
    },
    setOption: function (id, value) { var me = this, ic = me.icn3d; "use strict";
      //var options2 = {};
      //options2[id] = value;
      // remember the options
      ic.opts[id] = value;
      me.saveSelectionIfSelected();
      if(id === 'color') {
          ic.setColorByOptions(ic.opts, ic.hAtoms);
          ic.draw();
          var residueHash = ic.getResiduesFromCalphaAtoms(ic.hAtoms);
          me.changeSeqColor(Object.keys(residueHash));
          // change graph color
          me.updateGraphCOlor();
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          if(id === 'opacity' || id === 'wireframe') {
              ic.removeLastSurface();
          }
          ic.applySurfaceOptions();
          //if(ic.bRender) ic.render();
          ic.draw(); // to make surface work in assembly
      }
      else if(id === 'map' || id === 'mapwireframe') {
          if(id === 'mapwireframe') {
              ic.removeLastMap();
          }
          ic.applyMapOptions();
          //if(ic.bRender) ic.render();
          ic.draw(); // to make surface work in assembly
      }
      else if(id === 'emmap' || id === 'emmapwireframe') {
          if(id === 'emmapwireframe') {
              ic.removeLastEmmap();
          }
          ic.applyEmmapOptions();
          //if(ic.bRender) ic.render();
          ic.draw(); // to make surface work in assembly
      }
      else if(id === 'phimap' || id === 'phimapwireframe') {
          if(id === 'phimapwireframe') {
              ic.removeLastPhimap();
          }
          ic.applyPhimapOptions();
          //if(ic.bRender) ic.render();
          ic.draw(); // to make surface work in assembly
      }
      else if(id === 'chemicalbinding') {
          ic.bSkipChemicalbinding = false;
          ic.draw();
      }
      else {
          ic.draw();
      }
    },
    setStyle: function (selectionType, style) { var me = this, ic = me.icn3d; "use strict";
      var atoms = {};
      var bAll = true;
      switch (selectionType) {
          case 'proteins':
              atoms = ic.intHash(ic.hAtoms, ic.proteins);
              if(Object.keys(ic.hAtoms).length < Object.keys(ic.proteins).length) bAll = false;
              break;
          case 'sidec':
              atoms = ic.intHash(ic.hAtoms, ic.sidec);
              //calpha_atoms = ic.intHash(ic.hAtoms, ic.calphas);
              // include calphas
              //atoms = ic.unionHash(atoms, calpha_atoms);
              break;
          case 'nucleotides':
              atoms = ic.intHash(ic.hAtoms, ic.nucleotides);
              if(Object.keys(ic.hAtoms).length < Object.keys(ic.nucleotides).length) bAll = false;
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
          //if(!bAll) {
          //    atoms = ic.getSSExpandedAtoms(ic.hash2Atoms(atoms));
          //}
          for(var i in atoms) {
            ic.atoms[i].style = style;
          }
      }
      ic.opts[selectionType] = style;
      me.saveSelectionIfSelected();
      ic.draw();
    },
    setLogCmd: function (str, bSetCommand, bAddLogs) { var me = this, ic = me.icn3d; "use strict";
      if(str.trim() === '') return false;
      var pos = str.indexOf('|||');
      if(pos !== -1) str = str.substr(0, pos);
      var transformation = {};
      transformation.factor = ic._zoomFactor;
      transformation.mouseChange = ic.mouseChange;
      transformation.quaternion = {};
      transformation.quaternion._x = parseFloat(ic.quaternion._x).toPrecision(5);
      transformation.quaternion._y = parseFloat(ic.quaternion._y).toPrecision(5);
      transformation.quaternion._z = parseFloat(ic.quaternion._z).toPrecision(5);
      transformation.quaternion._w = parseFloat(ic.quaternion._w).toPrecision(5);
      if(bSetCommand) {
          // save the command only when it's not a history command, i.e., not in the process of going back and forth
          if(me.bAddCommands) {
              // If a new command was called, remove the forward commands and push to the command array
              if(me.STATENUMBER < ic.commands.length) {
                  var oldCommand = ic.commands[me.STATENUMBER - 1];
                  var pos = oldCommand.indexOf('|||');
                  if(str !== oldCommand.substr(0, pos)) {
                    ic.commands = ic.commands.slice(0, me.STATENUMBER);
                    ic.commands.push(str + '|||' + me.getTransformationStr(transformation));
                    ic.optsHistory.push(ic.cloneHash(ic.opts));
                    ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                    if(me.isSessionStorageSupported()) me.saveCommandsToSession();
                    me.STATENUMBER = ic.commands.length;
                  }
              }
              else {
                ic.commands.push(str + '|||' + me.getTransformationStr(transformation));
                ic.optsHistory.push(ic.cloneHash(ic.opts));
                if(ic.hAtoms !== undefined) ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                if(me.isSessionStorageSupported()) me.saveCommandsToSession();
                me.STATENUMBER = ic.commands.length;
              }
          }
      }
      if(me.bAddLogs && me.cfg.showcommand) {
          ic.logs.push(str);
          // move cursor to the end, and scroll to the end
          $("#" + me.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
      }
      me.adjustIcon();
    },
    renderStructure: function () {  var me = this, ic = me.icn3d; "use strict";
      if(ic.bInitial) {
          jQuery.extend(ic.opts, me.opts);
          if(ic.bOpm && (me.cfg.align !== undefined || me.cfg.chainalign !== undefined)) { // show membrane
              var resid = me.selectedPdbid + '_MEM_1';
              for(var i in ic.residues[resid]) {
                  var atom = ic.atoms[i];
                  atom.style = 'stick';
                  atom.color = ic.atomColors[atom.name];
                  ic.atomPrevColors[i] = atom.color;
                  ic.dAtoms[i] = 1;
              }
          }
          if(me.cfg.command !== undefined && me.cfg.command !== '') {
              ic.bRender = false;
              ic.draw();
          }
          else {
              me.oneStructurePerWindow(); // for alignment
              ic.draw();
          }
          if(ic.bOpm) {
              var axis = new THREE.Vector3(1,0,0);
              var angle = -0.5 * Math.PI;
              ic.setRotation(axis, angle);
          }
          if(Object.keys(ic.structures).length > 1) {
              $("#" + me.pre + "alternate").show();
          }
          else {
              $("#" + me.pre + "alternate").hide();
          }
      }
      else {
          me.saveSelectionIfSelected();
          ic.draw();
      }
      if(ic.bInitial && me.cfg.command !== undefined && me.cfg.command !== '') {
          if(Object.keys(ic.structures).length == 1) {
              var id = Object.keys(ic.structures)[0];
              me.cfg.command = me.cfg.command.replace(new RegExp('!','g'), id + '_');
          }
          // final step resolved me.deferred
          me.loadScript(me.cfg.command);
      }
      else {
          if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
      }
      if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign || ( me.bInputfile && me.InputfileType == 'pdb' && Object.keys(ic.structures).length >= 2) ) {
          $("#" + me.pre + "mn2_alternateWrap").show();
          $("#" + me.pre + "mn2_realignWrap").show();
      }
      else {
          $("#" + me.pre + "mn2_alternateWrap").hide();
          $("#" + me.pre + "mn2_realignWrap").hide();
      }
      // display the structure right away. load the mns and sequences later
      setTimeout(function(){
          if(ic.bInitial) {
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
                  var seqObj = me.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight);
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
          ic.bInitial = false;
      }, 0);
    },
    closeDialogs: function () { var me = this, ic = me.icn3d; "use strict";
        var itemArray = ['dl_selectannotations', 'dl_alignment', 'dl_2ddgm', 'dl_definedsets', 'dl_graph', 'dl_linegraph', 'dl_scatterplot', 'dl_allinteraction'];
        for(var i in itemArray) {
            var item = itemArray[i];
            if(!me.cfg.notebook) {
                if($('#' + me.pre + item).hasClass('ui-dialog-content') && $('#' + me.pre + item).dialog( 'isOpen' )) {
                    $('#' + me.pre + item).dialog( 'close' );
                }
            }
            else {
                $('#' + me.pre + item).hide();
            }
        }
        if(!me.cfg.notebook) me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
    },
    exportCustomAtoms: function () { var me = this, ic = me.icn3d; "use strict";
       var html = "";
       var nameArray = (ic.defNames2Residues !== undefined) ? Object.keys(ic.defNames2Residues).sort() : [];
       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var residueArray = ic.defNames2Residues[name];
         var description = ic.defNames2Descr[name];
         var command = ic.defNames2Command[name];
         command = command.replace(/,/g, ', ');
         html += name + "\tselect ";
         html += me.residueids2spec(residueArray);
         html += "\n";
       } // outer for
       nameArray = (ic.defNames2Atoms !== undefined) ? Object.keys(ic.defNames2Atoms).sort() : [];
       for(var i = 0, il = nameArray.length; i < il; ++i) {
         var name = nameArray[i];
         var atomArray = ic.defNames2Atoms[name];
         var description = ic.defNames2Descr[name];
         var command = ic.defNames2Command[name];
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
    atoms2residues: function(atomArray) { var me = this, ic = me.icn3d; "use strict";
         var atoms = {};
         for(var j = 0, jl = atomArray.length; j < jl; ++j) {
             atoms[atomArray[j]] = 1;
         }
         //var residueHash = ic.getResiduesFromCalphaAtoms(atoms);
         var residueHash = ic.getResiduesFromAtoms(atoms);
         return Object.keys(residueHash);
    },
    residueids2spec: function(residueArray) { var me = this, ic = me.icn3d; "use strict";
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
             var bMultipleStructures = (Object.keys(ic.structures).length == 1) ? false : true;
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
    getAtomsFromSets: function (nameArray) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
       var residuesHash = {};
       for(var i = 0, il = nameArray.length; i < il; ++i) {
           commandname = nameArray[i];
           var residuesHashTmp = me.getAtomsFromSet(commandname);
           residuesHash = ic.unionHash(residuesHash, residuesHashTmp);
       }
       return residuesHash;
    },
    getAtomsFromSet: function (commandname) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
       var residuesHash = {};
       // defined sets is not set up
       if(ic.defNames2Residues['proteins'] === undefined) {
           me.showSets();
       }
       //for(var i = 0, il = nameArray.length; i < il; ++i) {
           //var commandname = nameArray[i];
           if(Object.keys(ic.chains).indexOf(commandname) !== -1) {
               residuesHash = ic.unionHash(residuesHash, ic.chains[commandname]);
           }
           else {
               if(ic.defNames2Residues[commandname] !== undefined && ic.defNames2Residues[commandname].length > 0) {
                   for(var j = 0, jl = ic.defNames2Residues[commandname].length; j < jl; ++j) {
                       var resid = ic.defNames2Residues[commandname][j]; // return an array of resid
                       residuesHash = ic.unionHash(residuesHash, ic.residues[resid]);
                   }
               }
               if(ic.defNames2Atoms[commandname] !== undefined && ic.defNames2Atoms[commandname].length > 0) {
                   for(var j = 0, jl = ic.defNames2Atoms[commandname].length; j < jl; ++j) {
                       //var resid = ic.defNames2Atoms[commandname][j]; // return an array of serial
                       //residuesHash = ic.unionHash(residuesHash, ic.residues[resid]);
                       var serial = ic.defNames2Atoms[commandname][j]; // return an array of serial
                       residuesHash[serial] = 1;
                   }
               }
           }
       //}
       return residuesHash;
    },
    getAtomsFromNameArray: function (nameArray) {   var me = this, ic = me.icn3d; "use strict";
        var selAtoms = {};
        for(var i = 0, il = nameArray.length; i < il; ++i) {
            if(nameArray[i] === 'non-selected') { // select all hAtoms
               var currAtoms = {};
               for(var i in ic.atoms) {
                   if(!ic.hAtoms.hasOwnProperty(i) && ic.dAtoms.hasOwnProperty(i)) {
                       currAtoms[i] = ic.atoms[i];
                   }
               }
               selAtoms = ic.unionHash(selAtoms, currAtoms);
            }
            else if(nameArray[i] === 'selected') {
                selAtoms = ic.unionHash(selAtoms, ic.hash2Atoms(ic.hAtoms) );
            }
            else {
                selAtoms = ic.unionHash(selAtoms, ic.hash2Atoms(me.getAtomsFromSet(nameArray[i])) );
            }
        }
        if(nameArray.length == 0) selAtoms = ic.atoms;
        return selAtoms;
    },
    pickCustomSphere: function (radius, nameArray2, nameArray, bSphereCalc, bInteraction, type) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
        if(bSphereCalc) return;
        var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
        if(bInteraction) {
            select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
            ic.opts['contact'] = "yes";
        }
        var atomlistTarget, otherAtoms;
        // could be ligands
        atomlistTarget = me.getAtomsFromNameArray(nameArray2);
        otherAtoms = me.getAtomsFromNameArray(nameArray);
        var result = me.pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select);
        var residueArray = Object.keys(result.residues);
        ic.hAtoms = {};
        for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
          var residueid = residueArray[index];
          for(var i in ic.residues[residueid]) {
            ic.hAtoms[i] = 1;
          }
        }
        // do not change the set of displaying atoms
        //ic.dAtoms = ic.cloneHash(ic.atoms);
        var commandname, commanddesc;
        var firstAtom = ic.getFirstAtomObj(atomlistTarget);
        if(firstAtom !== undefined) {
            commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
            if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + me.pre + "contactthreshold").val() + "A";
            commanddesc = commandname;
            me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
        }
        me.saveSelectionIfSelected();
        ic.draw();
    },
    pickCustomSphere_base: function (radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
        var bGetPairs = true;
        var atoms;
        if(bInteraction) {
            atoms = ic.getAtomsWithinAtom(ic.intHash2Atoms(ic.dAtoms, otherAtoms), ic.intHash2Atoms(ic.dAtoms, atomlistTarget), parseFloat(radius), bGetPairs, bInteraction);
            me.resid2ResidhashInteractions = ic.cloneHash(ic.resid2Residhash);
        }
        else {
            atoms = ic.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction);
            me.resid2ResidhashSphere = ic.cloneHash(ic.resid2Residhash);
        }
        var residues = {}, atomArray = undefined;
        for (var i in atoms) {
            var atom = atoms[i];
            if(ic.bOpm && atom.resn === 'DUM') continue;
            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;
        }
        return {"residues": residues, "resid2Residhash": ic.resid2Residhash};
    },
    // between the highlighted and atoms in nameArray
    showHbonds: function (threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var me = this, ic = me.icn3d; "use strict";
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
        ic.opts[hbonds_saltbridge] = "yes";
        ic.opts["water"] = "dot";
        var firstSetAtoms, complement;
        firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
        complement = me.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateChemicalHbonds(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge );
            var commanddesc;
            if(bSaltbridge) {
                me.resid2ResidhashSaltbridge = ic.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have salt bridges with the selected atoms';
            }
            else {
                me.resid2ResidhashHbond = ic.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            }
            var residues = {}, atomArray = undefined;
            for (var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {};
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            me.saveSelectionIfSelected();
            ic.draw();
        }
    },
    showIonicInteractions: function (threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var me = this, ic = me.icn3d; "use strict";
        if(bHbondCalc) return;
        var hbonds_saltbridge, select;
        hbonds_saltbridge = 'saltbridge';
        select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[hbonds_saltbridge] = "yes";
        var firstSetAtoms, complement;
        firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
        complement = me.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateIonicInteractions(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge );
            var commanddesc;
            me.resid2ResidhashSaltbridge = ic.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have ionic interactions with the selected atoms';
            var residues = {}, atomArray = undefined;
            for (var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {};
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            me.saveSelectionIfSelected();
            ic.draw();
        }
    },
    showHalogenPi: function (threshold, nameArray2, nameArray, bHbondCalc, type, interactionType) { var me = this, ic = me.icn3d; "use strict";
        if(bHbondCalc) return;
        var select = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[interactionType] = "yes";
        var firstSetAtoms, complement;
        firstSetAtoms = me.getAtomsFromNameArray(nameArray2);
        complement = me.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), type, interactionType );
            var commanddesc;
            if(interactionType == 'halogen') {
                me.resid2ResidhashHalogen = ic.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have halogen bonds with the selected atoms';
            }
            else if(interactionType == 'pi-cation') {
                me.resid2ResidhashPication = ic.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have pi-cation interactions with the selected atoms';
            }
            else if(interactionType == 'pi-stacking') {
                me.resid2ResidhashPistacking = ic.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have pi-stacking with the selected atoms';
            }
            var residues = {}, atomArray = undefined;
            for (var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {};
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = interactionType + '_' + firstAtom.serial;
            me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            me.saveSelectionIfSelected();
            ic.draw();
        }
    },
    // show all disulfide bonds
    showSsbonds: function () { var me = this, ic = me.icn3d; "use strict";
         ic.opts["ssbonds"] = "yes";
         var select = 'disulfide bonds';
//         me.removeHlMenus();
         var residues = {}, atomArray = undefined;
         var structureArray = Object.keys(ic.structures);
         for(var s = 0, sl = structureArray.length; s < sl; ++s) {
             var structure = structureArray[s];
             if(ic.ssbondpnts[structure] === undefined) continue;
             for (var i = 0, lim = Math.floor(ic.ssbondpnts[structure].length / 2); i < lim; i++) {
                var res1 = ic.ssbondpnts[structure][2 * i], res2 = ic.ssbondpnts[structure][2 * i + 1];
                residues[res1] = 1;
                residues[res2] = 1;
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[res1]);
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[res2]);
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
            ic.draw();
        }
    },
    // show all cross-linkages bonds
    showClbonds: function () { var me = this, ic = me.icn3d; "use strict";
         ic.opts["clbonds"] = "yes";
         var select = 'cross linkage';
         // find all bonds to chemicals
         var residues = ic.applyClbondsOptions();
         for(var resid in residues) {
             ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);
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
            ic.draw();
         }
    },
    addLine: function (x1, y1, z1, x2, y2, z2, color, dashed, type) { var me = this, ic = me.icn3d; "use strict";
        var line = {}; // Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
        line.position1 = new THREE.Vector3(x1, y1, z1);
        line.position2 = new THREE.Vector3(x2, y2, z2);
        line.color = color;
        line.dashed = dashed;
        if(ic.lines[type] === undefined) ic.lines[type] = [];
        if(type !== undefined) {
            ic.lines[type].push(line);
        }
        else {
            ic.lines['custom'].push(line);
        }
        ic.removeHlObjects();
        //ic.draw();
    },
    back: function () { var me = this, ic = me.icn3d; "use strict";
      me.backForward = true;
      me.STATENUMBER--;
      // do not add to the array ic.commands
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
    forward: function () { var me = this, ic = me.icn3d; "use strict";
      me.backForward = true;
      me.STATENUMBER++;
      // do not add to the array ic.commands
      me.bAddCommands = false;
      me.bAddLogs = false; // turn off log
      me.bNotLoadStructure = true;
      if(me.STATENUMBER > ic.commands.length) {
        me.STATENUMBER = ic.commands.length;
      }
      else {
        me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER, true);
      }
      me.adjustIcon();
      me.bAddCommands = true;
      me.bAddLogs = true;
    },
    toggleSelection: function () { var me = this, ic = me.icn3d; "use strict";
        if(me.bHideSelection) {
            for(var i in ic.dAtoms) {
                if(ic.hAtoms.hasOwnProperty(i)) delete ic.dAtoms[i];
            }
              me.bHideSelection = false;
        }
        else {
            ic.dAtoms = ic.unionHash(ic.dAtoms, ic.hAtoms);
              me.bHideSelection = true;
        }
        ic.draw();
    },
    adjustIcon: function () { var me = this, ic = me.icn3d; "use strict";
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
      if(me.STATENUMBER === ic.commands.length) {
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
    toggle: function (id1, id2, id3, id4) { var me = this, ic = me.icn3d; "use strict";
      var itemArray = [id1, id2];
      for(var i in itemArray) {
          var item = itemArray[i];
          $("#" + item).toggleClass('ui-icon-plus');
          $("#" + item).toggleClass('ui-icon-minus');
      }

      itemArray = [id1, id2, id3, id4];
      for(var i in itemArray) {
          var item = itemArray[i];
          $("#" + item).toggleClass('icn3d-shown');
          $("#" + item).toggleClass('icn3d-hidden');
      }
    },
    selectComplement: function() { var me = this, ic = me.icn3d; "use strict";
           var complement = {};
           for(var i in ic.atoms) {
               if(!ic.hAtoms.hasOwnProperty(i)) {
                   complement[i] = 1;
               }
           }
           ic.hAtoms = ic.cloneHash(complement);
           //me.highlightResidues(Object.keys(residueHash), Object.keys(chainHash));
           me.updateHlAll();
    },
    saveCommandsToSession: function() { var me = this, ic = me.icn3d; "use strict";
        var dataStr = ic.commands.join('\n');
        var data = decodeURIComponent(dataStr);
        sessionStorage.setItem('commands', data);
    },
    addChainLabels: function (atoms) { var me = this, ic = me.icn3d; "use strict";
        var size = 18;
        var background = "#CCCCCC";
        var atomsHash = ic.intHash(ic.hAtoms, atoms);
        if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
        var chainHash = ic.getChainsFromAtoms(atomsHash);
        for(var chainid in chainHash) {
            var label = {};
            label.position = ic.centerAtoms(ic.chains[chainid]).center;
            var pos = chainid.indexOf('_');
            var chainName = chainid.substr(pos + 1);
            var proteinName = me.getProteinName(chainid);
            if(proteinName.length > 20) proteinName = proteinName.substr(0, 20) + '...';
            label.text = 'Chain ' + chainName + ': ' + proteinName;
            label.size = size;
            var atomColorStr = ic.getFirstCalphaAtomObj(ic.chains[chainid]).color.getHexString().toUpperCase();
            label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;
            ic.labels['chain'].push(label);
        }
        ic.removeHlObjects();
    },
    addTerminiLabels: function (atoms) { var me = this, ic = me.icn3d; "use strict";
        var size = 18;
        var background = "#CCCCCC";
        var protNucl;
        protNucl = ic.unionHash(protNucl, ic.proteins);
        protNucl = ic.unionHash(protNucl, ic.nucleotides);
        var hlProtNucl = ic.intHash(ic.dAtoms, protNucl);
        var atomsHash = ic.intHash(hlProtNucl, atoms);
        if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
        var chainHash = ic.getChainsFromAtoms(atomsHash);
        for(var chainid in chainHash) {
            var chainAtomsHash = ic.intHash(hlProtNucl, ic.chains[chainid]);
            var serialArray = Object.keys(chainAtomsHash);
            var firstAtom = ic.atoms[serialArray[0]];
            var lastAtom = ic.atoms[serialArray[serialArray.length - 1]];
            var labelN = {}, labelC = {};
            labelN.position = firstAtom.coord;
            labelC.position = lastAtom.coord;
            labelN.text = 'N-';
            labelC.text = 'C-';
            if(ic.nucleotides.hasOwnProperty(firstAtom.serial)) {
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
            ic.labels['chain'].push(labelN);
            ic.labels['chain'].push(labelC);
        }
        ic.removeHlObjects();
    },
    //http://jasonjl.me/blog/2015/06/21/taking-action-on-browser-crashes/
    getCommandsBeforeCrash: function() { var me = this, ic = me.icn3d; "use strict";
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
    addLineFromPicking: function(type) { var me = this, ic = me.icn3d; "use strict";
             var size = 0, background = 0;
             var color = $("#" + me.pre + type + "color" ).val();
             var x = (ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
             var y = (ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
             var z = (ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
             var dashed = (type == 'stabilizer') ? false : true;
             me.setLogCmd('add line | x1 ' + ic.pAtom.coord.x.toPrecision(4)  + ' y1 ' + ic.pAtom.coord.y.toPrecision(4) + ' z1 ' + ic.pAtom.coord.z.toPrecision(4) + ' | x2 ' + ic.pAtom2.coord.x.toPrecision(4)  + ' y2 ' + ic.pAtom2.coord.y.toPrecision(4) + ' z2 ' + ic.pAtom2.coord.z.toPrecision(4) + ' | color ' + color + ' | dashed ' + dashed + ' | type ' + type, true);
             me.addLine(ic.pAtom.coord.x, ic.pAtom.coord.y, ic.pAtom.coord.z, ic.pAtom2.coord.x, ic.pAtom2.coord.y, ic.pAtom2.coord.z, color, dashed, type);
             ic.pickpair = false;
    },
    setEntrezLinks: function(db) { var me = this, ic = me.icn3d; "use strict";
      var structArray = Object.keys(ic.structures);
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
    shareLink: function(bPngHtml) { var me = this, ic = me.icn3d; "use strict";
           var url = me.shareLinkUrl();
           var bTooLong = (url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
           if(bPngHtml) url += "&random=" + parseInt(Math.random() * 1000); // generate a new shorten URL and thus image name everytime
           //var inputid = (me.inputid) ? me.inputid : "custom";
           var inputid = Object.keys(ic.structures).join('_');
           if(!bPngHtml) {
               if(me.bInputfile && !me.bInputUrlfile) {
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
                        text += '<a href="https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + shortName + '" target="_blank">';
                        text += '<img style="height:300px" src ="' + inputid + '-' + shortName + '.png"><br>\n';
                        text += '<!--Start of your comments==================-->\n';
                        var yournote = (me.yournote) ? ': ' + me.yournote.replace(/\n/g, "<br>").replace(/; /g, ", ") : '';
                        text += 'PDB ' + inputid.toUpperCase() + yournote + '\n';
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
                if(!bPngHtml) me.openDlg('dl_copyurl', 'Copy a Share Link URL');
              },
              error : function(xhr, textStatus, errorThrown ) {
                var shorturl = 'Problem in getting shortened URL';
                $("#" + me.pre + "ori_url").val(url);
                $("#" + me.pre + "short_url").val(shorturl);
                if(!bPngHtml) me.openDlg('dl_copyurl', 'Copy a Share Link URL');
              }
           });
    },
    exportInteractions: function() { var me = this, ic = me.icn3d; "use strict";
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
    exportSsbondPairs: function() { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        var cnt = 0;
        for(var structure in ic.structures) {
            var ssbondArray = ic.ssbondpnts[structure];
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
    exportClbondPairs: function() { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        var cnt = 0;
        var residHash = {};
        for(var structure in ic.structures) {
            var clbondArray = ic.clbondpnts[structure];
            if(clbondArray === undefined) {
                break;
            }
            for(var i = 0, il = clbondArray.length; i < il; i = i + 2) {
                var resid1 = clbondArray[i];
                var resid2 = clbondArray[i+1];
                if(!residHash.hasOwnProperty(resid1 + '_' + resid2)) {
                    var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
                    var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
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
    getGraphLinks: function(hash1, hash2, color, labelType, value) { var me = this, ic = me.icn3d; "use strict";
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
            var resName1 = ic.residueName2Abbr(resid1.substr(0, pos1a)) + resid1.substr(pos1b + 1, pos1c - pos1b - 1);
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
                var resName2 = ic.residueName2Abbr(resid2.substr(0, pos2a)) + resid2.substr(pos2b + 1, pos2c - pos2b - 1); //
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
    convertLabel2Resid: function(residLabel) { var me = this, ic = me.icn3d; "use strict";
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
    exportHbondPairs: function(type, labelType) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in me.resid2ResidhashHbond) {
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            for(var resid2 in me.resid2ResidhashHbond[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
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
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = me.getGraphLinks(me.resid2ResidhashHbond, me.resid2ResidhashHbond, me.hbondColor, labelType, me.hbondValue);
            return hbondStr;
        }
        else {
            return text;
        }
    },
    exportSaltbridgePairs: function(type, labelType) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        var cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in me.resid2ResidhashSaltbridge) {
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            for(var resid2 in me.resid2ResidhashSaltbridge[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
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
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = me.getGraphLinks(me.resid2ResidhashSaltbridge, me.resid2ResidhashSaltbridge, me.ionicColor, labelType, me.ionicValue);
            return hbondStr;
        }
        else {
            return text;
        }
    },
    exportHalogenPiPairs: function(type, labelType, interactionType) { var me = this, ic = me.icn3d; "use strict";
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
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            for(var resid2 in resid2Residhash[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
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
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var hbondStr = me.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
            return hbondStr;
        }
        else {
            return text;
        }
    },
    exportSpherePairs: function(bInteraction, type, labelType) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        var cnt = 0;
        var residHash = (bInteraction) ? me.resid2ResidhashInteractions : me.resid2ResidhashSphere;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        for(var resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            for(var resid2 in residHash[resid1]) {
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = atom2.color.getHexString();
                var dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                atom1 = dist1_dist2_atom1_atom2[2];
                atom2 = dist1_dist2_atom1_atom2[3];
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
        if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
            var interStr = me.getGraphLinks(residHash, residHash, me.contactColor, labelType, me.contactValue);
            return interStr;
        }
        else {
            return text;
        }
    },
    saveColor: function() { var me = this, ic = me.icn3d; "use strict";
       for(var i in ic.atoms) {
           var atom = ic.atoms[i];
           atom.colorSave = atom.color.clone();
       }
    },
    applySavedColor: function() { var me = this, ic = me.icn3d; "use strict";
       for(var i in ic.atoms) {
           var atom = ic.atoms[i];
           if(atom.colorSave !== undefined) {
               atom.color = atom.colorSave.clone();
           }
       }
       ic.draw();
       me.changeSeqColor(Object.keys(ic.residues));
    },
    saveStyle: function() { var me = this, ic = me.icn3d; "use strict";
       for(var i in ic.atoms) {
           var atom = ic.atoms[i];
           atom.styleSave = atom.style;
           if(atom.style2 !== undefined) atom.style2Save = atom.style2;
       }
    },
    applySavedStyle: function() { var me = this, ic = me.icn3d; "use strict";
       for(var i in ic.atoms) {
           var atom = ic.atoms[i];
           if(atom.styleSave !== undefined) {
               atom.style = atom.styleSave;
           }
           if(atom.style2Save !== undefined) {
               atom.style2 = atom.style2Save;
           }
       }
       ic.draw();
    },
    showHydrogens: function() { var me = this, ic = me.icn3d; "use strict";
       // get hydrogen atoms for currently selected atoms
       for(var i in ic.hAtoms) {
           var atom = ic.atoms[i];
           if(atom.name !== 'H') {
               ic.atoms[atom.serial].bonds = ic.atoms[atom.serial].bonds2.concat();
               ic.atoms[atom.serial].bondOrder = ic.atoms[atom.serial].bondOrder2.concat();
               for(var j = 0, jl = ic.atoms[atom.serial].bonds.length; j < jl; ++j) {
                   var serial = ic.atoms[atom.serial].bonds[j];
                   if(ic.atoms[serial].name === 'H') {
                       ic.dAtoms[serial] = 1;
                       ic.hAtoms[serial] = 1;
                   }
               }
           }
       }
    },
    hideHydrogens: function() { var me = this, ic = me.icn3d; "use strict";
       // remove hydrogen atoms for currently selected atoms
       for(var i in ic.hAtoms) {
           var atom = ic.atoms[i];
           if(atom.name === 'H') {
               if(ic.atoms[atom.serial].bonds.length > 0) {
                   var otherSerial = ic.atoms[atom.serial].bonds[0];
                   //ic.atoms[atom.serial].bonds = [];
                   var pos = ic.atoms[otherSerial].bonds.indexOf(atom.serial);
                   if(pos !== -1) {
                       ic.atoms[otherSerial].bonds.splice(pos, 1);
                       ic.atoms[otherSerial].bondOrder.splice(pos, 1);
                   }
               }
               delete ic.dAtoms[atom.serial];
               delete ic.hAtoms[atom.serial];
           }
       }
    },
    showAll: function() { var me = this, ic = me.icn3d; "use strict";
           ic.dAtoms = ic.cloneHash(ic.atoms);
           ic.maxD = ic.oriMaxD;
           ic.draw();
    },
    saveSelectionPrep: function() { var me = this, ic = me.icn3d; "use strict";
           if(!me.cfg.notebook) {
               if(!$('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) {
                 me.openDlg('dl_definedsets', 'Select sets');
                 $("#" + me.pre + "atomsCustom").resizable();
               }
           }
           else {
               $('#' + me.pre + 'dl_definedsets').show();
               $("#" + me.pre + "atomsCustom").resizable();
           }
           me.bSelectResidue = false;
           me.bSelectAlignResidue = false;
    },
    selectOneResid: function(idStr, bUnchecked) { var me = this, ic = me.icn3d; "use strict";
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
      for(var j in ic.residues[resid]) {
          if(bUnchecked) {
              delete ic.hAtoms[j];
          }
          else {
              ic.hAtoms[j] = 1;
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
    openFullscreen: function(elem) { var me = this, ic = me.icn3d; "use strict";
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
    setIcn3dui: function(id) { var me = this, ic = me.icn3d; "use strict";
           var idArray = id.split('_'); // id: div0_reload_pdbfile
           me.pre = idArray[0] + "_";
           if(window.icn3duiHash !== undefined && window.icn3duiHash.hasOwnProperty(idArray[0])) { // for multiple 3D display
              me = window.icn3duiHash[idArray[0]];
           }
           return me;
    },
    exportStlFile: function(postfix) { var me = this, ic = me.icn3d; "use strict";
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
            // use a smaller grid to build the surface for assembly
            ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
            ic.removeSurfaces();
            ic.applySurfaceOptions();
            ic.removeMaps();
            ic.applyMapOptions();
            ic.removeEmmaps();
            ic.applyEmmapOptions();
       }
       var text = me.saveStlFile();
       var file_pref = (me.inputid) ? me.inputid : "custom";
       me.saveFile(file_pref + postfix + '.stl', 'binary', text);
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
            alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
            var identity = new THREE.Matrix4();
            identity.identity();
            var index = 1;
            for (var i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              var mat = ic.biomtMatrices[i];
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
            ic.threshbox = 180;
       }
    },
    exportVrmlFile: function(postfix) { var me = this, ic = me.icn3d; "use strict";
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
            // use a smaller grid to build the surface for assembly
            ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
            ic.removeSurfaces();
            ic.applySurfaceOptions();
            ic.removeMaps();
            ic.applyMapOptions();
            ic.removeEmmaps();
            ic.applyEmmapOptions();
       }
       var text = me.saveVrmlFile();
       var file_pref = (me.inputid) ? me.inputid : "custom";
       //me.saveFile(file_pref + postfix + '.wrl', 'text', text);
       me.saveFile(file_pref + postfix + '.vrml', 'text', text);
       // assemblies
       if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
         && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
            alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
            var identity = new THREE.Matrix4();
            identity.identity();
            var index = 1;
            for (var i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
              var mat = ic.biomtMatrices[i];
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
            ic.threshbox = 180;
       }
    },
    replayon: function() { var me = this, ic = me.icn3d; "use strict";
      me.CURRENTNUMBER = 0;
      me.bReplay = 1;
      $("#" + me.pre + "replay").show();
      me.closeDialogs();
      // remove surface
      ic.prevSurfaces = [];
      ic.prevMaps = [];
      ic.prevEmmaps = [];
      ic.prevPhimaps = [];
      // remove lines and labels
      ic.labels = {};     // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                            // label name could be custom, residue, schmatic, distance
      ic.lines = {};     // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
      //remove side chains
      for(var i in ic.atoms) {
          ic.atoms[i].style2 = undefined;
      }
      // select all
      me.selectAll();
      me.renderFinalStep(1);
      var currentNumber = me.CURRENTNUMBER;
      var pos = ic.commands[currentNumber].indexOf(' | ');
      var cmdStrOri = ic.commands[currentNumber].substr(0, pos);
      var maxLen = 20;
      var cmdStr = (cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;
      var menuStr = me.getMenuFromCmd(cmdStr); // 'File > Retrieve by ID, Align';
      $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
      $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);
    },
    replayoff: function() { var me = this, ic = me.icn3d; "use strict";
        me.bReplay = 0;
        $("#" + me.pre + "replay").hide();
        // replay all steps
        ++me.CURRENTNUMBER;
        me.execCommands(me.CURRENTNUMBER, me.STATENUMBER-1, me.STATENUMBER);
    },
    selectProperty: function(property, from, to) { var me = this, ic = me.icn3d; "use strict";
        var prevHAtoms = ic.cloneHash(ic.hAtoms);
        if(property == 'positive') {
            var select = ':r,k,h';
            ic.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'negative') {
            var select = ':d,e';
            ic.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'hydrophobic') {
            var select = ':w,f,y,l,i,c,m';
            ic.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'polar') {
            var select = ':g,v,s,t,a,n,p,q';
            ic.hAtoms = {};
            me.selectBySpec(select, select, select);
        }
        else if(property == 'b factor') {
            var atoms = ic.cloneHash(ic.calphas);
            atoms = ic.unionHash(atoms, ic.nucleotidesO3);
            atoms = ic.unionHash(atoms, ic.chemicals);
            atoms = ic.unionHash(atoms, ic.ions);
            atoms = ic.unionHash(atoms, ic.water);
            ic.hAtoms = {};
            for(var i in atoms) {
                var atom = ic.atoms[i];
                if(atom.b >= from && atom.b <= to) {
                    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[atom.structure + '_' + atom.chain + '_' + atom.resi]);
                }
            }
        }
        else if(property == 'percent out') {
           ic.bCalcArea = true;
           ic.opts.surface = 'solvent accessible surface';
           ic.applySurfaceOptions();
           ic.bCalcArea = false;
           ic.hAtoms = {};
           for(var resid in ic.resid2area) { // resid: structure_chain_resi_resn
                var idArray = resid.split('_');
                if(ic.residueArea.hasOwnProperty(idArray[3])) {
                    var percent = parseInt(ic.resid2area[resid] / ic.residueArea[idArray[3]] * 100);
                    if(percent >= from && percent <= to) {
                        var residReal = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
                        ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[residReal]);
                    }
                }
           }
        }
        ic.hAtoms = ic.intHash(ic.hAtoms, prevHAtoms);
        ic.draw();
        me.updateHlAll();
    },
    toggleMembrane: function() { var me = this, ic = me.icn3d; "use strict";
        var structure = Object.keys(ic.structures)[0];
        var atomsHash = ic.residues[structure + '_MEM_1'];
        var firstAtom = ic.getFirstAtomObj(atomsHash);
        var oriStyle = firstAtom.style;
        if(!ic.dAtoms.hasOwnProperty(firstAtom.serial)) {
            // add membrane to displayed atoms if the membrane is not part of the display
            ic.dAtoms = ic.unionHash(ic.dAtoms, atomsHash);
            oriStyle = 'nothing';
        }
        for(var i in atomsHash) {
            var atom = ic.atoms[i];
            if(oriStyle !== 'nothing') {
                atom.style = 'nothing';
            }
            else {
                atom.style = 'stick';
            }
        }
        ic.draw();
    },
    setCustomFile: function(type) { var me = this, ic = me.icn3d; "use strict";
       var chainid = $("#" + me.pre + "customcolor_chainid").val();
       var file = $("#" + me.pre + "cstcolorfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.checkFileAPI();
         var reader = new FileReader();
         reader.onload = function (e) { var ic = me.icn3d;
            var dataStr = e.target.result; // or = reader.result;
            var lineArray = dataStr.split('\n');
            if(ic.queryresi2score === undefined) ic.queryresi2score = {};
            //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {};
            ic.queryresi2score[chainid] = {};
            for(var i = 0, il = lineArray.length; i < il; ++i) {
                if(lineArray[i].trim() !== '') {
                    var columnArray = lineArray[i].split(/\s+/);
                    ic.queryresi2score[chainid][columnArray[0]] = columnArray[1];
                }
            }
            var resiArray = Object.keys(ic.queryresi2score[chainid]);
            var start = Math.min.apply(null, resiArray);
            var end = Math.max.apply(null, resiArray);
            var resiScoreStr = '';
            for(var resi = start; resi <= end; ++resi) {
                if(ic.queryresi2score[chainid].hasOwnProperty(resi)) {
                    resiScoreStr += Math.round(ic.queryresi2score[chainid][resi]/11); // max 9
                }
                else {
                    resiScoreStr += '_';
                }
            }
            if(type == 'color') {
                ic.opts['color'] = 'align custom';
                ic.setColorByOptions(ic.opts, ic.hAtoms);
                me.updateHlAll();
                me.setLogCmd('custom tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }
            else if(type == 'tube') {
                me.setStyle('proteins', 'custom tube');
                me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            }
            ic.draw();
         };
         reader.readAsText(file);
       }
    },
    setBackground: function(color) { var me = this, ic = me.icn3d; "use strict";
       me.setOption('background', color);
       me.setLogCmd('set background ' + color, true);
       var titleColor = (color == 'black' || color == 'transparent') ? me.GREYD : 'black';
       $("#" + me.pre + "title").css("color", titleColor);
       $("#" + me.pre + "titlelink").css("color", titleColor);
    },
    calculateArea: function() { var me = this, ic = me.icn3d; "use strict";
       ic.bCalcArea = true;
       ic.opts.surface = 'solvent accessible surface';
       ic.applySurfaceOptions();
       $("#" + me.pre + "areavalue").val(ic.areavalue);
       $("#" + me.pre + "areatable").html(ic.areahtml);
       me.openDlg('dl_area', 'Surface area calculation');
       ic.bCalcArea = false;
    },
    hideHbondsContacts: function() { var me = this, ic = me.icn3d; "use strict";
           var select = "set hbonds off";
           me.setLogCmd(select, true);
           ic.hideHbonds();
           //ic.draw();
           select = "set salt bridge off";
           me.setLogCmd(select, true);
           ic.hideSaltbridge();
           select = "set contact off";
           me.setLogCmd(select, true);
           ic.hideContact();
           select = "set halogen pi off";
           me.setLogCmd(select, true);
           ic.hideHalogenPi();
    },
    retrieveInteractionData: function() { var me = this, ic = me.icn3d; "use strict";
         if(!me.b2DShown) {
             if(me.cfg.align !== undefined) {
                 var structureArray = Object.keys(ic.structures);
                 me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
             }
             else if(me.cfg.chainalign !== undefined) {
                 var structureArray = Object.keys(ic.structures);
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
    loadDsn6File: function(type) { var me = this, ic = me.icn3d; "use strict";
       var file = $("#" + me.pre + "dsn6file" + type)[0].files[0];
       var sigma = $("#" + me.pre + "dsn6sigma" + type).val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.checkFileAPI();
         var reader = new FileReader();
         reader.onload = function (e) { var ic = me.icn3d;
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
    checkFileAPI: function() { var me = this, ic = me.icn3d; "use strict";
         if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }
    },
    loadPhiFile: function(type) { var me = this, ic = me.icn3d; "use strict";
       var file = $("#" + me.pre + type + "file")[0].files[0];
       var contour = $("#" + me.pre + "phicontour").val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.checkFileAPI();
         var reader = new FileReader();
         reader.onload = function (e) { var ic = me.icn3d;
           var data = e.target.result; // or = reader.result;
           if(type == 'phi') {
             me.loadPhiData(data, contour);
           }
           else {
             me.loadCubeData(data, contour);
           }

           me.bAjaxPhi = true;
           me.setOption('phimap', 'phi');
           me.setLogCmd('load ' + type + ' file ' + $("#" + me.pre + type + "file").val(), false);
         };
         if(type == 'phi') {
             reader.readAsArrayBuffer(file);
         }
         else {
             reader.readAsText(file);
         }
       }
    },
    loadPhiFileUrl: function(type) { var me = this, ic = me.icn3d; "use strict";
       var url = $("#" + me.pre + type + "file").val();
       var contour = $("#" + me.pre + "phiurlcontour").val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           me.PhiParserBase(url, type, contour);
           me.setLogCmd('set phimap ' + type + ' contour ' + contour + ' | ' + encodeURIComponent(url), true);
       }
    },
    loadDsn6FileUrl: function(type) { var me = this, ic = me.icn3d; "use strict";
       var url = $("#" + me.pre + "dsn6fileurl" + type).val();
       var sigma = $("#" + me.pre + "dsn6sigmaurl" + type).val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           me.Dsn6ParserBase(url, type, sigma);
           me.setLogCmd('set map ' + type + ' sigma ' + sigma + ' | ' + encodeURIComponent(url), true);
       }
    },
    adjustMembrane: function(extra_mem_z, intra_mem_z) { var me = this, ic = me.icn3d; "use strict";
        for(var i in ic.chains[me.inputid.toUpperCase() + '_MEM']) {
            var atom = ic.atoms[i];
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
        ic.draw();
    },
    selectBtwPlanes: function(large, small) { var me = this, ic = me.icn3d; "use strict";
        if(large < small) {
            var tmp = small;
            small = large;
            large = tmp;
        }
        var residueHash = {};
        for(var i in ic.atoms) {
            var atom = ic.atoms[i];
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
    calcBuriedSurface: function(nameArray2, nameArray) { var me = this, ic = me.icn3d; "use strict";
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           var prevHAtoms = ic.cloneHash(ic.hAtoms);
           var atomSet2 = me.getAtomsFromNameArray(nameArray2);
           var atomSet1 = me.getAtomsFromNameArray(nameArray);
           ic.bCalcArea = true;
           ic.opts.surface = 'solvent accessible surface';
           ic.hAtoms = ic.cloneHash(atomSet2);
           ic.applySurfaceOptions();
           var area2 = ic.areavalue;
           ic.hAtoms = ic.cloneHash(atomSet1);
           ic.applySurfaceOptions();
           var area1 = ic.areavalue;
           ic.hAtoms = ic.unionHash(ic.hAtoms, atomSet2);
           ic.applySurfaceOptions();
           var areaTotal = ic.areavalue;
           ic.bCalcArea = false;
           ic.hAtoms = ic.cloneHash(prevHAtoms);
           var buriedArea = (parseFloat(area1) + parseFloat(area2) - parseFloat(areaTotal)).toFixed(2);
           var html = '<br>Calculate solvent accessible surface area in the interface:<br><br>';
           html += 'Set 1: ' + nameArray2 + ', Surface: ' +  area2 + ' &#8491;<sup>2</sup><br>';
           html += 'Set 2: ' + nameArray + ', Surface: ' +  area1 + ' &#8491;<sup>2</sup><br>';
           html += 'Total Surface: ' +  areaTotal + ' &#8491;<sup>2</sup><br>';
           html += '<b>Buried Surface</b>: ' +  buriedArea + ' &#8491;<sup>2</sup><br><br>';
           $("#" + me.pre + "dl_buriedarea").html(html);
           me.openDlg('dl_buriedarea', 'Buried solvent accessible surface area in the interface');
           me.setLogCmd('buried surface ' + buriedArea, false);
       }
    },
    showInteractions: function(type) { var me = this, ic = me.icn3d; "use strict";
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
           var bHbondCalcStr = (me.bHbondCalc) ? "true" : "false";
           var tmpStr = nameArray2 + " " + nameArray + " | " + interactionTypes + " | " + bHbondCalcStr + " | " + thresholdStr;
           if(type == '3d') {
               me.setLogCmd("display interaction 3d | " + tmpStr, true);
           }
           else if(type == 'view') {
               me.setLogCmd("view interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save1') {
               me.setLogCmd("save1 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save2') {
               me.setLogCmd("save2 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'linegraph') {
               me.setLogCmd("line graph interaction pairs | " + tmpStr, true);
           }
           else if(type == 'scatterplot') {
               me.setLogCmd("scatterplot interaction pairs | " + tmpStr, true);
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
                    + " | " + bHbondCalcStr + " | " + thresholdStr + " | " + dist_ss + " " + dist_coil
                    + " " + dist_hbond + " " + dist_inter + " " + dist_ssbond + " " + dist_ionic
                    + " " + dist_halogen + " " + dist_pication + " " + dist_pistacking, true);
           }
           // avoid repeated calculation
           me.bHbondCalc = true;
       }
    },
    handleForce: function() { var me = this, ic = me.icn3d; "use strict";
       if(me.force == 0 && me.simulation !== undefined) {
           me.simulation.stop();
           me.simulation.force("charge", null);
           me.simulation.force("x", null);
           me.simulation.force("y", null);
           me.simulation.force("r", null);
           me.simulation.force("link", null);
       }
       else {
           me.drawGraph(me.graphStr, me.pre + 'dl_graph');
       }
    },
    resetInteractionPairs: function() { var me = this, ic = me.icn3d; "use strict";
       me.bHbondCalc = false;
       //me.setLogCmd('set calculate hbond false', true);
       me.hideHbondsContacts();
       me.clearHighlight();
       // reset the interaction pairs
       ic.resids2inter = {};
       ic.resids2interAll = {};
    },
    viewInteractionPairs: function(nameArray2, nameArray, bHbondCalc, type,
      bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking) { var me = this, ic = me.icn3d; "use strict";
       // type: view, save, forcegraph
       ic.bRender = false;
       var hAtoms = {};
       var prevHatoms = ic.cloneHash(ic.hAtoms);
       var atomSet1 = me.getAtomsFromNameArray(nameArray2);
       var atomSet2 = me.getAtomsFromNameArray(nameArray);
       var labelType; // residue, chain, structure
       var cntChain = 0, cntStructure = 0;
       for(var structure in ic.structures) {
           var bStructure = false;
           for(var i = 0, il = ic.structures[structure].length; i < il; ++i) {
               var chainid = ic.structures[structure][i];
               for(var serial in ic.chains[chainid]) {
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
           ic.resids2inter = {};
           ic.resids2interAll = {};
       }
       if(bSaltbridge) {
           var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());
           if(!bHbondCalc) {
               ic.hAtoms = ic.cloneHash(prevHatoms);
               //me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, true, type);
               me.showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, true, type);
           }
           hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       }
       if(bHbond) {
           var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());
           if(!bHbondCalc) {
               ic.hAtoms = ic.cloneHash(prevHatoms);
               me.showHbonds(threshold, nameArray2, nameArray, bHbondCalc, undefined, type);
           }
           hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
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
               ic.hAtoms = ic.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'halogen');
           }
           hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
           tableHtml += me.exportHalogenPiPairs(type, labelType, 'halogen');
       }
       if(bPication) {
           var threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());
           if(!bHbondCalc) {
               ic.hAtoms = ic.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-cation');
           }
           hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
           tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-cation');
       }
       if(bPistacking) {
           var threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());
           if(!bHbondCalc) {
               ic.hAtoms = ic.cloneHash(prevHatoms);
               me.showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, 'pi-stacking');
           }
           hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
           //tableHtml += me.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           var tmp = me.exportHalogenPiPairs(type, labelType, 'pi-stacking');
           tableHtml += tmp;
       }
       if(bInteraction) {
           var threshold = parseFloat($("#" + me.pre + "contactthreshold" ).val());
           if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
                if(!bHbondCalc) {
                    ic.hAtoms = ic.cloneHash(prevHatoms);
                    me.pickCustomSphere(threshold, nameArray2, nameArray, bHbondCalc, true, type);
                }
                hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
                tableHtml += me.exportSpherePairs(true, type, labelType);
           }
           else { // contact in a set, atomSet1 same as atomSet2
                if(!bHbondCalc) {
                    var ssAtomsArray = [];
                    var prevSS = '', prevChain = '';
                    var ssAtoms = {};
                    for(var i in atomSet1) {
                        var atom = ic.atoms[i];
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
                    select = "interactions " + threshold + " | sets " + nameArray2 + " " + nameArray + " | true";
                    ic.opts['contact'] = "yes";
                    var residues = {};
                    var resid2ResidhashInteractions = {};
                    for(var i = 0; i < len; ++i) {
                        for(var j = i + 1; j < len; ++j) {
                            ic.hAtoms = ic.cloneHash(prevHatoms);
                            var result = me.pickCustomSphere_base(threshold, ssAtomsArray[i], ssAtomsArray[j], bHbondCalc, true, type, select);
                            residues = ic.unionHash(residues, result.residues);
                            for(var resid in result.resid2Residhash) {
                                resid2ResidhashInteractions[resid] = ic.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                            }
                        }
                    }
                    me.resid2ResidhashInteractions = resid2ResidhashInteractions;
                    var residueArray = Object.keys(residues);
                    ic.hAtoms = {};
                    for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
                      var residueid = residueArray[index];
                      for(var i in ic.residues[residueid]) {
                        ic.hAtoms[i] = 1;
                      }
                    }
                    // do not change the set of displaying atoms
                    //ic.dAtoms = ic.cloneHash(ic.atoms);
                    var commandname, commanddesc;
                    var firstAtom = ic.getFirstAtomObj(residues);
                    if(firstAtom !== undefined) {
                        commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
                        if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + me.pre + "contactthreshold").val() + "A";
                        commanddesc = commandname;
                        me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
                    }
                    me.saveSelectionIfSelected();
                    ic.draw();
                }
                hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
                tableHtml += me.exportSpherePairs(true, type, labelType);
           } // same set
       }
       ic.hAtoms = ic.cloneHash(hAtoms);
       ic.bRender = true;
       //me.updateHlAll();
       ic.draw();
       var residHash, select, commandname, commanddesc;
       residHash = ic.getResiduesFromAtoms(hAtoms);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_all';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       var interface1 = ic.intHash(hAtoms, atomSet1);
       residHash = ic.getResiduesFromAtoms(interface1);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_1';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       var interface2 = ic.intHash(hAtoms, atomSet2);
       residHash = ic.getResiduesFromAtoms(interface2);
       select = "select " + me.residueids2spec(Object.keys(residHash));
       commandname = 'interface_2';
       commanddesc = commandname;
       me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
       //var html = '<div style="text-align:center"><b>Hydrogen Bonds, Salt Bridges, Contacts, Halogen Bonds, &pi;-cation, &pi;-stacking between Two Sets:</b><br>';
       var html = '<div style="text-align:center"><b>' + interactionTypes.join(', ') + ' between Two Sets:</b><br>';
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
       if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') html = '';
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
           $("#" + me.pre + "dl_interactionsorted").html(html);
           me.openDlg('dl_interactionsorted', 'Show sorted interactions');
       }
       else if(type == 'view') {
           $("#" + me.pre + "dl_allinteraction").html(html);
           me.openDlg('dl_allinteraction', 'Show interactions');
       }
       else if(type == 'linegraph') {
           me.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
           var bLine = true;
           me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           me.bLinegraph = true;
           // draw SVG
           var svgHtml = me.drawLineGraph(me.graphStr);
           $("#" + me.pre + "linegraphDiv").html(svgHtml);
       }
       else if(type == 'scatterplot') {
           me.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
           var bLine = true;
           me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           me.bScatterplot = true;
           // draw SVG
           var svgHtml = me.drawLineGraph(me.graphStr, true);
           $("#" + me.pre + "scatterplotDiv").html(svgHtml);
       }
       else if(type == 'graph') {
           // atomSet1 and atomSet2 are in the right order here
           me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
           me.bGraph = true;
           // show only displayed set in 2D graph
           if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(ic.dAtoms).length) {
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
                       var url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/script/graph_d3v4.min.js";
                       $.ajax({
                          url: url2,
                          dataType: "script",
                          cache: true,
                          tryCount : 0,
                          retryLimit : 1,
                          success: function(data2) {
                               me.bD3 = true;
                               $("#" + me.svgid).empty();
                               me.openDlg('dl_graph', 'Force-directed graph');
                               me.drawGraph(me.graphStr, me.pre + 'dl_graph');
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
               me.openDlg('dl_graph', 'Force-directed graph');
               me.drawGraph(me.graphStr, me.pre + 'dl_graph');
           }
       }
       return interactionTypes.toString();
    },
    compResid: function(a, b, type) { var me = this, ic = me.icn3d; "use strict";
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
    getAllInteractionTable: function(type) { var me = this, ic = me.icn3d; "use strict";
        var residsArray = Object.keys(ic.resids2inter);
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
        //ic.resids2inter
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
            labels2dist = ic.resids2inter[resids]['hbond'];
            result = me.getInteractionPairDetails(labels2dist, type, 'hbond');
            strHbond += result.html;
            cntHbond += result.cnt;
            labels2dist = ic.resids2inter[resids]['ionic'];
            result = me.getInteractionPairDetails(labels2dist, type, 'ionic');
            strIonic += result.html;
            cntIonic += result.cnt;
            labels2dist = ic.resids2inter[resids]['contact'];
            result = me.getContactPairDetails(labels2dist, type, 'contact');
            strContact += result.html;
            cntContact += result.cnt;
            labels2dist = ic.resids2inter[resids]['halogen'];
            result = me.getInteractionPairDetails(labels2dist, type, 'halogen');
            strHalegen += result.html;
            cntHalegen += result.cnt;
            labels2dist = ic.resids2inter[resids]['pi-cation'];
            result = me.getInteractionPairDetails(labels2dist, type, 'pi-cation');
            strPication += result.html;
            cntPication += result.cnt;
            labels2dist = ic.resids2inter[resids]['pi-stacking'];
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
            var tmpStr = '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += tmpStr;
            html += tmpStr;
            html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td># Contacts</td><td>Min Distance (&#8491;)</td><td>C-alpha Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
            html += tmpStr;
            html += tmpStr;
            html += tmpStr;
            html += '</tr>';
            html += '</thead><tbody>';
            html += tmpText;
            html += '</tbody></table><br/>';
        }
        return  html;
    },
    getInteractionPerResidue: function(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '';
        tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

        var itemArray = [strHbond, strIonic, strContact, strHalegen, strPication, strPistacking];
        for(var i in itemArray) {
            var item = itemArray[i];
            tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + item + '</table></td>';
        }
        tmpText += '</tr>';
        return tmpText;
    },
    getInteractionPairDetails: function(labels2dist, type, interactionType) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');
                var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                var resid1Real = me.convertLabel2Resid(resid1);
                var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
                var color1 = atom1.color.getHexString();
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
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
    getContactPairDetails: function(labels2dist, type) { var me = this, ic = me.icn3d; "use strict";
        var tmpText = '', cnt = 0;
        var colorText1 = ' <span style="background-color:#';
        var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
        if(labels2dist !== undefined) {
            for(var labels in labels2dist) {
                var resid1_resid2 = labels.split(',');
                var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
                var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
                var resid1Real = me.convertLabel2Resid(resid1);
                var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
                var color1 = atom1.color.getHexString();
                var resid2Real = me.convertLabel2Resid(resid2);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
                var color2 = atom2.color.getHexString();
                var dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
                var dist1 = dist1_dist2_atom1_atom2[0];
                var dist2 = dist1_dist2_atom1_atom2[1];
                var atom1Name = dist1_dist2_atom1_atom2[2];
                var atom2Name = dist1_dist2_atom1_atom2[3];
                var contactCnt = dist1_dist2_atom1_atom2[4];
                tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1Name + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2Name + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
                cnt += parseInt(contactCnt);
            }
        }
        return {html: tmpText, cnt: cnt};
    },
    getGraphData: function(atomSet2, atomSet1, nameArray2, nameArray, html, labelType) { var me = this, ic = me.icn3d; "use strict";
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
       var selectedAtoms = ic.unionHash(ic.cloneHash(atomSet1), atomSet2);
       var chemicalNodeStr = '';
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
           //else {
           //    contactLinkStr += me.getContactLinksForSet(atomSet1, labelType);
           //}
           // add disulfide bonds
           for(var structure in ic.ssbondpnts) {
               for(var i = 0, il = ic.ssbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = ic.ssbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = ic.ssbondpnts[structure][i+1];
                   var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
                   var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = ic.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       var resName2 = ic.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       disulfideLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.ssbondValue + ', "c": "' + me.ssbondColor + '"}';
                   }
               }
           }
           // add cross linkage
           for(var structure in ic.clbondpnts) {
               for(var i = 0, il = ic.clbondpnts[structure].length; i < il; i += 2) {
                   var resid1 = ic.clbondpnts[structure][i]; //1GPK_A_402
                   var resid2 = ic.clbondpnts[structure][i+1];
                   var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
                   var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
                   if(selectedAtoms.hasOwnProperty(atom1.serial) && selectedAtoms.hasOwnProperty(atom2.serial)) {
                       var resName1 = ic.residueName2Abbr(atom1.resn) + atom1.resi;
                       if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + atom1.chain;
                       if(labelType == 'structure') resName1 += '.' + atom1.structure;
                       var resName2 = ic.residueName2Abbr(atom2.resn) + atom2.resi; // + '_' + atom.chain;
                       if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + atom2.chain;
                       if(labelType == 'structure') resName2 += '.' + atom2.structure;
                       crossLinkStr += ', {"source": "' + resName1 + '", "target": "' + resName2
                           + '", "v": ' + me.clbondValue + ', "c": "' + me.clbondColor + '"}';
                   }
               }
           }
       var resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
       //resStr += linkStr + html + hBondLinkStr + ionicLinkStr + halogenpiLinkStr + disulfideLinkStr + crossLinkStr + contactLinkStr;
       resStr += linkStr + html + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;
       resStr += ']}';
       return resStr;
    },
    drawResNode: function(node, i, r, gap, margin, y, setName, bVertical) { var me = this, ic = me.icn3d; "use strict";
        var x, resid = node.r.substr(4);
        if(bVertical) {
            x = margin - i * (r + gap);
        }
        else {
            x = margin + i * (r + gap);
        }
        var atom = ic.getFirstAtomObj(ic.residues[resid]);
        //var color = "#" + atom.color.getHexString().toUpperCase();
        var color = "#" + node.c.toUpperCase();
        var hlColor = "#" + ic.hColor.getHexString().toUpperCase();
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
        if(bVertical) {
            html += "<circle cx='" + y + "' cy='" + x + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
            html += "<text x='" + (y - 20).toString() + "' y='" + (x + 2).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
        }
        else {
            html += "<circle cx='" + x + "' cy='" + y + "' r='" + r + "' fill='" + color + "' stroke-width='" + strokewidth + "' stroke='" + strokecolor + "' resid='" + resid + "' />";
            html += "<text x='" + (x + adjustx).toString() + "' y='" + (y + adjusty).toString() + "' fill='" + textcolor + "' stroke='none' style='font-size:" + fontsize + "; text-anchor:middle' >" + nodeName + "</text>";
        }
        html += "</g>";
        return html;
    },
    getNodeTopBottom: function(nameHash, name2node, bReverseNode) { var me = this, ic = me.icn3d; "use strict";
        var nodeArray1 = [], nodeArray2 = [];
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
          return me.compNode(a, b, bReverseNode);
        });
        return {"nodeArray1": nodeArray1, "nodeArray2": nodeArray2};
    },
    updateGraphJson: function(struc, index, nodeArray1, nodeArray2, linkArray) { var me = this, ic = me.icn3d; "use strict";
        var lineGraphStr = '';
        lineGraphStr += '"structure' + index + '": {"id": "' + struc + '", "nodes1":[';
        lineGraphStr += me.getJSONFromArray(nodeArray1);
        lineGraphStr += '], \n"nodes2":[';
        lineGraphStr += me.getJSONFromArray(nodeArray2);
        lineGraphStr += '], \n"links":[';
        lineGraphStr += me.getJSONFromArray(linkArray);
        lineGraphStr += ']}';
        return lineGraphStr;
    },
    drawLineGraph: function(lineGraphStr, bScatterplot) { var me = this, ic = me.icn3d; "use strict";
        var html, graph = JSON.parse(lineGraphStr);
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
        var nodeArrays = me.getNodeTopBottom(nameHash, name2node);
        nodeArray1 = nodeArrays.nodeArray1;
        nodeArray2 = nodeArrays.nodeArray2;
        me.lineGraphStr = '{\n';
        if(Object.keys(ic.structures).length > 1) {
            var nodeArray1a = [], nodeArray1b = [], nodeArray2a = [], nodeArray2b = [], nodeArray3a = [], nodeArray3b = [];
            var nodeArray1aTmp = [], nodeArray1bTmp = [], nodeArray2aTmp = [], nodeArray2bTmp = [];
            var struc1 = Object.keys(ic.structures)[0], struc2 = Object.keys(ic.structures)[1];
            var linkArrayA = [], linkArrayB = [], linkArrayAB = [];
            var nameHashA = {}, nameHashB = {}, nameHashAB = {};
            for(var i = 0, il = linkArray.length; i < il; ++i) {
                var link = linkArray[i];
                var nodeA = name2node[link.source];
                var nodeB = name2node[link.target];
                var idArrayA = nodeA.r.split('_'); // 1_1_1KQ2_A_1
                var idArrayB = nodeB.r.split('_'); // 1_1_1KQ2_A_1
                if(idArrayA[2] == struc1 && idArrayB[2] == struc1) {
                    linkArrayA.push(link);
                    nameHashA[link.source] = 1;
                    nameHashA[link.target] = 1;
                }
                else if(idArrayA[2] == struc2 && idArrayB[2] == struc2) {
                    linkArrayB.push(link);
                    nameHashB[link.source] = 1;
                    nameHashB[link.target] = 1;
                }
                else {
                    linkArrayAB.push(link);
                    nameHashAB[link.source] = 1;
                    nameHashAB[link.target] = 1;
                }
            }
            var nodeArraysA = me.getNodeTopBottom(nameHashA, name2node);
            nodeArray1a = nodeArraysA.nodeArray1;
            nodeArray1b = nodeArraysA.nodeArray2;
            var nodeArraysB = me.getNodeTopBottom(nameHashB, name2node);
            nodeArray2a = nodeArraysB.nodeArray1;
            nodeArray2b = nodeArraysB.nodeArray2;
            var nodeArraysAB = me.getNodeTopBottom(nameHashAB, name2node, true);
            nodeArray3a = nodeArraysAB.nodeArray1;
            nodeArray3b = nodeArraysAB.nodeArray2;
            var len1a = nodeArray1a.length, len1b = nodeArray1b.length;
            var len2a = nodeArray2a.length, len2b = nodeArray2b.length;
            var len3a = nodeArray3a.length, len3b = nodeArray3b.length;
            var maxLen = Math.max(len1a, len1b, len2a, len2b, len3a, len3b);
            var strucArray = [];
            if(linkArrayA.length > 0) strucArray.push(struc1);
            if(linkArrayB.length > 0) strucArray.push(struc2);
            if(linkArrayAB.length > 0) strucArray.push(struc1 + '_' + struc2);
            var factor = 1;
            var r = 3 * factor;
            var gap = 7  * factor;
            var height, width, heightAll;
            var marginX = 10, marginY = 10, legendWidth = 30;
            if(bScatterplot) {
                heightAll = (len1a + 2 + len2a + 2) * (r + gap) + 4 * marginY + 2*legendWidth;
                width = (Math.max(len1b, len2b) + 2) * (r + gap) + 2 * marginX + legendWidth;
            }
            else {
                height = 110;
                heightAll = height * strucArray.length;
                width = maxLen * (r + gap) + 2 * marginX;
            }
            var id, graphWidth;
            if(bScatterplot) {
                me.scatterplotWidth = 2 * width;
                graphWidth = me.scatterplotWidth;
                id = me.scatterplotid;
            }
            else {
                me.linegraphWidth = 2 * width;
                graphWidth = me.linegraphWidth;
                id = me.linegraphid;
            }
            html = (strucArray.length == 0) ? "No interactions found for each structure<br><br>" :
              "2D integration graph for structure(s) <b>" + strucArray + "</b><br><br>";
            html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
            var heightFinal = 0;
            if(linkArrayA.length > 0) {
                if(bScatterplot) {
                    heightFinal -= 15;
                    html += me.drawScatterplot_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
                    heightFinal = 15;
                    height = (len1a + 1) * (r + gap) + 2 * marginY;
                }
                else {
                    html += me.drawLineGraph_base(nodeArray1a, nodeArray1b, linkArrayA, name2node, heightFinal);
                }
                heightFinal += height;
                me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1a, nodeArray1b, linkArrayA);
            }
            if(linkArrayB.length > 0) {
                if(bScatterplot) {
                    html += me.drawScatterplot_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
                    height = (len2a + 1) * (r + gap) + 2 * marginY;
                }
                else {
                    html += me.drawLineGraph_base(nodeArray2a, nodeArray2b, linkArrayB, name2node, heightFinal);
                }
                heightFinal += height;
                if(linkArrayA.length > 0) me.lineGraphStr += ', \n';
                me.lineGraphStr += me.updateGraphJson(struc2, 2, nodeArray2a, nodeArray2b, linkArrayB);
            }
            if(linkArrayAB.length > 0 && !bScatterplot) {
                html += me.drawLineGraph_base(nodeArray3a, nodeArray3b, linkArrayAB, name2node, heightFinal);
                if(linkArrayA.length > 0 || linkArrayB.length > 0) me.lineGraphStr += ', \n';
                me.lineGraphStr += '"structure1_2": {"id1": "' + struc1 + '", "id2": "' + struc2 + '", "nodes1":[';
                me.lineGraphStr += me.getJSONFromArray(nodeArray3a);
                me.lineGraphStr += '], \n"nodes2":[';
                me.lineGraphStr += me.getJSONFromArray(nodeArray3b);
                me.lineGraphStr += '], \n"links":[';
                me.lineGraphStr += me.getJSONFromArray(linkArrayAB);
                me.lineGraphStr += ']}';
            }
            html += "</svg>";
        }
        else {
            if(!bScatterplot) {
                var struc1 = Object.keys(ic.structures)[0];
                var len1 = nodeArray1.length, len2 = nodeArray2.length;
                var factor = 1;
                var r = 3 * factor;
                var gap = 7  * factor;
                var height = 110;
                var margin = 10;
                var width = (len1 > len2) ? len1 * (r + gap) + 2 * margin : len2 * (r + gap) + 2 * margin;
                me.linegraphWidth = 2 * width;
                html = (linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + me.linegraphid + "' viewBox='0,0," + width + "," + height + "' width='" + me.linegraphWidth + "px'>";
                html += me.drawLineGraph_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            }
            else {
                var struc1 = Object.keys(ic.structures)[0];
                var len1 = nodeArray1.length, len2 = nodeArray2.length;
                var factor = 1;
                var r = 3 * factor;
                var gap = 7  * factor;
                var height, width, heightAll;
                var marginX = 10, marginY = 10, legendWidth = 30;
                heightAll = (len1 + 2) * (r + gap) + 2 * marginY + legendWidth;
                width = (len2 + 2) * (r + gap) + 2 * marginX + legendWidth;

                var id, graphWidth;
                me.scatterplotWidth = 2 * width;
                graphWidth = me.scatterplotWidth;
                id = me.scatterplotid;
                html = (linkArray.length > 0) ? "" : "No interactions found for these two sets<br><br>";
                html += "<svg id='" + id + "' viewBox='0,0," + width + "," + heightAll + "' width='" + graphWidth + "px'>";
                html += me.drawScatterplot_base(nodeArray1, nodeArray2, linkArray, name2node, 0);
                me.lineGraphStr += me.updateGraphJson(struc1, 1, nodeArray1, nodeArray2, linkArray);
                html += "</svg>";
            }
        }
        me.lineGraphStr += '}\n';
        me.scatterplotStr = me.lineGraphStr;
        if(bScatterplot) {
            $("#" + me.pre + "scatterplotDiv").html(html);
        }
        else {
            $("#" + me.pre + "linegraphDiv").html(html);
        }
        return html;
    },
    getJSONFromArray: function(inArray) { var me = this, ic = me.icn3d; "use strict";
        var jsonStr = '';
        for(var i = 0, il= inArray.length; i < il; ++i) {
            jsonStr += JSON.stringify(inArray[i]);
            if(i != il - 1) jsonStr += ', ';
        }
        return jsonStr;
    },
    drawLineGraph_base: function(nodeArray1, nodeArray2, linkArray, name2node, height) { var me = this, ic = me.icn3d; "use strict";
        var html = '';
        var len1 = nodeArray1.length, len2 = nodeArray2.length;
        var factor = 1;
        var r = 3 * factor;
        var gap = 7  * factor;
        var margin = 10;
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
        var h1 = 30 + height, h2 = 80 + height;
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
            if(pos1 === undefined || pos2 === undefined) continue;
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
        return html;
    },
    drawScatterplot_base: function(nodeArray1, nodeArray2, linkArray, name2node, height) { var me = this, ic = me.icn3d; "use strict";
        var html = '';
        var len1 = nodeArray1.length, len2 = nodeArray2.length;
        var factor = 1;
        var r = 3 * factor;
        var gap = 7  * factor;
        var legendWidth = 30;
        var marginX = 10, marginY = 20;
        var heightTotal = (len1 + 1) * (r + gap) + legendWidth + 2 * marginY;
        var margin1 = height + heightTotal - (legendWidth + marginY + (r+gap)); // y-axis
        var margin2 = legendWidth + marginX + (r+gap); // x-axis
        var x = legendWidth + marginX;
        var nodeHtml = '';
        var node2posSet1 = {}, node2posSet2 = {};
        for(var i = 0; i < len1; ++i) {
            nodeHtml += me.drawResNode(nodeArray1[i], i, r, gap, margin1, x, 'a', true);
            node2posSet1[nodeArray1[i].id] = {x: x, y: margin1 - i * (r + gap)};
        }
        var y = height + heightTotal - (legendWidth + marginY);
        for(var i = 0; i < len2; ++i) {
            nodeHtml += me.drawResNode(nodeArray2[i], i, r, gap, margin2, y, 'b');
            node2posSet2[nodeArray2[i].id] = {x: margin2 + i * (r + gap), y: y};
        }
        // draw rect
        var rectSize = 1.5 * r;
        var halfSize = 0.5 * rectSize;
        for(var i = 0, il = linkArray.length; i < il; ++i) {
            var link = linkArray[i];
            var node1 = name2node[link.source];
            var node2 = name2node[link.target];
            var resid1 = node1.r.substr(4);
            var resid2 = node2.r.substr(4);
            var pos1 = node2posSet1[node1.id];
            var pos2 = node2posSet2[node2.id];
            if(pos1 === undefined || pos2 === undefined) continue;
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
            var linestrokewidth;
            if(link.v == me.contactValue) {
                linestrokewidth = 1;
            }
            else {
                linestrokewidth = 2;
            }
            html += "<g class='icn3d-interaction' resid1='" + resid1 + "' resid2='" + resid2 + "' >";
            html += "<title>Interaction of residue " + node1.id + " with residue " + node2.id + "</title>";
            html += "<rect x='" + (pos2.x - halfSize).toString() + "' y='" + (pos1.y - halfSize).toString() + "' width='" + rectSize + "' height='" + rectSize + "' fill='" + strokecolor + "' fill-opacity='0.6' stroke-width='" + linestrokewidth + "' stroke='" + strokecolor + "' />";
            html += "</g>";
        }
        // show nodes later
        html += nodeHtml;
        return html;
    },
    compNode: function(a, b, bReverseChain) { var me = this, ic = me.icn3d; "use strict";
      var resid1 = a.r.substr(4); // 1_1_1KQ2_A_1
      var resid2 = b.r.substr(4); // 1_1_1KQ2_A_1
      var aIdArray = resid1.split('_');
      var bIdArray = resid2.split('_');
      var aChainid = aIdArray[0] + '_' + aIdArray[1];
      var bChainid = bIdArray[0] + '_' + bIdArray[1];
      var aResi = parseInt(aIdArray[2]);
      var bResi = parseInt(bIdArray[2]);
      if(aChainid > bChainid){
          if(bReverseChain) return -1;
          else return 1;
      }
      else if(aChainid < bChainid){
          if(bReverseChain) return 1;
          else return -1;
      }
      else if(aChainid == bChainid){
        return (aResi > bResi) ? 1 : (aResi < bResi) ? -1 : 0;
      }
    },
    getNodesLinksForSet: function(atomSet, labelType, setName) { var me = this, ic = me.icn3d; "use strict";
       //var nodeStr = '', linkStr = '';
       var nodeArray = [], linkArray = [];
       var cnt = 0, linkCnt = 0;
       var thickness = me.coilValue;
       var prevChain = '', prevResName = '', prevResi = 0, prevAtom;
       // add chemicals as well
       var residHash = {};
       for(var i in atomSet) {
           var atom = ic.atoms[i];
           if(atom.chain != 'DUM' && (atom.het || (atom.name == "CA" && atom.elem == "C") || atom.name == "O3'" || atom.name == "O3*" || atom.name == "P")) {
           // starting nucleotide have "P"
           //if(atom.chain != 'DUM' && (atom.name == "CA" || atom.name == "P")) {
               var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
               if(residHash.hasOwnProperty(resid)) {
                   continue;
               }
               else {
                   residHash[resid] = 1;
               }
               var resName = ic.residueName2Abbr(atom.resn) + atom.resi;
               if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
               if(labelType == 'structure') resName += '.' + atom.structure;
               // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
               var residLabel = '1_1_' + resid;
               //if(cnt > 0) nodeStr += ', ';
               nodeArray.push('{"id": "' + resName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + atom.coord.x.toFixed(0)
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
    getHbondLinksForSet: function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
        var resid2ResidhashHbond = {};
        var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = ic.calculateChemicalHbonds(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2ResidhashHbond = ic.cloneHash(ic.resid2Residhash);
        }
        var hbondStr = me.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.hbondInsideColor, labelType, me.hbondInsideValue);
        return hbondStr;
    },
    getIonicLinksForSet: function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
        var resid2Residhash = {};
        var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());
        // not only protein or nucleotides, could be ligands
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var bSaltbridge = false;
            var selectedAtoms = ic.calculateIonicInteractions(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );
            resid2Residhash = ic.cloneHash(ic.resid2Residhash);
        }
        var ionicStr = me.getGraphLinks(resid2Residhash, resid2Residhash, me.ionicInsideColor, labelType, me.ionicInsideValue);
        return ionicStr;
    },
    getHalogenPiLinksForSet: function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
        var resid2Residhash = {};
        var firstSetAtoms = atoms;
        var complement = firstSetAtoms;
        var halogenpiStr = '', threshold;
        threshold = parseFloat($("#" + me.pre + "halogenthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'halogen', true );
            resid2Residhash = ic.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.halogenInsideColor, labelType, me.halogenInsideValue);
        threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-cation', true );
            resid2Residhash = ic.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.picationInsideColor, labelType, me.picationInsideValue);
        threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-stacking', true );
            resid2Residhash = ic.cloneHash(ic.resid2Residhash);
        }
        halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.pistackingInsideColor, labelType, me.pistackingInsideValue);
        return halogenpiStr;
    },
    getContactLinksForSet: function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
        var ssAtomsArray = [];
        var prevSS = '', prevChain = '';
        var ssAtoms = {};
        for(var i in atoms) {
            var atom = ic.atoms[i];
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
    getContactLinks: function(atomlistTarget, otherAtoms, labelType, bInternal) { var me = this, ic = me.icn3d; "use strict";
        var radius = parseFloat($("#" + me.pre + "contactthreshold" ).val());
        var bGetPairs = true, bInteraction = false;
        var atoms = ic.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction, bInternal);
        var residHash = ic.cloneHash(ic.resid2Residhash);
        var interStr = me.getGraphLinks(residHash, residHash, me.contactInsideColor, labelType, me.contactInsideValue);
        return interStr;
    },
    getSvgXml: function (id) {  var me = this, ic = me.icn3d; "use strict";
        // font is not good
        var svg_data = document.getElementById(id).innerHTML; //put id of your svg element here

        var head = "<svg title=\"graph\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

        //if you have some additional styling like graph edges put them inside <style> tag
        var style = "<style>text {font-family: sans-serif; font-weight: bold; font-size: 18px;}</style>";

        var full_svg = head +  style + svg_data + "</svg>"

        return full_svg;
    },

    saveSvg: function (id, filename) {  var me = this, ic = me.icn3d; "use strict";
        var svg = me.getSvgXml(id);

        var blob = new Blob([svg], {type: "image/svg+xml"});
        saveAs(blob, filename);
    },

    savePng: function (id, filename, width, height) {  var me = this, ic = me.icn3d; "use strict";
        // https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
        var svg = document.getElementById(id);
        var bbox = svg.getBBox();

        var copy = svg.cloneNode(true);
        me.copyStylesInline(copy, svg);
        var canvas = document.createElement("CANVAS");
        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, bbox.width, bbox.height);

        var data = me.getSvgXml(id); //(new XMLSerializer()).serializeToString(copy); //me.getSvgXml();
        var DOMURL = window.URL || window.webkitURL || window;
        var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});

        var img = new Image();
        img.src = DOMURL.createObjectURL(svgBlob);

        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(this.src);

            if(me.isIE()) {
                var blob = canvas.msToBlob();

                saveAs(blob, filename);

                canvas.remove();

                return;
            }
            else {
                canvas.toBlob(function(data) {
                    var blob = data;
                    saveAs(blob, filename);

                    canvas.remove();

                    return;
                });
            }
        };
    }
    // ====== functions end ===============
};
