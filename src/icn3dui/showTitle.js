/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showTitle = function() { var me = this, ic = me.icn3d; "use strict";
    if(ic.molTitle !== undefined && ic.molTitle !== '') {
        var title = ic.molTitle;

        var titlelinkColor = (me.opts['background'] == 'white' || me.opts['background'] == 'grey') ? 'black' : me.GREYD;

        if(me.inputid === undefined) {
            if(ic.molTitle.length > 40) title = ic.molTitle.substr(0, 40) + "...";

            $("#" + me.pre + "title").html(title);
        }
        else if(me.cfg.cid !== undefined) {
            var url = me.getLinkToStructureSummary();

            $("#" + me.pre + "title").html("PubChem CID <a id='" + me.pre + "titlelink' href='" + url + "' style='color:" + titlelinkColor + "' target='_blank'>" + me.inputid.toUpperCase() + "</a>: " + title);
        }
        else if(me.cfg.align !== undefined) {
            $("#" + me.pre + "title").html(title);
        }
        else if(me.cfg.chainalign !== undefined) {
            var chainidArray = me.cfg.chainalign.split(',');
            title = 'Dynamic Structure Alignment of Chain ' + chainidArray[0] + ' to Chain ' + chainidArray[1];

            $("#" + me.pre + "title").html(title);
        }
        else {
            var url = me.getLinkToStructureSummary();

            if(ic.molTitle.length > 40) title = ic.molTitle.substr(0, 40) + "...";

            //var asymmetricStr = (me.bAssemblyUseAsu) ? " (Asymmetric Unit)" : "";
            var asymmetricStr = "";

            $("#" + me.pre + "title").html("PDB ID <a id='" + me.pre + "titlelink' href='" + url + "' style='color:" + titlelinkColor + "' target='_blank'>" + me.inputid.toUpperCase() + "</a>" + asymmetricStr + ": " + title);
        }
    }
    else {
        $("#" + me.pre + "title").html("");
    }
};
