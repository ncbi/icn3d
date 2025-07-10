/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import * as THREE from 'three';
import {TrackballControls} from "../../thirdparty/three/TrackballControls.js";
import {OrthographicTrackballControls} from "../../thirdparty/three/OrthographicTrackballControls.js";

class Camera {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Set the camera according to the size of the structure.
    setCamera() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bControlGl && !me.bNode) {
            window.cam = ic.cams[ic.opts.camera.toLowerCase()];

            let maxD = ic.maxD;

            // if(window.cam === ic.perspectiveCamera) {
            if(ic.opts.camera.toLowerCase() == 'perspective') {
                let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;
                //var factor = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ? 1 : 2;
                //var factor = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ? 1 : 3;
                if(bInstance) {
                    window.camMaxDFactor = 1;
                }
                else if(window.camMaxDFactorFog !== undefined) {
                    window.camMaxDFactor = window.camMaxDFactorFog; // 3
                }
                else {
                    window.camMaxDFactor = 3; //2;
                }

                if(window.cam_z > 0) {
                    window.cam.position.z = maxD * window.camMaxDFactor; // for perspective, the z position should be large enough to see the whole molecule
                }
                else {
                    window.cam.position.z = -maxD * window.camMaxDFactor; // for perspective, the z position should be large enough to see the whole molecule
                }

                // if(ic.opts['slab'] === 'yes') {
                //     if(bInstance) {
                //         window.cam.near = 0.1;
                //     }
                //     else if(window.camMaxDFactorFog !== undefined) {
                //         window.cam.near = maxD * window.camMaxDFactorFog - 10; // keep some surrounding residues
                //     }
                //     else {
                //         window.cam.near = maxD * window.camMaxDFactor;
                //     }
                // }
                // else {
                    window.cam.near = 0.1;
                // }
                window.cam.far = 10000;

                if(ic.bControlGl && !me.bNode) {
                    window.controls = new TrackballControls( window.cam, undefined, ic );
                }
                else {
                    if(!me.bNode) {
                        ic.controls = new TrackballControls( ic.cam, document.getElementById(ic.id), ic );
                    }
                    else {
                        ic.controls = new TrackballControls( ic.cam, document, ic );
                    }
                }
            }
            // else if (window.cam === ic.orthographicCamera){
            else if(ic.opts.camera.toLowerCase() == 'orthographic') {
                if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) {
                    window.cam.right = ic.maxD/2 * 1.5;
                }
                else {
                    window.cam.right = ic.maxD/2 * 2.5;
                }

                window.cam.left = -window.cam.right;
                window.cam.top = window.cam.right /ic.container.whratio;
                window.cam.bottom = -window.cam.right /ic.container.whratio;

                //   if(ic.opts['slab'] === 'yes') {
                //       window.cam.near = ic.maxD * 2;
                //   }
                //   else {
                    window.cam.near = 0;
                //   }

                  window.cam.far = 10000;

                if(ic.bControlGl && !me.bNode) {
                    window.controls = new OrthographicTrackballControls( window.cam, undefined, ic );
                }
                else {
                    if(!me.bNode) {
                        ic.controls = new OrthographicTrackballControls( ic.cam, document.getElementById(ic.id), ic );
                    }
                    else {
                        ic.controls = new OrthographicTrackballControls( ic.cam, document, ic );
                    }
                }
            }

            window.cam.updateProjectionMatrix();
        }
    //    else {
            // also set its own camera for picking purpose

            ic.cam = ic.cams[ic.opts.camera.toLowerCase()];

            let maxD = ic.maxD;

            // if(ic.cam === ic.perspectiveCamera) {
            if(ic.opts.camera.toLowerCase() == 'perspective') {
                let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;
                //var factor = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ? 1 : 2;
                //var factor = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ? 1 : 3;
                if(bInstance) {
                    ic.camMaxDFactor = 1;
                }
                else if(ic.camMaxDFactorFog !== undefined) {
                    ic.camMaxDFactor = ic.camMaxDFactorFog; // 3
                }
                else {
                    ic.camMaxDFactor = 3; //2;
                }

                if(ic.cam_z > 0) {
                    ic.cam.position.z = maxD * ic.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
                }
                else {
                    ic.cam.position.z = -maxD * ic.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
                }

                // if(ic.opts['slab'] === 'yes') {
                //     if(bInstance) {
                //         ic.cam.near = 0.1;
                //     }
                //     else if(ic.camMaxDFactorFog !== undefined) {
                //         ic.cam.near = maxD * ic.camMaxDFactorFog - 10; // keep some surrounding residues
                //     }
                //     else {
                //         ic.cam.near = maxD * ic.camMaxDFactor;
                //     }
                // }
                // else {
                    ic.cam.near = 0.1;
                // }
                ic.cam.far = 10000;

                if(ic.bControlGl && !me.bNode) {
                    window.controls = new TrackballControls( ic.cam, undefined, ic );
                }
                else {
                    if(!me.bNode) {
                        ic.controls = new TrackballControls( ic.cam, document.getElementById(ic.id), ic );
                    }
                    else {
                        ic.controls = new TrackballControls( ic.cam, document, ic );
                    }
                }
            }
            // else if (ic.cam === ic.orthographicCamera){
            else if(ic.opts.camera.toLowerCase() == 'orthographic') {
                if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) {
                    ic.cam.right = ic.maxD/2 * 1.5;
                }
                else {
                    ic.cam.right = ic.maxD/2 * 2.5;
                }

                ic.cam.left = -ic.cam.right;
                ic.cam.top = ic.cam.right /ic.container.whratio;
                ic.cam.bottom = -ic.cam.right /ic.container.whratio;

                //   if(ic.opts['slab'] === 'yes') {
                //       ic.cam.near = ic.maxD * 2;
                //   }
                //   else {
                    ic.cam.near = 0;
                //   }

                  ic.cam.far = 10000;

                if(ic.bControlGl && !me.bNode) {
                    window.controls = new OrthographicTrackballControls( ic.cam, undefined, ic );
                }
                else {
                    if(!me.bNode) {
                        ic.controls = new OrthographicTrackballControls( ic.cam, document.getElementById(ic.id), ic );
                    }
                    else {
                        ic.controls = new OrthographicTrackballControls( ic.cam, document, ic );
                    }
                }
            }

            // ic.cam.add(ic.directionalLight);

            ic.cam.updateProjectionMatrix();
    //    }
    }

    setSlab() { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.bControlGl && !me.bNode) {
            let maxD = ic.maxD;

            // if(window.cam === ic.perspectiveCamera) {
            if(ic.opts.camera.toLowerCase() == 'perspective') {
                let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;

                if(ic.opts['slab'] === 'yes') {
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
            }
            // else if (window.cam === ic.orthographicCamera){
            else if(ic.opts.camera.toLowerCase() == 'orthographic') {
                  if(ic.opts['slab'] === 'yes') {
                      window.cam.near = ic.maxD * 2;
                  }
                  else {
                    window.cam.near = 0;
                  }

                  window.cam.far = 10000;
            }

            window.cam.updateProjectionMatrix();
        }
    //    else {
            // also set its own camera for picking purpose

            let maxD = ic.maxD;

            // if(ic.cam === ic.perspectiveCamera) {
            if(ic.opts.camera.toLowerCase() == 'perspective') {
                let bInstance = (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > ic.maxatomcnt) ? true : false;

                if(ic.opts['slab'] === 'yes') {
                    if(bInstance) {
                        ic.cam.near = 0.1;
                    }
                    else if(ic.camMaxDFactorFog !== undefined) {
                        ic.cam.near = maxD * ic.camMaxDFactorFog - 10; // keep some surrounding residues
                    }
                    else {
                        ic.cam.near = maxD * ic.camMaxDFactor;
                    }
                }
                else {
                    ic.cam.near = 0.1;
                }
            }
            // else if (ic.cam === ic.orthographicCamera){
            else if(ic.opts.camera.toLowerCase() == 'orthographic') {
                  if(ic.opts['slab'] === 'yes') {
                      ic.cam.near = ic.maxD * 2;
                  }
                  else {
                    ic.cam.near = 0;
                  }

                  ic.cam.far = 10000;
            }

            // ic.cam.add(ic.directionalLight);

            ic.cam.updateProjectionMatrix();
    //    }
    }
}

export {Camera}
