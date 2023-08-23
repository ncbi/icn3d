/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

 import {Html} from '../../html/html.js';

 import {FirstAtomObj} from '../selection/firstAtomObj.js';
 import {ShowAnno} from '../annotations/showAnno.js';
 import {ShowSeq} from '../annotations/showSeq.js';
 
 class AnnoLocal {
     constructor(icn3d) {
         this.icn3d = icn3d;
         this.shortLabel = 'local';
     }
 
     //Show the local annotation
     showLocalAnno() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        let chainidArray = Object.keys(ic.protein_chainid);

        // show local annotation
        let url = "[some_RESTful_API]?chainids=" + chainidArray;

        $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: true,
            success: function(dataArray) {
                thisClass.parseAnnoData(dataArray, chainidArray);
            },
            error : function(xhr, textStatus, errorThrown ) {
                for(let chainid in ic.protein_chainid) {
                    thisClass.getNoAnno(chainid);
                }

                return;
            }
        });
     }
 
     parseAnnoData(dataArray, chainidArray) { let ic = this.icn3d, me = ic.icn3dui;
         let thisClass = this;
 
         let chainWithData = {};
 
         // loop through each chain
         for(let i = 0, il = dataArray.length; i < il; ++i) {
             // data could be an array of hashes, each of which use "resid" as the key,
             //   and the value could be a list of "resid"
             // resid could be '1KQ2_A_2', where '1KQ2' is the PDB ID, 'A'is the chain, 
             //   '2' is the residue number
             let data = dataArray[i].value; 
             let chainid = chainidArray[i];

             let resid2resids = {}; // interaction of one residue with other residues
             
             if(data.length == 0) {
                 thisClass.getNoAnno(chainid);
                 return;
             }

             for(let i = 0, il = data.length; i < il; i = i + 2) {
                 // resid could be '1KQ2_A_2', where '1KQ2' is the PDB ID, 'A'is the chain, 
                 //   '2' is the residue number
                 let resid = data[i].resid; 
                 let toresids = data[i].toresids.split(',');
                 resid2resids[resid] = toresids;id
             }

             let residueArray = Object.keys(resid2resids);
             let title = "Local Annotations";
             ic.annoCddSiteCls.showAnnoType(chainid, chainid, this.shortLabel, title, residueArray, resid2resids);
         } // outer for loop

         // add here after the ajax call
         ic.showAnnoCls.enableHlSeq();
     }
 
     getNoAnno(chainid) { let ic = this.icn3d, me = ic.icn3dui;
         console.log( "No annotation data were found for the protein " + chainid + "..." );
         $("#" + ic.pre + "dt_" + thisClass.shortLabel + "_" + chainid).html('');
         $("#" + ic.pre + "ov_" + thisClass.shortLabel + "_" + chainid).html('');
         $("#" + ic.pre + "tt_" + thisClass.shortLabel + "_" + chainid).html('');
     }

     updateLocalAnno() { let ic = this.icn3d, me = ic.icn3dui;
        if(!ic.bLocalAnnoShown) {
            let annoLocalCls = new AnnoLocal(icn3dui.icn3d);
            annoLocalCls.showLocalAnno();
        }
        ic.bLocalAnnoShown = true;
    }

    clickLocalAnno() { let ic = this.icn3d, me = ic.icn3dui;
        if($("#" + ic.pre + "anno_" + this.shortLabel)[0].checked) {
            this.setAnnoTabLocal();
            me.htmlCls.clickMenuCls.setLogCmd("set annotation " + this.shortLabel, false);
        }
        else{
            this.hideAnnoTabLocal();
            me.htmlCls.clickMenuCls.setLogCmd("hide annotation " + this.shortLabel, false);
        }
    }

    setAnnoTabLocal() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + this.shortLabel + "]").show();
        if($("#" + ic.pre + "anno_" + this.shortLabel).length) $("#" + ic.pre + "anno_" + this.shortLabel)[0].checked = true;
    }
    hideAnnoTabLocal() {  let ic = this.icn3d, me = ic.icn3dui;
        $("[id^=" + ic.pre + this.shortLabel + "]").hide();
        if($("#" + ic.pre + "anno_" + this.shortLabel).length) $("#" + ic.pre + "anno_" + this.shortLabel)[0].checked = false;
    }
 }
 
 export {AnnoLocal}
 