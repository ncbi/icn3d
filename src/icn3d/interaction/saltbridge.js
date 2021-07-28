/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';

class Saltbridge {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // get ionic interactions, including salt bridge (charged hydrogen bonds)
    calculateIonicInteractions(startAtoms, targetAtoms, threshold, bSaltbridge, type, bInternal) { let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

        ic.resid2Residhash = {}

        let atomCation = {}, atomAnion = {}
        let chain_resi, chain_resi_atom;

        let maxlengthSq = threshold * threshold;

        for (let i in startAtoms) {
          let atom = startAtoms[i];

          // only use one of the two atoms
          if( ( atom.resn === 'ARG' && atom.name === "NH2")
            || ( atom.resn === 'GLU' && atom.name === "OE2")
            || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
              continue;
          }

          // For ligand, "N" with one single bond only may be positively charged. => to be improved
          let bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
            || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
            || (atom.het && me.parasCls.cationsTrimArray.indexOf(atom.elem) !== -1)
            || (atom.het && atom.elem === "N" && atom.bonds.length == 1);

          // For ligand, "O" in carboxy group may be negatively charged. => to be improved
          let bLigNeg = undefined;
          if(atom.het && atom.elem === "O" && atom.bonds.length == 1) {
               let cAtom = ic.atoms[atom.bonds[0]];
               for(let j = 0; j < cAtom.bonds.length; ++j) {
                   let serial = cAtom.bonds[j];
                   if(ic.atoms[serial].elem == "O" && serial != atom.serial) {
                       bLigNeg = true;
                       break;
                   }
               }
          }

          let bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
            || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
            || ( ic.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
            || (atom.het && me.parasCls.anionsTrimArray.indexOf(atom.elem) !== -1)
            || bLigNeg;

          bAtomCondCation = (ic.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
          bAtomCondAnion = (ic.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

          if(bAtomCondCation || bAtomCondAnion) {
            chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
            chain_resi_atom = chain_resi + "_" + atom.name;

            if(bAtomCondCation) atomCation[chain_resi_atom] = atom;
            if(bAtomCondAnion) atomAnion[chain_resi_atom] = atom;
          }
        } // end of for (let i in startAtoms) {

        let hbondsAtoms = {}
        let residueHash = {}

        for (let i in targetAtoms) {
          let atom = targetAtoms[i];

          // only use one of the two atoms
          if( ( atom.resn === 'ARG' && atom.name === "NH2")
            || ( atom.resn === 'GLU' && atom.name === "OE2")
            || ( atom.resn === 'ASP' && atom.name === "OD2") ) {
              continue;
          }

          let bAtomCondCation = ( (atom.resn === 'LYS' || atom.resn === 'HIS') && atom.elem === "N" && atom.name !== "N")
            || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
            || (atom.het && me.parasCls.cationsTrimArray.indexOf(atom.elem) !== -1);

          let bAtomCondAnion = ( atom.resn === 'GLU' && (atom.name === "OE1" || atom.name === "OE2") )
            || ( atom.resn === 'ASP' && (atom.name === "OD1" || atom.name === "OD2") )
            || ( ic.nucleotides.hasOwnProperty(atom.serial) && (atom.name === "OP1" || atom.name === "OP2" || atom.name === "O1P" || atom.name === "O2P"))
            || (atom.het && me.parasCls.anionsTrimArray.indexOf(atom.elem) !== -1);

          bAtomCondCation = (ic.bOpm) ? bAtomCondCation && atom.resn !== 'DUM' : bAtomCondCation;
          bAtomCondAnion = (ic.bOpm) ? bAtomCondAnion && atom.resn !== 'DUM' : bAtomCondAnion;

          let currResiHash = {}
          if(bAtomCondCation || bAtomCondAnion) {
            chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
            chain_resi_atom = chain_resi + "_" + atom.name;

            let oriResidName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;
            if(ic.resid2Residhash[oriResidName] === undefined) ic.resid2Residhash[oriResidName] = {}

            let atomHbond = {}
            if(bAtomCondCation) atomHbond = atomAnion;
            else if(bAtomCondAnion) atomHbond = atomCation;

            let otherAtom1 = undefined, resid1 = atom.structure + '_' + atom.chain + '_' + atom.resi;
            if( bAtomCondCation && atom.resn === 'ARG' && atom.name === "NH1") {
                otherAtom1 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid1], 'NH2');
            }
            else if( bAtomCondAnion && atom.resn === 'GLU' && atom.name === "OE1") {
                otherAtom1 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid1], 'OE2');
            }
            else if( bAtomCondAnion && atom.resn === 'ASP' && atom.name === "OD1") {
                otherAtom1 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid1], 'OD2');
            }

            let coord1 = (otherAtom1 === undefined) ? atom.coord : atom.coord.clone().add(otherAtom1.coord).multiplyScalar(0.5);

            for (let j in atomHbond) {
              // skip same residue
              if(chain_resi == j.substr(0, j.lastIndexOf('_') )) continue;

              if(!ic.crossstrucinter && atom.structure != atomHbond[j].structure) continue;

                let otherAtom2 = undefined, resid2 = atomHbond[j].structure + '_' + atomHbond[j].chain + '_' + atomHbond[j].resi;
                if( bAtomCondAnion && atomHbond[j].resn === 'ARG' && atomHbond[j].name === "NH1") {
                    otherAtom2 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid2], 'NH2');
                }
                else if( bAtomCondCation && atomHbond[j].resn === 'GLU' && atomHbond[j].name === "OE1") {
                    otherAtom2 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid2], 'OE2');
                }
                else if( bAtomCondCation && atomHbond[j].resn === 'ASP' && atomHbond[j].name === "OD1") {
                    otherAtom2 = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid2], 'OD2');
                }

                let coord2 = (otherAtom2 === undefined) ? atomHbond[j].coord : atomHbond[j].coord.clone().add(otherAtom2.coord).multiplyScalar(0.5);

              let xdiff = Math.abs(coord1.x - coord2.x);
              if(xdiff > threshold) continue;

              let ydiff = Math.abs(coord1.y - coord2.y);
              if(ydiff > threshold) continue;

              let zdiff = Math.abs(coord1.z - coord2.z);
              if(zdiff > threshold) continue;

              let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
              if(dist > maxlengthSq) continue;

              // output salt bridge
              if(type !== 'graph') {
                  ic.saltbridgepnts.push({'serial': atom.serial, 'coord': coord1});
                  ic.saltbridgepnts.push({'serial': atomHbond[j].serial, 'coord': coord2});
              }

              let chain_resi2 = atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi;

              hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[chain_resi]);
              hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[chain_resi2]);

              residueHash[chain_resi] = 1;
              residueHash[chain_resi2] = 1;

              let residName = atomHbond[j].resn + ' $' + atomHbond[j].structure + '.' + atomHbond[j].chain + ':' + atomHbond[j].resi + '@' + atomHbond[j].name;

              //if(ic.resid2Residhash[oriResidName][residName] === undefined || ic.resid2Residhash[oriResidName][residName] > dist) {
                  ic.resid2Residhash[oriResidName][residName] = dist.toFixed(1);
              //}

              let resids = chain_resi + '_' + atom.resn + ',' + chain_resi2 + '_' + atomHbond[j].resn;

              if(!bInternal) {
                  if(ic.resids2inter[resids] === undefined) ic.resids2inter[resids] = {}
                  if(ic.resids2inter[resids]['ionic'] === undefined) ic.resids2inter[resids]['ionic'] = {}
                  ic.resids2inter[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);
              }

              if(ic.resids2interAll[resids] === undefined) ic.resids2interAll[resids] = {}
              if(ic.resids2interAll[resids]['ionic'] === undefined) ic.resids2interAll[resids]['ionic'] = {}
              ic.resids2interAll[resids]['ionic'][oriResidName + ',' + residName] = dist.toFixed(1);

            } // end of for (let j in atomHbond) {
          }
        } // end of for (let i in targetAtoms) {

        let residueArray = Object.keys(residueHash);

        // draw sidec for these residues
        if(type !== 'graph') {
            for(let i = 0, il = residueArray.length; i < il; ++i) {
                for(let j in ic.residues[residueArray[i]]) {
                    // all atoms should be shown for hbonds
                    ic.atoms[j].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(j)) ic.atoms[j].style2 = 'sphere';
                }
            }
        }

        return hbondsAtoms;
    }

    hideSaltbridge() { let ic = this.icn3d, me = ic.icn3dui;
        ic.opts["saltbridge"] = "no";
        if(ic.lines === undefined) ic.lines = { }
        ic.lines['saltbridge'] = [];
        ic.saltbridgepnts = [];

        for(let i in ic.atoms) {
            ic.atoms[i].style2 = 'nothing';
        }

        for(let i in ic.sidec) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style2 = ic.opts["sidec"];
            }
        }

        for(let i in ic.water) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style = ic.opts["water"];
            }
        }
    }

}

export {Saltbridge}
