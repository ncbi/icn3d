/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';

import {ParserUtils} from '../parsers/parserUtils.js';
import {OpmParser} from '../parsers/opmParser.js';
import {SetStyle} from '../display/setStyle.js';
import {SetColor} from '../display/setColor.js';
import {ResizeCanvas} from '../transform/resizeCanvas.js';
import {SaveFile} from '../export/saveFile.js';

class MmtfParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // from the 2016 NCBI hackathon in Orlando: https://github.com/NCBI-Hackathons/iCN3D-MMTF
    // Contributors: Jiyao Wang, Alexander Rose, Peter Rose
    // requires the library mmtf.js

    //MMTF is a new binary data format besides the previous PDB and mmCIF formats for 3D structures.
    //The JavaScript Methods at http://mmtf.rcsb.org/ was used to load and parse the data.
    downloadMmtf(mmtfid) { let  ic = this.icn3d, me = ic.icn3dui;
        ic.ParserUtilsCls.setYourNote(mmtfid.toUpperCase() + '(MMTF) in iCn3D');
        ic.bCid = undefined;

        MMTF.fetchReduced(
            mmtfid,
            // onLoad callback
            function( mmtfData ){
                if(mmtfData.numAtoms * 10 > ic.maxatomcnt) {
                    let  bFull = false;
                    if(Object.keys(mmtfData).length == 0) {
                        alert('This PDB structure is not found at RCSB...');
                        return;
                    }

                    ic.deferredOpm = $.Deferred(function() {
                        ic.opmParserCls.loadOpmData(mmtfData, mmtfid, bFull, 'mmtf');
                    });

                    return ic.deferredOpm.promise();
                }
                else {
                    mmtfData = null;

                    MMTF.fetch(
                        mmtfid,
                        // onLoad callback
                        function( mmtfData2 ){
                            let  bFull = true;
                            if(Object.keys(mmtfData2).length == 0) {
                                alert('This PDB structure is not found at RCSB...');
                                return;
                            }
                            ic.deferredOpm = $.Deferred(function() {
                                ic.opmParserCls.loadOpmData(mmtfData2, mmtfid, bFull, 'mmtf');
                            });

                            return ic.deferredOpm.promise();
                        },
                        // onError callback
                        function( error ){
                            //alert('This PDB structure is not found at RCSB...');
                            //console.error( error )
                        }
                    );
                }
            },
            // onError callback
            function( error ){
                //alert('This PDB structure is not found at RCSB...');
                //console.error( error )
            }
        );
    }

    parseMmtfData(mmtfData, mmtfid, bFull) { let  ic = this.icn3d, me = ic.icn3dui;
        let  cnt = mmtfData.numAtoms;

        ic.init();

        let  pmin = new THREE.Vector3( 9999, 9999, 9999);
        let  pmax = new THREE.Vector3(-9999,-9999,-9999);
        let  psum = new THREE.Vector3();

        let  id = mmtfData.structureId;

        ic.molTitle = mmtfData.title;

        // bioAsembly
        if(mmtfData.bioAssemblyList !== undefined && mmtfData.bioAssemblyList[0]!== undefined && mmtfData.bioAssemblyList[0].transformList.length > 1) {
            ic.biomtMatrices = [];

            for(let i = 0, il = mmtfData.bioAssemblyList[0].transformList.length; i < il; ++i) {
                //var biomt = new THREE.Matrix4().identity();

                //for(let j = 0, jl = mmtfData.bioAssemblyList[0].transformList[i].matrix.length; j < jl; ++j) {
                    //biomt.elements[j] = mmtfData.bioAssemblyList[0].transformList[i].matrix[j];
                //}

                let  biomt = new THREE.Matrix4().fromArray(mmtfData.bioAssemblyList[0].transformList[i].matrix).transpose();

                ic.biomtMatrices.push(biomt);
            }
        }

        if(ic.biomtMatrices !== undefined && ic.biomtMatrices.length > 1) {
            $("#" + ic.pre + "assemblyWrapper").show();

            ic.asuCnt = ic.biomtMatrices.length;
        }
        else {
            $("#" + ic.pre + "assemblyWrapper").hide();
        }

        let  oriindex2serial = {}

        // save SG atoms in CYS residues
        let  SGAtomSerialArray = [];

        let  prevSS = 'coil';
        let  prevChain = '';
        let  prevResi = 0;

        let  serial = 0;

        let  structure, chain, resn, resi, ss, ssbegin, ssend;
        let  het, bProtein, bNucleotide;
        let  elem, atomName, coord, b, alt;
        let  CSerial, prevCSerial, OSerial, prevOSerial;

        let  bModifyResi = false;

        let  callbackDict = {
            onModel: function( modelData ){
                structure =(modelData.modelIndex === 0) ? id : id +(modelData.modelIndex + 1).toString();
            },
            onChain: function( chainData ){
                bModifyResi = false;

                chain = chainData.chainName; // or chainData.chainId
                let  chainid = structure + '_' + chain;

                if(ic.structures[structure] === undefined) ic.structures[structure] = [];
                ic.structures[structure].push(chainid);
            },
            onGroup: function( groupData ){
                resn = groupData.groupName;
                resi = groupData.groupId;

                let  resid = structure + '_' + chain + '_' + resi;

                if(groupData.secStruct === 0 || groupData.secStruct === 2 || groupData.secStruct === 4) {
                    ss = 'helix';
                }
                else if(groupData.secStruct === 3) {
                    ss = 'sheet';
                }
                else if(groupData.secStruct === -1) {
                    ss = 'other';
                }
                else {
                    ss = 'coil';
                }

                // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                let  bSetPrevSsend = false;

                if(chain !== prevChain) {
                    prevCSerial = undefined;
                    prevOSerial = undefined;

                    // new chain
                    if(ss !== 'coil' && ss !== 'other') {
                        ssbegin = true;
                        ssend = false;
                    }
                    else {
                        ssbegin = false;
                        ssend = false;
                    }

                    // set up the end of previous chain
                    if(prevSS !== 'coil' && prevSS !== 'other') {
                        let  prevResid = structure + '_' + prevChain + '_' + prevResi.toString();

                        for(let i in ic.residues[prevResid]) {
                            ic.atoms[i].ssbegin = false;
                            ic.atoms[i].ssend = true;
                        }
                    }
                }
                else {
                    prevCSerial = CSerial;
                    prevOSerial = OSerial;

                    if(ss !== prevSS) {
                        if(prevSS === 'coil' || prevSS === 'other') {
                            ssbegin = true;
                            ssend = false;
                        }
                        else if(ss === 'coil' || ss === 'other') {
                            bSetPrevSsend = true;
                            ssbegin = false;
                            ssend = false;
                        }
                        else if((prevSS === 'sheet' && ss === 'helix') ||(prevSS === 'helix' && ss === 'sheet')) {
                            bSetPrevSsend = true;
                            ssbegin = true;
                            ssend = false;
                        }
                    }
                    else {
                            ssbegin = false;
                            ssend = false;
                    }
                }

                if(bSetPrevSsend && !isNaN(resi)) {
                    let  prevResid = structure + '_' + chain + '_' +(resi - 1).toString();
                    for(let i in ic.residues[prevResid]) {
                        ic.atoms[i].ssbegin = false;
                        ic.atoms[i].ssend = true;
                    }
                }

                prevSS = ss;
                prevChain = chain;
                prevResi = resi;

                het = false;
                bProtein = false;
                bNucleotide = false;
                if(groupData.chemCompType.toLowerCase() === 'non-polymer' || groupData.chemCompType.toLowerCase() === 'other' || groupData.chemCompType.toLowerCase().indexOf('saccharide') !== -1) {
                    het = true;
                }
                else if(groupData.chemCompType.toLowerCase().indexOf('peptide') !== -1) {
                    bProtein = true;
                }
                else if(groupData.chemCompType.toLowerCase().indexOf('dna') !== -1 || groupData.chemCompType.toLowerCase().indexOf('rna') !== -1) {
                    bNucleotide = true;
                }
                else {
                    bProtein = true;
                }

                  // add sequence information
                  let  chainid = structure + '_' + chain;

                  let  resObject = {}
                  resObject.resi = resi;
                  resObject.name = me.utilsCls.residueName2Abbr(resn);

                  ic.residueId2Name[resid] = resObject.name;

                  let  numberStr = '';
                  if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

                  let  secondaries = '-';
                  if(ss === 'helix') {
                      secondaries = 'H';
                  }
                  else if(ss === 'sheet') {
                      secondaries = 'E';
                  }
                  else if(ss === 'coil') {
                      secondaries = 'c';
                  }
                  else if(ss === 'other') {
                      secondaries = 'o';
                  }

                  if(ic.chainsSeq[chainid] === undefined) ic.chainsSeq[chainid] = [];
                  if(ic.bFullUi) ic.chainsSeq[chainid].push(resObject);

                  ic.secondaries[resid] = secondaries;
            },
            onAtom: function( atomData ){
                elem = atomData.element;
                atomName = atomData.atomName;
                coord = new THREE.Vector3(atomData.xCoord, atomData.yCoord, atomData.zCoord);
                b = atomData.bFactor;

                alt = atomData.altLoc;
                if(atomData.altLoc === '\u0000') { // a temp value, should be ''
                    alt = '';
                }

                // skip the atoms where alt is not '' or 'A'
                if(alt === '' || alt === 'A') {
                    ++serial;

                    if(atomName === 'SG') SGAtomSerialArray.push(serial);

                    oriindex2serial[atomData.atomIndex] = serial;

                    let  atomDetails = {
                        het: het, // optional, used to determine chemicals, water, ions, etc
                        serial: serial,         // required, unique atom id
                        name: atomName,             // required, atom name
                        alt: alt,               // optional, some alternative coordinates
                        resn: resn,             // optional, used to determine protein or nucleotide
                        structure: structure,   // optional, used to identify structure
                        chain: chain,           // optional, used to identify chain
                        resi: resi,             // optional, used to identify residue ID
                        //insc: line.substr(26, 1),
                        coord: coord,           // required, used to draw 3D shape
                        b: b,         // optional, used to draw B-factor tube
                        elem: elem,             // optional, used to determine hydrogen bond
                        bonds: [],              // required, used to connect atoms
                        bondOrder: [],
                        ss: ss,             // optional, used to show secondary structures
                        ssbegin: ssbegin,         // optional, used to show the beginning of secondary structures
                        ssend: ssend            // optional, used to show the end of secondary structures
                    }

                    if(!atomDetails.het && atomDetails.name === 'C') {
                        CSerial = serial;
                    }
                    if(!atomDetails.het && atomDetails.name === 'O') {
                        OSerial = serial;
                    }

                    // from DSSP C++ code
                    if(!atomDetails.het && atomDetails.name === 'N' && prevCSerial !== undefined && prevOSerial !== undefined) {
                        let  dist = ic.atoms[prevCSerial].coord.distanceTo(ic.atoms[prevOSerial].coord);

                        let  x2 = atomDetails.coord.x +(ic.atoms[prevCSerial].coord.x - ic.atoms[prevOSerial].coord.x) / dist;
                        let  y2 = atomDetails.coord.y +(ic.atoms[prevCSerial].coord.y - ic.atoms[prevOSerial].coord.y) / dist;
                        let  z2 = atomDetails.coord.z +(ic.atoms[prevCSerial].coord.z - ic.atoms[prevOSerial].coord.z) / dist;

                        atomDetails.hcoord = new THREE.Vector3(x2, y2, z2);
                    }

                    ic.atoms[serial] = atomDetails;

                    pmin.min(coord);
                    pmax.max(coord);
                    psum.add(coord);

                    let  chainid = structure + '_' + chain;
                    let  resid = chainid + '_' + resi;

                    if(ic.chains[chainid] === undefined) ic.chains[chainid] = {}
                    ic.chains[chainid][serial] = 1;

                    if(ic.residues[resid] === undefined) ic.residues[resid] = {}
                    ic.residues[resid][serial] = 1;

                    if(bProtein) {
                      ic.proteins[serial] = 1;

                      if(atomName === 'CA') ic.calphas[serial] = 1;
                      if(atomName !== 'N' && atomName !== 'CA' && atomName !== 'C' && atomName !== 'O') ic.sidec[serial] = 1;
                    }
                    else if(bNucleotide) {
                      ic.nucleotides[serial] = 1;

                      if(bFull &&(atomName == "O3'" || atomName == "O3*")) {
                          ic.nucleotidesO3[serial] = 1;
                      }
                      else if(!bFull && atomName == 'P') {
                          ic.nucleotidesO3[serial] = 1;
                      }
                    }
                    else {
                      if(elem.toLowerCase() === resn.toLowerCase()) {
                          ic.ions[serial] = 1;
                      }
                      else if(resn === 'HOH' || resn === 'WAT' || resn === 'SQL' || resn === 'H2O' || resn === 'W' || resn === 'DOD' || resn === 'D3O') {
                          ic.water[serial] = 1;
                      }
                      else {
                          ic.chemicals[serial] = 1;
                      }
                    }

                    ic.dAtoms[serial] = 1;
                    ic.hAtoms[serial] = 1;
                }
            },
            onBond: function( bondData ){
                let  from = oriindex2serial[bondData.atomIndex1];
                let  to = oriindex2serial[bondData.atomIndex2];

                if(oriindex2serial.hasOwnProperty(bondData.atomIndex1) && oriindex2serial.hasOwnProperty(bondData.atomIndex2)) { // some alt atoms were skipped
                    ic.atoms[from].bonds.push(to);
                    ic.atoms[to].bonds.push(from);

                    if(het) {
                        let  order = bondData.bondOrder;

                        ic.atoms[from].bondOrder.push(order);
                        ic.atoms[to].bondOrder.push(order);

                        if(order === 2) {
                            ic.doublebonds[from + '_' + to] = 1;
                            ic.doublebonds[to + '_' + from] = 1;
                        }
                        else if(order === 3) {
                            ic.triplebonds[from + '_' + to] = 1;
                            ic.triplebonds[to + '_' + from] = 1;
                        }
                    }
                }
            }
        }

        // traverse
        MMTF.traverse( mmtfData, callbackDict );

        // set up disulfide bonds
        let  sgLength = SGAtomSerialArray.length;
        for(let i = 0, il = sgLength; i < il; ++i) {
            for(let j = i+1, jl = sgLength; j < il; ++j) {

                let  serial1 = SGAtomSerialArray[i];
                let  serial2 = SGAtomSerialArray[j];

                let  atom1 = ic.atoms[serial1];
                let  atom2 = ic.atoms[serial2];

                if($.inArray(serial2, atom1.bonds) !== -1) {
                    let  resid1 = atom1.structure + '_' + atom1.chain + '_' + atom1.resi;
                    let  resid2 = atom2.structure + '_' + atom2.chain + '_' + atom2.resi;

                    if(ic.ssbondpnts[atom1.structure] === undefined) ic.ssbondpnts[atom1.structure] = [];

                    ic.ssbondpnts[atom1.structure].push(resid1);
                    ic.ssbondpnts[atom1.structure].push(resid2);
                }
            }
        }

        ic.cnt = serial;

        if(ic.cnt > ic.maxatomcnt ||(ic.biomtMatrices !== undefined && ic.biomtMatrices.length * ic.cnt > 10 * ic.maxatomcnt) ) {
            ic.opts['proteins'] = 'c alpha trace'; //ribbon, strand, cylinder and plate, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, nothing
            ic.opts['nucleotides'] = 'o3 trace'; //nucleotide cartoon, o3 trace, schematic, lines, stick,
        }

        ic.pmin = pmin;
        ic.pmax = pmax;
        ic.maxD = pmax.distanceTo(pmin);
        ic.center = psum.multiplyScalar(1.0 / ic.cnt);

        if(ic.maxD < 5) ic.maxD = 5;
        ic.oriMaxD = ic.maxD;
        ic.oriCenter = ic.center.clone();

        ic.ParserUtilsCls.transformToOpmOri(mmtfid);

        if(ic.icn3dui.cfg.align === undefined && Object.keys(ic.structures).length == 1) {
            $("#" + ic.pre + "alternateWrapper").hide();
        }

        ic.setStyleCls.setAtomStyleByOptions(ic.opts);
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        ic.ParserUtilsCls.renderStructure();

        ic.saveFileCls.showTitle();

        if(ic.icn3dui.cfg.rotate !== undefined) ic.resizeCanvasCls.rotStruc(ic.icn3dui.cfg.rotate, true);

        //if(ic.icn3dui.deferred !== undefined) ic.icn3dui.deferred.resolve(); if(ic.deferred2 !== undefined) ic.deferred2.resolve();
    }
}

export {MmtfParser}
