/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class MsaParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async loadMsaData(data, type) { let ic = this.icn3d, me = ic.icn3dui;
        let bResult = await this.loadMsaSeqData(data, type);

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        let typeStr = type.toUpperCase();

        if(!bResult) {
          alert('The ' + typeStr + ' file has the wrong format...');
        }
        else {
            // retrieve the structures
            me.cfg.bu = 0; // show all chains
            await ic.chainalignParserCls.downloadMmdbAf(ic.struArray.join(','));
            me.htmlCls.clickMenuCls.setLogCmd('load mmdbaf0 ' + ic.struArray.join(','), true);

            // get the position of the first MSA residue in the full sequence
            let startPosArray = []; 
            for(let i = 0, il = ic.inputChainidArray.length; i < il; ++i) {
                let chainid = ic.inputChainidArray[i];
                let inputSeqNoGap = ic.inputSeqArray[i].replace(/-/g, '');

                // get the full seq
                let fullSeq = ''
                for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                    fullSeq += ic.chainsSeq[chainid][j].name;
                }

                // find the starting position of "inputSeq" in "fullSeq" 
                let pos = fullSeq.toUpperCase().indexOf(inputSeqNoGap.substr(0, 20).toUpperCase());
                if(pos == -1) {
                    console.log("The sequence of the aligned chain " + chainid + " (" + inputSeqNoGap.toUpperCase() + ") is different from the sequence from the structure (" + fullSeq.toUpperCase() + "), and is thus not aligned correctly...");
                    pos = 0;
                }
                startPosArray.push(pos);
            }

            // define residue mapping
            // The format is ": "-separated pairs: "1,5,10-50 | 1,5,10-50: 2,6,11-51 | 1,5,10-50"
            let predefinedres = '';

            let chainid1 = ic.inputChainidArray[0], inputSeq1 = ic.inputSeqArray[0], pos1 = startPosArray[0];
            // loop through 2nd and forward
            for(let i = 1, il = ic.inputChainidArray.length; i < il; ++i) {
                let chainid2 = ic.inputChainidArray[i];
                let inputSeq2 = ic.inputSeqArray[i];
                let pos2 = startPosArray[i];

                let index1 = pos1, index2 = pos2;
                let resiArray1 = [], resiArray2 = [];
                for(let j = 0, jl = inputSeq2.length; j < jl; ++j) {
                    if(inputSeq1[j] != '-' && inputSeq2[j] != '-' && ic.chainsSeq[chainid1][index1] && ic.chainsSeq[chainid2][index2]) {
                        let resi1 = ic.chainsSeq[chainid1][index1].resi;
                        let resi2 = ic.chainsSeq[chainid2][index2].resi;
                        if(ic.residues[chainid1 + '_' + resi1] && ic.residues[chainid2 + '_' + resi2]) {
                            resiArray1.push(ic.chainsSeq[chainid1][index1].resi);
                            resiArray2.push(ic.chainsSeq[chainid2][index2].resi);
                        }
                    }
                    
                    if(inputSeq1[j] != '-') ++index1;
                    if(inputSeq2[j] != '-') ++index2;
                }
                let resiRangeStr1 = ic.resid2specCls.resi2range(resiArray1, true);
                let resiRangeStr2 = ic.resid2specCls.resi2range(resiArray2, true);

                predefinedres += resiRangeStr1 + ' | ' + resiRangeStr2;
                if(i < il -1) predefinedres += ': ';
            }

            // realign based on residue by residue
            let alignment_final = ic.inputChainidArray.join(',');

            if(predefinedres && (alignment_final.split(',').length - 1) != predefinedres.split(': ').length) {
                alert("Please make sure the number of chains and the lines of predefined residues are the same...");
                return;
            }

            me.cfg.resdef = predefinedres.replace(/:/gi, ';');

            let bRealign = true, bPredefined = true;
            let chainidArray = alignment_final.split(',');
            await ic.realignParserCls.realignChainOnSeqAlign(undefined, chainidArray, bRealign, bPredefined);
 
            me.htmlCls.clickMenuCls.setLogCmd("realign predefined " + alignment_final + " " + predefinedres, true);


            ic.opts['color'] = 'identity';
            ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
            me.htmlCls.clickMenuCls.setLogCmd("color identity", true);

            // show selection
            ic.selectionCls.showSelection();
            me.htmlCls.clickMenuCls.setLogCmd("show selection", true);
        }
    }

    async loadMsaSeqData(data, type) { let ic = this.icn3d, me = ic.icn3dui;
        let lines = data.split(/\r?\n|\r/);
        if(lines.length < 2) return false;

        ic.init();

        ic.molTitle = "";

        let seqHash = {};

        let bStart = false, bSecBlock = false, chainid = '', seq = '', bFound = false;

        if(type == 'clustalw' && lines[0].substr(0,7) != 'CLUSTAL') { // CLUSTAL W or CLUSTALW
            return false;
        }

        let startLineNum = (type == 'clustalw') ? 1 : 0;

        // 1. parse input msa
        for(let i = startLineNum, il = lines.length; i < il; ++i) {
            let line = lines[i].trim();
            if(line === '') {
                if(bStart) bSecBlock = true;
                bStart = false;
                continue;
            }

            if(!bStart) { // first line
                if(type == 'fasta' && line.substr(0,1) != '>') {
                    return false;
                }
                bStart = true;
            }

            if(type == 'clustalw') {
                if(line.substr(0, 1) != ' ' && line.substr(0, 1) != '\t') {
                    let chainid_seq = line.split(/\s+/);
                    let idArray = chainid_seq[0].split('|');
                    let result = this.getChainid(idArray, bStart && !bSecBlock);
                    bFound = result.bFound;
                    chainid = result.chainid;

                    if(bFound) {
                        if(!seqHash.hasOwnProperty(chainid)) {
                            seqHash[chainid] = chainid_seq[1];
                        }
                        else {
                            seqHash[chainid] += chainid_seq[1];
                        }
                    }
                }
            }
            else if(type == 'fasta') {
                if(line.substr(0,1) == ">") {
                    // add the previous seq
                    if(chainid && seq && bFound) seqHash[chainid] = seq;
                    chainid = '';
                    seq = '';

                    let pos = line.indexOf(' ');
                    let idArray = line.substr(1, pos).split('|');
                    
                    if(idArray.length == 1) {
                        chainid = idArray[0];
                    }
                    else {
                        let result = this.getChainid(idArray, true);
                        bFound = result.bFound;
                        chainid = result.chainid;
                    }
                }
                else {
                    seq += line;
                }
            }
        }

        // add the last seq
        if(type == 'fasta' && chainid && seq && bFound) seqHash[chainid] = seq;

        // 2. get the PDB ID or RefSeqID or AlphaFold ID
        ic.inputChainidArray = [];
        ic.inputSeqArray = [];
        ic.struArray = [];

        // find the tempate where the first residue is not gap
        let template = '';
        for(let chainid in seqHash) {
            let seq = seqHash[chainid];
            if(seq.substr(0,1) != '-') {
                template = chainid;
                await this.processOneChain(chainid, seqHash);
                break;
            }
        }
        if(!template) template = Object.keys(seqHash)[0];

        for(let chainid in seqHash) {
            if(chainid != template) await this.processOneChain(chainid, seqHash);
        }

        return true;
    }

    async processOneChain(chainid, seqHash) { let ic = this.icn3d, me = ic.icn3dui;
        ic.inputSeqArray.push(seqHash[chainid]);
        // ic.inputSeqArray.push(seqHash[chainid].replace(/-/g, '')); // remove the gaps in seq

        if(chainid.lastIndexOf('_') == 2) { // refseq ID
            // convert refseq to uniprot id
            let url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?refseq2uniprot=" + chainid;
    
            let data = await me.getAjaxPromise(url, 'jsonp', false, 'The protein accession ' + chainid + ' can not be mapped to AlphaFold UniProt ID...');
            if(data && data.uniprot) {
                if(!ic.uniprot2acc) ic.uniprot2acc = {};
                let uniprot = data.uniprot;
                ic.uniprot2acc[uniprot] = chainid;
                ic.struArray.push(uniprot);
                ic.inputChainidArray.push(uniprot + '_A');
            }
            else {
                console.log('The accession ' + refseqid + ' can not be mapped to AlphaFold UniProt ID. It will be treated as a UniProt ID instead.');
                ic.struArray.push(chainid);
                ic.inputChainidArray.push(chainid + '_A');
            }
        }
        else if(chainid.indexOf('_') != -1) { // PDB ID
            let stru = chainid.substr(0, chainid.indexOf('_')).substr(0, 4);
            ic.struArray.push(stru);
            ic.inputChainidArray.push(chainid);
        }
        else if(chainid.length > 5) { // UniProt ID
            ic.struArray.push(chainid);
            ic.inputChainidArray.push(chainid + '_A');
        }
    }

    getChainid(idArray, bWarning) { let ic = this.icn3d, me = ic.icn3dui;
        let bFound = false;
        let chainid = idArray[0];

        for(let j = 0, jl = idArray.length; j < jl; ++j) {
            if(idArray[j] == 'pdb') {
                chainid = idArray[j+1] + '_' + idArray[j+2];
                bFound = true;
                break;
            }
            else if(idArray[j] == 'ref') { // refseq
                let refseq = idArray[j+1].split('.')[0];
                chainid = refseq; // + '_A';
                bFound = true;
                break;
            }
            else if(idArray[j] == 'sp' || idArray[j] == 'tr') { // uniprot
                let uniprot = idArray[j+1];
                chainid = uniprot;
                bFound = true;
                break;
            }
        }

        if(!bFound && bWarning) {
            alert("The sequence ID " + idArray.join('|') + " does not have the correctly formatted PDB, UniProt or RefSeq ID...")
        }

        return {chainid: chainid, bFound: bFound};
    }
}

export {MsaParser}
