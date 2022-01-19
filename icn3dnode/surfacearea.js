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

//let utils = require('./utils.js');

let myArgs = process.argv.slice(2);
if(myArgs.length != 2) {
    console.log("Usage: node surfacearea.js [PDB ID] [comma-separated Chain IDs]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let chainArray = myArgs[1].split(',');

let baseUrlMmdb = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&buidx=0&complexity=2&uid=";

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

      // select chains
      ic.hAtoms = {};
      for(let i = 0, il = chainArray.length; i < il; ++i) {
          let chainid = pdbid + '_' + chainArray[i];
          ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[chainid]);
      }

      // calculate surface area
      ic.analysisCls.calculateArea();

      ic.drawCls.draw();

      console.log("Solvent accessible surface area: (angstrom square)");
      for(var resid in ic.resid2area) {
          console.log("resid: " + resid + ' area: ' + ic.resid2area[resid]);
      }
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});
