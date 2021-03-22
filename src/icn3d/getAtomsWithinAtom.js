/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getAtomsWithinAtom = function(atomlist, atomlistTarget, distance, bGetPairs, bInteraction, bInternal) { var me = this, ic = me.icn3d; "use strict";
    var neighbors = this.getNeighboringAtoms(atomlist, atomlistTarget, distance);
    if(bGetPairs) me.resid2Residhash = {};

    //var maxDistSq = (radius + distance) * (radius + distance);
    var maxDistSq = distance * distance;

    var ret = {};
    for(var i in atomlistTarget) {
        //var oriAtom = atomlistTarget[i];
        var oriAtom = me.atoms[i];
        //var radius = this.vdwRadii[oriAtom.elem.toUpperCase()] || this.defaultRadius;
        // The distance between atoms does not include the radius
        var radius = 0;

        var oriCalpha = undefined, oriResidName = undefined;
        var oriResid = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;
        for(var serial in me.residues[oriResid]) {
            if((me.atoms[serial].name === 'CA' && me.atoms[serial].elem === 'C') || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                oriCalpha = me.atoms[serial];
                break;
            }
        }

        if(oriCalpha === undefined) oriCalpha = oriAtom;

        if(bGetPairs) {
            oriResidName = oriAtom.resn + ' $' + oriAtom.structure + '.' + oriAtom.chain + ':' + oriAtom.resi;
            if(me.resid2Residhash[oriResidName] === undefined) me.resid2Residhash[oriResidName] = {};
        }

        var chain_resi = oriAtom.structure + '_' + oriAtom.chain + '_' + oriAtom.resi;

        for (var j in neighbors) {
           var atom = neighbors[j];

           if(!me.crossstrucinter && oriAtom.structure != atom.structure) continue;

           // exclude the target atoms
           if(atom.serial in atomlistTarget) continue;
           if(this.bOpm && atom.resn === 'DUM') continue;

           //var atomDistSq = (atom.coord.x - oriAtom.coord.x) * (atom.coord.x - oriAtom.coord.x) + (atom.coord.y - oriAtom.coord.y) * (atom.coord.y - oriAtom.coord.y) + (atom.coord.z - oriAtom.coord.z) * (atom.coord.z - oriAtom.coord.z);
           var atomDist = atom.coord.distanceTo(oriAtom.coord);

           //if(atomDistSq < maxDistSq) {
           if(atomDist < distance) {
                ret[atom.serial] = atom;
                var calpha = undefined, residName = undefined;
                if(bInteraction) {
                    ret[oriAtom.serial] = oriAtom;
                }

                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                for(var serial in me.residues[resid]) {
                    if( (me.atoms[serial].name === 'CA' && me.atoms[serial].elem === 'C') || me.atoms[serial].name === "O3'" || me.atoms[serial].name === "O3*") {
                        calpha = me.atoms[serial];
                        break;
                    }
                }

                if(calpha === undefined) calpha = atom;

                    // output contact lines
                if(bInteraction) {
                    this.contactpnts.push({'serial': calpha.serial, 'coord': calpha.coord});
                    this.contactpnts.push({'serial': oriCalpha.serial, 'coord': oriCalpha.coord});
                }

                if(bGetPairs) {
    var chain_resi2 = atom.structure + '_' + atom.chain + '_' + atom.resi;

    residName = atom.resn + ' $' + atom.structure + '.' + atom.chain + ':' + atom.resi;
    //var dist = Math.sqrt(atomDistSq).toFixed(1);
    var dist1 = atomDist.toFixed(1);
    var dist2 = calpha.coord.distanceTo(oriCalpha.coord).toFixed(1);

    var resids = chain_resi + '_' + oriAtom.resn + ',' + chain_resi2 + '_' + atom.resn;
    var residNames = oriResidName + ',' + residName;
    if(me.resids2interAll[resids] === undefined
        || me.resids2interAll[resids]['contact'] === undefined
        || !me.resids2interAll[resids]['contact'].hasOwnProperty(residNames)
        || (me.resids2interAll[resids]['hbond'] !== undefined && !me.resids2interAll[resids]['hbond'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['ionic'] !== undefined && !me.resids2interAll[resids]['ionic'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['halogen'] !== undefined && !me.resids2interAll[resids]['halogen'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['pi-cation'] !== undefined && !me.resids2interAll[resids]['pi-cation'].hasOwnProperty(residNames))
        || (me.resids2interAll[resids]['pi-stacking'] !== undefined && !me.resids2interAll[resids]['pi-stacking'].hasOwnProperty(residNames))
        ) {
          if(me.resid2Residhash[oriResidName][residName] === undefined || dist1 < me.resid2Residhash[oriResidName][residName].split('_')[0]) {
              var cnt = (me.resid2Residhash[oriResidName][residName] === undefined) ? 1 : parseInt(me.resid2Residhash[oriResidName][residName].split('_')[4]) + 1;
              me.resid2Residhash[oriResidName][residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;

              if(!bInternal) {
                  if(me.resids2inter[resids] === undefined) me.resids2inter[resids] = {};
                  if(me.resids2inter[resids]['contact'] === undefined) me.resids2inter[resids]['contact'] = {};
                  me.resids2inter[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
              }

              if(me.resids2interAll[resids] === undefined) me.resids2interAll[resids] = {};
              if(me.resids2interAll[resids]['contact'] === undefined) me.resids2interAll[resids]['contact'] = {};
              me.resids2interAll[resids]['contact'][oriResidName + ',' + residName] = dist1 + '_' + dist2 + '_' + oriAtom.name + '_' + atom.name + '_' + cnt;
          }
    }
                } // if(bGetPairs) {
           }
        } // inner for
    } // outer for

    return ret;
 };
 
