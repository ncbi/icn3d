/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applySurfaceOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    //switch (options.wireframe.toLowerCase()) {
    switch (options.wireframe) {
        case 'yes':
            options.wireframe = true;
            break;
        case 'no':
            options.wireframe = false;
            break;
    }

    options.opacity = parseFloat(options.opacity);

    var atoms, currAtoms;

    // only show the surface for atoms which are displaying
    atoms = this.intHash(this.dAtoms, this.hAtoms);
    // exclude water molecules
    if(options['water'] === 'nothing') atoms = this.exclHash(atoms, this.water);

    currAtoms = this.hash2Atoms(atoms);

    switch (options.surface.toLowerCase()) {
        case 'van der waals surface':
            this.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
            break;
//            case 'solvent excluded surface':
//                this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
//                break;
        case 'solvent accessible surface':
            this.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
            break;
        case 'molecular surface':
            this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
            break;
        case 'van der waals surface with context':
            this.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
            break;
        case 'solvent accessible surface with context':
            this.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
            break;
        case 'molecular surface with context':
            this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
            break;
        case 'nothing':
            // remove surfaces
            this.removeSurfaces();
            break;
    }
};

iCn3D.prototype.applyMapOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    switch (options.mapwireframe) {
        case 'yes':
            options.mapwireframe = true;
            break;
        case 'no':
            options.mapwireframe = false;
            break;
    }

    var atoms, currAtoms;

    // only show the surface for atoms which are displaying
    atoms = this.intHash(this.dAtoms, this.hAtoms);

    currAtoms = this.hash2Atoms(atoms);

    switch (options.map.toLowerCase()) {
        case '2fofc':
            this.createSurfaceRepresentation(currAtoms, 11, options.mapwireframe);
            break;
        case 'fofc':
            this.createSurfaceRepresentation(currAtoms, 12, options.mapwireframe);
            break;
        case 'nothing':
            // remove surfaces
            this.removeMaps();
            break;
    }
};

iCn3D.prototype.applyEmmapOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    switch (options.emmapwireframe) {
        case 'yes':
            options.emmapwireframe = true;
            break;
        case 'no':
            options.emmapwireframe = false;
            break;
    }

    var atoms, currAtoms;

    // only show the surface for atoms which are displaying
    atoms = this.intHash(this.dAtoms, this.hAtoms);

    currAtoms = this.hash2Atoms(atoms);

    switch (options.emmap.toLowerCase()) {
        case 'em':
            this.createSurfaceRepresentation(currAtoms, 13, options.emmapwireframe);
            break;
        case 'nothing':
            // remove surfaces
            this.removeEmmaps();
            break;
    }
};

iCn3D.prototype.applyPhimapOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    switch (options.phimapwireframe) {
        case 'yes':
            options.phimapwireframe = true;
            break;
        case 'no':
            options.phimapwireframe = false;
            break;
    }

    var atoms, currAtoms;

    // only show the surface for atoms which are displaying
    atoms = this.intHash(this.dAtoms, this.hAtoms);

    currAtoms = this.hash2Atoms(atoms);

    switch (options.phimap.toLowerCase()) {
        case 'phi':
            this.createSurfaceRepresentation(currAtoms, 14, options.phimapwireframe);
            break;
        case 'nothing':
            // remove surfaces
            this.removePhimaps();
            break;
    }
};

iCn3D.prototype.applyphisurfaceOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    //switch (options.wireframe.toLowerCase()) {
    switch (this.phisurfwf) {
        case 'yes':
            options.phisurfwf = true;
            break;
        case 'no':
            options.phisurfwf = false;
            break;
    }

    options.phisurfop = parseFloat(this.phisurfop);

    var atoms, currAtoms;

    // only show the surface for atoms which are displaying
    atoms = this.intHash(this.dAtoms, this.hAtoms);
    // exclude water molecules
    if(options['water'] === 'nothing') atoms = this.exclHash(atoms, this.water);

    currAtoms = this.hash2Atoms(atoms);

    switch (options.phisurface.toLowerCase()) {
        case 'phi':
            this.createSurfaceRepresentation(currAtoms, parseInt(this.phisurftype), options.phisurfwf, options.phisurfop);
            break;
        case 'nothing':
            // remove surfaces
            this.removeSurfaces();
            break;
    }
};
