/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */


iCn3DUI.prototype.showCrosslink = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    if(ic.clbondpnts === undefined) {
        // didn't finish loading atom data yet
        setTimeout(function(){
          me.showCrosslink_base(chnid, chnidBase);
        }, 1000);
    }
    else {
        me.showCrosslink_base(chnid, chnidBase);
    }
};
iCn3DUI.prototype.showCrosslink_base = function(chnid, chnidBase) { var me = this, ic = me.icn3d; "use strict";
    var chainid = chnidBase;
    var resid2resids = {};
    var structure = chainid.substr(0, chainid.indexOf('_'));
    var clbondArray = ic.clbondpnts[structure];
    if(clbondArray === undefined) {
        $("#" + me.pre + "dt_crosslink_" + chnid).html('');
        $("#" + me.pre + "ov_crosslink_" + chnid).html('');
        $("#" + me.pre + "tt_crosslink_" + chnid).html('');
        return;
    }
    for(var i = 0, il = clbondArray.length; i < il; i = i + 2) {
        var resid1 = clbondArray[i]; // chemical
        var resid2 = clbondArray[i+1]; // protein or chemical
        var chainid1 = resid1.substr(0, resid1.lastIndexOf('_'));
        var chainid2 = resid2.substr(0, resid2.lastIndexOf('_'));
        //if(chainid === chainid1) {
        //    if(resid2resids[resid1] === undefined) resid2resids[resid1] = [];
        //    resid2resids[resid1].push(resid2);
        //}
        if(chainid === chainid2) {
            if(resid2resids[resid2] === undefined) resid2resids[resid2] = [];
            resid2resids[resid2].push(resid1);
        }
    }
    var residueArray = Object.keys(resid2resids);
    var title = "Cross-Linkages";
    me.showAnnoType(chnid, chnidBase, 'crosslink', title, residueArray, resid2resids);
};
