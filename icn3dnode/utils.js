// https://www.geeksforgeeks.org/how-to-share-code-between-node-js-and-the-browser/
// https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports) {
//  'use strict';

let cloneHash = function(from) {
  var to = {};
  for(var i in from) {
    to[i] = from[i];
  }

  return to;
};

let intHash = function(atoms1, atoms2) {
    var results = {};

    if(atoms1 && atoms2) {
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
    }

    return results;
};

// get atoms in allAtoms, but not in "atoms"
let exclHash = function(includeAtomsInput, excludeAtoms) {
    let includeAtoms = cloneHash(includeAtomsInput);
    for (var i in includeAtoms) {
        if (excludeAtoms !== undefined && excludeAtoms[i]) {
            delete includeAtoms[i];
        }
    }

    return includeAtoms;
};

let unionHash = function(atoms1, atoms2) {
    //return Object.assign({}, atoms1, atoms2);
    for(var i in atoms2) {
        atoms1[i] = atoms2[i];
    }

    return atoms1;
};

let distance= function(atoms1, atoms2) {
    let dx = atoms1.x - atoms2.x;
    let dy = atoms1.y - atoms2.y;
    let dz = atoms1.z - atoms2.z;

    return Math.sqrt(dx*dx + dy*dy + dz*dz);
};

let getFirstAtomObj = function(atoms, atomsHash) {
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return undefined;
    }

    var atomKeys = Object.keys(atomsHash);
    var firstIndex = atomKeys[0];

    return atoms[firstIndex];
};

let dumpError = function(err) {
  if (typeof err === 'object') {
    if (err.message) {
      console.log('\nMessage: ' + err.message)
    }
    if (err.stack) {
      console.log('\nStacktrace:')
      console.log('====================')
      console.log(err.stack);
    }
  } else {
    console.log('dumpError :: argument is not an object');
  }
}

exports.intHash = intHash;
exports.exclHash = exclHash;
exports.unionHash = unionHash;
exports.cloneHash = cloneHash;
exports.distance = distance;
exports.getFirstAtomObj = getFirstAtomObj;
exports.dumpError = dumpError;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
