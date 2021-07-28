/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

class Brick {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    createBrick(p0, p1, radius, color) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 4, 1);

        let mesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshPhongMaterial(
            { specular: ic.frac, shininess: ic.shininess, emissive: ic.emissive, color: color }));

        mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
        mesh.matrixAutoUpdate = false;
        mesh.lookAt(p1.clone().sub(p0));
        mesh.updateMatrix();

        mesh.matrix.multiply(new THREE.Matrix4().makeScale(radius, radius,
          p0.distanceTo(p1))).multiply(new THREE.Matrix4().makeRotationX(Math.PI * 0.5));

        ic.mdl.add(mesh);
    }
}

export {Brick}
