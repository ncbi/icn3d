/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * modified by Jiyao Wang
 */

THREE.StereoEffect = function ( renderer ) {
    var _this = this;
    // API

    _this.separation = 3; // 1;

    // internals

    // _this._width, _this._height;

    _this._position = new THREE.Vector3();
    _this._quaternion = new THREE.Quaternion();
    _this._scale = new THREE.Vector3();

    _this._cameraL = new THREE.PerspectiveCamera();
    _this._cameraR = new THREE.PerspectiveCamera();

    // initialization

    renderer.autoClear = false;

    _this.setSize = function ( width, height ) {

        _this._width = width / 2;
        _this._height = height;

        renderer.setSize( width, height );

    };

    _this.render = function ( scene, camera ) {

        scene.updateMatrixWorld();

        if ( camera.parent === undefined ) camera.updateMatrixWorld();
    
        camera.matrixWorld.decompose( _this._position, _this._quaternion, _this._scale );

        // left
        _this._cameraL.copy(camera);
        _this._cameraL.aspect = 0.5 * camera.aspect;
        _this._cameraL.updateProjectionMatrix();
        
/*
        _this._cameraL.fov = camera.fov;
        _this._cameraL.aspect = 0.5 * camera.aspect;
        _this._cameraL.near = camera.near;
        _this._cameraL.far = camera.far;
        _this._cameraL.updateProjectionMatrix();

        _this._cameraL.position.copy( _this._position );
        // _this._cameraL.quaternion.copy( _this._quaternion );
*/
        _this._cameraL.translateX( - _this.separation );

        // right
        _this._cameraR.copy(camera);
        _this._cameraR.aspect = 0.5 * camera.aspect;
        _this._cameraR.updateProjectionMatrix();

/*
        _this._cameraR.fov = camera.fov;
        _this._cameraR.aspect = 0.5 * camera.aspect;
        _this._cameraR.near = camera.near;
        _this._cameraR.far = camera.far;
        // _this._cameraR.projectionMatrix = _this._cameraL.projectionMatrix;
        _this._cameraR.updateProjectionMatrix();

        _this._cameraR.position.copy( _this._position );
        // _this._cameraR.quaternion.copy( _this._quaternion );
*/

        _this._cameraR.translateX( _this.separation );

        //

        renderer.setViewport( 0, 0, _this._width * 2, _this._height );
        renderer.clear();

        renderer.setViewport( 0, 0, _this._width, _this._height );
        renderer.render( scene, _this._cameraL );

        renderer.setViewport( _this._width, 0, _this._width, _this._height );
        renderer.render( scene, _this._cameraR );

    };

};

