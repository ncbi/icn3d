// usage: node iedb.js

/*
Please install the following three packages in your directory with the file interaction.js
npm install axios
npm install querystring
*/

//let THREE = require('../share/node_modules/three');

let http = require('http');
let https = require('https');
/*
let utils = require('../share/utils.js');
let para = require('../share/para.js');
let loadMmdb = require('../share/loadMmdb.js');
let loadPdb = require('../share/loadPdb.js');
//let getPdbStr = require('../share/getPdbStr.js');
let pickCustomSphere = require('../share/pickCustomSphere.js');
*/

let axios = require('../share/node_modules/axios');
let qs = require('../share/node_modules/querystring');

let myArgs = process.argv.slice(2);
if(myArgs.length != 0) {
    console.log("Usage: node iedb.js");
    return;
}

//let url = "http://query-api.iedb.org/bcell_search?source_antigen_source_org_name=eq.SARS-CoV2";
let url = "http://query-api.iedb.org/bcell_search?source_antigen_source_org_iri=eq.NCBITaxon%3A2697049";

http.get(url, function(res1) {
    let response1 = [];
    res1.on('data', function (chunk) {
        response1.push(chunk);
    });

    res1.on('end', function(){
      let dataStr = response1.join('');
      let dataJson = JSON.parse(dataStr);
      //console.log("dataJson: " + dataJson.length);

      console.log(getEpitope(dataJson));
    });
}).on('error', function(e) {
    console.error("Error: " + pdbid + " has no Epitope data...");
});

function getEpitope(data) {
    let output = '';

/*
pubmed_id   epitope object_type description starting_position   ending_position non_peptidic_epitope    antigen_name        parent_protein  comments    pdb_id
pubmed_id   structure_id    structure_type  epitope_description (need to process): "R346, N440, L441, K444, V445, G446, N448, Y449, Q4...<br/>surface glycoprotein [Severe acute respiratory syndrome coronavirus 2]<br/>SARS-CoV2"             source_antigen_name     source_antigen_iri : "UNIPROT:P0DTC2"       pdb_id : null
Linear peptide  CCSCGSCCKFDEDDSEPVLKGVKL<br/>surface glycoprotein [Severe acute respiratory syndrome coronavirus 2] (1247-1270)<br/>SARS-CoV2               "Spike glycoprotein"
host_organism_iri : "NCBITaxon:9606"
*/

    const nameHash = {};

    nameHash['spike glycoprotein'] = 'surface glycoprotein';
    nameHash['two components:spike glycoprotein & spike glycoprotein'] = 'surface glycoprotein';
    nameHash['nucleoprotein'] = 'nucleocapsid phosphoprotein';
    nameHash['envelope small membrane protein'] = 'envelope protein';
    nameHash['membrane protein'] = 'membrane glycoprotein';
    nameHash['replicase polyprotein 1ab'] = 'ORF1ab protein';
    nameHash['orf3a protein'] = 'ORF3a protein';

    let lineHash = {}, outcomeHash = {};
    for(let i = 0, il = data.length; i < il; ++i) {
        let item = data[i];
        if(item.host_organism_iri != 'NCBITaxon:9606') continue;
        if(item.qualitative_measure == 'Negative') continue; // other types: 'Positive', 'Positive-Intermediate', 'Positive-Low', 'Positive-High'

        const pubmed_id = item.pubmed_id;
        const epitope = item.structure_id;

        const object_type = item.structure_type;
        let description = item.epitope_summary; //item.epitope_description;
        let structure_description = item.structure_description;

        let antigen_name = (item.source_antigen_name) ? item.source_antigen_name.toLowerCase() : '';
        if(nameHash.hasOwnProperty(antigen_name)) {
            antigen_name = nameHash[antigen_name];
        }

        let starting_position = '', ending_position = '';
        if(description) {
            //const pos = description.indexOf('<br');
            if(object_type == 'Linear peptide') {
                //const posLeft = description.indexOf('(');
                //const posRight = description.indexOf(')');
                //const range = description.substr(posLeft + 1, posRight - posLeft - 1);
                //const start_end = range.split('-');

                description = structure_description; //description.substr(0, pos);
                //starting_position = start_end[0];
                //ending_position = start_end[1];

                // e.g., TWFHAIHVSGTNGTKRFDNPVLP + GLUC(N19)
                var posSpace = description.indexOf(' ');
                if(posSpace != -1) {
                    description = description.substr(0, posSpace);
                }

                starting_position= item.structure_starting_position;
                ending_position= item.structure_ending_position;

                // convert ORF1ab protein
                if(antigen_name == 'ORF1ab protein') {
                    if(starting_position > 0 && starting_position <= 180) {
                        antigen_name = 'nsp1';
                        starting_position -= 0;
                        ending_position -= 0;
                    }
                    else if(starting_position > 180 && starting_position <= 818) {
                        antigen_name = 'nsp2';
                        starting_position -= 180;
                        ending_position -= 180;
                    }
                    else if(starting_position > 818 && starting_position <= 2763) {
                        antigen_name = 'nsp3';
                        starting_position -= 818;
                        ending_position -= 818;
                    }
                    else if(starting_position > 2763 && starting_position <= 3263) {
                        antigen_name = 'nsp4';
                        starting_position -= 2763;
                        ending_position -= 2763;
                    }
                    else if(starting_position > 3263 && starting_position <= 3569) {
                        antigen_name = 'nsp5';
                        starting_position -= 3263;
                        ending_position -= 3263;
                    }
                    else if(starting_position > 3569 && starting_position <= 3859) {
                        antigen_name = 'nsp6';
                        starting_position -= 3569;
                        ending_position -= 3569;
                    }
                    else if(starting_position > 3859 && starting_position <= 3942) {
                        antigen_name = 'nsp7';
                        starting_position -= 3859;
                        ending_position -= 3859;
                    }
                    else if(starting_position > 3942 && starting_position <= 4140) {
                        antigen_name = 'nsp8';
                        starting_position -= 3942;
                        ending_position -= 3942;
                    }
                    else if(starting_position > 4140 && starting_position <= 4253) {
                        antigen_name = 'nsp9';
                        starting_position -= 4140;
                        ending_position -= 4140;
                    }

                    else if(starting_position > 4253 && starting_position <= 4392) {
                        antigen_name = 'nsp10';
                        starting_position -= 4253;
                        ending_position -= 4253;
                    }
                    else if(starting_position > 4392 && starting_position <= 5324) {
                        antigen_name = 'RNA-dependent RNA polymerase';
                        starting_position -= 4392;
                        ending_position -= 4392;
                    }
                    else if(starting_position > 5324 && starting_position <= 5925) {
                        antigen_name = 'nsp13';
                        starting_position -= 5324;
                        ending_position -= 5324;
                    }
                    else if(starting_position > 5925 && starting_position <= 6452) {
                        antigen_name = 'nsp14';
                        starting_position -= 5925;
                        ending_position -= 5925;
                    }
                    else if(starting_position > 6452 && starting_position <= 6798) {
                        antigen_name = 'nsp15';
                        starting_position -= 6452;
                        ending_position -= 6452;
                    }
                    else if(starting_position > 6798 && starting_position <= 7096) {
                        antigen_name = 'nsp16';
                        starting_position -= 6798;
                        ending_position -= 6798;
                    }
                }
            }
            else { //if(object_type == 'Discontinuous peptide') {
                description = structure_description; //description.substr(0, pos);
            }
        }

        const non_peptidic_epitope = '';

        const empty_col = '';

        const parent_protein = (item.source_antigen_iri) ? item.source_antigen_iri.split(':')[1] : '';
        const outcome = item.qualitative_measure;

        const comments = '';

        const pdb_id = (item.pdb_id) ? item.pdb_id.toUpperCase() : '';

        const itemStr = pubmed_id + '\t' + epitope + '\t' + object_type + '\t' + description + '\t' + starting_position
          + '\t' + ending_position + '\t' + non_peptidic_epitope + '\t' + antigen_name + '\t' + empty_col + '\t' + parent_protein
          + '\t' + comments + '\t'; // + pdb_id + '\n';

        if(!lineHash.hasOwnProperty(itemStr)) {
            lineHash[itemStr] = pdb_id;
            outcomeHash[itemStr] = outcome;
        }
        else if(pdb_id !== '') {
            if(lineHash[itemStr] === '') {
                lineHash[itemStr] = pdb_id;
                outcomeHash[itemStr] = outcome;
            }
            else {
                lineHash[itemStr] += ',' + pdb_id;
                outcomeHash[itemStr] = outcome;
            }
        }

        //output += itemStr;
    }

    for(let item in lineHash) {
        const pdbArray = lineHash[item].split(',');
        const outcome = outcomeHash[item];
        for(let j = 0, jl = pdbArray.length; j < jl; ++j) {
            output += item + pdbArray[j] + '\t' +outcome + '\n';
        }
    }

    output = output.replace(/null/g, '');

    return output;
}
