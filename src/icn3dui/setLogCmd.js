/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setLogCmd = function (str, bSetCommand, bAddLogs) { var me = this, ic = me.icn3d; "use strict";
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
};
