/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class AlignParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Load the VAST+ structure alignment for the pair of structures "align", e.g., "align" could be "1HHO,4N7N".
    async downloadAlignment(align, bDiagramOnly) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.opts['proteins'] = 'c alpha trace';

        let alignArray = align.split(',');
        //var ids_str =(alignArray.length === 2? 'uids=' : 'ids=') + align;
        let ids_str = 'ids=' + align;

    //    let url2 = me.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    //    let url2 = me.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    //    let url1 = me.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c1&b=1&s=1&d=1&' + ids_str;

        // combined url1 and url2
        let url2 = me.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=3&cmd=c&b=1&s=1&w3d&' + ids_str;

        if(me.cfg.inpara !== undefined) {
          //url1 += me.cfg.inpara;
          url2 += me.cfg.inpara;
        }

        //ic.bCid = undefined;

        // define for 'align' only
        ic.pdbid_chain2title = {}

        if(ic.chainids2resids === undefined) ic.chainids2resids = {}; // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

        let seqalign = {};

        let errMess = "These two MMDB IDs " + alignArray + " do not have 3D alignment data in the VAST+ database. You can try the VAST alignment by visiting the VAST+ page https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi?uid=[PDB ID] (e.g., uid=1KQ2), and clicking \"Original VAST\"";

        let data = await me.getAjaxPromise(url2, 'jsonp', true, errMess);

        seqalign = data.seqalign;
        if(seqalign === undefined) {
            alert(errMess);
            return false;
        }

        // set ic.pdbid_molid2chain and ic.chainsColor
        ic.pdbid_molid2chain = {}
        ic.chainsColor = {}
        //ic.mmdbidArray = [];
        //for(let i in data) {

        for(let i = 0, il = 2; i < il; ++i) {
            //if(i === 'seqalign') continue;
            let mmdbTmp = data['alignedStructures'][0][i];

            //var pdbid =(data[i].pdbid !== undefined) ? data[i].pdbid : i;
            let pdbid =(mmdbTmp.pdbId !== undefined) ? mmdbTmp.pdbId : mmdbTmp.mmdbId;
            //ic.mmdbidArray.push(pdbid); // here two molecules are in alphabatic order, themaster molecule could not be the first one

            let chainNameHash = {} // chain name may be the same in assembly
            //for(let molid in mmdbTmp.molecules) {
            for(let j = 0, jl = mmdbTmp.molecules.length; j < jl; ++j) {
                let molecule = mmdbTmp.molecules[j];
                let molid = molecule.moleculeId;
                let chainName = molecule.chain.trim().replace(/_/g, ''); // change "A_1" to "A1"
                if(chainNameHash[chainName] === undefined) {
                    chainNameHash[chainName] = 1;
                }
                else {
                    ++chainNameHash[chainName];
                }

                let finalChain =(chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();

                ic.pdbid_molid2chain[pdbid + '_' + molid] = finalChain;

                if(molecule.kind === 'p' || molecule.kind === 'n') {
                    ic.chainsColor[pdbid + '_' + finalChain] = me.parasCls.thr(me.htmlCls.GREY8);
                }
            }
        }

        //var index = 0;
        //for(let mmdbid in data) {
        ic.mmdbidArray = [];
        for(let i = 0, il = 2; i < il; ++i) {
            //if(index < 2) {
                let mmdbTmp = data['alignedStructures'][0][i];

                let pdbid = mmdbTmp.pdbId;
                ic.mmdbidArray.push(pdbid);

                let molecule = mmdbTmp.molecules;
                for(let molname in molecule) {
                    let chain = molecule[molname].chain;
                    ic.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                }
            //}

            //++index;
        }

        // get the color for each aligned chain pair
        ic.alignmolid2color = [];
        //ic.alignmolid2color[0] = {}
        //ic.alignmolid2color[1] = {}
        let colorLength = me.parasCls.stdChainColors.length;

        for(let i = 0, il = seqalign.length; i < il; ++i) {
            let molid1 = seqalign[i][0].moleculeId;
            let molid2 = seqalign[i][1].moleculeId;

            //ic.alignmolid2color[0][molid1] =(i+1).toString();
            //ic.alignmolid2color[1][molid2] =(i+1).toString();

            let tmpHash = {}
            tmpHash[molid1] =(i+1).toString();
            ic.alignmolid2color.push(tmpHash);

            tmpHash = {}
            tmpHash[molid2] =(i+1).toString();
            ic.alignmolid2color.push(tmpHash);
        }

        if(!bDiagramOnly) {
            //var url3 = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&atomonly=1&uid=" + ic.mmdbidArray[0];
            //var url4 = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&atomonly=1&uid=" + ic.mmdbidArray[1];
            // need the parameter moleculeInfor
            let url3 = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&uid=" + ic.mmdbidArray[0];
            let url4 = me.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&bu=" + me.cfg.bu + "&uid=" + ic.mmdbidArray[1];

            let d3 = me.getAjaxPromise(url3, 'jsonp', true);
            let d4 = me.getAjaxPromise(url4, 'jsonp', true);

            let allPromise = Promise.allSettled([d3, d4]);

            let dataArray = await allPromise;

            let data2 = data;
            // let data3 = (me.bNode) ? dataArray[0] : dataArray[0].value; //v3[0];
            // let data4 = (me.bNode) ? dataArray[1] : dataArray[1].value; //v4[0];
            let data3 = dataArray[0].value; //v3[0];
            let data4 = dataArray[1].value; //v4[0];

            if(data3.atoms !== undefined && data4.atoms !== undefined) {
                // ic.deferredOpm = $.Deferred(function() {
                    //ic.mmdbidArray = [];
                    //for(let i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
                    //    ic.mmdbidArray.push(data.alignedStructures[0][i].pdbId);
                    //}

                    ic.ParserUtilsCls.setYourNote((ic.mmdbidArray[0] + ',' + ic.mmdbidArray[1]).toUpperCase() + '(VAST+) in iCn3D');

                    // get transformation factors
                    let factor = 1; //10000;
                    //var scale = data2.transform.scale / factor;
                    let tMaster = data2.transform.translate.master;
                    let tMVector = new THREE.Vector3(tMaster[0] / factor, tMaster[1] / factor, tMaster[2] / factor);
                    let tSlave = data2.transform.translate.slave;
                    let tSVector = new THREE.Vector3(tSlave[0] / factor, tSlave[1] / factor, tSlave[2] / factor);
                    let rotation = data2.transform.rotate;
                    let rMatrix = [];
                    for(let i = 0, il = rotation.length; i < il; ++i) { // 9 elements
                        rMatrix.push(rotation[i] / factor);
                    }

                    // get sequence
                    ic.chainid2seq = {}
                    for(let chain in data3.sequences) {
                        let chainid = ic.mmdbidArray[0] + '_' + chain;
                        ic.chainid2seq[chainid] = data3.sequences[chain]; // ["0","D","ASP"],
                    }
                    for(let chain in data4.sequences) {
                        let chainid = ic.mmdbidArray[1] + '_' + chain;
                        ic.chainid2seq[chainid] = data4.sequences[chain]; // ["0","D","ASP"],
                    }

                    // atoms
                    let atomsM = data3.atoms;
                    let atomsS = data4.atoms;

                    // fix serialInterval
                    let nAtom1 = data3.atomCount;
                    let nAtom2 = data4.atomCount;

                    for(let i = 0, il = data2.alignedStructures[0].length; i < il; ++i) {
                    let structure = data2.alignedStructures[0][i];

                    structure.serialInterval = [];
                    if(i == 0) {
                        structure.serialInterval.push(1);
                        structure.serialInterval.push(nAtom1);
                    }
                    else if(i == 1) {
                        structure.serialInterval.push(nAtom1 + 1);
                        structure.serialInterval.push(nAtom1 + nAtom2);
                    }
                    }

                    let allAtoms = {}
                    for(let i in atomsM) {
                        let atm = atomsM[i];

                        atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
                        atm.coord.add(tMVector);

                        let x = atm.coord.x * rMatrix[0] + atm.coord.y * rMatrix[1] + atm.coord.z * rMatrix[2];
                        let y = atm.coord.x * rMatrix[3] + atm.coord.y * rMatrix[4] + atm.coord.z * rMatrix[5];
                        let z = atm.coord.x * rMatrix[6] + atm.coord.y * rMatrix[7] + atm.coord.z * rMatrix[8];

                        atm.coord.x = x;
                        atm.coord.y = y;
                        atm.coord.z = z;

                        allAtoms[i] = atm;
                    }

                    for(let i in atomsS) {
                        let atm = atomsS[i];

                        atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
                        atm.coord.add(tSVector);

                        // update the bonds
                        for(let j = 0, jl = atm.bonds.length; j < jl; ++j) {
                            atm.bonds[j] += nAtom1;
                        }

                        allAtoms[(parseInt(i) + nAtom1).toString()] = atm;
                    }

                    // combine data
                    let allData = {}
                    allData.alignedStructures = data2.alignedStructures;
                    allData.alignment = data2.alignment;
                    allData.atoms = allAtoms;

                    await thisClass.loadOpmDataForAlign(allData, seqalign, ic.mmdbidArray);
                // });
                // return ic.deferredOpm.promise();
            }
            else {
                alert('invalid atoms data.');
                return false;
            }
        }
    }

    async downloadAlignmentPart2(data, seqalign, chainresiCalphaHash2) { let ic = this.icn3d, me = ic.icn3dui;
        //ic.init();

        ic.loadAtomDataCls.loadAtomDataIn(data, undefined, 'align', seqalign);

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        // show all
        let allAtoms = {}
        for(let i in ic.atoms) {
            allAtoms[i] = 1;
        }
        ic.dAtoms = allAtoms;
        ic.hAtoms = allAtoms;

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // change the default color to "Identity"
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        // memebrane is determined by one structure. But transform both structures
        if(chainresiCalphaHash2 !== undefined) ic.ParserUtilsCls.transformToOpmOriForAlign(ic.selectedPdbid, chainresiCalphaHash2, true);

        await ic.ParserUtilsCls.renderStructure();

        if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

        ic.html2ddgm = '';

        // by default, open the seq alignment window
        //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
        if(me.cfg.showalignseq) {
            me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        }

        if(me.cfg.show2d && ic.bFullUi) {
            await ic.ParserUtilsCls.set2DDiagramsForAlign(ic.mmdbidArray[0].toUpperCase(), ic.mmdbidArray[1].toUpperCase());
        }

        //if(me.deferred !== undefined) me.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    async loadOpmDataForAlign(data, seqalign, mmdbidArray) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        try {
            let url = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[0].toLowerCase()+ ".pdb";
            let prms1 = me.getAjaxPromise(url, 'text');
            let url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[1].toLowerCase()+ ".pdb";
            let prms2 = me.getAjaxPromise(url2, 'text');

            let allPromise = Promise.allSettled([prms1, prms2]);

            let dataArray = await allPromise;

            let bFound = false;
            for(let i = 0, il = dataArray.length; i < il; ++i) {
                // if(dataArray[i].status == 'rejected') continue;

                let opmdata = dataArray[i].value;
                if(!opmdata) continue;

                ic.selectedPdbid = mmdbidArray[i];

                ic.bOpm = true;
                let bVector = true;
                let chainresiCalphaHash = ic.loadPDBCls.loadPDB(opmdata, mmdbidArray[i], ic.bOpm, bVector); // defined in the core library

                $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
                $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

                $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
                $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

                ic.init(); // remove all previously loaded data

                await thisClass.downloadAlignmentPart2(data, seqalign, chainresiCalphaHash);

                bFound = true;

                /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();

                // use the first one with membrane
                break;
            }

            if(!bFound) {
                ic.init(); // remove all previously loaded data
                await thisClass.downloadAlignmentPart2(data, seqalign);
            }
        }
        catch(err) {
            ic.init(); // remove all previously loaded data
            await thisClass.downloadAlignmentPart2(data, seqalign);

            /// if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
            return;
        }
    }
}

export {AlignParser}
