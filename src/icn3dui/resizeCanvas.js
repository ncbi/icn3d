/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.resizeCanvas = function (width, height, bForceResize, bDraw) { var me = this, ic = me.icn3d; "use strict";
  if( bForceResize || me.cfg.resize ) {
    //var heightTmp = parseInt(height) - me.EXTRAHEIGHT;
    var heightTmp = height;
    $("#" + me.pre + "canvas").width(width).height(heightTmp);
    $("#" + me.pre + "viewer").width(width).height(height);

    //$("div:has(#" + me.pre + "canvas)").width(width).height(heightTmp);
    $("#" + me.divid + " div:has(#" + me.pre + "canvas)").width(width).height(heightTmp);

    ic.setWidthHeight(width, heightTmp);

    if(bDraw === undefined || bDraw) {
        ic.draw();
    }
  }
};

iCn3DUI.prototype.windowResize = function() { var me = this; "use strict";
    if(me.cfg.resize && !me.isMobile() ) {
        $(window).resize(function() { var ic = me.icn3d;
            //me.WIDTH = $( window ).width();
            //me.HEIGHT = $( window ).height();
            me.setViewerWidthHeight();

            var width = me.WIDTH; // - me.LESSWIDTH_RESIZE;
            var height = me.HEIGHT; // - me.LESSHEIGHT - me.EXTRAHEIGHT;

            if(ic !== undefined && !ic.bFullscreen) me.resizeCanvas(width, height);
        });
    }
};

iCn3DUI.prototype.setViewerWidthHeight = function() { var me = this, ic = me.icn3d; "use strict";
    me.WIDTH = $( window ).width() - me.LESSWIDTH;
    me.HEIGHT = $( window ).height() - me.EXTRAHEIGHT - me.LESSHEIGHT;

    // width from css
    var viewer_width, viewer_height;

    if(me.oriWidth !== undefined && me.cfg.width.toString().indexOf('%') === -1) {
        viewer_width = me.oriWidth;
        viewer_height = me.oriHeight;
    }
    else {
        // css width and height
        viewer_width = $( "#" + me.pre + "viewer" ).css('width');
        viewer_height = $( "#" + me.pre + "viewer" ).css('height'); // + me.MENU_HEIGHT;

        if(viewer_width === undefined) viewer_width = me.WIDTH;
        if(viewer_height === undefined) viewer_height = me.HEIGHT;

        // width and height from input parameter
        if(me.cfg.width.toString().indexOf('%') !== -1) {
          viewer_width = $( window ).width() * me.cfg.width.substr(0, me.cfg.width.toString().indexOf('%')) / 100.0 - me.LESSWIDTH;
        }
        else {
          viewer_width = parseInt(me.cfg.width);
        }

        if(me.cfg.height.toString().indexOf('%') !== -1) {
          viewer_height = $( window ).height() * me.cfg.height.substr(0, me.cfg.height.toString().indexOf('%')) / 100.0 - me.EXTRAHEIGHT - me.LESSHEIGHT;
        }
        else {
          viewer_height = parseInt(me.cfg.height);
        }
    }

    if(viewer_width && me.WIDTH > viewer_width) me.WIDTH = viewer_width;
    if(viewer_height && me.HEIGHT > viewer_height) me.HEIGHT = viewer_height;
};
