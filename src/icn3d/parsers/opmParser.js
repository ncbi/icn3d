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

    downloadOpm(opmid) { var ic = this.icn3d, me = ic.icn3dui;
       var url, dataType;

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

    addOneDumAtom(pdbid, atomName, x, y, z, lastSerial) { var ic = this.icn3d, me = ic.icn3dui;
      var resn = 'DUM';
      var chain = 'MEM';
      var resi = 1;
      var coord = new THREE.Vector3(x, y, z);

      var atomDetails = {
          het: true, // optional, used to determine chemicals, water, ions, etc
          serial: ++lastSerial,         // required, unique atom id
          name: atomName,             // required, atom name
          alt: undefined,               // optional, some alternative coordinates
          resn: resn,             // optional, used to determine protein or nucleotide
          structure: pdbid,   // optional, used to identify structure
          chain: chain,           // optional, used to identify chain
          resi: resi,             // optional, used to identify residue ID
          coord: coord,           // required, used to draw 3D shape
          b: undefined, // optional, used to draw B-factor tube
          elem: atomName,             // optional, used to determine hydrogen bond
          bonds: [],              // required, used to connect atoms
          ss: '',             // optional, used to show secondary structures
          ssbegin: false,         // optional, used to show the beginning of secondary structures
          ssend: false,            // optional, used to show the end of secondary structures
          color: me.parasCls.atomColors[atomName]
      }
      ic.atoms[lastSerial] = atomDetails;

      ic.chains[pdbid + '_MEM'][lastSerial] = 1;
      ic.residues[pdbid + '_MEM_1'][lastSerial] = 1;

      ic.chemicals[lastSerial] = 1;

      ic.dAtoms[lastSerial] = 1;
      ic.hAtoms[lastSerial] = 1;

      return lastSerial;
    }

    addMemAtoms(dmem, pdbid, dxymax) { var ic = this.icn3d, me = ic.icn3dui;
      var npoint=40; // points in radius
      var step = 2;
      var maxpnt=2*npoint+1; // points in diameter
      var fn=step*npoint; // center point

      //var dxymax = npoint / 2.0 * step;

      pdbid =(pdbid) ? pdbid.toUpperCase() : 'stru';

      ic.structures[pdbid].push(pdbid + '_MEM');
      ic.chains[pdbid + '_MEM'] = {}
      ic.residues[pdbid + '_MEM_1'] = {}

      ic.chainsSeq[pdbid + '_MEM'] = [{'name':'DUM', 'resi': 1}];

      var m=0;
      var lastSerial = Object.keys(ic.atoms).length;
      for(var i = 0; i < 1000; ++i) {
          if(!ic.atoms.hasOwnProperty(lastSerial + i)) {
              lastSerial = lastSerial + i - 1;
              break;
          }
      }

      for(var i=0; i < maxpnt; ++i) {
         for(var j=0; j < maxpnt; ++j) {
            ++m;
            var a=step*i-fn;
            var b=step*j-fn;
            var dxy=Math.sqrt(a*a+b*b);
            if(dxy < dxymax) {
                  var c=-dmem-0.4;
                  // Resn: DUM, name: N, a,b,c
                  lastSerial = this.addOneDumAtom(pdbid, 'N', a, b, c, lastSerial);

                  c=dmem+0.4;
                  // Resn: DUM, name: O, a,b,c
                  lastSerial = this.addOneDumAtom(pdbid, 'O', a, b, c, lastSerial);
            }
         }
      }
    }

    loadOpmData(data, pdbid, bFull, type, pdbid2) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;
        var url, dataType;

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

    setOpmData(data) { var ic = this.icn3d, me = ic.icn3dui;
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

    parseAtomData(data, pdbid, bFull, type, pdbid2) { var ic = this.icn3d, me = ic.icn3dui;
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
