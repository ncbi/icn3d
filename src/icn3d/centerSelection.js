/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.centerSelection = function(atoms) { var me = this, ic = me.icn3d; "use strict";
   //this.resetOrientation();

   this.opts['rotationcenter'] = 'highlight center';

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

    // reset parameters
    this._zoomFactor = 1.0;
    this.mouseChange = new THREE.Vector2(0,0);
    this.quaternion = new THREE.Quaternion(0,0,0,1);

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};
