/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {SaveFile} from '../export/saveFile.js';

class SdfParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the PubChem "cid". This function was
    //deferred so that it can be chained together with other deferred functions for sequential execution.
    downloadCid(cid) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        let  uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/record/SDF/?record_type=3d&response_type=display";

        ic.ParserUtilsCls.setYourNote('PubChem CID ' + cid + ' in iCn3D');

        ic.bCid = true;

        $.ajax({
          url: uri,
          dataType: 'text',
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
            let  bResult = thisClass.loadSdfAtomData(data, cid);

//            ic.opts['pk'] = 'atom';
//            ic.opts['chemicals'] = 'ball and stick';

            if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
                $("#" + ic.pre + "alternateWrapper").hide();
            }

            if(!bResult) {
              alert('The SDF of CID ' + cid + ' has the wrong format...');
            }
            else {
              ic.setStyleCls.setAtomStyleByOptions(ic.opts);
              ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

              ic.ParserUtilsCls.renderStructure();

              if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

              //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
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
        })
        .fail(function() {
            alert( "This CID may not have 3D structure..." );
        });
    }

    loadSdfData(data) { let  ic = this.icn3d, me = ic.icn3dui;
        let  bResult = this.loadSdfAtomData(data);

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The SDF file has the wrong format...');
        }
        else {
          ic.setStyleCls.setAtomStyleByOptions(ic.opts);
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

          ic.ParserUtilsCls.renderStructure();

          if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

          //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
        }
    }

    //Atom "data" from SDF file was parsed to set up parameters for the 3D viewer.
    //The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    loadSdfAtomData(data, cid) { let  ic = this.icn3d, me = ic.icn3dui;
        let  lines = data.split(/\r?\n|\r/);
        if(lines.length < 4) return false;

        ic.init();

        let  structure = cid ? cid : 1;
        let  chain = 'A';
        let  resi = 1;
        let  resn = 'LIG';

        let  moleculeNum = structure;
        let  chainNum = structure + '_' + chain;
        let  residueNum = chainNum + '_' + resi;

        let  atomCount = parseInt(lines[3].substr(0, 3));
        if(isNaN(atomCount) || atomCount <= 0) return false;

        let  bondCount = parseInt(lines[3].substr(3, 3));
        let  offset = 4;
        if(lines.length < offset + atomCount + bondCount) return false;

        let  start = 0;
        let  end = atomCount;
        let  i, line;

        let  atomid2serial = {}
        let  HAtomids = {}

        let  AtomHash = {}
        let  serial = 1;
        for(i = start; i < end; i++) {
            line = lines[offset];
            offset++;

            //var name = line.substr(31, 3).replace(/ /g, "");
            let  name = line.substr(31, 3).trim();

            //if(name !== 'H') {
                let  x = parseFloat(line.substr(0, 10));
                let  y = parseFloat(line.substr(10, 10));
                let  z = parseFloat(line.substr(20, 10));
                let  coord = new THREE.Vector3(x, y, z);

                let  atomDetails = {
                    het: true,              // optional, used to determine chemicals, water, ions, etc
                    serial: serial,         // required, unique atom id
                    name: name,             // required, atom name
                    resn: resn,             // optional, used to determine protein or nucleotide
                    structure: structure,   // optional, used to identify structure
                    chain: chain,           // optional, used to identify chain
                    resi: resi,             // optional, used to identify residue ID
                    coord: coord,           // required, used to draw 3D shape
                    b: 0,                   // optional, used to draw B-factor tube
                    elem: name,             // optional, used to determine hydrogen bond
                    bonds: [],              // required, used to connect atoms
                    ss: 'coil',             // optional, used to show secondary structures
                    ssbegin: false,         // optional, used to show the beginning of secondary structures
                    ssend: false,           // optional, used to show the end of secondary structures

                    bondOrder: []           // optional, specific for chemicals
                }

                ic.atoms[serial] = atomDetails;
                AtomHash[serial] = 1;

                atomid2serial[i] = serial;

                ++serial;
            //}
            //else {
                if(name == 'H') HAtomids[i] = 1;
            //}
        }

        ic.dAtoms = AtomHash;
        ic.hAtoms= AtomHash;
        ic.structures[moleculeNum] = [chainNum]; //AtomHash;
        ic.chains[chainNum] = AtomHash;
        ic.residues[residueNum] = AtomHash;

        ic.residueId2Name[residueNum] = resn;

        if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

        let  resObject = {}
        resObject.resi = resi;
        resObject.name = resn;

        ic.chainsSeq[chainNum].push(resObject);

        for(i = 0; i < bondCount; i++) {
            line = lines[offset];
            offset++;
            let  fromAtomid = parseInt(line.substr(0, 3)) - 1 + start;
            let  toAtomid = parseInt(line.substr(3, 3)) - 1 + start;
            //var order = parseInt(line.substr(6, 3));
            let  order = line.substr(6, 3).trim();

            //if(!HAtomids.hasOwnProperty(fromAtomid) && !HAtomids.hasOwnProperty(toAtomid)) {
                let  from = atomid2serial[fromAtomid];
                let  to = atomid2serial[toAtomid];

                ic.atoms[from].bonds.push(to);
                ic.atoms[from].bondOrder.push(order);
                ic.atoms[to].bonds.push(from);
                ic.atoms[to].bondOrder.push(order);

                if(!HAtomids.hasOwnProperty(fromAtomid) && !HAtomids.hasOwnProperty(toAtomid)) {
                    if(order == '2') {
                        ic.doublebonds[from + '_' + to] = 1;
                        ic.doublebonds[to + '_' + from] = 1;
                    }
                    else if(order == '3') {
                        ic.triplebonds[from + '_' + to] = 1;
                        ic.triplebonds[to + '_' + from] = 1;
                    }
                }
        }

        // read partial charge
        let  bCrg = false;
        for(let il = lines.length; offset < il; ++offset) {
            if(lines[offset].indexOf('PARTIAL_CHARGES') != -1) {
                bCrg = true;
                break;
            }
            else {
                continue;
            }
        }

        if(bCrg) {
            ++offset;
            let  crgCnt = parseInt(lines[offset]);

            ++offset;
            for(i = 0; i < crgCnt; ++i, ++offset) {
                line = lines[offset];
                let  serial_charge = line.split(' ');
                let  sTmp = parseInt(serial_charge[0]);
                let  crg = parseFloat(serial_charge[1]);
                ic.atoms[sTmp].crg = crg;
            }
        }

        // backup bonds
        for(i in ic.atoms) {
            if(ic.atoms[i].name !== 'H') { // only need to deal with non-hydrogen atoms
                ic.atoms[i].bonds2 = ic.atoms[i].bonds.concat();
                ic.atoms[i].bondOrder2 = ic.atoms[i].bondOrder.concat();
            }
        }

        ic.ParserUtilsCls.setMaxD();

        ic.saveFileCls.showTitle();

        return true;
    }
}

export {SdfParser}
