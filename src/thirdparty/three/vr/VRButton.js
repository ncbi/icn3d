//https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_cubes.html

class VRButton {
    constructor(icn3d) {
        this.icn3d = icn3d;

        //static xrSessionIsGranted = false;
        this.xrSessionIsGranted = false;
    }

    //static createButton( renderer, options ) {
    createButton( renderer, options ) { let ic = this.icn3d, me = ic.icn3dui;

        if ( options ) {

            console.error( 'THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.' );

        }

        const button = document.createElement( 'button' );

        function showEnterVR( /*device*/ ) {

            let currentSession = null;

            async function onSessionStarted( session ) {

                session.addEventListener( 'end', onSessionEnded );

                await renderer.xr.setSession( session );
                button.textContent = 'EXIT VR';

                currentSession = session;

            }

            function onSessionEnded( /*event*/ ) {
                // reset orientation after VR
                ic.transformCls.resetOrientation();
                
                ic.bVr = false;
                //ic.mdl.scale.copy(new THREE.Vector3( 1, 1, 1 )); 

                ic.drawCls.draw();

                currentSession.removeEventListener( 'end', onSessionEnded );

                button.textContent = 'ENTER VR';

                currentSession = null;

            }

            //

            button.style.display = '';

            button.style.cursor = 'pointer';
            //button.style.left = 'calc(50% - 50px)';
            button.style.left = 'calc(33% - 50px)';
            button.style.width = '100px';

            button.textContent = 'ENTER VR';

            button.onmouseenter = function () {

                button.style.opacity = '1.0';

            };

            button.onmouseleave = function () {

                button.style.opacity = '0.8'; //'0.5';

            };

            button.onclick = function () {       
                // imposter didn't work well in VR
                ic.bImpo = false;
                //ic.bInstanced = false;
                
                ic.bVr = true;
                //ic.mdl.scale.copy(ic.mdl.scale.multiplyScalar(0.2));

                ic.drawCls.draw(ic.bVr);

                if ( currentSession === null ) {

                    // WebXR's requestReferenceSpace only works if the corresponding feature
                    // was requested at session creation time. For simplicity, just ask for
                    // the interesting ones as optional features, but be aware that the
                    // requestReferenceSpace call will fail if it turns out to be unavailable.
                    // ('local' is always available for immersive sessions and doesn't need to
                    // be requested separately.)

                    const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking', 'layers' ] };
                    navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

                } else {

                    currentSession.end();

                }

            };

        }

        function disableButton() {

            button.style.display = '';

            button.style.cursor = 'auto';
            button.style.left = 'calc(33% - 75px)'; //'calc(50% - 75px)';
            button.style.width = '150px';

            button.onmouseenter = null;
            button.onmouseleave = null;

            button.onclick = null;

        }

        function showWebXRNotFound() {

            disableButton();

            //button.textContent = 'VR NOT SUPPORTED';
            button.style.display = 'none';

        }

        function showVRNotAllowed( exception ) {

            disableButton();

            console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

            //button.textContent = 'VR NOT ALLOWED';
            button.style.display = 'none';

        }

        function stylizeElement( element ) {

            element.style.position = 'absolute';
            element.style.bottom = '20px';
            element.style.padding = '12px 6px';
            element.style.border = '1px solid #fff';
            element.style.borderRadius = '4px';
            element.style.background = '#000'; //'rgba(0,0,0,0.5)';
            element.style.color = '#f8b84e'; //'#1c94c4'; //'#fff';
            element.style.font = 'bold 13px sans-serif';
            element.style.textAlign = 'center';
            element.style.opacity = '0.8';
            element.style.outline = 'none';
            element.style.zIndex = '999';

        }

        let thisClass = this;

        if ( 'xr' in navigator ) {

            button.id = me.pre + 'VRButton'; //'VRButton';
            button.style.display = 'none';

            stylizeElement( button );

            navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

                supported ? showEnterVR() : showWebXRNotFound();
                
                //if ( supported && VRButton.xrSessionIsGranted ) {
                if ( supported && thisClass.xrSessionIsGranted ) {

                    button.click();

                }

            } ).catch( showVRNotAllowed );

            return button;

        } else {
            const message = document.createElement( 'span' );
            return message;
        }

        this.registerSessionGrantedListener();

    }

    //static xrSessionIsGranted = false;

    //static registerSessionGrantedListener() {
    registerSessionGrantedListener() {

        if ( 'xr' in navigator ) {

            navigator.xr.addEventListener( 'sessiongranted', () => {

                //VRButton.xrSessionIsGranted = true;
                this.xrSessionIsGranted = true;

            } );

        }

    }

}

//VRButton.registerSessionGrantedListener();

export { VRButton };
