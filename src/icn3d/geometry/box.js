/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {ReprSub} from '../geometry/reprSub.js';

class Box {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Create a cube for "atom" with the "defaultRadius". "forceDefault" means to use the default radius.
    //"scale" means scale on the radius. "color" means the color of the cube. "bHighlight" is an option
    //to draw the highlight for the atom.
    createBox(atom, defaultRadius, forceDefault, scale, color, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if(defaultRadius === undefined) defaultRadius = 0.8;
        if(forceDefault === undefined) forceDefault = false;
        if(scale === undefined) scale = 0.8;

        if(bHighlight) {
            if(color === undefined) color = ic.hColor;
        }
        else {
            if(color === undefined) color = atom.color;
        }

        let radius = forceDefault ? defaultRadius
          : (me.parasCls.vdwRadii[atom.elem.toUpperCase()] || defaultRadius) * (scale ? scale : 1);

        this.createBox_base(atom.coord, radius, color, bHighlight);
    }

    createBox_base(coord, radius, color, bHighlight, bOther, bGlycan) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let mesh;

        let boxGeometry = new THREE.BoxGeometry(1, 1, 1);

        if(bHighlight || bGlycan) {
          mesh = new THREE.Mesh(ic.boxGeometry, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5,
              specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
        }
        else {
          mesh = new THREE.Mesh(ic.boxGeometry, new THREE.MeshPhongMaterial({
              specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));
        }

        mesh.scale.x = mesh.scale.y = mesh.scale.z = radius;

        mesh.position.copy(coord);
        ic.mdl.add(mesh);

        if(bHighlight) {
            ic.prevHighlightObjects.push(mesh);
        }
        else if(bOther) {
            ic.prevOtherMesh.push(mesh);
        }
        else {
            ic.objects.push(mesh);
        }
    }

    createBoxRepresentation_P_CA(atoms, scale, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let thisClass = this;
        ic.reprSubCls.createRepresentationSub(atoms, function (atom0) {
            if(atom0.name === 'CA' || atom0.name === "O3'" || atom0.name === "O3*") {
                thisClass.createBox(atom0, undefined, undefined, scale, undefined, bHighlight);
            }
        });
    }

}

export {Box}
