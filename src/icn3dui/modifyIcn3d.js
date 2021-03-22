/**
* @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
*/

iCn3DUI.prototype.modifyIcn3d = function() { var  me = this; "use strict";
    me.modifyIcn3dshowPicking();
    me.modifyAlternateWrapper();
};

iCn3DUI.prototype.modifyAlternateWrapper = function() { var me = this; "use strict";
   iCn3D.prototype.alternateWrapper = function() {
       me = me.setIcn3dui(this.id);

       this.bAlternate = true;
       this.alternateStructures();
       this.bAlternate = false;

       var structures = Object.keys(this.structures);
       me.setLogCmd("select $" + structures[this.ALTERNATE_STRUCTURE] + " | name " + structures[this.ALTERNATE_STRUCTURE], true);
       me.setLogCmd("show selection", true);
   };
};

iCn3DUI.prototype.modifyIcn3dshowPicking = function() { var  me = this; //"use strict";
    iCn3D.prototype.rayCaster = function(e, bClick) {
        me = me.setIcn3dui(this.id);
        this.rayCasterBase(e, bClick);
    };
    iCn3D.prototype.showPicking = function(atom, x, y) {
      me = me.setIcn3dui(this.id);
      if(me.cfg.cid !== undefined && this.pk != 0) {
          this.pk = 1; // atom
      }
      else {
          // do not change the picking option
      }
      me.icn3d.highlightlevel = this.pk;
      this.showPickingBase(atom, x, y);

      if(this.pk != 0) {
          if(x !== undefined && y !== undefined) { // mouse over
            if(me.cfg.showmenu != undefined && me.cfg.showmenu == true) {
                y += me.MENU_HEIGHT;
            }
            var text = (this.pk == 1) ? atom.resn + atom.resi + '@' + atom.name : atom.resn + atom.resi;
            if(this.structures !== undefined && Object.keys(this.structures).length > 1) {
                text = atom.structure + '_' + atom.chain + ' ' + text;
                $("#" + me.pre + "popup").css("width", "140px");
            }
            else {
                $("#" + me.pre + "popup").css("width", "80px");
            }
            $("#" + me.pre + "popup").html(text);
            $("#" + me.pre + "popup").css("top", y).css("left", x+20).show();
          }
          else {
              // highlight the sequence background
              me.updateHlAll();
              var transformation = {};
              transformation.factor = this._zoomFactor;
              transformation.mouseChange = this.mouseChange;
              //transformation.quaternion = this.quaternion;
              transformation.quaternion = {};
              transformation.quaternion._x = parseFloat(this.quaternion._x).toPrecision(5);
              transformation.quaternion._y = parseFloat(this.quaternion._y).toPrecision(5);
              transformation.quaternion._z = parseFloat(this.quaternion._z).toPrecision(5);
              transformation.quaternion._w = parseFloat(this.quaternion._w).toPrecision(5);
              if(me.bAddCommands) {
                  this.commands.push('pickatom ' + atom.serial + '|||' + me.getTransformationStr(transformation));
                  this.optsHistory.push(this.cloneHash(this.opts));
                  this.optsHistory[this.optsHistory.length - 1].hlatomcount = Object.keys(this.hAtoms).length;
                  if(me.isSessionStorageSupported()) me.saveCommandsToSession();
                  me.STATENUMBER = this.commands.length;
              }
              this.logs.push('pickatom ' + atom.serial + ' (chain: ' + atom.structure + '_' + atom.chain + ', residue: ' + atom.resn + ', number: ' + atom.resi + ', atom: ' + atom.name + ')');
              if ( $( "#" + me.pre + "logtext" ).length )  {
                $("#" + me.pre + "logtext").val("> " + this.logs.join("\n> ") + "\n> ").scrollTop($("#" + me.pre + "logtext")[0].scrollHeight);
              }
              // update the interaction flag
              me.bSphereCalc = false;
              //me.setLogCmd('set calculate sphere false', true);
              me.bHbondCalc = false;
              //me.setLogCmd('set calculate hbond false', true);
          }
      }
    };
};

