
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
            if(this.chainsColor !== undefined && Object.keys(this.chainsColor).length > 0) { // mmdb input
                this.applyOriginalColor(this.hash2Atoms(this.hAtoms));

                // atom color
                var atomHash = this.unionHash(this.chemicals, this.ions);

                for (var i in atomHash) {
                    var atom = this.atoms[i];
                    atom.color = this.atomColors[atom.elem] || this.defaultAtomColor;

                    this.atomPrevColors[i] = atom.color;
                }
            }
            else {
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
            }
            break;
        case 'secondary structure':
            for (var i in atoms) {
                var atom = this.atoms[i];
                // secondary color of nucleotide: blue (new THREE.Color(0x0000FF))
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors[atom.ss] || new THREE.Color(0x0000FF);

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

            for(var chainid in this.alnChainsSeq) {
                var resObjectArray = this.alnChainsSeq[chainid];

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

                //ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot

                if(atom.style === 'cylinder and plate' && atom.ss === 'helix') { // no way to highlight part of cylinder
                    for(var i in this.residues[residueid]) {
                        var atom = this.atoms[i];
                        var scale = 1.0;
                        this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
                    }
                }
                else if( (atom.style === 'ribbon' && atom.ss === 'coil') || (atom.style === 'strand' && atom.ss === 'coil') || atom.style === 'o3 trace' || atom.style === 'schematic' || atom.style === 'c alpha trace' || atom.style === 'b factor tube' || (atom.style === 'cylinder and plate' && atom.ss !== 'helix') ) {
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
//        if(this.opts['sidec'] !== 'nothing') {
//            currentCalphas = this.intHash(this.hAtoms, this.calphas);
//        }

    var chemicalSchematicRadius = this.cylinderRadius * 0.5;

    // remove schematic labels
    if(this.labels !== undefined) this.labels['schematic'] = undefined;

    for(var style in this.style2atoms) {
      // 14 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
      atomHash = this.style2atoms[style];
      var bPhosphorusOnly = this.isCalphaPhosOnly(this.hash2Atoms(atomHash), "O3'", "O3*");

      if(style === 'ribbon') {
          this.createStrand(this.hash2Atoms(atomHash), 2, undefined, true, undefined, undefined, false, this.ribbonthickness, bHighlight);
      }
      else if(style === 'strand') {
          this.createStrand(this.hash2Atoms(atomHash), null, null, null, null, null, false, undefined, bHighlight);
      }
      else if(style === 'cylinder and plate') {
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

iCn3D.prototype.createImpostorShaderBase = function (shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize) { var me = this;
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

    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.0;

    this.mdlImpostor.add(mesh);

    //this.objects.push(mesh);
};

iCn3D.prototype.createImpostorShaderCylinder = function (shaderName) { var me = this;
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

    var attributeData = {
        "position1": { type: "v3", value: null },
        "color": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "v3", value: null },
        "radius": { type: "f", value: null },
        "mapping": { type: mappingType, value: null }
    };

    this.createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize);
};

iCn3D.prototype.createImpostorShaderSphere = function (shaderName) { var me = this;
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

    var attributeData = {
        "position": { type: "v3", value: null },
        "color": { type: "v3", value: null },
        "radius": { type: "f", value: null },
        "mapping": { type: mappingType, value: null }
    };

    this.createImpostorShaderBase(shaderName, mapping, mappingIndices, data, attributeData, count, mappingSize, mappingIndicesSize, mappingItemSize);
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

    // side chain overwrite the protein style
    if (options.sidec !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.sidec);
        //var sidec_calpha = this.unionHash(this.calphas, this.sidec);
        //selectedAtoms = this.intHash(this.hAtoms, sidec_calpha);

        for(var i in selectedAtoms) {
          this.atoms[i].style = options.sidec.toLowerCase();
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

iCn3D.prototype.render = function () {
    this.directionalLight.position.copy(this.cam.position);

    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true

    this.renderer.setPixelRatio( window.devicePixelRatio ); // r71
    this.renderer.render(this.scene, this.cam);
    //this.renderer.render(this.scene_ghost, this.cam);
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
   this.mdl.position.set(0,0,0);
   this.mdlImpostor.position.set(0,0,0);
   this.mdl_ghost.position.set(0,0,0);

    //this.mdlPicking.position.sub(coord);
    this.mdl.position.sub(coord);
    this.mdlImpostor.position.sub(coord);
    this.mdl_ghost.position.sub(coord);
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
            //atom.color = this.atomColors[atom.elem];
            break;
        }
    }
};
