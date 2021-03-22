/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.hlSummaryDomain3ddomain = function(that) { var me = this, ic = me.icn3d; "use strict";
  if($(that).attr('domain') !== undefined) { // domain
    var index = $(that).attr('index');
    var chainid = $(that).attr('chain');

    if($("[id^=" + chainid + "_domain_" + index + "]").length !== 0) {
        $("[id^=" + chainid + "_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
    }
  }

  if($(that).attr('3ddomain') !== undefined) { // 3d domain
    var index = $(that).attr('index');
    var chainid = $(that).attr('chain');

    if($("[id^=" + chainid + "_3d_domain_" + index + "]").length !== 0) {
        $("[id^=" + chainid + "_3d_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
    }
  }
};

// remove highlight of chains
iCn3DUI.prototype.removeSeqChainBkgd = function(currChain) {
  if(currChain === undefined) {
    $( ".icn3d-seqTitle" ).each(function( index ) {
      $( this ).removeClass('icn3d-highlightSeq');
      $( this ).removeClass('icn3d-highlightSeqBox');
    });
  }
  else {
    $( ".icn3d-seqTitle" ).each(function( index ) {
      if($(this).attr('chain') !== currChain) {
          $( this ).removeClass('icn3d-highlightSeq');
          $( this ).removeClass('icn3d-highlightSeqBox');
      }
    });
  }
};

// remove all highlighted residue color
iCn3DUI.prototype.removeSeqResidueBkgd = function() {
    $( ".icn3d-residue" ).each(function( index ) {
      $( this ).removeClass('icn3d-highlightSeq');
    });
};

