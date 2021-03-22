/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu2b = function() { var me = this, ic = me.icn3d; "use strict";
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

iCn3DUI.prototype.setMenu2b_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";
    html += "<ul class='icn3d-mn'>";

    html += me.getLink('mn2_show_selected', 'View Only <br>Selection');
    html += me.getLink('mn2_hide_selected', 'Hide Selection');
    html += me.getLink('mn2_selectedcenter', 'Zoom in Selection');
    html += me.getLink('mn6_center', 'Center Selection');
    html += me.getLink('mn2_fullstru', 'View Full Structure');
    html += "<li id='" + me.pre + "mn2_alternateWrap'><span id='" + me.pre + "mn2_alternate' class='icn3d-link'>Alternate (Key \"a\")</span></li>";

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
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisYes', 'Original');
    html += me.getRadio('mn6_showaxis', 'mn6_showaxisSel', 'Prin. Axes on Sel.');
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
