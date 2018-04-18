    iCn3D.prototype.applyPrevColor = function () {
        for (var i in this.atoms) {
            var atom = this.atoms[i];
            atom.color = this.atomPrevColors[i];
        }
    };

    iCn3D.prototype.applyOriginalColor = function () {
        for (var i in this.atoms) {
            var atom = this.atoms[i];
            var chainid = atom.structure + '_' + atom.chain;

            if(this.chnsColor.hasOwnProperty(chainid)) {
                atom.color = this.chnsColor[chainid];
            }
            else {
                //atom.color = this.atomColors[atom.elem];
                break;
            }
        }
    };

    iCn3D.prototype.setAtmClr = function(atoms, hex) {
        for (var i in atoms) {
            var atom = this.atoms[i];
            atom.color = new THREE.Color().setHex(hex);

            this.atomPrevColors[i] = atom.color;
        }
    };

    iCn3D.prototype.setColorByOptions = function (options, atoms, bUseInputColor) {
     if(options !== undefined) {
      if(bUseInputColor !== undefined && bUseInputColor) {
        for (var i in atoms) {
            var atom = this.atoms[i];

            this.atomPrevColors[i] = atom.color;
        }
      }
      else if(options.color.indexOf("#") === 0) {
        for (var i in atoms) {
            var atom = this.atoms[i];
            atom.color = new THREE.Color().setStyle(options.color.toLowerCase());

            this.atomPrevColors[i] = atom.color;
        }
      }
      else {
        switch (options.color.toLowerCase()) {
            case 'spectrum':
                var idx = 0;
                //var lastTerSerialInv = 1 / this.lastTerSerial;
                var lastTerSerialInv = 1 / this.cnt;
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : new THREE.Color().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                    //atom.color = this.atomColors[atom.elem] || this.defaultAtomColor;

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'chain':
                var index = -1, prevChain = '', colorLength = this.stdChainColors.length;
                for (var i in atoms) {
                    var atom = this.atoms[i];

                    if(atom.chain != prevChain) {
                        ++index;

                        index = index % colorLength;
                    }

                    atom.color = this.stdChainColors[index];

                    if(Object.keys(this.chnsColor).length > 0) this.updateChainsColor(atom);
                    this.atomPrevColors[i] = atom.color;

                    prevChain = atom.chain;
                }
                break;
            case 'secondary structure':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors[atom.ss];

                    this.atomPrevColors[i] = atom.color;
                }

                break;

            case 'residue':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.residueColors[atom.resn] || this.defaultResidueColor;

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'charge':
                for (var i in atoms) {
                    var atom = this.atoms[i];

                    //atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.chargeColors[atom.resn] || this.defaultResidueColor;
                    atom.color = atom.het ? this.defaultAtomColor : this.chargeColors[atom.resn] || this.defaultResidueColor;

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'hydrophobic':
                for (var i in atoms) {
                    var atom = this.atoms[i];

                    //atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.chargeColors[atom.resn] || this.defaultResidueColor;
                    atom.color = atom.het ? this.defaultAtomColor : this.hydrophobicColors[atom.resn] || this.defaultResidueColor;

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'atom':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = this.atomColors[atom.elem] || this.defaultAtomColor;

                    this.atomPrevColors[i] = atom.color;
                }
                break;

            case 'conserved':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = this.defaultAtomColor;

                    this.atomPrevColors[i] = atom.color;
                }

                for(var chainid in this.alnChnsSeq) {
                    var resObjectArray = this.alnChnsSeq[chainid];

                    for(var i = 0, il = resObjectArray.length; i < il; ++i) {
                        var residueid = chainid + '_' + resObjectArray[i].resi;

                        for(var j in this.resds[residueid]) {
                            if(atoms.hasOwnProperty(j)) {
                                var color = new THREE.Color(resObjectArray[i].color);
                                this.atoms[j].color = color;
                                this.atomPrevColors[j] = color;
                            }
                        }
                    }
                }
                break;

            case 'white':
                this.setAtmClr(atoms, 0xFFFFFF);
                break;

            case 'grey':
                this.setAtmClr(atoms, 0x888888);
                break;

            case 'red':
                this.setAtmClr(atoms, 0xFF0000);
                break;
            case 'green':
                this.setAtmClr(atoms, 0x00FF00);
                break;
            case 'blue':
                this.setAtmClr(atoms, 0x0000FF);
                break;
            case 'magenta':
                this.setAtmClr(atoms, 0xFF00FF);
                break;
            case 'yellow':
                this.setAtmClr(atoms, 0xFFFF00);
                break;
            case 'cyan':
                this.setAtmClr(atoms, 0x00FFFF);
                break;
            case 'custom':
                // do the coloring separately
                break;

            default: // the "#" was missed in order to make sharelink work
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setStyle("#" + options.color.toLowerCase());

                    this.atomPrevColors[i] = atom.color;
                }

                break;
        }
      }
     }
    };

    iCn3D.prototype.updateChainsColor = function (atom) {
        var chainid = atom.structure + '_' + atom.chain;
        if(this.chnsColor[chainid] !== undefined) {  // for mmdbid and align input
            this.chnsColor[chainid] = atom.color;
        }
    };

    iCn3D.prototype.applyLigandbindingOptions = function (options) {
        if(options === undefined) options = this.opts;

        // display mode
        if (options.ligandbinding === 'show') {
            var startAtoms;
            if(this.ligs !== undefined && Object.keys(this.ligs).length > 0) { // show ligand-protein interaction
                startAtoms = this.hash2Atoms(this.ligs);
            }

            // find atoms in chainid1, which interact with chainid2
            var radius = 4;

            if(startAtoms !== undefined) {
                var targetAtoms = this.getAtomsWithinAtom(this.atoms, startAtoms, radius);

                var residueHash = {};

                // draw sidec for these residues
                for(var i in targetAtoms) {
                  if(startAtoms.hasOwnProperty(i)) continue;
                  residueHash[this.atoms[i].structure + '_' + this.atoms[i].chain + '_' + this.atoms[i].resi] = 1;
                }

                var residueArray = Object.keys(residueHash);
                for(var i = 0, il = residueArray.length; i < il; ++i) {
                    for(var j in this.resds[residueArray[i]]) {
                        // all atoms should be shown for hbonds
                        this.atoms[j].style2 = 'stick';
                    }
                }

                // show hydrogens
                var threshold = 3.5;
                this.opts["hbonds"] = "yes";
                //this.opts["water"] = "dot";

                if(Object.keys(targetAtoms).length > 0) {
                    this.calculateLigandHbonds(startAtoms, targetAtoms, parseFloat(threshold) );
                }

                // zoom in on the atoms
                this.zoominSelection( this.unionHash(startAtoms, targetAtoms) );

                this.opts['fog'] = 'yes';
            }
        }
        else if (options.ligandbinding === 'hide') {
            // truen off hdonds
            this.hideHbonds();

            // center on the atoms
            this.zoominSelection(this.atoms);

            this.opts['fog'] = 'no';
        }
    };

    iCn3D.prototype.hideHbonds = function () {
            this.opts["hbonds"] = "no";
            if(this.lines === undefined) this.lines = {};
            this.lines['hbond'] = [];
            this.hbondpnts = [];

            for(var i in this.atoms) {
                this.atoms[i].style2 = 'nothing';
            }

            for(var i in this.sidec) {
                this.atoms[i].style2 = this.opts["sidec"];
            }

            for(var i in this.water) {
                this.atoms[i].style = this.opts["water"];
            }
    };

    iCn3D.prototype.applySsbondsOptions = function (options) {
        if(options === undefined) options = this.opts;

        if (options.ssbonds.toLowerCase() === 'yes' && this.ssbondpnts !== undefined) {
          var color = '#FFFF00';
          var colorObj = new THREE.Color(0xFFFF00);

          var structureArray = Object.keys(this.strucs);
          var start, end;

          if(this.bAlternate) {
              start = this.ALTERNATE_STRUCTURE;
              end = this.ALTERNATE_STRUCTURE + 1;
          }
          else {
              start = 0;
              end = structureArray.length;
          }

          this.lines['ssbond'] = [];

          for(var s = start, sl = end; s < sl; ++s) {
              var structure = structureArray[s];

              if(this.ssbondpnts[structure] === undefined) continue;

              for(var i = 0, lim = Math.floor(this.ssbondpnts[structure].length / 2); i < lim; i++) {
                var res1 = this.ssbondpnts[structure][2 * i], res2 = this.ssbondpnts[structure][2 * i + 1];

                var line = {};
                line.color = color;
                line.dashed = true;

                var bFound = false;
                for(var j in this.resds[res1]) {
                    if(this.atoms[j].name === 'SG') {
                        line.position1 = this.atoms[j].coord;
                        bFound = true;
                        break;
                    }
                }

                if(!bFound) {
                    for(var j in this.resds[res1]) {
                        if(this.atoms[j].name === 'CA') {
                            line.position1 = this.atoms[j].coord;
                            bFound = true;
                            break;
                        }
                    }
                }

                bFound = false;
                for(var j in this.resds[res2]) {
                    if(this.atoms[j].name === 'SG') {
                        line.position2 = this.atoms[j].coord;
                        bFound = true;
                        break;
                    }
                }

                if(!bFound) {
                    for(var j in this.resds[res2]) {
                        if(this.atoms[j].name === 'CA') {
                            line.position2 = this.atoms[j].coord;
                            bFound = true;
                            break;
                        }
                    }
                }

                //if(this.lines['ssbond'] === undefined) this.lines['ssbond'] = [];
                this.lines['ssbond'].push(line);

                // create bonds for disulfide bonds
                //this.createCylinder(line.position1, line.position2, this.cylinderRadius * 0.5, colorObj);
                // make disulfide bonds slightly larger in case they were define already in MMDB
                this.createCylinder(line.position1, line.position2, this.cylinderRadius * 1.1, colorObj);

                // show ball and stick for these two residues
                var residueAtoms = this.unionHash(this.resds[res1], this.resds[res2]);

                // show side chains for the selected atoms
                var atoms = this.intHash(residueAtoms, this.sidec);
                var calpha_atoms = this.intHash(residueAtoms, this.calphas);
                // include calphas
                atoms = this.unionHash(atoms, calpha_atoms);

                // draw sidec separatedly
                for(var j in atoms) {
                  this.atoms[j].style2 = 'stick';
                }
              } // for(var i = 0,
          } // for(var s = 0,
        } // if (options.ssbonds.toLowerCase() === 'yes'
    };

    iCn3D.prototype.applyOtherOptions = function (options) {
        if(options === undefined) options = this.opts;

        //common part options
        // labels
        this.createLabelRepresentation(this.labels);

        // lines
        //if (options.hbonds.toLowerCase() === 'yes' || options.ncbonds.toLowerCase() === 'yes') {
        if (options.hbonds.toLowerCase() === 'yes') {
            var color = '#00FF00';
            var pnts = this.hbondpnts;

             for (var i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
                var line = {};
                line.position1 = pnts[2 * i];
                line.position2 = pnts[2 * i + 1];
                line.color = color;
                line.dashed = true;

                if(this.lines['hbond'] === undefined) this.lines['hbond'] = [];
                this.lines['hbond'].push(line);
             }

            //this.createLines(this.lines);
        }

        if (options.hbondsin.toLowerCase() === 'yes') {
            var color = '#FFFFFF';
            var pnts = this.hbondinpnts;
            for (var i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
                var line = {};
                line.position1 = pnts[2 * i];
                line.position2 = pnts[2 * i + 1];
                line.color = color;
                line.dashed = false; // if true, there will be too many cylinders in the dashed lines

                if(this.lines['hbondin'] === undefined) this.lines['hbondin'] = [];
                this.lines['hbondin'].push(line);
            }

            //this.createLines(this.lines);
        }

        this.createLines(this.lines);

        // surfaces
        if(this.prevSurfaces !== undefined) {
            for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
                this.mdl.add(this.prevSurfaces[i]);
            }
        }

        switch (options.rotationcenter.toLowerCase()) {
            case 'molecule center':
                // move the molecule to the origin
                if(this.center !== undefined) {
                    this.setRotationCenter(this.center);
                }
                break;
            case 'pick center':
                if(this.pAtom !== undefined) {
                  this.setRotationCenter(this.pAtom.coord);
                }
                break;
            case 'display center':
                var center = this.centerAtoms(this.dAtoms).center;
                this.setRotationCenter(center);
                break;
            case 'highlight center':
                var center = this.centerAtoms(this.hAtoms).center;
                this.setRotationCenter(center);
                break;
        }
        switch (options.axis.toLowerCase()) {
            case 'yes':
                this.axis = true;

                this.buildAxes(this.maxD/2);

                break;
            case 'no':
                this.axis = false;
                break;
        }
        switch (options.pk.toLowerCase()) {
            case 'atom':
                this.pk = 1;
                break;
            case 'no':
                this.pk = 0;
                break;
            case 'residue':
                this.pk = 2;
                break;
            case 'strand':
                this.pk = 3;
                break;
        }
    };

    iCn3D.prototype.applySurfaceOptions = function (options) {
        if(options === undefined) options = this.opts;

        //switch (options.wireframe.toLowerCase()) {
        switch (options.wireframe) {
            case 'yes':
                options.wireframe = true;
                break;
            case 'no':
                options.wireframe = false;
                break;
        }

        options.opacity = parseFloat(options.opacity);

        var atoms, currAtoms;

        // only show the surface for atoms which are displaying
        atoms = this.intHash(this.dAtoms, this.hAtoms);

        currAtoms = this.hash2Atoms(atoms);

        switch (options.surface.toLowerCase()) {
            case 'van der waals surface':
                this.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
                break;
//            case 'solvent excluded surface':
//                this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
//                break;
            case 'solvent accessible surface':
                this.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
                break;
            case 'molecular surface':
                this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
                break;
            case 'van der waals surface with context':
                this.createSurfaceRepresentation(currAtoms, 1, options.wireframe, options.opacity);
                break;
            case 'solvent accessible surface with context':
                this.createSurfaceRepresentation(currAtoms, 3, options.wireframe, options.opacity);
                break;
            case 'molecular surface with context':
                this.createSurfaceRepresentation(currAtoms, 2, options.wireframe, options.opacity);
                break;
            case 'nothing':
                // remove surfaces
                this.removeSurfaces();
                break;
        }
    };

    iCn3D.prototype.applyDisplayOptions = function (options, atoms, bHighlight) { var me = this; // atoms: hash of key -> 1
        if(options === undefined) options = this.opts;

        var residueHash = {};
        var singletonResidueHash = {};
        var atomsObj = {};
        var residueid;

        if(bHighlight === 1 && Object.keys(atoms).length < Object.keys(this.atoms).length) {
            atomsObj = this.hash2Atoms(atoms);

            for(var i in atomsObj) {
                var atom = atomsObj[i];

                residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residueHash[residueid] = 1;
            }

            // find singleton residues
            for(var i in residueHash) {
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
            if(Object.keys(atomsObj).length === 1 && Object.keys(this.resds[residueid]).length > 1
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
                    var atom = this.getFirstAtomObj(this.resds[residueid]);
                    var prevResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi - 1);
                    var nextResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi + 1);

                    //ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot

                    if(atom.style === 'cylinder and plate' && atom.ss === 'helix') { // no way to highlight part of cylinder
                        for(var i in this.resds[residueid]) {
                            var atom = this.atoms[i];
                            var scale = 1.0;
                            this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                        }
                    }
                    else if( (atom.style === 'ribbon' && atom.ss === 'coil') || (atom.style === 'strand' && atom.ss === 'coil') || atom.style === 'o3 trace' || atom.style === 'schematic' || atom.style === 'c alpha trace' || atom.style === 'b factor tube' || (atom.style === 'cylinder and plate' && atom.ss !== 'helix') ) {
                        var bAddResidue = false;
                        // add the next residue with same style
                        if(!bAddResidue && this.resds.hasOwnProperty(nextResidueid)) {
                            var index2 = Object.keys(this.resds[nextResidueid])[0];
                            var atom2 = this.hash2Atoms(this.resds[nextResidueid])[index2];
                            if( (atom.style === atom2.style && !atom2.ssbegin) || atom2.ssbegin) {
                                var residueAtoms = this.resds[nextResidueid];
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
                        if(!bAddResidue && this.resds.hasOwnProperty(prevResidueid)) {
                            var index2 = Object.keys(this.resds[prevResidueid])[0];
                            var atom2 = this.hash2Atoms(this.resds[prevResidueid])[index2];
                            if(atom.style === atom2.style) {
                                atoms = this.unionHash(atoms, this.resds[prevResidueid]);

                                bAddResidue = true;
                            }
                        }
                    }
                    else if( (atom.style === 'ribbon' && atom.ss !== 'coil' && atom.ssend) || (atom.style === 'strand' && atom.ss !== 'coil' && atom.ssend)) {
                        var bAddResidue = false;
                        // add the next residue with same style
                        if(!bAddResidue && this.resds.hasOwnProperty(nextResidueid)) {
                            var index2 = Object.keys(this.resds[nextResidueid])[0];
                            var atom2 = this.hash2Atoms(this.resds[nextResidueid])[index2];
                            //if(atom.style === atom2.style && !atom2.ssbegin) {
                                atoms = this.unionHash(atoms, this.resds[nextResidueid]);

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

//        var currentCalphas = {};
//        if(this.opts['sidec'] !== 'nothing') {
//            currentCalphas = this.intHash(this.hAtoms, this.calphas);
//        }

        // remove schematic labels
        if(this.labels && this.labels !== undefined) this.labels['schematic'] = [];

        var ligandSchematicRadius = this.cylinderRadius * 0.5;

        for(var style in this.style2atoms) {
          // 14 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
          atomHash = this.style2atoms[style];
          var bPhosphorusOnly = this.isPhosphorusOnly(this.hash2Atoms(atomHash));

          if(style === 'ribbon') {
              this.createStrand(this.hash2Atoms(atomHash), 2, undefined, true, undefined, undefined, false, this.thickness, bHighlight);
          }
          else if(style === 'strand') {
              this.createStrand(this.hash2Atoms(atomHash), null, null, null, null, null, false, undefined, bHighlight);
          }
          else if(style === 'cylinder and plate') {
            this.createCylinderHelix(this.hash2Atoms(atomHash), this.cylinderHelixRadius, bHighlight);
          }
          else if(style === 'nucleotide cartoon') {
            if(bPhosphorusOnly) {
                this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.cylinderRadius, false, bHighlight);
            }
            else {
                this.drawCartoonNucleicAcid(this.hash2Atoms(atomHash), null, this.thickness, bHighlight);

                if(bHighlight !== 2) this.drawNucleicAcidStick(this.hash2Atoms(atomHash), bHighlight);
            }
          }
          else if(style === 'o3 trace') {
            if(bPhosphorusOnly) {
                this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.cylinderRadius, false, bHighlight);
            }
            else {
                this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], this.cylinderRadius, false, bHighlight);
            }
          }
          //else if(style === 'phosphorus lines') {
          //  this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], 0.2, true, bHighlight);
          //}
          else if(style === 'schematic') {
            // either prtns, nucleotides, or ligands
            var firstAtom = this.getFirstAtomObj(atomHash);

            //if(firstAtom.het) { // ligands
            if(this.ligs.hasOwnProperty(firstAtom.serial)) { // ligands
                this.addNonCarbonAtomLabels(this.hash2Atoms(atomHash));

                bSchematic = true;
                this.createStickRepresentation(this.hash2Atoms(atomHash), ligandSchematicRadius, ligandSchematicRadius, undefined, bHighlight, bSchematic);
            }
            else { // nucleotides or prtns
                this.addResiudeLabels(this.hash2Atoms(atomHash), true);

                if(bPhosphorusOnly) {
                    this.createCylinderCurve(this.hash2Atoms(atomHash), ["P"], this.cylinderRadius, false, bHighlight);
                }
                else {
                    this.createCylinderCurve(this.hash2Atoms(atomHash), ["O3'", "O3*"], this.cylinderRadius, false, bHighlight);
                }
                this.createCylinderCurve(this.hash2Atoms(atomHash), ['CA'], this.cylinderRadius, false, bHighlight);
            }
          }
          else if(style === 'c alpha trace') {
            this.createCylinderCurve(this.hash2Atoms(atomHash), ['CA'], this.cylinderRadius, false, bHighlight);
          }
          else if(style === 'b factor tube') {
            this.createTube(this.hash2Atoms(atomHash), 'CA', null, bHighlight);
          }
          else if(style === 'lines') {
            if(bHighlight === 1) {
                this.createStickRepresentation(this.hash2Atoms(atomHash), this.hlLineRadius, this.hlLineRadius, undefined, bHighlight);
            }
            else {
                this.createLineRepresentation(this.hash2Atoms(atomHash), bHighlight);
            }
          }
          else if(style === 'stick') {
            this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius, undefined, bHighlight);
          }
          else if(style === 'ball and stick') {
            this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius * 0.5, this.dotSphereScale, bHighlight);
          }
          else if(style === 'sphere') {
            this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, undefined, undefined, bHighlight);
          }
          else if(style === 'dot') {
            this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, false, this.dotSphereScale, bHighlight);
          }
        } // end for loop
    };

    iCn3D.prototype.getShader = function (name) { var me = this;
      var shaderText = $NGL_shaderTextHash[name];
      var reInclude = /#include\s+(\S+)/gmi;

      shaderText = shaderText.replace( reInclude, function( match, p1 ){

            var chunk;
            if(THREE.ShaderChunk.hasOwnProperty(p1)) {
                chunk = THREE.ShaderChunk[ p1 ];
            }

            return chunk ? chunk : "";

      } );

      return shaderText;
    };

    iCn3D.prototype.createImpostorShaderCylinder = function (shaderName) { var me = this;
          var shaderMaterial =
            new THREE.ShaderMaterial({
              defines: me.defines,
              uniforms:  me.uniforms,
              vertexShader:   me.getShader(shaderName + ".vert"),
              fragmentShader: me.getShader(shaderName + ".frag"),
              depthTest: true,
              depthWrite: true,
              needsUpdate: true,
              lights: true
          });

          shaderMaterial.extensions.fragDepth = true;

        var positions = new Float32Array( me.posArray );
        var colors = new Float32Array( me.colorArray );
        var positions2 = new Float32Array( me.pos2Array );
        var colors2 = new Float32Array( me.color2Array );
        var radii = new Float32Array( me.radiusArray );

        // cylinder
        var mapping = new Float32Array([
            -1.0,  1.0, -1.0,
            -1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0
        ]);

        var mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 4, 2,
            2, 4, 3,
            4, 5, 3
        ]);

        var mappingIndicesSize = 12;
        var mappingType = "v3";
        var mappingSize = 6;
        var mappingItemSize = 3;


        var count = positions.length / 3;

        var data = {
            "position1": positions,
            "color": colors,
            "position2": positions2,
            "color2": colors2,
            "radius": radii
        };

        //MappedBuffer
        var attributeSize = count * mappingSize;

        var n = count * mappingIndicesSize;
        var TypedArray = attributeSize > 65535 ? Uint32Array : Uint16Array;
        var index = new TypedArray( n );

            //makeIndex();
        var ix, it;

        for( var v = 0; v < count; v++ ) {
            ix = v * mappingIndicesSize;
            it = v * mappingSize;

            index.set( mappingIndices, ix );

            for( var s = 0; s < mappingIndicesSize; ++s ){
                index[ ix + s ] += it;
            }
        }


        var geometry = new THREE.BufferGeometry();

        // buffer.js
        var dynamic = true;

        if( index ){
            geometry.setIndex(
                new THREE.BufferAttribute( index, 1 )
            );
            geometry.getIndex().setDynamic( dynamic );
        }

        // add attributes from buffer.js
        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        var attributeData = {
            "position1": { type: "v3", value: null },
            "color": { type: "v3", value: null },
            "position2": { type: "v3", value: null },
            "color2": { type: "v3", value: null },
            "radius": { type: "f", value: null },
            "mapping": { type: mappingType, value: null }
        };

        for( var name in attributeData ){

            var buf;
            var a = attributeData[ name ];


            //if( a.value ){
            //    if( attributeSize * itemSize[ a.type ] !== a.value.length ){
            //        Log.error( "attribute value has wrong length", name );
            //    }
            //    buf = a.value;
            //}else{

                buf = new Float32Array(
                    attributeSize * itemSize[ a.type ]
                );

              //}

            geometry.addAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
                    .setDynamic( dynamic )
            );

        }

        // set attributes from mapped-buffer.js
        var attributes = geometry.attributes;

        var a, d, itemSize2, array, i, j;

        for( var name in data ){

            d = data[ name ];
            a = attributes[ name ];
            itemSize2 = a.itemSize;
            array = a.array;

            for( var k = 0; k < count; ++k ) {

                n = k * itemSize2;
                i = n * mappingSize;

                for( var l = 0; l < mappingSize; ++l ) {

                    j = i + ( itemSize2 * l );

                    for( var m = 0; m < itemSize2; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            a.needsUpdate = true;

        }

        // makemapping
        var aMapping = geometry.attributes.mapping.array;

        for( var v = 0; v < count; v++ ) {
            aMapping.set( mapping, v * mappingItemSize * mappingSize );
        }


        var mesh = new THREE.Mesh(geometry, shaderMaterial);

        // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
        // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
        mesh.frustumCulled = false;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.0;

        this.mdlImpostor.add(mesh);

        //this.objects.push(mesh);
    };

    iCn3D.prototype.createImpostorShaderSphere = function (shaderName) { var me = this;
      var shaderMaterial =
        new THREE.ShaderMaterial({
          defines: me.defines,
          uniforms:  me.uniforms,
          vertexShader:   me.getShader(shaderName + ".vert"),
          fragmentShader: me.getShader(shaderName + ".frag"),
          depthTest: true,
          depthWrite: true,
          needsUpdate: true,
          lights: true
      });

      shaderMaterial.extensions.fragDepth = true;

        var positions = new Float32Array( me.posArraySphere );
        var colors = new Float32Array( me.colorArraySphere );
        var radii = new Float32Array( me.radiusArraySphere );

        // sphere
        var mapping = new Float32Array([
            -1.0,  1.0,
            -1.0, -1.0,
             1.0,  1.0,
             1.0, -1.0
        ]);

        var mappingIndices = new Uint16Array([
            0, 1, 2,
            1, 3, 2
        ]);

        var mappingIndicesSize = 6;
        var mappingType = "v2";
        var mappingSize = 4;
        var mappingItemSize = 2;

        var count = positions.length / 3;

        var data = {
            "position": positions,
            "color": colors,
            "radius": radii
        };

        //MappedBuffer
        var attributeSize = count * mappingSize;

        var n = count * mappingIndicesSize;
        var TypedArray = attributeSize > 65535 ? Uint32Array : Uint16Array;
        var index = new TypedArray( n );

            //makeIndex();
        var ix, it;

        for( var v = 0; v < count; v++ ) {
            ix = v * mappingIndicesSize;
            it = v * mappingSize;

            index.set( mappingIndices, ix );

            for( var s = 0; s < mappingIndicesSize; ++s ){
                index[ ix + s ] += it;
            }
        }


        var geometry = new THREE.BufferGeometry();

        // buffer.js
        var dynamic = true;

        if( index ){
            geometry.setIndex(
                new THREE.BufferAttribute( index, 1 )
            );
            geometry.getIndex().setDynamic( dynamic );
        }

        // add attributes from buffer.js
        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        var attributeData = {
            "position": { type: "v3", value: null },
            "color": { type: "v3", value: null },
            "radius": { type: "f", value: null },
            "mapping": { type: mappingType, value: null }
        };

        for( var name in attributeData ){

            var buf;
            var a = attributeData[ name ];

                buf = new Float32Array(
                    attributeSize * itemSize[ a.type ]
                );

            geometry.addAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
                    .setDynamic( dynamic )
            );

        }

        // set attributes from mapped-buffer.js
        var attributes = geometry.attributes;

        var a, d, itemSize2, array, i, j;

        for( var name in data ){

            d = data[ name ];
            a = attributes[ name ];
            itemSize2 = a.itemSize;
            array = a.array;

            for( var k = 0; k < count; ++k ) {

                n = k * itemSize2;
                i = n * mappingSize;

                for( var l = 0; l < mappingSize; ++l ) {

                    j = i + ( itemSize2 * l );

                    for( var m = 0; m < itemSize2; ++m ) {

                        array[ j + m ] = d[ n + m ];

                    }

                }

            }

            a.needsUpdate = true;

        }

        // makemapping
        var aMapping = geometry.attributes.mapping.array;

        for( var v = 0; v < count; v++ ) {
            aMapping.set( mapping, v * mappingItemSize * mappingSize );
        }

        var mesh = new THREE.Mesh(geometry, shaderMaterial);

        // important: https://stackoverflow.com/questions/21184061/mesh-suddenly-disappears-in-three-js-clipping
        // You are moving the camera in the CPU. You are moving the vertices of the plane in the GPU
        mesh.frustumCulled = false;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

        this.mdlImpostor.add(mesh);

        //this.objects.push(mesh);
    };

    iCn3D.prototype.setStyle2Atoms = function (atoms) {
          this.style2atoms = {};

          for(var i in atoms) {
            if(this.style2atoms[this.atoms[i].style] === undefined) this.style2atoms[this.atoms[i].style] = {};

            this.style2atoms[this.atoms[i].style][i] = 1;

            // side chains
            if(this.style2atoms[this.atoms[i].style2] === undefined) this.style2atoms[this.atoms[i].style2] = {};

            this.style2atoms[this.atoms[i].style2][i] = 1;
          }
    };

    // set atom style when loading a structure
    iCn3D.prototype.setAtomStyleByOptions = function (options) {
        if(options === undefined) options = this.opts;

        var selectedAtoms;

        if (options.prtns !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.prtns);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.prtns.toLowerCase();
            }
        }

        // side chain overwrite the protein style
        if (options.sidec !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.sidec);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.sidec.toLowerCase();
            }
        }

        if (options.ligands !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.ligs);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.ligands.toLowerCase();
            }
        }

        if (options.ions !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.ions);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.ions.toLowerCase();
            }
        }

        if (options.water !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.water);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.water.toLowerCase();
            }
        }

        if (options.nucleotides !== undefined) {
            selectedAtoms = this.intHash(this.hAtoms, this.nclts);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.nucleotides.toLowerCase();
            }
        }
    };

    iCn3D.prototype.rebuildScene = function (options) { var me = this;
        jQuery.extend(me.opts, options);

        this.cam_z = this.maxD * 2;
        //this.cam_z = -this.maxD * 2;


        if(this.scene !== undefined) {
            for(var i = this.scene.children.length - 1; i >= 0; i--) {
                 var obj = this.scene.children[i];
                 this.scene.remove(obj);
            }
        }
        else {
            this.scene = new THREE.Scene();
        }

        if(this.scene_ghost !== undefined) {
            for(var i = this.scene_ghost.children.length - 1; i >= 0; i--) {
                 var obj = this.scene_ghost.children[i];
                 this.scene_ghost.remove(obj);
            }
        }
        else {
            this.scene_ghost = new THREE.Scene();
        }

        //this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);

        if(this.cam_z > 0) {
          this.directionalLight.position.set(0, 0, 1);
        }
        else {
          this.directionalLight.position.set(0, 0, -1);
        }

        //var ambientLight = new THREE.AmbientLight(0x202020);
        //var ambientLight = new THREE.AmbientLight(0xdddddd, 0.2);
        var ambientLight = new THREE.AmbientLight(0x404040);

        this.scene.add(this.directionalLight);
        this.scene.add(ambientLight);

        //this.group = new THREE.Object3D();  // regular display

        this.mdl = new THREE.Object3D();  // regular display
        //this.mdlPicking = new THREE.Object3D();  // pk display
        this.mdlImpostor = new THREE.Object3D();  // Impostor display

        //this.scene.add(this.mdlPicking);
        this.scene.add(this.mdl);
        this.scene.add(this.mdlImpostor);

        // highlight on impostors
        this.mdl_ghost = new THREE.Object3D();  // Impostor display
        this.scene_ghost.add(this.mdl_ghost);

        //this.scene_ghost.add(this.directionalLight);
        //this.scene_ghost.add(ambientLight);

        // related to pk
        this.objects = []; // define objects for pk, not all elements are used for pk
        this.objects_ghost = []; // define objects for pk, not all elements are used for pk
        this.raycaster = new THREE.Raycaster();
        this.projector = new THREE.Projector();
        this.mouse = new THREE.Vector2();

        var background = this.backgroundColors[this.opts.background.toLowerCase()];
        if(this.opts.background.toLowerCase() === 'transparent') {
            this.renderer.setClearColor(background, 0);
        }
        else {
            this.renderer.setClearColor(background, 1);
        }

        this.perspectiveCamera = new THREE.PerspectiveCamera(20, this.container.whratio, 0.1, 10000);
        this.perspectiveCamera.position.set(0, 0, this.cam_z);
        this.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

        this.orthographicCamera = new THREE.OrthographicCamera();
        this.orthographicCamera.position.set(0, 0, this.cam_z);
        this.orthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));

        this.cams = {
            perspective: this.perspectiveCamera,
            orthographic: this.orthographicCamera,
        };

//        this.setCamera();

        if(this.bSkipLigandbinding === undefined || !this.bSkipLigandbinding) this.applyLigandbindingOptions();
        this.bSkipLigandbinding = true;

        // show disulfide bonds, set side chains
        this.applySsbondsOptions();

        this.applyDisplayOptions(this.opts, this.dAtoms);

        this.applyOtherOptions();

        this.setFog();

        this.setCamera();

        //https://stackoverflow.com/questions/15726560/three-js-raycaster-intersection-empty-when-objects-not-part-of-scene
        me.scene_ghost.updateMatrixWorld(true);
    };

    iCn3D.prototype.setFog = function() {
        var background = this.backgroundColors[this.opts.background.toLowerCase()];

        // apply fog
        if(this.opts['fog'] === 'yes') {
            if(this.opts['camera'] === 'perspective') {        //perspective, orthographic
                //this.scene.fog = new THREE.Fog(background, this.cam_z, this.cam_z + 0.5 * this.maxD);
                //this.scene.fog = new THREE.Fog(background, 2 * this.maxD, 2.5 * this.maxD);
                this.scene.fog = new THREE.Fog(background, 2 * this.maxD, 3 * this.maxD);
            }
            else if(this.opts['camera'] === 'orthographic') {
                this.scene.fog = new THREE.FogExp2(background, 2);
                //this.scene.fog.near = this.cam_z;
                //this.scene.fog.far = this.cam_z + 0.5 * this.maxD;
                this.scene.fog.near = 2 * this.maxD;
                //this.scene.fog.far = 2.5 * this.maxD;
                this.scene.fog.far = 3 * this.maxD;
            }
        }
        else {
            this.scene.fog = undefined;
        }
    };

    iCn3D.prototype.setCamera = function() {
        this.cam = this.cams[this.opts.camera.toLowerCase()];

        if(this.cam === this.perspectiveCamera) {
            if(this.cam_z > 0) {
              this.cam.position.z = this.maxD * 2; // forperspective, the z positionshould be large enough to see the whole molecule
            }
            else {
              this.cam.position.z = -this.maxD * 2; // forperspective, the z positionshould be large enough to see the whole molecule
            }

            if(this.opts['slab'] === 'yes') {
                this.cam.near = this.maxD * 2;
            }
            else {
                this.cam.near = 0.1;
            }
            this.cam.far = 10000;

            this.controls = new THREE.TrackballControls( this.cam, document.getElementById(this.id), this );
        }
        else if (this.cam === this.orthographicCamera){
            this.cam.right = this.maxD/2 * 2.5;
            this.cam.left = -this.cam.right;
            this.cam.top = this.cam.right /this.container.whratio;
            this.cam.bottom = -this.cam.right /this.container.whratio;

              if(this.opts['slab'] === 'yes') {
                  this.cam.near = this.maxD * 2;
              }
              else {
                this.cam.near = 0;
              }

              this.cam.far = 10000;

            this.controls = new THREE.OrthographicTrackballControls( this.cam, document.getElementById(this.id), this );
        }

        this.cam.updateProjectionMatrix();
    };

    iCn3D.prototype.applyTransformation = function (_zoomFactor, mouseChange, quaternion) {
        var para = {};
        para.update = false;

        // zoom
        para._zoomFactor = _zoomFactor;

        // translate
        para.mouseChange = new THREE.Vector2();
        para.mouseChange.copy(mouseChange);

        // rotation
        para.quaternion = new THREE.Quaternion();
        para.quaternion.copy(quaternion);

        this.controls.update(para);
    };

    iCn3D.prototype.render = function () {
        this.directionalLight.position.copy(this.cam.position);

        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true

        this.renderer.setPixelRatio( window.devicePixelRatio ); // r71
        this.renderer.render(this.scene, this.cam);
        //this.renderer.render(this.scene_ghost, this.cam);
    };

    iCn3D.prototype.setRotationCenter = function (coord) {
       this.mdl.position.set(0,0,0);
       this.mdlImpostor.position.set(0,0,0);
       this.mdl_ghost.position.set(0,0,0);

        //this.mdlPicking.position.sub(coord);
        this.mdl.position.sub(coord);
        this.mdlImpostor.position.sub(coord);
        this.mdl_ghost.position.sub(coord);
    };

    iCn3D.prototype.drawImpostorShader = function () { var me = this;
        var modelViewMatrix = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function( object ){
                    this.value.copy( object.modelViewMatrix );
        } );

        var modelViewMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function( object ){
                    this.value.getInverse( object.modelViewMatrix );
        } );

        var modelViewMatrixInverseTranspose = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function( object ){
                    this.value.getInverse( object.modelViewMatrix ).transpose();
        } );

        var modelViewProjectionMatrix = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function( object ){
                    this.value.multiplyMatrices( me.cam.projectionMatrix, object.modelViewMatrix );
        } );

        var modelViewProjectionMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function( object ){
                    var tmpMatrix = new THREE.Matrix4();
                    tmpMatrix.multiplyMatrices(me.cam.projectionMatrix, object.modelViewMatrix);
                    this.value.getInverse(tmpMatrix);
        } );

        var projectionMatrix = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function(  ){
                    this.value.copy( me.cam.projectionMatrix );
        } );

        var projectionMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
                .onUpdate( function(  ){
                    this.value.getInverse( me.cam.projectionMatrix );
        } );

        var background = this.backgroundColors[this.opts.background.toLowerCase()];
        var near = 2 * this.maxD;
        //var far = 2.5 * this.maxD;
        var far = 3 * this.maxD;

        this.uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib.common,
          {
            modelViewMatrix: modelViewMatrix,
            modelViewMatrixInverse: modelViewMatrixInverse,
            modelViewMatrixInverseTranspose: modelViewMatrixInverseTranspose,
            modelViewProjectionMatrix: modelViewProjectionMatrix,
            modelViewProjectionMatrixInverse: modelViewProjectionMatrixInverse,
            projectionMatrix: projectionMatrix,
            projectionMatrixInverse: projectionMatrixInverse,
            //ambientLightColor: { type: "v3", value: [0.25, 0.25, 0.25] },
            diffuse: { type: "v3", value: [1.0, 1.0, 1.0] },
            emissive: { type: "v3", value: [0.0,0.0,0.0] },
            roughness: { type: "f", value: 0.5 }, // 0.4
            metalness: { type: "f", value: 0.3 }, // 0.5
            opacity: { type: "f", value: 1.0 },
            nearClip: { type: "f", value: 0.1 },
            ortho: { type: "f", value: 0.0 },
            shrink: { type: "f", value: 0.13 },
            fogColor: { type: "v3", value: [background.r, background.g, background.b] },
            fogNear: { type: "f", value: near },
            fogFar: { type: "f", value: far },
            fogDensity: { type: "f", value: 2.0 }
          },
            THREE.UniformsLib.ambient,
            THREE.UniformsLib.lights
        ]);

        /*
        //fog_pars_fragment
        #ifdef USE_FOG
            uniform vec3 fogColor;
            #ifdef FOG_EXP2
                uniform float fogDensity;
            #else
                uniform float fogNear;
                uniform float fogFar;
            #endif
        #endif
        */

        this.defines = {
            USE_COLOR: 1,
            //PICKING: 1,
            NEAR_CLIP: 1,
            CAP: 1
        };

        if(this.opts['fog'] === 'yes') {
            this.defines['USE_FOG'] = 1;
            if(this.opts['camera'] === 'orthographic') {
                this.defines['FOG_EXP2'] = 1;
            }
        }

        if(this.bExtFragDepth) {
            this.defines['USE_LOGDEPTHBUF_EXT'] = 1;
        }

        this.createImpostorShaderSphere("SphereImpostor");
        this.createImpostorShaderCylinder("CylinderImpostor");
        //this.createImpostorShaderCylinder("HyperballStickImpostor");
    };

    iCn3D.prototype.draw = function () { var me = this;
        this.rebuildScene();

        // Impostor display using the saved arrays
        if(this.bImpo) {
            this.drawImpostorShader();
        }

        this.applyPrevColor();

        //if(this.bSSOnly) this.drawHelixBrick(this.molid2ss, this.molid2color);

        if(this.bAssembly) {
            this.drawSymmetryMates2();
        }

        // show the hAtoms
        if(this.hAtoms !== undefined && Object.keys(this.hAtoms).length > 0 && Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
            this.removeHighlightObjects();
            if(this.bShowHighlight === undefined || this.bShowHighlight) this.addHighlightObjects();
        }

        if(this.bRender === true) {
          this.applyTransformation(this._zoomFactor, this.mouseChange, this.quaternion);
          this.render();

          // reset to hide the side chain
          //this.opts['sidec'] = 'nothing';
        }

        this.clearImpostors();
    };

    iCn3D.prototype.clearImpostors = function () {
        this.posArray = [];
        this.colorArray = [];
        this.pos2Array = [];
        this.color2Array = [];
        this.radiusArray = [];

        this.posArraySphere = [];
        this.colorArraySphere = [];
        this.radiusArraySphere = [];
    };

    // change the display atom when alternating
    iCn3D.prototype.alternateStructures = function () {
        this.dAtoms = {};

        var hAtomsCount = Object.keys(this.hAtoms).length;
        var allAtomsCount = Object.keys(this.atoms).length;

        var moleculeArray = Object.keys(this.strucs);
        for(var i = 0, il = moleculeArray.length; i < il; ++i) {
            var structure = moleculeArray[i];
            if(i > this.ALTERNATE_STRUCTURE || (this.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
                for(var k in this.strucs[structure]) {
                    var chain = this.strucs[structure][k];
                    this.dAtoms = this.unionHash(this.dAtoms, this.chns[chain]);
                }

                this.ALTERNATE_STRUCTURE = i;
                break;
            }
        }

        if(hAtomsCount < allAtomsCount) {
            this.dAtoms = this.intHash(this.dAtoms, this.hAtoms);

            this.bShowHighlight = false;
            this.opts['rotationcenter'] = 'highlight center';
        }

        // also alternating the surfaces
        this.removeSurfaces();
        this.applySurfaceOptions();

        this.draw();

        this.bShowHighlight = true;
        this.opts['rotationcenter'] = 'molecule center';
    };
