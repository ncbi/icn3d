/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.calculateArea = function() { var me = this, ic = me.icn3d; "use strict";
   ic.bCalcArea = true;
   ic.opts.surface = 'solvent accessible surface';
   ic.applySurfaceOptions();
   $("#" + me.pre + "areavalue").val(ic.areavalue);
   $("#" + me.pre + "areatable").html(ic.areahtml);
   me.openDlg('dl_area', 'Surface area calculation');
   ic.bCalcArea = false;
};

iCn3DUI.prototype.calcBuriedSurface = function(nameArray2, nameArray) { var me = this, ic = me.icn3d; "use strict";
   if(nameArray2.length == 0) {
       alert("Please select the first set");
   }
   else {
       var prevHAtoms = ic.cloneHash(ic.hAtoms);
       var atomSet2 = me.getAtomsFromNameArray(nameArray2);
       var atomSet1 = me.getAtomsFromNameArray(nameArray);
       ic.bCalcArea = true;
       ic.opts.surface = 'solvent accessible surface';
       ic.hAtoms = ic.cloneHash(atomSet2);
       ic.applySurfaceOptions();
       var area2 = ic.areavalue;
       ic.hAtoms = ic.cloneHash(atomSet1);
       ic.applySurfaceOptions();
       var area1 = ic.areavalue;
       ic.hAtoms = ic.unionHash(ic.hAtoms, atomSet2);
       ic.applySurfaceOptions();
       var areaTotal = ic.areavalue;
       ic.bCalcArea = false;
       ic.hAtoms = ic.cloneHash(prevHAtoms);
       var buriedArea = (parseFloat(area1) + parseFloat(area2) - parseFloat(areaTotal)).toFixed(2);
       var html = '<br>Calculate solvent accessible surface area in the interface:<br><br>';
       html += 'Set 1: ' + nameArray2 + ', Surface: ' +  area2 + ' &#8491;<sup>2</sup><br>';
       html += 'Set 2: ' + nameArray + ', Surface: ' +  area1 + ' &#8491;<sup>2</sup><br>';
       html += 'Total Surface: ' +  areaTotal + ' &#8491;<sup>2</sup><br>';
       html += '<b>Buried Surface</b>: ' +  buriedArea + ' &#8491;<sup>2</sup><br><br>';
       $("#" + me.pre + "dl_buriedarea").html(html);
       me.openDlg('dl_buriedarea', 'Buried solvent accessible surface area in the interface');
       me.setLogCmd('buried surface ' + buriedArea, false);
   }
};
