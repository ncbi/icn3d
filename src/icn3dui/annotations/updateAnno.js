/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// by default, showSeq and showCddSite are called at showAnnotations
// the following will be called only when the annotation is selected: showSnpClinvar, showDomain, showInteraction
// showSnpClinvar and showDomain will loop through me.protein_chainid
// showInteraction will loop through me.interactChainbase
iCn3DUI.prototype.updateClinvar = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bClinvarShown === undefined || !me.bClinvarShown) {
        for(var chainid in me.protein_chainid) {
            var chainidBase = me.protein_chainid[chainid];
            me.showClinvar(chainid, chainidBase);
        }
    }
    me.bClinvarShown = true;
};
iCn3DUI.prototype.updateSnp = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bSnpShown === undefined || !me.bSnpShown) {
        for(var chainid in me.protein_chainid) {
            var chainidBase = me.protein_chainid[chainid];
            me.showSnp(chainid, chainidBase);
        }
    }
    me.bSnpShown = true;
};
iCn3DUI.prototype.updateDomain = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bDomainShown === undefined || !me.bDomainShown) {
        me.showDomainAll();
    }
    me.bDomainShown = true;
};
iCn3DUI.prototype.updateInteraction = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bInteractionShown === undefined || !me.bInteractionShown) {
        for(var chainid in me.interactChainbase) {
            var chainidBase = me.interactChainbase[chainid];
            me.showInteraction(chainid, chainidBase);
        }
    }
    me.bInteractionShown = true;
};
iCn3DUI.prototype.updateSsbond = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bSSbondShown === undefined || !me.bSSbondShown) {
        for(var chainid in me.ssbondChainbase) {
            var chainidBase = me.ssbondChainbase[chainid];
            me.showSsbond(chainid, chainidBase);
        }
    }
    me.bSSbondShown = true;
};
iCn3DUI.prototype.updateCrosslink = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bCrosslinkShown === undefined || !me.bCrosslinkShown) {
        for(var chainid in me.crosslinkChainbase) {
            var chainidBase = me.crosslinkChainbase[chainid];
            me.showCrosslink(chainid, chainidBase);
        }
    }
    me.bCrosslinkShown = true;
};
iCn3DUI.prototype.updateTransmem = function() { var me = this, ic = me.icn3d; "use strict";
    if(me.bTranememShown === undefined || !me.bTranememShown) {
        for(var chainid in me.protein_chainid) {
            var chainidBase = me.protein_chainid[chainid];
            me.showTransmem(chainid, chainidBase);
        }
    }
    me.bTranememShown = true;
};
