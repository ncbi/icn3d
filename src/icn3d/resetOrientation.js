/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.resetOrientation = function() { var me = this, ic = me.icn3d; "use strict";
    var bSet = false;
    if(this.commands.length > 0) {
        var commandTransformation = this.commands[0].split('|||');

        if(commandTransformation.length == 2) {
            var transformation = JSON.parse(commandTransformation[1]);

            this._zoomFactor = transformation.factor;

            this.mouseChange.x = transformation.mouseChange.x;
            this.mouseChange.y = transformation.mouseChange.y;

            this.quaternion._x = transformation.quaternion._x;
            this.quaternion._y = transformation.quaternion._y;
            this.quaternion._z = transformation.quaternion._z;
            this.quaternion._w = transformation.quaternion._w;

            bSet = true;
        }
    }

    if(!bSet) {
        this._zoomFactor = 1.0;
        this.mouseChange = new THREE.Vector2(0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
    }

    //reset this.maxD
    this.maxD = this.oriMaxD;
    this.center = this.oriCenter.clone();

    if(this.ori_chemicalbinding == 'show') {
        this.bSkipChemicalbinding = false;
    }
    else if(this.ori_chemicalbinding == 'hide') {
        this.bSkipChemicalbinding = true;
    }
};
