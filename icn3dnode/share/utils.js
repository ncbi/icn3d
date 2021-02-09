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

let residueName2Abbr = function(residueName) {
  let pos = residueName.indexOf(' ');
  if(pos > 0) {
      residueName = residueName.substr(0, pos);
  }

  switch(residueName) {
    case '  A':
      return 'A';
      break;
    case '  C':
      return 'C';
      break;
    case '  G':
      return 'G';
      break;
    case '  T':
      return 'T';
      break;
    case '  U':
      return 'U';
      break;
    case '  I':
      return 'I';
      break;
    case ' DA':
      return 'A';
      break;
    case ' DC':
      return 'C';
      break;
    case ' DG':
      return 'G';
      break;
    case ' DT':
      return 'T';
      break;
    case ' DU':
      return 'U';
      break;
    case ' DI':
      return 'I';
      break;
    case 'DA':
      return 'A';
      break;
    case 'DC':
      return 'C';
      break;
    case 'DG':
      return 'G';
      break;
    case 'DT':
      return 'T';
      break;
    case 'DU':
      return 'U';
      break;
    case 'DI':
      return 'I';
      break;
    case 'ALA':
      return 'A';
      break;
    case 'ARG':
      return 'R';
      break;
    case 'ASN':
      return 'N';
      break;
    case 'ASP':
      return 'D';
      break;
    case 'CYS':
      return 'C';
      break;
    case 'GLU':
      return 'E';
      break;
    case 'GLN':
      return 'Q';
      break;
    case 'GLY':
      return 'G';
      break;
    case 'HIS':
      return 'H';
      break;
    case 'ILE':
      return 'I';
      break;
    case 'LEU':
      return 'L';
      break;
    case 'LYS':
      return 'K';
      break;
    case 'MET':
      return 'M';
      break;
    case 'PHE':
      return 'F';
      break;
    case 'PRO':
      return 'P';
      break;
    case 'SER':
      return 'S';
      break;
    case 'THR':
      return 'T';
      break;
    case 'TRP':
      return 'W';
      break;
    case 'TYR':
      return 'Y';
      break;
    case 'VAL':
      return 'V';
      break;
    case 'SEC':
      return 'U';
      break;
//        case 'PYL':
//          return 'O';
//          break;

    case 'HOH':
      return 'O';
      break;
    case 'WAT':
      return 'O';
      break;

    default:
      return residueName.trim();
  }
}

exports.intHash = intHash;
exports.exclHash = exclHash;
exports.unionHash = unionHash;
exports.cloneHash = cloneHash;
exports.distance = distance;
exports.getFirstAtomObj = getFirstAtomObj;
exports.dumpError = dumpError;
exports.residueName2Abbr = residueName2Abbr;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
