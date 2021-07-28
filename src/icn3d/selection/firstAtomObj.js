/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class FirstAtomObj {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Return the first atom in the atom hash, which has the atom serial number as the key.
    getFirstAtomObj(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return undefined;
        }

        let  atomKeys = Object.keys(atomsHash);
        let  firstIndex = atomKeys[0];

        return ic.atoms[firstIndex];
    }

    getFirstCalphaAtomObj(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return undefined;
        }

        let  firstIndex;

        for(let i in atomsHash) {
            if(ic.atoms[i].name == 'CA') {
                firstIndex = i;
                break;
            }
        }

        return (firstIndex !== undefined) ? ic.atoms[firstIndex] : this.getFirstAtomObj(atomsHash);
    }

    getFirstAtomObjByName(atomsHash, atomName) { let  ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return ic.atoms[0];
        }

        let  firstIndex;

        for(let i in atomsHash) {
            if(ic.atoms[i].name == atomName) {
                firstIndex = i;
                break;
            }
        }

        return (firstIndex !== undefined) ? ic.atoms[firstIndex] : undefined;
    }

    //Return the last atom in the atom hash, which has the atom serial number as the key.
    getLastAtomObj(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return ic.atoms[0];
        }

        let  atomKeys = Object.keys(atomsHash);
        let  lastIndex = atomKeys[atomKeys.length - 1];

        return ic.atoms[lastIndex];
    }

    //Return the residue hash from the atom hash. The residue hash has the resid as the key and 1 as the value.
    getResiduesFromAtoms(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        let  residuesHash = {}
        for(let i in atomsHash) {
            let  residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residuesHash[residueid] = 1;
        }

        return residuesHash;
    }

    getResiduesFromCalphaAtoms(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        let  residuesHash = {}
        for(let i in atomsHash) {
            if((ic.atoms[i].name == 'CA' && ic.proteins.hasOwnProperty(i)) || !ic.proteins.hasOwnProperty(i)) {
                let  residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residuesHash[residueid] = 1;
            }
        }

        return residuesHash;
    }

    //Return the chain hash from the atom hash. The chain hash has the chainid as the key and 1 as the value.
    getChainsFromAtoms(atomsHash) { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainsHash = {}
        for(let i in atomsHash) {
           let  atom = ic.atoms[i];
           let  chainid = atom.structure + "_" + atom.chain;

           chainsHash[chainid] = 1;
        }

        return chainsHash;
    }

    getAtomFromResi(resid, atomName) { let  ic = this.icn3d, me = ic.icn3dui;
        if(ic.residues.hasOwnProperty(resid)) {
            for(let i in ic.residues[resid]) {
                if(ic.atoms[i].name === atomName && !ic.atoms[i].het) {
                    return ic.atoms[i];
                }
            }
        }

        return undefined;
    }

    getAtomCoordFromResi(resid, atomName) { let  ic = this.icn3d, me = ic.icn3dui;
        let  atom = this.getAtomFromResi(resid, atomName);
        if(atom !== undefined) {
            let  coord = (atom.coord2 !== undefined) ? atom.coord2 : atom.coord;

            return coord;
        }

        return undefined;
    }
}

export {FirstAtomObj}
