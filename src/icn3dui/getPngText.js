/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getPngText = function() { var me = this, ic = me.icn3d; "use strict";
    var url; // output state file if me.bInputfile is true or the URL is mor than 4000 chars
    var bAllCommands = true;

    var text = "";
    if(me.bInputfile) {
        url = me.shareLinkUrl(bAllCommands); // output state file if me.bInputfile is true or the URL is mor than 4000 chars

        text += "\nStart of type file======\n";
        text += me.InputfileType + "\n";
        text += "End of type file======\n";

        text += "Start of data file======\n";
        text += me.InputfileData;
        text += "End of data file======\n";

        text += "Start of state file======\n";
        text += url;
        text += "End of state file======\n";
    }
    else {
        url = me.shareLinkUrl();
        var bTooLong = (url.length > 4000 || url.indexOf('http') !== 0) ? true : false;
        if(bTooLong) {
            url = me.shareLinkUrl(bAllCommands); // output state file if me.bInputfile is true or the URL is mor than 4000 chars

            text += "\nStart of state file======\n";

            text += url;
            text += "End of state file======\n";
        }
        else {
            text += "\nShare Link: " + url;
        }
    }

    text = text.replace(/!/g, Object.keys(ic.structures)[0] + '_');

    return text;
};
