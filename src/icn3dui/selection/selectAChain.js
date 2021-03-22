/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectAChain = function (chainid, commandname, bAlign, bUnion) { var me = this, ic = me.icn3d; "use strict";
    commandname = commandname.replace(/\s/g, '');
    var command = (bAlign !== undefined || bAlign) ? 'select alignChain ' + chainid : 'select chain ' + chainid;

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
    if(chnsSeq === undefined) chnsSeqLen = 0;
    else chnsSeqLen = chnsSeq.length;

    var oriResidueHash = {};
    for(var i = 0, il = chnsSeqLen; i < il; ++i) { // get residue number
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

    if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
        me.addCustomSelection(Object.keys(oriResidueHash), commandname, commandname, command, true);
    }

    var bForceHighlight = true;

    if(bAlign) {
        me.updateHlAll(undefined, undefined, bUnion, bForceHighlight);
    }
    else {
        me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion, bForceHighlight);
    }
};
