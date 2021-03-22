/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.rayCaster = function(e, bClick) { var me = this, ic = me.icn3d; "use strict";
    me.rayCasterBase(e, bClick);
};

iCn3D.prototype.rayCasterBase = function(e, bClick) { var me = this, ic = me.icn3d; "use strict";
//        if(this.bChainAlign) return; // no picking for chain alignment

    var x = e.pageX, y = e.pageY;
    if (e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]) {
        x = e.originalEvent.targetTouches[0].pageX;
        y = e.originalEvent.targetTouches[0].pageY;
    }

    var left = me.oriContainer.offset().left;
    var top = me.oriContainer.offset().top;

    var containerWidth = me.oriContainer.width();
    var containerHeight = me.oriContainer.height();

    var popupX = x - left;
    var popupY = y - top;

    //me.isDragging = true;

    // see ref http://soledadpenades.com/articles/three-js-tutorials/object-pk/
    //if(me.pk && (e.altKey || e.ctrlKey || e.shiftKey || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 224 || e.keyCode === 91) ) {
    //    me.highlightlevel = me.pk;

        me.mouse.x = ( popupX / containerWidth ) * 2 - 1;
        me.mouse.y = - ( popupY / containerHeight ) * 2 + 1;

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
        // use itsown camera for picking

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

        var bFound = this.isIntersect(me.objects, me.mdl, bClick, popupX, popupY);

        if(!bFound) {
            bFound = this.isIntersect(me.objects_ghost, me.mdl_ghost, bClick, popupX, popupY);
        }
    //}
};

iCn3D.prototype.isIntersect = function(objects, mdl, bClick, popupX, popupY) { var me = this, ic = me.icn3d; "use strict";
    var intersects = me.raycaster.intersectObjects( objects ); // not all "mdl" group will be used for pk

    var bFound = false;

    var position = mdl.position;
    if ( intersects.length > 0 ) {
        // the intersections are sorted so that the closest point is the first one.
        intersects[ 0 ].point.sub(position); // mdl.position was moved to the original (0,0,0) after reading the molecule coordinates. The raycasting was done based on the original. The position of the original should be substracted.

        var threshold = 0.5;
        var atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold); // the second parameter is the distance threshold. The first matched atom will be returned. Use 1 angstrom, not 2 angstrom. If it's 2 angstrom, other atom will be returned.

        while(!atom && threshold < 10) {
            threshold = threshold + 0.5;
            atom = me.getAtomsFromPosition(intersects[ 0 ].point, threshold);
        }

        if(atom) {
            bFound = true;
            if(me.pickpair) {
                if(bClick) {
                  if(me.pAtomNum % 2 === 0) {
                    me.pAtom = atom;
                  }
                  else {
                    me.pAtom2 = atom;
                  }

                  ++me.pAtomNum;
                }
            }
            else {
              me.pAtom = atom;
            }

            if(bClick) {
              me.showPicking(atom);
            }
            else {
              me.showPicking(atom, popupX, popupY);
              //me.showPicking(atom, x, y);
            }
        }
        else {
            console.log("No atoms were found in 10 andstrom range");
        }
    } // end if

    return bFound;
};
