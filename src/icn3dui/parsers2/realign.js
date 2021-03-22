/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.realign = function() { var me = this, ic = me.icn3d; "use strict";
    me.saveSelectionPrep();

    var index = Object.keys(ic.defNames2Atoms).length;
    var name = 'alseq_' + index;

    me.saveSelection(name, name);

    var structHash = {};
    me.realignResid = {};
    var lastStruResi = '';
    for(var serial in ic.hAtoms) {
        var atom = ic.atoms[serial];
        if( (ic.proteins.hasOwnProperty(serial) && atom.name == "CA")
          || (ic.nucleotides.hasOwnProperty(serial) && (atom.name == "O3'" || atom.name == "O3*")) ) {
            if(atom.structure + '_' + atom.resi == lastStruResi) continue; // e.g., Alt A and B

            if(!structHash.hasOwnProperty(atom.structure)) {
                structHash[atom.structure] = [];
            }
            structHash[atom.structure].push(atom.coord.clone());

            if(!me.realignResid.hasOwnProperty(atom.structure)) {
                me.realignResid[atom.structure] = [];
            }

            me.realignResid[atom.structure].push({'resid': atom.structure + '_' + atom.chain + '_' + atom.resi, 'resn': ic.residueName2Abbr(atom.resn.substr(0, 3)).substr(0, 1)});

            lastStruResi = atom.structure + '_' + atom.resi;
        }
    }

    var structArray = Object.keys(structHash);

    var toStruct = structArray[0];
    var fromStruct = structArray[1];

    // transform from the second structure to the first structure
    var coordsFrom = structHash[fromStruct];
    var coordsTo = structHash[toStruct];

    var bKeepSeq = true;
    me.alignCoords(coordsFrom, coordsTo, fromStruct, bKeepSeq);

    me.updateHlAll();
};
