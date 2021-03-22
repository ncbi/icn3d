/**
 * @author Jiyao Wang <wangjiy@ncbi.nlm.nih.gov> / https://github.com/ncbi/icn3d
 */

// modified from 3Dmol (http://3dmol.csb.pitt.edu/)
// new: http://stackoverflow.com/questions/23514274/three-js-2d-text-sprite-labels
// old: http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
iCn3D.prototype.makeTextSprite = function ( message, parameters ) { var me = this, ic = me.icn3d; "use strict";

    if ( parameters === undefined ) parameters = {};
    var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;

    var a = parameters.hasOwnProperty("alpha") ? parameters["alpha"] : 1.0;

    var bBkgd = true;
    var bSchematic = false;
    if(parameters.hasOwnProperty("bSchematic") &&  parameters["bSchematic"]) {
        bSchematic = true;

        fontsize = 40;
    }

    var backgroundColor, borderColor, borderThickness;
    if(parameters.hasOwnProperty("backgroundColor") &&  parameters["backgroundColor"] !== undefined) {
        backgroundColor = this.hexToRgb(parameters["backgroundColor"], a);

        borderColor = parameters.hasOwnProperty("borderColor") ? this.hexToRgb(parameters["borderColor"], a) : { r:0, g:0, b:0, a:1.0 };
        borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
    }
    else {
        bBkgd = false;
        backgroundColor = undefined;
        borderColor = undefined;
        borderThickness = 0;
    }

    var textAlpha = 1.0;
    var textColor = parameters.hasOwnProperty("textColor") &&  parameters["textColor"] !== undefined ? this.hexToRgb(parameters["textColor"], textAlpha) : { r:255, g:255, b:0, a:1.0 };

    var canvas = document.createElement('canvas');

    var context = canvas.getContext('2d');

    context.font = "Bold " + fontsize + "px " + fontface;

    var metrics = context.measureText( message );

    var textWidth = metrics.width;

    var width = textWidth + 2*borderThickness;
    var height = fontsize + 2*borderThickness;

    if(bSchematic) {
        if(width > height) {
            height = width;
        }
        else {
            width = height;
        }
    }

    // var factor = (bSchematic) ? 3 * this.oriMaxD / 100 : 3 * this.oriMaxD / 100;
    // var factor = (bSchematic) ? 3 * this.maxD / 100 : 3 * this.maxD / 100;
    var factor = 3 * this.oriMaxD / 100 * this.labelScale;

    var expandWidthFactor = 0.8 * textWidth / height;

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
            var r = width * 0.35;
            this.circle(context, 0, 0, width, height, r);
        }
        else {
            //var r = (message.length <= textLengthThreshold) ? height * 0.5 : 0;
            //var r = height * 0.8;
            var r = 0;
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
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var frontOfTarget = true;
    //var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
    var spriteMaterial = new THREE.SpriteMaterial( {
        map: texture,
        //useScreenCoordinates: false,
        depthTest: !frontOfTarget,
        depthWrite: !frontOfTarget
    } );

    //https://stackoverflow.com/questions/29421702/threejs-texture
    spriteMaterial.map.minFilter = THREE.LinearFilter;

    var sprite = new THREE.Sprite( spriteMaterial );

    if(bSchematic) {
        sprite.scale.set(factor, factor, 1.0);
    }
    else {
        sprite.scale.set(expandWidthFactor * factor, factor, 1.0);
    }

    return sprite;
};

// function for drawing rounded rectangles
iCn3D.prototype.roundRect = function (ctx, x, y, w, h, r) { var me = this, ic = me.icn3d; "use strict";
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
};

iCn3D.prototype.circle = function (ctx, x, y, w, h, r) { var me = this, ic = me.icn3d; "use strict";
    ctx.beginPath();
    ctx.arc(x+w/2, y+h/2, r, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

// modified from iview (http://istar.cse.cuhk.edu.hk/iview/)
iCn3D.prototype.createLabelRepresentation = function (labels) { var me = this, ic = me.icn3d; "use strict";
//    var tmpMaxD = this.maxD;

    for(var name in labels) {
        var labelArray = (labels[name] !== undefined) ? labels[name] : [];

        for (var i = 0, il = labelArray.length; i < il; ++i) {
            var label = labelArray[i];
            // make sure fontsize is a number

            if(label.size == 0) label.size = undefined;
            if(label.color == 0) label.color = undefined;
            if(label.background == 0) label.background = undefined;

            var labelsize = (label.size !== undefined) ? label.size : this.LABELSIZE;
            var labelcolor = (label.color !== undefined) ? label.color : '#ffff00';
            var labelbackground = (label.background !== undefined) ? label.background : '#cccccc';
            var labelalpha = (label.alpha !== undefined) ? label.alpha : 1.0;
            // if label.background is undefined, no background will be drawn
            labelbackground = label.background;

            if(labelcolor !== undefined && labelbackground !== undefined && labelcolor.toLowerCase() === labelbackground.toLowerCase()) {
                labelcolor = "#888888";
            }

            var bb;
            if(label.bSchematic !== undefined && label.bSchematic) {

                bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1});
            }
            else {
                if(label.text.length === 1) {
                    bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 1});
                }
                else {
                    bb = this.makeTextSprite(label.text, {fontsize: parseInt(labelsize), textColor: labelcolor, borderColor: labelbackground, backgroundColor: labelbackground, alpha: labelalpha, bSchematic: 0});
                }
            }

            bb.position.set(label.position.x, label.position.y, label.position.z);
            this.mdl.add(bb);
            // do not add labels to objects for pk
        }
    }
};
