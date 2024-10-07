/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class SelectByCommand {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Set a custom selection with the "command", its name "commandname" and its description "commanddesc".
    async selectByCommand(select, commandname, commanddesc) { let ic = this.icn3d, me = ic.icn3dui;
           if(select.indexOf('saved atoms') === 0) {
                let pos = 12; // 'saved atoms '
                let strSets = select.substr(pos);

                ic.definedSetsCls.selectCombinedSets(strSets, commandname);
           }
           else {
               let selectTmp = select.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ or and /g, ' and ').replace(/ and /g, ' or and ').replace(/ or not /g, ' not ').replace(/ not /g, ' or not ');

               let commandStr =(selectTmp.trim().substr(0, 6) === 'select') ? selectTmp.trim().substr(7) : selectTmp.trim();

               // each select command may have several commands separated by ' or '
               let commandArray = commandStr.split(' or ');
               let allHighlightAtoms = {};

               for(let i = 0, il = commandArray.length; i < il; ++i) {
                   let command = commandArray[i].trim().replace(/\s+/g, ' ');
                   let pos = command.indexOf(' ');

                   ic.hAtoms = {}

                   if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                      await ic.applyCommandCls.applyCommand('select ' + command.substr(pos + 1));

                      allHighlightAtoms = me.hashUtilsCls.intHash(allHighlightAtoms, ic.hAtoms);
                   }
                   else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                      await ic.applyCommandCls.applyCommand('select ' + command.substr(pos + 1));

                      allHighlightAtoms = me.hashUtilsCls.exclHash(allHighlightAtoms, ic.hAtoms);
                   }
                   else { // union
                      await ic.applyCommandCls.applyCommand('select ' + command);
                      allHighlightAtoms = me.hashUtilsCls.unionHash(allHighlightAtoms, ic.hAtoms);
                   }
               }

               ic.hAtoms = me.hashUtilsCls.cloneHash(allHighlightAtoms);

               let atomArray = Object.keys(ic.hAtoms);
               let residueArray = undefined;

               if(commandname !== "") {
                   ic.selectionCls.addCustomSelection(atomArray, commandname, commanddesc, select, false);

                   let nameArray = [commandname];
                   //ic.changeCustomResidues(nameArray);

                   ic.definedSetsCls.changeCustomAtoms(nameArray);
               }
           }
    }

    selectBySpec(select, commandname, commanddesc, bDisplay, bNoUpdateAll) { let ic = this.icn3d, me = ic.icn3dui;
       select =(select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();
       ic.hAtoms = {};

       // selection definition is similar to Chimera: https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/frameatom_spec.html
       // There will be no ' or ' in the spec. It's already separated in selectByCommand()
       // There could be ' and ' in the spec.
       let commandArray = select.replace(/\s+/g, ' ').replace(/ AND /g, ' and ').split(' and ');
       let residueHash = {}
       let atomHash = {}

       let bSelectResidues = true;
       for(let i = 0, il=commandArray.length; i < il; ++i) {
           //$1,2,3.A,B,C:5-10,LYS,chemicals@CA,C
           // $1,2,3: Structure
           // .A,B,C: chain
           // :5-10,K,chemicals: residues, could be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
           // :ref_1250,ref_anchors,ref_strands,ref_loops: reference numbers 1250, anchor residues (e.g., 2250), residues in strands, residues in loops
           // @CA,C,C*: atoms
           // wild card * can be used to select all
           //var currHighlightAtoms = {}

           let dollarPos = commandArray[i].indexOf('$');
           let periodPos = commandArray[i].indexOf('.');
           let colonPos = commandArray[i].indexOf(':');
           let colonPos2 = commandArray[i].indexOf(':ref_'); // for reference numbers
           let atPos = commandArray[i].indexOf('@');

           let moleculeStr, chainStr, residueStr, refResStr, atomStrArray;
           let testStr = commandArray[i];

           if(atPos === -1) {
             atomStrArray = ["*"];
           }
           else {
             atomStrArray = testStr.substr(atPos + 1).split(',');
             testStr = testStr.substr(0, atPos);
           }

           if(colonPos === -1 && colonPos2 === -1 ) {
             residueStr = "*";
           }
           else if(colonPos2 != -1) {
              refResStr = testStr.substr(colonPos2 + 5);
              testStr = testStr.substr(0, colonPos2);

              // somehow sometimes refResStr or residueStr is rmpty
              if(!refResStr) continue;
           }
           else if(colonPos != -1) {
              residueStr = testStr.substr(colonPos + 1);
              testStr = testStr.substr(0, colonPos);

              // somehow sometimes refResStr or residueStr is rmpty
              if(!residueStr) continue;
           }

           if(periodPos === -1) {
             chainStr = "*";
           }
           else {
             chainStr = testStr.substr(periodPos + 1);

             //replace "A_1" with "A"
             chainStr = chainStr.replace(/_/g, '');

             testStr = testStr.substr(0, periodPos);
           }

           if(dollarPos === -1) {
             moleculeStr = "*";
           }
           else {
             //moleculeStr = testStr.substr(dollarPos + 1).toUpperCase();
             moleculeStr = testStr.substr(dollarPos + 1);
             testStr = testStr.substr(0, dollarPos);
           }

           if(atomStrArray.length > 1 || (atomStrArray.length == 1 && atomStrArray[0] !== '*')) {
             bSelectResidues = false; // selected atoms
           }

           let molecule, chain, molecule_chain, moleculeArray=[], Molecule_ChainArray=[], start, end;

           if(moleculeStr === '*') {
             moleculeArray = Object.keys(ic.structures);
           }
           else {
             moleculeArray = moleculeStr.split(",")
           }

           if(chainStr === '*') {
             let tmpArray = Object.keys(ic.chains);  // 1_A(molecule_chain)

             for(let j = 0, jl = tmpArray.length; j < jl; ++j) {
               molecule_chain = tmpArray[j];

               molecule = molecule_chain.substr(0, molecule_chain.indexOf('_'));
               //if(moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
               let moleculeArrayLower = moleculeArray.map(function(x){ return x.toLowerCase(); });
               if(moleculeArrayLower.indexOf(molecule.toLowerCase()) !== -1 ) {
                 Molecule_ChainArray.push(molecule_chain);
               }
             }
           }
           else {
             for(let j = 0, jl = moleculeArray.length; j < jl; ++j) {
               molecule = moleculeArray[j];

               let chainArray = chainStr.split(",");
               for(let k in chainArray) {
                 Molecule_ChainArray.push(molecule + '_' + chainArray[k]);
               }
             }
           }

           let bRefnum = (refResStr) ? true : false;
           let residueStrArray = (bRefnum) ? refResStr.split(',') : residueStr.split(',');

           for(let j = 0, jl = residueStrArray.length; j < jl; ++j) {
               let bResidueId = false;

               //var hyphenPos = residueStrArray[j].indexOf('-');
               let hyphenPos = residueStrArray[j].lastIndexOf('-');

               let oneLetterResidueStr = undefined, threeLetterResidueStr = undefined;
               let bAllResidues = false;
               let bResidueArray = false;
               let bResidueArrayThree = false; // three letter residues

               if(hyphenPos !== -1) {
                 start = residueStrArray[j].substr(0, hyphenPos);
                 end = residueStrArray[j].substr(hyphenPos+1);
                 bResidueId = true;
               }
               else {
                 //if(residueStrArray[j].length > 1 && residueStrArray[j][0] === '3' && (residueStrArray[j].length - 1) % 3 === 0) { // three letter residue string, such as :3LysArg
                 if(!bRefnum && residueStrArray[j].length > 1 && residueStrArray[j][0] === '3' 
                     && isNaN(residueStrArray[j][1]) && residueStrArray[j][0] !== '-') { // three letter residue string, such as :3LysArg or :3ZN, but not :30 neither :3-10
                   let tmpStr = residueStrArray[j].toUpperCase();
                   threeLetterResidueStr = tmpStr.substr(1);
                   bResidueArrayThree = true;
                 }
                 // some residue ID could be "35A"
                 //else if(residueStrArray[j] !== '' && !isNaN(residueStrArray[j])) { // residue id
                 else if(residueStrArray[j] !== '' && !isNaN(parseInt(residueStrArray[j]))) { // residue id
                   start = residueStrArray[j];
                   end = start;
                   bResidueId = true;
                 }
                 else if(residueStrArray[j] === '*') { // all resiues
                   bAllResidues = true;
                 }
                 else if(residueStrArray[j] !== 'proteins' && residueStrArray[j] !== 'nucleotides' 
                   && residueStrArray[j] !== 'chemicals' && residueStrArray[j] !== 'ions' && residueStrArray[j] !== 'water'
                   && residueStrArray[j] !== 'anchors' && residueStrArray[j] !== 'strands' && residueStrArray[j] !== 'loops') { // residue name
                   let tmpStr = residueStrArray[j].toUpperCase();
                   //oneLetterResidue =(residueStrArray[j].length === 1) ? tmpStr : me.utilsCls.residueName2Abbr(tmpStr);
                   oneLetterResidueStr = tmpStr;
                   bResidueArray = true;
                 }
               }

               for(let mc = 0, mcl = Molecule_ChainArray.length; mc < mcl; ++mc) {
                 molecule_chain = Molecule_ChainArray[mc];

                 if(bResidueId) {
                   // start and end could be a string such as 35A
                   //for(let k = parseInt(start); k <= parseInt(end); ++k) {
                   start = !isNaN(start) ? parseInt(start) : start;
                   end = !isNaN(end) ? parseInt(end) : end;
                   for(let k = start; k <= end; ++k) {
                     let residArray = [];

                     if(bRefnum) {
                      let residArrayTmp = (ic.refnum2residArray[k.toString()]) ? ic.refnum2residArray[k.toString()] : [];
                      for(let m = 0, ml = residArrayTmp.length; m < ml; ++m) {
                        let residueId = residArrayTmp[m];
                        if(residueId.substr(0, residueId.lastIndexOf('_')) == molecule_chain) {
                          residArray.push(residueId);
                        }
                      }
                     }
                     else {
                      let residueId = molecule_chain + '_' + k;
                      residArray = [residueId];
                     }

                     for(let l = 0, ll = residArray.length; l < ll; ++l) {
                        let residueId = residArray[l];
                        if(i === 0) {
                              residueHash[residueId] = 1;
                        }
                        else {
                            // if not exit previously, "and" operation will remove this one
                            //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                            if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                        }

                        for(let m in ic.residues[residueId]) {
                          for(let n = 0, nl = atomStrArray.length; n < nl; ++n) {
                              let atomStr = atomStrArray[n];
                              atomHash = this.processAtomStr(atomStr, atomHash, i, m);
                              
                              // if(atomStr === '*' || atomStr === ic.atoms[m].name) {
                              //   if(i === 0) {
                              //       atomHash[m] = 1;
                              //   }
                              //   else {
                              //       if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
                              //   }
                              // }
                          }
                        }
                      } // end for(let l = 0, 
                   } // end for
                 }
                 else {
                   if(molecule_chain in ic.chains) {
                     let chainAtomHash = ic.chains[molecule_chain];
                     for(let m in chainAtomHash) {
                       // residue could also be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
                       let tmpStr = ic.atoms[m].resn.substr(0,3).toUpperCase();
                       let resid = molecule_chain + '_' + ic.atoms[m].resi; 
                       let refnumLabel, refnumStr, refnum;
                       if(bRefnum) {
                         refnumLabel = ic.resid2refnum[resid];
                         if(refnumLabel) {
                          refnumStr = ic.refnumCls.rmStrandFromRefnumlabel(refnumLabel);
                          refnum = parseInt(refnumStr);
                         }
                       }

                       if(bAllResidues
                           //|| me.utilsCls.residueName2Abbr(tmpStr) === oneLetterResidue
                           ||(residueStrArray[j] === 'proteins' && m in ic.proteins)
                           ||(residueStrArray[j] === 'nucleotides' && m in ic.nucleotides)
                           ||(residueStrArray[j] === 'chemicals' && m in ic.chemicals)
                           ||(residueStrArray[j] === 'ions' && m in ic.ions)
                           ||(residueStrArray[j] === 'water' && m in ic.water)
                           ||(bRefnum && refnumLabel && residueStrArray[j] === 'anchors' && refnum % 100 == 50)
                           ||(bRefnum && refnumLabel && residueStrArray[j] === 'strands' && !ic.residIgLoop.hasOwnProperty(resid))
                           ||(bRefnum && refnumLabel && residueStrArray[j] === 'loops' && ic.residIgLoop.hasOwnProperty(resid))
                           ) {
                         // many duplicates
                         if(i === 0) {
                             residueHash[resid] = 1;
                         }
                         else {
                             if(!residueHash.hasOwnProperty(resid)) delete residueHash[resid];
                         }

                         for(let n = 0, nl = atomStrArray.length; n < nl; ++n) {
                             let atomStr = atomStrArray[n];

                             atomHash = this.processAtomStr(atomStr, atomHash, i, m);
                         }
                       }
                     } // end for(let m in atomHash) {

                     if(bResidueArray || bResidueArrayThree) {
                       let n =(bResidueArray) ? 1 : 3;
                       let residueStrTmp =(bResidueArray) ? oneLetterResidueStr : threeLetterResidueStr;

                       let chainSeq = '', resiArray = [];
                       for(let s = 0, sl = ic.chainsSeq[molecule_chain].length; s < sl;  ++s) {
                           if(bResidueArray) {
                               chainSeq +=(ic.chainsSeq[molecule_chain][s].name.length == 1) ? ic.chainsSeq[molecule_chain][s].name : ' ';
                           }
                           else if(bResidueArrayThree) {
                               let threeLetter = me.utilsCls.residueAbbr2Name(ic.chainsSeq[molecule_chain][s].name)

                               chainSeq +=(threeLetter.length == 3) ? threeLetter : threeLetter.padEnd(3, '_');
                           }
                           resiArray.push(ic.chainsSeq[molecule_chain][s].resi);
                       }

                       chainSeq = chainSeq.toUpperCase();

                       let seqReg = residueStrTmp.replace(/x/gi, ".");
                       let posArray = [];

                       let searchReg = new RegExp(seqReg, 'i');

                       let targetStr = chainSeq;
                       let pos = targetStr.search(searchReg);
                       let sumPos = pos / n;
                       while(pos !== -1) {
                           posArray.push(sumPos);
                           targetStr = targetStr.substr(pos + n);
                           pos = targetStr.search(searchReg);
                           sumPos += pos / n + 1;
                       }

                       for(let s = 0, sl = posArray.length; s < sl; ++s) {
                           let pos = posArray[s];

                           for(let t = 0, tl = residueStrTmp.length / n; t < tl;  t += n) {
                             let residueId = molecule_chain + '_' + resiArray[t/n + pos];
                             if(i === 0) {
                                 residueHash[residueId] = 1;
                             }
                             else {
                                 //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                                 if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                             }

                             for(let m in ic.residues[residueId]) {
                               for(let n = 0, nl = atomStrArray.length; n < nl; ++n) {
                                  let atomStr = atomStrArray[n];

                                  atomHash = this.processAtomStr(atomStr, atomHash, i, m);
                               }
                             }
                           } // for
                       } // end for(s = 0
                     } // end if

                   } // end if(molecule_chain
                 } // end else
               } // end for(let mc = 0
           } // for(j
       }  // for(i

       ic.hAtoms = me.hashUtilsCls.cloneHash(atomHash);

       if(Object.keys(ic.hAtoms).length == 0) {
           console.log("No residues were selected. Please try another search.");
       }

       if(bDisplay === undefined || bDisplay) ic.hlUpdateCls.updateHlAll();

       let residueAtomArray;
       if(bSelectResidues) {
           residueAtomArray = Object.keys(residueHash);
       }
       else {
           residueAtomArray = Object.keys(atomHash);
       }

       if(commandname != "") {
           ic.selectionCls.addCustomSelection(residueAtomArray, commandname, commanddesc, select, bSelectResidues);

           let nameArray = [commandname];          
           if(!bNoUpdateAll) ic.definedSetsCls.changeCustomAtoms(nameArray);
       }
    }

    processAtomStr(atomStr, atomHash, i, m) {  let ic = this.icn3d, me = ic.icn3dui;                           
        let atomStrLen = atomStr.length;
        let lastChar = atomStr.substr(atomStrLen - 1, 1);

        if(lastChar == '*' && atomStrLen > 1) { // wildcard to replace anything with *
          if(atomStr.substr(0, atomStrLen - 1) === ic.atoms[m].name.substr(0, atomStrLen - 1)) {
            if(i === 0) {
                atomHash[m] = 1;
            }
            else {
                if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
            }
          }
        }
        else {
          if(atomStr === '*' || atomStr === ic.atoms[m].name) {
            if(i === 0) {
                atomHash[m] = 1;
            }
            else {
                if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
            }
          }
        } 

        return atomHash;
    }
}

export {SelectByCommand}
