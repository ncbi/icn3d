/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// get hbonds between "molecule" and "chemical"
iCn3D.prototype.calculateChemicalHbonds = function (startAtoms, targetAtoms, threshold) {
    if(Object.keys(startAtoms).length === 0 || Object.keys(targetAtoms).length === 0) return;

    var atomHbond = {};
    var chain_resi, chain_resi_atom;

    var maxlengthSq = threshold * threshold;

    for (var i in startAtoms) {
      var atom = startAtoms[i];

      if(atom.elem === "N" || atom.elem === "O" || atom.elem === "F") { // calculate hydrogen bond
        chain_resi_atom = atom.structure + "_" + atom.chain + "_" + atom.resi + "_" + atom.name;

        atomHbond[chain_resi_atom] = atom;
      }
    } // end of for (var i in startAtoms) {

    var hbondsAtoms = {};
    var residueHash = {};

    for (var i in targetAtoms) {
      var atom = targetAtoms[i];

      if(atom.elem === "N" || atom.elem === "O" || atom.elem === "F") { // calculate hydrogen bond
        chain_resi = atom.structure + "_" + atom.chain + "_" + atom.resi;
        chain_resi_atom = chain_resi + "_" + atom.name;

        for (var j in atomHbond) {
          var xdiff = Math.abs(atom.coord.x - atomHbond[j].coord.x);
          if(xdiff > threshold) continue;

          var ydiff = Math.abs(atom.coord.y - atomHbond[j].coord.y);
          if(ydiff > threshold) continue;

          var zdiff = Math.abs(atom.coord.z - atomHbond[j].coord.z);
          if(zdiff > threshold) continue;

          var dist = xdiff * xdiff + ydiff * ydiff + zdiff * zdiff;
          if(dist > maxlengthSq) continue;

          // output hydrogen bonds
          this.hbondpnts.push(atom.coord);
          this.hbondpnts.push(atomHbond[j].coord);

          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atom.structure + "_" + atom.chain + "_" + atom.resi]);
          hbondsAtoms = this.unionHash(hbondsAtoms, this.residues[atomHbond[j].structure + "_" + atomHbond[j].chain + "_" + atomHbond[j].resi]);

          residueHash[chain_resi] = 1;
        } // end of for (var j in atomHbond) {
      }
    } // end of for (var i in targetAtoms) {

    var residueArray = Object.keys(residueHash);

    // draw sidec for these residues
    for(var i = 0, il = residueArray.length; i < il; ++i) {
        for(var j in this.residues[residueArray[i]]) {
            // all atoms should be shown for hbonds
            this.atoms[j].style2 = 'stick';
            //this.atoms[j].style2 = 'lines';
        }
    }

    return hbondsAtoms;
};

iCn3D.prototype.getChainsFromAtoms = function(atomsHash) {
    var chainsHash = {};
    for(var i in atomsHash) {
       var atom = this.atoms[i];
       var chainid = atom.structure + "_" + atom.chain;

       chainsHash[chainid] = 1;
    }

    return chainsHash;
};


 iCn3D.prototype.getNeighboringAtoms = function(atomlist, atomlistTarget, distance) {
    var me = this;

    var extent = this.getExtent(atomlistTarget);

    var targetRadiusSq1 = (extent[2][0] - extent[0][0]) * (extent[2][0] - extent[0][0]) + (extent[2][1] - extent[0][1]) * (extent[2][1] - extent[0][1]) + (extent[2][2] - extent[0][2]) * (extent[2][2] - extent[0][2]);
    var targetRadiusSq2 = (extent[2][0] - extent[1][0]) * (extent[2][0] - extent[1][0]) + (extent[2][1] - extent[1][1]) * (extent[2][1] - extent[1][1]) + (extent[2][2] - extent[1][2]) * (extent[2][2] - extent[1][2]);
    var targetRadiusSq = (targetRadiusSq1 > targetRadiusSq2) ? targetRadiusSq1 : targetRadiusSq2;
    var targetRadius = Math.sqrt(targetRadiusSq);

    var maxDistSq = (targetRadius + distance) * (targetRadius + distance);

    var neighbors = {};
    for (var i in atomlist) {
       //var atom = atomlist[i];
       var atom = me.atoms[i];

       // exclude the target atoms
       if(atom.serial in atomlistTarget) continue;

       if (atom.coord.x < extent[0][0] - distance || atom.coord.x > extent[1][0] + distance) continue;
       if (atom.coord.y < extent[0][1] - distance || atom.coord.y > extent[1][1] + distance) continue;
       if (atom.coord.z < extent[0][2] - distance || atom.coord.z > extent[1][2] + distance) continue;

       // only show protein or DNA/RNA
       //if(atom.serial in this.proteins || atom.serial in this.nucleotides) {
           var atomDistSq = (atom.coord.x - extent[2][0]) * (atom.coord.x - extent[2][0]) + (atom.coord.y - extent[2][1]) * (atom.coord.y - extent[2][1]) + (atom.coord.z - extent[2][2]) * (atom.coord.z - extent[2][2]);

           if(atomDistSq < maxDistSq) {
               neighbors[atom.serial] = atom;
           }
       //}
    }

    return neighbors;
 };

 // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getAtomsWithinAtom = function(atomlist, atomlistTarget, distance) {
    var me = this;

    var neighbors = this.getNeighboringAtoms(atomlist, atomlistTarget, distance);

    var ret = {};
    for(var i in atomlistTarget) {
        //var oriAtom = atomlistTarget[i];
        var oriAtom = me.atoms[i];
        var radius = this.vdwRadii[oriAtom.elem] || this.defaultRadius;

        for (var j in neighbors) {
           var atom = neighbors[j];

           // exclude the target atoms
           if(atom.serial in atomlistTarget) continue;

           var atomDistSq = (atom.coord.x - oriAtom.coord.x) * (atom.coord.x - oriAtom.coord.x) + (atom.coord.y - oriAtom.coord.y) * (atom.coord.y - oriAtom.coord.y) + (atom.coord.z - oriAtom.coord.z) * (atom.coord.z - oriAtom.coord.z);

           var maxDistSq = (radius + distance) * (radius + distance);

           if(atomDistSq < maxDistSq) {
               ret[atom.serial] = atom;
           }
       }
    }

    return ret;
 };

 // from iview (http://istar.cse.cuhk.edu.hk/iview/)
 iCn3D.prototype.getExtent = function(atomlist) {
    var me = this;

    var xmin = ymin = zmin = 9999;
    var xmax = ymax = zmax = -9999;
    var xsum = ysum = zsum = cnt = 0;
    var i;
    for (i in atomlist) {
       //var atom = atomlist[i];
       var atom = me.atoms[i];
       cnt++;
       xsum += atom.coord.x; ysum += atom.coord.y; zsum += atom.coord.z;


       xmin = (xmin < atom.coord.x) ? xmin : atom.coord.x;

       ymin = (ymin < atom.coord.y) ? ymin : atom.coord.y;
       zmin = (zmin < atom.coord.z) ? zmin : atom.coord.z;
       xmax = (xmax > atom.coord.x) ? xmax : atom.coord.x;
       ymax = (ymax > atom.coord.y) ? ymax : atom.coord.y;
       zmax = (zmax > atom.coord.z) ? zmax : atom.coord.z;
    }

    return [[xmin, ymin, zmin], [xmax, ymax, zmax], [xsum / cnt, ysum / cnt, zsum / cnt]];
 };

iCn3D.prototype.centerAtoms = function(atoms) {
    var pmin = new THREE.Vector3( 9999, 9999, 9999);
    var pmax = new THREE.Vector3(-9999,-9999,-9999);
    var psum = new THREE.Vector3();
    var cnt = 0;

    for (var i in atoms) {
        var atom = this.atoms[i];
        var coord = atom.coord;
        psum.add(coord);
        pmin.min(coord);
        pmax.max(coord);
        ++cnt;
    }

    var maxD = pmax.distanceTo(pmin);

    return {"center": psum.multiplyScalar(1.0 / cnt), "maxD": maxD};
};

iCn3D.prototype.removeSurfaces = function () {
   // remove prevous highlight
   for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
       this.mdl.remove(this.prevSurfaces[i]);
   }

   this.prevSurfaces = [];
};

iCn3D.prototype.removeLastSurface = function () {
   // remove prevous highlight
   if(this.prevSurfaces.length > 0) {
       this.mdl.remove(this.prevSurfaces[this.prevSurfaces.length - 1]);
       this.prevSurfaces.slice(this.prevSurfaces.length - 1, 1);
   }
};

iCn3D.prototype.removeMaps = function () {
   // remove prevous highlight
   for(var i = 0, il = this.prevMaps.length; i < il; ++i) {
       this.mdl.remove(this.prevMaps[i]);
   }

   this.prevMaps = [];
};

iCn3D.prototype.removeLastMap = function () {
   // remove prevous highlight
   if(this.prevMaps.length > 0) {
       this.mdl.remove(this.prevMaps[this.prevMaps.length - 1]);
       this.prevMaps.slice(this.prevMaps.length - 1, 1);
   }
};

iCn3D.prototype.zoominSelection = function(atoms) {
   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);
           this.maxD = centerAtomsResults.maxD;
           if (this.maxD < 5) this.maxD = 5;

           this.mdl.position.set(0,0,0);
           this.mdlImpostor.position.set(0,0,0);
           this.mdl_ghost.position.set(0,0,0);

           this.mdl.position.sub(centerAtomsResults.center);
           //this.mdlPicking.position.sub(centerAtomsResults.center);
           this.mdlImpostor.position.sub(centerAtomsResults.center);
           this.mdl_ghost.position.sub(centerAtomsResults.center);

           this.center = centerAtomsResults.center;

           // reset cameara
           this.setCamera();
   }
};

iCn3D.prototype.centerSelection = function(atoms) {
   this.resetOrientation();

   if(atoms === undefined) {
       atoms = this.hash2Atoms(this.hAtoms);
   }

   // center on the hAtoms if more than one residue is selected
   if(Object.keys(atoms).length > 1) {
           var centerAtomsResults = this.centerAtoms(atoms);

           this.center = centerAtomsResults.center;
           this.setCenter(this.center);

           // reset cameara
           this.setCamera();
   }
};
