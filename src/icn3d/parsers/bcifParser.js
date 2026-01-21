/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class BcifParser {
    constructor(icn3d) {
        this.icn3d = icn3d;

        this.mElem2Radius = {};

        // http://en.wikipedia.org/wiki/Covalent_radius
        this.mElem2Radius["H"] = 0.31;
        this.mElem2Radius["HE"] = 0.28;
        this.mElem2Radius["LI"] = 1.28;
        this.mElem2Radius["BE"] = 0.96;
        this.mElem2Radius["B"] = 0.84;
        this.mElem2Radius["C"] = 0.76;
        this.mElem2Radius["N"] = 0.71;
        this.mElem2Radius["O"] = 0.66;
        this.mElem2Radius["F"] = 0.57;
        this.mElem2Radius["NE"] = 0.58;
        this.mElem2Radius["NA"] = 1.66;
        this.mElem2Radius["MG"] = 1.41;
        this.mElem2Radius["AL"] = 1.21;
        this.mElem2Radius["SI"] = 1.11;
        this.mElem2Radius["P"] = 1.07;
        this.mElem2Radius["S"] = 1.05;
        this.mElem2Radius["CL"] = 1.02;
        this.mElem2Radius["AR"] = 1.06;
        this.mElem2Radius["K"] = 2.03;
        this.mElem2Radius["CA"] = 1.76;
        this.mElem2Radius["SC"] = 1.70;
        this.mElem2Radius["TI"] = 1.60;
        this.mElem2Radius["V"] = 1.53;
        this.mElem2Radius["CR"] = 1.39;
        this.mElem2Radius["MN"] = 1.39;
        this.mElem2Radius["FE"] = 1.32;
        this.mElem2Radius["CO"] = 1.26;
        this.mElem2Radius["NI"] = 1.24;
        this.mElem2Radius["CU"] = 1.32;
        this.mElem2Radius["ZN"] = 1.22;
        this.mElem2Radius["GA"] = 1.22;
        this.mElem2Radius["GE"] = 1.20;
        this.mElem2Radius["AS"] = 1.19;
        this.mElem2Radius["SE"] = 1.20;
        this.mElem2Radius["BR"] = 1.20;
        this.mElem2Radius["KR"] = 1.16;
        this.mElem2Radius["RB"] = 2.20;
        this.mElem2Radius["SR"] = 1.95;
        this.mElem2Radius["Y"] = 1.90;
        this.mElem2Radius["ZR"] = 1.75;
        this.mElem2Radius["NB"] = 1.64;
        this.mElem2Radius["MO"] = 1.54;
        this.mElem2Radius["TC"] = 1.47;
        this.mElem2Radius["RU"] = 1.46;
        this.mElem2Radius["RH"] = 1.42;
        this.mElem2Radius["PD"] = 1.39;
        this.mElem2Radius["AG"] = 1.45;
        this.mElem2Radius["CD"] = 1.44;
        this.mElem2Radius["IN"] = 1.42;
        this.mElem2Radius["SN"] = 1.39;
        this.mElem2Radius["SB"] = 1.39;
        this.mElem2Radius["TE"] = 1.38;
        this.mElem2Radius["I"] = 1.39;
        this.mElem2Radius["XE"] = 1.40;
        this.mElem2Radius["CS"] = 2.44;
        this.mElem2Radius["BA"] = 2.15;
        this.mElem2Radius["LA"] = 2.07;
        this.mElem2Radius["CE"] = 2.04;
        this.mElem2Radius["PR"] = 2.03;
        this.mElem2Radius["ND"] = 2.01;
        this.mElem2Radius["PM"] = 1.99;
        this.mElem2Radius["SM"] = 1.98;
        this.mElem2Radius["EU"] = 1.98;
        this.mElem2Radius["GD"] = 1.96;
        this.mElem2Radius["TB"] = 1.94;
        this.mElem2Radius["DY"] = 1.92;
        this.mElem2Radius["HO"] = 1.92;
        this.mElem2Radius["ER"] = 1.89;
        this.mElem2Radius["TM"] = 1.90;
        this.mElem2Radius["YB"] = 1.87;
        this.mElem2Radius["LU"] = 1.87;
        this.mElem2Radius["HF"] = 1.75;
        this.mElem2Radius["TA"] = 1.70;
        this.mElem2Radius["W"] = 1.62;
        this.mElem2Radius["RE"] = 1.51;
        this.mElem2Radius["OS"] = 1.44;
        this.mElem2Radius["IR"] = 1.41;
        this.mElem2Radius["PT"] = 1.36;
        this.mElem2Radius["AU"] = 1.36;
        this.mElem2Radius["HG"] = 1.32;
        this.mElem2Radius["TL"] = 1.45;
        this.mElem2Radius["PB"] = 1.46;
        this.mElem2Radius["BI"] = 1.48;
        this.mElem2Radius["PO"] = 1.40;
        this.mElem2Radius["AT"] = 1.50;
        this.mElem2Radius["RN"] = 1.50;
        this.mElem2Radius["FR"] = 2.60;
        this.mElem2Radius["RA"] = 2.21;
        this.mElem2Radius["AC"] = 2.15;
        this.mElem2Radius["TH"] = 2.06;
        this.mElem2Radius["PA"] = 2.00;
        this.mElem2Radius["U"] = 1.96;
        this.mElem2Radius["NP"] = 1.90;
        this.mElem2Radius["PU"] = 1.87;
        this.mElem2Radius["AM"] = 1.80;
        this.mElem2Radius["CM"] = 1.69;
    }

    // https://github.com/dsehnal/CIFTools.js
    // https://github.com/molstar/BinaryCIF
    async downloadBcif(bcifid) { let ic = this.icn3d, me = ic.icn3dui;
        ic.ParserUtilsCls.setYourNote(bcifid.toUpperCase() + '(BCIF) in iCn3D');
        //ic.bCid = undefined;

        let url = 'https://models.rcsb.org/' + bcifid + '.bcif';
        let bcifArrayBuffer = await me.getXMLHttpRqstPromise(url, 'GET', 'arraybuffer', 'bcif');

        if(bcifArrayBuffer.length == 0) {
            alert('This PDB structure is not found at RCSB...');
            return;
        }

        let bText = false;
        // let bcifData = this.getBcifJson(bcifArrayBuffer, bcifid, bText);
        // let bcifJson = JSON.parse(bcifData);
        // await ic.mmcifParserCls.loadMmcifData(bcifJson, bcifid);

        await ic.opmParserCls.loadOpmData(bcifArrayBuffer, bcifid, undefined, 'bcif', undefined, bText);
    }

    getBcifJson(bcifData, bcifid, bText, bNoCoord) { let ic = this.icn3d, me = ic.icn3dui;
        let q = "\"";
        let text = "";

        let pmid = "", title = "", keyword = "", emd = "", organism = "";

        // bcifData could be binary or text
        let parsed = (bText) ? CIFTools.Text.parse(bcifData) : CIFTools.Binary.parse(bcifData);

        if (parsed.isError) {
            // report error:
            alert("The Binary CIF data can NOT be parsed: " + parsed.toString());
            return;
        }

        let block = parsed.result.dataBlocks[0];

        if(!bcifid) {
            if(block.getCategory("_entry")) {
                bcifid = block.getCategory("_entry").getColumn("id").getString(0);
            }
            if(bcifid == "") bcifid = "stru";
        }

        if(block.getCategory("_citation")) {
            pmid = block.getCategory("_citation").getColumn("pdbx_database_id_PubMed").getString(0);
        }

        if(block.getCategory("_struct")) {
            title = block.getCategory("_struct").getColumn("title").getString(0);
            title = title.replace(/"/g, "'");
        }

        if(block.getCategory("_struct_keywords")) {
            keyword = block.getCategory("_struct_keywords").getColumn("pdbx_keywords").getString(0);
        }
        
        if(block.getCategory("_entity_src_gen")) {
            organism = block.getCategory("_entity_src_gen").getColumn("gene_src_common_name").getString(0);
        }

        let sSSBegin = {}, sSSEnd = {};
        let mResId2SS = {};

        if(block.getCategory("_database_2")) {
            let database_2 = block.getCategory("_database_2");

            // Iterate through every row in the table
            let db2Size = database_2.rowCount ;
            for (let i = 0; i < db2Size; ++i) {
                let db_id = database_2.getColumn("database_id").getString(i);
                let db_code = database_2.getColumn("database_code").getString(i);

                if(db_id == "EMDB") {
                    emd = db_code;
                    break;
                }
            }
        }

        let bSecondary = false;
        if(block.getCategory("_struct_conf")) {
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

                let chain1 = chain1Array.getString(i);
                let resi1 = resi1Array.getString(i);
                let id1 = chain1 + "_" + resi1;

                let chain2 = chain2Array.getString(i);
                let resi2 = resi2Array.getString(i);
                let id2 = chain2 + "_" + resi2;

                let ss;
                if(conf_type_id.substr(0, 4) == "HELX") {
                    ss = "helix";

                    sSSBegin[id1] = 1;
                    sSSEnd[id2] = 1;
                }
                else if(conf_type_id.substr(0, 4) == "STRN") {
                    ss = "sheet";

                    sSSBegin[id1] = 1;
                    sSSEnd[id2] = 1;
                }

                if(ss == "helix" || ss == "sheet") {
                    bSecondary = true;
                    for(let j = parseInt(resi1); j <= parseInt(resi2); ++j) {
                        let id = chain1 + "_" + j;
                        mResId2SS[id] = ss;
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
                let chain1 = chain1Array.getString(i);
                let resi1 = resi1Array.getString(i);
                let id1 = chain1 + "_" + resi1;

                sSSBegin[id1] = 1;

                let chain2 = chain2Array.getString(i);
                let resi2 = resi2Array.getString(i);
                let id2 = chain2 + "_" + resi2;

                sSSEnd[id2] = 1;

                let ss = "sheet";

                for(let j = parseInt(resi1); j <= parseInt(resi2); ++j) {
                    let id = chain1 + "_" + j;
                    mResId2SS[id] = ss;
                }
            }

            chain1Array = resi1Array = chain2Array = resi2Array = [];
        }

        // Iterate through every row in the struct_conn category table, where each row delineates an interatomic connection
        let mId2Set = {};
        let vBonds = [];
        let vDisulfides = [];

        if(block.getCategory("_struct_conn")) {
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
                let id1 = chain1 + "_" + resi1 + "_" + name1;

                let chain2 = chain2Array.getString(i);
                let name2 = name2Array.getString(i);
                let resi2 = resi2Array.getString(i);
                let id2 = chain2 + "_" + resi2 + "_" + name2;

                // Verify that the linkage is covalent, as indicated by the conn_type_id attribute2

                if (conn_type_id == "covale") {
                    vBonds.push(id1);
                    vBonds.push(id2);
                }
                else if(conn_type_id == "disulf") {
                    vDisulfides.push(bcifid + "_" + chain1 + "_" + resi1);
                    vDisulfides.push(bcifid + "_" + chain2 + "_" + resi2);
                }
            }

            conn_type_idArray = chain1Array = name1Array = resi1Array = chain2Array = name2Array = resi2Array = [];
        }

        // Retrieve the table corresponding to the atom_site category, which delineates atomic constituents
        let atom_site = block.getCategory("_atom_site");

        // set the map from atom name to serial
        let mName2Serial = {};

        let prevC = {};
        // let atom = {};
        prevC.id = "";

        let prevResi = "", currResi;
        let mResi2Atoms = {};

        let sChain = {};

        let tmpResi = 0;
        let prevResn = "";
        let atomSize = atom_site.rowCount;
        let serial = 1;

        let bFull = (atomSize * 10 > ic.maxatomcnt) ? false : true;

        let atom_hetatmArray, resnArray, elemArray, nameArray, chainArray, resiArray, resiOriArray, altArray, bArray, xArray, yArray, zArray, autochainArray, modelNumArray;

        if(!bNoCoord) {
            atom_hetatmArray = atom_site.getColumn("group_PDB");
            resnArray = atom_site.getColumn("label_comp_id");
            elemArray = atom_site.getColumn("type_symbol");
            nameArray = atom_site.getColumn("label_atom_id");

            chainArray = atom_site.getColumn("auth_asym_id");
            
            resiArray = atom_site.getColumn("label_seq_id");
            resiOriArray = atom_site.getColumn("auth_seq_id");
            altArray = atom_site.getColumn("label_alt_id");

            bArray = atom_site.getColumn("B_iso_or_equiv");

            xArray = atom_site.getColumn("Cartn_x");
            yArray = atom_site.getColumn("Cartn_y");
            zArray = atom_site.getColumn("Cartn_z");

            autochainArray = atom_site.getColumn("label_asym_id");
            modelNumArray = atom_site.getColumn("pdbx_PDB_model_num");

            // get the bond info
            let ligSeqHash = {}, prevAutochain = '';
            for (let i = 0; i < atomSize; ++i) {
                let atom_hetatm = atom_hetatmArray.getString(i);
                let resn = resnArray.getString(i);
                let elem = elemArray.getString(i);
                let name = nameArray.getString(i);
        // use the chain name from author, and use seq id from standardized seq id
                //let chain = atom_site.getColumn("label_asym_id").getString(i);
                let chain = chainArray.getString(i);
                let resi = resiArray.getString(i);
                let oriResi = resiOriArray.getString(i); 
                let alt = altArray.getString(i);

                let autochain = autochainArray.getString(i);

                resi = oriResi;

                let molecueType;
                if(atom_hetatm == "ATOM") {
                    if(resn.length == 3) {
                        molecueType = "protein"; //"p"; // protein
                    }
                    else {
                        molecueType = "nucleotide"; //"n"; // nucleotide
                    }
                }
                else {
                    if(resn == "WAT" || resn == "HOH") {
                        molecueType = "solvent"; //"s"; // solvent
                        chain = 'Misc';
                    }
                    else {
                        molecueType = "ligand"; //"l"; // ligands or ions
                        chain = resn;
                    }
                }

                // C-alpha only for large structure
                if(!bFull && ((molecueType == "protein" && !(elem == 'C' && name == 'CA')) 
                    || (molecueType == "nucleotide" && !(name == "P")) ) ) continue;
                // skip alternative atoms
                if(alt == "B") continue;

                sChain[chain] = 1;

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
    
                if(molecueType == 'solvent' || molecueType == "ligand") {
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

                let x = xArray.getFloat(i);
                let y = yArray.getFloat(i);
                let z = zArray.getFloat(i);

                let id = serial.toString();

                let atomname = chain + "_" + resi + "_" + name;

                mName2Serial[atomname] = id;

                let atom = {};

                atom.id = id;
                atom.elem = elem;
                atom.x = x;
                atom.y = y;
                atom.z = z;
                atom.alt = alt;

                currResi = chain + "_" + resi;

                let para = 1.3;
                // let para = (atom_hetatm == "HETATM") ? 1.3 : 1;

                if(currResi != prevResi || prevAutochain != autochain) {
                    mResi2Atoms = {};

                    mResi2Atoms[currResi] = {};
                    mResi2Atoms[currResi][atom.id] = atom;
                }
                else {
                    // bond between this atom and all other atom in the same residue
                    for(let j in mResi2Atoms[currResi]) { // j is atom.id
                        if(this.hasCovalentBond(atom, mResi2Atoms[currResi][j], para)) {
                            if(!mId2Set.hasOwnProperty(atom.id)) mId2Set[atom.id] = {};
                            if(!mId2Set.hasOwnProperty(mResi2Atoms[currResi][j].id)) mId2Set[mResi2Atoms[currResi][j].id] = {};
                            mId2Set[atom.id][mResi2Atoms[currResi][j].id] = 1;
                            mId2Set[mResi2Atoms[currResi][j].id][atom.id] = 1;
                        }
                    }

                    mResi2Atoms[currResi][atom.id] = atom;
                }

                // bond between N and previous C
                if(name == "N" && prevC.id != "") {
                    if(this.hasCovalentBond(atom, prevC, para)) {
                        if(!mId2Set.hasOwnProperty(atom.id)) mId2Set[atom.id] = {};
                        if(!mId2Set.hasOwnProperty(prevC.id)) mId2Set[prevC.id] = {};
                        mId2Set[atom.id][prevC.id] = 1;
                        mId2Set[prevC.id][atom.id] = 1;
                    }
                }

                if(name == "C") {
                    prevC = atom;
                }

                prevResi = currResi;
                prevResn = chain + "_" + resn;

                prevAutochain = autochain;

                ++serial;
            }

            /// add the defined bonds
            for(let i = 0; i < vBonds.length; i = i + 2) {
                let id1 = mName2Serial[vBonds[i]];
                let id2 = mName2Serial[vBonds[i+1]];

                if(!mId2Set.hasOwnProperty(id1)) mId2Set[id1] = {};
                if(!mId2Set.hasOwnProperty(id2)) mId2Set[id2] = {};
                mId2Set[id1][id2] = 1;
                mId2Set[id2][id1] = 1;
            }
        }

        let emdStr = (emd != "") ? "\"emd\":\"" + emd + "\"," : "";
        let organismStr = (organism != "") ? "\"organism\":\"" + organism + "\"," : "";

        text += "{\"bcif\":\"" + bcifid + "\", " + emdStr + organismStr + "\"pubmedid\":\"" + pmid + "\", \"descr\": {\"name\": \"" + title + "\", \"class\": \"" + keyword + "\"}";
        
        if(!bNoCoord) {
            text += ", \"atoms\":[\n";

            tmpResi = 0;
            prevResn = "";
            serial = 1;
            let structure = bcifid;

            for (let i = 0; i < atomSize; ++i) {
                let modelNum = modelNumArray.getString(i);
                if(modelNum != "1" && modelNum != "") {
                    structure = bcifid + modelNum;
                }

                let atom_hetatm = atom_hetatmArray.getString(i);
                let resn = resnArray.getString(i);
                let elem = elemArray.getString(i);
                let name = nameArray.getString(i);
        // use the chain name from author, and use seq id from standardized seq id
                //let chain = atom_site.getColumn("label_asym_id").getString(i);
                let chain = chainArray.getString(i);
                let resi = resiArray.getString(i);
                let oriResi = resiOriArray.getString(i); 
                let alt = altArray.getString(i);

                let autochain = autochainArray.getString(i);

                resi = oriResi;

                let molecueType;
                if(atom_hetatm == "ATOM") {
                    if(resn.length == 3) {
                        molecueType = "protein"; // protein
                    }
                    else {
                        molecueType = "nucleotide"; // nucleotide
                    }
                }
                else {
                    if(resn == "WAT" || resn == "HOH") {
                        molecueType = "solvent"; // solvent
                        chain = 'Misc';
                    }
                    else {
                        molecueType = "ligand"; // ligands or ions
                        chain = resn;
                    }
                }

                // C-alpha only for large structure
                if(!bFull && ((molecueType == "protein" && !(elem == 'C' && name == 'CA')) 
                    || (molecueType == "nucleotide" && !(name == "P")) ) ) continue;
                // skip alternative atoms
                if(alt == "B") continue;

                if(resi == "?" || resi == "." || resi == "0") {
                    resi = oriResi;

                    // if(resn.length != 3 || resn == "HOH" || resn == "WAT") {
                    //     if(resn.length != 3 || (elem = 'O' && (resn == "HOH" || resn == "WAT"))) {
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

                let b = bArray.getString(i);

                let x = xArray.getFloat(i);
                let y = yArray.getFloat(i);
                let z = zArray.getFloat(i);
                //int serial = parseInt(atom_site(i, "id"));

                //let id = chain + "_" + resi + "_" + name;
                let id = serial.toString();
                let resId = chain + "_" + resi;

                let het = (atom_hetatm == "HETATM") ? "1" : "0";

                text += "{";
                text += "\"het\":" + het + ", ";
                text += "\"serial\":" + serial + ", ";
                text += "\"name\":\"" + name + "\", ";
                text += "\"resn\":\"" + resn + "\", ";
                text += "\"structure\":\"" + structure + "\", ";
                text += "\"chain\":\"" + chain + "\", ";
                text += "\"resi\":" + resi + ", ";
                text += "\"coord\":{\"x\":" + x + ", \"y\":" + y + ", \"z\":" + z + "}, ";
                text += "\"b\":\"" + b + "\", ";
                text += "\"elem\":\"" + elem + "\", ";
                text += "\"bonds\":[";

                let sConnId = {};

                if(mId2Set.hasOwnProperty(id)) sConnId = mId2Set[id];

                let vConnId = Object.keys(sConnId);
                
                for(let j = 0, jl = vConnId.length; j < jl; ++j) {
                    if(vConnId[j] === 'undefined') continue;

                    text += vConnId[j];

                    // if(j < jl - 1 && vConnId[j]) text += ", ";
                    text += ", ";
                }
                if(vConnId.length > 0) text = text.substr(0, text.length - 2);

                text += "], ";

                if(mResId2SS.hasOwnProperty(resId)) {
                    let ss = mResId2SS[resId];
                    text += "\"ss\":\"" + ss + "\", ";
                }
                else {
                    text += "\"ss\":\"coil\", ";
                }

                if(sSSBegin.hasOwnProperty(resId)) {
                    text += "\"ssbegin\":1, ";
                }
                else {
                    text += "\"ssbegin\":0, ";
                }

                if(sSSEnd.hasOwnProperty(resId)) {
                    text += "\"ssend\":1, ";
                }
                else {
                    text += "\"ssend\":0, ";
                }

                //text += "\"color\":\"#FFF\", ";
                text += "\"mt\":\"" + molecueType + "\"";

                text += "}";

                // if(i < atomSize - 1) text += ",\n";
                text += ",\n";

                prevResn = chain + "_" + resn;
                prevAutochain = autochain

                ++serial;
            }
            // remove the last comma and new line
            if(serial > 1) text = text.substr(0, text.length - 2)

            text += "]";
        }

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
            let seq = "";
            for (let i = 0; i < seqSize; ++i) {
                let resi = resiArray.getString(i);
                let oriResi = oriResiArray.getString(i);
                let resn = resnArray.getString(i);
                let chain = chainArray.getString(i);

                if(chain != prevChain) {
                    if(i == 0) {
                        seq = "[";
                    }
                    else {
                        seq = seq.substr(0, seq.length - 2);

                        seq += "]";

                        mChainSeq[prevChain] = seq;

                        seq = "[";
                    }
                }

                // seq += "[" + resi + ", \"" + resn + "\"]";
                seq += "[" + oriResi + ", \"" + resn + "\"]";

                if(i < seqSize - 1) seq += ", ";

                prevChain = chain;
            }

            seq += "]";

            mChainSeq[prevChain] = seq;

            resiArray = oriResiArray = resnArray = chainArray = [];
        }

        // print sequences
        text += ", \"sequences\":{";
        let bData = false;
        // need to consider different models in NMR structures
        // But this function is only used for meta data, 
        for(let chain in sChain) {
            let seq;
            if(ligSeqHash.hasOwnProperty(chain)) {
                seq = "[" + ligSeqHash[chain] + "]";
            }
            else {
                seq = mChainSeq[chain];
            }

            // if(seq != "") {
            if(seq !== "" && seq !== undefined) {
                text += "\"" + chain + "\": " + seq + ", ";
                bData = true;
            }
        }

        if(bData) text = text.substr(0, text.length - 2);

        text += "}";

        if(block.getCategory("_pdbx_struct_oper_list")) {
            // Retrieve the table corresponding to the struct_oper_list category, which delineates assembly
            let struct_oper_list = block.getCategory("_pdbx_struct_oper_list");

            text += ", \"assembly\":[";

            let pmatrix = ", \"pmatrix\":";
            let bPmatrix = false;

            let assemblySize = struct_oper_list.rowCount;
            
            // could be one or more rows, struct_oper_list.getColumn("id").data is unavailable if one row
            for (let i = 0; i < assemblySize; ++i) {
                let struct_oper_id = struct_oper_list.getColumn("id").getString(i);
                if(struct_oper_id == "X0") continue;

                let m11 = struct_oper_list.getColumn("matrix[1][1]").getFloat(i);
                let m12 = struct_oper_list.getColumn("matrix[1][2]").getFloat(i);
                let m13 = struct_oper_list.getColumn("matrix[1][3]").getFloat(i);
                let m14 = struct_oper_list.getColumn("vector[1]").getFloat(i);
    
                let m21 = struct_oper_list.getColumn("matrix[2][1]").getFloat(i);
                let m22 = struct_oper_list.getColumn("matrix[2][2]").getFloat(i);
                let m23 = struct_oper_list.getColumn("matrix[2][3]").getFloat(i);
                let m24 = struct_oper_list.getColumn("vector[2]").getFloat(i);
    
                let m31 = struct_oper_list.getColumn("matrix[3][1]").getFloat(i);
                let m32 = struct_oper_list.getColumn("matrix[3][2]").getFloat(i);
                let m33 = struct_oper_list.getColumn("matrix[3][3]").getFloat(i);
                let m34 = struct_oper_list.getColumn("vector[3]").getFloat(i);

                let matrix = "[" + m11 + "," + m21 + "," + m31 + ", 0, "
                    + m12 + "," + m22 + "," + m32 + ", 0, "
                    + m13 + "," + m23 + "," + m33 + ", 0, "
                    + m14 + "," + m24 + "," + m34 + ", 1"
                    + "]";

                if(struct_oper_id == "P") {
                    pmatrix += matrix;
                    bPmatrix = true;
                }
                else {
                    text += matrix;

                    if(i < assemblySize - 1) text += ", ";
                }
            }

            text += "]";

            if(bPmatrix) text += pmatrix;
        }

        if(vDisulfides.length > 0) {
            text += ", \"disulfides\":[";

            for(let i = 0; i < vDisulfides.length; i += 2) {
                text += "[";
                text += "\"" + vDisulfides[i] + "\", \"" + vDisulfides[i+1] + "\"";
                text += "]";

                if(i < vDisulfides.length - 2) text += ", ";
            }

            text += "]";
        }

        text += "}";
        
        return text;
    }

    hasCovalentBond(atom1, atom2, para) { let ic = this.icn3d, me = ic.icn3dui;
        let r = this.mElem2Radius[atom1.elem] + this.mElem2Radius[atom2.elem];

        let dx = (atom1.x - atom2.x);
        let dy = (atom1.y - atom2.y);
        let dz = (atom1.z - atom2.z);

        let dist2 = dx * dx + dy * dy + dz * dz;

        return dist2 < para * r * r;
    }
}

export {BcifParser}
