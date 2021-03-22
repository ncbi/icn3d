/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.addHlObjects = function (color, bRender, atomsHash) { var me = this, ic = me.icn3d; "use strict";
   if(color === undefined) color = this.hColor;
   if(atomsHash === undefined) atomsHash = this.hAtoms;

   this.applyDisplayOptions(this.opts, this.intHash(atomsHash, this.dAtoms), this.bHighlight);

   if( (bRender) || (this.bRender) ) this.render();
};

iCn3D.prototype.removeHlObjects = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   for(var i in this.prevHighlightObjects) {
       this.mdl.remove(this.prevHighlightObjects[i]);
   }

   this.prevHighlightObjects = [];

   // remove prevous highlight
   for(var i in this.prevHighlightObjects_ghost) {
       this.mdl.remove(this.prevHighlightObjects_ghost[i]);
   }

   this.prevHighlightObjects_ghost = [];
};
