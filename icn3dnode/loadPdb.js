// https://www.geeksforgeeks.org/how-to-share-code-between-node-js-and-the-browser/
// https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports) {
//  'use strict';

let THREE = require('three');
let para = require('./para.js');

let loadPdb = function (src, pdbidInput, bAddition, objAll) {
    if(bAddition) pdbid = pdbidInput + '2';

    let residues = objAll.residues, chemicals = objAll.chemicals, calphas = objAll.calphas;

    let lines = src.split('\n');

    let atoms = {};
    let chains = {};

    let CSerial, prevCSerial, OSerial, prevOSerial;
    let prevResi, prevChainid;

    let serial = Object.keys(objAll.atoms).length + 1;
    for (let i in lines) {
        let line = lines[i];
        let record = line.substr(0, 6);

        if (record === 'ATOM  ' || record === 'HETATM') {
            let atomName = line.substr(12, 4).replace(/ /g, '');
            let resn = line.substr(17, 3).trim();

            if(resn === 'DUM') break;

            chain = line.substr(21, 1);
            if(chain === ' ') chain = 'A';

            let chainid = pdbid + '_' + chain;

            let oriResi = line.substr(22, 5).trim();
            let resi = parseInt(oriResi);

            let resid = pdbid + '_' + chain + "_" + resi;
            if(residues[resid] === undefined) residues[resid] = {};
            residues[resid][serial] = 1;

            let x = parseFloat(line.substr(30, 8));
            let y = parseFloat(line.substr(38, 8));
            let z = parseFloat(line.substr(46, 8));
            let coord = new THREE.Vector3(x, y, z);

            let alt = line.substr(16, 1);
            let elem = line.substr(76, 2).trim();
            if (elem === '') { // for some incorrect PDB files, important to use substr(12,2), not (12,4)
               elem = line.substr(12, 2).trim();
            }

            let atom = {
                het: record[0] === 'H', // optional, used to determine chemicals, water, ions, etc
                serial: serial,         // required, unique atom id
                name: atomName,         // required, atom name
                alt: alt,               // optional, some alternative coordinates
                resn: resn,             // optional, used to determine protein or nucleotide
                structure: pdbid,   // optional, used to identify structure
                chain: chain,           // optional, used to identify chain
                resi: resi,             // optional, used to identify residue ID
                //insc: line.substr(26, 1),
                coord: coord,           // required, used to draw 3D shape
                b: parseFloat(line.substr(60, 8)), // optional, used to draw B-factor tube
                elem: elem,             // optional, used to determine hydrogen bond
                bonds: [],              // required, used to connect atoms
                ss: 'coil',             // optional, used to show secondary structures
                ssbegin: false,         // optional, used to show the beginning of secondary structures
                ssend: false            // optional, used to show the end of secondary structures
            };

            if(atom.resi !== prevResi) {
                if(chainid !== prevChainid) {
                    prevCSerial = undefined;
                    prevOSerial = undefined;
                }
                else {
                    prevCSerial = CSerial;
                    prevOSerial = OSerial;
                }
            }

            if(!atom.het && atom.name === 'C') {
                CSerial = serial;
            }
            if(!atom.het && atom.name === 'O') {
                OSerial = serial;
            }

            // from DSSP C++ code
            if(!atom.het && atom.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
                let dist = objAll.atoms[prevCSerial].coord.distanceTo(objAll.atoms[prevOSerial].coord);

                let x2 = atom.coord.x + (objAll.atoms[prevCSerial].coord.x - objAll.atoms[prevOSerial].coord.x) / dist;
                let y2 = atom.coord.y + (objAll.atoms[prevCSerial].coord.y - objAll.atoms[prevOSerial].coord.y) / dist;
                let z2 = atom.coord.z + (objAll.atoms[prevCSerial].coord.z - objAll.atoms[prevOSerial].coord.z) / dist;

                atom.hcoord = new THREE.Vector3(x2, y2, z2);
            }

            objAll.atoms[serial] = atom;
            atoms[serial] = atom;

            if(atomName == "CA" || atomName == "O3'" || atomName == "O3*") {
                calphas[serial] = 1;
            }

            if(atom.het) chemicals[serial] = 1;

            if(!atom.het && para.nucleotidesArray.indexOf(line.substr(17, 3)) != -1) objAll.nucleotides[serial] = 1;

            if(!chains.hasOwnProperty(chainid)) chains[chainid] = {};
            chains[chainid][serial] = 1;

            if(!objAll.chains.hasOwnProperty(chainid)) objAll.chains[chainid] = {};
            objAll.chains[chainid][serial] = 1;

            prevResi = atom.resi;
            prevChainid = chainid;

            ++serial;
        }
    }

    objAll.structures[pdbid] = Object.keys(chains);

    let curChain, curResi, curInsc, curResAtoms = [];
    // refresh for atoms in each residue
    let refreshBonds = function (f) {
        let n = curResAtoms.length;
        for (let j = 0; j < n; ++j) {
            let atom0 = curResAtoms[j];
            for (let k = j + 1; k < n; ++k) {
                let atom1 = curResAtoms[k];
                if (atom0.alt === atom1.alt && hasCovalentBond(atom0, atom1)) {
                    atom0.bonds.push(atom1.serial);
                    atom1.bonds.push(atom0.serial);
                }
            }
            f && f(atom0);
        }
    };

    for (let i in atoms) {
        let atom = atoms[i];
        let coord = atom.coord;

        if (!(curChain === atom.chain && curResi === atom.resi)) {
            // a new residue, add the residue-residue bond beides the regular bonds
            refreshBonds(function (atom0) {
                if (((atom0.name === 'C' && atom.name === 'N') || (atom0.name === 'O3\'' && atom.name === 'P')) && hasCovalentBond(atom0, atom)) {
                    atom0.bonds.push(atom.serial);
                    atom.bonds.push(atom0.serial);
                }
            });
            curChain = atom.chain;
            curResi = atom.resi;
            curResAtoms.length = 0;
        }
        curResAtoms.push(atom);
    } // end of for

    // last residue
    refreshBonds();

//    return {"atoms": atoms, "residues": residues, "chemicals": chemicals, "calphas": calphas, "pdbid": pdbidInput, "structures": structures};
}

function hasCovalentBond(atom0, atom1) {
    let r = para.covalentRadii[atom0.elem.toUpperCase()] + para.covalentRadii[atom1.elem.toUpperCase()];
    return atom0.coord.distanceToSquared(atom1.coord) < 1.3 * r * r;
}

exports.loadPdb = loadPdb;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
