/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {HlUpdate} from '../highlight/hlUpdate.js';
import {HlObjects} from '../highlight/hlObjects.js';
import {FirstAtomObj} from '../selection/firstAtomObj.js';

class Picking {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Define actions when an atom is picked. By default, the atom information
    //($[structure id].[chain id]:[residue number]@[atom name]) is displayed.
    showPicking(atom, x, y) { let  ic = this.icn3d, me = ic.icn3dui;
      //me = ic.setIcn3dui(ic.id);
      if(ic.icn3dui.cfg.cid !== undefined && ic.pk != 0) {
          ic.pk = 1; // atom
      }
      else {
          // do not change the picking option
      }
      ic.highlightlevel = ic.pk;
      this.showPickingBase(atom, x, y);

      if(ic.pk != 0) {
          if(x !== undefined && y !== undefined) { // mouse over
            if(ic.icn3dui.cfg.showmenu != undefined && ic.icn3dui.cfg.showmenu == true) {
                y += ic.icn3dui.htmlCls.MENU_HEIGHT;
            }
            let  text =(ic.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            if(ic.structures !== undefined && Object.keys(ic.structures).length > 1) {
                text = atom.structure + '_' + atom.chain + ' ' + text;
                $("#" + ic.pre + "popup").css("width", "140px");
            }
            else {
                $("#" + ic.pre + "popup").css("width", "80px");
            }
            $("#" + ic.pre + "popup").html(text);
            $("#" + ic.pre + "popup").css("top", y).css("left", x+20).show();
          }
          else {
              // highlight the sequence background
              ic.hlUpdateCls.updateHlAll();
              let  transformation = {}
              transformation.factor = ic._zoomFactor;
              transformation.mouseChange = ic.mouseChange;
              //transformation.quaternion = ic.quaternion;
              transformation.quaternion = {}
              transformation.quaternion._x = parseFloat(ic.quaternion._x).toPrecision(5);
              transformation.quaternion._y = parseFloat(ic.quaternion._y).toPrecision(5);
              transformation.quaternion._z = parseFloat(ic.quaternion._z).toPrecision(5);
              transformation.quaternion._w = parseFloat(ic.quaternion._w).toPrecision(5);
              if(ic.bAddCommands) {
                  ic.commands.push('pickatom ' + atom.serial + '|||' + ic.transformCls.getTransformationStr(transformation));
                  ic.optsHistory.push(me.hashUtilsCls.cloneHash(ic.opts));
                  ic.optsHistory[ic.optsHistory.length - 1].hlatomcount = Object.keys(ic.hAtoms).length;
                  if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.saveCommandsToSession();
                  ic.STATENUMBER = ic.commands.length;
              }
              ic.logs.push('pickatom ' + atom.serial + '(chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
              if( $( "#" + ic.pre + "logtext" ).length )  {
                $("#" + ic.pre + "logtext").val("> " + ic.logs.join("\n> ") + "\n> ").scrollTop($("#" + ic.pre + "logtext")[0].scrollHeight);
              }
              // update the interaction flag
              ic.bSphereCalc = false;
              //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set calculate sphere false', true);
              ic.bHbondCalc = false;
              //ic.icn3dui.htmlCls.clickMenuCls.setLogCmd('set calculate hbond false', true);
          }
      }
    }

    showPickingBase(atom, x, y) { let  ic = this.icn3d, me = ic.icn3dui;
      if(x === undefined && y === undefined) { // NOT mouse over
          this.showPickingHilight(atom); // including render step
      }
    }

    showPickingHilight(atom) {  let  ic = this.icn3d, me = ic.icn3dui;
      if(!ic.bShift && !ic.bCtrl) ic.hlObjectsCls.removeHlObjects();

      ic.pickedAtomList = {}
      if(ic.pk === 1) {
        ic.pickedAtomList[atom.serial] = 1;
      }
      else if(ic.pk === 2) {
        let  residueid = atom.structure + '_' + atom.chain + '_' + atom.resi;
        ic.pickedAtomList = ic.residues[residueid];
      }
      else if(ic.pk === 3) {
        ic.pickedAtomList = this.selectStrandHelixFromAtom(atom);
      }
      else if(ic.pk === 4) {
        ic.pickedAtomList = this.select3ddomainFromAtom(atom);
      }
      else if(ic.pk === 5) {
        let  chainid = atom.structure + '_' + atom.chain;
        ic.pickedAtomList = ic.chains[chainid];
      }

      if(ic.pk === 0) {
          ic.bShowHighlight = false;
      }
      else {
          ic.bShowHighlight = true;
      }

      let  intersectAtoms = (Object.keys(ic.hAtoms).length == Object.keys(ic.atoms).length) ? {} : me.hashUtilsCls.intHash(ic.hAtoms, ic.pickedAtomList);
      let  intersectAtomsSize = Object.keys(intersectAtoms).length;

      if(!ic.bShift && !ic.bCtrl) {
          //if(intersectAtomsSize > 0) {
          //    ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, ic.pickedAtomList);
          //}
          //else {
          //    ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickedAtomList);
          //}
          ic.hAtoms = me.hashUtilsCls.cloneHash(ic.pickedAtomList);
      }
      else if(ic.bShift) { // select a range

        if(ic.prevPickedAtomList === undefined) {
            ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickedAtomList);
        }
        else {
            let  prevAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.prevPickedAtomList);
            let  currAtom = ic.firstAtomObjCls.getFirstAtomObj(ic.pickedAtomList);

            let  prevChainid = prevAtom.structure + '_' + prevAtom.chain;
            let  currChainid = currAtom.structure + '_' + currAtom.chain;

            if(prevChainid != currChainid) {
                ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickedAtomList);
            }
            else { // range in the same chain only
                let  combinedAtomList;
                combinedAtomList = me.hashUtilsCls.unionHash(combinedAtomList, ic.prevPickedAtomList);
                combinedAtomList = me.hashUtilsCls.unionHash(combinedAtomList, ic.pickedAtomList);

                let  firstAtom = ic.firstAtomObjCls.getFirstAtomObj(combinedAtomList);
                let  lastAtom = ic.firstAtomObjCls.getLastAtomObj(combinedAtomList);

                for(let i = firstAtom.serial; i <= lastAtom.serial; ++i) {
                    ic.hAtoms[i] = 1;
                }
            }
        }

        // remember this shift selection
        ic.prevPickedAtomList = me.hashUtilsCls.cloneHash(ic.pickedAtomList);
      }
      else if(ic.bCtrl) {
          if(intersectAtomsSize > 0) {
              ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, ic.pickedAtomList);
          }
          else {
              ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.pickedAtomList);
          }
      }

      ic.hlObjectsCls.removeHlObjects();
      ic.hlObjectsCls.addHlObjects();
    }

    select3ddomainFromAtom(atom) { let  ic = this.icn3d, me = ic.icn3dui;
        let  chainid = atom.structure + '_' + atom.chain;
        let  resid = chainid + '_' + atom.resi;

        let  domainid;
        for(let id in ic.tddomains) { // 3GVU_A_3d_domain_1
            let  pos = id.indexOf('_3d_domain');
            if(id.substr(0, pos) == chainid) {
                if(Object.keys(ic.tddomains[id]).indexOf(resid) !== -1) {
                    domainid = id;
                    break;
                }
            }
        }

        let  atomList = {}
        for(let resid in ic.tddomains[domainid]) {
            atomList = me.hashUtilsCls.unionHash(atomList, ic.residues[resid]);
        }

        return atomList;
    }

    //For an "atom", select all atoms in the same strand, helix, or coil.
    selectStrandHelixFromAtom(atom) { let  ic = this.icn3d, me = ic.icn3dui;
        let  firstAtom = atom;
        let  lastAtom = atom;

        let  atomsHash = {}

        // fill the beginning
        let  beginResi = firstAtom.resi;
        if(!firstAtom.ssbegin && !isNaN(firstAtom.resi)) {
            for(let i = firstAtom.resi - 1; i > 0; --i) {
                let  residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                if(!ic.residues.hasOwnProperty(residueid)) break;

                let  atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
                beginResi = atom.resi;

                if( (firstAtom.ss !== 'coil' && atom.ss === firstAtom.ss && atom.ssbegin)
                  || (firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) ) {
                    if(firstAtom.ss === 'coil' && atom.ss !== firstAtom.ss) {
                        beginResi = parseInt(atom.resi) + 1;
                    }
                    break;
                }
            }

            for(let i = beginResi; i <= firstAtom.resi; ++i) {
                let  residueid = firstAtom.structure + '_' + firstAtom.chain + '_' + i;
                atomsHash = me.hashUtilsCls.unionHash(atomsHash, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
            }
        }

        // fill the end
        let  endResi = lastAtom.resi;
        let  endChainResi = ic.firstAtomObjCls.getLastAtomObj(ic.chains[lastAtom.structure + '_' + lastAtom.chain]).resi;
        for(let i = parseInt(lastAtom.resi) + 1; i <= parseInt(endChainResi); ++i) {
            let  residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
            if(!ic.residues.hasOwnProperty(residueid)) break;

            let  atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residueid]);
            endResi = atom.resi;

            if( (lastAtom.ss !== 'coil' && atom.ss === lastAtom.ss && atom.ssend) || (lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss) ) {
                if(lastAtom.ss === 'coil' && atom.ss !== lastAtom.ss && !isNaN(atom.resi)) {
                    endResi = atom.resi - 1;
                }
                break;
            }
        }

        for(let i = parseInt(lastAtom.resi) + 1; i <= parseInt(endResi); ++i) {
            let  residueid = lastAtom.structure + '_' + lastAtom.chain + '_' + i;
            atomsHash = me.hashUtilsCls.unionHash(atomsHash, me.hashUtilsCls.hash2Atoms(ic.residues[residueid], ic.atoms));
        }

        return atomsHash;
    }
}

export {Picking}
