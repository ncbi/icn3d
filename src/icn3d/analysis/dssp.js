/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';

import {Html} from '../../html/html.js';

import {SaveFile} from '../export/saveFile.js';
import {PdbParser} from '../parsers/pdbParser.js';

class Dssp {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    applyDssp(bCalphaOnly) { var ic = this.icn3d, me = ic.icn3dui;
      var thisClass = this;

      var calphaonly =(bCalphaOnly) ? '1' : '0';

      // make it work for concatenated multiple PDB files
      var struArray = Object.keys(ic.structures);

      var ajaxArray = [];

      var url = ic.icn3dui.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
      for(var i = 0, il = struArray.length; i < il; ++i) {
           var pdbStr = '';
           pdbStr += ic.saveFileCls.getPDBHeader(i);

           var atomHash = {}
           var chainidArray = ic.structures[struArray[i]];

           for(var j = 0, jl = chainidArray.length; j < jl; ++j) {
             atomHash = me.hashUtilsCls.unionHash(atomHash, ic.chains[chainidArray[j]]);
           }

           pdbStr += ic.saveFileCls.getAtomPDB(atomHash, undefined, true);

           var dssp = $.ajax({
              url: url,
              type: 'POST',
              data: {'dssp':'t', 'calphaonly': calphaonly, 'pdbfile': pdbStr},
              dataType: 'jsonp',
              cache: true
           });

           ajaxArray.push(dssp);
      }

      //https://stackoverflow.com/questions/14352139/multiple-ajax-calls-from-array-and-handle-callback-when-completed
      //https://stackoverflow.com/questions/5518181/jquery-deferreds-when-and-the-fail-callback-arguments
      $.when.apply(undefined, ajaxArray).then(function() {
          thisClass.parseDsspData(arguments, struArray);
      })
      .fail(function() {
          thisClass.parseDsspData(arguments, struArray);
      });
    }

    parseDsspData(data, struArray) { var ic = this.icn3d, me = ic.icn3dui;
        var dataArray =(struArray.length == 1) ? [data] : data;

        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        //var data2 = v2[0];
        for(var index = 0, indexl = dataArray.length; index < indexl; ++index) {
            var ssHash = dataArray[index][0];

            if(ssHash !== undefined && JSON.stringify(ssHash).indexOf('Oops there was a problem') === -1) {
              for(var chainNum in ic.chainsSeq) {
                  var pos = chainNum.indexOf('_');

                  // one structure at a time
                  if(chainNum.substr(0, pos) != struArray[index]) continue;

                  var chain = chainNum.substr(pos + 1);

                  var residueObjectArray = ic.chainsSeq[chainNum];
                  var prevSS = 'coil';

                  for(var i = 0, il = residueObjectArray.length; i < il; ++i) {
                    var resi = residueObjectArray[i].resi;
                    var chain_resi = chain + '_' + resi;

                    var ssOneLetter = 'c';
                    if(ssHash.hasOwnProperty(chain_resi)) {
                        ssOneLetter = ssHash[chain_resi];
                    }
                    else if(ssHash.hasOwnProperty(' _' + resi)) {
                        ssOneLetter = ssHash[' _' + resi];
                    }
                    else if(ssHash.hasOwnProperty('_' + resi)) {
                        ssOneLetter = ssHash['_' + resi];
                    }

                    var ss;
                    if(ssOneLetter === 'H') {
                        ss = 'helix';
                    }
                    else if(ssOneLetter === 'E') {
                        ss = 'sheet';
                    }
                    else {
                        ss = 'coil';
                    }

                    // update ss in sequence window
                    //ic.chainsAn[chainNum][1][i] = ssOneLetter;

                    // assign atom ss, ssbegin, and ssend
                    var resid = chainNum + '_' + resi;

                    ic.secondaries[resid] = ssOneLetter;

                    // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                    var bSetPrevResidue = 0; // 0: no need to reset, 1: reset previous residue to "ssbegin = true", 2: reset previous residue to "ssend = true"

                    var ssbegin, ssend;
                    if(ss !== prevSS) {
                        if(prevSS === 'coil') {
                            ssbegin = true;
                            ssend = false;
                        }
                        else if(ss === 'coil') {
                            bSetPrevResidue = 2;
                            ssbegin = false;
                            ssend = false;
                        }
                        else if((prevSS === 'sheet' && ss === 'helix') ||(prevSS === 'helix' && ss === 'sheet')) {
                            bSetPrevResidue = 1;
                            ssbegin = true;
                            ssend = false;
                        }
                    }
                    else {
                            ssbegin = false;
                            ssend = false;
                    }

                    if(bSetPrevResidue == 1) { //1: reset previous residue to "ssbegin = true"
                        var prevResid = chainNum + '_' +(resi - 1).toString();
                        for(var j in ic.residues[prevResid]) {
                            ic.atoms[j].ssbegin = true;
                            ic.atoms[j].ssend = false;
                        }
                    }
                    else if(bSetPrevResidue == 2) { //2: reset previous residue to "ssend = true"
                        var prevResid = chainNum + '_' +(resi - 1).toString();
                        for(var j in ic.residues[prevResid]) {
                            ic.atoms[j].ssbegin = false;
                            ic.atoms[j].ssend = true;
                        }
                    }

                    // set the current residue
                    for(var j in ic.residues[resid]) {
                        ic.atoms[j].ss = ss;
                        ic.atoms[j].ssbegin = ssbegin;
                        ic.atoms[j].ssend = ssend;
                    }

                    prevSS = ss;
                  } // for each residue
              } // for each chain
            } // if no error
            else {
                console.log("DSSP calculation had a problem with this structure " + struArray[index] + "...");
            }
        }

        ic.pdbParserCls.loadPdbDataRender();

        if(ic.deferredSecondary !== undefined) ic.deferredSecondary.resolve();
    }
}

export {Dssp}
