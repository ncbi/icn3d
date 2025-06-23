/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ApplyMissingRes {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyMissingResOptions(options) { let ic = this.icn3d, me = ic.icn3dui;
        if(options === undefined) options = ic.opts;

        if(!ic.bCalcMissingRes) {
            // find all bonds to chemicals
            ic.missingResPnts = {};
            ic.missingResResid2serial = {};

            this.applyMissingResOptions_base();

            ic.bCalcMissingRes = true;
        }

        ic.lines['missingres'] = [];

        if(ic.structures) {
            let strucArray = Object.keys(ic.structures);
            for(let i = 0, il = strucArray.length; i < il; ++i) {
                 let struc = strucArray[i];
                 if(!ic.missingResPnts[struc]) continue;

                 for(let j = 0, jl = ic.missingResPnts[struc].length; j < jl; j += 2) {
                    let resid0 = ic.missingResPnts[struc][j];
                    let resid1 = ic.missingResPnts[struc][j+1];

                    let line = {};
                    
                    line.dashed = true;

                    line.serial1 = ic.missingResResid2serial[resid0 + ',' + resid1];
                    line.serial2 = ic.missingResResid2serial[resid1 + ',' + resid0];

                    line.color = "#" + ic.atoms[line.serial1].color.getHexString();

                    line.radius = ic.coilWidth;

                    if(!ic.dAtoms.hasOwnProperty(line.serial1) || !ic.dAtoms.hasOwnProperty(line.serial2)) continue;

                    line.position1 = ic.atoms[line.serial1].coord;
                    line.position2 = ic.atoms[line.serial2].coord;

                    ic.lines['missingres'].push(line);
                } // for j
            } // for i
        } // if
    }

    applyMissingResOptions_base(type) { let ic = this.icn3d, me = ic.icn3dui;
        let misingResArray = [];
        for(let chainid in ic.chainsSeq) {
            let bStart = false;
            let startResid, currResid, prevResid;
            let bCurrCoord, bPrevCoord = false;
            for(let i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
                currResid = chainid + '_' + ic.chainsSeq[chainid][i].resi;

                if(ic.residues.hasOwnProperty(currResid)) {
                    bStart = true;

                    bCurrCoord = true;
                }
                else {
                    bCurrCoord = false;
                }

                if(!bCurrCoord && bPrevCoord) {
                    startResid = prevResid;
                }
                else if(bStart && startResid && bCurrCoord && !bPrevCoord) {
                    misingResArray.push(startResid);
                    misingResArray.push(currResid);

                    startResid = undefined;
                }

                bPrevCoord = bCurrCoord;
                prevResid = currResid;
            }
        }

        for(let i = 0, il = misingResArray.length; i < il; i += 2) {
            let resid0 = misingResArray[i];
            let resid1 = misingResArray[i + 1];

            let structure = resid0.substr(0, resid0.indexOf('_'));
            let structure1 = resid0.substr(0, resid1.indexOf('_'));

            let atom0 = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid0]);
            let atom1 = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid1]);

            // one residue may have different atom for different clbond
            if(atom0 && atom1) {
                if(ic.missingResPnts[structure] === undefined) ic.missingResPnts[structure] = [];
                ic.missingResPnts[structure].push(resid0);
                ic.missingResPnts[structure].push(resid1);

                ic.missingResResid2serial[resid0 + ',' + resid1] = atom0.serial;
                ic.missingResResid2serial[resid1 + ',' + resid0] = atom1.serial;
            }
        } // for i
    }
}

export {ApplyMissingRes}
