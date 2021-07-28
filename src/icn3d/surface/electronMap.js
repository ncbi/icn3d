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
D. Xu, Y. Zhang(2009) Generating Triangulated Macromolecular Surthis.faces
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
class ElectronMap {
    constructor(icn3d) {
        this.icn3d = icn3d;

//$3Dmol.ElectronMap = function(threshbox) {
    //"use strict";

        // constants for vpbits bitmasks
        /** @this.*/
        this.INOUT = 1;
        /** @this.*/
        this.ISDONE = 2;
        /** @this.*/
        this.ISBOUND = 4;

        this.isovalue = 1.5;
        this.dataArray = {};
        this.matrix = undefined;
        this.center = undefined;
        this.maxdist = undefined;
        this.pmin = undefined;
        this.pmax = undefined;
        this.water = undefined;
        this.header = undefined;
        this.type = undefined;
        this.rmsd_supr = undefined;
        this.loadPhiFrom = undefined;

        this.ptranx = 0;
        this.ptrany = 0;
        this.ptranz = 0;
        this.probeRadius = 1.4;
        this.defaultScaleFactor = 2;
        this.scaleFactor = this.defaultScaleFactor; // 2 is .5A grid; if this is made user configurable,
                                // also have to adjust offset used to find non-shown
                                // atoms
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

        this.marchingCube = new MarchingCube();
    }
}

ElectronMap.prototype.getFacesAndVertices = function(allatoms, atomlist) {
    let  atomsToShow = {};
    let  i, il;
    for(i = 0, il = atomlist.length; i < il; i++)
        atomsToShow[atomlist[i]] = 1;
    let  vertices = this.verts;

    for(i = 0, il = vertices.length; i < il; i++) {
        let  r;
        if(this.type == 'phi') {
            r = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z).multiplyScalar(1.0/this.header.scale).applyMatrix4(this.matrix);
        }
        else {
            r = new THREE.Vector3(vertices[i].x, vertices[i].y, vertices[i].z).applyMatrix4(this.matrix);
        }
//            vertices[i].x = r.x / this.scaleFactor - this.ptranx;
//            vertices[i].y = r.y / this.scaleFactor - this.ptrany;
//            vertices[i].z = r.z / this.scaleFactor - this.ptranz;

        vertices[i].x = r.x;
        vertices[i].y = r.y;
        vertices[i].z = r.z;
    }

    let  finalfaces = [];

    for(i = 0, il = this.faces.length; i < il; i += 3) {
        //var f = this.faces[i];
        let  fa = this.faces[i], fb = this.faces[i+1], fc = this.faces[i+2];

        if(fa !== fb && fb !== fc && fa !== fc){
            finalfaces.push({"a":fa, "b":fb, "c":fc});
        }
    }

    //try to help the garbage collector
    this.vpBits = null; // uint8 array of bitmasks
    this.vpDistance = null; // floatarray
    this.vpAtomID = null; // intarray

    return {
        'vertices' : vertices, //shownVertices,
        'faces' : finalfaces
    };
};


ElectronMap.prototype.initparm = function(inHeader, inData, inMatrix, inIsovalue, inCenter, inMaxdist,
  inPmin, inPmax, inWater, inType, inRmsd_supr, inLoadPhiFrom, inIcn3d) {
    this.header = inHeader;
    this.loadPhiFrom = inLoadPhiFrom;
    //icn3d = inIcn3d;

    if(this.header && this.header.max !== undefined) { // EM density map from EBI
        this.isovalue = this.header.min +(this.header.max - this.header.min) * inIsovalue / 100.0;
    }
    else if(this.header && this.header.mean !== undefined) { // density map from EBI
        this.isovalue = this.header.mean + this.header.sigma * inIsovalue; // electron density map from EBI
    }
    else {
        this.isovalue = inIsovalue;
    }

    this.dataArray = inData;
    this.matrix = inMatrix;
    this.center = inCenter;
    this.maxdist = inMaxdist;
    this.pmin = inPmin;
    this.pmax = inPmax;
    this.water = inWater;
    this.type = inType;

    this.rmsd_supr = inRmsd_supr;

    this.pminx = 0; this.pmaxx = this.header.xExtent - 1;
    this.pminy = 0; this.pmaxy = this.header.yExtent - 1;
    this.pminz = 0; this.pmaxz = this.header.zExtent - 1;

    this.ptranx = -this.pminx;
    this.ptrany = -this.pminy;
    this.ptranz = -this.pminz;

    let  maxLen = this.pmaxx - this.pminx;
    if((this.pmaxy - this.pminy) > maxLen) maxLen = this.pmaxy - this.pminy;
    if((this.pmaxz - this.pminz) > maxLen) maxLen = this.pmaxz - this.pminz;

    this.scaleFactor = 1; // angstrom / grid
    let  boxLength = maxLen;

    this.pLength = Math.floor(0.5 + this.scaleFactor *(this.pmaxx - this.pminx)) + 1;
    this.pWidth = Math.floor(0.5 + this.scaleFactor *(this.pmaxy - this.pminy)) + 1;
    this.pHeight = Math.floor(0.5 + this.scaleFactor *(this.pmaxz - this.pminz)) + 1;

    //this.boundingatom();
    this.cutRadius = this.probeRadius * this.scaleFactor;

    this.vpBits = new Uint8Array(this.pLength * this.pWidth * this.pHeight);
    this.vpAtomID = new Uint8Array(this.pLength * this.pWidth * this.pHeight);
};

ElectronMap.prototype.transformMemPro = function(inCoord, rot, centerFrom, centerTo) {
    let  coord = inCoord.clone();
    coord.sub(centerFrom);

    let  x = coord.x*rot[0] + coord.y*rot[1] + coord.z*rot[2] + centerTo.x;
    let  y = coord.x*rot[3] + coord.y*rot[4] + coord.z*rot[5] + centerTo.y;
    let  z = coord.x*rot[6] + coord.y*rot[7] + coord.z*rot[8] + centerTo.z;

    coord.x = x;
    coord.y = y;
    coord.z = z;

    return coord;
};

ElectronMap.prototype.fillvoxels = function(atoms, atomlist) { //(int seqinit,int
    // seqterm,bool
    // atomthis.type,atom*
    // proseq,bool bcolor)
    let  i, j, k, il, jl, kl;
    for(i = 0, il = this.vpBits.length; i < il; i++) {
        this.vpBits[i] = 0;
        //this.vpDistance[i] = -1.0;
        this.vpAtomID[i] = 0;
    }

    let  widthHeight = this.pWidth * this.pHeight;
    let  height = this.pHeight;

    if(this.type == 'phi' && !this.header.bSurface) { // equipotential map
        // Do NOT exclude map far away from the atoms
        //var index = 0;
        for(i = 0; i < this.pLength; ++i) {
            for(j = 0; j < this.pWidth; ++j) {
                for(k = 0; k < this.pHeight; ++k) {
                    let  index = i * widthHeight + j * height + k;

                    let  index2;
                    if(this.header.filetype == 'phi') { // loop z, y, x
                        index2 = k * widthHeight + j * height + i;
                    }
                    else if(this.header.filetype == 'cube') { // loop x, y, z
                        index2 = i * widthHeight + j * height + k;
                    }

                    if(index2 < this.dataArray.length) {
                        this.vpBits[index] =(this.dataArray[index2] >= this.isovalue || this.dataArray[index2] <= -this.isovalue) ? 1 : 0;
                        this.vpAtomID[index] =(this.dataArray[index2] >= 0) ? 1 : 0; // determine whether it's positive
                    }
                    //++index;
                }
            }
        }
    }
    else {
        //var inverseMatrix = new THREE.Matrix4().getInverse(this.matrix);
        let  inverseMatrix = new THREE.Matrix4().copy( this.matrix ).invert();

        let  indexArray = [];
        this.maxdist = parseInt(this.maxdist); // has to be integer

        let  rot, inverseRot = new Array(9), centerFrom, centerTo;
        if(this.rmsd_supr !== undefined && this.rmsd_supr.rot !== undefined) {
          rot = this.rmsd_supr.rot;
          centerFrom = this.rmsd_supr.trans1;
          centerTo = this.rmsd_supr.trans2;

          let  m = new THREE.Matrix3(), inverseM = new THREE.Matrix3();
          m.set(rot[0], rot[1], rot[2], rot[3], rot[4], rot[5], rot[6], rot[7], rot[8]);
          //inverseM.getInverse(m);
          inverseM.copy(m).invert();

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

        if(this.type == 'phi' && this.header.bSurface) { // surface with potential
            // Do NOT exclude map far away from the atoms

            // generate the correctly ordered this.dataArray
            let  vData = new Float32Array(this.pLength * this.pWidth * this.pHeight);

            for(i = 0; i < this.pLength; ++i) {
                for(j = 0; j < this.pWidth; ++j) {
                    for(k = 0; k < this.pHeight; ++k) {
                        let  index = i * widthHeight + j * height + k;

                        let  index2;
                        if(this.header.filetype == 'phi') { // loop z, y, x
                            index2 = k * widthHeight + j * height + i;
                        }
                        else if(this.header.filetype == 'cube') { // loop x, y, z
                            index2 = i * widthHeight + j * height + k;
                        }

                        if(index2 < this.dataArray.length) {
                            vData[index] = this.dataArray[index2];
                        }
                    }
                }
            }

            for(let serial in atomlist) {
                let  atom = atoms[atomlist[serial]];

                if(atom.resn === 'DUM') continue;

                let  r = atom.coord.clone();
                if(this.loadPhiFrom != 'delphi') { // transform to the original position if the potential file is imported
                    if(this.rmsd_supr !== undefined && this.rmsd_supr.rot !== undefined) {
                        // revert to the orginal coord
                        let  coord = this.transformMemPro(atom.coord, inverseRot, centerTo, centerFrom);
                        r = coord.applyMatrix4(inverseMatrix);
                    }
                    else {
                        r = atom.coord.clone().applyMatrix4(inverseMatrix);
                    }
                }

                // scale to the grid
                r.sub(this.header.ori).multiplyScalar(this.header.scale);

                // determine the neighboring grid coordinate
                let  nx0 = Math.floor(r.x), nx1 = Math.ceil(r.x);
                let  ny0 = Math.floor(r.y), ny1 = Math.ceil(r.y);
                let  nz0 = Math.floor(r.z), nz1 = Math.ceil(r.z);
                if(nx1 == nx0) nx1 = nx0 + 1;
                if(ny1 == ny0) ny1 = ny0 + 1;
                if(nz1 == nz0) nz1 = nz0 + 1;

                if(nx1 > this.pLength) nx1 = this.pLength;
                if(ny1 > this.pWidth) ny1 = this.pWidth;
                if(nz1 > this.pHeight) nz1 = this.pHeight;

                //https://en.wikipedia.org/wiki/Trilinear_interpolation
                let  c000 = vData[nx0 * widthHeight + ny0 * height + nz0];
                let  c100 = vData[nx1 * widthHeight + ny0 * height + nz0];
                let  c010 = vData[nx0 * widthHeight + ny1 * height + nz0];
                let  c001 = vData[nx0 * widthHeight + ny0 * height + nz1];
                let  c110 = vData[nx1 * widthHeight + ny1 * height + nz0];
                let  c011 = vData[nx0 * widthHeight + ny1 * height + nz1];
                let  c101 = vData[nx1 * widthHeight + ny0 * height + nz1];
                let  c111 = vData[nx1 * widthHeight + ny1 * height + nz1];

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

                this.icn3d.atoms[atomlist[serial]].color = color;
                this.icn3d.atomPrevColors[atomlist[serial]] = color;
            }
        }
        else {
            let  index2ori = {};
            for(let serial in atomlist) {
                let  atom = atoms[atomlist[serial]];

                if(atom.resn === 'DUM') continue;

                let  r;
                if(this.rmsd_supr !== undefined && this.rmsd_supr.rot !== undefined) {
                    // revert to the orginal coord
                    let  coord = this.transformMemPro(atom.coord, inverseRot, centerTo, centerFrom);
                    r = coord.applyMatrix4(inverseMatrix);
                }
                else {
                    r = atom.coord.clone().applyMatrix4(inverseMatrix);
                }

                for(i = Math.floor(r.x) - this.maxdist, il = Math.ceil(r.x) + this.maxdist; i <= il; ++i) {
                    if(i < 0 || i > this.header.xExtent*this.scaleFactor - 1) continue;
                    for(j = Math.floor(r.y) - this.maxdist, jl = Math.ceil(r.y) + this.maxdist; j<= jl; ++j) {
                        if(j < 0 || j > this.header.yExtent*this.scaleFactor - 1) continue;
                        for(k = Math.floor(r.z) - this.maxdist, kl = Math.ceil(r.z) + this.maxdist; k<= kl; ++k) {
                            if(k < 0 || k > this.header.zExtent*this.scaleFactor - 1) continue;
                            let  index = i * widthHeight + j * height + k;
                            indexArray.push(index);
                        }
                    }
                }
            }

            for(i = 0, il = indexArray.length; i < il; ++i) {
                let  index = indexArray[i];
                if(this.type == '2fofc') {
                    this.vpBits[index] =(this.dataArray[index] >= this.isovalue) ? 1 : 0;
                    //this.vpAtomID[index] =(this.dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
                else if(this.type == 'fofc') {
                    this.vpBits[index] =(this.dataArray[index] >= this.isovalue || this.dataArray[index] <= -this.isovalue) ? 1 : 0;
                    this.vpAtomID[index] =(this.dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
                else if(this.type == 'em') {
                    this.vpBits[index] =(this.dataArray[index] >= this.isovalue) ? 1 : 0;
                    //this.vpAtomID[index] =(this.dataArray[index] >= 0) ? 1 : 0; // determine whether it's positive
                }
            }
        }
    }

    for(i = 0, il = this.vpBits.length; i < il; i++)
        if(this.vpBits[i] & this.INOUT)
            this.vpBits[i] |= this.ISDONE;

};

ElectronMap.prototype.buildboundary = function() {
    let  pWH = this.pWidth*this.pHeight;
    let  i, j, k;

    for(i = 0; i < this.pLength; i++) {
        for(j = 0; j < this.pHeight; j++) {
            for(k = 0; k < this.pWidth; k++) {
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

ElectronMap.prototype.marchingcubeinit = function(stype) {
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
        else {
            this.vpBits[i] &= ~this.ISBOUND;
        }
    }
};

// this code allows me to empirically prune the marching cubes code tables
// to more efficiently handle discrete data
ElectronMap.prototype.counter = function() {
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

ElectronMap.prototype.marchingcube = function(stype) {
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
        // positive values
        this.verts[i]['atomid'] = this.vpAtomID[this.verts[i].x * pWH + this.pHeight *
                this.verts[i].y + this.verts[i].z];
    }

    this.marchingCube.laplacianSmooth(1, this.verts, this.faces);

};
//};

export {ElectronMap}
