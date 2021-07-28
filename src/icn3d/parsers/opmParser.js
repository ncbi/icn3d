/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {PdbParser} from '../parsers/pdbParser.js';
import {LoadAtomData} from '../parsers/loadAtomData.js';
import {MmtfParser} from '../parsers/mmtfParser.js';
import {AlignParser} from '../parsers/alignParser.js';
import {MmcifParser} from '../parsers/mmcifParser.js';

class OpmParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    downloadOpm(opmid) { let  ic = this.icn3d, me = ic.icn3dui;
       let  url, dataType;

       url = "https://opm-assets.storage.googleapis.com/pdb/" + opmid.toLowerCase()+ ".pdb";

       ic.ParserUtilsCls.setYourNote(opmid.toUpperCase() + '(OPM) in iCn3D');

       dataType = "text";

       ic.bCid = undefined;

       // no rotation
       ic.bStopRotate = true;

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
              ic.bOpm = true;
              ic.pdbParserCls.loadPdbData(data, opmid, ic.bOpm);

              $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
              $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

              $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
              $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            alert("This is probably not a transmembrane protein. It has no data in Orientations of Proteins in Membranes(OPM) database.");
            return;
          }
       });
    }

    loadOpmData(data, pdbid, bFull, type, pdbid2) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        let  url, dataType;

        if(!pdbid) pdbid = 'stru';

        url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&opm&uid=" + pdbid.toLowerCase();
        dataType = "jsonp";

        $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          success: function(opmdata) {
              thisClass.setOpmData(opmdata); // set ic.bOpm

    //          $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
    //          $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

    //          $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
    //          $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

              thisClass.parseAtomData(data, pdbid, bFull, type, pdbid2);

              //if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }

            thisClass.parseAtomData(data, pdbid, bFull, type, pdbid2);

            //if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
            return;
          }
        });
    }

    setOpmData(data) { let  ic = this.icn3d, me = ic.icn3dui;
        if(data.opm !== undefined && data.opm.rot !== undefined) {
            ic.bOpm = true;

            ic.halfBilayerSize = data.opm.thickness;
            ic.rmsd_supr = {}
            ic.rmsd_supr.rot = data.opm.rot;
            ic.rmsd_supr.trans1 = new THREE.Vector3(data.opm.trans1[0], data.opm.trans1[1], data.opm.trans1[2]);
            ic.rmsd_supr.trans2 = new THREE.Vector3(data.opm.trans2[0], data.opm.trans2[1], data.opm.trans2[2]);
            ic.rmsd_supr.rmsd = data.opm.rmsd;

          $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
          $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

          $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
          $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);
        }
        else {
            ic.bOpm = false;
        }
    }

    parseAtomData(data, pdbid, bFull, type, pdbid2) { let  ic = this.icn3d, me = ic.icn3dui;
          if(type === 'mmtf') {
              ic.mmtfParserCls.parseMmtfData(data, pdbid, bFull);

              if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
          }
          else if(type === 'mmcif') {
              ic.loadAtomDataCls.loadAtomDataIn(data, data.mmcif, 'mmcifid', undefined, undefined);
              ic.mmcifParserCls.loadMmcifOpmDataPart2(data, pdbid);

              if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
          }
          else if(type === 'pdb') {
              ic.pdbParserCls.loadPdbData(data, pdbid);

              if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
          }
          else if(type === 'align') {
              if(ic.bOpm) {
                  ic.alignParserCls.downloadAlignmentPart2(pdbid);
                  if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
              }
              else {
                  if(pdbid2 !== undefined) {
                      this.loadOpmData(data, pdbid2, bFull, type);
                  }
                  else {
                      ic.alignParserCls.downloadAlignmentPart2(pdbid);
                      if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                  }
              }
          }
    }
}

export {OpmParser}
