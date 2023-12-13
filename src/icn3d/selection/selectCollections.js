class SelectCollections {
  constructor(icn3d) {
    this.icn3d = icn3d;
  }

  //Set the menu of defined sets with an array of defined names "commandnameArray".
  setAtomMenu(nameArray, titleArray) {
    let ic = this.icn3d,
      me = ic.icn3dui;
    let html = "";
    let commandnameArray = [nameArray[0]];
    //for(let i in ic.defNames2Atoms) {
    for (let i = 0, il = nameArray.length; i < il; ++i) {
      let name = nameArray[i];
      let title = titleArray[i];

      let atom, atomHash;
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

      if (commandnameArray.indexOf(name) != -1) {
        html +=
          "<option value='" +
          name +
          "' selected='selected'>" +
          title +
          "</option>";
      } else {
        html += "<option value='" + name + "'>" + title + "</option>";
      }
    }

    return html;
  }

  clickStructure() {
    let ic = this.icn3d,
      me = ic.icn3dui;
    let thisClass = this;

    //me.myEventCls.onIds("#" + ic.pre + "atomsCustom", "change", function(e) { let  ic = thisClass.icn3d;
    $("#" + ic.pre + "collections_menu").change(async function (e) {
      let ic = thisClass.icn3d;
      //    ic.init()
      let nameArray = $(this).val();
      let nameStructure = $(this).find("option:selected").text();

      ic.nameArray = nameArray;
      if (nameArray !== null) {
        ic.bShowHighlight = false;
        await ic.chainalignParserCls.downloadMmdbAf(nameArray.toString());

        ic.dAtoms = {};
        ic.hAtoms = {};
        //  ic.ssbondpnts = {};
        let chainIdHash = {};

        for (const name in nameArray) {
          for (const key in ic.chains) {
            if (key.includes(nameArray[name])) {
              chainIdHash[key] = 1;
              if (ic.chains.hasOwnProperty(key)) {
                const innerDict = ic.chains[key];
                for (const innerKey in innerDict) {
                  if (innerDict.hasOwnProperty(innerKey)) {
                    ic.dAtoms[innerKey] = innerDict[innerKey];
                    ic.hAtoms[innerKey] = innerDict[innerKey];
                  }
                }
              }
            }
          }
        }

        console.log(chainIdHash);

        ic.transformCls.zoominSelection();
        console.log("-------------------------------------------------------");
        ic.definedSetsCls.showSets();
        // $("#" + ic.pre + "atomsCustom")
        //   .val(nameArray)
        //   .change();

        await ic.drawCls.draw();
        ic.saveFileCls.showTitle();

        me.htmlCls.clickMenuCls.setLogCmd(
          "select structure " + "[" + nameStructure + "]",
          true
        );
        ic.bSelectResidue = false;
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
