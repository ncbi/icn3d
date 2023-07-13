/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class PdbParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the "pdbid". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. A wrapper
    //was added to support both http and https.
    async downloadPdb(pdbid, bAf) { let ic = this.icn3d, me = ic.icn3dui;
        let url;

        if(bAf) {
            url = "https://alphafold.ebi.ac.uk/files/AF-" + pdbid + "-F1-model_" + ic.AFUniprotVersion + ".pdb";
            if(me.cfg.refseqid) {
                ic.ParserUtilsCls.setYourNote(me.cfg.refseqid.toUpperCase() + '(NCBI Protein Acc.) in iCn3D');
            }
            else if(me.cfg.protein) {
                ic.ParserUtilsCls.setYourNote(me.cfg.protein + '(NCBI Protein/Gene) in iCn3D');
            }
            else {
                ic.ParserUtilsCls.setYourNote(pdbid.toUpperCase() + '(AlphaFold) in iCn3D');
            }
        }
        else {
            url = "https://files.rcsb.org/view/" + pdbid + ".pdb";
            pdbid = pdbid.toUpperCase();
            ic.ParserUtilsCls.setYourNote(pdbid + '(PDB) in iCn3D');
        }

        //ic.bCid = undefined;

        let data = await me.getAjaxPromise(url, 'text', true, 'The ID ' + pdbid + ' can not be found in the server ' + url + '...');

        if(bAf) {
            // add UniProt ID into the header
            let header = 'HEADER                                                        ' + pdbid + '\n';
            data = header + data;          
            await ic.opmParserCls.parseAtomData(data, pdbid, undefined, 'pdb', undefined);
        }
        else {
            await ic.opmParserCls.loadOpmData(data, pdbid, undefined, 'pdb');
        }
    }

    //Load structures from a "URL". Due to the same domain policy of Ajax call, the URL should be in the same
    //domain. "type" could be "pdb", "mol2", "sdf", "xyz", "icn3dpng", or "pae" 
    //for pdb file, mol2file, sdf file, xyz file, iCn3D PNG image, and ALphaFold PAE file, respectively.
    async downloadUrl(url, type, command) { let ic = this.icn3d, me = ic.icn3dui;
        let pos = url.lastIndexOf('/');
        if(pos != -1) {
            let posDot = url.lastIndexOf('.');
            ic.filename = url.substr(pos + 1, posDot - pos - 1);
        }
        else {
            let posDot = url.lastIndexOf('.');
            ic.filename = url.substr(0, posDot);
        }

        //ic.bCid = undefined;

        let data = await me.getAjaxPromise(url, 'text', true);

        ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + data : data;
        ic.InputfileType = type;

        if(type === 'pdb') {
            await this.loadPdbData(data);
            //await ic.loadScriptCls.loadScript(command, undefined, true);
        }
        else if(type === 'mmcif') {
            let url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
            let dataObj = {'mmciffile': data};
            let data2 = await me.getAjaxPostPromise(url, dataObj, true);
            await ic.mmcifParserCls.loadMmcifData(data2, undefined);
        }
        else if(type === 'mol2') {
            await ic.mol2ParserCls.loadMol2Data(data);
        }
        else if(type === 'sdf') {
            await ic.sdfParserCls.loadSdfData(data);
        }
        else if(type === 'xyz') {
            await ic.xyzParserCls.loadXyzData(data);
        }
        else if(type === 'mmcif') {
            await ic.mmcifParserCls.loadMmcifData(data);
        }
        else if(type === 'icn3dpng') {
            await me.htmlCls.setHtmlCls.loadPng(data, command);
        }
        else if(type === 'pae') {
            me.htmlCls.dialogCls.openDlg('dl_alignerrormap', 'Show Predicted Aligned Error (PAE) map');
            let bFull = true;
            ic.contactMapCls.processAfErrorMap(JSON.parse(data), bFull);
        }
    }

    //Atom "data" from PDB file was parsed to set up parameters for the 3D viewer. The deferred parameter
    //was resolved after the parsing so that other javascript code can be executed.
    async loadPdbData(data, pdbid, bOpm, bAppend, type, bLastQuery, bNoDssp, bEsmfold) { let ic = this.icn3d, me = ic.icn3dui;
        if(!bAppend && (type === undefined || type === 'target')) {
            // if a command contains "load...", the commands should not be cleared with init()
            let bKeepCmd = (ic.bCommandLoad) ? true : false;
            if(!ic.bStatefile) ic.init(bKeepCmd);
        }

        let hAtoms = ic.loadPDBCls.loadPDB(data, pdbid, bOpm, undefined, undefined, bAppend, type, bEsmfold); // defined in the core library

        if(me.cfg.opmid === undefined) ic.ParserUtilsCls.transformToOpmOri(pdbid);

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
          if(!me.bNode) $("#" + ic.pre + "assemblyWrapper").show();

          ic.asuCnt = ic.biomtMatrices.length;
        }
        else {
          //$("#" + ic.pre + "assemblyWrapper").hide();
        }

        if(!me.bNode) {
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
        }

        // calculate secondary structures if not available
        // DSSP only works for structures with all atoms. The Calpha only strucutres didn't work
        //if(!ic.bSecondaryStructure && !bCalphaOnly) {
        let bCalcSecondary = false;
        if(ic.bSecondaryStructure && Object.keys(ic.structures).length == 1) {
            bCalcSecondary = false;
        }
        else if(!me.cfg.mmtfid && !me.cfg.pdbid && !me.cfg.opmid && !me.cfg.mmdbid && !me.cfg.gi && !me.cfg.uniprotid && !me.cfg.blast_rep_id && !me.cfg.cid && !me.cfg.mmcifid && !me.cfg.align && !me.cfg.chainalign) {
            bCalcSecondary = true;
        }

//        if(!ic.bSecondaryStructure && Object.keys(ic.proteins).length > 0) {
        if((!ic.bSecondaryStructure || bCalcSecondary) && Object.keys(ic.proteins).length > 0 && !bNoDssp) {    
            await this.applyCommandDssp(bAppend);
        }
        else {
            // could this line be removed?
            await this.loadPdbDataRender(bAppend);

            if(!me.bNode) await ic.ParserUtilsCls.checkMemProteinAndRotate();

            /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
        }

        return hAtoms;
    }

    async applyCommandDssp(bAppend) { let ic = this.icn3d, me = ic.icn3dui;
        // ic.deferredSecondary = $.Deferred(function() {
        //     let bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(ic.proteins, ic.atoms));//, 'CA');
        //     ic.dsspCls.applyDssp(bCalphaOnly, bAppend);
        // }); // end of me.deferred = $.Deferred(function() {

        // return ic.deferredSecondary.promise();

        let bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(ic.proteins, ic.atoms));//, 'CA');
        await ic.dsspCls.applyDssp(bCalphaOnly, bAppend);
    }

    async loadPdbDataRender(bAppend) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.pmid = ic.pmid;

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        //if(me.cfg.afid && !ic.bAfMem && !me.cfg.blast_rep_id) {
        if( (me.cfg.afid && !ic.bAfMem) || ic.bEsmfold) {
            ic.opts['color'] = 'confidence';
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
//        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

        await ic.ParserUtilsCls.renderStructure();

        ic.saveFileCls.showTitle();

        if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

        if(bAppend) {
            // show all
            ic.definedSetsCls.setModeAndDisplay('all');
        }

    //    if(me.deferred !== undefined) me.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }
}

export {PdbParser}
