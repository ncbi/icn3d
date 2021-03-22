/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createRepresentationSub = function (atoms, f0, f01) { var me = this, ic = me.icn3d; "use strict";
    var clbondArray = [];
    var resiAtoms = {};
    for (var i in atoms) {
        var atom0 = atoms[i];
        f0 && f0(atom0);

        for (var j in atom0.bonds) {
            var atom1 = this.atoms[atom0.bonds[j]];
            if (atom1 === undefined || atom1.serial < atom0.serial) continue;
            if (atom1.chain === atom0.chain && ((atom1.resi === atom0.resi) || (atom0.name === 'C' && atom1.name === 'N') || (atom0.name === 'O3\'' && atom1.name === 'P') || (atom0.name === 'O3*' && atom1.name === 'P') || (atom0.name === 'SG' && atom1.name === 'SG'))) {
                f01 && f01(atom0, atom1);
            } else {
                //clbondArray.push([atom0.coord, atom1.coord]);
            }
        }
    }
};

iCn3D.prototype.createConnCalphSidechain = function (atoms, style) { var me = this, ic = me.icn3d; "use strict";
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
        var atom = this.getFirstAtomObjByName(this.residues[resid], 'CA');

        if(atom !== undefined) {
            for(var i = 0, il = atom.bonds.length; i < il; ++i) {
                var bondAtom = this.atoms[atom.bonds[i]];
                // hydrogen connected to Calpha: HA
                if(bondAtom.name === 'HA' || (bondAtom.name !== 'C' && bondAtom.name !== 'N' && bondAtom.elem !== 'H' && bondAtom.resi == atom.resi) ) {
                    coordArray.push(atom.coord);
                    coordArray.push(bondAtom.coord);

                    colorArray.push(atom.color);
                    colorArray.push(bondAtom.color);
                }
            }
        }

        // hydrogen connected to N: H
        atom = this.getFirstAtomObjByName(this.residues[resid], 'N');

        if(atom !== undefined) {
            for(var i = 0, il = atom.bonds.length; i < il; ++i) {
                var bondAtom = this.atoms[atom.bonds[i]];
                // hydrogen connected to Calpha: HA
                if(bondAtom.name === 'H') {
                    coordArray.push(atom.coord);
                    coordArray.push(bondAtom.coord);

                    colorArray.push(atom.color);
                    colorArray.push(bondAtom.color);
                }
            }
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
