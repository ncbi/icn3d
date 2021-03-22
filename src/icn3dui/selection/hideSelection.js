/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.hideSelection = function () { var me = this, ic = me.icn3d; "use strict";
    ic.dAtoms = ic.exclHash(ic.dAtoms, ic.hAtoms);

    ic.hAtoms = ic.cloneHash(ic.dAtoms);

    var centerAtomsResults = ic.centerAtoms(ic.hash2Atoms(ic.dAtoms));
    ic.maxD = centerAtomsResults.maxD;
    if (ic.maxD < 5) ic.maxD = 5;

    //show selected rotationcenter
    ic.opts['rotationcenter'] = 'display center';

    me.saveSelectionIfSelected();

    ic.draw();

    me.update2DdgmContent();
    me.updateHl2D();

    // show selected chains in annotation window
    me.showAnnoSelectedChains();
};
