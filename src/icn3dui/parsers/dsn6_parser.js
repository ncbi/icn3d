/**
 * @file Dsn6 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.Dsn6Parser = function(pdbid, type) { var me = this;
   var url, dataType;
   // https://edmaps.rcsb.org/maps/1kq2_2fofc.dsn6
   // https://edmaps.rcsb.org/maps/1kq2_fofc.dsn6

   url = "https://edmaps.rcsb.org/maps/" + pdbid.toLowerCase() + "_" + type + ".dsn6";

//console.log("url: " + url);

   dataType = "text";

   me.icn3d.bCid = undefined;

   if( (type == '2fofc' && me.icn3d.mapData.header2 === undefined) ||
     (type == 'fofc' && me.icn3d.mapData.header === undefined) ) {
       $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              me.showLoading();
          },
          complete: function() {
              me.hideLoading();
          },
          success: function(dsn6data) {
//console.log("dsn6data: " + dsn6data);
              me.loadDsn6Data(dsn6data, type);
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }

            alert("RCSB server has no corresponding eletron density map for this structure.");

            return;
          }
       });
    }
};

iCn3DUI.prototype.loadDsn6Data = function(dsn6data, type) { var me = this;
    // DSN6 http://www.uoxray.uoregon.edu/tnt/manual/node104.html
    // BRIX http://svn.cgl.ucsf.edu/svn/chimera/trunk/libs/VolumeData/dsn6/brix-1.html

    var voxelSize = 1;

    var header = {};
    var divisor, summand;

    //var bin = (dsn6data.buffer && dsn6data.buffer instanceof ArrayBuffer) ? dsn6data.buffer : dsn6data;
    //var intView = new Int16Array(bin);
    //var byteView = new Uint8Array(bin);

    var n = dsn6data.length / 2;
    var intView = new Int16Array( n );
    for( var i = 0, i2 = 0; i < n; ++i, i2 += 2 ){
        intView[ i ] = dsn6data.charCodeAt(i2) << 8 ^ dsn6data.charCodeAt(i2 + 1) << 0;
    }

    var byteView = new Uint8Array(dsn6data.length);
    for(var i = 0; i < dsn6data.length; ++i) {
       //byteView[i] = me.passInt8([dsn6data.charCodeAt(i)])[0];
       byteView[i] = dsn6data.charCodeAt(i);
    }

    //var brixStr = String.fromCharCode.apply(null, byteView.subarray(0, 512));
    var headerText = byteView.slice(0, 512);
    var brixStr = String.fromCharCode.apply(null, headerText);

    if (brixStr.indexOf(':-)') == 0) {
      header.xStart = parseInt(brixStr.substr(10, 5)); // NXSTART
      header.yStart = parseInt(brixStr.substr(15, 5));
      header.zStart = parseInt(brixStr.substr(20, 5));

      header.xExtent = parseInt(brixStr.substr(32, 5)); // NX
      header.yExtent = parseInt(brixStr.substr(38, 5));
      header.zExtent = parseInt(brixStr.substr(42, 5));

      header.xRate = parseInt(brixStr.substr(52, 5)); // MX
      header.yRate = parseInt(brixStr.substr(58, 5));
      header.zRate = parseInt(brixStr.substr(62, 5));

      header.xlen = parseFloat(brixStr.substr(73, 10)) * voxelSize;
      header.ylen = parseFloat(brixStr.substr(83, 10)) * voxelSize;
      header.zlen = parseFloat(brixStr.substr(93, 10)) * voxelSize;

      header.alpha = parseFloat(brixStr.substr(103, 10));
      header.beta = parseFloat(brixStr.substr(113, 10));
      header.gamma = parseFloat(brixStr.substr(123, 10));

      divisor = parseFloat(brixStr.substr(138, 12)) / 100;
      summand = parseInt(brixStr.substr(155, 8));

      header.sigma = parseFloat(brixStr.substr(170, 12)) * 100;
    } else {
      // swap byte order when big endian
      if (intView[ 18 ] !== 100) {
        for (var i = 0, n = intView.length; i < n; ++i) {
          var val = intView[ i ];
          intView[ i ] = ((val & 0xff) << 8) | ((val >> 8) & 0xff);
        }
      }

      header.xStart = intView[ 0 ]; // NXSTART
      header.yStart = intView[ 1 ];
      header.zStart = intView[ 2 ];

      header.xExtent = intView[ 3 ]; // NX
      header.yExtent = intView[ 4 ];
      header.zExtent = intView[ 5 ];

      if(header.xExtent < 0 || header.yExtent < 0 || header.zExtent < 0) {
          alert("The header of the eletron density map have some problems...");
      }

      header.xRate = intView[ 6 ]; // MX
      header.yRate = intView[ 7 ];
      header.zRate = intView[ 8 ];

      var factor = 1 / intView[ 17 ];
      var scalingFactor = factor * voxelSize;

      header.xlen = intView[ 9 ] * scalingFactor;
      header.ylen = intView[ 10 ] * scalingFactor;
      header.zlen = intView[ 11 ] * scalingFactor;

      header.alpha = intView[ 12 ] * factor;
      header.beta = intView[ 13 ] * factor;
      header.gamma = intView[ 14 ] * factor;

      divisor = intView[ 15 ] / 100;
      summand = intView[ 16 ];
      //header.gamma = intView[ 14 ] * factor;
    }

    var data = new Float32Array(
      header.xExtent * header.yExtent * header.zExtent
    );

    var offset = 512;
    var xBlocks = Math.ceil(header.xExtent / 8);
    var yBlocks = Math.ceil(header.yExtent / 8);
    var zBlocks = Math.ceil(header.zExtent / 8);

    // loop over blocks
    for (var zz = 0; zz < zBlocks; ++zz) {
      for (var yy = 0; yy < yBlocks; ++yy) {
        for (var xx = 0; xx < xBlocks; ++xx) {
          // loop inside block
          for (var k = 0; k < 8; ++k) {
            var z = 8 * zz + k;
            for (var j = 0; j < 8; ++j) {
              var y = 8 * yy + j;
              for (var i = 0; i < 8; ++i) {
                var x = 8 * xx + i;

                // check if remaining slice-part contains data
                if (x < header.xExtent && y < header.yExtent && z < header.zExtent) {
                  var idx = ((((x * header.yExtent) + y) * header.zExtent) + z);
                  data[ idx ] = (byteView[ offset ] - summand) / divisor;
                  ++offset;
                } else {
                  offset += 8 - i;
                  break;
                }
              }
            }
          }
        }
      }
    }

    //var v = this.volume
    //v.header = header;
    //v.setData(data, header.zExtent, header.yExtent, header.xExtent);
    //v.setMatrix(me.getMatrix(header));

    if(type == '2fofc') {
        me.icn3d.mapData.header2 = header;
        me.icn3d.mapData.data2 = data;
        me.icn3d.mapData.matrix2 = me.getMatrix(header);
    }
    else {
        me.icn3d.mapData.header = header;
        me.icn3d.mapData.data = data;
        me.icn3d.mapData.matrix = me.getMatrix(header);
    }

//console.log("header: " + JSON.stringify(header));
//console.log("data: " + Object.keys(data).length);

    me.setOption('map', type);

    // for 1TOP
    // header: {"xStart":765,"yStart":18,"zStart":765,"xExtent":83,"yExtent":118,"zExtent":88,"xRate":114,"yRate":114,"zRate":102,"xlen":-64.03750000000001,"ylen":-64.03750000000001,"zlen":-57.6375,"alpha":90,"beta":90,"gamma":-118.4375}
    // data: {"0":0.7797271013259888,"1":1.0396361351013184,"2":1.5594542026519775,"3":1.4944769144058228,"4":1.0396361351013184,...

    //if (header.sigma) {
    //  v.setStats(undefined, undefined, undefined, header.sigma);
    //}
};

iCn3DUI.prototype.getMatrix = function(header) { var me = this;
    var h = header;

    var basisX = [
      h.xlen,
      0,
      0
    ];

    var basisY = [
      h.ylen * Math.cos(Math.PI / 180.0 * h.gamma),
      h.ylen * Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ];

    var basisZ = [
      h.zlen * Math.cos(Math.PI / 180.0 * h.beta),
      h.zlen * (
        Math.cos(Math.PI / 180.0 * h.alpha) -
        Math.cos(Math.PI / 180.0 * h.gamma) *
        Math.cos(Math.PI / 180.0 * h.beta)
      ) / Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ];
    basisZ[ 2 ] = Math.sqrt(
      h.zlen * h.zlen * Math.sin(Math.PI / 180.0 * h.beta) *
      Math.sin(Math.PI / 180.0 * h.beta) - basisZ[ 1 ] * basisZ[ 1 ]
    );

    var basis = [ [], basisX, basisY, basisZ ];
    var nxyz = [ 0, h.xRate, h.yRate, h.zRate ];
    var mapcrs = [ 0, 1, 2, 3 ];

    //https://www.ks.uiuc.edu/Research/vmd/plugins/doxygen/dsn6plugin_8C-source.html
    // Convert the origin from grid space to cartesian coordinates
    // origin
    var x0 = basisX[0] / h.xRate * h.xStart + basisY[0] / h.yRate * h.yStart + basisZ[0] / h.zRate * h.zStart;
    var y0 = basisY[1] / h.yRate * h.yStart + basisZ[1] / h.zRate * h.zStart;
    var z0 = basisZ[2] / h.zRate * h.zStart;

    // axis
    var xaxis = new THREE.Vector3(basisX[0] / h.xRate * (h.xExtent - 1), 0, 0);
    var yaxis = new THREE.Vector3(basisY[0] / h.yRate * (h.yExtent - 1), basisY[1] / h.yRate * (h.yExtent - 1), 0);
    var zaxis = new THREE.Vector3(basisZ[0] / h.zRate * (h.zExtent - 1), basisZ[1] / h.zRate * (h.zExtent - 1), basisZ[2] / h.zRate * (h.zExtent - 1));

    // size
    var xsize = h.xExtent;
    var ysize = h.yExtent;
    var zsize = h.zExtent;


// console.log("x0: " + x0 + " y0: " + y0 + " z0: " + z0);

    var matrix = new THREE.Matrix4();

    matrix.set(
      basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
      0,
      0, 0, 0, 1
    );


    matrix.multiply(
      new THREE.Matrix4().makeRotationY(Math.PI * 0.5)
    );

    matrix.multiply(new THREE.Matrix4().makeTranslation(
      -h.zStart, h.yStart, h.xStart
    ));

    matrix.multiply(new THREE.Matrix4().makeScale(
      -1, 1, 1
    ));


    return matrix;
};
