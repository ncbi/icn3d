/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// get ionic interactions, including salt bridge (charged hydrogen bonds)
iCn3D.prototype.calculateIonicInteractions = function (startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal) { var me = this, ic = me.icn3d; "use strict";
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

      // For ligand, "N" with one single bond only may be positively charged. => to be improved
      var bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
        || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
        || (atom.het && me.cationsTrimArray.indexOf(atom.elem) !== -1)
        || (atom.het && atom.elem === "N" && atom.bonds.length == 1);

      // For ligand, "O" in carboxy group may be negatively charged. => to be improved
      var bLigNeg = undefined;
      if(atom.het && atom.elem === "O" && atom.bonds.length == 1) {
           var cAtom = me.atoms[atom.bonds[0]];
           for(var j = 0; j < cAtom.bonds.length; ++j) {
               var serial = cAtom.bonds[j];
               if(me.atoms[serial].elem == "O" && serial != atom.serial) {
                   bLigNeg = true;
                   break;
               }
           }
      }

      var bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
        || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
        || ( me.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
        || (atom.het && me.anionsTrimArray.indexOf(atom.elem) !== -1)
        || bLigNeg;

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
        || ( me.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
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

          if(!me.crossstrucinter && atom.structure != atomHbond[j].structure) continue;

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
