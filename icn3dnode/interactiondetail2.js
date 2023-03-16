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
if(myArgs.length != 3) {
    console.log("Usage: node interactiondetail.js [PDB file name] [Chain 1] [Chain 2]");
    return;
}

let filename = (myArgs[0].indexOf('/') == -1) ? './' + myArgs[0] : myArgs[0];
let chain1 = myArgs[1];
let chain2 = myArgs[2];

async function getInteraction() {
    try {
        const data = await fs.readFile(filename, { encoding: 'utf8' });
        //console.log(data);
        me.setIcn3d();
        let ic = me.icn3d;
        ic.bRender = false;

        await ic.pdbParserCls.loadPdbData(data);

        let pdbid = Object.keys(ic.structures)[0];

        // find PDB in 10 angstrom around the SNP
        let chainid1 = pdbid + '_' + chain1;
        let chainid2 = pdbid + '_' + chain2;
        if(!ic.chains.hasOwnProperty(chainid1) || !ic.chains.hasOwnProperty(chainid2)) {
            console.error("Error: The chain " + chainid1 + " or " + chainid2 + " does not exit...");
            return;
        }

        // prepare names for two sets
        let residueHash1 = ic.firstAtomObjCls.getResiduesFromAtoms(ic.chains[chainid1]);
        let command1 = chainid1;
        let residArray1 = Object.keys(residueHash1);
        ic.selectionCls.addCustomSelection(residArray1, command1, command1, 'select ' + command1, true);
        let nameArray1 = [command1];

        let residueHash2 = ic.firstAtomObjCls.getResiduesFromAtoms(ic.chains[chainid2]);
        let command2 = chainid2;
        let residArray2 = Object.keys(residueHash2);
        ic.selectionCls.addCustomSelection(residArray2, command2, command2, 'select ' + command2, true);
        let nameArray2 = [command2];

        let type = 'save1';
        let result = await ic.viewInterPairsCls.viewInteractionPairs(nameArray1, nameArray2, false, type,
            true, true, true, true, true, true);

        console.log(result);
    } catch (err) {
        console.log(err);
    }
}

getInteraction();
