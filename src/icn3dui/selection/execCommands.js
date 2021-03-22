/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.execCommands = function (start, end, steps) { var me = this, ic = me.icn3d; "use strict";
    ic.bRender = false;

    // fresh start
    ic.reinitAfterLoad();

    ic.opts = ic.cloneHash(me.opts);

    //me.execCommandsBase(0, steps-1, steps);
    me.execCommandsBase(start, end, steps);
};

iCn3DUI.prototype.execCommandsBase = function (start, end, steps, bFinalStep) { var me = this, ic = me.icn3d; "use strict";
  var i;
  for(i=start; i <= end; ++i) {
      var bFinalStep = (i === steps - 1) ? true : false;

      if(ic.commands[i].indexOf('load') !== -1) {
          if(end === 0 && start === end) {
              if(me.bNotLoadStructure) {
                    ic.hAtoms = ic.cloneHash(ic.atoms);

                    // end of all commands
                    if(1 === ic.commands.length) me.bAddCommands = true;
                    if(bFinalStep) me.renderFinalStep(steps);                  }
              else {
                  $.when(me.applyCommandLoad(ic.commands[i])).then(function() {

                    // end of all commands
                    if(1 === ic.commands.length) me.bAddCommands = true;
                    if(bFinalStep) me.renderFinalStep(steps);
                  });
              }
              return;
          }
          else {
              if(me.bNotLoadStructure) {
                  ic.hAtoms = ic.cloneHash(ic.atoms);

                  // undo/redo requires render the first step
                  if(me.backForward) me.renderFinalStep(1);

                  me.execCommandsBase(i + 1, end, steps);
              }
              else {
                  $.when(me.applyCommandLoad(ic.commands[i])).then(function() {
                      // undo/redo requires render the first step
                      if(me.backForward) me.renderFinalStep(1);

                      me.execCommandsBase(i + 1, end, steps);
                  });
              }

              return;
          }
      }
      else if(ic.commands[i].trim().indexOf('set map') == 0 && ic.commands[i].trim().indexOf('set map wireframe') == -1) {
          //set map 2fofc sigma 1.5
          var strArray = ic.commands[i].split("|||");

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
      else if(ic.commands[i].trim().indexOf('set emmap') == 0 && ic.commands[i].trim().indexOf('set emmap wireframe') == -1) {
          //set emmap percentage 70
          var strArray = ic.commands[i].split("|||");

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
      else if(ic.commands[i].trim().indexOf('set phi') == 0) {
          var strArray = ic.commands[i].split("|||");

          $.when(me.applyCommandPhi(strArray[0].trim())).then(function() {
              me.execCommandsBase(i + 1, end, steps);
          });

          return;
      }
      else if(ic.commands[i].trim().indexOf('set delphi') == 0) {
          var strArray = ic.commands[i].split("|||");

          $.when(me.applyCommandDelphi(strArray[0].trim())).then(function() {
              me.execCommandsBase(i + 1, end, steps);
          });

          return;
      }
      else if(ic.commands[i].trim().indexOf('view annotations') == 0
        //|| ic.commands[i].trim().indexOf('set annotation cdd') == 0
        //|| ic.commands[i].trim().indexOf('set annotation site') == 0
        ) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");
          if(Object.keys(ic.proteins).length > 0 && (me.bAjaxCddSite === undefined || !me.bAjaxCddSite) ) {
              $.when(me.applyCommandAnnotationsAndCddSite(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(ic.proteins).length > 0) {
                  me.applyCommandAnnotationsAndCddSiteBase(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(ic.commands[i].trim().indexOf('set annotation clinvar') == 0 ) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");

          if(Object.keys(ic.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar) ) {
              $.when(me.applyCommandClinvar(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(ic.proteins).length > 0) {
                  me.applyCommandClinvar(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(ic.commands[i].trim().indexOf('set annotation snp') == 0) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");

          if(Object.keys(ic.proteins).length > 0 && (me.bAjaxSnp === undefined || !me.bAjaxSnp) ) {
              $.when(me.applyCommandSnp(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(ic.proteins).length > 0) {
                  me.applyCommandSnp(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(ic.commands[i].trim().indexOf('set annotation 3ddomain') == 0) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");

          if(Object.keys(ic.proteins).length > 0 && me.mmdb_data === undefined && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain)) {
              $.when(me.applyCommand3ddomain(strArray[0].trim())).then(function() {
                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(ic.proteins).length > 0) {
                  me.applyCommand3ddomain(strArray[0].trim());
              }

              me.execCommandsBase(i + 1, end, steps);
          }

          return;
      }
      else if(ic.commands[i].trim().indexOf('set annotation all') == 0) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");
          //$.when(me.applyCommandAnnotationsAndCddSite(strArray[0].trim()))
          //  .then(me.applyCommandSnpClinvar(strArray[0].trim()))

          if( Object.keys(ic.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
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
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
            && (me.bAjaxSnp === undefined || !me.bAjaxSnp)) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar)
            && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined)
            && (me.bAjaxSnp === undefined || !me.bAjaxSnp)) {
              $.when(me.applyCommand3ddomain(strArray[0].trim()))
                .then(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjaxClinvar === undefined || !me.bAjaxClinvar) ) {
              $.when(me.applyCommandClinvar(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjaxSnp === undefined || !me.bAjaxSnp) ) {
              $.when(me.applyCommandSnp(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else if(Object.keys(ic.proteins).length > 0 && (me.bAjax3ddomain === undefined || !me.bAjax3ddomain || me.mmdb_data === undefined) ) {
              $.when(me.applyCommand3ddomain(strArray[0].trim()))
                .then(function() {
                  me.setAnnoTabAll();

                  me.execCommandsBase(i + 1, end, steps);
              });
          }
          else {
              if(Object.keys(ic.proteins).length > 0) {
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
      else if(ic.commands[i].trim().indexOf('view interactions') == 0 && me.cfg.align !== undefined) { // the command may have "|||{"factor"...
          var strArray = ic.commands[i].split("|||");

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
      else if(ic.commands[i].trim().indexOf('symmetry') == 0) {
        var strArray = ic.commands[i].split("|||");
        var command = strArray[0].trim();

        var title = command.substr(command.indexOf(' ') + 1);
        ic.symmetrytitle = (title === 'none') ? undefined : title;

        if(title !== 'none') {
            if(ic.symmetryHash === undefined) {
                $.when(me.applyCommandSymmetry(command)).then(function() {
                   //if(!me.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

                   ic.draw();
                   me.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                ic.draw();
                me.execCommandsBase(i + 1, end, steps);
            }
        }
        else {
            ic.draw();
            me.execCommandsBase(i + 1, end, steps);
        }

        return;
      }
      else if(ic.commands[i].trim().indexOf('symd symmetry') == 0) {
        var strArray = ic.commands[i].split("|||");
        var command = strArray[0].trim();

        //var title = command.substr(command.lastIndexOf(' ') + 1);
        //ic.symdtitle = (title === 'none') ? undefined : title;

        //if(title !== 'none') {
//            if(ic.symdHash === undefined) {
                $.when(me.applyCommandSymd(command)).then(function() {
                   //if(!me.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

                   ic.draw();
                   me.execCommandsBase(i + 1, end, steps);
                });
//            }
//            else {
//                ic.draw();
//                me.execCommandsBase(i + 1, end, steps);
//            }
        //}
        //else {
        //    ic.draw();
        //    me.execCommandsBase(i + 1, end, steps);
        //}

        return;
      }
      else if(ic.commands[i].trim().indexOf('scap') == 0) {
        var strArray = ic.commands[i].split("|||");
        var command = strArray[0].trim();

        $.when(me.applyCommandScap(command)).then(function() {
           //if(!me.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

           //ic.draw();
           me.execCommandsBase(i + 1, end, steps);
        });

        return;
      }
      else if(ic.commands[i].trim().indexOf('realign on seq align') == 0) {
        var strArray = ic.commands[i].split("|||");
        var command = strArray[0].trim();

        var paraArray = command.split(' | ');
        if(paraArray.length == 2) {
            var nameArray = paraArray[1].split(',');
            ic.hAtoms = me.getAtomsFromNameArray(nameArray);
        }

        $.when(me.applyCommandRealign(command)).then(function() {
           me.execCommandsBase(i + 1, end, steps);
        });

        return;
      }
      else if(ic.commands[i].trim().indexOf('graph interaction pairs') == 0) {
        var strArray = ic.commands[i].split("|||");
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
          me.applyCommand(ic.commands[i]);
      }
  }

  //if(i === steps - 1) {
  if(i === steps || bFinalStep) {
/*
      // enable me.hideLoading
      me.bCommandLoad = false;

      // hide "loading ..."
      me.hideLoading();

      //ic.bRender = true;

      // end of all commands
      if(i + 1 === ic.commands.length) me.bAddCommands = true;
*/
      me.renderFinalStep(i);
  }
};
