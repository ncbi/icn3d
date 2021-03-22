/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.back = function () { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.forward = function () { var me = this, ic = me.icn3d; "use strict";
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
};
