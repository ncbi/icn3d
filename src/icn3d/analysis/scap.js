/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

class Scap {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async applyCommandScap(command) { let ic = this.icn3d, me = ic.icn3dui;
        let snp = command.substr(command.lastIndexOf(' ') + 1);

        if(command.indexOf('scap 3d') == 0) {
          await this.retrieveScap(snp);
        }
        else if(command.indexOf('scap interaction') == 0) {
          await this.retrieveScap(snp, true);
        }
        else if(command.indexOf('scap pdb') == 0) {
          await this.retrieveScap(snp, undefined, true);
        }
    }

    adjust2DWidth(id) { let ic = this.icn3d, me = ic.icn3dui;
        let halfWidth = 125;
        id = ic.pre + id;
/*
        let height =($("#" + ic.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? $("#" + ic.pre + 'dl_selectannotations').dialog( "option", "height") : me.htmlCls.HEIGHT;
        let width =($("#" + ic.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) ? halfWidth * 2 : me.htmlCls.WIDTH * 0.5;

        $("#" + id).dialog( "option", "width", width );
        $("#" + id).dialog( "option", "height", height);
        let position = { my: "left-" + halfWidth + " top+" + me.htmlCls.MENU_HEIGHT, at: "right top", of: "#" + ic.pre + "viewer", collision: "none" }

        $("#" + id).dialog( "option", "position", position );
*/

        let width, height, top;
        
        if($("#" + ic.pre + 'dl_selectannotations').hasClass("ui-dialog-content")) {
          width = $("#" + ic.pre + 'dl_selectannotations').dialog( "option", "width");
          height = $("#" + ic.pre + 'dl_selectannotations').dialog( "option", "height") * 0.5;
          top = height;

          $("#" + ic.pre + "dl_selectannotations").dialog( "option", "height", height);

          $("#" + id).dialog( "option", "width", width );
          $("#" + id).dialog( "option", "height", height);
          
          let position = { my: "left top", at: "right top+" + top, of: "#" + ic.pre + "viewer", collision: "none" }
  
          $("#" + id).dialog( "option", "position", position );
        }
    }

    async retrieveScap(snp, bInteraction, bPdb) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.bScap = true;

        //snp: 6M0J_E_484_K,6M0J_E_501_Y,6M0J_E_417_N
        let snpStr = '';
        let snpArray = snp.split(','); //stru_chain_resi_snp
        let atomHash = {}, snpResidArray = [], chainResi2pdb = {};
        for(let i = 0, il = snpArray.length; i < il; ++i) {
            let idArray = snpArray[i].split('_'); //stru_chain_resi_snp

            let resid = idArray[0] + '_' + idArray[1] + '_' + idArray[2];
            atomHash = me.hashUtilsCls.unionHash(atomHash, ic.residues[resid]);
            snpResidArray.push(resid);
            chainResi2pdb[idArray[1] + '_' + idArray[2]] = '';

            snpStr += idArray[1] + '_' + idArray[2] + '_' + idArray[3];
            if(i != il -1) snpStr += ',';
        }

        let selectSpec = ic.resid2specCls.residueids2spec(snpResidArray);
        let select = "select " + selectSpec;

        let bGetPairs = false;
        let radius = 10; //4;
        // find neighboring residues
        let result = ic.showInterCls.pickCustomSphere_base(radius, atomHash, ic.atoms, false, false, undefined, select, bGetPairs);


        let residArray = Object.keys(result.residues);
        ic.hAtoms = {}
        for(let index = 0, indexl = residArray.length; index < indexl; ++index) {
          let residueid = residArray[index];
          for(let i in ic.residues[residueid]) {
            ic.hAtoms[i] = 1;
          }
        }

    //    ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[resid]);
        ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, atomHash);
        ic.hAtoms = me.hashUtilsCls.exclHash(ic.hAtoms, ic.chemicals);

        // the displayed atoms are for each SNP only
        //var atomHash = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);

///        let pdbStr = ic.saveFileCls.getPDBHeader() + ic.saveFileCls.getAtomPDB(ic.hAtoms);
        let pdbStr = ic.saveFileCls.getAtomPDB(ic.hAtoms);

        let url = me.htmlCls.baseUrl + "scap/scap.cgi";

        let pdbid = Object.keys(ic.structures)[0]; //Object.keys(ic.structures).toString();
        let dataObj = {'pdb': pdbStr, 'snp': snpStr, 'pdbid': pdbid, 'v': '2'}

        let data;
         
        // try {
          data = await me.getAjaxPostPromise(url, dataObj, true, undefined, undefined, undefined, 'text');

          let pos = data.indexOf('\n');
          let energy = data.substr(0, pos);
          let pdbData = data.substr(pos + 1);
console.log("free energy: " + energy + " kcal/mol");

          let bAddition = true;
          let hAtom1 = me.hashUtilsCls.cloneHash(ic.hAtoms);

          // the wild type is the reference
          for(let serial in hAtom1) {
              let atom = ic.atoms[serial];
              let chainid = atom.structure + '_' + atom.chain;
              let resid = chainid + '_' + atom.resi;

              if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                ic.chainsMapping[chainid] = {};
              }
              ic.chainsMapping[chainid][resid] = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi;
          }

          //ic.hAtoms = {};
          //ic.loadPDBCls.loadPDB(pdbData, pdbid, false, false, bAddition);
          //let hAtom2 = me.hashUtilsCls.cloneHash(ic.hAtoms);

          // get the mutant pdb
          let lines = pdbData.split('\n');
          let allChainResiHash = {};
          for (let i in lines) {
              let line = lines[i];
              let record = line.substr(0, 6);
              
              if (record === 'ATOM  ' || record === 'HETATM') {
                  let chain = line.substr(20, 2).trim();
                  if(chain === '') chain = 'A';
  
                  let resi = line.substr(22, 5).trim();
                  let chainResi = chain + '_' + resi;
                  
                  if(chainResi2pdb.hasOwnProperty(chainResi)) {
                      chainResi2pdb[chainResi] += line + '\n';
                  }  

                  allChainResiHash[chainResi] = 1;
              }
          }

          // get the full mutant PDB
          let pdbDataMutant = ic.saveFileCls.getAtomPDB(ic.atoms, false, false, false, chainResi2pdb);

          ic.hAtoms = {};
          let bMutation = true;
          ic.loadPDBCls.loadPDB(pdbDataMutant, pdbid, false, false, bMutation, bAddition);
          //let allAtoms2 = me.hashUtilsCls.cloneHash(ic.hAtoms);

          // copy the secondary structures from wild type to mutatnt
          for(let resid in ic.residues) {
            let struct = resid.substr(0, resid.indexOf('_'));
            
            if(struct == pdbid + '2') { // mutant
              let residWt = pdbid + resid.substr(resid.indexOf('_'));       
              let atomWt = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[residWt]);
              if(atomWt) {
                for(let i in ic.residues[resid]) {
                  ic.atoms[i].ss = atomWt.ss;
                  ic.atoms[i].ssbegin = atomWt.ssbegin;
                  ic.atoms[i].ssend = atomWt.ssend;           
                }
              }
            }
          }
          for(let resid in ic.secondaries) {
            let struct = resid.substr(0, resid.indexOf('_'));
            
            if(struct == pdbid + '2') { // mutant
              let residWt = pdbid + resid.substr(resid.indexOf('_'));       
              ic.secondaries[resid] = ic.secondaries[residWt];
            }
          }
          

          ic.setStyleCls.setAtomStyleByOptions(ic.opts);
          ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

          // get the mutant residues in the sphere
          let hAtom2 = {};
          for(let serial in ic.hAtoms) {
            let atom = ic.atoms[serial];
            let chainResi = atom.chain + '_' + atom.resi;
            if(allChainResiHash.hasOwnProperty(chainResi)) {
              hAtom2[serial] = 1;
            }
          }

          ic.hAtoms = me.hashUtilsCls.unionHash(hAtom1, hAtom2);
          //ic.hAtoms = me.hashUtilsCls.unionHash(hAtom1, allAtoms2);
          ic.dAtoms = me.hashUtilsCls.cloneHash(ic.hAtoms);
          //ic.dAtoms = ic.hAtoms;

          ic.transformCls.zoominSelection();
          ic.setOptionCls.setStyle('proteins', 'stick');

          //ic.opts['color'] = 'chain';
          //ic.setColorCls.setColorByOptions(ic.opts, ic.dAtoms);
          for(let serial in hAtom2) {
          //for(let serial in allAtoms2) {
              let atom = ic.atoms[serial];

              if(!atom.het) {
                  // use the same color as the wild type
                  let resid = atom.structure.substr(0, atom.structure.length - 1) + '_' + atom.chain + '_' + atom.resi;

                  let atomWT = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[resid]);

                  if(atomWT) {
                    ic.atoms[serial].color = atomWT.color;
                    ic.atomPrevColors[serial] = atomWT.color;
                  }
              }

              let chainid = atom.structure + '_' + atom.chain;
              let resid = chainid + '_' + atom.resi;
              let residWT = atom.structure.substr(0, atom.structure.length - 1) + '_' + atom.chain + '_' + atom.resi;

              if(!ic.chainsMapping.hasOwnProperty(chainid)) {
                ic.chainsMapping[chainid] = {};
              }
              ic.chainsMapping[chainid][resid] = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi;
              // use the wild type as reference

              if(snpResidArray.indexOf(residWT) != -1) {
                  let atomWT = ic.firstAtomObjCls.getFirstAtomObj(ic.residues[residWT]);
                  ic.chainsMapping[chainid][resid] = me.utilsCls.residueName2Abbr(atomWT.resn) + atomWT.resi;
              }
          }

          if(bPdb) {
              // let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
              // ic.saveFileCls.saveFile(file_pref + '_' + snpStr + '.pdb', 'text', [pdbDataMutant]);

              await thisClass.exportPdbProfix(false, pdbDataMutant, snpStr) 

              ic.drawCls.draw();
          }
          else {
              //var select = '.' + idArray[1] + ':' + idArray[2];
              //var name = 'snp_' + idArray[1] + '_' + idArray[2];
              let select = selectSpec;

              let name = 'snp_' + snpStr;
              await ic.selByCommCls.selectByCommand(select, name, name);
              ic.opts['color'] = 'atom';
              ic.setColorCls.setColorByOptions(ic.opts, ic.hAtoms);

              ic.viewInterPairsCls.clearInteractions();

              if(bInteraction) {
                //me.htmlCls.clickMenuCls.setLogCmd("select " + select + " | name " + name, true);

                let type = 'linegraph';
                await ic.viewInterPairsCls.viewInteractionPairs(['selected'], ['non-selected'], false, type, true, true, true, true, true, true);
                //me.htmlCls.clickMenuCls.setLogCmd("line graph interaction pairs | selected non-selected | hbonds,salt bridge,interactions,halogen,pi-cation,pi-stacking | false | threshold 3.8 6 4 3.8 6 5.5", true);

                thisClass.adjust2DWidth('dl_linegraph');
              }

              ic.hAtoms = ic.dAtoms;
              //me.htmlCls.clickMenuCls.setLogCmd("select displayed set", true);

              ic.drawCls.draw();

              if(!me.alertAlt) {
                me.alertAlt = true;

                //if(ic.bRender) alert('Please press the letter "a" to alternate between wild type and mutant.');
                alert('Please press the letter "a" to alternate between wild type and mutant.');
              }
          }

          $("#" + ic.pre + "mn2_alternateWrap").show();
          // expand the toolbar
          let id = ic.pre + 'selection';
          $("#" + id).show();
/*
        }
        catch(err) {
            alert("There are some problems in predicting the side chain of the mutant...");

            ic.ParserUtilsCls.hideLoading();

            /// if(ic.deferredScap !== undefined) ic.deferredScap.resolve();
            return;
        }
        */
    }

    async exportPdbProfix(bHydrogen, pdb, snpStr) { let ic = this.icn3d, me = ic.icn3dui;
      let pdbStr;

      if(pdb) {
        pdbStr = pdb;
      }
      else {
        let atoms = me.hashUtilsCls.intHash(ic.dAtoms, ic.hAtoms);
        pdbStr = ic.saveFileCls.getAtomPDB(atoms);
      }

      let url = me.htmlCls.baseUrl + "scap/scap.cgi";
      let hydrogenStr = (bHydrogen) ? '1' : '0';
      let dataObj = {'pdb': pdbStr, 'profix': '1', 'hydrogen': hydrogenStr}

      let data;
       
      try {
        data = await me.getAjaxPostPromise(url, dataObj, undefined, undefined, undefined, undefined, 'text');
      }
      catch(err) {
        alert("There are some problems in adding missing atoms or hydrogens...");
        return;
      }

      if(!me.bNode) {
        let file_pref = Object.keys(me.utilsCls.getHlStructures()).join(',');
        let postfix = (bHydrogen) ? "add_hydrogen" : "add_missing_atoms";
        if(snpStr) postfix = snpStr;

        ic.saveFileCls.saveFile(file_pref + '_icn3d_' + postfix + '.pdb', 'text', [data]);
      }
      else {
        return data;
      }
   }
}

export {Scap}
