/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSphere = function (atom, defaultRadius, forceDefault, scale, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    if(defaultRadius === undefined) defaultRadius = 0.8;
    if(forceDefault === undefined) forceDefault = false;

    var radius = (this.vdwRadii[atom.elem.toUpperCase()] || defaultRadius);
    if(forceDefault) {
        radius = defaultRadius;
        scale = 1;
    }

    this.createSphereBase(atom.coord, atom.color, radius, scale, bHighlight);
};

iCn3D.prototype.createSphereBase = function (pos, color, radius, scale, bHighlight, bGlycan) { var me = this, ic = me.icn3d; "use strict";
    var mesh;

    //if(defaultRadius === undefined) defaultRadius = 0.8;
    //if(forceDefault === undefined) forceDefault = false;
    if(scale === undefined) scale = 1.0;

    //var radius = (this.vdwRadii[atom.elem.toUpperCase()] || defaultRadius);

    if(bHighlight === 2) {
      scale *= 1.5;

      color = this.hColor;

      mesh = new THREE.Mesh(this.sphereGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));

      mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
      mesh.position.copy(pos);
      this.mdl.add(mesh);
    }
    else if(bHighlight === 1) {
      mesh = new THREE.Mesh(this.sphereGeometry, this.matShader);

      mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
      mesh.position.copy(pos);
      mesh.renderOrder = this.renderOrderPicking;
      this.mdl.add(mesh);
    }
    else {
      if(color === undefined) {
          color = this.defaultAtomColor;
      }

      //var color = atom.color;
      if(bGlycan) {
          mesh = new THREE.Mesh(this.sphereGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
      }
      else {
          mesh = new THREE.Mesh(this.sphereGeometry, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, color: color }));
      }

      mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
      mesh.position.copy(pos);

      if(this.bImpo && !bGlycan) {
          this.posArraySphere.push(pos.x);
          this.posArraySphere.push(pos.y);
          this.posArraySphere.push(pos.z);

          this.colorArraySphere.push(color.r);
          this.colorArraySphere.push(color.g);
          this.colorArraySphere.push(color.b);

          var realRadius = radius * (scale ? scale : 1);
          this.radiusArraySphere.push(realRadius);

          if(this.cnt <= this.maxatomcnt) this.mdl_ghost.add(mesh);
      }
      else {
          this.mdl.add(mesh);
      }
    }

    if(bHighlight === 1 || bHighlight === 2) {
        if(this.bImpo) {
            if(this.cnt <= this.maxatomcnt) this.prevHighlightObjects_ghost.push(mesh);
        }
        else {
            this.prevHighlightObjects.push(mesh);
        }
    }
    else {
        if(this.bImpo) {
            if(this.cnt <= this.maxatomcnt) this.objects_ghost.push(mesh);
        }
        else {
            this.objects.push(mesh);
        }
    }
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createSphereRepresentation = function (atoms, defaultRadius, forceDefault, scale, bHighlight) { var me = this, ic = me.icn3d; "use strict";
    this.createRepresentationSub(atoms, function (atom0) {
        me.createSphere(atom0, defaultRadius, forceDefault, scale, bHighlight);
    });
};
