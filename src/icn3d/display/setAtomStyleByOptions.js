/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.hideLabels = function () { var me = this, ic = me.icn3d; "use strict";
    // remove previous labels
    if(this.mdl !== undefined) {
        for(var i = 0, il = this.mdl.children.length; i < il; ++i) {
             var mesh = this.mdl.children[i];
             if(mesh !== undefined && mesh.type === 'Sprite') {
                 this.mdl.remove(mesh); // somehow didn't work
             }
        }
    }
};

iCn3D.prototype.setStyle2Atoms = function (atoms) {
      this.style2atoms = {};

      for(var i in atoms) {
        // do not show water in assemly
        //if(this.bAssembly && this.water.hasOwnProperty(i)) {
        //    this.atoms[i].style = 'nothing';
        //}

        if(this.style2atoms[this.atoms[i].style] === undefined) this.style2atoms[this.atoms[i].style] = {};

        this.style2atoms[this.atoms[i].style][i] = 1;

        // side chains
        if(this.atoms[i].style2 !== undefined && this.atoms[i].style2 !== 'nothing') {
            if(this.style2atoms[this.atoms[i].style2] === undefined) this.style2atoms[this.atoms[i].style2] = {};

            this.style2atoms[this.atoms[i].style2][i] = 1;
        }
      }
};

// set atom style when loading a structure
iCn3D.prototype.setAtomStyleByOptions = function (options) {
    if(options === undefined) options = this.opts;

    var selectedAtoms;

    if (options.proteins !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.proteins);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.proteins.toLowerCase();
        }
    }

    // side chain use style2
    if (options.sidec !== undefined && options.sidec !== 'nothing') {
        selectedAtoms = this.intHash(this.hAtoms, this.sidec);
        //var sidec_calpha = this.unionHash(this.calphas, this.sidec);
        //selectedAtoms = this.intHash(this.hAtoms, sidec_calpha);

        for(var i in selectedAtoms) {
          this.atoms[i].style2 = options.sidec.toLowerCase();
        }
    }

    if (options.chemicals !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.chemicals);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.chemicals.toLowerCase();
        }
    }

    if (options.ions !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.ions);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.ions.toLowerCase();
        }
    }

    if (options.water !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.water);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.water.toLowerCase();
        }
    }

    if (options.nucleotides !== undefined) {
        selectedAtoms = this.intHash(this.hAtoms, this.nucleotides);
        for(var i in selectedAtoms) {
          this.atoms[i].style = options.nucleotides.toLowerCase();
        }
    }
};
