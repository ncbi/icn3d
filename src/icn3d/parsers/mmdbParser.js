/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {LoadAtomData} from '../parsers/loadAtomData.js';
import {OpmParser} from '../parsers/opmParser.js';
import {MmcifParser} from '../parsers/mmcifParser.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';

class MmdbParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    parseMmdbDataPart1(data, type) { let  ic = this.icn3d, me = ic.icn3dui;
        // if type is defined, always process target before query
        if(data.atoms === undefined && data.molid2rescount === undefined) {
            alert('invalid MMDB data.');
            return false;
        }

        if(type === undefined || type === 'target') {
            if(!ic.bStatefile) ic.init();

            ic.chainsColor = {}
            ic.chainsGene = {}
        }

        // used in download2Ddgm()
        if(type === 'query') {
            //ic.interactionData_q.push({"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues});
        }
        else {
            ic.interactionData = {"moleculeInfor": data.moleculeInfor, "intrac": data.intrac, "intracResidues": data.intracResidues}
        }

        if(type === 'query') {
            //ic.mmdb_data_q.push(data);
        }
        else {
            ic.mmdb_data = data;
        }

        let  id =(data.pdbId !== undefined) ? data.pdbId : data.mmdbId;
        if(type === 'query') {
            ic.inputid2 = id;
        }
        else {
            ic.inputid = id;
        }

        // get molid2color = {}, chain2molid = {}, molid2chain = {}
        let  labelsize = 40;

        let  molid2rescount = data.moleculeInfor;
        let  molid2color = {}, chain2molid = {}, molid2chain = {}

        //var html = "<table width='100%'><tr><td></td><th>#</th><th align='center'>Chain</th><th align='center'>Residue Count</th></tr>";

        let  index = 1;
        let  chainNameHash = {}
        for(let i in molid2rescount) {
          if(Object.keys(molid2rescount[i]).length === 0) continue;

          let  color =(molid2rescount[i].color === undefined) ? '#CCCCCC' : '#' +( '000000' + molid2rescount[i].color.toString( 16 ) ).slice( - 6 );
          let  chainName =(molid2rescount[i].chain === undefined) ? '' : molid2rescount[i].chain.trim();
          if(chainNameHash[chainName] === undefined) {
              chainNameHash[chainName] = 1;
          }
          else {
              ++chainNameHash[chainName];
          }

          let  chainNameFinal =(chainNameHash[chainName] === 1) ? chainName : chainName + chainNameHash[chainName].toString();
          let  chain = id + '_' + chainNameFinal;

          molid2color[i] = color;
          chain2molid[chain] = i;
          molid2chain[i] = chain;

          ic.chainsColor[chain] =(type !== undefined) ? me.parasCls.thr(ic.icn3dui.htmlCls.GREY8) : me.parasCls.thr(color);

          let  geneId =(molid2rescount[i].geneId === undefined) ? '' : molid2rescount[i].geneId;
          let  geneSymbol =(molid2rescount[i].geneSymbol === undefined) ? '' : molid2rescount[i].geneSymbol;
          let  geneDesc =(molid2rescount[i].geneDesc === undefined) ? '' : molid2rescount[i].geneDesc;
          ic.chainsGene[chain] = {'geneId': geneId, 'geneSymbol': geneSymbol, 'geneDesc': geneDesc}
          ++index;
        }

        //ic.molid2color = molid2color;
        //ic.chain2molid = chain2molid;
        ic.molid2chain = molid2chain;

        // small structure with all atoms
        // show surface options
        $("#" + ic.pre + "accordion5").show();

        //ic.loadAtomDataCls.loadAtomDataIn(data, id, 'mmdbid', undefined, type);
    }

    parseMmdbData(data, type, chainid, chainIndex, bLastQuery) { let  ic = this.icn3d, me = ic.icn3dui;
        if(type === undefined) {
            //ic.deferredOpm = $.Deferred(function() {
                  let  id =(data.pdbId !== undefined) ? data.pdbId : data.mmdbId;

                  this.loadMmdbOpmData(data, id, type);
            //});

            //return ic.deferredOpm.promise();

            return;
        }
        else {
            this.parseMmdbDataPart1(data, type);

            let  id =(data.pdbId !== undefined) ? data.pdbId : data.mmdbId;

            let  hAtoms = ic.loadAtomDataCls.loadAtomDataIn(data, id, 'mmdbid', undefined, type, chainid, chainIndex, bLastQuery);

            this.loadMmdbOpmDataPart2(data, id, type);

            return hAtoms;
        }
    }

    //Ajax call was used to get the atom data from the NCBI "mmdbid". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. If the structure
    //is too large, a 3D dgm will show up. You can select your interested chains to see the details.

    //Atom "data" from MMDB file was parsed to set up parameters for the 3D viewer by calling the function
    //loadAtomDataIn. The deferred parameter was resolved after the parsing so that other javascript code can be executed.
    downloadMmdb(mmdbid, bGi) { let  ic = this.icn3d, me = ic.icn3dui;
       let  thisClass = this;

       let  url;

       // b: b-factor, s: water, ft: pdbsite
       //&ft=1
       if(bGi) {
           url = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&simple=1&gi=" + mmdbid;
       }
       else {
           url = ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdb_strview.cgi?v=2&program=icn3d&b=1&s=1&ft=1&simple=1&uid=" + mmdbid;
       }

       // use asymmetric unit for BLAST search, e.g., https://www.ncbi.nlm.nih.gov/Structure/icn3d/full.html?from=blast&blast_rep_id=5XZC_B&query_id=1TUP_A&command=view+annotations;set+annotation+cdd;set+annotation+site;set+view+detailed+view;select+chain+5XZC_B;show+selection&log$=align&blast_rank=1&RID=EPUCYNVV014&buidx=0
       if(ic.icn3dui.cfg.blast_rep_id !== undefined) url += '&buidx=0';

       ic.bCid = undefined;

       if(ic.icn3dui.cfg.inpara !== undefined) {
         url += ic.icn3dui.cfg.inpara;
       }

       if(ic.chainids2resids === undefined) ic.chainids2resids = {} // ic.chainids2resids[chainid1][chainid2] = [resid, resid]

       $.ajax({
          url: url,
          dataType: 'jsonp',
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
            if(Object.keys(data.atoms).length == 0) { // for large structures such as 3J3Q
                // use mmtfid
                let  pdbid = data.pdbId;
                ic.mmtfParserCls.downloadMmtf(pdbid);

                return;
            }

            let  bCalphaOnly = me.utilsCls.isCalphaPhosOnly(data.atoms); //, 'CA');

            if(bCalphaOnly || data.atomCount <= ic.maxatomcnt) {
                thisClass.parseMmdbData(data);
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
                      ic.ParserUtilsCls.showLoading();
                  },
                  complete: function() {
                      //ic.ParserUtilsCls.hideLoading();
                  },
                  success: function(data2) {
                      thisClass.parseMmdbData(data2);
                  },
                  error : function(xhr, textStatus, errorThrown ) {
                    this.tryCount++;
                    if(this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }

                    if(bGi) {
                      alert("This gi " + mmdbid + " has no corresponding 3D structure...");
                    }
                    else {
                      alert("This mmdbid " + mmdbid + " with the parameters " + ic.icn3dui.cfg.inpara + " may not have 3D structure data. Please visit the summary page for details: " + ic.icn3dui.htmlCls.baseUrl + "pdb/" + mmdbid);
                    }

                    return;
                  } // success
                }); // ajax
            }
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }

            if(bGi) {
              alert("This gi " + mmdbid + " has no corresponding 3D structure...");
            }
            else {
              alert("This mmdbid " + mmdbid + " with the parameters " + ic.icn3dui.cfg.inpara + " may not have 3D structure data. Please visit the summary page for details: " + ic.icn3dui.htmlCls.baseUrl + "pdb/" + mmdbid);
            }

            return;
          } // success
        }); // ajax
    }

    downloadMmdbPart2(type) { let  ic = this.icn3d, me = ic.icn3dui;
        if(ic.bAssemblyUseAsu) { // set up symmetric matrices
            $("#" + ic.pre + "assemblyWrapper").show();
            ic.bAssembly = true;
        }
        else {
            $("#" + ic.pre + "assemblyWrapper").hide();
            ic.bAssembly = false;
        }

        if(ic.emd !== undefined) {
          $("#" + ic.pre + "mapWrapper1").hide();
          $("#" + ic.pre + "mapWrapper2").hide();
          $("#" + ic.pre + "mapWrapper3").hide();
        }
        else {
          $("#" + ic.pre + "emmapWrapper1").hide();
          $("#" + ic.pre + "emmapWrapper2").hide();
          $("#" + ic.pre + "emmapWrapper3").hide();
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        // use the original color from cgi output
        if(ic.icn3dui.cfg.blast_rep_id !== undefined) {
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);
        }
        else {
          ic.setColorCls.setColorByOptions(ic.opts, ic.atoms, true);
        }

        if(type === undefined) {
            ic.ParserUtilsCls.renderStructure();
            if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

            ic.html2ddgm = '';
            if(ic.icn3dui.cfg.show2d) {
                ic.icn3dui.htmlCls.dialogCls.openDlg('dl_2ddgm', 'Interactions');
                if(ic.bFullUi) {
                    //if(type === undefined) {
                        ic.ParserUtilsCls.download2Ddgm(ic.inputid.toUpperCase());
                    //}
                    //else {
                    //    ic.ParserUtilsCls.set2DDiagramsForAlign(ic.inputid2.toUpperCase(), ic.inputid.toUpperCase());
                        //ic.ParserUtilsCls.set2DDiagramsForChainalign(chainidArray);
                    //}
                }
            }
        }

        if((ic.icn3dui.cfg.align === undefined || ic.icn3dui.cfg.chainalign === undefined) && Object.keys(ic.structures).length == 1) {
            if($("#" + ic.pre + "alternateWrapper") !== null) $("#" + ic.pre + "alternateWrapper").hide();
        }

        //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }

    //Ajax call was used to get the atom data from the NCBI "gi". This function was deferred so that
    //it can be chained together with other deferred functions for sequential execution. Note that
    //only one structure corresponding to the gi will be shown. If there is no structures available
    //for the gi, a warning message will be shown.
    downloadGi(gi) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.bCid = undefined;
        let  bGi = true;
        this.downloadMmdb(gi, bGi);
    }

    //Ajax call was used to get the atom data from "sequence_id_comma_structure_id", comma-separated
    //NCBI protein accessions of a protein sequence and a chain of a 3D structure (e.g., 23491729,1TUP_A).
    //This function was deferred so that it can be chained together with other deferred functions for
    //sequential execution. Note that only one structure corresponding to the blast_rep_id will be shown.
    //If there is no structures available for the blast_rep_id, a warning message will be shown.
    downloadBlast_rep_id(sequence_structure_ids) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.bCid = undefined;

        let  idArray = sequence_structure_ids.split(',');
        ic.icn3dui.cfg.query_id = idArray[0];
        ic.icn3dui.cfg.blast_rep_id = idArray[1];

        let  mmdbid = ic.icn3dui.cfg.blast_rep_id.split('_')[0];

        this.downloadMmdb(mmdbid);
    }

    loadMmdbOpmData(data, pdbid, type) { let  ic = this.icn3d, me = ic.icn3dui;
      if(data.opm !== undefined && data.opm.rot !== undefined) {
          ic.bOpm = true;

    //      ic.selectedPdbid = pdbid;

          ic.opmParserCls.setOpmData(data);

          this.parseMmdbDataPart1(data, type);
          ic.loadAtomDataCls.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type);

          this.loadMmdbOpmDataPart2(data, pdbid, type);
      }
      else {
          this.parseMmdbDataPart1(data, type);
          ic.loadAtomDataCls.loadAtomDataIn(data, pdbid, 'mmdbid', undefined, type);
          this.loadMmdbOpmDataPart2(data, pdbid, type);
      }
    }

    loadMmdbOpmDataPart2(data, pdbid, type) { let  ic = this.icn3d, me = ic.icn3dui;
        let  thisClass = this;

        // set 3d domains
        let  structure = data.pdbId;

        if(type === undefined) ic.ParserUtilsCls.setYourNote(structure.toUpperCase() + '(MMDB) in iCn3D');

        for(let molid in data.domains) {
            let  chain = data.domains[molid].chain;
            let  domainArray = data.domains[molid].domains;

            for(let index = 0, indexl = domainArray.length; index < indexl; ++index) {
                let  domainName = structure + '_' + chain + '_3d_domain_' +(index+1).toString();
                ic.tddomains[domainName] = {}

                let  subdomainArray = domainArray[index].intervals;

                // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
                let  domainFromHash = {}, domainToHash = {}

                //var fromArray = [], toArray = [];
                //var resCnt = 0
                for(let i = 0, il = subdomainArray.length; i < il; ++i) {
                    let  domainFrom = Math.round(subdomainArray[i][0]) - 1; // 1-based
                    let  domainTo = Math.round(subdomainArray[i][1]) - 1;

                    if(domainFromHash.hasOwnProperty(domainFrom) || domainToHash.hasOwnProperty(domainTo)) {
                        continue; // do nothing for duplicated "from" or "to", e.g, PDBID 1ITW, 5FWI
                    }
                    else {
                        domainFromHash[domainFrom] = 1;
                        domainToHash[domainTo] = 1;
                    }

                    //fromArray.push(domainFrom + ic.baseResi[chnid]);
                    //toArray.push(domainTo + ic.baseResi[chnid]);
                    //resCnt += domainTo - domainFrom + 1;

                    for(let j = domainFrom; j <= domainTo; ++j) {
                        let  resid = structure + '_' + chain + '_' +(j+1).toString();
                        ic.tddomains[domainName][resid] = 1;
                    }
                }
            } // for each domainArray
        } // for each molid

        // "asuAtomCount" is defined when: 1) atom count is over the threshold 2) buidx=1 3) asu atom count is smaller than biological unit atom count
        ic.bAssemblyUseAsu =(data.asuAtomCount !== undefined) ? true : false;
        if(type !== undefined) {
            ic.bAssemblyUseAsu = false;

            this.downloadMmdbPart2(type);
        }
        else {
            $.when(ic.mmcifParserCls.downloadMmcifSymmetry(pdbid)).then(function() {
                thisClass.downloadMmdbPart2(type);
            });
        }
    }

    downloadUniprotid(uniprotid) { let  ic = this.icn3d, me = ic.icn3dui;
       // get gis
       let  url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=protein&retmode=json&id=" + uniprotid;

       ic.bCid = undefined;

       $.ajax({
          url: url,
          dataType: 'json',
          cache: true,
          tryCount : 0,
          retryLimit : 1,
          beforeSend: function() {
              //ic.ParserUtilsCls.showLoading();
          },
          complete: function() {
              //ic.ParserUtilsCls.hideLoading();
          },
          success: function(data) {
               let  giArray = data.result.uids;

               let  redirectUrl = "https://www.ncbi.nlm.nih.gov/structure?linkname=protein_structure&from_uid=" + giArray.join(',');
               window.open(redirectUrl, '_self');
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if(this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            return;
          }
        });
    }
}

export {MmdbParser}
