/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {ApplyMap} from '../surface/applyMap.js';

class SetColor {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Set atom color according to the definition in options (options.color).
    setColorByOptions(options, atoms, bUseInputColor) { let ic = this.icn3d, me = ic.icn3dui;
     if(options !== undefined) {
      if(bUseInputColor) {
        for (let i in atoms) {
            let atom = ic.atoms[i];

            ic.atomPrevColors[i] = atom.color;
        }
      }
      else if(options.color.indexOf("#") === 0) {
        for (let i in atoms) {
            let atom = ic.atoms[i];
            atom.color = me.parasCls.thr().setStyle(options.color.toLowerCase());

            ic.atomPrevColors[i] = atom.color;
        }
      }
      else {
        let idx, cnt, lastTerSerialInv;
        let minB, maxB;

        switch (options.color.toLowerCase()) {
            case 'spectrum':
                idx = 0;
                cnt = 0;
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    if(!atom.het) ++cnt;
                }

                lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    //atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.thr().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                    atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                    ic.atomPrevColors[i] = atom.color;
                }
                break;
            case 'chain':
                if(ic.chainsColor !== undefined && Object.keys(ic.chainsColor).length > 0) { // mmdb input
                    this.setMmdbChainColor();
                }
                else {
                    let index = -1, prevChain = '', colorLength = me.parasCls.stdChainColors.length;
                    for (let i in atoms) {
                        let atom = ic.atoms[i];

                        if(atom.chain != prevChain) {
                            ++index;

                            index = index % colorLength;
                        }

                        //if(atom.color === undefined) atom.color = me.parasCls.stdChainColors[index];
                        if(!atom.het) {
                            atom.color = me.parasCls.stdChainColors[index];

                            if(Object.keys(ic.chainsColor).length > 0) this.updateChainsColor(atom);
                            ic.atomPrevColors[i] = atom.color;
                        }
                        else{
                            atom.color = me.parasCls.atomColors[atom.elem];
                            ic.atomPrevColors[i] = atom.color;
                        }

                        prevChain = atom.chain;
                    }
                }
                break;

            case 'domain':
                idx = 0;
                cnt = 0;
                let domainArray = Object.keys(ic.tddomains);
                cnt = domainArray.length;
                lastTerSerialInv = (cnt > 1) ? 1 / (cnt - 1) : 1;
                for (let i = 0, il = domainArray.length; i < il; ++i) {
                    let color = me.parasCls.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                    for(let resid in ic.tddomains[domainArray[i]]) {
                        for(let serial in ic.residues[resid]) {
                            let atom = ic.atoms[serial];
                            atom.color = color;
                            ic.atomPrevColors[serial] = atom.color;
                        }
                    }
                }
                break;

            case 'secondary structure green':
                ic.sheetcolor = 'green';
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    // secondary color of nucleotide: blue (me.parasCls.thr(0x0000FF))
                    atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.ssColors[atom.ss] || me.parasCls.thr(0xFF00FF);

                    ic.atomPrevColors[i] = atom.color;
                }

                break;

            case 'secondary structure yellow':
            case 'secondary structure':
                ic.sheetcolor = 'yellow';
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    // secondary color of nucleotide: blue (me.parasCls.thr(0x0000FF))
                    atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.ssColors2[atom.ss] || me.parasCls.thr(0xFF00FF);

                    ic.atomPrevColors[i] = atom.color;
                }

                break;

            case 'secondary structure spectrum':
                idx = 0;
                cnt = 0;

                let ssArray = [], coilArray = [];
                let prevI = -9999, start;
                let prevAtom;
                for (let i in atoms) {
                    // only for proteins
                    if(!ic.proteins.hasOwnProperty(i)) continue;

                    let atom = ic.atoms[i];

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
                for (let i = 0, il = ssArray.length; i < il; ++i) {
                    //var color = me.parasCls.thr().setHSL(2 / 3 * (1 - idx++ * lastTerSerialInv), 1, 0.45);
                    let color = me.parasCls.thr().setHSL(3 / 4 * (1 - idx++ * lastTerSerialInv), 1, 0.45);

                    for(let serial = ssArray[i][0]; serial <= ssArray[i][1]; ++serial) {
                        let atom = ic.atoms[serial];
                        atom.color = color;
                        ic.atomPrevColors[serial] = atom.color;
                    }
                }

                // keep the color of coils untouched
/*
                let color = me.parasCls.ssColors2['coil']
                for (let i = 0, il = coilArray.length; i < il; ++i) {
                    for(let serial = coilArray[i][0]; serial <= coilArray[i][1]; ++serial) {
                        let atom = ic.atoms[serial];
                        atom.color = color;
                        ic.atomPrevColors[serial] = atom.color;
                    }
                }
*/
                break;

            case 'residue':
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.residueColors[atom.resn] || me.parasCls.defaultResidueColor;

                    ic.atomPrevColors[i] = atom.color;
                }
                break;

            case 'residue custom':
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : ic.customResidueColors[atom.resn] || me.parasCls.defaultResidueColor;

                    ic.atomPrevColors[i] = atom.color;
                }
                break;

            case 'align custom':
                // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
                // Fixed: Middle (white): 50, red: >= 100, blue: 0
                ic.middB = 50;
                ic.spanBinv1 = 0.02;
                ic.spanBinv2 = 0.02;

                for(let serial in atoms) {
                    let chainid = ic.atoms[serial].structure + '_' + ic.atoms[serial].chain;
                    if(ic.queryresi2score === undefined || !ic.queryresi2score.hasOwnProperty(chainid)) continue;

                    //var resi = ic.atoms[serial].resi - 1;
                    let color;
                    //if(ic.target2queryHash.hasOwnProperty(resi) && ic.target2queryHash[resi] !== -1) { // -1 means gap
                        //var queryresi = ic.target2queryHash[resi] + 1;
                        //var queryresi = ic.atoms[serial].resi;
                    let queryresi = ic.atoms[serial].resi;

                    if(ic.queryresi2score[chainid].hasOwnProperty(queryresi)) {
                        let b = ic.queryresi2score[chainid][queryresi];

                        if(b > 100) b = 100;

                        let s1 = (ic.middB - b) * ic.spanBinv1;
                        let s2 = (b - ic.middB) * ic.spanBinv2;
                        if(b < ic.middB) {
                            if(ic.startColor == 'blue') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1 - s1, 1 - s1, 1) : me.parasCls.thr().setRGB(0, 0, s1);
                            }
                            else if(ic.startColor == 'red') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1, 1 - s1, 1 - s1) : me.parasCls.thr().setRGB(s1, 0, 0);
                            }
                            else if(ic.startColor == 'green') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1 - s1, 1, 1 - s1) : me.parasCls.thr().setRGB(0, s1, 0);
                            }
                        }
                        else {
                            if(ic.endColor == 'red') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1, 1 - s2, 1 - s2) : me.parasCls.thr().setRGB(s2, 0, 0);
                            }
                            else if(ic.endColor == 'green') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1 - s2, 1, 1 - s2) : me.parasCls.thr().setRGB(0, s2, 0);
                            }
                            else if(ic.endColor == 'blue') {
                                color = (ic.midColor == 'white') ? me.parasCls.thr().setRGB(1 - s2, 1 - s2, 1) : me.parasCls.thr().setRGB(0, 0, s2);
                            }
                        }
                    }
                    else {
                        color = me.parasCls.defaultAtomColor;
                    }
                    //}
                    //else {
                    //    color = me.parasCls.defaultAtomColor;
                    //}

                    ic.atoms[serial].color = color;
                    ic.atomPrevColors[serial] = color;
                }

                //ic.updateHlAll();
                break;

            case 'charge':
                for (let i in atoms) {
                    let atom = ic.atoms[i];

                    //atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.chargeColors[atom.resn] || me.parasCls.defaultResidueColor;
                    atom.color = atom.het ? me.parasCls.defaultAtomColor : me.parasCls.chargeColors[atom.resn] || me.parasCls.defaultResidueColor;

                    ic.atomPrevColors[i] = atom.color;
                }
                break;
            case 'hydrophobic':
                for (let i in atoms) {
                    let atom = ic.atoms[i];

                    //atom.color = atom.het ? me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor : me.parasCls.chargeColors[atom.resn] || me.parasCls.defaultResidueColor;
                    atom.color = atom.het ? me.parasCls.defaultAtomColor : me.parasCls.hydrophobicColors[atom.resn] || me.parasCls.defaultResidueColor;

                    ic.atomPrevColors[i] = atom.color;
                }
                break;
            case 'atom':
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    atom.color = me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor;

                    ic.atomPrevColors[i] = atom.color;
                }
                break;

            case 'b factor':
                // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
                // Fixed: Middle (white): 50, red: >= 100, blue: 0
                ic.middB = 50;
                ic.spanBinv1 = 0.02;
                ic.spanBinv2 = 0.02;

                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    if(atom.b === undefined || parseInt(atom.b * 1000) == 0) { // invalid b-factor
                        atom.color =  me.parasCls.thr().setRGB(0, 1, 0);
                    }
                    else {
                        let b = atom.b;
                        if(b > 100) b = 100;

                        let s1 = (ic.middB - b) * ic.spanBinv1;
                        let s2 = (b - ic.middB) * ic.spanBinv2;

                        atom.color = b < ic.middB ? me.parasCls.thr().setRGB(1 - s1, 1 - s1, 1) : me.parasCls.thr().setRGB(1, 1 - s2, 1 - s2);
                    }

                    if(ic.bOpm && atom.resn == 'DUM') atom.color = me.parasCls.atomColors[atom.elem];

                    ic.atomPrevColors[i] = atom.color;
                }
                break;

            case 'b factor percentile':
                //http://proteopedia.org/wiki/index.php/Disorder
                // percentile normalize B-factor values from 0 to 1
                minB = 1000;
                maxB = -1000;
                if (!ic.bfactorArray) {
                    ic.bfactorArray = [];
                    for (let i in ic.atoms) {
                        let atom = ic.atoms[i];
                        if (minB > atom.b) minB = atom.b;
                        if (maxB < atom.b) maxB = atom.b;

                        ic.bfactorArray.push(atom.b);
                    }

                    ic.bfactorArray.sort(function(a, b) { return a - b; });
                }

                let totalCnt = ic.bfactorArray.length;
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    if(atom.b === undefined || parseInt(atom.b * 1000) == 0 || ic.bfactorArray.length == 0) { // invalid b-factor
                        atom.color =  me.parasCls.thr().setRGB(0, 1, 0);
                    }
                    else {
                        let percentile = ic.bfactorArray.indexOf(atom.b) / totalCnt;

                        atom.color = percentile < 0.5 ? me.parasCls.thr().setRGB(percentile * 2, percentile * 2, 1) : me.parasCls.thr().setRGB(1, (1 - percentile) * 2, (1 - percentile) * 2);
                    }

                    ic.atomPrevColors[i] = atom.color;
                }

                break;

            case 'area':
                if(ic.resid2area === undefined) {
                    // calculate area to set up ic.resid2area
                    let currHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

                    // calculate area for all
                    ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);

                    ic.bCalcArea = true;
                    ic.opts.surface = 'solvent accessible surface';
                    ic.applyMapCls.applySurfaceOptions();
                    ic.bCalcArea = false;

                    ic.hAtoms = me.hashUtilsCls.cloneHash(currHAtoms);
                }

                // http://proteopedia.org/wiki/index.php/Temperature_color_schemes
                // Fixed: Middle (white): 50, red: >= 100, blue: 0
                let middB = (ic.midpercent !== undefined) ? ic.midpercent : 35;
                ic.spanBinv1 = 0.02;
                ic.spanBinv2 = 0.02;

                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    let resid = atom.structure + '_' + atom.chain + '_' + atom.resi + '_' + atom.resn;

                    let b = (me.parasCls.residueArea.hasOwnProperty(atom.resn)) ? ic.resid2area[resid] / me.parasCls.residueArea[atom.resn] * 100 : middB;

                    if(b > 100) b = 100;

                    let s1 = (middB - b) * ic.spanBinv1;
                    let s2 = (b - middB) * ic.spanBinv2;

                    atom.color = b < middB ? me.parasCls.thr().setRGB(1 - s1, 1 - s1, 1) : me.parasCls.thr().setRGB(1, 1 - s2, 1 - s2);

                    if(ic.bOpm && atom.resn == 'DUM') atom.color = me.parasCls.atomColors[atom.elem];

                    ic.atomPrevColors[i] = atom.color;
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
                for (let i in atoms) {
                    let atom = ic.atoms[i];
                    atom.color = me.parasCls.thr().setStyle("#" + options.color.toLowerCase());

                    ic.atomPrevColors[i] = atom.color;
                }

                break;
        }
      }
     }
    }

    setAtmClr(atoms, hex) { let ic = this.icn3d, me = ic.icn3dui;
        for (let i in atoms) {
            let atom = ic.atoms[i];
            atom.color = me.parasCls.thr().setHex(hex);

            ic.atomPrevColors[i] = atom.color;
        }
    }

    updateChainsColor(atom) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid = atom.structure + '_' + atom.chain;
        if(ic.chainsColor[chainid] !== undefined) {  // for mmdbid and align input
            ic.chainsColor[chainid] = atom.color;
        }
    }

    setMmdbChainColor(inAtoms) { let ic = this.icn3d, me = ic.icn3dui;
        let atoms = (inAtoms === undefined) ? ic.hAtoms : inAtoms;
        this.applyOriginalColor(me.hashUtilsCls.hash2Atoms(atoms, ic.atoms));

        // atom color
        let atomHash;
        atomHash = me.hashUtilsCls.unionHash(atomHash, ic.chemicals);
        atomHash = me.hashUtilsCls.unionHash(atomHash, ic.ions);

        for (let i in atomHash) {
            let atom = ic.atoms[i];
            atom.color = me.parasCls.atomColors[atom.elem] || me.parasCls.defaultAtomColor;

            ic.atomPrevColors[i] = atom.color;
        }
    }

    setConservationColor(atoms, bIdentity) { let ic = this.icn3d, me = ic.icn3dui;
        this.setMmdbChainColor(atoms);

        for(let chainid in ic.alnChainsSeq) {
            let resObjectArray = ic.alnChainsSeq[chainid];

            for(let i = 0, il = resObjectArray.length; i < il; ++i) {
                let residueid = chainid + '_' + resObjectArray[i].resi;

                for(let j in ic.residues[residueid]) {
                    if(atoms.hasOwnProperty(j)) {
                        let color = (bIdentity) ? me.parasCls.thr(resObjectArray[i].color) : me.parasCls.thr(resObjectArray[i].color2);
                        ic.atoms[j].color = color;
                        ic.atomPrevColors[j] = color;
                    }
                }
            }
        }
    }

    applyOriginalColor(atoms) { let ic = this.icn3d, me = ic.icn3dui;
        if(atoms === undefined) atoms = ic.atoms;

        for (let i in atoms) {
            let atom = atoms[i];
            let chainid = atom.structure + '_' + atom.chain;

            if(ic.chainsColor.hasOwnProperty(chainid)) {
                atom.color = ic.chainsColor[chainid];
            }
            else {
                atom.color = me.parasCls.atomColors[atom.elem];
                //break;
            }

            ic.atomPrevColors[i] = atom.color;
        }
    }

    applyPrevColor() { let ic = this.icn3d, me = ic.icn3dui;
        for (let i in ic.atoms) {
            let atom = ic.atoms[i];
            atom.color = ic.atomPrevColors[i];
        }
    }

    //Set the outline color when highlighting atoms. The available options are "yellow", "green", and "red".
    setOutlineColor(colorStr) { let ic = this.icn3d, me = ic.icn3dui;
        // outline using ShaderMaterial: http://jsfiddle.net/Eskel/g593q/9/
        let shader = {
            'outline' : {
                vertex_shader: [
                    "uniform float offset;",
                    "void main() {",
                        "vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );",
                        "gl_Position = projectionMatrix * pos;",
                    "}"
                ].join("\n"),

                fragment_shader: [
                    "void main(){",
                        "gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );",
                    "}"
                ].join("\n")
            }
        };

        if(colorStr === 'yellow') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }
        else if(colorStr === 'green') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 0.0, 1.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }
        else if(colorStr === 'red') {
           shader.outline.fragment_shader = [
               "void main(){",
                   "gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );",
               "}"
           ].join("\n");
        }

        // shader
        let uniforms = {offset: {
            type: "f",
            //value: 1
            value: 0.5
          }
        };

        let outShader = shader['outline'];

        let matShader = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: outShader.vertex_shader,
            fragmentShader: outShader.fragment_shader,
            depthTest: false,
            depthWrite: false,
            //needsUpdate: true
        });

        return matShader;
    }
}

export {SetColor}
