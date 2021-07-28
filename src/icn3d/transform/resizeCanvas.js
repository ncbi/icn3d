/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from '../../html/html.js';

import {UtilsCls} from '../../utils/utilsCls.js';

import {ApplyCenter} from '../display/applyCenter.js';
import {Draw} from '../display/draw.js';
import {Transform} from '../transform/transform.js';
import {LoadScript} from '../selection/loadScript.js';
import {SetStyle} from '../display/setStyle.js';

class ResizeCanvas {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Resize the canvas with the defined "width" and "height".
    resizeCanvas(width, height, bForceResize, bDraw) {var ic = this.icn3d, me = ic.icn3dui;
      if( bForceResize || ic.icn3dui.cfg.resize ) {
        //var heightTmp = parseInt(height) - ic.icn3dui.htmlCls.EXTRAHEIGHT;
        let  heightTmp = height;
        $("#" + ic.pre + "canvas").width(width).height(heightTmp);
        $("#" + ic.pre + "viewer").width(width).height(height);

        //$("div:has(#" + ic.pre + "canvas)").width(width).height(heightTmp);
        $("#" + ic.divid + " div:has(#" + ic.pre + "canvas)").width(width).height(heightTmp);

        ic.applyCenterCls.setWidthHeight(width, heightTmp);

        if(bDraw === undefined || bDraw) {
            ic.drawCls.draw();
        }
      }
    }

    windowResize() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        if(ic.icn3dui.cfg.resize && !me.utilsCls.isMobile() ) {
            $(window).resize(function() { let  ic = thisClass.icn3d;
                //ic.icn3dui.htmlCls.WIDTH = $( window ).width();
                //ic.icn3dui.htmlCls.HEIGHT = $( window ).height();
                me.utilsCls.setViewerWidthHeight(ic.icn3dui);

                let  width = ic.icn3dui.htmlCls.WIDTH; // - ic.icn3dui.htmlCls.LESSWIDTH_RESIZE;
                let  height = ic.icn3dui.htmlCls.HEIGHT; // - ic.icn3dui.htmlCls.LESSHEIGHT - ic.icn3dui.htmlCls.EXTRAHEIGHT;

                if(ic !== undefined && !ic.bFullscreen) thisClass.resizeCanvas(width, height);
            });
        }
    }

    openFullscreen(elem) {var ic = this.icn3d, me = ic.icn3dui;
      if(ic.icn3dui.bNode) return;

      if(!document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {
          if(elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if(elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
          } else if(elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
          } else if(elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
          }
      }
    }

    //Rotate the structure in one of the directions: "left", "right", "up", and "down".
    rotStruc(direction, bInitial) {var ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        if(ic.bStopRotate) return false;
        if(ic.transformCls.rotateCount > ic.transformCls.rotateCountMax) {
            // back to the original orientation
            ic.transformCls.resetOrientation();

            return false;
        }
        ++ic.transformCls.rotateCount;

        if(bInitial) {
            if(direction === 'left') {
              ic.ROT_DIR = 'left';
            }
            else if(direction === 'right') {
              ic.ROT_DIR = 'right';
            }
            else if(direction === 'up') {
              ic.ROT_DIR = 'up';
            }
            else if(direction === 'down') {
              ic.ROT_DIR = 'down';
            }
            else {
              return false;
            }
        }

        if(direction === 'left' && ic.ROT_DIR === 'left') {
          ic.transformCls.rotateLeft(1);
        }
        else if(direction === 'right' && ic.ROT_DIR === 'right') {
          ic.transformCls.rotateRight(1);
        }
        else if(direction === 'up' && ic.ROT_DIR === 'up') {
          ic.transformCls.rotateUp(1);
        }
        else if(direction === 'down' && ic.ROT_DIR === 'down') {
          ic.transformCls.rotateDown(1);
        }
        else {
          return false;
        }

        setTimeout(function(){ thisClass.rotStruc(direction); }, 100);
    }

    //Go back one step. Basically the commands are sequentially executed, but with one less step.
    back() {var ic = this.icn3d, me = ic.icn3dui;
      ic.backForward = true;
      ic.STATENUMBER--;
      // do not add to the array ic.commands
      ic.bAddCommands = false;
      ic.bAddLogs = false; // turn off log
      ic.bNotLoadStructure = true;
      if(ic.STATENUMBER < 1) {
        ic.STATENUMBER = 1;
      }
      else {
        ic.loadScriptCls.execCommands(0, ic.STATENUMBER-1, ic.STATENUMBER, true);
      }
      ic.setStyleCls.adjustIcon();
      ic.bAddCommands = true;
      ic.bAddLogs = true;
    }

    //Go forward one step. Basically the commands are sequentially executed, but with one more step.
    forward() {var ic = this.icn3d, me = ic.icn3dui;
      ic.backForward = true;
      ic.STATENUMBER++;
      // do not add to the array ic.commands
      ic.bAddCommands = false;
      ic.bAddLogs = false; // turn off log
      ic.bNotLoadStructure = true;
      if(ic.STATENUMBER > ic.commands.length) {
        ic.STATENUMBER = ic.commands.length;
      }
      else {
        ic.loadScriptCls.execCommands(0, ic.STATENUMBER-1, ic.STATENUMBER, true);
      }
      ic.setStyleCls.adjustIcon();
      ic.bAddCommands = true;
      ic.bAddLogs = true;
    }

    replayon() {var ic = this.icn3d, me = ic.icn3dui;
      ic.CURRENTNUMBER = 0;
      ic.bReplay = 1;
      $("#" + ic.pre + "replay").show();

      if(ic.commands.length > 0) {
          ic.loadScriptCls.replayFirstStep(ic.CURRENTNUMBER);

          //ic.resizeCanvasCls.closeDialogs();
      }
    }
    replayoff() {var ic = this.icn3d, me = ic.icn3dui;
        ic.bReplay = 0;
        $("#" + ic.pre + "replay").hide();
        // replay all steps
        ++ic.CURRENTNUMBER;
        ic.loadScriptCls.execCommands(ic.CURRENTNUMBER, ic.STATENUMBER-1, ic.STATENUMBER);
    }

    closeDialogs() {var ic = this.icn3d, me = ic.icn3dui;
        let  itemArray = ['dl_selectannotations', 'dl_alignment', 'dl_2ddgm', 'dl_definedsets', 'dl_graph',
            'dl_linegraph', 'dl_scatterplot', 'dl_contactmap', 'dl_allinteraction', 'dl_copyurl',
            'dl_symmetry', 'dl_symd'];
        for(let i in itemArray) {
            let  item = itemArray[i];
            if(!ic.icn3dui.cfg.notebook) {
                if($('#' + ic.pre + item).hasClass('ui-dialog-content') && $('#' + ic.pre + item).dialog( 'isOpen' )) {
                    $('#' + ic.pre + item).dialog( 'close' );
                }
            }
            else {
                $('#' + ic.pre + item).hide();
            }
        }
        if(!ic.icn3dui.cfg.notebook) this.resizeCanvas(ic.icn3dui.htmlCls.WIDTH, ic.icn3dui.htmlCls.HEIGHT, true);
    }
}

export {ResizeCanvas}
