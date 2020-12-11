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

// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
iCn3D.prototype.buildAxes = function (radius, center, positionX, positionY, positionZ, bSelection) { var me = this, ic = me.icn3d; "use strict";
    var axes = new THREE.Object3D();

    var x = 0, y = 0, z = 0;

    if(bSelection) {
        x = center.x;
        y = center.y;
        z = center.z;
    }
    else {
        x -= radius * 0.3; //0.707; // move to the left
        y -= radius * 0.3; //0.707; // move to the botom
    }
    var origin = new THREE.Vector3( x, y, z );

    var axisLen = radius / 10;
    var r = radius / 100;

    var axisVecX, axisVecY, axisVecZ;
    var axisLenX = axisLenY = axisLenZ = axisLen;
    if(bSelection) {
        axisVecX = positionX.clone().sub(center);
        axisVecY = positionY.clone().sub(center);
        axisVecZ = positionZ.clone().sub(center);

        axisLenX = axisVecX.length();
        axisLenY = axisVecY.length();
        axisLenZ = axisVecZ.length();

        r = axisLenX / 100;

        if(r < 0.4) r = 0.4;
    }

    var meshX, meshY, meshZ;
    if(bSelection) {
        meshX = this.createCylinder_base( center, positionX, r, this.thr(0xFF0000)); // +X
        meshY = this.createCylinder_base( center, positionY, r, this.thr(0x00FF00)); // +Y
        meshZ = this.createCylinder_base( center, positionZ, r, this.thr(0x0000FF)); // +Z
    }
    else {
        meshX = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x + axisLenX, y, z ), r, this.thr(0xFF0000)); // +X
        meshY = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y + axisLenY, z ), r, this.thr(0x00FF00)); // +Y
        meshZ = this.createCylinder_base( new THREE.Vector3( x, y, z ), new THREE.Vector3( x, y, z + axisLenZ ), r, this.thr(0x0000FF)); // +Z
    }

    this.mdl.add( meshX );
    this.mdl.add( meshY );
    this.mdl.add( meshZ );

    var dirX = (bSelection) ? axisVecX.normalize() : new THREE.Vector3( 1, 0, 0 );
    var colorX = 0xff0000;
    var posX = (bSelection) ? positionX : new THREE.Vector3(origin.x + axisLen, origin.y, origin.z);
    var arrowX = this.createArrow( dirX, posX, axisLenX, colorX, 4*r, 4*r);
    this.mdl.add( arrowX );

    var dirY = (bSelection) ? axisVecY.normalize() : new THREE.Vector3( 0, 1, 0 );
    var colorY = 0x00ff00;
    var posY = (bSelection) ? positionY : new THREE.Vector3(origin.x, origin.y + axisLen, origin.z);
    var arrowY = this.createArrow( dirY, posY, axisLenY, colorY, 4*r, 4*r);
    this.mdl.add( arrowY );

    var dirZ = (bSelection) ? axisVecZ.normalize() : new THREE.Vector3( 0, 0, 1 );
    var colorZ = 0x0000ff;
    var posZ = (bSelection) ? positionZ : new THREE.Vector3(origin.x, origin.y, origin.z + axisLen);
    var arrowZ = this.createArrow( dirZ, posZ, axisLenZ, colorZ, 4*r, 4*r);
    this.mdl.add( arrowZ );
};

iCn3D.prototype.createArrow = function(dir, origin, axisLen, color, headLength, headWidth, bGlycan) {  var me = this, ic = me.icn3d; "use strict";
    var coneGeometry = new THREE.CylinderBufferGeometry( 0, 0.5, 1, 32, 1 );
    //coneGeometry.translate( 0, - 0.5, 0 );
    coneGeometry.translate( 0, 0.5, 0 );
    var material;
    if(bGlycan) {
        material = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color });

    }
    else {
        material = new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, side: THREE.DoubleSide, color: color});
    }

    var cone = new THREE.Mesh( coneGeometry, material);
//    cone.matrixAutoUpdate = false;

    var quaternion = new THREE.Quaternion();
    // dir is assumed to be normalized
    if ( dir.y > 0.99999 ) {
        quaternion.set( 0, 0, 0, 1 );
    } else if ( dir.y < - 0.99999 ) {
        quaternion.set( 1, 0, 0, 0 );
    } else {
        var axis = new THREE.Vector3();
        axis.set( dir.z, 0, - dir.x ).normalize();
        var radians = Math.acos( dir.y );
        quaternion.setFromAxisAngle( axis, radians );
    }

    cone.applyQuaternion(quaternion);
    cone.scale.set( headWidth, headLength, headWidth );
    //origin.add(new THREE.Vector3(0, axisLen, 0));
    cone.position.copy( origin );

    return cone;
};

// show extra lines, not used for pk, so no this.objects
iCn3D.prototype.createLines = function(lines) {  var me = this, ic = me.icn3d; "use strict";
   if(lines !== undefined) {
     for(var name in lines) {
         var lineArray = lines[name];

         for(var i = 0, il = lineArray.length; i < il; ++i) {
           var line = lineArray[i];

           var p1 = line.position1;
           var p2 = line.position2;

           var dashed = (line.dashed) ? line.dashed : false;
           var dashSize = 0.3;

           //this.mdl.add(this.createSingleLine( p1, p2, colorHex, dashed, dashSize ));

           var radius = this.lineRadius;

           var colorStr = '#' + line.color.replace(/\#/g, '');

           var color = this.thr(colorStr);

           if(!dashed) {
                if(name == 'stabilizer') {
                    this.createBrick(p1, p2, radius, color);
                }
                else {
                    this.createCylinder(p1, p2, radius, color);
                }
           }
           else {
             var distance = p1.distanceTo(p2);

             var nsteps = parseInt(distance / dashSize);
             var step = p2.clone().sub(p1).multiplyScalar(dashSize/distance);

             var start, end;
             for(var j = 0; j < nsteps; ++j) {
                 if(j % 2 == 1) {
                      start = p1.clone().add(step.clone().multiplyScalar(j));
                      end = p1.clone().add(step.clone().multiplyScalar(j + 1));

                      if(name == 'stabilizer') {
                        this.createBrick(start, end, radius, color);
                      }
                      else {
                        this.createCylinder(start, end, radius, color);
                      }
                  }
             }
           }
         }
     }
   }

   // do not add the artificial lines to raycasting objects
};

iCn3D.prototype.createBrick = function (p0, p1, radius, color) { var me = this, ic = me.icn3d; "use strict";
    var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 4, 1);

    var mesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

    mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
    mesh.matrixAutoUpdate = false;
    mesh.lookAt(p1.clone().sub(p0));
    mesh.updateMatrix();

    mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

    me.mdl.add(mesh);
};

iCn3D.prototype.applySymd = function () { var me = this, ic = me.icn3d; "use strict";
    for(var i = 0, il = this.symdArray.length; i < il; ++i) {
        var symdHash = this.symdArray[i];
        var title = Object.keys(symdHash)[0];
        this.applySymmetry(title, true, symdHash[title]);
    }
};

iCn3D.prototype.applySymmetry = function (title, bSymd, inDataArray) { var me = this, ic = me.icn3d; "use strict";
    //var dataArray = (bSymd) ? this.symdHash[title] : this.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
    var dataArray = (bSymd) ? inDataArray : this.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
    if(!dataArray) dataArray = [];

    var symmetryType = title.substr(0, 1);
    var nSide = parseInt(title.substring(1, title.indexOf(' ')));

    var axisRadius = 2 * this.cylinderRadius * this.oriMaxD / 150;
    var polygonRadius = 1 * this.cylinderRadius * this.oriMaxD / 150;

    if(symmetryType == 'I') {
        axisRadius *= 2;
        polygonRadius *= 2;
    }

    var pointArray = [];

    var index = 0;
    for(var i = 0, il = dataArray.length; i < il; ++i) {
        var start = dataArray[i][0];
        var end = dataArray[i][1];
        var colorAxis = dataArray[i][2];
        var colorPolygon = dataArray[i][3];
        var order = dataArray[i][4];
        var chain = dataArray[i][5];

        me.createCylinder(start, end, axisRadius, colorAxis, 0);

        if(symmetryType == 'C' || (symmetryType == 'D' && order == nSide) ) {
            // find the center and size of the selected protein chain

            var selection = {};
            // check the number of chains
            var nChain = Object.keys(this.chains).length;
            var bMultiChain = false;
            var chainHashTmp = {};

            if(bSymd && Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
                for(var serial in this.hAtoms) {
                    var atom = this.atoms[serial];
                    var chainid = atom.structure + '_' + atom.chain;
                    chainHashTmp[chainid] = 1;
                }

                if(Object.keys(chainHashTmp).length > 1) {
                    bMultiChain = true;
                }
            }

            //if(!bSymd || bMultiChain || Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
            if(!bSymd) {
                var selectedChain = Object.keys(this.structures)[0] + '_' + chain;

                if(!this.chains.hasOwnProperty(selectedChain)) {
                    selectedChain = Object.keys(this.structures)[0] + '_' + chain.toLowerCase();
                }

                if(!this.chains.hasOwnProperty(selectedChain)) {
                    selectedChain = Object.keys(this.chains)[0];
                    for(var chainid in this.chains) {
                        var firstSerial = Object.keys(this.chains[chainid])[0];
                        if(this.proteins.hasOwnProperty(firstSerial)) {
                            selectedChain = chainid;
                            break;
                        }
                    }
                }
                selection = this.chains[selectedChain];
            }
            else if(bMultiChain) {
                var selectedChain = Object.keys(chainHashTmp)[0];
                selection = this.chains[selectedChain];
            }
            else { // bSymd, subset, and one chain
                // pick the first 1/order of selection
                var cnt = parseInt(Object.keys(this.hAtoms).length / order);
                var j = 0, lastSerial;

                for(var serial in this.hAtoms) {
                    selection[serial] = 1;
                    lastSerial = serial;
                    ++j;
                    if(j > cnt) break;
                }

                // add the whole residue for the last serial
                var resid = this.atoms[lastSerial].structure + '_' + this.atoms[lastSerial].chain + '_' + this.atoms[lastSerial].resi;
                selection = this.unionHash(selection, this.residues[resid]);
            }


            var middle = start.clone().add(end).multiplyScalar(0.5);

            var psum = new THREE.Vector3();
            var cnt = 0;

            // apply the transformation to make the axis in the z-axis
            var axis = end.clone().sub(start).normalize();
            var vTo = new THREE.Vector3(0, 0, 1);

            var quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors (axis, vTo)

            var distSqMax = -9999;
            for (var serial in selection) {
                var atom = this.atoms[serial];
                var coord = atom.coord.clone();
                psum.add(coord);

                coord.sub(middle).applyQuaternion(quaternion);

                var distSq = coord.x*coord.x + coord.y*coord.y;

                if(distSq > distSqMax) distSqMax = distSq;

                ++cnt;
            }

            var center = psum.multiplyScalar(1.0 / cnt);

            var line = new THREE.Line3(start, end);

            // project center on line
            var proj = new THREE.Vector3();
            line.closestPointToPoint(center, true, proj);

            var rLen = Math.sqrt(distSqMax);

            var rDir = center.clone().sub(proj).normalize().multiplyScalar(rLen);

            //var start2 = start.clone().add(rDir);
            //var end2 = end.clone().add(rDir);

            var start2 = middle.clone().add(start.clone().sub(middle).multiplyScalar(0.83)).add(rDir);
            var end2 = middle.clone().add(end.clone().sub(middle).multiplyScalar(0.83)).add(rDir);

            //var axis = end.clone().sub(start).normalize();
            var anglePerSide = 2*Math.PI / nSide;

            var startInit, endInit, startPrev, endPrev;
            for(var j = 0; j < nSide; ++j) {
                var angle = (0.5 + j) * anglePerSide;

                var startCurr = start2.clone().sub(start);
                startCurr.applyAxisAngle(axis, angle).add(start);

                var endCurr = end2.clone().sub(start);
                endCurr.applyAxisAngle(axis, angle).add(start);

                me.createCylinder(startCurr, endCurr, polygonRadius, colorPolygon, 0);

                me.createSphereBase(startCurr, colorPolygon, polygonRadius, 1.0, 0);
                me.createSphereBase(endCurr, colorPolygon, polygonRadius, 1.0, 0);

                if(j == 0) {
                    startInit = startCurr;
                    endInit = endCurr;
                }
                else {
                    me.createCylinder(startCurr, startPrev, polygonRadius, colorPolygon, 0);
                    me.createCylinder(endCurr, endPrev, polygonRadius, colorPolygon, 0);
                }

                startPrev = startCurr;
                endPrev = endCurr;
            }

            me.createCylinder(startInit, startPrev, polygonRadius, colorPolygon, 0);
            me.createCylinder(endInit, endPrev, polygonRadius, colorPolygon, 0);
        }
        else if( (symmetryType == 'T' && order == 3)
          || (symmetryType == 'O' && order == 4)
          || (symmetryType == 'I' && order == 5) ) {
            pointArray.push(start);
            pointArray.push(end);
        }
        else if(symmetryType == 'H') {
        }
    }

    if(symmetryType == 'T') {
        var pos1 = pointArray[0]; // pointArray: start, end, start, end, ...
        me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);

        var dist2 = pos1.distanceTo(pointArray[2]);
        var dist3 = pos1.distanceTo(pointArray[3]);

        var distSmall, posSel;
        if(dist2 < dist3) {
            distSmall = dist2;
            posSel = pointArray[3];
        }
        else {
            distSmall = dist3;
            posSel = pointArray[2];
        }

        me.createSphereBase(posSel, colorPolygon, polygonRadius, 1.0, 0);
        me.createCylinder(pos1, posSel, polygonRadius, colorPolygon, 0);

        var iPrev;
        for(var i = 4, il = pointArray.length; i < il; ++i) {
            var pos2 = pointArray[i];

            var dist = pos1.distanceTo(pos2);
            if(dist > distSmall) {
                me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos2, polygonRadius, colorPolygon, 0);

                me.createCylinder(posSel, pos2, polygonRadius, colorPolygon, 0);
                if(iPrev !== undefined) {
                    me.createCylinder(pointArray[iPrev], pos2, polygonRadius, colorPolygon, 0);
                }

                iPrev = i;
            }
        }
    }
    else if(symmetryType == 'O') {
        for(var i = 0, il = pointArray.length; i < il; i += 2) {
            var pos1 = pointArray[i];
            var pos2 = pointArray[i+1];
            me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
            me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
            for(var j = i + 2, jl = pointArray.length; j < jl; ++j) {
                var pos3 = pointArray[j];
                me.createSphereBase(pos3, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos3, polygonRadius, colorPolygon, 0);
                me.createCylinder(pos2, pos3, polygonRadius, colorPolygon, 0);
            }
        }
    }
    else if(symmetryType == 'I') {
        for(var i = 0, il = pointArray.length; i < il; i += 2) {
            var pos1 = pointArray[i];
            var pos2 = pointArray[i+1];
            me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
            me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
            for(var j = i + 2, jl = pointArray.length; j < jl; j += 2) {
                var pos3 = pointArray[j];
                var pos4 = pointArray[j+1];

                var dist3 = pos1.distanceTo(pos3);
                var dist4 = pos1.distanceTo(pos4);

                var pos1Sel, pos2Sel;
                if(dist3 < dist4) {
                    pos1Sel = pos3;
                    pos2Sel = pos4;
                }
                else {
                    pos1Sel = pos4;
                    pos2Sel = pos3;
                }

                me.createSphereBase(pos1Sel, colorPolygon, polygonRadius, 1.0, 0);
                me.createSphereBase(pos2Sel, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos1Sel, polygonRadius, colorPolygon, 0);
                me.createCylinder(pos2, pos2Sel, polygonRadius, colorPolygon, 0);
            }
        }
    }
};
