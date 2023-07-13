/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class SaveFile {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Save the state file or the image file with "filename". "type" is either "text" for state file or "png" for image file.

    //Five types are used: command, png, html, text, and binary. The type "command" is used to save the statefile.
    //The type "png" is used to save the current canvas image. The type "html" is used to save html file with the
    //"data". This can be used to save any text. The type "text" is used to save an array of text, where "data" is
    //actually an array. The type "binary" is used to save an array of binary, where "data" is actually an array.
    saveFile(filename, type, text, bBlob) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //Save file
        let blob;

        if(type === 'command') {
            let dataStr =(ic.loadCmd) ? ic.loadCmd + '\n' : '';
            for(let i = 0, il = ic.commands.length; i < il; ++i) {
                let command = ic.commands[i].trim();
                if(i == il - 1) {
                   let command_tf = command.split('|||');

                   let transformation = {}
                   transformation.factor = ic._zoomFactor;
                   transformation.mouseChange = ic.mouseChange;
                   transformation.quaternion = ic.quaternion;

                   command = command_tf[0] + '|||' + ic.transformCls.getTransformationStr(transformation);
                }

                dataStr += command + '\n';
            }
            let data = decodeURIComponent(dataStr);

            blob = new Blob([data],{ type: "text;charset=utf-8;"});
        }
        else if(type === 'png') {
            //ic.scaleFactor = 1.0;
            let width = $("#" + ic.pre + "canvas").width();
            let height = $("#" + ic.pre + "canvas").height();
            ic.applyCenterCls.setWidthHeight(width, height);

            if(ic.bRender) ic.drawCls.render();

            let bAddURL = true;
            if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                bAddURL = false;
            }

            if(me.utilsCls.isIE()) {
                blob = ic.renderer.domElement.msToBlob();

                if(bAddURL) {
                    let reader = new FileReader();
                    reader.onload = function(e) {
                        let arrayBuffer = e.target.result; // or = reader.result;

                        let text = ic.shareLinkCls.getPngText();

                        blob = me.convertTypeCls.getBlobFromBufferAndText(arrayBuffer, text);

                        //if(window.navigator.msSaveBlob) navigator.msSaveBlob(blob, filename);
                        thisClass.saveBlob(blob, filename, bBlob, width, height);

                        return blob;
                    }

                    reader.readAsArrayBuffer(blob);
                }
                else {
                    //ic.createLinkForBlob(blob, filename);
                    thisClass.saveBlob(blob, filename, bBlob, width, height);

                    return blob;
                }
            }
            else {
                ic.renderer.domElement.toBlob(function(data) {
                    if(bAddURL) {
                        let reader = new FileReader();
                        reader.onload = function(e) {
                            let arrayBuffer = e.target.result; // or = reader.result;

                            let text = ic.shareLinkCls.getPngText();

                            blob = me.convertTypeCls.getBlobFromBufferAndText(arrayBuffer, text);

                            //ic.createLinkForBlob(blob, filename);
                            thisClass.saveBlob(blob, filename, bBlob, width, height);

                            return blob;
                        }

                        reader.readAsArrayBuffer(data);
                    }
                    else {
                        blob = data;

                        //ic.createLinkForBlob(blob, filename);
                        thisClass.saveBlob(blob, filename, bBlob, width, height);

                        return blob;
                    }
                });
            }

            // reset the image size
            ic.scaleFactor = 1.0;
            ic.applyCenterCls.setWidthHeight(width, height);

            if(ic.bRender) ic.drawCls.render();
        }
        else if(type === 'html') {
            let dataStr = text;
            let data = decodeURIComponent(dataStr);

            blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
        }
        else if(type === 'text') {
            //var dataStr = text;
            //var data = decodeURIComponent(dataStr);

            //blob = new Blob([data],{ type: "text;charset=utf-8;"});

            let data = text; // here text is an array of text

            blob = new Blob(data,{ type: "text;charset=utf-8;"});
        }
        else if(type === 'binary') {
            let data = text; // here text is an array of blobs

            //blob = new Blob([data],{ type: "application/octet-stream"});
            blob = new Blob(data,{ type: "application/octet-stream"});
        }

        if(type !== 'png') {
            //https://github.com/eligrey/FileSaver.js/
            saveAs(blob, filename);
        }

        return blob;
    }

    saveBlob(blob, filename, bBlob, width, height) { let ic = this.icn3d, me = ic.icn3dui;
        if(bBlob) {
            let urlCreator = window.URL || window.webkitURL;
            let imageUrl = urlCreator.createObjectURL(blob);

            let url = ic.shareLinkCls.shareLinkUrl();

            url = url.replace(/imageonly=1/g, '');

            let bTooLong =(url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
/*
            if(bTooLong || (ic.bInputfile && !ic.bInputUrlfile)) {
                // $("#" + ic.pre + "viewer").html("<img src='" + imageUrl + "'/>");
                $("#" + ic.pre + "mnlist").html("<img src='" + imageUrl + "'/>");
            }
            else {
                // $("#" + ic.pre + "viewer").html("<a href='" + url + "' target='_blank'><img src='" + imageUrl + "'/></a>");
                $("#" + ic.pre + "mnlist").html("<a href='" + url + "' target='_blank'><img src='" + imageUrl + "'/></a>");
            }
            
            // $("#" + ic.pre + "viewer").width(width);
            // $("#" + ic.pre + "viewer").height(height);
            $("#" + ic.pre + "mnlist").width(width);
            $("#" + ic.pre + "mnlist").height(height);

            $("#" + ic.pre + "cmdlog").hide();
            $("#" + ic.pre + "title").hide();

            //$("#" + ic.pre + "mnlist").hide();
            $("#" + ic.pre + "canvas").hide(); // "load mmdbid ..." may cause problems if canvas was removed
*/

            if(bTooLong || (ic.bInputfile && !ic.bInputUrlfile)) {
                $("#" + ic.pre + "viewer").html("<img src='" + imageUrl + "'/>");
            }
            else {
                $("#" + ic.pre + "viewer").html("<a href='" + url + "' target='_blank'><img src='" + imageUrl + "'/></a>");
            }

            $("#" + ic.pre + "viewer").width(width);
            $("#" + ic.pre + "viewer").height(height);

            $("#" + ic.pre + "cmdlog").hide();
            $("#" + ic.pre + "title").hide();
            $("#" + ic.pre + "mnlist").hide();

            if($("#" + ic.pre + "fullscreen").length > 0) $("#" + ic.pre + "fullscreen").hide();

            // clear memory
            ic = {};
            me = {};
        }
        else {
            saveAs(blob, filename);
        }
    }

    saveSvg(id, filename, bContactmap) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return '';
        
        let width = $("#" + id).width();
        let height = $("#" + id).height();

        if(bContactmap) height = width;

        let svgXml = this.getSvgXml(id, width, height, bContactmap);

        let blob = new Blob([svgXml], {type: "image/svg+xml"});
        saveAs(blob, filename);
    }

    getSvgXml(id, width, height, bContactmap) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return '';

        // font is not good
        let svg_data = document.getElementById(id).innerHTML; //put id of your svg element here

        let viewbox = (width && height) ? "<svg viewBox=\"0 0 " + width + " " + height + "\"" : "<svg";
        //let head = viewbox + " title=\"graph\" version=\"1.1\" xmlns:xl=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">";
        let head = viewbox + " title=\"graph\" xmlns:xl=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">";

        //if you have some additional styling like graph edges put them inside <style> tag
        let style = "<style>text {font-family: sans-serif; font-weight: bold; font-size: 18px;}</style>";

        let full_svg = head +  style + svg_data + "</svg>"

        return full_svg;
    }

    savePng(id, filename, bContactmap) { let ic = this.icn3d, me = ic.icn3dui;
        if(me.bNode) return '';

        let width = $("#" + id).width();
        let height = $("#" + id).height();

        if(bContactmap) height = width;

        // https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
        let svg = document.getElementById(id);
        let bbox = svg.getBBox();

        let copy = svg.cloneNode(true);
        ic.lineGraphCls.copyStylesInline(copy, svg);
        let canvas = document.createElement("CANVAS");
        canvas.width = width;
        canvas.height = height;

        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, bbox.width, bbox.height);

        let data = this.getSvgXml(id, width, height, bContactmap); //(new XMLSerializer()).serializeToString(copy); //ic.saveFileCls.getSvgXml();
        let DOMURL = window.URL || window.webkitURL || window;
        let svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});

        let img = new Image();
        img.src = DOMURL.createObjectURL(svgBlob);

        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            DOMURL.revokeObjectURL(this.src);

            if(me.utilsCls.isIE()) {
                let blob = canvas.msToBlob();

                if(blob) {
                    saveAs(blob, filename);

                    canvas.remove();
                }

                return;
            }
            else {
                canvas.toBlob(function(data) {
                    let blob = data;

                    if(blob) {
                        saveAs(blob, filename);

                        canvas.remove();
                    }

                    return;
                });
            }
        }
    }

    exportCustomAtoms(bDetails) {var ic = this.icn3d, me = ic.icn3dui;
       let html = "";
       let nameArray =(ic.defNames2Residues !== undefined) ? Object.keys(ic.defNames2Residues).sort() : [];
       for(let i = 0, il = nameArray.length; i < il; ++i) {
         let name = nameArray[i];
         let residueArray = ic.defNames2Residues[name];
         let description = ic.defNames2Descr[name];
         let command = ic.defNames2Command[name];
         command = command.replace(/,/g, ', ');

         html += this.exportResidues(name, residueArray, bDetails);
       } // outer for
       nameArray =(ic.defNames2Atoms !== undefined) ? Object.keys(ic.defNames2Atoms).sort() : [];
       for(let i = 0, il = nameArray.length; i < il; ++i) {
         let name = nameArray[i];
         let atomArray = ic.defNames2Atoms[name];
         let description = ic.defNames2Descr[name];
         let command = ic.defNames2Command[name];
         command = command.replace(/,/g, ', ');
         let residueArray = ic.resid2specCls.atoms2residues(atomArray);

         html += this.exportResidues(name, residueArray, bDetails);
       } // outer for
       return html;
    }

    exportResidues(name, residueArray, bDetails) {var ic = this.icn3d, me = ic.icn3dui;
         let html = '';

         if(residueArray.length > 0) {
             if(bDetails) {
                 let chainidHash = {};
                 for(let i = 0, il = residueArray.length; i < il; ++i) {
                     let resid = residueArray[i];
                     let atom = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                     let chainid = atom.structure + '_' + atom.chain;
                     let resnAbbr = me.utilsCls.residueName2Abbr(atom.resn);
                     let resName = resnAbbr + atom.resi;

                     if(!chainidHash.hasOwnProperty(chainid)) {
                         chainidHash[chainid] = [];
                     }

                     chainidHash[chainid].push(resName);
                 }

                 html += name + ":\n";
                 for(let chainid in chainidHash) {
                     let resStr = (chainidHash[chainid].length == 1) ? "residue" : "residues";
                     html += chainid + " (" + chainidHash[chainid].length + " " + resStr + "): ";
                     html += chainidHash[chainid].join(", ");
                     html += "\n";
                 }
                 html += "\n";
             }
             else {
                 html += name + "\tselect ";
                 html += ic.resid2specCls.residueids2spec(residueArray);
                 html += "\n";
             }
         }

         return html;
    }

    printPrevSecondary(bHelix, bSheet, prevRealSsObj, ssCnt) { let ic = this.icn3d, me = ic.icn3dui;
        let ssText = '';

        // print prev
        if(prevRealSsObj) {
            if(bHelix) {
                let helixType = 1;
                ssText += prevRealSsObj.resn.padStart(5, ' ') + prevRealSsObj.chain.replace(/_/gi, '').substr(0, 2).padStart(2, ' ')
                    + prevRealSsObj.resi.toString().padStart(5, ' ') + '  ' + helixType + ssCnt.toString().padStart(36, ' ') + '\n';
            }
            else if(bSheet) {
                let sense = 0;
                ssText += prevRealSsObj.resn.padStart(5, ' ') + prevRealSsObj.chain.replace(/_/gi, '').substr(0, 2).padStart(2, ' ')
                    + prevRealSsObj.resi.toString().padStart(4, ' ') + '  ' + sense + '\n';
            }
        }

        return ssText;
    }

    //getAtomPDB: function(atomHash, bPqr, bPdb, bNoChem) { let ic = this.icn3d, me = ic.icn3dui;
    getAtomPDB(atomHash, bPqr, bNoChem, bNoHeader, chainResi2pdb, pdbid) { let ic = this.icn3d, me = ic.icn3dui;
        let pdbStr = '';

        // get all phosphate groups in lipids
        let phosPHash = {}, phosOHash = {}
        for(let i in ic.chemicals) {
            let atom = ic.atoms[i];
            if(atom.elem == 'P') {
                phosPHash[i] = 1;

                for(let j = 0, jl = atom.bonds.length; j < jl; ++j) {
                    let serial = atom.bonds[j];
                    if(serial && ic.atoms[serial].elem == 'O') { // could be null
                        phosOHash[serial] = 1;
                    }
                }
            }
        }
    /*
    HELIX    1  NT MET A    3  ALA A   12  1                                  10
            let startChain =(line.substr(19, 1) == ' ') ? 'A' : line.substr(19, 1);
            let startResi = parseInt(line.substr(21, 4));
            let endResi = parseInt(line.substr(33, 4));
    SHEET    1  B1 2 GLY A  35  THR A  39  0
            let startChain =(line.substr(21, 1) == ' ') ? 'A' : line.substr(21, 1);
            let startResi = parseInt(line.substr(22, 4));
            let endResi = parseInt(line.substr(33, 4));
    */

        let calphaHash = me.hashUtilsCls.intHash(atomHash, ic.calphas);
        let helixStr = 'HELIX', sheetStr = 'SHEET';
        let bHelixBegin = false, bHelixEnd = true;
        let bSheetBegin = false, bSheetEnd = true;

        let stru2header = {};
        for(let stru in ic.structures) {
            stru2header[stru] = '';
        }

//        if(!bNoSs) {
            let prevResi, stru, chainid;
            let ssArray = [];
            for(let i in calphaHash) {
                let atom = ic.atoms[i];
                stru = atom.structure;
                chainid = atom.structure + '_' + atom.chain;

                let ssObj = {};
                ssObj.chain = atom.chain;
                ssObj.resn = atom.resn;
                ssObj.resi = atom.resi;

                if(parseInt(atom.resi) > parseInt(prevResi) + 1) {
                    ssObj.ss = ' ';
                    ssArray.push(ssObj);
                }

                if(atom.ss == 'helix') {
                    ssObj.ss = 'H';
                    ssArray.push(ssObj);
                }
                else if(atom.ss == 'sheet') {
                    ssObj.ss = 'S';
                    ssArray.push(ssObj);
                }

                if(atom.ssend) {
                    let ssObj2 = me.hashUtilsCls.cloneHash(ssObj);
                    ssObj2.ss = ' ';
                    ssArray.push(ssObj2);
                }

                prevResi = atom.resi;
            }

            let prevSs, prevRealSsObj, ssCnt = 0, bHelix = false, bSheet = false;
            for(let i = 0, il = ssArray.length; i < il; ++i) {
                let ssObj = ssArray[i];

                if(ssObj.ss != prevSs) {
                    // print prev
                    stru2header[stru] += this.printPrevSecondary(bHelix, bSheet, prevRealSsObj, ssCnt);

                    // print current
                    ssCnt = 0;
                    bHelix = false;
                    bSheet = false;
                    prevRealSsObj = undefined;

                    if(ssObj.ss != ' ') {
                        if(ssObj.ss == 'H') {
                            bHelix = true;
                            prevRealSsObj = ssObj;
                            stru2header[stru] += helixStr.padEnd(15, ' ') + ssObj.resn.padStart(3, ' ') + ssObj.chain.replace(/_/gi, '').substr(0, 2).padStart(2, ' ')
                                + ssObj.resi.toString().padStart(5, ' ');
                        }
                        else if(ssObj.ss == 'S') {
                            bSheet = true;
                            prevRealSsObj = ssObj;
                            stru2header[stru] += sheetStr.padEnd(17, ' ') + ssObj.resn.padStart(3, ' ') + ssObj.chain.replace(/_/gi, '').substr(0, 2).padStart(2, ' ')
                                + ssObj.resi.toString().padStart(4, ' ');
                        }
                    }
                }

                if(ssObj.ss != ' ') {
                    ++ssCnt;
                    prevRealSsObj = ssObj;
                }

                prevSs = ssObj.ss;
            }

            // print prev
            stru2header[stru] += this.printPrevSecondary(bHelix, bSheet, prevRealSsObj, ssCnt);

            // add a new line in case the structure is a subset
            stru2header[stru] += '\n';
//        }

        // export assembly symmetry matrix "BIOMT"
        if(ic.biomtMatrices) {
            let stru = Object.keys(ic.structures)[0];
            for(let m = 0, ml = ic.biomtMatrices.length; m < ml; ++m) {
                let mNum = m + 1;
                for(let n = 0; n < 3; ++n) {
                    let nNum = n + 1;
                    stru2header[stru] += "REMARK 350   BIOMT" + nNum.toString() + "  " + mNum.toString().padStart(2, ' ')
                        + " " + ic.biomtMatrices[m].elements[n + 0].toString().padStart(9, ' ')
                        + " " + ic.biomtMatrices[m].elements[n + 4].toString().padStart(9, ' ')
                        + " " + ic.biomtMatrices[m].elements[n + 8].toString().padStart(9, ' ')
                        + " " + ic.biomtMatrices[m].elements[n + 12].toString().padStart(14, ' ') + "\n";
                }
            }
        }

        // add missing residues "REMARK 465..."
        for(let chainid in ic.chainMissingResidueArray) {
            let pos = chainid.indexOf('_');
            let chain = chainid.substr(pos + 1, 2);
            let stru = chainid.substr(0, pos);

            for(let i = 0, il = ic.chainMissingResidueArray[chainid].length; i < il; ++i) {
                let resi = ic.chainMissingResidueArray[chainid][i].resi;
                let resn = me.utilsCls.residueAbbr2Name(ic.chainMissingResidueArray[chainid][i].name);

                stru2header[stru] += "REMARK 465     " + resn.padStart(3, " ") + chain.padStart(2, " ") + " " + resi.toString().padStart(5, " ") + "\n";
            }
        }

        let connStr = '';
        let struArray = Object.keys(ic.structures);
        let bMulStruc =(struArray.length > 1) ? true : false;

        let molNum = 1, prevStru = '', prevChain = '';

        let addedChainResiHash = {};
        for(let i in atomHash) {
            let atom = ic.atoms[i];

            // remove chemicals
            if(bNoChem && atom.het) continue;

            //if(bMulStruc && atom.structure != prevStru) {
            if(atom.structure != prevStru) {
                pdbStr += connStr;
                connStr = '';

                if(molNum > 1)  pdbStr += '\nENDMDL\n';

                if(bMulStruc) pdbStr += 'MODEL        ' + molNum + '\n';

                // add header            
                let mutantInfo = (chainResi2pdb) ? "Mutated chain_residue " + Object.keys(chainResi2pdb) + '; ' : '';
                if(!bNoHeader) {
                    //pdbStr += this.getPDBHeader(molNum - 1, stru2header, mutantInfo, pdbid);

                    // make sur ethe PDB ID is correct
                    pdbStr += this.getPDBHeader(molNum - 1, stru2header, mutantInfo, atom.structure);

                    //pdbStr += '\n'; // separate from incomplete secondary structures 
                }

                //prevStru = atom.structure;
                ++molNum;
            }
            //else {
                //if(atom.chain != prevChain) {
                if(atom.chain != prevChain && atom.structure == prevStru) {
                    // add a line "TER" to work with scap/profix to add missing atoms
                    if(prevChain) {
                        pdbStr += 'TER\n';
                    }
                    //prevChain = atom.chain;
                }
            //}

            let chainResi = atom.chain + '_' + atom.resi;
            if(chainResi2pdb && chainResi2pdb.hasOwnProperty(chainResi)) {    
                if(!addedChainResiHash.hasOwnProperty(chainResi)) {
                    pdbStr += chainResi2pdb[chainResi];
                    addedChainResiHash[chainResi] = 1;
                }
                continue;
            }

            let line = '';
    /*
    1 - 6 Record name "ATOM "
    7 - 11 Integer serial Atom serial number.
    13 - 16 Atom name Atom name.
    17 Character altLoc Alternate location indicator.
    18 - 20 Residue name resName Residue name.
    22 Character chainID Chain identifier.
    23 - 26 Integer resSeq Residue sequence number.
    27 AChar iCode Code for insertion of residues.
    31 - 38 Real(8.3) x Orthogonal coordinates for X in
    Angstroms.
    39 - 46 Real(8.3) y Orthogonal coordinates for Y in
    Angstroms.
    47 - 54 Real(8.3) z Orthogonal coordinates for Z in
    Angstroms.
    55 - 60 Real(6.2) occupancy Occupancy.
    61 - 66 Real(6.2) tempFactor Temperature factor.
    73 - 76 LString(4) segID Segment identifier, left-justified.
    77 - 78 LString(2) element Element symbol, right-justified.
    79 - 80 LString(2) charge Charge on the atom.
    */
            line +=(atom.het) ? 'HETATM' : 'ATOM  ';
            line += i.toString().padStart(5, ' ');
            line += ' ';

            let atomName = atom.name.trim();
            if(!isNaN(atomName.substr(0, 1)) ) atomName = atomName.substr(1) + atomName.substr(0, 1);

            if(atomName.length == 4) {
                line += atomName;
            }
            else {
                line += ' ';
                atomName = atomName.replace(/\*/g, "'");
                if(atomName == 'O1P') atomName = 'OP1';
                else if(atomName == 'O2P') atomName = 'OP2';
                else if(atomName == 'C5M') atomName = 'C7 ';
                line += atomName.padEnd(3, ' ');
            }

            line += ' ';
            let resn = atom.resn;
    /*
            // add "D" in front of nucleotide residue names
            if(resn == 'A') resn = 'DA';
            else if(resn == 'T') resn = 'DT';
            else if(resn == 'C') resn = 'DC';
            else if(resn == 'G') resn = 'DG';
            else if(resn == 'U') resn = 'DU';
    */

            line +=(resn.length <= 3) ? resn.padStart(3, ' ') : resn.substr(0, 3);
            //line += ' ';
            //line +=(atom.chain.length <= 1) ? atom.chain.padStart(1, ' ') : atom.chain.substr(0, 1);
            if(atom.chain.length >= 2) {
                let chainTmp = atom.chain.replace(/_/gi, '').substr(0, 2);
                line += chainTmp;
            }
            else if(atom.chain.length == 1) {
                line += ' ' + atom.chain.substr(0, 1);
            }
            else if(atom.chain.length == 0) {
                line += ' A';
            }

            let resi = atom.resi;
            if(!isNaN(resi) && atom.chain.length > 3 && !isNaN(atom.chain.substr(3)) ) { // such as: chain = NAG2, resi=1 => chain = NAG, resi=2
                resi = resi - 1 + parseInt(atom.chain.substr(3));
            }
            let resiInt = parseInt(resi);
            line +=(resiInt.toString().length <= 4) ? resiInt.toString().padStart(4, ' ') : resiInt.toString().substr(0, 4);
            //line += ' '.padStart(4, ' ');
            // insert
            let lastChar = atom.resi.toString().substr(atom.resi.toString().length - 1, 1);
            if(isNaN(lastChar)) {
                line += lastChar;
            }
            else {
                line += ' ';
            }
            line += ' '.padStart(3, ' ');

            line += atom.coord.x.toFixed(3).toString().padStart(8, ' ');
            line += atom.coord.y.toFixed(3).toString().padStart(8, ' ');
            line += atom.coord.z.toFixed(3).toString().padStart(8, ' ');

            //if((bPqr && atom.het) ||(phosPHash.hasOwnProperty(i) && !bPdb) ||(phosOHash.hasOwnProperty(i) && !bPdb) ) {
            //if((bPqr && atom.het) ||(phosPHash.hasOwnProperty(i)) ||(phosOHash.hasOwnProperty(i)) ) {
            if(bPqr && atom.het) {
                let size = 1.5, charge = 0;

    /*
                // use antechamber atom size
                if(atom.elem == 'C') size = 1.7; //1.9080;
                else if(atom.elem == 'N') size = 1.55; //1.8240;
                else if(atom.elem == 'O') size = 1.52; //1.6612;
                else if(atom.elem == 'H') size = 1.2; //1.2500;
                else if(atom.elem == 'S') size = 1.8; //2.0000;
                else if(atom.elem == 'P') size = 1.8; //2.1000;
                else if(me.parasCls.vdwRadii.hasOwnProperty(atom.elem)) {
                    size = me.parasCls.vdwRadii[atom.elem];
                }
    */

                // use amber atom size
                if(atom.elem == 'C') size = 1.9080;
                else if(atom.elem == 'N') size = 1.8240;
                else if(atom.elem == 'O') size = 1.6612;
                else if(atom.elem == 'H') size = 1.2500;
                else if(atom.elem == 'S') size = 2.0000;
                else if(atom.elem == 'P') size = 2.1000;
                else if(me.parasCls.vdwRadii.hasOwnProperty(atom.elem)) {
                    size = me.parasCls.vdwRadii[atom.elem];
                }

                if(me.cfg.cid !== undefined && atom.crg !== undefined) {
                    charge = atom.crg;
                }
                else if(phosPHash.hasOwnProperty(i)) {
                    charge = 1.3800; // P in phosphate
                }
                else if(phosOHash.hasOwnProperty(i)) {
                    charge = -0.5950; // O in phosphate
                }
                else if(me.parasCls.ionCharges.hasOwnProperty(atom.elem)) {
                    charge = me.parasCls.ionCharges[atom.elem];
                }

                line += charge.toFixed(4).toString().padStart(8, ' ');
                line += size.toFixed(4).toString().padStart(7, ' ');
            }
            else {
                line += "1.00".padStart(6, ' ');
                line +=(atom.b) ? parseFloat(atom.b).toFixed(2).toString().padStart(6, ' ') : ' '.padStart(6, ' ');
                line += ' '.padStart(10, ' ');
                line += atom.elem.padStart(2, ' ');
                line += ' '.padStart(2, ' ');
            }

            // connection info
            if(atom.het && atom.bonds.length > 0) {
                connStr += 'CONECT' + i.toString().padStart(5, ' ');
                let bondHash = {}
                for(let j = 0, jl = atom.bonds.length; j < jl; ++j) {
                    if(atom.bonds[j] && !bondHash.hasOwnProperty(atom.bonds[j])) { // could be null
                        connStr += atom.bonds[j].toString().padStart(5, ' ');
                        bondHash[atom.bonds[j]] = 1;
                    }
                }
                connStr += '\n';
            }

            pdbStr += line + '\n';

            prevStru = atom.structure;
            prevChain = atom.chain;
        }

        pdbStr += connStr;
        
        if(bMulStruc) pdbStr += '\nENDMDL\n';

        return pdbStr;
    }

    getSecondary(atomHash) { let ic = this.icn3d, me = ic.icn3dui;
        let json = '{"data": [\n';

        let prevChainid = '', prevResi = '';
        let data = {};
        for(let i in atomHash) {
            let atom = ic.atoms[i];

            let chainid = atom.structure + '_' + atom.chain;
            let resi = atom.resi;
            let resn = me.utilsCls.residueName2Abbr(atom.resn);
            let ss = this.secondary2Abbr(atom.ss);

            if(chainid != prevChainid) {
                data[chainid] = {"resi": [], "resn": [], "secondary": []};
            }

            if(chainid != prevChainid || resi != prevResi) {
                data[chainid]["resi"].push(resi);
                data[chainid]["resn"].push(resn);
                data[chainid]["secondary"].push(ss);
            }

            prevChainid = chainid;
            prevResi = resi;
        }

        let chainidArray = Object.keys(data);
        let cnt = chainidArray.length;
        for(let i = 0; i < cnt; ++i) {
            let chainid = chainidArray[i];
            json += '{"chain": "' + chainid + '",\n';

            json += '"resi": "' + data[chainid]["resi"].join(',') + '",\n';
            json += '"resn": "' + data[chainid]["resn"].join('') + '",\n';
            json += '"secondary": "' + data[chainid]["secondary"].join('') + '"';

            if(i < cnt - 1) {
                json += '},\n';
            }
            else {
                json += '}\n';
            }
        }

        json += ']}\n';

        return json;
    }

    secondary2Abbr(ss) { let ic = this.icn3d, me = ic.icn3dui;
        if(ss == 'helix') {
            return 'H';
        }
        else if(ss == 'sheet') {
            return 'E';
        }
        else {
            return 'c';
        }
    }

    getSelectedResiduePDB() { let ic = this.icn3d, me = ic.icn3dui;
       let pdbStr = '';
///       pdbStr += this.getPDBHeader();

       let atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
       pdbStr += this.getAtomPDB(atoms);

       return pdbStr;
    }
    getPDBHeader(struNum, stru2header, mutantInfo, pdbid) { let ic = this.icn3d, me = ic.icn3dui;
       if(struNum === undefined) struNum = 0;

       let pdbStr = '';
       let stru = (pdbid) ? pdbid : Object.keys(ic.structures)[struNum];
       let id = (mutantInfo) ? stru + '2' : stru;
       pdbStr += 'HEADER    PDB From iCn3D'.padEnd(62, ' ') + id + '\n';

       if(struNum == 0) {
           let title =(ic.molTitle.length > 50) ? ic.molTitle.substr(0,47) + '...' : ic.molTitle;
           // remove quotes
           if(title.indexOf('"') != -1) title = '';
           if(mutantInfo) {
               title = mutantInfo + title;
           }
           pdbStr += 'TITLE     ' + title + '\n';
       }

       if(stru2header && stru2header[stru]) {
           pdbStr += stru2header[stru];
       }

       return pdbStr;
    }

    //Show the title and PDB ID of the PDB structure at the beginning of the viewer.
    showTitle() {var ic = this.icn3d, me = ic.icn3dui;
        // if(ic.molTitle !== undefined && ic.molTitle !== '') {
            let title = (ic.molTitle) ? ic.molTitle : '';

            let titlelinkColor =(ic.opts['background'] == 'black') ?  me.htmlCls.GREYD : 'black';

            if(ic.inputid === undefined) {
                if(title.length > 40) title = title.substr(0, 40) + "...";

                $("#" + ic.pre + "title").html(title);
            }
            else if(me.cfg.cid !== undefined) {
                let url = this.getLinkToStructureSummary();

                $("#" + ic.pre + "title").html("PubChem CID <a id='" + ic.pre + "titlelink' href='" + url + "' style='color:" + titlelinkColor + "' target='_blank'>" + ic.inputid.toUpperCase() + "</a>: " + title);
            }
            else if(me.cfg.align !== undefined) {
                title = 'VAST+ alignment of ' + Object.keys(ic.structures);

                $("#" + ic.pre + "title").html(title);
            }
            else if(me.cfg.chainalign !== undefined) {
                let chainidArray = me.cfg.chainalign.split(',');
                title = 'Dynamic Structure Alignment of Chains: ' + chainidArray;

                $("#" + ic.pre + "title").html(title);
            }
            else { //if(me.cfg.mmdbafid !== undefined) {
                //let structureArray = Object.keys(ic.structures); //me.cfg.mmdbafid.split(',');
                let structureArray = Object.keys(me.utilsCls.getStructures(ic.dAtoms));

                if(structureArray.length > 1) {
                    title = 'Multiple structures: ';
                    for(let i = 0, il = structureArray.length; i < il; ++i) {
                        let url = (isNaN(structureArray[i]) && structureArray[i].length > 5) ? 'https://alphafold.ebi.ac.uk/entry/' + structureArray[i] : 'https://www.ncbi.nlm.nih.gov/structure/?term=' + structureArray[i];
                        title += '<a href="' + url + '" style="color:' + titlelinkColor + '" target="_blank">' + structureArray[i] + '</a>';
                        if(i < il - 1) title += ', ';
                    }
                    $("#" + ic.pre + "title").html(title);
                }
                else if(structureArray.length == 1) {
                    //let url = this.getLinkToStructureSummary();
                    let url = (isNaN(structureArray[0]) && structureArray[0].length > 5) ? 'https://alphafold.ebi.ac.uk/entry/' + structureArray[0] : 'https://www.ncbi.nlm.nih.gov/structure/?term=' + structureArray[0];

                    this.setStructureTitle(url, title, titlelinkColor)
                }
            }
            // else {
            //     let url = this.getLinkToStructureSummary();
            //     this.setStructureTitle(url, title, titlelinkColor);
            // }
        // }
        // else {
        //     $("#" + ic.pre + "title").html("");
        // }
    }

    setStructureTitle(url, title, titlelinkColor) {var ic = this.icn3d, me = ic.icn3dui;
        if(title.length > 40) title = title.substr(0, 40) + "...";

        let inputid = ic.inputid;

        let text, idName;
        if(inputid.indexOf('http') != -1) {
            idName = "Data from";
            url = inputid;
            text = inputid;
        }
        else {
            let idHash = me.utilsCls.getHlStructures();

            let bPdb = false, bAlphaFold = false;
            for(let structureid in idHash) {
                if(structureid.length > 5) {
                    bAlphaFold = true;
                }
                else {
                    bPdb = true;
                }
            }

            let structureidArray = Object.keys(idHash);
            inputid = structureidArray.join(',');

            text = (me.cfg.refseqid || me.cfg.protein) ? ic.inputid : inputid.toUpperCase();

            //idName = (isNaN(inputid) && inputid.length > 5) ? "AlphaFold ID" : "PDB ID";
            if(bPdb && bAlphaFold) {
                idName = "AlphaFold/PDB ID";
            }
            else if(bPdb) {
                idName = "PDB ID";
            }
            else if(bAlphaFold) {
                idName = "AlphaFold ID";
            }

            if(structureidArray.length > 1) {
                idName += 's';
            }
            
            if(ic.molTitleHash) {
                title = '';
                for(let i = 0, il = structureidArray.length; i < il; ++i) {
                    title += ic.molTitleHash[structureidArray[i]];
                    if(i < il - 1) title += '; ';
                }
            }
        }

        if(me.cfg.refseqid) {
            idName = 'NCBI Protein Acc.';
        }
        else if(me.cfg.protein) {
            idName = 'Protein/Gene Name';
        }

        if(!inputid || inputid.substr(0, 4) == ic.defaultPdbId) {
            $("#" + ic.pre + "title").html(title);
        }
        else if(me.cfg.blast_rep_id) {
            let query_id = (me.cfg.oriQuery_id) ? me.cfg.oriQuery_id : me.cfg.query_id;
            let blast_rep_id = (me.cfg.oriBlast_rep_id) ? me.cfg.oriBlast_rep_id : me.cfg.blast_rep_id
            if(query_id.length > 20) query_id = query_id.substr(0, 17) + '...';
            
            text = 'Query: ' + query_id + '; target: ' + blast_rep_id;
            $("#" + ic.pre + "title").html(text + ", " + title);
        }
        else {
            $("#" + ic.pre + "title").html(idName + " <a id='" + ic.pre + "titlelink' href='" + url + "' style='color:" + titlelinkColor + "' target='_blank'>" + text + "</a>: " + title);
        }
    }

    getLinkToStructureSummary(bLog) {var ic = this.icn3d, me = ic.icn3dui;
       let url = "https://www.ncbi.nlm.nih.gov/structure/?term=";

       if(me.cfg.cid !== undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=";
       }
       else if(me.cfg.refseqid !== undefined) {
        url = "https://www.ncbi.nlm.nih.gov/protein/";
       }
       else if(me.cfg.afid !== undefined) {
           url = "https://alphafold.ebi.ac.uk/search/text/";
       }
       else {
           //if(ic.inputid.indexOf(",") !== -1) {
           if(Object.keys(ic.structures).length > 1) {
               url = "https://www.ncbi.nlm.nih.gov/structure/?term=";
           }
           else {
               //url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=";
               url = me.htmlCls.baseUrl + "pdb/";
           }
       }

       if(ic.inputid === undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=" + ic.molTitle;
       }
       else {
           let idArray = ic.inputid.split('_');

           if(idArray.length === 1) {
               url += ic.inputid;
               if(bLog) me.htmlCls.clickMenuCls.setLogCmd("link to " + ic.inputid + ": " + url, false);
           }
           else if(idArray.length === 2) {
                if(me.cfg.afid) {
                    url += idArray[0] + " " + idArray[1];
                }
                else {
                    url += idArray[0] + " OR " + idArray[1];
                }

                if(bLog) me.htmlCls.clickMenuCls.setLogCmd("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
           }
       }

       return url;
    }

    setEntrezLinks(db) {var ic = this.icn3d, me = ic.icn3dui;
      let structArray = Object.keys(ic.structures);
      let url;
      if(structArray.length === 1) {
          url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0];
          me.htmlCls.clickMenuCls.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + ": " + url, false);
          let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
          window.open(url, urlTarget);
      }
      else if(structArray.length === 2) {
          url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0] + " OR " + structArray[1];
          me.htmlCls.clickMenuCls.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + " OR " + structArray[1] + ": " + url, false);
          let urlTarget = (ic.structures && Object.keys(ic.structures).length > 0) ? '_blank' : '_self';
          window.open(url, urlTarget);
      }
    }
}

export {SaveFile}
