/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//type: "mmdbid", "mmcifid", "align"
//alignType: "query", "target" for chain to chain 3D alignment
iCn3DUI.prototype.loadAtomDataIn = function (data, id, type, seqalign, alignType, chainidInput, chainIndex, bLastQuery) { var me = this, ic = me.icn3d; "use strict";
    //ic.init();
    ic.pmin = new THREE.Vector3( 9999, 9999, 9999);
    ic.pmax = new THREE.Vector3(-9999,-9999,-9999);
    ic.psum = new THREE.Vector3();

    var atoms = data.atoms;

    var serialBase = (alignType === undefined || alignType === 'target') ? 0 : me.lastTargetSerial;
    var serial = serialBase;

    var serial2structure = {}; // for "align" only
    var mmdbid2pdbid = {}; // for "align" only

    if(alignType === undefined || alignType === 'target') {
        me.pmid = data.pubmedId;

        me.chainid2title = {};
        me.chainid2sid = {};
    }
    else {
        me.pmid2 = data.pubmedId;
    }

    var chainid2seq = {}, chainid2kind = {}, chainid2color = {};

    if(type === 'align') {
      //serial2structure
      me.pmid = "";
      var refinedStr = (me.cfg.inpara && me.cfg.inpara.indexOf('atype=1') !== -1) ? 'Invariant Core ' : '';
      ic.molTitle = refinedStr + 'Structure Alignment of ';

      for (var i = 0, il = data.alignedStructures[0].length; i < il; ++i) {
          var structure = data.alignedStructures[0][i];

          if(i === 1) {
              ic.secondId = structure.pdbId; // set the second pdbid to add indent in the structure and chain mns
          }

          var pdbidTmp = structure.pdbId;
          var mmdbidTmp = structure.mmdbId;

          for(var j = structure.serialInterval[0], jl = structure.serialInterval[1]; j <= jl; ++j) {
              serial2structure[j] = pdbidTmp.toString();
              mmdbid2pdbid[mmdbidTmp] = pdbidTmp;
          }

          for(var j = 0, jl = structure.molecules.length; j < jl; ++j) {
              var chain = structure.molecules[j].chain;
              var kind = structure.molecules[j].kind;
              var title = structure.molecules[j].name;
              //var seq = structure.molecules[j].sequence;
              var sid = structure.molecules[j].sid;

              var chainid = pdbidTmp + '_' + chain;

              //if(me.bFullUi) chainid2seq[chainid] = seq;
              chainid2kind[chainid] = kind;

              me.chainid2title[chainid] = title;
              if(sid !== undefined) me.chainid2sid[chainid] = sid;
          }

          ic.molTitle +=  "<a href=\"" + me.baseUrl + "mmdb/mmdbsrv.cgi?uid=" + structure.pdbId.toUpperCase() + "\" target=\"_blank\">" + structure.pdbId.toUpperCase() + "</a>";

          if(structure.descr !== undefined) me.pmid += structure.descr.pubmedid;
          if(i === 0) {
              ic.molTitle += " and ";
              if(structure.descr !== undefined) me.pmid += "_";
          }
      }

      ic.molTitle += ' from VAST+';

    }
    else { // mmdbid or mmcifid
        if(data.descr !== undefined) ic.molTitle += data.descr.name;

        if(type === 'mmdbid') {
          var pdbidTmp = data.pdbId;
          var chainHash = {};

          if(alignType == 'target') {
            me.alignmolid2color = [];
            //me.alignmolid2color[0] = {};
            //me.alignmolid2color[1] = {};
          }

          var molidCnt = 1;
          for(var molid in data.moleculeInfor) {
              if(Object.keys(data.moleculeInfor[molid]).length === 0) continue;

              var chain = data.moleculeInfor[molid].chain.trim();
              var chainid = pdbidTmp + '_' + chain;

              if(chainHash.hasOwnProperty(chain)) {
                  ++chainHash[chain];
                  chainid += chainHash[chain];
              }
              else {
                  chainHash[chain] = 1;
              }

              if( ((me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t)) && alignType === 'query') {
                  //chainid += me.postfix;
                  chainid = pdbidTmp + me.postfix + '_' + chain;
              }

              var kind = data.moleculeInfor[molid].kind;
              var color = data.moleculeInfor[molid].color;
              var sid = data.moleculeInfor[molid].sid;

              chainid2kind[chainid] = kind;
              chainid2color[chainid] = color;

              if(kind == 'protein') ic.organism = data.moleculeInfor[molid].taxonomyName.toLowerCase();

              if(sid !== undefined) me.chainid2sid[chainid] = sid;

              if(ic.pdbid_chain2title === undefined) ic.pdbid_chain2title = {};
              ic.pdbid_chain2title[chainid] = data.moleculeInfor[molid].name;

              //if(alignType == 'query' && chain == me.chain_q) {
              //    me.alignmolid2color[0][molid] = molidCnt.toString();
              //}
              //else if(alignType == 'target' && chain == me.chain_t) {
              //    me.alignmolid2color[1][molid] = molidCnt.toString();
              //}

              if(chain == chainid.substr(chainid.lastIndexOf('_')) ) {
                  var tmpHash = {};
                  tmpHash[molid] = molidCnt.toString();
                  me.alignmolid2color.push(tmpHash);
              }

              ++molidCnt;
          }
        }
    }

    var atomid2serial = {};
    var prevStructureNum = '', prevChainNum = '', prevResidueNum = '';
    var structureNum = '', chainNum = '', residueNum = '';
    var currContinueSeq = '';
    var oldResi, prevOldResi = -999;
    var prevResi = 0, prevResiOri = 0, prevResn = ''; // continuous from 1 for each chain
    var missingResIndex = 0;
    var bChainSeqSet = true;
    var bAddedNewSeq = false;

    // In align, chemicals do not have assigned chains. Assembly will have the same residue id so that two different residues will be combined in one residue. To avoid this, build an array to check for molid
    var resiArray = [];
    var molid, prevMolid = '', prevmmdbId = '';

    var bPhosphorusOnly = ic.isCalphaPhosOnly(atoms); //, "O3'", "O3*") || ic.isCalphaPhosOnly(atoms, "P");
    var miscCnt = 0;
    var CSerial, prevCSerial, OSerial, prevOSerial;

    var biopolymerChainsHash = {};

    for (var i in atoms) {
        ++serial;

        atomid2serial[i] = serial;

        var atm = atoms[i];
        atm.serial = serial;

        var mmdbId;

        if(type === 'mmdbid' || type === 'mmcifid') {
          mmdbId = id; // here mmdbId is pdbid or mmcif id
        }
        else if(type === 'align') {
          mmdbId = serial2structure[serial]; // here mmdbId is pdbid
        }

        var bSetResi = false;

        //if(mmdbId !== prevmmdbId) resiArray = [];
        if(atm.chain === undefined && (type === 'mmdbid' || type === 'align')) {
            if(type === 'mmdbid') {
              molid = atm.ids.m;

              if(ic.molid2chain[molid] !== undefined) {
                  var pos = ic.molid2chain[molid].indexOf('_');
                  atm.chain = ic.molid2chain[molid].substr(pos + 1);
              }
              else {
                  var miscName = 'Misc';

                  //if(atm.resn != prevResn || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH' || atm.name == atm.elem) {
                  if( (chainid2kind[chainNum] === 'protein' && chainid2kind[chainNum] === 'nucleotide' && atm.resi != prevResiOri)
                    || (chainid2kind[chainNum] !== 'protein' && chainid2kind[chainNum] !== 'nucleotide'
                    && (atm.resn.substr(0,3) != prevResn.substr(0,3) || atm.resi != prevResiOri || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH')) ) {
                      ++miscCnt;
                  }

                      atm.resi_ori = atm.resi;
                      atm.resi = miscCnt;
                      bSetResi = true;

                  //if all are defined in the chain section, no "Misc" should appear
                  atm.chain = miscName;
              }

              //if(me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t && alignType === 'query') {
                  //atm.chain += me.postfix;
              //}
            }
            else if(type === 'align') {
              molid = atm.ids.m;

              if(ic.pdbid_molid2chain[mmdbId + '_' + molid] !== undefined) {
                  atm.chain = ic.pdbid_molid2chain[mmdbId + '_' + molid];
              }
              else {
                  var miscName = 'Misc';

                  //if(atm.resn != prevResn || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH' || atm.name == atm.elem) {
                  if( (chainid2kind[chainNum] === 'protein' && chainid2kind[chainNum] === 'nucleotide' && atm.resi != prevResiOri)
                    || (chainid2kind[chainNum] !== 'protein' && chainid2kind[chainNum] !== 'nucleotide'
                    && (atm.resn.substr(0,3) != prevResn.substr(0,3) || atm.resi != prevResiOri || chainid2kind[chainNum] === 'solvent' || atm.resn === 'HOH')) ) {
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
          atm.chain = (atm.chain === '') ? 'Misc' : atm.chain;
        }

        atm.chain = atm.chain.trim(); //.replace(/_/g, '');

        // mmcif has pre-assigned structure in mmcifparser.cgi output
        if(type === 'mmdbid' || type === 'align') {
            atm.structure = mmdbId;

            if(type === 'mmdbid' && ((me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t))
              && alignType === 'query') {
                atm.structure += me.postfix;
            }
        }

        structureNum = atm.structure;

        chainNum = structureNum + '_' + atm.chain;
        //if(me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t && alignType === 'query') chainNum += me.postfix;

        //var resiCorrection = 0;
        if(type === 'mmdbid' || type === 'align') {
            if(!bSetResi) {
                atm.resi_ori = parseInt(atm.resi); // original PDB residue number, has to be integer
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

            var pos = atm.resn.indexOf(' ');
            if(pos !== -1 && pos != 0) atm.resn = atm.resn.substr(0, pos);
        }
        else {
            if(!bSetResi) {
                atm.resi = parseInt(atm.resi);
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
            if(me.q_rotation !== undefined && !me.cfg.resnum) {
                if(alignType === 'target') {
                    atm.coord.x += me.t_trans_add[chainIndex].x;
                    atm.coord.y += me.t_trans_add[chainIndex].y;
                    atm.coord.z += me.t_trans_add[chainIndex].z;
                }
                else if(alignType === 'query') {
                    atm.coord.x -= me.q_trans_sub[chainIndex].x;
                    atm.coord.y -= me.q_trans_sub[chainIndex].y;
                    atm.coord.z -= me.q_trans_sub[chainIndex].z;

                    var x = atm.coord.x * me.q_rotation[chainIndex].x1 + atm.coord.y * me.q_rotation[chainIndex].y1 + atm.coord.z * me.q_rotation[chainIndex].z1;
                    var y = atm.coord.x * me.q_rotation[chainIndex].x2 + atm.coord.y * me.q_rotation[chainIndex].y2 + atm.coord.z * me.q_rotation[chainIndex].z2;
                    var z = atm.coord.x * me.q_rotation[chainIndex].x3 + atm.coord.y * me.q_rotation[chainIndex].y3 + atm.coord.z * me.q_rotation[chainIndex].z3;

                    atm.coord.x = x;
                    atm.coord.y = y;
                    atm.coord.z = z;
                }
            }
        }
        else {
            atm.coord = new THREE.Vector3(atm.coord.x, atm.coord.y, atm.coord.z);
        }

        var oneLetterRes = ic.residueName2Abbr(atm.resn.substr(0, 3));

        if( (type === 'mmdbid' || type === 'align') && me.bFullUi ) {
            // set me.mmdbMolidResid2mmdbChainResi
            if(me.mmdbMolidResid2mmdbChainResi === undefined) me.mmdbMolidResid2mmdbChainResi = {};
            me.mmdbMolidResid2mmdbChainResi[mmdbId + '_' + atm.ids.m + '_' + atm.ids.r] = mmdbId + '_' + atm.chain + '_' + atm.resi;
        }

        ic.pmin.min(atm.coord);
        ic.pmax.max(atm.coord);
        ic.psum.add(atm.coord);

        var bProtein = (me.cfg.mmcifid === undefined && me.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'protein' : atm.mt === 'p';
        var bNucleotide = (me.cfg.mmcifid === undefined && me.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'nucleotide' : atm.mt === 'n';
        var bSolvent = (me.cfg.mmcifid === undefined && me.InputfileType != 'mmcif') ? chainid2kind[chainNum] === 'solvent' : atm.mt === 's';
        // in vastplus.cgi, ions arenotlisted in alignedStructures...molecules, thus chainid2kind[chainNum] === undefined is used.
        // ions will be separated from chemicals later.
        // here "ligand" is used in the cgi output
        //var bChemicalIons = (me.cfg.mmcifid === undefined) ? (chainid2kind[chainNum] === 'ligand' || chainid2kind[chainNum] === 'otherPolymer' || chainid2kind[chainNum] === undefined) : atm.mt === 'l';
        // kind: other, otherPolymer, etc
        var bChemicalIons = (me.cfg.mmcifid === undefined && me.InputfileType != 'mmcif') ? (chainid2kind[chainNum] === 'ligand' || (chainid2kind[chainNum] !== undefined && chainid2kind[chainNum].indexOf('other') !== -1) || chainid2kind[chainNum] === undefined) : atm.mt === 'l';

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

        if (bProtein || bNucleotide)
        {
            if (bProtein) {
              ic.proteins[serial] = 1;

              if (atm.name === 'CA') ic.calphas[serial] = 1;
              if (atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') ic.sidec[serial] = 1;
            }
            else if (bNucleotide) {
              ic.nucleotides[serial] = 1;

              //if (atm.name == 'P') ic.nucleotidesO3[serial] = 1;
              if (atm.name == "O3'" || atm.name == "O3*" || (bPhosphorusOnly && atm.name == 'P') ) {
                  ic.nucleotidesO3[serial] = 1;
              }
            }

            atm.het = false;
        }
        else if (bSolvent) { // solvent
          ic.water[serial] = 1;

          atm.het = true;
        }
        else if (bChemicalIons) { // chemicals and ions
          //if (atm.bonds.length === 0) ic.ions[serial] = 1;
          if (atm.resn === 'HOH' || atm.resn === 'O') {
              ic.water[serial] = 1;
          }
          else if (atm.elem === atm.resn) {
              ic.ions[serial] = 1;
          }
          else {
              ic.chemicals[serial] = 1;
          }

          atm.het = true;
        }

        if(type === 'mmdbid') {
            if(!atm.het) {
                atm.color = (chainid2color[chainNum] !== undefined) ? ic.thr(chainid2color[chainNum]) : ic.chargeColors[atm.resn];
            }
            else {
                atm.color = ic.atomColors[atm.elem] || ic.defaultAtomColor;
            }
        }
        else {
            if(atm.color !== undefined) atm.color = ic.thr(atm.color);
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
            var dist = ic.atoms[prevCSerial].coord.distanceTo(ic.atoms[prevOSerial].coord);

            var x2 = atm.coord.x + (ic.atoms[prevCSerial].coord.x - ic.atoms[prevOSerial].coord.x) / dist;
            var y2 = atm.coord.y + (ic.atoms[prevCSerial].coord.y - ic.atoms[prevOSerial].coord.y) / dist;
            var z2 = atm.coord.z + (ic.atoms[prevCSerial].coord.z - ic.atoms[prevOSerial].coord.z) / dist;

            atm.hcoord = new THREE.Vector3(x2, y2, z2);
        }

        // double check
        if (atm.resn == 'HOH') ic.water[serial] = 1

        ic.atoms[serial] = atm;
        ic.dAtoms[serial] = 1;
        ic.hAtoms[serial] = 1;

        // chain level
        var chainid = atm.structure + '_' + atm.chain;
        //if(me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t && alignType === 'query') chainid += me.postfix;

        if (ic.chains[chainid] === undefined) ic.chains[chainid] = {};
        ic.chains[chainid][serial] = 1;

        // residue level
        var residueid = chainid + '_' + atm.resi;
        if (ic.residues[residueid] === undefined) ic.residues[residueid] = {};
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

        var secondaries = '-';
        if(atm.ss === 'helix') {
            secondaries = 'H';
        }
        else if(atm.ss === 'sheet') {
            secondaries = 'E';
        }
        else if(atm.het || bNucleotide ) {
            secondaries = 'o';
        }
        else if(!atm.het && ic.residueColors.hasOwnProperty(atm.resn.toUpperCase()) ) {
            secondaries = 'c';
        }
        else if(atm.ss === 'coil') {
            secondaries = 'c';
        }

        ic.secondaries[atm.structure + '_' + atm.chain + '_' + atm.resi] = secondaries;

        if( (atm.resi != prevResi || molid != prevMolid) && me.bFullUi) { // mmdbid 1tup has different molid, same resi
          if(ic.chainsSeq[chainid] === undefined) {
              ic.chainsSeq[chainid] = [];
              bChainSeqSet = false;
          }

          // ic.chainsSeq[chainid][atm.resi - 1] should have been defined for major chains
          if( bChainSeqSet && !bAddedNewSeq && ic.chainsSeq[chainid][atm.resi - 1] !== undefined) {
              ic.chainsSeq[chainid][atm.resi - 1].name = oneLetterRes;
          }
          else if(!bChainSeqSet || !ic.chainsSeq[chainid].hasOwnProperty(atm.resi - 1)) {
              var resObject = {};
              resObject.resi = atm.resi;
              resObject.name = oneLetterRes;
              var numberStr = '';
              if(atm.resi % 10 === 0) numberStr = atm.resi.toString();

              ic.chainsSeq[chainid].push(resObject);

              bAddedNewSeq = true;
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

    //if(alignType === 'target') me.lastTargetSerial = serial;
    me.lastTargetSerial = serial;

    // adjust biopolymer type
    for(var chainid in biopolymerChainsHash) {
        if(Object.keys(ic.chains[chainid]).length < 10) continue;

        if(biopolymerChainsHash[chainid] === 'chemical') continue;

        for(var serial in ic.chains[chainid]) {
            var atm = ic.atoms[serial];

            delete ic.chemicals[serial];
            atm.het = false;

            if(biopolymerChainsHash[chainid] === 'protein') {
              ic.proteins[serial] = 1;

              if (atm.name === 'CA') ic.calphas[serial] = 1;
              if (atm.name !== 'N' && atm.name !== 'CA' && atm.name !== 'C' && atm.name !== 'O') ic.sidec[serial] = 1;
            }
            else if(biopolymerChainsHash[chainid] === 'nucleotide') {
              ic.nucleotides[serial] = 1;
              //atm.style = 'nucleotide cartoon';

              if (atm.name == "O3'" || atm.name == "O3*" || (bPhosphorusOnly && atm.name == 'P') ) {
                  ic.nucleotidesO3[serial] = 1;
              }
            }
        }
    }

    // ic.adjustSeq(me.chainMissingResidueArray);

    // add the last residue set
    if(ic.structures[structureNum] === undefined) ic.structures[structureNum] = [];
    ic.structures[structureNum].push(chainNum);

    //me.countNextresiArray = {};
    //me.chainMissingResidueArray = {};
    if(me.bFullUi) {
        if(type === 'mmdbid' || type === 'mmcifid') {
            for(var chain in data.sequences) {
                var seqArray = data.sequences[chain];
                var chainid = id + '_' + chain;

                if(((me.mmdbid_q !== undefined && me.mmdbid_q === me.mmdbid_t)) && alignType === 'query') {
                    //chainid += me.postfix;
                    chainid = id + me.postfix + '_' + chain;
                }

                me.getMissingResidues(seqArray, type, chainid); // assign ic.chainsSeq
            }
        }
        else if(type === 'align') {
            //for(var chainid in chainid2seq) {
            for(var chainid in me.chainid2seq) {
                var seqArray = me.chainid2seq[chainid];

                me.getMissingResidues(seqArray, type, chainid);
            }
        }
    }

    // update bonds info
    if(type !== 'mmcifid') {
    //for (var i in ic.atoms) {
    for (var i in atoms) {
        var currSerial = atomid2serial[i];

        var bondLength = (ic.atoms[currSerial].bonds === undefined) ? 0 : ic.atoms[currSerial].bonds.length;

        for(var j = 0; j < bondLength; ++j) {
            ic.atoms[currSerial].bonds[j] = atomid2serial[ic.atoms[currSerial].bonds[j]];
        }
    }
    }

    // remove the reference
    data.atoms = {};

    //ic.cnt = (alignType === undefined || alignType === 'target') ? serial : serial - me.lastTargetSerial;
    ic.cnt = serial;

    if(ic.cnt > ic.maxatomcnt || (ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ) {
        me.opts['proteins'] = 'c alpha trace'; //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
        me.opts['nucleotides'] = 'o3 trace'; //nucleotide cartoon, o3 trace, schematic, lines, stick,
    }

    ic.maxD = ic.pmax.distanceTo(ic.pmin);
    ic.center = ic.psum.multiplyScalar(1.0 / ic.cnt);
    if (ic.maxD < 5) ic.maxD = 5;

    ic.oriMaxD = ic.maxD;

    // set up disulfide bonds
    if(type === 'mmdbid') {
        var disulfideArray = data.disulfides;

        if(disulfideArray !== undefined) {
            for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                var serial1 = disulfideArray[i][0].ca;
                var serial2 = disulfideArray[i][1].ca;

                var atom1 = ic.atoms[serial1];
                var atom2 = ic.atoms[serial2];

                var chain1 = atom1.chain;
                var chain2 = atom2.chain;

                var resid1 = atom1.structure + '_' + chain1 + '_' + atom1.resi;
                var resid2 = atom2.structure + '_' + chain2 + '_' + atom2.resi;

                if(ic.ssbondpnts[atom1.structure] === undefined) ic.ssbondpnts[atom1.structure] = [];

                ic.ssbondpnts[atom1.structure].push(resid1);
                ic.ssbondpnts[atom1.structure].push(resid2);
            }
        }
    }
    else if(type === 'mmcifid') {
        var disulfideArray = data.disulfides;

        if(disulfideArray !== undefined) {
            if(ic.ssbondpnts[id] === undefined) ic.ssbondpnts[id] = [];

            for(var i = 0, il = disulfideArray.length; i < il; ++i) {
                var resid1 = disulfideArray[i][0];
                var resid2 = disulfideArray[i][1];

                ic.ssbondpnts[id].push(resid1);
                ic.ssbondpnts[id].push(resid2);
            }

            // copy disulfide bonds
            var structureArray = Object.keys(ic.structures);
            for(var s = 0, sl = structureArray.length; s < sl; ++s) {
                var structure = structureArray[s];

                if(structure == id) continue;

                if(ic.ssbondpnts[structure] === undefined) ic.ssbondpnts[structure] = [];

                for(var j = 0, jl = ic.ssbondpnts[id].length; j < jl; ++j) {
                    var ori_resid = ic.ssbondpnts[id][j];
                    var pos = ori_resid.indexOf('_');
                    var resid = structure + ori_resid.substr(pos);

                    ic.ssbondpnts[structure].push(resid);
                }
            }
        }
    }
    else if(type === 'align') { // calculate disulfide bonds
        // get all Cys residues
        var structure2cys_resid = {};
        for(var chainid in me.chainid2seq) {
            if(chainid2kind[chainid] == 'protein') {
                var seq = me.chainid2seq[chainid];
                var structure = chainid.substr(0, chainid.indexOf('_'));

                for(var i = 0, il = seq.length; i < il; ++i) {
                    // each seq[i] = ["1","V","VAL NH3+"], //[1,"1","V","VAL NH3+"],
                    if(seq[i][1] == 'C') {
                        if(structure2cys_resid[structure] == undefined) structure2cys_resid[structure] = [];
                        structure2cys_resid[structure].push(chainid + '_' + seq[i][0]);
                    }
                }
            }
        }

        ic.setSsbond(structure2cys_resid);
    }

    if(type === 'mmcifid') {
        me.transformToOpmOri(id);
    }
    else if(type === 'mmdbid' && alignType === undefined) {
        me.transformToOpmOri(id);
    }

    // set up sequence alignment
    // display the structure right away. load the mns and sequences later
//        setTimeout(function(){
    var hAtoms = {};
    if(type === 'align' && seqalign !== undefined && me.bFullUi) {
        me.setSeqAlign(seqalign, data.alignedStructures);
    } // if(align
    else if(type === 'mmdbid' && alignType === 'query' && me.bFullUi && me.q_rotation !== undefined && !me.cfg.resnum) {
        me.setSeqAlignChain(chainidInput, chainIndex);

        var bReverse = false;
        var seqObj = me.getAlignSequencesAnnotations(Object.keys(ic.alnChains), undefined, undefined, false, undefined, bReverse);
        var oriHtml = $("#" + me.pre + "dl_sequence2").html();

        hAtoms = ic.hAtoms;

        $("#" + me.pre + "dl_sequence2").html(oriHtml + seqObj.sequencesHtml);
        $("#" + me.pre + "dl_sequence2").width(me.RESIDUE_WIDTH * seqObj.maxSeqCnt + 200);
    }

    if(type === 'mmdbid' && (alignType === 'target' || alignType === 'query') && me.q_rotation === undefined) {
        if(alignType === 'target' || alignType === 'query') {
            for(var i in atoms) {
                var atom = atoms[i];
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

    me.showTitle();

    data = {};

    return hAtoms;
};
