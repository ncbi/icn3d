/**
 * @file Dsn6 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetOption} from '../display/setOption.js';

class Dsn6Parser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    dsn6Parser(pdbid, type, sigma) { let  ic = this.icn3d, me = ic.icn3dui;
        // https://edmaps.rcsb.org/maps/1kq2_2fofc.dsn6
        // https://edmaps.rcsb.org/maps/1kq2_fofc.dsn6

        let  url = "https://edmaps.rcsb.org/maps/" + pdbid.toLowerCase() + "_" + type + ".dsn6";
        this.dsn6ParserBase(url, type, sigma);
    }

    dsn6ParserBase(url, type, sigma) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        let  dataType;

        let  bCid = undefined;

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
        if(type == '2fofc' && ic.bAjax2fofc) {
            ic.mapData.sigma2 = sigma;
            ic.setOptionCls.setOption('map', type);
        }
        else if(type == 'fofc' && ic.bAjaxfofc) {
            ic.mapData.sigma = sigma;
            ic.setOptionCls.setOption('map', type);
        }
        else {
            let  oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.responseType = "arraybuffer";

            oReq.onreadystatechange = function() {
                if(this.readyState == 4) {
                   //ic.ParserUtilsCls.hideLoading();

                   if(this.status == 200) {
                       let  arrayBuffer = oReq.response;
                       thisClass.loadDsn6Data(arrayBuffer, type, sigma);

                       if(type == '2fofc') {
                           ic.bAjax2fofc = true;
                       }
                       else if(type == 'fofc') {
                           ic.bAjaxfofc = true;
                       }

                       ic.setOptionCls.setOption('map', type);
                    }
                    else {
                        alert("RCSB server has no corresponding eletron density map for this structure.");
                    }

                    if(ic.deferredMap !== undefined) ic.deferredMap.resolve();
                }
                else {
                    ic.ParserUtilsCls.showLoading();
                }
            }

            oReq.send();
        }
    }

    loadDsn6Data(dsn6data, type, sigma) { let  ic = this.icn3d, me = ic.icn3dui;
        // DSN6 http://www.uoxray.uoregon.edu/tnt/manual/node104.html
        // BRIX http://svn.cgl.ucsf.edu/svn/chimera/trunk/libs/VolumeData/dsn6/brix-1.html

        let  voxelSize = 1;

        let  header = {}
        let  divisor, summand;

        let  bin =(dsn6data.buffer && dsn6data.buffer instanceof ArrayBuffer) ? dsn6data.buffer : dsn6data;
        let  intView = new Int16Array(bin);
        let  byteView = new Uint8Array(bin);
        let  brixStr = String.fromCharCode.apply(null, byteView.subarray(0, 512));

        if(brixStr.indexOf(':-)') == 0) {
          header.xStart = parseInt(brixStr.substr(10, 5)); // NXSTART
          header.yStart = parseInt(brixStr.substr(15, 5));
          header.zStart = parseInt(brixStr.substr(20, 5));

          header.xExtent = parseInt(brixStr.substr(32, 5)); // NX
          header.yExtent = parseInt(brixStr.substr(38, 5));
          header.zExtent = parseInt(brixStr.substr(42, 5));

          header.xRate = parseInt(brixStr.substr(52, 5)); // MX
          header.yRate = parseInt(brixStr.substr(58, 5));
          header.zRate = parseInt(brixStr.substr(62, 5));

          header.xlen = parseFloat(brixStr.substr(73, 10)) * voxelSize;
          header.ylen = parseFloat(brixStr.substr(83, 10)) * voxelSize;
          header.zlen = parseFloat(brixStr.substr(93, 10)) * voxelSize;

          header.alpha = parseFloat(brixStr.substr(103, 10));
          header.beta = parseFloat(brixStr.substr(113, 10));
          header.gamma = parseFloat(brixStr.substr(123, 10));

          divisor = parseFloat(brixStr.substr(138, 12)) / 100;
          summand = parseInt(brixStr.substr(155, 8));

          header.sigma = parseFloat(brixStr.substr(170, 12)) * 100;
        } else {
          // swap byte order when big endian
          if(intView[ 18 ] !== 100) { // true
            for(let i = 0, n = intView.length; i < n; ++i) {
              let  val = intView[ i ];

              intView[ i ] =((val & 0xff) << 8) |((val >> 8) & 0xff);
            }
          }

          header.zStart = intView[ 2 ];
          header.xStart = intView[ 0 ]; // NXSTART
          header.yStart = intView[ 1 ];

          header.xExtent = intView[ 3 ]; // NX
          header.yExtent = intView[ 4 ];
          header.zExtent = intView[ 5 ];

          header.xRate = intView[ 6 ]; // MX
          header.yRate = intView[ 7 ];
          header.zRate = intView[ 8 ];

          let  factor = 1 / intView[ 17 ];
          let  scalingFactor = factor * voxelSize;

          header.xlen = intView[ 9 ] * scalingFactor;
          header.ylen = intView[ 10 ] * scalingFactor;
          header.zlen = intView[ 11 ] * scalingFactor;

          header.alpha = intView[ 12 ] * factor;
          header.beta = intView[ 13 ] * factor;
          header.gamma = intView[ 14 ] * factor;

          //divisor = intView[ 15 ] / 100;
          divisor = intView[ 15 ] / intView[ 18 ];
          summand = intView[ 16 ];
        }

        let  data = new Float32Array(
          header.xExtent * header.yExtent * header.zExtent
        );

        let  offset = 512;
        let  xBlocks = Math.ceil(header.xExtent / 8);
        let  yBlocks = Math.ceil(header.yExtent / 8);
        let  zBlocks = Math.ceil(header.zExtent / 8);

        // loop over blocks
        for(let zz = 0; zz < zBlocks; ++zz) {
          for(let yy = 0; yy < yBlocks; ++yy) {
            for(let xx = 0; xx < xBlocks; ++xx) {
              // loop inside block
              for(let k = 0; k < 8; ++k) {
                let  z = 8 * zz + k;
                for(let j = 0; j < 8; ++j) {
                  let  y = 8 * yy + j;
                  for(let i = 0; i < 8; ++i) {
                    let  x = 8 * xx + i;

                    // check if remaining slice-part contains data
                    if(x < header.xExtent && y < header.yExtent && z < header.zExtent) {
                      let  idx =((((x * header.yExtent) + y) * header.zExtent) + z);
                      data[ idx ] =(byteView[ offset ] - summand) / divisor;
                      ++offset;
                    } else {
                      offset += 8 - i;
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        if(type == '2fofc') {
            ic.mapData.header2 = header;
            ic.mapData.data2 = data;
            ic.mapData.matrix2 = this.getMatrix(header);
            ic.mapData.type2 = type;
            ic.mapData.sigma2 = sigma;
        }
        else {
            ic.mapData.header = header;
            ic.mapData.data = data;
            ic.mapData.matrix = this.getMatrix(header);
            ic.mapData.type = type;
            ic.mapData.sigma = sigma;
        }
    }

    getMatrix(header) { let  ic = this.icn3d, me = ic.icn3dui;
        let  h = header;

        let  basisX = [
          h.xlen,
          0,
          0
        ];

        let  basisY = [
          h.ylen * Math.cos(Math.PI / 180.0 * h.gamma),
          h.ylen * Math.sin(Math.PI / 180.0 * h.gamma),
          0
        ];

        let  basisZ = [
          h.zlen * Math.cos(Math.PI / 180.0 * h.beta),
          h.zlen *(
            Math.cos(Math.PI / 180.0 * h.alpha) -
            Math.cos(Math.PI / 180.0 * h.gamma) *
            Math.cos(Math.PI / 180.0 * h.beta)
          ) / Math.sin(Math.PI / 180.0 * h.gamma),
          0
        ];
        basisZ[ 2 ] = Math.sqrt(
          h.zlen * h.zlen * Math.sin(Math.PI / 180.0 * h.beta) *
          Math.sin(Math.PI / 180.0 * h.beta) - basisZ[ 1 ] * basisZ[ 1 ]
        );

        let  basis = [ [], basisX, basisY, basisZ ];
        let  nxyz = [ 0, h.xRate, h.yRate, h.zRate ];
        let  mapcrs = [ 0, 1, 2, 3 ];

        let  matrix = new THREE.Matrix4();

        matrix.set(
          basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
          basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
          basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
          0,
          basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
          basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
          basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
          0,
          basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
          basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
          basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
          0,
          0, 0, 0, 1
        );

        matrix.multiply(new THREE.Matrix4().makeTranslation(
          h.xStart, h.yStart, h.zStart
        ));

        return matrix;
    }

    loadDsn6File(type) {var ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  file = $("#" + ic.pre + "dsn6file" + type)[0].files[0];
       let  sigma = $("#" + ic.pre + "dsn6sigma" + type).val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         let  reader = new FileReader();
         reader.onload = function(e) { let  ic = thisClass.icn3d;
           let  arrayBuffer = e.target.result; // or = reader.result;
           thisClass.loadDsn6Data(arrayBuffer, type, sigma);
           if(type == '2fofc') {
               ic.bAjax2fofc = true;
           }
           else if(type == 'fofc') {
               ic.bAjaxfofc = true;
           }
           ic.setOptionCls.setOption('map', type);
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('load dsn6 file ' + $("#" + ic.pre + "dsn6file" + type).val(), false);
         }
         reader.readAsArrayBuffer(file);
       }
    }

    loadDsn6FileUrl(type) {var ic = this.icn3d, me = ic.icn3dui;
       let  url = $("#" + ic.pre + "dsn6fileurl" + type).val();
       let  sigma = $("#" + ic.pre + "dsn6sigmaurl" + type).val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           this.dsn6ParserBase(url, type, sigma);
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set map ' + type + ' sigma ' + sigma + ' | ' + encodeURIComponent(url), true);
       }
    }

}

export {Dsn6Parser}
