/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setAtmClr = function(atoms, hex) {
    for (var i in atoms) {
        var atom = this.atoms[i];
        atom.color = new THREE.Color().setHex(hex);

        this.atomPrevColors[i] = atom.color;
    }
};

iCn3D.prototype.updateChainsColor = function (atom) {
    var chainid = atom.structure + '_' + atom.chain;
    if(this.chainsColor[chainid] !== undefined) {  // for mmdbid and align input
        this.chainsColor[chainid] = atom.color;
    }
};

iCn3D.prototype.setMmdbChainColor = function (inAtoms) {
    var atoms = (inAtoms === undefined) ? this.hAtoms : inAtoms;
    this.applyOriginalColor(this.hash2Atoms(atoms));

    // atom color
    var atomHash = this.unionHash(this.chemicals, this.ions);

    for (var i in atomHash) {
        var atom = this.atoms[i];
        atom.color = this.atomColors[atom.elem] || this.defaultAtomColor;

        this.atomPrevColors[i] = atom.color;
    }
};

iCn3D.prototype.setConservationColor = function (atoms, bIdentity) {
/*
    for (var i in atoms) {
        var atom = this.atoms[i];
        atom.color = this.defaultAtomColor;

        this.atomPrevColors[i] = atom.color;
    }
*/
    this.setMmdbChainColor(atoms);

    for(var chainid in this.alnChainsSeq) {
        var resObjectArray = this.alnChainsSeq[chainid];

        for(var i = 0, il = resObjectArray.length; i < il; ++i) {
            var residueid = chainid + '_' + resObjectArray[i].resi;

            for(var j in this.residues[residueid]) {
                if(atoms.hasOwnProperty(j)) {
                    var color = (bIdentity) ? new THREE.Color(resObjectArray[i].color) : new THREE.Color(resObjectArray[i].color2);
                    this.atoms[j].color = color;
                    this.atomPrevColors[j] = color;
                }
            }
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
            //var lastTerSerialInv = 1 / this.cnt;
            var cnt = 0;
            for (var i in atoms) {
                var atom = this.atoms[i];
                if(!atom.het) ++cnt;
            }

            var lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i in atoms) {
                var atom = this.atoms[i];
                //atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : new THREE.Color().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : new THREE.Color().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                this.atomPrevColors[i] = atom.color;
            }
            break;
        case 'chain':
            if(this.chainsColor !== undefined && Object.keys(this.chainsColor).length > 0) { // mmdb input
                this.setMmdbChainColor();
            }
            else {
                var index = -1, prevChain = '', colorLength = this.stdChainColors.length;
                for (var i in atoms) {
                    var atom = this.atoms[i];

                    if(atom.chain != prevChain) {
                        ++index;

                        index = index % colorLength;
                    }

                    //if(atom.color === undefined) atom.color = this.stdChainColors[index];
                    atom.color = this.stdChainColors[index];

                    if(Object.keys(this.chainsColor).length > 0) this.updateChainsColor(atom);
                    this.atomPrevColors[i] = atom.color;

                    prevChain = atom.chain;
                }
            }
            break;

        case 'domain':
            var idx = 0, cnt = 0;
            var domainArray = Object.keys(this.tddomains);
            cnt = domainArray.length;
            var lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i = 0, il = domainArray.length; i < il; ++i) {
                var color = new THREE.Color().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                for(var resid in this.tddomains[domainArray[i]]) {
                    for(var serial in this.residues[resid]) {
                        var atom = this.atoms[serial];
                        atom.color = color;
                        this.atomPrevColors[serial] = atom.color;
                    }
                }
            }
            break;

        case 'secondary structure green':
            this.sheetcolor = 'green';
            for (var i in atoms) {
                var atom = this.atoms[i];
                // secondary color of nucleotide: blue (new THREE.Color(0x0000FF))
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors[atom.ss] || new THREE.Color(0xFF00FF);

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'secondary structure yellow':
        case 'secondary structure':
            this.sheetcolor = 'yellow';
            for (var i in atoms) {
                var atom = this.atoms[i];
                // secondary color of nucleotide: blue (new THREE.Color(0x0000FF))
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors2[atom.ss] || new THREE.Color(0xFF00FF);

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'secondary structure spectrum':
            var idx = 0, cnt = 0;

            var ssArray = [], coilArray = [];
            var prevI = -9999, start;
            var prevAtom;
            for (var i in atoms) {
                // only for proteins
                if(!this.proteins.hasOwnProperty(i)) continue;

                var atom = this.atoms[i];

                if(prevI == -9999) start = parseInt(i);

                if(prevI != -9999 && (atom.ss != prevAtom.ss || Math.abs(atom.resi - prevAtom.resi) > 1 || (atom.ssbegin && prevAtom.ssend) ) ) {
                    if(prevAtom.ss == 'coil') {
                        coilArray.push([start, prevI]);
                    }
                    else {
                        ssArray.push([start, prevI]);
                    }
                    start = i;
                }

                prevI = parseInt(i);
                prevAtom = atom;
            }

            if(prevAtom.ss == 'coil') {
                coilArray.push([start, prevI]);
            }
            else {
                ssArray.push([start, prevI]);
            }

            cnt = ssArray.length;
            var lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i = 0, il = ssArray.length; i < il; ++i) {
                //var color = new THREE.Color().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                var color = new THREE.Color().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                for(var serial = ssArray[i][0]; serial <= ssArray[i][1]; ++serial) {
                    var atom = this.atoms[serial];
                    atom.color = color;
                    this.atomPrevColors[serial] = atom.color;
                }
            }

            var color = this.ssColors2['coil']
            for (var i = 0, il = coilArray.length; i < il; ++i) {
                for(var serial = coilArray[i][0]; serial <= coilArray[i][1]; ++serial) {
                    var atom = this.atoms[serial];
                    atom.color = color;
                    this.atomPrevColors[serial] = atom.color;
                }
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

        case 'b factor':
/*
            //http://proteopedia.org/wiki/index.php/Disorder
            // < 30: blue; > 60: red; use 45 as the middle value
            if (!this.middB) {
                var minB = 1000, maxB = -1000;
                for (var i in this.atoms) {
                    var atom = this.atoms[i];
                    if (minB > atom.b) minB = atom.b;
                    if (maxB < atom.b) maxB = atom.b;
                }

                if(minB > 30) minB = 30;
                if(maxB < 60) maxB = 60;

                this.middB = 45; //(maxB + minB) * 0.5;
                this.spanBinv1 = (this.middB > minB) ? 1.0 / (this.middB - minB) : 0;
                this.spanBinv2 = (this.middB < maxB) ? 1.0 / (maxB - this.middB) : 0;
            }
*/

            // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
            // Fixed: Middle (white): 50, red: >= 100, blue: 0
            this.middB = 50;
            this.spanBinv1 = 0.02;
            this.spanBinv2 = 0.02;

            for (var i in atoms) {
                var atom = this.atoms[i];
                if(atom.b === undefined || parseInt(atom.b * 1000) == 0) { // invalid b-factor
                    atom.color =  new THREE.Color().setRGB(0, 1, 0);
                }
                else {
                    var b = atom.b;
                    if(b > 100) b = 100;

                    atom.color = b < this.middB ? new THREE.Color().setRGB(1 - (s = (this.middB - b) * this.spanBinv1), 1 - s, 1) : new THREE.Color().setRGB(1, 1 - (s = (b - this.middB) * this.spanBinv2), 1 - s);
                }

                this.atomPrevColors[i] = atom.color;
            }
            break;

        case 'b factor percentile':
            //http://proteopedia.org/wiki/index.php/Disorder
            // percentile normalize B-factor values from 0 to 1
            var minB = 1000, maxB = -1000;
            if (!this.bfactorArray) {
                this.bfactorArray = [];
                for (var i in this.atoms) {
                    var atom = this.atoms[i];
                    if (minB > atom.b) minB = atom.b;
                    if (maxB < atom.b) maxB = atom.b;

                    this.bfactorArray.push(atom.b);
                }

                this.bfactorArray.sort(function(a, b) { return a - b; });
            }

            var totalCnt = this.bfactorArray.length;
            for (var i in atoms) {
                var atom = this.atoms[i];
                if(atom.b === undefined || parseInt(atom.b * 1000) == 0 || this.bfactorArray.length == 0) { // invalid b-factor
                    atom.color =  new THREE.Color().setRGB(0, 1, 0);
                }
                else {
                    var percentile = this.bfactorArray.indexOf(atom.b) / totalCnt;

                    atom.color = percentile < 0.5 ? new THREE.Color().setRGB(percentile * 2, percentile * 2, 1) : new THREE.Color().setRGB(1, (1 - percentile) * 2, (1 - percentile) * 2);
                }

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'identity':
            this.setConservationColor(atoms, true);
            break;

        case 'conserved': // backward-compatible, "conserved" was changed to "identity"
            this.setConservationColor(atoms, true);
            break;

        case 'conservation':
            this.setConservationColor(atoms, false);
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

iCn3D.prototype.applyDisplayOptions = function (options, atoms, bHighlight) { var me = this; // atoms: hash of key -> 1
    if(options === undefined) options = this.opts;

    var residueHash = {};
    var singletonResidueHash = {};
    var atomsObj = {};
    var residueid;

    if(bHighlight === 1 && Object.keys(atoms).length < Object.keys(this.atoms).length) {
        atomsObj = this.hash2Atoms(atoms);

        //for(var i in atomsObj) {
        //    var atom = atomsObj[i];

        //    residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        //    residueHash[residueid] = 1;
        //}

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
                //var atom = this.getFirstAtomObj(this.residues[residueid]);
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

//        var currentCalphas = {};
//        if(this.opts['sidec'] !== 'nothing') {
//            currentCalphas = this.intHash(this.hAtoms, this.calphas);
//        }

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

/*
        bOnlySideChains = true;

        for(var i in this.hAtoms) {
            if(this.atoms[i].name == 'CA') {
                bOnlySideChains = false;
                break;
            }
        }
*/
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
        this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius, undefined, bHighlight, undefined);
      }
      else if(style === 'ball and stick') {
        this.createStickRepresentation(this.hash2Atoms(atomHash), this.cylinderRadius, this.cylinderRadius * 0.5, this.dotSphereScale, bHighlight, undefined);
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

iCn3D.prototype.hideLabels = function () { var me = this;
    // remove previous labels
    if(this.mdl !== undefined) {
        for(var i = 0, il = this.mdl.children.length; i < il; ++i) {
             var mesh = this.mdl.children[i];
             if(mesh !== undefined && mesh.type === 'Sprite') {
                 this.mdl.remove(mesh); // somehow didn't work
             }
        }
    }
};

iCn3D.prototype.setStyle2Atoms = function (atoms) {
      this.style2atoms = {};

      for(var i in atoms) {
        // do not show water in assemly
        //if(this.bAssembly && this.water.hasOwnProperty(i)) {
        //    this.atoms[i].style = 'nothing';
        //}

        if(this.style2atoms[this.atoms[i].style] === undefined) this.style2atoms[this.atoms[i].style] = {};

        this.style2atoms[this.atoms[i].style][i] = 1;

        // side chains
        if(this.atoms[i].style2 !== undefined && this.atoms[i].style2 !== 'nothing') {
            if(this.style2atoms[this.atoms[i].style2] === undefined) this.style2atoms[this.atoms[i].style2] = {};

            this.style2atoms[this.atoms[i].style2][i] = 1;
        }
      }

/*
      for(var i in this.atoms) {
          if(atoms.hasOwnProperty(i)) {
            if(this.style2atoms[this.atoms[i].style] === undefined) this.style2atoms[this.atoms[i].style] = {};

            this.style2atoms[this.atoms[i].style][i] = 1;

            // side chains
            if(this.style2atoms[this.atoms[i].style2] === undefined) this.style2atoms[this.atoms[i].style2] = {};

            this.style2atoms[this.atoms[i].style2][i] = 1;
          }
          else if(this.atoms[i].style == 'schematic') { // always display schematic
            if(this.style2atoms[this.atoms[i].style] === undefined) this.style2atoms[this.atoms[i].style] = {};
            this.style2atoms[this.atoms[i].style][i] = 1;
          }
      }
*/
};

// set atom style when loading a structure
iCn3D.prototype.setAtomStyleByOptions = function (options) {
    if(options === undefined) options = this.opts;

    var selectedAtoms;

    if (options.proteins !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.proteins);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.proteins.toLowerCase();
        }
    }

    // side chain use style2
    if (options.sidec !== undefined && options.sidec !== 'nothing') {
        selectedAtoms = this.intHash(this.hAtoms, this.sidec);
        //var sidec_calpha = this.unionHash(this.calphas, this.sidec);
        //selectedAtoms = this.intHash(this.hAtoms, sidec_calpha);

        for(var i in selectedAtoms) {
          this.atoms[i].style2 = options.sidec.toLowerCase();
        }
    }

    if (options.chemicals !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.chemicals);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.chemicals.toLowerCase();
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
        selectedAtoms = this.intHash(this.hAtoms, this.nucleotides);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.nucleotides.toLowerCase();
        }
    }
};

iCn3D.prototype.rebuildSceneBase = function (options) { var me = this;
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

    this.mdl = new THREE.Object3D();  // regular display
    this.mdlImpostor = new THREE.Object3D();  // Impostor display

    this.scene.add(this.mdl);
    this.scene.add(this.mdlImpostor);

    // highlight on impostors
    this.mdl_ghost = new THREE.Object3D();  // Impostor display
    this.scene_ghost.add(this.mdl_ghost);

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
};

iCn3D.prototype.setCamera = function() {
    this.cam = this.cams[this.opts.camera.toLowerCase()];

    var maxD = this.maxD;

    if(this.cam === this.perspectiveCamera) {
        var bInstance = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > this.maxatomcnt) ? true : false;
        //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 2;
        //var factor = (this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) ? 1 : 3;
        if(bInstance) {
            this.camMaxDFactor = 1;
        }
        else if(this.camMaxDFactorFog !== undefined) {
            this.camMaxDFactor = this.camMaxDFactorFog; // 3
        }
        else {
            this.camMaxDFactor = 2;
        }

        if(this.cam_z > 0) {
          this.cam.position.z = maxD * this.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
        }
        else {
          this.cam.position.z = -maxD * this.camMaxDFactor; // forperspective, the z positionshould be large enough to see the whole molecule
        }

        if(this.opts['slab'] === 'yes') {
            if(bInstance) {
                this.cam.near = 0.1;
            }
            else if(this.camMaxDFactorFog !== undefined) {
                this.cam.near = maxD * this.camMaxDFactorFog - 10; // keep some surrounding residues
            }
            else {
                this.cam.near = maxD * this.camMaxDFactor;
            }
        }
        else {
            this.cam.near = 0.1;
        }
        this.cam.far = 10000;

        this.controls = new THREE.TrackballControls( this.cam, document.getElementById(this.id), this );
    }
    else if (this.cam === this.orthographicCamera){
        if(this.biomtMatrices !== undefined && this.biomtMatrices.length * this.cnt > 10 * this.maxatomcnt) {
            this.cam.right = this.maxD/2 * 1.5;
        }
        else {
            this.cam.right = this.maxD/2 * 2.5;
        }

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

iCn3D.prototype.render = function () {
    this.directionalLight.position.copy(this.cam.position);

    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true

    this.renderer.setPixelRatio( window.devicePixelRatio ); // r71
    this.renderer.render(this.scene, this.cam);
    //this.renderer.render(this.scene_ghost, this.cam);
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

iCn3D.prototype.applyCenterOptions = function (options) {
    if(options === undefined) options = this.opts;

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
};

iCn3D.prototype.setRotationCenter = function (coord) {
   this.setCenter(coord);
};

iCn3D.prototype.applyOriginalColor = function (atoms) {
    if(atoms === undefined) atoms = this.atoms;

    for (var i in atoms) {
        var atom = atoms[i];
        var chainid = atom.structure + '_' + atom.chain;

        if(this.chainsColor.hasOwnProperty(chainid)) {
            atom.color = this.chainsColor[chainid];
        }
        else {
            atom.color = this.atomColors[atom.elem];
            //break;
        }

        this.atomPrevColors[i] = atom.color;
    }
};
