/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.zoominSelection = function(atoms) { var me = this, ic = me.icn3d; "use strict";
   var para = {};

   para._zoomFactor = 1.0 / me._zoomFactor;
   para.update = true;

   if(this.bControlGl) {
      window.controls.update(para);
   }
   else {
      this.controls.update(para);
   }

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.maxD = centerAtomsResults.maxD;
           if (this.maxD < 5) this.maxD = 5;

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};
