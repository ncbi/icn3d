/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applyCenterOptions = function (options) {
    if(options === undefined) options = this.opts;

    var center;
    switch (options.rotationcenter.toLowerCase()) {
        case 'molecule center':
            // move the molecule to the origin
            if(this.center !== undefined) {
                this.setRotationCenter(this.center);
            }
            break;
        case 'pick center':
            if(this.pAtom !== undefined) {
              this.setRotationCenter(this.pAtom.coord);
            }
            break;
        case 'display center':
            center = this.centerAtoms(this.dAtoms).center;
            this.setRotationCenter(center);
            break;
        case 'highlight center':
            center = this.centerAtoms(this.hAtoms).center;
            this.setRotationCenter(center);
            break;
    }
};

iCn3D.prototype.setRotationCenter = function (coord) {
   this.setCenter(coord);
};

