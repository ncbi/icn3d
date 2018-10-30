/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

if (typeof jQuery === 'undefined') { throw new Error('iCn3D requires jQuery') }

var iCn3D = function (id) {
    this.REVISION = '1.3';
    this.id = id;

    this.container = $('#' + id);

    this.overdraw = 0;

    this.bDrawn = false;

    this.bSecondaryStructure = false;

    this.bHighlight = 1; // undefined: no highlight, 1: highlight by outline, 2: highlight by 3D object
    this.renderOrderPicking = -1; // less than 0, the default order

    this.ALTERNATE_STRUCTURE = -1;

    if(Detector.webgl){
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container.get(0),
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });

        this.overdraw = 0;
    }
    else {
        alert("Currently your web browser has a problem on WebGL. If you are using Chrome, open a new tab for the same URL and WebGL may work again.");
/*
        alert("Currently your web browser has a problem on WebGL, and CanvasRenderer instead of WebGLRenderer is used. If you are using Chrome, open a new tab for the same URL and WebGL may work again.");

        this.renderer = new THREE.CanvasRenderer({
            canvas: this.container.get(0)
        });

        //http://threejs.org/docs/api/materials/Material.html
        this.overdraw = 0.5;

        // only WebGL support outlines using ShaderMaterial
        this.bHighlight = 2;
*/
    }

    this.matShader = this.setOutlineColor('yellow');
    this.frac = new THREE.Color(0.1, 0.1, 0.1);

    // mobile has a problem when the scaleFactor is 2.0
    // the scaleFactor improve the image quality
    this.scaleFactor = 1.5;

    // Impostor shaders
    this.bImpo = true;
    this.bExtFragDepth = this.renderer.extensions.get( "EXT_frag_depth" );
    if(!this.bExtFragDepth) {
        this.bImpo = false;
        console.log('EXT_frag_depth is NOT supported. All spheres and cylinders are drawn using geometry.');
    }
    else {
        console.log('EXT_frag_depth is supported. All spheres and cylinders are drawn using shaders.');
    }

    this.bInstanced = this.renderer.extensions.get( "ANGLE_instanced_arrays" );
    if(!this.bInstanced) {
        console.log('ANGLE_instanced_arrays is NOT supported. Assembly is drawn by making copies of the asymmetric unit.');
    }
    else {
        console.log('ANGLE_instanced_arrays is supported. Assembly is drawn with one copy of the asymmetric unit using hardware instancing.');
    }

        // cylinder impostor
    this.posArray = new Array();
    this.colorArray = new Array();

    this.pos2Array = new Array();
    this.color2Array = new Array();

    this.radiusArray = new Array();

        // sphere impostor
    this.posArraySphere = new Array();
    this.colorArraySphere = new Array();
    this.radiusArraySphere = new Array();

    // adjust the size
    this.WIDTH = this.container.width(), this.HEIGHT = this.container.height();
    this.setWidthHeight(this.WIDTH, this.HEIGHT);

    this.axis = false;  // used to turn on and off xyz axes

    // pk
    this.pk = 1; // 0: no pk, 1: pk on atoms, 2: pk on residues, 3: pk on strand/helix/coil, 4: pk on chain
    this.highlightlevel = 1; // 1: highlight on atoms, 2: highlight on residues, 3: highlight on strand/helix/coil 4: highlight on chain 5: highlight on structure

    this.pickpair = false; // used for pk pair of atoms for label and distance
    this.pAtomNum = 0;

    this.pAtom = undefined;
    this.pAtom2 = undefined;

    this.bCtrl = false; // if true, union selection on sequence window or on 3D structure
    this.bShift = false; // if true, select a range on 3D structure

    this.bStopRotate = false; // by default, do not stop the possible automatic rotation
    this.bCalphaOnly = false; // by default the input has both Calpha and O, used for drawing strands. If atoms have Calpha only, the orientation of the strands is random
//    this.bSSOnly = false; // a flag to turn on when only helix and bricks are available to draw 3D dgm

    this.bAllAtoms = true; // no need to adjust atom for strand style

    this.bConsiderNeighbors = false; // a flag to show surface considering the neighboring atoms or not

    this.bShowCrossResidueBond = false;

    this.effects = {
        //'anaglyph': new THREE.AnaglyphEffect(this.renderer),
        //'parallax barrier': new THREE.ParallaxBarrierEffect(this.renderer),
        //'oculus rift': new THREE.OculusRiftEffect(this.renderer),
        //'stereo': new THREE.StereoEffect(this.renderer),
        'none': this.renderer
    };

    this.maxD = 500; // size of the molecule
    this.oriMaxD = this.maxD; // size of the molecule
    //this.cam_z = -150;

    this.cam_z = this.maxD * 2; // when zooming in, it gets dark if the camera is in front
    //this.cam_z = -this.maxD * 2;

    // these variables will not be cleared for each structure
    this.commands = []; // a list of commands, ordered by the operation steps. Each operation will be converted into a command. this command list can be used to go backward and forward.
    this.optsHistory = []; // a list of options corresponding to this.commands.
    this.logs = []; // a list of comands and other logs, ordered by the operation steps.

    this.bRender = true; // a flag to turn off rendering when loading state file

    // Default values
    this.hColor = new THREE.Color(0xFFFF00);

    this.sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 32, 1);
    this.cylinderGeometryOutline = new THREE.CylinderGeometry(1, 1, 1, 32, 1, true);
    this.axisDIV = 5; // 3
    this.strandDIV = 6;
    this.tubeDIV = 8;
    this.nucleicAcidStrandDIV = 6; //4;

    this.linewidth = 1;
    this.hlLineRadius = 0.1; // style line, highlight
    //this.curveWidth = 3;

    this.lineRadius = 0.1; // hbonds, distance lines
    this.coilWidth = 0.3; //0.4; // style cartoon-coil
    this.cylinderRadius = 0.4; // style stick
    this.traceRadius = 0.4; //0.2; // c alpha trace, nucleotide stick
    this.dotSphereScale = 0.3; // style ball and stick, dot
    this.sphereRadius = 1.5; // style sphere
    this.cylinderHelixRadius = 1.6; // style sylinder and plate

    this.ribbonthickness = 0.2; // 0.4; // style ribbon, nucleotide cartoon, stand thickness
    this.helixSheetWidth = 1.3; // style ribbon, nucleotide cartoon, stand thickness
    this.nucleicAcidWidth = 0.8; // nucleotide cartoon

    this.threshbox = 180; // maximum possible boxsize, default 180
    this.maxAtoms3DMultiFile = 40000; // above the threshold, multiple files wil be output for 3D printing

    this.LABELSIZE = 30;

    this.opts = {
        camera: 'perspective',
        background: 'transparent',
        color: 'chain',
        sidec: 'nothing',
        proteins: 'ribbon',
        nucleotides: 'nucleotide cartoon',
        surface: 'nothing',
        wireframe: 'no',
        map: 'nothing',
        mapwireframe: 'yes',
        opacity: '1.0',
        chemicals: 'stick',
        water: 'nothing',
        ions: 'sphere',
        //labels: 'no',
        //effect: 'none',
        hbonds: 'no',
        //stabilizer: 'no',
        ssbonds: 'no',
        //ncbonds: 'no',
        labels: 'no',
        lines: 'no',
        rotationcenter: 'molecule center',
        axis: 'no',
        fog: 'no',
        slab: 'no',
        pk: 'residue',
        nucleotides: 'nucleotide cartoon',
        chemicalbinding: 'hide'
    };

    this._zoomFactor = 1.0;
    this.mouseChange = new THREE.Vector2(0,0);
    this.quaternion = new THREE.Quaternion(0,0,0,1);

    var me = this;
    this.container.bind('contextmn', function (e) {
        e.preventDefault();
    });

    me.switchHighlightLevel();

    // key event has to use the document because it requires the focus
    me.typetext = false;

    //http://unixpapa.com/js/key.html
    $(document).bind('keyup', function (e) {
      if(e.keyCode === 16) { // shiftKey
          me.bShift = false;
      }
      if(e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) { // ctrlKey or apple command key
          me.bCtrl = false;
      }
    });

    $('input[type=text], textarea').focus(function() {
        me.typetext = true;
    });

    $('input[type=text], textarea').blur(function() {
        me.typetext = false;
    });

    $(document).bind('keydown', function (e) {
      if(e.shiftKey || e.keyCode === 16) {
          me.bShift = true;
      }
      if(e.ctrlKey || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) {
          me.bCtrl = true;
      }

      if (!me.controls) return;

      me.bStopRotate = true;

      if(!me.typetext) {
        // zoom
        if(e.keyCode === 90 ) { // Z
          var para = {};

          if(me.cam === me.perspectiveCamera) { // perspective
            para._zoomFactor = 0.9;
          }
          else if(me.cam === me.orthographicCamera) {  // orthographics
            if(me._zoomFactor < 0.1) {
              me._zoomFactor = 0.1;
            }
            else if(me._zoomFactor > 1) {
              me._zoomFactor = 1;
            }

            para._zoomFactor = me._zoomFactor * 0.8;
            if(para._zoomFactor < 0.1) para._zoomFactor = 0.1;
          }

          para.update = true;
          me.controls.update(para);
          me.render();
        }
        else if(e.keyCode === 88 ) { // X
          var para = {};

          if(me.cam === me.perspectiveCamera) { // perspective
            //para._zoomFactor = 1.1;
            para._zoomFactor = 1.03;
          }
          else if(me.cam === me.orthographicCamera) {  // orthographics
            if(me._zoomFactor > 10) {
              me._zoomFactor = 10;
            }
            else if(me._zoomFactor < 1) {
              me._zoomFactor = 1;
            }

            para._zoomFactor = me._zoomFactor * 1.01;
            if(para._zoomFactor > 10) para._zoomFactor = 10;
          }

          para.update = true;
          me.controls.update(para);
          me.render();
        }

        // rotate
        else if(e.keyCode === 76 ) { // L, rotate left
          var axis = new THREE.Vector3(0,1,0);
          var angle = -5.0 / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 74 ) { // J, rotate right
          var axis = new THREE.Vector3(0,1,0);
          var angle = 5.0 / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 73 ) { // I, rotate up
          var axis = new THREE.Vector3(1,0,0);
          var angle = -5.0 / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 77 ) { // M, rotate down
          var axis = new THREE.Vector3(1,0,0);
          var angle = 5.0 / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }

        else if(e.keyCode === 65 ) { // A, alternate
           if(Object.keys(me.structures).length > 1) {
               me.alternateStructures();
           }
        }

      }
    });

    this.container.bind('mouseup touchend', function (e) {
        me.isDragging = false;
    });
    //this.container.bind('mousedown touchstart', function (e) {
    this.container.bind('mousedown', function (e) {
        e.preventDefault();
        me.isDragging = true;

        if (!me.scene) return;

        me.bStopRotate = true;

        if(me.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
            me.highlightlevel = me.pk;

            var bClick = true;
            me.rayCaster(e, bClick);
        }

        me.controls.handleResize();
        me.controls.update();
        me.render();
    });

    this.container.bind('touchstart', function (e) {
        e.preventDefault();
        me.isDragging = true;

        if (!me.scene) return;

        me.bStopRotate = true;

        $("[id$=popup]").hide();

        var bClick = false;
        me.rayCaster(e, bClick);

        me.controls.handleResize();
        me.controls.update();
        me.render();
    });

    this.container.bind('mousemove touchmove', function (e) {
        e.preventDefault();
        if (!me.scene) return;
        // no action when no mouse button is clicked and no key was down
        //if (!me.isDragging) return;

        $("[id$=popup]").hide();

        var bClick = false;
        me.rayCaster(e, bClick);

        if(me.isDragging) {
            me.controls.handleResize();
            me.controls.update();
            me.render();
        }
    });
    this.container.bind('mousewheel', function (e) {
        e.preventDefault();
        if (!me.scene) return;

        me.bStopRotate = true;

        me.controls.handleResize();
        me.controls.update();

        me.render();
    });
    this.container.bind('DOMMouseScroll', function (e) {
        e.preventDefault();
        if (!me.scene) return;

        me.bStopRotate = true;

        me.controls.handleResize();
        me.controls.update();

        me.render();
    });
};

iCn3D.prototype = {

    constructor: iCn3D,

    rayCaster: function(e, bClick) { var me = this;
        var x = e.pageX, y = e.pageY;
        if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
            x = e.originalEvent.targetTouches[0].pageX;
            y = e.originalEvent.targetTouches[0].pageY;
        }

        var popupX = x - me.container.offset().left;
        var popupY = y - me.container.offset().top;

        //me.isDragging = true;

        // see ref http://soledadpenades.com/articles/three-js-tutorials/object-pk/
        //if(me.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
        //    me.highlightlevel = me.pk;

            me.mouse.x = ( (x - me.container.offset().left) / me.container.width() ) * 2 - 1;
            me.mouse.y = - ( (y - me.container.offset().top) / me.container.height() ) * 2 + 1;

            var mouse3 = new THREE.Vector3();
            mouse3.x = me.mouse.x;
            mouse3.y = me.mouse.y;
            //mouse3.z = 0.5;
            if(this.cam_z > 0) {
              mouse3.z = -1.0; // between -1 to 1. The z positio of mouse in the real world should be between the camera and the target."-1" worked in our case.
            }
            else {
              mouse3.z = 1.0; // between -1 to 1. The z positio of mouse in the real world should be between the camera and the target."-1" worked in our case.
            }

            // similar to setFromCamera() except mouse3.z is the opposite sign from the value in setFromCamera()
            if(me.cam === me.perspectiveCamera) { // perspective
                if(this.cam_z > 0) {
                  mouse3.z = -1.0;
                }
                else {
                  mouse3.z = 1.0;
                }
                //me.projector.unprojectVector( mouse3, me.cam );  // works for all versions
                mouse3.unproject(me.cam );  // works for all versions
                me.raycaster.set(me.cam.position, mouse3.sub(me.cam.position).normalize()); // works for all versions
            }
            else if(me.cam === me.orthographicCamera) {  // orthographics
                if(this.cam_z > 0) {
                  mouse3.z = 1.0;
                }
                else {
                  mouse3.z = -1.0;
                }
                //me.projector.unprojectVector( mouse3, me.cam );  // works for all versions
                mouse3.unproject(me.cam );  // works for all versions
                me.raycaster.set(mouse3, new THREE.Vector3(0,0,-1).transformDirection( me.cam.matrixWorld )); // works for all versions
            }

            var intersects = me.raycaster.intersectObjects( me.objects ); // not all "mdl" group will be used for pk

            var bFound = false;

            var position = me.mdl.position;
            if ( intersects.length > 0 ) {
                // the intersections are sorted so that the closest point is the first one.
                intersects[ 0 ].point.sub(position); // mdl.position was moved to the original (0,0,0) after reading the molecule coordinates. The raycasting was done based on the original. The positio of the ooriginal should be substracted.

                var threshold = 0.5;
                var atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold); // the second parameter is the distance threshold. The first matched atom will be returned. Use 1 angstrom, not 2 angstrom. If it's 2 angstrom, other atom will be returned.

                while(!atom && threshold < 10) {
                    threshold = threshold + 0.5;
                    atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold);
                }

                if(atom) {
                    bFound = true;
                    if(me.pickpair) {
                      if(me.pAtomNum % 2 === 0) {
                        me.pAtom = atom;
                      }
                      else {
                        me.pAtom2 = atom;
                      }

                      ++me.pAtomNum;
                    }
                    else {
                      me.pAtom = atom;
                    }

                    if(bClick) {
                      me.showPicking(atom);
                    }
                    else {
                      me.showPicking(atom, popupX, popupY);
                    }
                }
                else {
                    console.log("No atoms were found in 10 andstrom range");
                }
            } // end if

            if(!bFound) {
                intersects = me.raycaster.intersectObjects( me.objects_ghost ); // not all "mdl" group will be used for pk

                position = me.mdl_ghost.position;
                if ( intersects.length > 0 ) {
                    // the intersections are sorted so that the closest point is the first one.
                    intersects[ 0 ].point.sub(position); // mdl.position was moved to the original (0,0,0) after reading the molecule coordinates. The raycasting was done based on the original. The positio of the ooriginal should be substracted.

                    var threshold = 0.5;
                    var atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold); // the second parameter is the distance threshold. The first matched atom will be returned. Use 1 angstrom, not 2 angstrom. If it's 2 angstrom, other atom will be returned.

                    while(!atom && threshold < 10) {
                        threshold = threshold + 0.5;
                        atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold);
                    }

                    if(atom) {
                        if(me.pickpair) {
                          if(me.pAtomNum % 2 === 0) {
                            me.pAtom = atom;
                          }
                          else {
                            me.pAtom2 = atom;
                          }

                          ++me.pAtomNum;
                        }
                        else {
                          me.pAtom = atom;
                        }

                        if(bClick) {
                          me.showPicking(atom);
                        }
                        else {
                          me.showPicking(atom, popupX, popupY);
                        }
                    }
                    else {
                        console.log("No atoms were found in 10 andstrom range");
                    }
                } // end if
            }
        //}
    },

    setRotation: function(axis, angle) { var me = this;
          axis.applyQuaternion( me.cam.quaternion ).normalize();

          var quaternion = new THREE.Quaternion();
          quaternion.setFromAxisAngle( axis, -angle );

          var para = {};
          para.quaternion = quaternion;
          para.update = true;

          me.controls.update(para);
          me.render();
    },

    setOutlineColor: function(colorStr) {
        // outline using ShaderMaterial: http://jsfiddle.net/Eskel/g593q/9/
        var shader = {
            'outline' : {
                vertex_shader: [
                    "uniform float offset;",
                    "void main() {",
                        "vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );",
                        "gl_Position = projectionMatrix * pos;",
                    "}"
                ].join("\n"),

                fragment_shader: [
                    "void main(){",
                        "gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );",
                    "}"
                ].join("\n")
            }
        };

        if(colorStr === 'yellow') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }
        else if(colorStr === 'green') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 0.0, 1.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }
        else if(colorStr === 'red') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }

        // shader
        var uniforms = {offset: {
            type: "f",
            //value: 1
            value: 0.5
          }
        };

        var outShader = shader['outline'];

        var matShader = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: outShader.vertex_shader,
            fragmentShader: outShader.fragment_shader,
            depthTest: false,
            depthWrite: false,
            needsUpdate: true
        });

        return matShader;
    },

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    setWidthHeight: function(width, height) {
        //this.renderer.setSize(width, height);

        //antialiasing by render twice large:
        //https://stackoverflow.com/questions/17224795/antialiasing-not-working-in-three-js
        this.renderer.setSize(width*this.scaleFactor, height*this.scaleFactor);
        this.renderer.domElement.style.width = width + "px";
        this.renderer.domElement.style.height = height + "px";
        this.renderer.domElement.width = width*this.scaleFactor;
        this.renderer.domElement.height = height*this.scaleFactor;

        this.container.widthInv  = 1 / (this.scaleFactor*width);
        this.container.heightInv = 1 / (this.scaleFactor*height);
        this.container.whratio = width / height;
    },

    // added nucleotides and ions
    nucleotidesArray: ['  G', '  A', '  T', '  C', '  U', ' DG', ' DA', ' DT', ' DC', ' DU'],

    ionsArray: ['  K', ' NA', ' MG', ' AL', ' CA', ' TI', ' MN', ' FE', ' NI', ' CU', ' ZN', ' AG', ' BA', '  F', ' CL', ' BR', '  I'],

    vdwRadii: { // Hu, S.Z.; Zhou, Z.H.; Tsai, K.R. Acta Phys.-Chim. Sin., 2003, 19:1073.
         H: 1.08,
        HE: 1.34,
        LI: 1.75,
        BE: 2.05,
         B: 1.47,
         C: 1.49,
         N: 1.41,
         O: 1.40,
         F: 1.39,
        NE: 1.68,
        NA: 1.84,
        MG: 2.05,
        AL: 2.11,
        SI: 2.07,
         P: 1.92,
         S: 1.82,
        CL: 1.83,
        AR: 1.93,
         K: 2.05,
        CA: 2.21,
        SC: 2.16,
        TI: 1.87,
         V: 1.79,
        CR: 1.89,
        MN: 1.97,
        FE: 1.94,
        CO: 1.92,
        NI: 1.84,
        CU: 1.86,
        ZN: 2.10,
        GA: 2.08,
        GE: 2.15,
        AS: 2.06,
        SE: 1.93,
        BR: 1.98,
        KR: 2.12,
        RB: 2.16,
        SR: 2.24,
         Y: 2.19,
        ZR: 1.86,
        NB: 2.07,
        MO: 2.09,
        TC: 2.09,
        RU: 2.07,
        RH: 1.95,
        PD: 2.02,
        AG: 2.03,
        CD: 2.30,
        IN: 2.36,
        SN: 2.33,
        SB: 2.25,
        TE: 2.23,
         I: 2.23,
        XE: 2.21,
        CS: 2.22,
        BA: 2.51,
        LA: 2.40,
        CE: 2.35,
        PR: 2.39,
        ND: 2.29,
        PM: 2.36,
        SM: 2.29,
        EU: 2.33,
        GD: 2.37,
        TB: 2.21,
        DY: 2.29,
        HO: 2.16,
        ER: 2.35,
        TM: 2.27,
        YB: 2.42,
        LU: 2.21,
        HF: 2.12,
        TA: 2.17,
         W: 2.10,
        RE: 2.17,
        OS: 2.16,
        IR: 2.02,
        PT: 2.09,
        AU: 2.17,
        HG: 2.09,
        TL: 2.35,
        PB: 2.32,
        BI: 2.43,
        PO: 2.29,
        AT: 2.36,
        RN: 2.43,
        FR: 2.56,
        RA: 2.43,
        AC: 2.60,
        TH: 2.37,
        PA: 2.43,
         U: 2.40,
        NP: 2.21,
        PU: 2.56,
        AM: 2.56,
        CM: 2.56,
        BK: 2.56,
        CF: 2.56,
        ES: 2.56,
        FM: 2.56,
    },

    covalentRadii: { // http://en.wikipedia.org/wiki/Covalent_radius
         H: 0.31,
        HE: 0.28,
        LI: 1.28,
        BE: 0.96,
         B: 0.84,
         C: 0.76,
         N: 0.71,
         O: 0.66,
         F: 0.57,
        NE: 0.58,
        NA: 1.66,
        MG: 1.41,
        AL: 1.21,
        SI: 1.11,
         P: 1.07,
         S: 1.05,
        CL: 1.02,
        AR: 1.06,
         K: 2.03,
        CA: 1.76,
        SC: 1.70,
        TI: 1.60,
         V: 1.53,
        CR: 1.39,
        MN: 1.39,
        FE: 1.32,
        CO: 1.26,
        NI: 1.24,
        CU: 1.32,
        ZN: 1.22,
        GA: 1.22,
        GE: 1.20,
        AS: 1.19,
        SE: 1.20,
        BR: 1.20,
        KR: 1.16,
        RB: 2.20,
        SR: 1.95,
         Y: 1.90,
        ZR: 1.75,
        NB: 1.64,
        MO: 1.54,
        TC: 1.47,
        RU: 1.46,
        RH: 1.42,
        PD: 1.39,
        AG: 1.45,
        CD: 1.44,
        IN: 1.42,
        SN: 1.39,
        SB: 1.39,
        TE: 1.38,
         I: 1.39,
        XE: 1.40,
        CS: 2.44,
        BA: 2.15,
        LA: 2.07,
        CE: 2.04,
        PR: 2.03,
        ND: 2.01,
        PM: 1.99,
        SM: 1.98,
        EU: 1.98,
        GD: 1.96,
        TB: 1.94,
        DY: 1.92,
        HO: 1.92,
        ER: 1.89,
        TM: 1.90,
        YB: 1.87,
        LU: 1.87,
        HF: 1.75,
        TA: 1.70,
         W: 1.62,
        RE: 1.51,
        OS: 1.44,
        IR: 1.41,
        PT: 1.36,
        AU: 1.36,
        HG: 1.32,
        TL: 1.45,
        PB: 1.46,
        BI: 1.48,
        PO: 1.40,
        AT: 1.50,
        RN: 1.50,
        FR: 2.60,
        RA: 2.21,
        AC: 2.15,
        TH: 2.06,
        PA: 2.00,
         U: 1.96,
        NP: 1.90,
        PU: 1.87,
        AM: 1.80,
        CM: 1.69,
    },

    //rasmol-like element colors
    atomColors: {
        'H': new THREE.Color(0xFFFFFF),
        'He': new THREE.Color(0xFFC0CB),
        'HE': new THREE.Color(0xFFC0CB),
        'Li': new THREE.Color(0xB22222),
        'LI': new THREE.Color(0xB22222),
        'B': new THREE.Color(0x00FF00),
        'C': new THREE.Color(0xC8C8C8),
        'N': new THREE.Color(0x8F8FFF),
        'O': new THREE.Color(0xF00000),
        'F': new THREE.Color(0xDAA520),
        'Na': new THREE.Color(0x0000FF),
        'NA': new THREE.Color(0x0000FF),
        'Mg': new THREE.Color(0x228B22),
        'MG': new THREE.Color(0x228B22),
        'Al': new THREE.Color(0x808090),
        'AL': new THREE.Color(0x808090),
        'Si': new THREE.Color(0xDAA520),
        'SI': new THREE.Color(0xDAA520),
        'P': new THREE.Color(0xFFA500),
        'S': new THREE.Color(0xFFC832),
        'Cl': new THREE.Color(0x00FF00),
        'CL': new THREE.Color(0x00FF00),
        'Ca': new THREE.Color(0x808090),
        'CA': new THREE.Color(0x808090),
        'Ti': new THREE.Color(0x808090),
        'TI': new THREE.Color(0x808090),
        'Cr': new THREE.Color(0x808090),
        'CR': new THREE.Color(0x808090),
        'Mn': new THREE.Color(0x808090),
        'MN': new THREE.Color(0x808090),
        'Fe': new THREE.Color(0xFFA500),
        'FE': new THREE.Color(0xFFA500),
        'Ni': new THREE.Color(0xA52A2A),
        'NI': new THREE.Color(0xA52A2A),
        'Cu': new THREE.Color(0xA52A2A),
        'CU': new THREE.Color(0xA52A2A),
        'Zn': new THREE.Color(0xA52A2A),
        'ZN': new THREE.Color(0xA52A2A),
        'Br': new THREE.Color(0xA52A2A),
        'BR': new THREE.Color(0xA52A2A),
        'Ag': new THREE.Color(0x808090),
        'AG': new THREE.Color(0x808090),
        'I': new THREE.Color(0xA020F0),
        'Ba': new THREE.Color(0xFFA500),
        'BA': new THREE.Color(0xFFA500),
        'Au': new THREE.Color(0xDAA520),
        'AU': new THREE.Color(0xDAA520)
    },

    defaultAtomColor: new THREE.Color(0xCCCCCC),

    stdChainColors: [
            // first 6 colors from MMDB
            new THREE.Color(0xFF00FF),
            new THREE.Color(0x0000FF),
            new THREE.Color(0x996633),
            new THREE.Color(0x00FF99),
            new THREE.Color(0xFF9900),
            new THREE.Color(0xFF6666),

            new THREE.Color(0x32CD32),
            new THREE.Color(0x1E90FF),
            new THREE.Color(0xFA8072),
            new THREE.Color(0xFFA500),
            new THREE.Color(0x00CED1),
            new THREE.Color(0xFF69B4),

            new THREE.Color(0x00FF00),
            new THREE.Color(0x0000FF),
            new THREE.Color(0xFF0000),
            new THREE.Color(0xFFFF00),
            new THREE.Color(0x00FFFF),
            new THREE.Color(0xFF00FF),

            new THREE.Color(0x3CB371),
            new THREE.Color(0x4682B4),
            new THREE.Color(0xCD5C5C),
            new THREE.Color(0xFFE4B5),
            new THREE.Color(0xAFEEEE),
            new THREE.Color(0xEE82EE),

            new THREE.Color(0x006400),
            new THREE.Color(0x00008B),
            new THREE.Color(0x8B0000),
            new THREE.Color(0xCD853F),
            new THREE.Color(0x008B8B),
            new THREE.Color(0x9400D3)
        ],

    backgroundColors: {
        black: new THREE.Color(0x000000),
         grey: new THREE.Color(0xCCCCCC),
        white: new THREE.Color(0xFFFFFF),
        transparent: new THREE.Color(0x000000)
    },

    residueColors: {
        ALA: new THREE.Color(0xC8C8C8),
        ARG: new THREE.Color(0x145AFF),
        ASN: new THREE.Color(0x00DCDC),
        ASP: new THREE.Color(0xE60A0A),
        CYS: new THREE.Color(0xE6E600),
        GLN: new THREE.Color(0x00DCDC),
        GLU: new THREE.Color(0xE60A0A),
        GLY: new THREE.Color(0xEBEBEB),
        HIS: new THREE.Color(0x8282D2),
        ILE: new THREE.Color(0x0F820F),
        LEU: new THREE.Color(0x0F820F),
        LYS: new THREE.Color(0x145AFF),
        MET: new THREE.Color(0xE6E600),
        PHE: new THREE.Color(0x3232AA),
        PRO: new THREE.Color(0xDC9682),
        SER: new THREE.Color(0xFA9600),
        THR: new THREE.Color(0xFA9600),
        TRP: new THREE.Color(0xB45AB4),
        TYR: new THREE.Color(0x3232AA),
        VAL: new THREE.Color(0x0F820F),
        ASX: new THREE.Color(0xFF69B4),
        GLX: new THREE.Color(0xFF69B4),
    },

    defaultResidueColor: new THREE.Color(0xBEA06E),

    chargeColors: {
// charged residues
        '  G': new THREE.Color(0xFF0000),
        '  A': new THREE.Color(0xFF0000),
        '  T': new THREE.Color(0xFF0000),
        '  C': new THREE.Color(0xFF0000),
        '  U': new THREE.Color(0xFF0000),
        ' DG': new THREE.Color(0xFF0000),
        ' DA': new THREE.Color(0xFF0000),
        ' DT': new THREE.Color(0xFF0000),
        ' DC': new THREE.Color(0xFF0000),
        ' DU': new THREE.Color(0xFF0000),
          'G': new THREE.Color(0xFF0000),
          'A': new THREE.Color(0xFF0000),
          'T': new THREE.Color(0xFF0000),
          'C': new THREE.Color(0xFF0000),
          'U': new THREE.Color(0xFF0000),
         'DG': new THREE.Color(0xFF0000),
         'DA': new THREE.Color(0xFF0000),
         'DT': new THREE.Color(0xFF0000),
         'DC': new THREE.Color(0xFF0000),
         'DU': new THREE.Color(0xFF0000),
        'ARG': new THREE.Color(0x0000FF),
        'LYS': new THREE.Color(0x0000FF),
        'ASP': new THREE.Color(0xFF0000),
        'GLU': new THREE.Color(0xFF0000),

// hydrophobic
        'GLY': new THREE.Color(0x888888),
        'PRO': new THREE.Color(0x888888),
        'ALA': new THREE.Color(0x888888),
        'VAL': new THREE.Color(0x888888),
        'LEU': new THREE.Color(0x888888),
        'ILE': new THREE.Color(0x888888),
        'PHE': new THREE.Color(0x888888),

// polar
        'HIS': new THREE.Color(0x888888),
        'SER': new THREE.Color(0x888888),
        'THR': new THREE.Color(0x888888),
        'ASN': new THREE.Color(0x888888),
        'GLN': new THREE.Color(0x888888),
        'TYR': new THREE.Color(0x888888),
        'MET': new THREE.Color(0x888888),
        'CYS': new THREE.Color(0x888888),
        'TRP': new THREE.Color(0x888888)
    },

    hydrophobicColors: {
// charged residues
        '  G': new THREE.Color(0x888888),
        '  A': new THREE.Color(0x888888),
        '  T': new THREE.Color(0x888888),
        '  C': new THREE.Color(0x888888),
        '  U': new THREE.Color(0x888888),
        ' DG': new THREE.Color(0x888888),
        ' DA': new THREE.Color(0x888888),
        ' DT': new THREE.Color(0x888888),
        ' DC': new THREE.Color(0x888888),
        ' DU': new THREE.Color(0x888888),
          'G': new THREE.Color(0x888888),
          'A': new THREE.Color(0x888888),
          'T': new THREE.Color(0x888888),
          'C': new THREE.Color(0x888888),
          'U': new THREE.Color(0x888888),
         'DG': new THREE.Color(0x888888),
         'DA': new THREE.Color(0x888888),
         'DT': new THREE.Color(0x888888),
         'DC': new THREE.Color(0x888888),
         'DU': new THREE.Color(0x888888),
        'ARG': new THREE.Color(0x888888),
        'LYS': new THREE.Color(0x888888),
        'ASP': new THREE.Color(0x888888),
        'GLU': new THREE.Color(0x888888),

// hydrophobic
        'GLY': new THREE.Color(0x00FF00),
        'PRO': new THREE.Color(0x00FF00),
        'ALA': new THREE.Color(0x00FF00),
        'VAL': new THREE.Color(0x00FF00),
        'LEU': new THREE.Color(0x00FF00),
        'ILE': new THREE.Color(0x00FF00),
        'PHE': new THREE.Color(0x00FF00),

// polar
        'HIS': new THREE.Color(0x888888),
        'SER': new THREE.Color(0x888888),
        'THR': new THREE.Color(0x888888),
        'ASN': new THREE.Color(0x888888),
        'GLN': new THREE.Color(0x888888),
        'TYR': new THREE.Color(0x888888),
        'MET': new THREE.Color(0x888888),
        'CYS': new THREE.Color(0x888888),
        'TRP': new THREE.Color(0x888888)
    },

    sheetcolor: 'green',

    ssColors: {
        //helix: new THREE.Color(0xFF0080),
        helix: new THREE.Color(0xFF0000),
        //sheet: new THREE.Color(0xFFC800),
        sheet: new THREE.Color(0x008000),
         coil: new THREE.Color(0x6080FF)
    },

    ssColors2: {
        //helix: new THREE.Color(0xFF0080),
        helix: new THREE.Color(0xFF0000),
        sheet: new THREE.Color(0xFFC800),
        //sheet: new THREE.Color(0x008000),
         coil: new THREE.Color(0x6080FF)
    },

    //defaultBondColor: new THREE.Color(0x2194D6),
    defaultBondColor: new THREE.Color(0xBBBBBB), // cross residue bonds

    surfaces: {
        1: undefined,
        2: undefined,
        3: undefined,
        4: undefined
    },

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    hasCovalentBond: function (atom0, atom1) {
        var r = this.covalentRadii[atom0.elem] + this.covalentRadii[atom1.elem];
        return atom0.coord.distanceToSquared(atom1.coord) < 1.3 * r * r;
    },

    init: function () {
        this.structures = {}; // structure name -> array of chains
        this.chains = {}; // structure_chain name -> atom hash
        this.residues = {}; // structure_chain_resi name -> atom hash
        this.secondaries = {}; // structure_chain_resi name -> secondary structure: 'c', 'H', or 'E'
        this.alnChains = {}; // structure_chain name -> atom hash

        this.chainsSeq = {}; // structure_chain name -> array of sequence
        this.chainsColor = {}; // structure_chain name -> color, show chain color in sequence display for mmdbid and align input
        this.chainsAn = {}; // structure_chain name -> array of annotations, such as residue number
        this.chainsAnTitle = {}; // structure_chain name -> array of annotation title

        this.alnChainsSeq = {}; // structure_chain name -> array of residue object: {mmdbid, chain, resi, resn, aligned}
        this.alnChainsAnno = {}; // structure_chain name -> array of annotations, such as residue number
        this.alnChainsAnTtl = {}; // structure_chain name -> array of annotation title

        this.dAtoms = {}; // show selected atoms
        this.hAtoms = {}; // used to change color or dislay type for certain atoms

        this.pickedAtomList = {}; // used to switch among different highlight levels

        this.prevHighlightObjects = [];
        this.prevHighlightObjects_ghost = [];
        this.prevSurfaces = [];
        this.prevMaps = [];

        this.defNames2Residues = {}; // custom defined selection name -> residue array
        this.defNames2Atoms = {}; // custom defined selection name -> atom array
        this.defNames2Descr = {}; // custom defined selection name -> description
        this.defNames2Command = {}; // custom defined selection name -> command

        this.residueId2Name = {}; // structure_chain_resi -> one letter abbreviation

        this.molTitle = "";

        this.atoms = {};
        this.dAtoms = {};
        this.hAtoms = {};
        this.proteins = {};
        this.sidec = {};
        this.nucleotides = {};
        this.nucleotidesO3 = {};

        this.chemicals = {};
        this.ions = {};
        this.water = {};
        this.calphas = {};

        this.hbondpnts = [];
        this.stabilizerpnts = [];
        this.ssbondpnts = {}; // disulfide bonds for each structure
        //this.ncbondpnts = []; // non-covalent bonds

        this.doublebonds = {};
        this.triplebonds = {};
        this.aromaticbonds = {};

        this.atomPrevColors = {};

        this.style2atoms = {}; // style -> atom hash, 13 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
        this.labels = {};     // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                            // label name could be custom, residue, schmatic, distance
        this.lines = {};     // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
                            // line name could be custom, hbond, ssbond, distance

        this.inputid = {"idtype": undefined, "id":undefined}; // support pdbid, mmdbid

        this.biomtMatrices = [];
        this.bAssembly = true;

        this.rotateCount = 0;
        this.rotateCountMax = 20;
    },

    reinitAfterLoad: function () {
        this.dAtoms = this.cloneHash(this.atoms); // show selected atoms
        this.hAtoms = this.cloneHash(this.atoms); // used to change color or dislay type for certain atoms

        this.prevHighlightObjects = [];
        this.prevHighlightObjects_ghost = [];
        this.prevSurfaces = [];
        this.prevMaps = [];

        this.labels = {};   // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                            // label name could be custom, residue, schmatic, distance
        this.lines = {};    // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
                            // line name could be custom, hbond, ssbond, distance

        this.bAssembly = true;
    }
};
