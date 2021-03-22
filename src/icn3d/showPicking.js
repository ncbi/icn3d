/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.showPicking = function(atom, x, y) { var me = this, ic = me.icn3d; "use strict";
    this.showPickingBase(atom, x, y); // including render step
};

iCn3D.prototype.showPickingBase = function(atom, x, y) { var me = this, ic = me.icn3d; "use strict";
  if(x === undefined && y === undefined) { // NOT mouse over
      this.showPickingHilight(atom); // including render step
  }
};

iCn3D.prototype.showPickingHilight = function(atom) { var me = this, ic = me.icn3d; "use strict";
  if(!this.bShift && !this.bCtrl) this.removeHlObjects();

  this.pickedAtomList = {};
  if(this.pk === 1) {
    this.pickedAtomList[atom.serial] = 1;
  }
  else if(this.pk === 2) {
    var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
    this.pickedAtomList = this.residues[residueid];
  }
  else if(this.pk === 3) {
    this.pickedAtomList = this.selectStrandHelixFromAtom(atom);
  }
  else if(this.pk === 4) {
    this.pickedAtomList = this.select3ddomainFromAtom(atom);
  }
  else if(this.pk === 5) {
    var chainid = atom.structure + '_' + atom.chain;
    this.pickedAtomList = this.chains[chainid];
  }

  if(this.pk === 0) {
      this.bShowHighlight = false;
  }
  else {
      this.bShowHighlight = true;
  }

  var intersectAtoms = (Object.keys(this.hAtoms).length == Object.keys(this.atoms).length) ? {} : this.intHash(this.hAtoms, this.pickedAtomList);
  var intersectAtomsSize = Object.keys(intersectAtoms).length;

  if(!this.bShift && !this.bCtrl) {
      //if(intersectAtomsSize > 0) {
      //    this.hAtoms = this.exclHash(this.hAtoms, this.pickedAtomList);
      //}
      //else {
      //    this.hAtoms = this.cloneHash(this.pickedAtomList);
      //}
      this.hAtoms = this.cloneHash(this.pickedAtomList);
  }
  else if(this.bShift) { // select a range

    if(this.prevPickedAtomList === undefined) {
        this.hAtoms = this.unionHash(this.hAtoms, this.pickedAtomList);
    }
    else {
        var prevAtom = this.getFirstAtomObj(this.prevPickedAtomList);
        var currAtom = this.getFirstAtomObj(this.pickedAtomList);

        var prevChainid = prevAtom.structure + '_' + prevAtom.chain;
        var currChainid = currAtom.structure + '_' + currAtom.chain;

        if(prevChainid != currChainid) {
            this.hAtoms = this.unionHash(this.hAtoms, this.pickedAtomList);
        }
        else { // range in the same chain only
            var combinedAtomList;
            combinedAtomList = this.unionHash(combinedAtomList, this.prevPickedAtomList);
            combinedAtomList = this.unionHash(combinedAtomList, this.pickedAtomList);

            var firstAtom = this.getFirstAtomObj(combinedAtomList);
            var lastAtom = this.getLastAtomObj(combinedAtomList);

            for(var i = firstAtom.serial; i <= lastAtom.serial; ++i) {
                this.hAtoms[i] = 1;
            }
        }
    }

    // remember this shift selection
    this.prevPickedAtomList = this.cloneHash(this.pickedAtomList);
  }
  else if(this.bCtrl) {
      if(intersectAtomsSize > 0) {
          this.hAtoms = this.exclHash(this.hAtoms, this.pickedAtomList);
      }
      else {
          this.hAtoms = this.unionHash(this.hAtoms, this.pickedAtomList);
      }
  }

  this.removeHlObjects();
  this.addHlObjects();
};

