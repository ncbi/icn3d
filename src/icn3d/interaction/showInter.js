/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class ShowInter {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async showInteractions(type) { let ic = this.icn3d, me = ic.icn3dui;
       let nameArray = $("#" + ic.pre + "atomsCustomHbond").val();
       let nameArray2 = $("#" + ic.pre + "atomsCustomHbond2").val();

       let atoms, atoms2;
       atoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
       atoms2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);

       // add the interacting atoms to display
       ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, atoms);
       ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, atoms2);

       if(type == 'ligplot') {
            let residueHash1 = ic.firstAtomObjCls.getResiduesFromAtoms(atoms);
            let residueHash2 = ic.firstAtomObjCls.getResiduesFromAtoms(atoms2);

            if(Object.keys(residueHash1).length > 1 && Object.keys(residueHash2).length > 1) {
                alert("Please select one ligand or residue as one of the interaction sets...");
                return;
            }

            // switch the sets to make the first set as the ligand
            if(Object.keys(residueHash1).length < Object.keys(residueHash2).length) {
                nameArray2 = $("#" + ic.pre + "atomsCustomHbond").val();
                nameArray = $("#" + ic.pre + "atomsCustomHbond2").val();
         
                atoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
                atoms2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
            }
       }

       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           ic.definedSetsCls.setMode('selection');
           let bHbond = $("#" + ic.pre + "analysis_hbond")[0].checked;
           let bSaltbridge = $("#" + ic.pre + "analysis_saltbridge")[0].checked;
           let bInteraction = $("#" + ic.pre + "analysis_contact")[0].checked;
           let bHalogen = $("#" + ic.pre + "analysis_halogen")[0].checked;
           let bPication = $("#" + ic.pre + "analysis_pication")[0].checked;
           let bPistacking = $("#" + ic.pre + "analysis_pistacking")[0].checked;
           let thresholdHbond = $("#" + ic.pre + "hbondthreshold").val();
           let thresholdSaltbridge = $("#" + ic.pre + "saltbridgethreshold").val();
           let thresholdContact = $("#" + ic.pre + "contactthreshold").val();
           let thresholdHalogen = $("#" + ic.pre + "halogenthreshold").val();
           let thresholdPication = $("#" + ic.pre + "picationthreshold").val();
           let thresholdPistacking = $("#" + ic.pre + "pistackingthreshold").val();
           let thresholdStr = 'threshold ' + thresholdHbond + ' ' + thresholdSaltbridge + ' ' + thresholdContact
            + ' ' + thresholdHalogen + ' ' + thresholdPication + ' ' + thresholdPistacking;
           let result = await ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, ic.bHbondCalc, type,
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
           let interactionTypes = result.interactionTypes;

           let bHbondCalcStr =(ic.bHbondCalc) ? "true" : "false";
           let tmpStr = nameArray2 + " " + nameArray + " | " + interactionTypes + " | " + bHbondCalcStr + " | " + thresholdStr;
           if(type == '3d') {
               me.htmlCls.clickMenuCls.setLogCmd("display interaction 3d | " + tmpStr, true);
           }
           else if(type == 'view') {
               me.htmlCls.clickMenuCls.setLogCmd("view interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save1') {
               me.htmlCls.clickMenuCls.setLogCmd("save1 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save2') {
               me.htmlCls.clickMenuCls.setLogCmd("save2 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'linegraph') {
               me.htmlCls.clickMenuCls.setLogCmd("line graph interaction pairs | " + tmpStr, true);
           }
           else if(type == 'scatterplot') {
               me.htmlCls.clickMenuCls.setLogCmd("scatterplot interaction pairs | " + tmpStr, true);
           }
           else if(type == 'ligplot') {
            me.htmlCls.clickMenuCls.setLogCmd("ligplot interaction pairs | " + tmpStr, true);
           }
           else if(type == 'graph') { // force-directed graph
                let dist_ss = parseInt($("#" + ic.pre + "dist_ss").val());
                let dist_coil = parseInt($("#" + ic.pre + "dist_coil").val());
                let dist_hbond = parseInt($("#" + ic.pre + "dist_hbond").val());
                let dist_inter = parseInt($("#" + ic.pre + "dist_inter").val());
                let dist_ssbond = parseInt($("#" + ic.pre + "dist_ssbond").val());
                let dist_ionic = parseInt($("#" + ic.pre + "dist_ionic").val());
                let dist_halogen = parseInt($("#" + ic.pre + "dist_halogen").val());
                let dist_pication = parseInt($("#" + ic.pre + "dist_pication").val());
                let dist_pistacking = parseInt($("#" + ic.pre + "dist_pistacking").val());
                me.htmlCls.clickMenuCls.setLogCmd("graph interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes
                    + " | " + bHbondCalcStr + " | " + thresholdStr + " | " + dist_ss + " " + dist_coil
                    + " " + dist_hbond + " " + dist_inter + " " + dist_ssbond + " " + dist_ionic
                    + " " + dist_halogen + " " + dist_pication + " " + dist_pistacking, true);
           }
           // avoid repeated calculation
           ic.bHbondCalc = true;
       }
    }

    // between the highlighted and atoms in nameArray
    //Show the hydrogen bonds between chemicals and proteins/nucleotides with dashed-lines.
    //"threshold" defines the distance of hydrogen bonds.
    showHbonds(threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { let ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        let hbonds_saltbridge, select;
        if(bSaltbridge) {
            hbonds_saltbridge = 'saltbridge';
            select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        }
        else {
            hbonds_saltbridge = 'hbonds';
            select = 'hbonds ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        }
        ic.opts[hbonds_saltbridge] = "yes";
        ic.opts["water"] = "dot";
        let firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        // let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);

        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );
            let selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.hash2Atoms(complement, ic.atoms), me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );

            let commanddesc;
            if(bSaltbridge) {
                ic.resid2ResidhashSaltbridge = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have salt bridges with the selected atoms';
            }
            else {
                ic.resid2ResidhashHbond = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            }
            let residues = {}, atomArray = undefined;
            for(let i in selectedAtoms) {
                let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(let resid in residues) {
                for(let i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    //ic.atoms[i].style2 = 'lines';
                }
            }

            //let commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            let commandname = hbonds_saltbridge + '_auto';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            let nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    showHydrogens() { let ic = this.icn3d, me = ic.icn3dui;
        // get hydrogen atoms for currently selected atoms
        if(me.cfg.cid !== undefined) {
            for(let i in ic.hAtoms) {
                    let atom = ic.atoms[i];
            
                    //if(atom.name !== 'H') {
                    if(atom.elem.substr(0, 1) !== 'H') {
                        ic.atoms[atom.serial].bonds = ic.atoms[atom.serial].bonds2.concat();
                        ic.atoms[atom.serial].bondOrder = ic.atoms[atom.serial].bondOrder2.concat();
                        for(let j = 0, jl = ic.atoms[atom.serial].bonds.length; j < jl; ++j) {
                            let serial = ic.atoms[atom.serial].bonds[j];
                            //if(ic.atoms[serial].name === 'H') {
                            if(ic.atoms[serial].elem.substr(0, 1) === 'H') {
                                ic.dAtoms[serial] = 1;
                                ic.hAtoms[serial] = 1;
                            }
                        }
                    }
            }
        }
        else {
            // for(let serial in ic.atoms) {
            //     ic.dAtoms[serial] = 1;
            //     ic.hAtoms[serial] = 1;
            // }  

            // add bonds in heavy atoms
            //for(let serial in ic.hAtoms) {
            for(let serial in ic.atoms) {
                let atom = ic.atoms[serial];
                //if(atom.name === 'H') {
                if(atom.elem.substr(0, 1) === 'H') {                   
                    if(ic.atoms[serial].bonds.length > 0) {
                        let otherSerial = ic.atoms[serial].bonds[0];
                        ic.atoms[otherSerial].bonds.push(atom.serial);
                        if(ic.atoms[otherSerial].bondOrder) ic.atoms[otherSerial].bondOrder.push(1);
                    }        
                    
                    ic.dAtoms[serial] = 1;
                }
            }
        }

        //!!!ic.bShowHighlight = false;
    }

    hideHydrogens() { let ic = this.icn3d, me = ic.icn3dui;
       // remove hydrogen atoms for currently selected atoms
       for(let i in ic.hAtoms) {
           let atom = ic.atoms[i];
           //if(atom.name === 'H') {
           if(atom.elem.substr(0, 1) === 'H') {
               if(ic.atoms[atom.serial].bonds.length > 0) {
                   let otherSerial = ic.atoms[atom.serial].bonds[0];
                   //ic.atoms[atom.serial].bonds = [];
                   let pos = (ic.atoms[otherSerial].bonds) ? ic.atoms[otherSerial].bonds.indexOf(atom.serial) : -1;
                   if(pos !== -1) {
                       ic.atoms[otherSerial].bonds.splice(pos, 1);
                       if(ic.atoms[otherSerial].bondOrder) ic.atoms[otherSerial].bondOrder.splice(pos, 1);
                   }
               }
               delete ic.dAtoms[atom.serial];
               delete ic.hAtoms[atom.serial];            
           }
       }
    }

    hideExtraBonds() { let ic = this.icn3d, me = ic.icn3dui;
        for(let i in ic.atoms) {
            ic.atoms[i].style2 = 'nothing';
        }

        for(let i in ic.sidec) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style2 = ic.opts["sidec"];
            }
        }

        for(let i in ic.water) {
            if(ic.hAtoms.hasOwnProperty(i)) {
                ic.atoms[i].style = ic.opts["water"];
            }
        }
    }

    hideHbondsContacts() { let ic = this.icn3d, me = ic.icn3dui;
           let select = "set hbonds off";
           me.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.hBondCls.hideHbonds();
           //ic.drawCls.draw();
           select = "set salt bridge off";
           me.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.saltbridgeCls.hideSaltbridge();
           select = "set contact off";
           me.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.contactCls.hideContact();
           select = "set halogen pi off";
           me.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.piHalogenCls.hideHalogenPi();

           this.hideExtraBonds();
    }

    showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { let ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        let hbonds_saltbridge, select;
        hbonds_saltbridge = 'saltbridge';
        select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[hbonds_saltbridge] = "yes";
        let firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );
            let selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.hash2Atoms(complement, ic.atoms), me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );
            let commanddesc;
            ic.resid2ResidhashSaltbridge = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have ionic interactions with the selected atoms';
            let residues = {}, atomArray = undefined;
            for(let i in selectedAtoms) {
                let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(let resid in residues) {
                for(let i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            //let commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            let commandname = hbonds_saltbridge + '_auto';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            let nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, interactionType) { let ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        let select = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[interactionType] = "yes";
        let firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            // let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), type, interactionType );
            let selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.hash2Atoms(firstSetAtoms, ic.atoms), me.hashUtilsCls.hash2Atoms(complement, ic.atoms), parseFloat(threshold), type, interactionType );
            let commanddesc;
            if(interactionType == 'halogen') {
                ic.resid2ResidhashHalogen = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have halogen bonds with the selected atoms';
            }
            else if(interactionType == 'pi-cation') {
                ic.resid2ResidhashPication = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have pi-cation interactions with the selected atoms';
            }
            else if(interactionType == 'pi-stacking') {
                ic.resid2ResidhashPistacking = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have pi-stacking with the selected atoms';
            }
            let residues = {}, atomArray = undefined;
            for(let i in selectedAtoms) {
                let residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(let resid in residues) {
                for(let i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            //let commandname = interactionType + '_' + firstAtom.serial;
            let commandname = interactionType + '_auto';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            let nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    // show all cross-linkages bonds
    showClbonds() { let ic = this.icn3d, me = ic.icn3dui;
         ic.opts["clbonds"] = "yes";
         let select = 'cross linkage';
         // find all bonds to chemicals
         let residues = ic.applyClbondsCls.applyClbondsOptions();
         for(let resid in residues) {
             ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
         }
         if(Object.keys(residues).length > 0) {
            let commandname = 'clbonds';
            let commanddesc = 'all atoms that have cross-linkages';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            let nameArray = [commandname];
            //ic.changeCustomResidues(nameArray);
            ic.selectionCls.saveSelectionIfSelected();
            // show side chains for the selected atoms
            //ic.setOptionCls.setStyle('sidec', 'stick');
            ic.drawCls.draw();
         }
    }

    // show all disulfide bonds
    showSsbonds() { let ic = this.icn3d, me = ic.icn3dui;
         ic.opts["ssbonds"] = "yes";
         let select = 'disulfide bonds';
    //         ic.hlUpdateCls.removeHlMenus();
         let residues = {}, atomArray = undefined;
         let structureArray = Object.keys(ic.structures);
         for(let s = 0, sl = structureArray.length; s < sl; ++s) {
             let structure = structureArray[s];
             if(ic.ssbondpnts[structure] === undefined) continue;
             for(let i = 0, lim = Math.floor(ic.ssbondpnts[structure].length / 2); i < lim; i++) {
                let res1 = ic.ssbondpnts[structure][2 * i], res2 = ic.ssbondpnts[structure][2 * i + 1];
                residues[res1] = 1;
                residues[res2] = 1;
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[res1]);
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[res2]);
            }
        }
        if(Object.keys(residues).length > 0) {
            let commandname = 'ssbonds';
            let commanddesc = 'all atoms that have disulfide bonds';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            let nameArray = [commandname];
            //ic.changeCustomResidues(nameArray);
            ic.selectionCls.saveSelectionIfSelected();
            // show side chains for the selected atoms
            //ic.setOptionCls.setStyle('sidec', 'stick');
            ic.drawCls.draw();
        }
    }

    //Select a sphere around the highlight atoms with a predefined distance.
    pickCustomSphere(radius, nameArray2, nameArray, bSphereCalc, bInteraction, type) {  let ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
        if(bSphereCalc) return;
        let select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
        if(bInteraction) {
            select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
            ic.opts['contact'] = "yes";
        }
        let atomlistTarget, otherAtoms;
        // could be ligands
        atomlistTarget = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        otherAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        let bGetPairs = true;
        let result = this.pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs);
        let residueArray = Object.keys(result.residues);
        ic.hAtoms = {}
        for(let index = 0, indexl = residueArray.length; index < indexl; ++index) {
          let residueid = residueArray[index];
          for(let i in ic.residues[residueid]) {
            ic.hAtoms[i] = 1;
          }
        }
        // do not change the set of displaying atoms
        //ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
        let commandname, commanddesc;
        let firstAtom = ic.firstAtomObjCls.getFirstAtomObj(atomlistTarget);
        if(firstAtom !== undefined) {
            commandname = "sphere." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
            if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + ic.pre + "contactthreshold").val() + "A";
            commanddesc = commandname;
            ic.selectionCls.addCustomSelection(residueArray, commandname, commanddesc, select, true);
        }
        ic.selectionCls.saveSelectionIfSelected();
        ic.drawCls.draw();
    }
    pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs, bIncludeTarget) {  let ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
        let atoms;
        if(bInteraction) {
            atoms = ic.contactCls.getAtomsWithinAtom(me.hashUtilsCls.hash2Atoms(otherAtoms, ic.atoms), me.hashUtilsCls.hash2Atoms(atomlistTarget, ic.atoms), parseFloat(radius), bGetPairs, bInteraction, undefined, bIncludeTarget);
            ic.resid2ResidhashInteractions = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        else {
            atoms = ic.contactCls.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction);
            ic.resid2ResidhashSphere = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        let residues = {}, atomArray = undefined;
        for(let i in atoms) {
            let atom = atoms[i];
            if(ic.bOpm && atom.resn === 'DUM') continue;
            let residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;
        }
        return {"residues": residues, "resid2Residhash": ic.resid2Residhash}
    }

}

export {ShowInter}

