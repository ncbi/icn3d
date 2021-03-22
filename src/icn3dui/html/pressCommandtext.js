/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.pressCommandtext = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "logtext").keypress(function(e){ var ic = me.icn3d;
       me.bAddLogs = false; // turn off log
       var code = (e.keyCode ? e.keyCode : e.which);
       if(code == 13) { //Enter keycode
          e.preventDefault();
          var dataStr = $(this).val();
          ic.bRender = true;
          var commandArray = dataStr.split('\n');
          var lastCommand = commandArray[commandArray.length - 1].substr(2).trim(); // skip "> "
          ic.logs.push(lastCommand);
          $("#" + me.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
          if(lastCommand !== '') {
            var transformation = {};
            transformation.factor = ic._zoomFactor;
            transformation.mouseChange = ic.mouseChange;
            transformation.quaternion = ic.quaternion;
            ic.commands.push(lastCommand + '|||' + me.getTransformationStr(transformation));
            ic.optsHistory.push(ic.cloneHash(ic.opts));
            ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
            if(me.isSessionStorageSupported()) me.saveCommandsToSession();
            me.STATENUMBER = ic.commands.length;
            if(lastCommand.indexOf('load') !== -1) {
                me.applyCommandLoad(lastCommand);
            }
            else if(lastCommand.indexOf('set map') !== -1 && lastCommand.indexOf('set map wireframe') === -1) {
                me.applyCommandMap(lastCommand);
            }
            else if(lastCommand.indexOf('set emmap') !== -1 && lastCommand.indexOf('set emmap wireframe') === -1) {
                me.applyCommandEmmap(lastCommand);
            }
            else if(lastCommand.indexOf('set phi') !== -1) {
                me.applyCommandPhi(lastCommand);
            }
            else if(lastCommand.indexOf('set delphi') !== -1) {
                me.applyCommandDelphi(lastCommand);
            }
            else if(lastCommand.indexOf('view annotations') == 0
              //|| lastCommand.indexOf('set annotation cdd') == 0
              //|| lastCommand.indexOf('set annotation site') == 0
              ) {
                me.applyCommandAnnotationsAndCddSite(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation clinvar') == 0 ) {
                me.applyCommandClinvar(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation snp') == 0) {
                me.applyCommandSnp(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                me.applyCommand3ddomain(lastCommand);
            }
            else if(lastCommand.indexOf('set annotation all') == 0) {
                //$.when(me.applyCommandAnnotationsAndCddSite(lastCommand))
                //    .then(me.applyCommandSnpClinvar(lastCommand))
                $.when(me.applyCommandClinvar(lastCommand))
                    .then(me.applyCommandSnp(lastCommand))
                    .then(me.applyCommand3ddomain(lastCommand));
                me.setAnnoTabAll();
            }
            else if(lastCommand.indexOf('view interactions') == 0 && me.cfg.align !== undefined) {
                me.applyCommandViewinteraction(lastCommand);
            }
            else if(lastCommand.indexOf('symmetry') == 0) {
                var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                ic.symmetrytitle = (title === 'none') ? undefined : title;
                if(title !== 'none') {
                    if(ic.symmetryHash === undefined) {
                        me.applyCommandSymmetry(lastCommand);
                    }
                }
            }
            else if(lastCommand.indexOf('symd symmetry') == 0) {
                //var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                //ic.symdtitle = (title === 'none') ? undefined : title;
                //if(title !== 'none') {
                    //if(ic.symdHash === undefined) {
                        me.applyCommandSymd(lastCommand);
                    //}
                //}
            }
            else if(lastCommand.indexOf('scap ') == 0) {
                me.applyCommandScap(lastCommand);
            }
            else if(lastCommand.indexOf('realign on seq align') == 0) {
                var paraArray = lastCommand.split(' | ');
                if(paraArray.length == 2) {
                    var nameArray = paraArray[1].split(',');
                    ic.hAtoms = me.getAtomsFromNameArray(nameArray);
                }
                me.applyCommandRealign(lastCommand);
            }
            else if(lastCommand.indexOf('graph interaction pairs') == 0) {
                me.applyCommandGraphinteraction(lastCommand);
            }
            else {
                me.applyCommand(lastCommand + '|||' + me.getTransformationStr(transformation));
            }
            me.saveSelectionIfSelected();
            ic.draw();
          }
       }
       me.bAddLogs = true;
    });
};
