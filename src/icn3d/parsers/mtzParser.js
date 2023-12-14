/**
 * @file Mtz Parser
 * @author Marcin Wojdyr <wojdyr@gmail.com>
 * @private
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

class MtzParser {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    async mtzParserBase(url, type, sigma, location, bInputSigma) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
        // if(type == '2fofc' && ic.bAjax2fofcccp4) {
        //     ic.mapData.sigma2 = sigma;
        //     ic.setOptionCls.setOption('map', type);
        // }
        // else if(type == 'fofc' && ic.bAjaxfofcccp4) {
        //     ic.mapData.sigma = sigma;
        //     ic.setOptionCls.setOption('map', type);
        // }
        // else {
            let arrayBuffer = await me.getXMLHttpRqstPromise(url, 'GET', 'arraybuffer', '');
            sigma = await thisClass.loadMtzFileBase(arrayBuffer, type, sigma, location, bInputSigma, url);

            // if(type == '2fofc') {
            //     ic.bAjax2fofcccp4 = true;
            // }
            // else if(type == 'fofc') {
            //     ic.bAjaxfofcccp4 = true;
            // }

            ic.setOptionCls.setOption('map', type);

            return sigma;
        // }
    }

    loadMtzFile(type) {var ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let file = $("#" + ic.pre + "dsn6file" + type)[0].files[0];
       let sigma = $("#" + ic.pre + "dsn6sigma" + type).val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         let reader = new FileReader();
         reader.onload = async function(e) { let ic = thisClass.icn3d;
            sigma = await thisClass.loadMtzFileBase(e.target.result, type, sigma, 'file');
            me.htmlCls.clickMenuCls.setLogCmd('load map file ' + $("#" + ic.pre + "dsn6file" + type).val() + ' with sigma ' + sigma, false);
         }
         reader.readAsArrayBuffer(file);
       }
    }

    async loadMtzFileBase(data, type, sigma, location, bInputSigma, url) {var ic = this.icn3d, me = ic.icn3dui;
        if(ic.bMtz === undefined) {
            let url = "./script/mtz.js";
            await me.getAjaxPromise(url, 'script');

            ic.bMtz = true;
        }

        GemmiMtz().then(function(Gemmi) {
            let mtz = Gemmi.readMtz(data);

            sigma = ic.ccp4ParserCls.load_maps_from_mtz_buffer(mtz, type, sigma, location, bInputSigma);

            // if(type == '2fofc') {
            //     ic.bAjax2fofcCcp4 = true;
            // }
            // else if(type == 'fofc') {
            //     ic.bAjaxfofcCcp4 = true;
            // }
            ic.setOptionCls.setOption('map', type);
            if(url) me.htmlCls.clickMenuCls.setLogCmd('set map ' + type + ' sigma ' + sigma + ' file mtz | ' + encodeURIComponent(url), true);

            return sigma;
        });
     }

    async loadMtzFileUrl(type) {var ic = this.icn3d, me = ic.icn3dui;
       let url = $("#" + ic.pre + "dsn6fileurl" + type).val();
       let sigma = $("#" + ic.pre + "dsn6sigmaurl" + type).val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           sigma = await this.mtzParserBase(url, type, sigma, 'url');

           //me.htmlCls.clickMenuCls.setLogCmd('set map ' + type + ' sigma ' + sigma + ' file mtz | ' + encodeURIComponent(url), true);
       }
    }

}

export {MtzParser}
