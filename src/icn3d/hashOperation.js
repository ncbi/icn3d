/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.cloneHash = function(from) { var me = this, ic = me.icn3d; "use strict";
  var to = {};
  for(var i in from) {
    to[i] = from[i];
  }

  return to;
};

iCn3D.prototype.intHash = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    var results = {};

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

//    atoms1 = {};
//    atoms2 = {};

    return results;
};

// get atoms in allAtoms, but not in "atoms"
iCn3D.prototype.exclHash = function(includeAtomsInput, excludeAtoms) { var me = this, ic = me.icn3d; "use strict";
    var includeAtoms = me.cloneHash(includeAtomsInput);

    for (var i in includeAtoms) {
        if (excludeAtoms !== undefined && excludeAtoms[i]) {
            delete includeAtoms[i];
        }
    }

    return includeAtoms;
};

iCn3D.prototype.unionHash = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    // much slower
    //return this.unionHashNotInPlace(atoms1, atoms2);

    // much faster
    return this.unionHashInPlace(atoms1, atoms2);
};

iCn3D.prototype.unionHashInPlace = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    if(atoms1 === undefined) atoms1 = {};
    if(atoms2 === undefined) atoms2 = {};

    jQuery.extend(atoms1, atoms2);

    return atoms1;
};

iCn3D.prototype.unionHashNotInPlace = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    var results = jQuery.extend({}, atoms1, atoms2);

    return results;
};

iCn3D.prototype.intHash2Atoms = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    return this.hash2Atoms(this.intHash(atoms1, atoms2));
};

// get atoms in allAtoms, but not in "atoms"
iCn3D.prototype.exclHash2Atoms = function(includeAtoms, excludeAtoms) { var me = this, ic = me.icn3d; "use strict";
    return this.hash2Atoms(this.exclHash(includeAtoms, excludeAtoms));
};

iCn3D.prototype.unionHash2Atoms = function(atoms1, atoms2) { var me = this, ic = me.icn3d; "use strict";
    return this.hash2Atoms(this.unionHash(atoms1, atoms2));
};

iCn3D.prototype.hash2Atoms = function(hash) { var me = this, ic = me.icn3d; "use strict";
    var atoms = {};
    for(var i in hash) {
      atoms[i] = this.atoms[i];
    }

    //hash = {};

    return atoms;
};
