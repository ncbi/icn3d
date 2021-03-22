/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.parseAtomData = function(data, pdbid, bFull, type, pdbid2) { var me = this, ic = me.icn3d; "use strict";
      if(type === 'mmtf') {
          me.parseMmtfData(data, pdbid, bFull);

          if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      }
      else if(type === 'mmcif') {
          me.loadAtomDataIn(data, data.mmcif, 'mmcifid', undefined, undefined);
          me.loadMmcifOpmDataPart2(data, pdbid);

          if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      }
      else if(type === 'pdb') {
          me.loadPdbData(data, pdbid);

          if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      }
      else if(type === 'align') {
          if(ic.bOpm) {
              me.downloadAlignmentPart2(pdbid);
              if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
          }
          else {
              if(pdbid2 !== undefined) {
                  me.loadOpmData(data, pdbid2, bFull, type);
              }
              else {
                  me.downloadAlignmentPart2(pdbid);
                  if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
              }
          }
      }
};
