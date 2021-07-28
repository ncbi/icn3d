/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {Transform} from '../transform/transform.js';
import {SaveFile} from '../export/saveFile.js';

class ShareLink {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Generate a URL to capture the current state and open it in a new window. Basically the state
    //file (the comand history) is concatenated in the URL to show the current state.
    shareLink(bPngHtml) {var ic = this.icn3d, me = ic.icn3dui;
           let url = this.shareLinkUrl();
           let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
           if(bPngHtml) url += "&random=" + parseInt(Math.random() * 1000); // generate a new shorten URL and thus image name everytime
           //var inputid =(ic.inputid) ? ic.inputid : "custom";
           let inputid = Object.keys(ic.structures).join('_');
           if(!bPngHtml) {
               if(ic.bInputfile && !ic.bInputUrlfile) {
                   alert("Share Link does NOT work when the data is from custom files. Please save 'iCn3D PNG Image' in the File menu and open it in iCn3D.");
                   return;
               }
               if(bTooLong) {
                   alert("The url is more than 4000 characters and may not work. Please save 'iCn3D PNG Image' or 'State File' and open them in iCn3D.");
                   return;
               }
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("share link: " + url, false);
           }
           else {
               if(ic.bInputfile || bTooLong) {
                   ic.saveFileCls.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
                   return;
               }
           }
           //https://firebase.google.com/docs/dynamic-links/rest
           //Web API Key: AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc
           let fdlUrl = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc";
           $.ajax({
              url: fdlUrl,
              type: 'POST',
              //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + url, "suffix": {"option": "SHORT"}},
              //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + encodeURIComponent(url)},
              data : {'longDynamicLink': 'https://icn3d.page.link/?link=' + encodeURIComponent(url)},
              dataType: 'json',
              success: function(data) {
                let shorturl = 'Problem in getting shortened URL';
                if(data.shortLink !== undefined) {
                    shorturl = data.shortLink;
                    if(bPngHtml) { // save png and corresponding html
                        let strArray = shorturl.split("/");
                        let shortName = strArray[strArray.length - 1];
                        ic.saveFileCls.saveFile(inputid + '-' + shortName + '.png', 'png');
                        let text = '<div style="float:left; border: solid 1px #0000ff; padding: 5px; margin: 10px; text-align:center;">';
                        text += '<a href="https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + shortName + '" target="_blank">';
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
                    ic.saveFileCls.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
                }
                //shorturl: https://icn3d.page.link/NvbAh1Vmiwc4bgX87
                let urlArray = shorturl.split('page.link/');
                //if(urlArray.length == 2) shorturl = ic.icn3dui.htmlCls.baseUrl + 'icn3d/share.html?' + urlArray[1];
                // When the baseURL is structure.ncbi.nlm.nih.gov, mmcifparser.cgi has a problem to past posted data in Mac/iphone
                // So the base URL is still www.ncbi.nlm.nih.gov/Structure,just use short URL here
                if(urlArray.length == 2) shorturl = 'https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + urlArray[1];
                $("#" + ic.pre + "ori_url").val(url);
                $("#" + ic.pre + "short_url").val(shorturl);
                $("#" + ic.pre + "short_url_title").val(shorturl + '&t=' + ic.yournote);
                if(!bPngHtml) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_copyurl', 'Copy a Share Link URL');
              },
              error : function(xhr, textStatus, errorThrown ) {
                let shorturl = 'Problem in getting shortened URL';
                $("#" + ic.pre + "ori_url").val(url);
                $("#" + ic.pre + "short_url").val(shorturl);
                $("#" + ic.pre + "short_url_title").val(shorturl + '&t=' + ic.yournote);
                if(!bPngHtml) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_copyurl', 'Copy a Share Link URL');
              }
           });
    }

    shareLinkUrl(bAllCommands) {var ic = this.icn3d, me = ic.icn3dui;
           let url = ic.icn3dui.htmlCls.baseUrl + "icn3d/full.html?";
           if(ic.icn3dui.cfg.bSidebyside) url = ic.icn3dui.htmlCls.baseUrl + "icn3d/full2.html?";

           if(ic.bInputUrlfile) {
               let urlArray = window.location.href.split('?');
               url = urlArray[0] + '?' + ic.inputurl + '&';
           }

           let paraHash = {}
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

           let inparaWithoutCommand;
           let pos = -1;
           if(ic.icn3dui.cfg.inpara !== undefined) pos = ic.icn3dui.cfg.inpara.indexOf('&command=');
           inparaWithoutCommand =(pos !== -1 ) ? ic.icn3dui.cfg.inpara.substr(0, pos) : ic.icn3dui.cfg.inpara;

           let bPrevDate = false;
           if(!ic.bInputUrlfile) {
               let inparaArray =(inparaWithoutCommand && inparaWithoutCommand.substr(1)) ? inparaWithoutCommand.substr(1).split('&') : [];
               for(let i = 0, il = inparaArray.length; i < il; ++i) {
                   let key_value = inparaArray[i].split('=');
                   if(key_value.length == 2) paraHash[key_value[0]] = key_value[1];
               }

               for(let key in paraHash) {
                   if(key === 'v') continue;

                   if(key === 'date') bPrevDate = true;
                   url += key + '=' + paraHash[key] + '&';
               }
           }

           // add time stamp
           let date = new Date();
           let monthStr =(date.getMonth() + 1).toString();
           if(date.getMonth() + 1 < 10) monthStr = '0' + monthStr;

           let dateStr = date.getDate().toString();
           if(date.getDate() < 10) dateStr = '0' + dateStr;

           let dateAllStr = date.getFullYear().toString() + monthStr + dateStr;
           if(!bPrevDate) url += 'date=' + dateAllStr + '&';
           url += 'v=' + ic.icn3dui.REVISION + '&';

           url += 'command=';

           //var start =(inparaWithoutCommand !== undefined) ? 1 : 0;
           let start = 0;

           if(bAllCommands || ic.bInputUrlfile) start = 0;

           let transformation = {}
           transformation.factor = ic._zoomFactor;
           transformation.mouseChange = ic.mouseChange;
           transformation.quaternion = ic.quaternion;

           let bCommands = false;
           let statefile = "";
           let prevCommandStr = undefined;

           let toggleStr = 'toggle highlight';
           let cntToggle = 0;

           if(ic.commands.length > start) {
               let command_tf = ic.commands[start].split('|||');
               prevCommandStr = command_tf[0].trim();

               //statefile += ic.commands[start] + "\n";

               if(prevCommandStr.indexOf(toggleStr) !== -1) ++cntToggle;
           }

           let i = start + 1;
           let selectChainHash = {}
           for(let il = ic.commands.length; i < il; ++i) {
               bCommands = true;

               let command_tf = ic.commands[i].split('|||');
               let commandStr = command_tf[0].trim();

               //statefile += ic.commands[i] + "\n";

               // only output the most recent 'select saved atoms...' without " | name ..."
               if(((prevCommandStr.indexOf('select saved atoms') !== -1 || prevCommandStr.indexOf('select sets') !== -1)
                 &&(commandStr.indexOf('select') === 0 || commandStr.indexOf('select') === 0)
                 && prevCommandStr.indexOf(' name ') === -1)
                 ||(prevCommandStr.indexOf('pickatom') !== -1 && commandStr.indexOf('pickatom') !== -1)
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

               url += prevCommandStr + '|||' + ic.transformCls.getTransformationStr(transformation);
               statefile += prevCommandStr + '|||' + ic.transformCls.getTransformationStr(transformation) + '\n';
           }

           statefile = statefile.replace(/!/g, Object.keys(ic.structures)[0] + '_');
           if((ic.bInputfile && !ic.bInputUrlfile) || url.length > 4000) url = statefile;
           let id;
           if(ic.structures !== undefined && Object.keys(ic.structures).length == 1 && ic.inputid !== undefined) {
               id = Object.keys(ic.structures)[0];
               url = url.replace(new RegExp(id + '_','g'), '!');
           }

           if(ic.icn3dui.cfg.blast_rep_id !== undefined) {
               url = url.replace(new RegExp('blast_rep_id=!','g'), 'blast_rep_id=' + id + '_');
           }

           return url;
    }

    getPngText() {var ic = this.icn3d, me = ic.icn3dui;
        let url; // output state file if ic.bInputfile is true or the URL is mor than 4000 chars
        let bAllCommands = true;

        let text = "";
        if(ic.bInputfile) {
            url = this.shareLinkUrl(bAllCommands); // output state file if ic.bInputfile is true or the URL is mor than 4000 chars

            text += "\nStart of type file======\n";
            text += ic.InputfileType + "\n";
            text += "End of type file======\n";

            text += "Start of data file======\n";
            text += ic.InputfileData;
            text += "End of data file======\n";

            text += "Start of state file======\n";
            text += url;
            text += "End of state file======\n";
        }
        else {
            url = this.shareLinkUrl();
            let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
            if(bTooLong) {
                url = this.shareLinkUrl(bAllCommands); // output state file if ic.bInputfile is true or the URL is mor than 4000 chars

                text += "\nStart of state file======\n";

                text += url;
                text += "End of state file======\n";
            }
            else {
                text += "\nShare Link: " + url;
            }
        }

        text = text.replace(/!/g, Object.keys(ic.structures)[0] + '_');

        return text;
    }
}

export {ShareLink}
