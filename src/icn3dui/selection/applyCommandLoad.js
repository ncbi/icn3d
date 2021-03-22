/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.applyCommandLoad = function (commandStr) { var me = this, ic = me.icn3d; "use strict";
  //me.bCommandLoad = true;

  if(ic.atoms !== undefined && Object.keys(ic.atoms).length > 0) return;

  // chain functions together
  me.deferred2 = $.Deferred(function() {
  me.bAddCommands = false;
  var commandTransformation = commandStr.split('|||');

  var commandOri = commandTransformation[0].replace(/\s\s/g, ' ').trim();
  var command = commandOri.toLowerCase();

  if(command.indexOf('load') !== -1) { // 'load pdb [pdbid]'
    var load_parameters = command.split(' | ');

    var loadStr = load_parameters[0];
    if(load_parameters.length > 1) {
        var firstSpacePos = load_parameters[load_parameters.length - 1].indexOf(' ');
        me.cfg.inpara = load_parameters[load_parameters.length - 1].substr(firstSpacePos + 1);
        if(me.cfg.inpara === 'undefined') {
            me.cfg.inpara = '';
        }
    }

    // load pdb, mmcif, mmdb, cid
    var id = loadStr.substr(loadStr.lastIndexOf(' ') + 1);
    me.inputid = id;
    if(command.indexOf('load mmtf') !== -1) {
      me.cfg.mmtfid = id;
      me.downloadMmtf(id);
    }
    else if(command.indexOf('load pdb') !== -1) {
      me.cfg.pdbid = id;
      me.downloadPdb(id);
    }
    else if(command.indexOf('load opm') !== -1) {
      me.cfg.opmid = id;
      me.downloadOpm(id);
    }
    else if(command.indexOf('load mmcif') !== -1) {
      me.cfg.mmcifid = id;
      me.downloadMmcif(id);
    }
    else if(command.indexOf('load mmdb') !== -1) {
      me.cfg.mmdbid = id;

      me.downloadMmdb(id);
    }
    else if(command.indexOf('load gi') !== -1) {
      me.cfg.gi = id;
      me.downloadGi(id);
    }
    else if(command.indexOf('load seq_struc_ids') !== -1) {
      me.downloadBlast_rep_id(id);
    }
    else if(command.indexOf('load cid') !== -1) {
      me.cfg.cid = id;
      me.downloadCid(id);
    }
    else if(command.indexOf('load alignment') !== -1) {
      me.cfg.align = id;
      me.downloadAlignment(id);
    }
    else if(command.indexOf('load chainalignment') !== -1) {
      //load chainalignment [id] | resnum [resnum] | parameters [inpara]
      var urlArray = command.split(" | ");
      if(urlArray[1].indexOf('resnum') != -1) {
          me.cfg.resnum = urlArray[1].substr(urlArray[1].indexOf('resnum') + 7);
      }

      me.cfg.chainalign = id;
      me.downloadChainAlignment(id, me.cfg.resnum);
    }
    else if(command.indexOf('load url') !== -1) {
        var typeStr = load_parameters[1]; // type pdb
        var pos = (typeStr !== undefined) ? typeStr.indexOf('type ') : -1;
        var type = 'pdb';

        if(pos !== -1) {
            type = typeStr.substr(pos + 5);
        }

        me.cfg.url = id;
        me.downloadUrl(id, type);
    }
  }

  me.bAddCommands = true;
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferred2.promise();
};

iCn3DUI.prototype.applyCommandMap = function (command) { var me = this; "use strict";
  // chain functions together
  me.deferredMap = $.Deferred(function() { var ic = me.icn3d;
      //"set map 2fofc sigma 1.5"
      // or "set map 2fofc sigma 1.5 | [url]"
      var urlArray = command.split(" | ");

      var str = urlArray[0].substr(8);
      var paraArray = str.split(" ");

      if(paraArray.length == 3 && paraArray[1] == 'sigma') {
          var sigma = paraArray[2];
          var type = paraArray[0];

          if(urlArray.length == 2) {
              me.Dsn6ParserBase(urlArray[1], type, sigma);
          }
          else {
              me.Dsn6Parser(me.inputid, type, sigma);
          }
      }
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredMap.promise();
};

iCn3DUI.prototype.applyCommandEmmap = function (command) { var me = this; "use strict";
  // chain functions together
  me.deferredEmmap = $.Deferred(function() { var ic = me.icn3d;
      var str = command.substr(10);
      var paraArray = str.split(" ");

      if(paraArray.length == 2 && paraArray[0] == 'percentage') {
           if(iCn3DUI.prototype.DensityCifParser === undefined) {
               var url = "https://www.ncbi.nlm.nih.gov/Structure/icn3d/script/density_cif_parser.min.js";
               $.ajax({
                  url: url,
                  dataType: "script",
                  cache: true,
                  tryCount : 0,
                  retryLimit : 1,
                  success: function(data) {
                      var percentage = paraArray[1];
                      var type = 'em';

                      me.DensityCifParser(me.inputid, type, percentage, ic.emd);
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
           }
           else {
              var percentage = paraArray[1];
              var type = 'em';

              me.DensityCifParser(me.inputid, type, percentage, ic.emd);
           }
      }
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredEmmap.promise();
};

iCn3DUI.prototype.applyCommandSymmetryBase = function (command) { var me = this, ic = me.icn3d; "use strict";
    me.retrieveSymmetry(Object.keys(ic.structures)[0])
};

iCn3DUI.prototype.applyCommandSymmetry = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredSymmetry = $.Deferred(function() {
     me.applyCommandSymmetryBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSymmetry.promise();
};

iCn3DUI.prototype.applyCommandRealignBase = function (command) { var me = this, ic = me.icn3d; "use strict";
    me.realignOnSeqAlign();
};

iCn3DUI.prototype.applyCommandRealign = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredRealign = new $.Deferred(function() {
     me.applyCommandRealignBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredRealign.promise();
};

iCn3DUI.prototype.applyCommandGraphinteractionBase = function (command) { var me = this, ic = me.icn3d; "use strict";
    var paraArray = command.split(' | ');
    if(paraArray.length >= 3) {
        var setNameArray = paraArray[1].split(' ');
        var nameArray2 = setNameArray[0].split(',');
        var nameArray = setNameArray[1].split(',');

        var bHbond = paraArray[2].indexOf('hbonds') !== -1;
        var bSaltbridge = paraArray[2].indexOf('salt bridge') !== -1;
        var bInteraction = paraArray[2].indexOf('interactions') !== -1;

        var bHalogen = paraArray[2].indexOf('halogen') !== -1;
        var bPication = paraArray[2].indexOf('pi-cation') !== -1;
        var bPistacking = paraArray[2].indexOf('pi-stacking') !== -1;

        var bHbondCalc;
        if(paraArray.length >= 4) {
            bHbondCalc = (paraArray[3] == 'true') ? true : false;
        }

        me.setStrengthPara(paraArray);

        me.viewInteractionPairs(nameArray2, nameArray, bHbondCalc, 'graph',
            bHbond, bSaltbridge, bInteraction, bHalogen, bPication, bPistacking);
    }
};

iCn3DUI.prototype.applyCommandGraphinteraction = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredGraphinteraction = $.Deferred(function() {
     me.applyCommandGraphinteractionBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredGraphinteraction.promise();
};

iCn3DUI.prototype.applyCommandAnnotationsAndCddSiteBase = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
      if(command == "view annotations") {
          //if(me.cfg.showanno === undefined || !me.cfg.showanno) {
              me.showAnnotations();
          //}
      }
};

iCn3DUI.prototype.applyCommandAnnotationsAndCddSite = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredAnnoCddSite = $.Deferred(function() {
      me.applyCommandAnnotationsAndCddSiteBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredAnnoCddSite.promise();
};

iCn3DUI.prototype.applyCommandClinvarBase = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
      var pos = command.lastIndexOf(' '); // set annotation clinvar
      var type = command.substr(pos + 1);

      me.setAnnoTabClinvar();
};

iCn3DUI.prototype.applyCommandSnpBase = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
      var pos = command.lastIndexOf(' '); // set annotation clinvar
      var type = command.substr(pos + 1);

      me.setAnnoTabSnp();
};

iCn3DUI.prototype.applyCommandClinvar = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredClinvar = $.Deferred(function() {
      me.applyCommandClinvarBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredClinvar.promise();
};

iCn3DUI.prototype.applyCommandSnp = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredSnp = $.Deferred(function() {
      me.applyCommandSnpBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSnp.promise();
};

iCn3DUI.prototype.applyCommand3ddomainBase = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
      var pos = command.lastIndexOf(' ');
      var type = command.substr(pos + 1);

      if(type == '3ddomain' || type == 'all') {
          me.setAnnoTab3ddomain();
      }
};

iCn3DUI.prototype.applyCommand3ddomain = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferred3ddomain = $.Deferred(function() {
      me.applyCommand3ddomainBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferred3ddomain.promise();
};

iCn3DUI.prototype.applyCommandViewinteractionBase = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
     if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
         var structureArray = Object.keys(ic.structures);
         me.set2DDiagramsForAlign(structureArray[0].toUpperCase(), structureArray[1].toUpperCase());
     }
};

iCn3DUI.prototype.applyCommandViewinteraction = function (command) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredViewinteraction = $.Deferred(function() {
     me.applyCommandViewinteractionBase(command);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredViewinteraction.promise();
};
