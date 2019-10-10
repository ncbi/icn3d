/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.removeHlAll = function() { var me = this;
       me.removeHlObjects();
};

iCn3DUI.prototype.removeHlObjects = function() { var me = this;
       me.icn3d.removeHlObjects();
};

iCn3DUI.prototype.updateHlAll = function(commandnameArray, bSetMenu, bUnion) { var me = this;
       me.updateHlObjects();
};

iCn3DUI.prototype.updateHlObjects = function() { var me = this;
       me.icn3d.removeHlObjects();
       me.icn3d.addHlObjects();
};

iCn3DUI.prototype.toggleHighlight = function() { var me = this;
    //me.setLogCmd("toggle highlight", true);

    if(me.icn3d.prevHighlightObjects.length > 0 || me.icn3d.prevHighlightObjects_ghost.length > 0
      || me.icn3d.prevHighlightObjects2.length > 0 || me.icn3d.prevHighlightObjects_ghost2.length > 0) { // remove
        me.clearHighlight();
    }
    else { // add
        me.showHighlight();
    }

    me.setLogCmd("toggle highlight", true);
};

iCn3DUI.prototype.clearHighlight = function() { var me = this;
    me.icn3d.labels['picking']=[];
    me.icn3d.draw();

    me.icn3d.removeHlObjects();
    me.icn3d.render();
};

iCn3DUI.prototype.showHighlight = function() { var me = this;
    me.icn3d.addHlObjects();
    me.updateHlAll();
    //me.bSelectResidue = true;
};

iCn3DUI.prototype.selectAChain = function (chainid, commandname, bAlign, bUnion) { var me = this;
    var commandname = commandname.replace(/\s/g, '');
    var command = 'select chain ' + chainid;

    //var residueHash = {}, chainHash = {};

    if(bUnion === undefined || !bUnion) {
        me.icn3d.hAtoms = {};
        me.menuHlHash = {};
    }
    else {
        me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[chainid]);

        if(me.menuHlHash === undefined) me.menuHlHash = {};
    }

    me.menuHlHash[chainid] = 1;

    //chainHash[chainid] = 1;

    var chnsSeq = (bAlign) ? me.icn3d.alnChainsSeq[chainid] : me.icn3d.chainsSeq[chainid];

    var oriResidueHash = {};
    for(var i = 0, il = chnsSeq.length; i < il; ++i) { // get residue number
        var resObj = chnsSeq[i];
        var residueid = chainid + "_" + resObj.resi;

        var value = resObj.name;

        if(value !== '' && value !== '-') {
          oriResidueHash[residueid] = 1;
          for(var j in me.icn3d.residues[residueid]) {
            me.icn3d.hAtoms[j] = 1;
          }
        }
    }

    if((me.icn3d.defNames2Atoms === undefined || !me.icn3d.defNames2Atoms.hasOwnProperty(chainid)) && (me.icn3d.defNames2Residues === undefined || !me.icn3d.defNames2Residues.hasOwnProperty(chainid)) ) {
        me.addCustomSelection(Object.keys(oriResidueHash), commandname, commandname, command, true);
    }

    if(bAlign) {
        me.updateHlAll(undefined, undefined, bUnion);
    }
    else {
        me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion);
    }

//        me.icn3d.addHlObjects();
//        me.updateHl2D(Object.keys(chainHash));
};
