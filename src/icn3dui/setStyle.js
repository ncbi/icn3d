/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setStyle = function (selectionType, style) { var me = this, ic = me.icn3d; "use strict";
  var atoms = {};
  var bAll = true;
  switch (selectionType) {
      case 'proteins':
          atoms = ic.intHash(ic.hAtoms, ic.proteins);
          if(Object.keys(ic.hAtoms).length < Object.keys(ic.proteins).length) bAll = false;
          break;
      case 'sidec':
          atoms = ic.intHash(ic.hAtoms, ic.sidec);
          //calpha_atoms = ic.intHash(ic.hAtoms, ic.calphas);
          // include calphas
          //atoms = ic.unionHash(atoms, calpha_atoms);
          break;
      case 'nucleotides':
          atoms = ic.intHash(ic.hAtoms, ic.nucleotides);
          if(Object.keys(ic.hAtoms).length < Object.keys(ic.nucleotides).length) bAll = false;
          break;
      case 'chemicals':
          atoms = ic.intHash(ic.hAtoms, ic.chemicals);
          break;
      case 'ions':
          atoms = ic.intHash(ic.hAtoms, ic.ions);
          break;
      case 'water':
          atoms = ic.intHash(ic.hAtoms, ic.water);
          break;
  }
  // draw sidec separatedly
  if(selectionType === 'sidec') {
      for(var i in atoms) {
        ic.atoms[i].style2 = style;
      }
  }
  else {
      //if(!bAll) {
      //    atoms = ic.getSSExpandedAtoms(ic.hash2Atoms(atoms));
      //}
      for(var i in atoms) {
        ic.atoms[i].style = style;
      }
  }
  ic.opts[selectionType] = style;
  me.saveSelectionIfSelected();
  ic.draw();
};
