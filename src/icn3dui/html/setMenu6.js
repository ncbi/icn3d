/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu6 = function() { var me = this, ic = me.icn3d; "use strict";
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

iCn3DUI.prototype.setMenu6_base = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    var liStr = "<li><a href='";

    html += "<ul class='icn3d-mn'>";

    html += liStr + me.baseUrl + "icn3d/docs/icn3d_about.html' target='_blank'>About iCn3D<span style='font-size:0.9em'> " + me.REVISION + " " + me.wifiStr + "</span></a></li>";

    html += liStr + me.baseUrl + "icn3d/docs/icn3d_publications.html' target='_blank'>Citing iCn3D " + me.wifiStr + "</a></li>";

    html += liStr + me.baseUrl + "icn3d/docs/icn3d_help.html' target='_blank'>Help Doc " + me.wifiStr + "</a></li>";

    html += liStr + me.baseUrl + "icn3d/icn3d.html#gallery' target='_blank'>Gallery " + me.wifiStr + "</a></li>";

    html += "<li><span>Web APIs</span>";
    html += "<ul>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#HowToUse' target='_blank'>How to Embed</a></li>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#parameters' target='_blank'>URL Parameters</a></li>";
    html += liStr + me.baseUrl + "icn3d/icn3d.html#commands' target='_blank'>Commands</a></li>";
    html += "</ul>";
    html += "</li>";

    html += liStr + "https://github.com/ncbi/icn3d' target='_blank'>Source Code " + me.wifiStr + "</a></li>";

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
