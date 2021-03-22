/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getLink = function(id, text) { var me = this, ic = me.icn3d; "use strict";
    return "<li><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getLinkWrapper = function(id, text, wrapper) { var me = this, ic = me.icn3d; "use strict";
    return "<li id='" + me.pre + wrapper + "'><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
};

iCn3DUI.prototype.getRadio = function(radioid, id, text, bChecked) { var me = this, ic = me.icn3d; "use strict";
    var checkedStr = (bChecked) ? ' checked' : '';

    //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
    return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.inputRadioStr + "name='" + me.pre + radioid + "' " + "class='" + me.pre + radioid + "' " + "v='" + text + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-rad-text'>" + text + "</span></label></li>";
};

iCn3DUI.prototype.getRadioColor = function(radioid, id, text, color, bChecked) { var me = this, ic = me.icn3d; "use strict";
    var checkedStr = (bChecked) ? ' checked' : '';

    //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
    return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-color-rad-text' color='" + color + "'><span style='background-color:#" + color + "'>" + me.space3 + "</span> " + text + "</span></label></li>";
};

iCn3DUI.prototype.setAdvanced = function(index) { var me = this, ic = me.icn3d; "use strict";
    var indexStr = (index === undefined) ? '' : index;

    var dialogClass = (me.cfg.notebook) ? 'icn3d-hidden' : '';
    var html = me.divStr + "dl_advanced" + indexStr + "' class='" + dialogClass + "'>";

    html += "<table width='500'><tr><td valign='top'><table cellspacing='0'>";
    html += "<tr><td><b>Select:</b></td><td>" + me.inputTextStr + "id='" + me.pre + "command" + indexStr + "' placeholder='$[structures].[chains]:[residues]@[atoms]' size='60'></td></tr>";
    html += "<tr><td><b>Name:</b></td><td>" + me.inputTextStr + "id='" + me.pre + "command_name" + indexStr + "' placeholder='my_selection' size='60'></td></tr>";
    html += "<tr><td colspan='2' align='left'>" + me.space3 + me.buttonStr + "command_apply" + indexStr + "'><b>Save Selection to Defined Sets</b></button></td></tr>";
    html += "</table></td>";

    html += "</tr>";

    html += "<tr><td>";

    html += 'Specification Tips: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'specguide' + indexStr + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'specguide' + indexStr + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';

    html += me.divStr + "specguide" + indexStr + "' style='display:none; width:500px' class='icn3d-box'>";

    html += "<b>Specification:</b> In the selection \"$1HHO,4N7N.A,B,C:5-10,LV,3AlaVal,chemicals@CA,C\":";
    html += "<ul><li>\"$1HHO,4N7N\" uses \"$\" to indicate structure selection.<br/>";
    html += "<li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
    html += "<li>\":5-10,LV,3LeuVal,chemicals\" uses the colon \":\" to indicate residue selection. Residue selection could be residue number (5-10), one-letter IUPAC residue name abbreviations (LV), three-letter residue names (AlaVal, \"3\" indicates each residue name has three letters), or predefined names: \"proteins\", \"nucleotides\", \"chemicals\", \"ions\", and \"water\". IUPAC abbreviations can be written either as a contiguous string (e.g., \":LV\"), in order to find all instances of that sequence in the structure, or they can be separated by commas (e.g., \":L,V\") to select all residues of a given type in the structure (in the latter case, select all Leucine and Valine in the structure).<br/>";
    html += "<li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
    html += "<li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/>";
    html += "<li>Different selections can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, \":1-10 or :K\" selects all residues 1-10 and all Lys residues. \":1-10 and :K\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :K\" selects all residues 1-10, which are not Lys residues.<br/>";
    html += "<li>The wild card character \"X\" or \"x\" can be used to represent any character.";
    html += "</ul>";
    html += "<b>Set Operation:</b>";
    html += "<ul><li>Users can select multiple sets in the menu \"Select > Defined Sets\".<br/>";
    html += "<li>Different sets can be unioned (with \"<b>or</b>\", default), intersected (with \"<b>and</b>\"), or negated (with \"<b>not</b>\"). For example, if the \"Defined Sets\" menu has four sets \":1-10\", \":11-20\", \":5-15\", and \":7-8\", the command \"saved atoms :1-10 or :11-20 and :5-15 not :7-8\" unions all residues 1-10 and 11-20 to get the residues 1-20, then intersects with the residues 5-15 to get the residues 5-15, then exclude the residues 7-8 to get the final residues 5-6 and 9-15.</ul>";
    html += "<b>Full commands in url or command window:</b>";
    html += "<ul><li>Select without saving the set: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C<br/>";
    //html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C | name my_name | description my_description</ul>";
    html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C | name my_name</ul>";

    html += "</div>";

    html += "</td></tr></table>";
    html += "</div>";

    return html;
};

iCn3DUI.prototype.getOptionHtml = function(optArray, selIndex) { var me = this, ic = me.icn3d; "use strict";
    var html = '';
    me.optionStr = "<option value=";

    for(var i = 0, il = optArray.length; i < il; ++i) {
        var iStr = optArray[i];

        if(i == selIndex) {
            html += me.optionStr + "'" + iStr + "' selected>" + iStr + "</option>";
        }
        else {
            html += me.optionStr + "'" + iStr + "'>" + iStr + "</option>";
        }
    }

    return html;
};

iCn3DUI.prototype.setColorHints = function () { var me = this, ic = me.icn3d; "use strict";
    var html = '';

    html += me.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
    html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
    html += '<span style="font-weight:bold">Grey</span>: contacts</div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
    html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
    html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';

    return html;
};

iCn3DUI.prototype.setThicknessHtml = function (type) { var me = this, ic = me.icn3d; "use strict";
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

    html += "<b>Line Radius</b>: " + me.inputTextStr + "id='" + me.pre + "linerad_" + type + "' value='" + linerad + "' size=4>" + me.space3 + "(for stabilizers, hydrogen bonds, distance lines, default 0.1)<br/>";
    html += "<b>Coil Radius</b>: " + me.inputTextStr + "id='" + me.pre + "coilrad_" + type + "' value='" + coilrad + "' size=4>" + me.space3 + "(for coils, default 0.3)<br/>";
    html += "<b>Stick Radius</b>: " + me.inputTextStr + "id='" + me.pre + "stickrad_" + type + "' value='" + stickrad + "' size=4>" + me.space3 + "(for sticks, default 0.4)<br/>";
    html += "<b>Trace Radius</b>: " + me.inputTextStr + "id='" + me.pre + "tracerad_" + type + "' value='" + tracerad + "' size=4>" + me.space3 + "(for C alpha trace, O3' trace, default 0.2)<br/>";

    html += "<b>Ribbon Thickness</b>: " + me.inputTextStr + "id='" + me.pre + "ribbonthick_" + type + "' value='" + ribbonthick + "' size=4>" + me.space3 + "(for helix and sheet ribbons, nucleotide ribbons, default 0.2)<br/>";
    html += "<b>Protein Ribbon Width</b>: " + me.inputTextStr + "id='" + me.pre + "prtribbonwidth_" + type + "' value='" + prtribbonwidth + "' size=4>" + me.space3 + "(for helix and sheet ribbons, default 1.3)<br/>";
    html += "<b>Nucleotide Ribbon Width</b>: " + me.inputTextStr + "id='" + me.pre + "nucleotideribbonwidth_" + type + "' value='" + nucleotideribbonwidth + "' size=4>" + me.space3 + "(for nucleotide ribbons, default 0.8)<br/>";

    html += "<b>Ball Scale</b>: " + me.inputTextStr + "id='" + me.pre + "ballscale_" + type + "' value='" + ballscale + "' size=4>" + me.space3 + "(for styles 'Ball and Stick' and 'Dot', default 0.3)<br/>";

    html += me.spanNowrapStr + "" + me.buttonStr + "apply_thickness_" + type + "'>Preview</button></span>";

    return html;
};

iCn3DUI.prototype.setSequenceGuide = function (suffix, bShown) { var me = this, ic = me.icn3d; "use strict";
  var sequencesHtml = '';

  var index = (ic) ? Object.keys(ic.defNames2Atoms).length : 1;

  if(bShown) {
     sequencesHtml += me.divStr + "seqguide" + suffix + "'>";
 }
 else {
     sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'seqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'seqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

     sequencesHtml += "<div style='min-width:200px; display:inline-block;'><b>Selection:</b> Name: " + me.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> " + me.space2 + "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button></div><br/>";

     sequencesHtml += me.divStr + "seqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";
 }

  sequencesHtml += me.getSelectionHints();

  var resCategories = "<b>Residue labeling:</b> standard residue with coordinates: UPPER case letter; nonstandard residue with coordinates: the first UPPER case letter plus a period except that water residue uses the letter 'O'; residue missing coordinates: lower case letter.";
  var scroll = (me.isMac() && !me.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

  sequencesHtml += resCategories + scroll + "<br/></div>";

  return sequencesHtml;
};

iCn3DUI.prototype.setAlignSequenceGuide = function (suffix, bShown) { var me = this, ic = me.icn3d; "use strict";
  var sequencesHtml = '';
  suffix = '';

  var index = (ic) ? Object.keys(ic.defNames2Atoms).length : 1;

  sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'alignseqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'alignseqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

  sequencesHtml += "<div style='min-width:200px; display:inline-block;''><b>Selection:</b> Name: " + me.inputTextStr + "id='" + me.pre + "alignseq_command_name' value='alseq_" + index + "' size='10'> " + me.space2 + "<button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear</button></div><br/>";

  sequencesHtml += me.divStr + "alignseqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";

  sequencesHtml += me.getSelectionHints();

  var resCategories = "<b>Residue labeling:</b> aligned residue with coordinates: UPPER case letter; non-aligned residue with coordinates: lower case letter which can be highlighted; residue missing coordinates: lower case letter which can NOT be highlighted.";
  var scroll = (me.isMac() && !me.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

  sequencesHtml += resCategories + scroll + "<br/></div>";

  return sequencesHtml;
};

iCn3DUI.prototype.getSelectionHints = function () { var me = this, ic = me.icn3d; "use strict";
  var sequencesHtml = '';

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

  return sequencesHtml;
};

iCn3DUI.prototype.addGsizeSalt = function(name) { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    html += "<span style='white-space:nowrap;font-weight:bold;'>Grid Size: <select id='" + me.pre + name + "gsize'>";

    var optArray1c = ['65', '97', '129'];
    html += me.getOptionHtml(optArray1c, 0);

    html += "</select></span>";

    html += "<span style='white-space:nowrap;font-weight:bold;margin-left:30px;'>Salt Concentration: <select id='" + me.pre + name + "salt'>";

    var optArray1d = ['0', '0.15'];
    html += me.getOptionHtml(optArray1d, 1);

    html += "</select> M</span><br/>";

    return html;
};

iCn3DUI.prototype.getFootHtml = function(type, tabName) { var me = this, ic = me.icn3d; "use strict";
    var footHtml = "<div style='width:500px;'>";

    if(type == 'delphi') {
        if(me.cfg.cid) {
            footHtml += "<b>Note</b>: Partial charges (MMFF94) are from PubChem Compound SDF files.<br/><br/>";
        }
        else {
            footHtml += "<b>Note</b>: Only the selected residues are used for <a href='http://honig.c2b2.columbia.edu/delphi'>DelPhi</a> potential calculation by solving linear Poisson-Boltzmann equation.";

            footHtml += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
              + me.pre + tabName + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
              + me.pre + tabName + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
            footHtml += me.divStr + tabName + "' style='display:none;'>";

            footHtml += "<br>The hydrogens and partial charges of proteins and nucleotides are added using <a href='http://compbio.clemson.edu/pka_webserver'>DelPhiPKa</a> with the Amber charge and size files. The hydrogens of ligands are added using <a href='http://openbabel.org/wiki/Main_Page'>Open Babel</a>. The partial charges of ligands are calculated using <a href='http://ambermd.org/antechamber/ac.html'>Antechamber</a> with the Gasteiger charge method. All partial charges are calculated at pH 7.<br/><br/>";

            footHtml += "Lipids are treated as ligands. Please use \"HETATM\" instead of \"ATOM  \" for each lipid atom in your PDB file. Each phosphate in lipids is assigned with a charge of -1. You can download PQR and modify it, or prepare your PQR file using other tools. Then load the PQR file at the menu \"Analysis > Load PQR/Potential\".<br/><br/>";

            footHtml += "</div>";
        }
    }
    else {
        footHtml += "<b>Note</b>: Always load a PDB file before loading a PQR or DelPhi potential file.";

        footHtml += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
          + me.pre + tabName + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
          + me.pre + tabName + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
        footHtml += me.divStr + tabName + "' style='display:none;'>";

        footHtml += "The PDB file can be loaded in the URL with \"pdbid=\" or at \"File > Open File\". The PQR file can be prepared at the menu \"Analysis > Download PQR\" with your modification or using other tools. The DelPhi potential file can be calculated at <a href='http://compbio.clemson.edu/sapp/delphi_webserver/'>DelPhi Web Server</a> and be exported as a Cube file. ";

        if(type == 'url') footHtml += "The PQR or potential file can be accessed in a URL if it is located in the same host as iCn3D.";

        footHtml += "<br/><br/>";

        footHtml += "</div>";
    }
    footHtml += "</div>";

    return footHtml;
};
