// https://www.geeksforgeeks.org/how-to-share-code-between-node-js-and-the-browser/
// https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports) {
//  'use strict';

let THREE = require('three');
let utils = require('./utils.js');

let loadMmdb = function (dataStr, pdbid) {
    let data = JSON.parse(dataStr);
    pdbid = pdbid.toUpperCase();

    let residues = {};
    let chemicals = {};
    let calphas = {};
    let chains = {};
    let structures = {};
    let nucleotides = {};
    let residueId2Name = {};
    let moleculeInfor = {};

    let bUsePdbNum = true;

    let molid2rescount = data.moleculeInfor;
    let molid2chain = {};
    let chainid2offset = {};

    let chainNameHash = {}, chainid2kind = {};
    for(let i in molid2rescount) {
      if(Object.keys(molid2rescount[i]).length === 0) continue;

      let chainName = (molid2rescount[i].chain === undefined) ? '' : molid2rescount[i].chain.trim();
      if(chainNameHash[chainName] === undefined) {
          chainNameHash[chainName] = 1;
      }
      else {
          ++chainNameHash[chainName];
      }

      let chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
      let chainid = pdbid + '_' + chainNameFinal;

      var kind = molid2rescount[i].kind;
      chainid2kind[chainid] = kind;

      molid2chain[i] = chainid;
    }

    let atoms = data.atoms;

    let CSerial, prevCSerial, OSerial, prevOSerial;
    let prevResi, prevChainid;

    //let lastResid = '';
    let serial = 1;
    for(let i in atoms) {
        let atm = atoms[i];

        atm.resn = atm.resn.substr(0, 3).trim();

        if(atm.chain === undefined) {
              molid = atm.ids.m;

              if(molid2chain[molid] !== undefined) {
                  let pos = molid2chain[molid].indexOf('_');
                  atm.chain = molid2chain[molid].substr(pos + 1);
              }
              else {
                  atm.chain = 'Misc';
              }
        }
        else {
          atm.chain = (atm.chain === '') ? 'Misc' : atm.chain;
        }

        atm.chain = atm.chain.trim();

        let chainid = pdbid + '_' + atm.chain;

        atm.resi_ori = parseInt(atm.resi); // original PDB residue number, has to be integer
        if(!bUsePdbNum) {
            atm.resi = atm.ids.r; // corrected for residue insertion code
        }
        else {
            // make MMDB residue number consistent with PDB residue number
            atm.resi = atm.resi_ori; // corrected for residue insertion code
            if(!chainid2offset[chainid]) chainid2offset[chainid] = atm.resi_ori - atm.ids.r;
        }

        let resid = chainid + '_' + atm.resi;
        if(residues[resid] === undefined) residues[resid] = {};
        residues[resid][serial] = 1;

        atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
        atm.serial = serial;
        atm.structure = pdbid;

        if(atm.resi !== prevResi) {
            if(chainid !== prevChainid) {
                prevCSerial = undefined;
                prevOSerial = undefined;
            }
            else {
                prevCSerial = CSerial;
                prevOSerial = OSerial;
            }
        }

        if(!atm.het && atm.name === 'C') {
            CSerial = serial;
        }
        if(!atm.het && atm.name === 'O') {
            OSerial = serial;
        }

        // from DSSP C++ code
        if(!atm.het && atm.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
            var dist = atoms[prevCSerial].coord.distanceTo(atoms[prevOSerial].coord);

            var x2 = atm.coord.x + (atoms[prevCSerial].coord.x - atoms[prevOSerial].coord.x) / dist;
            var y2 = atm.coord.y + (atoms[prevCSerial].coord.y - atoms[prevOSerial].coord.y) / dist;
            var z2 = atm.coord.z + (atoms[prevCSerial].coord.z - atoms[prevOSerial].coord.z) / dist;

            atm.hcoord = new THREE.Vector3(x2, y2, z2);
        }

        //if(lastResid == resid) continue; // e.g., Alt A and B

        if(!atm.het && (atm.name == "CA" || atm.name == "O3'" || atm.name == "O3*")) {
            //lastResid = resid;
            calphas[serial] = 1;
        }

        if(atm.het) chemicals[serial] = 1;
        if(chainid2kind[chainid] == 'nucleotide') nucleotides[serial] = 1;

        if(!chains.hasOwnProperty(chainid)) chains[chainid] = {};
        chains[chainid][serial] = 1;

        let oneLetterRes = utils.residueName2Abbr(atm.resn.substr(0, 3));
        residueId2Name[resid] = oneLetterRes;

        prevResi = atm.resi;
        prevChainid = chainid;

        ++serial;
    }

    structures[pdbid] = Object.keys(chains);

    return {"atoms": atoms, "residues": residues, "chemicals": chemicals, "calphas": calphas, "pdbid": pdbid, "structures": structures, "chains": chains, "nucleotides": nucleotides, "residueId2Name": residueId2Name, "moleculeInfor": data.moleculeInfor};
}

exports.loadMmdb = loadMmdb;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
