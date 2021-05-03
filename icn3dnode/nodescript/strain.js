// usage: node strain.js

/*
Please install the following three packages in your directory with the file interaction.js
npm install axios
npm install querystring
*/

//let THREE = require('../share/node_modules/three');

let http = require('http');
let https = require('https');
/*
let utils = require('../share/utils.js');
let para = require('../share/para.js');
let loadMmdb = require('../share/loadMmdb.js');
let loadPdb = require('../share/loadPdb.js');
//let getPdbStr = require('../share/getPdbStr.js');
let pickCustomSphere = require('../share/pickCustomSphere.js');
*/

let axios = require('../share/node_modules/axios');
let qs = require('../share/node_modules/querystring');

let myArgs = process.argv.slice(2);
if(myArgs.length != 0) {
    console.log("Usage: node strain.js");
    return;
}

let url = "http://intrawebdev2.be-md.ncbi.nlm.nih.gov:6224/staff/jinyu/gap/cgi-bin/covid/LineageDefMutationJson.cgi";

http.get(url, function(res1) {
    let response1 = [];
    res1.on('data', function (chunk) {
        response1.push(chunk);
    });

    res1.on('end', function(){
      let dataStr = response1.join('');
      let dataJson = JSON.parse(dataStr);
      //console.log("dataJson: " + dataJson.length);

      console.log(getStrainMutation(dataJson));
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no strain data...");
});

function getStrainMutation(data) {
    let output = '';

    //B.1.1.7|nsp3|A|890|D
    for(let i = 0, il = data.length; i < il; ++i) {
        let strain = data[i].id;
        if(data[i].sub_id) strain += '_' + data[i].sub_id;

        for(let j = 0, jl = data[i].change.length; j < jl; ++j) {
            let proteinName = data[i].change[j].protein_name;
            let snp = data[i].change[j].variation;

            if(!snp) continue;

            if(snp.indexOf('-') == -1 && isNaN(snp[0]) ) { // Not deletion nor insertion
                let residueName = snp.substr(0, 1);
                let mutation = snp.substr(snp.length - 1, 1);
                let residuePosition = snp.substr(1, snp.length - 2);

                if(isNaN(residuePosition)) {
                    console.log("i: " + i + " j: " + j + " residue position is not a number");
                    return "ERROR";
                }

                output += strain + '|' + proteinName + '|' + residueName + '|' + residuePosition + '|' + mutation + '\n';
            }
            else {
                let digitArray = [], wildTypeArray = [], mutationArray = [];
                let bWildType = true;
                for(let k = 0, kl = snp.length; k < kl; ++k) {
                    if(isNaN(snp[k])) {
                        if(bWildType) {
                            wildTypeArray.push(snp[k]);
                        }
                        else {
                            mutationArray.push(snp[k]);
                        }
                    }
                    else {
                        digitArray.push(snp[k]);
                        bWildType = false;
                    }
                }

                let firstResiduePosition = parseInt(digitArray.join(''));
                for(let k = 0, kl = wildTypeArray.length; k < kl; ++k) {
                    let residuePosition = firstResiduePosition + k;
                    output += strain + '|' + proteinName + '|' + wildTypeArray[k] + '|' + residuePosition + '|' + mutationArray[k] + '\n';
                }

                if(!isNaN(snp[0])) { // insertion
                    output += strain + '|' + proteinName + '|-|' + firstResiduePosition + '|' + mutationArray.join('') + '\n';
                }
            }
        }
    }

    return output;
}
