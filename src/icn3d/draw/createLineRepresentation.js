/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createLineRepresentation = function (atoms, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    var geo = new THREE.Geometry();
    this.createRepresentationSub(atoms, undefined, function (atom0, atom1) {
        if (atom0.color === atom1.color) {
            geo.vertices.push(atom0.coord);
            geo.vertices.push(atom1.coord);
            geo.colors.push(atom0.color);
            geo.colors.push(atom1.color);
        } else {
            var mp = atom0.coord.clone().add(atom1.coord).multiplyScalar(0.5);
            geo.vertices.push(atom0.coord);
            geo.vertices.push(mp);
            geo.vertices.push(atom1.coord);
            geo.vertices.push(mp);
            geo.colors.push(atom0.color);
            geo.colors.push(atom0.color);
            geo.colors.push(atom1.color);
            geo.colors.push(atom1.color);
        }
    });

    if(bHighlight !== 2) {
        var line;
        if(bHighlight === 1) {
            // highlight didn't work for lines
            //line = new THREE.Mesh(geo, this.matShader);
        }
        else {
            //line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: this.linewidth, vertexColors: true }), THREE.LineSegments);
            line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ linewidth: this.linewidth, vertexColors: true }));
            this.mdl.add(line);
        }

        if(bHighlight === 1) {
            this.prevHighlightObjects.push(line);
        }
        else {
            this.objects.push(line);
        }
    }
    else if(bHighlight === 2) {
        this.createBoxRepresentation_P_CA(atoms, 0.8, bHighlight);
    }
};
