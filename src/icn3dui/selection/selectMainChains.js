/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectMainChains = function () { var me = this, ic = me.icn3d; "use strict";
    var currHAtoms = ic.cloneHash(ic.hAtoms);

    ic.hAtoms = ic.selectMainChainSubset(currHAtoms);

    me.showHighlight();
};

iCn3DUI.prototype.selectSideChains = function () { var me = this, ic = me.icn3d; "use strict";
    var currHAtoms = ic.cloneHash(ic.hAtoms);

    var nuclMainArray = ["C1'", "C1*", "C2'", "C2*", "C3'", "C3*", "C4'", "C4*", "C5'", "C5*", "O3'", "O3*", "O4'", "O4*", "O5'", "O5*", "P", "OP1", "O1P", "OP2", "O2P"];

    ic.hAtoms = {};
    for(var i in currHAtoms) {
        if( (ic.proteins.hasOwnProperty(i) && ic.atoms[i].name !== "N" && ic.atoms[i].name !== "C" && ic.atoms[i].name !== "O"
          && !(ic.atoms[i].name === "CA" && ic.atoms[i].elem === "C") )
          || (ic.nucleotides.hasOwnProperty(i) && nuclMainArray.indexOf(ic.atoms[i].name) === -1) ) {
            ic.hAtoms[i] = 1;
        }
    }

    me.showHighlight();
};

iCn3DUI.prototype.selectMainSideChains = function () { var me = this, ic = me.icn3d; "use strict";
    var residHash = ic.getResiduesFromAtoms(ic.hAtoms);

    ic.hAtoms = {};
    for(var resid in residHash) {
        ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);
        ic.dAtoms = ic.unionHash(ic.dAtoms, ic.residues[resid]);
    }

    ic.draw();

    me.showHighlight();
};
