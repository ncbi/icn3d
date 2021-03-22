/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.init = function () { var me = this, ic = me.icn3d; "use strict";
    me.bSelectResidue = false;
    me.bSelectAlignResidue = false;
    me.selectedResidues = {};
    me.bAnnoShown = false;
    me.bSetChainsAdvancedMenu = false;
    me.b2DShown = false;
    me.bCrashed = false;
    me.prevCommands = "";
    me.bAddCommands = true;
    me.bAddLogs = true;
    me.bNotLoadStructure = false;
    //me.bInputfile = false;
    $("#" + me.pre + "dl_annotations").html('');
    $("#" + me.pre + "dl_2ddgm").html('');
};
