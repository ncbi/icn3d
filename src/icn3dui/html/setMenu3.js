/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu3 = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion3' class='icn3d-accordion'>";
    html += "<h3 id='" + me.pre + "style'>Style</h3>";
    html += "<div>";

    html += me.setMenu3_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu3_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += "<li><span>Proteins</span>";
        html += "<ul>";
        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon');
        }
        else {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon', true);
        }

        html += me.getRadio('mn3_proteins', 'mn3_proteinsStrand', 'Strand');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsCylinder', 'Cylinder and Plate');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsSchematic', 'Schematic');

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace', true);
        }
        else {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace');
        }

        html += me.getRadio('mn3_proteins', 'mn3_proteinsBackbone', 'Backbone');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsBfactor', 'B-factor Tube');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsLines', 'Lines');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsStick', 'Stick');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsSphere', 'Sphere');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Side Chains</span>";
        html += "<ul>";

        html += me.getRadio('mn3_sidec', 'mn3_sidecLines', 'Lines');
        html += me.getRadio('mn3_sidec', 'mn3_sidecStick', 'Stick');
        html += me.getRadio('mn3_sidec', 'mn3_sidecBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_sidec', 'mn3_sidecSphere', 'Sphere');
        html += me.getRadio('mn3_sidec', 'mn3_sidecNo', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Nucleotides</span>";
        html += "<ul>";
        html += me.getRadio('mn3_nucl', 'mn3_nuclCartoon', 'Cartoon', true);
        html += me.getRadio('mn3_nucl', 'mn3_nuclPhos', "O3' Trace");
        html += me.getRadio('mn3_nucl', 'mn3_nuclBackbone', 'Backbone');
        html += me.getRadio('mn3_nucl', 'mn3_nuclSchematic', 'Schematic')
        html += me.getRadio('mn3_nucl', 'mn3_nuclLines', 'Lines');
        html += me.getRadio('mn3_nucl', 'mn3_nuclStick', 'Stick');
        html += me.getRadio('mn3_nucl', 'mn3_nuclBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_nucl', 'mn3_nuclSphere', 'Sphere');
        html += me.getRadio('mn3_nucl', 'mn3_nuclNo', 'Hide');
        html += "</ul>";
        html += "</li>";
    }

    html += "<li><span>Chemicals</span>";
    html += "<ul>";
    html += me.getRadio('mn3_lig', 'mn3_ligLines', 'Lines');
    if(me.cfg.cid === undefined) {
        html += me.getRadio('mn3_lig', 'mn3_ligStick', 'Stick', true);
        html += me.getRadio('mn3_lig', 'mn3_ligBallstick', 'Ball and Stick');
    }
    else {
        html += me.getRadio('mn3_lig', 'mn3_ligStick', 'Stick');
        html += me.getRadio('mn3_lig', 'mn3_ligBallstick', 'Ball and Stick', true);
    }
    html += me.getRadio('mn3_lig', 'mn3_ligSchematic', 'Schematic');
    html += me.getRadio('mn3_lig', 'mn3_ligSphere', 'Sphere');
    html += me.getRadio('mn3_lig', 'mn3_ligNo', 'Hide');
    html += "</ul>";
    html += "</li>";

    if(me.cfg.cid !== undefined) {
        html += "<li><span>Hydrogens</span>";
        html += "<ul>";
        html += me.getRadio('mn3_hydrogens', 'mn3_hydrogensYes', 'Show', true);
        html += me.getRadio('mn3_hydrogens', 'mn3_hydrogensNo', 'Hide');
        html += "</ul>";
        html += "</li>";
    }
    else {
        html += "<li><span>Glycans</span>";
        html += "<ul>";
        html += me.getRadio('mn3_glycansCart', 'mn3_glycansCartYes', 'Add Cartoon', true);
        html += me.getRadio('mn3_glycansCart', 'mn3_glycansCartNo', 'Remove Cartoon');
        html += "</ul>";
        html += "</li>";
    }

    html += "<li><span>Ions</span>";
    html += "<ul>";
    html += me.getRadio('mn3_ions', 'mn3_ionsSphere', 'Sphere', true);
    html += me.getRadio('mn3_ions', 'mn3_ionsDot', 'Dot');
    html += me.getRadio('mn3_ions', 'mn3_ionsNo', 'Hide');
    html += "</ul>";
    html += "</li>";

    html += "<li><span>Water</span>";
    html += "<ul>";
    html += me.getRadio('mn3_water', 'mn3_waterSphere', 'Sphere');
    html += me.getRadio('mn3_water', 'mn3_waterDot', 'Dot');
    html += me.getRadio('mn3_water', 'mn3_waterNo', 'Hide', true);
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn3_setThickness', 'Set Thickness');

    html += "<li>-</li>";

    html += me.getLink('mn3_styleSave', 'Save Style');
    html += me.getLink('mn3_styleApplySave', 'Apply Saved Style');

    html += "<li>-</li>";

    html += "<li><span>Surface Type</span>";
    html += "<ul>";
    html += me.getRadio('mn5_surface', 'mn5_surfaceVDW', 'Van der Waals');
    html += me.getRadio('mn5_surface', 'mn5_surfaceVDWContext', 'VDW with Context');
    html += me.getRadio('mn5_surface', 'mn5_surfaceMolecular', 'Molecular Surface');
    html += me.getRadio('mn5_surface', 'mn5_surfaceMolecularContext', 'MS with Context');
    html += me.getRadio('mn5_surface', 'mn5_surfaceSAS', 'Solvent Accessible');
    html += me.getRadio('mn5_surface', 'mn5_surfaceSASContext', 'SA with Context');
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn5_surfaceNo', 'Remove Surface');

    html += "<li><span>Surface Opacity</span>";
    html += "<ul>";
    html += me.getRadio('mn5_opacity', 'mn5_opacity10', '1.0', true);

    for(var i = 9; i > 0; --i) {
        html += me.getRadio('mn5_opacity', 'mn5_opacity0' + i, '0.' + i);
    }
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Surface <br>Wireframe</span>";
    html += "<ul>";
    html += me.getRadio('mn5_wireframe', 'mn5_wireframeYes', 'Yes');
    html += me.getRadio('mn5_wireframe', 'mn5_wireframeNo', 'No', true);
    html += "</ul>";
    html += "</li>";

    if(me.cfg.cid === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined) {
        html += "<li>-</li>";

        html += "<li id='" + me.pre + "mapWrapper1'><span>Electron Density</span>";
        html += "<ul>";
        html += me.getRadio('mn5_elecmap', 'mn5_elecmap2fofc', '2Fo-Fc Map');
        html += me.getRadio('mn5_elecmap', 'mn5_elecmapfofc', 'Fo-Fc Map');
        html += "</ul>";
        html += "</li>";

        html += me.getLinkWrapper('mn5_elecmapNo', 'Remove Map', 'mapWrapper2');

        html += "<li id='" + me.pre + "mapWrapper3'><span>Map <br>Wireframe</span>";
        html += "<ul>";
        html += me.getRadio('mn5_mapwireframe', 'mn5_mapwireframeYes', 'Yes', true);
        html += me.getRadio('mn5_mapwireframe', 'mn5_mapwireframeNo', 'No');
        html += "</ul>";
        html += "</li>";

        if(me.cfg.mmtfid === undefined) {
            //html += "<li>-</li>";

            html += me.getLinkWrapper('mn5_emmap', 'EM Density Map', 'emmapWrapper1');
            html += me.getLinkWrapper('mn5_emmapNo', 'Remove EM Map', 'emmapWrapper2');

            html += "<li id='" + me.pre + "emmapWrapper3'><span>EM Map <br>Wireframe</span>";
            html += "<ul>";
            html += me.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeYes', 'Yes', true);
            html += me.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeNo', 'No');
            html += "</ul>";
            html += "</li>";
        }
    }

    html += "<li>-</li>";

    html += "<li><span>Background</span>";
    html += "<ul>";
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdTransparent', 'Transparent', true);
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdBlack', 'Black');
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdGrey', 'Grey');
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdWhite', 'White');
    html += "</ul>";
    html += "</li>";

    html += "<li><span>Dialog Color</span>";
    html += "<ul>";
    html += me.getRadio('mn6_theme', 'mn6_themeBlue', 'Blue', true);
    html += me.getRadio('mn6_theme', 'mn6_themeOrange', 'Orange');
    html += me.getRadio('mn6_theme', 'mn6_themeBlack', 'Black');
    html += "</ul>";
    html += "</li>";

    html += "<li><span>Two-color Helix</span>";
    html += "<ul>";
    html += me.getRadio('mn6_doublecolor', 'mn6_doublecolorYes', 'Yes');
    html += me.getRadio('mn6_doublecolor', 'mn6_doublecolorNo', 'No', true);
    html += "</ul>";
    html += "</li>";


    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};
