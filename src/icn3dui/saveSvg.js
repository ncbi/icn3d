/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.saveSvg = function (id, filename) {  var me = this, ic = me.icn3d; "use strict";
    var svg = me.getSvgXml(id);

    var blob = new Blob([svg], {type: "image/svg+xml"});
    saveAs(blob, filename);
};

iCn3DUI.prototype.getSvgXml = function (id) {  var me = this, ic = me.icn3d; "use strict";
    // font is not good
    var svg_data = document.getElementById(id).innerHTML; //put id of your svg element here

    var head = "<svg title=\"graph\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

    //if you have some additional styling like graph edges put them inside <style> tag
    var style = "<style>text {font-family: sans-serif; font-weight: bold; font-size: 18px;}</style>";

    var full_svg = head +  style + svg_data + "</svg>"

    return full_svg;
};

iCn3DUI.prototype.savePng = function (id, filename, width, height) {  var me = this, ic = me.icn3d; "use strict";
    // https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
    var svg = document.getElementById(id);
    var bbox = svg.getBBox();

    var copy = svg.cloneNode(true);
    me.copyStylesInline(copy, svg);
    var canvas = document.createElement("CANVAS");
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, bbox.width, bbox.height);

    var data = me.getSvgXml(id); //(new XMLSerializer()).serializeToString(copy); //me.getSvgXml();
    var DOMURL = window.URL || window.webkitURL || window;
    var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});

    var img = new Image();
    img.src = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(this.src);

        if(me.isIE()) {
            var blob = canvas.msToBlob();

            saveAs(blob, filename);

            canvas.remove();

            return;
        }
        else {
            canvas.toBlob(function(data) {
                var blob = data;
                saveAs(blob, filename);

                canvas.remove();

                return;
            });
        }
    };
};
