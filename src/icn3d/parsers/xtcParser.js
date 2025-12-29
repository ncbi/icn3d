/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class XtcParser {
    constructor(icn3d) {
        this.icn3d = icn3d;

        icn3d.DELTA = 1;
        icn3d.TIMEOFFSET = 0;

        this.MagicInts = new Uint32Array([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
            80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
            1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003,
            16384, 20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031,
            131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561,
            832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021,
            4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216
        ]);
        this.FirstIdx = 9;

        this._tmpBytes = new Uint8Array(32);
        let _buffer = new ArrayBuffer(8 * 3);
        this.buf = new Int32Array(_buffer);
        this.uint32view = new Uint32Array(_buffer);
        this.intBytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    async loadXtcData(data) { let ic = this.icn3d, me = ic.icn3dui;
        let bResult = this.loadXtcAtomData(data);

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The XTC file has the wrong format...');
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


    // modified from https://github.com/molstar/molstar/blob/master/src/mol-io/reader/xtc/parser.ts
    loadXtcAtomData(data) { let ic = this.icn3d, me = ic.icn3dui;
        // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/xtcio.cpp
        // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/libxdrf.cpp

        let bin =(data.buffer && data.buffer instanceof ArrayBuffer) ? data.buffer : data;

        // const dv = new DataView(bin, data.byteOffset);
        const dv = new DataView(bin);

        data = new Uint8Array(bin);

        // const f = {
        //     frames: [],
        //     boxes: [],
        //     times: [],
        //     timeOffset: 0,
        //     deltaTime: 0
        // };

        const coordinates = []; //f.frames;
        const boxes = []; //f.boxes;
        const times = []; //f.times;

        const minMaxInt = [0, 0, 0, 0, 0, 0];
        const sizeint = [0, 0, 0];
        const bitsizeint = [0, 0, 0];
        const sizesmall = [0, 0, 0];
        const thiscoord = [0.1, 0.1, 0.1];
        const prevcoord = [0.1, 0.1, 0.1];

        let offset = 0, natom;

        while (true) {
            let frameCoords;

            // const magicnum = dv.getInt32(offset)
            natom = dv.getInt32(offset + 4);
            // const step = dv.getInt32(offset + 8)
            offset += 12;

            if(natom != Object.keys(ic.atoms).length) {
                alert('The number of atoms in the XTC file does not match the number of atoms in the PDB file: ' + natom + ' != ' + Object.keys(ic.atoms).length);
                return false;
            }

            times.push(dv.getFloat32(offset));
            offset += 4;

            const box = new Float32Array(9);
            for (let i = 0; i < 9; ++i) {
                box[i] = dv.getFloat32(offset) * 10;
                offset += 4;
            }
            boxes.push(box);

            if (natom <= 9) { // no compression
                frameCoords = { count: natom, x: new Float32Array(natom), y: new Float32Array(natom), z: new Float32Array(natom) };
                offset += 4;
                for (let i = 0; i < natom; ++i) {
                    frameCoords.x[i] = dv.getFloat32(offset);
                    frameCoords.y[i] = dv.getFloat32(offset + 4);
                    frameCoords.z[i] = dv.getFloat32(offset + 8);
                    offset += 12;
                }
            } else {
                this.buf[0] = this.buf[1] = this.buf[2] = 0;
                sizeint[0] = sizeint[1] = sizeint[2] = 0;
                sizesmall[0] = sizesmall[1] = sizesmall[2] = 0;
                bitsizeint[0] = bitsizeint[1] = bitsizeint[2] = 0;
                thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;
                prevcoord[0] = prevcoord[1] = prevcoord[2] = 0;

                frameCoords = { count: natom, x: new Float32Array(natom), y: new Float32Array(natom), z: new Float32Array(natom) };
                let lfp = 0;

                const lsize = dv.getInt32(offset);
                offset += 4;
                const precision = dv.getFloat32(offset);
                offset += 4;

                minMaxInt[0] = dv.getInt32(offset);
                minMaxInt[1] = dv.getInt32(offset + 4);
                minMaxInt[2] = dv.getInt32(offset + 8);
                minMaxInt[3] = dv.getInt32(offset + 12);
                minMaxInt[4] = dv.getInt32(offset + 16);
                minMaxInt[5] = dv.getInt32(offset + 20);
                sizeint[0] = minMaxInt[3] - minMaxInt[0] + 1;
                sizeint[1] = minMaxInt[4] - minMaxInt[1] + 1;
                sizeint[2] = minMaxInt[5] - minMaxInt[2] + 1;
                offset += 24;

                let bitsize;
                if ((sizeint[0] | sizeint[1] | sizeint[2]) > 0xffffff) {
                    bitsizeint[0] = this.sizeOfInt(sizeint[0]);
                    bitsizeint[1] = this.sizeOfInt(sizeint[1]);
                    bitsizeint[2] = this.sizeOfInt(sizeint[2]);
                    bitsize = 0; // flag the use of large sizes
                } else {
                    bitsize = this.sizeOfInts(3, sizeint);
                }

                let smallidx = dv.getInt32(offset);
                offset += 4;

                let tmpIdx = smallidx - 1;
                tmpIdx = (this.FirstIdx > tmpIdx) ? this.FirstIdx : tmpIdx;
                let smaller = (this.MagicInts[tmpIdx] / 2) | 0;
                let smallnum = (this.MagicInts[smallidx] / 2) | 0;

                sizesmall[0] = sizesmall[1] = sizesmall[2] = this.MagicInts[smallidx];

                const adz = Math.ceil(dv.getInt32(offset) / 4) * 4;
                offset += 4;

                const invPrecision = 1.0 / precision;
                let run = 0;
                let i = 0;

                // const this.buf8 = new Uint8Array(data.this.buffer, data.byteOffset + offset, 32 * 4); // 229...

                thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;

                while (i < lsize) {
                    if (bitsize === 0) {
                        thiscoord[0] = this.decodeBits(data, offset, bitsizeint[0]);
                        thiscoord[1] = this.decodeBits(data, offset, bitsizeint[1]);
                        thiscoord[2] = this.decodeBits(data, offset, bitsizeint[2]);
                    } else {
                        this.decodeInts(data, offset, bitsize, sizeint, thiscoord);
                    }

                    i++;

                    thiscoord[0] += minMaxInt[0];
                    thiscoord[1] += minMaxInt[1];
                    thiscoord[2] += minMaxInt[2];

                    prevcoord[0] = thiscoord[0];
                    prevcoord[1] = thiscoord[1];
                    prevcoord[2] = thiscoord[2];

                    const flag = this.decodeBits(data, offset, 1);
                    let isSmaller = 0;

                    if (flag === 1) {
                        run = this.decodeBits(data, offset, 5);
                        isSmaller = run % 3;
                        run -= isSmaller;
                        isSmaller--;
                    }

                    // if ((lfp-ptrstart)+run > size3){
                    //   fprintf(stderr, "(xdrfile error) Buffer overrun during decompression.\n");
                    //   return 0;
                    // }

                    if (run > 0) {
                        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;

                        for (let k = 0; k < run; k += 3) {
                            this.decodeInts(data, offset, smallidx, sizesmall, thiscoord);
                            i++;

                            thiscoord[0] += prevcoord[0] - smallnum;
                            thiscoord[1] += prevcoord[1] - smallnum;
                            thiscoord[2] += prevcoord[2] - smallnum;

                            if (k === 0) {
                                // interchange first with second atom for
                                // better compression of water molecules
                                let tmpSwap = thiscoord[0];
                                thiscoord[0] = prevcoord[0];
                                prevcoord[0] = tmpSwap;

                                tmpSwap = thiscoord[1];
                                thiscoord[1] = prevcoord[1];
                                prevcoord[1] = tmpSwap;

                                tmpSwap = thiscoord[2];
                                thiscoord[2] = prevcoord[2];
                                prevcoord[2] = tmpSwap;

                                frameCoords.x[lfp] = prevcoord[0] * invPrecision;
                                frameCoords.y[lfp] = prevcoord[1] * invPrecision;
                                frameCoords.z[lfp] = prevcoord[2] * invPrecision;
                                lfp++;
                            } else {
                                prevcoord[0] = thiscoord[0];
                                prevcoord[1] = thiscoord[1];
                                prevcoord[2] = thiscoord[2];
                            }
                            frameCoords.x[lfp] = thiscoord[0] * invPrecision;
                            frameCoords.y[lfp] = thiscoord[1] * invPrecision;
                            frameCoords.z[lfp] = thiscoord[2] * invPrecision;
                            lfp++;
                        }
                    } else {
                        frameCoords.x[lfp] = thiscoord[0] * invPrecision;
                        frameCoords.y[lfp] = thiscoord[1] * invPrecision;
                        frameCoords.z[lfp] = thiscoord[2] * invPrecision;
                        lfp++;
                    }

                    smallidx += isSmaller;

                    if (isSmaller < 0) {
                        smallnum = smaller;
                        if (smallidx > this.FirstIdx) {
                            smaller = (this.MagicInts[smallidx - 1] / 2) | 0;
                        } else {
                            smaller = 0;
                        }
                    } else if (isSmaller > 0) {
                        smaller = smallnum;
                        smallnum = (this.MagicInts[smallidx] / 2) | 0;
                    }
                    sizesmall[0] = sizesmall[1] = sizesmall[2] = this.MagicInts[smallidx];

                    if (sizesmall[0] === 0 || sizesmall[1] === 0 || sizesmall[2] === 0) {
                        undefinedError();
                    }
                }
                offset += adz;
            }

            let factor = 10;
            for (let c = 0; c < natom; c++) {
                frameCoords.x[c] *= factor;
                frameCoords.y[c] *= factor;
                frameCoords.z[c] *= factor;
            }

            coordinates.push(frameCoords);

            // if (ctx.shouldUpdate) {
            //     await ctx.update({ current: offset, max: data.length });
            // }

            // if (offset >= data.length) break;
            if (offset >= dv.byteLength) break;
        }

        ic.frames = coordinates.length;

        if (times.length >= 1) {
            ic.TIMEOFFSET = times[0];
        }
        if (times.length >= 2) {
            ic.DELTA = times[1] - times[0];
        }

        // frames
        let structuresOri = me.hashUtilsCls.cloneHash(ic.structures);
        let residuesOri = me.hashUtilsCls.cloneHash(ic.residues);
        let chainsOri = me.hashUtilsCls.cloneHash(ic.chains);

        let proteinsOri = me.hashUtilsCls.cloneHash(ic.proteins);
        let nucleotidesOri = me.hashUtilsCls.cloneHash(ic.nucleotides);
        let waterOri = me.hashUtilsCls.cloneHash(ic.water);
        let ionsOri = me.hashUtilsCls.cloneHash(ic.ions);
        let chemicalsOri = me.hashUtilsCls.cloneHash(ic.chemicals);   

        // let serial = natom + 1; // a preloaded PDB structure would have atom serial from 1 to natom
        let serial = 1;

        for (let i = 0, n = coordinates.length; i < n; ++i) {
            // skip the first structure since it was read from PDB already
            // if(i == 0) continue;

            // rewrite the coordinates of the first structure
            let frame = coordinates[i];

            // let molNum = i + 1; // to avoid the same molNum as the PDB structure
            let molNum = (i == 0) ? '' : i;
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

        // ic.molTitle = header.TITLE;
        ic.inputid = 'stru';

        // ic.ParserUtilsCls.setMaxD();

        ic.saveFileCls.showTitle();

        return true;
    }

    sizeOfInt(size) { let ic = this.icn3d, me = ic.icn3dui;
        let num = 1;
        let numOfBits = 0;
        while (size >= num && numOfBits < 32) {
            numOfBits++;
            num <<= 1;
        }
        return numOfBits;
    }

    sizeOfInts(numOfInts, sizes) { let ic = this.icn3d, me = ic.icn3dui;
        let numOfBytes = 1;
        let numOfBits = 0;
        this._tmpBytes[0] = 1;
        for (let i = 0; i < numOfInts; i++) {
            let bytecnt;
            let tmp = 0;
            for (bytecnt = 0; bytecnt < numOfBytes; bytecnt++) {
                tmp += this._tmpBytes[bytecnt] * sizes[i];
                this._tmpBytes[bytecnt] = tmp & 0xff;
                tmp >>= 8;
            }
            while (tmp !== 0) {
                this._tmpBytes[bytecnt++] = tmp & 0xff;
                tmp >>= 8;
            }
            numOfBytes = bytecnt;
        }
        let num = 1;
        numOfBytes--;
        while (this._tmpBytes[numOfBytes] >= num) {
            numOfBits++;
            num *= 2;
        }
        return numOfBits + numOfBytes * 8;
    }
    
    decodeBits(cbuf, offset, numOfBits1) { let ic = this.icn3d, me = ic.icn3dui;
        let numOfBits = numOfBits1;
        const mask = (1 << numOfBits) - 1;
        let lastBB0 = this.uint32view[1];
        let lastBB1 = this.uint32view[2];
        let cnt = this.buf[0];
        let num = 0;

        while (numOfBits >= 8) {
            lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt++];
            num |= (lastBB1 >> lastBB0) << (numOfBits - 8);
            numOfBits -= 8;
        }

        if (numOfBits > 0) {
            if (lastBB0 < numOfBits) {
                lastBB0 += 8;
                lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt++];
            }
            lastBB0 -= numOfBits;
            num |= (lastBB1 >> lastBB0) & ((1 << numOfBits) - 1);
        }

        num &= mask;
        this.buf[0] = cnt;
        this.buf[1] = lastBB0;
        this.buf[2] = lastBB1;

        return num;
    }

    decodeByte(cbuf, offset) { let ic = this.icn3d, me = ic.icn3dui;
        // special version of decodeBits with numOfBits = 8

        // const mask = 0xff; // (1 << 8) - 1;
        // let lastBB0 = uint32view[1];
        let lastBB1 = this.uint32view[2];
        const cnt = this.buf[0];

        lastBB1 = (lastBB1 << 8) | cbuf[offset + cnt];

        this.buf[0] = cnt + 1;
        // this.buf[1] = lastBB0;
        this.buf[2] = lastBB1;

        return (lastBB1 >> this.uint32view[1]) & 0xff;
    }

    decodeInts(cbuf, offset, numOfBits1, sizes, nums) { let ic = this.icn3d, me = ic.icn3dui;   
        let numOfBits = numOfBits1;
        let numOfBytes = 0;

        this.intBytes[0] = 0;
        this.intBytes[1] = 0;
        this.intBytes[2] = 0;
        this.intBytes[3] = 0;

        while (numOfBits > 8) {
            // this is inversed??? why??? because of the endiannness???
            this.intBytes[numOfBytes++] = this.decodeByte(cbuf, offset);
            numOfBits -= 8;
        }

        if (numOfBits > 0) {
            this.intBytes[numOfBytes++] = this.decodeBits(cbuf, offset, numOfBits);
        }

        for (let i = 2; i > 0; i--) {
            let num = 0;
            const s = sizes[i];
            for (let j = numOfBytes - 1; j >= 0; j--) {
                num = (num << 8) | this.intBytes[j];
                const t = (num / s) | 0;
                this.intBytes[j] = t;
                num = num - t * s;
            }
            nums[i] = num;
        }
        nums[0] = this.intBytes[0] | (this.intBytes[1] << 8) | (this.intBytes[2] << 16) | (this.intBytes[3] << 24);
    }    
}

export {XtcParser}
