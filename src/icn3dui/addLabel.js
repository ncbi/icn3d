/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.addLabel = function (text, x, y, z, size, color, background, type) { var me = this, ic = me.icn3d; "use strict";
    var label = {}; // Each label contains 'position', 'text', 'color', 'background'

    if(size === '0' || size === '' || size === 'undefined') size = undefined;
    if(color === '0' || color === '' || color === 'undefined') color = undefined;
    if(background === '0' || background === '' || background === 'undefined') background = undefined;

    var position = new THREE.Vector3();
    position.x = x;
    position.y = y;
    position.z = z;

    label.position = position;

    label.text = text;
    label.size = size;
    label.color = color;
    label.background = background;

    if(ic.labels[type] === undefined) ic.labels[type] = [];

    if(type !== undefined) {
        ic.labels[type].push(label);
    }
    else {
        ic.labels['custom'].push(label);
    }

    ic.removeHlObjects();

    //ic.draw();
};
