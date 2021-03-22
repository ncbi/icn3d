/**
* @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
*/

iCn3DUI.prototype.switchHighlightLevel = function() { var me = this, ic = me.icn3d; "use strict";
  $(document).bind('keydown', function (e) { var ic = me.icn3d;
    if(e.keyCode === 38) { // arrow up, select upper level of atoms
      e.preventDefault();
      if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.getFirstAtomObj(ic.pickedAtomList).serial)) {
          ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
          //ic.pk = 2;
      }
      me.switchHighlightLevelUp();
      me.setLogCmd("highlight level up", true);
    }
    else if(e.keyCode === 40) { // arrow down, select down level of atoms
      e.preventDefault();
      if(Object.keys(ic.pickedAtomList).length == 0 || !ic.hAtoms.hasOwnProperty(ic.getFirstAtomObj(ic.pickedAtomList).serial)) {
          ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
          //ic.pk = 2;
      }
      me.switchHighlightLevelDown();
      me.setLogCmd("highlight level down", true);
    }
  });
};

iCn3DUI.prototype.switchHighlightLevelUp = function() { var me = this, ic = me.icn3d; "use strict";
      if(!ic.bShift && !ic.bCtrl) ic.removeHlObjects();
      if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
      }
      if(Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = ic.dAtoms;
      }
      if(ic.highlightlevel === 1) { // atom -> residue
          ic.highlightlevel = 2;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
        }
        else {
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
        }
      }
      else if(ic.highlightlevel === 2) { // residue -> strand
          ic.highlightlevel = 3;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
        }
        else {
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
        }
      }
      else if(ic.highlightlevel === 3) {
          var atomLevel4;
          if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // strand -> domain
              ic.highlightlevel = 4;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              atomLevel4 = ic.select3ddomainFromAtom(firstAtom);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(atomLevel4);
              }
              else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, atomLevel4);
              }
          }
          if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // strand -> chain
              ic.highlightlevel = 5;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
              else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
              }
          }
      }
      else if(ic.highlightlevel === 4) { // domain -> chain
          ic.highlightlevel = 5;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
          }
          else {
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
          }
      }
      else if(ic.highlightlevel === 5 || ic.highlightlevel === 6) { // chain -> structure
          ic.highlightlevel = 6;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) ic.hAtoms = {};
          var chainArray = ic.structures[firstAtom.structure];
          for(var i = 0, il = chainArray.length; i < il; ++i) {
              ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[chainArray[i]]);
        }
      }
      ic.addHlObjects();
      me.updateHlAll();
};
iCn3DUI.prototype.switchHighlightLevelDown = function() { var me = this, ic = me.icn3d; "use strict";
      ic.removeHlObjects();
      if(ic.pickedAtomList === undefined || Object.keys(ic.pickedAtomList).length === 0) {
          ic.pickedAtomList = ic.cloneHash(ic.hAtoms);
      }
      if( (ic.highlightlevel === 2 || ic.highlightlevel === 1) && Object.keys(ic.pickedAtomList).length === 1) { // residue -> atom
          ic.highlightlevel = 1;
          ic.hAtoms = ic.cloneHash(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.pickedAtomList);
        }
        else {
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.pickedAtomList);
        }
      }
      else if(ic.highlightlevel === 3) { // strand -> residue
        var residueHash = {};
        for(var i in ic.pickedAtomList) {
            residueid = ic.atoms[i].structure + '_' + ic.atoms[i].chain + '_' + ic.atoms[i].resi;
            residueHash[residueid] = 1;
        }
        if(Object.keys(residueHash).length === 1) {
            ic.highlightlevel = 2;
            var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
            if(!ic.bShift && !ic.bCtrl) {
                ic.hAtoms = ic.cloneHash(ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
            else {
                ic.hAtoms = ic.unionHash(ic.hAtoms, ic.residues[firstAtom.structure + '_' + firstAtom.chain + '_' + firstAtom.resi]);
            }
        }
      }
      else if(ic.highlightlevel === 4) { // domain -> strand
          ic.highlightlevel = 3;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
          }
          else {
              ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
          }
      }
      else if(ic.highlightlevel === 5) {
          var atomLevel4;
          if(me.cfg.mmdbid !== undefined || me.cfg.gi !== undefined) { // chain -> domain
              ic.highlightlevel = 4;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              atomLevel4 = ic.select3ddomainFromAtom(firstAtom);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(atomLevel4);
              }
              else {
                  ic.hAtoms = ic.unionHash(ic.hAtoms, atomLevel4);
              }
          }
          if( (me.cfg.mmdbid === undefined && me.cfg.gi === undefined) || Object.keys(atomLevel4).length == 0) { // chain -> strand
              ic.highlightlevel = 3;
              var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
              if(!ic.bShift && !ic.bCtrl) {
                  ic.hAtoms = ic.cloneHash(ic.selectStrandHelixFromAtom(firstAtom));
              }
              else {
                  ic.hAtoms = ic.unionHash(ic.hAtoms, ic.selectStrandHelixFromAtom(firstAtom));
              }
          }
      }
      else if(ic.highlightlevel === 6) { // structure -> chain
          ic.highlightlevel = 5;
          var firstAtom = ic.getFirstAtomObj(ic.pickedAtomList);
          if(!ic.bShift && !ic.bCtrl) {
              ic.hAtoms = ic.cloneHash(ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
        }
        else {
            ic.hAtoms = ic.unionHash(ic.hAtoms, ic.chains[firstAtom.structure + '_' + firstAtom.chain]);
        }
      }
      ic.addHlObjects();
      me.updateHlAll();
};
