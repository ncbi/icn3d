/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {MyEventCls} from '../../utils/myEventCls.js';
import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Html} from '../../html/html.js';

import {HlUpdate} from '../highlight/hlUpdate.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {DefinedSets} from '../selection/definedSets.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {ApplyDisplay} from '../display/applyDisplay.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Draw} from '../display/draw.js';
import {ApplyCenter} from '../display/applyCenter.js';
import {LineGraph} from '../interaction/lineGraph.js';
import {Annotation} from '../annotations/annotation.js';
import {LoadScript} from '../selection/loadScript.js';
import {SelectByCommand} from '../selection/selectByCommand.js';

class Selection {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Select all atom in the structures.
    selectAll() { let  ic = this.icn3d, me = ic.icn3dui;
        this.selectAll_base();

        ic.hlObjectsCls.removeHlObjects();
        ic.hlUpdateCls.removeHl2D();
        ic.hlUpdateCls.removeHlMenus();

        ic.bSelectResidue = false;
        ic.bSelectAlignResidue = false;

        ic.hlUpdateCls.removeSeqResidueBkgd();
        ic.hlUpdateCls.update2DdgmContent();

        // show annotations for all protein chains
        $("#" + ic.pre + "dl_annotations > .icn3d-annotation").show();

        ic.definedSetsCls.setMode('all');

        let  title =(ic.molTitle.length > 40) ? ic.molTitle.substr(0, 40) + "..." : ic.molTitle;
        $("#" + ic.pre + "title").html(title);
    }

    selectAll_base() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.hAtoms = {}
        ic.dAtoms = {}

        for(let i in ic.chains) {
           ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[i]);
           ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.chains[i]);
        }
    }

    //Select a chain with the chain id "chainid" in the sequence dialog and save it as a custom selection with the name "commandname".
    selectAChain(chainid, commandname, bAlign, bUnion) { let  ic = this.icn3d, me = ic.icn3dui;
        commandname = commandname.replace(/\s/g, '');
        let  command =(bAlign !== undefined || bAlign) ? 'select alignChain ' + chainid : 'select chain ' + chainid;

        //var residueHash = {}, chainHash = {}

        if(bUnion === undefined || !bUnion) {
            ic.hAtoms = {}
            ic.menuHlHash = {}
        }
        else {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.chains[chainid]);

            if(ic.menuHlHash === undefined) ic.menuHlHash = {}
        }

        ic.menuHlHash[chainid] = 1;

        //chainHash[chainid] = 1;

        let  chnsSeq =(bAlign) ? ic.alnChainsSeq[chainid] : ic.chainsSeq[chainid];
        let  chnsSeqLen;
        if(chnsSeq === undefined) chnsSeqLen = 0;
        else chnsSeqLen = chnsSeq.length;

        let  oriResidueHash = {}
        for(let i = 0, il = chnsSeqLen; i < il; ++i) { // get residue number
            let  resObj = chnsSeq[i];
            let  residueid = chainid + "_" + resObj.resi;

            let  value = resObj.name;

            if(value !== '' && value !== '-') {
              oriResidueHash[residueid] = 1;
              for(let j in ic.residues[residueid]) {
                ic.hAtoms[j] = 1;
              }
            }
        }

        if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) &&(ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
            this.addCustomSelection(Object.keys(oriResidueHash), commandname, commandname, command, true);
        }

        let  bForceHighlight = true;

        if(bAlign) {
            ic.hlUpdateCls.updateHlAll(undefined, undefined, bUnion, bForceHighlight);
        }
        else {
            ic.hlUpdateCls.updateHlAll(Object.keys(ic.menuHlHash), undefined, bUnion, bForceHighlight);
        }
    }

    selectResidueList(residueHash, commandname, commanddescr, bUnion, bUpdateHighlight, bAtom) { let  ic = this.icn3d, me = ic.icn3dui;
      if(residueHash !== undefined && Object.keys(residueHash).length > 0) {
        if(bUnion === undefined || !bUnion) {
            ic.hAtoms = {}
            ic.menuHlHash = {}
        }
        else {
            if(ic.menuHlHash === undefined) ic.menuHlHash = {}
        }

        if(bAtom) {
            for(let i in residueHash) {
                ic.hAtoms[i] = 1;
            }
        }
        else {
            for(let i in residueHash) {
                for(let j in ic.residues[i]) {
                  ic.hAtoms[j] = 1;
                }
            }
        }

        commandname = commandname.replace(/\s/g, '');

        ic.menuHlHash[commandname] = 1;

        let  select, bSelectResidues;

        if(bAtom) {
            select = "select " + ic.resid2specCls.atoms2spec(ic.hAtoms);
            bSelectResidues = false;
        }
        else {
            select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residueHash));
            bSelectResidues = true;
        }

        let  residueAtomArray = Object.keys(residueHash);

        //if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) &&(ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
            this.addCustomSelection(residueAtomArray, commandname, commanddescr, select, bSelectResidues);
        //}

        if(bUpdateHighlight === undefined || bUpdateHighlight) ic.hlUpdateCls.updateHlAll(Object.keys(ic.menuHlHash), undefined, bUnion);
      }
    }

    selectMainChains() { let  ic = this.icn3d, me = ic.icn3dui;
        let  currHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

        ic.hAtoms = ic.applyDisplayCls.selectMainChainSubset(currHAtoms);

        ic.hlUpdateCls.showHighlight();
    }

    //Select only the side chain atoms of the current selection.
    selectSideChains() { let  ic = this.icn3d, me = ic.icn3dui;
        let  currHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

        let  nuclMainArray = ["C1'", "C1*", "C2'", "C2*", "C3'", "C3*", "C4'", "C4*", "C5'", "C5*", "O3'", "O3*", "O4'", "O4*", "O5'", "O5*", "P", "OP1", "O1P", "OP2", "O2P"];

        ic.hAtoms = {}
        for(let i in currHAtoms) {
            if((ic.proteins.hasOwnProperty(i) && ic.atoms[i].name !== "N" && ic.atoms[i].name !== "C" && ic.atoms[i].name !== "O"
              && !(ic.atoms[i].name === "CA" && ic.atoms[i].elem === "C") )
              ||(ic.nucleotides.hasOwnProperty(i) && nuclMainArray.indexOf(ic.atoms[i].name) === -1) ) {
                ic.hAtoms[i] = 1;
            }
        }

        ic.hlUpdateCls.showHighlight();
    }

    selectMainSideChains() { let  ic = this.icn3d, me = ic.icn3dui;
        let  residHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.hAtoms);

        ic.hAtoms = {}
        for(let resid in residHash) {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
            ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.residues[resid]);
        }

        ic.drawCls.draw();

        ic.hlUpdateCls.showHighlight();
    }

    clickShow_selected() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        me.myEventCls.onIds(["#" + ic.pre + "show_selected", "#" + ic.pre + "mn2_show_selected"], "click", function(e) { let  ic = thisClass.icn3d;
           //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("show selection", true);

           thisClass.showSelection();
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("show selection", true);
        });
    }

    clickHide_selected() { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;
        me.myEventCls.onIds("#" + ic.pre + "mn2_hide_selected", "click", function(e) { let  ic = thisClass.icn3d;
           thisClass.hideSelection();
           ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("hide selection", true);
        });
    }

    getGraphDataForDisplayed() { let  ic = this.icn3d, me = ic.icn3dui;
          let  graphJson = JSON.parse(ic.graphStr);

          let  residHash = ic.firstAtomObjCls.getResiduesFromAtoms(ic.dAtoms);

          let  nodeArray = [], linkArray = [];

          let  nodeHash = {}
          for(let i = 0, il = graphJson.nodes.length; i < il; ++i) {
              let  node = graphJson.nodes[i];
              let  resid = node.r.substr(4); // 1_1_1KQ2_A_1

              if(residHash.hasOwnProperty(resid)) {
                  nodeArray.push(node);
                  nodeHash[node.id] = 1;
              }
          }

          for(let i = 0, il = graphJson.links.length; i < il; ++i) {
              let  link = graphJson.links[i];

              if(nodeHash.hasOwnProperty(link.source) && nodeHash.hasOwnProperty(link.target)) {
                  linkArray.push(link);
              }
          }

          graphJson.nodes = nodeArray;
          graphJson.links = linkArray;

          ic.graphStr = JSON.stringify(graphJson);

          return ic.graphStr;
    }

    updateSelectionNameDesc() { let  ic = this.icn3d, me = ic.icn3dui;
        let  numDef = Object.keys(ic.defNames2Residues).length + Object.keys(ic.defNames2Atoms).length;

        $("#" + ic.pre + "seq_command_name").val("seq_" + numDef);
        //$("#" + ic.pre + "seq_command_desc").val("seq_desc_" + numDef);

        $("#" + ic.pre + "seq_command_name2").val("seq_" + numDef);
        //$("#" + ic.pre + "seq_command_desc2").val("seq_desc_" + numDef);

        $("#" + ic.pre + "alignseq_command_name").val("alseq_" + numDef);
        //$("#" + ic.pre + "alignseq_command_desc").val("alseq_desc_" + numDef);
    }

    //Define a custom selection based on the array of residues or atoms. The custom selection is defined
    //by the "command" with the name "commandname" and the description "commanddesc". If "bResidue" is true,
    //the custom selection is based on residues. Otherwise, the custom selection is based on atoms.
    addCustomSelection(residueAtomArray, commandname, commanddesc, select, bSelectResidues) { let  ic = this.icn3d, me = ic.icn3dui;
        if(bSelectResidues) {
            ic.defNames2Residues[commandname] = residueAtomArray;
        }
        else {
            ic.defNames2Atoms[commandname] = residueAtomArray;
        }

        ic.defNames2Command[commandname] = select;
        ic.defNames2Descr[commandname] = commanddesc;

        ic.hlUpdateCls.updateHlMenus([commandname]);
    }

    //Show the selection.
    showSelection() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.dAtoms = {}

        if(Object.keys(ic.hAtoms).length == 0) this.selectAll_base();

        ic.dAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

        let  centerAtomsResults = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.dAtoms, ic.atoms));
        ic.maxD = centerAtomsResults.maxD;
        if(ic.maxD < 5) ic.maxD = 5;

        //show selected rotationcenter
        ic.opts['rotationcenter'] = 'display center';

        this.saveSelectionIfSelected();

        ic.drawCls.draw();

        ic.hlUpdateCls.update2DdgmContent();
        ic.hlUpdateCls.updateHl2D();

        // show selected chains in annotation window
        ic.annotationCls.showAnnoSelectedChains();

        // update 2d graph
        if(ic.graphStr !== undefined) {
          ic.graphStr = this.getGraphDataForDisplayed();
        }

        if(ic.bGraph) ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
        if(ic.bLinegraph) ic.lineGraphCls.drawLineGraph(ic.graphStr);
        if(ic.bScatterplot) ic.lineGraphCls.drawLineGraph(ic.graphStr, true);
    }

    hideSelection() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.dAtoms = me.hashUtilsCls.exclHash(ic.dAtoms, ic.hAtoms);

        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);

        let  centerAtomsResults = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.dAtoms, ic.atoms));
        ic.maxD = centerAtomsResults.maxD;
        if(ic.maxD < 5) ic.maxD = 5;

        //show selected rotationcenter
        ic.opts['rotationcenter'] = 'display center';

        this.saveSelectionIfSelected();

        ic.drawCls.draw();

        ic.hlUpdateCls.update2DdgmContent();
        ic.hlUpdateCls.updateHl2D();

        // show selected chains in annotation window
        ic.annotationCls.showAnnoSelectedChains();
    }

    saveSelection(name, description) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.selectedResidues = {}

        ic.selectedResidues = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(ic.hAtoms);

        if(Object.keys(ic.selectedResidues).length > 0) {
            if(ic.pk == 1) {
                let  bAtom = true;
                this.selectResidueList(ic.hAtoms, name, description,undefined, undefined, bAtom);
                //ic.hlUpdateCls.updateHlAll();

                this.updateSelectionNameDesc();

                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.atoms2spec(ic.hAtoms) + ' | name ' + name, true);
            }
            else {
                this.selectResidueList(ic.selectedResidues, name, description);
                //ic.hlUpdateCls.updateHlAll();

                this.updateSelectionNameDesc();

                ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + ic.resid2specCls.residueids2spec(Object.keys(ic.selectedResidues)) + ' | name ' + name, true);
            }
        }
    }

    removeSelection() { let  ic = this.icn3d, me = ic.icn3dui;
        if(!ic.bAnnotations) {
            ic.hlUpdateCls.removeSeqChainBkgd();
        }

        if(!ic.bCtrl && !ic.bShift) {
            ic.hlUpdateCls.removeSeqResidueBkgd();

            ic.hlUpdateCls.removeSeqChainBkgd();
        }

          ic.selectedResidues = {}
          ic.bSelectResidue = false;

          ic.hAtoms = {}

          ic.hlObjectsCls.removeHlObjects();

          ic.hlUpdateCls.removeHl2D();
    }

    resetAll() { let  ic = this.icn3d, me = ic.icn3dui;
        ic.maxD = ic.oriMaxD;
        ic.center = ic.oriCenter.clone();

        ic.reinitAfterLoad();

        ic.loadScriptCls.renderFinalStep(1);
        ic.definedSetsCls.setMode('all');
        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("reset", true);

        ic.hlUpdateCls.removeSeqChainBkgd();
        ic.hlUpdateCls.removeSeqResidueBkgd();
        ic.hlUpdateCls.removeHl2D();
        ic.hlUpdateCls.removeHlMenus();
    }

    loadSelection(dataStr) { let  ic = this.icn3d, me = ic.icn3dui;
      let  nameCommandArray = dataStr.trim().split('\n');

      for(let i = 0, il = nameCommandArray.length; i < il; ++i) {
          let  nameCommand = nameCommandArray[i].split('\t');
          let  name = nameCommand[0];
          let  command = nameCommand[1];

          let  pos = command.indexOf(' '); // select ...

          ic.selByCommCls.selectByCommand(command.substr(pos + 1), name, name);

          ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('select ' + command.substr(pos + 1) + ' | name ' + name, true);
      }
    }

    oneStructurePerWindow() { let  ic = this.icn3d, me = ic.icn3dui;
        // only display one of the two aligned structures
        let  structureArray = Object.keys(ic.structures);
        if(ic.icn3dui.cfg.bSidebyside && structureArray.length == 2) {
            let  dividArray = Object.keys(window.icn3duiHash);
            let  pos = dividArray.indexOf(ic.divid);

            let  structure = structureArray[pos];
            let  chainArray = ic.structures[structure];
            let  structAtoms = {}
            for(let i = 0, il = chainArray.length; i < il; ++i) {
                structAtoms = me.hashUtilsCls.unionHash(structAtoms, ic.chains[chainArray[i]]);
            }

            ic.dAtoms = me.hashUtilsCls.intHash(structAtoms, ic.dAtoms);
            ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
        }
    }

    showAll() {var ic = this.icn3d, me = ic.icn3dui;
           ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
           ic.maxD = ic.oriMaxD;
           ic.drawCls.draw();
    }

    saveSelectionIfSelected(id, value) {var ic = this.icn3d, me = ic.icn3dui;
      if(ic.bSelectResidue || ic.bSelectAlignResidue) {
          let  name = $("#" + ic.pre + "seq_command_name2").val().replace(/\s+/g, '_');
          //var description = $("#" + ic.pre + "seq_command_desc2").val();
          if(name === "") {
            name = $("#" + ic.pre + "alignseq_command_name").val().replace(/\s+/g, '_');
            //description = $("#" + ic.pre + "alignseq_command_desc").val();
          }
          if(name !== "") this.saveSelection(name, name);
          ic.bSelectResidue = false;
          ic.bSelectAlignResidue = false;
      }
    }

    saveSelectionPrep() {var ic = this.icn3d, me = ic.icn3dui;
           if(!ic.icn3dui.cfg.notebook) {
               if(!$('#' + ic.pre + 'dl_definedsets').hasClass('ui-dialog-content') || !$('#' + ic.pre + 'dl_definedsets').dialog( 'isOpen' )) {
                 ic.icn3dui.htmlCls.dialogCls.openDlg('dl_definedsets', 'Select sets');
                 $("#" + ic.pre + "atomsCustom").resizable();
               }
           }
           else {
               $('#' + ic.pre + 'dl_definedsets').show();
               $("#" + ic.pre + "atomsCustom").resizable();
           }
           ic.bSelectResidue = false;
           ic.bSelectAlignResidue = false;
    }
    selectOneResid(idStr, bUnchecked) {var ic = this.icn3d, me = ic.icn3dui;
      //var idStr = idArray[i]; // TYR $1KQ2.B:56@OH, $1KQ2.B:40 ASP
      //change to: let  idStr = idArray[i]; // TYR $1KQ2.B:56@OH, or ASP $1KQ2.B:40
      let  posStructure = idStr.indexOf('$');
      let  posChain = idStr.indexOf('.');
      let  posRes = idStr.indexOf(':');
      let  posAtom = idStr.indexOf('@');
      if(posAtom == -1) posAtom = idStr.length; //idStr.indexOf(' ');
      let  structure = idStr.substr(posStructure + 1, posChain - posStructure - 1);
      let  chain = idStr.substr(posChain + 1, posRes - posChain - 1);
      let  resi = idStr.substr(posRes + 1, posAtom - posRes - 1);
      let  resid = structure + '_' + chain + '_' + resi;
      for(let j in ic.residues[resid]) {
          if(bUnchecked) {
              delete ic.hAtoms[j];
          }
          else {
              ic.hAtoms[j] = 1;
          }
      }
      if(bUnchecked) {
          delete ic.selectedResidues[resid];
      }
      else {
          ic.selectedResidues[resid] = 1;
      }
      let  cmd = '$' + structure + '.' + chain + ':' + resi;
      return cmd;
    }

    //Toggle on and off the current selection.
    toggleSelection() {var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bHideSelection) {
            for(let i in ic.dAtoms) {
                if(ic.hAtoms.hasOwnProperty(i)) delete ic.dAtoms[i];
            }
              ic.bHideSelection = false;
        }
        else {
            ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.hAtoms);
              ic.bHideSelection = true;
        }
        ic.drawCls.draw();
    }

    toggleMembrane() {var ic = this.icn3d, me = ic.icn3dui;
        let  structureArray = Object.keys(ic.structures);

        for(let i = 0, il = structureArray.length; i < il; ++i) {
            let  structure = structureArray[i];
            let  atomsHash = ic.residues[structure + '_MEM_1'];
            let  firstAtom = ic.firstAtomObjCls.getFirstAtomObj(atomsHash);
            if(firstAtom === undefined) continue;

            let  oriStyle = firstAtom.style;
            if(!ic.dAtoms.hasOwnProperty(firstAtom.serial)) {
                // add membrane to displayed atoms if the membrane is not part of the display
                ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, atomsHash);
                oriStyle = 'nothing';
            }
            for(let j in atomsHash) {
                let  atom = ic.atoms[j];
                if(oriStyle !== 'nothing') {
                    atom.style = 'nothing';
                }
                else {
                    atom.style = 'stick';
                }
            }
        }

        ic.drawCls.draw();
    }

    adjustMembrane(extra_mem_z, intra_mem_z) {var ic = this.icn3d, me = ic.icn3dui;
        for(let i in ic.chains[ic.inputid.toUpperCase() + '_MEM']) {
            let  atom = ic.atoms[i];
            if(atom.name == 'O') {
                atom.coord.z = extra_mem_z;
            }
            else if(atom.name == 'N') {
                atom.coord.z = intra_mem_z;
            }
        }
        // reset transmembrane set
        let  bReset = true;
        ic.definedSetsCls.setTransmemInMenu(extra_mem_z, intra_mem_z, bReset);
        ic.hlUpdateCls.updateHlMenus();
        ic.drawCls.draw();
    }
    selectBtwPlanes(large, small) {var ic = this.icn3d, me = ic.icn3dui;
        if(large < small) {
            let  tmp = small;
            small = large;
            large = tmp;
        }
        let  residueHash = {}
        for(let i in ic.atoms) {
            let  atom = ic.atoms[i];
            if(atom.resn == 'DUM') continue;
            if(atom.coord.z >= small && atom.coord.z <= large) {
                let  resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
                residueHash[resid] = 1;
            }
        }
        let  commandname = "z_planes_" + large + "_" + small;
        let  commanddescr = commandname;
        this.selectResidueList(residueHash, commandname, commanddescr, false);
    }
}

export {Selection}
