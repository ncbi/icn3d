/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setPredefinedInMenu = function() { var me = this, ic = me.icn3d; "use strict";
      // predefined sets: all chains
      me.setChainsInMenu();

      // predefined sets: proteins,nucleotides, chemicals
      me.setProtNuclLigInMenu();

      // show 3d domains for mmdbid
      if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.chainalign !== undefined) {
          for(var tddomainName in ic.tddomains) {
              me.selectResidueList(ic.tddomains[tddomainName], tddomainName, tddomainName, false, false);
          }
      }

      //if((me.cfg.align !== undefined || me.cfg.chainalign !== undefined) && me.bFullUi) {
      // deal with multiple chain align separately
      if((me.cfg.align !== undefined || (me.cfg.chainalign !== undefined && me.chainidArray.length == 2) ) && me.bFullUi) {
        me.selectResidueList(me.consHash1, me.conservedName1, me.conservedName1, false, false);
        me.selectResidueList(me.consHash2, me.conservedName2, me.conservedName2, false, false);

        me.selectResidueList(me.nconsHash1, me.nonConservedName1, me.nonConservedName1, false, false);
        me.selectResidueList(me.nconsHash2, me.nonConservedName2, me.nonConservedName2, false, false);

        me.selectResidueList(me.nalignHash1, me.notAlignedName1, me.notAlignedName1, false, false);
        me.selectResidueList(me.nalignHash2, me.notAlignedName2, me.notAlignedName2, false, false);

        // for alignment, show aligned residues, chemicals, and ions
        var dAtoms = {};
        for(var alignChain in ic.alnChains) {
            dAtoms = ic.unionHash(dAtoms, ic.alnChains[alignChain]);
        }

        var residuesHash = {}, chains = {};
        for(var i in dAtoms) {
            var atom = ic.atoms[i];

            var chainid = atom.structure + '_' + atom.chain;
            var resid = chainid + '_' + atom.resi;
            residuesHash[resid] = 1;
            chains[chainid] = 1;
        }

        var commandname = 'protein_aligned';
        var commanddescr = 'aligned protein and nucleotides';
        var select = "select " + me.residueids2spec(Object.keys(residuesHash));

        //me.addCustomSelection(Object.keys(residuesHash), Object.keys(dAtoms), commandname, commanddescr, select, true);
        me.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
      }
};
