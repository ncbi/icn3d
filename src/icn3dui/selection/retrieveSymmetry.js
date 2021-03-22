/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.retrieveSymmetry = function (pdbid) { var me = this, ic = me.icn3d; "use strict";
   var url = "https://data.rcsb.org/rest/v1/core/assembly/" + pdbid + "/1";

   $.ajax({
      url: url,
      dataType: "json",
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(data) {
          var symmetryArray = data.rcsb_struct_symmetry;
          var rot, centerFrom, centerTo;

          if(symmetryArray !== undefined) {
              if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                  rot = ic.rmsd_supr.rot;
                  centerFrom = ic.rmsd_supr.trans1;
                  centerTo = ic.rmsd_supr.trans2;
              }

              ic.symmetryHash = {};
              for(var i = 0, il = symmetryArray.length; i < il; ++i) {
                  if(symmetryArray[i].symbol == 'C1') continue;
                  var title = 'no title';
                  if(symmetryArray[i].kind == "Pseudo Symmetry") {
                      title = symmetryArray[i].symbol + ' (pseudo)';
                  }
                  else if(symmetryArray[i].kind == "Global Symmetry") {
                      title = symmetryArray[i].symbol + ' (global)';
                  }
                  else if(symmetryArray[i].kind == "Local Symmetry") {
                      title = symmetryArray[i].symbol + ' (local)';
                  }

                  var rotation_axes = symmetryArray[i].rotation_axes;
                  var axesArray = [];
                  for(var j = 0, jl = rotation_axes.length; j < jl; ++j) {
                      var tmpArray = [];
                      var start = new THREE.Vector3(rotation_axes[j].start[0], rotation_axes[j].start[1], rotation_axes[j].start[2]);
                      var end = new THREE.Vector3(rotation_axes[j].end[0], rotation_axes[j].end[1], rotation_axes[j].end[2]);

                      // apply matrix for each atom
                      if(ic.rmsd_supr !== undefined && ic.rmsd_supr.rot !== undefined) {
                          start = ic.transformMemPro(start, rot, centerFrom, centerTo);
                          end = ic.transformMemPro(end, rot, centerFrom, centerTo);
                      }

                      tmpArray.push(start);
                      tmpArray.push(end);

                      // https://www.rcsb.org/pages/help/viewers/jmol_symmetry_view
                      var colorAxis = me.getAxisColor(symmetryArray[i].symbol, rotation_axes[j].order);
                      var colorPolygon = me.getPolygonColor(symmetryArray[i].symbol);
                      tmpArray.push(colorAxis);
                      tmpArray.push(colorPolygon);

                      tmpArray.push(rotation_axes[j].order);

                      // selected chain
                      tmpArray.push(symmetryArray[i].clusters[0].members[0].asym_id);

                      axesArray.push(tmpArray);
                  }

                  ic.symmetryHash[title] = axesArray;
              }

              if(Object.keys(ic.symmetryHash).length == 0) {
                  $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
              }
              else {
                  var html = "<option value='none'>None</option>", index = 0;
                  for(var title in ic.symmetryHash) {
                      var selected = (index == 0) ? 'selected' : '';
                      html += "<option value=" + "'" + title + "' " + selected + ">" + title + "</option>";
                      ++index;
                  }

                  $("#" + me.pre + "selectSymmetry").html(html);
              }
          }
          else {
              $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");
          }

          me.openDlg('dl_symmetry', 'Symmetry');

          if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        $("#" + me.pre + "dl_symmetry").html("<br>This structure has no symmetry.");

        me.openDlg('dl_symmetry', 'Symmetry');

        if(me.deferredSymmetry !== undefined) me.deferredSymmetry.resolve();
        return;
      }
   });
};
