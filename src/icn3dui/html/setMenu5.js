/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu5 = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion5' class='icn3d-accordion'>";
    html += "<h3 id='" + me.pre + "analysis' style='font-size:1.2em'>&nbsp;Analysis</h3>";
    html += "<div>";

    html += me.setMenu5_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu5_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += me.getLink('mn6_selectannotations', 'View Sequences<br>& Annotations ' + me.wifiStr);

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign || me.bSymd) {
            html += me.getLink('mn2_alignment', 'View Aligned<br>Sequences ' + me.wifiStr);
        }

        //html += me.getLink('mn2_selectresidues', 'View Sequences');
        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
          html += me.getLink('mn2_2ddgm', 'View 2D Diagram ' + me.wifiStr);
        }

        html += me.getLink('definedsets2', 'Defined Sets');

        html += "<li>-</li>";

        html += me.getLink('mn6_hbondsYes', 'H-Bonds <br>& Interactions');
        //html += me.getLink('mn6_hbondsNo', 'Remove H-Bonds <br>& Interactions');

        html += "<li><span>Bring to Front</span>";
        html += "<ul>";
        html += me.getLink('mn1_window_table', 'Interaction Table');
        html += me.getLink('mn1_window_linegraph', '2D Interaction Network');
        html += me.getLink('mn1_window_scatterplot', '2D Interaction Map');
        html += me.getLink('mn1_window_graph', '2D Graph (Force-Directed)');
        html += "</ul>";
        html += "</li>";

        if(!me.cfg.notebook) html += me.getLink('mn1_mutation', 'Mutation ' + me.licenseStr);

        html += "<li>-</li>";
    }

    if(!me.cfg.notebook) {
        html += me.getLink('mn1_delphi', 'DelPhi Potential ' + me.licenseStr);
        html += "<li><span>Load PQR/Phi</span>";
        html += "<ul>";
        html += me.getLink('mn1_phi', 'Local PQR/Phi/Cube File');
        html += me.getLink('mn1_phiurl', 'URL PQR/Phi/Cube File');
        html += "</ul>";
        html += me.getLink('delphipqr', 'Download PQR');

        html += "<li>-</li>";
    }

    html += "<li><span>Distance</span>";
    html += "<ul>";
    html += me.getRadio('mn6_distance', 'mn6_distanceYes', 'between Two Atoms');
    html += me.getRadio('mn6_distance', 'mn6_distTwoSets', 'between Two Sets');
    html += me.getRadio('mn6_distance', 'mn6_distanceNo', 'Hide', true);
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn6_area', 'Surface Area');

    html += "<li><span>Label</span>";
    html += "<ul>";
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelYes', 'by Picking Atoms');
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelSelection', 'per Selection');
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelAtoms', 'per Atom');
    if(me.cfg.cid === undefined) {
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelResidues', 'per Residue');
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelResnum', 'per Residue & Number');
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelChains', 'per Chain');
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelTermini', 'N- & C-Termini');
    }
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelNo', 'Remove', true);
    html += "</ul>";
    html += "</li>";

    html += "<li><span>Label Scale</span>";
    html += "<ul>";

    for(var i = 1; i <= 9; ++i) {
        if(i == 3) {
            html += me.getRadio('mn6_labelscale', 'mn6_labelscale0' + i, '0.' + i, true);
        }
        else {
            html += me.getRadio('mn6_labelscale', 'mn6_labelscale0' + i, '0.' + i);
        }
    }

    for(var i = 1; i <= 4; i *= 2) {
        html += me.getRadio('mn6_labelscale', 'mn6_labelscale' + i + '0', i + '.0');
    }

    html += "</ul>";
    html += "</li>";

    html += "<li>-</li>";

    if(me.cfg.cid === undefined) {
        html += "<li><span>Chem. Binding</span>";
        html += "<ul>";
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindingshow', 'Show');
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindinghide', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Disulfide Bonds</span>";
        html += "<ul>";
        html += me.getRadio('mn6_ssbonds', 'mn6_ssbondsYes', 'Show', true);
        html += me.getRadio('mn6_ssbonds', 'mn6_ssbondsExport', 'Export Pairs');
        html += me.getRadio('mn6_ssbonds', 'mn6_ssbondsNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Cross-Linkages</span>";
        html += "<ul>";
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsYes', 'Show', true);
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsExport', 'Export Pairs');
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        var bOnePdb = me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined;
        if(bOnePdb) {
          html += "<li id='" + me.pre + "assemblyWrapper'><span>Assembly</span>";
          html += "<ul>";

          html += me.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', true);
          html += me.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit');

          html += "</ul>";
          html += "</li>";

        }

        html += "<li><span>Symmetry</span>";
        html += "<ul>";
        if(bOnePdb) html += me.getLink('mn6_symmetry', 'from RCSB (precalculated) ' + me.wifiStr);
        html += me.getLink('mn6_symd', 'from SymD (Dynamic) ' + me.wifiStr);
        html += me.getLink('mn6_clear_sym', 'Clear SymD Symmetry');
        html += "</ul>";
        html += "</li>";

        html += "<li>-</li>";
    }

    html += me.getLink('mn6_yournote', 'Your Note /<br>Window Title');

    if(me.cfg.cid !== undefined) {
        html += "<li><span>Links</span>";
        html += "<ul>";
        html += me.getLink('mn1_link_structure', 'Compound Summary ' + me.wifiStr);
        html += me.getLink('mn1_link_vast', 'Similar Compounds ' + me.wifiStr);
        html += me.getLink('mn1_link_bind', 'Structures Bound ' + me.wifiStr);
        html += "</ul>";
        html += "</li>";
    }
    else {
        html += "<li><span>Links</span>";
        html += "<ul>";
        html += me.getLink('mn1_link_structure', 'Structure Summary ' + me.wifiStr);
        html += me.getLink('mn1_link_vast', 'Similar Structures ' + me.wifiStr);
        html += me.getLink('mn1_link_pubmed', 'Literature ' + me.wifiStr);
        html += me.getLink('mn1_link_protein', 'Protein ' + me.wifiStr);
        //html += me.getLink('mn1_link_gene', 'Gene');
        //html += me.getLink('mn1_link_chemicals', 'Chemicals');
        html += "</ul>";
        html += "</li>";
    }

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};
