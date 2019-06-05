/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTools = function() { var me = this;
    var html = "";

    html += "  <div id='" + me.pre + "selection' style='display:none;'><div style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 3px;'>";
    html += "    <table style='margin-top: 3px; width:100px;'><tr valign='center'>";

    html += me.setTools_base();

    // add custom buttons here
    // ...

    html += "    </tr></table>";
    html += "  </div></div>";

    return html;
};

iCn3DUI.prototype.setButton = function(buttonStyle, id, title, text) { var me = this;
    var bkgdColor = me.isMobile() ? ' background-color:#DDDDDD;' : '';
    return "<div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;" + bkgdColor + "' id='" + me.pre + id + "'><span style='white-space:nowrap' class='icn3d-commandTitle' title='" + title + "'>" + text + "</span></button></div>";
};

iCn3DUI.prototype.setTools_base = function() { var me = this;
    // second row
    var html = "";

    var buttonStyle = me.isMobile() ? 'none' : 'button';

    html += "      <td valign='top'>" + me.setButton(buttonStyle, 'saveimage', 'Save iCn3D PNG Image', 'Save iCn3D<br/>PNG Image') + "</td>";

    if(me.cfg.cid === undefined) {
        //html += "      <td valign='top'>" + me.setButton(buttonStyle, 'definedSets', 'Select defined structure, chain, and custom sets', 'Defined <br/>Sets') + "</td>";
        html += "      <td valign='top'>" + me.setButton(buttonStyle, 'definedsets', 'Defined Sets', 'Defined<br/>Sets') + "</td>";

        html += "      <td valign='top'>" + me.setButton(buttonStyle, 'show_annotations', 'View sequences and annotations for each chain', 'View Sequences<br/>& Annotations') + "</td>";

        if(me.cfg.align !== undefined) {
            html += "      <td valign='top'>" + me.setButton(buttonStyle, 'show_alignsequences', 'View the sequences of the aligned structures', 'Aligned<br/>Sequences') + "</td>";
        }

        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined) {
            html += "      <td valign='top'>" + me.setButton(buttonStyle, 'show_2ddgm', 'View the interactions of the structure', 'View<br/>Interactions') + "</td>";
        }

        html += "      <td valign='top'>" + me.setButton(buttonStyle, 'chemicalbindingshow', 'View Chemical Binding', 'View Chemical<br/>Binding') + "</td>";

        html += "      <td valign='top'>" + me.setButton(buttonStyle, 'alternate', 'Alternate the structures', 'Alternate<br/>(Key \"a\")') + "</td>";
    }

    html += "      <td valign='top'>" + me.setButton(buttonStyle, 'show_selected', 'View ONLY the selected atoms', 'View Only<br/>Selection') + "</td>";

    html += "      <td valign='top'>" + me.setButton(buttonStyle, 'toggleHighlight', 'Turn on and off the 3D highlight in the viewer', 'Toggle<br/>Highlight') + "</td>";

    if(me.cfg.cid === undefined) {
        html += "      <td valign='top'>" + me.setButton(buttonStyle, 'removeLabels', 'Remove Labels', 'Remove<br/>Labels') + "</td>";
    }

    return html;
};

iCn3DUI.prototype.setTopMenusHtml = function (id) { var me = this;
    var html = "";

    html += "<div style='position:relative;'>";

    html += "<div id='" + me.pre + "popup' class='icn3d-text icn3d-popup'></div>";

    html += "  <!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
    html += "  <div id='" + me.pre + "mnlist' style='position:absolute; z-index:999; float:left; display:table-row; margin-top: -2px;'>";
    html += "    <table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

    html += "    <td valign='top'>" + me.setMenu1() + "</td>";
    html += "    <td valign='top'>" + me.setMenu2() + "</td>";
    html += "    <td valign='top'>" + me.setMenu2b() + "</td>";
    html += "    <td valign='top'>" + me.setMenu3() + "</td>";
    html += "    <td valign='top'>" + me.setMenu4() + "</td>";
    html += "    <td valign='top'>" + me.setMenu5() + "</td>";
    //html += "    <td valign='top'>" + me.setMenu5b() + "</td>";
    html += "    <td valign='top'>" + me.setMenu6() + "</td>";

    html += "    <td valign='top'><div style='position:relative; margin-left:6px;'><label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left (\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
    html += "    <div class='icn3d-commandTitle' style='min-width:40px; margin-top: 3px; white-space: nowrap;'><span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div></td>";

    //html += '    <td valign="top"><div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px;"><div style="width:20px; display:inline-block; margin-left:6px;"><span id="' + me.pre +  'selection_expand" class="ui-icon ui-icon-plus icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre +  'selection_shrink" class="ui-icon ui-icon-minus icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> Tools</div></td>';

    //html += '    <td valign="top"><div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px;"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand"><span class="ui-icon ui-icon-plus"></span> Show Tools</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink"><span class="ui-icon ui-icon-minus"></span> Hide Tools</span></div></td>';
    html += '    <td valign="top"><div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px; border-left:solid 1px #888888"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand">&nbsp;&nbsp;Show Toolbar&nbsp;&nbsp;</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">&nbsp;&nbsp;Hide Toolbar&nbsp;&nbsp;</span></div></td>';

    html += '    <td valign="top"><div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:8px; border-left:solid 1px #888888">&nbsp;&nbsp;<input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."> <button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search Seq.</button> <a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div></td>';

    html += "  </tr>";
    html += "  </table>";
    html += "  </div>";

    html += me.setTools();

    // show title at the top left corner
    html += "  <div id='" + me.pre + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color: " + me.GREYD + "'></div>";
    html += "  <div id='" + me.pre + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.GREYD + ";'>";
    html += "   <div id='" + me.pre + "mnLogSection'>";
    html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";
//        html += "    <div style='height: " + me.MENU_HEIGHT + "px;'></div>";

    html += "   </div>";

    //$("#" + me.divid).css('background-color', me.GREYD);

    if(me.cfg.mmtfid === undefined) {
        if(me.realHeight < 300) {
            html += "    <div id='" + me.pre + "wait' style='position:absolute; top:100px; left:50px; font-size: 1.2em; color: #444444;'>Loading data...</div>";
        }
        else {
            html += "    <div id='" + me.pre + "wait' style='position:absolute; top:180px; left:50px; font-size: 1.8em; color: #444444;'>Loading data...</div>";
        }
    }
    html += "    <canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

    // separate for the log box
    if(me.cfg.showcommand === undefined || me.cfg.showcommand) {
        html += me.setLogWindow();
    }

    html += "  </div>";

    html += "</div>";

    html += me.setDialogs();

    html += me.setCustomDialogs();

    $( "#" + id).html(html);

    // mn display
    $("accordion").accordion({ collapsible: true, active: false, heightStyle: "content"});
    $("accordion div").removeClass("ui-accordion-content ui-corner-all ui-corner-bottom ui-widget-content");

    $(".icn3d-mn").menu({position: { my: "left top", at: "right top" }});
    $(".icn3d-mn").hover(function(){},function(){$("accordion").accordion( "option", "active", "none");});

    $("#" + me.pre + "accordion1").hover( function(){ $("#" + me.pre + "accordion1 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion1 div").css("display", "none"); } );

    $("#" + me.pre + "accordion2").hover( function(){ $("#" + me.pre + "accordion2 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion2 div").css("display", "none"); } );

    $("#" + me.pre + "accordion2b").hover( function(){ $("#" + me.pre + "accordion2b div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion2b div").css("display", "none"); } );

    $("#" + me.pre + "accordion3").hover( function(){ $("#" + me.pre + "accordion3 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion3 div").css("display", "none"); } );

    $("#" + me.pre + "accordion4").hover( function(){ $("#" + me.pre + "accordion4 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion4 div").css("display", "none"); } );

    $("#" + me.pre + "accordion5").hover( function(){ $("#" + me.pre + "accordion5 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion5 div").css("display", "none"); } );

    //$("#" + me.pre + "accordion5b").hover( function(){ $("#" + me.pre + "accordion5b div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion5b div").css("display", "none"); } );

    $("#" + me.pre + "accordion6").hover( function(){ $("#" + me.pre + "accordion6 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion6 div").css("display", "none"); } );
};

iCn3DUI.prototype.getLink = function(id, text) { var me = this;
    return "<li><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getLinkWrapper = function(id, text, wrapper) { var me = this;
    return "<li id='" + me.pre + wrapper + "'><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getRadio = function(radioid, id, text, bChecked) { var me = this;
    var checkedStr = (bChecked !== undefined && bChecked) ? ' checked' : '';
    //return "<li><input type='radio' name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><label for='" + me.pre + id + "'>" + text + "</label></li>";

    //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
    return "<li><label for='" + me.pre + id + "' class='icn3d-rad'><input type='radio' name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-rad-text'>" + text + "</span></label></li>";
};

iCn3DUI.prototype.setMenu1 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion1'>";
    html += "<h3>File</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";
    html += "  <li><span>Retrieve by ID</span>";
    html += "    <ul>";
    html += me.getLink('mn1_mmdbid', 'MMDB ID');
    html += me.getLink('mn1_mmtfid', 'MMTF ID');
    html += me.getLink('mn1_pdbid', 'PDB ID');
    html += me.getLink('mn1_mmcifid', 'mmCIF ID');
    html += me.getLink('mn1_gi', 'NCBI gi');
    html += me.getLink('mn1_cid', 'PubChem CID');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Open File</span>";
    html += "    <ul>";
    html += me.getLink('mn1_pdbfile', 'PDB File');
    html += me.getLink('mn1_mmciffile', 'mmCIF File');
    html += me.getLink('mn1_mol2file', 'Mol2 File');
    html += me.getLink('mn1_sdffile', 'SDF File');
    html += me.getLink('mn1_xyzfile', 'XYZ File');
    html += me.getLink('mn1_urlfile', 'Url (Same Host) ');
    html += "      <li>-</li>";
    html += me.getLink('mn1_pngimage', 'iCn3D PNG Image');
    html += me.getLink('mn1_state', 'State/Script File');
    html += me.getLink('mn1_selection', 'Selection File');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Align</span>";
    html += "    <ul>";
    html += me.getLink('mn1_blast_rep_id', 'Sequence to Structure');
    html += me.getLink('mn1_align', 'Structure to Structure');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>3D Printing</span>";
    html += "    <ul>";
    if(me.cfg.cid === undefined) {
        html += me.getLink('mn1_exportVrmlStab', 'VRML (Color, W/  Stabilizers)');
        html += me.getLink('mn1_exportStlStab', 'STL (W/  Stabilizers)');
        html += "      <li>-</li>";
        html += me.getLink('mn1_exportVrml', 'VRML (Color)');
        html += me.getLink('mn1_exportStl', 'STL');
        html += "      <li>-</li>";
        html += me.getLink('mn1_stabilizerYes', 'Add All  Stabilizers');
        html += me.getLink('mn1_stabilizerNo', 'Remove All  Stabilizers');
        html += "      <li>-</li>";
        html += me.getLink('mn1_stabilizerOne', 'Add One  Stabilizer');
        html += me.getLink('mn1_stabilizerRmOne', 'Remove One  Stabilizer');
        html += "      <li>-</li>";
        html += me.getLink('mn1_thicknessSet', 'Set Thickness');
        html += me.getLink('mn1_thicknessReset', 'Reset Thickness');
    }
    else {
        html += me.getLink('mn1_exportVrml', 'VRML (Color)');
        html += me.getLink('mn1_exportStl', 'STL');
    }

    html += "    </ul>";
    html += "  </li>";

    html += "  <li><span>Save Files</span>";
    html += "    <ul>";
    html += me.getLink('mn1_exportCanvas', 'iCn3D PNG Image');
    html += me.getLink('mn1_exportState', 'State File');
    html += me.getLink('mn1_exportSelections', 'Selection File');
    html += me.getLink('mn1_exportCounts', 'Residue Counts');
    if(me.cfg.mmdbid !== undefined) {
     html += me.getLink('mn6_exportInteraction', 'Interaction List');
    }

    html += "    </ul>";
    html += "  </li>";

    html += me.getLink('mn1_sharelink', 'Share Link');

    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu2 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion2'>";
    html += "<h3>Select</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_definedsets', 'Defined Sets');
    html += me.getLink('mn2_selectall', 'All');
//        if(me.cfg.cid === undefined) {
//            html += me.getRadio('mn2_select', 'mn2_select_chain', 'Defined Sets');
//        }
    html += me.getLink('mn2_aroundsphere', 'by Distance');
    html += me.getLink('mn2_selectcomplement', 'Inverse');
    html += me.getLink('mn2_selectsidechains', 'Side Chains');
    html += me.getLink('mn2_command', 'Advanced');


    //html += "  <li><span>Selection Mode</span>";
    //html += "    <ul>";
    //html += me.getLink('mn6_modeall', 'Apply style, color,</span><br/><span>surface to all atoms');
    //html += me.getLink('mn6_modeselection', 'Apply style, color,</span><br/><span>surface only to selection');
    //html += "    </ul>";
    //html += "  </li>";


    if(me.cfg.cid === undefined) {
        html += "  <li><span>Select on 3D</span>";
        html += "    <ul>";

        html += "  <li>\"Alt\"+Click: start selection</li>";
        html += "  <li>\"Ctrl\"+Click: union selection</li>";
        html += "  <li>\"Shift\"+Click: range Selection</li>";
        html += "  <li>-</li>";
        html += me.getRadio('mn2_pk', 'mn2_pkChain', 'Chain');
        html += me.getRadio('mn2_pk', 'mn2_pkStrand', 'Strand/Helix');
        html += me.getRadio('mn2_pk', 'mn2_pkResidue', 'Residue', true);
        html += me.getRadio('mn2_pk', 'mn2_pkYes', 'Atom');
        html += "    </ul>";
        html += "  </li>";
    }
    else {
        if(me.isMobile()) {
            html += "  <li><span>Touch to pick</span>";
        }
        else {
            html += "  <li><span>Picking with<br>\"Alt\" + Click</span>";
        }
    }

    html += "  <li>-</li>";

    html += me.getLink('mn2_saveselection', 'Save Selection');
    html += me.getLink('clearall', 'Clear Selection');

    html += "  <li>-</li>";

    html += "      <li><span>Highlight Color</span>";
    html += "        <ul>";
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrYellow', 'Yellow', true);
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrGreen', 'Green');
    html += me.getRadio('mn2_hl_clr', 'mn2_hl_clrRed', 'Red');
    html += "        </ul>";
    html += "      </li>";
    html += "      <li><span>Highlight Style</span>";
    html += "        <ul>";

    html += me.getRadio('mn2_hl_style', 'mn2_hl_styleOutline', 'Outline', true);
    html += me.getRadio('mn2_hl_style', 'mn2_hl_styleObject', '3D Objects');
    html += me.getRadio('mn2_hl_style', 'mn2_hl_styleNone', 'No Highlight');

    html += "        </ul>";
    html += "      </li>";

    //html += me.getLink('toggleHighlight2', 'Toggle Highlight');

    html += "  <li><br/></li>";

    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu2b = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion2b'>";
    html += "<h3>View</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_show_selected', 'View Only <br>Selection');
    html += me.getLink('mn2_selectedcenter', 'Zoom in <br>Selection');
    html += me.getLink('mn6_center', 'Center on <br>Selection');
    if(me.cfg.align !== undefined) {
        html += me.getLink('mn2_alternate', 'Alternate (Key \"a\")');
    }

    html += "  <li>-</li>";

    if(me.cfg.cid === undefined) {
        html += "  <li><span>Chem. Binding</span>";
        html += "    <ul>";
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindingshow', 'Show');
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindinghide', 'Hide', true);
        html += "    </ul>";
        html += "  </li>";

        html += "  <li><span>H-Bonds to</span><br/><span>Selection</span>";
        html += "    <ul>";
        html += me.getRadio('mn6_hbonds', 'mn6_hbondsYes', 'Show');
        html += me.getRadio('mn6_hbonds', 'mn6_hbondsNo', 'Hide', true);
        html += "    </ul>";
        html += "  </li>";

        html += "  <li><span>Disulfide Bonds</span>";
        html += "    <ul>";
        html += me.getRadio('mn6_ssbonds', 'mn6_ssbondsYes', 'Show', true);
        html += me.getRadio('mn6_ssbonds', 'mn6_ssbondsNo', 'Hide');
        html += "    </ul>";
        html += "  </li>";

        html += "  <li><span>Cross-Linkages</span>";
        html += "    <ul>";
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsYes', 'Show');
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsNo', 'Hide', true);
        html += "    </ul>";
        html += "  </li>";

        if(me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined) {
          html += "  <li id='" + me.pre + "assemblyWrapper'><span>Assembly</span>";
          html += "    <ul>";

          html += me.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', true);
          html += me.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit');

          html += "    </ul>";
          html += "  </li>";
        }
    }

    html += "  <li><span>Distance</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_distance', 'mn6_distanceYes', 'Measure');
    html += me.getRadio('mn6_distance', 'mn6_distanceNo', 'Hide', true);
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><span>Label</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelYes', 'by Picking Atoms');
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelSelection', 'per Selection');
    if(me.cfg.cid === undefined) {
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelResidues', 'per Residue');
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelChains', 'per Chain');
        html += me.getRadio('mn6_addlabel', 'mn6_addlabelTermini', 'N- & C-Termini');
    }
    html += me.getRadio('mn6_addlabel', 'mn6_addlabelNo', 'Remove', true);
    html += "    </ul>";
    html += "  </li>";

    html += "  <li>-</li>";

    html += "  <li><span>Reset</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_reset', 'reset', 'All');
    html += me.getRadio('mn6_reset', 'mn6_resetOrientation', 'Orientation');
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><span>Transform Hints</span>";
    html += "    <ul>";
    html += "      <li><span>Rotate</span>";
    html += "          <ul>";
    html += "<li>Left Mouse</li>";
    html += "<li>Key L: Left</li>";
    html += "<li>Key J: Right</li>";
    html += "<li>Key I: Up</li>";
    html += "<li>Key M: Down</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "      <li><span>Zoom</span>";
    html += "          <ul>";
    html += "<li>Middle Mouse</li>";
    html += "<li>Key Z: Zoom in</li>";
    html += "<li>Key X: Zoom out</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "      <li><span>Translate</span>";
    html += "          <ul>";
    html += "<li>Right Mouse</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><span>Auto Rotation</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_rotate', 'mn6_rotateleft', 'Rotate Left');
    html += me.getRadio('mn6_rotate', 'mn6_rotateright', 'Rotate Right');
    html += me.getRadio('mn6_rotate', 'mn6_rotateup', 'Rotate Up');
    html += me.getRadio('mn6_rotate', 'mn6_rotatedown', 'Rotate Down');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Camera</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_camera', 'mn6_cameraPers', 'Perspective', true);
    html += me.getRadio('mn6_camera', 'mn6_cameraOrth', 'Orthographic');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Fog</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_showfog', 'mn6_showfogYes', 'On');
    html += me.getRadio('mn6_showfog', 'mn6_showfogNo', 'Off', true);
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Slab</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_showslab', 'mn6_showslabYes', 'On');
    html += me.getRadio('mn6_showslab', 'mn6_showslabNo', 'Off', true);
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>XYZ-axes</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisYes', 'Show');
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisNo', 'Hide', true);
    html += "    </ul>";
    html += "  </li>";

    html += me.getLink('mn6_back', 'Undo');
    html += me.getLink('mn6_forward', 'Redo');

    html += "  <li><br/></li>";

    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu3 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion3'>";
    html += "<h3 id='" + me.pre + "style'>Style</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += "  <li><span>Proteins</span>";
        html += "    <ul>";
        if(me.cfg.align !== undefined) {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon');
        }
        else {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon', true);
        }

        html += me.getRadio('mn3_proteins', 'mn3_proteinsStrand', 'Strand');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsCylinder', 'Cylinder and Plate');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsSchematic', 'Schematic');

        if(me.cfg.align !== undefined) {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace', true);
        }
        else {
            html += me.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace');
        }

        html += me.getRadio('mn3_proteins', 'mn3_proteinsBfactor', 'B-factor Tube');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsLines', 'Lines');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsStick', 'Stick');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsSphere', 'Sphere');
        html += me.getRadio('mn3_proteins', 'mn3_proteinsNo', 'Hide');
        html += "    </ul>";
        html += "  </li>";

        html += "  <li><span>Side Chains</span>";
        html += "    <ul>";

        html += me.getRadio('mn3_sidec', 'mn3_sidecLines', 'Lines');
        html += me.getRadio('mn3_sidec', 'mn3_sidecStick', 'Stick');
        html += me.getRadio('mn3_sidec', 'mn3_sidecBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_sidec', 'mn3_sidecSphere', 'Sphere');
        html += me.getRadio('mn3_sidec', 'mn3_sidecNo', 'Hide', true);
        html += "    </ul>";
        html += "  </li>";

        html += "  <li><span>Nucleotides</span>";
        html += "    <ul>";
        html += me.getRadio('mn3_nucl', 'mn3_nuclCartoon', 'Cartoon', true);
        html += me.getRadio('mn3_nucl', 'mn3_nuclPhos', "O3' Trace");
        html += me.getRadio('mn3_nucl', 'mn3_nuclSchematic', 'Schematic')
        html += me.getRadio('mn3_nucl', 'mn3_nuclLines', 'Lines');
        html += me.getRadio('mn3_nucl', 'mn3_nuclStick', 'Stick');
        html += me.getRadio('mn3_nucl', 'mn3_nuclBallstick', 'Ball and Stick');
        html += me.getRadio('mn3_nucl', 'mn3_nuclSphere', 'Sphere');
        html += me.getRadio('mn3_nucl', 'mn3_nuclNo', 'Hide');
        html += "    </ul>";
        html += "  </li>";
    }

    html += "  <li><span>Chemicals</span>";
    html += "    <ul>";
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
    html += "    </ul>";
    html += "  </li>";


    html += "  <li><span>Ions</span>";
    html += "    <ul>";
    html += me.getRadio('mn3_ions', 'mn3_ionsSphere', 'Sphere', true);
    html += me.getRadio('mn3_ions', 'mn3_ionsDot', 'Dot');
    html += me.getRadio('mn3_ions', 'mn3_ionsNo', 'Hide');
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><span>Water</span>";
    html += "    <ul>";
    html += me.getRadio('mn3_water', 'mn3_waterSphere', 'Sphere');
    html += me.getRadio('mn3_water', 'mn3_waterDot', 'Dot');
    html += me.getRadio('mn3_water', 'mn3_waterNo', 'Hide', true);
    html += "    </ul>";
    html += "  </li>";

    html += me.getLink('mn3_setThickness', 'Set Thickness');

    html += "  <li>-</li>";

    html += me.getLink('mn3_styleSave', 'Save Style');
    html += me.getLink('mn3_styleApplySave', 'Apply Saved Style');

    html += "  <li>-</li>";

    html += "  <li><span>Surface Type</span>";
    html += "    <ul>";
    html += me.getRadio('mn5_surface', 'mn5_surfaceVDW', 'Van der Waals');
    html += me.getRadio('mn5_surface', 'mn5_surfaceVDWContext', 'VDW with Context');
    html += me.getRadio('mn5_surface', 'mn5_surfaceMolecular', 'Molecular Surface');
    html += me.getRadio('mn5_surface', 'mn5_surfaceMolecularContext', 'MS with Context');
    html += me.getRadio('mn5_surface', 'mn5_surfaceSAS', 'Solvent Accessible');
    html += me.getRadio('mn5_surface', 'mn5_surfaceSASContext', 'SA with Context');
    html += "    </ul>";
    html += "  </li>";

    html += me.getLink('mn5_surfaceNo', 'Remove Surface');

    html += "  <li><span>Surface Opacity</span>";
    html += "    <ul>";
    html += me.getRadio('mn5_opacity', 'mn5_opacity10', '1.0', true);
    html += me.getRadio('mn5_opacity', 'mn5_opacity09', '0.9');
    html += me.getRadio('mn5_opacity', 'mn5_opacity08', '0.8');
    html += me.getRadio('mn5_opacity', 'mn5_opacity07', '0.7');
    html += me.getRadio('mn5_opacity', 'mn5_opacity06', '0.6');
    html += me.getRadio('mn5_opacity', 'mn5_opacity05', '0.5');
    html += me.getRadio('mn5_opacity', 'mn5_opacity04', '0.4');
    html += me.getRadio('mn5_opacity', 'mn5_opacity03', '0.3');
    html += me.getRadio('mn5_opacity', 'mn5_opacity02', '0.2');
    html += me.getRadio('mn5_opacity', 'mn5_opacity01', '0.1');
    html += "    </ul>";
    html += "  </li>";
    html += "  <li><span>Surface <br>Wireframe</span>";
    html += "    <ul>";
    html += me.getRadio('mn5_wireframe', 'mn5_wireframeYes', 'Yes');
    html += me.getRadio('mn5_wireframe', 'mn5_wireframeNo', 'No', true);
    html += "    </ul>";
    html += "  </li>";

    if(me.cfg.cid === undefined) {
        html += "  <li>-</li>";

        html += "  <li id='" + me.pre + "mapWrapper1'><span>Electron Density</span>";
        html += "    <ul>";
        html += me.getRadio('mn5_elecmap', 'mn5_elecmap2fofc', '2Fo-Fc Map');
        html += me.getRadio('mn5_elecmap', 'mn5_elecmapfofc', 'Fo-Fc Map');
        html += "    </ul>";
        html += "  </li>";

        html += me.getLinkWrapper('mn5_elecmapNo', 'Remove Map', 'mapWrapper2');

        html += "  <li id='" + me.pre + "mapWrapper3'><span>Map <br>Wireframe</span>";
        html += "    <ul>";
        html += me.getRadio('mn5_mapwireframe', 'mn5_mapwireframeYes', 'Yes', true);
        html += me.getRadio('mn5_mapwireframe', 'mn5_mapwireframeNo', 'No');
        html += "    </ul>";
        html += "  </li>";

        if(me.cfg.mmtfid === undefined) {
            //html += "  <li>-</li>";

            html += me.getLinkWrapper('mn5_emmap', 'EM Density Map', 'emmapWrapper1');
            html += me.getLinkWrapper('mn5_emmapNo', 'Remove EM Map', 'emmapWrapper2');

            html += "  <li id='" + me.pre + "emmapWrapper3'><span>EM Map <br>Wireframe</span>";
            html += "    <ul>";
            html += me.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeYes', 'Yes', true);
            html += me.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeNo', 'No');
            html += "    </ul>";
            html += "  </li>";
        }
    }

    html += "  <li>-</li>";

    html += "  <li><span>Background</span>";
    html += "    <ul>";
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdTransparent', 'Transparent', true);
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdBlack', 'Black');
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdGrey', 'Grey');
    html += me.getRadio('mn6_bkgd', 'mn6_bkgdWhite', 'White');
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><br/></li>";

    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu4 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion4'>";
    html += "<h3 id='" + me.pre + "color'>Color</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += me.getRadio('mn4_clr', 'mn4_clrSpectrum', 'Spectrum');
        html += "  <li><span style='padding-left:2em;'>Secondary</span>";
        html += "    <ul>";
        html += me.getRadio('mn4_clr', 'mn4_clrSSGreen', 'Sheet in Green');
        html += me.getRadio('mn4_clr', 'mn4_clrSSYellow', 'Sheet in Yellow');
        html += "    </ul>";

        html += me.getRadio('mn4_clr', 'mn4_clrCharge', 'Charge');
        html += me.getRadio('mn4_clr', 'mn4_clrHydrophobic', 'Hydrophobic');

        if(me.cfg.align !== undefined || me.cfg.blast_rep_id !== undefined) {
          html += me.getRadio('mn4_clr', 'mn4_clrChain', 'Chain');
        }
        else {
          html += me.getRadio('mn4_clr', 'mn4_clrChain', 'Chain', true);
        }

        html += me.getRadio('mn4_clr', 'mn4_clrResidue', 'Residue');
        html += me.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom');
        html += "  <li><span style='padding-left:2em;'>B-factor</span>";
        html += "    <ul>";
        html += me.getRadio('mn4_clr', 'mn4_clrBfactor', 'Original');
        html += me.getRadio('mn4_clr', 'mn4_clrBfactorNorm', 'Percentile');
        html += "    </ul>";

        if(me.cfg.align !== undefined) {
          html += me.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity', true);
          html += me.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation');
        }
        else if(me.cfg.blast_rep_id !== undefined) {
          html += me.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity');
          html += me.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation', true);
        }
    }
    else {
        html += me.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom', true);
    }

    html += "  <li>-</li>";
    html += "  <li><span style='padding-left:2em;'>Unicolor</span>";
    html += "    <ul>";
    html += me.getRadio('mn4_clr', 'mn4_clrRed', 'Red');
    html += me.getRadio('mn4_clr', 'mn4_clrGreen', 'Green');
    html += me.getRadio('mn4_clr', 'mn4_clrBlue', 'Blue');
    html += me.getRadio('mn4_clr', 'mn4_clrMagenta', 'Magenta');
    html += me.getRadio('mn4_clr', 'mn4_clrYellow', 'Yellow');
    html += me.getRadio('mn4_clr', 'mn4_clrCyan', 'Cyan');
    html += me.getRadio('mn4_clr', 'mn4_clrWhite', 'White');
    html += me.getRadio('mn4_clr', 'mn4_clrGrey', 'Grey');
    html += "    </ul>";
    html += me.getRadio('mn4_clr', 'mn4_clrCustom', 'Color Picker');
    html += "  <li>-</li>";
    html += me.getLink('mn4_clrSave', 'Save Color');
    html += me.getLink('mn4_clrApplySave', 'Apply Saved Color');
    html += "  <li><br/></li>";
    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu5 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion5'>";
    html += "<h3 id='" + me.pre + "windows' style='font-size:1.2em'>&nbsp;Windows</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += me.getLink('mn6_selectannotations', 'View Sequences<br>& Annotations');

        if(me.cfg.align !== undefined) {
            html += me.getLink('mn2_alignment', 'View Aligned<br>Sequences');
        }

        //html += me.getLink('mn2_selectresidues', 'View Sequences');
        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined) {
          html += me.getLink('mn2_2ddgm', 'View Interactions');
        }
    }

    if(me.cfg.cid !== undefined) {
        html += "  <li><span>Links</span>";
        html += "    <ul>";
        html += me.getLink('mn1_link_structure', 'Compound Summary');
        html += me.getLink('mn1_link_vast', 'Similar Compounds');
        html += me.getLink('mn1_link_bind', 'Structures Bound');
        html += "    </ul>";
        html += "  </li>";
    }
    else {
        html += "  <li><span>Links</span>";
        html += "    <ul>";
        html += me.getLink('mn1_link_structure', 'Structure Summary');
        html += me.getLink('mn1_link_vast', 'Similar Structures');
        html += me.getLink('mn1_link_pubmed', 'Literature');
        html += me.getLink('mn1_link_protein', 'Protein');
        //html += me.getLink('mn1_link_gene', 'Gene');
        //html += me.getLink('mn1_link_chemicals', 'Chemicals');
        html += "    </ul>";
        html += "  </li>";
    }

    html += "  <li><br/></li>";

    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setMenu6 = function() { var me = this;
    var html = "";

    html += "    <div class='icn3d-menu'>";
    html += "          <accordion id='" + me.pre + "accordion6'>";
    html += "<h3>Help</h3>";
    html += "<div>";
    html += "<ul class='icn3d-mn'>";

    html += "  <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_about.html' target='_blank'>About iCn3D<span style='font-size:0.9em'> " + me.REVISION + "</span></a></li>";

    html += "  <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/docs/icn3d_help.html' target='_blank'>Help Doc</a></li>";

    html += "  <li><span>Web APIs</span>";
    html += "    <ul>";

    html += "<li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#HowToUse' target='_blank'>How to Use</a></li>";
    html += "<li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#parameters' target='_blank'>URL Parameters</a></li>";
    html += "<li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#commands' target='_blank'>Commands</a></li>";
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><a href='https://github.com/ncbi/icn3d' target='_blank'>Source Code</a></li>";

    html += "  <li>-</li>";

    html += "  <li><span>Transform Hints</span>";
    html += "    <ul>";
    html += "      <li><span>Rotate</span>";
    html += "          <ul>";
    html += "<li>Left Mouse</li>";
    html += "<li>Key L: Left</li>";
    html += "<li>Key J: Right</li>";
    html += "<li>Key I: Up</li>";
    html += "<li>Key M: Down</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "      <li><span>Zoom</span>";
    html += "          <ul>";
    html += "<li>Middle Mouse</li>";
    html += "<li>Key Z: Zoom in</li>";
    html += "<li>Key X: Zoom out</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "      <li><span>Translate</span>";
    html += "          <ul>";
    html += "<li>Right Mouse</li>";
    html += "          </ul>";
    html += "      </li>";
    html += "    </ul>";
    html += "  </li>";

    html += "  <li><a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#HowToUseStep5' target='_blank'>Selection Hints</a></li>";

    html += "  <li><br/></li>";
    html += "</ul>";
    html += "</div>";
    html += "          </accordion>";
    html += "    </div>";

    return html;
};

iCn3DUI.prototype.setLogWindow = function() { var me = this;
    var html = "";

    html += "  <div id='" + me.pre + "cmdlog' style='float:left; margin-top: -5px; width: 100%;'>";

    html += "    <textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.GREYD + ";'></textarea>";
    html += "  </div>";

    return html;
};

iCn3DUI.prototype.setAdvanced = function(index) { var me = this;
    var indexStr = (index === undefined) ? '' : index;

    var html = "<div id='" + me.pre + "dl_advanced" + indexStr + "'>";

    html += "      <table width='500'><tr><td valign='top'><table cellspacing='0'>";
    html += "    <tr><td><b>Select:</b></td><td><input type='text' id='" + me.pre + "command" + indexStr + "' placeholder='$[structures].[chains]:[residues]@[atoms]' size='60'></td></tr>";
    html += "    <tr><td><b>Name:</b></td><td><input type='text' id='" + me.pre + "command_name" + indexStr + "' placeholder='my_selection' size='60'></td></tr>";
    //html += "<tr><td align='right'><b>Description:</b></td><td><input type='text' id='" + me.pre + "command_desc' placeholder='description about my selection' size='30'></td></tr>";
    html += "    <tr><td colspan='2' align='left'>&nbsp;&nbsp;&nbsp;<button id='" + me.pre + "command_apply" + indexStr + "'><b>Save Selection</b></button></td></tr>";
    html += "      </table></td>";

    html += "      </tr>";

    html += "      <tr><td>";

    html += 'Specification Tips: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'specguide' + indexStr + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'specguide' + indexStr + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';

    html += "<div id='" + me.pre + "specguide" + indexStr + "' style='display:none; width:500px' class='icn3d-box'>";

    html += "  <b>Specification:</b> In the selection \"$1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C\":";
    html += "  <ul><li>\"$1HHO,4N7N\" uses \"$\" to indicate structure selection.<br/>";
    html += "  <li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
    html += "  <li>\":5-10,KRDE,chemicals\" uses \":\" to indicate residue selection. Residue selection could be residue number (5-10), one-letter sequence (KRDE), or predefined names: \"proteins\", \"nucleotides\", \"chemicals\", \"ions\", and \"water\".<br/>";
    html += "  <li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
    html += "  <li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/>";
    html += "  <li>Different selections can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, \":1-10 or :K\" selects all residues 1-10 and all Lys residues. \":1-10 and :K\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :K\" selects all residues 1-10, which are not Lys residues.</ul>";
    html += "  <b>Set Operation:</b>";
    html += "  <ul><li>Users can select multiple sets in the menu \"Select > Defined Sets\".<br/>";
    html += "  <li>Different sets can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, if the \"Defined Sets\" menu has four sets \":1-10\", \":11-20\", \":5-15\", and \":7-8\", the command \"saved atoms :1-10 or :11-20 and :5-15 not :7-8\" unions all residues 1-10 and 11-20 to get the residues 1-20, then intersects with the residues 5-15 to get the residues 5-15, then exclude the residues 7-8 to get the final residues 5-6 and 9-15.</ul>";
    html += "  <b>Full commands in url or command window:</b>";
    html += "  <ul><li>Select without saving the set: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C<br/>";
    //html += "  <li>Select and save: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C | name my_name | description my_description</ul>";
    html += "  <li>Select and save: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C | name my_name</ul>";

    html += "</div>";

    html += "      </td></tr></table>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setDialogs = function() { var me = this;
    var html = "";

    html += "<!-- dialog will not be part of the form -->";

    html += "<div id='" + me.pre + "alldialogs' class='icn3d-hidden icn3d-dialog'>";

    // filter for large structure
    //html += "<div id='" + me.pre + "dl_filter' style='overflow:auto; position:relative;'>";
    //html += "  <div style='text-align:center; margin-bottom:10px;'><button id='" + me.pre + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
    //html += "<button id='" + me.pre + "highlight_3d_dgm' style='margin-left:10px;'><span style='white-space:nowrap'><b>Highlight</b></span></button></div>";
    //html += "  <div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
    //html += "  </div>";
    //html += "</div>";

    html += "<div id='" + me.pre + "dl_2ddgm' class='icn3d-dl_2ddgm'>";
    html += "</div>";

    if(me.cfg.align !== undefined) {
      html += "<div id='" + me.pre + "dl_alignment' style='background-color:white;'>";
      html += "  <div id='" + me.pre + "dl_sequence2' class='icn3d-dl_sequence'>";
      html += "  </div>";
      html += "</div>";
    }

    html += "<div id='" + me.pre + "dl_definedsets'>";
    html += "    <div id='" + me.pre + "dl_setsmenu'>";
    html += "        <b>Defined Sets:</b> <br/>";
    html += "        <select id='" + me.pre + "atomsCustom' multiple size='6' style='min-width:130px;'>";
    html += "        </select>";
    html += "        <div style='margin: 6px 0 6px 0;'><button id='" + me.pre + "deletesets'><b>Delete Selected Sets</b></button></div>";
    html += '        <b>Set Operations</b>: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'dl_command_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'dl_command_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
    html += "    </div>";

    html += "    <div id='" + me.pre + "dl_command' style='display:none;'>";
    html += "      <div id='" + me.pre + "dl_setoperations'>";
    html += "        <label for='" + me.pre + "setOr'><input type='radio' name='" + me.pre + "setOperation' id='" + me.pre + "setOr' checked> Union (or) </label><br/>";
    html += "        <label for='" + me.pre + "setAnd'><input type='radio' name='" + me.pre + "setOperation' id='" + me.pre + "setAnd'> Intersection (and) </label><br/>";
    html += "        <label for='" + me.pre + "setNot'><input type='radio' name='" + me.pre + "setOperation' id='" + me.pre + "setNot'> Exclusion (not) </label>";
    html += "      </div><br>";

    html += me.setAdvanced();

    html += "    </div>";
    html += "</div>";

    html += me.setAdvanced(2);

    html += "<div id='" + me.pre + "dl_mmtfid'>";
    html += "MMTF ID: <input type='text' id='" + me.pre + "mmtfid' value='1TUP' size=8> ";
    html += "<button id='" + me.pre + "reload_mmtf'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_pdbid'>";
    html += "PDB ID: <input type='text' id='" + me.pre + "pdbid' value='1TUP' size=8> ";
    html += "<button id='" + me.pre + "reload_pdb'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_pdbfile'>";
    html += "PDB File: <input type='file' id='" + me.pre + "pdbfile' size=8> ";
    html += "<button id='" + me.pre + "reload_pdbfile'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_align'>";
    html += "Enter the PDB IDs or MMDB IDs of two structures that have been found to be similar by <A HREF=' https://www.ncbi.nlm.nih.gov/Structure/vastplus/vastplus.cgi'>VAST+</A> : <br/><br/>ID1: <input type='text' id='" + me.pre + "alignid1' value='1HHO' size=8>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ID2: <input type='text' id='" + me.pre + "alignid2' value='4N7N' size=8><br/><br/>";
    html += "<button id='" + me.pre + "reload_align_ori'>All Matching Molecules Superposed</button>&nbsp;&nbsp;&nbsp;<button id='" + me.pre + "reload_align_refined'>Invariant Substructure Superposed</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_mol2file'>";
    html += "Mol2 File: <input type='file' id='" + me.pre + "mol2file' size=8> ";
    html += "<button id='" + me.pre + "reload_mol2file'>Load</button>";
    html += "</div>";
    html += "<div id='" + me.pre + "dl_sdffile'>";
    html += "SDF File: <input type='file' id='" + me.pre + "sdffile' size=8> ";
    html += "<button id='" + me.pre + "reload_sdffile'>Load</button>";
    html += "</div>";
    html += "<div id='" + me.pre + "dl_xyzfile'>";
    html += "XYZ File: <input type='file' id='" + me.pre + "xyzfile' size=8> ";
    html += "<button id='" + me.pre + "reload_xyzfile'>Load</button>";
    html += "</div>";
    html += "<div id='" + me.pre + "dl_urlfile'>";
    html += "File type: ";
    html += "<select id='" + me.pre + "filetype'>";
    html += "<option value='pdb' selected>pdb</option>";
    html += "<option value='mol2'>mol2</option>";
    html += "<option value='sdf'>sdf</option>";
    html += "<option value='xyz'>xyz</option>";
    html += "</select><br/>";
    html += "URL in the same host: <input type='text' id='" + me.pre + "urlfile' size=20><br/> ";
    html += "<button id='" + me.pre + "reload_urlfile'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_mmciffile'>";
    html += "mmCIF File: <input type='file' id='" + me.pre + "mmciffile' value='1TUP' size=8> ";
    html += "<button id='" + me.pre + "reload_mmciffile'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_mmcifid'>";
    html += "mmCIF ID: <input type='text' id='" + me.pre + "mmcifid' value='1TUP' size=8> ";
    html += "<button id='" + me.pre + "reload_mmcif'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_mmdbid'>";
    html += "MMDB ID: <input type='text' id='" + me.pre + "mmdbid' value='1TUP' size=8> ";
    html += "<button id='" + me.pre + "reload_mmdb'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_blast_rep_id' style='max-width:500px;'>";
    html += "Enter a Sequence ID (or FASTA sequence) and the aligned Structure ID, which can be found using the <a href='https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&DATABASE=pdb' target='_blank'>BLAST</a> search against the pdb database with the Sequence ID or FASTA sequence as input.<br><br> ";
    html += "<b>Sequence ID</b> (NCBI protein accession of a sequence): <input type='text' id='" + me.pre + "query_id' value='NP_001108451.1' size=8><br> ";
    html += "or FASTA sequence: <br><textarea id='" + me.pre + "query_fasta' rows='5' style='width: 100%; height: " + (me.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "<b>Structure ID</b> (NCBI protein accession of a chain of a 3D structure): <input type='text' id='" + me.pre + "blast_rep_id' value='1TSR_A' size=8><br> ";
    html += "<button id='" + me.pre + "reload_blast_rep_id'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_gi'>";
    html += "Protein gi: <input type='text' id='" + me.pre + "gi' value='1310960' size=8> ";
    html += "<button id='" + me.pre + "reload_gi'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_cid'>";
    html += "PubChem CID: <input type='text' id='" + me.pre + "cid' value='2244' size=8> ";
    html += "<button id='" + me.pre + "reload_cid'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_pngimage'>";
    html += "iCn3D PNG image: <input type='file' id='" + me.pre + "pngimage'><br/>";
    html += "<button id='" + me.pre + "reload_pngimage' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_state'>";
    html += "State file: <input type='file' id='" + me.pre + "state'><br/>";
    html += "<button id='" + me.pre + "reload_state' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_selection'>";
    html += "Selection file: <input type='file' id='" + me.pre + "selectionfile'><br/>";
    html += "<button id='" + me.pre + "reload_selectionfile' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_clr'>";
    html += "Click in the input box to use the color picker:<br><br> ";
    html += "Custom Color: <input type='text' id='" + me.pre + "colorcustom' value='FF0000' size=8> ";
    html += "<button id='" + me.pre + "applycustomcolor'>Apply</button>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_hbonds'>";
    html += "<div style='width:400px;'>To show hydrogen bonds between other residues and the current selection, please select the threshold of H-bonds.</div><br/>";
    html += "  <span style='white-space:nowrap;font-weight:bold;'>Threshold: <select id='" + me.pre + "hbondthreshold'>";
    html += "  <option value='3.2'>3.2</option>";
    html += "  <option value='3.3'>3.3</option>";
    html += "  <option value='3.4'>3.4</option>";
    html += "  <option value='3.5' selected>3.5</option>";
    html += "  <option value='3.6'>3.6</option>";
    html += "  <option value='3.7'>3.7</option>";
    html += "  <option value='3.8'>3.8</option>";
    html += "  <option value='3.9'>3.9</option>";
    html += "  <option value='4.0'>4.0</option>";
    html += "  </select> &#197;</span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "applyhbonds'>Display</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_elecmap2fofc'>";
    html += "  <span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigma2fofc'>";
    html += "  <option value='0'>0</option>";
    html += "  <option value='0.5'>0.5</option>";
    html += "  <option value='1'>1</option>";
    html += "  <option value='1.5' selected>1.5</option>";
    html += "  <option value='2'>2</option>";
    html += "  <option value='3'>3</option>";
    html += "  <option value='4'>4</option>";
    html += "  <option value='5'>5</option>";
    html += "  <option value='6'>6</option>";
    html += "  <option value='7'>7</option>";
    html += "  <option value='8'>8</option>";
    html += "  <option value='9'>9</option>";
    html += "  <option value='10'>10</option>";
    html += "  </select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "applymap2fofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "elecmapNo2'>Remove Map</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_elecmapfofc'>";
    html += "  <span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigmafofc'>";
    html += "  <option value='0'>0</option>";
    html += "  <option value='0.5'>0.5</option>";
    html += "  <option value='1'>1</option>";
    html += "  <option value='1.5'>1.5</option>";
    html += "  <option value='2'>2</option>";
    html += "  <option value='3' selected>3</option>";
    html += "  <option value='4'>4</option>";
    html += "  <option value='5'>5</option>";
    html += "  <option value='6'>6</option>";
    html += "  <option value='7'>7</option>";
    html += "  <option value='8'>8</option>";
    html += "  <option value='9'>9</option>";
    html += "  <option value='10'>10</option>";
    html += "  </select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "applymapfofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "elecmapNo3'>Remove Map</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_emmap'>";
    html += "  <span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "empercentage'>";
    html += "  <option value='0'>0</option>";
    html += "  <option value='10'>10</option>";
    html += "  <option value='20'>20</option>";
    html += "  <option value='30' selected>30</option>";
    html += "  <option value='40'>40</option>";
    html += "  <option value='50'>50</option>";
    html += "  <option value='60'>60</option>";
    html += "  <option value='70'>70</option>";
    html += "  <option value='80'>80</option>";
    html += "  <option value='90'>90</option>";
    html += "  <option value='100'>100</option>";
    html += "  </select> % of maximum EM values</span><br><span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "applyemmap'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'><button id='" + me.pre + "emmapNo2'>Remove EM Map</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_aroundsphere'>";
    html += "  <span style='white-space:nowrap'>1. Sphere with a radius: <input type='text' id='" + me.pre + "radius_aroundsphere' value='4' size='2'> &#197;</span><br/>";
    html += "  <span style='white-space:nowrap'>2. <button id='" + me.pre + "applypick_aroundsphere'>Display</button> the sphere around currently selected atoms</span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_addlabel'>";
    html += "1. Text: <input type='text' id='" + me.pre + "labeltext' value='Text' size=4><br/>";
    html += "2. Size: <input type='text' id='" + me.pre + "labelsize' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: <input type='text' id='" + me.pre + "labelcolor' value='ffff00' size=4><br/>";
    html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd' value='cccccc' size=4><br/>";
    if(me.isMobile()) {
        html += "  <span style='white-space:nowrap'>5. Touch TWO atoms</span><br/>";
    }
    else {
        html += "  <span style='white-space:nowrap'>5. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += "<span style='white-space:nowrap'>6. <button id='" + me.pre + "applypick_labels'>Display</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_addlabelselection'>";
    html += "1. Text: <input type='text' id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
    html += "2. Size: <input type='text' id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: <input type='text' id='" + me.pre + "labelcolor2' value='ffff00' size=4><br/>";
    html += "4. Background: <input type='text' id='" + me.pre + "labelbkgd2' value='cccccc' size=4><br/>";
    html += "<span style='white-space:nowrap'>5. <button id='" + me.pre + "applyselection_labels'>Display</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_distance'>";
    if(me.isMobile()) {
        html += "  <span style='white-space:nowrap'>1. Touch TWO atoms</span><br/>";
    }
    else {
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += "  <span style='white-space:nowrap'>2. Color: <input type='text' id='" + me.pre + "distancecolor' value='ffff00' size=4><br/>";
    html += "  <span style='white-space:nowrap'>3. <button id='" + me.pre + "applypick_measuredistance'>Display</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_stabilizer'>";
    if(me.isMobile()) {
        html += "  <span style='white-space:nowrap'>1. Touch TWO atoms</span><br/>";
    }
    else {
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += "  <span style='white-space:nowrap'>2. Color: <input type='text' id='" + me.pre + "stabilizercolor' value='ffffff' size=4><br/>";
    html += "  <span style='white-space:nowrap'>3. <button id='" + me.pre + "applypick_stabilizer'>Add</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_stabilizer_rm'>";
    if(me.isMobile()) {
        html += "  <span style='white-space:nowrap'>1. Touch TWO atoms</span><br/>";
    }
    else {
        html += "  <span style='white-space:nowrap'>1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += "  <span style='white-space:nowrap'>2. <button id='" + me.pre + "applypick_stabilizer_rm'>Remove</button></span>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_thickness'>";
    html += me.setThicknessHtml('3dprint');
    html += "</div>";

    html += "<div id='" + me.pre + "dl_thickness2'>";
    html += me.setThicknessHtml('style');
    html += "</div>";

    html += "<div id='" + me.pre + "dl_addtrack'>";
    html += "     <input type='hidden' id='" + me.pre + "track_chainid' value=''>";

    html += "    <div id='" + me.pre + "dl_addtrack_tabs' style='border:0px;'>";
    html += "      <ul>";
    html += "        <li><a href='#" + me.pre + "tracktab1'>NCBI gi/Accession</a></li>";
    html += "        <li><a href='#" + me.pre + "tracktab2'>FASTA</a></li>";
    html += "        <li><a href='#" + me.pre + "tracktab3'>BED File</a></li>";
    html += "        <li><a href='#" + me.pre + "tracktab4'>Custom</a></li>";
    html += "        <li><a href='#" + me.pre + "tracktab5'>Current Selection</a></li>";
    html += "      </ul>";
    html += "      <div id='" + me.pre + "tracktab1'>";
    html += "NCBI gi/Accession: <input type='text' id='" + me.pre + "track_gi' placeholder='gi' size=16> <br><br>";
    html += "<button id='" + me.pre + "addtrack_button1'>Add Track</button>";
    html += "      </div>";
    html += "      <div id='" + me.pre + "tracktab2'>";
    html += "FASTA sequence: <br><textarea id='" + me.pre + "track_fasta' rows='5' style='width: 100%; height: " + (2*me.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "<button id='" + me.pre + "addtrack_button2'>Add Track</button>";
    html += "      </div>";
    html += "      <div id='" + me.pre + "tracktab3'>";
    html += "BED file: <input type='file' id='" + me.pre + "track_bed' size=16> <br><br>";
    html += "<button id='" + me.pre + "addtrack_button3'>Add Track</button>";
    html += "      </div>";
    html += "      <div id='" + me.pre + "tracktab4'>";
    html += "Track Title: <input type='text' id='" + me.pre + "track_title' placeholder='track title' size=16> <br><br>";
    html += "Track Text (e.g., \"152 G, 155-156 RR\" defines a character \"G\" at the position 152 and two continuous characters \"RR\" at positions from 155 to 156. The starting position is 1): <br>";
    html += "<textarea id='" + me.pre + "track_text' rows='5' style='width: 100%; height: " + (2*me.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "<button id='" + me.pre + "addtrack_button4'>Add Track</button>";
    html += "      </div>";
    html += "      <div id='" + me.pre + "tracktab5'>";
    html += "Track Title: <input type='text' id='" + me.pre + "track_selection' placeholder='track title' size=16> <br><br>";
    html += "<button id='" + me.pre + "addtrack_button5'>Add Track</button>";
    html += "      </div>";

    html += "    </div>";

    html += "</div>";

    html += "<div id='" + me.pre + "dl_saveselection'>";
    var index = (me.icn3d) ? Object.keys(me.icn3d.defNames2Atoms).length : 1;
    var suffix = '';
    html += "Name: <input type='text' id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> <br>";
    //html += "Description: <input type='text' id='" + me.pre + "seq_command_desc" + suffix + "' value='seq_desc_" + index + "' size='10'> <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button><br/><br/>";
    html += "</div>";


    html += "<div id='" + me.pre + "dl_copyurl'>";
    html += "Please copy one of the URLs below. They work the same way.<br><br>";
    html += "Original URL with commands: <br><textarea id='" + me.pre + "ori_url' rows='4' style='width:100%'></textarea><br><br>";
    html += "Short URL: <br><input type='text' id='" + me.pre + "short_url' value='' style='width:100%'><br><br>";
    html += "</div>";

    html += "<div id='" + me.pre + "dl_selectannotations' class='icn3d-annotation' style='background-color:white;'>";

    html += "    <div id='" + me.pre + "dl_annotations_tabs'>";

/*
    html += "    <table border=0><tr>";
    html += "    <td valign='top' width='100'>";
    html += "        <div style='margin-top:28px; white-space: nowrap;'><span id='" + me.pre + "viewdetail' style='display:none;' title='Expand the width of the annotation window to view the residue details'><b>Detailed View</b></span><span id='" + me.pre + "overview' class='icn3d-viewselection' title='Shrink the width of the annotaion window to overview'><b>Overview</b></span></div>";
    html += "        <label class='icn3d-switch'><input id='" + me.pre + "viewswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 16px 0px 0px 30px;' title='Left (\"Detailed View\")&#13;Right (\"Overview\")'></div></label>";
    html += "    </td>";
    html += "    <td>";
    html += "        <div style='border-left:1px solid #ccc; width:1px; height:40px;'></div>";
    html += "    </td>";
    html += "    <td>";
*/

/*
    html += "        <div style='white-space: nowrap;'><span id='" + me.pre + "viewdetail' class='icn3d-large'><b>Sequence Details</b></span>";
    html += "        <label class='icn3d-switch'><input id='" + me.pre + "viewswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; display:inline-block; margin: 6px 0px 0px 145px;' title='Left (\"Detailed View\")&#13;Right (\"Overview\")'></div></label>";
    html += "        <span id='" + me.pre + "overview' style='margin-left:50px;' class='icn3d-viewselection icn3d-large'><b>Graphic Summary</b></span>";

    html += "<button style='white-space:nowrap; margin-left:50px' id='" + me.pre + "showallchains'>Show All Chains</button></div>";
*/

    html += "<div id='" + me.pre + "dl_anno_view_tabs' style='border:0px; height:33px;'>";
    html += "      <ul>";
    html += "        <li><a href='#" + me.pre + "anno_tmp1' id='" + me.pre + "anno_summary'>Summary</a></li>";
    html += "        <li><a href='#" + me.pre + "anno_tmp2' id='" + me.pre + "anno_details'>Details</a></li>";
    html += "      </ul>";
    html += "      <div id='" + me.pre + "anno_tmp1'>";
    html += "      </div>";
    html += "      <div id='" + me.pre + "anno_tmp2'>";
    html += "      </div>";
    html += "</div>";

    html += "      <div class='icn3d-box' style='width:520px;'><b>Annotations:&nbsp;</b><br><table border=0><tr>";
    html += "        <td style='min-width:60px;'><input type='checkbox' id='" + me.pre + "anno_all'>All&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:130px;'><input type='checkbox' id='" + me.pre + "anno_cdd' checked>Conserved Domains&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:60px;'><input type='checkbox' id='" + me.pre + "anno_clinvar'>ClinVar&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:110px;'><input type='checkbox' id='" + me.pre + "anno_binding'>Functional Sites&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:110px;'><input type='checkbox' id='" + me.pre + "anno_ssbond'>Disulfide Bonds&nbsp;&nbsp;</td>";
    html += "      </tr><tr>";
    html += "        <td style='min-width:60px;'><input type='checkbox' id='" + me.pre + "anno_custom'>Custom&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:130px;'><input type='checkbox' id='" + me.pre + "anno_3dd'>3D Domains&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:60px;'><input type='checkbox' id='" + me.pre + "anno_snp'>SNPs&nbsp;&nbsp;</td>";
    html += "        <td style='min-width:110px;'><input type='checkbox' id='" + me.pre + "anno_interact'>Interactions&nbsp;&nbsp;</td>";
    html += "        <td></td>";
    html += "      </tr></table></div>";

    html += "<button style='white-space:nowrap; margin-left:5px;' id='" + me.pre + "showallchains'>Show All Chains</button><br>";
//    html += "    </td>";
//    html += "    </tr></table>";

    html += "    <div id='" + me.pre + "seqguide_wrapper' style='display:none'><br>" + me.setSequenceGuide("2") + "</div>";

    // add note about assembly
    //html = "     <div id='" + me.pre + "assembly_note' class='icn3d-annoLargeTitle'><br>Only the asymmetric unit is shown in the sequence window.</div>";

    html += "    </div><br/><hr><br>";

    html += "    <div id='" + me.pre + "dl_annotations'>";
    html += "    </div>";
    html += "</div>";

    html += "</div>";
    html += "<!--/form-->";

    return html;
};

iCn3DUI.prototype.setThicknessHtml = function (type) { var me = this;
    var html = '';

    // type == '3dprint' or 'style'
    var linerad = (type == '3dprint') ? '1' : '0.1';
    var coilrad = (type == '3dprint') ? '1.2' : '0.3';
    var stickrad = (type == '3dprint') ? '0.8' : '0.4';
    var tracerad = (type == '3dprint') ? '1' : '0.2';
    var ribbonthick = (type == '3dprint') ? '1' : '0.2';
    var prtribbonwidth = (type == '3dprint') ? '2' : '1.3';
    var nucleotideribbonwidth = (type == '3dprint') ? '1.4' : '0.8';
    var ballscale = (type == '3dprint') ? '0.6' : '0.3';

    html += "<b>Line Radius</b>: <input type='text' id='" + me.pre + "linerad_" + type + "' value='" + linerad + "' size=4>&nbsp;&nbsp;&nbsp;(for stabilizers, hydrogen bonds, distance lines, default 0.1)<br/>";
    html += "<b>Coil Radius</b>: <input type='text' id='" + me.pre + "coilrad_" + type + "' value='" + coilrad + "' size=4>&nbsp;&nbsp;&nbsp;(for coils, default 0.3)<br/>";
    html += "<b>Stick Radius</b>: <input type='text' id='" + me.pre + "stickrad_" + type + "' value='" + stickrad + "' size=4>&nbsp;&nbsp;&nbsp;(for sticks, default 0.4)<br/>";
    html += "<b>Trace Radius</b>: <input type='text' id='" + me.pre + "tracerad_" + type + "' value='" + tracerad + "' size=4>&nbsp;&nbsp;&nbsp;(for C alpha trace, O3' trace, default 0.2)<br/>";

    html += "<b>Ribbon Thickness</b>: <input type='text' id='" + me.pre + "ribbonthick_" + type + "' value='" + ribbonthick + "' size=4>&nbsp;&nbsp;&nbsp;(for helix and sheet ribbons, nucleotide ribbons, default 0.2)<br/>";
    html += "<b>Protein Ribbon Width</b>: <input type='text' id='" + me.pre + "prtribbonwidth_" + type + "' value='" + prtribbonwidth + "' size=4>&nbsp;&nbsp;&nbsp;(for helix and sheet ribbons, default 1.3)<br/>";
    html += "<b>Nucleotide Ribbon Width</b>: <input type='text' id='" + me.pre + "nucleotideribbonwidth_" + type + "' value='" + nucleotideribbonwidth + "' size=4>&nbsp;&nbsp;&nbsp;(for nucleotide ribbons, default 0.8)<br/>";

    html += "<b>Ball Scale</b>: <input type='text' id='" + me.pre + "ballscale_" + type + "' value='" + ballscale + "' size=4>&nbsp;&nbsp;&nbsp;(for styles 'Ball and Stick' and 'Dot', default 0.3)<br/>";

    html += "<span style='white-space:nowrap'><button id='" + me.pre + "apply_thickness_" + type + "'>Preview</button></span>";

    return html;
};

iCn3DUI.prototype.setSequenceGuide = function (suffix, bShown) { var me = this;
  var sequencesHtml = '';

  var index = (me.icn3d) ? Object.keys(me.icn3d.defNames2Atoms).length : 1;

  if(bShown) {
     sequencesHtml += "<div id='" + me.pre + "seqguide" + suffix + "'>";
 }
 else {
     sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'seqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'seqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

     //sequencesHtml += "<div style='min-width:200px; display:inline-block;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "seq_command_desc" + suffix + "' value='seq_desc_" + index + "' size='10'> &nbsp;&nbsp;<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button></div><br/>";
     sequencesHtml += "<div style='min-width:200px; display:inline-block;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> &nbsp;&nbsp;<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button></div><br/>";

     sequencesHtml += "<div id='" + me.pre + "seqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";
 }

  if(!me.isMobile()) {
      sequencesHtml += "<b>Select on 1D sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/><br/>";

      sequencesHtml += "<b>Select on 2D interaction diagram:</b> click on the nodes or lines. The nodes are chains and can be united with the Ctrl key. The lines are interactions and can NOT be united. Each click on the lines selects half of the lines, i.e., select the interacting residues in one of the two chains. The selected residues are saved in the \"Select -> Advanced\" menu.<br/><br/>";

      var tmpStr = me.isMobile() ? 'use finger to pick' : 'hold "Alt" and use mouse to pick';
      sequencesHtml += "<b>Select on 3D structures:</b> " + tmpStr + ", click the second time to deselect, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection.<br/><br/>";

      sequencesHtml += "<b>Save the current selection</b> (either on 3D structure, 2D interactions, or 1D sequence): open the menu \"Select -> Save Selection\", specify the name and description for the selection, and click \"Save\".<br/><br/>";
  }
  else {
        sequencesHtml += "<b>Select Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/><br/>";
  }

  var resCategories = "<b>Residue labeling:</b> standard residue with coordinates: UPPER case letter; nonstandard residue with coordinates: the first UPPER case letter plus a period except that water residue uses the letter 'O'; residue missing coordinates: lower case letter.";
  var scroll = (me.isMac() && !me.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

  sequencesHtml += resCategories + scroll + "<br/></div>";

  return sequencesHtml;
};

iCn3DUI.prototype.getAlignSequencesAnnotations = function (alignChainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight) { var me = this;
  var resCategories = "<b>Residue labeling:</b> aligned residue with coordinates: UPPER case letter; non-aligned residue with coordinates: lower case letter which can be highlighted; residue missing coordinates: lower case letter which can NOT be highlighted.";
  var scroll = (me.isMac() && !me.isMobile()) ? "<br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

  var sequencesHtml;

  if(!me.isMobile()) {
      sequencesHtml = "<b>Select on 1D sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/>";

      sequencesHtml += "<b>Select on 2D interaction diagram:</b> click on the nodes or lines. The nodes are chains and can be united with the Ctrl key. The lines are interactions and can NOT be united. Each click on the lines selects half of the lines, i.e., select the interacting residues in one of the two chains. The selected residues are saved in the \"Select -> Advanced\" menu.<br/><br/>";

      var tmpStr = me.isMobile() ? 'use finger to pick' : 'hold "Alt" and use mouse to pick';
      sequencesHtml += "<b>Select on 3D structures:</b> " + tmpStr + ", click the second time to deselect, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection.<br/>";

      sequencesHtml += "<b>Save the current selection</b> (either on 3D structure, 2D interactions, or 1D sequence): open the menu \"Select -> Save Selection\", specify the name and description for the selection, and click \"Save\".<br/><br/>";
  }
  else {
        sequencesHtml = "<b>Select Aligned Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/>";
  }

  //sequencesHtml += "<div style='min-width:200px;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "alignseq_command_name' value='alseq_" + Object.keys(me.icn3d.defNames2Atoms).length + "' size='10'> &nbsp;&nbsp;Description: <input type='text' id='" + me.pre + "alignseq_command_desc' value='alseq_desc_" + Object.keys(me.icn3d.defNames2Atoms).length + "' size='20'> <button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear</button></div><br/>";
  sequencesHtml += "<div style='min-width:200px;'><b>Selection:</b> Name: <input type='text' id='" + me.pre + "alignseq_command_name' value='alseq_" + Object.keys(me.icn3d.defNames2Atoms).length + "' size='10'> &nbsp;&nbsp;<button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear</button></div><br/>";

  sequencesHtml += resCategories + scroll + "<br/>";

  var maxSeqCnt = 0;

  var chainHash = {};
  if(alignChainArray !== undefined) {
      for(var i = 0, il = alignChainArray.length; i < il; ++i) {
          chainHash[alignChainArray[i]] = 1;
      }
  }

  var bModifyHAtoms = Object.keys(me.icn3d.hAtoms).length == Object.keys(me.icn3d.atoms).length && bHighlightChain && (bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms);

  if(bModifyHAtoms) {
      me.icn3d.hAtoms = {};
  }

  for(var i in me.icn3d.alnChains) {
      var bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

      //if( bHighlightChain && (bUpdateHighlightAtoms === undefined || bUpdateHighlightAtoms) ) {
      // do not update isa subset is selected already
      if( bModifyHAtoms ) {
          me.icn3d.hAtoms = me.icn3d.unionHash(me.icn3d.hAtoms, me.icn3d.alnChains[i]);
      }

      var resiHtmlArray = [], seqHtml = "";
      var seqLength = (me.icn3d.alnChainsSeq[i] !== undefined) ? me.icn3d.alnChainsSeq[i].length : 0;

      if(seqLength > maxSeqCnt) maxSeqCnt = seqLength;

      var dashPos = i.indexOf('_');
      var structure = i.substr(0, dashPos);
      var chain = i.substr(dashPos + 1);

      seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + me.icn3d.alnChainsSeq[i][0].resi + "</span>";
      var bHighlightChain = (alignChainArray !== undefined && chainHash.hasOwnProperty(i)) ? true : false;

      for(var k=0, kl=seqLength; k < kl; ++k) {
        // resiId is empty if it's gap
        var resiId = 'N/A', resIdFull = '', color = '#000';
        if(me.icn3d.alnChainsSeq[i][k].resi !== '' && !isNaN(me.icn3d.alnChainsSeq[i][k].resi)) {
            resiId = me.icn3d.alnChainsSeq[i][k].resi;
            resIdFull = structure + "_" + chain + "_" + resiId;
            color = me.icn3d.alnChainsSeq[i][k].color;
        }

        var classForAlign = "class='icn3d-residue"; // used to identify a residue when clicking a residue in sequence

        //if( (bShowHighlight === undefined || bShowHighlight) && (bHighlightChain || (me.icn3d.alnChainsSeq[i][k].aligned === 2 && residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) ) {
        if( (bShowHighlight === undefined || bShowHighlight) && (bHighlightChain || (residueArray !== undefined && resIdFull !== '' && residueArray.indexOf(resIdFull) !== -1) ) ) {
            classForAlign = "class='icn3d-residue icn3d-highlightSeq";
        }

        // class for alignment: cons, ncons, nalign
        if(resIdFull === '') {
            classForAlign += "'";
        }
        else {
            classForAlign += " " + me.icn3d.alnChainsSeq[i][k].class + "'";
        }

        var colorRes;
        if(!me.icn3d.residues.hasOwnProperty(resIdFull)) {
            colorRes = '#000000;';
        }
        else {
            var firstAtom = me.icn3d.getFirstCalphaAtomObj(me.icn3d.residues[resIdFull]);
            colorRes = (firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() + ';' : '#000000;';
        }

        if(colorRes.toUpperCase() === '#FFFFFF;') colorRes = me.GREYD;

        var bWithCoord = (resIdFull !== '') ? true : false;

        if(bWithCoord) {
            if(me.icn3d.alnChainsSeq[i][k].resi != -1) {
                // add "align" in front of id so that full sequence and aligned sequence will not conflict
                seqHtml += "<span id='align_" + me.pre + resIdFull + "' " + classForAlign + " style='color:" + colorRes + "' title='" + me.icn3d.alnChainsSeq[i][k].resn + me.icn3d.alnChainsSeq[i][k].resi + "'>" + me.icn3d.alnChainsSeq[i][k].resn + "</span>";
            }
            else {
                seqHtml += "<span>" + me.icn3d.alnChainsSeq[i][k].resn + "</span>";
            }
        }
        else {
            seqHtml += "<span title='" + me.icn3d.alnChainsSeq[i][k].resn + me.icn3d.alnChainsSeq[i][k].resi + "'>" + me.icn3d.alnChainsSeq[i][k].resn + "</span>";
        }

      }
      seqHtml += "<span class='icn3d-residueNum' title='ending residue number'>" + me.icn3d.alnChainsSeq[i][seqLength-1].resi + "</span>";

      // the first chain stores all annotations
      var annoLength = (me.icn3d.alnChainsAnno[i] !== undefined) ? me.icn3d.alnChainsAnno[i].length : 0;

      for(var j=0, jl=annoLength; j < jl; ++j) {
        resiHtmlArray[j] = "";

        var chainid = (j == 0) ? me.icn3d.alnChainsAnTtl[i][4][0] : i; // bottom secondary, j == 0: chain2,  next secondary, j == 1: chain1,

        resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
        for(var k=0, kl=me.icn3d.alnChainsAnno[i][j].length; k < kl; ++k) {
          var text = me.icn3d.alnChainsAnno[i][j][k];

          if(text == 'H' || text == 'E' || text == 'c' || text == 'o') {

            if(text == 'H') {
                if(k % 2 == 0) {
                    resiHtmlArray[j] += '<span class="icn3d-helix">&nbsp;</span>';
                }
                else {
                    resiHtmlArray[j] += '<span class="icn3d-helix2">&nbsp;</span>';
                }
            }
            else if(text == 'E') {
                if(me.icn3d.alnChainsSeq[chainid][k] !== undefined) {
                    //var resiId = me.icn3d.alnChainsSeq[i][k].resi;
                    var resiId = me.icn3d.alnChainsSeq[chainid][k].resi;
                    var resIdFull = chainid + "_" + resiId;

                    if(me.icn3d.residues.hasOwnProperty(resIdFull)) {
                        var atom = me.icn3d.getFirstCalphaAtomObj(me.icn3d.residues[resIdFull]);

                        if(atom.ssend) {
                            resiHtmlArray[j] += '<span class="icn3d-sheet2">&nbsp;</span>';
                        }
                        else {
                            resiHtmlArray[j] += '<span class="icn3d-sheet">&nbsp;</span>';
                        }
                    }
                }
            }
            else if(text == 'c') {
                resiHtmlArray[j] += '<span class="icn3d-coil">&nbsp;</span>';
            }
            else if(text == 'o') {
                resiHtmlArray[j] += '<span class="icn3d-other">&nbsp;</span>';
            }
            else {
                resiHtmlArray[j] += "<span></span>";
            }
          }
          else {
              resiHtmlArray[j] += "<span>" + text + "</span>";
          }
          //resiHtmlArray[j] += "<span>" + me.icn3d.alnChainsAnno[i][j][k] + "</span>";
        }
        resiHtmlArray[j] += "<span class='icn3d-residueNum'></span>"; // a spot corresponding to the starting and ending residue number
      }

      var chainidTmp = i, title = (me.icn3d.pdbid_chain2title !== undefined) ? me.icn3d.pdbid_chain2title[i] : '';

      // add markers and residue numbers
      for(var j=annoLength-1; j >= 0; --j) {
        var annotitle = me.icn3d.alnChainsAnTtl[i][j][0];
        if(annotitle == 'SS') annotitle = '';
        //sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-seqTitle' chain='" + i + "' anno='" + j + "'>" + annotitle + "</div>" + resiHtmlArray[j] + "<br/></div>";
        sequencesHtml += "<div class='icn3d-residueLine' style='white-space:nowrap;'><div class='icn3d-seqTitle' anno='" + j + "'>" + annotitle + "</div>" + resiHtmlArray[j] + "<br/></div>";
      }

      sequencesHtml += '<div class="icn3d-seqTitle icn3d-link icn3d-blue" chain="' + i + '" anno="sequence" title="' + title + '">' + chainidTmp + ' </div><span class="icn3d-seqLine">' + seqHtml + '</span><br/>';
  }

  return {"sequencesHtml": sequencesHtml, "maxSeqCnt":maxSeqCnt};
};

