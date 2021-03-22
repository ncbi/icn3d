/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.getAllInteractionTable = function(type) { var me = this, ic = me.icn3d; "use strict";
    var residsArray = Object.keys(ic.resids2inter);
    if(type == 'save1') {
       residsArray.sort(function(a,b) {
          return me.compResid(a, b, type);
       });
    }
    else if(type == 'save2') {
       residsArray.sort(function(a,b) {
          return me.compResid(a, b, type);
       });
    }
    //ic.resids2inter
    tmpText = '';
    var prevResidname1 = '', prevIds = '';
    var strHbond = '', strIonic = '', strContact = '', strHalegen = '', strPication = '', strPistacking = '';
    var cntHbond = 0, cntIonic = 0, cntContact = 0, cntHalegen = 0, cntPication = 0, cntPistacking = 0;
    for(var i = 0, il = residsArray.length; i < il; ++i) {
        var resids = residsArray[i];
        var residname1_residname2 = resids.split(',');
        var residname1 = (type == 'save1') ? residname1_residname2[0] : residname1_residname2[1];
        var residname2 = (type == 'save1') ? residname1_residname2[1] : residname1_residname2[0];
        // stru_chain_resi_resn
        var ids = residname1.split('_');
        if(i > 0 && residname1 != prevResidname1) {
            tmpText += me.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
              cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
            strHbond = ''; strIonic = ''; strContact = ''; strHalegen = ''; strPication = ''; strPistacking = '';
            cntHbond = 0; cntIonic = 0; cntContact = 0; cntHalegen = 0; cntPication = 0; cntPistacking = 0;
        }
        var labels2dist, result;
        labels2dist = ic.resids2inter[resids]['hbond'];
        result = me.getInteractionPairDetails(labels2dist, type, 'hbond');
        strHbond += result.html;
        cntHbond += result.cnt;
        labels2dist = ic.resids2inter[resids]['ionic'];
        result = me.getInteractionPairDetails(labels2dist, type, 'ionic');
        strIonic += result.html;
        cntIonic += result.cnt;
        labels2dist = ic.resids2inter[resids]['contact'];
        result = me.getContactPairDetails(labels2dist, type, 'contact');
        strContact += result.html;
        cntContact += result.cnt;
        labels2dist = ic.resids2inter[resids]['halogen'];
        result = me.getInteractionPairDetails(labels2dist, type, 'halogen');
        strHalegen += result.html;
        cntHalegen += result.cnt;
        labels2dist = ic.resids2inter[resids]['pi-cation'];
        result = me.getInteractionPairDetails(labels2dist, type, 'pi-cation');
        strPication += result.html;
        cntPication += result.cnt;
        labels2dist = ic.resids2inter[resids]['pi-stacking'];
        result = me.getInteractionPairDetails(labels2dist, type, 'pi-stacking');
        strPistacking += result.html;
        cntPistacking += result.cnt;
        prevResidname1 = residname1;
        prevIds = ids;
    }
    tmpText += me.getInteractionPerResidue(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
      cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking);
    var html = '';
    if(residsArray.length > 0) {
        html += '<br><table class="icn3d-sticky" align=center border=1 cellpadding=10 cellspacing=0><thead>';
        html += '<tr><th rowspan=2>Residue</th><th rowspan=2># Hydrogen<br>Bond</th><th rowspan=2># Salt Bridge<br>/Ionic Interaction</th><th rowspan=2># Contact</th>';
        html += '<th rowspan=2># Halogen<br>Bond</th><th rowspan=2># &pi;-Cation</th><th rowspan=2># &pi;-Stacking</th>';
        html += '<th>Hydrogen Bond</th><th>Salt Bridge/Ionic Interaction</th><th>Contact</th>';
        html += '<th>Halogen Bond</th><th>&pi;-Cation</th><th>&pi;-Stacking</th></tr>';
        html += '<tr>';
        var tmpStr = '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td>Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
        html += tmpStr;
        html += tmpStr;
        html += '<td><table width="100%" class="icn3d-border"><tr><td>Atom1</td><td>Atom2</td><td># Contacts</td><td>Min Distance (&#8491;)</td><td>C-alpha Distance (&#8491;)</td><td>Highlight in 3D</td></tr></table></td>';
        html += tmpStr;
        html += tmpStr;
        html += tmpStr;
        html += '</tr>';
        html += '</thead><tbody>';
        html += tmpText;
        html += '</tbody></table><br/>';
    }
    return  html;
};
iCn3DUI.prototype.getInteractionPerResidue = function(prevIds, strHbond, strIonic, strContact, strHalegen, strPication, strPistacking,
  cntHbond, cntIonic, cntContact, cntHalegen, cntPication, cntPistacking) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '';
    tmpText += '<tr align="center"><th>' + prevIds[3] + prevIds[2] + '</th><td>' + cntHbond + '</td><td>' + cntIonic + '</td><td>' + cntContact + '</td><td>' + cntHalegen + '</td><td>' + cntPication + '</td><td>' + cntPistacking + '</td>';

    var itemArray = [strHbond, strIonic, strContact, strHalegen, strPication, strPistacking];
    for(var i in itemArray) {
        var item = itemArray[i];
        tmpText += '<td valign="top"><table width="100%" class="icn3d-border">' + item + '</table></td>';
    }
    tmpText += '</tr>';
    return tmpText;
};
iCn3DUI.prototype.getInteractionPairDetails = function(labels2dist, type, interactionType) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '', cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    if(labels2dist !== undefined) {
        for(var labels in labels2dist) {
            var resid1_resid2 = labels.split(',');
            var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
            var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist = Math.sqrt(labels2dist[labels]).toFixed(1);
            tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + interactionType + '2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + dist + '</td>';
            tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            ++cnt;
        }
    }
    return {html: tmpText, cnt: cnt};
};
iCn3DUI.prototype.getContactPairDetails = function(labels2dist, type) { var me = this, ic = me.icn3d; "use strict";
    var tmpText = '', cnt = 0;
    var colorText1 = ' <span style="background-color:#';
    var colorText2 = '">&nbsp;&nbsp;&nbsp;</span>';
    if(labels2dist !== undefined) {
        for(var labels in labels2dist) {
            var resid1_resid2 = labels.split(',');
            var resid1 = (type == 'save1') ? resid1_resid2[0] : resid1_resid2[1];
            var resid2 = (type == 'save1') ? resid1_resid2[1] : resid1_resid2[0];
            var resid1Real = me.convertLabel2Resid(resid1);
            var atom1 = ic.getFirstAtomObj(ic.residues[resid1Real]);
            var color1 = atom1.color.getHexString();
            var resid2Real = me.convertLabel2Resid(resid2);
            var atom2 = ic.getFirstAtomObj(ic.residues[resid2Real]);
            var color2 = atom2.color.getHexString();
            var dist1_dist2_atom1_atom2 = labels2dist[labels].split('_');
            var dist1 = dist1_dist2_atom1_atom2[0];
            var dist2 = dist1_dist2_atom1_atom2[1];
            var atom1Name = dist1_dist2_atom1_atom2[2];
            var atom2Name = dist1_dist2_atom1_atom2[3];
            var contactCnt = dist1_dist2_atom1_atom2[4];
            tmpText += '<tr><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'a" resid="' + resid1 + '"/> ' + resid1 + '@' + atom1Name + colorText1 + color1 + colorText2 + '</span></td><td><span style="white-space:nowrap"><input type="checkbox" class="' + me.pre + 'seloneres" id="' + me.pre + 'inter2_' +  cnt + 'b" resid="' + resid2 + '"/> ' + resid2 + '@' + atom2Name + colorText1 + color2 + colorText2 + '</span></td><td align="center">' + contactCnt + '</td><td align="center">' + dist1 + '</td><td align="center">' + dist2 + '</td>';
            tmpText += '<td align="center"><button class="' + me.pre + 'selres" resid="' + resid1 + '|' + resid2 + '">Highlight</button></td>';
            tmpText += '</tr>';
            cnt += parseInt(contactCnt);
        }
    }
    return {html: tmpText, cnt: cnt};
};
