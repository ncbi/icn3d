/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu5 = function() { var me = this, ic = me.icn3d; "use strict";
// mn 5
//    clkMn5_neighborsYes: function() {
    $("#" + me.pre + "mn5_neighborsYes").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       ic.removeLastSurface();
       ic.applySurfaceOptions();
       if(ic.bRender) ic.render();
       me.setLogCmd('set surface neighbors on', true);
    });
//    },
//    clkMn5_neighborsNo: function() {
    $("#" + me.pre + "mn5_neighborsNo").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       ic.removeLastSurface();
       ic.applySurfaceOptions();
       if(ic.bRender) ic.render();
       me.setLogCmd('set surface neighbors off', true);
    });
//    },
//    clkMn5_surfaceVDW: function() {
    $("#" + me.pre + "mn5_surfaceVDW").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'Van der Waals surface');
       me.setLogCmd('set surface Van der Waals surface', true);
    });
//    },
//    clkMn5_surfaceSAS: function() {
    $("#" + me.pre + "mn5_surfaceSAS").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'solvent accessible surface');
       me.setLogCmd('set surface solvent accessible surface', true);
    });
//    },
//    clkMn5_surfaceMolecular: function() {
    $("#" + me.pre + "mn5_surfaceMolecular").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = false;
       me.setOption('surface', 'molecular surface');
       me.setLogCmd('set surface molecular surface', true);
    });
//    },
//    clkMn5_surfaceVDWContext: function() {
    $("#" + me.pre + "mn5_surfaceVDWContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'Van der Waals surface with context');
       me.setLogCmd('set surface Van der Waals surface with context', true);
    });
//    },
//    clkMn5_surfaceSASContext: function() {
    $("#" + me.pre + "mn5_surfaceSASContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'solvent accessible surface with context');
       me.setLogCmd('set surface solvent accessible surface with context', true);
    });
//    },
//    clkMn5_surfaceMolecularContext: function() {
    $("#" + me.pre + "mn5_surfaceMolecularContext").click(function(e) { var ic = me.icn3d;
       ic.bConsiderNeighbors = true;
       me.setOption('surface', 'molecular surface with context');
       me.setLogCmd('set surface molecular surface with context', true);
    });
//    },
//    clkMn5_surfaceNo: function() {
    $("#" + me.pre + "mn5_surfaceNo").click(function(e) { var ic = me.icn3d;
       me.setOption('surface', 'nothing');
       me.setLogCmd('set surface nothing', true);
    });
//    },

    $("." + me.pre + "mn5_opacity").each(function () {
       var value = $(this).attr('v');

       $(this).click(function(e) { var ic = me.icn3d;
           me.setOption('opacity', value);
           me.setLogCmd('set surface opacity ' + value, true);
       });
    });

//    clkMn5_wireframeYes: function() {
    $("#" + me.pre + "mn5_wireframeYes").click(function(e) { var ic = me.icn3d;
       me.setOption('wireframe', 'yes');
       me.setLogCmd('set surface wireframe on', true);
    });
//    },
//    clkMn5_wireframeNo: function() {
    $("#" + me.pre + "mn5_wireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('wireframe', 'no');
       me.setLogCmd('set surface wireframe off', true);
    });
//    },
//    clkMn5_elecmap2fofc: function() {
    $("#" + me.pre + "mn5_elecmap2fofc").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_elecmap2fofc', '2Fo-Fc Electron Density Map');
    });
//    },
//    clkMn5_elecmapfofc: function() {
    $("#" + me.pre + "mn5_elecmapfofc").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_elecmapfofc', 'Fo-Fc Electron Density Map');
    });
//    },
//    clkMn5_elecmapNo: function() {
    $("#" + me.pre + "mn5_elecmapNo").add("#" + me.pre + "elecmapNo2").add("#" + me.pre + "elecmapNo3").add("#" + me.pre + "elecmapNo4").add("#" + me.pre + "elecmapNo5").click(function(e) { var ic = me.icn3d;
       me.setOption('map', 'nothing');
       me.setLogCmd('setoption map nothing', true);
    });
//    },
    $("#" + me.pre + "delphimapNo").add("#" + me.pre + "phimapNo").add("#" + me.pre + "phiurlmapNo")
      .add("#" + me.pre + "mn1_phimapNo").click(function(e) { var ic = me.icn3d;
       me.setOption('phimap', 'nothing');
       me.setLogCmd('setoption phimap nothing', true);
    });

    $("#" + me.pre + "delphimapNo2").add("#" + me.pre + "phimapNo2").add("#" + me.pre + "phiurlmapNo2")
      .click(function(e) { var ic = me.icn3d;
       //me.setOption('surface', 'nothing');
       //me.setLogCmd('set surface nothing', true);
       me.setOption('phisurface', 'nothing');
       me.setLogCmd('setoption phisurface nothing', true);
    });

//    clickApplymap2fofc: function() {
    $("#" + me.pre + "applymap2fofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var sigma2fofc = parseFloat($("#" + me.pre + "sigma2fofc" ).val());
       var type = '2fofc';
       me.Dsn6Parser(me.inputid, type, sigma2fofc);
       //me.setOption('map', '2fofc');
       me.setLogCmd('set map 2fofc sigma ' + sigma2fofc, true);
    });
//    },
//    clickApplymapfofc: function() {
    $("#" + me.pre + "applymapfofc").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var sigmafofc = parseFloat($("#" + me.pre + "sigmafofc" ).val());
       var type = 'fofc';
       me.Dsn6Parser(me.inputid, type, sigmafofc);
       //me.setOption('map', 'fofc');
       me.setLogCmd('set map fofc sigma ' + sigmafofc, true);
    });
//    },
//    clkMn5_mapwireframeYes: function() {
    $("#" + me.pre + "mn5_mapwireframeYes").click(function(e) { var ic = me.icn3d;
       //me.Dsn6Parser(me.inputid);
       me.setOption('mapwireframe', 'yes');
       me.setLogCmd('set map wireframe on', true);
    });
//    },
//    clkMn5_mapwireframeNo: function() {
    $("#" + me.pre + "mn5_mapwireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('mapwireframe', 'no');
       me.setLogCmd('set map wireframe off', true);
    });
//    },
//    clkMn5_emmap: function() {
    $("#" + me.pre + "mn5_emmap").click(function(e) { var ic = me.icn3d;
       me.openDlg('dl_emmap', 'EM Density Map');
    });
//    },
//    clkMn5_emmapNo: function() {
    $("#" + me.pre + "mn5_emmapNo").add("#" + me.pre + "emmapNo2").click(function(e) { var ic = me.icn3d;
       me.setOption('emmap', 'nothing');
       me.setLogCmd('setoption emmap nothing', true);
    });
//    },
//    clickApplyemmap: function() {
    $("#" + me.pre + "applyemmap").click(function(e) { var ic = me.icn3d;
       e.preventDefault();
       //if(!me.cfg.notebook) dialog.dialog( "close" );
       var empercentage = parseFloat($("#" + me.pre + "empercentage" ).val());
       var type = 'em';
       //me.emd = 'emd-3906';
       if(iCn3DUI.prototype.DensityCifParser === undefined) {
           var url = me.baseUrl + "icn3d/script/density_cif_parser.min.js";
           $.ajax({
              url: url,
              dataType: "script",
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                   me.DensityCifParser(me.inputid, type, empercentage, ic.emd);
                   me.setLogCmd('set emmap percentage ' + empercentage, true);
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
              }
           });
       }
       else {
           me.DensityCifParser(me.inputid, type, empercentage, ic.emd);
           me.setLogCmd('set emmap percentage ' + empercentage, true);
       }
    });
//    },
//    clkMn5_emmapwireframeYes: function() {
    $("#" + me.pre + "mn5_emmapwireframeYes").click(function(e) { var ic = me.icn3d;
       //me.Dsn6Parser(me.inputid);
       me.setOption('emmapwireframe', 'yes');
       me.setLogCmd('set emmap wireframe on', true);
    });
//    },
//    clkMn5_emmapwireframeNo: function() {
    $("#" + me.pre + "mn5_emmapwireframeNo").click(function(e) { var ic = me.icn3d;
       me.setOption('emmapwireframe', 'no');
       me.setLogCmd('set emmap wireframe off', true);
    });
//    },
};
