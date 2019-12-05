/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3DUI.prototype.downloadPdb = function (pdbid) { var me = this;
   var url, dataType;

   url = "https://files.rcsb.org/view/" + pdbid + ".pdb";

   dataType = "text";

   me.icn3d.bCid = undefined;

   $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      beforeSend: function() {
          me.showLoading();
      },
      complete: function() {
          me.hideLoading();
      },
      success: function(data) {
          me.loadPdbData(data, pdbid);
          //me.deferredOpm = $.Deferred(function() {
          //    me.loadOpmPdbData(data, pdbid);
          //});

          //return me.deferredOpm.promise();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        return;
      }
   });
};

iCn3DUI.prototype.downloadOpm = function (opmid) { var me = this;
   var url, dataType;

   url = "https://opm-assets.storage.googleapis.com/pdb/" + opmid.toLowerCase()+ ".pdb";

   dataType = "text";

   me.icn3d.bCid = undefined;

   // no rotation
   me.icn3d.bStopRotate = true;

   $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      beforeSend: function() {
          me.showLoading();
      },
      complete: function() {
          me.hideLoading();
      },
      success: function(data) {
          me.icn3d.bOpm = true;
          me.loadPdbData(data, opmid, me.icn3d.bOpm);

          $("#" + me.pre + "selectplane_z1").val(me.icn3d.halfBilayerSize);
          $("#" + me.pre + "selectplane_z2").val(-me.icn3d.halfBilayerSize);

          $("#" + me.pre + "extra_mem_z").val(me.icn3d.halfBilayerSize);
          $("#" + me.pre + "intra_mem_z").val(-me.icn3d.halfBilayerSize);
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        alert("This is probably not a transmembrane protein. It has no data in Orientations of Proteins in Membranes (OPM) database.");
        return;
      }
   });
};

iCn3DUI.prototype.downloadUrl = function (url, type) { var me = this;
   var dataType = "text";

   me.icn3d.bCid = undefined;

   //var url = '//www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi?dataurl=' + encodeURIComponent(url);

   $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      beforeSend: function() {
          if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").show();
          if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").hide();
          if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").hide();
      },
      complete: function() {
          if($("#" + me.pre + "wait")) $("#" + me.pre + "wait").hide();
          if($("#" + me.pre + "canvas")) $("#" + me.pre + "canvas").show();
          if($("#" + me.pre + "cmdlog")) $("#" + me.pre + "cmdlog").show();
      },
      success: function(data) {
        me.InputfileData = data;
        me.InputfileType = type;

        if(type === 'pdb') {
            me.loadPdbData(data);
        }
        else if(type === 'mol2') {
            me.loadMol2Data(data);
        }
        else if(type === 'sdf') {
            me.loadSdfData(data);
        }
        else if(type === 'xyz') {
            me.loadXyzData(data);
        }
        else if(type === 'mmcif') {
            me.loadMmcifData(data);
        }
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }
        return;
      }
   });
};

iCn3DUI.prototype.loadPdbData = function(data, pdbid, bOpm, chainCalphaHash2) { var me = this;
      me.icn3d.loadPDB(data, pdbid, bOpm); // defined in the core library

      if(chainCalphaHash2 !== undefined) {
          var  chainCalphaHash1 = me.icn3d.getChainCalpha(me.icn3d.chains, me.icn3d.atoms);

          var coordsFrom = [], coordsTo = [];
          var psumFrom = new THREE.Vector3(), psumTo = new THREE.Vector3();
          var centerFrom, centerTo;
          for(var chainid in chainCalphaHash1) {
              if(chainCalphaHash2.hasOwnProperty(chainid)) {
                  var coordArray1 = chainCalphaHash1[chainid];
                  var coordArray2 = chainCalphaHash2[chainid];

                  if(coordArray1.length != coordArray2.length) continue;

                  for(var i = 0, il = coordArray1.length; i < il; ++i) {
                      psumFrom.add(coordArray1[i]);
                      psumTo.add(coordArray2[i]);
                  }

                  coordsFrom = coordsFrom.concat(coordArray1);
                  coordsTo = coordsTo.concat(coordArray2);

                  //if(coordsFrom.length > 1000) break; // no need to use all c-alpha
              }
          }

          // add an extra coord as the first coord
          coordsFrom.unshift(new THREE.Vector3());
          coordsTo.unshift(new THREE.Vector3());

          // cmpcor is 1-based, the first coord will be skipped
          var n = coordsFrom.length - 1;

          var centerFrom = psumFrom.multiplyScalar(1.0 / n);
          var centerTo = psumTo.multiplyScalar(1.0 / n);
          var bFindRot = false;
          if(coordsFrom.length > 1) {
              var rmsd_rot_ier = me.cmpcor(n, coordsFrom, coordsTo, centerFrom, centerTo);
              var rot = rmsd_rot_ier.rot;

              // apply matrix for each atom
              if(rot !== undefined) {
                  bFindRot = true;
                  for(var i in me.icn3d.atoms) {
                    var atom = me.icn3d.atoms[i];

                    var x = (atom.coord.x - centerFrom.x)*rot[1][1]
                      + (atom.coord.y - centerFrom.y)*rot[1][2]
                      + (atom.coord.z - centerFrom.z)*rot[1][3]
                      + centerTo.x;
                    var y = (atom.coord.x - centerFrom.x)*rot[2][1]
                      + (atom.coord.y - centerFrom.y)*rot[2][2]
                      + (atom.coord.z - centerFrom.z)*rot[2][3]
                      + centerTo.y;
                    var z = (atom.coord.x - centerFrom.x)*rot[3][1]
                      + (atom.coord.y - centerFrom.y)*rot[3][2]
                      + (atom.coord.z - centerFrom.z)*rot[3][3]
                      + centerTo.z;

                    atom.coord.x = x;
                    atom.coord.y = y;
                    atom.coord.z = z;
                  }

                  me.icn3d.center = centerTo;
                  me.icn3d.oriCenter = centerTo;

                  // no rotation
                  me.icn3d.bStopRotate = true;
              }
          }

          if(!bFindRot) {
              me.icn3d.bOpm = false;
          }
      }

      if(me.icn3d.biomtMatrices !== undefined && me.icn3d.biomtMatrices.length > 1) {
        $("#" + me.pre + "assemblyWrapper").show();

        me.icn3d.asuCnt = me.icn3d.biomtMatrices.length;
      }
      else {
        $("#" + me.pre + "assemblyWrapper").hide();
      }

      if(me.icn3d.emd !== undefined) {
          $("#" + me.pre + "mapWrapper1").hide();
          $("#" + me.pre + "mapWrapper2").hide();
          $("#" + me.pre + "mapWrapper3").hide();
      }
      else {
          $("#" + me.pre + "emmapWrapper1").hide();
          $("#" + me.pre + "emmapWrapper2").hide();
          $("#" + me.pre + "emmapWrapper3").hide();
      }

    // calculate secondary structures if not available
    // DSSP only works for structures with all atoms. The Calpha only strucutres didn't work
    //if(!me.icn3d.bSecondaryStructure && !bCalphaOnly) {
    if(!me.icn3d.bSecondaryStructure) {
      me.deferredSecondary = $.Deferred(function() {
          var bCalphaOnly = me.icn3d.isCalphaPhosOnly(me.icn3d.hash2Atoms(me.icn3d.proteins));//, 'CA');
          var calphaonly = (bCalphaOnly) ? '1' : '0';

          me.loadPdbDataBase(data, calphaonly);
      }); // end of me.deferred = $.Deferred(function() {

      return me.deferredSecondary.promise();
    }
    else {
        me.loadPdbDataRender();
    }
};

iCn3DUI.prototype.loadPdbDataBase = function(data, calphaonly) { var me = this;
   var url = "https://www.ncbi.nlm.nih.gov/Structure/mmcifparser/mmcifparser.cgi";

   $.ajax({
      url: url,
      type: 'POST',
      data: {'dssp':'t', 'calphaonly': calphaonly, 'pdbfile': data},
      dataType: 'jsonp',
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(ssdata) {
        var ssHash = ssdata;

        if(JSON.stringify(ssdata).indexOf('Oops there was a problem') === -1) {
          for(var chainNum in me.icn3d.chainsSeq) {
              var pos = chainNum.indexOf('_');
              var chain = chainNum.substr(pos + 1);

              var residueObjectArray = me.icn3d.chainsSeq[chainNum];
              var prevSS = 'coil';

              for(var i = 0, il = residueObjectArray.length; i < il; ++i) {
                var resi = residueObjectArray[i].resi;
                var chain_resi = chain + '_' + resi;

                var ssOneLetter = 'c';
                if(ssHash.hasOwnProperty(chain_resi)) {
                    ssOneLetter = ssHash[chain_resi];
                }

                var ss;
                if(ssOneLetter === 'H') {
                    ss = 'helix';
                }
                else if(ssOneLetter === 'E') {
                    ss = 'sheet';
                }
                else {
                    ss = 'coil';
                }

                // update ss in sequence window
                //me.icn3d.chainsAn[chainNum][1][i] = ssOneLetter;

                // assign atom ss, ssbegin, and ssend
                var resid = chainNum + '_' + resi;

                me.icn3d.secondaries[resid] = ssOneLetter;

                // no residue can be both ssbegin and ssend in DSSP calculated secondary structures
                var bSetPrevResidue = 0; // 0: no need to reset, 1: reset previous residue to "ssbegin = true", 2: reset previous residue to "ssend = true"

                if(ss !== prevSS) {
                    if(prevSS === 'coil') {
                        ssbegin = true;
                        ssend = false;
                    }
                    else if(ss === 'coil') {
                        bSetPrevResidue = 2;
                        ssbegin = false;
                        ssend = false;
                    }
                    else if( (prevSS === 'sheet' && ss === 'helix') || (prevSS === 'helix' && ss === 'sheet')) {
                        bSetPrevResidue = 1;
                        ssbegin = true;
                        ssend = false;
                    }
                }
                else {
                        ssbegin = false;
                        ssend = false;
                }

                if(bSetPrevResidue == 1) { //1: reset previous residue to "ssbegin = true"
                    var prevResid = chainNum + '_' + (resi - 1).toString();
                    for(var j in me.icn3d.residues[prevResid]) {
                        me.icn3d.atoms[j].ssbegin = true;
                        me.icn3d.atoms[j].ssend = false;
                    }
                }
                else if(bSetPrevResidue == 2) { //2: reset previous residue to "ssend = true"
                    var prevResid = chainNum + '_' + (resi - 1).toString();
                    for(var j in me.icn3d.residues[prevResid]) {
                        me.icn3d.atoms[j].ssbegin = false;
                        me.icn3d.atoms[j].ssend = true;
                    }
                }

                // set the current residue
                for(var j in me.icn3d.residues[resid]) {
                    me.icn3d.atoms[j].ss = ss;
                    me.icn3d.atoms[j].ssbegin = ssbegin;
                    me.icn3d.atoms[j].ssend = ssend;
                }

                prevSS = ss;
              } // for each residue
          } // for each chain
        } // if no error
        else {
            console.log("DSSP calculation had a problem with this structure...");
        }

        me.loadPdbDataRender();

        if(me.deferredSecondary !== undefined) me.deferredSecondary.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }

        me.loadPdbDataRender();
        if(me.deferredSecondary !== undefined) me.deferredSecondary.resolve();
        return;
      }
    });
};

iCn3DUI.prototype.loadOpmPdbData = function(data, pdbid) { var me = this;
    var url, dataType;

    url = "https://opm-assets.storage.googleapis.com/pdb/" + pdbid.toLowerCase()+ ".pdb";

    dataType = "text";

    $.ajax({
      url: url,
      dataType: dataType,
      cache: true,
      tryCount : 0,
      retryLimit : 1,
      success: function(opmdata) {
          me.icn3d.bOpm = true;
          var bVector = true;
          var chainCalphaHash = me.icn3d.loadPDB(opmdata, pdbid, me.icn3d.bOpm, bVector); // defined in the core library

          $("#" + me.pre + "selectplane_z1").val(me.icn3d.halfBilayerSize);
          $("#" + me.pre + "selectplane_z2").val(-me.icn3d.halfBilayerSize);

          $("#" + me.pre + "extra_mem_z").val(me.icn3d.halfBilayerSize);
          $("#" + me.pre + "intra_mem_z").val(-me.icn3d.halfBilayerSize);

          me.icn3d.init(); // remove all previously loaded data
          me.loadPdbData(data, pdbid, undefined, chainCalphaHash);

          if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
      },
      error : function(xhr, textStatus, errorThrown ) {
        this.tryCount++;
        if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
        }

        me.loadPdbData(data, pdbid);
        if(me.deferredOpm !== undefined) me.deferredOpm.resolve();
        return;
      }
    });
};

iCn3DUI.prototype.loadPdbDataRender = function() {
    var me = this;

    me.pmid = me.icn3d.pmid;

    if(me.cfg.align === undefined && Object.keys(me.icn3d.structures).length == 1) {
        $("#" + me.pre + "alternateWrapper").hide();
    }

    me.icn3d.setAtomStyleByOptions(me.opts);
    me.icn3d.setColorByOptions(me.opts, me.icn3d.atoms);

    me.renderStructure();

    me.showTitle();

    if(me.cfg.rotate !== undefined) me.rotStruc(me.cfg.rotate, true);

    if(me.deferred !== undefined) me.deferred.resolve(); if(me.deferred2 !== undefined) me.deferred2.resolve();
};

/*
     cmp system***15.12.86***
     subroutine cmpcor to clc rmsd between structures
     xyz and abc (mclachlan a.d., jmb, 1979, v.128, p.49-79)

     n - no.of points
     mv=1 - without rot matrix clc, =0 with one
     xc,yc,zc and ac,bc,cc  - comparing coordinate' sets
     rmsd - value of difference between the sets
     rot  - rotation matrix for best coincidence a and b
            to rotate xyz set to abc set :

            ac'(i)=xc(i)*rot(1,1)+yc(i)*rot(1,2)+zc(i)*rot(1,3)
            bc'(i)=xc(i)*rot(2,1)+yc(i)*rot(2,2)+zc(i)*rot(2,3)
            cc'(i)=xc(i)*rot(3,1)+yc(i)*rot(3,2)+zc(i)*rot(3,3)

     ier = 0 - unique rot matrix
         = 1 - rot matrix has one degree  of freedom
         = 2 - rot matrix has two degrees of freedom
         =-1 - best fit is undefined
         =-2 - sqrt from negative rmsd squared

     subunits: eigen
     files: none
     funct.lib.: sqrt(real), abs(real)
*/

// Converted from Fortran code by Andrei Lomize, OPM at University of Michigan
iCn3DUI.prototype.cmpcor = function(n, coordsFrom, coordsTo, centerFrom, centerTo) { var me = this;
      var mv = 0;
      var rmsd,rot,ier;

      //dimension xc(300),yc(300),zc(300),ac(300),bc(300),cc(300)
      //var xc = [], yc = [], zc = [], ac = [], bc = [], cc = [];
      //dimension rot(3,3),u(3,3),omega(6,6),omgl(21),eigom(36),evecth(3,3),evectk(3,3),r1(3),r2(3),sgn(3)
      var dim = 3, dim2 = 6, dimx = 3 + 1, dim2x = 6 + 1;
      var rot = new Array(dimx), u = new Array(dimx), omega = new Array(dim2x);
      var omgl = new Array(21+1), eigom= new Array(36+1);
      var evecth = new Array(dimx), evectk = new Array(dimx);
      var r1 = new Array(dimx), r2 = new Array(dimx), sgn = new Array(dimx);
      for(var i = 0; i <= dim; ++i) {
          rot[i] = new Array(dimx);
          u[i] = new Array(dimx);
          evecth[i] = new Array(dimx);
          evectk[i] = new Array(dimx);
      }
      for(var i = 0; i <= dim2; ++i) {
          omega[i] = new Array(dim2x);
      }

      var epsi = 1.0e-04, twsqrt = 1.41421356;

      ier=0;
      rmsd=0.0;

      var fdiff=0.0;
      for(var i = 1; i <= n; ++i) {
        fdiff = fdiff
          + (coordsFrom[i].x - centerFrom.x)*(coordsFrom[i].x - centerFrom.x)
          + (coordsTo[i].x - centerTo.x)*(coordsTo[i].x - centerTo.x)
          + (coordsFrom[i].y - centerFrom.y)*(coordsFrom[i].y - centerFrom.y)
          + (coordsTo[i].y - centerTo.y)*(coordsTo[i].y - centerTo.y)
          + (coordsFrom[i].z - centerFrom.z)*(coordsFrom[i].z - centerFrom.z)
          + (coordsTo[i].z - centerTo.z)*(coordsTo[i].z - centerTo.z);
      }
      fdiff = fdiff /(2*n);

      for( var k=1; k <= dim; ++k) {
        for( var l=1; l <= dim; ++l) {
          u[k][l]=0.0;
        }
      }

      var dn=1.0/n;
      for(var i=1; i <= n; ++i) {
        r1[1]=coordsFrom[i].x - centerFrom.x;
        r1[2]=coordsFrom[i].y - centerFrom.y;
        r1[3]=coordsFrom[i].z - centerFrom.z;
        r2[1]=coordsTo[i].x - centerTo.x;
        r2[2]=coordsTo[i].y - centerTo.y;
        r2[3]=coordsTo[i].z - centerTo.z;

        for( var k=1; k <= dim; ++k) {
          for( var l=1; l <= dim; ++l) {
            u[k][l] = u[k][l] + r1[k]*r2[l]*dn;
          }
        }
      }

      var detu = u[1][1]*(u[2][2]*u[3][3] - u[2][3]*u[3][2]) + u[1][2]*(u[2][3]*u[3][1]-u[2][1]*u[3][3])
        + u[1][3]*(u[2][1]*u[3][2]-u[2][2]*u[3][1]);

      //if(detu == 0.0) {
      if(parseInt(1000000*detu) == 0) {
         ier=-1;
         return ier;
      }

      var sgndu = detu / Math.abs(detu);

      for( var i=1; i <= dim2; ++i) {
        for( var j=1; j <= dim2; ++j) {
          omega[i][j]=0.0;
        }
      }

      for( var k=1; k <= dim; ++k) {
        for( var l=1; l <= dim; ++l) {
          omega[k][l+3]=u[k][l];
        }
      }

      for( var j=1; j <= dim2; ++j) {
        for( var i=1; i <= j; ++i) {
          var ij=i+j*(j-1)/2;
          omgl[ij]=omega[i][j];
        }
      }

      me.eigen(omgl,eigom,6,mv);

      var rlamb1=omgl[1];
      var rlamb2=omgl[3];
      var rlamb3=omgl[6];

      var slamb;
      if(detu >= 0.0 || rlamb2 != rlamb3) {
          slamb=rlamb1+rlamb2+sgndu*rlamb3;
      }
      else if(rlamb1 != rlamb2) {
          ier=1;
          slamb=rlamb1;
      }
      else {
          ier=2;
          slamb=rlamb1;
      }

      rmsd=fdiff-slamb;
      if(rmsd >= 0.0) {
          rmsd=Math.sqrt(2.0*rmsd);
      }
      else if(rmsd+epsi < 0.0) {
          ier=-2;
          return ier;
      }
      else {
          rmsd=0.0;
          rmsd=Math.sqrt(2.0*rmsd);
      }

      //if(mv == 1) return false;

      for( var k=1; k <= dim; ++k) {
        for( var l=1; l <= dim; ++l) {
          var klh=6*(k-1)+l;
          var klk=klh+3;
          evecth[k][l]=twsqrt*eigom[klh];
          evectk[k][l]=twsqrt*eigom[klk];
        }
      }

      evecth[3][1]=evecth[1][2]*evecth[2][3]-evecth[1][3]*evecth[2][2];
      evecth[3][2]=evecth[1][3]*evecth[2][1]-evecth[1][1]*evecth[2][3];
      evecth[3][3]=evecth[1][1]*evecth[2][2]-evecth[1][2]*evecth[2][1];

      // change sign in k-vector if det u-matrix< 0

      var qf=1.0;
      if(sgndu < 0) qf=-1.0;

      evectk[3][1]=qf*(evectk[1][2]*evectk[2][3]-evectk[1][3]*evectk[2][2]);
      evectk[3][2]=qf*(evectk[1][3]*evectk[2][1]-evectk[1][1]*evectk[2][3]);
      evectk[3][3]=qf*(evectk[1][1]*evectk[2][2]-evectk[1][2]*evectk[2][1]);

      sgn[1]=1.0;
      sgn[2]=1.0;
      sgn[3]=sgndu;

      for( var k=1; k <= dim; ++k) {
        for( var l=1; l <= dim; ++l) {
          rot[k][l]=0;
        }
      }

      for( var k=1; k <= dim; ++k) {
        for( var l=1; l <= dim; ++l) {
          rot[k][l]=0.0;
          for( var m=1; m <= dim; ++m) {
            rot[k][l]=rot[k][l]+evectk[m][k]*evecth[m][l]*sgn[m];
          }
        }
      }

      return {'rmsd': rmsd, 'rot': rot, 'ier': ier};
};

iCn3DUI.prototype.eigen = function(a,r,n,mv) { var me = this;
//     --------------------------
//     general***15.12.86***  from ssp-1966
// !!! here a and r dimensioned as 21 and 36, respectively, n = 6, mv = 0

      //dimension a(21),r(36)

      if(mv-1 != 0) {
          var iq=-n;
          for(var j=1; j <= n; ++j) {
              iq=iq+n;
              for(var i=1; i <= n; ++i) {
                  var ij=iq+i;
                  r[ij]=0.0;

                  if(i-j == 0) {
                    r[ij]=1.0;
                  }
              }
          }
      }

      var anorm=0.0;

      for(var i=1; i <= n; ++i) {
          for(var j=1; j <= n; ++j) {
              if(i-j != 0) {
                  var ia=i+(j*j-j)/2;
                  anorm=anorm+a[ia]*a[ia];
              }
          }
      }

      if(anorm > 0) {
          anorm=1.414*Math.sqrt(anorm);
          var anrmx=anorm*1.0e-10/n;

          var ind=0;
          var thr=anorm;

          while(true) {
           thr=thr/n;
           while(true) {
              var l=1;
            while(true) {
              var m=l+1;
             while(true) {
              var mq=(m*m-m)/2;
              var lq=(l*l-l)/2;
              var lm=l+mq;
              if(Math.abs(a[lm])-thr >= 0) {
                  ind=1;
                  var ll=l+lq;
                  var mm=m+mq;
                  var x=0.5*(a[ll]-a[mm]);
                  var y=-a[lm]/Math.sqrt(a[lm]*a[lm]+x*x);
                  if(x < 0) {
                      y=-y;
                  }
                  var sinx=y/Math.sqrt(2.0*(1.0+(Math.sqrt(1.0-y*y))));
                  var sinx2=sinx*sinx;
                  var cosx=Math.sqrt(1.0-sinx2);
                  var cosx2=cosx*cosx;
                  var sincs=sinx*cosx;

                  var ilq=n*(l-1);
                  var imq=n*(m-1);
                  for(var i=1; i <= n; ++i) {
                      var iq=(i*i-i)/2;
                      if(i-l != 0) {
                          if(i-m != 0) {
                              var im;
                              if(i-m < 0) {
                                  im=i+mq;
                              }
                              else if(i-m > 0) {
                                  im=m+iq;
                              }

                              if(i-l < 0) {
                                  var il=i+lq;
                              }
                              else {
                                  var il=l+iq;
                              }

                              x=a[il]*cosx-a[im]*sinx;
                              a[im]=a[il]*sinx+a[im]*cosx;
                              a[il]=x;
                          }
                      }
                      if(mv-1 != 0) {
                          var ilr=ilq+i;
                          var imr=imq+i;
                          x=r[ilr]*cosx-r[imr]*sinx;
                          r[imr]=r[ilr]*sinx+r[imr]*cosx;
                          r[ilr]=x;
                      }
                  }
                  x=2.0*a[lm]*sincs;
                  y=a[ll]*cosx2+a[mm]*sinx2-x;
                  x=a[ll]*sinx2+a[mm]*cosx2+x;
                  a[lm]=(a[ll]-a[mm])*sincs+a[lm]*(cosx2-sinx2);
                  a[ll]=y;
                  a[mm]=x;
              }

              if(m-n != 0) {
                  m=m+1;
              }
              else {
                  break;
              }
             }

             if(l-(n-1) != 0) {
                  l=l+1;
             }
             else {
                  break;
             }
            }
            if(ind-1 == 0) {
                  ind=0;
            }
            else {
                  break;
            }
           }

           if(thr-anrmx <= 0) break;
          }
      }

      iq=-n;
      for(var i = 1; i <= n; ++i) {
          var iq=iq+n;
          var ll=i+(i*i-i)/2;
          var jq=n*(i-2);
          for(var j = 1; j <= n; ++j) {
              jq=jq+n;
              var mm=j+(j*j-j)/2;
              if(a[ll]-a[mm] < 0) {
                  var x=a[ll];
                  a[ll]=a[mm];
                  a[mm]=x;
                  if(mv-1 != 0) {
                      for(var k = 1; k <= n; ++k) {
                          var ilr=iq+k;
                          var imr=jq+k;
                          x=r[ilr];
                          r[ilr]=r[imr];
                          r[imr]=x;
                      }
                  }
              }
          }
      }
};
