/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setMenu4 = function() { var me = this, ic = me.icn3d; "use strict";
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

iCn3DUI.prototype.setMenu4_base = function() { var me = this, ic = me.icn3d; "use strict";
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
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran1', 'Orange', 'FFA500');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran2', 'Dark Orange', 'FF8C00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran3', 'Orange Red', 'FF4500');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran4', 'Tomato', 'FF6347');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran5', 'Coral', 'FF7F50');
    html += me.getRadioColor('mn4_clr', 'mn4_clrOran6', 'Light Salmon', 'FFA07A');
    html += "</ul>";

    html += "<li><span>Yellow</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrYllw', 'Yellow');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw1', 'Yellow', 'FF0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw2', 'Gold', 'FFD700');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw3', 'Light Yellow', 'FFFFE0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw4', 'Lemon Chiffon', 'FFFACD');
    //html += me.getRadioColor('mn4_clr', 'mn4_clrYllw5', 'Light Golden Rod Yellow', 'FAFAD2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw5', 'Light Golden Rod', 'FAFAD2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw6', 'Papaya Whip', 'FFEFD5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw7', 'Moccasin', 'FFE4B5');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw8', 'Peach Puff', 'FFDAB9');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw9', 'Pale Golden Rod', 'EEE8AA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw10', 'Khaki', 'F0E68C');
    html += me.getRadioColor('mn4_clr', 'mn4_clrYllw11', 'Dark Khaki', 'BDB76B');
    html += "</ul>";

    html += "<li><span>Magenta</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrMgnt', 'Magenta');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt1', 'Magenta', 'F0F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt2', 'Orchid', 'DA70D6');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt3', 'Violet', 'EE82EE');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt4', 'Plum', 'DDA0DD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt5', 'Thistle', 'D8BFD8');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt6', 'Lavender', 'E6E6FA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt7', 'Medium Orchid', 'BA55D3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt8', 'Medium Purple', '9370DB');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt9', 'Rebecca Purple', '663399');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt10', 'Blue Violet', '8A2BE2');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt11', 'Dark Violet', '9400D3');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt12', 'Dark Orchid', '9932CC');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt13', 'Dark Magenta', '8B008B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt14', 'Purple', '800080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt15', 'Indigo', '4B0082');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt16', 'Slat Blue', '6A5ACD');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt17', 'Dark Slate Blue', '483D8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrMgnt18', 'Medium Slat Blue', '6A5ACD');
    html += "</ul>";

    html += "<li><span>Green</span>";
    html += "<ul>";
    //html += me.getRadio('mn4_clr', 'mn4_clrGrn', 'Green');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn1', 'Green', '0F0');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn2', 'Dark Green', '006400');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn3', 'Yellow Green', '9ACD32');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn4', 'Olive Drab', '6B8E23');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn5', 'Olive', '808000');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn6', 'Dark Olive Green', '556B2F');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn7', 'Medium Aquamarine', '66CDAA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn8', 'Dark Sea Green', '8FBC8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn9', 'Lignt Sea Green', '20B2AA');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn10', 'Dark Cyan', '008B8B');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn11', 'Teal', '008080');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn12', 'Forest Green', '228B22');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn13', 'Sea Green', '2E8B57');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn14', 'Medium Sea Green', '3CB371');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn15', 'Spring Green', '00FF7F');
    //html += me.getRadioColor('mn4_clr', 'mn4_clrGrn16', 'Medium Spring Green', '00FA9A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn16', 'Medium Spring', '00FA9A');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn17', 'Light Green', '90EE90');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn18', 'Pale Green', '98FB98');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn19', 'Lime Green', '32CD32');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn20', 'Lawn Green', '7CFC00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn21', 'Chartreuse', '7FFF00');
    html += me.getRadioColor('mn4_clr', 'mn4_clrGrn22', 'Green Yellow', 'ADFF2F');
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

        if(!me.cfg.notebook) {
            html += me.getRadio('mn4_clr', 'mn1_delphi2', 'DelPhi<br><span style="padding-left:1.5em;">Potential ' + me.licenseStr + '</span>');
        }

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
        html += me.getRadio('mn4_clr', 'mn1_delphi2', 'DelPhi<br><span style="padding-left:1.5em;">Potential ' + me.licenseStr + '</span>');
        html += me.getRadio('mn4_clr', 'mn4_clrAtom', 'Atom', true);
    }

    html += "<li>-</li>";

    html += me.getLink('mn4_clrSave', 'Save Color');
    html += me.getLink('mn4_clrApplySave', 'Apply Saved Color');

    html += "<li><br/></li>";
    html += "</ul>";

    return html;
};
