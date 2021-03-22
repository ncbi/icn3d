/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickModeswitch = function() { var me = this, ic = me.icn3d; "use strict";
    $("#" + me.pre + "modeswitch").click(function (e) {
        if($("#" + me.pre + "modeswitch")[0] !== undefined && $("#" + me.pre + "modeswitch")[0].checked) { // mode: selection
            me.setModeAndDisplay('selection');
        }
        else { // mode: all
            me.setModeAndDisplay('all');
        }
    });

    $("#" + me.pre + "mn6_modeall").click(function (e) {
        me.setModeAndDisplay('all');
    });

    $("#" + me.pre + "mn6_modeselection").click(function (e) {
        me.setModeAndDisplay('selection');
    });
};

iCn3DUI.prototype.setModeAndDisplay = function(mode) { var me = this, ic = me.icn3d; "use strict";
    if(mode === 'all') { // mode all
        me.setMode('all');

        // remember previous selection
        ic.prevHighlightAtoms = ic.cloneHash(ic.hAtoms);

       // select all
       me.setLogCmd("set mode all", true);

       me.selectAll();

       ic.draw();
    }
    else { // mode selection
        me.setMode('selection');

        // get the previous hAtoms
        if(ic.prevHighlightAtoms !== undefined) {
            ic.hAtoms = ic.cloneHash(ic.prevHighlightAtoms);
        }
        else {
            me.selectAll();
        }

        me.setLogCmd("set mode selection", true);

        me.updateHlAll();
    }
};

iCn3DUI.prototype.setMode = function(mode) { var me = this, ic = me.icn3d; "use strict";
    if(mode === 'all') { // mode all
        // set text
        $("#" + me.pre + "modeall").show();
        $("#" + me.pre + "modeselection").hide();

        if($("#" + me.pre + "modeswitch")[0] !== undefined) $("#" + me.pre + "modeswitch")[0].checked = false;

        if($("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").removeClass('icn3d-modeselection');
        if($("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").removeClass('icn3d-modeselection');
        //if($("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").removeClass('icn3d-modeselection');
    }
    else { // mode selection
        //if(Object.keys(ic.hAtoms).length < Object.keys(ic.atoms).length) {
            // set text
            $("#" + me.pre + "modeall").hide();
            $("#" + me.pre + "modeselection").show();

            if($("#" + me.pre + "modeswitch")[0] !== undefined) $("#" + me.pre + "modeswitch")[0].checked = true;

            if(!$("#" + me.pre + "style").hasClass('icn3d-modeselection')) $("#" + me.pre + "style").addClass('icn3d-modeselection');
            if(!$("#" + me.pre + "color").hasClass('icn3d-modeselection')) $("#" + me.pre + "color").addClass('icn3d-modeselection');
            //if(!$("#" + me.pre + "surface").hasClass('icn3d-modeselection')) $("#" + me.pre + "surface").addClass('icn3d-modeselection');

            // show selected chains in annotation window
            //me.showAnnoSelectedChains();
        //}
    }
};
