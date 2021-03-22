/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.setChainsInMenu = function () { var me = this, ic = me.icn3d; "use strict";
    for(var chainid in ic.chains) {
        // skip chains with one residue/chemical
        if(ic.chainsSeq[chainid] && ic.chainsSeq[chainid].length > 1) {
          //ic.defNames2Atoms[chainid] = Object.keys(ic.chains[chainid]);
          ic.defNames2Residues[chainid] = Object.keys(ic.getResiduesFromAtoms(ic.chains[chainid]));
          ic.defNames2Descr[chainid] = chainid;

          var pos = chainid.indexOf('_');
          var structure = chainid.substr(0, pos);
          var chain = chainid.substr(pos + 1);

          ic.defNames2Command[chainid] = 'select $' + structure + '.' + chain;
        }
    }

    // select whole structure
    if(Object.keys(ic.structures) == 1) {
      var structure = Object.keys(ic.structures)[0];

      ic.defNames2Residues[structure] = Object.keys(ic.residues);
      ic.defNames2Descr[structure] = structure;

      ic.defNames2Command[structure] = 'select $' + structure;
    }
    else {
        var resArray = Object.keys(ic.residues);
        var structResHash = {};
        for(var i = 0, il = resArray.length; i < il; ++i) {
            var resid = resArray[i];
            var pos = resid.indexOf('_');
            var structure = resid.substr(0, pos);
            if(structResHash[structure] === undefined) {
                structResHash[structure] = [];
            }
            structResHash[structure].push(resid);
        }

        for(var structure in structResHash) {
          ic.defNames2Residues[structure] = structResHash[structure];
          ic.defNames2Descr[structure] = structure;

          ic.defNames2Command[structure] = 'select $' + structure;
        }
    }
};
