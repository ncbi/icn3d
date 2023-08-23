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
    // 9: PTM (UniProt)Transmembrane
    console.log("Usage: node annotation.js [PDB or AlphaFold UniProt ID] [annotation type as an integer]");
    return;
}

let inputid = myArgs[0].toUpperCase(); //'6jxr'; //myArgs[0];
let annoType = myArgs[1];
let AFUniprotVersion = 'v4';

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

            res1.on('end', async function(){
                let dataStr = response1.join('');
                let dataJson = JSON.parse(dataStr);

                ic.chainid_seq = dataJson;

                await ic.showAnnoCls.processSeqData(ic.chainid_seq);

                await ic.showAnnoCls.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);

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

                    // 9: PTM (UniProt)
                    // 10: Transmembrane
                    else if(annoType == 9 || annoType == 10) {

                        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
                        let chnidArray = Object.keys(ic.protein_chainid);

                        for(let chainid in ic.protein_chainid) {
                            let structure = chainid.substr(0, chainid.indexOf('_'));
                            let chain = chainid.substr(chainid.indexOf('_') + 1);

                            // UniProt ID
                            if( structure.length > 5 ) {
                                let url4 =  "https://www.ebi.ac.uk/proteins/api/features/" + structure;

                                https.get(url4, function(res1) {
                                    let response1 = [];
                                    res1.on('data', function (chunk) {
                                        response1.push(chunk);
                                    });

                                    res1.on('end', function(){
                                        let dataStr = response1.join('');
                                        let data4 = JSON.parse(dataStr);
                                        //console.log("dataJson: " + dataJson.length);

                                        if(annoType == 9) {
                                            ic.annoPTMCls.parsePTM(data4, chainid, 'ptm');

                                            for(let chainid in ic.resid2ptm) {
                                                console.log(chainid + '\t' + JSON.stringify(ic.resid2ptm[chainid]));
                                            }
                                        }
                                        else if(annoType == 10) {
                                            ic.annoPTMCls.parsePTM(data4, chainid, 'transmem');

                                            for(let chainid in ic.resid2transmem) {
                                                console.log(chainid + '\t' + JSON.stringify(ic.resid2transmem[chainid]));
                                            }
                                        }
                                    });
                                }).on('error', function(e) {
                                    console.error("Error: no conserved domain and sites data...");
                                });
                            }
                            else {
                                // https://www.ebi.ac.uk/pdbe/api/doc/
                                let structLower = structure.substr(0, 4).toLowerCase();
                                let urlMap = "https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/" + structLower;

                                https.get(urlMap, function(res1) {
                                    let response1 = [];
                                    res1.on('data', function (chunk) {
                                        response1.push(chunk);
                                    });

                                    res1.on('end', function(){
        let dataMapStr = response1.join('');
        let dataMap = JSON.parse(dataMapStr);

        let UniProtID = '';
        if(!ic.UPResi2ResiPosPerChain) ic.UPResi2ResiPosPerChain = {};
        ic.UPResi2ResiPosPerChain[chainid] = {};

        let mapping = dataMap[structLower].UniProt;

        let bFound = false;
        for(let up in mapping) {
            let chainArray = mapping[up].mappings;
            if(bFound) break;

            for(let i = 0, il = chainArray.length; i < il; ++i) {
            //"entity_id": 3, "end": { "author_residue_number": null, "author_insertion_code": "", "residue_number": 219 }, "chain_id": "A", "start": { "author_residue_number": 94, "author_insertion_code": "", "residue_number": 1 }, "unp_end": 312, "unp_start": 94, "struct_asym_id": "C"
                let chainObj = chainArray[i];
                if(chainObj.chain_id == chain) {
                    let start = chainObj.unp_start;
                    let end = chainObj.unp_end;
                    let posStart = chainObj.start.residue_number;
                    let posEnd = chainObj.end.residue_number;

                    if(posEnd - posStart != end - start) {
                        //console.log("There might be some issues in the PDB to UniProt residue mapping.");
                    }

                    for(let j = 0; j <= end - start; ++j) {
                        ic.UPResi2ResiPosPerChain[chainid][j + start] = j + posStart - 1; // 0-based
                    }

                    UniProtID = up;
                    bFound = true;
                    break;
                }
            }
        }

        if(UniProtID != '') {
            let url4 =  "https://www.ebi.ac.uk/proteins/api/features/" + UniProtID;

            https.get(url4, function(res1) {
                let response1 = [];
                res1.on('data', function (chunk) {
                    response1.push(chunk);
                });

                res1.on('end', function(){
                    let dataStr = response1.join('');
                    let data4 = JSON.parse(dataStr);
                    //console.log("dataJson: " + dataJson.length);

                    if(annoType == 9) {
                        ic.annoPTMCls.parsePTM(data4, chainid, 'ptm');

                        for(let chainid in ic.resid2ptm) {
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2ptm[chainid]));
                        }
                    }
                    else if(annoType == 10) {
                        ic.annoPTMCls.parsePTM(data4, chainid, 'transmem');

                        for(let chainid in ic.resid2transmem) {
                            console.log(chainid + '\t' + JSON.stringify(ic.resid2transmem[chainid]));
                        }
                    }
                });
            }).on('error', function(e) {
                console.error("Error: no conserved domain and sites data...");
            });
        }
                                    });
                                }).on('error', function(e) {
                                    console.error("Error: no conserved domain and sites data...");
                                });
                            }
                        }
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
    console.error("Error: " + inputid + " has no MMDB data...");
});
