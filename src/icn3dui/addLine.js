/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.addLine = function (x1, y1, z1, x2, y2, z2, color, dashed, type) { var me = this, ic = me.icn3d; "use strict";
    var line = {}; // Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
    line.position1 = new THREE.Vector3(x1, y1, z1);
    line.position2 = new THREE.Vector3(x2, y2, z2);
    line.color = color;
    line.dashed = dashed;
    if(ic.lines[type] === undefined) ic.lines[type] = [];
    if(type !== undefined) {
        ic.lines[type].push(line);
    }
    else {
        ic.lines['custom'].push(line);
    }
    ic.removeHlObjects();
    //ic.draw();
};
