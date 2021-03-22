/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.createSingleLine = function ( src, dst, colorHex, dashed, dashSize ) { var me = this, ic = me.icn3d; "use strict";
    var geom = new THREE.Geometry();
    var mat;

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: dashSize, gapSize: 0.5*dashSize });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src );
    geom.vertices.push( dst );
    if(dashed) geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    //var axis = new THREE.Line( geom, mat, THREE.LineSegments );
    var axis = new THREE.LineSegments( geom, mat );

    return axis;
};
