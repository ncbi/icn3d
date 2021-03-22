/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.atoms2spec = function(atomHash) { var me = this, ic = me.icn3d; "use strict";
    var spec = "";

    var i = 0;
    var structureHash = {}, chainHash = {}, resiHash = {};
    for(var serial in atomHash) {
        var atom = ic.atoms[serial];
        if(i > 0) {
            spec += ' or ';
        }
        spec += '$' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;

        structureHash[atom.structure] = 1;
        chainHash[atom.structure + '_' + atom.chain] = 1;
        resiHash[atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;

        ++i;
    }

    if(Object.keys(resiHash).length == 1) {
        var tmpStr = '\\$' + atom.structure + '\\.' + atom.chain + ':' + atom.resi;
        spec = spec.replace(new RegExp(tmpStr,'g'), '');
    }
    else if(Object.keys(chainHash).length == 1) {
        var tmpStr = '\\$' + atom.structure + '\\.' + atom.chain;
        spec = spec.replace(new RegExp(tmpStr,'g'), '');
    }
    else if(Object.keys(structureHash).length == 1) {
        var tmpStr = '\\$' + atom.structure;
        spec = spec.replace(new RegExp(tmpStr,'g'), '');
    }

    return spec;
};
