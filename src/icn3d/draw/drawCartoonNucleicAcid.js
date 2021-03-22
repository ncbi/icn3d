/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawCartoonNucleicAcid = function(atomlist, div, thickness, bHighlight) { var me = this, ic = me.icn3d; "use strict";
   this.drawStrandNucleicAcid(atomlist, 2, div, true, undefined, thickness, bHighlight);
};

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawStrandNucleicAcid = function(atomlist, num, div, fill, nucleicAcidWidth, thickness, bHighlight) { var me = this, ic = me.icn3d; "use strict";
   if(bHighlight === 2) {
       num = undefined;
       thickness = undefined;
   }

   nucleicAcidWidth = nucleicAcidWidth || this.nucleicAcidWidth;
   div = div || this.axisDIV;
   num = num || this.nucleicAcidStrandDIV;
   var i, j, k;
   var pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
   var colors = [];
   var currentChain, currentResi, currentO3;
   var prevOO = null;

   for (i in atomlist) {
      var atom = atomlist[i];
      if (atom === undefined) continue;

      if ((atom.name === 'O3\'' || atom.name === 'OP2' || atom.name === 'O3*' || atom.name === 'O2P') && !atom.het) {
         if (atom.name === 'O3\'' || atom.name === 'O3*') { // to connect 3' end. FIXME: better way to do?
            if (currentChain !== atom.chain || currentResi + 1 !== atom.resi) {
//            if (currentChain !== atom.chain) {
               if (currentO3 && prevOO) {
                  for (j = 0; j < num; j++) {
                     var delta = -1 + 2 / (num - 1) * j;
                     pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                      currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
                  }
               }
               if (fill) this.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
               for (j = 0; !thickness && j < num; j++)
                  this.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
               pnts = []; for (k = 0; k < num; k++) pnts[k] = [];
               colors = [];
               prevOO = null;
            }
            currentO3 = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
            currentChain = atom.chain;
            currentResi = atom.resi;
            if(bHighlight === 1 || bHighlight === 2) {
                colors.push(this.hColor);
            }
            else {
                colors.push(atom.color);
            }

         }
         else if (atom.name === 'OP2' || atom.name === 'O2P') {
            if (!currentO3) {prevOO = null; continue;} // for 5' phosphate (e.g. 3QX3)
            var O = new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
            O.sub(currentO3);
            O.normalize().multiplyScalar(nucleicAcidWidth);  // TODO: refactor
            //if (prevOO !== undefined && O.dot(prevOO) < 0) {
            if (prevOO !== null && O.dot(prevOO) < 0) {
               O.negate();
            }
            prevOO = O;
            for (j = 0; j < num; j++) {
               var delta = -1 + 2 / (num - 1) * j;
               pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
                 currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
            }
            currentO3 = null;
         }
      }
   }

   if (currentO3 && prevOO) {
      for (j = 0; j < num; j++) {
         var delta = -1 + 2 / (num - 1) * j;
         pnts[j].push(new THREE.Vector3(currentO3.x + prevOO.x * delta,
           currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
      }
   }
   if (fill) this.createStrip(pnts[0], pnts[1], colors, div, thickness, bHighlight);
   for (j = 0; !thickness && j < num; j++)
      this.createCurveSub(pnts[j], 1 ,colors, div, bHighlight);
};

// modified from GLmol (http://webglmol.osdn.jp/index-en.html)
iCn3D.prototype.drawNucleicAcidStick = function(atomlist, bHighlight) { var me = this, ic = me.icn3d; "use strict";
   var currentChain, currentResi, start = null, end = null;
   var i;

   for (i in atomlist) {
      var atom = atomlist[i];
      if (atom === undefined || atom.het) continue;

      if (atom.resi !== currentResi || atom.chain !== currentChain) {
         if (start !== null && end !== null) {
            this.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                              new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), this.cylinderRadius, start.color, bHighlight);
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
      this.createCylinder(new THREE.Vector3(start.coord.x, start.coord.y, start.coord.z),
                        new THREE.Vector3(end.coord.x, end.coord.y, end.coord.z), this.cylinderRadius, start.color, bHighlight);
};

//iCn3D.prototype.isCalphaPhosOnly = function(atomlist, atomname1, atomname2) {
iCn3D.prototype.isCalphaPhosOnly = function(atomlist) { var me = this, ic = me.icn3d; "use strict";
      var bCalphaPhosOnly = false;

      var index = 0, testLength = 50; //30
      //var bOtherAtoms = false;
      var nOtherAtoms = 0;
      for(var i in atomlist) {
        if(index < testLength) {
          if(atomlist[i].name !== "CA" && atomlist[i].name !== "P" && atomlist[i].name !== "O3'" && atomlist[i].name !== "O3*") {
            //bOtherAtoms = true;
            //break;
            ++nOtherAtoms;
          }
        }
        else {
          break;
        }

        ++index;
      }

      //if(!bOtherAtoms) {
      if(nOtherAtoms < 0.5 * index) {
        bCalphaPhosOnly = true;
      }

      return bCalphaPhosOnly;
};


