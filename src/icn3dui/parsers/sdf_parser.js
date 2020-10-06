/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadCid = function (cid) { var me = this, ic = me.icn3d; "use strict";
    var uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/record/SDF/?record_type=3d&response_type=display";

    me.setYourNote('PubChem CID ' + cid + ' in iCn3D');

    me.opts['pk'] = 'atom';
    me.opts['chemicals'] = 'ball and stick';

    ic.opts['pk'] = 'atom';
    ic.opts['chemicals'] = 'ball and stick';

    ic.bCid = true;

    $.ajax({
      url: uri,
      dataType: 'text',
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      beforeSend: function() {
          me.showLoading();
      },
      complete: function() {
          //me.hideLoading();
      },
      success: function(data) {
        var bResult = me.loadSdfAtomData(data, cid);

        if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The SDF of CID ' + cid + ' has the wrong format...');
        }
        else {

          ic.setAtomStyleByOptions(me.opts);
          ic.setColorByOptions(me.opts, ic.atoms);

          me.renderStructure();

          if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

          //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
        }
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
    })
    .fail(function() {
        alert( "This CID may not have 3D structure..." );
    });
};

iCn3DUI.prototype.loadSdfData = function(data) { var me = this, ic = me.icn3d; "use strict";
    var bResult = me.loadSdfAtomData(data);

    if(me.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    if(!bResult) {
      alert('The SDF file has the wrong format...');
    }
    else {
      ic.setAtomStyleByOptions(me.opts);
      ic.setColorByOptions(me.opts, ic.atoms);

      me.renderStructure();

      if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

      //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    }
};

iCn3DUI.prototype.loadSdfAtomData = function (data, cid) { var me = this, ic = me.icn3d; "use strict";
    var lines = data.split(/\r?\n|\r/);
    if (lines.length < 4) return false;

    ic.init();

    var structure = cid ? cid : 1;
    var chain = 'A';
    var resi = 1;
    var resn = 'LIG';

    var moleculeNum = structure;
    var chainNum = structure + '_' + chain;
    var residueNum = chainNum + '_' + resi;

    var atomCount = parseInt(lines[3].substr(0, 3));
    if (isNaN(atomCount) || atomCount <= 0) return false;

    var bondCount = parseInt(lines[3].substr(3, 3));
    var offset = 4;
    if (lines.length < offset + atomCount + bondCount) return false;

    var start = 0;
    var end = atomCount;
    var i, line;

    var atomid2serial = {};
    var HAtomids = {};

    var AtomHash = {};
    var serial = 1;
    for (i = start; i < end; i++) {
        line = lines[offset];
        offset++;

        //var name = line.substr(31, 3).replace(/ /g, "");
        var name = line.substr(31, 3).trim();

        //if(name !== 'H') {
            var x = parseFloat(line.substr(0, 10));
            var y = parseFloat(line.substr(10, 10));
            var z = parseFloat(line.substr(20, 10));
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

            atomid2serial[i] = serial;

            ++serial;
        //}
        //else {
            if(name == 'H') HAtomids[i] = 1;
        //}
    }

    ic.dAtoms = AtomHash;
    ic.hAtoms= AtomHash;
    ic.structures[moleculeNum] = [chainNum]; //AtomHash;
    ic.chains[chainNum] = AtomHash;
    ic.residues[residueNum] = AtomHash;

    ic.residueId2Name[residueNum] = resn;

    if(ic.chainsSeq[chainNum] === undefined) ic.chainsSeq[chainNum] = [];

    var resObject = {};
    resObject.resi = resi;
    resObject.name = resn;

    ic.chainsSeq[chainNum].push(resObject);

    for (i = 0; i < bondCount; i++) {
        line = lines[offset];
        offset++;
        var fromAtomid = parseInt(line.substr(0, 3)) - 1 + start;
        var toAtomid = parseInt(line.substr(3, 3)) - 1 + start;
        //var order = parseInt(line.substr(6, 3));
        var order = line.substr(6, 3).trim();

        //if(!HAtomids.hasOwnProperty(fromAtomid) && !HAtomids.hasOwnProperty(toAtomid)) {
            var from = atomid2serial[fromAtomid];
            var to = atomid2serial[toAtomid];

            ic.atoms[from].bonds.push(to);
            ic.atoms[from].bondOrder.push(order);
            ic.atoms[to].bonds.push(from);
            ic.atoms[to].bondOrder.push(order);

            if(!HAtomids.hasOwnProperty(fromAtomid) && !HAtomids.hasOwnProperty(toAtomid)) {
                if(order == '2') {
                    ic.doublebonds[from + '_' + to] = 1;
                    ic.doublebonds[to + '_' + from] = 1;
                }
                else if(order == '3') {
                    ic.triplebonds[from + '_' + to] = 1;
                    ic.triplebonds[to + '_' + from] = 1;
                }
            }
    }

    // read partial charge
    var bCrg = false;
    for(var il = lines.length; offset < il; ++offset) {
        if(lines[offset].indexOf('PARTIAL_CHARGES') != -1) {
            bCrg = true;
            break;
        }
        else {
            continue;
        }
    }

    if(bCrg) {
        ++offset;
        var crgCnt = parseInt(lines[offset]);

        ++offset;
        for(i = 0; i < crgCnt; ++i, ++offset) {
            line = lines[offset];
            var serial_charge = line.split(' ');
            var sTmp = parseInt(serial_charge[0]);
            var crg = parseFloat(serial_charge[1]);
            ic.atoms[sTmp].crg = crg;
        }
    }

    // backup bonds
    for(i in ic.atoms) {
        if(ic.atoms[i].name !== 'H') { // only need to deal with non-hydrogen atoms
            ic.atoms[i].bonds2 = ic.atoms[i].bonds.concat();
            ic.atoms[i].bondOrder2 = ic.atoms[i].bondOrder.concat();
        }
    }

    me.setMaxD();

    me.showTitle();

    return true;
};

iCn3DUI.prototype.setMaxD = function () { var me = this, ic = me.icn3d; "use strict";
    var pmin = new THREE.Vector3( 9999, 9999, 9999);
    var pmax = new THREE.Vector3(-9999,-9999,-9999);
    var psum = new THREE.Vector3();
    var cnt = 0;
    // assign atoms
    for (var i in ic.atoms) {
        var atom = ic.atoms[i];
        var coord = atom.coord;
        psum.add(coord);
        pmin.min(coord);
        pmax.max(coord);
        ++cnt;

        if(atom.het) {
          //if($.inArray(atom.elem, ic.ionsArray) !== -1) {
          if(atom.bonds.length == 0) {
            ic.ions[atom.serial] = 1;
          }
          else {
            ic.chemicals[atom.serial] = 1;
          }
        }
    } // end of for


    ic.pmin = pmin;
    ic.pmax = pmax;

    ic.cnt = cnt;

    ic.maxD = ic.pmax.distanceTo(ic.pmin);
    ic.center = psum.multiplyScalar(1.0 / ic.cnt);

    if (ic.maxD < 5) ic.maxD = 5;
    ic.oriMaxD = ic.maxD;
    ic.oriCenter = ic.center.clone();
};
