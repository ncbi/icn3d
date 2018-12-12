/*! ProteinSurface4.js
 * @author David Koes  / https://github.com/3dmol/3Dmol.js/tree/master/3Dmol
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

/*  ProteinSurface.js by biochem_fan

Ported and modified for Javascript based on EDTSurf,
  whose license is as follows.

Permission to use, copy, modify, and distribute this program for any
purpose, with or without fee, is hereby granted, provided that this
copyright notice and the reference information appear in all copies or
substantial portions of the Software. It is provided "as is" without
express or implied warranty.

Reference:
http://zhanglab.ccmb.med.umich.edu/EDTSurf/
D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular Surfaces
by Euclidean Distance Transform. PLoS ONE 4(12): e8140.

=======

TODO: Improved performance on Firefox
      Reduce memory consumption
      Refactor!
 */


// dkoes
// Surface calculations.  This must be safe to use within a web worker.
if (typeof console === 'undefined') {
    // this should only be true inside of a webworker
    console = {
        log : function() {
        }
    };
}

$3Dmol.ElectronMap = function(threshbox) {

    // constants for vpbits bitmasks
    /** @const */
    var INOUT = 1;
    /** @const */
    var ISDONE = 2;
    /** @const */
    var ISBOUND = 4;

    var isovalue = 1.5;
    var dataHash = {};
    var matrix;

    var ptranx = 0, ptrany = 0, ptranz = 0;
    var probeRadius = 1.4;
    var defaultScaleFactor = 2;
    var scaleFactor = defaultScaleFactor; // 2 is .5A grid; if this is made user configurable,
                            // also have to adjust offset used to find non-shown
                            // atoms
    var pHeight = 0, pWidth = 0, pLength = 0;
    var cutRadius = 0;
    var vpBits = null; // uint8 array of bitmasks
    var vpDistance = null; // floatarray of _squared_ distances
    var vpAtomID = null; // intarray
    var vertnumber = 0, facenumber = 0;
    var pminx = 0, pminy = 0, pminz = 0, pmaxx = 0, pmaxy = 0, pmaxz = 0;

    var depty = {}, widxz = {};
    var faces, verts;
    var nb = [ new Int32Array([ 1, 0, 0 ]), new Int32Array([ -1, 0, 0 ]),
               new Int32Array([ 0, 1, 0 ]), new Int32Array([ 0, -1, 0 ]),
               new Int32Array([ 0, 0, 1 ]),
               new Int32Array([ 0, 0, -1 ]),
               new Int32Array([ 1, 1, 0 ]),
               new Int32Array([ 1, -1, 0 ]),
               new Int32Array([ -1, 1, 0 ]),
               new Int32Array([ -1, -1, 0 ]),
               new Int32Array([ 1, 0, 1 ]),
               new Int32Array([ 1, 0, -1 ]),
               new Int32Array([ -1, 0, 1 ]),
               new Int32Array([ -1, 0, -1 ]),
               new Int32Array([ 0, 1, 1 ]),
               new Int32Array([ 0, 1, -1 ]),
               new Int32Array([ 0, -1, 1 ]),
               new Int32Array([ 0, -1, -1 ]),
               new Int32Array([ 1, 1, 1 ]),
               new Int32Array([ 1, 1, -1 ]),
               new Int32Array([ 1, -1, 1 ]),
               new Int32Array([ -1, 1, 1 ]),
               new Int32Array([ 1, -1, -1 ]),
               new Int32Array([ -1, -1, 1 ]),
               new Int32Array([ -1, 1, -1 ]),
               new Int32Array([ -1, -1, -1 ]) ];

    //var origextent;

    this.getFacesAndVertices = function(atomlist) {
        var atomsToShow = {};
        var i, il;
        for (i = 0, il = atomlist.length; i < il; i++)
            atomsToShow[atomlist[i]] = true;
        var vertices = verts;
        for (i = 0, il = vertices.length; i < il; i++) {
/*
            vertices[i].x = vertices[i].x / scaleFactor - ptranx;
            vertices[i].y = vertices[i].y / scaleFactor - ptrany;
            vertices[i].z = vertices[i].z / scaleFactor - ptranz;
*/

            var r = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z).applyMatrix4(matrix);
            vertices[i].x = r.x / scaleFactor - ptranx;
            vertices[i].y = r.y / scaleFactor - ptrany;
            vertices[i].z = r.z / scaleFactor - ptranz;
        }

        var finalfaces = [];
        for (i = 0, il = faces.length; i < il; i += 3) {
            //var f = faces[i];
            var fa = faces[i], fb = faces[i+1], fc = faces[i+2];

/*
            var a = vertices[fa]['atomid'], b = vertices[fb]['atomid'], c = vertices[fc]['atomid'];

            // must be a unique face for each atom
            var which = a;
            if (b < which)
                which = b;
            if (c < which)
                which = c;
            if (!atomsToShow[which]) {
                continue;
            }
*/

            var av = vertices[faces[i]];
            var bv = vertices[faces[i+1]];
            var cv = vertices[faces[i+2]];

            if (fa !== fb && fb !== fc && fa !== fc){
                //finalfaces.push(fa);
                //finalfaces.push(fb);
                //finalfaces.push(fc);

                // !!! different between 3Dmol and iCn3D
                finalfaces.push({"a":fa, "b":fb, "c":fc});
            }

        }

        //try to help the garbage collector
        vpBits = null; // uint8 array of bitmasks
        vpDistance = null; // floatarray
        vpAtomID = null; // intarray

        return {
            'vertices' : vertices,
            'faces' : finalfaces
        };
    };


    this.initparm = function(header, inData, inMatrix, inIsovalue) {
        isovalue = inIsovalue;
        dataHash = inData;
        matrix = inMatrix;

        var margin = (1 / scaleFactor) * 5.5; // need margin to avoid
                                                // boundary/round off effects
        //origextent = extent;

        pminx = 0; pmaxx = header.xExtent - 1;
        pminy = 0; pmaxy = header.yExtent - 1;
        pminz = 0; pmaxz = header.zExtent - 1;

/*
        pminx = -0.5 *(header.xExtent - 1); pmaxx = 0.5 *(header.xExtent - 1);
        pminy = -0.5 *(header.yExtent - 1); pmaxy = 0.5 *(header.yExtent - 1);
        pminz = -0.5 *(header.zExtent - 1); pmaxz = 0.5 *(header.zExtent - 1);
*/
/*
        pminx -= margin;
        pminy -= margin;
        pminz -= margin;
        pmaxx += margin;
        pmaxy += margin;
        pmaxz += margin;

        pminx = Math.floor(pminx * scaleFactor) / scaleFactor;
        pminy = Math.floor(pminy * scaleFactor) / scaleFactor;
        pminz = Math.floor(pminz * scaleFactor) / scaleFactor;
        pmaxx = Math.ceil(pmaxx * scaleFactor) / scaleFactor;
        pmaxy = Math.ceil(pmaxy * scaleFactor) / scaleFactor;
        pmaxz = Math.ceil(pmaxz * scaleFactor) / scaleFactor;

        ptranx = -pminx;
        ptrany = -pminy;
        ptranz = -pminz;

        // !!! different between 3Dmol and iCn3D
        // copied from surface.js from iview
        var boxLength = 128;
        var maxLen = pmaxx - pminx;
        if ((pmaxy - pminy) > maxLen) maxLen = pmaxy - pminy;
        if ((pmaxz - pminz) > maxLen) maxLen = pmaxz - pminz;
        scaleFactor = (boxLength - 1.0) / maxLen;

        boxLength = Math.floor(boxLength * defaultScaleFactor / scaleFactor);
        scaleFactor = defaultScaleFactor;
        //var threshbox = 180; // maximum possible boxsize
        if (boxLength > threshbox) {
            var sfthresh = threshbox / boxLength;
            boxLength = Math.floor(threshbox);
            scaleFactor = scaleFactor * sfthresh;
        }
        // end of surface.js part
*/

        ptranx = -pminx;
        ptrany = -pminy;
        ptranz = -pminz;

        var maxLen = pmaxx - pminx;
        if ((pmaxy - pminy) > maxLen) maxLen = pmaxy - pminy;
        if ((pmaxz - pminz) > maxLen) maxLen = pmaxz - pminz;

        scaleFactor = 1;
        boxLength = maxLen;

        pLength = Math.ceil(scaleFactor * (pmaxx - pminx)) + 1;
        pWidth = Math.ceil(scaleFactor * (pmaxy - pminy)) + 1;
        pHeight = Math.ceil(scaleFactor * (pmaxz - pminz)) + 1;

        //this.boundingatom();
        cutRadius = probeRadius * scaleFactor;

        vpBits = new Uint8Array(pLength * pWidth * pHeight);
        vpDistance = new Float64Array(pLength * pWidth * pHeight); // float 32
        vpAtomID = new Int32Array(pLength * pWidth * pHeight);
        //console.log("Box size: ", pLength, pWidth, pHeight, vpBits.length);
    };

/*
    this.boundingatom = function(btype) {
        var tradius = [];
        var txz, tdept, sradius, idx;
        //flagradius = btype;

        for ( var i in vdwRadii) {
            if(!vdwRadii.hasOwnProperty(i))
                continue;
            var r = vdwRadii[i];
            if (!btype)
                tradius[i] = r * scaleFactor + 0.5;
            else
                tradius[i] = (r + probeRadius) * scaleFactor + 0.5;

            sradius = tradius[i] * tradius[i];
            widxz[i] = Math.floor(tradius[i]) + 1;
            depty[i] = new Int32Array(widxz[i] * widxz[i]);
            indx = 0;
            for (j = 0; j < widxz[i]; j++) {
                for (k = 0; k < widxz[i]; k++) {
                    txz = j * j + k * k;
                    if (txz > sradius)
                        depty[i][indx] = -1; // outside
                    else {
                        tdept = Math.sqrt(sradius - txz);
                        depty[i][indx] = Math.floor(tdept);
                    }
                    indx++;
                }
            }
        }
    };
*/

    this.fillvoxels = function(atoms, atomlist) { // (int seqinit,int
        // seqterm,bool
        // atomtype,atom*
        // proseq,bool bcolor)
        var i, j, k, il;
        for (i = 0, il = vpBits.length; i < il; i++) {
            vpBits[i] = 0;
            vpDistance[i] = -1.0;
            vpAtomID[i] = -1;
        }

        var index = 0;
        for(i = 0; i < pLength; ++i) {
            for(j = 0; j < pWidth; ++j) {
                for(k = 0; k < pHeight; ++k) {
                    vpBits[index] = (dataHash[index.toString()] >= isovalue) ? 1 : 0;
                    ++index;
                }
            }
        }

/*
        for (i in atomlist) {
            var atom = atoms[atomlist[i]];
            if (atom === undefined)
                continue;
            this.fillAtom(atom, atoms);
        }
*/

        for (i = 0, il = vpBits.length; i < il; i++)
            if (vpBits[i] & INOUT)
                vpBits[i] |= ISDONE;

    };

/*
    this.fillAtom = function(atom, atoms) {
        var cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk;
        var ii, jj, kk, n;
        //cx = Math.floor(0.5 + scaleFactor * (atom.x + ptranx));
        //cy = Math.floor(0.5 + scaleFactor * (atom.y + ptrany));
        //cz = Math.floor(0.5 + scaleFactor * (atom.z + ptranz));

        // !!! different between 3Dmol and iCn3D
        cx = Math.floor(0.5 + scaleFactor * (atom.coord.x + ptranx));
        cy = Math.floor(0.5 + scaleFactor * (atom.coord.y + ptrany));
        cz = Math.floor(0.5 + scaleFactor * (atom.coord.z + ptranz));

        var at = getVDWIndex(atom);
        var nind = 0;
        var cnt = 0;
        var pWH = pWidth*pHeight;

        for (i = 0, n = widxz[at]; i < n; i++) {
            for (j = 0; j < n; j++) {
                if (depty[at][nind] != -1) {
                    for (ii = -1; ii < 2; ii++) {
                        for (jj = -1; jj < 2; jj++) {
                            for (kk = -1; kk < 2; kk++) {
                                if (ii !== 0 && jj !== 0 && kk !== 0) {
                                    mi = ii * i;
                                    mk = kk * j;
                                    for (k = 0; k <= depty[at][nind]; k++) {
                                        mj = k * jj;
                                        si = cx + mi;
                                        sj = cy + mj;
                                        sk = cz + mk;
                                        if (si < 0 || sj < 0 ||
                                                sk < 0 ||
                                                si >= pLength ||
                                                sj >= pWidth ||
                                                sk >= pHeight)
                                            continue;
                                        var index = si * pWH + sj * pHeight + sk;

                                        if (!(vpBits[index] & INOUT)) {
                                            vpBits[index] |= INOUT;
                                            vpAtomID[index] = atom.serial;
                                        } else {
                                            var atom2 = atoms[vpAtomID[index]];
                                            if(atom2.serial != atom.serial) {
                                                ox = cx + mi - Math.floor(0.5 + scaleFactor *
                                                        (atom2.x + ptranx));
                                                oy = cy + mj - Math.floor(0.5 + scaleFactor *
                                                        (atom2.y + ptrany));
                                                oz = cz + mk - Math.floor(0.5 + scaleFactor *
                                                        (atom2.z + ptranz));
                                                if (mi * mi + mj * mj + mk * mk < ox *
                                                        ox + oy * oy + oz * oz)
                                                    vpAtomID[index] = atom.serial;
                                            }
                                        }

                                    }// k
                                }// if
                            }// kk
                        }// jj
                    }// ii
                }// if
                nind++;
            }// j
        }// i
    };
*/

    this.buildboundary = function() {
        var pWH = pWidth*pHeight;
        for (i = 0; i < pLength; i++) {
            for (j = 0; j < pHeight; j++) {
                for (k = 0; k < pWidth; k++) {
                    var index = i * pWH + k * pHeight + j;
                    if (vpBits[index] & INOUT) {
                        var flagbound = false;
                        var ii = 0;
                        while (ii < 26) {
                            var ti = i + nb[ii][0], tj = j + nb[ii][2], tk = k +
                                    nb[ii][1];
                            if (ti > -1 &&
                                ti < pLength &&
                                tk > -1 &&
                                tk < pWidth &&
                                tj > -1 &&
                                tj < pHeight &&
                                !(vpBits[ti * pWH + tk * pHeight + tj] & INOUT)) {
                                vpBits[index] |= ISBOUND;
                                break;
                            } else
                                ii++;
                        }
                    }
                }
            }
        }
    };

    this.marchingcubeinit = function(stype) {
        for ( var i = 0, lim = vpBits.length; i < lim; i++) {
            if (stype == 1) {// vdw
                vpBits[i] &= ~ISBOUND;
            } else if (stype == 4) { // ses
                vpBits[i] &= ~ISDONE;
                if (vpBits[i] & ISBOUND)
                    vpBits[i] |= ISDONE;
                vpBits[i] &= ~ISBOUND;
            } else if (stype == 2) {// after vdw
                if ((vpBits[i] & ISBOUND) && (vpBits[i] & ISDONE))
                    vpBits[i] &= ~ISBOUND;
                else if ((vpBits[i] & ISBOUND) && !(vpBits[i] & ISDONE))
                    vpBits[i] |= ISDONE;
            } else if (stype == 3) { // sas
                vpBits[i] &= ~ISBOUND;
            }
            else {
                vpBits[i] &= ~ISBOUND;
            }
        }
    };

    // this code allows me to empirically prune the marching cubes code tables
    // to more efficiently handle discrete data
    var counter = function() {
        var data = Array(256);
        for ( var i = 0; i < 256; i++)
            data[i] = [];

        this.incrementUsed = function(i, j) {
            if (typeof data[i][j] === 'undefined')
                data[i][j] = {
                    used : 0,
                    unused : 0
                };
            data[i][j].used++;
        };

        this.incrementUnused = function(i, j) {
            if (typeof data[i][j] === 'undefined')
                data[i][j] = {
                    used : 0,
                    unused : 0
                };
            data[i][j].unused++;

        };

        var redoTable = function(triTable) {
            var str = "[";
            for ( var i = 0; i < triTable.length; i++) {
                var code = 0;
                var table = triTable[i];
                for ( var j = 0; j < table.length; j++) {
                    code |= (1 << (table[j]));
                }
                str += "0x" + code.toString(16) + ", ";
            }
            str += "]";
            //console.log(str);
        };

        this.print = function() {

            var table = MarchingCube.triTable;
            var str;
            var newtable = [];
            for ( var i = 0; i < table.length; i++) {
                var newarr = [];
                for ( var j = 0; j < table[i].length; j += 3) {
                    var k = j / 3;
                    if (typeof data[i][k] === 'undefined' || !data[i][k].unused) {
                        newarr.push(table[i][j]);
                        newarr.push(table[i][j + 1]);
                        newarr.push(table[i][j + 2]);
                    }
                    if (typeof data[i][k] === 'undefined')
                        console.log("undef " + i + "," + k);
                }
                newtable.push(newarr);
            }
            //console.log(JSON.stringify(newtable));
            redoTable(newtable);
        };
    };

    this.marchingcube = function(stype) {
        this.marchingcubeinit(stype);
        verts = []; faces = [];

        $3Dmol.MarchingCube.march(vpBits, verts, faces, {
            smooth : 1,
            nX : pLength,
            nY : pWidth,
            nZ : pHeight
        });

/*
        var pWH = pWidth*pHeight;
        for (var i = 0, vlen = verts.length; i < vlen; i++) {
            verts[i]['atomid'] = vpAtomID[verts[i].x * pWH + pHeight *
                    verts[i].y + verts[i].z];
        }
*/
        $3Dmol.MarchingCube.laplacianSmooth(1, verts, faces);

    };


};
