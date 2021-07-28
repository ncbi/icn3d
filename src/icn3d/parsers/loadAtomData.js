/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';
import {ParasCls} from '../../utils/parasCls.js';

import {Html} from '../../html/html.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {LoadPDB} from '../parsers/loadPDB.js';
import {SetSeqAlign} from '../parsers/setSeqAlign.js';
import {SaveFile} from '../export/saveFile.js';

class LoadAtomData {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    //type: "mmdbid", "mmcifid", "align"
    //alignType: "query", "target" for chain to chain 3D alignment

    //This function was used to parse atom "data" to set up parameters for the 3D viewer. "type" is mmcifid or mmdbid.
    //"id" is the MMDB ID or mmCIF ID.
    loadAtomDataIn(data, id, type, seqalign, alignType, chainidInput, chainIndex, bLastQuery) { let  ic = this.icn3d, me = ic.icn3dui;
        //ic.init();
        ic.pmin = new THREE.Vector3( 9999, 9999, 9999);
        ic.pmax = new THREE.Vector3(-9999,-9999,-9999);
        ic.psum = new THREE.Vector3();

        let  atoms = data.atoms;

        let  serialBase =(alignType === undefined || alignType === 'target') ? 0 : ic.lastTargetSerial;
        let  serial = serialBase;

        let  serial2structure = {} // for "align" only
        let  mmdbid2pdbid = {} // for "align" only

        if(alignType === undefined || alignType === 'target') {
            ic.pmid = data.pubmedId;

            ic.chainid2title = {}
            ic.chainid2sid = {}
        }
        else {
            ic.pmid2 = data.pubmedId;
        }

        let  chainid2seq = {}, chainid2kind = {}, chainid2color = {}

        if(type === 'align') {
          //serial2structure
          ic.pmid = "";
          let  refinedStr =(ic.icn3dui.cfg.inpara && ic.icn3dui.cfg.inpara.indexOf('atype=1') !== -1) ? 'Invariant Core ' : '';
          ic.molTitle = refinedStr + 'Structure Alignment of ';

          for(let i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
              let  structure = data.alignedStructures[0][i];

              if(i === 1) {
                  ic.secondId = structure.pdbId; // set the second pdbid to add indent in the structure and chain mns
              }

              let  pdbidTmp = structure.pdbId;
              let  mmdbidTmp = structure.mmdbId;

              for(let j = structure.serialInterval[0], jl = structure.serialInterval[1]; j <= jl; ++j) {
                  serial2structure[j] = pdbidTmp.toString();
                  mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
              }

              for(let j = 0, jl = structure.molecules.length; j < jl; ++j) {
                  let  chain = structure.molecules[j].chain;
                  let  kind = structure.molecules[j].kind;
                  let  title = structure.molecules[j].name;
                  //var seq = structure.molecules[j].sequence;
                  let  sid = structure.molecules[j].sid;

                  let  chainid = pdbidTmp + '_' + chain;

                  //if(ic.bFullUi) chainid2seq[chainid] = seq;
                  chainid2kind[chainid] = kind;

                  ic.chainid2title[chainid] = title;
                  if(sid !== undefined) ic.chainid2sid[chainid] = sid;
              }

              ic.molTitle +=  "<a href=\"" + ic.icn3dui.htmlCls.baseUrl + "mmdb/mmdbsrv.cgi?uid=" + structure.pdbId.toUpperCase() + "\" target=\"_blank\">" + structure.pdbId.toUpperCase() + "</a>";

              if(structure.descr !== undefined) ic.pmid += structure.descr.pubmedid;
              if(i === 0) {
                  ic.molTitle += " and ";
                  if(structure.descr !== undefined) ic.pmid += "_";
              }
          }

          ic.molTitle += ' from VAST+';

        }
        else { // mmdbid or mmcifid
            if(data.descr !== undefined) ic.molTitle += data.descr.name;

            if(type === 'mmdbid') {
              let  pdbidTmp = data.pdbId;
              let  chainHash = {}

              if(alignType == 'target') {
                ic.alignmolid2color = [];
                //ic.alignmolid2color[0] = {}
                //ic.alignmolid2color[1] = {}
              }

              let  molidCnt = 1;
              for(let molid in data.moleculeInfor) {
                  if(Object.keys(data.moleculeInfor[molid]).length === 0) continue;

                  let  chain = data.moleculeInfor[molid].chain.trim();
                  let  chainid = pdbidTmp + '_' + chain;

                  if(chainHash.hasOwnProperty(chain)) {
                      ++chainHash[chain];
                      chainid += chainHash[chain];
                  }
                  else {
                      chainHash[chain] = 1;
                  }

                  if(((ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t)) && alignType === 'query') {
                      //chainid += ic.icn3dui.htmlCls.postfix;
                      chainid = pdbidTmp + ic.icn3dui.htmlCls.postfix + '_' + chain;
                  }

                  let  kind = data.moleculeInfor[molid].kind;
                  let  color = data.moleculeInfor[molid].color;
                  let  sid = data.moleculeInfor[molid].sid;

                  chainid2kind[chainid] = kind;
                  chainid2color[chainid] = color;

                  if(kind == 'protein') ic.organism = data.moleculeInfor[molid].taxonomyName.toLowerCase();

                  if(sid !== undefined) ic.chainid2sid[chainid] = sid;

                  if(ic.pdbid_chain2title === undefined) ic.pdbid_chain2title = {}
                  ic.pdbid_chain2title[chainid] = data.moleculeInfor[molid].name;

                  //if(alignType == 'query' && chain == ic.chain_q) {
                  //    ic.alignmolid2color[0][molid] = molidCnt.toString();
                  //}
                  //else if(alignType == 'target' && chain == ic.chain_t) {
                  //    ic.alignmolid2color[1][molid] = molidCnt.toString();
                  //}

                  if(chain == chainid.substr(chainid.lastIndexOf('_')) ) {
                      let  tmpHash = {}
                      tmpHash[molid] = molidCnt.toString();
                      ic.alignmolid2color.push(tmpHash);
                  }

                  ++molidCnt;
              }
            }
        }

        let  atomid2serial = {}
        let  prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
        let  structureNum = '', chainNum = '', residueNum = '';
        let  currContinueSeq = '';
        let  oldResi, prevOldResi = -999;
        let  prevResi = 0, prevResiOri = 0, prevResn = ''; // continuous from 1 for each chain
        let  missingResIndex = 0;
        let  bChainSeqSet = true;
        let  bAddedNewSeq = false;

        // In align, chemicals do not have assigned chains. Assembly will have the same residue id so that two different residues will be combined in one residue. To avoid this, build an array to check for molid
        let  resiArray = [];
        let  molid, prevMolid = '', prevmmdbId = '';

        let  bPhosphorusOnly = me.utilsCls.isCalphaPhosOnly(atoms); //, "O3'", "O3*") || me.utilsCls.isCalphaPhosOnly(atoms, "P");
        let  miscCnt = 0;
        let  CSerial, prevCSerial, OSerial, prevOSerial;

        let  biopolymerChainsHash = {}

        for(let i in atoms) {
            ++serial;

            atomid2serial[i] = serial;

            let  atm = atoms[i];
            atm.serial = serial;

            let  mmdbId;

            if(type === 'mmdbid' || type === 'mmcifid') {
              mmdbId = id; // here mmdbId is pdbid or mmcif id
            }
            else if(type === 'align') {
              mmdbId = serial2structure[serial]; // here mmdbId is pdbid
            }

            let  bSetResi = false;

            //if(mmdbId !== prevmmdbId) resiArray = [];
            if(atm.chain === undefined &&(type === 'mmdbid' || type === 'align')) {
                if(type === 'mmdbid') {
                  molid = atm.ids.m;

                  if(ic.molid2chain[molid] !== undefined) {
                      let  pos = ic.molid2chain[molid].indexOf('_');
                      atm.chain = ic.molid2chain[molid].substr(pos + 1);
                  }
                  else {
                      let  miscName = 'Misc';

                      //if(atm.resn != prevResn || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH' || atm.name == atm.elem) {
                      if((chainid2kind[chainNum] === 'protein' && chainid2kind[chainNum] === 'nucleotide' && atm.resi != prevResiOri)
                        ||(chainid2kind[chainNum] !== 'protein' && chainid2kind[chainNum] !== 'nucleotide'
                        &&(atm.resn.substr(0,3) != prevResn.substr(0,3) || atm.resi != prevResiOri || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH')) ) {
                          ++miscCnt;
                      }

                          atm.resi_ori = atm.resi;
                          atm.resi = miscCnt;
                          bSetResi = true;

                      //if all are defined in the chain section, no "Misc" should appear
                      atm.chain = miscName;
                  }

                  //if(ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t && alignType === 'query') {
                      //atm.chain += ic.icn3dui.htmlCls.postfix;
                  //}
                }
                else if(type === 'align') {
                  molid = atm.ids.m;

                  if(ic.pdbid_molid2chain[mmdbId + '_' + molid] !== undefined) {
                      atm.chain = ic.pdbid_molid2chain[mmdbId + '_' + molid];
                  }
                  else {
                      let  miscName = 'Misc';

                      //if(atm.resn != prevResn || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH' || atm.name == atm.elem) {
                      if((chainid2kind[chainNum] === 'protein' && chainid2kind[chainNum] === 'nucleotide' && atm.resi != prevResiOri)
                        ||(chainid2kind[chainNum] !== 'protein' && chainid2kind[chainNum] !== 'nucleotide'
                        &&(atm.resn.substr(0,3) != prevResn.substr(0,3) || atm.resi != prevResiOri || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH')) ) {
                          ++miscCnt;

                          atm.resi_ori = atm.resi;
                          atm.resi = miscCnt;
                          bSetResi = true;
                      }

                      // chemicals do not have assigned chains.
                      atm.chain = miscName;
                  }
                }
            }
            else {
              atm.chain =(atm.chain === '') ? 'Misc' : atm.chain;
            }

            atm.chain = atm.chain.trim(); //.replace(/_/g, '');

            // mmcif has pre-assigned structure in mmcifparser.cgi output
            if(type === 'mmdbid' || type === 'align') {
                atm.structure = mmdbId;

                if(type === 'mmdbid' &&((ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t))
                  && alignType === 'query') {
                    atm.structure += ic.icn3dui.htmlCls.postfix;
                }
            }

            structureNum = atm.structure;

            chainNum = structureNum + '_' + atm.chain;
            //if(ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t && alignType === 'query') chainNum += ic.icn3dui.htmlCls.postfix;

            //var resiCorrection = 0;
            if(type === 'mmdbid' || type === 'align') {
                if(!bSetResi) {
                    atm.resi_ori = atm.resi; //parseInt(atm.resi); // original PDB residue number, has to be integer
                    if(!ic.bUsePdbNum) {
                        atm.resi = atm.ids.r; // corrected for residue insertion code
                    }
                    else {
                        // make MMDB residue number consistent with PDB residue number
                        atm.resi = atm.resi_ori; // corrected for residue insertion code
                        if(!ic.chainid2offset[chainNum]) ic.chainid2offset[chainNum] = atm.resi_ori - atm.ids.r;
                    }
                }

                //resiCorrection = atm.resi - atm.resi_ori;

                let  pos = atm.resn.indexOf(' ');
                if(pos !== -1 && pos != 0) atm.resn = atm.resn.substr(0, pos);
            }
            else {
                if(!bSetResi) {
                    //atm.resi = parseInt(atm.resi);
                }
            }

            if(chainNum !== prevChainNum) {
                missingResIndex = 0;
                prevResi = 0;
            }

            if(atm.resi !== prevResi) {
                if(chainNum !== prevChainNum) {
                    prevCSerial = undefined;
                    prevOSerial = undefined;
                }
                else {
                    prevCSerial = CSerial;
                    prevOSerial = OSerial;
                }
            }

            if(type === 'mmdbid') {
                atm.coord = new THREE.Vector3(atm.coord[0], atm.coord[1], atm.coord[2]);
                if(ic.q_rotation !== undefined && ic.t_trans_add.length > 0 && !ic.icn3dui.cfg.resnum && !ic.icn3dui.cfg.resdef) {
                    if(alignType === 'target') {
                        atm.coord.x += ic.t_trans_add[chainIndex].x;
                        atm.coord.y += ic.t_trans_add[chainIndex].y;
                        atm.coord.z += ic.t_trans_add[chainIndex].z;
                    }
                    else if(alignType === 'query') {
                        atm.coord.x -= ic.q_trans_sub[chainIndex].x;
                        atm.coord.y -= ic.q_trans_sub[chainIndex].y;
                        atm.coord.z -= ic.q_trans_sub[chainIndex].z;

                        let  x = atm.coord.x * ic.q_rotation[chainIndex].x1 + atm.coord.y * ic.q_rotation[chainIndex].y1 + atm.coord.z * ic.q_rotation[chainIndex].z1;
                        let  y = atm.coord.x * ic.q_rotation[chainIndex].x2 + atm.coord.y * ic.q_rotation[chainIndex].y2 + atm.coord.z * ic.q_rotation[chainIndex].z2;
                        let  z = atm.coord.x * ic.q_rotation[chainIndex].x3 + atm.coord.y * ic.q_rotation[chainIndex].y3 + atm.coord.z * ic.q_rotation[chainIndex].z3;

                        atm.coord.x = x;
                        atm.coord.y = y;
                        atm.coord.z = z;
                    }
                }
            }
            else {
                atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);
            }

            let  oneLetterRes = me.utilsCls.residueName2Abbr(atm.resn.substr(0, 3));

            if((type === 'mmdbid' || type === 'align') && ic.bFullUi ) {
                // set ic.mmdbMolidResid2mmdbChainResi
                if(ic.mmdbMolidResid2mmdbChainResi === undefined) ic.mmdbMolidResid2mmdbChainResi = {}
                ic.mmdbMolidResid2mmdbChainResi[mmdbId + '_' + atm.ids.m + '_' + atm.ids.r] = mmdbId + '_' + atm.chain + '_' + atm.resi;
            }

            ic.pmin.min(atm.coord);
            ic.pmax.max(atm.coord);
            ic.psum.add(atm.coord);

            let  bProtein =(ic.icn3dui.cfg.mmcifid === undefined && ic.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'protein' : atm.mt === 'p';
            let  bNucleotide =(ic.icn3dui.cfg.mmcifid === undefined && ic.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'nucleotide' : atm.mt === 'n';
            let  bSolvent =(ic.icn3dui.cfg.mmcifid === undefined && ic.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'solvent' : atm.mt === 's';
            // in vastplus.cgi, ions arenotlisted in alignedStructures...molecules, thus chainid2kind[chainNum] === undefined is used.
            // ions will be separated from chemicals later.
            // here "ligand" is used in the cgi output
            //var bChemicalIons =(ic.icn3dui.cfg.mmcifid === undefined) ?(chainid2kind[chainNum] === 'ligand' || chainid2kind[chainNum] === 'otherPolymer' || chainid2kind[chainNum] === undefined) : atm.mt === 'l';
            // kind: other, otherPolymer, etc
            let  bChemicalIons =(ic.icn3dui.cfg.mmcifid === undefined && ic.InputfileType != 'mmcif') ?(chainid2kind[chainNum] === 'ligand' ||(chainid2kind[chainNum] !== undefined && chainid2kind[chainNum].indexOf('other') !== -1) || chainid2kind[chainNum] === undefined) : atm.mt === 'l';

            if((atm.chain === 'Misc' || chainid2kind[chainNum] === 'other') && biopolymerChainsHash[chainNum] !== 'protein' && biopolymerChainsHash[chainNum] !== 'nucleotide') { // biopolymer, could be protein or nucleotide
                if(atm.name === 'CA' && atm.elem === 'C') {
                    biopolymerChainsHash[chainNum] = 'protein';
                }
                else if(atm.name === 'P' && atm.elem === 'P') {
                    biopolymerChainsHash[chainNum] = 'nucleotide';
                }
                else {
                    biopolymerChainsHash[chainNum] = 'chemical';
                }
            }

            if(bProtein || bNucleotide)
            {
                if(bProtein) {
                  ic.proteins[serial] = 1;

                  if(atm.name === 'CA') ic.calphas[serial] = 1;
                  if(atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') ic.sidec[serial] = 1;
                }
                else if(bNucleotide) {
                  ic.nucleotides[serial] = 1;

                  //if(atm.name == 'P') ic.nucleotidesO3[serial] = 1;
                  if(atm.name == "O3'" || atm.name == "O3*" ||(bPhosphorusOnly && atm.name == 'P') ) {
                      ic.nucleotidesO3[serial] = 1;
                  }
                }

                atm.het = false;
            }
            else if(bSolvent) { // solvent
              ic.water[serial] = 1;

              atm.het = true;
            }
            else if(bChemicalIons) { // chemicals and ions
              //if(atm.bonds.length === 0) ic.ions[serial] = 1;
              if(atm.resn === 'HOH' || atm.resn === 'O') {
                  ic.water[serial] = 1;
              }
              else if(atm.elem === atm.resn) {
                  ic.ions[serial] = 1;
              }
              else {
                  ic.chemicals[serial] = 1;
              }

              atm.het = true;
            }

            if(type === 'mmdbid') {
                if(!atm.het) {
                    atm.color =(chainid2color[chainNum] !== undefined) ? me.parasCls.thr(chainid2color[chainNum]) : me.parasCls.chargeColors[atm.resn];
                }
                else {
                    atm.color = me.parasCls.atomColors[atm.elem] || me.parasCls.defaultAtomColor;
                }
            }
            else {
                if(atm.color !== undefined) atm.color = me.parasCls.thr(atm.color);
            }

            if(atm.resn.charAt(0) !== ' ' && atm.resn.charAt(1) === ' ') {
              atm.resn = atm.resn.charAt(0);
            }

            if(!atm.het && atm.name === 'C') {
                CSerial = serial;
            }
            if(!atm.het && atm.name === 'O') {
                OSerial = serial;
            }

            // from DSSP C++ code
            if(!atm.het && atm.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
                let  dist = ic.atoms[prevCSerial].coord.distanceTo(ic.atoms[prevOSerial].coord);

                let  x2 = atm.coord.x +(ic.atoms[prevCSerial].coord.x - ic.atoms[prevOSerial].coord.x) / dist;
                let  y2 = atm.coord.y +(ic.atoms[prevCSerial].coord.y - ic.atoms[prevOSerial].coord.y) / dist;
                let  z2 = atm.coord.z +(ic.atoms[prevCSerial].coord.z - ic.atoms[prevOSerial].coord.z) / dist;

                atm.hcoord = new THREE.Vector3(x2, y2, z2);
            }

            // double check
            if(atm.resn == 'HOH') ic.water[serial] = 1

            ic.atoms[serial] = atm;
            ic.dAtoms[serial] = 1;
            ic.hAtoms[serial] = 1;

            // chain level
            let  chainid = atm.structure + '_' + atm.chain;
            //if(ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t && alignType === 'query') chainid += ic.icn3dui.htmlCls.postfix;

            if(ic.chains[chainid] === undefined) ic.chains[chainid] = {}
            ic.chains[chainid][serial] = 1;

            // residue level
            let  residueid = chainid + '_' + atm.resi;
            if(ic.residues[residueid] === undefined) ic.residues[residueid] = {}
            ic.residues[residueid][serial] = 1;

            residueNum = chainNum + '_' + atm.resi;

            // different residue
            if(residueNum !== prevResidueNum) {
                // different chain
                if(chainNum !== prevChainNum) {
                    bChainSeqSet = true;

                    //if(serial !== 1) {
                    if(prevStructureNum !== '') {
                        if(ic.structures[prevStructureNum] === undefined) ic.structures[prevStructureNum] = [];
                        ic.structures[prevStructureNum].push(prevChainNum);
                    }
                }
            }

            ic.residueId2Name[residueid] = oneLetterRes;

            let  secondaries = '-';
            if(atm.ss === 'helix') {
                secondaries = 'H';
            }
            else if(atm.ss === 'sheet') {
                secondaries = 'E';
            }
            else if(atm.het || bNucleotide ) {
                secondaries = 'o';
            }
            else if(!atm.het && me.parasCls.residueColors.hasOwnProperty(atm.resn.toUpperCase()) ) {
                secondaries = 'c';
            }
            else if(atm.ss === 'coil') {
                secondaries = 'c';
            }

            ic.secondaries[atm.structure + '_' + atm.chain + '_' + atm.resi] = secondaries;

            if((atm.resi != prevResi || molid != prevMolid) && ic.bFullUi) { // mmdbid 1tup has different molid, same resi
              if(ic.chainsSeq[chainid] === undefined) {
                  ic.chainsSeq[chainid] = [];
                  bChainSeqSet = false;
              }

              // ic.chainsSeq[chainid][atm.resi - 1] should have been defined for major chains
              if(!isNaN(atm.resi)) {
                  if( bChainSeqSet && !bAddedNewSeq && ic.chainsSeq[chainid][atm.resi - 1] !== undefined) {
                      ic.chainsSeq[chainid][atm.resi - 1].name = oneLetterRes;
                  }
                  else if(!bChainSeqSet || !ic.chainsSeq[chainid].hasOwnProperty(atm.resi - 1)) {
                      let  resObject = {}
                      resObject.resi = atm.resi;
                      resObject.name = oneLetterRes;
                      let  numberStr = '';
                      if(atm.resi % 10 === 0) numberStr = atm.resi.toString();

                      ic.chainsSeq[chainid].push(resObject);

                      bAddedNewSeq = true;
                  }
              }
            }

            prevResi = atm.resi;
            prevResiOri = atm.resi_ori;
            prevResn = atm.resn;

            prevStructureNum = structureNum;
            prevChainNum = chainNum;
            prevResidueNum = residueNum;

            prevMolid = molid;
            prevmmdbId = mmdbId;
        }

        //if(alignType === 'target') ic.lastTargetSerial = serial;
        ic.lastTargetSerial = serial;

        // adjust biopolymer type
        for(let chainid in biopolymerChainsHash) {
            if(Object.keys(ic.chains[chainid]).length < 10) continue;

            if(biopolymerChainsHash[chainid] === 'chemical') continue;

            for(let serial in ic.chains[chainid]) {
                let  atm = ic.atoms[serial];

                delete ic.chemicals[serial];
                atm.het = false;

                if(biopolymerChainsHash[chainid] === 'protein') {
                  ic.proteins[serial] = 1;

                  if(atm.name === 'CA') ic.calphas[serial] = 1;
                  if(atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') ic.sidec[serial] = 1;
                }
                else if(biopolymerChainsHash[chainid] === 'nucleotide') {
                  ic.nucleotides[serial] = 1;
                  //atm.style = 'nucleotide cartoon';

                  if(atm.name == "O3'" || atm.name == "O3*" ||(bPhosphorusOnly && atm.name == 'P') ) {
                      ic.nucleotidesO3[serial] = 1;
                  }
                }
            }
        }

        // ic.loadPDBCls.adjustSeq(ic.chainMissingResidueArray);

        // add the last residue set
        if(ic.structures[structureNum] === undefined) ic.structures[structureNum] = [];
        ic.structures[structureNum].push(chainNum);

        //ic.countNextresiArray = {}
        //ic.chainMissingResidueArray = {}
        if(ic.bFullUi) {
            if(type === 'mmdbid' || type === 'mmcifid') {
                for(let chain in data.sequences) {
                    let  seqArray = data.sequences[chain];
                    let  chainid = id + '_' + chain;

                    if(((ic.mmdbid_q !== undefined && ic.mmdbid_q === ic.mmdbid_t)) && alignType === 'query') {
                        //chainid += ic.icn3dui.htmlCls.postfix;
                        chainid = id + ic.icn3dui.htmlCls.postfix + '_' + chain;
                    }

                    ic.ParserUtilsCls.getMissingResidues(seqArray, type, chainid); // assign ic.chainsSeq
                }
            }
            else if(type === 'align') {
                //for(let chainid in chainid2seq) {
                for(let chainid in ic.chainid2seq) {
                    let  seqArray = ic.chainid2seq[chainid];

                    ic.ParserUtilsCls.getMissingResidues(seqArray, type, chainid);
                }
            }
        }

        // update bonds info
        if(type !== 'mmcifid') {
        //for(let i in ic.atoms) {
        for(let i in atoms) {
            let  currSerial = atomid2serial[i];

            let  bondLength =(ic.atoms[currSerial].bonds === undefined) ? 0 : ic.atoms[currSerial].bonds.length;

            for(let j = 0; j < bondLength; ++j) {
                ic.atoms[currSerial].bonds[j] = atomid2serial[ic.atoms[currSerial].bonds[j]];
            }
        }
        }

        // remove the reference
        data.atoms = {}

        //ic.cnt =(alignType === undefined || alignType === 'target') ? serial : serial - ic.lastTargetSerial;
        ic.cnt = serial;

        if(ic.cnt > ic.maxatomcnt ||(ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ) {
            ic.opts['proteins'] = 'c alpha trace'; //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
            ic.opts['nucleotides'] = 'o3 trace'; //nucleotide cartoon, o3 trace, schematic, lines, stick,
        }

        ic.maxD = ic.pmax.distanceTo(ic.pmin);
        ic.center = ic.psum.multiplyScalar(1.0 / ic.cnt);
        if(ic.maxD < 5) ic.maxD = 5;

        ic.oriMaxD = ic.maxD;

        // set up disulfide bonds
        if(type === 'mmdbid') {
            let  disulfideArray = data.disulfides;

            if(disulfideArray !== undefined) {
                for(let i = 0, il = disulfideArray.length; i < il; ++i) {
                    let  serial1 = disulfideArray[i][0].ca;
                    let  serial2 = disulfideArray[i][1].ca;

                    let  atom1 = ic.atoms[serial1];
                    let  atom2 = ic.atoms[serial2];

                    let  chain1 = atom1.chain;
                    let  chain2 = atom2.chain;

                    let  resid1 = atom1.structure + '_' + chain1 + '_' + atom1.resi;
                    let  resid2 = atom2.structure + '_' + chain2 + '_' + atom2.resi;

                    if(ic.ssbondpnts[atom1.structure] === undefined) ic.ssbondpnts[atom1.structure] = [];

                    ic.ssbondpnts[atom1.structure].push(resid1);
                    ic.ssbondpnts[atom1.structure].push(resid2);
                }
            }
        }
        else if(type === 'mmcifid') {
            let  disulfideArray = data.disulfides;

            if(disulfideArray !== undefined) {
                if(ic.ssbondpnts[id] === undefined) ic.ssbondpnts[id] = [];

                for(let i = 0, il = disulfideArray.length; i < il; ++i) {
                    let  resid1 = disulfideArray[i][0];
                    let  resid2 = disulfideArray[i][1];

                    ic.ssbondpnts[id].push(resid1);
                    ic.ssbondpnts[id].push(resid2);
                }

                // copy disulfide bonds
                let  structureArray = Object.keys(ic.structures);
                for(let s = 0, sl = structureArray.length; s < sl; ++s) {
                    let  structure = structureArray[s];

                    if(structure == id) continue;

                    if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];

                    for(let j = 0, jl = ic.ssbondpnts[id].length; j < jl; ++j) {
                        let  ori_resid = ic.ssbondpnts[id][j];
                        let  pos = ori_resid.indexOf('_');
                        let  resid = structure + ori_resid.substr(pos);

                        ic.ssbondpnts[structure].push(resid);
                    }
                }
            }
        }
        else if(type === 'align') { // calculate disulfide bonds
            // get all Cys residues
            let  structure2cys_resid = {}
            for(let chainid in ic.chainid2seq) {
                if(chainid2kind[chainid] == 'protein') {
                    let  seq = ic.chainid2seq[chainid];
                    let  structure = chainid.substr(0, chainid.indexOf('_'));

                    for(let i = 0, il = seq.length; i < il; ++i) {
                        // each seq[i] = ["1","V","VAL NH3+"], //[1,"1","V","VAL NH3+"],
                        if(seq[i][1] == 'C') {
                            if(structure2cys_resid[structure] == undefined) structure2cys_resid[structure] = [];
                            structure2cys_resid[structure].push(chainid + '_' + seq[i][0]);
                        }
                    }
                }
            }

            ic.loadPDBCls.setSsbond(structure2cys_resid);
        }

        if(type === 'mmcifid') {
            ic.ParserUtilsCls.transformToOpmOri(id);
        }
        else if(type === 'mmdbid' && alignType === undefined) {
            ic.ParserUtilsCls.transformToOpmOri(id);
        }

        // set up sequence alignment
        // display the structure right away. load the mns and sequences later
    //        setTimeout(function(){
        let  hAtoms = {}
        if(type === 'align' && seqalign !== undefined && ic.bFullUi) {
            ic.setSeqAlignCls.setSeqAlign(seqalign, data.alignedStructures);
        } // if(align
        else if(type === 'mmdbid' && alignType === 'query' && ic.bFullUi && ic.q_rotation !== undefined && !ic.icn3dui.cfg.resnum && !ic.icn3dui.cfg.resdef) {
            ic.setSeqAlignCls.setSeqAlignChain(chainidInput, chainIndex);

            let  bReverse = false;
            let  seqObj = ic.icn3dui.htmlCls.alignSeqCls.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, false, undefined, bReverse);
            let  oriHtml = $("#" + ic.pre + "dl_sequence2").html();

            hAtoms = ic.hAtoms;

            $("#" + ic.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
            $("#" + ic.pre + "dl_sequence2").width(ic.icn3dui.htmlCls.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
        }

        if(type === 'mmdbid' &&(alignType === 'target' || alignType === 'query') && ic.q_rotation === undefined) {
            if(alignType === 'target' || alignType === 'query') {
                for(let i in atoms) {
                    let  atom = atoms[i];
                    atom.coord.x -= ic.center.x;
                    atom.coord.y -= ic.center.y;
                    atom.coord.z -= ic.center.z;
                }
            }

            if(alignType === 'target') {
                //ic.maxD1 = ic.maxD;
                ic.oriMaxD = ic.maxD;
                ic.center1 = ic.center;
            }
            else if(alignType === 'query') {
                //ic.maxD2 = ic.maxD;
                //if(ic.maxD2 < ic.maxD1) ic.maxD = ic.maxD1;
                if(ic.oriMaxD < ic.maxD) ic.oriMaxD = ic.maxD;

                ic.center2 = ic.center;
                ic.center = new THREE.Vector3(0,0,0);
            }
        }

        //ic.oriMaxD = ic.maxD;
        ic.oriCenter = ic.center.clone();

        ic.saveFileCls.showTitle();

        data = {}

        return hAtoms;
    }
}

export {LoadAtomData}
