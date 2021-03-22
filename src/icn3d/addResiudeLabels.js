/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.addResiudeLabels = function (atoms, bSchematic, alpha, bNumber) { var me = this, ic = me.icn3d; "use strict";
    var size = 18;
    var background = "#CCCCCC";
    if(alpha === undefined) alpha = 1.0;

    var atomsHash = this.intHash(this.hAtoms, atoms);

    if(bSchematic) {
        if(this.labels['schematic'] === undefined) this.labels['schematic'] = [];
    }
    else {
        if(this.labels['residue'] === undefined) this.labels['residue'] = [];
    }

    var prevReidueID = '';
    for(var i in atomsHash) {
        var atom = this.atoms[i];

        // allow chemicals
        //if(atom.het) continue;

        var label = {}; // Each label contains 'position', 'text', 'color', 'background'

        var currReidueID = atom.structure + '_' + atom.chain + '_' + atom.resi;

        if( (!atom.het && (atom.name === 'CA' || atom.name === "O3'" || atom.name === "O3*") )
          || this.water.hasOwnProperty(atom.serial)
          || this.ions.hasOwnProperty(atom.serial)
          || (this.chemicals.hasOwnProperty(atom.serial) && currReidueID !== prevReidueID) ) {
            label.position = atom.coord;

            label.bSchematic = 0;
            if(bSchematic) label.bSchematic = 1;

            label.text = this.residueName2Abbr(atom.resn);
            if(bNumber) label.text += atom.resi;
            label.size = size;

            var atomColorStr = atom.color.getHexString().toUpperCase();
            label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;
            //label.alpha = alpha; // this.hideLabels() didn't work. Remove this line for now

            if(bSchematic) {
                this.labels['schematic'].push(label);
            }
            else {
                this.labels['residue'].push(label);
            }
        }

        prevReidueID = currReidueID;
    }

    this.removeHlObjects();
};

iCn3D.prototype.addNonCarbonAtomLabels = function (atoms) { var me = this, ic = me.icn3d; "use strict";
    var size = 18;
    var background = "#FFFFFF";

    var atomsHash = this.intHash(this.hAtoms, atoms);

    if(this.labels['schematic'] === undefined) this.labels['schematic'] = [];

    for(var i in atomsHash) {
        var atom = this.atoms[i];

        //if(!atom.het) continue;
        if(!this.residues.hasOwnProperty(atom.structure + '_' + atom.chain + '_' + atom.resi)) continue;
        if(atom.elem === 'C') continue;

        var label = {}; // Each label contains 'position', 'text', 'color', 'background'

        label.position = atom.coord;

        label.bSchematic = 1;

        label.text = atom.elem;
        label.size = size;

        label.color = "#" + atom.color.getHexString();
        label.background = background;

        this.labels['schematic'].push(label);
    }

    this.removeHlObjects();
};

iCn3D.prototype.addAtomLabels = function (atoms) { var me = this, ic = me.icn3d; "use strict";
    var size = 18;
    var background = "#CCCCCC";

    var atomsHash = this.intHash(this.hAtoms, atoms);
    atomsHash = this.intHash(this.dAtoms, atomsHash);

    if(this.labels['residue'] === undefined) this.labels['residue'] = [];

    for(var i in atomsHash) {
        var atom = this.atoms[i];

        var label = {}; // Each label contains 'position', 'text', 'color', 'background'

        label.position = atom.coord;

        label.bSchematic = 0;

        label.text = atom.name;
        label.size = size;

        var atomColorStr = atom.color.getHexString().toUpperCase();
        label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
        label.background = background;

        this.labels['residue'].push(label);
    }

    this.removeHlObjects();
};
