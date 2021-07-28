/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {ReprSub} from '../geometry/reprSub.js';

class Sphere {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    createSphere(atom, defaultRadius, forceDefault, scale, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if(defaultRadius === undefined) defaultRadius = 0.8;
        if(forceDefault === undefined) forceDefault = false;

        let radius = (me.parasCls.vdwRadii[atom.elem.toUpperCase()] || defaultRadius);
        if(forceDefault) {
            radius = defaultRadius;
            scale = 1;
        }

        this.createSphereBase(atom.coord, atom.color, radius, scale, bHighlight);
    }

    createSphereBase(pos, color, radius, scale, bHighlight, bGlycan) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let mesh;

        if(scale === undefined) scale = 1.0;

        if(bHighlight === 2) {
          scale *= 1.5;

          color = ic.hColor;

          mesh = new THREE.Mesh(ic.sphereGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));

          mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
          mesh.position.copy(pos);
          ic.mdl.add(mesh);
        }
        else if(bHighlight === 1) {
          mesh = new THREE.Mesh(ic.sphereGeometry, ic.matShader);

          mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
          mesh.position.copy(pos);
          mesh.renderOrder = ic.renderOrderPicking;
          ic.mdl.add(mesh);
        }
        else {
          if(color === undefined) {
              color = me.parasCls.defaultAtomColor;
          }

          //var color = atom.color;
          if(bGlycan) {
              mesh = new THREE.Mesh(ic.sphereGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
          }
          else {
              mesh = new THREE.Mesh(ic.sphereGeometry, new THREE.MeshPhongMaterial({ specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
          }

          mesh.scale.x = mesh.scale.y = mesh.scale.z = radius * (scale ? scale : 1);
          mesh.position.copy(pos);

          if(ic.bImpo && !bGlycan) {
              ic.posArraySphere.push(pos.x);
              ic.posArraySphere.push(pos.y);
              ic.posArraySphere.push(pos.z);

              ic.colorArraySphere.push(color.r);
              ic.colorArraySphere.push(color.g);
              ic.colorArraySphere.push(color.b);

              let realRadius = radius * (scale ? scale : 1);
              ic.radiusArraySphere.push(realRadius);

              if(ic.cnt <= ic.maxatomcnt) ic.mdl_ghost.add(mesh);
          }
          else {
              ic.mdl.add(mesh);
          }
        }

        if(bHighlight === 1 || bHighlight === 2) {
            if(ic.bImpo) {
                if(ic.cnt <= ic.maxatomcnt) ic.prevHighlightObjects_ghost.push(mesh);
            }
            else {
                ic.prevHighlightObjects.push(mesh);
            }
        }
        else {
            if(ic.bImpo) {
                if(ic.cnt <= ic.maxatomcnt) ic.objects_ghost.push(mesh);
            }
            else {
                ic.objects.push(mesh);
            }
        }
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create spheres for "atoms" with the "radius". "forceDefault" means to use the default radius.
    //"scale" means scale on the radius. "bHighlight" is an option to draw the highlight for these atoms.
    //The highlight could be outlines with bHighlight=1 and 3D objects with bHighlight=2.
    createSphereRepresentation(atoms, defaultRadius, forceDefault, scale, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let thisClass = this;

        ic.reprSubCls.createRepresentationSub(atoms, function (atom0) {
            thisClass.createSphere(atom0, defaultRadius, forceDefault, scale, bHighlight);
        });
    }
}

export {Sphere}
