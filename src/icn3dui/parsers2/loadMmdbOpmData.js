/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadMmdbOpmData = function(data, pdbid, type) { var me = this, ic = me.icn3d; "use strict";
  if(data.opm !== undefined && data.opm.rot !== undefined) {
      ic.bOpm = true;

//      me.selectedPdbid = pdbid;

      me.setOpmData(data);

      me.parseMmdbDataPart1(data, type);
      me.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type);

      me.loadMmdbOpmDataPart2(data, pdbid, type);
  }
  else {
      me.parseMmdbDataPart1(data, type);
      me.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type);
      me.loadMmdbOpmDataPart2(data, pdbid, type);
  }
};
