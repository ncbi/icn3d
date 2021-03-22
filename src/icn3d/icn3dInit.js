/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

iCn3D.prototype.init = function () {
    this.init_base();

    this.molTitle = "";

    this.ssbondpnts = {}; // disulfide bonds for each structure
    this.clbondpnts = {}; // cross-linkages for each structure

    this.inputid = {"idtype": undefined, "id":undefined}; // support pdbid, mmdbid

    this.biomtMatrices = [];
    this.bAssembly = true;

    this.bDrawn = false;
    this.bSecondaryStructure = false;
    this.bHighlight = 1; // undefined: no highlight, 1: highlight by outline, 2: highlight by 3D object

    this.axes = [];
};

iCn3D.prototype.init_base = function () {
    this.structures = {}; // structure name -> array of chains
    this.chains = {}; // structure_chain name -> atom hash
    this.tddomains = {}; // structure_chain_3d_domain_# name -> residue id hash such as {'structure_chain_3d_domain_1': 1, ...}
    this.residues = {}; // structure_chain_resi name -> atom hash
    this.secondaries = {}; // structure_chain_resi name -> secondary structure: 'c', 'H', or 'E'
    this.alnChains = {}; // structure_chain name -> atom hash

    this.chainsSeq = {}; // structure_chain name -> array of sequence
    this.chainsColor = {}; // structure_chain name -> color, show chain color in sequence display for mmdbid and align input
    this.chainsGene = {}; // structure_chain name -> gene, show chain gene symbol in sequence display for mmdbid and align input
    this.chainsAn = {}; // structure_chain name -> array of annotations, such as residue number
    this.chainsAnTitle = {}; // structure_chain name -> array of annotation title

    this.alnChainsSeq = {}; // structure_chain name -> array of residue object: {mmdbid, chain, resi, resn, aligned}
    this.alnChainsAnno = {}; // structure_chain name -> array of annotations, such as residue number
    this.alnChainsAnTtl = {}; // structure_chain name -> array of annotation title

    //this.dAtoms = {}; // show selected atoms
    //this.hAtoms = {}; // used to change color or dislay type for certain atoms

    this.pickedAtomList = {}; // used to switch among different highlight levels

    this.prevHighlightObjects = [];
    this.prevHighlightObjects_ghost = [];

    this.prevSurfaces = [];
    this.prevMaps = [];
    this.prevEmmaps = [];
    this.prevPhimaps = [];

    this.prevOtherMesh = [];

    this.defNames2Residues = {}; // custom defined selection name -> residue array
    this.defNames2Atoms = {}; // custom defined selection name -> atom array
    this.defNames2Descr = {}; // custom defined selection name -> description
    this.defNames2Command = {}; // custom defined selection name -> command

    this.residueId2Name = {}; // structure_chain_resi -> one letter abbreviation

    this.atoms = {};
    this.dAtoms = {};
    this.hAtoms = {};
    this.proteins = {};
    this.sidec = {};
    this.nucleotides = {};
    this.nucleotidesO3 = {};

    this.chemicals = {};
    this.ions = {};
    this.water = {};
    this.calphas = {};
    //this.mem = {}; // membrane for OPM pdb

    this.hbondpnts = [];
    this.saltbridgepnts = [];
    this.contactpnts = [];
    this.stabilizerpnts = [];

    this.halogenpnts = [];
    this.picationpnts = [];
    this.pistackingpnts = [];

    this.doublebonds = {};
    this.triplebonds = {};
    this.aromaticbonds = {};

    this.atomPrevColors = {};

    this.style2atoms = {}; // style -> atom hash, 13 styles: ribbon, strand, cylinder and plate, nucleotide cartoon, o3 trace, schematic, c alpha trace, b factor tube, lines, stick, ball and stick, sphere, dot, nothing
    this.labels = {};     // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                        // label name could be custom, residue, schmatic, distance
    this.lines = {};     // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
                        // line name could be custom, hbond, ssbond, distance

    // used for interactions
    this.resids2inter = {};
    this.resids2interAll = {};

    this.rotateCount = 0;
    this.rotateCountMax = 20;

    this.commands = [];

    this.axes = [];

    this.bGlycansCartoon = true;

    this.chainid2offset = {};
};

iCn3D.prototype.reinitAfterLoad = function () {
    this.dAtoms = this.cloneHash(this.atoms); // show selected atoms
    this.hAtoms = this.cloneHash(this.atoms); // used to change color or dislay type for certain atoms

    this.prevHighlightObjects = [];
    this.prevHighlightObjects_ghost = [];

    this.prevSurfaces = [];
    this.prevMaps = [];
    this.prevEmmaps = [];
    this.prevPhimaps = [];

    this.prevOtherMesh = [];

    this.labels = {};   // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                        // label name could be custom, residue, schmatic, distance
    this.lines = {};    // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
                        // line name could be custom, hbond, ssbond, distance

    this.bAssembly = true;
};
