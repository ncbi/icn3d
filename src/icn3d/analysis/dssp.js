/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Dssp {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async applyDssp(bCalphaOnly, bAppend) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      let calphaonly =(bCalphaOnly) ? '1' : '0';

      // make it work for concatenated multiple PDB files
      let struArray = Object.keys(ic.structures);

      let ajaxArray = [];

      let url = (window && window.location && window.location.hostname.indexOf('ncbi.nlm.nih.gov') != -1) ? "/Structure/mmcifparser/mmcifparser.cgi" :
        me.htmlCls.baseUrl + "mmcifparser/mmcifparser.cgi";
        
      for(let i = 0, il = struArray.length; i < il; ++i) {
           let pdbStr = '';

           let atomHash = {};
           let chainidArray = ic.structures[struArray[i]];

           for(let j = 0, jl = chainidArray.length; j < jl; ++j) {
             atomHash = me.hashUtilsCls.unionHash(atomHash, ic.chains[chainidArray[j]]);
           }

           pdbStr += ic.saveFileCls.getAtomPDB(atomHash, undefined, true);

           let dataObj = {'dssp':'t', 'calphaonly': calphaonly, 'pdbfile': pdbStr};
           let dssp = me.getAjaxPostPromise(url, dataObj);

           ajaxArray.push(dssp);
      }

        let allPromise = Promise.allSettled(ajaxArray);
        try {
            let dataArray = await allPromise;

            await thisClass.parseDsspData(dataArray, struArray, bAppend);

            if(!me.bNode) await ic.ParserUtilsCls.checkMemProteinAndRotate();
        }
        catch(err) {
            console.log("DSSP calculation had a problem with this structure " + struArray[0] + "...");

            await ic.pdbParserCls.loadPdbDataRender(bAppend);
        }
    }

    async parseDsspData(dataArray, struArray, bAppend) { let ic = this.icn3d, me = ic.icn3dui;
        //var dataArray =(struArray.length == 1) ? [data] : data;

        // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
        //var data2 = v2[0];
        for(let index = 0, indexl = dataArray.length; index < indexl; ++index) {
            //let ssHash = dataArray[index][0];
            //let ssHash = (me.bNode) ? dataArray[index] : dataArray[index].value;
            let ssHash = dataArray[index].value;

            if(ssHash !== undefined && JSON.stringify(ssHash).indexOf('Oops there was a problem') === -1) {
              for(let chainNum in ic.chainsSeq) {
                  let pos = chainNum.indexOf('_');
                  // one structure at a time
                  if(chainNum.substr(0, pos) != struArray[index]) continue;

                  let chain = chainNum.substr(pos + 1);

                  let residueObjectArray = ic.chainsSeq[chainNum];
                  let prevSS = 'coil', prevResi;

                  for(let i = 0, il = residueObjectArray.length; i < il; ++i) {
                    let resi = residueObjectArray[i].resi;
                    let chain_resi = chain + '_' + resi;

                    let ssOneLetter = 'c';
                    if(ssHash.hasOwnProperty(chain_resi)) {
                        ssOneLetter = ssHash[chain_resi];
                    }
                    else if(ssHash.hasOwnProperty(' _' + resi)) {
                        ssOneLetter = ssHash[' _' + resi];
                    }
                    else if(ssHash.hasOwnProperty('_' + resi)) {
                        ssOneLetter = ssHash['_' + resi];
                    }

                    let ss;
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
                    let resid = chainNum + '_' + resi;

                    ic.secondaries[resid] = ssOneLetter;

                    // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                    let bSetPrevResidue = 0; // 0: no need to reset, 1: reset previous residue to "ssbegin = true", 2: reset previous residue to "ssend = true"

                    let ssbegin, ssend;
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
                            //bSetPrevResidue = 1;
                            bSetPrevResidue = 2;
                            ssbegin = true;
                            ssend = false;
                        }
                    }
                    else {
                            ssbegin = false;
                            ssend = false;
                    }

                    if(bSetPrevResidue == 1) { //1: reset previous residue to "ssbegin = true"
                        let prevResid = chainNum + '_' + prevResi; //(resi - 1).toString();
                        for(let j in ic.residues[prevResid]) {
                            ic.atoms[j].ssbegin = true;
                            ic.atoms[j].ssend = false;
                        }
                    }
                    else if(bSetPrevResidue == 2) { //2: reset previous residue to "ssend = true"
                        let prevResid = chainNum + '_' + prevResi; //(resi - 1).toString();
                        for(let j in ic.residues[prevResid]) {
                            ic.atoms[j].ssbegin = false;
                            ic.atoms[j].ssend = true;
                        }
                    }

                    // set the current residue
                    for(let j in ic.residues[resid]) {
                        ic.atoms[j].ss = ss;
                        ic.atoms[j].ssbegin = ssbegin;
                        ic.atoms[j].ssend = ssend;
                    }

                    prevSS = ss;
                    prevResi = resi;
                  } // for each residue
              } // for each chain
            } // if no error
            else {
                console.log("DSSP calculation had a problem with this structure " + struArray[index] + "...");
            }
        }

        await ic.pdbParserCls.loadPdbDataRender(bAppend);

        ///// if(ic.deferredMmdbaf !== undefined) ic.deferredMmdbaf.resolve();
        /// if(ic.deferredSecondary !== undefined) ic.deferredSecondary.resolve();
    }
}

export {Dssp}
