/**
 * @author Jack Lin <th3linja@yahoo.com> / https://github.com/ncbi/icn3d
 */

class SelectCollections {
  constructor(icn3d) {
    this.icn3d = icn3d;
  }

  //Set the menu of defined sets with an array of defined names "commandnameArray".
  setAtomMenu(collection) {
    let ic = this.icn3d,
    me = ic.icn3dui;
    let html = "";
    
    Object.entries(collection).forEach(([name, structure], index) => {
      let atom, atomHash;
      let [id, title, description, commands, pdb] = structure;

      if (
        ic.defNames2Atoms !== undefined &&
        ic.defNames2Atoms.hasOwnProperty(name)
      ) {
        let atomArray = ic.defNames2Atoms[name];

        if (atomArray.length > 0) atom = ic.atoms[atomArray[0]];
      } else if (
        ic.defNames2Residues !== undefined &&
        ic.defNames2Residues.hasOwnProperty(name)
      ) {
        let residueArray = ic.defNames2Residues[name];
        if (residueArray.length > 0) {
          atomHash = ic.residues[residueArray[0]];
          if (atomHash) {
            atom = ic.atoms[Object.keys(atomHash)[0]];
          }
        }
      }

      if (index === 0) {
        html += "<option value='" + name + "' selected='selected' data-description='" + description + "'>" + title + "</option>";
      } else {
        html += "<option value='" + name + "' data-description='" + description + "'>" + title + "</option>";
      }
    });

    return html;
  }

  reset() {
    let ic = this.icn3d;

    ic.atoms = {}

    ic.proteins = {}
    ic.nucleotides = {}
    ic.chemicals = {}
    ic.ions = {}
    ic.water = {}

    ic.structures = {}
    ic.chains = {}
    ic.chainsSeq = {}
    ic.residues = {}

    ic.defNames2Atoms = {}
    ic.defNames2Residues = {}

    ic.ssbondpnts = {};

    ic.bShowHighlight = undefined;
    ic.bResetSets = true;
  }

  dictionaryDifference(dict1, dict2) {
      const difference = {};

      for (let key in dict2) {
          if (!(key in dict1)) {
              difference[key] = dict2[key];
          }
      }

      return difference;
  }

  clickStructure(collection) {
    let ic = this.icn3d,
      me = ic.icn3dui;
    let thisClass = this;

    //me.myEventCls.onIds("#" + ic.pre + "atomsCustom", "change", function(e) { let  ic = thisClass.icn3d;
    $("#" + ic.pre + "collections_menu").on("change", async function (e) {
      let ic = thisClass.icn3d;

      let nameArray = $(this).val();
      let nameStructure = $(this).find("option:selected").text();
      let selectedIndices = Array.from(this.selectedOptions).map(option => option.index);
      let selectedIndicesMap = nameArray.reduce((map, name, i) => {
        map[name] = selectedIndices[i];
        return map;
      }, {});

      ic.nameArray = nameArray;

      if (nameArray !== null) {
        let bNoDuplicate = true;
        thisClass.reset()
        for (const name of nameArray) {
          if (!(name in ic.allData)) {
            ic.allData['prev'] = JSON.parse(JSON.stringify(ic.allData['all']));

            ic.atoms = ic.allData['all']['atoms'];
            
            ic.proteins = ic.allData['all']['proteins'];
            ic.nucleotides = ic.allData['all']['nucleotides'];
            ic.chemicals = ic.allData['all']['chemicals'];
            ic.ions = ic.allData['all']['ions'];
            ic.water = ic.allData['all']['water'];
  
            ic.structures = ic.allData['all']['structures']
            ic.ssbondpnts = ic.allData['all']['ssbondpnts']
            ic.residues = ic.allData['all']['residues']
            ic.chains = ic.allData['all']['chains']
            ic.chainsSeq = ic.allData['all']['chainsSeq']
            ic.defalls2Atoms = ic.allData['all']['defalls2Atoms']
            ic.defalls2Residues = ic.allData['all']['defalls2Residues']

            async function loadStructure(pdb) {
              await ic.resetConfig();
              if (pdb) {
                let bAppend = true;
                if (Object.keys(ic.structures).length == 0) {
                  bAppend = false;
                }
                await ic.pdbParserCls.loadPdbData(ic.pdbCollection[name].join('\n'), undefined, undefined, bAppend);
              } else {
                await ic.chainalignParserCls.downloadMmdbAf(name, undefined, undefined, bNoDuplicate);
              }
            }
            
            await loadStructure(collection[name][4]).then(() => {
              ic.allData['all'] = {
                'atoms': ic.atoms,
                'proteins': ic.proteins,
                'nucleotides': ic.nucleotides,
                'chemicals': ic.chemicals,
                'ions': ic.ions,
                'water': ic.water,
                'structures': ic.structures, // getSSExpandedAtoms
                'ssbondpnts': ic.ssbondpnts,
                'residues': ic.residues, // getSSExpandedAtoms
                'chains': ic.chains,
                'chainsSeq': ic.chainsSeq, //Sequences and Annotation
                'defNames2Atoms': ic.defNames2Atoms,
                'defNames2Residues': ic.defNames2Residues
              };

              ic.allData[name] = {
                'title': ic.molTitle,
                'atoms': thisClass.dictionaryDifference(ic.allData['prev']['atoms'], ic.atoms),
                'proteins': thisClass.dictionaryDifference(ic.allData['prev']['proteins'], ic.proteins),
                'nucleotides': thisClass.dictionaryDifference(ic.allData['prev']['nucleotides'], ic.nucleotides),
                'chemicals': thisClass.dictionaryDifference(ic.allData['prev']['chemicals'], ic.chemicals),
                'ions': thisClass.dictionaryDifference(ic.allData['prev']['ions'], ic.ions),
                'water': thisClass.dictionaryDifference(ic.allData['prev']['water'], ic.water),
                'structures': thisClass.dictionaryDifference(ic.allData['prev']['structures'], ic.structures), // getSSExpandedAtoms
                'ssbondpnts': thisClass.dictionaryDifference(ic.allData['prev']['ssbondpnts'], ic.ssbondpnts),
                'residues': thisClass.dictionaryDifference(ic.allData['prev']['residues'], ic.residues), // getSSExpandedAtoms
                'chains': thisClass.dictionaryDifference(ic.allData['prev']['chains'], ic.chains),
                'chainsSeq': thisClass.dictionaryDifference(ic.allData['prev']['chainsSeq'], ic.chainsSeq), //Sequences and Annotation
                'defNames2Atoms': thisClass.dictionaryDifference(ic.allData['prev']['defNames2Atoms'], ic.defNames2Atoms),
                'defNames2Residues': thisClass.dictionaryDifference(ic.allData['prev']['defNames2Residues'], ic.defNames2Residues)
              };

              thisClass.reset()
            });
          }
        }

        for (const name of nameArray) {
            ic.atoms = Object.assign(ic.atoms, ic.allData[name]['atoms']);
            
            ic.proteins = Object.assign(ic.proteins, ic.allData[name]['proteins']);
            ic.nucleotides = Object.assign(ic.nucleotides, ic.allData[name]['nucleotides']);
            ic.chemicals = Object.assign(ic.chemicals, ic.allData[name]['chemicals']);
            ic.ions = Object.assign(ic.ions, ic.allData[name]['ions']);
            ic.water = Object.assign(ic.water, ic.allData[name]['water']);

            ic.structures = Object.assign(ic.structures, ic.allData[name]['structures'])
            ic.ssbondpnts = Object.assign(ic.ssbondpnts, ic.allData[name]['ssbondpnts'])
            ic.residues = Object.assign(ic.residues, ic.allData[name]['residues'])
            ic.chains = Object.assign(ic.chains, ic.allData[name]['chains'])
            ic.chainsSeq = Object.assign(ic.chainsSeq, ic.allData[name]['chainsSeq'])
            ic.defNames2Atoms = Object.assign(ic.defNames2Atoms, ic.allData[name]['defNames2Atoms'])
            ic.defNames2Residues = Object.assign(ic.defNames2Residues, ic.allData[name]['defNames2Residues'])
            ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
            ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms);
            
          ic.molTitle = ic.allData[name]['title'];
          
          if (collection[name][3] !== undefined && collection[name][3].length > 0) {
            if (ic.allData[name]['commands'] == undefined) {
              let commands = collection[name][3];
              ic.allData[name]['commands'] = commands;
            }
          }

           if (ic.allData[name]['commands'] !== undefined) {   
              for (const command of ic.allData[name]['commands']) {
                me.htmlCls.clickMenuCls.setLogCmd(command, true);
                await ic.applyCommandCls.applyCommand(command);
              }
            }
            
        }
        
        ic.opts["color"] = (Object.keys(ic.structures).length == 1) ? "chain" : "structure";
        ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

        ic.transformCls.zoominSelection();
        ic.definedSetsCls.showSets();

        ic.bResetAnno = true;
        if(ic.bAnnoShown) {
          await ic.showAnnoCls.showAnnotations();

          ic.hlUpdateCls.updateHlAll(nameArray);
          // show selected chains in annotation window
          ic.annotationCls.showAnnoSelectedChains();
        }
        
        await ic.drawCls.draw();
        ic.saveFileCls.showTitle();

        me.htmlCls.clickMenuCls.setLogCmd("select structure " + "[" + nameStructure + "]", false);
        me.htmlCls.clickMenuCls.setLogCmd('load mmdbaf1 ' + nameArray, true);
      }
    });

    me.myEventCls.onIds(
      "#" + ic.pre + "collections_menu",
      "focus",
      function (e) {
        let ic = thisClass.icn3d;
        if (me.utilsCls.isMobile())
          $("#" + ic.pre + "collections_menu").val("");
      }
    );
  }
}

export { SelectCollections };
