/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {Delphi} from '../analysis/delphi.js';
import {Scap} from '../analysis/scap.js';
import {Symd} from '../analysis/symd.js';
import {Draw} from '../display/draw.js';
import {Annotation} from '../annotations/annotation.js';
import {ApplyCommand} from '../selection/applyCommand.js';
import {DefinedSets} from '../selection/definedSets.js';
import {ParserUtils} from '../parsers/parserUtils.js';
import {MmcifParser} from '../parsers/mmcifParser.js';
import {MmdbParser} from '../parsers/mmdbParser.js';
import {MmtfParser} from '../parsers/mmtfParser.js';
import {OpmParser} from '../parsers/opmParser.js';
import {PdbParser} from '../parsers/pdbParser.js';
import {AlignParser} from '../parsers/alignParser.js';
import {ChainalignParser} from '../parsers/chainalignParser.js';
import {Dsn6Parser} from '../parsers/dsn6Parser.js';
import {RealignParser} from '../parsers/realignParser.js';
import {Selection} from '../selection/selection.js';
import {ViewInterPairs} from '../interaction/viewInterPairs.js';
import {ShowAnno} from '../annotations/showAnno.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';

class LoadScript {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Run commands one after another. The commands can be semicolon ';' or new line '\n' separated.
    loadScript(dataStr, bStatefile) { let  ic = this.icn3d, me = ic.icn3dui;
      // allow the "loading structure..." message to be shown while loading script
      ic.bCommandLoad = true;

      ic.bRender = false;
      ic.bStopRotate = true;

      // firebase dynamic links replace " " with "+". So convert it back
      dataStr =(bStatefile) ? dataStr.replace(/\+/g, ' ') : dataStr.replace(/\+/g, ' ').replace(/;/g, '\n');

      let  preCommands = [];
      if(ic.commands.length > 0) preCommands[0] = ic.commands[0];

      let  commandArray = dataStr.trim().split('\n');
      ic.commands = commandArray;

      let  pos = commandArray[0].indexOf('command=');
      if(bStatefile && pos != -1) {
          let  commandFirst = commandArray[0].substr(0, pos - 1);
          ic.commands.splice(0, 1, commandFirst);
      }

      //ic.commands = dataStr.trim().split('\n');
      ic.STATENUMBER = ic.commands.length;

      ic.commands = preCommands.concat(ic.commands);
      ic.STATENUMBER = ic.commands.length;

    /*
      if(bStatefile || ic.bReplay) {
          ic.CURRENTNUMBER = 0;
      }
      else {
          // skip the first loading step
          ic.CURRENTNUMBER = 1;
      }
    */

      ic.CURRENTNUMBER = 0;

      if(ic.bReplay) {
          this.replayFirstStep(ic.CURRENTNUMBER);
      }
      else {
          this.execCommands(ic.CURRENTNUMBER, ic.STATENUMBER-1, ic.STATENUMBER);
      }
    }

    //Execute a list of commands. "steps" is the total number of commands.
    execCommands(start, end, steps) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.bRender = false;

        // fresh start
        ic.reinitAfterLoad();

        //ic.opts = me.hashUtilsCls.cloneHash(ic.opts);

        this.execCommandsBase(start, end, steps);
    }

    execCommandsBase(start, end, steps, bFinalStep) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;
      let  i;
      for(i=start; i <= end; ++i) {
          let  bFinalStep =(i === steps - 1) ? true : false;

          if(!ic.commands[i]) continue;

          if(ic.commands[i].indexOf('load') !== -1) {
              if(end === 0 && start === end) {
                  if(ic.bNotLoadStructure) {
                        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

                        // end of all commands
                        if(1 === ic.commands.length) ic.bAddCommands = true;
                        if(bFinalStep) this.renderFinalStep(steps);                  }
                  else {
                      $.when(thisClass.applyCommandLoad(ic.commands[i])).then(function() {

                        // end of all commands
                        if(1 === ic.commands.length) ic.bAddCommands = true;
                        if(bFinalStep) thisClass.renderFinalStep(steps);
                      });
                  }
                  return;
              }
              else {
                  if(ic.bNotLoadStructure) {
                      ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

                      // undo/redo requires render the first step
                      if(ic.backForward) this.renderFinalStep(1);

                      this.execCommandsBase(i + 1, end, steps);
                  }
                  else {
                      $.when(thisClass.applyCommandLoad(ic.commands[i])).then(function() {
                          // undo/redo requires render the first step
                          if(ic.backForward) thisClass.renderFinalStep(1);

                          thisClass.execCommandsBase(i + 1, end, steps);
                      });
                  }

                  return;
              }
          }
          else if(ic.commands[i].trim().indexOf('set map') == 0 && ic.commands[i].trim().indexOf('set map wireframe') == -1) {
              //set map 2fofc sigma 1.5
              let  strArray = ic.commands[i].split("|||");

              let  urlArray = strArray[0].trim().split(' | ');

              let  str = urlArray[0].substr(8);
              let  paraArray = str.split(" ");

              if(paraArray.length == 3 && paraArray[1] == 'sigma') {
                let  sigma = paraArray[2];
                let  type = paraArray[0];

                if((type == '2fofc' &&(ic.bAjax2fofc === undefined || !ic.bAjax2fofc))
                  ||(type == 'fofc' &&(ic.bAjaxfofc === undefined || !ic.bAjaxfofc)) ) {
                    $.when(thisClass.applyCommandMap(strArray[0].trim())).then(function() {
                        thisClass.execCommandsBase(i + 1, end, steps);
                    });
                }
                else {
                    thisClass.applyCommandMap(strArray[0].trim());
                    this.execCommandsBase(i + 1, end, steps);
                }

                return;
              }
          }
          else if(ic.commands[i].trim().indexOf('set emmap') == 0 && ic.commands[i].trim().indexOf('set emmap wireframe') == -1) {
              //set emmap percentage 70
              let  strArray = ic.commands[i].split("|||");

              let  str = strArray[0].trim().substr(10);
              let  paraArray = str.split(" ");

              if(paraArray.length == 2 && paraArray[0] == 'percentage') {
                let  percentage = paraArray[1];

                if(ic.bAjaxEm === undefined || !ic.bAjaxEm) {
                    $.when(thisClass.applyCommandEmmap(strArray[0].trim())).then(function() {
                        thisClass.execCommandsBase(i + 1, end, steps);
                    });
                }
                else {
                    thisClass.applyCommandEmmap(strArray[0].trim());
                    this.execCommandsBase(i + 1, end, steps);
                }

                return;
              }
          }
          else if(ic.commands[i].trim().indexOf('set phi') == 0) {
              let  strArray = ic.commands[i].split("|||");

              $.when(ic.delphiCls.applyCommandPhi(strArray[0].trim())).then(function() {
                  thisClass.execCommandsBase(i + 1, end, steps);
              });

              return;
          }
          else if(ic.commands[i].trim().indexOf('set delphi') == 0) {
              let  strArray = ic.commands[i].split("|||");

              $.when(ic.delphiCls.applyCommandDelphi(strArray[0].trim())).then(function() {
                  thisClass.execCommandsBase(i + 1, end, steps);
              });

              return;
          }
          else if(ic.commands[i].trim().indexOf('view annotations') == 0
            //|| ic.commands[i].trim().indexOf('set annotation cdd') == 0
            //|| ic.commands[i].trim().indexOf('set annotation site') == 0
            ) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");
              if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxCddSite === undefined || !ic.bAjaxCddSite) ) {
                  $.when(thisClass.applyCommandAnnotationsAndCddSite(strArray[0].trim())).then(function() {
                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  if(Object.keys(ic.proteins).length > 0) {
                      thisClass.applyCommandAnnotationsAndCddSiteBase(strArray[0].trim());
                  }

                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('set annotation clinvar') == 0 ) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");

              if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxClinvar === undefined || !ic.bAjaxClinvar) ) {
                  $.when(thisClass.applyCommandClinvar(strArray[0].trim())).then(function() {
                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  if(Object.keys(ic.proteins).length > 0) {
                      thisClass.applyCommandClinvar(strArray[0].trim());
                  }

                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('set annotation snp') == 0) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");

              if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxSnp === undefined || !ic.bAjaxSnp) ) {
                  $.when(thisClass.applyCommandSnp(strArray[0].trim())).then(function() {
                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  if(Object.keys(ic.proteins).length > 0) {
                      thisClass.applyCommandSnp(strArray[0].trim());
                  }

                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('set annotation 3ddomain') == 0) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");

              if(Object.keys(ic.proteins).length > 0 && ic.mmdb_data === undefined &&(ic.bAjax3ddomain === undefined || !ic.bAjax3ddomain)) {
                  $.when(thisClass.applyCommand3ddomain(strArray[0].trim())).then(function() {
                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  if(Object.keys(ic.proteins).length > 0) {
                      thisClass.applyCommand3ddomain(strArray[0].trim());
                  }

                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('set annotation all') == 0) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");
              //$.when(thisClass.applyCommandAnnotationsAndCddSite(strArray[0].trim()))
              //  .then(thisClass.applyCommandSnpClinvar(strArray[0].trim()))

              if( Object.keys(ic.proteins).length > 0 &&(ic.bAjaxClinvar === undefined || !ic.bAjaxClinvar)
                &&(ic.bAjaxSnp === undefined || !ic.bAjaxSnp)
                &&(ic.bAjax3ddomain === undefined || !ic.bAjax3ddomain || ic.mmdb_data === undefined) ) {
                  $.when(thisClass.applyCommandClinvar(strArray[0].trim()))
                    .then(thisClass.applyCommandSnp(strArray[0].trim()))
                    .then(thisClass.applyCommand3ddomain(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxClinvar === undefined || !ic.bAjaxClinvar)
                &&(ic.bAjaxSnp === undefined || !ic.bAjaxSnp)) {
                  $.when(thisClass.applyCommandClinvar(strArray[0].trim()))
                    .then(thisClass.applyCommandSnp(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxClinvar === undefined || !ic.bAjaxClinvar)
                &&(ic.bAjax3ddomain === undefined || !ic.bAjax3ddomain || ic.mmdb_data === undefined)) {
                  $.when(thisClass.applyCommandClinvar(strArray[0].trim()))
                    .then(thisClass.applyCommand3ddomain(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjax3ddomain === undefined || !ic.bAjax3ddomain || ic.mmdb_data === undefined)
                &&(ic.bAjaxSnp === undefined || !ic.bAjaxSnp)) {
                  $.when(thisClass.applyCommand3ddomain(strArray[0].trim()))
                    .then(thisClass.applyCommandSnp(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxClinvar === undefined || !ic.bAjaxClinvar) ) {
                  $.when(thisClass.applyCommandClinvar(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjaxSnp === undefined || !ic.bAjaxSnp) ) {
                  $.when(thisClass.applyCommandSnp(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else if(Object.keys(ic.proteins).length > 0 &&(ic.bAjax3ddomain === undefined || !ic.bAjax3ddomain || ic.mmdb_data === undefined) ) {
                  $.when(thisClass.applyCommand3ddomain(strArray[0].trim()))
                    .then(function() {
                      ic.annotationCls.setAnnoTabAll();

                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  if(Object.keys(ic.proteins).length > 0) {
                      if(ic.bAjaxClinvar) {
                          thisClass.applyCommandClinvarBase(strArray[0].trim());
                      }

                      if(ic.bAjaxSnp) {
                          thisClass.applyCommandSnpBase(strArray[0].trim());
                      }

                      if(ic.bAjax3ddomain || ic.mmdb_data !== undefined) {
                          thisClass.applyCommand3ddomainBase(strArray[0].trim());
                      }
                  }

                  ic.annotationCls.setAnnoTabAll();

                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('view interactions') == 0 && ic.icn3dui.cfg.align !== undefined) { // the command may have "|||{"factor"...
              let  strArray = ic.commands[i].split("|||");

              if(ic.b2DShown === undefined || !ic.b2DShown) {
                  $.when(thisClass.applyCommandViewinteraction(strArray[0].trim())).then(function() {
                      thisClass.execCommandsBase(i + 1, end, steps);
                  });
              }
              else {
                  this.execCommandsBase(i + 1, end, steps);
              }

              return;
          }
          else if(ic.commands[i].trim().indexOf('symmetry') == 0) {
            ic.bAxisOnly = false;

            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            let  title = command.substr(command.indexOf(' ') + 1);
            ic.symmetrytitle =(title === 'none') ? undefined : title;

            if(title !== 'none') {
                if(ic.symmetryHash === undefined) {
                    $.when(thisClass.applyCommandSymmetry(command)).then(function() {
                       //if(!ic.icn3dui.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

                       ic.drawCls.draw();
                       thisClass.execCommandsBase(i + 1, end, steps);
                    });
                }
                else {
                    ic.drawCls.draw();
                    this.execCommandsBase(i + 1, end, steps);
                }
            }
            else {
                ic.drawCls.draw();
                this.execCommandsBase(i + 1, end, steps);
            }

            return;
          }
          else if(ic.commands[i].trim().indexOf('symd symmetry') == 0) {
            ic.bAxisOnly = false;

            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            //var title = command.substr(command.lastIndexOf(' ') + 1);
            //ic.symdtitle =(title === 'none') ? undefined : title;

            //if(title !== 'none') {
    //            if(ic.symdHash === undefined) {
                    $.when(ic.symdCls.applyCommandSymd(command)).then(function() {
                       //if(!ic.icn3dui.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

                       ic.drawCls.draw();
                       thisClass.execCommandsBase(i + 1, end, steps);
                    });
    //            }
    //            else {
    //                ic.drawCls.draw();
    //                this.execCommandsBase(i + 1, end, steps);
    //            }
            //}
            //else {
            //    ic.drawCls.draw();
            //    this.execCommandsBase(i + 1, end, steps);
            //}

            return;
          }
          else if(ic.commands[i].trim().indexOf('scap') == 0) {
            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            $.when(ic.scapCls.applyCommandScap(command)).then(function() {
               //if(!ic.icn3dui.cfg.notebook && dialog && dialog.hasClass("ui-dialog-content")) dialog.dialog( "close" );

               //ic.drawCls.draw();
               thisClass.execCommandsBase(i + 1, end, steps);
            });

            return;
          }
          else if(ic.commands[i].trim().indexOf('realign on seq align') == 0) {
            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            let  paraArray = command.split(' | ');
            if(paraArray.length == 2) {
                let  nameArray = paraArray[1].split(',');
                ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
            }

            $.when(thisClass.applyCommandRealign(command)).then(function() {
               thisClass.execCommandsBase(i + 1, end, steps);
            });

            return;
          }
          else if(ic.commands[i].trim().indexOf('graph interaction pairs') == 0) {
            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            if(ic.bD3 === undefined) {
                $.when(thisClass.applyCommandGraphinteraction(command)).then(function() {
                    thisClass.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                this.applyCommandGraphinteraction(command);
                this.execCommandsBase(i + 1, end, steps);
            }

            return;
          }
          else if(ic.commands[i].trim().indexOf('cartoon 2d') == 0) {
            let  strArray = ic.commands[i].split("|||");
            let  command = strArray[0].trim();

            if(ic.bD3 === undefined) {
                $.when(thisClass.applyCommandCartoon2d(command)).then(function() {
                    thisClass.execCommandsBase(i + 1, end, steps);
                });
            }
            else {
                this.applyCommandCartoon2d(command);
                this.execCommandsBase(i + 1, end, steps);
            }

            return;
          }
          else {
              ic.applyCommandCls.applyCommand(ic.commands[i]);
          }
      }

      //if(i === steps - 1) {
      if(i === steps || bFinalStep) {
    /*
          // enable ic.ParserUtilsCls.hideLoading
          ic.bCommandLoad = false;

          // hide "loading ..."
          ic.ParserUtilsCls.hideLoading();

          //ic.bRender = true;

          // end of all commands
          if(i + 1 === ic.commands.length) ic.bAddCommands = true;
    */
          this.renderFinalStep(i);
      }
    }

    pressCommandtext() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        $("#" + ic.pre + "logtext").keypress(function(e) { let  ic = thisClass.icn3d;
           ic.bAddLogs = false; // turn off log
           let  code =(e.keyCode ? e.keyCode : e.which);
           if(code == 13) { //Enter keycode
              e.preventDefault();
              let  dataStr = $(this).val();
              ic.bRender = true;
              let  commandArray = dataStr.split('\n');

              let  prevLogLen = ic.logs.length;
              for(let i = prevLogLen, il = commandArray.length; i < il; ++i) {
                  let  lastCommand = (i == prevLogLen) ? commandArray[i].substr(2).trim() : commandArray[i].trim(); // skip "> "
                  if(lastCommand === '') continue;

                  ic.logs.push(lastCommand);
                  //$("#" + ic.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + ic.pre + "logtext")[0].scrollHeight);
                  //if(lastCommand !== '') {
                    let  transformation = {}
                    transformation.factor = ic._zoomFactor;
                    transformation.mouseChange = ic.mouseChange;
                    transformation.quaternion = ic.quaternion;
                    ic.commands.push(lastCommand + '|||' + ic.transformCls.getTransformationStr(transformation));
                    ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                    ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                    if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                    ic.STATENUMBER = ic.commands.length;
                    if(lastCommand.indexOf('load') !== -1) {
                        thisClass.applyCommandLoad(lastCommand);
                    }
                    else if(lastCommand.indexOf('set map') !== -1 && lastCommand.indexOf('set map wireframe') === -1) {
                        thisClass.applyCommandMap(lastCommand);
                    }
                    else if(lastCommand.indexOf('set emmap') !== -1 && lastCommand.indexOf('set emmap wireframe') === -1) {
                        thisClass.applyCommandEmmap(lastCommand);
                    }
                    else if(lastCommand.indexOf('set phi') !== -1) {
                        ic.delphiCls.applyCommandPhi(lastCommand);
                    }
                    else if(lastCommand.indexOf('set delphi') !== -1) {
                        ic.delphiCls.applyCommandDelphi(lastCommand);
                    }
                    else if(lastCommand.indexOf('view annotations') == 0
                      //|| lastCommand.indexOf('set annotation cdd') == 0
                      //|| lastCommand.indexOf('set annotation site') == 0
                      ) {
                        thisClass.applyCommandAnnotationsAndCddSite(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation clinvar') == 0 ) {
                        thisClass.applyCommandClinvar(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation snp') == 0) {
                        thisClass.applyCommandSnp(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                        thisClass.applyCommand3ddomain(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation all') == 0) {
                        //$.when(thisClass.applyCommandAnnotationsAndCddSite(lastCommand))
                        //    .then(thisClass.applyCommandSnpClinvar(lastCommand))
                        $.when(thisClass.applyCommandClinvar(lastCommand))
                            .then(thisClass.applyCommandSnp(lastCommand))
                            .then(thisClass.applyCommand3ddomain(lastCommand));
                        ic.annotationCls.setAnnoTabAll();
                    }
                    else if(lastCommand.indexOf('view interactions') == 0 && ic.icn3dui.cfg.align !== undefined) {
                        thisClass.applyCommandViewinteraction(lastCommand);
                    }
                    else if(lastCommand.indexOf('symmetry') == 0) {
                        let  title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                        ic.symmetrytitle =(title === 'none') ? undefined : title;
                        if(title !== 'none') {
                            if(ic.symmetryHash === undefined) {
                                thisClass.applyCommandSymmetry(lastCommand);
                            }
                        }
                    }
                    else if(lastCommand.indexOf('symd symmetry') == 0) {
                        //var title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                        //ic.symdtitle =(title === 'none') ? undefined : title;
                        //if(title !== 'none') {
                            //if(ic.symdHash === undefined) {
                                ic.symdCls.applyCommandSymd(lastCommand);
                            //}
                        //}
                    }
                    else if(lastCommand.indexOf('scap ') == 0) {
                        ic.scapCls.applyCommandScap(lastCommand);
                    }
                    else if(lastCommand.indexOf('realign on seq align') == 0) {
                        let  paraArray = lastCommand.split(' | ');
                        if(paraArray.length == 2) {
                            let  nameArray = paraArray[1].split(',');
                            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                        }
                        thisClass.applyCommandRealign(lastCommand);
                    }
                    else if(lastCommand.indexOf('graph interaction pairs') == 0) {
                        thisClass.applyCommandGraphinteraction(lastCommand);
                    }
                    else {
                        ic.applyCommandCls.applyCommand(lastCommand + '|||' + ic.transformCls.getTransformationStr(transformation));
                    }
                    //ic.selectionCls.saveSelectionIfSelected();
                    //ic.drawCls.draw();
                  //} // if
              } // for

              ic.selectionCls.saveSelectionIfSelected();
              ic.drawCls.draw();

              $("#" + ic.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + ic.pre + "logtext")[0].scrollHeight);
           }
           ic.bAddLogs = true;
        });
    }

    //Execute the command to load a structure. This step is different from the rest steps since
    //it has to finish before the rest steps start.
    applyCommandLoad(commandStr) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      //ic.bCommandLoad = true;

      if(ic.atoms !== undefined && Object.keys(ic.atoms).length > 0) return;

      // chain functions together
      ic.deferred2 = $.Deferred(function() {
      ic.bAddCommands = false;
      let  commandTransformation = commandStr.split('|||');

      let  commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
      let  command = commandOri; //.toLowerCase();

      if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
        let  load_parameters = command.split(' | ');

        let  loadStr = load_parameters[0];
        if(load_parameters.length > 1) {
            let  firstSpacePos = load_parameters[load_parameters.length - 1].indexOf(' ');
            ic.icn3dui.cfg.inpara = load_parameters[load_parameters.length - 1].substr(firstSpacePos + 1);
            if(ic.icn3dui.cfg.inpara === 'undefined') {
                ic.icn3dui.cfg.inpara = '';
            }
        }

        // load pdb, mmcif, mmdb, cid
        let  id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
        ic.inputid = id;
        if(command.indexOf('load mmtf') !== -1) {
          ic.icn3dui.cfg.mmtfid = id;
          ic.mmtfParserCls.downloadMmtf(id);
        }
        else if(command.indexOf('load pdb') !== -1) {
          ic.icn3dui.cfg.pdbid = id;
          ic.pdbParserCls.downloadPdb(id);
        }
        else if(command.indexOf('load opm') !== -1) {
          ic.icn3dui.cfg.opmid = id;
          ic.opmParserCls.downloadOpm(id);
        }
        else if(command.indexOf('load mmcif') !== -1) {
          ic.icn3dui.cfg.mmcifid = id;
          ic.mmcifParserCls.downloadMmcif(id);
        }
        else if(command.indexOf('load mmdb') !== -1) {
          ic.icn3dui.cfg.mmdbid = id;

          ic.mmdbParserCls.downloadMmdb(id);
        }
        else if(command.indexOf('load gi') !== -1) {
          ic.icn3dui.cfg.gi = id;
          ic.mmdbParserCls.downloadGi(id);
        }
        else if(command.indexOf('load seq_struc_ids') !== -1) {
          ic.mmdbParserCls.downloadBlast_rep_id(id);
        }
        else if(command.indexOf('load cid') !== -1) {
          ic.icn3dui.cfg.cid = id;
          ic.sdfParserCls.downloadCid(id);
        }
        else if(command.indexOf('load alignment') !== -1) {
          ic.icn3dui.cfg.align = id;
          ic.alignParserCls.downloadAlignment(id);
        }
        else if(command.indexOf('load chainalignment') !== -1) {
          //load chainalignment [id] | resnum [resnum] | parameters [inpara]
          let  urlArray = command.split(" | ");
          if(urlArray[1].indexOf('resnum') != -1) {
              ic.icn3dui.cfg.resnum = urlArray[1].substr(urlArray[1].indexOf('resnum') + 7);
          }

          ic.icn3dui.cfg.chainalign = id;
          ic.chainalignParserCls.downloadChainalignment(id, ic.icn3dui.cfg.resnum);
        }
        else if(command.indexOf('load url') !== -1) {
            let  typeStr = load_parameters[1]; // type pdb
            let  pos =(typeStr !== undefined) ? typeStr.indexOf('type ') : -1;
            let  type = 'pdb';

            if(pos !== -1) {
                type = typeStr.substr(pos + 5);
            }

            ic.icn3dui.cfg.url = id;
            ic.pdbParserCls.downloadUrl(id, type);
        }
      }

      ic.bAddCommands = true;
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferred2.promise();
    }

    //Apply the command to show electron density map.
    applyCommandMap(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredMap = $.Deferred(function() { let  ic = thisClass.icn3d;
          //"set map 2fofc sigma 1.5"
          // or "set map 2fofc sigma 1.5 | [url]"
          let  urlArray = command.split(" | ");

          let  str = urlArray[0].substr(8);
          let  paraArray = str.split(" ");

          if(paraArray.length == 3 && paraArray[1] == 'sigma') {
              let  sigma = paraArray[2];
              let  type = paraArray[0];

              if(urlArray.length == 2) {
                  ic.dsn6ParserCls.dsn6ParserBase(urlArray[1], type, sigma);
              }
              else {
                  ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigma);
              }
          }
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredMap.promise();
    }

    //Apply the command to show EM density map.
    applyCommandEmmap(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredEmmap = $.Deferred(function() { let  ic = thisClass.icn3d;
          let  str = command.substr(10);
          let  paraArray = str.split(" ");

          if(paraArray.length == 2 && paraArray[0] == 'percentage') {
              let  percentage = paraArray[1];
              let  type = 'em';

              ic.densityCifParserCls.densityCifParser(ic.inputid, type, percentage, ic.emd);
          }
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredEmmap.promise();
    }

    applyCommandSymmetryBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.symdCls.retrieveSymmetry(Object.keys(ic.structures)[0])
    }

    applyCommandSymmetry(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredSymmetry = $.Deferred(function() {
         thisClass.applyCommandSymmetryBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredSymmetry.promise();
    }

    applyCommandRealignBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.realignParserCls.realignOnSeqAlign();
    }

    applyCommandRealign(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredRealign = new $.Deferred(function() {
         thisClass.applyCommandRealignBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredRealign.promise();
    }

    applyCommandGraphinteractionBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
        let  paraArray = command.split(' | ');
        if(paraArray.length >= 3) {
            let  setNameArray = paraArray[1].split(' ');
            let  nameArray2 = setNameArray[0].split(',');
            let  nameArray = setNameArray[1].split(',');

            let  bHbond = paraArray[2].indexOf('hbonds') !== -1;
            let  bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
            let  bInteraction = paraArray[2].indexOf('interactions') !== -1;

            let  bHalogen = paraArray[2].indexOf('halogen') !== -1;
            let  bPication = paraArray[2].indexOf('pi-cation') !== -1;
            let  bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

            let  bHbondCalc;
            if(paraArray.length >= 4) {
                bHbondCalc =(paraArray[3] == 'true') ? true : false;
            }

            ic.applyCommandCls.setStrengthPara(paraArray);

            ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, 'graph',
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
        }
    }

    applyCommandGraphinteraction(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredGraphinteraction = $.Deferred(function() {
         thisClass.applyCommandGraphinteractionBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredGraphinteraction.promise();
    }

    applyCommandCartoon2dBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
        let  type = command.substr(command.lastIndexOf(' ') + 1);
        ic.cartoon2dCls.draw2Dcartoon(type);
    }

    applyCommandCartoon2d(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredCartoon2d = $.Deferred(function() {
         thisClass.applyCommandCartoon2dBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredCartoon2d.promise();
    }

    applyCommandAnnotationsAndCddSiteBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
      // chain functions together
      if(command == "view annotations") {
          //if(ic.icn3dui.cfg.showanno === undefined || !ic.icn3dui.cfg.showanno) {
              ic.showAnnoCls.showAnnotations();
          //}
      }
    }

    //The annotation window calls many Ajax calls. Thus the command "view interactions"
    //(in Share Link or loading state file) is handled specially to wait for the Ajax calls
    //to finish before executing the next command.
    applyCommandAnnotationsAndCddSite(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredAnnoCddSite = $.Deferred(function() {
          thisClass.applyCommandAnnotationsAndCddSiteBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredAnnoCddSite.promise();
    }

    applyCommandClinvarBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
      // chain functions together
      let  pos = command.lastIndexOf(' '); // set annotation clinvar
      let  type = command.substr(pos + 1);

      ic.annotationCls.setAnnoTabClinvar();
    }

    applyCommandSnpBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
      // chain functions together
      let  pos = command.lastIndexOf(' '); // set annotation clinvar
      let  type = command.substr(pos + 1);

      ic.annotationCls.setAnnoTabSnp();
    }

    applyCommandClinvar(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredClinvar = $.Deferred(function() {
          thisClass.applyCommandClinvarBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredClinvar.promise();
    }

    applyCommandSnp(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredSnp = $.Deferred(function() {
          thisClass.applyCommandSnpBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredSnp.promise();
    }

    applyCommand3ddomainBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
      // chain functions together
      let  pos = command.lastIndexOf(' ');
      let  type = command.substr(pos + 1);

      if(type == '3ddomain' || type == 'all') {
          ic.annotationCls.setAnnoTab3ddomain();
      }
    }

    applyCommand3ddomain(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferred3ddomain = $.Deferred(function() {
          thisClass.applyCommand3ddomainBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferred3ddomain.promise();
    }

    applyCommandViewinteractionBase(command) { let  ic = this.icn3d, me = ic.icn3dui;
      // chain functions together
         if(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) {
             let  structureArray = Object.keys(ic.structures);
             ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
         }
    }

    applyCommandViewinteraction(command) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;
      // chain functions together
      ic.deferredViewinteraction = $.Deferred(function() {
         thisClass.applyCommandViewinteractionBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredViewinteraction.promise();
    }

    //When reading a list of commands, apply transformation at the last step.
    renderFinalStep(steps) { let  ic = this.icn3d, me = ic.icn3dui;
        // enable ic.ParserUtilsCls.hideLoading
        ic.bCommandLoad = false;

        // hide "loading ..."
        ic.ParserUtilsCls.hideLoading();

        //ic.bRender = true;

        // end of all commands
        if(steps + 1 === ic.commands.length) ic.bAddCommands = true;


        ic.bRender = true;

        let  commandTransformation = (ic.commands[steps-1]) ? ic.commands[steps-1].split('|||') : [];

        if(commandTransformation.length == 2) {
            let  transformation = JSON.parse(commandTransformation[1]);

            ic._zoomFactor = transformation.factor;

            ic.mouseChange.x = transformation.mouseChange.x;
            ic.mouseChange.y = transformation.mouseChange.y;

            ic.quaternion._x = transformation.quaternion._x;
            ic.quaternion._y = transformation.quaternion._y;
            ic.quaternion._z = transformation.quaternion._z;
            ic.quaternion._w = transformation.quaternion._w;
        }

        ic.selectionCls.oneStructurePerWindow();

        // simple if all atoms are modified
        //if( ic.icn3dui.cfg.command === undefined &&(steps === 1 ||(Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length) ||(ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) ) {
        if(steps === 1
          ||(Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length)
          ||(ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) {
    // the following code caused problem for many links,e.g., https://structure.ncbi.nlm.nih.gov/icn3d/share.html?17g3r1JDvZ7ZL39e6
    //        if(steps === 1) {
                // assign styles and color using the options at that stage
    //            ic.setStyleCls.setAtomStyleByOptions(ic.optsHistory[steps - 1]);
    //            ic.setColorCls.setColorByOptions(ic.optsHistory[steps - 1], ic.hAtoms);
    //        }

            if(ic.optsHistory.length >= steps) {
                let  pkOption = ic.optsHistory[steps - 1].pk;
                if(pkOption === 'no') {
                    ic.pk = 0;
                }
                else if(pkOption === 'atom') {
                    ic.pk = 1;
                }
                else if(pkOption === 'residue') {
                    ic.pk = 2;
                }
                else if(pkOption === 'strand') {
                    ic.pk = 3;
                }

    // the following code caused problem for many links,e.g., https://structure.ncbi.nlm.nih.gov/icn3d/share.html?17g3r1JDvZ7ZL39e6
    //            if(steps === 1) {
    //                ic.setColorCls.applyOriginalColor();
    //            }

                ic.hlUpdateCls.updateHlAll();

                // caused some problem witht the following line
    //            $.extend(ic.opts, ic.optsHistory[steps - 1]);
                ic.drawCls.draw();
            }
            else {
                ic.hlUpdateCls.updateHlAll();

                ic.drawCls.draw();
            }
        }
        else { // more complicated if partial atoms are modified
            ic.hlUpdateCls.updateHlAll();

            ic.drawCls.draw();
        }

        if(ic.icn3dui.cfg.closepopup) {
            setTimeout(function(){
                ic.resizeCanvasCls.closeDialogs();
            }, 100);

            ic.resizeCanvasCls.resizeCanvas(ic.icn3dui.htmlCls.WIDTH, ic.icn3dui.htmlCls.HEIGHT, true);
        }

        // an extra render to remove artifacts in transparent surface
        if(ic.bTransparentSurface && ic.bRender) ic.drawCls.render();

        if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    replayFirstStep(currentNumber) { let  ic = this.icn3d, me = ic.icn3dui;
          // fresh start
          ic.reinitAfterLoad();
          //ic.selectionCls.resetAll();

          //ic.opts = me.hashUtilsCls.cloneHash(ic.opts);

          this.execCommandsBase(currentNumber, currentNumber, ic.STATENUMBER);

          let  cmdStrOri = ic.commands[currentNumber];
          //var pos = ic.commands[currentNumber].indexOf(' | ');
          let  pos = ic.commands[currentNumber].indexOf('|');
          if(pos != -1) cmdStrOri = ic.commands[currentNumber].substr(0, pos);

          let  maxLen = 20;
          let  cmdStr =(cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;

          let  menuStr = ic.applyCommandCls.getMenuFromCmd(cmdStrOri); // 'File > Retrieve by ID, Align';

          $("#" + ic.pre + "replay_cmd").html('Cmd: ' + cmdStr);
          $("#" + ic.pre + "replay_menu").html('Menu: ' + menuStr);

          ic.bCommandLoad = false;

          // hide "loading ..."
          ic.ParserUtilsCls.hideLoading();

          ic.bRender = true;
          ic.drawCls.draw();
    }
}

export {LoadScript}
