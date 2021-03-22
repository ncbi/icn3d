/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.getResiduesFromAtoms = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    var residuesHash = {};
    for(var i in atomsHash) {
        var residueid = this.atoms[i].structure + '_' + this.atoms[i].chain + '_' + this.atoms[i].resi;
        residuesHash[residueid] = 1;
    }

    return residuesHash;
};

iCn3D.prototype.getResiduesFromCalphaAtoms = function(atomsHash) { var me = this, ic = me.icn3d; "use strict";
    var residuesHash = {};
    for(var i in atomsHash) {
        if((this.atoms[i].name == 'CA' && this.proteins.hasOwnProperty(i)) || !this.proteins.hasOwnProperty(i)) {
            var residueid = this.atoms[i].structure + '_' + this.atoms[i].chain + '_' + this.atoms[i].resi;
            residuesHash[residueid] = 1;
        }
    }

    return residuesHash;
};
