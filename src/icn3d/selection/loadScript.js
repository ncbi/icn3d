/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class LoadScript {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Run commands one after another. The commands can be semicolon ';' or new line '\n' separated.
    async loadScript(dataStr, bStatefile, bStrict) { let ic = this.icn3d, me = ic.icn3dui;
      if(!dataStr) return;
      
      // allow the "loading structure..." message to be shown while loading script
      ic.bCommandLoad = true;

      ic.bRender = false;
      ic.bStopRotate = true;
      
      // firebase dynamic links replace " " with "+". So convert it back
      dataStr =(bStatefile) ? dataStr.replace(/\+/g, ' ') : dataStr.replace(/\+/g, ' ').replace(/;/g, '\n');

      let preCommands = [];
      if(!bStrict && ic.commands.length > 0) preCommands[0] = ic.commands[0];

      let commandArray = dataStr.trim().split('\n');
      ic.commands = commandArray;

      let pos = commandArray[0].indexOf('command=');
      if(bStatefile && pos != -1) {
          let commandFirst = commandArray[0].substr(0, pos - 1);
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
          await this.replayFirstStep(ic.CURRENTNUMBER);
      }
      else {
          await this.execCommands(ic.CURRENTNUMBER, ic.STATENUMBER-1, ic.STATENUMBER, bStrict);
      }
    }

    //Execute a list of commands. "steps" is the total number of commands.
    async execCommands(start, end, steps, bStrict) { let ic = this.icn3d, me = ic.icn3dui;
        ic.bRender = false;

        // fresh start
        if(!bStrict) ic.reinitAfterLoad();

        //ic.opts = me.hashUtilsCls.cloneHash(ic.opts);
        await this.execCommandsBase(start, end, steps);
    }

    getNameArray(command) { let ic = this.icn3d, me = ic.icn3dui;
        let paraArray = command.split(' | ');
        let nameArray = [];
        if(paraArray.length == 2) {
            nameArray = paraArray[1].split(',');
            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        }

        return nameArray;
    }

    async execCommandsBase(start, end, steps, bFinalStep) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;
      let i;

      for(i=start; i <= end; ++i) {
          let bFinalStep =(i === steps - 1) ? true : false;

          if(!ic.commands[i].trim()) continue;
          let nAtoms = Object.keys(ic.atoms).length;

          if(nAtoms == 0 && ic.commands[i].indexOf('load') == -1) continue;

          let strArray = ic.commands[i].split("|||");
          let command = strArray[0].trim();

          if(ic.inputid) ic.bNotLoadStructure = true;
  
          if(command.indexOf('load') !== -1) {
              if(end === 0 && start === end) {
                    if(ic.bNotLoadStructure) {
                        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

                        // end of all commands
                        if(1 === ic.commands.length) ic.bAddCommands = true;
                        if(bFinalStep) this.renderFinalStep(steps);                  
                    }
                    else {
                        await thisClass.applyCommandLoad(ic.commands[i]);
                        
                        // end of all commands
                        if(1 === ic.commands.length) ic.bAddCommands = true;
                        if(bFinalStep) thisClass.renderFinalStep(steps);
                  }
                  return;
              }
              else {
                    if(ic.bNotLoadStructure) {
                        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

                        // undo/redo requires render the first step
                        if(ic.backForward) this.renderFinalStep(1);
                    }
                    else {                    
                        await thisClass.applyCommandLoad(ic.commands[i]);

                        // undo/redo requires render the first step
                        if(ic.backForward) thisClass.renderFinalStep(1);
                    }
              }
          }
          else if(command.indexOf('set map') == 0 && command.indexOf('set map wireframe') == -1) {
              //set map 2fofc sigma 1.5
              let urlArray = strArray[0].trim().split(' | ');

              let str = urlArray[0].substr(8);
              let paraArray = str.split(" ");

              if(paraArray.length == 3 && paraArray[1] == 'sigma') {
                let sigma = paraArray[2];
                let type = paraArray[0];

                await thisClass.applyCommandMap(strArray[0].trim());
              }
          }
          else if(command.indexOf('set emmap') == 0 && command.indexOf('set emmap wireframe') == -1) {
              //set emmap percentage 70
              let str = strArray[0].trim().substr(10);
              let paraArray = str.split(" ");

              if(paraArray.length == 2 && paraArray[0] == 'percentage') {
                let percentage = paraArray[1];

                await thisClass.applyCommandEmmap(strArray[0].trim());
              }
          }
          else if(command.indexOf('set phi') == 0) {
              await ic.delphiCls.applyCommandPhi(strArray[0].trim());
          }
          else if(command.indexOf('set delphi') == 0) {
              await ic.delphiCls.applyCommandDelphi(strArray[0].trim());
          }
          else if(command.indexOf('view annotations') == 0) { // the command may have "|||{"factor"...
              if(Object.keys(ic.proteins).length > 0) {
                await thisClass.applyCommandAnnotationsAndCddSite(strArray[0].trim());
              }
          }
          else if(command.indexOf('set annotation clinvar') == 0 ) { // the command may have "|||{"factor"...
              if(Object.keys(ic.proteins).length > 0) {
                await thisClass.applyCommandClinvar(strArray[0].trim());
              }
          }
          else if(command.indexOf('set annotation snp') == 0) { // the command may have "|||{"factor"...
              if(Object.keys(ic.proteins).length > 0 ) {
                await thisClass.applyCommandSnp(strArray[0].trim());
              }
          }
          else if(command.indexOf('set annotation ptm') == 0 ) { // the command may have "|||{"factor"...
            if(Object.keys(ic.proteins).length > 0) {
                await thisClass.applyCommandPTM(strArray[0].trim());
            }
          }
          else if(command.indexOf('ig refnum on') == 0 ) { 
            await ic.refnumCls.showIgRefNum();
          }
          else if(command.indexOf('ig template') == 0 ) { 
            let template = command.substr(command.lastIndexOf(' ') + 1);
            await ic.refnumCls.showIgRefNum(template);
          }
          else if(command.indexOf('set annotation 3ddomain') == 0) { // the command may have "|||{"factor"...
              if(Object.keys(ic.proteins).length > 0) {
                  thisClass.applyCommand3ddomain(strArray[0].trim());   
              }
          }
          else if(command.indexOf('set annotation all') == 0) { // the command may have "|||{"factor"...
            if(Object.keys(ic.proteins).length > 0) {
                await thisClass.applyCommandClinvar(strArray[0].trim());
                await thisClass.applyCommandSnp(strArray[0].trim());
                thisClass.applyCommand3ddomain(strArray[0].trim());
            }

            await ic.annotationCls.setAnnoTabAll();
          }
          else if(command.indexOf('view interactions') == 0 && me.cfg.align !== undefined) { // the command may have "|||{"factor"...
              await thisClass.applyCommandViewinteraction(strArray[0].trim());

          }
          else if(command.indexOf('symmetry') == 0) {
            ic.bAxisOnly = false;

            let title = command.substr(command.indexOf(' ') + 1);
            ic.symmetrytitle =(title === 'none') ? undefined : title;

            if(title !== 'none') {
                await ic.symdCls.retrieveSymmetry(Object.keys(ic.structures)[0]);
            }

            ic.drawCls.draw();
          }
          else if(command.indexOf('symd symmetry') == 0) {
            ic.bAxisOnly = false;

            await ic.symdCls.applyCommandSymd(command);

            ic.drawCls.draw();
          }
          else if(command.indexOf('scap') == 0) {
            await ic.scapCls.applyCommandScap(command);
          }
          else if(command.indexOf('realign on seq align') == 0) {
            let nameArray = this.getNameArray(command);

            await thisClass.applyCommandRealign(command);
          }
          else if(command.indexOf('realign on structure align msa') == 0) {
            let nameArray = this.getNameArray(command);

            me.cfg.aligntool = 'vast';

            await ic.realignParserCls.realignOnStructAlignMsa(nameArray);
          }
          else if(command.indexOf('realign on structure align') == 0) {
            let nameArray = this.getNameArray(command);

            me.cfg.aligntool = 'vast';
            await ic.realignParserCls.realignOnStructAlign();
          }
          else if(command.indexOf('realign on tmalign msa') == 0) {
            let nameArray = this.getNameArray(command);

            me.cfg.aligntool = 'tmalign';

            await ic.realignParserCls.realignOnStructAlignMsa(nameArray);
          }
          else if(command.indexOf('realign on tmalign') == 0) {
            let nameArray = this.getNameArray(command);

            me.cfg.aligntool = 'tmalign';

            await ic.realignParserCls.realignOnStructAlign();
          }
          else if(command.indexOf('realign on vastplus') == 0) {
            thisClass.getHAtoms(ic.commands[i]);

            await ic.vastplusCls.realignOnVastplus();
          }
          else if(command.indexOf('graph interaction pairs') == 0) {
            await thisClass.applyCommandGraphinteraction(command);
          }
          else if(command.indexOf('cartoon 2d domain') == 0) {
            await thisClass.applyCommandCartoon2d(command);
          }
          else if(command.indexOf('set half pae map') == 0) {
            await thisClass.applyCommandAfmap(command);
          }
          else if(command.indexOf('set full pae map') == 0) {
            await thisClass.applyCommandAfmap(command, true);
          }
          else if(command.indexOf('export pqr') == 0) {
            await me.htmlCls.setHtmlCls.exportPqr();
          }
          else if(command.indexOf('cartoon 2d chain') == 0 || command.indexOf('cartoon 2d secondary') == 0) {
            let pos = command.lastIndexOf(' ');
            let type = command.substr(pos + 1);
    
            await ic.cartoon2dCls.draw2Dcartoon(type);
          }
          else if(command.indexOf('add msa track') == 0) {
            //add msa track | chainid " + chainid + " | startpos " + startpos + " | type " + type + " | fastaList " + fastaList 
            let paraArray = command.split(' | ');
    
            let chainid = paraArray[1].substr(8);
            let startpos = paraArray[2].substr(9);
            let type = paraArray[3].substr(5);
            let fastaList = paraArray[4].substr(10);

            if($("#" + ic.pre + "anno_custom")[0]) {
                $("#" + ic.pre + "anno_custom")[0].checked = true;
            }
            $("[id^=" + ic.pre + "custom]").show();

            await ic.addTrackCls.addMsaTracks(chainid, startpos, type, fastaList);
          }
          else if(command.indexOf('add exon track') == 0) {
            //add exon track | chainid " + chainid + " | geneid " + geneid + " | startpos " + startpos + " | type " + type
            let paraArray = command.split(' | ');

            let chainid = paraArray[1].substr(8);
            let geneid = paraArray[2].substr(7);
            let startpos = paraArray[3].substr(9);
            let type = paraArray[4].substr(5);

            if($("#" + ic.pre + "anno_custom")[0]) {
                $("#" + ic.pre + "anno_custom")[0].checked = true;
            }
            $("[id^=" + ic.pre + "custom]").show();

            await ic.addTrackCls.addExonTracks(chainid, geneid, startpos, type);
          }
          else {
            await ic.applyCommandCls.applyCommand(ic.commands[i]);
          }
      }
      
      //if(i === steps - 1) {
      if(i === steps || bFinalStep) {
          this.renderFinalStep(i);
      }
    }

    pressCommandtext() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        $("#" + ic.pre + "logtext").keypress(async function(e) { let ic = thisClass.icn3d;
           ic.bAddLogs = false; // turn off log
           let code =(e.keyCode ? e.keyCode : e.which);
           if(code == 13) { //Enter keycode
              e.preventDefault();
              let dataStr = $(this).val();
              ic.bRender = true;
              let commandArray = dataStr.split('\n');

              let prevLogLen = ic.logs.length;
              for(let i = prevLogLen, il = commandArray.length; i < il; ++i) {
                  let lastCommand = (i == prevLogLen) ? commandArray[i].substr(2).trim() : commandArray[i].trim(); // skip "> "
                  if(lastCommand === '') continue;

                  ic.logs.push(lastCommand);
                  //$("#" + ic.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + ic.pre + "logtext")[0].scrollHeight);
                  //if(lastCommand !== '') {
                    let transformation = {}
                    transformation.factor = ic._zoomFactor;
                    transformation.mouseChange = ic.mouseChange;
                    transformation.quaternion = ic.quaternion;
                    ic.commands.push(lastCommand + '|||' + ic.transformCls.getTransformationStr(transformation));
                    ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                    ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                    if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                    ic.STATENUMBER = ic.commands.length;
                    if(lastCommand.indexOf('load') !== -1) {
                        await thisClass.applyCommandLoad(lastCommand);
                    }
                    else if(lastCommand.indexOf('set map') !== -1 && lastCommand.indexOf('set map wireframe') === -1) {
                        await thisClass.applyCommandMap(lastCommand);
                    }
                    else if(lastCommand.indexOf('set emmap') !== -1 && lastCommand.indexOf('set emmap wireframe') === -1) {
                        await thisClass.applyCommandEmmap(lastCommand);
                    }
                    else if(lastCommand.indexOf('set phi') !== -1) {
                        await ic.delphiCls.applyCommandPhi(lastCommand);
                    }
                    else if(lastCommand.indexOf('set delphi') !== -1) {
                        await ic.delphiCls.applyCommandDelphi(lastCommand);
                    }
                    else if(lastCommand.indexOf('view annotations') == 0
                      //|| lastCommand.indexOf('set annotation cdd') == 0
                      //|| lastCommand.indexOf('set annotation site') == 0
                      ) {
                        await thisClass.applyCommandAnnotationsAndCddSite(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation clinvar') == 0 ) {
                        await thisClass.applyCommandClinvar(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation snp') == 0) {
                        await thisClass.applyCommandSnp(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation ptm') == 0) {
                        await thisClass.applyCommandPTM(lastCommand);
                    }
                    else if(lastCommand.indexOf('ig refnum on') == 0) {
                        await ic.refnumCls.showIgRefNum();
                    }
                    else if(lastCommand.indexOf('set annotation 3ddomain') == 0) {
                        thisClass.applyCommand3ddomain(lastCommand);
                    }
                    else if(lastCommand.indexOf('set annotation all') == 0) {
                        await thisClass.applyCommandClinvar(lastCommand);
                        await thisClass.applyCommandSnp(lastCommand);
                        thisClass.applyCommand3ddomain(lastCommand);
                        await ic.annotationCls.setAnnoTabAll();
                    }
                    else if(lastCommand.indexOf('view interactions') == 0 && me.cfg.align !== undefined) {
                        await thisClass.applyCommandViewinteraction(lastCommand);
                    }
                    else if(lastCommand.indexOf('symmetry') == 0) {
                        let title = lastCommand.substr(lastCommand.indexOf(' ') + 1);
                        ic.symmetrytitle =(title === 'none') ? undefined : title;
                        if(title !== 'none') {
                            if(ic.symmetryHash === undefined) {
                                await ic.symdCls.retrieveSymmetry(Object.keys(ic.structures)[0]);
                            }
                        }
                    }
                    else if(lastCommand.indexOf('symd symmetry') == 0) {
                        await ic.symdCls.applyCommandSymd(lastCommand);
                    }
                    else if(lastCommand.indexOf('scap ') == 0) {
                        await ic.scapCls.applyCommandScap(lastCommand);
                    }
                    else if(lastCommand.indexOf('realign on seq align') == 0) {
                        let paraArray = lastCommand.split(' | ');
                        if(paraArray.length == 2) {
                            let nameArray = paraArray[1].split(',');
                            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                        }
                        await thisClass.applyCommandRealign(lastCommand);
                    }
                    else if(lastCommand.indexOf('realign on structure align') == 0) {
                        let paraArray = lastCommand.split(' | ');
                        if(paraArray.length == 2) {
                            let nameArray = paraArray[1].split(',');
                            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                        }

                        me.cfg.aligntool = 'vast';

                        await thisClass.applyCommandRealignByStruct(lastCommand);
                    }
                    else if(lastCommand.indexOf('realign on tmalign') == 0) {
                        let paraArray = lastCommand.split(' | ');
                        if(paraArray.length == 2) {
                            let nameArray = paraArray[1].split(',');
                            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                        }
                        
                        me.cfg.aligntool = 'tmalign';

                        await thisClass.applyCommandRealignByStruct(lastCommand);
                    }
                    else if(lastCommand.indexOf('realign on vastplus') == 0) {
                        let paraArray = lastCommand.split(' | ');
                        if(paraArray.length == 2) {
                            let nameArray = paraArray[1].split(',');
                            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                        }
                        
                        await ic.vastplusCls.realignOnVastplus();
                    }
                    else if(lastCommand.indexOf('graph interaction pairs') == 0) {
                        await thisClass.applyCommandGraphinteraction(lastCommand);
                    }
                    else {
                        await ic.applyCommandCls.applyCommand(lastCommand + '|||' + ic.transformCls.getTransformationStr(transformation));
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
    async applyCommandLoad(commandStr) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // allow multiple load
      //if(ic.atoms !== undefined && Object.keys(ic.atoms).length > 0) return;

      // chain functions together
///      ic.deferred2 = $.Deferred(function() {
      ic.bAddCommands = false;
      let commandTransformation = commandStr.split('|||');

      let commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
      let command = commandOri; //.toLowerCase();

      if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
        let load_parameters = command.split(' | ');

        let loadStr = load_parameters[0];
        if(load_parameters.length > 1) {
            let firstSpacePos = load_parameters[load_parameters.length - 1].indexOf(' ');
            me.cfg.inpara = load_parameters[load_parameters.length - 1].substr(firstSpacePos + 1);
            if(me.cfg.inpara === 'undefined') {
                me.cfg.inpara = '';
            }
        }

        // load pdb, mmcif, mmdb, cid
        let id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
        if(id.length == 4) id = id.toUpperCase();

        // skip loading the structure if it was loaded before
        if(ic.structures && ic.structures.hasOwnProperty(id)) return;

        ic.inputid = id;
        if(command.indexOf('load mmtf') !== -1) {
          me.cfg.mmtfid = id;
          
          await ic.mmtfParserCls.downloadMmtf(id);
        }
        else if(command.indexOf('load pdb') !== -1) {
          me.cfg.pdbid = id;

          await ic.pdbParserCls.downloadPdb(id);
        }
        else if(command.indexOf('load af') !== -1) {
          me.cfg.afid = id;  
          await ic.pdbParserCls.downloadPdb(id, true);
        }
        else if(command.indexOf('load opm') !== -1) {
          me.cfg.opmid = id;
          await ic.opmParserCls.downloadOpm(id);
        }
        else if(command.indexOf('load mmcif') !== -1) {
          me.cfg.mmcifid = id;
          await ic.mmcifParserCls.downloadMmcif(id);
        }
        else if(command.indexOf('load mmdb ') !== -1 || command.indexOf('load mmdb1 ') !== -1) {
          me.cfg.mmdbid = id;
          me.cfg.bu = 1;

          await ic.mmdbParserCls.downloadMmdb(id);
        }
        else if(command.indexOf('load mmdb0') !== -1) {
            me.cfg.mmdbid = id;
            me.cfg.bu = 0;
  
            await ic.mmdbParserCls.downloadMmdb(id);
        }
        else if(command.indexOf('load mmdbaf1') !== -1) {
            me.cfg.mmdbafid = id;
            me.cfg.bu = 1;
  
            await ic.chainalignParserCls.downloadMmdbAf(id);
        }
        else if(command.indexOf('load mmdbaf0') !== -1) {
            me.cfg.mmdbafid = id;
            me.cfg.bu = 0;

            await ic.chainalignParserCls.downloadMmdbAf(id);
        }
        else if(command.indexOf('load gi') !== -1) {
            me.cfg.gi = id;
            await ic.mmdbParserCls.downloadGi(id);
        }
        else if(command.indexOf('load refseq') !== -1) {
            me.cfg.refseqid = id;
            await ic.mmdbParserCls.downloadRefseq(id);
        }
        else if(command.indexOf('load protein') !== -1) {
            me.cfg.protein = id;
            await ic.mmdbParserCls.downloadProteinname(id);
        }
        else if(command.indexOf('load seq_struct_ids ') !== -1) {
          ic.bSmithwm = false;
          ic.bLocalSmithwm = false;
          await ic.mmdbParserCls.downloadBlast_rep_id(id);
        }
        else if(command.indexOf('load seq_struct_ids_smithwm ') !== -1) {
            ic.bSmithwm = true;
            await ic.mmdbParserCls.downloadBlast_rep_id(id);
        }
        else if(command.indexOf('load seq_struct_ids_local_smithwm ') !== -1) {
            ic.bLocalSmithwm = true;
            await ic.mmdbParserCls.downloadBlast_rep_id(id);
        }
        else if(command.indexOf('load cid') !== -1) {
          me.cfg.cid = id;
          await ic.sdfParserCls.downloadCid(id);
        }
        else if(command.indexOf('load alignment') !== -1) {
          me.cfg.align = id;

          if(me.cfg.inpara || me.cfg.inpara.indexOf('atype=2') == -1) {
            await ic.alignParserCls.downloadAlignment(me.cfg.align);
          }
          else {
            let vastplusAtype = 2; // Tm-align
            await ic.chainalignParserCls.downloadMmdbAf(me.cfg.align, undefined, vastplusAtype);
          }
        }
        else if(command.indexOf('load chainalignment') !== -1) {
          //load chainalignment [id] | resnum [resnum] | resdef [resnum] | aligntool [aligntool] | parameters [inpara]
          let urlArray = command.split(" | ");
          if(urlArray.length > 1 && urlArray[1].indexOf('resnum') != -1) {
                me.cfg.resnum = urlArray[1].substr(urlArray[1].indexOf('resnum') + 7);
          }
          if(urlArray.length > 2 && urlArray[2].indexOf('resdef') != -1) {
                me.cfg.resdef = urlArray[2].substr(urlArray[1].indexOf('resdef') + 7);
          }
          if(urlArray.length > 3 && urlArray[3].indexOf('aligntool') != -1) {
                me.cfg.aligntool = urlArray[3].substr(urlArray[1].indexOf('aligntool') + 10);
          }

          me.cfg.chainalign = id;
          await ic.chainalignParserCls.downloadChainalignment(id, me.cfg.resnum, me.cfg.resdef);
        }
        else if(command.indexOf('load url') !== -1) {
            let typeStr = load_parameters[1]; // type pdb
            let pos =(typeStr !== undefined) ? typeStr.indexOf('type ') : -1;
            let type = 'pdb';

            if(pos !== -1) {
                type = typeStr.substr(pos + 5);
            }

            me.cfg.url = id;
            await ic.pdbParserCls.downloadUrl(id, type);
        }
      }

      ic.bAddCommands = true;
///      }); // end of me.deferred = $.Deferred(function() {

///      return ic.deferred2.promise();
    }

    //Apply the command to show electron density map.
    async applyCommandMap(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
    //   ic.deferredMap = $.Deferred(function() { let ic = thisClass.icn3d;
          //"set map 2fofc sigma 1.5"
          // or "set map 2fofc sigma 1.5 | [url]"
          let urlArray = command.split(" | ");

          let str = urlArray[0].substr(8);
          let paraArray = str.split(" ");

          if(paraArray.length == 3 && paraArray[1] == 'sigma') {
              let sigma = paraArray[2];
              let type = paraArray[0];

              if(urlArray.length == 2) {
                await ic.dsn6ParserCls.dsn6ParserBase(urlArray[1], type, sigma);
              }
              else {
                await ic.dsn6ParserCls.dsn6Parser(ic.inputid, type, sigma);
              }
          }
    //   }); // end of me.deferred = $.Deferred(function() {

    //   return ic.deferredMap.promise();
    }

    //Apply the command to show EM density map.
    async applyCommandEmmap(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
    //   ic.deferredEmmap = $.Deferred(function() { let ic = thisClass.icn3d;
          let str = command.substr(10);
          let paraArray = str.split(" ");

          if(paraArray.length == 2 && paraArray[0] == 'percentage') {
              let percentage = paraArray[1];
              let type = 'em';

              await ic.densityCifParserCls.densityCifParser(ic.inputid, type, percentage, ic.emd);
          }
    //   }); // end of me.deferred = $.Deferred(function() {

    //   return ic.deferredEmmap.promise();
    }

    async applyCommandRealign(command) { let ic = this.icn3d, me = ic.icn3dui;
        await ic.realignParserCls.realignOnSeqAlign();
    }

    async applyCommandRealignByStruct(command) { let ic = this.icn3d, me = ic.icn3dui;
      ic.drawCls.draw();
      await ic.realignParserCls.realignOnStructAlign();
    }

    async applyCommandAfmap(command, bFull) { let ic = this.icn3d, me = ic.icn3dui;
      let afid = command.substr(command.lastIndexOf(' ') + 1);
     
      await ic.contactMapCls.afErrorMap(afid, bFull);
    }

    async applyCommandGraphinteraction(command) { let ic = this.icn3d, me = ic.icn3dui;
      let paraArray = command.split(' | ');
      if(paraArray.length >= 3) {
          let setNameArray = paraArray[1].split(' ');
          let nameArray2 = setNameArray[0].split(',');
          let nameArray = setNameArray[1].split(',');

          let bHbond = paraArray[2].indexOf('hbonds') !== -1;
          let bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
          let bInteraction = paraArray[2].indexOf('interactions') !== -1;

          let bHalogen = paraArray[2].indexOf('halogen') !== -1;
          let bPication = paraArray[2].indexOf('pi-cation') !== -1;
          let bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

          let bHbondCalc;
          if(paraArray.length >= 4) {
              bHbondCalc =(paraArray[3] == 'true') ? true : false;
          }

          ic.applyCommandCls.setStrengthPara(paraArray);

          await ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, 'graph',
              bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
      }
    }

    async applyCommandCartoon2d(command) { let ic = this.icn3d, me = ic.icn3dui;
        let type = command.substr(command.lastIndexOf(' ') + 1);
        await ic.cartoon2dCls.draw2Dcartoon(type);
    }

    //The annotation window calls many Ajax calls. Thus the command "view interactions"
    //(in Share Link or loading state file) is handled specially to wait for the Ajax calls
    //to finish before executing the next command.
    async applyCommandAnnotationsAndCddSite(command) { let ic = this.icn3d, me = ic.icn3dui;
        if(command == "view annotations") {
            //if(me.cfg.showanno === undefined || !me.cfg.showanno) {
                await ic.showAnnoCls.showAnnotations();
            //}
        }
    }

    async applyCommandClinvar(command) { let ic = this.icn3d, me = ic.icn3dui;
        // chain functions together
        let pos = command.lastIndexOf(' '); // set annotation clinvar
        let type = command.substr(pos + 1);
        
        await ic.annotationCls.setAnnoTabClinvar();
    }

    async applyCommandSnp(command) { let ic = this.icn3d, me = ic.icn3dui;
        // chain functions together
        let pos = command.lastIndexOf(' '); // set annotation clinvar
        let type = command.substr(pos + 1);
        
        await ic.annotationCls.setAnnoTabSnp();
    }

    async applyCommandPTM(command) { let ic = this.icn3d, me = ic.icn3dui;
        // chain functions together
        let pos = command.lastIndexOf(' '); // set annotation clinvar
        let type = command.substr(pos + 1);
  
        await ic.annotationCls.setAnnoTabPTM();
    }

    applyCommand3ddomain(command) { let ic = this.icn3d, me = ic.icn3dui;
        // chain functions together
        let pos = command.lastIndexOf(' ');
        let type = command.substr(pos + 1);
    
        if(type == '3ddomain' || type == 'all') {
            ic.annotationCls.setAnnoTab3ddomain();
        }
    }

    async applyCommandViewinteraction(command) { let ic = this.icn3d, me = ic.icn3dui;
        // chain functions together
        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
            let structureArray = Object.keys(ic.structures);
            await ic.ParserUtilsCls.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
        }
    }

    //When reading a list of commands, apply transformation at the last step.
    async renderFinalStep(steps) { let ic = this.icn3d, me = ic.icn3dui;
        // enable ic.ParserUtilsCls.hideLoading
        ic.bCommandLoad = false;

        // hide "loading ..."
        ic.ParserUtilsCls.hideLoading();

        //ic.bRender = true;

        // end of all commands
        if(steps + 1 === ic.commands.length) ic.bAddCommands = true;


        ic.bRender = true;

        let commandTransformation = (ic.commands[steps-1]) ? ic.commands[steps-1].split('|||') : [];

        if(commandTransformation.length == 2) {
            let transformation = JSON.parse(commandTransformation[1]);

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
        //if( me.cfg.command === undefined &&(steps === 1 ||(Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length) ||(ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) ) {
        if(steps === 1
          || (ic.hAtoms && ic.atoms && Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length)
          || (ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) {
    // the following code caused problem for many links,e.g., https://structure.ncbi.nlm.nih.gov/icn3d/share.html?17g3r1JDvZ7ZL39e6
    //        if(steps === 1) {
                // assign styles and color using the options at that stage
    //            ic.setStyleCls.setAtomStyleByOptions(ic.optsHistory[steps - 1]);
    //            ic.setColorCls.setColorByOptions(ic.optsHistory[steps - 1], ic.hAtoms);
    //        }

            if(ic.optsHistory.length >= steps) {
                let pkOption = ic.optsHistory[steps - 1].pk;
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

        if(me.cfg.closepopup || me.cfg.imageonly) {
            setTimeout(function(){
                ic.resizeCanvasCls.closeDialogs();
            }, 100);

            ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
        }

        // an extra render to remove artifacts in transparent surface
        if(ic.bTransparentSurface && ic.bRender) ic.drawCls.render();

        if(me.cfg.imageonly) ic.saveFileCls.saveFile(undefined, 'png', undefined, true);

        /// if(ic.deferred !== undefined) ic.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();
        /// if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();
    }

    async replayFirstStep(currentNumber) { let ic = this.icn3d, me = ic.icn3dui;
          // fresh start
          ic.reinitAfterLoad();
          //ic.selectionCls.resetAll();

          //ic.opts = me.hashUtilsCls.cloneHash(ic.opts);
          await this.execCommandsBase(currentNumber, currentNumber, ic.STATENUMBER);

          let cmdStrOri = ic.commands[currentNumber];
          //var pos = ic.commands[currentNumber].indexOf(' | ');
          let pos = ic.commands[currentNumber].indexOf('|');
          if(pos != -1) cmdStrOri = ic.commands[currentNumber].substr(0, pos);

          let maxLen = 20;
          let cmdStr =(cmdStrOri.length > maxLen) ? cmdStrOri.substr(0, maxLen) + '...' : cmdStrOri;

          let menuStr = ic.applyCommandCls.getMenuFromCmd(cmdStrOri); // 'File > Retrieve by ID, Align';

          $("#" + ic.pre + "replay_cmd").html('Cmd: ' + cmdStr);
          $("#" + ic.pre + "replay_menu").html('Menu: ' + menuStr);

          me.htmlCls.clickMenuCls.setLogCmd(cmdStrOri, true);

          ic.bCommandLoad = false;

          // hide "loading ..."
          ic.ParserUtilsCls.hideLoading();

          ic.bRender = true;
          ic.drawCls.draw();
    }

    getHAtoms(fullcommand) { let ic = this.icn3d, me = ic.icn3dui;
        let strArray = fullcommand.split("|||");
        let command = strArray[0].trim();

        let paraArray = command.split(' | ');
        if(paraArray.length == 2) {
            let nameArray = paraArray[1].split(',');
            ic.hAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        }
    }
}

export {LoadScript}
