/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setAtomMenu = function (commandnameArray) { var me = this, ic = me.icn3d; "use strict";
  var html = "";

  var nameArray1 = (ic.defNames2Residues !== undefined) ? Object.keys(ic.defNames2Residues) : [];
  var nameArray2 = (ic.defNames2Atoms !== undefined) ? Object.keys(ic.defNames2Atoms) : [];

  var nameArrayTmp = nameArray1.concat(nameArray2).sort();

  var nameArray = [];
  $.each(nameArrayTmp, function(i, el){
       if($.inArray(el, nameArray) === -1) nameArray.push(el);
  });

  //for(var i in ic.defNames2Atoms) {
  for(var i = 0, il = nameArray.length; i < il; ++i) {
      var name = nameArray[i];

      var atom, atomHash;
      if(ic.defNames2Atoms !== undefined && ic.defNames2Atoms.hasOwnProperty(name)) {
          var atomArray = ic.defNames2Atoms[name];

          if(atomArray.length > 0) atom = ic.atoms[atomArray[0]];
      }
      else if(ic.defNames2Residues !== undefined && ic.defNames2Residues.hasOwnProperty(name)) {
          var residueArray = ic.defNames2Residues[name];
          if(residueArray.length > 0) {
              atomHash = ic.residues[residueArray[0]]
              if(atomHash) {
                  atom = ic.atoms[Object.keys(atomHash)[0]];
              }
          }
      }

      var colorStr = (atom === undefined || atom.color === undefined || atom.color.getHexString().toUpperCase() === 'FFFFFF') ? 'DDDDDD' : atom.color.getHexString();
      var color = (atom !== undefined && atom.color !== undefined) ? colorStr : '000000';

      if(commandnameArray.indexOf(name) != -1) {
        html += "<option value='" + name + "' style='color:#" + color + "' selected='selected'>" + name + "</option>";
      }
      else {
        html += "<option value='" + name + "' style='color:#" + color + "'>" + name + "</option>";
      }
  }

  return html;
};
