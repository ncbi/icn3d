/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applyChemicalbindingOptions = function (options) { var me = this, ic = me.icn3d; "use strict";
    if(options === undefined) options = this.opts;

    // display mode
    if (options.chemicalbinding === 'show') {
        var startAtoms;
        if(this.chemicals !== undefined && Object.keys(this.chemicals).length > 0) { // show chemical-protein interaction
            startAtoms = this.hash2Atoms(this.chemicals);
        }

        // find atoms in chainid1, which interact with chainid2
        var radius = 4;

        if(startAtoms !== undefined) {
            var targetAtoms = this.getAtomsWithinAtom(this.atoms, startAtoms, radius);

            // show hydrogens
            var threshold = 3.5;
            this.opts["hbonds"] = "yes";

            if(Object.keys(targetAtoms).length > 0) {
                this.calculateChemicalHbonds(startAtoms, targetAtoms, parseFloat(threshold) );
            }

            // zoom in on the atoms
            if(!this.bSetFog) this.zoominSelection( this.unionHash(startAtoms, targetAtoms) );
        }
    }
    else if (options.chemicalbinding === 'hide') {
        // truen off hdonds
        this.hideHbonds();

        // center on the atoms
        if(!this.bSetFog) this.zoominSelection(this.atoms);
    }
};

iCn3D.prototype.hideHbonds = function () { var me = this, ic = me.icn3d; "use strict";
        this.opts["hbonds"] = "no";
        if(this.lines === undefined) this.lines = {};
        this.lines['hbond'] = [];
        this.hbondpnts = [];

        for(var i in this.atoms) {
            this.atoms[i].style2 = 'nothing';
        }

        for(var i in this.sidec) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style2 = this.opts["sidec"];
            }
        }

        for(var i in this.water) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style = this.opts["water"];
            }
        }
};

iCn3D.prototype.hideSaltbridge = function () { var me = this, ic = me.icn3d; "use strict";
        this.opts["saltbridge"] = "no";
        if(this.lines === undefined) this.lines = {};
        this.lines['saltbridge'] = [];
        this.saltbridgepnts = [];

        for(var i in this.atoms) {
            this.atoms[i].style2 = 'nothing';
        }

        for(var i in this.sidec) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style2 = this.opts["sidec"];
            }
        }

        for(var i in this.water) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style = this.opts["water"];
            }
        }
};

iCn3D.prototype.hideContact = function () { var me = this, ic = me.icn3d; "use strict";
        this.opts["contact"] = "no";
        if(this.lines === undefined) this.lines = {};
        this.lines['contact'] = [];
        this.contactpnts = [];

        for(var i in this.atoms) {
            this.atoms[i].style2 = 'nothing';
        }

        for(var i in this.sidec) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style2 = this.opts["sidec"];
            }
        }

        for(var i in this.water) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style = this.opts["water"];
            }
        }
};

iCn3D.prototype.hideHalogenPi = function () { var me = this, ic = me.icn3d; "use strict";
        this.opts["halogen"] = "no";
        this.opts["pi-cation"] = "no";
        this.opts["pi-stacking"] = "no";
        if(this.lines === undefined) this.lines = {};
        this.lines['halogen'] = [];
        this.lines['pi-cation'] = [];
        this.lines['pi-stacking'] = [];
        this.halogenpnts = [];
        this.picationpnts = [];
        this.pistackingpnts = [];

        for(var i in this.atoms) {
            this.atoms[i].style2 = 'nothing';
        }

        for(var i in this.sidec) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style2 = this.opts["sidec"];
            }
        }

        for(var i in this.water) {
            if(this.hAtoms.hasOwnProperty(i)) {
                this.atoms[i].style = this.opts["water"];
            }
        }
};

iCn3D.prototype.setHbondsContacts = function (options, type) { var me = this, ic = me.icn3d; "use strict";
    var hbond_contact = type;
    var hbonds_contact = (type == 'hbond') ? 'hbonds' : type;

    this.lines[hbond_contact] = [];

    if (options[hbonds_contact].toLowerCase() === 'yes') {
        var color;
        var pnts;
        if(type == 'hbond') {
            pnts = this.hbondpnts;
            color = '#0F0';
        }
        else if(type == 'saltbridge') {
            pnts = this.saltbridgepnts;
            color = '#0FF';
        }
        else if(type == 'contact') {
            pnts = this.contactpnts;
            color = '#222';
        }
        else if(type == 'halogen') {
            pnts = this.halogenpnts;
            color = '#F0F';
        }
        else if(type == 'pi-cation') {
            pnts = this.picationpnts;
            color = '#F00';
        }
        else if(type == 'pi-stacking') {
            pnts = this.pistackingpnts;
            color = '#00F';
        }

         for (var i = 0, lim = Math.floor(pnts.length / 2); i < lim; i++) {
            var line = {};
            line.position1 = pnts[2 * i].coord;
            line.serial1 = pnts[2 * i].serial;
            line.position2 = pnts[2 * i + 1].coord;
            line.serial2 = pnts[2 * i + 1].serial;
            line.color = color;
            line.dashed = true;

            // only draw bonds connected with currently displayed atoms
            if(line.serial1 !== undefined && line.serial2 !== undefined && !this.dAtoms.hasOwnProperty(line.serial1) && !this.dAtoms.hasOwnProperty(line.serial2)) continue;

            //if(this.lines[hbond_contact] === undefined) this.lines[hbond_contact] = [];
            this.lines[hbond_contact].push(line);
         }
    }
};

