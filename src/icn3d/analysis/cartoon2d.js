/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

import {HashUtilsCls} from '../../utils/hashUtilsCls.js';
import {UtilsCls} from '../../utils/utilsCls.js';

import {Html} from '../../html/html.js';

import {FirstAtomObj} from '../selection/firstAtomObj.js';
import {Selection} from '../selection/selection.js';
import {HlUpdate} from '../highlight/hlUpdate.js';
import {Annotation} from '../annotations/annotation.js';
import {Resid2spec} from '../selection/resid2spec.js';
import {HlObjects} from '../highlight/hlObjects.js';

class Cartoon2d {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    draw2Dcartoon(type) { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        ic.icn3dui.htmlCls.clickMenuCls.setLogCmd("cartoon 2d " + type, true);
        ic.bGraph = false; // differentiate from force-directed graph for interactions

        if(type == 'domain' && !ic.chainid2pssmid) {
            $.when(thisClass.getNodesLinksForSetCartoon(type)).then(function() {
               ic.graphStr = thisClass.getCartoonData(type, ic.node_link);
               ic.viewInterPairsCls.drawGraphWrapper(ic.graphStr, ic.deferredCartoon2d, true);
            });
        }
        else {
            this.getNodesLinksForSetCartoonBase(type);
            ic.graphStr = thisClass.getCartoonData(type, ic.node_link);
            ic.viewInterPairsCls.drawGraphWrapper(ic.graphStr, ic.deferredCartoon2d, true);
        }
    }

    getCartoonData(type, node_link) { let ic = this.icn3d, me = ic.icn3dui;
       // get the nodes and links data
       let nodeArray = [], linkArray = [];
       let nodeStr, linkStr;

       nodeArray = node_link.node;

       // removed duplicated nodes
       let nodeJsonArray = [];
       let checkedNodeidHash = {}
       let cnt = 0;
       for(let i = 0, il = nodeArray.length; i < il; ++i) {
           let node = nodeArray[i];
           let nodeJson = JSON.parse(node);
           if(!checkedNodeidHash.hasOwnProperty(nodeJson.id)) {
               nodeJsonArray.push(nodeJson);
               checkedNodeidHash[nodeJson.id] = cnt;
               ++cnt;
           }
       }
       let nodeStrArray = [];
       for(let i = 0, il = nodeJsonArray.length; i < il; ++i) {
           let nodeJson = nodeJsonArray[i];
           nodeStrArray.push(JSON.stringify(nodeJson));
       }
       nodeStr = nodeStrArray.join(', ');
       // linkStr
       linkArray = node_link.link;
       linkStr = linkArray.join(', ');

       let selectedAtoms = ic.hAtoms;
       let chemicalNodeStr = '';
       let hBondLinkStr = '', ionicLinkStr = '', halogenpiLinkStr = '', contactLinkStr = '',
         disulfideLinkStr = '', crossLinkStr = '';

//       contactLinkStr += ic.getGraphCls.getContactLinksForSet(ic.hAtoms, 'chain', true);

       let resStr = '{"nodes": [' + nodeStr + chemicalNodeStr + '], "links": [';
       resStr += linkStr + disulfideLinkStr + crossLinkStr + contactLinkStr + hBondLinkStr + ionicLinkStr + halogenpiLinkStr;

       let level = (node_link.level) ? node_link.level : '';
       resStr += '], "level": "' + level + '"}';
       return resStr;
    }

    getNodesLinksForSetCartoon(type) { let ic = this.icn3d, me = ic.icn3dui;
      let thisClass = this;

      // chain functions together
      ic.deferredCartoon2d = $.Deferred(function() {
          thisClass.getNodesLinksForSetCartoonBase(type);
      });

      return ic.deferredCartoon2d.promise();
    }

    getNodesLinksForSetCartoonBase(type) { let ic = this.icn3d, me = ic.icn3dui;
       let thisClass = this;

       let nodeArray = [], linkArray = [];
       let cnt = 0;
       let thickness = ic.icn3dui.htmlCls.defaultValue; // 1

       let prevChain = '', prevResName = '', prevResi = 0, prevAtom, lastChain = '';
       let x, y, z, length = 0, prevX, prevY, prevZ;
       let bBegin = false, bEnd = true;
       let resName, residLabel;

       let setName = 'a';

       if(type == 'chain') {
           let chainidHash = {};
           for(let i in ic.hAtoms) {
               let atom = ic.atoms[i];
               if(atom.chain == 'DUM') continue;

               let chainid = atom.structure + '_' + atom.chain;

               if(ic.proteins.hasOwnProperty(i)) {
                   if(!chainidHash.hasOwnProperty(chainid)) {
                       chainidHash[chainid] = {};
                   }
                   chainidHash[chainid][atom.serial] = atom;
               }
           }

           for(let chainid in chainidHash) {
               let extent = ic.contactCls.getExtent(chainidHash[chainid]);

               let radiusSq = (extent[1][0] - extent[0][0]) * (extent[1][0] - extent[0][0]) + (extent[1][1] - extent[0][1]) * (extent[1][1] - extent[0][1]) + (extent[1][2] - extent[0][2]) * (extent[1][2] - extent[0][2]);
               let radius = Math.sqrt(radiusSq);

               let serial = Object.keys(chainidHash[chainid])[0];
               let atom = ic.atoms[serial];

               residLabel = chainid;

               nodeArray.push('{"id": "' + chainid + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + extent[2][0].toFixed(0)
                   + ', "y": ' + extent[2][1].toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
           }
       }
       else if(type == 'domain') {
           if(!ic.chainid2pssmid) { // mmtf data do NOT have the missing residues
                $.when(ic.loadScriptCls.applyCommandAnnotationsAndCddSite('view annotations')).then(function() {
                   return thisClass.getNodesLinksForDomains(ic.chainid2pssmid);
                });
           }
           else {
                return this.getNodesLinksForDomains(ic.chainid2pssmid);
           }
       }
       else if(type == 'secondary') {
           ic.resi2resirange = {};
           let resiArray = [], tmpResName;

           for(let i in ic.hAtoms) {
               let atom = ic.atoms[i];
               if(atom.chain == 'DUM') continue;

               if((atom.ssbegin || atom.ssend) && atom.name == "CA" && atom.elem == "C") {
                   let resid = atom.structure + '_' + atom.chain + '_' + atom.resi;

                   //if((prevChain === '' || prevChain == atom.chain) && bEnd && atom.ssbegin) {
                   if(bEnd && atom.ssbegin) {
                       prevX = atom.coord.x;
                       prevY = atom.coord.y;
                       prevZ = atom.coord.z;
                       bBegin = true;
                       bEnd = false;

                       prevAtom = atom;

                       resName = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi
                       // add 1_1_ to match other conventionssuch as seq_div0_1KQ2_A_50
                       residLabel = '1_1_' + resid;

                       lastChain = atom.chain;
                   }

                   if(bBegin) {
                       tmpResName = me.utilsCls.residueName2Abbr(atom.resn) + atom.resi
                       tmpResName += '.' + atom.chain;
                       if(Object.keys(ic.structures).length > 1) tmpResName += '.' + atom.structure;

                       resiArray.push(tmpResName);
                   }

                   if(lastChain == atom.chain && bBegin && atom.ssend) {
                       x = 0.5 * (prevX + atom.coord.x);
                       y = 0.5 * (prevY + atom.coord.y);
                       z = 0.5 * (prevZ + atom.coord.z);

                       length = atom.coord.distanceTo(prevAtom.coord);

                       bBegin = false;
                       bEnd = true;

                       resName += '-' + atom.resi;
                       residLabel += '-' + atom.resi;

                       resName += '.' + atom.chain;
                       if(Object.keys(ic.structures).length > 1) resName += '.' + atom.structure;

                       for(let j = 0, jl = resiArray.length; j < jl; ++j) {
                           tmpResName = resiArray[j];
                           ic.resi2resirange[tmpResName] = resName;
                       }
                       resiArray = [];

                       if(cnt > 0 && prevChain == atom.chain) {
                           linkArray.push('{"source": "' + prevResName + '", "target": "' + resName
                               + '", "v": ' + thickness + ', "c": "' + prevAtom.color.getHexString().toUpperCase() + '"}');
                       }
                       nodeArray.push('{"id": "' + resName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + x.toFixed(0)
                           + ', "y": ' + y.toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');

                       prevChain = atom.chain;
                       prevResName = resName;
                       ++cnt;
                   }
               }
           } //end for
       }

       ic.node_link = {"node": nodeArray, "link":linkArray};
    }

    getNodesLinksForDomains(chainid2pssmid) { let ic = this.icn3d, me = ic.icn3dui;
       let nodeArray = [], linkArray = [];
       let cnt = 0;
       let thickness = ic.icn3dui.htmlCls.defaultValue; // 1

       let prevChain = '', prevResName = '', prevResi = 0, prevAtom, lastChain = '';
       let x, y, z, length = 0, prevX, prevY, prevZ;
       let resName, residLabel;

       let setName = 'a';

       ic.resi2resirange = {};
       let resiArray = [], tmpResName;

       // find the chainids
       let chainidHash = {};
       for(let i in ic.hAtoms) {
           let atom = ic.atoms[i];
           if(atom.chain == 'DUM') continue;

           chainidHash[atom.structure + '_' + atom.chain] = 1;
       }

       // show domains for each chain
       for(let chainid in chainidHash) {
           if(!chainid2pssmid.hasOwnProperty(chainid)) continue;

           let pssmid2name = chainid2pssmid[chainid].pssmid2name;
           let pssmid2fromArray = chainid2pssmid[chainid].pssmid2fromArray;
           let pssmid2toArray = chainid2pssmid[chainid].pssmid2toArray;

           // sort the domains according to the starting residue number
           let pssmid2start = {};
           for(let pssmid in pssmid2name) {
               let fromArray = pssmid2fromArray[pssmid];
               pssmid2start[pssmid] = fromArray[0];
           }

           var pssmidArray = Object.keys(pssmid2start);
           pssmidArray.sort(function(a, b) {
               return pssmid2start[a] - pssmid2start[b]
           });

           let bNewChain = true;
           let prevDomainName, prevAtom;
           //for(let pssmid in pssmid2name) {
           for(let i = 0, il = pssmidArray.length; i < il; ++i) {
               let pssmid = pssmidArray[i];

               let domainName = pssmid2name[pssmid];
               domainName += '.' + chainid.substr(chainid.indexOf('_') + 1);
               if(Object.keys(ic.structures).length > 1) domainName += '.' + chainid.substr(0, chainid.indexOf('_'));

               let fromArray = pssmid2fromArray[pssmid];
               let toArray = pssmid2toArray[pssmid];

               ic.hAtoms = {};
               for(let j = 0, jl = fromArray.length; j < jl; ++j) {
                   let resiStart = fromArray[j] + 1;
                   let resiEnd = toArray[j] + 1;

                   for(let k = resiStart; k <= resiEnd; ++k) {
                       ic.hAtoms = me.hashUtilsCls.unionHash(ic.hAtoms, ic.residues[chainid + '_' + k]);
                   }
               }

               if(Object.keys(ic.hAtoms).length == 0) continue;

               //let extent = ic.contactCls.getExtent(atomSet);

               //let radiusSq = (extent[1][0] - extent[0][0]) * (extent[1][0] - extent[0][0]) + (extent[1][1] - extent[0][1]) * (extent[1][1] - extent[0][1]) + (extent[1][2] - extent[0][2]) * (extent[1][2] - extent[0][2]);
               //let radius = Math.sqrt(radiusSq);

               let center_x_y_z = ic.axesCls.setPc1Axes();
               let center = center_x_y_z[0];
               let rx = center_x_y_z[1].distanceTo(center_x_y_z[0]);
               let ry = center_x_y_z[2].distanceTo(center_x_y_z[0]);
               let angle = new THREE.Vector2(center_x_y_z[1].x - center_x_y_z[0].x, center_x_y_z[1].y - center_x_y_z[0].y).angle() * 180 / 3.1416;
               if(angle > 180) angle -= 180;

               let serial = Object.keys(ic.hAtoms)[0];
               let atom = ic.atoms[serial];

               residLabel = chainid;
               let shapeid = 0;

               if(prevDomainName !== undefined) {
                   linkArray.push('{"source": "' + prevDomainName + '", "target": "' + domainName
                       + '", "v": ' + thickness + ', "c": "' + prevAtom.color.getHexString().toUpperCase() + '"}');
               }

               //nodeArray.push('{"id": "' + domainName + '", "r": "' + residLabel + '", "s": "' + setName + '", "x": ' + extent[2][0].toFixed(0)
               //    + ', "y": ' + extent[2][1].toFixed(0) + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');
               nodeArray.push('{"id": "' + domainName + '", "r": "' + residLabel + '", "s": "' + setName
                   + '", "x": ' + center.x.toFixed(0) + ', "y": ' + center.y.toFixed(0)
                   + ', "rx": ' + rx.toFixed(0) + ', "ry": ' + ry.toFixed(0)
                   + ', "ang": ' + angle.toFixed(0) + ', "shape": ' + shapeid
                   + ', "c": "' + atom.color.getHexString().toUpperCase() + '"}');

               prevDomainName = domainName;
               prevAtom = atom;
           }
       }

       ic.node_link = {"node": nodeArray, "link":linkArray, "level": "domain"};

       if(ic.deferredCartoon2d !== undefined) ic.deferredCartoon2d.resolve();
       //return {"node": nodeArray, "link":linkArray};
    }

    click2Dcartoon() { let ic = this.icn3d, me = ic.icn3dui;
        let thisClass = this;

        me.myEventCls.onIds("#" + me.pre + "2ddgm_chain", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('chain');
        });

        me.myEventCls.onIds("#" + me.pre + "2ddgm_domain", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('domain');
        });

        me.myEventCls.onIds("#" + me.pre + "2ddgm_secondary", "click", function(e) { let ic = me.icn3d;
           e.preventDefault();
           //if(!me.cfg.notebook) dialog.dialog( "close" );
           ic.cartoon2dCls.draw2Dcartoon('secondary');
        });

        //$(document).on("click", "#" + ic.pre + "dl_2ddgm .icn3d-node", function(e) { let ic = thisClass.icn3d;
        //    e.stopImmediatePropagation();
        //});
    }
}

export {Cartoon2d}
