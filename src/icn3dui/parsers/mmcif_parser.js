/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadMmcif = function (mmcifid) { var me = this, ic = me.icn3d; "use strict";
   var url, dataType;

   url = "https://files.rcsb.org/view/" + mmcifid + ".cif";

   dataType = "text";

   ic.bCid = undefined;

   me.setYourNote(mmcifid.toUpperCase() + ' (MMCIF) in iCn3D');

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
           url = me.baseUrl + "mmcifparser/mmcifparser.cgi";
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
                  //me.hideLoading();
              },
              success: function(data) {
                  me.loadMmcifData(data, mmcifid);
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

iCn3DUI.prototype.downloadMmcifSymmetry = function (mmcifid, type) { var me = this, ic = me.icn3d; "use strict";
  // chain functions together
  me.deferredSymmetry = $.Deferred(function() {
      me.downloadMmcifSymmetryBase(mmcifid, type);
  }); // end of me.deferred = $.Deferred(function() {

  return me.deferredSymmetry.promise();
};

iCn3DUI.prototype.downloadMmcifSymmetryBase = function (mmcifid, type) { var me = this, ic = me.icn3d; "use strict";
   var url, dataType;

   if(me.isMac()) { // safari has a problem in getting data from https://files.rcsb.org/header/
       url = "https://files.rcsb.org/view/" + mmcifid + ".cif";
   }
   else {
       url = "https://files.rcsb.org/header/" + mmcifid + ".cif";
   }

   dataType = "text";

   ic.bCid = undefined;

   $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data) {
          // notebook has a problem in posting data to mmcifparser.cgi
          if(me.cfg.notebook) {
            var lines = data.split('\n');

            var bEmd = false;
            var bOrganism = false, bStartOrganism = false;
            var bMatrix = false, bStartMatrix = false, matrixLineCnt = 0, matrixStr = '', comLine = '';
            var bResidues = false, bStartResidues = false, resStr = '';

            var prevLine = '';
            for (var i in lines) {
                var line = lines[i];

                //EMDB  EMD-3906
                if(line.substr(0, 10) == 'EMDB  EMD-') {
                    ic.emd = line.substr(6).trim();
                    bEmd = true;
                }
                else if(line.substr(0, 27) == '_entity_src_nat.common_name') {
                    ic.organism = line.substr(27).trim();
                    if(ic.organism) bOrganism = true;
                    bStartOrganism = true;
                }
                else if(bStartOrganism && !bOrganism && prevLine.substr(0, 23) == '_entity_src_nat.details') {
                    //1 1 sample 1 99  Human 'Homo sapiens' 9606 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
                    var itemArray = line.split(/\s+/);
                    ic.organism = (itemArray.length > 5) ? itemArray[5] : '';
                    bOrganism = true;
                }
                else if(prevLine.substr(0, 29) == '_pdbx_struct_oper_list.vector' && line.split(/\s+/).length > 2) {
                    //1 'identity operation'         1_555 x,y,z     1.0000000000  0.0000000000  0.0000000000 0.0000000000 0.0000000000  1.0000000000
                    //0.0000000000 0.0000000000 0.0000000000 0.0000000000 1.0000000000 0.0000000000

                    bStartMatrix = true;
                    ++matrixLineCnt;

                    var pos1 = line.indexOf(' ');
                    var pos2 = line.indexOf("' ");
                    comLine += line.substr(0, pos1) + line.substr(pos2 + 1);

                    matrixStr += '[';
                }
                else if(bStartMatrix && line.trim() == '#') {
                    // remove the last ','
                    if(matrixStr != '[') matrixStr = matrixStr.substr(0, matrixStr.length - 1);

                    matrixStr += ']';
                    bMatrix = true;
                    bStartMatrix = false;
                }
                else if(bStartMatrix && !bMatrix) {
                    ++matrixLineCnt;

                    if(matrixLineCnt % 2 == 0) {
                        comLine += line;
                        var itemArray = comLine.split(/\s+/);

                        if(itemArray[0] != 'X0' && itemArray[0] != 'P' && itemArray.length > 14) {
                            var m11 = itemArray[3], m12 = itemArray[4], m13 = itemArray[5], m14 = itemArray[6];
                            var m21 = itemArray[7], m22 = itemArray[8], m23 = itemArray[9], m24 = itemArray[10];
                            var m31 = itemArray[11], m32 = itemArray[12], m33 = itemArray[13], m34 = itemArray[14];

                            matrixStr += "[" + m11 + "," + m21 + "," + m31 + ", 0, " + m12 + "," + m22 + "," + m32 + ", 0, "
                              + m13 + "," + m23 + "," + m33 + ", 0, " + m14 + "," + m24 + "," + m34 + ", 1" + "],";
                        }

                        comLine = '';
                    }
                    else {
                        var pos1 = line.indexOf(' ');
                        var pos2 = line.indexOf("' ");
                        comLine += line.substr(0, pos1) + line.substr(pos2 + 1);
                    }
                }
                else if(bStartResidues && line.trim() == '#') {
                    // remove the last ','
                    if(resStr != '[') resStr = resStr.substr(0, resStr.length - 1);

                    resStr += ']';
                    bResidues = true;
                    bStartResidues = false;
                }
                else if(prevLine.trim() == '_pdbx_poly_seq_scheme.hetero' || (bStartResidues && !bResidues)) {
                    if(prevLine.trim() == '_pdbx_poly_seq_scheme.hetero') {
                        bStartResidues = true;
                        resStr += '[';
                    }

                    //A 1 1   ASP 1   1   ?   ?   ?   A . n
                    var itemArray = line.split(/\s+/);
                    var resn = itemArray[3];
                    var chain = itemArray[9];
                    var resi = itemArray[5];

                    var authResi = itemArray[6];

                    if(authResi == "?") {
                      resStr += "{\"resn\": \"" + resn + "\", \"chain\": \"" + chain + "\", \"resi\": " + resi + "},";
                    }
                }

                if(bOrganism && bMatrix && bResidues) {
                    break;
                }

                prevLine = line;
            }

            if(me.bAssemblyUseAsu) me.loadMmcifSymmetry(JSON.parse(matrixStr));

            var missingseq = JSON.parse(resStr);
            if(type === 'mmtfid' && missingseq !== undefined) {
                // adjust missing residues
                var maxMissingResi = 0, prevMissingChain = '';
                var chainMissingResidueArray = {};
                for(var i = 0, il = missingseq.length; i < il; ++i) {

                    var resn = missingseq[i].resn;
                    var chain = missingseq[i].chain;
                    var resi = missingseq[i].resi;

                    var chainNum = mmcifid + '_' + chain;

                    if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                    var resObject = {};
                    resObject.resi = resi;
                    resObject.name = ic.residueName2Abbr(resn).toLowerCase();

                    if(chain != prevMissingChain) {
                        maxMissingResi = 0;
                    }

                    // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                    if(!isNaN(resi) && (prevMissingChain == '' || (chain != prevMissingChain) || (chain == prevMissingChain && resi > maxMissingResi)) ) {
                        chainMissingResidueArray[chainNum].push(resObject);

                        maxMissingResi = resi;
                        prevMissingChain = chain;
                    }
                }

                ic.adjustSeq(chainMissingResidueArray);
            }

            if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
        }
        else { // if(!me.cfg.notebook) {
           url = me.baseUrl + "mmcifparser/mmcifparser.cgi";

           $.ajax({
              url: url,
              type: 'POST',
              data : {'mmcifheader': data},
              dataType: 'jsonp',
              cache: true,
              tryCount : 0,
              retryLimit : 1,
              success: function(data) {
                  if(data.emd !== undefined) ic.emd = data.emd;
                  if(data.organism !== undefined) ic.organism = data.organism;

                  if(me.bAssemblyUseAsu) me.loadMmcifSymmetry(data.assembly);

                  if(type === 'mmtfid' && data.missingseq !== undefined) {
                        // adjust missing residues
                        var maxMissingResi = 0, prevMissingChain = '';
                        var chainMissingResidueArray = {};
                        for(var i = 0, il = data.missingseq.length; i < il; ++i) {

                            var resn = data.missingseq[i].resn;
                            var chain = data.missingseq[i].chain;
                            var resi = data.missingseq[i].resi;

                            var chainNum = mmcifid + '_' + chain;

                            if(chainMissingResidueArray[chainNum] === undefined) chainMissingResidueArray[chainNum] = [];
                            var resObject = {};
                            resObject.resi = resi;
                            resObject.name = ic.residueName2Abbr(resn).toLowerCase();

                            if(chain != prevMissingChain) {
                                maxMissingResi = 0;
                            }

                            // not all listed residues are considered missing, e.g., PDB ID 4OR2, only the firts four residues are considered missing
                            if(!isNaN(resi) && (prevMissingChain == '' || (chain != prevMissingChain) || (chain == prevMissingChain && resi > maxMissingResi)) ) {
                                chainMissingResidueArray[chainNum].push(resObject);

                                maxMissingResi = resi;
                                prevMissingChain = chain;
                            }
                        }

                        ic.adjustSeq(chainMissingResidueArray);
                  }

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
        } // if(!me.cfg.notebook
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
};

iCn3DUI.prototype.loadMmcifData = function(data, mmcifid) { var me = this, ic = me.icn3d; "use strict";
    if(!mmcifid) mmcifid = data.mmcif;
    if(!mmcifid) mmcifid = 'stru';

    if (data.atoms !== undefined) {
        ic.init();

        if(data.emd !== undefined) ic.emd = data.emd;
        if(data.organism !== undefined) ic.organism = data.organism;

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

        //me.loadAtomDataIn(data, data.mmcif, 'mmcifid');
        me.deferredOpm = $.Deferred(function() {
              //me.loadMmcifOpmData(data, mmcifid);
              me.loadOpmData(data, mmcifid, undefined, 'mmcif');
        });

        return me.deferredOpm.promise();
    }
    else {
        alert('invalid atoms data.');
        return false;
    }
};

iCn3DUI.prototype.loadMmcifSymmetry = function(assembly) { var me = this, ic = me.icn3d; "use strict";
    // load assembly info
    //var assembly = data.assembly;
    //var pmatrix = data.pmatrix;

    for(var i = 0, il = assembly.length; i < il; ++i) {
      var mat4 = new THREE.Matrix4();
      mat4.fromArray(assembly[i]);

      ic.biomtMatrices[i] = mat4;
    }

    ic.asuCnt = ic.biomtMatrices.length;
};
