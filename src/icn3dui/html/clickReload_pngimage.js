/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickReload_pngimage = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "reload_pngimage").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       //close all dialog
       if(!me.cfg.notebook) {
           $(".ui-dialog-content").dialog("close");
       }
       else {
           me.closeDialogs();
       }
       // initialize icn3dui
       me.init();
       ic.init();
       var file = $("#" + me.pre + "pngimage")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var imageStr = e.target.result; // or = reader.result;
           var matchedStr = 'Share Link: ';
           var pos = imageStr.indexOf(matchedStr);
           var matchedStrState = "Start of state file======\n";
           var posState = imageStr.indexOf(matchedStrState);
           if(pos == -1 && posState == -1) {
               alert('Please load a PNG image saved by clicking "Save Datas > PNG Image" in the Data menu...');
           }
           else if(pos != -1) {
               var url = imageStr.substr(pos + matchedStr.length);
               me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
               window.open(url);
           }
           else if(posState != -1) {
               var matchedStrData = "Start of data file======\n";
               var posData = imageStr.indexOf(matchedStrData);
               me.bInputfile = (posData == -1) ? false : true;
               if(me.bInputfile) {
                   var posDataEnd = imageStr.indexOf("End of data file======\n");
                   var data = imageStr.substr(posData + matchedStrData.length, posDataEnd - posData - matchedStrData.length);
                   var matchedStrType = "Start of type file======\n";
                   var posType = imageStr.indexOf(matchedStrType);
                   var posTypeEnd = imageStr.indexOf("End of type file======\n");
                   var type = imageStr.substr(posType + matchedStrType.length, posTypeEnd - posType - matchedStrType.length - 1); // remove the new line char
                   //var matchedStrState = "Start of state file======\n";
                   //var posState = imageStr.indexOf(matchedStrState);
                   var posStateEnd = imageStr.indexOf("End of state file======\n");
                   var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                   statefile = decodeURIComponent(statefile);
                    if(type === 'pdb') {
                        $.when( me.loadPdbData(data))
                         .then(function() {
                             ic.commands = [];
                             ic.optsHistory = [];
                             me.loadScript(statefile, true);
                         });
                    }
                    else {
                        if(type === 'mol2') {
                            me.loadMol2Data(data);
                        }
                        else if(type === 'sdf') {
                            me.loadSdfData(data);
                        }
                        else if(type === 'xyz') {
                            me.loadXyzData(data);
                        }
                        else if(type === 'mmcif') {
                            me.loadMmcifData(data);
                        }
                       ic.commands = [];
                       ic.optsHistory = [];
                       me.loadScript(statefile, true);
                   }
               }
               else { // url length > 4000
                   //var matchedStrState = "Start of state file======\n";
                   //var posState = imageStr.indexOf(matchedStrState);
                   var posStateEnd = imageStr.indexOf("End of state file======\n");
                   var statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                   statefile = decodeURIComponent(statefile);
                   ic.commands = [];
                   ic.optsHistory = [];
                   me.loadScript(statefile, true);
               }
               me.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
           }
         };
         reader.readAsText(file);
       }
    });
};
