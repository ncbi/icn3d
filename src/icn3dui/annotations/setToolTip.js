/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// jquery tooltip
//https://stackoverflow.com/questions/18231315/jquery-ui-tooltip-html-with-links
iCn3DUI.prototype.setToolTip = function () {  var me = this, ic = me.icn3d; "use strict";
  $("[id^=" + me.pre + "snp]").add("[id^=" + me.pre + "clinvar]").add("[id^=" + me.pre + "ssbond]").add("[id^=" + me.pre + "crosslink]").tooltip({
    content: function () {
        return $(this).prop('title');
    },
    show: null,
    close: function (event, ui) {
        ui.tooltip.hover(
        function () {
            $(this).stop(true).fadeTo(400, 1);
        },
        function () {
            $(this).fadeOut("400", function () {
                $(this).remove();
            })
        });
    }
  });
};
