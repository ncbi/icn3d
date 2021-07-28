/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {UtilsCls} from '../utils/utilsCls.js';

import {ClickMenu} from '../html/clickMenu.js';
import {SetMenu} from '../html/setMenu.js';
import {Dialog} from '../html/dialog.js';
import {SetDialog} from '../html/setDialog.js';
import {Events} from '../html/events.js';
import {AlignSeq} from '../html/alignSeq.js';
import {SetHtml} from '../html/setHtml.js';

class Html {
  constructor(icn3dui) { let me = icn3dui;
    this.icn3dui = icn3dui;

    this.cfg = this.icn3dui.cfg;

    this.opts = {};
    this.opts['background']         = 'transparent';        //transparent, black, grey, white

    this.WIDTH = 400; // total width of view area
    this.HEIGHT = 400; // total height of view area
    this.RESIDUE_WIDTH = 10;  // sequences
    if(me.utilsCls.isMobile() || this.cfg.mobilemenu) {
        this.MENU_HEIGHT = 0;
    }
    else {
        this.MENU_HEIGHT = 40;
    }
    this.LOG_HEIGHT = 40;
    // used to set the position for the log/command textarea
    this.MENU_WIDTH = 750;
    //The width (in px) that was left empty by the 3D viewer. The default is 20px.
    this.LESSWIDTH = 20;
    this.LESSWIDTH_RESIZE = 20;
    //The height (in px) that was left empty by the 3D viewer. The default is 20px.
    this.LESSHEIGHT = 20;

    this.CMD_HEIGHT = 0.8*this.LOG_HEIGHT;
    //this.EXTRAHEIGHT = 2*this.MENU_HEIGHT + this.CMD_HEIGHT;
    this.EXTRAHEIGHT = this.MENU_HEIGHT + this.CMD_HEIGHT;
    if(this.cfg.showmenu != undefined && this.cfg.showmenu == false) {
        //this.EXTRAHEIGHT -= 2*this.MENU_HEIGHT;
        this.EXTRAHEIGHT -= this.MENU_HEIGHT;
    }
    if(this.cfg.showcommand != undefined && this.cfg.showcommand == false) {
        this.EXTRAHEIGHT -= this.CMD_HEIGHT;
    }

    this.GREY8 = "#AAAAAA"; //"#888888"; // style protein grey
    this.GREYB = "#CCCCCC"; //"#BBBBBB";
    this.GREYC = "#DDDDDD"; //"#CCCCCC"; // grey background
    this.GREYD = "#EEEEEE"; //"#DDDDDD";
    this.ORANGE = "#FFA500";

    this.themecolor = 'blue';

    // used in graph
    this.defaultValue = 1;
    this.ssValue = 3;
    this.coilValue = 3;
    this.contactValue = 11;
    this.contactInsideValue = 12;
    this.hbondValue = 13;
    this.hbondInsideValue = 14;
    this.ssbondValue = 4;
    this.ionicValue = 5;
    this.ionicInsideValue = 6;
    this.clbondValue = 15;
    this.halogenValue = 17;
    this.halogenInsideValue = 18;
    this.picationValue = 19;
    this.picationInsideValue = 20;
    this.pistackingValue = 21;
    this.pistackingInsideValue = 22;
    this.contactColor = '888';
    this.contactInsideColor = 'FFF'; //'DDD';
    this.hbondColor = '0F0';
    this.hbondInsideColor = 'FFF'; //'AFA';
    this.ssbondColor = 'FFA500';
    this.ionicColor = '0FF';
    this.ionicInsideColor = 'FFF'; //'8FF';
    this.clbondColor = '006400';
    this.halogenColor = 'F0F';
    this.halogenInsideColor = 'FFF';
    this.picationColor = 'F00';
    this.picationInsideColor = 'FFF';
    this.pistackingColor = '00F';
    this.pistackingInsideColor = 'FFF';
    this.hideedges = 1;
    //this.pushcenter = 0;
    this.force = 4;
    this.simulation = undefined;

    //this.baseUrl = "https://structure.ncbi.nlm.nih.gov/";
    this.baseUrl = "https://www.ncbi.nlm.nih.gov/Structure/";
    this.divStr = "<div id='" + this.icn3dui.pre;
    this.divNowrapStr = "<div style='white-space:nowrap'>";
    this.spanNowrapStr = "<span style='white-space:nowrap'>";
    this.inputTextStr = "<input type='text' ";
    this.inputFileStr = "<input type='file' ";
    this.inputRadioStr = "<input type='radio' ";
    this.inputCheckStr = "<input type='checkbox' ";
    this.optionStr = "<option value=";
    this.buttonStr = "<button id='" + this.icn3dui.pre;
    this.postfix = "2"; // add postfix for the structure of the query protein when align two chains in one protein
    this.space2 = "&nbsp;&nbsp;";
    this.space3 = this.space2 + "&nbsp;";
    this.space4 = this.space2 + this.space2;
    //this.wifiStr = '<i class="icn3d-wifi" title="requires internet">&nbsp;</i>';
    this.wifiStr = '';
    //this.licenseStr = '<i class="icn3d-license" title="requires license">&nbsp;</i>';
    this.licenseStr = '';
    this.closeAc = {collapsible: true, active: false} // close accordion

    this.clickMenuCls = new ClickMenu(this.icn3dui);
    this.setMenuCls = new SetMenu(this.icn3dui);
    this.dialogCls = new Dialog(this.icn3dui);
    this.setDialogCls = new SetDialog(this.icn3dui);
    this.eventsCls = new Events(this.icn3dui);
    this.alignSeqCls = new AlignSeq(this.icn3dui);
    this.setHtmlCls = new SetHtml(this.icn3dui);
  }
}

export {Html}
