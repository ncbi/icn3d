/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showTransmem = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    if(ic.ssbondpnts === undefined) {
        // didn't finish loading atom data yet
        setTimeout(function(){
          me.showTransmem_base(chnid, chnidBase);
        }, 1000);
    }
    else {
        me.showTransmem_base(chnid, chnidBase);
    }
};
iCn3DUI.prototype.showTransmem_base = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    var residHash = {};
    for(var serial in ic.chains[chnidBase]) {
        var atom = ic.atoms[serial];
        if(atom.coord.z < ic.halfBilayerSize && atom.coord.z > -ic.halfBilayerSize) {
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residHash[resid] = 1;
        }
    }
    var residueArray = Object.keys(residHash);
    var title = "Transmembrane domain";
    me.showAnnoType(chnid, chnidBase, 'transmem', title, residueArray);
};
