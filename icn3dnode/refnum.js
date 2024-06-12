// usage: node interaction.js 1TOP A 10 V

// https://github.com/Jam3/three-buffer-vertex-data/issues/2
global.THREE = require('three');
let jsdom = require('jsdom');
global.$ = require('jquery')(new jsdom.JSDOM().window);

let icn3d = require('icn3d');

let https = require('https');

const { exec } = require('child_process');

let fs = require('fs/promises');

let myArgs = process.argv.slice(2);
if(myArgs.length != 1 && myArgs.length != 2) {
    //type: igstrand, kabat, or imgt
    //console.log("Usage: node refnum.js [filename] [type]");
    console.log("Usage: node refnum.js [a list of comma-separated PDB or UniProt IDs (no space)], or node refnum.js [a list of comma-separated PDB or UniProt IDs (no space)] [a template as listed at https://github.com/ncbi/icn3d/tree/master/icn3dnode/refpdb, e.g., CD28_1yjdC_human_V.pdb]");
    return;
}

let idArray = myArgs[0].split(',');
let type = 'igstrand'; //myArgs[1];

let template = (myArgs.length == 2) ? myArgs[1] : undefined; // default undefined
if(template) {
    if(template.substr(0, 1) == '1') template = template.substr(1);
    if(template.substr(-4, 4) == '.pdb') template = template.substr(0, template.length - 4);
}

let me = new icn3d.iCn3DUI({});
me.setIcn3d();
let ic = me.icn3d;
ic.bRender = false;

async function getPdbArray(refpdbArray) {
    let pdbDataArray = [];
    for(let k = 0, kl = refpdbArray.length; k < kl; ++k) {
        let pdbData = await fs.readFile('./refpdb/' + refpdbArray[k] + '.pdb', { encoding: 'utf8' });
        // keep the same format as ajax calls
        pdbDataArray.push({'value': pdbData});
    }

    return pdbDataArray;
}

async function getRefnum(template) {
  try {
    // max ajax calls to get templates
    me.cfg.maxajax = 4;

    // get template PDBs
    // await ic.refnumCls.showIgRefNum();
    ic.refnumCls.setRefPdbs();
    let ref2igtype = ic.ref2igtype;
    let refpdbArray = ic.refpdbArray;
    let refpdbHash = ic.refpdbHash;

    // let pdbAjaxArray = ic.refnumCls.getPdbAjaxArray();
    // let pdbDataArray = await ic.refnumCls.promiseWithFixedJobs(pdbAjaxArray);
    let pdbDataArray = await getPdbArray(ic.refpdbArray);

    // loop through each PDB/UniProt ID
    console.log('[');
    for(let m = 0, ml = idArray.length; m < ml; ++m) {
        let inputid = idArray[m];

        let AFUniprotVersion = 'v4';

        let url = (inputid.length == 4) ? "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=0&complexity=2&uid=" + inputid
            : "https://alphafold.ebi.ac.uk/files/AF-" + inputid + "-F1-model_" + AFUniprotVersion + ".pdb";

        // initialize for each ID
        me = new icn3d.iCn3DUI({});
        me.setIcn3d();
        ic = me.icn3d;
        ic.bRender = false;
        
        ic.ref2igtype = ref2igtype;
        ic.refpdbArray = refpdbArray;
        ic.refpdbHash = refpdbHash;
        ic.pdbDataArray = pdbDataArray;

        await getIdProcessPromise(inputid, url, template);

        ic = null;
        me = null;
    }

    console.log(']');
  } catch (err) {
    console.log(err);
  }
}

function getIdProcessPromise(inputid, url, template) {
    return new Promise(function(resolve, reject) {
        https.get(url, function(res1) {
            let response1 = [];
            res1.on('data', function (chunk) {
                response1.push(chunk);
            });

            res1.on('end', async function(){
                let dataStr = response1.join('');

                await processData(inputid, dataStr, template);

                resolve('success');
            });
        });
    });
};

async function processData(inputid, dataStr, template) {
    if(isNaN(inputid) && inputid.length > 5) {
        let header = 'HEADER                                                        ' + inputid + '\n';
        dataStr = header + dataStr;
        await ic.opmParserCls.parseAtomData(dataStr, inputid, undefined, 'pdb', undefined);
    }
    else {
        let dataJson = JSON.parse(dataStr);
        await ic.mmdbParserCls.parseMmdbData(dataJson);
    }

    let bNoMoreIg = await parseRefPdbData(template);
    let numRound = 0;

    //while(!bNoMoreIg) {
    while(!bNoMoreIg && numRound < 10) {
        let bRerun = true;
        bNoMoreIg = await parseRefPdbData(template, bRerun);
        ++numRound;
    }

    let bNoArraySymbol = true;
    let output = ic.refnumCls.exportRefnum(type, bNoArraySymbol);

    // console.log(output + ',\n');
    console.log(output + '\n');
}


async function parseRefPdbData(template, bRerun) {
    let struArray = Object.keys(ic.structures);

    // let ajaxArray = [];
    let domainidpairArray = [];
    let dataArray2 = [];

    // let urltmalign = me.htmlCls.tmalignUrl;

    if(!ic.resid2domainid) ic.resid2domainid = {};
    //ic.resid2domainid = {};
    ic.domainid2pdb = {};

    let bNoMoreIg = true;
    let bFoundDomain = false;
    for(let i = 0, il = struArray.length; i < il; ++i) {
        let struct = struArray[i];
        let chainidArray = ic.structures[struct];

        for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
            let chainid = chainidArray[j];

            let domainAtomsArray = ic.refnumCls.getDomainAtomsArray(chainid, bRerun);
                
            if(!ic.domainid2refpdbname) ic.domainid2refpdbname = {};
            if(!ic.domainid2score) ic.domainid2score = {};
            
            if(domainAtomsArray.length == 0) {
	        continue;
            }
            
            bFoundDomain = true;

            for(let k = 0, kl = domainAtomsArray.length; k < kl; ++k) {
                bNoMoreIg = false;

                let pdb_target = ic.saveFileCls.getAtomPDB(domainAtomsArray[k], undefined, undefined, undefined, undefined, struct);

                // ig strand for any subset will have the same k, use the number of residue to separate them
                let atomFirst = ic.firstAtomObjCls.getFirstAtomObj(domainAtomsArray[k]);
                let atomLast = ic.firstAtomObjCls.getLastAtomObj(domainAtomsArray[k]);
                let resiSum = atomFirst.resi + ':' + atomLast.resi + ':' + Object.keys(domainAtomsArray[k]).length;
                //let domainid = chainid + '-' + k + '_' + Object.keys(domainAtomsArray[k]).length; 
                let domainid = chainid + ',' + k + '_' + resiSum; 
                ic.domainid2pdb[domainid] = pdb_target;
                
                // clear score
                delete ic.domainid2score[domainid];
                
                ic.domainid2pdb[domainid] = pdb_target;

                if(!template) {
                    for(let index = 0, indexl = ic.pdbDataArray.length; index < indexl; ++index) {
                        let struct2 = ic.defaultPdbId + index;
                        let pdb_query = ic.pdbDataArray[index].value; //[0];
                        let header = 'HEADER                                                        ' + struct2 + '\n';
                        pdb_query = header + pdb_query;

                        domainidpairArray.push(domainid + "|" + ic.refpdbArray[index]);

                        // let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbArray[index]};
                        // let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);

                        // find the highest TM score
                        let result = await getTmscore(ic.refpdbArray[index], pdb_query, pdb_target);
                        let resultJson = JSON.parse(result);
                        dataArray2.push({"value": resultJson});
                    }
                }
                else {
                    ic.domainid2refpdbname[domainid] = [template];
                    domainidpairArray.push(domainid + "|1" + template); // "1" was added for the first round strand-only template
                }
            }
        }
    }
    
    if(!bFoundDomain) {
        return bNoMoreIg;
    }

    if(!template) {
        let bRound1 = true;
        bNoMoreIg = await parseAlignData(dataArray2, domainidpairArray, bRound1);
    }
    else {
        // if(!me.bNode) console.log("Start alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));

        // start round2
        let domainidpairArray3 = [];
        let dataArray3 = [];

        let pdbData = await fs.readFile('./refpdb/' + template + '.pdb', { encoding: 'utf8' });
        let pdbDataArray = [{"value": pdbData}];

        for(let domainid in ic.domainid2refpdbname) {
            let pdb_target = ic.domainid2pdb[domainid];
            for(let index = 0, indexl = pdbDataArray.length; index < indexl; ++index) {
                let struct2 = ic.defaultPdbId + index;
                let pdb_query = pdbDataArray[index].value; //[0];

                let header = 'HEADER                                                        ' + struct2 + '\n';
                pdb_query = header + pdb_query;

                // find the highest TM score
                let result = await getTmscore(template, pdb_query, pdb_target);

                if(result.trim()) {
                    domainidpairArray3.push(domainid + "|" + template);

                    let resultJson = JSON.parse(result);
                    dataArray3.push({"value": resultJson});
                }
            }
        }

        bNoMoreIg = await parseAlignData(dataArray3, domainidpairArray3);
    }

    return bNoMoreIg;
}

async function getTmscore(queryid, pdb_query, pdb_target) {
    let result = "[]";
    let pdbAll = queryid + '\n' + pdb_query + '\n||||||\n' + pdb_target;

    result = await getTmalignPromise(pdbAll);

    return result;
}

function getTmalignPromise(pdbAll) {
    return new Promise(function(resolve, reject) {
        //https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
        const child = exec('./tmalign-icn3dnode', (error, stdout, stderr) => {
            if (error) {
                reject('error');
            }

            resolve(stdout);
        });
        
        //https://stackoverflow.com/questions/37685461/how-to-pass-stdin-to-node-js-child-process
        child.stdin.write(pdbAll);
        child.stdin.end();
    });
};

async function parseAlignData(dataArray, domainidpairArray, bRound1) {
    let bNoMoreIg = false;

    let domainid2segs = ic.refnumCls.parseAlignData_part1(dataArray, domainidpairArray, bRound1);

    if(Object.keys(domainid2segs).length == 0) {
        bNoMoreIg = true;
        return bNoMoreIg;
    }

    if(bRound1) {
        if(!me.bNode) console.log("Start round 2 alignment with the reference culsters " + JSON.stringify(ic.domainid2refpdbname));   

        // start round2
        //let ajaxArray = [];
        let domainidpairArray3 = [];
        let dataArray3 = [];

        // let urltmalign = me.htmlCls.tmalignUrl;
        for(let domainid in ic.domainid2refpdbname) {
            let pdbAjaxArray = [];
            let refpdbnameList = ic.domainid2refpdbname[domainid];
            //let pdbid = domainid.substr(0, domainid.indexOf('_'));
            let chainid = domainid.substr(0, domainid.indexOf(','));

            if(ic.refpdbHash.hasOwnProperty(chainid)) {
                refpdbnameList = [chainid];

                if(!me.bNode) console.log("Adjusted refpdbname for domainid " + domainid + ": " + chainid);   
            }

            let templates = [];
            for(let i = 0, il = refpdbnameList.length; i < il; ++i) {
                let refpdbname = refpdbnameList[i];
                if(!ic.refpdbHash[refpdbname]) continue;
                templates = templates.concat(ic.refpdbHash[refpdbname]);
            }

            // if(!ic.refpdbHash[refpdbname]) {
            if(templates.length == 0) {
                continue;
            }
/*
            for(let k = 0, kl = templates.length; k < kl; ++k) {
                let urlpdb = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi?refpdbid=" + templates[k];

                let pdbAjax = me.getAjaxPromise(urlpdb, 'text');

                pdbAjaxArray.push(pdbAjax);
            }

            let pdbDataArray = await ic.refnumCls.promiseWithFixedJobs(pdbAjaxArray);
*/

            let pdbDataArray = await getPdbArray(templates);

            let pdb_target = ic.domainid2pdb[domainid];
            for(let index = 0, indexl = pdbDataArray.length; index < indexl; ++index) {
                let struct2 = ic.defaultPdbId + index;
                //let pdb_query = (me.bNode) ? pdbDataArray[index] : pdbDataArray[index].value; //[0];
                let pdb_query = pdbDataArray[index].value; //[0];
                let header = 'HEADER                                                        ' + struct2 + '\n';
                pdb_query = header + pdb_query;

                domainidpairArray3.push(domainid + "|" + templates[index]);

                // let dataObj = {'pdb_query': pdb_query, 'pdb_target': pdb_target, "queryid": ic.refpdbHash[refpdbname][index]};
                // let alignAjax = me.getAjaxPostPromise(urltmalign, dataObj);

                // find the highest TM score
                let result = await getTmscore(templates[index], pdb_query, pdb_target);
                let resultJson = (result && result != '\n' && result != '[]') ?  JSON.parse(result) : []

                dataArray3.push({"value": resultJson});
            }
        }

        bNoMoreIg = await parseAlignData(dataArray3, domainidpairArray3, false);
        
        // end of round 2
        return bNoMoreIg;
    }

    ic.refnumCls.parseAlignData_part3(domainid2segs);

    return bNoMoreIg;
}

getRefnum(template);
