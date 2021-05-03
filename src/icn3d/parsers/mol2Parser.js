/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {SaveFile} from '../export/saveFile.js';

class Mol2Parser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    loadMol2Data(data) { var ic = this.icn3d, me = ic.icn3dui;
        var bResult = this.loadMol2AtomData(data);

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The Mol2 file has the wrong format...');
        }
        else {
          ic.setStyleCls.setAtomStyleByOptions(ic.opts);
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

          ic.ParserUtilsCls.renderStructure();

          if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

          //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
        }
    }

    loadMol2AtomData(data) { var ic = this.icn3d, me = ic.icn3dui;
        var lines = data.split(/\r?\n|\r/);
        if(lines.length < 4) return false;

        ic.init();

        var structure = 1;
        var chain = 'A';
        var resn = 'LIG';
        var resi = 1;

        var AtomHash = {}
        var moleculeNum = 1, chainNum = '1_A', residueNum = '1_A_1';
        var atomCount, bondCount, atomIndex = 0, bondIndex = 0;
        var serial=1;

        var bAtomSection = false, bBondSection = false;

        var atomid2serial = {}
        var skipAtomids = {}

        var prevBondType = '', contiArrBondCnt = 0;

        for(var i = 0, il = lines.length; i < il; ++i) {
            var line = lines[i].trim();
            if(line === '') continue;
            if(line.substr(0, 1) === '#') continue;

            if(line == '@<TRIPOS>MOLECULE') {
                ic.molTitle = lines[i + 1].trim();
                var atomCnt_bondCnt = lines[i + 2].trim().replace(/\s+/g, " ").split(" ");
                atomCount = atomCnt_bondCnt[0];
                bondCount = atomCnt_bondCnt[1];
                i = i + 4;
            }
            else if(line == '@<TRIPOS>ATOM') { // 1    C1    1.207    2.091    0.000    C.ar    1    BENZENE    0.000
                serial = 1;

                bAtomSection = true;

                ++i;
            }
            else if(line == '@<TRIPOS>BOND') { // 1    1    2    ar
                bBondSection = true;
                bAtomSection = false;

                ++i;
            }
            else if(line == '@<TRIPOS>SUBSTRUCTURE') { // 1    1    2    ar
                bBondSection = false;

                ++i;
            }

            line = lines[i].trim();
            if(line === '') continue;
            if(line.substr(0, 1) === '#') continue;

            if(bAtomSection && atomIndex < atomCount) {
                // 1    C1    1.207    2.091    0.000    C.ar    1    BENZENE    0.000
                var atomArray = line.replace(/\s+/g, " ").split(" ");

                var atomid = parseInt(atomArray[0]);
                atomid2serial[atomid] = serial;

                var name = atomArray[1];
                var x = parseFloat(atomArray[2]);
                var y = parseFloat(atomArray[3]);
                var z = parseFloat(atomArray[4]);
                var coord = new THREE.Vector3(x, y, z);

                var elemFull = atomArray[5];
                var pos = elemFull.indexOf('.');

                var elem;
                if(pos === -1) {
                    elem = elemFull;
                }
                else {
                    elem = elemFull.substr(0, pos);
                }

                // skip H, but keep H.spc, H.t3p, etc
                if(elem === 'H' && elem === elemFull) {
                    skipAtomids[atomid] = 1;
                }
                else {
                    var atomDetails = {
                        het: true,              // optional, used to determine chemicals, water, ions, etc
                        serial: serial,         // required, unique atom id
                        name: name,             // required, atom name
                        resn: resn,             // optional, used to determine protein or nucleotide
                        structure: structure,   // optional, used to identify structure
                        chain: chain,           // optional, used to identify chain
                        resi: resi,             // optional, used to identify residue ID
                        coord: coord,           // required, used to draw 3D shape
                        b: 0,                   // optional, used to draw B-factor tube
                        elem: elem,             // optional, used to determine hydrogen bond
                        bonds: [],              // required, used to connect atoms
                        ss: 'coil',             // optional, used to show secondary structures
                        ssbegin: false,         // optional, used to show the beginning of secondary structures
                        ssend: false,           // optional, used to show the end of secondary structures

                        bondOrder: []           // optional, specific for chemicals
                    }

                    ic.atoms[serial] = atomDetails;
                    AtomHash[serial] = 1;

                    ++serial;
                }

                ++atomIndex;
            }

            if(bBondSection && bondIndex < bondCount) {
                // 1    1    2    ar
                var bondArray = line.replace(/\s+/g, " ").split(" ");
                var fromAtomid = parseInt(bondArray[1]);
                var toAtomid = parseInt(bondArray[2]);
                var bondType = bondArray[3];
                var finalBondType = bondType;

                //• 1 = single • 2 = double • 3 = triple • am = amide • ar = aromatic • du = dummy • un = unknown(cannot be determined from the parameter tables) • nc = not connected
                if(bondType === 'am') {
                    finalBondType = '1';
                }

                if(bondType === 'ar') {
                    finalBondType = '1.5';
                }

                if(!skipAtomids.hasOwnProperty(fromAtomid) && !skipAtomids.hasOwnProperty(toAtomid) &&(finalBondType === '1' || finalBondType === '2' || finalBondType === '3' || finalBondType === '1.5') ) {
                    var order = finalBondType;
                    var from = atomid2serial[fromAtomid];
                    var to = atomid2serial[toAtomid];

                    // skip all bonds between H and C
                    //if( !(ic.atoms[from].elem === 'H' && ic.atoms[to].elem === 'C') && !(ic.atoms[from].elem === 'C' && ic.atoms[to].elem === 'H') ) {
                        ic.atoms[from].bonds.push(to);
                        ic.atoms[from].bondOrder.push(order);
                        ic.atoms[to].bonds.push(from);
                        ic.atoms[to].bondOrder.push(order);

                        if(order == '2') {
                            ic.doublebonds[from + '_' + to] = 1;
                            ic.doublebonds[to + '_' + from] = 1;
                        }
                        else if(order == '3') {
                            ic.triplebonds[from + '_' + to] = 1;
                            ic.triplebonds[to + '_' + from] = 1;
                        }
                        else if(order == '1.5') {
                            ic.aromaticbonds[from + '_' + to] = 1;
                            ic.aromaticbonds[to + '_' + from] = 1;
                        }
                    //}
                }

                ++bondIndex;
                prevBondType = bondType;
            }
        }

        ic.dAtoms = AtomHash;
        ic.hAtoms= AtomHash;
        ic.structures[moleculeNum] = [chainNum]; //AtomHash;
        ic.chains[chainNum] = AtomHash;
        ic.residues[residueNum] = AtomHash;

        ic.residueId2Name[residueNum] = resn;

        if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

        var resObject = {}
        resObject.resi = resi;
        resObject.name = resn;

        ic.chainsSeq[chainNum].push(resObject);

        ic.ParserUtilsCls.setMaxD();

        ic.saveFileCls.showTitle();

        return true;
    }
}

export {Mol2Parser}

