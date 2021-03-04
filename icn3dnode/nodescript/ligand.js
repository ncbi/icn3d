// usage: node ligand.js 5R7Y JFM

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
let loadPdb = require('../share/loadPdb.js');
//let getPdbStr = require('../share/getPdbStr.js');
let pickCustomSphere = require('../share/pickCustomSphere.js');

let axios = require('../share/node_modules/axios');
let qs = require('../share/node_modules/querystring');

let myArgs = process.argv.slice(2);
if(myArgs.length != 2) {
    console.log("Usage: node epitope.js [PDB ID] [three-letter ligand name]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let ligName = myArgs[1];

let baseUrlMmdb = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&complexity=2&uid=";
let urlMmdb = baseUrlMmdb + pdbid;

let urlPdb = "https://files.rcsb.org/view/" + pdbid + ".pdb";

getLigandInteractio(urlMmdb, pdbid, ligName);

function getLigandInteractio(url, pdbid, ligName, bPdb) {
    https.get(url, function(res1) {
        let response1 = [];
        res1.on('data', function (chunk) {
            response1.push(chunk);
        });

        res1.on('end', function(){
          let dataStr1 = response1.join('');
          //console.log("dataStr1: " + JSON.stringify(dataStr1));

          // get atoms
          let objAll;
          if(bPdb) {
              objAll = loadPdb.loadPdb(dataStr1, pdbid);
          }
          else {
              objAll = loadMmdb.loadMmdb(dataStr1, pdbid);
          }
          //console.log("objAll: " + JSON.stringify(objAll));

          // find the interacting residues
          let atomHash = {};
          for(let resid in objAll.residues) {
              if(objAll.residueId2Name[resid] == ligName) {
                  atomHash = utils.unionHash(atomHash, objAll.residues[resid]);
              }
          }

          if(Object.keys(atomHash).length == 0) {
              console.error("Error: This ligand " + ligName + " is not found...");

              if(!bPdb) getLigandInteractio(urlPdb, pdbid, ligName, true);

              return;
          }

            let bGetPairs = false;
            let bInteraction = false;
            let radius = 4;

            let resids2inter = {}, resids2interAll = {};

            //{"residHash": residHash, "resid2Residhash": ic.resid2Residhash};
            let result = pickCustomSphere.pickCustomSphere(objAll.atoms, objAll.residues, radius, atomHash, objAll.atoms, bInteraction, bGetPairs, undefined, resids2inter, resids2interAll);

            let residueArray = Object.keys(result.residHash);
            // get the interacting residues for each residue
            let targetTypeId = 8; // drug candidate
            for(let i = 0, il = residueArray.length; i < il; ++i) {
                let resid = residueArray[i];
                //let idArray = resid.split('_');
                let resi = resid.substr(resid.lastIndexOf('_') + 1);
                let resn = objAll.residueId2Name[resid];
                let chainid = resid.substr(0, resid.lastIndexOf('_'));
                let chain = chainid.substr(chainid.indexOf('_') + 1);

                if(chain != 'Misc') console.log(pdbid + ", " + pdbid + "_" + chain + ", " + resi + ", " +  resn + ", " + getProteinName(objAll, chainid) + ", " + ligName + ", " + targetTypeId);
            }
        });
    }).on('error', function(e) {
        console.error("Error: " + pdbid + " has no MMDB data...");
    });
}

function getProteinName(objAll, chnid) {
    let fullProteinName = '';

    let moleculeInfor = objAll.moleculeInfor;
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
