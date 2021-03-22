/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.addChainLabels = function (atoms) { var me = this, ic = me.icn3d; "use strict";
    var size = 18;
    var background = "#CCCCCC";
    var atomsHash = ic.intHash(ic.hAtoms, atoms);
    if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
    var chainHash = ic.getChainsFromAtoms(atomsHash);
    for(var chainid in chainHash) {
        var label = {};
        label.position = ic.centerAtoms(ic.chains[chainid]).center;
        var pos = chainid.indexOf('_');
        var chainName = chainid.substr(pos + 1);
        var proteinName = me.getProteinName(chainid);
        if(proteinName.length > 20) proteinName = proteinName.substr(0, 20) + '...';
        label.text = 'Chain ' + chainName + ': ' + proteinName;
        label.size = size;
        var atomColorStr = ic.getFirstCalphaAtomObj(ic.chains[chainid]).color.getHexString().toUpperCase();
        label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
        label.background = background;
        ic.labels['chain'].push(label);
    }
    ic.removeHlObjects();
};
iCn3DUI.prototype.addTerminiLabels = function (atoms) { var me = this, ic = me.icn3d; "use strict";
    var size = 18;
    var background = "#CCCCCC";
    var protNucl;
    protNucl = ic.unionHash(protNucl, ic.proteins);
    protNucl = ic.unionHash(protNucl, ic.nucleotides);
    var hlProtNucl = ic.intHash(ic.dAtoms, protNucl);
    var atomsHash = ic.intHash(hlProtNucl, atoms);
    if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
    var chainHash = ic.getChainsFromAtoms(atomsHash);
    for(var chainid in chainHash) {
        var chainAtomsHash = ic.intHash(hlProtNucl, ic.chains[chainid]);
        var serialArray = Object.keys(chainAtomsHash);
        var firstAtom = ic.atoms[serialArray[0]];
        var lastAtom = ic.atoms[serialArray[serialArray.length - 1]];
        var labelN = {}, labelC = {};
        labelN.position = firstAtom.coord;
        labelC.position = lastAtom.coord;
        labelN.text = 'N-';
        labelC.text = 'C-';
        if(ic.nucleotides.hasOwnProperty(firstAtom.serial)) {
            labelN.text = "5'";
            labelC.text = "3'";
        }
        labelN.size = size;
        labelC.size = size;
        var atomNColorStr = firstAtom.color.getHexString().toUpperCase();
        var atomCColorStr = lastAtom.color.getHexString().toUpperCase();
        labelN.color = (atomNColorStr === "CCCCCC" || atomNColorStr === "C8C8C8") ? "#888888" : "#" + atomNColorStr;
        labelC.color = (atomCColorStr === "CCCCCC" || atomCColorStr === "C8C8C8") ? "#888888" : "#" + atomCColorStr;
        labelN.background = background;
        labelC.background = background;
        ic.labels['chain'].push(labelN);
        ic.labels['chain'].push(labelC);
    }
    ic.removeHlObjects();
};
