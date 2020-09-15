/* ProteinSurface4.js
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
    //"use strict";

    // constants for vpbits bitmasks
    /** @var */
    var INOUT = 1;
    /** @var */
    var ISDONE = 2;
    /** @var */
    var ISBOUND = 4;

    var isovalue = 1.5;
    var dataArray = {};
    var matrix, center, maxdist, pmin, pmax, water, header, type, rmsd_supr;

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

    this.getFacesAndVertices = function(allatoms, atomlist) {
        var atomsToShow = {};
        var i, il;
        for (i = 0, il = atomlist.length; i < il; i++)
            atomsToShow[atomlist[i]] = 1;
        var vertices = verts;

        for (i = 0, il = vertices.length; i < il; i++) {
            var r;
            if(type == 'phi') {
                r = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z).multiplyScalar(1.0/header.scale).applyMatrix4(matrix);
            }
            else {
                r = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z).applyMatrix4(matrix);
            }

//            vertices[i].x = r.x / scaleFactor - ptranx;
//            vertices[i].y = r.y / scaleFactor - ptrany;
//            vertices[i].z = r.z / scaleFactor - ptranz;

            vertices[i].x = r.x;
            vertices[i].y = r.y;
            vertices[i].z = r.z;
        }

        var finalfaces = [];

        for (i = 0, il = faces.length; i < il; i += 3) {
            //var f = faces[i];
            var fa = faces[i], fb = faces[i+1], fc = faces[i+2];

            if (fa !== fb && fb !== fc && fa !== fc){
                finalfaces.push({"a":fa, "b":fb, "c":fc});
            }
        }

        //try to help the garbage collector
        vpBits = null; // uint8 array of bitmasks
        vpDistance = null; // floatarray
        vpAtomID = null; // intarray

        return {
            'vertices' : vertices, //shownVertices,
            'faces' : finalfaces
        };
    };


    this.initparm = function(inHeader, inData, inMatrix, inIsovalue, inCenter, inMaxdist,
      inPmin, inPmax, inWater, inType, inRmsd_supr) {
        header = inHeader;

        if(header.max !== undefined) { // EM density map from EBI
            isovalue = header.min + (header.max - header.min) * inIsovalue / 100.0;
        }
        else if(header.mean !== undefined) { // density map from EBI
            isovalue = header.mean + header.sigma * inIsovalue; // electron density map from EBI
        }
        else {
            isovalue = inIsovalue;
        }

        dataArray = inData;
        matrix = inMatrix;
        center = inCenter;
        maxdist = inMaxdist;
        pmin = inPmin;
        pmax = inPmax;
        water = inWater;
        type = inType;

        rmsd_supr = inRmsd_supr;

        pminx = 0; pmaxx = header.xExtent - 1;
        pminy = 0; pmaxy = header.yExtent - 1;
        pminz = 0; pmaxz = header.zExtent - 1;

        ptranx = -pminx;
        ptrany = -pminy;
        ptranz = -pminz;

        var maxLen = pmaxx - pminx;
        if ((pmaxy - pminy) > maxLen) maxLen = pmaxy - pminy;
        if ((pmaxz - pminz) > maxLen) maxLen = pmaxz - pminz;

        scaleFactor = 1; // angstrom / grid
        var boxLength = maxLen;

        pLength = Math.floor(0.5 + scaleFactor * (pmaxx - pminx)) + 1;
        pWidth = Math.floor(0.5 + scaleFactor * (pmaxy - pminy)) + 1;
        pHeight = Math.floor(0.5 + scaleFactor * (pmaxz - pminz)) + 1;

        //this.boundingatom();
        cutRadius = probeRadius * scaleFactor;

        vpBits = new Uint8Array(pLength * pWidth * pHeight);
        vpAtomID = new Uint8Array(pLength * pWidth * pHeight);
    };

    this.transformMemPro = function(inCoord, rot, centerFrom, centerTo) {
        var coord = inCoord.clone();
        coord.sub(centerFrom);

        var x = coord.x*rot[0] + coord.y*rot[1] + coord.z*rot[2] + centerTo.x;
        var y = coord.x*rot[3] + coord.y*rot[4] + coord.z*rot[5] + centerTo.y;
        var z = coord.x*rot[6] + coord.y*rot[7] + coord.z*rot[8] + centerTo.z;

        coord.x = x;
        coord.y = y;
        coord.z = z;

        return coord;
    };

    this.fillvoxels = function(atoms, atomlist) { // (int seqinit,int
        // seqterm,bool
        // atomtype,atom*
        // proseq,bool bcolor)
        var i, j, k, il, jl, kl;
        for (i = 0, il = vpBits.length; i < il; i++) {
            vpBits[i] = 0;
            //vpDistance[i] = -1.0;
            vpAtomID[i] = 0;
        }

        var widthHeight = pWidth * pHeight;
        var height = pHeight;

        if(type == 'phi') {
            // Do NOT exclude map far away from the atoms
            //var index = 0;
            for(i = 0; i < pLength; ++i) {
                for(j = 0; j < pWidth; ++j) {
                    for(k = 0; k < pHeight; ++k) {
                        var index = i * widthHeight + j * height + k;

                        var index2;
                        if(header.filetype == 'phi') { // loop z, y, x
                            index2 = k * widthHeight + j * height + i;
                        }
                        else if(header.filetype == 'cube') { // loop x, y, z
                            index2 = i * widthHeight + j * height + k;
                        }

                        if(index2 < dataArray.length) {
                            vpBits[index] = (dataArray[index2] >= isovalue || dataArray[index2] <= -isovalue) ? 1 : 0;
                            vpAtomID[index] = (dataArray[index2] >= 0) ? 1 : 0; // determine whether it's positive
                        }
                        //++index;
                    }
                }
            }
        }
        else {
            var inverseMatrix = new THREE.Matrix4().getInverse(matrix);

            var indexArray = [];
            maxdist = parseInt(maxdist); // has to be integer

            var rot, inverseRot = new Array(9), centerFrom, centerTo;
            if(rmsd_supr !== undefined && rmsd_supr.rot !== undefined) {
              rot = rmsd_supr.rot;
              centerFrom = rmsd_supr.trans1;
              centerTo = rmsd_supr.trans2;

              var m = new THREE.Matrix3(), inverseM = new THREE.Matrix3();
              m.set(rot[0], rot[1], rot[2], rot[3], rot[4], rot[5], rot[6], rot[7], rot[8]);
              inverseM.getInverse(m);

              inverseRot[0] = inverseM.elements[0];
              inverseRot[1] = inverseM.elements[3];
              inverseRot[2] = inverseM.elements[6];
              inverseRot[3] = inverseM.elements[1];
              inverseRot[4] = inverseM.elements[4];
              inverseRot[5] = inverseM.elements[7];
              inverseRot[6] = inverseM.elements[2];
              inverseRot[7] = inverseM.elements[5];
              inverseRot[8] = inverseM.elements[8];
            }

            var index2ori = {};
            for (var serial in atomlist) {
                var atom = atoms[atomlist[serial]];

                if(atom.resn === 'DUM') continue;

                var r;
                if(rmsd_supr !== undefined && rmsd_supr.rot !== undefined) {
                    // revert to the orginal coord
                    var coord = this.transformMemPro(atom.coord, inverseRot, centerTo, centerFrom);
                    r = coord.applyMatrix4(inverseMatrix);
                }
                else {
                    r = atom.coord.clone().applyMatrix4(inverseMatrix);
                }

                for(i = Math.floor(r.x) - maxdist, il = Math.ceil(r.x) + maxdist; i <= il; ++i) {
                    if(i < 0 || i > header.xExtent*scaleFactor - 1) continue;
                    for(j = Math.floor(r.y) - maxdist, jl = Math.ceil(r.y) + maxdist; j<= jl; ++j) {
                        if(j < 0 || j > header.yExtent*scaleFactor - 1) continue;
                        for(k = Math.floor(r.z) - maxdist, kl = Math.ceil(r.z) + maxdist; k<= kl; ++k) {
                            if(k < 0 || k > header.zExtent*scaleFactor - 1) continue;
                            var index = i * widthHeight + j * height + k;
                            indexArray.push(index);
                        }
                    }
                }
            }

            for(i = 0, il = indexArray.length; i < il; ++i) {
                var index = indexArray[i];
                if(type == '2fofc') {
                    vpBits[index] = (dataArray[index] >= isovalue) ? 1 : 0;
                    //vpAtomID[index] = (dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
                else if(type == 'fofc') {
                    vpBits[index] = (dataArray[index] >= isovalue || dataArray[index] <= -isovalue) ? 1 : 0;
                    vpAtomID[index] = (dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
                else if(type == 'em') {
                    vpBits[index] = (dataArray[index] >= isovalue) ? 1 : 0;
                    //vpAtomID[index] = (dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
            }
        }

        for (i = 0, il = vpBits.length; i < il; i++)
            if (vpBits[i] & INOUT)
                vpBits[i] |= ISDONE;

    };

    this.buildboundary = function() {
        var pWH = pWidth*pHeight;
        var i, j, k;

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

        var pWH = pWidth*pHeight;
        for (var i = 0, vlen = verts.length; i < vlen; i++) {
            // positive values
            verts[i]['atomid'] = vpAtomID[verts[i].x * pWH + pHeight *
                    verts[i].y + verts[i].z];
        }

        $3Dmol.MarchingCube.laplacianSmooth(1, verts, faces);

    };
};
