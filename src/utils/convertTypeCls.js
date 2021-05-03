/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ConvertTypeCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    passFloat32( array, output ){ var me = this.icn3dui;
        var n = array.length;
        if( !output ) output = new Uint8Array( 4 * n );
        var dv = me.convertTypeCls.getDataView( output );
        for( var i = 0; i < n; ++i ){
            dv.setFloat32( 4 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt8( array, output ){ var me = this.icn3dui;
        var n = array.length;
        if( !output ) output = new Uint8Array( 1 * n );
        var dv = me.convertTypeCls.getDataView( output );
        for( var i = 0; i < n; ++i ){
            dv.setInt8( 1 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt16( array, output ){ var me = this.icn3dui;
        var n = array.length;
        if( !output ) output = new Uint8Array( 2 * n );
        var dv = me.convertTypeCls.getDataView( output );
        for( var i = 0; i < n; ++i ){
            dv.setInt16( 2 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt32( array, output ){ var me = this.icn3dui;
        var n = array.length;
        if( !output ) output = new Uint8Array( 4 * n );
        var dv = me.convertTypeCls.getDataView( output );
        for( var i = 0; i < n; ++i ){
            dv.setInt32( 4 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    getUint8View( typedArray ){ var me = this.icn3dui;
        return me.convertTypeCls.getView( Uint8Array, typedArray );
    }

    getDataView( typedArray ){ var me = this.icn3dui;
        return me.convertTypeCls.getView( DataView, typedArray );
    }

    getView( ctor, typedArray, elemSize ){ var me = this.icn3dui;
        return typedArray ? new ctor(
            typedArray.buffer,
            typedArray.byteOffset,
            typedArray.byteLength / ( elemSize || 1 )
        ) : undefined;
    }

    getBlobFromBufferAndText(arrayBuffer, text) { var me = this.icn3dui;
        var strArray = new Uint8Array(arrayBuffer);

        var strArray2 = new Uint8Array(text.length);
        for(var i = 0; i < text.length; ++i) {
           strArray2[i] = me.convertTypeCls.passInt8([text.charCodeAt(i)])[0];
        }

        var blobArray = []; // hold blobs

        //blobArray.push(new Blob([strArray0],{ type: "application/octet-stream"}));
        blobArray.push(new Blob([strArray],{ type: "application/octet-stream"}));
        blobArray.push(new Blob([strArray2],{ type: "application/octet-stream"}));

        //var blob = new Blob(blobArray,{ type: "application/octet-stream"});
        var blob = new Blob(blobArray,{ type: "image/png"});

        return blob;
    }
}

export {ConvertTypeCls}
