/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {SetOption} from '../display/setOption.js';
import {Draw} from '../display/draw.js';

class SetStyle {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //For a list of atoms, set the hash with style as key and atom serial as value.
    setStyle2Atoms(atoms) { let ic = this.icn3d, me = ic.icn3dui;
          ic.style2atoms = {};

          for(let i in atoms) {
            // do not show water in assemly
            //if(ic.bAssembly && ic.water.hasOwnProperty(i)) {
            //    ic.atoms[i].style = 'nothing';
            //}

            if(ic.style2atoms[ic.atoms[i].style] === undefined) ic.style2atoms[ic.atoms[i].style] = {};

            ic.style2atoms[ic.atoms[i].style][i] = 1;

            // side chains
            if(ic.atoms[i].style2 !== undefined && ic.atoms[i].style2 !== 'nothing') {
                if(ic.style2atoms[ic.atoms[i].style2] === undefined) ic.style2atoms[ic.atoms[i].style2] = {};

                ic.style2atoms[ic.atoms[i].style2][i] = 1;
            }
          }
    }

    // set atom style when loading a structure
    //Set atom style according to the definition in options (options.secondaryStructure, etc).
    setAtomStyleByOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        let selectedAtoms;

        if (options.proteins !== undefined) {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.proteins);
            for(let i in selectedAtoms) {
              ic.atoms[i].style = options.proteins.toLowerCase();
            }
        }

        // side chain use style2
        if (options.sidec !== undefined && options.sidec !== 'nothing') {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.sidec);
            //var sidec_calpha = me.hashUtilsCls.unionHash(ic.calphas, ic.sidec);
            //selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, sidec_calpha);

            for(let i in selectedAtoms) {
              ic.atoms[i].style2 = options.sidec.toLowerCase();
            }
        }

        if (options.chemicals !== undefined) {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.chemicals);
            for(let i in selectedAtoms) {
              ic.atoms[i].style = options.chemicals.toLowerCase();
            }
        }

        if (options.ions !== undefined) {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.ions);
            for(let i in selectedAtoms) {
              ic.atoms[i].style = options.ions.toLowerCase();
            }
        }

        if (options.water !== undefined) {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.water);
            for(let i in selectedAtoms) {
              ic.atoms[i].style = options.water.toLowerCase();
            }
        }

        if (options.nucleotides !== undefined) {
            selectedAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.nucleotides);
            for(let i in selectedAtoms) {
              ic.atoms[i].style = options.nucleotides.toLowerCase();
            }
        }
    }

    setBackground(color) {var ic = this.icn3d, me = ic.icn3dui;
       ic.setOptionCls.setOption('background', color);
       ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set background ' + color, true);
       let titleColor =(color == 'black' || color == 'transparent') ? ic.icn3dui.htmlCls.GREYD : 'black';
       $("#" + ic.pre + "title").css("color", titleColor);
       $("#" + ic.pre + "titlelink").css("color", titleColor);
    }

    //Save the command history to session storage so that the viewer can show the previous state when refreshing the same page.
    saveCommandsToSession() {var ic = this.icn3d, me = ic.icn3dui;
        let dataStr = ic.commands.join('\n');
        let data = decodeURIComponent(dataStr);
        sessionStorage.setItem('commands', data);
    }

    //http://jasonjl.me/blog/2015/06/21/taking-action-on-browser-crashes/
    //Set the commands before the browser crashed. These commands are used to restore your previous
    //state by refreshing the crashed page. It works in Chrome, Firefox, and Internet Explorer in PC,
    //but neither Safari nor Mac.
    getCommandsBeforeCrash() {var ic = this.icn3d, me = ic.icn3dui;
       window.addEventListener('load', function() {
          sessionStorage.setItem('good_exit', 'pending');
       });
       window.addEventListener('beforeunload', function() {
          sessionStorage.setItem('good_exit', 'true');
       });
       if(sessionStorage.getItem('good_exit') && sessionStorage.getItem('good_exit') === 'pending') {
          if(!me.utilsCls.isMac()) ic.bCrashed = true;  // this doesn't work in mac
          ic.commandsBeforeCrash = sessionStorage.getItem('commands');
          if(!ic.commandsBeforeCrash) ic.commandsBeforeCrash = '';
       }
    }

    handleContextLost() {var ic = this.icn3d, me = ic.icn3dui;
        //https://www.khronos.org/webgl/wiki/HandlingContextLost
        // 1 add a lost context handler and tell it to prevent the default behavior

        let canvas = $("#" + ic.pre + "canvas")[0];
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

            ic.drawCls.draw();

        }, false);
    }

    adjustIcon() {var ic = this.icn3d, me = ic.icn3dui;
      if(ic.STATENUMBER === 1) {
        if($("#" + ic.pre + "back").hasClass('icn3d-middleIcon')) {
          $("#" + ic.pre + "back").toggleClass('icn3d-middleIcon');
          $("#" + ic.pre + "back").toggleClass('icn3d-endIcon');
        }
      }
      else {
        if($("#" + ic.pre + "back").hasClass('icn3d-endIcon')) {
          $("#" + ic.pre + "back").toggleClass('icn3d-middleIcon');
          $("#" + ic.pre + "back").toggleClass('icn3d-endIcon');
        }
      }
      if(ic.STATENUMBER === ic.commands.length) {
        if($("#" + ic.pre + "forward").hasClass('icn3d-middleIcon')) {
          $("#" + ic.pre + "forward").toggleClass('icn3d-middleIcon');
          $("#" + ic.pre + "forward").toggleClass('icn3d-endIcon');
        }
      }
      else {
        if($("#" + ic.pre + "forward").hasClass('icn3d-endIcon')) {
          $("#" + ic.pre + "forward").toggleClass('icn3d-middleIcon');
          $("#" + ic.pre + "forward").toggleClass('icn3d-endIcon');
        }
      }
    }
}

export {SetStyle}
