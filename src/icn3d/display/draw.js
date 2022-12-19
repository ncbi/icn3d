/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Draw {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Draw the 3D structure. It rebuilds scene, applies previous color, applies the transformation, and renders the image.
    draw(bVrAr) { let ic = this.icn3d, me = ic.icn3dui;
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

        ic.impostorCls.clearImpostors();

        // show membranes
        if(ic.bOpm) {
            //if(window.dialog) window.dialog.dialog( "close" );
            
            let html = "<br><span style='color:red'>Red</span> and <span style='color:blue'>blue</span> membranes indicate <span style='color:red'>extracellular</span> and <span style='color:blue'>intracellular</span> membranes, respectively.<br><br>";
            $("#" + ic.pre + "dl_rmsd").html(html);
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

    handleController( controller, dt, selectPressed) { let ic = this.icn3d, me = ic.icn3dui;
        // modified from https://github.com/NikLever/Learn-WebXR/blob/master/complete/lecture3_7/app.js
        if ( selectPressed ){
/*            
            ic.workingMatrix.identity().extractRotation( controller.matrixWorld );

            ic.raycasterVR.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            ic.raycasterVR.ray.direction.set( 0, 0, - 1 ).applyMatrix4( ic.workingMatrix );

            const intersects = ic.raycasterVR.intersectObjects( ic.objects );

            if (intersects.length>0){
                intersects[0].object.add(ic.highlightVR);
                ic.highlightVR.visible = true;
            }else{
                ic.highlightVR.visible = false;
            }
*/            
            const speed = 5; //2;
            const quaternion = ic.dolly.quaternion.clone();
            //ic.dolly.quaternion.copy(ic.dummyCam.getWorldQuaternion());
            ic.dummyCam.getWorldQuaternion(ic.dolly.quaternion);
            ic.dolly.translateZ(-dt * speed);
            //ic.dolly.position.y = 0; // limit to a plane
            ic.dolly.quaternion.copy(quaternion); 
                    
        }
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

        ic.renderer.setPixelRatio( window.devicePixelRatio ); // r71

        if(ic.bVr) {
            let dt = 0.04; // ic.clock.getDelta();

            if (ic.controllers){
                // let result = this.getThumbStickMove();
                // let y = result.y * -1;
                // let pressed = result.pressed;

                for(let i = 0, il = ic.controllers.length; i < il; ++i) {
                    let controller = ic.controllers[i];
                    dt = (i % 2 == 0) ? dt : -dt; // dt * y; 
                    thisClass.handleController( controller, dt, controller.userData.selectPressed );
                    //thisClass.handleController( controller, dt, pressed );
                }
            }
        }
        else if(ic.bAr) {
            if ( ic.renderer.xr.isPresenting ){    
                ic.gestures.update();
            }
        }

        if(ic.scene) {
            ic.renderer.render(ic.scene, cam);
        }
    }

    getThumbStickMove() { let ic = this.icn3d, me = ic.icn3dui;
        let x = 0, y = 0;
        let btnPressed = false;

        if ( ic.renderer.xr.isPresenting ){
            const session = ic.renderer.xr.getSession();
            const inputSources = session.inputSources;
          
            if ( ic.getInputSources ){    
                //const info = [];
                
                inputSources.forEach( inputSource => {
                    const gp = inputSource.gamepad;
                    const axes = gp.axes;
                    const buttons = gp.buttons;
                    const mapping = gp.mapping;
                    ic.useStandard = (mapping == 'xr-standard');
                    const gamepad = { axes, buttons, mapping };
                    const handedness = inputSource.handedness;
                    const profiles = inputSource.profiles;
                    ic.gamepadType = "";
                    profiles.forEach( profile => {
                        if (profile.indexOf('touchpad')!=-1) ic.gamepadType = 'touchpad';
                        if (profile.indexOf('thumbstick')!=-1) ic.gamepadType = 'thumbstick';
                    });
                    const targetRayMode = inputSource.targetRayMode;
                    //info.push({ gamepad, handedness, profiles, targetRayMode });
                });
                 
                ic.getInputSources = false;
            }else if (ic.useStandard && ic.gamepadType != ""){
                inputSources.forEach( inputSource => {
                    const gp = inputSource.gamepad;
                    const thumbstick = (ic.gamepadType=='thumbstick');
                    //{"trigger":{"button":0},"touchpad":{"button":2,"xAxis":0,"yAxis":1}},
                    //"squeeze":{"button":1},"thumbstick":{"button":3,"xAxis":2,"yAxis":3},"button":{"button":6}}}
                    const xaxisOffset = (thumbstick) ? 2 : 0;
                    const btnIndex = (thumbstick) ? 3 : 2;
                    btnPressed = gp.buttons[btnIndex].pressed;
                    // if ( inputSource.handedness == 'right') {
                    // } else if ( inputSource.handedness == 'left') {
                    // }

                    //https://beej.us/blog/data/javascript-gamepad/
                    // x,y-axis values are between -1 and 1
                    x = gp.axes[xaxisOffset];
                    y = gp.axes[xaxisOffset + 1]; 
                })
            }
        }

        return {'y': y, 'pressed': btnPressed};
    }
}

export {Draw}

