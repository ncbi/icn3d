/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadCid = function (cid) { var me = this;
    var uri = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + cid + "/record/SDF/?record_type=3d&response_type=display";

    me.opts['pk'] = 'atom';
    me.opts['chemicals'] = 'ball and stick';

    me.icn3d.opts['pk'] = 'atom';
    me.icn3d.opts['chemicals'] = 'ball and stick';

    me.icn3d.bCid = true;

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
          me.hideLoading();
      },
      success: function(data) {
        var bResult = me.loadSdfAtomData(data, cid);

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        if(!bResult) {
          alert('The SDF of CID ' + cid + ' has the wrong format...');
        }
        else {

          me.icn3d.setAtomStyleByOptions(me.opts);
          me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

          me.renderStructure();

          if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

          if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
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

iCn3DUI.prototype.loadSdfData = function(data) {
    var me = this;

    var bResult = me.loadSdfAtomData(data);

    if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    if(!bResult) {
      alert('The SDF file has the wrong format...');
    }
    else {
      me.icn3d.setAtomStyleByOptions(me.opts);
      me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

      me.renderStructure();

      if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

      if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    }
};

iCn3DUI.prototype.loadSdfAtomData = function (data, cid) { var me = this;
    var lines = data.split(/\r?\n|\r/);
    if (lines.length < 4) return false;

    me.icn3d.init();

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
    var skipAtomids = {}; // skip hydrgen atom

    var AtomHash = {};
    var serial = 1;
    for (i = start; i < end; i++) {
        line = lines[offset];
        offset++;

        var name = line.substr(31, 3).replace(/ /g, "");

        if(name !== 'H') {
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

            me.icn3d.atoms[serial] = atomDetails;
            AtomHash[serial] = 1;

            atomid2serial[i] = serial;

            ++serial;
        }
        else {
            skipAtomids[i] = 1;
        }
    }

    me.icn3d.dAtoms = AtomHash;
    me.icn3d.hAtoms= AtomHash;
    me.icn3d.structures[moleculeNum] = [chainNum]; //AtomHash;
    me.icn3d.chains[chainNum] = AtomHash;
    me.icn3d.residues[residueNum] = AtomHash;

    me.icn3d.residueId2Name[residueNum] = resn;

    if(me.icn3d.chainsSeq[chainNum] === undefined) me.icn3d.chainsSeq[chainNum] = [];
/*
    if(me.icn3d.chainsAn[chainNum] === undefined ) me.icn3d.chainsAn[chainNum] = [];
    if(me.icn3d.chainsAn[chainNum][0] === undefined ) me.icn3d.chainsAn[chainNum][0] = [];
    if(me.icn3d.chainsAnTitle[chainNum] === undefined ) me.icn3d.chainsAnTitle[chainNum] = [];
    if(me.icn3d.chainsAnTitle[chainNum][0] === undefined ) me.icn3d.chainsAnTitle[chainNum][0] = [];
*/
      var resObject = {};
      resObject.resi = resi;
      resObject.name = resn;

    me.icn3d.chainsSeq[chainNum].push(resObject);
//        me.icn3d.chainsAn[chainNum][0].push(resi);
//        me.icn3d.chainsAnTitle[chainNum][0].push('');

    for (i = 0; i < bondCount; i++) {
        line = lines[offset];
        offset++;
        var fromAtomid = parseInt(line.substr(0, 3)) - 1 + start;
        var toAtomid = parseInt(line.substr(3, 3)) - 1 + start;
        //var order = parseInt(line.substr(6, 3));
        var order = line.substr(6, 3).trim();

        if(!skipAtomids.hasOwnProperty(fromAtomid) && !skipAtomids.hasOwnProperty(toAtomid)) {
            var from = atomid2serial[fromAtomid];
            var to = atomid2serial[toAtomid];

            me.icn3d.atoms[from].bonds.push(to);
            me.icn3d.atoms[from].bondOrder.push(order);
            me.icn3d.atoms[to].bonds.push(from);
            me.icn3d.atoms[to].bondOrder.push(order);
            if(order == '2') {
                me.icn3d.doublebonds[from + '_' + to] = 1;
                me.icn3d.doublebonds[to + '_' + from] = 1;
            }
            else if(order == '3') {
                me.icn3d.triplebonds[from + '_' + to] = 1;
                me.icn3d.triplebonds[to + '_' + from] = 1;
            }
        }
    }

    me.setMaxD();

    me.showTitle();

    return true;
};

iCn3DUI.prototype.setMaxD = function () { var me = this;
    var pmin = new THREE.Vector3( 9999, 9999, 9999);
    var pmax = new THREE.Vector3(-9999,-9999,-9999);
    var psum = new THREE.Vector3();
    var cnt = 0;
    // assign atoms
    for (var i in me.icn3d.atoms) {
        var atom = me.icn3d.atoms[i];
        var coord = atom.coord;
        psum.add(coord);
        pmin.min(coord);
        pmax.max(coord);
        ++cnt;

        if(atom.het) {
          if($.inArray(atom.elem, me.icn3d.ionsArray) !== -1) {
            me.icn3d.ions[atom.serial] = 1;
          }
          else {
            me.icn3d.chemicals[atom.serial] = 1;
          }
        }
    } // end of for


    me.icn3d.pmin = pmin;
    me.icn3d.pmax = pmax;

    me.icn3d.cnt = cnt;

    me.icn3d.maxD = me.icn3d.pmax.distanceTo(me.icn3d.pmin);
    me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

    if (me.icn3d.maxD < 5) me.icn3d.maxD = 5;
    me.icn3d.oriMaxD = me.icn3d.maxD;
    me.icn3d.oriCenter = me.icn3d.center.clone();
};
