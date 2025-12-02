let jsdom = require('jsdom');
global.$ = require('jquery')(new jsdom.JSDOM().window);

let icn3d = require('icn3d');
let me = new icn3d.iCn3DUI({});
let https = require('https');

let myArgs = process.argv.slice(2);
if(myArgs.length != 2) {
    // replace [...] with actual parameters. The double quotes around the commands are required.
    console.log('Usage: node general_id_cmd.js [PDB or ALphaFold ID] "[commands]"');
    return;
}

let inputid = myArgs[0].toLowerCase(); 
// convert new PDB ID format to old PDB ID format
if(inputid.substr(0,8) == 'pdb_0000') inputid = inputid.substr(8);
inputid = inputid.toUpperCase();
let commands = myArgs[1];

let AFUniprotVersion = 'v6';

let url = (inputid.length == 4) ? "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=0&complexity=2&uid=" + inputid
    : "https://alphafold.ebi.ac.uk/files/AF-" + inputid + "-F1-model_" + AFUniprotVersion + ".pdb";

https.get(url, function(res1) {
    let response1 = [];
    res1.on('data', function (chunk) {
        response1.push(chunk);
    });

    res1.on('end', async function(){
      let dataStr = response1.join('');

      me.setIcn3d();
      let ic = me.icn3d;

      ic.bRender = false;

      if(isNaN(inputid) && inputid.length > 5) {
        let header = 'HEADER                                                        ' + inputid + '\n';
        dataStr = header + dataStr;
        await ic.opmParserCls.parseAtomData(dataStr, inputid, undefined, 'pdb', undefined);
      }
      else {
        let dataJson = JSON.parse(dataStr);
        await ic.mmdbParserCls.parseMmdbData(dataJson);
      }

      await ic.loadScriptCls.loadScript(commands, undefined, true);
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no 3D coordinate data...");
});
