/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.saveFile = function(filename, type, text) { var me = this, ic = me.icn3d; "use strict";
    //Save file
    var blob;

    if(type === 'command') {
        var dataStr = (me.loadCmd) ? me.loadCmd + '\n' : '';
        for(var i = 0, il = ic.commands.length; i < il; ++i) {
            var command = ic.commands[i].trim();
            if(i == il - 1) {
               var command_tf = command.split('|||');

               var transformation = {};
               transformation.factor = ic._zoomFactor;
               transformation.mouseChange = ic.mouseChange;
               transformation.quaternion = ic.quaternion;

               command = command_tf[0] + '|||' + me.getTransformationStr(transformation);
            }

            dataStr += command + '\n';
        }
        var data = decodeURIComponent(dataStr);

        blob = new Blob([data],{ type: "text;charset=utf-8;"});
    }
    else if(type === 'png') {
        //ic.scaleFactor = 1.0;
        var width = $("#" + me.pre + "canvas").width();
        var height = $("#" + me.pre + "canvas").height();
        ic.setWidthHeight(width, height);

        if(ic.bRender) ic.render();

        var bAddURL = true;
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            bAddURL = false;
        }

        if(me.isIE()) {
            blob = ic.renderer.domElement.msToBlob();

            if(bAddURL) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var arrayBuffer = e.target.result; // or = reader.result;

                    var text = me.getPngText();

                    blob = me.getBlobFromBufferAndText(arrayBuffer, text);

                    //if(window.navigator.msSaveBlob) navigator.msSaveBlob(blob, filename);
                    saveAs(blob, filename);

                    return;
                };

                reader.readAsArrayBuffer(blob);
            }
            else {
                //me.createLinkForBlob(blob, filename);
                saveAs(blob, filename);

                return;
            }
        }
        else {
            ic.renderer.domElement.toBlob(function(data) {
                if(bAddURL) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var arrayBuffer = e.target.result; // or = reader.result;

                        var text = me.getPngText();

                        blob = me.getBlobFromBufferAndText(arrayBuffer, text);

                        //me.createLinkForBlob(blob, filename);
                        saveAs(blob, filename);

                        return;
                    };

                    reader.readAsArrayBuffer(data);
                }
                else {
                    blob = data;

                    //me.createLinkForBlob(blob, filename);
                    saveAs(blob, filename);

                    return;
                }
            });
        }

        // reset the image size
        ic.scaleFactor = 1.0;
        ic.setWidthHeight(width, height);

        if(ic.bRender) ic.render();
    }
    else if(type === 'html') {
        var dataStr = text;
        var data = decodeURIComponent(dataStr);

        blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
    }
    else if(type === 'text') {
        //var dataStr = text;
        //var data = decodeURIComponent(dataStr);

        //blob = new Blob([data],{ type: "text;charset=utf-8;"});

        var data = text; // here text is an array of text

        blob = new Blob(data,{ type: "text;charset=utf-8;"});
    }
    else if(type === 'binary') {
        var data = text; // here text is an array of blobs

        //blob = new Blob([data],{ type: "application/octet-stream"});
        blob = new Blob(data,{ type: "application/octet-stream"});
    }

    if(type !== 'png') {
        //https://github.com/eligrey/FileSaver.js/
        saveAs(blob, filename);
    }
};
