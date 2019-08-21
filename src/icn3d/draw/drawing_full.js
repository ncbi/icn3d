/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSurfaceRepresentation = function (atoms, type, wireframe, opacity) { var me = this;
    if(Object.keys(atoms).length == 0) return;

    if(opacity == undefined) opacity = 1.0;

    this.opacity = opacity;

    var geo;

    var extent = this.getExtent(atoms);

    // surface from 3Dmol
    var distance = 5; // consider atom 5 angstrom from the selected atoms

    var extendedAtoms = [];

    if(this.bConsiderNeighbors) {
        extendedAtoms = Object.keys(this.unionHash(atoms, this.getAtomsWithinAtom(this.atoms, atoms, distance)));
    }
    else {
        extendedAtoms = Object.keys(atoms);
    }

    //var sigma2fofc = 1.5;
    //var sigmafofc = 3.0;
    var maxdist = 1; // maximum distance to show electron density map, set it between 1 AND 2

    var bTransparent = (parseInt(10*opacity) != 10 && !wireframe && !(this.bInstanced && Object.keys(this.atoms).length * this.biomtMatrices.length > this.maxatomcnt) ) ? true : false;

    var ps;
    if(type == 11) { // 2fofc
        //maxdist = (me.mapData.sigma2 < 1.5) ? 2 : 1;

        ps = $3Dmol.SetupMap({
            //extent: extent,
            allatoms: this.atoms,
            atomsToShow: Object.keys(atoms),
            extendedAtoms: extendedAtoms,
            water: this.water,
            //type: type,
            //threshbox: this.threshbox,
            header: me.mapData.header2,
            data: me.mapData.data2,
            matrix: me.mapData.matrix2,
            isovalue: me.mapData.sigma2,
            center: this.center,
            maxdist: maxdist,
            pmin: this.pmin,
            pmax: this.pmax,
            type: '2fofc'
        });
    }
    else if(type == 12) { // fofc
        //maxdist = (me.mapData.sigma < 3) ? 2 : 1;
        ps = $3Dmol.SetupMap({
            //extent: extent,
            allatoms: this.atoms,
            atomsToShow: Object.keys(atoms),
            extendedAtoms: extendedAtoms,
            water: this.water,
            //type: type,
            //threshbox: this.threshbox,
            header: me.mapData.header,
            data: me.mapData.data,
            matrix: me.mapData.matrix,
            isovalue: me.mapData.sigma,
            center: this.center,
            maxdist: maxdist,
            pmin: this.pmin,
            pmax: this.pmax,
            type: 'fofc'
        });
    }
    else if(type == 13) { // em
        maxdist = 3; // EM map has no unit cell. It could include more gird space.

        ps = $3Dmol.SetupMap({
            //extent: extent,
            allatoms: this.atoms,
            atomsToShow: Object.keys(atoms),
            extendedAtoms: extendedAtoms,
            water: this.water,
            //type: type,
            //threshbox: this.threshbox,
            header: me.mapData.headerEm,
            data: me.mapData.dataEm,
            matrix: me.mapData.matrixEm,
            isovalue: me.mapData.sigmaEm,
            center: this.center,
            maxdist: maxdist,
            pmin: this.pmin,
            pmax: this.pmax,
            type: 'em'
        });
    }
    else {
        ps = $3Dmol.SetupSurface({
            extent: extent,
            allatoms: this.atoms,
            atomsToShow: Object.keys(atoms),
            extendedAtoms: extendedAtoms,
            type: type,
            threshbox: (bTransparent) ? 60 : this.threshbox
        });
    }

    var verts = ps.vertices;
    var faces = ps.faces;

    var colorFor2fofc = new THREE.Color('#00FFFF');
    var colorForfofcPos = new THREE.Color('#00FF00');
    //var colorForfofcNeg = new THREE.Color('#ff3300');
    var colorForfofcNeg = new THREE.Color('#ff0000');
    var colorForEm = new THREE.Color('#00FFFF');

    geo = new THREE.Geometry();
    geo.vertices = verts.map(function (v) {
        var r = new THREE.Vector3(v.x, v.y, v.z);

        r.atomid = v.atomid;
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

    //var normalArray = geo.data.normals;
    var normalArray = JSON.parse(JSON.stringify(geo)).data.normals;

    if(bTransparent) { // WebGL has someordering problem when dealing with transparency
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

        var realPos = sum.multiplyScalar(1.0 / mesh.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(me.cam.matrixWorldInverse);
        mesh.renderOrder = (me.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);

        mesh.onBeforeRender = function(renderer, scene, camera, geometry, material, group) {
            //https://juejin.im/post/5a0872d4f265da43062a4156
            var sum = new THREE.Vector3(0,0,0);
            for(var i = 0, il = this.geometry.vertices.length; i < il; ++i) {
                sum = sum.add(this.geometry.vertices[i]);
            }

            var realPos = sum.multiplyScalar(1.0 / this.geometry.vertices.length).sub(me.oriCenter).applyMatrix4(me.cam.matrixWorldInverse);
            this.renderOrder = (me.cam_z > 0) ? -parseInt(realPos.z) : parseInt(realPos.z);
        };

        me.mdl.add(mesh);

        if(type == 11 || type == 12) {
            this.prevMaps.push(mesh);
        }
        else if(type == 13) {
            this.prevEmmaps.push(mesh);
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
        mesh.renderOrder = -1; // default 0

        me.mdl.add(mesh);

        if(type == 11 || type == 12) {
            this.prevMaps.push(mesh);
        }
        else if(type == 13) {
            this.prevEmmaps.push(mesh);
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
iCn3D.prototype.buildAxes = function (radius) {
    var axes = new THREE.Object3D();

    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0 + radius, 0, 0 ), 0xFF0000, false, 0.5 ) ); // +X
    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0 - radius, 0, 0 ), 0x800000, true, 0.5) ); // -X

    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0 + radius, 0 ), 0x00FF00, false, 0.5 ) ); // +Y
    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0 - radius, 0 ), 0x008000, true, 0.5 ) ); // -Y

    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 0 + radius ), 0x0000FF, false, 0.5 ) ); // +Z
    axes.add( this.createSingleLine( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 0 - radius ), 0x000080, true, 0.5 ) ); // -Z

    this.scene.add( axes );
};

iCn3D.prototype.createLines = function(lines) { // show extra lines, not used for pk, so no this.objects
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

           var color = new THREE.Color(colorStr);

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

iCn3D.prototype.createBrick = function (p0, p1, radius, color) {
    var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 4, 1);

    var mesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

    mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
    mesh.matrixAutoUpdate = false;
    mesh.lookAt(p1.clone().sub(p0));
    mesh.updateMatrix();

    mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

    this.mdl.add(mesh);
};

