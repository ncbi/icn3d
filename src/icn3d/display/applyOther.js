/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Line} from '../geometry/line.js';
import {Contact} from '../interaction/contact.js';
import {HBond} from '../interaction/hBond.js';
import {Box} from '../geometry/box.js';
import {Axes} from '../geometry/axes.js';
import {Glycan} from '../geometry/glycan.js';
import {ApplySymd} from '../analysis/applySymd.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {Transform} from '../transform/transform.js';

class ApplyOther {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Apply the rest options (e.g., hydrogen bonds, center, etc).
    applyOtherOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
            if(options === undefined) options = ic.opts;

    //    if(ic.lines !== undefined) {
            // contact lines
            ic.hBondCls.setHbondsContacts(options, 'contact');

            // halogen lines
            ic.hBondCls.setHbondsContacts(options, 'halogen');
            // pi-cation lines
            ic.hBondCls.setHbondsContacts(options, 'pi-cation');
            // pi-stacking lines
            ic.hBondCls.setHbondsContacts(options, 'pi-stacking');

            // hbond lines
            ic.hBondCls.setHbondsContacts(options, 'hbond');
            // salt bridge lines
            ic.hBondCls.setHbondsContacts(options, 'saltbridge');
            if (ic.pairArray !== undefined && ic.pairArray.length > 0) {
                this.updateStabilizer(); // to update ic.stabilizerpnts

                let color = '#FFFFFF';
                let pnts = ic.stabilizerpnts;
                ic.lines['stabilizer'] = []; // reset
                for (let i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
                    let line = {};
                    line.position1 = pnts[2 * i];
                    line.position2 = pnts[2 * i + 1];
                    line.color = color;
                    line.dashed = false; // if true, there will be too many cylinders in the dashed lines

                    ic.lines['stabilizer'].push(line);
                }
            }

            ic.lineCls.createLines(ic.lines);
    //    }

        // distance sets
        if(ic.distPnts && ic.distPnts.length > 0) {
            for(let i = 0, il = ic.distPnts.length; i < il; ++i) {
               ic.boxCls.createBox_base(ic.distPnts[i], ic.originSize, ic.hColor, false);
            }
        }

        // maps
        if(ic.prevMaps !== undefined) {
            for(let i = 0, il = ic.prevMaps.length; i < il; ++i) {
                ic.mdl.add(ic.prevMaps[i]);
            }
        }

        // EM map
        if(ic.prevEmmaps !== undefined) {
            for(let i = 0, il = ic.prevEmmaps.length; i < il; ++i) {
                ic.mdl.add(ic.prevEmmaps[i]);
            }
        }

        if(ic.prevPhimaps !== undefined) {
            for(let i = 0, il = ic.prevPhimaps.length; i < il; ++i) {
                ic.mdl.add(ic.prevPhimaps[i]);
            }
        }

        // surfaces
        if(ic.prevSurfaces !== undefined) {
            for(let i = 0, il = ic.prevSurfaces.length; i < il; ++i) {
                ic.mdl.add(ic.prevSurfaces[i]);
            }
        }

        // symmetry axes and polygon
        if(ic.symmetryHash !== undefined && ic.symmetrytitle !== undefined) {
            ic.applySymdCls.applySymmetry(ic.symmetrytitle);
        }

        if(ic.symdArray !== undefined && ic.symdArray.length > 0) {
            //var bSymd = true;
            //ic.applySymmetry(ic.symdtitle, bSymd);
            ic.applySymdCls.applySymd();
        }

        // other meshes
        if(ic.prevOtherMesh !== undefined) {
            for(let i = 0, il = ic.prevOtherMesh.length; i < il; ++i) {
                ic.mdl.add(ic.prevOtherMesh[i]);
            }
        }

        if(me.htmlCls.setHtmlCls.getCookie('glycan') != '') {
            let bGlycansCartoon = parseInt(me.htmlCls.setHtmlCls.getCookie('glycan'));

            if(ic.bGlycansCartoon != bGlycansCartoon) {
                me.htmlCls.clickMenuCls.setLogCmd('set glycan ' + bGlycansCartoon, true);
            }

            ic.bGlycansCartoon = bGlycansCartoon;
        }

        // add cartoon for glycans
        if(ic.bGlycansCartoon && !ic.bAlternate) {
            ic.glycanCls.showGlycans();
        }

        ic.applyCenterCls.applyCenterOptions(options);

        ic.axesCls.buildAllAxes(undefined, true);

        switch (options.axis.toLowerCase()) {
            case 'yes':
                ic.axis = true;
                ic.axesCls.buildAxes(ic.maxD/2);

                break;
            case 'no':
                ic.axis = false;
                break;
        }
        switch (options.pk.toLowerCase()) {
            case 'atom':
                ic.pk = 1;
                break;
            case 'no':
                ic.pk = 0;
                break;
            case 'residue':
                ic.pk = 2;
                break;
            case 'strand':
                ic.pk = 3;
                break;
        }
    }

    applyChemicalbindingOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        // display mode
        if (options.chemicalbinding === 'show') {
            let startAtoms;
            if(ic.chemicals !== undefined && Object.keys(ic.chemicals).length > 0) { // show chemical-protein interaction
                startAtoms = me.hashUtilsCls.hash2Atoms(ic.chemicals, ic.atoms);
            }

            // find atoms in chainid1, which interact with chainid2
            let radius = 4;

            if(startAtoms !== undefined) {
                let targetAtoms = ic.contactCls.getAtomsWithinAtom(ic.atoms, startAtoms, radius);

                // show hydrogens
                let threshold = 3.5;
                ic.opts["hbonds"] = "yes";

                if(Object.keys(targetAtoms).length > 0) {
                    ic.hBondCls.calculateChemicalHbonds(startAtoms, targetAtoms, parseFloat(threshold) );
                }

                // zoom in on the atoms
                if(!ic.bSetFog) ic.transformCls.zoominSelection( me.hashUtilsCls.unionHash(startAtoms, targetAtoms) );
            }
        }
        else if (options.chemicalbinding === 'hide') {
            // truen off hdonds
            ic.hBondCls.hideHbonds();

            // center on the atoms
            if(!ic.bSetFog) ic.transformCls.zoominSelection(ic.atoms);
        }
    }

    updateStabilizer() { let ic = this.icn3d, me = ic.icn3dui;
        ic.stabilizerpnts = [];

        if(ic.pairArray !== undefined) {
            for(let i = 0, il = ic.pairArray.length; i < il; i += 2) {
                let coordI = this.getResidueRepPos(ic.pairArray[i]);
                let coordJ = this.getResidueRepPos(ic.pairArray[i + 1]);

                ic.stabilizerpnts.push(coordI);
                ic.stabilizerpnts.push(coordJ);
            }
        }
    }

    getResidueRepPos(serial) { let ic = this.icn3d, me = ic.icn3dui;
        let atomIn = ic.atoms[serial];
        let residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

        let pos;
        if(!ic.proteins.hasOwnProperty(serial) && !ic.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
            pos = atomIn.coord;
        }
        else {
            for(let i in ic.residues[residueid]) {
                let atom = ic.atoms[i];
                if(atom.name === 'N3') { // nucleotide: N3
                    pos = ic.atoms[i].coord;
                    break;
                }
                else if(atom.name === 'CA' && atom.ss == 'coil') { // protein coil: CA
                    pos = ic.atoms[i].coord;
                    break;
                }
                else if(atom.name === 'CA' && (atom.ss == 'helix' || atom.ss == 'sheet')) { // protein secondary: CA
                    pos = (ic.atoms[i].coord2 !== undefined) ? ic.atoms[i].coord2 : ic.atoms[i].coord;
                    break;
                }
            }
        }

        if(pos === undefined) pos = atomIn.coord;

        return pos;
    }
}

export {ApplyOther}
