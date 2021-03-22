/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createTube = function (atoms, atomName, radius, bHighlight, bCustom, bRadiusArray) { var me = this, ic = me.icn3d; "use strict";
    var pnts = [], colors = [], radii = [], prevone = [], nexttwo = [];
    var currentChain, currentResi;
    var index = 0;
    var maxDist = 6.0;
    var maxDist2 = 3.0; // avoid tube between the residues in 3 residue helix

    var pnts_colors_radii_prevone_nexttwo = [];
    var firstAtom, atom, prevAtom;

    for (var i in atoms) {
        atom = atoms[i];
        if ((atom.name === atomName) && !atom.het) {
            if(index == 0) {
                firstAtom = atom;
            }

            //if (index > 0 && (currentChain !== atom.chain || currentResi + 1 !== atom.resi || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist) ) {
            if (index > 0 && (currentChain !== atom.chain || Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist
              || (currentResi + 1 !== atom.resi && (Math.abs(atom.coord.x - prevAtom.coord.x) > maxDist2 || Math.abs(atom.coord.y - prevAtom.coord.y) > maxDist2 || Math.abs(atom.coord.z - prevAtom.coord.z) > maxDist2) )
              ) ) {
                if(bHighlight !== 2) {
                    var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (firstAtom.resi - 1).toString();
                    var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
                    prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];

                    var nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 1).toString();
                    var nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 2).toString();

                    if(this.residues.hasOwnProperty(nextoneResid)) {
                        var nextAtom = this.getAtomFromResi(nextoneResid, atomName);
                        if(nextAtom !== undefined && nextAtom.ssbegin) { // include the residue
                            nextoneResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 2).toString();
                            nexttwoResid = prevAtom.structure + '_' + prevAtom.chain + '_' + (prevAtom.resi + 3).toString();

                            pnts.push(nextAtom.coord);
                            if(bCustom) {
                                radii.push(this.getCustomtubesize(nextoneResid));
                            }
                            else {
                                radii.push(this.getRadius(radius, nextAtom));
                            }
                            colors.push(nextAtom.color);
                        }
                    }

                    var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
                    if(nextoneCoord !== undefined) {
                        nexttwo.push(nextoneCoord);
                    }

                    var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
                    if(nexttwoCoord !== undefined) {
                        nexttwo.push(nexttwoCoord);
                    }

                    pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
                }
                pnts = []; colors = []; radii = []; prevone = []; nexttwo = [];
                firstAtom = atom;
                index = 0;
            }
            if(pnts.length == 0) {
                var prevoneResid = atom.structure + '_' + atom.chain + '_' + (atom.resi - 1).toString();
                if(this.residues.hasOwnProperty(prevoneResid)) {
                    prevAtom = this.getAtomFromResi(prevoneResid, atomName);
                    if(prevAtom !== undefined && prevAtom.ssend) { // include the residue
                        pnts.push(prevAtom.coord);
                        if(bCustom) {
                            radii.push(this.getCustomtubesize(prevoneResid));
                        }
                        else {
                            radii.push(this.getRadius(radius, prevAtom));
                        }
                        colors.push(prevAtom.color);
                    }
                }
            }
            pnts.push(atom.coord);

            var radiusFinal;
            if(bCustom) {
                radiusFinal = this.getCustomtubesize(atom.structure + '_' + atom.chain + '_' + atom.resi);
            }
            else {
                radiusFinal = this.getRadius(radius, atom);
            }

            //radii.push(radius || (atom.b > 0 ? atom.b * 0.01 : this.coilWidth));
            radii.push(radiusFinal);

            colors.push(atom.color);
            // the starting residue of a coil uses the color from the next residue to avoid using the color of the last helix/sheet residue
            if(index === 1) colors[colors.length - 2] = atom.color;

            currentChain = atom.chain;
            currentResi = atom.resi;

            var scale = 1.2;
            if(bHighlight === 2 && !atom.ssbegin) {
                this.createBox(atom, undefined, undefined, scale, undefined, bHighlight);
            }

            ++index;

            prevAtom = atom;
        }
    }
    if(bHighlight !== 2) {
        prevone = [];
        if(firstAtom !== undefined) {
            var prevoneResid = firstAtom.structure + '_' + firstAtom.chain + '_' + (firstAtom.resi - 1).toString();
            var prevoneCoord = this.getAtomCoordFromResi(prevoneResid, atomName);
            prevone = (prevoneCoord !== undefined) ? [prevoneCoord] : [];
        }

        nexttwo = [];
        if(atom !== undefined) {
            var nextoneResid = atom.structure + '_' + atom.chain + '_' + (atom.resi + 1).toString();
            var nextoneCoord = this.getAtomCoordFromResi(nextoneResid, atomName);
            if(nextoneCoord !== undefined) {
                nexttwo.push(nextoneCoord);
            }

            var nexttwoResid = atom.structure + '_' + atom.chain + '_' + (atom.resi + 2).toString();
            var nexttwoCoord = this.getAtomCoordFromResi(nexttwoResid, atomName);
            if(nexttwoCoord !== undefined) {
                nexttwo.push(nexttwoCoord);
            }
        }

        pnts_colors_radii_prevone_nexttwo.push({'pnts':pnts, 'colors':colors, 'radii':radii, 'prevone':prevone, 'nexttwo':nexttwo});
    }

    for(var i = 0, il = pnts_colors_radii_prevone_nexttwo.length; i < il; ++i) {
        var pnts = pnts_colors_radii_prevone_nexttwo[i].pnts;
        var colors = pnts_colors_radii_prevone_nexttwo[i].colors;
        var radii = pnts_colors_radii_prevone_nexttwo[i].radii;
        var prevone = pnts_colors_radii_prevone_nexttwo[i].prevone;
        var nexttwo = pnts_colors_radii_prevone_nexttwo[i].nexttwo;

        this.createTubeSub(pnts, colors, radii, bHighlight, prevone, nexttwo, bRadiusArray);
    }

    pnts_colors_radii_prevone_nexttwo = [];
};

iCn3D.prototype.getCustomtubesize = function (resid) { var me = this, ic = me.icn3d; "use strict";
    var pos = resid.lastIndexOf('_');
    var resi = resid.substr(pos + 1);
    var chainid = resid.substr(0, pos);

    var radiusFinal = (this.queryresi2score[chainid] && this.queryresi2score[chainid].hasOwnProperty(resi)) ? this.queryresi2score[chainid][resi] * 0.01 : this.coilWidth;

    return radiusFinal;
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createTubeSub = function (_pnts, colors, radii, bHighlight, prevone, nexttwo, bRadiusArray) { var me = this, ic = me.icn3d; "use strict";
    if (_pnts.length < 2) return;

    var segments, radiusSegments;

    if(bRadiusArray) {
        var circleDiv = this.tubeDIV, axisDiv = this.axisDIV;
        var circleDivInv = 1 / circleDiv, axisDivInv = 1 / axisDiv;
        var geo = new THREE.Geometry();
        var pnts_clrs = this.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo);

        var pnts = pnts_clrs[0];
        colors = pnts_clrs[2];

        var prevAxis1 = new THREE.Vector3(), prevAxis2;
        for (var i = 0, lim = pnts.length; i < lim; ++i) {
            var r, idx = (i - 1) * axisDivInv;
            if (i === 0) r = radii[0];
            else {
                if (idx % 1 === 0) r = radii[idx];
                else {
                    var floored = Math.floor(idx);
                    var tmp = idx - floored;
                    r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
                }
            }
            var delta, axis1, axis2;
            if (i < lim - 1) {
                delta = pnts[i].clone().sub(pnts[i + 1]);
                axis1 = new THREE.Vector3(0, -delta.z, delta.y).normalize().multiplyScalar(r);
                axis2 = delta.clone().cross(axis1).normalize().multiplyScalar(r);
                //      var dir = 1, offset = 0;
                if (prevAxis1.dot(axis1) < 0) {
                    axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
                }
                prevAxis1 = axis1; prevAxis2 = axis2;
            } else {
                axis1 = prevAxis1; axis2 = prevAxis2;
            }
            for (var j = 0; j < circleDiv; ++j) {
                var angle = 2 * Math.PI * circleDivInv * j; //* dir  + offset;
                geo.vertices.push(pnts[i].clone().add(axis1.clone().multiplyScalar(Math.cos(angle))).add(axis2.clone().multiplyScalar(Math.sin(angle))));
            }
        }
        var offset = 0;
        for (var i = 0, lim = pnts.length - 1; i < lim; ++i) {
            //var c = this.thr(colors[Math.round((i - 1) * axisDivInv)]);
            var c = this.thr(colors[i]);

            var reg = 0;
            var r1 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv]).lengthSq();
            var r2 = geo.vertices[offset].clone().sub(geo.vertices[offset + circleDiv + 1]).lengthSq();
            if (r1 > r2) { r1 = r2; reg = 1; };
            for (var j = 0; j < circleDiv; ++j) {
                geo.faces.push(new THREE.Face3(offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv, undefined, c));
                geo.faces.push(new THREE.Face3(offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv, undefined, c));
            }
            offset += circleDiv;
        }
        geo.computeFaceNormals();
        geo.computeVertexNormals(false);
    }
    else {
        var axisDiv = this.axisDIV;

        var pnts_clrs = this.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo);
        // extend one residue
        //var pnts_clrs = this.subdivide(_pnts, colors, axisDiv, undefined, undefined, prevone, nexttwo, true);

        _pnts = pnts_clrs[0];
        colors = pnts_clrs[2];

        var radius = this.coilWidth;
        segments = _pnts.length;
        //radiusSegments = 8;
        radiusSegments = 4; // save memory
        var closed = false;

        // when using radiusArray with modified three.js, the tube didn't work in picking
        var geo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(_pnts), // path
            segments,
            radius, //radiusArray, //radius,
            radiusSegments,
            closed
        );

        //https://stemkoski.github.io/Three.js/Graphulus-Curve.html
        var color, face, numberOfSides, vertexIndex;
        // faces are indexed using characters
        var faceIndices = [ 'a', 'b', 'c', 'd' ];

        // first, assign colors to vertices as desired
        var prevColor;
        for ( var s = 0; s <= segments; s++ ) {
            for ( var r = 0; r < radiusSegments; r++ )
            {
                vertexIndex = r + s * radiusSegments;
                color = colors[s];
                if(!color) color = prevColor;

                geo.colors[vertexIndex] = color; // use this array for convenience

                prevColor = color;
            }
        }
        // copy the colors as necessary to the face's vertexColors array.
        for ( var i = 0; i < geo.faces.length; i++ )
        {
            face = geo.faces[ i ];

            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
            for( var j = 0; j < numberOfSides; j++ )
            {
                vertexIndex = face[ faceIndices[ j ] ];
                face.vertexColors[ j ] = geo.colors[ vertexIndex ];
            }
        }

        geo.computeFaceNormals();
        geo.computeVertexNormals(false);
    }

    var mesh;
    if(bHighlight === 2) {
      mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.5, specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

      this.mdl.add(mesh);
    }
    else if(bHighlight === 1) {
      mesh = new THREE.Mesh(geo, this.matShader);
      mesh.renderOrder = this.renderOrderPicking;
      //this.mdlPicking.add(mesh);
      this.mdl.add(mesh);
    }
    else {
      mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ specular: this.frac, shininess: 30, emissive: 0x000000, vertexColors: THREE.FaceColors, side: THREE.DoubleSide }));

      this.mdl.add(mesh);
    }

    if(bHighlight === 1 || bHighlight === 2) {
        this.prevHighlightObjects.push(mesh);
    }
    else {
        this.objects.push(mesh);
    }
};

iCn3D.prototype.getAtomFromResi = function (resid, atomName) { var me = this, ic = me.icn3d; "use strict";
    if(this.residues.hasOwnProperty(resid)) {
        for(var i in this.residues[resid]) {
            if(this.atoms[i].name === atomName && !this.atoms[i].het) {
                return this.atoms[i];
            }
        }
    }

    return undefined;
};

iCn3D.prototype.getAtomCoordFromResi = function (resid, atomName) { var me = this, ic = me.icn3d; "use strict";
    var atom = this.getAtomFromResi(resid, atomName);
    if(atom !== undefined) {
        var coord = (atom.coord2 !== undefined) ? atom.coord2 : atom.coord;

        return coord;
    }

    return undefined;
};

iCn3D.prototype.getRadius = function (radius, atom) { var me = this, ic = me.icn3d; "use strict";
    var radiusFinal = radius;
    if(radius) {
        radiusFinal = radius;
    }
    else {
        if(atom.b > 0 && atom.b <= 100) {
            radiusFinal = atom.b * 0.01;
        }
        else if(atom.b > 100) {
            radiusFinal = 100 * 0.01;
        }
        else {
            radiusFinal = this.coilWidth;
        }
    }

    return radiusFinal;
};
