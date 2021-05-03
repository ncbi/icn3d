/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {HlObjects} from '../highlight/hlObjects.js';

class ResidueLabels {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Add labels for all residues containing the input "atoms". The labels are one-letter residue abbreviations.
    //If "bSchematic" is true, the labels are in circles. Otherwise, they are in round-corner rectangles.
    addResidueLabels(atoms, bSchematic, alpha, bNumber) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var size = 18;
        var background = "#CCCCCC";
        if(alpha === undefined) alpha = 1.0;

        var atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);

        if(bSchematic) {
            if(ic.labels['schematic'] === undefined) ic.labels['schematic'] = [];
        }
        else {
            if(ic.labels['residue'] === undefined) ic.labels['residue'] = [];
        }

        var prevReidueID = '';
        for(var i in atomsHash) {
            var atom = ic.atoms[i];

            // allow chemicals
            //if(atom.het) continue;

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            var currReidueID = atom.structure + '_' + atom.chain + '_' + atom.resi;

            if( (!atom.het && (atom.name === 'CA' || atom.name === "O3'" || atom.name === "O3*") )
              || ic.water.hasOwnProperty(atom.serial)
              || ic.ions.hasOwnProperty(atom.serial)
              || (ic.chemicals.hasOwnProperty(atom.serial) && currReidueID !== prevReidueID) ) {
                label.position = atom.coord;

                label.bSchematic = 0;
                if(bSchematic) label.bSchematic = 1;

                label.text = me.utilsCls.residueName2Abbr(atom.resn);
                if(bNumber) label.text += atom.resi;
                label.size = size;

                var atomColorStr = atom.color.getHexString().toUpperCase();
                label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
                label.background = background;
                //label.alpha = alpha; // ic.labelCls.hideLabels() didn't work. Remove this line for now

                if(bSchematic) {
                    ic.labels['schematic'].push(label);
                }
                else {
                    ic.labels['residue'].push(label);
                }
            }

            prevReidueID = currReidueID;
        }

        ic.hlObjectsCls.removeHlObjects();
    }

    addNonCarbonAtomLabels(atoms) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var size = 18;
        var background = "#FFFFFF";

        var atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);

        if(ic.labels['schematic'] === undefined) ic.labels['schematic'] = [];

        for(var i in atomsHash) {
            var atom = ic.atoms[i];

            //if(!atom.het) continue;
            if(!ic.residues.hasOwnProperty(atom.structure + '_' + atom.chain + '_' + atom.resi)) continue;
            if(atom.elem === 'C') continue;

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.bSchematic = 1;

            label.text = atom.elem;
            label.size = size;

            label.color = "#" + atom.color.getHexString();
            label.background = background;

            ic.labels['schematic'].push(label);
        }

        ic.hlObjectsCls.removeHlObjects();
    };

    addAtomLabels(atoms) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        var size = 18;
        var background = "#CCCCCC";

        var atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);
        atomsHash = me.hashUtilsCls.intHash(ic.dAtoms, atomsHash);

        if(ic.labels['residue'] === undefined) ic.labels['residue'] = [];

        for(var i in atomsHash) {
            var atom = ic.atoms[i];

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.bSchematic = 0;

            label.text = atom.name;
            label.size = size;

            var atomColorStr = atom.color.getHexString().toUpperCase();
            label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;

            ic.labels['residue'].push(label);
        }

        ic.hlObjectsCls.removeHlObjects();
    };

}
export {ResidueLabels}