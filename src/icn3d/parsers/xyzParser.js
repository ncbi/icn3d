/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {SaveFile} from '../export/saveFile.js';

class XyzParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    loadXyzData(data) { let  ic = this.icn3d, me = ic.icn3dui;
        let  bResult = this.loadXyzAtomData(data);

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The XYZ file has the wrong format...');
        }
        else {
          ic.setStyleCls.setAtomStyleByOptions(ic.opts);
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

          ic.ParserUtilsCls.renderStructure();

          if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

          //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
        }
    }

    setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, AtomHash);
        ic.hAtoms= me.hashUtilsCls.unionHash(ic.hAtoms, AtomHash);

        ic.structures[moleculeNum] = [chainNum]; //AtomHash;
        ic.chains[chainNum] = AtomHash;
        ic.residues[residueNum] = AtomHash;

        ic.residueId2Name[residueNum] = 'LIG';

        if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

        let  resObject = {}
        resObject.resi = 1;
        resObject.name = 'LIG';

        ic.chainsSeq[chainNum].push(resObject);

        // determine bonds
        let  serialArray = Object.keys(AtomHash);
        for(let j = 0, jl = serialArray.length; j < jl; ++j) {
            let  atom0 = ic.atoms[serialArray[j]];

            for(let k = j + 1, kl = serialArray.length; k < kl; ++k) {
                let  atom1 = ic.atoms[serialArray[k]];
                let  maxR = 1.2 *(me.parasCls.covalentRadii[atom0.elem.toUpperCase()] + me.parasCls.covalentRadii[atom1.elem.toUpperCase()]);
                if(Math.abs(atom0.coord.x - atom1.coord.x) > maxR) continue;
                if(Math.abs(atom0.coord.y - atom1.coord.y) > maxR) continue;
                if(Math.abs(atom0.coord.z - atom1.coord.z) > maxR) continue;

                if(me.utilsCls.hasCovalentBond(atom0, atom1)) {
                    ic.atoms[serialArray[j]].bonds.push(serialArray[k]);
                    ic.atoms[serialArray[k]].bonds.push(serialArray[j]);
                }
            }
        }
    }

    loadXyzAtomData(data) { let  ic = this.icn3d, me = ic.icn3dui;
        let  lines = data.split(/\r?\n|\r/);
        if(lines.length < 3) return false;

        ic.init();

        let  chain = 'A';
        let  resn = 'LIG';
        let  resi = 1;

        let  AtomHash = {}
        let  moleculeNum = 0, chainNum, residueNum;
        let  structure, atomCount, serial=1, offset = 2;

        ic.molTitle = "";

        for(let i = 0, il = lines.length; i < il; ++i) {
            let  line = lines[i].trim();
            if(line === '') continue;

            if(line !== '' && !isNaN(line)) { // start a new molecule
                if(i !== 0) {
                    this.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);
                }

                ++moleculeNum;
                AtomHash = {}

                structure = moleculeNum;
                chainNum = structure + '_' + chain;
                residueNum = chainNum + '_' + resi;

    //12
    //glucose from 2gbp
    //C  35.884  30.895  49.120

                atomCount = parseInt(line);
                if(moleculeNum > 1) {
                    ic.molTitle += "; ";
                }
                ic.molTitle += lines[i+1].trim();

                i = i + offset;
            }

            line = lines[i].trim();
            if(line === '') continue;

            let  name_x_y_z = line.replace(/,/, " ").replace(/\s+/g, " ").split(" ");

            let  name = name_x_y_z[0];
            let  x = parseFloat(name_x_y_z[1]);
            let  y = parseFloat(name_x_y_z[2]);
            let  z = parseFloat(name_x_y_z[3]);
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

            ++serial;
        }

        this.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);

        ic.ParserUtilsCls.setMaxD();

        ic.saveFileCls.showTitle();

        return true;
    }
}

export {XyzParser}
