/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class LoadCIF {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    loadCIF(bcifData, bcifid, bText, bAppend) { let ic = this.icn3d, me = ic.icn3dui;
        let hAtoms = {};

        // bcifData could be binary or text
        let parsed = (bText) ? CIFTools.Text.parse(bcifData) : CIFTools.Binary.parse(bcifData);

        if (parsed.isError) {
            // report error:
            alert("The Binary CIF data can NOT be parsed: " + parsed.toString());
            return;
        }

        let block = parsed.result.dataBlocks[0];

        let bNMR = false;
        // let lines = src.split('\n');

        let chainsTmp = {} // serial -> atom
        let residuesTmp = {} // serial -> atom

        if(!ic.atoms) bAppend = false;

        let serial, moleculeNum;
        // if(!bMutation && !bAppend) {
        if(!bAppend) {
            ic.init();
            moleculeNum = 1;
            serial = 0;
        }
        else {
            ic.oriNStru = (ic.structures) ? Object.keys(ic.structures).length : 0;

            moleculeNum = ic.oriNStru + 1; //Object.keys(ic.structures).length + 1;
            // Concatenation of two pdbs will have several atoms for the same serial
            serial = (ic.atoms) ? Object.keys(ic.atoms).length : 0;
        }

        //let helices = [], sheets = [];
        let sheetArray = [], sheetStart = [], sheetEnd = [], helixArray = [], helixStart = [], helixEnd = [];

        let chainNum, residueNum, oriResidueNum;
        let prevChainNum = '', prevResidueNum = '', prevOriResidueNum = '', prevResi = 0;
        let bModifyResi = false;

        let id = (bcifid) ? bcifid : ic.defaultPdbId;

        let structure = id;

        let maxMissingResi = 0, prevMissingChain = '';
        let CSerial, prevCSerial, OSerial, prevOSerial;
        
        let bHeader = false, bFirstAtom = true;

        if(block.getCategory("_entry")) {
            id = block.getCategory("_entry").getColumn("id").getString(0);

            if(id == '') {
                if(bAppend) {
                    id = ic.defaultPdbId;
                }
                else {
                    //if(!ic.inputid) ic.inputid = ic.defaultPdbId;
                    id = (ic.inputid && ic.inputid.indexOf('/') == -1) ? ic.inputid.substr(0, 10) : ic.defaultPdbId; //ic.filename.substr(0, 4);
                }
            }

            structure = ic.loadPDBCls.getStructureId(id, moleculeNum);

            ic.molTitle = '';
            ic.molTitleHash = {};

            bHeader = true; // read the first header if there are multiple
        }
        
        if(block.getCategory("_struct")) {
            let title = block.getCategory("_struct").getColumn("title").getString(0);
            title = title.replace(/"/, "'");
            let name = title.replace(/ALPHAFOLD MONOMER V2.0 PREDICTION FOR /gi, '');
            ic.molTitle += name.trim() + " ";
            // if(bEsmfold && ic.esmTitle) ic.molTitle = ic.esmTitle;

            if(!ic.molTitleHash) ic.molTitleHash = {};
            ic.molTitleHash[structure] = ic.molTitle;

        }

        if(block.getCategory("_entity_src_gen")) {
            ic.organism = block.getCategory("_entity_src_gen").getColumn("gene_src_common_name").getString(0);
        }
        
        if(block.getCategory("_database_2")) {
            let database_2 = block.getCategory("_database_2");
        
            // Iterate through every row in the table
            let db2Size = database_2.rowCount ;
            for (let i = 0; i < db2Size; ++i) {
                let db_id = database_2.getColumn("database_id").getString(0);
                let db_code = database_2.getColumn("database_code").getString(0);
            
                if(db_id == "EMDB") {
                    ic.emd = db_code;
                    break;
                }
            }
        }

        if(block.getCategory("_struct_conf")) {
            ic.bSecondaryStructure = true;

            // Retrieve the table corresponding to the struct_conf category, which delineates mainly helix
            let struct_conf = block.getCategory("_struct_conf");
        
            let conf_type_idArray = struct_conf.getColumn("conf_type_id");
        
            let chain1Array = struct_conf.getColumn("beg_auth_asym_id");
            // let resi1Array = struct_conf.getColumn("beg_label_seq_id");
            let resi1Array = struct_conf.getColumn("beg_auth_seq_id");
        
            let chain2Array = struct_conf.getColumn("end_auth_asym_id");
            // let resi2Array = struct_conf.getColumn("end_label_seq_id");
            let resi2Array = struct_conf.getColumn("end_auth_seq_id");
        
            // Iterate through every row in the struct_conf category table, where each row delineates an interatomic connection
            let confSize = struct_conf.rowCount;
            for (let i = 0; i < confSize; ++i) {
                let conf_type_id = conf_type_idArray.getString(i);
            
                let startChain = chain1Array.getString(i);
                let startResi = parseInt(resi1Array.getString(i));
                let endResi = parseInt(resi2Array.getString(i));
            
                if(conf_type_id.substr(0, 4) == "HELX") {
                    for(let j = parseInt(startResi); j <= parseInt(endResi); ++j) {
                        let resid = structure + "_" + startChain + "_" + j;
                        helixArray.push(resid);
        
                        if(j == startResi) helixStart.push(resid);
                        if(j == endResi) helixEnd.push(resid);
                    } 
                }
                else if(conf_type_id.substr(0, 4) == "STRN") {
                    for(let j = startResi; j <= endResi; ++j) {
                        let resid = structure + "_" + startChain + "_" + j;
                        sheetArray.push(resid);
        
                        if(j == startResi) sheetStart.push(resid);
                        if(j == endResi) sheetEnd.push(resid);
                    } 
                }
            }
        
            conf_type_idArray = chain1Array = resi1Array = chain2Array = resi2Array = [];
        }

        if(block.getCategory("_struct_sheet_range")) {
            // Retrieve the table corresponding to the struct_sheet_range category, which delineates mainly beta sheet
            let struct_sheet_range = block.getCategory("_struct_sheet_range");
        
            let chain1Array = struct_sheet_range.getColumn("beg_auth_asym_id");
            // let resi1Array = struct_sheet_range.getColumn("beg_label_seq_id");
            let resi1Array = struct_sheet_range.getColumn("beg_auth_seq_id");
        
            let chain2Array = struct_sheet_range.getColumn("end_auth_asym_id");
            // let resi2Array = struct_sheet_range.getColumn("end_label_seq_id");
            let resi2Array = struct_sheet_range.getColumn("end_auth_seq_id");
        
            // Iterate through every row in the struct_sheet_range category table, where each row delineates an interatomic connection
            let sheetSize = struct_sheet_range.rowCount;
            for (let i = 0; i < sheetSize; ++i) {
                let startChain = chain1Array.getString(i);
                let startResi = parseInt(resi1Array.getString(i));
                let endResi = parseInt(resi2Array.getString(i));

                for(let j = startResi; j <= endResi; ++j) {
                    let resid = structure + "_" + startChain + "_" + j;
                    sheetArray.push(resid);
    
                    if(j == startResi) sheetStart.push(resid);
                    if(j == endResi) sheetEnd.push(resid);
                } 
            }
        
            chain1Array = resi1Array = chain2Array = resi2Array = [];
        }

        if(block.getCategory("_struct_conn")) {
            ic.bSsbondProvided = true;

            // Retrieve the table corresponding to the struct_conn category, which delineates connections1
            let struct_conn = block.getCategory("_struct_conn");
        
            let conn_type_idArray = struct_conn.getColumn("conn_type_id");
        
            let chain1Array = struct_conn.getColumn("ptnr1_auth_asym_id");
            let name1Array = struct_conn.getColumn("ptnr1_label_atom_id");
            let resi1Array = struct_conn.getColumn("ptnr1_label_seq_id");
        
            let chain2Array = struct_conn.getColumn("ptnr2_auth_asym_id");
            let name2Array = struct_conn.getColumn("ptnr2_label_atom_id");
            let resi2Array = struct_conn.getColumn("ptnr2_label_seq_id");
        
            let connSize = struct_conn.rowCount;
            for (let i = 0; i < connSize; ++i) {
                let conn_type_id = conn_type_idArray.getString(i);
            
                let chain1 = chain1Array.getString(i);
                let name1 = name1Array.getString(i);
                let resi1 = resi1Array.getString(i);
                let id1 = structure + '_' + chain1 + "_" + resi1;
            
                let chain2 = chain2Array.getString(i);
                let name2 = name2Array.getString(i);
                let resi2 = resi2Array.getString(i);
                let id2 = structure + '_' + chain2 + "_" + resi2;
            
                // Verify that the linkage is covalent, as indicated by the conn_type_id attribute2
            
                // if (conn_type_id == "covale") {
                //     vBonds.push(id1);
                //     vBonds.push(id2);
                // }
                
                if(conn_type_id == "disulf") {
                    if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];

                    ic.ssbondpnts[structure].push(id1);
                    ic.ssbondpnts[structure].push(id2);
                }
            }
        
            conn_type_idArray = chain1Array = name1Array = resi1Array = chain2Array = name2Array = resi2Array = [];
        }

        if(block.getCategory("_exptl")) {
            let method = block.getCategory("_exptl").getColumn("method").getString(0);
            if(method.indexOf('NMR') != -1) {
                bNMR = true;
            }
        }

        if(block.getCategory("_pdbx_struct_oper_list")) {
            // Retrieve the table corresponding to the struct_oper_list category, which delineates assembly
            let struct_oper_list = block.getCategory("_pdbx_struct_oper_list");
        
            let struct_oper_idArray = struct_oper_list.getColumn("id");
            let m11Array = struct_oper_list.getColumn("matrix[1][1]");
            let m12Array = struct_oper_list.getColumn("matrix[1][2]");
            let m13Array = struct_oper_list.getColumn("matrix[1][3]");
            let m14Array = struct_oper_list.getColumn("vector[1]");
        
            let m21Array = struct_oper_list.getColumn("matrix[2][1]");
            let m22Array = struct_oper_list.getColumn("matrix[2][2]");
            let m23Array = struct_oper_list.getColumn("matrix[2][3]");
            let m24Array = struct_oper_list.getColumn("vector[2]");
        
            let m31Array = struct_oper_list.getColumn("matrix[3][1]");
            let m32Array = struct_oper_list.getColumn("matrix[3][2]");
            let m33Array = struct_oper_list.getColumn("matrix[3][3]");
            let m34Array = struct_oper_list.getColumn("vector[3]");
        
            let assemblySize = struct_oper_list.rowCount;
            for (let i = 0; i < assemblySize; ++i) {
                let struct_oper_id = struct_oper_idArray.getString(i);
                if(struct_oper_id == "X0") continue;

                if (ic.biomtMatrices[i] == undefined) ic.biomtMatrices[i] = new THREE.Matrix4().identity();
                ic.biomtMatrices[i].set(m11Array.getString(i), m12Array.getString(i), m13Array.getString(i), m14Array.getString(i), 
                    m21Array.getString(i), m22Array.getString(i), m23Array.getString(i), m24Array.getString(i), 
                    m31Array.getString(i), m32Array.getString(i), m33Array.getString(i), m34Array.getString(i), 
                    0, 0, 0, 1);
            }
        
            struct_oper_idArray = m11Array = m12Array = m13Array = m14Array = m21Array = m22Array = m23Array 
            = m24Array = m31Array = m32Array = m33Array = m34Array = [];
        }

        // if (record === 'ENDMDL') {
        //     ++moleculeNum;
        //     id = ic.defaultPdbId;

        //     structure = ic.loadPDBCls.getStructureId(id, moleculeNum);

        //     //helices = [];
        //     //sheets = [];
        //     if(!bNMR) {
        //         sheetArray = [];
        //         sheetStart = [];
        //         sheetEnd = [];
        //         helixArray = [];
        //         helixStart = [];
        //         helixEnd = [];
        //     }

        //     bHeader = false; // reinitialize to read structure name from the header
        // }

        if(block.getCategory("_citation")) {
            ic.pmid = block.getCategory("_citation").getColumn("pdbx_database_id_PubMed").getString(0);
        }

        // Retrieve the table corresponding to the atom_site category, which delineates atomic constituents
        let atom_site = block.getCategory("_atom_site");
        let atomSize = atom_site.rowCount;
        // let bFull = (atomSize * 10 > ic.maxatomcnt) ? false : true;
        let bFull = (atomSize > ic.maxatomcnt) ? false : true;

        if(!bFull) {
            ic.opts['proteins'] = 'c alpha trace'; //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
            ic.opts['nucleotides'] = 'o3 trace'; //nucleotide cartoon, o3 trace, schematic, lines, stick,
        }

        let atom_hetatmArray = atom_site.getColumn("group_PDB");
        let resnArray = atom_site.getColumn("label_comp_id");
        let elemArray = atom_site.getColumn("type_symbol");
        let nameArray = atom_site.getColumn("label_atom_id");

        let chainArray = atom_site.getColumn("auth_asym_id");

        let resiArray = atom_site.getColumn("label_seq_id");
        let resiOriArray = atom_site.getColumn("auth_seq_id");
        let altArray = atom_site.getColumn("label_alt_id");

        let bArray = atom_site.getColumn("B_iso_or_equiv");

        let xArray = atom_site.getColumn("Cartn_x");
        let yArray = atom_site.getColumn("Cartn_y");
        let zArray = atom_site.getColumn("Cartn_z");

        let autochainArray = atom_site.getColumn("label_asym_id");

        // get the bond info
        let ligSeqHash = {}, prevAutochain = '';
        let prevResn, tmpResi = 0;
        let sChain = {};
        for (let i = 0; i < atomSize; ++i) {
            let atom_hetatm = atom_hetatmArray.getString(i);
            let resn = resnArray.getString(i);
            let elem = elemArray.getString(i);
            let atom = nameArray.getString(i);
            let chain = chainArray.getString(i);
            let resi = resiArray.getString(i);
            let oriResi = resiOriArray.getString(i); 
            let alt = altArray.getString(i);
            let bFactor = bArray.getString(i);

            let autochain = autochainArray.getString(i);


            resi = oriResi;

            let molecueType;
            if(atom_hetatm == "ATOM") {
                if(resn.length == 3) {
                    molecueType = "p"; // protein
                }
                else {
                    molecueType = "n"; // nucleotide
                }
            }
            else {
                if(resn == "WAT" || resn == "HOH") {
                    molecueType = "s"; // solvent
                    chain = 'Misc';
                }
                else {
                    molecueType = "l"; // ligands or ions
                    chain = resn;
                }
            }
            if(chain === '') chain = 'A';

            // C-alpha only for large structure
            if(!bFull && ((molecueType == "p" && !(elem == 'C' && atom == 'CA')) || (molecueType == "n" && !(atom == "P")) ) ) continue;
            
            // skip alternative atoms
            if(alt == "B") continue;

            sChain[chain] = 1;

            if(bFirstAtom) {
                structure = ic.loadPDBCls.getStructureId(id, moleculeNum);

                bFirstAtom = false;
            }

            // "CA" has to appear before "O". Otherwise the cartoon of secondary structure will have breaks
            // Concatenation of two pdbs will have several atoms for the same serial
            ++serial;

            // if(oriResi != resi || bModifyResi) { // e.g., 99A and 99
            //     bModifyResi = true;
            // }

            if(resi == "?" || resi == "." || resi == "0") {
                resi = oriResi;

                // if(resn.length != 3 || resn == "HOH" || resn == "WAT") {
                //     if(resn.length != 3 || (elem == 'O' && (resn == "HOH" || resn == "WAT"))) {
                //         resi = (++tmpResi).toString();
                //     }
                // }
                // else {
                //     if(chain + "_" + resn != prevResn || prevAutochain != autochain) {
                //         resi = (++tmpResi).toString();
                //     }
                //     else {
                //         resi = (tmpResi).toString();
                //     }
                // }
            }

            if(molecueType == 's' || molecueType == "l") {
                let seq = {};
                if(!ligSeqHash.hasOwnProperty(chain)) {
                    ligSeqHash[chain] = [];
                }

                if(resn.length != 3 || resn == "HOH" || resn == "WAT") {
                    if(resn.length != 3 || (elem == 'O' && (resn == "HOH" || resn == "WAT"))) {
                        seq.resi = resi;
                        seq.name = me.utilsCls.residueName2Abbr(resn);
                        ligSeqHash[chain].push(seq);
                    }
                }
                else {
                    if(chain + "_" + resn != prevResn || prevAutochain != autochain) {
                        seq.resi = resi;
                        seq.name = me.utilsCls.residueName2Abbr(resn);
                        ligSeqHash[chain].push(seq);
                    }
                }
            }

            // if(bOpm && resn === 'DUM') {
            //     elem = atom;
            //     chain = 'MEM';
            //     resi = 1;
            //     oriResi = 1;
            // }

            // if(bVector && resn === 'DUM') break; // just need to get the vector of the largest chain

            chainNum = structure + "_" + chain;
            oriResidueNum = chainNum + "_" + oriResi;
            if(chainNum !== prevChainNum) {
                prevResi = 0;
                // bModifyResi = false;
            }

            residueNum = chainNum + "_" + resi;

            //let chain_resi = chain + "_" + resi;

            let x = xArray.getFloat(i);
            let y = yArray.getFloat(i);
            let z = zArray.getFloat(i);
            let coord = new THREE.Vector3(x, y, z);

            let atomDetails = {
                het: (atom_hetatm == "HETATM"), // optional, used to determine chemicals, water, ions, etc
                serial: serial,         // required, unique atom id
                name: atom,             // required, atom name
                alt: alt,               // optional, some alternative coordinates
                resn: resn,         // optional, used to determine protein or nucleotide
                structure: structure,   // optional, used to identify structure
                chain: chain,           // optional, used to identify chain
                resi: resi,             // optional, used to identify residue ID
                //insc: line.substr(26, 1),
                coord: coord,           // required, used to draw 3D shape
                b: bFactor,             // optional, used to draw B-factor tube
                elem: elem,             // optional, used to determine hydrogen bond
                bonds: [],              // required, used to connect atoms
                ss: 'coil',             // optional, used to show secondary structures
                ssbegin: false,         // optional, used to show the beginning of secondary structures
                ssend: false            // optional, used to show the end of secondary structures
            }

            if(!atomDetails.het && atomDetails.name === 'C') {
                CSerial = serial;
            }
            if(!atomDetails.het && atomDetails.name === 'O') {
                OSerial = serial;
            }

            // from DSSP C++ code
            // if(!atomDetails.het && atomDetails.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
            //     let dist = ic.atoms[prevCSerial].coord.distanceTo(ic.atoms[prevOSerial].coord);

            //     let x2 = atomDetails.coord.x + (ic.atoms[prevCSerial].coord.x - ic.atoms[prevOSerial].coord.x) / dist;
            //     let y2 = atomDetails.coord.y + (ic.atoms[prevCSerial].coord.y - ic.atoms[prevOSerial].coord.y) / dist;
            //     let z2 = atomDetails.coord.z + (ic.atoms[prevCSerial].coord.z - ic.atoms[prevOSerial].coord.z) / dist;

            //     atomDetails.hcoord = new THREE.Vector3(x2, y2, z2);
            // }

            ic.atoms[serial] = atomDetails;

            ic.dAtoms[serial] = 1;
            ic.hAtoms[serial] = 1;
            hAtoms[serial] = 1;

            // Assign secondary structures from the input
            // if a residue is assigned both sheet and helix, it is assigned as sheet
            if(ic.loadPDBCls.isSecondary(residueNum, sheetArray, bNMR, !bFull)) {
                ic.atoms[serial].ss = 'sheet';
                if(ic.loadPDBCls.isSecondary(residueNum, sheetStart, bNMR, !bFull)) {
                ic.atoms[serial].ssbegin = true;
                }

                // do not use else if. Some residues are both start and end of secondary structure
                if(ic.loadPDBCls.isSecondary(residueNum, sheetEnd, bNMR, !bFull)) {
                ic.atoms[serial].ssend = true;
                }
            }
            else if(ic.loadPDBCls.isSecondary(residueNum, helixArray, bNMR, !bFull)) {
                ic.atoms[serial].ss = 'helix';

                if(ic.loadPDBCls.isSecondary(residueNum, helixStart, bNMR, !bFull)) {
                ic.atoms[serial].ssbegin = true;
                }

                // do not use else if. Some residues are both start and end of secondary structure
                if(ic.loadPDBCls.isSecondary(residueNum, helixEnd, bNMR, !bFull)) {
                ic.atoms[serial].ssend = true;
                }
            }

            let secondaries = '-';
            if(ic.atoms[serial].ss === 'helix') {
                secondaries = 'H';
            }
            else if(ic.atoms[serial].ss === 'sheet') {
                secondaries = 'E';
            }
            //else if(ic.atoms[serial].ss === 'coil') {
            //    secondaries = 'c';
            //}
            else if(!ic.atoms[serial].het && me.parasCls.residueColors.hasOwnProperty(ic.atoms[serial].resn.toUpperCase()) ) {
                secondaries = 'c';
            }
            else {
                secondaries = 'o';
            }

            ic.secondaries[residueNum] = secondaries;

            // different residue
            //if(residueNum !== prevResidueNum) {
                
            // if(oriResidueNum !== prevOriResidueNum) {
            if(oriResidueNum !== prevOriResidueNum || chain + "_" + resn != prevResn || prevAutochain != autochain) {
                let residue = me.utilsCls.residueName2Abbr(resn);
                
                ic.residueId2Name[residueNum] = residue;

                if(serial !== 1 && prevResidueNum !== '') {
                    ic.residues[prevResidueNum] = residuesTmp;
                }

                if(residueNum !== prevResidueNum) {
                    residuesTmp = {}
                }

                // different chain
                if(chainNum !== prevChainNum) {
                    prevCSerial = undefined;
                    prevOSerial = undefined;

                    // a chain could be separated in two sections
                    if(serial !== 1 && prevChainNum !== '') {
                        if(ic.chains[prevChainNum] === undefined) ic.chains[prevChainNum] = {}
                        ic.chains[prevChainNum] = me.hashUtilsCls.unionHash(ic.chains[prevChainNum], chainsTmp);
                    }

                    chainsTmp = {}

                    if(ic.structures[structure.toString()] === undefined) ic.structures[structure.toString()] = [];
                    if(!ic.structures[structure.toString()].includes(chainNum)) ic.structures[structure.toString()].push(chainNum);

                    if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

                    let resObject = {}
                    resObject.resi = resi;
                    resObject.name = residue;

                    ic.chainsSeq[chainNum].push(resObject);
                }
                else {
                    prevCSerial = CSerial;
                    prevOSerial = OSerial;

                    let resObject = {}
                    resObject.resi = resi;
                    resObject.name = residue;

                    ic.chainsSeq[chainNum].push(resObject);
                }
            }

            chainsTmp[serial] = 1;
            residuesTmp[serial] = 1;

            prevChainNum = chainNum;
            prevResidueNum = residueNum;
            prevOriResidueNum = oriResidueNum;

            prevResn = chain + "_" + resn;
            prevAutochain = autochain;
        }

        // add the last residue set
        ic.residues[residueNum] = residuesTmp;
        if(ic.chains[chainNum] === undefined) ic.chains[chainNum] = {}
        ic.chains[chainNum] = me.hashUtilsCls.unionHash2Atoms(ic.chains[chainNum], chainsTmp, ic.atoms);

        // clear memory
        atom_hetatmArray = resnArray = elemArray = nameArray = chainArray = resiArray = resiOriArray 
            = altArray = bArray = xArray = yArray = zArray = autochainArray = [];

        let mChainSeq = {};
        if(block.getCategory("_pdbx_poly_seq_scheme")) {
            let poly_seq_scheme = block.getCategory("_pdbx_poly_seq_scheme");

            let resiArray = poly_seq_scheme.getColumn("seq_id");
            let oriResiArray = poly_seq_scheme.getColumn("pdb_seq_num");
            let resnArray = poly_seq_scheme.getColumn("mon_id");
            let chainArray = poly_seq_scheme.getColumn("pdb_strand_id");

            let seqSize = poly_seq_scheme.rowCount;
            let prevChain = "";
            let seqArray = [];
            for (let i = 0; i < seqSize; ++i) {
                let resi = resiArray.getString(i);
                let oriResi = oriResiArray.getString(i);
                let resn = resnArray.getString(i);
                let chain = chainArray.getString(i);

                if(chain != prevChain && i > 0) {
                    mChainSeq[prevChain] = seqArray;

                    seqArray = [];
                }

                // seqArray.push({"resi": resi, "name": me.utilsCls.residueName2Abbr(resn)});
                seqArray.push({"resi": oriResi, "name": me.utilsCls.residueName2Abbr(resn)});

                prevChain = chain;
            }

            mChainSeq[prevChain] = seqArray;

            resiArray = oriResiArray = resnArray = chainArray = [];
        }
        
        this.setSeq(structure, sChain, mChainSeq, ligSeqHash);

        // copy disulfide bonds
        let structureArray = Object.keys(ic.structures);
        for(let s = 0, sl = structureArray.length; s < sl; ++s) {
            let structure = structureArray[s];

            if(structure == id) continue;

            if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];

            if(ic.ssbondpnts[id] !== undefined) {
                for(let j = 0, jl = ic.ssbondpnts[id].length; j < jl; ++j) {
                    let ori_resid = ic.ssbondpnts[id][j];
                    let pos = ori_resid.indexOf('_');
                    let resid = structure + ori_resid.substr(pos);

                    ic.ssbondpnts[structure].push(resid);
                }
            }
        }

        // calculate disulfide bonds for CIF files
        if(!ic.bSsbondProvided) {
            ic.loadPDBCls.setSsbond();
        }

        let curChain, curResi, curInsc, curResAtoms = [];
      
        let pmin = new THREE.Vector3( 9999, 9999, 9999);
        let pmax = new THREE.Vector3(-9999,-9999,-9999);
        let psum = new THREE.Vector3();
        let cnt = 0;

        // lipids may be considered as protein if "ATOM" instead of "HETATM" was used
        let lipidResidHash = {}

        // assign atoms
        let prevCarbonArray = []; 
        //for (let i in ic.atoms) {
        for (let i in ic.hAtoms) {    
            let atom = ic.atoms[i];
            let coord = atom.coord;
            psum.add(coord);
            pmin.min(coord);
            pmax.max(coord);
            ++cnt;

            if(cnt == 1) {
                curChain = atom.chain;
                curResi = atom.resi;
                prevCarbonArray.push(atom);
            }

            if(!atom.het) {
              if($.inArray(atom.resn, me.parasCls.nucleotidesArray) !== -1) {
                ic.nucleotides[atom.serial] = 1;
                //if (atom.name === 'P') {
                if (atom.name === "O3'" || atom.name === "O3*") {
                    ic.nucleotidesO3[atom.serial] = 1;

                    ic.secondaries[atom.structure + '_' + atom.chain + '_' + atom.resi] = 'o'; // nucleotide
                }

                if(me.parasCls.nuclMainArray.indexOf(atom.name) === -1) {
                    ic.ntbase[atom.serial] = 1;
                }
              }
              else {
                if (atom.elem === 'P') {
                    lipidResidHash[atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;
                }

                ic.proteins[atom.serial] = 1;
                if (atom.name === 'CA') ic.calphas[atom.serial] = 1;
                if (atom.name !== 'N' && atom.name !== 'H' && atom.name !== 'CA' && atom.name !== 'HA' && atom.name !== 'C' && atom.name !== 'O') ic.sidec[atom.serial] = 1;
              }
            }
            else if(atom.het) {
              if(atom.resn === 'HOH' || atom.resn === 'WAT' || atom.resn === 'SOL') {
                ic.water[atom.serial] = 1;
              }
              else if($.inArray(atom.resn, me.parasCls.ionsArray) !== -1 || atom.elem.trim() === atom.resn.trim()) {
                ic.ions[atom.serial] = 1;
              }
              else {
                ic.chemicals[atom.serial] = 1;
              }

              atom.color = me.parasCls.atomColors[atom.elem];
            }

            if(!(curChain === atom.chain && curResi === atom.resi)) {
                // a new residue, add the residue-residue bond besides the regular bonds               
                ic.loadPDBCls.refreshBonds(curResAtoms, prevCarbonArray[0]);

                prevCarbonArray.splice(0, 1); // remove the first carbon

                curChain = atom.chain;
                curResi = atom.resi;
                //curInsc = atom.insc;
                curResAtoms.length = 0;
            }
            curResAtoms.push(atom);

            if(atom.name === 'C' || atom.name === 'O3\'') {
                prevCarbonArray.push(atom);
            }
        } // end of for

        // last residue
        //refreshBonds();
        ic.loadPDBCls.refreshBonds(curResAtoms, prevCarbonArray[0]);

        // reset lipid
        for(let resid in lipidResidHash) {
            let atomHash = ic.residues[resid];
            for(serial in atomHash) {
                let atom = ic.atoms[serial];

                atom.het = true;
                ic.chemicals[atom.serial] = 1;
                ic.secondaries[resid] = 'o'; // nucleotide

                delete ic.proteins[atom.serial];
                if (atom.name === 'CA') delete ic.calphas[atom.serial];
                if (atom.name !== 'N' && atom.name !== 'H' && atom.name !== 'CA' && atom.name !== 'HA' && atom.name !== 'C' && atom.name !== 'O') delete ic.sidec[atom.serial];
            }
        }

        ic.pmin = pmin;
        ic.pmax = pmax;

        ic.cnt = cnt;

        //ic.maxD = ic.pmax.distanceTo(ic.pmin);
        //ic.center = psum.multiplyScalar(1.0 / ic.cnt);
        ic.center = ic.ParserUtilsCls.getGeoCenter(ic.pmin, ic.pmax);

        ic.maxD = ic.ParserUtilsCls.getStructureSize(ic.atoms, ic.pmin, ic.pmax, ic.center);

        if (ic.maxD < 5) ic.maxD = 5;

        ic.oriMaxD = ic.maxD;
        ic.oriCenter = ic.center.clone();

        // if(type === 'target') {
        //     ic.oriMaxD = ic.maxD;
        //     ic.center1 = ic.center;
        // }
        // else if(type === 'query') {
        //     if(ic.oriMaxD < ic.maxD) ic.oriMaxD = ic.maxD;

        //     ic.center2 = ic.center;
        //     ic.center = new THREE.Vector3(0,0,0);
        // }

        // if(bVector) { // just need to get the vector of the largest chain
        //     return ic.loadPDBCls.getChainCalpha(ic.chains, ic.atoms);
        // }
        // else {
            return hAtoms;
        // }
    }

    setSeq(structure, sChain, mChainSeq, ligSeqHash) { let ic = this.icn3d, me = ic.icn3dui;
        for(let chain in sChain) {
            let chainNum = structure + '_' + chain;

            if(ligSeqHash.hasOwnProperty(chain)) {
                ic.chainsSeq[chainNum] = ligSeqHash[chain];
            }
            else {
                ic.chainsSeq[chainNum] = mChainSeq[chain];
            }
        }

        ic.loadPDBCls.setResidMapping();
    }
}

export {LoadCIF}
