/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class MmdbParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the NCBI "mmdbid". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. If the structure
    //is too large, a 3D dgm will show up. You can select your interested chains to see the details.

    //Atom "data" from MMDB file was parsed to set up parameters for the 3D viewer by calling the function
    //loadAtomDataIn. The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    async downloadMmdb(mmdbid, bGi) { let ic = this.icn3d, me = ic.icn3dui;
        let data;
        
        try {
            data = await this.loadMmdbPrms(mmdbid, bGi);

            if(!data || data.error) {
                this.getNoData(mmdbid, bGi);
                return;
            }    
        }
        catch(err) {
            this.getNoData(mmdbid, bGi);
            return;
        }
        
        if(Object.keys(data.atoms).length == 0) { // for large structures such as 3J3Q
            // use mmtfid
            let pdbid = data.pdbId;
            await ic.mmtfParserCls.downloadMmtf(pdbid);

            return;
        }

        let bCalphaOnly = me.utilsCls.isCalphaPhosOnly(data.atoms); //, 'CA');

        if(bCalphaOnly || data.atomCount <= ic.maxatomcnt) {
            await this.parseMmdbData(data);
        }
        else {
            let data2;
        
            try {
                data2 = await this.loadMmdbPrms(mmdbid, bGi, true);
            }
            catch(err) {
                this.getNoData(mmdbid, bGi);
                return;
            }

            await this.parseMmdbData(data2);
        }
    }

        //Ajax call was used to get the atom data from the NCBI "gi". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. Note that
    //only one structure corresponding to the gi will be shown. If there is no structures available
    //for the gi, a warning message will be shown.
    async downloadGi(gi) { let ic = this.icn3d, me = ic.icn3dui;
        ic.bCid = undefined;
        let bGi = true;
        await this.downloadMmdb(gi, bGi);
    }

    //Ajax call was used to get the atom data from "sequence_id_comma_structure_id", comma-separated
    //NCBI protein accessions of a protein sequence and a chain of a 3D structure (e.g., 23491729,1TUP_A).
    //This function was deferred so that it can be chained together with other deferred functions for
    //sequential execution. Note that only one structure corresponding to the blast_rep_id will be shown.
    //If there is no structures available for the blast_rep_id, a warning message will be shown.
    async downloadBlast_rep_id(sequence_structure_ids) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.bCid = undefined;

        let idArray = sequence_structure_ids.split(',');
        me.cfg.query_id = idArray[0];
        me.cfg.blast_rep_id = idArray[1];

        let mmdbid = me.cfg.blast_rep_id.split('_')[0]; // 1TSR_A, XP_003256700.1, Q9H3D4.1

        if(mmdbid.length == 4) { // pdb
            await this.downloadMmdb(mmdbid);
        }
        else {
            ic.blastAcxn = me.cfg.blast_rep_id.split('.')[0];
            //await ic.pdbParserCls.downloadPdb(ic.blastAcxn, true);
            await this.downloadRefseq(ic.blastAcxn, true);
        }
    }

    async downloadRefseq(refseqid, bBlast_rep_id) { let ic = this.icn3d, me = ic.icn3dui;
        let url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?refseq2uniprot=" + refseqid;

        me.cfg.refseqid = refseqid;
 
        //ic.bCid = undefined;

        let data = await me.getAjaxPromise(url, 'jsonp', false, 'The protein accession ' + refseqid + ' can not be mapped to AlphaFold UniProt ID...');

        if(data && data.uniprot) {
            me.cfg.afid = data.uniprot;
            if(!ic.uniprot2acc) ic.uniprot2acc = {};
            ic.uniprot2acc[data.uniprot] = refseqid;
        }
        else {
            alert('The accession ' + refseqid + ' can not be mapped to AlphaFold UniProt ID. It will be treated as a UniProt ID instead.');
            
            return;

            //me.cfg.afid = refseqid;
        }

        if(bBlast_rep_id) me.cfg.blast_rep_id = me.cfg.afid + '_A';

        let bAf = true;

        await ic.pdbParserCls.downloadPdb(me.cfg.afid, bAf);
        //await ic.loadScriptCls.loadScript(me.cfg.command, undefined, true);
    }

    async downloadProteinname(protein) { let ic = this.icn3d, me = ic.icn3dui;
        me.icn3d.bCid = undefined;

        // get RefSeq ID from protein name
        let url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?protein2acc=" + protein;

        let accJson = await me.getAjaxPromise(url, 'jsonp');

        let accArray = accJson.acc;

        if(accArray.length == 0) {
            if(!me.bNode) alert('The protein/gene name ' + protein + ' can not be mapped to RefSeq proteins...');
            return;
        }

        let ajaxArray = [];
        for(let index = 0, indexl = accArray.length; index < indexl; ++index) {
            let refseqid = accArray[index];
            url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?refseq2uniprot=" + refseqid;

            let ajax = me.getAjaxPromise(url, 'jsonp');

            ajaxArray.push(ajax);
        }

        let allPromise = Promise.allSettled(ajaxArray);
        let dataArray = await allPromise;

        ajaxArray = [];
        let afidArray = [];
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            let data = dataArray[i].value;

            if(data && data.uniprot) {
                let afid = data.uniprot;
                url = "https://alphafold.ebi.ac.uk/files/AF-" + afid + "-F1-model_" + ic.AFUniprotVersion + ".pdb";
                ic.ParserUtilsCls.setYourNote(me.cfg.protein + '(NCBI Protein/Gene) in iCn3D');

                let ajax = me.getAjaxPromise(url, 'text', true);
                ajaxArray.push(ajax);
                afidArray.push(afid);
            }
        }
        
        allPromise = Promise.allSettled(ajaxArray);
        dataArray = await allPromise;
       
        for(let i = 0, il = dataArray.length; i < il; ++i) {
            let data = dataArray[i].value;
            me.cfg.afid = afidArray[i];

            if(data) {
                // add UniProt ID into the header
                let header = 'HEADER                                                        ' + me.cfg.afid + '\n';
                data = header + data;          
                await ic.opmParserCls.parseAtomData(data, me.cfg.afid, undefined, 'pdb', undefined);

                break;
            }
        }

        if(!me.cfg.afid) {
            if(!me.bNode) alert('The protein/gene name ' + protein + ' can not be mapped to AlphaFold structures...');
            return;
        }
    }

    getNoData(mmdbid, bGi) { let ic = this.icn3d, me = ic.icn3dui;
        if(bGi) {
            alert("This gi " + mmdbid + " has no corresponding 3D structure...");
        }
        else {
            alert("This mmdbid " + mmdbid + " with the parameters " + me.cfg.inpara + " may not have 3D structure data. Please visit the summary page for details: " + me.htmlCls.baseUrl + "pdb/" + mmdbid);
        }
    }

    async parseMmdbData(data, type, chainid, chainIndex, bLastQuery, bNoTransformNoSeqalign, pdbidIn) { let ic = this.icn3d, me = ic.icn3dui;
        let hAtoms;
        let pdbid = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
        if(pdbidIn) pdbid = pdbidIn;

        this.parseMmdbDataPart1(data, type);

        if(type === undefined) { // default mmdbid input
            if(data.opm !== undefined && data.opm.rot !== undefined) {
                ic.bOpm = true;
                ic.opmParserCls.setOpmData(data);
            }

            hAtoms = ic.loadAtomDataCls.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type);
        }
        else { // multiple mmdbids, typically for alignment
            if(chainid) pdbid = chainid.substr(0, chainid.indexOf('_'));

            hAtoms = ic.loadAtomDataCls.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type, chainid, chainIndex, bLastQuery, bNoTransformNoSeqalign);
        }

        // set 3d domains
        let structure = data.pdbId;

        if(type === undefined) ic.ParserUtilsCls.setYourNote(structure.toUpperCase() + '(MMDB) in iCn3D');

        // let bNCBI = (me.cfg.mmdbid || me.cfg.gi || me.cfg.align || me.cfg.chainalign || me.cfg.mmdbafid || me.cfg.blast_rep_id);

        for(let molid in data.domains) {
            let chain = data.domains[molid].chain;
            let chainid = structure + '_' + chain;
            let domainArray = data.domains[molid].domains;

            for(let index = 0, indexl = domainArray.length; index < indexl; ++index) {
                let domainName = structure + '_' + chain + '_3d_domain_' +(index+1).toString();
                ic.tddomains[domainName] = {}

                let subdomainArray = domainArray[index].intervals;

                // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
                let domainFromHash = {}, domainToHash = {}

                //var fromArray = [], toArray = [];
                //var resCnt = 0
                for(let i = 0, il = subdomainArray.length; i < il; ++i) {
                    let domainFrom = Math.round(subdomainArray[i][0]) - 1; // 1-based
                    let domainTo = Math.round(subdomainArray[i][1]) - 1;

                    if(domainFromHash.hasOwnProperty(domainFrom) || domainToHash.hasOwnProperty(domainTo)) {
                        continue; // do nothing for duplicated "from" or "to", e.g, PDBID 1ITW, 5FWI
                    }
                    else {
                        domainFromHash[domainFrom] = 1;
                        domainToHash[domainTo] = 1;
                    }

                    //fromArray.push(domainFrom + ic.baseResi[chnid]);
                    //toArray.push(domainTo + ic.baseResi[chnid]);
                    //resCnt += domainTo - domainFrom + 1;

                    for(let j = domainFrom; j <= domainTo; ++j) {
                        let resid;
                        let residNCBI = chainid + '_' +(j+1).toString();

                        // if(bNCBI && ic.ncbi2resid[residNCBI]) {
                            resid = ic.ncbi2resid[residNCBI];
                        // }
                        // else {
                        //     resid = chainid + '_' +(j+1 + ic.chainid2offset[chainid]).toString();
                        // }

                        if(resid) ic.tddomains[domainName][resid] = 1;
                    }
                }
            } // for each domainArray
        } // for each molid

        // "asuAtomCount" is defined when: 1) atom count is over the threshold 2) bu=1 3) asu atom count is smaller than biological unit atom count
        ic.bAssemblyUseAsu =(data.asuAtomCount !== undefined) ? true : false;
        if(type !== undefined) {
            ic.bAssemblyUseAsu = false;
        }
        else {
            await ic.mmcifParserCls.downloadMmcifSymmetry(pdbid);
        }

        if(ic.bAssemblyUseAsu) { 
            $("#" + ic.pre + "assemblyWrapper").show();
            //ic.bAssembly = true;
        }
        else {
            //$("#" + ic.pre + "assemblyWrapper").hide();
            //ic.bAssembly = false;
        }

        if(ic.emd !== undefined) {
          $("#" + ic.pre + "mapWrapper1").hide();
          $("#" + ic.pre + "mapWrapper2").hide();
          $("#" + ic.pre + "mapWrapper3").hide();
        }
        else {
          $("#" + ic.pre + "emmapWrapper1").hide();
          $("#" + ic.pre + "emmapWrapper2").hide();
          $("#" + ic.pre + "emmapWrapper3").hide();
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // use the original color from cgi output
        if(me.cfg.blast_rep_id !== undefined) {
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        }
        else {
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms, true);
        }

        if(type === undefined) {
            await ic.ParserUtilsCls.renderStructure();
            if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

            ic.html2ddgm = '';
            if(me.cfg.show2d) {
                me.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
                if(ic.bFullUi) {
                    //if(type === undefined) {
                        ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
                    //}
                    //else {
                    //    ic.ParserUtilsCls.set2DDiagramsForAlign(ic.inputid2.toUpperCase(), ic.inputid.toUpperCase());
                        //ic.ParserUtilsCls.set2DDiagramsForChainalign(chainidArray);
                    //}
                }
            }
        }

        if((me.cfg.align === undefined || me.cfg.chainalign === undefined || me.cfg.mmdbafid === undefined) && Object.keys(ic.structures).length == 1) {
            if($("#" + ic.pre + "alternateWrapper") !== null) $("#" + ic.pre + "alternateWrapper").hide();
        }

        //if(me.deferred !== undefined) me.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();

        return hAtoms;
    }

    parseMmdbDataPart1(data, type) { let ic = this.icn3d, me = ic.icn3dui;
        // if type is defined, always process target before query
        if(data.atoms === undefined && data.molid2rescount === undefined) {
            alert('invalid MMDB data.');
            return false;
        }

        if(type === undefined || type === 'target') {
            // if a command contains "load...", the commands should not be cleared with init()
            let bKeepCmd = (ic.bCommandLoad) ? true : false;
            if(!ic.bStatefile) ic.init(bKeepCmd);

            ic.chainsColor = {}
            ic.chainsGene = {}
        }

        // used in download2Ddgm()
        if(type === 'query') {
            //ic.interactionData_q.push({"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues});
        }
        else {
            ic.interactionData = {"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues}
        }

        if(type === 'query') {
            //ic.mmdb_data_q.push(data);
        }
        else {
            ic.mmdb_data = data;
        }

        let id =(data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
        if(type === 'query') {
            ic.inputid2 = id;
        }
        else {
            ic.inputid = id;
        }

        // get molid2color = {}, chain2molid = {}, molid2chain = {}
        let labelsize = 40;

        let molid2rescount = data.moleculeInfor;
        let molid2color = {}, chain2molid = {}, molid2chain = {}

        //var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

        let index = 1;
        let chainNameHash = {};       
        for(let i in molid2rescount) {
          if(Object.keys(molid2rescount[i]).length === 0) continue;

          let color =(molid2rescount[i].color === undefined) ? '#CCCCCC' : '#' +( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
          let chainName =(molid2rescount[i].chain === undefined) ? '' : molid2rescount[i].chain.trim();
          // remove "_" in chain name
          if(parseInt(me.cfg.date) >= 20231001 || (!me.cfg.date && parseInt(me.utilsCls.getDateDigitStr()) >= 20231001)) {
            chainName = chainName.replace(/_/g, '');
          }

          if(chainNameHash[chainName] === undefined) {
              chainNameHash[chainName] = 1;
          }
          else {
              ++chainNameHash[chainName];
          }

          let chainNameFinal =(chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
          let chain = id + '_' + chainNameFinal;

          molid2color[i] = color;
          chain2molid[chain] = i;
          molid2chain[i] = chain;

          ic.chainsColor[chain] = (type !== undefined && !me.cfg.mmdbafid) ? me.parasCls.thr(me.htmlCls.GREY8) : me.parasCls.thr(color);

          let geneId =(molid2rescount[i].geneId === undefined) ? '' : molid2rescount[i].geneId;
          let geneSymbol =(molid2rescount[i].geneSymbol === undefined) ? '' : molid2rescount[i].geneSymbol;
          let geneDesc =(molid2rescount[i].geneDesc === undefined) ? '' : molid2rescount[i].geneDesc;
          ic.chainsGene[chain] = {'geneId': geneId, 'geneSymbol': geneSymbol, 'geneDesc': geneDesc}
          ++index;
        }

        //ic.molid2color = molid2color;
        //ic.chain2molid = chain2molid;
        ic.molid2chain = molid2chain;

        // small structure with all atoms
        // show surface options
        $("#" + ic.pre + "accordion5").show();

        //ic.loadAtomDataCls.loadAtomDataIn(data, id, 'mmdbid', undefined, type);
    }

    loadMmdbPrms(mmdbid, bGi, bCalpha) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let url;

        // b: b-factor, s: water, ft: pdbsite
        //&ft=1
        if(bGi) {
            url = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&simple=1&gi=" + mmdbid;
        }
        else {
            url = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&simple=1&uid=" + mmdbid;
        }

        // use asymmetric unit for BLAST search, e.g., https://www.ncbi.nlm.nih.gov/Structure/icn3d/?from=blast&blast_rep_id=5XZC_B&query_id=1TUP_A&command=view+annotations;set+annotation+cdd;set+annotation+site;set+view+detailed+view;select+chain+5XZC_B;show+selection&log$=align&blast_rank=1&RID=EPUCYNVV014&bu=0
        if(me.cfg.blast_rep_id !== undefined) url += '&bu=0';

        //ic.bCid = undefined;

        if(me.cfg.inpara !== undefined) {
            url += me.cfg.inpara;
        }

        if(bCalpha) url += '&complexity=2';

        if(ic.chainids2resids === undefined) ic.chainids2resids = {}; // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

        return me.getAjaxPromise(url, 'jsonp', true);
    }
}

export {MmdbParser}
