/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadMmcifOpmDataPart2 = function(data, pdbid) { var me = this, ic = me.icn3d; "use strict";
    if(Object.keys(ic.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    // load assembly info
    var assembly = (data.assembly !== undefined) ? data.assembly : [];
    for(var i = 0, il = assembly.length; i < il; ++i) {
      if (ic.biomtMatrices[i] == undefined) ic.biomtMatrices[i] = new THREE.Matrix4().identity();

      for(var j = 0, jl = assembly[i].length; j < jl; ++j) {
        ic.biomtMatrices[i].elements[j] = assembly[i][j];
      }
    }

    if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
        $("#" + me.pre + "assemblyWrapper").show();

        ic.asuCnt = ic.biomtMatrices.length;
    }
    else {
        $("#" + me.pre + "assemblyWrapper").hide();
    }

    ic.setAtomStyleByOptions(me.opts);
    ic.setColorByOptions(me.opts, ic.atoms);

    me.renderStructure();

    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};
