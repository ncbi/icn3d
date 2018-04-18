iCn3DUI.prototype.setThichknessFor3Dprint = function(  ){ var me = this;
    me.icn3d.lineRadius = 0.6; //0.1; // hbonds, distance lines
    me.icn3d.coilWidth = 1.0; //0.4; // style cartoon-coil
    me.icn3d.cylinderRadius = 0.8; //0.4; // style stick
    me.icn3d.traceRadius = 0.8; //0.4; // style c alpha trace, nucleotide stick
    me.icn3d.dotSphereScale = 0.6; //0.3; // style ball and stick, dot

    me.icn3d.sphereRadius = 1.5; // style sphere
    //me.icn3d.cylinderHelixRadius = 1.6; // style sylinder and plate

    me.icn3d.ribbonthickness = 0.8; //0.4; // style ribbon, nucleotide cartoon, stand thickness
    me.icn3d.helixSheetWidth = 2.0; //1.3; // style ribbon, stand thickness
    me.icn3d.nucleicAcidWidth = 1.2; //0.8; // nucleotide cartoon
};

iCn3DUI.prototype.prepareFor3Dprint = function(  ){ var me = this;
    // turn off hilight
    me.icn3d.bShowHighlight = false;
    me.icn3d.removeHlObjects();

    me.bDashedLines = false;

    if(!me.bSetThickness && me.cfg.cid === undefined) {
        me.setThichknessFor3Dprint();
    }

    // change hbond and distance lines from dashed to solid for 3d printing
    if(me.icn3d.lines['hbond'] !== undefined) {
        for(var i = 0, il = me.icn3d.lines['hbond'].length; i < il; ++i) {
            var line = me.icn3d.lines['hbond'][i];
            line.dashed = false;

            me.bDashedLines = true;
        }
    }

/*
    // hbonds within selection
    if(me.icn3d.lines['stabilizer'] !== undefined) {
        for(var i = 0, il = me.icn3d.lines['stabilizer'].length; i < il; ++i) {
            var line = me.icn3d.lines['stabilizer'][i];
            line.dashed = false;

            me.bDashedLines = true;
        }
    }
*/

    if(me.icn3d.lines['distance'] !== undefined) {
        for(var i = 0, il = me.icn3d.lines['distance'].length; i < il; ++i) {
            var line = me.icn3d.lines['distance'][i];
            line.dashed = false;

            me.bDashedLines = true;
        }
    }

    me.icn3d.draw();
};

iCn3DUI.prototype.resetAfter3Dprint = function(  ){ var me = this;
    // change hbond and distance lines from dashed to solid for 3d printing
    //if(me.bDashedLines) {
      if(me.icn3d.lines['hbond'] !== undefined) {
        for(var i = 0, il = me.icn3d.lines['hbond'].length; i < il; ++i) {
            var line = me.icn3d.lines['hbond'][i];
            line.dashed = true;
        }
      }

      if(me.icn3d.lines['distance'] !== undefined) {
        for(var i = 0, il = me.icn3d.lines['distance'].length; i < il; ++i) {
            var line = me.icn3d.lines['distance'][i];
            line.dashed = true;
        }
      }

      me.icn3d.lineRadius = 0.1; // hbonds, distance lines
      me.icn3d.coilWidth = 0.4; // style cartoon-coil
      me.icn3d.cylinderRadius = 0.4; // style stick
      me.icn3d.traceRadius = 0.4; //0.2; // style c alpha trace, nucleotide stick
      me.icn3d.dotSphereScale = 0.3; // style ball and stick, dot
      me.icn3d.sphereRadius = 1.5; // style sphere
      me.icn3d.cylinderHelixRadius = 1.6; // style sylinder and plate

      me.icn3d.ribbonthickness = 0.4; // style ribbon, nucleotide cartoon, stand thickness
      me.icn3d.helixSheetWidth = 1.3; // style ribbon, nucleotide cartoon, stand thickness
      me.icn3d.nucleicAcidWidth = 0.8; // nucleotide cartoon

      //me.icn3d.draw();
    //}
};

iCn3DUI.prototype.removeOneStabilizer = function(rmLineArray) { var me = this;
    var index;
    for(var i = 0, il = me.icn3d.pairArray.length; i < il; i += 2) {
        var atom1 = me.getResidueRepAtom(me.icn3d.pairArray[i]);
        var atom2 = me.getResidueRepAtom(me.icn3d.pairArray[i+1]);

        if(rmLineArray != undefined) {
            for(var j = 0, jl = rmLineArray.length; j < jl; j += 2) {
                var atomb1 = me.getResidueRepAtom(rmLineArray[j]);
                var atomb2 = me.getResidueRepAtom(rmLineArray[j+1]);
                if( (atom1.serial == atomb1.serial && atom2.serial == atomb2.serial)
                  || (atom1.serial == atomb2.serial && atom2.serial == atomb1.serial)
                  ) {
                    index = i;
                    break;
                }
            }
        }

        if(index !== undefined) break;
    }

    if(index !== undefined) {
        me.icn3d.pairArray.splice(index, 2); // removetwoelements at index i
    }
};

iCn3DUI.prototype.outputSelection = function() { var me = this;
    var residues = {};
    for(var i in me.icn3d.hAtoms) {
        var residueId = me.icn3d.atoms[i].structure + '_' + me.icn3d.atoms[i].chain + '_' + me.icn3d.atoms[i].resi;
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

    me.saveFile(me.inputid + '_residues.txt', 'html', output);

};

// within the display atoms, show the bonds between C alpha or nucleotide N3
// 1. add hbonds in protein and nucleotide
// 2. add stabilizer between chemicals/ions and proteins
iCn3DUI.prototype.addStabilizer = function () { var me = this;
    var threshold = 3.5; //between 3.2 and 4.0

    var minHbondLen = 3.2;

    //me.icn3d.opts["stabilizer"] = "yes";
    me.icn3d.opts["water"] = "dot";

    if(Object.keys(me.icn3d.dAtoms).length > 0) {

        // 1. add hbonds in nucleotide
        var atomHbond = {};
        var chain_resi_atom;

        var maxlengthSq = threshold * threshold;
        var minlengthSq = minHbondLen * minHbondLen;

        for (var i in me.icn3d.dAtoms) {
          var atom = me.icn3d.atoms[i];

          // protein: N, O
          // DNA: C: O2, N3, N4; G: N1, N2, O6; A: N1, N6; T: N1, N6
          if(me.icn3d.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "N1" || atom.name === "N2"
              || atom.name === "N3" || atom.name === "N4" || atom.name === "N6" || atom.name === "O2" || atom.name === "O6")
              ) { // calculate hydrogen bond in residue backbone
            chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

            atomHbond[chain_resi_atom] = atom;
          }
        } // end of for (var i in molecule) {

        var atomArray = Object.keys(atomHbond);
        var len = atomArray.length;

        if(me.icn3d.pairArray === undefined) me.icn3d.pairArray = [];
        for (var i = 0; i < len; ++i) {
            for (var j = i + 1; j < len; ++j) {
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
              me.icn3d.pairArray.push(atomHbond[atomid1].serial);
              me.icn3d.pairArray.push(atomHbond[atomid2].serial);
            } // end of for (var j
        } // end of for (var i

        // 2. add stabilizer for chemicals/ions and proteins
        var maxDistance = 4; // connect within 4 angstrom

        //displayed residues
        var displayResidueHash = {};
        for(var i in me.icn3d.dAtoms) {
            var atom = me.icn3d.atoms[i];

            var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
            displayResidueHash[residueid] = 1;
        }

        // connect chemicals, ions, and every third protein residues to neighbors (within 4 angstrom)
        var residueHash = {};
        //chemicals
        for(var i in me.icn3d.chemicals) {
            var atom = me.icn3d.atoms[i];

            var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
            if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
        }
        //ions
        for(var i in me.icn3d.ions) {
            var atom = me.icn3d.atoms[i];

            var residueid = atom.structure + "_" + atom.chain + "_" + atom.resi;
            if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
        }

        //every third protein residues
        var chainArray = Object.keys(me.icn3d.chains);
        for(var i = 0, il = chainArray.length; i < il; ++i) {
            var chainid = chainArray[i];
            var coilCnt = 0;
            var residueid;
            var prevResi = 0;
            for(var j = 0, jl = me.icn3d.chainsSeq[chainid].length; j < jl; ++j) {
                residueid = chainid + '_' + me.icn3d.chainsSeq[chainid][j].resi;
                if(me.icn3d.secondaries[residueid] == 'c' || me.icn3d.secondaries[residueid] == 'E' || me.icn3d.secondaries[residueid] == 'H') {
                    // add every third residue
                    if(coilCnt % 3 == 0 || me.icn3d.chainsSeq[chainid][j].resi != prevResi + 1) {
                        if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
                    }

                    ++coilCnt;

                    prevResi = me.icn3d.chainsSeq[chainid][j].resi;
                }
            }

            // last residue
            if(me.icn3d.secondaries[residueid] == 'c' || me.icn3d.secondaries[residueid] == 'E' || me.icn3d.secondaries[residueid] == 'H') {
                if(displayResidueHash.hasOwnProperty(residueid)) residueHash[residueid] = 1;
            }
        }

        var residueArray = Object.keys(residueHash);
        if(me.icn3d.pairArray === undefined) me.icn3d.pairArray = [];
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            var residueid = residueArray[i];
            var ss = me.icn3d.secondaries[residueid];

            var sphere = me.icn3d.getNeighboringAtoms(me.icn3d.dAtoms, me.icn3d.hash2Atoms(me.icn3d.residues[residueid]), maxDistance);

            // original atoms
            var sphereArray = Object.keys(sphere).sort();
            var atomArray = Object.keys(me.icn3d.residues[residueid]).sort();

            var bProtein = false;
            if(me.icn3d.proteins.hasOwnProperty(atomArray[0])) { // protein
                atomArray = [atomArray[0]]; // one atom from the residue

                bProtein = true;

                // remove the previous, current and the next residues, chemicals, and ions from "sphere"
                var resi = parseInt(residueid.substr(residueid.lastIndexOf('_') + 1));

                var simSphere = {};
                for(var serial in sphere) {
                    if(me.icn3d.chemicals.hasOwnProperty(serial) || me.icn3d.ions.hasOwnProperty(serial)) continue;

                    var atom = me.icn3d.atoms[serial];
                    if( (ss == 'c' && (atom.resi > resi + 1 || atom.resi < resi - 1) )
                      || (ss == 'E' && (atom.resi > resi + 2 || atom.resi < resi - 2) )
                      || (ss == 'H' && (atom.resi > resi + 4 || atom.resi < resi - 4) )
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
                        me.icn3d.pairArray.push(atomArray[0]);
                        me.icn3d.pairArray.push(sphereArray[inter2]);
                }
                else { // chemicals or ions
                    var n = 10;
                    var step = parseInt(sphereArray.length / (n+1));

                    for(var j = 0, jl = atomArray.length; j < jl; ++j) {
                        if(j % n == 0) { // make one line for every other 10 atoms
                            var sphereIndex = parseInt(j/n) * step;
                            var inter2 = (sphereIndex < sphereArray.length) ?  sphereIndex : sphereArray.length - 1;
                            me.icn3d.pairArray.push(atomArray[j]);
                            me.icn3d.pairArray.push(sphereArray[inter2]);

                            if(atomArray.length < n + 1) {
                                me.icn3d.pairArray.push(atomArray[j]);
                                me.icn3d.pairArray.push(sphereArray[sphereArray.length - 1]);
                            }
                        }
                    }
                } // else
            } // if(sphereArray.length > 0) {
        } // for

        //me.updateStabilizer();

        //me.prepareFor3Dprint();
    }
};

iCn3DUI.prototype.hideStabilizer = function () { var me = this;
    //me.icn3d.opts["stabilizer"] = "no";
    me.icn3d.pairArray = [];

    me.icn3d.lines['stabilizer'] = [];
    me.icn3d.stabilizerpnts = [];

    for(var i in me.icn3d.water) {
        me.icn3d.atoms[i].style = me.icn3d.opts["water"];
    }

    //me.icn3d.draw();
};

iCn3DUI.prototype.getResidueRepPos = function (serial) { var me = this;
    var atomIn = me.icn3d.atoms[serial];
    var residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

    var pos;
    if(!me.icn3d.proteins.hasOwnProperty(serial) && !me.icn3d.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
        pos = atomIn.coord;
    }
    else {
        for(var i in me.icn3d.residues[residueid]) {
            var atom = me.icn3d.atoms[i];
            if(atom.name === 'N3') { // nucleotide: N3
                pos = me.icn3d.atoms[i].coord;
                break;
            }
            else if(atom.name === 'CA' && atom.ss == 'coil') { // protein coil: CA
                pos = me.icn3d.atoms[i].coord;
                break;
            }
            else if(atom.name === 'CA' && (atom.ss == 'helix' || atom.ss == 'sheet')) { // protein secondary: CA
                pos = (me.icn3d.atoms[i].coord2 !== undefined) ? me.icn3d.atoms[i].coord2 : me.icn3d.atoms[i].coord;
                break;
            }
        }
    }

    if(pos === undefined) pos = atomIn.coord;

    return pos;
};

iCn3DUI.prototype.getResidueRepAtom = function (serial) { var me = this;
    var atomIn = me.icn3d.atoms[serial];
    var residueid = atomIn.structure + "_" + atomIn.chain + "_" + atomIn.resi;

    var foundAtom;
    if(!me.icn3d.proteins.hasOwnProperty(serial) && !me.icn3d.nucleotides.hasOwnProperty(serial)) { // chemicals or ions
        foundAtom = atomIn;
    }
    else {
        for(var i in me.icn3d.residues[residueid]) {
            var atom = me.icn3d.atoms[i];
            if(atom.name === 'CA' || atom.name === 'N3') { // protein: CA, nucleotide: N3
                foundAtom = me.icn3d.atoms[i];
                break;
            }
        }
    }

    if(foundAtom === undefined) foundAtom = atomIn;

    return foundAtom;
};

