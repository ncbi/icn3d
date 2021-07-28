/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {ApplyCommand} from '../selection/applyCommand.js';
import {DefinedSets} from '../selection/definedSets.js';
import {Selection} from '../selection/selection.js';

class SelectByCommand {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Set a custom selection with the "command", its name "commandname" and its description "commanddesc".
    selectByCommand(select, commandname, commanddesc) { let  ic = this.icn3d, me = ic.icn3dui;
           if(select.indexOf('saved atoms') === 0) {
                let  pos = 12; // 'saved atoms '
                let  strSets = select.substr(pos);

                ic.definedSetsCls.selectCombinedSets(strSets, commandname);
           }
           else {
               let  selectTmp = select.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ or and /g, ' and ').replace(/ and /g, ' or and ').replace(/ or not /g, ' not ').replace(/ not /g, ' or not ');

               let  commandStr =(selectTmp.trim().substr(0, 6) === 'select') ? selectTmp.trim().substr(7) : selectTmp.trim();

               // each select command may have several commands separated by ' or '
               let  commandArray = commandStr.split(' or ');
               let  allHighlightAtoms = {}

               for(let i = 0, il = commandArray.length; i < il; ++i) {
                   let  command = commandArray[i].trim().replace(/\s+/g, ' ');
                   let  pos = command.indexOf(' ');

                   ic.hAtoms = {}

                   if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                           ic.applyCommandCls.applyCommand('select ' + command.substr(pos + 1));

                           allHighlightAtoms = me.hashUtilsCls.intHash(allHighlightAtoms, ic.hAtoms);
                   }
                   else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                           ic.applyCommandCls.applyCommand('select ' + command.substr(pos + 1));

                           allHighlightAtoms = me.hashUtilsCls.exclHash(allHighlightAtoms, ic.hAtoms);
                   }
                   else { // union
                           ic.applyCommandCls.applyCommand('select ' + command);

                           allHighlightAtoms = me.hashUtilsCls.unionHash(allHighlightAtoms, ic.hAtoms);
                   }
               }

               ic.hAtoms = me.hashUtilsCls.cloneHash(allHighlightAtoms);

               let  atomArray = Object.keys(ic.hAtoms);
               let  residueArray = undefined;

               if(commandname !== "") {
                   ic.selectionCls.addCustomSelection(atomArray, commandname, commanddesc, select, false);

                   let  nameArray = [commandname];
                   //ic.changeCustomResidues(nameArray);

                   ic.definedSetsCls.changeCustomAtoms(nameArray);
               }
           }
    }

    selectBySpec(select, commandname, commanddesc, bDisplay) { let  ic = this.icn3d, me = ic.icn3dui;
       select =(select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();

       ic.hAtoms = {}

       // selection definition is similar to Chimera: https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/frameatom_spec.html
       // There will be no ' or ' in the spec. It's already separated in selectByCommand()
       // There could be ' and ' in the spec.
       let  commandArray = select.replace(/\s+/g, ' ').replace(/ AND /g, ' and ').split(' and ');

       let  residueHash = {}
       let  atomHash = {}

       let  bSelectResidues = true;
       for(let i = 0, il=commandArray.length; i < il; ++i) {
           //$1,2,3.A,B,C:5-10,LYS,chemicals@CA,C
           // $1,2,3: Structure
           // .A,B,C: chain
           // :5-10,K,chemicals: residues, could be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
           // @CA,C: atoms
           // wild card * can be used to select all
           //var currHighlightAtoms = {}

           let  dollarPos = commandArray[i].indexOf('$');
           let  periodPos = commandArray[i].indexOf('.');
           let  colonPos = commandArray[i].indexOf(':');
           let  atPos = commandArray[i].indexOf('@');

           let  moleculeStr, chainStr, residueStr, atomStrArray;
           let  testStr = commandArray[i];

           if(atPos === -1) {
             atomStrArray = ["*"];
           }
           else {
             atomStrArray = testStr.substr(atPos + 1).split(',');
             testStr = testStr.substr(0, atPos);
           }

           if(colonPos === -1) {
             residueStr = "*";
           }
           else {
             residueStr = testStr.substr(colonPos + 1);
             testStr = testStr.substr(0, colonPos);
           }

           if(periodPos === -1) {
             chainStr = "*";
           }
           else {
             chainStr = testStr.substr(periodPos + 1);
             testStr = testStr.substr(0, periodPos);
           }

           if(dollarPos === -1) {
             moleculeStr = "*";
           }
           else {
             moleculeStr = testStr.substr(dollarPos + 1).toUpperCase();
             testStr = testStr.substr(0, dollarPos);
           }

           if(atomStrArray.length == 1 && atomStrArray[0] !== '*') {
             bSelectResidues = false; // selected atoms
           }

           let  molecule, chain, molecule_chain, moleculeArray=[], Molecule_ChainArray=[], start, end;

           if(moleculeStr === '*') {
             moleculeArray = Object.keys(ic.structures);
           }
           else {
             moleculeArray = moleculeStr.split(",")
           }

           if(chainStr === '*') {
             let  tmpArray = Object.keys(ic.chains);  // 1_A(molecule_chain)

             for(let j = 0, jl = tmpArray.length; j < jl; ++j) {
               molecule_chain = tmpArray[j];

               molecule = molecule_chain.substr(0, molecule_chain.indexOf('_'));
               //if(moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
               let  moleculeArrayLower = moleculeArray.map(function(x){ return x.toLowerCase(); });
               if(moleculeArrayLower.indexOf(molecule.toLowerCase()) !== -1 ) {
                 Molecule_ChainArray.push(molecule_chain);
               }
             }
           }
           else {
             for(let j = 0, jl = moleculeArray.length; j < jl; ++j) {
               molecule = moleculeArray[j];

               let  chainArray = chainStr.split(",");
               for(let k in chainArray) {
                 Molecule_ChainArray.push(molecule + '_' + chainArray[k]);
               }
             }
           }

           let  residueStrArray = residueStr.split(',');
           for(let j = 0, jl = residueStrArray.length; j < jl; ++j) {
               let  bResidueId = false;

               //var hyphenPos = residueStrArray[j].indexOf('-');
               let  hyphenPos = residueStrArray[j].lastIndexOf('-');

               let  oneLetterResidueStr = undefined, threeLetterResidueStr = undefined;
               let  bAllResidues = false;
               let  bResidueArray = false;
               let  bResidueArrayThree = false; // three letter residues

               if(hyphenPos !== -1) {
                 start = residueStrArray[j].substr(0, hyphenPos);
                 end = residueStrArray[j].substr(hyphenPos+1);
                 bResidueId = true;
               }
               else {
                 if(residueStrArray[j] !== '' && !isNaN(residueStrArray[j])) { // residue id
                   start = residueStrArray[j];
                   end = start;
                   bResidueId = true;
                 }
                 else if(residueStrArray[j] === '*') { // all resiues
                   bAllResidues = true;
                 }
                 else if(residueStrArray[j][0] === '3' &&(residueStrArray[j].length - 1) % 3 === 0) { // three letter residue string, such as :3LysArg
                   let  tmpStr = residueStrArray[j].toUpperCase();
                   threeLetterResidueStr = tmpStr.substr(1);
                   bResidueArrayThree = true;
                 }
                 else if(residueStrArray[j] !== 'proteins' && residueStrArray[j] !== 'nucleotides' && residueStrArray[j] !== 'chemicals' && residueStrArray[j] !== 'ions' && residueStrArray[j] !== 'water') { // residue name
                   let  tmpStr = residueStrArray[j].toUpperCase();
                   //oneLetterResidue =(residueStrArray[j].length === 1) ? tmpStr : me.utilsCls.residueName2Abbr(tmpStr);
                   oneLetterResidueStr = tmpStr;
                   bResidueArray = true;
                 }
               }

               for(let mc = 0, mcl = Molecule_ChainArray.length; mc < mcl; ++mc) {
                 molecule_chain = Molecule_ChainArray[mc];

                 if(bResidueId) {
                   for(let k = parseInt(start); k <= parseInt(end); ++k) {
                     let  residueId = molecule_chain + '_' + k;
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
                           let  atomStr = atomStrArray[n];
                           if(atomStr === '*' || atomStr === ic.atoms[m].name) {
                             if(i === 0) {
                                 //currHighlightAtoms[m] = 1;
                                 atomHash[m] = 1;
                             }
                             else {
                                 //if(!currHighlightAtoms.hasOwnProperty(m)) currHighlightAtoms[m] = undefined;
                                 //if(!atomHash.hasOwnProperty(m)) atomHash[m] = undefined;
                                 if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
                             }
                           }
                       }
                     }
                   }
                 }
                 else {
                   if(molecule_chain in ic.chains) {
                     let  chainAtomHash = ic.chains[molecule_chain];
                     for(let m in chainAtomHash) {
                       // residue could also be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
                       let  tmpStr = ic.atoms[m].resn.substr(0,3).toUpperCase();
                       if(bAllResidues
                           //|| me.utilsCls.residueName2Abbr(tmpStr) === oneLetterResidue
                           ||(residueStrArray[j] === 'proteins' && m in ic.proteins)
                           ||(residueStrArray[j] === 'nucleotides' && m in ic.nucleotides)
                           ||(residueStrArray[j] === 'chemicals' && m in ic.chemicals)
                           ||(residueStrArray[j] === 'ions' && m in ic.ions)
                           ||(residueStrArray[j] === 'water' && m in ic.water)
                           ) {
                         // many duplicates
                         if(i === 0) {
                             residueHash[molecule_chain + '_' + ic.atoms[m].resi] = 1;
                         }
                         else {
                             let  residTmp = molecule_chain + '_' + ic.atoms[m].resi;
                             //if(!residueHash.hasOwnProperty(residTmp)) residueHash[residTmp] = undefined;
                             if(!residueHash.hasOwnProperty(residTmp)) delete residueHash[residTmp];
                         }

                         for(let n = 0, nl = atomStrArray.length; n < nl; ++n) {
                             let  atomStr = atomStrArray[n];

                             if(atomStr === '*' || atomStr === ic.atoms[m].name) {
                                 if(i === 0) {
                                     //currHighlightAtoms[m] = 1;
                                     atomHash[m] = 1;
                                 }
                                 else {
                                     //if(!currHighlightAtoms.hasOwnProperty(m)) currHighlightAtoms[m] = undefined;
                                     //if(!atomHash.hasOwnProperty(m)) atomHash[m] = undefined;
                                     if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
                                 }
                             }
                         }

                       }
                     } // end for(let m in atomHash) {

                     if(bResidueArray || bResidueArrayThree) {
                       let  n =(bResidueArray) ? 1 : 3;
                       let  residueStrTmp =(bResidueArray) ? oneLetterResidueStr : threeLetterResidueStr;

                       let  chainSeq = '', resiArray = [];
                       for(let s = 0, sl = ic.chainsSeq[molecule_chain].length; s < sl;  ++s) {
                           if(bResidueArray) {
                               chainSeq +=(ic.chainsSeq[molecule_chain][s].name.length == 1) ? ic.chainsSeq[molecule_chain][s].name : ' ';
                           }
                           else if(bResidueArrayThree) {
                               let  threeLetter = me.utilsCls.residueAbbr2Name(ic.chainsSeq[molecule_chain][s].name);
                               chainSeq +=(threeLetter.length == 3) ? threeLetter : '   ';
                           }
                           resiArray.push(ic.chainsSeq[molecule_chain][s].resi);
                       }

                       chainSeq = chainSeq.toUpperCase();

                       let  seqReg = residueStrTmp.replace(/x/gi, ".");
                       let  posArray = [];

                       let  searchReg = new RegExp(seqReg, 'i');

                       let  targetStr = chainSeq;
                       let  pos = targetStr.search(searchReg);
                       let  sumPos = pos / n;
                       while(pos !== -1) {
                           posArray.push(sumPos);
                           targetStr = targetStr.substr(pos + n);
                           pos = targetStr.search(searchReg);
                           sumPos += pos / n + 1;
                       }

                       for(let s = 0, sl = posArray.length; s < sl; ++s) {
                           let  pos = posArray[s];

                           for(let t = 0, tl = residueStrTmp.length / n; t < tl;  t += n) {
                             let  residueId = molecule_chain + '_' + resiArray[t/n + pos];
                             if(i === 0) {
                                 residueHash[residueId] = 1;
                             }
                             else {
                                 //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                                 if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                             }

                             for(let m in ic.residues[residueId]) {
                               for(let n = 0, nl = atomStrArray.length; n < nl; ++n) {
                                   let  atomStr = atomStrArray[n];
                                   if(atomStr === '*' || atomStr === ic.atoms[m].name) {
                                     if(i === 0) {
                                         //currHighlightAtoms[m] = 1;
                                         atomHash[m] = 1;
                                     }
                                     else {
                                         //if(!currHighlightAtoms.hasOwnProperty(m)) currHighlightAtoms[m] = undefined;
                                         //if(!atomHash.hasOwnProperty(m)) atomHash[m] = undefined;
                                         if(!atomHash.hasOwnProperty(m)) delete atomHash[m];
                                     }
                                   }
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

       let  residueAtomArray;
       if(bSelectResidues) {
           residueAtomArray = Object.keys(residueHash);
       }
       else {
           residueAtomArray = Object.keys(atomHash);
       }

       if(commandname != "") {
           ic.selectionCls.addCustomSelection(residueAtomArray, commandname, commanddesc, select, bSelectResidues);

           let  nameArray = [commandname];
           ic.definedSetsCls.changeCustomAtoms(nameArray);
       }
    }
}

export {SelectByCommand}
