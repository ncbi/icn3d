/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.atoms2residues = function(atomArray) { var me = this, ic = me.icn3d; "use strict";
     var atoms = {};
     for(var j = 0, jl = atomArray.length; j < jl; ++j) {
         atoms[atomArray[j]] = 1;
     }
     //var residueHash = ic.getResiduesFromCalphaAtoms(atoms);
     var residueHash = ic.getResiduesFromAtoms(atoms);
     return Object.keys(residueHash);
};
