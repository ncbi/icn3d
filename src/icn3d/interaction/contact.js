/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Contact {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

     // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
     //This function returns atoms within a certain "distance" (in angstrom) from the "targetAtoms".
     //The returned atoms are stored in a hash with atom indices as keys and 1 as values.
     //Only those atoms in "allAtoms" are considered.
     getAtomsWithinAtom(atomlist, atomlistTarget, distance, bGetPairs, bInteraction, bInternal, bIncludeTarget) { let ic = this.icn3d, me = ic.icn3dui;
        let neighbors = this.getNeighboringAtoms(atomlist, atomlistTarget, distance, bIncludeTarget);
        if(bGetPairs) ic.resid2Residhash = {};

        //var maxDistSq = (radius + distance) * (radius + distance);
        let maxDistSq = distance * distance;

        let ret = {};
        for(let i in atomlistTarget) {
            //var oriAtom = atomlistTarget[i];
            let oriAtom = ic.atoms[i];
            //var radius = me.parasCls.vdwRadii[oriAtom.elem.toUpperCase()] || ic.defaultRadius;
            // The distance between atoms does not include the radius
            let radius = 0;

            let oriCalpha = undefined, oriResidName = undefined;
            let oriResid = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;
            for(let serial in ic.residues[oriResid]) {
                if((ic.atoms[serial].name === 'CA' && ic.atoms[serial].elem === 'C') || ic.atoms[serial].name === "O3'" || ic.atoms[serial].name === "O3*") {
                    oriCalpha = ic.atoms[serial];
                    break;
                }
            }

            if(oriCalpha === undefined) oriCalpha = oriAtom;

            if(bGetPairs) {
                oriResidName = oriAtom.resn + ' $' + oriAtom.structure + '.' + oriAtom.chain + ':' + oriAtom.resi;
                if(ic.resid2Residhash[oriResidName] === undefined) ic.resid2Residhash[oriResidName] = {};
            }

            let chain_resi = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;

            for (let j in neighbors) {
               let atom = neighbors[j];

               if(!ic.crossstrucinter && oriAtom.structure != atom.structure) continue;

               // exclude the target atoms
               if(!bIncludeTarget && atom.serial in atomlistTarget) continue;
               if(ic.bOpm && atom.resn === 'DUM') continue;

               //var atomDistSq = (atom.coord.x - oriAtom.coord.x) * (atom.coord.x - oriAtom.coord.x) + (atom.coord.y - oriAtom.coord.y) * (atom.coord.y - oriAtom.coord.y) + (atom.coord.z - oriAtom.coord.z) * (atom.coord.z - oriAtom.coord.z);
               let atomDist = atom.coord.distanceTo(oriAtom.coord);

               //if(atomDistSq < maxDistSq) {
               if(atomDist < distance) {
                    ret[atom.serial] = atom;
                    let calpha = undefined, residName = undefined;
                    if(bInteraction) {
                        ret[oriAtom.serial] = oriAtom;
                    }

                    let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                    for(let serial in ic.residues[resid]) {
                        if( (ic.atoms[serial].name === 'CA' && ic.atoms[serial].elem === 'C') || ic.atoms[serial].name === "O3'" || ic.atoms[serial].name === "O3*") {
                            calpha = ic.atoms[serial];
                            break;
                        }
                    }

                    if(calpha === undefined) calpha = atom;

                        // output contact lines
                    if(bInteraction) {
                        ic.contactpnts.push({'serial': calpha.serial, 'coord': calpha.coord});
                        ic.contactpnts.push({'serial': oriCalpha.serial, 'coord': oriCalpha.coord});
                    }

                    if(bGetPairs) {
        let chain_resi2 = atom.structure + '_' + atom.chain + '_' + atom.resi;

        residName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi;
        //var dist = Math.sqrt(atomDistSq).toFixed(1);
        let dist1 = atomDist.toFixed(1);
        let dist2 = calpha.coord.distanceTo(oriCalpha.coord).toFixed(1);

        let resids = chain_resi + '_' + oriAtom.resn + ',' + chain_resi2 + '_' + atom.resn;
        let residNames = oriResidName + ',' + residName;
        if(ic.resids2interAll[resids] === undefined
            || ic.resids2interAll[resids]['contact'] === undefined
            || !ic.resids2interAll[resids]['contact'].hasOwnProperty(residNames)
            || (ic.resids2interAll[resids]['hbond'] !== undefined && !ic.resids2interAll[resids]['hbond'].hasOwnProperty(residNames))
            || (ic.resids2interAll[resids]['ionic'] !== undefined && !ic.resids2interAll[resids]['ionic'].hasOwnProperty(residNames))
            || (ic.resids2interAll[resids]['halogen'] !== undefined && !ic.resids2interAll[resids]['halogen'].hasOwnProperty(residNames))
            || (ic.resids2interAll[resids]['pi-cation'] !== undefined && !ic.resids2interAll[resids]['pi-cation'].hasOwnProperty(residNames))
            || (ic.resids2interAll[resids]['pi-stacking'] !== undefined && !ic.resids2interAll[resids]['pi-stacking'].hasOwnProperty(residNames))
            ) {
              if(ic.resid2Residhash[oriResidName][residName] === undefined || dist1 < ic.resid2Residhash[oriResidName][residName].split('_')[0]) {
                  let cnt = (ic.resid2Residhash[oriResidName][residName] === undefined) ? 1 : parseInt(ic.resid2Residhash[oriResidName][residName].split('_')[4]) + 1;
                  ic.resid2Residhash[oriResidName][residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;

                  if(!bInternal) {
                      if(ic.resids2inter[resids] === undefined) ic.resids2inter[resids] = {};
                      if(ic.resids2inter[resids]['contact'] === undefined) ic.resids2inter[resids]['contact'] = {};
                      ic.resids2inter[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
                  }

                  if(ic.resids2interAll[resids] === undefined) ic.resids2interAll[resids] = {};
                  if(ic.resids2interAll[resids]['contact'] === undefined) ic.resids2interAll[resids]['contact'] = {};
                  ic.resids2interAll[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
              }
        }
                    } // if(bGetPairs) {
               }
            } // inner for
        } // outer for

        return ret;
     }

     getNeighboringAtoms(atomlist, atomlistTarget, distance, bIncludeTarget) { let ic = this.icn3d, me = ic.icn3dui;
        let extent = this.getExtent(atomlistTarget);

        let targetRadiusSq1 = (extent[2][0] - extent[0][0]) * (extent[2][0] - extent[0][0]) + (extent[2][1] - extent[0][1]) * (extent[2][1] - extent[0][1]) + (extent[2][2] - extent[0][2]) * (extent[2][2] - extent[0][2]);
        let targetRadiusSq2 = (extent[2][0] - extent[1][0]) * (extent[2][0] - extent[1][0]) + (extent[2][1] - extent[1][1]) * (extent[2][1] - extent[1][1]) + (extent[2][2] - extent[1][2]) * (extent[2][2] - extent[1][2]);
        let targetRadiusSq = (targetRadiusSq1 > targetRadiusSq2) ? targetRadiusSq1 : targetRadiusSq2;
        let targetRadius = Math.sqrt(targetRadiusSq);

        let maxDistSq = (targetRadius + distance) * (targetRadius + distance);

        let neighbors = {};
        for (let i in atomlist) {
           //var atom = atomlist[i];
           let atom = ic.atoms[i];

           // exclude the target atoms
           if(!bIncludeTarget && atomlistTarget.hasOwnProperty(atom.serial)) continue;

           if(this.bOpm && atom.resn === 'DUM') continue;

           if (atom.coord.x < extent[0][0] - distance || atom.coord.x > extent[1][0] + distance) continue;
           if (atom.coord.y < extent[0][1] - distance || atom.coord.y > extent[1][1] + distance) continue;
           if (atom.coord.z < extent[0][2] - distance || atom.coord.z > extent[1][2] + distance) continue;

           // only show protein or DNA/RNA
           //if(atom.serial in this.proteins || atom.serial in this.nucleotides) {
               let atomDistSq = (atom.coord.x - extent[2][0]) * (atom.coord.x - extent[2][0]) + (atom.coord.y - extent[2][1]) * (atom.coord.y - extent[2][1]) + (atom.coord.z - extent[2][2]) * (atom.coord.z - extent[2][2]);

               if(atomDistSq < maxDistSq) {
                   neighbors[atom.serial] = atom;
               }
           //}
        }

        return neighbors;
     }

     // from iview (http://istar.cse.cuhk.edu.hk/iview/)
     //For a list of atoms, return an array containing three coordinates: minimum x- y- z- values,
     //maximum x- y- z- values, and average x- y- z- values.
     getExtent(atomlist) { let ic = this.icn3d, me = ic.icn3dui;
        let xmin, ymin, zmin;
        let xmax, ymax, zmax;
        let xsum, ysum, zsum, cnt;

        xmin = ymin = zmin = 9999;
        xmax = ymax = zmax = -9999;
        xsum = ysum = zsum = cnt = 0;
        let i;
        for (i in atomlist) {
           //var atom = atomlist[i];
           let atom = ic.atoms[i];
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

    hideContact() { let ic = this.icn3d, me = ic.icn3dui;
        ic.opts["contact"] = "no";
        if(ic.lines === undefined) ic.lines = { }
        ic.lines['contact'] = [];
        ic.contactpnts = [];

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

export {Contact}