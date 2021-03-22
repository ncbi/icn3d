/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.applySymd = function () { var me = this, ic = me.icn3d; "use strict";
    for(var i = 0, il = this.symdArray.length; i < il; ++i) {
        var symdHash = this.symdArray[i];
        var title = Object.keys(symdHash)[0];
        this.applySymmetry(title, true, symdHash[title]);
    }
};

iCn3D.prototype.applySymmetry = function (title, bSymd, inDataArray) { var me = this, ic = me.icn3d; "use strict";
    //var dataArray = (bSymd) ? this.symdHash[title] : this.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
    var dataArray = (bSymd) ? inDataArray : this.symmetryHash[title]; // start_end_colorAxis_colorPolygon_order_chain
    if(!dataArray) dataArray = [];

    var symmetryType = title.substr(0, 1);
    var nSide = parseInt(title.substring(1, title.indexOf(' ')));

    var axisRadius = 2 * this.cylinderRadius * this.oriMaxD / 150;
    var polygonRadius = 1 * this.cylinderRadius * this.oriMaxD / 150;

    if(symmetryType == 'I') {
        axisRadius *= 2;
        polygonRadius *= 2;
    }

    var pointArray = [];

    var index = 0;
    for(var i = 0, il = dataArray.length; i < il; ++i) {
        var start = dataArray[i][0];
        var end = dataArray[i][1];
        var colorAxis = dataArray[i][2];
        var colorPolygon = dataArray[i][3];
        var order = dataArray[i][4];
        var chain = dataArray[i][5];

        me.createCylinder(start, end, axisRadius, colorAxis, 0);

        if(symmetryType == 'C' || (symmetryType == 'D' && order == nSide) ) {
            // find the center and size of the selected protein chain

            var selection = {};
            // check the number of chains
            var nChain = Object.keys(this.chains).length;
            var bMultiChain = false;
            var chainHashTmp = {};

            if(bSymd && Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
                for(var serial in this.hAtoms) {
                    var atom = this.atoms[serial];
                    var chainid = atom.structure + '_' + atom.chain;
                    chainHashTmp[chainid] = 1;
                }

                if(Object.keys(chainHashTmp).length > 1) {
                    bMultiChain = true;
                }
            }

            //if(!bSymd || bMultiChain || Object.keys(this.hAtoms).length < Object.keys(this.atoms).length) {
            if(!bSymd) {
                var selectedChain = Object.keys(this.structures)[0] + '_' + chain;

                if(!this.chains.hasOwnProperty(selectedChain)) {
                    selectedChain = Object.keys(this.structures)[0] + '_' + chain.toLowerCase();
                }

                if(!this.chains.hasOwnProperty(selectedChain)) {
                    selectedChain = Object.keys(this.chains)[0];
                    for(var chainid in this.chains) {
                        var firstSerial = Object.keys(this.chains[chainid])[0];
                        if(this.proteins.hasOwnProperty(firstSerial)) {
                            selectedChain = chainid;
                            break;
                        }
                    }
                }
                selection = this.chains[selectedChain];
            }
            else if(bMultiChain) {
                var selectedChain = Object.keys(chainHashTmp)[0];
                selection = this.chains[selectedChain];
            }
            else { // bSymd, subset, and one chain
                // pick the first 1/order of selection
                var cnt = parseInt(Object.keys(this.hAtoms).length / order);
                var j = 0, lastSerial;

                for(var serial in this.hAtoms) {
                    selection[serial] = 1;
                    lastSerial = serial;
                    ++j;
                    if(j > cnt) break;
                }

                // add the whole residue for the last serial
                var resid = this.atoms[lastSerial].structure + '_' + this.atoms[lastSerial].chain + '_' + this.atoms[lastSerial].resi;
                selection = this.unionHash(selection, this.residues[resid]);
            }


            var middle = start.clone().add(end).multiplyScalar(0.5);

            var psum = new THREE.Vector3();
            var cnt = 0;

            // apply the transformation to make the axis in the z-axis
            var axis = end.clone().sub(start).normalize();
            var vTo = new THREE.Vector3(0, 0, 1);

            var quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors (axis, vTo)

            var distSqMax = -9999;
            for (var serial in selection) {
                var atom = this.atoms[serial];
                var coord = atom.coord.clone();
                psum.add(coord);

                coord.sub(middle).applyQuaternion(quaternion);

                var distSq = coord.x*coord.x + coord.y*coord.y;

                if(distSq > distSqMax) distSqMax = distSq;

                ++cnt;
            }

            var center = psum.multiplyScalar(1.0 / cnt);

            var line = new THREE.Line3(start, end);

            // project center on line
            var proj = new THREE.Vector3();
            line.closestPointToPoint(center, true, proj);

            var rLen = Math.sqrt(distSqMax);

            var rDir = center.clone().sub(proj).normalize().multiplyScalar(rLen);

            //var start2 = start.clone().add(rDir);
            //var end2 = end.clone().add(rDir);

            var start2 = middle.clone().add(start.clone().sub(middle).multiplyScalar(0.83)).add(rDir);
            var end2 = middle.clone().add(end.clone().sub(middle).multiplyScalar(0.83)).add(rDir);

            //var axis = end.clone().sub(start).normalize();
            var anglePerSide = 2*Math.PI / nSide;

            var startInit, endInit, startPrev, endPrev;
            for(var j = 0; j < nSide; ++j) {
                var angle = (0.5 + j) * anglePerSide;

                var startCurr = start2.clone().sub(start);
                startCurr.applyAxisAngle(axis, angle).add(start);

                var endCurr = end2.clone().sub(start);
                endCurr.applyAxisAngle(axis, angle).add(start);

                me.createCylinder(startCurr, endCurr, polygonRadius, colorPolygon, 0);

                me.createSphereBase(startCurr, colorPolygon, polygonRadius, 1.0, 0);
                me.createSphereBase(endCurr, colorPolygon, polygonRadius, 1.0, 0);

                if(j == 0) {
                    startInit = startCurr;
                    endInit = endCurr;
                }
                else {
                    me.createCylinder(startCurr, startPrev, polygonRadius, colorPolygon, 0);
                    me.createCylinder(endCurr, endPrev, polygonRadius, colorPolygon, 0);
                }

                startPrev = startCurr;
                endPrev = endCurr;
            }

            me.createCylinder(startInit, startPrev, polygonRadius, colorPolygon, 0);
            me.createCylinder(endInit, endPrev, polygonRadius, colorPolygon, 0);
        }
        else if( (symmetryType == 'T' && order == 3)
          || (symmetryType == 'O' && order == 4)
          || (symmetryType == 'I' && order == 5) ) {
            pointArray.push(start);
            pointArray.push(end);
        }
        else if(symmetryType == 'H') {
        }
    }

    if(symmetryType == 'T') {
        var pos1 = pointArray[0]; // pointArray: start, end, start, end, ...
        me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);

        var dist2 = pos1.distanceTo(pointArray[2]);
        var dist3 = pos1.distanceTo(pointArray[3]);

        var distSmall, posSel;
        if(dist2 < dist3) {
            distSmall = dist2;
            posSel = pointArray[3];
        }
        else {
            distSmall = dist3;
            posSel = pointArray[2];
        }

        me.createSphereBase(posSel, colorPolygon, polygonRadius, 1.0, 0);
        me.createCylinder(pos1, posSel, polygonRadius, colorPolygon, 0);

        var iPrev;
        for(var i = 4, il = pointArray.length; i < il; ++i) {
            var pos2 = pointArray[i];

            var dist = pos1.distanceTo(pos2);
            if(dist > distSmall) {
                me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos2, polygonRadius, colorPolygon, 0);

                me.createCylinder(posSel, pos2, polygonRadius, colorPolygon, 0);
                if(iPrev !== undefined) {
                    me.createCylinder(pointArray[iPrev], pos2, polygonRadius, colorPolygon, 0);
                }

                iPrev = i;
            }
        }
    }
    else if(symmetryType == 'O') {
        for(var i = 0, il = pointArray.length; i < il; i += 2) {
            var pos1 = pointArray[i];
            var pos2 = pointArray[i+1];
            me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
            me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
            for(var j = i + 2, jl = pointArray.length; j < jl; ++j) {
                var pos3 = pointArray[j];
                me.createSphereBase(pos3, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos3, polygonRadius, colorPolygon, 0);
                me.createCylinder(pos2, pos3, polygonRadius, colorPolygon, 0);
            }
        }
    }
    else if(symmetryType == 'I') {
        for(var i = 0, il = pointArray.length; i < il; i += 2) {
            var pos1 = pointArray[i];
            var pos2 = pointArray[i+1];
            me.createSphereBase(pos1, colorPolygon, polygonRadius, 1.0, 0);
            me.createSphereBase(pos2, colorPolygon, polygonRadius, 1.0, 0);
            for(var j = i + 2, jl = pointArray.length; j < jl; j += 2) {
                var pos3 = pointArray[j];
                var pos4 = pointArray[j+1];

                var dist3 = pos1.distanceTo(pos3);
                var dist4 = pos1.distanceTo(pos4);

                var pos1Sel, pos2Sel;
                if(dist3 < dist4) {
                    pos1Sel = pos3;
                    pos2Sel = pos4;
                }
                else {
                    pos1Sel = pos4;
                    pos2Sel = pos3;
                }

                me.createSphereBase(pos1Sel, colorPolygon, polygonRadius, 1.0, 0);
                me.createSphereBase(pos2Sel, colorPolygon, polygonRadius, 1.0, 0);
                me.createCylinder(pos1, pos1Sel, polygonRadius, colorPolygon, 0);
                me.createCylinder(pos2, pos2Sel, polygonRadius, colorPolygon, 0);
            }
        }
    }
};
