/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.closeDialogs = function () { var me = this, ic = me.icn3d; "use strict";
    var itemArray = ['dl_selectannotations', 'dl_alignment', 'dl_2ddgm', 'dl_definedsets', 'dl_graph',
        'dl_linegraph', 'dl_scatterplot', 'dl_allinteraction', 'dl_copyurl'];
    for(var i in itemArray) {
        var item = itemArray[i];
        if(!me.cfg.notebook) {
            if($('#' + me.pre + item).hasClass('ui-dialog-content') && $('#' + me.pre + item).dialog( 'isOpen' )) {
                $('#' + me.pre + item).dialog( 'close' );
            }
        }
        else {
            $('#' + me.pre + item).hide();
        }
    }
    if(!me.cfg.notebook) me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
};
