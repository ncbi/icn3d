/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadXyzData = function(data) { var me = this, ic = me.icn3d; "use strict";
    var bResult = me.loadXyzAtomData(data);

    if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    if(!bResult) {
      alert('The XYZ file has the wrong format...');
    }
    else {
      ic.setAtomStyleByOptions(me.opts);
      ic.setColorByOptions(me.opts, ic.atoms);

      me.renderStructure();

      if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

      //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    }
};

iCn3DUI.prototype.setXyzAtomSeq = function (AtomHash, moleculeNum, chainNum, residueNum) { var me = this, ic = me.icn3d; "use strict";
    ic.dAtoms = ic.unionHash(ic.dAtoms, AtomHash);
    ic.hAtoms= ic.unionHash(ic.hAtoms, AtomHash);

    ic.structures[moleculeNum] = [chainNum]; //AtomHash;
    ic.chains[chainNum] = AtomHash;
    ic.residues[residueNum] = AtomHash;

    ic.residueId2Name[residueNum] = 'LIG';

    if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

    var resObject = {};
    resObject.resi = 1;
    resObject.name = 'LIG';

    ic.chainsSeq[chainNum].push(resObject);

    // determine bonds
    var serialArray = Object.keys(AtomHash);
    for(var j = 0, jl = serialArray.length; j < jl; ++j) {
        var atom0 = ic.atoms[serialArray[j]];

        for(var k = j + 1, kl = serialArray.length; k < kl; ++k) {
            var atom1 = ic.atoms[serialArray[k]];
            var maxR = 1.2 * (ic.covalentRadii[atom0.elem.toUpperCase()] + ic.covalentRadii[atom1.elem.toUpperCase()]);
            if(Math.abs(atom0.coord.x - atom1.coord.x) > maxR) continue;
            if(Math.abs(atom0.coord.y - atom1.coord.y) > maxR) continue;
            if(Math.abs(atom0.coord.z - atom1.coord.z) > maxR) continue;

            if(ic.hasCovalentBond(atom0, atom1)) {
                ic.atoms[serialArray[j]].bonds.push(serialArray[k]);
                ic.atoms[serialArray[k]].bonds.push(serialArray[j]);
            }
        }
    }
},

iCn3DUI.prototype.loadXyzAtomData = function (data) { var me = this, ic = me.icn3d; "use strict";
    var lines = data.split(/\r?\n|\r/);
    if (lines.length < 3) return false;

    ic.init();

    var chain = 'A';
    var resn = 'LIG';
    var resi = 1;

    var AtomHash = {};
    var moleculeNum = 0, chainNum, residueNum;
    var structure, atomCount, serial=1, offset = 2;

    ic.molTitle = "";

    for (var i = 0, il = lines.length; i < il; ++i) {
        var line = lines[i].trim();
        if(line === '') continue;

        if(line !== '' && !isNaN(line)) { // start a new molecule
            if(i !== 0) {
                me.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);
            }

            ++moleculeNum;
            AtomHash = {};

            structure = moleculeNum;
            chainNum = structure + '_' + chain;
            residueNum = chainNum + '_' + resi;

//12
//glucose from 2gbp
//C  35.884  30.895  49.120

            atomCount = parseInt(line);
            if(moleculeNum > 1) {
                ic.molTitle += "; ";
            }
            ic.molTitle += lines[i+1].trim();

            i = i + offset;
        }

        line = lines[i].trim();
        if(line === '') continue;

        var name_x_y_z = line.replace(/,/, " ").replace(/\s+/g, " ").split(" ");

        var name = name_x_y_z[0];
        var x = parseFloat(name_x_y_z[1]);
        var y = parseFloat(name_x_y_z[2]);
        var z = parseFloat(name_x_y_z[3]);
        var coord = new THREE.Vector3(x, y, z);

        var atomDetails = {
            het: true,              // optional, used to determine chemicals, water, ions, etc
            serial: serial,         // required, unique atom id
            name: name,             // required, atom name
            resn: resn,             // optional, used to determine protein or nucleotide
            structure: structure,   // optional, used to identify structure
            chain: chain,           // optional, used to identify chain
            resi: resi,             // optional, used to identify residue ID
            coord: coord,           // required, used to draw 3D shape
            b: 0,                   // optional, used to draw B-factor tube
            elem: name,             // optional, used to determine hydrogen bond
            bonds: [],              // required, used to connect atoms
            ss: 'coil',             // optional, used to show secondary structures
            ssbegin: false,         // optional, used to show the beginning of secondary structures
            ssend: false,           // optional, used to show the end of secondary structures

            bondOrder: []           // optional, specific for chemicals
        };

        ic.atoms[serial] = atomDetails;
        AtomHash[serial] = 1;

        ++serial;
    }

    me.setXyzAtomSeq(AtomHash, moleculeNum, chainNum, residueNum);

    me.setMaxD();

    me.showTitle();

    return true;
};
