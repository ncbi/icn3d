/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class SetMenu {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
        //this.sh = this.icn3dui.htmlCls.setHtmlCls;
    }

    // simpify the calls of the following functions from setHtmlCls
    getLink(id, text, bSimpleMenu, selType) { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getLink(id, text, bSimpleMenu, selType);
    }

    getMenuText(id, text, classname, bSimpleMenu, selType) { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getMenuText(id, text, classname, bSimpleMenu, selType);
    }

    getMenuUrl(id, url, text, bSimpleMenu, selType) { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getMenuUrl(id, url, text, bSimpleMenu, selType);
    }

    getMenuSep() { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getMenuSep();
    }

    getLinkWrapper(id, text, wrapper, bSimpleMenu, selType, bHide) { let me = this.icn3dui, ic = me.icn3d;
        return me.htmlCls.setHtmlCls.getLinkWrapper(id, text, wrapper, bSimpleMenu, selType, bHide);
    }

    getLinkWrapper2(id, text, wrapper, bSimpleMenu, selType) { let me = this.icn3dui, ic = me.icn3d;
        return me.htmlCls.setHtmlCls.getLinkWrapper2(id, text, wrapper, bSimpleMenu, selType);
    }

    getRadio(radioid, id, text, bChecked, bSimpleMenu, selType) { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getRadio(radioid, id, text, bChecked, bSimpleMenu, selType);
    }

    getRadClr(radioid, id, text, color, bChecked, bSimpleMenu, selType) { let me = this.icn3dui;
        return me.htmlCls.setHtmlCls.getRadioColor(radioid, id, text, color, bChecked, bSimpleMenu, selType);
    }

    //Set the HTML code for the menus shown at the top of the viewer.
    setTopMenusHtml(id, str1, str2) { let me = this.icn3dui;
        if(me.bNode) return '';

        let titleColor =(me.htmlCls.opts['background'] == 'black') ? me.htmlCls.GREYD : 'black';

        let html = "";

        html += "<div style='position:relative;'>";

        html += me.htmlCls.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

        html += this.setReplayHtml();

        html += "<!--https://forum.jquery.com/topic/looking-for-a-jquery-horizontal-menu-bar-->";
        html += me.htmlCls.divStr + "mnlist' style='position:absolute; z-index:999; float:left; display:table-row; margin-top: -2px;'>";
        html += "<table border='0' cellpadding='0' cellspacing='0' width='100'><tr>";

        let tdStr = '<td valign="top">';
        html += tdStr + this.setMenu1() + '</td>';

        html += tdStr + this.setMenu2() + '</td>';

        html += tdStr + this.setMenu2b() + '</td>';
        html += tdStr + this.setMenu3() + '</td>';
        html += tdStr + this.setMenu4() + '</td>';

        html += tdStr + this.setMenu5() + '</td>';
        //html += tdStr + this.setMenu5b() + '</td>';
        html += tdStr + this.setMenu6() + '</td>';

        me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.simpleMenus); 

        html += tdStr + "<div style='position:relative; margin-left:6px;'>" + str1;
        html += "<div class='icn3d-commandTitle' style='min-width:40px; margin-top: 3px; white-space: nowrap;'>" + str2;

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:10px; border-left:solid 1px #888888"><span id="' + me.pre +  'selection_expand" class="icn3d-expand icn3d-link" style="display:block;" title="Expand">' + me.htmlCls.space2 + 'Toolbar <span class="ui-icon ui-icon-plus" style="width:15px"></span>' + me.htmlCls.space2 + '</span><span id="' + me.pre +  'selection_shrink" class="icn3d-shrink icn3d-link" style="display:none;" title="Shrink">' + me.htmlCls.space2 + 'Toolbar <span class="ui-icon ui-icon-minus" style="width:15px"></span>' + me.htmlCls.space2 + '</span></div></td>';

        html += tdStr + '<div class="icn3d-commandTitle" style="white-space:nowrap; margin-top:8px; border-left:solid 1px #888888">' + me.htmlCls.space2 + '<input type="text" id="' + me.pre + 'search_seq" size="10" placeholder="one-letter seq."> <button style="white-space:nowrap;" id="' + me.pre + 'search_seq_button">Search</button> <a style="text-decoration: none;" href="' + me.htmlCls.baseUrl + 'icn3d/icn3d.html#selectb" target="_blank" title="Specification tips">?</a></div></td>';

        html += "</tr>";
        html += "</table>";
        html += "</div>";

        html += this.setTools();

        // show title at the top left corner
        html += me.htmlCls.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:table-row; margin: 85px 0px 0px 5px; color:" + titleColor + "; width:" + me.htmlCls.WIDTH + "px'></div>";

        html += me.htmlCls.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.htmlCls.GREYD + ";'>";

        // deprecated, use the dialog dl_legend instead
        //html += me.htmlCls.divStr + "legend' class='icn3d-text icn3d-legend'></div>";

        html += me.htmlCls.divStr + "mnLogSection'>";
        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";
    //        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";

        html += " </div>";

        if(me.cfg.mmtfid === undefined) {
            //var tmpStr =(ic.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
            let tmpStr = 'top:180px; font-size: 1.8em;';
            html += me.htmlCls.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
        }
        html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #FFF;'>Your browser does not support WebGL.</canvas>";

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

        let titleColor =(me.htmlCls.opts['background'] == 'black') ? me.htmlCls.GREYD : 'black';

        let html = "";

        html += "<div style='position:relative;'>";

        html += me.htmlCls.divStr + "popup' class='icn3d-text icn3d-popup'></div>";

        html += this.setReplayHtml();

        if(!me.utilsCls.isMobile()) {
            let marginLeft = me.htmlCls.WIDTH - 40 + 5;

            html += me.htmlCls.buttonStr + "fullscreen' style='position:absolute; z-index:1999; display:block; padding:0px; margin: 12px 0px 0px " + marginLeft + "px; width:30px; height:34px; border-radius:4px; border:none; background-color:#f6f6f6;' title='Full screen'>";
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

        me.htmlCls.shownMenus = me.hashUtilsCls.cloneHash(me.htmlCls.simpleMenus); 

        html += "<li><div style='position:relative; margin-top:-6px;'>" + str1;
        html += "<div class='icn3d-commandTitle' style='margin-top: 3px; white-space: nowrap;'>" + str2;

        //if(me.cfg.align !== undefined) {
            html += "<li><span id='" + me.pre + "alternate2' class='icn3d-menu-color' title='Alternate the structures'>Alternate</span>";
        //}

        html += "</ul>";

        html += "</div>";
        html += "</accordion>";
        html += "</div>";

        html += "</div>";

        //html += me.htmlCls.setMenuCls.setTools();

        // show title at the top left corner
        html += me.htmlCls.divStr + "title' class='icn3d-commandTitle' style='font-size:1.2em; font-weight:normal; position:absolute; z-index:1; float:left; display:block; margin: 12px 0px 0px 40px; color:" + titleColor + "; width:" +(me.htmlCls.WIDTH - 40).toString() + "px'></div>";
        html += me.htmlCls.divStr + "viewer' style='position:relative; width:100%; height:100%; background-color: " + me.htmlCls.GREYD + ";'>";
        // don't show legend in mobile
        //html += me.htmlCls.divStr + "legend' class='icn3d-text icn3d-legend'></div>";
        html += me.htmlCls.divStr + "mnLogSection'>";
        html += "<div style='height: " + me.htmlCls.MENU_HEIGHT + "px;'></div>";
        html += "</div>";

        if(me.cfg.mmtfid === undefined) {
            //var tmpStr =(ic.realHeight < 300) ? 'top:100px; font-size: 1.2em;' : 'top:180px; font-size: 1.8em;';
            let tmpStr = 'top:180px; font-size: 1.8em;';
            html += me.htmlCls.divStr + "wait' style='position:absolute; left:50px; " + tmpStr + " color: #444444;'>Loading data...</div>";
        }
        html += "<canvas id='" + me.pre + "canvas' style='width:100%; height: 100%; background-color: #FFF;'>Your browser does not support WebGL.</canvas>";

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

        html += me.htmlCls.divStr + "selection' style='display:none;'><div style='position:absolute; z-index:555; float:left; display:table-row; margin: 32px 0px 0px 0px;'>";
        //html += "<table style='margin-top: 3px; width:100px;'>";
        html += "<table style='margin-top: 3px; width:770px; background-color:#EEE;'>";

        html += this.setTools_base();

        // add custom buttons here
        // ...

        html += "</table>";
        html += "</div></div>";

        return html;
    }

    setButton(buttonStyle, id, title, text, color) { let me = this.icn3dui;
        if(me.bNode) return '';

        color =(color !== undefined) ? 'color:' + color : '';
        let bkgdColor = me.utilsCls.isMobile() ? ' background-color:#DDDDDD;' : '';
        return "<div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;" + bkgdColor + "' id='" + me.pre + id + "'><span style='white-space:nowrap;" + color + "' class='icn3d-commandTitle' title='" + title + "'>" + text + "</span></button></div>";
    }

    setIcon(iconType, id, title, iconStyle, url, bText, bHighlight) { let me = this.icn3dui;
        if(me.bNode) return '';

        let color = (bHighlight) ? 'color:#f8b84e; ' : 'color:#1c94c4; ';
        let bkgdColor = ' background-color:#EEE; ';
        let cssCursor = (iconType == 'text') ? '' : 'cursor:pointer;';

        //let iconHtml = '<i id="' + me.pre + id + '" class="fa fa-' + iconStyle + '" title="' + title + '" style="font-size:20px; ' + color + bkgdColor + cssCursor + cssBorder + '"></i>';
        let iconHtml;
        if(bText) {
            iconHtml = '<div id="' + me.pre + id + '" title="' + title + '" style="font-family: Arial, Helvetica, sans-serif; font-size:16px; width:16px; height:16px;' + color + bkgdColor + cssCursor + '">' + iconStyle + '</div>';
        }
        else {
            iconHtml = '<i id="' + me.pre + id + '" class="las la-' + iconStyle + '" title="' + title + '" style="width:16px; height:16px;' + color + bkgdColor + cssCursor + '"></i>';
        }

        if(iconType == 'link') {
            return '<a href="' + url + '" target="_blank">' + iconHtml + '</a>';
        }
        else {
            return iconHtml;
        }
    }

    setTools_base() { let me = this.icn3dui;
        if(me.bNode) return '';

        // second row
        let html = "<tr valign='center'>";

        let iconType = 'regular';
        let tdStr = "<td valign='top' align='center'>";
        let tdStrBorder = "<td valign='top' align='center' style='border-left: solid 1px #888888'>";

        // line-awesome: https://icons8.com/line-awesome
        // File menu
        html += tdStr + this.setIcon(iconType, 'tool_mmdbafid', 'Input PDB/MMDB/AlphaFold IDs', 'id', undefined, true) + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_pdbfile', 'Input PDB Files (appendable)', 'file-alt') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_sharelink', 'Get Share Link', 'link') + "</td>";
        html += tdStr + this.setIcon(iconType, 'saveimage', 'Save iCn3D PNG Image', 'camera') + "</td>";

        // Select menu
        html += tdStrBorder + this.setIcon(iconType, 'tool_definedsets', 'Defined Sets', 'object-group') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_aroundsphere', 'Select by Distance', 'dot-circle') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_saveselection', 'Save Selection as a Set', 'save') + "</td>";
        html += tdStr + this.setIcon(iconType, 'toggleHighlight', 'Toggle Highlight', 'highlighter') + "</td>";

        // View menu
        html += tdStrBorder + this.setIcon(iconType, 'show_selected', 'View Selection', 'eye') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_selectedcenter', 'Zoom in Selection', 'search-plus') + "</td>";
        html += tdStr + this.setIcon(iconType, 'alternate', "Alternate the Structures by keying the letter 'a'", 'a', undefined, true, true) + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_resetOrientation', 'Reset Orientation', 'undo-alt') + "</td>";

        // Style menu
        html += tdStrBorder + this.setIcon(iconType, 'tool_proteinsRibbon', 'Style Ribbon for proteins', 'dna') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_proteinsSphere', 'Style Sphere for proteins', 'volleyball-ball') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_surfaceVDW', 'Show Van der Waals Surface', 'cloud') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_bkgd', 'Toggle Background Color', 'adjust') + "</td>";

        // Color menu
        html += tdStrBorder + this.setIcon(iconType, 'tool_clrRainbowChain', 'Color Rainbow for Chains', 'rainbow') + "</td>"; 
        html += tdStr + this.setIcon(iconType, 'tool_clrSSGreen', 'Color by Secondary Structures', 'ring') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_clrChain', 'Color by Chains', 'layer-group') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_clrAtom', 'Color by Atoms', 'atom') + "</td>";

        // Analysis menu
        html += tdStrBorder + this.setIcon(iconType, 'tool_selectannotations', 'Sequences & Annotations', 'grip-lines') + "</td>";
        html += tdStr + this.setIcon(iconType, 'hbondsYes', 'Interactions', 'users') + "</td>";
        html += tdStr + this.setIcon(iconType, 'tool_delphi', 'Delphi Potentials', 'cloud-meatball') + "</td>";
        html += tdStr + this.setIcon(iconType, 'removeLabels', 'Remove Labels', 'remove-format') + "</td>";

        // Help menu
        html += tdStrBorder + this.setIcon('link', 'tool-gallery', 'Gallery', 'image', 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#gallery') + "</td>";
        html += tdStr + this.setIcon('link', 'tool-video', 'Videos', 'file-video', 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#videos') + "</td>";
        html += tdStr + this.setIcon('link', 'tool-github', 'iCn3D GitHub', 'code', 'https://github.com/ncbi/icn3d') + "</td>";
        html += tdStr + this.setIcon('link', 'tool-hints', 'Transform Hints', 'info-circle', 'https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#useicn3d') + "</td>";

        html += "</tr>";

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
            'background': bkgdColor + ' url("https://www.ncbi.nlm.nih.gov/Structure/icn3d/lib/images/' + bkgdImg + '") 50% 50% repeat-x',
            'color':'#fff',
            'font-weight':'bold'
        });

        $('.ui-button .ui-icon').css({
            'background-image': 'url(https://www.ncbi.nlm.nih.gov/Structure/icn3d/lib/images/' + iconImg + ')'
        });

        $('.ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited').css({
            'color': activeTabColor,
            'text-decoration': 'none'
        });
    }

    //Set the textarea for the log output.
    setLogWindow(bUpdate, bCmdWindowInput) { let me = this.icn3dui;
        if(me.bNode) return '';

        let bCmdWindow, html = "";

        // check comand window 
        let value = me.htmlCls.setHtmlCls.getCookie('cmdwindow');
        if(value != '') {
            bCmdWindow = (bCmdWindowInput !== undefined) ? bCmdWindowInput : parseInt(value);
            if(bCmdWindow == 1) { // default 0
                me.htmlCls.LOG_HEIGHT = 180; //65;
                me.htmlCls.CMD_HEIGHT = 0.8*me.htmlCls.LOG_HEIGHT;

                if(!bUpdate) html += me.htmlCls.divStr + "cmdlog' style='float:left; margin-top: 5px; width: 100%;'>";
                html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.htmlCls.CMD_HEIGHT + "px;  margin: auto; padding: 5px; box-sizing: border-box; border: 4px inset orange; background-color: " + me.htmlCls.GREYD + ";'></textarea>";
            }
            else {
                me.htmlCls.LOG_HEIGHT = 65;
                me.htmlCls.CMD_HEIGHT = 0.8*me.htmlCls.LOG_HEIGHT;

                if(!bUpdate) html += me.htmlCls.divStr + "cmdlog' style='float:left; margin-top: 5px; width: 100%;'>";
                html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.htmlCls.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.htmlCls.GREYD + ";'></textarea>";                 
            }
        }
        else {
            bCmdWindow = 0;

            me.htmlCls.LOG_HEIGHT = 65;
            me.htmlCls.CMD_HEIGHT = 0.8*me.htmlCls.LOG_HEIGHT;

            if(!bUpdate) html += me.htmlCls.divStr + "cmdlog' style='float:left; margin-top: 5px; width: 100%;'>";
            html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.htmlCls.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.htmlCls.GREYD + ";'></textarea>";
        }
        
        if(!bUpdate) html += "</div>";

        if(bUpdate) {
            me.htmlCls.clickMenuCls.setLogCmd('set cmdwindow ' + bCmdWindow, true);
            $("#" + me.pre + "cmdlog").html(html);
        }

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
        
        html += this.getMenuText('mn1_searchgrooup', 'Search Structure ' + me.htmlCls.wifiStr, undefined, 1, 1);
        html += "<ul>";
        html += this.getMenuUrl('mn1_searchstru', 'https://www.ncbi.nlm.nih.gov/structure', 'PDB Structures ' + me.htmlCls.wifiStr, 1, 2);
        html += this.getLink('mn1_proteinname', 'AlphaFold Structures ' + me.htmlCls.wifiStr, 1, 2);
        html += this.getMenuUrl('mn1_afdatabase', 'https://alphafold.ebi.ac.uk', 'AlphaFold UniProt Database ' + me.htmlCls.wifiStr, undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_searchsimilar', 'Search Similar' + me.htmlCls.wifiStr, undefined, undefined, 1);
        html += "<ul>";
        html += this.getLink('mn1_vastplus', 'NCBI VAST+ (PDB Complex)' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_vast', 'NCBI VAST (PDB Chain)' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_foldseek', 'Foldseek (PDB & AlphaFold)' + me.htmlCls.wifiStr, undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_retrievebyid', 'Retrieve by ID', undefined, 1, 1); 
        html += "<ul>";
        
        html += this.getLink('mn1_mmdbafid', 'PDB/MMDB/AlphaFold IDs' + me.htmlCls.wifiStr, 1, 2);
        html += this.getLink('mn1_mmdbid', 'NCBI MMDB ID (annotation) ' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_mmtfid', 'RCSB MMTF ID (fast) ' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_pdbid', 'RCSB PDB ID ' + me.htmlCls.wifiStr, undefined, 2);

        html += this.getMenuText('mn1_afwrap', 'AlphaFold Structures', undefined, undefined, 2);
        html += "<ul>";
        
        html += this.getLink('mn1_afid', 'UniProt ID ' + me.htmlCls.wifiStr, undefined, 3);
        html += this.getLink('mn1_refseqid', 'NCBI Protein Accession ' + me.htmlCls.wifiStr, undefined, 3);
        html += "</ul>";

        
        html += this.getLink('mn1_opmid', 'OPM PDB ID ' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_mmcifid', 'RCSB mmCIF ID ' + me.htmlCls.wifiStr, undefined, 2);
        //html += this.getLink('mn1_gi', 'NCBI gi ' + me.htmlCls.wifiStr, undefined, 2);

        html += this.getLink('mn1_cid', 'PubChem CID ' + me.htmlCls.wifiStr, 1, 2);
        
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_openfile', 'Open File', undefined, 1, 1);
        html += "<ul>";
//        html += this.getLink('mn1_pdbfile', 'PDB File');
//        html += this.getLink('mn1_pdbfile_app', 'PDB File (append)');
        html += this.getLink('mn1_pdbfile_app', 'PDB Files (appendable)', 1, 2);
        html += this.getLink('mn1_mmciffile', 'mmCIF File', undefined, 2);
        html += this.getLink('mn1_mol2file', 'Mol2 File', undefined, 2);
        html += this.getLink('mn1_sdffile', 'SDF File', undefined, 2);
        html += this.getLink('mn1_xyzfile', 'XYZ File', undefined, 2);
        html += this.getLink('mn1_afmapfile', 'AlphaFold PAE File', undefined, 2);

        html += this.getLink('mn1_urlfile', 'URL(CORS) ' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getMenuSep();
        html += this.getLink('mn1_pngimage', 'iCn3D PNG Image', 1, 2);
        html += this.getLink('mn1_state', 'State/Script File', undefined, 2);
        html += this.getLink('mn1_fixedversion', 'Share Link in Archived Ver. ' + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_selection', 'Selection File', undefined, 2);

        html += this.getMenuSep();

        html += this.getMenuText('mn1_dsn6wrap', 'Electron Density(DSN6)', undefined, undefined, 2);
        html += "<ul>";
        html += this.getLink('mn1_dsn6', 'Local File', undefined, 3);
        html += this.getLink('mn1_dsn6url', 'URL(CORS) ' + me.htmlCls.wifiStr, undefined, 3);
        html += "</ul>";

        html += "</ul>";
        html += "</li>";

        //html += this.getMenuText('mn1_fold', 'AlphaFold/ESM', undefined, undefined, 1);
        html += this.getMenuText('mn1_fold', 'Predict by Seq.', undefined, undefined, 1);
        html += "<ul>";
        html += this.getLink('mn1_esmfold', 'ESMFold', undefined, 2);
        //html += this.getMenuUrl('mn1_esmfold_link', "https://colab.research.google.com/github/sokrypton/ColabFold/blob/main/ESMFold.ipynb", "ESMFold via ColabFold" + me.htmlCls.wifiStr, undefined, 2);
        html += this.getLink('mn1_alphafold', 'AlphaFold2 via ColabFold' + me.htmlCls.wifiStr, undefined, 2);
        html += "</ul>";

        
        html += this.getMenuText('mn1_alignwrap', 'Align', undefined, 1, 1);
        html += "<ul>";
        
        html += this.getMenuText('mn1_chainalignwrap', 'Multiple Chains', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadio('mn1_chainalignRad', 'mn1_chainalign', 'by Structure Alignment ' + me.htmlCls.wifiStr, undefined, 1, 3);
        html += this.getRadio('mn1_chainalignRad', 'mn1_chainalign2', 'by Sequence Alignment ' + me.htmlCls.wifiStr, undefined, 1, 3);
        html += this.getRadio('mn1_chainalignRad', 'mn1_chainalign3', 'Residue by Residue', undefined, undefined, 3);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_aligntwostru', 'Protein Complexes', undefined, undefined, 2);
        html += "<ul>";
        html += this.getLink('mn1_align', 'Two PDB Structures ' + me.htmlCls.wifiStr, undefined, 3);
        html += this.getLink('mn1_alignaf', 'Two AlphaFold Structures ' + me.htmlCls.wifiStr, undefined, 3);
        html += "</ul>";

        html += this.getLink('mn1_blast_rep_id', 'Sequence to Structure', undefined, 2);

        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn2_realignWrap', 'Realign Selection', undefined, undefined, 1);
        html += "<ul>";

        html += this.getMenuText('mn2_chainrealignwrap', 'Multiple Chains', undefined, undefined, 2);
        html += "<ul>";
        html += this.getRadio('mn2_realign', 'mn2_realignonstruct', 'by Structure Alignment ' + me.htmlCls.wifiStr, undefined, undefined, 3);
        html += this.getRadio('mn2_realign', 'mn2_realignonseqalign', 'by Sequence Alignment ' + me.htmlCls.wifiStr, undefined, undefined, 3);
        html += this.getRadio('mn2_realign', 'mn2_realignresbyres', 'Residue by Residue', undefined, undefined, 3);
        html += "</ul>";

        html += this.getLink('mn2_realigntwostru', 'Protein Complexes', undefined, 2);

        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_3dpprint', '3D Printing', undefined, 1, 1);
        html += "<ul>";
        if(me.cfg.cid === undefined) {
            html += this.getLink('mn1_exportVrmlStab', 'WRL/VRML(Color, W/ Stab.)', 1, 2);
            html += this.getLink('mn1_exportStlStab', 'STL(W/ Stabilizers)', 1, 2);
            html += this.getMenuSep();
            html += this.getLink('mn1_exportVrml', 'WRL/VRML(Color)', undefined, 2);
            html += this.getLink('mn1_exportStl', 'STL', undefined, 2);

            html += this.getMenuSep();
            html += this.getLink('mn1_stabilizerYes', 'Add All Stabilizers', undefined, 2);
            html += this.getLink('mn1_stabilizerNo', 'Remove All Stabilizers', undefined, 2);
            html += this.getMenuSep();
            html += this.getLink('mn1_stabilizerOne', 'Add One Stabilizer', undefined, 2);
            html += this.getLink('mn1_stabilizerRmOne', 'Remove One Stabilizer', undefined, 2);
            html += this.getMenuSep();
            html += this.getLink('mn1_thicknessSet', 'Set Thickness', undefined, 2);
        }
        else {
            html += this.getLink('mn1_exportVrml', 'VRML(Color)', 1, 2);
            html += this.getLink('mn1_exportStl', 'STL', 1, 2);
        }

        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn1_savefile', 'Save File', undefined, 1, 1);
        html += "<ul>";
        html += this.getMenuText('mn1_savepngimage', 'iCn3D PNG Image', undefined, 1, 2);
        html += "<ul>";
        html += this.getLink('mn1_exportCanvas', 'Original Size & HTML', 1, 3);
        html += this.getLink('mn1_exportCanvas1', 'Original Size', undefined, 3);

        html += this.getLink('mn1_exportCanvas2', '2X Large', undefined, 3);
        html += this.getLink('mn1_exportCanvas4', '4X Large', undefined, 3);
        html += this.getLink('mn1_exportCanvas8', '8X Large', undefined, 3);

        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn1_exportState', 'State File', undefined, 2);
        html += this.getLink('mn1_exportSelections', 'Selection File', undefined, 2);
        html += this.getLink('mn1_exportSelDetails', 'Selection Details', undefined, 2);
        html += this.getLink('mn1_exportCounts', 'Residue Counts', undefined, 2);

        html += this.getLink('mn1_exportPdbRes', 'PDB', 1, 2);
        html += this.getLink('profixpdb', 'PDB with Missing Atoms', undefined, 2);
        html += this.getLink('profixpdbh', 'PDB with Hydrogens', undefined, 2);

        if(me.cfg.cid === undefined) {
            html += this.getLink('mn1_exportSecondary', 'Secondary Structure', undefined, 2);
        }

        //!!!
/*
        html += this.getMenuText('m1_exportrefnum', 'Reference Numbers', undefined, undefined, 2);
        html += "<ul>";
        html += this.getLink('mn1_exportIgstrand', 'Ig Strand', undefined, 3);
        html += this.getLink('mn1_exportKabat', 'Kabat', undefined, 3);
        html += this.getLink('mn1_exportImgt', 'IMGT', undefined, 3);
        html += "</ul>";
*/

        html += "<li><br/></li>";

        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn1_sharelink', 'Share Link ' + me.htmlCls.wifiStr, 1, 1);

        html += this.getLink('mn1_replayon', 'Replay Each Step', undefined, 1);

        html += this.getMenuSep();

        html += this.getMenuText('mn1_menuwrap', 'Customize Menus', undefined, 1, 1);
        html += "<ul>";
        html += this.getLink('mn1_menuall', 'All Menus', 1, 2);
        html += this.getLink('mn1_menusimple', 'Simple Menus', 1, 2);
        html += this.getMenuSep();
        html += this.getLink('mn1_menupref', 'Preferences', 1, 2);
        html += this.getLink('mn1_menuloadpref', 'Load Preferences', 1, 2);
        html += "</ul>";
        html += "</li>";

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

        html += this.getLink('mn2_definedsets', 'Defined Sets', 1, 1);
        html += this.getLink('mn2_selectall', 'All', undefined, 1);
        html += this.getLink('mn2_selectdisplayed', 'Displayed Set', undefined, 1);
        html += this.getLink('mn2_aroundsphere', 'by Distance', 1, 1);

        html += this.getMenuText('mn2_selbyprop', 'by Property', undefined, undefined, 1);
        html += "<ul>";
        html += this.getLink('mn2_propPos', 'Positive', undefined, 2);
        html += this.getLink('mn2_propNeg', 'Negative', undefined, 2);
        html += this.getLink('mn2_propHydro', 'Hydrophobic', undefined, 2);
        html += this.getLink('mn2_propPolar', 'Polar', undefined, 2);
        html += this.getLink('mn2_propBfactor', 'B-factor/pLDDT', undefined, 2);
        html += this.getLink('mn2_propSolAcc', 'Solvent Accessibility', undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn2_selectcomplement', 'Inverse', undefined, 1);
        html += this.getLink('mn2_selectmainchains', 'Main Chains', undefined, 1);
        html += this.getLink('mn2_selectsidechains', 'Side Chains', undefined, 1);
        html += this.getLink('mn2_selectmainsidechains', 'Main & Side Chains', undefined, 1);
        html += this.getLink('mn2_command', 'Advanced', undefined, 1);

        if(me.cfg.cid === undefined) {
            html += this.getMenuText('mn2_selon3d', 'Select on 3D', undefined, 1, 1);
            html += "<ul>";

            html += "<li>\"Alt\"+Click: start selection</li>";
            html += "<li>\"Ctrl\"+Click: union selection</li>";
            html += "<li>\"Shift\"+Click: range Selection</li>";
            html += this.getMenuSep();
            html += this.getRadio('mn2_pk', 'mn2_pkChain', 'Chain', undefined, 1, 2);
            if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
                html += this.getRadio('mn2_pk', 'mn2_pkDomain', '3D Domain', undefined, undefined, 2);
            }
            html += this.getRadio('mn2_pk', 'mn2_pkStrand', 'Strand/Helix', undefined, undefined, 2);
            html += this.getRadio('mn2_pk', 'mn2_pkResidue', 'Residue', true, 1, 2);
            html += this.getRadio('mn2_pk', 'mn2_pkYes', 'Atom', undefined, 1, 2);
            html += this.getRadio('mn2_pk', 'mn2_pkNo', 'None', undefined, undefined, 2);
            html += "</ul>";
            html += "</li>";
        }
        else {
            if(me.utilsCls.isMobile()) {
                html += "<li><span>Touch to pick</span></li>";
            }
            else {
                html += "<li><span>Picking with<br>\"Alt\" + Click</span></li>";
            }
        }

        html += this.getMenuSep();

        html += this.getLink('mn2_saveselection', 'Save Selection', 1, 1);
        html += this.getLink('clearall', 'Clear Selection', undefined, 1);
        html += this.getLink('mn2_saveresidue', 'Save Res. in Sel.', 1, 1);

        html += this.getMenuSep();

        html += this.getMenuText('mn2_hlcolor', 'Highlight Color', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn2_hl_clr', 'mn2_hl_clrYellow', 'Yellow', true, undefined, 2);
        html += this.getRadio('mn2_hl_clr', 'mn2_hl_clrGreen', 'Green', undefined, undefined, 2);
        html += this.getRadio('mn2_hl_clr', 'mn2_hl_clrRed', 'Red', undefined, undefined, 2);
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn2_hlstyle', 'Highlight Style', undefined, undefined, 1);
        html += "<ul>";

        html += this.getRadio('mn2_hl_style', 'mn2_hl_styleOutline', 'Outline', true, undefined, 2);
        html += this.getRadio('mn2_hl_style', 'mn2_hl_styleObject', '3D Objects', undefined, undefined, 2);

        html += "</ul>";
        html += "</li>";

        html += this.getLink('toggleHighlight2', 'Toggle Highlight', 1, 1);

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

        html += this.getLink('mn2_show_selected', 'View Selection', 1, 1);
        html += this.getLink('mn2_hide_selected', 'Hide Selection', 1, 1);
        html += this.getLink('mn2_selectedcenter', 'Zoom in Selection', 1, 1);
        //html += this.getLink('mn6_center', 'Center Selection', undefined, 1);
        html += this.getLink('mn6_center', 'Center Selection', 1, 1);
        html += this.getLink('mn2_fullstru', 'View Full Structure');
        html += this.getLinkWrapper('mn2_alternate', 'Alternate(Key "a")', 'mn2_alternateWrap', undefined, 1)

        if(me.cfg.opmid !== undefined) {
            html += this.getLinkWrapper('togglemem', 'Toggle Membrane', 'togglememli', undefined, 1)
        }
        //else if(me.cfg.mmdbafid !== undefined || me.cfg.afid !== undefined) {
        else if(me.cfg.cid === undefined) {
            // hide by default
            html += this.getLinkWrapper('togglemem', 'Toggle Membrane', 'togglememli', undefined, 1, true)
        }

        if(me.cfg.opmid !== undefined) {
            html += this.getLinkWrapper('adjustmem', 'Adjust Membrane', 'adjustmemli', undefined, 1)
            html += this.getLinkWrapper('selectplane', 'Select between<br>Two X-Y Planes</span>', 'selectplaneli', undefined, 1)
        }

        html += this.getMenuSep();

        let liStr = "<li><a href='";

        html += this.getMenuText('mn2_vrarhints', 'VR & AR Hints', undefined, 1, 1);
        html += "<ul>";
        html += this.getMenuUrl("vrhint", me.htmlCls.baseUrl + "icn3d/icn3d.html#vr", "VR: VR Headsets", 1, 2);
        html += this.getMenuUrl("arhint", me.htmlCls.baseUrl + "icn3d/icn3d.html#ar", "AR: Chrome in Android", 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn6_sidebyside', 'Side by Side', 1, 1);

        html += this.getMenuText('mn2_rotate', 'Rotate', undefined, 1, 1);
        html += "<ul>";

        html += this.getMenuText('mn2_rotate90', 'Rotate 90&deg;', undefined, undefined, 2);
        html += "<ul>";
        html += this.getRadio('mn6_rotate90', 'mn6_rotatex', 'rotate x', undefined, undefined, 2);
        html += this.getRadio('mn6_rotate90', 'mn6_rotatey', 'rotate y', undefined, undefined, 2);
        html += this.getRadio('mn6_rotate90', 'mn6_rotatez', 'rotate z', undefined, undefined, 2);
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn2_rotateauto', 'Auto Rotation', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadio('mn6_rotate', 'mn6_rotateleft', 'Rotate Left', undefined, 1, 3);
        html += this.getRadio('mn6_rotate', 'mn6_rotateright', 'Rotate Right', undefined, 1, 3);
        html += this.getRadio('mn6_rotate', 'mn6_rotateup', 'Rotate Up', undefined, 1, 3);
        html += this.getRadio('mn6_rotate', 'mn6_rotatedown', 'Rotate Down', undefined, 1, 3);
        html += "</ul>";
        html += "</li>";

        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn2_camera', 'Camera', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn6_camera', 'mn6_cameraPers', 'Perspective', true, undefined, 2);
        html += this.getRadio('mn6_camera', 'mn6_cameraOrth', 'Orthographic', undefined, undefined, 2);
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn2_fog', 'Fog for Selection', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn6_showfog', 'mn6_showfogYes', 'On', undefined, undefined, 2);
        html += this.getRadio('mn6_showfog', 'mn6_showfogNo', 'Off', true, undefined, 2);
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn2_slab', 'Slab for Selection', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn6_showslab', 'mn6_showslabYes', 'On', undefined, undefined, 2);
        html += this.getRadio('mn6_showslab', 'mn6_showslabNo', 'Off', true, undefined, 2);
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn2_axes', 'XYZ-axes', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn6_showaxis', 'mn6_showaxisYes', 'Original', undefined, undefined, 2);
        html += this.getRadio('mn6_showaxis', 'mn6_showaxisSel', 'Prin. Axes on Sel.', undefined, undefined, 2);
        html += this.getRadio('mn6_showaxis', 'mn6_showaxisNo', 'Hide', true, undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuSep();

        html += this.getMenuText('mn2_resetwrap', 'Reset', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn6_reset', 'reset', 'All', undefined, 1, 2);
        html += this.getRadio('mn6_reset', 'mn6_resetOrientation', 'Orientation', undefined, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn6_back', 'Undo', undefined, 1);
        html += this.getLink('mn6_forward', 'Redo', undefined, 1);

        html += this.getLink('mn6_fullscreen', 'Full Screen', undefined, 1);
    //    html += this.getLink('mn6_exitfullscreen', 'Exit Full Screen');

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
            html += this.getMenuText('mn3_proteinwrap', 'Proteins', undefined, 1, 1);
            html += "<ul>";
            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
                html += this.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon', undefined, 1, 2);
            }
            else {
                html += this.getRadio('mn3_proteins', 'mn3_proteinsRibbon', 'Ribbon', true, 1, 2);
            }

            html += this.getRadio('mn3_proteins', 'mn3_proteinsStrand', 'Strand', undefined, undefined, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsCylinder', 'Cylinder and Plate', undefined, undefined, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsSchematic', 'Schematic', undefined, 1, 2);

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
                html += this.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace', true, 1, 2);
            }
            else {
                html += this.getRadio('mn3_proteins', 'mn3_proteinsCalpha', 'C Alpha Trace', undefined, 1, 2);
            }

            html += this.getRadio('mn3_proteins', 'mn3_proteinsBackbone', 'Backbone', undefined, undefined, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsBfactor', 'B-factor Tube', undefined, 1, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsLines', 'Lines', undefined, 1, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsStick', 'Stick', undefined, 1, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsBallstick', 'Ball and Stick', undefined, 1, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsSphere', 'Sphere', undefined, 1, 2);
            html += this.getRadio('mn3_proteins', 'mn3_proteinsNo', 'Hide', undefined, 1, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn3_sidecwrap', 'Side Chains', undefined, 1, 1);
            html += "<ul>";

            html += this.getRadio('mn3_sidec', 'mn3_sidecLines', 'Lines', undefined, 1, 2);
            html += this.getRadio('mn3_sidec', 'mn3_sidecStick', 'Stick', undefined, 1, 2);
            html += this.getRadio('mn3_sidec', 'mn3_sidecBallstick', 'Ball and Stick', undefined, 1, 2);
            html += this.getRadio('mn3_sidec', 'mn3_sidecSphere', 'Sphere', undefined, 1, 2);
            html += this.getRadio('mn3_sidec', 'mn3_sidecNo', 'Hide', true, 1, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn3_nuclwrap', 'Nucleotides', undefined, 1, 1);
            html += "<ul>";
            html += this.getRadio('mn3_nucl', 'mn3_nuclCartoon', 'Cartoon', true, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclPhos', "O3' Trace", undefined, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclBackbone', 'Backbone', undefined, undefined, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclSchematic', 'Schematic', undefined, 1, 2)
            html += this.getRadio('mn3_nucl', 'mn3_nuclLines', 'Lines', undefined, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclStick', 'Stick', undefined, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclBallstick', 'Ball and Stick', undefined, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclSphere', 'Sphere', undefined, 1, 2);
            html += this.getRadio('mn3_nucl', 'mn3_nuclNo', 'Hide', undefined, 1, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn3_ntbasewrap', 'Nucl. Bases', undefined, 1, 1);
            html += "<ul>";

            html += this.getRadio('mn3_ntbase', 'mn3_ntbaseLines', 'Lines', undefined, 1, 2);
            html += this.getRadio('mn3_ntbase', 'mn3_ntbaseStick', 'Stick', undefined, 1, 2);
            html += this.getRadio('mn3_ntbase', 'mn3_ntbaseBallstick', 'Ball and Stick', undefined, 1, 2);
            html += this.getRadio('mn3_ntbase', 'mn3_ntbaseSphere', 'Sphere', undefined, 1, 2);
            html += this.getRadio('mn3_ntbase', 'mn3_ntbaseNo', 'Hide', true, 1, 2);
            html += "</ul>";
            html += "</li>";
        }

        html += this.getMenuText('mn3_ligwrap', 'Chemicals', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn3_lig', 'mn3_ligLines', 'Lines', undefined, 1, 2);
        if(me.cfg.cid === undefined) {
            html += this.getRadio('mn3_lig', 'mn3_ligStick', 'Stick', true, 1, 2);
            html += this.getRadio('mn3_lig', 'mn3_ligBallstick', 'Ball and Stick', undefined, 1, 2);
        }
        else {
            html += this.getRadio('mn3_lig', 'mn3_ligStick', 'Stick', undefined, 1, 2);
            html += this.getRadio('mn3_lig', 'mn3_ligBallstick', 'BalHydrogensl and Stick', true, 1, 2);
        }
        html += this.getRadio('mn3_lig', 'mn3_ligSchematic', 'Schematic', undefined, 1, 2);
        html += this.getRadio('mn3_lig', 'mn3_ligSphere', 'Sphere', undefined, 1, 2);
        html += this.getRadio('mn3_lig', 'mn3_ligNo', 'Hide', undefined, 1, 2);
        html += "</ul>";
        html += "</li>";

        //if(me.cfg.cid !== undefined) {
            html += this.getMenuText('mn3_hydrogenswrap', 'Hydrogens', undefined, 1, 1);
            html += "<ul>";
            html += this.getRadio('mn3_hydrogens', 'mn3_hydrogensYes', 'Show', true, 1, 2);
            html += this.getRadio('mn3_hydrogens', 'mn3_hydrogensNo', 'Hide', undefined, 1, 2);
            html += "</ul>";
            html += "</li>";
        //}

        if(me.cfg.cid === undefined) {
            html += this.getMenuText('mn3_glycanwrap', 'Glycans', undefined, undefined, 1);
            html += "<ul>";
            html += this.getRadio('mn3_glycansCart', 'mn3_glycansCartYes', 'Show Cartoon', undefined, undefined, 2);
            html += this.getRadio('mn3_glycansCart', 'mn3_glycansCartNo', 'Hide Cartoon', true, undefined, 2);
            html += "</ul>";
            html += "</li>";
        }

        html += this.getMenuText('mn3_ionswrap', 'Ions', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn3_ions', 'mn3_ionsSphere', 'Sphere', true, 1, 2);
        html += this.getRadio('mn3_ions', 'mn3_ionsDot', 'Dot', undefined, 1, 2);
        html += this.getRadio('mn3_ions', 'mn3_ionsNo', 'Hide', undefined, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn3_waterwrap', 'Water', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn3_water', 'mn3_waterSphere', 'Sphere', undefined, 1, 2);
        html += this.getRadio('mn3_water', 'mn3_waterDot', 'Dot', undefined, 1, 2);
        html += this.getRadio('mn3_water', 'mn3_waterNo', 'Hide', true, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn3_setThickness', 'Preferences', undefined, 1);

        html += this.getMenuSep();
        html += this.getLink('mn3_styleSave', 'Save Style', undefined, 2);
        html += this.getLink('mn3_styleApplySave', 'Apply Saved Style', undefined, 2);

        html += this.getMenuSep();

        html += this.getMenuText('mn5_surfacewrap', 'Surface Type', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn5_surface', 'mn5_surfaceVDW', 'Van der Waals', undefined, 1, 2);
        html += this.getRadio('mn5_surface', 'mn5_surfaceVDWContext', 'VDW with Context', undefined, undefined, 2);
        html += this.getRadio('mn5_surface', 'mn5_surfaceMolecular', 'Molecular Surface', undefined, 1, 2);
        html += this.getRadio('mn5_surface', 'mn5_surfaceMolecularContext', 'MS with Context', undefined, undefined, 2);
        html += this.getRadio('mn5_surface', 'mn5_surfaceSAS', 'Solvent Accessible', undefined, 1, 2);
        html += this.getRadio('mn5_surface', 'mn5_surfaceSASContext', 'SA with Context', undefined, undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn5_surfaceNo', 'Remove Surface', 1, 1);

        html += this.getMenuText('mn5_surfaceop', 'Surface Opacity', undefined, 1, 1);
        html += "<ul>";

        html += this.getMenuText('mn5_surfaceopfast', 'Fast Transparency', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadio('mn5_opacity', 'mn5_opacity10', '1.0', true, 1, 3);

        for(let i = 9; i > 0; --i) {
            html += this.getRadio('mn5_opacity', 'mn5_opacity0' + i, '0.' + i, 1, 3);
        }
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn5_surfaceopslow', 'Slow Transparency', undefined, undefined, 2);
        html += "<ul>";
        html += this.getRadio('mn5_opacityslow', 'mn5_opacityslow10', '1.0', true, undefined, 3);

        for(let i = 9; i > 0; --i) {
            html += this.getRadio('mn5_opacityslow', 'mn5_opacityslow0' + i, '0.' + i, undefined, undefined, 3);
        }
        html += "</ul>";
        html += "</li>";

        html += "</ul>"; // end of Surface Opacity

        html += this.getMenuText('mn5_wireframewrap', 'Surface Wireframe', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn5_wireframe', 'mn5_wireframeYes', 'Yes', undefined, 1, 2);
        html += this.getRadio('mn5_wireframe', 'mn5_wireframeNo', 'No', true, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuSep();

        html += this.getLink('mn5_cartoonshape', 'Cartoon for a Set', undefined, 1);
        html += this.getLink('mn5_linebtwsets', 'Line btw. Two Sets', undefined, 1);

        if(me.cfg.cid === undefined && me.cfg.align === undefined && me.cfg.chainalign === undefined && me.cfg.mmdbaf === undefined) {
            html += this.getMenuSep();

            html += this.getLinkWrapper2('mn5_map', 'Electron Density', 'mapWrapper1', undefined, 1);

            html += "<ul>";
            html += this.getLink('mn5_elecmap2fofc', '2Fo-Fc Map', undefined, 2);
            html += this.getLink('mn5_elecmapfofc', 'Fo-Fc Map', undefined, 2);
            html += this.getLinkWrapper('mn5_elecmapNo', 'Remove Map', 'mapWrapper2', undefined, 2);

            html += "</ul>";
            html += "</li>";

            html += this.getLinkWrapper2('mn5_map3', 'Map Wireframe', 'mapWrapper3', undefined, 1);
            
            html += "<ul>";
            html += this.getRadio('mn5_mapwireframe', 'mn5_mapwireframeYes', 'Yes', true, undefined, 2);
            html += this.getRadio('mn5_mapwireframe', 'mn5_mapwireframeNo', 'No', undefined, undefined, 2);
            html += "</ul>";
            html += "</li>";

            if(me.cfg.mmtfid === undefined) {
                html += this.getLinkWrapper('mn5_emmap', 'EM Density Map', 'emmapWrapper1', undefined, 1);
                html += this.getLinkWrapper('mn5_emmapNo', 'Remove EM Map', 'emmapWrapper2', undefined, 1);

                html += this.getLinkWrapper2('mn5_emmap3', 'EM Map Wireframe', 'emmapWrapper3', undefined, 1);
                html += "<ul>";
                html += this.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeYes', 'Yes', true, undefined, 2);
                html += this.getRadio('mn5_emmapwireframe', 'mn5_emmapwireframeNo', 'No', undefined, undefined, 2);
                html += "</ul>";
                html += "</li>";
            }
        }

        html += this.getMenuSep();

        html += this.getMenuText('mn6_bkgdwrap', 'Background', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn6_bkgd', 'mn6_bkgdTransparent', 'Transparent', undefined, 1, 2);
        html += this.getRadio('mn6_bkgd', 'mn6_bkgdBlack', 'Black', true, 1, 2);
        html += this.getRadio('mn6_bkgd', 'mn6_bkgdGrey', 'Gray', undefined, 1, 2);
        html += this.getRadio('mn6_bkgd', 'mn6_bkgdWhite', 'White', undefined, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn6_themewrap', 'Dialog Color', undefined, undefined, 1);
        html += "<ul>";
        html += this.getRadio('mn6_theme', 'mn6_themeBlue', 'Blue', true, undefined, 2);
        html += this.getRadio('mn6_theme', 'mn6_themeOrange', 'Orange', undefined, undefined, 2);
        html += this.getRadio('mn6_theme', 'mn6_themeBlack', 'Black', undefined, undefined, 2);
        html += "</ul>";
        html += "</li>";

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

        html += this.getMenuText('mn4_clrwrap', 'Unicolor', 'icn3d-menupd', 1, 1);
        html += "<ul>";

        html += this.getMenuText('uniclrRedwrap', 'Red', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrRed1', 'Red', 'F00', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed2', 'Indian Red', 'CD5C5C', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed3', 'Light Coral', 'F08080', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed4', 'Salmon', 'FA8072', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed5', 'Dark Salmon', 'E9967A', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed6', 'Light Salmon', 'FFA07A', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed7', 'Crimson', 'DC143C', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed8', 'Fire Brick', 'B22222', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrRed9', 'Dark Red', '8B0000', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrPinkwrap', 'Pink', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrPink1', 'Pink', 'FFC0CB', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrPink2', 'Light Pink', 'FFB6C1', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrPink3', 'Hot Pink', 'FF69B4', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrPink4', 'Deep Pink', 'FF1493', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrPink5', 'Medium Violet Red', 'C71585', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrPink6', 'Pale Violet Red', 'DB7093', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrOrangewrap', 'Orange', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrOran1', 'Orange', 'FFA500', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrOran2', 'Dark Orange', 'FF8C00', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrOran3', 'Orange Red', 'FF4500', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrOran4', 'Tomato', 'FF6347', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrOran5', 'Coral', 'FF7F50', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrOran6', 'Light Salmon', 'FFA07A', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrYellowwrap', 'Yellow', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrYllw1', 'Yellow', 'FF0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw2', 'Gold', 'FFD700', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw3', 'Light Yellow', 'FFFFE0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw4', 'Lemon Chiffon', 'FFFACD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw5', 'Light Golden Rod', 'FAFAD2', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw6', 'Papaya Whip', 'FFEFD5', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw7', 'Moccasin', 'FFE4B5', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw8', 'Peach Puff', 'FFDAB9', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw9', 'Pale Golden Rod', 'EEE8AA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw10', 'Khaki', 'F0E68C', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrYllw11', 'Dark Khaki', 'BDB76B', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrMagentawrap', 'Magenta', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrMgnt1', 'Magenta', 'F0F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt2', 'Orchid', 'DA70D6', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt3', 'Violet', 'EE82EE', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt4', 'Plum', 'DDA0DD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt5', 'Thistle', 'D8BFD8', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt6', 'Lavender', 'E6E6FA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt7', 'Medium Orchid', 'BA55D3', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt8', 'Medium Purple', '9370DB', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt9', 'Rebecca Purple', '663399', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt10', 'Blue Violet', '8A2BE2', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt11', 'Dark Violet', '9400D3', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt12', 'Dark Orchid', '9932CC', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt13', 'Dark Magenta', '8B008B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt14', 'Purple', '800080', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt15', 'Indigo', '4B0082', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt16', 'Slat Blue', '6A5ACD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt17', 'Dark Slate Blue', '483D8B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrMgnt18', 'Medium Slat Blue', '6A5ACD', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrGreenwrap', 'Green', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrGrn1', 'Green', '0F0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn2', 'Dark Green', '006400', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn3', 'Yellow Green', '9ACD32', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn4', 'Olive Drab', '6B8E23', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn5', 'Olive', '808000', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn6', 'Dark Olive Green', '556B2F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn7', 'Medium Aquamarine', '66CDAA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn8', 'Dark Sea Green', '8FBC8B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn9', 'Lignt Sea Green', '20B2AA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn10', 'Dark Cyan', '008B8B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn11', 'Teal', '008080', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn12', 'Forest Green', '228B22', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn13', 'Sea Green', '2E8B57', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn14', 'Medium Sea Green', '3CB371', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn15', 'Spring Green', '00FF7F', undefined, 1, 3);
        //html += this.getRadClr('mn4_clr', 'uniclrGrn16', 'Medium Spring Green', '00FA9A', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn16', 'Medium Spring', '00FA9A', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn17', 'Light Green', '90EE90', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn18', 'Pale Green', '98FB98', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn19', 'Lime Green', '32CD32', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn20', 'Lawn Green', '7CFC00', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn21', 'Chartreuse', '7FFF00', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGrn22', 'Green Yellow', 'ADFF2F', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrCyanwrap', 'Cyan', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrCyan1', 'Cyan', '0FF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan2', 'Light Cyan', 'E0FFFF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan3', 'Pale Turquoise', 'AFEEEE', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan4', 'Aquamarine', '7FFFD4', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan5', 'Turquoise', '40E0D0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan6', 'Medium Turquoise', '48D1CC', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrCyan7', 'Dark Turquoise', '00CED1', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrBluewrap', 'Blue', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrBlue1', 'Blue', '00F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue2', 'Medium Blue', '0000CD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue3', 'Dark Blue', '00008B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue4', 'Navy', '000080', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue5', 'Midnight Blue', '191970', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue6', 'Royal Blue', '4169E1', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue7', 'Medium Slate Blue', '7B68EE', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue8', 'Corn Flower Blue', '6495ED', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue9', 'Dodger Blue', '1E90FF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue10', 'Deep Sky Blue', '00BFFF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue11', 'Light Sky Blue', '87CEFA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue12', 'Sky Blue', '87CEEB', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue13', 'Light Blue', 'ADD8E6', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue14', 'Powder Blue', 'B0E0E6', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue15', 'Light Steel Blue', 'B0C4DE', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue16', 'Steel Blue', '4682B4', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBlue17', 'Cadet Blue', '5F9EA0', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrBrownwrap', 'Brown', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrBrown1', 'Brown', 'A52A2A', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown2', 'Maroon', '800000', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown3', 'Sienna', 'A0522D', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown4', 'Saddle Brown', '8B4513', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown5', 'Chocolate', 'D2691E', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown6', 'Peru', 'CD853F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown7', 'Dark Golden Rod', 'B8860B', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown8', 'Golden Rod', 'DAA520', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown9', 'Sandy Brown', 'F4A460', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown10', 'Rosy Brown', 'BC8F8F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown11', 'Tan', 'D2B48C', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown12', 'Burlywood', 'DEB887', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown13', 'Wheat', 'F5DEB3', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown14', 'Navajo White', 'FFDEAD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown15', 'Bisque', 'FFE4C4', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown16', 'Blanched Almond', 'FFEBCD', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrBrown17', 'Corn Silk', 'FFF8DC', undefined, 1, 3);
        html += "</ul>";

        //html += "<li><span>White</span>";
        html += this.getMenuText('uniclrWhitewrap', 'White', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrWhite1', 'White', 'FFF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite2', 'Snow', 'FFFAFA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite3', 'Honey Dew', 'F0FFF0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite4', 'Mint Cream', 'F5FFFA', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite5', 'Azure', 'F0FFFF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite6', 'Alice Blue', 'F0F8FF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite7', 'Ghost White', 'F8F8FF', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite8', 'White Smoke', 'F5F5F5', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite9', 'Sea Shell', 'FFF5EE', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite10', 'Beige', 'F5F5DC', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite11', 'Old Lace', 'FDF5E6', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite12', 'Floral White', 'FFFAF0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite13', 'Ivory', 'FFFFF0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite14', 'Antique White', 'FAEBD7', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite15', 'Linen', 'FAF0E6', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite16', 'Lavenderblush', 'FFF0F5', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrWhite17', 'Misty Rose', 'FFE4E1', undefined, 1, 3);
        html += "</ul>";

        html += this.getMenuText('uniclrGraywrap', 'Gray', undefined, 1, 2);
        html += "<ul>";
        html += this.getRadClr('mn4_clr', 'uniclrGray1', 'Gray', '808080', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray2', 'Dim Gray', '696969', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray3', 'Light Slate Gray', '778899', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray4', 'Slate Gray', '708090', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray5', 'Dark Slate Gray', '2F4F4F', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray6', 'Black', '000000', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray7', 'Dark Gray', 'A9A9A9', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray8', 'Silver', 'C0C0C0', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray9', 'Light Gray', 'D3D3D3', undefined, 1, 3);
        html += this.getRadClr('mn4_clr', 'uniclrGray10', 'Gainsboro', 'DCDCDC', undefined, 1, 3);
        html += "</ul>";

        html += "</ul>";

        html += this.getRadio('mn4_clr', 'mn4_clrCustom', 'Color Picker', undefined, undefined, 1);
        html += this.getMenuSep();

        if(me.cfg.cid === undefined) {
            html += this.getMenuText('mn4_clrRainbowwrap', 'Rainbow (R-V)', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrRainbow', 'for Selection', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrRainbowChain', 'for Chains', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrRainbowSets', 'for Sets', undefined, undefined, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrRainbowAcrossSets', 'across Sets', undefined, undefined, 2);
            html += "</ul>";

            html += this.getMenuText('mn4_clrSpectrumwrap', 'Spectrum (V-R)', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrSpectrum', 'for Selection', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrSpectrumChain', 'for Chains', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrSpectrumSets', 'for Sets', undefined, undefined, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrSpectrumAcrossSets', 'across Sets', undefined, undefined, 2);
            html += "</ul>";

            html += this.getMenuText('mn4_clrSSwrap', 'Secondary', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrSSGreen', 'Sheet in Green', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrSSYellow', 'Sheet in Yellow', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrSSSpectrum', 'Spectrum', undefined, undefined, 2);
            html += "</ul>";

            html += this.getRadio('mn4_clr', 'mn4_clrCharge', 'Charge', undefined, 1, 1);

            html += this.getMenuText('mn4_hydrophobicwrap', 'Hydrophobicity', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrNormalizedHP', 'Normalized', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrHydrophobic', 'Wimley-White', undefined, undefined, 2);
            html += "</ul>";

            html += this.getMenuText('mn4_clrBfactorwrap', 'B-factor', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrBfactor', 'Original', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrBfactorNorm', 'Percentile', undefined, 1, 2);
            html += "</ul>";

            html += this.getRadio('mn4_clr', 'mn4_clrArea', 'Solvent<br><span style="padding-left:1.5em;">Accessibility</span>', undefined, undefined, 1);

            html += this.getRadio('mn4_clr', 'mn4_clrStructure', 'Structure', undefined, 1, 1);

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.cfg.blast_rep_id !== undefined) {
                html += this.getRadio('mn4_clr', 'mn4_clrChain', 'Chain', undefined, 1, 1);
            }
            else {
                html += this.getRadio('mn4_clr', 'mn4_clrChain', 'Chain', true, 1, 1);
            }

            //if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
              html += this.getRadio('mn4_clr', 'mn4_clrdomain', '3D Domain', undefined, undefined, 1);
            //}

            if(me.cfg.cid === undefined) {
                html += this.getMenuText('mn4_clrsetswrap', 'Defined Sets', 'icn3d-menupd', undefined, 1);
                html += "<ul>";
                html += this.getRadio('mn4_clr', 'mn4_clrsets', 'Rainbow for Selected Sets<br><span style="padding-left:1.5em;">in "Analysis > Defined Sets"</span>', undefined, undefined, 2);
                html += "</ul>";
                html += "</li>";
            }

            html += this.getMenuText('mn4_clrResiduewrap', 'Residue', 'icn3d-menupd', 1, 1);
            html += "<ul>";
            html += this.getRadio('mn4_clr', 'mn4_clrResidue', 'Default', undefined, 1, 2);
            html += this.getRadio('mn4_clr', 'mn4_clrResidueCustom', 'Custom', undefined, undefined, 2);
            html += "</ul>";

            html += this.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom', undefined, 1, 1);

            if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
              html += this.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity', true, undefined, 2);
              html += this.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation', undefined, undefined, 2);
            }
            else if(me.cfg.blast_rep_id !== undefined) {
              html += this.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity', undefined, undefined, 2);
              html += this.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation', true, undefined, 2);
            }
            else {
              html += this.getRadio('mn4_clr', 'mn4_clrIdentity', 'Identity', undefined, undefined, 2);
              html += this.getRadio('mn4_clr', 'mn4_clrConserved', 'Conservation', undefined, undefined, 2);
            }

            //if(me.cfg.afid) html += this.getRadio('mn4_clr', 'mn4_clrConfidence', 'AF Confidence');
            //if(!me.cfg.mmtfid && !me.cfg.pdbid && !me.cfg.opmid && !me.cfg.mmdbid && !me.cfg.gi && !me.cfg.uniprotid && !me.cfg.blast_rep_id && !me.cfg.cid && !me.cfg.mmcifid && !me.cfg.align && !me.cfg.chainalign) {
                html += this.getRadio('mn4_clr', 'mn4_clrConfidence', 'AlphaFold<br><span style="padding-left:1.5em;">Confidence</span>', undefined, 1, 1);
            //}

            //!!!
            //html += this.getRadio('mn4_clr', 'mn4_clrIgstrand', 'Ig Strand', undefined, undefined, 2);
            //html += this.getRadio('mn4_clr', 'mn4_clrIgproto', 'Ig Protodomain', undefined, undefined, 2);
        }
        else {
            //if(!me.cfg.hidelicense) html += this.getRadio('mn4_clr', 'mn1_delphi2', 'DelPhi<br><span style="padding-left:1.5em;">Potential ' + me.htmlCls.licenseStr + '</span>');
            html += this.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom', true, 1, 1);
        }

        html += this.getMenuSep();

        html += this.getLink('mn4_clrSave', 'Save Color', undefined, 1);
        html += this.getLink('mn4_clrApplySave', 'Apply Saved Color', undefined, 1);

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
            html += this.getLink('mn6_selectannotations', 'Seq. & Annotations ' + me.htmlCls.wifiStr, 1, 1);

            //if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) { // || ic.bRealign || ic.bSymd || ic.bInputfile) {
                html += this.getLink('mn2_alignment', 'Aligned Seq. ' + me.htmlCls.wifiStr, undefined, 1);
            //}

            if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined || me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
              html += this.getLink('mn2_2ddgm', '2D Diagram ' + me.htmlCls.wifiStr, 1, 1);
            }

            html += this.getMenuText('2dctnwrap', '2D Cartoon', undefined, undefined, 1);
            html += "<ul>";
            html += this.getLink('2dctn_chain', 'Chain Level', undefined, 2);
            html += this.getLink('2dctn_domain', 'Domain Level', undefined, 2);
            html += this.getLink('2dctn_secondary', 'Helix/Sheet Level', undefined, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getLink('definedsets2', 'Defined Sets', 1, 1);

            html += this.getMenuSep();

            html += this.getLink('mn6_hbondsYes', 'Interactions', 1, 1);

            html += this.getMenuText('mn1_window', 'Bring to Front', undefined, undefined, 1);
            html += "<ul>";
            html += this.getLink('mn1_window_table', 'Interaction Table', undefined, 2);
            html += this.getLink('mn1_window_linegraph', '2D Interaction Network', undefined, 2);
            html += this.getLink('mn1_window_scatterplot', '2D Interaction Map', undefined, 2);
            html += this.getLink('mn1_window_graph', '2D Graph(Force-Directed)', undefined, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getLink('mn6_contactmap', 'Contact Map', undefined, 1);

            //if(!me.cfg.notebook) {
                html += this.getLink('mn1_mutation', 'Mutation ' + me.htmlCls.wifiStr, 1, 1);
            //}

            //html += this.getMenuSep();
        }

        //if(!me.cfg.notebook && !me.cfg.hidelicense) {
        if(!me.cfg.hidelicense) {
            html += this.getMenuText('mn1_delphiwrap', 'DelPhi Potential', undefined, 1, 1);

            html += "<ul>";       
                html += this.getLink('mn1_delphi', 'DelPhi Potential ' + me.htmlCls.licenseStr, 1, 2);    

                html += this.getMenuText('mn1_phiwrap', 'Load PQR/Phi', undefined, undefined, 2);
                html += "<ul>";
                html += this.getLink('mn1_phi', 'Local PQR/Phi/Cube File', undefined, 3);
                html += this.getLink('mn1_phiurl', 'URL PQR/Phi/Cube File', undefined, 3);
                html += "</ul>";
                html += "</li>";
                html += this.getLink('delphipqr', 'Download PQR', undefined, 2);
            html += "</ul>";
            html += "</li>";

            //html += this.getMenuSep();
        }

        html += this.getMenuSep();

        html += this.getMenuText('mn6_distancewrap', 'Distance', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn6_distance', 'mn6_distanceYes', 'between Two Atoms', undefined, 1, 2);
        html += this.getRadio('mn6_distance', 'mn6_distTwoSets', 'between Two Sets', undefined, undefined, 2);
        html += this.getRadio('mn6_distance', 'mn6_distManySets', 'Among Many Sets', undefined, undefined, 2);
        html += this.getRadio('mn6_distance', 'mn6_distanceNo', 'Hide', true, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getLink('mn6_area', 'Surface Area', 1, 1);

        html += this.getMenuText('mn6_addlabelwrap', 'Label', undefined, 1, 1);
        html += "<ul>";
        html += this.getRadio('mn6_addlabel', 'mn6_addlabelYes', 'by Picking Atoms', undefined, undefined, 2);
        html += this.getRadio('mn6_addlabel', 'mn6_addlabelSelection', 'per Selection', undefined, undefined, 2);
        html += this.getRadio('mn6_addlabel', 'mn6_addlabelAtoms', 'per Atom', undefined, undefined, 2);
        html += this.getRadio('mn6_addlabel', 'mn6_addlabelElements', 'per Atom Element', undefined, 1, 2);
        if(me.cfg.cid === undefined) {
            html += this.getRadio('mn6_addlabel', 'mn6_addlabelResidues', 'per Residue', undefined, 1, 2);
            html += this.getRadio('mn6_addlabel', 'mn6_addlabelResnum', 'per Residue & Number', undefined, 1, 2);
            //!!!
            //html += this.getRadio('mn6_addlabel', 'mn6_addlabelRefnum', 'per Reference Number', undefined, 1, 2);
            html += this.getRadio('mn6_addlabel', 'mn6_addlabelChains', 'per Chain', undefined, undefined, 2);
            html += this.getRadio('mn6_addlabel', 'mn6_addlabelTermini', 'N- & C-Termini', undefined, 1, 2);
        }

        html += this.getMenuSep();
        html += this.getRadio('mn6_addlabel', 'mn6_labelColor', 'Change Label Color', undefined, 1, 2);
        html += this.getRadio('mn6_addlabel', 'mn6_addlabelNo', 'Remove', true, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('labelscalewrap', 'Label Scale', undefined, 1, 1);
        html += "<ul>";

        for(let i = 1; i <= 4; ++i) {
            let twoi = 2 * i;
            html += this.getRadio('mn6_labelscale', 'mn6_labelscale0' + twoi, '0.' + twoi, undefined, 1, 2);
        }

        for(let i = 1; i <= 5; ++i) {
            if(i == 1) {
                html += this.getRadio('mn6_labelscale', 'mn6_labelscale' + i + '0', i + '.0', true, 1, 2);
            }
            else {
                html += this.getRadio('mn6_labelscale', 'mn6_labelscale' + i + '0', i + '.0', undefined, 1, 2);
            }
        }

        html += "</ul>";
        html += "</li>";

        html += this.getMenuSep();

        if(me.cfg.cid === undefined) {
            html += this.getMenuText('mn6_chemicalbindingwrap', 'Chem. Binding', undefined, undefined, 1);
            html += "<ul>";
            html += this.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindingshow', 'Show', undefined, undefined, 2);
            html += this.getRadio('mn6_chemicalbinding', 'mn6_chemicalbindinghide', 'Hide', true, undefined, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn6_ssbondswrap', 'Disulfide Bonds', undefined, 1, 1);
            html += "<ul>";
            html += this.getRadio('mn6_ssbonds', 'mn6_ssbondsYes', 'Show', true, 1, 2);
            html += this.getRadio('mn6_ssbonds', 'mn6_ssbondsExport', 'Export Pairs', undefined, undefined, 2);
            html += this.getRadio('mn6_ssbonds', 'mn6_ssbondsNo', 'Hide', undefined, 1, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn6_clbondswrap', 'Cross-Linkages', undefined, undefined, 1);
            html += "<ul>";
            html += this.getRadio('mn6_clbonds', 'mn6_clbondsYes', 'Show', true, undefined, 2);
            html += this.getRadio('mn6_clbonds', 'mn6_clbondsExport', 'Export Pairs', undefined, undefined, 2);
            html += this.getRadio('mn6_clbonds', 'mn6_clbondsNo', 'Hide', undefined, undefined, 2);
            html += "</ul>";
            html += "</li>";

            let bOnePdb = me.cfg.mmtfid !== undefined || me.cfg.pdbid !== undefined || me.cfg.opmid !== undefined || me.cfg.mmcifid !== undefined || me.cfg.mmdbid !== undefined || me.cfg.mmdbafid !== undefined || me.cfg.gi !== undefined || me.cfg.blast_rep_id !== undefined;

            if(bOnePdb) {
              html += this.getMenuText('assemblyWrapper', 'Assembly', undefined, 1, 1);
              html += "<ul>";

              if(!me.cfg.bu) {
                html += this.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', undefined, 1, 2);
                html += this.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit', true, 1, 2);
              }
              else {
                html += this.getRadio('mn6_assembly', 'mn6_assemblyYes', 'Biological Assembly', true, 1, 2);
                html += this.getRadio('mn6_assembly', 'mn6_assemblyNo', 'Asymmetric Unit', undefined, 1, 2);
              }

              html += "</ul>";
              html += "</li>";
            }

            html += this.getMenuText('mn6_symmetrywrap', 'Symmetry', undefined, undefined, 1);

            html += "<ul>";
            if(bOnePdb) html += this.getLink('mn6_symmetry', 'from PDB(precalculated) ' + me.htmlCls.wifiStr, undefined, 2);

            html += this.getLink('mn6_symd', 'from SymD(Dynamic) ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn6_clear_sym', 'Clear SymD Symmetry', undefined, 2);
            html += this.getLink('mn6_axes_only', 'Show Axes Only', undefined, 2);

            html += "</ul>";
            html += "</li>";

            html += this.getMenuText('mn6_igrefwrap', 'Ref. Number', undefined, undefined, 1);

            html += "<ul>";
//!!!
/*
            html += this.getLink('mn6_igrefYes', 'Show Ig Ref. Number', undefined, 2);
            html += this.getLink('mn6_igrefTpl', 'Ig w/ Specified Template', undefined, 2);
            html += this.getLink('mn6_igrefNo', 'Hide Ig Ref. Number', undefined, 2);
*/
            html += this.getMenuSep();

            html += this.getLink('mn6_customref', 'Custom Ref. Number', undefined, 2);
            html += "</ul>";
            html += "</li>";

            html += this.getMenuSep();
        }

        html += this.getLink('mn6_yournote', 'Window Title', undefined, 1);

        if(me.cfg.cid !== undefined) {
            html += this.getMenuText('mn1_linkwrap', 'Links', undefined, undefined, 1);
            
            html += "<ul>";
            html += this.getLink('mn1_link_structure', 'Compound Summary ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn1_link_vast', 'Similar Compounds ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn1_link_bind', 'Structures Bound ' + me.htmlCls.wifiStr, undefined, 2);
            html += "</ul>";
            html += "</li>";
        }
        else {
            html += this.getMenuText('mn1_linkwrap', 'Links', undefined, undefined, 1);
            html += "<ul>";
            html += this.getLink('mn1_link_structure', 'Structure Summary ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn1_link_vast', 'Similar Structures ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn1_link_pubmed', 'Literature ' + me.htmlCls.wifiStr, undefined, 2);
            html += this.getLink('mn1_link_protein', 'Protein ' + me.htmlCls.wifiStr, undefined, 2);
            //html += this.getLink('mn1_link_gene', 'Gene');
            //html += this.getLink('mn1_link_chemicals', 'Chemicals');
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

        html += this.getMenuUrl('abouticn3d', me.htmlCls.baseUrl + "icn3d/icn3d.html#about", "About iCn3D<span style='font-size:0.9em'> " + me.REVISION + "</span>", 1, 1);

        html += this.getMenuUrl('gallery', me.htmlCls.baseUrl + "icn3d/icn3d.html#gallery", "Live Gallery " + me.htmlCls.wifiStr, 1, 1);
        html += this.getMenuUrl('video', me.htmlCls.baseUrl + "icn3d/icn3d.html#videos", "Videos & Tutorials", 1, 1);

        html += this.getMenuText('mn6_faq', 'FAQ', undefined, 1, 1);

        html += "<ul>";
        html += this.getMenuUrl('faq_viewstru', me.htmlCls.baseUrl + "icn3d/icn3d.html#viewstru", "View structure", 1, 2);
        html += this.getMenuUrl('faq_tfstru', me.htmlCls.baseUrl + "icn3d/icn3d.html#tfstru", "Transform Structure", 1, 2);
        html += this.getMenuUrl('faq_selsubset', me.htmlCls.baseUrl + "icn3d/icn3d.html#selsubset", "Select Subsets", 1, 2);
        html += this.getMenuUrl('faq_stylecolor', me.htmlCls.baseUrl + "icn3d/icn3d.html#changestylecolor", "Change Style/Color", 1, 2);
        html += this.getMenuUrl('faq_savework', me.htmlCls.baseUrl + "icn3d/icn3d.html#saveview", "Save Work", 1, 2);
        html += this.getMenuUrl('faq_showanno', me.htmlCls.baseUrl + "icn3d/icn3d.html#showanno", "Show Annotations", 1, 2);
        html += this.getMenuUrl('faq_exportanno', me.htmlCls.baseUrl + "icn3d/icn3d.html#exportanno", "Export Annotations", 1, 2);
        html += this.getMenuUrl('faq_interanal', me.htmlCls.baseUrl + "icn3d/icn3d.html#interanalysis", "Interaction Analysis", 1, 2);
        html += this.getMenuUrl('faq_mutanal', me.htmlCls.baseUrl + "icn3d/icn3d.html#mutationanalysis", "Mutation Analysis", 1, 2);
        html += this.getMenuUrl('faq_elecpot', me.htmlCls.baseUrl + "icn3d/icn3d.html#elecpot", "Electrostatic Pot.", 1, 2);
        html += this.getMenuUrl('faq_simipdb', me.htmlCls.baseUrl + "icn3d/icn3d.html#simivast", "Similar PDB", 1, 2);
        html += this.getMenuUrl('faq_simialphapdb', me.htmlCls.baseUrl + "icn3d/icn3d.html#simifoldseek", "Similar AlphaFold/PDB", 1, 2);
        html += this.getMenuUrl('faq_alnstru', me.htmlCls.baseUrl + "icn3d/icn3d.html#alignmul", "Align Multiple Structures", 1, 2);
        html += this.getMenuUrl('faq_batchanal', me.htmlCls.baseUrl + "icn3d/icn3d.html#batchanalysis", "Batch Analysis", 1, 2);
        html += this.getMenuUrl('faq_embedicn3d', me.htmlCls.baseUrl + "icn3d/icn3d.html#embedicn3d", "Embed iCn3D", 1, 2);
        html += "</ul>";
        html += "</li>";

        //html += liStr + "https://www.ncbi.nlm.nih.gov/structure' target='_blank'>Search Structure " + me.htmlCls.wifiStr + "</a></li>";
        //html += liStr + me.htmlCls.baseUrl + "icn3d/icn3d.html#citing' target='_blank'>Citing iCn3D</a></li>";
        html += this.getMenuUrl('citing', me.htmlCls.baseUrl + "icn3d/icn3d.html#citing", "Citing iCn3D", undefined, 1);

        html += this.getMenuText('mn6_source', 'Source Code', undefined, 1, 1);
        html += "<ul>";
        html += this.getMenuUrl('github', "https://github.com/ncbi/icn3d", "GitHub (browser) " + me.htmlCls.wifiStr, 1, 2);
        html += this.getMenuUrl('npm', "https://www.npmjs.com/package/icn3d", "npm (Node.js) " + me.htmlCls.wifiStr, 1, 2);
        html += this.getMenuUrl('notebook', "https://pypi.org/project/icn3dpy", "Jupyter Notebook " + me.htmlCls.wifiStr, 1, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuText('mn6_develop', 'Develop', undefined, undefined, 1);
        html += "<ul>";
        html += this.getMenuUrl('dev_embedicn3d2', me.htmlCls.baseUrl + "icn3d/icn3d.html#HowToUse", "Embed iCn3D", undefined, 2);
        html += this.getMenuUrl('dev_urlpara', me.htmlCls.baseUrl + "icn3d/icn3d.html#parameters", "URL Parameters", undefined, 2);
        html += this.getMenuUrl('dev_command', me.htmlCls.baseUrl + "icn3d/icn3d.html#commands", "Commands", undefined, 2);

        html += this.getMenuUrl('dev_datastru', me.htmlCls.baseUrl + "icn3d/icn3d.html#datastructure", "Data Structure", undefined, 2);
        html += this.getMenuUrl('dev_classstru', me.htmlCls.baseUrl + "icn3d/icn3d.html#classstructure", "Class Structure", undefined, 2);
        html += this.getMenuUrl('dev_addclass', me.htmlCls.baseUrl + "icn3d/icn3d.html#addclass", "Add New Classes", undefined, 2);
        html += this.getMenuUrl('dev_modfunc', me.htmlCls.baseUrl + "icn3d/icn3d.html#modifyfunction", "Modify Functions", undefined, 2);
        html += this.getMenuUrl('dev_restful', me.htmlCls.baseUrl + "icn3d/icn3d.html#restfulapi", "RESTful APIs", undefined, 2);
        html += this.getMenuUrl('dev_contributor', me.htmlCls.baseUrl + "icn3d/icn3d.html#contributors", "iCn3D Contributors", undefined, 2);
        html += "</ul>";
        html += "</li>";

        html += this.getMenuUrl('helpdoc', me.htmlCls.baseUrl + "icn3d/docs/icn3d_help.html", "Help Doc " + me.htmlCls.wifiStr, 1, 1);

        html += this.getMenuSep();

        html += this.getMenuText('mn6_tfhint', 'Transform Hints', undefined, 1, 1);
        html += "<ul>";
        html += this.getMenuText('mn6_rotate', 'Rotate', undefined, 1, 2);
        html += "<ul>";
        html += "<li>Left Mouse (Click & Drag)</li>";
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
        html += this.getMenuText('mn6_zoom', 'Zoom', undefined, 1, 2);
        html += "<ul>";
        html += "<li>Middle Mouse <br>(Pinch & Spread)</li>";
        html += "<li>Key z: Zoom in</li>";
        html += "<li>Key x: Zoom out</li>";
        html += "</ul>";
        html += "</li>";
        html += this.getMenuText('mn6_translate', 'Translate', undefined, 1, 2);
        html += "<ul>";
        html += "<li>Right Mouse <br>(Two Finger Click & Drag)</li>";
        html += "</ul>";
        html += "</li>";
        html += "</ul>";
        html += "</li>";

        html += this.getMenuUrl('selhints', me.htmlCls.baseUrl + "icn3d/icn3d.html#selsubset", "Selection Hints", undefined, 1);
        html += this.getMenuUrl('helpdesk', "https://support.nlm.nih.gov/support/create-case/", "Write to Help Desk", 1, 1);

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
