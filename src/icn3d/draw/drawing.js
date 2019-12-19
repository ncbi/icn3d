/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSphere = function (atom, defaultRadius, forceDefault, scale, bHighlight) {
    var mesh;

    if(defaultRadius === undefined) defaultRadius = 0.8;
    if(forceDefault === undefined) forceDefault = false;
    if(scale === undefined) scale = 1.0;

    var radius = (this.vdwRadii[atom.elem.toUpperCase()] || defaultRadius);

    if(bHighlight === 2) {
      //if(scale > 0.9) { // sphere
      //  scale = 1.5;
      //}
      //else if(scale < 0.5) { // dot
      //  scale = 1.0;
      //}

      scale *= 1.5;

      var color = this.hColor;

      mesh = new THREE.Mesh(this.sphereGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

      mesh.scale.x = mesh.scale.y = mesh.scale.z = forceDefault ? defaultRadius :  radius * (scale ? scale : 1);
      mesh.position.copy(atom.coord);
      this.mdl.add(mesh);
    }
    else if(bHighlight === 1) {
      mesh = new THREE.Mesh(this.sphereGeometry, this.matShader);

      mesh.scale.x = mesh.scale.y = mesh.scale.z = forceDefault ? defaultRadius :  radius * (scale ? scale : 1);
      mesh.position.copy(atom.coord);
      mesh.renderOrder = this.renderOrderPicking;
      //this.mdlPicking.add(mesh);
      this.mdl.add(mesh);
    }
    else {
      if(atom.color === undefined) {
          atom.color = this.defaultAtomColor;
      }

      var color = atom.color;

      mesh = new THREE.Mesh(this.sphereGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
      mesh.scale.x = mesh.scale.y = mesh.scale.z = forceDefault ? defaultRadius :  radius * (scale ? scale : 1);
      mesh.position.copy(atom.coord);

      if(this.bImpo) {
          this.posArraySphere.push(atom.coord.x);
          this.posArraySphere.push(atom.coord.y);
          this.posArraySphere.push(atom.coord.z);

          this.colorArraySphere.push(atom.color.r);
          this.colorArraySphere.push(atom.color.g);
          this.colorArraySphere.push(atom.color.b);

          var realRadius = forceDefault ? defaultRadius :  radius * (scale ? scale : 1);
          this.radiusArraySphere.push(realRadius);

          if(this.cnt <= this.maxatomcnt) this.mdl_ghost.add(mesh);
      }
      else {
          this.mdl.add(mesh);
      }
    }

    //this.mdl.add(mesh);

    if(bHighlight === 1 || bHighlight === 2) {
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
            this.objects.push(mesh);
        }
    }
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinder = function (p0, p1, radius, color, bHighlight, color2, bPicking) {
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
        else {
          mesh = new THREE.Mesh(this.cylinderGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
        }

        mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
        mesh.matrixAutoUpdate = false;
        //mesh.lookAt(p0);
        mesh.lookAt(p1.clone().sub(p0));
        mesh.updateMatrix();

        mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius, p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

        if(this.bImpo) {
          this.posArray.push(p0.x);
          this.posArray.push(p0.y);
          this.posArray.push(p0.z);

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

// from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createRepresentationSub = function (atoms, f0, f01) {
    var me = this;

    //var ged = new THREE.Geometry();
    var clbondArray = [];
    for (var i in atoms) {
        var atom0 = atoms[i];
        f0 && f0(atom0);

        for (var j in atom0.bonds) {
            var atom1 = this.atoms[atom0.bonds[j]];
            if (atom1 === undefined || atom1.serial < atom0.serial) continue;
            if (atom1.chain === atom0.chain && ((atom1.resi === atom0.resi) || (atom0.name === 'C' && atom1.name === 'N') || (atom0.name === 'O3\'' && atom1.name === 'P') || (atom0.name === 'O3*' && atom1.name === 'P') || (atom0.name === 'SG' && atom1.name === 'SG'))) {
                f01 && f01(atom0, atom1);
            } else {
                //ged.vertices.push(atom0.coord);
                //ged.vertices.push(atom1.coord);
                clbondArray.push([atom0.coord, atom1.coord]);
            }
        }
    }

    //if (ged.vertices.length && this.bShowCrossResidueBond) {
    if (clbondArray.length > 0 && this.bShowCrossResidueBond) {
        //ged.computeLineDistances();
        //this.mdl.add(new THREE.Line(ged, new THREE.LineDashedMaterial({ linewidth: this.linewidth, color: this.defaultBondColor, dashSize: 0.3, gapSize: 0.15 }), THREE.LineSegments));
        var color = new THREE.Color(0x00FF00);

        for(var i = 0, il = clbondArray.length; i < il; ++i) {
            me.createCylinder(clbondArray[i][0], clbondArray[i][1], this.cylinderRadius, color, 0);
        }
    }
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSphereRepresentation = function (atoms, defaultRadius, forceDefault, scale, bHighlight) {
    var me = this;

    this.createRepresentationSub(atoms, function (atom0) {
        me.createSphere(atom0, defaultRadius, forceDefault, scale, bHighlight);
    });
};

iCn3D.prototype.createBoxRepresentation_P_CA = function (atoms, scale, bHighlight) {
    var me = this;
    this.createRepresentationSub(atoms, function (atom0) {
        if(atom0.name === 'CA' || atom0.name === "O3'" || atom0.name === "O3*") {
            me.createBox(atom0, undefined, undefined, scale, undefined, bHighlight);
        }
    });
};

iCn3D.prototype.createConnCalphSidechain = function (atoms, style) {
    // find all residues with style2 as 'nothing' or undefined
    var residueHash = {};
    for(var i in atoms) {
        var atom = atoms[i];
        if(!atom.het && atom.style2 === style) {
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residueHash[resid] = 1;
        }
    }

    var coordArray = [];
    var colorArray = [];
    for(var resid in residueHash) {
        var atom = this.getFirstCalphaAtomObj(this.residues[resid]);

        var sideAtom = undefined;
        for(var i = 0, il = atom.bonds.length; i < il; ++i) {
            var bondAtom = this.atoms[atom.bonds[i]];
            if(bondAtom.name !== 'C' && bondAtom.name !== 'N' && bondAtom.resi == atom.resi) {
                sideAtom = bondAtom;
                break;
            }
        }

        if(sideAtom !== undefined) {
            coordArray.push(atom.coord);
            coordArray.push(sideAtom.coord);

            colorArray.push(atom.color);
            colorArray.push(sideAtom.color);
        }
    }

    for(var i = 0, il = coordArray.length; i < il; i += 2) {
        if(style === 'ball and stick' || style === 'stick') {
            var radius = (style === 'stick') ? this.cylinderRadius : this.cylinderRadius * 0.5;
            this.createCylinder(coordArray[i], coordArray[i+1], radius, colorArray[i+1]);
        }
        else if(style === 'lines') {
            var line = this.createSingleLine(coordArray[i], coordArray[i+1], colorArray[i+1], false, 0.5);
            this.mdl.add(line);
        }
    }
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createStickRepresentation = function (atoms, atomR, bondR, scale, bHighlight, bSchematic) {
    var me = this;
    var factor = (bSchematic !== undefined && bSchematic) ? atomR / me.cylinderRadius : 1;

        this.createRepresentationSub(atoms, function (atom0) {
                me.createSphere(atom0, atomR, !scale, scale, bHighlight);
        }, function (atom0, atom1) {
            var mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
            var pair = atom0.serial + '_' + atom1.serial;

            if(me.doublebonds.hasOwnProperty(pair)) { // show double bond
                var a0, a1, a2;

                var v0;
                var random = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                if(atom0.bonds.length == 1 && atom1.bonds.length == 1) {
                    v0 = atom1.coord.clone();
                    v0.sub(atom0.coord);

                    var v = random.clone();
                    v0.cross(v).normalize().multiplyScalar(0.2 * factor);
                }
                else {
                    if(atom0.bonds.length >= atom1.bonds.length && atom0.bonds.length > 1) {
                        a0 = atom0.serial;
                        a1 = atom0.bonds[0];
                        a2 = atom0.bonds[1];
                    }
                    //else {
                    else if(atom1.bonds.length >= atom0.bonds.length && atom1.bonds.length > 1) {
                        a0 = atom1.serial;
                        a1 = atom1.bonds[0];
                        a2 = atom1.bonds[1];
                    }
                    else {
                        console.log("Double bond was not drawn due to the undefined cross plane");
                        return;
                    }

                    var v1 = me.atoms[a0].coord.clone();
                    v1.sub(me.atoms[a1].coord);
                    var v2 = me.atoms[a0].coord.clone();
                    v2.sub(me.atoms[a2].coord);

                    v1.cross(v2);

                    // parallel
                    if(parseInt(v1.length() * 10000) == 0) {
                        //v1 = random.clone();
                        // use a constant so that they are fixed,e.g., in CO2
                        v1 = new THREE.Vector3(0.2, 0.3, 0.5);
                    }

                    v0 = atom1.coord.clone();
                    v0.sub(atom0.coord);

                    v0.cross(v1).normalize().multiplyScalar(0.2 * factor);
                    // parallel
                    if(parseInt(v0.length() * 10000) == 0) {
                        //v1 = random.clone();
                        // use a constant so that they are fixed,e.g., in CO2
                        v1 = new THREE.Vector3(0.5, 0.3, 0.2);
                        v0.cross(v1).normalize().multiplyScalar(0.2 * factor);
                    }
                }

                if (atom0.color === atom1.color) {
                    if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                        me.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                        me.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                    }
                } else {
                    if(me.bImpo) {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight, atom1.color);
                            me.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight, atom1.color);
                        }
                    }
                    else {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord.clone().add(v0), mp.clone().add(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().add(v0), mp.clone().add(v0), me.cylinderRadius * factor * 0.3, atom1.color, bHighlight);

                            me.createCylinder(atom0.coord.clone().sub(v0), mp.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().sub(v0), mp.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                        }
                    }
                }
            }
            else if(me.aromaticbonds.hasOwnProperty(pair)) { // show aromatic bond
                var a0, a1, a2;
                if(atom0.bonds.length > atom1.bonds.length && atom0.bonds.length > 1) {
                    a0 = atom0.serial;
                    a1 = atom0.bonds[0];
                    a2 = atom0.bonds[1];
                }
                else if(atom1.bonds.length > 1) {
                    a0 = atom1.serial;
                    a1 = atom1.bonds[0];
                    a2 = atom1.bonds[1];
                }
                else {
                    return;
                }

                var v1 = me.atoms[a0].coord.clone();
                v1.sub(me.atoms[a1].coord);
                var v2 = me.atoms[a0].coord.clone();
                v2.sub(me.atoms[a2].coord);

                v1.cross(v2);

                var v0 = atom1.coord.clone();
                v0.sub(atom0.coord);

                v0.cross(v1).normalize().multiplyScalar(0.2 * factor);

                // find an aromatic neighbor
                var aromaticNeighbor = 0;
                for(var i = 0, il = atom0.bondOrder.length; i < il; ++i) {
                    if(atom0.bondOrder[i] === '1.5' && atom0.bonds[i] !== atom1.serial) {
                        aromaticNeighbor = atom0.bonds[i];
                    }
                }

                var dashed = "add";
                if(aromaticNeighbor === 0 ) { // no neighbor found, atom order does not matter
                    dashed = "add";
                }
                else {
                    // calculate the angle between atom1, atom0add, atomNeighbor and the angle atom1, atom0sub, atomNeighbor
                    var atom0add = atom0.coord.clone().add(v0);
                    var atom0sub = atom0.coord.clone().sub(v0);

                    var a = atom1.coord.clone().sub(atom0add).normalize();
                    var b = me.atoms[aromaticNeighbor].coord.clone().sub(atom0add).normalize();

                    var c = atom1.coord.clone().sub(atom0sub).normalize();
                    var d = me.atoms[aromaticNeighbor].coord.clone().sub(atom0sub).normalize();

                    var angleadd = Math.acos(a.dot(b));
                    var anglesub = Math.acos(c.dot(d));

                    if(angleadd < anglesub) {
                        dashed = 'sub';
                    }
                    else {
                        dashed = 'add';
                    }
                }

                if (atom0.color === atom1.color) {
                    var base, step;
                    if(dashed === 'add') {
                        me.createCylinder(atom0.coord.clone().sub(v0), atom1.coord.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);

                        base = atom0.coord.clone().add(v0);
                        step = atom1.coord.clone().add(v0).sub(base).multiplyScalar(1.0/11);
                    }
                    else {
                        me.createCylinder(atom0.coord.clone().add(v0), atom1.coord.clone().add(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);

                        base = atom0.coord.clone().sub(v0);
                        step = atom1.coord.clone().sub(v0).sub(base).multiplyScalar(1.0/11);
                    }

                    for(var i = 0; i <= 10; ++i) {
                        if(i % 2 == 0) {
                            var pos1 = base.clone().add(step.clone().multiplyScalar(i));
                            var pos2 = base.clone().add(step.clone().multiplyScalar(i + 1));
                            me.createCylinder(pos1, pos2, me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                        }
                    }

                } else {
                    var base, step;
                    if(dashed === 'add') {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord.clone().sub(v0), mp.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().sub(v0), mp.clone().sub(v0), me.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                        }

                        base = atom0.coord.clone().add(v0);
                        step = atom1.coord.clone().add(v0).sub(base).multiplyScalar(1.0/11);
                    }
                    else {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord.clone().add(v0), mp.clone().add(v0), me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().add(v0), mp.clone().add(v0), me.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                        }

                        base = atom0.coord.clone().sub(v0);
                        step = atom1.coord.clone().sub(v0).sub(base).multiplyScalar(1.0/11);
                    }

                    for(var i = 0; i <= 10; ++i) {
                        if(i % 2 == 0 && me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            var pos1 = base.clone().add(step.clone().multiplyScalar(i));
                            var pos2 = base.clone().add(step.clone().multiplyScalar(i + 1));
                            if(i < 5) {
                                me.createCylinder(pos1, pos2, me.cylinderRadius * factor * 0.3, atom0.color, bHighlight);
                            }
                            else {
                                me.createCylinder(pos1, pos2, me.cylinderRadius * factor * 0.3, atom1.color, bHighlight);
                            }
                        }
                    }
                }
            }
            else if(me.triplebonds.hasOwnProperty(pair)) { // show triple bond
                var random = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                var v = atom1.coord.clone();
                v.sub(atom0.coord);

                var c = random.clone();
                c.cross(v).normalize().multiplyScalar(0.3 * factor);

                if (atom0.color === atom1.color) {
                    if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                        me.createCylinder(atom0.coord, atom1.coord, me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                        me.createCylinder(atom0.coord.clone().add(c), atom1.coord.clone().add(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                        me.createCylinder(atom0.coord.clone().sub(c), atom1.coord.clone().sub(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                    }
                } else {
                    if(me.bImpo) {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord, atom1.coord, me.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                            me.createCylinder(atom0.coord.clone().add(c), atom1.coord.clone().add(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                            me.createCylinder(atom0.coord.clone().sub(c), atom1.coord.clone().sub(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight, atom1.color);
                        }
                    }
                    else {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord, mp, me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord, mp, me.cylinderRadius * factor * 0.2, atom1.color, bHighlight);

                            me.createCylinder(atom0.coord.clone().add(c), mp.clone().add(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().add(c), mp.clone().add(c), me.cylinderRadius * factor * 0.2, atom1.color, bHighlight);

                            me.createCylinder(atom0.coord.clone().sub(c), mp.clone().sub(c), me.cylinderRadius * factor * 0.2, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord.clone().sub(c), mp.clone().sub(c), me.cylinderRadius * factor * 0.2, atom1.color, bHighlight);
                        }
                    }
                }
            }
            else {
                if (atom0.color === atom1.color) {
                    me.createCylinder(atom0.coord, atom1.coord, bondR, atom0.color, bHighlight);
                } else {
                    if(me.bImpo) {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord, atom1.coord, bondR, atom0.color, bHighlight, atom1.color);
                        }
                    }
                    else {
                        if(me.dAtoms.hasOwnProperty(atom0.serial) && me.dAtoms.hasOwnProperty(atom1.serial)) {
                            me.createCylinder(atom0.coord, mp, bondR, atom0.color, bHighlight);
                            me.createCylinder(atom1.coord, mp, bondR, atom1.color, bHighlight);
                        }
                    }
                }
            }
        });
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createLineRepresentation = function (atoms, bHighlight) {
    var me = this;
    var geo = new THREE.Geometry();
    this.createRepresentationSub(atoms, undefined, function (atom0, atom1) {
        if (atom0.color === atom1.color) {
            geo.vertices.push(atom0.coord);
            geo.vertices.push(atom1.coord);
            geo.colors.push(atom0.color);
            geo.colors.push(atom1.color);
        } else {
            var mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
            geo.vertices.push(atom0.coord);
            geo.vertices.push(mp);
            geo.vertices.push(atom1.coord);
            geo.vertices.push(mp);
            geo.colors.push(atom0.color);
            geo.colors.push(atom0.color);
            geo.colors.push(atom1.color);
            geo.colors.push(atom1.color);
        }
    });

    if(bHighlight !== 2) {
        var line;
        if(bHighlight === 1) {
            // highlight didn't work for lines
            //line = new THREE.Mesh(geo, this.matShader);
        }
        else {
            //line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: this.linewidth, vertexColors: true }), THREE.LineSegments);
            line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ linewidth: this.linewidth, vertexColors: true }));
            this.mdl.add(line);
        }

        if(bHighlight === 1) {
            this.prevHighlightObjects.push(line);
        }
        else {
            this.objects.push(line);
        }
    }
    else if(bHighlight === 2) {
        this.createBoxRepresentation_P_CA(atoms, 0.8, bHighlight);
    }
};

/*
// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
// Catmull–Rom subdivision
iCn3D.prototype.subdivide = function (_pnts, _clrs, DIV, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes) {
    var ret = [];
    var pos = [];
    var color = [];

    var pnts = new Array(); // Smoothing test

    var prevoneLen = (prevone !== undefined) ? prevone.length : 0;
    var nexttwoLenOri = (nexttwo !== undefined) ? nexttwo.length : 0;

    if(prevoneLen > 0) pnts.push(prevone[0]);

    pnts.push(_pnts[0]);
    for (var i = 1, lim = _pnts.length - 1; i < lim; ++i) {
        var p0 = _pnts[i], p1 = _pnts[i + 1];
        pnts.push(p0.smoothen ? p0.clone().add(p1).multiplyScalar(0.5) : p0);
    }
    pnts.push(_pnts[_pnts.length - 1]);

    if(nexttwoLenOri > 0) pnts.push(nexttwo[0]);
    if(nexttwoLenOri > 1) pnts.push(nexttwo[1]);

    var savedPoints = [];
    var savedPos = [];
    var savedColor = [];

    var nexttwoLen = nexttwoLenOri;
    if(bExtendLastRes) {
        nexttwoLen = (nexttwoLenOri > 0) ? nexttwoLenOri - 1 : 0;
    }

    for (var i = -1, size = pnts.length, DIVINV = 1 / DIV; i <= size - 3; ++i) {
        var newI = i - prevoneLen;
        var p0 = pnts[i === -1 ? 0 : i];
        var p1 = pnts[i + 1];
        var p2 = pnts[i + 2];
        var p3 = pnts[i === size - 3 ? size - 1 : i + 3];
        var v0 = p2.clone().sub(p0).multiplyScalar(0.5);
        var v1 = p3.clone().sub(p1).multiplyScalar(0.5);

        //if(i > -1 && bHighlight && bShowArray !== undefined && bShowArray[i + 1]) {
        if(i > -1 && (bShowArray === undefined || bShowArray[newI + 1]) ) {
            // get from previous i for the first half of residue
            if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                ret = ret.concat(savedPoints);
                pos = pos.concat(savedPos);
                color = color.concat(savedColor);
            }
        }

        savedPoints = [];
        savedPos = [];
        savedColor = [];

        for (var j = 0; j < DIV; ++j) {
            var t = DIVINV * j;
            var x = p1.x + t * v0.x
                     + t * t * (-3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x)
                     + t * t * t * (2 * p1.x - 2 * p2.x + v0.x + v1.x);
            var y = p1.y + t * v0.y
                     + t * t * (-3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y)
                     + t * t * t * (2 * p1.y - 2 * p2.y + v0.y + v1.y);
            var z = p1.z + t * v0.z
                     + t * t * (-3 * p1.z + 3 * p2.z - 2 * v0.z - v1.z)
                     + t * t * t * (2 * p1.z - 2 * p2.z + v0.z + v1.z);

            if(!bShowArray) {
                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                    ret.push(new THREE.Vector3(x, y, z));
                    pos.push(newI + 1);
                    color.push(_clrs[newI+1]);
                }
            }
            else {
                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                    if(bShowArray[newI + 1]) {
                        if(j <= parseInt((DIV) / 2) ) {
                            ret.push(new THREE.Vector3(x, y, z));
                            pos.push(bShowArray[newI + 1]);
                            color.push(_clrs[newI+1]);
                        }
                    }
                }

                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                    if(bShowArray[newI + 2]) {
                        if(j > parseInt((DIV) / 2) ) {
                            savedPoints.push(new THREE.Vector3(x, y, z));
                            savedPos.push(bShowArray[newI + 2]);
                            savedColor.push(_clrs[newI+2]);
                        }
                    }
                }
            } // end else

        } // end for (var j = 0;
    } // end for (var i = -1;

    if(!bShowArray || bShowArray[newI + 1]) {
        //if(bHighlight) {
        ret = ret.concat(savedPoints);
        pos = pos.concat(savedPos);
        color = color.concat(savedColor);
        //}

        ret.push(pnts[pnts.length - 1 - nexttwoLen]);
        pos.push(pnts.length - 1 - nexttwoLen);
        color.push(_clrs[pnts.length - 1 - nexttwoLen]);
    }

    savedPoints = [];
    savedPos = [];
    savedColor = [];
    pnts = [];

    var pnts_positions = [];

    pnts_positions.push(ret);
    pnts_positions.push(pos);
    pnts_positions.push(color);

    return pnts_positions;
};
*/

iCn3D.prototype.getKnot = function (alpha, ti, Pi, Pj) {
    var alpha = 1;

    //return Math.pow(Pi.distanceTo(Pj), alpha) + ti;
    return Pi.distanceTo(Pj) + ti;
}

iCn3D.prototype.getValueFromKnot = function (t, t0, t1, t2, t3, y0, y1, y2, y3) {
    var inf = 9999;

    // m(i) = ( t(i+1) - t(i) == 0 ) ? 0 : ( y(i+1) - y(i) ) / ( t(i+1) - t(i) )
    var m0 = (y1 - y0) / (t1 - t0);
    var m1 = (y2 - y1) / (t2 - t1);
    var m2 = (y3 - y2) / (t3 - t2);

    // L(i) = m(i) * (t - t(i)) + y(i)
    //var L0 = m0 * (t - t0) + y0;
    var L1 = m1 * (t - t1) + y1;
    //var L2 = m2 * (t - t2) + y2;

    var denom = (t1 + t2) * (t1 + t2) - 4*(t0*t1 + t2*t3 - t0*t3);
    var d0 = 0;
    var d3 = 0;
    var d1, d2;

    if(denom == 0) {
        d1 = inf;
        d2 = inf;
    }
    else {
        d1 = 6 * (3*m1*t1 + 2*m0*t3 + m2*t1 - 2*m0*t1 - 2*m1*t3 - m1*t2 - m2*t1) / denom;
        d2 = 6 * (3*m1*t2 + 2*m2*t0 + m0*t1 - 2*m1*t0 - 2*m2*t2 - m0*t2 - m1*t1) / denom;
    }

    // a(i) = ( 2*d(i) + d(i+1) ) / 6 / (t(i) - t(i+1))
    // b(i) = ( 2*d(i+1) + d(i) ) / 6 / (t(i+1) - t(i))
    //var a0 = ( 2*d0 + d1 ) / 6 / (t0 - t1);
    var a1 = ( 2*d1 + d2 ) / 6 / (t1 - t2);
    //var a2 = ( 2*d2 + d3 ) / 6 / (t2 - t3);

    //var b0 = ( 2*d1 + d0 ) / 6 / (t1 - t0);
    var b1 = ( 2*d2 + d1 ) / 6 / (t2 - t1);
    //var b2 = ( 2*d3 + d2 ) / 6 / (t3 - t2);

    // C(i) = a(i)*(t - t(i))*(t - t(i+1))*(t - t(i+1)) + b(i)*(t - t(i))*(t - t(i))*(t - t(i+1))
    //var C0 = a0*(t - t0)*(t - t1)*(t - t1) + b0*(t - t0)*(t - t0)*(t - t1);
    var C1 = a1*(t - t1)*(t - t2)*(t - t2) + b1*(t - t1)*(t - t1)*(t - t2);
    //var C2 = a2*(t - t2)*(t - t3)*(t - t3) + b2*(t - t2)*(t - t2)*(t - t3);

    var F1 = L1 + C1;

    return F1;
}

// cubic splines for four points: http://thalestriangles.blogspot.com/2014/02/a-bit-of-ex-spline-ation.html
// https://math.stackexchange.com/questions/577641/how-to-calculate-interpolating-splines-in-3d-space
iCn3D.prototype.subdivide = function (_pnts, _clrs, DIV, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes) {
    var ret = [];
    var pos = [];
    var color = [];

    var pnts = new Array(); // Smoothing test

    var prevoneLen = (prevone !== undefined) ? prevone.length : 0;
    var nexttwoLenOri = (nexttwo !== undefined) ? nexttwo.length : 0;

    if(prevoneLen > 0) pnts.push(prevone[0]);

    pnts.push(_pnts[0]);
    for (var i = 1, lim = _pnts.length - 1; i < lim; ++i) {
        var p0 = _pnts[i], p1 = _pnts[i + 1];
        pnts.push(p0.smoothen ? p0.clone().add(p1).multiplyScalar(0.5) : p0);
    }
    pnts.push(_pnts[_pnts.length - 1]);

    if(nexttwoLenOri > 0) pnts.push(nexttwo[0]);
    if(nexttwoLenOri > 1) pnts.push(nexttwo[1]);

    var savedPoints = [];
    var savedPos = [];
    var savedColor = [];

    var nexttwoLen = nexttwoLenOri;
    if(bExtendLastRes) {
        nexttwoLen = (nexttwoLenOri > 0) ? nexttwoLenOri - 1 : 0;
    }

    var alpha = 1;

    for (var i = -1, size = pnts.length, DIVINV = 1 / DIV; i <= size - 3; ++i) {
        var newI = i - prevoneLen;
        var p0 = pnts[i === -1 ? 0 : i];
        var p1 = pnts[i + 1];
        var p2 = pnts[i + 2];
        var p3 = pnts[i === size - 3 ? size - 1 : i + 3];

        var t0 = 0;
        var t1 = this.getKnot(alpha, t0, p0, p1);
        var t2 = this.getKnot(alpha, t1, p1, p2);
        var t3 = this.getKnot(alpha, t2, p2, p3);

        if(t1 - t0 < 1e-4) t1 = t0 + 1;
        if(t2 - t1 < 1e-4) t2 = t1 + 1;
        if(t3 - t2 < 1e-4) t3 = t2 + 1;

        //if(i > -1 && bHighlight && bShowArray !== undefined && bShowArray[i + 1]) {
        if(i > -1 && (bShowArray === undefined || bShowArray[newI + 1]) ) {
            // get from previous i for the first half of residue
            if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                ret = ret.concat(savedPoints);
                pos = pos.concat(savedPos);
                color = color.concat(savedColor);
            }
        }

        savedPoints = [];
        savedPos = [];
        savedColor = [];

        var step = (t2 - t1) * DIVINV;
        for (var j = 0; j < DIV; ++j) {
            var t = t1 + step * j;
            var x = this.getValueFromKnot(t, t0, t1, t2, t3, p0.x, p1.x, p2.x, p3.x);
            var y = this.getValueFromKnot(t, t0, t1, t2, t3, p0.y, p1.y, p2.y, p3.y);
            var z = this.getValueFromKnot(t, t0, t1, t2, t3, p0.z, p1.z, p2.z, p3.z);

            if(!bShowArray) {
                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                    ret.push(new THREE.Vector3(x, y, z));
                    pos.push(newI + 1);
                    color.push(_clrs[newI+1]);
                }
            }
            else {
                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                    if(bShowArray[newI + 1]) {
                        if(j <= parseInt((DIV) / 2) ) {
                            ret.push(new THREE.Vector3(x, y, z));
                            pos.push(bShowArray[newI + 1]);
                            color.push(_clrs[newI+1]);
                        }
                    }
                }

                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                    if(bShowArray[newI + 2]) {
                        if(j > parseInt((DIV) / 2) ) {
                            savedPoints.push(new THREE.Vector3(x, y, z));
                            savedPos.push(bShowArray[newI + 2]);
                            savedColor.push(_clrs[newI+2]);
                        }
                    }
                }
            } // end else

        } // end for (var j = 0;
    } // end for (var i = -1;

    if(!bShowArray || bShowArray[newI + 1]) {
        //if(bHighlight) {
        ret = ret.concat(savedPoints);
        pos = pos.concat(savedPos);
        color = color.concat(savedColor);
        //}

        ret.push(pnts[pnts.length - 1 - nexttwoLen]);
        pos.push(pnts.length - 1 - nexttwoLen);
        color.push(_clrs[pnts.length - 1 - nexttwoLen]);
    }

    savedPoints = [];
    savedPos = [];
    savedColor = [];
    pnts = [];

    var pnts_positions = [];

    pnts_positions.push(ret);
    pnts_positions.push(pos);
    pnts_positions.push(color);

    return pnts_positions;
};

iCn3D.prototype.createCurveSubArrow = function (p, width, colors, div, bHighlight, bRibbon, num, positionIndex, pntsCA, prevCOArray, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) {
    var divPoints = [], positions = [];

    divPoints.push(p);
    positions.push(positionIndex);

    this.prepareStrand(divPoints, positions, width, colors, div, undefined, bHighlight, bRibbon, num, pntsCA, prevCOArray, false, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo);

    divPoints = [];
    positions = [];
};

iCn3D.prototype.setCalphaDrawnCoord = function (pnts, div, calphaIdArray) {
    var index = 0;

    if(calphaIdArray !== undefined) {
        for(var i = 0, il = pnts.length; i < il; i += div) { // pnts.length = (calphaIdArray.length - 1) * div + 1
            var serial = calphaIdArray[index];

            if(this.atoms.hasOwnProperty(serial)) {
                this.atoms[serial].coord2 = pnts[i].clone();
            }

            ++index;
        }
    }
};


// modified from iview (http://star.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCurveSub = function (_pnts, width, colors, div, bHighlight, bRibbon, bNoSmoothen, bShowArray, calphaIdArray, positions, prevone, nexttwo) {
    if (_pnts.length === 0) return;
    div = div || 5;
    var pnts;
    if(!bNoSmoothen) {
        var bExtendLastRes = true;
        var pnts_clrs = this.subdivide(_pnts, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
        pnts = pnts_clrs[0];
        colors = pnts_clrs[2];
    }
    else {
        pnts = _pnts;
    }
    if (pnts.length === 0) return;

    this.setCalphaDrawnCoord(pnts, div, calphaIdArray);

    if(bHighlight === 1) {
        var radius = this.coilWidth / 2;
        //var radiusSegments = 8;
        var radiusSegments = 4; // save memory
        var closed = false;

        if(pnts.length > 1) {
            if(positions !== undefined) {
                var currPos, prevPos;
                var currPoints = [];
                for(var i = 0, il = pnts.length; i < il; ++i) {
                    currPos = positions[i];

                    if( (currPos !== prevPos && currPos !== prevPos + 1 && prevPos !== undefined) || (i === il -1) ) {
                        // first tube
                        var geometry0 = new THREE.TubeGeometry(
                            new THREE.CatmullRomCurve3(currPoints), // path
                            currPoints.length, // segments
                            radius,
                            radiusSegments,
                            closed
                        );

                        mesh = new THREE.Mesh(geometry0, this.matShader);
                        mesh.renderOrder = this.renderOrderPicking;
                        //this.mdlPicking.add(mesh);
                        this.mdl.add(mesh);

                        this.prevHighlightObjects.push(mesh);

                        geometry0 = null;

                        currPoints = [];
                    }

                    currPoints.push(pnts[i]);

                    prevPos = currPos;
                }

                currPoints = [];
            }
            else {
                var geometry0 = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(pnts), // path
                    pnts.length, // segments
                    radius,
                    radiusSegments,
                    closed
                );

                mesh = new THREE.Mesh(geometry0, this.matShader);
                mesh.renderOrder = this.renderOrderPicking;
                //this.mdlPicking.add(mesh);
                this.mdl.add(mesh);

                this.prevHighlightObjects.push(mesh);

                geometry0 = null;
            }
        }
    }
    else {
        var geo = new THREE.Geometry();

        if(bHighlight === 2 && bRibbon) {
            for (var i = 0, divInv = 1 / div; i < pnts.length; ++i) {
                // shift the highlight a little bit to avoid the overlap with ribbon
                pnts[i].addScalar(0.6); // this.ribbonthickness is 0.4
                geo.vertices.push(pnts[i]);
                //geo.colors.push(new THREE.Color(colors[i === 0 ? 0 : Math.round((i - 1) * divInv)]));
                geo.colors.push(new THREE.Color(colors[i]));
            }
        }
        else {
            for (var i = 0, divInv = 1 / div; i < pnts.length; ++i) {
                geo.vertices.push(pnts[i]);
                //geo.colors.push(new THREE.Color(colors[i === 0 ? 0 : Math.round((i - 1) * divInv)]));
                geo.colors.push(new THREE.Color(colors[i]));
            }
        }

        //var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: width, vertexColors: true }), THREE.LineStrip);
        var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: width, vertexColors: true }));
        this.mdl.add(line);
        if(bHighlight === 2) {
            this.prevHighlightObjects.push(line);
        }
        else {
            this.objects.push(line);
        }
    }

    pnts = null;
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinderCurve = function (atoms, atomNameArray, radius, bLines, bHighlight) {
    var start = null;
    var currentChain, currentResi;
    var i;
    var pnts = [], colors = [], radii = [];

    var maxDistance = 8.0; // max residue-residue (or nucleitide-nucleitide) distance allowed

    for (i in atoms) {
        var atom = atoms[i];
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

iCn3D.prototype.prepareStrand = function(divPoints, positions, width, colors, div, thickness, bHighlight, bRibbon, num, pntsCA, prevCOArray, bStrip, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) {
    if(pntsCA.length === 1) {
        return;
    }

    var colorsLastTwo = [];
    colorsLastTwo.push(colors[colors.length - 2]);
    colorsLastTwo.push(colors[colors.length - 1]);

    div = div || this.axisDIV;
    var numM1Inv2 = 2 / (num - 1);
    var delta, lastCAIndex, lastPrevCOIndex, v;

    var pnts = {}, colorsTmp = [];
    for(var i = 0, il = positions.length; i < il; ++i) pnts[i] = [];

    // smooth C-alpha
    var pnts_clrs = this.subdivide(pntsCA, colors, div, undefined, undefined, prevone, nexttwo);
    var pntsCASmooth = pnts_clrs[0]; // get all smoothen pnts, do not use 'bShowArray'
    //colors = pnts_clrs[2];

    if(pntsCASmooth.length === 1) {
        return;
    }

    // draw the sheet without the last residue
    // use the sheet coord for n-2 residues
    var colorsTmp = [];
    var lastIndex = (bShowArrow === undefined || bShowArrow) ? pntsCA.length - 2 : pntsCA.length;

    for (var i = 0, il = lastIndex; i < il; ++i) {
        for(var index = 0, indexl = positions.length; index < indexl; ++index) {
            pnts[index].push(divPoints[index][i]);
        }
        colorsTmp.push(colors[i]);
    }
    colorsTmp.push(colors[i]);

    if(bShowArrow === undefined || bShowArrow) {
        // assign the sheet coord from C-alpha for the 2nd to the last residue of the sheet
        for(var i = 0, il = positions.length; i < il; ++i) {
            delta = -1 + numM1Inv2 * positions[i];
            lastCAIndex = pntsCASmooth.length - 1 - div;
            lastPrevCOIndex = pntsCA.length - 2;
            v = new THREE.Vector3(pntsCASmooth[lastCAIndex].x + prevCOArray[lastPrevCOIndex].x * delta, pntsCASmooth[lastCAIndex].y + prevCOArray[lastPrevCOIndex].y * delta, pntsCASmooth[lastCAIndex].z + prevCOArray[lastPrevCOIndex].z * delta);
            pnts[i].push(v);
        }
    }

    var posIndex = [];
    var results;
    for(var i = 0, il = positions.length; i < il; ++i) {
        results = this.subdivide(pnts[i], colorsTmp, div, bShowArray, bHighlight);
        pnts[i] = results[0];
        colors = results[2];
        if(i === 0) {
            posIndex = results[1];
        }
    }

    if(bStrip) {
        this.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight, true, undefined, calphaIdArray, posIndex, prevone, nexttwo);
    }
    else {
        this.createCurveSub(pnts[0], width, colors, div, bHighlight, bRibbon, true, undefined, calphaIdArray, posIndex, prevone, nexttwo);
    }

    if(bShowArrow === undefined || bShowArrow) {
        // draw the arrow
        colorsTmp = [];

        posIndex = [];
        for(var index = 0, indexl = positions.length; index < indexl; ++index) {
            pnts[index] = [];

            for (var i = div * (pntsCA.length - 2), il = div * (pntsCA.length - 1); bShowArray[parseInt(i/div)] && i < il; i = i + div) {
                var pos = parseInt(i/div);
                for (var j = 0; j < div; ++j) {
                    var delta = -1 + numM1Inv2 * positions[index];
                    var scale = 1.8; // scale of the arrow width
                    delta = delta * scale * (div - j) / div;
                    var oriIndex = parseInt(i/div);

                    var v = new THREE.Vector3(pntsCASmooth[i+j].x + prevCOArray[oriIndex].x * delta, pntsCASmooth[i+j].y + prevCOArray[oriIndex].y * delta, pntsCASmooth[i+j].z + prevCOArray[oriIndex].z * delta);
                    v.smoothen = true;
                    pnts[index].push(v);
                    colorsTmp.push(colorsLastTwo[0]);
                    if(index === 0) posIndex.push(pos);
                }
            }

            // last residue
            // make the arrow end with 0
            var delta = 0;
            var lastCAIndex = pntsCASmooth.length - 1;
            var lastPrevCOIndex = pntsCA.length - 1;

            //if(bShowArray[lastPrevCOIndex]) {
                var v = new THREE.Vector3(pntsCASmooth[lastCAIndex].x + prevCOArray[lastPrevCOIndex].x * delta, pntsCASmooth[lastCAIndex].y + prevCOArray[lastPrevCOIndex].y * delta, pntsCASmooth[lastCAIndex].z + prevCOArray[lastPrevCOIndex].z * delta);
                v.smoothen = true;
                pnts[index].push(v);
                colorsTmp.push(colorsLastTwo[1]);
                if(index === 0) posIndex.push(lastCAIndex);
            //}
        }

        pntsCASmooth = [];

        //colorsTmp.push(colors[colors.length - 2]);
        //colorsTmp.push(colors[colors.length - 1]);

        if(bStrip) {
            this.createStrip(pnts[0], pnts[1], colorsTmp, div, thickness, bHighlight, true, undefined, undefined, posIndex, prevone, nexttwo);
        }
        else {
            this.createCurveSub(pnts[0], width, colorsTmp, div, bHighlight, bRibbon, true, undefined, undefined, posIndex, prevone, nexttwo);
        }
    }

    for(var i in pnts) {
        for(var j = 0, jl = pnts[i].length; j < jl; ++j) {
            pnts[i][j] = null;
        }
        pnts[i] = [];
    }

    pnts = {};
};

iCn3D.prototype.createStripArrow = function (p0, p1, colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) {
    var divPoints = [], positions = [];

    divPoints.push(p0);
    divPoints.push(p1);
    positions.push(start);
    positions.push(end);

    this.prepareStrand(divPoints, positions, undefined, colors, div, thickness, bHighlight, undefined, num, pntsCA, prevCOArray, true, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo);

    divPoints = [];
    positions = [];
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createStrip = function (p0, p1, colors, div, thickness, bHighlight, bNoSmoothen, bShowArray, calphaIdArray, positions, prevone, nexttwo) {
    if (p0.length < 2) return;
    div = div || this.axisDIV;
    if(!bNoSmoothen) {
        var bExtendLastRes = true;
        var pnts_clrs0 = this.subdivide(p0, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
        var pnts_clrs1 = this.subdivide(p1, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
        p0 = pnts_clrs0[0];
        p1 = pnts_clrs1[0];
        colors = pnts_clrs0[2];
    }
    if (p0.length < 2) return;

    this.setCalphaDrawnCoord(p0, div, calphaIdArray);

    if(bHighlight === 1) {
        //mesh = new THREE.Mesh(geo, this.matShader);

        var radius = this.coilWidth / 2;
        //var radiusSegments = 8;
        var radiusSegments = 4; // save memory
        var closed = false;

        if(positions !== undefined) {
            var currPos, prevPos;
            var currP0 = [], currP1 = [];

            for(var i = 0, il = p0.length; i < il; ++i) {
                currPos = positions[i];

                if((currPos !== prevPos && currPos !== prevPos + 1 && prevPos !== undefined) || (i === il -1) ) {
                    // first tube
                    var geometry0 = new THREE.TubeGeometry(
                        new THREE.CatmullRomCurve3(currP0), // path
                        currP0.length, // segments
                        radius,
                        radiusSegments,
                        closed
                    );

                    mesh = new THREE.Mesh(geometry0, this.matShader);
                    mesh.renderOrder = this.renderOrderPicking;
                    //this.mdlPicking.add(mesh);
                    this.mdl.add(mesh);

                    this.prevHighlightObjects.push(mesh);

                    geometry0 = null;

                    // second tube
                    var geometry1 = new THREE.TubeGeometry(
                        new THREE.CatmullRomCurve3(currP1), // path
                        currP1.length, // segments
                        radius,
                        radiusSegments,
                        closed
                    );

                    mesh = new THREE.Mesh(geometry1, this.matShader);
                    mesh.renderOrder = this.renderOrderPicking;
                    //this.mdlPicking.add(mesh);
                    this.mdl.add(mesh);

                    this.prevHighlightObjects.push(mesh);

                    geometry1 = null;

                    currP0 = [];
                    currP1 = [];
                }

                currP0.push(p0[i]);
                currP1.push(p1[i]);

                prevPos = currPos;
            }

            currP0 = [];
            currP1 = [];
        }
        else {
            // first tube
            var geometry0 = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(p0), // path
                p0.length, // segments
                radius,
                radiusSegments,
                closed
            );

            mesh = new THREE.Mesh(geometry0, this.matShader);
            mesh.renderOrder = this.renderOrderPicking;
            //this.mdlPicking.add(mesh);
            this.mdl.add(mesh);

            this.prevHighlightObjects.push(mesh);

            geometry0 = null;

            // second tube
            var geometry1 = new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(p1), // path
                p1.length, // segments
                radius,
                radiusSegments,
                closed
            );

            mesh = new THREE.Mesh(geometry1, this.matShader);
            mesh.renderOrder = this.renderOrderPicking;
            //this.mdlPicking.add(mesh);
            this.mdl.add(mesh);

            this.prevHighlightObjects.push(mesh);

            geometry1 = null;
        }
    }
    else {
        var geo = new THREE.Geometry();
        var vs = geo.vertices, fs = geo.faces;
        var axis, p0v, p1v, a0v, a1v;
        for (var i = 0, lim = p0.length; i < lim; ++i) {
            vs.push(p0v = p0[i]); // 0
            vs.push(p0v); // 1
            vs.push(p1v = p1[i]); // 2
            vs.push(p1v); // 3
            if (i < lim - 1) {
                axis = p1[i].clone().sub(p0[i]).cross(p0[i + 1].clone().sub(p0[i])).normalize().multiplyScalar(thickness);
            }
            vs.push(a0v = p0[i].clone().add(axis)); // 4
            vs.push(a0v); // 5
            vs.push(a1v = p1[i].clone().add(axis)); // 6
            vs.push(a1v); // 7
        }
        var faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];

        for (var i = 1, lim = p0.length, divInv = 1 / div; i < lim; ++i) {
            var offset = 8 * i;
            //var color = new THREE.Color(colors[Math.round((i - 1) * divInv)]);
            var color = new THREE.Color(colors[i - 1]);
            for (var j = 0; j < 4; ++j) {
                fs.push(new THREE.Face3(offset + faces[j][0], offset + faces[j][1], offset + faces[j][2], undefined, color));
                fs.push(new THREE.Face3(offset + faces[j][3], offset + faces[j][0], offset + faces[j][2], undefined, color));
            }
        }
        var vsize = vs.length - 8; // Cap
        for (var i = 0; i < 4; ++i) {
            vs.push(vs[i * 2]);
            vs.push(vs[vsize + i * 2]);
        };
        vsize += 8;
        fs.push(new THREE.Face3(vsize, vsize + 2, vsize + 6, undefined, fs[0].color));
        fs.push(new THREE.Face3(vsize + 4, vsize, vsize + 6, undefined, fs[0].color));
        fs.push(new THREE.Face3(vsize + 1, vsize + 5, vsize + 7, undefined, fs[fs.length - 3].color));
        fs.push(new THREE.Face3(vsize + 3, vsize + 1, vsize + 7, undefined, fs[fs.length - 3].color));
        geo.computeFaceNormals();
        geo.computeVertexNormals(false);

        var mesh;

        if(bHighlight === 2) {
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

          this.mdl.add(mesh);
          this.prevHighlightObjects.push(mesh);
        }
        else {
          mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

          this.mdl.add(mesh);
          this.objects.push(mesh);
        }
    }

    p0 = null;
    p1 = null;
};

iCn3D.prototype.getSSExpandedAtoms = function (atoms) {
    var currChain, currResi, currAtom, prevChain, prevResi, prevAtom;
    var firstAtom, lastAtom;
    var index = 0, length = Object.keys(atoms).length;

    var atomsAdjust = this.cloneHash(atoms);
    for(var serial in atoms) {
      currChain = atoms[serial].structure + '_' + atoms[serial].chain;
      currResi = parseInt(atoms[serial].resi);
      currAtom = atoms[serial];

      if(prevChain === undefined) firstAtom = atoms[serial];

      if( (currChain !== prevChain && prevChain !== undefined) || (currResi !== prevResi && currResi !== prevResi + 1 && prevResi !== undefined) || index === length - 1) {
        if( (currChain !== prevChain && prevChain !== undefined) || (currResi !== prevResi && currResi !== prevResi + 1 && prevResi !== undefined) ) {
            lastAtom = prevAtom;
        }
        else if(index === length - 1) {
            lastAtom = currAtom;
        }

        // fill the beginning
        var beginResi = firstAtom.resi;
        if(firstAtom.ss !== 'coil' && !(firstAtom.ssbegin) ) {
            for(var i = firstAtom.resi - 1; i > 0; --i) {
                var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                if(!this.residues.hasOwnProperty(residueid)) break;

                var atom = this.getFirstCalphaAtomObj(this.residues[residueid]);

                if(atom.ss === firstAtom.ss && atom.ssbegin) {
                    beginResi = atom.resi;
                    break;
                }
            }

            for(var i = beginResi; i < firstAtom.resi; ++i) {
                var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                atomsAdjust = this.unionHash(atomsAdjust, this.hash2Atoms(this.residues[residueid]));
            }
        }

        // add one extra residue for coils between strands/helix
        if(this.pk === 3 && bHighlight === 1 && firstAtom.ss === 'coil') {
                var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + (firstAtom.resi - 1);
                if(this.residues.hasOwnProperty(residueid)) {
                    atomsAdjust = this.unionHash(atomsAdjust, this.hash2Atoms(this.residues[residueid]));
                    atoms = this.unionHash(atoms, this.hash2Atoms(this.residues[residueid]));
                }
        }

        // fill the end
        var endResi = lastAtom.resi;
        // when a coil connects to a sheet and the last residue of coil is highlighted, the first sheet residue is set as atom.notshow. This residue should not be shown.

        if(lastAtom.ss !== undefined && lastAtom.ss !== 'coil' && !(lastAtom.ssend) && !(lastAtom.notshow)) {

            var endChainResi = this.getLastAtomObj(this.chains[lastAtom.structure + '_' + lastAtom.chain]).resi;
            for(var i = lastAtom.resi + 1; i <= endChainResi; ++i) {
                var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
                if(!this.residues.hasOwnProperty(residueid)) break;

                var atom = this.getFirstCalphaAtomObj(this.residues[residueid]);

                if(atom.ss === lastAtom.ss && atom.ssend) {
                    endResi = atom.resi;
                    break;
                }
            }

            for(var i = lastAtom.resi + 1; i <= endResi; ++i) {
                var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
                atomsAdjust = this.unionHash(atomsAdjust, this.hash2Atoms(this.residues[residueid]));
            }
        }

        // add one extra residue for coils between strands/helix
        if(this.pk === 3 && bHighlight === 1 && lastAtom.ss === 'coil') {
                var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + (lastAtom.resi + 1);
                if(this.residues.hasOwnProperty(residueid)) {
                    atomsAdjust = this.unionHash(atomsAdjust, this.hash2Atoms(this.residues[residueid]));
                    atoms = this.unionHash(atoms, this.hash2Atoms(this.residues[residueid]));
                }
        }

        // reset notshow
        if(lastAtom.notshow) lastAtom.notshow = undefined;

        firstAtom = currAtom;
      }

      prevChain = currChain;
      prevResi = currResi;
      prevAtom = currAtom;

      ++index;
    }

    return atomsAdjust;
};

// significantly modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createStrand = function (atoms, num, div, fill, coilWidth, helixSheetWidth, doNotSmoothen, thickness, bHighlight) {
    var bRibbon = fill ? true: false;

    // when highlight, the input atoms may only include part of sheet or helix
    // include the whole sheet or helix when highlighting
    var atomsAdjust = {};

    //if( (bHighlight === 1 || bHighlight === 2) && !this.bAllAtoms) {
    if( !this.bAllAtoms) {
        atomsAdjust = this.getSSExpandedAtoms(atoms);
    }
    else {
        atomsAdjust = atoms;
    }

    if(bHighlight === 2) {
        if(fill) {
            fill = false;
            num = null;
            div = null;
            coilWidth = null;
            helixSheetWidth = null;
            thickness = undefined;
        }
        else {
            fill = true;
            num = 2;
            div = undefined;
            coilWidth = undefined;
            helixSheetWidth = undefined;
            thickness = this.ribbonthickness;
        }
    }

    num = num || this.strandDIV;
    div = div || this.axisDIV;
    coilWidth = coilWidth || this.coilWidth;
    doNotSmoothen = doNotSmoothen || false;
    helixSheetWidth = helixSheetWidth || this.helixSheetWidth;
    var pnts = {}; for (var k = 0; k < num; ++k) pnts[k] = [];
    var pntsCA = [];
    var prevCOArray = [];
    var bShowArray = [];
    var calphaIdArray = []; // used to store one of the final positions drawn in 3D
    var colors = [];
    var currentChain, currentResi, currentCA = null, currentO = null, currentColor = null, prevCoorCA = null, prevCoorO = null, prevColor = null;
    var prevCO = null, ss = null, ssend = false, atomid = null, prevAtomid = null, prevResi = null, calphaid = null, prevCalphaid = null;
    var strandWidth, bSheetSegment = false, bHelixSegment = false, bSheetEnd = false;
    var atom, tubeAtoms = {};

    // test the first 30 atoms to see whether only C-alpha is available
    this.bCalphaOnly = this.isCalphaPhosOnly(atomsAdjust); //, 'CA');

    // when highlight, draw whole beta sheet and use bShowArray to show the highlight part
    var residueHash = {};
    for(var i in atomsAdjust) {
        var atom = atomsAdjust[i];

        residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        residueHash[residueid] = 1;
    }
    var totalResidueCount = Object.keys(residueHash).length;

    var drawnResidueCount = 0;
    var highlightResiduesCount = 0;

    var bFullAtom = (Object.keys(this.hAtoms).length == Object.keys(this.atoms).length) ? true : false;

    var caArray = []; // record all C-alpha atoms to predict the helix

    for (var i in atomsAdjust) {
        atom = atomsAdjust[i];
        var atomOxygen = undefined;
        if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
                // "CA" has to appear before "O"

                if (atom.name === 'CA') {
                    if ( atoms.hasOwnProperty(i) && ((atom.ss !== 'helix' && atom.ss !== 'sheet') || atom.ssend || atom.ssbegin) ) {
                        tubeAtoms[i] = atom;
                    }

                    currentCA = atom.coord;
                    currentColor = atom.color;
                    calphaid = atom.serial;

                    caArray.push(atom.serial);
                }

                if (atom.name === 'O' || (this.bCalphaOnly && atom.name === 'CA')) {
                    if(currentCA === null || currentCA === undefined) {
                        currentCA = atom.coord;
                        currentColor = atom.color;
                        calphaid = atom.serial;
                    }

                    if(atom.name === 'O') {
                        currentO = atom.coord;
                    }
                    // smoothen each coil, helix and sheet separately. The joint residue has to be included both in the previous and next segment
                    var bSameChain = true;
//                    if (currentChain !== atom.chain || currentResi + 1 !== atom.resi) {
                    if (currentChain !== atom.chain) {
                        bSameChain = false;
                    }

                    // assign the previous residue
                    if(prevCoorO) {
                        if(bHighlight === 1 || bHighlight === 2) {
                            colors.push(this.hColor);
                        }
                        else {
                            colors.push(prevColor);
                        }

                        if(ss !== 'coil' && atom.ss === 'coil') {
                            strandWidth = coilWidth;
                        }
                        else if(ssend && atom.ssbegin) { // a transition between two ss
                            strandWidth = coilWidth;
                        }
                        else {
                            strandWidth = (ss === 'coil') ? coilWidth : helixSheetWidth;
                        }

                        var O, oldCA, resSpan = 4;
                        if(atom.name === 'O') {
                            O = prevCoorO.clone();
                            if(prevCoorCA !== null && prevCoorCA !== undefined) {
                                O.sub(prevCoorCA);
                            }
                            else {
                                prevCoorCA = prevCoorO.clone();
                                if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                    O = prevCoorCA.clone();
                                    oldCA = this.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
                                    O.sub(oldCA);
                                }
                                else {
                                    O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                                }
                            }
                        }
                        else if(this.bCalphaOnly && atom.name === 'CA') {
                            if(caArray.length > resSpan + 1) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                O = prevCoorCA.clone();
                                oldCA = this.atoms[caArray[caArray.length - 1 - resSpan - 1]].coord.clone();
                                O.sub(oldCA);
                            }
                            else {
                                O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                            }
                        }

                        O.normalize(); // can be omitted for performance
                        O.multiplyScalar(strandWidth);
                        if (prevCO !== null && O.dot(prevCO) < 0) O.negate();
                        prevCO = O;

                        for (var j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
                            var delta = -1 + numM1Inv2 * j;
                            var v = new THREE.Vector3(prevCoorCA.x + prevCO.x * delta, prevCoorCA.y + prevCO.y * delta, prevCoorCA.z + prevCO.z * delta);
                            if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
                            pnts[j].push(v);
                        }

                        pntsCA.push(prevCoorCA);
                        prevCOArray.push(prevCO);

                        if(atoms.hasOwnProperty(prevAtomid)) {
                            bShowArray.push(prevResi);
                            calphaIdArray.push(prevCalphaid);

                            ++highlightResiduesCount;
                        }
                        else {
                            bShowArray.push(0);
                            calphaIdArray.push(0);
                        }

                        ++drawnResidueCount;
                    }

                    //if(atom.ssend && atom.ss === 'sheet') {
                    if(atom.ss === 'sheet') {
                        bSheetSegment = true;
                    }
                    //else if(atom.ssend && atom.ss === 'helix') {
                    else if(atom.ss === 'helix') {
                        bHelixSegment = true;
                    }

                    if(atom.ssend) {
                        bSheetEnd = true;
                    }

                    var maxDist = 6.0;
                    var bBrokenSs = (prevCoorCA && Math.abs(currentCA.x - prevCoorCA.x) > maxDist) || (prevCoorCA && Math.abs(currentCA.y - prevCoorCA.y) > maxDist) || (prevCoorCA && Math.abs(currentCA.z - prevCoorCA.z) > maxDist);

                    if ((atom.ssbegin || atom.ssend || (drawnResidueCount === totalResidueCount - 1) || bBrokenSs) && pnts[0].length > 0 && bSameChain) {
                        var atomName = 'CA';

                        var prevone = [], nexttwo = [];

                        var lastAtom = (bBrokenSs) ? this.atoms[prevAtomid] : atom; // bBrokenSs: skip the current residue

                        var prevoneResid = lastAtom.structure + '_' + lastAtom.chain + '_' + (lastAtom.resi - 1).toString();
                        var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                        prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                        var nextoneResid = lastAtom.structure + '_' + lastAtom.chain + '_' + (lastAtom.resi + 1).toString();
                        var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
                        if(nextoneCoord !== undefined) {
                            nexttwo.push(nextoneCoord);
                        }

                        var nexttwoResid = lastAtom.structure + '_' + lastAtom.chain + '_' + (lastAtom.resi + 2).toString();
                        var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
                        if(nexttwoCoord !== undefined) {
                            nexttwo.push(nexttwoCoord);
                        }

                        //if(atom.ssend && atom.ss === 'sheet') {
                        if(lastAtom.ss === 'sheet') {
                            bSheetSegment = true;
                        }
                        //else if(atom.ssend && atom.ss === 'helix') {
                        else if(lastAtom.ss === 'helix') {
                            bHelixSegment = true;
                        }

                        if(lastAtom.ssend) {
                            bSheetEnd = true;
                        }

                        if(!bBrokenSs) { // include the current residue
                            // assign the current joint residue to the previous segment
                            if(bHighlight === 1 || bHighlight === 2) {
                                colors.push(this.hColor);
                            }
                            else {
                                //colors.push(atom.color);
                                colors.push(prevColor);
                            }

                            if(atom.ssend && atom.ss === 'sheet') { // current residue is the end of ss and is the end of arrow
                                strandWidth = 0; // make the arrow end sharp
                            }
                            else if(ss === 'coil' && atom.ssbegin) {
                                strandWidth = coilWidth;
                            }
                            else if(ssend && atom.ssbegin) { // current residue is the start of ss and  the previous residue is the end of ss, then use coil
                                strandWidth = coilWidth;
                            }
                            else { // use the ss from the previous residue
                                strandWidth = (atom.ss === 'coil') ? coilWidth : helixSheetWidth;
                            }

                            var O, oldCA, resSpan = 4;
                            if(atom.name === 'O') {
                                O = currentO.clone();
                                O.sub(currentCA);
                            }
                            else if(this.bCalphaOnly && atom.name === 'CA') {
                                if(caArray.length > resSpan) { // use the calpha and the previous 4th c-alpha to calculate the helix direction
                                    O = currentCA.clone();
                                    oldCA = this.atoms[caArray[caArray.length - 1 - resSpan]].coord.clone();
                                    O.sub(oldCA);
                                }
                                else {
                                    O = new THREE.Vector3(Math.random(),Math.random(),Math.random());
                                }
                            }

                            O.normalize(); // can be omitted for performance
                            O.multiplyScalar(strandWidth);
                            if (prevCO !== null && O.dot(prevCO) < 0) O.negate();
                            prevCO = O;

                            for (var j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
                                var delta = -1 + numM1Inv2 * j;
                                var v = new THREE.Vector3(currentCA.x + prevCO.x * delta, currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
                                if (!doNotSmoothen && ss === 'sheet') v.smoothen = true;
                                pnts[j].push(v);
                            }

                            atomid = atom.serial;

                            pntsCA.push(currentCA);
                            prevCOArray.push(prevCO);

                            // when a coil connects to a sheet and the last residue of coild is highlighted, the first sheet residue is set as atom.highlightStyle. This residue should not be shown.
                            //if(atoms.hasOwnProperty(atomid) && (bHighlight === 1 && !atom.notshow) ) {
                            if(atoms.hasOwnProperty(atomid)) {
                                bShowArray.push(atom.resi);
                                calphaIdArray.push(calphaid);
                            }
                            else {
                                bShowArray.push(0);
                                calphaIdArray.push(0);
                            }
                        }

                        // draw the current segment
                        for (var j = 0; !fill && j < num; ++j) {
                            if(bSheetSegment) {
                                if(bSheetEnd) {
                                    this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                                }
                                else {
                                    this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                            }
                            else if(bHelixSegment) {
                                this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                        }
                        if (fill) {
                            if(bSheetSegment) {
                                var start = 0, end = num - 1;
                                if(bSheetEnd) {
                                    this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                                }
                                else {
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                            }
                            else if(bHelixSegment) {
                                this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                            else {
                                if(bHighlight === 2) { // draw coils only when highlighted. if not highlighted, coils will be drawn as tubes separately
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                            }
                        }

                        for (var k = 0; k < num; ++k) pnts[k] = [];

                        colors = [];
                        pntsCA = [];
                        prevCOArray = [];
                        bShowArray = [];
                        calphaIdArray = [];
                        bSheetSegment = false;
                        bHelixSegment = false;
                        bSheetEnd = false;
                    } // end if (atom.ssbegin || atom.ssend)

                    // end of a chain
//                    if ((currentChain !== atom.chain || currentResi + 1 !== atom.resi) && pnts[0].length > 0) {
                    if ((currentChain !== atom.chain) && pnts[0].length > 0) {

                        var atomName = 'CA';

                        var prevoneResid = this.atoms[prevAtomid].structure + '_' + this.atoms[prevAtomid].chain + '_' + (this.atoms[prevAtomid].resi - 1).toString();
                        var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                        var prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                        var nexttwo = [];

                        for (var j = 0; !fill && j < num; ++j) {
                            if(bSheetSegment) {
                                if(bSheetEnd) {
                                    this.createCurveSubArrow(pnts[j], 1, colors, div, bHighlight, bRibbon, num, j, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                                }
                                else {
                                    this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                            }
                            else if(bHelixSegment) {
                                this.createCurveSub(pnts[j], 1, colors, div, bHighlight, bRibbon, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                        }
                        if (fill) {
                            if(bSheetSegment) {
                                var start = 0, end = num - 1;
                                if(bSheetEnd) {
                                    this.createStripArrow(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, num, start, end, pntsCA, prevCOArray, bShowArray, calphaIdArray, true, prevone, nexttwo);
                                }
                                else {
                                    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                                }
                            }
                            else if(bHelixSegment) {
                                this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight, false, bShowArray, calphaIdArray, undefined, prevone, nexttwo);
                            }
                        }

                        for (var k = 0; k < num; ++k) pnts[k] = [];
                        colors = [];
                        pntsCA = [];
                        prevCOArray = [];
                        bShowArray = [];
                        calphaIdArray = [];
                        bSheetSegment = false;
                        bHelixSegment = false;
                        bSheetEnd = false;
                    }

                    currentChain = atom.chain;
                    currentResi = atom.resi;
                    ss = atom.ss;
                    ssend = atom.ssend;
                    prevAtomid = atom.serial;
                    prevResi = atom.resi;

                    prevCalphaid = calphaid;

                    // only update when atom.name === 'O'
                    prevCoorCA = currentCA;
                    prevCoorO = atom.coord;
                    prevColor = currentColor;
                } // end if (atom.name === 'O' || (this.bCalphaOnly && atom.name === 'CA') ) {
        } // end if ((atom.name === 'O' || atom.name === 'CA') && !atom.het) {
    } // end for

    caArray = [];

    this.createTube(tubeAtoms, 'CA', coilWidth, bHighlight);

    tubeAtoms = {};
    pnts = {};
};

/*
iCn3D.prototype.createStrandBrick = function (brick, color, thickness, bHighlight) {
    var num = this.strandDIV;
    var div = this.axisDIV;
    var doNotSmoothen = false;
    var helixSheetWidth = this.helixSheetWidth;

    if(bHighlight === 2) {
        thickness *= 1.5;
        helixSheetWidth *= 1.5;
    }

    var pnts = {}; for (var k = 0; k < num; ++k) pnts[k] = [];
    var colors = [];
    var prevCO = null, ss = null;
    for (var i = 0; i < 2; ++i) {
        var currentCA = brick.coords[i];

        colors.push(new THREE.Color(color));

        var O = new THREE.Vector3(brick.coords[2].x, brick.coords[2].y, brick.coords[2].z);
        O.normalize();

        O.multiplyScalar(helixSheetWidth);
        if (prevCO !== null && O.dot(prevCO) < 0) O.negate();
        prevCO = O;
        for (var j = 0, numM1Inv2 = 2 / (num - 1); j < num; ++j) {
            var delta = -1 + numM1Inv2 * j;
            var v = new THREE.Vector3(currentCA.x + prevCO.x * delta, currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
            if (!doNotSmoothen) v.smoothen = true;
            pnts[j].push(v);
        }
    }
    this.createStrip(pnts[0], pnts[num - 1], colors, div, thickness, bHighlight);
};
*/

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createTubeSub = function (_pnts, colors, radii, bHighlight, prevone, nexttwo) {
    if (_pnts.length < 2) return;
    var circleDiv = this.tubeDIV, axisDiv = this.axisDIV;
    var circleDivInv = 1 / circleDiv, axisDivInv = 1 / axisDiv;
    var geo = new THREE.Geometry();
    var pnts_clrs = this.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo);

    var pnts = pnts_clrs[0];
    colors = pnts_clrs[2];

    var prevAxis1 = new THREE.Vector3(), prevAxis2;
    for (var i = 0, lim = pnts.length; i < lim; ++i) {
        var r, idx = (i - 1) * axisDivInv;
        if (i === 0) r = radii[0];
        else {
            if (idx % 1 === 0) r = radii[idx];
            else {
                var floored = Math.floor(idx);
                var tmp = idx - floored;
                r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
            }
        }
        var delta, axis1, axis2;
        if (i < lim - 1) {
            delta = pnts[i].clone().sub(pnts[i + 1]);
            axis1 = new THREE.Vector3(0, -delta.z, delta.y).normalize().multiplyScalar(r);
            axis2 = delta.clone().cross(axis1).normalize().multiplyScalar(r);
            //      var dir = 1, offset = 0;
            if (prevAxis1.dot(axis1) < 0) {
                axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
            }
            prevAxis1 = axis1; prevAxis2 = axis2;
        } else {
            axis1 = prevAxis1; axis2 = prevAxis2;
        }
        for (var j = 0; j < circleDiv; ++j) {
            var angle = 2 * Math.PI * circleDivInv * j; //* dir  + offset;
            geo.vertices.push(pnts[i].clone().add(axis1.clone().multiplyScalar(Math.cos(angle))).add(axis2.clone().multiplyScalar(Math.sin(angle))));
        }
    }
    var offset = 0;
    for (var i = 0, lim = pnts.length - 1; i < lim; ++i) {
        //var c = new THREE.Color(colors[Math.round((i - 1) * axisDivInv)]);
        var c = new THREE.Color(colors[i]);

        var reg = 0;
        var r1 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv]).lengthSq();
        var r2 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv + 1]).lengthSq();
        if (r1 > r2) { r1 = r2; reg = 1; };
        for (var j = 0; j < circleDiv; ++j) {
            geo.faces.push(new THREE.Face3(offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv, undefined, c));
            geo.faces.push(new THREE.Face3(offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv, undefined, c));
        }
        offset += circleDiv;
    }
    geo.computeFaceNormals();
    geo.computeVertexNormals(false);

    var mesh;
    if(bHighlight === 2) {
      mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
      this.mdl.add(mesh);
    }
    else if(bHighlight === 1) {
      mesh = new THREE.Mesh(geo, this.matShader);
      mesh.renderOrder = this.renderOrderPicking;
      //this.mdlPicking.add(mesh);
      this.mdl.add(mesh);
    }
    else {
      mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));
      this.mdl.add(mesh);
    }

    if(bHighlight === 1 || bHighlight === 2) {
        this.prevHighlightObjects.push(mesh);
    }
    else {
        this.objects.push(mesh);
    }
};

iCn3D.prototype.getAtomFromResi = function (resid, atomName) {
    if(this.residues.hasOwnProperty(resid)) {
        for(var i in this.residues[resid]) {
            if(this.atoms[i].name === atomName && !this.atoms[i].het) {
                return this.atoms[i];
            }
        }
    }

    return undefined;
};

iCn3D.prototype.getAtomCoordFromResi = function (resid, atomName) {
    var atom = this.getAtomFromResi(resid, atomName);
    if(atom !== undefined) {
        var coord = (atom.coord2 !== undefined) ? atom.coord2 : atom.coord;

        return coord;
    }

    return undefined;
};

iCn3D.prototype.getRadius = function (radius, atom) {
    var radiusFinal = radius;
    if(radius) {
        radiusFinal = radius;
    }
    else {
        if(atom.b > 0 && atom.b <= 100) {
            radiusFinal = atom.b * 0.01;
        }
        else if(atom.b > 100) {
            radiusFinal = 100 * 0.01;
        }
        else {
            radiusFinal = this.coilWidth;
        }
    }

    return radiusFinal;
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createTube = function (atoms, atomName, radius, bHighlight) {
    var pnts = [], colors = [], radii = [], prevone = [], nexttwo = [];
    var currentChain, currentResi;
    var index = 0;
    var prevAtom;
    var maxDist = 6.0;
    var maxDist2 = 3.0; // avoid tube between the residues in 3 residue helix

    var pnts_colors_radii_prevone_nexttwo = [];
    var firstAtom, atom;

    for (var i in atoms) {
        atom = atoms[i];
        if ((atom.name === atomName) && !atom.het) {
            if(index == 0) {
                firstAtom = atom;
            }

            //if (index > 0 && (currentChain !== atom.chain || currentResi + 1 !== atom.resi || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist) ) {
            if (index > 0 && (currentChain !== atom.chain || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist
              || (currentResi + 1 !== atom.resi && (Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist2 || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist2 || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist2) )
              ) ) {
                if(bHighlight !== 2) {
                    var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (firstAtom.resi - 1).toString();
                    var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                    prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                    var nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 1).toString();
                    var nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 2).toString();

                    if(this.residues.hasOwnProperty(nextoneResid)) {
                        var nextAtom = this.getAtomFromResi(nextoneResid, atomName);
                        if(nextAtom !== undefined && nextAtom.ssbegin) { // include the residue
                            nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 2).toString();
                            nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 3).toString();

                            pnts.push(nextAtom.coord);
                            radii.push(this.getRadius(radius, nextAtom));
                            colors.push(nextAtom.color);
                        }
                    }

                    var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
                    if(nextoneCoord !== undefined) {
                        nexttwo.push(nextoneCoord);
                    }

                    var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
                    if(nexttwoCoord !== undefined) {
                        nexttwo.push(nexttwoCoord);
                    }

                    pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
                }
                pnts = []; colors = []; radii = []; prevone = []; nexttwo = [];
                firstAtom = atom;
                index = 0;
            }
            if(pnts.length == 0) {
                var prevoneResid = atom.structure + '_' + atom.chain + '_' + (atom.resi - 1).toString();
                if(this.residues.hasOwnProperty(prevoneResid)) {
                    var prevAtom = this.getAtomFromResi(prevoneResid, atomName);
                    if(prevAtom !== undefined && prevAtom.ssend) { // include the residue
                        pnts.push(prevAtom.coord);
                        radii.push(this.getRadius(radius, prevAtom));
                        colors.push(prevAtom.color);
                    }
                }
            }
            pnts.push(atom.coord);

            var radiusFinal = this.getRadius(radius, atom);

            //radii.push(radius || (atom.b > 0 ? atom.b * 0.01 : this.coilWidth));
            radii.push(radiusFinal);

            colors.push(atom.color);
            // the starting residue of a coil uses the color from the next residue to avoid using the color of the last helix/sheet residue
            if(index === 1) colors[colors.length - 2] = atom.color;

            currentChain = atom.chain;
            currentResi = atom.resi;

            var scale = 1.2;
            if(bHighlight === 2 && !atom.ssbegin) {
                this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
            }

            ++index;

            prevAtom = atom;
        }
    }
    if(bHighlight !== 2) {
        //this.createTubeSub(pnts, colors, radii, bHighlight);

        prevone = [];
        if(firstAtom !== undefined) {
            var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (firstAtom.resi - 1).toString();
            var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
            prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];
        }

        nexttwo = [];
        if(atom !== undefined) {
            var nextoneResid = atom.structure + '_' + atom.chain + '_' + (atom.resi + 1).toString();
            var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
            if(nextoneCoord !== undefined) {
                nexttwo.push(nextoneCoord);
            }

            var nexttwoResid = atom.structure + '_' + atom.chain + '_' + (atom.resi + 2).toString();
            var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
            if(nexttwoCoord !== undefined) {
                nexttwo.push(nexttwoCoord);
            }
        }

        pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
    }

    for(var i = 0, il = pnts_colors_radii_prevone_nexttwo.length; i < il; ++i) {
        var pnts = pnts_colors_radii_prevone_nexttwo[i].pnts;
        var colors = pnts_colors_radii_prevone_nexttwo[i].colors;
        var radii = pnts_colors_radii_prevone_nexttwo[i].radii;
        var prevone = pnts_colors_radii_prevone_nexttwo[i].prevone;
        var nexttwo = pnts_colors_radii_prevone_nexttwo[i].nexttwo;

        this.createTubeSub(pnts, colors, radii, bHighlight, prevone, nexttwo);
    }

    pnts_colors_radii_prevone_nexttwo = [];
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCylinderHelix = function (atoms, radius, bHighlight) {
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

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawNucleicAcidStick = function(atomlist, bHighlight) {
   var currentChain, currentResi, start = null, end = null;
   var i;

   for (i in atomlist) {
      var atom = atomlist[i];
      if (atom === undefined || atom.het) continue;

      if (atom.resi !== currentResi || atom.chain !== currentChain) {
         if (start !== null && end !== null) {
            this.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                              new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), this.cylinderRadius, start.color, bHighlight);
         }
         start = null; end = null;
      }
      if (atom.name === 'O3\'' || atom.name === 'O3*') start = atom;
      if (atom.resn === '  A' || atom.resn === '  G' || atom.resn === ' DA' || atom.resn === ' DG') {
         if (atom.name === 'N1')  end = atom; //  N1(AG), N3(CTU)
      } else if (atom.name === 'N3') {
         end = atom;
      }
      currentResi = atom.resi; currentChain = atom.chain;
   }
   if (start !== null && end !== null)
      this.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                        new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), this.cylinderRadius, start.color, bHighlight);
};

//iCn3D.prototype.isCalphaPhosOnly = function(atomlist, atomname1, atomname2) {
iCn3D.prototype.isCalphaPhosOnly = function(atomlist) {
      var bCalphaPhosOnly = false;

      var index = 0, testLength = 50; //30
      //var bOtherAtoms = false;
      var nOtherAtoms = 0;
      for(var i in atomlist) {
        if(index < testLength) {
          if(atomlist[i].name !== "CA" && atomlist[i].name !== "P" && atomlist[i].name !== "O3'" && atomlist[i].name !== "O3*") {
            //bOtherAtoms = true;
            //break;
            ++nOtherAtoms;
          }
        }
        else {
          break;
        }

        ++index;
      }

      //if(!bOtherAtoms) {
      if(nOtherAtoms < 0.5 * index) {
        bCalphaPhosOnly = true;
      }

      return bCalphaPhosOnly;
};

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawCartoonNucleicAcid = function(atomlist, div, thickness, bHighlight) {
   this.drawStrandNucleicAcid(atomlist, 2, div, true, undefined, thickness, bHighlight);
};

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawStrandNucleicAcid = function(atomlist, num, div, fill, nucleicAcidWidth, thickness, bHighlight) {
   if(bHighlight === 2) {
       num = undefined;
       thickness = undefined;
   }

   nucleicAcidWidth = nucleicAcidWidth || this.nucleicAcidWidth;
   div = div || this.axisDIV;
   num = num || this.nucleicAcidStrandDIV;
   var i, j, k;
   var pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
   var colors = [];
   var currentChain, currentResi, currentO3;
   var prevOO = null;

   for (i in atomlist) {
      var atom = atomlist[i];
      if (atom === undefined) continue;

      if ((atom.name === 'O3\'' || atom.name === 'OP2' || atom.name === 'O3*' || atom.name === 'O2P') && !atom.het) {
         if (atom.name === 'O3\'' || atom.name === 'O3*') { // to connect 3' end. FIXME: better way to do?
            if (currentChain !== atom.chain || currentResi + 1 !== atom.resi) {
//            if (currentChain !== atom.chain) {
               if (currentO3 && prevOO) {
                  for (j = 0; j < num; j++) {
                     var delta = -1 + 2 / (num - 1) * j;
                     pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                      currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
                  }
               }
               if (fill) this.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
               for (j = 0; !thickness && j < num; j++)
                  this.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
               var pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
               colors = [];
               prevOO = null;
            }
            currentO3 = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
            currentChain = atom.chain;
            currentResi = atom.resi;
            if(bHighlight === 1 || bHighlight === 2) {
                colors.push(this.hColor);
            }
            else {
                colors.push(atom.color);
            }

         }
         else if (atom.name === 'OP2' || atom.name === 'O2P') {
            if (!currentO3) {prevOO = null; continue;} // for 5' phosphate (e.g. 3QX3)
            var O = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
            O.sub(currentO3);
            O.normalize().multiplyScalar(nucleicAcidWidth);  // TODO: refactor
            //if (prevOO !== undefined && O.dot(prevOO) < 0) {
            if (prevOO !== null && O.dot(prevOO) < 0) {
               O.negate();
            }
            prevOO = O;
            for (j = 0; j < num; j++) {
               var delta = -1 + 2 / (num - 1) * j;
               pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                 currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
            }
            currentO3 = null;
         }
      }
   }

   if (currentO3 && prevOO) {
      for (j = 0; j < num; j++) {
         var delta = -1 + 2 / (num - 1) * j;
         pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
           currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
      }
   }
   if (fill) this.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
   for (j = 0; !thickness && j < num; j++)
      this.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
};

iCn3D.prototype.createSingleLine = function ( src, dst, colorHex, dashed, dashSize ) {
    var geom = new THREE.Geometry();
    var mat;

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: dashSize, gapSize: 0.5*dashSize });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src );
    geom.vertices.push( dst );
    if(dashed) geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    //var axis = new THREE.Line( geom, mat, THREE.LineSegments );
    var axis = new THREE.LineSegments( geom, mat );

    return axis;
};

// used for highlight
iCn3D.prototype.createBox = function (atom, defaultRadius, forceDefault, scale, color, bHighlight) {
    var mesh;

    if(defaultRadius === undefined) defaultRadius = 0.8;
    if(forceDefault === undefined) forceDefault = false;
    if(scale === undefined) scale = 0.8;

    if(bHighlight) {
        if(color === undefined) color = this.hColor;

          mesh = new THREE.Mesh(this.boxGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
    }
    else {
        if(color === undefined) color = atom.color;

          mesh = new THREE.Mesh(this.boxGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
    }

    mesh.scale.x = mesh.scale.y = mesh.scale.z = forceDefault ? defaultRadius : (this.vdwRadii[atom.elem.toUpperCase()] || defaultRadius) * (scale ? scale : 1);

    mesh.position.copy(atom.coord);
    this.mdl.add(mesh);

    if(bHighlight) {
        this.prevHighlightObjects.push(mesh);
    }
    else {
        this.objects.push(mesh);
    }
};

// modified from 3Dmol (http://3dmol.csb.pitt.edu/)
// new: http://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
// old: http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
iCn3D.prototype.makeTextSprite = function ( message, parameters ) {

    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;

    var a = parameters.hasOwnProperty("alpha") ? parameters["alpha"] : 1.0;

    var bBkgd = true;
    var bSchematic = false;
    if(parameters.hasOwnProperty("bSchematic") &&  parameters["bSchematic"]) {
        bSchematic = true;

        fontsize = 40;
    }

    var backgroundColor, borderColor, borderThickness;
    if(parameters.hasOwnProperty("backgroundColor") &&  parameters["backgroundColor"] !== undefined) {
        backgroundColor = this.hexToRgb(parameters["backgroundColor"], a);

        borderColor = parameters.hasOwnProperty("borderColor") ? this.hexToRgb(parameters["borderColor"], a) : { r:0, g:0, b:0, a:1.0 };
        borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    }
    else {
        bBkgd = false;
        backgroundColor = undefined;
        borderColor = undefined;
        borderThickness = 0;
    }

    var textAlpha = 1.0;
    var textColor = parameters.hasOwnProperty("textColor") &&  parameters["textColor"] !== undefined ? this.hexToRgb(parameters["textColor"], textAlpha) : { r:255, g:255, b:0, a:1.0 };

    var canvas = document.createElement('canvas');

    var context = canvas.getContext('2d');

    context.font = "Bold " + fontsize + "px " + fontface;

    var metrics = context.measureText( message );

    var textWidth = metrics.width;

    var width = textWidth + 2*borderThickness;
    var height = fontsize + 2*borderThickness;

    if(bSchematic) {
        if(width > height) {
            height = width;
        }
        else {
            width = height;
        }
    }

    // var factor = (bSchematic) ? 3 * this.oriMaxD / 100 : 3 * this.oriMaxD / 100;
    // var factor = (bSchematic) ? 3 * this.maxD / 100 : 3 * this.maxD / 100;
    var factor = 3 * this.oriMaxD / 100 * this.labelScale;

    var expandWidthFactor = 0.8 * textWidth / height;

/*
    // define width and height will make long text be squashed, but make the label to appear at the exact location
    if(bSchematic || message.length <= textLengthThreshold) {
        canvas.width = width;
        canvas.height = height;

        factor = 3 * this.oriMaxD / 100;
    }
*/

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);

    //var radius = context.measureText( "M" ).width;

    if(bBkgd) {
        // background color
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;

        if(bSchematic) {
            var r = width * 0.35;
            this.circle(context, 0, 0, width, height, r);
        }
        else {
            //var r = (message.length <= textLengthThreshold) ? height * 0.5 : 0;
            //var r = height * 0.8;
            var r = 0;
            this.roundRect(context, 0, 0, width, height, r);
        }
    }

    // need to redefine again
    context.font = "Bold " + fontsize + "px " + fontface;

    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
    context.strokeStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";

    context.fillText( message, width * 0.5, height * 0.5);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var frontOfTarget = true;
    //var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
    var spriteMaterial = new THREE.SpriteMaterial( {
        map: texture,
        //useScreenCoordinates: false,
        depthTest: !frontOfTarget,
        depthWrite: !frontOfTarget
    } );

    //https://stackoverflow.com/questions/29421702/threejs-texture
    spriteMaterial.map.minFilter = THREE.LinearFilter;

    var sprite = new THREE.Sprite( spriteMaterial );

    if(bSchematic) {
        sprite.scale.set(factor, factor, 1.0);
    }
    else {
        sprite.scale.set(expandWidthFactor * factor, factor, 1.0);
    }

    return sprite;
};

// function for drawing rounded rectangles
iCn3D.prototype.roundRect = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

iCn3D.prototype.circle = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.arc(x+w/2, y+h/2, r, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createLabelRepresentation = function (labels) {
//    var tmpMaxD = this.maxD;

    for(var name in labels) {
        var labelArray = (labels[name] !== undefined) ? labels[name] : [];

        for (var i = 0, il = labelArray.length; i < il; ++i) {
            var label = labelArray[i];
            // make sure fontsize is a number

            if(label.size == 0) label.size = undefined;
            if(label.color == 0) label.color = undefined;
            if(label.background == 0) label.background = undefined;

            var labelsize = (label.size !== undefined) ? label.size : this.LABELSIZE;
            var labelcolor = (label.color !== undefined) ? label.color : '#ffff00';
            var labelbackground = (label.background !== undefined) ? label.background : '#cccccc';
            var labelalpha = (label.alpha !== undefined) ? label.alpha : 1.0;
            // if label.background is undefined, no background will be drawn
            labelbackground = label.background;

            if(labelcolor !== undefined && labelbackground !== undefined && labelcolor.toLowerCase() === labelbackground.toLowerCase()) {
                labelcolor = "#888888";
            }

            // somehow the transformation is not stable when reset camera
/*
            var bChemicalInProteinOrTrace = false;
            var bStick = false;
            if(Object.keys(this.proteins).length + Object.keys(this.nucleotides).length > 0) {
                var firstAtom = this.getFirstAtomObj(this.hAtoms);
                if(firstAtom !== undefined) {
                    if(this.chemicals.hasOwnProperty(firstAtom.serial)
                      || firstAtom.style == 'c alpha trace' || firstAtom.style == 'o3 trace'
                      //|| firstAtom.style == 'schematic'
                      ) {
                        bChemicalInProteinOrTrace = true;
                    }

                    if(firstAtom.style == 'stick' || firstAtom.style == 'ball and stick') {
                        bStick = true;
                    }
                }
            }

            if(bChemicalInProteinOrTrace) {
                this.maxD = 15; // 50
                this.setCamera();
            }
            else if(bStick) {
                this.maxD = 30; // 50
                this.setCamera();
            }
            else {
                if(Object.keys(this.proteins).length + Object.keys(this.nucleotides).length > 0) {
                    this.maxD = 100;
                    this.setCamera();
                }
                else {
                    this.maxD = 15;
                    this.setCamera();
                }
            }
*/

            var bb;
            if(label.bSchematic !== undefined && label.bSchematic) {

                bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1});
            }
            else {
                if(label.text.length === 1) {
                    bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1});
                }
                else {
                    bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 0});
                }
            }

            bb.position.set(label.position.x, label.position.y, label.position.z);
            this.mdl.add(bb);
            // do not add labels to objects for pk
        }
    }

    // somehow the transformation is not stable when reset camera
//    this.maxD = tmpMaxD;
//    this.setCamera();
};
