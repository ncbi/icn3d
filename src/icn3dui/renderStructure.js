/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.renderStructure = function () {  var me = this, ic = me.icn3d; "use strict";
  if(ic.bInitial) {
      jQuery.extend(ic.opts, me.opts);
      if(ic.bOpm && (me.cfg.align !== undefined || me.cfg.chainalign !== undefined)) { // show membrane
          var resid = me.selectedPdbid + '_MEM_1';
          for(var i in ic.residues[resid]) {
              var atom = ic.atoms[i];
              atom.style = 'stick';
              atom.color = ic.atomColors[atom.name];
              ic.atomPrevColors[i] = atom.color;
              ic.dAtoms[i] = 1;
          }
      }
      if(me.cfg.command !== undefined && me.cfg.command !== '') {
          ic.bRender = false;
          ic.draw();
      }
      else {
          me.oneStructurePerWindow(); // for alignment
          ic.draw();
      }
      if(ic.bOpm) {
          var axis = new THREE.Vector3(1,0,0);
          var angle = -0.5 * Math.PI;
          ic.setRotation(axis, angle);
      }
      if(Object.keys(ic.structures).length > 1) {
          $("#" + me.pre + "alternate").show();
      }
      else {
          $("#" + me.pre + "alternate").hide();
      }
  }
  else {
      me.saveSelectionIfSelected();
      ic.draw();
  }

  if(ic.bInitial && me.cfg.command !== undefined && me.cfg.command !== '') {
      if(Object.keys(ic.structures).length == 1) {
          var id = Object.keys(ic.structures)[0];
          me.cfg.command = me.cfg.command.replace(new RegExp('!','g'), id + '_');
      }
      // final step resolved me.deferred
      me.loadScript(me.cfg.command);
  }
  else {
      if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
  }
  if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign || ( me.bInputfile && me.InputfileType == 'pdb' && Object.keys(ic.structures).length >= 2) ) {
      $("#" + me.pre + "mn2_alternateWrap").show();
      $("#" + me.pre + "mn2_realignWrap").show();
  }
  else {
      $("#" + me.pre + "mn2_alternateWrap").hide();
      $("#" + me.pre + "mn2_realignWrap").hide();
  }
  // display the structure right away. load the mns and sequences later
  setTimeout(function(){
      if(ic.bInitial) {
          if(me.cfg.showsets) {
               me.showSets();
          }
          if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
              // expand the toolbar
              var id = me.pre + 'selection';
              $("#" + id).show();
              $("#" + id + "_expand").hide();
              $("#" + id + "_shrink").show();

              if(me.cfg.align !== undefined) {
                  var bShowHighlight = false;
                  var seqObj = me.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, bShowHighlight);
                  $("#" + me.pre + "dl_sequence2").html(seqObj.sequencesHtml);
                  $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
              }
          }
          //me.setProtNuclLigInMenu();
          if(me.cfg.showanno) {
               var cmd = "view annotations";
               me.setLogCmd(cmd, true);
               me.showAnnotations();
          }
          if(me.cfg.closepopup) {
              me.closeDialogs();
          }
      }
      else {
          me.updateHlAll();
      }
      if($("#" + me.pre + "atomsCustom").length > 0) $("#" + me.pre + "atomsCustom")[0].blur();
      ic.bInitial = false;
  }, 0);
};
