/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class OpmParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async downloadOpm(opmid) { let ic = this.icn3d, me = ic.icn3dui;
        ic.ParserUtilsCls.setYourNote(opmid.toUpperCase() + '(OPM) in iCn3D');
 
        //ic.bCid = undefined;
        // no rotation
        ic.bStopRotate = true;

        let url = "https://opm-assets.storage.googleapis.com/pdb/" + opmid.toLowerCase()+ ".pdb";
        let data = await me.getAjaxPromise(url, 'text', true, 'This is probably not a transmembrane protein. It has no data in Orientations of Proteins in Membranes(OPM) database.');

        ic.bOpm = true;
        await ic.pdbParserCls.loadPdbData(data, opmid, ic.bOpm);

        $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
        $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

        $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
        $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);
    }


    async loadOpmData(data, pdbid, bFull, type, pdbid2) { let ic = this.icn3d, me = ic.icn3dui;
        try {
             if(!pdbid) pdbid = ic.defaultPdbId;
            let url = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&opm&uid=" + pdbid.toLowerCase();
    
            let opmdata = await me.getAjaxPromise(url, 'jsonp', false);
    
            this.setOpmData(opmdata); // set ic.bOpm
            await this.parseAtomData(data, pdbid, bFull, type, pdbid2);
        }
        catch(err) {
            await this.parseAtomData(data, pdbid, bFull, type, pdbid2);
        }
    }

    setOpmData(data) { let ic = this.icn3d, me = ic.icn3dui;
        if(data.opm !== undefined && data.opm.rot !== undefined) {
            ic.bOpm = true;

            ic.halfBilayerSize = data.opm.thickness;
            ic.rmsd_supr = {}
            ic.rmsd_supr.rot = data.opm.rot;
            ic.rmsd_supr.trans1 = new THREE.Vector3(data.opm.trans1[0], data.opm.trans1[1], data.opm.trans1[2]);
            ic.rmsd_supr.trans2 = new THREE.Vector3(data.opm.trans2[0], data.opm.trans2[1], data.opm.trans2[2]);
            ic.rmsd_supr.rmsd = data.opm.rmsd;

          $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
          $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

          $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
          $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);
        }
        else {
            ic.bOpm = false;
        }
    }

    async parseAtomData(data, pdbid, bFull, type, pdbid2) { let ic = this.icn3d, me = ic.icn3dui;
        if(type === 'mmtf') {
            await ic.mmtfParserCls.parseMmtfData(data, pdbid, bFull);

            /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
        }
        else if(type === 'mmcif') {
            ic.loadAtomDataCls.loadAtomDataIn(data, data.mmcif, 'mmcifid', undefined, undefined);

            if(Object.keys(ic.structures).length == 1) {
                $("#" + ic.pre + "alternateWrapper").hide();
            }
    
            // load assembly info
            let assembly =(data.assembly !== undefined) ? data.assembly : [];
            for(let i = 0, il = assembly.length; i < il; ++i) {
                if(ic.biomtMatrices[i] == undefined) ic.biomtMatrices[i] = new THREE.Matrix4().identity();
    
                for(let j = 0, jl = assembly[i].length; j < jl; ++j) {
                ic.biomtMatrices[i].elements[j] = assembly[i][j];
                }
            }
    
            if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
                $("#" + ic.pre + "assemblyWrapper").show();
    
                ic.asuCnt = ic.biomtMatrices.length;
            }
            else {
                //$("#" + ic.pre + "assemblyWrapper").hide();
            }
    
            ic.setStyleCls.setAtomStyleByOptions(ic.opts);
            ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
    
            await ic.ParserUtilsCls.renderStructure();
    
            if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

            /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
        }
        else if(type === 'pdb') {
            await ic.pdbParserCls.loadPdbData(data, pdbid);
        }
        else if(type === 'align') {
            if(ic.bOpm) {
                await ic.alignParserCls.downloadAlignmentPart2(pdbid);
                /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
            }
            else {
                if(pdbid2 !== undefined) {
                    await this.loadOpmData(data, pdbid2, bFull, type);
                }
                else {
                    await ic.alignParserCls.downloadAlignmentPart2(pdbid);
                    /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                }
            }
        }
    }
}

export {OpmParser}
