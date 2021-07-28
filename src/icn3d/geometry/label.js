/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

//import * as THREE from 'three';

import {UtilsCls} from '../../utils/utilsCls.js';

class TextSprite {
    constructor(icn3d) {
        this.icn3d = icn3d;
    }

    // modified from 3Dmol (http://3dmol.csb.pitt.edu/)
    // new: http://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
    // old: http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
    makeTextSprite( message, parameters ) { let ic = this.icn3d, me = ic.icn3dui;
        if(ic.icn3dui.bNode) return;

        if ( parameters === undefined ) parameters = {};
        let fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        let fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        let factor = parameters.hasOwnProperty("factor") ? parameters["factor"] : 1;

        let a = parameters.hasOwnProperty("alpha") ? parameters["alpha"] : 1.0;

        let bBkgd = true;
        let bSchematic = false;
        if(parameters.hasOwnProperty("bSchematic") &&  parameters["bSchematic"]) {
            bSchematic = true;

            fontsize = 40;
        }

        let backgroundColor, borderColor, borderThickness;
        if(parameters.hasOwnProperty("backgroundColor") &&  parameters["backgroundColor"] !== undefined) {
            backgroundColor = me.utilsCls.hexToRgb(parameters["backgroundColor"], a);

            borderColor = parameters.hasOwnProperty("borderColor") ? me.utilsCls.hexToRgb(parameters["borderColor"], a) : { r:0, g:0, b:0, a:1.0 };
            borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        }
        else {
            bBkgd = false;
            backgroundColor = undefined;
            borderColor = undefined;
            borderThickness = 0;
        }

        let textAlpha = 1.0;
        let textColor = parameters.hasOwnProperty("textColor") &&  parameters["textColor"] !== undefined ? me.utilsCls.hexToRgb(parameters["textColor"], textAlpha) : { r:255, g:255, b:0, a:1.0 };

        let canvas = document.createElement('canvas');

        let context = canvas.getContext('2d');

        context.font = "Bold " + fontsize + "px " + fontface;

        let metrics = context.measureText( message );

        let textWidth = metrics.width;

        let width = textWidth + 2*borderThickness;
        let height = fontsize + 2*borderThickness;

        if(bSchematic) {
            if(width > height) {
                height = width;
            }
            else {
                width = height;
            }
        }

        let expandWidthFactor = 0.8 * textWidth / height;

        canvas.width = width;
        canvas.height = height;

        context.clearRect(0, 0, width, height);

        //var radius = context.measureText( "M" ).width;

        if(bBkgd) {
            // background color
            context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

            context.lineWidth = borderThickness;

            if(bSchematic) {
                let r = width * 0.35;
                this.circle(context, 0, 0, width, height, r);
            }
            else {
                //var r = (message.length <= textLengthThreshold) ? height * 0.5 : 0;
                //var r = height * 0.8;
                let r = 0;
                this.roundRect(context, 0, 0, width, height, r);
            }
        }

        // need to redefine again
        context.font = "Bold " + fontsize + "px " + fontface;

        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.strokeStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";

        context.fillText( message, width * 0.5, height * 0.5);

        // canvas contents will be used for a texture
        let texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;

        let frontOfTarget = true;
        //var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        let spriteMaterial = new THREE.SpriteMaterial( {
            map: texture,
            //useScreenCoordinates: false,
            depthTest: !frontOfTarget,
            depthWrite: !frontOfTarget
        } );

        //https://stackoverflow.com/questions/29421702/threejs-texture
        spriteMaterial.map.minFilter = THREE.LinearFilter;

        let sprite = new THREE.Sprite( spriteMaterial );

        if(bSchematic) {
            //sprite.scale.set(factor, factor, 1.0);
            sprite.scale.set(0.3*factor, 0.3*factor, 1.0);
        }
        else {
            sprite.scale.set(expandWidthFactor * factor, factor, 1.0);
        }

        return sprite;
    }

    // function for drawing rounded rectangles
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    circle(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.arc(x+w/2, y+h/2, r, 0, 2*Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Label {
    constructor(icn3d) {
        this.icn3d = icn3d;

        this.textSpriteCls = new TextSprite(icn3d);
    }

    // modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
    //Create labels for a list of "labels", each of which has the properties 'position',
    //'text', 'size', 'color', and 'background'.
    createLabelRepresentation(labels) { let ic = this.icn3d, me = ic.icn3dui;
        let oriFactor = 3 * ic.oriMaxD / 100 * ic.labelScale;

        for(let name in labels) {
            let labelArray = (labels[name] !== undefined) ? labels[name] : [];

            for (let i = 0, il = labelArray.length; i < il; ++i) {
                let label = labelArray[i];
                // make sure fontsize is a number

                if(label.size == 0) label.size = undefined;
                if(label.color == 0) label.color = undefined;
                if(label.background == 0) label.background = undefined;

                let labelsize = (label.size !== undefined) ? label.size : ic.LABELSIZE;
                let labelcolor = (label.color !== undefined) ? label.color : '#ffff00';
                let labelbackground = (label.background !== undefined) ? label.background : '#cccccc';
                let labelalpha = (label.alpha !== undefined) ? label.alpha : 1.0;

                // if label.background is undefined, no background will be drawn
                labelbackground = label.background;

                if(labelcolor !== undefined && labelbackground !== undefined && labelcolor.toLowerCase() === labelbackground.toLowerCase()) {
                    labelcolor = "#888888";
                }

                let bb;
                if(label.bSchematic !== undefined && label.bSchematic) {

                    bb = this.textSpriteCls.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1, factor: oriFactor});
                }
                else {
                    if(label.text.length === 1) {
                        bb = this.textSpriteCls.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1, factor: oriFactor});
                    }
                    else {
                        let factor = (label.factor) ? oriFactor * label.factor : oriFactor;

                        bb = this.textSpriteCls.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 0, factor: factor});
                    }
                }

                bb.position.set(label.position.x, label.position.y, label.position.z);
                ic.mdl.add(bb);
                // do not add labels to objects for pk
            }
        }
    }

    hideLabels() { let ic = this.icn3d, me = ic.icn3dui;
        // remove previous labels
        if(ic.mdl !== undefined) {
            for(let i = 0, il = ic.mdl.children.length; i < il; ++i) {
                 let mesh = ic.mdl.children[i];
                 if(mesh !== undefined && mesh.type === 'Sprite') {
                     ic.mdl.remove(mesh); // somehow didn't work
                 }
            }
        }
    }

}

export {TextSprite, Label}
