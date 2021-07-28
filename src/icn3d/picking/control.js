/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ApplyCenter} from '../display/applyCenter.js';
import {Alternate} from '../display/alternate.js';
import {Draw} from '../display/draw.js';
import {Transform} from '../transform/transform.js';
import {Ray} from '../picking/ray.js';

class Control {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    setControl() { let  ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        let  thisClass = this;

        // adjust the size
        ic.WIDTH = ic.container.width(), ic.HEIGHT = ic.container.height();
        ic.applyCenterCls.setWidthHeight(ic.WIDTH, ic.HEIGHT);

        ic._zoomFactor = 1.0;
        ic.mouseChange = new THREE.Vector2(0,0);
        ic.quaternion = new THREE.Quaternion(0,0,0,1);

        ic.container.bind('contextmenu', function (e) {
        //document.getElementById(ic.id).addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        // key event has to use the document because it requires the focus
        ic.typetext = false;

        //http://unixpapa.com/js/key.html
        $(document).bind('keyup', function (e) {
        //document.addEventListener('keyup', function (e) {
          if(e.keyCode === 16) { // shiftKey
              ic.bShift = false;
          }
          if(e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) { // ctrlKey or apple command key
              ic.bCtrl = false;
          }
        });

        $('input[type=text], textarea').focus(function() {
            ic.typetext = true;
        });

        $('input[type=text], textarea').blur(function() {
            ic.typetext = false;
        });

        $(document).bind('keydown', function (e) {
        //document.addEventListener('keydown', function (e) {
          if(e.shiftKey || e.keyCode === 16) {
              ic.bShift = true;
          }
          if(e.ctrlKey || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) {
              ic.bCtrl = true;
          }

          if ((!ic.bControlGl && !ic.controls) || (ic.bControlGl && !window.controls)) return;

          ic.bStopRotate = true;

          let  rotAngle = (ic.bShift) ? 90 : 5;

          if(!ic.typetext) {
            // zoom
            if(e.keyCode === 90 ) { // Z
              let  para = {};

              if(ic.bControlGl && !ic.icn3dui.bNode) {
                  if(window.cam === ic.perspectiveCamera) { // perspective
                    para._zoomFactor = 0.9;
                  }
                  else if(window.cam === ic.orthographicCamera) {  // orthographics
                    if(ic._zoomFactor < 0.1) {
                      ic._zoomFactor = 0.1;
                    }
                    else if(ic._zoomFactor > 1) {
                      ic._zoomFactor = 1;
                    }

                    para._zoomFactor = ic._zoomFactor * 0.8;
                    if(para._zoomFactor < 0.1) para._zoomFactor = 0.1;
                  }
              }
              else {
                  if(ic.cam === ic.perspectiveCamera) { // perspective
                    para._zoomFactor = 0.9;
                  }
                  else if(ic.cam === ic.orthographicCamera) {  // orthographics
                    if(ic._zoomFactor < 0.1) {
                      ic._zoomFactor = 0.1;
                    }
                    else if(ic._zoomFactor > 1) {
                      ic._zoomFactor = 1;
                    }

                    para._zoomFactor = ic._zoomFactor * 0.8;
                    if(para._zoomFactor < 0.1) para._zoomFactor = 0.1;
                  }
              }

              para.update = true;
              if(ic.bControlGl && !ic.icn3dui.bNode) {
                  window.controls.update(para);
              }
              else {
                  ic.controls.update(para);
              }
              if(ic.bRender) ic.drawCls.render();
            }
            else if(e.keyCode === 88 ) { // X
              let  para = {};

              if(ic.bControlGl && !ic.icn3dui.bNode) {
                  if(window.cam === ic.perspectiveCamera) { // perspective
                    //para._zoomFactor = 1.1;
                    para._zoomFactor = 1.03;
                  }
                  else if(window.cam === ic.orthographicCamera) {  // orthographics
                    if(ic._zoomFactor > 10) {
                      ic._zoomFactor = 10;
                    }
                    else if(ic._zoomFactor < 1) {
                      ic._zoomFactor = 1;
                    }

                    para._zoomFactor = ic._zoomFactor * 1.01;
                    if(para._zoomFactor > 10) para._zoomFactor = 10;
                  }
              }
              else {
                  if(ic.cam === ic.perspectiveCamera) { // perspective
                    //para._zoomFactor = 1.1;
                    para._zoomFactor = 1.03;
                  }
                  else if(ic.cam === ic.orthographicCamera) {  // orthographics
                    if(ic._zoomFactor > 10) {
                      ic._zoomFactor = 10;
                    }
                    else if(ic._zoomFactor < 1) {
                      ic._zoomFactor = 1;
                    }

                    para._zoomFactor = ic._zoomFactor * 1.01;
                    if(para._zoomFactor > 10) para._zoomFactor = 10;
                  }
              }

              para.update = true;
              if(ic.bControlGl && !ic.icn3dui.bNode) {
                  window.controls.update(para);
              }
              else {
                  ic.controls.update(para);
              }
              if(ic.bRender) ic.drawCls.render();
            }

            // rotate
            else if(e.keyCode === 76 ) { // L, rotate left
              let  axis = new THREE.Vector3(0,1,0);
              let  angle = -rotAngle / 180.0 * Math.PI;

              ic.transformCls.setRotation(axis, angle);
            }
            else if(e.keyCode === 74 ) { // J, rotate right
              let  axis = new THREE.Vector3(0,1,0);
              let  angle = rotAngle / 180.0 * Math.PI;

              ic.transformCls.setRotation(axis, angle);
            }
            else if(e.keyCode === 73 ) { // I, rotate up
              let  axis = new THREE.Vector3(1,0,0);
              let  angle = -rotAngle / 180.0 * Math.PI;

              ic.transformCls.setRotation(axis, angle);
            }
            else if(e.keyCode === 77 ) { // M, rotate down
              let  axis = new THREE.Vector3(1,0,0);
              let  angle = rotAngle / 180.0 * Math.PI;

              ic.transformCls.setRotation(axis, angle);
            }

            else if(e.keyCode === 65 ) { // A, alternate
               if(Object.keys(ic.structures).length > 1) {
                   ic.alternateCls.alternateWrapper();
               }
            }

          }
        });

        ic.container.bind('mouseup', function (e) {
        //document.getElementById(ic.id).addEventListener('mouseup', function (e) {
            ic.isDragging = false;
        });
        ic.container.bind('touchend', function (e) {
        //document.getElementById(ic.id).addEventListener('touchend', function (e) {
            ic.isDragging = false;
        });

        ic.container.bind('mousedown', function (e) {
        //document.getElementById(ic.id).addEventListener('mousedown', function (e) {
            //e.preventDefault();
            ic.isDragging = true;

            if (!ic.scene) return;

            ic.bStopRotate = true;

            if(ic.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
                ic.highlightlevel = ic.pk;

                let  bClick = true;
                ic.rayCls.rayCaster(e, bClick);
            }

            if(ic.bControlGl && !ic.icn3dui.bNode) {
              window.controls.handleResize();
              window.controls.update();
            }
            else {
              ic.controls.handleResize();
              ic.controls.update();
            }

            if(ic.bRender) ic.drawCls.render();
        });

        ic.container.bind('touchstart', function (e) {
        //document.getElementById(ic.id).addEventListener('touchstart', function (e) {
            //e.preventDefault();
            e.preventDefault();
            ic.isDragging = true;

            if (!ic.scene) return;

            ic.bStopRotate = true;

            //$("[id$=popup]").hide();
            $("#" + ic.pre + "popup").hide();

            //var bClick = false;
            let  bClick = true;
            ic.rayCls.rayCaster(e, bClick);

            if(ic.bControlGl && !ic.icn3dui.bNode) {
              window.controls.handleResize();
              window.controls.update();
            }
            else {
              ic.controls.handleResize();
              ic.controls.update();
            }

            if(ic.bRender) ic.drawCls.render();
        });

        ic.container.bind('mousemove touchmove', function (e) {
            thisClass.mouseMove(e);
        });
/*
        document.getElementById(ic.id).addEventListener('mousemove', function (e) {
            thisClass.mouseMove(e);
        });
        document.getElementById(ic.id).addEventListener('touchmove', function (e) {
            thisClass.mouseMove(e);
        });
*/
        ic.container.bind('mousewheel', function (e) {
        //document.getElementById(ic.id).addEventListener('mousewheel', function (e) {
            //e.preventDefault();
            e.preventDefault();
            if (!ic.scene) return;

            ic.bStopRotate = true;

            if(ic.bControlGl && !ic.icn3dui.bNode) {
              window.controls.handleResize();
              window.controls.update();
            }
            else {
              ic.controls.handleResize();
              ic.controls.update();
            }

            if(ic.bRender) ic.drawCls.render();
        });
        ic.container.bind('DOMMouseScroll', function (e) {
        //document.getElementById(ic.id).addEventListener('DOMMouseScroll', function (e) {
            //e.preventDefault();
            e.preventDefault();
            if (!ic.scene) return;

            ic.bStopRotate = true;

            if(ic.bControlGl && !ic.icn3dui.bNode) {
              window.controls.handleResize();
              window.controls.update();
            }
            else {
              ic.controls.handleResize();
              ic.controls.update();
            }

            if(ic.bRender) ic.drawCls.render();
        });
    }

    mouseMove(e) { let  ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        //e.preventDefault();
        e.preventDefault();
        if (!ic.scene) return;
        // no action when no mouse button is clicked and no key was down
        //if (!ic.isDragging) return;

        //$("[id$=popup]").hide();
        $("#" + ic.pre + "popup").hide();

        let  bClick = false;
        ic.rayCls.rayCaster(e, bClick);

        if(ic.bControlGl && !ic.icn3dui.bNode) {
          window.controls.handleResize();
          window.controls.update();

          for(let divid in window.icn3duiHash) {
              let  icTmp = window.icn3duiHash[divid].icn3d;
              if(icTmp.bRender) icTmp.drawCls.render();
          }
        }
        else {
          ic.controls.handleResize();
          ic.controls.update();

          if(ic.bRender) ic.drawCls.render();
        }
    }

}

export {Control}
