/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/aminoacids/charge/#hydrogen
// return: 'donor', 'acceptor', 'both', 'ring', 'none'
iCn3D.prototype.isHbondDonorAcceptor = function (atom) { var me = this; //"use strict";
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
          if(this.atoms[atom.bonds[k]].elem == 'H') {
              ++cnt;
          }
      }

      if(cnt == 2) return 'donor';

      cnt = 0;
      for(var i = 0, il = atom.bonds.length; i < il; ++i) {
          var nbAtom = this.atoms[atom.bonds[i]];
          if(nbAtom.elem != 'H') {
              ++cnt;

              for(var j = 0, jl = nbAtom.bonds.length; j < jl; ++j) {
                  if(this.atoms[nbAtom.bonds[j]].elem == 'N') {
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
          if(this.atoms[atom.bonds[k]].elem == 'H') {
              return 'donor';
          }
      }

      var cAtom = this.atoms[atom.bonds[0]];
      var cnt = 0;
      for(var k = 0, kl = cAtom.bonds.length; k < kl; ++k) {
          if(this.atoms[cAtom.bonds[k]].elem == 'O' || this.atoms[cAtom.bonds[k]].elem == 'N' || this.atoms[cAtom.bonds[k]].elem == 'S') {
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
          if(this.atoms[atom.bonds[k]].elem == 'H') {
              return 'donor';
          }
      }
      return 'acceptor';
  }
  else {
      return 'both'; // possible
  }
};

/**
 * From ngl https://github.com/arose/ngl
 * Calculate the angles x-1-2 for all x where x is a heavy atom bonded to ap1.
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom
 * @return {number[]}        Angles in radians
 */
iCn3D.prototype.calcAngles = function (ap1, ap2) { var me = this; //"use strict";
  var angles = [];
  var d1 = new THREE.Vector3();
  var d2 = new THREE.Vector3();
  d1.subVectors(ap2.coord, ap1.coord);

  for(var k = 0, kl = ap1.bonds.length; k < kl; ++k) {
      if(this.atoms[ap1.bonds[k]].elem != 'H') {
          d2.subVectors(this.atoms[ap1.bonds[k]].coord, ap1.coord);
          angles.push(d1.angleTo(d2));
      }
  }

  return angles;
};

/**
 * From ngl https://github.com/arose/ngl
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
iCn3D.prototype.calcPlaneAngle = function (ap1, ap2) { var me = this; //"use strict";
  var x1 = ap1;

  var v12 = new THREE.Vector3();
  v12.subVectors(ap2.coord, ap1.coord);

  var neighbours = [new THREE.Vector3(), new THREE.Vector3()];

  var ni = 0;
  for(var k = 0, kl = ap1.bonds.length; k < kl; ++k) {
      if (ni > 1) { break; }
      if(this.atoms[ap1.bonds[k]].elem != 'H') {
          x1 = this.atoms[ap1.bonds[k]];
          neighbours[ni++].subVectors(this.atoms[ap1.bonds[k]].coord, ap1.coord);
      }
  }

  if (ni === 1) {
      for(var k = 0, kl = x1.bonds.length; k < kl; ++k) {
          if (ni > 1) { break; }
          if(this.atoms[x1.bonds[k]].elem != 'H' && this.atoms[x1.bonds[k]].serial != ap1.serial) {
              neighbours[ni++].subVectors(this.atoms[x1.bonds[k]].coord, ap1.coord);
          }
      }
  }

  if (ni !== 2) {
    return;
  }

  var cp = neighbours[0].cross(neighbours[1]);
  return Math.abs((Math.PI / 2) - cp.angleTo(v12));
};

// https://www.rcsb.org/pages/help/3dview#ligand-view
// exclude pairs accordingto angles
iCn3D.prototype.isValidHbond = function (atom, atomHbond, threshold) { var me = this; //"use strict";
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

          if( (me.nucleotides.hasOwnProperty(atom.serial) && me.nucleotides.hasOwnProperty(atomHbond.serial) && (atomType == 'ring' || atomHbondType == 'ring') ) // 1TUP
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
};

// get hbonds
iCn3D.prototype.calculateChemicalHbonds = function (startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal) { var me = this; //"use strict";
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    me.resid2Residhash = {};

    var atomHbond = {};
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

      bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

      if(bAtomCond) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        atomHbond[chain_resi_atom] = atom;
      }
    } // end of for (var i in startAtoms) {

    var hbondsAtoms = {};
    var residueHash = {};

    // from DSSP C++ code
    //var kSSBridgeDistance = 3.0;
    var kMinimalDistance = 0.5;
    //var kMinimalCADistance = 9.0;
    var kMinHBondEnergy = -9.9;
    var kMaxHBondEnergy = -0.5;
    var kCouplingConstant = -27.888;    //  = -332 * 0.42 * 0.2
    //var kMaxPeptideBondLength = 2.5;

    var hbondCnt = {};

    for (var i in targetAtoms) {
      var atom = targetAtoms[i];

      // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
      // hbonds: calculate hydrogen bond
      var bAtomCond = (bSaltbridge) ? ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
        || (atom.het && (atom.elem === "N" || atom.elem === "O" || atom.elem === "S") )
        : atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.het || atom.resn === "Cys" || atom.resn === "Met"));

      bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;

      //var bondAtoms = [];
      //for(var k = 0, kl = atom.bonds.length; k < kl; ++k) {
      //    bondAtoms.push(this.atoms[atom.bonds[k]]);
      //}

      var currResiHash = {};
      if(bAtomCond) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        //var oriResidName = atom.resn + ' ' + chain_resi_atom;
        var oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
        if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};

        for (var j in atomHbond) {
          if(bSaltbridge) {
              // skip both positive orboth negative cases
              if( ( (atom.resn === 'LYS' || atom.resn === 'ARG') && (atomHbond[j].resn === 'LYS' || atomHbond[j].resn === 'ARG') ) ||
                ( (atom.resn === 'GLU' || atom.resn === 'ASP') && (atomHbond[j].resn === 'GLU' || atomHbond[j].resn === 'ASP') ) ) {
                    continue;
                }
          }

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

          if(this.proteins.hasOwnProperty(atom.serial) && this.proteins.hasOwnProperty(atomHbond[j].serial)
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
                for(var serial in this.residues[resid]) {
                    if(this.atoms[serial].name === 'C') {
                        C_atom = this.atoms[serial];
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
                  this.saltbridgepnts.push({'serial': atom.serial, 'coord': atom.coord});
                  this.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
              }
              else {
                  this.hbondpnts.push({'serial': atom.serial, 'coord': atom.coord});
                  this.hbondpnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
              }
          }

          var chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;
          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[chain_resi]);
          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[chain_resi2]);

          residueHash[chain_resi] = 1;
          residueHash[chain_resi2] = 1;

          //var residName = atomHbond[j].resn + " " + atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi + '_' + atomHbond[j].name;
          var residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

          var resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;

          if(me.resids2interAll[resids] === undefined
            || me.resids2interAll[resids]['ionic'] === undefined
            || !me.resids2interAll[resids]['ionic'].hasOwnProperty(oriResidName + ',' + residName) ) {
              me.resid2Residhash[oriResidName][residName] = dist.toFixed(1);

              if(!bInternal) {
                  if(me.resids2inter[resids] === undefined) me.resids2inter[resids] = {};
                  if(me.resids2inter[resids]['hbond'] === undefined) me.resids2inter[resids]['hbond'] = {};
                  me.resids2inter[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
              }

              if(me.resids2interAll[resids] === undefined) me.resids2interAll[resids] = {};
              if(me.resids2interAll[resids]['hbond'] === undefined) me.resids2interAll[resids]['hbond'] = {};
              me.resids2interAll[resids]['hbond'][oriResidName + ',' + residName] = dist.toFixed(1);
          }
        } // end of for (var j in atomHbond) {
      }
    } // end of for (var i in targetAtoms) {

    var residueArray = Object.keys(residueHash);

    // draw sidec for these residues
    if(type !== 'graph') {
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            for(var j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
            }
        }
    }

    return hbondsAtoms;
};

// get ionic interactions, including salt bridge (charged hydrogen bonds)
iCn3D.prototype.calculateIonicInteractions = function (startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal) { var me = this; //"use strict";
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    me.resid2Residhash = {};

    var atomCation = {}, atomAnion = {};
    var chain_resi, chain_resi_atom;

    var maxlengthSq = threshold * threshold;

    for (var i in startAtoms) {
      var atom = startAtoms[i];

      // only use one of the two atoms
      if( ( atom.resn === 'ARG' && atom.name === "NH2")
        || ( atom.resn === 'GLU' && atom.name === "OE2")
        || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
          continue;
      }

      var bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && me.cationsTrimArray.indexOf(atom.elem) !== -1);

      var bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
        || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
        || ( me.nucleotidesArray.indexOf(atom.resn) !== -1 && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
        || (atom.het && me.anionsTrimArray.indexOf(atom.elem) !== -1);

      bAtomCondCation = (this.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
      bAtomCondAnion = (this.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

      if(bAtomCondCation || bAtomCondAnion) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        if(bAtomCondCation) atomCation[chain_resi_atom] = atom;
        if(bAtomCondAnion) atomAnion[chain_resi_atom] = atom;
      }
    } // end of for (var i in startAtoms) {

    var hbondsAtoms = {};
    var residueHash = {};

    for (var i in targetAtoms) {
      var atom = targetAtoms[i];

      // only use one of the two atoms
      if( ( atom.resn === 'ARG' && atom.name === "NH2")
        || ( atom.resn === 'GLU' && atom.name === "OE2")
        || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
          continue;
      }

      var bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && me.cationsTrimArray.indexOf(atom.elem) !== -1);

      var bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
        || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
        || ( me.nucleotidesArray.indexOf(atom.resn) !== -1 && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
        || (atom.het && me.anionsTrimArray.indexOf(atom.elem) !== -1);

      bAtomCondCation = (this.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
      bAtomCondAnion = (this.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

      var currResiHash = {};
      if(bAtomCondCation || bAtomCondAnion) {
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        var oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
        if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};

        var atomHbond = {};
        if(bAtomCondCation) atomHbond = atomAnion;
        else if(bAtomCondAnion) atomHbond = atomCation;

        var otherAtom1 = undefined, resid1 = atom.structure + '_' + atom.chain + '_' + atom.resi;
        if( bAtomCondCation && atom.resn === 'ARG' && atom.name === "NH1") {
            otherAtom1 = this.getFirstAtomObjByName(this.residues[resid1], 'NH2');
        }
        else if( bAtomCondAnion && atom.resn === 'GLU' && atom.name === "OE1") {
            otherAtom1 = this.getFirstAtomObjByName(this.residues[resid1], 'OE2');
        }
        else if( bAtomCondAnion && atom.resn === 'ASP' && atom.name === "OD1") {
            otherAtom1 = this.getFirstAtomObjByName(this.residues[resid1], 'OD2');
        }

        var coord1 = (otherAtom1 === undefined) ? atom.coord : atom.coord.clone().add(otherAtom1.coord).multiplyScalar(0.5);

        for (var j in atomHbond) {
          // skip same residue
          if(chain_resi == j.substr(0, j.lastIndexOf('_') )) continue;

            var otherAtom2 = undefined, resid2 = atomHbond[j].structure + '_' + atomHbond[j].chain + '_' + atomHbond[j].resi;
            if( bAtomCondAnion && atomHbond[j].resn === 'ARG' && atomHbond[j].name === "NH1") {
                otherAtom2 = this.getFirstAtomObjByName(this.residues[resid2], 'NH2');
            }
            else if( bAtomCondCation && atomHbond[j].resn === 'GLU' && atomHbond[j].name === "OE1") {
                otherAtom2 = this.getFirstAtomObjByName(this.residues[resid2], 'OE2');
            }
            else if( bAtomCondCation && atomHbond[j].resn === 'ASP' && atomHbond[j].name === "OD1") {
                otherAtom2 = this.getFirstAtomObjByName(this.residues[resid2], 'OD2');
            }

            var coord2 = (otherAtom2 === undefined) ? atomHbond[j].coord : atomHbond[j].coord.clone().add(otherAtom2.coord).multiplyScalar(0.5);

          var xdiff = Math.abs(coord1.x - coord2.x);
          if(xdiff > threshold) continue;

          var ydiff = Math.abs(coord1.y - coord2.y);
          if(ydiff > threshold) continue;

          var zdiff = Math.abs(coord1.z - coord2.z);
          if(zdiff > threshold) continue;

          var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
          if(dist > maxlengthSq) continue;

          // output salt bridge
          if(type !== 'graph') {
              this.saltbridgepnts.push({'serial': atom.serial, 'coord': coord1});
              this.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': coord2});
          }

          var chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;

          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[chain_resi]);
          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[chain_resi2]);

          residueHash[chain_resi] = 1;
          residueHash[chain_resi2] = 1;

          var residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

          //if(me.resid2Residhash[oriResidName][residName] === undefined || me.resid2Residhash[oriResidName][residName] > dist) {
              me.resid2Residhash[oriResidName][residName] = dist.toFixed(1);
          //}

          var resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;

          if(!bInternal) {
              if(me.resids2inter[resids] === undefined) me.resids2inter[resids] = {};
              if(me.resids2inter[resids]['ionic'] === undefined) me.resids2inter[resids]['ionic'] = {};
              me.resids2inter[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);
          }

          if(me.resids2interAll[resids] === undefined) me.resids2interAll[resids] = {};
          if(me.resids2interAll[resids]['ionic'] === undefined) me.resids2interAll[resids]['ionic'] = {};
          me.resids2interAll[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);

        } // end of for (var j in atomHbond) {
      }
    } // end of for (var i in targetAtoms) {

    var residueArray = Object.keys(residueHash);

    // draw sidec for these residues
    if(type !== 'graph') {
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            for(var j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
                if(me.ions.hasOwnProperty(j)) this.atoms[j].style2 = 'sphere';
            }
        }
    }

    return hbondsAtoms;
};

iCn3D.prototype.getHalogenDonar = function (atom) { var me = this; //"use strict";
      var name2atom = {};
      //if(atom.elem === "F" || atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
      if(atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
          var chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
};

iCn3D.prototype.getHalogenAcceptor = function (atom) { var me = this; //"use strict";
      var name2atom = {};
      var bAtomCond = (atom.elem === "N" || atom.elem === "O" || atom.elem === "S");
      bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
      if(bAtomCond) {
          var chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
};

iCn3D.prototype.getPi = function (atom, bStacking) { var me = this; //"use strict";
      var name2atom = {};

      var chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;

      var bAromatic = atom.het || $.inArray(atom.resn, this.nucleotidesArray) !== -1 || atom.resn === "PHE"
        || atom.resn === "TYR" || atom.resn === "TRP";
      if(bStacking) bAromatic = bAromatic || atom.resn === "HIS";

      if(bAromatic) {
          if(!this.processedRes.hasOwnProperty(chain_resi)) {
              if(atom.het) { // get aromatic for ligands
                  var currName2atom = this.getAromaticPisLigand(chain_resi);
                  name2atom = this.unionHash(name2atom, currName2atom);
              }
              else {
                  var piPosArray = undefined, normalArray = undefined, result = undefined;
                  if($.inArray(atom.resn, this.nucleotidesArray) !== -1) {
                      result = this.getAromaticRings(atom.resn, chain_resi, 'nucleotide');
                  }
                  else {
                      result = this.getAromaticRings(atom.resn, chain_resi, 'protein');
                  }

                  if(result !== undefined) {
                      piPosArray = result.piPosArray;
                      normalArray = result.normalArray;
                  }

                  for(var i = 0, il = piPosArray.length; i < il; ++i) {
                    name2atom[chain_resi + '_pi' + i] = {resn: atom.resn, name: 'pi' + i, coord: piPosArray[i], serial: atom.serial,
                    structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normalArray[i]};
                  }
              }

              this.processedRes[chain_resi] = 1;
          }
      }

      return name2atom;
};

iCn3D.prototype.getCation = function (atom) { var me = this; //"use strict";
      var name2atom = {};

      // use of of the two atoms
      if( atom.resn === 'ARG' && atom.name === "NH2") return;

      // remove HIS:  || atom.resn === 'HIS'
      var bAtomCond = ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && me.cationsTrimArray.indexOf(atom.elem) !== -1);
      bAtomCond = (this.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
      if(bAtomCond) {
          var chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
          name2atom[chain_resi_atom] = atom;
      }

      return name2atom;
};

// get halogen, pi-cation,and pi-stacking
iCn3D.prototype.calculateHalogenPiInteractions = function (startAtoms, targetAtoms, threshold, type, interactionType, bInternal) { var me = this; //"use strict";
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    var chain_resi, chain_resi_atom;

    var atoms1a = {}, atoms1b = {}, atoms2a = {}, atoms2b = {};
    if(interactionType == 'halogen') {
        for (var i in startAtoms) {
          var atom = startAtoms[i];

          atoms1a = this.unionHash(atoms1a, this.getHalogenDonar(atom));
          atoms2a = this.unionHash(atoms2a, this.getHalogenAcceptor(atom));
        }

        for (var i in targetAtoms) {
          var atom = targetAtoms[i];

          atoms2b = this.unionHash(atoms2b, this.getHalogenDonar(atom));
          atoms1b = this.unionHash(atoms1b, this.getHalogenAcceptor(atom));
        }
    }
    else if(interactionType == 'pi-cation') {
        this.processedRes = {};
        for (var i in startAtoms) {
          var atom = startAtoms[i];

          atoms1a = this.unionHash(atoms1a, this.getPi(atom, false));
          atoms2a = this.unionHash(atoms2a, this.getCation(atom));
        }

        this.processedRes = {};
        for (var i in targetAtoms) {
          var atom = targetAtoms[i];

          atoms2b = this.unionHash(atoms2b, this.getPi(atom, false));
          atoms1b = this.unionHash(atoms1b, this.getCation(atom));
        }
    }
    else if(interactionType == 'pi-stacking') {
        this.processedRes = {};
        for (var i in startAtoms) {
          var atom = startAtoms[i];

          atoms1a = this.unionHash(atoms1a, this.getPi(atom, true));
        }

        this.processedRes = {};
        for (var i in targetAtoms) {
          var atom = targetAtoms[i];

          atoms1b = this.unionHash(atoms1b, this.getPi(atom, true));
        } // for
    }

    var hbondsAtoms = {};
    var residueHash = {};

    me.resid2Residhash = {};

    var maxlengthSq = threshold * threshold;

    for (var i in atoms1a) {
        var atom1 = atoms1a[i];
        var oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
        if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};

        for (var j in atoms1b) {
          var atom2 = atoms1b[j];

          // skip same residue
          if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

          // available in 1b and 2a
          if(interactionType == 'pi-cation' && atom2.resn === 'ARG' && atom2.name === "NH1") {
            var resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;
            var otherAtom = this.getFirstAtomObjByName(this.residues[resid2], 'NH2');

            var coord = atom2.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
            atom2 = this.cloneHash(atom2);
            atom2.coord = coord;
          }

          // available in 1a and 1b
          // only parallel or perpendicular
          if(interactionType == 'pi-stacking' && atom1.normal !== undefined && atom2.normal !== undefined) {
              var dotResult = Math.abs(atom1.normal.dot(atom2.normal));
              // perpendicular 30 degree || parellel, 30 degree
              if(dotResult > 0.5 && dotResult < 0.866) continue;
          }

          var bResult = this.getHalogenPiInteractions(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal);

          if(bResult) {
              hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
              hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

              residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
              residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
          }
        }
    }

    for (var i in atoms2a) {
        var atom1 = atoms2a[i];
        var oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
        if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};

        // available in 1b and 2a
        if(interactionType == 'pi-cation' && atom1.resn === 'ARG' && atom1.name === "NH1") {
            var resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
            var otherAtom = this.getFirstAtomObjByName(this.residues[resid1], 'NH2');

            var coord = atom1.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
            atom1 = this.cloneHash(atom1);
            atom1.coord = coord;
        }

        for (var j in atoms2b) {
          var atom2 = atoms2b[j];

          // skip same residue
          if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

          var bResult = this.getHalogenPiInteractions(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal);

          if(bResult) {
              hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
              hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

              residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
              residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
          }
        }
    }

    var residueArray = Object.keys(residueHash);

    // draw sidec for these residues
    if(type !== 'graph') {
        for(var i = 0, il = residueArray.length; i < il; ++i) {
            for(var j in this.residues[residueArray[i]]) {
                // all atoms should be shown for hbonds
                this.atoms[j].style2 = 'stick';
                if(me.ions.hasOwnProperty(j)) this.atoms[j].style2 = 'sphere';
            }
        }
    }

    return hbondsAtoms;
};

iCn3D.prototype.getHalogenPiInteractions = function(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal) { var me = this; //"use strict";
      var xdiff = Math.abs(atom1.coord.x - atom2.coord.x);
      if(xdiff > threshold) return false;

      var ydiff = Math.abs(atom1.coord.y - atom2.coord.y);
      if(ydiff > threshold) return false;

      var zdiff = Math.abs(atom1.coord.z - atom2.coord.z);
      if(zdiff > threshold) return false;

      var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
      if(dist > maxlengthSq) return false;

      // output salt bridge
      if(type !== 'graph') {
          if(interactionType == 'halogen') {
              this.halogenpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.halogenpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
          else if(interactionType == 'pi-cation') {
              this.picationpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.picationpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
          else if(interactionType == 'pi-stacking') {
              this.pistackingpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
              this.pistackingpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
          }
      }

      var residName = atom2.resn + ' $' + atom2.structure + '.' + atom2.chain + ':' + atom2.resi + '@' + atom2.name;

      //if(me.resid2Residhash[oriResidName][residName] === undefined || me.resid2Residhash[oriResidName][residName] > dist) {
          me.resid2Residhash[oriResidName][residName] = dist.toFixed(1);
      //}

      var resids = atom1.structure + "_" + atom1.chain + "_" + atom1.resi + "_" + atom1.resn
        + ',' + atom2.structure + "_" + atom2.chain + "_" + atom2.resi + "_" + atom2.resn;

      if(!bInternal) {
          if(me.resids2inter[resids] === undefined) me.resids2inter[resids] = {};
          if(me.resids2inter[resids][interactionType] === undefined) me.resids2inter[resids][interactionType] = {};
          me.resids2inter[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);
      }

      if(me.resids2interAll[resids] === undefined) me.resids2interAll[resids] = {};
      if(me.resids2interAll[resids][interactionType] === undefined) me.resids2interAll[resids][interactionType] = {};
      me.resids2interAll[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);

      return true;
};

iCn3D.prototype.getChainsFromAtoms = function(atomsHash) { var me = this; //"use strict";
    var chainsHash = {};
    for(var i in atomsHash) {
       var atom = this.atoms[i];
       var chainid = atom.structure + "_" + atom.chain;

       chainsHash[chainid] = 1;
    }

    return chainsHash;
};


 iCn3D.prototype.getNeighboringAtoms = function(atomlist, atomlistTarget, distance) { var me = this; //"use strict";
    var me = this; //"use strict";

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

       if(this.bOpm && atom.resn === 'DUM') continue;

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
 iCn3D.prototype.getAtomsWithinAtom = function(atomlist, atomlistTarget, distance, bGetPairs, bInteraction, bInternal) { var me = this; //"use strict";
    var neighbors = this.getNeighboringAtoms(atomlist, atomlistTarget, distance);

    if(bGetPairs) me.resid2Residhash = {};

    //var maxDistSq = (radius + distance) * (radius + distance);
    var maxDistSq = distance * distance;

    var ret = {};
    for(var i in atomlistTarget) {
        //var oriAtom = atomlistTarget[i];
        var oriAtom = me.atoms[i];
        //var radius = this.vdwRadii[oriAtom.elem.toUpperCase()] || this.defaultRadius;
        // The distance between atoms does not include the radius
        var radius = 0;

        var oriCalpha = undefined, oriResidName = undefined;
        var oriResid = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;
        for(var serial in me.residues[oriResid]) {
            if((me.atoms[serial].name === 'CA' && me.atoms[serial].elem === 'C') || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                oriCalpha = me.atoms[serial];
                break;
            }
        }

        if(oriCalpha === undefined) oriCalpha = oriAtom;

        if(bGetPairs) {
            oriResidName = oriAtom.resn + ' $' + oriAtom.structure + '.' + oriAtom.chain + ':' + oriAtom.resi;
            if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};
        }

        var chain_resi = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;

        for (var j in neighbors) {
           var atom = neighbors[j];

           // exclude the target atoms
           if(atom.serial in atomlistTarget) continue;
           if(this.bOpm && atom.resn === 'DUM') continue;

           //var atomDistSq = (atom.coord.x - oriAtom.coord.x) * (atom.coord.x - oriAtom.coord.x) + (atom.coord.y - oriAtom.coord.y) * (atom.coord.y - oriAtom.coord.y) + (atom.coord.z - oriAtom.coord.z) * (atom.coord.z - oriAtom.coord.z);
           var atomDist = atom.coord.distanceTo(oriAtom.coord);

           //if(atomDistSq < maxDistSq) {
           if(atomDist < distance) {
                ret[atom.serial] = atom;
                var calpha = undefined, residName = undefined;
                if(bInteraction) {
                    ret[oriAtom.serial] = oriAtom;
                }

                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                for(var serial in me.residues[resid]) {
                    if( (me.atoms[serial].name === 'CA' && me.atoms[serial].elem === 'C') || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                        calpha = me.atoms[serial];
                        break;
                    }
                }

                if(calpha === undefined) calpha = atom;

                    // output contact lines
                if(bInteraction) {
                    this.contactpnts.push({'serial': calpha.serial, 'coord': calpha.coord});
                    this.contactpnts.push({'serial': oriCalpha.serial, 'coord': oriCalpha.coord});
                }

                if(bGetPairs) {
    var chain_resi2 = atom.structure + '_' + atom.chain + '_' + atom.resi;

    residName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi;
    //var dist = Math.sqrt(atomDistSq).toFixed(1);
    var dist1 = atomDist.toFixed(1);
    var dist2 = calpha.coord.distanceTo(oriCalpha.coord).toFixed(1);

    var resids = chain_resi + '_' + oriAtom.resn + ',' + chain_resi2 + '_' + atom.resn;
    var residNames = oriResidName + ',' + residName;
    if(me.resids2interAll[resids] === undefined
        || me.resids2interAll[resids]['contact'] === undefined
        || !me.resids2interAll[resids]['contact'].hasOwnProperty(residNames)
        || (me.resids2interAll[resids]['hbond'] !== undefined && !me.resids2interAll[resids]['hbond'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['ionic'] !== undefined && !me.resids2interAll[resids]['ionic'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['halogen'] !== undefined && !me.resids2interAll[resids]['halogen'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['pi-cation'] !== undefined && !me.resids2interAll[resids]['pi-cation'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['pi-stacking'] !== undefined && !me.resids2interAll[resids]['pi-stacking'].hasOwnProperty(residNames))
        ) {
          if(me.resid2Residhash[oriResidName][residName] === undefined || dist1 < me.resid2Residhash[oriResidName][residName].split('_')[0]) {
              var cnt = (me.resid2Residhash[oriResidName][residName] === undefined) ? 1 : parseInt(me.resid2Residhash[oriResidName][residName].split('_')[4]) + 1;
              me.resid2Residhash[oriResidName][residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;

              if(!bInternal) {
                  if(me.resids2inter[resids] === undefined) me.resids2inter[resids] = {};
                  if(me.resids2inter[resids]['contact'] === undefined) me.resids2inter[resids]['contact'] = {};
                  me.resids2inter[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
              }

              if(me.resids2interAll[resids] === undefined) me.resids2interAll[resids] = {};
              if(me.resids2interAll[resids]['contact'] === undefined) me.resids2interAll[resids]['contact'] = {};
              me.resids2interAll[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
          }
    }
                } // if(bGetPairs) {
           }
        } // inner for
    } // outer for

    return ret;
 };

 // from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getExtent = function(atomlist) { var me = this; //"use strict";
    var xmin, ymin, zmin;
    var xmax, ymax, zmax;
    var xsum, ysum, zsum, cnt;

    xmin = ymin = zmin = 9999;
    xmax = ymax = zmax = -9999;
    xsum = ysum = zsum = cnt = 0;
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

iCn3D.prototype.centerAtoms = function(atoms) { var me = this; //"use strict";
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

iCn3D.prototype.removeSurfaces = function () { var me = this; //"use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
       this.mdl.remove(this.prevSurfaces[i]);
   }

   this.prevSurfaces = [];
};

iCn3D.prototype.removeLastSurface = function () { var me = this; //"use strict";
   // remove prevous highlight
   if(this.prevSurfaces.length > 0) {
       this.mdl.remove(this.prevSurfaces[this.prevSurfaces.length - 1]);
       this.prevSurfaces.slice(this.prevSurfaces.length - 1, 1);
   }
};

iCn3D.prototype.removeMaps = function () { var me = this; //"use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevMaps.length; i < il; ++i) {
       this.mdl.remove(this.prevMaps[i]);
   }

   this.prevMaps = [];
};

iCn3D.prototype.removeEmmaps = function () { var me = this; //"use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevEmmaps.length; i < il; ++i) {
       this.mdl.remove(this.prevEmmaps[i]);
   }

   this.prevEmmaps = [];
};

iCn3D.prototype.removeLastMap = function () { var me = this; //"use strict";
   // remove prevous highlight
   if(this.prevMaps.length > 0) {
       this.mdl.remove(this.prevMaps[this.prevMaps.length - 1]);
       this.prevMaps.slice(this.prevMaps.length - 1, 1);
   }
};

iCn3D.prototype.removeLastEmmap = function () { var me = this; //"use strict";
   // remove prevous highlight
   if(this.prevEmmaps.length > 0) {
       this.mdl.remove(this.prevEmmaps[this.prevEmmaps.length - 1]);
       this.prevEmmaps.slice(this.prevEmmaps.length - 1, 1);
   }
};

iCn3D.prototype.zoominSelection = function(atoms) { var me = this; //"use strict";
   var para = {};

   para._zoomFactor = 1.0 / me._zoomFactor;
   para.update = true;

   if(this.bControlGl) {
      window.controls.update(para);
   }
   else {
      this.controls.update(para);
   }

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.maxD = centerAtomsResults.maxD;
           if (this.maxD < 5) this.maxD = 5;

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};

iCn3D.prototype.centerSelection = function(atoms) { var me = this; //"use strict";
   //this.resetOrientation();

   this.opts['rotationcenter'] = 'highlight center';

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

    // reset parameters
    this._zoomFactor = 1.0;
    this.mouseChange = new THREE.Vector2(0,0);
    this.quaternion = new THREE.Quaternion(0,0,0,1);

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};

iCn3D.prototype.getRingNormal = function(coordArray) { var me = this; //"use strict";
    if(coordArray.length < 3) return undefined;

    var v1 = coordArray[0].clone().sub(coordArray[1]);
    var v2 = coordArray[1].clone().sub(coordArray[2]);

    return v1.cross(v2).normalize();
};

iCn3D.prototype.getAromaticRings = function(resn, resid, type) { var me = this; //"use strict";
    var piPosArray = [];
    var normalArray = [];

    var coordArray1 = [];
    var coordArray2 = [];

    if(type == 'nucleotide') {
        var pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();
        if(resn.trim().toUpperCase() == 'A' || resn.trim().toUpperCase() == 'DA'
          || resn.trim().toUpperCase() == 'G' || resn.trim().toUpperCase() == 'DG') {
            for(var i in this.residues[resid]) {
                var atom = this.atoms[i];
                if(atom.name == 'N1' || atom.name == 'C2' || atom.name == 'N3' || atom.name == 'C6') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'C4' || atom.name == 'C5') {
                    pos1.add(atom.coord);
                    pos2.add(atom.coord);

                    coordArray1.push(atom.coord);
                    coordArray2.push(atom.coord);
                }
                else if(atom.name == 'N7' || atom.name == 'C8' || atom.name == 'N9') {
                    pos2.add(atom.coord);

                    coordArray2.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);
                piPosArray.push(pos1);
                normalArray.push(this.getRingNormal(coordArray1));
            }

            if(coordArray2.length == 5) {
                pos2.multiplyScalar(1.0 / 5);
                piPosArray.push(pos2);
                normalArray.push(this.getRingNormal(coordArray2));
            }
        }
        else if(resn.trim().toUpperCase() == 'C' || resn.trim().toUpperCase() == 'DC'
          || resn.trim().toUpperCase() == 'T' || resn.trim().toUpperCase() == 'DT'
          || resn.trim().toUpperCase() == 'U' || resn.trim().toUpperCase() == 'DU') {
            for(var i in this.residues[resid]) {
                var atom = this.atoms[i];
                if(atom.name == 'N1' || atom.name == 'C2' || atom.name == 'N3' || atom.name == 'C6') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'C4' || atom.name == 'C5') {
                    pos1.add(atom.coord);

                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);

                piPosArray.push(pos1);

                normalArray.push(this.getRingNormal(coordArray1));
            }
        }
    }
    else if(type == 'protein') {
        var pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();

        if(resn.toUpperCase() == 'PHE' || resn.toUpperCase() == 'TYR') {
            for(var i in this.residues[resid]) {
                var atom = this.atoms[i];
                if(atom.name == 'CG' || atom.name == 'CD1' || atom.name == 'CE1'
                  || atom.name == 'CZ' || atom.name == 'CE2' || atom.name == 'CD2') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);

                piPosArray.push(pos1);
                normalArray.push(this.getRingNormal(coordArray1));
            }
        }
        else if(resn.toUpperCase() == 'HIS') {
            for(var i in this.residues[resid]) {
                var atom = this.atoms[i];
                if(atom.name == 'CG' || atom.name == 'ND1' || atom.name == 'CE1'
                  || atom.name == 'NE2' || atom.name == 'CD2') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
            }

            if(coordArray1.length == 5) {
                pos1.multiplyScalar(1.0 / 5);

                piPosArray.push(pos1);
                normalArray.push(this.getRingNormal(coordArray1));
            }
        }
        else if(resn.toUpperCase() == 'TRP') {
            for(var i in this.residues[resid]) {
                var atom = this.atoms[i];
                if(atom.name == 'CE2' || atom.name == 'CH2' || atom.name == 'CZ3' || atom.name == 'CE3') {
                    pos1.add(atom.coord);
                    coordArray1.push(atom.coord);
                }
                else if(atom.name == 'CD2' || atom.name == 'CE2') {
                    pos1.add(atom.coord);
                    pos2.add(atom.coord);
                    coordArray1.push(atom.coord);
                    coordArray2.push(atom.coord);
                }
                else if(atom.name == 'CG' || atom.name == 'CD1' || atom.name == 'NE1') {
                    pos2.add(atom.coord);
                    coordArray2.push(atom.coord);
                }
            }

            if(coordArray1.length == 6) {
                pos1.multiplyScalar(1.0 / 6);
                piPosArray.push(pos1);
                normalArray.push(this.getRingNormal(coordArray1));
            }

            if(coordArray2.length == 5) {
                pos2.multiplyScalar(1.0 / 5);
                piPosArray.push(pos2);
                normalArray.push(this.getRingNormal(coordArray2));
            }
        }
    }

    return {piPosArray: piPosArray, normalArray: normalArray} ;
};

// https://www.geeksforgeeks.org/print-all-the-cycles-in-an-undirected-graph/

// Function to mark the vertex with
// different colors for different cycles
iCn3D.prototype.dfs_cycle = function(u, p, cyclenumber) { var me = this; //"use strict";
    // already (completely) visited vertex.
    if (me.ring_color[u] == 2) {
        return cyclenumber;
    }

    // seen vertex, but was not completely visited -> cycle detected.
    // backtrack based on parents to find the complete cycle.
    if (me.ring_color[u] == 1) {

        cyclenumber++;
        var cur = p;
        me.ring_mark[cur] = cyclenumber;

        // backtrack the vertex which are
        // in the current cycle thats found
        while (cur != u) {
            cur = me.ring_par[cur];
            me.ring_mark[cur] = cyclenumber;
        }
        return cyclenumber;
    }
    me.ring_par[u] = p;

    // partially visited.
    me.ring_color[u] = 1;

    // simple dfs on graph
    if(this.atoms[u] !== undefined) {
        for(var k = 0, kl = this.atoms[u].bonds.length; k < kl; ++k) {
            var v = this.atoms[u].bonds[k];

            // if it has not been visited previously
            if (v == me.ring_par[u]) {
                continue;
            }
            cyclenumber = this.dfs_cycle(v, u, cyclenumber);
        }
    }

    // completely visited.
    me.ring_color[u] = 2;

    return cyclenumber;
};

iCn3D.prototype.getAromaticPisLigand = function(resid) { var me = this; //"use strict";
    var name2atom = {};

    var serialArray = Object.keys(this.residues[resid]);
    var n = serialArray.length;

    // arrays required to color the
    // graph, store the parent of node
    me.ring_color = {};
    me.ring_par = {};

    // mark with unique numbers
    me.ring_mark = {};

    // store the numbers of cycle
    var cyclenumber = 0;
    //var edges = 13;

    // call DFS to mark the cycles
    //cyclenumber = this.dfs_cycle(1, 0, cyclenumber);
    cyclenumber = this.dfs_cycle(serialArray[1], serialArray[0], cyclenumber);

    var cycles = {};

    // push the edges that into the
    // cycle adjacency list
    for (var i = 0; i < n; i++) {
        var serial = serialArray[i];
        if (me.ring_mark[serial] != 0) {
            if(cycles[me.ring_mark[serial]] === undefined) cycles[me.ring_mark[serial]] = [];
            cycles[me.ring_mark[serial]].push(serial);
        }
    }

    // print all the vertex with same cycle
    for (var i = 1; i <= cyclenumber; i++) {
        // Print the i-th cycle
        var coord = new THREE.Vector3();
        var cnt = 0, serial;
        var coordArray = [];
        if(cycles.hasOwnProperty(i)) {
            for (var j = 0, jl = cycles[i].length; j < jl; ++j) {
                var serial = cycles[i][j];
                coord.add(this.atoms[serial].coord);
                coordArray.push(this.atoms[serial].coord);
                ++cnt;
            }
        }

        if(cnt == 5 || cnt == 6) {
            var v1 = coordArray[0].clone().sub(coordArray[1]).normalize();
            var v2 = coordArray[1].clone().sub(coordArray[2]).normalize();
            var v3 = coordArray[2].clone().sub(coordArray[3]).normalize();

            var normal = v1.cross(v2).normalize();
            var bPlane = normal.dot(v3);

            if(Math.abs(bPlane) < 0.017) { // same plane, 89-90 degree
                coord.multiplyScalar(1.0 / cnt);

                var atom = this.atoms[serial];
                name2atom[resid + '_pi' + serial] = {resn: atom.resn, name: 'pi' + serial, coord: coord, serial: atom.serial,
                  structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normal};
            }
        }
    }

    return name2atom;
};

