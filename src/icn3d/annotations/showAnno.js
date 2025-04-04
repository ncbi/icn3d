/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ShowAnno {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //show annotations such as SNPs, ClinVar, domains, binding sites, etc.
    showAnnotations_part1(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        me.htmlCls.dialogCls.openDlg('dl_selectannotations', 'Sequences and Annotations');
        // add note about assembly
        if((ic.bAssemblyNote === undefined || !ic.bAssemblyNote) && ic.asuCnt !== undefined ) {
            let html = "     <br><div id='" + ic.pre + "assembly_note' style='margin-left:5px;'><span class='icn3d-annoLargeTitle'>Assembly Tips:</span> Only the asymmetric unit is shown in the sequence window.<br>Click \"Assembly\" in the menu \"View\" to switch between asymmetric unit and biological assembly(<b>" + ic.asuCnt + "</b> asymmetric unit).</div>";
            $("#" + ic.pre + "dl_annotations_tabs").append(html);
            ic.bAssemblyNote = true;
        }

        if(ic.bResetAnno) {
            //reset Anno when loading another structure
            ic.giSeq = {};
            ic.currClin = {};
            ic.resi2disease_nonempty = {};
            ic.baseResi = {};
            ic.matchedPos = {};

            $("#" + me.pre + "dl_annotations").empty();
            //ic.annotationCls.setAnnoViewAndDisplay('overview');
            ic.annotationCls.setAnnoView('overview');
        }

        let nucleotide_chainid = {}, chemical_chainid = {}, chemical_set = {}
        //ic.protein_chainid = {};

        if(ic.bAnnoShown === undefined || !ic.bAnnoShown || ic.bResetAnno) { // ic.bResetAnno when loading another structure
            ic.protein_chainid = {};

            let chainArray = Object.keys(ic.chains);
            if(atoms) { // show annot just for the atoms
                let structureArray = ic.resid2specCls.atoms2structureArray(atoms);
                chainArray = [];
                for(let i = 0, il = structureArray.length; i < il; ++i) {
                    chainArray = chainArray.concat(ic.structures[structureArray[i]])
                }
            }

            if(ic.giSeq === undefined) ic.giSeq = {};
            if(ic.currClin === undefined) ic.currClin = {};
            if(ic.resi2disease_nonempty === undefined) ic.resi2disease_nonempty = {};
            if(ic.baseResi === undefined) ic.baseResi = {};
            if(ic.matchedPos === undefined) ic.matchedPos = {};
            let dialogWidth;
            if(me.bNode) { // no $().dialog
                dialogWidth = 500;
            }
            else {
                dialogWidth =(me.cfg.notebook) ? me.htmlCls.WIDTH / 2 : $("#" + ic.pre + "dl_selectannotations").dialog( "option", "width" );
            }
            ic.seqAnnWidth = dialogWidth - 120 - 30*2 - 50; // title: 120px, start and end resi: 30px, extra space on the left and right: 50px
            
            for(let i = 0, il = chainArray.length; i < il; ++i) {
                let pos = Math.round(chainArray[i].indexOf('_'));
                //if(pos > 4) continue; // NMR structures with structure id such as 2K042,2K043, ...
                // let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainArray[i]]);

                // the first residue of 6AL5_H is non-standard residue and treated as chemical
                // choose the 100th atom, around the 5th residue
                let atom = ic.firstAtomObjCls.getMiddleAtomObj(ic.chains[chainArray[i]], 100);

                if(atom === undefined) atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainArray[i]]);
                if(atom === undefined) continue;

                // only single letter chain has accession such as 1P9M_A
                let chainLetter = chainArray[i].substr(chainArray[i].indexOf('_') + 1);
                let chainidBase;
                if(chainLetter.indexOf('_') !== -1) { // NCBI modified chainid, e.g., A_1
                    chainLetter = chainLetter.substr(0, chainLetter.indexOf('_'));
                    chainidBase = chainArray[i].substr(0, chainArray[i].indexOf('_')) + '_' + chainLetter;
                }
                else if(chainLetter.length > 1 && chainLetter.substr(chainLetter.length - 1) == '1') { // NCBI modified chainid, e.g., A1
                    chainLetter = chainLetter.substr(0, chainLetter.length - 1);
                    chainidBase = chainArray[i].substr(0, chainArray[i].indexOf('_')) + '_' + chainLetter;
                }
                else {
                    chainidBase = chainArray[i];
                }
                //if(me.cfg.mmdbid !== undefined) { // protein and chemicals/ions are in different chains

                if(ic.proteins.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                    ic.protein_chainid[chainArray[i]] = chainidBase;
                }
                else if(ic.nucleotides.hasOwnProperty(atom.serial) && ic.chainsSeq[chainArray[i]].length > 1) {
                    nucleotide_chainid[chainArray[i]] = chainidBase;
                }
                else {
                    if(ic.chainsSeq[chainArray[i]].length > 1) {
                        chemical_chainid[chainArray[i]] = chainidBase;
                    }
                    else {
                        let name = ic.chainsSeq[chainArray[i]][0].name;
                        let resid = chainArray[i] + '_' + ic.chainsSeq[chainArray[i]][0].resi;
                        if(chemical_set[name] === undefined) chemical_set[name] = [];
                        chemical_set[name].push(resid);
                    }
                }

                //}
                // protein and nucleotide chain may have chemicals/ions attached at the end
                if((me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmtfid !== undefined)
                  &&(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) ) {
                    for(let r = 0, rl = ic.chainsSeq[chainArray[i]].length; r < rl; ++r) {
                        let resObj = ic.chainsSeq[chainArray[i]][r];
                        if(resObj.name !== '' && resObj.name !== '-' && resObj.name == resObj.name.toUpperCase()) {
                            let resid = chainArray[i] + '_' + resObj.resi;
                            let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);
                            if(atom === undefined) atom = ic.firstAtomObjCls.getFirstAtomObj(ic.chains[chainArray[i]]);
                            if(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial)) {
                                continue;
                            }
                            else {
                                let name = resObj.name.trim();
                                if(chemical_set[name] === undefined) chemical_set[name] = [];
                                chemical_set[name].push(resid);
                            }
                        } // if(resObj.name !== ''
                    } // for(let r = 0
                } // if(me.cfg.mmdbid
            } // for(let i = 0

            ic.maxAnnoLengthOri = 1;
            for(let chainid in ic.chainsSeq) {
                // use protein or nucleotide as the max length
                if(ic.chainsSeq[chainid].length > ic.maxAnnoLengthOri && (ic.protein_chainid.hasOwnProperty(chainid) || nucleotide_chainid.hasOwnProperty(chainid)) ) {
                    ic.maxAnnoLengthOri = ic.chainsSeq[chainid].length;
                }
            }
            ic.maxAnnoLength = ic.maxAnnoLengthOri;
        }

        return {'nucleotide_chainid': nucleotide_chainid, 'chemical_chainid': chemical_chainid, 'chemical_set': chemical_set};
    }

    async showAnnotations(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let result = this.showAnnotations_part1(atoms);

        let nucleotide_chainid = result.nucleotide_chainid;
        let chemical_chainid = result.chemical_chainid;
        let chemical_set = result.chemical_set;

        if(!ic.bAnnoShown || ic.bResetAnno) { // ic.bResetAnno when loading another structure
            // assign early to avoid load annotations twice
            ic.bAnnoShown = true;

            if(me.cfg.blast_rep_id === undefined) {
               if(ic.bFullUi) {
                    if(me.cfg.mmtfid !== undefined) { // mmtf data do NOT have the missing residues
                        //let id = chainArray[0].substr(0, chainArray[0].indexOf('_'));
                        let id = Object.keys(ic.structures)[0];

                        await ic.mmcifParserCls.downloadMmcifSymmetry(id, 'mmtfid');
                    }
                    
                    await this.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
               }
            }
            else if(me.cfg.blast_rep_id !== undefined && !ic.bSmithwm && !ic.bLocalSmithwm) { // align sequence to structure
                let url = me.htmlCls.baseUrl + 'pwaln/pwaln.fcgi?from=querytarget';
                let dataObj = {'targets': me.cfg.blast_rep_id, 'queries': me.cfg.query_id}
                if(me.cfg.query_from_to !== undefined ) {
                    // convert from 1-based to 0-based
                    let query_from_to_array = me.cfg.query_from_to.split(':');
                    for(let i = 0, il = query_from_to_array.length; i < il; ++i) {
                        query_from_to_array[i] = parseInt(query_from_to_array[i]) - 1;
                    }
                    dataObj['queries'] = me.cfg.query_id + ':' + query_from_to_array.join(':');
                }
                if(me.cfg.target_from_to !== undefined) {
                    // convert from 1-based to 0-based
                    let target_from_to_array = me.cfg.target_from_to.split(':');
                    for(let i = 0, il = target_from_to_array.length; i < il; ++i) {
                        target_from_to_array[i] = parseInt(target_from_to_array[i]) - 1;
                    }
                    dataObj['targets'] = me.cfg.blast_rep_id + ':' + target_from_to_array.join(':');
                }

                // get sequence
                if(ic.blastAcxn) { 
                    let chainid = me.cfg.afid + '_A';
                    let seq = '';
                    for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
                        seq += ic.chainsSeq[chainid][i].name;
                    }

                    dataObj['targets'] = seq;
                }

                let data = await me.getAjaxPostPromise(url, dataObj);

                ic.seqStructAlignData = data;
                await thisClass.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
            } // align seq to structure
            else if(me.cfg.blast_rep_id !== undefined && (ic.bSmithwm || ic.bLocalSmithwm)) { // align sequence to structure
                //{'targets': me.cfg.blast_rep_id, 'queries': me.cfg.query_id}
                let idArray = [me.cfg.blast_rep_id];

                let target, query;
                if(me.cfg.query_id.indexOf('>') != -1) { //FASTA with header
                    query = me.cfg.query_id.substr(me.cfg.query_id.indexOf('\n') + 1);
                }
                else if(!(/\d/.test(me.cfg.query_id)) || me.cfg.query_id.length > 50) { //FASTA
                    query = me.cfg.query_id;
                }
                else { // accession
                    idArray.push(me.cfg.query_id);
                }

                // get sequence
                if(ic.blastAcxn) { 
                    let chainid = me.cfg.afid + '_A';
                    let seq = '';
                    for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
                        seq += ic.chainsSeq[chainid][i].name;
                    }

                    target = seq;
                }
                else {
                    let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + idArray;
                    let chainid_seq = await me.getAjaxPromise(url, 'jsonp', false, "Can not retrieve the sequence of the accession(s) " + idArray.join(", "));

                    for(let acc in chainid_seq) {
                        target = chainid_seq[acc];
                    }
                }

                let match_score = 1, mismatch = -1, gap = -1, extension = -1;

                let bLocal = (ic.bLocalSmithwm) ? true : false;
                ic.seqStructAlignDataLocalSmithwm = ic.alignSWCls.alignSW(target, query, match_score, mismatch, gap, extension, bLocal);

                await thisClass.showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set);
             } // align seq to structure
        }
        //ic.bAnnoShown = true;

        if($("#" + ic.pre + "anno_ig").length && $("#" + ic.pre + "anno_ig")[0].checked) {
            ic.bRunRefnumAgain = true;
            await ic.annotationCls.setAnnoTabIg();

            ic.bRunRefnumAgain = false;
        }
    }

    async showAnnoSeqData(nucleotide_chainid, chemical_chainid, chemical_set) { let ic = this.icn3d, me = ic.icn3dui;
        if(!me.bNode) await this.getAnnotationData();

        let i = 0;
        for(let chain in nucleotide_chainid) {
            this.getSequenceData(chain, nucleotide_chainid[chain], 'nucleotide', i);
            ++i;
        }
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, ic.protein_chainid);
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, nucleotide_chainid);
        i = 0;
        for(let chain in chemical_chainid) {
            this.getSequenceData(chain, chemical_chainid[chain], 'chemical', i);
            ++i;
        }
        ic.interactChainbase = me.hashUtilsCls.unionHash(ic.interactChainbase, chemical_chainid);
        ic.PTMChainbase = me.hashUtilsCls.unionHash(ic.PTMChainbase, ic.protein_chainid);

        ic.ssbondChainbase = me.hashUtilsCls.unionHash(ic.ssbondChainbase, ic.protein_chainid);
        ic.ssbondChainbase = me.hashUtilsCls.unionHash(ic.ssbondChainbase, chemical_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, ic.protein_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, nucleotide_chainid);
        ic.crosslinkChainbase = me.hashUtilsCls.unionHash(ic.crosslinkChainbase, chemical_chainid);
        for(let name in chemical_set) {
            this.getCombinedSequenceData(name, chemical_set[name], i);
            ++i;
        }

        if(!me.bNode) {
            this.enableHlSeq();
            ic.annotationCls.hideAllAnno();

            // setTimeout(function(){
            //     ic.annotationCls.clickCdd();
            // }, 0);

            ic.annotationCls.clickCdd();
        }
    }

    async getAnnotationData() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        let chnidBaseArray = $.map(ic.protein_chainid, function(v) { return v; });
        let index = 0;

        // get geneid
        if(!ic.chainsGene) ic.chainsGene = {};
        for(let chnid in ic.protein_chainid) {
            let structure = chnid.substr(0, chnid.indexOf('_'));
            // UniProt or NCBI protein accession
            if(structure.length > 5) {
                let refseqid, url;
                if(ic.uniprot2acc && ic.uniprot2acc[structure]) {
                    refseqid = ic.uniprot2acc[structure];
                }
                else {
                    ic.uniprot2acc = {};

                    // try {
                    //     if(!ic.uniprot2acc) ic.uniprot2acc = {};
                    // the following query is slow due to the missing index in DB
                    //     url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?uniprot2refseq=" + structure;
                    //     let result = await me.getAjaxPromise(url, 'jsonp');
                    //     refseqid = (result && result.refseq) ? result.refseq : structure;

                    //     ic.uniprot2acc[structure] = refseqid;
                    // }
                    // catch {
                    //     console.log("Problem in getting protein accession from UniProt ID...")
                    //     refseqid = structure;
                    // }
                }

                // get Gene info from protein name
                // url = me.htmlCls.baseUrl + "vastdyn/vastdyn.cgi?protein2gene=" + refseqid;
                // ic.chainsGene[chnid] = await me.getAjaxPromise(url, 'jsonp');

                // get Gene info from uniprot
                url = "https://rest.uniprot.org/uniprotkb/search?format=json&fields=xref_geneid,gene_names&query=" + structure;
                let geneData = await me.getAjaxPromise(url, 'json');
                let geneId = (geneData.results[0] && geneData.results[0].uniProtKBCrossReferences && geneData.results[0].uniProtKBCrossReferences[0]) ? geneData.results[0].uniProtKBCrossReferences[0].id : undefined;
                let geneSymbol = (geneData.results[0] && geneData.results[0].genes && geneData.results[0].genes[0] && geneData.results[0].genes[0].geneName) ? geneData.results[0].genes[0].geneName.value : 'ID ' + geneId;
                ic.chainsGene[chnid] = {geneId: geneId, geneSymbol: geneSymbol};
            }
        }

        for(let chnid in ic.protein_chainid) {
            let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';
            let fullProteinName = ic.showSeqCls.getProteinName(chnid);
            let proteinName = fullProteinName;
            //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
            let categoryStr =(index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>" : "";
            let geneLink =(ic.chainsGene[chnid] && ic.chainsGene[chnid].geneId && ic.chainsGene[chnid].geneDesc) ? "(Gene: <a href='https://www.ncbi.nlm.nih.gov/gene/" + ic.chainsGene[chnid].geneId + "?report=gene_table' target='_blank' title='" + ic.chainsGene[chnid].geneDesc + "'>" + ic.chainsGene[chnid].geneSymbol + "</a>)" : '';
            let structure = chnid.substr(0, chnid.indexOf('_'));
            let chainLink = (structure.length > 5) ? '<a href="https://alphafold.ebi.ac.uk/entry/' + structure + '" target="_blank">' + chnid + '</a>' : chnid;
            let chainHtml = "<div id='" + ic.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr
                + "<span style='font-weight:bold;'>Annotations of " + chainLink
                + "</span>: <a class='icn3d-blue' href='https://www.ncbi.nlm.nih.gov/protein?term="
                + chnid + "' target='_blank' title='" + fullProteinName + "'>" + proteinName + "</a>"
                + geneLink + "&nbsp;&nbsp;&nbsp;"
                + this.addButton(chnid, "icn3d-addtrack", "Add Track", "Add a custom track", 60, buttonStyle)
                + "&nbsp;&nbsp;&nbsp;";
            //if(me.cfg.blast_rep_id !== undefined && me.cfg.blast_rep_id == chnid) {
                chainHtml += this.addButton(chnid, "icn3d-customcolor", "Custom Color/Tube", "Use a custom file to define the colors or tubes in 3D structure", 110, buttonStyle) + "&nbsp;&nbsp;&nbsp;";
            //}
                chainHtml += this.addButton(chnid, "icn3d-helixsets", "Helix Sets", "Define sets for each helix in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
                + this.addButton(chnid, "icn3d-sheetsets", "Sheet Sets", "Define sets for each sheet in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
                + this.addButton(chnid, "icn3d-coilsets", "Coil Sets", "Define sets for each coil in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle);

                // if(ic.bShowRefnum && ic.chainid2refpdbname.hasOwnProperty(chnid) && ic.chainid2refpdbname[chnid].length > 0) {
                    chainHtml += "&nbsp;&nbsp;&nbsp;" + this.addButton(chnid, "icn3d-iganchorsets", "Ig Anchor Set", "Define the set for all Ig anchors in this chain and add them to the menu of \"Defined Sets\"", 80, buttonStyle) + "&nbsp;" 
                    + this.addButton(chnid, "icn3d-igstrandsets", "Ig Strand Sets", "Define sets for each Ig strand in this chain and add them to the menu of \"Defined Sets\"", 80, buttonStyle) + "&nbsp;"
                    + this.addButton(chnid, "icn3d-igloopsets", "Ig Loop Sets", "Define sets for each Ig loop in this chain and add them to the menu of \"Defined Sets\"", 80, buttonStyle) + "&nbsp;"
                    + this.addButton(chnid, "icn3d-igdomainsets", "Ig Domain Sets", "Define sets for each Ig domain in this chain and add them to the menu of \"Defined Sets\"", 80, buttonStyle)
                // }
            $("#" + ic.pre + "dl_annotations").append(chainHtml);
            //let itemArray = ['giseq', 'cdd', 'clinvar', 'snp', 'domain', 'site', 'ptm', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
            let itemArray = ['giseq', 'cdd', 'clinvar', 'snp', 'site', 'ptm', 'ssbond', 'crosslink', 'transmem', 'domain', 'custom', 'interaction', 'ig'];
            // dt: detailed view, hide by default; ov: overview, show by default
            for(let i in itemArray) {
                let item = itemArray[i];
                $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, item));
            }
            $("#" + ic.pre + "anno_" + chnid).append("<br><hr><br>");
            ++index;
        }
        
        if(!me.bNode) ic.annoCddSiteCls.setToolTip();

        if(ic.chainid_seq !== undefined) {     
            await this.processSeqData(ic.chainid_seq);
        }
        else {       
            try {
                let pdbChainidArray = [], afChainidArray = [];
                for(let i = 0, il = chnidBaseArray.length; i < il; ++i) {
                    let struct = chnidBaseArray[i].substr(0, chnidBaseArray.indexOf('_'));
                    //if(chnidBaseArray[i].length >= 6) {
                    if(struct.length >= 6) {
                        afChainidArray.push(chnidBaseArray[i]);
                    }
                    else {
                        pdbChainidArray.push(chnidBaseArray[i]);
                    }
                }

                if(pdbChainidArray.length > 0) {
                    let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + pdbChainidArray;
                    ic.chainid_seq = await me.getAjaxPromise(url, 'jsonp');
                }
                else {
                    ic.chainid_seq = {};
                }

                let data;

                for(let i = 0, il = afChainidArray.length; i < il; ++i) {
                    let chainid = afChainidArray[i];
                    let seq = '';
                    for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
                        seq += ic.chainsSeq[chainid][i].name;
                    }
                    ic.chainid_seq[chainid] = seq;
                }
                
                // let url = me.htmlCls.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + chnidBaseArray;
                // let data = await me.getAjaxPromise(url, 'jsonp');
                // ic.chainid_seq = data;

                await thisClass.processSeqData(ic.chainid_seq);
            }
            catch(err) {
                thisClass.enableHlSeq();
                if(!me.bNode) console.log( "No sequence data were found for the protein " + chnidBaseArray + "..." );
                for(let chnid in ic.protein_chainid) {
                    let chnidBase = ic.protein_chainid[chnid];
                    ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
                    ic.showSeqCls.showSeq(chnid, chnidBase);
                }
                // get CDD/Binding sites
                await ic.annoCddSiteCls.showCddSiteAll();
                return;
            }
        }
    }

    getSequenceData(chnid, chnidBase, type, index) { let ic = this.icn3d, me = ic.icn3dui;
        let fullProteinName = ic.showSeqCls.getProteinName(chnid);
        let proteinName = fullProteinName;
        if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
        let categoryStr = "";
        if(index == 0) {
            if(type == 'protein') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>";
            }
            else if(type == 'nucleotide') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Nucleotides</b>: </span><br><br>";
            }
            else if(type == 'chemical') {
                categoryStr = "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>";
            }
        }
        $("#" + ic.pre + "dl_annotations").append("<div id='" + ic.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr + "<b>" + chnid + "</b>: " + "<span title='" + fullProteinName + "'>" + proteinName + "</span> </div>");
        // dt: detailed view, hide by default; ov: overview, show by default
        $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'giseq'));
        //$("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'custom'));
        $("#" + ic.pre + "anno_" + chnid).append(this.getAnDiv(chnid, 'interaction'));
        $("#" + ic.pre + "anno_" + chnid).append("<br><hr><br>");
        // show the sequence and 3D structure
        ic.giSeq[chnid] = [];

        for(let i = 0; i < ic.chainsSeq[chnid].length; ++i) {
            let res = ic.chainsSeq[chnid][i].name;
            //ic.giSeq[chnid][i] =(res.length > 1) ? res.substr(0, 1) : res;
            ic.giSeq[chnid][i] = res;
        }
        ic.matchedPos[chnid] = 0;
        ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
        ic.showSeqCls.showSeq(chnid, chnidBase, type);
        //ic.annoContactCls.showInteraction(chnid, chnidBase);
    }
    getCombinedSequenceData(name, residArray, index) { let ic = this.icn3d, me = ic.icn3dui;
        let categoryStr =(index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Chemicals/Ions/Water</b>: </span><br><br>" : "";
        let chemName;
        let pos = residArray[0].lastIndexOf('_');
        let firstChainid = residArray[0].substr(0, pos);
        let sid =(me.cfg.mmdbid !== undefined && ic.chainid2sid !== undefined) ? ic.chainid2sid[firstChainid] : undefined;
        if(sid !== undefined) {
            chemName = "<b>" + name + " <a class='icn3d-blue' href='https://pubchem.ncbi.nlm.nih.gov/substance/" + sid + "#section=2D-Structure' target='_blank'><img src='https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?sid=" + sid + "'></a></b>";
        }
        else {
            chemName = "<b>" + name + "</b>";
        }
        $("#" + ic.pre + "dl_annotations").append("<div id='" + ic.pre + "anno_" + name + "' class='icn3d-annotation'>" + categoryStr + chemName + "</div>");
        // dt: detailed view, hide by default; ov: overview, show by default
        $("#" + ic.pre + "anno_" + name).append("<div id='" + ic.pre + "giseq_" + name + "'><div id='" + ic.pre + "dt_giseq_" + name + "' style='display:none'></div><div id='" + ic.pre + "ov_giseq_" + name + "'></div></div>");
        $("#" + ic.pre + "anno_" + name).append("<br><hr><br>");
        // sequence, detailed view
        // let htmlTmp = '<div id="' + ic.pre + 'giseq_sequence" class="icn3d-dl_sequence">';
        let htmlTmp = '<div class="icn3d-dl_sequence">';
        let chainType = 'Chem.', chainTypeFull = 'Chemical';
        //htmlTmp += '<div class="icn3d-seqTitle2" anno="sequence"><span style="white-space:nowrap;" title="' + chainTypeFull + ' ' + name + '">' + chainType + ' ' + name + '</span></div>';
        htmlTmp += '<div class="icn3d-seqTitle icn3d-link icn3d-blue" anno="sequence" gi="' + name + '" resn="' + name + '"><span style="white-space:nowrap;" title="' + chainTypeFull + ' ' + name + '">' + chainType + ' ' + name + '</span></div>';
        htmlTmp += '<span class="icn3d-residueNum" style="width:60px!important;" title="starting protein sequence number">Count: ' + residArray.length + '</span>';
        htmlTmp += '<span class="icn3d-seqLine">';
        // sequence, overview
        let html = htmlTmp;
        let html2 = htmlTmp;
        for(let i = 0, il = residArray.length; i < il; ++i) {
          let cFull = name;
          let c = cFull;
          if(cFull.length > 3) {
              c = cFull.substr(0,3);
          }
          if(i < residArray.length - 1) c = c + ',';
          let resid = residArray[i];
          let resi = resid.substr(resid.lastIndexOf('_') + 1);
          html += '<span id="giseq_' + ic.pre + resid + '" title="' + cFull + resi + '" class="icn3d-residue icn3d-chemical">' + c + '</span>';
        }
        let color = me.htmlCls.GREY8;
        //html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + Math.round(ic.seqAnnWidth * residArray.length / ic.maxAnnoLength) + 'px;">' + name + '</div>';
        let width = Math.round(ic.seqAnnWidth * residArray.length / ic.maxAnnoLength);
        if(width < 1) width = 1;
        html2 += '<div class="icn3d-seqTitle" style="display:inline-block; color:white; font-weight:bold; background-color:' + color + '; width:' + width + 'px;">&nbsp;</div>';
        //htmlTmp = '<span class="icn3d-residueNum" title="ending protein sequence number">' + residArray.length + '</span>';
        //htmlTmp += '</span>';
        htmlTmp = '</span>';
        htmlTmp += '<br>';
        htmlTmp += '</div>';
        html += htmlTmp;
        html2 += htmlTmp;
        $("#" + ic.pre + 'dt_giseq_' + name).html(html);
        $("#" + ic.pre + 'ov_giseq_' + name).html(html2);
    }

    async processSeqData(chainid_seq) { let ic = this.icn3d, me = ic.icn3dui;
        ic.bAnnoShown = true;

        for(let chnid in ic.protein_chainid) {
            let chnidBase = ic.protein_chainid[chnid];
            //if(chainid_seq.hasOwnProperty(chnid)) {
            //    let allSeq = chainid_seq[chnid];
            if(chainid_seq.hasOwnProperty(chnidBase)) {
                let allSeq = chainid_seq[chnidBase];
                ic.giSeq[chnid] = allSeq;
                
                // the first 10 residues from sequences with structure
                let startResStr = '';
                for(let i = 0; i < 10 && i < ic.chainsSeq[chnid].length; ++i) {
                    startResStr += ic.chainsSeq[chnid][i].name.substr(0, 1);
                }
                let pos = allSeq.toLowerCase().indexOf(startResStr.toLowerCase());
                if(pos == -1) {
                    console.log("The gi sequence didn't match the protein sequence. The start of 3D protein sequence: " + startResStr + ". The gi sequence: " + allSeq.substr(0, 10) + ".");
                    ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
                }
                else {
                    ic.matchedPos[chnid] = pos;
                    ic.baseResi[chnid] = ic.chainsSeq[chnid][0].resi - ic.matchedPos[chnid] - 1;
                }
            }
            else {
                if(!me.bNode) console.log( "No sequence data were found for the chain " + chnid + "..." );
                ic.showSeqCls.setAlternativeSeq(chnid, chnidBase);
            }
                     
            if(me.cfg.blast_rep_id != chnid) {               
                ic.showSeqCls.showSeq(chnid, chnidBase);
            }
            else if(me.cfg.blast_rep_id == chnid && ic.seqStructAlignData === undefined && ic.seqStructAlignDataSmithwm === undefined) {
              let title;
              let query_id = (me.cfg.oriQuery_id) ? me.cfg.oriQuery_id : me.cfg.query_id;
              if(query_id.length > 14) {
                  title = 'Query: ' + query_id.substr(0, 6) + '...';
              }
              else {
                  title =(isNaN(me.cfg.query_id)) ? 'Query: ' + query_id : 'Query: gi ' + query_id;
              }
              let compTitle = undefined;
              let compText = undefined;
              let text = "cannot be aligned";

              ic.queryStart = '';
              ic.queryEnd = '';
              if(ic.bRender) alert('The sequence can NOT be aligned to the structure');
              ic.showSeqCls.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
            }
            else if(me.cfg.blast_rep_id == chnid && (ic.seqStructAlignData !== undefined || ic.seqStructAlignDataSmithwm !== undefined) ) { // align sequence to structure
              let title;
              let query_id = (me.cfg.oriQuery_id) ? me.cfg.oriQuery_id : me.cfg.query_id;
              if(query_id.length > 14) {
                  title = 'Query: ' + query_id.substr(0, 6) + '...';
              }
              else {
                  title =(isNaN(me.cfg.query_id)) ? 'Query: ' + query_id : 'Query: gi ' + query_id;
              }
            
              let evalue, targetSeq, querySeq, segArray;

              if(ic.seqStructAlignData !== undefined) {
                let query, target;
                let data = ic.seqStructAlignData;
                if(data.data !== undefined) {
                    query = data.data[0].query;
                    // if target is sequence, the key is not chnid
                    //target = data.data[0].targets[chnid];
                    let keys = Object.keys(data.data[0].targets);
                    target = data.data[0].targets[keys[0]];

                    target =(target !== undefined && target.hsps.length > 0) ? target.hsps[0] : undefined;
                }

                if(query !== undefined && target !== undefined) {
                    evalue = target.scores.e_value.toPrecision(2);
                    if(evalue > 1e-200) evalue = parseFloat(evalue).toExponential();
                    let bitscore = target.scores.bit_score;
                    // if target is sequence, the key is not chnid
                    // targetSeq = data.targets[chnid].seqdata;
                    let keys = Object.keys(data.targets);
                    targetSeq = data.targets[keys[0]].seqdata;

                    querySeq = query.seqdata;
                    segArray = target.segs;
                }               
              }
              else { // mimic the output of the cgi pwaln.fcgi
                let data = ic.seqStructAlignDataSmithwm;
                evalue = data.score;
                targetSeq = data.target.replace(/-/g, '');
                querySeq = data.query.replace(/-/g, '');
                segArray = [];
                // target, 0-based: orifrom, orito
                // query, 0-based: from, to

                let targetCnt = -1, queryCnt = -1;
                let bAlign = false, seg = {};
                for(let i = 0, il = data.target.length; i < il; ++i) {
                    if(data.target[i] != '-')  ++targetCnt;
                    if(data.query[i] != '-')  ++queryCnt;
                    if(!bAlign && data.target[i] != '-' && data.query[i] != '-') {
                        bAlign = true;
                        seg.orifrom = targetCnt;
                        seg.from = queryCnt;
                    }
                    else if(bAlign && (data.target[i] == '-' || data.query[i] == '-') ) {
                        bAlign = false;
                        seg.orito = (data.target[i] == '-') ? targetCnt : targetCnt - 1;
                        seg.to = (data.query[i] == '-') ? queryCnt : queryCnt - 1;
                        segArray.push(seg);
                        seg = {};
                    }
                }

                // end condition
                if(data.target[data.target.length - 1] != '-' && data.query[data.target.length - 1] != '-') {
                    seg.orito = targetCnt;
                    seg.to = queryCnt;

                    segArray.push(seg);
                }
              }

              let text = '', compText = '';
              ic.queryStart = '';
              ic.queryEnd = '';
                          
              if(segArray !== undefined) {
                  let target2queryHash = {};
                  if(ic.targetGapHash === undefined) ic.targetGapHash = {}
                  ic.fullpos2ConsTargetpos = {}
                  ic.consrvResPosArray = [];
                  let prevTargetTo = 0, prevQueryTo = 0;
                  ic.nTotalGap = 0;
                  ic.queryStart = segArray[0].from + 1;
                  ic.queryEnd = segArray[segArray.length - 1].to + 1;
                  for(let i = 0, il = segArray.length; i < il; ++i) {
                      let seg = segArray[i];
                      if(i > 0) { // determine gap
                        if(seg.orifrom - prevTargetTo < seg.from - prevQueryTo) { // gap in target
                            ic.targetGapHash[seg.orifrom] = {'from': prevQueryTo + 1, 'to': seg.from - 1}
                            ic.nTotalGap += ic.targetGapHash[seg.orifrom].to - ic.targetGapHash[seg.orifrom].from + 1;
                        }
                        else if(seg.orifrom - prevTargetTo > seg.from - prevQueryTo) { // gap in query
                            for(let j = prevTargetTo + 1; j < seg.orifrom; ++j) {
                              target2queryHash[j] = -1; // means gap in query
                            }
                        }
                      }
                      for(let j = 0; j <= seg.orito - seg.orifrom; ++j) {
                          target2queryHash[j + seg.orifrom] = j + seg.from;
                      }
                      prevTargetTo = seg.orito;
                      prevQueryTo = seg.to;
                  }

                  // the missing residues at the end of the seq will be filled up in the API showNewTrack()
                  let nGap = 0;
                  ic.alnChainsSeq[chnid] = [];

                  //let offset =(ic.chainid2offset[chnid]) ? ic.chainid2offset[chnid] : 0;                
                  for(let i = 0, il = targetSeq.length; i < il; ++i) {
                      //text += ic.showSeqCls.insertGap(chnid, i, '-', true);
                      if(ic.targetGapHash.hasOwnProperty(i)) {
                          for(let j = ic.targetGapHash[i].from; j <= ic.targetGapHash[i].to; ++j) {
                              text += querySeq[j];
                          }
                      }
                      compText += ic.showSeqCls.insertGap(chnid, i, '-', true);
                      if(ic.targetGapHash.hasOwnProperty(i)) nGap += ic.targetGapHash[i].to - ic.targetGapHash[i].from + 1;
                      //let pos =(ic.bUsePdbNum) ? i+1 + offset : i+1;
                      let pos =(ic.bUsePdbNum) ? ic.ParserUtilsCls.getResi(chnid, i) : i+1;
                      if(target2queryHash.hasOwnProperty(i) && target2queryHash[i] !== -1) {
                          text += querySeq[target2queryHash[i]];
                          let colorHexStr = this.getColorhexFromBlosum62(targetSeq[i], querySeq[target2queryHash[i]]);
                          if(targetSeq[i] == querySeq[target2queryHash[i]]) {
                              compText += targetSeq[i];
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': 1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.consrvResPosArray.push(pos);
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#FF0000', 'color2': '#' + colorHexStr});
                          }
                          else if(this.conservativeReplacement(targetSeq[i], querySeq[target2queryHash[i]])) {
                              compText += '+';
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': 0, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.consrvResPosArray.push(pos);
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': '#0000FF', 'color2': '#' + colorHexStr});
                          }
                          else {
                              compText += ' ';
                              ic.fullpos2ConsTargetpos[i + nGap] = {'same': -1, 'pos': pos, 'res': targetSeq[i], 'color': colorHexStr}
                              ic.alnChainsSeq[chnid].push({'resi': pos, 'color': me.htmlCls.GREYC, 'color2': '#' + colorHexStr});
                          }
                      }
                      else {
                          text += '-';
                          compText += ' ';
                      }
                  }

                  //title += ', E: ' + evalue;
              }
              else {                
                  text += "cannot be aligned";
                  if(ic.bRender) alert('The sequence can NOT be aligned to the structure');
              }
              let compTitle = (ic.seqStructAlignData !== undefined) ? 'BLAST, E: ' + evalue : 'Score: ' + evalue;
              ic.showSeqCls.showSeq(chnid, chnidBase, undefined, title, compTitle, text, compText);
              let residueidHash = {}
              let residueid;
              if(ic.consrvResPosArray !== undefined) {
                for(let i = 0, il = ic.consrvResPosArray.length; i < il; ++i) {
                    residueid = chnidBase + '_' + ic.consrvResPosArray[i];
                    residueidHash[residueid] = 1;
                    //atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueid]);
                }
              }
              let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
              //ic.selectionCls.selectResidueList(residueidHash, chnidBase + '_blast', compTitle, false);
              ic.selectionCls.selectResidueList(residueidHash, 'protein_aligned', compTitle, false);
              ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
            } // align seq to structure
        } // for loop
        
        if(!me.bNode) {
            this.enableHlSeq();
            // get CDD/Binding sites
            await ic.annoCddSiteCls.showCddSiteAll();
        }
    }

    enableHlSeq() { let ic = this.icn3d, me = ic.icn3dui;
        if(! me.utilsCls.isMobile()) {
            ic.hlSeqCls.selectSequenceNonMobile();
        }
        else {
            ic.hlSeqCls.selectSequenceMobile();
            ic.hlSeqCls.selectChainMobile();
        }
        // highlight seq after the ajax calls
        if(Object.keys(ic.hAtoms).length < Object.keys(ic.dAtoms).length) {
            ic.hlUpdateCls.updateHlSeq();
        }
    }

    getAnDiv(chnid, anno) { let ic = this.icn3d, me = ic.icn3dui;
        let message = 'Loading ' + anno + '...';
        if(anno == 'custom') {
            message = ''
        }
        else if(anno == 'domain') {
            message = 'Loading 3D ' + anno + '...';
        }
        return "<div id='" + ic.pre + anno + "_" + chnid + "'><div id='" + ic.pre + "tt_" + anno + "_" + chnid + "' class='icn3d-fixed-pos' style='display:none!important'></div><div id='" + ic.pre + "dt_" + anno + "_" + chnid + "' style='display:none'>" + message + "</div><div id='" + ic.pre + "ov_" + anno + "_" + chnid + "'>" + message + "</div></div>";
    }
    addButton(chnid, classvalue, name, desc, width, buttonStyle) { let ic = this.icn3d, me = ic.icn3dui;
        return "<div class='" + classvalue + "' chainid='" + chnid + "' style='display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
    }
    addSnpButton(snp, classvalue, name, desc, width, buttonStyle) { let ic = this.icn3d, me = ic.icn3dui;
        return "<div class='" + ic.pre + classvalue + "' snp='" + snp + "' style='margin:3px 0 3px 0; display:inline-block; font-size:11px; font-weight:bold; width:" + width + "px!important;'><button style='-webkit-appearance:" + buttonStyle + "; height:18px; width:" + width + "px;'><span style='white-space:nowrap; margin-left:-3px;' title='" + desc + "'>" + name + "</span></button></div>";
    }
    conservativeReplacement(resA, resB) { let ic = this.icn3d, me = ic.icn3dui;
        let iA =(me.parasCls.b62ResArray.indexOf(resA) !== -1) ? me.parasCls.b62ResArray.indexOf(resA) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let iB =(me.parasCls.b62ResArray.indexOf(resB) !== -1) ? me.parasCls.b62ResArray.indexOf(resB) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let matrixValue = me.parasCls.b62Matrix[iA][iB];
        if(matrixValue > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    getColorhexFromBlosum62(resA, resB) { let ic = this.icn3d, me = ic.icn3dui;
        let color = '333333';

        if(!resA || !resB) return color;
        
        resA = resA.toUpperCase();
        resB = resB.toUpperCase();

        let iA =(me.parasCls.b62ResArray.indexOf(resA) !== -1) ? me.parasCls.b62ResArray.indexOf(resA) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let iB =(me.parasCls.b62ResArray.indexOf(resB) !== -1) ? me.parasCls.b62ResArray.indexOf(resB) : me.parasCls.b62ResArray.length - 1; // or the last one "*"
        let matrixValue = me.parasCls.b62Matrix[iA][iB];
        if(matrixValue === undefined) return '333333';
        // range and color: blue for -4 ~ 0, red for 0 ~ 11
        // max value 221 to avoid white
        
        if(matrixValue > 0) {
            let c = 221 - parseInt(matrixValue / 11.0 * 221);
            let cStr =(c < 10) ? '0' + c.toString(16) : c.toString(16);
            color = 'DD' + cStr + cStr;
        }
        else {
            let c = 221 - parseInt(-1.0 * matrixValue / 4.0 * 221);
            let cStr =(c < 10) ? '0' + c.toString(16) : c.toString(16);
            color = cStr + cStr + 'DD';
        }
        return color;
    }

}

export {ShowAnno}
