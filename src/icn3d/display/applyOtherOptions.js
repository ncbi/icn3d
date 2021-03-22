/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applyOtherOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;
//    if(this.lines !== undefined) {
        // contact lines
        this.setHbondsContacts(options, 'contact');

        // halogen lines
        this.setHbondsContacts(options, 'halogen');
        // pi-cation lines
        this.setHbondsContacts(options, 'pi-cation');
        // pi-stacking lines
        this.setHbondsContacts(options, 'pi-stacking');

        // hbond lines
        this.setHbondsContacts(options, 'hbond');
        // salt bridge lines
        this.setHbondsContacts(options, 'saltbridge');
        if (this.pairArray !== undefined && this.pairArray.length > 0) {
            this.updateStabilizer(); // to update this.stabilizerpnts

            var color = '#FFFFFF';
            var pnts = this.stabilizerpnts;
            this.lines['stabilizer'] = []; // reset
            for (var i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
                var line = {};
                line.position1 = pnts[2 * i];
                line.position2 = pnts[2 * i + 1];
                line.color = color;
                line.dashed = false; // if true, there will be too many cylinders in the dashed lines

                this.lines['stabilizer'].push(line);
            }
        }

        this.createLines(this.lines);
//    }

    // maps
    if(this.prevMaps !== undefined) {
        for(var i = 0, il = this.prevMaps.length; i < il; ++i) {
            this.mdl.add(this.prevMaps[i]);
        }
    }

    // EM map
    if(this.prevEmmaps !== undefined) {
        for(var i = 0, il = this.prevEmmaps.length; i < il; ++i) {
            this.mdl.add(this.prevEmmaps[i]);
        }
    }

    if(this.prevPhimaps !== undefined) {
        for(var i = 0, il = this.prevPhimaps.length; i < il; ++i) {
            this.mdl.add(this.prevPhimaps[i]);
        }
    }

    // surfaces
    if(this.prevSurfaces !== undefined) {
        for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
            this.mdl.add(this.prevSurfaces[i]);
        }
    }

    // symmetry axes and polygon
    if(this.symmetryHash !== undefined && this.symmetrytitle !== undefined) {
        this.applySymmetry(this.symmetrytitle);
    }

    if(this.symdArray !== undefined && this.symdArray.length > 0) {
        //var bSymd = true;
        //this.applySymmetry(this.symdtitle, bSymd);
        this.applySymd();
    }

    // other meshes
    if(this.prevOtherMesh !== undefined) {
        for(var i = 0, il = this.prevOtherMesh.length; i < il; ++i) {
            this.mdl.add(this.prevOtherMesh[i]);
        }
    }

    // add cartoon for glycans
    if(this.bGlycansCartoon && !this.bAlternate) {
        this.showGlycans();
    }

    this.applyCenterOptions(options);

    this.buildAllAxes(undefined, true);

    switch (options.axis.toLowerCase()) {
        case 'yes':
            this.axis = true;
            this.buildAxes(this.maxD/2);

            break;
        case 'no':
            this.axis = false;
            break;
    }
    switch (options.pk.toLowerCase()) {
        case 'atom':
            this.pk = 1;
            break;
        case 'no':
            this.pk = 0;
            break;
        case 'residue':
            this.pk = 2;
            break;
        case 'strand':
            this.pk = 3;
            break;
    }
};

iCn3D.prototype.getResidueRepPos = function (serial) { var me = this, ic = me.icn3d; "use strict";
    var atomIn = this.atoms[serial];
    var residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

    var pos;
    if(!this.proteins.hasOwnProperty(serial) && !this.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
        pos = atomIn.coord;
    }
    else {
        for(var i in this.residues[residueid]) {
            var atom = this.atoms[i];
            if(atom.name === 'N3') { // nucleotide: N3
                pos = this.atoms[i].coord;
                break;
            }
            else if(atom.name === 'CA' && atom.ss == 'coil') { // protein coil: CA
                pos = this.atoms[i].coord;
                break;
            }
            else if(atom.name === 'CA' && (atom.ss == 'helix' || atom.ss == 'sheet')) { // protein secondary: CA
                pos = (this.atoms[i].coord2 !== undefined) ? this.atoms[i].coord2 : this.atoms[i].coord;
                break;
            }
        }
    }

    if(pos === undefined) pos = atomIn.coord;

    return pos;
};

iCn3D.prototype.buildAllAxes = function (radius, bSelection) { var me = this, ic = me.icn3d; "use strict";
    if(this.pc1) {
        for(var i = 0, il = this.axes.length; i < il; ++i) {
           var center = this.axes[i][0];
           var positionX = this.axes[i][1];
           var positionY = this.axes[i][2];
           var positionZ = this.axes[i][3];

           this.buildAxes(radius, center, positionX, positionY, positionZ, bSelection);
        }
    }
};
