/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class MmcifParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Ajax call was used to get the atom data from the "mmcifid". This function was deferred
    //so that it can be chained together with other deferred functions for sequential execution.
    async downloadMmcif(mmcifid) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.bCid = undefined;

        ic.ParserUtilsCls.setYourNote(mmcifid.toUpperCase() + '(MMCIF) in iCn3D');

        // let url = "https://files.rcsb.org/view/" + mmcifid + ".cif";
        let url = "https://files.rcsb.org/download/" + mmcifid + ".cif";
        let data = await me.getAjaxPromise(url, 'text', true);

        // url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
        // let dataObj = {'mmciffile': data};
        // let data2 = await me.getAjaxPostPromise(url, dataObj, true);

        // await this.loadMmcifData(data2, mmcifid);

        let bText = true;
        // let bcifData = ic.bcifParserCls.getBcifJson(data, mmcifid, bText);
        // let bcifJson = JSON.parse(bcifData);

        // await this.loadMmcifData(bcifJson, mmcifid);
        await ic.opmParserCls.loadOpmData(data, mmcifid, undefined, 'mmcif', undefined, bText);
    }

    async downloadMmcifSymmetry(mmcifid, type) { let ic = this.icn3d, me = ic.icn3dui;
      try {
        // let url = "https://files.rcsb.org/download/" + mmcifid + ".cif";
        // let data1 = await me.getAjaxPromise(url, 'text', false, "The structure " + mmcifid + " was not found...");
        // let bText = true;

        let url = 'https://models.rcsb.org/' + mmcifid + '.bcif';
        let data1 = await me.getXMLHttpRqstPromise(url, 'GET', 'arraybuffer', 'bcif');
        let bText = false;

        // url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
        // let dataObj = {'mmcifheader': data1};

        // let data = await me.getAjaxPostPromise(url, dataObj, false, "The mmCIF data of " + mmcifid + " can not be parsed...");

        let bNoCoord = true;
        let bcifData = ic.bcifParserCls.getBcifJson(data1, mmcifid, bText, bNoCoord);

        let data = JSON.parse(bcifData);

        if(data.emd !== undefined) ic.emd = data.emd;
        if(data.organism !== undefined) ic.organism = data.organism;

        if(ic.bAssemblyUseAsu) {
            for(let i = 0, il = data.assembly.length; i < il; ++i) {
                let mat4 = new THREE.Matrix4();
                mat4.fromArray(data.assembly[i]);
    
                ic.biomtMatrices[i] = mat4;
            }
    
            ic.asuCnt = ic.biomtMatrices.length;
    
            // show bioassembly 
            if(me.cfg.bu == 1 && Object.keys(ic.atoms).length * ic.asuCnt > ic.maxatomcnt) {
                ic.bAssembly = true;
            }
        }

        if(type === 'mmtfid' && data.missingseq !== undefined) {
            // adjust missing residues
            let maxMissingResi = 0, prevMissingChain = '';
            //let chainMissingResidueArray = {}
            for(let i = 0, il = data.missingseq.length; i < il; ++i) {
                let resn = data.missingseq[i].resn;
                let chain = data.missingseq[i].chain;
                let resi = data.missingseq[i].resi;

                let chainNum = mmcifid + '_' + chain;

                if(ic.chainMissingResidueArray[chainNum] === undefined) ic.chainMissingResidueArray[chainNum] = [];
                let resObject = {}
                resObject.resi = resi;
                resObject.name = me.utilsCls.residueName2Abbr(resn).toLowerCase();

                if(chain != prevMissingChain) {
                    maxMissingResi = 0;
                }

                // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the first four residues are considered missing
                if(!isNaN(resi) &&(prevMissingChain == '' ||(chain != prevMissingChain) ||(chain == prevMissingChain && resi > maxMissingResi)) ) {
                    ic.chainMissingResidueArray[chainNum].push(resObject);

                    maxMissingResi = resi;
                    prevMissingChain = chain;
                }
            }

            ic.loadPDBCls.adjustSeq(ic.chainMissingResidueArray);
        }

        ///// if(ic.deferredSymmetry !== undefined) ic.deferredSymmetry.resolve();
      }
      catch (err) {
        if(!me.bNode) console.log("mmcifparser.cgi issues: " + err);
        return;
      }
    }

    //Atom "data" from mmCIF file was parsed to set up parameters for the 3D viewer by calling the function
    //loadAtomDataIn. The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    async loadMmcifData(data, mmcifid) { let ic = this.icn3d, me = ic.icn3dui;
        if(!mmcifid) mmcifid = data.mmcif;
        if(!mmcifid) mmcifid = ic.defaultPdbId;

        if(data.atoms !== undefined) {
            ic.init();

            if(data.emd !== undefined) ic.emd = data.emd;
            if(data.organism !== undefined) ic.organism = data.organism;

            await ic.opmParserCls.loadOpmData(data, mmcifid, undefined, 'mmcif');

            ic.opmParserCls.modifyUIMapAssembly();
        }
        else {
            return false;
        }
    }

    async loadMultipleMmcifData(data, mmcifid, bAppend) { let ic = this.icn3d, me = ic.icn3dui;
        let bText = true;
        ic.loadCIFCls.loadCIF(data, mmcifid, bText, bAppend);
        
        if(Object.keys(ic.structures).length > 1) {
            ic.opts['color'] = 'structure';
        }

        ic.opmParserCls.modifyUIMapAssembly();

        ic.pdbParserCls.addSecondary(bAppend);

        // ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        // await ic.ParserUtilsCls.renderStructure();
    }
}

export {MmcifParser}
