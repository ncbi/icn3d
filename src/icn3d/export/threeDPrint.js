/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {SaveFile} from '../export/saveFile.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {Draw} from '../display/draw.js';
import {Contact} from '../interaction/contact.js';

class ThreeDPrint {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    setThichknessFor3Dprint(  ){ var ic = this.icn3d, me = ic.icn3dui;
        ic.lineRadius = 1; //0.1; // hbonds, distance lines
        ic.coilWidth = 1.2; //0.3; // style cartoon-coil
        ic.cylinderRadius = 0.8; //0.4; // style stick
        ic.traceRadius = 1; //0.4; // style c alpha trace, nucleotide stick
        ic.dotSphereScale = 0.6; //0.3; // style ball and stick, dot

        ic.sphereRadius = 1.5; // style sphere
        //ic.cylinderHelixRadius = 1.6; // style sylinder and plate

        ic.ribbonthickness = 1.0; //0.2; // style ribbon, nucleotide cartoon, stand thickness
        ic.helixSheetWidth = 2.0; //1.3; // style ribbon, stand thickness
        ic.nucleicAcidWidth = 1.4; //0.8; // nucleotide cartoon
    }

    //Prepare for 3D printing by changing dashed lines to solid lines, changing the thickness of the model.
    prepareFor3Dprint(  ){ var ic = this.icn3d, me = ic.icn3dui;
        // turn off hilight
        ic.bShowHighlight = false;
        ic.hlObjectsCls.removeHlObjects();

        ic.bDashedLines = false;

        if(!ic.bSetThickness && ic.icn3dui.cfg.cid === undefined) {
            this.setThichknessFor3Dprint();
        }

        // change hbond and distance lines from dashed to solid for 3d printing
        if(ic.lines['hbond'] !== undefined) {
            for(var i = 0, il = ic.lines['hbond'].length; i < il; ++i) {
                var line = ic.lines['hbond'][i];
                line.dashed = false;

                ic.bDashedLines = true;
            }
        }

        if(ic.lines['distance'] !== undefined) {
            for(var i = 0, il = ic.lines['distance'].length; i < il; ++i) {
                var line = ic.lines['distance'][i];
                line.dashed = false;

                ic.bDashedLines = true;
            }
        }

        ic.drawCls.draw();
    }

    //Reset the hydrogen bonds, distance lines to dashed lines. Reset the thickness to the default values.
    resetAfter3Dprint(  ){ var ic = this.icn3d, me = ic.icn3dui;
        // change hbond and distance lines from dashed to solid for 3d printing
        //if(ic.bDashedLines) {
          if(ic.lines['hbond'] !== undefined) {
            for(var i = 0, il = ic.lines['hbond'].length; i < il; ++i) {
                var line = ic.lines['hbond'][i];
                line.dashed = true;
            }
          }

          if(ic.lines['distance'] !== undefined) {
            for(var i = 0, il = ic.lines['distance'].length; i < il; ++i) {
                var line = ic.lines['distance'][i];
                line.dashed = true;
            }
          }

          ic.lineRadius = 0.1; // hbonds, distance lines
          ic.coilWidth = 0.3; // style cartoon-coil
          ic.cylinderRadius = 0.4; // style stick
          ic.traceRadius = 0.4; //0.2; // style c alpha trace, nucleotide stick
          ic.dotSphereScale = 0.3; // style ball and stick, dot
          ic.sphereRadius = 1.5; // style sphere
          ic.cylinderHelixRadius = 1.6; // style sylinder and plate

          ic.ribbonthickness = 0.2; // style ribbon, nucleotide cartoon, stand thickness
          ic.helixSheetWidth = 1.3; // style ribbon, nucleotide cartoon, stand thickness
          ic.nucleicAcidWidth = 0.8; // nucleotide cartoon

          //ic.drawCls.draw();
        //}
    }

    removeOneStabilizer(rmLineArray) { var ic = this.icn3d, me = ic.icn3dui;
        var index;
        for(var i = 0, il = ic.pairArray.length; i < il; i += 2) {
            var atom1 = this.getResidueRepAtom(ic.pairArray[i]);
            var atom2 = this.getResidueRepAtom(ic.pairArray[i+1]);

            if(rmLineArray != undefined) {
                for(var j = 0, jl = rmLineArray.length; j < jl; j += 2) {
                    var atomb1 = this.getResidueRepAtom(rmLineArray[j]);
                    var atomb2 = this.getResidueRepAtom(rmLineArray[j+1]);
                    if((atom1.serial == atomb1.serial && atom2.serial == atomb2.serial)
                      ||(atom1.serial == atomb2.serial && atom2.serial == atomb1.serial)
                      ) {
                        index = i;
                        break;
                    }
                }
            }

            if(index !== undefined) break;
        }

        if(index !== undefined) {
            ic.pairArray.splice(index, 2); // removetwoelements at index i
        }
    }

    //Output the selected residues in the residue dialog.
    outputSelection() { var ic = this.icn3d, me = ic.icn3dui;
        var residues = {}
        for(var i in ic.hAtoms) {
            var residueId = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueId] = 1;
        }

        var residueArray = Object.keys(residues).sort(function(a, b) {
                    if(a !== '' && !isNaN(a)) {
                        return parseInt(a) - parseInt(b);
                    }
                    else {
                        var lastPosA = a.lastIndexOf('_');
                        var lastPosB = b.lastIndexOf('_');
                        if(a.substr(0, lastPosA) < b.substr(0, lastPosA)) return -1;
                        else if(a.substr(0, lastPosA) > b.substr(0, lastPosA)) return 1;
                        else if(a.substr(0, lastPosA) == b.substr(0, lastPosA)) {
                            if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                            else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                            else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                        }
                    }
                });

        var output = "<table><tr><th>Structure</th><th>Chain</th><th>Residue Number</th></tr>";
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            //if(typeof(residueArray[i]) === 'function') continue;

            var firstPos = residueArray[i].indexOf('_');
            var lastPos = residueArray[i].lastIndexOf('_');
            var structure = residueArray[i].substr(0, firstPos);
            var chain = residueArray[i].substr(firstPos + 1, lastPos - firstPos - 1);
            var resi = residueArray[i].substr(lastPos + 1);

            output += "<tr><td>" + structure + "</td><td>" + chain + "</td><td>" + resi + "</td></tr>";
        }

        var file_pref =(ic.inputid) ? ic.inputid : "custom";
        ic.saveFileCls.saveFile(file_pref + '_residues.txt', 'html', output);

    }

    // within the display atoms, show the bonds between C alpha or nucleotide N3
    // 1. add hbonds in protein and nucleotide
    // 2. add stabilizer between chemicals/ions and proteins

    //Add stabilizers in the model for 3D printing. This is especially important for the cartoon display such as ribbons.
    addStabilizer() { var ic = this.icn3d, me = ic.icn3dui;
        var threshold = 3.5; //between 3.2 and 4.0

        var minHbondLen = 3.2;

        //ic.opts["water"] = "dot";

        if(Object.keys(ic.dAtoms).length > 0) {

            // 1. add hbonds in nucleotide
            var atomHbond = {}
            var chain_resi_atom;

            var maxlengthSq = threshold * threshold;
            var minlengthSq = minHbondLen * minHbondLen;

            for(var i in ic.dAtoms) {
              var atom = ic.atoms[i];

              // protein: N, O
              // DNA: C: O2, N3, N4; G: N1, N2, O6; A: N1, N6; T: N1, N6
              if(ic.nucleotides.hasOwnProperty(atom.serial) &&(atom.name === "N1" || atom.name === "N2"
                  || atom.name === "N3" || atom.name === "N4" || atom.name === "N6" || atom.name === "O2" || atom.name === "O6")
                  ) { // calculate hydrogen bond in residue backbone
                chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

                atomHbond[chain_resi_atom] = atom;
              }
            } // end of for(var i in molecule) {

            var atomArray = Object.keys(atomHbond);
            var len = atomArray.length;

            if(ic.pairArray === undefined) ic.pairArray = [];
            for(var i = 0; i < len; ++i) {
                for(var j = i + 1; j < len; ++j) {
                  var atomid1 = atomArray[i];
                  var atomid2 = atomArray[j];

                  var xdiff = Math.abs(atomHbond[atomid1].coord.x - atomHbond[atomid2].coord.x);
                  if(xdiff > threshold) continue;

                  var ydiff = Math.abs(atomHbond[atomid1].coord.y - atomHbond[atomid2].coord.y);
                  if(ydiff > threshold) continue;

                  var zdiff = Math.abs(atomHbond[atomid1].coord.z - atomHbond[atomid2].coord.z);
                  if(zdiff > threshold) continue;

                  var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
                  if(dist > maxlengthSq || dist < minlengthSq) continue;

                  // output hydrogen bonds
                  ic.pairArray.push(atomHbond[atomid1].serial);
                  ic.pairArray.push(atomHbond[atomid2].serial);
                } // end of for(var j
            } // end of for(var i

            // 2. add stabilizer for chemicals/ions and proteins
            var maxDistance = 6; // connect within 6 angstrom, use 6 since some proteins such as 1FFK_A has large distance between residues

            //displayed residues
            var displayResidueHash = {}
            for(var i in ic.dAtoms) {
                var atom = ic.atoms[i];

                var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                displayResidueHash[residueid] = 1;
            }

            // connect chemicals, ions, and every third protein residues to neighbors(within 4 angstrom)
            var residueHash = {}
            //chemicals
            for(var i in ic.chemicals) {
                var atom = ic.atoms[i];

                var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
            }
            //ions
            for(var i in ic.ions) {
                var atom = ic.atoms[i];

                var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
            }

            //every third protein residues
            var chainArray = Object.keys(ic.chains);
            for(var i = 0, il = chainArray.length; i < il; ++i) {
                var chainid = chainArray[i];
                var coilCnt = 0;
                var residueid;
                var prevResi = 0;
                for(var j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
                    residueid = chainid + '_' + ic.chainsSeq[chainid][j].resi;
                    if(ic.secondaries[residueid] == 'c' || ic.secondaries[residueid] == 'E' || ic.secondaries[residueid] == 'H') {
                        // add every third residue
                        if(coilCnt % 3 == 0 || ic.chainsSeq[chainid][j].resi != parseInt(prevResi) + 1) {
                            if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
                        }

                        ++coilCnt;

                        prevResi = ic.chainsSeq[chainid][j].resi;
                    }
                }

                // last residue
                if(ic.secondaries[residueid] == 'c' || ic.secondaries[residueid] == 'E' || ic.secondaries[residueid] == 'H') {
                    if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
                }
            }

            var residueArray = Object.keys(residueHash);

            if(ic.pairArray === undefined) ic.pairArray = [];
            // displayed atoms except water
            var dAtomsNotWater = me.hashUtilsCls.exclHash(ic.dAtoms, ic.water);

            for(var i = 0, il = residueArray.length; i < il; ++i) {
                var residueid = residueArray[i];
                var ss = ic.secondaries[residueid];

                var sphere = ic.contactCls.getNeighboringAtoms(dAtomsNotWater, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms), maxDistance);

                // original atoms
                var sphereArray = Object.keys(sphere).sort();
                var atomArray = Object.keys(ic.residues[residueid]).sort();

                var bProtein = false;
                if(ic.proteins.hasOwnProperty(atomArray[0])) { // protein
                    atomArray = [atomArray[0]]; // one atom from the residue

                    bProtein = true;

                    // remove the previous, current and the next residues, chemicals, and ions from "sphere"
                    var resi = parseInt(residueid.substr(residueid.lastIndexOf('_') + 1));

                    var simSphere = {}
                    for(var serial in sphere) {
                        if(ic.chemicals.hasOwnProperty(serial) || ic.ions.hasOwnProperty(serial)) continue;

                        var atom = ic.atoms[serial];
                        if(isNaN(atom.resi)) continue;
                        if((ss == 'c' &&(atom.resi > resi + 1 || atom.resi < resi - 1) )
                          ||(ss == 'E' &&(atom.resi > resi + 2 || atom.resi < resi - 2) )
                          ||(ss == 'H' &&(atom.resi > resi + 4 || atom.resi < resi - 4) )
                          ) {
                            simSphere[serial] = 1;
                        }
                    }

                    sphereArray = Object.keys(simSphere).sort();
                }

                // one line per each protein residue
                if(sphereArray.length > 0 && atomArray.length > 0) {
                    if(bProtein) {
                            var inter2 = parseInt((sphereArray.length + 0.5) / 2.0);
                            ic.pairArray.push(atomArray[0]);
                            ic.pairArray.push(sphereArray[inter2]);
                    }
                    else { // chemicals or ions
                        var n = 10;
                        var step = parseInt(sphereArray.length /(n+1));

                        for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                            if(j % n == 0) { // make one line for every other 10 atoms
                                var sphereIndex = parseInt(j/n) * step;
                                var inter2 =(sphereIndex < sphereArray.length) ?  sphereIndex : sphereArray.length - 1;
                                ic.pairArray.push(atomArray[j]);
                                ic.pairArray.push(sphereArray[inter2]);

                                if(atomArray.length < n + 1) {
                                    ic.pairArray.push(atomArray[j]);
                                    ic.pairArray.push(sphereArray[sphereArray.length - 1]);
                                }
                            }
                        }
                    } // else
                } // if(sphereArray.length > 0) {
            } // for
        }
    }

    //Remove all the added stabilizers.
    hideStabilizer() { var ic = this.icn3d, me = ic.icn3dui;
        //ic.opts["stabilizer"] = "no";
        ic.pairArray = [];

        ic.lines['stabilizer'] = [];
        ic.stabilizerpnts = [];

        for(var i in ic.water) {
            ic.atoms[i].style = ic.opts["water"];
        }

        //ic.drawCls.draw();
    }

    getResidueRepAtom(serial) { var ic = this.icn3d, me = ic.icn3dui;
        var atomIn = ic.atoms[serial];
        var residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

        var foundAtom;
        if(!ic.proteins.hasOwnProperty(serial) && !ic.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
            foundAtom = atomIn;
        }
        else {
            for(var i in ic.residues[residueid]) {
                var atom = ic.atoms[i];
                if(atom.name === 'CA' || atom.name === 'N3') { // protein: CA, nucleotide: N3
                    foundAtom = ic.atoms[i];
                    break;
                }
            }
        }

        if(foundAtom === undefined) foundAtom = atomIn;

        return foundAtom;
    }

}

export {ThreeDPrint}
