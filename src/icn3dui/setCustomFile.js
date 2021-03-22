/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.setCustomFile = function(type) { var me = this, ic = me.icn3d; "use strict";
   var chainid = $("#" + me.pre + "customcolor_chainid").val();
   var file = $("#" + me.pre + "cstcolorfile")[0].files[0];
   if(!file) {
     alert("Please select a file before clicking 'Load'");
   }
   else {
     me.checkFileAPI();
     var reader = new FileReader();
     reader.onload = function (e) { var ic = me.icn3d;
        var dataStr = e.target.result; // or = reader.result;
        var lineArray = dataStr.split('\n');
        if(ic.queryresi2score === undefined) ic.queryresi2score = {};
        //if(ic.queryresi2score[chainid] === undefined) ic.queryresi2score[chainid] = {};
        ic.queryresi2score[chainid] = {};
        for(var i = 0, il = lineArray.length; i < il; ++i) {
            if(lineArray[i].trim() !== '') {
                var columnArray = lineArray[i].split(/\s+/);
                ic.queryresi2score[chainid][columnArray[0]] = columnArray[1];
            }
        }
        var resiArray = Object.keys(ic.queryresi2score[chainid]);
        var start = Math.min.apply(null, resiArray);
        var end = Math.max.apply(null, resiArray);
        var resiScoreStr = '';
        for(var resi = start; resi <= end; ++resi) {
            if(ic.queryresi2score[chainid].hasOwnProperty(resi)) {
                resiScoreStr += Math.round(ic.queryresi2score[chainid][resi]/11); // max 9
            }
            else {
                resiScoreStr += '_';
            }
        }
        if(type == 'color') {
            ic.opts['color'] = 'align custom';
            ic.setColorByOptions(ic.opts, ic.hAtoms);
            me.updateHlAll();
            me.setLogCmd('color align custom | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
        }
        else if(type == 'tube') {
            me.setStyle('proteins', 'custom tube');
            me.setLogCmd('color tube | ' + chainid + ' | range ' + start + '_' + end + ' | ' + resiScoreStr, true);
        }
        ic.draw();
     };
     reader.readAsText(file);
   }
};
