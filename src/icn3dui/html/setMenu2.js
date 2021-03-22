/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu2 = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion2' class='icn3d-accordion'>";
    html += "<h3>Select</h3>";
    html += "<div>";

    html += me.setMenu2_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu2_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_definedsets', 'Defined Sets');
    html += me.getLink('mn2_selectall', 'All');
    html += me.getLink('mn2_selectdisplayed', 'Displayed Set');
    html += me.getLink('mn2_aroundsphere', 'by Distance');

    html += "<li><span>by Property</span>";
    html += "<ul>";
    html += me.getLink('mn2_propPos', 'Positive');
    html += me.getLink('mn2_propNeg', 'Negative');
    html += me.getLink('mn2_propHydro', 'Hydrophobic');
    html += me.getLink('mn2_propPolar', 'Polar');
    html += me.getLink('mn2_propBfactor', 'B-factor');
    html += me.getLink('mn2_propSolAcc', 'Solvent Accessibility');
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn2_selectcomplement', 'Inverse');
    html += me.getLink('mn2_selectmainchains', 'Main Chains');
    html += me.getLink('mn2_selectsidechains', 'Side Chains');
    html += me.getLink('mn2_selectmainsidechains', 'Main & Side Chains');
    html += me.getLink('mn2_command', 'Advanced');

    if(me.cfg.cid === undefined) {
        html += "<li><span>Select on 3D</span>";
        html += "<ul>";

        html += "<li>\"Alt\"+Click: start selection</li>";
        html += "<li>\"Ctrl\"+Click: union selection</li>";
        html += "<li>\"Shift\"+Click: range Selection</li>";
        html += "<li>-</li>";
        html += me.getRadio('mn2_pk', 'mn2_pkChain', 'Chain');
        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
            html += me.getRadio('mn2_pk', 'mn2_pkDomain', '3D Domain');
        }
        html += me.getRadio('mn2_pk', 'mn2_pkStrand', 'Strand/Helix');
        html += me.getRadio('mn2_pk', 'mn2_pkResidue', 'Residue', true);
        html += me.getRadio('mn2_pk', 'mn2_pkYes', 'Atom');
        html += me.getRadio('mn2_pk', 'mn2_pkNo', 'None');
        html += "</ul>";
        html += "</li>";
    }
    else {
        if(me.isMobile()) {
            html += "<li><span>Touch to pick</span>";
        }
        else {
            html += "<li><span>Picking with<br>\"Alt\" + Click</span>";
        }
    }

    html += "<li>-</li>";

    html += me.getLink('mn2_saveselection', 'Save Selection');
    html += me.getLink('clearall', 'Clear Selection');

    html += "<li>-</li>";

    html += "<li><span>Highlight Color</span>";
    html += "<ul>";
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrYellow', 'Yellow', true);
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrGreen', 'Green');
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrRed', 'Red');
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Highlight Style</span>";
    html += "<ul>";

    html += me.getRadio('mn2_hl_style', 'mn2_hl_styleOutline', 'Outline', true);
    html += me.getRadio('mn2_hl_style', 'mn2_hl_styleObject', '3D Objects');
    //html += me.getRadio('mn2_hl_style', 'mn2_hl_styleNone', 'No Highlight');

    html += "</ul>";
    html += "</li>";

    //html += me.getLink('mn2_hl_styleNone', 'Clear Highlight');

    html += me.getLink('toggleHighlight2', 'Toggle Highlight');

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};
