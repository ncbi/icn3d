/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Resid2spec {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    residueids2spec(residueArray) {var ic = this.icn3d, me = ic.icn3dui;
         let spec = "";

         if(residueArray !== undefined){
             let residueArraySorted = residueArray.sort(function(a, b) {
                if(a !== '' && !isNaN(a)) {
                    return parseInt(a) - parseInt(b);
                }
                else {
                    let lastPosA = a.lastIndexOf('_');
                    let lastPosB = b.lastIndexOf('_');
                    if(a.substr(0, lastPosA) < b.substr(0, lastPosB)) return -1;
                    else if(a.substr(0, lastPosA) > b.substr(0, lastPosB)) return 1;
                    else if(a.substr(0, lastPosA) == b.substr(0, lastPosB)) {
                        if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                        else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                        else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                    }
                }
             });
             let prevChain = '', chain, prevResi = 0, resi, lastDashPos, firstDashPos, struturePart, chainPart;
             let startResi;
             let bMultipleStructures =(Object.keys(ic.structures).length == 1) ? false : true;
             for(let j = 0, jl = residueArraySorted.length; j < jl; ++j) {
                 let residueid = residueArraySorted[j];
                 lastDashPos = residueid.lastIndexOf('_');
                 chain = residueid.substr(0, lastDashPos);
                 // allow resi such as 35A
                 //resi = parseInt(residueid.substr(lastDashPos+1));
                 resi = residueid.substr(lastDashPos+1);
                 firstDashPos = prevChain.indexOf('_');
                 struturePart = prevChain.substr(0, firstDashPos);
                 chainPart = prevChain.substr(firstDashPos + 1);

                 // create separate spec for resi such as 100a
                 if(isNaN(resi)) {
                    if(bMultipleStructures) {
                        spec += '$' + struturePart + '.' + chainPart + ':' + resi + ' or ';
                    }
                    else {
                        spec += '.' + chainPart + ':' + resi + ' or ';
                    }

                    continue;
                 }

                 if(prevChain !== chain) {
                     if(j > 0) {
                         if(prevResi === startResi) {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                         }
                     }
                     startResi = resi;
                 }
                 else if(prevChain === chain) {
                     // some residue number could be "35A"
                     //let tmpPrevResi = !isNaN(prevResi) ? parseInt(prevResi) : prevResi;
                     let tmpPrevResi = ic.ParserUtilsCls.getResiNCBI(prevChain, prevResi);
                     //if(resi != parseInt(prevResi) + 1) {
                     //if(resi != tmpPrevResi + 1) {
                     if(ic.ParserUtilsCls.getResiNCBI(chain, resi) != tmpPrevResi + 1) {
                         if(prevResi === startResi) {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + ' or ';
                             }
                         }
                         else {
                             if(bMultipleStructures) {
                                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                             else {
                                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                             }
                         }
                         startResi = resi;
                     }
                 }
                 prevChain = chain;
                 prevResi = resi;
             }
             // last residue
             firstDashPos = prevChain.indexOf('_');
             struturePart = prevChain.substr(0, firstDashPos);
             chainPart = prevChain.substr(firstDashPos + 1);
             if(prevResi === startResi) {
                 if(bMultipleStructures) {
                     spec += '$' + struturePart + '.' + chainPart + ':' + startResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi;
                 }
             }
             else {
                 if(bMultipleStructures) {
                     spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
                 else {
                     spec += '.' + chainPart + ':' + startResi + '-' + prevResi;
                 }
             }
         }

         return spec;
    }

    resi2range(resiArray, bString) {var ic = this.icn3d, me = ic.icn3dui;
        let range = [], rangeStr = '';
    
        // some chains such as 3SN6_R start with residues with high residue numbers, then end with residues with low residue numbers
        // let resiArraySorted = resiArray.sort(function(a, b) {
        //    return parseInt(a) - parseInt(b);
        // });

        let resiArraySorted = resiArray;
        
        let startResi = resiArraySorted[0];
        let prevResi, resi;
        for(let j = 0, jl = resiArraySorted.length; j < jl; ++j) {
            resi = resiArraySorted[j];
    
            if(j != 0 && parseInt(resi) != parseInt(prevResi) + 1) {
                range.push(startResi);
                range.push(prevResi);

                if(rangeStr) rangeStr += ',';
                if(startResi == prevResi) rangeStr += startResi;
                else rangeStr += startResi + '-' + prevResi;

                startResi = resi;
            }
    
            prevResi = resi;
        }
        
        // last residue
        range.push(startResi);
        range.push(prevResi);

        if(rangeStr) rangeStr += ',';
        if(startResi == prevResi) rangeStr += startResi;
        else rangeStr += startResi + '-' + prevResi;

        if(bString) return rangeStr;
        else return range;
    }

    atoms2spec(atomHash) {var ic = this.icn3d, me = ic.icn3dui;
        let spec = "";
        let i = 0;
        let structureHash = {}, chainHash = {}, resiHash = {};

        let atom;
        for(let serial in atomHash) {
            atom = ic.atoms[serial];
            if(i > 0) {
                spec += ' or ';
            }
            spec += '$' + atom.structure + '.' + atom.chain + ':' + atom.resi + '@' + atom.name;

            structureHash[atom.structure] = 1;
            chainHash[atom.structure + '_' + atom.chain] = 1;
            resiHash[atom.structure + '_' + atom.chain + '_' + atom.resi] = 1;

            ++i;
        }

        if(Object.keys(resiHash).length == 1) {
            let tmpStr = '\\$' + atom.structure + '\\.' + atom.chain + ':' + atom.resi;
            spec = spec.replace(new RegExp(tmpStr,'g'), '');
        }
        else if(Object.keys(chainHash).length == 1) {
            let tmpStr = '\\$' + atom.structure + '\\.' + atom.chain;
            spec = spec.replace(new RegExp(tmpStr,'g'), '');
        }
        else if(Object.keys(structureHash).length == 1) {
            let tmpStr = '\\$' + atom.structure;
            spec = spec.replace(new RegExp(tmpStr,'g'), '');
        }

        return spec;
    }

    atoms2residues(atomArray) {var ic = this.icn3d, me = ic.icn3dui;
         let atoms = {};
         for(let j = 0, jl = atomArray.length; j < jl; ++j) {
             atoms[atomArray[j]] = 1;
         }
         //var residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(atoms);
         let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atoms);
         return Object.keys(residueHash);
    }

    atoms2structureArray(atoms) {var ic = this.icn3d, me = ic.icn3dui;
         let structures = {};
         for(let i in atoms) {
             let atom = ic.atoms[i];
             structures[atom.structure] = 1;
         }
         return Object.keys(structures);
    }

    selectProperty(property, from, to) {var ic = this.icn3d, me = ic.icn3dui;
        let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
        if(property == 'positive') {
            let select = ':r,k,h';
            ic.hAtoms = {};
            ic.selByCommCls.selectBySpec(select, select, select);
        }
        else if(property == 'negative') {
            let select = ':d,e';
            ic.hAtoms = {}
            ic.selByCommCls.selectBySpec(select, select, select);
            // add nucleotides
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.nucleotides);
        }
        else if(property == 'hydrophobic') {
            let select = ':w,f,y,l,i,c,m';
            ic.hAtoms = {}
            ic.selByCommCls.selectBySpec(select, select, select);
            // only proteins
            ic.hAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.proteins);
        }
        else if(property == 'polar') {
            let select = ':g,v,s,t,a,n,p,q';
            ic.hAtoms = {}
            ic.selByCommCls.selectBySpec(select, select, select);
            // only proteins
            ic.hAtoms = me.hashUtilsCls.intHash(ic.hAtoms, ic.proteins);
        }
        else if(property == 'b factor') {
            let atoms = me.hashUtilsCls.cloneHash(ic.calphas);
            atoms = me.hashUtilsCls.unionHash(atoms, ic.nucleotidesO3);
            atoms = me.hashUtilsCls.unionHash(atoms, ic.chemicals);
            atoms = me.hashUtilsCls.unionHash(atoms, ic.ions);
            atoms = me.hashUtilsCls.unionHash(atoms, ic.water);
            ic.hAtoms = {}
            for(let i in atoms) {
                let atom = ic.atoms[i];
                if(atom.b >= parseInt(from) && atom.b <= parseInt(to)) {
                    ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[atom.structure + '_' + atom.chain + '_' + atom.resi]);
                }
            }
        }
        else if(property == 'percent out') {
           ic.bCalcArea = true;
           ic.opts.surface = 'solvent accessible surface';
           ic.applyMapCls.applySurfaceOptions();
           ic.bCalcArea = false;
           ic.hAtoms = {}

           for(let resid in ic.resid2area) { // resid: structure_chain_resi_resn
                let pos = resid.lastIndexOf('_');
                let resn = resid.substr(pos + 1);

                if(me.parasCls.residueArea.hasOwnProperty(resn)) {
                    let percent = parseInt(ic.resid2area[resid] / me.parasCls.residueArea[resn] * 100);
                    if(percent >= from && percent <= to) {
                        let residReal = resid.substr(0, pos);
                        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[residReal]);
                    }
                }
           }
        }
        ic.hAtoms = me.hashUtilsCls.intHash(ic.hAtoms, prevHAtoms);
        ic.drawCls.draw();
        ic.hlUpdateCls.updateHlAll();
    }

    //Select the complement of the current selection.
    selectComplement() { let ic = this.icn3d, me = ic.icn3dui;
       let complement = {}
       for(let i in ic.atoms) {
           if(!ic.hAtoms.hasOwnProperty(i)) {
               complement[i] = 1;
           }
       }
       ic.hAtoms = me.hashUtilsCls.cloneHash(complement);
       //ic.highlightResidues(Object.keys(residueHash), Object.keys(chainHash));
       ic.hlUpdateCls.updateHlAll();
    }

    switchHighlightLevel() {var ic = this.icn3d, me = ic.icn3dui;
      if(me.bNode) return;

      let thisClass = this;

      //$(document).bind('keydown', function(e) { let ic = thisClass.icn3d;
      document.addEventListener('keydown', function(e) { let ic = thisClass.icn3d;
        if(e.keyCode === 38) { // arrow up, select upper level of atoms
          e.preventDefault();
          if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList).serial)) {
              ic.pickedAtomList = me.hashUtilsCls.cloneHash(ic.hAtoms);
              //ic.pk = 2;
          }
          thisClass.switchHighlightLevelUp();
          me.htmlCls.clickMenuCls.setLogCmd("highlight level up", true);
        }
        else if(e.keyCode === 40) { // arrow down, select down level of atoms
          e.preventDefault();
          if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList).serial)) {
              ic.pickedAtomList = me.hashUtilsCls.cloneHash(ic.hAtoms);
              //ic.pk = 2;
          }
          thisClass.switchHighlightLevelDown();
          me.htmlCls.clickMenuCls.setLogCmd("highlight level down", true);
        }
      });
    }

    //When users pick an atom, a residue, a strand/helix, a chain, or a structure, they can use upper arrow
    //to increase the highlight level by one, or use down arrow to decrease the highlight level by one. This
    //function switchHighlightLevelUp() increases the highlight level by one.
    switchHighlightLevelUp() {var ic = this.icn3d, me = ic.icn3dui;
      if(me.bNode) return;

      if(!ic.bShift && !ic.bCtrl) ic.hlObjectsCls.removeHlObjects();
      if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = me.hashUtilsCls.cloneHash(ic.hAtoms);
      }
      if(Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = ic.dAtoms;
      }
      if(ic.highlightlevel === 1) { // atom -> residue
          ic.highlightlevel = 2;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
        }
        else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
        }
      }
      else if(ic.highlightlevel === 2) { // residue -> strand
          ic.highlightlevel = 3;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
        }
        else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
        }
      }
      else if(ic.highlightlevel === 3) {
          let atomLevel4;
          if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // strand -> domain
              ic.highlightlevel = 4;
              let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
              atomLevel4 = ic.pickingCls.select3ddomainFromAtom(firstAtom);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = me.hashUtilsCls.cloneHash(atomLevel4);
              }
              else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomLevel4);
              }
          }
          if((me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // strand -> chain
              ic.highlightlevel = 5;
              let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
              else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
          }
      }
      else if(ic.highlightlevel === 4) { // domain -> chain
          ic.highlightlevel = 5;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
          }
          else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
          }
      }
      else if(ic.highlightlevel === 5 || ic.highlightlevel === 6) { // chain -> structure
          ic.highlightlevel = 6;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) ic.hAtoms = {}
          let chainArray = ic.structures[firstAtom.structure];
          for(let i = 0, il = chainArray.length; i < il; ++i) {
              ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[chainArray[i]]);
        }
      }
      ic.hlObjectsCls.addHlObjects();
      ic.hlUpdateCls.updateHlAll();
    }

    //When users pick an atom, a residue, a strand/helix, a chain, or a structure, they can use upper
    //arrow to increase the highlight level by one, or use down arrow to decrease the highlight level
    //by one. This function switchHighlightLevelDown() decreases the highlight level by one.
    switchHighlightLevelDown() {var ic = this.icn3d, me = ic.icn3dui;
      if(me.bNode) return;

      ic.hlObjectsCls.removeHlObjects();
      if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = me.hashUtilsCls.cloneHash(ic.hAtoms);
      }
      if((ic.highlightlevel === 2 || ic.highlightlevel === 1) && Object.keys(ic.pickedAtomList).length === 1) { // residue -> atom
          ic.highlightlevel = 1;
          ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickedAtomList);
        }
        else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickedAtomList);
        }
      }
      else if(ic.highlightlevel === 3) { // strand -> residue
        let residueHash = {}
        for(let i in ic.pickedAtomList) {
            residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residueHash[residueid] = 1;
        }
        if(Object.keys(residueHash).length === 1) {
            ic.highlightlevel = 2;
            let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
            if(!ic.bShift && !ic.bCtrl) {
                ic.hAtoms = me.hashUtilsCls.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
            else {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
        }
      }
      else if(ic.highlightlevel === 4) { // domain -> strand
          ic.highlightlevel = 3;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
          }
          else {
              ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
          }
      }
      else if(ic.highlightlevel === 5) {
          let atomLevel4;
          if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // chain -> domain
              ic.highlightlevel = 4;
              let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
              atomLevel4 = ic.pickingCls.select3ddomainFromAtom(firstAtom);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = me.hashUtilsCls.cloneHash(atomLevel4);
              }
              else {
                  ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomLevel4);
              }
          }
          if((me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // chain -> strand
              ic.highlightlevel = 3;
              let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
              }
              else {
                  ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickingCls.selectStrandHelixFromAtom(firstAtom));
              }
          }
      }
      else if(ic.highlightlevel === 6) { // structure -> chain
          ic.highlightlevel = 5;
          let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = me.hashUtilsCls.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
        }
        else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
        }
      }
      ic.hlObjectsCls.addHlObjects();
      ic.hlUpdateCls.updateHlAll();
    }
}

export {Resid2spec}
