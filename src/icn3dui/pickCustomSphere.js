/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.pickCustomSphere = function (radius, nameArray2, nameArray, bSphereCalc, bInteraction, type) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
    if(bSphereCalc) return;
    var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
    if(bInteraction) {
        select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
        ic.opts['contact'] = "yes";
    }
    var atomlistTarget, otherAtoms;
    // could be ligands
    atomlistTarget = me.getAtomsFromNameArray(nameArray2);
    otherAtoms = me.getAtomsFromNameArray(nameArray);
    var bGetPairs = true;
    var result = me.pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs);
    var residueArray = Object.keys(result.residues);
    ic.hAtoms = {};
    for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
      var residueid = residueArray[index];
      for(var i in ic.residues[residueid]) {
        ic.hAtoms[i] = 1;
      }
    }
    // do not change the set of displaying atoms
    //ic.dAtoms = ic.cloneHash(ic.atoms);
    var commandname, commanddesc;
    var firstAtom = ic.getFirstAtomObj(atomlistTarget);
    if(firstAtom !== undefined) {
        commandname = "sphere." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
        if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + ic.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + me.pre + "contactthreshold").val() + "A";
        commanddesc = commandname;
        me.addCustomSelection(residueArray, commandname, commanddesc, select, true);
    }
    me.saveSelectionIfSelected();
    ic.draw();
};
iCn3DUI.prototype.pickCustomSphere_base = function (radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
    var atoms;
    if(bInteraction) {
        atoms = ic.getAtomsWithinAtom(ic.intHash2Atoms(ic.dAtoms, otherAtoms), ic.intHash2Atoms(ic.dAtoms, atomlistTarget), parseFloat(radius), bGetPairs, bInteraction);
        me.resid2ResidhashInteractions = ic.cloneHash(ic.resid2Residhash);
    }
    else {
        atoms = ic.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction);
        me.resid2ResidhashSphere = ic.cloneHash(ic.resid2Residhash);
    }
    var residues = {}, atomArray = undefined;
    for (var i in atoms) {
        var atom = atoms[i];
        if(ic.bOpm && atom.resn === 'DUM') continue;
        var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        residues[residueid] = 1;
    }
    return {"residues": residues, "resid2Residhash": ic.resid2Residhash};
};
