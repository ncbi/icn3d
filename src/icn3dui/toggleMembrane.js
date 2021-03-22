/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.toggleMembrane = function() { var me = this, ic = me.icn3d; "use strict";
    var structure = Object.keys(ic.structures)[0];
    var atomsHash = ic.residues[structure + '_MEM_1'];
    var firstAtom = ic.getFirstAtomObj(atomsHash);
    var oriStyle = firstAtom.style;
    if(!ic.dAtoms.hasOwnProperty(firstAtom.serial)) {
        // add membrane to displayed atoms if the membrane is not part of the display
        ic.dAtoms = ic.unionHash(ic.dAtoms, atomsHash);
        oriStyle = 'nothing';
    }
    for(var i in atomsHash) {
        var atom = ic.atoms[i];
        if(oriStyle !== 'nothing') {
            atom.style = 'nothing';
        }
        else {
            atom.style = 'stick';
        }
    }
    ic.draw();
};

iCn3DUI.prototype.adjustMembrane = function(extra_mem_z, intra_mem_z) { var me = this, ic = me.icn3d; "use strict";
    for(var i in ic.chains[me.inputid.toUpperCase() + '_MEM']) {
        var atom = ic.atoms[i];
        if(atom.name == 'O') {
            atom.coord.z = extra_mem_z;
        }
        else if(atom.name == 'N') {
            atom.coord.z = intra_mem_z;
        }
    }
    // reset transmembrane set
    var bReset = true;
    me.setTransmemInMenu(extra_mem_z, intra_mem_z, bReset);
    me.updateHlMenus();
    ic.draw();
};
iCn3DUI.prototype.selectBtwPlanes = function(large, small) { var me = this, ic = me.icn3d; "use strict";
    if(large < small) {
        var tmp = small;
        small = large;
        large = tmp;
    }
    var residueHash = {};
    for(var i in ic.atoms) {
        var atom = ic.atoms[i];
        if(atom.resn == 'DUM') continue;
        if(atom.coord.z >= small && atom.coord.z <= large) {
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residueHash[resid] = 1;
        }
    }
    var commandname = "z_planes_" + large + "_" + small;
    var commanddescr = commandname;
    me.selectResidueList(residueHash, commandname, commanddescr, false);
};
