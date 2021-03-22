/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.showGlycans = function () { var me = this, ic = me.icn3d; "use strict";
    var glycan2resids = {};
    //var atomHash = this.intHash(this.hAtoms, this.dAtoms);
    var atomHash = this.dAtoms;

    for(var i in atomHash) {
        var atom = this.atoms[i];
        if(atom.het && this.glycanHash.hasOwnProperty(atom.resn) != -1) {
            if(glycan2resids[atom.resn] === undefined) glycan2resids[atom.resn] = {};
            if(atom.chain != 'Misc') {
                glycan2resids[atom.resn][atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;
            }
        }
    }

    // two types of shape: cube,sphere
    // four types of color: this.glycanColors
    var glycanNames = Object.keys(glycan2resids);
    for(var i = 0, il = glycanNames.length; i < il; ++i) {
        var glycanName = glycanNames[i];
        if(!this.glycanHash.hasOwnProperty(glycanName)) continue;

        var shape = this.glycanHash[glycanName].s;
        var color = new THREE.Color('#' + this.glycanHash[glycanName].c);

        resiArray = Object.keys(glycan2resids[glycanName]);
        for(var j = 0, jl = resiArray.length; j < jl; ++j) {
            var result = this.centerAtoms(this.residues[resiArray[j]]);
            var center = result.center;
            var radius = result.maxD * 0.5 * 0.6;

            if(shape == 'cube') {
                this.createBox_base(center, radius, color, false, false, true);
            }
            else if(shape == 'sphere') {
                this.createSphereBase(center, color, radius, 1, false, true);
            }
            else if(shape == 'cone') {
                var dirZ = new THREE.Vector3( 0, 0, 1 );
                var arrowZ = this.createArrow( dirZ, new THREE.Vector3(0, 0, -1*radius).add(center), 0, color, 2*radius, 2*radius, true);
                this.mdl.add( arrowZ );
                this.objects.push(arrowZ);
            }
            else if(shape == 'cylinder') {
                var p0 = new THREE.Vector3(0, 0, radius).add(center);
                var p1 = new THREE.Vector3(0, 0, -1*radius).add(center);
                this.createCylinder(p0, p1, radius, color, false, color, false, true);
            }
        }
    }
};
