/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {LoadAtomData} from '../parsers/loadAtomData.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {LoadPDB} from '../parsers/loadPDB.js';

class AlignParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //Load the VAST+ structure alignment for the pair of structures "align", e.g., "align" could be "1HHO,4N7N".
    downloadAlignment(align) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        ic.opts['proteins'] = 'c alpha trace';

        var alignArray = align.split(',');
        //var ids_str =(alignArray.length === 2? 'uids=' : 'ids=') + align;
        var ids_str = 'ids=' + align;

    //    var url2 = ic.icn3dui.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    //    var url2 = ic.icn3dui.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c&b=1&s=1&w3d&' + ids_str;
    //    var url1 = ic.icn3dui.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=2&cmd=c1&b=1&s=1&d=1&' + ids_str;

        // combined url1 and url2
        var url2 = ic.icn3dui.htmlCls.baseUrl + 'vastplus/vastplus.cgi?v=3&cmd=c&b=1&s=1&w3d&' + ids_str;

        if(ic.icn3dui.cfg.inpara !== undefined) {
          //url1 += ic.icn3dui.cfg.inpara;
          url2 += ic.icn3dui.cfg.inpara;
        }

        ic.bCid = undefined;

        // define for 'align' only
        ic.pdbid_chain2title = {}

        if(ic.chainids2resids === undefined) ic.chainids2resids = {} // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

        var request = $.ajax({
           url: url2,
           dataType: 'jsonp',
           cache: true,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          }
        });

        var seqalign = {}

        var chained = request.then(function( data ) {
            seqalign = data.seqalign;
            if(seqalign === undefined) {
                alert("These two MMDB IDs " + alignArray + " do not have 3D alignment data.");
                return false;
            }

            // set ic.pdbid_molid2chain and ic.chainsColor
            ic.pdbid_molid2chain = {}
            ic.chainsColor = {}
            //ic.mmdbidArray = [];
            //for(var i in data) {

            for(var i = 0, il = 2; i < il; ++i) {
                //if(i === 'seqalign') continue;
                var mmdbTmp = data['alignedStructures'][0][i];

                //var pdbid =(data[i].pdbid !== undefined) ? data[i].pdbid : i;
                var pdbid =(mmdbTmp.pdbId !== undefined) ? mmdbTmp.pdbId : mmdbTmp.mmdbId;
                //ic.mmdbidArray.push(pdbid); // here two molecules are in alphabatic order, themaster molecule could not be the first one

                var chainNameHash = {} // chain name may be the same in assembly
                //for(var molid in mmdbTmp.molecules) {
                for(var j = 0, jl = mmdbTmp.molecules.length; j < jl; ++j) {
                  var molecule = mmdbTmp.molecules[j];
                  var molid = molecule.moleculeId;
                  var chainName = molecule.chain.trim();
                  if(chainNameHash[chainName] === undefined) {
                      chainNameHash[chainName] = 1;
                  }
                  else {
                      ++chainNameHash[chainName];
                  }

                  var finalChain =(chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();

                  ic.pdbid_molid2chain[pdbid + '_' + molid] = finalChain;

                  if(molecule.kind === 'p' || molecule.kind === 'n') {
                      ic.chainsColor[pdbid + '_' + finalChain] = me.parasCls.thr(ic.icn3dui.htmlCls.GREY8);
                  }
                }
            }

            //var index = 0;
            //for(var mmdbid in data) {
            ic.mmdbidArray = [];
            for(var i = 0, il = 2; i < il; ++i) {
                //if(index < 2) {
                    var mmdbTmp = data['alignedStructures'][0][i];

                    var pdbid = mmdbTmp.pdbId;
                    ic.mmdbidArray.push(pdbid);

                    var molecule = mmdbTmp.molecules;
                    for(var molname in molecule) {
                        var chain = molecule[molname].chain;
                        ic.pdbid_chain2title[pdbid + '_' + chain] = molecule[molname].name;
                    }
                //}

                //++index;
            }

            // get the color for each aligned chain pair
            ic.alignmolid2color = [];
            //ic.alignmolid2color[0] = {}
            //ic.alignmolid2color[1] = {}
            var colorLength = me.parasCls.stdChainColors.length;

            for(var i = 0, il = seqalign.length; i < il; ++i) {
                var molid1 = seqalign[i][0].moleculeId;
                var molid2 = seqalign[i][1].moleculeId;

                //ic.alignmolid2color[0][molid1] =(i+1).toString();
                //ic.alignmolid2color[1][molid2] =(i+1).toString();

                var tmpHash = {}
                tmpHash[molid1] =(i+1).toString();
                ic.alignmolid2color.push(tmpHash);

                tmpHash = {}
                tmpHash[molid2] =(i+1).toString();
                ic.alignmolid2color.push(tmpHash);
            }

            //var url3 = ic.icn3dui.htmlCls.baseUrl + 'mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&atomonly=1&uid=' + ic.mmdbidArray[0];
            //var url4 = ic.icn3dui.htmlCls.baseUrl + 'mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&atomonly=1&uid=' + ic.mmdbidArray[1];
            // need the parameter moleculeInfor
            var url3 = ic.icn3dui.htmlCls.baseUrl + 'mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=' + ic.mmdbidArray[0];
            var url4 = ic.icn3dui.htmlCls.baseUrl + 'mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&uid=' + ic.mmdbidArray[1];

            var d3 = $.ajax({
              url: url3,
              dataType: 'jsonp',
              cache: true,
              beforeSend: function() {
                  ic.ParserUtilsCls.showLoading();
              },
              complete: function() {
                  //ic.ParserUtilsCls.hideLoading();
              }
            });
            var d4 = $.ajax({
              url: url4,
              dataType: 'jsonp',
              cache: true,
              beforeSend: function() {
                  ic.ParserUtilsCls.showLoading();
              },
              complete: function() {
                  //ic.ParserUtilsCls.hideLoading();
              }
            });

            $.when( d3, d4 ).then(function( v3, v4 ) {
                // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
                //var data2 = v2[0];
                var data2 = data;
                var data3 = v3[0];
                var data4 = v4[0];

                if(data3.atoms !== undefined && data4.atoms !== undefined) {
                    ic.deferredOpm = $.Deferred(function() {
                        //ic.mmdbidArray = [];
                        //for(var i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
                        //    ic.mmdbidArray.push(data.alignedStructures[0][i].pdbId);
                        //}

                        ic.ParserUtilsCls.setYourNote((ic.mmdbidArray[0] + ',' + ic.mmdbidArray[1]).toUpperCase() + '(VAST+) in iCn3D');

                        // get transformation factors
                        var factor = 1; //10000;
                        //var scale = data2.transform.scale / factor;
                        var tMaster = data2.transform.translate.master;
                        var tMVector = new THREE.Vector3(tMaster[0] / factor, tMaster[1] / factor, tMaster[2] / factor);
                        var tSlave = data2.transform.translate.slave;
                        var tSVector = new THREE.Vector3(tSlave[0] / factor, tSlave[1] / factor, tSlave[2] / factor);
                        var rotation = data2.transform.rotate;
                        var rMatrix = [];
                        for(var i = 0, il = rotation.length; i < il; ++i) { // 9 elements
                            rMatrix.push(rotation[i] / factor);
                        }

                        // get sequence
                        ic.chainid2seq = {}
                        for(var chain in data3.sequences) {
                            var chainid = ic.mmdbidArray[0] + '_' + chain;
                            ic.chainid2seq[chainid] = data3.sequences[chain]; // ["0","D","ASP"],
                        }
                        for(var chain in data4.sequences) {
                            var chainid = ic.mmdbidArray[1] + '_' + chain;
                            ic.chainid2seq[chainid] = data4.sequences[chain]; // ["0","D","ASP"],
                        }

                        // atoms
                        var atomsM = data3.atoms;
                        var atomsS = data4.atoms;

                        // fix serialInterval
                        var nAtom1 = data3.atomCount;
                        var nAtom2 = data4.atomCount;

                        for(var i = 0, il = data2.alignedStructures[0].length; i < il; ++i) {
                          var structure = data2.alignedStructures[0][i];

                          structure.serialInterval = [];
                          if(i == 0) {
                              structure.serialInterval.push(1);
                              structure.serialInterval.push(nAtom1);
                          }
                          else if(i == 1) {
                              structure.serialInterval.push(nAtom1 + 1);
                              structure.serialInterval.push(nAtom1 + nAtom2);
                          }
                        }

                        var allAtoms = {}
                        for(var i in atomsM) {
                            var atm = atomsM[i];

                            atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
                            atm.coord.add(tMVector);

                            var x = atm.coord.x * rMatrix[0] + atm.coord.y * rMatrix[1] + atm.coord.z * rMatrix[2];
                            var y = atm.coord.x * rMatrix[3] + atm.coord.y * rMatrix[4] + atm.coord.z * rMatrix[5];
                            var z = atm.coord.x * rMatrix[6] + atm.coord.y * rMatrix[7] + atm.coord.z * rMatrix[8];

                            atm.coord.x = x;
                            atm.coord.y = y;
                            atm.coord.z = z;

                            allAtoms[i] = atm;
                        }

                        for(var i in atomsS) {
                            var atm = atomsS[i];

                            atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
                            atm.coord.add(tSVector);

                            // update the bonds
                            for(var j = 0, jl = atm.bonds.length; j < jl; ++j) {
                                atm.bonds[j] += nAtom1;
                            }

                            allAtoms[(parseInt(i) + nAtom1).toString()] = atm;
                        }

                        // combine data
                        var allData = {}
                        allData.alignedStructures = data2.alignedStructures;
                        allData.alignment = data2.alignment;
                        allData.atoms = allAtoms;

                        thisClass.loadOpmDataForAlign(allData, seqalign, ic.mmdbidArray);
                    });

                    return ic.deferredOpm.promise();
                }
                else {
                    alert('invalid atoms data.');
                    return false;
                }
            });
        });
    }

    downloadAlignmentPart2(data, seqalign, chainresiCalphaHash2) { var ic = this.icn3d, me = ic.icn3dui;
        //ic.init();
        ic.loadAtomDataCls.loadAtomDataIn(data, undefined, 'align', seqalign);

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        // show all
        var allAtoms = {}
        for(var i in ic.atoms) {
            allAtoms[i] = 1;
        }
        ic.dAtoms = allAtoms;
        ic.hAtoms = allAtoms;

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // change the default color to "Identity"
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        // memebrane is determined by one structure. But transform both structures
        if(chainresiCalphaHash2 !== undefined) ic.ParserUtilsCls.transformToOpmOriForAlign(ic.selectedPdbid, chainresiCalphaHash2, true);

        ic.ParserUtilsCls.renderStructure();

        if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

        ic.html2ddgm = '';

        // by default, open the seq alignment window
        //if(ic.icn3dui.cfg.show2d !== undefined && ic.icn3dui.cfg.show2d) ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
        if(ic.icn3dui.cfg.showalignseq) {
            ic.icn3dui.htmlCls.dialogCls.openDlg('dl_alignment', 'Select residues in aligned sequences');
        }

        if(ic.icn3dui.cfg.show2d && ic.bFullUi) {
            ic.ParserUtilsCls.set2DDiagramsForAlign(ic.mmdbidArray[0].toUpperCase(), ic.mmdbidArray[1].toUpperCase());
        }

        //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    loadOpmDataForAlign(data, seqalign, mmdbidArray) { var ic = this.icn3d, me = ic.icn3dui;
        var thisClass = this;

        var url, dataType;

        url = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[0].toLowerCase()+ ".pdb";

        dataType = "text";

        $.ajax({
          url: url,
          dataType: dataType,
          cache: true,
          //tryCount : 0,
          //retryLimit : 1,
          success: function(opmdata) {
              ic.selectedPdbid = mmdbidArray[0];

              ic.bOpm = true;
              var bVector = true;
              var chainresiCalphaHash = ic.loadPDBCls.loadPDB(opmdata, mmdbidArray[0], ic.bOpm, bVector); // defined in the core library

              $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
              $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

              $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
              $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

              ic.init(); // remove all previously loaded data
              thisClass.downloadAlignmentPart2(data, seqalign, chainresiCalphaHash);

              if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
          },
          error : function(xhr, textStatus, errorThrown ) {
            var url2 = "https://opm-assets.storage.googleapis.com/pdb/" + mmdbidArray[1].toLowerCase()+ ".pdb";

            $.ajax({
              url: url2,
              dataType: dataType,
              cache: true,
              //tryCount : 0,
              //retryLimit : 1,
              success: function(opmdata) {
                  ic.selectedPdbid = mmdbidArray[1];

                  ic.bOpm = true;
                  var bVector = true;
                  var chainresiCalphaHash = ic.loadPDBCls.loadPDB(opmdata, mmdbidArray[1], ic.bOpm, bVector); // defined in the core library

                  $("#" + ic.pre + "selectplane_z1").val(ic.halfBilayerSize);
                  $("#" + ic.pre + "selectplane_z2").val(-ic.halfBilayerSize);

                  $("#" + ic.pre + "extra_mem_z").val(ic.halfBilayerSize);
                  $("#" + ic.pre + "intra_mem_z").val(-ic.halfBilayerSize);

                  ic.init(); // remove all previously loaded data
                  thisClass.downloadAlignmentPart2(data, seqalign, chainresiCalphaHash);

                  if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
              },
              error : function(xhr, textStatus, errorThrown ) {
                  ic.init(); // remove all previously loaded data
                  thisClass.downloadAlignmentPart2(data, seqalign);

                  if(ic.deferredOpm !== undefined) ic.deferredOpm.resolve();
                  return;
              }
            });

            return;
          }
        });
    }
}

export {AlignParser}
