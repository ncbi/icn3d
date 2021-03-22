/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.getAnnotationData = function() { var me = this, ic = me.icn3d; "use strict";
    var chnidBaseArray = $.map(me.protein_chainid, function(v) { return v; });
    var index = 0;
    for(var chnid in me.protein_chainid) {
        var buttonStyle = me.isMobile() ? 'none' : 'button';
        var fullProteinName = me.getProteinName(chnid);
        var proteinName = fullProteinName;
        //if(proteinName.length > 40) proteinName = proteinName.substr(0, 40) + "...";
        var categoryStr = (index == 0) ? "<span class='icn3d-annoLargeTitle'><b>Proteins</b>: </span><br><br>" : "";
        var geneLink = (ic.chainsGene[chnid] && ic.chainsGene[chnid].geneId) ? " (Gene: <a href='https://www.ncbi.nlm.nih.gov/gene/" + ic.chainsGene[chnid].geneId + "' target='_blank' title='" + ic.chainsGene[chnid].geneDesc + "'>" + ic.chainsGene[chnid].geneSymbol + "</a>)" : '';
        var chainHtml = "<div id='" + me.pre + "anno_" + chnid + "' class='icn3d-annotation'>" + categoryStr
            + "<span style='font-weight:bold;'>Annotations of " + chnid
            + "</span>: <a class='icn3d-blue' href='https://www.ncbi.nlm.nih.gov/protein?term="
            + chnid + "' target='_blank' title='" + fullProteinName + "'>" + proteinName + "</a>"
            + geneLink + "&nbsp;&nbsp;&nbsp;"
            + me.addButton(chnid, "icn3d-addtrack", "Add Track", "Add a custom track", 60, buttonStyle)
            + "&nbsp;&nbsp;&nbsp;";
        //if(me.cfg.blast_rep_id !== undefined && me.cfg.blast_rep_id == chnid) {
            chainHtml += me.addButton(chnid, "icn3d-customcolor", "Custom Color/Tube", "Use a custom file to define the colors or tubes in 3D structure", 110, buttonStyle) + "&nbsp;&nbsp;&nbsp;";
        //}
            chainHtml += me.addButton(chnid, "icn3d-helixsets", "Helix Sets", "Define sets for each helix in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
            + me.addButton(chnid, "icn3d-sheetsets", "Sheet Sets", "Define sets for each sheet in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle) + "&nbsp;"
            + me.addButton(chnid, "icn3d-coilsets", "Coil Sets", "Define sets for each coil in this chain and add them to the menu of \"Defined Sets\"", 60, buttonStyle);
        $("#" + me.pre + "dl_annotations").append(chainHtml);
        var itemArray = ['giseq', 'cdd', 'clinvar', 'snp', 'domain', 'site', 'interaction', 'custom', 'ssbond', 'crosslink', 'transmem'];
        // dt: detailed view, hide by default; ov: overview, show by default
        for(var i in itemArray) {
            var item = itemArray[i];
            $("#" + me.pre + "anno_" + chnid).append(me.getAnDiv(chnid, item));
        }
        $("#" + me.pre + "anno_" + chnid).append("<br><hr><br>");
        ++index;
    }
    me.setToolTip();
    // show the sequence and 3D structure
    //var url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=protein&retmode=json&rettype=fasta&id=" + chnidBaseArray;
    var url = me.baseUrl + "/vastdyn/vastdyn.cgi?chainlist=" + chnidBaseArray;

    if(me.chainid_seq !== undefined) {
        me.processSeqData(me.chainid_seq);
    }
    else {
        $.ajax({
          url: url,
          dataType: 'jsonp', //'text',
          cache: true,
          tryCount : 0,
          retryLimit : 0, //1,
          success: function(data) {
            me.chainid_seq = data;
            me.processSeqData(me.chainid_seq);
          },
          error : function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            }
            me.enableHlSeq();
            console.log( "No data were found for the protein " + chnidBaseArray + "..." );
            for(var chnid in me.protein_chainid) {
                var chnidBase = me.protein_chainid[chnid];
                me.setAlternativeSeq(chnid, chnidBase);
                me.showSeq(chnid, chnidBase);
            }
            // get CDD/Binding sites
            me.showCddSiteAll();
            return;
          }
        });
    }
};
