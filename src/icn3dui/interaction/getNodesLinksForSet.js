/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.getNodesLinksForSet = function(atomSet, labelType, setName) { var me = this, ic = me.icn3d; "use strict";
   //var nodeStr = '', linkStr = '';
   var nodeArray = [], linkArray = [];
   var cnt = 0, linkCnt = 0;
   var thickness = me.coilValue;
   var prevChain = '', prevResName = '', prevResi = 0, prevAtom;
   // add chemicals as well
   var residHash = {};
   for(var i in atomSet) {
       var atom = ic.atoms[i];
       if(atom.chain != 'DUM' && (atom.het || (atom.name == "CA" && atom.elem == "C") || atom.name == "O3'" || atom.name == "O3*" || atom.name == "P")) {
       // starting nucleotide have "P"
       //if(atom.chain != 'DUM' && (atom.name == "CA" || atom.name == "P")) {
           var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
           if(residHash.hasOwnProperty(resid)) {
               continue;
           }
           else {
               residHash[resid] = 1;
           }
           var resName = ic.residueName2Abbr(atom.resn) + atom.resi;
           if(labelType == 'chain' || labelType == 'structure') resName += '.' + atom.chain;
           if(labelType == 'structure') resName += '.' + atom.structure;
           // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
           var residLabel = '1_1_' + resid;
           //if(cnt > 0) nodeStr += ', ';
           nodeArray.push('{"id": "' + resName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + atom.coord.x.toFixed(0)
               + ', "y": ' + atom.coord.y.toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
           if(cnt > 0 && prevChain == atom.chain && (atom.resi == prevResi + 1 || atom.resi == prevResi) ) {
               //if(linkCnt > 0) linkStr += ', ';
               linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                   + '", "v": ' + thickness + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
               if(atom.ssbegin) thickness = me.ssValue;
               if(atom.ssend) thickness = me.coilValue;
               ++linkCnt;
           }
           prevChain = atom.chain;
           prevResName = resName;
           prevResi = atom.resi;
           ++cnt;
       }
   }
   return {"node": nodeArray, "link":linkArray};
};
iCn3DUI.prototype.getHbondLinksForSet = function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
    var resid2ResidhashHbond = {};
    var threshold = parseFloat($("#" + me.pre + "hbondthreshold" ).val());
    // not only protein or nucleotides, could be ligands
    var firstSetAtoms = atoms;
    var complement = firstSetAtoms;
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var bSaltbridge = false;
        var selectedAtoms = ic.calculateChemicalHbonds(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );
        resid2ResidhashHbond = ic.cloneHash(ic.resid2Residhash);
    }
    var hbondStr = me.getGraphLinks(resid2ResidhashHbond, resid2ResidhashHbond, me.hbondInsideColor, labelType, me.hbondInsideValue);
    return hbondStr;
};
iCn3DUI.prototype.getIonicLinksForSet = function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
    var resid2Residhash = {};
    var threshold = parseFloat($("#" + me.pre + "saltbridgethreshold" ).val());
    // not only protein or nucleotides, could be ligands
    var firstSetAtoms = atoms;
    var complement = firstSetAtoms;
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var bSaltbridge = false;
        var selectedAtoms = ic.calculateIonicInteractions(ic.intHash2Atoms(ic.dAtoms, complement), ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), parseFloat(threshold), bSaltbridge, 'graph', true );
        resid2Residhash = ic.cloneHash(ic.resid2Residhash);
    }
    var ionicStr = me.getGraphLinks(resid2Residhash, resid2Residhash, me.ionicInsideColor, labelType, me.ionicInsideValue);
    return ionicStr;
};
iCn3DUI.prototype.getHalogenPiLinksForSet = function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
    var resid2Residhash = {};
    var firstSetAtoms = atoms;
    var complement = firstSetAtoms;
    var halogenpiStr = '', threshold;
    threshold = parseFloat($("#" + me.pre + "halogenthreshold" ).val());
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'halogen', true );
        resid2Residhash = ic.cloneHash(ic.resid2Residhash);
    }
    halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.halogenInsideColor, labelType, me.halogenInsideValue);
    threshold = parseFloat($("#" + me.pre + "picationthreshold" ).val());
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-cation', true );
        resid2Residhash = ic.cloneHash(ic.resid2Residhash);
    }
    halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.picationInsideColor, labelType, me.picationInsideValue);
    threshold = parseFloat($("#" + me.pre + "pistackingthreshold" ).val());
    if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
        var selectedAtoms = ic.calculateHalogenPiInteractions(ic.intHash2Atoms(ic.dAtoms, firstSetAtoms), ic.intHash2Atoms(ic.dAtoms, complement), parseFloat(threshold), 'graph', 'pi-stacking', true );
        resid2Residhash = ic.cloneHash(ic.resid2Residhash);
    }
    halogenpiStr += me.getGraphLinks(resid2Residhash, resid2Residhash, me.pistackingInsideColor, labelType, me.pistackingInsideValue);
    return halogenpiStr;
};
iCn3DUI.prototype.getContactLinksForSet = function(atoms, labelType) { var me = this, ic = me.icn3d; "use strict";
    var ssAtomsArray = [];
    var prevSS = '', prevChain = '';
    var ssAtoms = {};
    for(var i in atoms) {
        var atom = ic.atoms[i];
        if(atom.ss != prevSS || atom.chain != prevChain) {
            if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
            ssAtoms = {};
        }
        ssAtoms[atom.serial] = 1;
        prevSS = atom.ss;
        prevChain = atom.chain;
    }
    // last ss
    if(Object.keys(ssAtoms).length > 0) ssAtomsArray.push(ssAtoms);
    var len = ssAtomsArray.length;
    var interStr = '';
    for(var i = 0; i < len; ++i) {
        for(var j = i + 1; j < len; ++j) {
            interStr += me.getContactLinks(ssAtomsArray[i], ssAtomsArray[j], labelType, true);
        }
    }
    return interStr;
};
iCn3DUI.prototype.getContactLinks = function(atomlistTarget, otherAtoms, labelType, bInternal) { var me = this, ic = me.icn3d; "use strict";
    var radius = parseFloat($("#" + me.pre + "contactthreshold" ).val());
    var bGetPairs = true, bInteraction = false;
    var atoms = ic.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction, bInternal);
    var residHash = ic.cloneHash(ic.resid2Residhash);
    var interStr = me.getGraphLinks(residHash, residHash, me.contactInsideColor, labelType, me.contactInsideValue);
    return interStr;
};
iCn3DUI.prototype.compNode = function(a, b, bReverseChain) { var me = this, ic = me.icn3d; "use strict";
  var resid1 = a.r.substr(4); // 1_1_1KQ2_A_1
  var resid2 = b.r.substr(4); // 1_1_1KQ2_A_1
  var aIdArray = me.getIdArray(resid1); //resid1.split('_');
  var bIdArray = me.getIdArray(resid2); //resid2.split('_');
  var aChainid = aIdArray[0] + '_' + aIdArray[1];
  var bChainid = bIdArray[0] + '_' + bIdArray[1];
  var aResi = parseInt(aIdArray[2]);
  var bResi = parseInt(bIdArray[2]);
  if(aChainid > bChainid){
      if(bReverseChain) return -1;
      else return 1;
  }
  else if(aChainid < bChainid){
      if(bReverseChain) return 1;
      else return -1;
  }
  else if(aChainid == bChainid){
    return (aResi > bResi) ? 1 : (aResi < bResi) ? -1 : 0;
  }
};
