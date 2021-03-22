/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadChainalignmentPart2 = function (data1, data2Array, chainresiCalphaHash2, chainidArray) { var me = this, ic = me.icn3d; "use strict";
    //me.interactionData_q = [];
    //me.mmdb_data_q = [];

    var hAtoms = {};
    hAtoms = me.parseMmdbData(data1, 'target', chainidArray[0], 0);

    var bLastQuery = false;
    for(var i = 0, il = data2Array.length; i < il; ++i) {
        if(i == data2Array.length - 1) bLastQuery = true;
        // each alignment has a chainIndex i
        var hAtomsTmp = me.parseMmdbData(data2Array[i], 'query', chainidArray[i + 1], i, bLastQuery);
        hAtoms = ic.unionHash(hAtoms, hAtomsTmp);
    }

    if(me.cfg.resnum) {
        me.realignChainOnSeqAlign(chainresiCalphaHash2, chainidArray);
    }
    else {
        me.downloadChainalignmentPart3(chainresiCalphaHash2, chainidArray, hAtoms);
    }
};

iCn3DUI.prototype.downloadChainalignmentPart3 = function (chainresiCalphaHash2, chainidArray, hAtoms) { var me = this, ic = me.icn3d; "use strict";
    // select all
    var allAtoms = {};
    for(var i in ic.atoms) {
        allAtoms[i] = 1;
    }
    ic.dAtoms = allAtoms;
    ic.hAtoms = allAtoms;

    ic.setAtomStyleByOptions(me.opts);
    // change the default color to "Identity"

    me.opts['color'] = 'identity';
    ic.setColorByOptions(me.opts, ic.atoms);

    // memebrane is determined by one structure. But transform both structures
    if(chainresiCalphaHash2 !== undefined) me.transformToOpmOriForAlign(me.selectedPdbid, chainresiCalphaHash2, true);

    ic.dAtoms = hAtoms;
    ic.hAtoms = hAtoms;

    me.renderStructure();

    if(me.chainidArray.length > 2) {
        var residuesHash = {};
        for(var i in hAtoms) {
            var atom = ic.atoms[i];
            var resid = atom.structure + '_' + atom.chain + '_' + atom.resi;
            residuesHash[resid] = 1;
        }

        var commandname = 'protein_aligned';
        var commanddescr = 'protein aligned';
        var select = "select " + me.residueids2spec(Object.keys(residuesHash));

        me.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
    }

    me.updateHlAll();

    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    me.html2ddgm = '';

    // by default, open the seq alignment window
    //if(me.cfg.show2d !== undefined && me.cfg.show2d) me.openDlg('dl_2ddgm', 'Interactions');
    if(me.cfg.showalignseq) {
        me.openDlg('dl_alignment', 'Select residues in aligned sequences');
    }

    if(me.cfg.show2d && me.bFullUi) {
        me.openDlg('dl_2ddgm', 'Interactions');
        if(me.bFullUi) {
            if(!ic.bChainAlign) {
                me.download2Ddgm(me.inputid.toUpperCase());
            }
            else {
                //me.set2DDiagramsForAlign(me.inputid2.toUpperCase(), me.inputid.toUpperCase());
                me.set2DDiagramsForChainalign(chainidArray);
            }
        }
    }

    //if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

iCn3DUI.prototype.downloadChainAlignment = function (chainalign, resnum) { var me = this, ic = me.icn3d; "use strict";
    me.opts['proteins'] = 'c alpha trace';
    ic.opts['proteins'] = 'c alpha trace';

    var alignArray = chainalign.split(',');

    for(var i = 0, il = alignArray.length; i < il; ++i) {
        var chainid = alignArray[i];
        var pos = chainid.indexOf('_');
        alignArray[i] = chainid.substr(0, pos).toUpperCase() + chainid.substr(pos);
    }

    me.chainidArray = alignArray;

    var pos1 = alignArray[0].indexOf('_');
    me.mmdbid_t = alignArray[0].substr(0, pos1).toUpperCase();
    me.chain_t = alignArray[0].substr(pos1+1);
    var url_t = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + me.mmdbid_t;
    if(me.cfg.inpara !== undefined) url_t += me.cfg.inpara;

    var ajaxArray = [];
    var targetAjax = $.ajax({
      url: url_t,
      dataType: 'jsonp',
      cache: true
    });

    ajaxArray.push(targetAjax);

    me.setYourNote(chainalign.toUpperCase() + ' in iCn3D');
    ic.bCid = undefined;
    // define for 'align' only
    ic.pdbid_chain2title = {};
    if(me.chainids2resids === undefined) me.chainids2resids = {}; // me.chainids2resids[chainid1][chainid2] = [resid, resid]

    for(var index = 1, indexLen = alignArray.length; index < indexLen; ++index) {
        var pos2 = alignArray[index].indexOf('_');
        me.mmdbid_q = alignArray[index].substr(0, pos2).toUpperCase();
        me.chain_q = alignArray[index].substr(pos2+1);

        var chainalignFinal = me.mmdbid_q + "_" + me.chain_q + "," + me.mmdbid_t + "_" + me.chain_t;

        var urlalign = me.baseUrl + "vastdyn/vastdyn.cgi?chainpairs=" + chainalignFinal;
        var url_q = me.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=" + me.mmdbid_q;

        if(me.cfg.inpara !== undefined) url_q += me.cfg.inpara;

        var queryAjax = $.ajax({
          url: url_q,
          dataType: 'jsonp',
          cache: true
        });

        ajaxArray.push(queryAjax);

        if(!me.cfg.resnum) {
            var alignAjax = $.ajax({
              url: urlalign,
              dataType: 'jsonp',
              cache: true
            });

            ajaxArray.push(alignAjax);
        }
    }

    //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
    //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
    $.when.apply(undefined, ajaxArray).then(function() {
      me.parseChainAlignData(arguments, alignArray, me.mmdbid_t, me.chain_t);
    })
    .fail(function() {
      me.parseChainAlignData(arguments, alignArray, me.mmdbid_t, me.chain_t);
    });
};

iCn3DUI.prototype.parseChainAlignData = function (data, chainidArray, mmdbid_t, chain_t) { var me = this, ic = me.icn3d; "use strict";
    var dataArray = (chainidArray.length == 1) ? [data] : data;

    // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
    //var data2 = v2[0];
    // index = 0: the mmdb data of target
    var targetData = dataArray[0][0];

    me.t_trans_add = [];
    me.q_trans_sub = [];
    me.q_rotation = [];
    me.qt_start_end = [];

    me.mmdbidArray = [];
    me.mmdbidArray.push(mmdbid_t);

    var queryDataArray = [];

    var step = (me.cfg.resnum) ? 1 : 2;

    for(var index = 1, indexl = dataArray.length; index < indexl; index += step) {
        var queryData = dataArray[index][0];

        var index2 = parseInt(index / step);
        var pos2 = chainidArray[index2].indexOf('_');
        var mmdbid_q = chainidArray[index2].substr(0, pos2).toUpperCase();
        var chain_q = chainidArray[index2].substr(pos2+1);

        if(me.cfg.resnum) {
            if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
              ) {
                me.mmdbidArray.push(mmdbid_q);

                queryDataArray.push(queryData);
            }
        }
        else {
            var align = dataArray[index + 1][0];

            if(queryData !== undefined && JSON.stringify(queryData).indexOf('Oops there was a problem') === -1
                && align !== undefined && JSON.stringify(align).indexOf('Oops there was a problem') === -1
              ) {
                if((align === undefined || align.length == 0) && mmdbid_q == mmdbid_t && chain_q == chain_t) {
                    me.t_trans_add.push({"x":0, "y":0, "z":0});
                    me.q_trans_sub.push({"x":0, "y":0, "z":0});
                    me.q_rotation.push({"x1":1, "y1":0, "z1":0, "x2":0, "y2":1, "z2":0, "x3":0, "y3":0, "z3":1});
                    me.qt_start_end.push(undefined);
                }
                else if(align === undefined || align.length == 0) {
                    if(!me.cfg.command) alert('These two chains ' + chainidArray[index2] + ' can not align to each other. ' + 'Please select sequences from these two chains in the "Sequences & Annotations" window, ' + 'and click "Realign Selection" in the "File" menu to align your selection.');

                    me.cfg.showanno = 1;
                    me.cfg.showalignseq = 0;
                }
                else {
                    me.t_trans_add.push(align[0].t_trans_add);
                    me.q_trans_sub.push(align[0].q_trans_sub);
                    me.q_rotation.push(align[0].q_rotation);
                    me.qt_start_end.push(align[0].segs);
                }

                me.mmdbidArray.push(mmdbid_q);

                queryDataArray.push(queryData);
            }
        }
    }

    me.mmdb_data_q = queryDataArray;

    me.loadOpmDataForChainalign(targetData, queryDataArray, chainidArray, me.mmdbidArray);
};
