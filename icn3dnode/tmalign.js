// usage: node interaction.js 1TOP A 10 V

// https://github.com/Jam3/three-buffer-vertex-data/issues/2
//global.THREE = require('three');
let jsdom = require('jsdom');
global.$ = require('jquery')(new jsdom.JSDOM().window);

let icn3d = require('icn3d');

let https = require('https');

const { exec } = require('child_process');

let fs = require('fs/promises');

let myArgs = process.argv.slice(2);
if(myArgs.length != 2) {
    console.log("Usage: node tmalign.js path/query.pdb path/target.pdb");
    return;
}

let queryFile = (myArgs[0].indexOf('/') == -1) ? './' + myArgs[0] : myArgs[0];
let targetFile = (myArgs[1].indexOf('/') == -1) ? './' + myArgs[1] : myArgs[1];

let me = new icn3d.iCn3DUI({});
me.setIcn3d();
let ic = me.icn3d;
ic.bRender = false;

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

async function getTmalignPerPair(queryPdb, targetPdb, domainpair) {
	let queryid = "stru";
	let pdbAll = queryid + '\n' + queryPdb + '\n||||||\n' + targetPdb;

	let result = await getTmalignPromise(pdbAll);
	let resultJson = JSON.parse(result);

	console.log("Domains: " + domainpair + "; TM-score: " + resultJson[0].score + "; RMSD: " + resultJson[0].super_rmsd + "; aligned residues: " + resultJson[0].num_res);
}

function getDomains(resid2domainArray) {
	let domain2residhash = {};
	for(let i = 0, il = resid2domainArray.length; i < il; ++i) {
		let item = resid2domainArray[i];
		let resid = Object.keys(item)[0];
		let domain = item[resid];
		domain2residhash[domain] = me.hashUtilsCls.unionHash(domain2residhash[domain], ic.residues[resid]);
	}

	return domain2residhash;
}

async function getAllTmalign() {
	const queryPdb = await fs.readFile(queryFile, { encoding: 'utf8' });
	const targetPdb = await fs.readFile(targetFile, { encoding: 'utf8' });

	// get alignment for full structures
	await getTmalignPerPair(queryPdb, targetPdb, 'chain_chain');

	let data = queryPdb + "\nENDMDL\n" + targetPdb;
	await ic.pdbParserCls.loadPdbData(data);

    let bNotShowDomain = true;
    ic.annoDomainCls.showDomainAll(bNotShowDomain);

	// check the first two chains
	let cnt = 0;
	let resid2domainArray1 = [], resid2domainArray2 = [];
	for(let chainid in ic.resid2domain) {
		if(cnt == 0) resid2domainArray1 = ic.resid2domain[chainid];
		else resid2domainArray2 = ic.resid2domain[chainid];

		++cnt;
		if(cnt == 2) break;
	}

	let domain2residhash1 = getDomains(resid2domainArray1);
	let domain2residhash2 = getDomains(resid2domainArray2);

	for(let domain1 in domain2residhash1) {
		let residHash1 = domain2residhash1[domain1];
		let pdb1 = ic.saveFileCls.getAtomPDB(residHash1);

		for(let domain2 in domain2residhash2) {
			let residHash2 = domain2residhash2[domain2];
			let pdb2 = ic.saveFileCls.getAtomPDB(residHash2);

			await getTmalignPerPair(pdb1, pdb2, domain1 + '_' + domain2);
		}
	}
}

getAllTmalign();


