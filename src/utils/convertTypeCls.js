/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ConvertTypeCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    passFloat32( array, output ){ let me = this.icn3dui;
        let n = array.length;
        if( !output ) output = new Uint8Array( 4 * n );
        let dv = me.convertTypeCls.getDataView( output );
        for( let i = 0; i < n; ++i ){
            dv.setFloat32( 4 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt8( array, output ){ let me = this.icn3dui;
        let n = array.length;
        if( !output ) output = new Uint8Array( 1 * n );
        let dv = me.convertTypeCls.getDataView( output );
        for( let i = 0; i < n; ++i ){
            dv.setInt8( 1 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt16( array, output ){ let me = this.icn3dui;
        let n = array.length;
        if( !output ) output = new Uint8Array( 2 * n );
        let dv = me.convertTypeCls.getDataView( output );
        for( let i = 0; i < n; ++i ){
            dv.setInt16( 2 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    passInt32( array, output ){ let me = this.icn3dui;
        let n = array.length;
        if( !output ) output = new Uint8Array( 4 * n );
        let dv = me.convertTypeCls.getDataView( output );
        for( let i = 0; i < n; ++i ){
            dv.setInt32( 4 * i, array[ i ], true); // litteEndian = true
        };
        return me.convertTypeCls.getUint8View( output );
    }

    getUint8View( typedArray ){ let me = this.icn3dui;
        return me.convertTypeCls.getView( Uint8Array, typedArray );
    }

    getDataView( typedArray ){ let me = this.icn3dui;
        return me.convertTypeCls.getView( DataView, typedArray );
    }

    getView( ctor, typedArray, elemSize ){ let me = this.icn3dui;
        return typedArray ? new ctor(
            typedArray.buffer,
            typedArray.byteOffset,
            typedArray.byteLength / ( elemSize || 1 )
        ) : undefined;
    }

    getBlobFromBufferAndText(arrayBuffer, text) { let me = this.icn3dui;
        let strArray = new Uint8Array(arrayBuffer);

        let strArray2 = new Uint8Array(text.length);
        for(let i = 0; i < text.length; ++i) {
           strArray2[i] = me.convertTypeCls.passInt8([text.charCodeAt(i)])[0];
        }

        let blobArray = []; // hold blobs

        //blobArray.push(new Blob([strArray0],{ type: "application/octet-stream"}));
        blobArray.push(new Blob([strArray],{ type: "application/octet-stream"}));
        blobArray.push(new Blob([strArray2],{ type: "application/octet-stream"}));

        //var blob = new Blob(blobArray,{ type: "application/octet-stream"});
        let blob = new Blob(blobArray,{ type: "image/png"});

        return blob;
    }
}

export {ConvertTypeCls}
