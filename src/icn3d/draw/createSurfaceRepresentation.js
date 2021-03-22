/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSurfaceRepresentation = function (atoms, type, wireframe, opacity) { var me = this, ic = me.icn3d; "use strict";
    if(Object.keys(atoms).length == 0) return;

    if(opacity == undefined) opacity = 1.0;

    this.opacity = opacity;

    var geo;

    var extent = this.getExtent(atoms);

    // surface from 3Dmol
    var distance = 5; // consider atom 5 angstrom from the selected atoms

    var extendedAtoms = [];

    if(this.bConsiderNeighbors) {
        var unionAtoms;
        unionAtoms = this.unionHash(unionAtoms, atoms)
        unionAtoms = this.unionHash(unionAtoms, this.getAtomsWithinAtom(this.atoms, atoms, distance))

        extendedAtoms = Object.keys(unionAtoms);
    }
    else {
        extendedAtoms = Object.keys(atoms);
    }

    //var sigma2fofc = 1.5;
    //var sigmafofc = 3.0;
    var maxdist = 1; // maximum distance to show electron density map, set it between 1 AND 2

    var bTransparent = (parseInt(10*opacity) != 10 && !wireframe && !(this.bInstanced && Object.keys(this.atoms).length * this.biomtMatrices.length > this.maxatomcnt) ) ? true : false;

    var ps;

    var cfg = {
            allatoms: this.atoms,
            atomsToShow: Object.keys(atoms),
            extendedAtoms: extendedAtoms,
            water: this.water,
            //header: me.mapData.header2,
            //data: me.mapData.data2,
            //matrix: me.mapData.matrix2,
            //isovalue: me.mapData.sigma2,
            center: this.center,
            maxdist: maxdist,
            pmin: this.pmin,
            pmax: this.pmax,
            //type: '2fofc',
            rmsd_supr: this.rmsd_supr
        };

    if(type == 11) { // 2fofc
        cfg.header = me.mapData.header2;
        cfg.data = me.mapData.data2;
        cfg.matrix = me.mapData.matrix2;
        cfg.isovalue = me.mapData.sigma2;
        cfg.type = '2fofc';

        ps = $3Dmol.SetupMap(cfg);
    }
    else if(type == 12) { // fofc
        cfg.header = me.mapData.header;
        cfg.data = me.mapData.data;
        cfg.matrix = me.mapData.matrix;
        cfg.isovalue = me.mapData.sigma;
        cfg.type = 'fofc';

        ps = $3Dmol.SetupMap(cfg);
    }
    else if(type == 13) { // em
        cfg.maxdist = 3; // EM map has no unit cell. It could include more gird space.

        cfg.header = me.mapData.headerEm;
        cfg.data = me.mapData.dataEm;
        cfg.matrix = me.mapData.matrixEm;
        cfg.isovalue = me.mapData.sigmaEm;
        cfg.type = 'em';

        ps = $3Dmol.SetupMap(cfg);
    }
    else if(type == 14) { // phimap, equipotential
        cfg.header = me.mapData.headerPhi;
        cfg.data = me.mapData.dataPhi;
        cfg.matrix = me.mapData.matrixPhi;
        cfg.isovalue = me.mapData.contourPhi;
        cfg.type = 'phi';
        cfg.loadPhiFrom = me.loadPhiFrom;

        ps = $3Dmol.SetupMap(cfg);
    }
    else {
/*
        if(type == 21 || type == 22 || type == 23) { // phisurface, surface with potential
            // set atom colors

            cfg.header = me.mapData.headerPhi; // header.bSurface is true
            cfg.data = me.mapData.dataPhi;
            cfg.matrix = me.mapData.matrixPhi;
            cfg.isovalue = me.mapData.contourPhi;
            cfg.type = 'phi';
            cfg.loadPhiFrom = me.loadPhiFrom;
            cfg.icn3d = me;

            ps = $3Dmol.SetupMap(cfg);
        }
*/

        //1: van der waals surface, 2: molecular surface, 3: solvent accessible surface

        //exclude water
        var atomsToShow = this.exclHash(atoms, this.water);
        extendedAtoms = Object.keys(atomsToShow);

        var realType = type;
        if(realType == 21) realType = 1;
        else if(realType == 22) realType = 2;
        else if(realType == 23) realType = 3;

        cfg = {
            extent: extent,
            allatoms: this.atoms,
            atomsToShow: Object.keys(atomsToShow),
            extendedAtoms: extendedAtoms,
            type: realType,
            threshbox: (bTransparent) ? 60 : this.threshbox,
            bCalcArea: this.bCalcArea
        };

        cfg.header = me.mapData.headerPhi; // header.bSurface is true
        cfg.data = me.mapData.dataPhi;
        cfg.matrix = me.mapData.matrixPhi;
        cfg.isovalue = me.mapData.contourPhi;
        //cfg.type = 'phi';
        cfg.loadPhiFrom = me.loadPhiFrom;
        //cfg.icn3d = me;

        //cfg.rmsd_supr: this.rmsd_supr

        ps = $3Dmol.SetupSurface(cfg);
    }

    if(this.bCalcArea) {
        this.areavalue = ps.area.toFixed(2);
        var serial2area = ps.serial2area;
        var scaleFactorSq = ps.scaleFactor * ps.scaleFactor;

        this.resid2area = {};
        var structureHash = {}, chainHash = {};
        for(var i in serial2area) {
            var atom = this.atoms[i];
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi + '_' + atom.resn;
            structureHash[atom.structure] = 1;
            chainHash[atom.structure + '_' + atom.chain] = 1;

            if(this.resid2area[resid] === undefined) this.resid2area[resid] = serial2area[i];
            else this.resid2area[resid] += serial2area[i];
        }

        var html = '<table border="1" cellpadding="10" cellspacing="0">';
        var structureStr = (Object.keys(structureHash).length > 1) ? '<th>Structure</th>' : '';
        var chainStr = (Object.keys(chainHash).length > 1) ? '<th>Chain</th>' : '';
        html += '<tr>' + structureStr + chainStr + '<th>Residue</th><th>Number</th><th>SASA (&#8491;<sup>2</sup>)</th><th>Percent Out</th><th>In/Out</th></tr>';
        for(var resid in this.resid2area) {
            //var idArray = resid.split('_');
            var idArray = [];
            var pos1 = resid.indexOf('_');
            var pos2 = resid.lastIndexOf('_');
            idArray.push(resid.substr(0, pos1));
            idArray.push(resid.substr(pos1 + 1, pos2 - pos1 - 1));
            idArray.push(resid.substr(pos2 + 1));

            structureStr = (Object.keys(structureHash).length > 1) ? '<td>' + idArray[0] + '</td>' : '';
            chainStr = (Object.keys(chainHash).length > 1) ? '<td>' + idArray[1] + '</td>' : '';
            // outside: >= 50%; Inside: < 20%; middle: 35
            var inoutStr = '', percent = '';
            this.resid2area[resid] = (this.resid2area[resid] / scaleFactorSq).toFixed(2);
            if(this.residueArea.hasOwnProperty(idArray[3])) {
                var middle = 35;
                percent = parseInt(this.resid2area[resid] / this.residueArea[idArray[3]] * 100);
                if(percent > 100) percent = 100;

                if(percent >= 50) inoutStr = 'out';
                if(percent < 20) inoutStr = 'in';
            }

            html += '<tr align="center">' + structureStr + chainStr + '<td>' + idArray[3] + '</td><td align="right">' + idArray[2] + '</td><td align="right">'
                + this.resid2area[resid] + '</td><td align="right">' + percent + '%</td><td>' + inoutStr + '</td></tr>';
        }

        html += '</table>';

        this.areahtml = html;

        return;
    }

    var verts = ps.vertices;
    var faces = ps.faces;

    var colorFor2fofc = this.thr('#00FFFF');
    var colorForfofcPos = this.thr('#00FF00');
    //var colorForfofcNeg = this.thr('#ff3300');
    var colorForfofcNeg = this.thr('#ff0000');
    var colorForEm = this.thr('#00FFFF');

    var colorForPhiPos = this.thr('#0000FF');
    var colorForPhiNeg = this.thr('#FF0000');

    var rot, centerFrom, centerTo;
    if((type == 11 || type == 12 || type == 13 || type == 14 ) && this.rmsd_supr !== undefined && this.rmsd_supr.rot !== undefined) {
      rot = me.rmsd_supr.rot;
      centerFrom = me.rmsd_supr.trans1;
      centerTo = me.rmsd_supr.trans2;
    }

    // Direct "delphi" calculation uses the transformed PDB file, not the original PDB
    var bTrans = (type == 11 || type == 12 || type == 13 || (type == 14 && me.loadPhiFrom != 'delphi') )
      && me.rmsd_supr !== undefined && me.rmsd_supr.rot !== undefined;

    geo = new THREE.Geometry();
    geo.vertices = verts.map(function (v) {
        var r = new THREE.Vector3(v.x, v.y, v.z);
        if(bTrans) {
            r = me.transformMemPro(r, rot, centerFrom, centerTo);
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
                return me.atoms[atomid].color;
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
        var geometry = new THREE.Geometry();
        geometry.vertices = [];
        geometry.faces = [];

        var faceVertices = va2faces[va];
        for(var i = 0, il = faceVertices.length; i < il; i += 2) {
            var vb = faceVertices[i];
            var vc = faceVertices[i + 1];

            geometry.vertices.push(new THREE.Vector3(verts[va].x, verts[va].y, verts[va].z));
            geometry.vertices.push(new THREE.Vector3(verts[vb].x, verts[vb].y, verts[vb].z));
            geometry.vertices.push(new THREE.Vector3(verts[vc].x, verts[vc].y, verts[vc].z));

            var vertexColors = [];
            vertexColors.push(me.atoms[verts[va].atomid].color);
            vertexColors.push(me.atoms[verts[vb].atomid].color);
            vertexColors.push(me.atoms[verts[vc].atomid].color);

            var normals = [];
            normals.push(normalArray[va]);
            normals.push(normalArray[vb]);
            normals.push(normalArray[vc]);

            var initPos = i / 2 * 3;
            geometry.faces.push(new THREE.Face3(initPos, initPos + 1, initPos + 2, normals, vertexColors));
        }

        //geometry.computeVertexNormals(false);

        geometry.colorsNeedUpdate = true;
        //geometry.normalsNeedUpdate = true;

        geometry.type = 'Surface'; // to be recognized in vrml.js for 3D printing

        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            specular: this.frac,
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
        if(me.bControlGl) {
            realPos = sum.multiplyScalar(1.0 / mesh.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(window.cam.matrixWorldInverse);
        }
        else {
            realPos = sum.multiplyScalar(1.0 / mesh.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(me.cam.matrixWorldInverse);
        }
        mesh.renderOrder = (me.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);

        mesh.onBeforeRender = function(renderer, scene, camera, geometry, material, group) {
            //https://juejin.im/post/5a0872d4f265da43062a4156
            var sum = new THREE.Vector3(0,0,0);
            for(var i = 0, il = this.geometry.vertices.length; i < il; ++i) {
                sum = sum.add(this.geometry.vertices[i]);
            }

            var realPos;
            if(me.bControlGl) {
                realPos = sum.multiplyScalar(1.0 / this.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(window.cam.matrixWorldInverse);
            }
            else {
                realPos = sum.multiplyScalar(1.0 / this.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(me.cam.matrixWorldInverse);
            }
            this.renderOrder = (me.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);
        };

        me.mdl.add(mesh);

        if(type == 11 || type == 12) {
            this.prevMaps.push(mesh);
        }
        else if(type == 13) {
            this.prevEmmaps.push(mesh);
        }
        else if(type == 14) {
            this.prevPhimaps.push(mesh);
        }
        else {
            this.prevSurfaces.push(mesh);
        }
      } // for(var va
    }
    else {
        var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
            specular: this.frac,
            shininess: 10, //30,
            emissive: 0x000000,
            vertexColors: THREE.VertexColors,
            wireframe: wireframe,
            opacity: opacity,
            transparent: true,
            side: THREE.DoubleSide
            //depthTest: (this.bTransparent) ? false : true
        }));

        //http://www.html5gamedevs.com/topic/7288-threejs-transparency-bug-or-limitation-or-what/
        mesh.renderOrder = -2; // default: 0, picking: -1

        me.mdl.add(mesh);

        if(type == 11 || type == 12) {
            this.prevMaps.push(mesh);
        }
        else if(type == 13) {
            this.prevEmmaps.push(mesh);
        }
        else if(type == 14) {
            this.prevPhimaps.push(mesh);
        }
        else {
            this.prevSurfaces.push(mesh);
        }
    }

    // remove the reference
    ps = null;
    verts = null;
    faces = null;

    // remove the reference
    geo = null;

    // do not add surface to raycasting objects for pk
};
