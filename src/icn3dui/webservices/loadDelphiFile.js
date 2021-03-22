/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.loadDelphiFile = function(type) { var me = this, ic = me.icn3d; "use strict";
   var gsize = $("#" + me.pre + "delphigsize").val();
   var salt = $("#" + me.pre + "delphisalt").val();
   var contour = (type == 'delphi2') ? $("#" + me.pre + "delphicontour2").val() : $("#" + me.pre + "delphicontour").val();

   var bSurface = (type == 'delphi2') ? true: false;

   me.CalcPhi(gsize, salt, contour, bSurface);

   var displayType = (type == 'delphi2') ? 'surface' : 'map';

   if(bSurface) {
       me.setLogCmd('set delphi ' + displayType + ' | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt
         + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);
   }
   else {
       me.setLogCmd('set delphi ' + displayType + ' | contour ' + contour + ' | gsize ' + gsize + ' | salt ' + salt, true);
   }
};

iCn3DUI.prototype.loadPhiFile = function(type) { var me = this, ic = me.icn3d; "use strict";
   var file;
   if(type == 'pqr' || type == 'phi' || type == 'cube') {
       file = $("#" + me.pre + type + "file")[0].files[0];
   }
   else if(type == 'pqr2') {
       file = $("#" + me.pre + "pqrfile2")[0].files[0];
   }
   else if(type == 'phi2') {
       file = $("#" + me.pre + "phifile2")[0].files[0];
   }
   else if(type == 'cube2') {
       file = $("#" + me.pre + "cubefile2")[0].files[0];
   }

   var contour = (type == 'pqr' || type == 'phi' || type == 'cube') ? $("#" + me.pre + "phicontour").val() : $("#" + me.pre + "phicontour2").val();
   if(!file) {
     alert("Please select a file before clicking 'Load'");
   }
   else {
     me.checkFileAPI();
     var reader = new FileReader();
     reader.onload = function (e) { var ic = me.icn3d;
       var data = e.target.result; // or = reader.result;

       var gsize = 0, salt = 0;
       if(type == 'pqr' || type == 'pqr2') {
         var bSurface = (type == 'pqr2') ? true: false;

         gsize = $("#" + me.pre + type + "gsize").val();
         salt = $("#" + me.pre + type + "salt").val();
         me.CalcPhi(gsize, salt, contour, bSurface, data);
       }
       else if(type == 'phi' || type == 'phi2') {
         var bSurface = (type == 'phi2') ? true: false;
         me.loadPhiData(data, contour, bSurface);
       }
       else if(type == 'cube' || type == 'cube2') {
         var bSurface = (type == 'cube2') ? true: false;
         me.loadCubeData(data, contour, bSurface);
       }

       me.bAjaxPhi = true;

       if(bSurface) {
         me.setOption('phisurface', 'phi');
       }
       else {
         me.setOption('phimap', 'phi');
       }

       if(bSurface) {
           me.setLogCmd('load phi ' + type + ' | contour ' + contour + ' | file ' + $("#" + me.pre + type + "file").val()
             + ' | gsize ' + gsize + ' | salt ' + salt
             + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, false);
       }
       else {
           me.setLogCmd('load phi ' + type + ' | contour ' + contour + ' | file ' + $("#" + me.pre + type + "file").val()
             + ' | gsize ' + gsize + ' | salt ' + salt, false);
       }
     };
     if(type == 'phi' || type == 'phi2') {
         reader.readAsArrayBuffer(file);
     }
     else {
         reader.readAsText(file);
     }
   }
};
iCn3DUI.prototype.loadPhiFileUrl = function(type) { var me = this, ic = me.icn3d; "use strict";
   var url;
   if(type == 'pqrurl' || type == 'phiurl' || type == 'cubeurl') {
       url = $("#" + me.pre + type + "file").val();
   }
   else if(type == 'pqrurl2') {
       url = $("#" + me.pre + "pqrurlfile2").val();
   }
   else if(type == 'phiurl2') {
       url = $("#" + me.pre + "phiurlfile2").val();
   }
   else if(type == 'cubeurl2') {
       url = $("#" + me.pre + "cubeurlfile2").val();
   }

   var contour = (type == 'pqrurl' || type == 'phiurl' || type == 'cubeurl') ? $("#" + me.pre + "phiurlcontour").val() :  $("#" + me.pre + "phiurlcontour2").val();
   if(!url) {
        alert("Please input the file URL before clicking 'Load'");
   }
   else {
       var bSurface = (type == 'pqrurl2' || type == 'phiurl2' || type == 'cubeurl2') ? true: false;

       var gsize = 0, salt = 0;

       if(type == 'pqrurl' || type == 'pqrurl2') {
           gsize = $("#" + me.pre + type + "gsize").val();
           salt = $("#" + me.pre + type + "salt").val();
           me.CalcPhiUrl(gsize, salt, contour, bSurface, url);
       }
       else {
           me.PhiParser(url, type, contour, bSurface);
       }

       if(bSurface) {
           me.setLogCmd('set phi ' + type + ' | contour ' + contour + ' | url ' + encodeURIComponent(url)
             + ' | gsize ' + gsize + ' | salt ' + salt
             + ' | surface ' + ic.phisurftype + ' | opacity ' + ic.phisurfop + ' | wireframe ' + ic.phisurfwf, true);
       }
       else {
           me.setLogCmd('set phi ' + type + ' | contour ' + contour + ' | url ' + encodeURIComponent(url)
             + ' | gsize ' + gsize + ' | salt ' + salt, true);
       }
   }
};
