/**
* @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
*/

iCn3DUI.prototype.setOption = function (id, value) { var me = this, ic = me.icn3d; "use strict";
  //var options2 = {};
  //options2[id] = value;
  // remember the options
  ic.opts[id] = value;
  me.saveSelectionIfSelected();
  if(id === 'color') {
      ic.setColorByOptions(ic.opts, ic.hAtoms);
      ic.draw();
      var residueHash = ic.getResiduesFromCalphaAtoms(ic.hAtoms);
      me.changeSeqColor(Object.keys(residueHash));
      // change graph color
      me.updateGraphColor();
  }
  else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
      if(id === 'opacity' || id === 'wireframe') {
          ic.removeLastSurface();
      }
      ic.applySurfaceOptions();
      //if(ic.bRender) ic.render();
      ic.draw(); // to make surface work in assembly
  }
  else if(id === 'map' || id === 'mapwireframe') {
      if(id === 'mapwireframe') {
          ic.removeLastMap();
      }
      ic.applyMapOptions();
      //if(ic.bRender) ic.render();
      ic.draw(); // to make surface work in assembly
  }
  else if(id === 'emmap' || id === 'emmapwireframe') {
      if(id === 'emmapwireframe') {
          ic.removeLastEmmap();
      }
      ic.applyEmmapOptions();
      //if(ic.bRender) ic.render();
      ic.draw(); // to make surface work in assembly
  }
  else if(id === 'phimap' || id === 'phimapwireframe') {
      if(id === 'phimapwireframe') {
          ic.removeLastPhimap();
      }
      ic.applyPhimapOptions();
      //if(ic.bRender) ic.render();
      ic.draw(); // to make surface work in assembly
  }
  else if(id === 'phisurface') {
      ic.applyphisurfaceOptions();
      //if(ic.bRender) ic.render();
      ic.draw(); // to make surface work in assembly
  }
  else if(id === 'chemicalbinding') {
      ic.bSkipChemicalbinding = false;
      ic.draw();
  }
  else {
      ic.draw();
  }
};

