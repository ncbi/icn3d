/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getAtomsFromSet = function (commandname) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
   var residuesHash = {};
   // defined sets is not set up
   if(ic.defNames2Residues['proteins'] === undefined) {
       me.showSets();
   }
   //for(var i = 0, il = nameArray.length; i < il; ++i) {
       //var commandname = nameArray[i];
       if(Object.keys(ic.chains).indexOf(commandname) !== -1) {
           residuesHash = ic.unionHash(residuesHash, ic.chains[commandname]);
       }
       else {
           if(ic.defNames2Residues[commandname] !== undefined && ic.defNames2Residues[commandname].length > 0) {
               for(var j = 0, jl = ic.defNames2Residues[commandname].length; j < jl; ++j) {
                   var resid = ic.defNames2Residues[commandname][j]; // return an array of resid
                   residuesHash = ic.unionHash(residuesHash, ic.residues[resid]);
               }
           }
           if(ic.defNames2Atoms[commandname] !== undefined && ic.defNames2Atoms[commandname].length > 0) {
               for(var j = 0, jl = ic.defNames2Atoms[commandname].length; j < jl; ++j) {
                   //var resid = ic.defNames2Atoms[commandname][j]; // return an array of serial
                   //residuesHash = ic.unionHash(residuesHash, ic.residues[resid]);
                   var serial = ic.defNames2Atoms[commandname][j]; // return an array of serial
                   residuesHash[serial] = 1;
               }
           }
       }
   //}
   return residuesHash;
};

iCn3DUI.prototype.getAtomsFromSets = function (nameArray) {   var me = this, ic = me.icn3d; "use strict";  // ic.pAtom is set already
   var residuesHash = {};
   for(var i = 0, il = nameArray.length; i < il; ++i) {
       commandname = nameArray[i];
       var residuesHashTmp = me.getAtomsFromSet(commandname);
       residuesHash = ic.unionHash(residuesHash, residuesHashTmp);
   }
   return residuesHash;
};

iCn3DUI.prototype.getAtomsFromNameArray = function (nameArray) {   var me = this, ic = me.icn3d; "use strict";
    var selAtoms = {};
    for(var i = 0, il = nameArray.length; i < il; ++i) {
        if(nameArray[i] === 'non-selected') { // select all hAtoms
           var currAtoms = {};
           for(var i in ic.atoms) {
               if(!ic.hAtoms.hasOwnProperty(i) && ic.dAtoms.hasOwnProperty(i)) {
                   currAtoms[i] = ic.atoms[i];
               }
           }
           selAtoms = ic.unionHash(selAtoms, currAtoms);
        }
        else if(nameArray[i] === 'selected') {
            selAtoms = ic.unionHash(selAtoms, ic.hash2Atoms(ic.hAtoms) );
        }
        else {
            selAtoms = ic.unionHash(selAtoms, ic.hash2Atoms(me.getAtomsFromSet(nameArray[i])) );
        }
    }
    if(nameArray.length == 0) selAtoms = ic.atoms;
    return selAtoms;
};
