/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applyDisplayOptions = function (options, atoms, bHighlight) { var me = this, ic = me.icn3d; "use strict";  // atoms: hash of key -> 1
    if(options === undefined) options = this.opts;

    var residueHash = {};
    var singletonResidueHash = {};
    var atomsObj = {};
    var residueid;

    if(bHighlight === 1 && Object.keys(atoms).length < Object.keys(this.atoms).length) {
        atomsObj = this.hash2Atoms(atoms);

        residueHash = me.getResiduesFromAtoms(atoms);

        // find singleton residues
        for(var i in residueHash) {
            residueid = i;

            var last = i.lastIndexOf('_');
            var base = i.substr(0, last + 1);
            var lastResi = parseInt(i.substr(last + 1));

            var prevResidueid = base + (lastResi - 1).toString();
            var nextResidueid = base + (lastResi + 1).toString();

            if(!residueHash.hasOwnProperty(prevResidueid) && !residueHash.hasOwnProperty(prevResidueid)) {
                singletonResidueHash[i] = 1;
            }
        }

        // show the only atom in a transparent box
        if(Object.keys(atomsObj).length === 1 && Object.keys(this.residues[residueid]).length > 1
              && atomsObj[Object.keys(atomsObj)[0]].style !== 'sphere' && atomsObj[Object.keys(atomsObj)[0]].style !== 'dot') {
            if(this.bCid === undefined || !this.bCid) {
                for(var i in atomsObj) {
                    var atom = atomsObj[i];
                    var scale = 1.0;
                    this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                }
            }
        }
        else {
            // if only one residue, add the next residue in order to show highlight
            for(var residueid in singletonResidueHash) {
                // get calpha
                var calpha = this.getFirstCalphaAtomObj(this.residues[residueid]);
                var atom = calpha;

                var prevResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi - 1);
                var nextResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi + 1);

                //ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot

                if(atom.style === 'cylinder and plate' && atom.ss === 'helix') { // no way to highlight part of cylinder
                    for(var i in this.residues[residueid]) {
                        var atom = this.atoms[i];
                        var scale = 1.0;
                        this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                    }
                }
                else if( (atom.style === 'ribbon' && atom.ss === 'coil') || (atom.style === 'strand' && atom.ss === 'coil') || atom.style === 'o3 trace' || atom.style === 'schematic' || atom.style === 'c alpha trace' || atom.style === 'b factor tube' || (atom.style === 'cylinder and plate' && atom.ss !== 'helix') ) {
                    // do not add extra residue if the side chain is shown
                    if(calpha !== undefined && calpha.style2 !== undefined && calpha.style2 !== 'nothing') continue;

                    var bAddResidue = false;
                    // add the next residue with same style
                    if(!bAddResidue && this.residues.hasOwnProperty(nextResidueid)) {
                        var index2 = Object.keys(this.residues[nextResidueid])[0];
                        var atom2 = this.hash2Atoms(this.residues[nextResidueid])[index2];
                        if( (atom.style === atom2.style && !atom2.ssbegin) || atom2.ssbegin) {
                            var residueAtoms = this.residues[nextResidueid];
                            atoms = this.unionHash(atoms, residueAtoms);

                            bAddResidue = true;

                            // record the highlight style for the artificial residue
                            if(atom2.ssbegin) {
                                for(var i in residueAtoms) {
                                    this.atoms[i].notshow = true;
                                }
                            }
                        }
                    }

                    // add the previous residue with same style
                    if(!bAddResidue && this.residues.hasOwnProperty(prevResidueid)) {
                        var index2 = Object.keys(this.residues[prevResidueid])[0];
                        var atom2 = this.hash2Atoms(this.residues[prevResidueid])[index2];
                        if(atom.style === atom2.style) {
                            atoms = this.unionHash(atoms, this.residues[prevResidueid]);

                            bAddResidue = true;
                        }
                    }
                }
                else if( (atom.style === 'ribbon' && atom.ss !== 'coil' && atom.ssend) || (atom.style === 'strand' && atom.ss !== 'coil' && atom.ssend)) {
                    // do not add extra residue if the side chain is shown
                    if(calpha !== undefined && calpha.style2 !== undefined && calpha.style2 !== 'nothing') continue;

                    var bAddResidue = false;
                    // add the next residue with same style
                    if(!bAddResidue && this.residues.hasOwnProperty(nextResidueid)) {
                        var index2 = Object.keys(this.residues[nextResidueid])[0];
                        var atom2 = this.hash2Atoms(this.residues[nextResidueid])[index2];
                        //if(atom.style === atom2.style && !atom2.ssbegin) {
                            atoms = this.unionHash(atoms, this.residues[nextResidueid]);

                            bAddResidue = true;
                        //}
                    }
                }
            } // end for
        } // end else {

        atomsObj = {};
    } // end if(bHighlight === 1)

    this.setStyle2Atoms(atoms);

    //this.bAllAtoms = (Object.keys(atoms).length === Object.keys(this.atoms).length);
    this.bAllAtoms = false;
    if(atoms && atoms !== undefined ) {
        this.bAllAtoms = (Object.keys(atoms).length === Object.keys(this.atoms).length);
    }

    var chemicalSchematicRadius = this.cylinderRadius * 0.5;

    // remove schematic labels
    //if(this.labels !== undefined) this.labels['schematic'] = undefined;
    if(this.labels !== undefined) delete this.labels['schematic'];

    var bOnlySideChains = false;

    if(bHighlight) {
        var residueHashCalpha = this.getResiduesFromCalphaAtoms(this.hAtoms);

        var proteinAtoms = this.intHash(this.hAtoms, this.proteins);
        var residueHash = this.getResiduesFromAtoms(proteinAtoms);

        if(Object.keys(residueHash) > Object.keys(residueHashCalpha)) { // some residues have only side chains
            bOnlySideChains = true;
        }
    }

    for(var style in this.style2atoms) {
      // 14 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
      var atomHash = this.style2atoms[style];
      //var bPhosphorusOnly = this.isCalphaPhosOnly(this.hash2Atoms(atomHash), "O3'", "O3*") || this.isCalphaPhosOnly(this.hash2Atoms(atomHash), "P");
      var bPhosphorusOnly = this.isCalphaPhosOnly(this.hash2Atoms(atomHash));

      //if(style === 'ribbon') {
      if(style === 'ribbon' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
          this.createStrand(this.hash2Atoms(atomHash), 2, undefined, true, undefined, undefined, false, this.ribbonthickness, bHighlight);
      }
      //else if(style === 'strand') {
      else if(style === 'strand' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
          this.createStrand(this.hash2Atoms(atomHash), null, null, null, null, null, false, undefined, bHighlight);
      }
      //else if(style === 'cylinder and plate') {
      else if(style === 'cylinder and plate' && (!bHighlight || (bHighlight && !bOnlySideChains))) {
        this.createCylinderHelix(this.hash2Atoms(atomHash), this.cylinderHelixRadius, bHighlight);
      }
      else if(style === 'nucleotide cartoon') {
        if(bPhosphorusOnly) {
            this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.traceRadius, false, bHighlight);
        }
        else {
            this.drawCartoonNucleicAcid(this.hash2Atoms(atomHash), null, this.ribbonthickness, bHighlight);

            if(bHighlight !== 2) this.drawNucleicAcidStick(this.hash2Atoms(atomHash), bHighlight);
        }
      }
      else if(style === 'o3 trace') {
        if(bPhosphorusOnly) {
            this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.traceRadius, false, bHighlight);
        }
        else {
            this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], this.traceRadius, false, bHighlight);
        }
      }
      //else if(style === 'phosphorus lines') {
      //  this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], 0.2, true, bHighlight);
      //}
      else if(style === 'schematic') {
        // either proteins, nucleotides, or chemicals
        var firstAtom = this.getFirstAtomObj(atomHash);

        //if(firstAtom.het) { // chemicals
        if(this.chemicals.hasOwnProperty(firstAtom.serial)) { // chemicals
            this.addNonCarbonAtomLabels(this.hash2Atoms(atomHash));

            bSchematic = true;
            this.createStickRepresentation(this.hash2Atoms(atomHash), chemicalSchematicRadius, chemicalSchematicRadius, undefined, bHighlight, bSchematic);
        }
        else { // nucleotides or proteins
            this.addResiudeLabels(this.hash2Atoms(atomHash), true);

            if(bPhosphorusOnly) {
                this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.traceRadius, false, bHighlight);
            }
            else {
                this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], this.traceRadius, false, bHighlight);
            }
            this.createCylinderCurve(this.hash2Atoms(atomHash), ['CA'], this.traceRadius, false, bHighlight);
        }
      }
      else if(style === 'c alpha trace') {
        this.createCylinderCurve(this.hash2Atoms(atomHash), ['CA'], this.traceRadius, false, bHighlight);
      }
      else if(style === 'b factor tube') {
        this.createTube(this.hash2Atoms(atomHash), 'CA', null, bHighlight, false, true);
      }
      else if(style === 'custom tube') {
        this.createTube(this.hash2Atoms(atomHash), 'CA', null, bHighlight, true, true);
      }
      else if(style === 'lines') {
        if(bHighlight === 1) {
            this.createStickRepresentation(this.hash2Atoms(atomHash), this.hlLineRadius, this.hlLineRadius, undefined, bHighlight);
        }
        else {
            this.createLineRepresentation(this.hash2Atoms(atomHash), bHighlight);
        }

        this.createConnCalphSidechain(this.hash2Atoms(atomHash), style);
      }
      else if(style === 'stick') {
        this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius, undefined, bHighlight, undefined);
        this.createConnCalphSidechain(this.hash2Atoms(atomHash), style);
      }
      else if(style === 'backbone') {
        atomHash = this.selectMainChainSubset(atomHash);
        this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius, undefined, bHighlight, undefined);
      }
      else if(style === 'ball and stick') {
        this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius * 0.5, this.dotSphereScale, bHighlight, undefined);
        this.createConnCalphSidechain(this.hash2Atoms(atomHash), style);
      }
      else if(style === 'sphere') {
        this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, undefined, undefined, bHighlight);
      }
      else if(style === 'dot') {
        this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, false, this.dotSphereScale, bHighlight);
      }
    } // end for loop

    if(this.cnt > this.maxmaxatomcnt) { // release memory
        this.init_base();
    }

    // hide the previous labels
    if(this.labels !== undefined && Object.keys(this.labels).length > 0) {
        this.hideLabels();

        // labels
        this.createLabelRepresentation(this.labels);
    }
};
