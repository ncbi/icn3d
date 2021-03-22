/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.residueAbbr2Name = function(residueAbbr) { var me = this, ic = me.icn3d; "use strict";
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
};
