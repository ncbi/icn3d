/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Html} from '../../html/html.js';

import {Diagram2d} from '../analysis/diagram2d.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {Draw} from '../display/draw.js';

class HlUpdate {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //The 2D diagram only shows the currently displayed chains when users click the option "View Only Selection".
    //This method is called to dynamically update the content of the 2D interaction diagram.
    update2DdgmContent() { var ic = this.icn3d, me = ic.icn3dui;
       // update 2D diagram to show just the displayed parts
       var html2ddgm = '';
       if(ic.icn3dui.cfg.mmdbid !== undefined || ic.icn3dui.cfg.gi !== undefined) {
          html2ddgm += ic.diagram2dCls.draw2Ddgm(ic.interactionData, ic.inputid, undefined, true);
          html2ddgm += ic.diagram2dCls.set2DdgmNote();

          $("#" + ic.pre + "dl_2ddgm").html(html2ddgm);
       }
       else if(ic.mmdbidArray &&(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined || ic.bRealign)) {
          html2ddgm += ic.diagram2dCls.draw2Ddgm(ic.interactionData1, ic.mmdbidArray[0].toUpperCase(), 0, true);
          if(ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t) {
              html2ddgm += ic.diagram2dCls.draw2Ddgm(ic.interactionData2, ic.mmdbidArray[0].toUpperCase(), 1, true);
          }
          else {
              html2ddgm += ic.diagram2dCls.draw2Ddgm(ic.interactionData2, ic.mmdbidArray[1].toUpperCase(), 1, true);
          }
          html2ddgm += ic.diagram2dCls.set2DdgmNote(true);

          $("#" + ic.pre + "dl_2ddgm").html(html2ddgm);
       }
    }

    //Change the residue color in the annotation window for the residues in the array "residueArray".
    changeSeqColor(residueArray) { var ic = this.icn3d, me = ic.icn3dui;
       for(var i = 0, il = residueArray.length; i < il; ++i) {
           var pickedResidue = residueArray[i];
           //[id$= is expensive
           //if($("[id$=" + ic.pre + pickedResidue + "]").length !== 0) {
             var atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[pickedResidue]);
             var colorStr =(atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
             var color =(atom.color !== undefined) ? colorStr : "CCCCCC";
             // annotations will have their own color, only the chain will have the changed color
             $("[id=giseq_" + ic.pre + pickedResidue + "]").attr('style', 'color:#' + color);
             $("[id=align_" + ic.pre + pickedResidue + "]").attr('style', 'color:#' + color);
             if(ic.icn3dui.cfg.align !== undefined || ic.icn3dui.cfg.chainalign !== undefined || ic.bRealign || ic.bSymd) $("[id=align_" + ic.pre + pickedResidue + "]").attr('style', 'color:#' + color);
           //}
       }
    }

    //Remove the highlight in 3D structure, 2D interaction, 1D sequence, and the menu of defined sets.
    removeHlAll() { var ic = this.icn3d, me = ic.icn3dui;
           this.removeHlObjects();
           this.removeHlSeq();
           this.removeHl2D();
           this.removeHlMenus();
    }

    //Remove the highlight in the 3D structure display.
    removeHlObjects() { var ic = this.icn3d, me = ic.icn3dui;
           ic.hlObjectsCls.removeHlObjects();
    }

    //Remove the highlight in the sequence display of the annotation window.
    removeHlSeq() { var ic = this.icn3d, me = ic.icn3dui;
    //       this.removeSeqChainBkgd();
           this.removeSeqResidueBkgd();
    }

    //Remove the highlight in the 2D interaction diagram.
    removeHl2D() { var ic = this.icn3d, me = ic.icn3dui;
          // clear nodes in 2d dgm
          $("#" + ic.pre + "dl_2ddgm rect").attr('stroke', '#000000');
          $("#" + ic.pre + "dl_2ddgm circle").attr('stroke', '#000000');
          $("#" + ic.pre + "dl_2ddgm polygon").attr('stroke', '#000000');

          $("#" + ic.pre + "dl_2ddgm svg line").attr('stroke', '#000000');

          $("#" + ic.pre + "dl_2ddgm rect").attr('stroke-width', 1);
          $("#" + ic.pre + "dl_2ddgm circle").attr('stroke-width', 1);
          $("#" + ic.pre + "dl_2ddgm polygon").attr('stroke-width', 1);

          $("#" + ic.pre + "dl_2ddgm line").attr('stroke-width', 1);
    }

    //Remove the selection in the menu of defined sets.
    removeHlMenus() { var ic = this.icn3d, me = ic.icn3dui;
        $("#" + ic.pre + "atomsCustom").val("");
        $("#" + ic.pre + "atomsCustom")[0].blur();
    }

    updateHlAll(commandnameArray, bSetMenu, bUnion, bForceHighlight) { var ic = this.icn3d, me = ic.icn3dui;
           // update the previously highlisghted atoms for switching between all and selection
           ic.prevHighlightAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

           this.updateHlObjects(bForceHighlight);

           if(commandnameArray !== undefined) {
               this.updateHlSeqInChain(commandnameArray, bUnion);
           }
           else {
               this.updateHlSeq(undefined, undefined, bUnion);
           }

           this.updateHl2D();
           if(bSetMenu === undefined || bSetMenu) this.updateHlMenus(commandnameArray);

           //ic.annotationCls.showAnnoSelectedChains();
    }

    //Update the highlight of 3D structure display according to the current highlighted atoms.
    updateHlObjects(bForceHighlight) { var ic = this.icn3d, me = ic.icn3dui;
           ic.hlObjectsCls.removeHlObjects();

           if((ic.hAtoms && Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) || bForceHighlight) {
              ic.hlObjectsCls.addHlObjects();
              ic.definedSetsCls.setMode('selection');
           }
    }

    // update highlight in sequence, slow if sequence is long
    //Update the highlight of sequences in the annotation window according to the current highlighted atoms.
    updateHlSeq(bShowHighlight, residueHash, bUnion) { var ic = this.icn3d, me = ic.icn3dui;
           if(bUnion === undefined || !bUnion) {
               this.removeHlSeq();
           }

           if(residueHash === undefined) residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(ic.hAtoms);

           if(ic.hAtoms && Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) this.hlSequence(Object.keys(residueHash));
           this.changeSeqColor(Object.keys(residueHash));
    }

    updateHlSeqInChain(commandnameArray, bUnion) { var ic = this.icn3d, me = ic.icn3dui;
           if(bUnion === undefined || !bUnion) {
               this.removeHlSeq();
           }
           //if(residueHash === undefined) residueHash = ic.firstAtomObjCls.getResiduesFromCalphaAtoms(ic.hAtoms);

           if(ic.hAtoms && Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length) return;

           //this.hlSequence(Object.keys(residueHash));
           // speed up with chain highlight
           for(var i = 0, il = commandnameArray.length; i < il; ++i) {
               var commandname = commandnameArray[i];
               if(Object.keys(ic.chains).indexOf(commandname) !== -1) {
                   this.hlSeqInChain(commandname);
               }
               else {
                   var residueArray = [];

                   if(ic.defNames2Residues[commandname] !== undefined && ic.defNames2Residues[commandname].length > 0) {
                       residueArray = ic.defNames2Residues[commandname];
                   }

                   var residueHash = {}
                   if(ic.defNames2Atoms[commandname] !== undefined && ic.defNames2Atoms[commandname].length > 0) {
                       for(var j = 0, jl = ic.defNames2Atoms[commandname].length; j < jl; ++j) {
                           var serial = ic.defNames2Atoms[commandname][j];
                           var atom = ic.atoms[serial];
                           var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                           residueHash[resid] = 1;
                       }

                       residueArray = residueArray.concat(Object.keys(residueHash));
                   }

                   this.hlSequence(residueArray);
               }
           }

           //this.changeSeqColor(Object.keys(residueHash));
    }

    // update highlight in 2D window
    //Update the highlight of 2D interaction diagram according to the current highlighted atoms.
    updateHl2D(chainArray2d) { var ic = this.icn3d, me = ic.icn3dui;
      this.removeHl2D();

      if(ic.hAtoms && Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length) return;

      if(chainArray2d === undefined) {
          var chainHash = ic.firstAtomObjCls.getChainsFromAtoms(ic.hAtoms);
          chainArray2d = Object.keys(chainHash);
      }

      if(chainArray2d !== undefined) {
          for(var i = 0, il = chainArray2d.length; i < il; ++i) {
              var hlatoms = me.hashUtilsCls.intHash(ic.chains[chainArray2d[i]], ic.hAtoms);
              var ratio = 1.0 * Object.keys(hlatoms).length / Object.keys(ic.chains[chainArray2d[i]]).length;

              var firstAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(hlatoms);
              if(ic.alnChains[chainArray2d[i]] !== undefined) {
                    var alignedAtoms = me.hashUtilsCls.intHash(ic.alnChains[chainArray2d[i]], hlatoms);
                    if(Object.keys(alignedAtoms).length > 0) firstAtom = ic.firstAtomObjCls.getFirstCalphaAtomObj(alignedAtoms);
                }
              var color =(firstAtom !== undefined && firstAtom.color !== undefined) ? '#' + firstAtom.color.getHexString() : '#FFFFFF';

              var target = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-hlnode']");
              var base = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] rect[class='icn3d-basenode']");
              if(target !== undefined) {
                  ic.diagram2dCls.highlightNode('rect', target, base, ratio);
                  $(target).attr('fill', color);
              }

              target = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-hlnode']");
              base = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] circle[class='icn3d-basenode']");
              if(target !== undefined) {
                    ic.diagram2dCls.highlightNode('circle', target, base, ratio);
                    $(target).attr('fill', color);
              }

              target = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-hlnode']");
              base = $("#" + ic.pre + "dl_2ddgm g[chainid=" + chainArray2d[i] + "] polygon[class='icn3d-basenode']");

              if(target !== undefined) {
                  ic.diagram2dCls.highlightNode('polygon', target, base, ratio);
                  $(target).attr('fill', color);
              }
          }
      }

      if(ic.lineArray2d !== undefined) {
          for(var i = 0, il = ic.lineArray2d.length; i < il; i += 2) {
              $("#" + ic.pre + "dl_2ddgm g[chainid1=" + ic.lineArray2d[i] + "][chainid2=" + ic.lineArray2d[i + 1] + "] line").attr('stroke', ic.icn3dui.htmlCls.ORANGE);
          }
      }

      // update the previously highlisghted atoms for switching between all and selection
      ic.prevHighlightAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

      ic.definedSetsCls.setMode('selection');
    }

    // update highlight in the menu of defined sets
    //Update the selection in the menu of defined sets according to the current highlighted atoms.
    updateHlMenus(commandnameArray) { var ic = this.icn3d, me = ic.icn3dui;
        if(commandnameArray === undefined) commandnameArray = [];

        var definedAtomsHtml = ic.definedSetsCls.setAtomMenu(commandnameArray);

        if($("#" + ic.pre + "atomsCustom").length) {
            $("#" + ic.pre + "atomsCustom").html(definedAtomsHtml);
            $("#" + ic.pre + "atomsCustom")[0].blur();
        }
    }

    hlSequence(residueArray) { var ic = this.icn3d, me = ic.icn3dui;
       // update annotation windows and alignment sequences
       var chainHash = {}
       for(var i = 0, il = residueArray.length; i < il; ++i) {
           var pickedResidue = residueArray[i];
           //[id$= is expensive to search id ending with
           //var resElem = $("[id$=" + ic.pre + pickedResidue + "]");
           var resElem = $("[id=giseq_" + ic.pre + pickedResidue + "]");
           if(resElem.length !== 0) {
             resElem.addClass('icn3d-highlightSeq');
           }

           resElem = $("[id=align_" + ic.pre + pickedResidue + "]");
           if(resElem.length !== 0) {
             resElem.addClass('icn3d-highlightSeq');
           }

           var pos = pickedResidue.lastIndexOf('_');
           var chainid = pickedResidue.substr(0, pos);

           chainHash[chainid] = 1;
       }

       for(var chainid in chainHash) {
           if($("#giseq_summary_" + ic.pre + chainid).length !== 0) {
             $("#giseq_summary_" + ic.pre + chainid).addClass('icn3d-highlightSeqBox');
           }
       }
    }

    hlSeqInChain(chainid) { var ic = this.icn3d, me = ic.icn3dui;
       // update annotation windows and alignment sequences
       for(var i = 0, il = ic.chainsSeq[chainid].length; i < il; ++i) {
           var resi = ic.chainsSeq[chainid][i].resi;
           var pickedResidue = chainid + '_' + resi;

           //if($("[id$=" + ic.pre + pickedResidue + "]").length !== 0) {
           //  $("[id$=" + ic.pre + pickedResidue + "]").addClass('icn3d-highlightSeq');
           //}
           // too expensive to highlight all annotations
           if($("#giseq_" + ic.pre + pickedResidue).length !== 0) {
             $("#giseq_" + ic.pre + pickedResidue).addClass('icn3d-highlightSeq');
           }
           if($("#align_" + ic.pre + pickedResidue).length !== 0) {
             $("#align_" + ic.pre + pickedResidue).addClass('icn3d-highlightSeq');
           }
       }

       if($("#giseq_summary_" + ic.pre + chainid).length !== 0) {
         $("#giseq_summary_" + ic.pre + chainid).addClass('icn3d-highlightSeqBox');
       }
    }

    toggleHighlight() { var ic = this.icn3d, me = ic.icn3dui;
        //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("toggle highlight", true);

        //if(ic.prevHighlightObjects.length > 0 || ic.prevHighlightObjects_ghost.length > 0) { // remove
        if(ic.bShowHighlight) { // remove
            this.clearHighlight();
            ic.bShowHighlight = false;
        }
        else { // add
            this.showHighlight();
            ic.bShowHighlight = true;
        }

        //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("toggle highlight", true);
    }

    clearHighlight() { var ic = this.icn3d, me = ic.icn3dui;
        ic.labels['picking']=[];
        ic.drawCls.draw();

        ic.hlObjectsCls.removeHlObjects();
        this.removeHl2D();
        if(ic.bRender) ic.drawCls.render();

        this.removeSeqChainBkgd();
        this.removeSeqResidueBkgd();

        ic.bSelectResidue = false;
    }

    showHighlight() { var ic = this.icn3d, me = ic.icn3dui;
        ic.hlObjectsCls.addHlObjects();
        this.updateHlAll();
        //ic.bSelectResidue = true;
    }

    highlightChains(chainArray) { var ic = this.icn3d, me = ic.icn3dui;
        ic.hlObjectsCls.removeHlObjects();
        this.removeHl2D();

        ic.hlObjectsCls.addHlObjects();
        this.updateHl2D(chainArray);

        var residueHash = {}
        for(var c = 0, cl = chainArray.length; c < cl; ++c) {
            var chainid = chainArray[c];
            for(var i in ic.chainsSeq[chainid]) { // get residue number
                var resObj = ic.chainsSeq[chainid][i];
                var residueid = chainid + "_" + resObj.resi;

                if(resObj.name !== '' && resObj.name !== '-') {
                  residueHash[residueid] = 1;
                }
            }
        }

        this.hlSequence(Object.keys(residueHash));
    }

    hlSummaryDomain3ddomain(that) { var ic = this.icn3d, me = ic.icn3dui;
      if($(that).attr('domain') !== undefined) { // domain
        var index = $(that).attr('index');
        var chainid = $(that).attr('chain');

        if($("[id^=" + chainid + "_domain_" + index + "]").length !== 0) {
            $("[id^=" + chainid + "_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
        }
      }

      if($(that).attr('3ddomain') !== undefined) { // 3d domain
        var index = $(that).attr('index');
        var chainid = $(that).attr('chain');

        if($("[id^=" + chainid + "_3d_domain_" + index + "]").length !== 0) {
            $("[id^=" + chainid + "_3d_domain_" + index + "]").addClass('icn3d-highlightSeqBox');
        }
      }
    }

    //Remove the background of the highlighted chain in the sequence dialog.
    removeSeqChainBkgd(currChain) {
      if(currChain === undefined) {
        $( ".icn3d-seqTitle" ).each(function( index ) {
          $( this ).removeClass('icn3d-highlightSeq');
          $( this ).removeClass('icn3d-highlightSeqBox');
        });
      }
      else {
        $( ".icn3d-seqTitle" ).each(function( index ) {
          if($(this).attr('chain') !== currChain) {
              $( this ).removeClass('icn3d-highlightSeq');
              $( this ).removeClass('icn3d-highlightSeqBox');
          }
        });
      }
    }

    //Remove the background of the highlighted residues in the sequence dialog.
    removeSeqResidueBkgd() {
        $( ".icn3d-residue" ).each(function( index ) {
          $( this ).removeClass('icn3d-highlightSeq');
        });
    }

    //Update the highlight of 3D structure, 2D interaction, sequences, and the menu of defined sets
    //according to the current highlighted atoms.
    updateHlAll(commandnameArray, bSetMenu, bUnion, bForceHighlight) { var ic = this.icn3d, me = ic.icn3dui;
       // update the previously highlisghted atoms for switching between all and selection
       ic.prevHighlightAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);

       this.updateHlObjects(bForceHighlight);

       if(commandnameArray !== undefined) {
           this.updateHlSeqInChain(commandnameArray, bUnion);
       }
       else {
           this.updateHlSeq(undefined, undefined, bUnion);
       }

       this.updateHl2D();
       if(bSetMenu === undefined || bSetMenu) this.updateHlMenus(commandnameArray);

       //ic.annotationCls.showAnnoSelectedChains();
    }
}

export {HlUpdate}
