/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.set2DDiagramsForAlign = function (mmdbid1, mmdbid2) { var me = this, ic = me.icn3d; "use strict";
   me.openDlg('dl_2ddgm', 'Interactions');

   mmdbid1 = mmdbid1.substr(0, 4);
   mmdbid2 = mmdbid2.substr(0, 4);

   var url1 = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid1+"&intrac=1";
   var url2 = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid2+"&intrac=1";

   if(me.cfg.inpara !== undefined) {
      url1 += me.cfg.inpara;
      url2 += me.cfg.inpara;
   }

   var request1 = $.ajax({
        url: url1,
        dataType: 'jsonp',
        cache: true
   });

   var request2 = request1.then(function( data ) {
        me.interactionData1 = data;

        me.html2ddgm = '';

        me.draw2Ddgm(data, mmdbid1, 0);
        if(me.cfg.show2d) me.openDlg('dl_2ddgm', 'Interactions');

        return $.ajax({
          url: url2,
          dataType: 'jsonp',
          cache: true
        });
   });

   request2.done(function( data ) {
        me.interactionData2 = data;

        me.draw2Ddgm(data, mmdbid2, 1);

        me.html2ddgm += "<br>" + me.set2DdgmNote(true);
        $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);

        me.b2DShown = true;
        //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDlg('dl_2ddgm', 'Interactions');

        if(me.deferredViewinteraction !== undefined) me.deferredViewinteraction.resolve();
   });
};

iCn3DUI.prototype.set2DDiagramsForChainalign = function (chainidArray) { var me = this, ic = me.icn3d; "use strict";
    me.openDlg('dl_2ddgm', 'Interactions');

    var ajaxArray = [];
    for(var index = 0, indexLen = chainidArray.length; index < indexLen; ++index) {
       var pos = chainidArray[index].indexOf('_');
       var mmdbid = chainidArray[index].substr(0, pos).toUpperCase();

       var url = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&uid="+mmdbid+"&intrac=1";

       if(me.cfg.inpara !== undefined) url += me.cfg.inpara;

       var twodAjax = $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: true
       });

       ajaxArray.push(twodAjax);
    }

    //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
    //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
    $.when.apply(undefined, ajaxArray).then(function() {
      me.parse2DDiagramsData(arguments, chainidArray);
    })
    .fail(function() {
      me.parse2DDiagramsData(arguments, chainidArray);
    });
};

iCn3DUI.prototype.parse2DDiagramsData = function (dataInput, chainidArray) { var me = this, ic = me.icn3d; "use strict";
    var dataArray = (chainidArray.length == 1) ? [dataInput] : dataInput;

    me.html2ddgm = '';

    // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
    //var data2 = v2[0];
    for(var index = 0, indexl = chainidArray.length; index < indexl; ++index) {
        var data = dataArray[index][0];
        var mmdbid = chainidArray[index].substr(0, chainidArray[index].indexOf('_'));

        me.draw2Ddgm(data, mmdbid, 0);
    }

    me.html2ddgm += "<br>" + me.set2DdgmNote(true);

    me.b2DShown = true;
    $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);
    if(me.cfg.show2d) me.openDlg('dl_2ddgm', 'Interactions');

    if(me.deferredViewinteraction !== undefined) me.deferredViewinteraction.resolve();
};

iCn3DUI.prototype.download2Ddgm = function(mmdbid, structureIndex) { var  me = this; "use strict";
    me.set2DDiagrams(mmdbid);
};

iCn3DUI.prototype.set2DDiagrams = function (mmdbid) { var me = this, ic = me.icn3d; "use strict";
    me.openDlg('dl_2ddgm', 'Interactions');

    if(me.b2DShown === undefined || !me.b2DShown) {
        me.html2ddgm = '';

        me.draw2Ddgm(me.interactionData, mmdbid);

        me.html2ddgm += "<br>" + me.set2DdgmNote();
        $("#" + me.pre + "dl_2ddgm").html(me.html2ddgm);
    }

    me.b2DShown = true;
};
