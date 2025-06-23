/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';

class ResidueLabels {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Add labels for all residues containing the input "atoms". The labels are one-letter residue abbreviations.
    //If "bSchematic" is true, the labels are in circles. Otherwise, they are in round-corner rectangles.
    addResidueLabels(atoms, bSchematic, alpha, bNumber, bRefnum) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let size = 18;
        let background = "#FFFFFF"; //"#CCCCCC";
        if(alpha === undefined) alpha = 1.0;

        let atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);

        if(bSchematic) {
            if(ic.labels['schematic'] === undefined) ic.labels['schematic'] = [];
        }
        else {
            if(ic.labels['residue'] === undefined) ic.labels['residue'] = [];
        }

        let prevReidueID = '';
        for(let i in atomsHash) {
            let atom = ic.atoms[i];

            // allow chemicals
            //if(atom.het) continue;

            let label = {}; // Each label contains 'position', 'text', 'color', 'background'

            let currReidueID = atom.structure + '_' + atom.chain + '_' + atom.resi;

            if( (!atom.het && (atom.name === 'CA' || atom.name === "O3'" || atom.name === "O3*") )
              || ic.water.hasOwnProperty(atom.serial)
              || ic.ions.hasOwnProperty(atom.serial)
              || (ic.chemicals.hasOwnProperty(atom.serial) && currReidueID !== prevReidueID) ) {
                label.position = atom.coord;

                label.bSchematic = 0;
                if(bSchematic) label.bSchematic = 1;

                label.text = me.utilsCls.residueName2Abbr(atom.resn);
                if(bNumber) {
                    label.text += atom.resi;
                    //label.factor = 0.3;
                }
                else if(bRefnum) {
                    let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                    let refnum = '';
                    if(ic.resid2refnum[resid]) {
                        refnum = (ic.resid2refnum[resid].substr(0, 1) == ' ') ? '' : ic.resid2refnum[resid];
                    }

                    label.text = refnum;
                }
                label.size = size;
                label.factor = 0.3;

                let atomColorStr = atom.color.getHexString().toUpperCase();
                //label.color = (ic.opts.background != 'black') ? ic.colorWhitebkgd : ic.colorBlackbkgd; //(atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
                //if(bSchematic) label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
                // don't change residue labels
                if(bNumber) {
                    label.color = (ic.opts.background != 'black') ? ic.colorWhitebkgd : ic.colorBlackbkgd;
                }
                else if(bRefnum) {
                    label.color = '#00FFFF';
                }
                else {
                    label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
                }
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

    //Add labels for each Ig domain
    addIgLabels(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let size = 60; //18;

        ic.labels['ig'] = [];
        let chainidHash = ic.firstAtomObjCls.getChainsFromAtoms(atoms);

        for(let chainid in ic.igLabel2Pos) {
            if(!chainidHash.hasOwnProperty(chainid)) continue;

            for(let text in ic.igLabel2Pos[chainid]) {
                let label = {}; // Each label contains 'position', 'text', 'color', 'background'
                label.position = ic.igLabel2Pos[chainid][text];
                label.text = text;

                label.size = size
                label.color = '#00FFFF';

                ic.labels['ig'].push(label);
            }
        }

        ic.hlObjectsCls.removeHlObjects();
    }

    addNonCarbonAtomLabels(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let size = 18;
        let background = "#FFFFFF";

        let atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);

        if(ic.labels['schematic'] === undefined) ic.labels['schematic'] = [];

        for(let i in atomsHash) {
            let atom = ic.atoms[i];

            //if(!atom.het) continue;
            if(!ic.residues.hasOwnProperty(atom.structure + '_' + atom.chain + '_' + atom.resi)) continue;
            if(atom.elem === 'C') continue;

            let label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.bSchematic = 1;

            label.text = atom.elem;
            label.size = size;

            label.color = (ic.opts.background != 'black') ? ic.colorWhitebkgd : atom.color.getHexString();
            label.background = background;

            ic.labels['schematic'].push(label);
        }

        ic.hlObjectsCls.removeHlObjects();
    };

    addAtomLabels(atoms, bElement) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let size = 18;
        //let background = (bElement) ? "#FFFFFF" : "#CCCCCC";
        let background = "#FFFFFF";

        let atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);
        atomsHash = me.hashUtilsCls.intHash(ic.dAtoms, atomsHash);

        if(ic.labels['residue'] === undefined) ic.labels['residue'] = [];

        for(let i in atomsHash) {
            let atom = ic.atoms[i];

            let label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.bSchematic = 0;

            label.text = (bElement) ? atom.elem : atom.name.padEnd(2, ' ');
            label.size = size;

            if(bElement) {
                label.bSchematic = true;
            }

            let atomColorStr = atom.color.getHexString().toUpperCase();
            label.color = (ic.opts.background != 'black') ? ic.colorWhitebkgd : ic.colorBlackbkgd; //(atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr; 
            if(bElement) label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;

            ic.labels['residue'].push(label);
        }

        ic.hlObjectsCls.removeHlObjects();
    };

}
export {ResidueLabels}