/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.select3ddomainFromAtom = function (atom) { var me = this, ic = me.icn3d; "use strict";
    var chainid = atom.structure + '_' + atom.chain;
    var resid = chainid + '_' + atom.resi;

    var domainid;
    for(var id in this.tddomains) { // 3GVU_A_3d_domain_1
        var pos = id.indexOf('_3d_domain');
        if(id.substr(0, pos) == chainid) {
            if(Object.keys(this.tddomains[id]).indexOf(resid) !== -1) {
                domainid = id;
                break;
            }
        }
    }

    var atomList = {};
    for(var resid in this.tddomains[domainid]) {
        atomList = this.unionHash(atomList, this.residues[resid]);
    }

    return atomList;
};

 // from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getAtomsFromPosition = function(point, threshold) { var me = this, ic = me.icn3d; "use strict";
    var i, atom;

    if(threshold === undefined || threshold === null) {
      threshold = 1;
    }

    //for (i in this.atoms) {
    for (i in this.dAtoms) {
       var atom = this.atoms[i];

       if(this.ions.hasOwnProperty(i) && this.opts['ions'] === 'sphere') {
           var adjust = this.vdwRadii[atom.elem.toUpperCase()];

           if(Math.abs(atom.coord.x - point.x) - adjust > threshold) continue;
           if(Math.abs(atom.coord.y - point.y) - adjust > threshold) continue;
           if(Math.abs(atom.coord.z - point.z) - adjust > threshold) continue;
       }
       else {
           if(atom.coord.x < point.x - threshold || atom.coord.x > point.x + threshold) continue;
           if(atom.coord.y < point.y - threshold || atom.coord.y > point.y + threshold) continue;
           if(atom.coord.z < point.z - threshold || atom.coord.z > point.z + threshold) continue;
       }

       return atom;
    }

    return null;
 };

iCn3D.prototype.selectStrandHelixFromAtom = function(atom) { var me = this, ic = me.icn3d; "use strict";
    var firstAtom = atom;
    var lastAtom = atom;

    var atomsHash = {};

    // fill the beginning
    var beginResi = firstAtom.resi;
    if(!firstAtom.ssbegin) {
        for(var i = firstAtom.resi - 1; i > 0; --i) {
            var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
            if(!this.residues.hasOwnProperty(residueid)) break;

            var atom = this.getFirstCalphaAtomObj(this.residues[residueid]);
            beginResi = atom.resi;

            if( (firstAtom.ss !== 'coil' && atom.ss === firstAtom.ss && atom.ssbegin)
              || (firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) ) {
                if(firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) {
                    beginResi = atom.resi + 1;
                }
                break;
            }
        }

        for(var i = beginResi; i <= firstAtom.resi; ++i) {
            var residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
            atomsHash = this.unionHash(atomsHash, this.hash2Atoms(this.residues[residueid]));
        }
    }

    // fill the end
    var endResi = lastAtom.resi;
    var endChainResi = this.getLastAtomObj(this.chains[lastAtom.structure + '_' + lastAtom.chain]).resi;
    for(var i = lastAtom.resi + 1; i <= endChainResi; ++i) {
        var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
        if(!this.residues.hasOwnProperty(residueid)) break;

        var atom = this.getFirstCalphaAtomObj(this.residues[residueid]);
        endResi = atom.resi;

        if( (lastAtom.ss !== 'coil' && atom.ss === lastAtom.ss && atom.ssend) || (lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss) ) {
            if(lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss) {
                endResi = atom.resi - 1;
            }
            break;
        }
    }

    for(var i = lastAtom.resi + 1; i <= endResi; ++i) {
        var residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
        atomsHash = this.unionHash(atomsHash, this.hash2Atoms(this.residues[residueid]));
    }

    return atomsHash;
};

iCn3D.prototype.selectMainChainSubset = function (atoms) { var me = this, ic = me.icn3d; "use strict";
    var nuclMainArray = ["C1'", "C1*", "C2'", "C2*", "C3'", "C3*", "C4'", "C4*", "C5'", "C5*", "O3'", "O3*", "O4'", "O4*", "O5'", "O5*", "P", "OP1", "O1P", "OP2", "O2P"];

    var atomHash = {};
    for(var i in atoms) {
        if( (this.proteins.hasOwnProperty(i) && (this.atoms[i].name === "N" || this.atoms[i].name === "C" || this.atoms[i].name === "O"
          || (this.atoms[i].name === "CA" && this.atoms[i].elem === "C") ) )
          || (this.nucleotides.hasOwnProperty(i) && nuclMainArray.indexOf(this.atoms[i].name) !== -1) ) {
            atomHash[i] = 1;
        }
    }

    return atomHash;
};

iCn3D.prototype.transformMemPro = function(inCoord, rot, centerFrom, centerTo, bOut) { var me = this, ic = me.icn3d; "use strict";
    var coord = inCoord.clone();

    coord.sub(centerFrom);
if(bOut) console.log("sub coord: " + JSON.stringify(coord));

    var x = coord.x*rot[0] + coord.y*rot[1] + coord.z*rot[2] + centerTo.x;
    var y = coord.x*rot[3] + coord.y*rot[4] + coord.z*rot[5] + centerTo.y;
    var z = coord.x*rot[6] + coord.y*rot[7] + coord.z*rot[8] + centerTo.z;

    coord.x = x;
    coord.y = y;
    coord.z = z;
if(bOut) console.log("out coord: " + JSON.stringify(coord));

    return coord;
};

iCn3D.prototype.removeSurfaces = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
       this.mdl.remove(this.prevSurfaces[i]);
   }

   this.prevSurfaces = [];
};

iCn3D.prototype.removeLastSurface = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   if(this.prevSurfaces.length > 0) {
       this.mdl.remove(this.prevSurfaces[this.prevSurfaces.length - 1]);
       this.prevSurfaces.slice(this.prevSurfaces.length - 1, 1);
   }
};

iCn3D.prototype.removeMaps = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevMaps.length; i < il; ++i) {
       this.mdl.remove(this.prevMaps[i]);
   }

   this.prevMaps = [];
};

iCn3D.prototype.removeEmmaps = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   for(var i = 0, il = this.prevEmmaps.length; i < il; ++i) {
       this.mdl.remove(this.prevEmmaps[i]);
   }

   this.prevEmmaps = [];
};

iCn3D.prototype.removePhimaps = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight

   for(var i = 0, il = this.prevPhimaps.length; i < il; ++i) {
       this.mdl.remove(this.prevPhimaps[i]);
   }

   this.prevPhimaps = [];
};

iCn3D.prototype.removeLastMap = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   if(this.prevMaps.length > 0) {
       this.mdl.remove(this.prevMaps[this.prevMaps.length - 1]);
       this.prevMaps.slice(this.prevMaps.length - 1, 1);
   }
};

iCn3D.prototype.removeLastEmmap = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   if(this.prevEmmaps.length > 0) {
       this.mdl.remove(this.prevEmmaps[this.prevEmmaps.length - 1]);
       this.prevEmmaps.slice(this.prevEmmaps.length - 1, 1);
   }
};

iCn3D.prototype.removeLastPhimap = function () { var me = this, ic = me.icn3d; "use strict";
   // remove prevous highlight
   if(this.prevPhimaps.length > 0) {
       this.mdl.remove(this.prevPhimaps[this.prevPhimaps.length - 1]);
       this.prevPhimaps.slice(this.prevPhimaps.length - 1, 1);
   }
};
