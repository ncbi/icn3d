/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.setColorByOptions = function (options, atoms, bUseInputColor) {
 if(options !== undefined) {
  if(bUseInputColor) {
    for (var i in atoms) {
        var atom = this.atoms[i];

        this.atomPrevColors[i] = atom.color;
    }
  }
  else if(options.color.indexOf("#") === 0) {
    for (var i in atoms) {
        var atom = this.atoms[i];
        atom.color = this.thr().setStyle(options.color.toLowerCase());

        this.atomPrevColors[i] = atom.color;
    }
  }
  else {
    var idx, cnt, lastTerSerialInv;
    var minB, maxB;

    switch (options.color.toLowerCase()) {
        case 'spectrum':
            idx = 0;
            cnt = 0;
            for (var i in atoms) {
                var atom = this.atoms[i];
                if(!atom.het) ++cnt;
            }

            lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i in atoms) {
                var atom = this.atoms[i];
                //atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.thr().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

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
                    if(!atom.het) {
                        atom.color = this.stdChainColors[index];

                        if(Object.keys(this.chainsColor).length > 0) this.updateChainsColor(atom);
                        this.atomPrevColors[i] = atom.color;
                    }
                    else{
                        atom.color = this.atomColors[atom.elem];
                        this.atomPrevColors[i] = atom.color;
                    }

                    prevChain = atom.chain;
                }
            }
            break;

        case 'domain':
            idx = 0;
            cnt = 0;
            var domainArray = Object.keys(this.tddomains);
            cnt = domainArray.length;
            lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i = 0, il = domainArray.length; i < il; ++i) {
                var color = this.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

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
                // secondary color of nucleotide: blue (this.thr(0x0000FF))
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors[atom.ss] || this.thr(0xFF00FF);

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'secondary structure yellow':
        case 'secondary structure':
            this.sheetcolor = 'yellow';
            for (var i in atoms) {
                var atom = this.atoms[i];
                // secondary color of nucleotide: blue (this.thr(0x0000FF))
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.ssColors2[atom.ss] || this.thr(0xFF00FF);

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'secondary structure spectrum':
            idx = 0;
            cnt = 0;

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
            lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
            for (var i = 0, il = ssArray.length; i < il; ++i) {
                //var color = this.thr().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                var color = this.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

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

        case 'residue custom':
            for (var i in atoms) {
                var atom = this.atoms[i];
                atom.color = atom.het ? this.atomColors[atom.elem] || this.defaultAtomColor : this.customResidueColors[atom.resn] || this.defaultResidueColor;

                this.atomPrevColors[i] = atom.color;
            }
            break;

        case 'align custom':
            // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
            // Fixed: Middle (white): 50, red: >= 100, blue: 0
            middB = 50;
            var spanBinv1 = 0.02;
            var spanBinv2 = 0.02;

            for(var serial in atoms) {
                var chainid = this.atoms[serial].structure + '_' + this.atoms[serial].chain;
                if(this.queryresi2score === undefined || !this.queryresi2score.hasOwnProperty(chainid)) continue;

                //var resi = this.atoms[serial].resi - 1;
                var color;
                //if(this.target2queryHash.hasOwnProperty(resi) && this.target2queryHash[resi] !== -1) { // -1 means gap
                    //var queryresi = this.target2queryHash[resi] + 1;
                    var queryresi = this.atoms[serial].resi;

                    if(this.queryresi2score[chainid].hasOwnProperty(queryresi)) {
                        var b = this.queryresi2score[chainid][queryresi];
                        if(b > 100) b = 100;
                        color = b < middB ? this.thr().setRGB(1 - (s = (middB - b) * spanBinv1), 1 - s, 1) : this.thr().setRGB(1, 1 - (s = (b - middB) * spanBinv2), 1 - s);
                    }
                    else {
                        color = this.defaultAtomColor;
                    }
                //}
                //else {
                //    color = this.defaultAtomColor;
                //}

                this.atoms[serial].color = color;
                this.atomPrevColors[serial] = color;
            }

            //me.updateHlAll();
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
            // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
            // Fixed: Middle (white): 50, red: >= 100, blue: 0
            this.middB = 50;
            this.spanBinv1 = 0.02;
            this.spanBinv2 = 0.02;

            for (var i in atoms) {
                var atom = this.atoms[i];
                if(atom.b === undefined || parseInt(atom.b * 1000) == 0) { // invalid b-factor
                    atom.color =  this.thr().setRGB(0, 1, 0);
                }
                else {
                    var b = atom.b;
                    if(b > 100) b = 100;

                    atom.color = b < this.middB ? this.thr().setRGB(1 - (s = (this.middB - b) * this.spanBinv1), 1 - s, 1) : this.thr().setRGB(1, 1 - (s = (b - this.middB) * this.spanBinv2), 1 - s);
                }

                if(this.bOpm && atom.resn == 'DUM') atom.color = this.atomColors[atom.elem];

                this.atomPrevColors[i] = atom.color;
            }
            break;

        case 'b factor percentile':
            //http://proteopedia.org/wiki/index.php/Disorder
            // percentile normalize B-factor values from 0 to 1
            minB = 1000;
            maxB = -1000;
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
                    atom.color =  this.thr().setRGB(0, 1, 0);
                }
                else {
                    var percentile = this.bfactorArray.indexOf(atom.b) / totalCnt;

                    atom.color = percentile < 0.5 ? this.thr().setRGB(percentile * 2, percentile * 2, 1) : this.thr().setRGB(1, (1 - percentile) * 2, (1 - percentile) * 2);
                }

                this.atomPrevColors[i] = atom.color;
            }

            break;

        case 'area':
            if(this.resid2area === undefined) {
                // calculate area to set up this.resid2area
                var currHAtoms = this.cloneHash(this.hAtoms);

                // calculate area for all
                this.hAtoms = this.cloneHash(this.atoms);

                this.bCalcArea = true;
                this.opts.surface = 'solvent accessible surface';
                this.applySurfaceOptions();
                this.bCalcArea = false;

                this.hAtoms = this.cloneHash(currHAtoms);
            }

            // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
            // Fixed: Middle (white): 50, red: >= 100, blue: 0
            middB = (this.midpercent !== undefined) ? this.midpercent : 35;
            this.spanBinv1 = 0.02;
            this.spanBinv2 = 0.02;

            for (var i in atoms) {
                var atom = this.atoms[i];
                var resid = atom.structure + '_' + atom.chain + '_' + atom.resi + '_' + atom.resn;

                var b = (this.residueArea.hasOwnProperty(atom.resn)) ? this.resid2area[resid] / this.residueArea[atom.resn] * 100 : middB;

                if(b > 100) b = 100;

                atom.color = b < middB ? this.thr().setRGB(1 - (s = (middB - b) * this.spanBinv1), 1 - s, 1) : this.thr().setRGB(1, 1 - (s = (b - middB) * this.spanBinv2), 1 - s);

                if(this.bOpm && atom.resn == 'DUM') atom.color = this.atomColors[atom.elem];

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
                atom.color = this.thr().setStyle("#" + options.color.toLowerCase());

                this.atomPrevColors[i] = atom.color;
            }

            break;
    }
  }
 }
};

iCn3D.prototype.setAtmClr = function(atoms, hex) {
    for (var i in atoms) {
        var atom = this.atoms[i];
        atom.color = this.thr().setHex(hex);

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
    var atomHash;
    atomHash = this.unionHash(atomHash, this.chemicals);
    atomHash = this.unionHash(atomHash, this.ions);

    for (var i in atomHash) {
        var atom = this.atoms[i];
        atom.color = this.atomColors[atom.elem] || this.defaultAtomColor;

        this.atomPrevColors[i] = atom.color;
    }
};

iCn3D.prototype.setConservationColor = function (atoms, bIdentity) {
    this.setMmdbChainColor(atoms);

    for(var chainid in this.alnChainsSeq) {
        var resObjectArray = this.alnChainsSeq[chainid];

        for(var i = 0, il = resObjectArray.length; i < il; ++i) {
            var residueid = chainid + '_' + resObjectArray[i].resi;

            for(var j in this.residues[residueid]) {
                if(atoms.hasOwnProperty(j)) {
                    var color = (bIdentity) ? this.thr(resObjectArray[i].color) : this.thr(resObjectArray[i].color2);
                    this.atoms[j].color = color;
                    this.atomPrevColors[j] = color;
                }
            }
        }
    }
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

iCn3D.prototype.applyPrevColor = function () { var me = this, ic = me.icn3d; "use strict";
    for (var i in this.atoms) {
        var atom = this.atoms[i];
        atom.color = this.atomPrevColors[i];
    }
};
