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
      if( bForceResize || me.cfg.resize ) {
        //var heightTmp = parseInt(height) - me.htmlCls.EXTRAHEIGHT;
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

        if(me.cfg.resize && !me.utilsCls.isMobile() ) {
            $(window).resize(function() { let  ic = thisClass.icn3d;
                //me.htmlCls.WIDTH = $( window ).width();
                //me.htmlCls.HEIGHT = $( window ).height();
                me.utilsCls.setViewerWidthHeight(ic.icn3dui);

                let  width = me.htmlCls.WIDTH; // - me.htmlCls.LESSWIDTH_RESIZE;
                let  height = me.htmlCls.HEIGHT; // - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT;

                if(ic !== undefined && !ic.bFullscreen) thisClass.resizeCanvas(width, height);
            });
        }
    }

    openFullscreen(elem) {var ic = this.icn3d, me = ic.icn3dui;
      if(me.bNode) return;

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
        //let  itemArray = ['dl_selectannotations', 'dl_alignment', 'dl_2ddgm', 'dl_definedsets', 'dl_graph',
        //    'dl_linegraph', 'dl_scatterplot', 'dl_contactmap', 'dl_allinteraction', 'dl_copyurl',
        //    'dl_symmetry', 'dl_symd', 'dl_rmsd', 'dl_legend', 'dl_disttable'];
        let itemArray = ['dl_2ddgm', 'dl_2dctn', 'dl_alignment', 'dl_sequence2', 'dl_definedsets', 'dl_setsmenu', 'dl_command', 'dl_setoperations', 'dl_vast', 'dl_foldseek', 'dl_mmtfid', 'dl_pdbid', 'dl_afid', 'dl_opmid', 'dl_pdbfile', 'dl_pdbfile_app', 'dl_rescolorfile', 'dl_customcolor', 'dl_align', 'dl_alignaf', 'dl_chainalign', 'dl_mutation', 'dl_mol2file', 'dl_sdffile', 'dl_xyzfile', 'dl_afmapfile', 'dl_urlfile', 'dl_mmciffile', 'dl_mmcifid', 'dl_mmdbid', 'dl_mmdbafid', 'dl_blast_rep_id', 'dl_yournote', 'dl_gi', 'dl_uniprotid', 'dl_cid', 'dl_pngimage', 'dl_state', 'dl_fixedversion', 'dl_selection', 'dl_dsn6', 'dl_dsn6url', 'dl_clr', 'dl_symmetry', 'dl_symd', 'dl_contact', 'dl_hbonds', 'dl_realign', 'dl_realignbystruct', 'dl_allinteraction', 'dl_interactionsorted', 'dl_linegraph', 'dl_linegraphcolor', 'dl_scatterplot', 'dl_scatterplotcolor', 'dl_contactmap', 'dl_alignerrormap', 'dl_elecmap2fofc', 'dl_elecmapfofc', 'dl_emmap', 'dl_aroundsphere', 'dl_adjustmem', 'dl_selectplane', 'dl_addlabel', 'dl_addlabelselection', 'dl_labelColor', 'dl_distance', 'dl_stabilizer', 'dl_disttwosets', 'dl_distmanysets', 'dl_stabilizer_rm', 'dl_thickness', 'dl_thickness2', 'dl_addtrack', 'dl_addtrack_tabs', 'dl_saveselection', 'dl_copyurl', 'dl_selectannotations', 'dl_annotations_tabs', 'dl_anno_view_tabs', 'dl_annotations', 'dl_graph', 'dl_svgcolor', 'dl_area', 'dl_colorbyarea', 'dl_rmsd', 'dl_buriedarea', 'dl_propbypercentout', 'dl_propbybfactor', 'dl_legend', 'dl_disttable'];

        for(let i in itemArray) {
            let  item = itemArray[i];
            if(!me.cfg.notebook) {
                if($('#' + ic.pre + item).hasClass('ui-dialog-content') && $('#' + ic.pre + item).dialog( 'isOpen' )) {
                    $('#' + ic.pre + item).dialog( 'close' );
                }
            }
            else {
                $('#' + ic.pre + item).hide();
            }
        }
        if(!me.cfg.notebook) this.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
    }
}

export {ResizeCanvas}
