/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class FirstAtomObj {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Return the first atom in the atom hash, which has the atom serial number as the key.
    getFirstAtomObj(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return undefined;
        }

        var atomKeys = Object.keys(atomsHash);
        var firstIndex = atomKeys[0];

        return ic.atoms[firstIndex];
    }

    getFirstCalphaAtomObj(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return undefined;
        }

        var firstIndex;

        for(var i in atomsHash) {
            if(ic.atoms[i].name == 'CA') {
                firstIndex = i;
                break;
            }
        }

        return (firstIndex !== undefined) ? ic.atoms[firstIndex] : this.getFirstAtomObj(atomsHash);
    }

    getFirstAtomObjByName(atomsHash, atomName) { var ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return ic.atoms[0];
        }

        var firstIndex;

        for(var i in atomsHash) {
            if(ic.atoms[i].name == atomName) {
                firstIndex = i;
                break;
            }
        }

        return (firstIndex !== undefined) ? ic.atoms[firstIndex] : undefined;
    }

    //Return the last atom in the atom hash, which has the atom serial number as the key.
    getLastAtomObj(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
            return ic.atoms[0];
        }

        var atomKeys = Object.keys(atomsHash);
        var lastIndex = atomKeys[atomKeys.length - 1];

        return ic.atoms[lastIndex];
    }

    //Return the residue hash from the atom hash. The residue hash has the resid as the key and 1 as the value.
    getResiduesFromAtoms(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        var residuesHash = {}
        for(var i in atomsHash) {
            var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residuesHash[residueid] = 1;
        }

        return residuesHash;
    }

    getResiduesFromCalphaAtoms(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        var residuesHash = {}
        for(var i in atomsHash) {
            if((ic.atoms[i].name == 'CA' && ic.proteins.hasOwnProperty(i)) || !ic.proteins.hasOwnProperty(i)) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residuesHash[residueid] = 1;
            }
        }

        return residuesHash;
    }

    //Return the chain hash from the atom hash. The chain hash has the chainid as the key and 1 as the value.
    getChainsFromAtoms(atomsHash) { var ic = this.icn3d, me = ic.icn3dui;
        var chainsHash = {}
        for(var i in atomsHash) {
           var atom = ic.atoms[i];
           var chainid = atom.structure + "_" + atom.chain;

           chainsHash[chainid] = 1;
        }

        return chainsHash;
    }

    getAtomFromResi(resid, atomName) { var ic = this.icn3d, me = ic.icn3dui;
        if(ic.residues.hasOwnProperty(resid)) {
            for(var i in ic.residues[resid]) {
                if(ic.atoms[i].name === atomName && !ic.atoms[i].het) {
                    return ic.atoms[i];
                }
            }
        }

        return undefined;
    }

    getAtomCoordFromResi(resid, atomName) { var ic = this.icn3d, me = ic.icn3dui;
        var atom = this.getAtomFromResi(resid, atomName);
        if(atom !== undefined) {
            var coord = (atom.coord2 !== undefined) ? atom.coord2 : atom.coord;

            return coord;
        }

        return undefined;
    }
}

export {FirstAtomObj}
