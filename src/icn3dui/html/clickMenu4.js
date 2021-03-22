/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu4 = function() { var me = this, ic = me.icn3d; "use strict";
// mn 4
//    clkMn4_clrSpectrum: function() {
    $("#" + me.pre + "mn4_clrSpectrum").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'spectrum');
       me.setLogCmd('color spectrum', true);
    });
//    },
//    clkMn4_clrChain: function() {
    $("#" + me.pre + "mn4_clrChain").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'chain');
       me.setLogCmd('color chain', true);
    });
//    },
//    clkMn4_clrDomain: function() {
    $("#" + me.pre + "mn4_clrdomain").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'domain');
       me.setLogCmd('color domain', true);
    });
//    },
//    clkMn4_clrSSGreen: function() {
    $("#" + me.pre + "mn4_clrSSGreen").click(function(e) { var ic = me.icn3d;
       ic.sheetcolor = 'green';
       me.setOption('color', 'secondary structure green');
       me.setLogCmd('color secondary structure green', true);
    });
//    },
//    clkMn4_clrSSYellow: function() {
    $("#" + me.pre + "mn4_clrSSYellow").click(function(e) { var ic = me.icn3d;
       ic.sheetcolor = 'yellow';
       me.setOption('color', 'secondary structure yellow');
       me.setLogCmd('color secondary structure yellow', true);
    });
//    },
//    clkMn4_clrSSSpectrum: function() {
    $("#" + me.pre + "mn4_clrSSSpectrum").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'secondary structure spectrum');
       me.setLogCmd('color secondary structure spectrum', true);
    });
//    },
//    clkMn4_clrResidue: function() {
    $("#" + me.pre + "mn4_clrResidue").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'residue');
       me.setLogCmd('color residue', true);
    });
//    },
//    clkMn4_clrResidueCustom: function() {
    $("#" + me.pre + "mn4_clrResidueCustom").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_rescolorfile', 'Please input the file on residue colors');
    });
//    },
//    clkMn4_reloadRescolorfile: function() {
    $("#" + me.pre + "reload_rescolorfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       var file = $("#" + me.pre + "rescolorfile")[0].files[0];
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.fileSupport();
         var reader = new FileReader();
         reader.onload = function (e) {
           var dataStrTmp = e.target.result; // or = reader.result;
           var dataStr = dataStrTmp.replace(/#/g, "");
           ic.customResidueColors = JSON.parse(dataStr);
           for(var res in ic.customResidueColors) {
               ic.customResidueColors[res.toUpperCase()] = ic.thr("#" + ic.customResidueColors[res]);
           }
           me.setOption('color', 'residue custom');
           me.setLogCmd('color residue custom | ' + dataStr, true);
         };
         reader.readAsText(file);
       }
    });
//    },
//    clkMn4_reloadCustomcolorfile: function() {
    $("#" + me.pre + "reload_customcolorfile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setCustomFile('color');
    });
    $("#" + me.pre + "reload_customtubefile").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       if(!me.cfg.notebook) dialog.dialog( "close" );
       me.setCustomFile('tube');
    });
//    },
//    clkMn4_clrCharge: function() {
    $("#" + me.pre + "mn4_clrCharge").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'charge');
       me.setLogCmd('color charge', true);
    });
//    },
//    clkMn4_clrHydrophobic: function() {
    $("#" + me.pre + "mn4_clrHydrophobic").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'hydrophobic');
       me.setLogCmd('color hydrophobic', true);
    });
//    },
//    clkMn4_clrAtom: function() {
    $("#" + me.pre + "mn4_clrAtom").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'atom');
       me.setLogCmd('color atom', true);
    });
//    },
//    clkMn4_clrBfactor: function() {
    $("#" + me.pre + "mn4_clrBfactor").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'b factor');
       me.setLogCmd('color b factor', true);
    });
//    },
//    clkMn4_clrArea: function() {
    $("#" + me.pre + "mn4_clrArea").click(function(e) { var ic = me.icn3d;
        me.openDlg('dl_colorbyarea', "Color based on residue's solvent accessibility");
    });
    $("#" + me.pre + "applycolorbyarea").click(function(e) { var ic = me.icn3d;
        ic.midpercent = $("#" + me.pre + 'midpercent').val();
        me.setOption('color', 'area');
        me.setLogCmd('color area | ' + ic.midpercent, true);

    });
//    },
//    clkMn4_clrBfactorNorm: function() {
    $("#" + me.pre + "mn4_clrBfactorNorm").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'b factor percentile');
       me.setLogCmd('color b factor percentile', true);
    });
//    },
//    clkMn4_clrIdentity: function() {
    $("#" + me.pre + "mn4_clrIdentity").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'identity');
       me.setLogCmd('color identity', true);
    });
//    },
//    clkMn4_clrConserved: function() {
    $("#" + me.pre + "mn4_clrConserved").click(function(e) { var ic = me.icn3d;
       me.setOption('color', 'conservation');
       me.setLogCmd('color conservation', true);
    });
//    },
//    clkMn4_clrCustom: function() {
    $("#" + me.pre + "mn4_clrCustom").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_clr', 'Color picker');
    });
//    },
//    clkMn4_clrOther: function() {
    $(document).on('click', ".icn3d-color-rad-text", function(e) { var ic = me.icn3d;
      e.stopImmediatePropagation();
      //e.preventDefault();
      var color = $(this).attr('color');
      me.setOption("color", color);
      me.setLogCmd("color " + color, true);
    });
//    },
//    clkMn4_clrSave: function() {
    $("#" + me.pre + "mn4_clrSave").click(function(e) { var ic = me.icn3d;
       me.saveColor();
       me.setLogCmd('save color', true);
    });
//    },
//    clkMn4_clrApplySave: function() {
    $("#" + me.pre + "mn4_clrApplySave").click(function(e) { var ic = me.icn3d;
       me.applySavedColor();
       me.setLogCmd('apply saved color', true);
    });
//    },
//    clkMn3_styleSave: function() {
    $("#" + me.pre + "mn3_styleSave").click(function(e) { var ic = me.icn3d;
       me.saveStyle();
       me.setLogCmd('save style', true);
    });
//    },
//    clkMn3_styleApplySave: function() {
    $("#" + me.pre + "mn3_styleApplySave").click(function(e) { var ic = me.icn3d;
       me.applySavedStyle();
       me.setLogCmd('apply saved style', true);
    });
//    },
};
