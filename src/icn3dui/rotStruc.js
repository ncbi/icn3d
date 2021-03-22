/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.rotStruc = function (direction, bInitial) { var me = this, ic = me.icn3d; "use strict";
    if(ic.bStopRotate) return false;
    if(ic.rotateCount > ic.rotateCountMax) {
        // back to the original orientation
        ic.resetOrientation();

        return false;
    }
    ++ic.rotateCount;

    if(bInitial) {
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
      ic.rotateLeft(1);
    }
    else if(direction === 'right' && me.ROT_DIR === 'right') {
      ic.rotateRight(1);
    }
    else if(direction === 'up' && me.ROT_DIR === 'up') {
      ic.rotateUp(1);
    }
    else if(direction === 'down' && me.ROT_DIR === 'down') {
      ic.rotateDown(1);
    }
    else {
      return false;
    }

    setTimeout(function(){ me.rotStruc(direction); }, 100);
};
