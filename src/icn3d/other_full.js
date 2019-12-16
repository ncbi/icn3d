/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/aminoacids/charge/#hydrogen
// return: 'donor', 'acceptor', 'both', 'ring', 'none'
iCn3D.prototype.isHbondDonorAcceptor = function (atom) { var me = this;
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
iCn3D.prototype.calcAngles = function (ap1, ap2) {
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
iCn3D.prototype.calcPlaneAngle = function (ap1, ap2) {
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
iCn3D.prototype.isValidHbond = function (atom, atomHbond, threshold) { var me = this;
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
        || (atomHbondType == 'acceptor ' && (atomType == 'donor' || atomType == 'both' || atomType == 'ring'))
        ) {
          donorAtom = atom;
          acceptorAtom = atomHbond;
      }
      else if( (atomType == 'acceptor' &&  (atomHbondType == 'donor' || atomHbondType == 'both' || atomHbondType == 'ring'))
        || (atomHbondType == 'donor ' && (atomType == 'acceptor' || atomType == 'both' || atomType == 'ring'))
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
        if (outOfPlane1 !== undefined && outOfPlane1 > maxHbondDonPlaneAngle) return false;
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

/*
      var bondAtoms2 = [];
      for(var k = 0, kl = atomHbond.bonds.length; k < kl; ++k) {
          bondAtoms2.push(this.atoms[atomHbond.bonds[k]]);
      }

      // The angles DA-D-A and D-A-AA should be between 45 and 135 degree, or between Math.PI * 0.25 and Math.PI * 0.75
      var angleMin = Math.PI * 0.25, angleMax = Math.PI * 0.75;
      var v1 = atom.coord; // new THREE.Vector3(atom.coord.x, atom.coord.y, atom.coord.z);
      var v2 = atomHbond.coord; // new THREE.Vector3(atomHbond.coord.x, atomHbond.coord.y, atomHbond.coord.z);
      var v12 = v2.clone().sub(v1);
      var v21 = v1.clone().sub(v2);
      var v0 = new THREE.Vector3(0,0,0);

      var bValid = true;

      for(var k = 0, kl = bondAtoms.length; k < kl && !v12.equals(v0); ++k) {
          var va = new THREE.Vector3(bondAtoms[k].coord.x, bondAtoms[k].coord.y, bondAtoms[k].coord.z);
          var v1a = va.clone().sub(v1);
          if( v1a.equals(v0) ) {
              continue;
          }

          var rad = v1a.clone().angleTo(v12);
          if(rad < angleMin || rad > angleMax) {
              bValid = false;
              break;
          }
      }
      if(!bValid) return bValid;

      for(var k = 0, kl = bondAtoms2.length; k < kl && !v21.equals(v0); ++k) {
          var vb = new THREE.Vector3(bondAtoms2[k].coord.x, bondAtoms2[k].coord.y, bondAtoms2[k].coord.z);
          var v2b = vb.clone().sub(v2);
          if( v2b.equals(v0) ) {
              continue;
          }

          var rad = v2b.clone().angleTo(v21);
          if(rad < angleMin || rad > angleMax) {
              bValid = false;
              break;
          }
      }
      if(!bValid) return bValid;

      // The angle between DA and AA-A-AA' (or DA-D-DA') should be < 90 degree, or < Math.PI * 0.5
      angleMax = Math.PI * 0.5;

      if(bondAtoms.length > 1) {
          var v1a = new THREE.Vector3(bondAtoms[0].coord.x, bondAtoms[0].coord.y, bondAtoms[0].coord.z);
          var v1b = new THREE.Vector3(bondAtoms[1].coord.x, bondAtoms[1].coord.y, bondAtoms[1].coord.z);
          var plane1 = new THREE.Plane().setFromCoplanarPoints ( v1, v1a, v1b);

          var normal = plane1.normal;

          var vOnPlane = v12.clone().projectOnPlane(normal);

          if( v12.equals(v0) || vOnPlane.equals(v0)) {
              bValid = false;
              //continue;
          }
          else {
              var rad = v12.clone().angleTo(vOnPlane);
              if(rad > angleMax) {
                  bValid = false;
                  //break;
              }
          }
      }
      if(!bValid) return bValid;

      if(bondAtoms2.length > 1) {
          var v2a = new THREE.Vector3(bondAtoms2[0].coord.x, bondAtoms2[0].coord.y, bondAtoms2[0].coord.z);
          var v2b = new THREE.Vector3(bondAtoms2[1].coord.x, bondAtoms2[1].coord.y, bondAtoms2[1].coord.z);
          var plane2 = new THREE.Plane().setFromCoplanarPoints ( v2, v2a, v2b);

          var normal = plane2.normal;

          var vOnPlane = v21.clone().projectOnPlane(normal);

          if( v21.equals(v0) || vOnPlane.equals(v0)) {
              bValid = false;
              //continue;
          }
          else {
              var rad = v21.clone().angleTo(vOnPlane);
              if(rad > angleMax) {
                  bValid = false;
                  //break;
              }
          }
      }
      if(!bValid) return bValid;

      return bValid;
*/
};

// get hbonds
iCn3D.prototype.calculateChemicalHbonds = function (startAtoms, targetAtoms, threshold, bSaltbridge) { var me = this;
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    me.resid2Residhash = {};

    var atomHbond = {};
    var chain_resi, chain_resi_atom;

    var maxlengthSq = threshold * threshold;

    for (var i in startAtoms) {
      var atom = startAtoms[i];

      // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
      // hbonds: calculate hydrogen bond
      var bAtomCond = (bSaltbridge !== undefined && bSaltbridge) ? ( (atom.resn === 'ARG' || atom.resn === 'LYS') && atom.elem === "N" && atom.name !== "N")
        || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
        || (atom.het && (atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.resn === "Cys" || atom.resn === "Met")) ) ): atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.resn === "Cys" || atom.resn === "Met"));

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

    for (var i in targetAtoms) {
      var atom = targetAtoms[i];

      // salt bridge: calculate hydrogen bond between Lys/Arg and Glu/Asp
      // hbonds: calculate hydrogen bond
      var bAtomCond = (bSaltbridge !== undefined && bSaltbridge) ? ( (atom.resn === 'ARG' || atom.resn === 'LYS') && atom.elem === "N" && atom.name !== "N")
        || ( (atom.resn === 'GLU' || atom.resn === 'ASP') && atom.elem === "O" && atom.name !== "O")
        || (atom.het && (atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.resn === "Cys" || atom.resn === "Met")) ) ): atom.elem === "N" || atom.elem === "O" || (atom.elem === "S" && (atom.resn === "Cys" || atom.resn === "Met"));

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
          if(bSaltbridge !== undefined && bSaltbridge) {
              // skip both positive orboth negative cases
              if( ( (atom.resn === 'LYS' || atom.resn === 'ARG') && (atomHbond[j].resn === 'LYS' || atomHbond[j].resn === 'ARG') ) ||
                ( (atom.resn === 'GLU' || atom.resn === 'ASP') && (atomHbond[j].resn === 'GLU' || atomHbond[j].resn === 'ASP') ) ) {
                    continue;
                }
          }

          // skip same protein residue
          if(chain_resi == j.substr(0, j.lastIndexOf('_') ) && this.proteins.hasOwnProperty(atomHbond[j].serial)) continue;

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
            if(Math.abs(atom.resi - atomHbond[j].resi) <= 1) continue; // peptide bond

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

          // output hydrogen bonds
          if(bSaltbridge !== undefined && bSaltbridge) {
              this.saltbridgepnts.push({'serial': atom.serial, 'coord': atom.coord});
              this.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
          }
          else {
              this.hbondpnts.push({'serial': atom.serial, 'coord': atom.coord});
              this.hbondpnts.push({'serial': atomHbond[j].serial, 'coord': atomHbond[j].coord});
          }

          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom.structure + "_" + atom.chain + "_" + atom.resi]);
          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi]);

          residueHash[chain_resi] = 1;

          //var residName = atomHbond[j].resn + " " + atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi + '_' + atomHbond[j].name;
          var residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

          if(me.resid2Residhash[oriResidName][residName] === undefined || me.resid2Residhash[oriResidName][residName] > dist) {
              me.resid2Residhash[oriResidName][residName] = dist.toFixed(1);
          }
        } // end of for (var j in atomHbond) {
      }
    } // end of for (var i in targetAtoms) {

    var residueArray = Object.keys(residueHash);

    // draw sidec for these residues
    for(var i = 0, il = residueArray.length; i < il; ++i) {
        for(var j in this.residues[residueArray[i]]) {
            // all atoms should be shown for hbonds
            this.atoms[j].style2 = 'stick';
        }
    }

    return hbondsAtoms;
};

iCn3D.prototype.getChainsFromAtoms = function(atomsHash) {
    var chainsHash = {};
    for(var i in atomsHash) {
       var atom = this.atoms[i];
       var chainid = atom.structure + "_" + atom.chain;

       chainsHash[chainid] = 1;
    }

    return chainsHash;
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
 iCn3D.prototype.getAtomsWithinAtom = function(atomlist, atomlistTarget, distance, bGetPairs, bInteraction) { var me = this;
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

        var oriCalpha, oriResidName;
        var oriResid = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;
        for(var serial in me.residues[oriResid]) {
            if(me.atoms[serial].name === 'CA' || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                oriCalpha = me.atoms[serial];
                break;
            }
        }

        if(oriCalpha === undefined) oriCalpha = oriAtom;

        if(bGetPairs) {
            oriResidName = '$' + oriAtom.structure + '.' + oriAtom.chain + ':' + oriAtom.resi + ' ' + oriAtom.resn;
            if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};
        }

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
                var calpha, residName;
                if(bInteraction !== undefined && bInteraction) {
                    ret[oriAtom.serial] = oriAtom;
                }

                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                for(var serial in me.residues[resid]) {
                    if(me.atoms[serial].name === 'CA' || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                        calpha = me.atoms[serial];
                        break;
                    }
                }

                if(calpha === undefined) calpha = atom;

                    // output contact lines
                if(bInteraction !== undefined && bInteraction) {
                    this.contactpnts.push({'serial': calpha.serial, 'coord': calpha.coord});
                    this.contactpnts.push({'serial': oriCalpha.serial, 'coord': oriCalpha.coord});
                }

                if(bGetPairs) {
                    residName = '$' + atom.structure + '.' + atom.chain + ':' + atom.resi + ' ' + atom.resn;
                    //var dist = Math.sqrt(atomDistSq).toFixed(1);
                    var dist1 = atomDist.toFixed(1);
                    var dist2 = calpha.coord.distanceTo(oriCalpha.coord).toFixed(1);
                    if(me.resid2Residhash[oriResidName][residName] === undefined || me.resid2Residhash[oriResidName][residName] > dist1) {
                        me.resid2Residhash[oriResidName][residName] = dist1 + '_' + dist2;
                    }
                }
           }
        } // inner for
    } // outer for

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

iCn3D.prototype.removeMaps = function () {
   // remove prevous highlight
   for(var i = 0, il = this.prevMaps.length; i < il; ++i) {
       this.mdl.remove(this.prevMaps[i]);
   }

   this.prevMaps = [];
};

iCn3D.prototype.removeEmmaps = function () {
   // remove prevous highlight
   for(var i = 0, il = this.prevEmmaps.length; i < il; ++i) {
       this.mdl.remove(this.prevEmmaps[i]);
   }

   this.prevEmmaps = [];
};

iCn3D.prototype.removeLastMap = function () {
   // remove prevous highlight
   if(this.prevMaps.length > 0) {
       this.mdl.remove(this.prevMaps[this.prevMaps.length - 1]);
       this.prevMaps.slice(this.prevMaps.length - 1, 1);
   }
};

iCn3D.prototype.removeLastEmmap = function () {
   // remove prevous highlight
   if(this.prevEmmaps.length > 0) {
       this.mdl.remove(this.prevEmmaps[this.prevEmmaps.length - 1]);
       this.prevEmmaps.slice(this.prevEmmaps.length - 1, 1);
   }
};

iCn3D.prototype.zoominSelection = function(atoms) { var me = this;
   var para = {};

   para._zoomFactor = 1.0 / me._zoomFactor;
   para.update = true;

   me.controls.update(para);

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

iCn3D.prototype.centerSelection = function(atoms) {
   //this.resetOrientation();

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};

iCn3D.prototype.transformMemPro = function(inCoord, rot, centerFrom, centerTo) {
    var coord = inCoord.clone();
    coord.sub(centerFrom);

    var x = coord.x*rot[0] + coord.y*rot[1] + coord.z*rot[2] + centerTo.x;
    var y = coord.x*rot[3] + coord.y*rot[4] + coord.z*rot[5] + centerTo.y;
    var z = coord.x*rot[6] + coord.y*rot[7] + coord.z*rot[8] + centerTo.z;

    coord.x = x;
    coord.y = y;
    coord.z = z;

    return coord;
};
