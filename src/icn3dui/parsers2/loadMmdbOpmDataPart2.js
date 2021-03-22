/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.loadMmdbOpmDataPart2 = function(data, pdbid, type) { var me = this, ic = me.icn3d; "use strict";
    // set 3d domains
    var structure = data.pdbId;

    if(type === undefined) me.setYourNote(structure.toUpperCase() + ' (MMDB) in iCn3D');

    for(var molid in data.domains) {
        var chain = data.domains[molid].chain;
        var domainArray = data.domains[molid].domains;

        for(var index = 0, indexl = domainArray.length; index < indexl; ++index) {
            var domainName = structure + '_' + chain + '_3d_domain_' + (index+1).toString();
            ic.tddomains[domainName] = {};

            var subdomainArray = domainArray[index].intervals;

            // remove duplicate, e.g., at https://www.ncbi.nlm.nih.gov/Structure/mmdb/mmdb_strview.cgi?v=2&program=icn3d&domain&molinfor&uid=1itw
            var domainFromHash = {}, domainToHash = {};

            //var fromArray = [], toArray = [];
            //var resCnt = 0
            for(var i = 0, il = subdomainArray.length; i < il; ++i) {
                var domainFrom = Math.round(subdomainArray[i][0]) - 1; // 1-based
                var domainTo = Math.round(subdomainArray[i][1]) - 1;

                if(domainFromHash.hasOwnProperty(domainFrom) || domainToHash.hasOwnProperty(domainTo)) {
                    continue; // do nothing for duplicated "from" or "to", e.g, PDBID 1ITW, 5FWI
                }
                else {
                    domainFromHash[domainFrom] = 1;
                    domainToHash[domainTo] = 1;
                }

                //fromArray.push(domainFrom + me.baseResi[chnid]);
                //toArray.push(domainTo + me.baseResi[chnid]);
                //resCnt += domainTo - domainFrom + 1;

                for(var j = domainFrom; j <= domainTo; ++j) {
                    var resid = structure + '_' + chain + '_' + (j+1).toString();
                    ic.tddomains[domainName][resid] = 1;
                }
            }
        } // for each domainArray
    } // for each molid

    // "asuAtomCount" is defined when: 1) atom count is over the threshold 2) buidx=1 3) asu atom count is smaller than biological unit atom count
    me.bAssemblyUseAsu = (data.asuAtomCount !== undefined) ? true : false;
    if(type !== undefined) {
        me.bAssemblyUseAsu = false;

        me.downloadMmdbPart2(type);
    }
    else {
        $.when(me.downloadMmcifSymmetry(pdbid)).then(function() {
            me.downloadMmdbPart2(type);
        });
    }
};
