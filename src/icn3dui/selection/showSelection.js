/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showSelection = function () { var me = this, ic = me.icn3d; "use strict";
    ic.dAtoms = {};

    if(Object.keys(ic.hAtoms).length == 0) me.selectAll_base();

    ic.dAtoms = ic.cloneHash(ic.hAtoms);

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

    // update 2d graph
    if(me.graphStr !== undefined) {
      me.graphStr = me.getGraphDataForDisplayed();
    }

    if(me.bGraph) me.drawGraph(me.graphStr);
    if(me.bLinegraph) me.drawLineGraph(me.graphStr);
    if(me.bScatterplot) me.drawLineGraph(me.graphStr, true);
};
