/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */



// import {ParasCls} from './parasCls.js';

class UtilsCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;
    }

    //Determine whether the current browser is Internet Explorer.
    isIE() { let me = this.icn3dui;
        //http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery
        let ua = window.navigator.userAgent;
        let msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!window.navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
            return true;
        else                 // If another browser, return 0
            return false;
    }

    //Determine whether it is a mobile device.
    isMobile() { let me = this.icn3dui;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    }

    //Determine whether it is a Mac.
    isMac() { let me = this.icn3dui;
        return /Mac/i.test(window.navigator.userAgent);
    }

    isAndroid() { let me = this.icn3dui;
      return /android/i.test(window.navigator.userAgent.toLowerCase());
    }

    isChrome() { let me = this.icn3dui;
      return navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
    }

    //Determine whether Session Storage is supported in your browser. Session Storage is not supported in Safari.
    isSessionStorageSupported() { let me = this.icn3dui;
        return window.sessionStorage;
    }

    isLocalStorageSupported() { let me = this.icn3dui;
      return window.localStorage;
    }

    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    hexToRgb(hex, a) { let me = this.icn3dui;
         let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
         return result ? {
             r: parseInt(result[1], 16),
             g: parseInt(result[2], 16),
             b: parseInt(result[3], 16),
             a: a
         } : null;
    }

    //isCalphaPhosOnly(atomlist, atomname1, atomname2) {
    isCalphaPhosOnly(atomlist) { let me = this.icn3dui, ic = me.icn3d;
          let bCalphaPhosOnly = false;

          let index = 0, testLength = 100; //30
          //var bOtherAtoms = false;
          let nOtherAtoms = 0;
          for(let i in atomlist) {
            if(index < testLength) {
              let atomName = ic.atoms[i].name;   
              if(!atomName) continue;
              atomName = atomName.trim();

              if(atomName !== "CA" && atomName !== "P" && atomName !== "O3'" && atomName !== "O3*") {
                //bOtherAtoms = true;
                //break;
                ++nOtherAtoms;
              }
            }
            else {
              break;
            }

            ++index;
          }

          //if(!bOtherAtoms) {
          if(nOtherAtoms < 0.5 * index) {
            bCalphaPhosOnly = true;
          }

          return bCalphaPhosOnly;
    }

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Determine whether atom1 and atom2 have covalent bond.
    hasCovalentBond(atom0, atom1) { let me = this.icn3dui;
        let r = me.parasCls.covalentRadii[atom0.elem.toUpperCase()] + me.parasCls.covalentRadii[atom1.elem.toUpperCase()];

        //return atom0.coord.distanceToSquared(atom1.coord) < 1.3 * r * r;
        let dx = atom0.coord.x - atom1.coord.x;
        let dy = atom0.coord.y - atom1.coord.y;
        let dz = atom0.coord.z - atom1.coord.z;
        let distSq = dx*dx + dy*dy + dz*dz;

        // r(N) = 0.71, r(H) = 0.31, N-H in residues are about 1.5
        // factor = (1.5 / 1.02) * (1.5 / 1.02) = 2.16
        let factor = ((atom0.elem == 'N' && atom1.elem.substr(0,1) == 'H') || (atom1.elem == 'N' && atom0.elem.substr(0,1) == 'H')) ? 2.2 : 1.3;

        return distSq < factor * r * r;
    }

    //Convert a three-letter residue name to a one-letter residue abbreviation, e.g., 'LYS' to 'K', or ' A' to 'A' for nucleotides.
    residueName2Abbr(residueName) { let me = this.icn3dui;
      let pos = residueName.indexOf(' ');
      if(pos > 0) {
          residueName = residueName.substr(0, pos);
      }

      switch(residueName) {
        case '  A':
          return 'A';
          break;
        case '  C':
          return 'C';
          break;
        case '  G':
          return 'G';
          break;
        case '  T':
          return 'T';
          break;
        case '  U':
          return 'U';
          break;
        case '  I':
          return 'I';
          break;
        case ' DA':
          return 'A';
          break;
        case ' DC':
          return 'C';
          break;
        case ' DG':
          return 'G';
          break;
        case ' DT':
          return 'T';
          break;
        case ' DU':
          return 'U';
          break;
        case ' DI':
          return 'I';
          break;
        case 'DA':
          return 'A';
          break;
        case 'DC':
          return 'C';
          break;
        case 'DG':
          return 'G';
          break;
        case 'DT':
          return 'T';
          break;
        case 'DU':
          return 'U';
          break;
        case 'DI':
          return 'I';
          break;
        case 'ALA':
          return 'A';
          break;
        case 'ARG':
          return 'R';
          break;
        case 'ASN':
          return 'N';
          break;
        case 'ASP':
          return 'D';
          break;
        case 'CYS':
          return 'C';
          break;
        case 'GLU':
          return 'E';
          break;
        case 'GLN':
          return 'Q';
          break;
        case 'GLY':
          return 'G';
          break;
        case 'HIS':
          return 'H';
          break;
        case 'ILE':
          return 'I';
          break;
        case 'LEU':
          return 'L';
          break;
        case 'LYS':
          return 'K';
          break;
        case 'MET':
          return 'M';
          break;
        case 'PHE':
          return 'F';
          break;
        case 'PRO':
          return 'P';
          break;
        case 'SER':
          return 'S';
          break;
        case 'THR':
          return 'T';
          break;
        case 'TRP':
          return 'W';
          break;
        case 'TYR':
          return 'Y';
          break;
        case 'VAL':
          return 'V';
          break;
        case 'SEC':
          return 'U';
          break;
    //        case 'PYL':
    //          return 'O';
    //          break;

        case 'HOH':
          return 'O';
          break;
        case 'WAT':
          return 'O';
          break;

        default:
          return residueName.trim();
      }
    }

    residueAbbr2Name(residueAbbr) { let me = this.icn3dui;
      residueAbbr = residueAbbr.toUpperCase();

      if(residueAbbr.length > 1) {
          return residueAbbr;
      }

      switch(residueAbbr) {
        case 'A':
          return 'ALA';
          break;
        case 'R':
          return 'ARG';
          break;
        case 'N':
          return 'ASN';
          break;
        case 'D':
          return 'ASP';
          break;
        case 'C':
          return 'CYS';
          break;
        case 'E':
          return 'GLU';
          break;
        case 'Q':
          return 'GLN';
          break;
        case 'G':
          return 'GLY';
          break;
        case 'H':
          return 'HIS';
          break;
        case 'I':
          return 'ILE';
          break;
        case 'L':
          return 'LEU';
          break;
        case 'K':
          return 'LYS';
          break;
        case 'M':
          return 'MET';
          break;
        case 'F':
          return 'PHE';
          break;
        case 'P':
          return 'PRO';
          break;
        case 'S':
          return 'SER';
          break;
        case 'T':
          return 'THR';
          break;
        case 'W':
          return 'TRP';
          break;
        case 'Y':
          return 'TYR';
          break;
        case 'V':
          return 'VAL';
          break;
        case 'O':
          return 'HOH';
          break;

        default:
          return residueAbbr.trim();
      }
    }

    getJSONFromArray(inArray) { let me = this.icn3dui;
        let jsonStr = '';
        for(let i = 0, il= inArray.length; i < il; ++i) {
            jsonStr += JSON.stringify(inArray[i]);
            if(i != il - 1) jsonStr += ', ';
        }
        return jsonStr;
    }

    checkFileAPI() { let me = this.icn3dui;
         if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
         }
    }

    getIdArray(resid) { let me = this.icn3dui;
        //var idArray = resid.split('_');
        let idArray = [];

        if(resid) {
            let pos1 = resid.indexOf('_');
            let pos2 = resid.lastIndexOf('_');
            idArray.push(resid.substr(0, pos1));
            idArray.push(resid.substr(pos1 + 1, pos2 - pos1 - 1));
            idArray.push(resid.substr(pos2 + 1));
        }

        return idArray;
    }

    compResid(a, b, type) { let me = this.icn3dui;
      let aArray = a.split(',');
      let bArray = b.split(',');
      let aIdArray, bIdArray;
      if(type == 'save1') {
        aIdArray = me.utilsCls.getIdArray(aArray[0]); //aArray[0].split('_');
        bIdArray = me.utilsCls.getIdArray(bArray[0]); //bArray[0].split('_');
      }
      else if(type == 'save2') {
        aIdArray = me.utilsCls.getIdArray(aArray[1]); //aArray[1].split('_');
        bIdArray = me.utilsCls.getIdArray(bArray[1]); //bArray[1].split('_');
      }
      let aChainid = aIdArray[0] + '_' + aIdArray[1];
      let bChainid = bIdArray[0] + '_' + bIdArray[1];
      let aResi = parseInt(aIdArray[2]);
      let bResi = parseInt(bIdArray[2]);
      if(aChainid > bChainid){
        return 1;
      }
      else if(aChainid < bChainid){
        return -1;
      }
      else if(aChainid == bChainid){
        return(aResi > bResi) ? 1 :(aResi < bResi) ? -1 : 0;
      }
    }

    toggle(id1, id2, id3, id4) { let me = this.icn3dui;
      let itemArray = [id1, id2];
      for(let i in itemArray) {
          let item = itemArray[i];
          $("#" + item).toggleClass('ui-icon-plus');
          $("#" + item).toggleClass('ui-icon-minus');
      }

      itemArray = [id1, id2, id3, id4];
      for(let i in itemArray) {
          let item = itemArray[i];
          $("#" + item).toggleClass('icn3d-shown');
          $("#" + item).toggleClass('icn3d-hidden');
      }
    }

    setViewerWidthHeight(me, bRealSize) { //let me = this.icn3dui;
        if(me.bNode) {
            me.htmlCls.WIDTH = 400;
            me.htmlCls.HEIGHT = 400;
            return;
        }

        me.htmlCls.WIDTH = $( window ).width() - me.htmlCls.LESSWIDTH;
        me.htmlCls.HEIGHT = $( window ).height() - me.htmlCls.EXTRAHEIGHT - me.htmlCls.LESSHEIGHT;

        // width from css
        let viewer_width, viewer_height;

        if(!bRealSize && me.oriWidth !== undefined && me.cfg.width.toString().indexOf('%') === -1) {
            viewer_width = me.oriWidth;
            viewer_height = me.oriHeight;
        }
        else {
            // css width and height with the unit "px"
            viewer_width = $( "#" + me.pre + "viewer" ).css('width');
            viewer_height = $( "#" + me.pre + "viewer" ).css('height');

            viewer_width = (viewer_width) ? viewer_width.replace(/px/g, '') : me.htmlCls.WIDTH;
            viewer_height = (viewer_height) ? viewer_height.replace(/px/g, '') : me.htmlCls.HEIGHT;

            if(!bRealSize) {
                // width and height from input parameter
                if(me.cfg.width.toString().indexOf('%') !== -1) {
                  viewer_width = $( window ).width() * me.cfg.width.substr(0, me.cfg.width.toString().indexOf('%')) / 100.0 - me.htmlCls.LESSWIDTH;
                }
                else if(me.cfg.width) {
                  viewer_width = parseInt(me.cfg.width);
                }

                if(me.cfg.height.toString().indexOf('%') !== -1) {
                  viewer_height = $( window ).height() * me.cfg.height.substr(0, me.cfg.height.toString().indexOf('%')) / 100.0 - me.htmlCls.EXTRAHEIGHT - me.htmlCls.LESSHEIGHT;
                }
                else if(me.cfg.height) {
                  viewer_height = parseInt(me.cfg.height);
                }
            }
        }

        if(viewer_width && me.htmlCls.WIDTH > viewer_width) me.htmlCls.WIDTH = viewer_width;
        if(viewer_height && me.htmlCls.HEIGHT > viewer_height) me.htmlCls.HEIGHT = viewer_height;
    }

    sumArray(numArray) {
      let sum = 0;

      for(let i = 0, il = numArray.length; i < il; ++i) {
        sum += numArray[i];
      }

      return sum;
    }

    getMemDesc() {
      return "<div style='width:150px'><span style='color:red'>Red</span> and <span style='color:blue'>blue</span> membranes indicate <span style='color:red'>extracellular</span> and <span style='color:blue'>intracellular</span> membranes, respectively.<br><br></div>";
    }

    getStructures(atoms) { let me = this.icn3dui;
      let idHash = {};
      for(let i in atoms) {
          let structureid = me.icn3d.atoms[i].structure;
          idHash[structureid] = 1;
      }

      return idHash;
    }

    getHlStructures(atoms) { let me = this.icn3dui;
      if(!atoms) atoms = me.icn3d.hAtoms;

      return this.getStructures(atoms);
    }

    getDisplayedStructures(atoms) { let me = this.icn3dui;
      if(!atoms) atoms = me.icn3d.dAtoms;

      return this.getStructures(atoms);
    }

    getDateDigitStr() { let me = this.icn3dui;
      let date = new Date();
      let monthStr =(date.getMonth() + 1).toString();
      if(date.getMonth() + 1 < 10) monthStr = '0' + monthStr;

      let dateStr = date.getDate().toString();
      if(date.getDate() < 10) dateStr = '0' + dateStr;

      return date.getFullYear().toString() + monthStr + dateStr;
    }
}

export {UtilsCls}

