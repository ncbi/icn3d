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

// https://gist.github.com/Artistan/c8d9d439c70117c8b9dd3e9bd8822d2c
$.ajaxTransport("+binary", function (options, originalOptions, jqXHR) {
    // check for conditions and support for blob / arraybuffer response type
    if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
        return {
            // create new XMLHttpRequest
            send: function (headers, callback) {
                // setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    responseType = options.responseType || "blob",
                    data = options.data || null;

                xhr.addEventListener('load', function () {
                    var data = {};
                    data[options.dataType] = xhr.response;
                    // make callback and send data
                    callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async);

                // setup custom headers
                for (var i in headers) {
                    xhr.setRequestHeader(i, headers[i]);
                }

                xhr.responseType = responseType;
                xhr.send(data);
            },
            abort: function () {
                jqXHR.abort();
            }
        };
    }
});

//iCn3DUI.prototype = {
//    constructor: iCn3DUI,
    // modify iCn3D function

iCn3DUI.prototype.allCustomEvents = function() { var me = this, ic = me.icn3d; "use strict";
  // add custom events here
};
iCn3DUI.prototype.setCustomDialogs = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";
    return html;
};

// ======= functions start==============

iCn3DUI.prototype.hideMenu = function() { var me = this, ic = me.icn3d; "use strict";
  if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "none";
  if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "none";
  if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "none";
  $("#" + me.pre + "title")[0].style.margin = "10px 0 0 10px";
};
iCn3DUI.prototype.showMenu = function() { var me = this, ic = me.icn3d; "use strict";
  if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "block";
  if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "block";
  if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "block";
  //if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";
};
iCn3DUI.prototype.saveSelectionIfSelected = function (id, value) { var me = this, ic = me.icn3d; "use strict";
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
};

iCn3DUI.prototype.adjustIcon = function () { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.toggle = function (id1, id2, id3, id4) { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.saveCommandsToSession = function() { var me = this, ic = me.icn3d; "use strict";
    var dataStr = ic.commands.join('\n');
    var data = decodeURIComponent(dataStr);
    sessionStorage.setItem('commands', data);
};

//http://jasonjl.me/blog/2015/06/21/taking-action-on-browser-crashes/
iCn3DUI.prototype.getCommandsBeforeCrash = function() { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.addLineFromPicking = function(type) { var me = this, ic = me.icn3d; "use strict";
    var size = 0, background = 0;
    var color = $("#" + me.pre + type + "color" ).val();
    var x = (ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
    var y = (ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
    var z = (ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
    var dashed = (type == 'stabilizer') ? false : true;
    me.setLogCmd('add line | x1 ' + ic.pAtom.coord.x.toPrecision(4)  + ' y1 ' + ic.pAtom.coord.y.toPrecision(4) + ' z1 ' + ic.pAtom.coord.z.toPrecision(4) + ' | x2 ' + ic.pAtom2.coord.x.toPrecision(4)  + ' y2 ' + ic.pAtom2.coord.y.toPrecision(4) + ' z2 ' + ic.pAtom2.coord.z.toPrecision(4) + ' | color ' + color + ' | dashed ' + dashed + ' | type ' + type, true);
    me.addLine(ic.pAtom.coord.x, ic.pAtom.coord.y, ic.pAtom.coord.z, ic.pAtom2.coord.x, ic.pAtom2.coord.y, ic.pAtom2.coord.z, color, dashed, type);
    ic.pickpair = false;
};

iCn3DUI.prototype.saveSelectionPrep = function() { var me = this, ic = me.icn3d; "use strict";
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
};
iCn3DUI.prototype.selectOneResid = function(idStr, bUnchecked) { var me = this, ic = me.icn3d; "use strict";
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
};

iCn3DUI.prototype.setBackground = function(color) { var me = this, ic = me.icn3d; "use strict";
   me.setOption('background', color);
   me.setLogCmd('set background ' + color, true);
   var titleColor = (color == 'black' || color == 'transparent') ? me.GREYD : 'black';
   $("#" + me.pre + "title").css("color", titleColor);
   $("#" + me.pre + "titlelink").css("color", titleColor);
};

iCn3DUI.prototype.checkFileAPI = function() { var me = this, ic = me.icn3d; "use strict";
     if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
     }
};


iCn3DUI.prototype.getIdArray = function(resid) { var me = this, ic = me.icn3d; "use strict";
    //var idArray = resid.split('_');
    var idArray = [];

    if(resid) {
        var pos1 = resid.indexOf('_');
        var pos2 = resid.lastIndexOf('_');
        idArray.push(resid.substr(0, pos1));
        idArray.push(resid.substr(pos1 + 1, pos2 - pos1 - 1));
        idArray.push(resid.substr(pos2 + 1));
    }

    return idArray;
};
iCn3DUI.prototype.compResid = function(a, b, type) { var me = this, ic = me.icn3d; "use strict";
  var aArray = a.split(',');
  var bArray = b.split(',');
  var aIdArray, bIdArray;
  if(type == 'save1') {
    aIdArray = me.getIdArray(aArray[0]); //aArray[0].split('_');
    bIdArray = me.getIdArray(bArray[0]); //bArray[0].split('_');
  }
  else if(type == 'save2') {
    aIdArray = me.getIdArray(aArray[1]); //aArray[1].split('_');
    bIdArray = me.getIdArray(bArray[1]); //bArray[1].split('_');
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
};

iCn3DUI.prototype.getJSONFromArray = function(inArray) { var me = this, ic = me.icn3d; "use strict";
    var jsonStr = '';
    for(var i = 0, il= inArray.length; i < il; ++i) {
        jsonStr += JSON.stringify(inArray[i]);
        if(i != il - 1) jsonStr += ', ';
    }
    return jsonStr;
};

    // ====== functions end ===============
//};
