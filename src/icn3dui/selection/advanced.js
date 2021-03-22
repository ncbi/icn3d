/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.commandSelect = function(postfix) { var me = this, ic = me.icn3d; "use strict";
       var select = $("#" + me.pre + "command" + postfix).val();

       var commandname = $("#" + me.pre + "command_name" + postfix).val().replace(/;/g, '_').replace(/\s+/g, '_');

       if(select) {
           me.selectByCommand(select, commandname, commandname);
           me.setLogCmd('select ' + select + ' | name ' + commandname, true);
       }
};

iCn3DUI.prototype.clickCommand_apply = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "command_apply").click(function(e) { var ic = me.icn3d;
       e.preventDefault();

       me.commandSelect('');
    });

    $("#" + me.pre + "command_apply2").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       me.commandSelect('2');
    });

};

iCn3DUI.prototype.selectCombinedSets = function(strSets, commandname) { var me = this, ic = me.icn3d; "use strict";
    var idArray = strSets.split(' ');

    var orArray = [], andArray = [], notArray = [];
    var prevLabel = 'or';

    for(var i = 0, il = idArray.length; i < il; ++i) {
        if(idArray[i] === 'or' || idArray[i] === 'and' || idArray[i] === 'not') {
            prevLabel = idArray[i];
            continue;
        }
        else {
            if(prevLabel === 'or') {
                orArray.push(idArray[i]);
            }
            else if(prevLabel === 'and') {
                andArray.push(idArray[i]);
            }
            else if(prevLabel === 'not') {
                notArray.push(idArray[i]);
            }
        }
    }

    if(idArray !== null) me.combineSets(orArray, andArray, notArray, commandname);
};
