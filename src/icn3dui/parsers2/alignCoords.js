/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.alignCoords = function(coordsFrom, coordsTo, secondStruct, bKeepSeq, chainid_t, chainid, chainIndex, bChainAlign) { var me = this, ic = me.icn3d; "use strict";
  //var n = coordsFrom.length;
  var n = (coordsFrom.length < coordsTo.length) ? coordsFrom.length : coordsTo.length;

  var hAtoms = {};

  if(n < 4) alert("Please select at least four residues in each structure...");
  if(n >= 4) {
      ic.rmsd_suprTmp = ic.getRmsdSupr(coordsFrom, coordsTo, n);

      // apply matrix for each atom
      if(ic.rmsd_suprTmp.rot !== undefined) {
          var rot = ic.rmsd_suprTmp.rot;
          if(rot[0] === null) alert("Please select more residues in each structure...");

          var centerFrom = ic.rmsd_suprTmp.trans1;
          var centerTo = ic.rmsd_suprTmp.trans2;
          var rmsd = ic.rmsd_suprTmp.rmsd;

          if(rmsd) {
              me.setLogCmd("realignment RMSD: " + rmsd.toPrecision(4), false);
              $("#" + me.pre + "realignrmsd").val(rmsd.toPrecision(4));
              if(!me.cfg.bSidebyside) me.openDlg('dl_rmsd', 'Realignment RMSD');
          }

          for(var i = 0, il = ic.structures[secondStruct].length; i < il; ++i) {
              var chainidTmp = ic.structures[secondStruct][i];

              for(var j in ic.chains[chainidTmp]) {
                var atom = ic.atoms[j];
                atom.coord = ic.transformMemPro(atom.coord, rot, centerFrom, centerTo);
              }
          }

          me.bRealign = true;

          if(!bKeepSeq) me.setSeqAlignForRealign(chainid_t, chainid, chainIndex);

          var bShowHighlight = false;
          var seqObj = me.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight);

          var oriHtml = (chainIndex === 1) ? '' : $("#" + me.pre + "dl_sequence2").html();
          $("#" + me.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
          $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);

          me.openDlg('dl_alignment', 'Select residues in aligned sequences');

          if(!bChainAlign) {
              me.opts['color'] = 'identity';
              ic.setColorByOptions(me.opts, ic.hAtoms);
          }

          //ic.draw();

          hAtoms = ic.hAtoms;
      }
  }

  return hAtoms;
};
