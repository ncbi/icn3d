/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applySsbondsOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    if (options.ssbonds.toLowerCase() === 'yes' && this.ssbondpnts !== undefined) {
      var color = '#FFFF00';
      var colorObj = this.thr(0xFFFF00);

      var structureArray = Object.keys(this.structures);
      var start, end;

      if(this.bAlternate) {
          start = this.ALTERNATE_STRUCTURE;
          end = this.ALTERNATE_STRUCTURE + 1;
      }
      else {
          start = 0;
          end = structureArray.length;
      }

      this.lines['ssbond'] = [];

      for(var s = start, sl = end; s < sl; ++s) {
          var structure = structureArray[s];

          if(this.ssbondpnts[structure] === undefined) continue;

          //for(var i = 0, lim = Math.floor(this.ssbondpnts[structure].length / 2); i < lim; i++) {
          for(var i = Math.floor(this.ssbondpnts[structure].length / 2) - 1; i >= 0; i--) {
            var res1 = this.ssbondpnts[structure][2 * i], res2 = this.ssbondpnts[structure][2 * i + 1];
            var serial1, serial2;

            var line = {};
            line.color = color;
            line.dashed = true;

            // each Cys has two S atoms
            var serial1Array = [], serial2Array = [];
            var position1Array = [], position2Array = [];

            var bFound = false, bCalpha = false;
            for(var j in this.residues[res1]) {
                if(this.atoms[j].name === 'SG') {
                    position1Array.push(this.atoms[j].coord);
                    serial1Array.push(this.atoms[j].serial);
                    bFound = true;
                }
            }

            if(!bFound) {
                for(var j in this.residues[res1]) {
                    if(this.atoms[j].name === 'CA') {
                        position1Array.push(this.atoms[j].coord);
                        serial1Array.push(this.atoms[j].serial);
                        bFound = true;
                        bCalpha = true;
                        break;
                    }
                }
            }

            bFound = false;
            for(var j in this.residues[res2]) {
                if(this.atoms[j].name === 'SG') {
                    position2Array.push(this.atoms[j].coord);
                    serial2Array.push(this.atoms[j].serial);
                    bFound = true;
                }
            }

            if(!bFound) {
                for(var j in this.residues[res2]) {
                    if(this.atoms[j].name === 'CA') {
                        position2Array.push(this.atoms[j].coord);
                        serial2Array.push(this.atoms[j].serial);
                        bFound = true;
                        bCalpha = true;
                        break;
                    }
                }
            }

            // determine whether it's true disulfide bonds
            // disulfide bond is about 2.05 angstrom
            var distMax = (bCalpha) ? 7.0 : 3.0;

            var bSsbond = false;
            for(var m = 0, ml = position1Array.length; m < ml; ++m) {
                for(var n = 0, nl = position2Array.length; n < nl; ++n) {
                    if(position1Array[m].distanceTo(position2Array[n]) < distMax) {
                        bSsbond = true;

                        line.serial1 = serial1Array[m];
                        line.position1 = position1Array[m];

                        line.serial2 = serial2Array[n];
                        line.position2 = position2Array[n];

                        break;
                    }
                }
            }

            // only draw bonds connected with currently displayed atoms
            if(line.serial1 !== undefined && line.serial2 !== undefined && !this.dAtoms.hasOwnProperty(line.serial1) && !this.dAtoms.hasOwnProperty(line.serial2)) continue;

            //if(line.position1 === undefined || line.position2 === undefined || line.position1.distanceTo(line.position2) > distMax) {
            if(!bSsbond) {
                this.ssbondpnts[structure].splice(2 * i, 2);
                continue;
            }

            //if(this.atoms[serial1].ids !== undefined) { // mmdb id as input
                // remove the original disulfide bonds
                var pos = this.atoms[line.serial1].bonds.indexOf(line.serial2);
                var array1, array2;
                if(pos != -1) {
                    array1 = this.atoms[line.serial1].bonds.slice(0, pos);
                    array2 = this.atoms[line.serial1].bonds.slice(pos + 1);

                    this.atoms[line.serial1].bonds = array1.concat(array2);
                }

                pos = this.atoms[line.serial2].bonds.indexOf(line.serial1);
                if(pos != -1) {
                    array1 = this.atoms[line.serial2].bonds.slice(0, pos);
                    array2 = this.atoms[line.serial2].bonds.slice(pos + 1);

                    this.atoms[line.serial2].bonds = array1.concat(array2);
                }
            //}

            //if(this.lines['ssbond'] === undefined) this.lines['ssbond'] = [];
            this.lines['ssbond'].push(line);

            // create bonds for disulfide bonds
            //this.createCylinder(line.position1, line.position2, this.cylinderRadius * 0.5, colorObj);
            this.createCylinder(line.position1, line.position2, this.cylinderRadius, colorObj);

            // show ball and stick for these two residues
            var residueAtoms;
            residueAtoms = this.unionHash(residueAtoms, this.residues[res1]);
            residueAtoms = this.unionHash(residueAtoms, this.residues[res2]);

            // show side chains for the selected atoms
            var atoms = this.intHash(residueAtoms, this.sidec);
//            var calpha_atoms = this.intHash(residueAtoms, this.calphas);
            // include calphas
//            atoms = this.unionHash(atoms, calpha_atoms);

            // draw sidec separatedly
            for(var j in atoms) {
              this.atoms[j].style2 = 'stick';
            }
          } // for(var i = 0,
      } // for(var s = 0,
    } // if (options.ssbonds.toLowerCase() === 'yes'
};
