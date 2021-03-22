/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.clickMenu3 = function() { var me = this, ic = me.icn3d; "use strict";
// mn 3
//    clkMn3_proteinsRibbon: function() {
    $("#" + me.pre + "mn3_proteinsRibbon").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'ribbon');
       me.setLogCmd('style proteins ribbon', true);
    });
//    },
//    clkMn3_proteinsStrand: function() {
    $("#" + me.pre + "mn3_proteinsStrand").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'strand');
       me.setLogCmd('style proteins strand', true);
    });
//    },
//    clkMn3_proteinsCylinder: function() {
    $("#" + me.pre + "mn3_proteinsCylinder").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'cylinder and plate');
       me.setLogCmd('style proteins cylinder and plate', true);
    });
//    },
//    clkMn3_proteinsSchematic: function() {
    $("#" + me.pre + "mn3_proteinsSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'schematic');
       me.setLogCmd('style proteins schematic', true);
    });
//    },
//    clkMn3_proteinsCalpha: function() {
    $("#" + me.pre + "mn3_proteinsCalpha").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'c alpha trace');
       me.setLogCmd('style proteins c alpha trace', true);
    });
//    },
//    clkMn3_proteinsBackbone: function() {
    $("#" + me.pre + "mn3_proteinsBackbone").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'backbone');
       me.setLogCmd('style proteins backbone', true);
    });
//    },
//    clkMn3_proteinsBfactor: function() {
    $("#" + me.pre + "mn3_proteinsBfactor").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'b factor tube');
       me.setLogCmd('style proteins b factor tube', true);
    });
//    },
//    clkMn3_proteinsLines: function() {
    $("#" + me.pre + "mn3_proteinsLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'lines');
       me.setLogCmd('style proteins lines', true);
    });
//    },
//    clkMn3_proteinsStick: function() {
    $("#" + me.pre + "mn3_proteinsStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'stick');
       me.setLogCmd('style proteins stick', true);
    });
//    },
//    clkMn3_proteinsBallstick: function() {
    $("#" + me.pre + "mn3_proteinsBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'ball and stick');
       me.setLogCmd('style proteins ball and stick', true);
    });
//    },
//    clkMn3_proteinsSphere: function() {
    $("#" + me.pre + "mn3_proteinsSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'sphere');
       me.setLogCmd('style proteins sphere', true);
    });
//    },
//    clkMn3_proteinsNo: function() {
    $("#" + me.pre + "mn3_proteinsNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('proteins', 'nothing');
       me.setLogCmd('style proteins nothing', true);
    });
//    },
//    clkMn3_sidecLines: function() {
    $("#" + me.pre + "mn3_sidecLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'lines');
       me.setLogCmd('style sidec lines', true);
    });
//    },
//    clkMn3_sidecStick: function() {
    $("#" + me.pre + "mn3_sidecStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'stick');
       me.setLogCmd('style sidec stick', true);
    });
//    },
//    clkMn3_sidecBallstick: function() {
    $("#" + me.pre + "mn3_sidecBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'ball and stick');
       me.setLogCmd('style sidec ball and stick', true);
    });
//    },
//    clkMn3_sidecSphere: function() {
    $("#" + me.pre + "mn3_sidecSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'sphere');
       me.setLogCmd('style sidec sphere', true);
    });
//    },
//    clkMn3_sidecNo: function() {
    $("#" + me.pre + "mn3_sidecNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('sidec', 'nothing');
       me.setLogCmd('style sidec nothing', true);
    });
//    },
//    clkMn3_nuclCartoon: function() {
    $("#" + me.pre + "mn3_nuclCartoon").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'nucleotide cartoon');
       me.setLogCmd('style nucleotides nucleotide cartoon', true);
   });
//    },
//    clkMn3_nuclBackbone: function() {
    $("#" + me.pre + "mn3_nuclBackbone").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'backbone');
       me.setLogCmd('style nucleotides backbone', true);
    });
//    },
//    clkMn3_nuclSchematic: function() {
    $("#" + me.pre + "mn3_nuclSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'schematic');
       me.setLogCmd('style nucleotides schematic', true);
    });
//    },
//    clkMn3_nuclPhos: function() {
    $("#" + me.pre + "mn3_nuclPhos").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'o3 trace');
       me.setLogCmd('style nucleotides o3 trace', true);
    });
//    },
//    clkMn3_nuclLines: function() {
    $("#" + me.pre + "mn3_nuclLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'lines');
       me.setLogCmd('style nucleotides lines', true);
    });
//    },
//    clkMn3_nuclStick: function() {
    $("#" + me.pre + "mn3_nuclStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'stick');
       me.setLogCmd('style nucleotides stick', true);
    });
//    },
//    clkMn3_nuclBallstick: function() {
    $("#" + me.pre + "mn3_nuclBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'ball and stick');
       me.setLogCmd('style nucleotides ball and stick', true);
    });
//    },
//    clkMn3_nuclSphere: function() {
    $("#" + me.pre + "mn3_nuclSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'sphere');
       me.setLogCmd('style nucleotides sphere', true);
    });
//    },
//    clkMn3_nuclNo: function() {
    $("#" + me.pre + "mn3_nuclNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('nucleotides', 'nothing');
       me.setLogCmd('style nucleotides nothing', true);
    });
//    },
//    clkMn3_ligLines: function() {
    $("#" + me.pre + "mn3_ligLines").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'lines');
       me.setLogCmd('style chemicals lines', true);
    });
//    },
//    clkMn3_ligStick: function() {
    $("#" + me.pre + "mn3_ligStick").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'stick');
       me.setLogCmd('style chemicals stick', true);
    });
//    },
//    clkMn3_ligBallstick: function() {
    $("#" + me.pre + "mn3_ligBallstick").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'ball and stick');
       me.setLogCmd('style chemicals ball and stick', true);
    });
//    },
//    clkMn3_ligSchematic: function() {
    $("#" + me.pre + "mn3_ligSchematic").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'schematic');
       me.setLogCmd('style chemicals schematic', true);
    });
//    },
//    clkMn3_ligSphere: function() {
    $("#" + me.pre + "mn3_ligSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'sphere');
       me.setLogCmd('style chemicals sphere', true);
    });
//    },
//    clkMn3_ligNo: function() {
    $("#" + me.pre + "mn3_ligNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('chemicals', 'nothing');
       me.setLogCmd('style chemicals nothing', true);
    });
//    },

    $("#" + me.pre + "mn3_glycansCartYes").click(function(e) { var ic = me.icn3d;
       ic.bGlycansCartoon = true;
       ic.draw();
       me.setLogCmd('glycans cartoon yes', true);
    });
    $("#" + me.pre + "mn3_glycansCartNo").click(function(e) { var ic = me.icn3d;
       ic.bGlycansCartoon = false;
       ic.draw();
       me.setLogCmd('glycans cartoon no', true);
    });


//    clkMn3_hydrogensYes: function() {
    $("#" + me.pre + "mn3_hydrogensYes").click(function(e) { var ic = me.icn3d;
       me.showHydrogens();
       ic.draw();
       me.setLogCmd('hydrogens', true);
    });
//    },
//    clkMn3_hydrogensNo: function() {
    $("#" + me.pre + "mn3_hydrogensNo").click(function(e) { var ic = me.icn3d;
       me.hideHydrogens();
       ic.draw();
       me.setLogCmd('set hydrogens off', true);
    });
//    },
//    clkMn3_ionsSphere: function() {
    $("#" + me.pre + "mn3_ionsSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'sphere');
       me.setLogCmd('style ions sphere', true);
    });
//    },
//    clkMn3_ionsDot: function() {
    $("#" + me.pre + "mn3_ionsDot").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'dot');
       me.setLogCmd('style ions dot', true);
    });
//    },
//    clkMn3_ionsNo: function() {
    $("#" + me.pre + "mn3_ionsNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('ions', 'nothing');
       me.setLogCmd('style ions nothing', true);
    });
//    },
//    clkMn3_waterSphere: function() {
    $("#" + me.pre + "mn3_waterSphere").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'sphere');
       me.setLogCmd('style water sphere', true);
    });
//    },
//    clkMn3_waterDot: function() {
    $("#" + me.pre + "mn3_waterDot").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'dot');
       me.setLogCmd('style water dot', true);
    });
//    },
//    clkMn3_waterNo: function() {
    $("#" + me.pre + "mn3_waterNo").click(function(e) { var ic = me.icn3d;
       me.setStyle('water', 'nothing');
       me.setLogCmd('style water nothing', true);
    });
//    },
};
