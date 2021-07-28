/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {AnnoCddSite} from '../annotations/annoCddSite.js';

class AnnoCrossLink {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showCrosslink(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(ic.clbondpnts === undefined) {
            // didn't finish loading atom data yet
            setTimeout(function(){
              thisClass.showCrosslink_base(chnid, chnidBase);
            }, 1000);
        }
        else {
            this.showCrosslink_base(chnid, chnidBase);
        }
    }
    showCrosslink_base(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid = chnidBase;
        let resid2resids = {}
        let structure = chainid.substr(0, chainid.indexOf('_'));
        let clbondArray = ic.clbondpnts[structure];
        if(clbondArray === undefined) {
            $("#" + ic.pre + "dt_crosslink_" + chnid).html('');
            $("#" + ic.pre + "ov_crosslink_" + chnid).html('');
            $("#" + ic.pre + "tt_crosslink_" + chnid).html('');
            return;
        }
        for(let i = 0, il = clbondArray.length; i < il; i = i + 2) {
            let resid1 = clbondArray[i]; // chemical
            let resid2 = clbondArray[i+1]; // protein or chemical
            let chainid1 = resid1.substr(0, resid1.lastIndexOf('_'));
            let chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
            //if(chainid === chainid1) {
            //    if(resid2resids[resid1] === undefined) resid2resids[resid1] = [];
            //    resid2resids[resid1].push(resid2);
            //}
            if(chainid === chainid2) {
                if(resid2resids[resid2] === undefined) resid2resids[resid2] = [];
                resid2resids[resid2].push(resid1);
            }
        }
        let residueArray = Object.keys(resid2resids);
        let title = "Cross-Linkages";
        ic.annoCddSiteCls.showAnnoType(chnid, chnidBase, 'crosslink', title, residueArray, resid2resids);
    }

}

export {AnnoCrossLink}
