/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showSsbond = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    if(ic.ssbondpnts === undefined) {
        // didn't finish loading atom data yet
        setTimeout(function(){
          me.showSsbond_base(chnid, chnidBase);
        }, 1000);
    }
    else {
        me.showSsbond_base(chnid, chnidBase);
    }
};
iCn3DUI.prototype.showSsbond_base = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    var chainid = chnidBase;
    var resid2resids = {};
    var structure = chainid.substr(0, chainid.indexOf('_'));
    var ssbondArray = ic.ssbondpnts[structure];
    if(ssbondArray === undefined) {
        $("#" + me.pre + "dt_ssbond_" + chnid).html('');
        $("#" + me.pre + "ov_ssbond_" + chnid).html('');
        $("#" + me.pre + "tt_ssbond_" + chnid).html('');
        return;
    }
    for(var i = 0, il = ssbondArray.length; i < il; i = i + 2) {
        var resid1 = ssbondArray[i];
        var resid2 = ssbondArray[i+1];
        var chainid1 = resid1.substr(0, resid1.lastIndexOf('_'));
        var chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
        if(chainid === chainid1) {
            if(resid2resids[resid1] === undefined) resid2resids[resid1] = [];
            resid2resids[resid1].push(resid2);
        }
        if(chainid === chainid2) {
            if(resid2resids[resid2] === undefined) resid2resids[resid2] = [];
            resid2resids[resid2].push(resid1);
        }
    }
    var residueArray = Object.keys(resid2resids);
    var title = "Disulfide Bonds";
    me.showAnnoType(chnid, chnidBase, 'ssbond', title, residueArray, resid2resids);
};
