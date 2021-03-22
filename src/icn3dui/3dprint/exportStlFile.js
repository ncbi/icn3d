/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.exportStlFile = function(postfix) { var me = this, ic = me.icn3d; "use strict";
   // assemblies
   if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
        // use a smaller grid to build the surface for assembly
        ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
        ic.removeSurfaces();
        ic.applySurfaceOptions();
        ic.removeMaps();
        ic.applyMapOptions();
        ic.removeEmmaps();
        ic.applyEmmapOptions();
   }
   var text = me.saveStlFile();
   var file_pref = (me.inputid) ? me.inputid : "custom";
   me.saveFile(file_pref + postfix + '.stl', 'binary', text);
   // assemblies
   if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
     && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
        alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
        var identity = new THREE.Matrix4();
        identity.identity();
        var index = 1;
        for (var i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
          var mat = ic.biomtMatrices[i];
          if (mat === undefined) continue;
          // skip itself
          if(mat.equals(identity)) continue;
          var time = (i + 1) * 100;
          //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
          setTimeout(function(mat, index){
              text = me.saveStlFile(mat);
              me.saveFile(file_pref + postfix + index + '.stl', 'binary', text);
              text = '';
          }.bind(this, mat, index), time);
          ++index;
        }
        // reset grid to build the surface for assembly
        ic.threshbox = 180;
   }
};
iCn3DUI.prototype.exportVrmlFile = function(postfix) { var me = this, ic = me.icn3d; "use strict";
   // assemblies
   if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly) {
        // use a smaller grid to build the surface for assembly
        ic.threshbox = 180 / Math.pow(ic.biomtMatrices.length, 0.33);
        ic.removeSurfaces();
        ic.applySurfaceOptions();
        ic.removeMaps();
        ic.applyMapOptions();
        ic.removeEmmaps();
        ic.applyEmmapOptions();
   }
   var text = me.saveVrmlFile();
   var file_pref = (me.inputid) ? me.inputid : "custom";
   //me.saveFile(file_pref + postfix + '.wrl', 'text', text);
   me.saveFile(file_pref + postfix + '.vrml', 'text', text);
   // assemblies
   if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1 && ic.bAssembly
     && Object.keys(ic.dAtoms).length * ic.biomtMatrices.length > ic.maxAtoms3DMultiFile ) {
        alert(ic.biomtMatrices.length + " files will be generated for this assembly. Please merge these files using some software and 3D print the merged file.");
        var identity = new THREE.Matrix4();
        identity.identity();
        var index = 1;
        for (var i = 0; i < ic.biomtMatrices.length; i++) {  // skip itself
          var mat = ic.biomtMatrices[i];
          if (mat === undefined) continue;
          // skip itself
          if(mat.equals(identity)) continue;
          var time = (i + 1) * 100;
          //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
          setTimeout(function(mat, index){
              text = me.saveVrmlFile(mat);
              //me.saveFile(me.inputid + postfix + index + '.wrl', 'text', text);
              me.saveFile(file_pref + postfix + index + '.vrml', 'text', text);
              text = '';
          }.bind(this, mat, index), time);
          ++index;
        }
        // reset grid to build the surface for assembly
        ic.threshbox = 180;
   }
};
