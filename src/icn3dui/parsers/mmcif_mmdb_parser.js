/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showLoading = function () { var me = this;
      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").hide();
};

iCn3DUI.prototype.hideLoading = function () { var me = this;
    if(me.bCommandLoad === undefined || !me.bCommandLoad) {
      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").show();
    }
};

iCn3DUI.prototype.downloadMmcif = function (mmcifid) { var me = this;
   var url, dataType;

   url = "https://files.rcsb.org/view/" + mmcifid + ".cif";

   dataType = "text";

   me.icn3d.bCid = undefined;

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
          me.hideLoading();
      },
      success: function(data) {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

           $.ajax({
              url: url,
              type: 'POST',
              data : {'mmciffile': data},
              dataType: 'jsonp',
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
                  me.loadMmcifData(data);
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
};

iCn3DUI.prototype.downloadMmcifSymmetry = function (mmcifid) { var me = this;
  // chain functions together
  me.deferredSymmetry = $.Deferred(function() {
      me.downloadMmcifSymmetryBase(mmcifid);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSymmetry.promise();
};

iCn3DUI.prototype.downloadMmcifSymmetryBase = function (mmcifid) { var me = this;
   var url, dataType;

   if(me.isMac()) { // safari has a problem in getting data from https://files.rcsb.org/header/
       url = "https://files.rcsb.org/view/" + mmcifid + ".cif";
   }
   else {
       url = "https://files.rcsb.org/header/" + mmcifid + ".cif";
   }

   dataType = "text";

   me.icn3d.bCid = undefined;

   $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data) {
           url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

           $.ajax({
              url: url,
              type: 'POST',
              data : {'mmcifheader': data},
              dataType: 'jsonp',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                  if(data.emd !== undefined) me.icn3d.emd = data.emd;

                  me.loadMmcifSymmetry(data);

                  if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }

                if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
                return;
              }
            });
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
};

iCn3DUI.prototype.loadMmcifData = function(data) { var me = this;
    if (data.atoms !== undefined) {
        me.icn3d.init();

        if(data.emd !== undefined) me.icn3d.emd = data.emd;

        if(me.icn3d.emd !== undefined) {
          $("#" + me.pre + "mapWrapper1").hide();
          $("#" + me.pre + "mapWrapper2").hide();
          $("#" + me.pre + "mapWrapper3").hide();
        }
        else {
          $("#" + me.pre + "emmapWrapper1").hide();
          $("#" + me.pre + "emmapWrapper2").hide();
          $("#" + me.pre + "emmapWrapper3").hide();
        }

        me.loadAtomDataIn(data, data.mmcif, 'mmcifid');

        if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
            $("#" + me.pre + "alternateWrapper").hide();
        }

        // load assembly info
        var assembly = (data.assembly !== undefined) ? data.assembly : [];
        for(var i = 0, il = assembly.length; i < il; ++i) {
          if (me.icn3d.biomtMatrices[i] == undefined) me.icn3d.biomtMatrices[i] = new THREE.Matrix4().identity();

          for(var j = 0, jl = assembly[i].length; j < jl; ++j) {
            me.icn3d.biomtMatrices[i].elements[j] = assembly[i][j];
          }
        }

        if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1) {
            $("#" + me.pre + "assemblyWrapper").show();

            me.icn3d.asuCnt = me.icn3d.biomtMatrices.length;
        }
        else {
            $("#" + me.pre + "assemblyWrapper").hide();
        }

        me.icn3d.setAtomStyleByOptions(me.opts);
        me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

        me.renderStructure();

        if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

        //if(me.cfg.showseq !== undefined && me.cfg.showseq) me.openDialog(me.pre + 'dl_selectresidues', 'Select residues in sequences');

        if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
    }
    else {
        alert('invalid atoms data.');
        return false;
    }
};

iCn3DUI.prototype.loadMmcifSymmetry = function(data) { var me = this;
    // load assembly info
    var assembly = data.assembly;
    var pmatrix = data.pmatrix;

    for(var i = 0, il = assembly.length; i < il; ++i) {
      var mat4 = new THREE.Matrix4();
      mat4.fromArray(assembly[i]);

      me.icn3d.biomtMatrices[i] = mat4;
    }

    me.icn3d.asuCnt = me.icn3d.biomtMatrices.length;
};

iCn3DUI.prototype.downloadMmdb = function (mmdbid, bGi) { var me = this;
   //var maxatomcnt = (me.cfg.maxatomcnt === undefined) ? 50000 : me.cfg.maxatomcnt;
   var maxatomcnt = 100000; // asymmetric unit (buidx=0) will be returned if above this threshold

   var url;
/*
   if(bGi !== undefined && bGi) {
       url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&b&complexity=3&gi=" + mmdbid + "&ath=" + maxatomcnt;
   }
   else {
       url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?program=w3d&seq=1&b&complexity=3&uid=" + mmdbid + "&ath=" + maxatomcnt;
   }
*/

   // b: b-factor, s: water, ft: pdbsite
   //&ft=1
   if(bGi !== undefined && bGi) {
       url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&gi=" + mmdbid;
   }
   else {
       url = "https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + mmdbid;
   }

   me.icn3d.bCid = undefined;

   if(me.cfg.inpara !== undefined) {
     url += me.cfg.inpara;
   }

   if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

   $.ajax({
      url: url,
      dataType: 'jsonp',
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
        if(data.atoms === undefined && data.molid2rescount === undefined) {
            alert('invalid MMDB data.');
            return false;
        }

        me.icn3d.init();

        // used in download2Ddgm()
        me.interactionData = {"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues};

        me.mmdb_data = data;

        var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
        me.inputid = id;

        // get molid2color = {}, chain2molid = {}, molid2chain = {};
        var labelsize = 40;

        //var molid2rescount = data.molid2rescount;
        var molid2rescount = data.moleculeInfor;
        var molid2color = {}, chain2molid = {}, molid2chain = {};
        me.icn3d.chainsColor = {};
        me.icn3d.chainsGene = {};

        var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

        var index = 1;
        var chainNameHash = {};
        for(var i in molid2rescount) {
          var color = '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
          var chainName = molid2rescount[i].chain.trim();
          if(chainNameHash[chainName] === undefined) {
              chainNameHash[chainName] = 1;
          }
          else {
              ++chainNameHash[chainName];
          }

          var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
          var chain = id + '_' + chainNameFinal;
          html += "<tr style='color:" + color + "'><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='" + i + "' chain='" + chain + "'/></td><td align='center'>" + index + "</td><td align='center'>" + chainNameFinal + "</td><td align='center'>" + molid2rescount[i].resCount + "</td></tr>";

          molid2color[i] = color;
          chain2molid[chain] = i;
          molid2chain[i] = chain;

          me.icn3d.chainsColor[chain] = new THREE.Color(color);

          me.icn3d.chainsGene[chain] = {'geneId': molid2rescount[i].geneId, 'geneSymbol': molid2rescount[i].geneSymbol, 'geneDesc': molid2rescount[i].geneDesc};
          ++index;
        }

        if(me.icn3d.chemicals !== undefined && Object.keys(me.icn3d.chemicals).length > 0) {
          html += "<tr><td><input type='checkbox' name='" + me.pre + "filter_ckbx' value='chemicals'/></td><td align='center'>" + index + "</td><td align='center'>Chemicals</td><td align='center'>" + Object.keys(me.icn3d.chemicals).length + " atoms</td></tr>";
        }

        html += "</table>";

        me.icn3d.molid2color = molid2color;
        me.icn3d.chain2molid = chain2molid;
        me.icn3d.molid2chain = molid2chain;

        //if ((me.cfg.inpara !== undefined && me.cfg.inpara.indexOf('mols=') != -1) || (data.atomcount <= maxatomcnt && data.atoms !== undefined) ) {
        // small structure with all atoms
        // show surface options
        $("#" + me.pre + "accordion5").show();

        me.loadAtomDataIn(data, id, 'mmdbid');

        // "asuAtomCount" is defined when: 1) atom count is over the threshold 2) buidx=1 3) asu atom count is smaller than biological unit atom count
        me.bAssemblyUseAsu = (data.asuAtomCount !== undefined) ? true : false;

/*
        if(me.bAssemblyUseAsu) { // set up symmetric matrices
            $("#" + me.pre + "assemblyWrapper").show();
            me.icn3d.bAssembly = true;

            //me.downloadMmcifSymmetry(id);

            $.when(me.downloadMmcifSymmetry(id)).then(function() {
                me.downloadMmdbPart2();
            });
        }
        else {
            $("#" + me.pre + "assemblyWrapper").hide();
            me.icn3d.bAssembly = false;

            me.downloadMmdbPart2();
        }
*/
        $.when(me.downloadMmcifSymmetry(id)).then(function() {
            me.downloadMmdbPart2();
        });
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }

        if(bGi) {
          alert("This gi " + mmdbid + " has no corresponding 3D structure...");
        }
        else {
          alert("This mmdbid " + mmdbid + " with the parameters " + me.cfg.inpara + " has no corresponding 3D structure...");
        }

        return;
      } // success
    }); // ajax
};

iCn3DUI.prototype.downloadMmdbPart2 = function () { var me = this;
    if(me.bAssemblyUseAsu) { // set up symmetric matrices
        $("#" + me.pre + "assemblyWrapper").show();
        me.icn3d.bAssembly = true;
    }
    else {
        $("#" + me.pre + "assemblyWrapper").hide();
        me.icn3d.bAssembly = false;
    }

    if(me.icn3d.emd !== undefined) {
      $("#" + me.pre + "mapWrapper1").hide();
      $("#" + me.pre + "mapWrapper2").hide();
      $("#" + me.pre + "mapWrapper3").hide();
    }
    else {
      $("#" + me.pre + "emmapWrapper1").hide();
      $("#" + me.pre + "emmapWrapper2").hide();
      $("#" + me.pre + "emmapWrapper3").hide();
    }

    me.icn3d.setAtomStyleByOptions(me.opts);
    // use the original color from cgi output
    me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms, true);

    me.renderStructure();
    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    me.html2ddgm = '';
    if(me.cfg.show2d !== undefined && me.cfg.show2d) {
        me.openDialog(me.pre + 'dl_2ddgm', 'Interactions');
        me.download2Ddgm(me.inputid.toUpperCase());
        //me.download2Ddgm(Object.keys(me.icn3d.structures)[0].toUpperCase());
    }

    if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
        if($("#" + me.pre + "alternateWrapper") !== null) $("#" + me.pre + "alternateWrapper").hide();
    }

    if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

iCn3DUI.prototype.downloadGi = function (gi) { var me = this;
    me.icn3d.bCid = undefined;
    var bGi = true;
    me.downloadMmdb(gi, bGi);

};

iCn3DUI.prototype.getMissingResidues = function (seqArray, type, chainid) { var me = this;
    var prevResi = -9999;
    var missingResBegin = 0;
    var bCount = true;
    for(var i = 0, il = seqArray.length; i < il; ++i) {
        var seqName, resiPos;
        // mmdbid: ["0","R","ARG"],["502","V","VAL"]; mmcifid: [1, "ARG"]; align: [1, "0","R","ARG"]
        if(type === 'mmdbid') {
            seqName = seqArray[i][1];
            resiPos = 0;
        }
        else if(type === 'mmcifid') {
            seqName = seqArray[i][1];
            seqName = me.icn3d.residueName2Abbr(seqName);
            resiPos = 0;
        }
        else if(type === 'align') {
            seqName = seqArray[i][2];
            resiPos = 1;
        }

        // fixe some missing residue names such as residue 6 in 5C1M_A
        if(seqName === '') {
            seqName = 'x';
        }

        var resObject = {};
        resObject.resi = i + 1;
        var resi = parseInt(seqArray[i][resiPos]);
        var nextResi = (i == il - 1) ? 9999 : parseInt(seqArray[i+1][resiPos]);

        if(resi !== 0 ||
          (resi === 0 && (prevResi === -1 || nextResi == 1) )
          ) {
            resObject.name = seqName.toLowerCase();

            if(bCount && missingResBegin > 0) {
                if(me.countNextresiArray[chainid] === undefined) me.countNextresiArray[chainid] = [];

                var count_nextresi = [missingResBegin, parseInt(seqArray[i][0])];

                me.countNextresiArray[chainid].push(count_nextresi);

                missingResBegin = 0;
            }

            bCount = false;
        }
        //else if(resi === 0 && prevResi !== -1) { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
        else { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
            resObject.name = seqName.toLowerCase();
            ++missingResBegin;

            //if(me.chainMissingResidueArray[chainid] === undefined) me.chainMissingResidueArray[chainid] = [];
            //me.chainMissingResidueArray[chainid].push(resObject);

            bCount = true;
        }

        if(me.icn3d.chainsSeq[chainid] === undefined) me.icn3d.chainsSeq[chainid] = [];

        var numberStr = '';
        if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

        me.icn3d.chainsSeq[chainid].push(resObject);

        prevResi = resi;
    }
};

iCn3DUI.prototype.loadAtomDataIn = function (data, id, type, seqalign) { var me = this;
    //me.icn3d.init();

    var pmin = new THREE.Vector3( 9999, 9999, 9999);
    var pmax = new THREE.Vector3(-9999,-9999,-9999);
    var psum = new THREE.Vector3();

    var atoms = data.atoms;

    var serial = 0;
    var prevResi = 0;

    var serial2structure = {}; // for "align" only
    var mmdbid2pdbid = {}; // for "align" only

    me.pmid = data.pubmedId;

    var chainid2seq = {}, chainid2kind = {}, chainid2color = {};
    me.chainid2title = {};
    me.chainid2sid = {};

    if(type === 'align') {
      //serial2structure
      me.pmid = "";
      var refinedStr = (me.cfg.inpara.indexOf('atype=1') !== -1) ? 'Invariant Core ' : '';
      me.icn3d.molTitle = refinedStr + 'Structure Alignment of ';

      for (var i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
          var structure = data.alignedStructures[0][i];

          if(i === 1) {
              me.icn3d.secondId = structure.pdbId; // set the second pdbid to add indent in the structure and chain mns
          }

          var pdbidTmp = structure.pdbId;
          var mmdbidTmp = structure.mmdbId;

          for(var j = structure.serialInterval[0], jl = structure.serialInterval[1]; j <= jl; ++j) {
              serial2structure[j] = pdbidTmp.toString();
              mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
          }

          for(var j = 0, jl = structure.molecules.length; j < jl; ++j) {
              var chain = structure.molecules[j].chain;
              var kind = structure.molecules[j].kind;
              var title = structure.molecules[j].name;
              var seq = structure.molecules[j].sequence;
              var sid = structure.molecules[j].sid;

              var chainid = pdbidTmp + '_' + chain;

              chainid2seq[chainid] = seq;
              chainid2kind[chainid] = kind;

              me.chainid2title[chainid] = title;
              if(sid !== undefined) me.chainid2sid[chainid] = sid;
          }

          me.icn3d.molTitle +=  "<a href=\"https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdbsrv.cgi?uid=" + structure.pdbId.toUpperCase() + "\" target=\"_blank\" style=\"color: " + me.GREYD + ";\">" + structure.pdbId.toUpperCase() + "</a>";

          if(structure.descr !== undefined) me.pmid += structure.descr.pubmedid;
          if(i === 0) {
              me.icn3d.molTitle += " and ";
              if(structure.descr !== undefined) me.pmid += "_";
          }
      }

      me.icn3d.molTitle += ' from VAST+';

    }
    else { // mmdbid or mmcifid
        if(data.descr !== undefined) me.icn3d.molTitle += data.descr.name;

        if(type === 'mmdbid') {
          var pdbidTmp = data.pdbId;
          var chainHash = {};
          for(var molid in data.moleculeInfor) {
              var chain = data.moleculeInfor[molid].chain.trim();
              var chainid = pdbidTmp + '_' + chain;
              if(chainHash.hasOwnProperty(chain)) {
                  ++chainHash[chain];
                  chainid += chainHash[chain];
              }
              else {
                  chainHash[chain] = 1;
              }

              var kind = data.moleculeInfor[molid].kind;
              var color = data.moleculeInfor[molid].color;
              var sid = data.moleculeInfor[molid].sid;

              chainid2kind[chainid] = kind;
              chainid2color[chainid] = color;

              if(sid !== undefined) me.chainid2sid[chainid] = sid;
          }
        }
    }

    me.countNextresiArray = {};
    //me.chainMissingResidueArray = {};
    if(type === 'mmdbid' || type === 'mmcifid') {
        for(var chain in data.sequences) {
            var seqArray = data.sequences[chain];
            var chainid = id + '_' + chain;
            if(type === 'mmcifid') chainid = '1_' + chain;

            me.getMissingResidues(seqArray, type, chainid);
        }
    }
    else if(type === 'align') {
        for(var chainid in chainid2seq) {
            var seqArray = chainid2seq[chainid];

            me.getMissingResidues(seqArray, type, chainid);
        }
    }

    var atomid2serial = {};
    var prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
    var structureNum = '', chainNum = '', residueNum = '';
    var currContinueSeq = '';
    var oldResi, prevOldResi = -999;
    var prevResi = 0; // continuous from 1 for each chain
    var missingResIndex = 0;
    var bChainSeqSet = true;

    // In align, chemicals do not have assigned chains. Assembly will have the same residue id so that two different residues will be combined in one residue. To avoid this, build an array to check for molid
    var resiArray = [];
    var molid, prevMolid = '', prevmmdbId = '';

    // set mmdbMolidResid2mmdbChainResi
    me.mmdbMolidResid2mmdbChainResi = {};

    var bPhosphorusOnly = me.icn3d.isCalphaPhosOnly(atoms, "O3'", "O3*");
    var miscCnt = 0;

    for (var i in atoms) {
        ++serial;

        atomid2serial[i] = serial;

        var atm = atoms[i];
        atm.serial = serial;

        var mmdbId;

        if(type === 'mmdbid' || type === 'mmcifid') {
          mmdbId = id; // here mmdbId is pdbid or mmcif id
        }
        else if(type === 'align') {
          mmdbId = serial2structure[serial]; // here mmdbId is pdbid
        }

        var resiCorrection = 0;
        if(type === 'mmdbid' || type === 'align') {
            atm.resi_ori = parseInt(atm.resi); // original PDB residue number, has to be integer
            atm.resi = atm.ids.r; // corrected for residue insertion code

            resiCorrection = atm.resi - atm.resi_ori;
        }
        else {
            atm.resi = parseInt(atm.resi);
        }

        //if(mmdbId !== prevmmdbId) resiArray = [];
        if(atm.chain === undefined && (type === 'mmdbid' || type === 'align')) {
            if(type === 'mmdbid') {
              molid = atm.ids.m;

              if(me.icn3d.molid2chain[molid] !== undefined) {
                  var pos = me.icn3d.molid2chain[molid].indexOf('_');
                  atm.chain = me.icn3d.molid2chain[molid].substr(pos + 1);
              }
              else {
/*
                  if(molid !== prevMolid) {
                      resiArray.push(atm.resi);
                  }

                  var miscName;
                  if($.inArray(atm.resi, resiArray) === resiArray.length - 1) {
                      miscName = 'Misc';
                  }
                  else {
                      miscName = 'Misc2';
                  }
*/
                  var miscName = 'Misc';

                  ++miscCnt;
                  if(chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH') {
                      atm.resi = miscCnt;
                  }

                  //if all are defined in the chain section, no "Misc" should appear
                  atm.chain = miscName;
              }
            }
            else if(type === 'align') {
              molid = atm.ids.m;

              if(me.icn3d.pdbid_molid2chain[mmdbId + '_' + molid] !== undefined) {
                  atm.chain = me.icn3d.pdbid_molid2chain[mmdbId + '_' + molid];
              }
              else {
/*
                  if(molid !== prevMolid) {
                      resiArray.push(atm.resi);
                  }

                  var miscName;
                  if($.inArray(atm.resi, resiArray) === resiArray.length - 1) {
                      miscName = 'Misc';
                  }
                  else {
                      miscName = 'Misc2';
                  }
*/
                  var miscName = 'Misc';
                  ++miscCnt;
                  if(chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH') {
                      atm.resi = miscCnt;
                  }

                  // chemicals do not have assigned chains.
                  atm.chain = miscName;
              }
            }
        }
        else {
          atm.chain = (atm.chain === '') ? 'Misc' : atm.chain;
        }

        atm.chain = atm.chain.trim();

        // mmcif has pre-assigned structure in mmcifparser.cgi output
        if(type === 'mmdbid' || type === 'align') {
            atm.structure = mmdbId;
        }

        structureNum = atm.structure;
        chainNum = structureNum + '_' + atm.chain;

        if(chainNum !== prevChainNum) {
            missingResIndex = 0;
            prevResi = 0;
        }

        if(type === 'mmdbid') {
            atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
        }
        else {
            atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);
        }

        var oneLetterRes = me.icn3d.residueName2Abbr(atm.resn.substr(0, 3));

        // modify resi since MMDB used the same resi as in PDB where resi is not continuous
        // No need to modify mmcif resi
        //if(type === 'mmdbid' || type === 'align') {
        if(type === 'mmdbid') {
            // bfactor
            //if(type === 'mmdbid') atm.b = (atm.b !== undefined) ? atm.b : 1;

            oldResi = atm.resi;

//          if(atm.resi !== prevOldResi && atm.resi !== prevOldResi + 1) {
            if(me.countNextresiArray[chainNum] !== undefined
              && me.countNextresiArray[chainNum][missingResIndex] !== undefined
              && atm.resi === me.countNextresiArray[chainNum][missingResIndex][1] + resiCorrection) {
                // add missed residues
                var count = me.countNextresiArray[chainNum][missingResIndex][0];
                prevResi += count;

                ++missingResIndex;
            }
//          }

            if(molid !== prevMolid) {
                atm.resi = atm.resi; // don't change the assigned resi
            }
            else if(atm.resi !== prevOldResi) {
                atm.resi = prevResi + 1;
            }

            else {
                atm.resi = prevResi;
            }

            prevOldResi = oldResi;
        }

        if(type === 'mmdbid' || type === 'align') {
            // set me.mmdbMolidResid2mmdbChainResi
            me.mmdbMolidResid2mmdbChainResi[mmdbId + '_' + atm.ids.m + '_' + atm.ids.r] = mmdbId + '_' + atm.chain + '_' + atm.resi;
        }

        pmin.min(atm.coord);
        pmax.max(atm.coord);
        psum.add(atm.coord);

        var bProtein = (me.cfg.mmcifid === undefined) ? chainid2kind[chainNum] === 'protein' : atm.mt === 'p';
        var bNucleotide = (me.cfg.mmcifid === undefined) ? chainid2kind[chainNum] === 'nucleotide' : atm.mt === 'n';
        var bSolvent = (me.cfg.mmcifid === undefined) ? chainid2kind[chainNum] === 'solvent' : atm.mt === 's';
        // in vastplus.cgi, ions arenotlisted in alignedStructures...molecules, thus chainid2kind[chainNum] === undefined is used.
        // ions will be separated from chemicals later.
        // here "ligand" is used in the cgi output
        var bChemicalIons = (me.cfg.mmcifid === undefined) ? (chainid2kind[chainNum] === 'ligand' || chainid2kind[chainNum] === 'otherPolymer' || chainid2kind[chainNum] === undefined) : atm.mt === 'l';

/*
        // sometimes proteins or nucleotide may input as chemicals
        // use the hash residueColors for protein residues
        var nucleotideRes = {'G': 1, 'A': 1, 'T': 1, 'C': 1, 'U': 1, 'DG': 1, 'DA': 1, 'DT': 1, 'DC': 1, 'DU': 1};
        if(me.icn3d.residueColors.hasOwnProperty(atm.resn)) {
            bProtein = true;
        }
        else if(nucleotideRes.hasOwnProperty(atm.resn)) {
            bNucleotide = true;
        }
*/

        if (bProtein || bNucleotide)
        {
            if (bProtein) {
              me.icn3d.proteins[serial] = 1;

              if (atm.name === 'CA') me.icn3d.calphas[serial] = 1;
              if (atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') me.icn3d.sidec[serial] = 1;
            }
            else if (bNucleotide) {
              me.icn3d.nucleotides[serial] = 1;

              //if (atm.name == 'P') me.icn3d.nucleotidesO3[serial] = 1;
              if (atm.name == "O3'" || atm.name == "O3*" || (bPhosphorusOnly && atm.name == 'P') ) {
                  me.icn3d.nucleotidesO3[serial] = 1;
              }
            }

            atm.het = false;
        }
        else if (bSolvent) { // solvent
          me.icn3d.water[serial] = 1;

          atm.het = true;
        }
        else if (bChemicalIons) { // chemicals and ions
          //if (atm.bonds.length === 0) me.icn3d.ions[serial] = 1;
          if (atm.elem === atm.resn) {
              me.icn3d.ions[serial] = 1;
          }
          else if (atm.resn === 'HOH') {
              me.icn3d.water[serial] = 1;
          }
          else {
              me.icn3d.chemicals[serial] = 1;
          }

          atm.het = true;
        }

        if(type === 'mmdbid') {
            //atm.color = (!atm.het) ? new THREE.Color(chainid2color[chainNum]) : me.icn3d.atomColors[atm.elem] || me.icn3d.defaultAtomColor;
            if(!atm.het) {
                atm.color = (chainid2color[chainNum] !== undefined) ? new THREE.Color(chainid2color[chainNum]) : me.icn3d.chargeColors[atm.resn];
            }
            else {
                atm.color = me.icn3d.atomColors[atm.elem] || me.icn3d.defaultAtomColor;
            }
        }
        else {
            if(atm.color !== undefined) atm.color = new THREE.Color(atm.color);
        }

        if(atm.resn.charAt(0) !== ' ' && atm.resn.charAt(1) === ' ') {
          atm.resn = atm.resn.charAt(0);
        }

        // double check
        if (atm.resn == 'HOH') me.icn3d.water[serial] = 1

        me.icn3d.atoms[serial] = atm;
        me.icn3d.dAtoms[serial] = 1;
        me.icn3d.hAtoms[serial] = 1;

        // chain level
        var chainid = atm.structure + '_' + atm.chain;
        if (me.icn3d.chains[chainid] === undefined) me.icn3d.chains[chainid] = {};
        me.icn3d.chains[chainid][serial] = 1;

        // residue level
        var residueid = atm.structure + '_' + atm.chain + '_' + atm.resi;
        if (me.icn3d.residues[residueid] === undefined) me.icn3d.residues[residueid] = {};
        me.icn3d.residues[residueid][serial] = 1;

        residueNum = chainNum + '_' + atm.resi;

        // different residue
        if(residueNum !== prevResidueNum) {
            // different chain
            if(chainNum !== prevChainNum) {
                bChainSeqSet = true;

                if(serial !== 1) {
                    if(me.icn3d.structures[prevStructureNum] === undefined) me.icn3d.structures[prevStructureNum] = [];
                    me.icn3d.structures[prevStructureNum].push(prevChainNum);
                }
            }
        }

        me.icn3d.residueId2Name[residueid] = oneLetterRes;

        var secondaries = '-';
        if(atm.ss === 'helix') {
            secondaries = 'H';
        }
        else if(atm.ss === 'sheet') {
            secondaries = 'E';
        }
        else if(atm.het || bNucleotide ) {
            secondaries = 'o';
        }
        else if(!atm.het && me.icn3d.residueColors.hasOwnProperty(atm.resn.toUpperCase()) ) {
            secondaries = 'c';
        }
        else if(atm.ss === 'coil') {
            secondaries = 'c';
        }

        me.icn3d.secondaries[atm.structure + '_' + atm.chain + '_' + atm.resi] = secondaries;

        if( atm.resi != prevResi || molid != prevMolid ) { // mmdbid 1tup has different molid, same resi
          if(me.icn3d.chainsSeq[chainid] === undefined) {
              me.icn3d.chainsSeq[chainid] = [];
              bChainSeqSet = false;
          }

          // me.icn3d.chainsSeq[chainid][atm.resi - 1] should have been defined for major chains
          if( bChainSeqSet && me.icn3d.chainsSeq[chainid][atm.resi - 1] !== undefined) {
              me.icn3d.chainsSeq[chainid][atm.resi - 1].name = oneLetterRes;
          }
          else if(!bChainSeqSet) {
              var resObject = {};
              resObject.resi = atm.resi;
              resObject.name = oneLetterRes;
              var numberStr = '';
              if(atm.resi % 10 === 0) numberStr = atm.resi.toString();

              me.icn3d.chainsSeq[chainid].push(resObject);
          }
        }

        prevResi = atm.resi;

        prevStructureNum = structureNum;
        prevChainNum = chainNum;
        prevResidueNum = residueNum;

        prevMolid = molid;
        prevmmdbId = mmdbId;
    }

//        me.icn3d.adjustSeq(me.chainMissingResidueArray);

    // remove the reference
    data.atoms = {};

    // add the last residue set
    if(me.icn3d.structures[structureNum] === undefined) me.icn3d.structures[structureNum] = [];
    me.icn3d.structures[structureNum].push(chainNum);

    // update bonds info
    if(type !== 'mmcifid') {
    for (var i in me.icn3d.atoms) {
        var bondLength = (me.icn3d.atoms[i].bonds === undefined) ? 0 : me.icn3d.atoms[i].bonds.length;

        for(var j = 0; j < bondLength; ++j) {
            me.icn3d.atoms[i].bonds[j] = atomid2serial[me.icn3d.atoms[i].bonds[j]];
        }
    }
    }

    me.icn3d.cnt = serial;

    me.icn3d.pmin = pmin;
    me.icn3d.pmax = pmax;
    me.icn3d.maxD = pmax.distanceTo(pmin);
    me.icn3d.center = psum.multiplyScalar(1.0 / me.icn3d.cnt);

    if (me.icn3d.maxD < 5) me.icn3d.maxD = 5;
    me.icn3d.oriMaxD = me.icn3d.maxD;
    me.icn3d.oriCenter = me.icn3d.center.clone();

    // set up disulfide bonds
    if(type === 'mmdbid') {
        var disulfideArray = data.disulfides;

        if(disulfideArray !== undefined) {
            for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                var serial1 = disulfideArray[i][0].ca;
                var serial2 = disulfideArray[i][1].ca;

                var atom1 = me.icn3d.atoms[serial1];
                var atom2 = me.icn3d.atoms[serial2];

                var resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
                var resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;

                if(me.icn3d.ssbondpnts[atom1.structure] === undefined) me.icn3d.ssbondpnts[atom1.structure] = [];

                me.icn3d.ssbondpnts[atom1.structure].push(resid1);
                me.icn3d.ssbondpnts[atom1.structure].push(resid2);
            }
        }
    }
    else if(type === 'mmcifid') {
        var disulfideArray = data.disulfides;

        if(disulfideArray !== undefined) {
            if(me.icn3d.ssbondpnts[id] === undefined) me.icn3d.ssbondpnts[id] = [];

            for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                var resid1 = disulfideArray[i][0];
                var resid2 = disulfideArray[i][1];

                me.icn3d.ssbondpnts[id].push(resid1);
                me.icn3d.ssbondpnts[id].push(resid2);
            }

            // copy disulfide bonds
            var structureArray = Object.keys(me.icn3d.structures);
            for(var s = 0, sl = structureArray.length; s < sl; ++s) {
                var structure = structureArray[s];

                if(structure == id) continue;

                if(me.icn3d.ssbondpnts[structure] === undefined) me.icn3d.ssbondpnts[structure] = [];

                for(var j = 0, jl = me.icn3d.ssbondpnts[id].length; j < jl; ++j) {
                    var ori_resid = me.icn3d.ssbondpnts[id][j];
                    var pos = ori_resid.indexOf('_');
                    var resid = structure + ori_resid.substr(pos);

                    me.icn3d.ssbondpnts[structure].push(resid);
                }
            }
        }
    }

    // set up sequence alignment
    // display the structure right away. load the mns and sequences later
//        setTimeout(function(){
    if(type === 'align' && seqalign !== undefined) {
        me.setSeqAlign(seqalign, data.alignedStructures);
    } // if(align

    me.showTitle();

    data = {};
};
