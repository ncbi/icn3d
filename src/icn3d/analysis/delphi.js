/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetOption} from '../display/setOption.js';
import {SaveFile} from '../export/saveFile.js';


class Delphi {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    CalcPhiUrl(gsize, salt, contour, bSurface, url) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);

        oReq.responseType = "text";

        oReq.onreadystatechange = function() {
            if(this.readyState == 4) {
               //ic.ParserUtilsCls.hideLoading();

               if(this.status == 200) {
                   let data = oReq.response;

                   thisClass.CalcPhi(gsize, salt, contour, bSurface, data);
                }
                else {
                    alert("The PQR file is unavailable...");
                }
            }
            else {
                ic.ParserUtilsCls.showLoading();
            }
        }

        oReq.send();
    }

    getPdbStr(bNode) { let ic = this.icn3d, me = ic.icn3dui;
       let chainHash = {}, ionHash = {}
       let atomHash = {}

       let atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
       for(let i in atoms) {
           let atom = ic.atoms[i];

           if(ic.ions.hasOwnProperty(i)) {
             ionHash[i] = 1;
           }
           else {
             atomHash[i] = 1;
           }
       }

       let atomCnt = Object.keys(atomHash).length;
       let bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms));
       if(bCalphaOnly) {
           if(!bNode) {
               alert("The potential will not be shown because the side chains are missing in the structure...");
           }
           else {
               console.log("The potential will not be shown because the side chains are missing in the structure...");
           }

           return;
       }

       if(atomCnt > 30000) {
           if(!bNode) {
               alert("The maximum number of allowed atoms is 30,000. Please try it again with selected chains...");
           }
           else {
               console.log("The maximum number of allowed atoms is 30,000. Please try it again with selected chains...");
           }

           return;
       }

       let pdbstr = '';
       pdbstr += ic.saveFileCls.getPDBHeader();

       pdbstr +=(ic.icn3dui.cfg.cid) ? ic.saveFileCls.getAtomPDB(atomHash, true) : ic.saveFileCls.getAtomPDB(atomHash);
       pdbstr += ic.saveFileCls.getAtomPDB(ionHash, true);

       return pdbstr;
    }

    CalcPhi(gsize, salt, contour, bSurface, data) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       ic.loadPhiFrom = 'delphi';

       let url = "https://www.ncbi.nlm.nih.gov/Structure/delphi/delphi.fcgi";
       let pdbid =(ic.icn3dui.cfg.cid) ? ic.icn3dui.cfg.cid : Object.keys(ic.structures).toString();
       let dataObj = {}

       if(data) {
           dataObj = {'pqr2phi': data, 'gsize': gsize, 'salt': salt, 'pdbid': pdbid}
       }
       else {
           let pdbstr = this.getPdbStr();

           dataObj = {'pdb2phi': pdbstr, 'gsize': gsize, 'salt': salt, 'pdbid': pdbid}
       }

       // see full_ui.js for ajaxTransport
       $.ajax({
          url: url,
          type: 'POST',
          data : dataObj,
          dataType: 'binary',
          responseType: 'arraybuffer',
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
               thisClass.loadPhiData(data, contour, bSurface);

               ic.bAjaxPhi = true;

               if(bSurface) {
                 ic.setOptionCls.setOption('phisurface', 'phi');
               }
               else {
                 ic.setOptionCls.setOption('phimap', 'phi');
               }

               if(ic.deferredDelphi !== undefined) ic.deferredDelphi.resolve();
               if(ic.deferredPhi !== undefined) ic.deferredPhi.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            return;
          }
        });
    }

    PhiParser(url, type, contour, bSurface) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        //var dataType;

        //var bCid = undefined;

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
    /*
        if(type == '2fofc' && ic.bAjax2fofc) {
            ic.mapData.contour2 = contour;
            ic.setOptionCls.setOption('map', type);
        }
        else if(type == 'fofc' && ic.bAjaxfofc) {
            ic.mapData.contour = contour;
            ic.setOptionCls.setOption('map', type);
        }
        else {
    */
            let oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);

            if(type == 'phiurl' || type == 'phiurl2') {
                oReq.responseType = "arraybuffer";
            }
            else {
                oReq.responseType = "text";
            }

            oReq.onreadystatechange = function() {
                if(this.readyState == 4) {
                   //ic.ParserUtilsCls.hideLoading();

                   if(this.status == 200) {
                       let data = oReq.response;

                       if(type == 'phiurl' || type == 'phiurl2') {
                           thisClass.loadPhiData(data, contour, bSurface);
                       }
                       else {
                           thisClass.loadCubeData(data, contour, bSurface);
                       }

                       ic.bAjaxPhi = true;

                       if(bSurface) {
                         ic.setOptionCls.setOption('phisurface', 'phi');
                       }
                       else {
                         ic.setOptionCls.setOption('phimap', 'phi');
                       }
                    }
                    else {
                        alert("The potential file is unavailable...");
                    }

                    if(ic.deferredPhi !== undefined) ic.deferredPhi.resolve();
                }
                else {
                    ic.ParserUtilsCls.showLoading();
                }
            }

            oReq.send();
    //    }
    }

    loadPhiData(data, contour, bSurface) { let ic = this.icn3d, me = ic.icn3dui;
        // http://compbio.clemson.edu/downloadDir/delphi/delphi_manual8.pdf
        // Delphi phi map is almost the same as GRASP potential map except the last line in Delphi phi map
        //   has five float values and the last value is the grid size.

        let header = {}
        header.filetype = 'phi';

        let bin =(data.buffer && data.buffer instanceof ArrayBuffer) ? data.buffer : data;
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
        let scale_center = new Float32Array(bin.slice(bin.byteLength-24, bin.byteLength-8) ); // 4 values
        header.scale = scale_center[0];
        let cx = scale_center[1], cy = scale_center[2], cz = scale_center[3];

        // gridSize
        header.n = new Int32Array(bin.slice(bin.byteLength-8, bin.byteLength-4) ); // 1 value, skip the last 4 bytes

        header.xExtent = header.yExtent = header.zExtent = header.n;

        let step = 1.0/header.scale;
        let half_size = step *((header.n - 1) / 2);
        header.ori = new THREE.Vector3(cx - half_size, cy - half_size, cz - half_size);

        // matrix: n*n*n*4 chars, 106 : bin.byteLength-52, skip 4 bytes at both ends
        // In .phi file, correctly loop x, then y, then z
        let floatView = new Float32Array(bin.slice(110, bin.byteLength-56) ); // 4 values

        header.bSurface = bSurface;

        ic.mapData.headerPhi = header;
        ic.mapData.dataPhi = floatView;
        ic.mapData.contourPhi = contour;

        let matrix = new THREE.Matrix4();
        matrix.identity();
        matrix.multiply(new THREE.Matrix4().makeTranslation(
          header.ori.x, header.ori.y, header.ori.z
        ));
        ic.mapData.matrixPhi = matrix;
    }

    loadCubeData(data, contour, bSurface) { let ic = this.icn3d, me = ic.icn3dui;
        // http://compbio.clemson.edu/downloadDir/delphi/delphi_manual8.pdf
    //  2.000000   117 22.724000 42.148000  8.968000 // scale, grid size, center x, y, z
    //Gaussian cube format phimap
    //    1    -11.859921     24.846119    -37.854994
    //  117      0.944863      0.000000      0.000000
    //  117      0.000000      0.944863      0.000000
    //  117      0.000000      0.000000      0.944863
    //    1      0.000000      0.000000      0.000000      0.000000
    // -2.89368e+00 -2.91154e+00 -2.92951e+00 -2.94753e+00 -2.96562e+00 -2.98375e+00 // each section contains 117 values, loops z, then y, then x

        let header = {}
        header.filetype = 'cube';

        let lines = data.split('\n');

        let paraArray = [];

    /*
        let tmpArray = lines[0].split(/\s+/);
        for(let i = 0; i < tmpArray.length; ++i) {
            let value = parseFloat(tmpArray[i]);
            if(!isNaN(value)) paraArray.push(value);
        }
    */
        paraArray.push(parseFloat( lines[0].substr(0, 10) ) );
        paraArray.push(parseFloat( lines[0].substr(10, 6) ) );
        paraArray.push(parseFloat( lines[0].substr(16, 10) ) );
        paraArray.push(parseFloat( lines[0].substr(26, 10) ) );
        paraArray.push(parseFloat( lines[0].substr(36, 10) ) );

        header.scale = paraArray[0];
        let cx = paraArray[2], cy = paraArray[3], cz = paraArray[4];

        // gridSize
        header.n = paraArray[1];

        header.xExtent = header.yExtent = header.zExtent = header.n;

        let step = 1.0/header.scale;
        let half_size = step *((header.n - 1) / 2);
        header.ori = new THREE.Vector3(cx - half_size, cy - half_size, cz - half_size);

        let dataPhi = [];
        for(let i = 7, il = lines.length; i < il; ++i) {
            let valueArray = lines[i].split(/\s+/);
            for(let j = 0, jl = valueArray.length; j < jl; ++j) {
                let value = parseFloat(valueArray[j]);
                if(!isNaN(value)) dataPhi.push(value);
            }
        }

        if(dataPhi.length != header.n * header.n * header.n) {
            console.log("the data array size " + dataPhi.length + " didn't match the grid size " + header.n * header.n * header.n + "...");
        }

        header.bSurface = bSurface;

        ic.mapData.headerPhi = header;
        ic.mapData.dataPhi = dataPhi;
        ic.mapData.contourPhi = contour;

        let matrix = new THREE.Matrix4();
        matrix.identity();
        matrix.multiply(new THREE.Matrix4().makeTranslation(
          header.ori.x, header.ori.y, header.ori.z
        ));
        ic.mapData.matrixPhi = matrix;
    }

    applyCommandPhi(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;
      // chain functions together
      ic.deferredPhi = $.Deferred(function() { let ic = thisClass.icn3d;
          //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set phi phiurl2/cubeurl2 | contour ' + contour + ' | url ' + encodeURIComponent(url)
          //       + ' | gsize ' + gsize + ' | salt ' + salt
          //       + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);
          //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set phi phiurl/cubeurl | contour ' + contour + ' | url ' + encodeURIComponent(url)
          //       + ' | gsize ' + gsize + ' | salt ' + salt, true);
          let paraArray = command.split(" | ");

          let typeArray = paraArray[0].split(" ");
          let contourArray = paraArray[1].split(" ");
          let urlArray = paraArray[2].split(" ");
          let gsizeArray = paraArray[3].split(" ");
          let saltArray = paraArray[4].split(" ");

          let type = typeArray[2];
          let contour = parseFloat(contourArray[1]);
          let url = urlArray[1];
          let gsize = gsizeArray[1];
          let salt = saltArray[1];

          //var pdbid = Object.keys(ic.structures)[0];
          //url = url.replace(/!/g, pdbid + '_');

          if(paraArray.length == 8) {
              let surfaceArray = paraArray[5].split(" ");
              let opacityArray = paraArray[6].split(" ");
              let wireframeArray = paraArray[7].split(" ");

              ic.phisurftype = surfaceArray[1];
              ic.phisurfop = parseFloat(opacityArray[1]);
              ic.phisurfwf = wireframeArray[1];

              $("#" + ic.pre + "delphi" + "surftype").val(ic.phisurftype);
              $("#" + ic.pre + "delphi" + "surfop").val(ic.phisurfop);
              $("#" + ic.pre + "delphi" + "surfwf").val(ic.phisurfwf);
          }

          let bSurface =(type == 'pqrurl2' || type == 'phiurl2' || type == 'cubeurl2') ? true : false;

          if(type == 'pqrurl' || type == 'pqrurl2') {
              thisClass.CalcPhiUrl(gsize, salt, contour, bSurface, url);
          }
          else {
              thisClass.PhiParser(url, type, contour, bSurface);
          }
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredPhi.promise();
    }

    applyCommandDelphi(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
      ic.deferredDelphi = $.Deferred(function() { let ic = thisClass.icn3d;
           //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set delphi surface | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt
           //  + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);

           //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set delphi map | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt, true);

          let paraArray = command.split(" | ");

          let typeArray = paraArray[0].split(" ");
          let contourArray = paraArray[1].split(" ");
          let gsizeArray = paraArray[2].split(" ");
          let saltArray = paraArray[3].split(" ");

          let type = typeArray[2];
          let contour = contourArray[1]; //parseFloat(contourArray[1]);
          let gsize = gsizeArray[1]; //parseInt(gsizeArray[1]);
          let salt = saltArray[1]; //parseFloat(saltArray[1]);

          // The values should be string
          $("#" + ic.pre + "delphigsize").val(gsize);
          $("#" + ic.pre + "delphisalt").val(salt);

          if(paraArray.length == 7) {
              let surfaceArray = paraArray[4].split(" ");
              let opacityArray = paraArray[5].split(" ");
              let wireframeArray = paraArray[6].split(" ");

              ic.phisurftype = surfaceArray[1];
              ic.phisurfop = opacityArray[1]; //parseFloat(opacityArray[1]);
              ic.phisurfwf = wireframeArray[1];

              $("#" + ic.pre + "delphi" + "surftype").val(ic.phisurftype);
              $("#" + ic.pre + "delphi" + "surfop").val(ic.phisurfop);
              $("#" + ic.pre + "delphi" + "surfwf").val(ic.phisurfwf);
          }

          let bSurface =(type == 'surface') ? true : false;

          thisClass.CalcPhi(gsize, salt, contour, bSurface);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredDelphi.promise();
    }

    loadDelphiFile(type) { let ic = this.icn3d, me = ic.icn3dui;
       let gsize = $("#" + ic.pre + "delphigsize").val();
       let salt = $("#" + ic.pre + "delphisalt").val();
       let contour =(type == 'delphi2') ? $("#" + ic.pre + "delphicontour2").val() : $("#" + ic.pre + "delphicontour").val();

       let bSurface =(type == 'delphi2') ? true: false;

       this.CalcPhi(gsize, salt, contour, bSurface);

       let displayType =(type == 'delphi2') ? 'surface' : 'map';

       if(bSurface) {
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set delphi ' + displayType + ' | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt
             + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);
       }
       else {
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set delphi ' + displayType + ' | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt, true);
       }
    }

    loadPhiFile(type) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let file;
       if(type == 'pqr' || type == 'phi' || type == 'cube') {
           file = $("#" + ic.pre + type + "file")[0].files[0];
       }
       else if(type == 'pqr2') {
           file = $("#" + ic.pre + "pqrfile2")[0].files[0];
       }
       else if(type == 'phi2') {
           file = $("#" + ic.pre + "phifile2")[0].files[0];
       }
       else if(type == 'cube2') {
           file = $("#" + ic.pre + "cubefile2")[0].files[0];
       }

       let contour =(type == 'pqr' || type == 'phi' || type == 'cube') ? $("#" + ic.pre + "phicontour").val() : $("#" + ic.pre + "phicontour2").val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         let reader = new FileReader();
         reader.onload = function(e) { let ic = thisClass.icn3d;
           let data = e.target.result; // or = reader.result;

           let gsize = 0, salt = 0;
           if(type == 'pqr' || type == 'pqr2') {
             let bSurface =(type == 'pqr2') ? true: false;

             gsize = $("#" + ic.pre + type + "gsize").val();
             salt = $("#" + ic.pre + type + "salt").val();
             thisClass.CalcPhi(gsize, salt, contour, bSurface, data);
           }
           else if(type == 'phi' || type == 'phi2') {
             let bSurface =(type == 'phi2') ? true: false;
             thisClass.loadPhiData(data, contour, bSurface);
           }
           else if(type == 'cube' || type == 'cube2') {
             let bSurface =(type == 'cube2') ? true: false;
             thisClass.loadCubeData(data, contour, bSurface);
           }

           ic.bAjaxPhi = true;

           if(bSurface) {
             ic.setOptionCls.setOption('phisurface', 'phi');
           }
           else {
             ic.setOptionCls.setOption('phimap', 'phi');
           }

           if(bSurface) {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('load phi ' + type + ' | contour ' + contour + ' | file ' + $("#" + ic.pre + type + "file").val()
                 + ' | gsize ' + gsize + ' | salt ' + salt
                 + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, false);
           }
           else {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('load phi ' + type + ' | contour ' + contour + ' | file ' + $("#" + ic.pre + type + "file").val()
                 + ' | gsize ' + gsize + ' | salt ' + salt, false);
           }
         }
         if(type == 'phi' || type == 'phi2') {
             reader.readAsArrayBuffer(file);
         }
         else {
             reader.readAsText(file);
         }
       }
    }
    loadPhiFileUrl(type) { let ic = this.icn3d, me = ic.icn3dui;
       let url;
       if(type == 'pqrurl' || type == 'phiurl' || type == 'cubeurl') {
           url = $("#" + ic.pre + type + "file").val();
       }
       else if(type == 'pqrurl2') {
           url = $("#" + ic.pre + "pqrurlfile2").val();
       }
       else if(type == 'phiurl2') {
           url = $("#" + ic.pre + "phiurlfile2").val();
       }
       else if(type == 'cubeurl2') {
           url = $("#" + ic.pre + "cubeurlfile2").val();
       }

       let contour =(type == 'pqrurl' || type == 'phiurl' || type == 'cubeurl') ? $("#" + ic.pre + "phiurlcontour").val() :  $("#" + ic.pre + "phiurlcontour2").val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           let bSurface =(type == 'pqrurl2' || type == 'phiurl2' || type == 'cubeurl2') ? true: false;

           let gsize = 0, salt = 0;

           if(type == 'pqrurl' || type == 'pqrurl2') {
               gsize = $("#" + ic.pre + type + "gsize").val();
               salt = $("#" + ic.pre + type + "salt").val();
               this.CalcPhiUrl(gsize, salt, contour, bSurface, url);
           }
           else {
               this.PhiParser(url, type, contour, bSurface);
           }

           if(bSurface) {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set phi ' + type + ' | contour ' + contour + ' | url ' + encodeURIComponent(url)
                 + ' | gsize ' + gsize + ' | salt ' + salt
                 + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);
           }
           else {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set phi ' + type + ' | contour ' + contour + ' | url ' + encodeURIComponent(url)
                 + ' | gsize ' + gsize + ' | salt ' + salt, true);
           }
       }
    }
}

export {Delphi}
