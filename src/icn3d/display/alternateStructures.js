/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// change the display atom when alternating
iCn3D.prototype.alternateStructures = function () { var me = this, ic = me.icn3d; "use strict";
    var hAtomsCount = Object.keys(this.hAtoms).length;
    var allAtomsCount = Object.keys(this.atoms).length;

    this.dAtoms = {};

    var moleculeArray = Object.keys(this.structures);
    for(var i = 0, il = moleculeArray.length; i < il; ++i) {
        var structure = moleculeArray[i];
        if(i > this.ALTERNATE_STRUCTURE || (this.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
            for(var k in this.structures[structure]) {
                var chain = this.structures[structure][k];
                this.dAtoms = this.unionHash(this.dAtoms, this.chains[chain]);
            }

            this.ALTERNATE_STRUCTURE = i;
            break;
        }
    }

    if(hAtomsCount < allAtomsCount) {
        this.dAtoms = this.intHash(this.dAtoms, this.hAtoms);

        this.bShowHighlight = false;
        this.opts['rotationcenter'] = 'highlight center';
    }

    // also alternating the surfaces
    this.removeSurfaces();
    this.applySurfaceOptions();

    this.removeMaps();
    this.applyMapOptions();

    this.removeEmmaps();
    this.applyEmmapOptions();

// disallow the alternation of DelPhi map
    this.removePhimaps();
//    this.applyPhimapOptions();
    // should recalculate the potential
    //me.loadDelphiFileBase('delphi');

//    this.removeSurfaces();
//    this.applyphisurfaceOptions();
    // should recalculate the potential
    //me.loadDelphiFileBase('delphi2');

    // alternate the PCA axes
    this.axes = [];
    if(this.pc1) {
       this.setPc1Axes();
    }

    //this.showGlycans();

    this.draw();

    this.bShowHighlight = true;
    this.opts['rotationcenter'] = 'molecule center';
};
