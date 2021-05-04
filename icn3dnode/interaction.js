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

let utils = require('./utils.js');

let myArgs = process.argv.slice(2);
if(myArgs.length != 4) {
    console.log("Usage: node interaction.js [PDB ID] [Chain ID] [Residue number] [One letter mutant]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let chain = myArgs[1];
let resi = myArgs[2];
let mutant = myArgs[3];

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

      // find PDB in 10 angstrom around the SNP
      let chainid = pdbid + '_' + chain + '_' + resi;
      if(!ic.residues.hasOwnProperty(chainid)) {
          console.error("Error: This residue " + chainid + " has no 3D coordinates...");
          return;
      }

      let pdbStr = getPdbStr(ic, pdbid, chain, resi);

      if(mutant == '-') { // deletion
        let pdbData = pdbStr;
        console.log("free energy (kcal/mol): deletion");

        let bAddition = true;

        // all atoms, including the mutant
        ic.loadPDBCls.loadPDB(pdbData, pdbid, false, false, bAddition);

        let type = 'save1';

        let resid = pdbid + '_' + chain + '_' + resi;

        let atomSet2 = ic.residues[resid];
        let atomSet = me.hashUtilsCls.exclHash(ic.atoms, atomSet2);

        // prepare names for two sets
        let command2 = resid;
        let residArray2 = [resid];
        ic.selectionCls.addCustomSelection(residArray2, command2, command2, 'select ' + command2, true);
        let nameArray2 = [command2];

        var residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomSet);
        let command = 'other';
        let residArray = Object.keys(residueHash);
        ic.selectionCls.addCustomSelection(residArray, command, command, 'select ' + command, true);
        let nameArray = [command];

        let result = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
              true, true, true, true, true, true);
        let bondCntWild = result.bondCnt;

        console.log("Change Hbond: " + (- bondCntWild[0].cntHbond).toString());
        console.log("Change Ionic: " + (- bondCntWild[0].cntIonic).toString());
        console.log("Change Contact: " + (- bondCntWild[0].cntContact).toString());
        console.log("Change Halegen: " + (- bondCntWild[0].cntHalegen).toString());
        console.log("Change Pi-Cation: " + (- bondCntWild[0].cntPication).toString());
        console.log("Change Pi-Stacking: " + (- bondCntWild[0].cntPistacking).toString());
      }
      else {
          let snpStr = chain + ',' + resi + ',' + mutant;
          let dataObj = {'pdb': pdbStr, 'snp': snpStr, 'pdbid': pdbid, 'json': 1};

          //https://attacomsian.com/blog/node-http-post-request
          // 'https' didn't work for posting PDB data, use 'application/x-www-form-urlencoded'
          const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

          axios.post('https://www.ncbi.nlm.nih.gov/Structure/scap/scap.cgi', qs.stringify(dataObj), config)
          .then(function(res) {
              //console.log(`Status: ${res.status}`);
              //console.log('Body: ', res.data);
              let mutantPDB = res.data.data.replace(/\\n/g, '\n');

              showInteractionChange(ic, mutantPDB, pdbid, chain, resi);
          })
          .catch(function(err) {
              utils.dumpError(err);
          });
      }
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});

function getPdbStr(ic, pdbid, chain, resi) {
    let atoms = ic.atoms;
    let residues = ic.residues;

    // find neighboring residues
    let resid = pdbid + '_' + chain + '_' + resi;

    let radius = 10;

    let bGetPairs = false;
    let bSphereCalc = true;
    let bInteraction = false;
    let type = 'view';
    let result = ic.showInterCls.pickCustomSphere_base(radius, residues[resid], atoms, bSphereCalc, bInteraction, type, 'select zone', bGetPairs);
    let residueArray = Object.keys(result.residues);

    let hAtoms = {};
    for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
      let residTmp = residueArray[index];
      for(let i in residues[residTmp]) {
        hAtoms[i] = 1;
      }
    }

    hAtoms = me.hashUtilsCls.unionHash(hAtoms, residues[resid]);

    let pdbStr = ic.saveFileCls.getPDBHeader() + ic.saveFileCls.getAtomPDB(hAtoms);

    return pdbStr;
}

function showInteractionChange(ic, data, pdbid, chain, resi) {
    let pos = data.indexOf('\n');
    let energy = data.substr(0, pos);
    let pdbData = data.substr(pos + 1);
    console.log("free energy (kcal/mol): " + energy);

    let bAddition = true;

    // all atoms, including the mutant
    ic.loadPDBCls.loadPDB(pdbData, pdbid, false, false, bAddition);

    let type = 'save1';

    let resid = pdbid + '_' + chain + '_' + resi, residMutant = pdbid + '2_' + chain + '_' + resi;

    let mutantSet = {};
    let chainidArray = ic.structures[pdbid + '2'];
    for(let i = 0, il = chainidArray.length; i < il; ++i) {
        mutantSet = me.hashUtilsCls.unionHash(mutantSet, ic.chains[chainidArray[i]]);
    }

    let atomSet2 = ic.residues[resid];
    let tmpSet = me.hashUtilsCls.exclHash(ic.atoms, mutantSet);
    // only for interaction in different chain
    let atomSet = me.hashUtilsCls.exclHash(tmpSet, atomSet2);

    // prepare names for two sets
    let command2 = resid;
    let residArray2 = [resid];
    ic.selectionCls.addCustomSelection(residArray2, command2, command2, 'select ' + command2, true);
    let nameArray2 = [command2];

    var residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomSet);
    let command = 'other-wild';
    let residArray = Object.keys(residueHash);
    ic.selectionCls.addCustomSelection(residArray, command, command, 'select ' + command, true);
    let nameArray = [command];

    let result = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
              true, true, true, true, true, true);
    let bondCntWild = result.bondCnt;

    let atomSetMutant2 = ic.residues[residMutant];
    // only for interaction in different chain
    let atomSetMutant = me.hashUtilsCls.exclHash(mutantSet, atomSetMutant2);

    // prepare names for two sets
    command2 = residMutant;
    residArray2 = [residMutant];
    ic.selectionCls.addCustomSelection(residArray2, command2, command2, 'select ' + command2, true);
    nameArray2 = [command2];

    residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomSetMutant);
    command = 'other-mutant';
    residArray = Object.keys(residueHash);
    ic.selectionCls.addCustomSelection(residArray, command, command, 'select ' + command, true);
    nameArray = [command];

    let resultMutant = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
              true, true, true, true, true, true);
    let bondCntMutant = resultMutant.bondCnt;

    console.log("Change Hbond: " + (bondCntMutant[0].cntHbond - bondCntWild[0].cntHbond).toString());
    console.log("Change Ionic: " + (bondCntMutant[0].cntIonic - bondCntWild[0].cntIonic).toString());
    console.log("Change Contact: " + (bondCntMutant[0].cntContact - bondCntWild[0].cntContact).toString());
    console.log("Change Halegen: " + (bondCntMutant[0].cntHalegen - bondCntWild[0].cntHalegen).toString());
    console.log("Change Pi-Cation: " + (bondCntMutant[0].cntPication - bondCntWild[0].cntPication).toString());
    console.log("Change Pi-Stacking: " + (bondCntMutant[0].cntPistacking - bondCntWild[0].cntPistacking).toString());
}
