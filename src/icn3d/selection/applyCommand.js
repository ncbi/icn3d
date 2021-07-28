/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {SaveFile} from '../export/saveFile.js';
import {ShareLink} from '../export/shareLink.js';
import {ThreeDPrint} from '../export/threeDPrint.js';
import {Export3D} from '../export/export3D.js';
import {ShowInter} from '../interaction/showInter.js';
import {ViewInterPairs} from '../interaction/viewInterPairs.js';
import {Selection} from '../selection/selection.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {Draw} from '../display/draw.js';
import {ApplyMap} from '../surface/applyMap.js';
import {SetColor} from '../display/setColor.js';
import {SetOption} from '../display/setOption.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {Axes} from '../geometry/axes.js';
import {ResidueLabels} from '../geometry/residueLabels.js';
import {Fog} from '../display/fog.js';
import {Contact} from '../interaction/contact.js';
import {HBond} from '../interaction/hBond.js';
import {PiHalogen} from '../interaction/piHalogen.js';
import {Saltbridge} from '../interaction/saltbridge.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {Transform} from '../transform/transform.js';
import {DefinedSets} from '../selection/definedSets.js';
import {Annotation} from '../annotations/annotation.js';
import {AddTrack} from '../annotations/addTrack.js';
import {Analysis} from '../analysis/analysis.js';
import {Diagram2d} from '../analysis/diagram2d.js';
import {AnnoSsbond} from '../annotations/annoSsbond.js';
import {ParserUtils} from '../parsers/parserUtils.js';
import {RealignParser} from '../parsers/realignParser.js';
import {GetGraph} from '../interaction/getGraph.js';
import {Picking} from '../picking/picking.js';
import {Scap} from '../analysis/scap.js';
import {SelectByCommand} from '../selection/selectByCommand.js';

class ApplyCommand {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Execute a command. If the command is to load a structure, use the Method "applyCommandLoad".
    applyCommand(commandStr) { let  ic = this.icn3d, me = ic.icn3dui;
      ic.bAddCommands = false;

      let  commandTransformation = commandStr.split('|||');

      let  commandOri = commandTransformation[0].replace(/\s+/g, ' ').trim();
      let  command = commandOri.toLowerCase();

      let  bShowLog = true;

    // exact match =============

      //var file_pref =(ic.inputid) ? ic.inputid : "custom";
      if(command == 'share link') {
        ic.shareLinkCls.shareLink();
      }
      else if(command == 'export state file') { // last step to update transformation
        // the last transformation will be applied
      }
      else if(command.indexOf('export canvas') == 0) {
        setTimeout(function(){
               //ic.saveFileCls.saveFile(file_pref + '_icn3d_loadable.png', 'png');
               let  scaleStr = command.substr(13).trim();
               ic.scaleFactor =(scaleStr === '') ? 1: parseInt(scaleStr);
               ic.shareLinkCls.shareLink(true);
            }, 500);
      }
      else if(command == 'export interactions') {
        ic.viewInterPairsCls.exportInteractions();
      }
      else if(command == 'export stl file') {
        setTimeout(function(){
               ic.export3DCls.exportStlFile('');
            }, 500);
      }
      else if(command == 'export vrml file') {
        setTimeout(function(){
               ic.export3DCls.exportVrmlFile('');
            }, 500);
      }
      else if(command == 'export stl stabilizer file') {
        setTimeout(function(){
               ic.threeDPrintCls.hideStabilizer();
               ic.threeDPrintCls.resetAfter3Dprint();
               ic.threeDPrintCls.addStabilizer();

               ic.export3DCls.exportStlFile('_stab');
            }, 500);
      }
      else if(command == 'export vrml stabilizer file') {
        setTimeout(function(){
               ic.threeDPrintCls.hideStabilizer();
               ic.threeDPrintCls.resetAfter3Dprint();
               ic.threeDPrintCls.addStabilizer();

               ic.export3DCls.exportVrmlFile('_stab');
            }, 500);
      }
      else if(command == 'export pdb') {
         me.htmlCls.setHtmlCls.exportPdb();
      }
      else if(command == 'select all') {
         ic.selectionCls.selectAll();
         //ic.hlObjectsCls.addHlObjects();
      }
      else if(command == 'show all') {
         ic.selectionCls.showAll();
      }
      else if(command == 'select complement') {
         ic.resid2specCls.selectComplement();
      }
      else if(command == 'set pk atom') {
        ic.pk = 1;
        ic.opts['pk'] = 'atom';
      }
      else if(command == 'set pk off') {
        ic.pk = 0;
        ic.opts['pk'] = 'no';
        ic.drawCls.draw();
        ic.hlObjectsCls.removeHlObjects();
      }
      else if(command == 'set pk residue') {
        ic.pk = 2;
        ic.opts['pk'] = 'residue';
      }
      else if(command == 'set pk strand') {
        ic.pk = 3;
        ic.opts['pk'] = 'strand';
      }
      else if(command == 'set pk domain') {
        ic.pk = 4;
        ic.opts['pk'] = 'domain';
      }
      else if(command == 'set pk chain') {
        ic.pk = 5;
        ic.opts['pk'] = 'chain';
      }
      else if(command == 'set surface wireframe on') {
        ic.opts['wireframe'] = 'yes';
        ic.applyMapCls.applySurfaceOptions();
      }
      else if(command == 'set surface wireframe off') {
        ic.opts['wireframe'] = 'no';
        ic.applyMapCls.applySurfaceOptions();
      }
      else if(command == 'set map wireframe on') {
        ic.opts['mapwireframe'] = 'yes';
        ic.applyMapCls.applyMapOptions();
      }
      else if(command == 'set map wireframe off') {
        ic.opts['mapwireframe'] = 'no';
        ic.applyMapCls.applyMapOptions();
      }
      else if(command == 'set emmap wireframe on') {
        ic.opts['emmapwireframe'] = 'yes';
        ic.applyMapCls.applyEmmapOptions();
      }
      else if(command == 'set emmap wireframe off') {
        ic.opts['emmapwireframe'] = 'no';
        ic.applyMapCls.applyEmmapOptions();
      }
      else if(command == 'set surface neighbors on') {
        ic.bConsiderNeighbors = true;
        ic.applyMapCls.applySurfaceOptions();
      }
      else if(command == 'set surface neighbors off') {
        ic.bConsiderNeighbors = false;
        ic.applyMapCls.applySurfaceOptions();
      }
      else if(command == 'set axis on') {
        ic.opts['axis'] = 'yes';
      }
      else if(command == 'set pc1 axis') {
        ic.pc1 = true;
        ic.axesCls.setPc1Axes();
      }
      else if(command == 'set axis off') {
        ic.opts['axis'] = 'no';
        ic.pc1 = false;
      }
      else if(command == 'set fog on') {
        ic.opts['fog'] = 'yes';
        ic.fogCls.setFog(true);
      }
      else if(command == 'set fog off') {
        ic.opts['fog'] = 'no';
        ic.fogCls.setFog(true);
      }
      else if(command == 'set slab on') {
        ic.opts['slab'] = 'yes';
      }
      else if(command == 'set slab off') {
        ic.opts['slab'] = 'no';
      }
      else if(command == 'set assembly on') {
        ic.bAssembly = true;
      }
      else if(command == 'set assembly off') {
        ic.bAssembly = false;
      }
      else if(command == 'set chemicalbinding show') {
        ic.setOptionCls.setOption('chemicalbinding', 'show');
      }
      else if(command == 'set chemicalbinding hide') {
        ic.setOptionCls.setOption('chemicalbinding', 'hide');
      }
      else if(command == 'set hbonds off') {
        ic.hBondCls.hideHbonds();
        ic.drawCls.draw();
      }
      else if(command == 'set salt bridge off') {
        ic.saltbridgeCls.hideSaltbridge();
        ic.drawCls.draw();
      }
      else if(command == 'set contact off') {
        ic.contactCls.hideContact();
        ic.drawCls.draw();
      }
      else if(command == 'set halogen pi off') {
        ic.piHalogenCls.hideHalogenPi();
        ic.drawCls.draw();
      }

      else if(command == 'hydrogens') {
        ic.showInterCls.showHydrogens();
        ic.drawCls.draw();
      }
      else if(command == 'set hydrogens off') {
        ic.showInterCls.hideHydrogens();
        ic.drawCls.draw();
      }
      else if(command == 'close popup') {
          ic.resizeCanvasCls.closeDialogs();
      }
      else if(command == 'set stabilizer off') {
        ic.threeDPrintCls.hideStabilizer();
        ic.drawCls.draw();
      }
      else if(command == 'set disulfide bonds off') {
        ic.opts["ssbonds"] = "no";
        ic.drawCls.draw();
      }
      else if(command == 'set cross linkage off') {
        //ic.bShowCrossResidueBond = false;
        //ic.setOptionCls.setStyle('proteins', 'ribbon');

        ic.opts["clbonds"] = "no";
        ic.drawCls.draw();
      }
      else if(command == 'set lines off') {
        ic.labels['distance'] = [];
        ic.lines['distance'] = [];

        ic.drawCls.draw();
      }
      else if(command == 'set labels off') {
        //ic.labels['residue'] = [];
        //ic.labels['custom'] = [];

        for(let name in ic.labels) {
           //if(name === 'residue' || name === 'custom') {
               ic.labels[name] = [];
           //}
        }

        ic.drawCls.draw();
      }
      else if(command == 'set mode all') {
         ic.definedSetsCls.setModeAndDisplay('all');
      }
      else if(command == 'set mode selection') {
         ic.definedSetsCls.setModeAndDisplay('selection');
      }
      else if(command == 'set view detailed view') {
         ic.annotationCls.setAnnoViewAndDisplay('detailed view');
      }
      else if(command == 'set view overview') {
         ic.annotationCls.setAnnoViewAndDisplay('overview');
      }
      else if(command == 'set annotation custom') {
          ic.annotationCls.setAnnoTabCustom();
      }
      else if(command == 'set annotation interaction') {
          ic.annotationCls.setAnnoTabInteraction();
      }
      else if(command == 'set annotation cdd') {
          ic.annotationCls.setAnnoTabCdd();
      }
      else if(command == 'set annotation site') {
          ic.annotationCls.setAnnoTabSite();
      }
      else if(command == 'set annotation ssbond') {
          ic.annotationCls.setAnnoTabSsbond();
      }
      else if(command == 'set annotation crosslink') {
          ic.annotationCls.setAnnoTabCrosslink();
      }
      else if(command == 'set annotation transmembrane') {
          ic.annotationCls.setAnnoTabTransmem();
      }
      else if(command == 'highlight level up') {
          ic.resid2specCls.switchHighlightLevelUp();
      }
      else if(command == 'highlight level down') {
          ic.resid2specCls.switchHighlightLevelDown();
      }
      else if(command.indexOf('hide annotation') == 0) {
          let  pos = command.lastIndexOf(' ');
          let  type = command.substr(pos + 1);

          if(type == 'all') {
              ic.annotationCls.hideAnnoTabAll();
          }
          else if(type == 'custom') {
              ic.annotationCls.hideAnnoTabCustom();
          }
          else if(type == 'clinvar') {
              ic.annotationCls.hideAnnoTabClinvar();
          }
          else if(type == 'snp') {
              ic.annotationCls.hideAnnoTabSnp();
          }
          else if(type == 'cdd') {
              ic.annotationCls.hideAnnoTabCdd();
          }
          else if(type == '3ddomain') {
              ic.annotationCls.hideAnnoTab3ddomain();
          }
          else if(type == 'site') {
              ic.annotationCls.hideAnnoTabSite();
          }
          else if(type == 'interaction') {
              ic.annotationCls.hideAnnoTabInteraction();
          }
          else if(type == 'ssbond') {
              ic.annotationCls.hideAnnoTabSsbond();
          }
          else if(type == 'crosslink') {
              ic.annotationCls.hideAnnoTabCrosslink();
          }
          else if(type == 'transmembrane') {
              ic.annotationCls.hideAnnoTabTransmem();
          }
      }
      else if(command == 'add residue labels') {
        ic.residueLabelsCls.addResidueLabels(ic.hAtoms);

        ic.drawCls.draw();
      }
      else if(command == 'add residue number labels') {
        ic.residueLabelsCls.addResidueLabels(ic.hAtoms, undefined, undefined, true);

        ic.drawCls.draw();
      }
      else if(command == 'add atom labels') {
        ic.residueLabelsCls.addAtomLabels(ic.hAtoms);

        ic.drawCls.draw();
      }
      else if(command == 'add chain labels') {
        ic.analysisCls.addChainLabels(ic.hAtoms);

        ic.drawCls.draw();
      }
      else if(command == 'add terminal labels') {
        ic.analysisCls.addTerminiLabels(ic.hAtoms);

        ic.drawCls.draw();
      }
      else if(command == 'rotate left') {
         ic.bStopRotate = false;
         ic.ROT_DIR = 'left';

         ic.resizeCanvasCls.rotStruc('left');
      }
      else if(command == 'rotate right') {
         ic.bStopRotate = false;
         ic.ROT_DIR = 'right';

         ic.resizeCanvasCls.rotStruc('right');
      }
      else if(command == 'rotate up') {
         ic.bStopRotate = false;
         ic.ROT_DIR = 'up';

         ic.resizeCanvasCls.rotStruc('up');
      }
      else if(command == 'rotate down') {
         ic.bStopRotate = false;
         ic.ROT_DIR = 'down';

         ic.resizeCanvasCls.rotStruc('down');
      }
      else if(command == 'rotate x') {
          let  axis = new THREE.Vector3(1,0,0);
          let  angle = 0.5 * Math.PI;

          ic.transformCls.setRotation(axis, angle);
      }
      else if(command == 'rotate y') {
          let  axis = new THREE.Vector3(0,1,0);
          let  angle = 0.5 * Math.PI;

          ic.transformCls.setRotation(axis, angle);
      }
      else if(command == 'rotate z') {
          let  axis = new THREE.Vector3(0,0,1);
          let  angle = 0.5 * Math.PI;

          ic.transformCls.setRotation(axis, angle);
      }
      else if(command === 'reset') {
          ic.selectionCls.resetAll();
      }
      else if(command === 'reset orientation') {
        ic.transformCls.resetOrientation();
        ic.drawCls.draw();
      }
      else if(command == 'reset thickness') {
        ic.threeDPrintCls.resetAfter3Dprint();
        ic.drawCls.draw();
      }
      else if(command == 'clear selection') {
        ic.hlObjectsCls.removeHlObjects();
        ic.hlUpdateCls.removeHl2D();
        ic.bShowHighlight = false;

        ic.bSelectResidue = false;
      }
      else if(command == 'zoom selection') {
        ic.transformCls.zoominSelection();
        ic.drawCls.draw();
      }
      else if(command == 'center selection') {
        ic.applyCenterCls.centerSelection();
        ic.drawCls.draw();
      }
      else if(command == 'show selection') {
        ic.selectionCls.showSelection();
      }
      else if(command == 'hide selection') {
        ic.selectionCls.hideSelection();
      }
      else if(command == 'output selection') {
          ic.threeDPrintCls.outputSelection();
      }
      else if(command == 'toggle selection') {
         ic.selectionCls.toggleSelection();
      }
      else if(command == 'toggle highlight') {
        ic.hlUpdateCls.toggleHighlight();
      }
      else if(command == 'stabilizer') {
        ic.threeDPrintCls.addStabilizer();

        ic.threeDPrintCls.prepareFor3Dprint();
        //ic.drawCls.draw();
      }
      else if(command == 'disulfide bonds') {
        ic.annoSsbondCls.showSsbonds();
      }
      else if(command == 'cross linkage') {
        ic.showInterCls.showClbonds();
      }
      else if(command == 'back') {
         ic.resizeCanvasCls.back();
      }
      else if(command == 'forward') {
         ic.resizeCanvasCls.forward();
      }
      else if(command == 'clear all') {
         ic.selectionCls.selectAll();
      }
      else if(command == 'defined sets') {
         ic.definedSetsCls.showSets();
      }
      else if(command == 'delete selected sets') {
         ic.definedSetsCls.deleteSelectedSets();
      }
      else if(command == 'view interactions') {
         if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
             ic.ParserUtilsCls.set2DDiagrams(ic.inputid);
         }
      }
      else if(command == 'show annotations all chains') {
         ic.annotationCls.showAnnoAllChains();
      }

      else if(command == 'save color') {
         ic.setOptionCls.saveColor();
      }
      else if(command == 'apply saved color') {
         ic.setOptionCls.applySavedColor();
      }
      else if(command == 'save style') {
         ic.setOptionCls.saveStyle();
      }
      else if(command == 'apply saved style') {
         ic.setOptionCls.applySavedStyle();
      }
      else if(command == 'select main chains') {
         ic.selectionCls.selectMainChains();
      }
      else if(command == 'select side chains') {
         ic.selectionCls.selectSideChains();
      }
      else if(command == 'select main side chains') {
         ic.selectionCls.selectMainSideChains();
      }
      else if(command == 'realign') {
         ic.realignParserCls.realign();
      }
      else if(command == 'area') {
         ic.analysisCls.calculateArea();
      }
      else if(command == 'table inter count only') {
         $(".icn3d-border").hide();
      }
      else if(command == 'table inter details') {
         $(".icn3d-border").show();
      }
      else if(command == 'setoption map nothing') {
         ic.setOptionCls.setOption('map', 'nothing');
      }
      else if(command == 'setoption emmap nothing') {
         ic.setOptionCls.setOption('emmap', 'nothing');
      }
      else if(command == 'setoption phimap nothing') {
         ic.setOptionCls.setOption('phimap', 'nothing');
      }
      else if(command == 'setoption phisurface nothing') {
         ic.setOptionCls.setOption('phisurface', 'nothing');
      }
      else if(command == 'clear symd symmetry') {
         ic.symdArray = [];
      }
      else if(command == 'show axis') {
         ic.bAxisOnly = true;
      }

    // start with =================
      else if(commandOri.indexOf('define helix sets') == 0) {
         let  chainStr = commandOri.split(' | ')[1];
         let  chainid = chainStr.split(' ')[1];

         ic.addTrackCls.defineSecondary(chainid, 'helix');
      }
      else if(commandOri.indexOf('define sheet sets') == 0) {
         let  chainStr = commandOri.split(' | ')[1];
         let  chainid = chainStr.split(' ')[1];

         ic.addTrackCls.defineSecondary(chainid, 'sheet');
      }
      else if(commandOri.indexOf('define coil sets') == 0) {
         let  chainStr = commandOri.split(' | ')[1];
         let  chainid = chainStr.split(' ')[1];

         ic.addTrackCls.defineSecondary(chainid, 'coil');
      }
      else if(commandOri.indexOf('select interaction') == 0) {
        let  idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
        if(idArray !== null) {
            let  mmdbid = idArray[0].split('_')[0];
            if(!ic.b2DShown) ic.ParserUtilsCls.download2Ddgm(mmdbid.toUpperCase());

            ic.diagram2dCls.selectInteraction(idArray[0], idArray[1]);
        }
      }

      else if(commandOri.indexOf('select saved atoms') == 0 || commandOri.indexOf('select sets') == 0) {
        // backward compatible: convert previous aligned_protein to protein_aligned
        commandOri = commandOri.replace(/aligned_protein/g, 'protein_aligned');

        let  paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        let  select = paraArray[0].replace(/,/g, ' or ');

        let  pos = 19; // 'select saved atoms '
        if(commandOri.indexOf('select sets') == 0) pos = 12; // 'select sets '

        let  strSets = select.substr(pos);

        let  commandname = strSets;

        if(paraArray.length == 2) commandname = paraArray[1].substr(5); // 'name ...'
        ic.definedSetsCls.selectCombinedSets(strSets, commandname);
      }
      else if(commandOri.indexOf('select chain') !== -1) {
        let  idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

        //if(idArray !== null) ic.changeChainid(idArray);
        for(let i = 0, il = idArray.length; i < il; ++i) {
            ic.selectionCls.selectAChain(idArray[i], idArray[i], false);
        }
      }
      else if(commandOri.indexOf('select alignChain') !== -1) {
        let  idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

        //if(idArray !== null) ic.changeChainid(idArray);
        for(let i = 0, il = idArray.length; i < il; ++i) {
            ic.selectionCls.selectAChain(idArray[i], 'align_' + idArray[i], true);
        }
      }
      else if(commandOri.indexOf('select zone cutoff') == 0) {
        let  ret = this.getThresholdNameArrays(commandOri);

        ic.showInterCls.pickCustomSphere(ret.threshold, ret.nameArray2, ret.nameArray, ret.bHbondCalc);
        ic.bSphereCalc = true;

        //ic.hlUpdateCls.updateHlAll();
      }
      else if(command.indexOf('set surface opacity') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        ic.opts['opacity'] = parseFloat(value);
        ic.applyMapCls.applySurfaceOptions();

        if(parseInt(100*value) < 100) ic.bTransparentSurface = true;
      }
      else if(command.indexOf('set label scale') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        ic.labelScale = parseFloat(value);
      }
      else if(command.indexOf('set surface') == 0) {
        let  value = command.substr(12);

        ic.opts['surface'] = value;
        ic.applyMapCls.applySurfaceOptions();
      }
      else if(command.indexOf('set camera') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        ic.opts['camera'] = value;
      }
      else if(command.indexOf('set background') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        ic.opts['background'] = value;

        if(value == 'white' || value == 'grey') {
            $("#" + ic.pre + "title").css("color", "black");
            $("#" + ic.pre + "titlelink").css("color", "black");
        }
        else {
            $("#" + ic.pre + "title").css("color", me.htmlCls.GREYD);
            $("#" + ic.pre + "titlelink").css("color", me.htmlCls.GREYD);
        }
      }
      else if(commandOri.indexOf('set thickness') == 0) {
        let  paraArray = command.split(' | ');

        ic.bSetThickness = true;

        for(let i = 1, il = paraArray.length; i < il; ++i) {
            let  p1Array = paraArray[i].split(' ');

            let  para = p1Array[0];
            let  value = parseFloat(p1Array[1]);

            if(para == 'linerad') ic.lineRadius = value;
            if(para == 'coilrad') ic.coilWidth = value;
            if(para == 'stickrad') ic.cylinderRadius = value;
            if(para == 'tracerad') ic.traceRadius = value;
            if(para == 'ballscale') ic.dotSphereScale = value;

            if(para == 'ribbonthick') ic.ribbonthickness = value;
            if(para == 'proteinwidth') ic.helixSheetWidth = value;
            if(para == 'nucleotidewidth') ic.nucleicAcidWidth = value;

            ic.drawCls.draw();
        }
      }
      else if(commandOri.indexOf('set light') == 0) {
        let  paraArray = command.split(' | ');

        for(let i = 1, il = paraArray.length; i < il; ++i) {
            let  p1Array = paraArray[i].split(' ');

            let  para = p1Array[0];
            let  value = parseFloat(p1Array[1]);

            if(para == 'light1') ic.light1 = value;
            if(para == 'light2') ic.light2 = value;
            if(para == 'light3') ic.light3 = value;

            ic.drawCls.draw();
        }
      }
      else if(commandOri.indexOf('set shininess') == 0) {
        let  pos = command.lastIndexOf(' ');

        ic.shininess = parseFloat(command.substr(pos + 1));

        ic.drawCls.draw();
      }
      else if(commandOri.indexOf('set glycan') == 0) {
        let  pos = command.lastIndexOf(' ');

        ic.bGlycansCartoon = parseInt(command.substr(pos + 1));

        ic.drawCls.draw();
      }
      else if(command.indexOf('set highlight color') == 0) {
           let  color = command.substr(20);
           if(color === 'yellow') {
               ic.hColor = me.parasCls.thr(0xFFFF00);
               ic.matShader = ic.setColorCls.setOutlineColor('yellow');
           }
           else if(color === 'green') {
               ic.hColor = me.parasCls.thr(0x00FF00);
               ic.matShader = ic.setColorCls.setOutlineColor('green');
           }
           else if(color === 'red') {
               ic.hColor = me.parasCls.thr(0xFF0000);
               ic.matShader = ic.setColorCls.setOutlineColor('red');
           }
           ic.drawCls.draw(); // required to make it work properly
      }
      else if(command.indexOf('set highlight style') == 0) {
            let  style = command.substr(20);

           if(style === 'outline') {
               ic.bHighlight = 1;
           }
           else if(style === '3d') {
               ic.bHighlight = 2;
           }

           ic.drawCls.draw();
      }
      else if(command.indexOf('add line') == 0) {
        let  paraArray = command.split(' | ');
        let  p1Array = paraArray[1].split(' ');
        let  p2Array = paraArray[2].split(' ');
        let  color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
        let  dashed = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1) === 'true' ? true : false;
        let  type = paraArray[5].substr(paraArray[5].lastIndexOf(' ') + 1);

        ic.analysisCls.addLine(parseFloat(p1Array[1]), parseFloat(p1Array[3]), parseFloat(p1Array[5]), parseFloat(p2Array[1]), parseFloat(p2Array[3]), parseFloat(p2Array[5]), color, dashed, type);
        ic.drawCls.draw();
      }
      else if(commandOri.indexOf('add label') == 0) {
        let  paraArray = commandOri.split(' | ');
        let  text = paraArray[0].substr(('add label').length + 1);

        // add label Text | x 40.45 y 24.465000000000003 z 53.48 | size 40 | color #ffff00 | background #cccccc | type custom
        let  x,y,z, size, color, background, type;
        let  bPosition = false;
        for(let i = 1, il = paraArray.length; i < il; ++i) {
            let  wordArray = paraArray[i].split(' ');

            if(wordArray[0] == 'x') {
                bPosition = true;
                x = wordArray[1];
                y = wordArray[3];
                z = wordArray[5];
            }
            else if(wordArray[0] == 'size') {
                size = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
            }
            else if(wordArray[0] == 'color') {
                color = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
            }
            else if(wordArray[0] == 'background') {
                background = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
            }
            else if(wordArray[0] == 'type') {
                type = paraArray[i].substr(paraArray[i].lastIndexOf(' ') + 1);
            }
        }

        if(!bPosition) {
          let  position = ic.applyCenterCls.centerAtoms(me.hashUtilsCls.hash2Atoms(ic.hAtoms, ic.atoms));
          x = position.center.x;
          y = position.center.y;
          z = position.center.z;
        }

        ic.analysisCls.addLabel(text, x,y,z, size, color, background, type);
        ic.drawCls.draw();
      }
      else if(commandOri.indexOf('msa') == 0) {
          //"msa | " + JSON.stringify(ic.targetGapHash)
          let  paraArray = commandOri.split(' | ');

          let  pos_from_toArray = paraArray[1].split(' ');

          ic.targetGapHash = {}
          for(let i = 0, il = pos_from_toArray.length; i < il; ++i) {
              let  pos_from_to = pos_from_toArray[i].split('_');
              ic.targetGapHash[parseInt(pos_from_to[0])] = {"from": parseInt(pos_from_to[1]), "to": parseInt(pos_from_to[2])}
          }

          ic.annotationCls.resetAnnoAll();
      }
      else if(commandOri.indexOf('add track') == 0) {
          //"add track | chainid " + chainid + " | title " + title + " | text " + text
          // + " | type " + type + " | color " + color + " | msa " + color
          let  paraArray = commandOri.split(' | ');

          let  chainid = paraArray[1].substr(8);
          let  title = paraArray[2].substr(6);
          let  text = paraArray[3].substr(5);
          let  type;
          if(paraArray.length >= 5) type = paraArray[4].substr(5);
          let  color;
          if(paraArray.length >= 6) color = paraArray[5].substr(6);
          let  msa;
          if(paraArray.length >= 7) msa = paraArray[6].substr(4);

          $("#" + ic.pre + "anno_custom")[0].checked = true;
          $("[id^=" + ic.pre + "custom]").show();

          if(color == '0') color = undefined;

          ic.addTrackCls.checkGiSeq(chainid, title, text, type, color, msa, 0);
      }
      else if(command.indexOf('remove one stabilizer') == 0) {
        let  paraArray = command.split(' | ');
        let  p1Array = paraArray[1].split(' ');

        let  rmLineArray = [];
        rmLineArray.push(parseInt(p1Array[0]));
        rmLineArray.push(parseInt(p1Array[1]));

        ic.threeDPrintCls.removeOneStabilizer(rmLineArray);

        ic.drawCls.draw();
      }
      else if(command.indexOf('add one stabilizer') == 0) {
        let  paraArray = command.split(' | ');
        let  p1Array = paraArray[1].split(' ');

         if(ic.pairArray === undefined) ic.pairArray = [];
         ic.pairArray.push(parseInt(p1Array[0]));
         ic.pairArray.push(parseInt(p1Array[1]));

         ic.drawCls.draw();
      }
      else if(command.indexOf('select planes z-axis') == 0) {
        let  paraArray = command.split(' ');
        if(paraArray.length == 5) {
            let  large = parseFloat(paraArray[3]);
            let  small = parseFloat(paraArray[4]);

            ic.selectionCls.selectBtwPlanes(large, small);
        }
      }
      else if(command.indexOf('adjust membrane z-axis') == 0) {
        let  paraArray = command.split(' ');
        if(paraArray.length == 5) {
            let  large = parseFloat(paraArray[3]);
            let  small = parseFloat(paraArray[4]);

            ic.selectionCls.adjustMembrane(large, small);
        }
      }
      else if(command.indexOf('toggle membrane') == 0) {
        ic.selectionCls.toggleMembrane();
      }
      else if(commandOri.indexOf('calc buried surface') == 0) {
        let  paraArray = commandOri.split(' | ');
        if(paraArray.length == 2) {
            let  setNameArray = paraArray[1].split(' ');

            if(setNameArray.length == 2) {
                let  nameArray2 = setNameArray[0].split(',');
                let  nameArray = setNameArray[1].split(',');

                ic.analysisCls.calcBuriedSurface(nameArray2, nameArray);
            }
        }
      }
      else if(commandOri.indexOf('dist') == 0) {
        let  paraArray = commandOri.split(' | ');
        if(paraArray.length == 2) {
            let  setNameArray = paraArray[1].split(' ');

            if(setNameArray.length == 2) {
                let  nameArray = setNameArray[0].split(',');
                let  nameArray2 = setNameArray[1].split(',');

                ic.analysisCls.measureDistTwoSets(nameArray, nameArray2);
            }
        }
      }
      else if(commandOri.indexOf('display interaction 3d') == 0
          || commandOri.indexOf('view interaction pairs') == 0
          || commandOri.indexOf('save1 interaction pairs') == 0
          || commandOri.indexOf('save2 interaction pairs') == 0
          || commandOri.indexOf('line graph interaction pairs') == 0
          || commandOri.indexOf('scatterplot interaction pairs') == 0
          ) {
        let  paraArray = commandOri.split(' | ');
        if(paraArray.length >= 3) {
            let  setNameArray = paraArray[1].split(' ');

            if(setNameArray.length == 2) {
                let  nameArray2 = setNameArray[0].split(',');
                let  nameArray = setNameArray[1].split(',');

                let  bHbond = paraArray[2].indexOf('hbonds') !== -1;
                let  bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
                let  bInteraction = paraArray[2].indexOf('interactions') !== -1;

                let  bHalogen = paraArray[2].indexOf('halogen') !== -1;
                let  bPication = paraArray[2].indexOf('pi-cation') !== -1;
                let  bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

                let  bHbondCalc;
                if(paraArray.length >= 4) {
                    bHbondCalc =(paraArray[3] == 'true') ? true : false;
                }

                if(paraArray.length >= 5) {
                   let  thresholdArray = paraArray[4].split(' ');

                   if(thresholdArray.length >= 4) {
                       $("#" + ic.pre + "hbondthreshold").val(thresholdArray[1]);
                       $("#" + ic.pre + "saltbridgethreshold").val(thresholdArray[2]);
                       $("#" + ic.pre + "contactthreshold").val(thresholdArray[3]);

                       if(thresholdArray.length == 7) {
                           $("#" + ic.pre + "halogenthreshold").val(thresholdArray[4]);
                           $("#" + ic.pre + "picationthreshold").val(thresholdArray[5]);
                           $("#" + ic.pre + "pistackingthreshold").val(thresholdArray[6]);
                       }
                   }
                }

                let  type;
                if(commandOri.indexOf('display interaction 3d') == 0) {
                    type = '3d';
                }
                else if(commandOri.indexOf('view interaction pairs') == 0) {
                    type = 'view';
                }
                else if(commandOri.indexOf('save1 interaction pairs') == 0) {
                    type = 'save1';
                }
                else if(commandOri.indexOf('save2 interaction pairs') == 0) {
                    type = 'save2';
                }
                else if(commandOri.indexOf('line graph interaction pairs') == 0) {
                    type = 'linegraph';
                }
                else if(commandOri.indexOf('scatterplot interaction pairs') == 0) {
                    type = 'scatterplot';
                }

                ic.viewInterPairsCls.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, type, bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
            }
        }
      }
      else if(commandOri.indexOf('export pairs') == 0) {
        let  paraArray = commandOri.split(' | ');
        if(paraArray.length == 3) {
            let  setNameArray = paraArray[1].split(' ');

            if(setNameArray.length == 2) {
                let  nameArray2 = setNameArray[0].split(',');
                let  nameArray = setNameArray[1].split(',');

                let  distArray = paraArray[2].split(' ');
                let  radius = distArray[1];

                ic.showInterCls.pickCustomSphere(radius, nameArray2, nameArray, ic.bSphereCalc);
                ic.bSphereCalc = true;
                let  text = ic.viewInterPairsCls.exportSpherePairs();
                let  file_pref =(ic.inputid) ? ic.inputid : "custom";
                ic.saveFileCls.saveFile(file_pref + '_sphere_pairs.html', 'html', text);
            }
        }
      }
      else if(commandOri.indexOf('export pqr') == 0) {
           me.htmlCls.setHtmlCls.exportPqr();
      }
      else if(command.indexOf('graph label') == 0) {
        let  pos = command.lastIndexOf(' ');
        let  className = command.substr(pos + 1);

        $("#" + me.svgid + "_label").val(className);

        $("#" + me.svgid + " text").removeClass();
        $("#" + me.svgid + " text").addClass(className);
      }
      else if(command.indexOf('line graph scale') == 0) {
        let  pos = command.lastIndexOf(' ');
        let  scale = command.substr(pos + 1);

        $("#" + me.linegraphid + "_scale").val(scale);

        $("#" + me.linegraphid).attr("width",(ic.linegraphWidth * parseFloat(scale)).toString() + "px");
      }
      else if(command.indexOf('scatterplot scale') == 0) {
        let  pos = command.lastIndexOf(' ');
        let  scale = command.substr(pos + 1);

        $("#" + me.scatterplotid + "_scale").val(scale);

        $("#" + me.scatterplotid).attr("width",(ic.scatterplotWidth * parseFloat(scale)).toString() + "px");
      }
      else if(command.indexOf('contactmap scale') == 0) {
        let  pos = command.lastIndexOf(' ');
        let  scale = command.substr(pos + 1);

        $("#" + me.contactmapid + "_scale").val(scale);

        $("#" + me.contactmapid).attr("width",(ic.contactmapWidth * parseFloat(scale)).toString() + "px");
      }
      else if(command.indexOf('graph force') == 0) {
        let  pos = command.lastIndexOf(' ');
        me.htmlCls.force = parseInt(command.substr(pos + 1));

        $("#" + me.svgid + "_force").val(me.htmlCls.force);

        ic.getGraphCls.handleForce();
      }
      else if(command.indexOf('hide edges') == 0) {
        let  pos = command.lastIndexOf(' ');
        me.htmlCls.hideedges = parseInt(command.substr(pos + 1));

        $("#" + me.svgid + "_hideedges").val(me.htmlCls.hideedges);

        if(me.htmlCls.hideedges) {
            me.htmlCls.contactInsideColor = 'FFF';
            me.htmlCls.hbondInsideColor = 'FFF';
            me.htmlCls.ionicInsideColor = 'FFF';
        }
        else {
            me.htmlCls.contactInsideColor = 'DDD';
            me.htmlCls.hbondInsideColor = 'AFA';
            me.htmlCls.ionicInsideColor = '8FF';
        }

        if(ic.graphStr !== undefined && ic.bRender && me.htmlCls.force) {
           ic.drawGraphCls.drawGraph(ic.graphStr, ic.pre + 'dl_graph');
        }
      }
      else if(command.indexOf('reset interaction pairs') == 0) {
        ic.viewInterPairsCls.resetInteractionPairs();
      }
      else if(command.indexOf('side by side') == 0) {
        let  paraArray = command.split(' | ');
        let  url = paraArray[1];

        window.open(url, '_blank');
      }
      else if(commandOri.indexOf('your note') == 0) {
        let  paraArray = commandOri.split(' | ');
        ic.yournote = paraArray[1];

        $("#" + ic.pre + "yournote").val(ic.yournote);
        if(me.cfg.shownote) document.title = ic.yournote;
      }
      else if(command.indexOf('cross structure interaction') == 0) {
        ic.crossstrucinter = parseInt(command.substr(command.lastIndexOf(' ') + 1));

        $("#" + ic.pre + "crossstrucinter").val(ic.crossstrucinter);
      }
      else if(command == 'replay on') {
        ic.resizeCanvasCls.replayon();
      }
      else if(command == 'replay off') {
        ic.resizeCanvasCls.replayoff();
      }

    // start with, single word =============
      else if(command.indexOf('contact map') == 0) {
        let  strArray = command.split(" | ");

        if(strArray.length === 3) {
            let  contactdist = parseFloat(strArray[1].split(' ')[1]);
            let  contacttype = strArray[2].split(' ')[1];

            ic.contactMapCls.contactMap(contactdist, contacttype);
        }
      }
      else if(command.indexOf('pickatom') == 0) {
        let  atomid = parseInt(command.substr(command.lastIndexOf(' ') + 1));

        ic.pAtom = ic.atoms[atomid];

        ic.pickingCls.showPicking(ic.pAtom);
      }
      else if(commandOri.indexOf('color') == 0) {
        let  strArray = commandOri.split(" | ");
        let  color = strArray[0].substr(strArray[0].indexOf(' ') + 1);
        ic.opts['color'] = color;

        if(color == "residue custom" && strArray.length == 2) {
            ic.customResidueColors = JSON.parse(strArray[1]);
            for(let res in ic.customResidueColors) {
                ic.customResidueColors[res.toUpperCase()] = me.parasCls.thr("#" + ic.customResidueColors[res]);
            }
        }
        else if(color == "align custom" && strArray.length == 3) {
            let  chainid = strArray[1];
            let  resiScoreArray = strArray[2].split(', ');
            ic.queryresi2score = {}
            ic.queryresi2score[chainid] = {}
            for(let i = 0, il = resiScoreArray.length; i < il; ++i) {
                let  resi_score = resiScoreArray[i].split(' ');

                ic.queryresi2score[chainid][resi_score[0]] = resi_score[1];
            }
        }
        else if(color == "align custom" && strArray.length >= 4) {
            // me.htmlCls.clickMenuCls.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
            this.setQueryresi2score(strArray);
        }
        else if(color == "area" && strArray.length == 2) {
            ic.midpercent = strArray[1];
            $("#" + ic.pre + 'midpercent').val(ic.midpercent);
        }

        ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

        ic.hlUpdateCls.updateHlAll();

        // change graph color
        ic.getGraphCls.updateGraphColor();
      }
      else if(commandOri.indexOf('remove legend') == 0) {
        $("#" + me.pre + "legend").hide();
      }
      else if(commandOri.indexOf('custom tube') == 0) {
        let  strArray = commandOri.split(" | ");

        this.setQueryresi2score(strArray);

        ic.setOptionCls.setStyle('proteins', 'custom tube');
      }
      else if(command.indexOf('style') == 0) {
        let  secondPart = command.substr(command.indexOf(' ') + 1);

        let  selectionType = secondPart.substr(0, secondPart.indexOf(' '));
        let  style = secondPart.substr(secondPart.indexOf(' ') + 1);

        ic.setOptionCls.setStyle(selectionType, style);
      }
      else if(command.indexOf('window') == 0) {
        let  secondPart = command.substr(command.indexOf(' ') + 1);

        if(secondPart == "aligned sequences") {
            me.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        }
        else if(secondPart == "interaction table") {
            me.htmlCls.dialogCls.openDlg('dl_allinteraction', 'Show interactions');
        }
        else if(secondPart == "interaction graph") {
            me.htmlCls.dialogCls.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
        }
        else if(secondPart == "interaction scatterplot") {
            me.htmlCls.dialogCls.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
        }
        else if(secondPart == "force-directed graph") {
            me.htmlCls.dialogCls.openDlg('dl_graph', 'Force-directed graph');
        }
      }
      else if(command.indexOf('set theme') == 0) {
        let  color = command.substr(command.lastIndexOf(' ') + 1);
        me.htmlCls.setMenuCls.setTheme(color);
      }
      else if(command.indexOf('set double color') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        if(value == 'on') {
            ic.bDoublecolor = true;
            ic.setOptionCls.setStyle('proteins', 'ribbon');
        }
        else if(value == 'off') {
            ic.bDoublecolor = false;
        }
      }
      else if(command.indexOf('adjust dialog') == 0) {
        let  id = command.substr(command.lastIndexOf(' ') + 1);
        ic.scapCls.adjust2DWidth(id);
      }
      else if(command.indexOf('glycans cartoon') == 0) {
        let  value = command.substr(command.lastIndexOf(' ') + 1);
        if(value == 'yes') {
            ic.bGlycansCartoon = true;
        }
        else {
            ic.bGlycansCartoon = false;
        }
      }

    // special, select ==========

      else if(command.indexOf('select displayed set') !== -1) {
        ic.hAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
        ic.hlUpdateCls.updateHlAll();
      }
      else if(command.indexOf('select prop') !== -1) {
        let  paraArray = commandOri.split(' | ');

        let  property = paraArray[0].substr('select prop'.length + 1);

        let  from, to;
        if(paraArray.length == 2) {
            let  from_to = paraArray[1].split('_');
            from = from_to[0];
            to = from_to[1];
        }

        ic.resid2specCls.selectProperty(property, from, to);
      }
      else if(command.indexOf('select') == 0 && command.indexOf('name') !== -1) {
        let  paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        let  select = '', commandname = '', commanddesc = '';
        for(let i = 0, il = paraArray.length; i < il; ++i) {
            let  para = paraArray[i];

            if(para.indexOf('select') !== -1) {
                select = para.substr(para.indexOf(' ') + 1);
            }
            else if(para.indexOf('name') !== -1) {
                commandname = para.substr(para.indexOf(' ') + 1);
            }
    //        else if(para.indexOf('description') !== -1) {
    //            commanddesc = para.substr(para.indexOf(' ') + 1);
    //        }
        }

    //    if(paraArray.length < 3) commanddesc = commandname;
        commanddesc = commandname;

        ic.selByCommCls.selectByCommand(select, commandname, commanddesc);
      }
      else if(command.indexOf('select $') !== -1 || command.indexOf('select .') !== -1 || command.indexOf('select :') !== -1 || command.indexOf('select @') !== -1) {
        let  paraArray = commandOri.split(' | '); // atom names might be case-sensitive

        let  select = paraArray[0].substr(paraArray[0].indexOf(' ') + 1);
        let  commandname = '', commanddesc = '';

        if(paraArray.length > 1) {
            commandname = paraArray[1].substr(paraArray[1].indexOf(' ') + 1);
        }

        if(paraArray.length > 2) {
            commanddesc = paraArray[2].substr(paraArray[2].indexOf(' ') + 1);
        }

        if(select.indexOf(' or ') !== -1) { // "select " command without " | name"
            ic.selByCommCls.selectByCommand(select, commandname, commanddesc);
        }
        else { // only single query from selectByCommand()
            ic.selByCommCls.selectBySpec(select, commandname, commanddesc);
        }
      }

      if(bShowLog) {
          me.htmlCls.clickMenuCls.setLogCmd(commandOri, false);
      }

      ic.bAddCommands = true;
    }

    setStrengthPara(paraArray) { let  ic = this.icn3d, me = ic.icn3dui;
        if(paraArray.length >= 5) {
           let  thresholdArray = paraArray[4].split(' ');

           if(thresholdArray.length >= 4) {
               $("#" + ic.pre + "hbondthreshold").val(thresholdArray[1]);
               $("#" + ic.pre + "saltbridgethreshold").val(thresholdArray[2]);
               $("#" + ic.pre + "contactthreshold").val(thresholdArray[3]);
               if(thresholdArray.length >= 7) {
                   $("#" + ic.pre + "halogenthreshold").val(thresholdArray[4]);
                   $("#" + ic.pre + "picationthreshold").val(thresholdArray[5]);
                   $("#" + ic.pre + "pistackingthreshold").val(thresholdArray[6]);
               }
           }
        }

        if(paraArray.length == 6) {
            let  thicknessArray = paraArray[5].split(' ');

            if(thicknessArray.length >= 6) {
                $("#" + ic.pre + "dist_ss").val(thicknessArray[0]);
                $("#" + ic.pre + "dist_coil").val(thicknessArray[1]);
                $("#" + ic.pre + "dist_hbond").val(thicknessArray[2]);
                $("#" + ic.pre + "dist_inter").val(thicknessArray[3]);
                $("#" + ic.pre + "dist_ssbond").val(thicknessArray[4]);
                $("#" + ic.pre + "dist_ionic").val(thicknessArray[5]);

                if(thicknessArray.length == 9) {
                    $("#" + ic.pre + "dist_halogen").val(thicknessArray[6]);
                    $("#" + ic.pre + "dist_pication").val(thicknessArray[7]);
                    $("#" + ic.pre + "dist_pistacking").val(thicknessArray[8]);
                }
            }
        }
    }

    getThresholdNameArrays(commandOri) { let  ic = this.icn3d, me = ic.icn3dui;
        if(ic.bSetChainsAdvancedMenu === undefined || !ic.bSetChainsAdvancedMenu) {
           let  prevHAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

           ic.definedSetsCls.setPredefinedInMenu();
           ic.bSetChainsAdvancedMenu = true;

           ic.hAtoms = me.hashUtilsCls.cloneHash(prevHAtoms);
        }

        let  paraArray = commandOri.split(' | ');

        let  threshold = parseFloat(paraArray[0].substr(paraArray[0].lastIndexOf(' ') + 1));
        let  nameArray = [], nameArray2 = [];
        if(paraArray.length >= 2 && paraArray[1].length > 4) { //sets a,b,c e,f,g
            let  setsArray = paraArray[1].split(" ");
            if(setsArray.length > 1) nameArray2 = setsArray[1].split(",");
            if(setsArray.length > 2) nameArray = setsArray[2].split(",");
        }
        else {
            nameArray2 = ['selected'];
            nameArray = ['non-selected'];
        }

        let  bHbondCalc;
        if(paraArray.length == 3) {
            bHbondCalc =(paraArray[2] == 'true') ? true : false;
        }

        return {'threshold': threshold, 'nameArray2': nameArray2, 'nameArray': nameArray, 'bHbondCalc': bHbondCalc}
    }

    setQueryresi2score(strArray) { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainid = strArray[1];
        let  start_end = strArray[2].split(' ')[1].split('_');
        let  resiScoreStr = strArray[3]; // score 0-9
        if(ic.queryresi2score === undefined) ic.queryresi2score = {}
        //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {}
        ic.queryresi2score[chainid] = {}
        let  factor = 100 / 9;
        for(let resi = parseInt(start_end[0]), i = 0; resi <= parseInt(start_end[1]); ++resi, ++i) {
            if(resiScoreStr[i] != '_') {
                ic.queryresi2score[chainid][resi] = parseInt(resiScoreStr[i]) * factor; // convert from 0-9 to 0-100
            }
        }

        // color range
        if(strArray.length > 4) {
            let  colorArray = strArray[4].split(' ');
            ic.startColor = colorArray[1];
            ic.midColor = colorArray[2];
            ic.endColor = colorArray[3];

            let  legendHtml = me.htmlCls.clickMenuCls.setLegendHtml();
            $("#" + me.pre + "legend").html(legendHtml).show();
        }
    }

    getMenuFromCmd(cmd) { let  ic = this.icn3d, me = ic.icn3dui;
        cmd = cmd.trim();

        let  seqAnnoStr = 'Windows > View Sequences & Annotations';
        let  hbondIntStr = 'Analysis > H-Bonds & Interactions';
        let  forceStr = hbondIntStr + ' > 2D Graph(Force-Directed)';
        let  rotStr1 = 'View > Rotate > Auto Rotation > Rotate ';
        let  rotStr2 = 'View > Rotate > Rotate 90 deg > ';
        let  sel3dStr = 'Select > Select on 3D > ';
        let  labelStr = 'Analysis > Label > ';
        let  printStr = 'File > 3D Printing > ';

        if(cmd.indexOf('load') == 0) return 'File > Retrieve by ID, Align';
        else if(cmd.indexOf('set map') == 0 && cmd.indexOf('set map wireframe') == -1) return 'Style > Electron Density';
        else if(cmd.indexOf('set emmap') == 0 && cmd.indexOf('set emmap wireframe') == -1) return 'Style > EM Density Map';
        else if(cmd.indexOf('set phi') == 0) return 'Analysis > Load Potential > URL(Same Host) Phi/Cube';
        else if(cmd.indexOf('set delphi') == 0) return 'Analysis > DelPhi Potential';
        else if(cmd.indexOf('setoption map') == 0) return 'Style > Remove Map';
        else if(cmd.indexOf('setoption emmap') == 0) return 'Style > Remove EM Map';
        //else if(cmd.indexOf('setoption phimap') == 0) return 'Analysis > Remove Potential';
        else if(cmd.indexOf('view annotations') == 0) return seqAnnoStr;
        else if(cmd.indexOf('set annotation all') == 0) return seqAnnoStr + ': "All" checkbox';
        else if(cmd.indexOf('set annotation clinvar') == 0) return seqAnnoStr + ': "ClinVar" checkbox';
        else if(cmd.indexOf('set annotation snp') == 0) return seqAnnoStr + ': "SNP" checkbox';
        else if(cmd.indexOf('set annotation 3ddomain') == 0) return seqAnnoStr + ': "3D Domains" checkbox';
        else if(cmd.indexOf('view interactions') == 0) return 'Windows > View 2D Diagram';
        else if(cmd.indexOf('symmetry') == 0) return 'Analysis > Symmetry';
        else if(cmd.indexOf('realign on seq align') == 0) return 'File > Realign Selection > on Sequence Alignment';
        else if(cmd.indexOf('realign') == 0) return 'File > Realign Selection > Residue by Residue';
        else if(cmd.indexOf('graph interaction pairs') == 0) return hbondIntStr + ' > 2D Graph(Force-Directed)';
        else if(cmd.indexOf('export canvas') == 0) return 'File > Save Files > iCn3D PNG Image';
        else if(cmd == 'export stl file') return printStr + 'STL';
        else if(cmd == 'export vrml file') return printStr + 'VRML(Color)';
        else if(cmd == 'export stl stabilizer file') return printStr + 'STL W/ Stabilizers';
        else if(cmd == 'export vrml stabilizer file') return printStr + 'VRML(Color, W/ Stabilizers)';
        else if(cmd == 'select all') return 'Select > All; or Toggle to "All"(next to "Help")';
        else if(cmd == 'show all') return 'View > View Full Structure';
        else if(cmd == 'select complement') return 'Select > Inverse';
        else if(cmd == 'set pk atom') return sel3dStr + 'Atom';
        else if(cmd == 'set pk residue') return sel3dStr + 'Residue';
        else if(cmd == 'set pk strand') return sel3dStr + 'Strand/Helix';
        else if(cmd == 'set pk domain') return sel3dStr + '3D Domain';
        else if(cmd == 'set pk chain') return sel3dStr + 'Chain';
        else if(cmd == 'set surface wireframe on') return 'Style > Surface Wireframe > Yes';
        else if(cmd == 'set surface wireframe off') return 'Style > Surface Wireframe > No';
        else if(cmd == 'set map wireframe on') return 'Style > Map Wireframe > Yes';
        else if(cmd == 'set map wireframe off') return 'Style > Map Wireframe > No';
        else if(cmd == 'set emmap wireframe on') return 'Style > EM Map Wireframe > Yes';
        else if(cmd == 'set emmap wireframe off') return 'Style > EM Map Wireframe > No';
        else if(cmd == 'set surface neighbors on') return 'Style > Surface Type > ... with Context';
        //else if(cmd == 'set surface neighbors off') return 'Style > Surface Type > ... without Context';
        else if(cmd == 'set axis on') return 'View > XYZ-axes > Show';
        else if(cmd == 'set axis off') return 'View > XYZ-axes > Hide';
        else if(cmd == 'set fog on') return 'View > Fog for Selection > On';
        else if(cmd == 'set fog off') return 'View > Fog for Selection > Off';
        else if(cmd == 'set slab on') return 'View > Slab for Selection > On';
        else if(cmd == 'set slab off') return 'View > Slab for Selection > Off';
        else if(cmd == 'set assembly on') return 'Analysis > Assembly > Biological Assembly';
        else if(cmd == 'set assembly off') return 'Analysis > Assembly > Asymmetric Unit';
        else if(cmd == 'set chemicalbinding show') return 'Analysis > Chem. Binding > Show';
        else if(cmd == 'set chemicalbinding hide') return 'Analysis > Chem. Binding > Hide';
        else if(cmd == 'set hbonds off' || cmd == 'set salt bridge off' || cmd == 'set contact off'
          || cmd == 'set halogen pi off') return hbondIntStr + ' > Reset';
        else if(cmd == 'hydrogens') return 'Style > Hydrogens > Show';
        else if(cmd == 'set hydrogens off') return 'Style > Hydrogens > Hide';
        else if(cmd == 'set stabilizer off') return 'File > 3D Printing > Remove All Stabilizers';
        else if(cmd == 'set disulfide bonds off') return 'Analysis > Disulfide Bonds > Hide';
        else if(cmd == 'set cross linkage off') return 'Analysis > Cross-Linkages > Hide';
        else if(cmd == 'set lines off') return 'Analysis > Distance > Hide';
        else if(cmd == 'set labels off') return 'Analysis > Label > Remove';
        else if(cmd == 'set mode all') return 'Toggle to "All"(next to "Help")';
        else if(cmd == 'set mode selection') return 'Toggle to "Selection"(next to "Help")';
        else if(cmd == 'set view detailed view') return seqAnnoStr + ': "Details" tab';
        else if(cmd== 'set view overview') return seqAnnoStr + ': "Summary" tab';
        else if(cmd == 'set annotation custom') return seqAnnoStr + ': "Custom" checkbox';
        else if(cmd == 'set annotation interaction') return seqAnnoStr + ': "Interactions" checkbox';
        else if(cmd == 'set annotation cdd') return seqAnnoStr + ': "Conserved Domains" checkbox';
        else if(cmd == 'set annotation site') return seqAnnoStr + ': "Functional Sites" checkbox';
        else if(cmd == 'set annotation ssbond') return seqAnnoStr + ': "Disulfide Bonds" checkbox';
        else if(cmd == 'set annotation crosslink') return seqAnnoStr + ': "Cross-Linkages" checkbox';
        else if(cmd == 'set annotation transmembrane') return seqAnnoStr + ': "Transmembrane" checkbox';
        else if(cmd == 'highlight level up') return 'Keyboard Arrow Up';
        else if(cmd == 'highlight level down') return 'Keyboard Arrow Down';
        else if(cmd.indexOf('hide annotation') == 0) return seqAnnoStr + ': checkboxes off';
        else if(cmd == 'add residue labels') return labelStr + 'per Residue';
        else if(cmd == 'add residue number labels') return labelStr + 'per Residue & Number';
        else if(cmd == 'add atom labels') return labelStr + 'per Atom';
        else if(cmd == 'add chain labels') return labelStr + 'per Chain';
        else if(cmd == 'add terminal labels') return labelStr + 'N- & C- Termini';
        else if(cmd == 'rotate left') return rotStr1 + 'Left; or Key l';
        else if(cmd == 'rotate right') return rotStr1 + 'Right; or Key j';
        else if(cmd == 'rotate up') return rotStr1 + 'Up; or Key i';
        else if(cmd == 'rotate down') return rotStr1 + 'Down; or Key m';
        else if(cmd == 'rotate x') return rotStr2 + 'X-axis';
        else if(cmd == 'rotate y') return rotStr2 + 'Y-axis';
        else if(cmd == 'rotate z') return rotStr2 + 'Z-axis';
        else if(cmd == 'reset') return 'View > Reset > All';
        else if(cmd == 'reset orientation') return 'View > Reset > Orientation';
        //else if(cmd == 'reset thickness') return 'File > 3D Printing > Reset Thickness';
        else if(cmd == 'clear selection') return 'Select > Clear Selection';
        else if(cmd == 'zoom selection') return 'Select > Zoom in Selection';
        else if(cmd == 'center selection') return 'Select > Center Selection';
        else if(cmd == 'show selection') return 'Select > View Only Selection';
        else if(cmd == 'hide selection') return 'Select > Hide Selection';
        else if(cmd == 'output selection') return 'Select > Clear Selection';
        else if(cmd == 'toggle highlight') return 'Select > Toggle Highlight';
        else if(cmd == 'stabilizer') return 'File > 3D Printing > Add all Stabilizers';
        else if(cmd == 'disulfide bonds') return 'Analysis > Disulfide Bonds > Show';
        else if(cmd == 'cross linkage') return 'Analysis > Cross-Linkages > Show';
        else if(cmd == 'back') return 'View > Undo';
        else if(cmd == 'forward') return 'View > Redo';
        else if(cmd == 'clear all') return 'Select > Clear Selection';
        else if(cmd == 'defined sets') return 'Windows > Defined Sets';
        else if(cmd == 'delete selected sets') return 'Windows > Defined Sets: "Delete Selected Sets" button';
        else if(cmd == 'view interactions') return 'Windows > View Interactions';
        else if(cmd == 'show annotations all chains') return seqAnnoStr + ': "Show All Chains" button';
        else if(cmd == 'save color') return 'Color > Save Color';
        else if(cmd == 'apply saved color') return 'Color > Apply Saved Color';
        else if(cmd == 'save style') return 'Style > Save Style';
        else if(cmd == 'apply saved style') return 'Style > Apply Saved Style';
        else if(cmd == 'select main chains') return 'Select > Main Chains';
        else if(cmd == 'select side chains') return 'Select > Side Chains';
        else if(cmd == 'select main side chains') return 'Select > Main & Side Chains';
        else if(cmd == 'area') return 'View > Surface Area';
        else if(cmd == 'table inter count only') return hbondIntStr + ': "Set 1" button: "Show Count Only" button';
        else if(cmd == 'table inter details') return hbondIntStr + ': "Set 1" button: "Show Details" button';
        else if(cmd.indexOf('define helix sets') == 0) return seqAnnoStr + ': "Helix Sets" button';
        else if(cmd.indexOf('define sheet sets') == 0) return seqAnnoStr + ': "Sheet Sets" button';
        else if(cmd.indexOf('define coil sets') == 0) return seqAnnoStr + ': "Coil Sets" button';
        else if(cmd.indexOf('select interaction') == 0) return 'Windows > View 2D Diagram: click on edges';
        else if(cmd.indexOf('select saved atoms') == 0 || cmd.indexOf('select sets') == 0) return 'Windows > Defined Sets: select in menu';
        else if(cmd.indexOf('select chain') !== -1) return seqAnnoStr + ': click on chain names';
        else if(cmd.indexOf('select alignChain') !== -1) return 'Windows > View Aligned Sequences: click on chain names';
        else if(cmd.indexOf('select zone cutoff') == 0) return 'Select > by Distance';
        else if(cmd.indexOf('set surface opacity') == 0) return 'Style > Surface Opacity';
        else if(cmd.indexOf('set label scale') == 0) return 'View > Label Scale';
        else if(cmd.indexOf('set surface') == 0) return 'Style > Surface Type';
        else if(cmd.indexOf('set camera') == 0) return 'View > Camera';
        else if(cmd.indexOf('set background') == 0) return 'Style > Background';
        else if(cmd.indexOf('set thickness') == 0) return 'File > 3D Printing > Set Thickness';
        else if(cmd.indexOf('set highlight color') == 0) return 'Select > Highlight Color';
        else if(cmd.indexOf('set highlight style') == 0) return 'Select > Highlight Style';
        else if(cmd.indexOf('add line') == 0) return 'Analysis > Distance > between Two Atoms';
        else if(cmd.indexOf('add label') == 0) return 'Analysis > Distance > between Two Atoms';
        else if(cmd.indexOf('dist') == 0) return 'Analysis > Distance > between Two Sets';
        else if(cmd.indexOf('msa') == 0) return seqAnnoStr + ': "Add Track" button: "FASTA Alignment" button';
        else if(cmd.indexOf('add track') == 0) return seqAnnoStr + ': "Add Track" button';
        else if(cmd.indexOf('remove one stabilizer') == 0) return 'File > 3D Printing > Remove One Stablizer';
        else if(cmd.indexOf('add one stabilizer') == 0) return 'File > 3D Printing > Add One Stablizer';
        else if(cmd.indexOf('select planes z-axis') == 0) return 'View > Select between Two X-Y Planes';
        else if(cmd.indexOf('adjust membrane z-axis') == 0) return 'View > Adjust Membrane';
        else if(cmd.indexOf('toggle membrane') == 0) return 'View > Toggle Membrane';
        else if(cmd.indexOf('calc buried surface') == 0) return hbondIntStr + ': "Buried Surface Area" button';
        else if(cmd.indexOf('display interaction 3d') == 0) return hbondIntStr + ': "3D Display Interactions" button';
        else if(cmd.indexOf('view interaction pairs') == 0) return hbondIntStr + ': "Highlight Interactions in Table" button';
        else if(cmd.indexOf('save1 interaction pairs') == 0) return hbondIntStr + ': "Set 1" button';
        else if(cmd.indexOf('save2 interaction pairs') == 0) return hbondIntStr + ': "Set 2" button';
        else if(cmd.indexOf('line graph interaction pairs') == 0) return hbondIntStr + ': "2D Interaction Network" button';
        else if(cmd.indexOf('scatterplot interaction pairs') == 0) return hbondIntStr + ': "2D Interaction Map" button';
        else if(cmd.indexOf('graph label') == 0) return forceStr + ': "Label Size" menu';
        else if(cmd.indexOf('graph force') == 0) return forceStr + ': "Force on Nodes" menu';
        else if(cmd.indexOf('hide edges') == 0) return forceStr + ': "Internal Edges" menu';
        else if(cmd.indexOf('reset interaction pairs') == 0) return hbondIntStr + ' > Reset';
        else if(cmd.indexOf('side by side') == 0) return 'View > Side by Side';
        else if(cmd.indexOf('your note') == 0) return 'Windows > Your Notes / Window Title';
        else if(cmd.indexOf('pickatom') == 0) return 'Hold Alt key and click on 3D structure';
        else if(cmd.indexOf('color') == 0) return 'Color menu';
        else if(cmd.indexOf('custom tube') == 0) return seqAnnoStr + ': "Custom Color/Tube" button: "Custom Tube" button';
        else if(cmd.indexOf('style') == 0) return 'Style menu';
        else if(cmd.indexOf('select displayed set') !== -1) return 'Select > Displayed Set';
        else if(cmd.indexOf('select prop') !== -1) return 'Select > by Property';
        else if(cmd.indexOf('select') == 0 && cmd.indexOf('name') !== -1) return seqAnnoStr + ': drag on residues to select';
        else if(cmd.indexOf('select $') !== -1 || cmd.indexOf('select .') !== -1 || cmd.indexOf('select :') !== -1 || cmd.indexOf('select @') !== -1) return 'Select > Advanced; or other selection';
        else if(cmd.indexOf('replay on') !== -1) return 'File > Replay Each Step > On';
        else if(cmd.indexOf('replay off') !== -1) return 'File > Replay Each Step > Off';
        else if(cmd.indexOf('set theme') !== -1) return 'Style > Theme Color';
        else if(cmd.indexOf('set double color') !== -1) return 'Style > Two-color Helix';
        else return '';
    }
}

export {ApplyCommand}
