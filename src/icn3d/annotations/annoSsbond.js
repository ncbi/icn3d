/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {AnnoCddSite} from '../annotations/annoCddSite.js';

class AnnoSsbond {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Show the disulfide bonds and show the side chain in the style of "stick".
    showSsbond(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        if(ic.ssbondpnts === undefined) {
            // didn't finish loading atom data yet
            setTimeout(function(){
              thisClass.showSsbond_base(chnid, chnidBase);
            }, 1000);
        }
        else {
            this.showSsbond_base(chnid, chnidBase);
        }
    }
    showSsbond_base(chnid, chnidBase) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid = chnidBase;
        let resid2resids = {}
        let structure = chainid.substr(0, chainid.indexOf('_'));
        let ssbondArray = ic.ssbondpnts[structure];
        if(ssbondArray === undefined) {
            $("#" + ic.pre + "dt_ssbond_" + chnid).html('');
            $("#" + ic.pre + "ov_ssbond_" + chnid).html('');
            $("#" + ic.pre + "tt_ssbond_" + chnid).html('');
            return;
        }
        for(let i = 0, il = ssbondArray.length; i < il; i = i + 2) {
            let resid1 = ssbondArray[i];
            let resid2 = ssbondArray[i+1];
            let chainid1 = resid1.substr(0, resid1.lastIndexOf('_'));
            let chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
            if(chainid === chainid1) {
                if(resid2resids[resid1] === undefined) resid2resids[resid1] = [];
                resid2resids[resid1].push(resid2);
            }
            if(chainid === chainid2) {
                if(resid2resids[resid2] === undefined) resid2resids[resid2] = [];
                resid2resids[resid2].push(resid1);
            }
        }
        let residueArray = Object.keys(resid2resids);
        let title = "Disulfide Bonds";
        ic.annoCddSiteCls.showAnnoType(chnid, chnidBase, 'ssbond', title, residueArray, resid2resids);
    }

}

export {AnnoSsbond}
