/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

class SubdivideCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    // cubic splines for four points: http://thalestriangles.blogspot.com/2014/02/a-bit-of-ex-spline-ation.html
    // https://math.stackexchange.com/questions/577641/how-to-calculate-interpolating-splines-in-3d-space
    subdivide(_pnts, _clrs, DIV, bShowArray, bHighlight, prevone, nexttwo, bExtendLastRes) { let me = this.icn3dui;

        let ret = [];
        let pos = [];
        let color = [];

        let pnts = new Array(); // Smoothing test

        let prevoneLen = (prevone !== undefined) ? prevone.length : 0;
        let nexttwoLenOri = (nexttwo !== undefined) ? nexttwo.length : 0;

        let maxDist = 6.0;

        if(prevoneLen > 0
            && Math.abs(prevone[0].x - _pnts[0].x) <= maxDist
            && Math.abs(prevone[0].y - _pnts[0].y) <= maxDist
            && Math.abs(prevone[0].z - _pnts[0].z) <= maxDist
            ) {
          pnts.push(prevone[0]);
          prevoneLen = 1;
        }
        else {
          prevoneLen = 0;
        }

        pnts.push(_pnts[0]);
        for (let i = 1, lim = _pnts.length - 1; i < lim; ++i) {
            let p0 = _pnts[i], p1 = _pnts[i + 1];
            pnts.push(p0.smoothen ? p0.clone().add(p1).multiplyScalar(0.5) : p0);
        }
        pnts.push(_pnts[_pnts.length - 1]);

        let nexttwoLen = 0
        if(nexttwoLenOri > 0
            && Math.abs(nexttwo[0].x - _pnts[_pnts.length - 1].x) <= maxDist
            && Math.abs(nexttwo[0].y - _pnts[_pnts.length - 1].y) <= maxDist
            && Math.abs(nexttwo[0].z - _pnts[_pnts.length - 1].z) <= maxDist
            ) {
          pnts.push(nexttwo[0]);
          ++nexttwoLen;
        }

        if(nexttwoLenOri > 1
            && Math.abs(nexttwo[0].x - nexttwo[1].x) <= maxDist
            && Math.abs(nexttwo[0].y - nexttwo[1].y) <= maxDist
            && Math.abs(nexttwo[0].z - nexttwo[1].z) <= maxDist
            ) {
          pnts.push(nexttwo[1]);
          ++nexttwoLen;
        }

        let savedPoints = [];
        let savedPos = [];
        let savedColor = [];

        //var nexttwoLen = nexttwoLenOri;
        if(bExtendLastRes) {
            nexttwoLen = (nexttwoLenOri > 0) ? nexttwoLenOri - 1 : 0;
        }

        let alpha = 1, newI;

        for (let i = -1, size = pnts.length, DIVINV = 1 / DIV; i <= size - 3; ++i) {
            newI = i - prevoneLen;
            let p0 = pnts[i === -1 ? 0 : i];
            let p1 = pnts[i + 1];
            let p2 = pnts[i + 2];
            let p3 = pnts[i === size - 3 ? size - 1 : i + 3];

            let t0 = 0;
            let t1 = me.subdivideCls.getKnot(alpha, t0, p0, p1);
            let t2 = me.subdivideCls.getKnot(alpha, t1, p1, p2);
            let t3 = me.subdivideCls.getKnot(alpha, t2, p2, p3);

            if(t1 - t0 < 1e-4) t1 = t0 + 1;
            if(t2 - t1 < 1e-4) t2 = t1 + 1;
            if(t3 - t2 < 1e-4) t3 = t2 + 1;

            //if(i > -1 && bHighlight && bShowArray !== undefined && bShowArray[i + 1]) {
            if(i > -1 && (bShowArray === undefined || bShowArray[newI + 1]) ) {
                // get from previous i for the first half of residue
                if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                    ret = ret.concat(savedPoints);
                    pos = pos.concat(savedPos);
                    color = color.concat(savedColor);
                }
            }

            savedPoints = [];
            savedPos = [];
            savedColor = [];

            let step = (t2 - t1) * DIVINV;
            for (let j = 0; j < DIV; ++j) {
                let t = t1 + step * j;
                let x = me.subdivideCls.getValueFromKnot(t, t0, t1, t2, t3, p0.x, p1.x, p2.x, p3.x);
                let y = me.subdivideCls.getValueFromKnot(t, t0, t1, t2, t3, p0.y, p1.y, p2.y, p3.y);
                let z = me.subdivideCls.getValueFromKnot(t, t0, t1, t2, t3, p0.z, p1.z, p2.z, p3.z);

                if(!bShowArray) {
                    if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                        ret.push(new THREE.Vector3(x, y, z));
                        pos.push(newI + 1);
                        color.push(_clrs[newI+1]);
                    }
                }
                else {
                    if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen) {
                        if(bShowArray[newI + 1]) {
                            if(j <= parseInt((DIV) / 2) ) {
                                ret.push(new THREE.Vector3(x, y, z));
                                pos.push(bShowArray[newI + 1]);
                                color.push(_clrs[newI+1]);
                            }
                        }
                    }

                    if(i >= -1 + prevoneLen && i <= size - 3 - nexttwoLen + 1) {
                        if(bShowArray[newI + 2]) {
                            if(j > parseInt((DIV) / 2) ) {
                                savedPoints.push(new THREE.Vector3(x, y, z));
                                savedPos.push(bShowArray[newI + 2]);
                                savedColor.push(_clrs[newI+2]);
                            }
                        }
                    }
                } // end else

            } // end for (let j = 0;
        } // end for (let i = -1;

        if(!bShowArray || bShowArray[newI + 1]) {
            //if(bHighlight) {
            ret = ret.concat(savedPoints);
            pos = pos.concat(savedPos);
            color = color.concat(savedColor);
            //}

            ret.push(pnts[pnts.length - 1 - nexttwoLen]);
            pos.push(pnts.length - 1 - nexttwoLen);
            color.push(_clrs[pnts.length - 1 - nexttwoLen]);
        }

        savedPoints = [];
        savedPos = [];
        savedColor = [];
        pnts = [];

        let pnts_positions = [];

        pnts_positions.push(ret);
        pnts_positions.push(pos);
        pnts_positions.push(color);

        return pnts_positions;
    };


    getKnot(alpha, ti, Pi, Pj) { let me = this.icn3dui;
        //var alpha = 1;

        //return Math.pow(Pi.distanceTo(Pj), alpha) + ti;
        return Pi.distanceTo(Pj) + ti;
    }

    getValueFromKnot(t, t0, t1, t2, t3, y0, y1, y2, y3) { let me = this.icn3dui;
        let inf = 9999;

        // m(i) = ( t(i+1) - t(i) == 0 ) ? 0 : ( y(i+1) - y(i) ) / ( t(i+1) - t(i) )
        let m0 = (y1 - y0) / (t1 - t0);
        let m1 = (y2 - y1) / (t2 - t1);
        let m2 = (y3 - y2) / (t3 - t2);

        // L(i) = m(i) * (t - t(i)) + y(i)
        //var L0 = m0 * (t - t0) + y0;
        let L1 = m1 * (t - t1) + y1;
        //var L2 = m2 * (t - t2) + y2;

        let denom = (t1 + t2) * (t1 + t2) - 4*(t0*t1 + t2*t3 - t0*t3);
        let d0 = 0;
        let d3 = 0;
        let d1, d2;

        if(denom == 0) {
            d1 = inf;
            d2 = inf;
        }
        else {
            d1 = 6 * (3*m1*t1 + 2*m0*t3 + m2*t1 - 2*m0*t1 - 2*m1*t3 - m1*t2 - m2*t1) / denom;
            d2 = 6 * (3*m1*t2 + 2*m2*t0 + m0*t1 - 2*m1*t0 - 2*m2*t2 - m0*t2 - m1*t1) / denom;
        }

        // a(i) = ( 2*d(i) + d(i+1) ) / 6 / (t(i) - t(i+1))
        // b(i) = ( 2*d(i+1) + d(i) ) / 6 / (t(i+1) - t(i))
        //var a0 = ( 2*d0 + d1 ) / 6 / (t0 - t1);
        let a1 = ( 2*d1 + d2 ) / 6 / (t1 - t2);
        //var a2 = ( 2*d2 + d3 ) / 6 / (t2 - t3);

        //var b0 = ( 2*d1 + d0 ) / 6 / (t1 - t0);
        let b1 = ( 2*d2 + d1 ) / 6 / (t2 - t1);
        //var b2 = ( 2*d3 + d2 ) / 6 / (t3 - t2);

        // C(i) = a(i)*(t - t(i))*(t - t(i+1))*(t - t(i+1)) + b(i)*(t - t(i))*(t - t(i))*(t - t(i+1))
        //var C0 = a0*(t - t0)*(t - t1)*(t - t1) + b0*(t - t0)*(t - t0)*(t - t1);
        let C1 = a1*(t - t1)*(t - t2)*(t - t2) + b1*(t - t1)*(t - t1)*(t - t2);
        //var C2 = a2*(t - t2)*(t - t3)*(t - t3) + b2*(t - t2)*(t - t2)*(t - t3);

        let F1 = L1 + C1;

        return F1;
    }
}

export {SubdivideCls}
