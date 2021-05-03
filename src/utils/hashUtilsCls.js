/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as $ from 'jquery';

class HashUtilsCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    //Clone the "fromHash" and return the cloned hash.
    cloneHash(from) { var me = this.icn3dui;
      var to = {};

      if(from === undefined) from = {};

      for(var i in from) {
        to[i] = from[i];
      }

      return to;
    }

    //Get the intersection of two hashes "atoms1" and "atoms2". The returned hash has atom index as key and 1 as value.
    intHash(atoms1, atoms2) { var me = this.icn3dui;
        var results = {};

        if(atoms1 === undefined) atoms1 = {};
        if(atoms2 === undefined) atoms2 = {};

        if(Object.keys(atoms1).length < Object.keys(atoms2).length) {
            for (var i in atoms1) {
                if (atoms2 !== undefined && atoms2[i]) {
                    results[i] = atoms1[i];
                }
            }
        }
        else {
            for (var i in atoms2) {
                if (atoms1 !== undefined && atoms1[i]) {
                    results[i] = atoms2[i];
                }
            }
        }

        return results;
    }

    // get atoms in allAtoms, but not in "atoms"
    //Get atoms in "includeAtoms", but not in "excludeAtoms". The returned hash has atom index as key and 1 as value.
    exclHash(includeAtomsInput, excludeAtoms) { var me = this.icn3dui;
        if(includeAtomsInput === undefined) includeAtomsInput = {};
        if(excludeAtoms === undefined) excludeAtoms = {};

        var includeAtoms = me.hashUtilsCls.cloneHash(includeAtomsInput);

        for (var i in includeAtoms) {
            if (excludeAtoms !== undefined && excludeAtoms[i]) {
                delete includeAtoms[i];
            }
        }

        return includeAtoms;
    }

    //Get the union of two hashes "atoms1" and "atoms2". The returned hash has atom index as key and 1 as value.
    unionHash(atoms1, atoms2) { var me = this.icn3dui;
        // much slower
        //return me.hashUtilsCls.unionHashNotInPlace(atoms1, atoms2);

        // much faster
        return me.hashUtilsCls.unionHashInPlace(atoms1, atoms2);
    }

    unionHashInPlace(atoms1, atoms2) { var me = this.icn3dui;
        if(atoms1 === undefined) atoms1 = {};
        if(atoms2 === undefined) atoms2 = {};

        $.extend(atoms1, atoms2);

        return atoms1;
    }

    unionHashNotInPlace(atoms1, atoms2) { var me = this.icn3dui;
        var results = $.extend({}, atoms1, atoms2);

        return results;
    }

    //Get the intersection of two hashes "atoms1" and "atoms2". The returned hash has atom index as key and atom object as value.
    intHash2Atoms(atoms1, atoms2, allAtoms) { var me = this.icn3dui;
        return me.hashUtilsCls.hash2Atoms(me.hashUtilsCls.intHash(atoms1, atoms2), allAtoms);
    }

    // get atoms in allAtoms, but not in "atoms"
    //Get atoms in "includeAtoms", but not in "excludeAtoms". The returned hash has atom index as key and atom object as value.
    exclHash2Atoms(includeAtoms, excludeAtoms, allAtoms) { var me = this.icn3dui;
        return me.hashUtilsCls.hash2Atoms(me.hashUtilsCls.exclHash(includeAtoms, excludeAtoms), allAtoms);
    }

    //Get the union of two hashes "atoms1" and "atoms2". The returned hash has atom index as key and atom object as value.
    unionHash2Atoms(atoms1, atoms2, allAtoms) { var me = this.icn3dui;
        return me.hashUtilsCls.hash2Atoms(me.hashUtilsCls.unionHash(atoms1, atoms2), allAtoms);
    }

    //The input "hash" has atom index as key and 1 as value. The returned hash has atom index as key and atom object as value.
    hash2Atoms(hash, allAtoms) { var me = this.icn3dui;
        var atoms = {};
        for(var i in hash) {
          atoms[i] = allAtoms[i];
        }

        return atoms;
    }

    hashvalue2array(hash) { var me = this.icn3dui;
        //return $.map(hash, function(v) { return v; });

        var array = [];
        for(var i in hash) {
            array.push(hash[i]);
        }

        return array;
    }
}

export {HashUtilsCls}
