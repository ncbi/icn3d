/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {Resid2spec} from '../selection/resid2spec.js';
import {ShowInter} from '../interaction/showInter.js';
import {SaveFile} from '../export/saveFile.js';
import {ParserUtils} from '../parsers/parserUtils.js';
import {SetColor} from '../display/setColor.js';
import {SetOption} from '../display/setOption.js';
import {Transform} from '../transform/transform.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Draw} from '../display/draw.js';

class Scap {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyCommandScapBase(command) { let ic = this.icn3d, me = ic.icn3dui;
        let snp = command.substr(command.lastIndexOf(' ') + 1);

        if(command.indexOf('scap 3d') == 0) {
            this.retrieveScap(snp);
        }
        else if(command.indexOf('scap interaction') == 0) {
            this.retrieveScap(snp, true);
        }
        else if(command.indexOf('scap pdb') == 0) {
            this.retrieveScap(snp, undefined, true);
        }
    }

    applyCommandScap(command) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
      ic.deferredScap = $.Deferred(function() {
         thisClass.applyCommandScapBase(command);
      }); // end of ic.icn3dui.deferred = $.Deferred(function() {

      return ic.deferredScap.promise();
    }

    adjust2DWidth(id) { let ic = this.icn3d, me = ic.icn3dui;
        let halfWidth = 125;
        id = ic.pre + id;

        let height =($("#" + ic.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? $("#" + ic.pre + 'dl_selectannotations').dialog( "option", "height") : ic.icn3dui.htmlCls.HEIGHT;
        let width =($("#" + ic.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? halfWidth * 2 : ic.icn3dui.htmlCls.WIDTH * 0.5;

        $("#" + id).dialog( "option", "width", width );
        $("#" + id).dialog( "option", "height", height);
        let position = { my: "left-" + halfWidth + " top+" + ic.icn3dui.htmlCls.MENU_HEIGHT, at: "right top", of: "#" + ic.pre + "viewer", collision: "none" }

         $("#" + id).dialog( "option", "position", position );
    }

    retrieveScap(snp, bInteraction, bPdb) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //snp: 6M0J_E_484_K,6M0J_E_501_Y,6M0J_E_417_N
        let snpStr = '';
        let snpArray = snp.split(','); //stru_chain_resi_snp
        let atomHash = {}, residArray = [];
        for(let i = 0, il = snpArray.length; i < il; ++i) {
            let idArray = snpArray[i].split('_'); //stru_chain_resi_snp

            let resid = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
            atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[resid]);
            residArray.push(resid);

            snpStr += idArray[1] + '_' + idArray[2] + '_' + idArray[3];
            if(i != il -1) snpStr += ',';
        }

        let selectSpec = ic.resid2specCls.residueids2spec(residArray);
        let select = "select " + selectSpec;

        let bGetPairs = false;
        let radius = 10; //4;
        // find neighboring residues
        let result = ic.showInterCls.pickCustomSphere_base(radius, atomHash, ic.atoms, false, false, undefined, select, bGetPairs);


        residArray = Object.keys(result.residues);
        ic.hAtoms = {}
        for(let index = 0, indexl = residArray.length; index < indexl; ++index) {
          let residueid = residArray[index];
          for(let i in ic.residues[residueid]) {
            ic.hAtoms[i] = 1;
          }
        }

    //    ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomHash);
        ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, ic.chemicals);

        // the displayed atoms are for each SNP only
        //var atomHash = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

        let pdbStr = ic.saveFileCls.getPDBHeader() + ic.saveFileCls.getAtomPDB(ic.hAtoms);

        let url = "https://www.ncbi.nlm.nih.gov/Structure/scap/scap.cgi";

        let pdbid = Object.keys(ic.structures)[0]; //Object.keys(ic.structures).toString();
        let dataObj = {'pdb': pdbStr, 'snp': snpStr, 'pdbid': pdbid, 'v': '2'}

        $.ajax({
          url: url,
          type: 'POST',
          data : dataObj,
          dataType: "text",
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
              let pos = data.indexOf('\n');
              let energy = data.substr(0, pos);
              let pdbData = data.substr(pos + 1);
    console.log("free energy: " + energy + " kcal/mol");

              let bAddition = true;
              let hAtom1 = me.hashUtilsCls.cloneHash(ic.hAtoms);

              ic.hAtoms = {}
              ic.loadPDBCls.loadPDB(pdbData, pdbid, false, false, bAddition);
              let hAtom2 = me.hashUtilsCls.cloneHash(ic.hAtoms);

              ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, hAtom1);
              ic.dAtoms = ic.hAtoms;

              ic.transformCls.zoominSelection();
              ic.setOptionCls.setStyle('proteins', 'stick');

              ic.opts['color'] = 'chain';
              ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);

              for(let serial in hAtom2) {
                  let atom = ic.atoms[serial];
                  if(!atom.het) {
                      //ic.atoms[serial].color = me.parasCls.thr(0xA52A2A); // brown
                      //ic.atomPrevColors[serial] = me.parasCls.thr(0xA52A2A); // brown
                      // use the same color as the wild type
                      let resid = atom.structure.substr(0, 4) + '_' + atom.chain + '_' + atom.resi;
                      let atomWT = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);
                      ic.atoms[serial].color = atomWT.color;
                      ic.atomPrevColors[serial] = atomWT.color;
                  }
              }

              if(bPdb) {
                 let pdbStr = '';
                 pdbStr += ic.saveFileCls.getPDBHeader();
                 //pdbStr += ic.saveFileCls.getAtomPDB(ic.hAtoms, undefined, true);
                 pdbStr += ic.saveFileCls.getAtomPDB(ic.hAtoms);

                 let file_pref =(ic.inputid) ? ic.inputid : "custom";
                 ic.saveFileCls.saveFile(file_pref + '_' + snpStr + '.pdb', 'text', [pdbStr]);

                 ic.drawCls.draw();
              }
              else {
                  //var select = '.' + idArray[1] + ':' + idArray[2];
                  //var name = 'snp_' + idArray[1] + '_' + idArray[2];
                  let select = selectSpec;

                  let name = 'snp_' + snpStr;
                  ic.selByCommCls.selectByCommand(select, name, name);
                  ic.opts['color'] = 'atom';
                  ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

                  ic.viewInterPairsCls.clearInteractions();

                  if(bInteraction) {
                    //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("select " + select + " | name " + name, true);

                    let type = 'linegraph';
                    ic.viewInterPairsCls.viewInteractionPairs(['selected'], ['non-selected'], false, type, true, true, true, true, true, true);
                    //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);

                    thisClass.adjust2DWidth('dl_linegraph');
                  }

                  ic.hAtoms = ic.dAtoms;
                  //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("select displayed set", true);

                  ic.drawCls.draw();

                  if(!ic.alertAlt) {
                    ic.alertAlt = true;

                    if(ic.bRender) alert('Please press the letter "a" to alternate between wild type and mutant.');
                  }
              }

              $("#" + ic.pre + "mn2_alternateWrap").show();
              // expand the toolbar
              let id = ic.pre + 'selection';
              $("#" + id).show();
              //$("#" + id + "_expand").hide();
              //$("#" + id + "_shrink").show();

              if(ic.deferredScap !== undefined) ic.deferredScap.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
            }
            alert("There are some problems in predicting the side chain of the mutant...");

            ic.ParserUtilsCls.hideLoading();

            if(ic.deferredScap !== undefined) ic.deferredScap.resolve();
            return;
          }
        });
    }
}

export {Scap}
