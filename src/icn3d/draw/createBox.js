/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// used for highlight
iCn3D.prototype.createBox = function (atom, defaultRadius, forceDefault, scale, color, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    if(defaultRadius === undefined) defaultRadius = 0.8;
    if(forceDefault === undefined) forceDefault = false;
    if(scale === undefined) scale = 0.8;

    if(bHighlight) {
        if(color === undefined) color = this.hColor;
    }
    else {
        if(color === undefined) color = atom.color;
    }

    var radius = forceDefault ? defaultRadius : (this.vdwRadii[atom.elem.toUpperCase()] || defaultRadius) * (scale ? scale : 1);

    this.createBox_base(atom.coord, radius, color, bHighlight);
};

iCn3D.prototype.createBox_base = function (coord, radius, color, bHighlight, bOther, bGlycan) { var me = this, ic = me.icn3d; "use strict";
    var mesh;

    if(bHighlight || bGlycan) {
          mesh = new THREE.Mesh(this.boxGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
    }
    else {
          mesh = new THREE.Mesh(this.boxGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
    }

    mesh.scale.x = mesh.scale.y = mesh.scale.z = radius;

    mesh.position.copy(coord);
    this.mdl.add(mesh);

    if(bHighlight) {
        this.prevHighlightObjects.push(mesh);
    }
    else if(bOther) {
        this.prevOtherMesh.push(mesh);
    }
    else {
        this.objects.push(mesh);
    }
};

iCn3D.prototype.createBoxRepresentation_P_CA = function (atoms, scale, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    this.createRepresentationSub(atoms, function (atom0) {
        if(atom0.name === 'CA' || atom0.name === "O3'" || atom0.name === "O3*") {
            me.createBox(atom0, undefined, undefined, scale, undefined, bHighlight);
        }
    });
};
