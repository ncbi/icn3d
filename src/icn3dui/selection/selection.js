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

iCn3DUI.prototype.updateSelectionNameDesc = function() { var me = this, ic = me.icn3d; "use strict";
    var numDef = Object.keys(ic.defNames2Residues).length + Object.keys(ic.defNames2Atoms).length;

    $("#" + me.pre + "seq_command_name").val("seq_" + numDef);
    //$("#" + me.pre + "seq_command_desc").val("seq_desc_" + numDef);

    $("#" + me.pre + "seq_command_name2").val("seq_" + numDef);
    //$("#" + me.pre + "seq_command_desc2").val("seq_desc_" + numDef);

    $("#" + me.pre + "alignseq_command_name").val("alseq_" + numDef);
    //$("#" + me.pre + "alignseq_command_desc").val("alseq_desc_" + numDef);
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

