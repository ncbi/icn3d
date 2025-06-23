//https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_cones.html
//https://github.com/NikLever/Learn-WebXR/blob/master/libs/ARButton.js

class ARButton {
    constructor(icn3d) {
        this.icn3d = icn3d;

        //static xrSessionIsGranted = false;
        this.xrSessionIsGranted = false;
    }

	//static createButton( renderer, sessionInit = {} ) {
	createButton( renderer, sessionInit = {} ) { let ic = this.icn3d, me = ic.icn3dui;

		const button = document.createElement( 'button' );

		function showStartAR( ) {

			if ( sessionInit.domOverlay === undefined ) {

				const overlay = document.createElement( 'div' );
				overlay.style.display = 'none';
				document.body.appendChild( overlay );

				const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttribute( 'width', 38 );
				svg.setAttribute( 'height', 38 );
				svg.style.position = 'absolute';
				svg.style.right = '20px';
				svg.style.top = '20px';
				svg.addEventListener( 'click', function () {

					currentSession.end();

				} );
				overlay.appendChild( svg );

				const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				path.setAttribute( 'd', 'M 12,12 L 28,28 M 28,12 12,28' );
				path.setAttribute( 'stroke', '#fff' );
				path.setAttribute( 'stroke-width', 2 );
				svg.appendChild( path );

				if ( sessionInit.optionalFeatures === undefined ) {

					sessionInit.optionalFeatures = [];

				}

				sessionInit.optionalFeatures.push( 'dom-overlay' );
				sessionInit.domOverlay = { root: overlay };

			}

			//

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				renderer.xr.setReferenceSpaceType( 'local' );

				await renderer.xr.setSession( session );

				button.textContent = 'STOP AR';
				sessionInit.domOverlay.root.style.display = '';

				currentSession = session;

			}

			function onSessionEnded( ) {
				// reset orientation after AR
				ic.transformCls.resetOrientation();

				ic.bAr = false;
				//ic.mdl.scale.copy(new THREE.Vector3( 1, 1, 1 ));

				ic.drawCls.draw();

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'START AR';
				sessionInit.domOverlay.root.style.display = 'none';

				currentSession = null;

			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			//button.style.left = 'calc(50% - 50px)';
			button.style.left = 'calc(66% - 50px)';
			button.style.width = '100px';

			button.textContent = 'START AR';

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.8'; //'0.5';

			};

			button.onclick = function () {
                // imposter didn't work well in AR
                ic.bImpo = false;

                // important to keet the background transparent
				ic.opts['background'] = 'transparent';
                
                ic.bAr = true;
				//ic.mdl.scale.copy(ic.mdl.scale.multiplyScalar(0.2));

				ic.drawCls.draw(ic.bAr);

				if ( currentSession === null ) {

					navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(66% - 50px)'; //'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showARNotSupported() {

			disableButton();

			//button.textContent = 'AR NOT SUPPORTED';
            button.style.display = 'none';

		}

        function showARAndroidPhone() {

			disableButton();

			//button.textContent = 'Chrome in Android Required';
            button.style.display = 'none';

		}

		function showARNotAllowed( exception ) {

			disableButton();

			console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

			//button.textContent = 'AR NOT ALLOWED';
            button.style.display = 'none';

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = '#000'; //'rgba(0,0,0,0.1)';
			element.style.color = '#f8b84e'; //'#fff';
			element.style.font = 'bold 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.8'; //'0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

        let thisClass = this;

		if(!me.utilsCls.isAndroid() || !me.utilsCls.isChrome()) {
            button.id = me.pre + 'ARButton'; //'ARButton';
			button.style.display = 'none';

			stylizeElement( button );

            showARAndroidPhone();

            return button;
        }
        else if ( 'xr' in navigator ) {

			button.id = me.pre + 'ARButton'; //'ARButton';
			button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-ar' ).then( function ( supported ) {

				supported ? showStartAR() : showARNotSupported();

			} ).catch( showARNotAllowed );

			return button;

		} else {
           
			// const message = document.createElement( 'a' );

			// if ( window.isSecureContext === false ) {

			// 	message.href = document.location.href.replace( /^http:/, 'https:' );
			// 	message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			// } else {

			// 	message.href = 'https://immersiveweb.dev/';
			// 	message.innerHTML = 'WEBXR NOT AVAILABLE';

			// }

			// message.style.left = 'calc(66% - 90px)'; //'calc(50% - 90px)';
			// message.style.width = '180px';
			// message.style.textDecoration = 'none';

			// stylizeElement( message );

			// return message;

            const message = document.createElement( 'span' );
            return message;
		}

	}

}

export { ARButton };
