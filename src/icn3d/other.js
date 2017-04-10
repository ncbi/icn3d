    iCn3D.prototype.cloneHash = function(from) {
      var to = {};
      for(var i in from) {
        to[i] = from[i];
      }

      return to;
    };

    iCn3D.prototype.residueName2Abbr = function(residueName) {
      if(residueName !== undefined && residueName.charAt(0) !== ' ' && residueName.charAt(1) === ' ') {
        //residueName = 'n' + residueName.charAt(0);
        residueName = residueName.charAt(0);
      }

      switch(residueName) {
        case '  A':
          return 'A';
          break;
        case '  C':
          return 'C';
          break;
        case '  G':
          return 'G';
          break;
        case '  T':
          return 'T';
          break;
        case '  U':
          return 'U';
          break;
        case '  I':
          return 'I';
          break;
        case ' DA':
          return 'A';
          break;
        case ' DC':
          return 'C';
          break;
        case ' DG':
          return 'G';
          break;
        case ' DT':
          return 'T';
          break;
        case ' DU':
          return 'U';
          break;
        case ' DI':
          return 'I';
          break;
        case 'ALA':
          return 'A';
          break;
        case 'ARG':
          return 'R';
          break;
        case 'ASN':
          return 'N';
          break;
        case 'ASP':
          return 'D';
          break;
        case 'CYS':
          return 'C';
          break;
        case 'GLU':
          return 'E';
          break;
        case 'GLN':
          return 'Q';
          break;
        case 'GLY':
          return 'G';
          break;
        case 'HIS':
          return 'H';
          break;
        case 'ILE':
          return 'I';
          break;
        case 'LEU':
          return 'L';
          break;
        case 'LYS':
          return 'K';
          break;
        case 'MET':
          return 'M';
          break;
        case 'PHE':
          return 'F';
          break;
        case 'PRO':
          return 'P';
          break;
        case 'SER':
          return 'S';
          break;
        case 'THR':
          return 'T';
          break;
        case 'TRP':
          return 'W';
          break;
        case 'TYR':
          return 'Y';
          break;
        case 'VAL':
          return 'V';
          break;
        case 'SEC':
          return 'U';
          break;
//        case 'PYL':
//          return 'O';
//          break;

        case 'HOH':
          return 'O';
          break;
        case 'WAT':
          return 'O';
          break;

        default:
          return residueName;
      }
    };

    // get hbonds between "molecule" and "ligand"
    iCn3D.prototype.calculateLigandHbonds = function (molecule, ligands, threshold) {
        if(Object.keys(molecule).length === 0 || Object.keys(ligands).length === 0) return;

        var atomHbond = {};
        var chain_resi_atom;

        var maxlengthSq = threshold * threshold;

        for (var i in molecule) {
          var atom = molecule[i];

          if(atom.elem === "N" || atom.elem === "O" || atom.elem === "F") { // calculate hydrogen bond
            chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

            atomHbond[chain_resi_atom] = atom;
          }
        } // end of for (var i in molecule) {

        this.highlightAtoms = {};

        for (var i in ligands) {
          var atom = ligands[i];

          if(atom.elem === "N" || atom.elem === "O" || atom.elem === "F") { // calculate hydrogen bond
            chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

            for (var j in atomHbond) {
              var xdiff = Math.abs(atom.coord.x - atomHbond[j].coord.x);
              if(xdiff > threshold) continue;

              var ydiff = Math.abs(atom.coord.y - atomHbond[j].coord.y);
              if(ydiff > threshold) continue;

              var zdiff = Math.abs(atom.coord.z - atomHbond[j].coord.z);
              if(zdiff > threshold) continue;

              var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
              if(dist > maxlengthSq) continue;

              // output hydrogen bonds
              this.hbondpoints.push(atom.coord);
              this.hbondpoints.push(atomHbond[j].coord);

              this.highlightAtoms = this.unionHash(this.highlightAtoms, this.residues[atom.structure + "_" + atom.chain + "_" + atom.resi]);
              this.highlightAtoms = this.unionHash(this.highlightAtoms, this.residues[atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi]);
            } // end of for (var j in atomHbond) {
          }
        } // end of for (var i in ligands) {
    };

    iCn3D.prototype.getFirstAtomObj = function(atomsHash) {
        var atomKeys = Object.keys(atomsHash);
        var firstIndex = atomKeys[0];

        return this.atoms[firstIndex];
    };

    iCn3D.prototype.getLastAtomObj = function(atomsHash) {
        var atomKeys = Object.keys(atomsHash);
        var lastIndex = atomKeys[atomKeys.length - 1];

        return this.atoms[lastIndex];
    };

    iCn3D.prototype.getResiduesFromAtoms = function(atomsHash) {
        var residuesHash = {};
        for(var i in atomsHash) {
            var residueid = this.atoms[i].structure + '_' + this.atoms[i].chain + '_' + this.atoms[i].resi;
            residuesHash[residueid] = 1;
        }

        return residuesHash;
    };

    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    iCn3D.prototype.hexToRgb = function (hex, a) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: a
        } : null;
    };

    iCn3D.prototype.getNeighboringAtoms = function(atomlist, atomlistTarget, distance) {
	   var me = this;

       var extent = this.getExtent(atomlistTarget);

       var targetRadiusSq1 = (extent[2][0] - extent[0][0]) * (extent[2][0] - extent[0][0]) + (extent[2][1] - extent[0][1]) * (extent[2][1] - extent[0][1]) + (extent[2][2] - extent[0][2]) * (extent[2][2] - extent[0][2]);
       var targetRadiusSq2 = (extent[2][0] - extent[1][0]) * (extent[2][0] - extent[1][0]) + (extent[2][1] - extent[1][1]) * (extent[2][1] - extent[1][1]) + (extent[2][2] - extent[1][2]) * (extent[2][2] - extent[1][2]);
       var targetRadiusSq = (targetRadiusSq1 > targetRadiusSq2) ? targetRadiusSq1 : targetRadiusSq2;
       var targetRadius = Math.sqrt(targetRadiusSq);

       var maxDistSq = (targetRadius + distance) * (targetRadius + distance);

       var neighbors = {};
       for (var i in atomlist) {
          //var atom = atomlist[i];
          var atom = me.atoms[i];

          // exclude the target atoms
          if(atom.serial in atomlistTarget) continue;

          if (atom.coord.x < extent[0][0] - distance || atom.coord.x > extent[1][0] + distance) continue;
          if (atom.coord.y < extent[0][1] - distance || atom.coord.y > extent[1][1] + distance) continue;
          if (atom.coord.z < extent[0][2] - distance || atom.coord.z > extent[1][2] + distance) continue;

          // only show protein or DNA/RNA
          //if(atom.serial in this.proteins || atom.serial in this.nucleotides) {
              var atomDistSq = (atom.coord.x - extent[2][0]) * (atom.coord.x - extent[2][0]) + (atom.coord.y - extent[2][1]) * (atom.coord.y - extent[2][1]) + (atom.coord.z - extent[2][2]) * (atom.coord.z - extent[2][2]);

              if(atomDistSq < maxDistSq) {
                  neighbors[atom.serial] = atom;
              }
          //}
       }

       return neighbors;
    };

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    iCn3D.prototype.getAtomsWithinAtom = function(atomlist, atomlistTarget, distance) {
	   var me = this;

       var neighbors = this.getNeighboringAtoms(atomlist, atomlistTarget, distance);

       var ret = {};
       for(var i in atomlistTarget) {
           //var oriAtom = atomlistTarget[i];
           var oriAtom = me.atoms[i];
           var radius = this.vdwRadii[oriAtom.elem] || this.defaultRadius;

           for (var j in neighbors) {
              var atom = neighbors[j];

              var atomDistSq = (atom.coord.x - oriAtom.coord.x) * (atom.coord.x - oriAtom.coord.x) + (atom.coord.y - oriAtom.coord.y) * (atom.coord.y - oriAtom.coord.y) + (atom.coord.z - oriAtom.coord.z) * (atom.coord.z - oriAtom.coord.z);

              var maxDistSq = (radius + distance) * (radius + distance);

              if(atomDistSq < maxDistSq) {
                  ret[atom.serial] = atom;
              }
          }
       }

       return ret;
    };

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    iCn3D.prototype.getExtent = function(atomlist) {
	   var me = this;

       var xmin = ymin = zmin = 9999;
       var xmax = ymax = zmax = -9999;
       var xsum = ysum = zsum = cnt = 0;
       var i;
       for (i in atomlist) {
          //var atom = atomlist[i];
          var atom = me.atoms[i];
          cnt++;
          xsum += atom.coord.x; ysum += atom.coord.y; zsum += atom.coord.z;


          xmin = (xmin < atom.coord.x) ? xmin : atom.coord.x;

          ymin = (ymin < atom.coord.y) ? ymin : atom.coord.y;
          zmin = (zmin < atom.coord.z) ? zmin : atom.coord.z;
          xmax = (xmax > atom.coord.x) ? xmax : atom.coord.x;
          ymax = (ymax > atom.coord.y) ? ymax : atom.coord.y;
          zmax = (zmax > atom.coord.z) ? zmax : atom.coord.z;
       }

       return [[xmin, ymin, zmin], [xmax, ymax, zmax], [xsum / cnt, ysum / cnt, zsum / cnt]];
    };

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    iCn3D.prototype.getAtomsFromPosition = function(point, threshold) {
       var i, atom;

       if(threshold === undefined || threshold === null) {
         threshold = 1;
       }

       for (i in this.atoms) {
          var atom = this.atoms[i];

          //if(atom.coord.x < point.x - threshold || atom.coord.x > point.x + threshold) continue;
          //if(atom.coord.y < point.y - threshold || atom.coord.y > point.y + threshold) continue;
          //if(atom.coord.z < point.z - threshold || atom.coord.z > point.z + threshold) continue;

          if(this.ions.hasOwnProperty(i) && this.options['ions'] === 'sphere') {
              var adjust = this.vdwRadii[atom.elem];

              if(Math.abs(atom.coord.x - point.x) - adjust > threshold) continue;
              if(Math.abs(atom.coord.y - point.y) - adjust > threshold) continue;
              if(Math.abs(atom.coord.z - point.z) - adjust > threshold) continue;
          }
          else {
              if(atom.coord.x < point.x - threshold || atom.coord.x > point.x + threshold) continue;
              if(atom.coord.y < point.y - threshold || atom.coord.y > point.y + threshold) continue;
              if(atom.coord.z < point.z - threshold || atom.coord.z > point.z + threshold) continue;
          }

          return atom;
       }

       return null;
    };

    iCn3D.prototype.intersectHash = function(atoms1, atoms2) {
        var results = {};

        if(Object.keys(atoms1).length < Object.keys(atoms2).length) {
            for (var i in atoms1) {
                if (atoms2 !== undefined && atoms2[i]) {
                    results[i] = atoms1[i];
                }
            }
        }
        else {
            for (var i in atoms2) {
                if (atoms1 !== undefined && atoms1[i]) {
                    results[i] = atoms2[i];
                }
            }
        }

        atoms1 = {};
        atoms2 = {};

        return results;
    };

    // get atoms in allAtoms, but not in "atoms"
    iCn3D.prototype.excludeHash = function(includeAtoms, excludeAtoms) {
        var results = {};

        for (var i in includeAtoms) {
            if (!(i in excludeAtoms)) {
                results[i] = includeAtoms[i];
            }
        }

        includeAtoms = {};
        excludeAtoms = {};

        return results;
    };

    iCn3D.prototype.unionHash = function(atoms1, atoms2) {
		// The commented-out version has a problem: atom1 became undefined.
        //jQuery.extend(atoms1, atoms2);

        //return atoms1;

        return this.unionHashNotInPlace(atoms1, atoms2);
    };

    iCn3D.prototype.unionHashNotInPlace = function(atoms1, atoms2) {
        var results = jQuery.extend({}, atoms1, atoms2);
        atoms1 = {};
        atoms2 = {};

        return results;
    };

    iCn3D.prototype.intersectHash2Atoms = function(atoms1, atoms2) {
        return this.hash2Atoms(this.intersectHash(atoms1, atoms2));
    };

    // get atoms in allAtoms, but not in "atoms"
    iCn3D.prototype.excludeHash2Atoms = function(includeAtoms, excludeAtoms) {
        return this.hash2Atoms(this.excludeHash(includeAtoms, excludeAtoms));
    };

    iCn3D.prototype.unionHash2Atoms = function(atoms1, atoms2) {
        return this.hash2Atoms(this.unionHash(atoms1, atoms2));
    };

    iCn3D.prototype.hash2Atoms = function(hash) {
        var atoms = {};
        for(var i in hash) {
          atoms[i] = this.atoms[i];
        }

        hash = {};

        return atoms;
    };

    iCn3D.prototype.centerAtoms = function(atoms) {
        var pmin = new THREE.Vector3( 9999, 9999, 9999);
        var pmax = new THREE.Vector3(-9999,-9999,-9999);
        var psum = new THREE.Vector3();
        var cnt = 0;

        for (var i in atoms) {
            var atom = this.atoms[i];
            var coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;
        }

        var maxD = pmax.distanceTo(pmin);

        return {"center": psum.multiplyScalar(1.0 / cnt), "maxD": maxD};
    };

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    iCn3D.prototype.exportCanvas = function () {
        this.render();
        window.open(this.renderer.domElement.toDataURL('image/png'));
    };

    // zoom
    iCn3D.prototype.zoomIn = function (normalizedFactor) { // 0.1
      var para = {};
      para._zoomFactor = 1 - normalizedFactor;
      para.update = true;
      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.zoomOut = function (normalizedFactor) { // 0.1
      var para = {};
      para._zoomFactor = 1 + normalizedFactor;
      para.update = true;
      this.controls.update(para);
      this.render();
    };

    // rotate
    iCn3D.prototype.rotateLeft = function (degree) { // 5
      var axis = new THREE.Vector3(0,1,0);
      var angle = -degree / 180.0 * Math.PI;

      axis.applyQuaternion( this.camera.quaternion ).normalize();

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      var para = {};
      para.quaternion = quaternion;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.rotateRight = function (degree) { // 5
      var axis = new THREE.Vector3(0,1,0);
      var angle = degree / 180.0 * Math.PI;

      axis.applyQuaternion( this.camera.quaternion ).normalize();

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      var para = {};
      para.quaternion = quaternion;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.rotateUp = function (degree) { // 5
      var axis = new THREE.Vector3(1,0,0);
      var angle = -degree / 180.0 * Math.PI;

      axis.applyQuaternion( this.camera.quaternion ).normalize();

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      var para = {};
      para.quaternion = quaternion;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.rotateDown = function (degree) { // 5
      var axis = new THREE.Vector3(1,0,0);
      var angle = degree / 180.0 * Math.PI;

      axis.applyQuaternion( this.camera.quaternion ).normalize();

      var quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( axis, -angle );

      var para = {};
      para.quaternion = quaternion;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    // translate
    iCn3D.prototype.translateLeft = function (percentScreenSize) { // 1
      var mouseChange = new THREE.Vector2(0,0);

      // 1 means the full screen size
      mouseChange.x -= percentScreenSize / 100.0;

      var para = {};
      para.mouseChange = mouseChange;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.translateRight = function (percentScreenSize) { // 1
      var mouseChange = new THREE.Vector2(0,0);

      mouseChange.x += percentScreenSize / 100.0;

      var para = {};
      para.mouseChange = mouseChange;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.translateUp = function (percentScreenSize) { // 1
      var mouseChange = new THREE.Vector2(0,0);

      mouseChange.y -= percentScreenSize / 100.0;

      var para = {};
      para.mouseChange = mouseChange;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.translateDown = function (percentScreenSize) { // 1
      var mouseChange = new THREE.Vector2(0,0);

      mouseChange.y += percentScreenSize / 100.0;

      var para = {};
      para.mouseChange = mouseChange;
      para.update = true;

      this.controls.update(para);
      this.render();
    };

    iCn3D.prototype.selectStrandHelixFromAtom = function(atom) {
        var firstAtom = atom;
        var lastAtom = atom;

        var atomsHash = {};

        // fill the beginning
        var beginResi = firstAtom.resi;
        for(var i = firstAtom.resi - 1; i > 0; --i) {
            var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
            if(!this.residues.hasOwnProperty(residueid)) break;

            var atom = this.getFirstAtomObj(this.residues[residueid]);
            beginResi = atom.resi;

            if( (firstAtom.ss !== 'coil' && atom.ss === firstAtom.ss && atom.ssbegin) || (firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) ) {
                if(firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) {
                    beginResi = atom.resi + 1;
                }
                break;
            }
        }

        for(var i = beginResi; i <= firstAtom.resi; ++i) {
            var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
            atomsHash = this.unionHash(atomsHash, this.hash2Atoms(this.residues[residueid]));
        }

        // fill the end
        var endResi = lastAtom.resi;
        var endChainResi = this.getLastAtomObj(this.chains[lastAtom.structure + '_' + lastAtom.chain]).resi;
        for(var i = lastAtom.resi + 1; i <= endChainResi; ++i) {
            var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
            if(!this.residues.hasOwnProperty(residueid)) break;

            var atom = this.getFirstAtomObj(this.residues[residueid]);
            endResi = atom.resi;

            if( (lastAtom.ss !== 'coil' && atom.ss === lastAtom.ss && atom.ssend) || (lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss) ) {
                if(lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss) {
                    endResi = atom.resi - 1;
                }
                break;
            }
        }

        for(var i = lastAtom.resi + 1; i <= endResi; ++i) {
            var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
            atomsHash = this.unionHash(atomsHash, this.hash2Atoms(this.residues[residueid]));
        }

        return atomsHash;
    };

    iCn3D.prototype.showPickingBase = function(atom) {
      if(!this.bShiftKey && !this.bCtrlKey) this.removeHighlightObjects();

      this.pickedAtomList = {};
      if(this.picking === 1) {
        this.pickedAtomList[atom.serial] = 1;
      }
      else if(this.picking === 2) {
        var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        this.pickedAtomList = this.residues[residueid];
      }
      else if(this.picking === 3) {
        this.pickedAtomList = this.selectStrandHelixFromAtom(atom);
      }

      if(this.picking === 0) {
          this.bShowHighlight = false;
      }
      else {
            this.bShowHighlight = true;
      }

      if(!this.bShiftKey && !this.bCtrlKey) {
          this.highlightAtoms = this.cloneHash(this.pickedAtomList);
      }
      else if(this.bShiftKey) { // select a range
            this.highlightAtoms = this.unionHash(this.highlightAtoms, this.pickedAtomList);
            var firstAtom = this.getFirstAtomObj(this.highlightAtoms);
            var lastAtom = this.getLastAtomObj(this.highlightAtoms);

            for(var i = firstAtom.serial; i <= lastAtom.serial; ++i) {
                this.highlightAtoms[i] = 1;
            }
      }
      else if(this.bCtrlKey) {
          this.highlightAtoms = this.unionHash(this.highlightAtoms, this.pickedAtomList);
      }

      this.addHighlightObjects();
    };

    iCn3D.prototype.showPicking = function(atom) {
      this.showPickingBase(atom);

      //var text = '#' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
      var residueText = '.' + atom.chain + ':' + atom.resi;
      var text = residueText + '@' + atom.name;

      var labels = [];
      var label = {};
      label.position = atom.coord;

      if(this.picking === 1) {
        label.text = text;
      }
      else if(this.picking === 2) {
        label.text = residueText;
      }
      else if(this.picking === 3) {
        label.text = residueText;
      }

      labels.push(label);

      //http://www.johannes-raida.de/tutorials/three.js/tutorial13/tutorial13.htm
      this.createLabelRepresentation(labels);
    };

    iCn3D.prototype.removeHighlightObjects = function () {
       // remove prevous highlight
       for(var i in this.prevHighlightObjects) {
           this.mdl.remove(this.prevHighlightObjects[i]);
       }

       this.prevHighlightObjects = [];
    };

    iCn3D.prototype.addHighlightObjects = function (color, bRender, atomsHash) {
       if(color === undefined) color = this.highlightColor;
       if(atomsHash === undefined) atomsHash = this.highlightAtoms;

       this.applyDisplayOptions(this.options, this.intersectHash(atomsHash, this.displayAtoms), this.bHighlight);

       if(bRender === undefined || bRender) this.render();
    };

    iCn3D.prototype.removeSurfaces = function () {
       // remove prevous highlight
       for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
           this.mdl.remove(this.prevSurfaces[i]);
       }

       this.prevSurfaces = [];
    };

    iCn3D.prototype.removeLastSurface = function () {
       // remove prevous highlight
       if(this.prevSurfaces.length > 0) {
           this.mdl.remove(this.prevSurfaces[this.prevSurfaces.length - 1]);
           this.prevSurfaces.slice(this.prevSurfaces.length - 1, 1);
       }
    };

    iCn3D.prototype.zoominSelection = function() {
       // center on the highlightAtoms if more than one residue is selected
       if(Object.keys(this.highlightAtoms).length > 1) {
               var centerAtomsResults = this.centerAtoms(this.hash2Atoms(this.highlightAtoms));
               this.maxD = centerAtomsResults.maxD;
               if (this.maxD < 25) this.maxD = 25;

               this.mdl.position.add(this.center).sub(centerAtomsResults.center);

               this.center = centerAtomsResults.center;

               // reset cameara
               this.setCamera();
       }

       this.draw();
    };

    iCn3D.prototype.centerSelection = function() {
       // center on the highlightAtoms if more than one residue is selected
       if(Object.keys(this.highlightAtoms).length > 1) {
               var centerAtomsResults = this.centerAtoms(this.hash2Atoms(this.highlightAtoms));

               this.mdl.position.add(this.center).sub(centerAtomsResults.center);

               this.center = centerAtomsResults.center;

               // reset cameara
               this.setCamera();
       }

       this.draw();
    };

    iCn3D.prototype.resetOrientation = function() {
        if(this.commands.length > 0) {
            var commandTransformation = this.commands[0].split('|||');

            if(commandTransformation.length == 2) {
                var transformation = JSON.parse(commandTransformation[1]);

                this._zoomFactor = transformation.factor;

                this.mouseChange.x = transformation.mouseChange.x;
                this.mouseChange.y = transformation.mouseChange.y;

                this.quaternion._x = transformation.quaternion._x;
                this.quaternion._y = transformation.quaternion._y;
                this.quaternion._z = transformation.quaternion._z;
                this.quaternion._w = transformation.quaternion._w;

                //reset this.maxD
                this.maxD = this.oriMaxD;
                this.center = this.oriCenter.clone();

                this.draw();
            }
        }
    };

    iCn3D.prototype.addNonCarbonAtomLabels = function (atoms) {
        var size = 18;
        var background = "#FFFFFF";

        var atomsHash = this.intersectHash(this.highlightAtoms, atoms);

        if(this.labels['schematic'] === undefined) this.labels['schematic'] = [];

        for(var i in atomsHash) {
            var atom = this.atoms[i];

            //if(!atom.het) continue;
            if(!this.residues.hasOwnProperty(atom.structure + '_' + atom.chain + '_' + atom.resi)) continue;
            if(atom.elem === 'C') continue;

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            label.position = atom.coord;

            label.bSchematic = 1;

            label.text = atom.elem;
            label.size = size;

            label.color = "#" + atom.color.getHexString();
            label.background = background;

            this.labels['schematic'].push(label);
        }

        this.removeHighlightObjects();
    };

    iCn3D.prototype.addResiudeLabels = function (atoms, bSchematic) {
        var size = 18;
        var background = "#CCCCCC";

        var atomsHash = this.intersectHash(this.highlightAtoms, atoms);

        if(bSchematic) {
            if(this.labels['schematic'] === undefined) this.labels['schematic'] = [];
        }
        else {
            if(this.labels['residue'] === undefined) this.labels['residue'] = [];
        }

        var prevReidueID = '';
        for(var i in atomsHash) {
            var atom = this.atoms[i];

            if(atom.het) continue;
            //if(atom.name !== 'CA' && atom.name !== 'P') continue;

            var label = {}; // Each label contains 'position', 'text', 'color', 'background'

            var currReidueID = atom.structure + '_' + atom.chain + '_' + atom.resi;

            if(atom.name === 'CA' || atom.name === 'P' || this.water.hasOwnProperty(atom.serial) || this.ions.hasOwnProperty(atom.serial) || (this.ligands.hasOwnProperty(atom.serial) && currReidueID !== prevReidueID) ) {
                label.position = atom.coord;

                label.bSchematic = 0;
                if(bSchematic) label.bSchematic = 1;

                label.text = this.residueName2Abbr(atom.resn);
                label.size = size;

                var atomColorStr = atom.color.getHexString().toUpperCase();
                label.color = (atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
                label.background = background;

                if(bSchematic) {
                    this.labels['schematic'].push(label);
                }
                else {
                    this.labels['residue'].push(label);
                }
            }

            prevReidueID = currReidueID;
        }

        this.removeHighlightObjects();
    };

    iCn3D.prototype.switchHighlightLevelBase = function() { var me = this;
      $(document).bind('keydown', function (e) {
        if(e.keyCode === 38) { // arrow up, select upper level of atoms
          e.preventDefault();

          if(!me.bShiftKey && !me.bCtrlKey) me.removeHighlightObjects();

          if(me.highlightlevel === 1) { // atom -> residue
              me.highlightlevel = 2;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);

              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
          }
          else if(me.highlightlevel === 2) { // residue -> strand
              me.highlightlevel = 3;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);
              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.selectStrandHelixFromAtom(firstAtom));
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.selectStrandHelixFromAtom(firstAtom));
            }
          }
          else if(me.highlightlevel === 3) { // strand -> chain
              me.highlightlevel = 4;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);
              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
          }
          else if(me.highlightlevel === 4 || me.highlightlevel === 5) { // chain -> structure
              me.highlightlevel = 5;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);

              if(!me.bShiftKey && !me.bCtrlKey) me.highlightAtoms = {};
              var chainArray = me.structures[firstAtom.structure];
              for(var i = 0, il = chainArray.length; i < il; ++i) {
                  me.highlightAtoms = me.unionHash(me.highlightAtoms, me.chains[chainArray[i]]);
            }
          }

          me.addHighlightObjects();
        }
        else if(e.keyCode === 40) { // arrow down, select down level of atoms
          e.preventDefault();

          me.removeHighlightObjects();

          if( (me.highlightlevel === 2 || me.highlightlevel === 1) && Object.keys(me.pickedAtomList).length === 1) { // residue -> atom
              me.highlightlevel = 1;

              me.highlightAtoms = me.cloneHash(me.pickedAtomList);
              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.pickedAtomList);
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.pickedAtomList);
            }
          }
          else if(me.highlightlevel === 3) { // strand -> residue
            var residueHash = {};

            for(var i in me.pickedAtomList) {
                residueid = me.atoms[i].structure + '_' + me.atoms[i].chain + '_' + me.atoms[i].resi;
                residueHash[residueid] = 1;
            }

            if(Object.keys(residueHash).length === 1) {
                me.highlightlevel = 2;

                var firstAtom = me.getFirstAtomObj(me.pickedAtomList);
                if(!me.bShiftKey && !me.bCtrlKey) {
                    me.highlightAtoms = me.cloneHash(me.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
                else {
                    me.highlightAtoms = me.unionHash(me.highlightAtoms, me.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
                }
            }
          }
          else if(me.highlightlevel === 4) { // chain -> strand
              me.highlightlevel = 3;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);
              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.selectStrandHelixFromAtom(firstAtom));
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.selectStrandHelixFromAtom(firstAtom));
            }
          }
          else if(me.highlightlevel === 5) { // structure -> chain
              me.highlightlevel = 4;

              var firstAtom = me.getFirstAtomObj(me.pickedAtomList);
              if(!me.bShiftKey && !me.bCtrlKey) {
                  me.highlightAtoms = me.cloneHash(me.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
            else {
                me.highlightAtoms = me.unionHash(me.highlightAtoms, me.chains[firstAtom.structure + '_' + firstAtom.chain]);
            }
          }

          me.addHighlightObjects();
        }
      });
    };

    iCn3D.prototype.switchHighlightLevel = function() { var me = this;
        this.switchHighlightLevelBase();
    };
