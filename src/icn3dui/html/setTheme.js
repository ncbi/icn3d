/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setTheme = function(color) { var me = this, ic = me.icn3d; "use strict";
    var borderColor, bkgdColor, bkgdImg, iconImg, activeTabColor;

    me.themecolor = color;

    if(color == 'orange') {
        borderColor = '#e78f08';
        bkgdColor = '#f6a828';
        bkgdImg = 'ui-bg_gloss-wave_35_f6a828_500x100.png';
        iconImg = 'ui-icons_ef8c08_256x240.png';
        activeTabColor = '#eb8f00';
    }
    else if(color == 'black') {
        borderColor = '#333333';
        bkgdColor = '#333333';
        bkgdImg = 'ui-bg_gloss-wave_25_333333_500x100.png';
        iconImg = 'ui-icons_222222_256x240.png';
        activeTabColor = '#222222';
    }
    else if(color == 'blue') {
        borderColor = '#4297d7';
        bkgdColor = '#5c9ccc';
        bkgdImg = 'ui-bg_gloss-wave_55_5c9ccc_500x100.png';
        iconImg = 'ui-icons_228ef1_256x240.png';
        activeTabColor = '#444';
    }

    $('.ui-widget-header').css({
        'border': '1px solid ' + borderColor,
        'background': bkgdColor + ' url("lib/images/' + bkgdImg + '") 50% 50% repeat-x',
        'color':'#fff',
        'font-weight':'bold'
    });

    $('.ui-button .ui-icon').css({
        'background-image': 'url(lib/images/' + iconImg + ')'
    });

    $('.ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited').css({
        'color': activeTabColor,
        'text-decoration': 'none'
    });
};
