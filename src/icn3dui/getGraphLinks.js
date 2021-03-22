/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getGraphLinks = function(hash1, hash2, color, labelType, value) { var me = this, ic = me.icn3d; "use strict";
    var hbondStr = '';
    value = (value === undefined) ? 1 : value;
    var prevLinkStr = '';
    for(var resid1 in hash1) {
        //ASN $1KQ2.A:6@ND2
        //or ASN $1KQ2.A:6
        resid1 = resid1.trim();
        var pos1a = resid1.indexOf(' ');
        var pos1b = resid1.indexOf(':');
        var posTmp1 = resid1.indexOf('@');
        var pos1c = (posTmp1 !== -1) ? posTmp1 : resid1.length;
        var pos1d = resid1.indexOf('.');
        var pos1e = resid1.indexOf('$');
        var resName1 = ic.residueName2Abbr(resid1.substr(0, pos1a)) + resid1.substr(pos1b + 1, pos1c - pos1b - 1);
        if(labelType == 'chain' || labelType == 'structure') resName1 += '.' + resid1.substr(pos1d + 1, pos1b - pos1d - 1);
        if(labelType == 'structure') resName1 += '.' + resid1.substr(pos1e + 1, pos1d - pos1e - 1);
        for(var resid2 in hash2[resid1]) {
            resid2 = resid2.trim();
            var pos2a = resid2.indexOf(' ');
            var pos2b = resid2.indexOf(':');
            var posTmp2 = resid2.indexOf('@');
            var pos2c = (posTmp2 !== -1) ? posTmp2 : resid2.length;
            var pos2d = resid2.indexOf('.');
            var pos2e = resid2.indexOf('$');
            var resName2 = ic.residueName2Abbr(resid2.substr(0, pos2a)) + resid2.substr(pos2b + 1, pos2c - pos2b - 1); //
                + '_' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
            if(labelType == 'chain' || labelType == 'structure') resName2 += '.' + resid2.substr(pos2d + 1, pos2b - pos2d - 1);
            if(labelType == 'structure') resName2 += '.' + resid2.substr(pos2e + 1, pos2d - pos2e - 1);
            var linkStr = ', {"source": "' + resName1 + '", "target": "' + resName2 + '", "v": ' + value + ', "c": "' + color + '"}';
            if(linkStr != prevLinkStr) hbondStr += linkStr;
            prevLinkStr = linkStr;
        }
    }
    return hbondStr;
};
iCn3DUI.prototype.convertLabel2Resid = function(residLabel) { var me = this, ic = me.icn3d; "use strict";
    //ASN $1KQ2.A:6@ND2
    //or ASN $1KQ2.A:6
    var pos1 = residLabel.indexOf(' ');
    var pos2Tmp = residLabel.indexOf('@');
    var pos2 = (pos2Tmp !== -1) ? pos2Tmp : residLabel.length;
    var pos3 = residLabel.indexOf('$');
    var pos4 = residLabel.indexOf('.');
    var pos5 = residLabel.indexOf(':');
    var resid = residLabel.substr(pos3 + 1, pos4 - pos3 - 1) + '_' + residLabel.substr(pos4 + 1, pos5 - pos4 - 1)
        + '_' + residLabel.substr(pos5 + 1, pos2 - pos5 - 1);
    return resid;
};
