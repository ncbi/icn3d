/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

/*! The following are shared by full_ui.js and simple_ui.js */

if (typeof jQuery === 'undefined') { throw new Error('iCn3DUI requires jQuery') }
if (typeof iCn3D === 'undefined') { throw new Error('iCn3DUI requires iCn3D') }

/*
iCn3DUI.prototype.clickHighlight_3d_dgm = function() { var me = this;
    $("#" + me.pre + "highlight_3d_dgm").click(function (e) {
       //e.preventDefault();
       me.icn3d.removeHlObjects();

       var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

       var mols = "";

       var molid2ssTmp = {}, molid2colorTmp = {};

       me.icn3d.hAtoms = {};
       for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
         if(ckbxes[i].checked && ckbxes[i].value != 'chemicals') {
           var value = ckbxes[i].value;
           var chain = ckbxes[i].getAttribute('chain');

           if(me.icn3d.molid2ss.hasOwnProperty(value)) { // condensed view
               molid2ssTmp[value] = me.icn3d.molid2ss[value];
               molid2colorTmp[value] = me.icn3d.molid2color[value];
           }
           else { // all atom view
               me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.chains[chain]);
           }
         }
       }

       me.icn3d.drawHelixBrick(molid2ssTmp, molid2colorTmp, me.icn3d.bHighlight); // condensed view
       me.icn3d.addHlObjects(undefined, false); // all atom view

       me.icn3d.render();
    });
};
*/

iCn3DUI.prototype.rotStruc = function (direction, bInitial) { var me = this;
    if(me.icn3d.bStopRotate) return false;
    if(me.icn3d.rotateCount > me.icn3d.rotateCountMax) {
        // back to the original orientation
        me.icn3d.resetOrientation();

        return false;
    }
    ++me.icn3d.rotateCount;

    if(bInitial !== undefined && bInitial) {
        if(direction === 'left') {
          me.ROT_DIR = 'left';
        }
        else if(direction === 'right') {
          me.ROT_DIR = 'right';
        }
        else if(direction === 'up') {
          me.ROT_DIR = 'up';
        }
        else if(direction === 'down') {
          me.ROT_DIR = 'down';
        }
        else {
          return false;
        }
    }

    if(direction === 'left' && me.ROT_DIR === 'left') {
      me.icn3d.rotateLeft(1);
    }
    else if(direction === 'right' && me.ROT_DIR === 'right') {
      me.icn3d.rotateRight(1);
    }
    else if(direction === 'up' && me.ROT_DIR === 'up') {
      me.icn3d.rotateUp(1);
    }
    else if(direction === 'down' && me.ROT_DIR === 'down') {
      me.icn3d.rotateDown(1);
    }
    else {
      return false;
    }

    setTimeout(function(){ me.rotStruc(direction); }, 100);
};

iCn3DUI.prototype.showTitle = function() { var me = this;
    if(me.icn3d.molTitle !== undefined && me.icn3d.molTitle !== '') {
        var title = me.icn3d.molTitle;

        if(me.inputid === undefined) {
            if(me.icn3d.molTitle.length > 40) title = me.icn3d.molTitle.substr(0, 40) + "...";

            $("#" + me.pre + "title").html(title);
        }
        else if(me.cfg.cid !== undefined) {
            var url = me.getLinkToStructureSummary();

            $("#" + me.pre + "title").html("PubChem CID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>: " + title);
        }
        else if(me.cfg.align !== undefined) {
            $("#" + me.pre + "title").html(title);
        }
        else {
            var url = me.getLinkToStructureSummary();

            if(me.icn3d.molTitle.length > 40) title = me.icn3d.molTitle.substr(0, 40) + "...";

            //var asymmetricStr = (me.bAssemblyUseAsu) ? " (Asymmetric Unit)" : "";
            var asymmetricStr = "";

            $("#" + me.pre + "title").html("PDB ID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>" + asymmetricStr + ": " + title);
        }
    }
    else {
        $("#" + me.pre + "title").html("");
    }
};

iCn3DUI.prototype.getLinkToStructureSummary = function(bLog) { var me = this;

       var url = "https://www.ncbi.nlm.nih.gov/structure/?term=";

       if(me.cfg.cid !== undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=";
       }
       else {
           if(me.inputid.indexOf(",") !== -1) {
               url = "https://www.ncbi.nlm.nih.gov/structure/?term=";
           }
           else {
               //url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=";
               url = "https://www.ncbi.nlm.nih.gov/Structure/pdb/";
           }
       }

       if(me.inputid === undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=" + me.molTitle;
       }
       else {
           var idArray = me.inputid.split('_');

           if(idArray.length === 1) {
               url += me.inputid;
               if(bLog !== undefined && bLog) me.setLogCmd("link to Structure Summary " + me.inputid + ": " + url, false);
           }
           else if(idArray.length === 2) {
               url += idArray[0] + " OR " + idArray[1];
               if(bLog !== undefined && bLog) me.setLogCmd("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
           }
       }

       return url;
},

iCn3DUI.prototype.isIE = function() { var me = this;
    //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        return true;
    else                 // If another browser, return 0
        return false;
};

iCn3DUI.prototype.passFloat32 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setFloat32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt8 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 1 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt8( 1 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt16 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 2 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt16( 2 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

iCn3DUI.prototype.passInt32 = function( array, output ){ var me = this;
    var n = array.length;
    if( !output ) output = new Uint8Array( 4 * n );
    var dv = me.getDataView( output );
    for( var i = 0; i < n; ++i ){
        dv.setInt32( 4 * i, array[ i ], true); // litteEndian = true
    };
    return me.getUint8View( output );
};

// ------------

iCn3DUI.prototype.getUint8View = function( typedArray ){ var me = this;
    return me.getView( Uint8Array, typedArray );
};

iCn3DUI.prototype.getDataView = function( typedArray ){ var me = this;
    return me.getView( DataView, typedArray );
};

iCn3DUI.prototype.getView = function( ctor, typedArray, elemSize ){ var me = this;
    return typedArray ? new ctor(
        typedArray.buffer,
        typedArray.byteOffset,
        typedArray.byteLength / ( elemSize || 1 )
    ) : undefined;
};

iCn3DUI.prototype.getBlobFromBufferAndText = function(arrayBuffer, text) { var me = this;
    //var start = "data:image/png;base64,";

    //var strArray0 = new Uint8Array(start.length);
    //for(var i = 0; i < start.length; ++i) {
    //   strArray0[i] = me.passInt8([start.charCodeAt(i)])[0];
    //}

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

iCn3DUI.prototype.getTransformationStr = function(transformation) { var me = this;
    var transformation2 = {"factor": 1.0, "mouseChange": {"x": 0, "y": 0}, "quaternion": {"_x": 0, "_y": 0, "_z": 0, "_w": 1} };
    transformation2.factor = parseFloat(transformation.factor).toPrecision(5);
    transformation2.mouseChange.x = parseFloat(transformation.mouseChange.x).toPrecision(5);
    transformation2.mouseChange.y = parseFloat(transformation.mouseChange.y).toPrecision(5);
    transformation2.quaternion._x = parseFloat(transformation.quaternion._x).toPrecision(5);
    transformation2.quaternion._y = parseFloat(transformation.quaternion._y).toPrecision(5);
    transformation2.quaternion._z = parseFloat(transformation.quaternion._z).toPrecision(5);
    transformation2.quaternion._w = parseFloat(transformation.quaternion._w).toPrecision(5);

    if(transformation2.factor == '1.0000') transformation2.factor = 1;
    if(transformation2.mouseChange.x == '0.0000') transformation2.mouseChange.x = 0;
    if(transformation2.mouseChange.y == '0.0000') transformation2.mouseChange.y = 0;

    if(transformation2.quaternion._x == '0.0000') transformation2.quaternion._x = 0;
    if(transformation2.quaternion._y == '0.0000') transformation2.quaternion._y = 0;
    if(transformation2.quaternion._z == '0.0000') transformation2.quaternion._z = 0;
    if(transformation2.quaternion._w == '1.0000') transformation2.quaternion._w = 1;

    return JSON.stringify(transformation2);
};

iCn3DUI.prototype.createLinkForBlob = function(blob, filename) { var me = this;
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

iCn3DUI.prototype.saveFile = function(filename, type, text) { var me = this;
    //Save file
    var blob;

    if(type === 'command') {
        var dataStr = '';
        for(var i = 0, il = me.icn3d.commands.length; i < il; ++i) {
            var command = me.icn3d.commands[i].trim();
            if(i == il - 1) {
               var command_tf = command.split('|||');

               var transformation = {};
               transformation.factor = me.icn3d._zoomFactor;
               transformation.mouseChange = me.icn3d.mouseChange;
               transformation.quaternion = me.icn3d.quaternion;

               command = command_tf[0] + '|||' + me.getTransformationStr(transformation);
            }

            dataStr += command + '\n';
        }
        var data = decodeURIComponent(dataStr);

        blob = new Blob([data],{ type: "text;charset=utf-8;"});
    }
    else if(type === 'png') {
        me.icn3d.render();

        var bAddURL = true;
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            bAddURL = false;
        }

        if(me.isIE()) {
            blob = me.icn3d.renderer.domElement.msToBlob();

            if(bAddURL) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var arrayBuffer = e.target.result; // or = reader.result;

                    var url = me.shareLinkUrl();

                    var text = "\nShare Link: " + url;
                    blob = me.getBlobFromBufferAndText(arrayBuffer, text);

                    //if(window.navigator.msSaveBlob) navigator.msSaveBlob(blob, filename);
                    saveAs(blob, filename);

                    return;
                };

                reader.readAsArrayBuffer(blob);
            }
        }
        else {
            me.icn3d.renderer.domElement.toBlob(function(data) {
                if(bAddURL) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var arrayBuffer = e.target.result; // or = reader.result;

                        var url = me.shareLinkUrl();

                        var text = "\nShare Link: " + url;
                        blob = me.getBlobFromBufferAndText(arrayBuffer, text);

                        //me.createLinkForBlob(blob, filename);
                        saveAs(blob, filename);

                        return;
                    };

                    reader.readAsArrayBuffer(data);
                }
                else {
                    blob = data;

                    //me.createLinkForBlob(blob, filename);
                    saveAs(blob, filename);

                    return;
                }
            });
        }
    }
    else if(type === 'html') {
        var dataStr = text;
        var data = decodeURIComponent(dataStr);

        blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
    }
    else if(type === 'text') {
        //var dataStr = text;
        //var data = decodeURIComponent(dataStr);

        //blob = new Blob([data],{ type: "text;charset=utf-8;"});

        var data = text; // here text is an array of text

        blob = new Blob(data,{ type: "text;charset=utf-8;"});
    }
    else if(type === 'binary') {
        var data = text; // here text is an array of blobs

        //blob = new Blob([data],{ type: "application/octet-stream"});
        blob = new Blob(data,{ type: "application/octet-stream"});
    }

/*
    //https://github.com/mholt/PapaParse/issues/175
    //IE11 & Edge
    if(me.isIE() && window.navigator.msSaveBlob){
        navigator.msSaveBlob(blob, filename);
    } else {
        //In FF link must be added to DOM to be clicked
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
*/

    //https://github.com/eligrey/FileSaver.js/
    saveAs(blob, filename);
};


iCn3DUI.prototype.isMobile = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

iCn3DUI.prototype.isMac = function() {
    return /Mac/i.test(navigator.userAgent);
};

iCn3DUI.prototype.isSessionStorageSupported = function() {
  var testKey = 'test';
  try {
    sessionStorage.setItem(testKey, '1');
    sessionStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

iCn3DUI.prototype.resizeCanvas = function (width, height, bForceResize, bDraw) { var me = this;
  if( (bForceResize !== undefined && bForceResize) || (me.cfg.resize !== undefined && me.cfg.resize) ) {
    //var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
    var heightTmp = height;
    $("#" + me.pre + "canvas").width(width).height(heightTmp);

    $("#" + me.pre + "viewer").width(width).height(height);

    me.icn3d.setWidthHeight(width, heightTmp);

    if(bDraw === undefined || bDraw) {
        me.icn3d.draw();
    }
  }
};

iCn3DUI.prototype.handleContextLost = function() { var me = this;
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

        me.icn3d.renderer = new THREE.WebGLRenderer({
            canvas: me.icn3d.container.get(0),
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });

        me.icn3d.draw();

    }, false);
};

iCn3DUI.prototype.windowResize = function() { var me = this;
    if(me.cfg.resize !== undefined && me.cfg.resize && !me.isMobile() ) {
        $(window).resize(function() {
            me.WIDTH = $( window ).width();
            me.HEIGHT = $( window ).height();

            var width = me.WIDTH - me.LESSWIDTH_RESIZE;
            var height = me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;

            if(me.icn3d !== undefined) me.resizeCanvas(width, height);
        });
    }
};

iCn3DUI.prototype.setViewerWidthHeight = function() { var me = this;
    me.WIDTH = $( window ).width();
    me.HEIGHT = $( window ).height();

    var viewer_width = $( "#" + me.pre + "viewer" ).width();
    var viewer_height = $( "#" + me.pre + "viewer" ).height();

    if(viewer_width && me.WIDTH > viewer_width) me.WIDTH = viewer_width;
    if(viewer_height && me.HEIGHT > viewer_height) me.HEIGHT = viewer_height;

    if(me.isMac() && me.isMobile()) {
      if(me.WIDTH < me.MENU_WIDTH) me.WIDTH = me.MENU_WIDTH;

      me.HEIGHT = $( window ).height() / $( window ).width() * me.MENU_WIDTH;
    }

    if(me.cfg.width.toString().indexOf('%') === -1) {
        me.WIDTH = parseInt(me.cfg.width) + me.LESSWIDTH;
    }

    if(me.cfg.height.toString().indexOf('%') === -1) {
        me.HEIGHT = parseInt(me.cfg.height) + me.EXTRAHEIGHT + me.LESSHEIGHT;
    }
};

iCn3DUI.prototype.shareLinkUrl = function() { var me = this;
       var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?";

       var pos = -1;
       if(me.cfg.inpara !== undefined) pos = me.cfg.inpara.indexOf('&command=');
       var inparaWithoutCommand = (pos !== -1 ) ? me.cfg.inpara.substr(0, pos) : me.cfg.inpara;

       var start = 0;
       if(inparaWithoutCommand !== undefined) {
         url += inparaWithoutCommand.substr(1) + '&command=';
         start = 1;
       }
       else {
         url += 'command=';
         start = 0;
       }

       var transformation = {};
       transformation.factor = me.icn3d._zoomFactor;
       transformation.mouseChange = me.icn3d.mouseChange;
       transformation.quaternion = me.icn3d.quaternion;

       var bCommands = false;
       for(var i = start, il = me.icn3d.commands.length; i < il; ++i) {
           bCommands = true;

           var command_tf = me.icn3d.commands[i].split('|||');

           if(i === il - 1) {
               //var transformation = (command_tf.length > 1) ? ('|||' + command_tf[1]) : '';
               if(i !== 1 && i !== 0) {
                   url += '; ';
               }
               url += command_tf[0] + '|||' + me.getTransformationStr(transformation);
           }
           else if(i === 1) {
               url += command_tf[0];
           }
           else if(i !== 1 && i !== il - 1) {
               url += '; ' + command_tf[0];
           }
       }

       // remove "&command="
       if(!bCommands) {
           url = url.substr(0, url.length - 9);
       }

       return url;
};
