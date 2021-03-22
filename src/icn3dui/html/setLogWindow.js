/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setLogWindow = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += me.divStr + "cmdlog' style='float:left; margin-top: -5px; width: 100%;'>";

    html += "<textarea id='" + me.pre + "logtext' rows='2' style='width: 100%; height: " + me.CMD_HEIGHT + "px; padding: 0px; border: 0px; background-color: " + me.GREYD + ";'></textarea>";
    html += "</div>";

    return html;
};
