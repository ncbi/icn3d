/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.retrieveInteractionData = function() { var me = this, ic = me.icn3d; "use strict";
     if(!me.b2DShown) {
         if(me.cfg.align !== undefined) {
             var structureArray = Object.keys(ic.structures);
             me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
         }
         else if(me.cfg.chainalign !== undefined) {
             var structureArray = Object.keys(ic.structures);
             //if(structureArray.length == 2) {
             //   me.set2DDiagramsForAlign(structureArray[1].toUpperCase(), structureArray[0].toUpperCase());
             //}
             //else if(structureArray.length == 1) {
             //   me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[0].toUpperCase());
             //}
             me.set2DDiagramsForChainalign(me.chainidArray);
         }
         else {
             me.download2Ddgm(me.inputid.toUpperCase());
         }
     }
};
