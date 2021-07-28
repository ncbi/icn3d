/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {HashUtilsCls} from '../utils/hashUtilsCls.js';

import {Scene} from './display/scene.js';
import {Camera} from './display/camera.js';
import {Fog} from './display/fog.js';

import {Box} from './geometry/box.js';
import {Brick} from './geometry/brick.js';
import {CurveStripArrow} from './geometry/curveStripArrow.js';
import {Curve} from './geometry/curve.js';
import {Cylinder} from './geometry/cylinder.js';
import {Line} from './geometry/line.js';
import {ReprSub} from './geometry/reprSub.js';
import {Sphere} from './geometry/sphere.js';
import {Stick} from './geometry/stick.js';
import {Strand} from './geometry/strand.js';
import {Strip} from './geometry/strip.js';
import {Tube} from './geometry/tube.js';
import {CartoonNucl} from './geometry/cartoonNucl.js';
import {Label} from './geometry/label.js';
import {Axes} from './geometry/axes.js';
import {Glycan} from './geometry/glycan.js';

import {Surface} from './surface/surface.js';
import {ElectronMap} from './surface/electronMap.js';
import {MarchingCube} from './surface/marchingCube.js';
import {ProteinSurface} from './surface/proteinSurface.js';

import {ApplyCenter} from './display/applyCenter.js';
import {ApplyClbonds} from './display/applyClbonds.js';
import {ApplyDisplay} from './display/applyDisplay.js';
import {ApplyOther} from './display/applyOther.js';
import {ApplySsbonds} from './display/applySsbonds.js';
import {ApplySymd} from './analysis/applySymd.js';
import {ApplyMap} from './surface/applyMap.js';

import {ResidueLabels} from './geometry/residueLabels.js';
import {Impostor} from './geometry/impostor.js';
import {Instancing} from './geometry/instancing.js';

import {Alternate} from './display/alternate.js';
import {Draw} from './display/draw.js';

import {Contact} from './interaction/contact.js';
import {HBond} from './interaction/hBond.js';
import {PiHalogen} from './interaction/piHalogen.js';
import {Saltbridge} from './interaction/saltbridge.js';

import {SetStyle} from './display/setStyle.js';
import {SetColor} from './display/setColor.js';
import {SetOption} from './display/setOption.js';

    // classes from icn3dui
import {AnnoCddSite} from './annotations/annoCddSite.js';
import {AnnoContact} from './annotations/annoContact.js';
import {AnnoCrossLink} from './annotations/annoCrossLink.js';
import {AnnoDomain} from './annotations/annoDomain.js';
import {AnnoSnpClinVar} from './annotations/annoSnpClinVar.js';
import {AnnoSsbond} from './annotations/annoSsbond.js';
import {AnnoTransMem} from './annotations/annoTransMem.js';

import {AddTrack} from './annotations/addTrack.js';
import {Annotation} from './annotations/annotation.js';
import {ShowAnno} from './annotations/showAnno.js';
import {ShowSeq} from './annotations/showSeq.js';

import {HlSeq} from './highlight/hlSeq.js';
import {HlUpdate} from './highlight/hlUpdate.js';
import {HlObjects} from './highlight/hlObjects.js';

import {LineGraph} from './interaction/lineGraph.js';
import {GetGraph} from './interaction/getGraph.js';
import {ShowInter} from './interaction/showInter.js';
import {ViewInterPairs} from './interaction/viewInterPairs.js';
import {DrawGraph} from './interaction/drawGraph.js';
import {ContactMap} from './interaction/contactMap.js';

import {AlignParser} from './parsers/alignParser.js';
import {ChainalignParser} from './parsers/chainalignParser.js';
import {Dsn6Parser} from './parsers/dsn6Parser.js';
import {MmcifParser} from './parsers/mmcifParser.js';
import {MmdbParser} from './parsers/mmdbParser.js';
import {MmtfParser} from './parsers/mmtfParser.js';
import {Mol2Parser} from './parsers/mol2Parser.js';
import {OpmParser} from './parsers/opmParser.js';
import {PdbParser} from './parsers/pdbParser.js';
import {SdfParser} from './parsers/sdfParser.js';
import {XyzParser} from './parsers/xyzParser.js';
import {RealignParser} from './parsers/realignParser.js';
import {DensityCifParser} from './parsers/densityCifParser.js';
import {ParserUtils} from './parsers/parserUtils.js';
import {LoadAtomData} from './parsers/loadAtomData.js';
import {SetSeqAlign} from './parsers/setSeqAlign.js';
import {LoadPDB} from './parsers/loadPDB.js';

import {ApplyCommand} from './selection/applyCommand.js';
import {DefinedSets} from './selection/definedSets.js';
import {LoadScript} from './selection/loadScript.js';
import {SelectByCommand} from './selection/selectByCommand.js';
import {Selection} from './selection/selection.js';
import {Resid2spec} from './selection/resid2spec.js';
import {FirstAtomObj} from './selection/firstAtomObj.js';

import {Delphi} from './analysis/delphi.js';
import {Dssp} from './analysis/dssp.js';
import {Scap} from './analysis/scap.js';
import {Symd} from './analysis/symd.js';

import {Analysis} from './analysis/analysis.js';
import {Diagram2d} from './analysis/diagram2d.js';
import {Cartoon2d} from './analysis/cartoon2d.js';

import {ResizeCanvas} from './transform/resizeCanvas.js';
import {Transform} from './transform/transform.js';

import {SaveFile} from './export/saveFile.js';
import {ShareLink} from './export/shareLink.js';
import {ThreeDPrint} from './export/threeDPrint.js';
import {Export3D} from './export/export3D.js';

import {Ray} from './picking/ray.js';
import {Control} from './picking/control.js';
import {Picking} from './picking/picking.js';

class iCn3D {
  constructor(icn3dui) { let me = icn3dui;
    this.icn3dui = icn3dui;
    this.id = this.icn3dui.pre + 'canvas';

    //A prefix for all custom html element id. It ensures all html elements have specific ids,
    //even when multiple iCn3D viewers are shown together.
    this.pre = this.icn3dui.pre; //this.id.substr(0, this.id.indexOf('_') + 1);

    this.container = $('#' + this.id);
    this.oriContainer = $('#' + this.id);

    this.bControlGl = false;

    this.maxatomcnt = 100000; // for a biological assembly, use instancing when the total number of atomsis greater than "maxatomcnt"

    this.overdraw = 0;

    this.bDrawn = false;
    this.bOpm = false; // true if the PDB data is from OPM for transmembrane proteins
    this.crossstrucinter = 0;

    this.bSecondaryStructure = false;

    //If its value is 1, the selected atoms will be highlighted with outlines around the structure.
    //If its value is 2, the selected atoms will be highlighted with transparent 3D objects such as
    //boxes, ribbons, cylinders, etc. If its value is undefined, no highlight will be shown.
    this.bHighlight = 1; // undefined: no highlight, 1: highlight by outline, 2: highlight by 3D object
    this.renderOrderPicking = -1; // less than 0, the default order is 0

    this.bInitial = true; // first 3d display

    this.bDoublecolor = false;

    this.originSize = 1; // radius

    this.ALTERNATE_STRUCTURE = -1;

    this.bUsePdbNum = true;

    if(!this.icn3dui.bNode) {
        let canvas = document.createElement( 'canvas' );
        let bWebGL = !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

        if(bWebGL){
            //https://discourse.threejs.org/t/three-js-r128-ext-frag-depth-and-angle-instanced-arrays-extensions-are-not-supported/26037
            //this.renderer = new THREE.WebGLRenderer({
            this.renderer = new THREE.WebGL1Renderer({
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
        }
    }

    this.frac = new THREE.Color(0.1, 0.1, 0.1);
    this.shininess = 40; //30
    this.emissive = 0x111111; //0x000000

    this.light1 = 0.6; //1
    this.light2 = 0.4;
    this.light3 = 0.2;

    //This is the line radius for stabilizers, hydrogen bonds, and distance lines. It's 0.1 by default.
    this.lineRadius = 0.1; // hbonds, distance lines
    //This is the coil radius for coils. It's 0.3 by default.
    this.coilWidth = 0.3; //0.4; // style cartoon-coil
    this.cylinderRadius = 0.4; // style stick
    //This is the stick radius for C alpha trace and O3' trace. It's 0.4 by default.
    this.traceRadius = 0.4; //0.2; // c alpha trace, nucleotide stick
    //This is the ball scale for styles 'Ball and Stick' and 'Dot'. It's 0.3 by default.
    this.dotSphereScale = 0.3; // style ball and stick, dot
    //This is the sphere radius for the style 'Sphere'. It's 1.5 by default.
    this.sphereRadius = 1.5; // style sphere
    //This is the cylinder radius for the style 'Cylinder and Plate'. It's 1.6 by default.
    this.cylinderHelixRadius = 1.6; // style sylinder and plate

    //This is the ribbon thickness for helix and sheet ribbons, and nucleotide ribbons. It's 0.4 by default.
    this.ribbonthickness = 0.2; // 0.4; // style ribbon, nucleotide cartoon, stand thickness
    //This is the width of protein ribbons. It's 1.3 by default.
    this.helixSheetWidth = 1.3; // style ribbon, nucleotide cartoon, stand thickness
    //This is the width of nucleotide ribbons. It's 0.8 by default.
    this.nucleicAcidWidth = 0.8; // nucleotide cartoon

    // mobile has a problem when the scaleFactor is 2.0
    // the scaleFactor improve the image quality, but it has some centering and picking problems in some Mac when it is not 1
    this.scaleFactor = 1.0;

    // scale all labels
    this.labelScale = 1.0; //0.3; //1.0;

    // Impostor shaders
    // This is a flag to turn on the rendering of spheres and cylinders using shaders instead of geometries.
    // It's true by default if the browser supports the EXT_frag_depth extension.
    this.bImpo = true;
    this.bInstanced = true;

    if(!this.icn3dui.bNode) {
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
    //If its value is 1, selecting an atom will select the atom. If its value is 2, selecting an atom
    //will select the residue containing this atom. If its value is 3, selecting an atom will select
    //the strand or helix or coil containing this atom. If its value is 0, no selecting will work.
    this.pk = 1; // 0: no pk, 1: pk on atoms, 2: pk on residues, 3: pk on strand/helix/coil, 4: pk on domain, 5: pk on chain, 6: structure
    this.highlightlevel = 1; // 1: highlight on atoms, 2: highlight on residues, 3: highlight on strand/helix/coil 4: highlight on chain 5: highlight on structure

    this.pickpair = false; // used for pk pair of atoms for label and distance
    this.pAtomNum = 0;

    //"pAtom" has the value of the atom index of the picked atom.
    this.pAtom = undefined;
    //When two atoms are required to be selected (e.g., for measuring distance),
    //"pAtom2" has the value of the atom index of the 2nd picked atom.
    this.pAtom2 = undefined;

    this.bCtrl = false; // if true, union selection on sequence window or on 3D structure
    this.bShift = false; // if true, select a range on 3D structure

    //Once clicked, this flag can be set as "true" to the automatic rotation. It's false by default.
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

    //This is a flag to turn off the rendering part if a sequence of commands are executed. It's true by default.
    this.bRender = true; // a flag to turn off rendering when loading state file

    // Default values
    //This defines the highlight color.
//    this.hColor = new THREE.Color(0xFFFF00);
    this.hColor = new THREE.Color(0xFFFF33);

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

    this.threshbox = 180; // maximum possible boxsize, default 180
    this.maxAtoms3DMultiFile = 40000; // above the threshold, multiple files wil be output for 3D printing

    this.tsHbond = 3.8;
    this.tsIonic = 6;
    this.tsContact = 4;
    this.tsHalogen = 3.8;
    this.tsPication = 6;
    this.tsPistacking = 5.5;

    this.LABELSIZE = 30;

    //The default display options
    this.optsOri = {}
    this.optsOri['camera']             = 'perspective';        //perspective, orthographic
    this.optsOri['background']         = 'transparent';        //transparent, black, grey, white
    this.optsOri['color']              = 'chain';              //spectrum, secondary structure, charge, hydrophobic, conserved, chain, residue, atom, b factor, red, green, blue, magenta, yellow, cyan, white, grey, custom
    this.optsOri['proteins']           = 'ribbon';             //ribbon, strand, cylinder and plate, schematic, c alpha trace, backbone, b factor tube, lines, stick, ball and stick, sphere, nothing
    this.optsOri['sidec']              = 'nothing';            //lines, stick, ball and stick, sphere, nothing
    this.optsOri['nucleotides']        = 'nucleotide cartoon'; //nucleotide cartoon, o3 trace, backbone, schematic, lines, stick,
                                                              // nucleotides ball and stick, sphere, nothing
    this.optsOri['surface']            = 'nothing';            //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    this.optsOri['opacity']            = '1.0';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    this.optsOri['wireframe']          = 'no';                 //yes, no
    this.optsOri['map']                = 'nothing';            //2fofc, fofc, nothing
    this.optsOri['mapwireframe']       = 'yes';                //yes, no
    this.optsOri['emmap']              = 'nothing';            //em, nothing
    this.optsOri['emmapwireframe']     = 'yes';                //yes, no
    this.optsOri['phimap']             = 'nothing';            //phi, nothing
    this.optsOri['phimapwireframe']    = 'yes';                //yes, no
    this.optsOri['phisurface']         = 'nothing';            //phi, nothing
    this.optsOri['phisurftype']        = 'nothing';            //Van der Waals surface, molecular surface, solvent accessible surface, nothing
    this.optsOri['phisurfop']          = '1.0';                //1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    this.optsOri['phisurfwf']          = 'yes';                //yes, no
    this.optsOri['chemicals']          = 'stick';              //lines, stick, ball and stick, schematic, sphere, nothing
    this.optsOri['water']              = 'nothing';            //sphere, dot, nothing
    this.optsOri['ions']               = 'sphere';             //sphere, dot, nothing
    this.optsOri['hbonds']             = 'no';                 //yes, no
    this.optsOri['saltbridge']         = 'no';                 //yes, no
    this.optsOri['contact']            = 'no';                 //yes, no
    this.optsOri['halogen']            = 'no';                 //yes, no
    this.optsOri['pi-cation']          = 'no';                 //yes, no
    this.optsOri['pi-stacking']        = 'no';                 //yes, no
    //this.optsOri['stabilizer']         = 'no';                 //yes, no
    this.optsOri['ssbonds']            = 'yes';                 //yes, no
    this.optsOri['clbonds']            = 'yes';                 //yes, no
    this.optsOri['rotationcenter']     = 'molecule center';    //molecule center, pick center, display center
    this.optsOri['axis']               = 'no';                 //yes, no
    this.optsOri['fog']                = 'no';                 //yes, no
    this.optsOri['slab']               = 'no';                 //yes, no
    this.optsOri['pk']                 = 'residue';            //no, atom, residue, strand, chain
    this.optsOri['chemicalbinding']    = 'hide';               //show, hide

    this.opts = me.hashUtilsCls.cloneHash(this.optsOri);

    this.sheetcolor = 'green';
    this.bShowHighlight = true;
    this.mapData = {};

    // previously in iCn3DUI
    this.bFullUi = true;
    this.divid = this.icn3dui.cfg.divid;

    this.inputid = '';
    this.setOperation = 'or'; // by default the set operation is 'or'
    this.ROT_DIR = 'right';
    //this.prevCommands = "";
    this.currSelectedSets = []; // for selecting multiple sets in sequence & annotations
    this.selectedResidues = {}

    this.bHideSelection = true;
    this.bSelectResidue = false;
    this.bSelectAlignResidue = false;
    //A flag to remember whether the annotation window was set.
    this.bAnnoShown = false;
    //A flag to remember whether the menu of defined sets was set.
    this.bSetChainsAdvancedMenu = false;
    //A flag to remember whether the 2D interaction diagram was set.
    this.b2DShown = false;
    this.bCrashed = false;
    //A flag to determine whether to add current step into the command history.
    this.bAddCommands = true;
    //A flag to determine whether to add current step into the log window.
    this.bAddLogs = true;
    //A flag to determine whether to load the coordinates of the structure. When resetting the view,
    //it is true so that the coordinates of the structure will not be loaded again.
    this.bNotLoadStructure = false;

    // default color range for Add Custom Color button in the Sequence & Annotation window
    this.startColor = 'blue';
    this.midColor = 'white';
    this.endColor = 'red';
    this.startValue = 0;
    this.midValue = 50;
    this.endValue = 100;

    // classes
    this.sceneCls = new Scene(this);
    this.cameraCls = new Camera(this);
    this.fogCls = new Fog(this);

    this.boxCls = new Box(this);
    this.brickCls = new Brick(this);
    this.curveStripArrowCls = new CurveStripArrow(this);
    this.curveCls = new Curve(this);
    this.cylinderCls = new Cylinder(this);
    this.lineCls = new Line(this);
    this.reprSubCls = new ReprSub(this);
    this.sphereCls = new Sphere(this);
    this.stickCls = new Stick(this);
    this.strandCls = new Strand(this);
    this.stripCls = new Strip(this);
    this.tubeCls = new Tube(this);
    this.cartoonNuclCls = new CartoonNucl(this);
    this.surfaceCls = new Surface(this);
    this.labelCls = new Label(this);
    this.axesCls = new Axes(this);
    this.glycanCls = new Glycan(this);

    this.applyCenterCls = new ApplyCenter(this);
    this.applyClbondsCls = new ApplyClbonds(this);
    this.applyDisplayCls = new ApplyDisplay(this);
    this.applyMapCls = new ApplyMap(this);
    this.applyOtherCls = new ApplyOther(this);
    this.applySsbondsCls = new ApplySsbonds(this);
    this.applySymdCls = new ApplySymd(this);

    this.hlObjectsCls = new HlObjects(this);
    this.residueLabelsCls = new ResidueLabels(this);
    this.alternateCls = new Alternate(this);

    this.drawCls = new Draw(this);
    this.firstAtomObjCls = new FirstAtomObj(this);

    this.impostorCls = new Impostor(this);
    this.instancingCls = new Instancing(this);

    this.contactCls = new Contact(this);
    this.hBondCls = new HBond(this);
    this.piHalogenCls = new PiHalogen(this);
    this.saltbridgeCls = new Saltbridge(this);

    this.loadPDBCls = new LoadPDB(this);
    this.transformCls = new Transform(this);

    this.setStyleCls = new SetStyle(this);
    this.setColorCls = new SetColor(this);

    // classes from icn3dui
    this.threeDPrintCls = new ThreeDPrint(this);
    this.export3DCls = new Export3D(this);

    this.annoCddSiteCls = new AnnoCddSite(this);
    this.annoContactCls = new AnnoContact(this);
    this.annoCrossLinkCls = new AnnoCrossLink(this);
    this.annoDomainCls = new AnnoDomain(this);
    this.annoSnpClinVarCls = new AnnoSnpClinVar(this);
    this.annoSsbondCls = new AnnoSsbond(this);
    this.annoTransMemCls = new AnnoTransMem(this);

    this.addTrackCls = new AddTrack(this);
    this.annotationCls = new Annotation(this);
    this.showAnnoCls = new ShowAnno(this);
    this.showSeqCls = new ShowSeq(this);

    this.hlSeqCls = new HlSeq(this);
    this.hlUpdateCls = new HlUpdate(this);

    this.lineGraphCls = new LineGraph(this);
    this.getGraphCls = new GetGraph(this);
    this.showInterCls = new ShowInter(this);
    this.viewInterPairsCls = new ViewInterPairs(this);
    this.drawGraphCls = new DrawGraph(this);
    this.contactMapCls = new ContactMap(this);

    this.alignParserCls = new AlignParser(this);
    this.chainalignParserCls = new ChainalignParser(this);
    this.dsn6ParserCls = new Dsn6Parser(this);
    this.mmcifParserCls = new MmcifParser(this);
    this.mmdbParserCls = new MmdbParser(this);
    this.mmtfParserCls = new MmtfParser(this);
    this.mol2ParserCls = new Mol2Parser(this);
    this.opmParserCls = new OpmParser(this);
    this.pdbParserCls = new PdbParser(this);
    this.sdfParserCls = new SdfParser(this);
    this.xyzParserCls = new XyzParser(this);
    this.realignParserCls = new RealignParser(this);
    this.densityCifParserCls = new DensityCifParser(this);
    this.ParserUtilsCls = new ParserUtils(this);
    this.loadAtomDataCls = new LoadAtomData(this);
    this.setSeqAlignCls = new SetSeqAlign(this);

    this.applyCommandCls = new ApplyCommand(this);
    this.definedSetsCls = new DefinedSets(this);
    this.loadScriptCls = new LoadScript(this);
    this.selByCommCls = new SelectByCommand(this);
    this.selectionCls = new Selection(this);
    this.resid2specCls = new Resid2spec(this);

    this.delphiCls = new Delphi(this);
    this.dsspCls = new Dssp(this);
    this.scapCls = new Scap(this);
    this.symdCls = new Symd(this);

    this.analysisCls = new Analysis(this);
    this.resizeCanvasCls = new ResizeCanvas(this);
    this.saveFileCls = new SaveFile(this);
    this.setOptionCls = new SetOption(this);
    this.shareLinkCls = new ShareLink(this);
    this.diagram2dCls = new Diagram2d(this);
    this.cartoon2dCls = new Cartoon2d(this);

    this.rayCls = new Ray(this);
    this.controlCls = new Control(this);
    this.pickingCls = new Picking(this);

    // set this.matShader
    //This defines the highlight color using the outline method. It can be defined using the function setOutlineColor().
    this.matShader = this.setColorCls.setOutlineColor('yellow');
  }
};

//When users first load a structure, call this function to empty previous settings.
iCn3D.prototype.init = function () {
    this.init_base();

    this.molTitle = "";

    this.ssbondpnts = {}; // disulfide bonds for each structure
    this.clbondpnts = {}; // cross-linkages for each structure

    //this.inputid = {"idtype": undefined, "id":undefined}; // support pdbid, mmdbid

    this.biomtMatrices = [];
    this.bAssembly = true;

    this.bDrawn = false;
    this.bSecondaryStructure = false;

    this.bHighlight = 1; // undefined: no highlight, 1: highlight by outline, 2: highlight by 3D object

    this.axes = [];
};

iCn3D.prototype.init_base = function () {
    this.resetConfig();

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
    //This is a hash used to store all atoms to be displayed. The key is the atom index. Its value is set as 1.
    this.dAtoms = {};
    //This is a hash used to store all atoms to be highlighted. The key is the atom index. Its value is set as 1.
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

    this.distPnts = [];

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

    this.transformCls.rotateCount = 0;
    this.transformCls.rotateCountMax = 20;

    this.commands = [];

    this.axes = [];

    this.bGlycansCartoon = false;

    this.chainid2offset = {};
};

//Reset parameters for displaying the loaded structure.
iCn3D.prototype.reinitAfterLoad = function () { let ic = this, me = ic.icn3dui;
    ic.resetConfig();

    ic.setStyleCls.setAtomStyleByOptions();
    ic.setColorCls.setColorByOptions(ic.opts, ic.atoms);

    ic.dAtoms = me.hashUtilsCls.cloneHash(ic.atoms); // show selected atoms
    ic.hAtoms = me.hashUtilsCls.cloneHash(ic.atoms); // used to change color or dislay type for certain atoms

    ic.prevHighlightObjects = [];
    ic.prevHighlightObjects_ghost = [];

    ic.prevSurfaces = [];
    ic.prevMaps = [];
    ic.prevEmmaps = [];
    ic.prevPhimaps = [];

    ic.prevOtherMesh = [];

    ic.labels = {};   // hash of name -> a list of labels. Each label contains 'position', 'text', 'size', 'color', 'background'
                        // label name could be custom, residue, schmatic, distance
    ic.lines = {};    // hash of name -> a list of solid or dashed lines. Each line contains 'position1', 'position2', 'color', and a boolean of 'dashed'
                        // line name could be custom, hbond, ssbond, distance

    ic.bAssembly = true;
};

iCn3D.prototype.resetConfig = function () { let ic = this, me = ic.icn3dui;
    this.opts = me.hashUtilsCls.cloneHash(this.optsOri);

    if(me.cfg.align !== undefined || me.cfg.chainalign !== undefined) {
        this.opts['color'] = 'identity';
        this.opts['proteins'] = 'c alpha trace';
        this.opts['nucleotides'] = 'o3 trace';
    }

    if(me.cfg.cid !== undefined) {
        this.opts['color'] = 'atom';

        this.opts['pk'] = 'atom';
        this.opts['chemicals'] = 'ball and stick';
    }

    if(me.cfg.blast_rep_id !== undefined) this.opts['color'] = 'conservation';
    if(me.cfg.options !== undefined) $.extend(this.opts, me.cfg.options);
};

export {iCn3D}
