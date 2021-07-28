// from Thomas Madej at NCBI
/* A routine to return the superposition rmsd for 'n' pairs of corresponding
 * points.  It also returns the translation vectors and rotation matrix.
 *
 * Based on the appendix in the paper:
 *
 *  A.D. McLachlan, "Gene Duplications in the Structural Evolution of
 *  Chymotrypsin", J. Mol. Biol. 128 (1979) 49-79.
 */

//import * as THREE from 'three';

class RmsdSuprCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    getRmsdSuprCls(co1, co2, n) { let me = this.icn3dui;
    //    let TINY0 = 1.0e-10;
        let supr;
        let rot = new Array(9);

        let i, k, flag;
        //double cp[3], cq[3];
        let cp = new THREE.Vector3(), cq = new THREE.Vector3();

        let da, ra, rb, dU, d1, d2, d3, e, s, v, over_n;
        //double ap[MAX_RES][3], bp[MAX_RES][3], mat[9];
        let ap = [], bp = [];
    //    let mat = new Array(9);

        //double h1[3], h2[3], h3[3], k1[3], k2[3], k3[3];
        let h1 = new Array(3), h2 = new Array(3), h3 = new Array(3), k1 = new Array(3), k2 = new Array(3), k3 = new Array(3);

        supr = 0.0;

        if (n <= 1) return {'rot': undefined, 'trans1': undefined, 'trans2': undefined, 'rmsd': 999};

        // read in and reformat the coordinates
        // calculate the centroids
        for (i = 0; i < n; i++) {
            ap.push(co1[i].clone());
            bp.push(co2[i].clone());

            cp.add(co1[i]);
            cq.add(co2[i]);
        }

        cp.multiplyScalar(1.0 / n);
        cq.multiplyScalar(1.0 / n);

        // save the translation vectors
        let xc1 = cp;
        let xc2 = cq;

        // translate coordinates
        for (i = 0; i < n; i++) {
            ap[i].sub(cp);
            bp[i].sub(cq);
        }

        // radii of gyration
        for (i = 0, ra = rb = 0.0; i < n; i++) {
            ra += ap[i].x*ap[i].x + ap[i].y*ap[i].y + ap[i].z*ap[i].z;
            rb += bp[i].x*bp[i].x + bp[i].y*bp[i].y + bp[i].z*bp[i].z;
        }

        ra /= n;
        rb /= n;

        let u = new Array(9); //var u00, u01, u02, u10, u11, u12, u20, u21, u22;

        // correlation matrix U
        for (i = 0; i < 9; ++i) {
            u[i] = 0;
        }

        for (i = 0; i < n; i++) {
            u[0] += ap[i].x*bp[i].x;
            u[1] += ap[i].x*bp[i].y;
            u[2] += ap[i].x*bp[i].z;
            u[3] += ap[i].y*bp[i].x;
            u[4] += ap[i].y*bp[i].y;
            u[5] += ap[i].y*bp[i].z;
            u[6] += ap[i].z*bp[i].x;
            u[7] += ap[i].z*bp[i].y;
            u[8] += ap[i].z*bp[i].z;
        }

        for (i = 0; i < 9; ++i) {
            u[i] /= n;
        }

        let eigenRet = me.rmsdSuprCls.getEigenVectors(u);
        k = eigenRet.k;
        h1 = eigenRet.h1;
        h2 = eigenRet.h2;
        h3 = eigenRet.h3;

        k1 = eigenRet.k1;
        k2 = eigenRet.k2;
        k3 = eigenRet.k3;

        d1 = eigenRet.d1;
        d2 = eigenRet.d2;
        d3 = eigenRet.d3;

        flag = eigenRet.flag;

        s = eigenRet.s;

        if (k != 1) {
            supr = 100.0;
            rot[0] = 1.0; rot[1] = 0.0; rot[2] = 0.0;
            rot[3] = 0.0; rot[4] = 1.0; rot[5] = 0.0;
            rot[6] = 0.0; rot[7] = 0.0; rot[8] = 1.0;
            return {'rot': rot, 'trans1': xc1, 'trans2': xc2, 'rmsd': supr};
        }

        if (flag == 1) {
            // compute the k-vectors via the h-vectors
            k1[0] = u[0]*h1[0] + u[3]*h1[1] + u[6]*h1[2];
            k1[1] = u[1]*h1[0] + u[4]*h1[1] + u[7]*h1[2];
            k1[2] = u[2]*h1[0] + u[5]*h1[1] + u[8]*h1[2];
            da = Math.sqrt(d1);
            k1[0] /= da;
            k1[1] /= da;
            k1[2] /= da;
            k2[0] = u[0]*h2[0] + u[3]*h2[1] + u[6]*h2[2];
            k2[1] = u[1]*h2[0] + u[4]*h2[1] + u[7]*h2[2];
            k2[2] = u[2]*h2[0] + u[5]*h2[1] + u[8]*h2[2];
            da = Math.sqrt(d2);
            k2[0] /= da;
            k2[1] /= da;
            k2[2] /= da;
            k3[0] = u[0]*h3[0] + u[3]*h3[1] + u[6]*h3[2];
            k3[1] = u[1]*h3[0] + u[4]*h3[1] + u[7]*h3[2];
            k3[2] = u[2]*h3[0] + u[5]*h3[1] + u[8]*h3[2];
            da = Math.sqrt(d3);
            k3[0] /= da;
            k3[1] /= da;
            k3[2] /= da;
        }
        else if (flag == 2) {
            // compute the h-vectors via the k-vectors
            h1[0] = u[0]*k1[0] + u[1]*k1[1] + u[2]*k1[2];
            h1[1] = u[3]*k1[0] + u[4]*k1[1] + u[5]*k1[2];
            h1[2] = u[6]*k1[0] + u[7]*k1[1] + u[8]*k1[2];
            da = Math.sqrt(d1);
            h1[0] /= da;
            h1[1] /= da;
            h1[2] /= da;
            h2[0] = u[0]*k2[0] + u[1]*k2[1] + u[2]*k2[2];
            h2[1] = u[3]*k2[0] + u[4]*k2[1] + u[5]*k2[2];
            h2[2] = u[6]*k2[0] + u[7]*k2[1] + u[8]*k2[2];
            da = Math.sqrt(d2);
            h2[0] /= da;
            h2[1] /= da;
            h2[2] /= da;
            h3[0] = u[0]*k3[0] + u[1]*k3[1] + u[2]*k3[2];
            h3[1] = u[3]*k3[0] + u[4]*k3[1] + u[5]*k3[2];
            h3[2] = u[6]*k3[0] + u[7]*k3[1] + u[8]*k3[2];
            da = Math.sqrt(d3);
            h3[0] /= da;
            h3[1] /= da;
            h3[2] /= da;
        }

        if (s > 0.0) {
            rot[0] = (k1[0]*h1[0] + k2[0]*h2[0] + k3[0]*h3[0]);
            rot[1] = (k1[0]*h1[1] + k2[0]*h2[1] + k3[0]*h3[1]);
            rot[2] = (k1[0]*h1[2] + k2[0]*h2[2] + k3[0]*h3[2]);
            rot[3] = (k1[1]*h1[0] + k2[1]*h2[0] + k3[1]*h3[0]);
            rot[4] = (k1[1]*h1[1] + k2[1]*h2[1] + k3[1]*h3[1]);
            rot[5] = (k1[1]*h1[2] + k2[1]*h2[2] + k3[1]*h3[2]);
            rot[6] = (k1[2]*h1[0] + k2[2]*h2[0] + k3[2]*h3[0]);
            rot[7] = (k1[2]*h1[1] + k2[2]*h2[1] + k3[2]*h3[1]);
            rot[8] = (k1[2]*h1[2] + k2[2]*h2[2] + k3[2]*h3[2]);
        }
        else {
            rot[0] = (k1[0]*h1[0] + k2[0]*h2[0] - k3[0]*h3[0]);
            rot[1] = (k1[0]*h1[1] + k2[0]*h2[1] - k3[0]*h3[1]);
            rot[2] = (k1[0]*h1[2] + k2[0]*h2[2] - k3[0]*h3[2]);
            rot[3] = (k1[1]*h1[0] + k2[1]*h2[0] - k3[1]*h3[0]);
            rot[4] = (k1[1]*h1[1] + k2[1]*h2[1] - k3[1]*h3[1]);
            rot[5] = (k1[1]*h1[2] + k2[1]*h2[2] - k3[1]*h3[2]);
            rot[6] = (k1[2]*h1[0] + k2[2]*h2[0] - k3[2]*h3[0]);
            rot[7] = (k1[2]*h1[1] + k2[2]*h2[1] - k3[2]*h3[1]);
            rot[8] = (k1[2]*h1[2] + k2[2]*h2[2] - k3[2]*h3[2]);
        }

        // optimal rotation correction via eigenvalues
        d1 = Math.sqrt(d1);
        d2 = Math.sqrt(d2);
        d3 = Math.sqrt(d3);
        v = d1 + d2 + s*d3;
        e = ra + rb - 2.0*v;

        if (e > 0.0) {
            supr = Math.sqrt(e);
        }
        else {
            supr = undefined;
        }

        return {'rot': rot, 'trans1': xc1, 'trans2': xc2, 'rmsd': supr};

    }; // end rmsd_supr


    eigen_values(a0) { let me = this.icn3dui;
        let v00, v01, v02, v10, v11, v12, v20, v21, v22;
        let a, b, c, p, q, t, u, v, d1, d2, d3;

        // initialization
        v00 = a0[0]; v01 = a0[1]; v02 = a0[2];
        v10 = a0[3]; v11 = a0[4]; v12 = a0[5];
        v20 = a0[6]; v21 = a0[7]; v22 = a0[8];

        // coefficients of the characteristic polynomial for V
        // det(xI - V) = x^3 + a*x^2 + b*x + c
        a = -(v00 + v11 + v22);
        b = v00*v11 + (v00 + v11)*v22 - v12*v21 - v01*v10 - v02*v20;
        c = -v00*v11*v22 + v00*v12*v21 + v01*v10*v22 - v01*v12*v20 - v02*v10*v21
            + v02*v11*v20;

        // transformed polynomial: x = y - a/3, poly(y) = y^3 + p*y + q
        p = -a*a/3.0 + b;
        q = a*a*a/13.5 - a*b/3.0 + c;

        // solutions y = u + v
        t = 0.25*q*q + p*p*p/27.0;

        if (t < 0.0) {
            let r, theta;

            // things are a bit more complicated
            r = Math.sqrt(0.25*q*q - t);
            theta = Math.acos(-0.5*q/r);
            d1 = 2.0*Math.cbrt(r)*Math.cos(theta/3.0);
        }
        else {
            u = Math.cbrt(-0.5*q + Math.sqrt(t));
            v = Math.cbrt(-0.5*q - Math.sqrt(t));
            d1 = u + v;
        }

        // return to the original characteristic polynomial
        d1 -= a/3.0;
        a += d1;
        c /= -d1;

        // solve the quadratic x^2 + a*x + c = 0
        d2 = 0.5*(-a + Math.sqrt(a*a - 4.0*c));
        d3 = 0.5*(-a - Math.sqrt(a*a - 4.0*c));

        // order the eigenvalues: d1 >= d2 >= d3
        if (d2 < d3) {
            t = d3;
            d3 = d2;
            d2 = d3;
        }

        if (d1 < d2) {
            t = d2;
            d2 = d1;
            d1 = t;
        }

        if (d2 < d3) {
            t = d3;
            d3 = d2;
            d2 = d3;
        }

        return {'d1': d1, 'd2': d2, 'd3': d3};
    }; // end eigen_values

    // Return the basis for the null space of the input matrix.
    null_basis(a0, v1, v2, v3, epsi) { let me = this.icn3dui;
        let k, k0, spec;
        let a11, a12, a13, a21, a22, a23, a31, a32, a33;
        let b22, b23, b32, b33;
        let q, t, mx0;

        // initialization
        a11 = a0[0]; a12 = a0[1]; a13 = a0[2];
        a21 = a0[3]; a22 = a0[4]; a23 = a0[5];
        a31 = a0[6]; a32 = a0[7]; a33 = a0[8];

        // scale the matrix, so find the max entry
        mx0 = Math.abs(a11);
        if (Math.abs(a12) > mx0) mx0 = Math.abs(a12);
        if (Math.abs(a13) > mx0) mx0 = Math.abs(a13);
        if (Math.abs(a21) > mx0) mx0 = Math.abs(a21);
        if (Math.abs(a22) > mx0) mx0 = Math.abs(a22);
        if (Math.abs(a23) > mx0) mx0 = Math.abs(a23);
        if (Math.abs(a31) > mx0) mx0 = Math.abs(a31);
        if (Math.abs(a32) > mx0) mx0 = Math.abs(a32);
        if (Math.abs(a33) > mx0) mx0 = Math.abs(a33);

        if (mx0 < 1.0e-10) {
            // interpret this as the matrix of all 0's
            k0 = 3;
            return {'k': k0, 'v1': v1, 'v2': v2, 'v3': v3};
        }

        spec = 0;
        a11 /= mx0; a12 /= mx0; a13 /= mx0;
        a21 /= mx0; a22 /= mx0; a23 /= mx0;
        a31 /= mx0; a32 /= mx0; a33 /= mx0;

        if ((Math.abs(a11) < epsi) && (Math.abs(a21) < epsi) && (Math.abs(a31) < epsi)) {
            // let x1 is independent
            k = 1;
            v1[0] = 1.0; v1[1] = 0.0; v1[2] = 0.0;

            if ((Math.abs(a12) < epsi) && (Math.abs(a22) < epsi) && (Math.abs(a32) < epsi)) {
                // let x2 is independent
                k = 2;
                v2[0] = 0.0; v2[1] = 1.0; v2[2] = 0.0;

                if ((Math.abs(a13) < epsi) && (Math.abs(a23) < epsi) && (Math.abs(a33) < epsi)) {
                    // let x3 is independent
                    k = 3;
                    v3[0] = 0.0; v3[1] = 0.0; v3[2] = 1.0;
                }

                // else, we must have x3 = 0.0, so we're done
            }
            else {
                // reorder so that a12 is maximized
                mx0 = Math.abs(a12);

                if (Math.abs(a22) > mx0) {
                    // swap rows 1 and 2
                    t = a11; a11 = a21; a21 = t;
                    t = a12; a12 = a22; a22 = t;
                    t = a13; a13 = a23; a23 = t;
                    mx0 = Math.abs(a12);
                }

                if (Math.abs(a32) > mx0) {
                    // swap rows 1 and 3
                    t = a11; a11 = a31; a31 = t;
                    t = a12; a12 = a32; a32 = t;
                    t = a13; a13 = a33; a33 = t;
                }

                // let x2 is dependent, x2 = -a13/a12*x3
                b32 = a23 - a22*a13/a12;
                b33 = a33 - a32*a13/a12;

                if ((Math.abs(b32) < epsi) && (Math.abs(b33) < epsi)) {
                    //* let x3 is independent
                    k = 2;
                    v2[0] = 0.0; v2[1] = -a13/a12; v2[2] = 1.0;
                    spec = 1;
                }

                // else, we must have x3 = x2 = 0.0, so we're done
            }
        }
        else {
            // reorder so that a11 is maximized
            mx0 = Math.abs(a11);

            if (Math.abs(a12) > mx0) {
                // swap rows 1 and 2
                t = a11; a11 = a21; a21 = t;
                t = a12; a12 = a22; a22 = t;
                t = a13; a13 = a23; a23 = t;
                mx0 = Math.abs(a11);
            }

            if (Math.abs(a13) > mx0) {
                // swap rows 1 and 3
                t = a11; a11 = a31; a31 = t;
                t = a12; a12 = a32; a32 = t;
                t = a13; a13 = a33; a33 = t;
            }

            // let x1 is dependent, x1 = -a12/a11*x2 - a13/a11*x3
            b22 = a22 - a21*a12/a11;
            b23 = a23 - a21*a13/a11;
            b32 = a32 - a31*a12/a11;
            b33 = a33 - a31*a13/a11;

            if ((Math.abs(b22) < epsi) && (Math.abs(b32) < epsi)) {
                // let x2 is independent
                k = 1;
                v1[0] = -a12/a11; v1[1] = 1.0; v1[2] = 0.0;

                if ((Math.abs(b23) < epsi) && (Math.abs(b33) < epsi)) {
                    // let x3 is independent
                    k = 2;
                    v2[0] = -a13/a11; v2[1] = 0.0; v2[2] = 1.0;
                    spec = 2;
                }

                // else, we must have x3 = 0.0, so we're done
            }
            else {
                // reorder so that b22 is maximized
                if (Math.abs(b22) < Math.abs(b32)) {
                    t = b22; b22 = b32; b32 = t;
                    t = b23; b23 = b33; b33 = t;
                }

                // let x2 is dependent, x2 = -b23/b22*x3
                if (Math.abs(b33 - b23*b32/b22) < epsi) {
                    // let x3 is independent
                    k = 1;
                    v1[0] = (a12/a11)*(b23/b22) - a13/a11;
                    v1[1] = -b23/b22; v1[2] = 1.0;
                    spec = 3;
                }
                else {
                    // the null space contains only the zero vector
                    k0 = 0;
                    v1[0] = 0.0; v1[1] = 0.0; v1[2] = 0.0;
                    //return;
                    return {'k': k0, 'v1': v1, 'v2': v2, 'v3': v3};
                }
            }
        }

        k0 = k;

        if (spec > 0) {
            // special cases, basis should be orthogonalized
            if (spec == 1) {
                // 2nd vector must be normalized
                a11 = v2[0]; a12 = v2[1]; a13 = v2[2];
                t = Math.sqrt(a11*a11 + a12*a12 + a13*a13);
                v2[0] = a11/t; v2[1] = a12/t; v2[2] = a13/t;
            }
            else if (spec == 2) {
                // 1st, 2nd vectors must be orthogonalized
                a11 = v1[0]; a12 = v1[1]; a13 = v1[2];
                a21 = v2[0]; a22 = v2[1]; a23 = v2[2];
                t = a11*a21 + a12*a22 + a13*a23;

                if (Math.abs(t) >= epsi) {
                    q = -(a11*a11 + a12*a12 + a13*a13)/t;
                    v2[0] = a11 + t*a21;
                    v2[1] = a12 + t*a22;
                    v2[2] = a13 + t*a23;
                    a21 = v2[0]; a22 = v2[1]; a23 = v2[2];
                }

                // normalize the vectors
                t = Math.sqrt(a11*a11 + a12*a12 + a13*a13);
                v1[0] = a11/t; v1[1] = a12/t; v1[2] = a13/t;
                t = Math.sqrt(a21*a21 + a22*a22 + a23*a23);
                v2[0] = a21/t; v2[1] = a22/t; v2[2] = a23/t;
            }
            else {
                // 1st vector must be normalized
                a11 = v1[0]; a12 = v1[1]; a13 = v1[2];
                t = Math.sqrt(a11*a11 + a12*a12 + a13*a13);
                v1[0] = a11/t; v1[1] = a12/t; v1[2] = a13/t;
            }
        }

        return {'k': k0, 'v1': v1, 'v2': v2, 'v3': v3};
    }; // end null_basis


    getEigenForSelection(coord, n) { let me = this.icn3dui;
        let i;
        let cp = new THREE.Vector3();
        let ap = [];

        // read in and reformat the coordinates
        // calculate the centroids
        for (i = 0; i < n; i++) {
            ap.push(coord[i]);

            cp.add(coord[i]);
        }

        cp.multiplyScalar(1.0 / n);

        // translate coordinates
        for (i = 0; i < n; i++) {
            ap[i].sub(cp);
        }

        let u = new Array(9); //var u00, u01, u02, u10, u11, u12, u20, u21, u22;

        for (i = 0; i < 9; ++i) {
            u[i] = 0;
        }

        // http://individual.utoronto.ca/rav/Web/FR/cov.htm
        // https://builtin.com/data-science/step-step-explanation-principal-component-analysis
        for (i = 0; i < n; i++) {
            u[0] += ap[i].x*ap[i].x;
            u[1] += ap[i].x*ap[i].y;
            u[2] += ap[i].x*ap[i].z;
            u[3] += ap[i].y*ap[i].x;
            u[4] += ap[i].y*ap[i].y;
            u[5] += ap[i].y*ap[i].z;
            u[6] += ap[i].z*ap[i].x;
            u[7] += ap[i].z*ap[i].y;
            u[8] += ap[i].z*ap[i].z;
        }

        for (i = 0; i < 9; ++i) {
            u[i] /= n;
        }

        return me.rmsdSuprCls.getEigenVectors(u);
    };

    getEigenVectors(u, bJustPc1) { let me = this.icn3dui;
    //    let TINY0 = 1.0e-10;
        let TINY0 = 1.0e-8;
        let k, flag;
        let mat = new Array(9);

        let h1 = new Array(3), h2 = new Array(3), h3 = new Array(3), k1 = new Array(3), k2 = new Array(3), k3 = new Array(3);

        let da, ra, rb, dU, d1, d2, d3, e, s, v, over_n;

        // determinant of U
        dU = u[0]*(u[4]*u[8] - u[5]*u[7]);
        dU -= u[1]*(u[3]*u[8] - u[5]*u[6]);
        dU += u[2]*(u[3]*u[7] - u[4]*u[6]);
        s = (dU < 0.0) ? -1.0 : 1.0;

        let v1 = new Array(3), v2 = new Array(3);
        for(let i = 0; i < 3; ++i) {
            v1[i] = new THREE.Vector3();
            v2[i] = new THREE.Vector3();
        }

        // compute V = UU' (it is symmetric)
        v1[0].x = u[0]*u[0] + u[1]*u[1] + u[2]*u[2];
        v1[0].y = u[0]*u[3] + u[1]*u[4] + u[2]*u[5];
        v1[0].z = u[0]*u[6] + u[1]*u[7] + u[2]*u[8];
        v1[1].x = v1[0].y;
        v1[1].y = u[3]*u[3] + u[4]*u[4] + u[5]*u[5];
        v1[1].z = u[3]*u[6] + u[4]*u[7] + u[5]*u[8];
        v1[2].x = v1[0].z;
        v1[2].y = v1[1].z;
        v1[2].z = u[6]*u[6] + u[7]*u[7] + u[8]*u[8];

        // also compute V = U'U, as it may be needed
        v2[0].x = u[0]*u[0] + u[3]*u[3] + u[6]*u[6];
        v2[0].y = u[0]*u[1] + u[3]*u[4] + u[6]*u[7];
        v2[0].z = u[0]*u[2] + u[3]*u[5] + u[6]*u[8];
        v2[1].x = v2[0].y;
        v2[1].y = u[1]*u[1] + u[4]*u[4] + u[7]*u[7];
        v2[1].z = u[1]*u[2] + u[4]*u[5] + u[7]*u[8];
        v2[2].x = v2[0].z;
        v2[2].y = v2[1].z;
        v2[2].z = u[2]*u[2] + u[5]*u[5] + u[8]*u[8];

        // compute the eigenvalues
        mat[0] = v1[0].x; mat[1] = v1[0].y; mat[2] = v1[0].z;
        mat[3] = v1[1].x; mat[4] = v1[1].y; mat[5] = v1[1].z;
        mat[6] = v1[2].x; mat[7] = v1[2].y; mat[8] = v1[2].z;

        let eigen = me.rmsdSuprCls.eigen_values(mat);

        d1 = eigen.d1;
        d2 = eigen.d2;
        d3 = eigen.d3;

        // now we need the eigenvectors
        flag = 1;
        mat[0] -= d1;
        mat[4] -= d1;
        mat[8] -= d1;
        let basis = me.rmsdSuprCls.null_basis(mat, h1, h2, h3, TINY0);
        k = basis.k;
        h1 = basis.v1;
        h2 = basis.v2;
        h3 = basis.v3;

        if(bJustPc1) return {"k": k, "h1": h1, "h2": h2, "h3": h3, "k1": k1, "k2": k2, "k3": k3, "d1": d1, "d2": d2, "d3": d3, "flag": flag, "s": s};

        if (k == 1) {
            mat[0] += d1 - d2;
            mat[4] += d1 - d2;
            mat[8] += d1 - d2;
            basis = me.rmsdSuprCls.null_basis(mat, h2, h3, h1, TINY0);
            k = basis.k;
            h2 = basis.v1;
            h3 = basis.v2;
            h1 = basis.v3;

            if (k == 1) {
                mat[0] += d2 - d3;
                mat[4] += d2 - d3;
                mat[8] += d2 - d3;
                basis = me.rmsdSuprCls.null_basis(mat, h3, h1, h2, TINY0);
                k = basis.k;
                h3 = basis.v1;
                h1 = basis.v2;
                h2 = basis.v3;
            }
        }

        if (k != 1) {
            // retry the computation, but using V = U'U
            mat[0] = v2[0].x; mat[1] = v2[0].y; mat[2] = v2[0].z;
            mat[3] = v2[1].x; mat[4] = v2[1].y; mat[5] = v2[1].z;
            mat[6] = v2[2].x; mat[7] = v2[2].y; mat[8] = v2[2].z;

            // now we need the eigenvectors
            flag = 2;
            mat[0] -= d1;
            mat[4] -= d1;
            mat[8] -= d1;
            basis = me.rmsdSuprCls.null_basis(mat, k1, k2, k3, TINY0);
            k = basis.k;
            k1 = basis.v1;
            k2 = basis.v2;
            k3 = basis.v3;

            if (k == 1) {
                mat[0] += d1 - d2;
                mat[4] += d1 - d2;
                mat[8] += d1 - d2;
                basis = me.rmsdSuprCls.null_basis(mat, k2, k3, k1, TINY0);
                k = basis.k;
                k2 = basis.v1;
                k3 = basis.v2;
                k1 = basis.v3;

                if (k == 1) {
                    mat[0] += d2 - d3;
                    mat[4] += d2 - d3;
                    mat[8] += d2 - d3;
                    basis = me.rmsdSuprCls.null_basis(mat, k3, k1, k2, TINY0);
                    k = basis.k;
                    k3 = basis.v1;
                    k1 = basis.v2;
                    k2 = basis.v3;
                }
            }
        }

        return {"k": k, "h1": h1, "h2": h2, "h3": h3, "k1": k1, "k2": k2, "k3": k3, "d1": d1, "d2": d2, "d3": d3, "flag": flag, "s": s};
    }
}

export {RmsdSuprCls}
