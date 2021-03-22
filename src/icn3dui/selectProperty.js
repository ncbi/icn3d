/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.selectProperty = function(property, from, to) { var me = this, ic = me.icn3d; "use strict";
    var prevHAtoms = ic.cloneHash(ic.hAtoms);
    if(property == 'positive') {
        var select = ':r,k,h';
        ic.hAtoms = {};
        me.selectBySpec(select, select, select);
    }
    else if(property == 'negative') {
        var select = ':d,e';
        ic.hAtoms = {};
        me.selectBySpec(select, select, select);
    }
    else if(property == 'hydrophobic') {
        var select = ':w,f,y,l,i,c,m';
        ic.hAtoms = {};
        me.selectBySpec(select, select, select);
    }
    else if(property == 'polar') {
        var select = ':g,v,s,t,a,n,p,q';
        ic.hAtoms = {};
        me.selectBySpec(select, select, select);
    }
    else if(property == 'b factor') {
        var atoms = ic.cloneHash(ic.calphas);
        atoms = ic.unionHash(atoms, ic.nucleotidesO3);
        atoms = ic.unionHash(atoms, ic.chemicals);
        atoms = ic.unionHash(atoms, ic.ions);
        atoms = ic.unionHash(atoms, ic.water);
        ic.hAtoms = {};
        for(var i in atoms) {
            var atom = ic.atoms[i];
            if(atom.b >= from && atom.b <= to) {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[atom.structure + '_' + atom.chain + '_' + atom.resi]);
            }
        }
    }
    else if(property == 'percent out') {
       ic.bCalcArea = true;
       ic.opts.surface = 'solvent accessible surface';
       ic.applySurfaceOptions();
       ic.bCalcArea = false;
       ic.hAtoms = {};
       for(var resid in ic.resid2area) { // resid: structure_chain_resi_resn
            //var idArray = resid.split('_');
            var idArray = me.getIdArray(resid);

            if(ic.residueArea.hasOwnProperty(idArray[3])) {
                var percent = parseInt(ic.resid2area[resid] / ic.residueArea[idArray[3]] * 100);
                if(percent >= from && percent <= to) {
                    var residReal = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
                    ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[residReal]);
                }
            }
       }
    }
    ic.hAtoms = ic.intHash(ic.hAtoms, prevHAtoms);
    ic.draw();
    me.updateHlAll();
};
