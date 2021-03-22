/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.replayon = function() { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.replayoff = function() { var me = this, ic = me.icn3d; "use strict";
    me.bReplay = 0;
    $("#" + me.pre + "replay").hide();
    // replay all steps
    ++me.CURRENTNUMBER;
    me.execCommands(me.CURRENTNUMBER, me.STATENUMBER-1, me.STATENUMBER);
};
