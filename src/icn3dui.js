/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// html and iCn3D
import {HashUtilsCls} from './utils/hashUtilsCls.js';
import {UtilsCls} from './utils/utilsCls.js';
import {ParasCls} from './utils/parasCls.js';
import {MyEventCls} from './utils/myEventCls.js';
import {RmsdSuprCls} from './utils/rmsdSuprCls.js';
import {SubdivideCls} from './utils/subdivideCls.js';
import {ConvertTypeCls} from './utils/convertTypeCls.js';

import {Html} from './html/html.js';
import {iCn3D} from './icn3d/icn3d.js';

// import all classes so that we can export all classes for modification
// from Html
import {ClickMenu} from './html/clickMenu.js';
import {SetMenu} from './html/setMenu.js';
import {Dialog} from './html/dialog.js';
import {SetDialog} from './html/setDialog.js';
import {Events} from './html/events.js';
import {AlignSeq} from './html/alignSeq.js';
import {SetHtml} from './html/setHtml.js';

// from iCn3D
import {Scene} from './icn3d/display/scene.js';
import {Camera} from './icn3d/display/camera.js';
import {Fog} from './icn3d/display/fog.js';

import {Box} from './icn3d/geometry/box.js';
import {Brick} from './icn3d/geometry/brick.js';
import {CurveStripArrow} from './icn3d/geometry/curveStripArrow.js';
import {Curve} from './icn3d/geometry/curve.js';
import {Cylinder} from './icn3d/geometry/cylinder.js';
import {Line} from './icn3d/geometry/line.js';
import {ReprSub} from './icn3d/geometry/reprSub.js';
import {Sphere} from './icn3d/geometry/sphere.js';
import {Stick} from './icn3d/geometry/stick.js';
import {Strand} from './icn3d/geometry/strand.js';
import {Strip} from './icn3d/geometry/strip.js';
import {Tube} from './icn3d/geometry/tube.js';
import {CartoonNucl} from './icn3d/geometry/cartoonNucl.js';
import {Label} from './icn3d/geometry/label.js';
import {Axes} from './icn3d/geometry/axes.js';
import {Glycan} from './icn3d/geometry/glycan.js';

import {Surface} from './icn3d/surface/surface.js';
import {ElectronMap} from './icn3d/surface/electronMap.js';
import {MarchingCube} from './icn3d/surface/marchingCube.js';
import {ProteinSurface} from './icn3d/surface/proteinSurface.js';

import {ApplyCenter} from './icn3d/display/applyCenter.js';
import {ApplyClbonds} from './icn3d/display/applyClbonds.js';
import {ApplyDisplay} from './icn3d/display/applyDisplay.js';
import {ApplyOther} from './icn3d/display/applyOther.js';
import {ApplySsbonds} from './icn3d/display/applySsbonds.js';
import {ApplySymd} from './icn3d/analysis/applySymd.js';
import {ApplyMap} from './icn3d/surface/applyMap.js';

import {ResidueLabels} from './icn3d/geometry/residueLabels.js';
import {Impostor} from './icn3d/geometry/impostor.js';
import {Instancing} from './icn3d/geometry/instancing.js';

import {Alternate} from './icn3d/display/alternate.js';
import {Draw} from './icn3d/display/draw.js';

import {Contact} from './icn3d/interaction/contact.js';
import {HBond} from './icn3d/interaction/hBond.js';
import {PiHalogen} from './icn3d/interaction/piHalogen.js';
import {Saltbridge} from './icn3d/interaction/saltbridge.js';

import {SetStyle} from './icn3d/display/setStyle.js';
import {SetColor} from './icn3d/display/setColor.js';
import {SetOption} from './icn3d/display/setOption.js';

    // classes from icn3dui
import {AnnoCddSite} from './icn3d/annotations/annoCddSite.js';
import {AnnoContact} from './icn3d/annotations/annoContact.js';
import {AnnoPTM} from './icn3d/annotations/annoPTM.js';
import {AnnoIg} from './icn3d/annotations/annoIg.js';
import {AnnoCrossLink} from './icn3d/annotations/annoCrossLink.js';
import {AnnoDomain} from './icn3d/annotations/annoDomain.js';
import {AnnoSnpClinVar} from './icn3d/annotations/annoSnpClinVar.js';
import {AnnoSsbond} from './icn3d/annotations/annoSsbond.js';
import {AnnoTransMem} from './icn3d/annotations/annoTransMem.js';
import {Domain3d} from './icn3d/annotations/domain3d.js';

import {AddTrack} from './icn3d/annotations/addTrack.js';
import {Annotation} from './icn3d/annotations/annotation.js';
import {ShowAnno} from './icn3d/annotations/showAnno.js';
import {ShowSeq} from './icn3d/annotations/showSeq.js';

import {HlSeq} from './icn3d/highlight/hlSeq.js';
import {HlUpdate} from './icn3d/highlight/hlUpdate.js';
import {HlObjects} from './icn3d/highlight/hlObjects.js';

import {LineGraph} from './icn3d/interaction/lineGraph.js';
import {GetGraph} from './icn3d/interaction/getGraph.js';
import {ShowInter} from './icn3d/interaction/showInter.js';
import {ViewInterPairs} from './icn3d/interaction/viewInterPairs.js';
import {DrawGraph} from './icn3d/interaction/drawGraph.js';
import {ContactMap} from './icn3d/interaction/contactMap.js';

import {AlignParser} from './icn3d/parsers/alignParser.js';
import {ChainalignParser} from './icn3d/parsers/chainalignParser.js';
import {Dsn6Parser} from './icn3d/parsers/dsn6Parser.js';
import {Ccp4Parser} from './icn3d/parsers/ccp4Parser.js';
import {MtzParser} from './icn3d/parsers/mtzParser.js';
import {MmcifParser} from './icn3d/parsers/mmcifParser.js';
import {MmdbParser} from './icn3d/parsers/mmdbParser.js';
import {BcifParser} from './icn3d/parsers/bcifParser.js';
import {Mol2Parser} from './icn3d/parsers/mol2Parser.js';
import {OpmParser} from './icn3d/parsers/opmParser.js';
import {PdbParser} from './icn3d/parsers/pdbParser.js';
import {SdfParser} from './icn3d/parsers/sdfParser.js';
import {XyzParser} from './icn3d/parsers/xyzParser.js';
import {RealignParser} from './icn3d/parsers/realignParser.js';
import {DensityCifParser} from './icn3d/parsers/densityCifParser.js';
import {ParserUtils} from './icn3d/parsers/parserUtils.js';
import {LoadAtomData} from './icn3d/parsers/loadAtomData.js';
import {SetSeqAlign} from './icn3d/parsers/setSeqAlign.js';
import {LoadPDB} from './icn3d/parsers/loadPDB.js';
import {LoadCIF} from './icn3d/parsers/loadCIF.js';
import {Vastplus} from './icn3d/parsers/vastplus.js';

import {ApplyCommand} from './icn3d/selection/applyCommand.js';
import {DefinedSets} from './icn3d/selection/definedSets.js';
import {LoadScript} from './icn3d/selection/loadScript.js';
import {SelectByCommand} from './icn3d/selection/selectByCommand.js';
import {Selection} from './icn3d/selection/selection.js';
import {Resid2spec} from './icn3d/selection/resid2spec.js';
import {FirstAtomObj} from './icn3d/selection/firstAtomObj.js';

import {Delphi} from './icn3d/analysis/delphi.js';
import {Dssp} from './icn3d/analysis/dssp.js';
import {Refnum} from './icn3d/annotations/refnum.js';
import {Scap} from './icn3d/analysis/scap.js';
import {Symd} from './icn3d/analysis/symd.js';
import {AlignSW} from './icn3d/analysis/alignSW.js';

import {Analysis} from './icn3d/analysis/analysis.js';
import {Diagram2d} from './icn3d/analysis/diagram2d.js';
import {Cartoon2d} from './icn3d/analysis/cartoon2d.js';

import {ResizeCanvas} from './icn3d/transform/resizeCanvas.js';
import {Transform} from './icn3d/transform/transform.js';

import {SaveFile} from './icn3d/export/saveFile.js';
import {ShareLink} from './icn3d/export/shareLink.js';
import {ThreeDPrint} from './icn3d/export/threeDPrint.js';
import {Export3D} from './icn3d/export/export3D.js';

import {Ray} from './icn3d/picking/ray.js';
import {Control} from './icn3d/picking/control.js';
import {Picking} from './icn3d/picking/picking.js';

import {VRButton} from "./thirdparty/three/vr/VRButton.js";
import {ARButton} from "./thirdparty/three/vr/ARButton.js";

class iCn3DUI {
  constructor(cfg) {
    //A hash containing all input parameters.
    this.cfg = cfg;
    //A prefix for all custom html element id. It ensures all html elements have specific ids,
    //even when multiple iCn3D viewers are shown together.
    this.pre = this.cfg.divid + "_";

    this.REVISION = '3.33.0';

    // In nodejs, iCn3D defines "window = {navigator: {}}"
    this.bNode = (Object.keys(window).length < 2) ? true : false;

    if(this.cfg.command === undefined) this.cfg.command = '';
    if(this.cfg.width === undefined) this.cfg.width = '100%';
    if(this.cfg.height === undefined) this.cfg.height = '100%';
    if(this.cfg.resize === undefined) this.cfg.resize = true;
    if(this.cfg.showmenu === undefined) this.cfg.showmenu = true;
    if(this.cfg.showtitle === undefined) this.cfg.showtitle = true;
    if(this.cfg.showcommand === undefined) this.cfg.showcommand = true;
    //if(this.cfg.simplemenu === undefined) this.cfg.simplemenu = false;
    if(this.cfg.mobilemenu === undefined) this.cfg.mobilemenu = false;
    if(this.cfg.imageonly === undefined) this.cfg.imageonly = false;
    if(this.cfg.closepopup === undefined) this.cfg.closepopup = false;
    if(this.cfg.showanno === undefined) this.cfg.showanno = false;
    if(this.cfg.showseq === undefined) this.cfg.showseq = false;
    if(this.cfg.showalignseq === undefined) this.cfg.showalignseq = false;
    if(this.cfg.show2d === undefined) this.cfg.show2d = false;
    if(this.cfg.showsets === undefined) this.cfg.showsets = false;
    if(this.cfg.rotate === undefined) this.cfg.rotate = 'right';
    if(this.cfg.hidelicense === undefined) this.cfg.hidelicense = false;

    // classes
    this.hashUtilsCls = new HashUtilsCls(this);
    this.utilsCls = new UtilsCls(this);
    this.parasCls = new ParasCls(this);
    this.myEventCls = new MyEventCls(this);
    this.rmsdSuprCls = new RmsdSuprCls(this);
    this.subdivideCls = new SubdivideCls(this);
    this.convertTypeCls = new ConvertTypeCls(this);

    this.htmlCls = new Html(this);
  }

  //You can add your custom events in this function if you want to add new links in the function setTools.
  allCustomEvents() {
      // add custom events here
  }

}

// show3DStructure is the main function to show 3D structure
iCn3DUI.prototype.show3DStructure = async function(pdbStr) { let me = this;
  let thisClass = this;
//   me.deferred = $.Deferred(function() {
    if(me.cfg.menuicon) {
        me.htmlCls.wifiStr = '<i class="icn3d-wifi" title="requires internet">&nbsp;</i>';
        me.htmlCls.licenseStr = '<i class="icn3d-license" title="requires license">&nbsp;</i>';
    }
    else {
        me.htmlCls.wifiStr = '';
        me.htmlCls.licenseStr = '';
    }

    me.setIcn3d();
    let ic = me.icn3d;

    if(me.utilsCls.isSessionStorageSupported()) ic.setStyleCls.getCommandsBeforeCrash();

    let width = me.htmlCls.WIDTH; // - me.htmlCls.LESSWIDTH_RESIZE;
    let height = me.htmlCls.HEIGHT; // - me.htmlCls.LESSHEIGHT - me.htmlCls.EXTRAHEIGHT;
    me.oriWidth = width;
    me.oriHeight = height;

    me.htmlCls.eventsCls.allEventFunctions();
    thisClass.allCustomEvents();

    let extraHeight = 0;
    if(me.cfg.showmenu == undefined || me.cfg.showmenu) {
        //extraHeight += 2*me.htmlCls.MENU_HEIGHT;
        extraHeight += me.htmlCls.MENU_HEIGHT;
    }
    if(me.cfg.showcommand == undefined || me.cfg.showcommand) {
        extraHeight += me.htmlCls.CMD_HEIGHT;
    }
    if(me.cfg.showmenu != undefined && me.cfg.showmenu == false) {
      me.htmlCls.setMenuCls.hideMenu();
    }
    else {
      me.htmlCls.setMenuCls.showMenu();
    }
    if(me.cfg.showtitle != undefined && me.cfg.showtitle == false) {
      $("#" + ic.pre + "title").hide();
    }
    else {
      $("#" + ic.pre + "title").show();
    }
    $("#" + ic.pre + "viewer").width(width).height(parseInt(height) + extraHeight);
    $("#" + ic.pre + "canvas").width(width).height(parseInt(height));
    $("#" + ic.pre + "canvas").resizable({
      resize: function( event, ui ) {
        me.htmlCls.WIDTH = ui.size.width; //$("#" + ic.pre + "canvas").width();
        me.htmlCls.HEIGHT = ui.size.height; //$("#" + ic.pre + "canvas").height();
        if(ic !== undefined && !me.icn3d.bFullscreen) {
            ic.resizeCanvasCls.resizeCanvas(me.htmlCls.WIDTH, me.htmlCls.HEIGHT, true);
        }
      }
    });

    if(me.cfg.usepdbnum !== undefined) {
        me.icn3d.bUsePdbNum = me.cfg.usepdbnum;
    }
    else {
        if(me.cfg.date !== undefined) {
            me.icn3d.bUsePdbNum =(parseInt(me.cfg.date) >= 20201222) ? true : false;
        }
        else {
            // iCn3D paper
            if(me.cfg.mmdbid == '1tup' && me.cfg.showanno == 1 && me.cfg.show2d == 1 && me.cfg.showsets == 1) {
                me.icn3d.bUsePdbNum = false;
            }
            //https://link.springer.com/article/10.1007/s00239-020-09934-4/figures/1
            else if(me.cfg.mmdbid == '118496' && me.cfg.showanno == 0 && me.cfg.inpara.indexOf('bu=1') != -1) {
                me.icn3d.bUsePdbNum = false;
            }
            //https://link.springer.com/article/10.1007/s00239-020-09934-4/figures/6
            else if(me.cfg.align == '163605,1,91105,1,1,1' && me.cfg.inpara.indexOf('atype=1') != -1) {
                me.icn3d.bUsePdbNum = false;
            }
            else {
                me.icn3d.bUsePdbNum = true;
            }
        }
    }

    if(me.cfg.replay) {
        ic.bReplay = 1;
        $("#" + ic.pre + "replay").show();
    }
    else {
        ic.bReplay = 0;
        $("#" + ic.pre + "replay").hide();
    }
    if(me.utilsCls.isMobile()) ic.threshbox = 60;
    if(me.cfg.controlGl) {
        ic.bControlGl = true;
        ic.container =(ic.bControlGl && !me.bNode) ? $(document) : $('#' + ic.id);
    }
    //ic.controlCls.setControl(); // rotation, translation, zoom, etc
    ic.setStyleCls.handleContextLost();
    ic.applyCenterCls.setWidthHeight(width, height);
    ic.ori_chemicalbinding = ic.opts['chemicalbinding'];
    if(me.cfg.bCalphaOnly !== undefined) ic.bCalphaOnly = me.cfg.bCalphaOnly;
    ic.opts = me.hashUtilsCls.cloneHash(ic.opts);
    ic.STATENUMBER = ic.commands.length;
    // If previously crashed, recover it
    if(me.utilsCls.isSessionStorageSupported() && ic.bCrashed) {
        ic.bCrashed = false;
        let loadCommand = ic.commandsBeforeCrash.split('|||')[0];
        let id = loadCommand.substr(loadCommand.lastIndexOf(' ') + 1);
        // reload only if viewing the same structure
        if(id === me.cfg.bcifid || id === me.cfg.mmtfid || id === me.cfg.pdbid || id === me.cfg.opmid || id === me.cfg.mmdbid || id === me.cfg.gi  || id === me.cfg.blast_rep_id
          || id === me.cfg.cid || id === me.cfg.mmcifid || id === me.cfg.align || id === me.cfg.chainalign || id === me.cfg.mmdbafid) {
            await ic.loadScriptCls.loadScript(ic.commandsBeforeCrash, true);
            return;
        }
    }
    ic.molTitle = '';
    ic.loadCmd;

    // set menus
    me.htmlCls.clickMenuCls.getHiddenMenusFromCache();
    me.htmlCls.clickMenuCls.applyShownMenus();

    if(pdbStr) { // input pdbStr
        ic.init();

        ic.bInputfile = true;
        ic.InputfileType = 'pdb';
        ic.InputfileData = (ic.InputfileData) ? ic.InputfileData + '\nENDMDL\n' + pdbStr : pdbStr;
        
        await ic.pdbParserCls.loadPdbData(pdbStr);

        if(me.cfg.resdef !== undefined && me.cfg.chains !== undefined) {
            let structureArray = Object.keys(ic.structures);
            let chainArray = me.cfg.chains.split(' | ');
            let chainidArray = [];
            if(structureArray.length == chainArray.length) {
                for(let i = 0, il = structureArray.length; i  < il; ++i) {
                    chainidArray.push(structureArray[i] + '_' + chainArray[i]);
                }
                
                chainidArray = ic.chainalignParserCls.addPostfixForChainids(chainidArray);
                
                let bRealign = true, bPredefined = true;
                await ic.realignParserCls.realignChainOnSeqAlign(undefined, chainidArray, bRealign, bPredefined);
            }
        }
        else if(me.cfg.resdef !== undefined && me.cfg.matchedchains !== undefined) {
            let stru_t = Object.keys(ic.structures)[0];

            let chain_t = stru_t + '_' + me.cfg.masterchain;
            let domainidArray = me.cfg.matchedchains.split(',');
            let chainidArray = [];
            for(let i = 0, il = domainidArray.length; i  < il; ++i) {
                let pos = domainidArray[i].lastIndexOf('_');
                let lastId = domainidArray[i].substr(pos + 1);
                if(!isNaN(lastId)) { // lastId is domain id
                    chainidArray.push(domainidArray[i].substr(0, pos));
                }
                else {
                    chainidArray.push(domainidArray[i]);
                }
            }
            
            // get the matched structures, do not include the template
            let mmdbafid = '';
            for(let i = 0, il = chainidArray.length; i < il; ++i) {
                if(i > 0) mmdbafid += ',';
                mmdbafid += chainidArray[i].substr(0, chainidArray[i].indexOf('_'));
            }

            // realign, include the template
            ic.chainidArray = [chain_t].concat(chainidArray);
            ic.chainidArray = ic.chainalignParserCls.addPostfixForChainids(ic.chainidArray);
            
            me.htmlCls.clickMenuCls.setLogCmd('resdef ' + me.cfg.resdef, true);

            ic.loadCmd = 'vast_search_chainid ' + ic.chainidArray;
            me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);

            // load multiple PDBs
            // ic.bNCBI = true;
            ic.bMmdbafid = true;

            let bQuery = true;
            await ic.chainalignParserCls.downloadMmdbAf(mmdbafid, bQuery);
        }
    }
    else if(me.cfg.url !== undefined) {
        ic.bInputUrlfile = true;

        let type_url = me.cfg.url.split('|');
        let type = type_url[0];
        let url = type_url[1];
        ic.molTitle = "";
        ic.inputid = url;
        ic.inputurl = 'type=' + type + '&url=' + encodeURIComponent(url);

        ic.loadCmd = 'load url ' + url + ' | type ' + type;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.pdbParserCls.downloadUrl(url, type, me.cfg.command);
    }
    else if(me.cfg.mmtfid !== undefined) {
       ic.inputid = me.cfg.mmtfid;
       ic.loadCmd = 'load mmtf ' + me.cfg.mmtfid;
       me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
       await ic.bcifParserCls.downloadBcif(me.cfg.mmtfid);
    }
    else if(me.cfg.bcifid !== undefined) {
        ic.inputid = me.cfg.bcifid;
        ic.loadCmd = 'load bcif ' + me.cfg.bcifid;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.bcifParserCls.downloadBcif(me.cfg.bcifid);
     }
    else if(me.cfg.pdbid !== undefined) {
       ic.inputid = me.cfg.pdbid;
       ic.loadCmd = 'load pdb ' + me.cfg.pdbid;
       me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
       await ic.pdbParserCls.downloadPdb(me.cfg.pdbid);
    }
    else if(me.cfg.afid !== undefined) {
       ic.inputid = me.cfg.afid;
       ic.loadCmd = 'load af ' + me.cfg.afid;
       me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
       let bAf = true;

       //ic.pdbParserCls.downloadPdb(me.cfg.afid, bAf);
       await ic.pdbParserCls.downloadPdb(me.cfg.afid, bAf);
       //await ic.loadScriptCls.loadScript(me.cfg.command, undefined, true);
    }
    else if(me.cfg.opmid !== undefined) {
       ic.inputid = me.cfg.opmid;
       ic.loadCmd = 'load opm ' + me.cfg.opmid;
       me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
       await ic.opmParserCls.downloadOpm(me.cfg.opmid);
    }
    else if(me.cfg.mmdbid !== undefined) {
       ic.inputid = me.cfg.mmdbid;
       // ic.bNCBI = true;
       ic.loadCmd = 'load mmdb ' + me.cfg.mmdbid + ' | parameters ' + me.cfg.inpara;
       me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
       await ic.mmdbParserCls.downloadMmdb(me.cfg.mmdbid);
    }
    else if(me.cfg.gi !== undefined) {
        // ic.bNCBI = true;
        ic.loadCmd = 'load gi ' + me.cfg.gi;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.mmdbParserCls.downloadGi(me.cfg.gi);
    }
    else if(me.cfg.refseqid !== undefined) {
        ic.inputid = me.cfg.refseqid;
        
        // ic.bNCBI = true;
        ic.loadCmd = 'load refseq ' + me.cfg.refseqid;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.mmdbParserCls.downloadRefseq(me.cfg.refseqid);
    }
    else if(me.cfg.protein !== undefined) {
        ic.inputid = me.cfg.protein;
        
        // ic.bNCBI = true;
        ic.loadCmd = 'load protein ' + me.cfg.protein;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.mmdbParserCls.downloadProteinname(me.cfg.protein);
    }
    else if(me.cfg.blast_rep_id !== undefined) {
       // ic.bNCBI = true;
       ic.inputid =  me.cfg.query_id + ',' + me.cfg.blast_rep_id;
       
       me.cfg.oriQuery_id = me.cfg.query_id;
       me.cfg.oriBlast_rep_id = me.cfg.blast_rep_id;

       // custom sequence has query_id such as "Query_78989" in BLAST
       if(me.cfg.query_id.substr(0,5) !== 'Query' && me.cfg.rid === undefined) {
            // make it backward compatible for  figure 2 in iCn3D paper: https://academic.oup.com/bioinformatics/article/36/1/131/5520951
            if(me.cfg.from == 'icn3d' && me.cfg.blast_rep_id == '1TSR_A' && me.cfg.query_id == 'NP_001108451.1') {
                me.cfg.command = 'view annotations; set annotation cdd; set annotation site; set view detailed view; select chain 1TSR_A; show selection';
            }

            if(me.cfg.alg == 'smithwm') {
                ic.loadCmd = 'load seq_struct_ids_smithwm ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
                ic.bSmithwm = true;
            }
            else if(me.cfg.alg == 'local_smithwm') {
                ic.loadCmd = 'load seq_struct_ids_local_smithwm ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
                ic.bLocalSmithwm = true;
            }
            else {
                ic.loadCmd = 'load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
                ic.bSmithwm = false;
                ic.bLocalSmithwm = false;
            }
            
            me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
            await ic.mmdbParserCls.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
       }
       else if(me.cfg.rid !== undefined) {
            let url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?RESULTS_FILE=on&FORMAT_TYPE=JSON2_S&FORMAT_OBJECT=Alignment&CMD=Get&RID=" + me.cfg.rid; // e.g., RID=EFTRU3W5014
            let data = await me.getAjaxPromise(url, 'json', false, 'The RID ' + me.cfg.rid + ' may have expired...');

            for(let q = 0, ql = data.BlastOutput2.length; q < ql; ++q) {
                
                let hitArray;
                if(data.BlastOutput2[q].report.results.iterations) { // psi-blast may have "iterations". Use the last iteration.
                    let nIterations = data.BlastOutput2[q].report.results.iterations.length;
                    if(data.BlastOutput2[q].report.results.iterations[nIterations - 1].search.query_id != me.cfg.query_id) continue;
                    hitArray = data.BlastOutput2[q].report.results.iterations[nIterations - 1].search.hits;
                }
                else { // blastp may not have "iterations"
                    if(data.BlastOutput2[q].report.results.search.query_id != me.cfg.query_id) continue;
                    hitArray = data.BlastOutput2[q].report.results.search.hits;
                }
                
                let qseq = undefined;
                for(let i = 0, il = hitArray.length; i < il; ++i) {
                    let hit = hitArray[i];
                    let bFound = false;
                    for(let j = 0, jl = hit.description.length; j < jl; ++j) {
                        let acc = hit.description[j].accession;
                        if(acc == me.cfg.blast_rep_id) {
                            bFound = true;
                            break;
                        }
                    }
                    if(bFound) {
                        qseq = hit.hsps[0].qseq;
                        //remove gap '-'
                        qseq = qseq.replace(/-/g, '');
                        break;
                    }
                }
                if(qseq !== undefined) me.cfg.query_id = qseq;
                ic.inputid = me.cfg.query_id + '_' + me.cfg.blast_rep_id;
                ic.loadCmd = 'load seq_struct_ids ' + me.cfg.query_id + ',' + me.cfg.blast_rep_id;
                me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
                await ic.mmdbParserCls.downloadBlast_rep_id(me.cfg.query_id + ',' + me.cfg.blast_rep_id);
                break;
            }
       }
       else {
           alert('BLAST "RID" is a required parameter...');
       }
    }
    else if(me.cfg.cid !== undefined) {
        ic.inputid = me.cfg.cid;

        let url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/" + ic.inputid + "/description/jsonp";

        let data = await me.getAjaxPromise(url, 'jsonp', false);

        if(data.InformationList !== undefined && data.InformationList.Information !== undefined) ic.molTitle = data.InformationList.Information[0].Title;

        ic.loadCmd = 'load cid ' + me.cfg.cid;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.sdfParserCls.downloadCid(me.cfg.cid);
    }
    else if(me.cfg.mmcifid !== undefined) {
        ic.inputid = me.cfg.mmcifid;
        ic.loadCmd = 'load mmcif ' + me.cfg.mmcifid;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.mmcifParserCls.downloadMmcif(me.cfg.mmcifid);
    }
    else if(me.cfg.align !== undefined) {
        // ic.bNCBI = true;

        let alignArray = me.cfg.align.split(','); // e.g., 6 IDs: 103701,1,4,68563,1,167 [mmdbid1,biounit,molecule,mmdbid2,biounit,molecule], or 2IDs: 103701,68563 [mmdbid1,mmdbid2]
        if(alignArray.length === 6) {
            ic.inputid = alignArray[0] + "_" + alignArray[3];
        }
        else if(alignArray.length === 2) {
            ic.inputid = alignArray[0] + "_" + alignArray[1];
        }

        ic.loadCmd = 'load alignment ' + me.cfg.align + ' | parameters ' + me.cfg.inpara;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        if(me.cfg.inpara && me.cfg.inpara.indexOf('atype=2') == -1) {
            await ic.alignParserCls.downloadAlignment(me.cfg.align);
        }
        else {
            let vastplusAtype = 2; // Tm-align
            await ic.chainalignParserCls.downloadMmdbAf(me.cfg.align, undefined, vastplusAtype);
        }
    }
    else if(me.cfg.chainalign !== undefined) {
        // ic.bNCBI = true;

        ic.bChainAlign = true;
        ic.inputid = me.cfg.chainalign;
        ic.loadCmd = 'load chainalignment ' + me.cfg.chainalign + ' | resnum ' + me.cfg.resnum + ' | resdef ' + me.cfg.resdef + ' | aligntool ' + me.cfg.aligntool + ' | parameters ' + me.cfg.inpara;
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);
        await ic.chainalignParserCls.downloadChainalignment(me.cfg.chainalign, me.cfg.resnum, me.cfg.resdef);
    }
    else if(me.cfg.mmdbafid !== undefined) {
        // ic.bNCBI = true;

        // remove space
        me.cfg.mmdbafid = me.cfg.mmdbafid.replace(/\s+/g, '').toUpperCase();

        ic.bMmdbafid = true;
        ic.inputid = me.cfg.mmdbafid;
        if(me.cfg.bu == 1) {
            ic.loadCmd = 'load mmdbaf1 ' + me.cfg.mmdbafid + ' | parameters ' + me.cfg.inpara;
        }
        else {
            ic.loadCmd = 'load mmdbaf0 ' + me.cfg.mmdbafid + ' | parameters ' + me.cfg.inpara;
        }
        me.htmlCls.clickMenuCls.setLogCmd(ic.loadCmd, true);

        await ic.chainalignParserCls.downloadMmdbAf(me.cfg.mmdbafid);   
        //await ic.loadScriptCls.loadScript(me.cfg.command, undefined, true);
    }
    else if(me.cfg.command !== undefined && me.cfg.command !== '') {
        if(me.cfg.command.indexOf('url=') !== -1) ic.bInputUrlfile = true;
        //await ic.loadScriptCls.loadScript(me.cfg.command, undefined, true);
    }
    else {
        //alert("Please use the \"File\" menu to retrieve a structure of interest or to display a local file.");
        //me.htmlCls.dialogCls.openDlg('dl_mmdbid', 'Please input MMDB or PDB ID');
        me.htmlCls.dialogCls.openDlg('dl_mmdbafid', 'Please input PDB/MMDB/AlphaFold UniProt IDs');

        return;
    }
    
    await ic.loadScriptCls.loadScript(me.cfg.command, undefined, true);
//   });
//   return me.deferred.promise();
};

iCn3DUI.prototype.setIcn3d = function() { let me = this;
    let str1 = "<label class='icn3d-switch'><input id='" + me.pre + "modeswitch' type='checkbox'><div class='icn3d-slider icn3d-round' style='width:34px; height:18px; margin: 6px 0px 0px 3px;' title='Left(\"All atoms\"): Style and color menu options will be applied to all atoms in the structure&#13;Right(\"Selection\"): Style and color menu options will be applied only to selected atoms'></div></label>";
    let str2 = "<span id='" + me.pre + "modeall' title='Style and color menu options will be applied to all atoms in the structure'>All atoms&nbsp;&nbsp;</span><span id='" + me.pre + "modeselection' class='icn3d-modeselection' style='display:none;' title='Style and color menu options will be applied only to selected atoms'>Selection&nbsp;&nbsp;</span></div></div></td>";

    //me.htmlCls.WIDTH = $( window ).width() - me.htmlCls.LESSWIDTH;
    //me.htmlCls.HEIGHT = $( window ).height() - me.htmlCls.EXTRAHEIGHT - me.htmlCls.LESSHEIGHT;

    me.utilsCls.setViewerWidthHeight(me);

    if(me.utilsCls.isMobile() || me.cfg.mobilemenu) {
        me.htmlCls.setMenuCls.setTopMenusHtmlMobile(me.cfg.divid, str1, str2);
    }
    else {
        me.htmlCls.setMenuCls.setTopMenusHtml(me.cfg.divid, str1, str2);
    }

    me.icn3d = new iCn3D(me); // (ic.pre + 'canvas');

    me.icn3d.controlCls.setControl(); // rotation, translation, zoom, etc

    me.setDialogAjax();
};

iCn3DUI.prototype.getMmtfPromise = function(mmtfid) { let me = this;
    return new Promise(function(resolve, reject) {
        MMTF.fetch(
            mmtfid,
            // onLoad callback
            async function( mmtfData ){
                resolve(mmtfData);
            },
            // onError callback
            function( error ){
                //alert('This PDB structure is not found at RCSB...');
                //console.error( error )
                reject('error');
            }
        );
    });
};

iCn3DUI.prototype.getMmtfReducedPromise = function(mmtfid) { let me = this;
    return new Promise(function(resolve, reject) {
        MMTF.fetchReduced(
            mmtfid,
            // onLoad callback
            async function( mmtfData ){
                resolve(mmtfData);
            },
            // onError callback
            function( error ){
                //alert('This PDB structure is not found at RCSB...');
                //console.error( error )
                reject('error');
            }
        );
    });
};

iCn3DUI.prototype.getXMLHttpRqstPromise = function(url, dataType, responseType, mapType) { let me = this;
    return new Promise(function(resolve, reject) {
        let oReq = new XMLHttpRequest();
        oReq.open(dataType, url, true);
        oReq.responseType = responseType;
        
        oReq.onreadystatechange = function() {
            if (this.readyState == 4) {
               if(this.status == 200) {
                   let arrayBuffer = oReq.response;
                   resolve(arrayBuffer);
                }
                else {
                   if(mapType == '2fofc' || mapType == 'fofc') {
                       alert("Density server at EBI has no corresponding electron density map for this structure.");
                   }
                   else if(mapType == 'em') {
                       alert("Density server at EBI has no corresponding EM density map for this structure.");
                   }
                   else if(mapType == 'rcsbEdmaps') {
                       alert("RCSB server has no corresponding electron density map for this structure.");
                   }
                   else {
                       alert("The " + mapType + " file is unavailable...");
                   }

                   reject('error');
                }
            }
            else {
                me.icn3d.ParserUtilsCls.showLoading();
            }
        };

        oReq.send();
    });
};

iCn3DUI.prototype.getAjaxPromise = function(url, dataType, beforeSend, alertMess, logMess, complete, bNode) { let me = this;
    // if(!bNode || dataType != 'json') {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                dataType: dataType,
                cache: true,
                beforeSend: function() {
                    if(beforeSend) me.icn3d.ParserUtilsCls.showLoading();
                },
                complete: function() {
                    if(complete) me.icn3d.ParserUtilsCls.hideLoading();
                },
                success: function(data) {
                    resolve(data);
                },
                error : function() {
                    if(alertMess) alert(alertMess);
                    if(logMess) console.log(logMess);
                    
                    reject('error');
                }
            });
        });
    // }
    // else {
    //     return new Promise(async function(resolve, reject) {
    //         const response = await fetch(url);

    //         response.json().then(function(data) {
    //             resolve(data);
    //         }).catch(function(error) {
    //             reject('error');
    //         });
    //     });
    // }
};

iCn3DUI.prototype.getAjaxPostPromise = async function(url, data, beforeSend, alertMess, logMess, complete, dataType, bNode) { let me = this;
    dataType = (dataType) ? dataType : 'json';

    // if(!bNode || dataType != 'json') {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                data : data,
                dataType: dataType,
                cache: true,
                beforeSend: function() {
                    if(beforeSend) me.icn3d.ParserUtilsCls.showLoading();
                },
                complete: function() {
                    if(complete) me.icn3d.ParserUtilsCls.hideLoading();
                },
                success: function(data) {
                    resolve(data);
                },
                error : function() {
                    //if(alertMess) alert(alertMess);
                    if(!me.bNode && alertMess) console.log(alertMess);
                    if(!me.bNode && logMess) console.log(logMess);
                    
                    // reject('error');
                    // keep running the program
                    resolve('error');
                }
            });
        });
    // }
    // else {
    //     return new Promise(async function(resolve, reject) {
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json'
    //             },
    //             body: data
    //         });

    //         response.json().then(function(data) {
    //             resolve(data);
    //         }).catch(function(error) {
    //             reject('error');
    //         });
    //     });
    // }
};

iCn3DUI.prototype.setDialogAjax = function() { let me = this;
    // make dialog movable outside of the window
    // http://stackoverflow.com/questions/6696461/jquery-ui-dialog-drag-question
    if(!me.bNode && !$.ui.dialog.prototype._makeDraggableBase) {
        $.ui.dialog.prototype._makeDraggableBase = $.ui.dialog.prototype._makeDraggable;
        $.ui.dialog.prototype._makeDraggable = function() {
            this._makeDraggableBase();
            this.uiDialog.draggable("option", "containment", false);
        }
    }

    // https://gist.github.com/Artistan/c8d9d439c70117c8b9dd3e9bd8822d2c
    $.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
        // check for conditions and support for blob / arraybuffer response type
        if(window.FormData &&((options.dataType &&(options.dataType == 'binary')) ||(options.data &&((window.ArrayBuffer && options.data instanceof ArrayBuffer) ||(window.Blob && options.data instanceof Blob))))) {
            return {
                // create new XMLHttpRequest
                send: function(headers, callback) {
                    // setup all variables
                    let xhr = new XMLHttpRequest(),
                        url = options.url,
                        type = options.type,
                        async = options.async || true,
                        // blob or arraybuffer. Default is blob
                        responseType = options.responseType || "blob",
                        data = options.data || null;

                    xhr.addEventListener('load', function() {
                        let data = {}
                        data[options.dataType] = xhr.response;
                        // make callback and send data
                        callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);

                    // setup custom headers
                    for(let i in headers) {
                        xhr.setRequestHeader(i, headers[i]);
                    }

                    xhr.responseType = responseType;
                    xhr.send(data);
                },
                abort: function() {
                    jqXHR.abort();
                }
            }
        }
    });
};

/*
iCn3DUI.prototype.setIcn3dui = function(id) { let me = this;
    let idArray = id.split('_'); // id: div0_reload_pdbfile
    ic.pre = idArray[0] + "_";
    if(window.icn3duiHash !== undefined && window.icn3duiHash.hasOwnProperty(idArray[0])) { // for multiple 3D display
       me = window.icn3duiHash[idArray[0]];
    }
    return me;
};
*/


// required by npm
class printMsg {
  constructor() {
    console.log("This is a message from the icn3d package");
  }
}

//export {iCn3DUI, printMsg}

export {iCn3DUI, printMsg, HashUtilsCls, UtilsCls, ParasCls, MyEventCls, RmsdSuprCls, SubdivideCls, ConvertTypeCls, Html, iCn3D, ClickMenu, SetMenu, Dialog, SetDialog, Events, AlignSeq, SetHtml, Scene, Camera, Fog, Box, Brick, CurveStripArrow, Curve, Cylinder, Line, ReprSub, Sphere, Stick, Strand, Strip, Tube, CartoonNucl, Label, Axes, Glycan, Surface, ElectronMap, MarchingCube, ProteinSurface, ApplyCenter, ApplyClbonds, ApplyDisplay, ApplyOther, ApplySsbonds, ApplySymd, ApplyMap, ResidueLabels, Impostor, Instancing, Alternate, Draw, Contact, HBond, PiHalogen, Saltbridge, SetStyle, SetColor, SetOption, AnnoCddSite, AnnoContact, AnnoCrossLink, AnnoDomain, AnnoSnpClinVar, AnnoSsbond, AnnoTransMem, Domain3d, AddTrack, Annotation, ShowAnno, ShowSeq, HlSeq, HlUpdate, HlObjects, LineGraph, GetGraph, ShowInter, ViewInterPairs, DrawGraph, AlignParser, ChainalignParser, Dsn6Parser, MmcifParser, MmdbParser, Mol2Parser, OpmParser, PdbParser, SdfParser, XyzParser, RealignParser, DensityCifParser, ParserUtils, LoadAtomData, Vastplus, SetSeqAlign, LoadPDB, LoadCIF, ApplyCommand, DefinedSets, LoadScript, SelectByCommand, Selection, Resid2spec, FirstAtomObj, Delphi, Dssp, Refnum, Scap, Symd, AlignSW, Analysis, Diagram2d, ResizeCanvas, Transform, SaveFile, ShareLink, ThreeDPrint, Export3D, Ray, Control, Picking, VRButton, ARButton}
