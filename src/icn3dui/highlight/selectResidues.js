/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectResidues = function(id, that) { var me = this, ic = me.icn3d; "use strict";
  if(id !== undefined && id !== '') {
    // add "align_" in front of id so that full sequence and aligned sequence will not conflict
    //if(id.substr(0, 5) === 'align') id = id.substr(5);

    // seq_div0_1TSR_A_1, align_div0..., giseq_div0..., snp_div0..., interaction_div0..., cddsite_div0..., domain_div0...
    id = id.substr(id.indexOf('_') + 1);

    me.bSelectResidue = true;

    $(that).toggleClass('icn3d-highlightSeq');

    var residueid = id.substr(id.indexOf('_') + 1);

    if(ic.residues.hasOwnProperty(residueid)) {
        if($(that).hasClass('icn3d-highlightSeq')) {
          for(var j in ic.residues[residueid]) {
            ic.hAtoms[j] = 1;
          }

          me.selectedResidues[residueid] = 1;

          if(me.bAnnotations && $(that).attr('disease') !== undefined) {
              var label = $(that).attr('disease');

              var position = ic.centerAtoms(ic.hash2Atoms(ic.residues[residueid]));
              //position.center.add(new THREE.Vector3(3.0, 3.0, 3.0)); // shift a little bit

              var maxlen = 15;
              if(label.length > maxlen) label = label.substr(0, maxlen) + '...';

              //var size = parseInt(ic.LABELSIZE * 10 / label.length);
              var size = ic.LABELSIZE;
              var color = me.GREYD;
              me.addLabel(label, position.center.x, position.center.y, position.center.z, size, color, undefined, 'custom');
          }
        }
        else {
            for (var i in ic.residues[residueid]) {
              //ic.hAtoms[i] = undefined;
              delete ic.hAtoms[i];
            }
            //me.selectedResidues[residueid] = undefined;
            delete me.selectedResidues[residueid];

            ic.removeHlObjects();
        }
    }
  }
};
