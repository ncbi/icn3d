/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectSequenceNonMobile = function() { var me = this, ic = me.icn3d; "use strict";
  //$("#" + me.pre + "dl_sequence").add("#" + me.pre + "dl_sequence2").add("#" + me.pre + "dl_annotations").selectable({
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "dt_giseq]").add("[id^=" + me.pre + "dt_custom]").add("[id^=" + me.pre + "dt_site]").add("[id^=" + me.pre + "dt_snp]").add("[id^=" + me.pre + "dt_clinvar]").add("[id^=" + me.pre + "dt_cdd]").add("[id^=" + me.pre + "dt_domain]").add("[id^=" + me.pre + "dt_interaction]").add("[id^=" + me.pre + "dt_ssbond]").add("[id^=" + me.pre + "dt_crosslink]").add("[id^=" + me.pre + "dt_transmem]")
  .add("[id^=" + me.pre + "tt_giseq]").add("[id^=" + me.pre + "tt_custom]").add("[id^=" + me.pre + "tt_site]").add("[id^=" + me.pre + "tt_snp]").add("[id^=" + me.pre + "tt_clinvar]").add("[id^=" + me.pre + "tt_cdd]").add("[id^=" + me.pre + "tt_domain]").add("[id^=" + me.pre + "tt_interaction]").add("[id^=" + me.pre + "tt_ssbond]").add("[id^=" + me.pre + "tt_crosslink]").add("[id^=" + me.pre + "tt_transmem]")
  .selectable({
  //$(".icn3d-dl_sequence").selectable({
      stop: function() { var ic = me.icn3d;
          if($(this).attr('id') === me.pre + "dl_sequence2") {
              me.bAlignSeq = true;
              me.bAnnotations = false;
          }
          //else if($(this).attr('id') === me.pre + "dl_annotations") {
          else {
              me.bAlignSeq = false;
              me.bAnnotations = true;
          }

          if(me.bSelectResidue === false && !ic.bShift && !ic.bCtrl) {
              me.removeSelection();
          }

          // select residues
          $("span.ui-selected", this).each(function() {
              var id = $(this).attr('id');

              if(id !== undefined) {
                 me.selectResidues(id, this);
             }
          });

          //ic.addResiudeLabels(ic.hAtoms, false, 0.5);
          ic.addHlObjects();  // render() is called

          // get all chainid in the selected residues
          var chainHash = {};
          for(var residueid in me.selectedResidues) {
              var pos = residueid.lastIndexOf('_');
              var chainid = residueid.substr(0, pos);

              chainHash[chainid] = 1;
          }

          // highlight the nodes
          var chainArray2d = Object.keys(chainHash);
          me.updateHl2D(chainArray2d);

          // select annotation title
          //$("#" + me.pre + "dl_selectannotations div.ui-selected", this).each(function() {
          $("div.ui-selected", this).each(function() {
              if($(this).attr('chain') !== undefined) {

                  me.selectTitle(this);
              }
          });
      }
  });

  $("[id^=" + me.pre + "ov_giseq]").add("[id^=" + me.pre + "ov_custom]").add("[id^=" + me.pre + "ov_site]").add("[id^=" + me.pre + "ov_snp]").add("[id^=" + me.pre + "ov_clinvar]").add("[id^=" + me.pre + "ov_cdd]").add("[id^=" + me.pre + "ov_domain]").add("[id^=" + me.pre + "ov_interaction]").add("[id^=" + me.pre + "ov_ssbond]").add("[id^=" + me.pre + "ov_crosslink]").add("[id^=" + me.pre + "ov_transmem]")
  .add("[id^=" + me.pre + "tt_giseq]").add("[id^=" + me.pre + "tt_custom]").add("[id^=" + me.pre + "tt_site]").add("[id^=" + me.pre + "tt_snp]").add("[id^=" + me.pre + "tt_clinvar]").add("[id^=" + me.pre + "tt_cdd]").add("[id^=" + me.pre + "tt_domain]").add("[id^=" + me.pre + "tt_interaction]").add("[id^=" + me.pre + "tt_ssbond]").add("[id^=" + me.pre + "tt_crosslink]").add("[id^=" + me.pre + "tt_transmem]")
  .on('click', '.icn3d-seqTitle', function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();

      me.bAlignSeq = false;
      me.bAnnotations = true;

      // select annotation title
      //$("div .ui-selected", this).each(function() {
          me.selectTitle(this);

          me.hlSummaryDomain3ddomain(this);
       //});

        // remove possible text selection
        if (window.getSelection) {
          if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {  // IE?
          document.selection.empty();
        }
  });
};

iCn3DUI.prototype.selectSequenceMobile = function() { var me = this, ic = me.icn3d; "use strict";
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "giseq]").add("[id^=" + me.pre + "custom]").add("[id^=" + me.pre + "site]").add("[id^=" + me.pre + "clinvar]").add("[id^=" + me.pre + "snp]").add("[id^=" + me.pre + "cdd]").add("[id^=" + me.pre + "domain]").add("[id^=" + me.pre + "interaction]").add("[id^=" + me.pre + "ssbond]").add("[id^=" + me.pre + "crosslink]").add("[id^=" + me.pre + "transmem]").on('click', '.icn3d-residue', function(e) { var ic = me.icn3d;
  //$(".icn3d-dl_sequence").on('click', '.icn3d-residue', function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();

      if($(this).attr('id') === me.pre + "dl_sequence2") {
          me.bAlignSeq = true;
          me.bAnnotations = false;
      }
      //else if($(this).attr('id') === me.pre + "dl_annotations") {
      else {
          me.bAlignSeq = false;
          me.bAnnotations = true;
      }

      // select residues
      //$("span.ui-selected", this).each(function() {
          var id = $(this).attr('id');

          if(id !== undefined) {
               me.selectResidues(id, this);
         }
      //});

      //ic.addResiudeLabels(ic.hAtoms, false, 0.5);
       ic.addHlObjects();  // render() is called

      // get all chainid in the selected residues
      var chainHash = {};
      for(var residueid in me.selectedResidues) {
          var pos = residueid.lastIndexOf('_');
          var chainid = residueid.substr(0, pos);

          chainHash[chainid] = 1;
      }

      // clear nodes in 2d dgm
      me.removeHl2D();

      // highlight the nodes
      var chainArray2d = Object.keys(chainHash);
      me.updateHl2D(chainArray2d);
  });
};

iCn3DUI.prototype.selectChainMobile = function() { var me = this, ic = me.icn3d; "use strict";
  $("#" + me.pre + "dl_sequence2").add("[id^=" + me.pre + "giseq]").add("[id^=" + me.pre + "custom]").add("[id^=" + me.pre + "site]").add("[id^=" + me.pre + "feat]").add("[id^=" + me.pre + "clinvar]").add("[id^=" + me.pre + "snp]").add("[id^=" + me.pre + "cdd]").add("[id^=" + me.pre + "domain]").add("[id^=" + me.pre + "interaction]").add("[id^=" + me.pre + "ssbond]").add("[id^=" + me.pre + "crosslink]").add("[id^=" + me.pre + "transmem]").on('click', '.icn3d-seqTitle', function(e) { var ic = me.icn3d;
  //$(".icn3d-dl_sequence").on('click', '.icn3d-seqTitle', function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();

      if($(this).attr('id') === me.pre + "dl_sequence2") {
          me.bAlignSeq = true;
          me.bAnnotations = false;
      }
      //else if($(this).attr('id') === me.pre + "dl_annotations") {
      else {
          me.bAlignSeq = false;
          me.bAnnotations = true;
      }

      // select annotation title
      //$("div.ui-selected", this).each(function() {
          me.selectTitle(this);

          me.hlSummaryDomain3ddomain(this);
      //});
  });
};
