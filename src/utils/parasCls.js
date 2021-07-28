/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

class ParasCls {
    constructor(icn3dui) {
        this.icn3dui = icn3dui;

        // https://pubs.acs.org/doi/pdf/10.1021/acs.jproteome.8b00473
        this.glycanHash = {
            'GLC': {'c': '1E90FF', 's': 'sphere'},
            'BGC': {'c': '1E90FF', 's': 'sphere'},

            'NAG': {'c': '1E90FF', 's': 'cube'},
            'NDG': {'c': '1E90FF', 's': 'cube'},
            'GCS': {'c': '1E90FF', 's': 'cube'},
            'PA1': {'c': '1E90FF', 's': 'cube'},

            'GCU': {'c': '1E90FF', 's': 'cone'},
            'BDP': {'c': '1E90FF', 's': 'cone'},
            'G6D': {'c': '1E90FF', 's': 'cone'},

            'DDA': {'c': '1E90FF', 's': 'cylinder'},
            'B6D': {'c': '1E90FF', 's': 'cylinder'},
            'XXM': {'c': '1E90FF', 's': 'cylinder'},


            'MAN': {'c': '00FF00', 's': 'sphere'},
            'BMA': {'c': '00FF00', 's': 'sphere'},

            'BM3': {'c': '00FF00', 's': 'cube'},
            '95Z': {'c': '00FF00', 's': 'cube'},

            'MAV': {'c': '00FF00', 's': 'cone'},
            'BEM': {'c': '00FF00', 's': 'cone'},
            'RAM': {'c': '00FF00', 's': 'cone'},
            'RM4': {'c': '00FF00', 's': 'cone'},

            'TYV': {'c': '00FF00', 's': 'cylinder'},
            'ARA': {'c': '00FF00', 's': 'cylinder'},
            'ARB': {'c': '00FF00', 's': 'cylinder'},
            'KDN': {'c': '00FF00', 's': 'cylinder'},
            'KDM': {'c': '00FF00', 's': 'cylinder'},
            '6PZ': {'c': '00FF00', 's': 'cylinder'},
            'GMH': {'c': '00FF00', 's': 'cylinder'},
            'BDF': {'c': '00FF00', 's': 'cylinder'},


            'GAL': {'c': 'FFFF00', 's': 'sphere'},
            'GLA': {'c': 'FFFF00', 's': 'sphere'},

            'NGA': {'c': 'FFFF00', 's': 'cube'},
            'A2G': {'c': 'FFFF00', 's': 'cube'},
            'X6X': {'c': 'FFFF00', 's': 'cube'},
            '1GN': {'c': 'FFFF00', 's': 'cube'},

            'ADA': {'c': 'FFFF00', 's': 'cone'},
            'GTR': {'c': 'FFFF00', 's': 'cone'},

            'LDY': {'c': 'FFFF00', 's': 'cylinder'},
            'KDO': {'c': 'FFFF00', 's': 'cylinder'},
            'T6T': {'c': 'FFFF00', 's': 'cylinder'},


            'GUP': {'c': 'A52A2A', 's': 'sphere'},
            'GL0': {'c': 'A52A2A', 's': 'sphere'},

            'LGU': {'c': 'A52A2A', 's': 'cone'},

            'ABE': {'c': 'A52A2A', 's': 'cylinder'},
            'XYS': {'c': 'A52A2A', 's': 'cylinder'},
            'XYP': {'c': 'A52A2A', 's': 'cylinder'},
            'SOE': {'c': 'A52A2A', 's': 'cylinder'},


            'PZU': {'c': 'FF69B4', 's': 'cylinder'},
            'RIP': {'c': 'FF69B4', 's': 'cylinder'},
            '0MK': {'c': 'FF69B4', 's': 'cylinder'},


            'ALL': {'c': '8A2BE2', 's': 'sphere'},
            'AFD': {'c': '8A2BE2', 's': 'sphere'},

            'NAA': {'c': '8A2BE2', 's': 'cube'},

            'SIA': {'c': '8A2BE2', 's': 'cylinder'},
            'SIB': {'c': '8A2BE2', 's': 'cylinder'},
            'AMU': {'c': '8A2BE2', 's': 'cylinder'},


            'X0X': {'c': '1E90FF', 's': 'cone'},
            'X1X': {'c': '1E90FF', 's': 'cone'},

            'NGC': {'c': '1E90FF', 's': 'cylinder'},
            'NGE': {'c': '1E90FF', 's': 'cylinder'},


            '4N2': {'c': 'A0522D', 's': 'sphere'},

            'HSQ': {'c': 'A0522D', 's': 'cube'},

            'IDR': {'c': 'A0522D', 's': 'cone'},

            'MUR': {'c': 'A0522D', 's': 'cylinder'},


            'FUC': {'c': 'FF0000', 's': 'cone'},
            'FUL': {'c': 'FF0000', 's': 'cone'}
        };

        // added nucleotides and ions
        this.nucleotidesArray = ['  G', '  A', '  T', '  C', '  U', ' DG', ' DA', ' DT', ' DC', ' DU',
            'G', 'A', 'T', 'C', 'U', 'DG', 'DA', 'DT', 'DC', 'DU'];

        this.ionsArray = ['  K', ' NA', ' MG', ' AL', ' CA', ' TI', ' MN', ' FE', ' NI', ' CU', ' ZN', ' AG', ' BA',
            '  F', ' CL', ' BR', '  I', 'K', 'NA', 'MG', 'AL', 'CA', 'TI', 'MN', 'FE', 'NI', 'CU', 'ZN', 'AG', 'BA',
            'F', 'CL', 'BR', 'I'];

        this.cationsTrimArray = ['K', 'NA', 'MG', 'AL', 'CA', 'TI', 'MN', 'FE', 'NI', 'CU', 'ZN', 'AG', 'BA'];
        this.anionsTrimArray = ['F', 'CL', 'BR', 'I'];

        this.ionCharges = {K: 1, NA: 1, MG: 2, AL: 3, CA: 2, TI: 3, MN: 2, FE: 3, NI: 2, CU: 2, ZN: 2, AG: 1, BA: 2};

        this.vdwRadii = { // Hu, S.Z.; Zhou, Z.H.; Tsai, K.R. Acta Phys.-Chim. Sin., 2003, 19:1073.
             H: 1.08,           HE: 1.34,           LI: 1.75,           BE: 2.05,            B: 1.47,
             C: 1.49,            N: 1.41,            O: 1.40,            F: 1.39,           NE: 1.68,
             NA: 1.84,          MG: 2.05,           AL: 2.11,           SI: 2.07,            P: 1.92,
             S: 1.82,           CL: 1.83,           AR: 1.93,            K: 2.05,           CA: 2.21,
             SC: 2.16,          TI: 1.87,            V: 1.79,           CR: 1.89,           MN: 1.97,
             FE: 1.94,          CO: 1.92,           NI: 1.84,           CU: 1.86,           ZN: 2.10,
             GA: 2.08,          GE: 2.15,           AS: 2.06,           SE: 1.93,           BR: 1.98,
             KR: 2.12,          RB: 2.16,           SR: 2.24,            Y: 2.19,           ZR: 1.86,
             NB: 2.07,          MO: 2.09,           TC: 2.09,           RU: 2.07,           RH: 1.95,
             PD: 2.02,          AG: 2.03,           CD: 2.30,           IN: 2.36,           SN: 2.33,
             SB: 2.25,          TE: 2.23,            I: 2.23,           XE: 2.21,           CS: 2.22,
             BA: 2.51,          LA: 2.40,           CE: 2.35,           PR: 2.39,           ND: 2.29,
             PM: 2.36,          SM: 2.29,           EU: 2.33,           GD: 2.37,           TB: 2.21,
             DY: 2.29,          HO: 2.16,           ER: 2.35,           TM: 2.27,           YB: 2.42,
             LU: 2.21,          HF: 2.12,           TA: 2.17,            W: 2.10,           RE: 2.17,
             OS: 2.16,          IR: 2.02,           PT: 2.09,           AU: 2.17,           HG: 2.09,
             TL: 2.35,          PB: 2.32,           BI: 2.43,           PO: 2.29,           AT: 2.36,
             RN: 2.43,          FR: 2.56,           RA: 2.43,           AC: 2.60,           TH: 2.37,
             PA: 2.43,           U: 2.40,           NP: 2.21,           PU: 2.56,           AM: 2.56,
             CM: 2.56,          BK: 2.56,           CF: 2.56,           ES: 2.56,           FM: 2.56
        };

        this.covalentRadii = { // http://en.wikipedia.org/wiki/Covalent_radius
             H: 0.31,           HE: 0.28,           LI: 1.28,           BE: 0.96,            B: 0.84,
             C: 0.76,            N: 0.71,            O: 0.66,            F: 0.57,           NE: 0.58,
             NA: 1.66,          MG: 1.41,           AL: 1.21,           SI: 1.11,            P: 1.07,
             S: 1.05,           CL: 1.02,           AR: 1.06,            K: 2.03,           CA: 1.76,
             SC: 1.70,          TI: 1.60,            V: 1.53,           CR: 1.39,           MN: 1.39,
             FE: 1.32,          CO: 1.26,           NI: 1.24,           CU: 1.32,           ZN: 1.22,
             GA: 1.22,          GE: 1.20,           AS: 1.19,           SE: 1.20,           BR: 1.20,
             KR: 1.16,          RB: 2.20,           SR: 1.95,            Y: 1.90,           ZR: 1.75,
             NB: 1.64,          MO: 1.54,           TC: 1.47,           RU: 1.46,           RH: 1.42,
             PD: 1.39,          AG: 1.45,           CD: 1.44,           IN: 1.42,           SN: 1.39,
             SB: 1.39,          TE: 1.38,            I: 1.39,           XE: 1.40,           CS: 2.44,
             BA: 2.15,          LA: 2.07,           CE: 2.04,           PR: 2.03,           ND: 2.01,
             PM: 1.99,          SM: 1.98,           EU: 1.98,           GD: 1.96,           TB: 1.94,
             DY: 1.92,          HO: 1.92,           ER: 1.89,           TM: 1.90,           YB: 1.87,
             LU: 1.87,          HF: 1.75,           TA: 1.70,            W: 1.62,           RE: 1.51,
             OS: 1.44,          IR: 1.41,           PT: 1.36,           AU: 1.36,           HG: 1.32,
             TL: 1.45,          PB: 1.46,           BI: 1.48,           PO: 1.40,           AT: 1.50,
             RN: 1.50,          FR: 2.60,           RA: 2.21,           AC: 2.15,           TH: 2.06,
             PA: 2.00,           U: 1.96,           NP: 1.90,           PU: 1.87,           AM: 1.80,
             CM: 1.69
        };

    /*
        this.surfaces = {
            1: undefined,
            2: undefined,
            3: undefined,
            4: undefined
        };
    */

        this.atomColors = {
            'H': this.thr(0xFFFFFF),       'He': this.thr(0xFFC0CB),      'HE': this.thr(0xFFC0CB),
            'Li': this.thr(0xB22222),      'LI': this.thr(0xB22222),      'B': this.thr(0x00FF00),
            'C': this.thr(0xC8C8C8),       'N': this.thr(0x0000FF),       'O': this.thr(0xF00000),
            'F': this.thr(0xDAA520),       'Na': this.thr(0x0000FF),      'NA': this.thr(0x0000FF),
            'Mg': this.thr(0x228B22),      'MG': this.thr(0x228B22),      'Al': this.thr(0x808090),
            'AL': this.thr(0x808090),      'Si': this.thr(0xDAA520),      'SI': this.thr(0xDAA520),
            'P': this.thr(0xFFA500),       'S': this.thr(0xFFC832),       'Cl': this.thr(0x00FF00),
            'CL': this.thr(0x00FF00),      'Ca': this.thr(0x808090),      'CA': this.thr(0x808090),
            'Ti': this.thr(0x808090),      'TI': this.thr(0x808090),      'Cr': this.thr(0x808090),
            'CR': this.thr(0x808090),      'Mn': this.thr(0x808090),      'MN': this.thr(0x808090),
            'Fe': this.thr(0xFFA500),      'FE': this.thr(0xFFA500),      'Ni': this.thr(0xA52A2A),
            'NI': this.thr(0xA52A2A),      'Cu': this.thr(0xA52A2A),      'CU': this.thr(0xA52A2A),
            'Zn': this.thr(0xA52A2A),      'ZN': this.thr(0xA52A2A),      'Br': this.thr(0xA52A2A),
            'BR': this.thr(0xA52A2A),      'Ag': this.thr(0x808090),      'AG': this.thr(0x808090),
            'I': this.thr(0xA020F0),       'Ba': this.thr(0xFFA500),      'BA': this.thr(0xFFA500),
            'Au': this.thr(0xDAA520),      'AU': this.thr(0xDAA520)
        };

        this.defaultAtomColor = this.thr(0xCCCCCC);

        this.stdChainColors = [
            // first 6 colors from MMDB
            this.thr(0xFF00FF),            this.thr(0x0000FF),            this.thr(0x996633),
            this.thr(0x00FF99),            this.thr(0xFF9900),            this.thr(0xFF6666),
            this.thr(0x32CD32),            this.thr(0x1E90FF),            this.thr(0xFA8072),
            this.thr(0xFFA500),            this.thr(0x00CED1),            this.thr(0xFF69B4),
            this.thr(0x00FF00),            this.thr(0x0000FF),            this.thr(0xFF0000),
            this.thr(0xFFFF00),            this.thr(0x00FFFF),            this.thr(0xFF00FF),
            this.thr(0x3CB371),            this.thr(0x4682B4),            this.thr(0xCD5C5C),
            this.thr(0xFFE4B5),            this.thr(0xAFEEEE),            this.thr(0xEE82EE),
            this.thr(0x006400),            this.thr(0x00008B),            this.thr(0x8B0000),
            this.thr(0xCD853F),            this.thr(0x008B8B),            this.thr(0x9400D3)
        ];

        this.backgroundColors = {
            black: this.thr(0x000000),
             grey: this.thr(0xCCCCCC),
            white: this.thr(0xFFFFFF),
            transparent: this.thr(0x000000)
        };

        this.residueColors = {
            ALA: this.thr(0xC8C8C8),       ARG: this.thr(0x145AFF),       ASN: this.thr(0x00DCDC),
            ASP: this.thr(0xE60A0A),       CYS: this.thr(0xE6E600),       GLN: this.thr(0x00DCDC),
            GLU: this.thr(0xE60A0A),       GLY: this.thr(0xEBEBEB),       HIS: this.thr(0x8282D2),
            ILE: this.thr(0x0F820F),       LEU: this.thr(0x0F820F),       LYS: this.thr(0x145AFF),
            MET: this.thr(0xE6E600),       PHE: this.thr(0x3232AA),       PRO: this.thr(0xDC9682),
            SER: this.thr(0xFA9600),       THR: this.thr(0xFA9600),       TRP: this.thr(0xB45AB4),
            TYR: this.thr(0x3232AA),       VAL: this.thr(0x0F820F),       ASX: this.thr(0xFF69B4),
            GLX: this.thr(0xFF69B4),         'G': this.thr(0x008000),       'A': this.thr(0x6080FF),
            'T': this.thr(0xFF8000),         'C': this.thr(0xFF0000),       'U': this.thr(0xFF8000),
            'DG': this.thr(0x008000),       'DA': this.thr(0x6080FF),      'DT': this.thr(0xFF8000),
            'DC': this.thr(0xFF0000),       'DU': this.thr(0xFF8000)
        };

        // calculated in iCn3D, the value could fluctuate 10-20 in different proteins
        this.residueArea = {
            ALA: 247,       ARG: 366,       ASN: 290,       ASP: 285,       CYS: 271,
            GLN: 336,       GLU: 325,       GLY: 217,       HIS: 340,       ILE: 324,
            LEU: 328,       LYS: 373,       MET: 346,       PHE: 366,       PRO: 285,
            SER: 265,       THR: 288,       TRP: 414,       TYR: 387,       VAL: 293,
            ASX: 290,       GLX: 336,         'G': 520,       'A': 507,       'T': 515,
            'C': 467,         'U': 482,      'DG': 520,      'DA': 507,      'DT': 515,
            'DC': 467,       'DU': 482
        };

        this.defaultResidueColor = this.thr(0xBEA06E);

        this.chargeColors = {
            // charged residues
            '  G': this.thr(0xFF0000),     '  A': this.thr(0xFF0000),     '  T': this.thr(0xFF0000),
            '  C': this.thr(0xFF0000),     '  U': this.thr(0xFF0000),     ' DG': this.thr(0xFF0000),
            ' DA': this.thr(0xFF0000),     ' DT': this.thr(0xFF0000),     ' DC': this.thr(0xFF0000),
            ' DU': this.thr(0xFF0000),       'G': this.thr(0xFF0000),       'A': this.thr(0xFF0000),
            'T': this.thr(0xFF0000),         'C': this.thr(0xFF0000),       'U': this.thr(0xFF0000),
            'DG': this.thr(0xFF0000),       'DA': this.thr(0xFF0000),      'DT': this.thr(0xFF0000),
            'DC': this.thr(0xFF0000),       'DU': this.thr(0xFF0000),     'ARG': this.thr(0x0000FF),
            'LYS': this.thr(0x0000FF),     'ASP': this.thr(0xFF0000),     'GLU': this.thr(0xFF0000),
            'HIS': this.thr(0x8080FF),     'GLY': this.thr(0x888888),     'PRO': this.thr(0x888888),
            'ALA': this.thr(0x888888),     'VAL': this.thr(0x888888),     'LEU': this.thr(0x888888),
            'ILE': this.thr(0x888888),     'PHE': this.thr(0x888888),     'SER': this.thr(0x888888),
            'THR': this.thr(0x888888),     'ASN': this.thr(0x888888),     'GLN': this.thr(0x888888),
            'TYR': this.thr(0x888888),     'MET': this.thr(0x888888),     'CYS': this.thr(0x888888),
            'TRP': this.thr(0x888888)
        };

        this.hydrophobicColors = {
            // charged residues
            '  G': this.thr(0xFF0000),     '  A': this.thr(0xFF0000),     '  T': this.thr(0xFF0000),
            '  C': this.thr(0xFF0000),     '  U': this.thr(0xFF0000),     ' DG': this.thr(0xFF0000),
            ' DA': this.thr(0xFF0000),     ' DT': this.thr(0xFF0000),     ' DC': this.thr(0xFF0000),
            ' DU': this.thr(0xFF0000),       'G': this.thr(0xFF0000),       'A': this.thr(0xFF0000),
            'T': this.thr(0xFF0000),         'C': this.thr(0xFF0000),       'U': this.thr(0xFF0000),
            'DG': this.thr(0xFF0000),       'DA': this.thr(0xFF0000),      'DT': this.thr(0xFF0000),
            'DC': this.thr(0xFF0000),       'DU': this.thr(0xFF0000),     'ARG': this.thr(0x0000FF),
            'LYS': this.thr(0x0000FF),     'ASP': this.thr(0xFF0000),     'GLU': this.thr(0xFF0000),
            'HIS': this.thr(0x8080FF),

            //this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * ( + 0.81)/(1.14 + 0.81)),
            // hydrophobic
            // https://en.m.wikipedia.org/wiki/Hydrophobicity_scales#Wimley%E2%80%93White_whole_residue_hydrophobicity_scales
            'TRP': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-1.85 + 1.85)/(0 + 1.85)),
            'PHE': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-1.13 + 1.85)/(0 + 1.85)),
            'TYR': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-0.94 + 1.85)/(0 + 1.85)),
            'LEU': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-0.56 + 1.85)/(0 + 1.85)),
            'ILE': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-0.31 + 1.85)/(0 + 1.85)),
            'CYS': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-0.24 + 1.85)/(0 + 1.85)),
            'MET': this.thr().setHSL(1/3.0, 1, 0.5 + 0.5 * (-0.23 + 1.85)/(0 + 1.85)),

            // polar
            'GLY': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.01 + 0.58)/(0 + 0.58)),
            'VAL': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.07 + 0.58)/(0 + 0.58)),
            'SER': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.13 + 0.58)/(0 + 0.58)),
            'THR': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.14 + 0.58)/(0 + 0.58)),
            'ALA': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.17 + 0.58)/(0 + 0.58)),
            'ASN': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.42 + 0.58)/(0 + 0.58)),
            'PRO': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.45 + 0.58)/(0 + 0.58)),
            'GLN': this.thr().setHSL(1/6.0, 1, 0.5 + 0.5 * (-0.58 + 0.58)/(0 + 0.58))
        };

        this.ssColors = {
            helix: this.thr(0xFF0000),
            sheet: this.thr(0x008000),
             coil: this.thr(0x6080FF) //this.thr(0xEEEEEE) //this.thr(0x6080FF)
        };

        this.ssColors2 = {
            helix: this.thr(0xFF0000),
            sheet: this.thr(0xFFC800),
             coil: this.thr(0x6080FF) //this.thr(0xEEEEEE) //this.thr(0x6080FF)
        };

        // https://www.ncbi.nlm.nih.gov/Class/FieldGuide/BLOSUM62.txt, range from -4 to 11
        this.b62ResArray = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M', 'F',
            'P', 'S', 'T', 'W', 'Y', 'V', 'B', 'Z', 'X', '*']; // length: 24
        this.b62Matrix = [
            [4, -1, -2, -2, 0, -1, -1, 0, -2, -1, -1, -1, -1, -2, -1, 1, 0, -3, -2, 0, -2, -1, 0, -4],
            [-1, 5, 0, -2, -3, 1, 0, -2, 0, -3, -2, 2, -1, -3, -2, -1, -1, -3, -2, -3, -1, 0, -1, -4],
            [-2, 0, 6, 1, -3, 0, 0, 0, 1, -3, -3, 0, -2, -3, -2, 1, 0, -4, -2, -3, 3, 0, -1, -4],
            [-2, -2, 1, 6, -3, 0, 2, -1, -1, -3, -4, -1, -3, -3, -1, 0, -1, -4, -3, -3, 4, 1, -1, -4],
            [0, -3, -3, -3, 9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1, -3, -3, -2, -4],
            [-1, 1, 0, 0, -3, 5, 2, -2, 0, -3, -2, 1, 0, -3, -1, 0, -1, -2, -1, -2, 0, 3, -1, -4],
            [-1, 0, 0, 2, -4, 2, 5, -2, 0, -3, -3, 1, -2, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1, -4],
            [0, -2, 0, -1, -3, -2, -2, 6, -2, -4, -4, -2, -3, -3, -2, 0, -2, -2, -3, -3, -1, -2, -1, -4],
            [-2, 0, 1, -1, -3, 0, 0, -2, 8, -3, -3, -1, -2, -1, -2, -1, -2, -2, 2, -3, 0, 0, -1, -4],
            [-1, -3, -3, -3, -1, -3, -3, -4, -3, 4, 2, -3, 1, 0, -3, -2, -1, -3, -1, 3, -3, -3, -1, -4],
            [-1, -2, -3, -4, -1, -2, -3, -4, -3, 2, 4, -2, 2, 0, -3, -2, -1, -2, -1, 1, -4, -3, -1, -4],
            [-1, 2, 0, -1, -3, 1, 1, -2, -1, -3, -2, 5, -1, -3, -1, 0, -1, -3, -2, -2, 0, 1, -1, -4],
            [-1, -1, -2, -3, -1, 0, -2, -3, -2, 1, 2, -1, 5, 0, -2, -1, -1, -1, -1, 1, -3, -1, -1, -4],
            [-2, -3, -3, -3, -2, -3, -3, -3, -1, 0, 0, -3, 0, 6, -4, -2, -2, 1, 3, -1, -3, -3, -1, -4],
            [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4, 7, -1, -1, -4, -3, -2, -2, -1, -2, -4],
            [1, -1, 1, 0, -1, 0, 0, 0, -1, -2, -2, 0, -1, -2, -1, 4, 1, -3, -2, -2, 0, 0, 0, -4],
            [0, -1, 0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1, 1, 5, -2, -2, 0, -1, -1, 0, -4],
            [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1, 1, -4, -3, -2, 11, 2, -3, -4, -3, -2, -4],
            [-2, -2, -2, -3, -2, -1, -2, -3, 2, -1, -1, -2, -1, 3, -3, -2, -2, 2, 7, -1, -3, -2, -1, -4],
            [0, -3, -3, -3, -1, -2, -2, -3, -3, 3, 1, -2, 1, -1, -2, -2, 0, -3, -1, 4, -3, -2, -1, -4],
            [-2, -1, 3, 4, -3, 0, 1, -1, 0, -3, -4, 0, -3, -3, -2, 0, -1, -4, -3, -3, 4, 1, -1, -4],
            [-1, 0, 0, 1, -3, 3, 4, -2, 0, -3, -3, 1, -1, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1, -4],
            [0, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2, 0, 0, -2, -1, -1, -1, -1, -1, -4],
            [-4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, 1],
        ];
    }

    thr(color) { let me = this.icn3dui;
        return new THREE.Color(color);
    }
}

export {ParasCls}

