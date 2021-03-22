/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applyClbondsOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
   if(options === undefined) options = this.opts;

   if(!me.bCalcCrossLink) {
     // find all bonds to chemicals
     this.clbondpnts = {};
     me.clbondResid2serial = {};

     // chemical to chemical first
     me.applyClbondsOptions_base('chemical');

     // chemical to protein/nucleotide
     me.applyClbondsOptions_base('all');

     me.bCalcCrossLink = true;
   }

   if (options.clbonds.toLowerCase() === 'yes' && options.chemicals !== 'nothing') {
     var color = '#006400';
     var colorObj = this.thr(0x006400);

     this.lines['clbond'] = [];
     me.residuesHashClbonds = {};

     if(me.structures) {
         var strucArray = Object.keys(me.structures);
         for(var i = 0, il = strucArray.length; i < il; ++i) {
             var struc = strucArray[i];
             if(!me.clbondpnts[struc]) continue;

             for(var j = 0, jl = me.clbondpnts[struc].length; j < jl; j += 2) {
                var resid0 = me.clbondpnts[struc][j];
                var resid1 = me.clbondpnts[struc][j+1];

                var line = {};
                line.color = color;
                line.dashed = false;

                line.serial1 = me.clbondResid2serial[resid0 + ',' + resid1];
                line.serial2 = me.clbondResid2serial[resid1 + ',' + resid0];

                if(!me.dAtoms.hasOwnProperty(line.serial1) || !me.dAtoms.hasOwnProperty(line.serial2)) continue;

                line.position1 = me.atoms[line.serial1].coord;
                line.position2 = me.atoms[line.serial2].coord;

                this.lines['clbond'].push(line);
                this.createCylinder(line.position1, line.position2, this.cylinderRadius, colorObj);

                // show stick for these two residues
                var residueAtoms = {};
                residueAtoms = this.unionHash(residueAtoms, this.residues[resid0]);
                residueAtoms = this.unionHash(residueAtoms, this.residues[resid1]);

                // show side chains for the selected atoms
                var atoms = this.intHash(residueAtoms, this.sidec);

                // draw sidec separatedly
                for(var k in atoms) {
                  this.atoms[k].style2 = 'stick';
                }

                // return the residues
                me.residuesHashClbonds[resid0] = 1;
                me.residuesHashClbonds[resid1] = 1;
            } // for j
        } // for i
    } // if
  } // if

  return me.residuesHashClbonds;
};

iCn3D.prototype.applyClbondsOptions_base = function (type) { var me = this, ic = me.icn3d; "use strict";
     // chemical to chemical first
     for (var i in me.chemicals) {
        var atom0 = me.atoms[i];

        var chain0 = atom0.structure + '_' + atom0.chain;
        var resid0 = chain0 + '_' + atom0.resi;

        for (var j in atom0.bonds) {
            var atom1 = me.atoms[atom0.bonds[j]];

            if (atom1 === undefined) continue;
            if (atom1.chain !== atom0.chain || atom1.resi !== atom0.resi) {
                var chain1 = atom1.structure + '_' + atom1.chain;
                var resid1 = chain1 + '_' + atom1.resi;

                var bType = (type == 'chemical') ? atom1.het : true; //(me.proteins.hasOwnProperty(atom1.serial) || me.nucleotides.hasOwnProperty(atom1.serial));

                if(bType ) {
                    // add resid0 to resid1
//                    me.residues[resid1] = me.unionHash(me.residues[resid1], me.residues[resid0]);
//                    me.chains[chain1] = me.unionHash(me.chains[chain1], me.residues[resid0]);

                    // add resid1 to resid0
//                    me.residues[resid0] = me.unionHash(me.residues[resid0], me.residues[resid1]);
//                    me.chains[chain0] = me.unionHash(me.chains[chain0], me.residues[resid1]);

                    if(type == 'chemical') continue; // just connect checmicals together

                    if(me.clbondpnts[atom0.structure] === undefined) me.clbondpnts[atom0.structure] = [];
                    me.clbondpnts[atom0.structure].push(resid0);
                    me.clbondpnts[atom1.structure].push(resid1);

                    // one residue may have different atom for different clbond
                    me.clbondResid2serial[resid0 + ',' + resid1] = atom0.serial;
                    me.clbondResid2serial[resid1 + ',' + resid0] = atom1.serial;
                }
            }
        } // for j
    } // for i
};
