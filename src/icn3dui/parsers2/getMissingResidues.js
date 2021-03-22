/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getMissingResidues = function (seqArray, type, chainid) { var me = this, ic = me.icn3d; "use strict";
    var prevResi = -9999;
    //var missingResBegin = 0;
    //var bCount = true;

    ic.chainsSeq[chainid] = [];
    for(var i = 0, il = seqArray.length; i < il; ++i) {
        var seqName, resiPos;
        // mmdbid: ["0","R","ARG"],["502","V","VAL"]; mmcifid: [1, "ARG"]; align: ["0","R","ARG"] //align: [1, "0","R","ARG"]
        if(type === 'mmdbid') {
            seqName = seqArray[i][1];
            resiPos = 0;
        }
        else if(type === 'mmcifid') {
            seqName = seqArray[i][1];
            seqName = ic.residueName2Abbr(seqName);
            resiPos = 0;
        }
        else if(type === 'align') {
            //seqName = seqArray[i][2];
            seqName = seqArray[i][1];
            resiPos = 0;
        }

        // fixe some missing residue names such as residue 6 in 5C1M_A
        if(seqName === '') {
            seqName = 'x';
        }

        var resObject = {};

        if(!ic.bUsePdbNum) {
            resObject.resi = i + 1;
        }
        else {
            var offset = (ic.chainid2offset[chainid]) ? ic.chainid2offset[chainid] : 0;
            resObject.resi = (seqArray[i][resiPos] == '0') ? i + 1 + offset : seqArray[i][resiPos];
        }

        var resi = parseInt(seqArray[i][resiPos]);
        var nextResi = (i == il - 1) ? 9999 : parseInt(seqArray[i+1][resiPos]);

        if(resi !== 0 ||
          (resi === 0 && (prevResi === -1 || nextResi == 1) )
          ) {
            resObject.name = seqName.toUpperCase();

            //if(bCount && missingResBegin > 0) {
                //if(me.countNextresiArray[chainid] === undefined) me.countNextresiArray[chainid] = [];

                //var count_nextresi = [missingResBegin, parseInt(seqArray[i][0])];

                //me.countNextresiArray[chainid].push(count_nextresi);

            //    missingResBegin = 0;
            //}

            //bCount = false;
        }
        //else if(resi === 0 && prevResi !== -1) { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
        else { // sometimes resi could be -4, -3, -2, -1, 0 e.g., PDBID 4YPS
            resObject.name = seqName.toLowerCase();

            //++missingResBegin;

            //if(me.chainMissingResidueArray[chainid] === undefined) me.chainMissingResidueArray[chainid] = [];
            //me.chainMissingResidueArray[chainid].push(resObject);

            //bCount = true;
        }

        //if(ic.chainsSeq[chainid] === undefined) ic.chainsSeq[chainid] = [];

        //var numberStr = '';
        //if(resObject.resi % 10 === 0) numberStr = resObject.resi.toString();

        ic.chainsSeq[chainid].push(resObject);

        prevResi = resi;
    }
};
