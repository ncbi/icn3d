/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadOpm = function (opmid) { var me = this, ic = me.icn3d; "use strict";
   var url, dataType;

   url = "https://opm-assets.storage.googleapis.com/pdb/" + opmid.toLowerCase()+ ".pdb";

   me.setYourNote(opmid.toUpperCase() + ' (OPM) in iCn3D');

   dataType = "text";

   ic.bCid = undefined;

   // no rotation
   ic.bStopRotate = true;

   $.ajax({
      url: url,
      dataType: dataType,
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
          ic.bOpm = true;
          me.loadPdbData(data, opmid, ic.bOpm);

          $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
          $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

          $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
          $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        alert("This is probably not a transmembrane protein. It has no data in Orientations of Proteins in Membranes (OPM) database.");
        return;
      }
   });
};

iCn3DUI.prototype.addOneDumAtom = function(pdbid, atomName, x, y, z, lastSerial) { var me = this, ic = me.icn3d; "use strict";
      var resn = 'DUM';
      var chain = 'MEM';
      var resi = 1;
      var coord = new THREE.Vector3(x, y, z);

      var atomDetails = {
          het: true, // optional, used to determine chemicals, water, ions, etc
          serial: ++lastSerial,         // required, unique atom id
          name: atomName,             // required, atom name
          alt: undefined,               // optional, some alternative coordinates
          resn: resn,             // optional, used to determine protein or nucleotide
          structure: pdbid,   // optional, used to identify structure
          chain: chain,           // optional, used to identify chain
          resi: resi,             // optional, used to identify residue ID
          coord: coord,           // required, used to draw 3D shape
          b: undefined, // optional, used to draw B-factor tube
          elem: atomName,             // optional, used to determine hydrogen bond
          bonds: [],              // required, used to connect atoms
          ss: '',             // optional, used to show secondary structures
          ssbegin: false,         // optional, used to show the beginning of secondary structures
          ssend: false,            // optional, used to show the end of secondary structures
          color: ic.atomColors[atomName]
      };
      ic.atoms[lastSerial] = atomDetails;

      ic.chains[pdbid + '_MEM'][lastSerial] = 1;
      ic.residues[pdbid + '_MEM_1'][lastSerial] = 1;

      ic.chemicals[lastSerial] = 1;

      ic.dAtoms[lastSerial] = 1;
      ic.hAtoms[lastSerial] = 1;

      return lastSerial;
};

iCn3DUI.prototype.addMemAtoms = function(dmem, pdbid, dxymax) { var me = this, ic = me.icn3d; "use strict";
      var npoint=40; // points in radius
      var step = 2;
      var maxpnt=2*npoint+1; // points in diameter
      var fn=step*npoint; // center point

      //var dxymax = npoint / 2.0 * step;

      pdbid = (pdbid) ? pdbid.toUpperCase() : 'stru';

      ic.structures[pdbid].push(pdbid + '_MEM');
      ic.chains[pdbid + '_MEM'] = {};
      ic.residues[pdbid + '_MEM_1'] = {};

      ic.chainsSeq[pdbid + '_MEM'] = [{'name':'DUM', 'resi': 1}];

      var m=0;
      var lastSerial = Object.keys(ic.atoms).length;
      for(var i = 0; i < 1000; ++i) {
          if(!ic.atoms.hasOwnProperty(lastSerial + i)) {
              lastSerial = lastSerial + i - 1;
              break;
          }
      }

      for(var i=0; i < maxpnt; ++i) {
         for(var j=0; j < maxpnt; ++j) {
            ++m;
            var a=step*i-fn;
            var b=step*j-fn;
            var dxy=Math.sqrt(a*a+b*b);
            if(dxy < dxymax) {
                  var c=-dmem-0.4;
                  // Resn: DUM, name: N, a,b,c
                  lastSerial = me.addOneDumAtom(pdbid, 'N', a, b, c, lastSerial);

                  c=dmem+0.4;
                  // Resn: DUM, name: O, a,b,c
                  lastSerial = me.addOneDumAtom(pdbid, 'O', a, b, c, lastSerial);
            }
         }
      }
};

iCn3DUI.prototype.transformToOpmOri = function(pdbid) { var me = this, ic = me.icn3d; "use strict";
  // apply matrix for each atom
  if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
      var rot = ic.rmsd_supr.rot;
      var centerFrom = ic.rmsd_supr.trans1;
      var centerTo = ic.rmsd_supr.trans2;
      var rmsd = ic.rmsd_supr.rmsd;

      var dxymaxsq = 0;
      for(var i in ic.atoms) {
        var atom = ic.atoms[i];

        atom.coord = ic.transformMemPro(atom.coord, rot, centerFrom, centerTo);
        var xysq = atom.coord.x * atom.coord.x + atom.coord.y * atom.coord.y;
        if(Math.abs(atom.coord.z) <= 25 && xysq > dxymaxsq) {
            dxymaxsq = xysq;
        }
      }

      //ic.center = chainresiCalphaHash2.center;
      //ic.oriCenter = ic.center.clone();

      // add membranes
      // the membrane atoms belongs to the structure "pdbid"
      me.addMemAtoms(ic.halfBilayerSize, pdbid, Math.sqrt(dxymaxsq));

      // no rotation
      ic.bStopRotate = true;

      ic.bOpm = true;

      // show transmembrane features
      $("#" + me.pre + "togglememli").show();
      $("#" + me.pre + "adjustmemli").show();
      $("#" + me.pre + "selectplaneli").show();
      $("#" + me.pre + "anno_transmemli").show();
  }
  else {
      ic.bOpm = false;
  }
};

iCn3DUI.prototype.transformToOpmOriForAlign = function(pdbid, chainresiCalphaHash2, bResi_ori) { var me = this, ic = me.icn3d; "use strict";
  if(chainresiCalphaHash2 !== undefined) {
      var chainresiCalphaHash1 = ic.getChainCalpha(ic.chains, ic.atoms, bResi_ori, pdbid);

      var bOneChain = (Object.keys(chainresiCalphaHash1.chainresiCalphaHash).length == 1 || Object.keys(chainresiCalphaHash2.chainresiCalphaHash).length == 1) ? true : false;

      var coordsFrom = [], coordsTo = [];
      for(var chain in chainresiCalphaHash1.chainresiCalphaHash) {
          if(chainresiCalphaHash2.chainresiCalphaHash.hasOwnProperty(chain)) {
              var coord1 = chainresiCalphaHash1.chainresiCalphaHash[chain];
              var coord2 = chainresiCalphaHash2.chainresiCalphaHash[chain];

              if(coord1.length == coord2.length || bOneChain) {
                  coordsFrom = coordsFrom.concat(coord1);
                  coordsTo = coordsTo.concat(coord2);
              }

              if(coordsFrom.length > 500) break; // no need to use all c-alpha
          }
      }

      //var n = coordsFrom.length;
      var n = (coordsFrom.length < coordsTo.length) ? coordsFrom.length : coordsTo.length;

      if(n >= 4) {
          ic.rmsd_supr = ic.getRmsdSupr(coordsFrom, coordsTo, n);

          // apply matrix for each atom
          if(ic.rmsd_supr.rot !== undefined && ic.rmsd_supr.rmsd < 0.1) {
              var rot = ic.rmsd_supr.rot;
              var centerFrom = ic.rmsd_supr.trans1;
              var centerTo = ic.rmsd_supr.trans2;
              var rmsd = ic.rmsd_supr.rmsd;

              me.setLogCmd("RMSD of alignment to OPM: " + rmsd.toPrecision(4), false);
              $("#" + me.pre + "realignrmsd").val(rmsd.toPrecision(4));
              if(!me.cfg.bSidebyside) me.openDlg('dl_rmsd', 'RMSD of alignment to OPM');

              var dxymaxsq = 0;
              for(var i in ic.atoms) {
                var atom = ic.atoms[i];

                atom.coord = ic.transformMemPro(atom.coord, rot, centerFrom, centerTo);
                var xysq = atom.coord.x * atom.coord.x + atom.coord.y * atom.coord.y;
                if(Math.abs(atom.coord.z) <= 25 && xysq > dxymaxsq) {
                    dxymaxsq = xysq;
                }
              }

              ic.center = chainresiCalphaHash2.center;
              ic.oriCenter = ic.center.clone();

              // add membranes
              me.addMemAtoms(ic.halfBilayerSize, pdbid, Math.sqrt(dxymaxsq));

              // no rotation
              ic.bStopRotate = true;

              ic.bOpm = true;

              // show transmembrane features
              $("#" + me.pre + "togglememli").show();
              $("#" + me.pre + "adjustmemli").show();
              $("#" + me.pre + "selectplaneli").show();
              $("#" + me.pre + "anno_transmemli").show();
          }
          else {
              ic.bOpm = false;
          }
      }
      else {
          ic.bOpm = false;
      }
  }
};

iCn3DUI.prototype.loadOpmData = function(data, pdbid, bFull, type, pdbid2) { var me = this, ic = me.icn3d; "use strict";
    var url, dataType;

    if(!pdbid) pdbid = 'stru';

    url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&opm&uid=" + pdbid.toLowerCase();
    dataType = "jsonp";

    $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(opmdata) {
          me.setOpmData(opmdata); // set ic.bOpm

//          $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
//          $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

//          $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
//          $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);

          me.parseAtomData(data, pdbid, bFull, type, pdbid2);

          //if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }

        me.parseAtomData(data, pdbid, bFull, type, pdbid2);

        //if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
        return;
      }
    });
};

iCn3DUI.prototype.setOpmData = function(data) { var me = this, ic = me.icn3d; "use strict";
    if(data.opm !== undefined && data.opm.rot !== undefined) {
        ic.bOpm = true;

        ic.halfBilayerSize = data.opm.thickness;
        ic.rmsd_supr = {};
        ic.rmsd_supr.rot = data.opm.rot;
        ic.rmsd_supr.trans1 = new THREE.Vector3(data.opm.trans1[0], data.opm.trans1[1], data.opm.trans1[2]);
        ic.rmsd_supr.trans2 = new THREE.Vector3(data.opm.trans2[0], data.opm.trans2[1], data.opm.trans2[2]);
        ic.rmsd_supr.rmsd = data.opm.rmsd;

      $("#" + me.pre + "selectplane_z1").val(ic.halfBilayerSize);
      $("#" + me.pre + "selectplane_z2").val(-ic.halfBilayerSize);

      $("#" + me.pre + "extra_mem_z").val(ic.halfBilayerSize);
      $("#" + me.pre + "intra_mem_z").val(-ic.halfBilayerSize);
    }
    else {
        ic.bOpm = false;
    }
};
