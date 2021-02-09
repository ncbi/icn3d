// Exclude the interaction in the same chain
// usage: node interaction2.js 6M0J E 501 Y

/*
Please install the following three packages in your directory with the file interaction.js
npm install axios
npm install querystring
npm install three
*/

let THREE = require('../share/node_modules/three');

let http = require('http');
let https = require('https');
//let fs = require('fs');
let utils = require('../share/utils.js');
let para = require('../share/para.js');
let loadMmdb = require('../share/loadMmdb.js');
let loadPdb = require('../share/loadPdb.js');
let getPdbStr = require('../share/getPdbStr.js');
let pickCustomSphere = require('../share/pickCustomSphere.js');

let axios = require('../share/node_modules/axios');
let qs = require('../share/node_modules/querystring');

let myArgs = process.argv.slice(2);
if(myArgs.length != 4) {
    console.log("Usage: node interaction2.js [PDB ID] [Chain ID] [Residue number] [One letter mutant]");
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
      //console.log("dataStr1: " + JSON.stringify(dataStr1));

      // get atoms
      let objAll = loadMmdb.loadMmdb(dataStr1, pdbid);
      //console.log("objAll: " + JSON.stringify(objAll));

      // find PDB in 10 angstrom around the SNP
      let chainid = pdbid + '_' + chain + '_' + resi;
      if(!objAll.residues.hasOwnProperty(chainid)) {
          console.error("Error: This residue " + chainid + " has no 3D coordinates...");
          return;
      }

      let pdbStr = getPdbStr.getPdbStr(objAll, pdbid, chain, resi);
      //console.log("pdbStr: " + pdbStr);

      if(mutant == '-') { // deletion
        let pdbData = pdbStr;
//        console.log("free energy (kcal/mol): deletion");

        let bAddition = true;

        // all atoms, including the mutant
        objAll = loadPdb.loadPdb(pdbData, pdbid, bAddition, objAll);
        //let pdbStr = getPdbStr.getPdbStr(objAll, pdbid, undefined, undefined, true);
        //console.log(pdbStr);

        let type = 'save1';

        let resid = pdbid + '_' + chain + '_' + resi;

        let atomSet1 = objAll.residues[resid];
        let atomSet2 = utils.exclHash(objAll.atoms, atomSet1);

        let bondCntWild = viewInteractionPairs(objAll, atomSet1, atomSet2, false, type, true, true, true, true, true, true);

    //    console.log(html);
/*
        console.log("Change Hbond: " + (- bondCntWild[0].cntHbond).toString());
        console.log("Change Ionic: " + (- bondCntWild[0].cntIonic).toString());
        console.log("Change Contact: " + (- bondCntWild[0].cntContact).toString());
        console.log("Change Halegen: " + (- bondCntWild[0].cntHalegen).toString());
        console.log("Change Pi-Cation: " + (- bondCntWild[0].cntPication).toString());
        console.log("Change Pi-Stacking: " + (- bondCntWild[0].cntPistacking).toString());
*/
        let resn = objAll.residueId2Name[resid];

        console.log(pdbid + ", " + chain + ", " + resi + ", " + resn + resi + mutant + ", " + (- bondCntWild[0].cntHbond).toString() + ", " + (- bondCntWild[0].cntIonic).toString() + ", " + (- bondCntWild[0].cntContact).toString() + ", " + (- bondCntWild[0].cntHalegen).toString() + ", " + (- bondCntWild[0].cntPication).toString() + ", " + (- bondCntWild[0].cntPistacking).toString());
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
              //console.log('mutantPDB: ', mutantPDB);

              showInteractionChange(mutantPDB, objAll, pdbid, chain, resi);
          })
          .catch(function(err) {
              //console.error("scap.cgi error..." + err);
              utils.dumpError(err);
          });
      }
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});

function showInteractionChange(data, objAll, pdbid, chain, resi) {
    let pos = data.indexOf('\n');
    let energy = data.substr(0, pos);
    let pdbData = data.substr(pos + 1);
//    console.log("free energy (kcal/mol): " + energy);

    let bAddition = true;

    // all atoms, including the mutant
    loadPdb.loadPdb(pdbData, pdbid, bAddition, objAll);
    //let pdbStr = getPdbStr.getPdbStr(objAll, pdbid, undefined, undefined, true);
    //console.log(pdbStr);

    let type = 'save1';

    let resid = pdbid + '_' + chain + '_' + resi, residMutant = pdbid + '2_' + chain + '_' + resi;

    let mutantSet = {};
    let chainidArray = objAll.structures[pdbid + '2'];
    for(let i = 0, il = chainidArray.length; i < il; ++i) {
        mutantSet = utils.unionHash(mutantSet, objAll.chains[chainidArray[i]]);
    }

    let atomSet1 = objAll.residues[resid];
    let tmpSet = utils.exclHash(objAll.atoms, mutantSet);
    //let atomSet2 = utils.exclHash(tmpSet, atomSet1);
    // only for interaction in different chain
    let atomSet2 = utils.exclHash(tmpSet, objAll.chains[pdbid + '_' + chain]);

    let bondCntWild = viewInteractionPairs(objAll, atomSet1, atomSet2, false, type, true, true, true, true, true, true);

    let atomSet1Mutant = objAll.residues[residMutant];
    //let atomSet2Mutant = utils.exclHash(mutantSet, atomSet1Mutant);
    // only for interaction in different chain
    let atomSet2Mutant = utils.exclHash(mutantSet, objAll.chains[pdbid + '2_' + chain]);

    let bondCntMutant = viewInteractionPairs(objAll, atomSet1Mutant, atomSet2Mutant, false, type, true, true, true, true, true, true);

//    console.log(html);
/*
    console.log("Change Hbond: " + (bondCntMutant[0].cntHbond - bondCntWild[0].cntHbond).toString());
    console.log("Change Ionic: " + (bondCntMutant[0].cntIonic - bondCntWild[0].cntIonic).toString());
    console.log("Change Contact: " + (bondCntMutant[0].cntContact - bondCntWild[0].cntContact).toString());
    console.log("Change Halegen: " + (bondCntMutant[0].cntHalegen - bondCntWild[0].cntHalegen).toString());
    console.log("Change Pi-Cation: " + (bondCntMutant[0].cntPication - bondCntWild[0].cntPication).toString());
    console.log("Change Pi-Stacking: " + (bondCntMutant[0].cntPistacking - bondCntWild[0].cntPistacking).toString());
*/

    let resn = objAll.residueId2Name[resid];

    console.log(pdbid + ", " + chain + ", " + resi + ", " + resn + resi + mutant + ", " + (bondCntMutant[0].cntHbond - bondCntWild[0].cntHbond).toString() + ", " + (bondCntMutant[0].cntIonic - bondCntWild[0].cntIonic).toString() + ", " + (bondCntMutant[0].cntContact - bondCntWild[0].cntContact).toString() + ", " + (bondCntMutant[0].cntHalegen - bondCntWild[0].cntHalegen).toString() + ", " + (bondCntMutant[0].cntPication - bondCntWild[0].cntPication).toString() + ", " + (bondCntMutant[0].cntPistacking - bondCntWild[0].cntPistacking).toString());
}

function viewInteractionPairs(objAll, atomSet1, atomSet2, bHbondCalc, type,
  bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking) {
    let atoms = objAll.atoms;
    let residues = objAll.residues;
    let chemicals = objAll.chemicals;
    let calphas = objAll.calphas;
    let pdbid = objAll.pdbid;
    let structures = objAll.structures;

    let resids2inter = {};
    let resids2interAll = {};

   // type: view, save, forcegraph
//   ic.bRender = false;
//   let hAtoms = {};
//   let prevHatoms = ic.cloneHash(ic.hAtoms);
//     let atomSet1 = me.getAtomsFromNameArray(nameArray2);
//     let atomSet2 = me.getAtomsFromNameArray(nameArray);

  let tsHbond = 3.8;
  let tsIonic = 6;
  let tsContact = 4;
  let tsHalogen = 3.8;
  let tsPication = 6;
  let tsPistacking = 5.5;

  let nameArray2 = ['selected'];
  let nameArray = ['non-selected'];
  let pre = 'div0_';


/*
   let labelType; // residue, chain, structure
   let cntChain = 0, cntStructure = 0;
   for(let structure in ic.structures) {
       let bStructure = false;
       for(let i = 0, il = ic.structures[structure].length; i < il; ++i) {
           let chainid = ic.structures[structure][i];
           for(let serial in ic.chains[chainid]) {
               if(atomSet1.hasOwnProperty(serial) || atomSet2.hasOwnProperty(serial)) {
                   ++cntChain;
                   bStructure = true;
                   break;
               }
           }
       }
       ++cntStructure;
   }
   if(cntStructure > 1) labelType = 'structure';
   else if(cntChain > 1) labelType = 'chain';
   else labelType = 'residue';
*/

   let labelType = 'structure';

   // fixed order of interaction type
   let interactionTypes = [];
   if(bHbond) {
       interactionTypes.push('hbonds');
   }
   if(bSaltbridge) {
       interactionTypes.push('salt bridge');
   }
   if(bInteraction) {
       interactionTypes.push('interactions');
   }
   if(bHalogen) {
       interactionTypes.push('halogen');
   }
   if(bPication) {
       interactionTypes.push('pi-cation');
   }
   if(bPistacking) {
       interactionTypes.push('pi-stacking');
   }
   if(!bHbondCalc) {
       resids2inter = {};
       resids2interAll = {};
   }

   let resid2ResidhashHbond, resid2ResidhashSaltbridge, resid2ResidhashHalogen, resid2ResidhashPication, resid2ResidhashPistacking, resid2ResidhashInter;
   if(bSaltbridge) {
       let threshold = tsIonic; //parseFloat($("#" + pre + "saltbridgethreshold" ).val());
       if(!bHbondCalc) {
           //ic.hAtoms = ic.cloneHash(prevHatoms);
           resid2ResidhashHbond = showIonicInteractions(objAll, threshold, atomSet1, atomSet2, bHbondCalc, true, type, resids2inter, resids2interAll);
       }
       //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
   }

   if(bHbond) {
       let threshold = tsHbond; //parseFloat($("#" + pre + "hbondthreshold" ).val());
       if(!bHbondCalc) {
           //ic.hAtoms = ic.cloneHash(prevHatoms);
           resid2ResidhashSaltbridge = showHbonds(objAll, threshold, atomSet1, atomSet2, bHbondCalc, undefined, type, resids2inter, resids2interAll);
       }
       //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
   }
   // switch display order, show hydrogen first
   let tableHtml = '';
   if(bHbond) {
       tableHtml += exportHbondPairs(objAll, type, labelType, resid2ResidhashHbond, resids2inter, resids2interAll);
   }
   if(bSaltbridge) {
       tableHtml += exportSaltbridgePairs(objAll, type, labelType, resid2ResidhashSaltbridge);
   }
   if(bHalogen) {
       let threshold = tsHalogen; //parseFloat($("#" + pre + "halogenthreshold" ).val());
       if(!bHbondCalc) {
           //ic.hAtoms = ic.cloneHash(prevHatoms);
           resid2ResidhashHalogen = showHalogenPi(objAll, threshold, atomSet1, atomSet2, bHbondCalc, type, 'halogen', resids2inter, resids2interAll);
       }
       //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       tableHtml += exportHalogenPiPairs(objAll, type, labelType, 'halogen', resid2ResidhashHalogen);
   }
   if(bPication) {
       let threshold = tsPication; //parseFloat($("#" + pre + "picationthreshold" ).val());
       if(!bHbondCalc) {
           //ic.hAtoms = ic.cloneHash(prevHatoms);
           resid2ResidhashPication = showHalogenPi(objAll, threshold, atomSet1, atomSet2, bHbondCalc, type, 'pi-cation', resids2inter, resids2interAll);
       }
       //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       tableHtml += exportHalogenPiPairs(objAll, type, labelType, 'pi-cation', resid2ResidhashPication);
   }
   if(bPistacking) {
       let threshold = tsPistacking; //parseFloat($("#" + pre + "pistackingthreshold" ).val());
       if(!bHbondCalc) {
           //ic.hAtoms = ic.cloneHash(prevHatoms);
           resid2ResidhashPistacking = showHalogenPi(objAll, threshold, atomSet1, atomSet2, bHbondCalc, type, 'pi-stacking', resids2inter, resids2interAll);
       }
       //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
       let tmp = exportHalogenPiPairs(objAll, type, labelType, 'pi-stacking', resid2ResidhashPistacking);
       tableHtml += tmp;
   }

   if(bInteraction) {
       let threshold = tsContact; //parseFloat($("#" + pre + "contactthreshold" ).val());
       if(!(nameArray2.length == 1 && nameArray.length == 1 && nameArray2[0] == nameArray[0])) {
            if(!bHbondCalc) {
                //ic.hAtoms = ic.cloneHash(prevHatoms);
                resid2ResidhashInter = pickCustomSphereAll(objAll, threshold, atomSet1, atomSet2, bHbondCalc, true, type, resids2inter, resids2interAll);
            }
            //hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
            tableHtml += exportSpherePairs(objAll, true, type, labelType, resid2ResidhashInter);
       }
       else { // contact in a set, atomSet1 same as atomSet2
            let resid2ResidhashInteractions = {};

            if(!bHbondCalc) {
                let ssAtomsArray = [];
                let prevSS = '', prevChain = '';
                let ssAtoms = {};
                for(let i in atomSet1) {
                    let atom = objAll.atoms[i];
                    if(atom.ss != prevSS || atom.chain != prevChain) {
                        if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                        ssAtoms = {};
                    }
                    ssAtoms[atom.serial] = 1;
                    prevSS = atom.ss;
                    prevChain = atom.chain;
                }
                // last ss
                if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
                let len = ssAtomsArray.length;
                let interStr = '';
                //select = "interactions " + threshold + " | sets " + nameArray2 + " " + nameArray + " | true";
//                ic.opts['contact'] = "yes";
                let residues = {};

                for(let i = 0; i < len; ++i) {
                    for(let j = i + 1; j < len; ++j) {
//                        ic.hAtoms = ic.cloneHash(prevHatoms);
                        let result = pickCustomSphere.pickCustomSphere(objAll.atoms, objAll.residues, threshold, ssAtomsArray[i], ssAtomsArray[j], true, true, resids2inter, resids2interAll);

                        residues = utils.unionHash(residues, result.residHash);
                        for(let resid in result.resid2Residhash) {
                            resid2ResidhashInteractions[resid] = utils.unionHash(resid2ResidhashInteractions[resid], result.resid2Residhash[resid]);
                        }
                    }
                }
//                me.resid2ResidhashInteractions = resid2ResidhashInteractions;


            }
            tableHtml += exportSpherePairs(objAll, true, type, labelType, resid2ResidhashInteractions);
       } // same set
   }

/*
                let residueArray = Object.keys(residues);
                ic.hAtoms = {};
                for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
                  let residueid = residueArray[index];
                  for(let i in ic.residues[residueid]) {
                    ic.hAtoms[i] = 1;
                  }
                }
                // do not change the set of displaying atoms
                //ic.dAtoms = ic.cloneHash(ic.atoms);
                let commandname, commanddesc;
                let firstAtom = utils.getFirstAtomObj(objAll.atoms, residues);
                if(firstAtom !== undefined) {
                    commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
                    if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + pre + "contactthreshold").val() + "A";
                    commanddesc = commandname;
                    me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
                }
                me.saveSelectionIfSelected();
                ic.draw();
            }
//            hAtoms = ic.unionHash(hAtoms, ic.hAtoms);
            tableHtml += me.exportSpherePairs(objAll, true, type, labelType, resid2ResidhashInteractions);
       } // same set
   }
//   ic.hAtoms = ic.cloneHash(hAtoms);
//   ic.bRender = true;
//   ic.draw();

   let residHash, select, commandname, commanddesc;
   residHash = getResiduesFromAtoms(objAll, hAtoms);
   select = "select " + residueids2spec(objAll, Object.keys(residHash));
   commandname = 'interface_all';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
   let interface1 = atomSet1; //utils.intHash(hAtoms, atomSet1);
   residHash = getResiduesFromAtoms(objAll, interface1);
   select = "select " + residueids2spec(objAll, Object.keys(residHash));
   commandname = 'interface_1';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
   let interface2 = ic.intHash(hAtoms, atomSet2);
   residHash = getResiduesFromAtoms(objAll, interface2);
   select = "select " + residueids2spec(objAll, Object.keys(residHash));
   commandname = 'interface_2';
   commanddesc = commandname;
   me.addCustomSelection(Object.keys(residHash), commandname, commanddesc, select, true);
*/

   let interface1 = atomSet1; //utils.intHash(hAtoms, atomSet1);
   let interface2 = atomSet2; //ic.intHash(hAtoms, atomSet2);

   let html = '<div style="text-align:center"><b>' + interactionTypes.join(', ') + ' between Two Sets:</b><br>';

   let residueArray1 = atoms2residues(objAll, Object.keys(atomSet1));
   let residueArray2 = atoms2residues(objAll, Object.keys(atomSet2));
   let cmd1 = 'select ' + residueids2spec(objAll, residueArray1);
   let cmd2 = 'select ' + residueids2spec(objAll, residueArray2);
   html += 'Set 1: ' + nameArray2 + ' <button class="' + pre + 'selset" cmd="' + cmd1 + '">Highlight in 3D</button><br>';
   html += 'Set 2: ' + nameArray + ' <button class="' + pre + 'selset" cmd="' + cmd2 + '">Highlight in 3D</button><br><br></div>';
   html += '<div style="text-align:center"><b>The interfaces are:</b><br>';
   let residueArray3 = atoms2residues(objAll, Object.keys(interface1));
   let residueArray4 = atoms2residues(objAll, Object.keys(interface2));
   let cmd3 = 'select ' + residueids2spec(objAll, residueArray3);
   let cmd4 = 'select ' + residueids2spec(objAll, residueArray4);
   html += 'interface_1 <button class="' + pre + 'selset" cmd="' + cmd3 + '">Highlight in 3D</button><br>';
   html += 'interface_2 <button class="' + pre + 'selset" cmd="' + cmd4 + '">Highlight in 3D</button><br><br></div>';
   html += '<div><b>Note</b>: Each checkbox below selects the corresponding residue. '
     + 'You can click "Save Selection" in the "Select" menu to save the selection '
     + 'and click on "Highlight" button to clear the checkboxes.</div><br>';
   let header = html;
   if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') html = '';
   html += tableHtml;

   let bondCnt;

   if(type == 'save1' || type == 'save2') {
       html = header;
       let tmpText = '';
       if(type == 'save1') {
           tmpText = 'Set 1';
       }
       else if(type == 'save2') {
           tmpText = 'Set 2';
       }
       html += '<div style="text-align:center"><br><b>Interactions Sorted on ' + tmpText + '</b>: <button class="' + pre + 'showintercntonly" style="margin-left:20px">Show Count Only</button><button class="' + pre + 'showinterdetails" style="margin-left:20px">Show Details</button></div>';

//       html += getAllInteractionTable(objAll, type, resids2inter, resids2interAll);
       bondCnt = getAllInteractionTable(objAll, type, resids2inter, resids2interAll);

//       $("#" + pre + "dl_interactionsorted").html(html);
//       me.openDlg('dl_interactionsorted', 'Show sorted interactions');
   }

/*
   else if(type == 'view') {
       $("#" + pre + "dl_allinteraction").html(html);
       me.openDlg('dl_allinteraction', 'Show interactions');
   }
   else if(type == 'linegraph') {
       me.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
       let bLine = true;
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bLinegraph = true;
       // draw SVG
       let svgHtml = me.drawLineGraph(me.graphStr);
       $("#" + pre + "linegraphDiv").html(svgHtml);
   }
   else if(type == 'scatterplot') {
       me.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
       let bLine = true;
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bScatterplot = true;
       // draw SVG
       let svgHtml = me.drawLineGraph(me.graphStr, true);
       $("#" + pre + "scatterplotDiv").html(svgHtml);
   }
   else if(type == 'graph') {
       // atomSet1 and atomSet2 are in the right order here
       me.graphStr = me.getGraphData(atomSet1, atomSet2, nameArray2, nameArray, html, labelType);
       me.bGraph = true;
       // show only displayed set in 2D graph
       if(Object.keys(atomSet2).length + Object.keys(atomSet1).length > Object.keys(ic.dAtoms).length) {
           me.graphStr = me.getGraphDataForDisplayed();
       }
       if(me.bD3 === undefined) {
           let url = "https://d3js.org/d3.v4.min.js";
           $.ajax({
              url: url,
              dataType: "script",
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                   let url2 = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/script/graph_d3v4.min.js";
                   $.ajax({
                      url: url2,
                      dataType: "script",
                      cache: true,
                      tryCount : 0,
                      retryLimit : 1,
                      success: function(data2) {
                           me.bD3 = true;
                           $("#" + me.svgid).empty();
                           me.openDlg('dl_graph', 'Force-directed graph');
                           me.drawGraph(me.graphStr, pre + 'dl_graph');
                           if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                      },
                      error : function(xhr, textStatus, errorThrown ) {
                        this.tryCount++;
                        if (this.tryCount <= this.retryLimit) {
                            //try again
                            $.ajax(this);
                            return;
                        }
                        if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                        return;
                      }
                   });
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                if(me.deferredGraphinteraction !== undefined) me.deferredGraphinteraction.resolve();
                return;
              }
           });
       }
       else {
           $("#" + me.svgid).empty();
           me.openDlg('dl_graph', 'Force-directed graph');
           me.drawGraph(me.graphStr, pre + 'dl_graph');
       }
   }
*/

//   return interactionTypes.toString();
//   return html;

   return bondCnt;
}

function showHbonds(objAll, threshold, atomSet1, atomSet2, bHbondCalc, bSaltbridge, type, resids2inter, resids2interAll) {
    if(bHbondCalc) return;
    let hbonds_saltbridge, select;
    if(bSaltbridge) {
        hbonds_saltbridge = 'saltbridge';
        //select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
    }
    else {
        hbonds_saltbridge = 'hbonds';
        //select = 'hbonds ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
    }
    //ic.opts[hbonds_saltbridge] = "yes";
    //ic.opts["water"] = "dot";
    let firstSetAtoms, complement;
    firstSetAtoms = atomSet1; //me.getAtomsFromNameArray(nameArray2);
    complement = atomSet2; //me.getAtomsFromNameArray(nameArray);
    let firstAtom = utils.getFirstAtomObj(objAll.atoms, firstSetAtoms);
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        let hbondResult = calculateChemicalHbonds(objAll, complement, firstSetAtoms, parseFloat(threshold), bSaltbridge, undefined, undefined, resids2inter, resids2interAll );

        return hbondResult.resid2Residhash;
/*
        let selectedAtoms = hbondResult.atoms;
        let commanddesc;
        if(bSaltbridge) {
            let resid2ResidhashSaltbridge = hbondResult.resid2Residhash;
            commanddesc = 'all atoms that have salt bridges with the selected atoms';
        }
        else {
            let resid2ResidhashHbond = hbondResult.resid2Residhash;
            commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
        }
        let residues = {}, atomArray = undefined;
        for (let i in selectedAtoms) {
            let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueid] = 1;
        }

        ic.hAtoms = {};
        for(let resid in residues) {
            for(let i in ic.residues[resid]) {
                ic.hAtoms[i] = 1;
                ic.atoms[i].style2 = 'stick';
                //ic.atoms[i].style2 = 'lines';
            }
        }
        let commandname = hbonds_saltbridge + '_' + firstAtom.serial;
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        let nameArray = [commandname];
        me.saveSelectionIfSelected();
        ic.draw();
*/
    }

    return;
}

function showIonicInteractions(objAll, threshold, atomSet1, atomSet2, bHbondCalc, bSaltbridge, type, resids2inter, resids2interAll) {
    if(bHbondCalc) return;
    let hbonds_saltbridge, select;
    hbonds_saltbridge = 'saltbridge';
//    select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
//    ic.opts[hbonds_saltbridge] = "yes";
    let firstSetAtoms, complement;
    firstSetAtoms = atomSet1; //me.getAtomsFromNameArray(nameArray2);
    complement = atomSet2; //me.getAtomsFromNameArray(nameArray);
    let firstAtom = utils.getFirstAtomObj(objAll.atoms, firstSetAtoms);

    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        let saltbridgeResult = calculateIonicInteractions(objAll, complement, firstSetAtoms, parseFloat(threshold), bSaltbridge, undefined, undefined, resids2inter, resids2interAll );

        return saltbridgeResult.resid2Residhash;
    }
/*
        let selectedAtoms = saltbridgeResult.atoms;
        let commanddesc;
        resid2ResidhashSaltbridge = ic.cloneHash(ic.resid2Residhash);
        commanddesc = 'all atoms that have ionic interactions with the selected atoms';
        let residues = {}, atomArray = undefined;
        for (let i in selectedAtoms) {
            let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueid] = 1;
        }
        ic.hAtoms = {};
        for(let resid in residues) {
            for(let i in ic.residues[resid]) {
                ic.hAtoms[i] = 1;
                ic.atoms[i].style2 = 'stick';
                if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                //ic.atoms[i].style2 = 'lines';
            }
        }
        let commandname = hbonds_saltbridge + '_' + firstAtom.serial;
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        let nameArray = [commandname];
        me.saveSelectionIfSelected();
        ic.draw();
    }
*/

    return;
}

function showHalogenPi(objAll, threshold, atomSet1, atomSet2, bHbondCalc, type, interactionType, resids2inter, resids2interAll) {
    if(bHbondCalc) return;
    let select; // = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
//    ic.opts[interactionType] = "yes";
    let firstSetAtoms, complement;
    firstSetAtoms = atomSet1; //me.getAtomsFromNameArray(nameArray2);
    complement = atomSet2; //me.getAtomsFromNameArray(nameArray);
    let firstAtom = utils.getFirstAtomObj(objAll.atoms, firstSetAtoms);
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        let result = calculateHalogenPiInteractions(objAll, firstSetAtoms, complement, parseFloat(threshold), type, interactionType, undefined, resids2inter, resids2interAll );
        let selectedAtoms = result.atoms;

        return result.resid2Residhash;

/*
        let commanddesc;
        if(interactionType == 'halogen') {
            resid2ResidhashHalogen = utils.cloneHash(result.resid2Residhash);
            commanddesc = 'all atoms that have halogen bonds with the selected atoms';
        }
        else if(interactionType == 'pi-cation') {
            resid2ResidhashPication = utils.cloneHash(result.resid2Residhash);
            commanddesc = 'all atoms that have pi-cation interactions with the selected atoms';
        }
        else if(interactionType == 'pi-stacking') {
            resid2ResidhashPistacking = utils.cloneHash(result.resid2Residhash);
            commanddesc = 'all atoms that have pi-stacking with the selected atoms';
        }
        let residues = {}, atomArray = undefined;
        for (let i in selectedAtoms) {
            let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueid] = 1;
        }

        ic.hAtoms = {};
        for(let resid in residues) {
            for(let i in ic.residues[resid]) {
                ic.hAtoms[i] = 1;
                ic.atoms[i].style2 = 'stick';
                if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                //ic.atoms[i].style2 = 'lines';
            }
        }
        let commandname = interactionType + '_' + firstAtom.serial;
        me.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
        let nameArray = [commandname];
        me.saveSelectionIfSelected();
        ic.draw();
*/
    }
}

function pickCustomSphereAll(objAll, radius, atomSet1, atomSet2, bSphereCalc, bInteraction, type, resids2inter, resids2interAll) {    // ic.pAtom is set already
    if(bSphereCalc) return;
    let select; // = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
    if(bInteraction) {
//        select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
//        ic.opts['contact'] = "yes";
    }
    let atomlistTarget, otherAtoms;
    // could be ligands
    atomlistTarget = atomSet1; //me.getAtomsFromNameArray(nameArray2);
    otherAtoms = atomSet2; //me.getAtomsFromNameArray(nameArray);
    let bGetPairs = true;
    let result = pickCustomSphere.pickCustomSphere(objAll.atoms, objAll.residues, radius, atomlistTarget, otherAtoms, bInteraction, bGetPairs, resids2inter, resids2interAll);

    return result.resid2Residhash;

/*
    let residueArray = Object.keys(result.residues);

    ic.hAtoms = {};
    for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
      let residueid = residueArray[index];
      for(let i in ic.residues[residueid]) {
        ic.hAtoms[i] = 1;
      }
    }

    // do not change the set of displaying atoms
    //ic.dAtoms = ic.cloneHash(ic.atoms);
    let commandname, commanddesc;
    let firstAtom = utils.getFirstAtomObj(objAll.atoms, atomlistTarget);
    if(firstAtom !== undefined) {
        commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
        if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + pre + "contactthreshold").val() + "A";
        commanddesc = commandname;
        me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
    }
    me.saveSelectionIfSelected();
    ic.draw();
*/
}

function exportHbondPairs(objAll, type, labelType, resid2ResidhashHbond) {
    let pre = 'div0_';
    let tmpText = '';
    let cnt = 0;
    let colorText1 = ' <span style="background-color:#';
    let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(let resid1 in resid2ResidhashHbond) {
        let resid1Real = convertLabel2Resid(resid1);
        let atom1 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid1Real]);
        let color1;// = atom1.color.getHexString();
        for(let resid2 in resid2ResidhashHbond[resid1]) {
            let resid2Real = convertLabel2Resid(resid2);
            let atom2 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid2Real]);
            let color2;// = atom2.color.getHexString();
            let dist = Math.sqrt(resid2ResidhashHbond[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'hbond_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'hbond_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    let text = '<div style="text-align:center"><br><b>' + cnt
      + ' hydrogen bond pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
        + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
/*
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        let hbondStr = me.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.hbondColor, labelType, me.hbondValue);
        return hbondStr;
    }
    else {
        return text;
    }
*/
    return text;
}

function exportSaltbridgePairs(objAll, objAll, type, labelType, resid2ResidhashSaltbridge) {
    let pre = 'div0_';
    let tmpText = '';
    let cnt = 0;
    let colorText1 = ' <span style="background-color:#';
    let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(let resid1 in resid2ResidhashSaltbridge) {
        let resid1Real = convertLabel2Resid(resid1);
        let atom1 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid1Real]);
        let color1;// = atom1.color.getHexString();
        for(let resid2 in resid2ResidhashSaltbridge[resid1]) {
            let resid2Real = convertLabel2Resid(resid2);
            let atom2 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid2Real]);
            let color2;// = atom2.color.getHexString();
            let dist = Math.sqrt(resid2ResidhashSaltbridge[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'saltb_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'saltb_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    let text = '<div style="text-align:center"><br><b>' + cnt
      + ' salt bridge/ionic interaction pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
          + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
/*
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        let hbondStr = me.getGraphLinks(resid2ResidhashSaltbridge, resid2ResidhashSaltbridge, me.ionicColor, labelType, me.ionicValue);
        return hbondStr;
    }
    else {
        return text;
    }
*/
    return text;
}

function exportHalogenPiPairs(objAll, type, labelType, interactionType, resid2ResidhashInput) {
    let pre = 'div0_';
    let tmpText = '';
    let cnt = 0;
    let colorText1 = ' <span style="background-color:#';
    let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    let resid2Residhash, color, value;
    if(interactionType == 'halogen') {
        resid2Residhash = resid2ResidhashInput; //resid2ResidhashHalogen;
        color = para.bondColorValue.halogenColor;
        value = para.bondColorValue.halogenValue;
    }
    else if(interactionType == 'pi-cation') {
        resid2Residhash = resid2ResidhashInput; //resid2ResidhashPication;
        color = para.bondColorValue.picationColor;
        value = para.bondColorValue.picationValue;
    }
    else if(interactionType == 'pi-stacking') {
        resid2Residhash = resid2ResidhashInput; //resid2ResidhashPistacking;
        color = para.bondColorValue.pistackingColor;
        value = para.bondColorValue.pistackingValue;
    }
    for(let resid1 in resid2Residhash) {
        let resid1Real = convertLabel2Resid(resid1);
        let atom1 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid1Real]);
        let color1;// = atom1.color.getHexString();
        for(let resid2 in resid2Residhash[resid1]) {
            let resid2Real = convertLabel2Resid(resid2);
            let atom2 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid2Real]);
            let color2;// = atom2.color.getHexString();
            let dist = Math.sqrt(resid2Residhash[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + interactionType + '_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + interactionType + '_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    let text = '<div style="text-align:center"><br><b>' + cnt
      + ' ' + interactionType + ' pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
          + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
/*
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        let hbondStr = me.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
        return hbondStr;
    }
    else {
        return text;
    }
*/
    return text;
}

function exportSpherePairs(objAll, bInteraction, type, labelType, resid2ResidhashInput) {
    let pre = 'div0_';
    let tmpText = '';
    let cnt = 0;
    let residHash = resid2ResidhashInput; //(bInteraction) ? resid2ResidhashInteractions : resid2ResidhashSphere;
    let colorText1 = ' <span style="background-color:#';
    let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(let resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
        let resid1Real = convertLabel2Resid(resid1);
        let atom1 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid1Real]);
        let color1;// = atom1.color.getHexString();
        for(let resid2 in residHash[resid1]) {
            let resid2Real = convertLabel2Resid(resid2);
            let atom2 = utils.getFirstAtomObj(objAll.atoms, objAll.residues[resid2Real]);
            let color2;// = atom2.color.getHexString();
            let dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
            let dist1 = dist1_dist2_atom1_atom2[0];
            let dist2 = dist1_dist2_atom1_atom2[1];
            atom1 = dist1_dist2_atom1_atom2[2];
            atom2 = dist1_dist2_atom1_atom2[3];
            let contactCnt = dist1_dist2_atom1_atom2[4];
            if(bInteraction) {
                tmpText += '<tr><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'inter_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'inter_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
            }
            else {
                tmpText += '<tr><td>' + resid1 + '</td><td>' + resid2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td></tr>';
            }
            ++cnt;
        }
    }
    let nameStr = (bInteraction) ? "the contacts" : "sphere";
    let text = '<div style="text-align:center"><br><b>' + cnt
      + ' residue pairs in ' + nameStr + '</b>:</div><br>';
    if(cnt > 0) {
        if(bInteraction) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
        }
        else {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th></tr>';
        }
        text += tmpText;
        text += '</table><br/>';
    }

/*
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        let interStr = me.getGraphLinks(residHash, residHash, me.contactColor, labelType, me.contactValue);
        return interStr;
    }
    else {
        return text;
    }
*/
    return text;
}

function convertLabel2Resid(residLabel) {
    //ASN $1KQ2.A:6@ND2
    //or ASN $1KQ2.A:6
    let pos1 = residLabel.indexOf(' ');
    let pos2Tmp = residLabel.indexOf('@');
    let pos2 = (pos2Tmp !== -1) ? pos2Tmp : residLabel.length;
    let pos3 = residLabel.indexOf('$');
    let pos4 = residLabel.indexOf('.');
    let pos5 = residLabel.indexOf(':');
    let resid = residLabel.substr(pos3 + 1, pos4 - pos3 - 1) + '_' + residLabel.substr(pos4 + 1, pos5 - pos4 - 1)
        + '_' + residLabel.substr(pos5 + 1, pos2 - pos5 - 1);
    return resid;
}

function calculateChemicalHbonds(objAll, startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal, resids2inter, resids2interAll) {
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    let resid2Residhash = {};

    let atomHbond = {};
    let chain_resi, chain_resi_atom;

    let maxlengthSq = threshold * threshold;

    for (let i in startAtoms) {
      let atom = objAll.atoms[i];

      // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
      // hbonds: calculate hydrogen bond
      let bAtomCond = (bSaltbridge) ? ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
        || (atom.het && (atom.elem === "N" || atom.elem === "O" || atom.elem === "S"))
        : atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.het || atom.resn === "Cys" || atom.resn === "Met"));

      //bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

      if(bAtomCond) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        atomHbond[chain_resi_atom] = atom;
      }
    } // end of for (let i in startAtoms) {

    let hbondsAtoms = {};
    let residueHash = {};

    // from DSSP C++ code
    //let kSSBridgeDistance = 3.0;
    let kMinimalDistance = 0.5;
    //let kMinimalCADistance = 9.0;
    let kMinHBondEnergy = -9.9;
    let kMaxHBondEnergy = -0.5;
    let kCouplingConstant = -27.888;    //  = -332 * 0.42 * 0.2
    //let kMaxPeptideBondLength = 2.5;

    let hbondCnt = {};

    for (let i in targetAtoms) {
      let atom = objAll.atoms[i];

      // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
      // hbonds: calculate hydrogen bond
      let bAtomCond = (bSaltbridge) ? ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
        || (atom.het && (atom.elem === "N" || atom.elem === "O" || atom.elem === "S") )
        : atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.het || atom.resn === "Cys" || atom.resn === "Met"));

      //bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

      let crossstrucinter = false;
      let currResiHash = {};
      if(bAtomCond) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        let oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
        if(resid2Residhash[oriResidName] === undefined) resid2Residhash[oriResidName] = {};

        for (let j in atomHbond) {
          if(bSaltbridge) {
              // skip both positive orboth negative cases
              if( ( (atom.resn === 'LYS' || atom.resn === 'ARG') && (atomHbond[j].resn === 'LYS' || atomHbond[j].resn === 'ARG') ) ||
                ( (atom.resn === 'GLU' || atom.resn === 'ASP') && (atomHbond[j].resn === 'GLU' || atomHbond[j].resn === 'ASP') ) ) {
                    continue;
                }
          }

          if(!crossstrucinter && atom.structure != atomHbond[j].structure) continue;

          // skip same residue
          if(chain_resi == j.substr(0, j.lastIndexOf('_') ) ) continue;

          let xdiff = Math.abs(atom.coord.x - atomHbond[j].coord.x);
          if(xdiff > threshold) continue;

          let ydiff = Math.abs(atom.coord.y - atomHbond[j].coord.y);
          if(ydiff > threshold) continue;

          let zdiff = Math.abs(atom.coord.z - atomHbond[j].coord.z);
          if(zdiff > threshold) continue;

          let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
          if(dist > maxlengthSq) continue;

          //if(this.proteins.hasOwnProperty(atom.serial) && this.proteins.hasOwnProperty(atomHbond[j].serial)
          if(!atom.het && !atomHbond[j].het
            && (atom.name === 'N' || atom.name === 'O') && (atomHbond[j].name === 'O' || atomHbond[j].name === 'N') ) {

            if(atom.name === atomHbond[j].name) continue;
            if(atom.structure == atomHbond[j].structure && atom.chain == atomHbond[j].chain && Math.abs(atom.resi - atomHbond[j].resi) <= 1) continue; // peptide bond
            // protein backbone hydrogen
            // https://en.wikipedia.org/wiki/DSSP_(hydrogen_bond_estimation_algorithm)
            let result;

            let inDonor = (atom.name === 'N') ? atom : atomHbond[j];
            let inAcceptor = (atom.name === 'O') ? atom : atomHbond[j];

            if (inDonor.resn === 'Pro') {
                continue;
            }
            else if (inDonor.hcoord === undefined) {
                if(!isValidHbond(objAll, atom, atomHbond[j], threshold)) continue;
            }
            else {
                let inDonorH = inDonor.hcoord;
                let inDonorN = inDonor.coord;

                let resid = inAcceptor.structure + "_" + inAcceptor.chain + "_" + inAcceptor.resi;
                let C_atom;
                for(let serial in objAll.residues[resid]) {
                    if(objAll.atoms[serial].name === 'C') {
                        C_atom = objAll.atoms[serial];
                        break;
                    }
                }

                if(C_atom === undefined) continue;

                let inAcceptorC = C_atom.coord;
                let inAcceptorO = inAcceptor.coord;

                let distanceHO = inDonorH.distanceTo(inAcceptorO);
                let distanceHC = inDonorH.distanceTo(inAcceptorC);
                let distanceNC = inDonorN.distanceTo(inAcceptorC);
                let distanceNO = inDonorN.distanceTo(inAcceptorO);

                if (distanceHO < kMinimalDistance || distanceHC < kMinimalDistance || distanceNC < kMinimalDistance || distanceNO < kMinimalDistance) {
                    result = kMinHBondEnergy;
                }
                else {
                    result = kCouplingConstant / distanceHO - kCouplingConstant / distanceHC + kCouplingConstant / distanceNC - kCouplingConstant / distanceNO;
                }

                //if(result > kMaxHBondEnergy) {
                if(atom.ss == 'helix' && atomHbond[j].ss == 'helix' && result > kMaxHBondEnergy) {
                    continue;
                }
            }
          }
          else {
              if(!isValidHbond(objAll, atom, atomHbond[j], threshold)) continue;
          }

          // too many hydrogen bonds for one atom
          if(hbondCnt[atom.serial] > 2 || hbondCnt[atomHbond[j].serial] > 2) {
              continue;
          }

          if(hbondCnt[atom.serial] === undefined) {
              hbondCnt[atom.serial] = 1;
          }
          else {
              ++hbondCnt[atom.serial];
          }

          if(hbondCnt[atomHbond[j].serial] === undefined) {
              hbondCnt[atomHbond[j].serial] = 1;
          }
          else {
              ++hbondCnt[atomHbond[j].serial];
          }

/*
          // output hydrogen bonds
          if(type !== 'graph') {
              if(bSaltbridge) {
                  this.saltbridgepnts.push({'serial': atom.serial, 'coord': atom.coord});
                  this.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
              }
              else {
                  this.hbondpnts.push({'serial': atom.serial, 'coord': atom.coord});
                  this.hbondpnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
              }
          }
*/

          let chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;
          hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[chain_resi]);
          hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[chain_resi2]);

          residueHash[chain_resi] = 1;
          residueHash[chain_resi2] = 1;

          //let residName = atomHbond[j].resn + " " + atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi + '_' + atomHbond[j].name;
          let residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

          let resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;
          if(resids2interAll[resids] === undefined
            || resids2interAll[resids]['ionic'] === undefined
            || !resids2interAll[resids]['ionic'].hasOwnProperty(oriResidName + ',' + residName) ) {
              resid2Residhash[oriResidName][residName] = dist.toFixed(1);

              if(!bInternal) {
                  if(resids2inter[resids] === undefined) resids2inter[resids] = {};
                  if(resids2inter[resids]['hbond'] === undefined) resids2inter[resids]['hbond'] = {};
                  resids2inter[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
              }

              if(resids2interAll[resids] === undefined) resids2interAll[resids] = {};
              if(resids2interAll[resids]['hbond'] === undefined) resids2interAll[resids]['hbond'] = {};
              resids2interAll[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
          }
        } // end of for (let j in atomHbond) {
      }
    } // end of for (let i in targetAtoms) {

    let residueArray = Object.keys(residueHash);

/*
    // draw sidec for these residues
    if(type !== 'graph') {
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            for(let j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
            }
        }
    }
*/

    return {"atoms": hbondsAtoms, "resid2Residhash": resid2Residhash};
}

// get ionic interactions, including salt bridge (charged hydrogen bonds)
function calculateIonicInteractions(objAll, startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal, resids2inter, resids2interAll) {
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    let resid2Residhash = {};

    let atomCation = {}, atomAnion = {};
    let chain_resi, chain_resi_atom;

    let maxlengthSq = threshold * threshold;

    for (let i in startAtoms) {
      let atom = objAll.atoms[i];

      // only use one of the two atoms
      if( ( atom.resn === 'ARG' && atom.name === "NH2")
        || ( atom.resn === 'GLU' && atom.name === "OE2")
        || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
          continue;
      }

      // For ligand, "N" with one single bond only may be positively charged. => to be improved
      let bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && para.cationsTrimArray.indexOf(atom.elem) !== -1)
        || (atom.het && atom.elem === "N" && atom.bonds.length == 1);

      // For ligand, "O" in carboxy group may be negatively charged. => to be improved
      let bLigNeg = undefined;
      if(atom.het && atom.elem === "O" && atom.bonds.length == 1) {
           let cAtom = objAll.atoms[atom.bonds[0]];
           for(let j = 0; j < cAtom.bonds.length; ++j) {
               let serial = cAtom.bonds[j];
               if(objAll.atoms[serial].elem == "O" && serial != atom.serial) {
                   bLigNeg = true;
                   break;
               }
           }
      }

      let bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
        || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
        || ( objAll.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
        || (atom.het && para.anionsTrimArray.indexOf(atom.elem) !== -1)
        || bLigNeg;

//      bAtomCondCation = (this.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
//      bAtomCondAnion = (this.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

      if(bAtomCondCation || bAtomCondAnion) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        if(bAtomCondCation) atomCation[chain_resi_atom] = atom;
        if(bAtomCondAnion) atomAnion[chain_resi_atom] = atom;
      }
    } // end of for (let i in startAtoms) {

    let hbondsAtoms = {};
    let residueHash = {};

    for (let i in targetAtoms) {
      let atom = objAll.atoms[i];

      // only use one of the two atoms
      if( ( atom.resn === 'ARG' && atom.name === "NH2")
        || ( atom.resn === 'GLU' && atom.name === "OE2")
        || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
          continue;
      }

      let bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && para.cationsTrimArray.indexOf(atom.elem) !== -1);

      let bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
        || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
        || ( objAll.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
        || (atom.het && para.anionsTrimArray.indexOf(atom.elem) !== -1);

//      bAtomCondCation = (this.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
//      bAtomCondAnion = (this.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

      let currResiHash = {};
      if(bAtomCondCation || bAtomCondAnion) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        let oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
        if(resid2Residhash[oriResidName] === undefined) resid2Residhash[oriResidName] = {};

        let atomHbond = {};
        if(bAtomCondCation) atomHbond = atomAnion;
        else if(bAtomCondAnion) atomHbond = atomCation;

        let otherAtom1 = undefined, resid1 = atom.structure + '_' + atom.chain + '_' + atom.resi;
        if( bAtomCondCation && atom.resn === 'ARG' && atom.name === "NH1") {
            otherAtom1 = getFirstAtomObjByName(objAll, objAll.residues[resid1], 'NH2');
        }
        else if( bAtomCondAnion && atom.resn === 'GLU' && atom.name === "OE1") {
            otherAtom1 = getFirstAtomObjByName(objAll, objAll.residues[resid1], 'OE2');
        }
        else if( bAtomCondAnion && atom.resn === 'ASP' && atom.name === "OD1") {
            otherAtom1 = getFirstAtomObjByName(objAll, objAll.residues[resid1], 'OD2');
        }

        let coord1 = (otherAtom1 === undefined) ? atom.coord : atom.coord.clone().add(otherAtom1.coord).multiplyScalar(0.5);

        let crossstrucinter = false;
        for (let j in atomHbond) {
          // skip same residue
          if(chain_resi == j.substr(0, j.lastIndexOf('_') )) continue;

          if(!crossstrucinter && atom.structure != atomHbond[j].structure) continue;

            let otherAtom2 = undefined, resid2 = atomHbond[j].structure + '_' + atomHbond[j].chain + '_' + atomHbond[j].resi;
            if( bAtomCondAnion && atomHbond[j].resn === 'ARG' && atomHbond[j].name === "NH1") {
                otherAtom2 = getFirstAtomObjByName(objAll, objAll.residues[resid2], 'NH2');
            }
            else if( bAtomCondCation && atomHbond[j].resn === 'GLU' && atomHbond[j].name === "OE1") {
                otherAtom2 = getFirstAtomObjByName(objAll, objAll.residues[resid2], 'OE2');
            }
            else if( bAtomCondCation && atomHbond[j].resn === 'ASP' && atomHbond[j].name === "OD1") {
                otherAtom2 = getFirstAtomObjByName(objAll, objAll.residues[resid2], 'OD2');
            }

            let coord2 = (otherAtom2 === undefined) ? atomHbond[j].coord : atomHbond[j].coord.clone().add(otherAtom2.coord).multiplyScalar(0.5);

          let xdiff = Math.abs(coord1.x - coord2.x);
          if(xdiff > threshold) continue;

          let ydiff = Math.abs(coord1.y - coord2.y);
          if(ydiff > threshold) continue;

          let zdiff = Math.abs(coord1.z - coord2.z);
          if(zdiff > threshold) continue;

          let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
          if(dist > maxlengthSq) continue;

          // output salt bridge
//          if(type !== 'graph') {
//              this.saltbridgepnts.push({'serial': atom.serial, 'coord': coord1});
//              this.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': coord2});
//          }

          let chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;

          hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[chain_resi]);
          hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[chain_resi2]);

          residueHash[chain_resi] = 1;
          residueHash[chain_resi2] = 1;

          let residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

          //if(resid2Residhash[oriResidName][residName] === undefined || resid2Residhash[oriResidName][residName] > dist) {
              resid2Residhash[oriResidName][residName] = dist.toFixed(1);
          //}

          let resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;

          if(!bInternal) {
              if(resids2inter[resids] === undefined) resids2inter[resids] = {};
              if(resids2inter[resids]['ionic'] === undefined) resids2inter[resids]['ionic'] = {};
              resids2inter[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);
          }

          if(resids2interAll[resids] === undefined) resids2interAll[resids] = {};
          if(resids2interAll[resids]['ionic'] === undefined) resids2interAll[resids]['ionic'] = {};
          resids2interAll[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);

        } // end of for (let j in atomHbond) {
      }
    } // end of for (let i in targetAtoms) {

    let residueArray = Object.keys(residueHash);

/*
    // draw sidec for these residues
    if(type !== 'graph') {
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            for(let j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
                if(me.ions.hasOwnProperty(j)) this.atoms[j].style2 = 'sphere';
            }
        }
    }
*/

    return {"atoms": hbondsAtoms, "resid2Residhash": resid2Residhash};
}

// get halogen, pi-cation,and pi-stacking
function calculateHalogenPiInteractions(objAll, startAtoms, targetAtoms, threshold, type, interactionType, bInternal, resids2inter, resids2interAll) {
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    let chain_resi, chain_resi_atom;
    let atoms1a = {}, atoms1b = {}, atoms2a = {}, atoms2b = {};
    if(interactionType == 'halogen') {
        for (let i in startAtoms) {
          let atom = objAll.atoms[i];

          atoms1a = utils.unionHash(atoms1a, getHalogenDonar(atom));
          atoms2a = utils.unionHash(atoms2a, getHalogenAcceptor(atom));
        }

        for (let i in targetAtoms) {
          let atom = objAll.atoms[i];

          atoms2b = utils.unionHash(atoms2b, getHalogenDonar(atom));
          atoms1b = utils.unionHash(atoms1b, getHalogenAcceptor(atom));
        }
    }
    else if(interactionType == 'pi-cation') {
        processedRes = {};
        for (let i in startAtoms) {
          let atom = objAll.atoms[i];

          atoms1a = utils.unionHash(atoms1a, getPi(objAll, atom, false, processedRes));
          atoms2a = utils.unionHash(atoms2a, getCation(atom));
        }

        processedRes = {};
        for (let i in targetAtoms) {
          let atom = objAll.atoms[i];

          atoms2b = utils.unionHash(atoms2b, getPi(objAll, atom, false, processedRes));
          atoms1b = utils.unionHash(atoms1b, getCation(atom));
        }
    }
    else if(interactionType == 'pi-stacking') {
        processedRes = {};
        for (let i in startAtoms) {
          let atom = objAll.atoms[i];

          atoms1a = utils.unionHash(atoms1a, getPi(objAll, atom, true, processedRes));
        }

        processedRes = {};
        for (let i in targetAtoms) {
          let atom = objAll.atoms[i];

          atoms1b = utils.unionHash(atoms1b, getPi(objAll, atom, true, processedRes));
        } // for
    }

    let hbondsAtoms = {};
    let residueHash = {};

    let resid2Residhash = {};

    let maxlengthSq = threshold * threshold;

    let crossstrucinter = false;
    for (let i in atoms1a) {
        let atom1 = atoms1a[i];
        let oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
        if(resid2Residhash[oriResidName] === undefined) resid2Residhash[oriResidName] = {};

        for (let j in atoms1b) {
          let atom2 = atoms1b[j];

          if(!crossstrucinter && atom1.structure != atom2.structure) continue;

          // skip same residue
          if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

          // available in 1b and 2a
          if(interactionType == 'pi-cation' && atom2.resn === 'ARG' && atom2.name === "NH1") {
            let resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;
            let otherAtom = getFirstAtomObjByName(objAll, objAll.residues[resid2], 'NH2');

            let coord = atom2.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
            atom2 = utils.cloneHash(atom2);
            atom2.coord = coord;
          }

          // available in 1a and 1b
          // only parallel or perpendicular
          if(interactionType == 'pi-stacking' && atom1.normal !== undefined && atom2.normal !== undefined) {
              let dotResult = Math.abs(atom1.normal.dot(atom2.normal));
              // perpendicular 30 degree || parellel, 30 degree
              if(dotResult > 0.5 && dotResult < 0.866) continue;
          }

          let bResult = getHalogenPiInteractions(objAll, atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal, resids2inter, resids2interAll, resid2Residhash);

          if(bResult) {
              hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
              hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

              residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
              residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
          }
        }
    }

    for (let i in atoms2a) {
        let atom1 = atoms2a[i];
        let oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
        if(resid2Residhash[oriResidName] === undefined) resid2Residhash[oriResidName] = {};

        // available in 1b and 2a
        if(interactionType == 'pi-cation' && atom1.resn === 'ARG' && atom1.name === "NH1") {
            let resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
            let otherAtom = getFirstAtomObjByName(objAll, objAll.residues[resid1], 'NH2');

            let coord = atom1.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
            atom1 = utils.cloneHash(atom1);
            atom1.coord = coord;
        }

        for (let j in atoms2b) {
          let atom2 = atoms2b[j];

          if(!crossstrucinter && atom1.structure != atom2.structure) continue;

          // skip same residue
          if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

          let bResult = getHalogenPiInteractions(objAll, atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal, resids2inter, resids2interAll, resid2Residhash);
          if(bResult) {
              hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
              hbondsAtoms = utils.unionHash(hbondsAtoms, objAll.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

              residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
              residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
          }
        }
    }

    let residueArray = Object.keys(residueHash);
/*
    // draw sidec for these residues
    if(type !== 'graph') {
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            for(let j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
                if(me.ions.hasOwnProperty(j)) this.atoms[j].style2 = 'sphere';
            }
        }
    }
*/
    return {"atoms": hbondsAtoms, "resid2Residhash": resid2Residhash};
}

// https://www.rcsb.org/pages/help/3dview#ligand-view
// exclude pairs accordingto angles
function isValidHbond(objAll, atom, atomHbond, threshold) {
      // return: 'donor', 'acceptor', 'both', 'ring', 'none'
      let atomType = isHbondDonorAcceptor(objAll, atom);
      let atomHbondType = isHbondDonorAcceptor(objAll, atomHbond);

      let maxHbondDist = threshold; //3.5;
      let maxHbondSulfurDist = threshold; //4.1;
      let maxDist = threshold;
      let maxHbondDistSq = maxHbondDist * maxHbondDist;

      let tolerance = 5;
      let maxHbondAccAngle = (45 + tolerance) * Math.PI / 180;
      let maxHbondDonAngle = (45 + tolerance) * Math.PI / 180;
      let maxHbondAccPlaneAngle = 90 * Math.PI / 180;
      let maxHbondDonPlaneAngle = 30 * Math.PI / 180;

      let donorAtom, acceptorAtom;

      if( (atomType == 'donor' &&  (atomHbondType == 'acceptor' || atomHbondType == 'both' || atomHbondType == 'ring'))
        || (atomHbondType == 'acceptor' && (atomType == 'donor' || atomType == 'both' || atomType == 'ring'))
        ) {
          donorAtom = atom;
          acceptorAtom = atomHbond;
      }
      else if( (atomType == 'acceptor' &&  (atomHbondType == 'donor' || atomHbondType == 'both' || atomHbondType == 'ring'))
        || (atomHbondType == 'donor' && (atomType == 'acceptor' || atomType == 'both' || atomType == 'ring'))
        ) {
          acceptorAtom = atom;
          donorAtom = atomHbond;
      }
      else if( (atomType == 'both' || atomType == 'ring') &&  (atomHbondType == 'both'  || atomHbondType == 'ring') ) {
          donorAtom = atom;
          acceptorAtom = atomHbond;
          // or
          //donorAtom = atomHbond;
          //acceptorAtom = atom;

          if( (objAll.nucleotides.hasOwnProperty(atom.serial) && objAll.nucleotides.hasOwnProperty(atomHbond.serial) && (atomType == 'ring' || atomHbondType == 'ring') ) // 1TUP
              || ( (atom.het || atomHbond.het) && atomType == 'ring' && atomHbondType == 'ring')  // 3GVU
              ) {
          }
          else {
              maxHbondDonPlaneAngle = 90 * Math.PI / 180;
          }

      }
      else if(atomType == 'none' ||  atomHbondType == 'none') {
          return false;
      }
      else {
          return false;
      }

      let donorAngles = calcAngles(objAll, donorAtom, acceptorAtom);
      let idealDonorAngle = 90 * Math.PI / 180; // 90 for sp2, 60 for sp3
      for(let i = 0, il = donorAngles.length; i < il; ++i) {
          if(Math.abs(idealDonorAngle - donorAngles[i]) > maxHbondDonAngle) {
              return false;
          }
      }

      //if (idealGeometry[donor.index] === AtomGeometry.Trigonal){ // 120
        let outOfPlane1 = calcPlaneAngle(objAll, donorAtom, acceptorAtom);

        if (outOfPlane1 !== undefined && outOfPlane1 > maxHbondDonPlaneAngle) {
            return false;
        }
      //}

      let acceptorAngles = calcAngles(objAll, acceptorAtom, donorAtom);
      let idealAcceptorAngle = 90 * Math.PI / 180;
      for(let i = 0, il = acceptorAngles.length; i < il; ++i) {
          if(Math.abs(idealAcceptorAngle - acceptorAngles[i]) > maxHbondAccAngle) {
              return false;
          }
      }

      //if (idealGeometry[acceptor.index] === AtomGeometry.Trigonal){ // 120
        let outOfPlane2 = calcPlaneAngle(objAll, acceptorAtom, donorAtom);
        if (outOfPlane2 !== undefined && outOfPlane2 > maxHbondAccPlaneAngle) return false;
      //}

      return true;
}

//http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/aminoacids/charge/#hydrogen
// return: 'donor', 'acceptor', 'both', 'ring', 'none'
function isHbondDonorAcceptor(objAll, atom) {
  if( (atom.name == 'N' && !atom.het ) // backbone
    || (atom.elem == 'N' && atom.resn == 'Arg')
    || (atom.elem == 'N' && atom.resn == 'Asn')
    || (atom.elem == 'N' && atom.resn == 'Gln')
    || (atom.elem == 'N' && atom.resn == 'Lys')
    || (atom.elem == 'N' && atom.resn == 'Trp')
    ) {
      return 'donor';
  }
  else if( (atom.name == 'O' && !atom.het ) // backbone
    || (atom.elem == 'S' && atom.resn == 'Met')
    || (atom.elem == 'O' && atom.resn == 'Asn')
    || (atom.elem == 'O' && atom.resn == 'Asp')
    || (atom.elem == 'O' && atom.resn == 'Gln')
    || (atom.elem == 'O' && atom.resn == 'Glu')
    ) {
      return 'acceptor';
  }
  else if((atom.elem == 'S' && atom.resn == 'Cys')
    || (atom.elem == 'N' && atom.resn == 'His')
    || (atom.elem == 'O' && atom.resn == 'Ser')
    || (atom.elem == 'O' && atom.resn == 'Thr')
    || (atom.elem == 'O' && atom.resn == 'Tyr')
    ) {
      return 'both';
  }
  else if(atom.resn == 'Pro') {
      return 'none';
  }
  // if the Nitrogen has one or two non-hydrogen bonded atom, the nitrogen is a donor
  else if(atom.elem == 'N') {
      // X-ray can not differentiate N and O
      if(atom.resn == 'Asn' || atom.resn == 'Gln') return 'both';

      let cnt = 0, cntN = 0;
      for(let k = 0, kl = atom.bonds.length; k < kl; ++k) {
          if(objAll.atoms[atom.bonds[k]].elem == 'H') {
              ++cnt;
          }
      }

      if(cnt == 2) return 'donor';

      cnt = 0;
      for(let i = 0, il = atom.bonds.length; i < il; ++i) {
          let nbAtom = objAll.atoms[atom.bonds[i]];
          if(nbAtom.elem != 'H') {
              ++cnt;

              for(let j = 0, jl = nbAtom.bonds.length; j < jl; ++j) {
                  if(objAll.atoms[nbAtom.bonds[j]].elem == 'N') {
                      ++cntN;
                  }
              }
          }
      }

      if(cnt == 1) { // donor
          return 'donor';
      }
      else if(cnt == 2) {
          if(cntN > 1) {
              return 'ring'; //'both'; // possible
          }
          else {
            return 'donor';
          }
      }
      else {
          return 'none';
      }
  }
  // if the neighboring C of Oxygen has two or more bonds with O or N, the oxygen is an acceptor
  else if(atom.elem == 'O' && atom.bonds.length == 1) {
      // X-ray can not differentiate N and O
      if(atom.resn == 'Asn' || atom.resn == 'Gln') return 'both';

      for(let k = 0, kl = atom.bonds.length; k < kl; ++k) {
          if(objAll.atoms[atom.bonds[k]].elem == 'H') {
              return 'donor';
          }
      }

      let cAtom = objAll.atoms[atom.bonds[0]];
      let cnt = 0;
      for(let k = 0, kl = cAtom.bonds.length; k < kl; ++k) {
          if(objAll.atoms[cAtom.bonds[k]].elem == 'O' || objAll.atoms[cAtom.bonds[k]].elem == 'N' || objAll.atoms[cAtom.bonds[k]].elem == 'S') {
              ++cnt;
          }
      }

      if(cnt >= 2) { // acceptor
          return 'acceptor';
      }
      else {
          return 'both'; // possible
      }
  }
  // if Oxygen has two bonds, the oxygen is an acceptor
  else if(atom.elem == 'O' && atom.bonds.length == 2) {
      for(let k = 0, kl = atom.bonds.length; k < kl; ++k) {
          if(objAll.atoms[atom.bonds[k]].elem == 'H') {
              return 'donor';
          }
      }
      return 'acceptor';
  }
  else {
      return 'both'; // possible
  }
}

function calcAngles(objAll, ap1, ap2) {
  let angles = [];
  let d1 = new THREE.Vector3();
  let d2 = new THREE.Vector3();
  d1.subVectors(ap2.coord, ap1.coord);

  for(let k = 0, kl = ap1.bonds.length; k < kl; ++k) {
      if(objAll.atoms[ap1.bonds[k]].elem != 'H') {
          d2.subVectors(objAll.atoms[ap1.bonds[k]].coord, ap1.coord);
          angles.push(d1.angleTo(d2));
      }
  }

  return angles;
}

function calcPlaneAngle(objAll, ap1, ap2) {
  let x1 = ap1;

  let v12 = new THREE.Vector3();
  v12.subVectors(ap2.coord, ap1.coord);

  let neighbours = [new THREE.Vector3(), new THREE.Vector3()];

  let ni = 0;
  for(let k = 0, kl = ap1.bonds.length; k < kl; ++k) {
      if (ni > 1) { break; }
      if(objAll.atoms[ap1.bonds[k]].elem != 'H') {
          x1 = objAll.atoms[ap1.bonds[k]];
          neighbours[ni++].subVectors(objAll.atoms[ap1.bonds[k]].coord, ap1.coord);
      }
  }

  if (ni === 1) {
      for(let k = 0, kl = x1.bonds.length; k < kl; ++k) {
          if (ni > 1) { break; }
          if(objAll.atoms[x1.bonds[k]].elem != 'H' && objAll.atoms[x1.bonds[k]].serial != ap1.serial) {
              neighbours[ni++].subVectors(objAll.atoms[x1.bonds[k]].coord, ap1.coord);
          }
      }
  }

  if (ni !== 2) {
    return;
  }

  let cp = neighbours[0].cross(neighbours[1]);
  return Math.abs((Math.PI / 2) - cp.angleTo(v12));
}

function getFirstAtomObjByName(objAll, atomsHash, atomName) {
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return objAll.atoms[0];
    }

    let firstIndex;

    for(let i in atomsHash) {
        if(objAll.atoms[i].name == atomName) {
            firstIndex = i;
            break;
        }
    }

    return (firstIndex !== undefined) ? objAll.atoms[firstIndex] : undefined;
}

function getHalogenDonar(atom) {
      let name2atom = {};
      //if(atom.elem === "F" || atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
      if(atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
          let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
}

function getHalogenAcceptor(atom) {
      let name2atom = {};
      let bAtomCond = (atom.elem === "N" || atom.elem === "O" || atom.elem === "S");
      //bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
      if(bAtomCond) {
          let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
}

function getPi(objAll, atom, bStacking, processedRes) {
      let name2atom = {};

      let chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;

      let bAromatic = atom.het || objAll.nucleotides.hasOwnProperty(atom.serial) || atom.resn === "PHE"
        || atom.resn === "TYR" || atom.resn === "TRP";
      if(bStacking) bAromatic = bAromatic || atom.resn === "HIS";

      if(bAromatic) {
          if(!processedRes.hasOwnProperty(chain_resi)) {
              if(atom.het) { // get aromatic for ligands
                  let currName2atom = getAromaticPisLigand(objAll, chain_resi);
                  name2atom = utils.unionHash(name2atom, currName2atom);
              }
              else {
                  let piPosArray = undefined, normalArray = undefined, result = undefined;
                  if(objAll.nucleotides.hasOwnProperty(atom.serial)) {
                      result = getAromaticRings(objAll, atom.resn, chain_resi, 'nucleotide');
                  }
                  else {
                      result = getAromaticRings(objAll, atom.resn, chain_resi, 'protein');
                  }

                  if(result !== undefined) {
                      piPosArray = result.piPosArray;
                      normalArray = result.normalArray;
                  }

                  for(let i = 0, il = piPosArray.length; i < il; ++i) {
                    name2atom[chain_resi + '_pi' + i] = {resn: atom.resn, name: 'pi' + i, coord: piPosArray[i], serial: atom.serial,
                    structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normalArray[i]};
                  }
              }

              processedRes[chain_resi] = 1;
          }
      }

      return name2atom;
}

function getCation(atom) {
      let name2atom = {};

      // use of the two atoms
      if( atom.resn === 'ARG' && atom.name === "NH2") return;

      // remove HIS:  || atom.resn === 'HIS'
      // For ligands, "N" with one single bond only may be positively charged. => to be improved
      let bAtomCond = ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && para.cationsTrimArray.indexOf(atom.elem) !== -1)
        || (atom.het && atom.elem === "N" && atom.bonds.length == 1);
//      bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
      if(bAtomCond) {
          let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
}

function getAromaticPisLigand(objAll, resid) {
    let name2atom = {};

    let serialArray = Object.keys(objAll.residues[resid]);
    let n = serialArray.length;

    // arrays required to color the
    // graph, store the parent of node
    ring_color = {};
    ring_par = {};

    // mark with unique numbers
    ring_mark = {};

    // store the numbers of cycle
    let cyclenumber = 0;
    //let edges = 13;

    // call DFS to mark the cycles
    //cyclenumber = this.dfs_cycle(1, 0, cyclenumber);
    cyclenumber = dfs_cycle(objAll, serialArray[1], serialArray[0], cyclenumber, ring_color, ring_mark, ring_par);

    let cycles = {};

    // push the edges that into the
    // cycle adjacency list
    for (let i = 0; i < n; i++) {
        let serial = serialArray[i];
        if (ring_mark[serial] != 0) {
            if(cycles[ring_mark[serial]] === undefined) cycles[ring_mark[serial]] = [];
            cycles[ring_mark[serial]].push(serial);
        }
    }

    // print all the vertex with same cycle
    for (let i = 1; i <= cyclenumber; i++) {
        // Print the i-th cycle
        let coord = new THREE.Vector3();
        let cnt = 0, serial;
        let coordArray = [];
        if(cycles.hasOwnProperty(i)) {
            for (let j = 0, jl = cycles[i].length; j < jl; ++j) {
                serial = cycles[i][j];
                coord.add(objAll.atoms[serial].coord);
                coordArray.push(objAll.atoms[serial].coord);
                ++cnt;
            }
        }

        if(cnt == 5 || cnt == 6) {
            let v1 = coordArray[0].clone().sub(coordArray[1]).normalize();
            let v2 = coordArray[1].clone().sub(coordArray[2]).normalize();
            let v3 = coordArray[2].clone().sub(coordArray[3]).normalize();

            let normal = v1.cross(v2).normalize();
            let bPlane = normal.dot(v3);

            if(Math.abs(bPlane) < 0.017) { // same plane, 89-90 degree
                coord.multiplyScalar(1.0 / cnt);

                let atom = objAll.atoms[serial];
                name2atom[resid + '_pi' + serial] = {resn: atom.resn, name: 'pi' + serial, coord: coord, serial: atom.serial,
                  structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normal};
            }
        }
    }

    return name2atom;
}

// https://www.geeksforgeeks.org/print-all-the-cycles-in-an-undirected-graph/

// Function to mark the vertex with
// different colors for different cycles
function dfs_cycle(objAll, u, p, cyclenumber, ring_color, ring_mark, ring_par) {

    // already (completely) visited vertex.
    if (ring_color[u] == 2) {
        return cyclenumber;
    }

    // seen vertex, but was not completely visited -> cycle detected.
    // backtrack based on parents to find the complete cycle.
    if (ring_color[u] == 1) {

        cyclenumber++;
        let cur = p;
        ring_mark[cur] = cyclenumber;

        // backtrack the vertex which are
        // in the current cycle thats found
        while (cur != u) {
            cur = ring_par[cur];
            ring_mark[cur] = cyclenumber;
        }
        return cyclenumber;
    }
    ring_par[u] = p;

    // partially visited.
    ring_color[u] = 1;

    // simple dfs on graph
    if(objAll.atoms[u] !== undefined) {
        for(let k = 0, kl = objAll.atoms[u].bonds.length; k < kl; ++k) {
            let v = objAll.atoms[u].bonds[k];

            // if it has not been visited previously
            if (v == ring_par[u]) {
                continue;
            }
            cyclenumber = dfs_cycle(objAll, v, u, cyclenumber, ring_color, ring_mark, ring_par);
        }
    }

    // completely visited.
    ring_color[u] = 2;

    return cyclenumber;
}

function getRingNormal(coordArray) {
    if(coordArray.length < 3) return undefined;

    let v1 = coordArray[0].clone().sub(coordArray[1]);
    let v2 = coordArray[1].clone().sub(coordArray[2]);

    return v1.cross(v2).normalize();
}

function getAromaticRings(objAll, resn, resid, type) {
    let piPosArray = [];
    let normalArray = [];

    let coordArray1 = [];
    let coordArray2 = [];

    if(type == 'nucleotide') {
        let pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();
        if(resn.trim().toUpperCase() == 'A' || resn.trim().toUpperCase() == 'DA'
          || resn.trim().toUpperCase() == 'G' || resn.trim().toUpperCase() == 'DG') {
            for(let i in objAll.residues[resid]) {
                let atom = objAll.atoms[i];
                if(atom.name == 'N1' || atom.name == 'C2' || atom.name == 'N3' || atom.name == 'C6') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'C4' || atom.name == 'C5') {
                    pos1.add(atom.coord);
                    pos2.add(atom.coord);

                    coordArray1.push(atom.coord);
                    coordArray2.push(atom.coord);
                }
                else if(atom.name == 'N7' || atom.name == 'C8' || atom.name == 'N9') {
                    pos2.add(atom.coord);

                    coordArray2.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);
                piPosArray.push(pos1);
                normalArray.push(getRingNormal(coordArray1));
            }

            if(coordArray2.length == 5) {
                pos2.multiplyScalar(1.0 / 5);
                piPosArray.push(pos2);
                normalArray.push(getRingNormal(coordArray2));
            }
        }
        else if(resn.trim().toUpperCase() == 'C' || resn.trim().toUpperCase() == 'DC'
          || resn.trim().toUpperCase() == 'T' || resn.trim().toUpperCase() == 'DT'
          || resn.trim().toUpperCase() == 'U' || resn.trim().toUpperCase() == 'DU') {
            for(let i in objAll.residues[resid]) {
                let atom = objAll.atoms[i];
                if(atom.name == 'N1' || atom.name == 'C2' || atom.name == 'N3' || atom.name == 'C6') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'C4' || atom.name == 'C5') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);

                piPosArray.push(pos1);

                normalArray.push(getRingNormal(coordArray1));
            }
        }
    }
    else if(type == 'protein') {
        let pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();

        if(resn.toUpperCase() == 'PHE' || resn.toUpperCase() == 'TYR') {
            for(let i in objAll.residues[resid]) {
                let atom = objAll.atoms[i];
                if(atom.name == 'CG' || atom.name == 'CD1' || atom.name == 'CE1'
                  || atom.name == 'CZ' || atom.name == 'CE2' || atom.name == 'CD2') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);

                piPosArray.push(pos1);
                normalArray.push(getRingNormal(coordArray1));
            }
        }
        else if(resn.toUpperCase() == 'HIS') {
            for(let i in objAll.residues[resid]) {
                let atom = objAll.atoms[i];
                if(atom.name == 'CG' || atom.name == 'ND1' || atom.name == 'CE1'
                  || atom.name == 'NE2' || atom.name == 'CD2') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 5) {
                pos1.multiplyScalar(1.0 / 5);

                piPosArray.push(pos1);
                normalArray.push(getRingNormal(coordArray1));
            }
        }
        else if(resn.toUpperCase() == 'TRP') {
            for(let i in objAll.residues[resid]) {
                let atom = objAll.atoms[i];
                if(atom.name == 'CE2' || atom.name == 'CH2' || atom.name == 'CZ3' || atom.name == 'CE3') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'CD2' || atom.name == 'CE2') {
                    pos1.add(atom.coord);
                    pos2.add(atom.coord);
                    coordArray1.push(atom.coord);
                    coordArray2.push(atom.coord);
                }
                else if(atom.name == 'CG' || atom.name == 'CD1' || atom.name == 'NE1') {
                    pos2.add(atom.coord);
                    coordArray2.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);
                piPosArray.push(pos1);
                normalArray.push(getRingNormal(coordArray1));
            }

            if(coordArray2.length == 5) {
                pos2.multiplyScalar(1.0 / 5);
                piPosArray.push(pos2);
                normalArray.push(getRingNormal(coordArray2));
            }
        }
    }

    return {piPosArray: piPosArray, normalArray: normalArray} ;
}

function getHalogenPiInteractions(objAll, atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal, resids2inter, resids2interAll, resid2Residhash) {
      let xdiff = Math.abs(atom1.coord.x - atom2.coord.x);
      if(xdiff > threshold) return false;

      let ydiff = Math.abs(atom1.coord.y - atom2.coord.y);
      if(ydiff > threshold) return false;

      let zdiff = Math.abs(atom1.coord.z - atom2.coord.z);
      if(zdiff > threshold) return false;

      let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
      if(dist > maxlengthSq) return false;

/*
      // output salt bridge
      if(type !== 'graph') {
          if(interactionType == 'halogen') {
              this.halogenpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.halogenpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
          else if(interactionType == 'pi-cation') {
              this.picationpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.picationpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
          else if(interactionType == 'pi-stacking') {
              this.pistackingpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.pistackingpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
      }
*/

      let residName = atom2.resn + ' $' + atom2.structure + '.' + atom2.chain + ':' + atom2.resi + '@' + atom2.name;

      //if(me.resid2Residhash[oriResidName][residName] === undefined || me.resid2Residhash[oriResidName][residName] > dist) {
         resid2Residhash[oriResidName][residName] = dist.toFixed(1);
      //}

      let resids = atom1.structure + "_" + atom1.chain + "_" + atom1.resi + "_" + atom1.resn
        + ',' + atom2.structure + "_" + atom2.chain + "_" + atom2.resi + "_" + atom2.resn;

      if(!bInternal) {
          if(resids2inter[resids] === undefined) resids2inter[resids] = {};
          if(resids2inter[resids][interactionType] === undefined) resids2inter[resids][interactionType] = {};
          resids2inter[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);
      }

      if(resids2interAll[resids] === undefined) resids2interAll[resids] = {};
      if(resids2interAll[resids][interactionType] === undefined) resids2interAll[resids][interactionType] = {};
      resids2interAll[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);

      return true;
}

function getResiduesFromAtoms(objAll, atomsHash) {
    let residuesHash = {};
    for(let i in atomsHash) {
        let residueid = objAll.atoms[i].structure + '_' + objAll.atoms[i].chain + '_' + objAll.atoms[i].resi;
        residuesHash[residueid] = 1;
    }

    return residuesHash;
}

function atoms2residues(objAll, atomArray) {
     let atoms = {};
     for(let j = 0, jl = atomArray.length; j < jl; ++j) {
         atoms[atomArray[j]] = 1;
     }
     //let residueHash = ic.getResiduesFromCalphaAtoms(atoms);
     let residueHash = getResiduesFromAtoms(objAll, atoms);
     return Object.keys(residueHash);
}

function residueids2spec(objAll, residueArray) {
     let spec = "";
     if(residueArray !== undefined){
         let residueArraySorted = residueArray.sort(function(a, b) {
            if(a !== '' && !isNaN(a)) {
                return parseInt(a) - parseInt(b);
            }
            else {
                let lastPosA = a.lastIndexOf('_');
                let lastPosB = b.lastIndexOf('_');
                if(a.substr(0, lastPosA) < b.substr(0, lastPosB)) return -1;
                else if(a.substr(0, lastPosA) > b.substr(0, lastPosB)) return 1;
                else if(a.substr(0, lastPosA) == b.substr(0, lastPosB)) {
                    if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                    else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                    else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                }
            }
         });
         let prevChain = '', chain, prevResi = 0, resi, lastDashPos, firstDashPos, struturePart, chainPart;
         let startResi;
         let bMultipleStructures = (Object.keys(objAll.structures).length == 1) ? false : true;
         for(let j = 0, jl = residueArraySorted.length; j < jl; ++j) {
             let residueid = residueArraySorted[j];
             lastDashPos = residueid.lastIndexOf('_');
             chain = residueid.substr(0, lastDashPos);
             resi = parseInt(residueid.substr(lastDashPos+1));
             firstDashPos = prevChain.indexOf('_');
             struturePart = prevChain.substr(0, firstDashPos);
             chainPart = prevChain.substr(firstDashPos + 1);
             if(prevChain !== chain) {
                 if(j > 0) {
                     if(prevResi === startResi) {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + ' or ';
                         }
                     }
                     else {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                     }
                 }
                 startResi = resi;
             }
             else if(prevChain === chain) {
                 if(resi !== prevResi + 1) {
                     if(prevResi === startResi) {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + ' or ';
                         }
                     }
                     else {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                     }
                     startResi = resi;
                 }
             }
             prevChain = chain;
             prevResi = resi;
         }
         // last residue
         firstDashPos = prevChain.indexOf('_');
         struturePart = prevChain.substr(0, firstDashPos);
         chainPart = prevChain.substr(firstDashPos + 1);
         if(prevResi === startResi) {
             if(bMultipleStructures) {
                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi;
             }
             else {
                 spec += '.' + chainPart + ':' + startResi;
             }
         }
         else {
             if(bMultipleStructures) {
                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi;
             }
             else {
                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi;
             }
         }
     }
     return spec;
}

function getAllInteractionTable(objAll, type, resids2inter, resids2interAll) {
    let bondCnt = [];

    let residsArray = Object.keys(resids2inter);
    if(type == 'save1') {
       residsArray.sort(function(a,b) {
          return compResid(a, b, type);
       });
    }
    else if(type == 'save2') {
       residsArray.sort(function(a,b) {
          return compResid(a, b, type);
       });
    }
    //resids2inter
    tmpText = '';
    let prevResidname1 = '', prevIds = '';
    let strHbond = '', strIonic = '', strContact = '', strHalegen = '', strPication = '', strPistacking = '';
    let cntHbond = 0, cntIonic = 0, cntContact = 0, cntHalegen = 0, cntPication = 0, cntPistacking = 0;
    for(let i = 0, il = residsArray.length; i < il; ++i) {
        let resids = residsArray[i];
        let residname1_residname2 = resids.split(',');
        let residname1 = (type == 'save1') ? residname1_residname2[0] : residname1_residname2[1];
        let residname2 = (type == 'save1') ? residname1_residname2[1] : residname1_residname2[0];
        // stru_chain_resi_resn
        let ids = residname1.split('_');
        if(i > 0 && residname1 != prevResidname1) {
            bondCnt.push({cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

            tmpText += getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
              cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
            strHbond = ''; strIonic = ''; strContact = ''; strHalegen = ''; strPication = ''; strPistacking = '';
            cntHbond = 0; cntIonic = 0; cntContact = 0; cntHalegen = 0; cntPication = 0; cntPistacking = 0;
        }
        let labels2dist, result;
        labels2dist = resids2inter[resids]['hbond'];
        result = getInteractionPairDetails(objAll, labels2dist, type, 'hbond');
        strHbond += result.html;
        cntHbond += result.cnt;
        labels2dist = resids2inter[resids]['ionic'];
        result = getInteractionPairDetails(objAll, labels2dist, type, 'ionic');
        strIonic += result.html;
        cntIonic += result.cnt;
        labels2dist = resids2inter[resids]['contact'];
        result = getContactPairDetails(objAll, labels2dist, type, 'contact');
        strContact += result.html;
        cntContact += result.cnt;
        labels2dist = resids2inter[resids]['halogen'];
        result = getInteractionPairDetails(objAll, labels2dist, type, 'halogen');
        strHalegen += result.html;
        cntHalegen += result.cnt;
        labels2dist = resids2inter[resids]['pi-cation'];
        result = getInteractionPairDetails(objAll, labels2dist, type, 'pi-cation');
        strPication += result.html;
        cntPication += result.cnt;
        labels2dist = resids2inter[resids]['pi-stacking'];
        result = getInteractionPairDetails(objAll, labels2dist, type, 'pi-stacking');
        strPistacking += result.html;
        cntPistacking += result.cnt;
        prevResidname1 = residname1;
        prevIds = ids;
    }
    bondCnt.push({cntHbond: cntHbond, cntIonic: cntIonic, cntContact: cntContact, cntHalegen: cntHalegen, cntPication: cntPication, cntPistacking: cntPistacking});

    tmpText += getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
    let html = '';
    if(residsArray.length > 0) {
        html += '<br><table class="icn3d-sticky" align=center border=1 cellpadding=10 cellspacing=0><thead>';
        html += '<tr><th rowspan=2>Residue</th><th rowspan=2># Hydrogen<br>Bond</th><th rowspan=2># Salt Bridge<br>/Ionic Interaction</th><th rowspan=2># Contact</th>';
        html += '<th rowspan=2># Halogen<br>Bond</th><th rowspan=2># &pi;-Cation</th><th rowspan=2># &pi;-Stacking</th>';
        html += '<th>Hydrogen Bond</th><th>Salt Bridge/Ionic Interaction</th><th>Contact</th>';
        html += '<th>Halogen Bond</th><th>&pi;-Cation</th><th>&pi;-Stacking</th></tr>';
        html += '<tr>';
        let tmpStr = '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
        html += tmpStr;
        html += tmpStr;
        html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td># Contacts</td><td>Min Distance (&#8491;)</td><td>C-alpha Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
        html += tmpStr;
        html += tmpStr;
        html += tmpStr;
        html += '</tr>';
        html += '</thead><tbody>';
        html += tmpText;
        html += '</tbody></table><br/>';
    }
//    return  html;

    return bondCnt;
}

function compResid(a, b, type) {
  let aArray = a.split(',');
  let bArray = b.split(',');
  let aIdArray, bIdArray;
  if(type == 'save1') {
    aIdArray = getIdArray(aArray[0]); //aArray[0].split('_');
    bIdArray = getIdArray(bArray[0]); //bArray[0].split('_');
  }
  else if(type == 'save2') {
    aIdArray = getIdArray(aArray[1]); //aArray[1].split('_');
    bIdArray = getIdArray(bArray[1]); //bArray[1].split('_');
  }
  let aChainid = aIdArray[0] + '_' + aIdArray[1];
  let bChainid = bIdArray[0] + '_' + bIdArray[1];
  let aResi = parseInt(aIdArray[2]);
  let bResi = parseInt(bIdArray[2]);
  if(aChainid > bChainid){
    return 1;
  }
  else if(aChainid < bChainid){
    return -1;
  }
  else if(aChainid == bChainid){
    return (aResi > bResi) ? 1 : (aResi < bResi) ? -1 : 0;
  }
}

function getIdArray(resid) {
    //let idArray = resid.split('_');
    let idArray = [];
    let pos1 = resid.indexOf('_');
    let pos2 = resid.lastIndexOf('_');
    idArray.push(resid.substr(0, pos1));
    idArray.push(resid.substr(pos1 + 1, pos2 - pos1 - 1));
    idArray.push(resid.substr(pos2 + 1));

    return idArray;
}

function getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
  cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) {
    let tmpText = '';
    tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

    let itemArray = [strHbond, strIonic, strContact, strHalegen, strPication, strPistacking];
    for(let i in itemArray) {
        let item = itemArray[i];
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + item + '</table></td>';
    }
    tmpText += '</tr>';
    return tmpText;
}

function getInteractionPairDetails(objAll, labels2dist, type, interactionType) {
    let pre = 'div0_';
    let tmpText = '', cnt = 0;
    let colorText1 = ' <span style="background-color:#';
    let colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    if(labels2dist !== undefined) {
        for(let labels in labels2dist) {
            let resid1_resid2 = labels.split(',');
            let resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
            let resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
            let resid1Real = convertLabel2Resid(resid1);
            let atom1 = utils.getFirstAtomObj(objAll.residues[resid1Real]);
            let color1;// = atom1.color.getHexString();
            let resid2Real = convertLabel2Resid(resid2);
            let atom2 = utils.getFirstAtomObj(objAll.residues[resid2Real]);
            let color2;// = atom2.color.getHexString();
            let dist = Math.sqrt(labels2dist[labels]).toFixed(1);
            tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + interactionType + '2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + interactionType + '2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + dist + '</td>';
            tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    return {html: tmpText, cnt: cnt};
}

function getContactPairDetails(objAll, labels2dist, type) {
    let pre = 'div0_';
    var tmpText = '', cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    if(labels2dist !== undefined) {
        for(var labels in labels2dist) {
            var resid1_resid2 = labels.split(',');
            var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
            var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
            var resid1Real = convertLabel2Resid(resid1);
            var atom1 = utils.getFirstAtomObj(objAll.residues[resid1Real]);
            var color1; // = atom1.color.getHexString();
            var resid2Real = convertLabel2Resid(resid2);
            var atom2 = utils.getFirstAtomObj(objAll.residues[resid2Real]);
            var color2; // = atom2.color.getHexString();
            var dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
            var dist1 = dist1_dist2_atom1_atom2[0];
            var dist2 = dist1_dist2_atom1_atom2[1];
            var atom1Name = dist1_dist2_atom1_atom2[2];
            var atom2Name = dist1_dist2_atom1_atom2[3];
            var contactCnt = dist1_dist2_atom1_atom2[4];
            tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1Name + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + pre + 'seloneres" id="' + pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2Name + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
            tmpText += '<td align="center"><button class="' + pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            cnt += parseInt(contactCnt);
        }
    }
    return {html: tmpText, cnt: cnt};
}

