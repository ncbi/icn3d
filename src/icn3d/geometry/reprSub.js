/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ReprSub {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createRepresentationSub(atoms, f0, f01) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        //var clbondArray = [];
        let resiAtoms = {};
        for (let i in atoms) {
            let atom0 = atoms[i];
            f0 && f0(atom0);

            for (let j in atom0.bonds) {
                let atom1 = this.icn3d.atoms[atom0.bonds[j]];
                if (atom1 === undefined || atom1.serial < atom0.serial) continue;
                if (atom1.chain === atom0.chain && ((atom1.resi === atom0.resi)
                  || (atom0.name === 'C' && atom1.name === 'N') || (atom0.name === 'O3\'' && atom1.name === 'P')
                  || (atom0.name === 'O3*' && atom1.name === 'P') || (atom0.name === 'SG' && atom1.name === 'SG'))) {
                    f01 && f01(atom0, atom1);
                } else {
                    //clbondArray.push([atom0.coord, atom1.coord]);
                }
            }
        }
    }
}

export {ReprSub}
