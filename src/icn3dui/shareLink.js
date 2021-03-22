/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.shareLink = function(bPngHtml) { var me = this, ic = me.icn3d; "use strict";
       var url = me.shareLinkUrl();
       var bTooLong = (url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
       if(bPngHtml) url += "&random=" + parseInt(Math.random() * 1000); // generate a new shorten URL and thus image name everytime
       //var inputid = (me.inputid) ? me.inputid : "custom";
       var inputid = Object.keys(ic.structures).join('_');
       if(!bPngHtml) {
           if(me.bInputfile && !me.bInputUrlfile) {
               alert("Share Link does NOT work when the data is from custom files. Please save 'iCn3D PNG Image' in the File menu and open it in iCn3D.");
               return;
           }
           if(bTooLong) {
               alert("The url is more than 4000 characters and may not work. Please save 'iCn3D PNG Image' or 'State File' and open them in iCn3D.");
               return;
           }
           me.setLogCmd("share link: " + url, false);
       }
       else {
           if(me.bInputfile || bTooLong) {
               me.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
               return;
           }
       }
       //https://firebase.google.com/docs/dynamic-links/rest
       //Web API Key: AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc
       var fdlUrl = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBxl9CgM0dY5lagHL4UOhEpLWE1fuwdnvc";
       $.ajax({
          url: fdlUrl,
          type: 'POST',
          //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + url, "suffix": {"option": "SHORT"}},
          //data : {'longDynamicLink': 'https://d55qc.app.goo.gl/?link=' + encodeURIComponent(url)},
          data : {'longDynamicLink': 'https://icn3d.page.link/?link=' + encodeURIComponent(url)},
          dataType: 'json',
          success: function(data) {
            var shorturl = 'Problem in getting shortened URL';
            if(data.shortLink !== undefined) {
                shorturl = data.shortLink;
                if(bPngHtml) { // save png and corresponding html
                    var strArray = shorturl.split("/");
                    var shortName = strArray[strArray.length - 1];
                    me.saveFile(inputid + '-' + shortName + '.png', 'png');
                    var text = '<div style="float:left; border: solid 1px #0000ff; padding: 5px; margin: 10px; text-align:center;">';
                    text += '<a href="https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + shortName + '" target="_blank">';
                    text += '<img style="height:300px" src ="' + inputid + '-' + shortName + '.png"><br>\n';
                    text += '<!--Start of your comments==================-->\n';
                    var yournote = (me.yournote) ? ': ' + me.yournote.replace(/\n/g, "<br>").replace(/; /g, ", ") : '';
                    text += 'PDB ' + inputid.toUpperCase() + yournote + '\n';
                    text += '<!--End of your comments====================-->\n';
                    text += '</a>';
                    text += '</div>\n\n';
                    me.saveFile(inputid + '-' + shortName + '.html', 'html', text);
                }
            }
            if(bPngHtml && data.shortLink === undefined) {
                me.saveFile(inputid + '_image_icn3d_loadable.png', 'png');
            }
            //shorturl: https://icn3d.page.link/NvbAh1Vmiwc4bgX87
            var urlArray = shorturl.split('page.link/');
            //if(urlArray.length == 2) shorturl = me.baseUrl + 'icn3d/share.html?' + urlArray[1];
            // When the baseURL is structure.ncbi.nlm.nih.gov, mmcifparser.cgi has a problem to past posted data in Mac/iphone
            // So the base URL is still www.ncbi.nlm.nih.gov/Structure,just use short URL here
            if(urlArray.length == 2) shorturl = 'https://structure.ncbi.nlm.nih.gov/icn3d/share.html?' + urlArray[1];
            $("#" + me.pre + "ori_url").val(url);
            $("#" + me.pre + "short_url").val(shorturl);
            $("#" + me.pre + "short_url_title").val(shorturl + '&t=' + me.yournote);
            if(!bPngHtml) me.openDlg('dl_copyurl', 'Copy a Share Link URL');
          },
          error : function(xhr, textStatus, errorThrown ) {
            var shorturl = 'Problem in getting shortened URL';
            $("#" + me.pre + "ori_url").val(url);
            $("#" + me.pre + "short_url").val(shorturl);
            $("#" + me.pre + "short_url_title").val(shorturl + '&t=' + me.yournote);
            if(!bPngHtml) me.openDlg('dl_copyurl', 'Copy a Share Link URL');
          }
       });
};
