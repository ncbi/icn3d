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
    // annotation types: 
    // 1: SNPs
    // 2: ClinVar
    // 3: Conserved Domains
    // 4: Functional Sites
    // 5: 3D Domains
    // 6: Interactions
    // 7: Disulfide Bonds
    // 8: Cross-Linkages
    console.log("Usage: node annotation.js [PDB ID] [annotation type as an integer]");
    return;
}

let pdbid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let annoType = myArgs[1];

let baseUrlMmdb = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=0&complexity=2&uid=";

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

        let result = ic.showAnnoCls.showAnnotations_part1();
        let nucleotide_chainid = result.nucleotide_chainid;
        let chemical_chainid = result.chemical_chainid;
        let chemical_set = result.chemical_set;        

        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
        let url2 = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainlist=" + chnidBaseArray;

        https.get(url2, function(res1) {
            let response1 = [];
            res1.on('data', function (chunk) {
                response1.push(chunk);
            });

            res1.on('end', function(){
                let dataStr = response1.join('');
                let dataJson = JSON.parse(dataStr);

                ic.chainid_seq = dataJson;
                ic.showAnnoCls.processSeqData(ic.chainid_seq);

                ic.showAnnoCls.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);

                // output annotations
                if(annoType == 5 || annoType == 6 || annoType == 7 || annoType == 8) {
                    // 5: 3D Domains
                    if(annoType == 5) {
                        ic.annoDomainCls.showDomainAll();

                        for(let chainid in ic.resid2domain) {
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2domain[chainid]));
                        }
                    }
                    // 6: Interactions
                    else if(annoType == 6) {
                        for(let chainid in ic.protein_chainid) {
                            ic.annoContactCls.showInteraction_base(chainid, chainid)
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2contact[chainid]));
                        }
                    }
                    // 7: Disulfide Bonds
                    else if(annoType == 7) {
                        //ic.applySsbondsCls.applySsbondsOptions();
                        for(let chainid in ic.protein_chainid) {
                            ic.annoSsbondCls.showSsbond_base(chainid, chainid)
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2ssbond[chainid]));
                        }
                    }
                    // 8: Cross-Linkages
                    else if(annoType == 8) {
                        ic.applyClbondsCls.applyClbondsOptions();
                        for(let chainid in ic.protein_chainid) {
                            ic.annoCrossLinkCls.showCrosslink_base(chainid, chainid)
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2crosslink[chainid]));
                        }
                    }
                }
                else {
                    // 3: Conserved Domains
                    // 4: Functional Sites
                    if(annoType == 3 || annoType == 4) {
                        ic.chainid2pssmid = {};

                        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
                        let chnidArray = Object.keys(ic.protein_chainid);
                        // live search
                        let url4 = "https://www.ncbi.nlm.nih.gov/Structure/cdannots/cdannots.fcgi?fmt&frclive&live=lcl&queries=" + chnidBaseArray;
                
                        https.get(url4, function(res1) {
                            let response1 = [];
                            res1.on('data', function (chunk) {
                                response1.push(chunk);
                            });
                
                            res1.on('end', function(){
                                let dataStr = response1.join('');
                                let data4 = JSON.parse(dataStr);
                                //console.log("dataJson: " + dataJson.length);
                
                                ic.annoCddSiteCls.parseCddData([data4], chnidArray);
                                if(annoType == 3) {
                                    for(let chainid in ic.resid2cdd) {
                                        console.log(chainid + '\t' + JSON.stringify(ic.resid2cdd[chainid]));
                                    }
                                }
                                else if(annoType == 4) {
                                    for(let chainid in ic.resid2site) {
                                        console.log(chainid + '\t' + JSON.stringify(ic.resid2site[chainid]));
                                    }
                                }
                            });
                        }).on('error', function(e) {
                            console.error("Error: no conserved domain and sites data...");
                        });
                    }
                    // 1: SNPs
                    // 2: ClinVar
                    else if(annoType == 1 || annoType == 2) {
                        for(let chainid in ic.protein_chainid) {
                            let url3 = 'https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid=' + chainid;

                            https.get(url3, function(res1) {
                                let response1 = [];
                                res1.on('data', function (chunk) {
                                    response1.push(chunk);
                                });
                
                                res1.on('end', function(){
                                    let dataStr = response1.join('');
                                    let data2 = JSON.parse(dataStr);
                                    //console.log("dataJson: " + dataJson.length);
                    
                                    let snpgi = data2.snpgi;
                                    let gi = data2.gi;
                                    if(annoType == 1 && snpgi) {
        let url4 = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_snp=" + chainid;

        https.get(url4, function(res1) {
            let response1 = [];
            res1.on('data', function (chunk) {
                response1.push(chunk);
            });

            res1.on('end', function(){
                let dataStr = response1.join('');
                let data4 = JSON.parse(dataStr);
                //console.log("dataJson: " + dataJson.length);

                if(data4 && data4.data && data4.data.length > 0) {
                    let bSnpOnly = true;
                    let bVirus = true;
                    
                    ic.annoSnpClinVarCls.processSnpClinvar(data4, chainid, chainid, bSnpOnly, bVirus);
                    console.log(chainid + '\t' + JSON.stringify(ic.resid2snp[chainid]));
                }
            });
        }).on('error', function(e) {
            console.error("Error: no snp data...");
        });

                                    }
                                    else if(annoType == 2 && snpgi) {
        let specialGiArray = [6137708,1942289,224510717,2624886,253723219,2554905,75765331,3660278,312207882,319443632,342350956,1827805,109157826,1065265,40889086,6730307,163931185,494469,163931091,60594093,55669745,18655489,17942684,6980537,166235465,6435586,4139398,4389047,364506122,78101667,262118402,20664221,2624640,158430173,494395,28948777,34810587,13399647,3660342,261278854,342350965,384482350,378792570,15988303,213424334,4558333,2098365,10835631,3318817,374074330,332639529,122919696,4389286,319443573,2781341,67464020,194709238,210061039,364506106,28949044,40889076,161172338,17943181,4557976,62738484,365813173,6137343,350610552,17942703,576308,223674070,15826518,1310997,93279697,4139395,255311799,157837067,361132363,357380836,146387678,383280379,1127268,299856826,13786789,1311054,46015217,3402130,381353319,30750059,218766885,340707375,27065817,355333104,2624634,62738384,241913553,304446010];
        let giUsed = snpgi;
        if(specialGiArray.includes(gi)) giUsed = gi;
        let url4 = "https://www.ncbi.nlm.nih.gov/Structure/vastdyn/vastdyn.cgi?chainid_clinvar=" + chainid;

        https.get(url4, function(res1) {
            let response1 = [];
            res1.on('data', function (chunk) {
                response1.push(chunk);
            });

            res1.on('end', function(){
                let dataStr = response1.join('');
                let data4 = JSON.parse(dataStr);
                //console.log("dataJson: " + dataJson.length);

                if(data4 && data4.data && data4.data.length > 0) {
                    let bSnpOnly = false;         
                    ic.annoSnpClinVarCls.processSnpClinvar(data4, chainid, chainid, bSnpOnly);
                    console.log(chainid + '\t' + JSON.stringify(ic.resid2clinvar[chainid]));
                }
            });
        }).on('error', function(e) {
            console.error("Error: no clinvar data...");
        });

                                    }
                                });
                            }).on('error', function(e) {
                                console.error("Error: no nrgi data...");
                            });
                        }
                    }
                }
            });
        }).on('error', function(e) {
            console.error("Error: no sequence data...");
        });
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no MMDB data...");
});
