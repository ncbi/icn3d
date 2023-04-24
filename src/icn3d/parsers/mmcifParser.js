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

        let url = "https://files.rcsb.org/view/" + mmcifid + ".cif";
        let data = await me.getAjaxPromise(url, 'text', true);

        url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
        let dataObj = {'mmciffile': data};
        let data2 = await me.getAjaxPostPromise(url, dataObj, true);

        await this.loadMmcifData(data2, mmcifid);
    }

    async downloadMmcifSymmetry(mmcifid, type) { let ic = this.icn3d, me = ic.icn3dui;
        // https://files.rcsb.org/header/ is not accessible in Node.js and Mac
        //let url = (me.bNode) ? "https://files.rcsb.org/view/" + mmcifid + ".cif" : "https://files.rcsb.org/header/" + mmcifid + ".cif";
        let url = (me.bNode || me.utilsCls.isMac()) ? "https://files.rcsb.org/view/" + mmcifid + ".cif" : "https://files.rcsb.org/header/" + mmcifid + ".cif";

        //ic.bCid = undefined;
        let data1 = await me.getAjaxPromise(url, 'text', false, "The structure " + mmcifid + " was not found...");

        url = me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
        let dataObj = {'mmcifheader': data1};
        let data = await me.getAjaxPostPromise(url, dataObj, false, "The mmCIF data of " + mmcifid + " can not be parsed...");

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

                // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
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

    //Atom "data" from mmCIF file was parsed to set up parameters for the 3D viewer by calling the function
    //loadAtomDataIn. The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    async loadMmcifData(data, mmcifid) { let ic = this.icn3d, me = ic.icn3dui;
        if(!mmcifid) mmcifid = data.mmcif;
        if(!mmcifid) mmcifid = ic.defaultPdbId;

        if(data.atoms !== undefined) {
            ic.init();

            if(data.emd !== undefined) ic.emd = data.emd;
            if(data.organism !== undefined) ic.organism = data.organism;

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

            await ic.opmParserCls.loadOpmData(data, mmcifid, undefined, 'mmcif');
        }
        else {
            //alert('invalid atoms data.');
            return false;
        }
    }
}

export {MmcifParser}
