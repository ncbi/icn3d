/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTools = function() { var me = this, ic = me.icn3d; "use strict";
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

iCn3DUI.prototype.setButton = function(buttonStyle, id, title, text, color) { var me = this, ic = me.icn3d; "use strict";
    color = (color !== undefined) ? 'color:' + color : '';
    var bkgdColor = me.isMobile() ? ' background-color:#DDDDDD;' : '';
    return "<div style='margin:3px 0px 0px 10px;'><button style='-webkit-appearance:" + buttonStyle + "; height:36px;" + bkgdColor + "' id='" + me.pre + id + "'><span style='white-space:nowrap;" + color + "' class='icn3d-commandTitle' title='" + title + "'>" + text + "</span></button></div>";
};

iCn3DUI.prototype.setTools_base = function() { var me = this, ic = me.icn3d; "use strict";
    // second row
    var html = "";

    var buttonStyle = me.isMobile() ? 'none' : 'button';
    var tdStr = "<td valign='top'>";

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
        html += tdStr + me.setButton(buttonStyle, 'alternate', 'Alternate the structures', 'Alternate<br/>(Key \"a\")', me.ORANGE) + "</td>";
    }

    html += tdStr + me.setButton(buttonStyle, 'saveimage', 'Save iCn3D PNG Image', 'Save iCn3D<br/>PNG Image') + "</td>";

    if(me.cfg.cid === undefined) {
        html += tdStr + me.setButton(buttonStyle, 'hbondsYes', 'View H-Bonds & Interactions', 'H-Bonds &<br/> Interactions') + "</td>";
    }

    html += tdStr + me.setButton(buttonStyle, 'show_selected', 'View ONLY the selected atoms', 'View Only<br/>Selection') + "</td>";

    html += tdStr + me.setButton(buttonStyle, 'toggleHighlight', 'Turn on and off the 3D highlight in the viewer', 'Toggle<br/>Highlight') + "</td>";

    if(me.cfg.cid === undefined) {
        html += tdStr + me.setButton(buttonStyle, 'removeLabels', 'Remove Labels', 'Remove<br/>Labels') + "</td>";
    }

    return html;
};
