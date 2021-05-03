/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {DefinedSets} from '../selection/definedSets.js';
import {ViewInterPairs} from '../interaction/viewInterPairs.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Contact} from '../interaction/contact.js';
import {HBond} from '../interaction/hBond.js';
import {PiHalogen} from '../interaction/piHalogen.js';
import {Saltbridge} from '../interaction/saltbridge.js';
import {Selection} from '../selection/selection.js';
import {Draw} from '../display/draw.js';
import {ApplyClbonds} from '../display/applyClbonds.js';
import {HlUpdate} from '../highlight/hlUpdate.js';

class ShowInter {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    showInteractions(type) { var ic = this.icn3d, me = ic.icn3dui;
       var nameArray = $("#" + ic.pre + "atomsCustomHbond").val();
       var nameArray2 = $("#" + ic.pre + "atomsCustomHbond2").val();
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           ic.definedSetsCls.setMode('selection');
           var bHbond = $("#" + ic.pre + "analysis_hbond")[0].checked;
           var bSaltbridge = $("#" + ic.pre + "analysis_saltbridge")[0].checked;
           var bInteraction = $("#" + ic.pre + "analysis_contact")[0].checked;
           var bHalogen = $("#" + ic.pre + "analysis_halogen")[0].checked;
           var bPication = $("#" + ic.pre + "analysis_pication")[0].checked;
           var bPistacking = $("#" + ic.pre + "analysis_pistacking")[0].checked;
           var thresholdHbond = $("#" + ic.pre + "hbondthreshold").val();
           var thresholdSaltbridge = $("#" + ic.pre + "saltbridgethreshold").val();
           var thresholdContact = $("#" + ic.pre + "contactthreshold").val();
           var thresholdHalogen = $("#" + ic.pre + "halogenthreshold").val();
           var thresholdPication = $("#" + ic.pre + "picationthreshold").val();
           var thresholdPistacking = $("#" + ic.pre + "pistackingthreshold").val();
           var thresholdStr = 'threshold ' + thresholdHbond + ' ' + thresholdSaltbridge + ' ' + thresholdContact
            + ' ' + thresholdHalogen + ' ' + thresholdPication + ' ' + thresholdPistacking;
           var result = ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, ic.bHbondCalc, type,
                bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
           var interactionTypes = result.interactionTypes;

           var bHbondCalcStr =(ic.bHbondCalc) ? "true" : "false";
           var tmpStr = nameArray2 + " " + nameArray + " | " + interactionTypes + " | " + bHbondCalcStr + " | " + thresholdStr;
           if(type == '3d') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("display interaction 3d | " + tmpStr, true);
           }
           else if(type == 'view') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("view interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save1') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("save1 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'save2') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("save2 interaction pairs | " + tmpStr, true);
           }
           else if(type == 'linegraph') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("line graph interaction pairs | " + tmpStr, true);
           }
           else if(type == 'scatterplot') {
               ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("scatterplot interaction pairs | " + tmpStr, true);
           }
           else if(type == 'graph') { // force-directed graph
                var dist_ss = parseInt($("#" + ic.pre + "dist_ss").val());
                var dist_coil = parseInt($("#" + ic.pre + "dist_coil").val());
                var dist_hbond = parseInt($("#" + ic.pre + "dist_hbond").val());
                var dist_inter = parseInt($("#" + ic.pre + "dist_inter").val());
                var dist_ssbond = parseInt($("#" + ic.pre + "dist_ssbond").val());
                var dist_ionic = parseInt($("#" + ic.pre + "dist_ionic").val());
                var dist_halogen = parseInt($("#" + ic.pre + "dist_halogen").val());
                var dist_pication = parseInt($("#" + ic.pre + "dist_pication").val());
                var dist_pistacking = parseInt($("#" + ic.pre + "dist_pistacking").val());
                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("graph interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes
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
    showHbonds(threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        var hbonds_saltbridge, select;
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
        var firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.hBondCls.calculateChemicalHbonds(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );
            var commanddesc;
            if(bSaltbridge) {
                ic.resid2ResidhashSaltbridge = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that have salt bridges with the selected atoms';
            }
            else {
                ic.resid2ResidhashHbond = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
                commanddesc = 'all atoms that are hydrogen-bonded with the selected atoms';
            }
            var residues = {}, atomArray = undefined;
            for(var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    showHydrogens() { var ic = this.icn3d, me = ic.icn3dui;
       // get hydrogen atoms for currently selected atoms
       for(var i in ic.hAtoms) {
           var atom = ic.atoms[i];
           if(atom.name !== 'H') {
               ic.atoms[atom.serial].bonds = ic.atoms[atom.serial].bonds2.concat();
               ic.atoms[atom.serial].bondOrder = ic.atoms[atom.serial].bondOrder2.concat();
               for(var j = 0, jl = ic.atoms[atom.serial].bonds.length; j < jl; ++j) {
                   var serial = ic.atoms[atom.serial].bonds[j];
                   if(ic.atoms[serial].name === 'H') {
                       ic.dAtoms[serial] = 1;
                       ic.hAtoms[serial] = 1;
                   }
               }
           }
       }
    }
    hideHydrogens() { var ic = this.icn3d, me = ic.icn3dui;
       // remove hydrogen atoms for currently selected atoms
       for(var i in ic.hAtoms) {
           var atom = ic.atoms[i];
           if(atom.name === 'H') {
               if(ic.atoms[atom.serial].bonds.length > 0) {
                   var otherSerial = ic.atoms[atom.serial].bonds[0];
                   //ic.atoms[atom.serial].bonds = [];
                   var pos = ic.atoms[otherSerial].bonds.indexOf(atom.serial);
                   if(pos !== -1) {
                       ic.atoms[otherSerial].bonds.splice(pos, 1);
                       ic.atoms[otherSerial].bondOrder.splice(pos, 1);
                   }
               }
               delete ic.dAtoms[atom.serial];
               delete ic.hAtoms[atom.serial];
           }
       }
    }

    hideHbondsContacts() { var ic = this.icn3d, me = ic.icn3dui;
           var select = "set hbonds off";
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.hBondCls.hideHbonds();
           //ic.drawCls.draw();
           select = "set salt bridge off";
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.saltbridgeCls.hideSaltbridge();
           select = "set contact off";
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.contactCls.hideContact();
           select = "set halogen pi off";
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd(select, true);
           ic.piHalogenCls.hideHalogenPi();
    }

    showIonicInteractions(threshold, nameArray2, nameArray, bHbondCalc, bSaltbridge, type) { var ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        var hbonds_saltbridge, select;
        hbonds_saltbridge = 'saltbridge';
        select = 'salt bridge ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[hbonds_saltbridge] = "yes";
        var firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.saltbridgeCls.calculateIonicInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), parseFloat(threshold), bSaltbridge );
            var commanddesc;
            ic.resid2ResidhashSaltbridge = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
            commanddesc = 'all atoms that have ionic interactions with the selected atoms';
            var residues = {}, atomArray = undefined;
            for(var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = hbonds_saltbridge + '_' + firstAtom.serial;
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    showHalogenPi(threshold, nameArray2, nameArray, bHbondCalc, type, interactionType) { var ic = this.icn3d, me = ic.icn3dui;
        if(bHbondCalc) return;
        var select = interactionType + ' ' + threshold + ' | sets ' + nameArray2 + " " + nameArray + " | " + bHbondCalc;
        ic.opts[interactionType] = "yes";
        var firstSetAtoms, complement;
        firstSetAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        complement = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        var firstAtom = ic.firstAtomObjCls.getFirstAtomObj(firstSetAtoms);
        if(Object.keys(complement).length > 0 && Object.keys(firstSetAtoms).length > 0) {
            var selectedAtoms = ic.piHalogenCls.calculateHalogenPiInteractions(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, firstSetAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, complement, ic.atoms), parseFloat(threshold), type, interactionType );
            var commanddesc;
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
            var residues = {}, atomArray = undefined;
            for(var i in selectedAtoms) {
                var residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
                residues[residueid] = 1;
            }
            ic.hAtoms = {}
            for(var resid in residues) {
                for(var i in ic.residues[resid]) {
                    ic.hAtoms[i] = 1;
                    ic.atoms[i].style2 = 'stick';
                    if(ic.ions.hasOwnProperty(i)) ic.atoms[i].style2 = 'sphere';
                    //ic.atoms[i].style2 = 'lines';
                }
            }
            var commandname = interactionType + '_' + firstAtom.serial;
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            ic.selectionCls.saveSelectionIfSelected();
            ic.drawCls.draw();
        }
    }

    // show all cross-linkages bonds
    showClbonds() { var ic = this.icn3d, me = ic.icn3dui;
         ic.opts["clbonds"] = "yes";
         var select = 'cross linkage';
         // find all bonds to chemicals
         var residues = ic.applyClbondsCls.applyClbondsOptions();
         for(var resid in residues) {
             ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
         }
         if(Object.keys(residues).length > 0) {
            var commandname = 'clbonds';
            var commanddesc = 'all atoms that have cross-linkages';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            //ic.changeCustomResidues(nameArray);
            ic.selectionCls.saveSelectionIfSelected();
            // show side chains for the selected atoms
            //ic.setOptionCls.setStyle('sidec', 'stick');
            ic.drawCls.draw();
         }
    }

    // show all disulfide bonds
    showSsbonds() { var ic = this.icn3d, me = ic.icn3dui;
         ic.opts["ssbonds"] = "yes";
         var select = 'disulfide bonds';
    //         ic.hlUpdateCls.removeHlMenus();
         var residues = {}, atomArray = undefined;
         var structureArray = Object.keys(ic.structures);
         for(var s = 0, sl = structureArray.length; s < sl; ++s) {
             var structure = structureArray[s];
             if(ic.ssbondpnts[structure] === undefined) continue;
             for(var i = 0, lim = Math.floor(ic.ssbondpnts[structure].length / 2); i < lim; i++) {
                var res1 = ic.ssbondpnts[structure][2 * i], res2 = ic.ssbondpnts[structure][2 * i + 1];
                residues[res1] = 1;
                residues[res2] = 1;
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[res1]);
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[res2]);
            }
        }
        if(Object.keys(residues).length > 0) {
            var commandname = 'ssbonds';
            var commanddesc = 'all atoms that have disulfide bonds';
            ic.selectionCls.addCustomSelection(Object.keys(residues), commandname, commanddesc, select, true);
            var nameArray = [commandname];
            //ic.changeCustomResidues(nameArray);
            ic.selectionCls.saveSelectionIfSelected();
            // show side chains for the selected atoms
            //ic.setOptionCls.setStyle('sidec', 'stick');
            ic.drawCls.draw();
        }
    }

    //Select a sphere around the highlight atoms with a predefined distance.
    pickCustomSphere(radius, nameArray2, nameArray, bSphereCalc, bInteraction, type) {  var ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
        if(bSphereCalc) return;
        var select = "select zone cutoff " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
        if(bInteraction) {
            select = "interactions " + radius + " | sets " + nameArray2 + " " + nameArray + " | " + bSphereCalc;
            ic.opts['contact'] = "yes";
        }
        var atomlistTarget, otherAtoms;
        // could be ligands
        atomlistTarget = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
        otherAtoms = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
        var bGetPairs = true;
        var result = this.pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs);
        var residueArray = Object.keys(result.residues);
        ic.hAtoms = {}
        for(var index = 0, indexl = residueArray.length; index < indexl; ++index) {
          var residueid = residueArray[index];
          for(var i in ic.residues[residueid]) {
            ic.hAtoms[i] = 1;
          }
        }
        // do not change the set of displaying atoms
        //ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
        var commandname, commanddesc;
        var firstAtom = ic.firstAtomObjCls.getFirstAtomObj(atomlistTarget);
        if(firstAtom !== undefined) {
            commandname = "sphere." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + radius + "A";
            if(bInteraction) commandname = "interactions." + firstAtom.chain + ":" + me.utilsCls.residueName2Abbr(firstAtom.resn.substr(0, 3)).trim() + firstAtom.resi + "-" + $("#" + ic.pre + "contactthreshold").val() + "A";
            commanddesc = commandname;
            ic.selectionCls.addCustomSelection(residueArray, commandname, commanddesc, select, true);
        }
        ic.selectionCls.saveSelectionIfSelected();
        ic.drawCls.draw();
    }
    pickCustomSphere_base(radius, atomlistTarget, otherAtoms, bSphereCalc, bInteraction, type, select, bGetPairs) {  var ic = this.icn3d, me = ic.icn3dui;  // ic.pAtom is set already
        var atoms;
        if(bInteraction) {
            atoms = ic.contactCls.getAtomsWithinAtom(me.hashUtilsCls.intHash2Atoms(ic.dAtoms, otherAtoms, ic.atoms), me.hashUtilsCls.intHash2Atoms(ic.dAtoms, atomlistTarget, ic.atoms), parseFloat(radius), bGetPairs, bInteraction);
            ic.resid2ResidhashInteractions = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        else {
            atoms = ic.contactCls.getAtomsWithinAtom(otherAtoms, atomlistTarget, parseFloat(radius), bGetPairs, bInteraction);
            ic.resid2ResidhashSphere = me.hashUtilsCls.cloneHash(ic.resid2Residhash);
        }
        var residues = {}, atomArray = undefined;
        for(var i in atoms) {
            var atom = atoms[i];
            if(ic.bOpm && atom.resn === 'DUM') continue;
            var residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residues[residueid] = 1;
        }
        return {"residues": residues, "resid2Residhash": ic.resid2Residhash}
    }

}

export {ShowInter}

