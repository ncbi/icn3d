/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Cylinder} from '../geometry/cylinder.js';

class ApplySsbonds {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Apply the disulfide bond options.
    applySsbondsOptions(options) { var ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        if (options.ssbonds.toLowerCase() === 'yes' && ic.ssbondpnts !== undefined) {
          var color = '#FFFF00';
          var colorObj = me.parasCls.thr(0xFFFF00);

          var structureArray = Object.keys(ic.structures);
          var start, end;

          if(ic.bAlternate) {
              start = ic.ALTERNATE_STRUCTURE;
              end = ic.ALTERNATE_STRUCTURE + 1;
          }
          else {
              start = 0;
              end = structureArray.length;
          }

          ic.lines['ssbond'] = [];

          for(var s = start, sl = end; s < sl; ++s) {
              var structure = structureArray[s];

              if(ic.ssbondpnts[structure] === undefined) continue;

              //for(var i = 0, lim = Math.floor(ic.ssbondpnts[structure].length / 2); i < lim; i++) {
              for(var i = Math.floor(ic.ssbondpnts[structure].length / 2) - 1; i >= 0; i--) {
                var res1 = ic.ssbondpnts[structure][2 * i], res2 = ic.ssbondpnts[structure][2 * i + 1];
                var serial1, serial2;

                var line = {};
                line.color = color;
                line.dashed = true;

                // each Cys has two S atoms
                var serial1Array = [], serial2Array = [];
                var position1Array = [], position2Array = [];

                var bFound = false, bCalpha = false;
                for(var j in ic.residues[res1]) {
                    if(ic.atoms[j].name === 'SG') {
                        position1Array.push(ic.atoms[j].coord);
                        serial1Array.push(ic.atoms[j].serial);
                        bFound = true;
                    }
                }

                if(!bFound) {
                    for(var j in ic.residues[res1]) {
                        if(ic.atoms[j].name === 'CA') {
                            position1Array.push(ic.atoms[j].coord);
                            serial1Array.push(ic.atoms[j].serial);
                            bFound = true;
                            bCalpha = true;
                            break;
                        }
                    }
                }

                bFound = false;
                for(var j in ic.residues[res2]) {
                    if(ic.atoms[j].name === 'SG') {
                        position2Array.push(ic.atoms[j].coord);
                        serial2Array.push(ic.atoms[j].serial);
                        bFound = true;
                    }
                }

                if(!bFound) {
                    for(var j in ic.residues[res2]) {
                        if(ic.atoms[j].name === 'CA') {
                            position2Array.push(ic.atoms[j].coord);
                            serial2Array.push(ic.atoms[j].serial);
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
                if(line.serial1 !== undefined && line.serial2 !== undefined && !ic.dAtoms.hasOwnProperty(line.serial1) && !ic.dAtoms.hasOwnProperty(line.serial2)) continue;

                //if(line.position1 === undefined || line.position2 === undefined || line.position1.distanceTo(line.position2) > distMax) {
                if(!bSsbond) {
                    ic.ssbondpnts[structure].splice(2 * i, 2);
                    continue;
                }

                //if(ic.atoms[serial1].ids !== undefined) { // mmdb id as input
                    // remove the original disulfide bonds
                    var pos = ic.atoms[line.serial1].bonds.indexOf(line.serial2);
                    var array1, array2;
                    if(pos != -1) {
                        array1 = ic.atoms[line.serial1].bonds.slice(0, pos);
                        array2 = ic.atoms[line.serial1].bonds.slice(pos + 1);

                        ic.atoms[line.serial1].bonds = array1.concat(array2);
                    }

                    pos = ic.atoms[line.serial2].bonds.indexOf(line.serial1);
                    if(pos != -1) {
                        array1 = ic.atoms[line.serial2].bonds.slice(0, pos);
                        array2 = ic.atoms[line.serial2].bonds.slice(pos + 1);

                        ic.atoms[line.serial2].bonds = array1.concat(array2);
                    }
                //}

                //if(ic.lines['ssbond'] === undefined) ic.lines['ssbond'] = [];
                ic.lines['ssbond'].push(line);

                // create bonds for disulfide bonds
                ic.cylinderCls.createCylinder(line.position1, line.position2, ic.cylinderRadius, colorObj);

                // show ball and stick for these two residues
                var residueAtoms;
                residueAtoms = me.hashUtilsCls.unionHash(residueAtoms, ic.residues[res1]);
                residueAtoms = me.hashUtilsCls.unionHash(residueAtoms, ic.residues[res2]);

                // show side chains for the selected atoms
                var atoms = me.hashUtilsCls.intHash(residueAtoms, ic.sidec);
    //            var calpha_atoms = me.hashUtilsCls.intHash(residueAtoms, ic.calphas);
                // include calphas
    //            atoms = me.hashUtilsCls.unionHash(atoms, calpha_atoms);

                // draw sidec separatedly
                for(var j in atoms) {
                  ic.atoms[j].style2 = 'stick';
                }
              } // for(var i = 0,
          } // for(var s = 0,
        } // if (options.ssbonds.toLowerCase() === 'yes'
    }
}

export {ApplySsbonds}
