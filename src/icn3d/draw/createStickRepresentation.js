/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createStickRepresentation = function (atoms, atomR, bondR, scale, bHighlight, bSchematic) { var me = this, ic = me.icn3d; "use strict";
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
