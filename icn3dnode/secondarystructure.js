// Include the interaction in the same chain
// usage: node interaction.js 1TOP A 10 V

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

let fs = require('fs/promises');

//let utils = require('./utils.js');

let myArgs = process.argv.slice(2);
if(myArgs.length != 1) {
    console.log("Usage: node secondarystructure.js [filename]");
    return;
}

let filename = (myArgs[0].indexOf('/') == -1) ? './' + myArgs[0] : myArgs[0];

async function outputSS() {
  try {
    const data = await fs.readFile(filename, { encoding: 'utf8' });
    //console.log(data);
    me.setIcn3d();
    let ic = me.icn3d;
    ic.bRender = false;

    await ic.pdbParserCls.loadPdbData(data);
    
    const pdb = me.htmlCls.setHtmlCls.exportPdb();
    
    const ss = me.htmlCls.setHtmlCls.exportSecondary();

    console.log(ss);
  } catch (err) {
    console.log(err);
  }
}


outputSS();