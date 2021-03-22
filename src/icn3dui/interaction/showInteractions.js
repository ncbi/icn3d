/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.showInteractions = function(type) { var me = this, ic = me.icn3d; "use strict";
   var nameArray = $("#" + me.pre + "atomsCustomHbond").val();
   var nameArray2 = $("#" + me.pre + "atomsCustomHbond2").val();
   if(nameArray2.length == 0) {
       alert("Please select the first set");
   }
   else {
       me.setMode('selection');
       var bHbond = $("#" + me.pre + "analysis_hbond")[0].checked;
       var bSaltbridge = $("#" + me.pre + "analysis_saltbridge")[0].checked;
       var bInteraction = $("#" + me.pre + "analysis_contact")[0].checked;
       var bHalogen = $("#" + me.pre + "analysis_halogen")[0].checked;
       var bPication = $("#" + me.pre + "analysis_pication")[0].checked;
       var bPistacking = $("#" + me.pre + "analysis_pistacking")[0].checked;
       var thresholdHbond = $("#" + me.pre + "hbondthreshold").val();
       var thresholdSaltbridge = $("#" + me.pre + "saltbridgethreshold").val();
       var thresholdContact = $("#" + me.pre + "contactthreshold").val();
       var thresholdHalogen = $("#" + me.pre + "halogenthreshold").val();
       var thresholdPication = $("#" + me.pre + "picationthreshold").val();
       var thresholdPistacking = $("#" + me.pre + "pistackingthreshold").val();
       var thresholdStr = 'threshold ' + thresholdHbond + ' ' + thresholdSaltbridge + ' ' + thresholdContact
        + ' ' + thresholdHalogen + ' ' + thresholdPication + ' ' + thresholdPistacking;
       var interactionTypes = me.viewInteractionPairs(nameArray2, nameArray, me.bHbondCalc, type,
            bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
       var bHbondCalcStr = (me.bHbondCalc) ? "true" : "false";
       var tmpStr = nameArray2 + " " + nameArray + " | " + interactionTypes + " | " + bHbondCalcStr + " | " + thresholdStr;
       if(type == '3d') {
           me.setLogCmd("display interaction 3d | " + tmpStr, true);
       }
       else if(type == 'view') {
           me.setLogCmd("view interaction pairs | " + tmpStr, true);
       }
       else if(type == 'save1') {
           me.setLogCmd("save1 interaction pairs | " + tmpStr, true);
       }
       else if(type == 'save2') {
           me.setLogCmd("save2 interaction pairs | " + tmpStr, true);
       }
       else if(type == 'linegraph') {
           me.setLogCmd("line graph interaction pairs | " + tmpStr, true);
       }
       else if(type == 'scatterplot') {
           me.setLogCmd("scatterplot interaction pairs | " + tmpStr, true);
       }
       else if(type == 'graph') { // force-directed graph
            var dist_ss = parseInt($("#" + me.pre + "dist_ss").val());
            var dist_coil = parseInt($("#" + me.pre + "dist_coil").val());
            var dist_hbond = parseInt($("#" + me.pre + "dist_hbond").val());
            var dist_inter = parseInt($("#" + me.pre + "dist_inter").val());
            var dist_ssbond = parseInt($("#" + me.pre + "dist_ssbond").val());
            var dist_ionic = parseInt($("#" + me.pre + "dist_ionic").val());
            var dist_halogen = parseInt($("#" + me.pre + "dist_halogen").val());
            var dist_pication = parseInt($("#" + me.pre + "dist_pication").val());
            var dist_pistacking = parseInt($("#" + me.pre + "dist_pistacking").val());
            me.setLogCmd("graph interaction pairs | " + nameArray2 + " " + nameArray + " | " + interactionTypes
                + " | " + bHbondCalcStr + " | " + thresholdStr + " | " + dist_ss + " " + dist_coil
                + " " + dist_hbond + " " + dist_inter + " " + dist_ssbond + " " + dist_ionic
                + " " + dist_halogen + " " + dist_pication + " " + dist_pistacking, true);
       }
       // avoid repeated calculation
       me.bHbondCalc = true;
   }
};
