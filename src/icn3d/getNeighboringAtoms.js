/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 iCn3D.prototype.getNeighboringAtoms = function(atomlist, atomlistTarget, distance) { var me = this, ic = me.icn3d; "use strict";
    var extent = this.getExtent(atomlistTarget);

    var targetRadiusSq1 = (extent[2][0] - extent[0][0]) * (extent[2][0] - extent[0][0]) + (extent[2][1] - extent[0][1]) * (extent[2][1] - extent[0][1]) + (extent[2][2] - extent[0][2]) * (extent[2][2] - extent[0][2]);
    var targetRadiusSq2 = (extent[2][0] - extent[1][0]) * (extent[2][0] - extent[1][0]) + (extent[2][1] - extent[1][1]) * (extent[2][1] - extent[1][1]) + (extent[2][2] - extent[1][2]) * (extent[2][2] - extent[1][2]);
    var targetRadiusSq = (targetRadiusSq1 > targetRadiusSq2) ? targetRadiusSq1 : targetRadiusSq2;
    var targetRadius = Math.sqrt(targetRadiusSq);

    var maxDistSq = (targetRadius + distance) * (targetRadius + distance);

    var neighbors = {};
    for (var i in atomlist) {
       //var atom = atomlist[i];
       var atom = me.atoms[i];

       // exclude the target atoms
       if(atomlistTarget.hasOwnProperty(atom.serial)) continue;

       if(this.bOpm && atom.resn === 'DUM') continue;

       if (atom.coord.x < extent[0][0] - distance || atom.coord.x > extent[1][0] + distance) continue;
       if (atom.coord.y < extent[0][1] - distance || atom.coord.y > extent[1][1] + distance) continue;
       if (atom.coord.z < extent[0][2] - distance || atom.coord.z > extent[1][2] + distance) continue;

       // only show protein or DNA/RNA
       //if(atom.serial in this.proteins || atom.serial in this.nucleotides) {
           var atomDistSq = (atom.coord.x - extent[2][0]) * (atom.coord.x - extent[2][0]) + (atom.coord.y - extent[2][1]) * (atom.coord.y - extent[2][1]) + (atom.coord.z - extent[2][2]) * (atom.coord.z - extent[2][2]);

           if(atomDistSq < maxDistSq) {
               neighbors[atom.serial] = atom;
           }
       //}
    }

    return neighbors;
 };
