/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setFog = function(bZoomin) { var me = this, ic = me.icn3d; "use strict";
    var background = this.backgroundColors[this.opts.background.toLowerCase()];

    if(bZoomin) {
        var centerAtomsResults = this.centerAtoms(this.hAtoms);
        this.maxD = centerAtomsResults.maxD;
        if (this.maxD < 5) this.maxD = 5;
    }

    var bInstance = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > this.maxatomcnt) ? true : false;

    // apply fog
    if(this.opts['fog'] === 'yes') {
        if(this.opts['camera'] === 'perspective') {        //perspective, orthographic
            //this.scene.fog = new THREE.Fog(background, this.cam_z, this.cam_z + 0.5 * this.maxD);
            //this.scene.fog = new THREE.Fog(background, 2 * this.maxD, 2.5 * this.maxD);
            //this.scene.fog = new THREE.Fog(background, 1.5 * this.maxD, 3 * this.maxD);

            if(bInstance) {
                this.scene.fog = undefined;
                this.bSetFog = false;
            }
            else {
                this.scene.fog = new THREE.Fog(background, 2.5*this.maxD, 4*this.maxD);
                this.bSetFog = true;
                this.camMaxDFactorFog = 3;
            }
        }
        else if(this.opts['camera'] === 'orthographic') {
            //this.scene.fog = new THREE.FogExp2(background, 2);
            //this.scene.fog.near = 1.5 * this.maxD;
            //this.scene.fog.far = 3 * this.maxD;

            this.scene.fog = undefined;
            this.bSetFog = false;
        }
    }
    else {
        this.scene.fog = undefined;
        this.bSetFog = false;
    }

    if(bZoomin && !bInstance) {
        this.zoominSelection();
    }
};
