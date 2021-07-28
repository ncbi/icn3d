/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Surface} from './surface.js';

class ApplyMap {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Apply the surface options.
    applySurfaceOptions(options) { let  ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        //switch (options.wirefraic.toLowerCase()) {
        switch (options.wireframe) {
            case 'yes':
                options.wireframe = true;
                break;
            case 'no':
                options.wireframe = false;
                break;
        }

        options.opacity = parseFloat(options.opacity);

        let  atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
        // exclude water molecules
        if(options['water'] === 'nothing') atoms = me.hashUtilsCls.exclHash(atoms, ic.water);

        currAtoms = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

        switch (options.surface.toLowerCase()) {
            case 'van der waals surface':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
                break;
    //            case 'solvent excluded surface':
    //                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
    //                break;
            case 'solvent accessible surface':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
                break;
            case 'molecular surface':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
                break;
            case 'van der waals surface with context':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
                break;
            case 'solvent accessible surface with context':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
                break;
            case 'molecular surface with context':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
                break;
            case 'nothing':
                // remove surfaces
                this.removeSurfaces();
                break;
        }
    }

    //Apply options for electron density map.
    applyMapOptions(options) { let  ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        switch (options.mapwireframe) {
            case 'yes':
                options.mapwireframe = true;
                break;
            case 'no':
                options.mapwireframe = false;
                break;
        }

        let  atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

        currAtoms = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

        switch (options.map.toLowerCase()) {
            case '2fofc':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 11, options.mapwireframe);
                break;
            case 'fofc':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 12, options.mapwireframe);
                break;
            case 'nothing':
                // remove surfaces
                this.removeMaps();
                break;
        }
    }

    //Apply options for EM density map.
    applyEmmapOptions(options) { let  ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        switch (options.emmapwireframe) {
            case 'yes':
                options.emmapwireframe = true;
                break;
            case 'no':
                options.emmapwireframe = false;
                break;
        }

        let  atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

        currAtoms = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

        switch (options.emmap.toLowerCase()) {
            case 'em':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 13, options.emmapwireframe);
                break;
            case 'nothing':
                // remove surfaces
                this.removeEmmaps();
                break;
        }
    }

    applyPhimapOptions(options) { let  ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        switch (options.phimapwireframe) {
            case 'yes':
                options.phimapwireframe = true;
                break;
            case 'no':
                options.phimapwireframe = false;
                break;
        }

        let  atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

        currAtoms = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

        switch (options.phimap.toLowerCase()) {
            case 'phi':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, 14, options.phimapwireframe);
                break;
            case 'nothing':
                // remove surfaces
                this.removePhimaps();
                break;
        }
    }

    applyphisurfaceOptions(options) { let  ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        //switch (options.wirefraic.toLowerCase()) {
        switch (ic.phisurfwf) {
            case 'yes':
                options.phisurfwf = true;
                break;
            case 'no':
                options.phisurfwf = false;
                break;
        }

        options.phisurfop = parseFloat(ic.phisurfop);

        let  atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
        // exclude water molecules
        if(options['water'] === 'nothing') atoms = me.hashUtilsCls.exclHash(atoms, ic.water);

        currAtoms = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

        switch (options.phisurface.toLowerCase()) {
            case 'phi':
                ic.surfaceCls.createSurfaceRepresentation(currAtoms, parseInt(ic.phisurftype), options.phisurfwf, options.phisurfop);
                break;
            case 'nothing':
                // remove surfaces
                this.removeSurfaces();
                break;
        }
    }

    //Remove previously drawn surfaces.
    removeSurfaces() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       for(let i = 0, il = ic.prevSurfaces.length; i < il; ++i) {
           ic.mdl.remove(ic.prevSurfaces[i]);
       }

       ic.prevSurfaces = [];
    }

    removeLastSurface() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       if(ic.prevSurfaces.length > 0) {
           ic.mdl.remove(ic.prevSurfaces[ic.prevSurfaces.length - 1]);
           ic.prevSurfaces.slice(ic.prevSurfaces.length - 1, 1);
       }
    }

    removeMaps() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       for(let i = 0, il = ic.prevMaps.length; i < il; ++i) {
           ic.mdl.remove(ic.prevMaps[i]);
       }

       ic.prevMaps = [];
    }

    removeEmmaps() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       for(let i = 0, il = ic.prevEmmaps.length; i < il; ++i) {
           ic.mdl.remove(ic.prevEmmaps[i]);
       }

       ic.prevEmmaps = [];
    }

    removePhimaps() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight

       for(let i = 0, il = ic.prevPhimaps.length; i < il; ++i) {
           ic.mdl.remove(ic.prevPhimaps[i]);
       }

       ic.prevPhimaps = [];
    }

    removeLastMap() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       if(ic.prevMaps.length > 0) {
           ic.mdl.remove(ic.prevMaps[ic.prevMaps.length - 1]);
           ic.prevMaps.slice(ic.prevMaps.length - 1, 1);
       }
    }

    removeLastEmmap() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       if(ic.prevEmmaps.length > 0) {
           ic.mdl.remove(ic.prevEmmaps[ic.prevEmmaps.length - 1]);
           ic.prevEmmaps.slice(ic.prevEmmaps.length - 1, 1);
       }
    }

    removeLastPhimap() { let  ic = this.icn3d, me = ic.icn3dui;
       // remove prevous highlight
       if(ic.prevPhimaps.length > 0) {
           ic.mdl.remove(ic.prevPhimaps[ic.prevPhimaps.length - 1]);
           ic.prevPhimaps.slice(ic.prevPhimaps.length - 1, 1);
       }
    }
}

export {ApplyMap}
