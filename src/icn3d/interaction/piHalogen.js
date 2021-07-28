/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';

class PiHalogen {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // get halogen, pi-cation,and pi-stacking
    calculateHalogenPiInteractions(startAtoms, targetAtoms, threshold, type, interactionType, bInternal) { let ic = this.icn3d, me = ic.icn3dui;
        if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

        let chain_resi, chain_resi_atom;

        let atoms1a = {}, atoms1b = {}, atoms2a = {}, atoms2b = {}
        if(interactionType == 'halogen') {
            for (let i in startAtoms) {
              let atom = startAtoms[i];

              atoms1a = me.hashUtilsCls.unionHash(atoms1a, this.getHalogenDonar(atom));
              atoms2a = me.hashUtilsCls.unionHash(atoms2a, this.getHalogenAcceptor(atom));
            }

            for (let i in targetAtoms) {
              let atom = targetAtoms[i];

              atoms2b = me.hashUtilsCls.unionHash(atoms2b, this.getHalogenDonar(atom));
              atoms1b = me.hashUtilsCls.unionHash(atoms1b, this.getHalogenAcceptor(atom));
            }
        }
        else if(interactionType == 'pi-cation') {
            ic.processedRes = {}
            for (let i in startAtoms) {
              let atom = startAtoms[i];

              atoms1a = me.hashUtilsCls.unionHash(atoms1a, this.getPi(atom, false));
              atoms2a = me.hashUtilsCls.unionHash(atoms2a, this.getCation(atom));
            }

            ic.processedRes = {}
            for (let i in targetAtoms) {
              let atom = targetAtoms[i];

              atoms2b = me.hashUtilsCls.unionHash(atoms2b, this.getPi(atom, false));
              atoms1b = me.hashUtilsCls.unionHash(atoms1b, this.getCation(atom));
            }
        }
        else if(interactionType == 'pi-stacking') {
            ic.processedRes = {}
            for (let i in startAtoms) {
              let atom = startAtoms[i];
              atoms1a = me.hashUtilsCls.unionHash(atoms1a, this.getPi(atom, true));
            }

            ic.processedRes = {}
            for (let i in targetAtoms) {
              let atom = targetAtoms[i];

              atoms1b = me.hashUtilsCls.unionHash(atoms1b, this.getPi(atom, true));
            } // for
        }

        let hbondsAtoms = {}
        let residueHash = {}

        ic.resid2Residhash = {}

        let maxlengthSq = threshold * threshold;

        for (let i in atoms1a) {
            let atom1 = atoms1a[i];
            let oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
            if(ic.resid2Residhash[oriResidName] === undefined) ic.resid2Residhash[oriResidName] = {}

            for (let j in atoms1b) {
              let atom2 = atoms1b[j];

              if(!ic.crossstrucinter && atom1.structure != atom2.structure) continue;

              // skip same residue
              if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

              // available in 1b and 2a
              if(interactionType == 'pi-cation' && atom2.resn === 'ARG' && atom2.name === "NH1") {
                let resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;
                let otherAtom = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid2], 'NH2');

                let coord = atom2.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
                atom2 = me.hashUtilsCls.cloneHash(atom2);
                atom2.coord = coord;
              }

              // available in 1a and 1b
              // only parallel or perpendicular
              if(interactionType == 'pi-stacking' && atom1.normal !== undefined && atom2.normal !== undefined) {
                  let dotResult = Math.abs(atom1.normal.dot(atom2.normal));
                  // perpendicular 30 degree || parellel, 30 degree
                  if(dotResult > 0.5 && dotResult < 0.866) continue;
              }

              let bResult = this.getHalogenPiInteractions(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal);

              if(bResult) {
                  hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
                  hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

                  residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
                  residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
              }
            }
        }

        for (let i in atoms2a) {
            let atom1 = atoms2a[i];
            let oriResidName = atom1.resn + ' $' + atom1.structure + '.' + atom1.chain + ':' + atom1.resi + '@' + atom1.name;
            if(ic.resid2Residhash[oriResidName] === undefined) ic.resid2Residhash[oriResidName] = {}

            // available in 1b and 2a
            if(interactionType == 'pi-cation' && atom1.resn === 'ARG' && atom1.name === "NH1") {
                let resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
                let otherAtom = ic.firstAtomObjCls.getFirstAtomObjByName(ic.residues[resid1], 'NH2');

                let coord = atom1.coord.clone().add(otherAtom.coord).multiplyScalar(0.5);
                atom1 = me.hashUtilsCls.cloneHash(atom1);
                atom1.coord = coord;
            }

            for (let j in atoms2b) {
              let atom2 = atoms2b[j];

              if(!ic.crossstrucinter && atom1.structure != atom2.structure) continue;

              // skip same residue
              if(i.substr(0, i.lastIndexOf('_')) == j.substr(0, j.lastIndexOf('_')) ) continue;

              let bResult = this.getHalogenPiInteractions(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal);

              if(bResult) {
                  hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[atom1.structure + "_" + atom1.chain + "_" + atom1.resi]);
                  hbondsAtoms = me.hashUtilsCls.unionHash(hbondsAtoms, ic.residues[atom2.structure + "_" + atom2.chain + "_" + atom2.resi]);

                  residueHash[atom1.structure + "_" + atom1.chain + "_" + atom1.resi] = 1;
                  residueHash[atom2.structure + "_" + atom2.chain + "_" + atom2.resi] = 1;
              }
            }
        }

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

    getHalogenDonar(atom) { let ic = this.icn3d, me = ic.icn3dui;
          let name2atom = {}
          //if(atom.elem === "F" || atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
          if(atom.elem === "CL" || atom.elem === "BR" || atom.elem === "I") {
              let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
              name2atom[chain_resi_atom] = atom;
          }

          return name2atom;
    }

    getHalogenAcceptor(atom) { let ic = this.icn3d, me = ic.icn3dui;
          let name2atom = {}
          let bAtomCond = (atom.elem === "N" || atom.elem === "O" || atom.elem === "S");
          bAtomCond = (ic.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
          if(bAtomCond) {
              let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
              name2atom[chain_resi_atom] = atom;
          }

          return name2atom;
    }

    getPi(atom, bStacking) { let ic = this.icn3d, me = ic.icn3dui;
          let name2atom = {}

          let chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;

          let bAromatic = atom.het || ic.nucleotides.hasOwnProperty(atom.serial) || atom.resn === "PHE"
            || atom.resn === "TYR" || atom.resn === "TRP";
          if(bStacking) bAromatic = bAromatic || atom.resn === "HIS";

          if(bAromatic) {
              if(!ic.processedRes.hasOwnProperty(chain_resi)) {

                  if(atom.het) { // get aromatic for ligands
                      let currName2atom = this.getAromaticPisLigand(chain_resi);
                      name2atom = me.hashUtilsCls.unionHash(name2atom, currName2atom);
                  }
                  else {
                      let piPosArray = undefined, normalArray = undefined, result = undefined;
                      if(ic.nucleotides.hasOwnProperty(atom.serial)) {
                          result = this.getAromaticRings(atom.resn, chain_resi, 'nucleotide');
                      }
                      else {
                          result = this.getAromaticRings(atom.resn, chain_resi, 'protein');
                      }

                      if(result !== undefined) {
                          piPosArray = result.piPosArray;
                          normalArray = result.normalArray;
                      }

                      for(let i = 0, il = piPosArray.length; i < il; ++i) {
                        name2atom[chain_resi + '_pi' + i] = {resn: atom.resn, name: 'pi' + i, coord: piPosArray[i], serial: atom.serial,
                        structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normalArray[i]}
                      }
                  }

                  ic.processedRes[chain_resi] = 1;
              }
          }

          return name2atom;
    }

    getCation(atom) { let ic = this.icn3d, me = ic.icn3dui;
          let name2atom = {}

          // use of the two atoms
          if( atom.resn === 'ARG' && atom.name === "NH2") return;

          // remove HIS:  || atom.resn === 'HIS'
          // For ligands, "N" with one single bond only may be positively charged. => to be improved
          let bAtomCond = ( atom.resn === 'LYS' && atom.elem === "N" && atom.name !== "N")
            || ( atom.resn === 'ARG' && (atom.name === "NH1" || atom.name === "NH2"))
            || (atom.het && me.parasCls.cationsTrimArray.indexOf(atom.elem) !== -1)
            || (atom.het && atom.elem === "N" && atom.bonds.length == 1);
          bAtomCond = (ic.bOpm) ? bAtomCond && atom.resn !== 'DUM' : bAtomCond;
          if(bAtomCond) {
              let chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;
              name2atom[chain_resi_atom] = atom;
          }

          return name2atom;
    }

    getHalogenPiInteractions(atom1, atom2, type, interactionType, threshold, maxlengthSq, oriResidName, bInternal) { let ic = this.icn3d, me = ic.icn3dui;
          let xdiff = Math.abs(atom1.coord.x - atom2.coord.x);
          if(xdiff > threshold) return false;

          let ydiff = Math.abs(atom1.coord.y - atom2.coord.y);
          if(ydiff > threshold) return false;

          let zdiff = Math.abs(atom1.coord.z - atom2.coord.z);
          if(zdiff > threshold) return false;

          let dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
          if(dist > maxlengthSq) return false;

          // output salt bridge
          if(type !== 'graph') {
              if(interactionType == 'halogen') {
                  ic.halogenpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
                  ic.halogenpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
              }
              else if(interactionType == 'pi-cation') {
                  ic.picationpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
                  ic.picationpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
              }
              else if(interactionType == 'pi-stacking') {
                  ic.pistackingpnts.push({'serial': atom1.serial, 'coord': atom1.coord});
                  ic.pistackingpnts.push({'serial': atom2.serial, 'coord': atom2.coord});
              }
          }

          let residName = atom2.resn + ' $' + atom2.structure + '.' + atom2.chain + ':' + atom2.resi + '@' + atom2.name;

          //if(ic.resid2Residhash[oriResidName][residName] === undefined || ic.resid2Residhash[oriResidName][residName] > dist) {
              ic.resid2Residhash[oriResidName][residName] = dist.toFixed(1);
          //}

          let resids = atom1.structure + "_" + atom1.chain + "_" + atom1.resi + "_" + atom1.resn
            + ',' + atom2.structure + "_" + atom2.chain + "_" + atom2.resi + "_" + atom2.resn;

          if(!bInternal) {
              if(ic.resids2inter[resids] === undefined) ic.resids2inter[resids] = {}
              if(ic.resids2inter[resids][interactionType] === undefined) ic.resids2inter[resids][interactionType] = {}
              ic.resids2inter[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);
          }

          if(ic.resids2interAll[resids] === undefined) ic.resids2interAll[resids] = {}
          if(ic.resids2interAll[resids][interactionType] === undefined) ic.resids2interAll[resids][interactionType] = {}
          ic.resids2interAll[resids][interactionType][oriResidName + ',' + residName] = dist.toFixed(1);

          return true;
    }

    getRingNormal(coordArray) { let ic = this.icn3d, me = ic.icn3dui;
        if(coordArray.length < 3) return undefined;

        let v1 = coordArray[0].clone().sub(coordArray[1]);
        let v2 = coordArray[1].clone().sub(coordArray[2]);

        return v1.cross(v2).normalize();
    }

    getAromaticRings(resn, resid, type) { let ic = this.icn3d, me = ic.icn3dui;
        let piPosArray = [];
        let normalArray = [];

        let coordArray1 = [];
        let coordArray2 = [];

        if(type == 'nucleotide') {
            let pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();
            if(resn.trim().toUpperCase() == 'A' || resn.trim().toUpperCase() == 'DA'
              || resn.trim().toUpperCase() == 'G' || resn.trim().toUpperCase() == 'DG') {
                for(let i in ic.residues[resid]) {
                    let atom = ic.atoms[i];
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
                for(let i in ic.residues[resid]) {
                    let atom = ic.atoms[i];
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
            let pos1 = new THREE.Vector3(), pos2 = new THREE.Vector3();

            if(resn.toUpperCase() == 'PHE' || resn.toUpperCase() == 'TYR') {
                for(let i in ic.residues[resid]) {
                    let atom = ic.atoms[i];
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
                for(let i in ic.residues[resid]) {
                    let atom = ic.atoms[i];
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
                for(let i in ic.residues[resid]) {
                    let atom = ic.atoms[i];
                    if(atom.name == 'CZ2' || atom.name == 'CH2' || atom.name == 'CZ3' || atom.name == 'CE3') {
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
    }

    // https://www.geeksforgeeks.org/print-all-the-cycles-in-an-undirected-graph/

    // Function to mark the vertex with
    // different colors for different cycles
    dfs_cycle(u, p, cyclenumber) { let ic = this.icn3d, me = ic.icn3dui;
        // already (completely) visited vertex.
        if (ic.ring_color[u] == 2) {
            return cyclenumber;
        }

        // seen vertex, but was not completely visited -> cycle detected.
        // backtrack based on parents to find the complete cycle.
        if (ic.ring_color[u] == 1) {

            cyclenumber++;
            let cur = p;
            ic.ring_mark[cur] = cyclenumber;

            // backtrack the vertex which are
            // in the current cycle thats found
            while (cur != u) {
                cur = ic.ring_par[cur];
                ic.ring_mark[cur] = cyclenumber;
            }
            return cyclenumber;
        }
        ic.ring_par[u] = p;

        // partially visited.
        ic.ring_color[u] = 1;

        // simple dfs on graph
        if(ic.atoms[u] !== undefined) {
            for(let k = 0, kl = ic.atoms[u].bonds.length; k < kl; ++k) {
                let v = ic.atoms[u].bonds[k];

                // if it has not been visited previously
                if (v == ic.ring_par[u]) {
                    continue;
                }
                cyclenumber = this.dfs_cycle(v, u, cyclenumber);
            }
        }

        // completely visited.
        ic.ring_color[u] = 2;

        return cyclenumber;
    }

    getAromaticPisLigand(resid) { let ic = this.icn3d, me = ic.icn3dui;
        let name2atom = {}

        let serialArray = Object.keys(ic.residues[resid]);
        let n = serialArray.length;

        // arrays required to color the
        // graph, store the parent of node
        ic.ring_color = {}
        ic.ring_par = {}

        // mark with unique numbers
        ic.ring_mark = {}

        // store the numbers of cycle
        let cyclenumber = 0;
        //var edges = 13;

        // call DFS to mark the cycles
        //cyclenumber = this.dfs_cycle(1, 0, cyclenumber);
        cyclenumber = this.dfs_cycle(serialArray[1], serialArray[0], cyclenumber);

        let cycles = {}

        // push the edges that into the
        // cycle adjacency list
        for (let i = 0; i < n; i++) {
            let serial = serialArray[i];
            if (ic.ring_mark[serial] != 0) {
                if(cycles[ic.ring_mark[serial]] === undefined) cycles[ic.ring_mark[serial]] = [];
                cycles[ic.ring_mark[serial]].push(serial);
            }
        }

        // print all the vertex with same cycle
        for (let i = 1; i <= cyclenumber; i++) {
            // Print the i-th cycle
            let coord = new THREE.Vector3();
            let cnt = 0, serial;
            let coordArray = [];
            if(cycles.hasOwnProperty(i)) {
                for (let j = 0, jl = cycles[i].length; j < jl; ++j) {
                    serial = cycles[i][j];
                    coord.add(ic.atoms[serial].coord);
                    coordArray.push(ic.atoms[serial].coord);
                    ++cnt;
                }
            }

            if(cnt == 5 || cnt == 6) {
                let v1 = coordArray[0].clone().sub(coordArray[1]).normalize();
                let v2 = coordArray[1].clone().sub(coordArray[2]).normalize();
                let v3 = coordArray[2].clone().sub(coordArray[3]).normalize();

                let normal = v1.cross(v2).normalize();
                let bPlane = normal.dot(v3);

                //if(Math.abs(bPlane) < 0.017) { // same plane, 89-90 degree
                if(Math.abs(bPlane) < 0.052) { // same plane, 87-90 degree
                    coord.multiplyScalar(1.0 / cnt);

                    let atom = ic.atoms[serial];
                    name2atom[resid + '_pi' + serial] = {resn: atom.resn, name: 'pi' + serial, coord: coord, serial: atom.serial,
                      structure: atom.structure, chain: atom.chain, resi: atom.resi, normal: normal}
                }
            }
        }

        return name2atom;
    }

    hideHalogenPi() { let ic = this.icn3d, me = ic.icn3dui;
        ic.opts["halogen"] = "no";
        ic.opts["pi-cation"] = "no";
        ic.opts["pi-stacking"] = "no";
        if(ic.lines === undefined) ic.lines = { }
        ic.lines['halogen'] = [];
        ic.lines['pi-cation'] = [];
        ic.lines['pi-stacking'] = [];
        ic.halogenpnts = [];
        ic.picationpnts = [];
        ic.pistackingpnts = [];

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

export {PiHalogen}
