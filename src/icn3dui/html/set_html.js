/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTools = function() { var me = this; //"use strict";
    var html = "";

    html += me.divStr + "selection' style='display:none;'><div style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 3px;'>";
    html += "<table style='margin-top: 3px; width:100px;'><tr valign='center'>";

    html += me.setTools_base();

    // add custom buttons here
    // ...

    html += "</tr></table>";
    html += "</div></div>";

    return html;
};

iCn3DUI.prototype.setButton = function(buttonStyle, id, title, text, color) { var me = this; //"use strict";
    color = (color !== undefined) ? 'color:' + color : '';
    var bkgdColor = me.isMobile() ? ' background-color:#DDDDDD;' : '';
    return "<div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;" + bkgdColor + "' id='" + me.pre + id + "'><span style='white-space:nowrap;" + color + "' class='icn3d-commandTitle' title='" + title + "'>" + text + "</span></button></div>";
};

iCn3DUI.prototype.setTools_base = function() { var me = this; //"use strict";
    // second row
    var html = "";

    var buttonStyle = me.isMobile() ? 'none' : 'button';
    var tdStr = "<td valign='top'>";

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
        html += tdStr + me.setButton(buttonStyle, 'alternate', 'Alternate the structures', 'Alternate<br/>(Key \"a\")', me.ORANGE) + "</td>";
    }

    html += tdStr + me.setButton(buttonStyle, 'saveimage', 'Save iCn3D PNG Image', 'Save iCn3D<br/>PNG Image') + "</td>";

    if(me.cfg.cid === undefined) {
/*
        html += tdStr + me.setButton(buttonStyle, 'definedsets', 'Defined Sets', 'Defined<br/>Sets') + "</td>";

        html += tdStr + me.setButton(buttonStyle, 'show_annotations', 'View sequences and annotations for each chain', 'View Sequences<br/>& Annotations') + "</td>";

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign) {
            html += tdStr + me.setButton(buttonStyle, 'show_alignsequences', 'View the sequences of the aligned structures', 'Aligned<br/>Sequences') + "</td>";
        }

        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
            html += tdStr + me.setButton(buttonStyle, 'show_2ddgm', 'View the interactions of the structure', 'View<br/>Interactions') + "</td>";
        }
*/
        html += tdStr + me.setButton(buttonStyle, 'hbondsYes', 'View H-Bonds & Interactions', 'H-Bonds &<br/> Interactions') + "</td>";
    }

    html += tdStr + me.setButton(buttonStyle, 'show_selected', 'View ONLY the selected atoms', 'View Only<br/>Selection') + "</td>";

    html += tdStr + me.setButton(buttonStyle, 'toggleHighlight', 'Turn on and off the 3D highlight in the viewer', 'Toggle<br/>Highlight') + "</td>";

    if(me.cfg.cid === undefined) {
        html += tdStr + me.setButton(buttonStyle, 'removeLabels', 'Remove Labels', 'Remove<br/>Labels') + "</td>";
    }

    return html;
};

iCn3DUI.prototype.setTopMenusHtmlMobile = function (id) { var me = this; //"use strict";
    var html = "";

    html += "<div style='position:relative;'>";

    html += me.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

    html += me.setReplayHtml();

    if(!me.isMobile()) {
        var marginLeft = me.WIDTH - 40 + 5;

        html += me.buttonStr + "fullscreen' style='position:absolute; z-index:1999; display:block; padding:0px; margin: 7px 0px 0px " + marginLeft + "px; width:30px; height:34px; border-radius:4px; border:none;' title='Full screen'>";
        html += "<svg fill='#1c94c4' viewBox='0 0 24 24' width='24' height='24'>";
        html += "<path d='M0 0h24v24H0z' fill='none'></path>";
        html += "<path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'></path>";
        html += "</svg>";
        html += "</button>";
    }

    html += "<!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
    html += me.divStr + "mnlist' style='position:absolute; z-index:999; float:left; display:block; margin: 5px 0px 0px 5px;'>";

    //html += "<div class='icn3d-menu'>";
    html += "<div>";
    html += "<accordion id='" + me.pr2e + "accordion0' class='icn3d-accordion'>";
    html += "<h3 style='width:20px; height:24px; position:relative'><span style='position:absolute; left:5px; top:6px;'>&#9776;</span></h3>";
    html += "<div>";

    var liStr = "<li><span class='icn3d-menu-color'";

    html += "<ul class='icn3d-mn'>";
    html += liStr + ">File</span>";
    html += me.setMenu1_base();
    html += liStr + ">Select</span>";
    html += me.setMenu2_base();
    html += liStr + ">View</span>";
    html += me.setMenu2b_base();
    html += liStr + " id='" + me.pre + "style'>Style</span>";
    html += me.setMenu3_base();
    html += liStr + " id='" + me.pre + "color'>Color</span>";
    html += me.setMenu4_base();
    html += liStr + ">Windows</span>";
    html += me.setMenu5_base();
    html += liStr + ">Help</span>";
    html += me.setMenu6_base();

    html += "<li><div style='position:relative; margin-top:-6px;'><label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left (\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
    html += "<div class='icn3d-commandTitle' style='margin-top: 3px; white-space: nowrap;'><span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div>";

    if(me.cfg.align !== undefined) {
        html += "<li><span id='" + me.pre + "alternate2' class='icn3d-menu-color' title='Alternate the structures'>Alternate</span>";
    }

    //html += '    <li><div class="icn3d-commandTitle" style="white-space:nowrap;"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand">Show Toolbar</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">Hide Toolbar</span></div>';

    //html += '    <li><div class="icn3d-commandTitle" style="white-space:nowrap;"><input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."><br><button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search Seq.</button> <a style="text-decoration: none;" href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div>';


    html += "</ul>";

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    html += "</div>";

    //html += me.setTools();

    // show title at the top left corner
    var titleColor = (me.opts['background'] == 'white' || me.opts['background'] == 'grey') ? 'black' : me.GREYD;

    html += me.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:block; margin: 12px 0px 0px 40px; color:" + titleColor + "; width:" + (me.WIDTH - 40).toString() + "px'></div>";
    html += me.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.GREYD + ";'>";
    html += me.divStr + "mnLogSection'>";
    html += "<div style='height: " + me.MENU_HEIGHT + "px;'></div>";
    html += "</div>";

    if(me.cfg.mmtfid === undefined) {
        if(me.realHeight < 300) {
            html += me.divStr + "wait' style='position:absolute; top:100px; left:50px; font-size: 1.2em; color: #444444;'>Loading data...</div>";
        }
        else {
            html += me.divStr + "wait' style='position:absolute; top:180px; left:50px; font-size: 1.8em; color: #444444;'>Loading data...</div>";
        }
    }
    html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

    // separate for the log box
    if(me.cfg.showcommand === undefined || me.cfg.showcommand) {
        html += me.setLogWindow();
    }

    html += "</div>";

    html += "</div>";

    html += me.setDialogs();

    html += me.setCustomDialogs();

    $( "#" + id).html(html);

    // mn display
    $("accordion").accordion({ collapsible: true, active: false, heightStyle: "content"});
    $("accordion div").removeClass("ui-accordion-content ui-corner-all ui-corner-bottom ui-widget-content");

    $(".icn3d-mn").menu({position: { my: "left top", at: "right top" }});
    $(".icn3d-mn").hover(function(){},function(){$("accordion").accordion( "option", "active", "none");});

    $("#" + me.pre + "accordion0").hover( function(){ $("#" + me.pre + "accordion0 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion0 div").css("display", "none"); } );
};

iCn3DUI.prototype.setReplayHtml = function (id) { var me = this; //"use strict";
    var html = '';

    html += me.divStr + "replay' style='display:none; position:absolute; z-index:9999; top:" + parseInt(me.HEIGHT - 100).toString() + "px; left:20px;'>";
    html += "<div title='Click to replay one step'><svg style='cursor:pointer;' fill='#f8b84e' viewBox='0 0 60 60' width='40' height='40'>";
    html += '<circle style="fill:#f8b84e;" cx="29" cy="29" r="29"/>';
    html += '<g>';
    html += '<polygon style="fill:#FFFFFF;" points="44,29 22,44 22,29.273 22,14"/>';
    html += '<path style="fill:#FFFFFF;" d="M22,45c-0.16,0-0.321-0.038-0.467-0.116C21.205,44.711,21,44.371,21,44V14c0-0.371,0.205-0.711,0.533-0.884c0.328-0.174,0.724-0.15,1.031,0.058l22,15C44.836,28.36,45,28.669,45,29s-0.164,0.64-0.437,0.826l-22,15C22.394,44.941,22.197,45,22,45z M23,15.893v26.215L42.225,29L23,15.893z"/>';
    html += '</g>';
    html += "</svg></div>";
    html += me.divStr + "replay_menu' style='background-color:#DDDDDD; padding:3px; font-weight:bold;'></div>";
    html += me.divStr + "replay_cmd' style='background-color:#DDDDDD; padding:3px; max-width:250px'></div>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setTopMenusHtml = function (id) { var me = this; //"use strict";
    var html = "";

    html += "<div style='position:relative;'>";

    html += me.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

    html += me.setReplayHtml();

    html += "<!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
    html += me.divStr + "mnlist' style='position:absolute; z-index:999; float:left; display:table-row; margin-top: -2px;'>";
    html += "<table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

    var tdStr = '<td valign="top">';
    html += tdStr + me.setMenu1() + '</td>';

    if(!me.cfg.simplemenu) {
        html += tdStr + me.setMenu2() + '</td>';
    }

    html += tdStr + me.setMenu2b() + '</td>';
    html += tdStr + me.setMenu3() + '</td>';
    html += tdStr + me.setMenu4() + '</td>';

    if(!me.cfg.simplemenu) {
        html += tdStr + me.setMenu5() + '</td>';
        //html += tdStr + me.setMenu5b() + '</td>';
        html += tdStr + me.setMenu6() + '</td>';

        html += tdStr + "<div style='position:relative; margin-left:6px;'><label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left (\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
        html += "<div class='icn3d-commandTitle' style='min-width:40px; margin-top: 3px; white-space: nowrap;'><span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div></td>";

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px; border-left:solid 1px #888888"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand">&nbsp;&nbsp;Show Toolbar&nbsp;&nbsp;</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">&nbsp;&nbsp;Hide Toolbar&nbsp;&nbsp;</span></div></td>';

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:8px; border-left:solid 1px #888888">&nbsp;&nbsp;<input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."> <button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search Seq.</button> <a style="text-decoration: none;" href="' + me.baseUrl + 'icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div></td>';
    }

    html += "</tr>";
    html += "</table>";
    html += "</div>";

    html += me.setTools();

    // show title at the top left corner
    html += me.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color:" + me.GREYD + "; width:" + me.WIDTH + "px'></div>";

    html += me.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.GREYD + ";'>";
    html += me.divStr + "mnLogSection'>";
    html += "<div style='height: " + me.MENU_HEIGHT + "px;'></div>";
//        html += "<div style='height: " + me.MENU_HEIGHT + "px;'></div>";

    html += " </div>";

    //$("#" + me.divid).css('background-color', me.GREYD);

    if(me.cfg.mmtfid === undefined) {
        if(me.realHeight < 300) {
            html += me.divStr + "wait' style='position:absolute; top:100px; left:50px; font-size: 1.2em; color: #444444;'>Loading data...</div>";
        }
        else {
            html += me.divStr + "wait' style='position:absolute; top:180px; left:50px; font-size: 1.8em; color: #444444;'>Loading data...</div>";
        }
    }
    html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

    // separate for the log box
    if(me.cfg.showcommand === undefined || me.cfg.showcommand) {
        html += me.setLogWindow();
    }

    html += "</div>";

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

iCn3DUI.prototype.getLink = function(id, text) { var me = this; //"use strict";
    return "<li><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getLinkWrapper = function(id, text, wrapper) { var me = this; //"use strict";
    return "<li id='" + me.pre + wrapper + "'><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getRadio = function(radioid, id, text, bChecked) { var me = this; //"use strict";
    var checkedStr = (bChecked) ? ' checked' : '';
    //return "<li>" + me.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><label for='" + me.pre + id + "'>" + text + "</label></li>";

    //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
    return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-rad-text'>" + text + "</span></label></li>";
};

iCn3DUI.prototype.getRadioColor = function(radioid, id, text, color, bChecked) { var me = this; //"use strict";
    var checkedStr = (bChecked) ? ' checked' : '';
    //return "<li>" + me.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><label for='" + me.pre + id + "'>" + text + "</label></li>";

    //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
    return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-color-rad-text' color='" + color + "'><span style='background-color:#" + color + "'>&nbsp;&nbsp;&nbsp;</span> " + text + "</span></label></li>";
};

iCn3DUI.prototype.setMenu1 = function() { var me = this; //"use strict";
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

iCn3DUI.prototype.setMenu1_base = function() { var me = this; //"use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";
    html += "<li><span>Retrieve by ID</span>";
    html += "<ul>";
    html += me.getLink('mn1_mmdbid', 'MMDB ID');
    html += me.getLink('mn1_mmtfid', 'MMTF ID');
    html += me.getLink('mn1_pdbid', 'PDB ID');
    html += me.getLink('mn1_opmid', 'OPM PDB ID');
    html += me.getLink('mn1_mmcifid', 'mmCIF ID');
    html += me.getLink('mn1_gi', 'NCBI gi');
    html += me.getLink('mn1_cid', 'PubChem CID');
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Open File</span>";
    html += "<ul>";
    html += me.getLink('mn1_pdbfile', 'PDB File');
    html += me.getLink('mn1_mmciffile', 'mmCIF File');
    html += me.getLink('mn1_mol2file', 'Mol2 File');
    html += me.getLink('mn1_sdffile', 'SDF File');
    html += me.getLink('mn1_xyzfile', 'XYZ File');
    html += me.getLink('mn1_urlfile', 'URL (Same Host) ');
    html += "<li>-</li>";
    html += me.getLink('mn1_pngimage', 'iCn3D PNG Image');
    html += me.getLink('mn1_state', 'State/Script File');
    html += me.getLink('mn1_fixedversion', 'Share Link in Archived Ver.');
    html += me.getLink('mn1_selection', 'Selection File');
    html += "<li>-</li>";

    //html += me.getLink('mn1_dsn6', 'Electron Density (DSN6)');
    html += "<li><span>Electron Density (DSN6)</span>";
    html += "<ul>";
    html += me.getLink('mn1_dsn6', 'Local File');
    html += me.getLink('mn1_dsn6url', 'URL (Same Host)');
    html += "</ul>";

    html += "</ul>";
    html += "</li>";
    html += "<li><span>Align</span>";
    html += "<ul>";
    html += me.getLink('mn1_blast_rep_id', 'Sequence to Structure');
    html += me.getLink('mn1_align', 'Structure to Structure');
    html += me.getLink('mn1_chainalign', 'Chain to Chain');

    html += "</ul>";
    html += "</li>";

    //html += me.getLink('mn2_realignonseqalign', 'Realign Selection');

    html += "<li id='" + me.pre + "mn2_realignWrap'><span>Realign Selection</span>";
    html += "<ul>";
    html += me.getRadio('mn2_realign', 'mn2_realignonseqalign', 'on Sequence Alignment', true);
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
    //if(me.cfg.mmdbid !== undefined) {
//     html += me.getLink('mn6_exportInteraction', 'Interaction List');
    //}

    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn1_sharelink', 'Share Link');

/*
    html += "<li><span>Replay Each Step</span>";
    html += "<ul>";
    html += me.getLink('mn1_replayon', 'On');
    html += me.getLink('mn1_replayoff', 'Off');
    html += "</ul>";
    html += "</li>";
*/

    html += me.getLink('mn1_replayon', 'Replay Each Step');

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
}

iCn3DUI.prototype.setMenu2 = function() { var me = this; //"use strict";
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

iCn3DUI.prototype.setMenu2_base = function() { var me = this; //"use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_definedsets', 'Defined Sets');
    html += me.getLink('mn2_selectall', 'All');
    html += me.getLink('mn2_selectdisplayed', 'Displayed Set');
//        if(me.cfg.cid === undefined) {
//            html += me.getRadio('mn2_select', 'mn2_select_chain', 'Defined Sets');
//        }
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


    //html += "<li><span>Selection Mode</span>";
    //html += "<ul>";
    //html += me.getLink('mn6_modeall', 'Apply style, color,</span><br/><span>surface to all atoms');
    //html += me.getLink('mn6_modeselection', 'Apply style, color,</span><br/><span>surface only to selection');
    //html += "</ul>";
    //html += "</li>";


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

iCn3DUI.prototype.setMenu2b = function() { var me = this; //"use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion2b' class='icn3d-accordion'>";
    html += "<h3>View</h3>";
    html += "<div>";

    html += me.setMenu2b_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu2b_base = function() { var me = this; //"use strict";
    var html = "";
    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_show_selected', 'View Only <br>Selection');
    html += me.getLink('mn2_hide_selected', 'Hide Selection');
    html += me.getLink('mn2_selectedcenter', 'Zoom in Selection');
    html += me.getLink('mn6_center', 'Center Selection');
    html += me.getLink('mn2_fullstru', 'View Full Structure');
    //if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || ( me.bInputfile && me.InputfileType == 'pdb' && Object.keys(me.icn3d.structures).length >= 2) ) {
        //html += me.getLink('mn2_alternate', 'Alternate (Key \"a\")');
        html += "<li id='" + me.pre + "mn2_alternateWrap'><span id='" + me.pre + "mn2_alternate' class='icn3d-link'>Alternate (Key \"a\")</span></li>";
    //}

    html += "<li>-</li>";

    if(me.cfg.cid === undefined) {
        html += "<li><span>Chem. Binding</span>";
        html += "<ul>";
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindingshow', 'Show');
        html += me.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindinghide', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += me.getLink('mn6_hbondsYes', 'H-Bonds <br>& Interactions');
        //html += me.getLink('mn6_hbondsNo', 'Remove H-Bonds <br>& Interactions');

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
        html += me.getRadio('mn6_ssbonds', 'mn6_clbondsExport', 'Export Pairs');
        html += me.getRadio('mn6_clbonds', 'mn6_clbondsNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        if(me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined) {
          html += "<li id='" + me.pre + "assemblyWrapper'><span>Assembly</span>";
          html += "<ul>";

          html += me.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', true);
          html += me.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit');

          html += "</ul>";
          html += "</li>";

          html += me.getLink('mn6_symmetry', 'Symmetry');
        }
    }

    html += "<li><span>Distance</span>";
    html += "<ul>";
    html += me.getRadio('mn6_distance', 'mn6_distanceYes', 'Measure');
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
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale01', '0.1');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale02', '0.2');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale03', '0.3', true);
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale04', '0.4');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale05', '0.5');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale06', '0.6');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale07', '0.7');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale08', '0.8');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale09', '0.9');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale10', '1.0');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale20', '2.0');
    html += me.getRadio('mn6_labelscale', 'mn6_labelscale40', '4.0');
    html += "</ul>";
    html += "</li>";

    if(me.cfg.opmid !== undefined) {
        //html += me.getLink('adjustmem', 'Adjust Membrane');
        //html += me.getLink('selectplane', 'Select between<br>Two X-Y Planes');
        html += "<li>-</li>";
        html += "<li id='" + me.pre + "togglememli'><span id='" + me.pre + "togglemem' class='icn3d-link'>Toggle Membrane</span></li>";
        html += "<li id='" + me.pre + "adjustmemli'><span id='" + me.pre + "adjustmem' class='icn3d-link'>Adjust Membrane</span></li>";
        html += "<li id='" + me.pre + "selectplaneli'><span id='" + me.pre + "selectplane' class='icn3d-link'>Select between<br>Two X-Y Planes</span></li>";
    }
    else {
        html += "<li>-</li>";
        html += "<li id='" + me.pre + "togglememli' style='display:none'><span id='" + me.pre + "togglemem' class='icn3d-link'>Toggle Membrane</span></li>";
        html += "<li id='" + me.pre + "adjustmemli' style='display:none'><span id='" + me.pre + "adjustmem' class='icn3d-link'>Adjust Membrane</span></li>";
        html += "<li id='" + me.pre + "selectplaneli' style='display:none'><span id='" + me.pre + "selectplane' class='icn3d-link'>Select between<br>Two X-Y Planes</span></li>";
    }

    html += "<li>-</li>";

/*
    html += "<li><span>Transform Hints</span>";
    html += "<ul>";
    html += "<li><span>Rotate</span>";
    html += "<ul>";
    html += "<li>Left Mouse</li>";
    html += "<li>Key l: Left</li>";
    html += "<li>Key j: Right</li>";
    html += "<li>Key i: Up</li>";
    html += "<li>Key m: Down</li>";
    html += "<li>Shift + Key l: Left 90&deg;</li>";
    html += "<li>Shift + Key j: Right 90&deg;</li>";
    html += "<li>Shift + Key i: Up 90&deg;</li>";
    html += "<li>Shift + Key m: Down 90&deg;</li>";
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Zoom</span>";
    html += "<ul>";
    html += "<li>Middle Mouse</li>";
    html += "<li>Key z: Zoom in</li>";
    html += "<li>Key x: Zoom out</li>";
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Translate</span>";
    html += "<ul>";
    html += "<li>Right Mouse</li>";
    html += "</ul>";
    html += "</li>";
    html += "</ul>";
    html += "</li>";
*/

    html += me.getLink('mn6_sidebyside', 'Side by Side');

    html += "<li><span>Rotate</span>";
    html += "<ul>";

    html += "<li><span>Rotate 90&deg;</span>";
    html += "<ul>";
    html += me.getRadio('mn6_rotate90', 'mn6_rotatex', 'X-axis (Shift + Key M)');
    html += me.getRadio('mn6_rotate90', 'mn6_rotatey', 'Y-axis (Shift + Key J)');
    html += me.getRadio('mn6_rotate90', 'mn6_rotatez', 'Z-axis');
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Auto Rotation</span>";
    html += "<ul>";
    html += me.getRadio('mn6_rotate', 'mn6_rotateleft', 'Rotate Left');
    html += me.getRadio('mn6_rotate', 'mn6_rotateright', 'Rotate Right');
    html += me.getRadio('mn6_rotate', 'mn6_rotateup', 'Rotate Up');
    html += me.getRadio('mn6_rotate', 'mn6_rotatedown', 'Rotate Down');
    html += "</ul>";
    html += "</li>";

    html += "</ul>";
    html += "</li>";

    html += "<li><span>Camera</span>";
    html += "<ul>";
    html += me.getRadio('mn6_camera', 'mn6_cameraPers', 'Perspective', true);
    html += me.getRadio('mn6_camera', 'mn6_cameraOrth', 'Orthographic');
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Fog for Selection</span>";
    html += "<ul>";
    html += me.getRadio('mn6_showfog', 'mn6_showfogYes', 'On');
    html += me.getRadio('mn6_showfog', 'mn6_showfogNo', 'Off', true);
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Slab for Selection</span>";
    html += "<ul>";
    html += me.getRadio('mn6_showslab', 'mn6_showslabYes', 'On');
    html += me.getRadio('mn6_showslab', 'mn6_showslabNo', 'Off', true);
    html += "</ul>";
    html += "</li>";
    html += "<li><span>XYZ-axes</span>";
    html += "<ul>";
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisYes', 'Show');
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisNo', 'Hide', true);
    html += "</ul>";
    html += "</li>";

    html += "<li>-</li>";

    html += "<li><span>Reset</span>";
    html += "<ul>";
    html += me.getRadio('mn6_reset', 'reset', 'All');
    html += me.getRadio('mn6_reset', 'mn6_resetOrientation', 'Orientation');
    html += "</ul>";
    html += "</li>";

    html += me.getLink('mn6_back', 'Undo');
    html += me.getLink('mn6_forward', 'Redo');

    html += me.getLink('mn6_fullscreen', 'Full Screen');
//    html += me.getLink('mn6_exitfullscreen', 'Exit Full Screen');

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};

iCn3DUI.prototype.setMenu3 = function() { var me = this; //"use strict";
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

iCn3DUI.prototype.setMenu3_base = function() { var me = this; //"use strict";
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
    html += me.getRadio('mn5_opacity', 'mn5_opacity09', '0.9');
    html += me.getRadio('mn5_opacity', 'mn5_opacity08', '0.8');
    html += me.getRadio('mn5_opacity', 'mn5_opacity07', '0.7');
    html += me.getRadio('mn5_opacity', 'mn5_opacity06', '0.6');
    html += me.getRadio('mn5_opacity', 'mn5_opacity05', '0.5');
    html += me.getRadio('mn5_opacity', 'mn5_opacity04', '0.4');
    html += me.getRadio('mn5_opacity', 'mn5_opacity03', '0.3');
    html += me.getRadio('mn5_opacity', 'mn5_opacity02', '0.2');
    html += me.getRadio('mn5_opacity', 'mn5_opacity01', '0.1');
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

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};

iCn3DUI.prototype.setMenu4 = function() { var me = this; //"use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion4' class='icn3d-accordion'>";
    html += "<h3 id='" + me.pre + "color'>Color</h3>";
    html += "<div>";

    html += me.setMenu4_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu4_base = function() { var me = this; //"use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    html += "<li><span style='padding-left:2.3em;'>Unicolor</span>";
    html += "<ul>";

    html += "<li><span>Red</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrRed', 'Red');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed1', 'Red', 'F00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed2', 'Indian Red', 'CD5C5C');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed3', 'Light Coral', 'F08080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed4', 'Salmon', 'FA8072');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed5', 'Dark Salmon', 'E9967A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed6', 'Light Salmon', 'FFA07A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed7', 'Crimson', 'DC143C');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed8', 'Fire Brick', 'B22222');
    html += me.getRadioColor('mn4_clr', 'mn4_clrRed9', 'Dark Red', '8B0000');
    html += "</ul>";

    html += "<li><span>Pink</span>";
    html += "<ul>";
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink1', 'Pink', 'FFC0CB');
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink2', 'Light Pink', 'FFB6C1');
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink3', 'Hot Pink', 'FF69B4');
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink4', 'Deep Pink', 'FF1493');
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink5', 'Medium Violet Red', 'C71585');
    html += me.getRadioColor('mn4_clr', 'mn4_clrPink6', 'Pale Violet Red', 'DB7093');
    html += "</ul>";

    html += "<li><span>Orange</span>";
    html += "<ul>";
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange1', 'Orange', 'FFA500');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange2', 'Dark Orange', 'FF8C00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange3', 'Orange Red', 'FF4500');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange4', 'Tomato', 'FF6347');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange5', 'Coral', 'FF7F50');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOrange6', 'Light Salmon', 'FFA07A');
    html += "</ul>";

    html += "<li><span>Yellow</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrYellow', 'Yellow');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow1', 'Yellow', 'FF0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow2', 'Gold', 'FFD700');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow3', 'Light Yellow', 'FFFFE0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow4', 'Lemon Chiffon', 'FFFACD');
    //html += me.getRadioColor('mn4_clr', 'mn4_clrYellow5', 'Light Golden Rod Yellow', 'FAFAD2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow5', 'Light Golden Rod', 'FAFAD2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow6', 'Papaya Whip', 'FFEFD5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow7', 'Moccasin', 'FFE4B5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow8', 'Peach Puff', 'FFDAB9');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow9', 'Pale Golden Rod', 'EEE8AA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow10', 'Khaki', 'F0E68C');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYellow11', 'Dark Khaki', 'BDB76B');
    html += "</ul>";

    html += "<li><span>Magenta</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrMagenta', 'Magenta');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta1', 'Magenta', 'F0F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta2', 'Orchid', 'DA70D6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta3', 'Violet', 'EE82EE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta4', 'Plum', 'DDA0DD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta5', 'Thistle', 'D8BFD8');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta6', 'Lavender', 'E6E6FA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta7', 'Medium Orchid', 'BA55D3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta8', 'Medium Purple', '9370DB');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta9', 'Rebecca Purple', '663399');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta10', 'Blue Violet', '8A2BE2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta11', 'Dark Violet', '9400D3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta12', 'Dark Orchid', '9932CC');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta13', 'Dark Magenta', '8B008B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta14', 'Purple', '800080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta15', 'Indigo', '4B0082');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta16', 'Slat Blue', '6A5ACD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta17', 'Dark Slate Blue', '483D8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMagenta18', 'Medium Slat Blue', '6A5ACD');
    html += "</ul>";

    html += "<li><span>Green</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrGreen', 'Green');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen1', 'Green', '0F0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen2', 'Dark Green', '006400');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen3', 'Yellow Green', '9ACD32');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen4', 'Olive Drab', '6B8E23');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen5', 'Olive', '808000');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen6', 'Dark Olive Green', '556B2F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen7', 'Medium Aquamarine', '66CDAA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen8', 'Dark Sea Green', '8FBC8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen9', 'Lignt Sea Green', '20B2AA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen10', 'Dark Cyan', '008B8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen11', 'Teal', '008080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen12', 'Forest Green', '228B22');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen13', 'Sea Green', '2E8B57');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen14', 'Medium Sea Green', '3CB371');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen15', 'Spring Green', '00FF7F');
    //html += me.getRadioColor('mn4_clr', 'mn4_clrGreen16', 'Medium Spring Green', '00FA9A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen16', 'Medium Spring', '00FA9A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen17', 'Light Green', '90EE90');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen18', 'Pale Green', '98FB98');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen19', 'Lime Green', '32CD32');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen20', 'Lawn Green', '7CFC00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen21', 'Chartreuse', '7FFF00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGreen22', 'Green Yellow', 'ADFF2F');
    html += "</ul>";

    html += "<li><span>Cyan</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrCyan', 'Cyan');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan1', 'Cyan', '0FF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan2', 'Light Cyan', 'E0FFFF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan3', 'Pale Turquoise', 'AFEEEE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan4', 'Aquamarine', '7FFFD4');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan5', 'Turquoise', '40E0D0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan6', 'Medium Turquoise', '48D1CC');
    html += me.getRadioColor('mn4_clr', 'mn4_clrCyan7', 'Dark Turquoise', '00CED1');
    html += "</ul>";

    html += "<li><span>Blue</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrBlue', 'Blue');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue1', 'Blue', '00F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue2', 'Medium Blue', '0000CD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue3', 'Dark Blue', '00008B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue4', 'Navy', '000080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue5', 'Midnight Blue', '191970');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue6', 'Royal Blue', '4169E1');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue7', 'Medium Slate Blue', '7B68EE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue8', 'Corn Flower Blue', '6495ED');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue9', 'Dodger Blue', '1E90FF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue10', 'Deep Sky Blue', '00BFFF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue11', 'Light Sky Blue', '87CEFA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue12', 'Sky Blue', '87CEEB');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue13', 'Light Blue', 'ADD8E6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue14', 'Powder Blue', 'B0E0E6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue15', 'Light Steel Blue', 'B0C4DE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue16', 'Steel Blue', '4682B4');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBlue17', 'Cadet Blue', '5F9EA0');
    html += "</ul>";

    html += "<li><span>Brown</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrBrown', 'Brown');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown1', 'Brown', 'A52A2A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown2', 'Maroon', '800000');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown3', 'Sienna', 'A0522D');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown4', 'Saddle Brown', '8B4513');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown5', 'Chocolate', 'D2691E');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown6', 'Peru', 'CD853F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown7', 'Dark Golden Rod', 'B8860B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown8', 'Golden Rod', 'DAA520');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown9', 'Sandy Brown', 'F4A460');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown10', 'Rosy Brown', 'BC8F8F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown11', 'Tan', 'D2B48C');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown12', 'Burlywood', 'DEB887');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown13', 'Wheat', 'F5DEB3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown14', 'Navajo White', 'FFDEAD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown15', 'Bisque', 'FFE4C4');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown16', 'Blanched Almond', 'FFEBCD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrBrown17', 'Corn Silk', 'FFF8DC');
    html += "</ul>";

    html += "<li><span>White</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrWhite', 'White');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite1', 'White', 'FFF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite2', 'Snow', 'FFFAFA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite3', 'Honey Dew', 'F0FFF0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite4', 'Mint Cream', 'F5FFFA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite5', 'Azure', 'F0FFFF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite6', 'Alice Blue', 'F0F8FF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite7', 'Ghost White', 'F8F8FF');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite8', 'White Smoke', 'F5F5F5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite9', 'Sea Shell', 'FFF5EE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite10', 'Beige', 'F5F5DC');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite11', 'Old Lace', 'FDF5E6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite12', 'Floral White', 'FFFAF0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite13', 'Ivory', 'FFFFF0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite14', 'Antique White', 'FAEBD7');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite15', 'Linen', 'FAF0E6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite16', 'Lavenderblush', 'FFF0F5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrWhite17', 'Misty Rose', 'FFE4E1');
    html += "</ul>";

    html += "<li><span>Grey</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrGray', 'Gray');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray1', 'Gray', '808080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray2', 'Dim Gray', '696969');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray3', 'Light Slate Gray', '778899');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray4', 'Slate Gray', '708090');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray5', 'Dark Slate Gray', '2F4F4F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray6', 'Black', '000000');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray7', 'Dark Gray', 'A9A9A9');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray8', 'Silver', 'C0C0C0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray9', 'Light Gray', 'D3D3D3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGray10', 'Gainsboro', 'DCDCDC');
    html += "</ul>";

    html += "</ul>";

    html += me.getRadio('mn4_clr', 'mn4_clrCustom', 'Color Picker');
    html += "<li>-</li>";

    if(me.cfg.cid === undefined) {
        html += me.getRadio('mn4_clr', 'mn4_clrSpectrum', 'Spectrum');
        html += "<li><span style='padding-left:2.3em;'>Secondary</span>";
        html += "<ul>";
        html += me.getRadio('mn4_clr', 'mn4_clrSSGreen', 'Sheet in Green');
        html += me.getRadio('mn4_clr', 'mn4_clrSSYellow', 'Sheet in Yellow');
        html += me.getRadio('mn4_clr', 'mn4_clrSSSpectrum', 'Spectrum');
        html += "</ul>";

        html += me.getRadio('mn4_clr', 'mn4_clrCharge', 'Charge');
        html += me.getRadio('mn4_clr', 'mn4_clrHydrophobic', 'Wimley-White<br><span style="padding-left:1.5em;">Hydrophobicity</span>');

        html += "<li><span style='padding-left:2.3em;'>B-factor</span>";
        html += "<ul>";
        html += me.getRadio('mn4_clr', 'mn4_clrBfactor', 'Original');
        html += me.getRadio('mn4_clr', 'mn4_clrBfactorNorm', 'Percentile');
        html += "</ul>";

        html += me.getRadio('mn4_clr', 'mn4_clrArea', 'Solvent<br><span style="padding-left:1.5em;">Accessibility</span>');

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.blast_rep_id !== undefined) {
          html += me.getRadio('mn4_clr', 'mn4_clrChain', 'Chain');
        }
        else {
          html += me.getRadio('mn4_clr', 'mn4_clrChain', 'Chain', true);
        }

        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
          html += me.getRadio('mn4_clr', 'mn4_clrdomain', '3D Domain');
        }

        //html += me.getRadio('mn4_clr', 'mn4_clrResidue', 'Residue');

        html += "<li><span style='padding-left:2.3em;'>Residue</span>";
        html += "<ul>";
        html += me.getRadio('mn4_clr', 'mn4_clrResidue', 'Default');
        html += me.getRadio('mn4_clr', 'mn4_clrResidueCustom', 'Custom');
        html += "</ul>";

        html += me.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom');

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
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

    html += "<li>-</li>";

    html += me.getLink('mn4_clrSave', 'Save Color');
    html += me.getLink('mn4_clrApplySave', 'Apply Saved Color');

    html += "<li><br/></li>";
    html += "</ul>";

    return html;
};

iCn3DUI.prototype.setMenu5 = function() { var me = this; //"use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion5' class='icn3d-accordion'>";
    html += "<h3 id='" + me.pre + "windows' style='font-size:1.2em'>&nbsp;Windows</h3>";
    html += "<div>";

    html += me.setMenu5_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu5_base = function() { var me = this; //"use strict";
    var html = "";

    html += "<ul class='icn3d-mn'>";

    if(me.cfg.cid === undefined) {
        html += me.getLink('mn6_selectannotations', 'View Sequences<br>& Annotations');

        if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign) {
            html += me.getLink('mn2_alignment', 'View Aligned<br>Sequences');
        }

        //html += me.getLink('mn2_selectresidues', 'View Sequences');
        if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
          html += me.getLink('mn2_2ddgm', 'View Interactions');
        }

        html += me.getLink('definedsets2', 'Defined Sets');
    }

    html += me.getLink('mn6_yournote', 'Your Note /<br>Window Title');

    html += "<li><span>Show Windows</span>";
    html += "<ul>";
    html += me.getLink('mn1_window_table', 'Highlight Interactions in Table');
    html += me.getLink('mn1_window_linegraph', '2D Interaction Graph');
    html += me.getLink('mn1_window_graph', '2D Graph (Force-Directed)');
    html += "</ul>";
    html += "</li>";

    if(me.cfg.cid !== undefined) {
        html += "<li><span>Links</span>";
        html += "<ul>";
        html += me.getLink('mn1_link_structure', 'Compound Summary');
        html += me.getLink('mn1_link_vast', 'Similar Compounds');
        html += me.getLink('mn1_link_bind', 'Structures Bound');
        html += "</ul>";
        html += "</li>";
    }
    else {
        html += "<li><span>Links</span>";
        html += "<ul>";
        html += me.getLink('mn1_link_structure', 'Structure Summary');
        html += me.getLink('mn1_link_vast', 'Similar Structures');
        html += me.getLink('mn1_link_pubmed', 'Literature');
        html += me.getLink('mn1_link_protein', 'Protein');
        //html += me.getLink('mn1_link_gene', 'Gene');
        //html += me.getLink('mn1_link_chemicals', 'Chemicals');
        html += "</ul>";
        html += "</li>";
    }

    html += "<li><br/></li>";

    html += "</ul>";

    return html;
};

iCn3DUI.prototype.setMenu6 = function() { var me = this; //"use strict";
    var html = "";

    html += "<div class='icn3d-menu'>";
    html += "<accordion id='" + me.pre + "accordion6' class='icn3d-accordion'>";
    html += "<h3>Help</h3>";
    html += "<div>";

    html += me.setMenu6_base();

    html += "</div>";
    html += "</accordion>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setMenu6_base = function() { var me = this; //"use strict";
    var html = "";

    var liStr = "<li><a href='";

    html += "<ul class='icn3d-mn'>";

    html += liStr + me.baseUrl + "icn3d/docs/icn3d_about.html' target='_blank'>About iCn3D<span style='font-size:0.9em'> " + me.REVISION + "</span></a></li>";

    html += liStr + me.baseUrl + "icn3d/docs/icn3d_help.html' target='_blank'>Help Doc</a></li>";

    html += liStr + me.baseUrl + "icn3d/icn3d.html#gallery' target='_blank'>Gallery</a></li>";

    html += "<li><span>Web APIs</span>";
    html += "<ul>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#HowToUse' target='_blank'>How to Embed</a></li>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#parameters' target='_blank'>URL Parameters</a></li>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#commands' target='_blank'>Commands</a></li>";
    html += "</ul>";
    html += "</li>";

    html += liStr + "https://github.com/ncbi/icn3d' target='_blank'>Source Code</a></li>";

    html += "<li>-</li>";

    html += "<li><span>Transform Hints</span>";
    html += "<ul>";
    html += "<li><span>Rotate</span>";
    html += "<ul>";
    html += "<li>Left Mouse</li>";
    html += "<li>Key l: Left</li>";
    html += "<li>Key j: Right</li>";
    html += "<li>Key i: Up</li>";
    html += "<li>Key m: Down</li>";
    html += "<li>Shift + Key l: Left 90&deg;</li>";
    html += "<li>Shift + Key j: Right 90&deg;</li>";
    html += "<li>Shift + Key i: Up 90&deg;</li>";
    html += "<li>Shift + Key m: Down 90&deg;</li>";
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Zoom</span>";
    html += "<ul>";
    html += "<li>Middle Mouse</li>";
    html += "<li>Key z: Zoom in</li>";
    html += "<li>Key x: Zoom out</li>";
    html += "</ul>";
    html += "</li>";
    html += "<li><span>Translate</span>";
    html += "<ul>";
    html += "<li>Right Mouse</li>";
    html += "</ul>";
    html += "</li>";
    html += "</ul>";
    html += "</li>";

    html += liStr + me.baseUrl + "icn3d/icn3d.html#HowToUseStep5' target='_blank'>Selection Hints</a></li>";

    html += "<li><br/></li>";
    html += "</ul>";

    return html;
};

iCn3DUI.prototype.setLogWindow = function() { var me = this; //"use strict";
    var html = "";

    html += me.divStr + "cmdlog' style='float:left; margin-top: -5px; width: 100%;'>";

    html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.GREYD + ";'></textarea>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setAdvanced = function(index) { var me = this; //"use strict";
    var indexStr = (index === undefined) ? '' : index;

    var html = me.divStr + "dl_advanced" + indexStr + "'>";

    html += "<table width='500'><tr><td valign='top'><table cellspacing='0'>";
    html += "<tr><td><b>Select:</b></td><td>" + me.inputTextStr + "id='" + me.pre + "command" + indexStr + "' placeholder='$[structures].[chains]:[residues]@[atoms]' size='60'></td></tr>";
    html += "<tr><td><b>Name:</b></td><td>" + me.inputTextStr + "id='" + me.pre + "command_name" + indexStr + "' placeholder='my_selection' size='60'></td></tr>";
    html += "<tr><td colspan='2' align='left'>&nbsp;&nbsp;&nbsp;" + me.buttonStr + "command_apply" + indexStr + "'><b>Save Selection to Defined Sets</b></button></td></tr>";
    html += "</table></td>";

    html += "</tr>";

    html += "<tr><td>";

    html += 'Specification Tips: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'specguide' + indexStr + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'specguide' + indexStr + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';

    html += me.divStr + "specguide" + indexStr + "' style='display:none; width:500px' class='icn3d-box'>";

    html += "<b>Specification:</b> In the selection \"$1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C\":";
    html += "<ul><li>\"$1HHO,4N7N\" uses \"$\" to indicate structure selection.<br/>";
    html += "<li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
    html += "<li>\":5-10,KRDE,chemicals\" uses the colon \":\" to indicate residue selection. Residue selection could be residue number (5-10), one-letter IUPAC abbreviations (KRDE), or predefined names: \"proteins\", \"nucleotides\", \"chemicals\", \"ions\", and \"water\". IUPAC abbreviations can be written either as a contiguous string (e.g., \":KRDE\"), in order to find all instances of that sequence in the structure, or they can be separated by commas (e.g., \":K,R,D,E\") to select all residues of a given type in the structure (in the latter case, select all Lysine, Arginine, Aspartic Acid, and Glutamic Acid in the structure).<br/>";
    html += "<li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
    html += "<li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/>";
    html += "<li>Different selections can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, \":1-10 or :K\" selects all residues 1-10 and all Lys residues. \":1-10 and :K\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :K\" selects all residues 1-10, which are not Lys residues.<br/>";
    html += "<li>The wild card character \"X\" or \"x\" can be used to represent any character.";
    html += "</ul>";
    html += "<b>Set Operation:</b>";
    html += "<ul><li>Users can select multiple sets in the menu \"Select > Defined Sets\".<br/>";
    html += "<li>Different sets can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, if the \"Defined Sets\" menu has four sets \":1-10\", \":11-20\", \":5-15\", and \":7-8\", the command \"saved atoms :1-10 or :11-20 and :5-15 not :7-8\" unions all residues 1-10 and 11-20 to get the residues 1-20, then intersects with the residues 5-15 to get the residues 5-15, then exclude the residues 7-8 to get the final residues 5-6 and 9-15.</ul>";
    html += "<b>Full commands in url or command window:</b>";
    html += "<ul><li>Select without saving the set: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C<br/>";
    //html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C | name my_name | description my_description</ul>";
    html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,KRDE,chemicals@CA,C | name my_name</ul>";

    html += "</div>";

    html += "</td></tr></table>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.setDialogs = function() { var me = this; //"use strict";
    var html = "";

    var optionStr = "<option value=";

    html += "<!-- dialog will not be part of the form -->";

    html += me.divStr + "alldialogs' class='icn3d-hidden icn3d-dialog'>";

    // filter for large structure
    //html += me.divStr + "dl_filter' style='overflow:auto; position:relative;'>";
    //html += "<div style='text-align:center; margin-bottom:10px;'>" + me.buttonStr + "filter'><span style='white-space:nowrap'><b>Show Structure</b></span></button>";
    //html += me.buttonStr + "highlight_3d_dgm' style='margin-left:10px;'><span style='white-space:nowrap'><b>Highlight</b></span></button></div>";
    //html += "<div id='" + me.pre + "dl_filter_table' class='icn3d-box'>";
    //html += "</div>";
    //html += "</div>";

    html += me.divStr + "dl_2ddgm' class='icn3d-dl_2ddgm'>";
    html += "</div>";

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign) {
      html += me.divStr + "dl_alignment' style='background-color:white;'>";
      html += me.divStr + "alignseqguide_wrapper'><br>" + me.setAlignSequenceGuide() + "</div>";
      html += me.divStr + "dl_sequence2' class='icn3d-dl_sequence'>";
      html += "</div>";
      html += "</div>";
    }

    html += me.divStr + "dl_definedsets'>";
    html += me.divStr + "dl_setsmenu'>";
    html += "<b>Defined Sets:</b> <br/>";
    html += "<select id='" + me.pre + "atomsCustom' multiple size='6' style='min-width:130px;'>";
    html += "</select>";
    html += "<div style='margin: 6px 0 6px 0;'>" + me.buttonStr + "deletesets'><b>Delete Selected Sets</b></button></div>";
    html += '        <b>Set Operations</b>: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'dl_command_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'dl_command_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
    html += "</div>";

    html += me.divStr + "dl_command' style='display:none;'>";
    html += me.divStr + "dl_setoperations'>";
    html += "<label for='" + me.pre + "setOr'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setOr' checked> Union (or) </label><br/>";
    html += "<label for='" + me.pre + "setAnd'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setAnd'> Intersection (and) </label><br/>";
    html += "<label for='" + me.pre + "setNot'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setNot'> Exclusion (not) </label>";
    html += "</div><br>";

    html += me.setAdvanced();

    html += "</div>";
    html += "</div>";

    html += me.setAdvanced(2);

    html += me.divStr + "dl_mmtfid'>";
    html += "MMTF ID: " + me.inputTextStr + "id='" + me.pre + "mmtfid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmtf'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pdbid'>";
    html += "PDB ID: " + me.inputTextStr + "id='" + me.pre + "pdbid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_pdb'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_opmid'>";
    html += "<a href='https://opm.phar.umich.edu' target='_blank'>Orientations of Proteins in Membranes(OPM)</a> PDB ID: " + me.inputTextStr + "id='" + me.pre + "opmid' value='6JXR' size=8> ";
    html += me.buttonStr + "reload_opm'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pdbfile'>";
    html += "Note: Several PDB files could be concatenated into a single PDB file. Use the line \"ENDMDL\" to separate PDB files.<br><br>";
    html += "PDB File: " + me.inputFileStr + " id='" + me.pre + "pdbfile' size=8> ";
    html += me.buttonStr + "reload_pdbfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_rescolorfile'>";
    html += '<div style="width:450px;">The custom JSON file on residue colors has the following format for proteins ("ALA" and "ARG") and nucleotides ("G" and "A"):<br>';
    html += '{"ALA":"#C8C8C8", "ARG":"#145AFF", ..., "G":"#008000", "A":"#6080FF", ...}</div><br>';
    html += "Residue Color File: " + me.inputFileStr + "id='" + me.pre + "rescolorfile' size=8> ";
    html += me.buttonStr + "reload_rescolorfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_customcolor'>";
    html += " <input type='hidden' id='" + me.pre + "customcolor_chainid' value=''>";
    html += '<div style="width:450px;">The custom file for the structure has two columns separated by space or tab: ';
    html += 'residue number, and score in the range of 0-100. If you click "Custom Color" button, ';
    html += 'scores 0 and 100 mean blue and red, respectively. If you click "Custom Tube", ';
    html += 'the selected residues will be displayed in a style similar to "B-factor Tube".</div><br>';
    html += "Custom File: " + me.inputFileStr + "id='" + me.pre + "cstcolorfile' size=8> ";
    html += me.buttonStr + "reload_customcolorfile' style='margin-left:15px'>Custom Color</button>";
    html += me.buttonStr + "reload_customtubefile' style='margin-left:15px'>Custom Tube</button>";

    html += "</div>";

    html += me.divStr + "dl_align'>";
    html += "Enter the PDB IDs or MMDB IDs of two structures that have been found to be similar by <A HREF=' " + me.baseUrl + "vastplus/vastplus.cgi'>VAST+</A> : <br/><br/>ID1: " + me.inputTextStr + "id='" + me.pre + "alignid1' value='1HHO' size=8>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ID2: " + me.inputTextStr + "id='" + me.pre + "alignid2' value='4N7N' size=8><br/><br/>";
    html += me.buttonStr + "reload_align_ori'>All Matching Molecules Superposed</button>&nbsp;&nbsp;&nbsp;" + me.buttonStr + "reload_align_refined'>Invariant Substructure Superposed</button>";
    html += "</div>";

    html += me.divStr + "dl_chainalign'>";
    html += "Enter the PDB chain IDs in the form of pdbid_chain (e.g., 1HHO_A, case sensitive): <br/><br/>ID1: " + me.inputTextStr + "id='" + me.pre + "chainalignid1' value='1HHO_A' size=8>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ID2: " + me.inputTextStr + "id='" + me.pre + "chainalignid2' value='4N7N_A' size=8><br/><br/>";
    html += me.buttonStr + "reload_chainalign'>Align</button><br/><br/>";
    html += "<div style='width:450px'>(Note: To align chains in custom PDB files, you could concatenate PDB files in a single PDB file with the separation line \"ENDMDL\". Then load it in \"Open File > PDB File\" in the \"File\" menu and click \"View Sequences & Annotations\" in the \"Window\" menu. Finally select two chains in the sequence window and click \"Realign Selection\" in the \"File\" menu.)</div>";
    html += "</div>";

    html += me.divStr + "dl_mol2file'>";
    html += "Mol2 File: " + me.inputFileStr + "id='" + me.pre + "mol2file' size=8> ";
    html += me.buttonStr + "reload_mol2file'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_sdffile'>";
    html += "SDF File: " + me.inputFileStr + "id='" + me.pre + "sdffile' size=8> ";
    html += me.buttonStr + "reload_sdffile'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_xyzfile'>";
    html += "XYZ File: " + me.inputFileStr + "id='" + me.pre + "xyzfile' size=8> ";
    html += me.buttonStr + "reload_xyzfile'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_urlfile'>";
    html += "File type: ";
    html += "<select id='" + me.pre + "filetype'>";
    html += optionStr + "'pdb' selected>pdb</option>";
    html += optionStr + "'mol2'>mol2</option>";
    html += optionStr + "'sdf'>sdf</option>";
    html += optionStr + "'xyz'>xyz</option>";
    html += "</select><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "urlfile' size=20><br/> ";
    html += me.buttonStr + "reload_urlfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmciffile'>";
    html += "mmCIF File: " + me.inputFileStr + "id='" + me.pre + "mmciffile' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmciffile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmcifid'>";
    html += "mmCIF ID: " + me.inputTextStr + "id='" + me.pre + "mmcifid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmcif'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmdbid'>";
    html += "MMDB or PDB ID: " + me.inputTextStr + "id='" + me.pre + "mmdbid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmdb'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_blast_rep_id' style='max-width:500px;'>";
    html += "Enter a Sequence ID (or FASTA sequence) and the aligned Structure ID, which can be found using the <a href='https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&DATABASE=pdb' target='_blank'>BLAST</a> search against the pdb database with the Sequence ID or FASTA sequence as input.<br><br> ";
    html += "<b>Sequence ID</b> (NCBI protein accession of a sequence): " + me.inputTextStr + "id='" + me.pre + "query_id' value='NP_001108451.1' size=8><br> ";
    html += "or FASTA sequence: <br><textarea id='" + me.pre + "query_fasta' rows='5' style='width: 100%; height: " + (me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "<b>Structure ID</b> (NCBI protein accession of a chain of a 3D structure): " + me.inputTextStr + "id='" + me.pre + "blast_rep_id' value='1TSR_A' size=8><br> ";
    html += me.buttonStr + "reload_blast_rep_id'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_yournote'>";
    html += "Your note will be saved in the HTML file when you click \"File > Save Files > iCn3D PNG Image\".<br><br>";
    html += "<textarea id='" + me.pre + "yournote' rows='5' style='width: 100%; height: " + (me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;' placeholder='Enter your note here'></textarea><br>";
    html += me.buttonStr + "applyyournote'>Save</button>";
    html += "</div>";

    html += me.divStr + "dl_gi'>";
    html += "Protein gi: " + me.inputTextStr + "id='" + me.pre + "gi' value='1310960' size=8> ";
    html += me.buttonStr + "reload_gi'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_cid'>";
    html += "PubChem CID: " + me.inputTextStr + "id='" + me.pre + "cid' value='2244' size=8> ";
    html += me.buttonStr + "reload_cid'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pngimage'>";
    html += "iCn3D PNG image: " + me.inputFileStr + "id='" + me.pre + "pngimage'><br/>";
    html += me.buttonStr + "reload_pngimage' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_state'>";
    html += "State file: " + me.inputFileStr + "id='" + me.pre + "state'><br/>";
    html += me.buttonStr + "reload_state' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_fixedversion' style='max-width:500px'>";
    html += "To show the original view with the archived version of iCn3D, you can choose one of the options:<br><br>";
    html += "1. If your Share Link URL was generated after June 30, 2020, you can paste your URL below and click \"Show Originial View\".<br><br>";
    html += "Share Link URL: " + me.inputTextStr + "id='" + me.pre + "sharelinkurl' size=60><br>";
    html += me.buttonStr + "reload_fixedversion'>Show Original View</button><br><br>";
    html += "2. If your URL was generated before June 30, 2020, you can find the archived version of iCn3D <a href='https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#log' target='_blank'>online</a>, e.g., \"2.1.0\". Then paste your Share Link URL into the browser to see the expanded full-length URL. Finally replace \"full.html\" with \"full_2.1.0.html\" in the URL.<br><br>";
    html += "</div>";


    html += me.divStr + "dl_selection'>";
    html += "Selection file: " + me.inputFileStr + "id='" + me.pre + "selectionfile'><br/>";
    html += me.buttonStr + "reload_selectionfile' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_dsn6'>";
    html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigma2fofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5' selected>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span><br/>";
    html += me.inputFileStr + "id='" + me.pre + "dsn6file2fofc'> " + me.buttonStr + "reload_dsn6file2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmafofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5'>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3' selected>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span><br/>";
    html += me.inputFileStr + "id='" + me.pre + "dsn6filefofc'> " + me.buttonStr + "reload_dsn6filefofc' style='margin-top: 6px;'>Load</button><br><br><br>";

    html += me.buttonStr + "elecmapNo4'>Remove Map</button><br>";

    html += "</div>";

    html += me.divStr + "dl_dsn6url'>";
    html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigmaurl2fofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5' selected>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "dsn6fileurl2fofc' size=20>&nbsp;&nbsp;&nbsp;" + me.buttonStr + "reload_dsn6fileurl2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmaurlfofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5'>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3' selected>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "dsn6fileurlfofc' size=20>&nbsp;&nbsp;&nbsp;" + me.buttonStr + "reload_dsn6fileurlfofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += me.buttonStr + "elecmapNo5'>Remove Map</button><br>";

    html += "</div>";

    html += me.divStr + "dl_clr'>";
    html += "Click in the input box to use the color picker:<br><br> ";
    html += "Custom Color: " + me.inputTextStr + "id='" + me.pre + "colorcustom' value='FF0000' size=8> ";
    html += me.buttonStr + "applycustomcolor'>Apply</button>";
    html += "</div>";

    html += me.divStr + "dl_symmetry'><br>";
    html += me.divNowrapStr + "Symmetry: <select id='" + me.pre + "selectSymmetry'>";
    html += "</select>&nbsp;&nbsp;&nbsp;";
    html += me.buttonStr + "applysymmetry'>Apply</button>&nbsp;&nbsp;&nbsp;";
    html += me.buttonStr + "clearsymmetry'>Clear</button></div>";
    html += "</div>";

    html += me.divStr + "dl_hbonds'>";
    html += "1. Choose interaction types and their thresholds:<br>";
    html += "<div class='icn3d-box'><table border=0 width=450><tr>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_hbond' checked>Hydrogen Bonds <span style='background-color:#" + me.hbondColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "hbondthreshold'>";
    html += optionStr + "'3.2'>3.2</option>";
    html += optionStr + "'3.3'>3.3</option>";
    html += optionStr + "'3.4'>3.4</option>";
    //html += optionStr + "'3.5' selected>3.5</option>";
    html += optionStr + "'3.5'>3.5</option>";
    html += optionStr + "'3.6'>3.6</option>";
    html += optionStr + "'3.7'>3.7</option>";
    //html += optionStr + "'3.8'>3.8</option>";
    html += optionStr + "'3.8' selected>3.8</option>";
    html += optionStr + "'3.9'>3.9</option>";
    html += optionStr + "'4.0'>4.0</option>";
    html += optionStr + "'4.1'>4.1</option>";
    html += optionStr + "'4.2'>4.2</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_saltbridge' checked>Salt Bridge/Ionic <span style='background-color:#" + me.ionicColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "saltbridgethreshold'>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6' selected>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_contact' checked>Contacts/Interactions <span style='background-color:#" + me.contactColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "contactthreshold'>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4' selected>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_halogen' checked>Halogen Bonds <span style='background-color:#" + me.halogenColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "halogenthreshold'>";
    html += optionStr + "'3.2'>3.2</option>";
    html += optionStr + "'3.3'>3.3</option>";
    html += optionStr + "'3.4'>3.4</option>";
    //html += optionStr + "'3.5' selected>3.5</option>";
    html += optionStr + "'3.5'>3.5</option>";
    html += optionStr + "'3.6'>3.6</option>";
    html += optionStr + "'3.7'>3.7</option>";
    //html += optionStr + "'3.8'>3.8</option>";
    html += optionStr + "'3.8' selected>3.8</option>";
    html += optionStr + "'3.9'>3.9</option>";
    html += optionStr + "'4.0'>4.0</option>";
    html += optionStr + "'4.1'>4.1</option>";
    html += optionStr + "'4.2'>4.2</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_pication' checked>&pi;-Cation <span style='background-color:#" + me.picationColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "picationthreshold'>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6' selected>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_pistacking' checked>&pi;-Stacking <span style='background-color:#" + me.pistackingColor + "'>&nbsp;&nbsp;&nbsp;</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "pistackingthreshold'>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'5.5' selected>5.5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += "</select> &#197;&nbsp;&nbsp;&nbsp;</div></td>";
    html += "</tr></table></div>";

    html += "<table border=0 width=400 cellspacing=10><tr><td>";

    html += me.divNowrapStr + "2. Select the first set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond2' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td><td>";

    html += me.divNowrapStr + "3. Select the second set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td></tr></table>";

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
        html += "<div>4. <b>Cross Structure Interactions</b>: <select id='" + me.pre + "crossstrucinter'>";
        html += optionStr + "'1'>Yes</option>";
        html += optionStr + "'0' selected>No</option>";
        html += "</select></div><br>";
        html += "<div style='text-indent:1.1em'>" + me.buttonStr + "applyhbonds'>3D Display Interactions</button></div><br>";
    }
    else {
        html += "<div>4. " + me.buttonStr + "applyhbonds'>3D Display Interactions</button></div><br>";
    }

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondWindow'>Highlight Interactions in Table</button><span style='margin-left:30px; font-wieght:bold'>Sort Interactions on</span>: " + me.buttonStr + "sortSet1'> Set 1</button>" + me.buttonStr + "sortSet2' style='margin-left:20px'>Set 2</button></div><br>";

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondLineGraph'>2D Interaction Graph</button> to show interactions in two lines of residue nodes</div><br>";

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondGraph'>2D Graph (Force-Directed)</button> to show interactions with strength parameters in 0-200:</div>";
    html += '<div style="text-indent:1.1em"><table><tr><td>Helix or Sheet: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_ss" size="4" value="100"></td>';
    html += '<td>Coil or Nucleotide: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_coil" size="4" value="50"></td>';
    html += '<td>Disulfide Bonds: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_ssbond" size="4" value="50"></td></tr>';
    html += '<tr><td>Hydrogen Bonds: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_hbond" size="4" value="50"></td>';
    html += '<td>Salt Bridge/Ionic: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_ionic" size="4" value="50"></td>';
    html += '<td>Contacts: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_inter" size="4" value="25"></td></tr>';
    html += '<tr><td>Halogen Bonds: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_halogen" size="4" value="50"></td>';
    html += '<td>&pi;-Cation: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_pication" size="4" value="50"></td>';
    html += '<td>&pi;-Stacking: </td><td><input style="margin-left:-12px" type="text" id="' + me.pre + 'dist_pistacking" size="4" value="50"></td></tr></table></div>';
    html += '<div style="text-indent:1.1em">(Note: you can also adjust thresholds at #1 to add/remove interactions.)</div><br>';

//    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondExport'>Save</button> H-bond/contact pairs in a file</div><br>";
    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "areaWindow'>Buried Surface Area</button></div><br>";

    html += "<div>5. " + me.buttonStr + "hbondReset'>Reset</button> and select new sets</div>";
    html += "</div>";

    html += me.divStr + "dl_realign'>";

    html += me.divNowrapStr + "1. Select sets from two structures below <br>or use your current selection:</div><br>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomRealign' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "<div>2. " + me.buttonStr + "applyRealign'>Realign</button></div><br>";
    html += "</div>";

    html += me.divStr + "dl_allinteraction' style='background-color:white'>";
    html += "</div>";

    html += me.divStr + "dl_interactionsorted' style='background-color:white'>";
    html += "</div>";

    html += me.divStr + "dl_linegraph' style='background-color:white'>";

    html += me.divNowrapStr + "Hold Ctrl key to select multiple nodes/lines.&nbsp;&nbsp;&nbsp;";

    html += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
      + me.pre + 'dl_linegraphcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
      + me.pre + 'dl_linegraphcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
    html += me.divStr + "dl_linegraphcolor' style='display:none;'>";
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
    html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
    html += '<span style="font-weight:bold">Grey</span>: contacts</div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
    html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
    html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';
    html += "</div>";

    me.linegraphid = me.pre + 'linegraph';
    html += me.divNowrapStr + '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDDDDD;" id="' + me.linegraphid + '_svg">SVG</button>&nbsp;&nbsp;';
    html += '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDDDDD;" id="' + me.linegraphid + '_png">PNG</button>&nbsp;&nbsp;&nbsp;&nbsp;';
    html += "<b>Scale</b>: <select id='" + me.linegraphid + "_scale'>";
    html += optionStr + "'0.1'>0.1</option>";
    html += optionStr + "'0.2'>0.2</option>";
    html += optionStr + "'0.4'>0.4</option>";
    html += optionStr + "'0.6'>0.6</option>";
    html += optionStr + "'0.8'>0.8</option>";
    html += optionStr + "'1' selected>1</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select></div><br>";
    html += '<div id="' + me.pre + 'linegraphDiv"></div>';

    html += "</div>";

    html += me.divStr + "dl_elecmap2fofc'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigma2fofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5' selected>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3'>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applymap2fofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "elecmapNo2'>Remove Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_elecmapfofc'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigmafofc'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'0.5'>0.5</option>";
    html += optionStr + "'1'>1</option>";
    html += optionStr + "'1.5'>1.5</option>";
    html += optionStr + "'2'>2</option>";
    html += optionStr + "'3' selected>3</option>";
    html += optionStr + "'4'>4</option>";
    html += optionStr + "'5'>5</option>";
    html += optionStr + "'6'>6</option>";
    html += optionStr + "'7'>7</option>";
    html += optionStr + "'8'>8</option>";
    html += optionStr + "'9'>9</option>";
    html += optionStr + "'10'>10</option>";
    html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applymapfofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "elecmapNo3'>Remove Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_emmap'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "empercentage'>";
    html += optionStr + "'0'>0</option>";
    html += optionStr + "'10'>10</option>";
    html += optionStr + "'20'>20</option>";
    html += optionStr + "'30' selected>30</option>";
    html += optionStr + "'40'>40</option>";
    html += optionStr + "'50'>50</option>";
    html += optionStr + "'60'>60</option>";
    html += optionStr + "'70'>70</option>";
    html += optionStr + "'80'>80</option>";
    html += optionStr + "'90'>90</option>";
    html += optionStr + "'100'>100</option>";
    html += "</select> % of maximum EM values</span><br><span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applyemmap'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "emmapNo2'>Remove EM Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_aroundsphere'>";
    html += me.divNowrapStr + "1. Select the first set:</div>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere2' multiple size='3' style='min-width:130px;'>";
    html += "</select></div><br>";
    html += me.divNowrapStr + "2. Sphere with a radius: " + me.inputTextStr + "id='" + me.pre + "radius_aroundsphere' value='4' size='2'> &#197;</div><br/>";

    html += me.divNowrapStr + "3. Select the second set to apply the sphere:</div>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere' multiple size='3' style='min-width:130px;'>";
    html += "</select></div><br>";

    html += me.divNowrapStr + "4. " + me.buttonStr + "applypick_aroundsphere'>Display</button> the sphere around the first set of atoms</div><br>";
    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "sphereExport'>Save</button> interacting/contacting residue pairs in a file</div>";
    html += "</div>";

    html += me.divStr + "dl_adjustmem'>";
    html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
    html += me.divNowrapStr + "1. Extracellular membrane Z-axis position: " + me.inputTextStr + "id='" + me.pre + "extra_mem_z' value='' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "2. intracellular membrane Z-axis position: " + me.inputTextStr + "id='" + me.pre + "intra_mem_z' value='' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "3. " + me.buttonStr + "apply_adjustmem'>Display</button> the adjusted membranes</div><br>";
    html += "</div>";

/*
    html += me.divStr + "dl_addplane'>";
    html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
    html += me.divNowrapStr + "1. Z-axis position of the added plane: " + me.inputTextStr + "id='" + me.pre + "addplane_z' value='0' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "2. " + me.buttonStr + "apply_addplane'>Display</button> the added plane</div><br>";
    html += "<div style='white-space:nowrap; text-indent:1.1em'>" + me.buttonStr + "apply_removeplane'>Remove</button> the added plane</div><br>";
    html += "</div>";
*/

    html += me.divStr + "dl_selectplane'>";
    html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
    html += me.divNowrapStr + "1. Z-axis position of the first X-Y plane: " + me.inputTextStr + "id='" + me.pre + "selectplane_z1' value='15' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "2. Z-axis position of the second X-Y plane: " + me.inputTextStr + "id='" + me.pre + "selectplane_z2' value='-15' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "3. " + me.buttonStr + "apply_selectplane'>Save</button> the region between the planes to Defined Sets</div><br>";
    html += "</div>";

    html += me.divStr + "dl_addlabel'>";
    html += "1. Text: " + me.inputTextStr + "id='" + me.pre + "labeltext' value='Text' size=4><br/>";
    html += "2. Size: " + me.inputTextStr + "id='" + me.pre + "labelsize' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: " + me.inputTextStr + "id='" + me.pre + "labelcolor' value='ffff00' size=4><br/>";
    html += "4. Background: " + me.inputTextStr + "id='" + me.pre + "labelbkgd' value='cccccc' size=4><br/>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "5. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "5. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "6. " + me.buttonStr + "applypick_labels'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_addlabelselection'>";
    html += "1. Text: " + me.inputTextStr + "id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
    html += "2. Size: " + me.inputTextStr + "id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: " + me.inputTextStr + "id='" + me.pre + "labelcolor2' value='ffff00' size=4><br/>";
    html += "4. Background: " + me.inputTextStr + "id='" + me.pre + "labelbkgd2' value='cccccc' size=4><br/>";
    html += me.spanNowrapStr + "5. " + me.buttonStr + "applyselection_labels'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_distance'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. Color: " + me.inputTextStr + "id='" + me.pre + "distancecolor' value='ffff00' size=4><br/>";
    html += me.spanNowrapStr + "3. " + me.buttonStr + "applypick_measuredistance'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_stabilizer'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. Color: " + me.inputTextStr + "id='" + me.pre + "stabilizercolor' value='ffffff' size=4><br/>";
    html += me.spanNowrapStr + "3. " + me.buttonStr + "applypick_stabilizer'>Add</button></span>";
    html += "</div>";

    html += me.divStr + "dl_stabilizer_rm'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. " + me.buttonStr + "applypick_stabilizer_rm'>Remove</button></span>";
    html += "</div>";

    html += me.divStr + "dl_thickness'>";
    html += me.setThicknessHtml('3dprint');
    html += "</div>";

    html += me.divStr + "dl_thickness2'>";
    html += me.setThicknessHtml('style');
    html += "</div>";

    html += me.divStr + "dl_addtrack'>";
    html += " <input type='hidden' id='" + me.pre + "track_chainid' value=''>";

    html += me.divStr + "dl_addtrack_tabs' style='border:0px;'>";
    html += "<ul>";
    html += "<li><a href='#" + me.pre + "tracktab1'>NCBI gi/Accession</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab2'>FASTA</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab2b'>FASTA Alignment</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab3'>BED File</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab4'>Custom</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab5'>Current Selection</a></li>";
    html += "</ul>";
    html += me.divStr + "tracktab1'>";
    html += "NCBI gi/Accession: " + me.inputTextStr + "id='" + me.pre + "track_gi' placeholder='gi' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button1'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab2'>";
    html += "FASTA Title: " + me.inputTextStr + "id='" + me.pre + "fasta_title' placeholder='track title' size=16> <br><br>";
    html += "FASTA sequence: <br><textarea id='" + me.pre + "track_fasta' rows='5' style='width: 100%; height: " + (2*me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += me.buttonStr + "addtrack_button2'>Add Track</button>";
    html += "</div>";

    html += me.divStr + "tracktab2b'>";
    html += "<div style='width:600px'>The full protein sequences with gaps are listed one by one. The sequence of the structure is listed at the top. If there are non-gap residues (e.g., from RefSeq) outside of the sequence of the structure, please remove them. Each sequence has a title line starting with \">\".</div><br>";
    html += "<b>FASTA alignment sequences</b>:<br>";
    html += "<textarea id='" + me.pre + "track_fastaalign' rows='5' style='width: 100%; height: " + (2*me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "Position of the first residue in Sequences & Annotations window: " + me.inputTextStr + "id='" + me.pre + "fasta_startpos' value='1' size=2> <br><br>";

    html += "Color Sequence by: <select id='" + me.pre + "colorseqby'>";
    html += optionStr + "'identity' selected>Identity</option>";
    html += optionStr + "'conservation'>Conservation</option>";
    html += "</select> <br><br>";

    html += me.buttonStr + "addtrack_button2b'>Add Track(s)</button>";
    html += "</div>";

    html += me.divStr + "tracktab3'>";
    html += "BED file: " + me.inputFileStr + "id='" + me.pre + "track_bed' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button3'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab4'>";
    html += "Track Title: " + me.inputTextStr + "id='" + me.pre + "track_title' placeholder='track title' size=16> <br><br>";
    html += "Track Text (e.g., \"152 G, 155-156 RR\" defines a character \"G\" at the position 152 and two continuous characters \"RR\" at positions from 155 to 156. The starting position is 1): <br>";
    html += "<textarea id='" + me.pre + "track_text' rows='5' style='width: 100%; height: " + (2*me.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += me.buttonStr + "addtrack_button4'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab5'>";
    html += "Track Title: " + me.inputTextStr + "id='" + me.pre + "track_selection' placeholder='track title' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button5'>Add Track</button>";
    html += "</div>";

    html += "</div>";

    html += "</div>";

    html += me.divStr + "dl_saveselection'>";
    var index = (me.icn3d) ? Object.keys(me.icn3d.defNames2Atoms).length : 1;
    var suffix = '';
    html += "Name: " + me.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> <br>";
    //html += "Description: " + me.inputTextStr + "id='" + me.pre + "seq_command_desc" + suffix + "' value='seq_desc_" + index + "' size='10'> <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button><br/><br/>";
    html += "</div>";


    html += me.divStr + "dl_copyurl' style='width:500px;'>";
    html += "Please copy one of the URLs below. They show the same result.<br>(To add a title to share link, click \"Windows > Your Note\" and click \"File > Share Link\" again.)<br><br>";
    html += "Original URL with commands: <br><textarea id='" + me.pre + "ori_url' rows='4' style='width:100%'></textarea><br><br>";
    html += "Short URL: (To replace this URL, send a pull request to update share.html at <a href='https://github.com/ncbi/icn3d' target='_blank'>iCn3D GitHub</a>)<br>" + me.inputTextStr + "id='" + me.pre + "short_url' value='' style='width:100%'><br><br>";
    html += "</div>";

    html += me.divStr + "dl_selectannotations' class='icn3d-annotation' style='background-color:white;'>";

    html += me.divStr + "dl_annotations_tabs'>";

    html += me.divStr + "dl_anno_view_tabs' style='border:0px; height:33px;'>";
    html += "<ul>";
    html += "<li><a href='#" + me.pre + "anno_tmp1' id='" + me.pre + "anno_summary'>Summary</a></li>";
    html += "<li><a href='#" + me.pre + "anno_tmp2' id='" + me.pre + "anno_details'>Details</a></li>";
    html += "</ul>";
    html += me.divStr + "anno_tmp1'>";
    html += "</div>";
    html += me.divStr + "anno_tmp2'>";
    html += "</div>";
    html += "</div>";

    html += "<div class='icn3d-box' style='width:520px;'><b>Annotations:&nbsp;</b><br><table border=0><tr>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_all'>All&nbsp;&nbsp;</td>";
    html += "<td style='min-width:130px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_cdd' checked>Conserved Domains&nbsp;&nbsp;</td>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_clinvar'>ClinVar&nbsp;&nbsp;</td>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_binding'>Functional Sites&nbsp;&nbsp;</td>";
    html += "</tr><tr>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_custom'>Custom&nbsp;&nbsp;</td>";
    html += "<td style='min-width:130px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_3dd'>3D Domains&nbsp;&nbsp;</td>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_snp'>SNPs&nbsp;&nbsp;</td>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_interact'>Interactions&nbsp;&nbsp;</td>";
    html += "<td></td>";
    html += "</tr><tr>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_ssbond'>Disulfide Bonds&nbsp;&nbsp;</td>";
    html += "<td style='min-width:110px;'>" + me.inputCheckStr + "id='" + me.pre + "anno_crosslink'>Cross-Linkages&nbsp;&nbsp;</td>";
    if(me.cfg.opmid !== undefined) {
        html += "<td style='min-width:110px;'><span id='" + me.pre + "anno_transmemli'>" + me.inputCheckStr + "id='" + me.pre + "anno_transmem'>Transmembrane&nbsp;&nbsp;</span></td>";
    }
    else {
        html += "<td style='min-width:110px;'><span id='" + me.pre + "anno_transmemli' style='display:none'>" + me.inputCheckStr + "id='" + me.pre + "anno_transmem'>Transmembrane&nbsp;&nbsp;</span></td>";
    }
    html += "<td></td>";
    html += "</tr></table></div>";

    html += "<button style='white-space:nowrap; margin-left:5px;' id='" + me.pre + "showallchains'>Show All Chains</button><br>";

    html += me.divStr + "seqguide_wrapper' style='display:none'><br>" + me.setSequenceGuide("2") + "</div>";

    html += "</div><br/><hr><br>";

    html += me.divStr + "dl_annotations'>";
    html += "</div>";

    html += "</div>";

    html += me.divStr + "dl_graph' style='background-color:white;'>";
    me.svgid = me.pre + 'icn3d_viz';
    html += '<style>';
    html += '#' + me.svgid + ' svg { border: 1px solid; font: 13px sans-serif; text-anchor: end; }';
    html += '#' + me.svgid + ' .node { stroke: #eee; stroke-width: 1.5px; }';
    html += '.node .selected { stroke: ' + me.ORANGE + '; }';
    html += '.link { stroke: #999; stroke-opacity: 0.6; }';

//    html += '.links line { stroke-opacity: 0.6; }';
//    html += '.nodes circle { stroke: #fff; stroke-width: 1.5px; }';
//    html += 'text { font-family: sans-serif; font-weight: bold; font-size: 18px;}';
    html += '</style>';

    html += me.divNowrapStr + '<b>Zoom</b>: mouse wheel; &nbsp;&nbsp;&nbsp; <b>Move</b>: left button; &nbsp;&nbsp;&nbsp; <b>Select Multiple Nodes</b>: Ctrl Key and drag an Area&nbsp;&nbsp;&nbsp;';
    html += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
      + me.pre + 'dl_svgcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
      + me.pre + 'dl_svgcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
    html += me.divStr + "dl_svgcolor' style='display:none;'>";
    html += me.divNowrapStr + '<span style="margin-left:33px">Click "View > H-Bonds & Interactions" to adjust parameters and relaunch the graph</span></div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
    html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
    html += '<span style="font-weight:bold">Grey</span>: contacts; ';
    html += '<span style="color:' + me.ORANGE + '; font-weight:bold">Orange</span>: disulfide bonds</div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
    html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
    html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';
    html += "</div>";

    html += me.divNowrapStr + '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDDDDD;" id="' + me.svgid + '_svg">SVG</button>&nbsp;&nbsp;';
    html += '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDDDDD;" id="' + me.svgid + '_png">PNG</button>';
    html += "&nbsp;&nbsp;&nbsp;<b>Force on Nodes</b>: <select id='" + me.svgid + "_force'>";
    html += optionStr + "'0'>No</option>";
    html += optionStr + "'1'>X-axis</option>";
    html += optionStr + "'2'>Y-axis</option>";
    html += optionStr + "'3'>Circle</option>";
    html += optionStr + "'4' selected>Random</option>";
    html += "</select>";
    html += "&nbsp;&nbsp;&nbsp;<b>Label Size</b>: <select id='" + me.svgid + "_label'>";
    html += optionStr + "'icn3d-node-text0'>No</option>";
    html += optionStr + "'icn3d-node-text4'>4px</option>";
    html += optionStr + "'icn3d-node-text8' selected>8px</option>";
    html += optionStr + "'icn3d-node-text12'>12px</option>";
    html += optionStr + "'icn3d-node-text16'>16px</option>";
    html += optionStr + "'icn3d-node-text24'>24px</option>";
    html += optionStr + "'icn3d-node-text32'>32px</option>";
    html += "</select>";
    html += "&nbsp;&nbsp;&nbsp;<b>Internal Edges</b>: <select id='" + me.svgid + "_hideedges'>";
    html += optionStr + "'1' selected>Hide</option>";
    html += optionStr + "'0'>Show</option>";
    html += "</select>";
    //html += "&nbsp;&nbsp;&nbsp;<b>Center</b>: <select id='" + me.svgid + "_pushcenter'>";
    //html += optionStr + "'1'>Yes</option>";
    //html += optionStr + "'0' selected>No</option>";
    //html += "</select>";
    html += "</div>";

    html += '<svg id="' + me.svgid + '" style="margin-top:6px;"></svg>';
    html += "</div>";

    html += me.divStr + "dl_area'>";
    html += "Solvent Accessible Surface Area (SASA) calculated using the <a href='https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0008140' target='_blank'>EDTSurf algorithm</a>: <br>";
    html += '(0-20% out is considered "in". 50-100% out is considered "out".)<br><br>';
    html += "<b>Toal</b>: " + me.inputTextStr + "id='" + me.pre + "areavalue' value='' size='10'> &#8491;<sup>2</sup><br><br>";
    html += "<div id='" + me.pre + "areatable' style='max-height:400px; overflow:auto'></div>";
    html += "</div>";

    html += me.divStr + "dl_colorbyarea'>";
    html += "<div style='width:500px'>Color each residue based on the percentage of solvent accessilbe surface area. The color ranges from blue, to white, to red for a percentage of 0, 35 (variable), and 100, respectively.</div><br>";
    html += "<b>Middle Percentage (White)</b>: " + me.inputTextStr + "id='" + me.pre + "midpercent' value='35' size='10'>% <br><br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applycolorbyarea'>Color</button><br/><br/>";
    html += "</div>";

    html += me.divStr + "dl_rmsd'>";
    html += "<br><b>Alignment RMSD</b>: " + me.inputTextStr + "id='" + me.pre + "realignrmsd' value='35' size='10'>&#8491;<br><br>";
    html += "</div>";

    html += me.divStr + "dl_buriedarea'>";
    html += "</div>";

    html += me.divStr + "dl_propbypercentout'>";
    html += "<div style='width:400px'>Select residue based on the percentage of solvent accessilbe surface area. The values are in the range of 0-100.</div><br>";
    html += "<b>Min Percentage</b>: " + me.inputTextStr + "id='" + me.pre + "minpercentout' value='0' size='10'>% <br>";
    html += "<b>Max Percentage</b>: " + me.inputTextStr + "id='" + me.pre + "maxpercentout' value='100' size='10'>% <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbypercentout'>Apply</button><br/><br/>";
    html += "</div>";

    html += me.divStr + "dl_propbybfactor'>";
    html += "<div style='width:400px'>Select residue based on B-factor. The values are in the range of 0-100.</div><br>";
    html += "<b>Min B-factor</b>: " + me.inputTextStr + "id='" + me.pre + "minbfactor' value='0' size='10'>% <br>";
    html += "<b>Max B-factor</b>: " + me.inputTextStr + "id='" + me.pre + "maxbfactor' value='100' size='10'>% <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbybfactor'>Apply</button><br/><br/>";
    html += "</div>";

    html += "</div>";
    html += "<!--/form-->";

    return html;
};

iCn3DUI.prototype.setThicknessHtml = function (type) { var me = this; //"use strict";
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

    html += "<b>Line Radius</b>: " + me.inputTextStr + "id='" + me.pre + "linerad_" + type + "' value='" + linerad + "' size=4>&nbsp;&nbsp;&nbsp;(for stabilizers, hydrogen bonds, distance lines, default 0.1)<br/>";
    html += "<b>Coil Radius</b>: " + me.inputTextStr + "id='" + me.pre + "coilrad_" + type + "' value='" + coilrad + "' size=4>&nbsp;&nbsp;&nbsp;(for coils, default 0.3)<br/>";
    html += "<b>Stick Radius</b>: " + me.inputTextStr + "id='" + me.pre + "stickrad_" + type + "' value='" + stickrad + "' size=4>&nbsp;&nbsp;&nbsp;(for sticks, default 0.4)<br/>";
    html += "<b>Trace Radius</b>: " + me.inputTextStr + "id='" + me.pre + "tracerad_" + type + "' value='" + tracerad + "' size=4>&nbsp;&nbsp;&nbsp;(for C alpha trace, O3' trace, default 0.2)<br/>";

    html += "<b>Ribbon Thickness</b>: " + me.inputTextStr + "id='" + me.pre + "ribbonthick_" + type + "' value='" + ribbonthick + "' size=4>&nbsp;&nbsp;&nbsp;(for helix and sheet ribbons, nucleotide ribbons, default 0.2)<br/>";
    html += "<b>Protein Ribbon Width</b>: " + me.inputTextStr + "id='" + me.pre + "prtribbonwidth_" + type + "' value='" + prtribbonwidth + "' size=4>&nbsp;&nbsp;&nbsp;(for helix and sheet ribbons, default 1.3)<br/>";
    html += "<b>Nucleotide Ribbon Width</b>: " + me.inputTextStr + "id='" + me.pre + "nucleotideribbonwidth_" + type + "' value='" + nucleotideribbonwidth + "' size=4>&nbsp;&nbsp;&nbsp;(for nucleotide ribbons, default 0.8)<br/>";

    html += "<b>Ball Scale</b>: " + me.inputTextStr + "id='" + me.pre + "ballscale_" + type + "' value='" + ballscale + "' size=4>&nbsp;&nbsp;&nbsp;(for styles 'Ball and Stick' and 'Dot', default 0.3)<br/>";

    html += me.spanNowrapStr + "" + me.buttonStr + "apply_thickness_" + type + "'>Preview</button></span>";

    return html;
};

iCn3DUI.prototype.setSequenceGuide = function (suffix, bShown) { var me = this; //"use strict";
  var sequencesHtml = '';

  var index = (me.icn3d) ? Object.keys(me.icn3d.defNames2Atoms).length : 1;

  if(bShown) {
     sequencesHtml += me.divStr + "seqguide" + suffix + "'>";
 }
 else {
     sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'seqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'seqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

     sequencesHtml += "<div style='min-width:200px; display:inline-block;'><b>Selection:</b> Name: " + me.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> &nbsp;&nbsp;<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button></div><br/>";

     sequencesHtml += me.divStr + "seqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";
 }

  if(!me.isMobile()) {
      sequencesHtml += "<b>Select on 1D sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/><br/>";

      sequencesHtml += "<b>Select on 2D interaction diagram:</b> click on the nodes or lines. The nodes are chains and can be united with the Ctrl key. The lines are interactions and can NOT be united. Each click on the lines selects half of the lines, i.e., select the interacting residues in one of the two chains.<br/><br/>";

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

iCn3DUI.prototype.setAlignSequenceGuide = function (suffix, bShown) { var me = this; //"use strict";
  var sequencesHtml = '', suffix = '';

  var index = (me.icn3d) ? Object.keys(me.icn3d.defNames2Atoms).length : 1;

  sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'alignseqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'alignseqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

  sequencesHtml += "<div style='min-width:200px; display:inline-block;''><b>Selection:</b> Name: " + me.inputTextStr + "id='" + me.pre + "alignseq_command_name' value='alseq_" + index + "' size='10'> &nbsp;&nbsp;<button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear</button></div><br/>";

  sequencesHtml += me.divStr + "alignseqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";

  if(!me.isMobile()) {
      sequencesHtml += "<b>Select on 1D sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/><br/>";

      sequencesHtml += "<b>Select on 2D interaction diagram:</b> click on the nodes or lines. The nodes are chains and can be united with the Ctrl key. The lines are interactions and can NOT be united. Each click on the lines selects half of the lines, i.e., select the interacting residues in one of the two chains.<br/><br/>";

      var tmpStr = me.isMobile() ? 'use finger to pick' : 'hold "Alt" and use mouse to pick';
      sequencesHtml += "<b>Select on 3D structures:</b> " + tmpStr + ", click the second time to deselect, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection.<br/><br/>";

      sequencesHtml += "<b>Save the current selection</b> (either on 3D structure, 2D interactions, or 1D sequence): open the menu \"Select -> Save Selection\", specify the name and description for the selection, and click \"Save\".<br/><br/>";
  }
  else {
        sequencesHtml += "<b>Select Aligned Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/>";
  }

  var resCategories = "<b>Residue labeling:</b> aligned residue with coordinates: UPPER case letter; non-aligned residue with coordinates: lower case letter which can be highlighted; residue missing coordinates: lower case letter which can NOT be highlighted.";
  var scroll = (me.isMac() && !me.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

  sequencesHtml += resCategories + scroll + "<br/></div>";

  return sequencesHtml;
};

iCn3DUI.prototype.getAlignSequencesAnnotations = function (alignChainArray, bUpdateHighlightAtoms, residueArray, bShowHighlight) { var me = this; //"use strict";
  var sequencesHtml = '';

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

      var startResi = (me.icn3d.alnChainsSeq[i][0] !== undefined) ? me.icn3d.alnChainsSeq[i][0].resi : '';
      seqHtml += "<span class='icn3d-residueNum' title='starting residue number'>" + startResi + "</span>";
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
      var endResi = (me.icn3d.alnChainsSeq[i][seqLength-1] !== undefined) ? me.icn3d.alnChainsSeq[i][seqLength-1].resi : '';
      seqHtml += "<span class='icn3d-residueNum' title='ending residue number'>" + endResi + "</span>";

      // the first chain stores all annotations
      var annoLength = (me.icn3d.alnChainsAnno[i] !== undefined) ? me.icn3d.alnChainsAnno[i].length : 0;

      for(var j=0, jl=annoLength; j < jl; ++j) {
        resiHtmlArray[j] = "";

        var chainid = (j == 0 && annoLength >= 7) ? me.icn3d.alnChainsAnTtl[i][4][0] : i; // bottom secondary, j == 0: chain2,  next secondary, j == 1: chain1,

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
