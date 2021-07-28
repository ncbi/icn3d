/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {Html} from './html.js';
import {UtilsCls} from '../utils/utilsCls.js';

import {ResizeCanvas} from '../icn3d/transform/resizeCanvas.js';
import {Annotation} from '../icn3d/annotations/annotation.js';

class Dialog {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    //Open a dialog to input parameters. "id" is the id of the div section holding the html content.
    //"title" is the title of the dialog. The dialog can be out of the viewing area.
    openDlg(id, title) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        id = me.pre + id;

        if(!me.cfg.notebook) {
            this.openDlgRegular(id, title);
        }
        else {
            this.openDlgNotebook(id, title);
        }

        if(!me.htmlCls.themecolor) me.htmlCls.themecolor = 'blue';

        me.htmlCls.setMenuCls.setTheme(me.htmlCls.themecolor);
    }

    addSaveButton(id) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        // adda save button
        if(this.dialogHashSave === undefined || !this.dialogHashSave.hasOwnProperty(id)) {
            $("#" + id).parent().children('.ui-dialog-titlebar').append("<span pid='" + id + "' class='icn3d-saveicon ui-icon ui-icon-disk' title='Save as an HTML file'></span>");

            if(this.dialogHashSave === undefined) this.dialogHashSave = {}
            this.dialogHashSave[id] = 1;
        }
    }

    addHideButton(id) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        // adda save button
        if(this.dialogHashHide === undefined || !this.dialogHashHide.hasOwnProperty(id)) {
            $("#" + id).parent().children('.ui-dialog-titlebar').append("<span pid='" + id + "' class='icn3d-hideicon ui-icon ui-icon-arrowthick-2-ne-sw' title='Resize the window'></span>");

            if(this.dialogHashHide === undefined) this.dialogHashHide = {}
            this.dialogHashHide[id] = 1;
        }
    }

    getDialogStatus() {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let status = {}

        // determine whether dialogs initilaized
        let bSelectannotationsInit = $('#' + me.pre + 'dl_selectannotations').hasClass('ui-dialog-content'); // initialized
        let bGraph = $('#' + me.pre + 'dl_graph').hasClass('ui-dialog-content'); // initialized
        let bLineGraph = $('#' + me.pre + 'dl_linegraph').hasClass('ui-dialog-content'); // initialized
        let bScatterplot = $('#' + me.pre + 'dl_scatterplot').hasClass('ui-dialog-content'); // initialized
        let bContactmap = $('#' + me.pre + 'dl_contactmap').hasClass('ui-dialog-content'); // initialized
        let bTable = $('#' + me.pre + 'dl_interactionsorted').hasClass('ui-dialog-content'); // initialized
        let bAlignmentInit = $('#' + me.pre + 'dl_alignment').hasClass('ui-dialog-content'); // initialized
        let bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
        let bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

        status.bSelectannotationsInit2 = false, status.bGraph2 = false, status.bLineGraph2 = false;
        status.bScatterplot2 = false, status.bTable2 = false, status.bAlignmentInit2 = false;
        status.bTwoddgmInit2 = false, status.bSetsInit2 = false;

        if(bSelectannotationsInit) status.bSelectannotationsInit2 = $('#' + me.pre + 'dl_selectannotations').dialog( 'isOpen' );
        if(bGraph) status.bGraph2 = $('#' + me.pre + 'dl_graph').dialog( 'isOpen' );
        if(bLineGraph) status.bLineGraph2 = $('#' + me.pre + 'dl_linegraph').dialog( 'isOpen' );
        if(bScatterplot) status.bScatterplot2 = $('#' + me.pre + 'dl_scatterplot').dialog( 'isOpen' );
        if(bContactmap) status.bContactmap2 = $('#' + me.pre + 'dl_contactmap').dialog( 'isOpen' );
        if(bTable) status.bTable2 = $('#' + me.pre + 'dl_interactionsorted').dialog( 'isOpen' );
        if(bAlignmentInit) status.bAlignmentInit2 = $('#' + me.pre + 'dl_alignment').dialog( 'isOpen' );
        if(bTwoddgmInit) status.bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
        if(bSetsInit) status.bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

        return status;
    }

    openDlgHalfWindow(id, title, dialogWidth, bForceResize) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;

        let twoddgmWidth = 170;

        //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - dialogWidth - me.htmlCls.LESSWIDTH, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, bForceResize);
        ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - dialogWidth, me.htmlCls.HEIGHT, bForceResize);

        //height = me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT;
        let height = me.htmlCls.HEIGHT;
        let width = dialogWidth;

        let position;
        if(me.cfg.showmenu && !me.utilsCls.isMobile() && !me.cfg.mobilemenu) {
            position ={ my: "left top", at: "right top+40", of: "#" + me.pre + "viewer", collision: "none" }
        }
        else {
            position ={ my: "left top", at: "right top", of: "#" + me.pre + "viewer", collision: "none" }
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
              let status = thisClass.getDialogStatus();

              if((id === me.pre + 'dl_selectannotations' &&(!status.bAlignmentInit2) && !status.bGraph2 && !status.bTable2 && !status.bLineGraph2 && !status.bScatterplot2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_graph' &&(!status.bSelectannotationsInit2) &&(!status.bAlignmentInit2) && !status.bTable2 && !status.bLineGraph2  && !status.bScatterplot2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_alignment' &&(!status.bSelectannotationsInit2) && !status.bGraph2 && !status.bTable2 && !status.bLineGraph2 && !status.bScatterplot2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_interactionsorted' &&(!status.bSelectannotationsInit2) && !status.bGraph2 && !status.bAlignmentInit2 && !status.bLineGraph2 && !status.bScatterplot2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_linegraph' &&(!status.bSelectannotationsInit2) && !status.bGraph2 && !status.bAlignmentInit2 && !status.bTable2 && !status.bScatterplot2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_scatterplot' &&(!status.bSelectannotationsInit2) && !status.bGraph2 && !status.bAlignmentInit2 && !status.bTable2 && !status.bLineGraph2 && !status.bContactmap2)
                ||(id === me.pre + 'dl_contactmap' &&(!status.bSelectannotationsInit2) && !status.bGraph2 && !status.bAlignmentInit2 && !status.bTable2 && !status.bLineGraph2 && !status.bScatterplot2)
                ) {
                  if(status.bTwoddgmInit2 || status.bSetsInit2) {
                      //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH - twoddgmWidth, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                      let canvasWidth = me.utilsCls.isMobile() ? me.htmlCls.WIDTH : me.htmlCls.WIDTH - twoddgmWidth;
                      ic.resizeCanvasCls.resizeCanvas(canvasWidth, me.htmlCls.HEIGHT, true);

                      if(status.bTwoddgmInit2) thisClass.openDlg2Ddgm(me.pre + 'dl_2ddgm', undefined, status.bSetsInit2);
                      if(status.bSetsInit2) thisClass.openDlg2Ddgm(me.pre + 'dl_definedsets');
                  }
                  else {
                      //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                      ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
                  }
              }
          },
          resize: function(e) {
              if(id == me.pre + 'dl_selectannotations') {
                  ic.annotationCls.hideFixedTitle();
              }
              else if(id == me.pre + 'dl_graph') {
                  let width = $("#" + id).width();
                  let height = $("#" + id).height();

                  d3.select("#" + me.svgid).attr("width", width).attr("height", height);
              }
              else if(id == me.pre + 'dl_linegraph' || id == me.pre + 'dl_scatterplot' || id == me.pre + 'dl_contactmap') {
                    //var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
                    //var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

                    //var bTwoddgmInit2 = false, bSetsInit2 = false;
                    //if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
                    //if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

                  let oriWidth =(status.bTwoddgmInit2 || status.bSetsInit2) ?(me.htmlCls.WIDTH - twoddgmWidth)/2 : me.htmlCls.WIDTH / 2;
                  let ratio = $("#" + id).width() / oriWidth;

                  if(id == me.pre + 'dl_linegraph') {
                      let width = ic.linegraphWidth * ratio;
                      $("#" + me.linegraphid).attr("width", width);
                  }
                  else if(id == me.pre + 'dl_scatterplot') {
                      let width = ic.scatterplotWidth * ratio;
                      $("#" + me.scatterplotid).attr("width", width);
                  }
                  else if(id == me.pre + 'dl_contactmap') {
                      let width = ic.contactmapWidth * ratio;
                      $("#" + me.contactmapid).attr("width", width);
                  }
              }
          }
        });

        this.addSaveButton(id);
        this.addHideButton(id);
    }

    openDlg2Ddgm(id, inHeight, bDefinedSets) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let thisClass = this;

        let twoddgmWidth = 170;
        let at, title;
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

            title = '2D Diagram';
        }

        //var position ={ my: "left top", at: at, of: "#" + me.pre + "canvas", collision: "none" }
        let position ={ my: "left top+" + me.htmlCls.MENU_HEIGHT, at: at, of: "#" + me.pre + "viewer", collision: "none" }

        let height = 'auto';

        window.dialog = $( '#' + id ).dialog({
          autoOpen: true,
          title: title,
          height: height,
          width: twoddgmWidth,
          modal: false,
          position: position,
          close: function(e) {
              let status = thisClass.getDialogStatus();

              if((!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bLineGraph2) &&(!status.bScatterplot2) &&(!status.bTable2) &&(!status.bAlignmentInit2) ) {
                    //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                    ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
              }
          }
        });

        this.addSaveButton(id);
        this.addHideButton(id);
    }

    openDlgRegular(id, title) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let width = 400, height = 150;
        let twoddgmWidth = 170;

        let status = this.getDialogStatus();

        if(id === me.pre + 'dl_selectannotations' || id === me.pre + 'dl_graph' || id === me.pre + 'dl_linegraph' || id === me.pre + 'dl_scatterplot' || id === me.pre + 'dl_contactmap' || id === me.pre + 'dl_interactionsorted' || id === me.pre + 'dl_alignment') {
            //var dialogWidth = 0.5 *(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH) - twoddgmWidth * 0.5;
            let dialogWidth = 0.5 *(me.htmlCls.WIDTH) - twoddgmWidth * 0.5;

            //if(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH >= me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT) {
            if(me.htmlCls.WIDTH >= me.htmlCls.HEIGHT) {
                this.openDlgHalfWindow(id, title, dialogWidth, true);

                if(status.bTwoddgmInit2 || status.bSetsInit2) {
                    ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - dialogWidth - twoddgmWidth, me.htmlCls.HEIGHT, true);

                    if(status.bTwoddgmInit2) this.openDlg2Ddgm(me.pre + 'dl_2ddgm', undefined, status.bSetsInit2);
                    if(status.bSetsInit2) this.openDlg2Ddgm(me.pre + 'dl_definedsets');
                }
            }
            else {
                //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT) * 0.5, true);
                ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH,(me.htmlCls.HEIGHT) * 0.5, true);

                //height =(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT) * 0.5;
                height =(me.htmlCls.HEIGHT) * 0.5;

                //width = me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH;
                width = me.htmlCls.WIDTH;

                let position ={ my: "left top", at: "left bottom+32", of: "#" + me.pre + "canvas", collision: "none" }

                window.dialog = $( "#" + id ).dialog({
                  autoOpen: true,
                  title: title,
                  height: height,
                  width: width,
                  modal: false,
                  position: position,
                  close: function(e) {
                      if((id === me.pre + 'dl_selectannotations' &&(!status.bAlignmentInit2) &&(!status.bGraph2) &&(!status.bTable2) &&(!status.bLineGraph2) &&(!status.bScatterplot2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_graph' &&(!status.bSelectannotationsInit2) &&(!status.bAlignmentInit2) &&(!status.bTable2) &&(!status.bLineGraph2) &&(!status.bScatterplot2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_alignment' &&(!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bTable2) &&(!status.bLineGraph2) &&(!status.bScatterplot2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_interactionsorted' &&(!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bAlignmentInit2) &&(!status.bLineGraph2) &&(!status.bScatterplot2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_linegraph' &&(!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bAlignmentInit2) &&(!status.bTable2) &&(!status.bScatterplot2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_scatterplot' &&(!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bAlignmentInit2) &&(!status.bTable2) &&(!status.bLineGraph2) &&(!status.bContactmap2))
                        ||(id === me.pre + 'dl_contactmap' &&(!status.bSelectannotationsInit2) &&(!status.bGraph2) &&(!status.bAlignmentInit2) &&(!status.bTable2) &&(!status.bLineGraph2) &&(!status.bScatterplot2))
                        ) {
                          if(status.bTwoddgmInit2 || status.bSetsInit2) {
                              let canvasWidth = me.utilsCls.isMobile() ? me.htmlCls.WIDTH : me.htmlCls.WIDTH - twoddgmWidth;
                              ic.resizeCanvasCls.resizeCanvas(canvasWidth, me.htmlCls.HEIGHT, true);

                              if(status.bTwoddgmInit2) thisClass.openDlg2Ddgm(me.pre + 'dl_2ddgm', undefined, status.bSetsInit2);
                              if(status.bSetsInit2) thisClass.openDlg2Ddgm(me.pre + 'dl_definedsets');
                          }
                          else {
                              //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                              ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
                          }
                      }
                  },
                  resize: function(e) {
                      if(id == me.pre + 'dl_selectannotations') {
                          ic.annotationCls.hideFixedTitle();
                      }
                      else if(id == me.pre + 'dl_graph') {
                          let width = $("#" + id).width();
                          let height = $("#" + id).height();

                          d3.select("#" + me.svgid).attr("width", width).attr("height", height);
                      }
                      else if(id == me.pre + 'dl_linegraph' || id == me.pre + 'dl_scatterplot' || id == me.pre + 'dl_contactmap') {
                            //var bTwoddgmInit = $('#' + me.pre + 'dl_2ddgm').hasClass('ui-dialog-content'); // initialized
                            //var bSetsInit = $('#' + me.pre + 'dl_definedsets').hasClass('ui-dialog-content'); // initialized

                            //var bTwoddgmInit2 = false, bSetsInit2 = false;
                            //if(bTwoddgmInit) bTwoddgmInit2 = $('#' + me.pre + 'dl_2ddgm').dialog( 'isOpen' );
                            //if(bSetsInit) bSetsInit2 = $('#' + me.pre + 'dl_definedsets').dialog( 'isOpen' );

                          let oriWidth =(status.bTwoddgmInit2 || status.bSetsInit2) ?(me.htmlCls.WIDTH - twoddgmWidth)/2 : me.htmlCls.WIDTH / 2;
                          let ratio = $("#" + id).width() / oriWidth;

                          if(id == me.pre + 'dl_linegraph') {
                              let width = ic.linegraphWidth * ratio;
                              $("#" + me.linegraphid).attr("width", width);
                          }
                          else if(id == me.pre + 'dl_scatterplot') {
                              let width = ic.scatterplotWidth * ratio;
                              $("#" + me.scatterplotid).attr("width", width);
                          }
                          else if(id == me.pre + 'dl_contactmap') {
                              let width = ic.contactmapWidth * ratio;
                              $("#" + me.contactmapid).attr("width", width);
                          }
                      }
                  }
                });

                this.addSaveButton(id);
                this.addHideButton(id);
            }
        }
        else if(id === me.pre + 'dl_2ddgm') {
            let tmpWidth = 0;

            //if(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH >= me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT) {
            if(me.htmlCls.WIDTH >= me.htmlCls.HEIGHT) {
                if(status.bSelectannotationsInit2 || status.bGraph2 || status.bLineGraph2 || status.bScatterplot2 || status.bTable2 || status.bAlignmentInit2) {
                    //tmpWidth = 0.5 *(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH) - twoddgmWidth * 0.5;
                    tmpWidth = 0.5 *(me.htmlCls.WIDTH) - twoddgmWidth * 0.5;
                }
                //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH - tmpWidth - twoddgmWidth, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - tmpWidth - twoddgmWidth, me.htmlCls.HEIGHT, true);

                this.openDlg2Ddgm(id, undefined, status.bSetsInit2);
            }
            else {
                //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH - tmpWidth - twoddgmWidth,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5, true);
                let canvasWidth = me.utilsCls.isMobile() ? me.htmlCls.WIDTH : me.htmlCls.WIDTH - twoddgmWidth;
                ic.resizeCanvasCls.resizeCanvas(canvasWidth,(me.htmlCls.HEIGHT)*0.5, true);
                //this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5);
                this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT)*0.5);

                //this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5, bSetsInit2);
                this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT)*0.5, status.bSetsInit2);
            }
        }
        else {
            height = 'auto';
            width = 'auto';

            if(id === me.pre + 'dl_addtrack') {
                width='50%';
            }

            let position;

            if(id === me.pre + 'dl_definedsets') {
                let tmpWidth = 0;

                //if(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH >= me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT) {
                if(me.htmlCls.WIDTH >= me.htmlCls.HEIGHT) {
                    if(status.bSelectannotationsInit2 || status.bGraph2 || status.bLineGraph2 || status.bScatterplot2 || status.bTable2 || status.bAlignmentInit2) {
                        //tmpWidth = 0.5 *(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH) - twoddgmWidth * 0.5;
                        tmpWidth = 0.5 *(me.htmlCls.WIDTH) - twoddgmWidth * 0.5;
                    }
                    //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH - tmpWidth - twoddgmWidth, me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT, true);
                    ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - tmpWidth - twoddgmWidth, me.htmlCls.HEIGHT, true);
                    this.openDlg2Ddgm(id);

                    if(status.bTwoddgmInit2) this.openDlg2Ddgm(me.pre + 'dl_2ddgm', undefined, true);
                }
                else {
                    //ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH - me.htmlCls.LESSWIDTH - tmpWidth - twoddgmWidth,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5, true);
                    let canvasWidth = me.utilsCls.isMobile() ? me.htmlCls.WIDTH : me.htmlCls.WIDTH - twoddgmWidth;
                    ic.resizeCanvasCls.resizeCanvas(canvasWidth,(me.htmlCls.HEIGHT)*0.5, true);
                    //this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5);
                    this.openDlg2Ddgm(id,(me.htmlCls.HEIGHT)*0.5);

                    //if(bTwoddgmInit2) this.openDlg2Ddgm(me.pre + 'dl_2ddgm',(me.htmlCls.HEIGHT - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT)*0.5, true);
                    if(status.bTwoddgmInit2) this.openDlg2Ddgm(me.pre + 'dl_2ddgm',(me.htmlCls.HEIGHT)*0.5, true);
                }
            }
            else {
                if(me.utilsCls.isMobile()) {
                    position ={ my: "left top", at: "left bottom-50", of: "#" + me.pre + "canvas", collision: "none" }
                }
                else if(id === me.pre + 'dl_allinteraction' || id === me.pre + 'dl_buriedarea') {
                    //position ={ my: "right top", at: "right top+50", of: "#" + me.pre + "dl_selectannotations", collision: "none" }
                    position ={ my: "right top", at: "right top+50", of: "#" + ic.divid, collision: "none" }

                    width = 700;
                    height = 500;
                }
                else if(id === me.pre + 'dl_rmsd') {
                    position ={ my: "left top", at: "right bottom-90", of: "#" + me.pre + "canvas", collision: "none" }
                }
                else if(id === me.pre + 'dl_symd') {
                    position ={ my: "left top", at: "right-200 bottom-200", of: "#" + me.pre + "canvas", collision: "none" }
                }
                else {
                    if(me.cfg.align) {
                        position ={ my: "left top", at: "left top+90", of: "#" + me.pre + "canvas", collision: "none" }
                    }
                    else {
                        position ={ my: "left top", at: "left top+50", of: "#" + me.pre + "canvas", collision: "none" }
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

                this.addSaveButton(id);
                this.addHideButton(id);
            }
        }

        $(".ui-dialog .ui-button span")
          .removeClass("ui-icon-closethick")
          .addClass("ui-icon-close");
    }

    openDlgNotebook(id, title) {  let me = this.icn3dui, ic = me.icn3d;
        if(me.bNode) return;

        let width = 400, height = 150;
        let twoddgmWidth = 170;

        if(id === me.pre + 'dl_selectannotations' || id === me.pre + 'dl_graph' || id === me.pre + 'dl_linegraph' || id === me.pre + 'dl_scatterplot' || id === me.pre + 'dl_contactmap' || id === me.pre + 'dl_interactionsorted' || id === me.pre + 'dl_alignment') {
            $( "#" + id ).show();

            height =(me.htmlCls.HEIGHT) * 0.5;

            width = me.htmlCls.WIDTH;

            $( "#" + id ).width(width);
            $( "#" + id ).height(height);

            $( "#" + id ).resize(function(e) {
                  let oriWidth = me.htmlCls.WIDTH / 2;
                  let ratio = $("#" + id).width() / oriWidth;

                  if(id == me.pre + 'dl_selectannotations') {
                      ic.annotationCls.hideFixedTitle();
                  }
                  else if(id == me.pre + 'dl_graph') {
                      let width = $("#" + id).width();
                      let height = $("#" + id).height();

                      d3.select("#" + me.svgid).attr("width", width).attr("height", height);
                  }
                  else if(id == me.pre + 'dl_linegraph') {
                      let width = ic.linegraphWidth * ratio;

                      $("#" + me.linegraphid).attr("width", width);
                  }
                  else if(id == me.pre + 'dl_scatterplot') {
                      let width = ic.scatterplotWidth * ratio;

                      $("#" + me.scatterplotid).attr("width", width);
                  }
                  else if(id == me.pre + 'dl_contactmap') {
                      let width = ic.contactmapWidth * ratio;

                      $("#" + me.contactmapid).attr("width", width);
                  }
            });
        }
        else {
            if(ic.bRender) $( "#" + id ).show();

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
    }
}

export {Dialog}
