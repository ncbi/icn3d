/**
 * @file Ccp4 Parser
 * @author Marcin Wojdyr <wojdyr@gmail.com>
 * @private
 * Modified by Jiyao Wang / https://github.com/ncbi/icn3d
 */

class Ccp4Parser {
      constructor(icn3d) {
          this.icn3d = icn3d;
      }

      async ccp4ParserBase(url, type, sigma, location) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        //https://stackoverflow.com/questions/33902299/using-jquery-ajax-to-download-a-binary-file
        // if(type == '2fofc' && ic.bAjax2fofcccp4) {
        //     ic.mapData.sigma2 = sigma;
        //     ic.setOptionCls.setOption('map', type);
        // }
        // else if(type == 'fofc' && ic.bAjaxfofcccp4) {
        //     ic.mapData.sigma = sigma;
        //     ic.setOptionCls.setOption('map', type);
        // }
        // else {
            let arrayBuffer = await me.getXMLHttpRqstPromise(url, 'GET', 'arraybuffer', '');
            let bInputSigma = true;
            sigma = thisClass.load_map_from_buffer(arrayBuffer, type, sigma, location, bInputSigma);

            // if(type == '2fofc') {
            //     ic.bAjax2fofcccp4 = true;
            // }
            // else if(type == 'fofc') {
            //     ic.bAjaxfofcccp4 = true;
            // }

            ic.setOptionCls.setOption('map', type);

            return sigma;
        // }
    }

    // modified from_ccp4() at https://github.com/uglymol/uglymol.github.io/blob/master/src/elmap.js
    load_map_from_buffer(buf, type, sigma, location, bInputSigma) { let ic = this.icn3d, me = ic.icn3dui;
        let expand_symmetry = true;
        if (buf.byteLength < 1024) throw Error('File shorter than 1024 bytes.');

        //console.log('buf type: ' + Object.prototype.toString.call(buf));
        // for now we assume both file and host are little endian
        const iview = new Int32Array(buf, 0, 256);
        // word 53 - character string 'MAP ' to identify file type
        if (iview[52] !== 0x2050414d) throw Error('not a CCP4 map');

        // map has 3 dimensions referred to as columns (fastest changing), rows
        // and sections (c-r-s)
        const n_crs = [iview[0], iview[1], iview[2]]; // 108, 108, 108
        const mode = iview[3]; //2
        let nb;
        if (mode === 2) nb = 4;
        else if (mode === 0) nb = 1;
        else throw Error('Only Mode 2 and Mode 0 of CCP4 map is supported.');

        const start = [iview[4], iview[5], iview[6]]; // 0,0,0
        const n_grid = [iview[7], iview[8], iview[9]]; // 108,108,108 
        const nsymbt = iview[23]; // size of extended header in bytes
                                  // nsymbt = 1920
 
        if (1024 + nsymbt + nb*n_crs[0]*n_crs[1]*n_crs[2] !== buf.byteLength) {
          throw Error('ccp4 file too short or too long');
        }

        const fview = new Float32Array(buf, 0, buf.byteLength / 4);
        const grid = new GridArray(n_grid);
        const unit_cell = new UnitCell(fview[10], fview[11], fview[12], fview[13], fview[14], fview[15]); // 79.1, 79.1, 79.1, 90, 90, 90
                                      
        // MAPC, MAPR, MAPS - axis corresp to cols, rows, sections (1,2,3 for X,Y,Z)
        const map_crs = [iview[16], iview[17], iview[18]]; // 2,1,3
        const ax = map_crs.indexOf(1);
        const ay = map_crs.indexOf(2);
        const az = map_crs.indexOf(3);
    
        const min = fview[19]; // -0.49
        const max = fview[20]; // 0.94
        //const sg_number = iview[22];
        //const lskflg = iview[24];

        if (nsymbt % 4 !== 0) {
          throw Error('CCP4 map with NSYMBT not divisible by 4 is not supported.');
        }
        let data_view;
        if (mode === 2) data_view = fview;
        else /* mode === 0 */ data_view = new Int8Array(buf);
        let idx = (1024 + nsymbt) / nb | 0; //736

        // We assume that if DMEAN and RMS from the header are not clearly wrong
        // they are what the user wants. Because the map can cover a small part
        // of the asu and its rmsd may be different than the total rmsd.
        // let stats = { mean: 0.0, rms: 1.0 };
        // stats.mean = fview[21]; //0
        // stats.rms = fview[54]; //0.15
        // if (stats.mean < min || stats.mean > max || stats.rms <= 0) {
        //   stats = this.calculate_stddev(data_view, idx);
        // }

        let b1 = 1;
        let b0 = 0;
        // if the file was converted by mapmode2to0 - scale the data
        if (mode === 0 && iview[39] === -128 && iview[40] === 127) { //39:0, 40:0
          // scaling f(x)=b1*x+b0 such that f(-128)=min and f(127)=max
          b1 = (max - min) / 255.0;
          b0 = 0.5 * (min + max + b1);
        }
    
        const end = [start[0] + n_crs[0], start[1] + n_crs[1], start[2] + n_crs[2]];
        let it = [0, 0, 0];
        let maxValue = -999;
        for (it[2] = start[2]; it[2] < end[2]; it[2]++) { // sections
          for (it[1] = start[1]; it[1] < end[1]; it[1]++) { // rows
            for (it[0] = start[0]; it[0] < end[0]; it[0]++) { // cols
              let value = b1 * data_view[idx] + b0;
              grid.set_grid_value(it[ax], it[ay], it[az], value);

              if(value > maxValue) maxValue = value;
              idx++;
            }
          }
        }
        
/*
        if (expand_symmetry && nsymbt > 0) {
          const u8view = new Uint8Array(buf);
          for (let i = 0; i+80 <= nsymbt; i += 80) {
            let j;
            let symop = '';
            for (j = 0; j < 80; ++j) {
              symop += String.fromCharCode(u8view[1024 + i + j]);
            }
            if (/^\s*x\s*,\s*y\s*,\s*z\s*$/i.test(symop)) continue;  // skip x,y,z
            //console.log('sym ops', symop.trim());
            let mat = this.parse_symop(symop);
            // Note: we apply here symops to grid points instead of coordinates.
            // In the cases we came across it is equivalent, but in general not.
            for (j = 0; j < 3; ++j) {
              mat[j][3] = Math.round(mat[j][3] * n_grid[j]) | 0;
            }
            idx = (1024 + nsymbt) / nb | 0;
            let xyz = [0, 0, 0];
            for (it[2] = start[2]; it[2] < end[2]; it[2]++) { // sections
              for (it[1] = start[1]; it[1] < end[1]; it[1]++) { // rows
                for (it[0] = start[0]; it[0] < end[0]; it[0]++) { // cols
                  for (j = 0; j < 3; ++j) {
                    xyz[j] = it[ax] * mat[j][0] + it[ay] * mat[j][1] +
                             it[az] * mat[j][2] + mat[j][3];
                  }
                  let value = b1 * data_view[idx] + b0;
                  grid.set_grid_value(xyz[0], xyz[1], xyz[2], value);

                  if(value > maxValue) maxValue = value;
                  idx++;
                }
              }
            }
          }
        }
*/

        if(!bInputSigma) {
          sigma = ic.dsn6ParserCls.setSigma(maxValue, location, type, sigma);
        }

        if(type == '2fofc') {
          ic.mapData.ccp4 = 1;
          ic.mapData.grid2 = grid;
          ic.mapData.unit_cell2 = unit_cell;
          ic.mapData.type2 = type;
          ic.mapData.sigma2 = sigma;
        }
        else {
          ic.mapData.ccp4 = 1;
          ic.mapData.grid = grid;
          ic.mapData.unit_cell = unit_cell;
          ic.mapData.type = type;
          ic.mapData.sigma = sigma;
        }

        return sigma;
    }

    load_maps_from_mtz_buffer(mtz, type, sigma, location, bInputSigma) { let ic = this.icn3d, me = ic.icn3dui;
      let is_diff = (type == 'fofc'); // diff: fofc, non-diff: 2fofc
      let dataArray = mtz.calculate_map(is_diff);

      let mc = mtz.cell;
      const unit_cell = new UnitCell(mc.a, mc.b, mc.c, mc.alpha, mc.beta, mc.gamma);

      let maxValue = -999;
      for(let i = 0, il = dataArray.length; i < il; ++i) {
          if(dataArray[i] > maxValue) maxValue = dataArray[i];
      }

      if(!bInputSigma) {
        sigma = ic.dsn6ParserCls.setSigma(maxValue, location, type, sigma);
      }

      const grid = new GridArray([mtz.nx, mtz.ny, mtz.nz]);
      grid.values.set(dataArray);

      if(type == '2fofc') {
        ic.mapData.ccp4 = 1;
        ic.mapData.grid2 = grid;
        ic.mapData.unit_cell2 = unit_cell;
        ic.mapData.type2 = type;
        ic.mapData.sigma2 = sigma;
      }
      else {
        ic.mapData.ccp4 = 1;
        ic.mapData.grid = grid;
        ic.mapData.unit_cell = unit_cell;
        ic.mapData.type = type;
        ic.mapData.sigma = sigma;
      }

      mtz.delete();

      return sigma;
    }

    // calculate_stddev(a, offset) {
    //   let sum = 0;
    //   let sq_sum = 0;
    //   const alen = a.length;
    //   for (let i = offset; i < alen; i++) {
    //     sum += a[i];
    //     sq_sum += a[i] * a[i];
    //   }
    //   const mean = sum / (alen - offset);
    //   const variance = sq_sum / (alen - offset) - mean * mean;
    //   return {mean: mean, rms: Math.sqrt(variance)};
    // }
    
    parse_symop(symop) {
      const ops = symop.toLowerCase().replace(/\s+/g, '').split(',');
      if (ops.length !== 3) throw Error('Unexpected symop: ' + symop);
      let mat = [];
      for (let i = 0; i < 3; i++) {
        const terms = ops[i].split(/(?=[+-])/);
        let row = [0, 0, 0, 0];
        for (let j = 0; j < terms.length; j++) {
          const term = terms[j];
          const sign = (term[0] === '-' ? -1 : 1);
          let m = terms[j].match(/^[+-]?([xyz])$/);
          if (m) {
            const pos = {x: 0, y: 1, z: 2}[m[1]];
            row[pos] = sign;
          } else {
            m = terms[j].match(/^[+-]?(\d)\/(\d)$/);
            if (!m) throw Error('What is ' + terms[j] + ' in ' + symop);
            row[3] = sign * Number(m[1]) / Number(m[2]);
          }
        }
        mat.push(row);
      }
      return mat;
    }    

    loadCcp4File(type) {let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let file = $("#" + ic.pre + "dsn6file" + type)[0].files[0];
       let sigma = $("#" + ic.pre + "dsn6sigma" + type).val();
       if(!file) {
         alert("Please select a file before clicking 'Load'");
       }
       else {
         me.utilsCls.checkFileAPI();
         let reader = new FileReader();
         reader.onload = function(e) { let ic = thisClass.icn3d;
            let arrayBuffer = e.target.result; // or = reader.result;
            sigma = thisClass.load_map_from_buffer(arrayBuffer, type, sigma, 'file');

            // if(type == '2fofc') {
            //   ic.bAjax2fofcCcp4 = true;
            // }
            // else if(type == 'fofc') {
            //     ic.bAjaxfofcCcp4 = true;
            // }
            ic.setOptionCls.setOption('map', type);
            me.htmlCls.clickMenuCls.setLogCmd('load map file ' + $("#" + ic.pre + "dsn6file" + type).val() + ' with sigma ' + sigma, false);
         }
         reader.readAsArrayBuffer(file);
       }
    }

    async loadCcp4FileUrl(type) { let ic = this.icn3d, me = ic.icn3dui;
       let url = $("#" + ic.pre + "dsn6fileurl" + type).val();
       let sigma = $("#" + ic.pre + "dsn6sigmaurl" + type).val();
       if(!url) {
            alert("Please input the file URL before clicking 'Load'");
       }
       else {
           sigma = await this.ccp4ParserBase(url, type, sigma, 'file');

           me.htmlCls.clickMenuCls.setLogCmd('set map ' + type + ' sigma ' + sigma + ' file ccp4 | ' + encodeURIComponent(url), true);
       }
    }

    // Extract a block of density for calculating an isosurface using the
    // separate marching cubes implementation.
    extract_block(grid, unit_cell, radius, center, typeDetail) { let ic = this.icn3d, me = ic.icn3dui;
      //     let grid = this.grid;
      //     let unit_cell = this.unit_cell;
      if (grid == null || unit_cell == null) { return; }
      let fc = unit_cell.fractionalize(center);

      let r = [radius / unit_cell.parameters[0],
              radius / unit_cell.parameters[1],
              radius / unit_cell.parameters[2]];
      let grid_min = grid.frac2grid([fc[0] - r[0], fc[1] - r[1], fc[2] - r[2]]);
      let grid_max = grid.frac2grid([fc[0] + r[0], fc[1] + r[1], fc[2] + r[2]]);

      let size = [grid_max[0] - grid_min[0] + 1,
                  grid_max[1] - grid_min[1] + 1,
                  grid_max[2] - grid_min[2] + 1];
      let points = [];
      let values = [];
      let threshold = 1;
      let bAtoms = ic.hAtoms && Object.keys(ic.hAtoms).length > 0;
      for (let i = grid_min[0]; i <= grid_max[0]; i++) {
          for (let j = grid_min[1]; j <= grid_max[1]; j++) {
              for (let k = grid_min[2]; k <= grid_max[2]; k++) {
                let frac = grid.grid2frac(i, j, k);
                let orth = unit_cell.orthogonalize(frac);
                points.push(orth);

                // get overlap between map and atoms
                let positoin = new THREE.Vector3(orth[0], orth[1], orth[2]);
                let atomsNear = ic.rayCls.getAtomsFromPosition(positoin, threshold, ic.hAtoms);

                let map_value = (atomsNear || !bAtoms) ? grid.get_grid_value(i, j, k) : 0;

                if(typeDetail == 'fofc_pos' && map_value < 0) map_value = 0;
                if(typeDetail == 'fofc_neg') map_value = (map_value > 0) ? 0 : -map_value;

                values.push(map_value);
              }
          }
      }

      return {size: size, values: values, points: points};
  //     this.block.set(points, values, size);
    };

    marchingCubes(dims, values, points, isolevel, method) {  let ic = this.icn3d, me = ic.icn3dui;
      const edgeTable = new Int32Array([
        0x0  , 0x0  , 0x202, 0x302, 0x406, 0x406, 0x604, 0x704,
        0x804, 0x805, 0xa06, 0xa06, 0xc0a, 0xd03, 0xe08, 0xf00,
        0x90 , 0x98 , 0x292, 0x292, 0x496, 0x49e, 0x694, 0x694,
        0x894, 0x894, 0xa96, 0xa96, 0xc9a, 0xc92, 0xe91, 0xe90,
        0x230, 0x230, 0x33 , 0x13a, 0x636, 0x636, 0x434, 0x43c,
        0xa34, 0xa35, 0x837, 0x936, 0xe3a, 0xf32, 0xc31, 0xd30,
        0x2a0, 0x2a8, 0xa3 , 0xaa , 0x6a6, 0x6af, 0x5a4, 0x4ac,
        0xaa4, 0xaa4, 0x9a6, 0x8a6, 0xfaa, 0xea3, 0xca1, 0xca0,
        0x460, 0x460, 0x662, 0x762, 0x66 , 0x66 , 0x265, 0x364,
        0xc64, 0xc65, 0xe66, 0xe66, 0x86a, 0x863, 0xa69, 0xa60,
        0x4f0, 0x4f8, 0x6f2, 0x6f2, 0xf6 , 0xfe , 0x2f5, 0x2fc,
        0xcf4, 0xcf4, 0xef6, 0xef6, 0x8fa, 0x8f3, 0xaf9, 0xaf0,
        0x650, 0x650, 0x453, 0x552, 0x256, 0x256, 0x54 , 0x154,
        0xe54, 0xf54, 0xc57, 0xd56, 0xa5a, 0xb52, 0x859, 0x950,
        0x7c0, 0x6c1, 0x5c2, 0x4c2, 0x3c6, 0x2ce, 0xc5 , 0xc4 ,
        0xfc4, 0xec5, 0xdc6, 0xcc6, 0xbca, 0xac2, 0x8c1, 0x8c0,
        0x8c0, 0x8c0, 0xac2, 0xbc2, 0xcc6, 0xcc6, 0xec4, 0xfcc,
        0xc4 , 0xc5 , 0x2c6, 0x3c6, 0x4c2, 0x5c2, 0x6c1, 0x7c0,
        0x950, 0x859, 0xb52, 0xa5a, 0xd56, 0xc57, 0xe54, 0xe5c,
        0x154, 0x54 , 0x25e, 0x256, 0x552, 0x453, 0x658, 0x650,
        0xaf0, 0xaf0, 0x8f3, 0x8fa, 0xef6, 0xef6, 0xcf4, 0xcfc,
        0x2f4, 0x3f5, 0xff , 0x1f6, 0x6f2, 0x6f3, 0x4f9, 0x5f0,
        0xa60, 0xa69, 0x863, 0x86a, 0xe66, 0xe67, 0xd65, 0xc6c,
        0x364, 0x265, 0x166, 0x66 , 0x76a, 0x663, 0x460, 0x460,
        0xca0, 0xca0, 0xea2, 0xfa2, 0x8a6, 0x8a6, 0xaa4, 0xba4,
        0x4ac, 0x5a4, 0x6ae, 0x7a6, 0xaa , 0xa3 , 0x2a8, 0x2a0,
        0xd30, 0xc31, 0xf32, 0xe3a, 0x936, 0x837, 0xb35, 0xa34,
        0x43c, 0x434, 0x73e, 0x636, 0x13a, 0x33 , 0x339, 0x230,
        0xe90, 0xe90, 0xc92, 0xc9a, 0xa96, 0xa96, 0x894, 0x89c,
        0x694, 0x695, 0x49f, 0x496, 0x292, 0x392, 0x98 , 0x90 ,
        0xf00, 0xe08, 0xd03, 0xc0a, 0xa06, 0xa0e, 0x805, 0x804,
        0x704, 0x604, 0x506, 0x406, 0x302, 0x202, 0x0  , 0x0]);

      const segTable = [
        [],
        [],
        [1, 9],
        [1, 8, 1, 9],
        [2, 10, 10, 1],
        [2, 10, 10, 1],
        [9, 2, 2, 10, 10, 9],
        [2, 8, 2, 10, 10, 8, 10, 9],
        [11, 2],
        [0, 11, 11, 2],
        [1, 9, 11, 2],
        [1, 11, 11, 2, 1, 9, 9, 11],
        [3, 10, 10, 1, 11, 10],
        [0, 10, 10, 1, 8, 10, 11, 10],
        [3, 9, 11, 9, 11, 10, 10, 9],
        [8, 10, 10, 9, 11, 10],
        [4, 7],
        [4, 3, 4, 7],
        [1, 9, 4, 7],
        [4, 1, 1, 9, 4, 7, 7, 1],
        [2, 10, 10, 1, 4, 7],
        [3, 4, 4, 7, 2, 10, 10, 1],
        [9, 2, 2, 10, 10, 9, 4, 7],
        [2, 10, 10, 9, 9, 2, 9, 7, 7, 2, 4, 7],
        [4, 7, 11, 2],
        [11, 4, 4, 7, 11, 2, 2, 4],
        [1, 9, 4, 7, 11, 2],
        [4, 7, 11, 4, 11, 9, 11, 2, 2, 9, 1, 9],
        [3, 10, 10, 1, 11, 10, 4, 7],
        [1, 11, 11, 10, 10, 1, 1, 4, 4, 11, 4, 7],
        [4, 7, 0, 11, 11, 9, 11, 10, 10, 9],
        [4, 7, 11, 4, 11, 9, 11, 10, 10, 9],
        [9, 5, 5, 4],
        [9, 5, 5, 4],
        [0, 5, 5, 4, 1, 5],
        [8, 5, 5, 4, 3, 5, 1, 5],
        [2, 10, 10, 1, 9, 5, 5, 4],
        [2, 10, 10, 1, 9, 5, 5, 4],
        [5, 2, 2, 10, 10, 5, 5, 4, 4, 2],
        [2, 10, 10, 5, 5, 2, 5, 3, 5, 4, 4, 3],
        [9, 5, 5, 4, 11, 2],
        [0, 11, 11, 2, 9, 5, 5, 4],
        [0, 5, 5, 4, 1, 5, 11, 2],
        [1, 5, 5, 2, 5, 8, 8, 2, 11, 2, 5, 4],
        [10, 3, 11, 10, 10, 1, 9, 5, 5, 4],
        [9, 5, 5, 4, 8, 1, 8, 10, 10, 1, 11, 10],
        [5, 4, 0, 5, 0, 11, 11, 5, 11, 10, 10, 5],
        [5, 4, 8, 5, 8, 10, 10, 5, 11, 10],
        [9, 7, 5, 7, 9, 5],
        [9, 3, 9, 5, 5, 3, 5, 7],
        [0, 7, 1, 7, 1, 5, 5, 7],
        [1, 5, 5, 3, 5, 7],
        [9, 7, 9, 5, 5, 7, 10, 1, 2, 10],
        [10, 1, 2, 10, 9, 5, 5, 0, 5, 3, 5, 7],
        [2, 8, 2, 5, 5, 8, 5, 7, 10, 5, 2, 10],
        [2, 10, 10, 5, 5, 2, 5, 3, 5, 7],
        [7, 9, 9, 5, 5, 7, 11, 2],
        [9, 5, 5, 7, 7, 9, 7, 2, 2, 9, 11, 2],
        [11, 2, 1, 8, 1, 7, 1, 5, 5, 7],
        [11, 2, 1, 11, 1, 7, 1, 5, 5, 7],
        [9, 5, 5, 8, 5, 7, 10, 1, 3, 10, 11, 10],
        [5, 7, 7, 0, 0, 5, 9, 5, 11, 0, 0, 10, 10, 1, 11, 10],
        [11, 10, 10, 0, 0, 11, 10, 5, 5, 0, 0, 7, 5, 7],
        [11, 10, 10, 5, 5, 11, 5, 7],
        [10, 6, 6, 5, 5, 10],
        [5, 10, 10, 6, 6, 5],
        [1, 9, 5, 10, 10, 6, 6, 5],
        [1, 8, 1, 9, 5, 10, 10, 6, 6, 5],
        [1, 6, 6, 5, 5, 1, 2, 6],
        [1, 6, 6, 5, 5, 1, 2, 6],
        [9, 6, 6, 5, 5, 9, 0, 6, 2, 6],
        [5, 9, 8, 5, 8, 2, 2, 5, 2, 6, 6, 5],
        [11, 2, 10, 6, 6, 5, 5, 10],
        [11, 0, 11, 2, 10, 6, 6, 5, 5, 10],
        [1, 9, 11, 2, 5, 10, 10, 6, 6, 5],
        [5, 10, 10, 6, 6, 5, 1, 9, 9, 2, 9, 11, 11, 2],
        [6, 3, 11, 6, 6, 5, 5, 3, 5, 1],
        [11, 0, 11, 5, 5, 0, 5, 1, 11, 6, 6, 5],
        [11, 6, 6, 3, 6, 0, 6, 5, 5, 0, 5, 9],
        [6, 5, 5, 9, 9, 6, 9, 11, 11, 6],
        [5, 10, 10, 6, 6, 5, 4, 7],
        [4, 3, 4, 7, 6, 5, 5, 10, 10, 6],
        [1, 9, 5, 10, 10, 6, 6, 5, 4, 7],
        [10, 6, 6, 5, 5, 10, 1, 9, 9, 7, 7, 1, 4, 7],
        [6, 1, 2, 6, 6, 5, 5, 1, 4, 7],
        [2, 5, 5, 1, 2, 6, 6, 5, 4, 3, 4, 7],
        [4, 7, 0, 5, 5, 9, 0, 6, 6, 5, 2, 6],
        [3, 9, 9, 7, 4, 7, 2, 9, 5, 9, 9, 6, 6, 5, 2, 6],
        [11, 2, 4, 7, 10, 6, 6, 5, 5, 10],
        [5, 10, 10, 6, 6, 5, 4, 7, 7, 2, 2, 4, 11, 2],
        [1, 9, 4, 7, 11, 2, 5, 10, 10, 6, 6, 5],
        [9, 2, 1, 9, 9, 11, 11, 2, 4, 11, 4, 7, 5, 10, 10, 6, 6, 5],
        [4, 7, 11, 5, 5, 3, 5, 1, 11, 6, 6, 5],
        [5, 1, 1, 11, 11, 5, 11, 6, 6, 5, 0, 11, 11, 4, 4, 7],
        [0, 5, 5, 9, 0, 6, 6, 5, 3, 6, 11, 6, 4, 7],
        [6, 5, 5, 9, 9, 6, 9, 11, 11, 6, 4, 7, 7, 9],
        [10, 4, 9, 10, 6, 4, 10, 6],
        [4, 10, 10, 6, 6, 4, 9, 10],
        [10, 0, 1, 10, 10, 6, 6, 0, 6, 4],
        [1, 8, 1, 6, 6, 8, 6, 4, 1, 10, 10, 6],
        [1, 4, 9, 1, 2, 4, 2, 6, 6, 4],
        [2, 9, 9, 1, 2, 4, 2, 6, 6, 4],
        [2, 4, 2, 6, 6, 4],
        [2, 8, 2, 4, 2, 6, 6, 4],
        [10, 4, 9, 10, 10, 6, 6, 4, 11, 2],
        [8, 2, 11, 2, 9, 10, 10, 4, 10, 6, 6, 4],
        [11, 2, 1, 6, 6, 0, 6, 4, 1, 10, 10, 6],
        [6, 4, 4, 1, 1, 6, 1, 10, 10, 6, 8, 1, 1, 11, 11, 2],
        [9, 6, 6, 4, 9, 3, 3, 6, 9, 1, 11, 6],
        [11, 1, 1, 8, 11, 6, 6, 1, 9, 1, 1, 4, 6, 4],
        [11, 6, 6, 3, 6, 0, 6, 4],
        [6, 4, 8, 6, 11, 6],
        [7, 10, 10, 6, 6, 7, 8, 10, 9, 10],
        [0, 7, 0, 10, 10, 7, 9, 10, 6, 7, 10, 6],
        [10, 6, 6, 7, 7, 10, 1, 10, 7, 1, 8, 1],
        [10, 6, 6, 7, 7, 10, 7, 1, 1, 10],
        [2, 6, 6, 1, 6, 8, 8, 1, 9, 1, 6, 7],
        [2, 6, 6, 9, 9, 2, 9, 1, 6, 7, 7, 9, 9, 3],
        [0, 7, 0, 6, 6, 7, 2, 6],
        [2, 7, 6, 7, 2, 6],
        [11, 2, 10, 6, 6, 8, 8, 10, 9, 10, 6, 7],
        [0, 7, 7, 2, 11, 2, 9, 7, 6, 7, 7, 10, 10, 6, 9, 10],
        [1, 8, 1, 7, 1, 10, 10, 7, 6, 7, 10, 6, 11, 2],
        [11, 2, 1, 11, 1, 7, 10, 6, 6, 1, 1, 10, 6, 7],
        [9, 6, 6, 8, 6, 7, 9, 1, 1, 6, 11, 6, 6, 3],
        [9, 1, 11, 6, 6, 7],
        [0, 7, 0, 6, 6, 7, 11, 0, 11, 6],
        [11, 6, 6, 7],
        [7, 6, 6, 11],
        [7, 6, 6, 11],
        [1, 9, 7, 6, 6, 11],
        [8, 1, 1, 9, 7, 6, 6, 11],
        [10, 1, 2, 10, 6, 11, 7, 6],
        [2, 10, 10, 1, 6, 11, 7, 6],
        [2, 9, 2, 10, 10, 9, 6, 11, 7, 6],
        [6, 11, 7, 6, 2, 10, 10, 3, 10, 8, 10, 9],
        [7, 2, 6, 2, 7, 6],
        [7, 0, 7, 6, 6, 0, 6, 2],
        [2, 7, 7, 6, 6, 2, 1, 9],
        [1, 6, 6, 2, 1, 8, 8, 6, 1, 9, 7, 6],
        [10, 7, 7, 6, 6, 10, 10, 1, 1, 7],
        [10, 7, 7, 6, 6, 10, 1, 7, 10, 1, 1, 8],
        [7, 0, 7, 10, 10, 0, 10, 9, 6, 10, 7, 6],
        [7, 6, 6, 10, 10, 7, 10, 8, 10, 9],
        [6, 8, 4, 6, 6, 11],
        [3, 6, 6, 11, 0, 6, 4, 6],
        [8, 6, 6, 11, 4, 6, 1, 9],
        [4, 6, 6, 9, 6, 3, 3, 9, 1, 9, 6, 11],
        [6, 8, 4, 6, 6, 11, 2, 10, 10, 1],
        [2, 10, 10, 1, 0, 11, 0, 6, 6, 11, 4, 6],
        [4, 11, 4, 6, 6, 11, 2, 9, 2, 10, 10, 9],
        [10, 9, 9, 3, 3, 10, 2, 10, 4, 3, 3, 6, 6, 11, 4, 6],
        [8, 2, 4, 2, 4, 6, 6, 2],
        [4, 2, 4, 6, 6, 2],
        [1, 9, 3, 4, 4, 2, 4, 6, 6, 2],
        [1, 9, 4, 1, 4, 2, 4, 6, 6, 2],
        [8, 1, 8, 6, 6, 1, 4, 6, 6, 10, 10, 1],
        [10, 1, 0, 10, 0, 6, 6, 10, 4, 6],
        [4, 6, 6, 3, 3, 4, 6, 10, 10, 3, 3, 9, 10, 9],
        [10, 9, 4, 10, 6, 10, 4, 6],
        [9, 5, 5, 4, 7, 6, 6, 11],
        [9, 5, 5, 4, 7, 6, 6, 11],
        [5, 0, 1, 5, 5, 4, 7, 6, 6, 11],
        [7, 6, 6, 11, 3, 4, 3, 5, 5, 4, 1, 5],
        [9, 5, 5, 4, 10, 1, 2, 10, 7, 6, 6, 11],
        [6, 11, 7, 6, 2, 10, 10, 1, 9, 5, 5, 4],
        [7, 6, 6, 11, 5, 4, 4, 10, 10, 5, 4, 2, 2, 10],
        [3, 4, 3, 5, 5, 4, 2, 5, 10, 5, 2, 10, 7, 6, 6, 11],
        [7, 2, 7, 6, 6, 2, 5, 4, 9, 5],
        [9, 5, 5, 4, 8, 6, 6, 0, 6, 2, 7, 6],
        [3, 6, 6, 2, 7, 6, 1, 5, 5, 0, 5, 4],
        [6, 2, 2, 8, 8, 6, 7, 6, 1, 8, 8, 5, 5, 4, 1, 5],
        [9, 5, 5, 4, 10, 1, 1, 6, 6, 10, 1, 7, 7, 6],
        [1, 6, 6, 10, 10, 1, 1, 7, 7, 6, 0, 7, 9, 5, 5, 4],
        [0, 10, 10, 4, 10, 5, 5, 4, 3, 10, 6, 10, 10, 7, 7, 6],
        [7, 6, 6, 10, 10, 7, 10, 8, 5, 4, 4, 10, 10, 5],
        [6, 9, 9, 5, 5, 6, 6, 11, 11, 9],
        [3, 6, 6, 11, 0, 6, 0, 5, 5, 6, 9, 5],
        [0, 11, 0, 5, 5, 11, 1, 5, 5, 6, 6, 11],
        [6, 11, 3, 6, 3, 5, 5, 6, 1, 5],
        [2, 10, 10, 1, 9, 5, 5, 11, 11, 9, 5, 6, 6, 11],
        [0, 11, 0, 6, 6, 11, 9, 6, 5, 6, 9, 5, 2, 10, 10, 1],
        [8, 5, 5, 11, 5, 6, 6, 11, 0, 5, 10, 5, 5, 2, 2, 10],
        [6, 11, 3, 6, 3, 5, 5, 6, 2, 10, 10, 3, 10, 5],
        [5, 8, 9, 5, 5, 2, 2, 8, 5, 6, 6, 2],
        [9, 5, 5, 6, 6, 9, 6, 0, 6, 2],
        [1, 5, 5, 8, 8, 1, 5, 6, 6, 8, 8, 2, 6, 2],
        [1, 5, 5, 6, 6, 1, 6, 2],
        [3, 6, 6, 1, 6, 10, 10, 1, 8, 6, 5, 6, 6, 9, 9, 5],
        [10, 1, 0, 10, 0, 6, 6, 10, 9, 5, 5, 0, 5, 6],
        [5, 6, 6, 10, 10, 5],
        [10, 5, 5, 6, 6, 10],
        [11, 5, 5, 10, 10, 11, 7, 5],
        [11, 5, 5, 10, 10, 11, 7, 5],
        [5, 11, 7, 5, 5, 10, 10, 11, 1, 9],
        [10, 7, 7, 5, 5, 10, 10, 11, 8, 1, 1, 9],
        [11, 1, 2, 11, 7, 1, 7, 5, 5, 1],
        [2, 7, 7, 1, 7, 5, 5, 1, 2, 11],
        [9, 7, 7, 5, 5, 9, 9, 2, 2, 7, 2, 11],
        [7, 5, 5, 2, 2, 7, 2, 11, 5, 9, 9, 2, 2, 8],
        [2, 5, 5, 10, 10, 2, 3, 5, 7, 5],
        [8, 2, 8, 5, 5, 2, 7, 5, 10, 2, 5, 10],
        [1, 9, 5, 10, 10, 3, 3, 5, 7, 5, 10, 2],
        [8, 2, 2, 9, 1, 9, 7, 2, 10, 2, 2, 5, 5, 10, 7, 5],
        [3, 5, 5, 1, 7, 5],
        [7, 0, 7, 1, 7, 5, 5, 1],
        [3, 9, 3, 5, 5, 9, 7, 5],
        [7, 9, 5, 9, 7, 5],
        [5, 8, 4, 5, 5, 10, 10, 8, 10, 11],
        [5, 0, 4, 5, 5, 11, 11, 0, 5, 10, 10, 11],
        [1, 9, 4, 10, 10, 8, 10, 11, 4, 5, 5, 10],
        [10, 11, 11, 4, 4, 10, 4, 5, 5, 10, 3, 4, 4, 1, 1, 9],
        [2, 5, 5, 1, 2, 8, 8, 5, 2, 11, 4, 5],
        [4, 11, 11, 0, 4, 5, 5, 11, 2, 11, 11, 1, 5, 1],
        [2, 5, 5, 0, 5, 9, 2, 11, 11, 5, 4, 5, 5, 8],
        [4, 5, 5, 9, 2, 11],
        [2, 5, 5, 10, 10, 2, 3, 5, 3, 4, 4, 5],
        [5, 10, 10, 2, 2, 5, 2, 4, 4, 5],
        [3, 10, 10, 2, 3, 5, 5, 10, 8, 5, 4, 5, 1, 9],
        [5, 10, 10, 2, 2, 5, 2, 4, 4, 5, 1, 9, 9, 2],
        [4, 5, 5, 8, 5, 3, 5, 1],
        [4, 5, 5, 0, 5, 1],
        [4, 5, 5, 8, 5, 3, 0, 5, 5, 9],
        [4, 5, 5, 9],
        [4, 11, 7, 4, 9, 11, 9, 10, 10, 11],
        [9, 7, 7, 4, 9, 11, 9, 10, 10, 11],
        [1, 10, 10, 11, 11, 1, 11, 4, 4, 1, 7, 4],
        [1, 4, 4, 3, 1, 10, 10, 4, 7, 4, 4, 11, 10, 11],
        [4, 11, 7, 4, 9, 11, 9, 2, 2, 11, 9, 1],
        [9, 7, 7, 4, 9, 11, 9, 1, 1, 11, 2, 11],
        [7, 4, 4, 11, 4, 2, 2, 11],
        [7, 4, 4, 11, 4, 2, 2, 11, 3, 4],
        [2, 9, 9, 10, 10, 2, 2, 7, 7, 9, 7, 4],
        [9, 10, 10, 7, 7, 9, 7, 4, 10, 2, 2, 7, 7, 0],
        [7, 10, 10, 3, 10, 2, 7, 4, 4, 10, 1, 10, 10, 0],
        [1, 10, 10, 2, 7, 4],
        [9, 1, 1, 4, 1, 7, 7, 4],
        [9, 1, 1, 4, 1, 7, 7, 4, 8, 1],
        [3, 4, 7, 4],
        [7, 4],
        [9, 10, 10, 8, 10, 11],
        [9, 3, 9, 11, 9, 10, 10, 11],
        [1, 10, 10, 0, 10, 8, 10, 11],
        [1, 10, 10, 3, 10, 11],
        [2, 11, 11, 1, 11, 9, 9, 1],
        [9, 3, 9, 11, 2, 9, 9, 1, 2, 11],
        [2, 11, 11, 0],
        [2, 11],
        [8, 2, 8, 10, 10, 2, 9, 10],
        [9, 10, 10, 2, 2, 9],
        [8, 2, 8, 10, 10, 2, 1, 8, 1, 10],
        [1, 10, 10, 2],
        [8, 1, 9, 1],
        [9, 1],
        [],
        []];

      const snap = (method === 'snapped MC');
      // const seg_table = (method === 'squarish' ? segTable2 : segTable);
      const seg_table = segTable;

      let vlist = new Array(12);
      const vert_offsets = this.calculateVertOffsets(dims);

      const edgeIndex = [[0,1], [1,2], [2,3], [3,0], [4,5], [5,6],
                [6,7], [7,4], [0,4], [1,5], [2,6], [3,7]];  

      let vertex_values = new Float32Array(8);
      let p0 = [0, 0, 0]; // unused initial value - to make Flow happy
      let vertex_points = [p0, p0, p0, p0, p0, p0, p0, p0];
      const size_x = dims[0];
      const size_y = dims[1];
      const size_z = dims[2];
      if (values == null || points == null) return;
      let vertices = [];
      let segments = [];
      let vertex_count = 0;
      for (let x = 0; x < size_x - 1; x++) {
        for (let y = 0; y < size_y - 1; y++) {
          for (let z = 0; z < size_z - 1; z++) {
            const offset0 = z + size_z * (y + size_y * x);
            let cubeindex = 0;
            let i;
            let j;
            for (i = 0; i < 8; ++i) {
              j = offset0 + vert_offsets[i];
              cubeindex |= (values[j] < isolevel) ? 1 << i : 0;
            }
            if (cubeindex === 0 || cubeindex === 255) continue;
            for (i = 0; i < 8; ++i) {
              j = offset0 + vert_offsets[i];
              vertex_values[i] = values[j];
              vertex_points[i] = points[j];
            }
    
            // 12 bit number, indicates which edges are crossed by the isosurface
            const edge_mask = edgeTable[cubeindex];
    
            // check which edges are crossed, and estimate the point location
            // using a weighted average of scalar values at edge endpoints.
            for (i = 0; i < 12; ++i) {
              if ((edge_mask & (1 << i)) !== 0) {
                const e = edgeIndex[i];
                let mu = (isolevel - vertex_values[e[0]]) /
                        (vertex_values[e[1]] - vertex_values[e[0]]);
                if (snap === true) {
                  if (mu > 0.85) mu = 1;
                  else if (mu < 0.15) mu = 0;
                }
                const p1 = vertex_points[e[0]];
                const p2 = vertex_points[e[1]];
                // The number of added vertices could be roughly halved
                // if we avoided duplicates between neighbouring cells.
                // Using a map for lookups is too slow, perhaps a big
                // array would do?
                vertices.push(p1[0] + (p2[0] - p1[0]) * mu,
                              p1[1] + (p2[1] - p1[1]) * mu,
                              p1[2] + (p2[2] - p1[2]) * mu);
                vlist[i] = vertex_count++;
              }
            }
            const t = seg_table[cubeindex];
            for (i = 0; i < t.length; i++) {
              segments.push(vlist[t[i]]);
            }
          }
        }
      }

      return { vertices: vertices, segments: segments };
    }

    // return offsets relative to vertex [0,0,0]
    calculateVertOffsets(dims) { let ic = this.icn3d, me = ic.icn3dui;
      let vert_offsets = [];
      const cubeVerts = [[0,0,0], [1,0,0], [1,1,0], [0,1,0],
                [0,0,1], [1,0,1], [1,1,1], [0,1,1]];
              
      for (let i = 0; i < 8; ++i) {
        const v = cubeVerts[i];
        vert_offsets.push(v[0] + dims[2] * (v[1] + dims[1] * v[2]));
      }
      return vert_offsets;
    }

    makeChickenWire(data, typeDetail) { let ic = this.icn3d, me = ic.icn3dui;
      let geom = new THREE.BufferGeometry();
      let position = new Float32Array(data.vertices);
      geom.setAttribute('position', new THREE.BufferAttribute(position, 3));

      // Although almost all browsers support OES_element_index_uint nowadays,
      // use Uint32 indexes only when needed.
      let arr = (data.vertices.length < 3*65536 ? new Uint16Array(data.segments) : new Uint32Array(data.segments));
      
      geom.setIndex(new THREE.BufferAttribute(arr, 1));

      let colorFor2fofc = me.parasCls.thr('#00FFFF');
      let colorForfofcPos = me.parasCls.thr('#00FF00');
      let colorForfofcNeg = me.parasCls.thr('#ff0000');

      let color = (typeDetail == '2fofc') ? colorFor2fofc : ((typeDetail == 'fofc_pos') ? colorForfofcPos : colorForfofcNeg);
      let material = new THREE.LineBasicMaterial({ linewidth: 1, color: color });
      //return new THREE.LineSegments(geom, material);

      let mesh = new THREE.LineSegments(geom, material);
      ic.mdl.add(mesh);

      ic.prevMaps.push(mesh);
    }
}


class UnitCell {
  /*::
  parameters: number[]
  orth: number[]
  frac: number[]
  */
  // eslint-disable-next-line max-params
  constructor(a /*:number*/, b /*:number*/, c /*:number*/,
              alpha /*:number*/, beta /*:number*/, gamma /*:number*/) {
    if (a <= 0 || b <= 0 || c <= 0 || alpha <= 0 || beta <= 0 || gamma <= 0) {
      throw Error('Zero or negative unit cell parameter(s).');
    }
    this.parameters = [a, b, c, alpha, beta, gamma];
    const deg2rad = Math.PI / 180.0;
    const cos_alpha = Math.cos(deg2rad * alpha);
    const cos_beta = Math.cos(deg2rad * beta);
    const cos_gamma = Math.cos(deg2rad * gamma);
    const sin_alpha = Math.sin(deg2rad * alpha);
    const sin_beta = Math.sin(deg2rad * beta);
    const sin_gamma = Math.sin(deg2rad * gamma);
    if (sin_alpha === 0 || sin_beta === 0 || sin_gamma === 0) {
      throw Error('Impossible angle - N*180deg.');
    }
    const cos_alpha_star_sin_beta = (cos_beta * cos_gamma - cos_alpha) /
                                    sin_gamma;
    const cos_alpha_star = cos_alpha_star_sin_beta / sin_beta;
    const s1rca2 = Math.sqrt(1.0 - cos_alpha_star * cos_alpha_star);
    // The orthogonalization matrix we use is described in ITfC B p.262:
    // "An alternative mode of orthogonalization, used by the Protein
    // Data Bank and most programs, is to align the a1 axis of the unit
    // cell with the Cartesian X_1 axis, and to align the a*_3 axis with the
    // Cartesian X_3 axis."
    //
    // Zeros in the matrices below are kept to make matrix multiplication
    // faster: they make extract_block() 2x (!) faster on V8 4.5.103,
    // no difference on FF 50.
    /* eslint-disable no-multi-spaces, comma-spacing */
    this.orth = [a,   b * cos_gamma,  c * cos_beta,
                 0.0, b * sin_gamma, -c * cos_alpha_star_sin_beta,
                 0.0, 0.0          ,  c * sin_beta * s1rca2];
    // based on xtal.js which is based on cctbx.uctbx
    this.frac = [
      1.0 / a,
      -cos_gamma / (sin_gamma * a),
      -(cos_gamma * cos_alpha_star_sin_beta + cos_beta * sin_gamma) /
          (sin_beta * s1rca2 * sin_gamma * a),
      0.0,
      1.0 / (sin_gamma * b),
      cos_alpha_star / (s1rca2 * sin_gamma * b),
      0.0,
      0.0,
      1.0 / (sin_beta * s1rca2 * c),
    ];
  }

  // This function is only used with matrices frac and orth, which have 3 zeros.
  // We skip these elements, but it doesn't affect performance (on FF50 and V8).
  multiply(xyz, mat) {
    /* eslint-disable indent */
    return [mat[0] * xyz[0]  + mat[1] * xyz[1]  + mat[2] * xyz[2],
          /*mat[3] * xyz[0]*/+ mat[4] * xyz[1]  + mat[5] * xyz[2],
          /*mat[6] * xyz[0]  + mat[7] * xyz[1]*/+ mat[8] * xyz[2]];
  }

  fractionalize(xyz /*:[number,number,number]*/) {
    return this.multiply(xyz, this.frac);
  }

  orthogonalize(xyz /*:[number,number,number]*/) {
    return this.multiply(xyz, this.orth);
  }
}


class GridArray {
  /*::
  dim: number[]
  values: Float32Array
  */
  constructor(dim /*:number[]*/) {
    this.dim = dim; // dimensions of the grid for the entire unit cell
    this.values = new Float32Array(dim[0] * dim[1] * dim[2]);
  }

  modulo(a, b) {
    const reminder = a % b;
    return reminder >= 0 ? reminder : reminder + b;
  }

  grid2index(i/*:number*/, j/*:number*/, k/*:number*/) {
    i = this.modulo(i, this.dim[0]);
    j = this.modulo(j, this.dim[1]);
    k = this.modulo(k, this.dim[2]);
    return this.dim[2] * (this.dim[1] * i + j) + k;
  }

  grid2index_unchecked(i/*:number*/, j/*:number*/, k/*:number*/) {
    return this.dim[2] * (this.dim[1] * i + j) + k;
  }

  grid2frac(i/*:number*/, j/*:number*/, k/*:number*/) {
    return [i / this.dim[0], j / this.dim[1], k / this.dim[2]];
  }

  // return grid coordinates (rounded down) for the given fractional coordinates
  frac2grid(xyz/*:number[]*/) {
    // at one point "| 0" here made extract_block() 40% faster on V8 3.14,
    // but I don't see any effect now
    return [Math.floor(xyz[0] * this.dim[0]) | 0,
            Math.floor(xyz[1] * this.dim[1]) | 0,
            Math.floor(xyz[2] * this.dim[2]) | 0];
  }

  set_grid_value(i/*:number*/, j/*:number*/, k/*:number*/, value/*:number*/) {
    const idx = this.grid2index(i, j, k);
    this.values[idx] = value;
  }

  get_grid_value(i/*:number*/, j/*:number*/, k/*:number*/) {
    const idx = this.grid2index(i, j, k);
    return this.values[idx];
  }
}

export {UnitCell, GridArray, Ccp4Parser}

