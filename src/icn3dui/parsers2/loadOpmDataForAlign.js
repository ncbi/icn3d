/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadOpmDataForAlign = function(data, seqalign, mmdbidArray) { var me = this, ic = me.icn3d; "use strict";
    var url, dataType;

    url = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[0].toLowerCase()+ ".pdb";

    dataType = "text";

    $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      //tryCount : 0,
      //retryLimit : 1,
      success: function(opmdata) {
          me.selectedPdbid = mmdbidArray[0];

          ic.bOpm = true;
          var bVector = true;
          var chainresiCalphaHash = ic.loadPDB(opmdata, mmdbidArray[0], ic.bOpm, bVector); // defined in the core library

          $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
          $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

          $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
          $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);

          ic.init(); // remove all previously loaded data
          me.downloadAlignmentPart2(data, seqalign, chainresiCalphaHash);

          if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        var url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[1].toLowerCase()+ ".pdb";

        $.ajax({
          url: url2,
          dataType: dataType,
          cache: true,
          //tryCount : 0,
          //retryLimit : 1,
          success: function(opmdata) {
              me.selectedPdbid = mmdbidArray[1];

              ic.bOpm = true;
              var bVector = true;
              var chainresiCalphaHash = ic.loadPDB(opmdata, mmdbidArray[1], ic.bOpm, bVector); // defined in the core library

              $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
              $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

              $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
              $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);

              ic.init(); // remove all previously loaded data
              me.downloadAlignmentPart2(data, seqalign, chainresiCalphaHash);

              if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
              ic.init(); // remove all previously loaded data
              me.downloadAlignmentPart2(data, seqalign);

              if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
              return;
          }
        });

        return;
      }
    });
};
