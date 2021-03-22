/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.getChainsFromAtoms = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    var chainsHash = {};
    for(var i in atomsHash) {
       var atom = this.atoms[i];
       var chainid = atom.structure + "_" + atom.chain;

       chainsHash[chainid] = 1;
    }

    return chainsHash;
};
