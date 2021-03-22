/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

/* The following are shared by full_ui.js and simple_ui.js */

//if (typeof jQuery === 'undefined') { throw new Error('iCn3DUI requires jQuery') }
//if (typeof iCn3D === 'undefined') { throw new Error('iCn3DUI requires iCn3D') }

iCn3DUI.prototype.isIE = function() { var me = this, ic = me.icn3d; "use strict";
    //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        return true;
    else                 // If another browser, return 0
        return false;
};

iCn3DUI.prototype.passFloat32 = function( array, output ){ var me = this, ic = me.icn3d; "use strict";
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setFloat32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt8 = function( array, output ){ var me = this, ic = me.icn3d; "use strict";
    var n = array.length;
    if( !output ) output = new Uint8Array( 1 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt8( 1 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt16 = function( array, output ){ var me = this, ic = me.icn3d; "use strict";
    var n = array.length;
    if( !output ) output = new Uint8Array( 2 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt16( 2 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt32 = function( array, output ){ var me = this, ic = me.icn3d; "use strict";
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

// ------------

iCn3DUI.prototype.getUint8View = function( typedArray ){ var me = this, ic = me.icn3d; "use strict";
    return me.getView( Uint8Array, typedArray );
};

iCn3DUI.prototype.getDataView = function( typedArray ){ var me = this, ic = me.icn3d; "use strict";
    return me.getView( DataView, typedArray );
};

iCn3DUI.prototype.getView = function( ctor, typedArray, elemSize ){ var me = this, ic = me.icn3d; "use strict";
    return typedArray ? new ctor(
        typedArray.buffer,
        typedArray.byteOffset,
        typedArray.byteLength / ( elemSize || 1 )
    ) : undefined;
};

iCn3DUI.prototype.getBlobFromBufferAndText = function(arrayBuffer, text) { var me = this, ic = me.icn3d; "use strict";
    var strArray = new Uint8Array(arrayBuffer);

    var strArray2 = new Uint8Array(text.length);
    for(var i = 0; i < text.length; ++i) {
       strArray2[i] = me.passInt8([text.charCodeAt(i)])[0];
    }

    var blobArray = []; // hold blobs

    //blobArray.push(new Blob([strArray0],{ type: "application/octet-stream"}));
    blobArray.push(new Blob([strArray],{ type: "application/octet-stream"}));
    blobArray.push(new Blob([strArray2],{ type: "application/octet-stream"}));

    //var blob = new Blob(blobArray,{ type: "application/octet-stream"});
    var blob = new Blob(blobArray,{ type: "image/png"});

    return blob;
};

iCn3DUI.prototype.getTransformationStr = function(transformation) { var me = this, ic = me.icn3d; "use strict";
    var transformation2 = {"factor": 1.0, "mouseChange": {"x": 0, "y": 0}, "quaternion": {"_x": 0, "_y": 0, "_z": 0, "_w": 1} };
    transformation2.factor = parseFloat(transformation.factor).toPrecision(4);
    transformation2.mouseChange.x = parseFloat(transformation.mouseChange.x).toPrecision(4);
    transformation2.mouseChange.y = parseFloat(transformation.mouseChange.y).toPrecision(4);
    transformation2.quaternion._x = parseFloat(transformation.quaternion._x).toPrecision(4);
    transformation2.quaternion._y = parseFloat(transformation.quaternion._y).toPrecision(4);
    transformation2.quaternion._z = parseFloat(transformation.quaternion._z).toPrecision(4);
    transformation2.quaternion._w = parseFloat(transformation.quaternion._w).toPrecision(4);

    if(transformation2.factor == '1.0000') transformation2.factor = 1;
    if(transformation2.mouseChange.x == '0.0000') transformation2.mouseChange.x = 0;
    if(transformation2.mouseChange.y == '0.0000') transformation2.mouseChange.y = 0;

    if(transformation2.quaternion._x == '0.0000') transformation2.quaternion._x = 0;
    if(transformation2.quaternion._y == '0.0000') transformation2.quaternion._y = 0;
    if(transformation2.quaternion._z == '0.0000') transformation2.quaternion._z = 0;
    if(transformation2.quaternion._w == '1.0000') transformation2.quaternion._w = 1;

    return JSON.stringify(transformation2);
};

iCn3DUI.prototype.isMobile = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

iCn3DUI.prototype.isMac = function() {
    return /Mac/i.test(navigator.userAgent);
};

iCn3DUI.prototype.isSessionStorageSupported = function() {
    return window.sessionStorage;
};

iCn3DUI.prototype.handleContextLost = function() { var me = this, ic = me.icn3d; "use strict";
    //https://www.khronos.org/webgl/wiki/HandlingContextLost
    // 1 add a lost context handler and tell it to prevent the default behavior

    var canvas = $("#" + me.pre + "canvas")[0];
    canvas.addEventListener("webglcontextlost", function(event) {
        event.preventDefault();
    }, false);

    // 2 re-setup all your WebGL state and re-create all your WebGL resources when the context is restored.
    canvas.addEventListener("webglcontextrestored", function(event) {
        // IE11 error: WebGL content is taking too long to render on your GPU. Temporarily switching to software rendering.
        console.log("WebGL context was lost. Reset WebGLRenderer and launch iCn3D again.");

        ic.renderer = new THREE.WebGLRenderer({
            canvas: ic.container.get(0),
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });

        ic.draw();

    }, false);
};
