/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */


iCn3D.prototype.createCurveSubArrow = function (p, width, colors, div, bHighlight, bRibbon, num, positionIndex, pntsCA, prevCOArray, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo) { var me = this, ic = me.icn3d; "use strict";
    var divPoints = [], positions = [];

    divPoints.push(p);
    positions.push(positionIndex);

    this.prepareStrand(divPoints, positions, width, colors, div, undefined, bHighlight, bRibbon, num, pntsCA, prevCOArray, false, bShowArray, calphaIdArray, bShowArrow, prevone, nexttwo);

    divPoints = [];
    positions = [];
};
