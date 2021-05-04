// usage: node epitope.js 7BWJ E L

/*
Please install the following packages in your directory with the file interaction.js
npm install three
npm install jquery
npm install icn3d

npm install axios
npm install querystring
*/

// https://github.com/Jam3/three-buffer-vertex-data/issues/2
global.THREE = require('three');
let jsdom = require('jsdom');
global.$ = require('jquery')(new jsdom.JSDOM().window);

let icn3d = require('icn3d');
let me = new icn3d.iCn3DUI({});

let https = require('https');
let axios = require('axios');
let qs = require('querystring');

let utils = require('./utils.js');

let myArgs = process.argv.slice(2);
if(myArgs.length != 3) {
    console.log("Usage: node epitope.js [PDB ID] [master chain ID] [binding partner chain ID]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let chainidM = pdbid + '_' + myArgs[1];
let chainidB = pdbid + '_' + myArgs[2];

let baseUrlMmdb = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&complexity=2&uid=";
let urlMmdb = baseUrlMmdb + pdbid;

https.get(urlMmdb, function(res1) {
    let response1 = [];
    res1.on('data', function (chunk) {
        response1.push(chunk);
    });

    res1.on('end', function(){
      let dataStr1 = response1.join('');
      let dataJson = JSON.parse(dataStr1);

      me.setIcn3d();
      let ic = me.icn3d;

      ic.bRender = false;
      ic.mmdbParserCls.parseMmdbData(dataJson);

      // find the interacting residues
      if(!ic.chains.hasOwnProperty(chainidM)) {
          console.error("Error: This chain " + chainidM + " has no 3D coordinates...");
          return;
      }

      if(!ic.chains.hasOwnProperty(chainidB)) {
          console.error("Error: This chain " + chainidB + " has no 3D coordinates...");
          return;
      }

      let radius = 4;
      const bResult = getEpitopes(me, radius, dataJson);

      if(!bResult) {
          // only limit to C-alpha atoms
          const atomHash = {};

          for(let serial in ic.atoms) {
              const atom = ic.atoms[serial];

              if( (atom.name === 'CA' && atom.elem === 'C') || atom.name === "P") {
                  atomHash[serial] = atom;
              }
          }

          ic.atoms = atomHash;

          // check the C-alpha interactions within 8 angstrom
          radius = 8;
          getEpitopes(me, radius, dataJson);
      }

    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});

function getEpitopes(me, radius, dataJson) {
    let ic = me.icn3d;

    let atomlistTarget, otherAtoms;
    // could be ligands
    atomlistTarget = ic.definedSetsCls.getAtomsFromNameArray([chainidB]);
    otherAtoms = ic.definedSetsCls.getAtomsFromNameArray([chainidM]);
    let bGetPairs = false;
    let bSphereCalc = true;
    let bInteraction = false;
    let type = 'view';
    let result = ic.showInterCls.pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, 'select zone', bGetPairs);
    let residueArray = Object.keys(result.residues);

    let bFound = false;
    // get the interacting residues for each residue
    for(let i = 0, il = residueArray.length; i < il; ++i) {
        let resid = residueArray[i];
        //let idArray = resid.split('_');
        let resi = resid.substr(resid.lastIndexOf('_') + 1);
        let resn = ic.residueId2Name[resid];
        let chainid = resid.substr(0, resid.lastIndexOf('_'));
        let chain = chainid.substr(chainid.indexOf('_') + 1);

        // exclude the same chain
        let atomHash = me.hashUtilsCls.exclHash(ic.atoms, ic.chains[chainid]);

        //{"residHash": residHash, "resid2Residhash": ic.resid2Residhash};
        let result2 = ic.showInterCls.pickCustomSphere_base(radius, ic.residues[resid], atomHash, bSphereCalc, bInteraction, type, 'select zone', bGetPairs);

        let residueArray2 = Object.keys(result2.residues);
        for(let j = 0, jl = residueArray2.length; j < jl; ++j) {
          let resid2 = residueArray2[j];
          //let idArray2 = resid2.split('_');
          let resi2 = resid2.substr(resid2.lastIndexOf('_') + 1);
          let resn2 = ic.residueId2Name[resid2];
          let chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
          let chain2 = chainid2.substr(chainid2.indexOf('_') + 1);

          if(chain2 != 'Misc') {
              console.log(pdbid + ", " + pdbid + "_" + chain + ", " + resi + ", " + resn + ", " + getProteinName(dataJson, chainid) + ", " + pdbid +  "_" + chain2 + ", " + resi2 + ", " + resn2 + ", " + getProteinName(dataJson, chainid2));
              bFound = true;
          }
        }
    }

    return bFound;
}

function getProteinName(dataJson, chnid) {
    let fullProteinName = '';

    let moleculeInfor = dataJson.moleculeInfor;
    let chain = chnid.substr(chnid.indexOf('_') + 1);
    for(let i in moleculeInfor) {
        if(moleculeInfor[i].chain == chain) {
            let proteinName = moleculeInfor[i].name.replace(/\'/g, '&prime;');
            fullProteinName = proteinName.replace(/,/g, ';');
            break;
        }
    }

    return fullProteinName;
}
