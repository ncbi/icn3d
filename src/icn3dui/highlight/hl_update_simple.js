/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.removeHlAll = function() { var me = this, ic = me.icn3d; "use strict";
       me.removeHlObjects();
};

iCn3DUI.prototype.removeHlObjects = function() { var me = this, ic = me.icn3d; "use strict";
       ic.removeHlObjects();
};

iCn3DUI.prototype.updateHlAll = function(commandnameArray, bSetMenu, bUnion) { var me = this, ic = me.icn3d; "use strict";
       me.updateHlObjects();
};

iCn3DUI.prototype.updateHlObjects = function() { var me = this, ic = me.icn3d; "use strict";
       ic.removeHlObjects();
       ic.addHlObjects();
};

iCn3DUI.prototype.toggleHighlight = function() { var me = this, ic = me.icn3d; "use strict";
    //me.setLogCmd("toggle highlight", true);

    if(ic.prevHighlightObjects.length > 0 || ic.prevHighlightObjects_ghost.length > 0) { // remove
        me.clearHighlight();
    }
    else { // add
        me.showHighlight();
    }

    me.setLogCmd("toggle highlight", true);
};

iCn3DUI.prototype.clearHighlight = function() { var me = this, ic = me.icn3d; "use strict";
    ic.labels['picking']=[];
    ic.draw();

    ic.removeHlObjects();
    if(ic.bRender) ic.render();
};

iCn3DUI.prototype.showHighlight = function() { var me = this, ic = me.icn3d; "use strict";
    ic.addHlObjects();
    me.updateHlAll();
    //me.bSelectResidue = true;
};

iCn3DUI.prototype.selectAChain = function (chainid, commandname, bAlign, bUnion) { var me = this, ic = me.icn3d; "use strict";
    commandname = commandname.replace(/\s/g, '');
    var command = 'select chain ' + chainid;

    //var residueHash = {}, chainHash = {};

    if(bUnion === undefined || !bUnion) {
        ic.hAtoms = {};
        me.menuHlHash = {};
    }
    else {
        ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[chainid]);

        if(me.menuHlHash === undefined) me.menuHlHash = {};
    }

    me.menuHlHash[chainid] = 1;

    //chainHash[chainid] = 1;

    var chnsSeq = (bAlign) ? ic.alnChainsSeq[chainid] : ic.chainsSeq[chainid];

    var oriResidueHash = {};
    for(var i = 0, il = chnsSeq.length; i < il; ++i) { // get residue number
        var resObj = chnsSeq[i];
        var residueid = chainid + "_" + resObj.resi;

        var value = resObj.name;

        if(value !== '' && value !== '-') {
          oriResidueHash[residueid] = 1;
          for(var j in ic.residues[residueid]) {
            ic.hAtoms[j] = 1;
          }
        }
    }

    if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(chainid)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(chainid)) ) {
        me.addCustomSelection(Object.keys(oriResidueHash), commandname, commandname, command, true);
    }

    if(bAlign) {
        me.updateHlAll(undefined, undefined, bUnion);
    }
    else {
        me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion);
    }

//        ic.addHlObjects();
//        me.updateHl2D(Object.keys(chainHash));
};
