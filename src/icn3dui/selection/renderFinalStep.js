/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.renderFinalStep = function(steps) { var me = this, ic = me.icn3d; "use strict";
    // enable me.hideLoading
    me.bCommandLoad = false;

    // hide "loading ..."
    me.hideLoading();

    //ic.bRender = true;

    // end of all commands
    if(steps + 1 === ic.commands.length) me.bAddCommands = true;


    ic.bRender = true;

    var commandTransformation = ic.commands[steps-1].split('|||');

    if(commandTransformation.length == 2) {
        var transformation = JSON.parse(commandTransformation[1]);

        ic._zoomFactor = transformation.factor;

        ic.mouseChange.x = transformation.mouseChange.x;
        ic.mouseChange.y = transformation.mouseChange.y;

        ic.quaternion._x = transformation.quaternion._x;
        ic.quaternion._y = transformation.quaternion._y;
        ic.quaternion._z = transformation.quaternion._z;
        ic.quaternion._w = transformation.quaternion._w;
    }

    me.oneStructurePerWindow();

    // simple if all atoms are modified
    //if( me.cfg.command === undefined && (steps === 1 || (Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length) || (ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) ) {
    if(steps === 1
      || (Object.keys(ic.hAtoms).length === Object.keys(ic.atoms).length)
      || (ic.optsHistory[steps - 1] !== undefined && ic.optsHistory[steps - 1].hasOwnProperty('hlatomcount') && ic.optsHistory[steps - 1].hlatomcount === Object.keys(ic.atoms).length) ) {
// the following code caused problem for many links,e.g., https://structure.ncbi.nlm.nih.gov/icn3d/share.html?17g3r1JDvZ7ZL39e6
//        if(steps === 1) {
            // assign styles and color using the options at that stage
//            ic.setAtomStyleByOptions(ic.optsHistory[steps - 1]);
//            ic.setColorByOptions(ic.optsHistory[steps - 1], ic.hAtoms);
//        }

        if(ic.optsHistory.length >= steps) {
            var pkOption = ic.optsHistory[steps - 1].pk;
            if(pkOption === 'no') {
                ic.pk = 0;
            }
            else if(pkOption === 'atom') {
                ic.pk = 1;
            }
            else if(pkOption === 'residue') {
                ic.pk = 2;
            }
            else if(pkOption === 'strand') {
                ic.pk = 3;
            }

// the following code caused problem for many links,e.g., https://structure.ncbi.nlm.nih.gov/icn3d/share.html?17g3r1JDvZ7ZL39e6
//            if(steps === 1) {
//                ic.applyOriginalColor();
//            }

            me.updateHlAll();

            // caused some problem witht the following line
//            jQuery.extend(ic.opts, ic.optsHistory[steps - 1]);
            ic.draw();
        }
        else {
            me.updateHlAll();

            ic.draw();
        }
    }
    else { // more complicated if partial atoms are modified
        me.updateHlAll();

        ic.draw();
    }

    if(me.cfg.closepopup) {
        setTimeout(function(){
            me.closeDialogs();
        }, 100);

        me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
    }

    // an extra render to remove artifacts in transparent surface
    if(me.bTransparentSurface && ic.bRender) ic.render();

    if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};
