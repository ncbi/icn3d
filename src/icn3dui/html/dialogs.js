/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.openDialogHalfWindow = function (id, title, dialogWidth, bForceResize) {  var me = this;
    var twoddgmWidth = 170;

    me.resizeCanvas(me.WIDTH - dialogWidth - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, bForceResize);

    height = me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;
    width = dialogWidth;

    var position;
    if(me.cfg.showmenu) {
        //position ={ my: "left top", at: "right top+80", of: "#" + me.pre + "viewer", collision: "none" };
        position ={ my: "left top", at: "right top+40", of: "#" + me.pre + "viewer", collision: "none" };
    }
    else {
        position ={ my: "left top", at: "right top", of: "#" + me.pre + "viewer", collision: "none" };
    }

    // disable resize
    me.cfg.resize = false;

    window.dialog = $( "#" + id ).dialog({
      autoOpen: true,
      title: title,
      height: height,
      width: width,
      modal: false,
      position: position,
      close: function(e) {
            // determine whether dialogs initilaized
            var bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
            var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
            var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
            var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

            var bSelectannotationsInit2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
            if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
            if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
            if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
            if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

          if((id === me.pre + 'dl_selectannotations' && (!bAlignmentInit2) )
            || (id === me.pre + 'dl_alignment' && (!bSelectannotationsInit2) )
            ) {
              if(bTwoddgmInit2 || bSetsInit2) {
                  me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                  if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm');
                  if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
              }
              else {
                  me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
              }
          }
      },
      resize: function(e) {
          if(id == me.pre + 'dl_selectannotations') {
              me.hideFixedTitle();
          }
      }
    });
};

iCn3DUI.prototype.openDialog2Ddgm = function (id, inHeight) {  var me = this;
    var twoddgmWidth = 170;
    var at, title;
    if(id === me.pre + 'dl_definedsets') {
        at = "right top";
        title = 'Select sets';
    }
    else if(id === me.pre + 'dl_2ddgm') {
        at = "right top+190";
        title = 'Interactions';
    }

    //var position ={ my: "left top", at: at, of: "#" + me.pre + "canvas", collision: "none" };
    var position ={ my: "left top+" + me.MENU_HEIGHT, at: at, of: "#" + me.pre + "viewer", collision: "none" };

    var height = 'auto';

    window.dialog = $( '#' + id ).dialog({
      autoOpen: true,
      title: title,
      height: height,
      width: twoddgmWidth,
      modal: false,
      position: position,
      close: function(e) {
            // determine whether dialogs initilaized
            var bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
            var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
            var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
            var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

            var bSelectannotationsInit2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
            if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
            if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
            if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
            if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

          if( (!bSelectannotationsInit2) && (!bAlignmentInit2) ) {
                me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
          }
      }
    });
};

iCn3DUI.prototype.openDialog = function (id, title) {  var me = this;
    var width = 400, height = 150;
    var twoddgmWidth = 170;

    var bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
    var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
    var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
    var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

    var bSelectannotationsInit2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
    if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
    if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
    if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
    if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

    if(id === me.pre + 'dl_selectannotations' || id === me.pre + 'dl_alignment') {
        var dialogWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddgmWidth * 0.5;

        if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
            me.openDialogHalfWindow(id, title, dialogWidth, true);

            if(bTwoddgmInit2 || bSetsInit2) {
                me.resizeCanvas(me.WIDTH - me.LESSWIDTH - dialogWidth - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm');
                if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
            }
        }
        else {
            me.resizeCanvas(me.WIDTH - me.LESSWIDTH, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5, true);

            height = (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5;

            width = me.WIDTH - me.LESSWIDTH;

            var position ={ my: "left top", at: "left bottom+32", of: "#" + me.pre + "canvas", collision: "none" };

            window.dialog = $( "#" + id ).dialog({
              autoOpen: true,
              title: title,
              height: height,
              width: width,
              modal: false,
              position: position,
              close: function(e) {
                    // determine whether dialogs initilaized
                    var bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
                    var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
                    var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
                    var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

                    var bSelectannotationsInit2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
                    if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
                    if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
                    if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
                    if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

                  if((id === me.pre + 'dl_selectannotations' && (!bAlignmentInit2) )
                    || (id === me.pre + 'dl_alignment' &&(!bSelectannotationsInit2) )
                    ) {
                      if(bTwoddgmInit2 || bSetsInit2) {
                          me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                          if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm');
                          if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
                      }
                      else {
                          me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                      }
                  }
              },
              resize: function(e) {
                  if(id == me.pre + 'dl_selectannotations') {
                      me.hideFixedTitle();
                  }
              }
            });
        }
    }
    else {
        height = 'auto';
        width = 'auto';

        if(id === me.pre + 'dl_addtrack') {
            width='50%';
        }

        var position;

        if(id === me.pre + 'dl_2ddgm' || id === me.pre + 'dl_definedsets') {
            var tmpWidth = 0;
            if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
                if(bSelectannotationsInit2 || bAlignmentInit2) {
                    tmpWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddgmWidth * 0.5;
                }
                me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                me.openDialog2Ddgm(id);
            }
            else {
                me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, true);
                me.openDialog2Ddgm(id, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5);
            }
        }
        else {
            if(me.isMobile()) {
                position ={ my: "left top", at: "left bottom-50", of: "#" + me.pre + "canvas", collision: "none" };
            }
            else {
                position ={ my: "left top", at: "left top+50", of: "#" + me.pre + "canvas", collision: "none" };
            }

            window.dialog = $( "#" + id ).dialog({
              autoOpen: true,
              title: title,
              height: height,
              width: width,
              modal: false,
              position: position
            });
        }
    }

    $(".ui-dialog .ui-button span")
      .removeClass("ui-icon-closethick")
      .addClass("ui-icon-close");
};
