/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://star.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createCurveSub = function (_pnts, width, colors, div, bHighlight, bRibbon, bNoSmoothen, bShowArray, calphaIdArray, positions, prevone, nexttwo) { var me = this, ic = me.icn3d; "use strict";
    if (_pnts.length === 0) return;
    div = div || 5;
    var pnts;
    if(!bNoSmoothen) {
        var bExtendLastRes = true;
        var pnts_clrs = this.subdivide(_pnts, colors, div, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes);
        pnts = pnts_clrs[0];
        colors = pnts_clrs[2];
    }
    else {
        pnts = _pnts;
    }
    if (pnts.length === 0) return;

    this.setCalphaDrawnCoord(pnts, div, calphaIdArray);

    if(bHighlight === 1) {
        var radius = this.coilWidth / 2;
        //var radiusSegments = 8;
        var radiusSegments = 4; // save memory
        var closed = false;

        if(pnts.length > 1) {
            if(positions !== undefined) {
                var currPos, prevPos;
                var currPoints = [];
                for(var i = 0, il = pnts.length; i < il; ++i) {
                    currPos = positions[i];

                    if( (currPos !== prevPos && currPos !== prevPos + 1 && prevPos !== undefined) || (i === il -1) ) {
                        // first tube
                        var geometry0 = new THREE.TubeGeometry(
                            new THREE.CatmullRomCurve3(currPoints), // path
                            currPoints.length, // segments
                            radius,
                            radiusSegments,
                            closed
                        );

                        var mesh = new THREE.Mesh(geometry0, this.matShader);
                        mesh.renderOrder = this.renderOrderPicking;
                        //this.mdlPicking.add(mesh);
                        this.mdl.add(mesh);

                        this.prevHighlightObjects.push(mesh);

                        geometry0 = null;

                        currPoints = [];
                    }

                    currPoints.push(pnts[i]);

                    prevPos = currPos;
                }

                currPoints = [];
            }
            else {
                var geometry0 = new THREE.TubeGeometry(
                    new THREE.CatmullRomCurve3(pnts), // path
                    pnts.length, // segments
                    radius,
                    radiusSegments,
                    closed
                );

                var mesh = new THREE.Mesh(geometry0, this.matShader);
                mesh.renderOrder = this.renderOrderPicking;
                //this.mdlPicking.add(mesh);
                this.mdl.add(mesh);

                this.prevHighlightObjects.push(mesh);

                geometry0 = null;
            }
        }
    }
    else {
        var geo = new THREE.Geometry();

        if(bHighlight === 2 && bRibbon) {
            for (var i = 0, divInv = 1 / div; i < pnts.length; ++i) {
                // shift the highlight a little bit to avoid the overlap with ribbon
                pnts[i].addScalar(0.6); // this.ribbonthickness is 0.4
                geo.vertices.push(pnts[i]);
                //geo.colors.push(this.thr(colors[i === 0 ? 0 : Math.round((i - 1) * divInv)]));
                geo.colors.push(this.thr(colors[i]));
            }
        }
        else {
            for (var i = 0, divInv = 1 / div; i < pnts.length; ++i) {
                geo.vertices.push(pnts[i]);
                //geo.colors.push(this.thr(colors[i === 0 ? 0 : Math.round((i - 1) * divInv)]));
                geo.colors.push(this.thr(colors[i]));
            }
        }

        //var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: width, vertexColors: true }), THREE.LineStrip);
        var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ linewidth: width, vertexColors: true }));
        this.mdl.add(line);
        if(bHighlight === 2) {
            this.prevHighlightObjects.push(line);
        }
        else {
            this.objects.push(line);
        }
    }

    pnts = null;
};

iCn3D.prototype.setCalphaDrawnCoord = function (pnts, div, calphaIdArray) { var me = this, ic = me.icn3d; "use strict";
    var index = 0;

    if(calphaIdArray !== undefined) {
        for(var i = 0, il = pnts.length; i < il; i += div) { // pnts.length = (calphaIdArray.length - 1) * div + 1
            var serial = calphaIdArray[index];

            if(this.atoms.hasOwnProperty(serial)) {
                this.atoms[serial].coord2 = pnts[i].clone();
            }

            ++index;
        }
    }
};
