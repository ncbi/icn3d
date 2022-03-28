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
    downloadPdb(pdbid, bAf) { let  ic = this.icn3d, me = ic.icn3dui;
       let  url, dataType;

       if(bAf) {
           url = "https://alphafold.ebi.ac.uk/files/AF-" + pdbid + "-F1-model_v2.pdb";
           ic.ParserUtilsCls.setYourNote(pdbid.toUpperCase() + '(AlphaFold) in iCn3D');
       }
       else {
           url = "https://files.rcsb.org/view/" + pdbid + ".pdb";
           ic.ParserUtilsCls.setYourNote(pdbid.toUpperCase() + '(PDB) in iCn3D');
       }

       dataType = "text";

       ic.bCid = undefined;

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1
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
                  if(bAf) {
                      // add UniProt ID into the header
                      let header = 'HEADER                                                        ' + pdbid + '\n';
                      data = header + data;
                      ic.opmParserCls.parseAtomData(data, pdbid, undefined, 'pdb', undefined);
                  }
                  else {
                      ic.opmParserCls.loadOpmData(data, pdbid, undefined, 'pdb');
                  }
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
    downloadUrl(url, type, command) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let pos = url.lastIndexOf('/');
       if(pos != -1) {
           let posDot = url.lastIndexOf('.');
           ic.filename = url.substr(pos + 1, posDot - pos - 1);
       }
       else {
           let posDot = url.lastIndexOf('.');
           ic.filename = url.substr(0, posDot);
       }

       let  dataType = "text";

       ic.bCid = undefined;

       //var url = '//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?dataurl=' + encodeURIComponent(url);

       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
            ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + data : data;
            ic.InputfileType = type;

            if(type === 'pdb') {
                thisClass.loadPdbData(data);
                ic.loadScriptCls.loadScript(command);
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
                me.htmlCls.setHtmlCls.loadPng(data, command);
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
    loadPdbData(data, pdbid, bOpm, bAppend, type, bLastQuery, bNoDssp) { let  ic = this.icn3d, me = ic.icn3dui;
        if(!bAppend && (type === undefined || type === 'target')) {
            // if a command contains "load...", the commands should not be cleared with init()
            let bKeepCmd = (ic.bCommandLoad) ? true : false;
            if(!ic.bStatefile) ic.init(bKeepCmd);
        }

        let hAtoms = ic.loadPDBCls.loadPDB(data, pdbid, bOpm, undefined, undefined, bAppend, type, bLastQuery); // defined in the core library

        if(me.cfg.opmid === undefined) ic.ParserUtilsCls.transformToOpmOri(pdbid);

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
        let bCalcSecondary = false;
        if(ic.bSecondaryStructure && Object.keys(ic.structures).length == 1) {
            bCalcSecondary = false;
        }
        else if(!me.cfg.mmtfid && !me.cfg.pdbid && !me.cfg.opmid && !me.cfg.mmdbid && !me.cfg.gi && !me.cfg.uniprotid && !me.cfg.blast_rep_id && !me.cfg.cid && !me.cfg.mmcifid && !me.cfg.align && !me.cfg.chainalign) {
            bCalcSecondary = true;
        }

//        if(!ic.bSecondaryStructure && Object.keys(ic.proteins).length > 0) {
        if((!ic.bSecondaryStructure || bCalcSecondary) && Object.keys(ic.proteins).length > 0 && !bNoDssp) {
            this.applyCommandDssp(bAppend);
        }
        else {
            this.loadPdbDataRender(bAppend);
        }

        return hAtoms;
    }

    applyCommandDssp(bAppend) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.deferredSecondary = $.Deferred(function() {
            let  bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(ic.proteins, ic.atoms));//, 'CA');
            ic.dsspCls.applyDssp(bCalphaOnly, bAppend);
        }); // end of me.deferred = $.Deferred(function() {

        return ic.deferredSecondary.promise();
    }

    loadPdbDataRender(bAppend) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.pmid = ic.pmid;

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(me.cfg.afid) {
            ic.opts['color'] = 'confidence';
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
//        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

        ic.ParserUtilsCls.renderStructure();

        ic.saveFileCls.showTitle();

        if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

        if(bAppend) {
            // show all
            ic.definedSetsCls.setModeAndDisplay('all');
        }

    //    if(me.deferred !== undefined) me.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }
}

export {PdbParser}
