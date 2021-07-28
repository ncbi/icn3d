/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {LoadPDB} from '../parsers/loadPDB.js';
import {OpmParser} from '../parsers/opmParser.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';

class MmcifParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the "mmcifid". This function was deferred
    //so that it can be chained together with other deferred functions for sequential execution.
    downloadMmcif(mmcifid) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  url, dataType;

       url = "https://files.rcsb.org/view/" + mmcifid + ".cif";

       dataType = "text";

       ic.bCid = undefined;

       ic.ParserUtilsCls.setYourNote(mmcifid.toUpperCase() + '(MMCIF) in iCn3D');

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
               url = ic.icn3dui.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
               $.ajax({
                  url: url,
                  type: 'POST',
                  data : {'mmciffile': data},
                  dataType: 'jsonp',
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  beforeSend: function() {
                      ic.ParserUtilsCls.showLoading();
                  },
                  complete: function() {
                      //ic.ParserUtilsCls.hideLoading();
                  },
                  success: function(data) {
                      thisClass.loadMmcifData(data, mmcifid);
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

    downloadMmcifSymmetry(mmcifid, type) { let  ic = this.icn3d, me = ic.icn3dui;
      let  thisClass = this;

      // chain functions together
      ic.deferredSymmetry = $.Deferred(function() {
          thisClass.downloadMmcifSymmetryBase(mmcifid, type);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredSymmetry.promise();
    }

    downloadMmcifSymmetryBase(mmcifid, type) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  url, dataType;

       if(me.utilsCls.isMac()) { // safari has a problem in getting data from https://files.rcsb.org/header/
           url = "https://files.rcsb.org/view/" + mmcifid + ".cif";
       }
       else {
           url = "https://files.rcsb.org/header/" + mmcifid + ".cif";
       }

       dataType = "text";

       ic.bCid = undefined;

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              // notebook has a problem in posting data to mmcifparser.cgi
              if(ic.icn3dui.cfg.notebook) {
                let  lines = data.split('\n');

                let  bEmd = false;
                let  bOrganism = false, bStartOrganism = false;
                let  bMatrix = false, bStartMatrix = false, matrixLineCnt = 0, matrixStr = '', comLine = '';
                let  bResidues = false, bStartResidues = false, resStr = '';

                let  prevLine = '';
                for(let i in lines) {
                    let  line = lines[i];

                    //EMDB  EMD-3906
                    if(line.substr(0, 10) == 'EMDB  EMD-') {
                        ic.emd = line.substr(6).trim();
                        bEmd = true;
                    }
                    else if(line.substr(0, 27) == '_entity_src_nat.common_name') {
                        ic.organism = line.substr(27).trim();
                        if(ic.organism) bOrganism = true;
                        bStartOrganism = true;
                    }
                    else if(bStartOrganism && !bOrganism && prevLine.substr(0, 23) == '_entity_src_nat.details') {
                        //1 1 sample 1 99  Human 'Homo sapiens' 9606 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
                        let  itemArray = line.split(/\s+/);
                        ic.organism =(itemArray.length > 5) ? itemArray[5] : '';
                        bOrganism = true;
                    }
                    else if(prevLine.substr(0, 29) == '_pdbx_struct_oper_list.vector' && line.split(/\s+/).length > 2) {
                        //1 'identity operation'         1_555 x,y,z     1.0000000000  0.0000000000  0.0000000000 0.0000000000 0.0000000000  1.0000000000
                        //0.0000000000 0.0000000000 0.0000000000 0.0000000000 1.0000000000 0.0000000000

                        bStartMatrix = true;
                        ++matrixLineCnt;

                        let  pos1 = line.indexOf(' ');
                        let  pos2 = line.indexOf("' ");
                        comLine += line.substr(0, pos1) + line.substr(pos2 + 1);

                        matrixStr += '[';
                    }
                    else if(bStartMatrix && line.trim() == '#') {
                        // remove the last ','
                        if(matrixStr != '[') matrixStr = matrixStr.substr(0, matrixStr.length - 1);

                        matrixStr += ']';
                        bMatrix = true;
                        bStartMatrix = false;
                    }
                    else if(bStartMatrix && !bMatrix) {
                        ++matrixLineCnt;

                        if(matrixLineCnt % 2 == 0) {
                            comLine += line;
                            let  itemArray = comLine.split(/\s+/);

                            if(itemArray[0] != 'X0' && itemArray[0] != 'P' && itemArray.length > 14) {
                                let  m11 = itemArray[3], m12 = itemArray[4], m13 = itemArray[5], m14 = itemArray[6];
                                let  m21 = itemArray[7], m22 = itemArray[8], m23 = itemArray[9], m24 = itemArray[10];
                                let  m31 = itemArray[11], m32 = itemArray[12], m33 = itemArray[13], m34 = itemArray[14];

                                matrixStr += "[" + m11 + "," + m21 + "," + m31 + ", 0, " + m12 + "," + m22 + "," + m32 + ", 0, "
                                  + m13 + "," + m23 + "," + m33 + ", 0, " + m14 + "," + m24 + "," + m34 + ", 1" + "],";
                            }

                            comLine = '';
                        }
                        else {
                            let  pos1 = line.indexOf(' ');
                            let  pos2 = line.indexOf("' ");
                            comLine += line.substr(0, pos1) + line.substr(pos2 + 1);
                        }
                    }
                    else if(bStartResidues && line.trim() == '#') {
                        // remove the last ','
                        if(resStr != '[') resStr = resStr.substr(0, resStr.length - 1);

                        resStr += ']';
                        bResidues = true;
                        bStartResidues = false;
                    }
                    else if(prevLine.trim() == '_pdbx_poly_seq_scheic.hetero' ||(bStartResidues && !bResidues)) {
                        if(prevLine.trim() == '_pdbx_poly_seq_scheic.hetero') {
                            bStartResidues = true;
                            resStr += '[';
                        }

                        //A 1 1   ASP 1   1   ?   ?   ?   A . n
                        let  itemArray = line.split(/\s+/);
                        let  resn = itemArray[3];
                        let  chain = itemArray[9];
                        let  resi = itemArray[5];

                        let  authResi = itemArray[6];

                        if(authResi == "?") {
                          resStr += "{\"resn\": \"" + resn + "\", \"chain\": \"" + chain + "\", \"resi\": " + resi + "},";
                        }
                    }

                    if(bOrganism && bMatrix && bResidues) {
                        break;
                    }

                    prevLine = line;
                }

                if(ic.bAssemblyUseAsu) thisClass.loadMmcifSymmetry(JSON.parse(matrixStr));

                if(resStr == "") resStr = "[]";
                let  missingseq = JSON.parse(resStr);
                if(type === 'mmtfid' && missingseq !== undefined) {
                    // adjust missing residues
                    let  maxMissingResi = 0, prevMissingChain = '';
                    let  chainMissingResidueArray = {}
                    for(let i = 0, il = missingseq.length; i < il; ++i) {

                        let  resn = missingseq[i].resn;
                        let  chain = missingseq[i].chain;
                        let  resi = missingseq[i].resi;

                        let  chainNum = mmcifid + '_' + chain;

                        if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                        let  resObject = {}
                        resObject.resi = resi;
                        resObject.name = me.utilsCls.residueName2Abbr(resn).toLowerCase();

                        if(chain != prevMissingChain) {
                            maxMissingResi = 0;
                        }

                        // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                        if(!isNaN(resi) &&(prevMissingChain == '' ||(chain != prevMissingChain) ||(chain == prevMissingChain && resi > maxMissingResi)) ) {
                            chainMissingResidueArray[chainNum].push(resObject);

                            maxMissingResi = resi;
                            prevMissingChain = chain;
                        }
                    }

                    ic.loadPDBCls.adjustSeq(chainMissingResidueArray);
                }

                if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
            }
            else { // if(!ic.icn3dui.cfg.notebook) {
               url = ic.icn3dui.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";

               $.ajax({
                  url: url,
                  type: 'POST',
                  data : {'mmcifheader': data},
                  dataType: 'jsonp',
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                      if(data.emd !== undefined) ic.emd = data.emd;
                      if(data.organism !== undefined) ic.organism = data.organism;

                      if(ic.bAssemblyUseAsu) thisClass.loadMmcifSymmetry(data.assembly);

                      if(type === 'mmtfid' && data.missingseq !== undefined) {
                            // adjust missing residues
                            let  maxMissingResi = 0, prevMissingChain = '';
                            let  chainMissingResidueArray = {}
                            for(let i = 0, il = data.missingseq.length; i < il; ++i) {

                                let  resn = data.missingseq[i].resn;
                                let  chain = data.missingseq[i].chain;
                                let  resi = data.missingseq[i].resi;

                                let  chainNum = mmcifid + '_' + chain;

                                if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                                let  resObject = {}
                                resObject.resi = resi;
                                resObject.name = me.utilsCls.residueName2Abbr(resn).toLowerCase();

                                if(chain != prevMissingChain) {
                                    maxMissingResi = 0;
                                }

                                // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                                if(!isNaN(resi) &&(prevMissingChain == '' ||(chain != prevMissingChain) ||(chain == prevMissingChain && resi > maxMissingResi)) ) {
                                    chainMissingResidueArray[chainNum].push(resObject);

                                    maxMissingResi = resi;
                                    prevMissingChain = chain;
                                }
                            }

                            ic.loadPDBCls.adjustSeq(chainMissingResidueArray);
                      }

                      if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if(this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }

                    if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
                    return;
                  }
                });
            } // if(!ic.icn3dui.cfg.notebook
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }

            if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
            return;
          }
        });
    }

    //Atom "data" from mmCIF file was parsed to set up parameters for the 3D viewer by calling the function
    //loadAtomDataIn. The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    loadMmcifData(data, mmcifid) { let  ic = this.icn3d, me = ic.icn3dui;
        if(!mmcifid) mmcifid = data.mmcif;
        if(!mmcifid) mmcifid = 'stru';

        if(data.atoms !== undefined) {
            ic.init();

            if(data.emd !== undefined) ic.emd = data.emd;
            if(data.organism !== undefined) ic.organism = data.organism;

            if(ic.emd !== undefined) {
              $("#" + ic.pre + "mapWrapper1").hide();
              $("#" + ic.pre + "mapWrapper2").hide();
              $("#" + ic.pre + "mapWrapper3").hide();
            }
            else {
              $("#" + ic.pre + "emmapWrapper1").hide();
              $("#" + ic.pre + "emmapWrapper2").hide();
              $("#" + ic.pre + "emmapWrapper3").hide();
            }

            //ic.loadAtomDataCls.loadAtomDataIn(data, data.mmcif, 'mmcifid');
            ic.deferredOpm = $.Deferred(function() {
                  //ic.mmcifParserCls.loadMmcifOpmData(data, mmcifid);
                  ic.opmParserCls.loadOpmData(data, mmcifid, undefined, 'mmcif');
            });

            return ic.deferredOpm.promise();
        }
        else {
            //alert('invalid atoms data.');
            return false;
        }
    }

    loadMmcifSymmetry(assembly) { let  ic = this.icn3d, me = ic.icn3dui;
        // load assembly info
        //var assembly = data.assembly;
        //var pmatrix = data.pmatrix;

        for(let i = 0, il = assembly.length; i < il; ++i) {
          let  mat4 = new THREE.Matrix4();
          mat4.fromArray(assembly[i]);

          ic.biomtMatrices[i] = mat4;
        }

        ic.asuCnt = ic.biomtMatrices.length;
    }

    loadMmcifOpmDataPart2(data, pdbid) { let  ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        // load assembly info
        let  assembly =(data.assembly !== undefined) ? data.assembly : [];
        for(let i = 0, il = assembly.length; i < il; ++i) {
          if(ic.biomtMatrices[i] == undefined) ic.biomtMatrices[i] = new THREE.Matrix4().identity();

          for(let j = 0, jl = assembly[i].length; j < jl; ++j) {
            ic.biomtMatrices[i].elements[j] = assembly[i][j];
          }
        }

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
            $("#" + ic.pre + "assemblyWrapper").show();

            ic.asuCnt = ic.biomtMatrices.length;
        }
        else {
            $("#" + ic.pre + "assemblyWrapper").hide();
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        ic.ParserUtilsCls.renderStructure();

        if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

        //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }
}

export {MmcifParser}
