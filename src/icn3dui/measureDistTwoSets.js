/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */
 
iCn3DUI.prototype.measureDistTwoSets = function(nameArray, nameArray2) { var me = this, ic = me.icn3d; "use strict";
   if(nameArray.length == 0 || nameArray2.length == 0) {
       alert("Please select two sets");
   }
   else {
       var prevHAtoms = ic.cloneHash(ic.hAtoms);
       var atomSet1 = me.getAtomsFromNameArray(nameArray);
       var atomSet2 = me.getAtomsFromNameArray(nameArray2);

       var posArray1 = ic.getExtent(atomSet1);
       var posArray2 = ic.getExtent(atomSet2);

       var pos1 = new THREE.Vector3(posArray1[2][0], posArray1[2][1], posArray1[2][2]);
       var pos2 = new THREE.Vector3(posArray2[2][0], posArray2[2][1], posArray2[2][2]);

       ic.hAtoms = ic.cloneHash(prevHAtoms);

       var bOther = true;
       ic.createBox_base(pos1, ic.originSize, ic.hColor, false, bOther);
       ic.createBox_base(pos2, ic.originSize, ic.hColor, false, bOther);

       var color = $("#" + me.pre + "distancecolor2" ).val();

       me.addLine(pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z, color, true, 'distance');

       var size = 0, background = 0;
       var labelPos = pos1.clone().add(pos2).multiplyScalar(0.5);
       var distance = parseInt(pos1.distanceTo(pos2) * 10) / 10;
       var text = distance.toString() + " A";
       me.addLabel(text, labelPos.x, labelPos.y, labelPos.z, size, color, background, 'distance');
       ic.draw();
   }
};
