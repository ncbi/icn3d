/**
* @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
*/

// show3DStructure is the main function to show 3D structure
iCn3DUI.prototype.show3DStructure = function() { var me = this; //"use strict";
  me.deferred = $.Deferred(function() {
    me.setViewerWidthHeight();

    var str1 = "<label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left (\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right (\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
    var str2 = "<span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div></td>";

    if(me.isMobile() || me.cfg.mobilemenu) {
        me.setTopMenusHtmlMobile(me.divid, str1, str2);
    }
    else {
        me.setTopMenusHtml(me.divid, str1, str2);
    }
    if(me.isSessionStorageSupported()) me.getCommandsBeforeCrash();
    //me.setViewerWidthHeight();
    var width = me.WIDTH; // - me.LESSWIDTH_RESIZE;
    var height = me.HEIGHT; // - me.LESSHEIGHT - me.EXTRAHEIGHT;
    me.oriWidth = width;
    me.oriHeight = height;
    me.allEventFunctions();
    me.allCustomEvents();
    var extraHeight = 0;
    if(me.cfg.showmenu == undefined || me.cfg.showmenu) {
        //extraHeight += 2*me.MENU_HEIGHT;
        extraHeight += me.MENU_HEIGHT;
    }
    if(me.cfg.showcommand == undefined || me.cfg.showcommand) {
        extraHeight += me.CMD_HEIGHT;
    }
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
      me.hideMenu();
    }
    else {
      me.showMenu();
    }
    if(me.cfg.showtitle != undefined && me.cfg.showtitle == false) {
      $("#" + me.pre + "title").hide();
    }
    else {
      $("#" + me.pre + "title").show();
    }
    $("#" + me.pre + "viewer").width(width).height(parseInt(height) + extraHeight);
    $("#" + me.pre + "canvas").width(width).height(parseInt(height));
    $("#" + me.pre + "canvas").resizable({
      resize: function( event, ui ) {
        me.WIDTH = $("#" + me.pre + "canvas").width();
        me.HEIGHT = $("#" + me.pre + "canvas").height();
        if(me.icn3d !== undefined && !me.icn3d.bFullscreen) {
            me.resizeCanvas(me.WIDTH, me.HEIGHT, true);
        }
      }
    });
    me.icn3d = new iCn3D(me.pre + 'canvas');
    var ic = me.icn3d;

    if(me.cfg.usepdbnum !== undefined) {
        me.icn3d.bUsePdbNum = me.cfg.usepdbnum;
    }
    else {
        if(me.cfg.date !== undefined) {
            me.icn3d.bUsePdbNum = (parseInt(me.cfg.date) >= 20201222) ? true : false;
        }
        else {
            // iCn3D paper
            if(me.cfg.mmdbid == '1tup' && me.cfg.showanno == 1 && me.cfg.show2d == 1 && me.cfg.showsets == 1) {
                me.icn3d.bUsePdbNum = false;
            }
            //https://link.springer.com/article/10.1007/s00239-020-09934-4/figures/1
            else if(me.cfg.mmdbid == '118496' && me.cfg.showanno == 0 && me.cfg.inpara.indexOf('bu=1') != -1) {
                me.icn3d.bUsePdbNum = false;
            }
            //https://link.springer.com/article/10.1007/s00239-020-09934-4/figures/6
            else if(me.cfg.align == '163605,1,91105,1,1,1' && me.cfg.inpara.indexOf('atype=1') != -1) {
                me.icn3d.bUsePdbNum = false;
            }
            else {
                me.icn3d.bUsePdbNum = true;
            }
        }
    }

    if(me.cfg.replay) {
        me.bReplay = 1;
        $("#" + me.pre + "replay").show();
    }
    else {
        me.bReplay = 0;
        $("#" + me.pre + "replay").hide();
    }
    if(me.isMobile()) ic.threshbox = 60;
    if(me.cfg.controlGl) {
        ic.bControlGl = true;
        ic.container = (ic.bControlGl) ? $(document) : $('#' + ic.id);
    }
    ic.setControl(); // rotation, translation, zoom, etc
    me.handleContextLost();
    ic.setWidthHeight(width, height);
    ic.ori_chemicalbinding = me.opts['chemicalbinding'];
    if(me.cfg.bCalphaOnly !== undefined) ic.bCalphaOnly = me.cfg.bCalphaOnly;
    //me.deferred = undefined; // sequential calls
    ic.opts = ic.cloneHash(me.opts);
    me.STATENUMBER = ic.commands.length;
    // If previously crashed, recover it
    if(me.isSessionStorageSupported() && me.bCrashed) {
        me.bCrashed = false;
        var loadCommand = me.commandsBeforeCrash.split('|||')[0];
        var id = loadCommand.substr(loadCommand.lastIndexOf(' ') + 1);
        // reload only if viewing the same structure
        if(id === me.cfg.mmtfid || id === me.cfg.pdbid || id === me.cfg.opmid || id === me.cfg.mmdbid || id === me.cfg.gi  || id === me.cfg.blast_rep_id
          || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align || id === me.cfg.chainalign) {
            me.loadScript(me.commandsBeforeCrash, true);
            return;
        }
    }
    ic.molTitle = '';
    me.loadCmd;
    if(me.cfg.url !== undefined) {
        var type_url = me.cfg.url.split('|');
        var type = type_url[0];
        var url = type_url[1];
        ic.molTitle = "";
        me.inputid = url;
        me.loadCmd = 'load url ' + url + ' | type ' + type;
        me.setLogCmd(me.loadCmd, true);
        me.downloadUrl(url, type);
    }
    else if(me.cfg.mmtfid !== undefined) {
       me.inputid = me.cfg.mmtfid;
       me.loadCmd = 'load mmtf ' + me.cfg.mmtfid;
       me.setLogCmd(me.loadCmd, true);
       me.downloadMmtf(me.cfg.mmtfid);
    }
    else if(me.cfg.pdbid !== undefined) {
       me.inputid = me.cfg.pdbid;
       me.loadCmd = 'load pdb ' + me.cfg.pdbid;
       me.setLogCmd(me.loadCmd, true);
       me.downloadPdb(me.cfg.pdbid);
    }
    else if(me.cfg.opmid !== undefined) {
       me.inputid = me.cfg.opmid;
       me.loadCmd = 'load opm ' + me.cfg.opmid;
       me.setLogCmd(me.loadCmd, true);
       me.downloadOpm(me.cfg.opmid);
    }
    else if(me.cfg.mmdbid !== undefined) {
       me.inputid = me.cfg.mmdbid;
       me.loadCmd = 'load mmdb ' + me.cfg.mmdbid + ' | parameters ' + me.cfg.inpara;
       me.setLogCmd(me.loadCmd, true);
       me.downloadMmdb(me.cfg.mmdbid);
    }
    else if(me.cfg.gi !== undefined) {
       me.loadCmd = 'load gi ' + me.cfg.gi;
       me.setLogCmd(me.loadCmd, true);
       me.downloadGi(me.cfg.gi);
    }
    else if(me.cfg.blast_rep_id !== undefined) {
       // custom seqeunce has query_id such as "Query_78989" in BLAST
       if(me.cfg.query_id.substr(0,5) !== 'Query' && me.cfg.rid === undefined) {
           me.inputid = me.cfg.query_id + '_' + me.cfg.blast_rep_id;
           me.loadCmd = 'load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
           me.setLogCmd(me.loadCmd, true);
           me.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
       }
       else if(me.cfg.rid !== undefined) {
           var url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?RESULTS_FILE=on&FORMAT_TYPE=JSON2_S&FORMAT_OBJECT=Alignment&CMD=Get&RID=" + me.cfg.rid; // e.g., RID=EFTRU3W5014
           $.ajax({
              url: url,
              dataType: 'json',
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                for(var q = 0, ql = data.BlastOutput2.length; q < ql; ++q) {
                  if(data.BlastOutput2[q].report.results.search.query_id != me.cfg.query_id) continue;
                  var hitArray = data.BlastOutput2[q].report.results.search.hits;
                  var qseq = undefined;
                  for(var i = 0, il = hitArray.length; i < il; ++i) {
                    var hit = hitArray[i];
                    var bFound = false;
                    for(var j = 0, jl = hit.description.length; j < jl; ++j) {
                      var acc = hit.description[j].accession;
                      if(acc == me.cfg.blast_rep_id) {
                        bFound = true;
                        break;
                      }
                    }
                    if(bFound) {
                      qseq = hit.hsps[0].qseq;
                      //remove gap '-'
                      qseq = qseq.replace(/-/g, '');
                      break;
                    }
                  }
                  if(qseq !== undefined) me.cfg.query_id = qseq;
                  me.inputid = me.cfg.query_id + '_' + me.cfg.blast_rep_id;
                  me.loadCmd = 'load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
                  me.setLogCmd(me.loadCmd, true);
                  me.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
                  break;
                }
              },
              error : function(xhr, textStatus, errorThrown ) {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                else {
                    alert('The RID ' + me.cfg.rid + ' may have expired...');
                }
                return;
              }
           });
       }
       else {
           alert('BLAST "RID" is a required parameter...');
       }
    }
    else if(me.cfg.cid !== undefined) {
       me.inputid = me.cfg.cid;
       var url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + me.inputid + "/description/jsonp";
       $.ajax({
          url: url,
          dataType: 'jsonp',
          tryCount : 0,
          retryLimit : 1,
          success: function(data) {
              if(data.InformationList !== undefined && data.InformationList.Information !== undefined) ic.molTitle = data.InformationList.Information[0].Title;
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
        me.loadCmd = 'load cid ' + me.cfg.cid;
        me.setLogCmd(me.loadCmd, true);
        me.downloadCid(me.cfg.cid);
    }
    else if(me.cfg.mmcifid !== undefined) {
        me.inputid = me.cfg.mmcifid;
        me.loadCmd = 'load mmcif ' + me.cfg.mmcifid;
        me.setLogCmd(me.loadCmd, true);
        me.downloadMmcif(me.cfg.mmcifid);
    }
    else if(me.cfg.align !== undefined) {
        var alignArray = me.cfg.align.split(','); // e.g., 6 IDs: 103701,1,4,68563,1,167 [mmdbid1,biounit,molecule,mmdbid2,biounit,molecule], or 2IDs: 103701,68563 [mmdbid1,mmdbid2]
        if(alignArray.length === 6) {
            me.inputid = alignArray[0] + "_" + alignArray[3];
        }
        else if(alignArray.length === 2) {
            me.inputid = alignArray[0] + "_" + alignArray[1];
        }
        me.loadCmd = 'load alignment ' + me.cfg.align + ' | parameters ' + me.cfg.inpara;
        me.setLogCmd(me.loadCmd, true);
        me.downloadAlignment(me.cfg.align);
    }
    else if(me.cfg.chainalign !== undefined) {
        ic.bChainAlign = true;
        me.inputid = me.cfg.chainalign;
        me.loadCmd = 'load chainalignment ' + me.cfg.chainalign + ' | resnum ' + me.cfg.resnum + ' | parameters ' + me.cfg.inpara;
        me.setLogCmd(me.loadCmd, true);
        me.downloadChainAlignment(me.cfg.chainalign, me.cfg.resnum);
    }
    else if(me.cfg.command !== undefined && me.cfg.command !== '') {
        if(me.cfg.command.indexOf('url=') !== -1) me.bInputUrlfile = true;
        me.loadScript(me.cfg.command);
    }
    else {
        //alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
        me.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
    }
  });
  return me.deferred.promise();
};

