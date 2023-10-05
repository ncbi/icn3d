/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 class Draw {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Draw the 3D structure. It rebuilds scene, applies previous color, applies the transformation, and renders the image.
    draw(bVrAr) { let ic = this.icn3d, me = ic.icn3dui;
        ic.impostorCls.clearImpostors();
        
        if(ic.bRender && (!ic.hAtoms || Object.keys(ic.hAtoms) == 0)) ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

        ic.sceneCls.rebuildScene();

        // Impostor display using the saved arrays
        if(ic.bImpo) {
            ic.impostorCls.drawImpostorShader(); // target
        }

        ic.setColorCls.applyPrevColor();

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {        
            if(ic.bAssembly && Object.keys(ic.structures).length == 1 && ((me.cfg.mmdbid === undefined && me.cfg.bu == 1)
              || (me.cfg.mmdbid !== undefined && me.cfg.bu == 1 && Object.keys(ic.atoms).length * ic.biomtMatrices.length > ic.maxatomcnt)) ) {
                ic.instancingCls.drawSymmetryMates();
            }
            else {
                let bNoOrientation = true;
                ic.applyCenterCls.centerSelection(undefined, bNoOrientation);
            }
        }

        // show the hAtoms
        let hAtomsLen = (ic.hAtoms !== undefined) ? Object.keys(ic.hAtoms).length : 0;

        if(hAtomsLen > 0 && hAtomsLen < Object.keys(ic.dAtoms).length) {
            ic.hlObjectsCls.removeHlObjects();
            if(ic.bShowHighlight === undefined || ic.bShowHighlight) ic.hlObjectsCls.addHlObjects();
        }

        if(ic.bRender === true) {
          if(ic.bInitial || $("#" + ic.pre + "wait").is(":visible")) {
              if($("#" + ic.pre + "wait")) $("#" + ic.pre + "wait").hide();
              if($("#" + ic.pre + "canvas")) $("#" + ic.pre + "canvas").show();
              if($("#" + ic.pre + "cmdlog")) $("#" + ic.pre + "cmdlog").show();
          }

          this.applyTransformation(ic._zoomFactor, ic.mouseChange, ic.quaternion);
          this.render(bVrAr);
        }

        //ic.impostorCls.clearImpostors();

        // show membranes
        if(ic.bOpm && !me.cfg.chainalign) {
            //if(window.dialog && window.dialog.hasClass('ui-dialog-content')) window.dialog.dialog( "close" );
            
            let html = me.utilsCls.getMemDesc();
            $("#" + ic.pre + "dl_rmsd_html").html(html);
            if(!me.cfg.bSidebyside) me.htmlCls.dialogCls.openDlg('dl_rmsd', 'Membranes');
        }
    }

    //Update the rotation, translation, and zooming before rendering. Typically used before the function render().
    applyTransformation(_zoomFactor, mouseChange, quaternion) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return;

        let para = {};
        para.update = false;

        // zoom
        para._zoomFactor = _zoomFactor;

        // translate
        para.mouseChange = new THREE.Vector2();
        para.mouseChange.copy(mouseChange);

        // rotation
        para.quaternion = new THREE.Quaternion();
        para.quaternion.copy(quaternion);

        if(ic.bControlGl && !me.bNode) {
            window.controls.update(para);
        }
        else {
            ic.controls.update(para);
        }      
    }

    //Render the scene and objects into pixels.
    render(bVrAr) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;
        // setAnimationLoop is required for VR
        if(bVrAr) {
            ic.renderer.setAnimationLoop( function() {
                thisClass.render_base();
            });
        }
        else {
            thisClass.render_base();
        }
    }

    handleController( controller, dt, selectPressed, squeezePressed, xArray, yArray) { let ic = this.icn3d, me = ic.icn3dui;
    try {
        // modified from https://github.com/NikLever/Learn-WebXR/blob/master/complete/lecture3_7/app.js

        // thumbstick move
        let yMax = 0;
        if(yArray) {
            if(yArray[0] != 0 && yArray[1] != 0) {
                yMax = yArray[0]; // right
            }
            else if(yArray[0] != 0) {
                yMax = yArray[0]; 
            }
            else if(yArray[1] != 0) {
                yMax = yArray[1]; 
            }
        }
        if(yMax === undefined) yMax = 0;

        // selection only work when squeeze (menu) is not pressed
        if(selectPressed && !squeezePressed) {
            let dtAdjusted = yMax / 1000.0 * dt; 
            
            const speed = 5; //2;
            if(yMax != 0) {
                //if(ic.dolly && ic.dolly.quaternion && ic.dummyCam) {
                    ic.uistr += "dolly"
                    const quaternion = ic.dolly.quaternion.clone();
                    ic.dummyCam.getWorldQuaternion(ic.dolly.quaternion);
                    ic.dolly.translateZ(dtAdjusted * speed);
                    //ic.dolly.position.y = 0; // limit to a plane
                    ic.dolly.quaternion.copy(quaternion); 
                //}
            }
            else { //if(yMax == 0) {
                controller.children[0].scale.z = 10;
                ic.workingMatrix.identity().extractRotation( controller.matrixWorld );

                ic.raycasterVR.ray.origin.setFromMatrixPosition( controller.matrixWorld );
                ic.raycasterVR.ray.direction.set( 0, 0, - 1 ).applyMatrix4( ic.workingMatrix );

                const intersects = ic.raycasterVR.intersectObjects( ic.objects );

                if (intersects.length>0){
                    controller.children[0].scale.z = intersects[0].distance; // stop on the object

                    intersects[ 0 ].point.sub(ic.mdl.position); // mdl.position was moved to the original (0,0,0) after reading the molecule coordinates. The raycasting was done based on the original. The position of the original should be substracted.

                    let threshold = ic.rayThreshold; //0.5;
                
                    let atom = ic.rayCls.getAtomsFromPosition(intersects[ 0 ].point, threshold); // the second parameter is the distance threshold. The first matched atom will be returned. Use 1 angstrom, not 2 angstrom. If it's 2 angstrom, other atom will be returned.

                    while(!atom && threshold < 10) {
                        threshold = threshold + 0.5;
                        atom = ic.rayCls.getAtomsFromPosition(intersects[ 0 ].point, threshold);
                    }

                    if(atom) {
                        if(ic.pAtomNum % 2 === 0) {
                            ic.pAtom = atom;
                        }
                        else {
                            ic.pAtom2 = atom;
                        }

                        ++ic.pAtomNum;

                        //ic.pickingCls.showPicking(atom);

                        this.showPickingVr(ic.pk, atom);

                        //ic.canvasUILog.updateElement( "info", atom.structure + '_' + atom.chain + '_' + atom.resi);
                    }      
                } 
            }
        }
    }
    catch(err) {
        //ic.canvasUILog.updateElement( "info", "ERROR: " + err );
    }  
    }

    showPickingVr(pk, atom) { let ic = this.icn3d, me = ic.icn3dui;
        if(!pk) pk = 2; // residues

        ic.hAtoms = ic.pickingCls.getPickedAtomList(pk, atom);

        if(pk === 2) {
            ic.residueLabelsCls.addResidueLabels(ic.hAtoms, undefined, undefined, true);
        }
        else if(pk === 1) {
            ic.residueLabelsCls.addAtomLabels(ic.hAtoms);
        }

        ic.setOptionCls.setStyle("proteins", atom.style);
    }

    //Render the scene and objects into pixels.
    render_base() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        if(me.bNode) return;

        let cam = (ic.bControlGl && !me.bNode) ? window.cam : ic.cam;

        if(ic.directionalLight) {
            let quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors( new THREE.Vector3(0, 0, ic.cam_z).normalize(), cam.position.clone().normalize() );

            ic.directionalLight.position.copy(ic.lightPos.clone().applyQuaternion( quaternion ).normalize());
            ic.directionalLight2.position.copy(ic.lightPos2.clone().applyQuaternion( quaternion ).normalize());
            ic.directionalLight3.position.copy(ic.lightPos3.clone().applyQuaternion( quaternion ).normalize());
        }

        if(!ic.bVr) ic.renderer.setPixelRatio( window.devicePixelRatio ); // r71

        if(ic.bVr) {
            let dt = 0.04; // ic.clock.getDelta();

            if (ic.controllers){
                let result = this.updateGamepadState();

                for(let i = 0, il = ic.controllers.length; i < il; ++i) {
                    let controller = ic.controllers[i];
                    if(!controller) continue;
                    
                    dt = (i % 2 == 0) ? dt : -dt; // dt * y; 
                    thisClass.handleController( controller, dt, controller.userData.selectPressed, controller.userData.squeezePressed, result.xArray, result.yArray );
                }
            }

            if ( ic.renderer.xr.isPresenting){    
                if(ic.canvasUI) ic.canvasUI.update();
                if(ic.canvasUILog) ic.canvasUILog.update();
            }
        }
        else if(ic.bAr) {
            if ( ic.renderer.xr.isPresenting ){    
                ic.gestures.update();
                if(ic.canvasUILog) ic.canvasUILog.update();
            }
        }

        if(ic.scene) {
            // https://github.com/gkjohnson/three-gpu-pathtracer/blob/main/example/basic.js
            ic.renderer.outputEncoding = THREE.sRGBEncoding;
            //ic.renderer.outputEncoding = THREE.LinearEncoding

            ic.renderer.render(ic.scene, cam);
        }
    }

    updateGamepadState() { let ic = this.icn3d, me = ic.icn3dui;
        let xAxisIndex = (ic.xAxisIndex) ? ic.xAxisIndex : 2;
        let yAxisIndex = (ic.yAxisIndex) ? ic.yAxisIndex : 3;
        //https://github.com/NikLever/Learn-WebXR/blob/master/complete/lecture5_3/app.js     
        // "trigger":{"button":0},
        // "squeeze":{"button":1},
        // "thumbstick":{"button":3,"xAxis":2,"yAxis":3},   "touchpad":{"button":2,"xAxis":0,"yAxis":1},
        //======= left => right =========
        // "x_button":{"button":4},     "a_button":{"button":4}
        // "y_button":{"button":5},     "b_button":{"button":5}
        // "thumbrest":{"button":6}
        if ( ic.renderer.xr.isPresenting ){
            const session = ic.renderer.xr.getSession();
            const inputSources = session.inputSources;
                
            const info = [];

            let xArray = [], yArray = [];
            inputSources.forEach( inputSource => {
                const gp = inputSource.gamepad;
                const axes = gp.axes;

                let x = parseInt(1000 * axes[xAxisIndex]); // -1000 => 1000
                let y = parseInt(-1000 * axes[yAxisIndex]); // -1000 => 1000

                xArray.push(x);
                yArray.push(y);
            });

            return {xArray: xArray, yArray: yArray};
        }
        else {
            return {xArray: [0, 0], yArray: [0, 0]};
        }
    }
}

export {Draw}

