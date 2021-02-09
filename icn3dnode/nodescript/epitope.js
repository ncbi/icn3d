// usage: node epitope.js 7BWJ E L

/*
Please install the following three packages in your directory with the file interaction.js
npm install axios
npm install querystring
npm install three
*/

let THREE = require('../share/node_modules/three');

let http = require('http');
let https = require('https');
let utils = require('../share/utils.js');
let para = require('../share/para.js');
let loadMmdb = require('../share/loadMmdb.js');
//let loadPdb = require('../share/loadPdb.js');
//let getPdbStr = require('../share/getPdbStr.js');
let pickCustomSphere = require('../share/pickCustomSphere.js');

let axios = require('../share/node_modules/axios');
let qs = require('../share/node_modules/querystring');

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
      //console.log("dataStr1: " + JSON.stringify(dataStr1));

      // get atoms
      let objAll = loadMmdb.loadMmdb(dataStr1, pdbid);
      //console.log("objAll: " + JSON.stringify(objAll));

      // find the interacting residues
      if(!objAll.chains.hasOwnProperty(chainidM)) {
          console.error("Error: This chain " + chainidM + " has no 3D coordinates...");
          return;
      }

      if(!objAll.chains.hasOwnProperty(chainidB)) {
          console.error("Error: This chain " + chainidB + " has no 3D coordinates...");
          return;
      }

        let bGetPairs = false;
        let bInteraction = false;
        let radius = 4;

        let resids2inter = {}, resids2interAll = {};

        //{"residHash": residHash, "resid2Residhash": ic.resid2Residhash};
        let result = pickCustomSphere.pickCustomSphere(objAll.atoms, objAll.residues, radius, objAll.chains[chainidB], objAll.chains[chainidM], bInteraction, bGetPairs, undefined, resids2inter, resids2interAll);

        let residueArray = Object.keys(result.residHash);
        // get the interacting residues for each residue
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            let resid = residueArray[i];
            //let idArray = resid.split('_');
            let resi = resid.substr(resid.lastIndexOf('_') + 1);
            let resn = objAll.residueId2Name[resid];
            let chainid = resid.substr(0, resid.lastIndexOf('_'));
            let chain = chainid.substr(chainid.indexOf('_') + 1);

            resids2inter = {};
            resids2interAll = {};

            // exclude the same chain
            let atomHash = utils.exclHash(objAll.atoms, objAll.chains[chainid]);

            //{"residHash": residHash, "resid2Residhash": ic.resid2Residhash};
            let result2 = pickCustomSphere.pickCustomSphere(objAll.atoms, objAll.residues, radius, objAll.residues[resid], atomHash, bInteraction, bGetPairs, undefined, resids2inter, resids2interAll);

            let residueArray2 = Object.keys(result2.residHash);
            for(let j = 0, jl = residueArray2.length; j < jl; ++j) {
              let resid2 = residueArray2[j];
              //let idArray2 = resid2.split('_');
              let resi2 = resid2.substr(resid2.lastIndexOf('_') + 1);
              let resn2 = objAll.residueId2Name[resid2];
              let chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
              let chain2 = chainid2.substr(chainid2.indexOf('_') + 1);

              if(chain2 != 'Misc') console.log(pdbid + ", Chain " + chain + " " + resi + resn + ", " + getProteinName(objAll, chainid) + ", " + "Chain " + chain2 + " " + resi2 + resn2 + ", " + getProteinName(objAll, chainid2));
            }
        }
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});

function getProteinName(objAll, chnid) {
    let fullProteinName = '';

    let moleculeInfor = objAll.moleculeInfor;
    let chain = chnid.substr(chnid.indexOf('_') + 1);
    for(let i in moleculeInfor) {
        if(moleculeInfor[i].chain == chain) {
            fullProteinName = moleculeInfor[i].name.replace(/\'/g, '&prime;');
            let proteinName = fullProteinName;
            //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
            break;
        }
    }

    return fullProteinName;
}
