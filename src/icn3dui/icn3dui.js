/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

var iCn3DUI = function(cfg) { var me = this, ic = me.icn3d; "use strict";
    this.REVISION = '2.24.7';
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
    //me.wifiStr = '<i class="icn3d-wifi" title="requires internet">&nbsp;</i>';
    me.wifiStr = '';
    //me.licenseStr = '<i class="icn3d-license" title="requires license">&nbsp;</i>';
    me.licenseStr = '';
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
    me.opts['phimap']             = 'nothing';            //phi, nothing
    me.opts['phimapwireframe']    = 'yes';                //yes, no
    me.opts['phisurface']         = 'nothing';            //phi, nothing
    me.opts['phisurftype']        = 'nothing';            //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    me.opts['phisurfop']          = '1.0';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    me.opts['phisurfwf']          = 'yes';                //yes, no
    me.opts['chemicals']          = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    me.opts['water']              = 'nothing';            //sphere, dot, nothing
    me.opts['ions']               = 'sphere';             //sphere, dot, nothing
    me.opts['hbonds']             = 'no';                 //yes, no
    me.opts['saltbridge']         = 'no';                 //yes, no
    me.opts['contact']            = 'no';                 //yes, no
    me.opts['halogen']            = 'no';                 //yes, no
    me.opts['pi-cation']          = 'no';                 //yes, no
    me.opts['pi-stacking']        = 'no';                 //yes, no
    //me.opts['stabilizer']         = 'no';                 //yes, no
    me.opts['ssbonds']            = 'yes';                 //yes, no
    me.opts['clbonds']            = 'yes';                 //yes, no
    me.opts['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    me.opts['axis']               = 'no';                 //yes, no
    me.opts['fog']                = 'no';                 //yes, no
    me.opts['slab']               = 'no';                 //yes, no
    me.opts['pk']                 = 'residue';            //no, atom, residue, strand, chain
    me.opts['chemicalbinding']    = 'hide';               //show, hide
    if(me.cfg.align !== undefined) me.opts['color'] = 'identity';
    if(me.cfg.chainalign !== undefined) me.opts['color'] = 'identity';
    if(me.cfg.blast_rep_id !== undefined) me.opts['color'] = 'conservation';
    if(me.cfg.cid !== undefined) me.opts['color'] = 'atom';
    if(me.cfg.options !== undefined) jQuery.extend(me.opts, me.cfg.options);
    me.init();
    me.modifyIcn3d();
};
