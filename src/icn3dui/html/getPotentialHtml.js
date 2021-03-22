/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getPotentialHtml = function(type, dialogClass) { var me = this, ic = me.icn3d; "use strict";
    var html = '';

    var name1, name2;
    var tab1, tab2, tab3;
    tab1 = 'Equipotential Map';
    tab2 = 'Surface with Potential';
    //tab3 = 'Download PQR';

    if(type == 'delphi') {
        name1 = 'delphi';
    }
    else if(type == 'local') {
        name0 = 'pqr';
        name1 = 'phi';
        name2 = 'cube';
    }
    else if(type == 'url') {
        name0 = 'pqrurl';
        name1 = 'phiurl';
        name2 = 'cubeurl';
    }

    html += me.divStr + "dl_" + name1 + "' class='" + dialogClass + "'>";
    html += me.divStr + "dl_" + name1 + "_tabs' style='border:0px;'>";
    html += "<ul>";
    html += "<li><a href='#" + me.pre + name1 + "tab1'>" + tab1 + "</a></li>";
    html += "<li><a href='#" + me.pre + name1 + "tab2'>" + tab2 + "</a></li>";
    //html += "<li><a href='#" + me.pre + name1 + "tab3'>" + tab3 + "</a></li>";
    html += "</ul>";

    html += me.divStr + name1 + "tab1'>";
    if(type == 'delphi') html += me.addGsizeSalt(name1) + "<br>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>Potential contour at: <select id='" + me.pre + name1 + "contour'>";

    var optArray1b = ['0.5', '1', '2', '4', '6', '8', '10'];
    html += me.getOptionHtml(optArray1b, 1);

    html += "</select> kT/e (25.6mV at 298K)</span><br/><br/>";

    var htmlTmp;

    // tab1: equipotential map
    if(type == 'delphi') {
        html += me.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>";
        html += me.buttonStr + name1 + "mapNo' style='margin-left:30px;'>Remove Map</button><br>";
    }
    else if(type == 'local') {
        html += me.divStr + name1 + "tab1_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name0 + "'>PQR</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name1 + "'>Phi</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name2 + "'>Cube</a></li>";
        html += "</ul>";

        htmlTmp = "<span style='margin-left:30px'>" + me.buttonStr + name1 + "mapNo'>Remove Map</button></span></div>";

        html += me.divStr + name1 + "tab1_" + name0 + "'>";
        html += me.addGsizeSalt(name0) + "<br>";
        html += "<b>PQR File</b>: " + me.inputFileStr + "id='" + me.pre + name0 + "file'> <br><br>" + me.buttonStr + "reload_" + name0 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += me.divStr + name1 + "tab1_" + name1 + "'>";
        html += "<b>Phi File</b>: " + me.inputFileStr + "id='" + me.pre + name1 + "file'> <br><br>" + me.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += me.divStr + name1 + "tab1_" + name2 + "'>";
        html += "<b>Cube File</b>: " + me.inputFileStr + "id='" + me.pre + name2 + "file'> <br><br>" + me.buttonStr + "reload_" + name2 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += "</div>";
    }
    else if(type == 'url') {
        html += me.divStr + name1 + "tab1_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name0 + "2'>PQR</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name1 + "2'>Phi</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab1_" + name2 + "2'>Cube</a></li>";
        html += "</ul>";

        htmlTmp = "<span style='margin-left:30px'>" + me.buttonStr + name1 + "mapNo'>Remove Map</button></span></div>";

        html += me.divStr + name1 + "tab1_" + name0 + "2'>";
        html += me.addGsizeSalt(name0) + "<br>";
        html += "<b>PQR URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name0 + "file'> <br><br>" + me.buttonStr + "reload_" + name0 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += me.divStr + name1 + "tab1_" + name1 + "2'>";
        html += "<b>Phi URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name1 + "file'> <br><br>" + me.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += me.divStr + name1 + "tab1_" + name2 + "2'>";
        html += "<b>Cube URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name2 + "file'> <br><br>" + me.buttonStr + "reload_" + name2 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

        html += "</div>";
    }

    html += "<br>" + me.getFootHtml(type, name1 + "tab1_foot");
    html += "</div>";

    html += me.divStr + name1 + "tab2'>";
    if(type == 'delphi') html += me.addGsizeSalt(name1) + "<br>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>Surface with max potential at: <select id='" + me.pre + name1 + "contour2'>";

    var optArray1c = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    html += me.getOptionHtml(optArray1c, 2);

    html += "</select> kT/e (25.6mV at 298K)</span><br/><br/>";

    html += "<b>Surface</b>: <select id='" + me.pre + name1 + "surftype'>";
    html += "<option value='21'>Van der Waals</option>";
    html += "<option value='22' selected>Molecular Surface</option>";
    html += "<option value='23'>Solvent Accessible</option>";
    html += "</select>";

    html += "<span style='margin-left:20px'><b>Opacity</b>: <select id='" + me.pre + name1 + "surfop'>";
    var surfOp = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'];
    html += me.getOptionHtml(surfOp, 0);
    html += "</select></span>";

    html += "<span style='margin-left:20px'><b>Wireframe</b>: <select id='" + me.pre + name1 + "surfwf'>";
    html += "<option value='yes'>Yes</option>";
    html += "<option value='no' selected>No</option>";
    html += "</select></span><br/>";

    html += "<br/>";

    // tab2: surface with potential
    if(type == 'delphi') {
        html += me.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>";
        html += me.buttonStr + name1 + "mapNo2' style='margin-left:30px;'>Remove Surface</button><br>";
    }
    else if(type == 'local') {
        html += me.divStr + name1 + "tab2_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name0 + "'>PQR</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name1 + "'>Phi</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name2 + "'>Cube</a></li>";
        html += "</ul>";

        htmlTmp = "<span style='margin-left:30px'>" + me.buttonStr + name1 + "mapNo2'>Remove Surface</button></span></div>";

        html += me.divStr + name1 + "tab2_" + name0 + "'>";
        html += me.addGsizeSalt(name0 + "2") + "<br>";
        html += "<b>PQR File</b>: " + me.inputFileStr + "id='" + me.pre + name0 + "file2'> <br><br>" + me.buttonStr + "reload_" + name0 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += me.divStr + name1 + "tab2_" + name1 + "'>";
        html += "<b>Phi File</b>: " + me.inputFileStr + "id='" + me.pre + name1 + "file2'> <br><br>" + me.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += me.divStr + name1 + "tab2_" + name2 + "'>";
        html += "<b>Cube File</b>: " + me.inputFileStr + "id='" + me.pre + name2 + "file2'> <br><br>" + me.buttonStr + "reload_" + name2 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += "</div>";
    }
    else if(type == 'url') {
        html += me.divStr + name1 + "tab2_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name0 + "2'>PQR</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name1 + "2'>Phi</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab2_" + name2 + "2'>Cube</a></li>";
        html += "</ul>";

        htmlTmp = "<span style='margin-left:30px'>" + me.buttonStr + name1 + "mapNo2'>Remove Surface</button></span></div>";

        html += me.divStr + name1 + "tab2_" + name0 + "2'>";
        html += me.addGsizeSalt(name0 + "2") + "<br>";
        html += "<b>PQR URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name0 + "file2'> <br><br>" + me.buttonStr + "reload_" + name0 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += me.divStr + name1 + "tab2_" + name1 + "2'>";
        html += "<b>Phi URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name1 + "file2'> <br><br>" + me.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += me.divStr + name1 + "tab2_" + name2 + "2'>";
        html += "<b>Cube URL</b> in the same host: " + me.inputTextStr + "id='" + me.pre + name2 + "file2'> <br><br>" + me.buttonStr + "reload_" + name2 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

        html += "</div>";
    }

    html += "<br>" + me.getFootHtml(type, name1 + "tab2_foot");
    html += "</div>";

    //html += me.divStr + name1 + "tab3'>";

    //html += me.buttonStr + name1 + "pdb'>Download PDB</button> ";
    //html += me.buttonStr + name1 + "pqr' style='margin-left:30px'>Download PQR</button> (with partial charges)<br>";

    //html += "<br>" + footHtml;
    //html += "</div>";

    html += "</div>";
    html += "</div>";

    return html;
};
