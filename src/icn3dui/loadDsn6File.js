/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadDsn6File = function(type) { var me = this, ic = me.icn3d; "use strict";
   var file = $("#" + me.pre + "dsn6file" + type)[0].files[0];
   var sigma = $("#" + me.pre + "dsn6sigma" + type).val();
   if(!file) {
     alert("Please select a file before clicking 'Load'");
   }
   else {
     me.checkFileAPI();
     var reader = new FileReader();
     reader.onload = function (e) { var ic = me.icn3d;
       var arrayBuffer = e.target.result; // or = reader.result;
       me.loadDsn6Data(arrayBuffer, type, sigma);
       if(type == '2fofc') {
           me.bAjax2fofc = true;
       }
       else if(type == 'fofc') {
           me.bAjaxfofc = true;
       }
       me.setOption('map', type);
       me.setLogCmd('load dsn6 file ' + $("#" + me.pre + "dsn6file" + type).val(), false);
     };
     reader.readAsArrayBuffer(file);
   }
};

iCn3DUI.prototype.loadDsn6FileUrl = function(type) { var me = this, ic = me.icn3d; "use strict";
   var url = $("#" + me.pre + "dsn6fileurl" + type).val();
   var sigma = $("#" + me.pre + "dsn6sigmaurl" + type).val();
   if(!url) {
        alert("Please input the file URL before clicking 'Load'");
   }
   else {
       me.Dsn6ParserBase(url, type, sigma);
       me.setLogCmd('set map ' + type + ' sigma ' + sigma + ' | ' + encodeURIComponent(url), true);
   }
};
