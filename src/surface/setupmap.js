/*! setupsurface.js from SurfaceWorker.js
 * @author David Koes  / https://github.com/3dmol/3Dmol.js/tree/master/3Dmol
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

$3Dmol.SetupMap = function (data) {
    var ps = new $3Dmol.Electronmap();
    ps.initparm(data.header, data.data, data.matrix);

    ps.fillvoxels(data.allatoms, data.extendedAtoms);

    ps.buildboundary();

    ps.marchingcube();

    ps.vpBits = null; // uint8 array of bitmasks
    //ps.vpDistance = null; // floatarray of _squared_ distances
    ps.vpAtomID = null; // intarray
    ps.faces = null;
    ps.verts = null;

    return ps.getFacesAndVertices(data.atomsToShow);
};

