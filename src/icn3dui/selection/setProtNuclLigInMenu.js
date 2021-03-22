/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setProtNuclLigInMenu = function () { var me = this, ic = me.icn3d; "use strict";
    // Initially, add proteins, nucleotides, chemicals, ions, water into the menu "custom selections"
    if(Object.keys(ic.proteins).length > 0) {
      //ic.defNames2Atoms['proteins'] = Object.keys(ic.proteins);
      ic.defNames2Residues['proteins'] = Object.keys(ic.getResiduesFromAtoms(ic.proteins));
      ic.defNames2Descr['proteins'] = 'proteins';
      ic.defNames2Command['proteins'] = 'select :proteins';
    }

    if(Object.keys(ic.nucleotides).length > 0) {
      //ic.defNames2Atoms['nucleotides'] = Object.keys(ic.nucleotides);
      ic.defNames2Residues['nucleotides'] = Object.keys(ic.getResiduesFromAtoms(ic.nucleotides));
      ic.defNames2Descr['nucleotides'] = 'nucleotides';
      ic.defNames2Command['nucleotides'] = 'select :nucleotides';
    }

    if(Object.keys(ic.chemicals).length > 0) {
      //ic.defNames2Atoms['chemicals'] = Object.keys(ic.chemicals);
      if(ic.bOpm) {
          var chemicalResHash = {}, memResHash = {};
          for(var serial in ic.chemicals) {
              var atom = ic.atoms[serial];
              var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
              if(atom.resn === 'DUM') {
                  memResHash[residueid] = 1;
              }
              else {
                  chemicalResHash[residueid] = 1;
              }
          }

          if(Object.keys(chemicalResHash).length > 0) {
              ic.defNames2Residues['chemicals'] = Object.keys(chemicalResHash);
              ic.defNames2Descr['chemicals'] = 'chemicals';
              ic.defNames2Command['chemicals'] = 'select :chemicals';
          }

          if(Object.keys(memResHash).length > 0) {
              ic.defNames2Residues['membrane'] = Object.keys(memResHash);
              ic.defNames2Descr['membrane'] = 'membrane';
              ic.defNames2Command['membrane'] = 'select :membrane';
          }
      }
      else {
          ic.defNames2Residues['chemicals'] = Object.keys(ic.getResiduesFromAtoms(ic.chemicals));
          ic.defNames2Descr['chemicals'] = 'chemicals';
          ic.defNames2Command['chemicals'] = 'select :chemicals';
      }
    }

    if(Object.keys(ic.ions).length > 0) {
      //ic.defNames2Atoms['ions'] = Object.keys(ic.ions);
      ic.defNames2Residues['ions'] = Object.keys(ic.getResiduesFromAtoms(ic.ions));
      ic.defNames2Descr['ions'] = 'ions';
      ic.defNames2Command['ions'] = 'select :ions';
    }

    if(Object.keys(ic.water).length > 0) {
      //ic.defNames2Atoms['water'] = Object.keys(ic.water);
      ic.defNames2Residues['water'] = Object.keys(ic.getResiduesFromAtoms(ic.water));
      ic.defNames2Descr['water'] = 'water';
      ic.defNames2Command['water'] = 'select :water';
    }

    me.setTransmemInMenu(ic.halfBilayerSize, -ic.halfBilayerSize);
};
