/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */


// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinder = function (p0, p1, radius, color, bHighlight, color2, bPicking, bGlycan) { var me = this, ic = me.icn3d; "use strict";
    var mesh;
    if(bHighlight === 1) {
        mesh = new THREE.Mesh(this.cylinderGeometryOutline, this.matShader);

        mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
        mesh.matrixAutoUpdate = false;
        mesh.lookAt(p1.clone().sub(p0));
        mesh.updateMatrix();

        mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

        mesh.renderOrder = this.renderOrderPicking;
        //this.mdlPicking.add(mesh);
        this.mdl.add(mesh);

        this.prevHighlightObjects.push(mesh);
    }
    else {
        if(bHighlight === 2) {
          mesh = new THREE.Mesh(this.cylinderGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

          radius *= 1.5;
        }
        else if(bGlycan) {
          mesh = new THREE.Mesh(this.cylinderGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
        }
        else {
          mesh = new THREE.Mesh(this.cylinderGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
        }

        mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
        mesh.matrixAutoUpdate = false;
        //mesh.lookAt(p0);
        mesh.lookAt(p1.clone().sub(p0));
        mesh.updateMatrix();

        mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

        if(this.bImpo && !bGlycan) {
          this.posArray.push(p0.x);
          this.posArray.push(p0.y);
          this.posArray.push(p0.z);

          if(!color) color = this.thr(0xFFFFFF);
          this.colorArray.push(color.r);
          this.colorArray.push(color.g);
          this.colorArray.push(color.b);

          this.pos2Array.push(p1.x);
          this.pos2Array.push(p1.y);
          this.pos2Array.push(p1.z);

          if(color2 !== undefined) {
              this.color2Array.push(color2.r);
              this.color2Array.push(color2.g);
              this.color2Array.push(color2.b);
          }
          else {
              this.color2Array.push(color.r);
              this.color2Array.push(color.g);
              this.color2Array.push(color.b);
          }

          this.radiusArray.push(radius);

          if(this.cnt <= this.maxatomcnt) this.mdl_ghost.add(mesh);
        }
        else {
            this.mdl.add(mesh);
        }

        if(bHighlight === 2) {
            if(this.bImpo) {
                if(this.cnt <= this.maxatomcnt) this.prevHighlightObjects_ghost.push(mesh);
            }
            else {
                this.prevHighlightObjects.push(mesh);
            }
        }
        else {
            if(this.bImpo) {
                if(this.cnt <= this.maxatomcnt) this.objects_ghost.push(mesh);
            }
            else {
                if(bPicking === undefined || bPicking) this.objects.push(mesh);
            }
        }
    }
};

iCn3D.prototype.createCylinder_base = function (p0, p1, radius, color, bHighlight, color2, bPicking) { var me = this, ic = me.icn3d; "use strict";
    var mesh = new THREE.Mesh(this.cylinderGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

    mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
    mesh.matrixAutoUpdate = false;
    //mesh.lookAt(p0);
    mesh.lookAt(p1.clone().sub(p0));
    mesh.updateMatrix();

    mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

    return mesh;
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinderHelix = function (atoms, radius, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    var start = null;
    var currentChain, currentResi;
    var others = {}, beta = {};
    var i;
    for (i in atoms) {
        var atom = atoms[i];
        if (atom.het) continue;
        if ((atom.ss !== 'helix' && atom.ss !== 'sheet') || atom.ssend || atom.ssbegin) others[atom.serial] = atom;
        if (atom.ss === 'sheet') beta[atom.serial] = atom;
        if (atom.name !== 'CA') continue;
        if (atom.ss === 'helix' && atom.ssend) {
            if (start !== null && currentChain === atom.chain && currentResi < atom.resi) {
                if(bHighlight === 1 || bHighlight === 2) {
                    this.createCylinder(start.coord, atom.coord, radius, this.hColor, bHighlight);
                }
                else {
                    this.createCylinder(start.coord, atom.coord, radius, atom.color);
                }
            }

            start = null;
        }

        if (start === null && atom.ss === 'helix' && atom.ssbegin) {
            start = atom;

            currentChain = atom.chain;
            currentResi = atom.resi;
        }
    }

    if(bHighlight === 1 || bHighlight === 2) {
        if(Object.keys(others).length > 0) this.createTube(others, 'CA', this.coilWidth, bHighlight);
        if(Object.keys(beta).length > 0) this.createStrand(beta, undefined, undefined, true, 0, this.helixSheetWidth, false, this.ribbonthickness * 2, bHighlight);
    }
    else {
        if(Object.keys(others).length > 0) this.createTube(others, 'CA', this.coilWidth);
        if(Object.keys(beta).length > 0) this.createStrand(beta, undefined, undefined, true, 0, this.helixSheetWidth, false, this.ribbonthickness * 2);
    }
};


// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinderCurve = function (atoms, atomNameArray, radius, bLines, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    var start = null;
    var currentChain, currentResi;
    var i;
    var pnts = [], colors = [], radii = [];

    var atom, maxDistance = 8.0; // max residue-residue (or nucleitide-nucleitide) distance allowed

    for (i in atoms) {
        atom = atoms[i];
        if (atom.het) continue;

        //if (atom.name !== atomName) continue;
        if(atomNameArray.indexOf(atom.name) == -1) continue;

        if (start !== null && currentChain === atom.chain && currentResi + 1 === atom.resi && Math.abs(start.coord.x - atom.coord.x) < maxDistance && Math.abs(start.coord.y - atom.coord.y) < maxDistance && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
//            if (start !== null && currentChain === atom.chain && Math.abs(start.coord.x - atom.coord.x) < maxDistance && Math.abs(start.coord.y - atom.coord.y) < maxDistance && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
            var middleCoord = start.coord.clone().add(atom.coord).multiplyScalar(0.5);

            if(!bHighlight) {
                if(bLines) {
                    var line = this.createSingleLine( start.coord, middleCoord, start.color, false);
                    this.mdl.add(line);
                    this.objects.push(line);
                    line = this.createSingleLine( middleCoord, atom.coord, atom.color, false);
                    this.mdl.add(line);
                    this.objects.push(line);
                }
                else {
                    this.createCylinder(start.coord, middleCoord, radius, start.color);
                    this.createCylinder(middleCoord, atom.coord, radius, atom.color);
                    this.createSphere(atom, radius, true, 1, bHighlight);
                }
            }
            else if(bHighlight === 1) {
                this.createCylinder(start.coord, middleCoord, radius, start.color, bHighlight);
                this.createCylinder(middleCoord, atom.coord, radius, atom.color, bHighlight);
                this.createSphere(atom, radius, true, 1, bHighlight);
            }
        }

        start = atom;
        currentChain = atom.chain;
        currentResi = atom.resi;

        if(bHighlight === 2) this.createBox(atom, undefined, undefined, undefined, undefined, bHighlight);
    }
    if (start !== null && currentChain === atom.chain && currentResi + 1 === atom.resi && Math.abs(start.coord.x - atom.coord.x) < maxDistance && Math.abs(start.coord.y - atom.coord.y) < maxDistance && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
//        if (start !== null && currentChain === atom.chain && Math.abs(start.coord.x - atom.coord.x) < maxDistance && Math.abs(start.coord.y - atom.coord.y) < maxDistance && Math.abs(start.coord.z - atom.coord.z) < maxDistance ) {
        var middleCoord = start.coord.add(atom.coord).multiplyScalar(0.5);
        if(!bHighlight) {
            if(bLines) {
                var line = this.createSingleLine( start.coord, middleCoord, start.color, false);
                this.mdl.add(line);
                this.objects.push(line);
                line = this.createSingleLine( middleCoord, atom.coord, atom.color, false);
                this.mdl.add(line);
                this.objects.push(line);
            }
            else {
                this.createCylinder(start.coord, middleCoord, radius, start.color);
                this.createCylinder(middleCoord, atom.coord, radius, atom.color);
            }
        }
        else if(bHighlight === 1) {
            this.createCylinder(start.coord, middleCoord, radius, start.color, bHighlight);
            this.createCylinder(middleCoord, atom.coord, radius, atom.color, bHighlight);
            this.createSphere(atom, radius, true, 1, bHighlight);
        }
    }
};
