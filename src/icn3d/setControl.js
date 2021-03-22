/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setControl = function() { var me = this;
    // adjust the size
    this.WIDTH = this.container.width(), this.HEIGHT = this.container.height();
    this.setWidthHeight(this.WIDTH, this.HEIGHT);

    this._zoomFactor = 1.0;
    this.mouseChange = new THREE.Vector2(0,0);
    this.quaternion = new THREE.Quaternion(0,0,0,1);

    this.container.bind('contextmenu', function (e) {
        //e.preventDefault();
    });

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

      if ((!me.bControlGl && !me.controls) || (me.bControlGl && !window.controls)) return;

      me.bStopRotate = true;

      var rotAngle = (me.bShift) ? 90 : 5;

      if(!me.typetext) {
        // zoom
        if(e.keyCode === 90 ) { // Z
          var para = {};

          if(me.bControlGl) {
              if(window.cam === me.perspectiveCamera) { // perspective
                para._zoomFactor = 0.9;
              }
              else if(window.cam === me.orthographicCamera) {  // orthographics
                if(me._zoomFactor < 0.1) {
                  me._zoomFactor = 0.1;
                }
                else if(me._zoomFactor > 1) {
                  me._zoomFactor = 1;
                }

                para._zoomFactor = me._zoomFactor * 0.8;
                if(para._zoomFactor < 0.1) para._zoomFactor = 0.1;
              }
          }
          else {
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
          }

          para.update = true;
          if(me.bControlGl) {
              window.controls.update(para);
          }
          else {
              me.controls.update(para);
          }
          if(me.bRender) me.render();
        }
        else if(e.keyCode === 88 ) { // X
          var para = {};

          if(me.bControlGl) {
              if(window.cam === me.perspectiveCamera) { // perspective
                //para._zoomFactor = 1.1;
                para._zoomFactor = 1.03;
              }
              else if(window.cam === me.orthographicCamera) {  // orthographics
                if(me._zoomFactor > 10) {
                  me._zoomFactor = 10;
                }
                else if(me._zoomFactor < 1) {
                  me._zoomFactor = 1;
                }

                para._zoomFactor = me._zoomFactor * 1.01;
                if(para._zoomFactor > 10) para._zoomFactor = 10;
              }
          }
          else {
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
          }

          para.update = true;
          if(me.bControlGl) {
              window.controls.update(para);
          }
          else {
              me.controls.update(para);
          }
          if(me.bRender) me.render();
        }

        // rotate
        else if(e.keyCode === 76 ) { // L, rotate left
          var axis = new THREE.Vector3(0,1,0);
          var angle = -rotAngle / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 74 ) { // J, rotate right
          var axis = new THREE.Vector3(0,1,0);
          var angle = rotAngle / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 73 ) { // I, rotate up
          var axis = new THREE.Vector3(1,0,0);
          var angle = -rotAngle / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }
        else if(e.keyCode === 77 ) { // M, rotate down
          var axis = new THREE.Vector3(1,0,0);
          var angle = rotAngle / 180.0 * Math.PI;

          me.setRotation(axis, angle);
        }

        else if(e.keyCode === 65 ) { // A, alternate
           if(Object.keys(me.structures).length > 1) {
               me.alternateWrapper();
           }
        }

      }
    });

    this.container.bind('mouseup touchend', function (e) {
        me.isDragging = false;
    });
    //this.container.bind('mousedown touchstart', function (e) {
    this.container.bind('mousedown', function (e) {
        //e.preventDefault();
        me.isDragging = true;

        if (!me.scene) return;

        me.bStopRotate = true;

        if(me.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
            me.highlightlevel = me.pk;

            var bClick = true;
            me.rayCaster(e, bClick);
        }

        if(me.bControlGl) {
          window.controls.handleResize();
          window.controls.update();
        }
        else {
          me.controls.handleResize();
          me.controls.update();
        }

        if(me.bRender) me.render();
    });

    this.container.bind('touchstart', function (e) {
        //e.preventDefault();
        me.isDragging = true;

        if (!me.scene) return;

        me.bStopRotate = true;

        //$("[id$=popup]").hide();
        $("#" + me.pre + "popup").hide();

        //var bClick = false;
        var bClick = true;
        me.rayCaster(e, bClick);

        if(me.bControlGl) {
          window.controls.handleResize();
          window.controls.update();
        }
        else {
          me.controls.handleResize();
          me.controls.update();
        }

        if(me.bRender) me.render();
    });

    this.container.bind('mousemove touchmove', function (e) {
        //e.preventDefault();
        if (!me.scene) return;
        // no action when no mouse button is clicked and no key was down
        //if (!me.isDragging) return;

        //$("[id$=popup]").hide();
        $("#" + me.pre + "popup").hide();

        var bClick = false;
        me.rayCaster(e, bClick);

        if(me.bControlGl) {
          window.controls.handleResize();
          window.controls.update();
        }
        else {
          me.controls.handleResize();
          me.controls.update();
        }

        if(me.bRender) me.render();
    });
    this.container.bind('mousewheel', function (e) {
        //e.preventDefault();
        if (!me.scene) return;

        me.bStopRotate = true;

        if(me.bControlGl) {
          window.controls.handleResize();
          window.controls.update();
        }
        else {
          me.controls.handleResize();
          me.controls.update();
        }

        if(me.bRender) me.render();
    });
    this.container.bind('DOMMouseScroll', function (e) {
        //e.preventDefault();
        if (!me.scene) return;

        me.bStopRotate = true;

        if(me.bControlGl) {
          window.controls.handleResize();
          window.controls.update();
        }
        else {
          me.controls.handleResize();
          me.controls.update();
        }

        if(me.bRender) me.render();
    });
};
