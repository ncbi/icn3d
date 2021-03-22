/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.getFirstAtomObj = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return undefined;
    }

    var atomKeys = Object.keys(atomsHash);
    var firstIndex = atomKeys[0];

    return this.atoms[firstIndex];
};

iCn3D.prototype.getFirstCalphaAtomObj = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return undefined;
    }

    var firstIndex;

    for(var i in atomsHash) {
        if(this.atoms[i].name == 'CA') {
            firstIndex = i;
            break;
        }
    }

    return (firstIndex !== undefined) ? this.atoms[firstIndex] : this.getFirstAtomObj(atomsHash);
};

iCn3D.prototype.getFirstAtomObjByName = function(atomsHash, atomName) { var me = this, ic = me.icn3d; "use strict";
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return this.atoms[0];
    }

    var firstIndex;

    for(var i in atomsHash) {
        if(this.atoms[i].name == atomName) {
            firstIndex = i;
            break;
        }
    }

    return (firstIndex !== undefined) ? this.atoms[firstIndex] : undefined;
};

iCn3D.prototype.getLastAtomObj = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    if(atomsHash === undefined || Object.keys(atomsHash).length === 0) {
        return this.atoms[0];
    }

    var atomKeys = Object.keys(atomsHash);
    var lastIndex = atomKeys[atomKeys.length - 1];

    return this.atoms[lastIndex];
};
