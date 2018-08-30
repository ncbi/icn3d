/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadScript = function (dataStr, bStatefile) { var me = this;
  // allow the "loading structure..." message to be shown while loading script
  me.bCommandLoad = true;

  me.icn3d.bRender = false;
  me.icn3d.bStopRotate = true;

  // firebase dynamic links replace " " with "+". So convert it back
  dataStr = dataStr.replace(/\+/g, ' ').replace(/;/g, '\n');

  var preCommands = [];
  if(me.icn3d.commands.length > 0) preCommands[0] = me.icn3d.commands[0];

  me.icn3d.commands = dataStr.split('\n');
  me.STATENUMBER = me.icn3d.commands.length;

  me.icn3d.commands = preCommands.concat(me.icn3d.commands);
  me.STATENUMBER = me.icn3d.commands.length;

  if(bStatefile !== undefined && bStatefile) {
      me.execCommands(0, me.STATENUMBER-1, me.STATENUMBER);
  }
  else {
      // skip the first loading step
      me.execCommands(1, me.STATENUMBER-1, me.STATENUMBER);
  }
};

iCn3DUI.prototype.loadSelection = function (dataStr) { var me = this;
  var nameCommandArray = dataStr.trim().split('\n');

  for(var i = 0, il = nameCommandArray.length; i < il; ++i) {
      var nameCommand = nameCommandArray[i].split('\t');
      var name = nameCommand[0];
      var command = nameCommand[1];

      var pos = command.indexOf(' '); // select ...

      me.selectByCommand(command.substr(pos + 1), name, name, false);
  }
};

iCn3DUI.prototype.execCommands = function (start, end, steps) { var me = this;
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

iCn3DUI.prototype.execCommandsBase = function (start, end, steps) { var me = this;
  for(var i=start; i <= end; ++i) {
      if(me.icn3d.commands[i].indexOf('load') !== -1) {
          if(end === 0 && start === end) {
              if(me.bNotLoadStructure) {
                    me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.atoms);
                    me.icn3d.bRender = true;

                    // end of all commands
                    if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                    me.renderFinalStep(steps);                  }
              else {
                  $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {
                    me.icn3d.bRender = true;

                    // end of all commands
                    if(1 === me.icn3d.commands.length) me.bAddCommands = true;
                    me.renderFinalStep(steps);
                  });
              }
              return;
          }
          else {
              if(me.bNotLoadStructure) {
                  me.icn3d.hAtoms = me.icn3d.cloneHash(me.icn3d.atoms);

                  // undo/redo requires render the first step
                  if(me.backForward !== undefined && me.backForward) me.renderFinalStep(1);

                  me.execCommandsBase(i + 1, end, steps);
              }
              else {
                  $.when(me.applyCommandLoad(me.icn3d.commands[i])).then(function() {
                      // undo/redo requires render the first step
                      if(me.backForward !== undefined && me.backForward) me.renderFinalStep(1);

                      me.execCommandsBase(i + 1, end, steps);
                  });
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
              if(Object.keys(me.icn3d.proteins).length == 0) {
                  me.applyCommandAnnotationsAndCddSiteBase(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(me.icn3d.commands[i].trim().indexOf('set annotation clinvar') == 0
        || me.icn3d.commands[i].trim().indexOf('set annotation snp') == 0) { // the command may have "|||{"factor"...
          var strArray = me.icn3d.commands[i].split("|||");

          if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar) ) {
              $.when(me.applyCommandSnpClinvar(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(me.icn3d.proteins).length == 0) {
                  me.applyCommandSnpClinvar(strArray[0].trim());
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
              if(Object.keys(me.icn3d.proteins).length == 0) {
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

          if( Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar)
            && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) ) {
              $.when(me.applyCommandSnpClinvar(strArray[0].trim()))
                .then(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(me.icn3d.proteins).length > 0 && (me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar) ) {
              $.when(me.applyCommandSnpClinvar(strArray[0].trim()))
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
              if(Object.keys(me.icn3d.proteins).length == 0) {
                  if((me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar)
                    && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)) {
                      me.applyCommandSnpClinvarBase(strArray[0].trim());
                      me.applyCommand3ddomainBase(strArray[0].trim());
                  }
                  else if(me.bAjaxSnpClinvar === undefined || !me.bAjaxSnpClinvar) {
                      me.applyCommandSnpClinvarBase(strArray[0].trim());
                  }
                  else if(me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) {
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
      else {
          me.applyCommand(me.icn3d.commands[i]);
      }
  }

  //if(i === steps - 1) {
  if(i === steps) {
      // enable me.hideLoading
      me.bCommandLoad = false;

      // hide "loading ..."
      me.hideLoading();

      me.icn3d.bRender = true;

      // end of all commands
      if(i + 1 === me.icn3d.commands.length) me.bAddCommands = true;

      me.renderFinalStep(steps);
  }
};

iCn3DUI.prototype.renderFinalStep = function(steps) { var me = this;
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
        me.icn3d.draw();
    }
};

iCn3DUI.prototype.applyCommandLoad = function (commandStr) { var me = this;
  //me.bCommandLoad = true;

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
    else if(command.indexOf('load cid') !== -1) {
      me.cfg.cid = id;
      me.downloadCid(id);
    }
    else if(command.indexOf('load align') !== -1) {
      me.cfg.align = id;
      me.downloadAlignment(id);
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

iCn3DUI.prototype.applyCommandAnnotationsAndCddSiteBase = function (command) { var me = this;
  // chain functions together
      if(command == "view annotations") {
          if(me.cfg.showanno === undefined || !me.cfg.showanno) {
              me.showAnnotations();
          }
      }
};

iCn3DUI.prototype.applyCommandAnnotationsAndCddSite = function (command) { var me = this;
  // chain functions together
  me.deferredAnnoCddSite = $.Deferred(function() {
      me.applyCommandAnnotationsAndCddSiteBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredAnnoCddSite.promise();
};

iCn3DUI.prototype.applyCommandSnpClinvarBase = function (command) { var me = this;
  // chain functions together
      var pos = command.lastIndexOf(' '); // set annotation clinvar
      var type = command.substr(pos + 1);

      if(type == 'clinvar') {
          me.setAnnoTabClinvar();
      }
      else if(type == 'snp') {
          me.setAnnoTabSnp();
      }
      else if(type == 'all') {
          me.setAnnoTabClinvar();
          me.setAnnoTabSnp();
      }
};

iCn3DUI.prototype.applyCommandSnpClinvar = function (command) { var me = this;
  // chain functions together
  me.deferredSnpClinvar = $.Deferred(function() {
      me.applyCommandSnpClinvarBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSnpClinvar.promise();
};

iCn3DUI.prototype.applyCommand3ddomainBase = function (command) { var me = this;
  // chain functions together
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == '3ddomain' || type == 'all') {
          me.setAnnoTab3ddomain();
      }
};

iCn3DUI.prototype.applyCommand3ddomain = function (command) { var me = this;
  // chain functions together
  me.deferred3ddomain = $.Deferred(function() {
      me.applyCommand3ddomainBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferred3ddomain.promise();
};

iCn3DUI.prototype.applyCommandViewinteractionBase = function (command) { var me = this;
  // chain functions together
     if(me.cfg.align !== undefined) {
         var structureArray = Object.keys(me.icn3d.structures);
         me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
     }
};

iCn3DUI.prototype.applyCommandViewinteraction = function (command) { var me = this;
  // chain functions together
  me.deferredViewinteraction = $.Deferred(function() {
     me.applyCommandViewinteractionBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredViewinteraction.promise();
};

iCn3DUI.prototype.applyCommand = function (commandStr) { var me = this;
  me.bAddCommands = false;

  var commandTransformation = commandStr.split('|||');

  var commandOri = commandTransformation[0].replace(/\s+/g, ' ').trim();
  var command = commandOri.toLowerCase();

  var bShowLog = true;

// exact match =============

  if(command == 'export state file') { // last step to update transformation
    // the last transformation will be applied
  }
  else if(command == 'export canvas') {
    setTimeout(function(){
           me.saveFile(me.inputid + '.png', 'png');
        }, 500);
  }
  else if(command == 'export interactions') {
    me.exportInteractions();
  }
  else if(command == 'export stl file') {
    setTimeout(function(){
           //me.hideStabilizer();

           var text = me.saveStlFile();
           me.saveFile(me.inputid + '.stl', 'binary', text);
           text = '';
        }, 500);
  }
  else if(command == 'export vrml file') {
    setTimeout(function(){
           //me.hideStabilizer();

           var text = me.saveVrmlFile();
           me.saveFile(me.inputid + '.wrl', 'text', text);
           text = '';
        }, 500);
  }
  else if(command == 'export stl stabilizer file') {
    setTimeout(function(){
           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           var text = me.saveStlFile();

           //me.hideStabilizer();
           //me.icn3d.bRender = true;
           //me.icn3d.draw();

           me.saveFile(me.inputid + '_stab.stl', 'binary', text);
           text = '';
        }, 500);
  }
  else if(command == 'export vrml stabilizer file') {
    setTimeout(function(){
           //me.icn3d.bRender = false;

           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           var text = me.saveVrmlFile();

           //me.hideStabilizer();
           //me.icn3d.bRender = true;
           //me.icn3d.draw();

           me.saveFile(me.inputid + '_stab.wrl', 'text', text);
           text = '';
        }, 500);
  }
  else if(command == 'select all') {
     me.selectAll();
     //me.icn3d.addHlObjects();
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
  else if(command == 'set pk chain') {
    me.icn3d.pk = 4;
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
  }
  else if(command == 'set fog off') {
    me.icn3d.opts['fog'] = 'no';
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
  else if(command == 'set stabilizer off') {
    me.hideStabilizer();
    me.icn3d.draw();
  }
  else if(command == 'set disulfide bonds off') {
    me.icn3d.opts["ssbonds"] = "no";
    me.icn3d.draw();
  }
  else if(command == 'set cross linkage off') {
    me.icn3d.bShowCrossResidueBond = false;
    //me.opts['proteins'] = 'ribbon';
    //me.icn3d.draw();
    me.setStyle('proteins', 'ribbon')
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
  }
  else if(command == 'add residue labels') {
    me.icn3d.addResiudeLabels(me.icn3d.hAtoms);

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
  else if(command === 'reset') {
    //location.reload();
    me.icn3d.reinitAfterLoad();
    me.renderFinalStep(1);

    // need to render
    me.icn3d.render();
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
    //if(me.icn3d.prevHighlightObjects.length > 0) { // remove
        me.icn3d.removeHlObjects();
        me.removeHl2D();
        me.icn3d.bShowHighlight = false;
    //}
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
  else if(command == 'output selection') {
      me.outputSelection();
  }
  else if(command == 'toggle selection') {
     me.toggleSelection();
  }
  else if(command == 'toggle highlight') {
    if(me.icn3d.prevHighlightObjects.length > 0) { // remove
        me.icn3d.removeHlObjects();
        me.icn3d.bShowHighlight = false;
    }
    else { // add
        me.icn3d.addHlObjects();
        me.icn3d.bShowHighlight = true;
    }
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
    me.icn3d.bShowCrossResidueBond = true;

    me.setStyle('proteins', 'lines')
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

// start with =================
  else if(commandOri.indexOf('select interaction') == 0) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
    if(idArray !== null) {
        var mmdbid = idArray[0].split('_')[0];
        if(!me.b2DShown) me.download2Ddgm(mmdbid.toUpperCase());

        me.selectInteraction(idArray[0], idArray[1]);
    }
  }

  else if(commandOri.indexOf('select saved atoms') == 0) {
    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = paraArray[0].replace(/,/g, ' or ');

    var commandname;
    if(paraArray.length == 2) commandname = paraArray[1].substr(5); // 'name ...'

/*
    var pos = 19; // 'select saved atoms '

    if(select.indexOf(' and ') !== -1) {
        // all sets are intersected with the command "and"
        var idArray = select.substr(pos).split(' and ');

        var bIntersection = true;
        if(idArray !== null) me.changeCustomAtoms(idArray, undefined, bIntersection, commandname);
    }
    else {
        //var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        var idArray = select.substr(pos).split(',');

        var bIntersection = false;
        if(idArray !== null) me.changeCustomAtoms(idArray, undefined, bIntersection, commandname);
    }
*/

    var pos = 19; // 'select saved atoms '
    var strSets = select.substr(pos);

    me.selectCombinedSets(strSets, commandname);
  }
  else if(commandOri.indexOf('select chain') !== -1) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

    //if(idArray !== null) me.changeChainid(idArray);
    for(var i = 0, il = idArray.length; i < il; ++i) {
        me.selectAChain(idArray[i], idArray[i]);
    }
  }
  else if(command.indexOf('select zone cutoff') == 0) {
    var radius = parseFloat(command.substr(command.lastIndexOf(' ') + 1));

    me.pickCustomSphere(radius);
  }
  else if(command.indexOf('set surface opacity') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['opacity'] = value;
    me.icn3d.applySurfaceOptions();
  }
  else if(command.indexOf('set surface') == 0) {
    var value = command.substr(12);

    me.icn3d.opts['surface'] = value;
    me.icn3d.applySurfaceOptions();
  }
  else if(command.indexOf('set camera') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['camera'] = value;
  }
  else if(command.indexOf('set background') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    me.icn3d.opts['background'] = value;
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
    for(var i = 1, il = paraArray.length; i < il; ++i) {
        var wordArray = paraArray[i].split(' ');

        var bPosition = false;
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

        if(!bPosition) {
          var position = me.icn3d.centerAtoms(me.icn3d.hash2Atoms(me.icn3d.hAtoms));
          x = position.center.x;
          y = position.center.y;
          z = position.center.z;
        }
    }

    me.addLabel(text, x,y,z, size, color, background, type);
    me.icn3d.draw();
  }
  else if(commandOri.indexOf('add track') == 0) {
      //"add track | chainid " + chainid + " | title " + title + " | text " + text
      var paraArray = commandOri.split(' | ');

      var chainid = paraArray[1].substr(8).toUpperCase();
      var title = paraArray[2].substr(6);
      var text = paraArray[3].substr(5);

      $("#" + me.pre + "anno_custom")[0].checked = true;
      $("[id^=" + me.pre + "custom]").show();

      me.checkGiSeq(chainid, title, text, 0);
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

// start with, single word =============
  else if(command.indexOf('pickatom') == 0) {
    var atomid = parseInt(command.substr(command.lastIndexOf(' ') + 1));

    me.icn3d.pAtom = me.icn3d.atoms[atomid];

    me.icn3d.showPicking(me.icn3d.pAtom);
  }
  else if(command.indexOf('hbonds') == 0) {
    var threshold = parseFloat(command.substr(command.indexOf(' ') + 1));

    if(!isNaN(threshold)) me.showHbonds(threshold);
  }
  else if(command.indexOf('color') == 0) {
    var color = command.substr(command.indexOf(' ') + 1);
    me.icn3d.opts['color'] = color;

    me.icn3d.setColorByOptions(me.icn3d.opts, me.icn3d.hAtoms);

    me.updateHlAll();
  }
  else if(command.indexOf('style') == 0) {
    var secondPart = command.substr(command.indexOf(' ') + 1);

    var selectionType = secondPart.substr(0, secondPart.indexOf(' '));
    var style = secondPart.substr(secondPart.indexOf(' ') + 1);

    me.setStyle(selectionType, style);
  }

// special, select ==========

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
