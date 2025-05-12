/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ApplyDisplay {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Apply style and label options to a certain set of atoms.
    applyDisplayOptions(options, atoms, bHighlight) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        // get parameters from cookies
        if(!me.bNode && me.htmlCls.setHtmlCls.getCookie('lineRadius') != '') {
            let lineRadius = parseFloat(me.htmlCls.setHtmlCls.getCookie('lineRadius'));
            let coilWidth = parseFloat(me.htmlCls.setHtmlCls.getCookie('coilWidth'));
            let cylinderRadius = parseFloat(me.htmlCls.setHtmlCls.getCookie('cylinderRadius'));
            let clRad = me.htmlCls.setHtmlCls.getCookie('crosslinkRadius');
            let crosslinkRadius = (clRad && !isNaN(clRad)) ? parseFloat(clRad) : ic.crosslinkRadius;
            let traceRadius = parseFloat(me.htmlCls.setHtmlCls.getCookie('traceRadius'));
            let dotSphereScale = parseFloat(me.htmlCls.setHtmlCls.getCookie('dotSphereScale'));
            let ribbonthickness = parseFloat(me.htmlCls.setHtmlCls.getCookie('ribbonthickness'));
            let helixSheetWidth = parseFloat(me.htmlCls.setHtmlCls.getCookie('helixSheetWidth'));
            let nucleicAcidWidth = parseFloat(me.htmlCls.setHtmlCls.getCookie('nucleicAcidWidth'));

            if(!ic.bSetThicknessOnce && (ic.lineRadius != lineRadius || ic.coilWidth != coilWidth || ic.cylinderRadius != cylinderRadius || ic.crosslinkRadius != crosslinkRadius || ic.traceRadius != traceRadius || ic.dotSphereScale != dotSphereScale || ic.ribbonthickness != ribbonthickness || ic.helixSheetWidth != helixSheetWidth || ic.nucleicAcidWidth != nucleicAcidWidth) ) {
                ic.bSetThicknessOnce = true;

                me.htmlCls.clickMenuCls.setLogCmd('set thickness | linerad ' + lineRadius + ' | coilrad ' + coilWidth + ' | stickrad ' + cylinderRadius + ' | crosslinkrad ' + crosslinkRadius + ' | tracerad ' + traceRadius + ' | ribbonthick ' + ribbonthickness + ' | proteinwidth ' + helixSheetWidth + ' | nucleotidewidth ' + nucleicAcidWidth  + ' | ballscale ' + dotSphereScale, true);
            }

            ic.lineRadius = lineRadius;
            ic.coilWidth = coilWidth;
            ic.cylinderRadius = cylinderRadius;
            ic.crosslinkRadius = crosslinkRadius;
            ic.traceRadius = traceRadius;
            ic.dotSphereScale = dotSphereScale;
            ic.ribbonthickness = ribbonthickness;
            ic.helixSheetWidth = helixSheetWidth;
            ic.nucleicAcidWidth = nucleicAcidWidth;
        }

        let residueHash = {};
        let singletonResidueHash = {};
        let atomsObj = {};
        let residueid;

        if(bHighlight === 1 && Object.keys(atoms).length < Object.keys(ic.atoms).length) {
            atomsObj = me.hashUtilsCls.hash2Atoms(atoms, ic.atoms);

            residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atoms, ic.atoms);

            // find singleton residues
            for(let i in residueHash) {
                residueid = i;

                let last = i.lastIndexOf('_');
                let base = i.substr(0, last + 1);
                let lastResiStr = i.substr(last + 1);
                if(isNaN(lastResiStr)) continue;

                let lastResi = parseInt(lastResiStr);

                let prevResidueid = base + (lastResi - 1).toString();
                let nextResidueid = base + (lastResi + 1).toString();

                if(!residueHash.hasOwnProperty(prevResidueid) && !residueHash.hasOwnProperty(prevResidueid)) {
                    singletonResidueHash[i] = 1;
                }
            }

            // show the only atom in a transparent box
            if(Object.keys(atomsObj).length === 1 && Object.keys(ic.residues[residueid]).length > 1
                  && atomsObj[Object.keys(atomsObj)[0]].style !== 'sphere' && atomsObj[Object.keys(atomsObj)[0]].style !== 'dot') {
                if(ic.bCid === undefined || !ic.bCid) {
                    for(let i in atomsObj) {
                        let atom = atomsObj[i];
                        let scale = 1.0;
                        ic.boxCls.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                    }
                }
            }
            else {
                // if only one residue, add the next residue in order to show highlight
                for(let residueid in singletonResidueHash) {
                    // get calpha
                    let calpha = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                    let sideAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.selectionCls.getSideAtoms(ic.residues[residueid]));
                    let atom = calpha;

                    let prevResidueid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) - 1).toString();
                    let nextResidueid = atom.structure + '_' + atom.chain + '_' + (parseInt(atom.resi) + 1).toString();

                    //ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot

                    if(atom.style === 'cylinder and plate' && atom.ss === 'helix') { // no way to highlight part of cylinder
                        for(let i in ic.residues[residueid]) {
                            let atom = ic.atoms[i];
                            let scale = 1.0;
                            ic.boxCls.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                        }
                    }
                    else if( (atom.style === 'ribbon' && atom.ss === 'coil') || (atom.style === 'strand' && atom.ss === 'coil') || atom.style === 'o3 trace' || atom.style === 'schematic' || atom.style === 'c alpha trace' || atom.style === 'b factor tube' || (atom.style === 'cylinder and plate' && atom.ss !== 'helix') ) {
                        // do not add extra residue if the side chain is shown
                        if(sideAtom !== undefined && sideAtom.style2 !== undefined && sideAtom.style2 !== 'nothing') continue;

                        let bAddResidue = false;
                        // add the next residue with same style
                        if(!isNaN(atom.resi) && !bAddResidue && ic.residues.hasOwnProperty(nextResidueid)) {
                            let index2 = Object.keys(ic.residues[nextResidueid])[0];
                            let atom2 = me.hashUtilsCls.hash2Atoms(ic.residues[nextResidueid], ic.atoms)[index2];
                            if( (atom.style === atom2.style && !atom2.ssbegin) || atom2.ssbegin) {
                                let residueAtoms = ic.residues[nextResidueid];
                                atoms = me.hashUtilsCls.unionHash(atoms, residueAtoms);

                                bAddResidue = true;

                                // record the highlight style for the artificial residue
                                if(atom2.ssbegin) {
                                    for(let i in residueAtoms) {
                                        ic.atoms[i].notshow = true;
                                    }
                                }
                            }
                        }

                        // add the previous residue with same style
                        if(!isNaN(atom.resi) && !bAddResidue && ic.residues.hasOwnProperty(prevResidueid)) {
                            let index2 = Object.keys(ic.residues[prevResidueid])[0];
                            let atom2 = me.hashUtilsCls.hash2Atoms(ic.residues[prevResidueid], ic.atoms)[index2];
                            if(atom.style === atom2.style) {
                                atoms = me.hashUtilsCls.unionHash(atoms, ic.residues[prevResidueid]);

                                bAddResidue = true;
                            }
                        }
                    }
                    else if( (atom.style === 'ribbon' && atom.ss !== 'coil' && atom.ssend) || (atom.style === 'strand' && atom.ss !== 'coil' && atom.ssend)) {
                        // do not add extra residue if the side chain is shown
                        if(sideAtom !== undefined && sideAtom.style2 !== undefined && sideAtom.style2 !== 'nothing') continue;

                        let bAddResidue = false;
                        // add the next residue with same style
                        if(!isNaN(atom.resi) && !bAddResidue && ic.residues.hasOwnProperty(nextResidueid)) {
                            let index2 = Object.keys(ic.residues[nextResidueid])[0];
                            let atom2 = me.hashUtilsCls.hash2Atoms(ic.residues[nextResidueid], ic.atoms)[index2];
                            //if(atom.style === atom2.style && !atom2.ssbegin) {
                                atoms = me.hashUtilsCls.unionHash(atoms, ic.residues[nextResidueid]);

                                bAddResidue = true;
                            //}
                        }
                    }
                } // end for
            } // end else {

            atomsObj = {};
        } // end if(bHighlight === 1)

        if(ic.bInitial && ic.bMembrane === undefined) {
            if(me.htmlCls.setHtmlCls.getCookie('membrane') != '') {
                let bMembrane = parseInt(me.htmlCls.setHtmlCls.getCookie('membrane'));

                if(ic.bMembrane != bMembrane) {
                    me.htmlCls.clickMenuCls.setLogCmd('set membrane ' + bMembrane, true);
                }

                ic.bMembrane = (!isNaN(bMembrane)) ? parseInt(bMembrane) : 0;
            }

            // show membrane
            if(ic.bMembrane) {
                ic.selectionCls.toggleMembrane(true);
            }
            else {
                ic.selectionCls.toggleMembrane(false);
            }
        }

        ic.setStyleCls.setStyle2Atoms(atoms);

        //ic.bAllAtoms = false;
        //if(atoms && atoms !== undefined ) {
        //    ic.bAllAtoms = (Object.keys(atoms).length === Object.keys(ic.atoms).length);
        //}

        let chemicalSchematicRadius = ic.cylinderRadius * 0.5;

        // remove schematic labels
        //if(ic.labels !== undefined) ic.labels['schematic'] = undefined;
        if(ic.labels !== undefined) delete ic.labels['schematic'];

        let bOnlySideChains = false;
/*
        if(bHighlight) {
            //let residueHashCalpha = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(ic.hAtoms);

            let proteinAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.proteins);

            let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(proteinAtoms);
            let residueHashCalpha = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(proteinAtoms);

            if(Object.keys(residueHash).length > Object.keys(residueHashCalpha).length) { // some residues have only side chains
                bOnlySideChains = true;
            }
        }
*/
        for(let style in ic.style2atoms) {
          // 14 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
          let atomHash = ic.style2atoms[style];
          //var bPhosphorusOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(atomHash), "O3'", "O3*") || me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(atomHash), "P");
          //let bPhosphorusOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms));
          let nucleotidesAtoms = me.hashUtilsCls.intHash(atomHash, ic.nucleotides);
          let bPhosphorusOnly = me.utilsCls.isCalphaPhosOnly(me.hashUtilsCls.hash2Atoms(nucleotidesAtoms, ic.atoms));

          if(style === 'ribbon') {
          //if(style === 'ribbon' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
              ic.strandCls.createStrand(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), 2, undefined, true, undefined, undefined, false, ic.ribbonthickness, bHighlight);
          }
          else if(style === 'strand') {
          //else if(style === 'strand' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
              ic.strandCls.createStrand(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), null, null, null, null, null, false, undefined, bHighlight);
          }
          else if(style === 'cylinder and plate') {
          //else if(style === 'cylinder and plate' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
            ic.cylinderCls.createCylinderHelix(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.cylinderHelixRadius, bHighlight);
          }
          else if(style === 'nucleotide cartoon') {
            if(bPhosphorusOnly) {
                ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ["P"], ic.traceRadius, false, bHighlight);
            }
            else {
                ic.cartoonNuclCls.drawCartoonNucleicAcid(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), null, ic.ribbonthickness, bHighlight);

                if(bHighlight !== 2) ic.cartoonNuclCls.drawNucleicAcidStick(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), bHighlight);
            }
          }
          else if(style === 'o3 trace') {
            if(bPhosphorusOnly) {
                ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ["P"], ic.traceRadius, false, bHighlight);
            }
            else {
                ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ["O3'", "O3*"], ic.traceRadius, false, bHighlight);
            }
          }
          else if(style === 'schematic') {
            // either proteins, nucleotides, or chemicals
            let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(atomHash);

            //if(firstAtom.het) { // chemicals
            if(ic.chemicals.hasOwnProperty(firstAtom.serial)) { // chemicals
                ic.residueLabelsCls.addNonCarbonAtomLabels(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms));

                let bSchematic = true;
                ic.stickCls.createStickRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), chemicalSchematicRadius, chemicalSchematicRadius, undefined, bHighlight, bSchematic);
            }
            else { // nucleotides or proteins
                ic.residueLabelsCls.addResidueLabels(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), true);

                if(bPhosphorusOnly) {
                    ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ["P"], ic.traceRadius, false, bHighlight);
                }
                else {
                    ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ["O3'", "O3*"], ic.traceRadius, false, bHighlight);
                }
                ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ['CA'], ic.traceRadius, false, bHighlight);
            }
          }
          else if(style === 'c alpha trace') {
            ic.cylinderCls.createCylinderCurve(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ['CA'], ic.traceRadius, false, bHighlight);
          }
          else if(style === 'b factor tube') {
            ic.tubeCls.createTube(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), 'CA', null, bHighlight, false, true);
          }
          else if(style === 'custom tube') {
            ic.tubeCls.createTube(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), 'CA', null, bHighlight, true, true);
          }
          else if(style === 'lines' || style === 'lines2') {
            if(bHighlight === 1) {
                ic.stickCls.createStickRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.hlLineRadius, ic.hlLineRadius, undefined, bHighlight);
            }
            else {
                ic.lineCls.createLineRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), bHighlight);
            }

            ic.lineCls.createConnCalphSidechain(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), style);
          }
          else if(style === 'stick' || style === 'stick2') {
            ic.stickCls.createStickRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.cylinderRadius, ic.cylinderRadius, undefined, bHighlight, undefined);
            ic.lineCls.createConnCalphSidechain(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), style);
          }
          else if(style === 'backbone') {
            atomHash = this.selectMainChainSubset(atomHash);
            ic.stickCls.createStickRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.cylinderRadius, ic.cylinderRadius, undefined, bHighlight, undefined);
          }
          else if(style === 'ball and stick' || style === 'ball and stick2') {
            ic.stickCls.createStickRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.cylinderRadius, ic.cylinderRadius * 0.5, ic.dotSphereScale, bHighlight, undefined);
            ic.lineCls.createConnCalphSidechain(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), style);
          }
          else if(style === 'sphere' || style === 'sphere2') {
            ic.sphereCls.createSphereRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.sphereRadius, undefined, undefined, bHighlight);
          }
          else if(style === 'dot') {
            ic.sphereCls.createSphereRepresentation(me.hashUtilsCls.hash2Atoms(atomHash, ic.atoms), ic.sphereRadius, false, ic.dotSphereScale, bHighlight);
          }
        } // end for loop

        if(ic.cnt > ic.maxmaxatomcnt) { // release memory
            ic.init_base();
        }

        // hide the previous labels
        if(ic.labels !== undefined && Object.keys(ic.labels).length > 0) {
            ic.labelCls.hideLabels();

            // change label color
            for(let labeltype in ic.labels) {
                if(labeltype != 'schematic') this.changeLabelColor(ic.labels[labeltype]);
            }

            // labels
            ic.labelCls.createLabelRepresentation(ic.labels);
        }
    }

    changeLabelColor(labelArray) { let ic = this.icn3d, me = ic.icn3dui;
        if(labelArray) {
            for(let i = 0, il = labelArray.length; i < il; ++i) {
                let label = labelArray[i];
                if((ic.opts.background != 'black') && label.color == ic.colorBlackbkgd) {
                    label.color = ic.colorWhitebkgd;
                }
                else if((ic.opts.background == 'black') && label.color == ic.colorWhitebkgd) {
                    label.color = ic.colorBlackbkgd;
                }
            }
        }
    }

    selectMainChainSubset(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        let nuclMainArray = ["C1'", "C1*", "C2'", "C2*", "C3'", "C3*", "C4'", "C4*", "C5'", "C5*", "O3'", "O3*", "O4'", "O4*", "O5'", "O5*", "P", "OP1", "O1P", "OP2", "O2P"];

        let atomHash = {}
        for(let i in atoms) {
            if( (ic.proteins.hasOwnProperty(i) && (ic.atoms[i].name === "N" || ic.atoms[i].name === "C" || ic.atoms[i].name === "O"
              || (ic.atoms[i].name === "CA" && ic.atoms[i].elem === "C") ) )
              || (ic.nucleotides.hasOwnProperty(i) && nuclMainArray.indexOf(ic.atoms[i].name) !== -1) ) {
                atomHash[i] = 1;
            }
        }

        return atomHash;
    }
}

export {ApplyDisplay}
