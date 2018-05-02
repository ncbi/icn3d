/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.update2DdgmContent = function () { var me = this;
   // update 2D diagram to show just the displayed parts
   var html2ddgm = '';
   if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) {
      html2ddgm += me.draw2Ddgm(me.interactionData, me.inputid, undefined, true);
      html2ddgm += me.set2DdgmNote();

      $("#" + me.pre + "dl_2ddgm").html(html2ddgm);
   }
   else if(me.cfg.align !== undefined) {
      html2ddgm += me.draw2Ddgm(me.interactionData1, me.mmdbidArray[0].toUpperCase(), 0, true);
      html2ddgm += me.draw2Ddgm(me.interactionData2, me.mmdbidArray[1].toUpperCase(), 1, true);
      html2ddgm += me.set2DdgmNote(true);

      $("#" + me.pre + "dl_2ddgm").html(html2ddgm);
   }
};

iCn3DUI.prototype.changeSeqColor = function(residueArray) { var me = this;
   for(var i = 0, il = residueArray.length; i < il; ++i) {
       var pickedResidue = residueArray[i];
       if($("[id$=" + me.pre + pickedResidue + "]").length !== 0) {
         var atom = me.icn3d.getFirstAtomObj(me.icn3d.residues[pickedResidue]);
         var color = (atom.color !== undefined) ? "#" + atom.color.getHexString() : me.icn3d.defaultAtomColor;
         //$("[id$=" + me.pre + pickedResidue + "]").attr('style', 'color:' + color);
         // annotations will have their own color, only the chain will have the changed color
         $("[id=giseq_" + me.pre + pickedResidue + "]").attr('style', 'color:' + color);
         if(me.cfg.align !== undefined) $("[id=align_" + me.pre + pickedResidue + "]").attr('style', 'color:' + color);
       }
   }
};

iCn3DUI.prototype.removeHlAll = function() { var me = this;
       me.removeHlObjects();
       me.removeHlSeq();
       me.removeHl2D();
       me.removeHlMenus();
};

iCn3DUI.prototype.removeHlObjects = function() { var me = this;
       me.icn3d.removeHlObjects();
};

// remove highlight in sequence
iCn3DUI.prototype.removeHlSeq = function() { var me = this;
//       me.removeSeqChainBkgd();
       me.removeSeqResidueBkgd();
};

// remove highlight in 2D window
iCn3DUI.prototype.removeHl2D = function() { var me = this;
      // clear nodes in 2d dgm
      $("#" + me.pre + "dl_2ddgm rect").attr('stroke', '#000000');
      $("#" + me.pre + "dl_2ddgm circle").attr('stroke', '#000000');
      $("#" + me.pre + "dl_2ddgm polygon").attr('stroke', '#000000');

      $("#" + me.pre + "dl_2ddgm svg line").attr('stroke', '#000000');

      $("#" + me.pre + "dl_2ddgm rect").attr('stroke-width', 1);
      $("#" + me.pre + "dl_2ddgm circle").attr('stroke-width', 1);
      $("#" + me.pre + "dl_2ddgm polygon").attr('stroke-width', 1);

      $("#" + me.pre + "dl_2ddgm line").attr('stroke-width', 1);
};

// remove highlight in the menu of defined sets
iCn3DUI.prototype.removeHlMenus = function() { var me = this;
    $("#" + me.pre + "atomsCustom").val("");
};

iCn3DUI.prototype.updateHlAll = function(commandnameArray, bSetMenu, bUnion) { var me = this;
       me.updateHlObjects();

       if(commandnameArray !== undefined) {
           me.updateHlSeqInChain(commandnameArray, bUnion);
       }
       else {
           me.updateHlSeq(undefined, undefined, bUnion);
       }

       me.updateHl2D();
       if(bSetMenu === undefined || bSetMenu) me.updateHlMenus(commandnameArray);

       //me.showAnnoSelectedChains();
};

iCn3DUI.prototype.updateHlObjects = function() { var me = this;
       me.icn3d.removeHlObjects();
       me.icn3d.addHlObjects();
};

// update highlight in sequence, slow if sequence is long
iCn3DUI.prototype.updateHlSeq = function(bShowHighlight, residueHash, bUnion) { var me = this;
       if(bUnion === undefined || !bUnion) {
           me.removeHlSeq();
       }

       if(residueHash === undefined) residueHash = me.icn3d.getResiduesFromAtoms(me.icn3d.hAtoms);

       me.hlSeq(Object.keys(residueHash));
       me.changeSeqColor(Object.keys(residueHash));
};

iCn3DUI.prototype.updateHlSeqInChain = function(commandnameArray, bUnion) { var me = this;
       if(bUnion === undefined || !bUnion) {
           me.removeHlSeq();
       }
       //if(residueHash === undefined) residueHash = me.icn3d.getResiduesFromAtoms(me.icn3d.hAtoms);

       //me.hlSeq(Object.keys(residueHash));
       // speed up with chain highlight
       for(var i = 0, il = commandnameArray.length; i < il; ++i) {
           var commandname = commandnameArray[i];
           if(Object.keys(me.icn3d.chains).indexOf(commandname) !== -1) {
               me.hlSeqInChain(commandname);
           }
           else {
               var residueArray = [];

               if(me.icn3d.defNames2Residues[commandname] !== undefined && me.icn3d.defNames2Residues[commandname].length > 0) {
                   residueArray = me.icn3d.defNames2Residues[commandname];
               }

               var residueHash = {};
               if(me.icn3d.defNames2Atoms[commandname] !== undefined && me.icn3d.defNames2Atoms[commandname].length > 0) {
                   for(var j = 0, jl = me.icn3d.defNames2Atoms[commandname].length; j < jl; ++j) {
                       var serial = me.icn3d.defNames2Atoms[commandname][j];
                       var atom = me.icn3d.atoms[serial];
                       var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                       residueHash[resid] = 1;
                   }

                   residueArray = residueArray.concat(Object.keys(residueHash));
               }

               me.hlSeq(residueArray);
           }
       }

       //me.changeSeqColor(Object.keys(residueHash));
};

// update highlight in 2D window
iCn3DUI.prototype.updateHl2D = function(chainArray2d) { var me = this;
  me.removeHl2D();

  if(chainArray2d === undefined) {
      var chainHash = me.icn3d.getChainsFromAtoms(me.icn3d.hAtoms);
      chainArray2d = Object.keys(chainHash);
  }

  if(chainArray2d !== undefined) {
      for(var i = 0, il = chainArray2d.length; i < il; ++i) {
          var hlatoms = me.icn3d.intHash(me.icn3d.chains[chainArray2d[i]], me.icn3d.hAtoms);
          var ratio = 1.0 * Object.keys(hlatoms).length / Object.keys(me.icn3d.chains[chainArray2d[i]]).length;

          var firstAtom = me.icn3d.getFirstAtomObj(hlatoms);
          if(me.icn3d.alnChains[chainArray2d[i]] !== undefined) {
                var alignedAtoms = me.icn3d.intHash(me.icn3d.alnChains[chainArray2d[i]], hlatoms);
                if(Object.keys(alignedAtoms).length > 0) firstAtom = me.icn3d.getFirstAtomObj(alignedAtoms);
            }
          var color = (firstAtom !== undefined && firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() : '#FFFFFF';

          var target = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-hlnode']");
          var base = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-basenode']");
          if(target !== undefined) {
              me.highlightNode('rect', target, base, ratio);
              $(target).attr('fill', color);
          }

          target = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-hlnode']");
          base = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-basenode']");
          if(target !== undefined) {
                me.highlightNode('circle', target, base, ratio);
                $(target).attr('fill', color);
          }

          target = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-hlnode']");
          base = $("#" + me.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-basenode']");

          if(target !== undefined) {
              me.highlightNode('polygon', target, base, ratio);
              $(target).attr('fill', color);
          }
      }
  }

  if(me.lineArray2d !== undefined) {
      for(var i = 0, il = me.lineArray2d.length; i < il; i += 2) {
          $("#" + me.pre + "dl_2ddgm g[chainid1=" + me.lineArray2d[i] + "][chainid2=" + me.lineArray2d[i + 1] + "] line").attr('stroke', me.ORANGE);
      }
  }

  // update the previously highlisghted atoms for switching between all and selection
  me.icn3d.prevHighlightAtoms = me.icn3d.cloneHash(me.icn3d.hAtoms);

  if(Object.keys(me.icn3d.hAtoms).length < Object.keys(me.icn3d.atoms).length) me.setMode('selection');
};

// update highlight in the menu of defined sets
iCn3DUI.prototype.updateHlMenus = function(commandnameArray) { var me = this;
    if(commandnameArray === undefined) commandnameArray = [];

    var definedAtomsHtml = me.setAtomMenu(commandnameArray);

    if($("#" + me.pre + "atomsCustom").length) {
        $("#" + me.pre + "atomsCustom").html(definedAtomsHtml);
    }
};

iCn3DUI.prototype.setAtomMenu = function (commandnameArray) { var me = this;
  var html = "";

  var nameArray1 = Object.keys(me.icn3d.defNames2Residues);
  var nameArray2 = Object.keys(me.icn3d.defNames2Atoms);

  var nameArray = nameArray1.concat(nameArray2).sort();

  //for(var i in me.icn3d.defNames2Atoms) {
  for(var i = 0, il = nameArray.length; i < il; ++i) {
      var name = nameArray[i];

      if(commandnameArray.indexOf(name) != -1) {
        html += "<option value='" + name + "' selected='selected'>" + name + "</option>";
      }
      else {
        html += "<option value='" + name + "'>" + name + "</option>";
      }
  }

  return html;
};

iCn3DUI.prototype.setPredefinedInMenu = function() { var me = this;
      // predefined sets: all chains
      me.setChainsInMenu();

      // predefined sets: proteins,nucleotides, chemicals
      me.setProtNuclLigInMenu();

      if(me.cfg.align !== undefined && me.bFullUi) {
        me.selectResidueList(me.consHash1, me.conservedName1, me.conservedName1, false, false);
        me.selectResidueList(me.consHash2, me.conservedName2, me.conservedName2, false, false);

        me.selectResidueList(me.nconsHash1, me.nonConservedName1, me.nonConservedName1, false, false);
        me.selectResidueList(me.nconsHash2, me.nonConservedName2, me.nonConservedName2, false, false);

        me.selectResidueList(me.nalignHash1, me.notAlignedName1, me.notAlignedName1, false, false);
        me.selectResidueList(me.nalignHash2, me.notAlignedName2, me.notAlignedName2, false, false);

        // for alignment, show aligned residues, chemicals, and ions
        var dAtoms = {};
        for(var alignChain in me.icn3d.alnChains) {
            dAtoms = me.icn3d.unionHash(dAtoms, me.icn3d.alnChains[alignChain]);
        }

        var residuesHash = {}, chains = {};
        for(var i in dAtoms) {
            var atom = me.icn3d.atoms[i];

            var chainid = atom.structure + '_' + atom.chain;
            var resid = chainid + '_' + atom.resi;
            residuesHash[resid] = 1;
            chains[chainid] = 1;
        }

        var commandname = 'aligned_protein';
        var commanddescr = 'aligned protein and nucleotides';
        var select = "select " + me.residueids2spec(Object.keys(residuesHash));

        //me.addCustomSelection(Object.keys(residuesHash), Object.keys(dAtoms), commandname, commanddescr, select, true);
        me.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
      }
};

iCn3DUI.prototype.hlSeq = function(residueArray) { var me = this;
   // update annotation windows and alignment sequences
   var chainHash = {};
   for(var i = 0, il = residueArray.length; i < il; ++i) {
       var pickedResidue = residueArray[i];
       if($("[id$=" + me.pre + pickedResidue + "]").length !== 0) {
         $("[id$=" + me.pre + pickedResidue + "]").addClass('icn3d-highlightSeq');
       }

       var pos = pickedResidue.lastIndexOf('_');
       var chainid = pickedResidue.substr(0, pos);

       chainHash[chainid] = 1;
   }

   for(var chainid in chainHash) {
       if($("#giseq_summary_" + me.pre + chainid).length !== 0) {
         $("#giseq_summary_" + me.pre + chainid).addClass('icn3d-highlightSeqBox');
       }
   }
};

iCn3DUI.prototype.hlSeqInChain = function(chainid) { var me = this;
   // update annotation windows and alignment sequences
   for(var i = 0, il = me.icn3d.chainsSeq[chainid].length; i < il; ++i) {
       var resi = me.icn3d.chainsSeq[chainid][i].resi;
       var pickedResidue = chainid + '_' + resi;

       //if($("[id$=" + me.pre + pickedResidue + "]").length !== 0) {
       //  $("[id$=" + me.pre + pickedResidue + "]").addClass('icn3d-highlightSeq');
       //}
       // too expensive to highlight all annotations
       if($("#giseq_" + me.pre + pickedResidue).length !== 0) {
         $("#giseq_" + me.pre + pickedResidue).addClass('icn3d-highlightSeq');
       }
   }

   if($("#giseq_summary_" + me.pre + chainid).length !== 0) {
     $("#giseq_summary_" + me.pre + chainid).addClass('icn3d-highlightSeqBox');
   }
};

iCn3DUI.prototype.toggleHighlight = function() { var me = this;
    //me.setLogCmd("toggle highlight", true);

    if(me.icn3d.prevHighlightObjects.length > 0 || me.icn3d.prevHighlightObjects_ghost.length > 0) { // remove
        me.clearHighlight();
    }
    else { // add
        me.showHighlight();
    }

    me.setLogCmd("toggle highlight", true);
};

iCn3DUI.prototype.clearHighlight = function() { var me = this;
    me.icn3d.labels['picking']=[];
    me.icn3d.draw();

    me.icn3d.removeHlObjects();
    me.removeHl2D();
    me.icn3d.render();

    me.removeSeqChainBkgd();
    me.removeSeqResidueBkgd();

    me.bSelectResidue = false;
};

iCn3DUI.prototype.showHighlight = function() { var me = this;
    me.icn3d.addHlObjects();
    me.updateHlAll();
    me.bSelectResidue = true;
};

iCn3DUI.prototype.highlightChains = function(chainArray) { var me = this;
    me.icn3d.removeHlObjects();
    me.removeHl2D();

    me.icn3d.addHlObjects();
    me.updateHl2D(chainArray);

    var residueHash = {};
    for(var c = 0, cl = chainArray.length; c < cl; ++c) {
        var chainid = chainArray[c];
        for(var i in me.icn3d.chainsSeq[chainid]) { // get residue number
            var resObj = me.icn3d.chainsSeq[chainid][i];
            var residueid = chainid + "_" + resObj.resi;

            if(resObj.name !== '' && resObj.name !== '-') {
              residueHash[residueid] = 1;
            }
        }
    }

    me.hlSeq(Object.keys(residueHash));
};

