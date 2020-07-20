/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.openDialog = function (id, title) {  var me = this; //"use strict";
    if(!me.cfg.notebook) {
        me.openDialogRegular(id, title);
    }
    else {
        me.openDialogNotebook(id, title);
    }
};

iCn3DUI.prototype.addSaveButton = function (id) {  var me = this; //"use strict";
    // adda save button
    if(me.dialogHashSave === undefined || !me.dialogHashSave.hasOwnProperty(id)) {
        $("#" + id).parent().children('.ui-dialog-titlebar').append("<span pid='" + id + "' class='icn3d-saveicon ui-icon ui-icon-disk' title='Save as an HTML file'></span>");

        if(me.dialogHashSave === undefined) me.dialogHashSave = {};
        me.dialogHashSave[id] = 1;
    }
};

iCn3DUI.prototype.addHideButton = function (id) {  var me = this; //"use strict";
    // adda save button
    if(me.dialogHashHide === undefined || !me.dialogHashHide.hasOwnProperty(id)) {
        $("#" + id).parent().children('.ui-dialog-titlebar').append("<span pid='" + id + "' class='icn3d-hideicon ui-icon ui-icon-arrowthick-2-ne-sw' title='Minimize the window'></span>");

        if(me.dialogHashHide === undefined) me.dialogHashHide = {};
        me.dialogHashHide[id] = 1;
    }
};

iCn3DUI.prototype.openDialogHalfWindow = function (id, title, dialogWidth, bForceResize) {  var me = this; //"use strict";
    var twoddgmWidth = 170;

    //me.resizeCanvas(me.WIDTH - dialogWidth - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, bForceResize);
    me.resizeCanvas(me.WIDTH - dialogWidth, me.HEIGHT, bForceResize);

    //height = me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;
    height = me.HEIGHT;
    width = dialogWidth;

    var position;
    if(me.cfg.showmenu && !me.isMobile() && !me.cfg.mobilemenu) {
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
            var bGraph = $('#' + me.pre + 'dl_graph').hasClass('ui-dialog-content'); // initialized
            var bLineGraph = $('#' + me.pre + 'dl_linegraph').hasClass('ui-dialog-content'); // initialized
            var bScatterplot = $('#' + me.pre + 'dl_scatterplot').hasClass('ui-dialog-content'); // initialized
            var bTable = $('#' + me.pre + 'dl_interactionsorted').hasClass('ui-dialog-content'); // initialized
            var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
            var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
            var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

            var bSelectannotationsInit2 = false, bGraph2 = false, bLineGraph2 = false, bScatterplot2 = false, bTable2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
            if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
            if(bGraph) bGraph2 = $('#' + me.pre + 'dl_graph').dialog( 'isOpen' );
            if(bLineGraph) bLineGraph2 = $('#' + me.pre + 'dl_linegraph').dialog( 'isOpen' );
            if(bScatterplot) bScatterplot2 = $('#' + me.pre + 'dl_scatterplot').dialog( 'isOpen' );
            if(bTable) bTable2 = $('#' + me.pre + 'dl_interactionsorted').dialog( 'isOpen' );
            if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
            if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
            if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

          if((id === me.pre + 'dl_selectannotations' && (!bAlignmentInit2) && !bGraph2 && !bTable2 && !bLineGraph2 && !bScatterplot2)
            || (id === me.pre + 'dl_graph' && (!bSelectannotationsInit2) && (!bAlignmentInit2) && !bTable2 && !bLineGraph2  && !bScatterplot2)
            || (id === me.pre + 'dl_alignment' && (!bSelectannotationsInit2) && !bGraph2 && !bTable2 && !bLineGraph2 && !bScatterplot2 )
            || (id === me.pre + 'dl_interactionsorted' && (!bSelectannotationsInit2) && !bGraph2 && !bAlignmentInit2 && !bLineGraph2 && !bScatterplot2 )
            || (id === me.pre + 'dl_linegraph' && (!bSelectannotationsInit2) && !bGraph2 && !bAlignmentInit2 && !bTable2 && !bScatterplot2 )
            || (id === me.pre + 'dl_scatterplot' && (!bSelectannotationsInit2) && !bGraph2 && !bAlignmentInit2 && !bTable2 && !bLineGraph2 )
            ) {
              if(bTwoddgmInit2 || bSetsInit2) {
                  //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                  var canvasWidth = me.isMobile() ? me.WIDTH : me.WIDTH - twoddgmWidth;
                  me.resizeCanvas(canvasWidth, me.HEIGHT, true);

                  if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', undefined, bSetsInit2);
                  if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
              }
              else {
                  //me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                  me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
              }
          }
      },
      resize: function(e) {
          if(id == me.pre + 'dl_selectannotations') {
              me.hideFixedTitle();
          }
          else if(id == me.pre + 'dl_graph') {
              var width = $("#" + id).width();
              var height = $("#" + id).height();

              d3.select("#" + me.svgid).attr("width", width).attr("height", height);
          }
          else if(id == me.pre + 'dl_linegraph' || id == me.pre + 'dl_scatterplot') {
                var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
                var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

                var bTwoddgmInit2 = false, bSetsInit2 = false;
                if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
                if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

              var oriWidth = (bTwoddgmInit2 || bSetsInit2) ? (me.WIDTH - twoddgmWidth)/2 : me.WIDTH / 2;
              var ratio = $("#" + id).width() / oriWidth;

              if(id == me.pre + 'dl_linegraph') {
                  var width = me.linegraphWidth * ratio;
                  $("#" + me.linegraphid).attr("width", width);
              }
              else if(id == me.pre + 'dl_scatterplot') {
                  var width = me.scatterplotWidth * ratio;
                  $("#" + me.scatterplotid).attr("width", width);
              }
          }
      }
    });

    me.addSaveButton(id);
    me.addHideButton(id);
};

iCn3DUI.prototype.openDialog2Ddgm = function (id, inHeight, bDefinedSets) {  var me = this; //"use strict";
    var twoddgmWidth = 170;
    var at, title;
    if(id === me.pre + 'dl_definedsets') {
        at = "right top";
        title = 'Select sets';
    }
    else if(id === me.pre + 'dl_2ddgm') {
        if(bDefinedSets) {
            at = "right top+240";
        }
        else {
            at = "right top";
        }

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
            var bGraph = $('#' + me.pre + 'dl_graph').hasClass('ui-dialog-content'); // initialized
            var bLineGraph = $('#' + me.pre + 'dl_linegraph').hasClass('ui-dialog-content'); // initialized
            var bScatterplot = $('#' + me.pre + 'dl_scatterplot').hasClass('ui-dialog-content'); // initialized
            var bTable = $('#' + me.pre + 'dl_interactionsorted').hasClass('ui-dialog-content'); // initialized
            var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
            var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
            var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

            var bSelectannotationsInit2 = false, bGraph2 = false, bLineGraph2 = false, bScatterplot2 = false, bTable2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
            if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
            if(bGraph) bGraph2 = $('#' + me.pre + 'dl_graph').dialog( 'isOpen' );
            if(bLineGraph) bLineGraph2 = $('#' + me.pre + 'dl_linegraph').dialog( 'isOpen' );
            if(bScatterplot) bScatterplot2 = $('#' + me.pre + 'dl_scatterplot').dialog( 'isOpen' );
            if(bTable) bTable2 = $('#' + me.pre + 'dl_interactionsorted').dialog( 'isOpen' );
            if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
            if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
            if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

          if( (!bSelectannotationsInit2) && (!bGraph2) && (!bLineGraph2) && (!bScatterplot2) && (!bTable2) && (!bAlignmentInit2) ) {
                //me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
          }
      }
    });

    me.addSaveButton(id);
    me.addHideButton(id);
};

iCn3DUI.prototype.openDialogRegular = function (id, title) {  var me = this; //"use strict";
    var width = 400, height = 150;
    var twoddgmWidth = 170;

    var bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
    var bGraph = $('#' + me.pre + 'dl_graph').hasClass('ui-dialog-content'); // initialized
    var bLineGraph = $('#' + me.pre + 'dl_linegraph').hasClass('ui-dialog-content'); // initialized
    var bScatterplot = $('#' + me.pre + 'dl_scatterplot').hasClass('ui-dialog-content'); // initialized
    var bTable = $('#' + me.pre + 'dl_interactionsorted').hasClass('ui-dialog-content'); // initialized
    var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
    var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
    var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

    var bSelectannotationsInit2 = false, bGraph2 = false, bLineGraph2 = false, bScatterplot2 = false, bTable2 = false, bAlignmentInit2 = false, bTwoddgmInit2 = false, bSetsInit2 = false;
    if(bSelectannotationsInit) bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
    if(bGraph) bGraph2 = $('#' + me.pre + 'dl_graph').dialog( 'isOpen' );
    if(bLineGraph) bLineGraph2 = $('#' + me.pre + 'dl_linegraph').dialog( 'isOpen' );
    if(bScatterplot) bScatterplot2 = $('#' + me.pre + 'dl_scatterplot').dialog( 'isOpen' );
    if(bTable) bTable2 = $('#' + me.pre + 'dl_interactionsorted').dialog( 'isOpen' );
    if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
    if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
    if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

    if(id === me.pre + 'dl_selectannotations' || id === me.pre + 'dl_graph' || id === me.pre + 'dl_linegraph' || id === me.pre + 'dl_scatterplot' || id === me.pre + 'dl_interactionsorted' || id === me.pre + 'dl_alignment') {
        //var dialogWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddgmWidth * 0.5;
        var dialogWidth = 0.5 * (me.WIDTH) - twoddgmWidth * 0.5;

        //if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
        if(me.WIDTH >= me.HEIGHT) {
            me.openDialogHalfWindow(id, title, dialogWidth, true);

            if(bTwoddgmInit2 || bSetsInit2) {
                //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - dialogWidth - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                me.resizeCanvas(me.WIDTH - dialogWidth - twoddgmWidth, me.HEIGHT, true);

                if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', undefined, bSetsInit2);
                if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
            }
        }
        else {
            //me.resizeCanvas(me.WIDTH - me.LESSWIDTH, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5, true);
            me.resizeCanvas(me.WIDTH, (me.HEIGHT) * 0.5, true);

            //height = (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) * 0.5;
            height = (me.HEIGHT) * 0.5;

            //width = me.WIDTH - me.LESSWIDTH;
            width = me.WIDTH;

            var position ={ my: "left top", at: "left bottom+32", of: "#" + me.pre + "canvas", collision: "none" };

            window.dialog = $( "#" + id ).dialog({
              autoOpen: true,
              title: title,
              height: height,
              width: width,
              modal: false,
              position: position,
              close: function(e) {
                  if((id === me.pre + 'dl_selectannotations' && (!bAlignmentInit2) &&(!bGraph2) &&(!bTable2) &&(!bLineGraph2) &&(!bScatterplot2))
                    || (id === me.pre + 'dl_graph' &&(!bSelectannotationsInit2) && (!bAlignmentInit2) &&(!bTable2) &&(!bLineGraph2) &&(!bScatterplot2) )
                    || (id === me.pre + 'dl_alignment' &&(!bSelectannotationsInit2) &&(!bGraph2) &&(!bTable2) &&(!bLineGraph2) &&(!bScatterplot2) )
                    || (id === me.pre + 'dl_interactionsorted' &&(!bSelectannotationsInit2) &&(!bGraph2) &&(!bAlignmentInit2) &&(!bLineGraph2) &&(!bScatterplot2) )
                    || (id === me.pre + 'dl_linegraph' &&(!bSelectannotationsInit2) &&(!bGraph2) &&(!bAlignmentInit2) &&(!bTable2) &&(!bScatterplot2) )
                    || (id === me.pre + 'dl_scatterplot' &&(!bSelectannotationsInit2) &&(!bGraph2) &&(!bAlignmentInit2) &&(!bTable2) &&(!bLineGraph2) )
                    ) {
                      if(bTwoddgmInit2 || bSetsInit2) {
                          //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                          var canvasWidth = me.isMobile() ? me.WIDTH : me.WIDTH - twoddgmWidth;
                          me.resizeCanvas(canvasWidth, me.HEIGHT, true);

                          if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', undefined, bSetsInit2);
                          if(bSetsInit2) me.openDialog2Ddgm(me.pre + 'dl_definedsets');
                      }
                      else {
                          //me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                          me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
                      }
                  }
              },
              resize: function(e) {
                  if(id == me.pre + 'dl_selectannotations') {
                      me.hideFixedTitle();
                  }
                  else if(id == me.pre + 'dl_graph') {
                      var width = $("#" + id).width();
                      var height = $("#" + id).height();

                      d3.select("#" + me.svgid).attr("width", width).attr("height", height);
                  }
                  else if(id == me.pre + 'dl_linegraph' || id == me.pre + 'dl_scatterplot') {
                        var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
                        var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

                        var bTwoddgmInit2 = false, bSetsInit2 = false;
                        if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
                        if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

                      var oriWidth = (bTwoddgmInit2 || bSetsInit2) ? (me.WIDTH - twoddgmWidth)/2 : me.WIDTH / 2;
                      var ratio = $("#" + id).width() / oriWidth;

                      if(id == me.pre + 'dl_linegraph') {
                          var width = me.linegraphWidth * ratio;
                          $("#" + me.linegraphid).attr("width", width);
                      }
                      else if(id == me.pre + 'dl_scatterplot') {
                          var width = me.scatterplotWidth * ratio;
                          $("#" + me.scatterplotid).attr("width", width);
                      }
                  }
              }
            });

            me.addSaveButton(id);
            me.addHideButton(id);
        }
    }
    else if(id === me.pre + 'dl_2ddgm') {
        var tmpWidth = 0;

        //if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
        if(me.WIDTH >= me.HEIGHT) {
            if(bSelectannotationsInit2 || bGraph2 || bLineGraph2 || bScatterplot2 || bTable2 || bAlignmentInit2) {
                //tmpWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddgmWidth * 0.5;
                tmpWidth = 0.5 * (me.WIDTH) - twoddgmWidth * 0.5;
            }
            //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
            me.resizeCanvas(me.WIDTH - tmpWidth - twoddgmWidth, me.HEIGHT, true);

            me.openDialog2Ddgm(id, undefined, bSetsInit2);
        }
        else {
            //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, true);
            var canvasWidth = me.isMobile() ? me.WIDTH : me.WIDTH - twoddgmWidth;
            me.resizeCanvas(canvasWidth, (me.HEIGHT)*0.5, true);
            //me.openDialog2Ddgm(id, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5);
            me.openDialog2Ddgm(id, (me.HEIGHT)*0.5);

            //me.openDialog2Ddgm(id, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, bSetsInit2);
            me.openDialog2Ddgm(id, (me.HEIGHT)*0.5, bSetsInit2);
        }
    }
    else {
        height = 'auto';
        width = 'auto';

        if(id === me.pre + 'dl_addtrack') {
            width='50%';
        }

        var position;

        if(id === me.pre + 'dl_definedsets') {
            var tmpWidth = 0;

            //if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
            if(me.WIDTH >= me.HEIGHT) {
                if(bSelectannotationsInit2 || bGraph2 || bLineGraph2 || bScatterplot2 || bTable2 || bAlignmentInit2) {
                    //tmpWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddgmWidth * 0.5;
                    tmpWidth = 0.5 * (me.WIDTH) - twoddgmWidth * 0.5;
                }
                //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                me.resizeCanvas(me.WIDTH - tmpWidth - twoddgmWidth, me.HEIGHT, true);
                me.openDialog2Ddgm(id);

                if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', undefined, true);
            }
            else {
                //me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddgmWidth, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, true);
                var canvasWidth = me.isMobile() ? me.WIDTH : me.WIDTH - twoddgmWidth;
                me.resizeCanvas(canvasWidth, (me.HEIGHT)*0.5, true);
                //me.openDialog2Ddgm(id, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5);
                me.openDialog2Ddgm(id, (me.HEIGHT)*0.5);

                //if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, true);
                if(bTwoddgmInit2) me.openDialog2Ddgm(me.pre + 'dl_2ddgm', (me.HEIGHT)*0.5, true);
            }
        }
        else {
            if(me.isMobile()) {
                position ={ my: "left top", at: "left bottom-50", of: "#" + me.pre + "canvas", collision: "none" };
            }
            else if(id === me.pre + 'dl_allinteraction' || id === me.pre + 'dl_buriedarea') {
                //position ={ my: "right top", at: "right top+50", of: "#" + me.pre + "dl_selectannotations", collision: "none" };
                position ={ my: "right top", at: "right top+50", of: "#" + me.divid, collision: "none" };

                width = 700;
                height = 500;
            }
            else if(id === me.pre + 'dl_rmsd') {
                position ={ my: "left top", at: "right bottom-90", of: "#" + me.pre + "canvas", collision: "none" };
            }
            else {
                if(me.cfg.align) {
                    position ={ my: "left top", at: "left top+90", of: "#" + me.pre + "canvas", collision: "none" };
                }
                else {
                    position ={ my: "left top", at: "left top+50", of: "#" + me.pre + "canvas", collision: "none" };
                }
            }

            window.dialog = $( "#" + id ).dialog({
              autoOpen: true,
              title: title,
              height: height,
              width: width,
              modal: false,
              position: position
            });

            me.addSaveButton(id);
            me.addHideButton(id);
        }
    }

    $(".ui-dialog .ui-button span")
      .removeClass("ui-icon-closethick")
      .addClass("ui-icon-close");
};

iCn3DUI.prototype.openDialogNotebook = function (id, title) {  var me = this; //"use strict";
    var width = 400, height = 150;
    var twoddgmWidth = 170;

    if(id === me.pre + 'dl_selectannotations' || id === me.pre + 'dl_graph' || id === me.pre + 'dl_linegraph' || id === me.pre + 'dl_scatterplot' || id === me.pre + 'dl_interactionsorted' || id === me.pre + 'dl_alignment') {
        $( "#" + id ).show();

        height = (me.HEIGHT) * 0.5;

        width = me.WIDTH;

        $( "#" + id ).width(width);
        $( "#" + id ).height(height);

        $( "#" + id ).resize(function(e) {
              if(id == me.pre + 'dl_selectannotations') {
                  me.hideFixedTitle();
              }
              else if(id == me.pre + 'dl_graph') {
                  var width = $("#" + id).width();
                  var height = $("#" + id).height();

                  d3.select("#" + me.svgid).attr("width", width).attr("height", height);
              }
              else if(id == me.pre + 'dl_linegraph') {
                  var oriWidth = me.WIDTH / 2;
                  var ratio = $("#" + id).width() / oriWidth;

                  var width = me.linegraphWidth * ratio;

                  $("#" + me.linegraphid).attr("width", width);
              }
              else if(id == me.pre + 'dl_scatterplot') {
                  var oriWidth = me.WIDTH / 2;
                  var ratio = $("#" + id).width() / oriWidth;

                  var width = me.scatterplotWidth * ratio;

                  $("#" + me.scatterplotid).attr("width", width);
              }
        });
    }
    else {
        if(me.icn3d.bRender) $( "#" + id ).show();

        height = 'auto';
        width = 'auto';

        if(id === me.pre + 'dl_addtrack') {
            width='50%';
        }
        else if(id === me.pre + 'dl_2ddgm' || id === me.pre + 'dl_definedsets') {
            width=twoddgmWidth;
        }
        else if(id === me.pre + 'dl_allinteraction' || id === me.pre + 'dl_buriedarea') {
            width = 700;
            height = 500;
        }

        $( "#" + id ).width(width);
        $( "#" + id ).height(height);
    }
};
