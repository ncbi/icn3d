/**
* @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
*/

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Selection} from '../selection/selection.js';
import {SetColor} from '../display/setColor.js';
import {Draw} from '../display/draw.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {GetGraph} from '../interaction/getGraph.js';
import {ApplyMap} from '../surface/applyMap.js';

class SetOption {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Modify the display options, e.g., setOption('color', 'green')
    setOption(id, value) {var ic = this.icn3d, me = ic.icn3dui;
      //var options2 = {}
      //options2[id] = value;
      // remember the options
      ic.opts[id] = value;
      ic.selectionCls.saveSelectionIfSelected();
      if(id === 'color') {
          ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);
          ic.drawCls.draw();
          let residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(ic.hAtoms);
          ic.hlUpdateCls.changeSeqColor(Object.keys(residueHash));
          // change graph color
          ic.getGraphCls.updateGraphColor();
      }
      else if(id === 'surface' || id === 'opacity' || id === 'wireframe') {
          if(id === 'opacity' || id === 'wireframe') {
              ic.applyMapCls.removeLastSurface();
          }
          ic.applyMapCls.applySurfaceOptions();
          //if(ic.bRender) ic.drawCls.render();
          ic.drawCls.draw(); // to make surface work in assembly
      }
      else if(id === 'map' || id === 'mapwireframe') {
          if(id === 'mapwireframe') {
              ic.applyMapCls.removeLastMap();
          }
          ic.applyMapCls.applyMapOptions();
          //if(ic.bRender) ic.drawCls.render();
          ic.drawCls.draw(); // to make surface work in assembly
      }
      else if(id === 'emmap' || id === 'emmapwireframe') {
          if(id === 'emmapwireframe') {
              ic.applyMapCls.removeLastEmmap();
          }
          ic.applyMapCls.applyEmmapOptions();
          //if(ic.bRender) ic.drawCls.render();
          ic.drawCls.draw(); // to make surface work in assembly
      }
      else if(id === 'phimap' || id === 'phimapwireframe') {
          if(id === 'phimapwireframe') {
              ic.applyMapCls.removeLastPhimap();
          }
          ic.applyMapCls.applyPhimapOptions();
          //if(ic.bRender) ic.drawCls.render();
          ic.drawCls.draw(); // to make surface work in assembly
      }
      else if(id === 'phisurface') {
          ic.applyMapCls.applyphisurfaceOptions();
          //if(ic.bRender) ic.drawCls.render();
          ic.drawCls.draw(); // to make surface work in assembly
      }
      else if(id === 'chemicalbinding') {
          ic.bSkipChemicalbinding = false;
          ic.drawCls.draw();
      }
      else {
          ic.drawCls.draw();
      }
    }

    //Set the styles of predefined "protein", "nucleotides", etc.
    setStyle(selectionType, style) {var ic = this.icn3d, me = ic.icn3dui;
      let atoms = {}
      let bAll = true;
      switch(selectionType) {
          case 'proteins':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.proteins);
              if(Object.keys(ic.hAtoms).length < Object.keys(ic.proteins).length) bAll = false;
              break;
          case 'sidec':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.sidec);
              //calpha_atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.calphas);
              // include calphas
              //atoms = me.hashUtilsCls.unionHash(atoms, calpha_atoms);
              break;
          case 'nucleotides':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.nucleotides);
              if(Object.keys(ic.hAtoms).length < Object.keys(ic.nucleotides).length) bAll = false;
              break;
          case 'chemicals':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chemicals);
              break;
          case 'ions':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.ions);
              break;
          case 'water':
              atoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.water);
              break;
      }
      // draw sidec separatedly
      if(selectionType === 'sidec') {
          for(let i in atoms) {
            ic.atoms[i].style2 = style;
          }
      }
      else {
          for(let i in atoms) {
            ic.atoms[i].style = style;
          }
      }
      ic.opts[selectionType] = style;
      ic.selectionCls.saveSelectionIfSelected();
      ic.drawCls.draw();
    }

    //Save the current style setting so that these styles can be restored later by clicking "Apply Saved Style" in the Style menu.
    saveStyle() {var ic = this.icn3d, me = ic.icn3dui;
       for(let i in ic.atoms) {
           let atom = ic.atoms[i];
           atom.styleSave = atom.style;
           if(atom.style2 !== undefined) atom.style2Save = atom.style2;
       }
    }

    //Restore the previously saved style.
    applySavedStyle() {var ic = this.icn3d, me = ic.icn3dui;
       for(let i in ic.atoms) {
           let atom = ic.atoms[i];
           if(atom.styleSave !== undefined) {
               atom.style = atom.styleSave;
           }
           if(atom.style2Save !== undefined) {
               atom.style2 = atom.style2Save;
           }
       }
       ic.drawCls.draw();
    }

    //Save the current color setting so that these colors can be restored later by clicking "Apply Saved Color" in the Color menu.
    saveColor() {var ic = this.icn3d, me = ic.icn3dui;
       for(let i in ic.atoms) {
           let atom = ic.atoms[i];
           atom.colorSave = atom.color.clone();
       }
    }

    //Restore the previously saved color.
    applySavedColor() {var ic = this.icn3d, me = ic.icn3dui;
       for(let i in ic.atoms) {
           let atom = ic.atoms[i];
           if(atom.colorSave !== undefined) {
               atom.color = atom.colorSave.clone();
           }
       }
       ic.drawCls.draw();
       ic.hlUpdateCls.changeSeqColor(Object.keys(ic.residues));
    }
}

export {SetOption}
