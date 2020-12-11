/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.commandSelect = function(postfix) { var me = this, ic = me.icn3d; "use strict";
       var select = $("#" + me.pre + "command" + postfix).val();

       var commandname = $("#" + me.pre + "command_name" + postfix).val().replace(/;/g, '_').replace(/\s+/g, '_');

       if(select) {
           me.selectByCommand(select, commandname, commandname);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);
       }
};

iCn3DUI.prototype.clickCommand_apply = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "command_apply").click(function(e) { var ic = me.icn3d;
       e.preventDefault();

       me.commandSelect('');
    });

    $("#" + me.pre + "command_apply2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.commandSelect('2');
    });

};

iCn3DUI.prototype.selectCombinedSets = function(strSets, commandname) { var me = this, ic = me.icn3d; "use strict";
    var idArray = strSets.split(' ');

    var orArray = [], andArray = [], notArray = [];
    var prevLabel = 'or';

    for(var i = 0, il = idArray.length; i < il; ++i) {
        if(idArray[i] === 'or' || idArray[i] === 'and' || idArray[i] === 'not') {
            prevLabel = idArray[i];
            continue;
        }
        else {
            if(prevLabel === 'or') {
                orArray.push(idArray[i]);
            }
            else if(prevLabel === 'and') {
                andArray.push(idArray[i]);
            }
            else if(prevLabel === 'not') {
                notArray.push(idArray[i]);
            }
        }
    }

    if(idArray !== null) me.combineSets(orArray, andArray, notArray, commandname);
};

iCn3DUI.prototype.selectByCommand = function (select, commandname, commanddesc) { var me = this, ic = me.icn3d; "use strict";
       if(select.indexOf('saved atoms') === 0) {
            var pos = 12; // 'saved atoms '
            var strSets = select.substr(pos);

            me.selectCombinedSets(strSets, commandname);
       }
       else {
           var selectTmp = select.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ or and /g, ' and ').replace(/ and /g, ' or and ').replace(/ or not /g, ' not ').replace(/ not /g, ' or not ');

           var commandStr = (selectTmp.trim().substr(0, 6) === 'select') ? selectTmp.trim().substr(7) : selectTmp.trim();

           // each select command may have several commands separated by ' or '
           var commandArray = commandStr.split(' or ');
           var allHighlightAtoms = {};

           for(var i = 0, il = commandArray.length; i < il; ++i) {
               var command = commandArray[i].trim().replace(/\s+/g, ' ');
               var pos = command.indexOf(' ');

               ic.hAtoms = {};

               if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = ic.intHash(allHighlightAtoms, ic.hAtoms);
               }
               else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = ic.exclHash(allHighlightAtoms, ic.hAtoms);
               }
               else { // union
                       me.applyCommand('select ' + command);

                       allHighlightAtoms = ic.unionHash(allHighlightAtoms, ic.hAtoms);
               }
           }

           ic.hAtoms = ic.cloneHash(allHighlightAtoms);

           var atomArray = Object.keys(ic.hAtoms);
           var residueArray = undefined;

           if(commandname !== "") {
               me.addCustomSelection(atomArray, commandname, commanddesc, select, false);

               var nameArray = [commandname];
               //me.changeCustomResidues(nameArray);

               me.changeCustomAtoms(nameArray);
           }
       }
};

iCn3DUI.prototype.selectBySpec = function (select, commandname, commanddesc, bDisplay) { var me = this, ic = me.icn3d; "use strict";
   select = (select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();

   ic.hAtoms = {};

   // selection definition is similar to Chimera: https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/frameatom_spec.html
   // There will be no ' or ' in the spec. It's already separated in selectByCommand()
   // There could be ' and ' in the spec.
   var commandArray = select.replace(/\s+/g, ' ').replace(/ AND /g, ' and ').split(' and ');

   var residueHash = {};
   var atomHash = {};

   var bSelectResidues = true;
   for(var i = 0, il=commandArray.length; i < il; ++i) {
       //$1,2,3.A,B,C:5-10,LYS,chemicals@CA,C
       // $1,2,3: Structure
       // .A,B,C: chain
       // :5-10,K,chemicals: residues, could be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
       // @CA,C: atoms
       // wild card * can be used to select all
       //var currHighlightAtoms = {};

       var dollarPos = commandArray[i].indexOf('$');
       var periodPos = commandArray[i].indexOf('.');
       var colonPos = commandArray[i].indexOf(':');
       var atPos = commandArray[i].indexOf('@');

       var moleculeStr, chainStr, residueStr, atomStrArray;
       var testStr = commandArray[i];

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

       var molecule, chain, molecule_chain, moleculeArray=[], Molecule_ChainArray=[], start, end;

       if(moleculeStr === '*') {
         moleculeArray = Object.keys(ic.structures);
       }
       else {
         moleculeArray = moleculeStr.split(",")
       }

       if(chainStr === '*') {
         var tmpArray = Object.keys(ic.chains);  // 1_A (molecule_chain)

         for(var j = 0, jl = tmpArray.length; j < jl; ++j) {
           molecule_chain = tmpArray[j];

           molecule = molecule_chain.substr(0, molecule_chain.indexOf('_'));
           //if(moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
           var moleculeArrayLower = moleculeArray.map(function(x){ return x.toLowerCase(); });
           if(moleculeArrayLower.indexOf(molecule.toLowerCase()) !== -1 ) {
             Molecule_ChainArray.push(molecule_chain);
           }
         }
       }
       else {
         for(var j = 0, jl = moleculeArray.length; j < jl; ++j) {
           molecule = moleculeArray[j];

           var chainArray = chainStr.split(",");
           for(var k in chainArray) {
             Molecule_ChainArray.push(molecule + '_' + chainArray[k]);
           }
         }
       }

       var residueStrArray = residueStr.split(',');
       for(var j = 0, jl = residueStrArray.length; j < jl; ++j) {
           var bResidueId = false;

           var hyphenPos = residueStrArray[j].indexOf('-');

           var oneLetterResidueStr = undefined, threeLetterResidueStr = undefined;
           var bAllResidues = false;
           var bResidueArray = false;
           var bResidueArrayThree = false; // three letter residues

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
             else if(residueStrArray[j][0] === '3' && (residueStrArray[j].length - 1) % 3 === 0) { // three letter residue string, such as :3LysArg
               var tmpStr = residueStrArray[j].toUpperCase();
               threeLetterResidueStr = tmpStr.substr(1);
               bResidueArrayThree = true;
             }
             else if(residueStrArray[j] !== 'proteins' && residueStrArray[j] !== 'nucleotides' && residueStrArray[j] !== 'chemicals' && residueStrArray[j] !== 'ions' && residueStrArray[j] !== 'water') { // residue name
               var tmpStr = residueStrArray[j].toUpperCase();
               //oneLetterResidue = (residueStrArray[j].length === 1) ? tmpStr : ic.residueName2Abbr(tmpStr);
               oneLetterResidueStr = tmpStr;
               bResidueArray = true;
             }
           }

           for(var mc = 0, mcl = Molecule_ChainArray.length; mc < mcl; ++mc) {
             molecule_chain = Molecule_ChainArray[mc];

             if(bResidueId) {
               for(var k = parseInt(start); k <= parseInt(end); ++k) {
                 var residueId = molecule_chain + '_' + k;
                 if(i === 0) {
                      residueHash[residueId] = 1;
                 }
                 else {
                     // if not exit previously, "and" operation will remove this one
                     //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                     if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                 }

                 for(var m in ic.residues[residueId]) {
                   for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                       var atomStr = atomStrArray[n];
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
                 var chainAtomHash = ic.chains[molecule_chain];
                 for(var m in chainAtomHash) {
                   // residue could also be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
                   var tmpStr = ic.atoms[m].resn.substr(0,3).toUpperCase();
                   if(bAllResidues
                       //|| ic.residueName2Abbr(tmpStr) === oneLetterResidue
                       || (residueStrArray[j] === 'proteins' && m in ic.proteins)
                       || (residueStrArray[j] === 'nucleotides' && m in ic.nucleotides)
                       || (residueStrArray[j] === 'chemicals' && m in ic.chemicals)
                       || (residueStrArray[j] === 'ions' && m in ic.ions)
                       || (residueStrArray[j] === 'water' && m in ic.water)
                       ) {
                     // many duplicates
                     if(i === 0) {
                         residueHash[molecule_chain + '_' + ic.atoms[m].resi] = 1;
                     }
                     else {
                         var residTmp = molecule_chain + '_' + ic.atoms[m].resi;
                         //if(!residueHash.hasOwnProperty(residTmp)) residueHash[residTmp] = undefined;
                         if(!residueHash.hasOwnProperty(residTmp)) delete residueHash[residTmp];
                     }

                     for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                         var atomStr = atomStrArray[n];

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
                 } // end for(var m in atomHash) {

                 if(bResidueArray || bResidueArrayThree) {
                   var n = (bResidueArray) ? 1 : 3;
                   var residueStrTmp = (bResidueArray) ? oneLetterResidueStr : threeLetterResidueStr;

                   var chainSeq = '', resiArray = [];
                   for(var s = 0, sl = ic.chainsSeq[molecule_chain].length; s < sl;  ++s) {
                       if(bResidueArray) {
                           chainSeq += (ic.chainsSeq[molecule_chain][s].name.length == 1) ? ic.chainsSeq[molecule_chain][s].name : ' ';
                       }
                       else if(bResidueArrayThree) {
                           var threeLetter = ic.residueAbbr2Name(ic.chainsSeq[molecule_chain][s].name);
                           chainSeq += (threeLetter.length == 3) ? threeLetter : '   ';
                       }
                       resiArray.push(ic.chainsSeq[molecule_chain][s].resi);
                   }

                   chainSeq = chainSeq.toUpperCase();

                   var seqReg = residueStrTmp.replace(/x/gi, ".");
                   var posArray = [];

                   var searchReg = new RegExp(seqReg, 'i');

                   var targetStr = chainSeq;
                   var pos = targetStr.search(searchReg);
                   var sumPos = pos / n;
                   while(pos !== -1) {
                       posArray.push(sumPos);
                       targetStr = targetStr.substr(pos + n);
                       pos = targetStr.search(searchReg);
                       sumPos += pos / n + 1;
                   }

                   for(var s = 0, sl = posArray.length; s < sl; ++s) {
                       var pos = posArray[s];

                       for(var t = 0, tl = residueStrTmp.length / n; t < tl;  t += n) {
                         var residueId = molecule_chain + '_' + resiArray[t/n + pos];
                         if(i === 0) {
                             residueHash[residueId] = 1;
                         }
                         else {
                             //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                             if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                         }

                         for(var m in ic.residues[residueId]) {
                           for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                               var atomStr = atomStrArray[n];
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
           } // end for(var mc = 0
       } // for (j
   }  // for (i

   ic.hAtoms = ic.cloneHash(atomHash);

   if(Object.keys(ic.hAtoms).length == 0) {
       console.log("No residues were selected. Please try another search.");
   }

   if(bDisplay === undefined || bDisplay) me.updateHlAll();

   var residueAtomArray;
   if(bSelectResidues) {
       residueAtomArray = Object.keys(residueHash);
   }
   else {
       residueAtomArray = Object.keys(atomHash);
   }

   if(commandname != "") {
       me.addCustomSelection(residueAtomArray, commandname, commanddesc, select, bSelectResidues);

       var nameArray = [commandname];
       me.changeCustomAtoms(nameArray);
   }
};
