/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickShow_selected = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "show_selected").add("#" + me.pre + "mn2_show_selected").click(function(e) { var ic = me.icn3d;
       //me.setLogCmd("show selection", true);

       me.showSelection();
       me.setLogCmd("show selection", true);
    });
};

iCn3DUI.prototype.clickHide_selected = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "mn2_hide_selected").click(function(e) { var ic = me.icn3d;
       me.hideSelection();
       me.setLogCmd("hide selection", true);
    });
};

iCn3DUI.prototype.showSelection = function () { var me = this, ic = me.icn3d; "use strict";
    ic.dAtoms = {};

    if(Object.keys(ic.hAtoms).length == 0) me.selectAll_base();

    ic.dAtoms = ic.cloneHash(ic.hAtoms);

    var centerAtomsResults = ic.centerAtoms(ic.hash2Atoms(ic.dAtoms));
    ic.maxD = centerAtomsResults.maxD;
    if (ic.maxD < 5) ic.maxD = 5;

    //show selected rotationcenter
    ic.opts['rotationcenter'] = 'display center';

    me.saveSelectionIfSelected();

    ic.draw();

    me.update2DdgmContent();
    me.updateHl2D();

    // show selected chains in annotation window
    me.showAnnoSelectedChains();

    // update 2d graph
    if(me.graphStr !== undefined) {
      me.graphStr = me.getGraphDataForDisplayed();
    }

    if(me.bGraph) me.drawGraph(me.graphStr);
    if(me.bLinegraph) me.drawLineGraph(me.graphStr);
    if(me.bScatterplot) me.drawLineGraph(me.graphStr, true);
};

iCn3DUI.prototype.getGraphDataForDisplayed = function () { var me = this, ic = me.icn3d; "use strict";
      var graphJson = JSON.parse(me.graphStr);

      var residHash = ic.getResiduesFromAtoms(ic.dAtoms);

      var nodeArray = [], linkArray = [];

      var nodeHash = {};
      for(var i = 0, il = graphJson.nodes.length; i < il; ++i) {
          var node = graphJson.nodes[i];
          var resid = node.r.substr(4); // 1_1_1KQ2_A_1

          if(residHash.hasOwnProperty(resid)) {
              nodeArray.push(node);
              nodeHash[node.id] = 1;
          }
      }

      for(var i = 0, il = graphJson.links.length; i < il; ++i) {
          var link = graphJson.links[i];

          if(nodeHash.hasOwnProperty(link.source) && nodeHash.hasOwnProperty(link.target)) {
              linkArray.push(link);
          }
      }

      graphJson.nodes = nodeArray;
      graphJson.links = linkArray;

      me.graphStr = JSON.stringify(graphJson);

      return me.graphStr;
};

iCn3DUI.prototype.hideSelection = function () { var me = this, ic = me.icn3d; "use strict";
    ic.dAtoms = ic.exclHash(ic.dAtoms, ic.hAtoms);

    ic.hAtoms = ic.cloneHash(ic.dAtoms);

    var centerAtomsResults = ic.centerAtoms(ic.hash2Atoms(ic.dAtoms));
    ic.maxD = centerAtomsResults.maxD;
    if (ic.maxD < 5) ic.maxD = 5;

    //show selected rotationcenter
    ic.opts['rotationcenter'] = 'display center';

    me.saveSelectionIfSelected();

    ic.draw();

    me.update2DdgmContent();
    me.updateHl2D();

    // show selected chains in annotation window
    me.showAnnoSelectedChains();
};

iCn3DUI.prototype.clickModeswitch = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "modeswitch").click(function (e) {
        if($("#" + me.pre + "modeswitch")[0] !== undefined && $("#" + me.pre + "modeswitch")[0].checked) { // mode: selection
            me.setModeAndDisplay('selection');
        }
        else { // mode: all
            me.setModeAndDisplay('all');
        }
    });

    $("#" + me.pre + "mn6_modeall").click(function (e) {
        me.setModeAndDisplay('all');
    });

    $("#" + me.pre + "mn6_modeselection").click(function (e) {
        me.setModeAndDisplay('selection');
    });
};

iCn3DUI.prototype.selectAll_base = function() { var me = this, ic = me.icn3d; "use strict";
    ic.hAtoms = {};
    ic.dAtoms = {};

    for(var i in ic.chains) {
       ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[i]);
       ic.dAtoms = ic.unionHash(ic.dAtoms, ic.chains[i]);
    }
};

iCn3DUI.prototype.selectAll = function() { var me = this, ic = me.icn3d; "use strict";
    me.selectAll_base();

    ic.removeHlObjects();
    me.removeHl2D();
    me.removeHlMenus();

    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;

    me.removeSeqResidueBkgd();
    me.update2DdgmContent();

    // show annotations for all protein chains
    $("#" + me.pre + "dl_annotations > .icn3d-annotation").show();

    me.setMode('all');
};

iCn3DUI.prototype.setModeAndDisplay = function(mode) { var me = this, ic = me.icn3d; "use strict";
    if(mode === 'all') { // mode all
        me.setMode('all');

        // remember previous selection
        ic.prevHighlightAtoms = ic.cloneHash(ic.hAtoms);

       // select all
       me.setLogCmd("set mode all", true);

       me.selectAll();

       ic.draw();
    }
    else { // mode selection
        me.setMode('selection');

        // get the previous hAtoms
        if(ic.prevHighlightAtoms !== undefined) {
            ic.hAtoms = ic.cloneHash(ic.prevHighlightAtoms);
        }
        else {
            me.selectAll();
        }

        me.setLogCmd("set mode selection", true);

        me.updateHlAll();
    }
};

iCn3DUI.prototype.setMode = function(mode) { var me = this, ic = me.icn3d; "use strict";
    if(mode === 'all') { // mode all
        // set text
        $("#" + me.pre + "modeall").show();
        $("#" + me.pre + "modeselection").hide();

        if($("#" + me.pre + "modeswitch")[0] !== undefined) $("#" + me.pre + "modeswitch")[0].checked = false;

        if($("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").removeClass('icn3d-modeselection');
        if($("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").removeClass('icn3d-modeselection');
        //if($("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").removeClass('icn3d-modeselection');
    }
    else { // mode selection
        //if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
            // set text
            $("#" + me.pre + "modeall").hide();
            $("#" + me.pre + "modeselection").show();

            if($("#" + me.pre + "modeswitch")[0] !== undefined) $("#" + me.pre + "modeswitch")[0].checked = true;

            if(!$("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").addClass('icn3d-modeselection');
            if(!$("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").addClass('icn3d-modeselection');
            //if(!$("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").addClass('icn3d-modeselection');

            // show selected chains in annotation window
            //me.showAnnoSelectedChains();
        //}
    }
};

iCn3DUI.prototype.saveSelection = function(name, description) { var me = this, ic = me.icn3d; "use strict";
    me.selectedResidues = {};

    me.selectedResidues = ic.getResiduesFromCalphaAtoms(ic.hAtoms);

    if(Object.keys(me.selectedResidues).length > 0) {
        if(ic.pk == 1) {
            var bAtom = true;
            me.selectResidueList(ic.hAtoms, name, description,undefined, undefined, bAtom);
            //me.updateHlAll();

            me.updateSelectionNameDesc();

            me.setLogCmd('select ' + me.atoms2spec(ic.hAtoms) + ' | name ' + name, true);
        }
        else {
            me.selectResidueList(me.selectedResidues, name, description);
            //me.updateHlAll();

            me.updateSelectionNameDesc();

            me.setLogCmd('select ' + me.residueids2spec(Object.keys(me.selectedResidues)) + ' | name ' + name, true);
        }
    }
};

iCn3DUI.prototype.removeSelection = function() { var me = this, ic = me.icn3d; "use strict";
    if(!me.bAnnotations) {
        me.removeSeqChainBkgd();
    }

    if(!ic.bCtrl && !ic.bShift) {
        me.removeSeqResidueBkgd();

        me.removeSeqChainBkgd();
    }

      me.selectedResidues = {};
      me.bSelectResidue = false;

      ic.hAtoms = {};

      ic.removeHlObjects();

      me.removeHl2D();
};

iCn3DUI.prototype.updateSelectionNameDesc = function() { var me = this, ic = me.icn3d; "use strict";
    var numDef = Object.keys(ic.defNames2Residues).length + Object.keys(ic.defNames2Atoms).length;

    $("#" + me.pre + "seq_command_name").val("seq_" + numDef);
    //$("#" + me.pre + "seq_command_desc").val("seq_desc_" + numDef);

    $("#" + me.pre + "seq_command_name2").val("seq_" + numDef);
    //$("#" + me.pre + "seq_command_desc2").val("seq_desc_" + numDef);

    $("#" + me.pre + "alignseq_command_name").val("alseq_" + numDef);
    //$("#" + me.pre + "alignseq_command_desc").val("alseq_desc_" + numDef);
};

iCn3DUI.prototype.selectAChain = function (chainid, commandname, bAlign, bUnion) { var me = this, ic = me.icn3d; "use strict";
    commandname = commandname.replace(/\s/g, '');
    var command = (bAlign !== undefined || bAlign) ? 'select alignChain ' + chainid : 'select chain ' + chainid;

    //var residueHash = {}, chainHash = {};

    if(bUnion === undefined || !bUnion) {
        ic.hAtoms = {};
        me.menuHlHash = {};
    }
    else {
        ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[chainid]);

        if(me.menuHlHash === undefined) me.menuHlHash = {};
    }

    me.menuHlHash[chainid] = 1;

    //chainHash[chainid] = 1;

    var chnsSeq = (bAlign) ? ic.alnChainsSeq[chainid] : ic.chainsSeq[chainid];
    if(chnsSeq === undefined) chnsSeqLen = 0;
    else chnsSeqLen = chnsSeq.length;

    var oriResidueHash = {};
    for(var i = 0, il = chnsSeqLen; i < il; ++i) { // get residue number
        var resObj = chnsSeq[i];
        var residueid = chainid + "_" + resObj.resi;

        var value = resObj.name;

        if(value !== '' && value !== '-') {
          oriResidueHash[residueid] = 1;
          for(var j in ic.residues[residueid]) {
            ic.hAtoms[j] = 1;
          }
        }
    }

    if((ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
        me.addCustomSelection(Object.keys(oriResidueHash), commandname, commandname, command, true);
    }

    var bForceHighlight = true;

    if(bAlign) {
        me.updateHlAll(undefined, undefined, bUnion, bForceHighlight);
    }
    else {
        me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion, bForceHighlight);
    }
};

iCn3DUI.prototype.selectResidueList = function (residueHash, commandname, commanddescr, bUnion, bUpdateHighlight, bAtom) { var me = this, ic = me.icn3d; "use strict";
  if(residueHash !== undefined && Object.keys(residueHash).length > 0) {
    if(bUnion === undefined || !bUnion) {
        ic.hAtoms = {};
        me.menuHlHash = {};
    }
    else {
        if(me.menuHlHash === undefined) me.menuHlHash = {};
    }

    if(bAtom) {
        for(var i in residueHash) {
            ic.hAtoms[i] = 1;
        }
    }
    else {
        for(var i in residueHash) {
            for(var j in ic.residues[i]) {
              ic.hAtoms[j] = 1;
            }
        }
    }

    commandname = commandname.replace(/\s/g, '');

    me.menuHlHash[commandname] = 1;

    var select, bSelectResidues;

    if(bAtom) {
        select = "select " + me.atoms2spec(ic.hAtoms);
        bSelectResidues = false;
    }
    else {
        select = "select " + me.residueids2spec(Object.keys(residueHash));
        bSelectResidues = true;
    }

    var residueAtomArray = Object.keys(residueHash);

    //if( (ic.defNames2Atoms === undefined || !ic.defNames2Atoms.hasOwnProperty(commandname)) && (ic.defNames2Residues === undefined || !ic.defNames2Residues.hasOwnProperty(commandname)) ) {
        me.addCustomSelection(residueAtomArray, commandname, commanddescr, select, bSelectResidues);
    //}

    if(bUpdateHighlight === undefined || bUpdateHighlight) me.updateHlAll(Object.keys(me.menuHlHash), undefined, bUnion);
  }
};

iCn3DUI.prototype.addCustomSelection = function (residueAtomArray, commandname, commanddesc, select, bSelectResidues) { var me = this, ic = me.icn3d; "use strict";
    if(bSelectResidues) {
        ic.defNames2Residues[commandname] = residueAtomArray;
    }
    else {
        ic.defNames2Atoms[commandname] = residueAtomArray;
    }

    ic.defNames2Command[commandname] = select;
    ic.defNames2Descr[commandname] = commanddesc;

    me.updateHlMenus([commandname]);
};

iCn3DUI.prototype.selectMainChains = function () { var me = this, ic = me.icn3d; "use strict";
    var currHAtoms = ic.cloneHash(ic.hAtoms);

    ic.hAtoms = ic.selectMainChainSubset(currHAtoms);

    me.showHighlight();
};

iCn3DUI.prototype.selectSideChains = function () { var me = this, ic = me.icn3d; "use strict";
    var currHAtoms = ic.cloneHash(ic.hAtoms);

    var nuclMainArray = ["C1'", "C1*", "C2'", "C2*", "C3'", "C3*", "C4'", "C4*", "C5'", "C5*", "O3'", "O3*", "O4'", "O4*", "O5'", "O5*", "P", "OP1", "O1P", "OP2", "O2P"];

    ic.hAtoms = {};
    for(var i in currHAtoms) {
        if( (ic.proteins.hasOwnProperty(i) && ic.atoms[i].name !== "N" && ic.atoms[i].name !== "C" && ic.atoms[i].name !== "O"
          && !(ic.atoms[i].name === "CA" && ic.atoms[i].elem === "C") )
          || (ic.nucleotides.hasOwnProperty(i) && nuclMainArray.indexOf(ic.atoms[i].name) === -1) ) {
            ic.hAtoms[i] = 1;
        }
    }

    me.showHighlight();
};

iCn3DUI.prototype.selectMainSideChains = function () { var me = this, ic = me.icn3d; "use strict";
    var residHash = ic.getResiduesFromAtoms(ic.hAtoms);

    ic.hAtoms = {};
    for(var resid in residHash) {
        ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[resid]);
        ic.dAtoms = ic.unionHash(ic.dAtoms, ic.residues[resid]);
    }

    ic.draw();

    me.showHighlight();
};
