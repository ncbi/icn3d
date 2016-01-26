/*! surface.js
 * This is a JavaScript implementation of the EDTSurf algorithm.
 * It was developed by Takanori Nakane and revised by Hongjian Li.
 * http://github.com/HongjianLi/istar
 * Copyright (c) 2012-2014 Chinese University of Hong Kong
 * License: Apache License 2.0
 * Hongjian Li, Kwong-Sak Leung, Takanori Nakane and Man-Hon Wong.
 * iview: an interactive WebGL visualizer for protein-ligand complex.
 * BMC Bioinformatics, 15(1):56, 2014.
 *
 * EDTSurf
 * http://zhanglab.ccmb.med.umich.edu/EDTSurf
 * Dong Xu and Yang Zhang. Generating Triangulated Macromolecular Surme.faces
 * by Euclidean Distance Transform. PLoS ONE, 4(12):e8140, 2009.
 * Dong Xu, Hua Li and Yang Zhang. Protein Depth Calculation and the Use
 * for Improving Accuracy of Protein Fold Recognition.
 * Journal of Computational Biology, 20(10):805-816, 2013.

 * by Jiyao Wang
 * modified variable scope to avoid memory leak
 * corected from "if (stype == 3) {// vdw" to "if (stype == 1) {// vdw"

 */

var ProteinSurface = function (data) {
    var me = this;

    //me.ptranx, me.ptrany, me.ptranz;
    me.boxLength = 128;
    me.probeRadius = 1.4;
    me.scaleFactor = 1;
    //me.pHeight, me.pWidth, me.pLength;
    //me.cutRadius;
    //me.vp;
    //me.vertnumber, me.facenumber;
    //me.pminx, me.pminy, me.pminz, me.pmaxx, me.pmaxy, me.pmaxz;
    me.rasrad = [1.90, 1.88, 1.63, 1.48, 1.78, 1.2, 1.87, 1.96, 1.63, 0.74, 1.8, 1.48, 1.2];//liang
    //             Calpha   c    n    o    s   h   p   Cbeta  ne  fe  other ox  hx
    me.depty = new Array(13);
    me.widxz = new Array(13);
    me.fixsf = 2;
    //me.faces, me.verts;
    me.nb = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0], [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1], [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1], [1, 1, 1], [1, 1, -1], [1, -1, 1], [-1, 1, 1], [1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, -1, -1]];

    me.Vector3 = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };

    me.Face3 = function (a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    };

    this.initparm = function (pmin, pmax, btype) {
        var margin = 2.5;
        me.pminx = pmin.x, me.pmaxx = pmax.x;
        me.pminy = pmin.y, me.pmaxy = pmax.y;
        me.pminz = pmin.z, me.pmaxz = pmax.z;

        if (btype) {
            me.pminx -= margin; me.pminy -= margin; me.pminz -= margin;
            me.pmaxx += margin; me.pmaxy += margin; me.pmaxz += margin;
        } else {
            me.pminx -= me.probeRadius + margin;
            me.pminy -= me.probeRadius + margin;
            me.pminz -= me.probeRadius + margin;
            me.pmaxx += me.probeRadius + margin;
            me.pmaxy += me.probeRadius + margin;
            me.pmaxz += me.probeRadius + margin;
        }

        me.ptranx = -me.pminx;
        me.ptrany = -me.pminy;
        me.ptranz = -me.pminz;
        me.scaleFactor = me.pmaxx - me.pminx;
        if ((me.pmaxy - me.pminy) > me.scaleFactor) me.scaleFactor = me.pmaxy - me.pminy;
        if ((me.pmaxz - me.pminz) > me.scaleFactor) me.scaleFactor = me.pmaxz - me.pminz;
        me.scaleFactor = (me.boxLength - 1.0) / me.scaleFactor;

        me.boxLength = Math.floor(me.boxLength * me.fixsf / me.scaleFactor);
        me.scaleFactor = me.fixsf;
        var threshbox = 180; // maximum possible boxsize
        if (me.boxLength > threshbox) {
            sfthresh = threshbox / me.boxLength;
            me.boxLength = Math.floor(threshbox);
            me.scaleFactor = me.scaleFactor * sfthresh;
        }

        me.pLength = Math.ceil(me.scaleFactor * (me.pmaxx - me.pminx)) + 1;
        me.pWidth = Math.ceil(me.scaleFactor * (me.pmaxy - me.pminy)) + 1;
        me.pHeight = Math.ceil(me.scaleFactor * (me.pmaxz - me.pminz)) + 1;
        if (me.pLength > me.boxLength) me.pLength = me.boxLength;
        if (me.pWidth > me.boxLength) me.pWidth = me.boxLength;
        if (me.pHeight > me.boxLength) me.pHeight = me.boxLength;
        this.boundingatom(btype);
        cutRadis = me.probeRadius * me.scaleFactor;

        me.vp = new Array(me.pLength * me.pWidth * me.pHeight);
    };

    this.boundingatom = function (btype) {
        var tradius = new Array(13);
        var txz, tdept, sradius, idx;

        for (var i = 0; i < 13; ++i) {
            if (!btype) tradius[i] = me.rasrad[i] * me.scaleFactor + 0.5;
            else tradius[i] = (me.rasrad[i] + me.probeRadius) * me.scaleFactor + 0.5;

            sradius = tradius[i] * tradius[i];
            me.widxz[i] = Math.floor(tradius[i]) + 1;
            me.depty[i] = new Array(me.widxz[i] * me.widxz[i]);
            indx = 0;
            for (j = 0; j < me.widxz[i]; ++j) {
                for (k = 0; k < me.widxz[i]; ++k) {
                    txz = j * j + k * k;
                    if (txz > sradius) me.depty[i][indx] = -1; // outside
                    else {
                        tdept = Math.sqrt(sradius - txz);
                        me.depty[i][indx] = Math.floor(tdept);
                    }
                    indx++;
                }
            }
        }
    }

    this.fillvoxels = function (atoms) { //(int seqinit,int seqterm,bool atomtype,atom* proseq,bool bcolor)
        for (var i = 0, lim = me.vp.length; i < lim; ++i) {
            me.vp[i] = { inout: false, isdone: false, isbound: false, distance: -1, atomid: -1 };
        }

        for (i in atoms) {
            this.fillAtom(atoms[i], atoms);
        }

        for (i = 0, lim = me.vp.length; i < lim; ++i)
            if (me.vp[i].inout) me.vp[i].isdone = true;

        //this.vp = me.vp;
        for (var i = 0, lim = me.vp.length; i < lim; ++i) {
            if (me.vp[i].inout) me.vp[i].isdone = true;
        }
    };

    this.fillAtom = function (atom, atoms) {
        var cx, cy, cz, ox, oy, oz;
        cx = Math.floor(0.5 + me.scaleFactor * (atom.coord.x + me.ptranx));
        cy = Math.floor(0.5 + me.scaleFactor * (atom.coord.y + me.ptrany));
        cz = Math.floor(0.5 + me.scaleFactor * (atom.coord.z + me.ptranz));

        var at = this.getAtomType(atom);
        var nind = 0;
        var cnt = 0;

        for (i = 0; i < me.widxz[at]; ++i) {
            for (j = 0; j < me.widxz[at]; ++j) {
                if (me.depty[at][nind] != -1) {
                    for (ii = -1; ii < 2; ++ii) {
                        for (jj = -1; jj < 2; ++jj) {
                            for (kk = -1; kk < 2; ++kk) {
                                if (ii != 0 && jj != 0 && kk != 0) {
                                    mi = ii * i;
                                    mk = kk * j;
                                    for (k = 0; k <= me.depty[at][nind]; ++k) {
                                        mj = k * jj;
                                        si = cx + mi;
                                        sj = cy + mj;
                                        sk = cz + mk;
                                        if (si < 0 || sj < 0 || sk < 0 || si >= me.pLength || sj >= me.pWidth || sk >= me.pHeight) continue;
                                        var vpSISJSK = me.vp[si * me.pWidth * me.pHeight + sj * me.pHeight + sk];
                                        if (false) { // !bcolor
                                            vpSISJSK.inout = true;
                                        } else { // color
                                            if (vpSISJSK.inout == false) {
                                                vpSISJSK.inout = true;
                                                vpSISJSK.atomid = atom.serial;
                                            } else if (vpSISJSK.inout) {
                                                var atom2 = atoms[vpSISJSK.atomid];
                                                ox = Math.floor(0.5 + me.scaleFactor * (atom2.coord.x + me.ptranx));
                                                oy = Math.floor(0.5 + me.scaleFactor * (atom2.coord.y + me.ptrany));
                                                oz = Math.floor(0.5 + me.scaleFactor * (atom2.coord.z + me.ptranz));
                                                if (mi * mi + mj * mj + mk * mk < ox * ox + oy * oy + oz * oz)
                                                    vpSISJSK.atomid = atom.serial;
                                            }
                                        }
                                    }//k
                                }//if
                            }//kk
                        }//jj
                    }//ii
                }//if
                nind++;
            }//j
        }//i
    };

    this.fillvoxelswaals = function (atoms) {
        for (var i = 0, lim = me.vp.length; i < lim; ++i) me.vp[i].isdone = false;

        for (i in atoms) {
            this.fillAtomWaals(atoms[i], atoms);
        }
    };

    this.fillAtomWaals = function (atom, atoms) {
        var cx, cy, cz, ox, oy, oz, nind = 0;
        cx = Math.floor(0.5 + me.scaleFactor * (atom.coord.x + me.ptranx));
        cy = Math.floor(0.5 + me.scaleFactor * (atom.coord.y + me.ptrany));
        cz = Math.floor(0.5 + me.scaleFactor * (atom.coord.z + me.ptranz));

        var at = this.getAtomType(atom);

        for (i = 0; i < me.widxz[at]; ++i) {
            for (j = 0; j < me.widxz[at]; ++j) {
                if (me.depty[at][nind] != -1) {
                    for (ii = -1; ii < 2; ++ii) {
                        for (jj = -1; jj < 2; ++jj) {
                            for (kk = -1; kk < 2; ++kk) {
                                if (ii != 0 && jj != 0 && kk != 0) {
                                    mi = ii * i;
                                    mk = kk * j;
                                    for (k = 0; k <= me.depty[at][nind]; ++k) {
                                        mj = k * jj;
                                        si = cx + mi;
                                        sj = cy + mj;
                                        sk = cz + mk;
                                        if (si < 0 || sj < 0 || sk < 0) continue;
                                        var vpSISJSK = me.vp[si * me.pWidth * me.pHeight + sj * me.pHeight + sk];
                                        if (false) {//(!bcolor) FIXME
                                            vpSISJSK.isdone = true;
                                            continue;
                                        } else {
                                            //if (vpSISJSK.isdone == false) {
                                            if (vpSISJSK != undefined && vpSISJSK.isdone == false) {
                                                vpSISJSK.isdone = true;
                                                vpSISJSK.atomid = atom.serial;
                                            }
                                            else if (vpSISJSK != undefined && vpSISJSK.isdone) {
                                                var atom2 = atoms[vpSISJSK.atomid];
                                                ox = Math.floor(0.5 + me.scaleFactor * (atom2.coord.x + me.ptranx));
                                                oy = Math.floor(0.5 + me.scaleFactor * (atom2.coord.y + me.ptrany));
                                                oz = Math.floor(0.5 + me.scaleFactor * (atom2.coord.z + me.ptranz));
                                                if (mi * mi + mj * mj + mk * mk < ox * ox + oy * oy + oz * oz)
                                                    vpSISJSK.atomid = atom.serial;
                                            }
                                        }//else
                                    }//k
                                }//if
                            }//kk
                        }//jj
                    }//ii
                }//if
                nind++;
            }//j
        }//i
    };

    this.getAtomType = function (atom) {
        var at = 10;
        if (atom.name == 'CA') at = 0;
        else if (atom.name == 'C') at = 1;
        else if (atom.elem == 'C') at = 7;
        else if (atom.name == '0') at = 3;
        else if (atom.elem == 'O') at = 11;
        else if (atom.name == 'N') at = 2;
        else if (atom.elem == 'N') at = 8;
        else if (atom.elem == 'S') at = 4;
        else if (atom.elem == 'P') at = 6;
        else if (atom.name == 'FE') at = 9;
        else if (atom.name == 'H') at = 5;
        else if (atom.elem == 'H') at = 12;
        return at;
    };

    this.buildboundary = function () {
        //me.vp = this.vp;
        for (i = 0; i < me.pLength; ++i) {
            for (j = 0; j < me.pHeight; ++j) {
                for (k = 0; k < me.pWidth; ++k) {
                    var vpIJK = me.vp[i * me.pWidth * me.pHeight + k * me.pHeight + j];
                    if (vpIJK.inout) {
                        var flagbound = false;
                        var ii = 0;
                        while (!flagbound && ii < 26) {
                            var ti = i + me.nb[ii][0], tj = j + me.nb[ii][2], tk = k + me.nb[ii][1];
                            if (ti > -1 && ti < me.pLength
                                && tk > -1 && tk < me.pWidth
                                && tj > -1 && tj < me.pHeight
                                && !me.vp[ti * me.pWidth * me.pHeight + tk * me.pHeight + tj].inout) {
                                vpIJK.isbound = true;
                                flagbound = true;
                            }
                            else ii++;
                        }
                    }
                }
            }
        }
    };

    this.fastdistancemap = function () {
        var positin, positout, eliminate;
        var certificate;
        totalsurfacevox = 0;
        totalinnervox = 0;

        var boundPoint = new Array(me.pLength);
        for (var i = 0; i < me.pLength; ++i) {
            var a = new Array(me.pWidth);
            for (var j = 0; j < me.pWidth; ++j) {
                var b = new Array(me.pHeight);
                for (var k = 0; k < me.pHeight; ++k) b[k] = { ix: 0, iy: 0, iz: 0 };
                a[j] = b;
            }
            boundPoint[i] = a;
        }

        for (i = 0; i < me.pLength; ++i) {
            for (j = 0; j < me.pWidth; ++j) {
                for (k = 0; k < me.pHeight; ++k) {
                    var vpIJK = me.vp[i * me.pWidth * me.pHeight + j * me.pHeight + k];
                    vpIJK.isdone = false;
                    if (vpIJK.inout) {
                        if (vpIJK.isbound) {
                            totalsurfacevox++;
                            boundPoint[i][j][k].ix = i;
                            boundPoint[i][j][k].iy = j;
                            boundPoint[i][j][k].iz = k;
                            vpIJK.distance = 0;
                            vpIJK.isdone = true;
                        } else {
                            totalinnervox++;
                        }
                    }
                }
            }
        }

        inarray = new Array();
        outarray = new Array();
        var positin = 0, positout = 0;

        for (i = 0; i < me.pLength; ++i) {
            for (j = 0; j < me.pWidth; ++j) {
                for (k = 0; k < me.pHeight; ++k) {
                    var vpIJK = me.vp[i * me.pWidth * me.pHeight + j * me.pHeight + k];
                    if (vpIJK.isbound) {
                        inarray.push({ ix: i, iy: j, iz: k });
                        positin++;
                        vpIJK.isbound = false;
                    }
                }
            }
        }

        do {
            positout = this.fastoneshell(positin, boundPoint);
            positin = 0;
            inarray = [];
            for (i = 0; i < positout; ++i) {
                var vptmp = me.vp[me.pWidth * me.pHeight * outarray[i].ix + me.pHeight * outarray[i].iy + outarray[i].iz];
                vptmp.isbound = false;
                if (vptmp.distance <= 1.02 * cutRadis) {
                    inarray.push({ ix: outarray[i].ix, iy: outarray[i].iy, iz: outarray[i].iz });
                    //            inarray[positin].ix=outarray[i].ix;
                    //            inarray[positin].iy=outarray[i].iy;
                    //            inarray[positin].iz=outarray[i].iz;
                    positin++;
                }
            }
        } while (positin != 0);

        var cutsf = me.scaleFactor - 0.5;
        if (cutsf < 0) cutsf = 0;
        for (i = 0; i < me.pLength; ++i) {
            for (j = 0; j < me.pWidth; ++j) {
                for (k = 0; k < me.pHeight; ++k) {
                    var vpIJK = me.vp[i * me.pWidth * me.pHeight + j * me.pHeight + k];
                    vpIJK.isbound = false;
                    //ses solid
                    if (vpIJK.inout) {
                        if (!vpIJK.isdone || (vpIJK.isdone && vpIJK.distance >= cutRadis - 0.50 / (0.1 + cutsf))) {
                            vpIJK.isbound = true;
                            //new add
                            //                  if (vpIJK.isdone)
                            //                  vpIJK.atomid=me.vp[boundPoint[i][j][k].ix][boundPoint[i][j][k].iy][boundPoint[i][j][k].iz].atomid;
                        }
                    }
                }
            }
        }
        inarray = []; outarray = [];
    };

    this.fastoneshell = function (number, boundPoint) { //(int* innum,int *allocout,voxel2 ***boundPoint, int* outnum, int *elimi)
        var positout = 0;
        var tx, ty, tz;
        var dx, dy, dz;
        var square;
        if (number == 0) return 0;
        outarray = [];

        tnv = { ix: -1, iy: -1, iz: -1 };
        for (var i = 0; i < number; ++i) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;

            for (var j = 0; j < 6; ++j) {
                tnv.ix = tx + me.nb[j][0];
                tnv.iy = ty + me.nb[j][1];
                tnv.iz = tz + me.nb[j][2];
                var vpTNV = me.vp[tnv.ix * me.pWidth * me.pHeight + me.pHeight * tnv.iy + tnv.iz];
                if (tnv.ix < me.pLength && tnv.ix > -1 &&
                    tnv.iy < me.pWidth && tnv.iy > -1 &&
                    tnv.iz < me.pHeight && tnv.iz > -1 &&
                    vpTNV.inout && !vpTNV.isdone) {
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].ix = boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iy = boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iz = boundPoint[tx][ty][tz].iz;
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    var square = dx * dx + dy * dy + dz * dz;
                    vpTNV.distance = Math.sqrt(square);
                    vpTNV.isdone = true;
                    vpTNV.isbound = true;
                    outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                    positout++;
                } else if (tnv.ix < me.pLength && tnv.ix > -1 &&
                          tnv.iy < me.pWidth && tnv.iy > -1 &&
                          tnv.iz < me.pHeight && tnv.iz > -1 &&
                          vpTNV.inout && vpTNV.isdone) {
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square = dx * dx + dy * dy + dz * dz;
                    square = Math.sqrt(square);
                    if (square < vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix = boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy = boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz = boundPoint[tx][ty][tz].iz;
                        vpTNV.distance = square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound = true;
                            outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                            positout++;
                        }
                    }
                }
            }
        }

        for (i = 0; i < number; ++i) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;
            for (j = 6; j < 18; ++j) {
                tnv.ix = tx + me.nb[j][0];
                tnv.iy = ty + me.nb[j][1];
                tnv.iz = tz + me.nb[j][2];
                var vpTNV = me.vp[tnv.ix * me.pWidth * me.pHeight + me.pHeight * tnv.iy + tnv.iz];

                if (tnv.ix < me.pLength && tnv.ix > -1 &&
                    tnv.iy < me.pWidth && tnv.iy > -1 &&
                    tnv.iz < me.pHeight && tnv.iz > -1 &&
                    vpTNV.inout && !vpTNV.isdone) {
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].ix = boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iy = boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iz = boundPoint[tx][ty][tz].iz;
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square = dx * dx + dy * dy + dz * dz;
                    vpTNV.distance = Math.sqrt(square);
                    vpTNV.isdone = true;
                    vpTNV.isbound = true;
                    outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                    positout++;
                } else if (tnv.ix < me.pLength && tnv.ix > -1 &&
                           tnv.iy < me.pWidth && tnv.iy > -1 &&
                           tnv.iz < me.pHeight && tnv.iz > -1 &&
                           vpTNV.inout && vpTNV.isdone) {
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (square < vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix = boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy = boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz = boundPoint[tx][ty][tz].iz;
                        vpTNV.distance = square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound = true;
                            outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                            positout++;
                        }
                    }
                }
            }
        }

        for (i = 0; i < number; ++i) {
            tx = inarray[i].ix;
            ty = inarray[i].iy;
            tz = inarray[i].iz;
            for (j = 18; j < 26; ++j) {
                tnv.ix = tx + me.nb[j][0];
                tnv.iy = ty + me.nb[j][1];
                tnv.iz = tz + me.nb[j][2];
                var vpTNV = me.vp[tnv.ix * me.pWidth * me.pHeight + me.pHeight * tnv.iy + tnv.iz];

                if (tnv.ix < me.pLength && tnv.ix > -1 &&
                    tnv.iy < me.pWidth && tnv.iy > -1 &&
                    tnv.iz < me.pHeight && tnv.iz > -1 &&
                    vpTNV.inout && !vpTNV.isdone) {
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].ix = boundPoint[tx][ty][tz].ix;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iy = boundPoint[tx][ty][tz].iy;
                    boundPoint[tnv.ix][tnv.iy][tz + me.nb[j][2]].iz = boundPoint[tx][ty][tz].iz;
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square = dx * dx + dy * dy + dz * dz;
                    vpTNV.distance = Math.sqrt(square);
                    vpTNV.isdone = true;
                    vpTNV.isbound = true;
                    outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                    positout++;
                } else if (tnv.ix < me.pLength && tnv.ix > -1 &&
                           tnv.iy < me.pWidth && tnv.iy > -1 &&
                           tnv.iz < me.pHeight && tnv.iz > -1 &&
                           vpTNV.inout && vpTNV.isdone) {
                    dx = tnv.ix - boundPoint[tx][ty][tz].ix;
                    dy = tnv.iy - boundPoint[tx][ty][tz].iy;
                    dz = tnv.iz - boundPoint[tx][ty][tz].iz;
                    square = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (square < vpTNV.distance) {
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].ix = boundPoint[tx][ty][tz].ix;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iy = boundPoint[tx][ty][tz].iy;
                        boundPoint[tnv.ix][tnv.iy][tnv.iz].iz = boundPoint[tx][ty][tz].iz;
                        vpTNV.distance = square;
                        if (!vpTNV.isbound) {
                            vpTNV.isbound = true;
                            outarray.push({ ix: tnv.ix, iy: tnv.iy, iz: tnv.iz });
                            positout++;
                        }
                    }
                }
            }
        }
        return positout;
    };

    this.marchingcube = function (stype) {
        for (var i = 0, lim = me.vp.length; i < lim; ++i) {
            // should be 1: VDW, 2: SES, 3: SAS, 4: MS Commented by JW
            if (stype == 1) {// vdw
                me.vp[i].isbound = false;
            } else if (stype == 4) { // ses
                me.vp[i].isdone = false;
                if (me.vp[i].isbound) me.vp[i].isdone = true;
                me.vp[i].isbound = false;
            } else if (stype == 2) {// after vdw
                if (me.vp[i].isbound && me.vp[i].isdone) me.vp[i].isbound = false;
                else if (me.vp[i].isbound && !me.vp[i].isdone) me.vp[i].isdone = true;
            } else if (stype == 3) { //sas
                me.vp[i].isbound = false;
            }
        }

        var vertseq = new Array(me.pLength);
        for (var i = 0; i < me.pLength; ++i) {
            var a = new Array(me.pWidth);
            for (var j = 0; j < me.pWidth; ++j) {
                var b = new Array(me.pHeight);
                for (var k = 0; k < me.pHeight; ++k) b[k] = -1;
                a[j] = b;
            }
            vertseq[i] = a;
        }
        me.vertnumber = 0, me.facenumber = 0;
        me.verts = new Array();//(4 * (me.pHeight * me.pLength + me.pWidth * me.pLength + me.pHeight * me.pWidth)); // CHECK: Is this enough?
        //   for (var i = 0, lim = me.verts.length; i < lim; ++i) me.verts[i] = new me.Vector3(0, 0, 0);
        me.faces = new Array();//12 * (me.pHeight * me.pLength + me.pWidth * me.pLength + me.pHeight * me.pWidth)); // CHECK! 4
        // for (var i = 0, lim = me.faces.length; i < lim; ++i) me.faces[i] = new me.Face3(0, 0, 0);

        var sumtype, ii, jj, kk;
        var tp = new Array(6); for (var i = 0; i < 6; ++i) tp[i] = new Array(3);

        //face1
        for (i = 0; i < 1; ++i) {
            for (j = 0; j < me.pWidth - 1; ++j) {
                for (k = 0; k < me.pHeight - 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp001 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k + 1].isdone,
                            vp010 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k].isdone,
                            vp011 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k + 1].isdone,
                            vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                            vp101 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k + 1].isdone,
                            vp110 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k].isdone,
                            vp111 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k + 1].isdone;

                    if (vp000 && vp010 && vp011 && vp001) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                        tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }
                    else if ((vp000 && vp010 && vp011)
                            || (vp010 && vp011 && vp001)
                            || (vp011 && vp001 && vp000)
                            || (vp001 && vp000 && vp010)) {
                        if (vp000 && vp010 && vp011) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        } else if (vp010 && vp011 && vp001) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                        } else if (vp011 && vp001 && vp000) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        } else if (vp001 && vp000 && vp010) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                    }
                }
            }
        }
        //Face3
        for (i = 0; i < me.pLength - 1; ++i) {
            for (j = 0; j < 1; ++j) {
                for (k = 0; k < me.pHeight - 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp001 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k + 1].isdone,
                            vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                            vp101 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k + 1].isdone;

                    if (vp000 && vp100 && vp101 && vp001) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                        tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                        tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                        me.facenumber++;
                    } else if ((vp000 && vp100 && vp101)
                              || (vp100 && vp101 && vp001)
                              || (vp101 && vp001 && vp000)
                              || (vp001 && vp000 && vp100)) {
                        if (vp000 && vp100 && vp101) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                        } else if (vp100 && vp101 && vp001) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                        }
                        else if (vp101 && vp001 && vp000) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        } else if (vp001 && vp000 && vp100) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }
                }
            }
        }
        //face5
        for (i = 0; i < me.pLength - 1; ++i) {
            for (j = 0; j < me.pWidth - 1; ++j) {
                for (k = 0; k < 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp010 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k].isdone,
                            vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                            vp110 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k].isdone;

                    if (vp000 && vp100 && vp110 && vp010) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                        tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                        tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    } else if ((vp000 && vp100 && vp110)
                              || (vp100 && vp110 && vp010)
                              || (vp110 && vp010 && vp000)
                              || (vp010 && vp000 && vp100)) {
                        if (vp000 && vp100 && vp110) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                        } else if (vp100 && vp110 && vp010) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                        }
                        else if (vp110 && vp010 && vp000) {
                            tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        } else if (vp010 && vp000 && vp100) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                    }
                }
            }
        }
        //face2
        for (i = me.pLength - 1; i < me.pLength; ++i) {
            for (j = 0; j < me.pWidth - 1; ++j) {
                for (k = 0; k < me.pHeight - 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp001 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k + 1].isdone,
                            vp010 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k].isdone,
                            vp011 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k + 1].isdone;

                    if (vp000 && vp010 && vp011
                       && vp001) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                        tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                        me.facenumber++;
                    }
                    else if ((vp000 && vp010 && vp011)
                            || (vp010 && vp011 && vp001)
                            || (vp011 && vp001 && vp000)
                            || (vp001 && vp000 && vp010)) {
                        if (vp000 && vp010 && vp011) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        }
                        else if (vp010 && vp011 && vp001) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                        }
                        else if (vp011 && vp001 && vp000) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        }
                        else if (vp001 && vp000 && vp010) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }

                }
            }
        }
        //face4
        for (i = 0; i < me.pLength - 1; ++i) {
            for (j = me.pWidth - 1; j < me.pWidth; ++j) {
                for (k = 0; k < me.pHeight - 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp001 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k + 1].isdone,
                            vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                            vp101 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k + 1].isdone;
                    if (vp000 && vp100 && vp101 && vp001) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                        tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                        tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }
                    else if ((vp000 && vp100 && vp101)
                            || (vp100 && vp101 && vp001)
                            || (vp101 && vp001 && vp000)
                            || (vp001 && vp000 && vp100)) {
                        if (vp000 && vp100 && vp101) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                        }
                        else if (vp100 && vp101 && vp001) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                        }
                        else if (vp101 && vp001 && vp000) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        }
                        else if (vp001 && vp000 && vp100) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                        me.facenumber++;
                    }

                }
            }
        }
        //face6
        for (i = 0; i < me.pLength - 1; ++i) {
            for (j = 0; j < me.pWidth - 1; ++j) {
                for (k = me.pHeight - 1; k < me.pHeight; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                            vp010 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k].isdone,
                            vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                            vp110 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k].isdone;

                    if (vp000 && vp100 && vp110
                       && vp010) {
                        tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                        tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                        tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                        tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                        for (ii = 0; ii < 4; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                        me.facenumber++;
                    }
                    else if ((vp000 && vp100 && vp110)
                            || (vp100 && vp110 && vp010)
                            || (vp110 && vp010 && vp000)
                            || (vp010 && vp000 && vp100)) {
                        if (vp000 && vp100 && vp110) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                        }
                        else if (vp100 && vp110 && vp010) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                        }
                        else if (vp110 && vp010 && vp000) {
                            tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        }
                        else if (vp010 && vp000 && vp100) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                        }
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }
                }
            }
        }
        for (i = 0; i < me.pLength - 1; ++i) {
            for (j = 0; j < me.pWidth - 1; ++j) {
                for (k = 0; k < me.pHeight - 1; ++k) {
                    var vp000 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k].isdone,
                    vp001 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * j + k + 1].isdone,
                    vp010 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k].isdone,
                    vp011 = me.vp[me.pWidth * me.pHeight * i + me.pHeight * (j + 1) + k + 1].isdone,
                    vp100 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k].isdone,
                    vp101 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * j + k + 1].isdone,
                    vp110 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k].isdone,
                    vp111 = me.vp[me.pWidth * me.pHeight * (i + 1) + me.pHeight * (j + 1) + k + 1].isdone;


                    var sumtype = 0;
                    for (ii = 0; ii < 2; ++ii) {
                        for (jj = 0; jj < 2; ++jj) {
                            for (kk = 0; kk < 2; ++kk) {
                                if (me.vp[me.pWidth * me.pHeight * (i + ii) + me.pHeight * (j + jj) + k + kk].isdone) sumtype++;
                            }
                        }
                    }

                    if (sumtype == 3) {
                        if ((vp000 && vp100 && vp110)
                           || (vp000 && vp010 && vp110)
                           || (vp010 && vp100 && vp110)
                           || (vp000 && vp010 && vp100)
                           || (vp001 && vp101 && vp111)
                           || (vp001 && vp011 && vp111)
                           || (vp011 && vp101 && vp111)
                           || (vp001 && vp011 && vp101)
                           || (vp000 && vp100 && vp101)
                           || (vp100 && vp101 && vp001)
                           || (vp000 && vp101 && vp001)
                           || (vp000 && vp100 && vp001)
                           || (vp110 && vp100 && vp111)
                           || (vp110 && vp101 && vp111)
                           || (vp100 && vp101 && vp111)
                           || (vp110 && vp100 && vp101)
                           || (vp110 && vp010 && vp011)
                           || (vp010 && vp011 && vp111)
                           || (vp110 && vp011 && vp111)
                           || (vp110 && vp010 && vp111)
                           || (vp000 && vp010 && vp001)
                           || (vp000 && vp001 && vp011)
                           || (vp001 && vp010 && vp011)
                           || (vp000 && vp010 && vp011)) {
                            if (vp000 && vp100 && vp110) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//11
                            else if (vp000 && vp010 && vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//12
                            else if (vp010 && vp100 && vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//13
                            else if (vp000 && vp010 && vp100) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//14
                            else if (vp001 && vp101 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//21
                            else if (vp001 && vp011 && vp111) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//22
                            else if (vp011 && vp101 && vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//23
                            else if (vp001 && vp011 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//24
                            else if (vp000 && vp100 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//31
                            else if (vp100 && vp101 && vp001) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//32
                            else if (vp000 && vp101 && vp001) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//33
                            else if (vp000 && vp100 && vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//34
                            else if (vp110 && vp100 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//41
                            else if (vp110 && vp101 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//42
                            else if (vp100 && vp101 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//43
                            else if (vp110 && vp100 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//44
                            else if (vp110 && vp010 && vp011) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//51
                            else if (vp010 && vp011 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//52
                            else if (vp110 && vp011 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//53
                            else if (vp110 && vp010 && vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//54
                            else if (vp000 && vp010 && vp001) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//61
                            else if (vp000 && vp001 && vp011) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//62
                            else if (vp001 && vp010 && vp011) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//63
                            else if (vp000 && vp010 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//64
                            for (ii = 0; ii < 3; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                        }//no5 24
                    }//total3
                    else if (sumtype == 4) { // CHECK
                        if ((vp000 && vp100 && vp110 && vp010)
                           || (vp001 && vp101
                               && vp111 && vp011)
                           || (vp000 && vp100
                               && vp101 && vp001)
                           || (vp110 && vp100
                               && vp101 && vp111)
                           || (vp110 && vp010
                               && vp011 && vp111)
                           || (vp000 && vp010
                               && vp001 && vp011)) {
                            if (vp000 && vp100
                               && vp110 && vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;

                            }
                            else if (vp001 && vp101
                                     && vp111 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }
                            else if (vp000 && vp100
                                    && vp101 && vp001) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            }
                            else if (vp110 && vp100
                                    && vp101 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            }
                            else if (vp110 && vp010
                                    && vp011 && vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }
                            else if (vp000 && vp010
                                    && vp001 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no.8 6

                        else if ((vp000 && vp100 && vp110 && vp011)//11
                                || (vp000 && vp010 && vp110 && vp101)//12
                                || (vp010 && vp100 && vp110 && vp001)//13
                                || (vp000 && vp010 && vp100 && vp111)//14
                                || (vp001 && vp101 && vp111 && vp010)//21
                                || (vp001 && vp011 && vp111 && vp100)//22
                                || (vp011 && vp101 && vp111 && vp000)//23
                                || (vp001 && vp011 && vp101 && vp110)//24
                                || (vp000 && vp100 && vp101 && vp011)//31
                                || (vp100 && vp101 && vp001 && vp010)//32
                                || (vp000 && vp101 && vp001 && vp110)//33
                                || (vp000 && vp100 && vp001 && vp111)//34
                                || (vp110 && vp100 && vp111 && vp001)//41
                                || (vp110 && vp101 && vp111 && vp000)//42
                                || (vp100 && vp101 && vp111 && vp010)//43
                                || (vp110 && vp100 && vp101 && vp011)//44
                                || (vp110 && vp010 && vp011 && vp101)//51
                                || (vp010 && vp011 && vp111 && vp100)//52
                                || (vp110 && vp011 && vp111 && vp000)//53
                                || (vp110 && vp010 && vp111 && vp001)//54
                                || (vp000 && vp010 && vp001 && vp111)//61
                                || (vp000 && vp001 && vp011 && vp110)//62
                                || (vp001 && vp010 && vp011 && vp100)//63
                                || (vp000 && vp010 && vp011 && vp101)) {
                            if (vp000 && vp100 && vp110 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//11
                            else if (vp000 && vp010 && vp110 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//12
                            else if (vp010 && vp100 && vp110 && vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//13
                            else if (vp000 && vp010 && vp100 && vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//14
                            else if (vp001 && vp101 && vp111 && vp010) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//21
                            else if (vp001 && vp011 && vp111 && vp100) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//22
                            else if (vp011 && vp101 && vp111 && vp000) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//23
                            else if (vp001 && vp011 && vp101 && vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//24
                            else if (vp000 && vp100 && vp101 && vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//31
                            else if (vp100 && vp101 && vp001 && vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//32
                            else if (vp000 && vp101 && vp001 && vp110) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//33
                            else if (vp000 && vp100 && vp001 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//34
                            else if (vp110 && vp100 && vp111 && vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//41
                            else if (vp110 && vp101 && vp111 && vp000) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//42
                            else if (vp100 && vp101 && vp111 && vp010) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//43
                            else if (vp110 && vp100 && vp101 && vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                            }//44
                            else if (vp110 && vp010 && vp011 && vp101) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//51
                            else if (vp010 && vp011 && vp111 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//52
                            else if (vp110 && vp011 && vp111 && vp000) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//53
                            else if (vp110 && vp010 && vp111 && vp001) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//54
                            else if (vp000 && vp010 && vp001 && vp111) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//61
                            else if (vp000 && vp001 && vp011 && vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//62
                            else if (vp001 && vp010 && vp011 && vp100) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                            }//63
                            else if (vp000 && vp010 && vp011 && vp101) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                            }//64
                            for (ii = 0; ii < 3; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;

                        }//no12 24
                        else if ((vp000 && vp011
                                 && vp110 && vp010)
                                || (vp000 && vp100
                                    && vp110 && vp101)
                                || (vp000 && vp001
                                    && vp100 && vp010)
                                || (vp010 && vp100
                                    && vp110 && vp111)
                                || (vp001 && vp011
                                    && vp111 && vp010)
                                || (vp001 && vp100
                                    && vp111 && vp101)
                                || (vp000 && vp001
                                    && vp101 && vp011)
                                || (vp011 && vp101
                                    && vp110 && vp111)) {
                            if (vp010 && vp011
                               && vp000 && vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//1
                            else if (vp100 && vp101
                                    && vp110 && vp000) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//2
                            else if (vp000 && vp001
                                    && vp100 && vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//3
                            else if (vp110 && vp111
                                    && vp010 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//4
                            else if (vp010 && vp011
                                    && vp111 && vp001) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }//5
                            else if (vp100 && vp101
                                    && vp111 && vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            }//6
                            else if (vp000 && vp001
                                    && vp101 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }//7
                            else if (vp011 && vp101
                                    && vp110 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            }//8
                            for (ii = 0; ii < 3; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                        }// no.9 8
                        else if ((vp000 && vp100
                                 && vp110 && vp001)
                                || (vp010 && vp100
                                   && vp110 && vp101)
                                || (vp010 && vp000
                                   && vp110 && vp111)
                                || (vp010 && vp000
                                   && vp100 && vp011)
                                || (vp011 && vp001
                                   && vp101 && vp100)
                                || (vp111 && vp001
                                   && vp101 && vp110)
                                || (vp111 && vp011
                                   && vp101 && vp010)
                                || (vp111 && vp011
                                   && vp001 && vp000)
                                || (vp110 && vp011
                                   && vp001 && vp010)
                                || (vp101 && vp000
                                   && vp001 && vp010)
                                || (vp101 && vp000
                                   && vp111 && vp100)
                                || (vp011 && vp110
                                   && vp111 && vp100)) {
                            if (vp000 && vp100
                               && vp110 && vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//1
                            else if (vp010 && vp100
                                    && vp110 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//2
                            else if (vp010 && vp000
                                    && vp110 && vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//3
                            else if (vp010 && vp000
                                    && vp100 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//4
                            else if (vp011 && vp001
                                    && vp101 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//5
                            else if (vp111 && vp001
                                    && vp101 && vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//6
                            else if (vp111 && vp011
                                    && vp101 && vp010) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//7
                            else if (vp111 && vp011
                                    && vp001 && vp000) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//8
                            else if (vp110 && vp011
                                    && vp001 && vp010) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//9
                            else if (vp101 && vp000
                                    && vp001 && vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//10
                            else if (vp101 && vp000
                                    && vp111 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//11
                            else if (vp011 && vp110
                                    && vp111 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//12
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no.11 12
                        else if ((vp000 && vp100
                                 && vp010 && vp101)
                                || (vp000 && vp100
                                   && vp110 && vp111)
                                || (vp010 && vp100
                                   && vp110 && vp011)
                                || (vp010 && vp000
                                   && vp110 && vp001)
                                || (vp111 && vp001
                                   && vp101 && vp000)
                                || (vp111 && vp011
                                   && vp101 && vp100)
                                || (vp111 && vp011
                                   && vp001 && vp110)
                                || (vp101 && vp011
                                   && vp001 && vp010)
                                || (vp111 && vp011
                                   && vp000 && vp010)
                                || (vp100 && vp000
                                   && vp001 && vp011)
                                || (vp101 && vp001
                                   && vp110 && vp100)
                                || (vp010 && vp110
                                   && vp111 && vp101)) {
                            if (vp000 && vp100
                               && vp010 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//1
                            else if (vp000 && vp100
                                    && vp110 && vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//2
                            else if (vp010 && vp100
                                    && vp110 && vp011) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//3
                            else if (vp010 && vp000
                                    && vp110 && vp001) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//4
                            else if (vp111 && vp001
                                    && vp101 && vp000) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//5
                            else if (vp111 && vp011
                                    && vp101 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//6
                            else if (vp111 && vp011
                                    && vp001 && vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//7
                            else if (vp101 && vp011
                                    && vp001 && vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//8
                            else if (vp111 && vp011
                                    && vp000 && vp010) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k;
                            }//9
                            else if (vp100 && vp000
                                    && vp001 && vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//10
                            else if (vp101 && vp001
                                    && vp110 && vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//11
                            else if (vp010 && vp110
                                    && vp111 && vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//12
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no.14 12
                    }//total4
                    else if (sumtype == 5) {
                        if ((!vp100 && !vp001 && !vp111)
                           || (!vp010 && !vp001 && !vp111)
                           || (!vp110 && !vp101 && !vp011)
                           || (!vp000 && !vp101 && !vp011)
                           || (!vp101 && !vp000 && !vp110)
                           || (!vp011 && !vp000 && !vp110)
                           || (!vp111 && !vp100 && !vp010)
                           || (!vp001 && !vp100 && !vp010)) {
                            if (!vp100 && !vp001 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                            }//1
                            else if (!vp010 && !vp001 && !vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                            }//2
                            else if (!vp110 && !vp101 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                            }//3
                            else if (!vp000 && !vp101 && !vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                            }//4
                            else if (!vp101 && !vp000 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }//5
                            else if (!vp011 && !vp000 && !vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            }//6
                            else if (!vp111 && !vp100 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }//7
                            else if (!vp001 && !vp100 && !vp010) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            }//8
                            for (ii = 0; ii < 3; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                        }//no.7 8
                        else if ((!vp000 && !vp100 && !vp110)
                                || (!vp000 && !vp010 && !vp110)
                                || (!vp010 && !vp100 && !vp110)
                                || (!vp000 && !vp010 && !vp100)
                                || (!vp001 && !vp101 && !vp111)
                                || (!vp001 && !vp011 && !vp111)
                                || (!vp011 && !vp101 && !vp111)
                                || (!vp001 && !vp011 && !vp101)
                                || (!vp000 && !vp100 && !vp101)
                                || (!vp100 && !vp101 && !vp001)
                                || (!vp000 && !vp101 && !vp001)
                                || (!vp000 && !vp100 && !vp001)
                                || (!vp110 && !vp100 && !vp111)
                                || (!vp110 && !vp101 && !vp111)
                                || (!vp100 && !vp101 && !vp111)
                                || (!vp110 && !vp100 && !vp101)
                                || (!vp110 && !vp010 && !vp011)
                                || (!vp010 && !vp011 && !vp111)
                                || (!vp110 && !vp011 && !vp111)
                                || (!vp110 && !vp010 && !vp111)
                                || (!vp000 && !vp010 && !vp001)
                                || (!vp000 && !vp001 && !vp011)
                                || (!vp001 && !vp010 && !vp011)
                                || (!vp000 && !vp010 && !vp011)) {
                            if (!vp000 && !vp100 && !vp110) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//11
                            else if (!vp000 && !vp010 && !vp110) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//12
                            else if (!vp010 && !vp100 && !vp110) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k;
                            }//13
                            else if (!vp000 && !vp010 && !vp100) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//14
                            else if (!vp001 && !vp101 && !vp111) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//21
                            else if (!vp001 && !vp011 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//22
                            else if (!vp011 && !vp101 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//23
                            else if (!vp001 && !vp011 && !vp101) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//24
                            else if (!vp000 && !vp100 && !vp101) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//31
                            else if (!vp100 && !vp101 && !vp001) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k;
                            }//32
                            else if (!vp000 && !vp101 && !vp001) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//33
                            else if (!vp000 && !vp100 && !vp001) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//34
                            else if (!vp110 && !vp100 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//41
                            else if (!vp110 && !vp101 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//42
                            else if (!vp100 && !vp101 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//43
                            else if (!vp110 && !vp100 && !vp101) {
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//44
                            else if (!vp110 && !vp010 && !vp011) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//51
                            else if (!vp010 && !vp011 && !vp111) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//52
                            else if (!vp110 && !vp011 && !vp111) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//53
                            else if (!vp110 && !vp010 && !vp111) {
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//54
                            else if (!vp000 && !vp010 && !vp001) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//61
                            else if (!vp000 && !vp001 && !vp011) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//62
                            else if (!vp001 && !vp010 && !vp011) {
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k;
                            }//63
                            else if (!vp000 && !vp010 && !vp011) {
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//64
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no5 24
                        else if ((!vp000 && !vp100 && !vp111)//1
                                || (!vp010 && !vp110 && !vp001)//2
                                || (!vp011 && !vp111 && !vp100)//3
                                || (!vp001 && !vp101 && !vp110)//4
                                || (!vp000 && !vp010 && !vp111)//5
                                || (!vp101 && !vp111 && !vp010)//6
                                || (!vp100 && !vp110 && !vp011)//7
                                || (!vp001 && !vp011 && !vp110)//8
                                || (!vp000 && !vp001 && !vp111)//9
                                || (!vp110 && !vp111 && !vp000)//10
                                || (!vp100 && !vp101 && !vp011)//11
                                || (!vp010 && !vp011 && !vp101)) {
                            if (!vp000 && !vp100 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//1
                            else if (!vp010 && !vp110 && !vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k + 1;
                            }//2
                            else if (!vp011 && !vp111 && !vp100) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k;
                            }//3
                            else if (!vp001 && !vp101 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k;
                            }//4
                            else if (!vp000 && !vp010 && !vp111) {
                                //tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                //tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                //tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                //tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k + 1;
                            }//5
                            else if (!vp101 && !vp111 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k;
                            }//6
                            else if (!vp100 && !vp110 && !vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k + 1;
                            }//7
                            else if (!vp001 && !vp011 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k;
                            }//8
                            else if (!vp000 && !vp001 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k;
                            }//9
                            else if (!vp110 && !vp111 && !vp000) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k + 1;
                            }//10
                            else if (!vp100 && !vp101 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k;
                            }//11
                            else if (!vp010 && !vp011 && !vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k;
                            }//12
                            for (ii = 0; ii < 5; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;

                        }//no.6 12-1
                        else if ((!vp000 && !vp100 && !vp011)//1
                                || (!vp010 && !vp110 && !vp101)//2
                                || (!vp011 && !vp111 && !vp000)//3
                                || (!vp001 && !vp101 && !vp010)//4
                                || (!vp000 && !vp010 && !vp101)//5
                                || (!vp101 && !vp111 && !vp000)//6
                                || (!vp100 && !vp110 && !vp001)//7
                                || (!vp001 && !vp011 && !vp100)//8
                                || (!vp000 && !vp001 && !vp110)//9
                                || (!vp110 && !vp111 && !vp001)//10
                                || (!vp100 && !vp101 && !vp010)//11
                                || (!vp010 && !vp011 && !vp100)) {
                            if (!vp000 && !vp100 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//1
                            else if (!vp010 && !vp110 && !vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k + 1;
                            }//2
                            else if (!vp011 && !vp111 && !vp000) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k;
                            }//3
                            else if (!vp001 && !vp101 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k;
                            }//4
                            else if (!vp000 && !vp010 && !vp101) {
                                //tp[0][0]=i;tp[0][1]=j;tp[0][2]=k+1;
                                //tp[1][0]=i+1;tp[1][1]=j;tp[1][2]=k;
                                //tp[2][0]=i+1;tp[2][1]=j+1;tp[2][2]=k;
                                //tp[3][0]=i;tp[3][1]=j+1;tp[3][2]=k+1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//5
                            else if (!vp101 && !vp111 && !vp000) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k;
                            }//6
                            else if (!vp100 && !vp110 && !vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//7
                            else if (!vp001 && !vp011 && !vp100) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k;
                            }//8
                            else if (!vp000 && !vp001 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//9
                            else if (!vp110 && !vp111 && !vp001) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k;
                            }//10
                            else if (!vp100 && !vp101 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k + 1;
                            }//11
                            else if (!vp010 && !vp011 && !vp100) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k + 1;
                            }//12
                            for (ii = 0; ii < 5; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]]));
                            me.facenumber++;
                        }//no.6 12-2

                    }//total5

                    else if (sumtype == 6) {
                        if ((!vp000 && !vp100)
                           || (!vp010 && !vp110)
                           || (!vp011 && !vp111)
                           || (!vp001 && !vp101)
                           || (!vp000 && !vp010)
                           || (!vp101 && !vp111)
                           || (!vp100 && !vp110)
                           || (!vp001 && !vp011)
                           || (!vp000 && !vp001)
                           || (!vp110 && !vp111)
                           || (!vp100 && !vp101)
                           || (!vp010 && !vp011)) {
                            if (!vp000 && !vp100) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            }//1
                            else if (!vp010 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            }//2
                            else if (!vp011 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//3
                            else if (!vp001 && !vp101) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//4
                            else if (!vp000 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//5
                            else if (!vp101 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            }//6
                            else if (!vp100 && !vp110) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//7
                            else if (!vp001 && !vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            }//8
                            else if (!vp000 && !vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//9
                            else if (!vp110 && !vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            }//10
                            else if (!vp100 && !vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//11
                            else if (!vp010 && !vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                            }//12
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no.2 12

                        else if ((!vp000 && !vp111)
                                || (!vp100 && !vp011)
                                || (!vp010 && !vp101)
                                || (!vp110 && !vp001)) {
                            if (!vp000 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j + 1; tp[4][2] = k;
                                tp[5][0] = i + 1; tp[5][1] = j; tp[5][2] = k;
                            }//1
                            else if (!vp100 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                                tp[4][0] = i; tp[4][1] = j; tp[4][2] = k;
                                tp[5][0] = i + 1; tp[5][1] = j + 1; tp[5][2] = k;
                            }//2
                            else if (!vp010 && !vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j + 1; tp[4][2] = k;
                                tp[5][0] = i; tp[5][1] = j; tp[5][2] = k;
                            }//3
                            else if (!vp110 && !vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                                tp[4][0] = i + 1; tp[4][1] = j; tp[4][2] = k;
                                tp[5][0] = i; tp[5][1] = j + 1; tp[5][2] = k;
                            }//4
                            for (ii = 0; ii < 6; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[3][0]][tp[3][1]][tp[3][2]], vertseq[tp[4][0]][tp[4][1]][tp[4][2]], vertseq[tp[5][0]][tp[5][1]][tp[5][2]]));
                            me.facenumber++;
                        }//no.4 4

                        else if ((!vp000 && !vp101)
                                || (!vp100 && !vp001)
                                || (!vp100 && !vp111)
                                || (!vp110 && !vp101)
                                || (!vp110 && !vp011)
                                || (!vp010 && !vp111)
                                || (!vp010 && !vp001)
                                || (!vp000 && !vp011)
                                || (!vp001 && !vp111)
                                || (!vp101 && !vp011)
                                || (!vp000 && !vp110)
                                || (!vp100 && !vp010)) {
                            if (!vp000 && !vp101) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//1
                            else if (!vp100 && !vp001) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//2
                            else if (!vp100 && !vp111) {
                                tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k + 1;
                            }//3
                            else if (!vp110 && !vp101) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//4
                            else if (!vp110 && !vp011) {
                                tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//5
                            else if (!vp010 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k;
                            }//6
                            else if (!vp010 && !vp001) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//7
                            else if (!vp000 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k;
                            }//8
                            else if (!vp001 && !vp111) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                                tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                                tp[3][0] = i + 1; tp[3][1] = j + 1; tp[3][2] = k;
                            }//9
                            else if (!vp101 && !vp011) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                                tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                                tp[3][0] = i; tp[3][1] = j + 1; tp[3][2] = k;
                            }//10
                            else if (!vp000 && !vp110) {
                                tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                                tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[3][0] = i; tp[3][1] = j; tp[3][2] = k + 1;
                            }//11
                            else if (!vp100 && !vp010) {
                                tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                                tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                                tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                                tp[3][0] = i + 1; tp[3][1] = j; tp[3][2] = k + 1;
                            }//12
                            for (ii = 0; ii < 4; ++ii) {
                                if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                    vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                    me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                    me.vertnumber++;
                                }
                            }
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                            me.facenumber++;
                            me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]], vertseq[tp[3][0]][tp[3][1]][tp[3][2]]));
                            me.facenumber++;
                        }//no.3 12

                    }//total6

                    else if (sumtype == 7) {
                        if (!vp000) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k + 1;
                        }//1
                        else if (!vp100) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k + 1;
                        }//2
                        else if (!vp110) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k;
                            tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        }//3
                        else if (!vp010) {
                            tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k + 1;
                        }//4
                        else if (!vp001) {
                            tp[0][0] = i + 1; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j; tp[2][2] = k;
                        }//5
                        else if (!vp101) {
                            tp[0][0] = i + 1; tp[0][1] = j + 1; tp[0][2] = k + 1;
                            tp[1][0] = i; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i + 1; tp[2][1] = j; tp[2][2] = k;
                        }//6
                        else if (!vp111) {
                            tp[0][0] = i; tp[0][1] = j + 1; tp[0][2] = k + 1;
                            tp[1][0] = i + 1; tp[1][1] = j; tp[1][2] = k + 1;
                            tp[2][0] = i + 1; tp[2][1] = j + 1; tp[2][2] = k;
                        }//7
                        else if (!vp011) {
                            tp[0][0] = i; tp[0][1] = j; tp[0][2] = k + 1;
                            tp[1][0] = i + 1; tp[1][1] = j + 1; tp[1][2] = k + 1;
                            tp[2][0] = i; tp[2][1] = j + 1; tp[2][2] = k;
                        }//8
                        for (ii = 0; ii < 3; ++ii) {
                            if (vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] == -1) {
                                vertseq[tp[ii][0]][tp[ii][1]][tp[ii][2]] = me.vertnumber;
                                me.verts.push(new me.Vector3(tp[ii][0], tp[ii][1], tp[ii][2]));
                                me.vertnumber++;
                            }
                        }
                        me.faces.push(new me.Face3(vertseq[tp[0][0]][tp[0][1]][tp[0][2]], vertseq[tp[1][0]][tp[1][1]][tp[1][2]], vertseq[tp[2][0]][tp[2][1]][tp[2][2]]));
                        me.facenumber++;
                    }//total7

                }//every ijk
            }//j
        }//i
        //me.faces = me.faces;
        //me.verts = me.verts;
        for (i = 0; i < me.vertnumber; ++i) {
            me.verts[i].atomid = me.vp[me.verts[i].x * me.pWidth * me.pHeight + me.pHeight * me.verts[i].y + me.verts[i].z].atomid;
        }
    };

    this.laplaciansmooth = function (numiter) {
        var tps = new Array(me.vertnumber);
        for (var i = 0; i < me.vertnumber; ++i) tps[i] = { x: 0, y: 0, z: 0 };
        var vertdeg = new Array(20);
        var flagvert;
        for (var i = 0; i < 20; ++i) vertdeg[i] = new Array(me.vertnumber);
        for (var i = 0; i < me.vertnumber; ++i) vertdeg[0][i] = 0;
        for (var i = 0; i < me.facenumber; ++i) {
            flagvert = true;
            for (var j = 0; j < vertdeg[0][me.faces[i].a]; ++j) {
                if (me.faces[i].b == vertdeg[j + 1][me.faces[i].a]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].a]++;
                vertdeg[vertdeg[0][me.faces[i].a]][me.faces[i].a] = me.faces[i].b;
            }
            flagvert = true;
            for (var j = 0; j < vertdeg[0][me.faces[i].a]; ++j) {
                if (me.faces[i].c == vertdeg[j + 1][me.faces[i].a]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].a]++;
                vertdeg[vertdeg[0][me.faces[i].a]][me.faces[i].a] = me.faces[i].c;
            }
            //b
            flagvert = true;
            for (j = 0; j < vertdeg[0][me.faces[i].b]; ++j) {
                if (me.faces[i].a == vertdeg[j + 1][me.faces[i].b]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].b]++;
                vertdeg[vertdeg[0][me.faces[i].b]][me.faces[i].b] = me.faces[i].a;
            }
            flagvert = true;
            for (j = 0 ; j < vertdeg[0][me.faces[i].b]; ++j) {
                if (me.faces[i].c == vertdeg[j + 1][me.faces[i].b]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].b]++;
                vertdeg[vertdeg[0][me.faces[i].b]][me.faces[i].b] = me.faces[i].c;
            }
            //c
            flagvert = true;
            for (j = 0; j < vertdeg[0][me.faces[i].c]; ++j) {
                if (me.faces[i].a == vertdeg[j + 1][me.faces[i].c]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].c]++;
                vertdeg[vertdeg[0][me.faces[i].c]][me.faces[i].c] = me.faces[i].a;
            }
            flagvert = true;
            for (j = 0; j < vertdeg[0][me.faces[i].c]; ++j) {
                if (me.faces[i].b == vertdeg[j + 1][me.faces[i].c]) {
                    flagvert = false;
                    break;
                }
            }
            if (flagvert) {
                vertdeg[0][me.faces[i].c]++;
                vertdeg[vertdeg[0][me.faces[i].c]][me.faces[i].c] = me.faces[i].b;
            }
        }

        var wt = 1.00;
        var wt2 = 0.50;
        var ssign;
        var outwt = 0.75 / (me.scaleFactor + 3.5); //area-preserving
        for (var k = 0; k < numiter; ++k) {
            for (var i = 0; i < me.vertnumber; ++i) {
                if (vertdeg[0][i] < 3) {
                    tps[i].x = me.verts[i].x;
                    tps[i].y = me.verts[i].y;
                    tps[i].z = me.verts[i].z;
                } else if (vertdeg[0][i] == 3 || vertdeg[0][i] == 4) {
                    tps[i].x = 0;
                    tps[i].y = 0;
                    tps[i].z = 0;
                    for (j = 0; j < vertdeg[0][i]; ++j) {
                        tps[i].x += me.verts[vertdeg[j + 1][i]].x;
                        tps[i].y += me.verts[vertdeg[j + 1][i]].y;
                        tps[i].z += me.verts[vertdeg[j + 1][i]].z;
                    }
                    tps[i].x += wt2 * me.verts[i].x;
                    tps[i].y += wt2 * me.verts[i].y;
                    tps[i].z += wt2 * me.verts[i].z;
                    tps[i].x /= wt2 + vertdeg[0][i];
                    tps[i].y /= wt2 + vertdeg[0][i];
                    tps[i].z /= wt2 + vertdeg[0][i];
                } else {
                    tps[i].x = 0;
                    tps[i].y = 0;
                    tps[i].z = 0;
                    for (var j = 0; j < vertdeg[0][i]; ++j) {
                        tps[i].x += me.verts[vertdeg[j + 1][i]].x;
                        tps[i].y += me.verts[vertdeg[j + 1][i]].y;
                        tps[i].z += me.verts[vertdeg[j + 1][i]].z;
                    }
                    tps[i].x += wt * me.verts[i].x;
                    tps[i].y += wt * me.verts[i].y;
                    tps[i].z += wt * me.verts[i].z;
                    tps[i].x /= wt + vertdeg[0][i];
                    tps[i].y /= wt + vertdeg[0][i];
                    tps[i].z /= wt + vertdeg[0][i];
                }
            }
            for (var i = 0; i < me.vertnumber; ++i) {
                me.verts[i].x = tps[i].x;
                me.verts[i].y = tps[i].y;
                me.verts[i].z = tps[i].z;
            }
            /*  computenorm();
            for (var i = 0; i < me.vertnumber; ++i) {
                if (me.verts[i].inout) ssign = 1; else ssign = -1;
                me.verts[i].x += ssign * outwt * me.verts[i].pn.x;
                me.verts[i].y += ssign * outwt * me.verts[i].pn.y;
                me.verts[i].z += ssign * outwt * me.verts[i].pn.z;
            }*/
        }
    };

    this.transformVertices = function () {
        var vertices = me.verts;
        var scaleFactorInverse = 1 / me.scaleFactor;
        for (var i = 0; i < me.vertnumber; ++i) {
            vertices[i].x = vertices[i].x * scaleFactorInverse - me.ptranx;
            vertices[i].y = vertices[i].y * scaleFactorInverse - me.ptrany;
            vertices[i].z = vertices[i].z * scaleFactorInverse - me.ptranz;
        }
    };

    initparm(data.min, data.max, data.type > 1);

    fillvoxels(data.atoms);
    buildboundary();
    if (data.type == 4 || data.type == 2) fastdistancemap();
    if (data.type == 2) { boundingatom(false); fillvoxelswaals(data.atoms); }
    marchingcube(data.type);
    laplaciansmooth(1);
    transformVertices();
    return {
        verts: me.verts,
        faces: me.faces,
    };
};

//onmessage = function (e) {
//    postMessage(ProteinSurface(e.data));
//};