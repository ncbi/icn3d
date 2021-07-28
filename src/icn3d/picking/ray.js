/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {Picking} from '../picking/picking.js';

class Ray {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    rayCaster(e, bClick) {
        this.rayCasterBase(e, bClick);
    }

    rayCasterBase(e, bClick) { let  ic = this.icn3d, me = ic.icn3dui;
    // if(ic.bChainAlign) return; // no picking for chain alignment

        let  x = e.pageX, y = e.pageY;
        if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
            x = e.originalEvent.targetTouches[0].pageX;
            y = e.originalEvent.targetTouches[0].pageY;
        }

        let  left = ic.oriContainer.offset().left;
        let  top = ic.oriContainer.offset().top;

        let  containerWidth = ic.oriContainer.width();
        let  containerHeight = ic.oriContainer.height();

        let  popupX = x - left;
        let  popupY = y - top;

        //ic.isDragging = true;

        // see ref http://soledadpenades.com/articles/three-js-tutorials/object-pk/
        //if(ic.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
        //    ic.highlightlevel = ic.pk;

            ic.mouse.x = ( popupX / containerWidth ) * 2 - 1;
            ic.mouse.y = - ( popupY / containerHeight ) * 2 + 1;

            let  mouse3 = new THREE.Vector3();
            mouse3.x = ic.mouse.x;
            mouse3.y = ic.mouse.y;
            //mouse3.z = 0.5;
            if(ic.cam_z > 0) {
              mouse3.z = -1.0; // between -1 to 1. The z positio of mouse in the real world should be between the camera and the target."-1" worked in our case.
            }
            else {
              mouse3.z = 1.0; // between -1 to 1. The z positio of mouse in the real world should be between the camera and the target."-1" worked in our case.
            }

            // similar to setFromCamera() except mouse3.z is the opposite sign from the value in setFromCamera()
            // use itsown camera for picking

            if(ic.cam === ic.perspectiveCamera) { // perspective
                if(ic.cam_z > 0) {
                  mouse3.z = -1.0;
                }
                else {
                  mouse3.z = 1.0;
                }
                //ic.projector.unprojectVector( mouse3, ic.cam );  // works for all versions
                mouse3.unproject(ic.cam );  // works for all versions
                ic.raycaster.set(ic.cam.position, mouse3.sub(ic.cam.position).normalize()); // works for all versions
            }
            else if(ic.cam === ic.orthographicCamera) {  // orthographics
                if(ic.cam_z > 0) {
                  mouse3.z = 1.0;
                }
                else {
                  mouse3.z = -1.0;
                }
                //ic.projector.unprojectVector( mouse3, ic.cam );  // works for all versions
                mouse3.unproject(ic.cam );  // works for all versions
                ic.raycaster.set(mouse3, new THREE.Vector3(0,0,-1).transformDirection( ic.cam.matrixWorld )); // works for all versions
            }

            let  bFound = this.isIntersect(ic.objects, ic.mdl, bClick, popupX, popupY);

            if(!bFound) {
                bFound = this.isIntersect(ic.objects_ghost, ic.mdl_ghost, bClick, popupX, popupY);
            }
        //}
    }

    isIntersect(objects, mdl, bClick, popupX, popupY) { let  ic = this.icn3d, me = ic.icn3dui;
        let  intersects = ic.raycaster.intersectObjects( objects ); // not all "mdl" group will be used for pk

        let  bFound = false;

        let  position = mdl.position;
        if ( intersects.length > 0 ) {
            // the intersections are sorted so that the closest point is the first one.
            intersects[ 0 ].point.sub(position); // mdl.position was moved to the original (0,0,0) after reading the molecule coordinates. The raycasting was done based on the original. The position of the original should be substracted.

            let  threshold = 0.5;
            let  atom = this.getAtomsFromPosition(intersects[ 0 ].point, threshold); // the second parameter is the distance threshold. The first matched atom will be returned. Use 1 angstrom, not 2 angstrom. If it's 2 angstrom, other atom will be returned.

            while(!atom && threshold < 10) {
                threshold = threshold + 0.5;
                atom = this.getAtomsFromPosition(intersects[ 0 ].point, threshold);
            }

            if(atom) {
                bFound = true;
                if(ic.pickpair) {
                    if(bClick) {
                      if(ic.pAtomNum % 2 === 0) {
                        ic.pAtom = atom;
                      }
                      else {
                        ic.pAtom2 = atom;
                      }

                      ++ic.pAtomNum;
                    }
                }
                else {
                  ic.pAtom = atom;
                }

                if(bClick) {
                  ic.pickingCls.showPicking(atom);
                }
                else {
                  ic.pickingCls.showPicking(atom, popupX, popupY);
                }
            }
            else {
                console.log("No atoms were found in 10 andstrom range");
            }
        } // end if

        return bFound;
    }

     // from iview (http://istar.cse.cuhk.edu.hk/iview/)
     getAtomsFromPosition(point, threshold) { let  ic = this.icn3d, me = ic.icn3dui;
        let  i, atom;

        if(threshold === undefined || threshold === null) {
          threshold = 1;
        }

        //for (i in ic.atoms) {
        for (i in ic.dAtoms) {
           let  atom = ic.atoms[i];

           if(ic.ions.hasOwnProperty(i) && ic.opts['ions'] === 'sphere') {
               let  adjust = me.parasCls.vdwRadii[atom.elem.toUpperCase()];

               if(Math.abs(atom.coord.x - point.x) - adjust > threshold) continue;
               if(Math.abs(atom.coord.y - point.y) - adjust > threshold) continue;
               if(Math.abs(atom.coord.z - point.z) - adjust > threshold) continue;
           }
           else {
               if(atom.coord.x < point.x - threshold || atom.coord.x > point.x + threshold) continue;
               if(atom.coord.y < point.y - threshold || atom.coord.y > point.y + threshold) continue;
               if(atom.coord.z < point.z - threshold || atom.coord.z > point.z + threshold) continue;
           }

           return atom;
        }

        return null;
     }
}

export {Ray}
