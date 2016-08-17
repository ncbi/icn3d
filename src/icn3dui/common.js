/*! The following are shared by full_ui.js and simple_ui.js */

if (typeof jQuery === 'undefined') { throw new Error('iCn3DUI requires jQuery') }
if (typeof iCn3D === 'undefined') { throw new Error('iCn3DUI requires iCn3D') }

// make dialog movable outside of the window
// http://stackoverflow.com/questions/6696461/jquery-ui-dialog-drag-question
if (!$.ui.dialog.prototype._makeDraggableBase) {
    $.ui.dialog.prototype._makeDraggableBase = $.ui.dialog.prototype._makeDraggable;
    $.ui.dialog.prototype._makeDraggable = function() {
        this._makeDraggableBase();
        this.uiDialog.draggable("option", "containment", false);
    };
}

    iCn3DUI.prototype.clickHighlight_3d_diagram = function() { var me = this;
        $("#" + me.pre + "highlight_3d_diagram").click(function (e) {
           //e.preventDefault();
           me.icn3d.removeHighlightObjects();

           var ckbxes = document.getElementsByName(me.pre + "filter_ckbx");

           var mols = "";

           var molid2ssTmp = {}, molid2colorTmp = {};

           me.icn3d.highlightAtoms = {};
           for(var i = 0, il = ckbxes.length; i < il; ++i) { // skip the first "all" checkbox
             if(ckbxes[i].checked && ckbxes[i].value != 'ligands') {
               var value = ckbxes[i].value;
               var chain = ckbxes[i].getAttribute('chain');

               if(me.icn3d.molid2ss.hasOwnProperty(value)) { // condensed view
                   molid2ssTmp[value] = me.icn3d.molid2ss[value];
                   molid2colorTmp[value] = me.icn3d.molid2color[value];
               }
               else { // all atom view
                   me.icn3d.highlightAtoms = me.icn3d.unionHash(me.icn3d.highlightAtoms, me.icn3d.chains[chain]);
               }
             }
           }

           me.icn3d.drawHelixBrick(molid2ssTmp, molid2colorTmp, me.icn3d.bHighlight); // condensed view
           me.icn3d.addHighlightObjects(undefined, false); // all atom view

           me.icn3d.render();
        });
    };

    iCn3DUI.prototype.rotateStructure = function (direction, bInitial) { var me = this;
        if(me.icn3d.bStopRotate) return false;
        if(me.icn3d.rotateCount > me.icn3d.rotateCountMax) {
            // back to the original orientation
            me.icn3d.resetOrientation();

            return false;
        }
        ++me.icn3d.rotateCount;

        if(bInitial !== undefined && bInitial) {
            if(direction === 'left') {
              me.ROTATION_DIRECTION = 'left';
            }
            else if(direction === 'right') {
              me.ROTATION_DIRECTION = 'right';
            }
            else if(direction === 'up') {
              me.ROTATION_DIRECTION = 'up';
            }
            else if(direction === 'down') {
              me.ROTATION_DIRECTION = 'down';
            }
            else {
              return false;
            }
        }

        if(direction === 'left' && me.ROTATION_DIRECTION === 'left') {
          me.icn3d.rotateLeft(1);
        }
        else if(direction === 'right' && me.ROTATION_DIRECTION === 'right') {
          me.icn3d.rotateRight(1);
        }
        else if(direction === 'up' && me.ROTATION_DIRECTION === 'up') {
          me.icn3d.rotateUp(1);
        }
        else if(direction === 'down' && me.ROTATION_DIRECTION === 'down') {
          me.icn3d.rotateDown(1);
        }
        else {
          return false;
        }

        setTimeout(function(){ me.rotateStructure(direction); }, 100);
    };

    iCn3DUI.prototype.showTitle = function() { var me = this;
        if(me.icn3d.moleculeTitle !== undefined && me.icn3d.moleculeTitle !== '') {
            var title = me.icn3d.moleculeTitle;

            if(me.inputid === undefined) {
                if(me.icn3d.moleculeTitle.length > 40) title = me.icn3d.moleculeTitle.substr(0, 40) + "...";

                $("#" + me.pre + "title").html(title);
            }
            else if(me.cfg.cid !== undefined) {
                var url = me.getLinkToStructureSummary();

                $("#" + me.pre + "title").html(title + " (PubChem CID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>)");
            }
            else if(me.cfg.align !== undefined) {
                $("#" + me.pre + "title").html(title);
            }
            else {
                var url = me.getLinkToStructureSummary();

                if(me.icn3d.moleculeTitle.length > 40) title = me.icn3d.moleculeTitle.substr(0, 40) + "...";

                $("#" + me.pre + "title").html(title + " (PDB ID <a href='" + url + "' target='_blank' style='color:" + me.GREYD + "'>" + me.inputid.toUpperCase() + "</a>)");
            }
        }
        else {
            $("#" + me.pre + "title").html("");
        }
    };

    iCn3DUI.prototype.getLinkToStructureSummary = function(bLog) { var me = this;

           var url = "https://www.ncbi.nlm.nih.gov/structure/?term=";

           if(me.cfg.cid !== undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=";
           }
           else {
               if(me.inputid.indexOf(",") !== -1) {
                   url = "https://www.ncbi.nlm.nih.gov/structure/?term=";
               }
               else {
                   url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=";
               }
           }

           if(me.inputid === undefined) {
               url = "https://www.ncbi.nlm.nih.gov/pccompound/?term=" + me.moleculeTitle;
           }
           else {
               var idArray = me.inputid.split('_');

               if(idArray.length === 1) {
                   url += me.inputid;
                   if(bLog !== undefined && bLog) me.setLogCommand("link to Structure Summary " + me.inputid + ": " + url, false);
               }
               else if(idArray.length === 2) {
                   url += idArray[0] + " OR " + idArray[1];
                   if(bLog !== undefined && bLog) me.setLogCommand("link to structures " + idArray[0] + " and " + idArray[1] + ": " + url, false);
               }
           }

           return url;
    },

    iCn3DUI.prototype.isIE = function() { var me = this;
        //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
            return true;
        else                 // If another browser, return 0
            return false;
    };

    iCn3DUI.prototype.saveFile = function(filename, type, text) { var me = this;
        //Save file
        if(me.isIE()) { // IE
            if(window.navigator.msSaveBlob){
                if(type === 'command') {
                    var dataStr = '';
                    for(var i = 0, il = me.icn3d.commands.length; i < il; ++i) {
                        dataStr += me.icn3d.commands[i].trim() + '\n';
                    }
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'png') {
                   me.icn3d.render();
                   var blob = me.icn3d.renderer.domElement.msToBlob();

                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'html') {
                    var dataStr = text;
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text/html;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
                else if(type === 'text') {
                    var dataStr = text;
                    var data = decodeURIComponent(dataStr);

                    var blob = new Blob([data],{ type: "text;charset=utf-8;"});
                    navigator.msSaveBlob(blob, filename);
                }
            }
        }
        else {
            var data;

            if(type === 'command') {
                //var dataStr = me.icn3d.commands.join('\n');
                var dataStr = '';
                for(var i = 0, il = me.icn3d.commands.length; i < il; ++i) {
                    dataStr += me.icn3d.commands[i].trim() + '\n';
                }
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
            }
            else if(type === 'png') {
               me.icn3d.render();
               var dataStr = me.icn3d.renderer.domElement.toDataURL('image/png');

                data = dataStr;
            }
            else if(type === 'html') {
                var dataStr = text;
                data = "data:text/html;charset=utf-8," + encodeURIComponent(dataStr);
            }
            else if(type === 'text') {
                var dataStr = text;
                data = "data:text;charset=utf-8," + encodeURIComponent(dataStr);
            }

            window.open(data, '_blank');
        }
    };

    iCn3DUI.prototype.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    iCn3DUI.prototype.isMac = function() {
        return /Mac/i.test(navigator.userAgent);
    };

    iCn3DUI.prototype.isSessionStorageSupported = function() {
      var testKey = 'test';
      try {
        sessionStorage.setItem(testKey, '1');
        sessionStorage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    };

    iCn3DUI.prototype.openDialogHalfWindow = function (id, title, dialogWidth, bForceResize) {  var me = this;
        var twoddiagramWidth = 160;

        me.resizeCanvas(me.WIDTH - dialogWidth - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, bForceResize);

        height = me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;
        width = dialogWidth;

        var position;
        if(me.cfg.showmenu) {
            position ={ my: "left top", at: "right top+80", of: "#" + me.pre + "viewer", collision: "none" };
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
                        var bSelectresidueInit = $('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content'); // initialized
                        var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
                        var bFilterInit = $('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content'); // initialized
                        var bTwoddiagramInit = $('#' + me.pre + 'dl_2ddiagram').hasClass('ui-dialog-content'); // initialized

                        var bSelectresidueInit2 = false, bAlignmentInit2 = false, bFilterInit2 = false, bTwoddiagramInit2 = false;
                        if(bSelectresidueInit) bSelectresidueInit2 = $('#' + me.pre + 'dl_selectresidues').dialog( 'isOpen' );
                        if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
                        if(bFilterInit) bFilterInit2 = $('#' + me.pre + 'dl_filter').dialog( 'isOpen' );
                        if(bTwoddiagramInit) bTwoddiagramInit2 = $('#' + me.pre + 'dl_2ddiagram').dialog( 'isOpen' );

                      if((id === me.pre + 'dl_selectresidues' && (!bAlignmentInit2) && (!bFilterInit2) )
                        || (id === me.pre + 'dl_alignment' && (!bSelectresidueInit2) && (!bFilterInit2) )
                        || (id === me.pre + 'dl_filter' && (!bAlignmentInit2) && (!bSelectresidueInit2) )
                        ) {
                          if(bTwoddiagramInit2) {
                              me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddiagramWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                              me.openDialog2Ddiagram();
                          }
                          else {
                              me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                          }
                      }
          }
        });
    };

    iCn3DUI.prototype.openDialog2Ddiagram = function (inHeight) {  var me = this;
        var twoddiagramWidth = 160;
        var position ={ my: "left top", at: "right top", of: "#" + me.pre + "canvas", collision: "none" };

        var adjust = 150;
        //var height = (inHeight !== undefined) ? inHeight + adjust: me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT + adjust;
        var height = 'auto';

        window.dialog = $( '#' + me.pre + 'dl_2ddiagram' ).dialog({
          autoOpen: true,
          title: 'Interactions',
          height: height,
          width: twoddiagramWidth,
          modal: false,
          position: position,
          close: function(e) {
                        // determine whether dialogs initilaized
                        var bSelectresidueInit = $('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content'); // initialized
                        var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
                        var bFilterInit = $('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content'); // initialized
                        var bTwoddiagramInit = $('#' + me.pre + 'dl_2ddiagram').hasClass('ui-dialog-content'); // initialized

                        var bSelectresidueInit2 = false, bAlignmentInit2 = false, bFilterInit2 = false, bTwoddiagramInit2 = false;
                        if(bSelectresidueInit) bSelectresidueInit2 = $('#' + me.pre + 'dl_selectresidues').dialog( 'isOpen' );
                        if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
                        if(bFilterInit) bFilterInit2 = $('#' + me.pre + 'dl_filter').dialog( 'isOpen' );
                        if(bTwoddiagramInit) bTwoddiagramInit2 = $('#' + me.pre + 'dl_2ddiagram').dialog( 'isOpen' );

                      if( (!bAlignmentInit2) && (!bFilterInit2) && (!bSelectresidueInit2) ) {
                            me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                      }
          }
        });
    };

    iCn3DUI.prototype.openDialog = function (id, title) {  var me = this;
        var width = 400, height = 150;
        var twoddiagramWidth = 160;

        var bSelectresidueInit = $('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content'); // initialized
        var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
        var bFilterInit = $('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content'); // initialized
        var bTwoddiagramInit = $('#' + me.pre + 'dl_2ddiagram').hasClass('ui-dialog-content'); // initialized

        var bSelectresidueInit2 = false, bAlignmentInit2 = false, bFilterInit2 = false, bTwoddiagramInit2 = false;
        if(bSelectresidueInit) bSelectresidueInit2 = $('#' + me.pre + 'dl_selectresidues').dialog( 'isOpen' );
        if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
        if(bFilterInit) bFilterInit2 = $('#' + me.pre + 'dl_filter').dialog( 'isOpen' );
        if(bTwoddiagramInit) bTwoddiagramInit2 = $('#' + me.pre + 'dl_2ddiagram').dialog( 'isOpen' );

        if(id === me.pre + 'dl_selectresidues' || id === me.pre + 'dl_alignment' || id === me.pre + 'dl_filter') {
            var filterWidth = (0.5 * me.WIDTH > 250) ? 250 : 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddiagramWidth * 0.5;
            var dialogWidth = (id === me.pre + 'dl_filter') ? filterWidth : 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddiagramWidth * 0.5;

            if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
                me.openDialogHalfWindow(id, title, dialogWidth, true);

                if(bTwoddiagramInit2) {
                    me.resizeCanvas(me.WIDTH - me.LESSWIDTH - dialogWidth - twoddiagramWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                    me.openDialog2Ddiagram();
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
                        var bSelectresidueInit = $('#' + me.pre + 'dl_selectresidues').hasClass('ui-dialog-content'); // initialized
                        var bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
                        var bFilterInit = $('#' + me.pre + 'dl_filter').hasClass('ui-dialog-content'); // initialized
                        var bTwoddiagramInit = $('#' + me.pre + 'dl_2ddiagram').hasClass('ui-dialog-content'); // initialized

                        var bSelectresidueInit2 = false, bAlignmentInit2 = false, bFilterInit2 = false, bTwoddiagramInit2 = false;
                        if(bSelectresidueInit) bSelectresidueInit2 = $('#' + me.pre + 'dl_selectresidues').dialog( 'isOpen' );
                        if(bAlignmentInit) bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
                        if(bFilterInit) bFilterInit2 = $('#' + me.pre + 'dl_filter').dialog( 'isOpen' );
                        if(bTwoddiagramInit) bTwoddiagramInit2 = $('#' + me.pre + 'dl_2ddiagram').dialog( 'isOpen' );

                      if((id === me.pre + 'dl_selectresidues' && (!bAlignmentInit2) && (!bFilterInit2) )
                        || (id === me.pre + 'dl_alignment' && (!bSelectresidueInit2) && (!bFilterInit2) )
                        || (id === me.pre + 'dl_filter' && (!bAlignmentInit2) && (!bSelectresidueInit2) )
                        ) {
                          if(bTwoddiagramInit2) {
                              me.resizeCanvas(me.WIDTH - me.LESSWIDTH - twoddiagramWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                              me.openDialog2Ddiagram();
                          }
                          else {
                              me.resizeCanvas(me.WIDTH - me.LESSWIDTH, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);
                          }
                      }
                  }
                });
            }
        }
        else {
            height = 'auto';
            width = 'auto';

            var position;

            if(id === me.pre + 'dl_2ddiagram') {
                var tmpWidth = 0;
                if(me.WIDTH - me.LESSWIDTH >= me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT) {
                    if(bSelectresidueInit2 || bAlignmentInit2) {
                        tmpWidth = 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddiagramWidth * 0.5;
                    }
                    else if(bFilterInit2) {
                        tmpWidth = (0.5 * me.WIDTH > 250) ? 250 : 0.5 * (me.WIDTH - me.LESSWIDTH) - twoddiagramWidth * 0.5;
                    }

                    me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddiagramWidth, me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT, true);

                    me.openDialog2Ddiagram();
                }
                else {
                    me.resizeCanvas(me.WIDTH - me.LESSWIDTH - tmpWidth - twoddiagramWidth, (me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5, true);
                    me.openDialog2Ddiagram((me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT)*0.5);
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

    iCn3DUI.prototype.resizeCanvas = function (width, height, bForceResize, bDraw) { var me = this;
      if( (bForceResize !== undefined && bForceResize) || (me.cfg.resize !== undefined && me.cfg.resize) ) {
        //var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
        var heightTmp = height;
        $("#" + me.pre + "canvas").width(width).height(heightTmp);

        $("#" + me.pre + "viewer").width(width).height(height);

        me.icn3d.setWidthHeight(width, heightTmp);

        if(bDraw === undefined || bDraw) me.icn3d.draw();
      }
    };

    iCn3DUI.prototype.windowResize = function() { var me = this;
        if(me.cfg.resize !== undefined && me.cfg.resize && !me.isMobile() ) {
            $(window).resize(function() {
                me.WIDTH = $( window ).width();
                me.HEIGHT = $( window ).height();

                var width = me.WIDTH - me.LESSWIDTH_RESIZE;
                var height = me.HEIGHT - me.LESSHEIGHT - me.EXTRAHEIGHT;

                if(me.icn3d !== undefined) me.resizeCanvas(width, height);
            });
        }
    };

    iCn3DUI.prototype.setViewerWidthHeight = function() { var me = this;
        me.WIDTH = $( window ).width();
        me.HEIGHT = $( window ).height();

        var viewer_width = $( "#" + me.pre + "viewer" ).width();
        var viewer_height = $( "#" + me.pre + "viewer" ).height();

        if(viewer_width && me.WIDTH > viewer_width) me.WIDTH = viewer_width;
        if(viewer_height && me.HEIGHT > viewer_height) me.HEIGHT = viewer_height;

        if(me.isMac() && me.isMobile()) {
          if(me.WIDTH < me.MENU_WIDTH) me.WIDTH = me.MENU_WIDTH;

          me.HEIGHT = $( window ).height() / $( window ).width() * me.MENU_WIDTH;
        }

        if(me.cfg.width.toString().indexOf('%') === -1) {
            me.WIDTH = parseInt(me.cfg.width) + me.LESSWIDTH;
        }

        if(me.cfg.height.toString().indexOf('%') === -1) {
            me.HEIGHT = parseInt(me.cfg.height) + me.EXTRAHEIGHT + me.LESSHEIGHT;
        }
    };
