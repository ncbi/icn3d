/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setDialogs = function() { var me = this, ic = me.icn3d; "use strict";
    var html = "";

    me.optionStr = "<option value=";

    html += "<!-- dialog will not be part of the form -->";

    var divClass = (me.cfg.notebook) ? '' : 'icn3d-hidden';
    var dialogClass = (me.cfg.notebook) ? 'icn3d-hidden' : '';
    html += me.divStr + "alldialogs' class='" + divClass + " icn3d-dialog'>";

    html += me.divStr + "dl_2ddgm' class='" + dialogClass + " icn3d-dl_2ddgm'>";
    html += "</div>";

//    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined || me.bRealign || me.bSymd) {
      html += me.divStr + "dl_alignment' class='" + dialogClass + "' style='background-color:white;'>";
      html += me.divStr + "symd_info'></div>";
      html += me.divStr + "alignseqguide_wrapper'><br>" + me.setAlignSequenceGuide() + "</div>";
      html += me.divStr + "dl_sequence2' class='icn3d-dl_sequence'>";
      html += "</div>";
      html += "</div>";
//    }

    html += me.divStr + "dl_definedsets' class='" + dialogClass + "'>";
    html += me.divStr + "dl_setsmenu'>";
    html += "<b>Defined Sets:</b> <br/>";
    html += "<select id='" + me.pre + "atomsCustom' multiple size='6' style='min-width:130px;'>";
    html += "</select>";
    html += "<div style='margin: 6px 0 6px 0;'>" + me.buttonStr + "deletesets'><b>Delete Selected Sets</b></button></div>";
    html += '        <b>Set Operations</b>: <div style="width:20px; margin-top:6px; display:inline-block;"><span id="' + me.pre + 'dl_command_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="' + me.pre + 'dl_command_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div><br>';
    html += "</div>";

    html += me.divStr + "dl_command' style='display:none;'>";
    html += me.divStr + "dl_setoperations'>";
    html += "<label for='" + me.pre + "setOr'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setOr' checked> Union (or) </label><br/>";
    html += "<label for='" + me.pre + "setAnd'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setAnd'> Intersection (and) </label><br/>";
    html += "<label for='" + me.pre + "setNot'>" + me.inputRadioStr + "name='" + me.pre + "setOperation' id='" + me.pre + "setNot'> Exclusion (not) </label>";
    html += "</div><br>";

    html += me.setAdvanced();

    html += "</div>";
    html += "</div>";

    html += me.setAdvanced(2);

    html += me.divStr + "dl_mmtfid' class='" + dialogClass + "'>";
    html += "MMTF ID: " + me.inputTextStr + "id='" + me.pre + "mmtfid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmtf'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pdbid' class='" + dialogClass + "'>";
    html += "PDB ID: " + me.inputTextStr + "id='" + me.pre + "pdbid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_pdb'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_opmid' class='" + dialogClass + "'>";
    html += "<a href='https://opm.phar.umich.edu' target='_blank'>Orientations of Proteins in Membranes(OPM)</a> PDB ID: " + me.inputTextStr + "id='" + me.pre + "opmid' value='6JXR' size=8> ";
    html += me.buttonStr + "reload_opm'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pdbfile' class='" + dialogClass + "'>";
    html += "Note: Several PDB files could be concatenated into a single PDB file. Use the line \"ENDMDL\" to separate PDB files.<br><br>";
    html += "PDB File: " + me.inputFileStr + " id='" + me.pre + "pdbfile' size=8> ";
    html += me.buttonStr + "reload_pdbfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_rescolorfile' class='" + dialogClass + "'>";
    html += '<div style="width:450px;">The custom JSON file on residue colors has the following format for proteins ("ALA" and "ARG") and nucleotides ("G" and "A"):<br>';
    html += '{"ALA":"#C8C8C8", "ARG":"#145AFF", ..., "G":"#008000", "A":"#6080FF", ...}</div><br>';
    html += "Residue Color File: " + me.inputFileStr + "id='" + me.pre + "rescolorfile' size=8> ";
    html += me.buttonStr + "reload_rescolorfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_customcolor' class='" + dialogClass + "'>";
    html += " <input type='hidden' id='" + me.pre + "customcolor_chainid' value=''>";
    html += '<div style="width:450px;">The custom file for the structure has two columns separated by space or tab: ';
    html += 'residue number, and score in the range of 0-100. If you click "Custom Color" button, ';
    html += 'scores 0 and 100 mean blue and red, respectively. If you click "Custom Tube", ';
    html += 'the selected residues will be displayed in a style similar to "B-factor Tube".</div><br>';
    html += "Custom File: " + me.inputFileStr + "id='" + me.pre + "cstcolorfile' size=8> ";
    html += me.buttonStr + "reload_customcolorfile' style='margin-left:15px'>Custom Color</button>";
    html += me.buttonStr + "reload_customtubefile' style='margin-left:15px'>Custom Tube</button>";

    html += "</div>";

    html += me.divStr + "dl_align' class='" + dialogClass + "'>";
    html += "Enter the PDB IDs or MMDB IDs of two structures that have been found to be similar by <A HREF=' " + me.baseUrl + "vastplus/vastplus.cgi'>VAST+</A> : <br/><br/>ID1: " + me.inputTextStr + "id='" + me.pre + "alignid1' value='1HHO' size=8>" + me.space3 + me.space3 + "ID2: " + me.inputTextStr + "id='" + me.pre + "alignid2' value='4N7N' size=8><br/><br/>";
    html += me.buttonStr + "reload_align_ori'>All Matching Molecules Superposed</button>" + me.space3 + me.buttonStr + "reload_align_refined'>Invariant Substructure Superposed</button>";
    html += "</div>";

    html += me.divStr + "dl_chainalign' class='" + dialogClass + "'>";
/*
    html += "Enter the PDB chain IDs in the form of pdbid_chain (e.g., 1HHO_A, case sensitive): <br/><br/>ID1: " + me.inputTextStr + "id='" + me.pre + "chainalignid1' value='1HHO_A' size=8>" + me.space3 + me.space3 + "ID2: " + me.inputTextStr + "id='" + me.pre + "chainalignid2' value='4N7N_A' size=8><br/><br/>";
    html += me.buttonStr + "reload_chainalign'>Align</button><br/><br/>";
    html += "<div style='width:450px'>(Note: To align chains in custom PDB files, you could concatenate PDB files in a single PDB file with the separation line \"ENDMDL\". Then load it in \"Open File > PDB File\" in the \"File\" menu and click \"View Sequences & Annotations\" in the \"Window\" menu. Finally select two chains in the sequence window and click \"Realign Selection\" in the \"File\" menu.)</div>";
    html += "</div>";
*/
    html += "<div style='width:500px'>";
    html += "All chains will be aligned to the first chain in the comma-separated chain IDs. Each chain ID has the form of pdbid_chain (e.g., 1HHO_A, case sensitive). If the residue numbers to be aligned in the first chain is not defined, the full chain will be used for sequence alignment.<br/><br/>";
    html += "<div style='display:inline-block; width:110px'>Chain IDs: </div>" + me.inputTextStr + "id='" + me.pre + "chainalignids' value='1HHO_A,4N7N_A' size=50><br/>";
    html += "<div style='display:inline-block; width:110px'>Residue Numbers (optional): </div>" + me.inputTextStr + "id='" + me.pre + "resalignids' placeholder='1,5,10-50' size=50><br/><br/>";
    html += me.buttonStr + "reload_chainalign'>Align</button><br/><br/>";
    html += "(Note: To align chains in custom PDB files, you could concatenate PDB files in a single PDB file with the separation line \"ENDMDL\". Then load it in \"Open File > PDB File\" in the \"File\" menu and click \"View Sequences & Annotations\" in the \"Window\" menu. Finally select multiple chains in the sequence window and click \"Realign Selection\" in the \"File\" menu.)<br><br>";
    html += "</div></div>";

    html += me.divStr + "dl_mutation' class='" + dialogClass + "'>";
    html += "<div style='width:500px'>";
    html += 'Please specify the mutations with a comma separated mutation list. Each mutation can be specified as "[PDB ID]_[Chain ID]_[Residue Number]_[One Letter Mutatnt Residue]". E.g., the mutation of N501Y in the E chain of PDB 6M0J can be specified as "6M0J_E_501_Y". <br/><br/>';
    html += "<div style='display:inline-block; width:110px'>Mutations: </div>" + me.inputTextStr + "id='" + me.pre + "mutationids' value='6M0J_E_484_K,6M0J_E_501_Y,6M0J_E_417_N' size=50><br/><br/>";
    html += me.buttonStr + "reload_mutation_3d' title='Show the mutations in 3D using the scap program'>3D with scap</button>";
    html += me.buttonStr + "reload_mutation_inter' style='margin-left:20px' title='Show the mutations in 3D and the change of interactions'>Interactions</button>";
    html += me.buttonStr + "reload_mutation_pdb' style='margin-left:20px' title='Show the mutations in 3D and export the PDB of the mutant within 10 angstrom'>PDB</button>";
    html += "<br/><br/></div></div>";

    html += me.divStr + "dl_mol2file' class='" + dialogClass + "'>";
    html += "Mol2 File: " + me.inputFileStr + "id='" + me.pre + "mol2file' size=8> ";
    html += me.buttonStr + "reload_mol2file'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_sdffile' class='" + dialogClass + "'>";
    html += "SDF File: " + me.inputFileStr + "id='" + me.pre + "sdffile' size=8> ";
    html += me.buttonStr + "reload_sdffile'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_xyzfile' class='" + dialogClass + "'>";
    html += "XYZ File: " + me.inputFileStr + "id='" + me.pre + "xyzfile' size=8> ";
    html += me.buttonStr + "reload_xyzfile'>Load</button>";
    html += "</div>";
    html += me.divStr + "dl_urlfile' class='" + dialogClass + "'>";
    html += "File type: ";
    html += "<select id='" + me.pre + "filetype'>";
    html += me.optionStr + "'pdb' selected>pdb</option>";
    html += me.optionStr + "'mol2'>mol2</option>";
    html += me.optionStr + "'sdf'>sdf</option>";
    html += me.optionStr + "'xyz'>xyz</option>";
    html += "</select><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "urlfile' size=20><br/> ";
    html += me.buttonStr + "reload_urlfile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmciffile' class='" + dialogClass + "'>";
    html += "mmCIF File: " + me.inputFileStr + "id='" + me.pre + "mmciffile' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmciffile'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmcifid' class='" + dialogClass + "'>";
    html += "mmCIF ID: " + me.inputTextStr + "id='" + me.pre + "mmcifid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmcif'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_mmdbid' class='" + dialogClass + "'>";
    html += "MMDB or PDB ID: " + me.inputTextStr + "id='" + me.pre + "mmdbid' value='1TUP' size=8> ";
    html += me.buttonStr + "reload_mmdb'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_blast_rep_id' style='max-width:500px;' class='" + dialogClass + "'>";
    html += "Enter a Sequence ID (or FASTA sequence) and the aligned Structure ID, which can be found using the <a href='https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastp&PAGE_TYPE=BlastSearch&DATABASE=pdb' target='_blank'>BLAST</a> search against the pdb database with the Sequence ID or FASTA sequence as input.<br><br> ";
    html += "<b>Sequence ID</b> (NCBI protein accession of a sequence): " + me.inputTextStr + "id='" + me.pre + "query_id' value='NP_001108451.1' size=8><br> ";
    html += "or FASTA sequence: <br><textarea id='" + me.pre + "query_fasta' rows='5' style='width: 100%; height: " + (me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "<b>Structure ID</b> (NCBI protein accession of a chain of a 3D structure): " + me.inputTextStr + "id='" + me.pre + "blast_rep_id' value='1TSR_A' size=8><br> ";
    html += me.buttonStr + "reload_blast_rep_id'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_yournote' class='" + dialogClass + "'>";
    html += "Your note will be saved in the HTML file when you click \"File > Save Files > iCn3D PNG Image\".<br><br>";
    html += "<textarea id='" + me.pre + "yournote' rows='5' style='width: 100%; height: " + (me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;' placeholder='Enter your note here'></textarea><br>";
    html += me.buttonStr + "applyyournote'>Save</button>";
    html += "</div>";

    html += me.divStr + "dl_gi' class='" + dialogClass + "'>";
    html += "Protein gi: " + me.inputTextStr + "id='" + me.pre + "gi' value='1310960' size=8> ";
    html += me.buttonStr + "reload_gi'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_cid' class='" + dialogClass + "'>";
    html += "PubChem CID: " + me.inputTextStr + "id='" + me.pre + "cid' value='2244' size=8> ";
    html += me.buttonStr + "reload_cid'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_pngimage' class='" + dialogClass + "'>";
    html += "iCn3D PNG image: " + me.inputFileStr + "id='" + me.pre + "pngimage'><br/>";
    html += me.buttonStr + "reload_pngimage' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_state' class='" + dialogClass + "'>";
    html += "State file: " + me.inputFileStr + "id='" + me.pre + "state'><br/>";
    html += me.buttonStr + "reload_state' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_fixedversion' style='max-width:500px' class='" + dialogClass + "'>";
    html += "Since January 6, 2021, you can show the original view with the archived version of iCn3D by pasting your URL below and click \"Show Originial View\". Note the version in the parameter \"v\" was used to replace \"full.html\" with \"full_[v].html\" in the URL.<br><br>";
    html += "Share Link URL: " + me.inputTextStr + "id='" + me.pre + "sharelinkurl' size=60><br>";
    html += me.buttonStr + "reload_fixedversion'>Show Original View</button><br><br>";
    html += "</div>";


    html += me.divStr + "dl_selection' class='" + dialogClass + "'>";
    html += "Selection file: " + me.inputFileStr + "id='" + me.pre + "selectionfile'><br/>";
    html += me.buttonStr + "reload_selectionfile' style='margin-top: 6px;'>Load</button>";
    html += "</div>";

    html += me.divStr + "dl_dsn6' class='" + dialogClass + "'>";
    html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigma2fofc'>";

    var optArray1 = ['0', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    html += me.getOptionHtml(optArray1, 3);

    html += "</select> &sigma;</span><br/>";
    html += me.inputFileStr + "id='" + me.pre + "dsn6file2fofc'> " + me.buttonStr + "reload_dsn6file2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmafofc'>";

    html += me.getOptionHtml(optArray1, 5);

    html += "</select> &sigma;</span><br/>";
    html += me.inputFileStr + "id='" + me.pre + "dsn6filefofc'> " + me.buttonStr + "reload_dsn6filefofc' style='margin-top: 6px;'>Load</button><br><br><br>";

    html += me.buttonStr + "elecmapNo4'>Remove Map</button><br>";

    html += "</div>";

    html += me.divStr + "dl_dsn6url' class='" + dialogClass + "'>";
    html += "<b>Note</b>: Always load a PDB file before loading DSN6 files. <br/><br/><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>2fofc contour at: <select id='" + me.pre + "dsn6sigmaurl2fofc'>";

    html += me.getOptionHtml(optArray1, 3);

    html += "</select> &sigma;</span><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "dsn6fileurl2fofc' size=20>" + me.space3 + me.buttonStr + "reload_dsn6fileurl2fofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += "<span style='white-space:nowrap;font-weight:bold;'>fofc contour at: <select id='" + me.pre + "dsn6sigmaurlfofc'>";

    html += me.getOptionHtml(optArray1, 5);

    html += "</select> &sigma;</span><br/>";
    html += "URL in the same host: " + me.inputTextStr + "id='" + me.pre + "dsn6fileurlfofc' size=20>" + me.space3 + me.buttonStr + "reload_dsn6fileurlfofc' style='margin-top: 6px;'>Load</button><br><br><br/>";

    html += me.buttonStr + "elecmapNo5'>Remove Map</button><br>";

    html += "</div>";

    html += me.divStr + "dl_clr' class='" + dialogClass + "'>";
    html += "Click in the input box to use the color picker:<br><br> ";
    html += "Custom Color: " + me.inputTextStr + "id='" + me.pre + "colorcustom' value='FF0000' size=8> ";
    html += me.buttonStr + "applycustomcolor'>Apply</button>";
    html += "</div>";

    html += me.getPotentialHtml('delphi', dialogClass);

    html += me.getPotentialHtml('local', dialogClass);
    html += me.getPotentialHtml('url', dialogClass);

    html += me.divStr + "dl_symmetry' class='" + dialogClass + "'><br>";
    html += me.divNowrapStr + "Symmetry: <select id='" + me.pre + "selectSymmetry'>";
    html += "</select>" + me.space3;
    html += me.buttonStr + "applysymmetry'>Apply</button>" + me.space3;
    html += me.buttonStr + "clearsymmetry'>Clear</button></div>";
    html += "</div>";

    html += me.divStr + "dl_symd' style='max-width:400px' class='" + dialogClass + "'><br>";
/*
    html += "The symmetry is dynamically calculated using <a href='https://symd.nci.nih.gov/'>SymD</a><br><br>";
    html += me.divNowrapStr + "Symmetry: <select id='" + me.pre + "selectSymd'>";
    html += "</select>" + me.space3;
    html += me.buttonStr + "applysymd'>Apply</button>" + me.space3;
    html += me.buttonStr + "clearsymd'>Clear</button></div>";
*/
    html += "</div>";

    html += me.divStr + "dl_hbonds' class='" + dialogClass + "'>";
    html += "1. Choose interaction types and their thresholds:<br>";
    html += "<div class='icn3d-box'><table border=0 width=450><tr>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_hbond' checked>Hydrogen Bonds <span style='background-color:#" + me.hbondColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "hbondthreshold'>";

    var optArray2 = ['3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '4.0', '4.1', '4.2'];
    html += me.getOptionHtml(optArray2, 6);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_saltbridge' checked>Salt Bridge/Ionic <span style='background-color:#" + me.ionicColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "saltbridgethreshold'>";

    var optArray3 = ['3', '4', '5', '6', '7', '8'];
    html += me.getOptionHtml(optArray3, 3);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_contact' checked>Contacts/Interactions <span style='background-color:#" + me.contactColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "contactthreshold'>";

    html += me.getOptionHtml(optArray3, 1);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "</tr>";

    html += "<tr>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_halogen' checked>Halogen Bonds <span style='background-color:#" + me.halogenColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "halogenthreshold'>";

    html += me.getOptionHtml(optArray2, 6);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_pication' checked>&pi;-Cation <span style='background-color:#" + me.picationColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "picationthreshold'>";

    html += me.getOptionHtml(optArray3, 3);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "<td style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "analysis_pistacking' checked>&pi;-Stacking <span style='background-color:#" + me.pistackingColor + "'>" + me.space3 + "</span></td>";
    html += "<td>";
    html += me.divNowrapStr + " <select id='" + me.pre + "pistackingthreshold'>";

    html += me.getOptionHtml(['3', '4', '5'], 99);

    html += me.optionStr + "'5.5' selected>5.5</option>";

    html += me.getOptionHtml(['6', '7', '8'], 99);

    html += "</select> &#197;" + me.space3 + "</div></td>";
    html += "</tr></table></div>";

    html += "<table border=0 width=400 cellspacing=10><tr><td>";

    html += me.divNowrapStr + "2. Select the first set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond2' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td><td>";

    html += me.divNowrapStr + "3. Select the second set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomHbond' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td></tr></table>";

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
        html += "<div>4. <b>Cross Structure Interactions</b>: <select id='" + me.pre + "crossstrucinter'>";
        html += me.optionStr + "'1'>Yes</option>";
        html += me.optionStr + "'0' selected>No</option>";
        html += "</select></div><br>";
        html += "<div style='text-indent:1.1em'>" + me.buttonStr + "applyhbonds'>3D Display Interactions</button></div><br>";
    }
    else {
        html += "<div>4. " + me.buttonStr + "applyhbonds'>3D Display Interactions</button></div><br>";
    }

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondWindow'>Highlight Interactions in Table</button><span style='margin-left:30px; font-wieght:bold'>Sort Interactions on</span>: " + me.buttonStr + "sortSet1'> Set 1</button>" + me.buttonStr + "sortSet2' style='margin-left:20px'>Set 2</button></div><br>";

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondLineGraph'>2D Interaction Network</button> to show interactions between two lines of residue nodes</div><br>";

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondScatterplot'>2D Interaction Map</button> to show interactions as map</div><br>";

    var tmpStr = ': </td><td><input style="margin-left:-12px" type="text" id="';

    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondGraph'>2D Graph (Force-Directed)</button> to show interactions with strength parameters in 0-200:</div>";
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

//    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "hbondExport'>Save</button> H-bond/contact pairs in a file</div><br>";
    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "areaWindow'>Buried Surface Area</button></div><br>";

    html += "<div>5. " + me.buttonStr + "hbondReset'>Reset</button> and select new sets</div>";
    html += "</div>";

    html += me.divStr + "dl_realign' class='" + dialogClass + "'>";

    html += me.divNowrapStr + "1. Select sets from two structures below <br>or use your current selection:</div><br>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomRealign' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "<div>2. " + me.buttonStr + "applyRealign'>Realign</button></div><br>";
    html += "</div>";

    html += me.divStr + "dl_allinteraction' style='background-color:white' class='" + dialogClass + "'>";
    html += "</div>";

    html += me.divStr + "dl_interactionsorted' style='background-color:white' class='" + dialogClass + "'>";
    html += "</div>";

    html += me.divStr + "dl_linegraph' style='background-color:white' class='" + dialogClass + "'>";

    html += me.divNowrapStr + '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
      + me.pre + 'dl_linegraphcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="display:none; width:15px;" title="Expand"></span><span id="'
      + me.pre + 'dl_linegraphcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="width:15px;" title="Shrink"></span></div>';

    html += me.space2 + "Hold Ctrl key to select multiple nodes/lines.</div>";

    html += me.divStr + "dl_linegraphcolor' style='display:block;'>";

    html += me.setColorHints();

    html += "</div><br>";

    var buttonStrTmp = '<button class="icn3d-commandTitle" style="-webkit-appearance:button; height:24px;background-color:#DDD;" id="';

    me.linegraphid = me.pre + 'linegraph';
    html += me.divNowrapStr + buttonStrTmp + me.linegraphid + '_svg">SVG</button>' + me.space2;
    html += buttonStrTmp + me.linegraphid + '_png">PNG</button>' + me.space2;
    html += buttonStrTmp + me.linegraphid + '_json">JSON</button>' + me.space4;
    html += "<b>Scale</b>: <select id='" + me.linegraphid + "_scale'>";

    var optArray4 = ['0.1', '0.2', '0.4', '0.6', '0.8', '1', '2', '4', '6', '8', '10'];
    html += me.getOptionHtml(optArray4, 5);

    html += "</select></div><br>";
    html += '<div id="' + me.pre + 'linegraphDiv"></div>';

    html += "</div>";

    html += me.divStr + "dl_scatterplot' style='background-color:white' class='" + dialogClass + "'>";

    html += me.divNowrapStr + "Hold Ctrl key to select multiple nodes." + me.space3;

    html += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
      + me.pre + 'dl_scatterplotcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
      + me.pre + 'dl_scatterplotcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
    html += me.divStr + "dl_scatterplotcolor' style='display:none;'>";

    html += me.setColorHints();

    html += "</div>";

    me.scatterplotid = me.pre + 'scatterplot';
    html += me.divNowrapStr + buttonStrTmp + me.scatterplotid + '_svg">SVG</button>' + me.space2;
    html += buttonStrTmp + me.scatterplotid + '_png">PNG</button>' + me.space2;
    html += buttonStrTmp + me.scatterplotid + '_json">JSON</button>' + me.space4;
    html += "<b>Scale</b>: <select id='" + me.scatterplotid + "_scale'>";

    html += me.getOptionHtml(optArray4, 5);

    html += "</select></div><br>";
    html += '<div id="' + me.pre + 'scatterplotDiv"></div>';

    html += "</div>";

    html += me.divStr + "dl_elecmap2fofc' class='" + dialogClass + "'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigma2fofc'>";

    html += me.getOptionHtml(optArray1, 3);

    html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applymap2fofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "elecmapNo2'>Remove Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_elecmapfofc' class='" + dialogClass + "'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "sigmafofc'>";

    html += me.getOptionHtml(optArray1, 5);

    html += "</select> &sigma;</span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applymapfofc'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "elecmapNo3'>Remove Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_emmap' class='" + dialogClass + "'>";
    html += "<span style='white-space:nowrap;font-weight:bold;'>Contour at: <select id='" + me.pre + "empercentage'>";

    html += me.getOptionHtml(['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'], 3);

    html += "</select> % of maximum EM values</span><br><span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "applyemmap'>Display</button></span> <span style='white-space:nowrap; margin-left:30px;'>" + me.buttonStr + "emmapNo2'>Remove EM Map</button></span>";
    html += "</div>";

    html += me.divStr + "dl_aroundsphere' class='" + dialogClass + "'>";
    html += me.divNowrapStr + "1. Select the first set:</div>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere2' multiple size='3' style='min-width:130px;'>";
    html += "</select></div><br>";
    html += me.divNowrapStr + "2. Sphere with a radius: " + me.inputTextStr + "id='" + me.pre + "radius_aroundsphere' value='4' size='2'> &#197;</div><br/>";

    html += me.divNowrapStr + "3. Select the second set to apply the sphere:</div>";
    html += "<div style='text-indent:1.1em'><select id='" + me.pre + "atomsCustomSphere' multiple size='3' style='min-width:130px;'>";
    html += "</select></div><br>";

    html += me.divNowrapStr + "4. " + me.buttonStr + "applypick_aroundsphere'>Display</button> the sphere around the first set of atoms</div><br>";
    html += "<div style='text-indent:1.1em'>" + me.buttonStr + "sphereExport'>Save</button> interacting/contacting residue pairs in a file</div>";
    html += "</div>";

    html += me.divStr + "dl_adjustmem' class='" + dialogClass + "'>";
    html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
    html += me.divNowrapStr + "1. Extracellular membrane Z-axis position: " + me.inputTextStr + "id='" + me.pre + "extra_mem_z' value='' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "2. intracellular membrane Z-axis position: " + me.inputTextStr + "id='" + me.pre + "intra_mem_z' value='' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "3. " + me.buttonStr + "apply_adjustmem'>Display</button> the adjusted membranes</div><br>";
    html += "</div>";

    html += me.divStr + "dl_selectplane' class='" + dialogClass + "'>";
    html += "<b>Note</b>: The membranes are parallel to the X-Y plane. The center of the membranes is at Z = 0. <br/><br/>";
    html += me.divNowrapStr + "1. Z-axis position of the first X-Y plane: " + me.inputTextStr + "id='" + me.pre + "selectplane_z1' value='15' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "2. Z-axis position of the second X-Y plane: " + me.inputTextStr + "id='" + me.pre + "selectplane_z2' value='-15' size='3'> &#197;</div><br/>";
    html += me.divNowrapStr + "3. " + me.buttonStr + "apply_selectplane'>Save</button> the region between the planes to Defined Sets</div><br>";
    html += "</div>";

    html += me.divStr + "dl_addlabel' class='" + dialogClass + "'>";
    html += "1. Text: " + me.inputTextStr + "id='" + me.pre + "labeltext' value='Text' size=4><br/>";
    html += "2. Size: " + me.inputTextStr + "id='" + me.pre + "labelsize' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: " + me.inputTextStr + "id='" + me.pre + "labelcolor' value='ffff00' size=4><br/>";
    html += "4. Background: " + me.inputTextStr + "id='" + me.pre + "labelbkgd' value='cccccc' size=4><br/>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "5. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "5. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "6. " + me.buttonStr + "applypick_labels'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_addlabelselection' class='" + dialogClass + "'>";
    html += "1. Text: " + me.inputTextStr + "id='" + me.pre + "labeltext2' value='Text' size=4><br/>";
    html += "2. Size: " + me.inputTextStr + "id='" + me.pre + "labelsize2' value='18' size=4 maxlength=2><br/>";
    html += "3. Color: " + me.inputTextStr + "id='" + me.pre + "labelcolor2' value='ffff00' size=4><br/>";
    html += "4. Background: " + me.inputTextStr + "id='" + me.pre + "labelbkgd2' value='cccccc' size=4><br/>";
    html += me.spanNowrapStr + "5. " + me.buttonStr + "applyselection_labels'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_distance' class='" + dialogClass + "'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. Color: " + me.inputTextStr + "id='" + me.pre + "distancecolor' value='ffff00' size=4><br/>";
    html += me.spanNowrapStr + "3. " + me.buttonStr + "applypick_measuredistance'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_stabilizer' class='" + dialogClass + "'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. Color: " + me.inputTextStr + "id='" + me.pre + "stabilizercolor' value='ffffff' size=4><br/>";
    html += me.spanNowrapStr + "3. " + me.buttonStr + "applypick_stabilizer'>Add</button></span>";
    html += "</div>";

    html += me.divStr + "dl_disttwosets' class='" + dialogClass + "'>";
    html += me.spanNowrapStr + "1. Select two sets</span><br/>";
    html += "<table border=0 width=400 cellspacing=10><tr><td>";

    html += me.divNowrapStr + "First set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDist2' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td><td>";

    html += me.divNowrapStr + "Second set:</div>";
    html += "<div style='text-indent:1.1em'><select style='max-width:200px' id='" + me.pre + "atomsCustomDist' multiple size='5' style='min-width:130px;'>";
    html += "</select></div>";

    html += "</td></tr></table>";

    html += me.spanNowrapStr + "2. Color: " + me.inputTextStr + "id='" + me.pre + "distancecolor2' value='ffff00' size=4><br/><br/>";
    html += me.spanNowrapStr + "3. " + me.buttonStr + "applydist2'>Display</button></span>";
    html += "</div>";

    html += me.divStr + "dl_stabilizer_rm' class='" + dialogClass + "'>";
    if(me.isMobile()) {
        html += me.spanNowrapStr + "1. Touch TWO atoms</span><br/>";
    }
    else {
        html += me.spanNowrapStr + "1. Pick TWO atoms while holding \"Alt\" key</span><br/>";
    }
    html += me.spanNowrapStr + "2. " + me.buttonStr + "applypick_stabilizer_rm'>Remove</button></span>";
    html += "</div>";

    html += me.divStr + "dl_thickness' class='" + dialogClass + "'>";
    html += me.setThicknessHtml('3dprint');
    html += "</div>";

    html += me.divStr + "dl_thickness2' class='" + dialogClass + "'>";
    html += me.setThicknessHtml('style');
    html += "</div>";

    html += me.divStr + "dl_addtrack' class='" + dialogClass + "'>";
    html += " <input type='hidden' id='" + me.pre + "track_chainid' value=''>";

    html += me.divStr + "dl_addtrack_tabs' style='border:0px;'>";
    html += "<ul>";
    html += "<li><a href='#" + me.pre + "tracktab1'>NCBI gi/Accession</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab2'>FASTA</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab2b'>FASTA Alignment</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab3'>BED File</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab4'>Custom</a></li>";
    html += "<li><a href='#" + me.pre + "tracktab5'>Current Selection</a></li>";
    html += "</ul>";
    html += me.divStr + "tracktab1'>";
    html += "NCBI gi/Accession: " + me.inputTextStr + "id='" + me.pre + "track_gi' placeholder='gi' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button1'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab2'>";
    html += "FASTA Title: " + me.inputTextStr + "id='" + me.pre + "fasta_title' placeholder='track title' size=16> <br><br>";
    html += "FASTA sequence: <br><textarea id='" + me.pre + "track_fasta' rows='5' style='width: 100%; height: " + (2*me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += me.buttonStr + "addtrack_button2'>Add Track</button>";
    html += "</div>";

    html += me.divStr + "tracktab2b'>";
    html += "<div style='width:600px'>The full protein sequences with gaps are listed one by one. The sequence of the structure is listed at the top. If there are non-gap residues (e.g., from RefSeq) outside of the sequence of the structure, please remove them. Each sequence has a title line starting with \">\".</div><br>";
    html += "<b>FASTA alignment sequences</b>:<br>";
    html += "<textarea id='" + me.pre + "track_fastaalign' rows='5' style='width: 100%; height: " + (2*me.LOG_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += "Position of the first residue in Sequences & Annotations window: " + me.inputTextStr + "id='" + me.pre + "fasta_startpos' value='1' size=2> <br><br>";

    html += "Color Sequence by: <select id='" + me.pre + "colorseqby'>";
    html += me.optionStr + "'identity' selected>Identity</option>";
    html += me.optionStr + "'conservation'>Conservation</option>";
    html += "</select> <br><br>";

    html += me.buttonStr + "addtrack_button2b'>Add Track(s)</button>";
    html += "</div>";

    html += me.divStr + "tracktab3'>";
    html += "BED file: " + me.inputFileStr + "id='" + me.pre + "track_bed' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button3'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab4'>";
    html += "Track Title: " + me.inputTextStr + "id='" + me.pre + "track_title' placeholder='track title' size=16> <br><br>";
    html += "Track Text (e.g., \"152 G, 155-156 RR\" defines a character \"G\" at the position 152 and two continuous characters \"RR\" at positions from 155 to 156. The starting position is 1): <br>";
    html += "<textarea id='" + me.pre + "track_text' rows='5' style='width: 100%; height: " + (2*me.MENU_HEIGHT) + "px; padding: 0px; border: 0px;'></textarea><br><br>";
    html += me.buttonStr + "addtrack_button4'>Add Track</button>";
    html += "</div>";
    html += me.divStr + "tracktab5'>";
    html += "Track Title: " + me.inputTextStr + "id='" + me.pre + "track_selection' placeholder='track title' size=16> <br><br>";
    html += me.buttonStr + "addtrack_button5'>Add Track</button>";
    html += "</div>";

    html += "</div>";

    html += "</div>";

    html += me.divStr + "dl_saveselection' class='" + dialogClass + "'>";
    var index = (ic) ? Object.keys(ic.defNames2Atoms).length : 1;
    var suffix = '';
    html += "Name: " + me.inputTextStr + "id='" + me.pre + "seq_command_name" + suffix + "' value='seq_" + index + "' size='5'> <br>";
    //html += "Description: " + me.inputTextStr + "id='" + me.pre + "seq_command_desc" + suffix + "' value='seq_desc_" + index + "' size='10'> <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "seq_saveselection" + suffix + "'>Save</button> <button style='white-space:nowrap; margin-left:20px;' id='" + me.pre + "seq_clearselection" + suffix + "'>Clear</button><br/><br/>";
    html += "</div>";


    html += me.divStr + "dl_copyurl' style='width:520px;' class='" + dialogClass + "'>";
    html += "Please copy one of the URLs below. They show the same result.<br>(To add a title to share link, click \"Windows > Your Note\" and click \"File > Share Link\" again.)<br><br>";
    html += "Original URL with commands: <br><textarea id='" + me.pre + "ori_url' rows='4' style='width:100%'></textarea><br><br>";
    html += "Lifelong Short URL: (To replace this URL, send a pull request to update share.html at <a href='https://github.com/ncbi/icn3d' target='_blank'>iCn3D GitHub</a>)<br>" + me.inputTextStr + "id='" + me.pre + "short_url' value='' style='width:100%'><br><br>";
    html += "Lifelong Short URL + Window Title: (To update the window title, click \"Analysis > Your Note/Window Title\".)<br>" + me.inputTextStr + "id='" + me.pre + "short_url_title' value='' style='width:100%'><br><br>";
    html += "</div>";

    html += me.divStr + "dl_selectannotations' class='" + dialogClass + " icn3d-annotation' style='background-color:white;'>";

    html += me.divStr + "dl_annotations_tabs'>";

    html += me.divStr + "dl_anno_view_tabs' style='border:0px; height:33px;'>";
    html += "<ul>";
    html += "<li><a href='#" + me.pre + "anno_tmp1' id='" + me.pre + "anno_summary'>Summary</a></li>";
    html += "<li><a href='#" + me.pre + "anno_tmp2' id='" + me.pre + "anno_details'>Details</a></li>";
    html += "</ul>";
    html += me.divStr + "anno_tmp1'>";
    html += "</div>";
    html += me.divStr + "anno_tmp2'>";
    html += "</div>";
    html += "</div>";

    html += "<div class='icn3d-box' style='width:520px;'><b>Annotations:&nbsp;</b><br><table border=0><tr>";
    var tmpStr1 = "<td style='min-width:110px;'><span style='white-space:nowrap'>";
    var tmpStr2 = "<td style='min-width:130px;'><span style='white-space:nowrap'>";

    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_all'>All" + me.space2 + "</span></td>";
    html += tmpStr2 + me.inputCheckStr + "id='" + me.pre + "anno_cdd' checked>Conserved Domains" + me.space2 + "</span></td>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_clinvar'>ClinVar" + me.space2 + "</span></td>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_binding'>Functional Sites" + me.space2 + "</span></td>";
    html += "</tr><tr>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_custom'>Custom" + me.space2 + "</span></td>";
    html += tmpStr2 + me.inputCheckStr + "id='" + me.pre + "anno_3dd'>3D Domains" + me.space2 + "</span></td>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_snp'>SNPs" + me.space2 + "</span></td>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_interact'>Interactions" + me.space2 + "</span></td>";
    html += "<td></td>";
    html += "</tr><tr>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_ssbond'>Disulfide Bonds" + me.space2 + "</span></td>";
    html += tmpStr1 + me.inputCheckStr + "id='" + me.pre + "anno_crosslink'>Cross-Linkages" + me.space2 + "</span></td>";
    if(me.cfg.opmid !== undefined) {
        html += "<td style='min-width:110px;'><span id='" + me.pre + "anno_transmemli' style='white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "anno_transmem'>Transmembrane" + me.space2 + "</span></td>";
    }
    else {
        html += "<td style='min-width:110px;'><span id='" + me.pre + "anno_transmemli' style='display:none; white-space:nowrap'>" + me.inputCheckStr + "id='" + me.pre + "anno_transmem'>Transmembrane" + me.space2 + "</span></td>";
    }
    html += "<td></td>";
    html += "</tr></table></div>";

    html += "<button style='white-space:nowrap; margin-left:5px;' id='" + me.pre + "showallchains'>Show All Chains</button><br>";

    html += me.divStr + "seqguide_wrapper' style='display:none'><br>" + me.setSequenceGuide("2") + "</div>";

    html += "</div><br/><hr><br>";

    html += me.divStr + "dl_annotations'>";
    html += "</div>";

    html += "</div>";

    html += me.divStr + "dl_graph' style='background-color:white;' class='" + dialogClass + "'>";
    me.svgid = me.pre + 'icn3d_viz';
    html += '<style>';
    html += '#' + me.svgid + ' svg { border: 1px solid; font: 13px sans-serif; text-anchor: end; }';
    html += '#' + me.svgid + ' .node { stroke: #eee; stroke-width: 1.5px; }';
    html += '.node .selected { stroke: ' + me.ORANGE + '; }';
    html += '.link { stroke: #999; stroke-opacity: 0.6; }';

//    html += '.links line { stroke-opacity: 0.6; }';
//    html += '.nodes circle { stroke: #fff; stroke-width: 1.5px; }';
//    html += 'text { font-family: sans-serif; font-weight: bold; font-size: 18px;}';
    html += '</style>';

    html += me.divNowrapStr + '<b>Zoom</b>: mouse wheel; ' + me.space3 + ' <b>Move</b>: left button; ' + me.space3 + ' <b>Select Multiple Nodes</b>: Ctrl Key and drag an Area' + me.space3;
    html += '<div style="width:20px; margin-top:6px; display:inline-block;"><span id="'
      + me.pre + 'dl_svgcolor_expand" class="ui-icon ui-icon-plus icn3d-expand icn3d-link" style="width:15px;" title="Expand"></span><span id="'
      + me.pre + 'dl_svgcolor_shrink" class="ui-icon ui-icon-minus icn3d-shrink icn3d-link" style="display:none; width:15px;" title="Shrink"></span></div></div>';
    html += me.divStr + "dl_svgcolor' style='display:none;'>";
    html += me.divNowrapStr + '<span style="margin-left:33px">Click "View > H-Bonds & Interactions" to adjust parameters and relaunch the graph</span></div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#00FF00; font-weight:bold">Green</span>: H-Bonds; ';
    html += '<span style="color:#00FFFF; font-weight:bold">Cyan</span>: Salt Bridge/Ionic; ';
    html += '<span style="font-weight:bold">Grey</span>: contacts; ';
    html += '<span style="color:' + me.ORANGE + '; font-weight:bold">Orange</span>: disulfide bonds</div>';
    html += me.divNowrapStr + '<span style="margin-left:33px; color:#FF00FF; font-weight:bold">Magenta</span>: Halogen Bonds; ';
    html += '<span style="color:#FF0000; font-weight:bold">Red</span>: &pi;-Cation; ';
    html += '<span style="color:#0000FF; font-weight:bold">Blue</span>: &pi;-Stacking</div>';
    html += "</div>";

    html += me.divNowrapStr + buttonStrTmp + me.svgid + '_svg">SVG</button>' + me.space2;
    html += buttonStrTmp + me.svgid + '_png">PNG</button>' + me.space2;
    html += buttonStrTmp + me.svgid + '_json">JSON</button>';
    html += me.space3 + "<b>Force on Nodes</b>: <select id='" + me.svgid + "_force'>";
    html += me.optionStr + "'0'>No</option>";
    html += me.optionStr + "'1'>X-axis</option>";
    html += me.optionStr + "'2'>Y-axis</option>";
    html += me.optionStr + "'3'>Circle</option>";
    html += me.optionStr + "'4' selected>Random</option>";
    html += "</select>";
    html += me.space3 + "<b>Label Size</b>: <select id='" + me.svgid + "_label'>";
    tmpStr = 'icn3d-node-text';
    html += me.optionStr + "'" + tmpStr + "0'>No</option>";
    html += me.optionStr + "'" + tmpStr + "4'>4px</option>";
    html += me.optionStr + "'" + tmpStr + "8' selected>8px</option>";
    html += me.optionStr + "'" + tmpStr + "12'>12px</option>";
    html += me.optionStr + "'" + tmpStr + "16'>16px</option>";
    html += me.optionStr + "'" + tmpStr + "24'>24px</option>";
    html += me.optionStr + "'" + tmpStr + "32'>32px</option>";
    html += "</select>";
    html += me.space3 + "<b>Internal Edges</b>: <select id='" + me.svgid + "_hideedges'>";
    html += me.optionStr + "'1' selected>Hide</option>";
    html += me.optionStr + "'0'>Show</option>";
    html += "</select>";
    html += "</div>";

    html += '<svg id="' + me.svgid + '" style="margin-top:6px;"></svg>';
    html += "</div>";

    html += me.divStr + "dl_area' class='" + dialogClass + "'>";
    html += "Solvent Accessible Surface Area (SASA) calculated using the <a href='https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0008140' target='_blank'>EDTSurf algorithm</a>: <br>";
    html += '(0-20% out is considered "in". 50-100% out is considered "out".)<br><br>';
    html += "<b>Toal</b>: " + me.inputTextStr + "id='" + me.pre + "areavalue' value='' size='10'> &#8491;<sup>2</sup><br><br>";
    html += "<div id='" + me.pre + "areatable' style='max-height:400px; overflow:auto'></div>";
    html += "</div>";

    html += me.divStr + "dl_colorbyarea' class='" + dialogClass + "'>";
    html += "<div style='width:500px'>Color each residue based on the percentage of solvent accessilbe surface area. The color ranges from blue, to white, to red for a percentage of 0, 35 (variable), and 100, respectively.</div><br>";
    html += "<b>Middle Percentage (White)</b>: " + me.inputTextStr + "id='" + me.pre + "midpercent' value='35' size='10'>% <br><br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applycolorbyarea'>Color</button><br/><br/>";
    html += "</div>";

    html += me.divStr + "dl_rmsd' class='" + dialogClass + "'>";
    html += "<br><b>Alignment RMSD</b>: " + me.inputTextStr + "id='" + me.pre + "realignrmsd' value='35' size='10'>&#8491;<br><br>";
    html += "</div>";

    html += me.divStr + "dl_buriedarea' class='" + dialogClass + "'>";
    html += "</div>";

    html += me.divStr + "dl_propbypercentout' class='" + dialogClass + "'>";
    html += "<div style='width:400px'>Select residue based on the percentage of solvent accessilbe surface area. The values are in the range of 0-100.</div><br>";
    html += "<b>Min Percentage</b>: " + me.inputTextStr + "id='" + me.pre + "minpercentout' value='0' size='10'>% <br>";
    html += "<b>Max Percentage</b>: " + me.inputTextStr + "id='" + me.pre + "maxpercentout' value='100' size='10'>% <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbypercentout'>Apply</button><br/><br/>";
    html += "</div>";

    html += me.divStr + "dl_propbybfactor' class='" + dialogClass + "'>";
    html += "<div style='width:400px'>Select residue based on B-factor. The values are in the range of 0-100.</div><br>";
    html += "<b>Min B-factor</b>: " + me.inputTextStr + "id='" + me.pre + "minbfactor' value='0' size='10'>% <br>";
    html += "<b>Max B-factor</b>: " + me.inputTextStr + "id='" + me.pre + "maxbfactor' value='100' size='10'>% <br>";
    html += "<button style='white-space:nowrap;' id='" + me.pre + "applypropbybfactor'>Apply</button><br/><br/>";
    html += "</div>";

    html += "</div>";
    html += "<!--/form-->";

    return html;
};
