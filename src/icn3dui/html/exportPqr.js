/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.exportPqr = function() { var me = this, ic = me.icn3d; "use strict";
   var chainHash = {}, ionHash = {};
   var atomHash = {};
/*
   for(var i in ic.hAtoms) {
       var atom = ic.atoms[i];

       if(ic.ions.hasOwnProperty(i)) {
         ionHash[i] = 1;
       }
       else {
         chainHash[atom.structure + '_' + atom.chain] = 1;
       }
   }

   for(var chainid in chainHash) {
       atomHash = ic.unionHash(atomHash, ic.chains[chainid]);
   }
*/

   var atoms = ic.intHash(ic.dAtoms, ic.hAtoms);
   for(var i in atoms) {
       var atom = ic.atoms[i];

       if(ic.ions.hasOwnProperty(i)) {
         ionHash[i] = 1;
       }
       else {
         atomHash[i] = 1;
       }
   }

   if(me.cfg.cid) {
      var pqrStr = '';
      pqrStr += me.getPDBHeader();
      pqrStr += me.getAtomPDB(atomHash, true) + me.getAtomPDB(ionHash, true);

      var file_pref = (me.inputid) ? me.inputid : "custom";
      me.saveFile(file_pref + '_icn3d.pqr', 'text', [pqrStr]);
   }
   else {
       var bCalphaOnly = ic.isCalphaPhosOnly(ic.hash2Atoms(atomHash));
       if(bCalphaOnly) {
           alert("The potential will not be shown because the side chains are missing in the structure...");
           return;
       }

       var pdbstr = '';
       pdbstr += me.getPDBHeader();

       pdbstr += me.getAtomPDB(atomHash);
       pdbstr += me.getAtomPDB(ionHash, true);

       var url = "https://www.ncbi.nlm.nih.gov/Structure/delphi/delphi.fcgi";

       var pdbid = (me.cfg.cid) ? me.cfg.cid : Object.keys(ic.structures).toString();

       $.ajax({
          url: url,
          type: 'POST',
          data : {'pdb2pqr': pdbstr, 'pdbid': pdbid},
          dataType: 'text',
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1,
          beforeSend: function() {
              me.showLoading();
          },
          complete: function() {
              me.hideLoading();
          },
          success: function(data) {
              var pqrStr = data;

              var file_pref = (me.inputid) ? me.inputid : "custom";
              me.saveFile(file_pref + '_icn3d_residues.pqr', 'text', [pqrStr]);
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            return;
          }
       });
   }
};
