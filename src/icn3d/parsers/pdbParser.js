/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {OpmParser} from '../parsers/opmParser.js';
import {SdfParser} from '../parsers/sdfParser.js';
import {XyzParser} from '../parsers/xyzParser.js';
import {Mol2Parser} from '../parsers/mol2Parser.js';
import {LoadPDB} from '../parsers/loadPDB.js';
import {MmcifParser} from '../parsers/mmcifParser.js';
import {Dssp} from '../analysis/dssp.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {SaveFile} from '../export/saveFile.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';

class PdbParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the "pdbid". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. A wrapper
    //was added to support both http and https.
    downloadPdb(pdbid) { let  ic = this.icn3d, me = ic.icn3dui;
       let  url, dataType;

       url = "https://files.rcsb.org/view/" + pdbid + ".pdb";

       dataType = "text";

       ic.bCid = undefined;

       ic.ParserUtilsCls.setYourNote(pdbid.toUpperCase() + '(PDB) in iCn3D');

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
              //ic.pdbParserCls.loadPdbData(data, pdbid);
              ic.deferredOpm = $.Deferred(function() {
                  //ic.loadPdbOpmData(data, pdbid);
                  ic.opmParserCls.loadOpmData(data, pdbid, undefined, 'pdb');
              });

              return ic.deferredOpm.promise();
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

    //Load structures from a "URL". Due to the same domain policy of Ajax call, the URL should be in the same
    //domain. "type" could be "pdb", "mol2", "sdf", or "xyz" for pdb file, mol2file, sdf file, and xyz file, respectively.
    downloadUrl(url, type) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  dataType = "text";

       ic.bCid = undefined;

       //var url = '//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?dataurl=' + encodeURIComponent(url);

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
            ic.InputfileData = data;
            ic.InputfileType = type;

            if(type === 'pdb') {
                thisClass.loadPdbData(data);
            }
            else if(type === 'mol2') {
                ic.mol2ParserCls.loadMol2Data(data);
            }
            else if(type === 'sdf') {
                ic.sdfParserCls.loadSdfData(data);
            }
            else if(type === 'xyz') {
                ic.xyzParserCls.loadXyzData(data);
            }
            else if(type === 'mmcif') {
                ic.mmcifParserCls.loadMmcifData(data);
            }
            else if(type === 'icn3dpng') {
                ic.mmcifParserCls.loadMmcifData(data);
                me.htmlCls.setHtmlCls.loadPng(data);
            }
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

    //Atom "data" from PDB file was parsed to set up parameters for the 3D viewer. The deferred parameter
    //was resolved after the parsing so that other javascript code can be executed.
    loadPdbData(data, pdbid, bOpm) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.loadPDBCls.loadPDB(data, pdbid, bOpm); // defined in the core library

        if(ic.icn3dui.cfg.opmid === undefined) ic.ParserUtilsCls.transformToOpmOri(pdbid);

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
          $("#" + ic.pre + "assemblyWrapper").show();

          ic.asuCnt = ic.biomtMatrices.length;
        }
        else {
          $("#" + ic.pre + "assemblyWrapper").hide();
        }

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

        // calculate secondary structures if not available
        // DSSP only works for structures with all atoms. The Calpha only strucutres didn't work
        //if(!ic.bSecondaryStructure && !bCalphaOnly) {

        if(!ic.bSecondaryStructure && Object.keys(ic.proteins).length > 0) {
          ic.deferredSecondary = $.Deferred(function() {
              let  bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(ic.proteins, ic.atoms));//, 'CA');
              ic.dsspCls.applyDssp(bCalphaOnly);
          }); // end of ic.icn3dui.deferred = $.Deferred(function() {

          return ic.deferredSecondary.promise();
        }
        else {
            this.loadPdbDataRender();
        }
    }

    loadPdbDataRender() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.pmid = ic.pmid;

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        ic.ParserUtilsCls.renderStructure();

        ic.saveFileCls.showTitle();

        if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

    //    if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }
}

export {PdbParser}
