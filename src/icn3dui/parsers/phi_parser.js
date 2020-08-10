/**
 * @file Dsn6 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

/*
iCn3DUI.prototype.Dsn6Parser = function(pdbid, type, sigma) { var me = this, ic = me.icn3d; "use strict";
    // https://edmaps.rcsb.org/maps/1kq2_2fofc.dsn6
    // https://edmaps.rcsb.org/maps/1kq2_fofc.dsn6

    var url = "https://edmaps.rcsb.org/maps/" + pdbid.toLowerCase() + "_" + type + ".dsn6";
    me.Dsn6ParserBase(url, type, sigma);
};

iCn3DUI.prototype.Dsn6ParserBase = function(url, type, sigma) { var me = this, ic = me.icn3d; "use strict";
    var dataType;

    var bCid = undefined;

    //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
    if(type == '2fofc' && me.bAjax2fofc) {
        ic.mapData.sigma2 = sigma;
        me.setOption('map', type);
    }
    else if(type == 'fofc' && me.bAjaxfofc) {
        ic.mapData.sigma = sigma;
        me.setOption('map', type);
    }
    else {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onreadystatechange = function() {
            if (this.readyState == 4) {
               //me.hideLoading();

               if(this.status == 200) {
                   var arrayBuffer = oReq.response;
                   me.loadDsn6Data(arrayBuffer, type, sigma);

                   if(type == '2fofc') {
                       me.bAjax2fofc = true;
                   }
                   else if(type == 'fofc') {
                       me.bAjaxfofc = true;
                   }

                   me.setOption('map', type);
                }
                else {
                    alert("RCSB server has no corresponding eletron density map for this structure.");
                }

                if(me.deferredMap !== undefined) me.deferredMap.resolve();
            }
            else {
                me.showLoading();
            }
        };

        oReq.send();
    }
};
*/

iCn3DUI.prototype.loadPhiData = function(phidata, contour) { var me = this, ic = me.icn3d; "use strict";
    // http://compbio.clemson.edu/downloadDir/delphi/delphi_manual8.pdf
    // Delphi phi map is almost the same as GRASP potential map except the last line in Delphi phi map
    //   has five float values and the last value is the grid size.

    var header = {};

    var bin = (phidata.buffer && phidata.buffer instanceof ArrayBuffer) ? phidata.buffer : phidata;
//var byteView = new Uint8Array(bin);

    // skip 4 bytes before and after each line
    //http://compbio.clemson.edu/downloadDir/delphi/delphi_manual8.pdf
    //character*20 uplbl
    //character*10 nxtlbl,character*60 toplbl
    //real*4 phi(65,65,65)
    //character*16 botlbl
    //real*4 scale,oldmid(3)

//var headStr = String.fromCharCode.apply(null, byteView.subarray(0, 106));
//var uplbl = headStr.substr(4, 20); // 20 chars, 0-28, skip 4 bytes at both ends
//var nxtlbl = headStr.substr(32, 70); // 70 chars, 28-106, skip 4 bytes at both ends

    // 16 chars, bin.byteLength-52 : bin.byteLength-28, skip 4 bytes at both ends
//var botlbl = String.fromCharCode.apply(null, byteView.subarray(byteView.length - 48, byteView.length - 32));

    // 20 chars, bin.byteLength-28 : bin.byteLength, skip 4 bytes at both ends
    var scale_center = new Float32Array(bin.slice(bin.byteLength-24, bin.byteLength-8) ); // 4 values
    header.scale = scale_center[0];
    var cx = scale_center[1], cy = scale_center[2], cz = scale_center[3];

    // gridSize
    header.n = new Int32Array(bin.slice(bin.byteLength-8, bin.byteLength-4) ); // 1 value, skip the last 4 bytes

    header.xExtent = header.yExtent = header.zExtent = header.n;

    var step = 1.0/header.scale;
    var half_size = step * ((header.n - 1) / 2);
    header.ori = new THREE.Vector3(cx - half_size, cy - half_size, cz - half_size);

    // matrix: n*n*n*4 chars, 106 : bin.byteLength-52, skip 4 bytes at both ends
    // In .phi file, correctly loop x, then y, then z
    var floatView = new Float32Array(bin.slice(110, bin.byteLength-56) ); // 4 values

/*
// In .cube file, loop z, then y, then x
// should convert to loop x, then y, then z
var dataPhi = new Array(floatView.length);
var n = header.n, n2 = header.n * header.n;
for(var i = 0, il = floatView.length; i < il; ++i) { // loop z, then y, then x
    var x = i / n2;
    var yz = i % n2;
    var y = yz / n;
    var z = yz % n;

    var newI = z * n2 + y * n + x;
    dataPhi[newI] = floatView[i];
}
for(var i = 0; i < 8; ++i) { // loop z, then y, then x
console.log(i + " " + dataPhi[i]);
}
*/

    ic.mapData.headerPhi = header;
    ic.mapData.dataPhi = floatView;
    ic.mapData.contourPhi = contour;

    var matrix = new THREE.Matrix4();
    matrix.identity();
    matrix.multiply(new THREE.Matrix4().makeTranslation(
      header.ori.x, header.ori.y, header.ori.z
    ));
    ic.mapData.matrixPhi = matrix;
};
