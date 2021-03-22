/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadScript = function (dataStr, bStatefile) { var me = this, ic = me.icn3d; "use strict";
  // allow the "loading structure..." message to be shown while loading script
  me.bCommandLoad = true;

  ic.bRender = false;
  ic.bStopRotate = true;

  // firebase dynamic links replace " " with "+". So convert it back
  dataStr = (bStatefile) ? dataStr.replace(/\+/g, ' ') : dataStr.replace(/\+/g, ' ').replace(/;/g, '\n');

  var preCommands = [];
  if(ic.commands.length > 0) preCommands[0] = ic.commands[0];

  var commandArray = dataStr.trim().split('\n');
  ic.commands = commandArray;

  var pos = commandArray[0].indexOf('command=');
  if(bStatefile && pos != -1) {
      var commandFirst = commandArray[0].substr(0, pos - 1);
      ic.commands.splice(0, 1, commandFirst);
  }

  //ic.commands = dataStr.trim().split('\n');
  me.STATENUMBER = ic.commands.length;

  ic.commands = preCommands.concat(ic.commands);
  me.STATENUMBER = ic.commands.length;

/*
  if(bStatefile || me.bReplay) {
      me.CURRENTNUMBER = 0;
  }
  else {
      // skip the first loading step
      me.CURRENTNUMBER = 1;
  }
*/

  me.CURRENTNUMBER = 0;

  if(me.bReplay) {
      me.replayFirstStep(me.CURRENTNUMBER);
  }
  else {
      me.execCommands(me.CURRENTNUMBER, me.STATENUMBER-1, me.STATENUMBER);
  }
};
