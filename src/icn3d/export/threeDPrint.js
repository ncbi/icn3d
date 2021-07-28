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

    setThichknessFor3Dprint(  ){ let ic = this.icn3d, me = ic.icn3dui;
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

        me.htmlCls.setHtmlCls.setCookieForThickness();
    }

    //Prepare for 3D printing by changing dashed lines to solid lines, changing the thickness of the model.
    prepareFor3Dprint(  ){ let ic = this.icn3d, me = ic.icn3dui;
        // turn off hilight
        ic.bShowHighlight = false;
        ic.hlObjectsCls.removeHlObjects();

        ic.bDashedLines = false;

        if(!ic.bSetThickness && ic.icn3dui.cfg.cid === undefined) {
            this.setThichknessFor3Dprint();
        }

        // change hbond and distance lines from dashed to solid for 3d printing
        if(ic.lines['hbond'] !== undefined) {
            for(let i = 0, il = ic.lines['hbond'].length; i < il; ++i) {
                let line = ic.lines['hbond'][i];
                line.dashed = false;

                ic.bDashedLines = true;
            }
        }

        if(ic.lines['distance'] !== undefined) {
            for(let i = 0, il = ic.lines['distance'].length; i < il; ++i) {
                let line = ic.lines['distance'][i];
                line.dashed = false;

                ic.bDashedLines = true;
            }
        }

        ic.drawCls.draw();
    }

    //Reset the hydrogen bonds, distance lines to dashed lines. Reset the thickness to the default values.
    resetAfter3Dprint(){ let ic = this.icn3d, me = ic.icn3dui;
        // change hbond and distance lines from dashed to solid for 3d printing
        //if(ic.bDashedLines) {
          if(ic.lines['hbond'] !== undefined) {
            for(let i = 0, il = ic.lines['hbond'].length; i < il; ++i) {
                let line = ic.lines['hbond'][i];
                line.dashed = true;
            }
          }

          if(ic.lines['distance'] !== undefined) {
            for(let i = 0, il = ic.lines['distance'].length; i < il; ++i) {
                let line = ic.lines['distance'][i];
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

          me.htmlCls.setHtmlCls.setCookieForThickness();

          //ic.drawCls.draw();
        //}
    }

    removeOneStabilizer(rmLineArray) { let ic = this.icn3d, me = ic.icn3dui;
        let index;
        for(let i = 0, il = ic.pairArray.length; i < il; i += 2) {
            let atom1 = this.getResidueRepAtom(ic.pairArray[i]);
            let atom2 = this.getResidueRepAtom(ic.pairArray[i+1]);

            if(rmLineArray != undefined) {
                for(let j = 0, jl = rmLineArray.length; j < jl; j += 2) {
                    let atomb1 = this.getResidueRepAtom(rmLineArray[j]);
                    let atomb2 = this.getResidueRepAtom(rmLineArray[j+1]);
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
    outputSelection() { let ic = this.icn3d, me = ic.icn3dui;
        let residues = {}
        for(let i in ic.hAtoms) {
            let residueId = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residues[residueId] = 1;
        }

        let residueArray = Object.keys(residues).sort(function(a, b) {
                    if(a !== '' && !isNaN(a)) {
                        return parseInt(a) - parseInt(b);
                    }
                    else {
                        let lastPosA = a.lastIndexOf('_');
                        let lastPosB = b.lastIndexOf('_');
                        if(a.substr(0, lastPosA) < b.substr(0, lastPosA)) return -1;
                        else if(a.substr(0, lastPosA) > b.substr(0, lastPosA)) return 1;
                        else if(a.substr(0, lastPosA) == b.substr(0, lastPosA)) {
                            if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                            else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                            else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                        }
                    }
                });

        let output = "<table><tr><th>Structure</th><th>Chain</th><th>Residue Number</th></tr>";
        for(let i = 0, il = residueArray.length; i < il; ++i) {
            //if(typeof(residueArray[i]) === 'function') continue;

            let firstPos = residueArray[i].indexOf('_');
            let lastPos = residueArray[i].lastIndexOf('_');
            let structure = residueArray[i].substr(0, firstPos);
            let chain = residueArray[i].substr(firstPos + 1, lastPos - firstPos - 1);
            let resi = residueArray[i].substr(lastPos + 1);

            output += "<tr><td>" + structure + "</td><td>" + chain + "</td><td>" + resi + "</td></tr>";
        }

        let file_pref =(ic.inputid) ? ic.inputid : "custom";
        ic.saveFileCls.saveFile(file_pref + '_residues.txt', 'html', output);

    }

    // within the display atoms, show the bonds between C alpha or nucleotide N3
    // 1. add hbonds in protein and nucleotide
    // 2. add stabilizer between chemicals/ions and proteins

    //Add stabilizers in the model for 3D printing. This is especially important for the cartoon display such as ribbons.
    addStabilizer() { let ic = this.icn3d, me = ic.icn3dui;
        let threshold = 3.5; //between 3.2 and 4.0

        let minHbondLen = 3.2;

        //ic.opts["water"] = "dot";

        if(Object.keys(ic.dAtoms).length > 0) {

            // 1. add hbonds in nucleotide
            let atomHbond = {}
            let chain_resi_atom;

            let maxlengthSq = threshold * threshold;
            let minlengthSq = minHbondLen * minHbondLen;

            for(let i in ic.dAtoms) {
              let atom = ic.atoms[i];

              // protein: N, O
              // DNA: C: O2, N3, N4; G: N1, N2, O6; A: N1, N6; T: N1, N6
              if(ic.nucleotides.hasOwnProperty(atom.serial) &&(atom.name === "N1" || atom.name === "N2"
                  || atom.name === "N3" || atom.name === "N4" || atom.name === "N6" || atom.name === "O2" || atom.name === "O6")
                  ) { // calculate hydrogen bond in residue backbone
                chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

                atomHbond[chain_resi_atom] = atom;
              }
            } // end of for(let i in molecule) {

            let atomArray = Object.keys(atomHbond);
            let len = atomArray.length;

            if(ic.pairArray === undefined) ic.pairArray = [];
            for(let i = 0; i < len; ++i) {
                for(let j = i + 1; j < len; ++j) {
                  let atomid1 = atomArray[i];
                  let atomid2 = atomArray[j];

                  let xdiff = Math.abs(atomHbond[atomid1].coord.x - atomHbond[atomid2].coord.x);
                  if(xdiff > threshold) continue;

                  let ydiff = Math.abs(atomHbond[atomid1].coord.y - atomHbond[atomid2].coord.y);
                  if(ydiff > threshold) continue;

                  let zdiff = Math.abs(atomHbond[atomid1].coord.z - atomHbond[atomid2].coord.z);
                  if(zdiff > threshold) continue;

                  let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
                  if(dist > maxlengthSq || dist < minlengthSq) continue;

                  // output hydrogen bonds
                  ic.pairArray.push(atomHbond[atomid1].serial);
                  ic.pairArray.push(atomHbond[atomid2].serial);
                } // end of for(let j
            } // end of for(let i

            // 2. add stabilizer for chemicals/ions and proteins
            let maxDistance = 6; // connect within 6 angstrom, use 6 since some proteins such as 1FFK_A has large distance between residues

            //displayed residues
            let displayResidueHash = {}
            for(let i in ic.dAtoms) {
                let atom = ic.atoms[i];

                let residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                displayResidueHash[residueid] = 1;
            }

            // connect chemicals, ions, and every third protein residues to neighbors(within 4 angstrom)
            let residueHash = {}
            //chemicals
            for(let i in ic.chemicals) {
                let atom = ic.atoms[i];

                let residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
            }
            //ions
            for(let i in ic.ions) {
                let atom = ic.atoms[i];

                let residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
                if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
            }

            //every third protein residues
            let chainArray = Object.keys(ic.chains);
            for(let i = 0, il = chainArray.length; i < il; ++i) {
                let chainid = chainArray[i];
                let coilCnt = 0;
                let residueid;
                let prevResi = 0;
                for(let j = 0, jl = ic.chainsSeq[chainid].length; j < jl; ++j) {
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

            let residueArray = Object.keys(residueHash);

            if(ic.pairArray === undefined) ic.pairArray = [];
            // displayed atoms except water
            let dAtomsNotWater = me.hashUtilsCls.exclHash(ic.dAtoms, ic.water);

            for(let i = 0, il = residueArray.length; i < il; ++i) {
                let residueid = residueArray[i];
                let ss = ic.secondaries[residueid];

                let sphere = ic.contactCls.getNeighboringAtoms(dAtomsNotWater, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms), maxDistance);

                // original atoms
                let sphereArray = Object.keys(sphere).sort();
                let atomArray = Object.keys(ic.residues[residueid]).sort();

                let bProtein = false;
                if(ic.proteins.hasOwnProperty(atomArray[0])) { // protein
                    atomArray = [atomArray[0]]; // one atom from the residue

                    bProtein = true;

                    // remove the previous, current and the next residues, chemicals, and ions from "sphere"
                    let resi = parseInt(residueid.substr(residueid.lastIndexOf('_') + 1));

                    let simSphere = {}
                    for(let serial in sphere) {
                        if(ic.chemicals.hasOwnProperty(serial) || ic.ions.hasOwnProperty(serial)) continue;

                        let atom = ic.atoms[serial];
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
                            let inter2 = parseInt((sphereArray.length + 0.5) / 2.0);
                            ic.pairArray.push(atomArray[0]);
                            ic.pairArray.push(sphereArray[inter2]);
                    }
                    else { // chemicals or ions
                        let n = 10;
                        let step = parseInt(sphereArray.length /(n+1));

                        for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                            if(j % n == 0) { // make one line for every other 10 atoms
                                let sphereIndex = parseInt(j/n) * step;
                                let inter2 =(sphereIndex < sphereArray.length) ?  sphereIndex : sphereArray.length - 1;
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
    hideStabilizer() { let ic = this.icn3d, me = ic.icn3dui;
        //ic.opts["stabilizer"] = "no";
        ic.pairArray = [];

        ic.lines['stabilizer'] = [];
        ic.stabilizerpnts = [];

        for(let i in ic.water) {
            ic.atoms[i].style = ic.opts["water"];
        }

        //ic.drawCls.draw();
    }

    getResidueRepAtom(serial) { let ic = this.icn3d, me = ic.icn3dui;
        let atomIn = ic.atoms[serial];
        let residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

        let foundAtom;
        if(!ic.proteins.hasOwnProperty(serial) && !ic.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
            foundAtom = atomIn;
        }
        else {
            for(let i in ic.residues[residueid]) {
                let atom = ic.atoms[i];
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
