/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.exportInteractions = function() { var me = this, ic = me.icn3d; "use strict";
   var text = '<html><body><div style="text-align:center"><br><b>Interacting residues</b>:<br/><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Base Chain: Residues</th><th>Interacting Chain</th></tr>';
   for(var fisrtChainid in me.chainname2residues) {
       for(var name in me.chainname2residues[fisrtChainid]) {
           var secondChainid = fisrtChainid.substr(0, fisrtChainid.indexOf('_')) + '_' + name.substr(0, name.indexOf(' '));
           text += '<tr><td>' + fisrtChainid + ': ';
           text += me.residueids2spec(me.chainname2residues[fisrtChainid][name]);
           text += '</td><td>' + secondChainid + '</td></tr>';
       }
   }
   text += '</table><br/></div></body></html>';
   var file_pref = (me.inputid) ? me.inputid : "custom";
   me.saveFile(file_pref + '_interactions.html', 'html', text);
};
iCn3DUI.prototype.exportSsbondPairs = function() { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    for(var structure in ic.structures) {
        var ssbondArray = ic.ssbondpnts[structure];
        if(ssbondArray === undefined) {
            break;
        }
        for(var i = 0, il = ssbondArray.length; i < il; i = i + 2) {
            var resid1 = ssbondArray[i];
            var resid2 = ssbondArray[i+1];
            tmpText += '<tr><td>' + resid1 + ' Cys</td><td>' + resid2 + ' Cys</td></tr>';
            ++cnt;
        }
    }
    var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' disulfide pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
    text += tmpText;
    text += '</table><br/></div></body></html>';
    var file_pref = (me.inputid) ? me.inputid : "custom";
    me.saveFile(file_pref + '_disulfide_pairs.html', 'html', text);
};
iCn3DUI.prototype.exportClbondPairs = function() { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    var residHash = {};
    for(var structure in ic.structures) {
        var clbondArray = ic.clbondpnts[structure];
        if(clbondArray === undefined) {
            break;
        }
        for(var i = 0, il = clbondArray.length; i < il; i = i + 2) {
            var resid1 = clbondArray[i];
            var resid2 = clbondArray[i+1];
            if(!residHash.hasOwnProperty(resid1 + '_' + resid2)) {
                var atom1 = ic.getFirstAtomObj(ic.residues[resid1]);
                var atom2 = ic.getFirstAtomObj(ic.residues[resid2]);
                tmpText += '<tr><td>' + resid1 + ' ' + atom1.resn + '</td><td>' + resid2 + ' ' + atom2.resn + '</td></tr>';
                ++cnt;
            }
            residHash[resid1 + '_' + resid2] = 1;
            residHash[resid2 + '_' + resid1] = 1;
        }
    }
    var text = '<html><body><div style="text-align:center"><br><b>' + cnt + ' cross-linkage pairs</b>:<br><br><table align=center border=1 cellpadding=10 cellspacing=0><tr><th>Residue ID 1</th><th>Residue ID 2</th></tr>';
    text += tmpText;
    text += '</table><br/></div></body></html>';
    var file_pref = (me.inputid) ? me.inputid : "custom";
    me.saveFile(file_pref + '_crosslinkage_pairs.html', 'html', text);
};
iCn3DUI.prototype.exportHbondPairs = function(type, labelType) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(var resid1 in me.resid2ResidhashHbond) {
        var resid1Real = me.convertLabel2Resid(resid1);
        var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
        var color1 = atom1.color.getHexString();
        for(var resid2 in me.resid2ResidhashHbond[resid1]) {
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist = Math.sqrt(me.resid2ResidhashHbond[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'hbond_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'hbond_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    var text = '<div style="text-align:center"><br><b>' + cnt
      + ' hydrogen bond pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
        + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        var hbondStr = me.getGraphLinks(me.resid2ResidhashHbond, me.resid2ResidhashHbond, me.hbondColor, labelType, me.hbondValue);
        return hbondStr;
    }
    else {
        return text;
    }
};
iCn3DUI.prototype.exportSaltbridgePairs = function(type, labelType) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(var resid1 in me.resid2ResidhashSaltbridge) {
        var resid1Real = me.convertLabel2Resid(resid1);
        var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
        var color1 = atom1.color.getHexString();
        for(var resid2 in me.resid2ResidhashSaltbridge[resid1]) {
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist = Math.sqrt(me.resid2ResidhashSaltbridge[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'saltb_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'saltb_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    var text = '<div style="text-align:center"><br><b>' + cnt
      + ' salt bridge/ionic interaction pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
          + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        var hbondStr = me.getGraphLinks(me.resid2ResidhashSaltbridge, me.resid2ResidhashSaltbridge, me.ionicColor, labelType, me.ionicValue);
        return hbondStr;
    }
    else {
        return text;
    }
};
iCn3DUI.prototype.exportHalogenPiPairs = function(type, labelType, interactionType) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    var resid2Residhash, color, value;
    if(interactionType == 'halogen') {
        resid2Residhash = me.resid2ResidhashHalogen;
        color = me.halogenColor;
        value = me.halogenValue;
    }
    else if(interactionType == 'pi-cation') {
        resid2Residhash = me.resid2ResidhashPication;
        color = me.picationColor;
        value = me.picationValue;
    }
    else if(interactionType == 'pi-stacking') {
        resid2Residhash = me.resid2ResidhashPistacking;
        color = me.pistackingColor;
        value = me.pistackingValue;
    }
    for(var resid1 in resid2Residhash) {
        var resid1Real = me.convertLabel2Resid(resid1);
        var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
        var color1 = atom1.color.getHexString();
        for(var resid2 in resid2Residhash[resid1]) {
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist = Math.sqrt(resid2Residhash[resid1][resid2]).toFixed(1);
            tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + dist + '</td>';
            if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    var text = '<div style="text-align:center"><br><b>' + cnt
      + ' ' + interactionType + ' pairs</b>:</div><br>';
    if(cnt > 0) {
        text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
          + '<tr><th>Atom 1</th><th>Atom 2</th><th>Distance (&#8491;)</th>';
        if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
        text += '</tr>';
        text += tmpText;
        text += '</table><br/>';
    }
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        var hbondStr = me.getGraphLinks(resid2Residhash, resid2Residhash, color, labelType, value);
        return hbondStr;
    }
    else {
        return text;
    }
};
iCn3DUI.prototype.exportSpherePairs = function(bInteraction, type, labelType) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    var cnt = 0;
    var residHash = (bInteraction) ? me.resid2ResidhashInteractions : me.resid2ResidhashSphere;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    for(var resid1 in residHash) { // e.g., resid1: TYR $1KQ2.A:42
        var resid1Real = me.convertLabel2Resid(resid1);
        var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
        var color1 = atom1.color.getHexString();
        for(var resid2 in residHash[resid1]) {
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist1_dist2_atom1_atom2 = residHash[resid1][resid2].split('_');
            var dist1 = dist1_dist2_atom1_atom2[0];
            var dist2 = dist1_dist2_atom1_atom2[1];
            atom1 = dist1_dist2_atom1_atom2[2];
            atom2 = dist1_dist2_atom1_atom2[3];
            var contactCnt = dist1_dist2_atom1_atom2[4];
            if(bInteraction) {
                tmpText += '<tr><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1 + colorText1 + color1 + colorText2 + '</td><td><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2 + colorText1 + color2 + colorText2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
                if(type == 'view') tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
                tmpText += '</tr>';
            }
            else {
                tmpText += '<tr><td>' + resid1 + '</td><td>' + resid2 + '</td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td></tr>';
            }
            ++cnt;
        }
    }
    var nameStr = (bInteraction) ? "the contacts" : "sphere";
    var text = '<div style="text-align:center"><br><b>' + cnt
      + ' residue pairs in ' + nameStr + '</b>:</div><br>';
    if(cnt > 0) {
        if(bInteraction) {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th>';
            if(type == 'view') text += '<th align="center">Highlight in 3D</th>';
            text += '</tr>';
        }
        else {
            text += '<br><table align=center border=1 cellpadding=10 cellspacing=0>'
              + '<tr><th>Residue 1</th><th>Residue 2</th><th align="center">Num Contacts</th><th align="center">Min Distance (&#8491;)</th><th align="center">C-alpha Distance (&#8491;)</th></tr>';
        }
        text += tmpText;
        text += '</table><br/>';
    }
    if(type == 'graph' || type == 'linegraph' || type == 'scatterplot') {
        var interStr = me.getGraphLinks(residHash, residHash, me.contactColor, labelType, me.contactValue);
        return interStr;
    }
    else {
        return text;
    }
};
