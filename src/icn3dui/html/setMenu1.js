/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu1 = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion1' class='icn3d-accordion'>";
    html += "<h3>File</h3>";
    html += "<div>";

    html += me.setMenu1_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu1_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";
    html += "<li><span>Retrieve by ID</span>";
    html += "<ul>";
    html += me.getLink('mn1_mmdbid', 'MMDB ID ' + me.wifiStr);
    html += me.getLink('mn1_mmtfid', 'MMTF ID ' + me.wifiStr);
    html += me.getLink('mn1_pdbid', 'PDB ID ' + me.wifiStr);
    html += me.getLink('mn1_opmid', 'OPM PDB ID ' + me.wifiStr);
    html += me.getLink('mn1_mmcifid', 'mmCIF ID ' + me.wifiStr);
    html += me.getLink('mn1_gi', 'NCBI gi ' + me.wifiStr);
    html += me.getLink('mn1_cid', 'PubChem CID ' + me.wifiStr);
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Open File</span>";
    html += "<ul>";
    html += me.getLink('mn1_pdbfile', 'PDB File');
    html += me.getLink('mn1_mmciffile', 'mmCIF File');
    html += me.getLink('mn1_mol2file', 'Mol2 File');
    html += me.getLink('mn1_sdffile', 'SDF File');
    html += me.getLink('mn1_xyzfile', 'XYZ File');
    html += me.getLink('mn1_urlfile', 'URL (Same Host) ' + me.wifiStr);
    html += "<li>-</li>";
    html += me.getLink('mn1_pngimage', 'iCn3D PNG Image');
    html += me.getLink('mn1_state', 'State/Script File');
    html += me.getLink('mn1_fixedversion', 'Share Link in Archived Ver. ' + me.wifiStr);
    html += me.getLink('mn1_selection', 'Selection File');
    html += "<li>-</li>";

    html += "<li><span>Electron Density (DSN6)</span>";
    html += "<ul>";
    html += me.getLink('mn1_dsn6', 'Local File');
    html += me.getLink('mn1_dsn6url', 'URL (Same Host) ' + me.wifiStr);
    html += "</ul>";

    html += "</ul>";
    html += "</li>";
    html += "<li><span>Align</span>";
    html += "<ul>";
    html += me.getLink('mn1_blast_rep_id', 'Sequence to Structure ' + me.wifiStr);
    html += me.getLink('mn1_align', 'Structure to Structure ' + me.wifiStr);
    //html += me.getLink('mn1_chainalign', 'Chain to Chain');
    html += me.getLink('mn1_chainalign', 'Multiple Chains ' + me.wifiStr);

    html += "</ul>";
    html += "</li>";

    //html += me.getLink('mn2_realignonseqalign', 'Realign Selection');

    html += "<li id='" + me.pre + "mn2_realignWrap'><span>Realign Selection</span>";
    html += "<ul>";
    html += me.getRadio('mn2_realign', 'mn2_realignonseqalign', 'on Sequence Alignment ' + me.wifiStr, true);
    html += me.getRadio('mn2_realign', 'mn2_realignresbyres', 'Residue by Residue');
    html += "</ul>";
    html += "</li>";

    html += "<li><span>3D Printing</span>";
    html += "<ul>";
    if(me.cfg.cid === undefined) {
        html += me.getLink('mn1_exportVrmlStab', 'VRML (Color, W/  Stabilizers)');
        html += me.getLink('mn1_exportStlStab', 'STL (W/  Stabilizers)');
        html += "<li>-</li>";
        html += me.getLink('mn1_exportVrml', 'VRML (Color)');
        html += me.getLink('mn1_exportStl', 'STL');
        html += "<li>-</li>";
        html += me.getLink('mn1_stabilizerYes', 'Add All  Stabilizers');
        html += me.getLink('mn1_stabilizerNo', 'Remove All  Stabilizers');
        html += "<li>-</li>";
        html += me.getLink('mn1_stabilizerOne', 'Add One  Stabilizer');
        html += me.getLink('mn1_stabilizerRmOne', 'Remove One  Stabilizer');
        html += "<li>-</li>";
        html += me.getLink('mn1_thicknessSet', 'Set Thickness');
        html += me.getLink('mn1_thicknessReset', 'Reset Thickness');
    }
    else {
        html += me.getLink('mn1_exportVrml', 'VRML (Color)');
        html += me.getLink('mn1_exportStl', 'STL');
    }

    html += "</ul>";
    html += "</li>";

    html += "<li><span>Save Files</span>";
    html += "<ul>";
    //html += me.getLink('mn1_exportCanvas', 'iCn3D PNG Image');

    html += "<li><span>iCn3D PNG Image</span>";
    html += "<ul>";
    html += me.getLink('mn1_exportCanvas', 'Original Size');
    html += me.getLink('mn1_exportCanvas2', '2X Large');
    html += me.getLink('mn1_exportCanvas4', '4X Large');
    html += me.getLink('mn1_exportCanvas8', '8X Large');
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn1_exportState', 'State File');
    html += me.getLink('mn1_exportSelections', 'Selection File');
    html += me.getLink('mn1_exportCounts', 'Residue Counts');

/*
    html += "<li><span>PDB</span>";
    html += "<ul>";
    html += me.getLink('mn1_exportPdbRes', 'Selected Residues');
    html += me.getLink('mn1_exportPdbChain', 'Selected Chains');
    html += "<li><br/></li>";
    html += "</ul>";
    html += "</li>";
*/

    html += me.getLink('mn1_exportPdbRes', 'PDB');
    html += "<li><br/></li>";

    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn1_sharelink', 'Share Link ' + me.wifiStr);

    html += me.getLink('mn1_replayon', 'Replay Each Step');

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};
