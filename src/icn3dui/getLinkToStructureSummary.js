/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getLinkToStructureSummary = function(bLog) { var me = this, ic = me.icn3d; "use strict";

       var url = "https://www.ncbi.nlm.nih.gov/structure/?term=";

       if(me.cfg.cid !== undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=";
       }
       else {
           //if(me.inputid.indexOf(",") !== -1) {
           if(Object.keys(ic.structures).length > 1) {
               url = "https://www.ncbi.nlm.nih.gov/structure/?term=";
           }
           else {
               //url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=";
               url = me.baseUrl + "pdb/";
           }
       }

       if(me.inputid === undefined) {
           url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=" + me.molTitle;
       }
       else {
           var idArray = me.inputid.split('_');

           if(idArray.length === 1) {
               url += me.inputid;
               if(bLog) me.setLogCmd("link to Structure Summary " + me.inputid + ": " + url, false);
           }
           else if(idArray.length === 2) {
               url += idArray[0] + " OR " + idArray[1];
               if(bLog) me.setLogCmd("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
           }
       }

       return url;
};

iCn3DUI.prototype.setEntrezLinks = function(db) { var me = this, ic = me.icn3d; "use strict";
  var structArray = Object.keys(ic.structures);
  var url;
  if(structArray.length === 1) {
      url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0];
      me.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + ": " + url, false);
      window.open(url, '_blank');
  }
  else if(structArray.length === 2) {
      url = "https://www.ncbi.nlm.nih.gov/" + db + "/?term=" + structArray[0] + " OR " + structArray[1];
      me.setLogCmd("Entrez " + db + " about PDB " + structArray[0] + " OR " + structArray[1] + ": " + url, false);
      window.open(url, '_blank');
  }
};

