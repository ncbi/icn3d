/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickCommand_apply = function() { var me = this;
    $("#" + me.pre + "command_apply").click(function(e) {
       e.preventDefault();

       var select = $("#" + me.pre + "command").val();

       var commandname = $("#" + me.pre + "command_name").val().replace(/;/g, '_').replace(/\s+/g, '_');

       if(select) {
           me.selectByCommand(select, commandname, commandname);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);
       }
    });

    $("#" + me.pre + "command_apply2").click(function(e) {
       e.preventDefault();

       var select = $("#" + me.pre + "command2").val();

       var commandname = $("#" + me.pre + "command_name2").val().replace(/;/g, '_').replace(/\s+/g, '_');

       if(select) {
           me.selectByCommand(select, commandname, commandname);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);
       }
    });

};

iCn3DUI.prototype.selectCombinedSets = function(strSets, commandname) { var me = this;
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

iCn3DUI.prototype.selectByCommand = function (select, commandname, commanddesc) { var me = this;
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

               me.icn3d.hAtoms = {};

               if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = me.icn3d.intHash(allHighlightAtoms, me.icn3d.hAtoms);
               }
               else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = me.icn3d.exclHash(allHighlightAtoms, me.icn3d.hAtoms);
               }
               else { // union
                       me.applyCommand('select ' + command);

                       allHighlightAtoms = me.icn3d.unionHash(allHighlightAtoms, me.icn3d.hAtoms);
               }
           }

           me.icn3d.hAtoms = me.icn3d.cloneHash(allHighlightAtoms);

           var atomArray = Object.keys(me.icn3d.hAtoms);
           var residueArray = undefined;

           if(commandname !== "") {
               me.addCustomSelection(atomArray, commandname, commanddesc, select, false);

               var nameArray = [commandname];
               //me.changeCustomResidues(nameArray);

               me.changeCustomAtoms(nameArray);
           }
       }
};

iCn3DUI.prototype.selectBySpec = function (select, commandname, commanddesc, bDisplay) { var me = this;
   select = (select.trim().substr(0, 6) === 'select') ? select.trim().substr(7) : select.trim();

   me.icn3d.hAtoms = {};

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
       // :5-10,LYS,chemicals: residues, could be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
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
         moleculeArray = Object.keys(me.icn3d.structures);
       }
       else {
         moleculeArray = moleculeStr.split(",")
       }

       if(chainStr === '*') {
         var tmpArray = Object.keys(me.icn3d.chains);  // 1_A (molecule_chain)

         for(var j = 0, jl = tmpArray.length; j < jl; ++j) {
           molecule_chain = tmpArray[j];

           molecule = molecule_chain.substr(0, molecule_chain.indexOf('_'));
           if(moleculeArray.toString().toLowerCase().indexOf(molecule.toLowerCase()) !== -1) {
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

           var oneLetterResidueStr;
           var bAllResidues = false;
           var bResidueArray = false;

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
             else if(residueStrArray[j] !== 'proteins' && residueStrArray[j] !== 'nucleotides' && residueStrArray[j] !== 'chemicals' && residueStrArray[j] !== 'ions' && residueStrArray[j] !== 'water') { // residue name
               var tmpStr = residueStrArray[j].toUpperCase();
               //oneLetterResidue = (residueStrArray[j].length === 1) ? tmpStr : me.icn3d.residueName2Abbr(tmpStr);
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

                 for(var m in me.icn3d.residues[residueId]) {
                   for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                       var atomStr = atomStrArray[n];
                       if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
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
               if(molecule_chain in me.icn3d.chains) {
                 var chainAtomHash = me.icn3d.chains[molecule_chain];
                 for(var m in chainAtomHash) {
                   // residue could also be 'proteins', 'nucleotides', 'chemicals', 'ions', and 'water'
                   var tmpStr = me.icn3d.atoms[m].resn.substr(0,3).toUpperCase();
                   if(bAllResidues
                       //|| me.icn3d.residueName2Abbr(tmpStr) === oneLetterResidue
                       || (residueStrArray[j] === 'proteins' && m in me.icn3d.proteins)
                       || (residueStrArray[j] === 'nucleotides' && m in me.icn3d.nucleotides)
                       || (residueStrArray[j] === 'chemicals' && m in me.icn3d.chemicals)
                       || (residueStrArray[j] === 'ions' && m in me.icn3d.ions)
                       || (residueStrArray[j] === 'water' && m in me.icn3d.water)
                       ) {
                     // many duplicates
                     if(i === 0) {
                         residueHash[molecule_chain + '_' + me.icn3d.atoms[m].resi] = 1;
                     }
                     else {
                         var residTmp = molecule_chain + '_' + me.icn3d.atoms[m].resi;
                         //if(!residueHash.hasOwnProperty(residTmp)) residueHash[residTmp] = undefined;
                         if(!residueHash.hasOwnProperty(residTmp)) delete residueHash[residTmp];
                     }

                     for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                         var atomStr = atomStrArray[n];

                         if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
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

                 if(bResidueArray) {
                   //oneLetterResidueStr.length;
                   var chainSeq = '', resiArray = [];
                   for(var s = 0, sl = me.icn3d.chainsSeq[molecule_chain].length; s < sl;  ++s) {
                       chainSeq += (me.icn3d.chainsSeq[molecule_chain][s].name.length == 1) ? me.icn3d.chainsSeq[molecule_chain][s].name : me.icn3d.chainsSeq[molecule_chain][s].name.substr(0, 1);
                       resiArray.push(me.icn3d.chainsSeq[molecule_chain][s].resi);
                   }

                   chainSeq = chainSeq.toUpperCase();

                   var seqReg = oneLetterResidueStr.replace(/x/gi, ".");
                   var posArray = [];

                   var searchReg = new RegExp(seqReg, 'i');

                   var targetStr = chainSeq;
                   var pos = targetStr.search(searchReg);
                   var sumPos = pos;
                   while(pos !== -1) {
                       posArray.push(sumPos);
                       targetStr = targetStr.substr(pos + 1);
                       pos = targetStr.search(searchReg);
                       sumPos += pos + 1;
                   }

                   for(var s = 0, sl = posArray.length; s < sl; ++s) {
                       var pos = posArray[s];

                       for(var t = 0, tl = oneLetterResidueStr.length; t < tl;  ++t) {
                         var residueId = molecule_chain + '_' + resiArray[t + pos];
                         if(i === 0) {
                             residueHash[residueId] = 1;
                         }
                         else {
                             //if(!residueHash.hasOwnProperty(residueId)) residueHash[residueId] = undefined;
                             if(!residueHash.hasOwnProperty(residueId)) delete residueHash[residueId];
                         }

                         for(var m in me.icn3d.residues[residueId]) {
                           for(var n = 0, nl = atomStrArray.length; n < nl; ++n) {
                               var atomStr = atomStrArray[n];
                               if(atomStr === '*' || atomStr === me.icn3d.atoms[m].name) {
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
                 }
               } // end if(molecule_chain
             } // end else
           } // end for(var mc = 0
       } // for (j
/*
       if(i === 0) {
           me.icn3d.hAtoms = me.icn3d.cloneHash(currHighlightAtoms);
       }
       else {
           me.icn3d.hAtoms = me.icn3d.intHash(me.icn3d.hAtoms, currHighlightAtoms);
       }
*/
   }  // for (i

   me.icn3d.hAtoms = me.icn3d.cloneHash(atomHash);

   if(Object.keys(me.icn3d.hAtoms).length == 0) {
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

//   if(commandname == "") commandname = "tmp_" + select;

   if(commandname != "") {
       me.addCustomSelection(residueAtomArray, commandname, commanddesc, select, bSelectResidues);

       var nameArray = [commandname];
       me.changeCustomAtoms(nameArray);
   }
};
