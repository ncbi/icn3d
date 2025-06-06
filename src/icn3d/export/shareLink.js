/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ShareLink {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Generate a URL to capture the current state and open it in a new window. Basically the state
    //file (the command history) is concatenated in the URL to show the current state.
    async shareLink(bPngHtml, bPngOnly) { let ic = this.icn3d, me = ic.icn3dui;
        let url = this.shareLinkUrl();

        let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
        //if(bPngHtml) url += "&random=" + parseInt(Math.random() * 1000); // generate a new shorten URL and thus image name every time
        
        //var inputid =(ic.inputid) ? ic.inputid : "custom";
        let inputid = Object.keys(ic.structures).join('_');
        if(inputid == ic.defaultPdbId) {
            if(ic.filename) {
                inputid = ic.filename;
            }
            else if(ic.inputid) {
                inputid = ic.inputid;
            }
        }

        if(!bPngHtml) {
            if(ic.bInputfile && !ic.bInputUrlfile) {
                alert("Share Link does NOT work when the data are from custom files. Please save 'iCn3D PNG Image' in the File menu and open it in iCn3D.");
                return;
            }
            if(bTooLong) {
                alert("The url is more than 4000 characters and may not work. Please save 'iCn3D PNG Image' or 'State File' and open them in iCn3D.");
                return;
            }
            me.htmlCls.clickMenuCls.setLogCmd("share link: " + url, false);
        }
        else {
            if(bPngOnly || ic.bInputfile || bTooLong) {
                ic.saveFileCls.saveFile(inputid + '_icn3d_loadable.png', 'png');
                return;
            }
        }

        let shorturl = 'Problem in getting shortened URL';

        if(!me.cfg.notebook) {
            let data = await this.getShareLinkPrms(url, bPngHtml);

            if(data.shortLink !== undefined) {
                shorturl = data.shortLink;
                if(bPngHtml) { // save png and corresponding html
                    let strArray = shorturl.split("/");
                    let shortName = strArray[strArray.length - 1];
                    ic.saveFileCls.saveFile(inputid + '-' + shortName + '.png', 'png');
                    let text = '<div style="float:left; border: solid 1px #0000ff; padding: 5px; margin: 10px; text-align:center;">';
                    text += '<a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/share2.html?' + shortName + '" target="_blank">';
                    text += '<img style="height:300px" src ="' + inputid + '-' + shortName + '.png"><br>\n';
                    text += '<!--Start of your comments==================-->\n';
                    let yournote =(ic.yournote) ? ': ' + ic.yournote.replace(/\n/g, "<br>").replace(/; /g, ", ") : '';
                    text += 'PDB ' + inputid.toUpperCase() + yournote + '\n';
                    text += '<!--End of your comments====================-->\n';
                    text += '</a>';
                    text += '</div>\n\n';
                    ic.saveFileCls.saveFile(inputid + '-' + shortName + '.html', 'html', text);
                }
            }

            if(bPngHtml && data.shortLink === undefined) {
                ic.saveFileCls.saveFile(inputid + '_icn3d_loadable.png', 'png');
            }
/*
            //shorturl: https://icn3d.page.link/NvbAh1Vmiwc4bgX87
            let urlArray = shorturl.split('page.link/');
            // When the baseURL is structure.ncbi.nlm.nih.gov, mmcifparser.cgi has a problem to pass posted data in Mac/iphone
            // So the base URL is still www.ncbi.nlm.nih.gov/Structure,just use short URL here
            if(urlArray.length == 2) shorturl = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/share.html?' + urlArray[1];
*/
            shorturl = 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/share2.html?' + shorturl;

            $("#" + ic.pre + "short_url").val(shorturl);
            $("#" + ic.pre + "short_url_title").val(shorturl + '&t=' + ic.yournote);
        }

        let outputCmd = this.shareLinkUrl(undefined, true);
        let idStr = (me.cfg.url) ? "url=" + me.cfg.url : me.cfg.idname + "=" + me.cfg.idvalue; //"mmdbafid=" + ic.inputid;
        let jnCmd = "view = icn3dpy.view(q='" + idStr + "',command='" + outputCmd + "')\nview";
        if(me.cfg.url || me.cfg.idname) {
            $("#" + ic.pre + "jn_commands").val(jnCmd);
        }

        $("#" + ic.pre + "ori_url").val(url);

        if(!bPngHtml) me.htmlCls.dialogCls.openDlg('dl_copyurl', 'Copy a Share Link URL or Jupyter Notebook Commands');
    }

    getShareLinkPrms(url, bPngHtml) { let ic = this.icn3d, me = ic.icn3dui;
        /*
        //https://firebase.google.com/docs/dynamic-links/rest
        //Web API Key: AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc
        let fdlUrl = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc";
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: fdlUrl,
                type: 'POST',
                //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + url, "suffix": {"option": "SHORT"}},
                //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + encodeURIComponent(url)},
                data : {'longDynamicLink': 'https://icn3d.page.link/?link=' + encodeURIComponent(url)},
                dataType: 'json',
                success: function(data) {
                    resolve(data);
                },
                error : function(xhr, textStatus, errorThrown ) {
                    let shorturl = 'Problem in getting shortened URL';
                    $("#" + ic.pre + "ori_url").val(url);
                    $("#" + ic.pre + "short_url").val(shorturl);
                    $("#" + ic.pre + "short_url_title").val(shorturl + '&t=' + ic.yournote);
                    if(!bPngHtml) me.htmlCls.dialogCls.openDlg('dl_copyurl', 'Copy a Share Link URL');
                }
            });
        });
        */

        let serviceUrl = "https://icn3d.link/?longurl=" + encodeURIComponent(url);
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: serviceUrl,
                dataType: 'json',
                cache: true,
                success: function(data) {
                    resolve(data);
                },
                error : function(xhr, textStatus, errorThrown ) {
                    let shorturl = 'Problem in getting shortened URL';
                    $("#" + ic.pre + "ori_url").val(url);
                    $("#" + ic.pre + "short_url").val(shorturl);
                    $("#" + ic.pre + "short_url_title").val(shorturl + '&t=' + ic.yournote);
                    if(!bPngHtml) me.htmlCls.dialogCls.openDlg('dl_copyurl', 'Copy a Share Link URL');
                }
            });
        });
    }

    shareLinkUrl(bAllCommands, bOutputCmd, bStatefile) { let ic = this.icn3d, me = ic.icn3dui;
           let url = me.htmlCls.baseUrl + "icn3d/full_" + me.REVISION + ".html?";
           let outputCmd = '';
           if(me.cfg.bSidebyside) url = me.htmlCls.baseUrl + "icn3d/full2.html?";

           if(ic.bInputUrlfile) {
               let urlArray = window.location.href.split('?');
               url = urlArray[0] + '?' + ic.inputurl + '&';
           }

           let paraHash = {};
           for(let key in ic.cfg) {
               let value = ic.cfg[key];
               //if(key === 'inpara' || ic.key === 'command' || value === undefined) continue;
               if(key === 'inpara' || key === 'command' || key === 'usepdbnum'
                 || key === 'date' || key === 'v' || value === undefined) continue;

                // check the default values as defined at the beginning of full_ui.js
                //if(key === 'command' && value === '') continue;

                if(key === 'width' && value === '100%') continue;
                if(key === 'height' && value === '100%') continue;

                if(key === 'resize' && value === true) continue;
                if(key === 'showlogo' && value === true) continue;
                if(key === 'showmenu' && value === true) continue;
                if(key === 'showtitle' && value === true) continue;
                if(key === 'showcommand' && value === true) continue;

                //if(key === 'simplemenu' && value === false) continue;
                if(key === 'mobilemenu' && value === false) continue;
                //if(key === 'closepopup' && value === false) continue;
                if(key === 'showanno' && value === false) continue;
                if(key === 'showseq' && value === false) continue;
                if(key === 'showalignseq' && value === false) continue;
                if(key === 'show2d' && value === false) continue;
                if(key === 'showsets' && value === false) continue;

                if(key === 'rotate' && value === 'right') continue;

                // commands will be added in the for loop below: for(let il = ic.commands...
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

           if(ic.bAfMem) {
            paraHash['afmem'] = 'on';
           }
           //else {
           else if(me.cfg.afid || (Object.keys(ic.structures).length == 1 && Object.keys(ic.structures)[0].length > 5) ) {
            paraHash['afmem'] = 'off';
           }

           let inparaWithoutCommand;
           let pos = -1;
           if(me.cfg.inpara !== undefined) pos = me.cfg.inpara.indexOf('&command=');
           inparaWithoutCommand =(pos !== -1 ) ? me.cfg.inpara.substr(0, pos) : me.cfg.inpara;

           let bPrevDate = false;
           if(!ic.bInputUrlfile) {
               let inparaArray =(inparaWithoutCommand && inparaWithoutCommand.substr(1)) ? inparaWithoutCommand.substr(1).split('&') : [];
               for(let i = 0, il = inparaArray.length; i < il; ++i) {
                   let key_value = inparaArray[i].split('=');
                   if(key_value.length == 2) paraHash[key_value[0]] = key_value[1];
               }

               if(me.cfg.idname && !paraHash[me.cfg.idname]) { // somehow it is not included
                    url += me.cfg.idname + '=' + me.cfg.idvalue + '&';
               }

               for(let key in paraHash) {
                   if(key === 'v') continue;

                   if(key === 'date') bPrevDate = true;
                   url += key + '=' + paraHash[key] + '&';
               }
           }

           // add time stamp
           let dateAllStr = me.utilsCls.getDateDigitStr();
           if(!bPrevDate) url += 'date=' + dateAllStr + '&';
           url += 'v=' + me.REVISION + '&';

           url += 'command=';

           let start;
           //if(me.cfg.notebook) {
           if(bOutputCmd) {
                start =(inparaWithoutCommand !== undefined) ? 1 : 0;
           }
           else {
                start = 0;
           }

           if(bAllCommands || ic.bInputUrlfile) start = 0;

           let transformation = {}
           transformation.factor = ic._zoomFactor;
           transformation.mouseChange = ic.mouseChange;
           transformation.quaternion = ic.quaternion;

           let statefile = "";
           let prevCommandStr = "";

           let toggleStr = 'toggle highlight';
           let cntToggle = 0;

           if(ic.commands.length > start) {
               let command_tf = ic.commands[start].split('|||');
               let command_tf2 = command_tf[0].split('&command=');
               prevCommandStr = command_tf2[0].trim();

               //statefile += ic.commands[start] + "\n";

               if(prevCommandStr.indexOf(toggleStr) !== -1) ++cntToggle;
           }

           let i = start + 1;
           let selectChainHash = {}
           let tmpUrl = '';

           for(let il = ic.commands.length; i < il; ++i) {
               let command_tf = ic.commands[i].split('|||');
               let command_tf2 = command_tf[0].split('&command=');
               let commandStr = command_tf2[0].trim();

               // only one load command
               //if(prevCommandStr.substr(0, 5) == 'load ' && commandStr.substr(0, 5) == 'load ') {
               //    continue;
               //}

               //statefile += ic.commands[i] + "\n";

               // only output the most recent 'select sets...' without " | name ..."
               // or those select without names
               if(prevCommandStr.indexOf('select sets') == 0 && commandStr.indexOf('select sets') === 0 
                 && prevCommandStr.indexOf(' name ') === -1) {
                    // do nothing
               }
               else if(prevCommandStr.indexOf('pickatom') !== -1 && commandStr.indexOf('pickatom') !== -1) {
                   // do nothing
               }
               // remove all "show selection" except the last one
               else if(prevCommandStr == 'show selection' && ic.commands.slice(i).toString().indexOf('show selection') != -1) {
                   // do nothing
               }
               else if(prevCommandStr == commandStr) { // remove duplicates
                // do nothing
               }
               else if(prevCommandStr.indexOf(toggleStr) !== -1) {
                   ++cntToggle;
               }
               else if(i === start + 1) {
                //    if(prevCommandStr.substr(0, 4) !== 'load') {
                       tmpUrl += prevCommandStr;
                //    }
               }
               else {
                   tmpUrl += (tmpUrl) ? '; ' + prevCommandStr : prevCommandStr;
               }

               // keep all commands in statefile
               if(prevCommandStr.indexOf('load ') == -1) statefile += prevCommandStr + "\n";

               prevCommandStr = commandStr;
           }

           // last command
           if(prevCommandStr) {
               if(tmpUrl) tmpUrl += '; ';
               if(cntToggle > 0 && cntToggle %2 == 0 && prevCommandStr !== toggleStr) tmpUrl += toggleStr + '; ';

               tmpUrl += prevCommandStr + '|||' + ic.transformCls.getTransformationStr(transformation);
               statefile += prevCommandStr + '|||' + ic.transformCls.getTransformationStr(transformation) + '\n';
           }

           url += tmpUrl;
           outputCmd = tmpUrl;

           statefile = statefile.replace(/!/g, Object.keys(ic.structures)[0] + '_');
           if(ic.bEsmfold || (ic.bInputfile && !ic.bInputUrlfile) || (ic.bInputUrlfile && ic.bAppend) || url.length > 4000) url = statefile;
           let id;
           if(ic.structures !== undefined && Object.keys(ic.structures).length == 1 && ic.inputid !== undefined) {
               id = Object.keys(ic.structures)[0];
               url = url.replace(new RegExp(id + '_','g'), '!');
               outputCmd = outputCmd.replace(new RegExp(id + '_','g'), '!');
           }

           if(me.cfg.blast_rep_id !== undefined) {
               url = url.replace(new RegExp('blast_rep_id=!','g'), 'blast_rep_id=' + id + '_');
           }

           return (bStatefile) ? statefile : (bOutputCmd) ? outputCmd : url;
    }

    getPngText() { let ic = this.icn3d, me = ic.icn3dui;
        let url; // output state file if ic.bInputfile is true or the URL is more than 4000 chars
        let bAllCommands = true;

        let text = "";
/*
        if(ic.bInputfile) {
            url = this.shareLinkUrl(bAllCommands); // output state file if ic.bInputfile is true or the URL is more than 4000 chars

            if(url.substr(0,4) == 'http') {
                text += "\nShare Link: " + url;
            }
            else {
                text += "\nStart of type file======\n";
                // text += ic.InputfileType + "\n";
                text += "pdb\n";
                text += "End of type file======\n";

                text += "Start of data file======\n";
                //text += ic.InputfileData;
                text += ic.saveFileCls.getAtomPDB(ic.atoms);

                text += "End of data file======\n";

                text += "Start of state file======\n";
                text += url + "\n";
                text += "End of state file======\n";
            }
        }
        else {
            url = this.shareLinkUrl();
            let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
            if(bTooLong) {
                url = this.shareLinkUrl(bAllCommands); // output state file if ic.bInputfile is true or the URL is more than 4000 chars

                text += "\nStart of state file======\n";

                text += url + "\n";
                text += "End of state file======\n";
            }
            else {
                text += "\nShare Link: " + url;
            }
        }
*/

        // always output PDB and commands
        text += "\nStart of type file======\n";
        text += "pdb\n";
        text += "End of type file======\n";

        text += "Start of data file======\n";
        text += ic.saveFileCls.getAtomPDB(ic.atoms);
        text += "End of data file======\n";

        let bStatefile = true;
        let commands = this.shareLinkUrl(bAllCommands, undefined, bStatefile);
        text += "Start of state file======\n";
        text += commands + "\n";
        text += "End of state file======\n";
/*
        if(ic.bInputfile) {
            url = this.shareLinkUrl(bAllCommands); // output state file if ic.bInputfile is true or the URL is more than 4000 chars

            if(url.substr(0,4) == 'http') {
                text += "\nShare Link: " + url;
            }
        }
        else {
            url = this.shareLinkUrl();
            let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
            if(!bTooLong) {
                text += "\nShare Link: " + url;
            }
        }
*/
        text = text.replace(/!/g, Object.keys(ic.structures)[0] + '_');

        return text;
    }
}

export {ShareLink}
