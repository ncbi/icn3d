/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 // from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getExtent = function(atomlist) { var me = this, ic = me.icn3d; "use strict";
    var xmin, ymin, zmin;
    var xmax, ymax, zmax;
    var xsum, ysum, zsum, cnt;

    xmin = ymin = zmin = 9999;
    xmax = ymax = zmax = -9999;
    xsum = ysum = zsum = cnt = 0;
    var i;
    for (i in atomlist) {
       //var atom = atomlist[i];
       var atom = me.atoms[i];
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
 };
