/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 iCn3D.prototype.hexToRgb = function (hex, a) { var me = this, ic = me.icn3d; "use strict";
     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
     return result ? {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16),
         a: a
     } : null;
 };
