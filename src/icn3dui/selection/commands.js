/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadScript = function (dataStr, bStatefile) { var me = this; //"use strict";
  // allow the "loading structure..." message to be shown while loading script
  me.bCommandLoad = true;

  me.icn3d.bRender = false;
  me.icn3d.bStopRotate = true;

  // firebase dynamic links replace " " with "+". So convert it back
  dataStr = dataStr.replace(/\+/g, ' ').replace(/;/g, '\n');

  var preCommands = [];
  if(me.icn3d.commands.length > 0) preCommands[0] = me.icn3d.commands[0];

  me.icn3d.commands = dataStr.trim().split('\n');
  me.STATENUMBER = me.icn3d.commands.length;

  me.icn3d.commands = preCommands.concat(me.icn3d.commands);
  me.STATENUMBER = me.icn3d.commands.length;

  if(bStatefile) {
      me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER);
  }
  else {
      // skip the first loading step
      me.execCommands(1, me.STATENUMBER-1, me.STATENUMBER);
  }
};

iCn3DUI.prototype.loadSelection = function (dataStr) { var me = this; //"use strict";
  var nameCommandArray = dataStr.trim().split('\n');

  for(var i = 0, il = nameCommandArray.length; i < il; ++i) {
      var nameCommand = nameCommandArray[i].split('\t');
      var name = nameCommand[0];
      var command = nameCommand[1];

      var pos = command.indexOf(' '); // select ...

      me.selectByCommand(command.substr(pos + 1), name, name, false);
  }
};

iCn3DUI.prototype.execCommands = function (start, end, steps) { var me = this; //"use strict";
    me.icn3d.bRender = false;

    // initialize icn3dui
//    me.init();
//    me.icn3d.init();

    // fresh start
    me.icn3d.reinitAfterLoad();

    me.icn3d.opts = me.icn3d.cloneHash(me.opts);

    //me.execCommandsBase(0, steps-1, steps);
    me.execCommandsBase(start, end, steps);
};

iCn3DUI.prototype.execCommandsBase = function (start, end, steps, bFinalStep) { var me = this; //"use strict";
  for(var i=start; i <= end; ++i) {
      var bFinalStep = (i === steps - 1) ? true : false;

      if(me.icn3d.commands[i].indexOf('load') !== -1) {
          if(end === 0 && start === end) {
              if(me.bNotLoadStructure) {
                    me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

                    // end of all commands
                    if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                    if(bFinalStep) me.renderFinalStep(steps);                  }
              else {
                  $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {

                    // end of all commands
                    if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                    if(bFinalStep) me.renderFinalStep(steps);
                  });
              }
              return;
          }
          else {
              if(me.bNotLoadStructure) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

                  // undo/redo requires render the first step
                  if(me.backForward) me.renderFinalStep(1);

                  me.execCommandsBase(i + 1, end, steps);
              }
              else {
                  $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {
                      // undo/redo requires render the first step
                      if(me.backForward) me.renderFinalStep(1);

                      me.execCommandsBase(i + 1, end, steps);
                  });
              }

              return;
          }
      }
      else if(me.icn3d.commands[i].trim().indexOf('set map') == 0 && me.icn3d.commands[i].trim().indexOf('set map wireframe') == -1) {
          //set map 2fofc sigma 1.5
          var strArray = me.icn3d.commands[i].split("|||");

          var urlArray = strArray[0].trim().split(' | ');

          var str = urlArray[0].substr(8);
          var paraArray = str.split(" ");

          if(paraArray.length == 3 && paraArray[1] == 'sigma') {
            var sigma = paraArray[2];
            var type = paraArray[0];

            if( (type == '2fofc' && (me.bAjax2fofc === undefined || !me.bAjax2fofc))
              || (type == 'fofc' && (me.bAjaxfofc === undefined || !me.bAjaxfofc)) ) {
                $.when(me.applyCommandMap(strArray[0].trim())).then(function() {
                    me.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                me.applyCommandMap(strArray[0].trim());
                me.execCommandsBase(i + 1, end, steps);
            }

            return;
          }
      }
      else if(me.icn3d.commands[i].trim().indexOf('set emmap') == 0 && me.icn3d.commands[i].trim().indexOf('set emmap wireframe') == -1) {
          //set emmap percentage 70
          var strArray = me.icn3d.commands[i].split("|||");

          var str = strArray[0].trim().substr(10);
          var paraArray = str.split(" ");

          if(paraArray.length == 2 && paraArray[0] == 'percentage') {
            var percentage = paraArray[1];

            if(me.bAjaxEm === undefined || !me.bAjaxEm) {
                $.when(me.applyCommandEmmap(strArray[0].trim())).then(function() {
                    me.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                me.applyCommandEmmap(strArray[0].trim());
                me.execCommandsBase(i + 1, end, steps);
            }

            return;
          }
      }
      else if(me.icn3d.commands[i].trim().indexOf('view annotations') == 0
        //|| me.icn3d.commands[i].trim().indexOf('set annotation cdd') == 0
        //|| me.icn3d.commands[i].trim().indexOf('set annotation site') == 0
        ) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");
          if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxCddSite === undefined || !me.bAjaxCddSite) ) {
              $.when(me.applyCommandAnnotationsAndCddSite(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  me.applyCommandAnnotationsAndCddSiteBase(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('set annotation clinvar') == 0 ) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");

          if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar) ) {
              $.when(me.applyCommandClinvar(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  me.applyCommandClinvar(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('set annotation snp') == 0) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");

          if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxSnp === undefined || !me.bAjaxSnp) ) {
              $.when(me.applyCommandSnp(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  me.applyCommandSnp(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('set annotation 3ddomain') == 0) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");

          if(Object.keys(me.icn3d.proteins).length > 0 && me.mmdb_data === undefined && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain)) {
              $.when(me.applyCommand3ddomain(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  me.applyCommand3ddomain(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('set annotation all') == 0) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");
          //$.when(me.applyCommandAnnotationsAndCddSite(strArray[0].trim()))
          //  .then(me.applyCommandSnpClinvar(strArray[0].trim()))

          if( Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
            && (me.bAjaxSnp === undefined || !me.bAjaxSnp)
            && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) ) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(me.applyCommandSnp(strArray[0].trim()))
                .then(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
            && (me.bAjaxSnp === undefined || !me.bAjaxSnp)) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
            && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)
            && (me.bAjaxSnp === undefined || !me.bAjaxSnp)) {
              $.when(me.applyCommand3ddomain(strArray[0].trim()))
                .then(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar) ) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxSnp === undefined || !me.bAjaxSnp) ) {
              $.when(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) ) {
              $.when(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
/*
              if(Object.keys(me.icn3d.proteins).length > 0) {
                  if((me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
                    && (me.bAjaxSnp === undefined || !me.bAjaxSnp)
                    && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)) {
                      me.applyCommandClinvarBase(strArray[0].trim());
                      me.applyCommandSnpBase(strArray[0].trim());
                      me.applyCommand3ddomainBase(strArray[0].trim());
                  }
                  else if(me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar) {
                      me.applyCommandSnpClinvarBase(strArray[0].trim());
                  }
                  else if(me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) {
                      me.applyCommand3ddomainBase(strArray[0].trim());
                  }
              }
*/

              if(Object.keys(me.icn3d.proteins).length > 0) {
                  if(me.bAjaxClinvar) {
                      me.applyCommandClinvarBase(strArray[0].trim());
                  }

                  if(me.bAjaxSnp) {
                      me.applyCommandSnpBase(strArray[0].trim());
                  }

                  if(me.bAjax3ddomain || me.mmdb_data !== undefined) {
                      me.applyCommand3ddomainBase(strArray[0].trim());
                  }
              }

              me.setAnnoTabAll();

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('view interactions') == 0 && me.cfg.align !== undefined) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");

          if(me.b2DShown === undefined || !me.b2DShown) {
              $.when(me.applyCommandViewinteraction(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('symmetry') == 0) {
        var strArray = me.icn3d.commands[i].split("|||");
        var command = strArray[0].trim();

        var title = command.substr(command.indexOf(' ') + 1);
        me.icn3d.symmetrytitle = (title === 'none') ? undefined : title;

        if(title !== 'none') {
            if(me.icn3d.symmetryHash === undefined) {
                $.when(me.applyCommandSymmetry(command)).then(function() {
                   dialog.dialog( "close" );

                   me.icn3d.draw();
                   me.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                me.icn3d.draw();
                me.execCommandsBase(i + 1, end, steps);
            }
        }
        else {
            me.icn3d.draw();
            me.execCommandsBase(i + 1, end, steps);
        }

        return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('realign on seq align') == 0) {
        var strArray = me.icn3d.commands[i].split("|||");
        var command = strArray[0].trim();

        var paraArray = command.split(' | ');
        if(paraArray.length == 2) {
            var nameArray = paraArray[1].split(',');
            me.icn3d.hAtoms = me.getAtomsFromNameArray(nameArray);
        }

        $.when(me.applyCommandRealign(command)).then(function() {
           me.execCommandsBase(i + 1, end, steps);
        });

        return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('graph interaction pairs') == 0) {
        var strArray = me.icn3d.commands[i].split("|||");
        var command = strArray[0].trim();

        if(me.bD3 === undefined) {
            $.when(me.applyCommandGraphinteraction(command)).then(function() {
                me.execCommandsBase(i + 1, end, steps);
            });
        }
        else {
            me.applyCommandGraphinteraction(command);
            me.execCommandsBase(i + 1, end, steps);
        }

        return;
      }
      else {
          me.applyCommand(me.icn3d.commands[i]);
      }
  }

  //if(i === steps - 1) {
  if(i === steps || bFinalStep) {
      // enable me.hideLoading
      me.bCommandLoad = false;

      // hide "loading ..."
      me.hideLoading();

      //me.icn3d.bRender = true;

      // end of all commands
      if(i + 1 === me.icn3d.commands.length) me.bAddCommands = true;

      me.renderFinalStep(i);
  }
};

iCn3DUI.prototype.setStrengthPara = function(paraArray) { var me = this; //"use strict";
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

iCn3DUI.prototype.oneStructurePerWindow = function() { var me = this; //"use strict";
    // only display one of the two aligned structures
    var structureArray = Object.keys(me.icn3d.structures);
    if(me.cfg.bSidebyside && structureArray.length == 2) {
        var dividArray = Object.keys(window.icn3duiHash);
        var pos = dividArray.indexOf(me.divid);

        var structure = structureArray[pos];
        var chainArray = me.icn3d.structures[structure];
        var structAtoms = {};
        for(var i = 0, il = chainArray.length; i < il; ++i) {
            structAtoms = me.icn3d.unionHash(structAtoms, me.icn3d.chains[chainArray[i]]);
        }

        me.icn3d.dAtoms = me.icn3d.intHash(structAtoms, me.icn3d.dAtoms);
        me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.dAtoms);
    }
};

iCn3DUI.prototype.renderFinalStep = function(steps) { var me = this; //"use strict";
    me.icn3d.bRender = true;

    var commandTransformation = me.icn3d.commands[steps-1].split('|||');

    if(commandTransformation.length == 2) {
        var transformation = JSON.parse(commandTransformation[1]);

        me.icn3d._zoomFactor = transformation.factor;

        me.icn3d.mouseChange.x = transformation.mouseChange.x;
        me.icn3d.mouseChange.y = transformation.mouseChange.y;

        me.icn3d.quaternion._x = transformation.quaternion._x;
        me.icn3d.quaternion._y = transformation.quaternion._y;
        me.icn3d.quaternion._z = transformation.quaternion._z;
        me.icn3d.quaternion._w = transformation.quaternion._w;
    }

    me.oneStructurePerWindow();

    // simple if all atoms are modified
    //if( me.cfg.command === undefined && (steps === 1 || (Object.keys(me.icn3d.hAtoms).length === Object.keys(me.icn3d.atoms).length) || (me.icn3d.optsHistory[steps - 1] !== undefined && me.icn3d.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && me.icn3d.optsHistory[steps - 1].hlatomcount === Object.keys(me.icn3d.atoms).length) ) ) {
    if(steps === 1
      || (Object.keys(me.icn3d.hAtoms).length === Object.keys(me.icn3d.atoms).length)
      || (me.icn3d.optsHistory[steps - 1] !== undefined && me.icn3d.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && me.icn3d.optsHistory[steps - 1].hlatomcount === Object.keys(me.icn3d.atoms).length) ) {
        if(steps === 1) {
            // assign styles and color using the options at that stage
            me.icn3d.setAtomStyleByOptions(me.icn3d.optsHistory[steps - 1]);
            me.icn3d.setColorByOptions(me.icn3d.optsHistory[steps - 1], me.icn3d.hAtoms);
        }

        if(me.icn3d.optsHistory.length >= steps) {
            var pkOption = me.icn3d.optsHistory[steps - 1].pk;
            if(pkOption === 'no') {
                me.icn3d.pk = 0;
            }
            else if(pkOption === 'atom') {
                me.icn3d.pk = 1;
            }
            else if(pkOption === 'residue') {
                me.icn3d.pk = 2;
            }
            else if(pkOption === 'strand') {
                me.icn3d.pk = 3;
            }

            if(steps === 1) {
                me.icn3d.applyOriginalColor();
            }

            me.updateHlAll();

            jQuery.extend(me.icn3d.opts, me.icn3d.optsHistory[steps - 1]);
            me.icn3d.draw();
        }
        else {
            me.updateHlAll();

            me.icn3d.draw();
        }
    }
    else { // more complicated if partial atoms are modified
        me.updateHlAll();

        me.icn3d.draw();
    }

    if(me.cfg.closepopup) {
        if($('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' )) $('#' + me.pre + 'dl_selectannotations').dialog( 'close' );
        if($('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' )) $('#' + me.pre + 'dl_alignment').dialog( 'close' );
        if($('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' )) $('#' + me.pre + 'dl_2ddgm').dialog( 'close' );
        if($('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content') && $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' )) $('#' + me.pre + 'dl_definedsets').dialog( 'close' );

        me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
    }

    // an extra render to remove artifacts in transparent surface
    if(me.bTransparentSurface && me.icn3d.bRender) me.icn3d.render();
};

iCn3DUI.prototype.applyCommandLoad = function (commandStr) { var me = this; //"use strict";
  //me.bCommandLoad = true;

  if(me.icn3d.atoms !== undefined && Object.keys(me.icn3d.atoms).length > 0) return;

  // chain functions together
  me.deferred2 = $.Deferred(function() {
  me.bAddCommands = false;
  var commandTransformation = commandStr.split('|||');

  var commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
  var command = commandOri.toLowerCase();

  if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
    var load_parameters = command.split(' | ');

    var loadStr = load_parameters[0];
    if(load_parameters.length > 1) {
        var firstSpacePos = load_parameters[load_parameters.length - 1].indexOf(' ');
        me.cfg.inpara = load_parameters[load_parameters.length - 1].substr(firstSpacePos + 1);
        if(me.cfg.inpara === 'undefined') {
            me.cfg.inpara = '';
        }
    }

    // load pdb, mmcif, mmdb, cid
    var id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
    me.inputid = id;
    if(command.indexOf('load mmtf') !== -1) {
      me.cfg.mmtfid = id;
      me.downloadMmtf(id);
    }
    else if(command.indexOf('load pdb') !== -1) {
      me.cfg.pdbid = id;
      me.downloadPdb(id);
    }
    else if(command.indexOf('load opm') !== -1) {
      me.cfg.opmid = id;
      me.downloadOpm(id);
    }
    else if(command.indexOf('load mmcif') !== -1) {
      me.cfg.mmcifid = id;
      me.downloadMmcif(id);
    }
    else if(command.indexOf('load mmdb') !== -1) {
      me.cfg.mmdbid = id;
      me.downloadMmdb(id);
    }
    else if(command.indexOf('load gi') !== -1) {
      me.cfg.gi = id;
      me.downloadGi(id);
    }
    else if(command.indexOf('load seq_struc_ids') !== -1) {
      me.downloadBlast_rep_id(id);
    }
    else if(command.indexOf('load cid') !== -1) {
      me.cfg.cid = id;
      me.downloadCid(id);
    }
    else if(command.indexOf('load alignment') !== -1) {
      me.cfg.align = id;
      me.downloadAlignment(id);
    }
    else if(command.indexOf('load chainalignment') !== -1) {
      me.cfg.chainalign = id;
      me.downloadChainAlignment(id);
    }
    else if(command.indexOf('load url') !== -1) {
        var typeStr = load_parameters[1]; // type pdb
        var pos = (typeStr !== undefined) ? typeStr.indexOf('type ') : -1;
        var type = 'pdb';

        if(pos !== -1) {
            type = typeStr.substr(pos + 5);
        }

        me.cfg.url = id;
        me.downloadUrl(id, type);
    }
  }

  me.bAddCommands = true;
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferred2.promise();
};

iCn3DUI.prototype.applyCommandMap = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredMap = $.Deferred(function() {
      //"set map 2fofc sigma 1.5"
      // or "set map 2fofc sigma 1.5 | [url]"
      var urlArray = command.split(" | ");

      var str = urlArray[0].substr(8);
      var paraArray = str.split(" ");

      if(paraArray.length == 3 && paraArray[1] == 'sigma') {
          var sigma = paraArray[2];
          var type = paraArray[0];

          if(urlArray.length == 2) {
              me.Dsn6ParserBase(urlArray[1], type, sigma);
          }
          else {
              me.Dsn6Parser(me.inputid, type, sigma);
          }
      }
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredMap.promise();
};

iCn3DUI.prototype.applyCommandEmmap = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredEmmap = $.Deferred(function() {
      var str = command.substr(10);
      var paraArray = str.split(" ");

      if(paraArray.length == 2 && paraArray[0] == 'percentage') {
           if(iCn3DUI.prototype.DensityCifParser === undefined) {
               var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/density_cif_parser.min.js";
               $.ajax({
                  url: url,
                  dataType: "script",
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                      var percentage = paraArray[1];
                      var type = 'em';

                      me.DensityCifParser(me.inputid, type, percentage, me.icn3d.emd);
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
              var percentage = paraArray[1];
              var type = 'em';

              me.DensityCifParser(me.inputid, type, percentage, me.icn3d.emd);
           }
      }
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredEmmap.promise();
};

iCn3DUI.prototype.applyCommandSymmetryBase = function (command) { var me = this; //"use strict";
    me.retrieveSymmetry(Object.keys(me.icn3d.structures)[0])
};

iCn3DUI.prototype.applyCommandSymmetry = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredSymmetry = $.Deferred(function() {
     me.applyCommandSymmetryBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSymmetry.promise();
};

iCn3DUI.prototype.applyCommandRealignBase = function (command) { var me = this; //"use strict";
    me.realignOnSeqAlign();
};

iCn3DUI.prototype.applyCommandRealign = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredRealign = new $.Deferred(function() {
     me.applyCommandRealignBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredRealign.promise();
};

iCn3DUI.prototype.applyCommandGraphinteractionBase = function (command) { var me = this; //"use strict";
    var paraArray = command.split(' | ');
    if(paraArray.length >= 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var bHbond = paraArray[2].indexOf('hbonds') !== -1;
        var bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
        var bInteraction = paraArray[2].indexOf('interactions') !== -1;

        var bHalogen = paraArray[2].indexOf('halogen') !== -1;
        var bPication = paraArray[2].indexOf('pi-cation') !== -1;
        var bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

        var bHbondCalc;
        if(paraArray.length >= 4) {
            bHbondCalc = (paraArray[3] == 'true') ? true : false;
        }

        me.setStrengthPara(paraArray);

        me.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, 'graph',
            bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
    }
};

iCn3DUI.prototype.applyCommandGraphinteraction = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredGraphinteraction = $.Deferred(function() {
     me.applyCommandGraphinteractionBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredGraphinteraction.promise();
};

iCn3DUI.prototype.getAxisColor = function (symbol, order) { var me = this; //"use strict";
    var type = symbol.substr(0, 1);

    //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
    if(type == 'C') { // Cyclic Cn
        return new THREE.Color(0xFF0000); // red
    }
    else if(type == 'D') { // Dihedral Dn
        if(order == 2) {
            return new THREE.Color(0x00FFFF); // cyan
        }
        else {
            return new THREE.Color(0xFF0000); // red
        }
    }
    else if(type == 'T') { // Tetrahedral T
        if(order == 2) {
            return new THREE.Color(0x00FFFF); // cyan
        }
        else {
            return new THREE.Color(0x00FF00); // green
        }
    }
    else if(type == 'O') { // Octahedral O
        if(order == 2) {
            return new THREE.Color(0x00FFFF); // cyan
        }
        else if(order == 3) {
            return new THREE.Color(0x00FF00); // green
        }
        else {
            return new THREE.Color(0xFF0000); // red
        }
    }
    else if(type == 'I') { // Icosahedral I
        if(order == 2) {
            return new THREE.Color(0x00FFFF); // cyan
        }
        else if(order == 3) {
            return new THREE.Color(0x00FF00); // green
        }
        else {
            return new THREE.Color(0xFF0000); // red
        }
    }
    else { // Helical H, etc
        return new THREE.Color(0xFF0000); // red
    }
};

iCn3DUI.prototype.getPolygonColor = function (symbol) { var me = this; //"use strict";
    var type = symbol.substr(0, 1);

    //https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
    if(type == 'C') { // Cyclic Cn
        return new THREE.Color(0xFF8C00); // dark orange
    }
    else if(type == 'D') { // Dihedral Dn
        return new THREE.Color(0x00FFFF); // cyan
    }
    else if(type == 'T') { // Tetrahedral T
        return new THREE.Color(0xEE82EE); //0x800080); // purple
    }
    else if(type == 'O') { // Octahedral O
        return new THREE.Color(0xFFA500); // orange
    }
    else if(type == 'I') { // Icosahedral I
        return new THREE.Color(0x00FF00); // green
    }
    else { // Helical H, etc
        return new THREE.Color(0xA9A9A9); // dark grey
    }
};

iCn3DUI.prototype.retrieveSymmetry = function (pdbid) { var me = this; //"use strict";
   //var url = "https://rest.rcsb.org/rest/structures/3dview/" + pdbid;
   //var url = "https://data-beta.rcsb.org/rest/v3/core/assembly/" + pdbid + "/1";
   //var url = "https://data-beta.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";
   var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";

   $.ajax({
      url: url,
      dataType: "json",
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data) {
          var symmetryArray = data.rcsb_struct_symmetry;

          if(symmetryArray !== undefined) {
              if(me.icn3d.rmsd_supr !== undefined && me.icn3d.rmsd_supr.rot !== undefined) {
                  var rot = me.icn3d.rmsd_supr.rot;
                  var centerFrom = me.icn3d.rmsd_supr.trans1;
                  var centerTo = me.icn3d.rmsd_supr.trans2;
              }

              me.icn3d.symmetryHash = {};
              for(var i = 0, il = symmetryArray.length; i < il; ++i) {
                  if(symmetryArray[i].symbol == 'C1') continue;
                  var title = 'no title';
                  if(symmetryArray[i].kind == "Pseudo Symmetry") {
                      title = symmetryArray[i].symbol + ' (pseudo)';
                  }
                  else if(symmetryArray[i].kind == "Global Symmetry") {
                      title = symmetryArray[i].symbol + ' (global)';
                  }
                  else if(symmetryArray[i].kind == "Local Symmetry") {
                      title = symmetryArray[i].symbol + ' (local)';
                  }

                  var rotation_axes = symmetryArray[i].rotation_axes;
                  var axesArray = [];
                  for(var j = 0, jl = rotation_axes.length; j < jl; ++j) {
                      var tmpArray = [];
                      var start = new THREE.Vector3(rotation_axes[j].start[0], rotation_axes[j].start[1], rotation_axes[j].start[2]);
                      var end = new THREE.Vector3(rotation_axes[j].end[0], rotation_axes[j].end[1], rotation_axes[j].end[2]);

                      // apply matrix for each atom
                      if(me.icn3d.rmsd_supr !== undefined && me.icn3d.rmsd_supr.rot !== undefined) {
                          start = me.icn3d.transformMemPro(start, rot, centerFrom, centerTo);
                          end = me.icn3d.transformMemPro(end, rot, centerFrom, centerTo);
                      }

                      tmpArray.push(start);
                      tmpArray.push(end);

                      // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                      var colorAxis = me.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                      var colorPolygon = me.getPolygonColor(symmetryArray[i].symbol);
                      tmpArray.push(colorAxis);
                      tmpArray.push(colorPolygon);

                      tmpArray.push(rotation_axes[j].order);

                      // selected chain
                      tmpArray.push(symmetryArray[i].clusters[0].members[0].asym_id);

                      axesArray.push(tmpArray);
                  }

                  me.icn3d.symmetryHash[title] = axesArray;
              }

              if(Object.keys(me.icn3d.symmetryHash).length == 0) {
                  $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
              }
              else {
                  var html = "<option value='none'>None</option>", index = 0;
                  for(var title in me.icn3d.symmetryHash) {
                      var selected = (index == 0) ? 'selected' : '';
                      html += "<option value=" + "'" + title + "' " + selected + ">" + title + "</option>";
                      ++index;
                  }

                  $("#" + me.pre + "selectSymmetry").html(html);
              }
          }
          else {
              $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
          }

          me.openDialog(me.pre + 'dl_symmetry', 'Symmetry');

          if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");

        me.openDialog(me.pre + 'dl_symmetry', 'Symmetry');

        if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
        return;
      }
   });
};

iCn3DUI.prototype.applyCommandAnnotationsAndCddSiteBase = function (command) { var me = this; //"use strict";
  // chain functions together
      if(command == "view annotations") {
          if(me.cfg.showanno === undefined || !me.cfg.showanno) {
              me.showAnnotations();
          }
      }
};

iCn3DUI.prototype.applyCommandAnnotationsAndCddSite = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredAnnoCddSite = $.Deferred(function() {
      me.applyCommandAnnotationsAndCddSiteBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredAnnoCddSite.promise();
};

iCn3DUI.prototype.applyCommandClinvarBase = function (command) { var me = this; //"use strict";
  // chain functions together
      var pos = command.lastIndexOf(' '); // set annotation clinvar
      var type = command.substr(pos + 1);

      me.setAnnoTabClinvar();
};

iCn3DUI.prototype.applyCommandSnpBase = function (command) { var me = this; //"use strict";
  // chain functions together
      var pos = command.lastIndexOf(' '); // set annotation clinvar
      var type = command.substr(pos + 1);

      me.setAnnoTabSnp();
};

iCn3DUI.prototype.applyCommandClinvar = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredClinvar = $.Deferred(function() {
      me.applyCommandClinvarBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredClinvar.promise();
};

iCn3DUI.prototype.applyCommandSnp = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredSnp = $.Deferred(function() {
      me.applyCommandSnpBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSnp.promise();
};

iCn3DUI.prototype.applyCommand3ddomainBase = function (command) { var me = this; //"use strict";
  // chain functions together
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == '3ddomain' || type == 'all') {
          me.setAnnoTab3ddomain();
      }
};

iCn3DUI.prototype.applyCommand3ddomain = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferred3ddomain = $.Deferred(function() {
      me.applyCommand3ddomainBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferred3ddomain.promise();
};

iCn3DUI.prototype.applyCommandViewinteractionBase = function (command) { var me = this; //"use strict";
  // chain functions together
     if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
         var structureArray = Object.keys(me.icn3d.structures);
         me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
     }
};

iCn3DUI.prototype.applyCommandViewinteraction = function (command) { var me = this; //"use strict";
  // chain functions together
  me.deferredViewinteraction = $.Deferred(function() {
     me.applyCommandViewinteractionBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredViewinteraction.promise();
};

iCn3DUI.prototype.getThresholdNameArrays = function (commandOri) { var me = this; //"use strict";
    if(me.bSetChainsAdvancedMenu === undefined || !me.bSetChainsAdvancedMenu) {
       var prevHAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

       me.setPredefinedInMenu();
       me.bSetChainsAdvancedMenu = true;

       me.icn3d.hAtoms = me.icn3d.cloneHash(prevHAtoms);
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

iCn3DUI.prototype.applyCommand = function (commandStr) { var me = this; //"use strict";
  me.bAddCommands = false;

  var commandTransformation = commandStr.split('|||');

  var commandOri = commandTransformation[0].replace(/\s+/g, ' ').trim();
  var command = commandOri.toLowerCase();

  var bShowLog = true;

// exact match =============

  //var file_pref = (me.inputid) ? me.inputid : "custom";

  if(command == 'export state file') { // last step to update transformation
    // the last transformation will be applied
  }
  else if(command.indexOf('export canvas') == 0) {
    setTimeout(function(){
           //me.saveFile(file_pref + '_icn3d_loadable.png', 'png');
           var scaleStr = command.substr(13).trim();
           me.icn3d.scaleFactor = (scaleStr === '') ? 1: parseInt(scaleStr);
           me.shareLink(true);
        }, 500);
  }
  else if(command == 'export interactions') {
    me.exportInteractions();
  }
  else if(command == 'export stl file') {
    setTimeout(function(){
           //var text = me.saveStlFile();
           //me.saveFile(file_pref + '.stl', 'binary', text);
           //text = '';

           me.exportStlFile('');
        }, 500);
  }
  else if(command == 'export vrml file') {
    setTimeout(function(){
           //var text = me.saveVrmlFile();
           //me.saveFile(file_pref + '.wrl', 'text', text);
           //text = '';

           me.exportVrmlFile('');
        }, 500);
  }
  else if(command == 'export stl stabilizer file') {
    setTimeout(function(){
           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           //var text = me.saveStlFile();

           //me.saveFile(file_pref + '_stab.stl', 'binary', text);
           //text = '';

           me.exportStlFile('_stab');
        }, 500);
  }
  else if(command == 'export vrml stabilizer file') {
    setTimeout(function(){
           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           //var text = me.saveVrmlFile();

           //me.saveFile(file_pref + '_stab.wrl', 'text', text);
           //text = '';

           me.exportVrmlFile('_stab');
        }, 500);
  }
  else if(command == 'select all') {
     me.selectAll();
     //me.icn3d.addHlObjects();
  }
  else if(command == 'show all') {
     me.showAll();
  }
  else if(command == 'select complement') {
     me.selectComplement();
  }
  else if(command == 'set pk atom') {
    me.icn3d.pk = 1;
    me.icn3d.opts['pk'] = 'atom';
  }
  else if(command == 'set pk off') {
    me.icn3d.pk = 0;
    me.icn3d.opts['pk'] = 'no';
    me.icn3d.draw();
    me.icn3d.removeHlObjects();
  }
  else if(command == 'set pk residue') {
    me.icn3d.pk = 2;
    me.icn3d.opts['pk'] = 'residue';
  }
  else if(command == 'set pk strand') {
    me.icn3d.pk = 3;
    me.icn3d.opts['pk'] = 'strand';
  }
  else if(command == 'set pk domain') {
    me.icn3d.pk = 4;
    me.icn3d.opts['pk'] = 'domain';
  }
  else if(command == 'set pk chain') {
    me.icn3d.pk = 5;
    me.icn3d.opts['pk'] = 'chain';
  }
  else if(command == 'set surface wireframe on') {
    me.icn3d.opts['wireframe'] = 'yes';
    me.icn3d.applySurfaceOptions();
  }
  else if(command == 'set surface wireframe off') {
    me.icn3d.opts['wireframe'] = 'no';
    me.icn3d.applySurfaceOptions();
  }
  else if(command == 'set map wireframe on') {
    me.icn3d.opts['mapwireframe'] = 'yes';
    me.icn3d.applyMapOptions();
  }
  else if(command == 'set map wireframe off') {
    me.icn3d.opts['mapwireframe'] = 'no';
    me.icn3d.applyMapOptions();
  }
  else if(command == 'set emmap wireframe on') {
    me.icn3d.opts['emmapwireframe'] = 'yes';
    me.icn3d.applyEmmapOptions();
  }
  else if(command == 'set emmap wireframe off') {
    me.icn3d.opts['emmapwireframe'] = 'no';
    me.icn3d.applyEmmapOptions();
  }
  else if(command == 'set surface neighbors on') {
    me.icn3d.bConsiderNeighbors = true;
    me.icn3d.applySurfaceOptions();
  }
  else if(command == 'set surface neighbors off') {
    me.icn3d.bConsiderNeighbors = false;
    me.icn3d.applySurfaceOptions();
  }
  else if(command == 'set axis on') {
    me.icn3d.opts['axis'] = 'yes';
  }
  else if(command == 'set axis off') {
    me.icn3d.opts['axis'] = 'no';
  }
  else if(command == 'set fog on') {
    me.icn3d.opts['fog'] = 'yes';
    me.icn3d.setFog(true);
  }
  else if(command == 'set fog off') {
    me.icn3d.opts['fog'] = 'no';
    me.icn3d.setFog(true);
  }
  else if(command == 'set slab on') {
    me.icn3d.opts['slab'] = 'yes';
  }
  else if(command == 'set slab off') {
    me.icn3d.opts['slab'] = 'no';
  }
  else if(command == 'set assembly on') {
    me.icn3d.bAssembly = true;
  }
  else if(command == 'set assembly off') {
    me.icn3d.bAssembly = false;
  }
  else if(command == 'set chemicalbinding show') {
    me.setOption('chemicalbinding', 'show');
  }
  else if(command == 'set chemicalbinding hide') {
    me.setOption('chemicalbinding', 'hide');
  }
  else if(command == 'set hbonds off') {
    me.icn3d.hideHbonds();
    me.icn3d.draw();
  }
  else if(command == 'set salt bridge off') {
    me.icn3d.hideSaltbridge();
    me.icn3d.draw();
  }
  else if(command == 'set contact off') {
    me.icn3d.hideContact();
    me.icn3d.draw();
  }
  else if(command == 'set halogen pi off') {
    me.icn3d.hideHalogenPi();
    me.icn3d.draw();
  }

  else if(command == 'hydrogens') {
    me.showHydrogens();
    me.icn3d.draw();
  }
  else if(command == 'set hydrogens off') {
    me.hideHydrogens();
    me.icn3d.draw();
  }

  else if(command == 'set stabilizer off') {
    me.hideStabilizer();
    me.icn3d.draw();
  }
  else if(command == 'set disulfide bonds off') {
    me.icn3d.opts["ssbonds"] = "no";
    me.icn3d.draw();
  }
  else if(command == 'set cross linkage off') {
    //me.icn3d.bShowCrossResidueBond = false;
    //me.setStyle('proteins', 'ribbon');

    me.icn3d.opts["clbonds"] = "no";
    me.icn3d.draw();
  }
  else if(command == 'set lines off') {
    me.icn3d.labels['distance'] = [];
    me.icn3d.lines['distance'] = [];

    me.icn3d.draw();
  }
  else if(command == 'set labels off') {
    //me.icn3d.labels['residue'] = [];
    //me.icn3d.labels['custom'] = [];

    for(var name in me.icn3d.labels) {
       //if(name === 'residue' || name === 'custom') {
           me.icn3d.labels[name] = [];
       //}
    }

    me.icn3d.draw();
  }
  else if(command == 'set mode all') {
     me.setModeAndDisplay('all');
  }
  else if(command == 'set mode selection') {
     me.setModeAndDisplay('selection');
  }
  else if(command == 'set view detailed view') {
     me.setAnnoViewAndDisplay('detailed view');
  }
  else if(command == 'set view overview') {
     me.setAnnoViewAndDisplay('overview');
  }
/*
  else if(command.indexOf('set annotation') == 0) {
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == 'all') {
          me.setAnnoTabAll();
      }
      else if(type == 'custom') {
          me.setAnnoTabCustom();
      }
      else if(type == 'clinvar') {
          me.setAnnoTabClinvar();
      }
      else if(type == 'snp') {
          me.setAnnoTabSnp();
      }
      else if(type == 'cdd') {
          me.setAnnoTabCdd();
      }
      else if(type == '3ddomain') {
          me.setAnnoTab3ddomain();
      }
      else if(type == 'site') {
          me.setAnnoTabSite();
      }
      else if(type == 'interaction') {
          me.setAnnoTabInteraction();
      }
  }
*/
  else if(command == 'set annotation custom') {
      me.setAnnoTabCustom();
  }
  else if(command == 'set annotation interaction') {
      me.setAnnoTabInteraction();
  }
  else if(command == 'set annotation cdd') {
      me.setAnnoTabCdd();
  }
  else if(command == 'set annotation site') {
      me.setAnnoTabSite();
  }
  else if(command == 'set annotation ssbond') {
      me.setAnnoTabSsbond();
  }
  else if(command == 'set annotation transmembrane') {
      me.setAnnoTabTransmem();
  }
  else if(command == 'highlight level up') {
      me.switchHighlightLevelUp();
  }
  else if(command == 'highlight level down') {
      me.switchHighlightLevelDown();
  }
  else if(command.indexOf('hide annotation') == 0) {
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == 'all') {
          me.hideAnnoTabAll();
      }
      else if(type == 'custom') {
          me.hideAnnoTabCustom();
      }
      else if(type == 'clinvar') {
          me.hideAnnoTabClinvar();
      }
      else if(type == 'snp') {
          me.hideAnnoTabSnp();
      }
      else if(type == 'cdd') {
          me.hideAnnoTabCdd();
      }
      else if(type == '3ddomain') {
          me.hideAnnoTab3ddomain();
      }
      else if(type == 'site') {
          me.hideAnnoTabSite();
      }
      else if(type == 'interaction') {
          me.hideAnnoTabInteraction();
      }
      else if(type == 'ssbond') {
          me.hideAnnoTabSsbond();
      }
      else if(type == 'transmembrane') {
          me.hideAnnoTabTransmem();
      }
  }
  else if(command == 'add residue labels') {
    me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

    me.icn3d.draw();
  }
  else if(command == 'add residue number labels') {
    me.icn3d.addResiudeLabels(me.icn3d.hAtoms, undefined, undefined, true);

    me.icn3d.draw();
  }
  else if(command == 'add atom labels') {
    me.icn3d.addAtomLabels(me.icn3d.hAtoms);

    me.icn3d.draw();
  }
  else if(command == 'add chain labels') {
    me.addChainLabels(me.icn3d.hAtoms);

    me.icn3d.draw();
  }
  else if(command == 'add terminal labels') {
    me.addTerminiLabels(me.icn3d.hAtoms);

    me.icn3d.draw();
  }
  else if(command == 'rotate left') {
     me.icn3d.bStopRotate = false;
     me.ROT_DIR = 'left';

     me.rotStruc('left');
  }
  else if(command == 'rotate right') {
     me.icn3d.bStopRotate = false;
     me.ROT_DIR = 'right';

     me.rotStruc('right');
  }
  else if(command == 'rotate up') {
     me.icn3d.bStopRotate = false;
     me.ROT_DIR = 'up';

     me.rotStruc('up');
  }
  else if(command == 'rotate down') {
     me.icn3d.bStopRotate = false;
     me.ROT_DIR = 'down';

     me.rotStruc('down');
  }
  else if(command == 'rotate x') {
      var axis = new THREE.Vector3(1,0,0);
      var angle = 0.5 * Math.PI;

      me.icn3d.setRotation(axis, angle);
  }
  else if(command == 'rotate y') {
      var axis = new THREE.Vector3(0,1,0);
      var angle = 0.5 * Math.PI;

      me.icn3d.setRotation(axis, angle);
  }
  else if(command == 'rotate z') {
      var axis = new THREE.Vector3(0,0,1);
      var angle = 0.5 * Math.PI;

      me.icn3d.setRotation(axis, angle);
  }
  else if(command === 'reset') {
    //location.reload();
    me.icn3d.reinitAfterLoad();
    me.renderFinalStep(1);

    // need to render
    if(me.icn3d.bRender) me.icn3d.render();
  }
  else if(command === 'reset orientation') {
    me.icn3d.resetOrientation();
    me.icn3d.draw();
  }
  else if(command == 'reset thickness') {
    me.resetAfter3Dprint();
    me.icn3d.draw();
  }
  else if(command == 'clear selection') {
    me.icn3d.removeHlObjects();
    me.removeHl2D();
    me.icn3d.bShowHighlight = false;

    me.bSelectResidue = false;
  }
  else if(command == 'zoom selection') {
    me.icn3d.zoominSelection();
    me.icn3d.draw();
  }
  else if(command == 'center selection') {
    me.icn3d.centerSelection();
    me.icn3d.draw();
  }
  else if(command == 'show selection') {
    me.showSelection();
  }
  else if(command == 'hide selection') {
    me.hideSelection();
  }
  else if(command == 'output selection') {
      me.outputSelection();
  }
  else if(command == 'toggle selection') {
     me.toggleSelection();
  }
  else if(command == 'toggle highlight') {
    me.toggleHighlight();
/*
    if(me.icn3d.prevHighlightObjects.length > 0 || me.icn3d.prevHighlightObjects_ghost.length > 0) { // remove
        me.icn3d.removeHlObjects();
        me.icn3d.bShowHighlight = false;
    }
    else { // add
        me.icn3d.addHlObjects();
        me.icn3d.bShowHighlight = true;
    }
*/
  }
  else if(command == 'stabilizer') {
    me.addStabilizer();

    me.prepareFor3Dprint();
    //me.icn3d.draw();
  }
  else if(command == 'disulfide bonds') {
    me.showSsbonds();
  }
  else if(command == 'cross linkage') {
    //me.icn3d.bShowCrossResidueBond = true;
    //me.setStyle('proteins', 'lines');

    me.showClbonds();
  }
  else if(command == 'back') {
     me.back();
  }
  else if(command == 'forward') {
     me.forward();
  }
  else if(command == 'clear all') {
     me.selectAll();
  }
  else if(command == 'defined sets') {
     me.showSets();
  }
  else if(command == 'delete selected sets') {
     me.deleteSelectedSets();
  }
  else if(command == 'view interactions') {
     if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
         me.set2DDiagrams(me.inputid);
     }
     //else if(me.cfg.align !== undefined) {
     //    var structureArray = Object.keys(me.icn3d.structures);
     //    me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
     //}
  }
//      else if(command == 'view annotations') {
//          if(me.cfg.showanno === undefined || !me.cfg.showanno) { // previously done the following call
//              me.showAnnotations();
//          }
//      }
  else if(command == 'show annotations all chains') {
     me.showAnnoAllChains();
  }

  else if(command == 'save color') {
     me.saveColor();
  }
  else if(command == 'apply saved color') {
     me.applySavedColor();
  }
  else if(command == 'save style') {
     me.saveStyle();
  }
  else if(command == 'apply saved style') {
     me.applySavedStyle();
  }
  else if(command == 'select main chains') {
     me.selectMainChains();
  }
  else if(command == 'select side chains') {
     me.selectSideChains();
  }
//  else if(command == 'realign') {
//     me.realign();
//  }
  else if(command == 'area') {
     me.calculateArea();
  }
  else if(command == 'table inter count only') {
     $(".icn3d-border").hide();
  }
  else if(command == 'table inter details') {
     $(".icn3d-border").show();
  }

// start with =================
  else if(commandOri.indexOf('define helix sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'helix');
  }
  else if(commandOri.indexOf('define sheet sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'sheet');
  }
  else if(commandOri.indexOf('define coil sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'coil');
  }
  else if(commandOri.indexOf('select interaction') == 0) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
    if(idArray !== null) {
        var mmdbid = idArray[0].split('_')[0];
        if(!me.b2DShown) me.download2Ddgm(mmdbid.toUpperCase());

        me.selectInteraction(idArray[0], idArray[1]);
    }
  }

  else if(commandOri.indexOf('select saved atoms') == 0 || commandOri.indexOf('select sets') == 0) {
    // backward compatible: convert previous aligned_protein to protein_aligned
    commandOri = commandOri.replace(/aligned_protein/g, 'protein_aligned');

    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = paraArray[0].replace(/,/g, ' or ');

    var pos = 19; // 'select saved atoms '
    if(commandOri.indexOf('select sets') == 0) pos = 12; // 'select sets '

    var strSets = select.substr(pos);

    var commandname = strSets;

    if(paraArray.length == 2) commandname = paraArray[1].substr(5); // 'name ...'
    me.selectCombinedSets(strSets, commandname);
  }
  else if(commandOri.indexOf('select chain') !== -1) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

    //if(idArray !== null) me.changeChainid(idArray);
    for(var i = 0, il = idArray.length; i < il; ++i) {
        me.selectAChain(idArray[i], idArray[i], false);
    }
  }
  else if(commandOri.indexOf('select alignChain') !== -1) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

    //if(idArray !== null) me.changeChainid(idArray);
    for(var i = 0, il = idArray.length; i < il; ++i) {
        me.selectAChain(idArray[i], 'align_' + idArray[i], true);
    }
  }
  else if(commandOri.indexOf('select zone cutoff') == 0) {
    var ret = me.getThresholdNameArrays(commandOri);

    me.pickCustomSphere(ret.threshold, ret.nameArray2, ret.nameArray, ret.bHbondCalc);
    me.bSphereCalc = true;

    //me.updateHlAll();
  }
  else if(command.indexOf('set surface opacity') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['opacity'] = parseFloat(value);
    me.icn3d.applySurfaceOptions();

    if(parseInt(100*value) < 100) me.bTransparentSurface = true;
  }
  else if(command.indexOf('set label scale') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.labelScale = parseFloat(value);
  }
  else if(command.indexOf('set surface') == 0) {
    var value = command.substr(12);

    me.icn3d.opts['surface'] = value;
    me.icn3d.applySurfaceOptions();
  }
//  else if(command.indexOf('set map') == 0) {
//    var value = command.substr(8);

//    me.icn3d.opts['map'] = value;
//    me.icn3d.applyMapOptions();
//  }
  else if(command.indexOf('set camera') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['camera'] = value;
  }
  else if(command.indexOf('set background') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['background'] = value;

    if(value == 'white' || value == 'grey') {
        $("#" + me.pre + "title").css("color", "black");
        $("#" + me.pre + "titlelink").css("color", "black");
    }
    else {
        $("#" + me.pre + "title").css("color", me.GREYD);
        $("#" + me.pre + "titlelink").css("color", me.GREYD);
    }
  }
  else if(commandOri.indexOf('set thickness') == 0) {
    var paraArray = command.split(' | ');

    me.bSetThickness = true;

    for(var i = 1, il = paraArray.length; i < il; ++i) {
        var p1Array = paraArray[i].split(' ');

        var para = p1Array[0];
        var value = parseFloat(p1Array[1]);

        if(para == 'linerad') me.icn3d.lineRadius = value;
        if(para == 'coilrad') me.icn3d.coilWidth = value;
        if(para == 'stickrad') me.icn3d.cylinderRadius = value;
        if(para == 'tracerad') me.icn3d.traceRadius = value;
        if(para == 'ballscale') me.icn3d.dotSphereScale = value;

        if(para == 'ribbonthick') me.icn3d.ribbonthickness = value;
        if(para == 'proteinwidth') me.icn3d.helixSheetWidth = value;
        if(para == 'nucleotidewidth') me.icn3d.nucleicAcidWidth = value;

        me.icn3d.draw();
    }
  }
  else if(command.indexOf('set highlight color') == 0) {
       var color = command.substr(20);
       if(color === 'yellow') {
           me.icn3d.hColor = new THREE.Color(0xFFFF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('yellow');
       }
       else if(color === 'green') {
           me.icn3d.hColor = new THREE.Color(0x00FF00);
           me.icn3d.matShader = me.icn3d.setOutlineColor('green');
       }
       else if(color === 'red') {
           me.icn3d.hColor = new THREE.Color(0xFF0000);
           me.icn3d.matShader = me.icn3d.setOutlineColor('red');
       }
       me.icn3d.draw(); // required to make it work properly
  }
  else if(command.indexOf('set highlight style') == 0) {
        var style = command.substr(20);

       if(style === 'outline') {
           me.icn3d.bHighlight = 1;
       }
       else if(style === '3d') {
           me.icn3d.bHighlight = 2;
       }

       me.icn3d.draw();
  }
  else if(command.indexOf('add line') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');
    var p2Array = paraArray[2].split(' ');
    var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
    var dashed = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1) === 'true' ? true : false;
    var type = paraArray[5].substr(paraArray[5].lastIndexOf(' ') + 1);

    me.addLine(parseFloat(p1Array[1]), parseFloat(p1Array[3]), parseFloat(p1Array[5]), parseFloat(p2Array[1]), parseFloat(p2Array[3]), parseFloat(p2Array[5]), color, dashed, type);
    me.icn3d.draw();
  }
  else if(commandOri.indexOf('add label') == 0) {
    var paraArray = commandOri.split(' | ');
    var text = paraArray[0].substr(('add label').length + 1);

    // add label Text | x 40.45 y 24.465000000000003 z 53.48 | size 40 | color #ffff00 | background #cccccc | type custom
    var x,y,z, size, color, background, type;
    var bPosition = false;
    for(var i = 1, il = paraArray.length; i < il; ++i) {
        var wordArray = paraArray[i].split(' ');

        if(wordArray[0] == 'x') {
            bPosition = true;
            x = wordArray[1];
            y = wordArray[3];
            z = wordArray[5];
        }
        else if(wordArray[0] == 'size') {
            size = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
        }
        else if(wordArray[0] == 'color') {
            color = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
        }
        else if(wordArray[0] == 'background') {
            background = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
        }
        else if(wordArray[0] == 'type') {
            type = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
        }
    }

    if(!bPosition) {
      var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.hAtoms));
      x = position.center.x;
      y = position.center.y;
      z = position.center.z;
    }

    me.addLabel(text, x,y,z, size, color, background, type);
    me.icn3d.draw();
  }
  else if(commandOri.indexOf('msa') == 0) {
      //"msa | " + JSON.stringify(me.targetGapHash)
      var paraArray = commandOri.split(' | ');

      var pos_from_toArray = paraArray[1].split(' ');

      me.targetGapHash = {};
      for(var i = 0, il = pos_from_toArray.length; i < il; ++i) {
          var pos_from_to = pos_from_toArray[i].split('_');
          me.targetGapHash[parseInt(pos_from_to[0])] = {"from": parseInt(pos_from_to[1]), "to": parseInt(pos_from_to[2])};
      }

      me.resetAnnoAll();
  }
  else if(commandOri.indexOf('add track') == 0) {
      //"add track | chainid " + chainid + " | title " + title + " | text " + text
      // + " | type " + type + " | color " + color + " | msa " + color
      var paraArray = commandOri.split(' | ');

      var chainid = paraArray[1].substr(8);
      var title = paraArray[2].substr(6);
      var text = paraArray[3].substr(5);
      var type;
      if(paraArray.length >= 5) type = paraArray[4].substr(5);
      var color;
      if(paraArray.length >= 6) color = paraArray[5].substr(6);
      var msa;
      if(paraArray.length >= 7) msa = paraArray[6].substr(4);

      $("#" + me.pre + "anno_custom")[0].checked = true;
      $("[id^=" + me.pre + "custom]").show();

      if(color == '0') color = undefined;

      me.checkGiSeq(chainid, title, text, type, color, msa, 0);
  }
  else if(command.indexOf('remove one stabilizer') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');

    var rmLineArray = [];
    rmLineArray.push(parseInt(p1Array[0]));
    rmLineArray.push(parseInt(p1Array[1]));

    me.removeOneStabilizer(rmLineArray);

    //me.updateStabilizer();

    me.icn3d.draw();
  }
  else if(command.indexOf('add one stabilizer') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');

     if(me.icn3d.pairArray === undefined) me.icn3d.pairArray = [];
     me.icn3d.pairArray.push(parseInt(p1Array[0]));
     me.icn3d.pairArray.push(parseInt(p1Array[1]));

     //me.updateStabilizer();

     me.icn3d.draw();
  }
  else if(command.indexOf('select planes z-axis') == 0) {
    var paraArray = command.split(' ');
    if(paraArray.length == 5) {
        var large = parseFloat(paraArray[3]);
        var small = parseFloat(paraArray[4]);

        me.selectBtwPlanes(large, small);
    }
  }
  else if(command.indexOf('adjust membrane z-axis') == 0) {
    var paraArray = command.split(' ');
    if(paraArray.length == 5) {
        var large = parseFloat(paraArray[3]);
        var small = parseFloat(paraArray[4]);

        me.adjustMembrane(large, small);
    }
  }
  else if(command.indexOf('toggle membrane') == 0) {
    me.toggleMembrane();
  }
  else if(commandOri.indexOf('calc buried surface') == 0) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length == 2) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        me.calcBuriedSurface(nameArray2, nameArray);
    }
  }
/*
  else if(commandOri.indexOf('display interaction 3d') == 0) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length >= 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var interactionTypes = paraArray[2].split(',');

        var bHbondCalc;
        if(paraArray.length == 4) {
            bHbondCalc = (paraArray[3] == 'true') ? true : false;
        }

        me.displayInteraction3d(nameArray2, nameArray, bHbondCalc, interactionTypes);
    }
  }
*/
  else if(commandOri.indexOf('display interaction 3d') == 0
      || commandOri.indexOf('view interaction pairs') == 0
      || commandOri.indexOf('save1 interaction pairs') == 0
      || commandOri.indexOf('save2 interaction pairs') == 0
      ) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length >= 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var bHbond = paraArray[2].indexOf('hbonds') !== -1;
        var bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
        var bInteraction = paraArray[2].indexOf('interactions') !== -1;

        var bHalogen = paraArray[2].indexOf('halogen') !== -1;
        var bPication = paraArray[2].indexOf('pi-cation') !== -1;
        var bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

        var bHbondCalc;
        if(paraArray.length >= 4) {
            bHbondCalc = (paraArray[3] == 'true') ? true : false;
        }

        if(paraArray.length >= 5) {
           thresholdArray = paraArray[4].split(' ');

           if(thresholdArray.length >= 4) {
               $("#" + me.pre + "hbondthreshold").val(thresholdArray[1]);
               $("#" + me.pre + "saltbridgethreshold").val(thresholdArray[2]);
               $("#" + me.pre + "contactthreshold").val(thresholdArray[3]);

               if(thresholdArray.length == 7) {
                   $("#" + me.pre + "halogenthreshold").val(thresholdArray[1]);
                   $("#" + me.pre + "picationthreshold").val(thresholdArray[2]);
                   $("#" + me.pre + "pistackingthreshold").val(thresholdArray[3]);
               }
           }
        }

        var type;
        if(commandOri.indexOf('display interaction 3d') == 0) {
            type = '3d';
        }
        else if(commandOri.indexOf('view interaction pairs') == 0) {
            type = 'view';
        }
        else if(commandOri.indexOf('save1 interaction pairs') == 0) {
            type = 'save1';
        }
        else if(commandOri.indexOf('save2 interaction pairs') == 0) {
            type = 'save2';
        }

        me.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, type, bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
    }
  }
  else if(command.indexOf('graph label') == 0) {
    var pos = command.lastIndexOf(' ');
    var className = command.substr(pos + 1);

    $("#" + me.svgid + "_label").val(className);

    $("#" + me.svgid + " text").removeClass();
    $("#" + me.svgid + " text").addClass(className);
  }
/*
  else if(command.indexOf('graph center') == 0) {
    var pos = command.lastIndexOf(' ');
    me.pushcenter = parseInt(command.substr(pos + 1));

    $("#" + me.svgid + "_pushcenter").val(me.pushcenter);

    if(me.graphStr !== undefined && me.icn3d.bRender) {
       me.drawGraph(me.graphStr);
    }
  }
*/
  else if(command.indexOf('graph force') == 0) {
    var pos = command.lastIndexOf(' ');
    me.force = parseInt(command.substr(pos + 1));

    $("#" + me.svgid + "_force").val(me.force);

    me.handleForce();
  }
  else if(command.indexOf('hide edges') == 0) {
    var pos = command.lastIndexOf(' ');
    me.hideedges = parseInt(command.substr(pos + 1));

    $("#" + me.svgid + "_hideedges").val(me.hideedges);

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

    if(me.graphStr !== undefined && me.icn3d.bRender && me.force) {
       me.drawGraph(me.graphStr);
    }
  }
  else if(command.indexOf('reset interaction pairs') == 0) {
    me.resetInteractionPairs();
  }
  else if(command.indexOf('side by side') == 0) {
    var paraArray = command.split(' | ');
    var url = paraArray[1];

    window.open(url, '_blank');
  }
  else if(command.indexOf('your note') == 0) {
    var paraArray = command.split(' | ');
    var yournote = paraArray[1];

    $("#" + me.pre + "yournote").val(yournote);
    document.title = yournote;
  }

// start with, single word =============
  else if(command.indexOf('pickatom') == 0) {
    var atomid = parseInt(command.substr(command.lastIndexOf(' ') + 1));

    me.icn3d.pAtom = me.icn3d.atoms[atomid];

    me.icn3d.showPicking(me.icn3d.pAtom);
  }
  else if(commandOri.indexOf('color') == 0) {
    var strArray = commandOri.split(" | ");
    var color = strArray[0].substr(strArray[0].indexOf(' ') + 1);
    me.icn3d.opts['color'] = color;

    if(color == "residue custom" && strArray.length == 2) {
        me.icn3d.customResidueColors = JSON.parse(strArray[1]);
        for(var res in me.icn3d.customResidueColors) {
            me.icn3d.customResidueColors[res.toUpperCase()] = new THREE.Color("#" + me.icn3d.customResidueColors[res]);
        }
    }
    else if(color == "align custom" && strArray.length == 3) {
        var chainid = strArray[1];
        var resiScoreArray = strArray[2].split(', ');
        me.icn3d.queryresi2score = {};
        me.icn3d.queryresi2score[chainid] = {};
        for(var i = 0, il = resiScoreArray.length; i < il; ++i) {
            var resi_score = resiScoreArray[i].split(' ');

            me.icn3d.queryresi2score[chainid][resi_score[0]] = resi_score[1];
        }
    }
    else if(color == "align custom" && strArray.length == 4) {
        // me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
        me.setQueryresi2score(strArray);
    }
    else if(color == "area" && strArray.length == 2) {
        me.icn3d.midpercent = strArray[1];
        $("#" + me.pre + 'midpercent').val(me.icn3d.midpercent);
    }

    me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.hAtoms);

    me.updateHlAll();
  }
  else if(commandOri.indexOf('custom tube') == 0) {
    var strArray = commandOri.split(" | ");

    // me.setLogCmd('custom tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
    me.setQueryresi2score(strArray);

    me.setStyle('proteins', 'custom tube');
  }
  else if(command.indexOf('style') == 0) {
    var secondPart = command.substr(command.indexOf(' ') + 1);

    var selectionType = secondPart.substr(0, secondPart.indexOf(' '));
    var style = secondPart.substr(secondPart.indexOf(' ') + 1);

    me.setStyle(selectionType, style);
  }
  else if(command.indexOf('window') == 0) {
    var secondPart = command.substr(command.indexOf(' ') + 1);

    //if(secondPart == "window annotations") {
    //    me.openDialog(me.pre + 'dl_selectannotations', 'Sequences and Annotations');
    //}
    //else

    if(secondPart == "aligned sequences") {
        me.openDialog(me.pre + 'dl_alignment', 'Select residues in aligned sequences');
    }

    //else if(secondPart == "window interactions") {
    //    me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
    //}
    //else if(secondPart == "window defined sets") {
    //    me.openDialog(me.pre + 'dl_definedsets', 'Select sets');
    //}
  }

// special, select ==========

  else if(command.indexOf('select displayed set') !== -1) {
    me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.dAtoms);
    me.updateHlAll();
  }
  else if(command.indexOf('select prop') !== -1) {
    var paraArray = commandOri.split(' | ');

    var property = paraArray[0].substr('select prop'.length + 1);

    var from, to;
    if(paraArray.length == 2) {
        var from_to = paraArray[1].split('_');
        from = from_to[0];
        to = from_to[1];
    }

    me.selectProperty(property, from, to);
  }
  else if(command.indexOf('select') == 0 && command.indexOf('name') !== -1) {
    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = '', commandname = '', commanddesc = '';
    for (var i = 0, il = paraArray.length; i < il; ++i) {
        var para = paraArray[i];

        if(para.indexOf('select') !== -1) {
            select = para.substr(para.indexOf(' ') + 1);
        }
        else if(para.indexOf('name') !== -1) {
            commandname = para.substr(para.indexOf(' ') + 1);
        }
//        else if(para.indexOf('description') !== -1) {
//            commanddesc = para.substr(para.indexOf(' ') + 1);
//        }
    }

//    if(paraArray.length < 3) commanddesc = commandname;
    commanddesc = commandname;

    me.selectByCommand(select, commandname, commanddesc);
  }
  else if(command.indexOf('select $') !== -1 || command.indexOf('select .') !== -1 || command.indexOf('select :') !== -1 || command.indexOf('select @') !== -1) {
    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = paraArray[0].substr(paraArray[0].indexOf(' ') + 1);
    var commandname = '', commanddesc = '';

    if(paraArray.length > 1) {
        commandname = paraArray[1].substr(paraArray[1].indexOf(' ') + 1);
    }

    if(paraArray.length > 2) {
        commanddesc = paraArray[2].substr(paraArray[2].indexOf(' ') + 1);
    }

    if(select.indexOf(' or ') !== -1) { // "select " command without " | name"
        me.selectByCommand(select, commandname, commanddesc);
    }
    else { // only single query from selectByCommand()
        me.selectBySpec(select, commandname, commanddesc);
    }
  }

  if(bShowLog) {
      me.setLogCmd(commandOri, false);
  }

  me.bAddCommands = true;
};

iCn3DUI.prototype.setQueryresi2score = function(strArray) { var me = this; //"use strict";
    var chainid = strArray[1];
    var start_end = strArray[2].split(' ')[1].split('_');
    var resiScoreStr = strArray[3]; // score 0-9
    if(me.icn3d.queryresi2score === undefined) me.icn3d.queryresi2score = {};
    //if(me.icn3d.queryresi2score[chainid] === undefined) me.icn3d.queryresi2score[chainid] = {};
    me.icn3d.queryresi2score[chainid] = {};
    var factor = 100 / 9;
    for(var resi = parseInt(start_end[0]), i = 0; resi <= parseInt(start_end[1]); ++resi, ++i) {
        if(resiScoreStr[i] != '_') {
            me.icn3d.queryresi2score[chainid][resi] = parseInt(resiScoreStr[i]) * factor; // convert from 0-9 to 0-100
        }
    }
};