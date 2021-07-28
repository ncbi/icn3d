/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {AnnoCddSite} from '../annotations/annoCddSite.js';

class AnnoTransMem {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showTransmem(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(ic.ssbondpnts === undefined) {
            // didn't finish loading atom data yet
            setTimeout(function(){
              thisClass.showTransmem_base(chnid, chnidBase);
            }, 1000);
        }
        else {
            this.showTransmem_base(chnid, chnidBase);
        }
    }
    showTransmem_base(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let residHash = {}
        for(let serial in ic.chains[chnidBase]) {
            let atom = ic.atoms[serial];
            if(atom.coord.z < ic.halfBilayerSize && atom.coord.z > -ic.halfBilayerSize) {
                let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residHash[resid] = 1;
            }
        }
        let residueArray = Object.keys(residHash);
        let title = "Transmembrane domain";
        ic.annoCddSiteCls.showAnnoType(chnid, chnidBase, 'transmem', title, residueArray);
    }

}

export {AnnoTransMem}
