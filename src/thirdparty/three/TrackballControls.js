/* TrackballControls.js from http://threejs.org/
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * modified by Jiyao Wang
 */

//import * as THREE from 'three';

THREE.TrackballControls = function ( object, domElement, icn3d ) {
    "use strict";

    var _this = this;

    this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API
    this.enabled = true;

    this.screen = { left: 0, top: 0, width: 0, height: 0 };

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;

    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;
    this.noRoll = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

    // internals

    this.target = new THREE.Vector3();

    var EPS = 0.000001;

    var lastPosition = new THREE.Vector3();

    this._state = this.STATE.NONE;
    var _prevState = this.STATE.NONE;

    var _eye = new THREE.Vector3();

    this._rotateStart = new THREE.Vector3();
    this._rotateEnd = new THREE.Vector3();

    this._zoomStart = new THREE.Vector2();
    this._zoomEnd = new THREE.Vector2();

    var _touchZoomDistanceStart = 0;
    var _touchZoomDistanceEnd = 0;

    this._panStart = new THREE.Vector2();
    this._panEnd = new THREE.Vector2();

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};


    // methods

    this.handleResize = function () {

        if ( this.domElement === document ) {

            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;

        } else {

            var box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;

        }

    };

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] === 'function' ) {

            this[ event.type ]( event );

        }

    };

    var getMouseOnScreen = ( function () {

        var vector = new THREE.Vector2();

        return function ( pageX, pageY ) {

            vector.set(
                ( pageX - _this.screen.left ) / _this.screen.width,
                ( pageY - _this.screen.top ) / _this.screen.height
            );

            return vector;

        };

    }() );

    var getMouseProjectionOnBall = ( function () {

        var vector = new THREE.Vector3();
        var objectUp = new THREE.Vector3();
        var mouseOnBall = new THREE.Vector3();

        return function ( pageX, pageY ) {

            mouseOnBall.set(
                ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
                ( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
                0.0
            );

            var length = mouseOnBall.length();

            if ( _this.noRoll ) {

                if ( length < Math.SQRT1_2 ) {

                    mouseOnBall.z = Math.sqrt( 1.0 - length*length );

                } else {

                    mouseOnBall.z = .5 / length;

                }

            } else if ( length > 1.0 ) {

                mouseOnBall.normalize();

            } else {

                mouseOnBall.z = Math.sqrt( 1.0 - length * length );

            }

            _eye.copy( _this.object.position ).sub( _this.target );

            vector.copy( _this.object.up ).setLength( mouseOnBall.y )
            vector.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
            vector.add( _eye.setLength( mouseOnBall.z ) );

            return vector;

        };

    }() );

    this.rotateCamera = (function(quaternionIn, bUpdate){

        var axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion();


        return function (quaternionIn, bUpdate) {

            var angle;
            if(quaternionIn === undefined) {
              angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );
            }

            //var angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );

            if ( angle || quaternionIn !== undefined) {
                if(quaternionIn === undefined) {
                  axis.crossVectors( _this._rotateStart, _this._rotateEnd ).normalize();

                  angle *= _this.rotateSpeed;

                  quaternion.setFromAxisAngle( axis, -angle );
                }
                else {
                  quaternion.copy(quaternionIn);
                }

                // order matters in quaernion multiplication: http://www.cprogramming.com/tutorial/3d/quaternions.html
                if(icn3d !== undefined && icn3d.quaternion !== undefined && (bUpdate === undefined || bUpdate === true)) {
                    icn3d.quaternion.multiplyQuaternions(quaternion, icn3d.quaternion);
                }

                _eye.applyQuaternion( quaternion );
                _this.object.up.applyQuaternion( quaternion );

                _this._rotateEnd.applyQuaternion( quaternion );

                if ( _this.staticMoving ) {

                    _this._rotateStart.copy( _this._rotateEnd );

                } else {

                    quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
                    _this._rotateStart.applyQuaternion( quaternion );

                }
            }

        }

    }());

    this.zoomCamera = function (zoomFactor, bUpdate) {
        if ( _this._state === _this.STATE.TOUCH_ZOOM_PAN ) {

            var factor;

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {

              factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
              _touchZoomDistanceStart = _touchZoomDistanceEnd;
            }

            _eye.multiplyScalar( factor );

            if(icn3d !== undefined && icn3d._zoomFactor !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d._zoomFactor *= factor;

        } else {

            var factor;

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {
              factor = 1.0 + ( _this._zoomEnd.y - _this._zoomStart.y ) * _this.zoomSpeed;
            }

            if(icn3d !== undefined && icn3d._zoomFactor !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d._zoomFactor *= factor;

            //if ( factor !== 1.0 && factor > 0.0 ) {
            if ( factor !== 1.0 ) {

                _eye.multiplyScalar( factor );

                if ( _this.staticMoving ) {

                    _this._zoomStart.copy( _this._zoomEnd );

                } else {

                    _this._zoomStart.y += ( _this._zoomEnd.y - _this._zoomStart.y ) * this.dynamicDampingFactor;
                }
            }

        }

    };

    this.panCamera = (function(mouseChangeIn, bUpdate){

        var mouseChange = new THREE.Vector2(),
            objectUp = new THREE.Vector3(),
            pan = new THREE.Vector3();

        return function (mouseChangeIn, bUpdate) {

            if(mouseChangeIn !== undefined) {
              mouseChange = mouseChangeIn;

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add(mouseChangeIn);
            }
            else {
              mouseChange.copy( _this._panEnd ).sub( _this._panStart );

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add( _this._panEnd ).sub( _this._panStart );
            }

            if ( mouseChange.lengthSq() ) {
                mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

                pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
                pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

                _this.object.position.add( pan );
                _this.target.add( pan );

                if ( _this.staticMoving ) {

                    _this._panStart.copy( _this._panEnd );

                } else {

                    _this._panStart.add( mouseChange.subVectors( _this._panEnd, _this._panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

                }

            }
        }

    }());

    this.checkDistances = function () {

        if ( !_this.noZoom || !_this.noPan ) {

            if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

                _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

            }

            if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

                _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

            }

        }

    };

    this.update = function (para) {

        _eye.subVectors( _this.object.position, _this.target );

        if ( !_this.noRotate ) {

            if(para !== undefined && para.quaternion !== undefined) {
              _this.rotateCamera(para.quaternion, para.update);
            }
            else {
              _this.rotateCamera();
            }

        }

        if ( !_this.noZoom ) {

            if(para !== undefined && para._zoomFactor !== undefined) {
              _this.zoomCamera(para._zoomFactor, para.update);
            }
            else {
              _this.zoomCamera();
            }

        }

        if ( !_this.noPan ) {

            if(para !== undefined && para.mouseChange !== undefined) {
              _this.panCamera(para.mouseChange, para.update);
            }
            else {
              _this.panCamera();
            }

        }

        _this.object.position.addVectors( _this.target, _eye );

        _this.checkDistances();

        _this.object.lookAt( _this.target );

        if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

            _this.dispatchEvent( changeEvent );

            lastPosition.copy( _this.object.position );

        }

    };

    this.reset = function () {

        _this._state = _this.STATE.NONE;
        _prevState = _this.STATE.NONE;

        _this.target.copy( _this.target0 );
        _this.object.position.copy( _this.position0 );
        _this.object.up.copy( _this.up0 );

        _eye.subVectors( _this.object.position, _this.target );

        _this.object.lookAt( _this.target );

        _this.dispatchEvent( changeEvent );

        lastPosition.copy( _this.object.position );

    };

    // listeners

    function keydown( event ) {
//console.log("keydown");

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        window.removeEventListener( 'keydown', keydown );

        _prevState = _this._state;


        if ( _this._state !== _this.STATE.NONE ) {

            return;

        } else if ( event.keyCode === _this.keys[ _this.STATE.ROTATE ] &&  !_this.noRotate) {

            _this._state = _this.STATE.ROTATE;

        } else if ( (event.keyCode === _this.keys[ _this.STATE.ZOOM ]) && !_this.noZoom ) {

            _this._state = _this.STATE.ZOOM;

        } else if ( (event.keyCode === _this.keys[ _this.STATE.PAN ]) && !_this.noPan ) {

            _this._state = _this.STATE.PAN;

        }


    }

    function keyup( event ) {
//console.log("keyup");

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        _this._state = _prevState;

        window.addEventListener( 'keydown', keydown, false );

    }

    function mousedown( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === _this.STATE.NONE ) {

            _this._state = event.button;

        }

        if ( _this._state === _this.STATE.ROTATE && !_this.noRotate ) {

            _this._rotateStart.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );
            _this._rotateEnd.copy( _this._rotateStart );

        } else if ( _this._state === _this.STATE.ZOOM && !_this.noZoom ) {

            _this._zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._zoomEnd.copy(_this._zoomStart);

        } else if ( _this._state === _this.STATE.PAN && !_this.noPan ) {

            _this._panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._panEnd.copy(_this._panStart)

        }

        document.addEventListener( 'mousemove', mousemove, false );
        document.addEventListener( 'mouseup', mouseup, false );

        _this.dispatchEvent( startEvent );

    }

    function mousemove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === _this.STATE.ROTATE && !_this.noRotate ) {

//console.log("ROTATE");
            _this._rotateEnd.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );

        } else if ( _this._state === _this.STATE.ZOOM && !_this.noZoom ) {

            _this._zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        } else if ( _this._state === _this.STATE.PAN && !_this.noPan ) {

            _this._panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        }

    }

    function mouseup( event ) {
        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        _this._state = _this.STATE.NONE;

        document.removeEventListener( 'mousemove', mousemove );
        document.removeEventListener( 'mouseup', mouseup );
        _this.dispatchEvent( endEvent );

    }

    function mousewheel( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta / 40;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail / 3;

        }

        //_this._zoomStart.y += delta * 0.01;
        //_this._zoomStart.y = delta * 0.01;
        _this._zoomStart.y = delta * 0.005;
        _this.dispatchEvent( startEvent );
        _this.dispatchEvent( endEvent );

    }

    function touchstart( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {
            case 1:
                _this._state = _this.STATE.TOUCH_ROTATE;
                _this._rotateStart.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateEnd.copy( _this._rotateStart );
                break;

            case 2:
                _this._state = _this.STATE.TOUCH_ZOOM_PAN;
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panStart.copy( getMouseOnScreen( x, y ) );
                _this._panEnd.copy( _this._panStart );
                break;

            default:
                _this._state = _this.STATE.NONE;

        }
        _this.dispatchEvent( startEvent );


    }

    function touchmove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                break;

            case 2:
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                break;

            default:
                _this._state = _this.STATE.NONE;

        }

    }

    function touchend( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateStart.copy( _this._rotateEnd );
                break;

            case 2:
                _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                _this._panStart.copy( _this._panEnd );
                break;

        }

        _this._state = _this.STATE.NONE;
        _this.dispatchEvent( endEvent );

    }

    if(Object.keys(window).length >= 2) {
        this.domElement.addEventListener( 'contextmn', function ( event ) {
            //event.preventDefault();
        }, false );

        this.domElement.addEventListener( 'mousedown', mousedown, false );

        this.domElement.addEventListener( 'mousewheel', mousewheel, false );
        this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        if(Object.keys(window).length >= 2) window.addEventListener( 'keydown', keydown, false );
        if(Object.keys(window).length >= 2) window.addEventListener( 'keyup', keyup, false );
    }

    this.handleResize();

    // force an update at start
    this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;
