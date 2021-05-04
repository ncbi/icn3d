// usage: node ligand.js 5R7Y JFM

/*
Please install the following three packages in your directory with the file interaction.js
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
if(myArgs.length != 2) {
    console.log("Usage: node ligand.js [PDB ID] [three-letter ligand name]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let ligName = myArgs[1];

let baseUrlMmdb = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&complexity=2&uid=";
let urlMmdb = baseUrlMmdb + pdbid;

getLigandInteractio(urlMmdb, pdbid, ligName);

function getLigandInteractio(url, pdbid, ligName) {
    https.get(url, function(res1) {
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
          let atomHash = {};
          for(let resid in ic.residues) {
              if(ic.residueId2Name[resid] == ligName) {
                  atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[resid]);
              }
          }

          if(Object.keys(atomHash).length == 0) {
              console.error("Error: This ligand " + ligName + " is not found...");
              return;
          }

          let radius = 4;

          let bGetPairs = false;
          let bSphereCalc = true;
          let bInteraction = false;
          let type = 'view';
          let result = ic.showInterCls.pickCustomSphere_base(radius, atomHash, ic.atoms, bSphereCalc, bInteraction, type, 'select zone', bGetPairs);
          let residueArray = Object.keys(result.residues);

          // get the interacting residues for each residue
          let targetTypeId = 8; // drug candidate
          for(let i = 0, il = residueArray.length; i < il; ++i) {
              let resid = residueArray[i];
              //let idArray = resid.split('_');
              let resi = resid.substr(resid.lastIndexOf('_') + 1);
              let resn = ic.residueId2Name[resid];
              let chainid = resid.substr(0, resid.lastIndexOf('_'));
              let chain = chainid.substr(chainid.indexOf('_') + 1);

              if(chain != 'Misc') console.log(pdbid + ", " + pdbid + "_" + chain + ", " + resi + ", " +  resn + ", " + getProteinName(dataJson, chainid) + ", " + ligName + ", " + targetTypeId);
          }
        });
    }).on('error', function(e) {
        console.error("Error: " + pdbid + " has no MMDB data...");
    });
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