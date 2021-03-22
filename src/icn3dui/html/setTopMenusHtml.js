/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTopMenusHtml = function (id, str1, str2) { var me = this, ic = me.icn3d; "use strict";
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

        html += tdStr + "<div style='position:relative; margin-left:6px;'>" + str1;
        html += "<div class='icn3d-commandTitle' style='min-width:40px; margin-top: 3px; white-space: nowrap;'>" + str2;

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px; border-left:solid 1px #888888"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand">' + me.space2 + 'Show Toolbar' + me.space2 + '</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">' + me.space2 + 'Hide Toolbar' + me.space2 + '</span></div></td>';

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:8px; border-left:solid 1px #888888">' + me.space2 + '<input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."> <button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search Seq.</button> <a style="text-decoration: none;" href="' + me.baseUrl + 'icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div></td>';
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
        var tmpStr = (me.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
        html += me.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
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
    $("#" + me.pre + "accordion6").hover( function(){ $("#" + me.pre + "accordion6 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion6 div").css("display", "none"); } );
};

iCn3DUI.prototype.setTopMenusHtmlMobile = function (id, str1, str2) { var me = this, ic = me.icn3d; "use strict";
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
    if(me.cfg.notebook) {
        html += "<h3 style='width:20px; height:24px; position:relative'><span style='position:absolute; left:3px; top:4px;'>&#9776;</span></h3>";
    }
    else {
        html += "<h3 style='width:20px; height:20px; position:relative'><span style='position:absolute; left:7px; top:8px;'>&#9776;</span></h3>";
    }
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
    html += liStr + ">Analysis</span>";
    html += me.setMenu5_base();
    html += liStr + ">Help</span>";
    html += me.setMenu6_base();

    html += "<li><div style='position:relative; margin-top:-6px;'>" + str1;
    html += "<div class='icn3d-commandTitle' style='margin-top: 3px; white-space: nowrap;'>" + str2;

    if(me.cfg.align !== undefined) {
        html += "<li><span id='" + me.pre + "alternate2' class='icn3d-menu-color' title='Alternate the structures'>Alternate</span>";
    }

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
        var tmpStr = (me.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
        html += me.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
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

iCn3DUI.prototype.setReplayHtml = function (id) { var me = this, ic = me.icn3d; "use strict";
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
