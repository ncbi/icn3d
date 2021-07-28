/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from './html.js';

import {HashUtilsCls} from '../utils/hashUtilsCls.js';
import {UtilsCls} from '../utils/utilsCls.js';
import {MyEventCls} from '../utils/myEventCls.js';

import {SaveFile} from '../icn3d/export/saveFile.js';
import {LoadScript} from '../icn3d/selection/loadScript.js';
import {ParserUtils} from '../icn3d/parsers/parserUtils.js';
import {Dsn6Parser} from '../icn3d/parsers/dsn6Parser.js';
import {PdbParser} from '../icn3d/parsers/pdbParser.js';
import {MmtfParser} from '../icn3d/parsers/mmtfParser.js';
import {OpmParser} from '../icn3d/parsers/opmParser.js';
import {MmdbParser} from '../icn3d/parsers/mmdbParser.js';
import {SdfParser} from '../icn3d/parsers/sdfParser.js';
import {MmcifParser} from '../icn3d/parsers/mmcifParser.js';
import {AlignParser} from '../icn3d/parsers/alignParser.js';
import {ChainalignParser} from '../icn3d/parsers/chainalignParser.js';

class SetHtml {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    getLink(id, text) { let me = this.icn3dui, ic = me.icn3d;
        return "<li><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
    }

    getLinkWrapper(id, text, wrapper) { let me = this.icn3dui, ic = me.icn3d;
        return "<li id='" + me.pre + wrapper + "'><span id='" + me.pre + id + "' class='icn3d-link'>" + text + "</span></li>";
    }

    getRadio(radioid, id, text, bChecked) { let me = this.icn3dui, ic = me.icn3d;
        let checkedStr =(bChecked) ? ' checked' : '';

        //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
        return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.htmlCls.inputRadioStr + "name='" + me.pre + radioid + "' " + "class='" + me.pre + radioid + "' " + "v='" + text + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-rad-text'>" + text + "</span></label></li>";
    }

    getRadioColor(radioid, id, text, color, bChecked) { let me = this.icn3dui, ic = me.icn3d;
        let checkedStr =(bChecked) ? ' checked' : '';

        //https://stackoverflow.com/questions/17541614/use-images-instead-of-radio-buttons/17541916
        return "<li><label for='" + me.pre + id + "' class='icn3d-rad'>" + me.htmlCls.inputRadioStr + "name='" + me.pre + radioid + "' id='" + me.pre + id + "'" + checkedStr + "><span class='ui-icon ui-icon-blank'></span> <span class='icn3d-color-rad-text' color='" + color + "'><span style='background-color:#" + color + "'>" + me.htmlCls.space3 + "</span> " + text + "</span></label></li>";
    }

    setAdvanced(index) { let me = this.icn3dui, ic = me.icn3d;
        let indexStr =(index === undefined) ? '' : index;

        let dialogClass =(me.cfg.notebook) ? 'icn3d-hidden' : '';
        let html = me.htmlCls.divStr + "dl_advanced" + indexStr + "' class='" + dialogClass + "'>";

        html += "<table width='500'><tr><td valign='top'><table cellspacing='0'>";
        html += "<tr><td><b>Select:</b></td><td>" + me.htmlCls.inputTextStr + "id='" + me.pre + "command" + indexStr + "' placeholder='$[structures].[chains]:[residues]@[atoms]' size='60'></td></tr>";
        html += "<tr><td><b>Name:</b></td><td>" + me.htmlCls.inputTextStr + "id='" + me.pre + "command_name" + indexStr + "' placeholder='my_selection' size='60'></td></tr>";
        html += "<tr><td colspan='2' align='left'>" + me.htmlCls.space3 + me.htmlCls.buttonStr + "command_apply" + indexStr + "'><b>Save Selection to Defined Sets</b></button></td></tr>";
        html += "</table></td>";

        html += "</tr>";

        html += "<tr><td>";

        html += 'Specification Tips: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'specguide' + indexStr + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'specguide' + indexStr + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';

        html += me.htmlCls.divStr + "specguide" + indexStr + "' style='display:none; width:500px' class='icn3d-box'>";

        html += "<b>Specification:</b> In the selection \"$1HHO,4N7N.A,B,C:5-10,LV,3AlaVal,chemicals@CA,C\":";
        html += "<ul><li>\"$1HHO,4N7N\" uses \"$\" to indicate structure selection.<br/>";
        html += "<li>\".A,B,C\" uses \".\" to indicate chain selection.<br/>";
        html += "<li>\":5-10,LV,3LeuVal,chemicals\" uses the colon \":\" to indicate residue selection. Residue selection could be residue number(5-10), one-letter IUPAC residue name abbreviations(LV), three-letter residue names(AlaVal, \"3\" indicates each residue name has three letters), or predefined names: \"proteins\", \"nucleotides\", \"chemicals\", \"ions\", and \"water\". IUPAC abbreviations can be written either as a contiguous string(e.g., \":LV\"), in order to find all instances of that sequence in the structure, or they can be separated by commas(e.g., \":L,V\") to select all residues of a given type in the structure(in the latter case, select all Leucine and Valine in the structure).<br/>";
        html += "<li>\"@CA,C\" uses \"@\" to indicate atom selection.<br/>";
        html += "<li>Partial definition is allowed, e.g., \":1-10\" selects all residue IDs 1-10 in all chains.<br/>";
        html += "<li>Different selections can be unioned(with \"<b>or</b>\", default), intersected(with \"<b>and</b>\"), or negated(with \"<b>not</b>\"). For example, \":1-10 or :K\" selects all residues 1-10 and all Lys residues. \":1-10 and :K\" selects all Lys residues in the range of residue number 1-10. \":1-10 or not :K\" selects all residues 1-10, which are not Lys residues.<br/>";
        html += "<li>The wild card character \"X\" or \"x\" can be used to represent any character.";
        html += "</ul>";
        html += "<b>Set Operation:</b>";
        html += "<ul><li>Users can select multiple sets in the menu \"Select > Defined Sets\".<br/>";
        html += "<li>Different sets can be unioned(with \"<b>or</b>\", default), intersected(with \"<b>and</b>\"), or negated(with \"<b>not</b>\"). For example, if the \"Defined Sets\" menu has four sets \":1-10\", \":11-20\", \":5-15\", and \":7-8\", the command \"saved atoms :1-10 or :11-20 and :5-15 not :7-8\" unions all residues 1-10 and 11-20 to get the residues 1-20, then intersects with the residues 5-15 to get the residues 5-15, then exclude the residues 7-8 to get the final residues 5-6 and 9-15.</ul>";
        html += "<b>Full commands in url or command window:</b>";
        html += "<ul><li>Select without saving the set: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C<br/>";
        //html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C | name my_name | description my_description</ul>";
        html += "<li>Select and save: select $1HHO,4N7N.A,B,C:5-10,LV,chemicals@CA,C | name my_name</ul>";

        html += "</div>";

        html += "</td></tr></table>";
        html += "</div>";

        return html;
    }

    getOptionHtml(optArray, selIndex) { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        for(let i = 0, il = optArray.length; i < il; ++i) {
            let iStr = optArray[i];

            if(i == selIndex) {
                html += me.htmlCls.optionStr + "'" + iStr + "' selected>" + iStr + "</option>";
            }
            else {
                html += me.htmlCls.optionStr + "'" + iStr + "'>" + iStr + "</option>";
            }
        }

        return html;
    }

    setColorHints() { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        html += me.htmlCls.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
        html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
        html += '<span style="font-weight:bold">Grey</span>: contacts</div>';
        html += me.htmlCls.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
        html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
        html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';

        return html;
    }

    setThicknessHtml(type) { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        // type == '3dprint' or 'style'
        let linerad =(type == '3dprint') ? '1' : '0.1';
        let coilrad =(type == '3dprint') ? '1.2' : '0.3';
        let stickrad =(type == '3dprint') ? '0.8' : '0.4';
        let tracerad =(type == '3dprint') ? '1' : '0.2';
        let ballscale =(type == '3dprint') ? '0.6' : '0.3';
        let ribbonthick =(type == '3dprint') ? '1' : '0.2';
        let prtribbonwidth =(type == '3dprint') ? '2' : '1.3';
        let nucleotideribbonwidth =(type == '3dprint') ? '1.4' : '0.8';

        let shininess = 40;
        let light1 = 0.6;
        let light2 = 0.4;
        let light3 = 0.2;
        let bGlycansCartoon = 0;

        // retrieve from cache
        if(type == 'style') {
            if(this.getCookie('shininess') != '') {
                shininess = parseFloat(this.getCookie('shininess'));
            }

            if(this.getCookie('light1') != '') {
                light1 = parseFloat(this.getCookie('light1'));
                light2 = parseFloat(this.getCookie('light2'));
                light3 = parseFloat(this.getCookie('light3'));
            }

            if(this.getCookie('lineRadius') != '') {
                linerad = parseFloat(this.getCookie('lineRadius'));
                coilrad = parseFloat(this.getCookie('coilWidth'));
                stickrad = parseFloat(this.getCookie('cylinderRadius'));
                tracerad = parseFloat(this.getCookie('traceRadius'));
                ballscale = parseFloat(this.getCookie('dotSphereScale'));
                ribbonthick = parseFloat(this.getCookie('ribbonthickness'));
                prtribbonwidth = parseFloat(this.getCookie('helixSheetWidth'));
                nucleotideribbonwidth = parseFloat(this.getCookie('nucleicAcidWidth'));
            }

            if(this.getCookie('glycan') != '') {
                bGlycansCartoon = parseFloat(this.getCookie('glycan'));
            }

            html += "<b>Note</b>: The following parameters will be saved in cache. You just need to set them once. <br><br>";

            html += "<b>1. Shininess</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "shininess' value='" + shininess + "' size=4>" + me.htmlCls.space3 + "(for the shininess of the 3D objects, default 40)<br/><br/>";
            html += "<b>2. Three directional lights</b>: <br>";
            html += "<b>Key Light</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "light1' value='" + light1 + "' size=4>" + me.htmlCls.space3 + "(for the light strength of the key light, default 0.6)<br/>";
            html += "<b>Fill Light</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "light2' value='" + light2 + "' size=4>" + me.htmlCls.space3 + "(for the light strength of the fill light, default 0.4)<br/>";
            html += "<b>Back Light</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "light3' value='" + light3 + "' size=4>" + me.htmlCls.space3 + "(for the light strength of the back light, default 0.2)<br/><br/>";
            html += "<b>3. Thickness</b>: <br>";
        }

        html += "<b>Line Radius</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "linerad_" + type + "' value='" + linerad + "' size=4>" + me.htmlCls.space3 + "(for stabilizers, hydrogen bonds, distance lines, default 0.1)<br/>";
        html += "<b>Coil Radius</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "coilrad_" + type + "' value='" + coilrad + "' size=4>" + me.htmlCls.space3 + "(for coils, default 0.3)<br/>";
        html += "<b>Stick Radius</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "stickrad_" + type + "' value='" + stickrad + "' size=4>" + me.htmlCls.space3 + "(for sticks, default 0.4)<br/>";
        html += "<b>Trace Radius</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "tracerad_" + type + "' value='" + tracerad + "' size=4>" + me.htmlCls.space3 + "(for C alpha trace, O3' trace, default 0.2)<br/>";

        html += "<b>Ribbon Thickness</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "ribbonthick_" + type + "' value='" + ribbonthick + "' size=4>" + me.htmlCls.space3 + "(for helix and sheet ribbons, nucleotide ribbons, default 0.2)<br/>";
        html += "<b>Protein Ribbon Width</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "prtribbonwidth_" + type + "' value='" + prtribbonwidth + "' size=4>" + me.htmlCls.space3 + "(for helix and sheet ribbons, default 1.3)<br/>";
        html += "<b>Nucleotide Ribbon Width</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "nucleotideribbonwidth_" + type + "' value='" + nucleotideribbonwidth + "' size=4>" + me.htmlCls.space3 + "(for nucleotide ribbons, default 0.8)<br/>";

        html += "<b>Ball Scale</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "ballscale_" + type + "' value='" + ballscale + "' size=4>" + me.htmlCls.space3 + "(for styles 'Ball and Stick' and 'Dot', default 0.3)<br/>";

        if(type == 'style') {
            html += "<br><b>4. Show Glycan Cartoon</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "glycan' value='" + bGlycansCartoon + "' size=4>" + me.htmlCls.space3 + "(0: hide, 1: show, default 0)<br/><br/>";
        }

        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "apply_thickness_" + type + "'>Apply</button></span>&nbsp;&nbsp;&nbsp;";

        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "reset_thickness_" + type + "'>Reset</button></span>";

        return html;
    }

    getCookie(cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }

    setSequenceGuide(suffix, bShown) { let me = this.icn3dui, ic = me.icn3d;
      let sequencesHtml = '';

      let index =(ic && ic.defNames2Atoms) ? Object.keys(ic.defNames2Atoms).length : 1;

      if(bShown) {
         sequencesHtml += me.htmlCls.divStr + "seqguide" + suffix + "'>";
     }
     else {
         sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'seqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'seqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

         sequencesHtml += "<div style='min-width:200px; display:inline-block;'><b>Selection:</b> Name: " + me.htmlCls.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> " + me.htmlCls.space2 + "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button></div><br/>";

         sequencesHtml += me.htmlCls.divStr + "seqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";
     }

      sequencesHtml += this.getSelectionHints();

      let resCategories = "<b>Residue labeling:</b> standard residue with coordinates: UPPER case letter; nonstandard residue with coordinates: the first UPPER case letter plus a period except that water residue uses the letter 'O'; residue missing coordinates: lower case letter.";
      let scroll =(me.utilsCls.isMac() && !me.utilsCls.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

      sequencesHtml += resCategories + scroll + "<br/></div>";

      return sequencesHtml;
    }

    setAlignSequenceGuide(suffix, bShown) { let me = this.icn3dui, ic = me.icn3d;
      let sequencesHtml = '';
      suffix = '';

      let index =(ic && ic.defNames2Atoms) ? Object.keys(ic.defNames2Atoms).length : 1;

      sequencesHtml += '<div style="width:20px; margin-left:3px; display:inline-block;"><span id="' + me.pre + 'alignseqguide' + suffix + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'alignseqguide' + suffix + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div> ';

      sequencesHtml += "<div style='min-width:200px; display:inline-block;''><b>Selection:</b> Name: " + me.htmlCls.inputTextStr + "id='" + me.pre + "alignseq_command_name' value='alseq_" + index + "' size='10'> " + me.htmlCls.space2 + "<button style='white-space:nowrap;' id='" + me.pre + "alignseq_saveselection'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "alignseq_clearselection'>Clear</button></div><br/>";

      sequencesHtml += me.htmlCls.divStr + "alignseqguide" + suffix + "' style='display:none; white-space:normal;' class='icn3d-box'>";

      sequencesHtml += this.getSelectionHints();

      let resCategories = "<b>Residue labeling:</b> aligned residue with coordinates: UPPER case letter; non-aligned residue with coordinates: lower case letter which can be highlighted; residue missing coordinates: lower case letter which can NOT be highlighted.";
      let scroll =(me.utilsCls.isMac() && !me.utilsCls.isMobile()) ? "<br/><br/><b>Turn on scroll bar:</b> System preferences -> General -> show scroll bars -> check Always" : "";

      sequencesHtml += resCategories + scroll + "<br/></div>";

      return sequencesHtml;
    }

    getSelectionHints() { let me = this.icn3dui, ic = me.icn3d;
      let sequencesHtml = '';

      if(!me.utilsCls.isMobile()) {
          sequencesHtml += "<b>Select on 1D sequences:</b> drag to select, drag again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/><br/>";

          sequencesHtml += "<b>Select on 2D interaction diagram:</b> click on the nodes or lines. The nodes are chains and can be united with the Ctrl key. The lines are interactions and can NOT be united. Each click on the lines selects half of the lines, i.e., select the interacting residues in one of the two chains.<br/><br/>";

          let tmpStr = me.utilsCls.isMobile() ? 'use finger to pick' : 'hold "Alt" and use mouse to pick';
          sequencesHtml += "<b>Select on 3D structures:</b> " + tmpStr + ", click the second time to deselect, hold \"Ctrl\" to union selection, hold \"Shift\" to select a range, press the up/down arrow to switch among atom/residue/strand/chain/structure, click \"Save Selection\" to save the current selection.<br/><br/>";

          sequencesHtml += "<b>Save the current selection</b>(either on 3D structure, 2D interactions, or 1D sequence): open the menu \"Select -> Save Selection\", specify the name and description for the selection, and click \"Save\".<br/><br/>";
      }
      else {
            sequencesHtml += "<b>Select Aligned Sequences:</b> touch to select, touch again to deselect, multiple selection is allowed without Ctrl key, click \"Save Selection\" to save the current selection.<br/>";
      }

      return sequencesHtml;
    }

    addGsizeSalt(name) { let me = this.icn3dui, ic = me.icn3d;
        let html = "";

        html += "<span style='white-space:nowrap;font-weight:bold;'>Grid Size: <select id='" + me.pre + name + "gsize'>";

        let optArray1c = ['65', '97', '129'];
        html += this.getOptionHtml(optArray1c, 0);

        html += "</select></span>";

        html += "<span style='white-space:nowrap;font-weight:bold;margin-left:30px;'>Salt Concentration: <select id='" + me.pre + name + "salt'>";

        let optArray1d = ['0', '0.15'];
        html += this.getOptionHtml(optArray1d, 1);

        html += "</select> M</span><br/>";

        return html;
    }

    getFootHtml(type, tabName) { let me = this.icn3dui, ic = me.icn3d;
        let footHtml = "<div style='width:500px;'>";

        if(type == 'delphi') {
            if(me.cfg.cid) {
                footHtml += "<b>Note</b>: Partial charges(MMFF94) are from PubChem Compound SDF files.<br/><br/>";
            }
            else {
                footHtml += "<b>Note</b>: Only the selected residues are used for <a href='http://honig.c2b2.columbia.edu/delphi'>DelPhi</a> potential calculation by solving linear Poisson-Boltzmann equation.";

                footHtml += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
                  + me.pre + tabName + '_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
                  + me.pre + tabName + '_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
                footHtml += me.htmlCls.divStr + tabName + "' style='display:none;'>";

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
            footHtml += me.htmlCls.divStr + tabName + "' style='display:none;'>";

            footHtml += "The PDB file can be loaded in the URL with \"pdbid=\" or at \"File > Open File\". The PQR file can be prepared at the menu \"Analysis > Download PQR\" with your modification or using other tools. The DelPhi potential file can be calculated at <a href='http://compbio.clemson.edu/sapp/delphi_webserver/'>DelPhi Web Server</a> and be exported as a Cube file. ";

            if(type == 'url') footHtml += "The PQR or potential file can be accessed in a URL if it is located in the same host as iCn3D.";

            footHtml += "<br/><br/>";

            footHtml += "</div>";
        }
        footHtml += "</div>";

        return footHtml;
    }

    getPotentialHtml(type, dialogClass) { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        let name0, name1, name2;
        let tab1, tab2, tab3;
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

        html += me.htmlCls.divStr + "dl_" + name1 + "' class='" + dialogClass + "'>";
        html += me.htmlCls.divStr + "dl_" + name1 + "_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + name1 + "tab1'>" + tab1 + "</a></li>";
        html += "<li><a href='#" + me.pre + name1 + "tab2'>" + tab2 + "</a></li>";
        //html += "<li><a href='#" + me.pre + name1 + "tab3'>" + tab3 + "</a></li>";
        html += "</ul>";

        html += me.htmlCls.divStr + name1 + "tab1'>";
        if(type == 'delphi') html += this.addGsizeSalt(name1) + "<br>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>Potential contour at: <select id='" + me.pre + name1 + "contour'>";

        let optArray1b = ['0.5', '1', '2', '4', '6', '8', '10'];
        html += this.getOptionHtml(optArray1b, 1);

        html += "</select> kT/e(25.6mV at 298K)</span><br/><br/>";

        let htmlTmp;

        // tab1: equipotential map
        if(type == 'delphi') {
            html += me.htmlCls.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>";
            html += me.htmlCls.buttonStr + name1 + "mapNo' style='margin-left:30px;'>Remove Map</button><br>";
        }
        else if(type == 'local') {
            html += me.htmlCls.divStr + name1 + "tab1_tabs' style='border:0px;'>";
            html += "<ul>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name0 + "'>PQR</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name1 + "'>Phi</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name2 + "'>Cube</a></li>";
            html += "</ul>";

            htmlTmp = "<span style='margin-left:30px'>" + me.htmlCls.buttonStr + name1 + "mapNo'>Remove Map</button></span></div>";

            html += me.htmlCls.divStr + name1 + "tab1_" + name0 + "'>";
            html += this.addGsizeSalt(name0) + "<br>";
            html += "<b>PQR File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name0 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name0 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab1_" + name1 + "'>";
            html += "<b>Phi File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name1 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab1_" + name2 + "'>";
            html += "<b>Cube File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name2 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name2 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += "</div>";
        }
        else if(type == 'url') {
            html += me.htmlCls.divStr + name1 + "tab1_tabs' style='border:0px;'>";
            html += "<ul>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name0 + "2'>PQR</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name1 + "2'>Phi</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab1_" + name2 + "2'>Cube</a></li>";
            html += "</ul>";

            htmlTmp = "<span style='margin-left:30px'>" + me.htmlCls.buttonStr + name1 + "mapNo'>Remove Map</button></span></div>";

            html += me.htmlCls.divStr + name1 + "tab1_" + name0 + "2'>";
            html += this.addGsizeSalt(name0) + "<br>";
            html += "<b>PQR URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name0 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name0 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab1_" + name1 + "2'>";
            html += "<b>Phi URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name1 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name1 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab1_" + name2 + "2'>";
            html += "<b>Cube URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name2 + "file'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name2 + "file' style='margin-top: 6px;'>Equipotential Map</button>" + htmlTmp;

            html += "</div>";
        }

        html += "<br>" + this.getFootHtml(type, name1 + "tab1_foot");
        html += "</div>";

        html += me.htmlCls.divStr + name1 + "tab2'>";
        if(type == 'delphi') html += this.addGsizeSalt(name1) + "<br>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>Surface with max potential at: <select id='" + me.pre + name1 + "contour2'>";

        let optArray1c = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        html += this.getOptionHtml(optArray1c, 2);

        html += "</select> kT/e(25.6mV at 298K)</span><br/><br/>";

        html += "<b>Surface</b>: <select id='" + me.pre + name1 + "surftype'>";
        html += "<option value='21'>Van der Waals</option>";
        html += "<option value='22' selected>Molecular Surface</option>";
        html += "<option value='23'>Solvent Accessible</option>";
        html += "</select>";

        html += "<span style='margin-left:20px'><b>Opacity</b>: <select id='" + me.pre + name1 + "surfop'>";
        let surfOp = ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'];
        html += this.getOptionHtml(surfOp, 0);
        html += "</select></span>";

        html += "<span style='margin-left:20px'><b>Wireframe</b>: <select id='" + me.pre + name1 + "surfwf'>";
        html += "<option value='yes'>Yes</option>";
        html += "<option value='no' selected>No</option>";
        html += "</select></span><br/>";

        html += "<br/>";

        // tab2: surface with potential
        if(type == 'delphi') {
            html += me.htmlCls.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>";
            html += me.htmlCls.buttonStr + name1 + "mapNo2' style='margin-left:30px;'>Remove Surface</button><br>";
        }
        else if(type == 'local') {
            html += me.htmlCls.divStr + name1 + "tab2_tabs' style='border:0px;'>";
            html += "<ul>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name0 + "'>PQR</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name1 + "'>Phi</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name2 + "'>Cube</a></li>";
            html += "</ul>";

            htmlTmp = "<span style='margin-left:30px'>" + me.htmlCls.buttonStr + name1 + "mapNo2'>Remove Surface</button></span></div>";

            html += me.htmlCls.divStr + name1 + "tab2_" + name0 + "'>";
            html += this.addGsizeSalt(name0 + "2") + "<br>";
            html += "<b>PQR File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name0 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name0 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab2_" + name1 + "'>";
            html += "<b>Phi File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name1 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab2_" + name2 + "'>";
            html += "<b>Cube File</b>: " + me.htmlCls.inputFileStr + "id='" + me.pre + name2 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name2 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += "</div>";
        }
        else if(type == 'url') {
            html += me.htmlCls.divStr + name1 + "tab2_tabs' style='border:0px;'>";
            html += "<ul>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name0 + "2'>PQR</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name1 + "2'>Phi</a></li>";
            html += "<li><a href='#" + me.pre + name1 + "tab2_" + name2 + "2'>Cube</a></li>";
            html += "</ul>";

            htmlTmp = "<span style='margin-left:30px'>" + me.htmlCls.buttonStr + name1 + "mapNo2'>Remove Surface</button></span></div>";

            html += me.htmlCls.divStr + name1 + "tab2_" + name0 + "2'>";
            html += this.addGsizeSalt(name0 + "2") + "<br>";
            html += "<b>PQR URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name0 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name0 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab2_" + name1 + "2'>";
            html += "<b>Phi URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name1 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name1 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += me.htmlCls.divStr + name1 + "tab2_" + name2 + "2'>";
            html += "<b>Cube URL</b> in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + name2 + "file2'> <br><br>" + me.htmlCls.buttonStr + "reload_" + name2 + "file2' style='margin-top: 6px;'>Surface with Potential</button>" + htmlTmp;

            html += "</div>";
        }

        html += "<br>" + this.getFootHtml(type, name1 + "tab2_foot");
        html += "</div>";

        //html += me.htmlCls.divStr + name1 + "tab3'>";

        //html += me.htmlCls.buttonStr + name1 + "pdb'>Download PDB</button> ";
        //html += me.htmlCls.buttonStr + name1 + "pqr' style='margin-left:30px'>Download PQR</button>(with partial charges)<br>";

        //html += "<br>" + footHtml;
        //html += "</div>";

        html += "</div>";
        html += "</div>";

        return html;
    }

    exportPqr() { let me = this.icn3dui, ic = me.icn3d;
       let chainHash = {}, ionHash = {}
       let atomHash = {}
    /*
       for(let i in ic.hAtoms) {
           let atom = ic.atoms[i];

           if(ic.ions.hasOwnProperty(i)) {
             ionHash[i] = 1;
           }
           else {
             chainHash[atom.structure + '_' + atom.chain] = 1;
           }
       }

       for(let chainid in chainHash) {
           atomHash = me.hashUtilsCls.unionHash(atomHash, ic.chains[chainid]);
       }
    */

       let atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
       for(let i in atoms) {
           let atom = ic.atoms[i];

           if(ic.ions.hasOwnProperty(i)) {
             ionHash[i] = 1;
           }
           else {
             atomHash[i] = 1;
           }
       }

       if(me.cfg.cid) {
          let pqrStr = '';
          pqrStr += ic.saveFileCls.getPDBHeader();
          pqrStr += ic.saveFileCls.getAtomPDB(atomHash, true) + ic.saveFileCls.getAtomPDB(ionHash, true);

          let file_pref =(ic.inputid) ? ic.inputid : "custom";
          ic.saveFileCls.saveFile(file_pref + '_icn3d.pqr', 'text', [pqrStr]);
       }
       else {
           let bCalphaOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms));
           if(bCalphaOnly) {
               alert("The potential will not be shown because the side chains are missing in the structure...");
               return;
           }

           let pdbstr = '';
           pdbstr += ic.saveFileCls.getPDBHeader();

           pdbstr += ic.saveFileCls.getAtomPDB(atomHash);
           pdbstr += ic.saveFileCls.getAtomPDB(ionHash, true);

           let url = "https://www.ncbi.nlm.nih.gov/Structure/delphi/delphi.fcgi";

           let pdbid =(me.cfg.cid) ? me.cfg.cid : Object.keys(ic.structures).toString();

           $.ajax({
              url: url,
              type: 'POST',
              data : {'pdb2pqr': pdbstr, 'pdbid': pdbid},
              dataType: 'text',
              cache: true,
              tryCount : 0,
              retryLimit : 0, //1,
              beforeSend: function() {
                  ic.ParserUtilsCls.showLoading();
              },
              complete: function() {
                  ic.ParserUtilsCls.hideLoading();
              },
              success: function(data) {
                  let pqrStr = data;

                  let file_pref =(ic.inputid) ? ic.inputid : "custom";
                  ic.saveFileCls.saveFile(file_pref + '_icn3d_residues.pqr', 'text', [pqrStr]);
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if(this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
              }
           });
       }
    }

    clickReload_pngimage() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;
        me.myEventCls.onIds("#" + me.pre + "reload_pngimage", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           if(!me.cfg.notebook) dialog.dialog( "close" );
           //close all dialog
           if(!me.cfg.notebook) {
               $(".ui-dialog-content").dialog("close");
           }
           else {
               ic.resizeCanvasCls.closeDialogs();
           }
           // initialize icn3dui
           //me.initUI();
           ic.init();
           let file = $("#" + me.pre + "pngimage")[0].files[0];
           if(!file) {
             alert("Please select a file before clicking 'Load'");
           }
           else {
             thisClass.fileSupport();
             let reader = new FileReader();
             reader.onload = function(e) {
               let imageStr = e.target.result; // or = reader.result;
               thisClass.loadPng(imageStr);
/*
               let matchedStr = 'Share Link: ';
               let pos = imageStr.indexOf(matchedStr);
               let matchedStrState = "Start of state file======\n";
               let posState = imageStr.indexOf(matchedStrState);
               if(pos == -1 && posState == -1) {
                   alert('Please load a PNG image saved by clicking "Save Datas > PNG Image" in the Data menu...');
               }
               else if(pos != -1) {
                   let url = imageStr.substr(pos + matchedStr.length);
                   me.htmlCls.clickMenuCls.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
                   window.open(url);
               }
               else if(posState != -1) {
                   let matchedStrData = "Start of data file======\n";
                   let posData = imageStr.indexOf(matchedStrData);
                   ic.bInputfile =(posData == -1) ? false : true;
                   if(ic.bInputfile) {
                       let posDataEnd = imageStr.indexOf("End of data file======\n");
                       let data = imageStr.substr(posData + matchedStrData.length, posDataEnd - posData - matchedStrData.length);
                       ic.InputfileData = data;

                       let matchedStrType = "Start of type file======\n";
                       let posType = imageStr.indexOf(matchedStrType);
                       let posTypeEnd = imageStr.indexOf("End of type file======\n");
                       let type = imageStr.substr(posType + matchedStrType.length, posTypeEnd - posType - matchedStrType.length - 1); // remove the new line char
                       ic.InputfileType = type;

                       //var matchedStrState = "Start of state file======\n";
                       //var posState = imageStr.indexOf(matchedStrState);
                       let posStateEnd = imageStr.indexOf("End of state file======\n");
                       let statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                       statefile = decodeURIComponent(statefile);
                        if(type === 'pdb') {
                            $.when( ic.pdbParserCls.loadPdbData(data))
                             .then(function() {
                                 ic.commands = [];
                                 ic.optsHistory = [];
                                 ic.loadScriptCls.loadScript(statefile, true);
                             });
                        }
                        else {
                            if(type === 'mol2') {
                                ic.mol2ParserCls.loadMol2Data(data);
                            }
                            else if(type === 'sdf') {
                                ic.sdfParserCls.loadSdfData(data);
                            }
                            else if(type === 'xyz') {
                                ic.xyzParserCls.loadXyzData(data);
                            }
                            else if(type === 'mmcif') {
                                ic.mmcifParserCls.loadMmcifData(data);
                            }
                           ic.commands = [];
                           ic.optsHistory = [];
                           ic.loadScriptCls.loadScript(statefile, true);
                       }
                   }
                   else { // url length > 4000
                       //var matchedStrState = "Start of state file======\n";
                       //var posState = imageStr.indexOf(matchedStrState);
                       let posStateEnd = imageStr.indexOf("End of state file======\n");
                       let statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
                       statefile = decodeURIComponent(statefile);
                       ic.commands = [];
                       ic.optsHistory = [];
                       ic.loadScriptCls.loadScript(statefile, true);
                   }
                   me.htmlCls.clickMenuCls.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
               }
*/
             }
             reader.readAsText(file);
           }
        });
    }

    loadPng(imageStr) { let me = this.icn3dui, ic = me.icn3d;
       let matchedStr = 'Share Link: ';
       let pos = imageStr.indexOf(matchedStr);
       let matchedStrState = "Start of state file======\n";
       let posState = imageStr.indexOf(matchedStrState);
       if(pos == -1 && posState == -1) {
           alert('Please load a PNG image saved by clicking "Save Datas > PNG Image" in the Data menu...');
       }
       else if(pos != -1) {
           let url = imageStr.substr(pos + matchedStr.length);
           me.htmlCls.clickMenuCls.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
           window.open(url);
       }
       else if(posState != -1) {
           let matchedStrData = "Start of data file======\n";
           let posData = imageStr.indexOf(matchedStrData);
           ic.bInputfile =(posData == -1) ? false : true;
           if(ic.bInputfile) {
               let posDataEnd = imageStr.indexOf("End of data file======\n");
               let data = imageStr.substr(posData + matchedStrData.length, posDataEnd - posData - matchedStrData.length);
               ic.InputfileData = data;

               let matchedStrType = "Start of type file======\n";
               let posType = imageStr.indexOf(matchedStrType);
               let posTypeEnd = imageStr.indexOf("End of type file======\n");
               let type = imageStr.substr(posType + matchedStrType.length, posTypeEnd - posType - matchedStrType.length - 1); // remove the new line char
               ic.InputfileType = type;

               //var matchedStrState = "Start of state file======\n";
               //var posState = imageStr.indexOf(matchedStrState);
               let posStateEnd = imageStr.indexOf("End of state file======\n");
               let statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
               statefile = decodeURIComponent(statefile);
                if(type === 'pdb') {
                    $.when( ic.pdbParserCls.loadPdbData(data))
                     .then(function() {
                         ic.commands = [];
                         ic.optsHistory = [];
                         ic.loadScriptCls.loadScript(statefile, true);
                     });
                }
                else {
                    if(type === 'mol2') {
                        ic.mol2ParserCls.loadMol2Data(data);
                    }
                    else if(type === 'sdf') {
                        ic.sdfParserCls.loadSdfData(data);
                    }
                    else if(type === 'xyz') {
                        ic.xyzParserCls.loadXyzData(data);
                    }
                    else if(type === 'mmcif') {
                        ic.mmcifParserCls.loadMmcifData(data);
                    }
                   ic.commands = [];
                   ic.optsHistory = [];
                   ic.loadScriptCls.loadScript(statefile, true);
               }
           }
           else { // url length > 4000
               //var matchedStrState = "Start of state file======\n";
               //var posState = imageStr.indexOf(matchedStrState);
               let posStateEnd = imageStr.indexOf("End of state file======\n");
               let statefile = imageStr.substr(posState + matchedStrState.length, posStateEnd - posState- matchedStrState.length);
               statefile = decodeURIComponent(statefile);
               ic.commands = [];
               ic.optsHistory = [];
               ic.loadScriptCls.loadScript(statefile, true);
           }
           me.htmlCls.clickMenuCls.setLogCmd('load iCn3D PNG image ' + $("#" + me.pre + "pngimage").val(), false);
       }
    }

    fileSupport() {
         if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }
    }

    getLinkColor() {
        let graphStr2 = '';
        graphStr2 += ', linkmap: {\n';
        graphStr2 += '3: {"type": "peptidebond", "c":""},\n';
        graphStr2 += '4: {"type": "ssbond", "c":"FFA500"},\n';
        graphStr2 += '5: {"type": "ionic", "c":"0FF"},\n';
        graphStr2 += '6: {"type": "ionicInside", "c":"FFF"},\n';
        graphStr2 += '11: {"type": "contact", "c":"888"},\n';
        graphStr2 += '12: {"type": "contactInside", "c":"FFF"},\n';
        graphStr2 += '13: {"type": "hbond", "c":"0F0"},\n';
        graphStr2 += '14: {"type": "hbondInside", "c":"FFF"},\n';
        graphStr2 += '15: {"type": "clbond", "c":"006400"},\n';
        graphStr2 += '17: {"type": "halogen", "c":"F0F"},\n';
        graphStr2 += '18: {"type": "halogenInside", "c":"FFF"},\n';
        graphStr2 += '19: {"type": "pication", "c":"F00"},\n';
        graphStr2 += '20: {"type": "picationInside", "c":"FFF"},\n';
        graphStr2 += '21: {"type": "pistacking", "c":"00F"},\n';
        graphStr2 += '22: {"type": "pistackingInside", "c":"FFF"}\n';
        graphStr2 += '}}\n';

        return graphStr2;
    }

    setCookieForThickness() { let me = this.icn3dui, ic = me.icn3d;
        if(!me.bNode) { // && postfix == 'style') {
            let exdays = 3650; // 10 years

            this.setCookie('lineRadius', ic.lineRadius, exdays);
            this.setCookie('coilWidth', ic.coilWidth, exdays);
            this.setCookie('cylinderRadius', ic.cylinderRadius, exdays);
            this.setCookie('traceRadius', ic.traceRadius, exdays);
            this.setCookie('dotSphereScale', ic.dotSphereScale, exdays);
            this.setCookie('ribbonthickness', ic.ribbonthickness, exdays);
            this.setCookie('helixSheetWidth', ic.helixSheetWidth, exdays);
            this.setCookie('nucleicAcidWidth', ic.nucleicAcidWidth, exdays);
        }
    }

    setLineThickness(postfix, bReset) { let me = this.icn3dui, ic = me.icn3d;
        ic.bSetThickness = true;

        if(postfix == 'style') {
            if(bReset) {
                $("#" + me.pre + "shininess").val('40');
                $("#" + me.pre + "light1").val('0.6');
                $("#" + me.pre + "light2").val('0.4');
                $("#" + me.pre + "light3").val('0.2');
                $("#" + me.pre + "glycan").val('0');
            }

            ic.shininess = parseFloat($("#" + me.pre + "shininess").val()); //40;
            ic.light1 = parseFloat($("#" + me.pre + "light1").val()); //0.6;
            ic.light2 = parseFloat($("#" + me.pre + "light2").val()); //0.4;
            ic.light3 = parseFloat($("#" + me.pre + "light3").val()); //0.2;
            ic.bGlycansCartoon = parseInt($("#" + me.pre + "glycan").val()); //0;
        }

        if(bReset) {
            $("#" + me.pre + "linerad_" + postfix ).val(0.1); //0.1; // hbonds, distance lines
            $("#" + me.pre + "coilrad_" + postfix ).val(0.4); //0.4; // style cartoon-coil
            $("#" + me.pre + "stickrad_" + postfix ).val(0.4); //0.4; // style stick
            $("#" + me.pre + "stickrad_" + postfix ).val(0.2); //0.2; // style c alpha trace, nucleotide stick
            $("#" + me.pre + "ballscale_" + postfix ).val(0.3); //0.3; // style ball and stick, dot
            $("#" + me.pre + "ribbonthick_" + postfix ).val(0.4); //0.4; // style ribbon, nucleotide cartoon, stand thickness
            $("#" + me.pre + "prtribbonwidth_" + postfix ).val(1.3); //1.3; // style ribbon, stand thickness
            $("#" + me.pre + "nucleotideribbonwidth_" + postfix ).val(0.8); //0.8; // nucleotide cartoon
        }

        ic.lineRadius = parseFloat($("#" + me.pre + "linerad_" + postfix ).val()); //0.1; // hbonds, distance lines
        ic.coilWidth = parseFloat($("#" + me.pre + "coilrad_" + postfix ).val()); //0.4; // style cartoon-coil
        ic.cylinderRadius = parseFloat($("#" + me.pre + "stickrad_" + postfix ).val()); //0.4; // style stick
        ic.traceRadius = parseFloat($("#" + me.pre + "stickrad_" + postfix ).val()); //0.2; // style c alpha trace, nucleotide stick
        ic.dotSphereScale = parseFloat($("#" + me.pre + "ballscale_" + postfix ).val()); //0.3; // style ball and stick, dot
        ic.ribbonthickness = parseFloat($("#" + me.pre + "ribbonthick_" + postfix ).val()); //0.4; // style ribbon, nucleotide cartoon, stand thickness
        ic.helixSheetWidth = parseFloat($("#" + me.pre + "prtribbonwidth_" + postfix ).val()); //1.3; // style ribbon, stand thickness
        ic.nucleicAcidWidth = parseFloat($("#" + me.pre + "nucleotideribbonwidth_" + postfix ).val()); //0.8; // nucleotide cartoon

        // save to cache
        if(!me.bNode) { // && postfix == 'style') {
            let exdays = 3650; // 10 years
            this.setCookie('shininess', ic.shininess, exdays);
            this.setCookie('light1', ic.light1, exdays);
            this.setCookie('light2', ic.light2, exdays);
            this.setCookie('light3', ic.light3, exdays);
            this.setCookie('glycan', ic.bGlycansCartoon, exdays);
        }

        this.setCookieForThickness();

        if(postfix = '3dprint' && bReset) {
           let select = "reset thickness";
           me.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.bSetThickness = false;
           ic.threeDPrintCls.resetAfter3Dprint();
        }
        else {
            me.htmlCls.clickMenuCls.setLogCmd('set thickness | linerad ' + ic.lineRadius + ' | coilrad ' + ic.coilWidth + ' | stickrad ' + ic.cylinderRadius + ' | tracerad ' + ic.traceRadius + ' | ribbonthick ' + ic.ribbonthickness + ' | proteinwidth ' + ic.helixSheetWidth + ' | nucleotidewidth ' + ic.nucleicAcidWidth  + ' | ballscale ' + ic.dotSphereScale, true);
        }

        ic.drawCls.draw();
    }

    setCookie(cname, cvalue, exdays) {
      let d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      let expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    updateSurfPara(type) { let me = this.icn3dui, ic = me.icn3d;
       ic.phisurftype = $("#" + me.pre + type + "surftype").val();
       ic.phisurfop = $("#" + me.pre + type + "surfop").val();
       ic.phisurfwf = $("#" + me.pre + type + "surfwf").val();
    }

    exportPdb() { let me = this.icn3dui, ic = me.icn3d;
       let pdbStr = '';
       pdbStr += ic.saveFileCls.getPDBHeader();
       let atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
       //pdbStr += ic.saveFileCls.getAtomPDB(atoms, undefined, true);
       pdbStr += ic.saveFileCls.getAtomPDB(atoms);

       let file_pref =(ic.inputid) ? ic.inputid : "custom";
       ic.saveFileCls.saveFile(file_pref + '_icn3d.pdb', 'text', [pdbStr]);
    }
}

export {SetHtml}
