/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.replayFirstStep = function (currentNumber) { var me = this, ic = me.icn3d; "use strict";
      // fresh start
      ic.reinitAfterLoad();

      ic.opts = ic.cloneHash(me.opts);

      me.execCommandsBase(currentNumber, currentNumber, me.STATENUMBER);

      var pos = ic.commands[currentNumber].indexOf(' | ');
      var cmdStrOri = ic.commands[currentNumber].substr(0, pos);
      var maxLen = 20;
      var cmdStr = (cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;

      var menuStr = me.getMenuFromCmd(cmdStr); // 'File > Retrieve by ID, Align';

      $("#" + me.pre + "replay_cmd").html('Cmd: ' + cmdStr);
      $("#" + me.pre + "replay_menu").html('Menu: ' + menuStr);

      me.bCommandLoad = false;

      // hide "loading ..."
      me.hideLoading();

      ic.bRender = true;
      ic.draw();
};

iCn3DUI.prototype.loadSelection = function (dataStr) { var me = this, ic = me.icn3d; "use strict";
  var nameCommandArray = dataStr.trim().split('\n');

  for(var i = 0, il = nameCommandArray.length; i < il; ++i) {
      var nameCommand = nameCommandArray[i].split('\t');
      var name = nameCommand[0];
      var command = nameCommand[1];

      var pos = command.indexOf(' '); // select ...

      me.selectByCommand(command.substr(pos + 1), name, name);

      me.setLogCmd('select ' + command.substr(pos + 1) + ' | name ' + name, true);
  }
};

iCn3DUI.prototype.setStrengthPara = function(paraArray) { var me = this, ic = me.icn3d; "use strict";
    if(paraArray.length >= 5) {
       var thresholdArray = paraArray[4].split(' ');

       if(thresholdArray.length >= 4) {
           $("#" + me.pre + "hbondthreshold").val(thresholdArray[1]);
           $("#" + me.pre + "saltbridgethreshold").val(thresholdArray[2]);
           $("#" + me.pre + "contactthreshold").val(thresholdArray[3]);
           if(thresholdArray.length >= 7) {
               $("#" + me.pre + "halogenthreshold").val(thresholdArray[4]);
               $("#" + me.pre + "picationthreshold").val(thresholdArray[5]);
               $("#" + me.pre + "pistackingthreshold").val(thresholdArray[6]);
           }
       }
    }

    if(paraArray.length == 6) {
        var thicknessArray = paraArray[5].split(' ');

        if(thicknessArray.length >= 6) {
            $("#" + me.pre + "dist_ss").val(thicknessArray[0]);
            $("#" + me.pre + "dist_coil").val(thicknessArray[1]);
            $("#" + me.pre + "dist_hbond").val(thicknessArray[2]);
            $("#" + me.pre + "dist_inter").val(thicknessArray[3]);
            $("#" + me.pre + "dist_ssbond").val(thicknessArray[4]);
            $("#" + me.pre + "dist_ionic").val(thicknessArray[5]);

            if(thicknessArray.length == 9) {
                $("#" + me.pre + "dist_halogen").val(thicknessArray[6]);
                $("#" + me.pre + "dist_pication").val(thicknessArray[7]);
                $("#" + me.pre + "dist_pistacking").val(thicknessArray[8]);
            }
        }
    }
};

iCn3DUI.prototype.oneStructurePerWindow = function() { var me = this, ic = me.icn3d; "use strict";
    // only display one of the two aligned structures
    var structureArray = Object.keys(ic.structures);
    if(me.cfg.bSidebyside && structureArray.length == 2) {
        var dividArray = Object.keys(window.icn3duiHash);
        var pos = dividArray.indexOf(me.divid);

        var structure = structureArray[pos];
        var chainArray = ic.structures[structure];
        var structAtoms = {};
        for(var i = 0, il = chainArray.length; i < il; ++i) {
            structAtoms = ic.unionHash(structAtoms, ic.chains[chainArray[i]]);
        }

        ic.dAtoms = ic.intHash(structAtoms, ic.dAtoms);
        ic.hAtoms = ic.cloneHash(ic.dAtoms);
    }
};

iCn3DUI.prototype.getAxisColor = function (symbol, order) { var me = this, ic = me.icn3d; "use strict";
    var type = symbol.substr(0, 1);

    //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
    if(type == 'C') { // Cyclic Cn
        return ic.thr(0xFF0000); // red
    }
    else if(type == 'D') { // Dihedral Dn
        if(order == 2) {
            return ic.thr(0x00FFFF); // cyan
        }
        else {
            return ic.thr(0xFF0000); // red
        }
    }
    else if(type == 'T') { // Tetrahedral T
        if(order == 2) {
            return ic.thr(0x00FFFF); // cyan
        }
        else {
            return ic.thr(0x00FF00); // green
        }
    }
    else if(type == 'O') { // Octahedral O
        if(order == 2) {
            return ic.thr(0x00FFFF); // cyan
        }
        else if(order == 3) {
            return ic.thr(0x00FF00); // green
        }
        else {
            return ic.thr(0xFF0000); // red
        }
    }
    else if(type == 'I') { // Icosahedral I
        if(order == 2) {
            return ic.thr(0x00FFFF); // cyan
        }
        else if(order == 3) {
            return ic.thr(0x00FF00); // green
        }
        else {
            return ic.thr(0xFF0000); // red
        }
    }
    else { // Helical H, etc
        return ic.thr(0xFF0000); // red
    }
};

iCn3DUI.prototype.getPolygonColor = function (symbol) { var me = this, ic = me.icn3d; "use strict";
    var type = symbol.substr(0, 1);

    //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
    if(type == 'C') { // Cyclic Cn
        return ic.thr(0xFF8C00); // dark orange
    }
    else if(type == 'D') { // Dihedral Dn
        return ic.thr(0x00FFFF); // cyan
    }
    else if(type == 'T') { // Tetrahedral T
        return ic.thr(0xEE82EE); //0x800080); // purple
    }
    else if(type == 'O') { // Octahedral O
        return ic.thr(0xFFA500); // orange
    }
    else if(type == 'I') { // Icosahedral I
        return ic.thr(0x00FF00); // green
    }
    else { // Helical H, etc
        return ic.thr(0xA9A9A9); // dark grey
    }
};

iCn3DUI.prototype.getThresholdNameArrays = function (commandOri) { var me = this, ic = me.icn3d; "use strict";
    if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
       var prevHAtoms = ic.cloneHash(ic.hAtoms);

       me.setPredefinedInMenu();
       me.bSetChainsAdvancedMenu = true;

       ic.hAtoms = ic.cloneHash(prevHAtoms);
    }

    var paraArray = commandOri.split(' | ');

    var threshold = parseFloat(paraArray[0].substr(paraArray[0].lastIndexOf(' ') + 1));
    var nameArray = [], nameArray2 = [];
    if(paraArray.length >= 2 && paraArray[1].length > 4) { //sets a,b,c e,f,g
        var setsArray = paraArray[1].split(" ");
        if(setsArray.length > 1) nameArray2 = setsArray[1].split(",");
        if(setsArray.length > 2) nameArray = setsArray[2].split(",");
    }
    else {
        nameArray2 = ['selected'];
        nameArray = ['non-selected'];
    }

    var bHbondCalc;
    if(paraArray.length == 3) {
        bHbondCalc = (paraArray[2] == 'true') ? true : false;
    }

    return {'threshold': threshold, 'nameArray2': nameArray2, 'nameArray': nameArray, 'bHbondCalc': bHbondCalc};
};

iCn3DUI.prototype.setQueryresi2score = function(strArray) { var me = this, ic = me.icn3d; "use strict";
    var chainid = strArray[1];
    var start_end = strArray[2].split(' ')[1].split('_');
    var resiScoreStr = strArray[3]; // score 0-9
    if(ic.queryresi2score === undefined) ic.queryresi2score = {};
    //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {};
    ic.queryresi2score[chainid] = {};
    var factor = 100 / 9;
    for(var resi = parseInt(start_end[0]), i = 0; resi <= parseInt(start_end[1]); ++resi, ++i) {
        if(resiScoreStr[i] != '_') {
            ic.queryresi2score[chainid][resi] = parseInt(resiScoreStr[i]) * factor; // convert from 0-9 to 0-100
        }
    }
};
