// https://www.geeksforgeeks.org/how-to-share-code-between-node-js-and-the-browser/
// https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports) {
//  'use strict';
let utils = require('./utils.js');

let pickCustomSphere = function (atoms, residues, radius, atomlistTarget, otherAtoms, bInteraction, bGetPairs, resids2inter, resids2interAll) {
        let result = getAtomsWithinAtom(atoms, residues, otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction,undefined, resids2inter, resids2interAll);

        //{"atoms": ret, "resid2Residhash": resid2Residhash, "resids2interAll": resids2interAll, "resids2inter": resids2inter};
        let resid2Residhash = result.resid2Residhash;

        var residHash = {};
        for (let i in result.atoms) {
            let atom = atoms[i];
            if(atom.resn === 'DUM') continue;
            let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residHash[resid] = 1;
        }

        return {"residHash": residHash, "resid2Residhash": resid2Residhash};
};

function getAtomsWithinAtom(atoms, residues, atomlist, atomlistTarget, distance, bGetPairs, bInteraction, bInternal, resids2inter, resids2interAll) {
    let neighbors = getNeighboringAtoms(atoms, atomlist, atomlistTarget, distance);

    let resid2Residhash = {};

    let crossstrucinter = false;

    //let maxDistSq = (radius + distance) * (radius + distance);
    let maxDistSq = distance * distance;

    let ret = {};
    for(let i in atomlistTarget) {
        let oriAtom = atoms[i];

        // The distance between atoms does not include the radius
        let radius = 0;

        let oriCalpha = undefined, oriResidName = undefined;
        let oriResid = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;
        for(let serial in residues[oriResid]) {
            if((atoms[serial].name === 'CA' && atoms[serial].elem === 'C') || atoms[serial].name === "O3'" || atoms[serial].name === "O3*") {
                oriCalpha = atoms[serial];
                break;
            }
        }

        if(oriCalpha === undefined) oriCalpha = oriAtom;

        if(bGetPairs) {
            oriResidName = oriAtom.resn + ' $' + oriAtom.structure + '.' + oriAtom.chain + ':' + oriAtom.resi;
            if(resid2Residhash[oriResidName] === undefined) resid2Residhash[oriResidName] = {};
        }

        let chain_resi = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;

        for(let j in neighbors) {
           let atom = neighbors[j];

           if(!crossstrucinter && oriAtom.structure != atom.structure) continue;

           // exclude the target atoms
           if(atom.serial in atomlistTarget) continue;
           if(atom.resn === 'DUM') continue;

           //let atomDist = atom.coord.distanceTo(oriAtom.coord);
           let atomDist = utils.distance(atom.coord, oriAtom.coord);

           if(atomDist < distance) {
                ret[atom.serial] = atom;
                let calpha = undefined, residName = undefined;
                if(bInteraction) {
                    ret[oriAtom.serial] = oriAtom;
                }

                let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                for(let serial in residues[resid]) {
                    if( (atoms[serial].name === 'CA' && atoms[serial].elem === 'C') || atoms[serial].name === "O3'" || atoms[serial].name === "O3*") {
                        calpha = atoms[serial];
                        break;
                    }
                }

                if(calpha === undefined) calpha = atom;

                // output contact lines
                if(bInteraction) {
//                    this.contactpnts.push({'serial': calpha.serial, 'coord': calpha.coord});
//                    this.contactpnts.push({'serial': oriCalpha.serial, 'coord': oriCalpha.coord});
                }

                if(bGetPairs) {
    let chain_resi2 = atom.structure + '_' + atom.chain + '_' + atom.resi;

    residName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi;
    let dist1 = atomDist.toFixed(1);
    let dist2 = calpha.coord.distanceTo(oriCalpha.coord).toFixed(1);

    let resids = chain_resi + '_' + oriAtom.resn + ',' + chain_resi2 + '_' + atom.resn;
    let residNames = oriResidName + ',' + residName;
    if(resids2interAll[resids] === undefined
        || resids2interAll[resids]['contact'] === undefined
        || !resids2interAll[resids]['contact'].hasOwnProperty(residNames)
        || (resids2interAll[resids]['hbond'] !== undefined && !resids2interAll[resids]['hbond'].hasOwnProperty(residNames))
        || (resids2interAll[resids]['ionic'] !== undefined && !resids2interAll[resids]['ionic'].hasOwnProperty(residNames))
        || (resids2interAll[resids]['halogen'] !== undefined && !resids2interAll[resids]['halogen'].hasOwnProperty(residNames))
        || (resids2interAll[resids]['pi-cation'] !== undefined && !resids2interAll[resids]['pi-cation'].hasOwnProperty(residNames))
        || (resids2interAll[resids]['pi-stacking'] !== undefined && !resids2interAll[resids]['pi-stacking'].hasOwnProperty(residNames))
        ) {
          if(resid2Residhash[oriResidName][residName] === undefined || dist1 < resid2Residhash[oriResidName][residName].split('_')[0]) {
              let cnt = (resid2Residhash[oriResidName][residName] === undefined) ? 1 : parseInt(resid2Residhash[oriResidName][residName].split('_')[4]) + 1;
              resid2Residhash[oriResidName][residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;

              if(!bInternal) {
                  if(resids2inter[resids] === undefined) resids2inter[resids] = {};
                  if(resids2inter[resids]['contact'] === undefined) resids2inter[resids]['contact'] = {};
                  resids2inter[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
              }

              if(resids2interAll[resids] === undefined) resids2interAll[resids] = {};
              if(resids2interAll[resids]['contact'] === undefined) resids2interAll[resids]['contact'] = {};
              resids2interAll[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
          }
    }
                } // if(bGetPairs) {
           }
        } // inner for
    } // outer for

    return {"atoms": ret, "resid2Residhash": resid2Residhash, "resids2interAll": resids2interAll, "resids2inter": resids2inter};
}

function getNeighboringAtoms(atoms, atomlist, atomlistTarget, distance) {
    let extent = getExtent(atoms, atomlistTarget);

    let targetRadiusSq1 = (extent[2][0] - extent[0][0]) * (extent[2][0] - extent[0][0]) + (extent[2][1] - extent[0][1]) * (extent[2][1] - extent[0][1]) + (extent[2][2] - extent[0][2]) * (extent[2][2] - extent[0][2]);
    let targetRadiusSq2 = (extent[2][0] - extent[1][0]) * (extent[2][0] - extent[1][0]) + (extent[2][1] - extent[1][1]) * (extent[2][1] - extent[1][1]) + (extent[2][2] - extent[1][2]) * (extent[2][2] - extent[1][2]);
    let targetRadiusSq = (targetRadiusSq1 > targetRadiusSq2) ? targetRadiusSq1 : targetRadiusSq2;
    let targetRadius = Math.sqrt(targetRadiusSq);

    let maxDistSq = (targetRadius + distance) * (targetRadius + distance);

    let neighbors = {};
    for(let i in atomlist) {
       let atom = atoms[i];

       // exclude the target atoms
       if(atomlistTarget.hasOwnProperty(atom.serial)) continue;

       //if(this.bOpm && atom.resn === 'DUM') continue;
       if(atom.resn === 'DUM') continue;

       if (atom.coord.x < extent[0][0] - distance || atom.coord.x > extent[1][0] + distance) continue;
       if (atom.coord.y < extent[0][1] - distance || atom.coord.y > extent[1][1] + distance) continue;
       if (atom.coord.z < extent[0][2] - distance || atom.coord.z > extent[1][2] + distance) continue;

       let atomDistSq = (atom.coord.x - extent[2][0]) * (atom.coord.x - extent[2][0]) + (atom.coord.y - extent[2][1]) * (atom.coord.y - extent[2][1]) + (atom.coord.z - extent[2][2]) * (atom.coord.z - extent[2][2]);

       if(atomDistSq < maxDistSq) {
           neighbors[atom.serial] = atom;
       }
    }

    return neighbors;
}

function getExtent(atoms, atomlist) {
    let xmin= 9999, ymin= 9999, zmin= 9999;
    let xmax= -9999, ymax= -9999, zmax= -9999;
    let xsum= 0, ysum= 0, zsum= 0, cnt= 0;

    for(let i in atomlist) {
       let atom = atoms[i];
       cnt++;
       xsum += atom.coord.x; ysum += atom.coord.y; zsum += atom.coord.z;

       xmin = (xmin < atom.coord.x) ? xmin : atom.coord.x;
       ymin = (ymin < atom.coord.y) ? ymin : atom.coord.y;
       zmin = (zmin < atom.coord.z) ? zmin : atom.coord.z;
       xmax = (xmax > atom.coord.x) ? xmax : atom.coord.x;
       ymax = (ymax > atom.coord.y) ? ymax : atom.coord.y;
       zmax = (zmax > atom.coord.z) ? zmax : atom.coord.z;
    }

    return [[xmin, ymin, zmin], [xmax, ymax, zmax], [xsum / cnt, ysum / cnt, zsum / cnt]];
}

exports.pickCustomSphere = pickCustomSphere;

})(typeof exports === 'undefined'? this : exports); //this['share']={}: exports);
