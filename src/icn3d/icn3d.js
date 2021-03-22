/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

if (typeof jQuery === 'undefined') { throw new Error('iCn3D requires jQuery') }

var iCn3D = function (id) { var me = this, ic = me.icn3d; "use strict";

    this.id = id;
    this.pre = id.substr(0, id.indexOf('_') + 1);

    this.bControlGl = false;
    //this.container = (this.bControlGl) ? $(document) : $('#' + id);
    this.container = $('#' + id);

    this.oriContainer = $('#' + id);

    this.maxatomcnt = 100000; // for a biological assembly, use instancing when the total number of atomsis greater than "maxatomcnt"

    this.overdraw = 0;

    this.bDrawn = false;
    this.bOpm = false; // true if the PDB data is from OPM for transmembrane proteins
    this.crossstrucinter = 0;

    this.bSecondaryStructure = false;

    this.bHighlight = 1; // undefined: no highlight, 1: highlight by outline, 2: highlight by 3D object
    this.renderOrderPicking = -1; // less than 0, the default order is 0

    this.bInitial = true; // first 3d display

    this.bDoublecolor = false;

    this.originSize = 1; // radius

    this.ALTERNATE_STRUCTURE = -1;

    this.bUsePdbNum = true;

    if(Detector.webgl){
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.oriContainer.get(0), //this.container.get(0),
            antialias: true,
            preserveDrawingBuffer: true,
            sortObjects: false,
            alpha: true
        });

        this.overdraw = 0;
    }
    else {
        alert("Currently your web browser has a problem on WebGL. If you are using Chrome, open a new tab for the same URL and WebGL may work again.");
/*
        alert("Currently your web browser has a problem on WebGL, and CanvasRenderer instead of WebGLRenderer is used. If you are using Chrome, open a new tab for the same URL and WebGL may work again.");

        this.renderer = new THREE.CanvasRenderer({
            canvas: this.container.get(0)
        });

        //http://threejs.org/docs/api/materials/Material.html
        this.overdraw = 0.5;

        // only WebGL support outlines using ShaderMaterial
        this.bHighlight = 2;
*/
    }

    this.matShader = this.setOutlineColor('yellow');
    this.frac = new THREE.Color(0.1, 0.1, 0.1);

    // mobile has a problem when the scaleFactor is 2.0
    // the scaleFactor improve the image quality, but it has some centering and picking problems in some Mac when it is not 1
    this.scaleFactor = 1.0;

    // scale all labels
    this.labelScale = 0.3; //1.0;

    // Impostor shaders
    this.bImpo = true;
    this.bExtFragDepth = this.renderer.extensions.get( "EXT_frag_depth" );
    if(!this.bExtFragDepth) {
        this.bImpo = false;
        console.log('EXT_frag_depth is NOT supported. All spheres and cylinders are drawn using geometry.');
    }
    else {
        console.log('EXT_frag_depth is supported. All spheres and cylinders are drawn using shaders.');
    }

    this.bInstanced = this.renderer.extensions.get( "ANGLE_instanced_arrays" );
    if(!this.bInstanced) {
        console.log('ANGLE_instanced_arrays is NOT supported. Assembly is drawn by making copies of the asymmetric unit.');
    }
    else {
        console.log('ANGLE_instanced_arrays is supported. Assembly is drawn with one copy of the asymmetric unit using hardware instancing.');
    }

    // cylinder impostor
    this.posArray = new Array();
    this.colorArray = new Array();

    this.pos2Array = new Array();
    this.color2Array = new Array();

    this.radiusArray = new Array();

    // sphere impostor
    this.posArraySphere = new Array();
    this.colorArraySphere = new Array();
    this.radiusArraySphere = new Array();

    this.axis = false;  // used to turn on and off xyz axes

    // pk
    this.pk = 1; // 0: no pk, 1: pk on atoms, 2: pk on residues, 3: pk on strand/helix/coil, 4: pk on domain, 5: pk on chain, 6: structure
    this.highlightlevel = 1; // 1: highlight on atoms, 2: highlight on residues, 3: highlight on strand/helix/coil 4: highlight on chain 5: highlight on structure

    this.pickpair = false; // used for pk pair of atoms for label and distance
    this.pAtomNum = 0;

    this.pAtom = undefined;
    this.pAtom2 = undefined;

    this.bCtrl = false; // if true, union selection on sequence window or on 3D structure
    this.bShift = false; // if true, select a range on 3D structure

    this.bStopRotate = false; // by default, do not stop the possible automatic rotation
    this.bCalphaOnly = false; // by default the input has both Calpha and O, used for drawing strands. If atoms have Calpha only, the orientation of the strands is random
//    this.bSSOnly = false; // a flag to turn on when only helix and bricks are available to draw 3D dgm

    this.bAllAtoms = true; // no need to adjust atom for strand style

    this.bConsiderNeighbors = false; // a flag to show surface considering the neighboring atoms or not

    this.bShowCrossResidueBond = true;

    this.bExtrude = true;

    this.effects = {
        //'anaglyph': new THREE.AnaglyphEffect(this.renderer),
        //'parallax barrier': new THREE.ParallaxBarrierEffect(this.renderer),
        //'oculus rift': new THREE.OculusRiftEffect(this.renderer),
        //'stereo': new THREE.StereoEffect(this.renderer),
        'none': this.renderer
    };

    this.maxD = 500; // size of the molecule
    this.oriMaxD = this.maxD; // size of the molecule
    //this.cam_z = -150;

    this.cam_z = this.maxD * 2; // when zooming in, it gets dark if the camera is in front
    //this.cam_z = -this.maxD * 2;

    // these variables will not be cleared for each structure
    this.commands = []; // a list of commands, ordered by the operation steps. Each operation will be converted into a command. this command list can be used to go backward and forward.
    this.optsHistory = []; // a list of options corresponding to this.commands.
    this.logs = []; // a list of comands and other logs, ordered by the operation steps.

    this.bRender = true; // a flag to turn off rendering when loading state file

    // Default values
    this.hColor = new THREE.Color(0xFFFF00);

    this.sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 32, 1);
    this.cylinderGeometryOutline = new THREE.CylinderGeometry(1, 1, 1, 32, 1, true);
    this.axisDIV = 5 * 3; //5; // 3;
    this.strandDIV = 6;
    this.tubeDIV = 8;
    this.nucleicAcidStrandDIV = 6; //4;

    this.linewidth = 1;
    this.hlLineRadius = 0.1; // style line, highlight
    //this.curveWidth = 3;

    this.lineRadius = 0.1; // hbonds, distance lines
    this.coilWidth = 0.3; //0.4; // style cartoon-coil
    this.cylinderRadius = 0.4; // style stick
    this.traceRadius = 0.4; //0.2; // c alpha trace, nucleotide stick
    this.dotSphereScale = 0.3; // style ball and stick, dot
    this.sphereRadius = 1.5; // style sphere
    this.cylinderHelixRadius = 1.6; // style sylinder and plate

    this.ribbonthickness = 0.2; // 0.4; // style ribbon, nucleotide cartoon, stand thickness
    this.helixSheetWidth = 1.3; // style ribbon, nucleotide cartoon, stand thickness
    this.nucleicAcidWidth = 0.8; // nucleotide cartoon

    this.threshbox = 180; // maximum possible boxsize, default 180
    this.maxAtoms3DMultiFile = 40000; // above the threshold, multiple files wil be output for 3D printing

    this.LABELSIZE = 30;

    this.opts = {
        camera: 'perspective',
        background: 'transparent',
        color: 'chain',
        sidec: 'nothing',
        proteins: 'ribbon',
        nucleotides: 'nucleotide cartoon',
        surface: 'nothing',
        wireframe: 'no',
        map: 'nothing',
        mapwireframe: 'yes',
        emmap: 'nothing',
        emmapwireframe: 'yes',
        phimap: 'nothing',
        phimapwireframe: 'yes',
        phisurface: 'nothing',
        phisurftype: 'nothing',
        phisurfwf: 'no',
        opacity: '1.0',
        chemicals: 'stick',
        water: 'nothing',
        ions: 'sphere',
        //labels: 'no',
        //effect: 'none',
        hbonds: 'no',
        saltbridge: 'no',
        contact: 'no',
        halogen: 'no',
        'pi-cation': 'no',
        'pi-stacking': 'no',
        //stabilizer: 'no',
        ssbonds: 'yes',
        clbonds: 'yes',
        //ncbonds: 'no',
        labels: 'no',
        lines: 'no',
        rotationcenter: 'molecule center',
        axis: 'no',
        fog: 'no',
        slab: 'no',
        pk: 'residue',
        nucleotides: 'nucleotide cartoon',
        chemicalbinding: 'hide'
    };

    this.setColor();
};

iCn3D.prototype = {

    constructor: iCn3D,

    thr: function(color) { var me = this;
        return new THREE.Color(color);
    },

    alternateWrapper: function() { var me = this;
       me.bAlternate = true;
       me.alternateStructures();
       me.bAlternate = false;
    },

    // added nucleotides and ions
    nucleotidesArray: ['  G', '  A', '  T', '  C', '  U', ' DG', ' DA', ' DT', ' DC', ' DU',
        'G', 'A', 'T', 'C', 'U', 'DG', 'DA', 'DT', 'DC', 'DU'],

    ionsArray: ['  K', ' NA', ' MG', ' AL', ' CA', ' TI', ' MN', ' FE', ' NI', ' CU', ' ZN', ' AG', ' BA',
        '  F', ' CL', ' BR', '  I',
        'K', 'NA', 'MG', 'AL', 'CA', 'TI', 'MN', 'FE', 'NI', 'CU', 'ZN', 'AG', 'BA',
        'F', 'CL', 'BR', 'I'],
    cationsTrimArray: ['K', 'NA', 'MG', 'AL', 'CA', 'TI', 'MN', 'FE', 'NI', 'CU', 'ZN', 'AG', 'BA'],
    anionsTrimArray: ['F', 'CL', 'BR', 'I'],

    ionCharges: {K: 1, NA: 1, MG: 2, AL: 3, CA: 2, TI: 3, MN: 2, FE: 3, NI: 2, CU: 2, ZN: 2, AG: 1, BA: 2},

    vdwRadii: { // Hu, S.Z.; Zhou, Z.H.; Tsai, K.R. Acta Phys.-Chim. Sin., 2003, 19:1073.
         H: 1.08,
        HE: 1.34,
        LI: 1.75,
        BE: 2.05,
         B: 1.47,
         C: 1.49,
         N: 1.41,
         O: 1.40,
         F: 1.39,
        NE: 1.68,
        NA: 1.84,
        MG: 2.05,
        AL: 2.11,
        SI: 2.07,
         P: 1.92,
         S: 1.82,
        CL: 1.83,
        AR: 1.93,
         K: 2.05,
        CA: 2.21,
        SC: 2.16,
        TI: 1.87,
         V: 1.79,
        CR: 1.89,
        MN: 1.97,
        FE: 1.94,
        CO: 1.92,
        NI: 1.84,
        CU: 1.86,
        ZN: 2.10,
        GA: 2.08,
        GE: 2.15,
        AS: 2.06,
        SE: 1.93,
        BR: 1.98,
        KR: 2.12,
        RB: 2.16,
        SR: 2.24,
         Y: 2.19,
        ZR: 1.86,
        NB: 2.07,
        MO: 2.09,
        TC: 2.09,
        RU: 2.07,
        RH: 1.95,
        PD: 2.02,
        AG: 2.03,
        CD: 2.30,
        IN: 2.36,
        SN: 2.33,
        SB: 2.25,
        TE: 2.23,
         I: 2.23,
        XE: 2.21,
        CS: 2.22,
        BA: 2.51,
        LA: 2.40,
        CE: 2.35,
        PR: 2.39,
        ND: 2.29,
        PM: 2.36,
        SM: 2.29,
        EU: 2.33,
        GD: 2.37,
        TB: 2.21,
        DY: 2.29,
        HO: 2.16,
        ER: 2.35,
        TM: 2.27,
        YB: 2.42,
        LU: 2.21,
        HF: 2.12,
        TA: 2.17,
         W: 2.10,
        RE: 2.17,
        OS: 2.16,
        IR: 2.02,
        PT: 2.09,
        AU: 2.17,
        HG: 2.09,
        TL: 2.35,
        PB: 2.32,
        BI: 2.43,
        PO: 2.29,
        AT: 2.36,
        RN: 2.43,
        FR: 2.56,
        RA: 2.43,
        AC: 2.60,
        TH: 2.37,
        PA: 2.43,
         U: 2.40,
        NP: 2.21,
        PU: 2.56,
        AM: 2.56,
        CM: 2.56,
        BK: 2.56,
        CF: 2.56,
        ES: 2.56,
        FM: 2.56,
    },

    covalentRadii: { // http://en.wikipedia.org/wiki/Covalent_radius
         H: 0.31,
        HE: 0.28,
        LI: 1.28,
        BE: 0.96,
         B: 0.84,
         C: 0.76,
         N: 0.71,
         O: 0.66,
         F: 0.57,
        NE: 0.58,
        NA: 1.66,
        MG: 1.41,
        AL: 1.21,
        SI: 1.11,
         P: 1.07,
         S: 1.05,
        CL: 1.02,
        AR: 1.06,
         K: 2.03,
        CA: 1.76,
        SC: 1.70,
        TI: 1.60,
         V: 1.53,
        CR: 1.39,
        MN: 1.39,
        FE: 1.32,
        CO: 1.26,
        NI: 1.24,
        CU: 1.32,
        ZN: 1.22,
        GA: 1.22,
        GE: 1.20,
        AS: 1.19,
        SE: 1.20,
        BR: 1.20,
        KR: 1.16,
        RB: 2.20,
        SR: 1.95,
         Y: 1.90,
        ZR: 1.75,
        NB: 1.64,
        MO: 1.54,
        TC: 1.47,
        RU: 1.46,
        RH: 1.42,
        PD: 1.39,
        AG: 1.45,
        CD: 1.44,
        IN: 1.42,
        SN: 1.39,
        SB: 1.39,
        TE: 1.38,
         I: 1.39,
        XE: 1.40,
        CS: 2.44,
        BA: 2.15,
        LA: 2.07,
        CE: 2.04,
        PR: 2.03,
        ND: 2.01,
        PM: 1.99,
        SM: 1.98,
        EU: 1.98,
        GD: 1.96,
        TB: 1.94,
        DY: 1.92,
        HO: 1.92,
        ER: 1.89,
        TM: 1.90,
        YB: 1.87,
        LU: 1.87,
        HF: 1.75,
        TA: 1.70,
         W: 1.62,
        RE: 1.51,
        OS: 1.44,
        IR: 1.41,
        PT: 1.36,
        AU: 1.36,
        HG: 1.32,
        TL: 1.45,
        PB: 1.46,
        BI: 1.48,
        PO: 1.40,
        AT: 1.50,
        RN: 1.50,
        FR: 2.60,
        RA: 2.21,
        AC: 2.15,
        TH: 2.06,
        PA: 2.00,
         U: 1.96,
        NP: 1.90,
        PU: 1.87,
        AM: 1.80,
        CM: 1.69,
    },

    //glycanArray: ['A2G', 'AFL', 'AGC', 'ALT', 'ALL', 'ARB', 'BGC', 'BMA', 'BOG', 'DEO', 'FCA', 'FCB', 'FMF', 'FRU', 'FUC', 'FUL', 'G4S', 'GAL', 'GLA', 'GLB', 'GLC', 'GLS', 'GSA', 'GUL', 'IDO', 'LAK', 'LAT', 'LYF', 'MAF', 'MAL', 'MAN', 'NAG', 'NAN', 'NDG', 'NGA', 'RHM', 'RIB', 'SIA', 'SLB', 'TAL', 'THP', 'XYL', 'XYF'],

    //rasmol-like element colors
    setColor: function() {
        // https://pubs.acs.org/doi/pdf/10.1021/acs.jproteome.8b00473
        //this.glycanColors = [this.thr(0x008B8B), this.thr(0x6B8E23), this.thr(0x90EE90), this.thr(0xD2691E), this.thr(0xF4A460), this.thr(0xBC8F8F), this.thr(0x1E90FF), this.thr(0x87CEEB)];
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


        this.atomColors = {
        'H': this.thr(0xFFFFFF),
        'He': this.thr(0xFFC0CB),
        'HE': this.thr(0xFFC0CB),
        'Li': this.thr(0xB22222),
        'LI': this.thr(0xB22222),
        'B': this.thr(0x00FF00),
        'C': this.thr(0xC8C8C8),
        //'N': this.thr(0x8F8FFF),
        'N': this.thr(0x0000FF),
        'O': this.thr(0xF00000),
        'F': this.thr(0xDAA520),
        'Na': this.thr(0x0000FF),
        'NA': this.thr(0x0000FF),
        'Mg': this.thr(0x228B22),
        'MG': this.thr(0x228B22),
        'Al': this.thr(0x808090),
        'AL': this.thr(0x808090),
        'Si': this.thr(0xDAA520),
        'SI': this.thr(0xDAA520),
        'P': this.thr(0xFFA500),
        'S': this.thr(0xFFC832),
        'Cl': this.thr(0x00FF00),
        'CL': this.thr(0x00FF00),
        'Ca': this.thr(0x808090),
        'CA': this.thr(0x808090),
        'Ti': this.thr(0x808090),
        'TI': this.thr(0x808090),
        'Cr': this.thr(0x808090),
        'CR': this.thr(0x808090),
        'Mn': this.thr(0x808090),
        'MN': this.thr(0x808090),
        'Fe': this.thr(0xFFA500),
        'FE': this.thr(0xFFA500),
        'Ni': this.thr(0xA52A2A),
        'NI': this.thr(0xA52A2A),
        'Cu': this.thr(0xA52A2A),
        'CU': this.thr(0xA52A2A),
        'Zn': this.thr(0xA52A2A),
        'ZN': this.thr(0xA52A2A),
        'Br': this.thr(0xA52A2A),
        'BR': this.thr(0xA52A2A),
        'Ag': this.thr(0x808090),
        'AG': this.thr(0x808090),
        'I': this.thr(0xA020F0),
        'Ba': this.thr(0xFFA500),
        'BA': this.thr(0xFFA500),
        'Au': this.thr(0xDAA520),
        'AU': this.thr(0xDAA520)
        };

        this.defaultAtomColor = this.thr(0xCCCCCC);

        this.stdChainColors = [
            // first 6 colors from MMDB
            this.thr(0xFF00FF),
            this.thr(0x0000FF),
            this.thr(0x996633),
            this.thr(0x00FF99),
            this.thr(0xFF9900),
            this.thr(0xFF6666),

            this.thr(0x32CD32),
            this.thr(0x1E90FF),
            this.thr(0xFA8072),
            this.thr(0xFFA500),
            this.thr(0x00CED1),
            this.thr(0xFF69B4),

            this.thr(0x00FF00),
            this.thr(0x0000FF),
            this.thr(0xFF0000),
            this.thr(0xFFFF00),
            this.thr(0x00FFFF),
            this.thr(0xFF00FF),

            this.thr(0x3CB371),
            this.thr(0x4682B4),
            this.thr(0xCD5C5C),
            this.thr(0xFFE4B5),
            this.thr(0xAFEEEE),
            this.thr(0xEE82EE),

            this.thr(0x006400),
            this.thr(0x00008B),
            this.thr(0x8B0000),
            this.thr(0xCD853F),
            this.thr(0x008B8B),
            this.thr(0x9400D3)
        ];

        this.backgroundColors = {
        black: this.thr(0x000000),
         grey: this.thr(0xCCCCCC),
        white: this.thr(0xFFFFFF),
        transparent: this.thr(0x000000)
        };

        this.residueColors = {
        ALA: this.thr(0xC8C8C8),
        ARG: this.thr(0x145AFF),
        ASN: this.thr(0x00DCDC),
        ASP: this.thr(0xE60A0A),
        CYS: this.thr(0xE6E600),
        GLN: this.thr(0x00DCDC),
        GLU: this.thr(0xE60A0A),
        GLY: this.thr(0xEBEBEB),
        HIS: this.thr(0x8282D2),
        ILE: this.thr(0x0F820F),
        LEU: this.thr(0x0F820F),
        LYS: this.thr(0x145AFF),
        MET: this.thr(0xE6E600),
        PHE: this.thr(0x3232AA),
        PRO: this.thr(0xDC9682),
        SER: this.thr(0xFA9600),
        THR: this.thr(0xFA9600),
        TRP: this.thr(0xB45AB4),
        TYR: this.thr(0x3232AA),
        VAL: this.thr(0x0F820F),
        ASX: this.thr(0xFF69B4),
        GLX: this.thr(0xFF69B4),
          'G': this.thr(0x008000),
          'A': this.thr(0x6080FF),
          'T': this.thr(0xFF8000),
          'C': this.thr(0xFF0000),
          'U': this.thr(0xFF8000),
         'DG': this.thr(0x008000),
         'DA': this.thr(0x6080FF),
         'DT': this.thr(0xFF8000),
         'DC': this.thr(0xFF0000),
         'DU': this.thr(0xFF8000)
        };

        // calculated in iCn3D, the value could fluctuate 10-20 in different proteins
        this.residueArea = {
        ALA: 247,
        ARG: 366,
        ASN: 290,
        ASP: 285,
        CYS: 271,
        GLN: 336,
        GLU: 325,
        GLY: 217,
        HIS: 340,
        ILE: 324,
        LEU: 328,
        LYS: 373,
        MET: 346,
        PHE: 366,
        PRO: 285,
        SER: 265,
        THR: 288,
        TRP: 414,
        TYR: 387,
        VAL: 293,
        ASX: 290,
        GLX: 336,
          'G': 520,
          'A': 507,
          'T': 515,
          'C': 467,
          'U': 482,
         'DG': 520,
         'DA': 507,
         'DT': 515,
         'DC': 467,
         'DU': 482
        };

        this.defaultResidueColor = this.thr(0xBEA06E);

        this.chargeColors = {
    // charged residues
        '  G': this.thr(0xFF0000),
        '  A': this.thr(0xFF0000),
        '  T': this.thr(0xFF0000),
        '  C': this.thr(0xFF0000),
        '  U': this.thr(0xFF0000),
        ' DG': this.thr(0xFF0000),
        ' DA': this.thr(0xFF0000),
        ' DT': this.thr(0xFF0000),
        ' DC': this.thr(0xFF0000),
        ' DU': this.thr(0xFF0000),
          'G': this.thr(0xFF0000),
          'A': this.thr(0xFF0000),
          'T': this.thr(0xFF0000),
          'C': this.thr(0xFF0000),
          'U': this.thr(0xFF0000),
         'DG': this.thr(0xFF0000),
         'DA': this.thr(0xFF0000),
         'DT': this.thr(0xFF0000),
         'DC': this.thr(0xFF0000),
         'DU': this.thr(0xFF0000),
        'ARG': this.thr(0x0000FF),
        'LYS': this.thr(0x0000FF),
        'ASP': this.thr(0xFF0000),
        'GLU': this.thr(0xFF0000),
        'HIS': this.thr(0x8080FF),

        'GLY': this.thr(0x888888),
        'PRO': this.thr(0x888888),
        'ALA': this.thr(0x888888),
        'VAL': this.thr(0x888888),
        'LEU': this.thr(0x888888),
        'ILE': this.thr(0x888888),
        'PHE': this.thr(0x888888),

        'SER': this.thr(0x888888),
        'THR': this.thr(0x888888),
        'ASN': this.thr(0x888888),
        'GLN': this.thr(0x888888),
        'TYR': this.thr(0x888888),
        'MET': this.thr(0x888888),
        'CYS': this.thr(0x888888),
        'TRP': this.thr(0x888888)
        };

        this.hydrophobicColors = {
    // charged residues
        '  G': this.thr(0xFF0000),
        '  A': this.thr(0xFF0000),
        '  T': this.thr(0xFF0000),
        '  C': this.thr(0xFF0000),
        '  U': this.thr(0xFF0000),
        ' DG': this.thr(0xFF0000),
        ' DA': this.thr(0xFF0000),
        ' DT': this.thr(0xFF0000),
        ' DC': this.thr(0xFF0000),
        ' DU': this.thr(0xFF0000),
          'G': this.thr(0xFF0000),
          'A': this.thr(0xFF0000),
          'T': this.thr(0xFF0000),
          'C': this.thr(0xFF0000),
          'U': this.thr(0xFF0000),
         'DG': this.thr(0xFF0000),
         'DA': this.thr(0xFF0000),
         'DT': this.thr(0xFF0000),
         'DC': this.thr(0xFF0000),
         'DU': this.thr(0xFF0000),
        'ARG': this.thr(0x0000FF),
        'LYS': this.thr(0x0000FF),
        'ASP': this.thr(0xFF0000),
        'GLU': this.thr(0xFF0000),
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

        this.sheetcolor = 'green';

        this.ssColors = {
        //helix: this.thr(0xFF0080),
        helix: this.thr(0xFF0000),
        //sheet: this.thr(0xFFC800),
        sheet: this.thr(0x008000),
         coil: this.thr(0x6080FF)
        };

        this.ssColors2 = {
        //helix: this.thr(0xFF0080),
        helix: this.thr(0xFF0000),
        sheet: this.thr(0xFFC800),
        //sheet: this.thr(0x008000),
         coil: this.thr(0x6080FF)
        };

        //defaultBondColor: this.thr(0x2194D6),
        this.defaultBondColor = this.thr(0xBBBBBB); // cross residue bonds
    },

    surfaces: {
        1: undefined,
        2: undefined,
        3: undefined,
        4: undefined
    },

    mapData: {},

    // from iview (http://istar.cse.cuhk.edu.hk/iview/)
    hasCovalentBond: function (atom0, atom1) {
        var r = this.covalentRadii[atom0.elem.toUpperCase()] + this.covalentRadii[atom1.elem.toUpperCase()];
        return atom0.coord.distanceToSquared(atom1.coord) < 1.3 * r * r;
    }
};
