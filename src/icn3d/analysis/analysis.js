/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';
import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Html} from '../../html/html.js';

import {ApplyMap} from '../surface/applyMap.js';
import {DefinedSets} from '../selection/definedSets.js';
import {Contact} from '../interaction/contact.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';

class Analysis {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    calculateArea() {var ic = this.icn3d, me = ic.icn3dui;
       ic.bCalcArea = true;
       ic.opts.surface = 'solvent accessible surface';
       ic.applyMapCls.applySurfaceOptions();
       $("#" + ic.pre + "areavalue").val(ic.areavalue);
       $("#" + ic.pre + "areatable").html(ic.areahtml);
       ic.icn3dui.htmlCls.dialogCls.openDlg('dl_area', 'Surface area calculation');
       ic.bCalcArea = false;
    }

    calcBuriedSurface(nameArray2, nameArray) {var ic = this.icn3d, me = ic.icn3dui;
       if(nameArray2.length == 0) {
           alert("Please select the first set");
       }
       else {
           let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
           let atomSet2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);
           let atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
           ic.bCalcArea = true;
           ic.opts.surface = 'solvent accessible surface';
           ic.hAtoms = me.hashUtilsCls.cloneHash(atomSet2);
           ic.applyMapCls.applySurfaceOptions();
           let area2 = ic.areavalue;
           let resid2area2 = me.hashUtilsCls.cloneHash(ic.resid2area);
           ic.hAtoms = me.hashUtilsCls.cloneHash(atomSet1);
           ic.applyMapCls.applySurfaceOptions();
           let area1 = ic.areavalue;
           let resid2area1 = me.hashUtilsCls.cloneHash(ic.resid2area);

           ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomSet2);
           ic.applyMapCls.applySurfaceOptions();
           let areaTotal = ic.areavalue;
           let resid2areaTotal = me.hashUtilsCls.cloneHash(ic.resid2area);

           let buriedArea1 = 0, buriedArea2 = 0;
           let areaSum1 = 0, areaSum2 = 0;
           // set 1 buried
           for(let resid in resid2area2) {
               if(resid2areaTotal.hasOwnProperty(resid)) {
                   areaSum2 += parseFloat(resid2areaTotal[resid]);
               }
           }
           buriedArea2 = (area2 - areaSum2).toFixed(2);

           // set 2 buried
           for(let resid in resid2area1) {
               if(resid2areaTotal.hasOwnProperty(resid)) {
                   areaSum1 += parseFloat(resid2areaTotal[resid]);
               }
           }
           buriedArea1 = (area1 - areaSum1).toFixed(2);

           ic.bCalcArea = false;
           ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
           let buriedArea =(parseFloat(area1) + parseFloat(area2) - parseFloat(areaTotal)).toFixed(2);
           let html = '<br>Calculate solvent accessible surface area in the interface:<br><br>';
           html += 'Set 1: ' + nameArray2 + ', Surface: ' +  area2 + ' &#8491;<sup>2</sup><br>';
           html += 'Set 2: ' + nameArray + ', Surface: ' +  area1 + ' &#8491;<sup>2</sup><br>';
           html += 'Total Surface: ' +  areaTotal + ' &#8491;<sup>2</sup><br>';
           //html += '<b>Buried Surface for both Sets</b>: ' +  buriedArea + ' &#8491;<sup>2</sup><br>';
           html += '<b>Buried Surface for Set 1</b>: ' +  buriedArea2 + ' &#8491;<sup>2</sup><br>';
           html += '<b>Buried Surface for Set 2</b>: ' +  buriedArea1 + ' &#8491;<sup>2</sup><br><br>';
           $("#" + ic.pre + "dl_buriedarea").html(html);
           ic.icn3dui.htmlCls.dialogCls.openDlg('dl_buriedarea', 'Buried solvent accessible surface area in the interface');
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('buried surface ' + buriedArea, false);
       }
    }

    measureDistTwoSets(nameArray, nameArray2) {var ic = this.icn3d, me = ic.icn3dui;
       if(nameArray.length == 0 || nameArray2.length == 0) {
           alert("Please select two sets");
       }
       else {
           let prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
           let atomSet1 = ic.definedSetsCls.getAtomsFromNameArray(nameArray);
           let atomSet2 = ic.definedSetsCls.getAtomsFromNameArray(nameArray2);

           let posArray1 = ic.contactCls.getExtent(atomSet1);
           let posArray2 = ic.contactCls.getExtent(atomSet2);

           let pos1 = new THREE.Vector3(posArray1[2][0], posArray1[2][1], posArray1[2][2]);
           let pos2 = new THREE.Vector3(posArray2[2][0], posArray2[2][1], posArray2[2][2]);

           ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);

           if(ic.distPnts === undefined) ic.distPnts = [];
           ic.distPnts.push(pos1);
           ic.distPnts.push(pos2);

           //var bOther = true;
           //ic.boxCls.createBox_base(pos1, ic.originSize, ic.hColor, false, bOther);
           //ic.boxCls.createBox_base(pos2, ic.originSize, ic.hColor, false, bOther);

           let color = $("#" + ic.pre + "distancecolor2" ).val();

           this.addLine(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, color, true, 'distance');

           let size = 0, background = 0;
           let labelPos = pos1.clone().add(pos2).multiplyScalar(0.5);
           let distance = parseInt(pos1.distanceTo(pos2) * 10) / 10;
           let text = distance.toString() + " A";
           this.addLabel(text, labelPos.x, labelPos.y, labelPos.z, size, color, background, 'distance');
           ic.drawCls.draw();
       }
    }

    //Add a line between the position (x1, y1, z1) and the position (x2, y2, z2) with the input "color".
    //The line can be dashed if "dashed" is set true.
    addLine(x1, y1, z1, x2, y2, z2, color, dashed, type) {var ic = this.icn3d, me = ic.icn3dui;
        let line = {} // Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
        line.position1 = new THREE.Vector3(x1, y1, z1);
        line.position2 = new THREE.Vector3(x2, y2, z2);
        line.color = color;
        line.dashed = dashed;
        if(ic.lines[type] === undefined) ic.lines[type] = [];
        if(type !== undefined) {
            ic.lines[type].push(line);
        }
        else {
            ic.lines['custom'].push(line);
        }
        ic.hlObjectsCls.removeHlObjects();
        //ic.drawCls.draw();
    }

    addLineFromPicking(type) {var ic = this.icn3d, me = ic.icn3dui;
        let size = 0, background = 0;
        let color = $("#" + ic.pre + type + "color" ).val();
        let x =(ic.pAtom.coord.x + ic.pAtom2.coord.x) / 2;
        let y =(ic.pAtom.coord.y + ic.pAtom2.coord.y) / 2;
        let z =(ic.pAtom.coord.z + ic.pAtom2.coord.z) / 2;
        let dashed =(type == 'stabilizer') ? false : true;
        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('add line | x1 ' + ic.pAtom.coord.x.toPrecision(4)  + ' y1 ' + ic.pAtom.coord.y.toPrecision(4) + ' z1 ' + ic.pAtom.coord.z.toPrecision(4) + ' | x2 ' + ic.pAtom2.coord.x.toPrecision(4)  + ' y2 ' + ic.pAtom2.coord.y.toPrecision(4) + ' z2 ' + ic.pAtom2.coord.z.toPrecision(4) + ' | color ' + color + ' | dashed ' + dashed + ' | type ' + type, true);
        this.addLine(ic.pAtom.coord.x, ic.pAtom.coord.y, ic.pAtom.coord.z, ic.pAtom2.coord.x, ic.pAtom2.coord.y, ic.pAtom2.coord.z, color, dashed, type);
        ic.pickpair = false;
    }

    //Add a "text" at the position (x, y, z) with the input "size", "color", and "background".
    addLabel(text, x, y, z, size, color, background, type) {var ic = this.icn3d, me = ic.icn3dui;
        let label = {} // Each label contains 'position', 'text', 'color', 'background'

        if(size === '0' || size === '' || size === 'undefined') size = undefined;
        if(color === '0' || color === '' || color === 'undefined') color = undefined;
        if(background === '0' || background === '' || background === 'undefined') background = undefined;

        let position = new THREE.Vector3();
        position.x = x;
        position.y = y;
        position.z = z;

        label.position = position;

        label.text = text;
        label.size = size;
        label.color = color;
        label.background = background;

        if(ic.labels[type] === undefined) ic.labels[type] = [];

        if(type !== undefined) {
            ic.labels[type].push(label);
        }
        else {
            ic.labels['custom'].push(label);
        }

        ic.hlObjectsCls.removeHlObjects();

        //ic.drawCls.draw();
    }

    //Display chain name in the 3D structure display for the chains intersecting with the atoms in "atomHash".
    addChainLabels(atoms) {var ic = this.icn3d, me = ic.icn3dui;
        let size = 18;
        let background = "#CCCCCC";
        let atomsHash = me.hashUtilsCls.intHash(ic.hAtoms, atoms);
        if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
        let chainHash = ic.firstAtomObjCls.getChainsFromAtoms(atomsHash);
        for(let chainid in chainHash) {
            let label = {}
            label.position = ic.applyCenterCls.centerAtoms(ic.chains[chainid]).center;
            let pos = chainid.indexOf('_');
            let chainName = chainid.substr(pos + 1);
            let proteinName = ic.showSeqCls.getProteinName(chainid);
            if(proteinName.length > 20) proteinName = proteinName.substr(0, 20) + '...';
            label.text = 'Chain ' + chainName + ': ' + proteinName;
            label.size = size;
            let atomColorStr = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.chains[chainid]).color.getHexString().toUpperCase();
            label.color =(atomColorStr === "CCCCCC" || atomColorStr === "C8C8C8") ? "#888888" : "#" + atomColorStr;
            label.background = background;
            ic.labels['chain'].push(label);
        }
        ic.hlObjectsCls.removeHlObjects();
    }
    //Display the terminal labels for the atoms in "atomHash". The termini of proteins are labeld
    //as "N-" and "C-". The termini of nucleotides are labeled as "5'" and "3'".
    addTerminiLabels(atoms) {var ic = this.icn3d, me = ic.icn3dui;
        let size = 18;
        let background = "#CCCCCC";
        let protNucl;
        protNucl = me.hashUtilsCls.unionHash(protNucl, ic.proteins);
        protNucl = me.hashUtilsCls.unionHash(protNucl, ic.nucleotides);
        let hlProtNucl = me.hashUtilsCls.intHash(ic.dAtoms, protNucl);
        let atomsHash = me.hashUtilsCls.intHash(hlProtNucl, atoms);
        if(ic.labels['chain'] === undefined) ic.labels['chain'] = [];
        let chainHash = ic.firstAtomObjCls.getChainsFromAtoms(atomsHash);
        for(let chainid in chainHash) {
            let chainAtomsHash = me.hashUtilsCls.intHash(hlProtNucl, ic.chains[chainid]);
            let serialArray = Object.keys(chainAtomsHash);
            let firstAtom = ic.atoms[serialArray[0]];
            let lastAtom = ic.atoms[serialArray[serialArray.length - 1]];
            let labelN = {}, labelC = {}
            labelN.position = firstAtom.coord;
            labelC.position = lastAtom.coord;
            labelN.text = 'N-';
            labelC.text = 'C-';
            if(ic.nucleotides.hasOwnProperty(firstAtom.serial)) {
                labelN.text = "5'";
                labelC.text = "3'";
            }
            labelN.size = size;
            labelC.size = size;
            let atomNColorStr = firstAtom.color.getHexString().toUpperCase();
            let atomCColorStr = lastAtom.color.getHexString().toUpperCase();
            labelN.color =(atomNColorStr === "CCCCCC" || atomNColorStr === "C8C8C8") ? "#888888" : "#" + atomNColorStr;
            labelC.color =(atomCColorStr === "CCCCCC" || atomCColorStr === "C8C8C8") ? "#888888" : "#" + atomCColorStr;
            labelN.background = background;
            labelC.background = background;
            ic.labels['chain'].push(labelN);
            ic.labels['chain'].push(labelC);
        }
        ic.hlObjectsCls.removeHlObjects();
    }
}

export {Analysis}
