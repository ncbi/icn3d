/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Alternate {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // change the display atom when alternating
    //Show structures one by one.
    alternateStructures() { let ic = this.icn3d, me = ic.icn3dui;
        ic.bAlternate = true;

        //ic.transformCls.zoominSelection();
        
        // default ic.ALTERNATE_STRUCTURE = -1
        if(ic.ALTERNATE_STRUCTURE == -1) {
            ic.viewSelectionAtoms = me.hashUtilsCls.cloneHash(ic.dAtoms);
        }

        let viewSelectionAtomsCount = Object.keys(ic.viewSelectionAtoms).length;
        let allAtomsCount = Object.keys(ic.atoms).length;

        //ic.dAtoms = {};

        // 1. alternate all structures
        //let moleculeArray = Object.keys(ic.structures);

        // 2. only alternate displayed structures
        let structureHash = {};
        for(let i in ic.viewSelectionAtoms) {
            let structure = ic.atoms[i].structure;
            structureHash[structure] = 1;
        }
        let moleculeArray = Object.keys(structureHash);

        ic.dAtoms = {};

        let bMutation = ic.bScap; //moleculeArray.length == 2 && moleculeArray[1].replace(moleculeArray[0], '') == '2';

        for(let i = 0, il = moleculeArray.length; i < il; ++i) {
            let structure = moleculeArray[i];
            //if(i > ic.ALTERNATE_STRUCTURE || (ic.ALTERNATE_STRUCTURE === il - 1 && i === 0) ) {
            let bChoose;
            if(ic.bShift) {
                // default ic.ALTERNATE_STRUCTURE = -1
                if(ic.ALTERNATE_STRUCTURE < 0) ic.ALTERNATE_STRUCTURE = 1;

                bChoose = (i == ic.ALTERNATE_STRUCTURE % il - 1) 
                  || (ic.ALTERNATE_STRUCTURE % il === 0 && i === il - 1);
            } 
            else {
                bChoose = (i == ic.ALTERNATE_STRUCTURE % il + 1) 
                  || (ic.ALTERNATE_STRUCTURE % il === il - 1 && i === 0);
            }

            if(bChoose) {
                for(let k in ic.structures[structure]) {
                    let chain = ic.structures[structure][k];
                    ic.dAtoms = me.hashUtilsCls.unionHash(ic.dAtoms, ic.chains[chain]);
                }

                //ic.ALTERNATE_STRUCTURE = i;
                if(ic.bShift) {
                    --ic.ALTERNATE_STRUCTURE;
                }
                else {
                    ++ic.ALTERNATE_STRUCTURE;
                }

                if(ic.ALTERNATE_STRUCTURE < 0) ic.ALTERNATE_STRUCTURE += il;

                let label = '';
                if(bMutation) {
                    if(i == 0) {
                        label = "Wild Type ";
                    }
                    else if(i == 1) {
                        label = "Mutant ";
                    }
                }

                $("#" + ic.pre + "title").html(label + structure);

                break;
            }
        } 

        if(viewSelectionAtomsCount < allAtomsCount) {
            let tmpAtoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.viewSelectionAtoms);
            if(Object.keys(tmpAtoms).length > 0) {
                ic.dAtoms = me.hashUtilsCls.cloneHash(tmpAtoms);
            }
            
            ic.bShowHighlight = false;
//            ic.opts['rotationcenter'] = 'highlight center';
        }

        // also alternating the surfaces
        ic.applyMapCls.removeSurfaces();
        ic.applyMapCls.applySurfaceOptions();

        ic.applyMapCls.removeMaps();
        ic.applyMapCls.applyMapOptions();

        ic.applyMapCls.removeEmmaps();
        ic.applyMapCls.applyEmmapOptions();

        // allow the alternation of DelPhi map
        /*
        // Option 1: recalculate =========
        ic.applyMapCls.removePhimaps();
        await ic.delphiCls.loadDelphiFile('delphi');

        ic.applyMapCls.removeSurfaces();
        await ic.delphiCls.loadDelphiFile('delphi2');
        // ==============
        */

        // Option 2: NO recalculate, just show separately =========
        ic.applyMapCls.removePhimaps();
        ic.applyMapCls.applyPhimapOptions();

        ic.applyMapCls.removeSurfaces();
        ic.applyMapCls.applyphisurfaceOptions();
        // ==============

        // alternate the PCA axes
        ic.axes = [];
        if(ic.pc1) {
           ic.axesCls.setPc1Axes();
        }

        //ic.glycanCls.showGlycans();

        // ic.opts['rotationcenter'] = 'highlight center';              

        // zoomin at the beginning

        if(ic.ALTERNATE_STRUCTURE == 0) { // default -1, so when it is 0, it is the first time
            ic.transformCls.zoominSelection();
        }

        //ic.transformCls.resetOrientation(); // reset camera view point
        // ic.drawCls.applyTransformation(ic._zoomFactor, ic.mouseChange, ic.quaternion);

        // ic.bNotSetCamera = true;
        ic.drawCls.draw();
        // ic.bNotSetCamera = false;

        ic.bShowHighlight = true; //reset
    }

    async alternateWrapper() { let ic = this.icn3d, me = ic.icn3dui;
       ic.bAlternate = true;
       this.alternateStructures();
       ic.bAlternate = false;
    }

}

export {Alternate}
