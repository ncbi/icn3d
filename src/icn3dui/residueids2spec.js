/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.residueids2spec = function(residueArray) { var me = this, ic = me.icn3d; "use strict";
     var spec = "";
     if(residueArray !== undefined){
         var residueArraySorted = residueArray.sort(function(a, b) {
            if(a !== '' && !isNaN(a)) {
                return parseInt(a) - parseInt(b);
            }
            else {
                var lastPosA = a.lastIndexOf('_');
                var lastPosB = b.lastIndexOf('_');
                if(a.substr(0, lastPosA) < b.substr(0, lastPosB)) return -1;
                else if(a.substr(0, lastPosA) > b.substr(0, lastPosB)) return 1;
                else if(a.substr(0, lastPosA) == b.substr(0, lastPosB)) {
                    if(parseInt(a.substr(lastPosA + 1)) < parseInt(b.substr(lastPosB + 1)) ) return -1;
                    else if(parseInt(a.substr(lastPosA + 1)) > parseInt(b.substr(lastPosB + 1)) ) return 1;
                    else if(parseInt(a.substr(lastPosA + 1)) == parseInt(b.substr(lastPosB + 1)) ) return 0;
                }
            }
         });
         var prevChain = '', chain, prevResi = 0, resi, lastDashPos, firstDashPos, struturePart, chainPart;
         var startResi;
         var bMultipleStructures = (Object.keys(ic.structures).length == 1) ? false : true;
         for(var j = 0, jl = residueArraySorted.length; j < jl; ++j) {
             var residueid = residueArraySorted[j];
             lastDashPos = residueid.lastIndexOf('_');
             chain = residueid.substr(0, lastDashPos);
             resi = parseInt(residueid.substr(lastDashPos+1));
             firstDashPos = prevChain.indexOf('_');
             struturePart = prevChain.substr(0, firstDashPos);
             chainPart = prevChain.substr(firstDashPos + 1);
             if(prevChain !== chain) {
                 if(j > 0) {
                     if(prevResi === startResi) {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + ' or ';
                         }
                     }
                     else {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                     }
                 }
                 startResi = resi;
             }
             else if(prevChain === chain) {
                 if(resi !== prevResi + 1) {
                     if(prevResi === startResi) {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + ' or ';
                         }
                     }
                     else {
                         if(bMultipleStructures) {
                             spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                         else {
                             spec += '.' + chainPart + ':' + startResi + '-' + prevResi + ' or ';
                         }
                     }
                     startResi = resi;
                 }
             }
             prevChain = chain;
             prevResi = resi;
         }
         // last residue
         firstDashPos = prevChain.indexOf('_');
         struturePart = prevChain.substr(0, firstDashPos);
         chainPart = prevChain.substr(firstDashPos + 1);
         if(prevResi === startResi) {
             if(bMultipleStructures) {
                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi;
             }
             else {
                 spec += '.' + chainPart + ':' + startResi;
             }
         }
         else {
             if(bMultipleStructures) {
                 spec += '$' + struturePart + '.' + chainPart + ':' + startResi + '-' + prevResi;
             }
             else {
                 spec += '.' + chainPart + ':' + startResi + '-' + prevResi;
             }
         }
     }
     return spec;
};
