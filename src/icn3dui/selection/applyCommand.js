/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.applyCommand = function (commandStr) { var me = this, ic = me.icn3d; "use strict";
  me.bAddCommands = false;

  var commandTransformation = commandStr.split('|||');

  var commandOri = commandTransformation[0].replace(/\s+/g, ' ').trim();
  var command = commandOri.toLowerCase();

  var bShowLog = true;

// exact match =============

  //var file_pref = (me.inputid) ? me.inputid : "custom";
  if(command == 'share link') {
    me.shareLink();
  }
  else if(command == 'export state file') { // last step to update transformation
    // the last transformation will be applied
  }
  else if(command.indexOf('export canvas') == 0) {
    setTimeout(function(){
           //me.saveFile(file_pref + '_icn3d_loadable.png', 'png');
           var scaleStr = command.substr(13).trim();
           ic.scaleFactor = (scaleStr === '') ? 1: parseInt(scaleStr);
           me.shareLink(true);
        }, 500);
  }
  else if(command == 'export interactions') {
    me.exportInteractions();
  }
  else if(command == 'export stl file') {
    setTimeout(function(){
           me.exportStlFile('');
        }, 500);
  }
  else if(command == 'export vrml file') {
    setTimeout(function(){
           me.exportVrmlFile('');
        }, 500);
  }
  else if(command == 'export stl stabilizer file') {
    setTimeout(function(){
           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportStlFile('_stab');
        }, 500);
  }
  else if(command == 'export vrml stabilizer file') {
    setTimeout(function(){
           me.hideStabilizer();
           me.resetAfter3Dprint();
           me.addStabilizer();

           me.exportVrmlFile('_stab');
        }, 500);
  }
  else if(command == 'export pdb') {
     me.exportPdb();
  }
  else if(command == 'select all') {
     me.selectAll();
     //ic.addHlObjects();
  }
  else if(command == 'show all') {
     me.showAll();
  }
  else if(command == 'select complement') {
     me.selectComplement();
  }
  else if(command == 'set pk atom') {
    ic.pk = 1;
    ic.opts['pk'] = 'atom';
  }
  else if(command == 'set pk off') {
    ic.pk = 0;
    ic.opts['pk'] = 'no';
    ic.draw();
    ic.removeHlObjects();
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
    ic.applySurfaceOptions();
  }
  else if(command == 'set surface wireframe off') {
    ic.opts['wireframe'] = 'no';
    ic.applySurfaceOptions();
  }
  else if(command == 'set map wireframe on') {
    ic.opts['mapwireframe'] = 'yes';
    ic.applyMapOptions();
  }
  else if(command == 'set map wireframe off') {
    ic.opts['mapwireframe'] = 'no';
    ic.applyMapOptions();
  }
  else if(command == 'set emmap wireframe on') {
    ic.opts['emmapwireframe'] = 'yes';
    ic.applyEmmapOptions();
  }
  else if(command == 'set emmap wireframe off') {
    ic.opts['emmapwireframe'] = 'no';
    ic.applyEmmapOptions();
  }
  else if(command == 'set surface neighbors on') {
    ic.bConsiderNeighbors = true;
    ic.applySurfaceOptions();
  }
  else if(command == 'set surface neighbors off') {
    ic.bConsiderNeighbors = false;
    ic.applySurfaceOptions();
  }
  else if(command == 'set axis on') {
    ic.opts['axis'] = 'yes';
  }
  else if(command == 'set pc1 axis') {
    ic.pc1 = true;
    ic.setPc1Axes();
  }
  else if(command == 'set axis off') {
    ic.opts['axis'] = 'no';
    ic.pc1 = false;
  }
  else if(command == 'set fog on') {
    ic.opts['fog'] = 'yes';
    ic.setFog(true);
  }
  else if(command == 'set fog off') {
    ic.opts['fog'] = 'no';
    ic.setFog(true);
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
    me.setOption('chemicalbinding', 'show');
  }
  else if(command == 'set chemicalbinding hide') {
    me.setOption('chemicalbinding', 'hide');
  }
  else if(command == 'set hbonds off') {
    ic.hideHbonds();
    ic.draw();
  }
  else if(command == 'set salt bridge off') {
    ic.hideSaltbridge();
    ic.draw();
  }
  else if(command == 'set contact off') {
    ic.hideContact();
    ic.draw();
  }
  else if(command == 'set halogen pi off') {
    ic.hideHalogenPi();
    ic.draw();
  }

  else if(command == 'hydrogens') {
    me.showHydrogens();
    ic.draw();
  }
  else if(command == 'set hydrogens off') {
    me.hideHydrogens();
    ic.draw();
  }
  else if(command == 'close popup') {
      me.closeDialogs();
  }
  else if(command == 'set stabilizer off') {
    me.hideStabilizer();
    ic.draw();
  }
  else if(command == 'set disulfide bonds off') {
    ic.opts["ssbonds"] = "no";
    ic.draw();
  }
  else if(command == 'set cross linkage off') {
    //ic.bShowCrossResidueBond = false;
    //me.setStyle('proteins', 'ribbon');

    ic.opts["clbonds"] = "no";
    ic.draw();
  }
  else if(command == 'set lines off') {
    ic.labels['distance'] = [];
    ic.lines['distance'] = [];

    ic.draw();
  }
  else if(command == 'set labels off') {
    //ic.labels['residue'] = [];
    //ic.labels['custom'] = [];

    for(var name in ic.labels) {
       //if(name === 'residue' || name === 'custom') {
           ic.labels[name] = [];
       //}
    }

    ic.draw();
  }
  else if(command == 'set mode all') {
     me.setModeAndDisplay('all');
  }
  else if(command == 'set mode selection') {
     me.setModeAndDisplay('selection');
  }
  else if(command == 'set view detailed view') {
     me.setAnnoViewAndDisplay('detailed view');
  }
  else if(command == 'set view overview') {
     me.setAnnoViewAndDisplay('overview');
  }
  else if(command == 'set annotation custom') {
      me.setAnnoTabCustom();
  }
  else if(command == 'set annotation interaction') {
      me.setAnnoTabInteraction();
  }
  else if(command == 'set annotation cdd') {
      me.setAnnoTabCdd();
  }
  else if(command == 'set annotation site') {
      me.setAnnoTabSite();
  }
  else if(command == 'set annotation ssbond') {
      me.setAnnoTabSsbond();
  }
  else if(command == 'set annotation crosslink') {
      me.setAnnoTabCrosslink();
  }
  else if(command == 'set annotation transmembrane') {
      me.setAnnoTabTransmem();
  }
  else if(command == 'highlight level up') {
      me.switchHighlightLevelUp();
  }
  else if(command == 'highlight level down') {
      me.switchHighlightLevelDown();
  }
  else if(command.indexOf('hide annotation') == 0) {
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == 'all') {
          me.hideAnnoTabAll();
      }
      else if(type == 'custom') {
          me.hideAnnoTabCustom();
      }
      else if(type == 'clinvar') {
          me.hideAnnoTabClinvar();
      }
      else if(type == 'snp') {
          me.hideAnnoTabSnp();
      }
      else if(type == 'cdd') {
          me.hideAnnoTabCdd();
      }
      else if(type == '3ddomain') {
          me.hideAnnoTab3ddomain();
      }
      else if(type == 'site') {
          me.hideAnnoTabSite();
      }
      else if(type == 'interaction') {
          me.hideAnnoTabInteraction();
      }
      else if(type == 'ssbond') {
          me.hideAnnoTabSsbond();
      }
      else if(type == 'crosslink') {
          me.hideAnnoTabCrosslink();
      }
      else if(type == 'transmembrane') {
          me.hideAnnoTabTransmem();
      }
  }
  else if(command == 'add residue labels') {
    ic.addResiudeLabels(ic.hAtoms);

    ic.draw();
  }
  else if(command == 'add residue number labels') {
    ic.addResiudeLabels(ic.hAtoms, undefined, undefined, true);

    ic.draw();
  }
  else if(command == 'add atom labels') {
    ic.addAtomLabels(ic.hAtoms);

    ic.draw();
  }
  else if(command == 'add chain labels') {
    me.addChainLabels(ic.hAtoms);

    ic.draw();
  }
  else if(command == 'add terminal labels') {
    me.addTerminiLabels(ic.hAtoms);

    ic.draw();
  }
  else if(command == 'rotate left') {
     ic.bStopRotate = false;
     me.ROT_DIR = 'left';

     me.rotStruc('left');
  }
  else if(command == 'rotate right') {
     ic.bStopRotate = false;
     me.ROT_DIR = 'right';

     me.rotStruc('right');
  }
  else if(command == 'rotate up') {
     ic.bStopRotate = false;
     me.ROT_DIR = 'up';

     me.rotStruc('up');
  }
  else if(command == 'rotate down') {
     ic.bStopRotate = false;
     me.ROT_DIR = 'down';

     me.rotStruc('down');
  }
  else if(command == 'rotate x') {
      var axis = new THREE.Vector3(1,0,0);
      var angle = 0.5 * Math.PI;

      ic.setRotation(axis, angle);
  }
  else if(command == 'rotate y') {
      var axis = new THREE.Vector3(0,1,0);
      var angle = 0.5 * Math.PI;

      ic.setRotation(axis, angle);
  }
  else if(command == 'rotate z') {
      var axis = new THREE.Vector3(0,0,1);
      var angle = 0.5 * Math.PI;

      ic.setRotation(axis, angle);
  }
  else if(command === 'reset') {
      me.resetAll();
  }
  else if(command === 'reset orientation') {
    ic.resetOrientation();
    ic.draw();
  }
  else if(command == 'reset thickness') {
    me.resetAfter3Dprint();
    ic.draw();
  }
  else if(command == 'clear selection') {
    ic.removeHlObjects();
    me.removeHl2D();
    ic.bShowHighlight = false;

    me.bSelectResidue = false;
  }
  else if(command == 'zoom selection') {
    ic.zoominSelection();
    ic.draw();
  }
  else if(command == 'center selection') {
    ic.centerSelection();
    ic.draw();
  }
  else if(command == 'show selection') {
    me.showSelection();
  }
  else if(command == 'hide selection') {
    me.hideSelection();
  }
  else if(command == 'output selection') {
      me.outputSelection();
  }
  else if(command == 'toggle selection') {
     me.toggleSelection();
  }
  else if(command == 'toggle highlight') {
    me.toggleHighlight();
  }
  else if(command == 'stabilizer') {
    me.addStabilizer();

    me.prepareFor3Dprint();
    //ic.draw();
  }
  else if(command == 'disulfide bonds') {
    me.showSsbonds();
  }
  else if(command == 'cross linkage') {
    me.showClbonds();
  }
  else if(command == 'back') {
     me.back();
  }
  else if(command == 'forward') {
     me.forward();
  }
  else if(command == 'clear all') {
     me.selectAll();
  }
  else if(command == 'defined sets') {
     me.showSets();
  }
  else if(command == 'delete selected sets') {
     me.deleteSelectedSets();
  }
  else if(command == 'view interactions') {
     if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
         me.set2DDiagrams(me.inputid);
     }
  }
  else if(command == 'show annotations all chains') {
     me.showAnnoAllChains();
  }

  else if(command == 'save color') {
     me.saveColor();
  }
  else if(command == 'apply saved color') {
     me.applySavedColor();
  }
  else if(command == 'save style') {
     me.saveStyle();
  }
  else if(command == 'apply saved style') {
     me.applySavedStyle();
  }
  else if(command == 'select main chains') {
     me.selectMainChains();
  }
  else if(command == 'select side chains') {
     me.selectSideChains();
  }
  else if(command == 'select main side chains') {
     me.selectMainSideChains();
  }
  else if(command == 'realign') {
     me.realign();
  }
  else if(command == 'area') {
     me.calculateArea();
  }
  else if(command == 'table inter count only') {
     $(".icn3d-border").hide();
  }
  else if(command == 'table inter details') {
     $(".icn3d-border").show();
  }
  else if(command == 'setoption map nothing') {
     me.setOption('map', 'nothing');
  }
  else if(command == 'setoption emmap nothing') {
     me.setOption('emmap', 'nothing');
  }
  else if(command == 'setoption phimap nothing') {
     me.setOption('phimap', 'nothing');
  }
  else if(command == 'setoption phisurface nothing') {
     me.setOption('phisurface', 'nothing');
  }
  else if(command == 'clear symd symmetry') {
     ic.symdArray = [];
  }

// start with =================
  else if(commandOri.indexOf('define helix sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'helix');
  }
  else if(commandOri.indexOf('define sheet sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'sheet');
  }
  else if(commandOri.indexOf('define coil sets') == 0) {
     var chainStr = commandOri.split(' | ')[1];
     var chainid = chainStr.split(' ')[1];

     me.defineSecondary(chainid, 'coil');
  }
  else if(commandOri.indexOf('select interaction') == 0) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');
    if(idArray !== null) {
        var mmdbid = idArray[0].split('_')[0];
        if(!me.b2DShown) me.download2Ddgm(mmdbid.toUpperCase());

        me.selectInteraction(idArray[0], idArray[1]);
    }
  }

  else if(commandOri.indexOf('select saved atoms') == 0 || commandOri.indexOf('select sets') == 0) {
    // backward compatible: convert previous aligned_protein to protein_aligned
    commandOri = commandOri.replace(/aligned_protein/g, 'protein_aligned');

    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = paraArray[0].replace(/,/g, ' or ');

    var pos = 19; // 'select saved atoms '
    if(commandOri.indexOf('select sets') == 0) pos = 12; // 'select sets '

    var strSets = select.substr(pos);

    var commandname = strSets;

    if(paraArray.length == 2) commandname = paraArray[1].substr(5); // 'name ...'
    me.selectCombinedSets(strSets, commandname);
  }
  else if(commandOri.indexOf('select chain') !== -1) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

    //if(idArray !== null) me.changeChainid(idArray);
    for(var i = 0, il = idArray.length; i < il; ++i) {
        me.selectAChain(idArray[i], idArray[i], false);
    }
  }
  else if(commandOri.indexOf('select alignChain') !== -1) {
    var idArray = commandOri.substr(commandOri.lastIndexOf(' ') + 1).split(',');

    //if(idArray !== null) me.changeChainid(idArray);
    for(var i = 0, il = idArray.length; i < il; ++i) {
        me.selectAChain(idArray[i], 'align_' + idArray[i], true);
    }
  }
  else if(commandOri.indexOf('select zone cutoff') == 0) {
    var ret = me.getThresholdNameArrays(commandOri);

    me.pickCustomSphere(ret.threshold, ret.nameArray2, ret.nameArray, ret.bHbondCalc);
    me.bSphereCalc = true;

    //me.updateHlAll();
  }
  else if(command.indexOf('set surface opacity') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    ic.opts['opacity'] = parseFloat(value);
    ic.applySurfaceOptions();

    if(parseInt(100*value) < 100) me.bTransparentSurface = true;
  }
  else if(command.indexOf('set label scale') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    ic.labelScale = parseFloat(value);
  }
  else if(command.indexOf('set surface') == 0) {
    var value = command.substr(12);

    ic.opts['surface'] = value;
    ic.applySurfaceOptions();
  }
  else if(command.indexOf('set camera') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    ic.opts['camera'] = value;
  }
  else if(command.indexOf('set background') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    ic.opts['background'] = value;

    if(value == 'white' || value == 'grey') {
        $("#" + me.pre + "title").css("color", "black");
        $("#" + me.pre + "titlelink").css("color", "black");
    }
    else {
        $("#" + me.pre + "title").css("color", me.GREYD);
        $("#" + me.pre + "titlelink").css("color", me.GREYD);
    }
  }
  else if(commandOri.indexOf('set thickness') == 0) {
    var paraArray = command.split(' | ');

    me.bSetThickness = true;

    for(var i = 1, il = paraArray.length; i < il; ++i) {
        var p1Array = paraArray[i].split(' ');

        var para = p1Array[0];
        var value = parseFloat(p1Array[1]);

        if(para == 'linerad') ic.lineRadius = value;
        if(para == 'coilrad') ic.coilWidth = value;
        if(para == 'stickrad') ic.cylinderRadius = value;
        if(para == 'tracerad') ic.traceRadius = value;
        if(para == 'ballscale') ic.dotSphereScale = value;

        if(para == 'ribbonthick') ic.ribbonthickness = value;
        if(para == 'proteinwidth') ic.helixSheetWidth = value;
        if(para == 'nucleotidewidth') ic.nucleicAcidWidth = value;

        ic.draw();
    }
  }
  else if(command.indexOf('set highlight color') == 0) {
       var color = command.substr(20);
       if(color === 'yellow') {
           ic.hColor = ic.thr(0xFFFF00);
           ic.matShader = ic.setOutlineColor('yellow');
       }
       else if(color === 'green') {
           ic.hColor = ic.thr(0x00FF00);
           ic.matShader = ic.setOutlineColor('green');
       }
       else if(color === 'red') {
           ic.hColor = ic.thr(0xFF0000);
           ic.matShader = ic.setOutlineColor('red');
       }
       ic.draw(); // required to make it work properly
  }
  else if(command.indexOf('set highlight style') == 0) {
        var style = command.substr(20);

       if(style === 'outline') {
           ic.bHighlight = 1;
       }
       else if(style === '3d') {
           ic.bHighlight = 2;
       }

       ic.draw();
  }
  else if(command.indexOf('add line') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');
    var p2Array = paraArray[2].split(' ');
    var color = paraArray[3].substr(paraArray[3].lastIndexOf(' ') + 1);
    var dashed = paraArray[4].substr(paraArray[4].lastIndexOf(' ') + 1) === 'true' ? true : false;
    var type = paraArray[5].substr(paraArray[5].lastIndexOf(' ') + 1);

    me.addLine(parseFloat(p1Array[1]), parseFloat(p1Array[3]), parseFloat(p1Array[5]), parseFloat(p2Array[1]), parseFloat(p2Array[3]), parseFloat(p2Array[5]), color, dashed, type);
    ic.draw();
  }
  else if(commandOri.indexOf('add label') == 0) {
    var paraArray = commandOri.split(' | ');
    var text = paraArray[0].substr(('add label').length + 1);

    // add label Text | x 40.45 y 24.465000000000003 z 53.48 | size 40 | color #ffff00 | background #cccccc | type custom
    var x,y,z, size, color, background, type;
    var bPosition = false;
    for(var i = 1, il = paraArray.length; i < il; ++i) {
        var wordArray = paraArray[i].split(' ');

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
      var position = ic.centerAtoms(ic.hash2Atoms(ic.hAtoms));
      x = position.center.x;
      y = position.center.y;
      z = position.center.z;
    }

    me.addLabel(text, x,y,z, size, color, background, type);
    ic.draw();
  }
  else if(commandOri.indexOf('msa') == 0) {
      //"msa | " + JSON.stringify(me.targetGapHash)
      var paraArray = commandOri.split(' | ');

      var pos_from_toArray = paraArray[1].split(' ');

      me.targetGapHash = {};
      for(var i = 0, il = pos_from_toArray.length; i < il; ++i) {
          var pos_from_to = pos_from_toArray[i].split('_');
          me.targetGapHash[parseInt(pos_from_to[0])] = {"from": parseInt(pos_from_to[1]), "to": parseInt(pos_from_to[2])};
      }

      me.resetAnnoAll();
  }
  else if(commandOri.indexOf('add track') == 0) {
      //"add track | chainid " + chainid + " | title " + title + " | text " + text
      // + " | type " + type + " | color " + color + " | msa " + color
      var paraArray = commandOri.split(' | ');

      var chainid = paraArray[1].substr(8);
      var title = paraArray[2].substr(6);
      var text = paraArray[3].substr(5);
      var type;
      if(paraArray.length >= 5) type = paraArray[4].substr(5);
      var color;
      if(paraArray.length >= 6) color = paraArray[5].substr(6);
      var msa;
      if(paraArray.length >= 7) msa = paraArray[6].substr(4);

      $("#" + me.pre + "anno_custom")[0].checked = true;
      $("[id^=" + me.pre + "custom]").show();

      if(color == '0') color = undefined;

      me.checkGiSeq(chainid, title, text, type, color, msa, 0);
  }
  else if(command.indexOf('remove one stabilizer') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');

    var rmLineArray = [];
    rmLineArray.push(parseInt(p1Array[0]));
    rmLineArray.push(parseInt(p1Array[1]));

    me.removeOneStabilizer(rmLineArray);

    ic.draw();
  }
  else if(command.indexOf('add one stabilizer') == 0) {
    var paraArray = command.split(' | ');
    var p1Array = paraArray[1].split(' ');

     if(ic.pairArray === undefined) ic.pairArray = [];
     ic.pairArray.push(parseInt(p1Array[0]));
     ic.pairArray.push(parseInt(p1Array[1]));

     ic.draw();
  }
  else if(command.indexOf('select planes z-axis') == 0) {
    var paraArray = command.split(' ');
    if(paraArray.length == 5) {
        var large = parseFloat(paraArray[3]);
        var small = parseFloat(paraArray[4]);

        me.selectBtwPlanes(large, small);
    }
  }
  else if(command.indexOf('adjust membrane z-axis') == 0) {
    var paraArray = command.split(' ');
    if(paraArray.length == 5) {
        var large = parseFloat(paraArray[3]);
        var small = parseFloat(paraArray[4]);

        me.adjustMembrane(large, small);
    }
  }
  else if(command.indexOf('toggle membrane') == 0) {
    me.toggleMembrane();
  }
  else if(commandOri.indexOf('calc buried surface') == 0) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length == 2) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        me.calcBuriedSurface(nameArray2, nameArray);
    }
  }
  else if(commandOri.indexOf('dist') == 0) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length == 2) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray = setNameArray[0].split(',');
        var nameArray2 = setNameArray[1].split(',');

        me.measureDistTwoSets(nameArray, nameArray2);
    }
  }
  else if(commandOri.indexOf('display interaction 3d') == 0
      || commandOri.indexOf('view interaction pairs') == 0
      || commandOri.indexOf('save1 interaction pairs') == 0
      || commandOri.indexOf('save2 interaction pairs') == 0
      || commandOri.indexOf('line graph interaction pairs') == 0
      || commandOri.indexOf('scatterplot interaction pairs') == 0
      ) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length >= 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var bHbond = paraArray[2].indexOf('hbonds') !== -1;
        var bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
        var bInteraction = paraArray[2].indexOf('interactions') !== -1;

        var bHalogen = paraArray[2].indexOf('halogen') !== -1;
        var bPication = paraArray[2].indexOf('pi-cation') !== -1;
        var bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

        var bHbondCalc;
        if(paraArray.length >= 4) {
            bHbondCalc = (paraArray[3] == 'true') ? true : false;
        }

        if(paraArray.length >= 5) {
           thresholdArray = paraArray[4].split(' ');

           if(thresholdArray.length >= 4) {
               $("#" + me.pre + "hbondthreshold").val(thresholdArray[1]);
               $("#" + me.pre + "saltbridgethreshold").val(thresholdArray[2]);
               $("#" + me.pre + "contactthreshold").val(thresholdArray[3]);

               if(thresholdArray.length == 7) {
                   $("#" + me.pre + "halogenthreshold").val(thresholdArray[4]);
                   $("#" + me.pre + "picationthreshold").val(thresholdArray[5]);
                   $("#" + me.pre + "pistackingthreshold").val(thresholdArray[6]);
               }
           }
        }

        var type;
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

        me.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, type, bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
    }
  }
  else if(commandOri.indexOf('export pairs') == 0) {
    var paraArray = commandOri.split(' | ');
    if(paraArray.length == 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var distArray = paraArray[2].split(' ');
        var radius = distArray[1];

        me.pickCustomSphere(radius, nameArray2, nameArray, me.bSphereCalc);
        me.bSphereCalc = true;
        var text = me.exportSpherePairs();
        var file_pref = (me.inputid) ? me.inputid : "custom";
        me.saveFile(file_pref + '_sphere_pairs.html', 'html', text);
    }
  }
  else if(commandOri.indexOf('export pqr') == 0) {
       me.exportPqr();
  }
  else if(command.indexOf('graph label') == 0) {
    var pos = command.lastIndexOf(' ');
    var className = command.substr(pos + 1);

    $("#" + me.svgid + "_label").val(className);

    $("#" + me.svgid + " text").removeClass();
    $("#" + me.svgid + " text").addClass(className);
  }
  else if(command.indexOf('line graph scale') == 0) {
    var pos = command.lastIndexOf(' ');
    var scale = command.substr(pos + 1);

    $("#" + me.linegraphid + "_label").val(scale);

    $("#" + me.linegraphid).attr("width", (me.linegraphWidth * parseFloat(scale)).toString() + "px");
  }
  else if(command.indexOf('scatterplot scale') == 0) {
    var pos = command.lastIndexOf(' ');
    var scale = command.substr(pos + 1);

    $("#" + me.scatterplotid + "_label").val(scale);

    $("#" + me.scatterplot).attr("width", (me.scatterplotWidth * parseFloat(scale)).toString() + "px");
  }
  else if(command.indexOf('graph force') == 0) {
    var pos = command.lastIndexOf(' ');
    me.force = parseInt(command.substr(pos + 1));

    $("#" + me.svgid + "_force").val(me.force);

    me.handleForce();
  }
  else if(command.indexOf('hide edges') == 0) {
    var pos = command.lastIndexOf(' ');
    me.hideedges = parseInt(command.substr(pos + 1));

    $("#" + me.svgid + "_hideedges").val(me.hideedges);

    if(me.hideedges) {
        me.contactInsideColor = 'FFF';
        me.hbondInsideColor = 'FFF';
        me.ionicInsideColor = 'FFF';
    }
    else {
        me.contactInsideColor = 'DDD';
        me.hbondInsideColor = 'AFA';
        me.ionicInsideColor = '8FF';
    }

    if(me.graphStr !== undefined && ic.bRender && me.force) {
       me.drawGraph(me.graphStr);
    }
  }
  else if(command.indexOf('reset interaction pairs') == 0) {
    me.resetInteractionPairs();
  }
  else if(command.indexOf('side by side') == 0) {
    var paraArray = command.split(' | ');
    var url = paraArray[1];

    window.open(url, '_blank');
  }
  else if(commandOri.indexOf('your note') == 0) {
    var paraArray = commandOri.split(' | ');
    me.yournote = paraArray[1];

    $("#" + me.pre + "yournote").val(me.yournote);
    document.title = me.yournote;
  }
  else if(command.indexOf('cross structure interaction') == 0) {
    ic.crossstrucinter = parseInt(command.substr(command.lastIndexOf(' ') + 1));

    $("#" + me.pre + "crossstrucinter").val(ic.crossstrucinter);
  }
  else if(command == 'replay on') {
    me.replayon();
  }
  else if(command == 'replay off') {
    me.replayoff();
  }

// start with, single word =============
  else if(command.indexOf('pickatom') == 0) {
    var atomid = parseInt(command.substr(command.lastIndexOf(' ') + 1));

    ic.pAtom = ic.atoms[atomid];

    ic.showPicking(ic.pAtom);
  }
  else if(commandOri.indexOf('color') == 0) {
    var strArray = commandOri.split(" | ");
    var color = strArray[0].substr(strArray[0].indexOf(' ') + 1);
    ic.opts['color'] = color;

    if(color == "residue custom" && strArray.length == 2) {
        ic.customResidueColors = JSON.parse(strArray[1]);
        for(var res in ic.customResidueColors) {
            ic.customResidueColors[res.toUpperCase()] = ic.thr("#" + ic.customResidueColors[res]);
        }
    }
    else if(color == "align custom" && strArray.length == 3) {
        var chainid = strArray[1];
        var resiScoreArray = strArray[2].split(', ');
        ic.queryresi2score = {};
        ic.queryresi2score[chainid] = {};
        for(var i = 0, il = resiScoreArray.length; i < il; ++i) {
            var resi_score = resiScoreArray[i].split(' ');

            ic.queryresi2score[chainid][resi_score[0]] = resi_score[1];
        }
    }
    else if(color == "align custom" && strArray.length == 4) {
        // me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
        me.setQueryresi2score(strArray);
    }
    else if(color == "area" && strArray.length == 2) {
        ic.midpercent = strArray[1];
        $("#" + me.pre + 'midpercent').val(ic.midpercent);
    }

    ic.setColorByOptions(ic.opts, ic.hAtoms);

    me.updateHlAll();

    // change graph color
    me.updateGraphColor();
  }
  else if(commandOri.indexOf('custom tube') == 0) {
    var strArray = commandOri.split(" | ");

    me.setQueryresi2score(strArray);

    me.setStyle('proteins', 'custom tube');
  }
  else if(command.indexOf('style') == 0) {
    var secondPart = command.substr(command.indexOf(' ') + 1);

    var selectionType = secondPart.substr(0, secondPart.indexOf(' '));
    var style = secondPart.substr(secondPart.indexOf(' ') + 1);

    me.setStyle(selectionType, style);
  }
  else if(command.indexOf('window') == 0) {
    var secondPart = command.substr(command.indexOf(' ') + 1);

    if(secondPart == "aligned sequences") {
        me.openDlg('dl_alignment', 'Select residues in aligned sequences');
    }
    else if(secondPart == "interaction table") {
        me.openDlg('dl_allinteraction', 'Show interactions');
    }
    else if(secondPart == "interaction graph") {
        me.openDlg('dl_linegraph', 'Show interactions between two lines of residue nodes');
    }
    else if(secondPart == "interaction scatterplot") {
        me.openDlg('dl_scatterplot', 'Show interactions as scatterplot');
    }
    else if(secondPart == "force-directed graph") {
        me.openDlg('dl_graph', 'Force-directed graph');
    }
  }
  else if(command.indexOf('set theme') == 0) {
    var color = command.substr(command.lastIndexOf(' ') + 1);
    me.setTheme(color);
  }
  else if(command.indexOf('set double color') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    if(value == 'on') {
        ic.bDoublecolor = true;
        me.setStyle('proteins', 'ribbon');
    }
    else if(value == 'off') {
        ic.bDoublecolor = false;
    }
  }
  else if(command.indexOf('adjust dialog') == 0) {
    var id = command.substr(command.lastIndexOf(' ') + 1);
    me.adjust2DWidth(id);
  }
  else if(command.indexOf('glycans cartoon') == 0) {
    var value = command.substr(command.lastIndexOf(' ') + 1);
    if(value == 'yes') {
        ic.bGlycansCartoon = true;
    }
    else {
        ic.bGlycansCartoon = false;
    }
  }

// special, select ==========

  else if(command.indexOf('select displayed set') !== -1) {
    ic.hAtoms = ic.cloneHash(ic.dAtoms);
    me.updateHlAll();
  }
  else if(command.indexOf('select prop') !== -1) {
    var paraArray = commandOri.split(' | ');

    var property = paraArray[0].substr('select prop'.length + 1);

    var from, to;
    if(paraArray.length == 2) {
        var from_to = paraArray[1].split('_');
        from = from_to[0];
        to = from_to[1];
    }

    me.selectProperty(property, from, to);
  }
  else if(command.indexOf('select') == 0 && command.indexOf('name') !== -1) {
    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = '', commandname = '', commanddesc = '';
    for (var i = 0, il = paraArray.length; i < il; ++i) {
        var para = paraArray[i];

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

    me.selectByCommand(select, commandname, commanddesc);
  }
  else if(command.indexOf('select $') !== -1 || command.indexOf('select .') !== -1 || command.indexOf('select :') !== -1 || command.indexOf('select @') !== -1) {
    var paraArray = commandOri.split(' | '); // atom names might be case-sensitive

    var select = paraArray[0].substr(paraArray[0].indexOf(' ') + 1);
    var commandname = '', commanddesc = '';

    if(paraArray.length > 1) {
        commandname = paraArray[1].substr(paraArray[1].indexOf(' ') + 1);
    }

    if(paraArray.length > 2) {
        commanddesc = paraArray[2].substr(paraArray[2].indexOf(' ') + 1);
    }

    if(select.indexOf(' or ') !== -1) { // "select " command without " | name"
        me.selectByCommand(select, commandname, commanddesc);
    }
    else { // only single query from selectByCommand()
        me.selectBySpec(select, commandname, commanddesc);
    }
  }

  if(bShowLog) {
      me.setLogCmd(commandOri, false);
  }

  me.bAddCommands = true;
};
