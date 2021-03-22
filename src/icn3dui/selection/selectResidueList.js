/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectResidueList = function (residueHash, commandname, commanddescr, bUnion, bUpdateHighlight, bAtom) { var me = this, ic = me.icn3d; "use strict";
  if(residueHash !== undefined && Object.keys(residueHash).length > 0) {
    if(bUnion === undefined || !bUnion) {
        ic.hAtoms = {};
        me.menuHlHash = {};
    }
    else {
        if(me.menuHlHash === undefined) me.menuHlHash = {};
    }

    if(bAtom) {
        for(var i in residueHash) {
            ic.hAtoms[i] = 1;
        }
    }
    else {
        for(var i in residueHash) {
            for(var j in ic.residues[i]) {
              ic.hAtoms[j] = 1;
            }
        }
    }

    commandname = commandname.replace(/\s/g, '');

    me.menuHlHash[commandname] = 1;

    var select, bSelectResidues;

    if(bAtom) {
        select = "select " + me.atoms2spec(ic.hAtoms);
        bSelectResidues = false;
    }
    else {
        select = "select " + me.residueids2spec(Object.keys(residueHash));
        bSelectResidues = true;
    }

    var residueAtomArray = Object.keys(residueHash);

    //if( (ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
        me.addCustomSelection(residueAtomArray, commandname, commanddescr, select, bSelectResidues);
    //}

    if(bUpdateHighlight === undefined || bUpdateHighlight) me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion);
  }
};
