/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {Curve} from '../geometry/curve.js';
import {Cylinder} from '../geometry/cylinder.js';
import {Strip} from '../geometry/strip.js';

class CartoonNucl {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from GLmol (http://webglmol.osdn.jp/index-en.html)
    //Create curves for nucleotide "atoms". "div" means how many pnts are used to smooth the curve. It's typically 5.
    //"thickness" is the thickness of the curve. "bHighlight" is an option to draw the highlight for these atoms.
    //The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2.
    drawCartoonNucleicAcid(atomlist, div, thickness, bHighlight) {
       this.drawStrandNucleicAcid(atomlist, 2, div, true, undefined, thickness, bHighlight);
    }

    // modified from GLmol (http://webglmol.osdn.jp/index-en.html)
    drawStrandNucleicAcid(atomlist, num, div, fill, nucleicAcidWidth, thickness, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       if(bHighlight === 2) {
           num = undefined;
           thickness = undefined;
       }

       nucleicAcidWidth = nucleicAcidWidth || ic.nucleicAcidWidth;
       div = div || ic.axisDIV;
       num = num || ic.nucleicAcidStrandDIV;
       let i, j, k;
       let pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
       let colors = [];
       let currentChain, currentResi, currentO3;
       let prevOO = null;

       for (i in atomlist) {
          let atom = atomlist[i];
          if (atom === undefined) continue;

          if ((atom.name === 'O3\'' || atom.name === 'OP2' || atom.name === 'O3*' || atom.name === 'O2P') && !atom.het) {
             if (atom.name === 'O3\'' || atom.name === 'O3*') { // to connect 3' end. FIXME: better way to do?
                if (currentChain !== atom.chain || parseInt(currentResi) + 1 !== parseInt(atom.resi)) {
    //            if (currentChain !== atom.chain) {
                   if (currentO3 && prevOO) {
                      for (j = 0; j < num; j++) {
                         let delta = -1 + 2 / (num - 1) * j;
                         pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                          currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
                      }
                   }
                   if (fill) ic.stripCls.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
                   for (j = 0; !thickness && j < num; j++)
                      ic.curveCls.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
                   pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
                   colors = [];
                   prevOO = null;
                }
                currentO3 = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
                currentChain = atom.chain;
                currentResi = atom.resi;
                if(bHighlight === 1 || bHighlight === 2) {
                    colors.push(ic.hColor);
                }
                else {
                    colors.push(atom.color);
                }

             }
             else if (atom.name === 'OP2' || atom.name === 'O2P') {
                if (!currentO3) {prevOO = null; continue;} // for 5' phosphate (e.g. 3QX3)
                let O = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
                O.sub(currentO3);
                O.normalize().multiplyScalar(nucleicAcidWidth);  // TODO: refactor
                //if (prevOO !== undefined && O.dot(prevOO) < 0) {
                if (prevOO !== null && O.dot(prevOO) < 0) {
                   O.negate();
                }
                prevOO = O;
                for (j = 0; j < num; j++) {
                   let delta = -1 + 2 / (num - 1) * j;
                   pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                     currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
                }
                currentO3 = null;
             }
          }
       }

       if (currentO3 && prevOO) {
          for (j = 0; j < num; j++) {
             let delta = -1 + 2 / (num - 1) * j;
             pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
               currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
          }
       }
       if (fill) ic.stripCls.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
       for (j = 0; !thickness && j < num; j++)
          ic.curveCls.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
    }

    // modified from GLmol (http://webglmol.osdn.jp/index-en.html)
    //Create sticks between two nucleotide curves for nucleotide "atoms". "bHighlight" is an option to
    //draw the highlight for these atoms. The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2.
    drawNucleicAcidStick(atomlist, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
       if(ic.icn3dui.bNode) return;

       let currentChain, currentResi, start = null, end = null;
       let i;

       for (i in atomlist) {
          let atom = atomlist[i];
          if (atom === undefined || atom.het) continue;

          if (atom.resi !== currentResi || atom.chain !== currentChain) {
             if (start !== null && end !== null) {
                ic.cylinderCls.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                                  new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), ic.cylinderRadius, start.color, bHighlight);
             }
             start = null; end = null;
          }
          if (atom.name === 'O3\'' || atom.name === 'O3*') start = atom;
          if (atom.resn === '  A' || atom.resn === '  G' || atom.resn === ' DA' || atom.resn === ' DG') {
             if (atom.name === 'N1')  end = atom; //  N1(AG), N3(CTU)
          } else if (atom.name === 'N3') {
             end = atom;
          }
          currentResi = atom.resi; currentChain = atom.chain;
       }
       if (start !== null && end !== null)
          ic.cylinderCls.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                            new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), ic.cylinderRadius, start.color, bHighlight);
    }
}

export {CartoonNucl}

