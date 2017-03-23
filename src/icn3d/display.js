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

            if(this.chainsColor.hasOwnProperty(chainid)) {
                atom.color = this.chainsColor[chainid];
            }
            else {
                atom.color = this.atomColors[atom.elem];
            }
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

                    if(Object.keys(this.chainsColor).length > 0) this.updateChainsColor(atom);
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

                for(var chainid in this.alignChainsSeq) {
                    var resObjectArray = this.alignChainsSeq[chainid];

                    for(var i = 0, il = resObjectArray.length; i < il; ++i) {
                        var residueid = chainid + '_' + resObjectArray[i].resi;

                        for(var j in this.residues[residueid]) {
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
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0xFFFFFF);

                    this.atomPrevColors[i] = atom.color;
                }
                break;

            case 'grey':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0x888888);

                    this.atomPrevColors[i] = atom.color;
                }
                break;


            case 'red':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0xFF0000);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'green':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0x00FF00);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'blue':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0x0000FF);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'magenta':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0xFF00FF);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'yellow':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0xFFFF00);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'cyan':
                for (var i in atoms) {
                    var atom = this.atoms[i];
                    atom.color = new THREE.Color().setHex(0x00FFFF);

                    this.atomPrevColors[i] = atom.color;
                }
                break;
            case 'custom':
                // do the coloring separately
                break;
        }
      }
       }
    };

    iCn3D.prototype.updateChainsColor = function (atom) {
        var chainid = atom.structure + '_' + atom.chain;
        if(this.chainsColor[chainid] !== undefined) {  // for mmdbid and align input
            this.chainsColor[chainid] = atom.color;
        }
    };

    iCn3D.prototype.applyOtherOptions = function (options) {
        if(options === undefined) options = this.options;

        //common part options
        // labels
        this.createLabelRepresentation(this.labels);

        // lines
        //if (options.hbonds.toLowerCase() === 'yes' || options.ncbonds.toLowerCase() === 'yes') {
		if (options.hbonds.toLowerCase() === 'yes') {
            var color = '#00FF00';
            var points = this.hbondpoints;

             for (var i = 0, lim = Math.floor(points.length / 2); i < lim; i++) {
                var line = {};
                line.position1 = points[2 * i];
                line.position2 = points[2 * i + 1];
                line.color = color;
                line.dashed = true;

                if(this.lines['hbond'] === undefined) this.lines['hbond'] = [];
                this.lines['hbond'].push(line);
             }

            //this.createLines(this.lines);
        }

        if (options.ssbonds.toLowerCase() === 'yes') {
            var color = '#FFFF00';
            var colorObj = new THREE.Color(0xFFFF00);

             for (var i = 0, lim = Math.floor(this.ssbondpoints.length / 2); i < lim; i++) {
                var res1 = this.ssbondpoints[2 * i], res2 = this.ssbondpoints[2 * i + 1];

                var line = {};
                line.color = color;
                line.dashed = true;

                var bFound = false;
                for(var j in this.residues[res1]) {
                    if(this.atoms[j].name === 'SG') {
                        line.position1 = this.atoms[j].coord;
                        bFound = true;
                        break;
                    }
                }

                if(!bFound) {
                    for(var j in this.residues[res1]) {
                        if(this.atoms[j].name === 'CA') {
                            line.position1 = this.atoms[j].coord;
                            bFound = true;
                            break;
                        }
                    }
                }

                bFound = false;
                for(var j in this.residues[res2]) {
                    if(this.atoms[j].name === 'SG') {
                        line.position2 = this.atoms[j].coord;
                        bFound = true;
                        break;
                    }
                }

                if(!bFound) {
                    for(var j in this.residues[res2]) {
                        if(this.atoms[j].name === 'CA') {
                            line.position2 = this.atoms[j].coord;
                            bFound = true;
                            break;
                        }
                    }
                }

                if(this.lines['ssbond'] === undefined) this.lines['ssbond'] = [];
                this.lines['ssbond'].push(line);

                // create bonds for disulfide bonds
                this.createCylinder(line.position1, line.position2, this.cylinderRadius * 0.5, colorObj);
             }
        }

        this.createLines(this.lines);

        // surfaces
        for(var i = 0, il = this.prevSurfaces.length; i < il; ++i) {
            this.mdl.add(this.prevSurfaces[i]);
        }

        switch (options.rotationcenter.toLowerCase()) {
            case 'molecule center':
                // move the molecule to the origin
                if(this.center !== undefined) this.mdl.position.sub(this.center);
                break;
            case 'pick center':
                if(this.pickedatom !== undefined) {
                  this.mdl.position.sub(this.pickedatom.coord);
                }
                break;
            case 'display center':
                var center = this.centerAtoms(this.displayAtoms).center;
                this.mdl.position.sub(center);
                break;
            case 'highlight center':
                var center = this.centerAtoms(this.highlightAtoms).center;
                this.mdl.position.sub(center);
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
        switch (options.picking.toLowerCase()) {
            case 'atom':
                this.picking = 1;
                break;
            case 'no':
                this.picking = 0;
                break;
            case 'residue':
                this.picking = 2;
                break;
            case 'strand':
                this.picking = 3;
                break;
        }
    };

    iCn3D.prototype.applySurfaceOptions = function (options) {
        if(options === undefined) options = this.options;

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

        var currAtoms = {};

        currAtoms = this.hash2Atoms(this.highlightAtoms);

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
            case 'nothing':
                // remove surfaces
                this.removeSurfaces();
                break;
        }
    };

    iCn3D.prototype.applyDisplayOptions = function (options, atoms, bHighlight) { // atoms: hash of key -> 1
        if(options === undefined) options = this.options;

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
                    var atom = this.getFirstAtomObj(this.residues[residueid]);
                    var prevResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi - 1);
                    var nextResidueid = atom.structure + '_' + atom.chain + '_' + parseInt(atom.resi + 1);

                    //ribbon, strand, cylinder and plate, nucleotide cartoon, phosphorus trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot

                    if(atom.style === 'cylinder and plate' && atom.ss === 'helix') { // no way to highlight part of cylinder
                        for(var i in this.residues[residueid]) {
                            var atom = this.atoms[i];
                            var scale = 1.0;
                            this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                        }
                    }
                    else if( (atom.style === 'ribbon' && atom.ss === 'coil') || (atom.style === 'strand' && atom.ss === 'coil') || atom.style === 'phosphorus trace' || atom.style === 'schematic' || atom.style === 'c alpha trace' || atom.style === 'b factor tube' || (atom.style === 'cylinder and plate' && atom.ss !== 'helix') ) {
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

//        var currentCalphas = {};
//        if(this.options['sidechains'] !== 'nothing') {
//            currentCalphas = this.intersectHash(this.highlightAtoms, this.calphas);
//        }

        // remove schematic labels
        if(this.labels && this.labels !== undefined) this.labels['schematic'] = [];

        var ligandSchematicRadius = this.cylinderRadius * 0.5;

        for(var style in this.style2atoms) {
          // 14 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, phosphorus trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
          atomHash = this.style2atoms[style];

          if(style === 'ribbon') {
              this.createStrand(this.hash2Atoms(atomHash), 2, undefined, true, undefined, undefined, false, this.thickness, bHighlight);
          }
          else if(style === 'strand') {
              this.createStrand(this.hash2Atoms(atomHash), null, null, null, null, null, false, undefined, bHighlight);
          }
          else if(style === 'cylinder and plate') {
            this.createCylinderHelix(this.hash2Atoms(atomHash), 1.6, bHighlight);
          }
          else if(style === 'nucleotide cartoon') {
            var bPhosphorusOnly = this.isPhosphorusOnly(this.hash2Atoms(atomHash));

            if(bPhosphorusOnly) {
                this.createCylinderCurve(this.hash2Atoms(atomHash), 'P', 0.2, false, bHighlight);
            }
            else {
                this.drawCartoonNucleicAcid(this.hash2Atoms(atomHash), null, this.thickness, bHighlight);

                if(bHighlight !== 2) this.drawNucleicAcidStick(this.hash2Atoms(atomHash), bHighlight);
            }
          }
          else if(style === 'phosphorus trace') {
            this.createCylinderCurve(this.hash2Atoms(atomHash), 'P', 0.2, false, bHighlight);
          }
          else if(style === 'phosphorus lines') {
            this.createCylinderCurve(this.hash2Atoms(atomHash), 'P', 0.2, true, bHighlight);
          }
          else if(style === 'schematic') {
            // either proteins, nucleotides, or ligands
            var firstAtom = this.getFirstAtomObj(atomHash);

            //if(firstAtom.het) { // ligands
            if(this.ligands.hasOwnProperty(firstAtom.serial)) { // ligands
                this.addNonCarbonAtomLabels(this.hash2Atoms(atomHash));

                bSchematic = true;
                this.createStickRepresentation(this.hash2Atoms(atomHash), ligandSchematicRadius, ligandSchematicRadius, undefined, bHighlight, bSchematic);
            }
            else { // nucleotides or proteins
                this.addResiudeLabels(this.hash2Atoms(atomHash), true);

                this.createCylinderCurve(this.hash2Atoms(atomHash), 'P', 0.2, false, bHighlight);
                this.createCylinderCurve(this.hash2Atoms(atomHash), 'CA', 0.2, false, bHighlight);
            }
          }
          else if(style === 'c alpha trace') {
            this.createCylinderCurve(this.hash2Atoms(atomHash), 'CA', 0.2, false, bHighlight);
          }
          else if(style === 'b factor tube') {
            this.createTube(this.hash2Atoms(atomHash), 'CA', null, bHighlight);
          }
          else if(style === 'lines') {
            // add calpha to the side chains for better connectivity
//            if(this.options['sidechains'] === 'lines') {
//                atomHash = this.unionHash(atomHash, currentCalphas);
//            }

            if(bHighlight === 1) {
                this.createStickRepresentation(this.hash2Atoms(atomHash), 0.1, 0.1, undefined, bHighlight);
            }
            else {
                this.createLineRepresentation(this.hash2Atoms(atomHash), bHighlight);
            }
          }
          else if(style === 'stick') {
            // add calpha to the side chains for better connectivity
//            if(this.options['sidechains'] === 'stick') {
//                atomHash = this.unionHash(atomHash, currentCalphas);
//            }

            this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius, undefined, bHighlight);
          }
          else if(style === 'ball and stick') {
            // add calpha to the side chains for better connectivity
//            if(this.options['sidechains'] === 'ball and stick') {
//                atomHash = this.unionHash(atomHash, currentCalphas);
//            }

            this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius * 0.5, 0.3, bHighlight);
          }
          else if(style === 'sphere') {
            this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, undefined, undefined, bHighlight);
          }
          else if(style === 'dot') {
            this.createSphereRepresentation(this.hash2Atoms(atomHash), this.sphereRadius, false, 0.3, bHighlight);
          }

          // do not show highlight if structure is not shown
          /*
          else { // structure not shown, show the highlight
            if(bHighlight === 2) bHighlight === 1;

            if(bHighlight === 1) {
                var atoms = this.hash2Atoms(atomHash);
                var nonHetAtoms = {};
                for(var i in atoms) {
                    var atom = atoms[i];
                    if(atom.het) {
                        var scale = 1.0;
                        this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                    }
                    else {
                        nonHetAtoms[i] = atom;
                    }
                }

                if(Object.keys(nonHetAtoms).length > 0) {
                    this.createStrand(nonHetAtoms, null, null, null, null, null, false, undefined, bHighlight);
                }
            }
          }
          */
        } // end for loop
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
        if(options === undefined) options = this.options;

        var selectedAtoms;

        if (options.proteins !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.proteins);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.proteins.toLowerCase();
            }
        }

        // side chain overwrite the protein style
        if (options.sidechains !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.sidechains);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.sidechains.toLowerCase();
            }
        }

        if (options.ligands !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.ligands);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.ligands.toLowerCase();
            }
        }

        if (options.ions !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.ions);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.ions.toLowerCase();
            }
        }

        if (options.water !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.water);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.water.toLowerCase();
            }
        }

        if (options.nucleotides !== undefined) {
            selectedAtoms = this.intersectHash(this.highlightAtoms, this.nucleotides);
            for(var i in selectedAtoms) {
              this.atoms[i].style = options.nucleotides.toLowerCase();
            }
        }
    };

    iCn3D.prototype.rebuildScene = function (options) { var me = this;
        jQuery.extend(me.options, options);

        this.camera_z = this.maxD * 2;
        //this.camera_z = -this.maxD * 2;


        if(this.scene !== undefined) {
            for(var i = this.scene.children.length - 1; i >= 0; i--) {
                 var obj = this.scene.children[i];
                 this.scene.remove(obj);
            }
        }
        else {
            this.scene = new THREE.Scene();
        }

        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);

        if(this.camera_z > 0) {
          this.directionalLight.position.set(0, 0, 1);
        }
        else {
          this.directionalLight.position.set(0, 0, -1);
        }

        var ambientLight = new THREE.AmbientLight(0x202020);

        this.scene.add(this.directionalLight);
        this.scene.add(ambientLight);

        this.mdl = new THREE.Object3D();

        this.scene.add(this.mdl);

        // related to picking
        this.objects = []; // define objects for picking, not all elements are used for picking
        this.raycaster = new THREE.Raycaster();
        this.projector = new THREE.Projector();
        this.mouse = new THREE.Vector2();

        var background = this.backgroundColors[this.options.background.toLowerCase()];
        if(this.options.background.toLowerCase() === 'transparent') {
        	this.renderer.setClearColor(background, 0);
		}
		else {
			this.renderer.setClearColor(background, 1);
		}
        // apply fog
        if(this.options['fog'] === 'yes') {
            if(this.options['camera'] === 'perspective') {        //perspective, orthographic
                this.scene.fog = new THREE.Fog(background, this.maxD * 2, this.maxD * 2.4);
            }
            else if(this.options['camera'] === 'orthographic') {
                this.scene.fog = new THREE.FogExp2(background, 2);
                this.scene.fog.near = this.maxD * 2;
                this.scene.fog.far = this.maxD * 2.4;
            }
        }
        else {
            this.scene.fog = undefined;
        }

        this.perspectiveCamera = new THREE.PerspectiveCamera(20, this.container.whratio, 0.1, 10000);
        this.perspectiveCamera.position.set(0, 0, this.camera_z);
        this.perspectiveCamera.lookAt(new THREE.Vector3(0, 0, 0));

        this.orthographicCamera = new THREE.OrthographicCamera();
        this.orthographicCamera.position.set(0, 0, this.camera_z);
        this.orthographicCamera.lookAt(new THREE.Vector3(0, 0, 0));

        this.cameras = {
            perspective: this.perspectiveCamera,
            orthographic: this.orthographicCamera,
        };

        this.setCamera();

        this.applyDisplayOptions(this.options, this.displayAtoms);

        this.applyOtherOptions();
    };

    iCn3D.prototype.setCamera = function() {
        this.camera = this.cameras[this.options.camera.toLowerCase()];

        if(this.camera === this.perspectiveCamera) {
            if(this.camera_z > 0) {
              this.camera.position.z = this.maxD * 2; // forperspective, the z positionshould be large enough to see the whole molecule
            }
            else {
              this.camera.position.z = -this.maxD * 2; // forperspective, the z positionshould be large enough to see the whole molecule
            }

            if(this.options['slab'] === 'yes') {
                this.camera.near = this.maxD * 2;
            }
            else {
                this.camera.near = 0.1;
            }
            this.camera.far = 10000;

            this.controls = new THREE.TrackballControls( this.camera, document.getElementById(this.id), this );
        }
        else if (this.camera === this.orthographicCamera){
            this.camera.right = this.maxD/2 * 2.5;
            this.camera.left = -this.camera.right;
            this.camera.top = this.camera.right /this.container.whratio;
            this.camera.bottom = -this.camera.right /this.container.whratio;

              if(this.options['slab'] === 'yes') {
                  this.camera.near = this.maxD * 2;
              }
              else {
                this.camera.near = 0;
              }

              this.camera.far = 10000;

            this.controls = new THREE.OrthographicTrackballControls( this.camera, document.getElementById(this.id), this );
        }

        this.camera.updateProjectionMatrix();
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
        this.directionalLight.position.copy(this.camera.position);

        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true

        this.renderer.setPixelRatio( window.devicePixelRatio ); // r71
        this.renderer.render(this.scene, this.camera);
    };

    iCn3D.prototype.setRotationCenter = function (coord) {
        this.mdl.position.sub(coord);
    };

    iCn3D.prototype.draw = function () {
        this.rebuildScene();

        this.applyPrevColor();

        if(this.bSSOnly) this.drawHelixBrick(this.molid2ss, this.molid2color);

        if(this.bAssembly) this.drawSymmetryMates2();

        // show the highlightAtoms
        if(this.highlightAtoms !== undefined && Object.keys(this.highlightAtoms).length > 0 && Object.keys(this.highlightAtoms).length < Object.keys(this.atoms).length) {
            this.removeHighlightObjects();
            if(this.bShowHighlight === undefined || this.bShowHighlight) this.addHighlightObjects();
        }

        if(this.bRender === true) {
          this.applyTransformation(this._zoomFactor, this.mouseChange, this.quaternion);
          this.render();

          // reset to hide the side chain
          //this.options['sidechains'] = 'nothing';
        }
    };

    iCn3D.prototype.alternateStructures = function () {
        this.displayAtoms = {};

        var highlightAtomsCount = Object.keys(this.highlightAtoms).length;
        var allAtomsCount = Object.keys(this.atoms).length;

        var moleculeArray = Object.keys(this.structures);
        for(var i = 0, il = moleculeArray.length; i < il; ++i) {
            var structure = moleculeArray[i];
            if(i > this.ALTERNATE_STRUCTURE || (this.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
                for(var k in this.structures[structure]) {
                    var chain = this.structures[structure][k];
                    this.displayAtoms = this.unionHash(this.displayAtoms, this.chains[chain]);
                }

                this.ALTERNATE_STRUCTURE = i;
                break;
            }
        }

        if(highlightAtomsCount < allAtomsCount) {
            this.displayAtoms = this.intersectHash(this.displayAtoms, this.highlightAtoms);

            this.bShowHighlight = false;
            this.options['rotationcenter'] = 'highlight center';
        }

        this.draw();

        this.bShowHighlight = true;
        this.options['rotationcenter'] = 'molecule center';
    };


