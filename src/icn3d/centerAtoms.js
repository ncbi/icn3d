/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.centerAtoms = function(atoms) { var me = this, ic = me.icn3d; "use strict";
    var pmin = new THREE.Vector3( 9999, 9999, 9999);
    var pmax = new THREE.Vector3(-9999,-9999,-9999);
    var psum = new THREE.Vector3();
    var cnt = 0;

    for (var i in atoms) {
        var atom = this.atoms[i];
        var coord = atom.coord;
        psum.add(coord);
        pmin.min(coord);
        pmax.max(coord);
        ++cnt;
    }

    var maxD = pmax.distanceTo(pmin);

    return {"center": psum.multiplyScalar(1.0 / cnt), "maxD": maxD, "pmin": pmin, "pmax": pmax};
};
