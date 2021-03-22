/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setCamera = function() {
    if(this.bControlGl) {
        window.cam = this.cams[this.opts.camera.toLowerCase()];

        var maxD = this.maxD;

        if(window.cam === this.perspectiveCamera) {
            var bInstance = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > this.maxatomcnt) ? true : false;
            //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 2;
            //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 3;
            if(bInstance) {
                window.camMaxDFactor = 1;
            }
            else if(window.camMaxDFactorFog !== undefined) {
                window.camMaxDFactor = window.camMaxDFactorFog; // 3
            }
            else {
                window.camMaxDFactor = 2;
            }

            if(window.cam_z > 0) {
              window.cam.position.z = maxD * window.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
            }
            else {
              window.cam.position.z = -maxD * window.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
            }

            if(this.opts['slab'] === 'yes') {
                if(bInstance) {
                    window.cam.near = 0.1;
                }
                else if(window.camMaxDFactorFog !== undefined) {
                    window.cam.near = maxD * window.camMaxDFactorFog - 10; // keep some surrounding residues
                }
                else {
                    window.cam.near = maxD * window.camMaxDFactor;
                }
            }
            else {
                window.cam.near = 0.1;
            }
            window.cam.far = 10000;

            if(this.bControlGl) {
                window.controls = new THREE.TrackballControls( window.cam, undefined, undefined );
            }
            else {
                this.controls = new THREE.TrackballControls( this.cam, document.getElementById(this.id), this );
            }
        }
        else if (window.cam === this.orthographicCamera){
            if(this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) {
                window.cam.right = this.maxD/2 * 1.5;
            }
            else {
                window.cam.right = this.maxD/2 * 2.5;
            }

            window.cam.left = -window.cam.right;
            window.cam.top = window.cam.right /this.container.whratio;
            window.cam.bottom = -window.cam.right /this.container.whratio;

              if(this.opts['slab'] === 'yes') {
                  window.cam.near = this.maxD * 2;
              }
              else {
                window.cam.near = 0;
              }

              window.cam.far = 10000;

            if(this.bControlGl) {
                window.controls = new THREE.OrthographicTrackballControls( window.cam, undefined, undefined );
            }
            else {
                this.controls = new THREE.OrthographicTrackballControls( this.cam, document.getElementById(this.id), this );
            }
        }

        window.cam.updateProjectionMatrix();
    }
//    else {
        // also set its own camera for picking purpose

        this.cam = this.cams[this.opts.camera.toLowerCase()];

        var maxD = this.maxD;

        if(this.cam === this.perspectiveCamera) {
            var bInstance = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > this.maxatomcnt) ? true : false;
            //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 2;
            //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 3;
            if(bInstance) {
                this.camMaxDFactor = 1;
            }
            else if(this.camMaxDFactorFog !== undefined) {
                this.camMaxDFactor = this.camMaxDFactorFog; // 3
            }
            else {
                this.camMaxDFactor = 2;
            }

            if(this.cam_z > 0) {
              this.cam.position.z = maxD * this.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
            }
            else {
              this.cam.position.z = -maxD * this.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
            }

            if(this.opts['slab'] === 'yes') {
                if(bInstance) {
                    this.cam.near = 0.1;
                }
                else if(this.camMaxDFactorFog !== undefined) {
                    this.cam.near = maxD * this.camMaxDFactorFog - 10; // keep some surrounding residues
                }
                else {
                    this.cam.near = maxD * this.camMaxDFactor;
                }
            }
            else {
                this.cam.near = 0.1;
            }
            this.cam.far = 10000;

            if(this.bControlGl) {
                window.controls = new THREE.TrackballControls( this.cam, undefined, undefined );
            }
            else {
                this.controls = new THREE.TrackballControls( this.cam, document.getElementById(this.id), this );
            }
        }
        else if (this.cam === this.orthographicCamera){
            if(this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) {
                this.cam.right = this.maxD/2 * 1.5;
            }
            else {
                this.cam.right = this.maxD/2 * 2.5;
            }

            this.cam.left = -this.cam.right;
            this.cam.top = this.cam.right /this.container.whratio;
            this.cam.bottom = -this.cam.right /this.container.whratio;

              if(this.opts['slab'] === 'yes') {
                  this.cam.near = this.maxD * 2;
              }
              else {
                this.cam.near = 0;
              }

              this.cam.far = 10000;

            if(this.bControlGl) {
                window.controls = new THREE.OrthographicTrackballControls( this.cam, undefined, undefined );
            }
            else {
                this.controls = new THREE.OrthographicTrackballControls( this.cam, document.getElementById(this.id), this );
            }
        }

        this.cam.updateProjectionMatrix();
//    }
};
