/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from './html.js';

import {UtilsCls} from '../utils/utilsCls.js';

class SetMenu {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
        //this.sh = this.icn3dui.htmlCls.setHtmlCls;
    }

    //Set the HTML code for the menus shown at the top of the viewer.
    setTopMenusHtml(id, str1, str2) { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div style='position:relative;'>";

        html += me.htmlCls.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

        html += this.setReplayHtml();

        html += "<!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
        html += me.htmlCls.divStr + "mnlist' style='position:absolute; z-index:999; float:left; display:table-row; margin-top: -2px;'>";
        html += "<table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

        let tdStr = '<td valign="top">';
        html += tdStr + this.setMenu1() + '</td>';

        if(!me.cfg.simplemenu) {
            html += tdStr + this.setMenu2() + '</td>';
        }

        html += tdStr + this.setMenu2b() + '</td>';
        html += tdStr + this.setMenu3() + '</td>';
        html += tdStr + this.setMenu4() + '</td>';

        if(!me.cfg.simplemenu) {
            html += tdStr + this.setMenu5() + '</td>';
            //html += tdStr + this.setMenu5b() + '</td>';
            html += tdStr + this.setMenu6() + '</td>';

            html += tdStr + "<div style='position:relative; margin-left:6px;'>" + str1;
            html += "<div class='icn3d-commandTitle' style='min-width:40px; margin-top: 3px; white-space: nowrap;'>" + str2;

            html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px; border-left:solid 1px #888888"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" title="Expand">' + me.htmlCls.space2 + 'Toolbar <span class="ui-icon ui-icon-plus" style="width:15px"></span>' + me.htmlCls.space2 + '</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">' + me.htmlCls.space2 + 'Toolbar <span class="ui-icon ui-icon-minus" style="width:15px"></span>' + me.htmlCls.space2 + '</span></div></td>';

            html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:8px; border-left:solid 1px #888888">' + me.htmlCls.space2 + '<input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."> <button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search</button> <a style="text-decoration: none;" href="' + me.htmlCls.baseUrl + 'icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div></td>';
        }

        html += "</tr>";
        html += "</table>";
        html += "</div>";

        html += this.setTools();

        // show title at the top left corner
        html += me.htmlCls.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color:" + me.htmlCls.GREYD + "; width:" + me.htmlCls.WIDTH + "px'></div>";

        html += me.htmlCls.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.htmlCls.GREYD + ";'>";

        html += me.htmlCls.divStr + "legend' class='icn3d-text icn3d-legend'></div>";

        html += me.htmlCls.divStr + "mnLogSection'>";
        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";
    //        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";

        html += " </div>";

        if(me.cfg.mmtfid === undefined) {
            //var tmpStr =(ic.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
            let tmpStr = 'top:180px; font-size: 1.8em;';
            html += me.htmlCls.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
        }
        html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        // separate for the log box
        if(me.cfg.showcommand === undefined || me.cfg.showcommand) {
            html += this.setLogWindow();
        }

        html += "</div>";

        html += "</div>";

        html += me.htmlCls.setDialogCls.setDialogs();

        html += me.htmlCls.setDialogCls.setCustomDialogs();

        $( "#" + id).html(html);

        // mn display
        $("accordion").accordion({ collapsible: true, active: false, heightStyle: "content"});
        $("accordion div").removeClass("ui-accordion-content ui-corner-all ui-corner-bottom ui-widget-content");

        $(".icn3d-mn-item").menu({position: { my: "left top", at: "right top" }});
        $(".icn3d-mn-item").hover(function(){},function(){$("accordion").accordion( "option", "active", "none");});

        $("#" + me.pre + "accordion1").hover( function(){ $("#" + me.pre + "accordion1 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion1 div").css("display", "none"); } );
        $("#" + me.pre + "accordion2").hover( function(){ $("#" + me.pre + "accordion2 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion2 div").css("display", "none"); } );
        $("#" + me.pre + "accordion2b").hover( function(){ $("#" + me.pre + "accordion2b div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion2b div").css("display", "none"); } );
        $("#" + me.pre + "accordion3").hover( function(){ $("#" + me.pre + "accordion3 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion3 div").css("display", "none"); } );
        $("#" + me.pre + "accordion4").hover( function(){ $("#" + me.pre + "accordion4 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion4 div").css("display", "none"); } );
        $("#" + me.pre + "accordion5").hover( function(){ $("#" + me.pre + "accordion5 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion5 div").css("display", "none"); } );
        $("#" + me.pre + "accordion6").hover( function(){ $("#" + me.pre + "accordion6 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion6 div").css("display", "none"); } );
    }

    setTopMenusHtmlMobile(id, str1, str2) { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div style='position:relative;'>";

        html += me.htmlCls.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

        html += this.setReplayHtml();

        if(!me.utilsCls.isMobile()) {
            let marginLeft = me.htmlCls.WIDTH - 40 + 5;

            html += me.htmlCls.buttonStr + "fullscreen' style='position:absolute; z-index:1999; display:block; padding:0px; margin: 7px 0px 0px " + marginLeft + "px; width:30px; height:34px; border-radius:4px; border:none; background-color:#f6f6f6;' title='Full screen'>";
            html += "<svg fill='#1c94c4' viewBox='0 0 24 24' width='24' height='24'>";
            html += "<path d='M0 0h24v24H0z' fill='none'></path>";
            html += "<path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'></path>";
            html += "</svg>";
            html += "</button>";
        }

        html += "<!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
        html += me.htmlCls.divStr + "mnlist' style='position:absolute; z-index:999; float:left; display:block; margin: 5px 0px 0px 5px;'>";

        //html += "<div class='icn3d-menu'>";
        html += "<div>";
        html += "<accordion id='" + me.pre + "accordion0' class='icn3d-accordion'>";
        if(me.cfg.notebook) {
            html += "<h3 style='width:20px; height:24px; position:relative; padding: 0'><span style='position:absolute; left:3px; top:4px;'>&#9776;</span></h3>";
        }
        else {
            html += "<h3 style='width:30px; height:34px; position:relative; padding: 0; margin-top:7px!important; background-color:#f6f6f6;'><span style='position:absolute; left:7px; top:8px;'>&#9776;</span></h3>";
        }
        html += "<div>";

        let liStr = "<li><span class='icn3d-menu-color'";

        html += "<ul class='icn3d-mn-item'>";
        html += liStr + ">File</span>";
        html += this.setMenu1_base();
        html += liStr + ">Select</span>";
        html += this.setMenu2_base();
        html += liStr + ">View</span>";
        html += this.setMenu2b_base();
        html += liStr + " id='" + me.pre + "style'>Style</span>";
        html += this.setMenu3_base();
        html += liStr + " id='" + me.pre + "color'>Color</span>";
        html += this.setMenu4_base();
        html += liStr + ">Analysis</span>";
        html += this.setMenu5_base();
        html += liStr + ">Help</span>";
        html += this.setMenu6_base();

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

        //html += me.htmlCls.setMenuCls.setTools();

        // show title at the top left corner
        let titleColor =(me.htmlCls.opts['background'] == 'white' || me.htmlCls.opts['background'] == 'grey') ? 'black' : me.htmlCls.GREYD;

        html += me.htmlCls.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:block; margin: 12px 0px 0px 40px; color:" + titleColor + "; width:" +(me.htmlCls.WIDTH - 40).toString() + "px'></div>";
        html += me.htmlCls.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.htmlCls.GREYD + ";'>";
        html += me.htmlCls.divStr + "mnLogSection'>";
        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";
        html += "</div>";

        if(me.cfg.mmtfid === undefined) {
            //var tmpStr =(ic.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
            let tmpStr = 'top:180px; font-size: 1.8em;';
            html += me.htmlCls.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
        }
        html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #000;'>Your browser does not support WebGL.</canvas>";

        // separate for the log box
        if(me.cfg.showcommand === undefined || me.cfg.showcommand) {
            html += this.setLogWindow();
        }

        html += "</div>";

        html += "</div>";

        html += me.htmlCls.setDialogCls.setDialogs();

        html += me.htmlCls.setDialogCls.setCustomDialogs();

        $( "#" + id).html(html);

        // mn display
        $("accordion").accordion({ collapsible: true, active: false, heightStyle: "content"});
        $("accordion div").removeClass("ui-accordion-content ui-corner-all ui-corner-bottom ui-widget-content");

        $(".icn3d-mn-item").menu({position: { my: "left top", at: "right top" }});
        $(".icn3d-mn-item").hover(function(){},function(){$("accordion").accordion( "option", "active", "none");});

        $("#" + me.pre + "accordion0").hover( function(){ $("#" + me.pre + "accordion0 div").css("display", "block"); }, function(){ $("#" + me.pre + "accordion0 div").css("display", "none"); } );
    }

    setReplayHtml(id) { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = '';

        html += me.htmlCls.divStr + "replay' style='display:none; position:absolute; z-index:9999; top:" + parseInt(me.htmlCls.HEIGHT - 100).toString() + "px; left:20px;'>";
        html += "<div title='Click to replay one step'><svg style='cursor:pointer;' fill='#f8b84e' viewBox='0 0 60 60' width='40' height='40'>";
        html += '<circle style="fill:#f8b84e;" cx="29" cy="29" r="29"/>';
        html += '<g>';
        html += '<polygon style="fill:#FFFFFF;" points="44,29 22,44 22,29.273 22,14"/>';
        html += '<path style="fill:#FFFFFF;" d="M22,45c-0.16,0-0.321-0.038-0.467-0.116C21.205,44.711,21,44.371,21,44V14c0-0.371,0.205-0.711,0.533-0.884c0.328-0.174,0.724-0.15,1.031,0.058l22,15C44.836,28.36,45,28.669,45,29s-0.164,0.64-0.437,0.826l-22,15C22.394,44.941,22.197,45,22,45z M23,15.893v26.215L42.225,29L23,15.893z"/>';
        html += '</g>';
        html += "</svg></div>";
        html += me.htmlCls.divStr + "replay_menu' style='background-color:#DDDDDD; padding:3px; font-weight:bold;'></div>";
        html += me.htmlCls.divStr + "replay_cmd' style='background-color:#DDDDDD; padding:3px; max-width:250px'></div>";
        html += "</div>";

        return html;
    }

    //Set the HTML code for the tools section. It includes several buttons, and is the second line at the top of the viewer.
    setTools() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += me.htmlCls.divStr + "selection' style='display:none;'><div style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 3px;'>";
        html += "<table style='margin-top: 3px; width:100px;'><tr valign='center'>";

        html += this.setTools_base();

        // add custom buttons here
        // ...

        html += "</tr></table>";
        html += "</div></div>";

        return html;
    }

    setButton(buttonStyle, id, title, text, color) { let me = this.icn3dui;
        if(me.bNode) return '';

        color =(color !== undefined) ? 'color:' + color : '';
        let bkgdColor = me.utilsCls.isMobile() ? ' background-color:#DDDDDD;' : '';
        return "<div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;" + bkgdColor + "' id='" + me.pre + id + "'><span style='white-space:nowrap;" + color + "' class='icn3d-commandTitle' title='" + title + "'>" + text + "</span></button></div>";
    }

    setTools_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        // second row
        let html = "";

        let buttonStyle = me.utilsCls.isMobile() ? 'none' : 'button';
        let tdStr = "<td valign='top'>";

        //if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
            html += tdStr + this.setButton(buttonStyle, 'alternate', 'Alternate the structures', 'Alternate<br/>(Key \"a\")', me.htmlCls.ORANGE) + "</td>";
        //}

        html += tdStr + this.setButton(buttonStyle, 'saveimage', 'Save iCn3D PNG Image', 'Save iCn3D<br/>PNG Image') + "</td>";

        if(me.cfg.cid === undefined) {
            html += tdStr + this.setButton(buttonStyle, 'hbondsYes', 'View H-Bonds & Interactions', 'H-Bonds &<br/> Interactions') + "</td>";
        }

        html += tdStr + this.setButton(buttonStyle, 'show_selected', 'View ONLY the selected atoms', 'View<br/> Selection') + "</td>";

        html += tdStr + this.setButton(buttonStyle, 'toggleHighlight', 'Turn on and off the 3D highlight in the viewer', 'Toggle<br/>Highlight') + "</td>";

        if(me.cfg.cid === undefined) {
            html += tdStr + this.setButton(buttonStyle, 'removeLabels', 'Remove Labels', 'Remove<br/>Labels') + "</td>";
        }

        return html;
    }

    setTheme(color) { let me = this.icn3dui;
        if(me.bNode) return '';

        let borderColor, bkgdColor, bkgdImg, iconImg, activeTabColor;

        me.htmlCls.themecolor = color;

        if(color == 'orange') {
            borderColor = '#e78f08';
            bkgdColor = '#f6a828';
            bkgdImg = 'ui-bg_gloss-wave_35_f6a828_500x100.png';
            iconImg = 'ui-icons_ef8c08_256x240.png';
            activeTabColor = '#eb8f00';
        }
        else if(color == 'black') {
            borderColor = '#333333';
            bkgdColor = '#333333';
            bkgdImg = 'ui-bg_gloss-wave_25_333333_500x100.png';
            iconImg = 'ui-icons_222222_256x240.png';
            activeTabColor = '#222222';
        }
        else if(color == 'blue') {
            borderColor = '#4297d7';
            bkgdColor = '#5c9ccc';
            bkgdImg = 'ui-bg_gloss-wave_55_5c9ccc_500x100.png';
            iconImg = 'ui-icons_228ef1_256x240.png';
            activeTabColor = '#444';
        }

        $('.ui-widget-header').css({
            'border': '1px solid ' + borderColor,
            'background': bkgdColor + ' url("lib/images/' + bkgdImg + '") 50% 50% repeat-x',
            'color':'#fff',
            'font-weight':'bold'
        });

        $('.ui-button .ui-icon').css({
            'background-image': 'url(lib/images/' + iconImg + ')'
        });

        $('.ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited').css({
            'color': activeTabColor,
            'text-decoration': 'none'
        });
    }

    //Set the textarea for the log output.
    setLogWindow() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += me.htmlCls.divStr + "cmdlog' style='float:left; margin-top: -5px; width: 100%;'>";

        html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.htmlCls.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.htmlCls.GREYD + ";'></textarea>";
        html += "</div>";

        return html;
    }

    //Set the menu "File" at the top of the viewer.
    setMenu1() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";

        html += "<accordion id='" + me.pre + "accordion1' class='icn3d-accordion'>";
        html += "<h3>File</h3>";
        html += "<div>";

        html += this.setMenu1_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu1_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<ul class='icn3d-mn-item'>";
        html += "<li><span>Retrieve by ID</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_mmdbid', 'MMDB ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_mmtfid', 'MMTF ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_pdbid', 'PDB ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_opmid', 'OPM PDB ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_mmcifid', 'mmCIF ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_gi', 'NCBI gi ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_uniprotid', 'UniProt ID ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_cid', 'PubChem CID ' + me.htmlCls.wifiStr);
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Open File</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_pdbfile', 'PDB File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_mmciffile', 'mmCIF File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_mol2file', 'Mol2 File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_sdffile', 'SDF File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_xyzfile', 'XYZ File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_urlfile', 'URL(Same Host) ' + me.htmlCls.wifiStr);
        html += "<li>-</li>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_pngimage', 'iCn3D PNG Image');
        html += me.htmlCls.setHtmlCls.getLink('mn1_state', 'State/Script File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_fixedversion', 'Share Link in Archived Ver. ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_selection', 'Selection File');
        html += "<li>-</li>";

        html += "<li><span>Electron Density(DSN6)</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_dsn6', 'Local File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_dsn6url', 'URL(Same Host) ' + me.htmlCls.wifiStr);
        html += "</ul>";

        html += "</ul>";
        html += "</li>";
        html += "<li><span>Align</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_blast_rep_id', 'Sequence to Structure ' + me.htmlCls.wifiStr);
        html += me.htmlCls.setHtmlCls.getLink('mn1_align', 'Structure to Structure ' + me.htmlCls.wifiStr);
        //html += me.htmlCls.setHtmlCls.getLink('mn1_chainalign', 'Chain to Chain');
        html += me.htmlCls.setHtmlCls.getLink('mn1_chainalign', 'Multiple Chains ' + me.htmlCls.wifiStr);

        html += "</ul>";
        html += "</li>";

        //html += me.htmlCls.setHtmlCls.getLink('mn2_realignonseqalign', 'Realign Selection');

        html += "<li id='" + me.pre + "mn2_realignWrap'><span>Realign Selection</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn2_realign', 'mn2_realignonseqalign', 'on Sequence Alignment ' + me.htmlCls.wifiStr, true);
        html += me.htmlCls.setHtmlCls.getRadio('mn2_realign', 'mn2_realignresbyres', 'Residue by Residue');
        html += "</ul>";
        html += "</li>";

        html += "<li><span>3D Printing</span>";
        html += "<ul>";
        if(me.cfg.cid === undefined) {
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportVrmlStab', 'WRL/VRML(Color, W/ Stab.)');
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportStlStab', 'STL(W/ Stabilizers)');
            html += "<li>-</li>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportVrml', 'WRL/VRML(Color)');
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportStl', 'STL');
            html += "<li>-</li>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_stabilizerYes', 'Add All Stabilizers');
            html += me.htmlCls.setHtmlCls.getLink('mn1_stabilizerNo', 'Remove All Stabilizers');
            html += "<li>-</li>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_stabilizerOne', 'Add One Stabilizer');
            html += me.htmlCls.setHtmlCls.getLink('mn1_stabilizerRmOne', 'Remove One Stabilizer');
            html += "<li>-</li>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_thicknessSet', 'Set Thickness');
            //html += me.htmlCls.setHtmlCls.getLink('mn1_thicknessReset', 'Reset Thickness');
        }
        else {
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportVrml', 'VRML(Color)');
            html += me.htmlCls.setHtmlCls.getLink('mn1_exportStl', 'STL');
        }

        html += "</ul>";
        html += "</li>";

        html += "<li><span>Save Files</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getLink('mn1_exportCanvas', 'iCn3D PNG Image');

        html += "<li><span>iCn3D PNG Image</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportCanvas', 'Original Size');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportCanvas2', '2X Large');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportCanvas4', '4X Large');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportCanvas8', '8X Large');
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn1_exportState', 'State File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportSelections', 'Selection File');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportCounts', 'Residue Counts');

    /*
        html += "<li><span>PDB</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportPdbRes', 'Selected Residues');
        html += me.htmlCls.setHtmlCls.getLink('mn1_exportPdbChain', 'Selected Chains');
        html += "<li><br/></li>";
        html += "</ul>";
        html += "</li>";
    */

        html += me.htmlCls.setHtmlCls.getLink('mn1_exportPdbRes', 'PDB');
        html += "<li><br/></li>";

        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn1_sharelink', 'Share Link ' + me.htmlCls.wifiStr);

        html += me.htmlCls.setHtmlCls.getLink('mn1_replayon', 'Replay Each Step');

        html += "<li><br/></li>";

        html += "</ul>";

        return html;
    }

    //Set the menu "Select" at the top of the viewer.
    setMenu2() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion2' class='icn3d-accordion'>";
        html += "<h3>Select</h3>";
        html += "<div>";

        html += this.setMenu2_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu2_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<ul class='icn3d-mn-item'>";

        html += me.htmlCls.setHtmlCls.getLink('mn2_definedsets', 'Defined Sets');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectall', 'All');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectdisplayed', 'Displayed Set');
        html += me.htmlCls.setHtmlCls.getLink('mn2_aroundsphere', 'by Distance');

        html += "<li><span>by Property</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getLink('mn2_propPos', 'Positive');
        html += me.htmlCls.setHtmlCls.getLink('mn2_propNeg', 'Negative');
        html += me.htmlCls.setHtmlCls.getLink('mn2_propHydro', 'Hydrophobic');
        html += me.htmlCls.setHtmlCls.getLink('mn2_propPolar', 'Polar');
        html += me.htmlCls.setHtmlCls.getLink('mn2_propBfactor', 'B-factor');
        html += me.htmlCls.setHtmlCls.getLink('mn2_propSolAcc', 'Solvent Accessibility');
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn2_selectcomplement', 'Inverse');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectmainchains', 'Main Chains');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectsidechains', 'Side Chains');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectmainsidechains', 'Main & Side Chains');
        html += me.htmlCls.setHtmlCls.getLink('mn2_command', 'Advanced');

        if(me.cfg.cid === undefined) {
            html += "<li><span>Select on 3D</span>";
            html += "<ul>";

            html += "<li>\"Alt\"+Click: start selection</li>";
            html += "<li>\"Ctrl\"+Click: union selection</li>";
            html += "<li>\"Shift\"+Click: range Selection</li>";
            html += "<li>-</li>";
            html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkChain', 'Chain');
            if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
                html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkDomain', '3D Domain');
            }
            html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkStrand', 'Strand/Helix');
            html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkResidue', 'Residue', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkYes', 'Atom');
            html += me.htmlCls.setHtmlCls.getRadio('mn2_pk', 'mn2_pkNo', 'None');
            html += "</ul>";
            html += "</li>";
        }
        else {
            if(me.utilsCls.isMobile()) {
                html += "<li><span>Touch to pick</span>";
            }
            else {
                html += "<li><span>Picking with<br>\"Alt\" + Click</span>";
            }
        }

        html += "<li>-</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn2_saveselection', 'Save Selection');
        html += me.htmlCls.setHtmlCls.getLink('clearall', 'Clear Selection');

        html += "<li>-</li>";

        html += "<li><span>Highlight Color</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_clr', 'mn2_hl_clrYellow', 'Yellow', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_clr', 'mn2_hl_clrGreen', 'Green');
        html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_clr', 'mn2_hl_clrRed', 'Red');
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Highlight Style</span>";
        html += "<ul>";

        html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_style', 'mn2_hl_styleOutline', 'Outline', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_style', 'mn2_hl_styleObject', '3D Objects');
        //html += me.htmlCls.setHtmlCls.getRadio('mn2_hl_style', 'mn2_hl_styleNone', 'No Highlight');

        html += "</ul>";
        html += "</li>";

        //html += me.htmlCls.setHtmlCls.getLink('mn2_hl_styleNone', 'Clear Highlight');

        html += me.htmlCls.setHtmlCls.getLink('toggleHighlight2', 'Toggle Highlight');

        html += "<li><br/></li>";

        html += "</ul>";

        return html;
    }

    setMenu2b() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion2b' class='icn3d-accordion'>";
        html += "<h3>View</h3>";
        html += "<div>";

        html += this.setMenu2b_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu2b_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";
        html += "<ul class='icn3d-mn-item'>";

        html += me.htmlCls.setHtmlCls.getLink('mn2_show_selected', 'View Selection');
        html += me.htmlCls.setHtmlCls.getLink('mn2_hide_selected', 'Hide Selection');
        html += me.htmlCls.setHtmlCls.getLink('mn2_selectedcenter', 'Zoom in Selection');
        html += me.htmlCls.setHtmlCls.getLink('mn6_center', 'Center Selection');
        html += me.htmlCls.setHtmlCls.getLink('mn2_fullstru', 'View Full Structure');
        html += "<li id='" + me.pre + "mn2_alternateWrap'><span id='" + me.pre + "mn2_alternate' class='icn3d-link'>Alternate(Key \"a\")</span></li>";

        if(me.cfg.opmid !== undefined) {
            html += "<li id='" + me.pre + "togglememli'><span id='" + me.pre + "togglemem' class='icn3d-link'>Toggle Membrane</span></li>";
            html += "<li id='" + me.pre + "adjustmemli'><span id='" + me.pre + "adjustmem' class='icn3d-link'>Adjust Membrane</span></li>";
            html += "<li id='" + me.pre + "selectplaneli'><span id='" + me.pre + "selectplane' class='icn3d-link'>Select between<br>Two X-Y Planes</span></li>";
        }
        else {
            html += "<li id='" + me.pre + "togglememli' style='display:none'><span id='" + me.pre + "togglemem' class='icn3d-link'>Toggle Membrane</span></li>";
            html += "<li id='" + me.pre + "adjustmemli' style='display:none'><span id='" + me.pre + "adjustmem' class='icn3d-link'>Adjust Membrane</span></li>";
            html += "<li id='" + me.pre + "selectplaneli' style='display:none'><span id='" + me.pre + "selectplane' class='icn3d-link'>Select between<br>Two X-Y Planes</span></li>";
        }

        html += "<li>-</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn6_sidebyside', 'Side by Side');

        html += "<li><span>Rotate</span>";
        html += "<ul>";

        html += "<li><span>Rotate 90&deg;</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate90', 'mn6_rotatex', 'X-axis(Shift + Key M)');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate90', 'mn6_rotatey', 'Y-axis(Shift + Key J)');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate90', 'mn6_rotatez', 'Z-axis');
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Auto Rotation</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate', 'mn6_rotateleft', 'Rotate Left');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate', 'mn6_rotateright', 'Rotate Right');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate', 'mn6_rotateup', 'Rotate Up');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_rotate', 'mn6_rotatedown', 'Rotate Down');
        html += "</ul>";
        html += "</li>";

        html += "</ul>";
        html += "</li>";

        html += "<li><span>Camera</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_camera', 'mn6_cameraPers', 'Perspective', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn6_camera', 'mn6_cameraOrth', 'Orthographic');
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Fog for Selection</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showfog', 'mn6_showfogYes', 'On');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showfog', 'mn6_showfogNo', 'Off', true);
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Slab for Selection</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showslab', 'mn6_showslabYes', 'On');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showslab', 'mn6_showslabNo', 'Off', true);
        html += "</ul>";
        html += "</li>";
        html += "<li><span>XYZ-axes</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showaxis', 'mn6_showaxisYes', 'Original');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showaxis', 'mn6_showaxisSel', 'Prin. Axes on Sel.');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_showaxis', 'mn6_showaxisNo', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += "<li>-</li>";

        html += "<li><span>Reset</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_reset', 'reset', 'All');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_reset', 'mn6_resetOrientation', 'Orientation');
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn6_back', 'Undo');
        html += me.htmlCls.setHtmlCls.getLink('mn6_forward', 'Redo');

        html += me.htmlCls.setHtmlCls.getLink('mn6_fullscreen', 'Full Screen');
    //    html += me.htmlCls.setHtmlCls.getLink('mn6_exitfullscreen', 'Exit Full Screen');

        html += "<li><br/></li>";

        html += "</ul>";

        return html;
    }

    //Set the menu "Style" at the top of the viewer.
    setMenu3() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion3' class='icn3d-accordion'>";
        html += "<h3 id='" + me.pre + "style'>Style</h3>";
        html += "<div>";

        html += this.setMenu3_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu3_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<ul class='icn3d-mn-item'>";

        if(me.cfg.cid === undefined) {
            html += "<li><span>Proteins</span>";
            html += "<ul>";
            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
                html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon');
            }
            else {
                html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon', true);
            }

            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsStrand', 'Strand');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsCylinder', 'Cylinder and Plate');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsSchematic', 'Schematic');

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
                html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace', true);
            }
            else {
                html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace');
            }

            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsBackbone', 'Backbone');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsBfactor', 'B-factor Tube');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsLines', 'Lines');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsStick', 'Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsBallstick', 'Ball and Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsSphere', 'Sphere');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_proteins', 'mn3_proteinsNo', 'Hide');
            html += "</ul>";
            html += "</li>";

            html += "<li><span>Side Chains</span>";
            html += "<ul>";

            html += me.htmlCls.setHtmlCls.getRadio('mn3_sidec', 'mn3_sidecLines', 'Lines');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_sidec', 'mn3_sidecStick', 'Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_sidec', 'mn3_sidecBallstick', 'Ball and Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_sidec', 'mn3_sidecSphere', 'Sphere');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_sidec', 'mn3_sidecNo', 'Hide', true);
            html += "</ul>";
            html += "</li>";

            html += "<li><span>Nucleotides</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclCartoon', 'Cartoon', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclPhos', "O3' Trace");
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclBackbone', 'Backbone');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclSchematic', 'Schematic')
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclLines', 'Lines');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclStick', 'Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclBallstick', 'Ball and Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclSphere', 'Sphere');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_nucl', 'mn3_nuclNo', 'Hide');
            html += "</ul>";
            html += "</li>";
        }

        html += "<li><span>Chemicals</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligLines', 'Lines');
        if(me.cfg.cid === undefined) {
            html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligStick', 'Stick', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligBallstick', 'Ball and Stick');
        }
        else {
            html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligStick', 'Stick');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligBallstick', 'Ball and Stick', true);
        }
        html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligSchematic', 'Schematic');
        html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligSphere', 'Sphere');
        html += me.htmlCls.setHtmlCls.getRadio('mn3_lig', 'mn3_ligNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        if(me.cfg.cid !== undefined) {
            html += "<li><span>Hydrogens</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn3_hydrogens', 'mn3_hydrogensYes', 'Show', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn3_hydrogens', 'mn3_hydrogensNo', 'Hide');
            html += "</ul>";
            html += "</li>";
        }
        else {
            html += "<li><span>Glycans</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn3_glycansCart', 'mn3_glycansCartYes', 'Show Cartoon');
            html += me.htmlCls.setHtmlCls.getRadio('mn3_glycansCart', 'mn3_glycansCartNo', 'Hide Cartoon', true);
            html += "</ul>";
            html += "</li>";
        }

        html += "<li><span>Ions</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn3_ions', 'mn3_ionsSphere', 'Sphere', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn3_ions', 'mn3_ionsDot', 'Dot');
        html += me.htmlCls.setHtmlCls.getRadio('mn3_ions', 'mn3_ionsNo', 'Hide');
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Water</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn3_water', 'mn3_waterSphere', 'Sphere');
        html += me.htmlCls.setHtmlCls.getRadio('mn3_water', 'mn3_waterDot', 'Dot');
        html += me.htmlCls.setHtmlCls.getRadio('mn3_water', 'mn3_waterNo', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn3_setThickness', 'Preferences');

        html += "<li>-</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn3_styleSave', 'Save Style');
        html += me.htmlCls.setHtmlCls.getLink('mn3_styleApplySave', 'Apply Saved Style');

        html += "<li>-</li>";

        html += "<li><span>Surface Type</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceVDW', 'Van der Waals');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceVDWContext', 'VDW with Context');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceMolecular', 'Molecular Surface');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceMolecularContext', 'MS with Context');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceSAS', 'Solvent Accessible');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_surface', 'mn5_surfaceSASContext', 'SA with Context');
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn5_surfaceNo', 'Remove Surface');

        html += "<li><span>Surface Opacity</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn5_opacity', 'mn5_opacity10', '1.0', true);

        for(let i = 9; i > 0; --i) {
            html += me.htmlCls.setHtmlCls.getRadio('mn5_opacity', 'mn5_opacity0' + i, '0.' + i);
        }
        html += "</ul>";
        html += "</li>";
        html += "<li><span>Surface Wireframe</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn5_wireframe', 'mn5_wireframeYes', 'Yes');
        html += me.htmlCls.setHtmlCls.getRadio('mn5_wireframe', 'mn5_wireframeNo', 'No', true);
        html += "</ul>";
        html += "</li>";

        if(me.cfg.cid === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined) {
            html += "<li>-</li>";

            html += "<li id='" + me.pre + "mapWrapper1'><span>Electron Density</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn5_elecmap', 'mn5_elecmap2fofc', '2Fo-Fc Map');
            html += me.htmlCls.setHtmlCls.getRadio('mn5_elecmap', 'mn5_elecmapfofc', 'Fo-Fc Map');
            html += "</ul>";
            html += "</li>";

            html += me.htmlCls.setHtmlCls.getLinkWrapper('mn5_elecmapNo', 'Remove Map', 'mapWrapper2');

            html += "<li id='" + me.pre + "mapWrapper3'><span>Map Wireframe</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn5_mapwireframe', 'mn5_mapwireframeYes', 'Yes', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn5_mapwireframe', 'mn5_mapwireframeNo', 'No');
            html += "</ul>";
            html += "</li>";

            if(me.cfg.mmtfid === undefined) {
                //html += "<li>-</li>";

                html += me.htmlCls.setHtmlCls.getLinkWrapper('mn5_emmap', 'EM Density Map', 'emmapWrapper1');
                html += me.htmlCls.setHtmlCls.getLinkWrapper('mn5_emmapNo', 'Remove EM Map', 'emmapWrapper2');

                html += "<li id='" + me.pre + "emmapWrapper3'><span>EM Map Wireframe</span>";
                html += "<ul>";
                html += me.htmlCls.setHtmlCls.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeYes', 'Yes', true);
                html += me.htmlCls.setHtmlCls.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeNo', 'No');
                html += "</ul>";
                html += "</li>";
            }
        }

        html += "<li>-</li>";

        html += "<li><span>Background</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_bkgd', 'mn6_bkgdTransparent', 'Transparent', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn6_bkgd', 'mn6_bkgdBlack', 'Black');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_bkgd', 'mn6_bkgdGrey', 'Grey');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_bkgd', 'mn6_bkgdWhite', 'White');
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Dialog Color</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_theme', 'mn6_themeBlue', 'Blue', true);
        html += me.htmlCls.setHtmlCls.getRadio('mn6_theme', 'mn6_themeOrange', 'Orange');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_theme', 'mn6_themeBlack', 'Black');
        html += "</ul>";
        html += "</li>";

//        html += "<li><span>Two-color Helix</span>";
//        html += "<ul>";
//        html += me.htmlCls.setHtmlCls.getRadio('mn6_doublecolor', 'mn6_doublecolorYes', 'Yes');
//        html += me.htmlCls.setHtmlCls.getRadio('mn6_doublecolor', 'mn6_doublecolorNo', 'No', true);
//        html += "</ul>";
//        html += "</li>";


        html += "<li><br/></li>";

        html += "</ul>";

        return html;
    }

    //Set the menu "Color" at the top of the viewer.
    setMenu4() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion4' class='icn3d-accordion'>";
        html += "<h3 id='" + me.pre + "color'>Color</h3>";
        html += "<div>";

        html += this.setMenu4_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu4_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<ul class='icn3d-mn-item'>";

        html += "<li><span style='padding-left:2.3em;'>Unicolor</span>";
        html += "<ul>";

        html += "<li><span>Red</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrRed', 'Red');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed1', 'Red', 'F00');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed2', 'Indian Red', 'CD5C5C');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed3', 'Light Coral', 'F08080');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed4', 'Salmon', 'FA8072');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed5', 'Dark Salmon', 'E9967A');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed6', 'Light Salmon', 'FFA07A');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed7', 'Crimson', 'DC143C');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed8', 'Fire Brick', 'B22222');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrRed9', 'Dark Red', '8B0000');
        html += "</ul>";

        html += "<li><span>Pink</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink1', 'Pink', 'FFC0CB');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink2', 'Light Pink', 'FFB6C1');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink3', 'Hot Pink', 'FF69B4');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink4', 'Deep Pink', 'FF1493');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink5', 'Medium Violet Red', 'C71585');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrPink6', 'Pale Violet Red', 'DB7093');
        html += "</ul>";

        html += "<li><span>Orange</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran1', 'Orange', 'FFA500');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran2', 'Dark Orange', 'FF8C00');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran3', 'Orange Red', 'FF4500');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran4', 'Tomato', 'FF6347');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran5', 'Coral', 'FF7F50');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrOran6', 'Light Salmon', 'FFA07A');
        html += "</ul>";

        html += "<li><span>Yellow</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrYllw', 'Yellow');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw1', 'Yellow', 'FF0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw2', 'Gold', 'FFD700');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw3', 'Light Yellow', 'FFFFE0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw4', 'Lemon Chiffon', 'FFFACD');
        //html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw5', 'Light Golden Rod Yellow', 'FAFAD2');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw5', 'Light Golden Rod', 'FAFAD2');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw6', 'Papaya Whip', 'FFEFD5');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw7', 'Moccasin', 'FFE4B5');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw8', 'Peach Puff', 'FFDAB9');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw9', 'Pale Golden Rod', 'EEE8AA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw10', 'Khaki', 'F0E68C');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrYllw11', 'Dark Khaki', 'BDB76B');
        html += "</ul>";

        html += "<li><span>Magenta</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrMgnt', 'Magenta');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt1', 'Magenta', 'F0F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt2', 'Orchid', 'DA70D6');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt3', 'Violet', 'EE82EE');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt4', 'Plum', 'DDA0DD');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt5', 'Thistle', 'D8BFD8');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt6', 'Lavender', 'E6E6FA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt7', 'Medium Orchid', 'BA55D3');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt8', 'Medium Purple', '9370DB');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt9', 'Rebecca Purple', '663399');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt10', 'Blue Violet', '8A2BE2');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt11', 'Dark Violet', '9400D3');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt12', 'Dark Orchid', '9932CC');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt13', 'Dark Magenta', '8B008B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt14', 'Purple', '800080');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt15', 'Indigo', '4B0082');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt16', 'Slat Blue', '6A5ACD');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt17', 'Dark Slate Blue', '483D8B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrMgnt18', 'Medium Slat Blue', '6A5ACD');
        html += "</ul>";

        html += "<li><span>Green</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrGrn', 'Green');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn1', 'Green', '0F0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn2', 'Dark Green', '006400');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn3', 'Yellow Green', '9ACD32');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn4', 'Olive Drab', '6B8E23');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn5', 'Olive', '808000');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn6', 'Dark Olive Green', '556B2F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn7', 'Medium Aquamarine', '66CDAA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn8', 'Dark Sea Green', '8FBC8B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn9', 'Lignt Sea Green', '20B2AA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn10', 'Dark Cyan', '008B8B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn11', 'Teal', '008080');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn12', 'Forest Green', '228B22');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn13', 'Sea Green', '2E8B57');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn14', 'Medium Sea Green', '3CB371');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn15', 'Spring Green', '00FF7F');
        //html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn16', 'Medium Spring Green', '00FA9A');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn16', 'Medium Spring', '00FA9A');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn17', 'Light Green', '90EE90');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn18', 'Pale Green', '98FB98');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn19', 'Lime Green', '32CD32');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn20', 'Lawn Green', '7CFC00');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn21', 'Chartreuse', '7FFF00');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGrn22', 'Green Yellow', 'ADFF2F');
        html += "</ul>";

        html += "<li><span>Cyan</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrCyan', 'Cyan');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan1', 'Cyan', '0FF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan2', 'Light Cyan', 'E0FFFF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan3', 'Pale Turquoise', 'AFEEEE');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan4', 'Aquamarine', '7FFFD4');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan5', 'Turquoise', '40E0D0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan6', 'Medium Turquoise', '48D1CC');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrCyan7', 'Dark Turquoise', '00CED1');
        html += "</ul>";

        html += "<li><span>Blue</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrBlue', 'Blue');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue1', 'Blue', '00F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue2', 'Medium Blue', '0000CD');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue3', 'Dark Blue', '00008B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue4', 'Navy', '000080');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue5', 'Midnight Blue', '191970');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue6', 'Royal Blue', '4169E1');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue7', 'Medium Slate Blue', '7B68EE');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue8', 'Corn Flower Blue', '6495ED');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue9', 'Dodger Blue', '1E90FF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue10', 'Deep Sky Blue', '00BFFF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue11', 'Light Sky Blue', '87CEFA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue12', 'Sky Blue', '87CEEB');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue13', 'Light Blue', 'ADD8E6');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue14', 'Powder Blue', 'B0E0E6');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue15', 'Light Steel Blue', 'B0C4DE');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue16', 'Steel Blue', '4682B4');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBlue17', 'Cadet Blue', '5F9EA0');
        html += "</ul>";

        html += "<li><span>Brown</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrBrown', 'Brown');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown1', 'Brown', 'A52A2A');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown2', 'Maroon', '800000');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown3', 'Sienna', 'A0522D');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown4', 'Saddle Brown', '8B4513');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown5', 'Chocolate', 'D2691E');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown6', 'Peru', 'CD853F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown7', 'Dark Golden Rod', 'B8860B');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown8', 'Golden Rod', 'DAA520');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown9', 'Sandy Brown', 'F4A460');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown10', 'Rosy Brown', 'BC8F8F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown11', 'Tan', 'D2B48C');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown12', 'Burlywood', 'DEB887');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown13', 'Wheat', 'F5DEB3');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown14', 'Navajo White', 'FFDEAD');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown15', 'Bisque', 'FFE4C4');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown16', 'Blanched Almond', 'FFEBCD');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrBrown17', 'Corn Silk', 'FFF8DC');
        html += "</ul>";

        html += "<li><span>White</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrWhite', 'White');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite1', 'White', 'FFF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite2', 'Snow', 'FFFAFA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite3', 'Honey Dew', 'F0FFF0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite4', 'Mint Cream', 'F5FFFA');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite5', 'Azure', 'F0FFFF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite6', 'Alice Blue', 'F0F8FF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite7', 'Ghost White', 'F8F8FF');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite8', 'White Smoke', 'F5F5F5');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite9', 'Sea Shell', 'FFF5EE');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite10', 'Beige', 'F5F5DC');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite11', 'Old Lace', 'FDF5E6');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite12', 'Floral White', 'FFFAF0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite13', 'Ivory', 'FFFFF0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite14', 'Antique White', 'FAEBD7');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite15', 'Linen', 'FAF0E6');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite16', 'Lavenderblush', 'FFF0F5');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrWhite17', 'Misty Rose', 'FFE4E1');
        html += "</ul>";

        html += "<li><span>Grey</span>";
        html += "<ul>";
        //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrGray', 'Gray');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray1', 'Gray', '808080');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray2', 'Dim Gray', '696969');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray3', 'Light Slate Gray', '778899');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray4', 'Slate Gray', '708090');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray5', 'Dark Slate Gray', '2F4F4F');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray6', 'Black', '000000');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray7', 'Dark Gray', 'A9A9A9');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray8', 'Silver', 'C0C0C0');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray9', 'Light Gray', 'D3D3D3');
        html += me.htmlCls.setHtmlCls.getRadioColor('mn4_clr', 'mn4_clrGray10', 'Gainsboro', 'DCDCDC');
        html += "</ul>";

        html += "</ul>";

        html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrCustom', 'Color Picker');
        html += "<li>-</li>";

        if(me.cfg.cid === undefined) {
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrSpectrum', 'Spectrum');
            html += "<li><span style='padding-left:2.3em;'>Secondary</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrSSGreen', 'Sheet in Green');
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrSSYellow', 'Sheet in Yellow');
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrSSSpectrum', 'Spectrum');
            html += "</ul>";

            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrCharge', 'Charge');

//            if(!me.cfg.notebook && !me.cfg.hidelicense) {
//                html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn1_delphi2', 'DelPhi<br><span style="padding-left:1.5em;">Potential ' + me.htmlCls.licenseStr + '</span>');
//            }

            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrHydrophobic', 'Wimley-White<br><span style="padding-left:1.5em;">Hydrophobicity</span>');

            html += "<li><span style='padding-left:2.3em;'>B-factor</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrBfactor', 'Original');
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrBfactorNorm', 'Percentile');
            html += "</ul>";

            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrArea', 'Solvent<br><span style="padding-left:1.5em;">Accessibility</span>');

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.blast_rep_id !== undefined) {
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrChain', 'Chain');
            }
            else {
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrChain', 'Chain', true);
            }

            if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrdomain', '3D Domain');
            }

            //html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrResidue', 'Residue');

            html += "<li><span style='padding-left:2.3em;'>Residue</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrResidue', 'Default');
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrResidueCustom', 'Custom');
            html += "</ul>";

            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom');

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity', true);
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation');
            }
            else if(me.cfg.blast_rep_id !== undefined) {
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity');
              html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation', true);
            }
        }
        else {
            if(!me.cfg.hidelicense) html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn1_delphi2', 'DelPhi<br><span style="padding-left:1.5em;">Potential ' + me.htmlCls.licenseStr + '</span>');
            html += me.htmlCls.setHtmlCls.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom', true);
        }

        html += "<li>-</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn4_clrSave', 'Save Color');
        html += me.htmlCls.setHtmlCls.getLink('mn4_clrApplySave', 'Apply Saved Color');

        html += "<li><br/></li>";
        html += "</ul>";

        return html;
    }

    //Set the menu "Surface" at the top of the viewer.
    setMenu5() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion5' class='icn3d-accordion'>";
        html += "<h3 id='" + me.pre + "analysis' style='font-size:1.2em'>&nbsp;Analysis</h3>";
        html += "<div>";

        html += this.setMenu5_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu5_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<ul class='icn3d-mn-item'>";

        if(me.cfg.cid === undefined) {
            html += me.htmlCls.setHtmlCls.getLink('mn6_selectannotations', 'Seq. & Annotations ' + me.htmlCls.wifiStr);

            //if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) { // || ic.bRealign || ic.bSymd || ic.bInputfile) {
                html += me.htmlCls.setHtmlCls.getLink('mn2_alignment', 'Aligned Seq. ' + me.htmlCls.wifiStr);
            //}

            if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
              html += me.htmlCls.setHtmlCls.getLink('mn2_2ddgm', '2D Diagram ' + me.htmlCls.wifiStr);
            }
/*
            html += "<li><span>2D Cartoon</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getLink('2ddgm_chain', 'Chain Level');
            html += me.htmlCls.setHtmlCls.getLink('2ddgm_domain', 'Domain Level');
            html += me.htmlCls.setHtmlCls.getLink('2ddgm_secondary', 'Helix/Sheet Level');
            html += "</ul>";
            html += "</li>";
*/
            html += me.htmlCls.setHtmlCls.getLink('definedsets2', 'Defined Sets');

            html += "<li>-</li>";

            html += me.htmlCls.setHtmlCls.getLink('mn6_hbondsYes', 'Interactions');
            //html += me.htmlCls.setHtmlCls.getLink('mn6_hbondsNo', 'Remove H-Bonds <br>& Interactions');

            html += me.htmlCls.setHtmlCls.getLink('mn6_contactmap', 'Contact Map');

            html += "<li><span>Bring to Front</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_window_table', 'Interaction Table');
            html += me.htmlCls.setHtmlCls.getLink('mn1_window_linegraph', '2D Interaction Network');
            html += me.htmlCls.setHtmlCls.getLink('mn1_window_scatterplot', '2D Interaction Map');
            html += me.htmlCls.setHtmlCls.getLink('mn1_window_graph', '2D Graph(Force-Directed)');
            html += "</ul>";
            html += "</li>";

            if(!me.cfg.notebook && !me.cfg.hidelicense) {
                html += me.htmlCls.setHtmlCls.getLink('mn1_mutation', 'Mutation ' + me.htmlCls.wifiStr);
            }

            html += "<li>-</li>";
        }

        if(!me.cfg.notebook && !me.cfg.hidelicense) {
            html += me.htmlCls.setHtmlCls.getLink('mn1_delphi', 'DelPhi Potential ' + me.htmlCls.licenseStr);
            html += "<li><span>Load PQR/Phi</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_phi', 'Local PQR/Phi/Cube File');
            html += me.htmlCls.setHtmlCls.getLink('mn1_phiurl', 'URL PQR/Phi/Cube File');
            html += "</ul>";
            html += me.htmlCls.setHtmlCls.getLink('delphipqr', 'Download PQR');

            html += "<li>-</li>";
        }

        html += "<li><span>Distance</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_distance', 'mn6_distanceYes', 'between Two Atoms');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_distance', 'mn6_distTwoSets', 'between Two Sets');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_distance', 'mn6_distanceNo', 'Hide', true);
        html += "</ul>";
        html += "</li>";

        html += me.htmlCls.setHtmlCls.getLink('mn6_area', 'Surface Area');

        html += "<li><span>Label</span>";
        html += "<ul>";
        html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelYes', 'by Picking Atoms');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelSelection', 'per Selection');
        html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelAtoms', 'per Atom');
        if(me.cfg.cid === undefined) {
            html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelResidues', 'per Residue');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelResnum', 'per Residue & Number');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelChains', 'per Chain');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelTermini', 'N- & C-Termini');
        }
        html += me.htmlCls.setHtmlCls.getRadio('mn6_addlabel', 'mn6_addlabelNo', 'Remove', true);
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Label Scale</span>";
        html += "<ul>";

        for(let i = 1; i <= 4; ++i) {
            let twoi = 2 * i;
            html += me.htmlCls.setHtmlCls.getRadio('mn6_labelscale', 'mn6_labelscale0' + twoi, '0.' + twoi);
        }

        for(let i = 1; i <= 5; ++i) {
            if(i == 1) {
                html += me.htmlCls.setHtmlCls.getRadio('mn6_labelscale', 'mn6_labelscale' + i + '0', i + '.0', true);
            }
            else {
                html += me.htmlCls.setHtmlCls.getRadio('mn6_labelscale', 'mn6_labelscale' + i + '0', i + '.0');
            }
        }

        html += "</ul>";
        html += "</li>";

        html += "<li>-</li>";

        if(me.cfg.cid === undefined) {
            html += "<li><span>Chem. Binding</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindingshow', 'Show');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindinghide', 'Hide', true);
            html += "</ul>";
            html += "</li>";

            html += "<li><span>Disulfide Bonds</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn6_ssbonds', 'mn6_ssbondsYes', 'Show', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn6_ssbonds', 'mn6_ssbondsExport', 'Export Pairs');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_ssbonds', 'mn6_ssbondsNo', 'Hide');
            html += "</ul>";
            html += "</li>";

            html += "<li><span>Cross-Linkages</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getRadio('mn6_clbonds', 'mn6_clbondsYes', 'Show', true);
            html += me.htmlCls.setHtmlCls.getRadio('mn6_clbonds', 'mn6_clbondsExport', 'Export Pairs');
            html += me.htmlCls.setHtmlCls.getRadio('mn6_clbonds', 'mn6_clbondsNo', 'Hide');
            html += "</ul>";
            html += "</li>";

            let bOnePdb = me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined;
            if(bOnePdb) {
              html += "<li id='" + me.pre + "assemblyWrapper'><span>Assembly</span>";
              html += "<ul>";

              html += me.htmlCls.setHtmlCls.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', true);
              html += me.htmlCls.setHtmlCls.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit');

              html += "</ul>";
              html += "</li>";

            }

            html += "<li><span>Symmetry</span>";
            html += "<ul>";
            if(bOnePdb) html += me.htmlCls.setHtmlCls.getLink('mn6_symmetry', 'from PDB(precalculated) ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn6_symd', 'from SymD(Dynamic) ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn6_clear_sym', 'Clear SymD Symmetry');
            html += me.htmlCls.setHtmlCls.getLink('mn6_axes_only', 'Show Axes Only');
            html += "</ul>";
            html += "</li>";

            html += "<li>-</li>";
        }

        html += me.htmlCls.setHtmlCls.getLink('mn6_yournote', 'Window Title');

        if(me.cfg.cid !== undefined) {
            html += "<li><span>Links</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_structure', 'Compound Summary ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_vast', 'Similar Compounds ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_bind', 'Structures Bound ' + me.htmlCls.wifiStr);
            html += "</ul>";
            html += "</li>";
        }
        else {
            html += "<li><span>Links</span>";
            html += "<ul>";
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_structure', 'Structure Summary ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_vast', 'Similar Structures ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_pubmed', 'Literature ' + me.htmlCls.wifiStr);
            html += me.htmlCls.setHtmlCls.getLink('mn1_link_protein', 'Protein ' + me.htmlCls.wifiStr);
            //html += me.htmlCls.setHtmlCls.getLink('mn1_link_gene', 'Gene');
            //html += me.htmlCls.setHtmlCls.getLink('mn1_link_chemicals', 'Chemicals');
            html += "</ul>";
            html += "</li>";
        }

        html += "<li><br/></li>";

        html += "</ul>";

        return html;
    }

    //Set the menu "Other" at the top of the viewer.
    setMenu6() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        html += "<div class='icn3d-menu'>";
        html += "<accordion id='" + me.pre + "accordion6' class='icn3d-accordion'>";
        html += "<h3>Help</h3>";
        html += "<div>";

        html += this.setMenu6_base();

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        return html;
    }

    setMenu6_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        let html = "";

        let liStr = "<li><a href='";

        html += "<ul class='icn3d-mn-item'>";

        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#about' target='_blank'>About iCn3D<span style='font-size:0.9em'> " + me.REVISION + "</span></a></li>";

        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#gallery' target='_blank'>Live Gallery " + me.htmlCls.wifiStr + "</a></li>";

        html += "<li><span>Tutorial</span>";
        html += "<ul>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#useicn3d' target='_blank'>Use iCn3D</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#videos' target='_blank'>iCn3D Videos</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#parameters' target='_blank'>URL Parameters</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#commands' target='_blank'>Commands</a></li>";
        html += "</ul>";
        html += "</li>";

        html += liStr + "https://www.ncbi.nlm.nih.gov/structure' target='_blank'>Search Structure " + me.htmlCls.wifiStr + "</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#citing' target='_blank'>Citing iCn3D</a></li>";

        html += "<li><span>Source Code</span>";
        html += "<ul>";
        html += liStr + "https://github.com/ncbi/icn3d' target='_blank'>GitHub (browser) " + me.htmlCls.wifiStr + "</a></li>";
        html += liStr + "https://www.npmjs.com/package/icn3d' target='_blank'>npm (Node.js) " + me.htmlCls.wifiStr + "</a></li>";
        html += liStr + "https://pypi.org/project/icn3dpy' target='_blank'>Jupyter Notebook " + me.htmlCls.wifiStr + "</a></li>";
        html += "</ul>";
        html += "</li>";

        html += "<li><span>Develop</span>";
        html += "<ul>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#HowToUse' target='_blank'>How to Embed</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#datastructure' target='_blank'>Data Structure</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#classstructure' target='_blank'>Class Structure</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#addclass' target='_blank'>Add New Classes</a></li>";
        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#modifyfunction' target='_blank'>Modify Functions</a></li>";
        html += "</ul>";
        html += "</li>";

        html += liStr + me.htmlCls.baseUrl + "icn3d/docs/icn3d_help.html' target='_blank'>Help Doc " + me.htmlCls.wifiStr + "</a></li>";

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

        html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#HowToUseStep5' target='_blank'>Selection Hints</a></li>";

        html += "<li><br/></li>";
        html += "</ul>";

        return html;
    }

    //Hide the menu at the top and just show the canvas. "width" and "height" are the width and height of the canvas.
    hideMenu() { let me = this.icn3dui;
      if(me.bNode) return;

      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "none";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "none";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "none";
      $("#" + me.pre + "title")[0].style.margin = "10px 0 0 10px";
    }

    //Show the menu at the top and the canvas. "width" and "height" are the width and height of the canvas.
    showMenu() { let me = this.icn3dui;
      if(me.bNode) return;

      if($("#" + me.pre + "mnlist")[0] !== undefined) $("#" + me.pre + "mnlist")[0].style.display = "block";
      if($("#" + me.pre + "mnLogSection")[0] !== undefined) $("#" + me.pre + "mnLogSection")[0].style.display = "block";
      if($("#" + me.pre + "cmdlog")[0] !== undefined) $("#" + me.pre + "cmdlog")[0].style.display = "block";
      //if($("#" + me.pre + "title")[0] !== undefined) $("#" + me.pre + "title")[0].style.display = "block";
    }
}

export {SetMenu}
