/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

class HBond {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/aminoacids/charge/#hydrogen
    // return: 'donor', 'acceptor', 'both', 'ring', 'none'
    isHbondDonorAcceptor(atom) { var ic = this.icn3d, me = ic.icn3dui;
      if( (atom.name == 'N' && !atom.het ) // backbone
        || (atom.elem == 'N' && atom.resn == 'Arg')
        || (atom.elem == 'N' && atom.resn == 'Asn')
        || (atom.elem == 'N' && atom.resn == 'Gln')
        || (atom.elem == 'N' && atom.resn == 'Lys')
        || (atom.elem == 'N' && atom.resn == 'Trp')
        ) {
          return 'donor';
      }
      else if( (atom.name == 'O' && !atom.het ) // backbone
        || (atom.elem == 'S' && atom.resn == 'Met')
        || (atom.elem == 'O' && atom.resn == 'Asn')
        || (atom.elem == 'O' && atom.resn == 'Asp')
        || (atom.elem == 'O' && atom.resn == 'Gln')
        || (atom.elem == 'O' && atom.resn == 'Glu')
        ) {
          return 'acceptor';
      }
      else if((atom.elem == 'S' && atom.resn == 'Cys')
        || (atom.elem == 'N' && atom.resn == 'His')
        || (atom.elem == 'O' && atom.resn == 'Ser')
        || (atom.elem == 'O' && atom.resn == 'Thr')
        || (atom.elem == 'O' && atom.resn == 'Tyr')
        ) {
          return 'both';
      }
      else if(atom.resn == 'Pro') {
          return 'none';
      }
      // if the Nitrogen has one or two non-hydrogen bonded atom, the nitrogen is a donor
      else if(atom.elem == 'N') {
          // X-ray can not differentiate N and O
          if(atom.resn == 'Asn' || atom.resn == 'Gln') return 'both';

          var cnt = 0, cntN = 0;
          for(var k = 0, kl = atom.bonds.length; k < kl; ++k) {
              if(ic.atoms[atom.bonds[k]].elem == 'H') {
                  ++cnt;
              }
          }

          if(cnt == 2) return 'donor';

          cnt = 0;
          for(var i = 0, il = atom.bonds.length; i < il; ++i) {
              var nbAtom = ic.atoms[atom.bonds[i]];
              if(nbAtom.elem != 'H') {
                  ++cnt;

                  for(var j = 0, jl = nbAtom.bonds.length; j < jl; ++j) {
                      if(ic.atoms[nbAtom.bonds[j]].elem == 'N') {
                          ++cntN;
                      }
                  }
              }
          }

          if(cnt == 1) { // donor
              return 'donor';
          }
          else if(cnt == 2) {
              if(cntN > 1) {
                  return 'ring'; //'both'; // possible
              }
              else {
                return 'donor';
              }
          }
          else {
              return 'none';
          }
      }
      // if the neighboring C of Oxygen has two or more bonds with O or N, the oxygen is an acceptor
      else if(atom.elem == 'O' && atom.bonds.length == 1) {
          // X-ray can not differentiate N and O
          if(atom.resn == 'Asn' || atom.resn == 'Gln') return 'both';

          for(var k = 0, kl = atom.bonds.length; k < kl; ++k) {
              if(ic.atoms[atom.bonds[k]].elem == 'H') {
                  return 'donor';
              }
          }

          var cAtom = ic.atoms[atom.bonds[0]];
          var cnt = 0;
          for(var k = 0, kl = cAtom.bonds.length; k < kl; ++k) {
              if(ic.atoms[cAtom.bonds[k]].elem == 'O' || ic.atoms[cAtom.bonds[k]].elem == 'N' || ic.atoms[cAtom.bonds[k]].elem == 'S') {
                  ++cnt;
              }
          }

          if(cnt >= 2) { // acceptor
              return 'acceptor';
          }
          else {
              return 'both'; // possible
          }
      }
      // if Oxygen has two bonds, the oxygen is an acceptor
      else if(atom.elem == 'O' && atom.bonds.length == 2) {
          for(var k = 0, kl = atom.bonds.length; k < kl; ++k) {
              if(ic.atoms[atom.bonds[k]].elem == 'H') {
                  return 'donor';
              }
          }
          return 'acceptor';
      }
      else {
          return 'both'; // possible
      }
    }

    /**
     * From ngl https://github.com/arose/ngl
     * Calculate the angles x-1-2 for all x where x is a heavy atom bonded to ap1.
     * @param  {AtomProxy} ap1 First atom (angle centre)
     * @param  {AtomProxy} ap2 Second atom
     * @return {number[]}        Angles in radians
     */
    calcAngles(ap1, ap2) { var ic = this.icn3d, me = ic.icn3dui;
      var angles = [];
      var d1 = new THREE.Vector3();
      var d2 = new THREE.Vector3();
      d1.subVectors(ap2.coord, ap1.coord);

      for(var k = 0, kl = ap1.bonds.length; k < kl; ++k) {
          if(ic.atoms[ap1.bonds[k]].elem != 'H') {
              d2.subVectors(ic.atoms[ap1.bonds[k]].coord, ap1.coord);
              angles.push(d1.angleTo(d2));
          }
      }

      return angles;
    }

    /**
     * From ngl https://github.com/arose/ngl
     * Find two neighbours of ap1 to define a plane (if possible) and
     * measure angle out of plane to ap2
     * @param  {AtomProxy} ap1 First atom (angle centre)
     * @param  {AtomProxy} ap2 Second atom (out-of-plane)
     * @return {number}        Angle from plane to second atom
     */
    calcPlaneAngle(ap1, ap2) { var ic = this.icn3d, me = ic.icn3dui;
      var x1 = ap1;

      var v12 = new THREE.Vector3();
      v12.subVectors(ap2.coord, ap1.coord);

      var neighbours = [new THREE.Vector3(), new THREE.Vector3()];

      var ni = 0;
      for(var k = 0, kl = ap1.bonds.length; k < kl; ++k) {
          if (ni > 1) { break; }
          if(ic.atoms[ap1.bonds[k]].elem != 'H') {
              x1 = ic.atoms[ap1.bonds[k]];
              neighbours[ni++].subVectors(ic.atoms[ap1.bonds[k]].coord, ap1.coord);
          }
      }

      if (ni === 1) {
          for(var k = 0, kl = x1.bonds.length; k < kl; ++k) {
              if (ni > 1) { break; }
              if(ic.atoms[x1.bonds[k]].elem != 'H' && ic.atoms[x1.bonds[k]].serial != ap1.serial) {
                  neighbours[ni++].subVectors(ic.atoms[x1.bonds[k]].coord, ap1.coord);
              }
          }
      }

      if (ni !== 2) {
        return;
      }

      var cp = neighbours[0].cross(neighbours[1]);
      return Math.abs((Math.PI / 2) - cp.angleTo(v12));
    }

    // https://www.rcsb.org/pages/help/3dview#ligand-view
    // exclude pairs accordingto angles
    isValidHbond(atom, atomHbond, threshold) { var ic = this.icn3d, me = ic.icn3dui;
          // return: 'donor', 'acceptor', 'both', 'ring', 'none'
          var atomType = this.isHbondDonorAcceptor(atom);
          var atomHbondType = this.isHbondDonorAcceptor(atomHbond);

          var maxHbondDist = threshold; //3.5;
          var maxHbondSulfurDist = threshold; //4.1;
          var maxDist = threshold;
          var maxHbondDistSq = maxHbondDist * maxHbondDist;

          var tolerance = 5;
          var maxHbondAccAngle = (45 + tolerance) * Math.PI / 180;
          var maxHbondDonAngle = (45 + tolerance) * Math.PI / 180;
          var maxHbondAccPlaneAngle = 90 * Math.PI / 180;
          var maxHbondDonPlaneAngle = 30 * Math.PI / 180;

          var donorAtom, acceptorAtom;

          if( (atomType == 'donor' &&  (atomHbondType == 'acceptor' || atomHbondType == 'both' || atomHbondType == 'ring'))
            || (atomHbondType == 'acceptor' && (atomType == 'donor' || atomType == 'both' || atomType == 'ring'))
            ) {
              donorAtom = atom;
              acceptorAtom = atomHbond;
          }
          else if( (atomType == 'acceptor' &&  (atomHbondType == 'donor' || atomHbondType == 'both' || atomHbondType == 'ring'))
            || (atomHbondType == 'donor' && (atomType == 'acceptor' || atomType == 'both' || atomType == 'ring'))
            ) {
              acceptorAtom = atom;
              donorAtom = atomHbond;
          }
          else if( (atomType == 'both' || atomType == 'ring') &&  (atomHbondType == 'both'  || atomHbondType == 'ring') ) {
              donorAtom = atom;
              acceptorAtom = atomHbond;
              // or
              //donorAtom = atomHbond;
              //acceptorAtom = atom;

              if( (ic.nucleotides.hasOwnProperty(atom.serial) && ic.nucleotides.hasOwnProperty(atomHbond.serial) && (atomType == 'ring' || atomHbondType == 'ring') ) // 1TUP
                  || ( (atom.het || atomHbond.het) && atomType == 'ring' && atomHbondType == 'ring')  // 3GVU
                  ) {
              }
              else {
                  maxHbondDonPlaneAngle = 90 * Math.PI / 180;
              }
          }
          else if(atomType == 'none' ||  atomHbondType == 'none') {
              return false;
          }
          else {
              return false;
          }

          var donorAngles = this.calcAngles(donorAtom, acceptorAtom);
          var idealDonorAngle = 90 * Math.PI / 180; // 90 for sp2, 60 for sp3
          for(var i = 0, il = donorAngles.length; i < il; ++i) {
              if(Math.abs(idealDonorAngle - donorAngles[i]) > maxHbondDonAngle) {
                  return false;
              }
          }

          //if (idealGeometry[donor.index] === AtomGeometry.Trigonal){ // 120
            var outOfPlane1 = this.calcPlaneAngle(donorAtom, acceptorAtom);

            if (outOfPlane1 !== undefined && outOfPlane1 > maxHbondDonPlaneAngle) {
                return false;
            }
          //}

          var acceptorAngles = this.calcAngles(acceptorAtom, donorAtom);
          var idealAcceptorAngle = 90 * Math.PI / 180;
          for(var i = 0, il = acceptorAngles.length; i < il; ++i) {
              if(Math.abs(idealAcceptorAngle - acceptorAngles[i]) > maxHbondAccAngle) {
                  return false;
              }
          }

          //if (idealGeometry[acceptor.index] === AtomGeometry.Trigonal){ // 120
            var outOfPlane2 = this.calcPlaneAngle(acceptorAtom, donorAtom);
            if (outOfPlane2 !== undefined && outOfPlane2 > maxHbondAccPlaneAngle) return false;
          //}

          return true;
    }

    //Set up hydrogen bonds between chemical and protein/nucleotide in the same structure.
    //"protein" and "chemicals" are hashes with atom indices as keys and 1 as values.
    //"threshold" is the maximum distance of hydrogen bonds and has the unit of angstrom.
    calculateChemicalHbonds(startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal) { var ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

        ic.resid2Residhash = {}

        var atomHbond = {}
        var chain_resi, chain_resi_atom;

        var maxlengthSq = threshold * threshold;

        for (var i in startAtoms) {
          var atom = startAtoms[i];

          // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
          // hbonds: calculate hydrogen bond
          var bAtomCond = (bSaltbridge) ? ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
            || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
            || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
            || (atom.het && (atom.elem === "N" || atom.elem === "O" || atom.elem === "S"))
            : atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.het || atom.resn === "Cys" || atom.resn === "Met"));

          bAtomCond = (ic.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

          if(bAtomCond) {
            chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
            chain_resi_atom = chain_resi + "_" + atom.name;

            atomHbond[chain_resi_atom] = atom;
          }
        } // end of for (var i in startAtoms) {

        var hbondsAtoms = {}
        var residueHash = {}

        // from DSSP C++ code
        //var kSSBridgeDistance = 3.0;
        var kMinimalDistance = 0.5;
        //var kMinimalCADistance = 9.0;
        var kMinHBondEnergy = -9.9;
        var kMaxHBondEnergy = -0.5;
        var kCouplingConstant = -27.888;    //  = -332 * 0.42 * 0.2
        //var kMaxPeptideBondLength = 2.5;

        var hbondCnt = {}

        for (var i in targetAtoms) {
          var atom = targetAtoms[i];

          // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
          // hbonds: calculate hydrogen bond
          var bAtomCond = (bSaltbridge) ? ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
            || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
            || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
            || (atom.het && (atom.elem === "N" || atom.elem === "O" || atom.elem === "S") )
            : atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.het || atom.resn === "Cys" || atom.resn === "Met"));

          bAtomCond = (ic.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

          //var bondAtoms = [];
          //for(var k = 0, kl = atom.bonds.length; k < kl; ++k) {
          //    bondAtoms.push(ic.atoms[atom.bonds[k]]);
          //}

          var currResiHash = {}
          if(bAtomCond) {
            chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
            chain_resi_atom = chain_resi + "_" + atom.name;

            //var oriResidName = atom.resn + ' ' + chain_resi_atom;
            var oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
            if(ic.resid2Residhash[oriResidName] === undefined) ic.resid2Residhash[oriResidName] = {}

            for (var j in atomHbond) {
              if(bSaltbridge) {
                  // skip both positive orboth negative cases
                  if( ( (atom.resn === 'LYS' || atom.resn === 'ARG') && (atomHbond[j].resn === 'LYS' || atomHbond[j].resn === 'ARG') ) ||
                    ( (atom.resn === 'GLU' || atom.resn === 'ASP') && (atomHbond[j].resn === 'GLU' || atomHbond[j].resn === 'ASP') ) ) {
                        continue;
                    }
              }

              if(!ic.crossstrucinter && atom.structure != atomHbond[j].structure) continue;

              // skip same residue
              if(chain_resi == j.substr(0, j.lastIndexOf('_') ) ) continue;

              var xdiff = Math.abs(atom.coord.x - atomHbond[j].coord.x);
              if(xdiff > threshold) continue;

              var ydiff = Math.abs(atom.coord.y - atomHbond[j].coord.y);
              if(ydiff > threshold) continue;

              var zdiff = Math.abs(atom.coord.z - atomHbond[j].coord.z);
              if(zdiff > threshold) continue;

              var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
              if(dist > maxlengthSq) continue;

              if(ic.proteins.hasOwnProperty(atom.serial) && ic.proteins.hasOwnProperty(atomHbond[j].serial)
                && (atom.name === 'N' || atom.name === 'O') && (atomHbond[j].name === 'O' || atomHbond[j].name === 'N') ) {

                if(atom.name === atomHbond[j].name) continue;
                if(atom.structure == atomHbond[j].structure && atom.chain == atomHbond[j].chain && Math.abs(atom.resi - atomHbond[j].resi) <= 1) continue; // peptide bond

                // protein backbone hydrogen
                // https://en.wikipedia.org/wiki/DSSP_(hydrogen_bond_estimation_algorithm)
                var result;

                var inDonor = (atom.name === 'N') ? atom : atomHbond[j];
                var inAcceptor = (atom.name === 'O') ? atom : atomHbond[j];

                if (inDonor.resn === 'Pro') {
                    continue;
                }
                else if (inDonor.hcoord === undefined) {
                    if(!this.isValidHbond(atom, atomHbond[j], threshold)) continue;
                }
                else {
                    var inDonorH = inDonor.hcoord;
                    var inDonorN = inDonor.coord;

                    var resid = inAcceptor.structure + "_" + inAcceptor.chain + "_" + inAcceptor.resi;
                    var C_atom;
                    for(var serial in ic.residues[resid]) {
                        if(ic.atoms[serial].name === 'C') {
                            C_atom = ic.atoms[serial];
                            break;
                        }
                    }
                    var inAcceptorC = C_atom.coord;
                    var inAcceptorO = inAcceptor.coord;

                    var distanceHO = inDonorH.distanceTo(inAcceptorO);
                    var distanceHC = inDonorH.distanceTo(inAcceptorC);
                    var distanceNC = inDonorN.distanceTo(inAcceptorC);
                    var distanceNO = inDonorN.distanceTo(inAcceptorO);

                    if (distanceHO < kMinimalDistance || distanceHC < kMinimalDistance || distanceNC < kMinimalDistance || distanceNO < kMinimalDistance) {
                        result = kMinHBondEnergy;
                    }
                    else {
                        result = kCouplingConstant / distanceHO - kCouplingConstant / distanceHC + kCouplingConstant / distanceNC - kCouplingConstant / distanceNO;
                    }

                    //if(result > kMaxHBondEnergy) {
                    if(atom.ss == 'helix' && atomHbond[j].ss == 'helix' && result > kMaxHBondEnergy) {
                        continue;
                    }
                }
              }
              else {
                  if(!this.isValidHbond(atom, atomHbond[j], threshold)) continue;
              }

              // too many hydrogen bonds for one atom
              if(hbondCnt[atom.serial] > 2 || hbondCnt[atomHbond[j].serial] > 2) {
                  continue;
              }

              if(hbondCnt[atom.serial] === undefined) {
                  hbondCnt[atom.serial] = 1;
              }
              else {
                  ++hbondCnt[atom.serial];
              }

              if(hbondCnt[atomHbond[j].serial] === undefined) {
                  hbondCnt[atomHbond[j].serial] = 1;
              }
              else {
                  ++hbondCnt[atomHbond[j].serial];
              }

              // output hydrogen bonds
              if(type !== 'graph') {
                  if(bSaltbridge) {
                      ic.saltbridgepnts.push({'serial': atom.serial, 'coord': atom.coord});
                      ic.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
                  }
                  else {
                      ic.hbondpnts.push({'serial': atom.serial, 'coord': atom.coord});
                      ic.hbondpnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
                  }
              }

              var chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;
              hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[chain_resi]);
              hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[chain_resi2]);

              residueHash[chain_resi] = 1;
              residueHash[chain_resi2] = 1;

              //var residName = atomHbond[j].resn + " " + atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi + '_' + atomHbond[j].name;
              var residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

              var resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;

              if(ic.resids2interAll[resids] === undefined
                || ic.resids2interAll[resids]['ionic'] === undefined
                || !ic.resids2interAll[resids]['ionic'].hasOwnProperty(oriResidName + ',' + residName) ) {
                  ic.resid2Residhash[oriResidName][residName] = dist.toFixed(1);

                  if(!bInternal) {
                      if(ic.resids2inter[resids] === undefined) ic.resids2inter[resids] = {}
                      if(ic.resids2inter[resids]['hbond'] === undefined) ic.resids2inter[resids]['hbond'] = {}
                      ic.resids2inter[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
                  }

                  if(ic.resids2interAll[resids] === undefined) ic.resids2interAll[resids] = {}
                  if(ic.resids2interAll[resids]['hbond'] === undefined) ic.resids2interAll[resids]['hbond'] = {}
                  ic.resids2interAll[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
              }
            } // end of for (var j in atomHbond) {
          }
        } // end of for (var i in targetAtoms) {

        var residueArray = Object.keys(residueHash);

        // draw sidec for these residues
        if(type !== 'graph') {
            for(var i = 0, il = residueArray.length; i < il; ++i) {
                for(var j in ic.residues[residueArray[i]]) {
                    // all atoms should be shown for hbonds
                    ic.atoms[j].style2 = 'stick';
                }
            }
        }

        return hbondsAtoms;
    }

    setHbondsContacts(options, type) { var ic = this.icn3d, me = ic.icn3dui;
        var hbond_contact = type;
        var hbonds_contact = (type == 'hbond') ? 'hbonds' : type;

        ic.lines[hbond_contact] = [];

        if (options[hbonds_contact].toLowerCase() === 'yes') {
            var color;
            var pnts;
            if(type == 'hbond') {
                pnts = ic.hbondpnts;
                color = '#0F0';
            }
            else if(type == 'saltbridge') {
                pnts = ic.saltbridgepnts;
                color = '#0FF';
            }
            else if(type == 'contact') {
                pnts = ic.contactpnts;
                color = '#222';
            }
            else if(type == 'halogen') {
                pnts = ic.halogenpnts;
                color = '#F0F';
            }
            else if(type == 'pi-cation') {
                pnts = ic.picationpnts;
                color = '#F00';
            }
            else if(type == 'pi-stacking') {
                pnts = ic.pistackingpnts;
                color = '#00F';
            }

             for (var i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
                var line = {    }
                line.position1 = pnts[2 * i].coord;
                line.serial1 = pnts[2 * i].serial;
                line.position2 = pnts[2 * i + 1].coord;
                line.serial2 = pnts[2 * i + 1].serial;
                line.color = color;
                line.dashed = true;

                // only draw bonds connected with currently displayed atoms
                if(line.serial1 !== undefined && line.serial2 !== undefined && !ic.dAtoms.hasOwnProperty(line.serial1) && !ic.dAtoms.hasOwnProperty(line.serial2)) continue;

                //if(ic.lines[hbond_contact] === undefined) ic.lines[hbond_contact] = [];
                ic.lines[hbond_contact].push(line);
             }
        }
    }

    //Remove hydrogen bonds.
    hideHbonds() { var ic = this.icn3d, me = ic.icn3dui;
        ic.opts["hbonds"] = "no";
        if(ic.lines === undefined) ic.lines = { }
        ic.lines['hbond'] = [];
        ic.hbondpnts = [];

        for(var i in ic.atoms) {
            ic.atoms[i].style2 = 'nothing';
        }

        for(var i in ic.sidec) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style2 = ic.opts["sidec"];
            }
        }

        for(var i in ic.water) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style = ic.opts["water"];
            }
        }
    }

}

export {HBond}
