/*
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 * Modified from Tom Madej's C++ code
*/

//import * as THREE from 'three';

class Domain3d {
    constructor(icn3d) {
		this.icn3d = icn3d;

        this.dcut = 8; // threshold for C-alpha interactions

		this.MAX_SSE = 512;

        //let this.ctc_cnt[this.MAX_SSE][this.MAX_SSE];		// contact count matrix
        this.ctc_cnt = [];
        for(let i = 0; i < this.MAX_SSE; ++i) {
            this.ctc_cnt[i] = [];
        }

        //let this.elt_size[this.MAX_SSE];			// element sizes in residues
        this.elt_size = [];
        this.elt_size.length = this.MAX_SSE;

        //let this.group_num[this.MAX_SSE];			// indicates required element groupings
        this.group_num = [];
        this.group_num.length = this.MAX_SSE;

        this.split_ratio = 0.0;			//let // splitting ratio
        this.min_size = 0;				// min required size of a domain
        this.min_sse = 0;				// min number of SSEs required in a domain
        this.max_csz = 0;				// max size of a cut, i.e. number of points
        this.mean_cts = 0.0;				// mean number of contacts in a domain
        this.c_delta = 0;				// cut set parameter
        this.nc_fact = 0.0;				// size factor for internal contacts
        //let this.elements[2*this.MAX_SSE];			// sets of this.elements to be split
        this.elements = [];
        this.elements.length = 2*this.MAX_SSE;

        //let this.stack[this.MAX_SSE];			// this.stack of sets (subdomains) to split
        this.stack = [];
        this.stack.length = this.MAX_SSE;

        this.top = 0;					// this.top of this.stack
        //let this.curr_prt0[this.MAX_SSE];			// current part 0 this.elements
        this.curr_prt0 = [];
        this.curr_prt0.length = this.MAX_SSE;

        //let this.curr_prt1[this.MAX_SSE];			// current part 1 this.elements
        this.curr_prt1 = [];
        this.curr_prt1.length = this.MAX_SSE;

        this.curr_ne0 = 0;				// no. of this.elements in current part 0
        this.curr_ne1 = 0;				// no. of this.elements in current part 1
        this.curr_ratio = 0.0;			// current splitting ratio
        this.curr_msize = 0;				// min of current part sizes
        //let this.parts[2*this.MAX_SSE];			// final partition into domains
        this.parts = [];
        this.parts.length = 2*this.MAX_SSE;

        this.np = 0;					// next free location in this.parts[]
        this.n_doms = 0;				// number of domains
        //let this.save_ratios[this.MAX_SSE];		// this.saved splitting ratios
        this.save_ratios = [];
        this.save_ratios.length = this.MAX_SSE;

        this.saved = 0;				// number of this.saved ratios
	}

	// Partition the set of this.elements on this.top of the this.stack based on the input cut.
	// If the partition is valid and the ratio is smaller than the current one, then
	// save it as the best partition so far encountered.  Various criteria are
	// employed for valid partitions, as described below.
	//

	//update_partition(int* cut, let k, let n) { let ic = this.icn3d, me = ic.icn3dui;
	update_partition(cut, k, n) { let ic = this.icn3d, me = ic.icn3dui;
		let i, il, j, t, nc0, nc1, ncx, ne, ne0, ne1, elts = [], prt = []; //int
		let size0, size1, prt0 = [], prt1 = []; // int
        prt0.length = this.MAX_SSE;
        prt1.length = this.MAX_SSE;
		let f, r0; //let

		// this.elements from the this.top of the this.stack 
		//elts = &this.elements[this.stack[this.top - 1]];
		for(i = this.stack[this.top - 1], il = this.elements.length; i < il; ++i) {
			elts.push(this.elements[i]);
		}

		// generate the partition based on the cut //
		for (i = ne = ne0 = ne1 = 0, prt = prt0, t = -1; i < k; i++) {
			// write the this.elements into prt //
			for (j = t + 1; j <= cut[i]; j++)
				prt[ne++] = elts[j];

			t = cut[i];

			// switch the partition //
			if (prt == prt0) {
				ne0 = ne;
				prt = prt1;
				ne = ne1;
			}
			else {
				ne1 = ne;
				prt = prt0;
				ne = ne0;
			}
		}

		// finish with the last part //
		for (j = t + 1; j < n; j++)
			prt[ne++] = elts[j];

		if (prt == prt0)
			ne0 = ne;
		else
			ne1 = ne;

		// don't split into two teeny this.parts! //
		if ((ne0 < this.min_sse) && (ne1 < this.min_sse))
			return cut;

		// check to see if the partition splits any required groups //
		for (i = 0; i < ne0; i++) {
			t = this.group_num[prt0[i]];

			for (j = 0; j < ne1; j++) {
				if (t == this.group_num[prt1[j]])
					return cut;
			}
		}

		// compute the sizes of the this.parts //
		for (i = size0 = 0; i < ne0; i++)
			size0 += this.elt_size[prt0[i]];

		for (i = size1 = 0; i < ne1; i++)
			size1 += this.elt_size[prt1[i]];

		// count internal contacts for part 0 //
		for (i = nc0 = 0; i < ne0; i++) {
			for (j = i; j < ne0; j++)
				nc0 += this.ctc_cnt[prt0[i]][prt0[j]];
		}

		// count internal contacts for part 1 //
		for (i = nc1 = 0; i < ne1; i++) {
			for (j = i; j < ne1; j++)
				nc1 += this.ctc_cnt[prt1[i]][prt1[j]];
		}

		// check globularity condition //
		if ((1.0 * nc0 / size0 < this.mean_cts) ||
			(1.0 * nc1 / size1 < this.mean_cts))
			return cut;

		// to handle non-globular pieces make sure nc0, nc1, are large enough //
		nc0 = Math.max(nc0, this.nc_fact*size0);
		nc1 = Math.max(nc1, this.nc_fact*size1);

		// count inter-part contacts //
		for (i = ncx = 0; i < ne0; i++) {
			t = prt0[i];

			for (j = 0; j < ne1; j++)
				ncx += this.ctc_cnt[t][prt1[j]];
		}

		// compute the splitting ratio //
		f = Math.min(nc0, nc1);
		r0 = 1.0 * ncx / (f + 1.0);

		if ((r0 >= this.curr_ratio + 0.01) || (r0 > this.split_ratio))
			return cut;

		// If the difference in the ratios is insignificant then take the split
		// that most evenly partitions the domain.

		if ((r0 > this.curr_ratio - 0.01) && (Math.min(size0, size1) < this.curr_msize))
				return cut;

		// if we get to here then keep this split //
		for (i = 0; i < ne0; i++)
			this.curr_prt0[i] = prt0[i];

		for (i = 0; i < ne1; i++)
			this.curr_prt1[i] = prt1[i];

		this.curr_ne0 = ne0;
		this.curr_ne1 = ne1;
		this.curr_ratio = r0;
		this.curr_msize = Math.min(size0, size1);

		return cut;

	} // end update_partition //



	// // Run through the possible cuts of size k for a set of this.elements of size n.
	//  *
	//  * To avoid small protrusions, no blocks of consecutive this.elements of length <= this.c_delta
	//  * are allowed.  An example where this is desirable is as follows.  Let's say you
	//  * have a protein with 2 subdomains, one of them an alpha-beta-alpha sandwich.  It
	//  * could then happen that one of the helices in the sandwich domain might make more
	//  * contacts with the other subdomain than with the sandwich.  The correct thing to
	//  * do is to keep the helix with the rest of the sandwich, and the "this.c_delta rule"
	//  * enforces this.
	//  //

	cut_size(k, n) { let ic = this.icn3d, me = ic.icn3dui;
		let i, j, cok, cut0 = []; //int
		cut0.length = this.MAX_SSE;

		for (i = 0; i < k; i++)
			cut0[i] = i;

		// enumerate cuts of length k //
		while (1) {
			// check block sizes in the cut //
			for (i = cok = 1; i < k; i++) {
				if (cut0[i] - cut0[i - 1] <= this.c_delta) {
					cok = 0;
					break;
				}
			}
			if (cok && (cut0[k - 1] < n - 1))
				cut0 = this.update_partition(cut0, k, n);

			// generate the next k-tuple of positions //
			for (j = k - 1; (j >= 0) && (cut0[j] == n - k + j); j--);

			if (j < 0) break;

			cut0[j]++;

			for (i = j + 1; i < k; i++)
				cut0[i] = cut0[i - 1] + 1;
		}

	} // end cut_size //



	// // Process the set of this.elements on this.top of the this.stack.  We generate cut sets in
	//  * a limited size range, generally from 1 to 5.  For each cut the induced
	//  * partition is considered and its splitting parameters computed.  The cut
	//  * that yields the smallest splitting ratio is chosen as the correct one, if
	//  * the ratio is low enough.  The subdomains are then placed on the this.stack for
	//  * further consideration.
	//  *
	//  * Subdomains with < this.min_sse SSEs are not allowed to split further, however,
	//  * it is possible to trim fewer than this.min_sse SSEs from a larger domain.  E.g.
	//  * a chain with 7 SSEs can be split into a subdomain with 5 SSEs and another
	//  * with 2 SSEs, but the one with 2 SSEs cannot be split further.
	//  *
	//  * Note that the invariant is, that this.stack[top] always points to the next free
	//  * location in this.elements[].
	//  //

	process_set() { let ic = this.icn3d, me = ic.icn3dui;
		let i, il, k, n, t, k0, elts = []; //int

		// count the this.elements //
		//elts = &this.elements[this.stack[this.top - 1]];
		for(i = this.stack[this.top - 1], il = this.elements.length; i < il; ++i) {
			elts.push(this.elements[i]);
		}

		//for (n = 0; *elts > -1; n++, elts++);
		for (n = 0; n < elts.length && elts[n] > -1; n++);

		// try various cut sizes //
		k0 = Math.min(n - 1, this.max_csz);
		this.curr_ne0 = this.curr_ne1 = 0;
		this.curr_ratio = 100.0;

		for (k = 1; k <= k0; k++)
			this.cut_size(k, n);

		// pop this.stack //
		this.top--;

		if (this.curr_ne0 == 0) {
			// no split took place, save part //
			t = this.stack[this.top];

			//for (elts = &this.elements[t]; *elts > -1; elts++)
			//	parts[np++] = *elts;

			for (i = t; i < this.elements.length && this.elements[i] > -1; i++)
				this.parts[this.np++] = this.elements[i];

			this.parts[this.np++] = -1;
			this.n_doms++;
		}
		else {
			this.save_ratios[this.saved++] = this.curr_ratio;

			if (this.curr_ne0 > this.min_sse) {
				// push on part 0 //
				t = this.stack[this.top];

				for (i = 0; i < this.curr_ne0; i++)
					this.elements[t++] = this.curr_prt0[i];

				this.elements[t++] = -1;
				this.stack[++this.top] = t;
			}
			else {
				// save part 0 //
				for (i = 0; i < this.curr_ne0; i++)
					this.parts[this.np++] = this.curr_prt0[i];

				this.parts[this.np++] = -1;
				this.n_doms++;
			}

			if (this.curr_ne1 > this.min_sse) {
				// push on part 1 //
				t = this.stack[this.top];

				for (i = 0; i < this.curr_ne1; i++)
					this.elements[t++] = this.curr_prt1[i];

				this.elements[t++] = -1;
				this.stack[++this.top] = t;
			}
			else {
				// save part 1 //
				for (i = 0; i < this.curr_ne1; i++)
					this.parts[this.np++] = this.curr_prt1[i];

				this.parts[this.np++] = -1;
				this.n_doms++;
			}
		}
	} // end process_set //



	// Main driver for chain splitting. //
	//process_all(let n) { let ic = this.icn3d, me = ic.icn3dui;
	process_all(n) { let ic = this.icn3d, me = ic.icn3dui;
		let i; //int

		// initialize the this.stack //
		this.top = 1;
		this.stack[0] = this.np = this.n_doms = 0;
		this.saved = 0;

		for (i = 0; i < n; i++)
			this.elements[i] = i;

		this.elements[n] = -1;

		// recursively split the chain into domains //
		while (this.top > 0) {
			this.process_set();
		}
	} // end process_all //

	// Output the domains.  For S we number the this.elements 1, 2, ..., n. //
	//output(let n, int* prts) { let ic = this.icn3d, me = ic.icn3dui;
	output(n) { let ic = this.icn3d, me = ic.icn3dui;
		let i, k; //int
		
		let prts = [];

		// zap the output array //
		for (i = 0; i < 2*n; i++)
			prts.push(0);

		// now write out the subdomains //
		for (i = k = 0; k < this.n_doms; i++) {
			prts[i] = this.parts[i] + 1;

			if (this.parts[i] < 0)
				k++;
		}

		return prts;
	} // end output //



	// // S-interface to the chain-splitting program.
	//  *
	//  * Explanation of parameters:
	//  *
	//  *	ne - number of secondary structure this.elements (SSEs)
	//  *	cts - contact count matrix
	//  *	elt_sz - sizes of SSEs
	//  *	grps - element group indicators
	//  *	sratio - splitting ratio
	//  *	msize - min size of a split domain
	//  *	m_sse - min number of SSEs required in a split part
	//  *	mcsz - max cut size, i.e. max number of split points
	//  *	avg_cts - mean number of internal contacts for a domain
	//  *	c_delt - cut set parameter
	//  *	ncf0 - size factor for number of internal contacts
	//  *	prts - output listing of domains
	//  *	n_saved - number of this.saved splitting ratios
	//  *	ratios - splitting ratios
	//  *	ret - success/failure indicator
	//  *	verb - flag to turn off/on splitting information
	//  //

	//new_split_chain(let ne, let sratio, let msize, let m_sse, let mcsz, let avg_cts,
	//	let c_delt, let ncf0, int* prts, int* n_saved, let* ratios) { let ic = this.icn3d, me = ic.icn3dui;
	new_split_chain(ne, sratio, msize, m_sse, mcsz, avg_cts,
		c_delt, ncf0, prts, n_saved, ratios) { let ic = this.icn3d, me = ic.icn3dui;
		let i; //int

		this.split_ratio = sratio;
		this.min_size = msize;
		this.min_sse = m_sse;
		this.max_csz = mcsz;
		this.mean_cts = avg_cts;
		this.c_delta = c_delt;
		this.nc_fact = ncf0;
		
		this.process_all(ne);
		//this.output(ne, prts);
		this.parts = this.output(ne);
		n_saved = this.saved;
		for (i = 0; i < this.saved; i++)
			ratios[i] = this.save_ratios[i];

		return n_saved;

	} // end new_split_chain //

	//
	// Actually, here is a better method that is also simple!
	//
	// If there are N atoms (residues) this algorithm should usually run in
	// time O(N^4/3), and usually even much faster!  In very unusual cases
	// it could take quadratic time.  The key idea is that atoms are not
	// infinitely compressible, i.e. only a fixed number will fit in a given
	// region of space.  So if the protein is roughly spherical, there will
	// only be O(N^1/3) atoms close to any given diameter.  Therefore, a
	// bound on the number of iterations of the inner loop is O(N^1/3).
	//
	// For an elongated protein that happens to have the x-axis normal to
	// the long axis, then it is possible for the inner loop to take time
	// O(N), in which case the whole takes O(N^2).  But this should rarely,
	// if ever, occur in practice.  It would also be possible beforehand to
	// choose the axis with the largest variance.
	//

	// typedef struct res_struct {
	// 	let rnum;
	// 	let x, y, z;
	// } ResRec;

	//list< pair< pair< int, let >, let > >
	//c2b_AlphaContacts(let n0, let* x0, let* y0, let* z0,
	//	const let incr = 4, const let dcut = 8.0) { let ic = this.icn3d, me = ic.icn3dui;
	c2b_AlphaContacts(n0, x0, y0, z0, dcut) { let ic = this.icn3d, me = ic.icn3dui;
		//if(!incr) incr = 4;
		if(!dcut) dcut = this.dcut;

		let list_cts = [], list_rr = [];

		for (let i = 0; i < n0; i++) {
			// don't include residues with missing coordinates
			//if ((x0[i] == MissingCoord) || (y0[i] == MissingCoord) || (z0[i] == MissingCoord))
			if (!x0[i]|| !y0[i] || !z0[i])
				continue;

			//ResRec rr0;
			let rr0 = {};
			rr0.rnum = i + 1;
			rr0.x = x0[i];
			rr0.y = y0[i];
			rr0.z = z0[i];
			list_rr.push(rr0);
		}
		
		list_rr.sort(function(rr1, rr2) {
				return rr1.x - rr2.x;
			});
					
		//let rrit1, rrit2, rrbeg;
		let i, j, len = list_rr.length;

		//for (rrit1 = list_rr.begin(); rrit1 != list_rr.end(); rrit1++) {
		for (i = 0; i < len; ++i) {	
			//ResRec rr1 = *rrit1;
			let rr1 = list_rr[i];
			let x1 = rr1.x;
			let y1 = rr1.y;
			let z1 = rr1.z;
			//rrbeg = rrit1;
			//rrbeg++;

			//for (rrit2 = rrbeg; rrit2 != list_rr.end(); rrit2++) {
			for (j = i + 1; j < len; ++j) {	
				//ResRec rr2 = *rrit2;
				let rr2 = list_rr[j];
				if ((rr1.rnum - rr2.rnum <= 3) && (rr2.rnum - rr1.rnum <= 3)) continue;
				let x2 = rr2.x;
				let y2 = rr2.y;
				let z2 = rr2.z;

				if (x2 > x1 + dcut)
					break;

				// x1 <= x2 <= x1 + dcut so compare
				let sum = (x1 - x2)*(x1 - x2);
				sum += (y1 - y2)*(y1 - y2);
				sum += (z1 - z2)*(z1 - z2);
				let d0 = Math.sqrt(sum);
				if (d0 > dcut) continue;
				//pair< pair< int, let >, let > lpair;
				//pair< int, let > rpair;
				let lpair = {}, rpair = {};

				if (rr1.rnum < rr2.rnum) {
					rpair.first = rr1.rnum;
					rpair.second = rr2.rnum;
				}
				else {
					rpair.first = rr2.rnum;
					rpair.second = rr1.rnum;
				}

				lpair.first = rpair;
				lpair.second = d0;
				list_cts.push(lpair);
			}
		}

		return list_cts;

	} // end c2b_AlphaContacts



	//
	// Creates a table, actually a graph, of the contacts between SSEs.
	//

	//static map< pair< int, let >, let >
	//c2b_ContactTable(vector<int>& v1, vector<int>& v2) { let ic = this.icn3d, me = ic.icn3dui;
	c2b_ContactTable(v1, v2) { let ic = this.icn3d, me = ic.icn3dui;
		let cmap = {};
		let n0 = v1.length; //unsigned int

		if (n0 != v2.length) {
			// problem!

			return cmap;
		}

		let cnt = 0;

		for (let i = 0; i < n0; i++) {
			let e1 = v1[i];
			let e2 = v2[i];
			//pair<int, int> epr;
			//let epr = {};
			//epr.first = e1;
			//epr.second = e2;
			let epr = e1 + '_' + e2;

			//if (cmap.count(epr) == 0) {
			if (!cmap[epr]) {	
				// new pair
				cnt++;
				cmap[epr] = 1;
			}
			else
				cmap[epr]++;
		}

		return cmap;

	} // end c2b_ContactTable

	
	//https://www.geeksforgeeks.org/number-groups-formed-graph-friends/
	countUtil(ss1, sheetNeighbor, existing_groups) {
		this.visited[ss1] = true;
		if(!this.groupnum2sheet[existing_groups]) this.groupnum2sheet[existing_groups] = [];
		this.groupnum2sheet[existing_groups].push(parseInt(ss1));

		for(let ss2 in sheetNeighbor[ss1]) {
			if (!this.visited[ss2]) {
				this.countUtil(ss2, sheetNeighbor, existing_groups);  
			}
		}  
	}

	//
	// Residue ranges of the Vast domains, per protein chain.
	//

	//
	// Subdomain definition rules are as follows; let m0 = minSSE:
	//
	//     1. A subdomain with <= m0 SSEs cannot be split.
	//
	//     2. A subdomain cannot be split into two this.parts, both with < m0 SSEs.
	//
	//     3. However, a subdomain can be trimmed, i.e. split into two this.parts,
	//        one with < m0 SSEs.
	//
	//c2b_NewSplitChain(string asymId, let seqLen, let* x0, let* y0, let* z0) { let ic = this.icn3d, me = ic.icn3dui;
	// x0, y0, z0: array of x,y,z coordinates of C-alpha atoms
	//c2b_NewSplitChain(chnid, dcut) { let ic = this.icn3d, me = ic.icn3dui;
	c2b_NewSplitChain(atoms, dcut) { let ic = this.icn3d, me = ic.icn3dui;
		let x0 = [], y0 = [], z0 = [];

		//substruct: array of secondary structures, each of which has the keys: From (1-based), To (1-based), Sheet (0 or 1), also add these paras: x1, y1, z1, x2, y2, z2
		let substruct = [];
		// determine residue ranges for each subdomain
		let subdomains = [];

		// sheets: array of sheets, each of which has the key: sheet_num (beta sandwich has two sheets, e.g., 0 and 1), adj_strand1 (not used), adj_strand2
		let sheets = [], sheet_num = 0;

		let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atoms);
		let residueArray = Object.keys(residueHash);
		let chnid = residueArray[0].substr(0, residueArray[0].lastIndexOf('_'));

		let substructItem = {};
		let resiOffset = 0;
		for(let i = 0; i < residueArray.length; ++i) {
			let resid = residueArray[i];

            let resi = resid.substr(resid.lastIndexOf('_') + 1);
			if(i == 0) {
				resiOffset = resi - 1;

				for(let j = 0; j < resiOffset; ++j) {
					x0.push(undefined);
					y0.push(undefined);
					z0.push(undefined);					
				}
			}

			//let resid = chnid + "_" + resi;
			let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);

			if(atom) {
				x0.push(atom.coord.x);
				y0.push(atom.coord.y);
				z0.push(atom.coord.z);
			}
			else {
				x0.push(undefined);
				y0.push(undefined);
				z0.push(undefined);
			}

			if(!atom) continue;           

			if(atom.ssend) {
				substructItem.To = parseInt(resi);
				substructItem.x2 = atom.coord.x;
				substructItem.y2 = atom.coord.y;
				substructItem.z2 = atom.coord.z;

				substructItem.Sheet = (atom.ss == 'sheet') ? true : false;
				substruct.push(substructItem);
				substructItem = {};				
			}

			// a residue could be both start and end. check ssend first, then check ssbegin 
			if(atom.ssbegin) {
				substructItem.From = parseInt(resi);
				substructItem.x1 = atom.coord.x;
				substructItem.y1 = atom.coord.y;
				substructItem.z1 = atom.coord.z;
			}
        }

		let nsse = substruct.length;

		if (nsse <= 3)
			// too small, can't split or trim
			return {subdomains: subdomains, substruct: substruct};

		if (nsse > this.MAX_SSE) {
			// we have a problem...

			return {subdomains: subdomains, substruct: substruct};
		}

		let seqLen = residueArray.length + resiOffset;

		// get a list of Calpha-Calpha contacts
		///list< pair< pair< int, let >, let > >
		let cts = this.c2b_AlphaContacts(seqLen, x0, y0, z0, dcut);

		//
		// Produce a "map" of the SSEs, i.e. vec_sse[i] = 0 means residue i + 1
		// is in a loop, and vec_sse[i] = k means residue i + 1 belongs to SSE
		// number k.
		//
		let vec_sse = []; //vector<int>

		for (let i = 0; i < seqLen; i++)
			vec_sse.push(0);
			
		let hasSheets = false;

		//substruct: array of secondary structures, each of which has the keys: From, To, Sheet (0, 1)
		for (let i = 0; i < substruct.length; i++) {
			//SSE_Rec sserec = substruct[i];
			let sserec = substruct[i];
			let From = sserec.From;
			let To = sserec.To;
			this.elt_size[i] = To - From + 1;

			// double-check indexing OK???
			for (let j = From; j <= To; j++)
				vec_sse[j - 1] = i + 1;

			//if (sserec.Sheet > 0)
			if (sserec.Sheet)
				hasSheets = true;
		}

		// produce the SSE contact lists
		let vec_cts1 = [], vec_cts2 = [], vec_cts1a = [], vec_cts2a = [], ctsit = [];

		//for (ctsit = cts.begin(); ctsit != cts.end(); ctsit++) {
		for (let i = 0, il = cts.length; i < il; ++i) {
			//pair< pair< int, let >, let > epr = *ctsit;
			//pair< int, let > respair = epr.first;
			let epr = cts[i];
			let respair = epr.first;
			let sse1 = vec_sse[respair.first - 1];
			let sse2 = vec_sse[respair.second - 1];
			// could be 0 or null
			if ((sse1 <= 0) || (sse2 <= 0) || !sse1 || !sse2) continue;
			vec_cts1.push(sse1);
			vec_cts2.push(sse2);
			if (sse1 == sse2) continue;
			vec_cts1a.push(sse1);
			vec_cts2a.push(sse2);
		}

		// this symmetrizes the contact data
		for (let i = 0; i < vec_cts1a.length; i++) {
			vec_cts1.push(vec_cts2a[i]);
			vec_cts2.push(vec_cts1a[i]);
		}

		// add dummy contacts
		for (let i = 0; i < nsse; i++) {
			vec_cts1.push(i + 1);
			vec_cts2.push(i + 1);
		}
		
		// create contact counts from the contacts/interactions
		//map< pair< int, let >, let > ctable = this.c2b_ContactTable(vec_cts1, vec_cts2);
		let ctable = this.c2b_ContactTable(vec_cts1, vec_cts2);

		// neighbor list of each sheet
		let sheetNeighbor = {};
		for(let pair in ctable) {
			let ssPair = pair.split('_'); // 1-based
			let ss1 = parseInt(ssPair[0]);
			let ss2 = parseInt(ssPair[1]);

			// both are sheets
			if(substruct[ss1 - 1].Sheet && substruct[ss2 - 1].Sheet) {
				if(!sheetNeighbor[ss1]) sheetNeighbor[ss1] = {};
				if(!sheetNeighbor[ss2]) sheetNeighbor[ss2] = {};

				sheetNeighbor[ss1][ss2] = 1;
				sheetNeighbor[ss2][ss1] = 1;
			}
		}

		//https://www.geeksforgeeks.org/number-groups-formed-graph-friends/
		let existing_groups = 0;
		let sheet2sheetnum = {};
		this.groupnum2sheet = {};
		this.visited = {};
		for (let ss1 in sheetNeighbor) {
			this.visited[ss1] = false;
		}

		// get this.groupnum2sheet
		for (let ss1 in sheetNeighbor) {
			// If not in any group.
			if (this.visited[ss1] == false) {
				existing_groups++;
				 
				this.countUtil(ss1, sheetNeighbor, existing_groups);
			}
		}

		// get sheet2sheetnum
		// each neighboring sheet willbe represented by the sheet with the smallest sse 
		for(let groupnum in this.groupnum2sheet) {
			let ssArray = this.groupnum2sheet[groupnum].sort();
			for(let i = 0, il = ssArray.length; i < il; ++i) {
				sheet2sheetnum[ssArray[i]] = ssArray[0];
			}
		}

		for (let i = 0; i < nsse; i++) {
			if(substruct[i].Sheet) {				
				let sheetsItem = {};
				if(sheet2sheetnum[i+1]) {
					sheetsItem.sheet_num = sheet2sheetnum[i+1];
					sheetsItem.adj_strand2 = 1; 
					sheetsItem.sse = i + 1; 
				}
				else {
					sheetsItem.sheet_num = 0;
					sheetsItem.adj_strand2 = 0; 
					sheetsItem.sse = i + 1; 
				}

				sheets.push(sheetsItem);
			}
		}

		//
		// Correct for dummy contacts; they're present to ensure that the
		// table gives the right result in the possible case there is an
		// element with no contacts.
		//
		for (let i = 0; i < nsse; i++) {
			for (let j = 0; j < nsse; j++) {
				//pair<int, int> epr;
				//let epr = {};
				//epr.first = i + 1;
				//epr.second = j + 1;
				let epr = (i+1).toString() + '_' + (j+1).toString();

				//if (ctable.count(epr) == 0)
				if (!ctable[epr])
					this.ctc_cnt[i][j] = 0;
				else {
					let cnt = ctable[epr];
					if (i == j) cnt--; // subtract dummy contact
					this.ctc_cnt[i][j] = cnt;
					this.ctc_cnt[j][i] = cnt;
				}
			}
		}

		let minStrand = 6;

		if (hasSheets) {
			//sheets: array of sheets, each of which has the key: sheet_num (number of strands), adj_strand1, adj_strand2

			let cnt = 0;

			for (let i = 0; i < sheets.length; i++) {
				//BetaSheet_Rec bsrec = sheets[i];
				let bsrec = sheets[i];

				//if ((bsrec.sheet_num > 0) && (this.elt_size[i] >= minStrand) && (bsrec.adj_strand2 != 0))
				if ((bsrec.sheet_num > 0) && (this.elt_size[bsrec.sse - 1] >= minStrand) && (bsrec.adj_strand2 != 0))
					cnt++;
			}

			for (let i = 0; i < nsse; i++) {
				//this.group_num[i] = (cnt == 0) ? i + 1 : 0;
				this.group_num[i] = i + 1;
			}

			if (cnt> 0) {
				for (let i = 0; i < sheets.length; i++) {
					let bsrec = sheets[i];
					this.group_num[bsrec.sse - 1] = bsrec.sheet_num;
				}
			}
		}
		else {
			for (let i = 0; i < nsse; i++)
				this.group_num[i] = i + 1;
		}

		let sratio = 0.25;
		let minSize = 25;
		let maxCsz = 4;
		let avgCts = 0.0;
		let ncFact = 0.0;
		let cDelta = 3;
		let minSSE = 3;

		// call the domain splitter
		this.parts = [];
		this.parts.length = 2*this.MAX_SSE;
		let ratios = [];
		ratios.length = this.MAX_SSE;
		let n_saved = 0;

		for (let i = 0; i < nsse; i++) {
			this.parts[2*i] = this.parts[2*i + 1] = 0;
			ratios[i] = 0.0;
		}

		n_saved = this.new_split_chain(nsse, sratio, minSize, minSSE, maxCsz, avgCts, cDelta, ncFact, this.parts, n_saved, ratios);

		// save domain data
		//list< vector< let > > list_parts;
		let list_parts = [];

		if (n_saved > 0) {
			// splits occurred...
			let j = 0;
			
			for (let i = 0; i <= n_saved; i++) {
				//vector<int> sselst;
				let sselst = [];
				//sselst.clear();

				while (j < 2*nsse) {
					let sse0 = this.parts[j++];

					if (sse0 == 0) {
						list_parts.push(sselst);
						break;
					}
					else
						sselst.push(sse0);
				}
			}
		}
		
		list_parts.sort(function(v1, v2) {
				return v1[0] - v2[0];
			});

		//for (lplet = list_parts.begin(); lplet != list_parts.end(); lpint++) {
		for (let index = 0, indexl = list_parts.length; index < indexl; ++index) {
			//vector<int> prts = *lpint;
			let prts = list_parts[index];
			//vector<int> resflags;
			//resflags.clear();
			let resflags = [];

			// a domain must have at least 3 SSEs...
			if (prts.length <= 2) continue;

			for (let i = 0; i < seqLen; i++)
				resflags.push(0);

			for (let i = 0; i < prts.length; i++) {
				let k = prts[i] - 1;

				if ((k < 0) || (k >= substruct.length)) {
					return {subdomains: subdomains, substruct: substruct};
				}

				//SSE_Rec sserec = substruct[k];
				let sserec = substruct[k];
				let From = sserec.From;
				let To = sserec.To;

				for (let j = From; j <= To; j++)
					resflags[j - 1] = 1;

				if ((k == 0) && (From > 1)) {
					// residues with negative residue numbers will not be included
					for (let j = 1; j < From; j++) {
						//resflags[j - 1] = 1;
						// include at most 10 residues
						if(From - j <= 10) {
							resflags[j - 1] = 1;
						}
					}
				}

				if ((k == substruct.length - 1) && (To < seqLen)) {
					for (let j = To + 1; j <= seqLen; j++) {
						//resflags[j - 1] = 1;
						// include at most 10 residues
						if(j - To <= 10) {
							resflags[j - 1] = 1;
						}
					}
				}

				// left side
				if (k > 0) {
					//SSE_Rec sserec1 = substruct[k - 1];
					let sserec1 = substruct[k - 1];
					let To1 = sserec1.To;
					//let ll = (int) floor(0.5*((let) (From - To1 - 1)));
					let ll = parseInt(0.5 * (From - To1 - 1));

					if (ll > 0) {
						for (let j = From - ll; j <= From - 1; j++)
							resflags[j - 1] = 1;
					}
				}

				// right side
				if (k < substruct.length - 1) {
					//SSE_Rec sserec1 = substruct[k + 1];
					let sserec1 = substruct[k + 1];
					let From1 = sserec1.From;
					//let ll = (int) ceil(0.5*((let) (From1 - To - 1)));
					// let ft = From1 - To - 1;
					// let ll = parseInt(ft/2);
					// if (ft % 2 == 1) ll++;
					let ll = parseInt(0.5 * (From1 - To - 1) + 0.5);

					if (ll > 0) {
						for (let j = To + 1; j <= To + ll; j++)
							resflags[j - 1] = 1;
					}
				}
			}

			// extract the continguous segments
			let inseg = false;
			let startseg;
			//vector<int> segments;
			//segments.clear();
			let segments = [];

			for (let i = 0; i < seqLen; i++) {
				let rf = resflags[i];

				if (!inseg && (rf == 1)) {
					// new segment starts here
					startseg = i + 1;
					inseg = true;
					continue;
				}

				if (inseg && (rf == 0)) {
					// segment ends
					segments.push(startseg);
					segments.push(i);
					inseg = false;
				}
			}

			// check for the last segment
			if (inseg) {
				segments.push(startseg);
				segments.push(seqLen);
			}

			subdomains.push(segments);
		}

		return {subdomains: subdomains, substruct: substruct};
	} // end c2b_NewSplitChain

	getDomainJsonForAlign(atoms) { let ic = this.icn3d, me = ic.icn3dui;
		let result = this.c2b_NewSplitChain(atoms);

		let subdomains = result.subdomains;
		let substruct = result.substruct;

		let residueHash = ic.firstAtomObjCls.getResiduesFromAtoms(atoms);
		let residueArray = Object.keys(residueHash);
		let chnid = residueArray[0].substr(0, residueArray[0].lastIndexOf('_'));

		//the whole structure is also considered as a large domain
		//if(subdomains.length == 0) {
			//subdomains.push([parseInt(ic.chainsSeq[chnid][0].resi), parseInt(ic.chainsSeq[chnid][ic.chainsSeq[chnid].length - 1].resi)]);
			subdomains.push([parseInt(residueArray[0].substr(residueArray[0].lastIndexOf('_') + 1)), 
			 	parseInt(residueArray[residueArray.length-1].substr(residueArray[residueArray.length-1].lastIndexOf('_') + 1))]);
		//}

		// m_domains1: {"data": [ {"ss": [[1,20,30,x,y,z,x,y,z], [2,50,60,x,y,z,x,y,z]], "domain": [[1,43,x,y,z],[2,58,x,y,z], ...]}, {"ss": [[1,20,30,x,y,z,x,y,z], [2,50,60,x,y,z,x,y,z]],"domain": [[1,43,x,y,z],[2,58,x,y,z], ...]} ] }
		let jsonStr = '{"data": [';
		for(let i = 0, il = subdomains.length; i < il; ++i) {
			if(i > 0) jsonStr += ', ';
			//secondary structure
			jsonStr += '{"ss": [';
			let ssCnt = 0;
			for(let j = 0, jl = subdomains[i].length; j < jl; j += 2) {
				let start = subdomains[i][j];
				let end = subdomains[i][j + 1];
			
				for(let k = 0, kl = substruct.length; k < kl; ++k) {
					//ss: sstype	ss_start	ss_end	x1	y1	z1	x2	y2	z2
						//sstype: 1 (helix), 2 (sheet)
					let sstype = (substruct[k].Sheet) ? 2 : 1;
					let from = substruct[k].From;
					let to = substruct[k].To;

					let residFrom = chnid + "_" + from;
					let atomFrom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residFrom]);
					if(!atomFrom || !ic.hAtoms.hasOwnProperty(atomFrom.serial)) continue;

					let residTo = chnid + "_" + to;
					let atomTo = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[residTo]);
					if(!atomTo || !ic.hAtoms.hasOwnProperty(atomTo.serial)) continue;

					if(from >= start && to <= end) {
						if(ssCnt > 0) jsonStr += ', ';
						jsonStr += '[' + sstype + ',' + from + ',' + to + ',' + substruct[k].x1.toFixed(2) + ',' + substruct[k].y1.toFixed(2) + ',' 
							+ substruct[k].z1.toFixed(2) + ',' + substruct[k].x2.toFixed(2) + ',' + substruct[k].y2.toFixed(2) + ',' + substruct[k].z2.toFixed(2) + ']';
						++ssCnt;
					}
				}				
			}
			jsonStr += ']';

			// domain
			jsonStr += ', "domain": [';
			let domainCnt = 0;
			for(let j = 0, jl = subdomains[i].length; j < jl; j += 2) {
				let start = subdomains[i][j];
				let end = subdomains[i][j + 1];

				for(let k = 0, kl = residueArray.length; k < kl; ++k) {
					let resid = residueArray[k];

					let resi = resid.substr(resid.lastIndexOf('_') + 1);
		
					//let resid = chnid + "_" + resi;
					let atom = ic.firstAtomObjCls.getFirstCalphaAtomObj(ic.residues[resid]);

					if(!atom) continue;
					if(!ic.hAtoms.hasOwnProperty(atom.serial)) continue;

					//domain: resi, restype, x, y, z
					let restype = me.parasCls.resn2restype[atom.resn];
					if(restype !== undefined && resi >= start && resi <= end) {
						if(domainCnt > 0) jsonStr += ', ';
						jsonStr += '[' + resi + ',' + restype + ',' + atom.coord.x.toFixed(2) + ',' 
							+ atom.coord.y.toFixed(2) + ',' + atom.coord.z.toFixed(2) + ']';
						++domainCnt;
					}
				}			
			}
			jsonStr += ']}';
		}
		jsonStr += ']}';

		return jsonStr;
	} 
}

export {Domain3d}
