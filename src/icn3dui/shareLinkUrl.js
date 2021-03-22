/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.shareLinkUrl = function(bAllCommands) { var me = this, ic = me.icn3d; "use strict";
       var url = me.baseUrl + "icn3d/full.html?";
       if(me.cfg.bSidebyside) url = me.baseUrl + "icn3d/full2.html?";

       if(me.bInputUrlfile) {
           var urlArray = window.location.href.split('?');
           url = urlArray[0] + '?' + me.inputurl + '&';
       }

       var paraHash = {};
       for(var key in me.cfg) {
           var value = me.cfg[key];
           //if(key === 'inpara' || me.key === 'command' || value === undefined) continue;
           if(key === 'inpara' || key === 'command' || key === 'usepdbnum'
             || key === 'date' || key === 'v' || value === undefined) continue;

            // check the default values as defined at the beginning of full_ui.js
            //if(key === 'command' && value === '') continue;

            if(key === 'width' && value === '100%') continue;
            if(key === 'height' && value === '100%') continue;

            if(key === 'resize' && value === true) continue;
            if(key === 'showmenu' && value === true) continue;
            if(key === 'showtitle' && value === true) continue;
            if(key === 'showcommand' && value === true) continue;

            if(key === 'simplemenu' && value === false) continue;
            if(key === 'mobilemenu' && value === false) continue;
            if(key === 'closepopup' && value === false) continue;
            if(key === 'showanno' && value === false) continue;
            if(key === 'showseq' && value === false) continue;
            if(key === 'showalignseq' && value === false) continue;
            if(key === 'show2d' && value === false) continue;
            if(key === 'showsets' && value === false) continue;

            if(key === 'rotate' && value === 'right') continue;

            // commands will be added in the for loop below: for(var il = ic.commands...
            if(key === 'command') continue;

           if(key === 'options') {
               if(Object.keys(value).length > 0) {
                   //url += key + '=' + JSON.stringify(value) + '&';
                   paraHash[key] = JSON.stringify(value);
               }
           }
           else if(value === true) {
               //url += key + '=1&';
               paraHash[key] = 1;
           }
           else if(value === false) {
               //url += key + '=0&';
               paraHash[key] = 0;
           }
           else if(value !== '') {
               //url += key + '=' + value + '&';
               paraHash[key] = value;
           }
       }

       var inparaWithoutCommand;
       var pos = -1;
       if(me.cfg.inpara !== undefined) pos = me.cfg.inpara.indexOf('&command=');
       inparaWithoutCommand = (pos !== -1 ) ? me.cfg.inpara.substr(0, pos) : me.cfg.inpara;

       var bPrevDate = false;
       if(!me.bInputUrlfile) {
           var inparaArray = (inparaWithoutCommand && inparaWithoutCommand.substr(1)) ? inparaWithoutCommand.substr(1).split('&') : [];
           for(var i = 0, il = inparaArray.length; i < il; ++i) {
               var key_value = inparaArray[i].split('=');
               if(key_value.length == 2) paraHash[key_value[0]] = key_value[1];
           }

           for(var key in paraHash) {
               if(key === 'v') continue;

               if(key === 'date') bPrevDate = true;
               url += key + '=' + paraHash[key] + '&';
           }
       }

       // add time stamp
       var date = new Date();
       var monthStr = (date.getMonth() + 1).toString();
       if(date.getMonth() + 1 < 10) monthStr = '0' + monthStr;

       var dateStr = date.getDate().toString();
       if(date.getDate() < 10) dateStr = '0' + dateStr;

       var dateAllStr = date.getFullYear().toString() + monthStr + dateStr;
       if(!bPrevDate) url += 'date=' + dateAllStr + '&';
       url += 'v=' + me.REVISION + '&';

       url += 'command=';

       //var start = (inparaWithoutCommand !== undefined) ? 1 : 0;
       var start = 0;

       if(bAllCommands || me.bInputUrlfile) start = 0;

       var transformation = {};
       transformation.factor = ic._zoomFactor;
       transformation.mouseChange = ic.mouseChange;
       transformation.quaternion = ic.quaternion;

       var bCommands = false;
       var statefile = "";
       var prevCommandStr = undefined;

       var toggleStr = 'toggle highlight';
       var cntToggle = 0;

       if(ic.commands.length > start) {
           var command_tf = ic.commands[start].split('|||');
           prevCommandStr = command_tf[0].trim();

           //statefile += ic.commands[start] + "\n";

           if(prevCommandStr.indexOf(toggleStr) !== -1) ++cntToggle;
       }

       var i = start + 1;
       var selectChainHash = {};
       for(var il = ic.commands.length; i < il; ++i) {
           bCommands = true;

           var command_tf = ic.commands[i].split('|||');
           var commandStr = command_tf[0].trim();

           //statefile += ic.commands[i] + "\n";

           // only output the most recent 'select saved atoms...' without " | name ..."
           if( ( (prevCommandStr.indexOf('select saved atoms') !== -1 || prevCommandStr.indexOf('select sets') !== -1)
             && (commandStr.indexOf('select') === 0 || commandStr.indexOf('select') === 0)
             && prevCommandStr.indexOf(' name ') === -1)
             || (prevCommandStr.indexOf('pickatom') !== -1 && commandStr.indexOf('pickatom') !== -1)
             ) {
               // do nothing
           }
           // remove all "show selection" except the last one
           else if(prevCommandStr == 'show selection' && ic.commands.slice(i).toString().indexOf('show selection') != -1) {
               // do nothing
           }
           else if(prevCommandStr.indexOf(toggleStr) !== -1) {
               ++cntToggle;
           }
           else if(i === start + 1) {
               url += prevCommandStr;
               //statefile += prevCommandStr + "\n";
           }
           else {
               url += '; ' + prevCommandStr;
               //statefile += prevCommandStr + "\n";
           }

           // keep all commands in statefile
           statefile += prevCommandStr + "\n";

           prevCommandStr = commandStr;
       }

       // last command
       if(prevCommandStr) {
           if(bCommands) url += '; ';
           if(cntToggle > 0 && cntToggle %2 == 0 && prevCommandStr !== toggleStr) url += toggleStr + '; ';

           url += prevCommandStr + '|||' + me.getTransformationStr(transformation);
           statefile += prevCommandStr + '|||' + me.getTransformationStr(transformation) + '\n';
       }

       statefile = statefile.replace(/!/g, Object.keys(ic.structures)[0] + '_');
       if((me.bInputfile && !me.bInputUrlfile) || url.length > 4000) url = statefile;
       var id;
       if(ic.structures !== undefined && Object.keys(ic.structures).length == 1 && me.inputid !== undefined) {
           id = Object.keys(ic.structures)[0];
           url = url.replace(new RegExp(id + '_','g'), '!');
       }

       if(me.cfg.blast_rep_id !== undefined) {
           url = url.replace(new RegExp('blast_rep_id=!','g'), 'blast_rep_id=' + id + '_');
       }

       return url;
};
