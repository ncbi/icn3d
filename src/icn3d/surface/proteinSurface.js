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
D. Xu, Y. Zhang(2009) Generating Triangulated Macromolecular Surfaces
by Euclidean Distance Transform. PLoS ONE 4(12): e8140.

=======

TODO: Improved performance on Firefox
      Reduce memory consumption
      Refactor!
 */

//import * as THREE from 'three';

import {MarchingCube} from './marchingCube.js';

// dkoes
// Surface calculations.  This must be safe to use within a web worker.
class ProteinSurface {
    constructor(icn3d, threshbox) {
        this.icn3d = icn3d;
        this.threshbox = threshbox;

    //$3Dmol.ProteinSurface = function(threshbox) {
        //"use strict";

        // for delphi
        this.dataArray = {};
        this.header;
        this.data = undefined;
        this.matrix = undefined;
        this.isovalue = undefined;
        this.loadPhiFrom = undefined;
        this.vpColor = null; // intarray
        this.vpPot = null; // floatarray

        // constants for vpbits bitmasks
        /** @this.*/
        this.INOUT = 1;
        /** @this.*/
        this.ISDONE = 2;
        /** @this.*/
        this.ISBOUND = 4;

        this.ptranx = 0;
        this.ptrany = 0;
        this.ptranz = 0;
        this.probeRadius = 1.4;
        this.defaultScaleFactor = 2;
        this.scaleFactor = this.defaultScaleFactor; // 2 is .5A grid; if this is made user configurable,
                                // also have to adjust offset used to find non-shown
                                // atoms
        this.finalScaleFactor = {};

        this.pHeight = 0;
        this.pWidth = 0;
        this.pLength = 0;
        this.cutRadius = 0;
        this.vpBits = null; // uint8 array of bitmasks
        this.vpDistance = null; // floatarray of _squared_ distances
        this.vpAtomID = null; // intarray
        this.vertnumber = 0;
        this.facenumber = 0;
        this.pminx = 0;
        this.pminy = 0;
        this.pminz = 0;
        this.pmaxx = 0;
        this.pmaxy = 0;
        this.pmaxz = 0;

        this.bCalcArea = false;
        this.atomsToShow = {};

        this.vdwRadii = {
                "H" : 1.2,
                "LI" : 1.82,
                "Na" : 2.27,
                "K" : 2.75,
                "C" : 1.7,
                "N" : 1.55,
                "O" : 1.52,
                "F" : 1.47,
                "P" : 1.80,
                "S" : 1.80,
                "CL" : 1.75,
                "BR" : 1.85,
                "SE" : 1.90,
                "ZN" : 1.39,
                "CU" : 1.4,
                "NI" : 1.63,
                "X" : 2
            };

        this.depty = {};
        this.widxz = {};
        this.faces = undefined;
        this.verts = undefined;
        this.nb = [ new Int32Array([ 1, 0, 0 ]), new Int32Array([ -1, 0, 0 ]),
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

        this.origextent = undefined;

        this.marchingCube = new MarchingCube();
    }
}

/** @param {AtomSpec} atom */
ProteinSurface.prototype.getVDWIndex = function(atom) {
    if(!atom.elem || typeof(this.vdwRadii[atom.elem.toUpperCase()]) == "undefined") {
        return "X";
    }
    return atom.elem;
};

ProteinSurface.prototype.inOrigExtent = function(x, y, z) {
    if(x < this.origextent[0][0] || x > this.origextent[1][0])
        return false;
    if(y < this.origextent[0][1] || y > this.origextent[1][1])
        return false;
    if(z < this.origextent[0][2] || z > this.origextent[1][2])
        return false;
    return true;
};

ProteinSurface.prototype.getFacesAndVertices = function() {
    let  i, il;
    let  vertices = this.verts;
    for(i = 0, il = vertices.length; i < il; i++) {
        vertices[i].x = vertices[i].x / this.scaleFactor - this.ptranx;
        vertices[i].y = vertices[i].y / this.scaleFactor - this.ptrany;
        vertices[i].z = vertices[i].z / this.scaleFactor - this.ptranz;
    }

    let  finalfaces = [];
    for(i = 0, il = this.faces.length; i < il; i += 3) {
        //var f = faces[i];
        let  fa = this.faces[i], fb = this.faces[i+1], fc = this.faces[i+2];
        let  a = vertices[fa]['atomid'], b = vertices[fb]['atomid'], c = vertices[fc]['atomid'];

        // must be a unique face for each atom
        if(!this.atomsToShow[a] || !this.atomsToShow[b] || !this.atomsToShow[c]) {
            continue;
        }

        if(fa !== fb && fb !== fc && fa !== fc){
            // !!! different between 3Dmol and iCn3D
            finalfaces.push({"a":fa, "b":fb, "c":fc});
        }

    }

    //try to help the garbage collector
    this.vpBits = null; // uint8 array of bitmasks
    this.vpDistance = null; // floatarray
    this.vpAtomID = null; // intarray

    this.vpColor = null; // intarray
    this.vpPot = null; // floatarray

    return {
        'vertices' : vertices,
        'faces' : finalfaces
    };
};


ProteinSurface.prototype.initparm = function(extent, btype, in_bCalcArea, atomlist
  , inHeader, inData, inMatrix, inIsovalue, inLoadPhiFrom) {
    // for delphi
    this.header = inHeader;
    this.dataArray = inData;
    this.matrix = inMatrix;
    this.isovalue = inIsovalue;
    this.loadPhiFrom = inLoadPhiFrom;

    this.bCalcArea = in_bCalcArea;

    for(let i = 0, il = atomlist.length; i < il; i++)
        this.atomsToShow[atomlist[i]] = 1;

    // !!! different between 3Dmol and iCn3D
    //if(volume > 1000000) //heuristical decrease resolution to avoid large memory consumption
    //    this.scaleFactor = this.defaultScaleFactor/2;

    let  margin =(1 / this.scaleFactor) * 5.5; // need margin to avoid
                                            // boundary/round off effects
    this.origextent = extent;
    this.pminx = extent[0][0]; this.pmaxx = extent[1][0];
    this.pminy = extent[0][1]; this.pmaxy = extent[1][1];
    this.pminz = extent[0][2]; this.pmaxz = extent[1][2];

    if(!btype) {
        this.pminx -= margin;
        this.pminy -= margin;
        this.pminz -= margin;
        this.pmaxx += margin;
        this.pmaxy += margin;
        this.pmaxz += margin;
    } else {
        this.pminx -= this.probeRadius + margin;
        this.pminy -= this.probeRadius + margin;
        this.pminz -= this.probeRadius + margin;
        this.pmaxx += this.probeRadius + margin;
        this.pmaxy += this.probeRadius + margin;
        this.pmaxz += this.probeRadius + margin;
    }

    this.pminx = Math.floor(this.pminx * this.scaleFactor) / this.scaleFactor;
    this.pminy = Math.floor(this.pminy * this.scaleFactor) / this.scaleFactor;
    this.pminz = Math.floor(this.pminz * this.scaleFactor) / this.scaleFactor;
    this.pmaxx = Math.ceil(this.pmaxx * this.scaleFactor) / this.scaleFactor;
    this.pmaxy = Math.ceil(this.pmaxy * this.scaleFactor) / this.scaleFactor;
    this.pmaxz = Math.ceil(this.pmaxz * this.scaleFactor) / this.scaleFactor;

    this.ptranx = -this.pminx;
    this.ptrany = -this.pminy;
    this.ptranz = -this.pminz;

    // !!! different between 3Dmol and iCn3D
    // copied from surface.js from iview
    let  boxLength = 129;
    //maxLen = this.pmaxx - this.pminx + 2*(this.probeRadius + 5.5/2)
    let  maxLen = this.pmaxx - this.pminx;
    if((this.pmaxy - this.pminy) > maxLen) maxLen = this.pmaxy - this.pminy;
    if((this.pmaxz - this.pminz) > maxLen) maxLen = this.pmaxz - this.pminz;
    this.scaleFactor =(boxLength - 1.0) / maxLen;

    // 1. typically(size < 90) use the default scale factor 2
    this.scaleFactor = this.defaultScaleFactor;

    // 2. If size > 90, change scale
    //var threshbox = 180; // maximum possible boxsize
    if(this.bCalcArea || this.defaultScaleFactor * maxLen > this.threshbox) {
        boxLength = Math.floor(this.threshbox);
        this.scaleFactor =(this.threshbox - 1.0) / maxLen;
    }
    // end of surface.js part

    this.pLength = Math.ceil(this.scaleFactor *(this.pmaxx - this.pminx)) + 1;
    this.pWidth = Math.ceil(this.scaleFactor *(this.pmaxy - this.pminy)) + 1;
    this.pHeight = Math.ceil(this.scaleFactor *(this.pmaxz - this.pminz)) + 1;

    this.finalScaleFactor.x =(this.pLength - 1.0) /(this.pmaxx - this.pminx);
    this.finalScaleFactor.y =(this.pWidth - 1.0) /(this.pmaxy - this.pminy);
    this.finalScaleFactor.z =(this.pHeight - 1.0) /(this.pmaxz - this.pminz);

    this.boundingatom(btype);
    this.cutRadius = this.probeRadius * this.scaleFactor;

    this.vpBits = new Uint8Array(this.pLength * this.pWidth * this.pHeight);
    this.vpDistance = new Float64Array(this.pLength * this.pWidth * this.pHeight); // float 32
    this.vpAtomID = new Int32Array(this.pLength * this.pWidth * this.pHeight);

    this.vpColor = [];
    this.vpPot = [];
};

ProteinSurface.prototype.boundingatom = function(btype) {
    let  tradius = [];
    let  txz, tdept, sradius, indx;
    //flagradius = btype;

    for(let i in this.vdwRadii) {
        if(!this.vdwRadii.hasOwnProperty(i))
            continue;
        let  r = this.vdwRadii[i];
        if(!btype)
            tradius[i] = r * this.scaleFactor + 0.5;
        else
            tradius[i] =(r + this.probeRadius) * this.scaleFactor + 0.5;

        sradius = tradius[i] * tradius[i];
        this.widxz[i] = Math.floor(tradius[i]) + 1;
        this.depty[i] = new Int32Array(this.widxz[i] * this.widxz[i]);
        indx = 0;
        for(let j = 0; j < this.widxz[i]; j++) {
            for(let k = 0; k < this.widxz[i]; k++) {
                txz = j * j + k * k;
                if(txz > sradius)
                    this.depty[i][indx] = -1; // outside
                else {
                    tdept = Math.sqrt(sradius - txz);
                    this.depty[i][indx] = Math.floor(tdept);
                }
                indx++;
            }
        }
    }
};

ProteinSurface.prototype.fillvoxels = function(atoms, atomlist) { //(int seqinit,int
    // seqterm,bool
    // atomtype,atom*
    // proseq,bool bcolor)
    let  i, j, k, il;
    for(i = 0, il = this.vpBits.length; i < il; i++) {
        this.vpBits[i] = 0;
        this.vpDistance[i] = -1.0;
        this.vpAtomID[i] = -1;

        this.vpColor[i] = new THREE.Color();
        this.vpPot[i] = 0;
    }

    for(i in atomlist) {
        let  atom = atoms[atomlist[i]];
        if(atom === undefined || atom.resn === 'DUM')
            continue;
        this.fillAtom(atom, atoms);
    }

    // show delphi potential on surface
    if(this.dataArray) {
        let  pminx2 = 0, pmaxx2 = this.header.xExtent - 1;
        let  pminy2 = 0, pmaxy2 = this.header.yExtent - 1;
        let  pminz2 = 0, pmaxz2 = this.header.zExtent - 1;

        let  scaleFactor2 = 1; // angstrom / grid

        let  pLength2 = Math.floor(0.5 + scaleFactor2 *(pmaxx2 - pminx2)) + 1;
        let  pWidth2 = Math.floor(0.5 + scaleFactor2 *(pmaxy2 - pminy2)) + 1;
        let  pHeight2 = Math.floor(0.5 + scaleFactor2 *(pmaxz2 - pminz2)) + 1;

        // fill the color
        let  widthHeight2 = pWidth2 * pHeight2;
        let  height2 = pHeight2;

        // generate the correctly ordered this.dataArray
        let  vData = new Float32Array(pLength2 * pWidth2 * pHeight2);

        // loop through the delphi box
        for(i = 0; i < pLength2; ++i) {
            for(j = 0; j < pWidth2; ++j) {
                for(k = 0; k < pHeight2; ++k) {
                    let  index = i * widthHeight2 + j * height2 + k;

                    let  index2;
                    if(this.header.filetype == 'phi') { // loop z, y, x
                        index2 = k * widthHeight2 + j * height2 + i;
                    }
                    else if(this.header.filetype == 'cube') { // loop x, y, z
                        index2 = i * widthHeight2 + j * height2 + k;
                    }

                    if(index2 < this.dataArray.length) {
                        vData[index] = this.dataArray[index2];
                    }
                }
            }
        }

        let  widthHeight = this.pWidth * this.pHeight;
        let  height = this.pHeight;

        // loop through the surface box
        for(i = 0; i < this.pLength; ++i) {
            for(j = 0; j < this.pWidth; ++j) {
                for(k = 0; k < this.pHeight; ++k) {
                    let  x = i / this.finalScaleFactor.x - this.ptranx;
                    let  y = j / this.finalScaleFactor.y - this.ptrany;
                    let  z = k / this.finalScaleFactor.z - this.ptranz;

                    let  r = new THREE.Vector3(x, y, z);

                    // scale to the grid
                    r.sub(this.header.ori).multiplyScalar(this.header.scale);

                    // determine the neighboring grid coordinate
                    let  nx0 = Math.floor(r.x), nx1 = Math.ceil(r.x);
                    let  ny0 = Math.floor(r.y), ny1 = Math.ceil(r.y);
                    let  nz0 = Math.floor(r.z), nz1 = Math.ceil(r.z);
                    if(nx1 == nx0) nx1 = nx0 + 1;
                    if(ny1 == ny0) ny1 = ny0 + 1;
                    if(nz1 == nz0) nz1 = nz0 + 1;

                    if(nx1 > pLength2) nx1 = pLength2;
                    if(ny1 > pWidth2) ny1 = pWidth2;
                    if(nz1 > pHeight2) nz1 = pHeight2;

                    //https://en.wikipedia.org/wiki/Trilinear_interpolation
                    let  c000 = vData[nx0 * widthHeight2 + ny0 * height2 + nz0];
                    let  c100 = vData[nx1 * widthHeight2 + ny0 * height2 + nz0];
                    let  c010 = vData[nx0 * widthHeight2 + ny1 * height2 + nz0];
                    let  c001 = vData[nx0 * widthHeight2 + ny0 * height2 + nz1];
                    let  c110 = vData[nx1 * widthHeight2 + ny1 * height2 + nz0];
                    let  c011 = vData[nx0 * widthHeight2 + ny1 * height2 + nz1];
                    let  c101 = vData[nx1 * widthHeight2 + ny0 * height2 + nz1];
                    let  c111 = vData[nx1 * widthHeight2 + ny1 * height2 + nz1];

                    let  xd = r.x - nx0;
                    let  yd = r.y - ny0;
                    let  zd = r.z - nz0;

                    let  c00 = c000 *(1 - xd) + c100 * xd;
                    let  c01 = c001 *(1 - xd) + c101 * xd;
                    let  c10 = c010 *(1 - xd) + c110 * xd;
                    let  c11 = c011 *(1 - xd) + c111 * xd;

                    let  c0 = c00 *(1 - yd) + c10 * yd;
                    let  c1 = c01 *(1 - yd) + c11 * yd;

                    let  c = c0 *(1 - zd) + c1 * zd;

                    let  index = i * widthHeight + j * height + k;

                    this.vpPot[index] = c;

                    // determine the color based on the potential value
                    if(c > this.isovalue) c = this.isovalue;
                    if(c < -this.isovalue) c = -this.isovalue;

                    let  color;
                    if(c > 0) {
                        c /= 1.0 * this.isovalue;
                        color = new THREE.Color(1-c, 1-c, 1);
                    }
                    else {
                        c /= -1.0 * this.isovalue;
                        color = new THREE.Color(1, 1-c, 1-c);
                    }

                    this.vpColor[index] = color;
                } // for k
            } // for j
        } // for i
    }

    for(i = 0, il = this.vpBits.length; i < il; i++)
        if(this.vpBits[i] & this.INOUT)
            this.vpBits[i] |= this.ISDONE;

};


ProteinSurface.prototype.fillAtom = function(atom, atoms) {
    let  cx, cy, cz, ox, oy, oz, mi, mj, mk, i, j, k, si, sj, sk;
    let  ii, jj, kk, n;

    // !!! different between 3Dmol and iCn3D
    cx = Math.floor(0.5 + this.scaleFactor *(atom.coord.x + this.ptranx));
    cy = Math.floor(0.5 + this.scaleFactor *(atom.coord.y + this.ptrany));
    cz = Math.floor(0.5 + this.scaleFactor *(atom.coord.z + this.ptranz));

    let  at = this.getVDWIndex(atom);
    let  nind = 0;
    let  cnt = 0;
    let  pWH = this.pWidth*this.pHeight;

    for(i = 0, n = this.widxz[at]; i < n; i++) {
        for(j = 0; j < n; j++) {
            if(this.depty[at][nind] != -1) {
                for(ii = -1; ii < 2; ii++) {
    for(jj = -1; jj < 2; jj++) {
        for(kk = -1; kk < 2; kk++) {
            if(ii !== 0 && jj !== 0 && kk !== 0) {
                mi = ii * i;
                mk = kk * j;
                for(k = 0; k <= this.depty[at][nind]; k++) {
                    mj = k * jj;
                    si = cx + mi;
                    sj = cy + mj;
                    sk = cz + mk;
                    if(si < 0 || sj < 0 ||
                            sk < 0 ||
                            si >= this.pLength ||
                            sj >= this.pWidth ||
                            sk >= this.pHeight)
                        continue;
                    let  index = si * pWH + sj * this.pHeight + sk;

                    if(!(this.vpBits[index] & this.INOUT)) {
                        this.vpBits[index] |= this.INOUT;
                        this.vpAtomID[index] = atom.serial;
                    } else {
                        let  atom2 = atoms[this.vpAtomID[index]];
                        if(atom2.serial != atom.serial) {
                            ox = cx + mi - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.x + this.ptranx));
                            oy = cy + mj - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.y + this.ptrany));
                            oz = cz + mk - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.z + this.ptranz));
                            if(mi * mi + mj * mj + mk * mk < ox *
                                    ox + oy * oy + oz * oz)
                                this.vpAtomID[index] = atom.serial;
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

ProteinSurface.prototype.fillvoxelswaals = function(atoms, atomlist) {
    let  i, il;
    for(i = 0, il = this.vpBits.length; i < il; i++)
        this.vpBits[i] &= ~this.ISDONE; // not isdone

    for(i in atomlist) {
        let  atom = atoms[atomlist[i]];
        if(atom === undefined)
            continue;

        this.fillAtomWaals(atom, atoms);
    }
};

ProteinSurface.prototype.fillAtomWaals = function(atom, atoms) {
    let  cx, cy, cz, ox, oy, oz, nind = 0;
    let  mi, mj, mk, si, sj, sk, i, j, k, ii, jj, kk, n;

    // !!! different between 3Dmol and iCn3D
    cx = Math.floor(0.5 + this.scaleFactor *(atom.coord.x + this.ptranx));
    cy = Math.floor(0.5 + this.scaleFactor *(atom.coord.y + this.ptrany));
    cz = Math.floor(0.5 + this.scaleFactor *(atom.coord.z + this.ptranz));

    let  at = this.getVDWIndex(atom);
    let  pWH = this.pWidth*this.pHeight;
    for(i = 0, n = this.widxz[at]; i < n; i++) {
        for(j = 0; j < n; j++) {
            if(this.depty[at][nind] != -1) {
                for(ii = -1; ii < 2; ii++) {
    for(jj = -1; jj < 2; jj++) {
        for(kk = -1; kk < 2; kk++) {
            if(ii !== 0 && jj !== 0 && kk !== 0) {
                mi = ii * i;
                mk = kk * j;
                for(k = 0; k <= this.depty[at][nind]; k++) {
                    mj = k * jj;
                    si = cx + mi;
                    sj = cy + mj;
                    sk = cz + mk;
                    if(si < 0 || sj < 0 ||
                            sk < 0 ||
                            si >= this.pLength ||
                            sj >= this.pWidth ||
                            sk >= this.pHeight)
                        continue;
                    let  index = si * pWH + sj * this.pHeight + sk;
                    if(!(this.vpBits[index] & this.ISDONE)) {
                        this.vpBits[index] |= this.ISDONE;
                        this.vpAtomID[index] = atom.serial;
                    }  else {
                        let  atom2 = atoms[this.vpAtomID[index]];
                        if(atom2.serial != atom.serial) {
                            ox = cx + mi - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.x + this.ptranx));
                            oy = cy + mj - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.y + this.ptrany));
                            oz = cz + mk - Math.floor(0.5 + this.scaleFactor *
                                   (atom2.z + this.ptranz));
                            if(mi * mi + mj * mj + mk * mk < ox *
                                    ox + oy * oy + oz * oz)
                                this.vpAtomID[index] = atom.serial;
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

ProteinSurface.prototype.buildboundary = function() {
    let  pWH = this.pWidth*this.pHeight;
    for(let i = 0; i < this.pLength; i++) {
        for(let j = 0; j < this.pHeight; j++) {
            for(let k = 0; k < this.pWidth; k++) {
                let  index = i * pWH + k * this.pHeight + j;
                if(this.vpBits[index] & this.INOUT) {
                    let  flagbound = false;
                    let  ii = 0;
                    while(ii < 26) {
                        let  ti = i + this.nb[ii][0], tj = j + this.nb[ii][2], tk = k +
                                this.nb[ii][1];
                        if(ti > -1 &&
                            ti < this.pLength &&
                            tk > -1 &&
                            tk < this.pWidth &&
                            tj > -1 &&
                            tj < this.pHeight &&
                            !(this.vpBits[ti * pWH + tk * this.pHeight + tj] & this.INOUT)) {
                            this.vpBits[index] |= this.ISBOUND;
                            break;
                        } else
                            ii++;
                    }
                }
            }
        }
    }
};

ProteinSurface.prototype.fastdistancemap = function() {
    let  eliminate = 0;
    let  certificate;
    let  i, j, k, n;

    // a little class for 3d array, should really generalize this and
    // use throughout...
    let  PointGrid = function(length, width, height) {
        // the standard says this is zero initialized
        let  data = new Int32Array(length * width * height * 3);

        // set position x,y,z to pt, which has ix,iy,and iz
        this.set = function(x, y, z, pt) {
            let  index =((((x * width) + y) * height) + z) * 3;
            data[index] = pt.ix;
            data[index + 1] = pt.iy;
            data[index + 2] = pt.iz;
        };

        // return point at x,y,z
        this.get = function(x, y, z) {
            let  index =((((x * width) + y) * height) + z) * 3;
            return {
                ix : data[index],
                iy : data[index + 1],
                iz : data[index + 2]
            };
        };
    };

    let  boundPoint = new PointGrid(this.pLength, this.pWidth, this.pHeight);
    let  pWH = this.pWidth*this.pHeight;
    let  cutRSq = this.cutRadius*this.cutRadius;

    let  inarray = [];
    let  outarray = [];

    let  index;

    for(i = 0; i < this.pLength; i++) {
        for(j = 0; j < this.pWidth; j++) {
            for(k = 0; k < this.pHeight; k++) {
                index = i * pWH + j * this.pHeight + k;
                this.vpBits[index] &= ~this.ISDONE; // isdone = false
                if(this.vpBits[index] & this.INOUT) {
                    if(this.vpBits[index] & this.ISBOUND) {
                        let  triple = {
                            ix : i,
                            iy : j,
                            iz : k
                        };
                        boundPoint.set(i, j, k, triple);
                        inarray.push(triple);
                        this.vpDistance[index] = 0;
                        this.vpBits[index] |= this.ISDONE;
                        this.vpBits[index] &= ~this.ISBOUND;
                    }
                }
            }
        }
    }

    do {
        outarray = this.fastoneshell(inarray, boundPoint);
        inarray = [];
        for(i = 0, n = outarray.length; i < n; i++) {
            index = pWH * outarray[i].ix + this.pHeight *
                outarray[i].iy + outarray[i].iz;
            this.vpBits[index] &= ~this.ISBOUND;
            if(this.vpDistance[index] <= 1.0404 * cutRSq) {
                inarray.push({
                    ix : outarray[i].ix,
                    iy : outarray[i].iy,
                    iz : outarray[i].iz
                });
            }
        }
    } while(inarray.length !== 0);

    inarray = [];
    outarray = [];
    boundPoint = null;

    let  cutsf = this.scaleFactor - 0.5;
    if(cutsf < 0)
        cutsf = 0;
    let  cutoff = cutRSq - 0.50 /(0.1 + cutsf);
    for(i = 0; i < this.pLength; i++) {
        for(j = 0; j < this.pWidth; j++) {
            for(k = 0; k < this.pHeight; k++) {
                index = i * pWH + j * this.pHeight + k;
                this.vpBits[index] &= ~this.ISBOUND;
                // ses solid
                if(this.vpBits[index] & this.INOUT) {
                    if(!(this.vpBits[index] & this.ISDONE) ||
                           ((this.vpBits[index] & this.ISDONE) && this.vpDistance[index] >= cutoff)) {
                        this.vpBits[index] |= this.ISBOUND;
                    }
                }
            }
        }
    }

};

ProteinSurface.prototype.fastoneshell = function(inarray, boundPoint) { //(int* innum,int
    // *allocout,voxel2
    // ***boundPoint, int*
    // outnum, int *elimi)
    let  tx, ty, tz;
    let  dx, dy, dz;
    let  i, j, n;
    let  square;
    let  bp, index;
    let  outarray = [];
    if(inarray.length === 0)
        return outarray;

    let  tnv = {
        ix : -1,
        iy : -1,
        iz : -1
    };
    let  pWH = this.pWidth*this.pHeight;
    for( i = 0, n = inarray.length; i < n; i++) {
        tx = inarray[i].ix;
        ty = inarray[i].iy;
        tz = inarray[i].iz;
        bp = boundPoint.get(tx, ty, tz);

        for(j = 0; j < 6; j++) {
            tnv.ix = tx + this.nb[j][0];
            tnv.iy = ty + this.nb[j][1];
            tnv.iz = tz + this.nb[j][2];

            if(tnv.ix < this.pLength && tnv.ix > -1 && tnv.iy < this.pWidth &&
                    tnv.iy > -1 && tnv.iz < this.pHeight && tnv.iz > -1) {
                index = tnv.ix * pWH + this.pHeight * tnv.iy + tnv.iz;

                if((this.vpBits[index] & this.INOUT) && !(this.vpBits[index] & this.ISDONE)) {

                    boundPoint.set(tnv.ix, tnv.iy, tz + this.nb[j][2], bp);
                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    this.vpDistance[index] = square;
                    this.vpBits[index] |= this.ISDONE;
                    this.vpBits[index] |= this.ISBOUND;

                    outarray.push({
                        ix : tnv.ix,
                        iy : tnv.iy,
                        iz : tnv.iz
                    });
                } else if((this.vpBits[index] & this.INOUT) &&(this.vpBits[index] & this.ISDONE)) {

                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    if(square < this.vpDistance[index]) {
                        boundPoint.set(tnv.ix, tnv.iy, tnv.iz, bp);

                        this.vpDistance[index] = square;
                        if(!(this.vpBits[index] & this.ISBOUND)) {
                            this.vpBits[index] |= this.ISBOUND;
                            outarray.push({
                                ix : tnv.ix,
                                iy : tnv.iy,
                                iz : tnv.iz
                            });
                        }
                    }
                }
            }
        }
    }

    for(i = 0, n = inarray.length; i < n; i++) {
        tx = inarray[i].ix;
        ty = inarray[i].iy;
        tz = inarray[i].iz;
        bp = boundPoint.get(tx, ty, tz);

        for(j = 6; j < 18; j++) {
            tnv.ix = tx + this.nb[j][0];
            tnv.iy = ty + this.nb[j][1];
            tnv.iz = tz + this.nb[j][2];

            if(tnv.ix < this.pLength && tnv.ix > -1 && tnv.iy < this.pWidth &&
                    tnv.iy > -1 && tnv.iz < this.pHeight && tnv.iz > -1) {
                index = tnv.ix * pWH + this.pHeight * tnv.iy + tnv.iz;

                if((this.vpBits[index] & this.INOUT) && !(this.vpBits[index] & this.ISDONE)) {
                    boundPoint.set(tnv.ix, tnv.iy, tz + this.nb[j][2], bp);

                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    this.vpDistance[index] = square;
                    this.vpBits[index] |= this.ISDONE;
                    this.vpBits[index] |= this.ISBOUND;

                    outarray.push({
                        ix : tnv.ix,
                        iy : tnv.iy,
                        iz : tnv.iz
                    });
                } else if((this.vpBits[index] & this.INOUT) &&(this.vpBits[index] & this.ISDONE)) {
                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    if(square < this.vpDistance[index]) {
                        boundPoint.set(tnv.ix, tnv.iy, tnv.iz, bp);
                        this.vpDistance[index] = square;
                        if(!(this.vpBits[index] & this.ISBOUND)) {
                            this.vpBits[index] |= this.ISBOUND;
                            outarray.push({
                                ix : tnv.ix,
                                iy : tnv.iy,
                                iz : tnv.iz
                            });
                        }
                    }
                }
            }
        }
    }

    for(i = 0, n = inarray.length; i < n; i++) {
        tx = inarray[i].ix;
        ty = inarray[i].iy;
        tz = inarray[i].iz;
        bp = boundPoint.get(tx, ty, tz);

        for(j = 18; j < 26; j++) {
            tnv.ix = tx + this.nb[j][0];
            tnv.iy = ty + this.nb[j][1];
            tnv.iz = tz + this.nb[j][2];

            if(tnv.ix < this.pLength && tnv.ix > -1 && tnv.iy < this.pWidth &&
                    tnv.iy > -1 && tnv.iz < this.pHeight && tnv.iz > -1) {
                index = tnv.ix * pWH + this.pHeight * tnv.iy + tnv.iz;

                if((this.vpBits[index] & this.INOUT) && !(this.vpBits[index] & this.ISDONE)) {
                    boundPoint.set(tnv.ix, tnv.iy, tz + this.nb[j][2], bp);

                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    this.vpDistance[index] = square;
                    this.vpBits[index] |= this.ISDONE;
                    this.vpBits[index] |= this.ISBOUND;

                    outarray.push({
                        ix : tnv.ix,
                        iy : tnv.iy,
                        iz : tnv.iz
                    });
                } else if((this.vpBits[index] & this.INOUT)  &&(this.vpBits[index] & this.ISDONE)) {
                    dx = tnv.ix - bp.ix;
                    dy = tnv.iy - bp.iy;
                    dz = tnv.iz - bp.iz;
                    square = dx * dx + dy * dy + dz * dz;
                    if(square < this.vpDistance[index]) {
                        boundPoint.set(tnv.ix, tnv.iy, tnv.iz, bp);

                        this.vpDistance[index] = square;
                        if(!(this.vpBits[index] & this.ISBOUND)) {
                            this.vpBits[index] |= this.ISBOUND;
                            outarray.push({
                                ix : tnv.ix,
                                iy : tnv.iy,
                                iz : tnv.iz
                            });
                        }
                    }
                }
            }
        }
    }

    return outarray;
};

ProteinSurface.prototype.marchingcubeinit = function(stype) {
    for( let  i = 0, lim = this.vpBits.length; i < lim; i++) {
        if(stype == 1) {// vdw
            this.vpBits[i] &= ~this.ISBOUND;
        } else if(stype == 4) { // ses
            this.vpBits[i] &= ~this.ISDONE;
            if(this.vpBits[i] & this.ISBOUND)
                this.vpBits[i] |= this.ISDONE;
            this.vpBits[i] &= ~this.ISBOUND;
        } else if(stype == 2) {// after vdw
            if((this.vpBits[i] & this.ISBOUND) &&(this.vpBits[i] & this.ISDONE))
                this.vpBits[i] &= ~this.ISBOUND;
            else if((this.vpBits[i] & this.ISBOUND) && !(this.vpBits[i] & this.ISDONE))
                this.vpBits[i] |= this.ISDONE;
        } else if(stype == 3) { // sas
            this.vpBits[i] &= ~this.ISBOUND;
        }
    }
};

// this code allows me to empirically prune the marching cubes code tables
// to more efficiently handle discrete data
ProteinSurface.prototype.counter = function() {
    let  data = Array(256);
    for( let  i = 0; i < 256; i++)
        data[i] = [];

    this.incrementUsed = function(i, j) {
        if(typeof data[i][j] === 'undefined')
            data[i][j] = {
                used : 0,
                unused : 0
            };
        data[i][j].used++;
    };

    this.incrementUnused = function(i, j) {
        if(typeof data[i][j] === 'undefined')
            data[i][j] = {
                used : 0,
                unused : 0
            };
        data[i][j].unused++;

    };

    let  redoTable = function(triTable) {
        let  str = "[";
        for( let  i = 0; i < triTable.length; i++) {
            let  code = 0;
            let  table = triTable[i];
            for( let  j = 0; j < table.length; j++) {
                code |=(1 <<(table[j]));
            }
            str += "0x" + code.toString(16) + ", ";
        }
        str += "]";
    };

    this.print = function() {

        let  table = this.marchingCube.triTable;
        let  str;
        let  newtable = [];
        for( let  i = 0; i < table.length; i++) {
            let  newarr = [];
            for( let  j = 0; j < table[i].length; j += 3) {
                let  k = j / 3;
                if(typeof data[i][k] === 'undefined' || !data[i][k].unused) {
                    newarr.push(table[i][j]);
                    newarr.push(table[i][j + 1]);
                    newarr.push(table[i][j + 2]);
                }
                if(typeof data[i][k] === 'undefined')
                    console.log("undef " + i + "," + k);
            }
            newtable.push(newarr);
        }
        redoTable(newtable);
    };
};

ProteinSurface.prototype.marchingcube = function(stype) {
    this.marchingcubeinit(stype);
    this.verts = []; this.faces = [];
    this.marchingCube.march(this.vpBits, this.verts, this.faces, {
        smooth : 1,
        nX : this.pLength,
        nY : this.pWidth,
        nZ : this.pHeight
    });

    let  pWH = this.pWidth*this.pHeight;
    for(let i = 0, vlen = this.verts.length; i < vlen; i++) {
        this.verts[i]['atomid'] = this.vpAtomID[this.verts[i].x * pWH + this.pHeight *
                this.verts[i].y + this.verts[i].z];
        if(this.dataArray) this.verts[i]['color'] = this.vpColor[this.verts[i].x * pWH + this.pHeight *
                this.verts[i].y + this.verts[i].z];
        if(this.dataArray) this.verts[i]['pot'] = this.vpPot[this.verts[i].x * pWH + this.pHeight *
                this.verts[i].y + this.verts[i].z];
    }

    // calculate surface area
    let  serial2area, maxScaleFactor, area = 0;
    if(this.bCalcArea) {
        let  faceHash = {};
        serial2area = {};
        for(let i = 0, il = this.faces.length; i < il; i += 3) {
            let  fa = this.faces[i], fb = this.faces[i+1], fc = this.faces[i+2];

            if(fa == fb || fb == fc || fa == fc) continue;

            let  fmin = Math.min(fa, fb, fc);
            let  fmax = Math.max(fa, fb, fc);
            let  fmid = fa + fb + fc - fmin - fmax;
            let  fmin_fmid_fmax = fmin + '_' + fmid + '_' + fmax;

            if(faceHash.hasOwnProperty(fmin_fmid_fmax)) {
                continue;
            }

            faceHash[fmin_fmid_fmax] = 1;

            let  ai = this.verts[fa]['atomid'], bi = this.verts[fb]['atomid'], ci = this.verts[fc]['atomid'];

            if(!this.atomsToShow[ai] || !this.atomsToShow[bi] || !this.atomsToShow[ci]) {
                continue;
            }

            //if(fa !== fb && fb !== fc && fa !== fc){
                let  a = this.verts[fa];
                let  b = this.verts[fb];
                let  c = this.verts[fc];

                let  ab2 =(a.x - b.x) *(a.x - b.x) +(a.y - b.y) *(a.y - b.y) +(a.z - b.z) *(a.z - b.z);
                let  ac2 =(a.x - c.x) *(a.x - c.x) +(a.y - c.y) *(a.y - c.y) +(a.z - c.z) *(a.z - c.z);
                let  cb2 =(c.x - b.x) *(c.x - b.x) +(c.y - b.y) *(c.y - b.y) +(c.z - b.z) *(c.z - b.z);

                let  min = Math.min(ab2, ac2, cb2);
                let  max = Math.max(ab2, ac2, cb2);
                let  mid = ab2 + ac2 + cb2 - min - max;

                // there are only three kinds of triangles as shown at
                // https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0008140
                // case 1: 1, 1, sqrt(2)     area: 0.5 * a * a;
                // case 2: sqrt(2), sqrt(2), sqrt(2)    area: 0.5 * a * a * sqrt(3) * 0.5;
                // case 3: 1, sqrt(2), sqrt(3)      area: 0.5 * a * b
                let  currArea = 0;
                if(parseInt((max - min)*100) == 0) { // case 2
                    currArea = 0.433 * min;
                }
                else if(parseInt((mid - min)*100) == 0) { // case 1
                    currArea = 0.5 * min;
                }
                else { // case 3
                    currArea = 0.707 * min;
                }

                let  partArea = currArea / 3;

                if(serial2area[ai] === undefined) serial2area[ai] = partArea;
                else serial2area[ai] += partArea;

                if(serial2area[bi] === undefined) serial2area[bi] = partArea;
                else serial2area[bi] += partArea;

                if(serial2area[ci] === undefined) serial2area[ci] = partArea;
                else serial2area[ci] += partArea;

                area += currArea;
            //}
        } // for loop

        maxScaleFactor = Math.max(this.finalScaleFactor.x, this.finalScaleFactor.y, this.finalScaleFactor.z);
        area = area / maxScaleFactor / maxScaleFactor;
        //area = area / this.scaleFactor / this.scaleFactor;
    }

    if(!this.bCalcArea) this.marchingCube.laplacianSmooth(1, this.verts, this.faces);

    return {"area": area, "serial2area": serial2area, "scaleFactor": maxScaleFactor};
};


//};

export {ProteinSurface}
