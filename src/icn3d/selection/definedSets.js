/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {MyEventCls} from '../../utils/myEventCls.js';
import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {Selection} from '../selection/selection.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {Annotation} from '../annotations/annotation.js';

class DefinedSets {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    setProtNuclLigInMenu() { let  ic = this.icn3d, me = ic.icn3dui;
        // Initially, add proteins, nucleotides, chemicals, ions, water into the menu "custom selections"
        if(Object.keys(ic.proteins).length > 0) {
          //ic.defNames2Atoms['proteins'] = Object.keys(ic.proteins);
          ic.defNames2Residues['proteins'] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.proteins));
          ic.defNames2Descr['proteins'] = 'proteins';
          ic.defNames2Command['proteins'] = 'select :proteins';
        }

        if(Object.keys(ic.nucleotides).length > 0) {
          //ic.defNames2Atoms['nucleotides'] = Object.keys(ic.nucleotides);
          ic.defNames2Residues['nucleotides'] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.nucleotides));
          ic.defNames2Descr['nucleotides'] = 'nucleotides';
          ic.defNames2Command['nucleotides'] = 'select :nucleotides';
        }

        if(Object.keys(ic.chemicals).length > 0) {
          //ic.defNames2Atoms['chemicals'] = Object.keys(ic.chemicals);
          if(ic.bOpm) {
              let  chemicalResHash = {}, memResHash = {}
              for(let serial in ic.chemicals) {
                  let  atom = ic.atoms[serial];
                  let  residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                  if(atom.resn === 'DUM') {
                      memResHash[residueid] = 1;
                  }
                  else {
                      chemicalResHash[residueid] = 1;
                  }
              }

              if(Object.keys(chemicalResHash).length > 0) {
                  ic.defNames2Residues['chemicals'] = Object.keys(chemicalResHash);
                  ic.defNames2Descr['chemicals'] = 'chemicals';
                  ic.defNames2Command['chemicals'] = 'select :chemicals';
              }

              if(Object.keys(memResHash).length > 0) {
                  ic.defNames2Residues['membrane'] = Object.keys(memResHash);
                  ic.defNames2Descr['membrane'] = 'membrane';
                  ic.defNames2Command['membrane'] = 'select :membrane';
              }
          }
          else {
              ic.defNames2Residues['chemicals'] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.chemicals));
              ic.defNames2Descr['chemicals'] = 'chemicals';
              ic.defNames2Command['chemicals'] = 'select :chemicals';
          }
        }

        if(Object.keys(ic.ions).length > 0) {
          //ic.defNames2Atoms['ions'] = Object.keys(ic.ions);
          ic.defNames2Residues['ions'] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.ions));
          ic.defNames2Descr['ions'] = 'ions';
          ic.defNames2Command['ions'] = 'select :ions';
        }

        if(Object.keys(ic.water).length > 0) {
          //ic.defNames2Atoms['water'] = Object.keys(ic.water);
          ic.defNames2Residues['water'] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.water));
          ic.defNames2Descr['water'] = 'water';
          ic.defNames2Command['water'] = 'select :water';
        }

        this.setTransmemInMenu(ic.halfBilayerSize, -ic.halfBilayerSize);
    }

    setPredefinedInMenu() { let  ic = this.icn3d, me = ic.icn3dui;
          // predefined sets: all chains
          this.setChainsInMenu();

          // predefined sets: proteins,nucleotides, chemicals
          this.setProtNuclLigInMenu();

          // show 3d domains for mmdbid
          if(ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined || ic.icn3dui.cfg.chainalign !== undefined) {
              for(let tddomainName in ic.tddomains) {
                  ic.selectionCls.selectResidueList(ic.tddomains[tddomainName], tddomainName, tddomainName, false, false);
              }
          }

          //if((ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined) && ic.bFullUi) {
          // deal with multiple chain align separately
          if((ic.icn3dui.cfg.align !== undefined ||(ic.icn3dui.cfg.chainalign !== undefined && ic.chainidArray.length == 2) ) && ic.bFullUi) {
            ic.selectionCls.selectResidueList(ic.consHash1, ic.conservedName1, ic.conservedName1, false, false);
            ic.selectionCls.selectResidueList(ic.consHash2, ic.conservedName2, ic.conservedName2, false, false);

            ic.selectionCls.selectResidueList(ic.nconsHash1, ic.nonConservedName1, ic.nonConservedName1, false, false);
            ic.selectionCls.selectResidueList(ic.nconsHash2, ic.nonConservedName2, ic.nonConservedName2, false, false);

            ic.selectionCls.selectResidueList(ic.nalignHash1, ic.notAlignedName1, ic.notAlignedName1, false, false);
            ic.selectionCls.selectResidueList(ic.nalignHash2, ic.notAlignedName2, ic.notAlignedName2, false, false);

            // for alignment, show aligned residues, chemicals, and ions
            let  dAtoms = {}
            for(let alignChain in ic.alnChains) {
                dAtoms = me.hashUtilsCls.unionHash(dAtoms, ic.alnChains[alignChain]);
            }

            let  residuesHash = {}, chains = {}
            for(let i in dAtoms) {
                let  atom = ic.atoms[i];

                let  chainid = atom.structure + '_' + atom.chain;
                let  resid = chainid + '_' + atom.resi;
                residuesHash[resid] = 1;
                chains[chainid] = 1;
            }

            let  commandname = 'protein_aligned';
            let  commanddescr = 'aligned protein and nucleotides';
            let  select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));

            //ic.selectionCls.addCustomSelection(Object.keys(residuesHash), Object.keys(dAtoms), commandname, commanddescr, select, true);
            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
          }
    }

    //Set the menu of defined sets with an array of defined names "commandnameArray".
    setAtomMenu(commandnameArray) { let  ic = this.icn3d, me = ic.icn3dui;
      let  html = "";

      let  nameArray1 =(ic.defNames2Residues !== undefined) ? Object.keys(ic.defNames2Residues) : [];
      let  nameArray2 =(ic.defNames2Atoms !== undefined) ? Object.keys(ic.defNames2Atoms) : [];

      let  nameArrayTmp = nameArray1.concat(nameArray2).sort();

      let  nameArray = [];
    //  $.each(nameArrayTmp, function(i, el){
    //       if($.inArray(el, nameArray) === -1) nameArray.push(el);
    //  });
      nameArrayTmp.forEach(elem => {
           if($.inArray(elem, nameArray) === -1) nameArray.push(elem);
      });

      //for(let i in ic.defNames2Atoms) {
      for(let i = 0, il = nameArray.length; i < il; ++i) {
          let  name = nameArray[i];

          let  atom, atomHash;
          if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(name)) {
              let  atomArray = ic.defNames2Atoms[name];

              if(atomArray.length > 0) atom = ic.atoms[atomArray[0]];
          }
          else if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(name)) {
              let  residueArray = ic.defNames2Residues[name];
              if(residueArray.length > 0) {
                  atomHash = ic.residues[residueArray[0]]
                  if(atomHash) {
                      atom = ic.atoms[Object.keys(atomHash)[0]];
                  }
              }
          }

          let  colorStr =(atom === undefined || atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
          let  color =(atom !== undefined && atom.color !== undefined) ? colorStr : '000000';

          if(commandnameArray.indexOf(name) != -1) {
            html += "<option value='" + name + "' style='color:#" + color + "' selected='selected'>" + name + "</option>";
          }
          else {
            html += "<option value='" + name + "' style='color:#" + color + "'>" + name + "</option>";
          }
      }

      return html;
    }

    setChainsInMenu() { let  ic = this.icn3d, me = ic.icn3dui;
        for(let chainid in ic.chains) {
            // skip chains with one residue/chemical
            if(ic.chainsSeq[chainid] && ic.chainsSeq[chainid].length > 1) {
              //ic.defNames2Atoms[chainid] = Object.keys(ic.chains[chainid]);
              ic.defNames2Residues[chainid] = Object.keys(ic.firstAtomObjCls.getResiduesFromAtoms(ic.chains[chainid]));
              ic.defNames2Descr[chainid] = chainid;

              let  pos = chainid.indexOf('_');
              let  structure = chainid.substr(0, pos);
              let  chain = chainid.substr(pos + 1);

              ic.defNames2Command[chainid] = 'select $' + structure + '.' + chain;
            }
        }

        // select whole structure
        if(Object.keys(ic.structures) == 1) {
          let  structure = Object.keys(ic.structures)[0];

          ic.defNames2Residues[structure] = Object.keys(ic.residues);
          ic.defNames2Descr[structure] = structure;

          ic.defNames2Command[structure] = 'select $' + structure;
        }
        else {
            let  resArray = Object.keys(ic.residues);
            let  structResHash = {}
            for(let i = 0, il = resArray.length; i < il; ++i) {
                let  resid = resArray[i];
                let  pos = resid.indexOf('_');
                let  structure = resid.substr(0, pos);
                if(structResHash[structure] === undefined) {
                    structResHash[structure] = [];
                }
                structResHash[structure].push(resid);
            }

            for(let structure in structResHash) {
              ic.defNames2Residues[structure] = structResHash[structure];
              ic.defNames2Descr[structure] = structure;

              ic.defNames2Command[structure] = 'select $' + structure;
            }
        }
    }

    setTransmemInMenu(posZ, negZ, bReset) { let  ic = this.icn3d, me = ic.icn3dui;
        // set transmembrane, extracellular, intracellular
        if(ic.bOpm) {
          let  transmembraneHash = {}, extracellularHash = {}, intracellularHash = {}
          for(let serial in ic.atoms) {
              let  atom = ic.atoms[serial];

              if(atom.resn === 'DUM') continue;

              let  residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
              if(atom.coord.z > posZ) {
                  extracellularHash[residueid] = 1;
              }
              else if(atom.coord.z < negZ) {
                  intracellularHash[residueid] = 1;
              }
              else {
                  transmembraneHash[residueid] = 1;
              }
          }

          let  extraStr =(bReset) ? '2' : '';

          if(Object.keys(transmembraneHash).length > 0) {
              ic.defNames2Residues['transmembrane' + extraStr] = Object.keys(transmembraneHash);
              ic.defNames2Descr['transmembrane' + extraStr] = 'transmembrane' + extraStr;
              ic.defNames2Command['transmembrane' + extraStr] = 'select :transmembrane' + extraStr;
          }

          if(Object.keys(extracellularHash).length > 0) {
              ic.defNames2Residues['extracellular' + extraStr] = Object.keys(extracellularHash);
              ic.defNames2Descr['extracellular' + extraStr] = 'extracellular' + extraStr;
              ic.defNames2Command['extracellular' + extraStr] = 'select :extracellular' + extraStr;
          }

          if(Object.keys(intracellularHash).length > 0) {
              ic.defNames2Residues['intracellular' + extraStr] = Object.keys(intracellularHash);
              ic.defNames2Descr['intracellular' + extraStr] = 'intracellular' + extraStr;
              ic.defNames2Command['intracellular' + extraStr] = 'select :intracellular' + extraStr;
          }
        }
    }

    //Display the menu of defined sets. All chains and defined custom sets are listed in the menu.
    //All new custom sets will be displayed in the menu.
    showSets() { let  ic = this.icn3d, me = ic.icn3dui;
        if(!ic.icn3dui.bNode) {
            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_definedsets', 'Select sets');
            $("#" + ic.pre + "dl_setsmenu").show();
            $("#" + ic.pre + "dl_setoperations").show();

            $("#" + ic.pre + "dl_command").hide();

            $("#" + ic.pre + "atomsCustom").resizable();
        }

        let  prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
        let  prevDAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);

        if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
           this.setPredefinedInMenu();

           ic.bSetChainsAdvancedMenu = true;
        }

        ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
        ic.dAtoms = me.hashUtilsCls.cloneHash(prevDAtoms);

        ic.hlUpdateCls.updateHlMenus();
    }

    clickCustomAtoms() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        //me.myEventCls.onIds("#" + ic.pre + "atomsCustom", "change", function(e) { let  ic = thisClass.icn3d;
        $("#" + ic.pre + "atomsCustom").change(function(e) { let  ic = thisClass.icn3d;
           let  nameArray = $(this).val();

           if(nameArray !== null) {
             // log the selection
             //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select saved atoms ' + nameArray.toString(), true);

             let  bUpdateHlMenus = false;
             thisClass.changeCustomAtoms(nameArray, bUpdateHlMenus);
             //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select saved atoms ' + nameArray.join(' ' + ic.setOperation + ' '), true);
             ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select sets ' + nameArray.join(' ' + ic.setOperation + ' '), true);

             ic.bSelectResidue = false;
           }
        });

        me.myEventCls.onIds("#" + ic.pre + "atomsCustom", "focus", function(e) { let  ic = thisClass.icn3d;
           if(me.utilsCls.isMobile()) $("#" + ic.pre + "atomsCustom").val("");
        });
    }

    //Delete selected sets in the menu of "Defined Sets".
    deleteSelectedSets() { let  ic = this.icn3d, me = ic.icn3dui;
       let  nameArray = $("#" + ic.pre + "atomsCustom").val();

       for(let i = 0; i < nameArray.length; ++i) {
         let  selectedSet = nameArray[i];

         if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) &&(ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

         if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {
             delete ic.defNames2Atoms[selectedSet];
         }

         if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
             delete ic.defNames2Residues[selectedSet];
         }
       } // outer for

       ic.hlUpdateCls.updateHlMenus();
    }

    //HighlightAtoms are set up based on the selected custom names "nameArray" in the atom menu.
    //The corresponding atoms are neither highlighted in the sequence dialog nor in the 3D structure
    //since not all residue atom are selected.
    changeCustomAtoms(nameArray, bUpdateHlMenus) { let  ic = this.icn3d, me = ic.icn3dui;
       ic.hAtoms = {}

       for(let i = 0; i < nameArray.length; ++i) {
         let  selectedSet = nameArray[i];

         if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) &&(ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

         if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {
             let  atomArray = ic.defNames2Atoms[selectedSet];

             for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                 ic.hAtoms[atomArray[j]] = 1;
             }
         }

         if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
             let  residueArrayTmp = ic.defNames2Residues[selectedSet];

             let  atomHash = {}
             for(let j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
                 atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueArrayTmp[j]]);
             }

             ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomHash);
         }
       } // outer for

       ic.hlUpdateCls.updateHlAll(nameArray, bUpdateHlMenus);

       // show selected chains in annotation window
       ic.annotationCls.showAnnoSelectedChains();

       // clear commmand
       $("#" + ic.pre + "command").val("");
       $("#" + ic.pre + "command_name").val("");
       //$("#" + ic.pre + "command_desc").val("");

       // update the commands in the dialog
       for(let i = 0, il = nameArray.length; i < il; ++i) {
           let  atomArray = ic.defNames2Atoms[nameArray[i]];
           let  residueArray = ic.defNames2Residues[nameArray[i]];
           let  atomTitle = ic.defNames2Descr[nameArray[i]];

           if(i === 0) {
             //$("#" + ic.pre + "command").val(atomCommand);
             $("#" + ic.pre + "command").val('saved atoms ' + nameArray[i]);
             $("#" + ic.pre + "command_name").val(nameArray[i]);
           }
           else {
             let  prevValue = $("#" + ic.pre + "command").val();
             $("#" + ic.pre + "command").val(prevValue + ' ' + ic.setOperation + ' ' + nameArray[i]);

             prevValue = $("#" + ic.pre + "command_name").val();
             $("#" + ic.pre + "command_name").val(prevValue + ' ' + ic.setOperation + ' ' + nameArray[i]);
           }
       } // outer for
    }

    setHAtomsFromSets(nameArray, type) { let  ic = this.icn3d, me = ic.icn3dui;
       for(let i = 0; i < nameArray.length; ++i) {
         let  selectedSet = nameArray[i];

         if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(selectedSet)) &&(ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(selectedSet)) ) continue;

         if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(selectedSet)) {

             let  atomArray = ic.defNames2Atoms[selectedSet];

             if(type === 'or') {
                 for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                     ic.hAtoms[atomArray[j]] = 1;
                 }
             }
             else if(type === 'and') {
                 let  atomHash = {}
                 for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                     atomHash[atomArray[j]] = 1;
                 }

                 ic.hAtoms = me.hashUtilsCls.intHash(ic.hAtoms, atomHash);
             }
             else if(type === 'not') {
                 //for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                 //    ic.hAtoms[atomArray[j]] = undefined;
                 //}

                 let  atomHash = {}
                 for(let j = 0, jl = atomArray.length; j < jl; ++j) {
                     atomHash[atomArray[j]] = 1;
                 }

                 ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, atomHash);
             }
         }

         if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(selectedSet)) {
             let  residueArrayTmp = ic.defNames2Residues[selectedSet];

             let  atomHash = {}
             for(let j = 0, jl = residueArrayTmp.length; j < jl; ++j) {
                 atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[residueArrayTmp[j]]);
             }

             if(type === 'or') {
                 ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomHash);
             }
             else if(type === 'and') {
                 ic.hAtoms = me.hashUtilsCls.intHash(ic.hAtoms, atomHash);
             }
             else if(type === 'not') {
                 ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, atomHash);
             }
         }
       } // outer for
    }

    updateAdvancedCommands(nameArray, type) { let  ic = this.icn3d, me = ic.icn3dui;
       // update the commands in the dialog
       let  separator = ' ' + type + ' ';
       for(let i = 0, il = nameArray.length; i < il; ++i) {
           if(i === 0 && type == 'or') {
             $("#" + ic.pre + "command").val('saved atoms ' + nameArray[i]);
             $("#" + ic.pre + "command_name").val(nameArray[i]);
           }
           else {
             let  prevValue = $("#" + ic.pre + "command").val();
             $("#" + ic.pre + "command").val(prevValue + separator + nameArray[i]);

             prevValue = $("#" + ic.pre + "command_name").val();
             $("#" + ic.pre + "command_name").val(prevValue + separator + nameArray[i]);
           }
       } // outer for
    }

    combineSets(orArray, andArray, notArray, commandname) { let  ic = this.icn3d, me = ic.icn3dui;
       ic.hAtoms = {}
       this.setHAtomsFromSets(orArray, 'or');

       if(Object.keys(ic.hAtoms).length == 0) ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
       this.setHAtomsFromSets(andArray, 'and');

       this.setHAtomsFromSets(notArray, 'not');

       // expensive to update, avoid it when loading script
       //ic.hlUpdateCls.updateHlAll();
       if(!ic.bInitial) ic.hlUpdateCls.updateHlAll();

       // show selected chains in annotation window
       ic.annotationCls.showAnnoSelectedChains();

       // clear commmand
       $("#" + ic.pre + "command").val("");
       $("#" + ic.pre + "command_name").val("");

       this.updateAdvancedCommands(orArray, 'or');
       this.updateAdvancedCommands(andArray, 'and');
       this.updateAdvancedCommands(notArray, 'not');

       if(commandname !== undefined) {
           let  select = "select " + $("#" + ic.pre + "command").val();

           $("#" + ic.pre + "command_name").val(commandname);
           ic.selectionCls.addCustomSelection(Object.keys(ic.hAtoms), commandname, commandname, select, false);
       }
    }

    commandSelect(postfix) { let  ic = this.icn3d, me = ic.icn3dui;
           let  select = $("#" + ic.pre + "command" + postfix).val();

           let  commandname = $("#" + ic.pre + "command_name" + postfix).val().replace(/;/g, '_').replace(/\s+/g, '_');

           if(select) {
               ic.selByCommCls.selectByCommand(select, commandname, commandname);
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + select + ' | name ' + commandname, true);
           }
    }

    clickCommand_apply() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        me.myEventCls.onIds("#" + ic.pre + "command_apply", "click", function(e) { let  ic = thisClass.icn3d;
           e.preventDefault();

           thisClass.commandSelect('');
        });

        me.myEventCls.onIds("#" + ic.pre + "command_apply2", "click", function(e) { let  ic = thisClass.icn3d;
           e.preventDefault();
           thisClass.commandSelect('2');
        });

    }

    selectCombinedSets(strSets, commandname) { let  ic = this.icn3d, me = ic.icn3dui;
        let  idArray = strSets.split(' ');

        let  orArray = [], andArray = [], notArray = [];
        let  prevLabel = 'or';

        for(let i = 0, il = idArray.length; i < il; ++i) {
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

        if(idArray !== null) this.combineSets(orArray, andArray, notArray, commandname);
    }

    clickModeswitch() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        me.myEventCls.onIds("#" + ic.pre + "modeswitch", "click", function(e) {
            if($("#" + ic.pre + "modeswitch")[0] !== undefined && $("#" + ic.pre + "modeswitch")[0].checked) { // mode: selection
                thisClass.setModeAndDisplay('selection');
            }
            else { // mode: all
                thisClass.setModeAndDisplay('all');
            }
        });
    }

    setModeAndDisplay(mode) { let  ic = this.icn3d, me = ic.icn3dui;
        if(mode === 'all') { // mode all
            this.setMode('all');

            // remember previous selection
            ic.prevHighlightAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

           // select all
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set mode all", true);

           ic.selectionCls.selectAll();

           ic.drawCls.draw();
        }
        else { // mode selection
            this.setMode('selection');

            // get the previous hAtoms
            if(ic.prevHighlightAtoms !== undefined) {
                ic.hAtoms = me.hashUtilsCls.cloneHash(ic.prevHighlightAtoms);
            }
            else {
                ic.selectionCls.selectAll();
            }

            ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("set mode selection", true);

            ic.hlUpdateCls.updateHlAll();
        }
    }

    setMode(mode) { let  ic = this.icn3d, me = ic.icn3dui;
        if(mode === 'all') { // mode all
            // set text
            $("#" + ic.pre + "modeall").show();
            $("#" + ic.pre + "modeselection").hide();

            if($("#" + ic.pre + "modeswitch")[0] !== undefined) $("#" + ic.pre + "modeswitch")[0].checked = false;

            if($("#" + ic.pre + "style").hasClass('icn3d-modeselection')) $("#" + ic.pre + "style").removeClass('icn3d-modeselection');
            if($("#" + ic.pre + "color").hasClass('icn3d-modeselection')) $("#" + ic.pre + "color").removeClass('icn3d-modeselection');
            //if($("#" + ic.pre + "surface").hasClass('icn3d-modeselection')) $("#" + ic.pre + "surface").removeClass('icn3d-modeselection');
        }
        else { // mode selection
            //if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
                // set text
                $("#" + ic.pre + "modeall").hide();
                $("#" + ic.pre + "modeselection").show();

                if($("#" + ic.pre + "modeswitch")[0] !== undefined) $("#" + ic.pre + "modeswitch")[0].checked = true;

                if(!$("#" + ic.pre + "style").hasClass('icn3d-modeselection')) $("#" + ic.pre + "style").addClass('icn3d-modeselection');
                if(!$("#" + ic.pre + "color").hasClass('icn3d-modeselection')) $("#" + ic.pre + "color").addClass('icn3d-modeselection');
                //if(!$("#" + ic.pre + "surface").hasClass('icn3d-modeselection')) $("#" + ic.pre + "surface").addClass('icn3d-modeselection');

                // show selected chains in annotation window
                //ic.annotationCls.showAnnoSelectedChains();
            //}
        }
    }
    getAtomsFromOneSet(commandname) {  let  ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
       let  residuesHash = {}
       // defined sets is not set up
       if(ic.defNames2Residues['proteins'] === undefined) {
           this.showSets();
       }
       //for(let i = 0, il = nameArray.length; i < il; ++i) {
           //var commandname = nameArray[i];
           if(Object.keys(ic.chains).indexOf(commandname) !== -1) {
               residuesHash = me.hashUtilsCls.unionHash(residuesHash, ic.chains[commandname]);
           }
           else {
               if(ic.defNames2Residues[commandname] !== undefined && ic.defNames2Residues[commandname].length > 0) {
                   for(let j = 0, jl = ic.defNames2Residues[commandname].length; j < jl; ++j) {
                       let  resid = ic.defNames2Residues[commandname][j]; // return an array of resid
                       residuesHash = me.hashUtilsCls.unionHash(residuesHash, ic.residues[resid]);
                   }
               }
               if(ic.defNames2Atoms[commandname] !== undefined && ic.defNames2Atoms[commandname].length > 0) {
                   for(let j = 0, jl = ic.defNames2Atoms[commandname].length; j < jl; ++j) {
                       //var resid = ic.defNames2Atoms[commandname][j]; // return an array of serial
                       //residuesHash = me.hashUtilsCls.unionHash(residuesHash, ic.residues[resid]);
                       let  serial = ic.defNames2Atoms[commandname][j]; // return an array of serial
                       residuesHash[serial] = 1;
                   }
               }
           }
       //}
       return residuesHash;
    }

/*
    getAtomsFromSets(nameArray) {  let  ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
       let  residuesHash = {}
       for(let i = 0, il = nameArray.length; i < il; ++i) {
           commandname = nameArray[i];
           let  residuesHashTmp = this.getAtomsFromOneSet(commandname);
           residuesHash = me.hashUtilsCls.unionHash(residuesHash, residuesHashTmp);
       }
       return residuesHash;
    }
*/

    getAtomsFromNameArray(nameArray) {  let  ic = this.icn3d, me = ic.icn3dui;
        let  selAtoms = {}
        for(let i = 0, il = nameArray.length; i < il; ++i) {
            if(nameArray[i] === 'non-selected') { // select all hAtoms
               let  currAtoms = {}
               for(let i in ic.atoms) {
                   if(!ic.hAtoms.hasOwnProperty(i) && ic.dAtoms.hasOwnProperty(i)) {
                       currAtoms[i] = ic.atoms[i];
                   }
               }
               selAtoms = me.hashUtilsCls.unionHash(selAtoms, currAtoms);
            }
            else if(nameArray[i] === 'selected') {
                selAtoms = me.hashUtilsCls.unionHash(selAtoms, me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms) );
            }
            else {
                selAtoms = me.hashUtilsCls.unionHash(selAtoms, me.hashUtilsCls.hash2Atoms(this.getAtomsFromOneSet(nameArray[i]), ic.atoms) );
            }
        }
        if(nameArray.length == 0) selAtoms = ic.atoms;
        return selAtoms;
    }

}

export {DefinedSets}
