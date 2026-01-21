/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class DcdParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
        icn3d.DELTA = 1;
        icn3d.TIMEOFFSET = 0;
    }

    async loadDcdData(data) { let ic = this.icn3d, me = ic.icn3dui;
        let bResult = this.loadDcdAtomData(data);

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The DCD file has the wrong format...');
        }
        else {
          ic.setStyleCls.setAtomStyleByOptions(ic.opts);
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

          // hide water, ions
          ic.dAtoms = me.hashUtilsCls.cloneHash(ic.proteins);
          ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.nucleotides);
          ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.chemicals);
          ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
          ic.transformCls.zoominSelection();
                    
        //   ic.bRender = true;
          await ic.ParserUtilsCls.renderStructure();

          if(me.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(me.cfg.rotate, true);

          //if(me.deferred !== undefined) me.deferred.resolve(); /// if(ic.deferred2 !== undefined) ic.deferred2.resolve();
        }
    }

    // modified from https://github.com/molstar/molstar/blob/master/src/mol-io/reader/dcd/parser.ts
    loadDcdAtomData(data) { let ic = this.icn3d, me = ic.icn3dui;
        // http://www.ks.uiuc.edu/Research/vmd/plugins/molfile/dcdplugin.html

        // The DCD format is structured as follows
        //   (FORTRAN UNFORMATTED, with Fortran data type descriptions):
        // HDR     NSET    ISTRT   NSAVC   5-ZEROS NATOM-NFREAT    DELTA   9-ZEROS
        // `CORD'  #files  step 1  step    zeroes  (zero)          timestep  (zeroes)
        //                         interval
        // C*4     INT     INT     INT     5INT    INT             DOUBLE  9INT
        // ==========================================================================
        // NTITLE          TITLE
        // INT (=2)        C*MAXTITL
        //                 (=32)
        // ==========================================================================
        // NATOM
        // #atoms
        // INT
        // ==========================================================================
        // X(I), I=1,NATOM         (DOUBLE)
        // Y(I), I=1,NATOM
        // Z(I), I=1,NATOM
        // ==========================================================================

        let bin =(data.buffer && data.buffer instanceof ArrayBuffer) ? data.buffer : data;
        const dv = new DataView(bin);

        // const header: Mutable<DcdHeader> = Object.create(null);
        // const frames: DcdFrame[] = [];
        const header = {};

        let nextPos = 0;

        // header block

        const intView = new Int32Array(bin, 0, 23);
        const ef = intView[0] !== dv.getInt32(0); // endianess flag
        // swap byte order when big endian (84 indicates little endian)
        if (intView[0] !== 84) {
            const n = data.byteLength;
            for (let i = 0; i < n; i += 4) {
                dv.setFloat32(i, dv.getFloat32(i), true);
            }
        }
        if (intView[0] !== 84) {
            console.error('dcd bad format, header block start');
            return false;
        }

        // format indicator, should read 'CORD'
        const formatString = String.fromCharCode(
            dv.getUint8(4), dv.getUint8(5),
            dv.getUint8(6), dv.getUint8(7)
        );
        if (formatString !== 'CORD') {
            console.error('dcd bad format, format string');
            return false;
        }
        let isCharmm = false;
        let extraBlock = false;
        let fourDims = false;
        // version field in charmm, unused in X-PLOR
        if (intView[22] !== 0) {
            isCharmm = true;
            if (intView[12] !== 0) extraBlock = true;
            if (intView[13] === 1) fourDims = true;
        }
        header.NSET = intView[2];
        header.ISTART = intView[3];
        header.NSAVC = intView[4];
        header.NAMNF = intView[10];

        if (isCharmm) {
            header.DELTA = dv.getFloat32(44, ef);
        } else {
            header.DELTA = dv.getFloat64(44, ef);
        }

        if (intView[22] !== 84) {
            console.error('dcd bad format, header block end');
            return false;
        }
        nextPos = nextPos + 21 * 4 + 8;

        // title block

        const titleEnd = dv.getInt32(nextPos, ef);
        const titleStart = nextPos + 1;
        if ((titleEnd - 4) % 80 !== 0) {
            console.error('dcd bad format, title block start');
            return false;
        }
        
        let byteView = new Uint8Array(bin);     
        header.TITLE = String.fromCharCode.apply(null, byteView.subarray(titleStart, titleEnd));
        if (dv.getInt32(titleStart + titleEnd + 4 - 1, ef) !== titleEnd) {
            console.error('dcd bad format, title block end');
            return false;
        }

        nextPos = nextPos + titleEnd + 8;

        // natom block

        if (dv.getInt32(nextPos, ef) !== 4) {
            console.error('dcd bad format, natom block start');
            return false;
        }
        header.NATOM = dv.getInt32(nextPos + 4, ef);
        if (dv.getInt32(nextPos + 8, ef) !== 4) {
            console.error('dcd bad format, natom block end');
            return false;
        }
        nextPos = nextPos + 4 + 8;

        // fixed atoms block

        if (header.NAMNF > 0) {
            // TODO read coordinates and indices of fixed atoms
            console.error('dcd format with fixed atoms unsupported, aborting');
            return false;
        }

        // frames
        const natom = header.NATOM;
        const natom4 = natom * 4;

        if(natom != Object.keys(ic.atoms).length) {
            alert('The number of atoms in the DCD file does not match the number of atoms in the PDB file: ' + natom + ' != ' + Object.keys(ic.atoms).length);
            return false;
        }

        let structuresOri = me.hashUtilsCls.cloneHash(ic.structures);
        let residuesOri = me.hashUtilsCls.cloneHash(ic.residues);
        let chainsOri = me.hashUtilsCls.cloneHash(ic.chains);

        let proteinsOri = me.hashUtilsCls.cloneHash(ic.proteins);
        let nucleotidesOri = me.hashUtilsCls.cloneHash(ic.nucleotides);
        let waterOri = me.hashUtilsCls.cloneHash(ic.water);
        let ionsOri = me.hashUtilsCls.cloneHash(ic.ions);
        let chemicalsOri = me.hashUtilsCls.cloneHash(ic.chemicals);    

        let stride = parseInt($("#" + me.pre + "md_stride").val());
        if(isNaN(stride) || stride < 1) stride = 1;

        ic.frames = header.NSET / stride + 1; // including the first frame from PDB
        ic.DELTA = header.DELTA * stride;

        let serial = natom + 1; // a preloaded PDB structure would have atom serial from 1 to natom
        for (let index = 0, n = header.NSET; index < n; ++index) {
            if(index == 0 || index % stride != 0) { // skip the first structure since it was read from PDB already
                // skip this frame
                nextPos += extraBlock ? 4 + 48 + 4 : 0; // unit cell
                nextPos += 3 * (4 + natom4 + 4); // xyz
                nextPos += fourDims ? 4 + dv.getInt32(nextPos, ef) + 4 : 0;
                continue;
            }

            let i = index / stride;

            const frame = {};
            frame.elementCount = natom;

            if (extraBlock) {
                nextPos += 4; // block start
                frame.cell = [
                    dv.getFloat64(nextPos, ef),
                    dv.getFloat64(nextPos + 1, ef),
                    dv.getFloat64(nextPos + 2 * 8, ef),
                    dv.getFloat64(nextPos + 3 * 8, ef),
                    dv.getFloat64(nextPos + 4 * 8, ef),
                    dv.getFloat64(nextPos + 5 * 8, ef)
                ];
                nextPos += 48;
                nextPos += 4; // block end
            }

            // xyz coordinates
            for (let j = 0; j < 3; ++j) {
                if (dv.getInt32(nextPos, ef) !== natom4) {
                    console.error(`dcd bad format, coord block start: ${i}, ${j}`);
                    return false;
                }
                nextPos += 4; // block start
                const c = new Float32Array(bin, nextPos, natom);
                if (j === 0) frame.x = c;
                else if (j === 1) frame.y = c;
                else frame.z = c;

                nextPos += natom4;
                if (dv.getInt32(nextPos, ef) !== natom4) {
                    console.error(`dcd bad format, coord block end: ${i}, ${j}`);
                    return false;
                }
                nextPos += 4; // block end
            }

            if (fourDims) {
                const bytes = dv.getInt32(nextPos, ef);
                nextPos += 4 + bytes + 4; // block start + skip + block end
            }

            let molNum = i + 1; // to avoid the same molNum as the PDB structure
            for(let j = 0; j < natom; ++j) {
                let coord = new THREE.Vector3(frame.x[j], frame.y[j], frame.z[j]);

                let atom = me.hashUtilsCls.cloneHash(ic.atoms[j + 1]);

                atom.serial = serial;
                atom.structure = atom.structure + molNum;
                atom.coord = coord;
                atom.bonds = [].concat(ic.atoms[j + 1].bonds);

                // update bonds
                for(let k = 0, kl = atom.bonds.length; k < kl; ++k) {
                    atom.bonds[k] = parseInt(atom.bonds[k]) + natom * i;
                }

                ic.atoms[serial] = atom;

                // assign extra info
                ic.dAtoms[serial] = 1;
                ic.hAtoms[serial] = 1;

                let chainid = atom.structure + '_' + atom.chain;
                let residid = chainid + '_' + atom.resi;
                ic.secondaries[residid] = atom.ss;
                ic.residueId2Name[residid] = me.utilsCls.residueName2Abbr(atom.resn);

                ++serial;
            }

            // update ic.structures, ic.residues and ic.chains
            for(let structure in structuresOri) {
                let structure2 = structure + molNum;
                ic.structures[structure2] = [];

                for(let k = 0, kl = structuresOri[structure].length; k < kl; ++k) {
                    let idArray = structuresOri[structure][k].split('_');
                    ic.structures[structure2].push(structure2 + '_' + idArray[1]);
                }
            }

            for(let j in residuesOri) {
                let idArray = j.split('_');
                let structure2 = idArray[0] + molNum;
                let residid2 = structure2 + '_' + idArray[1] + '_' + idArray[2];
                ic.residues[residid2] = {};

                for(let k in residuesOri[j]) {
                    ic.residues[residid2][parseInt(k) + natom * i] = 1;
                }
            }

            for(let j in chainsOri) {
                let idArray = j.split('_');
                let structure2 = idArray[0] + molNum;
                let chainid2 = structure2 + '_' + idArray[1];
                
                // ic.chainsSeq[chainid2] = [].concat(ic.chainsSeq[j]);

                ic.chains[chainid2] = {};
                for(let k in chainsOri[j]) {
                    ic.chains[chainid2][parseInt(k)+ natom * i] = 1;
                }
            }

            // update ic.proteins, etc
            for(let j in proteinsOri) {
                ic.proteins[parseInt(j) + natom * i] = 1;
            }
            for(let j in nucleotidesOri) {
                ic.nucleotides[parseInt(j) + natom * i] = 1;
            }
            for(let j in waterOri) {
                ic.water[parseInt(j) + natom * i] = 1;
            }
            for(let j in ionsOri) {
                ic.ions[parseInt(j) + natom * i] = 1;
            }
            for(let j in chemicalsOri) {
                ic.chemicals[parseInt(j) + natom * i] = 1;
            }

            // set ic.ncbi2resid and ic.resid2ncbi
            for(let chainid in chainsOri) {
                let idArray = chainid.split('_');
                let structure2 = idArray[0] + molNum;
                let chainid2 = structure2 + '_' + idArray[1];

                for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                    // NCBI residue number starts from 1 and increases continuously
                    let residNCBI = chainid2 + '_' + (j+1).toString();
                    let resid = chainid2 + '_' + ic.chainsSeq[chainid][j].resi;
                    ic.ncbi2resid[residNCBI] = resid;
                    ic.resid2ncbi[resid] = residNCBI;
                }
            }
        } 

        ic.molTitle = header.TITLE;
        ic.inputid = 'stru';

        // ic.ParserUtilsCls.setMaxD();

        ic.saveFileCls.showTitle();

        return true;
    }

    async showRmsdHbondPlot(bHbondPlot) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bChartjs === undefined) {
            let url = "https://cdn.jsdelivr.net/npm/chart.js";
            await me.getAjaxPromise(url, 'script');

            ic.bChartjs = true;
        }

        if(bHbondPlot) {
            $("#" + me.hbondplotid).empty();
            me.htmlCls.dialogCls.openDlg('dl_hbondplot', 'H-bond Plot');
        }
        else {
            $("#" + me.rmsdplotid).empty();
            me.htmlCls.dialogCls.openDlg('dl_rmsdplot', 'RMSD Plot');
        }

        let dataSet = [];
        let structureArray = Object.keys(ic.structures);
        if(bHbondPlot) {
            for(let i = 0, il = structureArray.length; i < il; ++i) {
                if(i > 0) {
                    let type = 'save1';
                    let stru = structureArray[i];
                    let atomSet = {};
                    for(let j = 0, jl = ic.structures[stru].length; j < jl; ++j) {
                        let chainid = ic.structures[stru][j];
                        for(let k in ic.chains[chainid]) {
                            let atom = ic.atoms[k];
                            if(!ic.water.hasOwnProperty(atom.serial) && !ic.ions.hasOwnProperty(atom.serial)) atomSet[k] = 1;
                        }
                    }

                    let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atomSet);
                    let command = structureArray[i] + '_nonSol'; // exclude solvent and ions 
                    let residArray = Object.keys(residueHash);
                    ic.selectionCls.addCustomSelection(residArray, command, command, 'select ' + command, true);
                    let nameArray = [command];
                    let nameArray2 = [command];

                    let result = await ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, false, type,
                        true, false, false, false, false, false, undefined, bHbondPlot);
                    let bondCnt = result.bondCnt;

                    let hBondCnt = 0;
                    for(let j = 0, jl = bondCnt.length; j < jl; ++j) {
                        hBondCnt += bondCnt[j].cntHbond; // + bondCnt[j].cntIonic + bondCnt[j].cntHalegen + bondCnt[j].cntPication + bondCnt[j].cntPistacking;
                    }

                    let time = ic.TIMEOFFSET + (i * ic.DELTA).toPrecision(4);
                    dataSet.push({x: time, y: hBondCnt});
                }
            }

            ic.viewInterPairsCls.resetInteractionPairs();
        }
        else {
            let coord1 = [], coord2 = [];
            for(let i = 0, il = structureArray.length; i < il; ++i) {
                let chainArray = ic.structures[structureArray[i]];

                let coord = [];
                let nAtoms = 0;
                for(let j = 0, jl = chainArray.length; j < jl; ++j) {
                    let chainid = chainArray[j];
                    for(let k in ic.chains[chainid]) {
                        let atom = ic.atoms[k];
                        // only align proteins, nucleotides, or chemicals
                        if(ic.proteins.hasOwnProperty(atom.serial) || ic.nucleotides.hasOwnProperty(atom.serial) || ic.chemicals.hasOwnProperty(atom.serial)) {
                            coord.push(atom.coord);
                            ++nAtoms;
                        }
                    }
                }

                if(i == 0) {
                    coord1 = [].concat(coord);
                }
                else {
                    coord2 = coord;
                }

                if(i > 0) {
                    let result = me.rmsdSuprCls.getRmsdSuprCls(coord1, coord2, nAtoms);
                    let rmsd = (result.rmsd * 0.1).toPrecision(4); // convert from Å to nm

                    let time = ic.TIMEOFFSET + (i * ic.DELTA).toPrecision(4);
                    dataSet.push({x: time, y: rmsd});
                }
            }
        }

        ic.mdDataSet = dataSet; 
        if(me.bNode) console.log(dataSet);

        let stepSize = (structureArray.length - 1) * ic.DELTA / 10; // 10 ticks

        // https://www.chartjs.org/docs/latest/samples/line/line.html
        // const ctx = $("#" + me.rmsdplotid)[0].getContext('2d');
        const ctx = (bHbondPlot) ? $("#" + me.hbondplotid)[0] : $("#" + me.rmsdplotid)[0];

        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: (bHbondPlot) ? 'H-bonds' : 'RMSD',
                    data: dataSet
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { // X-axis configuration
                        title: {
                            display: true, // Show the X-axis label
                            text: 'Time (ps)'  // Text for the X-axis label
                        },
                        type: 'linear', // Required for numerical x-axis
                        position: 'bottom',
                        ticks: {
                            stepSize: stepSize
                        }
                    },
                    y: { // Y-axis configuration (defaults to numeric scale)
                        title: {
                            display: true, // Show the Y-axis label
                            text: (bHbondPlot) ? 'Number of H-bonds' : 'RMSD (nm)'  // Text for the Y-axis label
                        }
                    }
                }
            }
        });
    }
}

export {DcdParser}
