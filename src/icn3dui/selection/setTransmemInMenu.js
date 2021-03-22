/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTransmemInMenu = function (posZ, negZ, bReset) { var me = this, ic = me.icn3d; "use strict";
    // set transmembrane, extracellular, intracellular
    if(ic.bOpm) {
      var transmembraneHash = {}, extracellularHash = {}, intracellularHash = {};
      for(var serial in ic.atoms) {
          var atom = ic.atoms[serial];

          if(atom.resn === 'DUM') continue;

          var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
          if(atom.coord.z > posZ) {
              extracellularHash[residueid] = 1;
          }
          else if(atom.coord.z < negZ) {
              intracellularHash[residueid] = 1;
          }
          else {
              transmembraneHash[residueid] = 1;
          }
      }

      var extraStr = (bReset) ? '2' : '';

      if(Object.keys(transmembraneHash).length > 0) {
          ic.defNames2Residues['transmembrane' + extraStr] = Object.keys(transmembraneHash);
          ic.defNames2Descr['transmembrane' + extraStr] = 'transmembrane' + extraStr;
          ic.defNames2Command['transmembrane' + extraStr] = 'select :transmembrane' + extraStr;
      }

      if(Object.keys(extracellularHash).length > 0) {
          ic.defNames2Residues['extracellular' + extraStr] = Object.keys(extracellularHash);
          ic.defNames2Descr['extracellular' + extraStr] = 'extracellular' + extraStr;
          ic.defNames2Command['extracellular' + extraStr] = 'select :extracellular' + extraStr;
      }

      if(Object.keys(intracellularHash).length > 0) {
          ic.defNames2Residues['intracellular' + extraStr] = Object.keys(intracellularHash);
          ic.defNames2Descr['intracellular' + extraStr] = 'intracellular' + extraStr;
          ic.defNames2Command['intracellular' + extraStr] = 'select :intracellular' + extraStr;
      }
    }
};
