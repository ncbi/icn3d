/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.selectByCommand = function (select, commandname, commanddesc) { var me = this, ic = me.icn3d; "use strict";
       if(select.indexOf('saved atoms') === 0) {
            var pos = 12; // 'saved atoms '
            var strSets = select.substr(pos);

            me.selectCombinedSets(strSets, commandname);
       }
       else {
           var selectTmp = select.replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/ or and /g, ' and ').replace(/ and /g, ' or and ').replace(/ or not /g, ' not ').replace(/ not /g, ' or not ');

           var commandStr = (selectTmp.trim().substr(0, 6) === 'select') ? selectTmp.trim().substr(7) : selectTmp.trim();

           // each select command may have several commands separated by ' or '
           var commandArray = commandStr.split(' or ');
           var allHighlightAtoms = {};

           for(var i = 0, il = commandArray.length; i < il; ++i) {
               var command = commandArray[i].trim().replace(/\s+/g, ' ');
               var pos = command.indexOf(' ');

               ic.hAtoms = {};

               if(command.substr(0, pos).toLowerCase() === 'and') { // intersection
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = ic.intHash(allHighlightAtoms, ic.hAtoms);
               }
               else if(command.substr(0, pos).toLowerCase() === 'not') { // negation
                       me.applyCommand('select ' + command.substr(pos + 1));

                       allHighlightAtoms = ic.exclHash(allHighlightAtoms, ic.hAtoms);
               }
               else { // union
                       me.applyCommand('select ' + command);

                       allHighlightAtoms = ic.unionHash(allHighlightAtoms, ic.hAtoms);
               }
           }

           ic.hAtoms = ic.cloneHash(allHighlightAtoms);

           var atomArray = Object.keys(ic.hAtoms);
           var residueArray = undefined;

           if(commandname !== "") {
               me.addCustomSelection(atomArray, commandname, commanddesc, select, false);

               var nameArray = [commandname];
               //me.changeCustomResidues(nameArray);

               me.changeCustomAtoms(nameArray);
           }
       }
};
