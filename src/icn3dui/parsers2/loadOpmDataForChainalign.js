/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadOpmDataForChainalign = function(data1, data2, chainidArray, mmdbidArray) { var me = this, ic = me.icn3d; "use strict";
    if(me.cfg.resnum) {
        ic.init(); // remove all previously loaded data
        me.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

        if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
    }
    else {
        var url = me.baseUrl + "vastdyn/vastdyn.cgi?mmdbids2opm=" + mmdbidArray.join("','");

        $.ajax({
          url: url,
          dataType: 'jsonp',
          cache: true,
          //tryCount : 0,
          //retryLimit : 1,
          success: function(data) {
            var mmdbid = data.mmdbid;
            me.selectedPdbid = mmdbid;

            if(!mmdbid) {
              ic.init(); // remove all previously loaded data
              me.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

              if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
            }
            else {
                var url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbid.toLowerCase()+ ".pdb";
                $.ajax({
                  url: url2,
                  dataType: 'text',
                  cache: true,
                  //tryCount : 0,
                  //retryLimit : 1,
                  success: function(opmdata) {
                      ic.bOpm = true;
                      var bVector = true;
                      var chainresiCalphaHash = ic.loadPDB(opmdata, mmdbid, ic.bOpm, bVector); // defined in the core library

                      $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
                      $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

                      $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
                      $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);

                      ic.init(); // remove all previously loaded data
                      me.downloadChainalignmentPart2(data1, data2, chainresiCalphaHash, chainidArray);

                      if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                      ic.init(); // remove all previously loaded data
                      me.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

                      if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
                      return;
                  }
                });
            }
          },
          error : function(xhr, textStatus, errorThrown ) {
              ic.init(); // remove all previously loaded data
              me.downloadChainalignmentPart2(data1, data2, undefined, chainidArray);

              if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
              return;
          }
        });
    }
};
