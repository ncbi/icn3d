/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Contact} from '../interaction/contact.js';

import {ProteinSurface} from './proteinSurface.js';
import {ElectronMap} from './electronMap.js';

class Surface {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create surface for "atoms". "type" can be 1 (Van der Waals surface), 2 (molecular surface),
    //and 3 (solvent accessible surface). "wireframe" is a boolean to determine whether to show
    //the surface as a mesh. "opacity" is a value between 0 and 1. "1" means not transparent at all.
    //"0" means 100% transparent.
    createSurfaceRepresentation(atoms, type, wireframe, opacity) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var thisClass = this;

        if(Object.keys(atoms).length == 0) return;

        if(opacity == undefined) opacity = 1.0;

        ic.opacity = opacity;

        var geo;

        var extent = ic.contactCls.getExtent(atoms);

        // surface from 3Dmol
        var distance = 5; // consider atom 5 angstrom from the selected atoms

        var extendedAtoms = [];

        if(ic.bConsiderNeighbors) {
            var unionAtoms;
            unionAtoms = me.hashUtilsCls.unionHash(unionAtoms, atoms)
            unionAtoms = me.hashUtilsCls.unionHash(unionAtoms, ic.contactCls.getAtomsWithinAtom(ic.atoms, atoms, distance))

            extendedAtoms = Object.keys(unionAtoms);
        }
        else {
            extendedAtoms = Object.keys(atoms);
        }

        //var sigma2fofc = 1.5;
        //var sigmafofc = 3.0;
        var maxdist = 1; // maximum distance to show electron density map, set it between 1 AND 2

        var bTransparent = (parseInt(10*opacity) != 10 && !wireframe && !(ic.bInstanced && Object.keys(ic.atoms).length * ic.biomtMatrices.length > ic.maxatomcnt) ) ? true : false;

        var ps;

        var cfg = {
                allatoms: ic.atoms,
                atomsToShow: Object.keys(atoms),
                extendedAtoms: extendedAtoms,
                water: ic.water,
                //header: ic.mapData.header2,
                //data: ic.mapData.data2,
                //matrix: ic.mapData.matrix2,
                //isovalue: ic.mapData.sigma2,
                center: ic.center,
                maxdist: maxdist,
                pmin: ic.pmin,
                pmax: ic.pmax,
                //type: '2fofc',
                rmsd_supr: ic.rmsd_supr
            };

        if(type == 11) { // 2fofc
            cfg.header = ic.mapData.header2;
            cfg.data = ic.mapData.data2;
            cfg.matrix = ic.mapData.matrix2;
            cfg.isovalue = ic.mapData.sigma2;
            cfg.type = '2fofc';

            ps = this.SetupMap(cfg);
        }
        else if(type == 12) { // fofc
            cfg.header = ic.mapData.header;
            cfg.data = ic.mapData.data;
            cfg.matrix = ic.mapData.matrix;
            cfg.isovalue = ic.mapData.sigma;
            cfg.type = 'fofc';

            ps = this.SetupMap(cfg);
        }
        else if(type == 13) { // em
            cfg.maxdist = 3; // EM map has no unit cell. It could include more gird space.

            cfg.header = ic.mapData.headerEm;
            cfg.data = ic.mapData.dataEm;
            cfg.matrix = ic.mapData.matrixEm;
            cfg.isovalue = ic.mapData.sigmaEm;
            cfg.type = 'em';

            ps = this.SetupMap(cfg);
        }
        else if(type == 14) { // phimap, equipotential
            cfg.header = ic.mapData.headerPhi;
            cfg.data = ic.mapData.dataPhi;
            cfg.matrix = ic.mapData.matrixPhi;
            cfg.isovalue = ic.mapData.contourPhi;
            cfg.type = 'phi';
            cfg.loadPhiFrom = ic.loadPhiFrom;

            ps = this.SetupMap(cfg);
        }
        else {
    /*
            if(type == 21 || type == 22 || type == 23) { // phisurface, surface with potential
                // set atom colors

                cfg.header = ic.mapData.headerPhi; // header.bSurface is true
                cfg.data = ic.mapData.dataPhi;
                cfg.matrix = ic.mapData.matrixPhi;
                cfg.isovalue = ic.mapData.contourPhi;
                cfg.type = 'phi';
                cfg.loadPhiFrom = ic.loadPhiFrom;
                cfg.icn3d = me;

                ps = this.SetupMap(cfg);
            }
    */

            //1: van der waals surface, 2: molecular surface, 3: solvent accessible surface

            //exclude water
            var atomsToShow = me.hashUtilsCls.exclHash(atoms, ic.water);
            extendedAtoms = Object.keys(atomsToShow);

            var realType = type;
            if(realType == 21) realType = 1;
            else if(realType == 22) realType = 2;
            else if(realType == 23) realType = 3;

            cfg = {
                extent: extent,
                allatoms: ic.atoms,
                atomsToShow: Object.keys(atomsToShow),
                extendedAtoms: extendedAtoms,
                type: realType,
                threshbox: (bTransparent) ? 60 : ic.threshbox,
                bCalcArea: ic.bCalcArea
            };

            cfg.header = ic.mapData.headerPhi; // header.bSurface is true
            cfg.data = ic.mapData.dataPhi;
            cfg.matrix = ic.mapData.matrixPhi;
            cfg.isovalue = ic.mapData.contourPhi;
            //cfg.type = 'phi';
            cfg.loadPhiFrom = ic.loadPhiFrom;
            //cfg.icn3d = me;

            //cfg.rmsd_supr: ic.rmsd_supr

            ps = this.SetupSurface(cfg);
        }

        if(ic.bCalcArea) {
            ic.areavalue = ps.area.toFixed(2);
            var serial2area = ps.serial2area;
            var scaleFactorSq = ps.scaleFactor * ps.scaleFactor;

            ic.resid2area = {};
            var structureHash = {}, chainHash = {};
            for(var i in serial2area) {
                var atom = ic.atoms[i];
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi + '_' + atom.resn;
                structureHash[atom.structure] = 1;
                chainHash[atom.structure + '_' + atom.chain] = 1;

                if(ic.resid2area[resid] === undefined) ic.resid2area[resid] = serial2area[i];
                else ic.resid2area[resid] += serial2area[i];
            }

            var html = '<table border="1" cellpadding="10" cellspacing="0">';
            var structureStr = (Object.keys(structureHash).length > 1) ? '<th>Structure</th>' : '';
            var chainStr = (Object.keys(chainHash).length > 1) ? '<th>Chain</th>' : '';
            html += '<tr>' + structureStr + chainStr + '<th>Residue</th><th>Number</th><th>SASA (&#8491;<sup>2</sup>)</th><th>Percent Out</th><th>In/Out</th></tr>';
            for(var resid in ic.resid2area) {
                //var idArray = resid.split('_');
                var pos = resid.lastIndexOf('_');
                var resn = resid.substr(pos + 1);

                var idArray = me.utilsCls.getIdArray(resid.substr(0, pos));

                structureStr = (Object.keys(structureHash).length > 1) ? '<td>' + idArray[0] + '</td>' : '';
                chainStr = (Object.keys(chainHash).length > 1) ? '<td>' + idArray[1] + '</td>' : '';
                // outside: >= 50%; Inside: < 20%; middle: 35
                var inoutStr = '', percent = '';
                ic.resid2area[resid] = (ic.resid2area[resid] / scaleFactorSq).toFixed(2);
                if(me.parasCls.residueArea.hasOwnProperty(resn)) {
                    var middle = 35;
                    percent = parseInt(ic.resid2area[resid] / me.parasCls.residueArea[resn] * 100);
                    if(percent > 100) percent = 100;

                    if(percent >= 50) inoutStr = 'out';
                    if(percent < 20) inoutStr = 'in';
                }

                html += '<tr align="center">' + structureStr + chainStr + '<td>' + resn + '</td><td align="right">' + idArray[2] + '</td><td align="right">'
                    + ic.resid2area[resid] + '</td><td align="right">' + percent + '%</td><td>' + inoutStr + '</td></tr>';
            }

            html += '</table>';

            ic.areahtml = html;

            return;
        }

        var verts = ps.vertices;
        var faces = ps.faces;

        var colorFor2fofc = me.parasCls.thr('#00FFFF');
        var colorForfofcPos = me.parasCls.thr('#00FF00');
        //var colorForfofcNeg = me.parasCls.thr('#ff3300');
        var colorForfofcNeg = me.parasCls.thr('#ff0000');
        var colorForEm = me.parasCls.thr('#00FFFF');

        var colorForPhiPos = me.parasCls.thr('#0000FF');
        var colorForPhiNeg = me.parasCls.thr('#FF0000');

        var rot, centerFrom, centerTo;
        if((type == 11 || type == 12 || type == 13 || type == 14 ) && ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
          rot = ic.rmsd_supr.rot;
          centerFrom = ic.rmsd_supr.trans1;
          centerTo = ic.rmsd_supr.trans2;
        }

        // Direct "delphi" calculation uses the transformed PDB file, not the original PDB
        var bTrans = (type == 11 || type == 12 || type == 13 || (type == 14 && ic.loadPhiFrom != 'delphi') )
          && ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined;

        geo = new THREE.Geometry();
        geo.vertices = verts.map(function (v) {
            var r = new THREE.Vector3(v.x, v.y, v.z);
            if(bTrans) {
                r = thisClass.transformMemPro(r, rot, centerFrom, centerTo);
            }

            r.atomid = v.atomid;
            r.color = v.color;
            return r;
        });

        geo.faces = faces.map(function (f) {
            //return new THREE.Face3(f.a, f.b, f.c);
            var vertexColors = ['a', 'b', 'c' ].map(function (d) {
                if(type == 11) { // 2fofc
                    return colorFor2fofc;
                }
                else if(type == 12) { // fofc
                    return (geo.vertices[f[d]].atomid) ? colorForfofcPos : colorForfofcNeg;
                }
                else if(type == 13) { // em
                    return colorForEm;
                }
                else if(type == 14) { // phi
                    return (geo.vertices[f[d]].atomid) ? colorForPhiPos : colorForPhiNeg;
                }
                else if(type == 21 || type == 22 || type == 23) { // potential on surface
                    return geo.vertices[f[d]].color;
                }
                else {
                    var atomid = geo.vertices[f[d]].atomid;
                    return ic.atoms[atomid].color;
                }
            });

            return new THREE.Face3(f.a, f.b, f.c, undefined, vertexColors);
        });

        //http://analyticphysics.com/Coding%20Methods/Special%20Topics%20in%20Three.js.htm
        //var c = geo.center();

        //geo.computeFaceNormals();
        //geo.computeVertexNormals(false);
        geo.computeVertexNormals(true);

        geo.colorsNeedUpdate = true;
        geo.normalsNeedUpdate = true;

        geo.type = 'Surface'; // to be recognized in vrml.js for 3D printing

        // use the regular way to show transparency for type == 15 (surface with potential)
    //    if(bTransparent && (type == 1 || type == 2 || type == 3)) { // WebGL has some ordering problem when dealing with transparency
        if(bTransparent) { // WebGL has some ordering problem when dealing with transparency
          //var normalArray = geo.data.normals;
          var normalArray = JSON.parse(JSON.stringify(geo)).data.normals;

          // the following method minimize the number of objects by a factor of 3
          var va2faces = {};

          for(var i = 0, il = faces.length; i < il; ++i) {
            var va = faces[i].a;
            var vb = faces[i].b;
            var vc = faces[i].c;

            // It produces less objects using va as the key
            if(va2faces[va] === undefined) va2faces[va] = [];
            //va2faces[va].push(va);
            va2faces[va].push(vb);
            va2faces[va].push(vc);
          }

          for(var va in va2faces) {
            this.geometry = new THREE.Geometry();
            this.geometry.vertices = [];
            this.geometry.faces = [];

            var faceVertices = va2faces[va];
            for(var i = 0, il = faceVertices.length; i < il; i += 2) {
                var vb = faceVertices[i];
                var vc = faceVertices[i + 1];

                this.geometry.vertices.push(new THREE.Vector3(verts[va].x, verts[va].y, verts[va].z));
                this.geometry.vertices.push(new THREE.Vector3(verts[vb].x, verts[vb].y, verts[vb].z));
                this.geometry.vertices.push(new THREE.Vector3(verts[vc].x, verts[vc].y, verts[vc].z));

                var vertexColors = [];
                vertexColors.push(ic.atoms[verts[va].atomid].color);
                vertexColors.push(ic.atoms[verts[vb].atomid].color);
                vertexColors.push(ic.atoms[verts[vc].atomid].color);

                var normals = [];
                normals.push(normalArray[va]);
                normals.push(normalArray[vb]);
                normals.push(normalArray[vc]);

                var initPos = i / 2 * 3;
                this.geometry.faces.push(new THREE.Face3(initPos, initPos + 1, initPos + 2, normals, vertexColors));
            }

            //geometry.computeVertexNormals(false);

            this.geometry.colorsNeedUpdate = true;
            //geometry.normalsNeedUpdate = true;

            this.geometry.type = 'Surface'; // to be recognized in vrml.js for 3D printing

            var mesh = new THREE.Mesh(this.geometry, new THREE.MeshPhongMaterial({
                specular: ic.frac,
                shininess: 10, //30,
                emissive: 0x000000,
                vertexColors: THREE.VertexColors,
                wireframe: wireframe,
                opacity: opacity,
                transparent: true,
                side: THREE.DoubleSide
            }));

            //http://www.html5gamedevs.com/topic/7288-threejs-transparency-bug-or-limitation-or-what/
            //mesh.renderOrder = 0; // default 0
            var sum = new THREE.Vector3(0,0,0);
            for(var i = 0, il = mesh.geometry.vertices.length; i < il; ++i) {
                sum = sum.add(mesh.geometry.vertices[i]);
            }

            var realPos;
            if(ic.bControlGl && !ic.icn3dui.bNode) {
                realPos = sum.multiplyScalar(1.0 / mesh.geometry.vertices.length).sub(ic.oriCenter).applyMatrix4(window.cam.matrixWorldInverse);
            }
            else {
                realPos = sum.multiplyScalar(1.0 / mesh.geometry.vertices.length).sub(ic.oriCenter).applyMatrix4(ic.cam.matrixWorldInverse);
            }
            mesh.renderOrder = (ic.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);

            mesh.onBeforeRender = function(renderer, scene, camera, geometry, material, group) {
                //https://juejin.im/post/5a0872d4f265da43062a4156
                var sum = new THREE.Vector3(0,0,0);
                for(var i = 0, il = this.geometry.vertices.length; i < il; ++i) {
                    sum = sum.add(this.geometry.vertices[i]);
                }

                var realPos;
                if(ic.bControlGl && !ic.icn3dui.bNode) {
                    realPos = sum.multiplyScalar(1.0 / this.geometry.vertices.length).sub(ic.oriCenter).applyMatrix4(window.cam.matrixWorldInverse);
                }
                else {
                    realPos = sum.multiplyScalar(1.0 / this.geometry.vertices.length).sub(ic.oriCenter).applyMatrix4(ic.cam.matrixWorldInverse);
                }
                this.renderOrder = (ic.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);
            };

            ic.mdl.add(mesh);

            if(type == 11 || type == 12) {
                ic.prevMaps.push(mesh);
            }
            else if(type == 13) {
                ic.prevEmmaps.push(mesh);
            }
            else if(type == 14) {
                ic.prevPhimaps.push(mesh);
            }
            else {
                ic.prevSurfaces.push(mesh);
            }
          } // for(var va
        }
        else {
            var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
                specular: ic.frac,
                shininess: 10, //30,
                emissive: 0x000000,
                vertexColors: THREE.VertexColors,
                wireframe: wireframe,
                opacity: opacity,
                transparent: true,
                side: THREE.DoubleSide
                //depthTest: (ic.bTransparent) ? false : true
            }));

            //http://www.html5gamedevs.com/topic/7288-threejs-transparency-bug-or-limitation-or-what/
            mesh.renderOrder = -2; // default: 0, picking: -1

            ic.mdl.add(mesh);

            if(type == 11 || type == 12) {
                ic.prevMaps.push(mesh);
            }
            else if(type == 13) {
                ic.prevEmmaps.push(mesh);
            }
            else if(type == 14) {
                ic.prevPhimaps.push(mesh);
            }
            else {
                ic.prevSurfaces.push(mesh);
            }
        }

        // remove the reference
        ps = null;
        verts = null;
        faces = null;

        // remove the reference
        geo = null;

        // do not add surface to raycasting objects for pk
    }

    transformMemPro(inCoord, rot, centerFrom, centerTo, bOut) { var ic = this.icn3d, me = ic.icn3dui;
        var coord = inCoord.clone();

        coord.sub(centerFrom);
    if(bOut) console.log("sub coord: " + JSON.stringify(coord));

        var x = coord.x*rot[0] + coord.y*rot[1] + coord.z*rot[2] + centerTo.x;
        var y = coord.x*rot[3] + coord.y*rot[4] + coord.z*rot[5] + centerTo.y;
        var z = coord.x*rot[6] + coord.y*rot[7] + coord.z*rot[8] + centerTo.z;

        coord.x = x;
        coord.y = y;
        coord.z = z;
    if(bOut) console.log("out coord: " + JSON.stringify(coord));

        return coord;
    }

    SetupSurface(data) { var ic = this.icn3d, me = ic.icn3dui;
        //var $3Dmol = $3Dmol || {};

        //var vol = $3Dmol.volume(data.extent);
        var vol = undefined;

        var threshbox = data.threshbox; // maximum possible boxsize, default 180

        var ps = new ProteinSurface(ic, threshbox);
        ps.initparm(data.extent,(data.type === 1) ? false : true, data.bCalcArea, data.atomsToShow
          , data.header, data.data, data.matrix, data.isovalue, data.loadPhiFrom);

        ps.fillvoxels(data.allatoms, data.extendedAtoms);

        ps.buildboundary();

        //if(data.type === 4 || data.type === 2) {
        if(data.type === 2) {
            ps.fastdistancemap();
            ps.boundingatom(false);
            ps.fillvoxelswaals(data.allatoms, data.extendedAtoms);
        }

        //ps.marchingcube(data.type);
        var area_serial2area = ps.marchingcube();

        ps.vpBits = null; // uint8 array of bitmasks
        ps.vpDistance = null; // floatarray of _squared_ distances
        ps.vpAtomID = null; // intarray

        var result = ps.getFacesAndVertices(data.atomsToShow);
        result.area = area_serial2area.area;
        result.serial2area = area_serial2area.serial2area;
        result.scaleFactor = area_serial2area.scaleFactor;

        ps.faces = null;
        ps.verts = null;

        return result;
    }

    SetupMap(data) { var ic = this.icn3d, me = ic.icn3dui;
        var ps = new ElectronMap(ic);

        ps.initparm(data.header, data.data, data.matrix, data.isovalue, data.center, data.maxdist,
          data.pmin, data.pmax, data.water, data.type, data.rmsd_supr, data.loadPhiFrom, data.icn3d);

        ps.fillvoxels(data.allatoms, data.extendedAtoms);

        if(!data.header.bSurface) ps.buildboundary();

        if(!data.header.bSurface) ps.marchingcube();

        ps.vpBits = null; // uint8 array of bitmasks
        //ps.vpDistance = null; // floatarray of _squared_ distances
        ps.vpAtomID = null; // intarray

        var result;

        if(!data.header.bSurface) result = ps.getFacesAndVertices(data.allatoms, data.atomsToShow);

        ps.faces = null;
        ps.verts = null;

        return result;
    }
}

export {Surface}
