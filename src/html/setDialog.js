/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class SetDialog {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    //A placeholder for all custom dialogs.
    setCustomDialogs() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return '';

        let html = "";
        return html;
    }

    getHtmlAlignResidueByResidue(chainids, predefinedid, buttonid) { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        html += "All chains will be aligned to the first chain in the comma-separated chain IDs. Each chain ID has the form of PDBID_chain (e.g., 1HHO_A, case sensitive) or UniprotID (e.g., P69905 for AlphaFold structures).<br/><br/>";
        html += "<b>Chain IDs</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + chainids + "' value='P69905,P01942,1HHO_A' size=50><br/><br/>";
        
        html += "Each alignment is defined as \" | \"-separated residue lists in one line. \"10-50\" means a range of residues from 10 to 50.<br><textarea id='" + me.pre + predefinedid + "' rows='5' style='width: 100%; height: " +(me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'>1,5,10-50 | 1,5,10-50\n2,6,11-51 | 1,5,10-50</textarea><br/>";
        html += me.htmlCls.buttonStr + buttonid + "'><b>Align Residue by Residue</b></button><br/>";
        return html;
    }

    addNotebookTitle(id, title, bAddExtraDiv) { let me = this.icn3dui, ic = me.icn3d;
        //return '<div id="' + me.pre + id + '_nb" style="display:none; background-color:#1c94c4; width:100%"><span style="color:white; font-weight:bold">' + title + '</span>&nbsp;&nbsp;&nbsp;<span onclick="$(\'#' + me.pre + id + '\').hide(); return false;" class="icn3d-nbclose" title="Close">x</span></div>';

        let html = '<div id="' + me.pre + id + '_nb" style="display:none; background-color:#5C9CCC; width:100%"><span id="' + me.pre + id + '_title" style="color:white; font-weight:bold">' + title + '</span>&nbsp;&nbsp;&nbsp;<div onclick="$(\'#' + me.pre + id + '\').hide(); return false;" class="icn3d-nbclose ui-icon ui-icon-close" title="Close"></div></div>';

        if(bAddExtraDiv) {
            html += '<div id="' + me.pre + id + '_html"></div>';
        }

        return html;
    }

    //Set the html for all popup dialogs.
    setDialogs() { let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return '';

        let html = "";

        let defaultColor = "#ffff00"; //ic.colorBlackbkgd; 
 
        me.htmlCls.optionStr = "<option value=";

        html += "<!-- dialog will not be part of the form -->";

        let divClass =(me.cfg.notebook) ? '' : 'icn3d-hidden';
        let dialogClass =(me.cfg.notebook) ? 'icn3d-hidden' : '';
        //html += me.htmlCls.divStr + "alldialogs' class='" + divClass + " icn3d-dialog' style='margin-top:" + me.htmlCls.CMD_HEIGHT + "px'>";
        html += me.htmlCls.divStr + "alldialogs' class='" + divClass + " icn3d-dialog' style='margin-top:12px'>";

        html += me.htmlCls.divStr + "dl_2ddgm' class='" + dialogClass + " icn3d-dl_2ddgm' style='background-color:white'>";
        html += this.addNotebookTitle('dl_2ddgm', '2D Diagram', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_2dctn' class='" + dialogClass + " icn3d-dl_2dctn' style='background-color:white'>";
        html += this.addNotebookTitle('dl_2dctn', '2D Cartoon');

        me.svgid_ct = me.pre + "icn3d_cartoon";

        let buttonStrTmp = '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDD;" id="';
        let tmpStr = 'icn3d-node-text';
        html += me.htmlCls.divNowrapStr + "Dynamically generated for selected residues. <br>Nodes can be dragged or clicked.</div>";
        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.svgid_ct + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.svgid_ct + '_png">PNG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.svgid_ct + '_json">JSON</button><br>';
        html += "<b>Label</b>: <select id='" + me.svgid_ct + "_label'>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "0'>No</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "4'>4px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "8' selected>8px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "12'>12px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "16'>16px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "24'>24px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "32'>32px</option>";
        html += "</select>";
        html += "</div>";

        html += "<svg id='" + me.svgid_ct + "' viewBox='" + "0,0," + me.htmlCls.width2d + "," + me.htmlCls.width2d + "'>";
        html += "</svg>";

        html += "</div>";

    //    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || ic.bRealign || ic.bSymd) {
          html += me.htmlCls.divStr + "dl_alignment' class='" + dialogClass + "' style='background-color:white;'>";
          html += this.addNotebookTitle('dl_alignment', 'Dynamically Calculated Symmetry using SymD');
          html += me.htmlCls.divStr + "symd_info'></div>";
          html += me.htmlCls.divStr + "alignseqguide_wrapper'><br>" + me.htmlCls.setHtmlCls.setAlignSequenceGuide() + "</div>";
          html += me.htmlCls.divStr + "dl_sequence2' class='icn3d-dl_sequence'>";
          html += this.addNotebookTitle('dl_sequence2', 'Select Residues in Aligned Sequences');
          html += "</div>";
          html += "</div>";
    //    }

        html += me.htmlCls.divStr + "dl_definedsets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_definedsets', 'Defined Sets');
        html += me.htmlCls.divStr + "dl_setsmenu'>";
        html += "<b>Defined Sets:</b> <br/>";
        html += "<select id='" + me.pre + "atomsCustom' multiple size='6' style='min-width:130px;'>";
        html += "</select>";
        html += "<div style='margin: 6px 0 6px 0;'>" + me.htmlCls.buttonStr + "deletesets'><b>Delete Selected Sets</b></button></div>";
        html += '        <b>Set Operations</b>: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'dl_command_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'dl_command_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
        html += "</div>";

        html += me.htmlCls.divStr + "dl_command' style='display:none;'>";
        html += me.htmlCls.divStr + "dl_setoperations'>";
        html += "<label for='" + me.pre + "setOr'>" + me.htmlCls.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setOr' checked> Union(or) </label><br/>";
        html += "<label for='" + me.pre + "setAnd'>" + me.htmlCls.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setAnd'> Intersection(and) </label><br/>";
        html += "<label for='" + me.pre + "setNot'>" + me.htmlCls.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setNot'> Exclusion(not) </label>";
        html += "</div><br>";

        html += me.htmlCls.setHtmlCls.setAdvanced();

        html += "</div>";
        html += "</div>";

        html += me.htmlCls.setHtmlCls.setAdvanced(2);

        html += me.htmlCls.divStr + "dl_vastplus' class='" + dialogClass + "' style='max-width:500px'>";
        html += this.addNotebookTitle('dl_vastplus', 'Please input PDB ID for VAST+');
        html += "Note: <b>VAST+</b> finds other macromolecular structures that have a similar biological unit. To do this, VAST+ takes into consideration the complete set of 3D domains that VAST identified within a query structure, throughout all of its component protein molecules, and finds other macromolecular structures that have a similar set of proteins/3D domains.<br><br>"; 
        html += "PDB ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "vastpluspdbid' value='6VXX' size=8><br>";
        html += me.htmlCls.buttonStr + "reload_vastplus'>VAST+</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_vast' class='" + dialogClass + "' style='max-width:500px'>";
        html += this.addNotebookTitle('dl_vast', 'Pleaes input chain or PDB file for VAST');
        html += 'Note: <b>VAST</b> identifies 3D domains (substructures) within each protein structure in the Molecular Modeling Database (MMDB), and then finds other protein structures that have one or more similar 3D domains, using purely geometric criteria. You have two ways to do a VAST search.<br><br>'; 

        html += '<b>Option 1</b>, search with your selection (all residues are selected by default) in the loaded structures:<br>'; 
        html += '<form data-ncbi-sg-search="true" method=post enctype=multipart/form-data action="https://www.ncbi.nlm.nih.gov/Structure/vast/VSMmdb.cgi" id="' + me.pre + 'newvs2" name="newvs2" target="_blank">';
        html += '<input type=hidden id="' + me.pre + 'pdbstr" name="pdbstr">';
        html += "Searching against: <input type='radio' name='dataset' value='Non-redundant subset' checked> Medium-redundancy Subset of PDB <a href='https://www.ncbi.nlm.nih.gov/Structure/VAST/vasthelp.html#VASTNR' title='Medium-redundancy Subset' target='_blank'>?</a> <input type='radio' name='dataset' value='All'>All of PDB <br>";
        // the submit value has to be "Submit" in order to make the backend cgi works
        //html += '<input type="submit" name="' + me.pre + 'cmdVSMmdb" value="VAST Search"></input>';
        html += '<input type="submit" id="' + me.pre + 'cmdVSMmdb2" name="cmdVSMmdb" value="Submit"></input>';
        html += "</form><br>";

        html += '<b>Option 2</b>, search with PDB ID and chain name:<br>'; 
        html += "PDB ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "vastpdbid' value='4N7N' size=8> &nbsp;&nbsp;";
        html += "Chain Name: " + me.htmlCls.inputTextStr + "id='" + me.pre + "vastchainid' value='A' size=8> <br>";
        html += me.htmlCls.buttonStr + "reload_vast'>VAST</button><br><br>";

        html += '<b>Option 3</b>, search with a PDB file:<br>'; 
        html += '<form data-ncbi-sg-search="true" method=post enctype=multipart/form-data action="https://www.ncbi.nlm.nih.gov/Structure/vast/VSMmdb.cgi" id="' + me.pre + 'newvs" name="newvs" target="_blank">';
        html += "PDB File: " + me.htmlCls.inputFileStr + " name='pdbfile' size=8><br>";
        html += "Searching against: <input type='radio' name='dataset' value='Non-redundant subset' checked> Medium-redundancy Subset of PDB <a href='https://www.ncbi.nlm.nih.gov/Structure/VAST/vasthelp.html#VASTNR' title='Medium-redundancy Subset' target='_blank'>?</a> <input type='radio' name='dataset' value='All'>All of PDB <br>";
        // the submit value has to be "Submit" in order to make the backend cgi works
        //html += '<input type="submit" name="' + me.pre + 'cmdVSMmdb" value="VAST Search"></input>';
        html += '<input type="submit" id="' + me.pre + 'cmdVSMmdb" name="cmdVSMmdb" value="Submit"></input>';
        html += "</form><br>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_foldseek' class='" + dialogClass + "' style='max-width:500px'>";
        html += this.addNotebookTitle('dl_foldseek', 'Submit your selection to Foldseek');
        html += '1. <input type="submit" id="' + me.pre + 'fssubmit" name="fssubmit" value="Submit"></input> your selection (all residues are selected by default) in the loaded structures to <a href="https://search.foldseek.com/search" target="_blank">Foldseek</a> web server.<br><br>';
        html += '2 (Optional). Once you see the structure neighbors, you can view the alignment in iCn3D by inputing a list of PDB chain IDs or AlphaFold UniProt IDs below. <br><br>The PDB chain IDs are the same as the record names such as "1HHO_A". The UniProt ID is the text between "AF-" and "-F1". For example, the UniProt ID for the record name "AF-P69905-F1-model_v4" is "P69905".<br><br>'; 

        html += "Chain ID List: " + me.htmlCls.inputTextStr + "id='" + me.pre + "foldseekchainids' value='P69905,P01942,1HHO_A' size=30> ";
        html += me.htmlCls.buttonStr + "reload_foldseek'>Align</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_mmtfid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_mmtfid', 'Please input an MMTF ID');
        html += "MMTF ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "mmtfid' value='1TUP' size=8> ";
        html += me.htmlCls.buttonStr + "reload_mmtf'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_pdbid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_pdbid', 'Please input a PDB ID');
        html += "PDB ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "pdbid' value='1TUP' size=8> ";
        html += me.htmlCls.buttonStr + "reload_pdb'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_afid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_afid', 'Please input an AlphaFold UniProt ID');
        html += "Note: AlphaFold produces a per-residue confidence score (pLDDT) between 0 and 100:<br>";
        html += me.htmlCls.clickMenuCls.setAlphaFoldLegend() + "<br>";

        let afid = (me.cfg.afid) ? me.cfg.afid : 'A4D1S0';

        html += "<a href='https://alphafold.ebi.ac.uk/' target='_blank'>AlphaFold Uniprot</a> ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "afid' value='" + afid + "' size=10><br><br>";
        html += me.htmlCls.buttonStr + "reload_af'>Load Structure</button><br><br>" 
        html += "PAE Map: " + me.htmlCls.buttonStr + "reload_afmap'>Load Half</button>"
            + me.htmlCls.buttonStr + "reload_afmapfull' style='margin-left:30px'>Load Full (slow)</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_refseqid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_refseqid', 'Please input an NCBI protein accession');
        html += "NCBI Protein Accession: " + me.htmlCls.inputTextStr + "id='" + me.pre + "refseqid' value='NP_001743.1' size=8> ";
        html += me.htmlCls.buttonStr + "reload_refseq'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_opmid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_opmid', 'Please input an OPM PDB ID');
        html += "<a href='https://opm.phar.umich.edu' target='_blank'>Orientations of Proteins in Membranes(OPM)</a> PDB ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "opmid' value='6JXR' size=8> ";
        html += me.htmlCls.buttonStr + "reload_opm'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_pdbfile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_pdbfile', 'Please input a PDB file');
        html += "Note: Several PDB files could be concatenated into a single PDB file. Use the line \"ENDMDL\" to separate PDB files.<br><br>";
        html += "PDB File: " + me.htmlCls.inputFileStr + " id='" + me.pre + "pdbfile' size=8> ";
        html += me.htmlCls.buttonStr + "reload_pdbfile'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_pdbfile_app' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_pdbfile_app', 'Please append PDB files');
        html += "Multiple PDB Files: <input type='file' multiple id='" + me.pre + "pdbfile_app' size=8> ";
        html += me.htmlCls.buttonStr + "reload_pdbfile_app'>Append</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_rescolorfile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_rescolorfile', 'Please input a residue color file');
        html += '<div style="width:450px;">The custom JSON file on residue colors has the following format for proteins("ALA" and "ARG") and nucleotides("G" and "A"):<br>';
        html += '{"ALA":"#C8C8C8", "ARG":"#145AFF", ..., "G":"#008000", "A":"#6080FF", ...}</div><br>';
        html += "Residue Color File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "rescolorfile' size=8> ";
        html += me.htmlCls.buttonStr + "reload_rescolorfile'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_customcolor' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_customcolor', 'Please input a custom color file');
        html += " <input type='hidden' id='" + me.pre + "customcolor_chainid' value=''>";
        html += '<div style="width:450px;">The custom file for the structure has two columns separated by space or tab: ';
        html += 'residue number, and score in the range of 0-100. If you click "Apply Custom Color" button, ';
        html += 'the scores 0, 50 and 100 correspond to the three colors specified below. If you click "Apply Custom Tube", ';
        html += 'the selected residues will be displayed in a style similar to "B-factor Tube".</div><br>';
        html += "Custom File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "cstcolorfile' size=8> <br><br>";
        html += "1. " + me.htmlCls.buttonStr + "reload_customcolorfile'>Apply Custom Color</button>" + me.htmlCls.buttonStr + "remove_legend' style='margin-left:30px;'>Remove Legend</button><br>";
        html += "<span style='margin-left:15px'>Score to Color: 0:</span> <select id='" + me.pre + "startColor'>";
        html += me.htmlCls.optionStr + "'red'>Red</option>";
        html += me.htmlCls.optionStr + "'green'>Green</option>";
        html += me.htmlCls.optionStr + "'blue' selected>Blue</option>";
        html += "</select>";
        html += "<span style='margin-left:30px'>50</span>: <select id='" + me.pre + "midColor'>";
        html += me.htmlCls.optionStr + "'white' selected>White</option>";
        html += me.htmlCls.optionStr + "'black'>Black</option>";
        html += "</select>";
        html += "<span style='margin-left:30px'>100</span>: <select id='" + me.pre + "endColor'>";
        html += me.htmlCls.optionStr + "'red' selected>Red</option>";
        html += me.htmlCls.optionStr + "'green'>Green</option>";
        html += me.htmlCls.optionStr + "'blue'>Blue</option>";
        html += "</select><br>";
        html += "or<br><br>";
        html += "2. " + me.htmlCls.buttonStr + "reload_customtubefile'>Apply Custom Tube</button>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_customref' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_customref', 'Please input a reference number file');
        html += '<div style="width:550px;">You can define your own reference numbers in a custom file using Excel, and then export it as a CSV file. An example file is shown below with cells separated by commas.<br>';
        html += '<pre>refnum,11,12,,21,22,,10C,11C,20C<br>';
        html += '1TUP_A,100,101,,,132,,,,<br>';
        html += '1TUP_B,110,111,,141,142,,,,</pre>';
        html += '1TUP_C,,,,,,,200,201,230</pre>';
        html += 'The first row defines the reference residue numbers, which could be any strings. The 1st cell could be anything. The rest cells are reference residue numbers (e.g., 11, 21, 10C, etc.) or empty cells. Each chain has a separate row. The first cell of the second row is the chain ID "1TUP_A". The rest cells are the corresponding real residue numbers for reference residue numbers in the first row. For example, the reference numbers for residues 100, 101, and 132 in the chain 1TUP_A are 11, 12, and 22, respectively. The fourth row shows another set of reference numners for the chain "1TUP_C". It could be a chain from a different structure.<br><br>';
        html += 'To select all residues corresponding to the reference numbers, you can simplay replace ":" with "%" in the <a href="https://www.ncbi.nlm.nih.gov/Structure/icn3d/icn3d.html#selectb" target="_blank">Specification</a>. For example, "%12"  selects the residue 101 in 1TUP_A and the residue 111 in 1TUP_B. ".A%12" has the chain "A" filter and selects the residue 101 in 1TUP_A.<br>';
        html += '</div><br>';
        html += "Custom File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "cstreffile' size=8> <br><br>";
        html += me.htmlCls.buttonStr + "reload_customreffile'>Apply Custom Reference Numbers</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_align' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_align', 'Please select residues in aligned sequences');
        html += "Enter the PDB IDs or MMDB IDs of the structures: <br/><br/>ID1: " + me.htmlCls.inputTextStr + "id='" + me.pre + "alignid1' value='2DN3' size=8>" + me.htmlCls.space3 + me.htmlCls.space3 + "ID2: " + me.htmlCls.inputTextStr + "id='" + me.pre + "alignid2' value='4N7N' size=8><br/><br/>";
        html += "<b>VAST+ based on VAST</b>: " + me.htmlCls.buttonStr + "reload_align_ori'>All Matching Molecules Superposed</button>" + me.htmlCls.space3 + me.htmlCls.buttonStr + "reload_align_refined'>Invariant Substructure Superposed</button><br><br>";
        html += "<b>VAST+ based on TM-align</b>: " + me.htmlCls.buttonStr + "reload_align_tmalign'>All Matching Molecules Superposed</button><br><br>";
        html += "</div>";
        
        html += me.htmlCls.divStr + "dl_alignaf' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_alignaf', 'Align AlphaFold structures');
        html += "Enter two <a href='https://alphafold.ebi.ac.uk/' target='_blank'>AlphaFold Uniprot</a> IDs: <br/><br/>ID1: " + me.htmlCls.inputTextStr + "id='" + me.pre + "alignafid1' value='P41327' size=8>" + me.htmlCls.space3 + me.htmlCls.space3 + "ID2: " + me.htmlCls.inputTextStr + "id='" + me.pre + "alignafid2' value='P41331' size=8><br/><br/>";
        html += me.htmlCls.buttonStr + "reload_alignaf_tmalign'>Align with TM-align</button>" + me.htmlCls.buttonStr + "reload_alignaf' style='margin-left:30px'>Align with VAST</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_chainalign' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_chainalign', 'Align chains');
        html += "<div style='width:550px'>";
        html += "All chains will be aligned to the first chain in the comma-separated chain IDs. Each chain ID has the form of PDBID_chain (e.g., 1HHO_A, case sensitive) or UniprotID (e.g., P69905 for AlphaFold structures).<br/><br/>";
        html += "<b>Chain IDs</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "chainalignids' value='P69905,P01942,1HHO_A' size=50><br/><br/>";
        html += me.htmlCls.buttonStr + "reload_chainalign_tmalign'><b>Align with TM-align</b></button>" + me.htmlCls.buttonStr + "reload_chainalign_asym' style='margin-left:30px'><b>Align with VAST</b></button><br/><br/>";

        html += "(Note: To align chains in custom PDB files, you could load them in \"File > Open File > PDB Files (appendable)\" and click \"Analysis > Defined Sets\". Finally select multiple chains in Defined Sets and click \"File > Realign Selection\".)<br><br>";
        html += "</div></div>";

        html += me.htmlCls.divStr + "dl_chainalign2' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_chainalign2', 'Align chains');
        html += "<div style='width:550px'>";
        html += "All chains will be aligned to the first chain in the comma-separated chain IDs. Each chain ID has the form of PDBID_chain (e.g., 1HHO_A, case sensitive) or UniprotID (e.g., P69905 for AlphaFold structures).<br/><br/>";
        html += "<b>Chain IDs</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "chainalignids2' value='P69905,P01942,1HHO_A' size=50><br/><br/>";

        html += "The sequence alignment (followed by structure alignemnt) is based on residue numbers in the First/Master chain: <br>" + me.htmlCls.inputTextStr + "id='" + me.pre + "resalignids' value='1,5,10-50' size=50><br/>";
        html += me.htmlCls.buttonStr + "reload_chainalign_asym2' style='margin-top:3px;'><b>Align by Sequence Alignment</b></button><br/><br/>";

        html += "(Note: To align chains in custom PDB files, you could load them in \"File > Open File > PDB Files (appendable)\" and click \"Analysis > Defined Sets\". Finally select multiple chains in Defined Sets and click \"File > Realign Selection\".)<br><br>";
        html += "</div></div>";

        html += me.htmlCls.divStr + "dl_chainalign3' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_chainalign3', 'Align chains');
        html += "<div style='width:550px'>";
        html += this.getHtmlAlignResidueByResidue('chainalignids3', 'predefinedres', 'reload_chainalign_asym3');
        html += "</div></div>";

        html += me.htmlCls.divStr + "dl_realignresbyres' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_realignresbyres', 'Realign residue by residue');
        html += "<div style='width:550px'>";
        html += "<b>Option 1</b>: " + me.htmlCls.buttonStr + "realignSelection'><b>Realign Current Selection Residue by Residue</b></button><br/><br/>";
        html += "<b>Option 2</b>: <br>";
        html += "<div class='icn3d-box'>" + this.getHtmlAlignResidueByResidue('chainalignids4', 'predefinedres2', 'reload_chainalign_asym4') + "</div>";
        html += "</div></div>";

        html += me.htmlCls.divStr + "dl_mutation' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_mutation', 'Mutation analysis');
        html += "<div style='width:500px'>";
        html += 'Please specify the mutations with a comma separated mutation list. Each mutation can be specified as "[<b>uppercase</b> PDB ID or AlphaFold UniProt ID]_[Chain Name]_[Residue Number]_[One Letter Mutant Residue]". E.g., the mutation of N501Y in the E chain of PDB 6M0J can be specified as "6M0J_E_501_Y". For AlphaFold structures, the "Chain ID" is "A".<br/>If you load a custom structure without PDB or UniProt ID, you can open "Seq. & Annotations" window and find the chain ID such as "stru_A". The part before the underscore is the structure ID, which can be used to specify the mutation such as "stru_A_...". Remember to choose "Show Mutation in: Current Page".<br/><br/>';
        html += "<div style='display:inline-block; width:110px'>Mutations: </div>" + me.htmlCls.inputTextStr + "id='" + me.pre + "mutationids' value='6M0J_E_484_K,6M0J_E_501_Y,6M0J_E_417_N' size=50><br/><br/>";
 
        html += '<b>ID Type</b>: ';
        html += '<input type="radio" name="' + me.pre + 'idsource" id="' + me.pre + 'type_mmdbid" value="mmdbid" checked>PDB ID';
        html += '<input type="radio" name="' + me.pre + 'idsource" id="' + me.pre + 'type_afid" value="afid" style="margin-left:20px">AlphaFold UniProt ID<br><br>';

        html += '<b>Show Mutation in</b>: ';
        html += '<input type="radio" name="' + me.pre + 'pdbsource" id="' + me.pre + 'showin_currentpage" value="currentpage">Current Page';
        html += '<input type="radio" name="' + me.pre + 'pdbsource" id="' + me.pre + 'showin_newpage" value="newpage" style="margin-left:20px" checked>New Page<br><br>';

        html += me.htmlCls.buttonStr + "reload_mutation_3d' title='Show the mutations in 3D using the scap program'>3D with scap</button>";
        html += me.htmlCls.buttonStr + "reload_mutation_inter' style='margin-left:20px' title='Show the mutations in 3D and the change of interactions'>Interactions</button>";
        html += me.htmlCls.buttonStr + "reload_mutation_pdb' style='margin-left:20px' title='Show the mutations in 3D and export the PDB of the mutant within 10 angstrom'>PDB</button>";
        html += "<br/><br/></div></div>";

        html += me.htmlCls.divStr + "dl_mol2file' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_mol2file', 'Please input a Mol2 file');
        html += "Mol2 File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "mol2file' size=8> ";
        html += me.htmlCls.buttonStr + "reload_mol2file'>Load</button>";
        html += "</div>";
        html += me.htmlCls.divStr + "dl_sdffile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_sdffile', 'Please input an SDF file');
        html += "SDF File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "sdffile' size=8> ";
        html += me.htmlCls.buttonStr + "reload_sdffile'>Load</button>";
        html += "</div>";
        html += me.htmlCls.divStr + "dl_xyzfile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_xyzfile', 'Please input an XYZ file');
        html += "XYZ File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "xyzfile' size=8> ";
        html += me.htmlCls.buttonStr + "reload_xyzfile'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_afmapfile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_afmapfile', 'Please input an AlphaFold PAE file');
        html += "AlphaFold PAE File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "afmapfile' size=8> <br><br>";
        html += me.htmlCls.buttonStr + "reload_afmapfile'>Load Half PAE Map</button>" 
          + me.htmlCls.buttonStr + "reload_afmapfilefull' style='margin-left:30px'>Load Full PAE Map (slow)</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_urlfile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_urlfile', 'Please input a file via URL');
        html += "File type: ";
        html += "<select id='" + me.pre + "filetype'>";
        html += me.htmlCls.optionStr + "'pdb' selected>PDB</option>";
        html += me.htmlCls.optionStr + "'mmcif'>mmCIF</option>";
        html += me.htmlCls.optionStr + "'mol2'>Mol2</option>";
        html += me.htmlCls.optionStr + "'sdf'>SDF</option>";
        html += me.htmlCls.optionStr + "'xyz'>XYZ</option>";
        html += me.htmlCls.optionStr + "'icn3dpng'>iCn3D PNG</option>";
        html += me.htmlCls.optionStr + "'pae'>AlphaFold PAE</option>";
        html += "</select><br/>";
        html += "URL in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + "urlfile' size=20><br/> ";
        html += me.htmlCls.buttonStr + "reload_urlfile'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_mmciffile' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_mmciffile', 'Please input an mmCIF file');
        html += "mmCIF File: " + me.htmlCls.inputFileStr + "id='" + me.pre + "mmciffile' value='1TUP' size=8> ";
        html += me.htmlCls.buttonStr + "reload_mmciffile'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_mmcifid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_mmcifid', 'Please input an mmCIF ID');
        html += "mmCIF ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "mmcifid' value='1TUP' size=8> ";
        html += me.htmlCls.buttonStr + "reload_mmcif'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_mmdbid' class='" + dialogClass + "' style='max-width:500px'>";
        html += this.addNotebookTitle('dl_mmdbid', 'Please input an MMDB ID');
        html += "MMDB or PDB ID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "mmdbid' value='1TUP' size=8> <br><br>";
        html += me.htmlCls.buttonStr + "reload_mmdb'>Load Biological Unit</button>" + me.htmlCls.buttonStr + "reload_mmdb_asym' style='margin-left:30px'>Load Asymmetric Unit (All Chains)</button><br/><br/><br/>";
        html += '<b>Note</b>: The "<b>biological unit</b>" is the <b>biochemically active form of a biomolecule</b>, <div style="width:20px; margin:6px 0 0 20px; display:inline-block;"><span id="'
          + me.pre + 'asu_bu_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
          + me.pre + 'asu_bu_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div>';

        html += me.htmlCls.divStr + "asu_bu' style='display:none;'>";
        html += 'which can range from a monomer (single protein molecule) to an oligomer of 100+ protein molecules.<br><br>The "<b>asymmetric unit</b>" is the raw 3D structure data resolved by X-ray crystallography, NMR, or Cryo-electron microscopy. The asymmetric unit is equivalent to the biological unit in approximately 60% of structure records. In the remaining 40% of the records, the asymmetric unit represents a portion of the biological unit that can be reconstructed using crystallographic symmetry, or it represents multiple copies of the biological unit.</div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_mmdbafid' class='" + dialogClass + "' style='max-width:600px'>";
        html += this.addNotebookTitle('dl_mmdbafid', 'Please input a list of PDB/AlphaFold IDs');
        html += "List of PDB, MMDB, or AlphaFold UniProt structures: " + me.htmlCls.inputTextStr + "id='" + me.pre + "mmdbafid' placeholder='e.g., 1HHO,4N7N,P69905,P01942' size=30> <br><br>";
        html += "<div style='display:inline-block; width:20px'></div>" + me.htmlCls.buttonStr + "reload_mmdbaf' style='width:150px'>Load Biological Unit</button>" + me.htmlCls.buttonStr + "reload_mmdbaf_asym' style='margin-left:30px; width:250px'>Load Asymmetric Unit (All Chains)</button>" + "<br/><br/>";
        html += "<div style='display:inline-block; width:20px'>or</div>" + me.htmlCls.buttonStr + "reload_mmdbaf_append' style='width:150px'>Append Biological Unit</button>" + me.htmlCls.buttonStr + "reload_mmdbaf_asym_append' style='margin-left:30px; width:250px'>Append Asymmetric Unit (All Chains)</button>" + "<br/><br/>";

        html += '<b>Note</b>: The "<b>biological unit</b>" is the <b>biochemically active form of a biomolecule</b>, <div style="width:20px; margin:6px 0 0 20px; display:inline-block;"><span id="'
        + me.pre + 'asu_bu2_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
        + me.pre + 'asu_bu2_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div>';

        html += me.htmlCls.divStr + "asu_bu2' style='display:none;'>";
        html += 'which can range from a monomer (single protein molecule) to an oligomer of 100+ protein molecules.<br><br>The "<b>asymmetric unit</b>" is the raw 3D structure data resolved by X-ray crystallography, NMR, or Cryo-electron microscopy. The asymmetric unit is equivalent to the biological unit in approximately 60% of structure records. In the remaining 40% of the records, the asymmetric unit represents a portion of the biological unit that can be reconstructed using crystallographic symmetry, or it represents multiple copies of the biological unit.</div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_blast_rep_id' style='max-width:600px;' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_blast_rep_id', 'Align sequence to structure');
        html += "Enter a Sequence ID (or FASTA sequence) and the aligned protein accession, which can be found using the <a href='https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch' target='_blank'>BLAST</a> search with the Sequence ID or FASTA sequence as input. If the protein accession is not a PDB chain, the corresponding AlphaFold UniProt structure is used.<br><br> ";
        html += "<b>Sequence ID</b>(NCBI protein accession of a sequence): " + me.htmlCls.inputTextStr + "id='" + me.pre + "query_id' value='NP_001108451.1' size=8><br> ";
        html += "or FASTA sequence: <br><textarea id='" + me.pre + "query_fasta' rows='5' style='width: 100%; height: " +(me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
        html += "<b>NCBI protein accession</b> (or a chain of a PDB): " + me.htmlCls.inputTextStr + "id='" + me.pre + "blast_rep_id' value='1TSR_A' size=8><br> ";
        //html += me.htmlCls.buttonStr + "reload_blast_rep_id'>Load</button>";
        html += me.htmlCls.buttonStr + "reload_blast_rep_id'>Align with BLAST</button> " + me.htmlCls.wifiStr
            + me.htmlCls.buttonStr + "reload_alignsw' style='margin-left:30px'>Align with Global Smith-Waterman</button>"
            + me.htmlCls.buttonStr + "reload_alignswlocal' style='margin-left:30px'>Align with Local Smith-Waterman</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_esmfold' style='max-width:600px;' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_esmfold', 'Sequence to structure prediction with ESMFold');
        html += "The sequence to structure prediction is done via <a href='https://esmatlas.com/resources?action=fold' target='_blank'>ESM Metagenomic Atlas</a>. The sequence should be less than 400 characters. For any sequence longer than 400, please see the discussion <a href='https://github.com/facebookresearch/esm/issues/21' target='_blank'>here</a>.<br><br> ";
        html += "FASTA sequence: <br><textarea id='" + me.pre + "esmfold_fasta' rows='5' style='width: 100%; height: " +(me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
        html += me.htmlCls.buttonStr + "run_esmfold'>ESMFold</button> ";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_yournote' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_yournote', 'Your Note');
        html += "Your note will be saved in the HTML file when you click \"File > Save File > iCn3D PNG Image\".<br><br>";
        html += "<textarea id='" + me.pre + "yournote' rows='5' style='width: 100%; height: " +(me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;' placeholder='Enter your note here'></textarea><br>";
        html += me.htmlCls.buttonStr + "applyyournote'>Save</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_proteinname' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_proteinname', 'Please input a protein/gene name');
        html += "Protein/Gene name: " + me.htmlCls.inputTextStr + "id='" + me.pre + "proteinname' value='TP53' size=8> ";
        html += me.htmlCls.buttonStr + "reload_proteinname'>Search</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_cid' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_cid', 'Please input a PubChem CID');
        html += "PubChem CID: " + me.htmlCls.inputTextStr + "id='" + me.pre + "cid' value='2244' size=8> ";
        html += me.htmlCls.buttonStr + "reload_cid'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_pngimage' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_pngimage', 'Please input an iCn3D PNG Image file');
        html += "iCn3D PNG image: " + me.htmlCls.inputFileStr + "id='" + me.pre + "pngimage'><br/>";
        html += me.htmlCls.buttonStr + "reload_pngimage' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_state' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_state', 'Please input a state file');
        html += "State file: " + me.htmlCls.inputFileStr + "id='" + me.pre + "state'><br/>";
        html += me.htmlCls.buttonStr + "reload_state' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_fixedversion' style='max-width:500px' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_fixedversion', 'Use fixed version of iCn3D');
        html += "Since January 6, 2021, you can show the original view with the archived version of iCn3D by pasting your URL below and click \"Show Originial View\". Note the version in the parameter \"v\" was used to replace \"full.html\" with \"full_[v].html\" in the URL.<br><br>";
        html += "Share Link URL: " + me.htmlCls.inputTextStr + "id='" + me.pre + "sharelinkurl' size=60><br>";
        html += me.htmlCls.buttonStr + "reload_fixedversion'>Show Original View</button><br><br>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_selection' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_selection', 'Load a selection file');
        html += "Selection file: " + me.htmlCls.inputFileStr + "id='" + me.pre + "selectionfile'><br/>";
        html += me.htmlCls.buttonStr + "reload_selectionfile' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_menuloadpref' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_menuloadpref', 'Load a preference file');
        html += "Preference file: " + me.htmlCls.inputFileStr + "id='" + me.pre + "menupreffile'><br/>";
        html += me.htmlCls.buttonStr + "reload_menupreffile' style='margin-top: 6px;'>Load</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_dsn6' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_dsn6', 'Load a DSN6 file');
        html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigma2fofc'>";

        let optArray1 = ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 3);

        html += "</select> &sigma;</span><br/>";
        html += me.htmlCls.inputFileStr + "id='" + me.pre + "dsn6file2fofc'> " + me.htmlCls.buttonStr + "reload_dsn6file2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmafofc'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 5);

        html += "</select> &sigma;</span><br/>";
        html += me.htmlCls.inputFileStr + "id='" + me.pre + "dsn6filefofc'> " + me.htmlCls.buttonStr + "reload_dsn6filefofc' style='margin-top: 6px;'>Load</button><br><br><br>";

        html += me.htmlCls.buttonStr + "elecmapNo4'>Remove Map</button><br>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_dsn6url' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_dsn6url', 'Load a selection file via a URL');
        html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigmaurl2fofc'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 3);

        html += "</select> &sigma;</span><br/>";
        html += "URL in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + "dsn6fileurl2fofc' size=20>" + me.htmlCls.space3 + me.htmlCls.buttonStr + "reload_dsn6fileurl2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

        html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmaurlfofc'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 5);

        html += "</select> &sigma;</span><br/>";
        html += "URL in the same host: " + me.htmlCls.inputTextStr + "id='" + me.pre + "dsn6fileurlfofc' size=20>" + me.htmlCls.space3 + me.htmlCls.buttonStr + "reload_dsn6fileurlfofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

        html += me.htmlCls.buttonStr + "elecmapNo5'>Remove Map</button><br>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_clr' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_clr', 'Pick a color');
        html += "Click in the input box to use the color picker:<br><br> ";
        html += "Custom Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "colorcustom' value='FF0000' size=8> ";
        html += me.htmlCls.buttonStr + "applycustomcolor'>Apply</button>";
        html += "</div>";

        html += me.htmlCls.setHtmlCls.getPotentialHtml('delphi', dialogClass);

        html += me.htmlCls.setHtmlCls.getPotentialHtml('local', dialogClass);
        html += me.htmlCls.setHtmlCls.getPotentialHtml('url', dialogClass);

        html += me.htmlCls.divStr + "dl_symmetry' class='" + dialogClass + "'><br>";
        html += this.addNotebookTitle('dl_symmetry', 'Symmetry');
        html += me.htmlCls.divNowrapStr + "Symmetry: <select id='" + me.pre + "selectSymmetry'>";
        html += "</select>" + me.htmlCls.space3;
        html += me.htmlCls.buttonStr + "applysymmetry'>Apply</button>" + me.htmlCls.space3;
        html += me.htmlCls.buttonStr + "clearsymmetry'>Clear</button></div>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_symd' style='max-width:400px' class='" + dialogClass + "'><br>";
        html += this.addNotebookTitle('dl_symd', 'Dynamically symmetry calculation using SymD');

        html += "</div>";

        html += me.htmlCls.divStr + "dl_contact' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_contact', 'Contact Map');
        html += "<span style='white-space:nowrap;font-weight:bold;'>Distance: <select id='" + me.pre + "contactdist'>";
        html += me.htmlCls.setHtmlCls.getOptionHtml(['4', '5', '6', '7', '8', '9', '10'], 4);
        html += "</select></span>";
        html += "<span style='margin-left:30px; white-space:nowrap;font-weight:bold;'>Contact Type: <select id='" + me.pre + "contacttype'>";
        html += me.htmlCls.optionStr + "'calpha' >between C-alpha Atoms</option>";
        html += me.htmlCls.optionStr + "'cbeta' selected>between C-beta Atoms</option>";
        html += me.htmlCls.optionStr + "'heavyatoms' >between Heavy Atoms</option>";
        html += "</select></span><br><br>";
        html += "<span style='white-space:nowrap;'>" + me.htmlCls.buttonStr + "applycontactmap'>Display</button></span><br>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_hbonds' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_hbonds', 'Interaction Analysis');
        html += "1. Choose interaction types and their thresholds:<br>";
        html += "<div class='icn3d-box'><table border=0 width=450><tr>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_hbond' checked>Hydrogen Bonds <span style='background-color:#" + me.htmlCls.hbondColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "hbondthreshold'>";

        let optArray2 = ['3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '4.0', '4.1', '4.2'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray2, 6);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_saltbridge' checked>Salt Bridge/Ionic <span style='background-color:#" + me.htmlCls.ionicColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "saltbridgethreshold'>";

        let optArray3 = ['3', '4', '5', '6', '7', '8'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray3, 3);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_contact' checked>Contacts/Interactions <span style='background-color:#" + me.htmlCls.contactColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "contactthreshold'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray3, 1);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "</tr>";

        html += "<tr>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_halogen' checked>Halogen Bonds <span style='background-color:#" + me.htmlCls.halogenColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "halogenthreshold'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray2, 6);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_pication' checked>&pi;-Cation <span style='background-color:#" + me.htmlCls.picationColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "picationthreshold'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray3, 3);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "<td style='white-space:nowrap'>" + me.htmlCls.inputCheckStr + "id='" + me.pre + "analysis_pistacking' checked>&pi;-Stacking <span style='background-color:#" + me.htmlCls.pistackingColor + "'>" + me.htmlCls.space3 + "</span></td>";
        html += "<td>";
        html += me.htmlCls.divNowrapStr + " <select id='" + me.pre + "pistackingthreshold'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(['3', '4', '5'], 99);

        html += me.htmlCls.optionStr + "'5.5' selected>5.5</option>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(['6', '7', '8'], 99);

        html += "</select> &#197;" + me.htmlCls.space3 + "</div></td>";
        html += "</tr></table></div>";

        html += "<table border=0 width=400 cellspacing=10><tr><td>";

        html += me.htmlCls.divNowrapStr + "2. Select the first set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond2' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td><td>";

        html += me.htmlCls.divNowrapStr + "3. Select the second set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td></tr></table>";
        
        html += "<div>4. " + me.htmlCls.buttonStr + "applyhbonds'>3D Display Interactions</button></div><br>";

        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "hbondWindow'>Highlight Interactions in Table</button><span style='margin-left:30px; font-wieght:bold'>Sort Interactions on</span>: " + me.htmlCls.buttonStr + "sortSet1'> Set 1</button>" + me.htmlCls.buttonStr + "sortSet2' style='margin-left:12px'>Set 2</button></div><br>";

        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "hbondLineGraph'>2D Interaction Network</button> " + me.htmlCls.buttonStr + "hbondLineGraph2' style='margin-left:12px'>2D Network with Reference Numbers</button> to show two lines of residue nodes</div><br>";

        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "hbondScatterplot'>2D Interaction Map</button> " + me.htmlCls.buttonStr + "hbondScatterplot2' style='margin-left:12px'>2D Map with Reference Numbers</button> to show map</div><br>";

        tmpStr = ': </td><td><input style="margin-left:-12px" type="text" id="';

        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "hbondGraph'>2D Graph(Force-Directed)</button> to show interactions with strength parameters in 0-200:</div>";
        html += '<div style="text-indent:1.1em"><table><tr><td>Helix or Sheet' + tmpStr + me.pre + 'dist_ss" size="4" value="100"></td>';
        html += '<td>Coil or Nucleotide' + tmpStr + me.pre + 'dist_coil" size="4" value="50"></td>';
        html += '<td>Disulfide Bonds' + tmpStr + me.pre + 'dist_ssbond" size="4" value="50"></td></tr>';
        html += '<tr><td>Hydrogen Bonds' + tmpStr + me.pre + 'dist_hbond" size="4" value="50"></td>';
        html += '<td>Salt Bridge/Ionic' + tmpStr + me.pre + 'dist_ionic" size="4" value="50"></td>';
        html += '<td>Contacts' + tmpStr + me.pre + 'dist_inter" size="4" value="25"></td></tr>';
        html += '<tr><td>Halogen Bonds' + tmpStr + me.pre + 'dist_halogen" size="4" value="50"></td>';
        html += '<td>&pi;-Cation' + tmpStr + me.pre + 'dist_pication" size="4" value="50"></td>';
        html += '<td>&pi;-Stacking' + tmpStr + me.pre + 'dist_pistacking" size="4" value="50"></td></tr></table></div>';
        html += '<div style="text-indent:1.1em">(Note: you can also adjust thresholds at #1 to add/remove interactions.)</div><br>';

    //    html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "hbondExport'>Save</button> H-bond/contact pairs in a file</div><br>";
        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "areaWindow'>Buried Surface Area</button></div><br>";

        html += "<div>5. " + me.htmlCls.buttonStr + "hbondReset'>Reset</button> and select new sets</div>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_realign' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_realign', 'Realign by sequence');

        html += me.htmlCls.divNowrapStr + "1. Select sets below <br>or use your current selection:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomRealign' multiple size='5' style='min-width:130px;'>";
        html += "</select></div><br>";

        html += "<div>2. " + me.htmlCls.buttonStr + "applyRealign'>Realign by Sequence</button></div><br>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_realignbystruct' class='" + dialogClass + "' style='max-width:500px'>";
        html += this.addNotebookTitle('dl_realignbystruct', 'Realign by structure');

        //html += "<div><b>1</b>. There are two options to align chains. Option \"a\" is to select a list of chains below, and align all chains to the first chain. Option \"b\" is to select sets below or use your current selection, and align all chains pairwise.</div><br>";
        html += "<div><b>1</b>. Select sets below or use your current selection.</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomRealignByStruct' multiple size='5' style='min-width:130px;'>";
        html += "</select></div><br>";

        // some issues in aligning 4orz_C and 5esv_H due to insertion code
        //html += "<div><b>2a</b>. <div style='display:inline-block; width:170px'>Align to First Chain:</div> " + me.htmlCls.buttonStr + "applyRealignByStructMsa_tmalign'>Realign with TM-align</button>" + me.htmlCls.buttonStr + "applyRealignByStructMsa' style='margin-left:30px'>Realign with VAST</button></div><br>";

        //html += "<div>or <b>2b</b>. <div style='display:inline-block; width:155px'>Align All Chains Pairwise:</div> " + me.htmlCls.buttonStr + "applyRealignByStruct_tmalign'>Realign with TM-align</button>" + me.htmlCls.buttonStr + "applyRealignByStruct' style='margin-left:30px'>Realign with VAST</button></div><br>";
        html += "<div><b>2</b>. " + me.htmlCls.buttonStr + "applyRealignByStruct_tmalign'>Realign with TM-align</button>" + me.htmlCls.buttonStr + "applyRealignByStruct' style='margin-left:30px'>Realign with VAST</button></div><br>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_realigntwostru' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_realigntwostru', 'Realign two structure complexes');

        html += me.htmlCls.divNowrapStr + "1. Select sets below or use your current selection:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomRealignByStruct2' multiple size='5' style='min-width:130px;'>";
        html += "</select></div><br>";

        html += "2. Overall maximum RMSD: " + me.htmlCls.inputTextStr + "id='" + me.pre + "maxrmsd' value='30' size='2'> &#197; <br><br>";

        html += "<div>3. " + me.htmlCls.buttonStr + "applyRealignByStruct_vastplus'>VAST+ Alignment based on TM-align</button></div><br>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_colorspectrumacrosssets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_colorspectrumacrosssets', 'Set color spectrum across sets');

        html += me.htmlCls.divNowrapStr + "1. Select sets below:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomColorSpectrumAcross' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "<div>2. " + me.htmlCls.buttonStr + "applyColorSpectrumAcrossSets'>Spectrum Color for Sets</button></div><br>";
        html += "</div>";

        
        html += me.htmlCls.divStr + "dl_colorspectrumbysets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_colorspectrumbysets', 'Set color spectrum for residues in sets');
        html += me.htmlCls.divNowrapStr + "1. Select sets below:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomColorSpectrum' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "<div>2. " + me.htmlCls.buttonStr + "applyColorSpectrumBySets'>Spectrum Color for Residues in Sets</button></div><br>";
        html += "</div>";

        
        html += me.htmlCls.divStr + "dl_colorrainbowacrosssets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_colorrainbowacrosssets', 'Set color rainbow across sets');
        html += me.htmlCls.divNowrapStr + "1. Select sets below:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomColorRainbowAcross' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "<div>2. " + me.htmlCls.buttonStr + "applyColorRainbowAcrossSets'>Rainbow Color for Sets</button></div><br>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_colorrainbowbysets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_colorrainbowbysets', 'Set color rainbow for residues in sets');
        html += me.htmlCls.divNowrapStr + "1. Select sets below:</div><br>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomColorRainbow' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "<div>2. " + me.htmlCls.buttonStr + "applyColorRainbowBySets'>Rainbow Color for Residues in Sets</button></div><br>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_allinteraction' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_allinteraction', 'All interactions', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_interactionsorted' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_interactionsorted', 'Sorted interactions', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_linegraph' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_linegraph', '2D Interaction Network');

        html += me.htmlCls.divNowrapStr + '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
          + me.pre + 'dl_linegraphcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="display:none; width:15px;" title="Expand"></span><span id="'
          + me.pre + 'dl_linegraphcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="width:15px;" title="Shrink"></span></div>';

        html += me.htmlCls.space2 + "Hold Ctrl key to select multiple nodes/lines.</div>";

        html += me.htmlCls.divStr + "dl_linegraphcolor' style='display:block;'>";

        html += me.htmlCls.setHtmlCls.setColorHints();

        html += "</div><br>";

        //let buttonStrTmp = '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDD;" id="';

        me.linegraphid = me.pre + 'linegraph';
        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.linegraphid + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.linegraphid + '_png">PNG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.linegraphid + '_json">JSON</button>' + me.htmlCls.space4;
        html += "<b>Scale</b>: <select id='" + me.linegraphid + "_scale'>";

        let optArray4 = ['0.1', '0.2', '0.4', '0.6', '0.8', '1', '2', '4', '6', '8', '10'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray4, 5);

        html += "</select></div><br>";
        html += '<div id="' + me.pre + 'linegraphDiv"></div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_scatterplot' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_scatterplot', '2D Interaction Map');

        html += me.htmlCls.divNowrapStr + "Hold Ctrl key to select multiple nodes." + me.htmlCls.space3;

        html += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
          + me.pre + 'dl_scatterplotcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
          + me.pre + 'dl_scatterplotcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
        html += me.htmlCls.divStr + "dl_scatterplotcolor' style='display:none;'>";

        html += me.htmlCls.setHtmlCls.setColorHints();

        html += "</div>";

        me.scatterplotid = me.pre + 'scatterplot';
        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.scatterplotid + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.scatterplotid + '_png">PNG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.scatterplotid + '_json">JSON</button>' + me.htmlCls.space4;
        html += "<b>Scale</b>: <select id='" + me.scatterplotid + "_scale'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray4, 5);

        html += "</select></div><br>";
        html += '<div id="' + me.pre + 'scatterplotDiv"></div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_contactmap' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_contactmap', 'Contact Map');

        html += me.htmlCls.divNowrapStr + "Hold Ctrl key to select multiple nodes." + me.htmlCls.space3 + "</div>";

        me.contactmapid = me.pre + 'contactmap';
        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.contactmapid + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.contactmapid + '_png">PNG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.contactmapid + '_json">JSON</button>' + me.htmlCls.space4;
        html += "<b>Scale</b>: <select id='" + me.contactmapid + "_scale'>";

        let optArray5 = ['0.01', '0.02', '0.04', '0.06', '0.08', '0.1', '0.2', '0.4', '0.6', '0.8', '1'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray5, 10);

        html += "</select></div><br>";
        html += '<div id="' + me.pre + 'contactmapDiv"></div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_alignerrormap' style='background-color:white' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_alignerrormap', 'PAE Map');

        html += me.htmlCls.divNowrapStr + "Hold Ctrl key to select multiple nodes." + me.htmlCls.space3 + "</div>";
      
        me.alignerrormapid = me.pre + 'alignerrormap';
        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.alignerrormapid + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.alignerrormapid + '_png">PNG (slow)</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.alignerrormapid + '_json">JSON</button>' + me.htmlCls.space4;
        html += '<b>Scale</b>: <select id="' + me.alignerrormapid + '_scale">';

        //let optArray5 = ['0.01', '0.02', '0.04', '0.06', '0.08', '0.1', '0.2', '0.4', '0.6', '0.8', '1'];
        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray5, 2);

        html += "</select></div><br>";

        //min: 004d00, max: FFFFFF
        let startColorStr = '#004d00';
        let endColorStr = '#FFFFFF';
        let rangeStr = startColorStr + ' 0%, ' + endColorStr + ' 100%';

        html += "<div style='width:200px'><div style='height: 12px; border: 1px solid #000; background: linear-gradient(to right, " + rangeStr + ");'></div>";
        html += "<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td width='15%'>0</td><td width='15%'>5</td><td width='15%'>10</td><td width='15%'>15</td><td width='15%'>20</td><td width='15%'>25</td><td>30</td></tr><tr><td colspan='7' align='center'>Expected position error (Angstroms)</td></tr></table></div><br>";
  
        html += '<div id="' + me.pre + 'alignerrormapDiv"></div>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_elecmap2fofc' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_elecmap2fofc', 'Electron Density 2F0-Fc Map');
        html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigma2fofc'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 3);

        html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "applymap2fofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "elecmapNo2'>Remove Map</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_elecmapfofc' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_elecmapfofc', 'Electron Density F0-Fc Map');
        html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigmafofc'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(optArray1, 5);

        html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "applymapfofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "elecmapNo3'>Remove Map</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_emmap' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_emmap', 'EM Density Map');
        html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "empercentage'>";

        html += me.htmlCls.setHtmlCls.getOptionHtml(['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], 3);

        html += "</select> % of maximum EM values</span><br><span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "applyemmap'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.htmlCls.buttonStr + "emmapNo2'>Remove EM Map</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_aroundsphere' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_aroundsphere', 'Select a sphere around a set of residues');
        html += me.htmlCls.divNowrapStr + "1. Select the first set:</div>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere2' multiple size='3' style='min-width:130px;'>";
        html += "</select></div><br>";
        html += me.htmlCls.divNowrapStr + "2. Sphere with a radius: " + me.htmlCls.inputTextStr + "id='" + me.pre + "radius_aroundsphere' value='4' size='2'> &#197;</div><br/>";

        html += me.htmlCls.divNowrapStr + "3. Select the second set to apply the sphere:</div>";
        html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere' multiple size='3' style='min-width:130px;'>";
        html += "</select></div><br>";

        html += me.htmlCls.divNowrapStr + "4. " + me.htmlCls.buttonStr + "applypick_aroundsphere'>Display</button> the sphere around the first set of atoms</div><br>";
        html += "<div style='text-indent:1.1em'>" + me.htmlCls.buttonStr + "sphereExport'>Save</button> interacting/contacting residue pairs in a file</div>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_adjustmem' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_adjustmem', 'Adjust membranes');
        html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
        html += me.htmlCls.divNowrapStr + "1. Extracellular membrane Z-axis position: " + me.htmlCls.inputTextStr + "id='" + me.pre + "extra_mem_z' value='' size='3'> &#197;</div><br/>";
        html += me.htmlCls.divNowrapStr + "2. intracellular membrane Z-axis position: " + me.htmlCls.inputTextStr + "id='" + me.pre + "intra_mem_z' value='' size='3'> &#197;</div><br/>";
        html += me.htmlCls.divNowrapStr + "3. " + me.htmlCls.buttonStr + "apply_adjustmem'>Display</button> the adjusted membranes</div><br>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_selectplane' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_selectplane', 'Select a plane');
        html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
        html += me.htmlCls.divNowrapStr + "1. Z-axis position of the first X-Y plane: " + me.htmlCls.inputTextStr + "id='" + me.pre + "selectplane_z1' value='15' size='3'> &#197;</div><br/>";
        html += me.htmlCls.divNowrapStr + "2. Z-axis position of the second X-Y plane: " + me.htmlCls.inputTextStr + "id='" + me.pre + "selectplane_z2' value='-15' size='3'> &#197;</div><br/>";
        html += me.htmlCls.divNowrapStr + "3. " + me.htmlCls.buttonStr + "apply_selectplane'>Save</button> the region between the planes to Defined Sets</div><br>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_addlabel' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_addlabel', 'Add labels between two atoms');
        html += "1. Text: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labeltext' value='Text' size=4><br/>";
        html += "2. Size: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelsize' value='18' size=4 maxlength=2><br/>";
        html += "3. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelcolor' value='" + defaultColor + "' size=4><br/>";
        //html += "4. Background: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelbkgd' value='' size=4><br/>";
        if(me.utilsCls.isMobile()) {
            html += me.htmlCls.spanNowrapStr + "4. Touch TWO atoms</span><br/>";
        }
        else {
            html += me.htmlCls.spanNowrapStr + "4. Pick TWO atoms while holding \"Alt\" key</span><br/>";
        }
        html += me.htmlCls.spanNowrapStr + "5. " + me.htmlCls.buttonStr + "applypick_labels'>Display</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_addlabelselection' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_addlabelselection', 'Add labels for your selection');
        html += "1. Text: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
        html += "2. Size: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
        html += "3. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelcolor2' value='" + defaultColor + "' size=4><br/>";
        //html += "4. Background: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelbkgd2' value='' size=4><br/>";
        html += me.htmlCls.spanNowrapStr + "4. " + me.htmlCls.buttonStr + "applyselection_labels'>Display</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_labelColor' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_labelColor', 'Change label color');
        html += "Color for all labels: " + me.htmlCls.inputTextStr + "id='" + me.pre + "labelcolorall' value='" + defaultColor + "' size=4><br/><br/>";
        html += me.htmlCls.spanNowrapStr + me.htmlCls.buttonStr + "applylabelcolor'>Display</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_distance' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_distance', 'Measure distance');
        if(me.utilsCls.isMobile()) {
            html += me.htmlCls.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
        }
        else {
            html += me.htmlCls.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
        }
        html += me.htmlCls.spanNowrapStr + "2. Line Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "distancecolor' value='" + defaultColor + "' size=4><br/>";
        html += me.htmlCls.spanNowrapStr + "3. " + me.htmlCls.buttonStr + "applypick_measuredistance'>Display</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_stabilizer' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_stabilizer', 'Add a stabilizer');
        if(me.utilsCls.isMobile()) {
            html += me.htmlCls.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
        }
        else {
            html += me.htmlCls.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
        }
        html += me.htmlCls.spanNowrapStr + "2. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "stabilizercolor' value='ffffff' size=4><br/>";
        html += me.htmlCls.spanNowrapStr + "3. " + me.htmlCls.buttonStr + "applypick_stabilizer'>Add</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_disttwosets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_disttwosets', 'Measure the distance between two sets');
        html += me.htmlCls.spanNowrapStr + "1. Select two sets</span><br/>";
        html += "<table border=0 width=400 cellspacing=10><tr><td>";

        html += me.htmlCls.divNowrapStr + "First set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDist2' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td><td>";

        html += me.htmlCls.divNowrapStr + "Second set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDist' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td></tr></table>";

        html += me.htmlCls.spanNowrapStr + "2. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "distancecolor2' value='" + defaultColor + "' size=4><br/><br/>";
        html += me.htmlCls.spanNowrapStr + "3. " + me.htmlCls.buttonStr + "applydist2'>Display</button></span>";
        html += "</div>";

        
        html += me.htmlCls.divStr + "dl_linebtwsets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_linebtwsets', 'Add a line between  two sets');
        html += me.htmlCls.spanNowrapStr + "1. Select two sets</span><br/>";
        html += "<table border=0 width=400 cellspacing=10><tr><td>";

        html += me.htmlCls.divNowrapStr + "First set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "linebtwsets2' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td><td>";

        html += me.htmlCls.divNowrapStr + "Second set:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "linebtwsets' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td></tr></table>";

        html += me.htmlCls.divNowrapStr + "2. Line style: <select id='" + me.pre + "linebtwsets_style'>";
        html += me.htmlCls.setHtmlCls.getOptionHtml(['Solid', 'Dashed'], 0);
        html += "</select></div><br>";

        html += "3. Line radius: " + me.htmlCls.inputTextStr + "id='" + me.pre + "linebtwsets_radius' value='0.4' size=4><br/><br/>";
        
        html += "4. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "linebtwsets_customcolor' value='" + defaultColor + "' size=4><br/><br/>";

        html += me.htmlCls.divNowrapStr + "5. Opacity: <select id='" + me.pre + "linebtwsets_opacity'>";
        html += me.htmlCls.setHtmlCls.getOptionHtml(['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'], 7);
        html += "</select></div><br>";

        html += me.htmlCls.spanNowrapStr + "6. " + me.htmlCls.buttonStr + "applylinebtwsets'>Display</button></span>";
        html += me.htmlCls.space3 + me.htmlCls.spanNowrapStr + me.htmlCls.buttonStr + "clearlinebtwsets'>Clear</button></span>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_cartoonshape' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_cartoonshape', 'Cartoon Shape');
        html += me.htmlCls.spanNowrapStr + "1. Select a set:</span><br/>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "cartoonshape' multiple size='5' style='min-width:130px;'>";
        html += "</select></div><br>";

        html += me.htmlCls.divNowrapStr + "2. Shape: <select id='" + me.pre + "cartoonshape_shape'>";
        html += me.htmlCls.setHtmlCls.getOptionHtml(['Sphere', 'Cube'], 0);
        html += "</select></div><br>";

        html += "3. Radius: " + me.htmlCls.inputTextStr + "id='" + me.pre + "cartoonshape_radius' value='1.5' size=4><br/><br/>";
        
        html += "4. Color: " + me.htmlCls.inputTextStr + "id='" + me.pre + "cartoonshape_customcolor' value='" + defaultColor + "' size=4><br/><br/>";

        html += me.htmlCls.divNowrapStr + "5. Opacity: <select id='" + me.pre + "cartoonshape_opacity'>";
        html += me.htmlCls.setHtmlCls.getOptionHtml(['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'], 7);
        html += "</select></div><br>";
        
        html += me.htmlCls.spanNowrapStr + "6. " + me.htmlCls.buttonStr + "applycartoonshape'>Display</button></span>";
        html += me.htmlCls.space3 + me.htmlCls.spanNowrapStr + me.htmlCls.buttonStr + "clearcartoonshape'>Clear</button></span>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_distmanysets' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_distmanysets', 'Measure distances among many sets');
        html += me.htmlCls.spanNowrapStr + "1. Select sets for pairwise distances</span><br/>";
        html += "<table border=0 width=400 cellspacing=10><tr><td>";

        html += me.htmlCls.divNowrapStr + "First sets:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDistTable2' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td><td>";

        html += me.htmlCls.divNowrapStr + "Second sets:</div>";
        html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDistTable' multiple size='5' style='min-width:130px;'>";
        html += "</select></div>";

        html += "</td></tr></table>";

        html += me.htmlCls.spanNowrapStr + "2. " + me.htmlCls.buttonStr + "applydisttable'>Distances in Table</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_stabilizer_rm' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_stabilizer_rm', 'Remove a stabilizer');
        if(me.utilsCls.isMobile()) {
            html += me.htmlCls.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
        }
        else {
            html += me.htmlCls.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
        }
        html += me.htmlCls.spanNowrapStr + "2. " + me.htmlCls.buttonStr + "applypick_stabilizer_rm'>Remove</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_thickness' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_thickness', 'Set thickness');
        html += me.htmlCls.setHtmlCls.setThicknessHtml('3dprint');
        html += "</div>";

        html += me.htmlCls.divStr + "dl_thickness2' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_thickness2', 'Set thickness');
        html += me.htmlCls.setHtmlCls.setThicknessHtml('style');
        html += "</div>";

        html += me.htmlCls.divStr + "dl_menupref' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_menupref', 'Preferences for menus');
        html += "<b>Note</b>: The following parameters will be saved in cache. You just need to set them once. <br><br>";

        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "apply_menupref'>Apply</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "reset_menupref' style='margin-left:30px'>Reset to Simple Menus</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "reset_menupref_all' style='margin-left:30px'>Reset to All Menus</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "savepref' style='margin-left:30px'>Save Preferences</button></span><br><br>";

        html += "<div id='" + me.pre + "menulist'></div><br><br>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "apply_menupref2'>Apply</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "reset_menupref2' style='margin-left:30px'>Reset to Simple Menus</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "reset_menupref_all2' style='margin-left:30px'>Reset to All Menus</button></span>";
        html += me.htmlCls.spanNowrapStr + "" + me.htmlCls.buttonStr + "savepref2' style='margin-left:30px'>Save Preferences</button></span>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_addtrack' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_addtrack', 'Add a track');
        html += " <input type='hidden' id='" + me.pre + "track_chainid' value=''>";

        html += me.htmlCls.divStr + "dl_addtrack_tabs' style='border:0px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + "tracktab2c'>Isoforms & Exons</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab2b'>MSA</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab1'>NCBI gi/Accession</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab2'>FASTA</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab3'>BED File</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab4'>Custom</a></li>";
        html += "<li><a href='#" + me.pre + "tracktab5'>Current Selection</a></li>";
        html += "</ul>";
        html += me.htmlCls.divStr + "tracktab1'>";
        html += "NCBI gi/Accession: " + me.htmlCls.inputTextStr + "id='" + me.pre + "track_gi' placeholder='gi' size=16> <br><br>";
        html += me.htmlCls.buttonStr + "addtrack_button1'>Add Track</button>";
        html += "</div>";
        html += me.htmlCls.divStr + "tracktab2'>";
        html += "FASTA Title: " + me.htmlCls.inputTextStr + "id='" + me.pre + "fasta_title' placeholder='track title' size=16> <br><br>";
        html += "FASTA sequence: <br><textarea id='" + me.pre + "track_fasta' rows='5' style='width: 100%; height: " +(2*me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
        html += me.htmlCls.buttonStr + "addtrack_button2'>Add Track</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "tracktab2b'>";
        // html += "<div style='width:600px'>The full protein sequences with gaps are listed one by one. The sequence of the structure is listed at the top. If there are non-gap residues(e.g., from RefSeq) outside of the sequence of the structure, please remove them. Each sequence has a title line starting with \">\".</div><br>";
        html += "<div style='width:600px'>Note: The full protein sequences with gaps in MSA are listed one by one. The sequence of the structure is listed at the top. Each sequence has a title line starting with \">\".</div><br>";

        html += "<b>Precalculated Multiple Sequence Alignment (MSA)</b>:<br>";
        html += "<textarea id='" + me.pre + "track_fastaalign' rows='5' style='width: 100%; height: " +(2*me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";

        // html += "<b>Opion 1. Precalculated Multiple Sequence Alignment (MSA)</b>:<br>";
        // html += "<textarea id='" + me.pre + "track_fastaalign' rows='5' style='width: 100%; height: " +(2*me.htmlCls.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
        // html += "<b>Opion 2. NCBI Protein Accessions</b>: "+ me.htmlCls.inputTextStr + "id='" + me.pre + "track_acclist' size=60> <br><br>";
        html += "<b>Position of the first residue in Sequences & Annotations window</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "fasta_startpos' value='1' size=2> <br><br>";

        html += "Color Sequence by: <select id='" + me.pre + "colorseqby'>";
        html += me.htmlCls.optionStr + "'identity' selected>Identity</option>";
        html += me.htmlCls.optionStr + "'conservation'>Conservation</option>";
        html += "</select> <br><br>";

        html += me.htmlCls.buttonStr + "addtrack_button2b'>Add Track(s)</button>";
        html += "</div>";

        html += me.htmlCls.divStr + "tracktab2c'>";
        html += "<div style='width:500px'>Note: Show exons for all isoforms of the protein in the same gene as specified below.</div><br>";

        html += "<b><a href='https://www.ncbi.nlm.nih.gov/gene' target='_blank'>NCBI Gene</a> ID</b>: "+ me.htmlCls.inputTextStr + "id='" + me.pre + "track_geneid' size=20>" + me.htmlCls.space3 + me.htmlCls.buttonStr + "exons_table'>Exons & Introns in Gene Table</button><br><br>";

        html += "<b>Position of the first residue in Sequences & Annotations window</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "fasta_startpos2' value='1' size=2> <br><br>";

        // html += "Color Sequence by: <select id='" + me.pre + "colorseqby2'>";
        // html += me.htmlCls.optionStr + "'identity' selected>Identity</option>";
        // html += me.htmlCls.optionStr + "'conservation'>Conservation</option>";
        // html += "</select> <br><br>";

        html += me.htmlCls.buttonStr + "addtrack_button2c'>Show Isoforms & Exons</button>";
        html += "</div>";


        html += me.htmlCls.divStr + "tracktab3'>";
        html += "BED file: " + me.htmlCls.inputFileStr + "id='" + me.pre + "track_bed' size=16> <br><br>";
        html += me.htmlCls.buttonStr + "addtrack_button3'>Add Track</button>";
        html += "</div>";
        html += me.htmlCls.divStr + "tracktab4'>";
        html += "Track Title: " + me.htmlCls.inputTextStr + "id='" + me.pre + "track_title' placeholder='track title' size=16> <br><br>";
        html += "Track Text (e.g., \"2 G, 5-6 RR\" defines a character \"G\" at the position 2 and two continuous characters \"RR\" at positions from 5 to 6. The starting position is 1): <br>";
        html += "<textarea id='" + me.pre + "track_text' rows='5' style='width: 100%; height: " +(2*me.htmlCls.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
        html += me.htmlCls.buttonStr + "addtrack_button4'>Add Track</button>";
        html += "</div>";
        html += me.htmlCls.divStr + "tracktab5'>";
        html += "Track Title: " + me.htmlCls.inputTextStr + "id='" + me.pre + "track_selection' placeholder='track title' size=16> <br><br>";
        html += me.htmlCls.buttonStr + "addtrack_button5'>Add Track</button>";
        html += "</div>";

        html += "</div>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_saveselection' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_saveselection', 'Save Selection');
        let index =(ic && ic.defNames2Atoms) ? Object.keys(ic.defNames2Atoms).length : 1;
        let suffix = '';
        html += "Name: " + me.htmlCls.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> <br>";
        //html += "Description: " + me.htmlCls.inputTextStr + "id='" + me.pre + "seq_command_desc" + suffix + "' value='seq_desc_" + index + "' size='10'> <br>";
        html += "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button><br/><br/>";
        html += "</div>";


        html += me.htmlCls.divStr + "dl_copyurl' style='width:520px;' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_copyurl', 'Share Link');
        html += "<br>";
        html += "1. <b>URLs Used in Browsers</b><br><br>"

        html += "Please copy one of the URLs below. They show the same result.<br>(To add a title to share link, click \"Windows > Your Note\" and click \"File > Share Link\" again.)<br><br>";
        html += "Original URL with commands: <br><textarea id='" + me.pre + "ori_url' rows='4' style='width:100%'></textarea><br><br>";
        if(!me.cfg.notebook) {
            html += "Lifelong Short URL:(To replace this URL, send a pull request to update share.html at <a href='https://github.com/ncbi/icn3d' target='_blank'>iCn3D GitHub</a>)<br>" + me.htmlCls.inputTextStr + "id='" + me.pre + "short_url' value='' style='width:100%'><br><br>";
            html += "Lifelong Short URL + Window Title:(To update the window title, click \"Analysis > Your Note/Window Title\".)<br>" + me.htmlCls.inputTextStr + "id='" + me.pre + "short_url_title' value='' style='width:100%'><br><br>";
        }

        html += "2. <b>Commands Used in Jupyter Noteboook</b><br><br>"
        html += "Please copy the following commands into a cell in Jupyter Notebook to show the same result. <br>More details are at https://github.com/ncbi/icn3d/tree/master/jupyternotebook.<br><br>";

        html += '<textarea id="' + me.pre + 'jn_commands" rows="4" style="width:100%"></textarea><br>';

        html += buttonStrTmp + me.pre + 'jn_copy">Copy Commands</button><br>';

        html += "</div>";

        html += me.htmlCls.divStr + "dl_selectannotations' class='" + dialogClass + " icn3d-annotation' style='background-color:white;'>";
        html += this.addNotebookTitle('dl_selectannotations', 'Sequences & Annotations');

        html += me.htmlCls.divStr + "dl_annotations_tabs'>";

        html += me.htmlCls.divStr + "dl_anno_view_tabs' style='border:0px; height:33px;'>";
        html += "<ul>";
        html += "<li><a href='#" + me.pre + "anno_tmp1' id='" + me.pre + "anno_summary'>Summary</a></li>";
        html += "<li><a href='#" + me.pre + "anno_tmp2' id='" + me.pre + "anno_details'>Details</a></li>";
        html += "</ul>";
        html += me.htmlCls.divStr + "anno_tmp1'>";
        html += "</div>";
        html += me.htmlCls.divStr + "anno_tmp2'>";
        html += "</div>";
        html += "</div>";

        html += this.getAnnoHeader();

        html += "<button style='white-space:nowrap; margin-left:5px;' id='" + me.pre + "showallchains'>Show All Chains</button><br>";

        html += me.htmlCls.divStr + "seqguide_wrapper' style='display:none'><br>" + me.htmlCls.setHtmlCls.setSequenceGuide("2") + "</div>";

        html += "</div><br/><hr><br>";

        html += me.htmlCls.divStr + "dl_annotations'>";
        html += "</div>";

        html += "</div>";

        html += me.htmlCls.divStr + "dl_graph' style='background-color:white;' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_graph', 'Interactions');
        me.svgid = me.pre + 'icn3d_viz';
        html += '<style>';
        html += '#' + me.svgid + ' svg { border: 1px solid; font: 13px sans-serif; text-anchor: end; }';
        html += '#' + me.svgid + ' .node { stroke: #eee; stroke-width: 1.5px; }';
        html += '.node .selected { stroke: ' + me.htmlCls.ORANGE + '; }';
        html += '.link { stroke: #999; stroke-opacity: 0.6; }';

        html += '</style>';

        html += me.htmlCls.divNowrapStr + '<b>Zoom</b>: mouse wheel; ' + me.htmlCls.space3 + ' <b>Move</b>: left button; ' + me.htmlCls.space3 + ' <b>Select Multiple Nodes</b>: Ctrl Key and drag an Area' + me.htmlCls.space3;
        html += '<div id="' + me.pre + 'interactionDesc" style="width:20px; margin-top:6px; display:inline-block;"><span id="'
          + me.pre + 'dl_svgcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
          + me.pre + 'dl_svgcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
        html += me.htmlCls.divStr + "dl_svgcolor' style='display:none;'>";
        html += me.htmlCls.divNowrapStr + '<span style="margin-left:33px">Click "View > H-Bonds & Interactions" to adjust parameters and relaunch the graph</span></div>';
        html += me.htmlCls.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
        html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
        html += '<span style="font-weight:bold">Grey</span>: contacts; ';
        html += '<span style="color:' + me.htmlCls.ORANGE + '; font-weight:bold">Orange</span>: disulfide bonds</div>';
        html += me.htmlCls.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
        html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
        html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';
        html += "</div>";

        html += me.htmlCls.divNowrapStr + buttonStrTmp + me.svgid + '_svg">SVG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.svgid + '_png">PNG</button>' + me.htmlCls.space2;
        html += buttonStrTmp + me.svgid + '_json">JSON</button>';
        html += me.htmlCls.space3 + "<div id='" + me.pre + "force' style='display:inline-block;'><b>Force on Nodes</b>: <select id='" + me.svgid + "_force'>";
        html += me.htmlCls.optionStr + "'0'>No</option>";
        html += me.htmlCls.optionStr + "'1'>X-axis</option>";
        html += me.htmlCls.optionStr + "'2'>Y-axis</option>";
        html += me.htmlCls.optionStr + "'3'>Circle</option>";
        html += me.htmlCls.optionStr + "'4' selected>Random</option>";
        html += "</select></div>";
        html += me.htmlCls.space3 + "<b>Label Size</b>: <select id='" + me.svgid + "_label'>";
        tmpStr = 'icn3d-node-text';
        html += me.htmlCls.optionStr + "'" + tmpStr + "0'>No</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "4'>4px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "8' selected>8px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "12'>12px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "16'>16px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "24'>24px</option>";
        html += me.htmlCls.optionStr + "'" + tmpStr + "32'>32px</option>";
        html += "</select>";
        html += me.htmlCls.space3 + "<div id='" + me.pre + "internalEdges' style='display:inline-block;'><b>Internal Edges</b>: <select id='" + me.svgid + "_hideedges'>";
        html += me.htmlCls.optionStr + "'1' selected>Hide</option>";
        html += me.htmlCls.optionStr + "'0'>Show</option>";
        html += "</select></div>";
        html += "</div>";

        html += '<svg id="' + me.svgid + '" style="margin-top:6px;"></svg>';
        html += "</div>";

        html += me.htmlCls.divStr + "dl_area' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_area', 'Surface Area');
        html += "Solvent Accessible Surface Area(SASA) calculated using the <a href='https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0008140' target='_blank'>EDTSurf algorithm</a>: <br>";
        html += '(0-20% out is considered "in". 50-100% out is considered "out".)<br><br>';
        html += "<b>Toal</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "areavalue' value='' size='10'> &#8491;<sup>2</sup><br><br>";
        html += "<div id='" + me.pre + "areatable' style='max-height:400px; overflow:auto'></div>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_colorbyarea' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_colorbyarea', 'Color by surface area');
        html += "<div style='width:500px'>Color each residue based on the percentage of solvent accessilbe surface area. The color ranges from blue, to white, to red for a percentage of 0, 35(variable), and 100, respectively.</div><br>";
        html += "<b>Middle Percentage(White)</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "midpercent' value='35' size='10'>% <br><br>";
        html += "<button style='white-space:nowrap;' id='" + me.pre + "applycolorbyarea'>Color</button><br/><br/>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_rmsd' class='" + dialogClass + "' style='max-width:300px'>";
        html += this.addNotebookTitle('dl_rmsd', 'RMSD', true);
        
        html += "</div>";

        html += me.htmlCls.divStr + "dl_buriedarea' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_buriedarea', 'Buried surface area', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_propbypercentout' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_propbypercentout', 'Select residues basen on solvent accessilbe surface area');
        html += "<div style='width:400px'>Select residue based on the percentage of solvent accessilbe surface area. The values are in the range of 0-100.</div><br>";
        html += "<b>Min Percentage</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "minpercentout' value='0' size='10'>% <br>";
        html += "<b>Max Percentage</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "maxpercentout' value='100' size='10'>% <br>";
        html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbypercentout'>Apply</button><br/><br/>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_propbybfactor' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_propbybfactor', 'Select residues basen on B-factor');
        html += "<div style='width:400px'>Select residue based on B-factor. The values are in the range of 0-100.</div><br>";
        html += "<b>Min B-factor</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "minbfactor' value='0' size='10'>% <br>";
        html += "<b>Max B-factor</b>: " + me.htmlCls.inputTextStr + "id='" + me.pre + "maxbfactor' value='100' size='10'>% <br>";
        html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbybfactor'>Apply</button><br/><br/>";
        html += "</div>";

        html += me.htmlCls.divStr + "dl_legend' class='" + dialogClass + "' style='max-width:500px; background-color:white'>";
        html += this.addNotebookTitle('dl_legend', 'Legend', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_disttable' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_disttable', 'Distance Table', true);
        html += "</div>";

        html += me.htmlCls.divStr + "dl_igrefTpl' class='" + dialogClass + "'>";
        html += this.addNotebookTitle('dl_igrefTpl', 'Choose an Ig template');
        html += "<span style='white-space:nowrap;font-weight:bold;'>Choose an Ig template for selected residues:</span> <br><br><select id='" + me.pre + "igrefTpl'>";

        //html += me.htmlCls.setHtmlCls.getOptionHtml(['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], 3);
        let group2tpl = {};
        group2tpl['V'] = ['FAB-HEAVY_5esv_V-n1', 'FAB-LIGHT_5esv_V-n1', 'VNAR_1t6vN_shark_V', 'TCRa_6jxrm_human_V-n1', 'VISTA_6oilA_human_V', 'CD8a_1cd8A_human_V', 'PD1_4zqkB_human_V', 'ICOS_6x4gA_human_V', 'CD28_1yjdC_human_V', 'PDL1_4z18B_human_V-n1', 'CD2_1hnfA_human_V-n1', 'LAG3_7tzgD_human_V-n1'];
        group2tpl['C1'] = ['FAB-LIGHT_5esv_C1-n2', 'GHR_1axiB_human_FN3-n1', 'VTCN1_Q7Z7D3_human_V-n2', 'B2Microglobulin_7phrL_human_C1', 'FAB-HEAVY_5esv_C1-n2', 'MHCIa_7phrH_human_C1', 'TCRa_6jxrm_human_C1-n2'];
        group2tpl['C2'] = ['CD2_1hnfA_human_C2-n2', 'Siglec3_5j0bB_human_C2-n2', 'LAG3_7tzgD_human_C2-n2', 'Contactin1_3s97C_human_C2-n2'];
        group2tpl['Iset'] = ['BTLA_2aw2A_human_Iset', 'Palladin_2dm3A_human_Iset-n1', 'Titin_4uowM_human_Unk-n152', 'JAM1_1nbqA_human_VorIset-n2', 'CD19_6al5A_human_C2orV-n1'];
        group2tpl['FN3'] = ['InsulinR_8guyE_human_FN3-n1', 'IL6Rb_1bquB_human_FN3-n3', 'Sidekick2_1wf5A_human_FN3-n7', 'InsulinR_8guyE_human_FN3-n2', 'Contactin1_2ee2A_human_FN3-n9', 'IL6Rb_1bquB_human_FN3-n2'];
        group2tpl['Other'] = ['Endo-1,4-BetaXylanase10A_1i8aA_bacteria_n4', 'CoAtomerGamma1_1r4xA_human', 'TP34_2o6cA_bacteria', 'RBPJ_6py8C_human_Unk-n2', 'TP47_1o75A_bacteria', 'C3_2qkiD_human_n1', 'BArrestin1_4jqiA_rat_n1', 'RBPJ_6py8C_human_Unk-n1', 'CuZnSuperoxideDismutase_1hl5C_human', 'TEAD1_3kysC_human', 'ASF1A_2iijA_human', 'MPT63_1lmiA_bacteria', 'NaCaExchanger_2fwuA_dog_n2', 'ORF7a_1xakA_virus', 'ECadherin_4zt1A_human_n2', 'NaKATPaseTransporterBeta_2zxeB_spurdogshark', 'LaminAC_1ifrA_human', 'IsdA_2iteA_bacteria'];  

        for(let group in group2tpl) {
            html += "<optgroup label='" + group + "'>";
            for(let i = 0, il = group2tpl[group].length; i < il; ++i) {
                let template = group2tpl[group][i];
                html += me.htmlCls.optionStr + "'" + template + "'>" + template + "</option>";
            }
            html += "</optgroup>";
        }

        html += "</select><br><br><span style='white-space:nowrap;'>" + me.htmlCls.buttonStr + "mn6_igrefTpl_apply'>Show Ig Ref. Number</button></span>";
        html += "</div>";

        html += "</div>";
        html += "<!--/form-->";

        return html;
    }

    getAnnoHeader() { let me = this.icn3dui, ic = me.icn3d;
        let html = '';

        html += "<div id='" + me.pre + "annoHeaderSection' class='icn3d-box' style='width:520px;'><b>Annotations:&nbsp;</b><br>";
        html += "<div id='" + me.pre + "annoHeader'><table border=0><tr>";
        let tmpStr1 = "<td style='min-width:110px;'><span style='white-space:nowrap'>";
        let tmpStr2 = "<td style='min-width:130px;'><span style='white-space:nowrap'>";

        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_all'>All" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr2 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_cdd' checked>Conserved Domains" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_clinvar'>ClinVar" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_binding'>Functional Sites" + me.htmlCls.space2 + "</span></td>";
        html += "</tr><tr>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_custom'>Custom" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr2 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_3dd'>3D Domains" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_snp'>SNPs" + me.htmlCls.space2 + "</span></td>";
        
        // if(me.cfg.mmdbid != undefined || me.cfg.pdbid != undefined || me.cfg.mmtfid != undefined || me.cfg.mmcifid != undefined) { // PDB
        //     html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_ptm' disabled>PTM (UniProt)" + me.htmlCls.space2 + "</span></td>";
        // }
        // else {
            html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_ptm'>PTM (UniProt)" + me.htmlCls.space2 + "</span></td>";
        // }
        html += "<td></td>";
        html += "</tr><tr>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_ssbond'>Disulfide Bonds" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_interact'>Interactions" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_crosslink'>Cross-Linkages" + me.htmlCls.space2 + "</span></td>";
        html += tmpStr1 + me.htmlCls.inputCheckStr + "id='" + me.pre + "anno_transmem'>Transmembrane" + me.htmlCls.space2 + "</span></td>";

        html += "<td></td>";
        html += "</tr></table></div></div>";

        return html;
    }
}

export {SetDialog}
