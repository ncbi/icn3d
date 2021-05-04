// usage: node cdsearch.js [accession] [feats or hits]

let http = require('http');
let https = require('https');
let utils = require('./utils.js');

let axios = require('axios');
let qs = require('querystring');

let myArgs = process.argv.slice(2);
if(myArgs.length != 2) {
    console.log("Usage: node cdsearch.js [accession] [feats or hits]");
    return;
}

let queries = myArgs[0].toUpperCase(); //e.g., YP_009724390

let tdata = myArgs[1]; //'feats'; // or 'hits';

let acc2pdbids = {};

/*
// > 50% seq identity
acc2pdbids['YP_009724390'] = '6XR8,7CWM,6ZWV,7C2L,6XCM,6ZGG,6ZGE,7BYR,6VSB,6Z43,6VXX,6VYB,6X6P,6X29,6X2C,6X2A,6ZGF,6ACC,5WRG,5X58,6NB6,6CRV,6CRW,6M3W,6XE1,6XDG,6M0J,6W41,6M17,7BWJ,6LZG,6YLA,6YZ5,6YOR,7C8V,6Z2M,6ZCZ,6VW1,6X79,6XF5,6XKL,6XLU,6XS6,6ZB4,6ZOW,6ZOX,6ZOY,6ZP0,6ZP1,7A25,7A4N,7A5R,7A91,7BBH,7CAB,7CAI,7CHH,7CN9,7CWS,7DCC,7JJI,7JWB,7K8S,7KDG,7KDI,7KDJ,7KDK,7KJ2,7KL9,7KMB,7L02,7KNI';
acc2pdbids['YP_009724391'] = '6XDC';
acc2pdbids['YP_009724392'] = '5X29,2MM4';
acc2pdbids['YP_009724395'] = '1XAK,1YO4,6W37';
acc2pdbids['YP_009724396'] = '7JTL,7JX6';
acc2pdbids['YP_009724397'] = '6YI3,6M3M,1SSK,6WKP,6VYO,2OFZ,6WZQ,6WJI,6YUN,7C22,2CJR,2GIB,4UD1,3HD4,6G13,2GEC,2BXX,2BTL,5N4K,2GDT,6KL2,7CDZ,7CE0';
acc2pdbids['YP_009725298'] = '1JWH,4NH1,1RQF,3EED';
acc2pdbids['YP_009725299'] = '6WUU,6XAA,6XA9,6W9C,6WZU,6YVA,6WRH,5E6J,4M0W,5TL6,3MJ5,2FE8,5Y3E,3E9S,4OVZ,4OVZ,2W2G,6WOJ,6WEY,6YWK,6VXS,2KQV,2ACF,2FAV,2JZF,2JZD,2K87,2GRI,5RS7,5RVJ,6Z5T,7C33,7CJD,7CJM,7CMD,7D47,7D6H,7JRN,7KAG,7KG3,7KQW';
acc2pdbids['YP_009725300'] = '3VCB,3VC8,3GZF,1MOW';
acc2pdbids['YP_009725301'] = '6XA4,7BRO,5R7Y,6XB0,6M0K,6WTT,6LZE,3M3V,2A5K,3E91,1UJ1,1WOF,3F9E,2PWX,5B6O,4HI3,2QC2,3M3T,3M3S,3EA9,1Z1J,3F9F,2QCY,2Q6G,3ATW,1Q2W,2ALV,2VJ1,4MDS,2OP9,3SNA,2QIQ,3FZD,3F9G,3D62,2YNA,3D23,4RSP,4WMD,4YLU,5WKJ,6JIJ,6W2A,6XHL,6XMK,6XOA,7AKU,7AOL,7AR5,7C2Q,7C2Y,7CBT,7CWC,7JOY,7JPZ,7JR4,7KFI,7KVG';
acc2pdbids['YP_009725303'] = '7BV1,6X2G,6WIQ,6M71,7C2K,2AHM,6NUR,1YSY,6M5I,6YHU,3UB0,6XEZ,6XQB,7D4F,7JLT';
acc2pdbids['YP_009725304'] = '7BV1,6X2G,6YYT,6M5I,7C2K,6NUR,2AHM,5F22,6WIQ,6YHU,3UB0,6XEZ,6XQB';
acc2pdbids['YP_009725305'] = '6W9Q,6W4B,6WXD,1UW7,1QZ8,3EE7,6WC1';
acc2pdbids['YP_009725306'] = '6W4H,6W61,7C2I,7BQ7,2G9T,5C8S,5NFY,3R24,6YZ1,6ZCT,2FYG,2XYQ,2XYV,5YN5,7JYY';
acc2pdbids['YP_009725307'] = '7C2K,6X2G,6M71,6YYT,7BV1,7BW4,6NUR,6XEZ,6XQB,7AAP,7CXM,7D4F';
acc2pdbids['YP_009725308'] = '6ZSL,5RL6,6XEZ,6JYT,5WWP';
acc2pdbids['YP_009725309'] = '5C8S,5C8T,5NFY';
acc2pdbids['YP_009725310'] = '6XDH,2OZK,2RHB,2H85,5YVD,2GTH,2GTI,4RS4,4S1T,5S6X,6VWW,7K0R,7K9P';
acc2pdbids['YP_009725311'] = '6W4H,6YZ1,7BQ7,7C2I,6W61,3R24,2XYR,2XYQ,5YN5,7JYY';
*/

// > 95% seq identity
acc2pdbids['YP_009724390'] = '6XR8,7CWL,6ZWV,7C2L,6ZOW,7JJI,6ZB4,7K8S,6XCM,7A5R,6ZGG';
acc2pdbids['YP_009724391'] = '6XDC';
acc2pdbids['YP_009724392'] = '7K3G';
acc2pdbids['YP_009724395'] = '6W37';
acc2pdbids['YP_009724396'] = '7JTL,7JX6';
acc2pdbids['YP_009724397'] = '6YI3,6M3M,7CDZ,6WKP,6VYO,6WZQ,6WJI,6YUN,7C22,7DE1,2CJR,7CE0,2GIB';
acc2pdbids['YP_009725298'] = '';
acc2pdbids['YP_009725299'] = '7CMD,6WUU,7CJD,6XA9,6XAA,7D47,6W9C,7JRN,6WZU,7D6H,6YVA,7CJM_B,6WRH';
acc2pdbids['YP_009725300'] = '3VC8';
acc2pdbids['YP_009725301'] = '7CBT,6XA4,7CWC,7BRO,5R7Y,7KFI,6XMK,7AKU,7AOL,6XOA,7KVG,7JOY,6XB0,7JR4,7AR5,6WTT,6M0K,6LZE,7JPZ,7C2Y,1UJ1,2A5K,6XHL,1WOF,3E91,3M3V,5B6O,3F9E,3M3S,2PWX,2QC2,4HI3,1Z1J,3EA9,7C2Q,3M3T,2QCY,3ATW,3F9F,2Q6G,1Q2W,6W2A,2VJ1,2ALV,4MDS,3SNA,2OP9,2QIQ,3FZD,3F9G,3D62';
acc2pdbids['YP_009725303'] = '7BV1,6XQB,2AHM,7C2K,6XEZ,1YSY,6NUR,6WIQ,6M71,7JLT,7D4F,6M5I,6YHU';
acc2pdbids['YP_009725304'] = '7BV1,6XQB,7C2K,6M5I,6XEZ,2AHM_E,6YYT,6NUR,6WIQ,6YHU';
acc2pdbids['YP_009725305'] = '6W9Q,1UW7,3EE7,6W4B,6WC1,1QZ8';
acc2pdbids['YP_009725306'] = '7C2I,6W61,7JYY,6W4H,7BQ7,2G9T,5C8S,3R24,5NFY_M,2FYG,6YZ1,6ZCT,2XYQ,2XYV';
acc2pdbids['YP_009725307'] = '7AAP,7D4F,6XEZ,7BV1,6XQB,6YYT,7C2K,6M71,7CXM,7BW4,6NUR';
acc2pdbids['YP_009725308'] = '6XEZ,6ZSL,5RL6,6JYT';
acc2pdbids['YP_009725309'] = '5C8S,5C8T,5NFY';
acc2pdbids['YP_009725310'] = '6XDH,6VWW,7K9P,5S6X,7K0R';
acc2pdbids['YP_009725311'] = '7C2I,6YZ1,7BQ7,7JYY,6W4H,6W61';

let pdbids = (acc2pdbids.hasOwnProperty(queries)) ? acc2pdbids[queries] : '';
//let pdbidsShort = (pdbids.length > 9) ? pdbids.substr(0, 9) + '...' : pdbids;
let pdbidsShort = pdbids;

// get sequence
let g_seqArray;

let urlSeq = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&retmode=json&rettype=fasta&id=" + queries;
https.get(urlSeq, function(resSeq) {
  let responseSeq = [];
  resSeq.on('data', function (chunk) {
      responseSeq.push(chunk);
  });

  resSeq.on('end', function(){
      let dataStrSeq = responseSeq.join('');
      //console.log("dataStrSeq: " + dataStrSeq);

      let strArray = dataStrSeq.split('\n');
      strArray.shift();
      let allSeq = strArray.join('');
      g_seqArray = allSeq.split('');
  });
}).on('error', function(e) {
  utils.dumpError(e);
});

// smode=auto: retrieve pre-computed results from CDART
//let url = 'https://www.ncbi.nlm.nih.gov/Structure/bwrpsb/bwrpsb.cgi?queries=' + queries + '&tdata=' + tdata + '&cddefl=false&qdefl=false&smode=auto&useid1=true&maxhit=250&filter=true&db=cdd&evalue=0.01&dmode=rep&clonly=false';
// smode=live: retrieve live search results from CDART
let url = 'https://www.ncbi.nlm.nih.gov/Structure/bwrpsb/bwrpsb.cgi?queries=' + queries + '&tdata=' + tdata + '&cddefl=false&qdefl=false&smode=live&useid1=true&maxhit=250&filter=true&db=cdd&evalue=0.01&dmode=rep&clonly=false';

// get cdsid
https.get(url, function(res1) {
    let response1 = [];
    res1.on('data', function (chunk) {
        response1.push(chunk);
    });

    res1.on('end', function(){
      let dataStr1 = response1.join('');
      //console.log("dataStr1: " + dataStr1);
      let lineArray1 = dataStr1.split('\n');
      let cdsid = '';
      for(let i = 0, il = lineArray1.length; i < il; ++i) {
          if(lineArray1[i].substr(0, 6) == '#cdsid') {
              cdsid = lineArray1[i].substr(6).trim()
              //console.log("cdsid: " + cdsid);
              break;
          }
      }

      // wait for 5 secs to get data
      setTimeout(function(){
          let url2 = 'https://www.ncbi.nlm.nih.gov/Structure/bwrpsb/bwrpsb.cgi?cdsid=' + cdsid + '&tdata=' + tdata + '&cddefl=false&qdefl=false&smode=live&useid1=true&maxhit=250&filter=true&db=cdd&evalue=0.01&dmode=rep&clonly=false';

          https.get(url2, function(res2) {
              let response2 = [];
              res2.on('data', function (chunk) {
                  response2.push(chunk);
              });

              res2.on('end', function(){
                  let dataStr2 = response2.join('');
                  //console.log("dataStr2: " + dataStr2);

                  let lineArray2 = dataStr2.split('\n');
                  //console.log('Accession\tPosition\tResidue\tDomain\tDomain_name\tsite\tsite_type\t3D_examples');

                  let pssmidHash = {};
                  for(let i = 0, il = lineArray2.length; i < il; ++i) {
                      if(lineArray2[i].substr(0, 2) == 'Q#') {
                          let fieldArray = lineArray2[i].split('\t');
                          //let site_type = fieldArray[2];
                          //let residueList = fieldArray[3];
                          let pssmid = (tdata == 'feats') ? fieldArray[6] : fieldArray[2]; // feats or hits
                          pssmidHash[pssmid] = 1;
                      }
                  }

                  let pssmidArray = Object.keys(pssmidHash);

                  if(pssmidArray.length == 0) return;

                  let idlist = '';
                  let url3 = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=cdd&retmode=json&rettype=docsum&id=' + pssmidArray.join();

                  // get cdd ID and domain name
                  https.get(url3, function(res3) {
                      let response3 = [];
                      res3.on('data', function (chunk) {
                          response3.push(chunk);
                      });

                      res3.on('end', function(){
                          let dataStr3 = response3.join('');
                          //console.log("dataStr3: " + dataStr3);

                          let cddData = JSON.parse(dataStr3).result;

                          let pssmid2idname = {};
                          for(let pssmid in cddData) {
                              let cddid = cddData[pssmid].accession;
                              let domainName = cddData[pssmid].title;

                              pssmid2idname[pssmid] = [cddid, domainName];
                          }

                          let bFirst = true;
                          for(let i = 0, il = lineArray2.length; i < il; ++i) {
                              if(lineArray2[i].substr(0, 2) == 'Q#') {
                                  let fieldArray = lineArray2[i].split('\t');
                                  let site_type = (tdata == 'feats') ? fieldArray[2] : fieldArray[1];
                                  let residueList = (tdata == 'feats') ? fieldArray[3] : fieldArray[3] + '-' + fieldArray[4];
                                  let pssmid = (tdata == 'feats') ? fieldArray[6] : fieldArray[2]; // feats or hits

                                  let residueArrayOut = residueList.split(',');
                                  for(let j = 0, jl = residueArrayOut.length; j < jl; ++j) {
                                      let residue = residueArrayOut[j];

                                      let resiArray = [];
                                      if(residue.indexOf('-') != -1) {
                                          let start_end = residue.split('-');

                                          let start, end;
                                          // feats: E16-V24
                                          // hits: 16-24
                                          if(tdata == 'feats') {
                                              start = parseInt(start_end[0].substr(1));
                                              end = parseInt(start_end[1].substr(1));
                                          }
                                          else {
                                              start = parseInt(start_end[0]);
                                              end = parseInt(start_end[1]);
                                          }

                                          for(let k = start; k <= end; ++k) {
                                              resiArray.push(k);
                                          }
                                      }
                                      else {
                                          let resi = parseInt(residue.substr(1));
                                          resiArray.push(resi);
                                      }

                                      for(let k = 0, kl = resiArray.length; k < kl; ++k) {
                                          let resi = resiArray[k];
                                          let resn = g_seqArray[resi-1];

                                          let pdbidsFinal = (bFirst) ? pdbids : pdbidsShort;
                                          bFirst = false;
                                          console.log(queries + '\t' + resi + '\t' + resn + '\t' + pssmid2idname[pssmid][0]
                                            + '\t' + pssmid2idname[pssmid][1] + '\t' + (j+1).toString() + '\t' + site_type + '\t' + pdbidsFinal);
                                      }
                                  }
                              }
                          } // end for
                      });
                  }).on('error', function(e) {
                      utils.dumpError(e);
                  }); // end of 3rd https
              });
          }).on('error', function(e) {
              utils.dumpError(e);
          }); // end of 2nd https
      }, 30000);
    });
}).on('error', function(e) {
    utils.dumpError(e);
});

/*
let url = 'https://www.ncbi.nlm.nih.gov/Structure/bwrpsb/bwrpsb.cgi';
let tdata = 'hits'; // or 'feats'
let dataObj = {'queries': queries, tdata: tdata, cdsid: "", cddefl: "false", qdefl: "false", smode: "live", useid1: "true", maxhit: 250, filter: "true", db: "cdd", evalue: 0.01, dmode: "rep", clonly: "false"};

//https://attacomsian.com/blog/node-http-post-request
// 'https' didn't work for posting PDB data, use 'application/x-www-form-urlencoded'
const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

axios.post(url, qs.stringify(dataObj), config)
.then(function(res) {
  //console.log(`Status: ${res.status}`);
  //console.log('Body: ', res.data);
})
.catch(function(err) {
  //console.error("scap.cgi error..." + err);
  utils.dumpError(err);
});
*/
