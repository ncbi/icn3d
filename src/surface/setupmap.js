/* setupsurface.js from SurfaceWorker.js
 * @author David Koes  / https://github.com/3dmol/3Dmol.js/tree/master/3Dmol
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

$3Dmol.SetupMap = function (data) {
    "use strict";

    var ps = new $3Dmol.ElectronMap();
    ps.initparm(data.header, data.data, data.matrix, data.isovalue, data.center, data.maxdist, data.pmin, data.pmax, data.water, data.type, data.rmsd_supr);

    ps.fillvoxels(data.allatoms, data.extendedAtoms);

    ps.buildboundary();

    ps.marchingcube();

    ps.vpBits = null; // uint8 array of bitmasks
    //ps.vpDistance = null; // floatarray of _squared_ distances
    ps.vpAtomID = null; // intarray

    var result = ps.getFacesAndVertices(data.allatoms, data.atomsToShow);

    ps.faces = null;
    ps.verts = null;

    return result;
};

