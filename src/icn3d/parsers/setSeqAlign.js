/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class SetSeqAlign {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    setSeqAlign(seqalign, alignedStructures) { let ic = this.icn3d, me = ic.icn3dui;
          //loadSeqAlignment
          let alignedAtoms = {}
          let mmdbid1 = alignedStructures[0][0].pdbId;
          let mmdbid2 = alignedStructures[0][1].pdbId;

          ic.conservedName1 = mmdbid1 + '_cons';
          ic.nonConservedName1 = mmdbid1 + '_ncons';
          ic.notAlignedName1 = mmdbid1 + '_nalign';

          ic.conservedName2 = mmdbid2 + '_cons';
          ic.nonConservedName2 = mmdbid2 + '_ncons';
          ic.notAlignedName2 = mmdbid2 + '_nalign';

          ic.consHash1 = {}
          ic.nconsHash1 = {}
          ic.nalignHash1 = {}

          ic.consHash2 = {}
          ic.nconsHash2 = {}
          ic.nalignHash2 = {}

          for(let i = 0, il = seqalign.length; i < il; ++i) {
              // first sequence
              let alignData = seqalign[i][0];
              let molid1 = alignData.moleculeId;

              let chain1 = ic.pdbid_molid2chain[mmdbid1 + '_' + molid1];
              let chainid1 = mmdbid1 + '_' + chain1;

              let id2aligninfo = {};
              let start = alignData.sequence.length, end = -1;
              let bStart = false;
              for(let j = 0, jl = alignData.sequence.length; j < jl; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //let offset =(ic.chainid2offset[chainid1]) ? ic.chainid2offset[chainid1] : 0;
                  //let resi =(ic.bUsePdbNum) ? alignData.sequence[j][0] + offset : alignData.sequence[j][0];
                  let resi =(ic.bUsePdbNum) ? ic.ParserUtilsCls.getResi(chainid1, alignData.sequence[j][0] - 1) : alignData.sequence[j][0];
                  let resn =(alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
                  resn =(resn === ' ' || resn === '') ? 'X' : resn;
                  //resn = resn.toUpperCase();

                  let aligned =(alignData.sequence[j][3]) ? 1 : 0; // alignData.sequence[j][3]: 0, false, 1, true

                  if(aligned == 1) {
                      if(j < start && !bStart) {
                          start = j;
                          bStart = true; // set start just once
                      }
                      if(j > end) end = j;
                  }

                  id2aligninfo[j] = {"resi": resi, "resn": resn, "aligned": aligned}
              }

              // second sequence
              alignData = seqalign[i][1];
              let molid2 = alignData.moleculeId;

              let chain2 = ic.pdbid_molid2chain[mmdbid2 + '_' + molid2];
              let chainid2 = mmdbid2 + '_' + chain2;

              // annoation title for the master seq only
              if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];
              if(ic.alnChainsAnTtl[chainid1][0] === undefined ) ic.alnChainsAnTtl[chainid1][0] = [];
              if(ic.alnChainsAnTtl[chainid1][1] === undefined ) ic.alnChainsAnTtl[chainid1][1] = [];
              if(ic.alnChainsAnTtl[chainid1][2] === undefined ) ic.alnChainsAnTtl[chainid1][2] = [];
              if(ic.alnChainsAnTtl[chainid1][3] === undefined ) ic.alnChainsAnTtl[chainid1][3] = [];
              if(ic.alnChainsAnTtl[chainid1][4] === undefined ) ic.alnChainsAnTtl[chainid1][4] = [];
              if(ic.alnChainsAnTtl[chainid1][5] === undefined ) ic.alnChainsAnTtl[chainid1][5] = [];
              if(ic.alnChainsAnTtl[chainid1][6] === undefined ) ic.alnChainsAnTtl[chainid1][6] = [];

              // two annotations without titles
              ic.alnChainsAnTtl[chainid1][0].push(chainid2);
              ic.alnChainsAnTtl[chainid1][1].push(chainid1);
              ic.alnChainsAnTtl[chainid1][2].push("");
              ic.alnChainsAnTtl[chainid1][3].push("");

              // 2nd chain title
              ic.alnChainsAnTtl[chainid1][4].push(chainid2);
              // master chain title
              ic.alnChainsAnTtl[chainid1][5].push(chainid1);
              // empty line
              ic.alnChainsAnTtl[chainid1][6].push("");

              let alignIndex = 1;
              if(!ic.chainsMapping[chainid1]) ic.chainsMapping[chainid1] = {};
              if(!ic.chainsMapping[chainid2]) ic.chainsMapping[chainid2] = {};
              //for(let j = 0, jl = alignData.sseq.length; j < jl; ++j) {
              for(let j = start; j <= end; ++j) {
                  // 0: internal resi id, 1: pdb resi id, 2: resn, 3: aligned or not
                  //let offset =(ic.chainid2offset[chainid2]) ? ic.chainid2offset[chainid2] : 0;
                  //let resi =(ic.bUsePdbNum) ? alignData.sequence[j][0] + offset : alignData.sequence[j][0];
                  let resi =(ic.bUsePdbNum) ? ic.ParserUtilsCls.getResi(chainid2, alignData.sequence[j][0] - 1) : alignData.sequence[j][0];
                  let resn =(alignData.sequence[j][2] === '~') ? '-' : alignData.sequence[j][2];
                  //resn = resn.toUpperCase();

                  let alignedTmp =(alignData.sequence[j][3]) ? 1 : 0; // alignData.sequence[j][3]: 0, false, 1, true

                  let aligned = id2aligninfo[j].aligned + alignedTmp; // 0 or 2

                  let color, color2, classname;
                  if(aligned === 2) { // aligned
                      if(id2aligninfo[j].resn === resn) {
                          color = '#FF0000';
                          classname = 'icn3d-cons';

                          ic.consHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          ic.consHash2[chainid2 + '_' + resi] = 1;
                      }
                      else {
                          color = '#0000FF';
                          classname = 'icn3d-ncons';

                          ic.nconsHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                          ic.nconsHash2[chainid2 + '_' + resi] = 1;
                      }

                      // mapping, use the firstsequence as the reference structure
                      ic.chainsMapping[chainid1][chainid1 + '_' + id2aligninfo[j].resi] = id2aligninfo[j].resn + id2aligninfo[j].resi;
                      ic.chainsMapping[chainid2][chainid2 + '_' + resi] = id2aligninfo[j].resn + id2aligninfo[j].resi;

                      color2 = '#' + ic.showAnnoCls.getColorhexFromBlosum62(id2aligninfo[j].resn, resn);

                      // expensive and thus remove
                      //alignedAtoms = me.hashUtilsCls.unionHash(alignedAtoms, ic.residues[chainid1 + '_' + id2aligninfo[j].resi]);
                      //alignedAtoms = me.hashUtilsCls.unionHash(alignedAtoms, ic.residues[chainid2 + '_' + resi]);
                  }
                  else {
                      color = me.htmlCls.GREY8;
                      classname = 'icn3d-nalign';

                      ic.nalignHash1[chainid1 + '_' + id2aligninfo[j].resi] = 1;
                      ic.nalignHash2[chainid2 + '_' + resi] = 1;
                  }

                  // chain1
                  if(ic.alnChainsSeq[chainid1] === undefined) ic.alnChainsSeq[chainid1] = [];

                  let resObject = {}
                  resObject.mmdbid = mmdbid1;
                  resObject.chain = chain1;
                  resObject.resi = id2aligninfo[j].resi;
                  // resi will be empty if there is no coordinates
                  resObject.resn =(resObject.resi === '' || classname === 'icn3d-nalign') ? id2aligninfo[j].resn.toLowerCase() : id2aligninfo[j].resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color =(resObject.resi === '') ? me.htmlCls.GREYC : color; // color by identity
                  resObject.color2 =(resObject.resi === '') ? me.htmlCls.GREYC : color2; // color by conservation
                  resObject.class = classname;

                  ic.alnChainsSeq[chainid1].push(resObject);

                  if(id2aligninfo[j].resi !== '') {
                      if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {}
                      $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + id2aligninfo[j].resi] );
                  }

                  // chain2
                  if(ic.alnChainsSeq[chainid2] === undefined) ic.alnChainsSeq[chainid2] = [];

                  resObject = {}
                  resObject.mmdbid = mmdbid2;
                  resObject.chain = chain2;
                  resObject.resi = resi;
                  // resi will be empty if there is no coordinates
                  resObject.resn =(resObject.resi === '' || classname === 'icn3d-nalign') ? resn.toLowerCase() : resn;
                  resObject.aligned = aligned;
                  // resi will be empty if there is no coordinates
                  resObject.color =(resObject.resi === '') ? me.htmlCls.GREYC : color; // color by identity
                  resObject.color2 =(resObject.resi === '') ? me.htmlCls.GREYC : color2; // color by conservation
                  resObject.class = classname;

                  ic.alnChainsSeq[chainid2].push(resObject);

                  if(resObject.resi !== '') {
                      if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {}
                      $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resi] );
                  }

                  // annotation is for the master seq only
                  if(ic.alnChainsAnno[chainid1] === undefined ) ic.alnChainsAnno[chainid1] = [];
                  if(ic.alnChainsAnno[chainid1][0] === undefined ) ic.alnChainsAnno[chainid1][0] = [];
                  if(ic.alnChainsAnno[chainid1][1] === undefined ) ic.alnChainsAnno[chainid1][1] = [];
                  if(ic.alnChainsAnno[chainid1][2] === undefined ) ic.alnChainsAnno[chainid1][2] = [];
                  if(ic.alnChainsAnno[chainid1][3] === undefined ) ic.alnChainsAnno[chainid1][3] = [];
                  if(j === start) {
                      // empty line
                      // 2nd chain title
                      if(ic.alnChainsAnno[chainid1][4] === undefined ) ic.alnChainsAnno[chainid1][4] = [];
                      // master chain title
                      if(ic.alnChainsAnno[chainid1][5] === undefined ) ic.alnChainsAnno[chainid1][5] = [];
                      // empty line
                      if(ic.alnChainsAnno[chainid1][6] === undefined ) ic.alnChainsAnno[chainid1][6] = [];

                      ic.alnChainsAnno[chainid1][4].push(ic.pdbid_chain2title[chainid2]);
                      ic.alnChainsAnno[chainid1][5].push(ic.pdbid_chain2title[chainid1]);
                      ic.alnChainsAnno[chainid1][6].push('');
                  }

                  let residueid1 = chainid1 + '_' + id2aligninfo[j].resi;
                  let residueid2 = chainid2 + '_' + resi;
                  let ss1 = ic.secondaries[residueid1];
                  let ss2 = ic.secondaries[residueid2];
                  if(ss2) {
                      ic.alnChainsAnno[chainid1][0].push(ss2);
                  }
                  else {
                      ic.alnChainsAnno[chainid1][0].push('-');
                  }

                  if(ss1) {
                      ic.alnChainsAnno[chainid1][1].push(ss1);
                  }
                  else {
                      ic.alnChainsAnno[chainid1][1].push('-');
                  }

                  let symbol = '.';
                  if(alignIndex % 5 === 0) symbol = '*';
                  if(alignIndex % 10 === 0) symbol = '|';
                  ic.alnChainsAnno[chainid1][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

                  let numberStr = '';
                  if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
                  ic.alnChainsAnno[chainid1][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

                  ++alignIndex;
              } // end for(let j           
          } // end for(let i

          seqalign = {};
    }

    getPosFromResi(chainid, resi) { let ic = this.icn3d, me = ic.icn3dui;
        let residNCBI = ic.resid2ncbi[chainid + '_' + resi];
        let pos = undefined;
        
        if(residNCBI) {
            let resiNCBI = residNCBI.substr(residNCBI.lastIndexOf('_') + 1);
            pos = resiNCBI - 1;
        }
        // else {
        //     //let il = ic.chainsSeq[chainid].length;
        //     let il = (ic.chainsSeq[chainid]) ? ic.chainsSeq[chainid].length : 0;
        //     for(let i = 0; i < il; ++i) {
        //         if(ic.chainsSeq[chainid][i].resi == resi) {
        //             pos = i;
        //             break;
        //         }
        //     }
        // }

        return pos;
    }

    getResnFromResi(chainid, resi) { let ic = this.icn3d, me = ic.icn3dui;
        /*
        let pos = this.getPosFromResi(chainid, resi);
        if(!pos) return '?';

        let resid = chainid + '_' + resi;
        let resn = '';

        if(ic.residues[resid] === undefined) {
            resn = (ic.chainsSeq[chainid][pos]) ? ic.chainsSeq[chainid][pos].name : '?';
        }
        else {
            resn = me.utilsCls.residueName2Abbr(ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]).resn.substr(0, 3));
        }

        return resn;
        */

        let resid = chainid + '_' + resi;
        let resn = ic.residueId2Name[resid];
        if(!resn) resn = '?';

        return resn;
    }

    getResiAferAlign(chainid, bRealign, pos) { let ic = this.icn3d, me = ic.icn3dui;
        let resi;
        if(bRealign && me.cfg.aligntool == 'tmalign') {
          resi = pos;
        }
        else {
          if(ic.posid2resid) {
              let resid = ic.posid2resid[chainid + '_' + pos];
              resi = resid.substr(resid.lastIndexOf('_') + 1);
          }
          else {
              resi = ic.chainsSeq[chainid][pos].resi;
          }
        }

        return resi;
    }

    setSeqAlignChain(chainid, chainIndex, chainidArray) { let ic = this.icn3d, me = ic.icn3dui;
        let hAtoms = {};

          let bRealign = (chainidArray) ? true : false;

          //loadSeqAlignment
          let alignedAtoms = {};
          let mmdbid1, mmdbid2, chain1, chain2, chainid1, chainid2, pos1, pos2;

          if(bRealign) { 
            // originally chainid2 is target,chainid1 is query
            // switch them so that chainid1 is the target
            chainid1 = chainidArray[1];
            chainid2 = chainidArray[0];

            chainIndex = chainidArray[2];

            pos1 = chainid1.indexOf('_');
            pos2 = chainid2.indexOf('_');

            mmdbid1 = chainid1.substr(0, pos1).toUpperCase();
            mmdbid2 = chainid2.substr(0, pos2).toUpperCase();

            chain1 = chainid1.substr(pos1 + 1);
            chain2 = chainid2.substr(pos1 + 1);

            if(mmdbid1 == mmdbid2 && chain1 == chain2) {
                let chainLen = ic.chainsSeq[mmdbid2 + '_' + chain2].length;
                ic.qt_start_end[chainIndex] =  {"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen}
            }

            if(mmdbid2 !== undefined && mmdbid2 === mmdbid1) {
                //chainid2 = mmdbid2 + me.htmlCls.postfix + "_" + chain2;
            }
          }
          else {
            //var chainidArray = me.cfg.chainalign.split(',');
            let pos1 = chainidArray[0].indexOf('_');
            let pos2 = chainid.indexOf('_');

            mmdbid1 = ic.mmdbid_t; //ic.chainidArray[0].substr(0, pos1).toUpperCase();
            mmdbid2 = chainid.substr(0, pos2).toUpperCase();

            chain1 = chainidArray[0].substr(pos1 + 1);
            chain2 = chainid.substr(pos2 + 1);

            if(mmdbid1 == mmdbid2 && chain1 == chain2) {
                let chainLen = ic.chainsSeq[ic.mmdbid_q + '_' + ic.chain_q].length;
                ic.qt_start_end[chainIndex] =  {"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen}
            }

            chainid1 = mmdbid1 + "_" + chain1;
            chainid2 = mmdbid2 + "_" + chain2;

            if(mmdbid2 !== undefined && mmdbid2 === ic.mmdbid_t) {
                //chainid2 = mmdbid2 + me.htmlCls.postfix + "_" + chain2;
            }
         }

          ic.conservedName1 = chainid1 + '_cons';
          ic.nonConservedName1 = chainid1 + '_ncons';
          ic.notAlignedName1 = chainid1 + '_nalign';

          ic.conservedName2 = chainid2 + '_cons';
          ic.nonConservedName2 = chainid2 + '_ncons';
          ic.notAlignedName2 = chainid2 + '_nalign';

          ic.consHash1 = {}
          ic.nconsHash1 = {}
          ic.nalignHash1 = {}

          ic.consHash2 = {}
          ic.nconsHash2 = {}
          ic.nalignHash2 = {}

          ic.alnChains = {}

          ic.alnChainsSeq[chainid1] = [];
          ic.alnChains[chainid1] = {};

          ic.alnChainsSeq[chainid2] = [];
          ic.alnChains[chainid2] = {};
          
          ic.alnChainsAnno[chainid1] = [];
          ic.alnChainsAnTtl[chainid1] = [];

          if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];
          for(let i = 0; i < 7; ++i) {
              if(ic.alnChainsAnTtl[chainid1][i] === undefined ) ic.alnChainsAnTtl[chainid1][i] = [];
          }

          // two annotations without titles
          ic.alnChainsAnTtl[chainid1][0].push(chainid2);
          ic.alnChainsAnTtl[chainid1][1].push(chainid1);
          ic.alnChainsAnTtl[chainid1][2].push("");
          ic.alnChainsAnTtl[chainid1][3].push("");

          // 2nd chain title
          ic.alnChainsAnTtl[chainid1][4].push(chainid2);
          // master chain title
          ic.alnChainsAnTtl[chainid1][5].push(chainid1);
          // empty line
          ic.alnChainsAnTtl[chainid1][6].push("");

          let color, color2, classname;
          let firstIndex1 = 0;
          let firstIndex2 = 0;
          let prevIndex1 = 0, prevIndex2 = 0;

          if(ic.qt_start_end[chainIndex] === undefined) return;

          let alignIndex = 1; // number of residues displayed in seq alignment
          if(!ic.chainsMapping[chainid1]) ic.chainsMapping[chainid1] = {};
          if(!ic.chainsMapping[chainid2]) ic.chainsMapping[chainid2] = {};

          let posChain1 = {}, posChain2 = {};

          for(let i = 0, il = ic.qt_start_end[chainIndex].length; i < il; ++i) {
            let start1, start2, end1, end2;
            if(bRealign && me.cfg.aligntool == 'tmalign') { // real residue numbers are stored, could be "100a"
                start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start);
                start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start);
                end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end);
                end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end); 
            }
            else {
              start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start - 1);
              start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start - 1);
              end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end - 1);
              end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end - 1);  
            }

            posChain1[start1] = 1;
            posChain1[end1] = 1;

            posChain2[start2] = 1;
            posChain2[end2] = 1;
          }

          for(let i = 0, il = ic.qt_start_end[chainIndex].length; i < il; ++i) {
              let start1, start2, end1, end2;
              if(bRealign && me.cfg.aligntool == 'tmalign') { // real residue numbers are stored
                start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start);
                start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start);
                end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end);
                end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end); 
              }
              else {
                start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start - 1);
                start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start - 1);
                end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end - 1);
                end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end - 1);  
              }

              if(i > 0) {
                  let index1 = alignIndex;

                  for(let j = prevIndex1 + 1, jl = start1; j < jl; ++j) {
                      if(posChain1[j]) continue;
                      posChain1[j] = 1;

                      if(ic.chainsSeq[chainid1] === undefined || ic.chainsSeq[chainid1][j] === undefined) break;

                      let resi = this.getResiAferAlign(chainid1, bRealign, j + 1);
                      //   let resn = (bRealign && me.cfg.aligntool == 'tmalign') ? this.getResnFromResi(chainid1, j).toLowerCase() : ic.chainsSeq[chainid1][j].name.toLowerCase();
                      let resn = this.getResnFromResi(chainid1, resi).toLowerCase();
                      
                      if(resn == '?') continue;

                      color = me.htmlCls.GREY8;
                      classname = 'icn3d-nalign';

                      ic.nalignHash1[chainid1 + '_' + resi] = 1;
                      this.setSeqPerResi(chainid1, chainid1, chainid2, resi, resn, false, color, undefined, classname, true, false, index1);
                      ++index1;
                  }

                  let index2 = alignIndex;
                  for(let j = prevIndex2 + 1, jl = start2; j < jl; ++j) {
                      if(posChain2[j]) continue;
                      posChain2[j] = 1;

                      if(ic.chainsSeq[chainid2] === undefined || ic.chainsSeq[chainid2] === undefined) break;

                      let resi = this.getResiAferAlign(chainid2, bRealign, j + 1);
                      //   let resn = (bRealign && me.cfg.aligntool == 'tmalign') ? this.getResnFromResi(chainid2, j).toLowerCase() : ic.chainsSeq[chainid2][j].name.toLowerCase();
                      let resn = this.getResnFromResi(chainid2, resi).toLowerCase();


                      if(resn == '?') continue;

                      color = me.htmlCls.GREY8;
                      classname = 'icn3d-nalign';

                      ic.nalignHash2[chainid2 + '_' + resi] = 1;
                      this.setSeqPerResi(chainid2, chainid1, chainid2, resi, resn, false, color, undefined, classname, false, false, index2);
                      ++index2; // count just once
                  }

                  if(index1 < index2) {
                      alignIndex = index2;

                      for(let j = 0; j < index2 - index1; ++j) {
                          let resi = '';
                          let resn = '-';

                          color = me.htmlCls.GREY8;
                          classname = 'icn3d-nalign';

                          this.setSeqPerResi(chainid1, chainid1, chainid2, resi, resn, false, color, undefined, classname, true, false, index1 + j);
                      }
                  }
                  else {
                      alignIndex = index1;

                      for(let j = 0; j < index1 - index2; ++j) {
                          let resi = '';
                          let resn = '-';

                          color = me.htmlCls.GREY8;
                          classname = 'icn3d-nalign';

                          this.setSeqPerResi(chainid2, chainid1, chainid2, resi, resn, false, color, undefined, classname, false, false, index2 + j);
                      }
                  }
              }
            
              for(let j = 0; j <= end1 - start1; ++j) {
                  if(ic.chainsSeq[chainid1] === undefined || ic.chainsSeq[chainid2] === undefined) break;

                  let resi1, resi2, resn1, resn2;
/*                 
                  if(bRealign) { // tmalign: just one residue in this for loop
                    if(me.cfg.aligntool == 'tmalign') {
                        resi1 = ic.qt_start_end[chainIndex][i].t_start;
                        resi2 = ic.qt_start_end[chainIndex][i].q_start;
                    }
                    else {
                        resi1 = j + start1;
                        resi2 = j + start2;
                    }

                    resn1 = this.getResnFromResi(chainid1, resi1).toUpperCase();
                    resn2 = this.getResnFromResi(chainid2, resi2).toUpperCase();

                    if(resn1 == '?' || resn2 == '?') continue;
                  }
*/
                  if(bRealign && me.cfg.aligntool == 'tmalign') { // tmalign: just one residue in this for loop
                    resi1 = ic.qt_start_end[chainIndex][i].t_start;
                    resi2 = ic.qt_start_end[chainIndex][i].q_start;

                    resn1 = this.getResnFromResi(chainid1, resi1).toUpperCase();
                    resn2 = this.getResnFromResi(chainid2, resi2).toUpperCase();

                    if(resn1 == '?' || resn2 == '?') continue;
                  }
                  else {
                    if(ic.chainsSeq[chainid1][j + start1] === undefined || ic.chainsSeq[chainid2][j + start2] === undefined) continue;

                    // resi1 = ic.chainsSeq[chainid1][j + start1].resi;
                    // resi2 = ic.chainsSeq[chainid2][j + start2].resi;
                    // resn1 = ic.chainsSeq[chainid1][j + start1].name.toUpperCase();
                    // resn2 = ic.chainsSeq[chainid2][j + start2].name.toUpperCase();

                    resi1 =  this.getResiAferAlign(chainid1, bRealign, j + start1 + 1);
                    resi2 =  this.getResiAferAlign(chainid2, bRealign, j + start2 + 1);
                    resn1 = this.getResnFromResi(chainid1, resi1).toUpperCase();
                    resn2 = this.getResnFromResi(chainid2, resi2).toUpperCase();
                  }

                  if(resn1 === resn2) {
                      color = '#FF0000';
                      classname = 'icn3d-cons';

                      ic.consHash1[chainid1 + '_' + resi1] = 1;
                      ic.consHash2[chainid2 + '_' + resi2] = 1;
                  }
                  else {
                      color = '#0000FF';
                      classname = 'icn3d-ncons';

                      ic.nconsHash1[chainid1 + '_' + resi1] = 1;
                      ic.nconsHash2[chainid2 + '_' + resi2] = 1;
                  }

                  hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[chainid1 + '_' + resi1]);
                  hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[chainid2 + '_' + resi2]);

                  // mapping, use the firstsequence as the reference structure
                  ic.chainsMapping[chainid1][chainid1 + '_' + resi1] = resn1 + resi1;
                  ic.chainsMapping[chainid2][chainid2 + '_' + resi2] = resn1 + resi1;

                  color2 = '#' + ic.showAnnoCls.getColorhexFromBlosum62(resn1, resn2);

                  let bFirstResi =(i === 0 && j === 0) ? true : false;
                  this.setSeqPerResi(chainid1, chainid1, chainid2, resi1, resn1, true, color, color2, classname, true, bFirstResi, alignIndex);
                  this.setSeqPerResi(chainid2, chainid1, chainid2, resi2, resn2, true, color, color2, classname, false, bFirstResi, alignIndex);

                  ++alignIndex;
              } // end for(let j

              prevIndex1 = end1;
              prevIndex2 = end2;
          } // end for(let i

          return hAtoms;
    }

    setSeqAlignChainForAll(chainidArray, index_alignLen, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        let hAtoms = {};

        let chainid1 = chainidArray[0];

        ic.alnChainsAnno[chainid1] = [];

        // 1. assign ic.alnChainsAnTtl
        ic.alnChainsAnTtl[chainid1] = [];

        let n = chainidArray.length;

        // Title
        if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];
        for(let i = 0; i < 3 + 2*n; ++i) {
            if(ic.alnChainsAnTtl[chainid1][i] === undefined ) ic.alnChainsAnTtl[chainid1][i] = [];
        }

        for(let i = 0; i < n; ++i) {
            ic.alnChainsAnTtl[chainid1][i].push(chainidArray[n-1 - i]);
        }

        // two annotations without titles
        ic.alnChainsAnTtl[chainid1][n].push("");
        ic.alnChainsAnTtl[chainid1][n + 1].push("");

        for(let i = n + 2; i < 2*n + 2; ++i) {
            ic.alnChainsAnTtl[chainid1][i].push(chainidArray[2*n + 1 - i]);
        }

        // empty line
        ic.alnChainsAnTtl[chainid1][2*n + 2].push("");

        // 2. assign ic.alnChainsSeq and ic.alnChains for all chains
        ic.alnChainsSeq[chainid1] = [];

        ic.alnChains = {};
        ic.alnChains[chainid1] = {};      

        let resi2range_t = {}; // accumulative aligned residues in the template chain
        // start and end of MSA
        let start_t = 9999, end_t = -1;

        let baseResi = ic.chainsSeq[chainid1][0].resi - 1;
        for(let index = 1, indexl = chainidArray.length; index < indexl; ++index) { 
            let chainIndex = index - 1;
            if(!ic.qt_start_end[chainIndex]) continue;

            for(let i = 0, il = ic.qt_start_end[chainIndex].length; i < il; ++i) {
                let start1, end1;
                
                // if(bRealign) { // real residue numbers are stored
                //     start1 = ic.qt_start_end[chainIndex][i].t_start;
                //     end1 = ic.qt_start_end[chainIndex][i].t_end;
                // }
                // else {
                    start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start) - 1;
                    end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end) - 1;
                // }
                for(let j = start1; j <= end1; ++j) {
                    let resi;

                    // if(me.cfg.aligntool == 'tmalign') { // tmalign: just one residue in this for loop
                    //     resi = ic.qt_start_end[chainIndex][i].t_start;
                    // }
                    // else {
                        let resiPos = (bRealign || me.cfg.aligntool != 'tmalign') ? j : j - baseResi;
                        resi = ic.ParserUtilsCls.getResi(chainidArray[0], resiPos);
                    // }

                    resi2range_t[resi] = 1;
                    if(j < start_t) start_t = j;
                    if(j > end_t) end_t = j;
                }
            }
        }
        
        // TM-align should use "start1 = ic.qt_start_end[chainIndex][i].t_start - 1", but the rest are the same as ""bRealign"
        if(me.cfg.aligntool == 'tmalign') bRealign = true; // real residue numbers are stored

        let resi2rangeArray = Object.keys(resi2range_t);
        resi2rangeArray.sort(function(a, b) {
            return parseInt(a) - parseInt(b);
        });

        // assign range to each resi
        let prevResi = -999, start = 0, end = 0, resiArray = [], prevEnd = 0;
        for(let i = 0, il = resi2rangeArray.length; i < il; ++i) {
            let resi = resi2rangeArray[i];
            
            if(i == 0) {
                start = resi;
            }
            else if(i > 0 && ic.resid2ncbi[resi] != ic.resid2ncbi[prevResi] + 1 && ic.resid2ncbi[resi] != ic.resid2ncbi[prevResi]) { // new start
                end = prevResi;
                for(let j = 0, jl = resiArray.length; j < jl; ++j) {
                    resi2range_t[resiArray[j]] = {resiStart: start, resiEnd: end, prevResiEnd: prevEnd};
                }

                resiArray = [];
                start = resi;
                prevEnd = end;
            }

            resiArray.push(resi);

            prevResi = resi;
        }

        end = prevResi;
        for(let j = 0, jl = resiArray.length; j < jl; ++j) {
            resi2range_t[resiArray[j]] = {resiStart: start, resiEnd: end, prevResiEnd: prevEnd};
        }

        for(let i = 0, il = chainidArray.length; i < il; ++i) { 
            let chainid = chainidArray[i];
            ic.alnChainsSeq[chainid] = [];
            ic.alnChains[chainid] = {}; 

            ic.alnChainsAnno[chainid] = []; 
        }

        // fill the template ic.alnChainsSeq[chainid1]
        for(let j = 0, jl = ic.chainsSeq[chainid1].length; j < jl; ++j) { 
            let resi = ic.chainsSeq[chainid1][j].resi;

            let jAdjusted = (me.cfg.aligntool != 'tmalign') ? j : j + baseResi;

            //if(j + baseResi < start_t || j + baseResi > end_t) {
            if(jAdjusted < start_t || jAdjusted > end_t) {    
                continue;
            }

            let resObject = {}
            let pos = chainid1.indexOf('_');
            resObject.mmdbid = chainid1.substr(0, pos);
            resObject.chain = chainid1.substr(pos+1);
            resObject.resi = resi;
            resObject.resn = (resi2range_t[resi]) ? ic.chainsSeq[chainid1][j].name.toUpperCase() : ic.chainsSeq[chainid1][j].name.toLowerCase();
            resObject.aligned = (resi2range_t[resi]) ? true : false;
            resObject.color = (resi2range_t[resi]) ? '#FF0000' : me.htmlCls.GREYC; // color by identity
            resObject.color2 = (resi2range_t[resi]) ? '#FF0000' : me.htmlCls.GREYC; // color by conservation
            resObject.class = (resi2range_t[resi]) ? 'icn3d-align' : 'icn3d-nalign';
    
            ic.alnChainsSeq[chainid1].push(resObject);

            if(resi2range_t[resi]) {
                $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + resObject.resi] );
                hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[chainid1 + '_' + resObject.resi]);
            }
        }

        // progressively merge sequences, starting from most similar to least similar
        // assign ic.alnChainsSeq
        let alignedChainIndice = [0];
        for(let arrayIndex = 0, arrayIndexl = index_alignLen.length; arrayIndex < arrayIndexl; ++arrayIndex) { 
            let index = index_alignLen[arrayIndex].index;
            alignedChainIndice.push(index);
            let hAtomsTmp = this.mergeTwoSeqForAll(chainidArray, index, alignedChainIndice, resi2range_t, start_t, end_t, bRealign);

            hAtoms = me.hashUtilsCls.unionHash(hAtoms, hAtomsTmp);
        }      
          
        // 3. assign the varaible ic.alnChainsAnno
        for(let i = 0; i < 3 + 2*n; ++i) {
            if(ic.alnChainsAnno[chainid1][i] === undefined ) ic.alnChainsAnno[chainid1][i] = [];
        }

        // secondary structures
        for(let i = 0; i < n; ++i) {
            let chainid = chainidArray[i];

            for(let j = 0, jl = ic.alnChainsSeq[chainid].length; j < jl; ++j) {
                let resn = ic.alnChainsSeq[chainid][j].resn;
                if(resn == '-') {
                    ic.alnChainsAnno[chainid1][n - 1 - i].push('-');  
                }
                else {
                    let resi = ic.alnChainsSeq[chainid][j].resi;
                    let residueid = chainid + '_' + resi;
                    let ss = ic.secondaries[residueid];

                    // push the annotations to the template chain
                    if(ss !== undefined) {
                        ic.alnChainsAnno[chainid1][n - 1 - i].push(ss);
                    }
                    else {
                        ic.alnChainsAnno[chainid1][n - 1 - i].push('-');
                    }
                }
            }
        }

        // residue number 
        for(let alignIndex = 0, alignIndexl = ic.alnChainsSeq[chainid1].length; alignIndex < alignIndexl; ++alignIndex) {
            let symbol = '.';
            if(alignIndex % 5 === 0) symbol = '*';
            if(alignIndex % 10 === 0) symbol = '|';
            ic.alnChainsAnno[chainid1][n].push(symbol); // symbol: | for 10th, * for 5th, . for rest

            let numberStr = '';
            if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
            ic.alnChainsAnno[chainid1][n + 1].push(numberStr); // symbol: 10, 20, etc, empty for rest
        }

        // title
        for(let i = n + 2; i < 2*n + 2; ++i) { // reverse order
            let title = ic.pdbid_chain2title && ic.pdbid_chain2title.hasOwnProperty(chainidArray[2*n + 1 - i]) ? ic.pdbid_chain2title[chainidArray[2*n + 1 - i]] : ""
            ic.alnChainsAnno[chainid1][i].push(title);
        }

        // empty line
        ic.alnChainsAnno[chainid1][2*n + 2].push("");    
        
        return hAtoms;
    }

    getResObject(chainid, bGap, bAligned, resi, resn, resn_t) { let ic = this.icn3d, me = ic.icn3dui;
        let resObject = {};
        let pos = chainid.indexOf('_');
        resObject.mmdbid = chainid.substr(0, pos);
        resObject.chain = chainid.substr(pos+1);
        resObject.resi = (bGap) ? '' : resi; // resi will be empty if there is no coordinates
        if(!resn) {
            resObject.resn = '-';
        }
        else {
            resObject.resn = (bGap) ? '-' : ((bAligned) ? resn.toUpperCase() : resn.toLowerCase());
        }
        resObject.aligned = (bGap) ? false : bAligned;
        resObject.color = (bGap || !bAligned) ? me.htmlCls.GREYC : ((resn == resn_t) ? "#FF0000" : "#0000FF"); // color by identity
        resObject.color2 = (bGap || !bAligned) ? me.htmlCls.GREYC : '#' + ic.showAnnoCls.getColorhexFromBlosum62(resn, resn_t); // color by conservation
        resObject.class = (bGap || !bAligned) ? 'icn3d-nalign' : 'icn3d-align';

        return resObject;
    }

    getResn(chainid, resiPos) { let ic = this.icn3d, me = ic.icn3dui;
        let resn;
  
        // if(bRealign) {
        //     let resid = chainid + '_' + resiPos;

        //     if(ic.residues[resid] === undefined) {
        //         resn = '';
        //     }
        //     else {
        //         resn = me.utilsCls.residueName2Abbr(ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]).resn.substr(0, 3));
        //     }
        // }
        // else {
            if(!ic.chainsSeq[chainid] || !ic.chainsSeq[chainid][resiPos]) {
                resn = '';
            }
            else {
                resn = ic.chainsSeq[chainid][resiPos].name;
            }
        // }

        return resn;
    }

    // getResnFromResid(resid) { let ic = this.icn3d, me = ic.icn3dui;
    //     return ic.residueId2Name[resid];
    // }

    getResiPosInTemplate(chainid1, resi_t) { let ic = this.icn3d, me = ic.icn3dui;
        // check the number of gaps before resiStart1 (nGap), and insert 'notAlnLen2 - notAlnLen1 - nGap' gaps
        let nGap = 0;

        let pos_t; // position to add gap

        if(ic.alnChainsSeq[chainid1]) {
            for(let j = 0, jl = ic.alnChainsSeq[chainid1].length; j < jl; ++j) {
                //add gap before the mapping region       
                if(parseInt(ic.alnChainsSeq[chainid1][j].resi) == parseInt(resi_t)) {
                    pos_t = j;
                    break;
                }

                if(ic.alnChainsSeq[chainid1][j].resn == '-') {
                    ++nGap;
                }
                else {
                    nGap = 0;
                }
            }
        }

        return {"pos": pos_t, "ngap": nGap};
    }

    addGapAllAlnChains(chainidArray, alignedChainIndice, chainid1, resi_t, len) { let ic = this.icn3d, me = ic.icn3dui;    
        let result = this.getResiPosInTemplate(chainid1, resi_t);
        let nGap = result.ngap, pos_t = result.pos;

        // add gaps for all previously aligned sequences, not the current sequence, which is the last one
        for(let j = 0, jl = alignedChainIndice.length - 1; j < jl; ++j) {
            let chainidTmp = chainidArray[alignedChainIndice[j]];
            let gapResObject = this.getResObject(chainidTmp, true);
            //for(let k = 0, kl = len - nGap; k < kl; ++k) {
            for(let k = 0, kl = len; k < kl; ++k) {
                ic.alnChainsSeq[chainidTmp].splice(pos_t, 0, gapResObject);
            }
        }

        //return len - nGap;
    }

    insertNotAlignRes(chainid, start, len, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        // insert non-aligned residues in query seq
        for(let j = 0, jl = len; j < jl; ++j) {
            let resi2 = ic.ParserUtilsCls.getResi(chainid, start + j);
            let resn2 = this.getResn(chainid, start + j);
            let resn1 = '-';
            let bAlign = false;
            let resObject = this.getResObject(chainid, false, bAlign, resi2, resn2, resn1)
            ic.alnChainsSeq[chainid].push(resObject);
        }
    }

    getTemplatePosFromOriPos(chainid1, start, end, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        let startResi = ic.ParserUtilsCls.getResi(chainid1, start);
        let endResi = ic.ParserUtilsCls.getResi(chainid1, end);
            
        let result1 = this.getResiPosInTemplate(chainid1, startResi);
        let result2 = this.getResiPosInTemplate(chainid1, endResi);
        
        return {"pos1": result1.pos, "pos2": result2.pos};
    }

    mergeTwoSeqForAll(chainidArray, index, alignedChainIndice, resi2range_t, start_t, end_t, bRealign) { let ic = this.icn3d, me = ic.icn3dui;
        let hAtoms = {};

        let chainid = chainidArray[index];
        let chainIndex = index - 1;

        //loadSeqAlignment
        let mmdbid1, mmdbid2, chain1, chain2, chainid1, chainid2;
        let pos1, pos2, from, to;

        pos1 = chainidArray[0].indexOf('_');
        pos2 = chainid.indexOf('_');

        //mmdbid1 = ic.mmdbid_t; 
        mmdbid1 = chainidArray[0].substr(0, pos1); //.toUpperCase();
        mmdbid2 = chainid.substr(0, pos2); //.toUpperCase()mergeTwoSeqForAll;

        chain1 = chainidArray[0].substr(pos1 + 1);
        chain2 = chainid.substr(pos2 + 1);

        if(mmdbid1 == mmdbid2 && chain1 == chain2) {
            let chainLen = ic.chainsSeq[ic.mmdbid_q + '_' + ic.chain_q].length;
            ic.qt_start_end[chainIndex] =  {"q_start":1, "q_end": chainLen, "t_start":1, "t_end": chainLen}
        }

        chainid1 = mmdbid1 + "_" + chain1;
        chainid2 = mmdbid2 + "_" + chain2;

        if(mmdbid2 !== undefined && mmdbid2 === ic.mmdbid_t) {
            //chainid2 = mmdbid2 + me.htmlCls.postfix + "_" + chain2;
        }

        //ic.alnChainsSeq[chainid2] = [];
        ic.alnChains[chainid2] = {};

        //ic.conservedName1 = chainid1 + '_cons';
        //ic.nonConservedName1 = chainid1 + '_ncons';
        //ic.notAlignedName1 = chainid1 + '_nalign';

        ic.conservedName2 = chainid2 + '_cons';
        ic.nonConservedName2 = chainid2 + '_ncons';
        ic.notAlignedName2 = chainid2 + '_nalign';

        //ic.consHash1 = {};
        //ic.nconsHash1 = {};
        //ic.nalignHash1 = {};

        ic.consHash2 = {};
        ic.nconsHash2 = {};
        ic.nalignHash2 = {};

        let color, color2, classname;
        let prevIndex1, prevIndex2;

        if(ic.qt_start_end[chainIndex] === undefined) return;

        let gapResObject1 = this.getResObject(chainid1, true);
        let gapResObject2 = this.getResObject(chainid2, true);

        let alignIndex = 0;
        // ic.chainsMapping is used for reference number
        if(!ic.chainsMapping[chainid1]) ic.chainsMapping[chainid1] = {};
        if(!ic.chainsMapping[chainid2]) ic.chainsMapping[chainid2] = {};

        let result, result1, result2;

        for(let i = 0, il = ic.qt_start_end[chainIndex].length; i < il; ++i) {
            let start1, start2, end1, end2, resiStart1, start1Pos, end1Pos;
            if(bRealign && me.cfg.aligntool == 'tmalign') { // real residue numbers are stored
                start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start);
                start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start);
                end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end);
                end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end);  

                // start1 = this.getPosFromResi(chainid1, ic.qt_start_end[chainIndex][i].t_start);
                // start2 = this.getPosFromResi(chainid2, ic.qt_start_end[chainIndex][i].q_start);
                // end1 = this.getPosFromResi(chainid1, ic.qt_start_end[chainIndex][i].t_end);
                // end2 = this.getPosFromResi(chainid2, ic.qt_start_end[chainIndex][i].q_end);

                // 1. before the mapped residues
                resiStart1 = start1;
                start1Pos = this.getPosFromResi(chainid1, ic.qt_start_end[chainIndex][i].t_start);
                end1Pos = this.getPosFromResi(chainid1, ic.qt_start_end[chainIndex][i].t_end);
            }
            else {
                start1 = parseInt(ic.qt_start_end[chainIndex][i].t_start - 1);
                start2 = parseInt(ic.qt_start_end[chainIndex][i].q_start - 1);
                end1 = parseInt(ic.qt_start_end[chainIndex][i].t_end - 1);
                end2 = parseInt(ic.qt_start_end[chainIndex][i].q_end - 1);  

                // 1. before the mapped residues
                resiStart1 = ic.ParserUtilsCls.getResi(chainid1, start1);
                start1Pos = start1;
                end1Pos = end1;
            }

            //let range = resi2range_t[resiStart1];
  
            // if the mapping does not start from start_t, add gaps to the query seq
            if(i == 0) {
                //result = this.getTemplatePosFromOriPos(chainid1, start_t, start1, bRealign);
                result = this.getTemplatePosFromOriPos(chainid1, start_t, start1Pos, bRealign);
                pos1 = result.pos1;
                pos2 = result.pos2;
                
                //if(start1 > start_t) {
                if(start1Pos > start_t) {
                    for(let j = 0, jl = pos2 - pos1; j < jl; ++j) {
                        ic.alnChainsSeq[chainid2].push(gapResObject2);
                    }
                }
            }
            else {
                //let notAlnLen1 = start1 - (prevIndex1 + 1);
                result = this.getTemplatePosFromOriPos(chainid1, prevIndex1, start1, bRealign);
                pos1 = result.pos1;
                pos2 = result.pos2;
                let notAlnLen1 = pos2 - (pos1 + 1);
                let notAlnLen2 = start2 - (prevIndex2 + 1);
                
                // insert non-aligned residues in query seq
                this.insertNotAlignRes(chainid2, prevIndex2+1, notAlnLen2, bRealign);

                if(notAlnLen1 >= notAlnLen2) {
                    // add gaps before the query sequence
                    for(let j = 0, jl = notAlnLen1 - notAlnLen2; j < jl; ++j) {
                        ic.alnChainsSeq[chainid2].push(gapResObject2);
                    }                       
                }
                else {
                    // check the number of gaps before resiStart1 (n), and insert 'notAlnLen2 - notAlnLen1 - n' gaps
                    this.addGapAllAlnChains(chainidArray, alignedChainIndice, chainid1, resiStart1, notAlnLen2 - notAlnLen1);
                }                           
            }

            // 2. In the mapped residues
            //result = this.getTemplatePosFromOriPos(chainid1, start1, end1, bRealign);
            result = this.getTemplatePosFromOriPos(chainid1, start1Pos, end1Pos, bRealign);
            pos1 = result.pos1;
            pos2 = result.pos2;
            
            let k = 0;    
            if(!ic.chainsMapping[chainid1]) ic.chainsMapping[chainid1] = {};
            if(!ic.chainsMapping[chainid2]) ic.chainsMapping[chainid2] = {};
            for(let j = pos1; j <= pos2; ++j) {
                // inherit the gaps from the template
                if(ic.alnChainsSeq[chainid1][j].resn == '-') {
                    ic.alnChainsSeq[chainid2].push(gapResObject2);
                }
                else {                   
                    let resi1 = (bRealign) ? start1 + k : ic.ParserUtilsCls.getResi(chainid1, start1 + k);
                    let resi2 = (bRealign) ? start2 + k : ic.ParserUtilsCls.getResi(chainid2, start2 + k);
                    let resn1 = this.getResnFromResi(chainid1, resi1); //this.getResn(chainid1, start1 + k);
                    let resn2 = this.getResnFromResi(chainid2, resi2); //this.getResn(chainid2, start2 + k);
                    
                    let bAlign = true;
                    let resObject = this.getResObject(chainid2, false, bAlign, resi2, resn2, resn1)
                    ic.alnChainsSeq[chainid2].push(resObject);
                    // update color in the template
                    ic.alnChainsSeq[chainid1][j].color = resObject.color;

                    ic.chainsMapping[chainid1][chainid1 + '_' + resi1] = resn1 + resi1;
                    ic.chainsMapping[chainid2][chainid2 + '_' + resi2] = resn1 + resi1;  

                    //if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {}
                    $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resi2] );
                    hAtoms = me.hashUtilsCls.unionHash(hAtoms, ic.residues[chainid2 + '_' + resi2]);

                    ++k;
                }
            }
            
            prevIndex1 = end1;
            prevIndex2 = end2;  
        } 

        // add gaps at the end
        result = this.getTemplatePosFromOriPos(chainid1, prevIndex1, end_t, bRealign);
        pos1 = result.pos1;
        pos2 = result.pos2;
        for(let i = pos1; i < pos2; ++i) {
        //for(let i = pos1; i <= pos2; ++i) {
            ic.alnChainsSeq[chainid2].push(gapResObject2);           
        }     

        return hAtoms;
    }

    // used for seq MSA
    mergeTwoSeqForAllSimple(targetId, chainidArray, index, alignedChainIndice, start_t, end_t, querySeqArray) { let ic = this.icn3d, me = ic.icn3dui;
        let chainid1 = targetId;
        let chainid2 = chainidArray[index];

        let pos1, pos2, prevIndex1, prevIndex2;

        for(let i = 0, il = ic.qt_start_end[index].length; i < il; ++i) {
            let start1, start2, end1, end2, resiStart1, start1Pos, end1Pos;
            
            start1 = ic.qt_start_end[index][i].t_start;
            start2 = ic.qt_start_end[index][i].q_start;
            end1 = ic.qt_start_end[index][i].t_end;
            end2 = ic.qt_start_end[index][i].q_end;  

            // 1. before the mapped residues
            //resiStart1 = ic.ParserUtilsCls.getResi(chainid1, start1);
            resiStart1 = start1;
            start1Pos = start1;
            end1Pos = end1;

            // if the mapping does not start from start_t, add gaps to the query seq
            if(i == 0) {
                pos1 = start_t;
                pos2 = start1Pos;
                
                if(start1Pos > start_t) {
                    for(let j = 0, jl = pos2 - pos1; j < jl; ++j) {
                        ic.msaSeq[chainid2] += '-';
                    }
                }
            }
            else {
                pos1 = prevIndex1;
                pos2 = start1;
                let notAlnLen1 = pos2 - (pos1 + 1);
                let notAlnLen2 = start2 - (prevIndex2 + 1);
                
                // insert non-aligned residues in query seq
                // this.insertNotAlignRes(chainid2, prevIndex2+1, notAlnLen2, bRealign);

                for(let j = 0, jl = notAlnLen2; j < jl; ++j) {
                    let resn = querySeqArray[index][prevIndex2+1 + j];
                    ic.msaSeq[chainid2] += resn;
                }

                if(notAlnLen1 >= notAlnLen2) {
                    // add gaps before the query sequence
                    for(let j = 0, jl = notAlnLen1 - notAlnLen2; j < jl; ++j) {
                        ic.msaSeq[chainid2] += '-';
                    }                       
                }
                else {
                    // check the number of gaps before resiStart1 (n), and insert 'notAlnLen2 - notAlnLen1 - n' gaps
                    // this.addGapAllAlnChains(chainidArray, alignedChainIndice, chainid1, resiStart1, notAlnLen2 - notAlnLen1);

                    // let result = this.getResiPosInTemplate(chainid1, resi_t);
                    // let nGap = result.ngap, pos_t = result.pos;

                    let pos_t = resiStart1; // position to add gap
            
                    // add gaps for all previously aligned sequences, not the current sequence, which is the last one
                    for(let j = 0, jl = alignedChainIndice.length - 1; j < jl; ++j) {
                        let chainidTmp = (j == 0) ? chainid1 : chainidArray[alignedChainIndice[j]];

                        for(let k = 0, kl = notAlnLen2 - notAlnLen1; k < kl; ++k) {
                            //ic.msaSeq[chainidTmp].splice(pos_t, 0, '-');
                            ic.msaSeq[chainidTmp] = ic.msaSeq[chainidTmp].substr(0, pos_t) + '-' + ic.msaSeq[chainidTmp].substr(pos_t);
                        }
                    }
                }                           
            }

            // 2. In the mapped residues
            pos1 = start1Pos;
            pos2 = end1Pos;
            
            let k = 0;    
            for(let j = pos1; j <= pos2; ++j) {
                // inherit the gaps from the template
                if(ic.msaSeq[chainid1][j] == '-') {
                    ic.msaSeq[chainid2] += '-';
                }
                else {
                    //let resn1 = targetSeq[start1 + k];
                    let resn2 = querySeqArray[index][start2 + k];
                    //let resn2 = (querySeqArray[index]) ? querySeqArray[index][start2 + k] : '?';
                    
                    ic.msaSeq[chainid2] += resn2;

                    ++k;
                }
            }
            
            prevIndex1 = end1;
            prevIndex2 = end2;  
        } 

        // add gaps at the end
        pos1 = prevIndex1;
        pos2 = end_t;
        for(let i = pos1; i < pos2; ++i) {
        //for(let i = pos1; i <= pos2; ++i) {
            ic.msaSeq[chainid2] += '-';           
        }
    }

    setSeqAlignForRealign(chainid_t, chainid, chainIndex) { let ic = this.icn3d, me = ic.icn3dui;
        //loadSeqAlignment
          let alignedAtoms = {};
          //var chainid_t = ic.chainidArray[0];

    //      let structureArray = Object.keys(ic.structures);
        //   let structure1 = chainid_t.substr(0, chainid_t.indexOf('_')); //structureArray[0];
        //   let structure2 = chainid.substr(0, chainid.indexOf('_')); //structureArray[1];

        //   if(structure1 == structure2) structure2 += me.htmlCls.postfix;

          ic.conservedName1 = chainid_t + '_cons';
          ic.conservedName2 = chainid + '_cons';

          ic.consHash1 = {};
          ic.consHash2 = {};

          ic.alnChainsAnTtl = {};
          ic.alnChainsAnno = {};

          if(ic.alnChainsSeq === undefined) ic.alnChainsSeq = {};
          ic.alnChains = {};

          ic.alnChainsSeq[chainid_t] = [];
          ic.alnChains[chainid_t] = {}
          ic.alnChainsAnno[chainid_t] = [];
          ic.alnChainsAnTtl[chainid_t] = [];

          ic.alnChainsSeq[chainid] = [];
          ic.alnChains[chainid] = {};

    //      let emptyResObject = {resid: '', resn:'', resi: 0, aligned: false}

    //      let prevChainid1 = '', prevChainid2 = '', cnt1 = 0, cnt2 = 0;

          let residuesHash = {};
          if(!ic.chainsMapping[chainid_t]) ic.chainsMapping[chainid_t] = {};
          if(!ic.chainsMapping[chainid]) ic.chainsMapping[chainid] = {};

          for(let i = 0, il = ic.realignResid[chainid_t].length; i < il; ++i) {
              let resObject1 = ic.realignResid[chainid_t][i];
              let pos1 = resObject1.resid.lastIndexOf('_');
              let chainid1 = resObject1.resid.substr(0, pos1);
              let resi1 = resObject1.resid.substr(pos1 + 1);
              resObject1.resi = resi1;
              resObject1.aligned = true;

              let resObject2 = ic.realignResid[chainid][i];
              let pos2 = resObject2.resid.lastIndexOf('_');
              let chainid2 = resObject2.resid.substr(0, pos2);
              let resi2 = resObject2.resid.substr(pos2 + 1);
              resObject2.resi = resi2;
              resObject2.aligned = true;

              residuesHash[resObject1.resid] = 1;
              residuesHash[resObject2.resid] = 1;

              let color;
              if(resObject1.resn.toUpperCase() == resObject2.resn.toUpperCase()) {
                  color = "#FF0000";
              }
              else {
                  color = "#0000FF";
              }

              // mapping, use the firstsequence as the reference structure
              ic.chainsMapping[chainid_t][chainid_t + '_' + resObject1.resi] = resObject1.resn + resObject1.resi;
              ic.chainsMapping[chainid][chainid + '_' + resObject2.resi] = resObject1.resn + resObject1.resi;

              let color2 = '#' + ic.showAnnoCls.getColorhexFromBlosum62(resObject1.resn, resObject2.resn);

              resObject1.color = color;
              resObject2.color = color;

              resObject1.color2 = color2;
              resObject2.color2 = color2;

              for(let j in ic.residues[resObject1.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
              }
              for(let j in ic.residues[resObject2.resid]) {
                  ic.atoms[j].color = me.parasCls.thr(color);
              }

              // annoation title for the master seq only
              if(ic.alnChainsAnTtl[chainid1] === undefined ) ic.alnChainsAnTtl[chainid1] = [];

              for(let j = 0; j < 3; ++j) {
                  if(ic.alnChainsAnTtl[chainid1][j] === undefined ) ic.alnChainsAnTtl[chainid1][j] = [];
              }

              // two annotations without titles
              for(let j = 0; j < 3; ++j) {
                  ic.alnChainsAnTtl[chainid1][j].push("");
              }

              if(ic.alnChainsSeq[chainid1] === undefined) ic.alnChainsSeq[chainid1] = [];
              if(ic.alnChainsSeq[chainid2] === undefined) ic.alnChainsSeq[chainid2] = [];

              ic.alnChainsSeq[chainid1].push(resObject1);
              ic.alnChainsSeq[chainid2].push(resObject2);

              if(ic.alnChains[chainid1] === undefined) ic.alnChains[chainid1] = {}
              if(ic.alnChains[chainid2] === undefined) ic.alnChains[chainid2] = {}
              $.extend(ic.alnChains[chainid1], ic.residues[chainid1 + '_' + resObject1.resi] );
              $.extend(ic.alnChains[chainid2], ic.residues[chainid2 + '_' + resObject2.resi] );

              ic.consHash1[chainid1 + '_' + resObject1.resi] = 1;
              ic.consHash2[chainid2 + '_' + resObject2.resi] = 1;

              // annotation is for the master seq only
              if(ic.alnChainsAnno[chainid1] === undefined ) ic.alnChainsAnno[chainid1] = [];
              //if(ic.alnChainsAnno[chainid2] === undefined ) ic.alnChainsAnno[chainid2] = [];

              for(let j = 0; j < 3; ++j) {
                  if(ic.alnChainsAnno[chainid1][j] === undefined ) ic.alnChainsAnno[chainid1][j] = [];
              }

              let symbol = '.';
              if(i % 5 === 0) symbol = '*';
              if(i % 10 === 0) symbol = '|';
              ic.alnChainsAnno[chainid1][0].push(symbol); // symbol: | for 10th, * for 5th, . for rest

              let numberStr = '';
              if(i % 10 === 0) numberStr = i.toString();
              ic.alnChainsAnno[chainid1][1].push(numberStr); // symbol: 10, 20, etc, empty for rest
          }

            let commandname = 'protein_aligned';
            let commanddescr = 'protein aligned';
            let select = "select " + ic.resid2specCls.residueids2spec(Object.keys(residuesHash));
            ic.selectionCls.addCustomSelection(Object.keys(residuesHash), commandname, commanddescr, select, true);
    }

    setSeqPerResi(chainid, chainid1, chainid2, resi, resn, bAligned, color, color2, classname, bFirstChain, bFirstResi, alignIndex) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.alnChainsSeq[chainid] === undefined) ic.alnChainsSeq[chainid] = [];

        let resObject = {}
        let pos = chainid.indexOf('_');
        resObject.mmdbid = chainid.substr(0, pos);
        resObject.chain = chainid.substr(pos+1);
        resObject.resi = resi;
        // resi will be empty if there is no coordinates
        resObject.resn =(resObject.resi === '' || classname === 'icn3d-nalign') ? resn.toLowerCase() : resn;
        resObject.aligned = bAligned;
        // resi will be empty if there is no coordinates
        resObject.color =(resObject.resi === '') ? me.htmlCls.GREYC : color; // color by identity
        resObject.color2 =(resObject.resi === '') ? me.htmlCls.GREYC : color2; // color by conservation
        resObject.class = classname;

        ic.alnChainsSeq[chainid].push(resObject);

        if(resObject.resi !== '') {
            if(ic.alnChains[chainid] === undefined) ic.alnChains[chainid] = {}
            $.extend(ic.alnChains[chainid], ic.residues[chainid + '_' + resObject.resi] );
        }

        if(bFirstChain) {
            // annotation is for the master seq only
            if(ic.alnChainsAnno[chainid] === undefined ) ic.alnChainsAnno[chainid] = [];
            if(ic.alnChainsAnno[chainid][0] === undefined ) ic.alnChainsAnno[chainid][0] = [];
            if(ic.alnChainsAnno[chainid][1] === undefined ) ic.alnChainsAnno[chainid][1] = [];
            if(ic.alnChainsAnno[chainid][2] === undefined ) ic.alnChainsAnno[chainid][2] = [];
            if(ic.alnChainsAnno[chainid][3] === undefined ) ic.alnChainsAnno[chainid][3] = [];
            if(bFirstResi) {
                // empty line
                // 2nd chain title
                if(ic.alnChainsAnno[chainid][4] === undefined ) ic.alnChainsAnno[chainid][4] = [];
                // master chain title
                if(ic.alnChainsAnno[chainid][5] === undefined ) ic.alnChainsAnno[chainid][5] = [];
                // empty line
                if(ic.alnChainsAnno[chainid][6] === undefined ) ic.alnChainsAnno[chainid][6] = [];

                let title1 = ic.pdbid_chain2title && ic.pdbid_chain2title.hasOwnProperty(chainid2) ? ic.pdbid_chain2title[chainid2] : ""
                let title2 = ic.pdbid_chain2title && ic.pdbid_chain2title.hasOwnProperty(chainid) ? ic.pdbid_chain2title[chainid] : ""
                ic.alnChainsAnno[chainid][4].push(title1);
                ic.alnChainsAnno[chainid][5].push(title2);
                ic.alnChainsAnno[chainid][6].push('');
            }

            let symbol = '.';
            if(alignIndex % 5 === 0) symbol = '*';
            if(alignIndex % 10 === 0) symbol = '|';
            ic.alnChainsAnno[chainid][2].push(symbol); // symbol: | for 10th, * for 5th, . for rest

            let numberStr = '';
            if(alignIndex % 10 === 0) numberStr = alignIndex.toString();
            ic.alnChainsAnno[chainid][3].push(numberStr); // symbol: 10, 20, etc, empty for rest

            let residueid = chainid + '_' + resi;
            let ss = ic.secondaries[residueid];

            if(ss !== undefined) {
                ic.alnChainsAnno[chainid][1].push(ss);
            }
            else {
                ic.alnChainsAnno[chainid][1].push('-');
            }
        }
        else {
            let residueid = chainid + '_' + resi;
            let ss = ic.secondaries[residueid];

            if(ic.alnChainsAnno.hasOwnProperty(chainid1) && ic.alnChainsAnno[chainid1].length > 0) {
                if(ss !== undefined) {
                    ic.alnChainsAnno[chainid1][0].push(ss);
                }
                else {
                    ic.alnChainsAnno[chainid1][0].push('-');
                }
            }
            else {
                console.log("Error: ic.alnChainsAnno[chainid1] is undefined");
            }
        }
    }   
}

export {SetSeqAlign}
