/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.showLoading = function () { var me = this, ic = me.icn3d; "use strict";
      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").hide();
};

iCn3DUI.prototype.hideLoading = function () { var me = this, ic = me.icn3d; "use strict";
    //if(me.bCommandLoad === undefined || !me.bCommandLoad) {
      if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
      if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
      if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").show();
    //}
};

iCn3DUI.prototype.setYourNote = function (yournote) { var me = this, ic = me.icn3d; "use strict";
    me.yournote = yournote;
    $("#" + me.pre + "yournote").val(me.yournote);
    if(me.cfg.shownote) document.title = me.yournote;
};

iCn3DUI.prototype.parseMmdbDataPart1 = function (data, type) { var me = this, ic = me.icn3d; "use strict";
        // if type is defined, always process target before query
        if(data.atoms === undefined && data.molid2rescount === undefined) {
            alert('invalid MMDB data.');
            return false;
        }

        if(type === undefined || type === 'target') {
            if(!me.bStatefile) ic.init();

            ic.chainsColor = {};
            ic.chainsGene = {};
        }

        // used in download2Ddgm()
        if(type === 'query') {
            //me.interactionData_q.push({"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues});
        }
        else {
            me.interactionData = {"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues};
        }

        if(type === 'query') {
            //me.mmdb_data_q.push(data);
        }
        else {
            me.mmdb_data = data;
        }

        var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
        if(type === 'query') {
            me.inputid2 = id;
        }
        else {
            me.inputid = id;
        }

        // get molid2color = {}, chain2molid = {}, molid2chain = {};
        var labelsize = 40;

        var molid2rescount = data.moleculeInfor;
        var molid2color = {}, chain2molid = {}, molid2chain = {};

        //var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

        var index = 1;
        var chainNameHash = {};
        for(var i in molid2rescount) {
          if(Object.keys(molid2rescount[i]).length === 0) continue;

          var color = (molid2rescount[i].color === undefined) ? '#CCCCCC' : '#' + ( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
          var chainName = (molid2rescount[i].chain === undefined) ? '' : molid2rescount[i].chain.trim();
          if(chainNameHash[chainName] === undefined) {
              chainNameHash[chainName] = 1;
          }
          else {
              ++chainNameHash[chainName];
          }

          var chainNameFinal = (chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
          var chain = id + '_' + chainNameFinal;

          molid2color[i] = color;
          chain2molid[chain] = i;
          molid2chain[i] = chain;

          ic.chainsColor[chain] = (type !== undefined) ? ic.thr(me.GREY8) : ic.thr(color);

          var geneId = (molid2rescount[i].geneId === undefined) ? '' : molid2rescount[i].geneId;
          var geneSymbol = (molid2rescount[i].geneSymbol === undefined) ? '' : molid2rescount[i].geneSymbol;
          var geneDesc = (molid2rescount[i].geneDesc === undefined) ? '' : molid2rescount[i].geneDesc;
          ic.chainsGene[chain] = {'geneId': geneId, 'geneSymbol': geneSymbol, 'geneDesc': geneDesc};
          ++index;
        }

        //ic.molid2color = molid2color;
        //ic.chain2molid = chain2molid;
        ic.molid2chain = molid2chain;

        // small structure with all atoms
        // show surface options
        $("#" + me.pre + "accordion5").show();

        //me.loadAtomDataIn(data, id, 'mmdbid', undefined, type);
};

iCn3DUI.prototype.parseMmdbData = function (data, type, chainid, chainIndex, bLastQuery) { var me = this, ic = me.icn3d; "use strict";
        if(type === undefined) {
            //me.deferredOpm = $.Deferred(function() {
                  var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;

                  me.loadMmdbOpmData(data, id, type);
            //});

            //return me.deferredOpm.promise();

            return;
        }
        else {
            me.parseMmdbDataPart1(data, type);

            var id = (data.pdbId !== undefined) ? data.pdbId : data.mmdbId;

            var hAtoms = me.loadAtomDataIn(data, id, 'mmdbid', undefined, type, chainid, chainIndex, bLastQuery);

            me.loadMmdbOpmDataPart2(data, id, type);

            return hAtoms;
        }
};

iCn3DUI.prototype.downloadMmdb = function (mmdbid, bGi) { var me = this, ic = me.icn3d; "use strict";
   var url;

   // b: b-factor, s: water, ft: pdbsite
   //&ft=1
   if(bGi) {
       url = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&gi=" + mmdbid;
   }
   else {
       url = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + mmdbid;
   }

   // use asymmetric unit for BLAST search, e.g., https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=blast&blast_rep_id=5XZC_B&query_id=1TUP_A&command=view+annotations;set+annotation+cdd;set+annotation+site;set+view+detailed+view;select+chain+5XZC_B;show+selection&log$=align&blast_rank=1&RID=EPUCYNVV014&buidx=0
   if(me.cfg.blast_rep_id !== undefined) url += '&buidx=0';

   ic.bCid = undefined;

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
          //me.hideLoading();
      },
      success: function(data) {
        var bCalphaOnly = ic.isCalphaPhosOnly(data.atoms); //, 'CA');

        if(bCalphaOnly || data.atomCount <= ic.maxatomcnt) {
            me.parseMmdbData(data);
        }
        else {
            data = null;

            $.ajax({
              url: url + '&complexity=2', // alpha carbons
              dataType: 'jsonp',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              beforeSend: function() {
                  me.showLoading();
              },
              complete: function() {
                  //me.hideLoading();
              },
              success: function(data2) {
                  me.parseMmdbData(data2);
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
                  alert("This mmdbid " + mmdbid + " with the parameters " + me.cfg.inpara
                    + " may not have 3D structure data. Please visit the summary page for details: " + me.baseUrl + "pdb/" + mmdbid);
                }

                return;
              } // success
            }); // ajax
        }
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
          alert("This mmdbid " + mmdbid + " with the parameters " + me.cfg.inpara
            + " may not have 3D structure data. Please visit the summary page for details: " + me.baseUrl + "pdb/" + mmdbid);
        }

        return;
      } // success
    }); // ajax
};

iCn3DUI.prototype.downloadMmdbPart2 = function (type) { var me = this, ic = me.icn3d; "use strict";
    if(me.bAssemblyUseAsu) { // set up symmetric matrices
        $("#" + me.pre + "assemblyWrapper").show();
        ic.bAssembly = true;
    }
    else {
        $("#" + me.pre + "assemblyWrapper").hide();
        ic.bAssembly = false;
    }

    if(ic.emd !== undefined) {
      $("#" + me.pre + "mapWrapper1").hide();
      $("#" + me.pre + "mapWrapper2").hide();
      $("#" + me.pre + "mapWrapper3").hide();
    }
    else {
      $("#" + me.pre + "emmapWrapper1").hide();
      $("#" + me.pre + "emmapWrapper2").hide();
      $("#" + me.pre + "emmapWrapper3").hide();
    }

    ic.setAtomStyleByOptions(me.opts);
    // use the original color from cgi output
    if(me.cfg.blast_rep_id !== undefined) {
      ic.setColorByOptions(me.opts, ic.atoms);
    }
    else {
      ic.setColorByOptions(me.opts, ic.atoms, true);
    }

    if(type === undefined) {
        me.renderStructure();
        if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

        me.html2ddgm = '';
        if(me.cfg.show2d) {
            me.openDlg('dl_2ddgm', 'Interactions');
            if(me.bFullUi) {
                //if(type === undefined) {
                    me.download2Ddgm(me.inputid.toUpperCase());
                //}
                //else {
                //    me.set2DDiagramsForAlign(me.inputid2.toUpperCase(), me.inputid.toUpperCase());
                    //me.set2DDiagramsForChainalign(chainidArray);
                //}
            }
        }
    }

    if( (me.cfg.align === undefined || me.cfg.chainalign === undefined) && Object.keys(ic.structures).length == 1) {
        if($("#" + me.pre + "alternateWrapper") !== null) $("#" + me.pre + "alternateWrapper").hide();
    }

    //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

iCn3DUI.prototype.downloadGi = function (gi) { var me = this, ic = me.icn3d; "use strict";
    ic.bCid = undefined;
    var bGi = true;
    me.downloadMmdb(gi, bGi);
};

iCn3DUI.prototype.downloadBlast_rep_id = function (sequence_structure_ids) { var me = this, ic = me.icn3d; "use strict";
    ic.bCid = undefined;

    var idArray = sequence_structure_ids.split(',');
    me.cfg.query_id = idArray[0];
    me.cfg.blast_rep_id = idArray[1];

    var mmdbid = me.cfg.blast_rep_id.split('_')[0];

    me.downloadMmdb(mmdbid);
};
